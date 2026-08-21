"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save, KeyRound } from "lucide-react";

import { saveTrackingAction } from "@/app/actions/tracking";
import type { ActionState } from "@/app/actions/auth";
import { useT, type MessageKey } from "@/lib/i18n/client";
import { FormProgress } from "@/components/shell/form-progress";
import { Badge } from "@/components/ui/primitives";

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
        <>
          <Save size={16} aria-hidden="true" />
          {t("common.save")}
        </>
      )}
    </button>
  );
}

/**
 * Formulaire des balises de mesure.
 *
 * L'action renvoie des cles de dictionnaire plutot que des phrases : le panneau
 * proprietaire existe en deux langues, et un message d'erreur ecrit en dur dans
 * une action serveur en aurait toujours ignore une.
 *
 * L'etat vit dans React pour que la pastille active ou inactive suive la
 * saisie, avant meme l'enregistrement. C'est ce qui rend visible qu'un champ
 * vide coupe la mesure, chose qu'aucun texte d'aide ne fait comprendre aussi
 * vite.
 */
export function TrackingForm({
  facebookPixelId,
  clarityProjectId,
  capiConfigured,
}: {
  facebookPixelId: string;
  clarityProjectId: string;
  /**
   * Vrai si un jeton existe. Sa valeur ne traverse jamais la frontiere serveur
   * vers client : un secret affiche dans un champ se retrouve dans le code
   * source de la page, dans l'historique du navigateur et dans les
   * gestionnaires de mots de passe.
   */
  capiConfigured: boolean;
}) {
  const t = useT();
  const [state, formAction] = useActionState<ActionState, FormData>(saveTrackingAction, {});
  const [pixel, setPixel] = useState(facebookPixelId);
  const [clarity, setClarity] = useState(clarityProjectId);
  const [token, setToken] = useState("");
  const [clearToken, setClearToken] = useState(false);

  const message = (value: string | undefined): string =>
    value ? t(value as MessageKey) : "";

  const status = (value: string) =>
    value.trim() ? (
      <Badge tone="success">{t("tracking.active")}</Badge>
    ) : (
      <Badge tone="neutral">{t("tracking.inactive")}</Badge>
    );

  return (
    <form action={formAction} className="space-y-5">
      <FormProgress />

      {state.error ? (
        <div
          className="rounded-lg px-3 py-2.5 text-[0.8125rem]"
          style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
          role="alert"
        >
          {message(state.error)}
        </div>
      ) : null}

      {state.success ? (
        <div
          className="rounded-lg px-3 py-2.5 text-[0.8125rem]"
          style={{ background: "var(--success-soft)", color: "var(--success)" }}
          role="status"
        >
          {message(state.success)}
        </div>
      ) : null}

      <div>
        <div className="flex items-center justify-between gap-3 mb-1">
          <label className="label mb-0" htmlFor="facebookPixelId">
            {t("tracking.pixelLabel")}
          </label>
          {status(pixel)}
        </div>
        <input
          id="facebookPixelId"
          name="facebookPixelId"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          className="field tabular"
          placeholder="1234567890123456"
          value={pixel}
          onChange={(event) => setPixel(event.target.value)}
        />
        <p className="text-[0.75rem] mt-1.5" style={{ color: "var(--text-muted)" }}>
          {t("tracking.pixelHint")} {t("tracking.emptyHint")}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3 mb-1">
          <label className="label mb-0" htmlFor="clarityProjectId">
            {t("tracking.clarityLabel")}
          </label>
          {status(clarity)}
        </div>
        <input
          id="clarityProjectId"
          name="clarityProjectId"
          type="text"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className="field"
          placeholder="y50lqra0zw"
          value={clarity}
          onChange={(event) => setClarity(event.target.value)}
        />
        <p className="text-[0.75rem] mt-1.5" style={{ color: "var(--text-muted)" }}>
          {t("tracking.clarityHint")} {t("tracking.emptyHint")}
        </p>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* API Conversions                                                  */}
      {/* --------------------------------------------------------------- */}
      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1.25rem" }}>
        <div className="flex items-center justify-between gap-3 mb-1">
          <label className="label mb-0" htmlFor="capiAccessToken">
            {t("tracking.capiLabel")}
          </label>
          {capiConfigured && !clearToken ? (
            <Badge tone="success">{t("tracking.active")}</Badge>
          ) : (
            <Badge tone="neutral">{t("tracking.inactive")}</Badge>
          )}
        </div>

        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-muted)" }}
            aria-hidden="true"
          >
            <KeyRound size={16} />
          </span>
          <input
            id="capiAccessToken"
            name="capiAccessToken"
            type="password"
            autoComplete="off"
            spellCheck={false}
            className="field ps-10"
            // Le champ arrive toujours vide, meme quand un jeton existe. Le
            // texte du repere dit lequel des deux etats on regarde.
            placeholder={
              capiConfigured ? t("tracking.capiPlaceholderSet") : t("tracking.capiPlaceholderEmpty")
            }
            value={token}
            onChange={(event) => setToken(event.target.value)}
            disabled={clearToken}
          />
        </div>

        <p className="text-[0.75rem] mt-1.5" style={{ color: "var(--text-muted)" }}>
          {t("tracking.capiHint")}
        </p>

        {capiConfigured ? (
          <label
            className="flex items-center gap-2 mt-3 text-[0.8125rem] cursor-pointer"
            style={{ minHeight: "2.75rem" }}
          >
            <input
              type="checkbox"
              name="capiClear"
              checked={clearToken}
              onChange={(event) => setClearToken(event.target.checked)}
            />
            {t("tracking.capiClear")}
          </label>
        ) : null}
      </div>

      <SubmitButton />
    </form>
  );
}
