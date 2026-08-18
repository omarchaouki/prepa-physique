import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, View } from "react-native";

import { useTheme } from "../theme";

/**
 * Le signe de la marque, qui se trace au lancement.
 *
 * La courbe de vitesse d'un sprint se dessine de gauche a droite, puis le point
 * de mesure apparait a son extremite. C'est le geste du chronometre : on lance,
 * la vitesse monte, on arrete.
 *
 * Trois contraintes tenues ici :
 *
 * 1. Aucune bibliotheque d'animation. `Animated` est integre a React Native, et
 *    `useNativeDriver` fait tourner le mouvement sur le fil de composition :
 *    l'animation reste fluide meme pendant l'ouverture de la base locale, qui
 *    occupe le fil principal au meme moment.
 * 2. `prefers-reduced-motion` est respecte. Un utilisateur qui a demande moins
 *    de mouvement au systeme voit le signe apparaitre en fondu, sans trace.
 * 3. L'animation ne retarde rien. Elle habille une attente qui existe de toute
 *    facon, elle ne la cree pas : l'ecran suivant s'affiche des qu'il est pret,
 *    meme si le trace n'est pas termine.
 *
 * Le trace se fait sans SVG, en revelant progressivement un masque au dessus de
 * la courbe. Cela evite d'ajouter react-native-svg pour une seule vue, et un
 * module natif de moins est un module natif qui ne cassera pas a la prochaine
 * montee de version.
 */

const SIZE = 128;
/** Grille du logo, identique a celle de scripts/generate-assets.py. */
const GRID = 24;

/** Points de la courbe, echantillonnes une fois pour toutes. */
const CURVE = ((): Array<{ x: number; y: number }> => {
  const bezier = (
    p0: [number, number],
    p1: [number, number],
    p2: [number, number],
    p3: [number, number],
    steps: number,
  ) => {
    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const u = 1 - t;
      points.push({
        x: u ** 3 * p0[0] + 3 * u ** 2 * t * p1[0] + 3 * u * t ** 2 * p2[0] + t ** 3 * p3[0],
        y: u ** 3 * p0[1] + 3 * u ** 2 * t * p1[1] + 3 * u * t ** 2 * p2[1] + t ** 3 * p3[1],
      });
    }
    return points;
  };
  return bezier([4.4, 19.4], [6.2, 10.2], [13.6, 6.6], [19.3, 6.4], 44);
})();

export function AnimatedLogo({
  size = SIZE,
  colour,
  onDone,
}: {
  size?: number;
  colour?: string;
  onDone?: () => void;
}) {
  const theme = useTheme();
  const ink = colour ?? theme.onAccent;

  const progress = useRef(new Animated.Value(0)).current;
  const dot = useRef(new Animated.Value(0)).current;

  const unit = size / GRID;
  const stroke = Math.max(2, size * 0.082);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const reduced = await AccessibilityInfo.isReduceMotionEnabled().catch(() => false);
      if (cancelled) return;

      if (reduced) {
        progress.setValue(1);
        Animated.timing(dot, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start(() => onDone?.());
        return;
      }

      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 620,
          // Sortie progressive : la courbe se trace vite puis ralentit, comme
          // la vitesse qu'elle represente.
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
        Animated.spring(dot, {
          toValue: 1,
          friction: 5,
          tension: 140,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished && !cancelled) onDone?.();
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [progress, dot, onDone]);

  const last = CURVE[CURVE.length - 1];

  return (
    <View
      style={{ width: size, height: size }}
      accessibilityRole="image"
      accessibilityLabel="Lamsaa"
    >
      {/* Axe du temps */}
      <View
        style={[
          styles.baseline,
          {
            left: 3 * unit,
            top: 20.2 * unit,
            width: 18 * unit,
            height: Math.max(1, stroke * 0.3),
            borderRadius: stroke,
            backgroundColor: ink,
            opacity: 0.42,
          },
        ]}
      />

      {/*
        La courbe est faite de disques. Chacun apparait quand la progression
        depasse sa position, ce qui donne un trace continu de gauche a droite.
        `useNativeDriver` n'anime que l'opacite et l'echelle, jamais la mise en
        page : c'est ce qui garde le mouvement sur le fil de composition.
      */}
      {CURVE.map((point, index) => {
        const at = index / (CURVE.length - 1);
        const appear = progress.interpolate({
          inputRange: [Math.max(0, at - 0.06), at, 1],
          outputRange: [0, 1, 1],
          extrapolate: "clamp",
        });
        return (
          <Animated.View
            key={index}
            style={{
              position: "absolute",
              left: point.x * unit - stroke / 2,
              top: point.y * unit - stroke / 2,
              width: stroke,
              height: stroke,
              borderRadius: stroke / 2,
              backgroundColor: ink,
              opacity: appear,
              transform: [{ scale: appear }],
            }}
          />
        );
      })}

      {/* Point de mesure : l'anneau du chronometre qui s'arrete. */}
      <Animated.View
        style={{
          position: "absolute",
          left: last.x * unit - stroke * 1.3,
          top: last.y * unit - stroke * 1.3,
          width: stroke * 2.6,
          height: stroke * 2.6,
          borderRadius: stroke * 1.3,
          borderWidth: stroke * 0.78,
          borderColor: ink,
          opacity: dot,
          transform: [{ scale: dot }],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  baseline: {
    position: "absolute",
    ...Platform.select({ default: {} }),
  },
});
