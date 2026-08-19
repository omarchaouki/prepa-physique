"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { createOrganizationAction, createTeamAction } from "@/app/actions/admin";
import type { ActionState } from "@/app/actions/auth";
import { CATEGORIES, TEAM_LEVELS, TEAM_LEVEL_LABELS, type TeamLevel } from "@/lib/constants";
import { useLocale, useT } from "@/lib/i18n/client";

function SubmitButton({ label }: { label: string }) {
  const t = useT();
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          {t("common.saving")}
        </>
      ) : (
        label
      )}
    </button>
  );
}

function Feedback({ state }: { state: ActionState }) {
  if (state.error) {
    return (
      <div
        className="rounded-lg px-3 py-2 text-[0.8125rem]"
        style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
        role="alert"
      >
        {state.error}
      </div>
    );
  }
  if (state.success) {
    return (
      <div
        className="rounded-lg px-3 py-2 text-[0.8125rem]"
        style={{ background: "var(--success-soft)", color: "var(--success)" }}
        role="status"
      >
        {state.success}
      </div>
    );
  }
  return null;
}

export function CreateOrganizationForm({ plans }: { plans: string[] }) {
  const t = useT();
  const [state, formAction] = useActionState<ActionState, FormData>(createOrganizationAction, {});

  return (
    <form action={formAction} className="space-y-3">
      <Feedback state={state} />

      <div>
        <label className="label" htmlFor="org-name">
          {t("admin.clubName")} *
        </label>
        <input id="org-name" name="name" type="text" required minLength={2} className="field" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label" htmlFor="org-city">
            {t("admin.city")}
          </label>
          <input id="org-city" name="city" type="text" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="org-country">
            {t("admin.country")}
          </label>
          <input id="org-country" name="country" type="text" className="field" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="org-plan">
          {t("admin.plan")}
        </label>
        <select id="org-plan" name="plan" className="field cursor-pointer" defaultValue="FREE">
          {plans.map((plan) => (
            <option key={plan} value={plan}>
              {plan}
            </option>
          ))}
        </select>
        <p className="text-[0.75rem] mt-1" style={{ color: "var(--text-muted)" }}>
          {t("admin.planHint")}
        </p>
      </div>

      <div>
        <label className="label" htmlFor="org-expires">
          {t("admin.accessEnd")}
        </label>
        <input id="org-expires" name="expiresAt" type="date" className="field" />
      </div>

      <div>
        <label className="label" htmlFor="org-notes">
          {t("admin.internalNotes")}
        </label>
        <textarea id="org-notes" name="notes" rows={2} className="field" />
      </div>

      <SubmitButton label={t("admin.createClub")} />
    </form>
  );
}

export function CreateTeamForm({
  organizations,
}: {
  organizations: Array<{ id: string; name: string }>;
}) {
  const t = useT();
  const locale = useLocale();
  const [state, formAction] = useActionState<ActionState, FormData>(createTeamAction, {});

  if (organizations.length === 0) {
    return (
      <p className="text-[0.8125rem]" style={{ color: "var(--text-muted)" }}>
        {t("admin.createClubFirst")}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <Feedback state={state} />

      <div>
        <label className="label" htmlFor="team-org">
          {t("admin.club")} *
        </label>
        <select id="team-org" name="organizationId" required className="field cursor-pointer">
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="team-name">
          {t("admin.teamName")} *
        </label>
        <input id="team-name" name="name" type="text" required minLength={2} className="field" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label" htmlFor="team-category">
            {t("admin.category")}
          </label>
          <select id="team-category" name="category" className="field cursor-pointer" defaultValue="SENIOR">
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="team-sex">
            {t("admin.sex")}
          </label>
          <select id="team-sex" name="sex" className="field cursor-pointer" defaultValue="M">
            <option value="M">{t("teams.masculine")}</option>
            <option value="F">{t("teams.feminine")}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label" htmlFor="team-level">
            {t("admin.level")}
          </label>
          <select id="team-level" name="level" className="field cursor-pointer" defaultValue="AMATEUR">
            {TEAM_LEVELS.map((level) => (
              <option key={level} value={level}>
                {TEAM_LEVEL_LABELS[level as TeamLevel][locale]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="team-season">
            {t("admin.season")}
          </label>
          <input
            id="team-season"
            name="season"
            type="text"
            defaultValue="2025-2026"
            className="field"
          />
        </div>
      </div>

      <p className="text-[0.75rem]" style={{ color: "var(--text-muted)" }}>
        {t("admin.teamPopulationHint")}
      </p>

      <SubmitButton label={t("admin.createTeam")} />
    </form>
  );
}
