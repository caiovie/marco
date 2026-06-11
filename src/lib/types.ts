export type ColorKey = "ae" | "kairos" | "esca7" | "busca-clt" | "neutral";
export type TaskStatus = "backlog" | "doing" | "done";
export type MilestoneSource = "manual" | "task" | "inbox";
export type InboxStatus = "pending" | "converted" | "discarded";
export type SuggestionKind = "task" | "milestone" | "note";

export interface Project {
  id: string;
  name: string;
  slug: string;
  color_key: ColorKey;
  archived: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string | null;
  title: string;
  note: string | null;
  status: TaskStatus;
  starred: boolean;
  created_at: string;
  done_at: string | null;
}

export interface Milestone {
  id: string;
  project_id: string | null;
  task_id: string | null;
  title: string;
  note: string | null;
  source: MilestoneSource;
  occurred_at: string;
  created_at: string;
}

export interface ClassifySuggestion {
  project_slug: string | null;
  kind: SuggestionKind;
  title: string;
}

export interface InboxItem {
  id: string;
  raw_text: string;
  status: InboxStatus;
  suggestion: ClassifySuggestion | null;
  created_at: string;
}

export type ActionResult = { ok: true } | { ok: false; error: string };
