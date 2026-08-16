"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { createTeamInClubAction, updateTeamAction } from "@/app/actions/squad";
import type { ActionState } from "@/app/actions/auth";
import { CATEGORIES, TEAM_LEVELS, TEAM_LEVEL_LABELS, type TeamLevel } from "@/lib/constants";
import { useLocale, useT } from "@/lib/i18n/client";

export interface TeamFormValues {
  id?: string;
  organizationId?: string;
  name: string;
  category: string;
  level: string;
  sex: string;
  season: string;
  colorHex: string;
}

function SubmitButton({ label }: { label: string }) {
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
        label
      )}
    </button>
  );
}

export function TeamForm({
  mode,
  values,
  extra,
}: {
  mode: "create" | "edit";
  values: TeamFormValues;
  extra?: React.ReactNode;
}) {
  const t = useT();
  const locale = useLocale();
  const [state, formAction] = useActionState<ActionState, FormData>(
    mode === "create" ? createTeamInClubAction : updateTeamAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      {values.id ? <input type="hidden" name="teamId" value={values.id} /> : null}
      {values.organizationId ? (
        <input type="hidden" name="organizationId" value={values.organizationId} />
      ) : null}

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
        <label className="label" htmlFor={`team-name-${mode}`}>
          {t("admin.teamName")} *
        </label>
        <input
          id={`team-name-${mode}`}
          name="name"
          type="text"
          required
          minLength={2}
          defaultValue={values.name}
          className="field"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor={`team-category-${mode}`}>
            {t("admin.category")}
          </label>
          <select
            id={`team-category-${mode}`}
            name="category"
            defaultValue={values.category}
            className="field cursor-pointer"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor={`team-level-${mode}`}>
            {t("admin.level")}
          </label>
          <select
            id={`team-level-${mode}`}
            name="level"
            defaultValue={values.level}
            className="field cursor-pointer"
          >
            {TEAM_LEVELS.map((level) => (
              <option key={level} value={level}>
                {TEAM_LEVEL_LABELS[level as TeamLevel][locale]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="label" htmlFor={`team-sex-${mode}`}>
            {t("admin.sex")}
          </label>
          <select
            id={`team-sex-${mode}`}
            name="sex"
            defaultValue={values.sex}
            className="field cursor-pointer"
          >
            <option value="M">{t("teams.masculine")}</option>
            <option value="F">{t("teams.feminine")}</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor={`team-season-${mode}`}>
            {t("admin.season")}
          </label>
          <input
            id={`team-season-${mode}`}
            name="season"
            type="text"
            defaultValue={values.season}
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor={`team-color-${mode}`}>
            {t("manage.teamColor")}
          </label>
          <input
            id={`team-color-${mode}`}
            name="colorHex"
            type="color"
            defaultValue={values.colorHex || "#1E40AF"}
            className="field cursor-pointer"
            style={{ padding: "0.25rem", height: "2.5rem" }}
          />
        </div>
      </div>

      <p className="text-[0.75rem]" style={{ color: "var(--text-muted)" }}>
        {t("manage.teamSettingsSubtitle")}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <SubmitButton label={mode === "create" ? t("admin.createTeam") : t("common.save")} />
        {extra}
      </div>
    </form>
  );
}
