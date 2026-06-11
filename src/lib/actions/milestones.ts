"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { milestoneInputSchema } from "@/lib/schemas";
import type { ActionResult } from "@/lib/types";

export async function createMilestone(input: {
  title: string;
  project_id: string | null;
  note?: string;
}): Promise<ActionResult> {
  const parsed = milestoneInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("milestones").insert({
    title: parsed.data.title,
    project_id: parsed.data.project_id,
    note: parsed.data.note ?? null,
    source: "manual",
  });
  if (error) return { ok: false, error: "Erro ao registrar marco" };
  revalidatePath("/feed");
  return { ok: true };
}
