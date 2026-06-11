import { createClient } from "@/lib/supabase/server";
import { ProjectManager } from "@/components/project-manager";
import type { Project } from "@/lib/types";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("archived", false)
    .order("created_at");

  return (
    <div>
      <h1 className="text-[22px] font-medium leading-tight text-ink-900">
        Projetos
      </h1>
      <p className="mt-1 text-[13px] text-ink-500">
        contextos que organizam tarefas e marcos
      </p>
      <div className="mt-6">
        <ProjectManager projects={(projects ?? []) as Project[]} />
      </div>
    </div>
  );
}
