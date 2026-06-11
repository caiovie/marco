import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TaskList } from "@/components/task-list";
import type { Project } from "@/lib/types";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project: projectSlug } = await searchParams;
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("archived", false)
    .order("created_at");

  const activeProjects = (projects ?? []) as Project[];
  const filtered = projectSlug
    ? activeProjects.find((p) => p.slug === projectSlug)
    : undefined;

  let query = supabase
    .from("tasks")
    .select("*, projects(name, color_key)")
    .order("starred", { ascending: false })
    .order("created_at", { ascending: false });
  if (filtered) query = query.eq("project_id", filtered.id);

  const { data: tasks } = await query;

  return (
    <div>
      <h1 className="text-[22px] font-medium leading-tight text-ink-900">
        Tarefas
      </h1>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Link
          href="/tasks"
          className={`rounded-full border-[0.5px] px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
            !filtered
              ? "border-ink bg-ink text-paper"
              : "border-line text-ink-500 hover:bg-surface-2"
          }`}
        >
          todas
        </Link>
        {activeProjects.map((p) => (
          <Link
            key={p.id}
            href={`/tasks?project=${p.slug}`}
            className={`rounded-full border-[0.5px] px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
              filtered?.id === p.id
                ? "border-ink bg-ink text-paper"
                : "border-line text-ink-500 hover:bg-surface-2"
            }`}
          >
            {p.name}
          </Link>
        ))}
      </div>
      <div className="mt-6">
        <TaskList
          tasks={(tasks ?? []) as Parameters<typeof TaskList>[0]["tasks"]}
          projects={activeProjects}
        />
      </div>
    </div>
  );
}
