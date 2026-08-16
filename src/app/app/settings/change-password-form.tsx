"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { changePasswordAction, type ActionState } from "@/app/actions/auth";
import { useT } from "@/lib/i18n/client";

function SubmitButton() {
  const t = useT();
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          {t("settings.updating")}
        </>
      ) : (
        t("settings.changePassword")
      )}
    </button>
  );
}

export function ChangePasswordForm() {
  const t = useT();
  const [state, formAction] = useActionState<ActionState, FormData>(changePasswordAction, {});

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? (
        <div
          className="rounded-lg px-3 py-2.5 text-sm"
          style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
          role="alert"
        >
          {state.error}
        </div>
      ) : null}
      {state.success ? (
        <div
          className="rounded-lg px-3 py-2.5 text-sm"
          style={{ background: "var(--success-soft)", color: "var(--success)" }}
          role="status"
        >
          {state.success}
        </div>
      ) : null}

      <div>
        <label className="label" htmlFor="current">
          {t("settings.currentPassword")}
        </label>
        <input
          id="current"
          name="current"
          type="password"
          autoComplete="current-password"
          required
          className="field"
        />
      </div>

      <div>
        <label className="label" htmlFor="next">
          {t("settings.newPassword")}
        </label>
        <input
          id="next"
          name="next"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="field"
        />
        <p className="text-[0.75rem] mt-1" style={{ color: "var(--text-muted)" }}>
          {t("settings.passwordHint")}
        </p>
      </div>

      <div>
        <label className="label" htmlFor="confirm">
          {t("settings.confirmPassword")}
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="field"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
