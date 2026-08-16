"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { updateClubAction } from "@/app/actions/squad";
import type { ActionState } from "@/app/actions/auth";
import { useT } from "@/lib/i18n/client";

function SubmitButton() {
  const t = useT();
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          {t("common.saving")}
        </>
      ) : (
        t("common.save")
      )}
    </button>
  );
}

export function ClubForm({
  values,
}: {
  values: { organizationId: string; name: string; city: string; country: string };
}) {
  const t = useT();
  const [state, formAction] = useActionState<ActionState, FormData>(updateClubAction, {});

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="organizationId" value={values.organizationId} />

      {state.error ? (
        <div
          className="rounded-lg px-3 py-2 text-[0.8125rem]"
          style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
          role="alert"
        >
          {state.error}
        </div>
      ) : null}
      {state.success ? (
        <div
          className="rounded-lg px-3 py-2 text-[0.8125rem]"
          style={{ background: "var(--success-soft)", color: "var(--success)" }}
          role="status"
        >
          {state.success}
        </div>
      ) : null}

      <div>
        <label className="label" htmlFor="club-name">
          {t("admin.clubName")} *
        </label>
        <input
          id="club-name"
          name="name"
          type="text"
          required
          minLength={2}
          defaultValue={values.name}
          className="field"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label" htmlFor="club-city">
            {t("admin.city")}
          </label>
          <input
            id="club-city"
            name="city"
            type="text"
            defaultValue={values.city}
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="club-country">
            {t("admin.country")}
          </label>
          <input
            id="club-country"
            name="country"
            type="text"
            defaultValue={values.country}
            className="field"
          />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
