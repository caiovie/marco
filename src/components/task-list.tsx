"use client";

import { useState, useTransition } from "react";
import { Check, Circle, Star } from "lucide-react";
import { createTask, setTaskStatus, toggleStar } from "@/lib/actions/tasks";
import { ProjectChip } from "@/components/project-chip";
import type { Project, Task, TaskStatus } from "@/lib/types";

type TaskWithProject = Task & {
  projects: { name: string; color_key: Project["color_key"] } | null;
};

const sections: { status: TaskStatus; label: string }[] = [
  { status: "doing", label: "fazendo" },
  { status: "backlog", label: "backlog" },
  { status: "done", label: "feitas" },
];

function TaskRow({ task }: { task: TaskWithProject }) {
  const [isPending, startTransition] = useTransition();
  const done = task.status === "done";

  function cycle() {
    // circle: backlog→doing→done→backlog
    const next: TaskStatus =
      task.status === "backlog" ? "doing" : task.status === "doing" ? "done" : "backlog";
    startTransition(async () => {
      await setTaskStatus(task.id, next);
    });
  }

  function star() {
    startTransition(async () => {
      await toggleStar(task.id, !task.starred);
    });
  }

  return (
    <li
      className={`flex items-center gap-2.5 rounded-xl border-[0.5px] bg-surface px-3.5 py-2.5 transition-colors duration-120 ${
        task.status === "doing" ? "border-info/50" : "border-line"
      } ${isPending ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        onClick={cycle}
        aria-label="Avançar estado"
        className={`shrink-0 transition-colors ${
          done ? "text-positive" : "text-ink-400 hover:text-ink"
        }`}
      >
        {done ? <Check size={16} /> : <Circle size={16} />}
      </button>
      <span
        className={`flex-1 text-sm ${
          done ? "text-ink-400 line-through" : "text-ink"
        }`}
      >
        {task.title}
      </span>
      {task.projects && (
        <ProjectChip
          name={task.projects.name}
          colorKey={task.projects.color_key}
        />
      )}
      {done && (
        <span className="rounded-full bg-positive-chip px-2 py-0.5 text-[11px] font-medium text-positive-text">
          feito
        </span>
      )}
      <button
        type="button"
        onClick={star}
        aria-label={task.starred ? "Remover prioridade" : "Priorizar"}
        className={task.starred ? "text-warn" : "text-ink-400 hover:text-ink"}
      >
        <Star size={16} fill={task.starred ? "currentColor" : "none"} />
      </button>
    </li>
  );
}

export function TaskList({
  tasks,
  projects,
}: {
  tasks: TaskWithProject[];
  projects: Project[];
}) {
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      setError(null);
      const result = await createTask({
        title,
        project_id: projectId === "" ? null : projectId,
      });
      if (result.ok) {
        setTitle("");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="nova tarefa"
          disabled={isPending}
          className="h-9 flex-1 rounded-lg border-[0.5px] border-line bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-400 focus:ring-2 focus:ring-info/40"
        />
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="h-9 rounded-lg border-[0.5px] border-line bg-surface px-2 text-[13px] text-ink outline-none"
        >
          <option value="">sem projeto</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isPending || title.trim() === ""}
          className="h-9 rounded-lg bg-ink px-3.5 text-sm font-medium text-paper transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          criar
        </button>
      </form>
      {error && <p className="mt-2 text-[13px] text-negative">{error}</p>}

      {sections.map(({ status, label }) => {
        const group = tasks.filter((t) => t.status === status);
        if (group.length === 0) return null;
        return (
          <section key={status} className="mt-7">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-400">
              {label}
            </h2>
            <ul className="mt-2.5 flex flex-col gap-2">
              {group.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </ul>
          </section>
        );
      })}

      {tasks.length === 0 && (
        <p className="mt-8 text-[13px] text-ink-400">
          nenhuma tarefa por aqui ainda.
        </p>
      )}
    </div>
  );
}
