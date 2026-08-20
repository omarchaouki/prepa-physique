import { Cairo } from "next/font/google";

/**
 * Mise en page de la page publicitaire.
 *
 * Elle n'existe que pour charger la police arabe. Celle ci n'est pas dans la
 * mise en page racine a dessein : elle pese plusieurs dizaines de kilooctets et
 * ne sert a aucun ecran de l'application connectee, qui n'est pas traduite en
 * arabe. La charger partout ferait payer ce poids a chaque tableau de bord
 * ouvert par un preparateur francophone.
 *
 * `display: swap` : le texte s'affiche immediatement dans la police de repli
 * puis change. Sur une page de vente, un titre invisible pendant une seconde
 * coute plus cher qu'un changement de police visible.
 */
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-arabic",
  display: "swap",
});

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <div className={cairo.variable}>{children}</div>;
}
