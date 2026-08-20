import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Fira_Code, Fira_Sans } from "next/font/google";
import "./globals.css";
import { RouteProgress } from "@/components/shell/route-progress";
import { SplashGate } from "@/components/shell/splash-gate";
import { getLocale, getMarketingLocale } from "@/lib/i18n/server";
import { getRegion } from "@/lib/region";
import { getTracking } from "@/lib/tracking";
import { ConsentGate } from "@/components/tracking/consent";
import { TrackingEvents } from "@/components/tracking/events";

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fira-sans",
  display: "swap",
});

/**
 * Police d'affichage, reservee aux titres de la page publique.
 *
 * Elle ne sert jamais dans l'application : un tableau de bord se lit mieux dans
 * une graisse neutre, alors qu'une page commerciale a besoin d'une voix. Les
 * deux fichiers ne sont donc jamais charges sur les memes ecrans.
 */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-fira-code",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prepa Physique",
  description:
    "Plateforme de preparation physique football : tests, profils joueurs, analyses et recommandations basees sur la litterature scientifique.",
  /**
   * Adresse absolue des images de partage. Sans elle, une carte de partage
   * envoyee sur WhatsApp ou LinkedIn pointe vers localhost et n'affiche rien.
   * APP_URL est deja la variable qui porte l'adresse publique, celle gravee dans
   * la coque Android.
   */
  metadataBase: new URL(process.env.APP_URL?.trim() || "http://localhost:3000"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1c" },
  ],
};

/**
 * Applique le theme choisi avant le premier rendu pour eviter le clignotement.
 * Le script est volontairement minimal et synchrone.
 */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("pp-theme");
    if (stored === "dark" || stored === "light") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (e) {}
})();
`;

/**
 * Repli des animations d'apparition au defilement.
 *
 * Il ne fait rien la ou le navigateur sait faire : Chrome et Edge appliquent
 * `animation-timeline: view()`, decrit dans globals.css, et le script se retire
 * aussitot. Il ne prend la main que dans Safari et Firefox, qui l'ignorent, et
 * qui representent la majorite du trafic venu d'un telephone.
 *
 * Trois raisons pour lesquelles il est ici, en tete du document, plutot que
 * dans un composant client :
 *
 *   1. Il pose l'attribut avant le premier rendu. Un composant React le
 *      poserait apres l'hydratation, et les blocs deja visibles a l'ecran
 *      clignoteraient : affiches, caches, puis reaffiches.
 *   2. Il ne depend pas de l'hydratation. Si le paquet JavaScript de la page
 *      echoue, l'attribut n'a jamais ete pose et le contenu reste visible.
 *   3. C'est lui qui pose l'attribut et lui qui branche l'observateur. Les deux
 *      ne peuvent donc pas etre desynchronises, ce qui est le seul scenario ou
 *      du contenu resterait invisible.
 *
 * L'observation est rejouee a chaque ajout de noeud, sinon une navigation
 * interne d'une page publique a l'autre laisserait les nouveaux blocs caches
 * et jamais observes.
 */
const revealScript = `
(function () {
  try {
    var root = document.documentElement;
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.CSS && CSS.supports && CSS.supports("animation-timeline", "view()")) return;
    if (!("IntersectionObserver" in window)) return;

    root.setAttribute("data-reveal", "js");

    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add("est-visible");
          io.unobserve(entries[i].target);
        }
      }
      // La marge basse retarde le declenchement de dix huit pour cent de la
      // hauteur, pour que l'apparition se joue la ou le regard se pose et non
      // au ras du bord inferieur. Elle correspond a la plage reglee sur la
      // classe reveal dans globals.css : les deux chemins, natif et
      // JavaScript, doivent donner le meme ressenti, sinon la page bouge
      // differemment selon le navigateur.
    }, { rootMargin: "0px 0px -18% 0px", threshold: 0.06 });

    var scan = function () {
      var nodes = document.querySelectorAll(".reveal:not([data-vu]), .rule-draw:not([data-vu]), .shot:not([data-vu]), .unveil:not([data-vu]), .cascade:not([data-vu])");
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].setAttribute("data-vu", "");
        io.observe(nodes[i]);
      }
    };

    var boot = function () {
      scan();
      new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
    };

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  } catch (e) {
    document.documentElement.removeAttribute("data-reveal");
  }
})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // L'attribut doit annoncer la langue reellement rendue : c'est ce que lisent
  // les lecteurs d'ecran pour choisir leur voix, et les moteurs pour indexer.
  //
  // Les balises de mesure sont montees ici et non sur la seule page publique :
  // la conversion se produit apres la redirection vers l'application, donc le
  // pixel doit y etre charge lui aussi, sans quoi l'inscription ne serait
  // jamais comptee.
  const [locale, marketingLocale, tracking, region] = await Promise.all([
    getLocale(),
    getMarketingLocale(),
    getTracking(),
    getRegion(),
  ]);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: revealScript }} />
      </head>
      <body className={`${firaSans.variable} ${firaCode.variable} ${bricolage.variable}`}>
        <RouteProgress />
        <SplashGate />
        {children}
        <ConsentGate tracking={tracking} region={region} locale={marketingLocale} />
        <TrackingEvents />
      </body>
    </html>
  );
}
