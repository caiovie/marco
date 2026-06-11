import { NextResponse } from "next/server";
import { z } from "zod";
import { classifyText } from "@/lib/classify";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({ id: z.string().uuid() });

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL_LIGHT) {
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

  const suggestion = await classifyText(item.raw_text, projects ?? []);
  if (!suggestion) {
    return NextResponse.json({ error: "classification_failed" }, { status: 502 });
  }

  await supabase
    .from("inbox_items")
    .update({ suggestion })
    .eq("id", item.id);

  return NextResponse.json({ suggestion });
}
