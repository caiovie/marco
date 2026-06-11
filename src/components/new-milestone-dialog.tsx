"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { createMilestone } from "@/lib/actions/milestones";
import type { Project } from "@/lib/types";

export function NewMilestoneDialog({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const projectId = formData.get("project_id") as string;
    const result = await createMilestone({
      title: (formData.get("title") as string) ?? "",
      project_id: projectId === "" ? null : projectId,
    });
    setPending(false);
    if (result.ok) {
      setOpen(false);
    } else {
      setError(result.error);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-8 w-full items-center gap-2 rounded-lg bg-ink px-3 text-[13px] font-medium text-paper transition-opacity hover:opacity-90 active:scale-[0.98]"
      >
        <Plus size={16} />
        registrar marco
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-ink/20 pt-[20vh]"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-full max-w-md rounded-xl border-[0.5px] border-line bg-surface p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-medium text-ink-900">
                  Registrar marco
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fechar"
                  className="text-ink-400 hover:text-ink"
                >
                  <X size={16} />
                </button>
              </div>
              <form action={handleSubmit} className="mt-4 flex flex-col gap-3">
                <input
                  name="title"
                  autoFocus
                  required
                  placeholder="o que você fez?"
                  className="h-9 rounded-lg border-[0.5px] border-line bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-400 focus:ring-2 focus:ring-info/40"
                />
                <select
                  name="project_id"
                  defaultValue=""
                  className="h-9 rounded-lg border-[0.5px] border-line bg-surface px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-info/40"
                >
                  <option value="">sem projeto</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {error && <p className="text-[13px] text-negative">{error}</p>}
                <button
                  type="submit"
                  disabled={pending}
                  className="h-9 rounded-lg bg-ink text-sm font-medium text-paper transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                >
                  {pending ? "..." : "registrar"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
