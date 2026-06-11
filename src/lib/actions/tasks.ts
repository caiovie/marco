"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { taskInputSchema } from "@/lib/schemas";
import type { ActionResult, TaskStatus } from "@/lib/types";

export async function createTask(input: {
  title: string;
  project_id: string | null;
}): Promise<ActionResult> {
  const parsed = taskInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    title: parsed.data.title,
    project_id: parsed.data.project_id,
  });
  if (error) return { ok: false, error: "Erro ao criar tarefa" };
  revalidatePath("/tasks");
  return { ok: true };
}

export async function setTaskStatus(
  id: string,
  status: TaskStatus
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("id, title, project_id, status")
    .eq("id", id)
    .single();
  if (fetchError || !task) return { ok: false, error: "Tarefa não encontrada" };

  const { error } = await supabase
    .from("tasks")
    .update({
      status,
      done_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: "Erro ao atualizar tarefa" };

  // Concluir gera o marco — registro permanece mesmo se a tarefa reabrir.
  if (status === "done" && task.status !== "done") {
    await supabase.from("milestones").insert({
      title: task.title,
      project_id: task.project_id,
      task_id: task.id,
      source: "task",
    });
  }

  revalidatePath("/tasks");
  revalidatePath("/feed");
  return { ok: true };
}

export async function toggleStar(id: string, starred: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ starred }).eq("id", id);
  if (error) return { ok: false, error: "Erro ao priorizar tarefa" };
  revalidatePath("/tasks");
  return { ok: true };
}
