"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "@/lib/actions/auth";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    null
  );

  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-[22px] font-medium tracking-[-0.02em] text-ink">
          marco
        </h1>
        <p className="mt-1 text-[13px] text-ink-500">
          {mode === "signin"
            ? "Entre para continuar"
            : "Crie sua conta — primeiro acesso"}
        </p>

        <form action={formAction} className="mt-6 flex flex-col gap-3">
          <input
            name="email"
            type="email"
            required
            placeholder="e-mail"
            autoComplete="email"
            className="h-9 rounded-lg border-[0.5px] border-line bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-400 focus:ring-2 focus:ring-info/40"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="senha"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="h-9 rounded-lg border-[0.5px] border-line bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-400 focus:ring-2 focus:ring-info/40"
          />
          {state?.error && (
            <p className="text-[13px] text-negative">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="h-9 rounded-lg bg-ink text-sm font-medium text-paper transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {pending ? "..." : mode === "signin" ? "entrar" : "criar conta"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 text-[13px] text-ink-500 hover:text-ink"
        >
          {mode === "signin"
            ? "primeiro acesso? criar conta"
            : "já tem conta? entrar"}
        </button>
      </div>
    </main>
  );
}
