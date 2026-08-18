import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Fira_Code, Fira_Sans } from "next/font/google";
import "./globals.css";
import { RouteProgress } from "@/components/shell/route-progress";
import { SplashGate } from "@/components/shell/splash-gate";
import { getLocale } from "@/lib/i18n/server";

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // L'attribut doit annoncer la langue reellement rendue : c'est ce que lisent
  // les lecteurs d'ecran pour choisir leur voix, et les moteurs pour indexer.
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${firaSans.variable} ${firaCode.variable} ${bricolage.variable}`}>
        <RouteProgress />
        <SplashGate />
        {children}
      </body>
    </html>
  );
}
