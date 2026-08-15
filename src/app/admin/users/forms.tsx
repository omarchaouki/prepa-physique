"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, RefreshCw } from "lucide-react";

import { createUserAction, resetUserPasswordAction } from "@/app/actions/admin";
import type { ActionState } from "@/app/actions/auth";

/** Mot de passe provisoire lisible, sans caracteres ambigus. */
const generatePassword = (): string => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return [...bytes].map((n) => alphabet[n % alphabet.length]).join("");
};

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

function PasswordField({ id, name }: { id: string; name: string }) {
  const [value, setValue] = useState("");

  return (
    <div>
      <label className="label" htmlFor={id}>
        Mot de passe provisoire *
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          name={name}
          type="text"
          required
          minLength={8}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="field font-mono"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setValue(generatePassword())}
          className="btn btn-secondary shrink-0"
          aria-label="Generer un mot de passe"
          title="Generer un mot de passe"
        >
          <RefreshCw size={15} aria-hidden="true" />
        </button>
      </div>
      <p className="text-[0.75rem] mt-1" style={{ color: "var(--text-muted)" }}>
        A transmettre au client par un canal sur. Il devra le changer a la premiere connexion.
      </p>
    </div>
  );
}

export function CreateUserForm({
  organizations,
  roles,
}: {
  organizations: Array<{ id: string; name: string }>;
  roles: Array<{ value: string; label: string }>;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(createUserAction, {});

  return (
    <form action={formAction} className="space-y-3">
      <Feedback state={state} />

      <div>
        <label className="label" htmlFor="user-name">
          Nom complet *
        </label>
        <input id="user-name" name="name" type="text" required minLength={2} className="field" />
      </div>

      <div>
        <label className="label" htmlFor="user-email">
          Adresse email *
        </label>
        <input
          id="user-email"
          name="email"
          type="email"
          required
          className="field"
          autoComplete="off"
        />
      </div>

      <div>
        <label className="label" htmlFor="user-role">
          Role *
        </label>
        <select id="user-role" name="role" className="field cursor-pointer" defaultValue="COACH">
          {roles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="user-org">
          Club *
        </label>
        <select id="user-org" name="organizationId" className="field cursor-pointer" required>
          <option value="">Selectionner un club</option>
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="user-job">
          Fonction
        </label>
        <input
          id="user-job"
          name="jobTitle"
          type="text"
          className="field"
          placeholder="Preparateur physique, entraineur adjoint..."
        />
      </div>

      <PasswordField id="user-password" name="password" />

      <SubmitButton label="Creer le compte" />
    </form>
  );
}

export function ResetPasswordForm({ users }: { users: Array<{ id: string; label: string }> }) {
  const [state, formAction] = useActionState<ActionState, FormData>(resetUserPasswordAction, {});

  if (users.length === 0) {
    return (
      <p className="text-[0.8125rem]" style={{ color: "var(--text-muted)" }}>
        Aucun autre compte.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <Feedback state={state} />

      <div>
        <label className="label" htmlFor="reset-user">
          Compte
        </label>
        <select id="reset-user" name="userId" className="field cursor-pointer" required>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.label}
            </option>
          ))}
        </select>
      </div>

      <PasswordField id="reset-password" name="password" />

      <SubmitButton label="Reinitialiser" />
    </form>
  );
}
