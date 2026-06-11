import OpenAI from "openai";
import { classifySuggestionSchema } from "@/lib/schemas";
import type { ClassifySuggestion } from "@/lib/types";

/**
 * Classifica um texto capturado em { project_slug, kind, title } via
 * OPENAI_MODEL_LIGHT. Retorna null se a IA estiver indisponível ou falhar —
 * o item segue para classificação manual.
 */
export async function classifyText(
  rawText: string,
  projects: { slug: string; name: string }[]
): Promise<ClassifySuggestion | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL_LIGHT;
  if (!apiKey || !model) return null;

  const slugs = projects.map((p) => p.slug);
  const projectList = projects.map((p) => `- ${p.slug} (${p.name})`).join("\n");
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
          content: `Projetos do usuário:\n${projectList}\n\nItem capturado no inbox:\n"""${rawText}"""\n\nClassifique o item.`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    const suggestion = classifySuggestionSchema.safeParse(JSON.parse(content));
    if (!suggestion.success) return null;

    return {
      ...suggestion.data,
      project_slug:
        suggestion.data.project_slug && slugs.includes(suggestion.data.project_slug)
          ? suggestion.data.project_slug
          : null,
    };
  } catch {
    return null;
  }
}
