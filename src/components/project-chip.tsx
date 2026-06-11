import type { ColorKey } from "@/lib/types";

const chipClasses: Record<ColorKey, string> = {
  ae: "bg-tag-ae-chip text-tag-ae-text",
  kairos: "bg-tag-kairos-chip text-tag-kairos-text",
  esca7: "bg-tag-esca7-chip text-tag-esca7-text",
  "busca-clt": "bg-tag-busca-clt-chip text-tag-busca-clt-text",
  neutral: "bg-surface-2 text-ink-500",
};

export function ProjectChip({
  name,
  colorKey,
}: {
  name: string;
  colorKey: ColorKey;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${chipClasses[colorKey]}`}
    >
      {name}
    </span>
  );
}
