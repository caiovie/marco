import { z } from "zod";

export const captureSchema = z.object({
  raw_text: z.string().trim().min(1, "Escreva algo").max(2000),
});

export const taskInputSchema = z.object({
  title: z.string().trim().min(1, "Título obrigatório").max(300),
  project_id: z.string().uuid().nullable(),
});

export const milestoneInputSchema = z.object({
  title: z.string().trim().min(1, "Título obrigatório").max(300),
  project_id: z.string().uuid().nullable(),
  note: z.string().trim().max(2000).optional(),
});

export const projectInputSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(80),
});

export const classifySuggestionSchema = z.object({
  project_slug: z.string().nullable(),
  kind: z.enum(["task", "milestone", "note"]),
  title: z.string().trim().min(1).max(300),
});
