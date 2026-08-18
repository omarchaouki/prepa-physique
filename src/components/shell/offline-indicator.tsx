"use client";

import { CloudOff, RefreshCw, UploadCloud } from "lucide-react";

import { useOffline } from "@/lib/offline/provider";
import { useT } from "@/lib/i18n/client";

/**
 * Etat du reseau et de la file d'attente.
 *
 * Visible uniquement quand il y a quelque chose a dire : hors ligne, envoi en
 * cours, ou saisies en attente. Un bandeau permanent qui affiche "en ligne" ne
 * fait que voler de la place, et finit par ne plus etre lu du tout.
 *
 * Place en bas a droite plutot que dans l'entete : la sur couche doit rester
 * visible sur telephone, ou l'entete est reduit a une barre de navigation.
 */
export function OfflineIndicator() {
  const t = useT();
  const { online, pending, syncing, flush } = useOffline();

  if (online && pending === 0 && !syncing) return null;

  const tone = online ? "var(--accent)" : "var(--warning)";
  const background = online ? "var(--accent-soft)" : "var(--warning-soft)";

  return (
    <div
      className="fixed right-3 bottom-3 z-50 flex items-center gap-2 rounded-lg px-3 py-2 text-[0.8125rem]"
      style={{
        background,
        color: tone,
        border: `1px solid ${tone}`,
        boxShadow: "var(--shadow-panel)",
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
      }}
      role="status"
      aria-live="polite"
    >
      {!online ? (
        <CloudOff size={15} aria-hidden="true" />
      ) : syncing ? (
        <RefreshCw size={15} className="animate-spin" aria-hidden="true" />
      ) : (
        <UploadCloud size={15} aria-hidden="true" />
      )}

      <span className="font-medium">
        {!online
          ? t("offline.offline")
          : syncing
            ? t("offline.syncing")
            : `${pending} ${pending > 1 ? t("offline.pendingMany") : t("offline.pendingOne")}`}
      </span>

      {/* Hors ligne, le nombre en attente rassure : rien n'est perdu. */}
      {!online && pending > 0 ? (
        <span className="tabular" style={{ opacity: 0.85 }}>
          · {pending}
        </span>
      ) : null}

      {online && pending > 0 && !syncing ? (
        <button
          type="button"
          onClick={() => void flush()}
          className="underline cursor-pointer font-medium"
          style={{ color: "inherit", minHeight: "1.5rem" }}
        >
          {t("offline.retry")}
        </button>
      ) : null}
    </div>
  );
}
