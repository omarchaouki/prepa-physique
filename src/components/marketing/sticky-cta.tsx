"use client";

import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";

/**
 * Rappel du bouton d'inscription, en bas d'ecran sur telephone.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi il n'est pas toujours la
 * ---------------------------------------------------------------------------
 *
 * Une barre collee en permanence mange une bande de soixante dix pixels sur un
 * ecran qui n'en a que six cents, et elle recouvre le formulaire au moment
 * precis ou le visiteur le remplit. Elle n'apparait donc que lorsque le
 * formulaire n'est plus visible, c'est a dire exactement quand elle sert a
 * quelque chose : ramener quelqu'un parti lire les objections.
 *
 * L'observation se fait par `IntersectionObserver` et non au defilement : un
 * ecouteur de defilement se declenche des dizaines de fois par seconde et fait
 * saccader la page sur un telephone d'entree de gamme, alors que l'observateur
 * ne reveille le fil principal qu'au franchissement du seuil.
 *
 * Le bouton n'est qu'une ancre. Il ne soumet rien, ne pose aucun etat, et
 * fonctionne meme si le reste du script de la page a echoue.
 */
export function StickyCta({
  targetId,
  label,
  watchId,
}: {
  /** Element vers lequel le bouton fait defiler. */
  targetId: string;
  label: string;
  /** Element dont la visibilite decide de l'affichage de la barre. */
  watchId: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const watched = document.getElementById(watchId);
    if (!watched) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      // Un peu de marge basse : la barre ne doit pas clignoter quand le bas du
      // formulaire affleure le bord de l'ecran.
      { rootMargin: "-80px 0px -80px 0px" },
    );

    observer.observe(watched);
    return () => observer.disconnect();
  }, [watchId]);

  return (
    <div
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 px-4 pt-3 transition-transform duration-300"
      style={{
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        background: "color-mix(in srgb, var(--surface-page) 92%, transparent)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid var(--border-subtle)",
        transform: visible ? "translateY(0)" : "translateY(120%)",
      }}
      // Retire de l'ordre de tabulation et de la voix quand elle est repliee :
      // une barre hors ecran qui garde le focus pieger le clavier.
      aria-hidden={!visible}
      inert={!visible ? true : undefined}
    >
      <a href={`#${targetId}`} className="btn btn-primary btn-lg w-full">
        {label}
        <ArrowDown size={16} aria-hidden="true" />
      </a>
    </div>
  );
}
