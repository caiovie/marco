import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import type { Project } from "@/lib/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("archived", false)
    .order("created_at");

  return (
    <div className="flex min-h-dvh bg-paper">
      <Sidebar projects={(projects ?? []) as Project[]} />
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
