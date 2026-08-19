import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  type CSSAnimationProperties,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { useTheme } from "../theme";

/**
 * Le signe de la marque, qui se trace au lancement.
 *
 * Le trace est celui du site : la ligne de pouls, meme geometrie, meme bleu.
 * Une application et un site qui portent deux signes differents ne donnent pas
 * l'impression de deux produits, mais d'un produit mal fini.
 *
 * ---------------------------------------------------------------------------
 * Comment le trace fonctionne
 * ---------------------------------------------------------------------------
 *
 * Un seul `Path`, dont le pointille couvre exactement sa propre longueur. En
 * deplacant l'origine du pointille de cette longueur jusqu'a zero, le trait
 * apparait d'un bout a l'autre. C'est la technique classique du dessin de
 * ligne, et elle ne coute qu'une seule vue native.
 *
 * La version precedente empilait quarante cinq vues, une par point de la
 * courbe. Elle fonctionnait, mais elle faisait porter au fil principal un
 * travail que le fil de composition fait seul.
 *
 * `useAnimatedProps` avec Reanimated garde l'animation sur le fil de
 * composition : elle reste fluide meme pendant l'ouverture de la base locale,
 * qui occupe le fil principal au meme moment.
 */

/** Grille du logo, identique a scripts/generate-assets.py. */
const GRID = 24;

/**
 * Ligne de pouls, ecrite de gauche a droite pour que le trace suive le sens de
 * lecture. Le generateur d'icones la definit dans l'autre sens, ce qui n'a pas
 * d'importance pour une image fixe mais en a une ici.
 */
const PULSE = "M 2 12 L 6 12 L 9 3 L 15 21 L 18 12 L 22 12";

/**
 * Longueur du trace, en unites de grille.
 *
 * Calculee une fois ici plutot que lue par `getTotalLength` : cette methode
 * n'existe pas de facon fiable sur toutes les implementations natives, et une
 * longueur fausse laisse un morceau de trait visible avant le depart.
 */
const LENGTH = [
  [2, 12, 6, 12],
  [6, 12, 9, 3],
  [9, 3, 15, 21],
  [15, 21, 18, 12],
  [18, 12, 22, 12],
].reduce((total, [x1, y1, x2, y2]) => total + Math.hypot(x2 - x1, y2 - y1), 0);

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function AnimatedLogo({
  size = 128,
  colour,
  onDone,
}: {
  size?: number;
  colour?: string;
  onDone?: () => void;
}) {
  const theme = useTheme();
  const ink = colour ?? theme.onAccent;
  const reduced = useReducedMotion();

  // Longueur du trace a l'echelle demandee : c'est la valeur qui doit couvrir
  // exactement le pointille pour que le trait parte invisible.
  const length = LENGTH * (size / GRID);

  // Fraction du trait deja visible, de 0 a 1.
  const drawn = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      // L'utilisateur a demande moins de mouvement au systeme : le signe
      // apparait d'un coup, et la suite s'enchaine sans attendre.
      drawn.value = 1;
      onDone?.();
      return;
    }

    drawn.value = withTiming(
      1,
      // Sortie progressive : rapide au depart, puis ralentie. Un trace a
      // vitesse constante donne l'impression d'une barre de progression.
      { duration: 900, easing: Easing.out(Easing.cubic) },
      (finished) => {
        "worklet";
        // Pas de `runOnJS` : il a disparu de Reanimated 4. Le rappel est
        // declenche par un effet cote React plus bas, ce qui evite d'avoir a
        // franchir la frontiere des fils pour une seule notification.
        if (finished) drawn.value = 1;
      },
    );
  }, [drawn, reduced, onDone]);

  // Fin de l'animation, annoncee depuis le fil principal. Un minuteur suffit :
  // la duree est connue, et faire traverser un rappel depuis le worklet
  // couterait plus cher que ce qu'il rapporte.
  useEffect(() => {
    if (reduced || !onDone) return;
    const timer = setTimeout(onDone, 950);
    return () => clearTimeout(timer);
  }, [reduced, onDone]);

  const animatedProps = useAnimatedProps(() => ({
    // Toute la conversion se fait ici, dans le rappel, comme le veut la regle :
    // aucun adaptateur intermediaire.
    strokeDashoffset: length * (1 - drawn.value),
  }));

  return (
    <View style={{ width: size, height: size }} accessibilityRole="image" accessibilityLabel="Prepa Physique">
      <Svg width={size} height={size} viewBox={`0 0 ${GRID} ${GRID}`}>
        <AnimatedPath
          d={PULSE}
          stroke={ink}
          strokeWidth={GRID * 0.093}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={LENGTH}
          animatedProps={animatedProps}
        />
      </Svg>
    </View>
  );
}

/**
 * Ecran de lancement complet : le signe, le nom, le slogan.
 *
 * L'enchainement suit le sens de lecture. Le trait se dessine, le nom monte,
 * le slogan suit, la maison d'edition ferme la marche. Chaque element attend
 * que le precedent soit installe, ce qui donne une phrase plutot qu'un
 * empilement.
 *
 * Les textes utilisent les animations declaratives de Reanimated, pas des
 * valeurs partagees. La regle est simple : une valeur partagee se justifie
 * quand l'animation suit un geste, lit une mesure ou calcule a chaque image.
 * Ici il n'y a qu'une suite d'images connue d'avance, donc rien qui merite un
 * worklet ni un passage entre les fils.
 */

/** Entree commune aux trois textes : une montee courte avec un fondu. */
const RISE = {
  from: { opacity: 0, transform: [{ translateY: 12 }] },
  to: { opacity: 1, transform: [{ translateY: 0 }] },
} as const;

export function LaunchMark({
  name,
  tagline,
  publisher,
  onDone,
}: {
  name: string;
  tagline: string;
  publisher: string;
  onDone?: () => void;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();

  // Sans mouvement, les durees et les delais tombent a zero plutot que
  // l'animation d'etre retiree : la fonction renvoie toujours la meme forme,
  // ce qui evite une union de types dans le tableau de styles et garde une
  // seule branche de code a relire.
  const entrance = (delay: number): CSSAnimationProperties => ({
    animationName: RISE,
    animationDuration: reduced ? "0ms" : "420ms",
    animationDelay: reduced ? "0ms" : `${delay}ms`,
    animationTimingFunction: "ease-out",
    animationFillMode: "both",
  });

  return (
    <View style={styles.wrap}>
      <AnimatedLogo size={112} onDone={onDone} />

      <Animated.Text
        accessibilityRole="header"
        style={[styles.name, { color: theme.onAccent }, entrance(620)]}
      >
        {name}
      </Animated.Text>

      <Animated.Text style={[styles.tagline, { color: theme.onAccent }, entrance(820)]}>
        {tagline}
      </Animated.Text>

      <Animated.Text style={[styles.publisher, { color: theme.onAccent }, entrance(1020)]}>
        {publisher}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  name: {
    marginTop: 20,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.8,
    textAlign: "center",
  },
  tagline: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "500",
    opacity: 0.9,
    textAlign: "center",
  },
  publisher: {
    marginTop: 28,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
    opacity: 0.7,
    textAlign: "center",
  },
});
