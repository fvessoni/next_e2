"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { APP_NAME } from "@/app/components/brand-logo";
import { PasswordInput } from "@/app/components/password-input";
import { btnPrimaryFull, linkClass } from "@/lib/ui";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <>
      <div className="hidden flex-col items-center space-y-2 text-center lg:flex">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-500">
          {APP_NAME}
        </h1>
      </div>

      <form action={formAction} className="w-full space-y-2">
        {state?.error && (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-center text-sm text-red-700"
          >
            {state.error}
          </p>
        )}

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="E-mail"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />

        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
          placeholder="Senha"
        />

        <button type="submit" disabled={isPending} className={btnPrimaryFull}>
          {isPending ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <a href="#" className={linkClass}>
        Esqueceu sua senha?
      </a>

      <p className="px-8 text-center text-xs text-muted-foreground">
        Ao utilizar este site, você concorda com os nossos
        <br />
        <a
          href="#"
          className="underline underline-offset-4 hover:text-primary"
        >
          Termos de Uso
        </a>
        <br />
        <a
          href="#"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4 hover:text-primary"
        >
          Política de Privacidade
        </a>
        .
      </p>
    </>
  );
}
