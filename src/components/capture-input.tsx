"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { captureItem } from "@/lib/actions/inbox";

export function CaptureInput() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const text = (formData.get("raw_text") as string) ?? "";
    startTransition(async () => {
      setError(null);
      const result = await captureItem(text);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (inputRef.current) inputRef.current.value = "";
      inputRef.current?.focus();
      // Classificação IA em segundo plano — falha é silenciosa (classificação manual).
      if ("id" in result) {
        fetch("/api/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: result.id }),
        })
          .then((res) => {
            if (res.ok) router.refresh();
          })
          .catch(() => {});
      }
    });
  }

  return (
    <form action={handleSubmit}>
      <input
        ref={inputRef}
        name="raw_text"
        autoFocus
        autoComplete="off"
        disabled={isPending}
        placeholder="o que está na sua cabeça? (Enter para capturar)"
        className="h-10 w-full rounded-lg border-[0.5px] border-line bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-400 focus:ring-2 focus:ring-info/40 disabled:opacity-60"
      />
      {error && <p className="mt-2 text-[13px] text-negative">{error}</p>}
    </form>
  );
}
