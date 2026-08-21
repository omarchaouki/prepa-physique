"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { isMeasuredPath } from "./paths";

/**
 * Evenements envoyes aux outils de mesure.
 *
 * ---------------------------------------------------------------------------
 * Le marqueur de conversion
 * ---------------------------------------------------------------------------
 *
 * L'inscription se termine par une redirection cote serveur vers l'application.
 * Un evenement de conversion doit pourtant partir du navigateur, la ou le pixel
 * est charge et ou le cookie publicitaire existe. Le serveur ajoute donc un
 * marqueur a l'adresse d'arrivee, ce composant le voit, declenche l'evenement,
 * puis efface le marqueur de la barre d'adresse.
 *
 * L'effacement n'est pas cosmetique : sans lui, un rafraichissement de la page
 * ou une adresse partagee compterait une seconde inscription, et la campagne
 * publicitaire optimiserait sur des chiffres faux.
 *
 * Deux evenements pour un seul fait, volontairement :
 *   Lead                  c'est l'evenement que l'objectif « prospects » de
 *                         Meta sait optimiser.
 *   CompleteRegistration  c'est celui qui decrit vraiment ce qui vient de se
 *                         passer, et qui restera juste si l'objectif change.
 * Les deux se choisissent dans le gestionnaire de publicites ; en avoir un seul
 * obligerait a redeployer le jour ou l'on change d'objectif.
 */

/**
 * Identifiant de l'evenement, engendre par le serveur.
 *
 * Il est la clef de la deduplication : le serveur a deja envoye ce meme Lead a
 * l'API Conversions sous cet identifiant, et le pixel le repasse ici dans
 * `eventID`. Meta reconnait les deux comme un seul fait. Sans lui, chaque
 * inscription compterait deux prospects. Voir src/lib/capi.ts.
 */
export const SIGNUP_EVENT_PARAM = "eid";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

/**
 * Envoie un evenement standard du pixel.
 *
 * Silencieux si le pixel n'est pas configure ou si un bloqueur l'a empeche de
 * se charger : aucun appel de mesure ne doit jamais interrompre un parcours.
 */
export const trackStandard = (
  event: string,
  data?: Record<string, unknown>,
  /** Options du pixel, dont `eventID` pour la deduplication avec le serveur. */
  options?: { eventID: string },
): void => {
  try {
    // Le quatrieme argument n'est transmis que s'il existe : `fbq` traite un
    // objet d'options vide differemment d'un argument absent.
    if (options) window.fbq?.("track", event, data, options);
    else window.fbq?.("track", event, data);
  } catch {
    /* mesure indisponible */
  }
};

/** Envoie un evenement propre au produit, absent de la liste standard de Meta. */
export const trackCustom = (event: string, data?: Record<string, unknown>): void => {
  try {
    window.fbq?.("trackCustom", event, data);
  } catch {
    /* mesure indisponible */
  }
};

/** Nomme la session dans Clarity, pour retrouver un enregistrement par etape. */
export const tagSession = (key: string, value: string): void => {
  try {
    window.clarity?.("set", key, value);
  } catch {
    /* mesure indisponible */
  }
};

export function TrackingEvents() {
  const pathname = usePathname();
  const mesure = isMeasuredPath(pathname);
  const first = useRef(true);

  // Page vue a chaque navigation interne. La balise de base en compte deja une
  // au chargement ; sans ce complement, un visiteur qui parcourt trois pages
  // n'en vaudrait qu'une, puisque Next.js ne recharge jamais le document.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // Aucune page vue dans l'application ni dans le panneau proprietaire :
    // voir ./paths.ts. Ces ecrans ne sont pas du trafic de campagne.
    if (!mesure) return;
    trackStandard("PageView");
  }, [pathname, mesure]);


  return null;
}
