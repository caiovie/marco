"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { projectInputSchema } from "@/lib/schemas";
import type { ActionResult } from "@/lib/types";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createProject(name: string): Promise<ActionResult> {
  const parsed = projectInputSchema.safeParse({ name });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("projects").insert({
    name: parsed.data.name,
    slug: slugify(parsed.data.name),
    color_key: "neutral",
  });
  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "Já existe um projeto com esse nome" : "Erro ao criar projeto",
    };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function renameProject(id: string, name: string): Promise<ActionResult> {
  const parsed = projectInputSchema.safeParse({ name });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ name: parsed.data.name })
    .eq("id", id);
  if (error) return { ok: false, error: "Erro ao renomear projeto" };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function archiveProject(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ archived: true })
    .eq("id", id);
  if (error) return { ok: false, error: "Erro ao arquivar projeto" };
  revalidatePath("/", "layout");
  return { ok: true };
}
