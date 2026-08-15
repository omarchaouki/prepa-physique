import type { Metadata, Viewport } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import "./globals.css";
import { RouteProgress } from "@/components/shell/route-progress";

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fira-sans",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${firaSans.variable} ${firaCode.variable}`}>
        <RouteProgress />
        {children}
      </body>
    </html>
  );
}
