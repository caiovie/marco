import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { classifyText } from "@/lib/classify";

export const maxDuration = 30;

const bodySchema = z.object({
  source: z.string().min(1).max(40),
  text: z.string().min(1).max(4000),
  kind: z.enum(["task", "milestone", "note"]).optional(),
  project_slug: z.string().max(60).optional(),
});

// #tag no texto força o projeto (ex.: "#clt revisar contrato")
const TAG_TO_SLUG: Record<string, string> = {
  ae: "ae",
  kairos: "kairos",
  esca7: "esca7",
  clt: "busca-clt",
};

function verifySignature(rawBody: string, header: string | null, secret: string) {
  if (!header) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(header.trim().toLowerCase());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "ingest_unconfigured" }, { status: 503 });
  }

  const rawBody = await request.text();
  if (!verifySignature(rawBody, request.headers.get("x-marco-signature"), secret)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let parsed;
  try {
    parsed = bodySchema.safeParse(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  // Extrai #tag de projeto e limpa o texto
  let text = parsed.data.text.trim();
  let forcedSlug: string | null = null;
  const tagMatch = text.match(/(^|\s)#(ae|kairos|esca7|clt)\b/i);
  if (tagMatch) {
    forcedSlug = TAG_TO_SLUG[tagMatch[2].toLowerCase()];
    text = text.replace(tagMatch[0], " ").replace(/\s+/g, " ").trim();
  }
  if (!text) {
    return NextResponse.json({ error: "empty_text" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: projects, error: projError } = await supabase.rpc(
    "get_ingest_projects",
    { p_secret: secret }
  );
  if (projError) {
    return NextResponse.json({ error: "projects_failed" }, { status: 502 });
  }

  const projectList = (projects ?? []) as { slug: string; name: string }[];
  const validSlugs = projectList.map((p) => p.slug);
  // Campos explícitos do chamador têm prioridade sobre a #tag e sobre a IA
  if (!forcedSlug && parsed.data.project_slug && validSlugs.includes(parsed.data.project_slug)) {
    forcedSlug = parsed.data.project_slug;
  }

  let suggestion = await classifyText(text, projectList);
  if (forcedSlug || parsed.data.kind) {
    suggestion = {
      project_slug: forcedSlug ?? suggestion?.project_slug ?? null,
      kind: parsed.data.kind ?? suggestion?.kind ?? "task",
      title: suggestion?.title ?? text,
    };
  }

  const { data: id, error } = await supabase.rpc("ingest_inbox_item", {
    p_secret: secret,
    p_raw_text: text,
    p_suggestion: suggestion,
  });
  if (error) {
    return NextResponse.json({ error: "ingest_failed" }, { status: 502 });
  }

  return NextResponse.json({ id, suggestion, source: parsed.data.source });
}
