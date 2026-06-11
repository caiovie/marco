"use client";

import { useState, useTransition } from "react";
import { Archive, Pencil } from "lucide-react";
import {
  archiveProject,
  createProject,
  renameProject,
} from "@/lib/actions/projects";
import { ProjectChip } from "@/components/project-chip";
import type { Project } from "@/lib/types";

function ProjectRow({ project }: { project: Project }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRename(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      setError(null);
      const result = await renameProject(project.id, name);
      if (result.ok) {
        setEditing(false);
      } else {
        setError(result.error);
      }
    });
  }

  function handleArchive() {
    if (!window.confirm(`Arquivar o projeto "${project.name}"?`)) return;
    startTransition(async () => {
      const result = await archiveProject(project.id);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <li
      className={`flex items-center gap-2.5 rounded-xl border-[0.5px] border-line bg-surface px-3.5 py-2.5 ${
        isPending ? "opacity-60" : ""
      }`}
    >
      {editing ? (
        <form onSubmit={handleRename} className="flex flex-1 items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="h-8 flex-1 rounded-lg border-[0.5px] border-line bg-surface px-2.5 text-[13px] text-ink outline-none focus:ring-2 focus:ring-info/40"
          />
          <button
            type="submit"
            className="h-8 rounded-lg bg-ink px-3 text-[13px] font-medium text-paper"
          >
            salvar
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setName(project.name);
            }}
            className="text-[13px] text-ink-400 hover:text-ink"
          >
            cancelar
          </button>
        </form>
      ) : (
        <>
          <span className="flex-1 text-sm text-ink">{project.name}</span>
          <ProjectChip name={project.slug} colorKey={project.color_key} />
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Renomear"
            className="text-ink-400 transition-colors hover:text-ink"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={handleArchive}
            aria-label="Arquivar"
            className="text-ink-400 transition-colors hover:text-negative"
          >
            <Archive size={15} />
          </button>
        </>
      )}
      {error && <p className="text-[13px] text-negative">{error}</p>}
    </li>
  );
}

export function ProjectManager({ projects }: { projects: Project[] }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      setError(null);
      const result = await createProject(name);
      if (result.ok) {
        setName("");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="novo projeto"
          disabled={isPending}
          className="h-9 flex-1 rounded-lg border-[0.5px] border-line bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-400 focus:ring-2 focus:ring-info/40"
        />
        <button
          type="submit"
          disabled={isPending || name.trim() === ""}
          className="h-9 rounded-lg bg-ink px-3.5 text-sm font-medium text-paper transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          criar
        </button>
      </form>
      {error && <p className="mt-2 text-[13px] text-negative">{error}</p>}

      <ul className="mt-6 flex flex-col gap-2">
        {projects.map((p) => (
          <ProjectRow key={p.id} project={p} />
        ))}
      </ul>
      {projects.length === 0 && (
        <p className="mt-8 text-[13px] text-ink-400">nenhum projeto ativo.</p>
      )}
    </div>
  );
}
