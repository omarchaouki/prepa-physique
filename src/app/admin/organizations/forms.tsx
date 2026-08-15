"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { createOrganizationAction, createTeamAction } from "@/app/actions/admin";
import type { ActionState } from "@/app/actions/auth";
import { CATEGORIES, TEAM_LEVELS, TEAM_LEVEL_LABELS, type TeamLevel } from "@/lib/constants";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          Enregistrement
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
  const [state, formAction] = useActionState<ActionState, FormData>(createOrganizationAction, {});

  return (
    <form action={formAction} className="space-y-3">
      <Feedback state={state} />

      <div>
        <label className="label" htmlFor="org-name">
          Nom du club *
        </label>
        <input id="org-name" name="name" type="text" required minLength={2} className="field" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label" htmlFor="org-city">
            Ville
          </label>
          <input id="org-city" name="city" type="text" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="org-country">
            Pays
          </label>
          <input id="org-country" name="country" type="text" className="field" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="org-plan">
          Forfait
        </label>
        <select id="org-plan" name="plan" className="field cursor-pointer" defaultValue="TRIAL">
          {plans.map((plan) => (
            <option key={plan} value={plan}>
              {plan}
            </option>
          ))}
        </select>
        <p className="text-[0.75rem] mt-1" style={{ color: "var(--text-muted)" }}>
          Le forfait fixe le nombre maximal d'equipes et de joueurs.
        </p>
      </div>

      <div>
        <label className="label" htmlFor="org-expires">
          Date de fin d'acces
        </label>
        <input id="org-expires" name="expiresAt" type="date" className="field" />
      </div>

      <div>
        <label className="label" htmlFor="org-notes">
          Notes internes
        </label>
        <textarea id="org-notes" name="notes" rows={2} className="field" />
      </div>

      <SubmitButton label="Creer le club" />
    </form>
  );
}

export function CreateTeamForm({
  organizations,
}: {
  organizations: Array<{ id: string; name: string }>;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(createTeamAction, {});

  if (organizations.length === 0) {
    return (
      <p className="text-[0.8125rem]" style={{ color: "var(--text-muted)" }}>
        Creez d'abord un club.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <Feedback state={state} />

      <div>
        <label className="label" htmlFor="team-org">
          Club *
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
          Nom de l'equipe *
        </label>
        <input id="team-name" name="name" type="text" required minLength={2} className="field" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label" htmlFor="team-category">
            Categorie
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
            Sexe
          </label>
          <select id="team-sex" name="sex" className="field cursor-pointer" defaultValue="M">
            <option value="M">Masculin</option>
            <option value="F">Feminin</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label" htmlFor="team-level">
            Niveau
          </label>
          <select id="team-level" name="level" className="field cursor-pointer" defaultValue="AMATEUR">
            {TEAM_LEVELS.map((level) => (
              <option key={level} value={level}>
                {TEAM_LEVEL_LABELS[level as TeamLevel].fr}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="team-season">
            Saison
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
        La categorie et le niveau determinent la population de reference utilisee pour les
        percentiles.
      </p>

      <SubmitButton label="Creer l'equipe" />
    </form>
  );
}
