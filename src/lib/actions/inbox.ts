"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { captureSchema } from "@/lib/schemas";
import type { ActionResult, SuggestionKind } from "@/lib/types";

export async function captureItem(
  rawText: string
): Promise<ActionResult | { ok: true; id: string }> {
  const parsed = captureSchema.safeParse({ raw_text: rawText });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inbox_items")
    .insert({ raw_text: parsed.data.raw_text })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: "Erro ao capturar" };

  revalidatePath("/inbox");
  return { ok: true, id: data.id };
}

export async function convertItem(
  id: string,
  conversion: {
    kind: SuggestionKind;
    title: string;
    project_id: string | null;
  }
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: item, error: fetchError } = await supabase
    .from("inbox_items")
    .select("id, status")
    .eq("id", id)
    .single();
  if (fetchError || !item) return { ok: false, error: "Item não encontrado" };
  if (item.status !== "pending") return { ok: false, error: "Item já processado" };

  const title = conversion.title.trim();
  if (!title) return { ok: false, error: "Título obrigatório" };

  if (conversion.kind === "task") {
    const { error } = await supabase.from("tasks").insert({
      title,
      project_id: conversion.project_id,
    });
    if (error) return { ok: false, error: "Erro ao criar tarefa" };
  } else {
    // 'milestone' e 'note' viram marco — nota é um marco com source inbox.
    const { error } = await supabase.from("milestones").insert({
      title,
      project_id: conversion.project_id,
      source: "inbox",
    });
    if (error) return { ok: false, error: "Erro ao registrar marco" };
  }

  await supabase.from("inbox_items").update({ status: "converted" }).eq("id", id);

  revalidatePath("/inbox");
  revalidatePath("/tasks");
  revalidatePath("/feed");
  return { ok: true };
}

export async function discardItem(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("inbox_items")
    .update({ status: "discarded" })
    .eq("id", id);
  if (error) return { ok: false, error: "Erro ao descartar" };
  revalidatePath("/inbox");
  return { ok: true };
}
