"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { loginAction, type ActionState } from "@/app/actions/auth";
import { useT } from "@/lib/i18n/client";

function SubmitButton() {
  const t = useT();
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          {t("login.pending")}
        </>
      ) : (
        t("login.submit")
      )}
    </button>
  );
}

export function LoginForm({ from }: { from?: string }) {
  const t = useT();
  const [state, formAction] = useActionState<ActionState, FormData>(loginAction, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {from ? <input type="hidden" name="from" value={from} /> : null}

      {state.error ? (
        <div
          className="rounded-lg px-3 py-2.5 text-sm"
          style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
          role="alert"
          aria-live="polite"
        >
          {state.error}
        </div>
      ) : null}

      <div>
        <label className="label" htmlFor="email">
          {t("login.email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          className="field"
          placeholder="prenom.nom@club.com"
        />
      </div>

      <div>
        <label className="label" htmlFor="password">
          {t("login.password")}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="field pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-1 top-1/2 -translate-y-1/2 grid place-items-center size-9 rounded-md cursor-pointer"
            style={{ color: "var(--text-muted)" }}
            aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
          >
            {showPassword ? (
              <EyeOff size={17} aria-hidden="true" />
            ) : (
              <Eye size={17} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
