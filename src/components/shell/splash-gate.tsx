"use client";

import { useEffect } from "react";

/**
 * Retire l'ecran de demarrage natif quand l'application est reellement affichee.
 *
 * Le probleme resolu ici : la coque Android n'embarque pas l'interface, elle
 * charge l'adresse du serveur. Jusqu'a present l'image de demarrage disparaissait
 * apres un delai fixe de 900 ms, alors que le premier rendu peut demander deux ou
 * trois secondes sur un reseau de terrain. L'utilisateur voyait donc une page
 * blanche entre les deux.
 *
 * Desormais l'image reste jusqu'a ce que cette ligne s'execute, c'est a dire
 * jusqu'a la premiere peinture de l'application. Le delai de securite reste
 * defini dans capacitor.config.ts : si le serveur ne repond pas du tout, l'image
 * se retire quand meme et laisse voir l'ecran hors ligne, plutot que de figer le
 * telephone sur un logo.
 *
 * Sur le web, ou il n'y a pas de coque, ce composant ne fait rien.
 */
export function SplashGate() {
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (cancelled || !Capacitor.isNativePlatform()) return;

        const { SplashScreen } = await import("@capacitor/splash-screen");
        // Une trame d'attente avant de retirer l'image : la masquer avant la
        // premiere peinture ferait clignoter un ecran blanc entre les deux.
        requestAnimationFrame(() => {
          void SplashScreen.hide();
        });
      } catch {
        // Plugin absent ou execution hors coque : rien a masquer.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
