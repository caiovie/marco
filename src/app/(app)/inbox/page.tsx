import { createClient } from "@/lib/supabase/server";
import { CaptureInput } from "@/components/capture-input";
import { InboxList } from "@/components/inbox-list";
import type { InboxItem, Project } from "@/lib/types";

export default async function InboxPage() {
  const supabase = await createClient();

  const [{ data: items }, { data: projects }] = await Promise.all([
    supabase
      .from("inbox_items")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select("*")
      .eq("archived", false)
      .order("created_at"),
  ]);

  return (
    <div>
      <h1 className="text-[22px] font-medium leading-tight text-ink-900">
        Inbox
      </h1>
      <p className="mt-1 text-[13px] text-ink-500">
        capture agora, organize depois
      </p>
      <div className="mt-6">
        <CaptureInput />
      </div>
      <InboxList
        items={(items ?? []) as InboxItem[]}
        projects={(projects ?? []) as Project[]}
      />
    </div>
  );
}
