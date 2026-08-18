import { useColorScheme } from "react-native";

/**
 * Couleurs de l'application mobile.
 *
 * Les valeurs sont reprises telles quelles de globals.css cote web. Un club qui
 * ouvre le site puis l'application doit voir le meme bleu : une teinte
 * approchante fait plus de degats qu'une couleur franchement differente, parce
 * que l'oeil la lit comme un defaut d'impression.
 *
 * Le gris discret vaut #5F6E83 et non #64748B : la valeur precedente donnait un
 * contraste de 4,47 pour 1 sur le fond clair, trois centiemes sous le seuil AA.
 */

/**
 * Forme d'une palette.
 *
 * Declaree avant les valeurs, et non deduite d'elles : avec `as const`,
 * TypeScript figerait chaque couleur en type litteral, et le theme sombre ne
 * pourrait plus reprendre la meme forme sans redeclarer les memes chaines.
 */
export interface Palette {
  page: string;
  panel: string;
  sunken: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  accent: string;
  onAccent: string;
  accentSoft: string;
  onAccentSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
}

const light: Palette = {
  page: "#F6F8FB",
  panel: "#FFFFFF",
  sunken: "#EEF2F7",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#5F6E83",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  accent: "#1E40AF",
  onAccent: "#FFFFFF",
  accentSoft: "#DBEAFE",
  onAccentSoft: "#1E40AF",
  success: "#047857",
  successSoft: "#D1FAE5",
  warning: "#B45309",
  warningSoft: "#FEF3C7",
  danger: "#B91C1C",
  dangerSoft: "#FEE2E2",
};

const dark: Palette = {
  page: "#0A0F1C",
  panel: "#111827",
  sunken: "#0D1424",
  textPrimary: "#E8EEF8",
  textSecondary: "#A3B3CC",
  textMuted: "#7D8EA8",
  border: "#22304D",
  borderStrong: "#33415C",
  accent: "#4F83F1",
  onAccent: "#04122E",
  accentSoft: "#17284B",
  onAccentSoft: "#93C5FD",
  success: "#34D399",
  successSoft: "#10291F",
  warning: "#FBBF24",
  warningSoft: "#3A2C10",
  danger: "#F87171",
  dangerSoft: "#3B1717",
};

/**
 * Echelle d'espacement en multiples de quatre.
 *
 * Android mesure en unites independantes de la densite, et l'echelle de
 * Material Design avance de quatre en quatre. S'en ecarter produit des
 * alignements approximatifs sur les ecrans a forte densite.
 */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = { sm: 8, md: 10, lg: 14, pill: 999 } as const;

/**
 * Taille minimale d'une cible tactile.
 *
 * Quarante huit unites, comme l'exige Material Design. Le seuil d'Apple est de
 * quarante quatre points ; on retient le plus contraignant des deux, d'autant
 * que cette application se manipule d'une main, l'autre tenant un chronometre.
 */
export const TOUCH = 48;

export const useTheme = (): Palette & { scheme: "light" | "dark" } => {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  return { ...(scheme === "dark" ? dark : light), scheme };
};

export const palettes = { light, dark };
