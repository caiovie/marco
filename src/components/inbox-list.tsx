"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { convertItem, discardItem } from "@/lib/actions/inbox";
import { ProjectChip } from "@/components/project-chip";
import type { InboxItem, Project, SuggestionKind } from "@/lib/types";

const kindLabels: Record<SuggestionKind, string> = {
  task: "tarefa",
  milestone: "marco",
  note: "nota",
};

function ItemRow({ item, projects }: { item: InboxItem; projects: Project[] }) {
  const suggestion = item.suggestion;
  const suggestedProject = suggestion?.project_slug
    ? projects.find((p) => p.slug === suggestion.project_slug)
    : undefined;

  const [title, setTitle] = useState(suggestion?.title ?? item.raw_text);
  const [kind, setKind] = useState<"task" | "milestone">(
    suggestion?.kind === "milestone" || suggestion?.kind === "note"
      ? "milestone"
      : "task"
  );
  const [projectId, setProjectId] = useState<string>(suggestedProject?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConvert() {
    startTransition(async () => {
      setError(null);
      const result = await convertItem(item.id, {
        kind,
        title,
        project_id: projectId === "" ? null : projectId,
      });
      if (!result.ok) setError(result.error);
    });
  }

  function handleDiscard() {
    if (!window.confirm("Descartar este item?")) return;
    startTransition(async () => {
      const result = await discardItem(item.id);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <motion.li
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="rounded-xl border-[0.5px] border-line bg-surface p-4"
    >
      <p className="text-sm text-ink">{item.raw_text}</p>

      {suggestion && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-400">
          <Sparkles size={12} />
          <span>
            sugestão: {kindLabels[suggestion.kind]}
            {suggestedProject ? " em" : ""}
          </span>
          {suggestedProject && (
            <ProjectChip
              name={suggestedProject.name}
              colorKey={suggestedProject.color_key}
            />
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-8 min-w-40 flex-1 rounded-lg border-[0.5px] border-line bg-surface px-2.5 text-[13px] text-ink outline-none focus:ring-2 focus:ring-info/40"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as "task" | "milestone")}
          className="h-8 rounded-lg border-[0.5px] border-line bg-surface px-2 text-[13px] text-ink outline-none"
        >
          <option value="task">tarefa</option>
          <option value="milestone">marco</option>
        </select>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="h-8 rounded-lg border-[0.5px] border-line bg-surface px-2 text-[13px] text-ink outline-none"
        >
          <option value="">sem projeto</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleConvert}
          disabled={isPending}
          className="h-8 rounded-lg bg-ink px-3 text-[13px] font-medium text-paper transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          converter
        </button>
        <button
          type="button"
          onClick={handleDiscard}
          disabled={isPending}
          className="h-8 rounded-lg px-2 text-[13px] text-ink-400 transition-colors hover:text-negative disabled:opacity-50"
        >
          descartar
        </button>
      </div>
      {error && <p className="mt-2 text-[13px] text-negative">{error}</p>}
    </motion.li>
  );
}

export function InboxList({
  items,
  projects,
}: {
  items: InboxItem[];
  projects: Project[];
}) {
  if (items.length === 0) {
    return (
      <p className="mt-8 text-[13px] text-ink-400">
        inbox vazio — capture o que estiver na sua cabeça.
      </p>
    );
  }
  return (
    <ul className="mt-6 flex flex-col gap-2.5">
      {items.map((item) => (
        <ItemRow key={item.id} item={item} projects={projects} />
      ))}
    </ul>
  );
}
