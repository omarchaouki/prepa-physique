import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Coque Android.
 *
 * L'application est rendue cote serveur : il n'y a rien a embarquer dans l'APK
 * a part la coque native. Celle ci pointe vers l'adresse de production, tout le
 * reste vient du serveur, ce qui veut dire qu'une mise a jour de l'application
 * ne demande jamais de redistribuer l'APK.
 *
 * L'adresse est fixee a la compilation :
 *   APP_URL=https://prepa.mondomaine.com npx cap sync android
 *
 * Le dossier www ne contient que la page affichee quand le serveur est
 * injoignable. C'est le seul contenu reellement embarque.
 */

const serverUrl = process.env.APP_URL?.trim();

if (!serverUrl) {
  console.warn(
    "[capacitor] APP_URL non defini, l'APK pointera vers http://localhost:3000 et ne servira qu'en developpement.",
  );
}

const url = serverUrl || "http://localhost:3000";
const isPlainHttp = url.startsWith("http://");

const config: CapacitorConfig = {
  appId: "ma.lamsaa.prepaphysique",
  appName: "Prepa Physique",
  webDir: "www",

  server: {
    url,
    // Le trafic en clair n'est autorise que pour une adresse http, typiquement
    // un serveur de developpement sur le reseau local. En production l'adresse
    // est en https et cette permission reste fermee.
    cleartext: isPlainHttp,
    androidScheme: "https",
    // Page locale affichee si le serveur ne repond pas, a la place du message
    // d'erreur brut du navigateur.
    errorPath: "offline.html",
  },

  android: {
    // Les gestes de navigation du systeme restent prioritaires.
    allowMixedContent: isPlainHttp,
    captureInput: true,
    webContentsDebuggingEnabled: isPlainHttp,
  },

  plugins: {
    SplashScreen: {
      /*
       * L'interface vient du serveur : le premier rendu peut demander deux a
       * trois secondes sur un reseau de terrain. L'image de demarrage est donc
       * retiree par l'application elle meme, des la premiere peinture, via
       * src/components/shell/splash-gate.tsx.
       *
       * launchAutoHide reste a true, et launchShowDuration sert de filet : si le
       * serveur ne repond pas, l'image se retire au bout de trois secondes et
       * laisse voir l'ecran hors ligne. Avec launchAutoHide a false, une panne de
       * serveur figerait le telephone sur le logo, sans aucune issue.
       */
      launchShowDuration: 3000,
      launchAutoHide: true,
      launchFadeOutDuration: 250,
      backgroundColor: "#1E40AF",
      androidScaleType: "CENTER_CROP",
      // Le logo seul ne dit pas si quelque chose se passe : le rouet fait
      // l'attente, et c'est lui qui manquait au demarrage.
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#FFFFFF",
      splashFullScreen: false,
      splashImmersive: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#1E40AF",
    },
  },
};

export default config;
