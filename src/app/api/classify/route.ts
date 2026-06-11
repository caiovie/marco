import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { classifySuggestionSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({ id: z.string().uuid() });

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL_LIGHT;
  if (!apiKey || !model) {
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

  const openai = new OpenAI({ apiKey, timeout: 15_000, maxRetries: 1 });

  try {
    const completion = await openai.chat.completions.create({
      model,
      max_completion_tokens: 2000,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "classify_item",
          strict: true,
          schema: {
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
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: "system",
          content:
            "Você classifica itens capturados no inbox de um sistema pessoal de organização de atividades.",
        },
        {
          role: "user",
          content: `Projetos do usuário:\n${projectList}\n\nItem capturado no inbox:\n"""${item.raw_text}"""\n\nClassifique o item.`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "no_classification" }, { status: 502 });
    }

    const suggestion = classifySuggestionSchema.safeParse(JSON.parse(content));
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
