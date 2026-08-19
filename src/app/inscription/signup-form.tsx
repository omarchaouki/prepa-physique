"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";

import { signUpAction } from "@/app/actions/signup";
import type { ActionState } from "@/app/actions/auth";
import { useT } from "@/lib/i18n/client";
import { FormProgress } from "@/components/shell/form-progress";

function SubmitButton() {
  const t = useT();
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-lg w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          {t("signup.pending")}
        </>
      ) : (
        t("signup.submit")
      )}
    </button>
  );
}

/**
 * Formulaire d'inscription publique.
 *
 * Six champs, pas un de plus. Chaque champ supplementaire sur un formulaire
 * d'inscription coute des inscriptions, et tout ce qui n'est pas indispensable
 * ici se renseigne ensuite dans l'application, ou l'utilisateur est deja acquis.
 *
 * Le champ `website` est un leurre. Il est retire du flux visuel et de l'ordre
 * de tabulation, et signale au lecteur d'ecran qu'il n'a pas a le remplir. La
 * plupart des robots remplissent tout ce qu'ils trouvent, ce qui les trahit.
 */
export function SignUpForm() {
  const t = useT();
  const [state, formAction] = useActionState<ActionState, FormData>(signUpAction, {});
  const [visible, setVisible] = useState(false);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormProgress />

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
        <label className="label" htmlFor="club">
          {t("signup.club")} *
        </label>
        <input
          id="club"
          name="club"
          type="text"
          required
          autoComplete="organization"
          className="field"
          placeholder="FC Atlas"
        />
        <p className="text-[0.75rem] mt-1" style={{ color: "var(--text-muted)" }}>
          {t("signup.clubHint")}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="name">
            {t("signup.name")} *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="country">
            {t("signup.country")}
          </label>
          <input
            id="country"
            name="country"
            type="text"
            autoComplete="country-name"
            className="field"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="email">
          {t("signup.email")} *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          inputMode="email"
          autoCapitalize="none"
          autoComplete="email"
          className="field"
        />
        <p className="text-[0.75rem] mt-1" style={{ color: "var(--text-muted)" }}>
          {t("signup.emailHint")}
        </p>
      </div>

      <div>
        <label className="label" htmlFor="password">
          {t("signup.password")} *
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={visible ? "text" : "password"}
            required
            minLength={10}
            autoComplete="new-password"
            className="field pr-11"
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="absolute right-1 top-1/2 -translate-y-1/2 grid place-items-center size-9 rounded-md cursor-pointer"
            style={{ color: "var(--text-muted)" }}
            aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
          </button>
        </div>
        <p className="text-[0.75rem] mt-1" style={{ color: "var(--text-muted)" }}>
          {t("signup.passwordHint")}
        </p>
      </div>

      <div>
        <label className="label" htmlFor="confirm">
          {t("signup.confirm")} *
        </label>
        <input
          id="confirm"
          name="confirm"
          type={visible ? "text" : "password"}
          required
          autoComplete="new-password"
          className="field"
        />
      </div>

      {/* Leurre. Retire du flux, de la tabulation et de la voix. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <label htmlFor="website">Ne pas remplir</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <SubmitButton />

      <ul className="space-y-1.5 pt-1">
        {["signup.included1", "signup.included2", "signup.included3"].map((key) => (
          <li key={key} className="flex items-start gap-2 text-[0.8125rem]">
            <span
              className="grid place-items-center size-4 rounded-full shrink-0 mt-0.5"
              style={{ background: "var(--success-soft)", color: "var(--success)" }}
              aria-hidden="true"
            >
              <Check size={10} strokeWidth={3} />
            </span>
            <span style={{ color: "var(--text-secondary)" }}>
              {t(key as "signup.included1")}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-[0.75rem] leading-relaxed pt-1" style={{ color: "var(--text-muted)" }}>
        {t("signup.terms")}
      </p>
    </form>
  );
}
