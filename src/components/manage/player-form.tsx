"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, UserPlus } from "lucide-react";

import { createPlayerAction, updatePlayerAction } from "@/app/actions/squad";
import type { ActionState } from "@/app/actions/auth";
import {
  POSITIONS,
  POSITION_LABELS,
  PLAYER_STATUSES,
  PLAYER_STATUS_LABELS,
  type PlayerStatus,
  type Position,
} from "@/lib/constants";
import { useLocale, useT } from "@/lib/i18n/client";
import type { PlayerFormValues } from "./player-values";


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
        <>
          <UserPlus size={16} aria-hidden="true" />
          {label}
        </>
      )}
    </button>
  );
}

/**
 * Formulaire de joueur, partage entre l'ajout et la modification.
 *
 * En mode ajout, le formulaire se vide et redonne le focus au nom des qu'un
 * joueur est enregistre : on peut saisir un effectif entier sans quitter la
 * page ni toucher la souris.
 */
export function PlayerForm({
  mode,
  values,
  teams,
  extra,
}: {
  mode: "create" | "edit";
  values: PlayerFormValues;
  teams: Array<{ id: string; name: string }>;
  extra?: React.ReactNode;
}) {
  const t = useT();
  const locale = useLocale();
  const [state, formAction] = useActionState<ActionState, FormData>(
    mode === "create" ? createPlayerAction : updatePlayerAction,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === "create" && state.success) {
      formRef.current?.reset();
      firstFieldRef.current?.focus();
    }
  }, [mode, state.success]);

  return (
    <form action={formAction} ref={formRef} className="space-y-3">
      {values.id ? <input type="hidden" name="playerId" value={values.id} /> : null}

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

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="lastName">
            {t("common.lastName")} *
          </label>
          <input
            id="lastName"
            name="lastName"
            ref={firstFieldRef}
            type="text"
            required
            defaultValue={values.lastName}
            className="field"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="label" htmlFor="firstName">
            {t("common.firstName")} *
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            defaultValue={values.firstName}
            className="field"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="label" htmlFor="birthDate">
            {t("common.birthDate")} *
          </label>
          <input
            id="birthDate"
            name="birthDate"
            type="date"
            required
            defaultValue={values.birthDate}
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="position">
            {t("squad.position")} *
          </label>
          <select
            id="position"
            name="position"
            defaultValue={values.position}
            className="field cursor-pointer"
          >
            {POSITIONS.map((position) => (
              <option key={position} value={position}>
                {POSITION_LABELS[position as Position][locale]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="secondaryPosition">
            {t("manage.secondaryPosition")}
          </label>
          <select
            id="secondaryPosition"
            name="secondaryPosition"
            defaultValue={values.secondaryPosition}
            className="field cursor-pointer"
          >
            <option value="">{t("manage.noneOption")}</option>
            {POSITIONS.map((position) => (
              <option key={position} value={position}>
                {POSITION_LABELS[position as Position][locale]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-3">
        <div>
          <label className="label" htmlFor="jerseyNumber">
            {t("players.jersey")}
          </label>
          <input
            id="jerseyNumber"
            name="jerseyNumber"
            type="number"
            min={1}
            max={99}
            defaultValue={values.jerseyNumber}
            className="field tabular"
          />
        </div>
        <div>
          <label className="label" htmlFor="heightCm">
            {t("players.height")} (cm)
          </label>
          <input
            id="heightCm"
            name="heightCm"
            type="number"
            step="0.1"
            min={120}
            max={220}
            defaultValue={values.heightCm}
            className="field tabular"
          />
        </div>
        <div>
          <label className="label" htmlFor="weightKg">
            {t("players.weight")} (kg)
          </label>
          <input
            id="weightKg"
            name="weightKg"
            type="number"
            step="0.1"
            min={25}
            max={150}
            defaultValue={values.weightKg}
            className="field tabular"
          />
        </div>
        <div>
          <label className="label" htmlFor="dominantFoot">
            {t("players.foot")}
          </label>
          <select
            id="dominantFoot"
            name="dominantFoot"
            defaultValue={values.dominantFoot}
            className="field cursor-pointer"
          >
            <option value="R">{t("players.footRight")}</option>
            <option value="L">{t("players.footLeft")}</option>
            <option value="B">{t("players.footBoth")}</option>
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="label" htmlFor="sex">
            {t("admin.sex")}
          </label>
          <select id="sex" name="sex" defaultValue={values.sex} className="field cursor-pointer">
            <option value="M">{t("teams.masculine")}</option>
            <option value="F">{t("teams.feminine")}</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="status">
            {t("common.status")}
          </label>
          <select
            id="status"
            name="status"
            defaultValue={values.status}
            className="field cursor-pointer"
          >
            {PLAYER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {PLAYER_STATUS_LABELS[status as PlayerStatus][locale]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="teamId">
            {t("manage.transferTeam")}
          </label>
          <select
            id="teamId"
            name="teamId"
            defaultValue={values.teamId}
            className="field cursor-pointer"
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <details className="panel-sunken p-3">
        <summary className="cursor-pointer text-[0.8125rem] font-medium">
          {t("common.optional")}
        </summary>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <div>
            <label className="label" htmlFor="email">
              {t("login.email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={values.email}
              className="field"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="label" htmlFor="externalId">
              {t("manage.externalId")}
            </label>
            <input
              id="externalId"
              name="externalId"
              type="text"
              defaultValue={values.externalId}
              className="field"
              autoComplete="off"
            />
            <p className="text-[0.75rem] mt-1" style={{ color: "var(--text-muted)" }}>
              {t("manage.externalIdHint")}
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="notes">
              {t("common.notes")}
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              defaultValue={values.notes}
              className="field"
            />
          </div>
        </div>
      </details>

      <div className="flex flex-wrap items-center gap-2">
        <SubmitButton label={mode === "create" ? t("manage.addPlayer") : t("common.save")} />
        {extra}
      </div>
    </form>
  );
}
