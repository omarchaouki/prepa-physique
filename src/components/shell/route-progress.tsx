"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Barre de progression de navigation, affichee en haut de l'ecran.
 *
 * Elle demarre au clic, pas a l'arrivee de la reponse : c'est ce qui donne le
 * sentiment que l'application repond immediatement. Elle progresse par paliers
 * decroissants, sans jamais atteindre 100% tant que la nouvelle page n'est pas
 * affichee, puis se termine d'un coup.
 *
 * Evenement utilitaire pour les navigations declenchees par du code :
 *   window.dispatchEvent(new Event("route-progress:start"))
 */

const START_EVENT = "route-progress:start";
const DONE_EVENT = "route-progress:done";

/** Securite : si une navigation n'aboutit jamais, la barre ne reste pas bloquee. */
const MAX_DURATION_MS = 12_000;

function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeOut = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    if (safety.current) clearTimeout(safety.current);
    if (fadeOut.current) clearTimeout(fadeOut.current);
    timer.current = null;
    safety.current = null;
    fadeOut.current = null;
  }, []);

  const start = useCallback(() => {
    clearTimers();
    setVisible(true);
    setProgress(8);

    // Progression asymptotique : rapide au debut, de plus en plus lente,
    // plafonnee a 90% tant que la page n'est pas la.
    timer.current = setInterval(() => {
      setProgress((current) => {
        if (current >= 90) return current;
        const step = current < 35 ? 9 : current < 65 ? 4 : 1.5;
        return Math.min(90, current + step);
      });
    }, 180);

    safety.current = setTimeout(() => {
      clearTimers();
      setProgress(100);
      fadeOut.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    }, MAX_DURATION_MS);
  }, [clearTimers]);

  const done = useCallback(() => {
    clearTimers();
    setProgress(100);
    fadeOut.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 280);
  }, [clearTimers]);

  // La nouvelle page est affichee des que l'adresse a change.
  useEffect(() => {
    if (visible) done();
    // On ne veut reagir qu'au changement d'adresse, pas a l'etat interne.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => {
    const currentUrl = () => `${window.location.pathname}${window.location.search}`;

    const onClick = (event: MouseEvent) => {
      // On ignore les clics enrichis, qui ouvrent dans un autre onglet.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Lien vers la page courante : rien ne va changer, inutile d'animer.
      if (`${url.pathname}${url.search}` === currentUrl()) return;

      start();
    };

    // Les formulaires qui declenchent une action serveur suivie d'une
    // redirection passent par ici, pas par un clic sur un lien.
    const onSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement | null;
      if (!form || form.dataset.noProgress === "true") return;
      start();
    };

    const onStart = () => start();
    const onDone = () => done();

    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("submit", onSubmit, { capture: true });
    window.addEventListener(START_EVENT, onStart);
    window.addEventListener(DONE_EVENT, onDone);

    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("submit", onSubmit, { capture: true });
      window.removeEventListener(START_EVENT, onStart);
      window.removeEventListener(DONE_EVENT, onDone);
      clearTimers();
    };
  }, [start, done, clearTimers]);

  if (!visible) return null;

  return (
    <div
      className="route-progress"
      style={{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1 }}
      role="progressbar"
      aria-label="Chargement de la page"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    />
  );
}

export function RouteProgress() {
  // useSearchParams impose une frontiere Suspense, sinon les pages statiques
  // basculeraient en rendu dynamique a cause de ce seul composant.
  return (
    <Suspense fallback={null}>
      <RouteProgressBar />
    </Suspense>
  );
}
