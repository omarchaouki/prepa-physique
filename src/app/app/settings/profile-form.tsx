"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Check } from "lucide-react";

import { updateProfileAction, type ActionState } from "@/app/actions/auth";
import { useT } from "@/lib/i18n/client";

/**
 * Coordonnees du compte.
 *
 * Trois champs seulement, ceux que le titulaire peut corriger sans consequence
 * sur ses droits : son nom, son poste et son telephone. L'adresse et le role
 * restent affiches juste au dessus, en lecture seule, parce qu'ils identifient
 * la connexion et determinent les acces.
 *
 * Les champs sont volontairement non controles. Le formulaire est court, il
 * n'a pas d'etapes, et rien n'a besoin de survivre a un rafraichissement :
 * poser un etat React par frappe couterait des rendus sans rien apporter. La
 * valeur initiale vient du serveur par `defaultValue`.
 */
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
        <>
          <Check size={16} aria-hidden="true" />
          {t("settings.saveProfile")}
        </>
      )}
    </button>
  );
}

export function ProfileForm({
  name,
  phone,
  jobTitle,
}: {
  name: string;
  phone: string | null;
  jobTitle: string | null;
}) {
  const t = useT();
  const [state, formAction] = useActionState<ActionState, FormData>(updateProfileAction, {});

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
        <label className="label" htmlFor="profile-name">
          {t("common.name")}
        </label>
        <input
          id="profile-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          maxLength={80}
          className="field"
          defaultValue={name}
        />
      </div>

      <div>
        <label className="label" htmlFor="profile-jobTitle">
          {t("settings.jobTitle")}
        </label>
        <input
          id="profile-jobTitle"
          name="jobTitle"
          type="text"
          maxLength={80}
          className="field"
          defaultValue={jobTitle ?? ""}
        />
      </div>

      <div>
        <label className="label" htmlFor="profile-phone">
          {t("settings.phone")}
        </label>
        {/* `dir="ltr"` parce qu'un numero se lit de gauche a droite meme dans
            une interface en arabe : sans cela, le plus de l'indicatif saute a
            la fin. `type="tel"` ouvre le pave numerique sur telephone. */}
        <input
          id="profile-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          maxLength={30}
          className="field"
          placeholder="+212 6 00 00 00 00"
          defaultValue={phone ?? ""}
        />
        <p className="text-[0.75rem] mt-1" style={{ color: "var(--text-muted)" }}>
          {t("settings.phoneHint")}
        </p>
      </div>

      <SubmitButton />
    </form>
  );
}
