"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="size-8" />;

  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Tema claro" : "Tema escuro"}
      className="flex size-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
