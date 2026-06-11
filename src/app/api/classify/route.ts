import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { classifySuggestionSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({ id: z.string().uuid() });

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const [{ data: item }, { data: projects }] = await Promise.all([
    supabase
      .from("inbox_items")
      .select("id, raw_text, status")
      .eq("id", parsed.data.id)
      .single(),
    supabase
      .from("projects")
      .select("slug, name")
      .eq("archived", false),
  ]);
  if (!item || item.status !== "pending") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const slugs = (projects ?? []).map((p) => p.slug);
  const projectList = (projects ?? [])
    .map((p) => `- ${p.slug} (${p.name})`)
    .join("\n");

  const anthropic = new Anthropic({ apiKey, timeout: 10_000, maxRetries: 1 });

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      tools: [
        {
          name: "classify_item",
          description:
            "Classifica um item capturado no inbox de um sistema pessoal de organização.",
          input_schema: {
            type: "object",
            properties: {
              project_slug: {
                type: ["string", "null"],
                enum: [...slugs, null],
                description: "Slug do projeto relacionado, ou null se nenhum.",
              },
              kind: {
                type: "string",
                enum: ["task", "milestone", "note"],
                description:
                  "task = algo a fazer; milestone = algo já feito/conquistado; note = anotação/ideia.",
              },
              title: {
                type: "string",
                description:
                  "Título curto e limpo em pt-BR (sentence case, sem ponto final).",
              },
            },
            required: ["project_slug", "kind", "title"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "classify_item" },
      messages: [
        {
          role: "user",
          content: `Projetos do usuário:\n${projectList}\n\nItem capturado no inbox:\n"""${item.raw_text}"""\n\nClassifique o item.`,
        },
      ],
    });

    const toolUse = message.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json({ error: "no_classification" }, { status: 502 });
    }

    const suggestion = classifySuggestionSchema.safeParse(toolUse.input);
    if (!suggestion.success) {
      return NextResponse.json({ error: "invalid_classification" }, { status: 502 });
    }

    // Garante que o slug sugerido existe — senão, sem projeto.
    const safe = {
      ...suggestion.data,
      project_slug:
        suggestion.data.project_slug && slugs.includes(suggestion.data.project_slug)
          ? suggestion.data.project_slug
          : null,
    };

    await supabase
      .from("inbox_items")
      .update({ suggestion: safe })
      .eq("id", item.id);

    return NextResponse.json({ suggestion: safe });
  } catch {
    return NextResponse.json({ error: "classification_failed" }, { status: 502 });
  }
}
