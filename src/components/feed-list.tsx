"use client";

import { motion } from "framer-motion";
import { ProjectChip } from "@/components/project-chip";
import type { Milestone, Project } from "@/lib/types";

type MilestoneWithProject = Milestone & {
  projects: { name: string; color_key: Project["color_key"] } | null;
};

const sourceLabels: Record<Milestone["source"], string> = {
  manual: "manual",
  task: "tarefa",
  inbox: "inbox",
};

function dayLabel(dateKey: string): string {
  const today = new Date();
  const date = new Date(dateKey + "T12:00:00");
  const diffDays = Math.round(
    (new Date(today.toDateString()).getTime() -
      new Date(date.toDateString()).getTime()) /
      86_400_000
  );
  if (diffDays === 0) return "hoje";
  if (diffDays === 1) return "ontem";
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export function FeedList({ milestones }: { milestones: MilestoneWithProject[] }) {
  if (milestones.length === 0) {
    return (
      <p className="mt-8 text-[13px] text-ink-400">
        nenhum marco ainda — conclua uma tarefa ou registre um manualmente.
      </p>
    );
  }

  const groups = new Map<string, MilestoneWithProject[]>();
  for (const m of milestones) {
    const key = new Date(m.occurred_at).toLocaleDateString("sv"); // YYYY-MM-DD local
    const list = groups.get(key) ?? [];
    list.push(m);
    groups.set(key, list);
  }

  return (
    <div className="mt-6 flex flex-col gap-7">
      {[...groups.entries()].map(([dateKey, items]) => (
        <section key={dateKey}>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-400">
            {dayLabel(dateKey)}
          </h2>
          <ul className="mt-2.5 flex flex-col gap-2">
            {items.map((m) => (
              <motion.li
                key={m.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex items-center gap-2.5 rounded-xl border-[0.5px] border-line bg-surface px-3.5 py-2.5"
              >
                <span className="size-1.5 shrink-0 rounded-full bg-positive" />
                <span className="flex-1 text-sm text-ink">{m.title}</span>
                {m.projects && (
                  <ProjectChip
                    name={m.projects.name}
                    colorKey={m.projects.color_key}
                  />
                )}
                <span className="text-[11px] text-ink-400">
                  {sourceLabels[m.source]}
                </span>
                <span className="font-mono text-[11px] text-ink-400">
                  {new Date(m.occurred_at).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </motion.li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
