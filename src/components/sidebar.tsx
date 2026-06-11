"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, ListTodo, LogOut, Milestone, Folder } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { NewMilestoneDialog } from "@/components/new-milestone-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Project } from "@/lib/types";

const nav = [
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/tasks", label: "Tarefas", icon: ListTodo },
  { href: "/feed", label: "Feed", icon: Milestone },
  { href: "/projects", label: "Projetos", icon: Folder },
];

export function Sidebar({ projects }: { projects: Project[] }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-dvh w-[216px] shrink-0 flex-col border-r-[0.5px] border-line bg-paper px-3 py-4">
      <div className="px-2">
        <span className="text-base font-medium tracking-[-0.02em] text-ink">
          marco
        </span>
        <span className="text-base text-ink-400">/caio</span>
      </div>

      <div className="mt-5">
        <NewMilestoneDialog projects={projects} />
      </div>

      <nav className="mt-5 flex flex-col gap-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex h-8 items-center gap-2.5 rounded-lg px-2 text-[13px] transition-colors duration-120 ${
                active
                  ? "bg-surface-2 font-medium text-ink"
                  : "text-ink-500 hover:bg-surface-2 hover:text-ink"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center justify-between px-1">
        <ThemeToggle />
        <form action={signOut}>
          <button
            type="submit"
            aria-label="Sair"
            className="flex size-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <LogOut size={16} />
          </button>
        </form>
      </div>
    </aside>
  );
}
