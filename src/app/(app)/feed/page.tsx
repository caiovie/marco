import { createClient } from "@/lib/supabase/server";
import { FeedList } from "@/components/feed-list";

export default async function FeedPage() {
  const supabase = await createClient();

  const { data: milestones } = await supabase
    .from("milestones")
    .select("*, projects(name, color_key)")
    .order("occurred_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-[22px] font-medium leading-tight text-ink-900">
        Feed
      </h1>
      <p className="mt-1 text-[13px] text-ink-500">
        cada coisa feita é um marco
      </p>
      <FeedList
        milestones={
          (milestones ?? []) as Parameters<typeof FeedList>[0]["milestones"]
        }
      />
    </div>
  );
}
