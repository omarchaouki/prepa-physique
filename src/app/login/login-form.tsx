"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { loginAction, type ActionState } from "@/app/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          Connexion en cours
        </>
      ) : (
        "Se connecter"
      )}
    </button>
  );
}

export function LoginForm({ from }: { from?: string }) {
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
          Adresse email
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
          Mot de passe
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
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <SubmitButton />

      <div
        className="panel-sunken p-3 text-[0.8125rem] leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        <p className="font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
          Comptes de demonstration
        </p>
        <ul className="space-y-0.5 font-mono text-[0.75rem]">
          <li>owner@prepaphysique.app / ChangeMoi2026</li>
          <li>coach@fcatlas.com / Demo2026</li>
        </ul>
      </div>
    </form>
  );
}
