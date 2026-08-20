"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { Region } from "@/lib/region";
import type { TrackingSettings } from "@/lib/tracking";
import { createMarketingTranslator, direction, type MarketingLocale } from "@/lib/i18n/marketing";
import { TrackingScripts } from "./scripts";

/**
 * Porte d'entree des balises de mesure.
 *
 * ---------------------------------------------------------------------------
 * Qui voit la banniere
 * ---------------------------------------------------------------------------
 *
 * Uniquement les visiteurs europeens. Ailleurs les balises se chargent
 * directement, ce qui est la difference entre une campagne publicitaire qui
 * apprend et une campagne qui depense a l'aveugle.
 *
 * Deux sources decident, dans cet ordre :
 *
 *   1. L'entete de pays du reseau de diffusion, lu cote serveur. Exact quand il
 *      existe, absent sur l'installation actuelle.
 *   2. Le fuseau horaire du navigateur. Personne d'autre que lui ne le connait,
 *      il ne coute aucune requete, et il se trompe rarement : un telephone a
 *      Paris est regle sur Europe/Paris.
 *
 * Si les deux echouent, on demande. Un consentement demande a tort coute une
 * banniere ; une mesure posee a tort coute une amende.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi les balises ne sont pas dans la mise en page
 * ---------------------------------------------------------------------------
 *
 * Parce qu'elles ne doivent pas exister tant que la decision n'est pas prise.
 * Rendre le script puis l'ignorer ne servirait a rien : le script pose son
 * cookie a la seconde ou il s'execute. La seule facon honnete de respecter un
 * refus est de ne jamais l'inserer dans le document.
 */

const STORAGE_KEY = "pp-consent";

type Decision = "granted" | "denied";

/**
 * Le fuseau horaire designe t il un pays a consentement.
 *
 * `Europe/` couvre l'essentiel, moins les capitales qui n'en font pas partie.
 * Les fuseaux atlantiques listes sont ceux des regions insulaires portugaises
 * et espagnoles, qui relevent bien du reglement europeen.
 */
const NON_EEA_EUROPE = new Set([
  "Europe/Moscow",
  "Europe/Istanbul",
  "Europe/Kiev",
  "Europe/Kyiv",
  "Europe/Minsk",
  "Europe/Belgrade",
  "Europe/Sarajevo",
  "Europe/Skopje",
  "Europe/Tirane",
  "Europe/Podgorica",
  "Europe/Chisinau",
  "Europe/Volgograd",
  "Europe/Samara",
  "Europe/Kaliningrad",
]);

const EEA_ATLANTIC = new Set([
  "Atlantic/Azores",
  "Atlantic/Madeira",
  "Atlantic/Canary",
  "Atlantic/Reykjavik",
]);

const looksEuropean = (): boolean => {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!zone) return true;
    if (EEA_ATLANTIC.has(zone)) return true;
    if (NON_EEA_EUROPE.has(zone)) return false;
    return zone.startsWith("Europe/");
  } catch {
    // Sans fuseau lisible, on demande.
    return true;
  }
};

export function ConsentGate({
  tracking,
  region,
  locale,
}: {
  tracking: TrackingSettings;
  region: Region;
  locale: MarketingLocale;
}) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    // Rien a mesurer, rien a demander. Une banniere de consentement pour des
    // balises qui n'existent pas serait le pire des deux mondes.
    if (!tracking.facebookPixelId && !tracking.clarityProjectId) return;

    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      // Navigation privee sur certains navigateurs : on retombe sur la question.
    }

    if (stored === "granted" || stored === "denied") {
      setDecision(stored);
      return;
    }

    if (region === "other") {
      setDecision("granted");
      return;
    }

    if (region === "eea" || looksEuropean()) {
      setAsking(true);
      return;
    }

    setDecision("granted");
  }, [region, tracking.facebookPixelId, tracking.clarityProjectId]);

  const choose = (value: Decision) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Le choix ne survivra pas au rechargement, mais il vaut pour cette visite.
    }
    setAsking(false);
    setDecision(value);
  };

  const t = createMarketingTranslator(locale);

  return (
    <>
      {decision === "granted" ? <TrackingScripts {...tracking} /> : null}

      {asking ? (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={t("consent.title")}
          dir={direction(locale)}
          className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div
            className="mx-auto max-w-3xl p-4 sm:p-5"
            style={{
              background: "var(--surface-panel)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-panel)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
            }}
          >
            <p className="text-[0.9375rem] font-semibold mb-1.5">{t("consent.title")}</p>
            <p
              className="text-[0.8125rem] leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("consent.body")}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              {/* L'acceptation est le bouton principal, le refus reste un vrai
                  bouton de meme taille et non un lien discret : une banniere qui
                  cache son refus n'est pas un consentement libre. */}
              <button
                type="button"
                onClick={() => choose("granted")}
                className="btn btn-primary"
                style={{ minHeight: "2.75rem" }}
              >
                {t("consent.accept")}
              </button>
              <button
                type="button"
                onClick={() => choose("denied")}
                className="btn btn-secondary"
                style={{ minHeight: "2.75rem" }}
              >
                {t("consent.decline")}
              </button>
              <Link
                href="/legal/confidentialite"
                className="link-quiet cursor-pointer text-[0.8125rem] ms-auto"
              >
                {t("consent.more")}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
