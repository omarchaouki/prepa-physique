"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

/**
 * Relie l'attente d'un formulaire a la barre de progression du haut de page.
 *
 * Pourquoi ce composant existe plutot qu'un ecouteur global sur `submit` :
 * un ecouteur ne sait que quand une action part, jamais quand elle revient.
 * La barre restait donc bloquee sur un mot de passe refuse, puisqu'une erreur
 * reaffiche la meme adresse et ne declenche aucun changement de route.
 *
 * `useFormStatus` connait les deux moments. Il passe a `true` au clic et
 * revient a `false` quand l'action a repondu, que la reponse soit une erreur
 * ou une redirection deja suivie. La barre suit exactement cette duree, ce qui
 * la rend impossible a bloquer.
 *
 * A poser directement dans un `form`, ou ce statut est lisible :
 *
 *   <form action={formAction}>
 *     <FormProgress />
 *     ...
 *   </form>
 */
export function FormProgress() {
  const { pending } = useFormStatus();
  const wasPending = useRef(false);

  useEffect(() => {
    if (pending === wasPending.current) return;
    wasPending.current = pending;
    window.dispatchEvent(new Event(pending ? "route-progress:start" : "route-progress:done"));
  }, [pending]);

  // La barre se termine aussi si le composant disparait pendant l'attente,
  // par exemple quand une redirection remplace la page qui portait le formulaire.
  useEffect(
    () => () => {
      if (wasPending.current) window.dispatchEvent(new Event("route-progress:done"));
    },
    [],
  );

  return null;
}
