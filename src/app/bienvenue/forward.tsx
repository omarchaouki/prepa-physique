"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { tagSession, trackStandard } from "@/components/tracking/events";

/**
 * Declenche la conversion, puis passe la main a l'application.
 *
 * L'ordre compte. L'evenement part avant la navigation : `router.replace`
 * demonte cet arbre, et un appel au pixel lance apres coup se perdrait une fois
 * sur deux selon la vitesse du rendu.
 *
 * `replace` et non `push` : cette page ne doit pas exister dans l'historique.
 * Un preparateur qui appuie sur retour depuis son tableau de bord doit revenir
 * a la page publique, pas repasser par un ecran de bienvenue qui le renverrait
 * aussitot d'ou il vient.
 *
 * Le garde `parti` protege du double montage que React declenche en mode strict
 * pendant le developpement : sans lui, deux evenements partiraient a chaque
 * inscription testee en local.
 */
export function Forward({
  destination,
  eventId,
}: {
  destination: string;
  /** Identifiant engendre par le serveur, absent si la page est visitee seule. */
  eventId: string | null;
}) {
  const router = useRouter();
  const parti = useRef(false);

  useEffect(() => {
    if (parti.current) return;
    parti.current = true;

    // Sans identifiant, aucune mesure. Voir le commentaire de la page : une
    // adresse recopiee ne doit pas compter un second prospect.
    if (eventId) {
      const options = { eventID: eventId };
      trackStandard("CompleteRegistration", { content_name: "inscription", status: true }, options);
      trackStandard("Lead", { content_name: "inscription" }, options);
      tagSession("conversion", "inscription");
    }

    router.replace(destination);
  }, [router, destination, eventId]);

  return null;
}
