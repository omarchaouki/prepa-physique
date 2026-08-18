import { Tabs } from "expo-router";
import { Text, type ColorValue } from "react-native";

import { useT } from "../../src/components/ui";
import { TOUCH, useTheme } from "../../src/theme";

/**
 * Navigation principale, en barre basse.
 *
 * Trois onglets seulement. Material Design en tolere cinq, mais chaque onglet
 * supplementaire dilue les autres, et cette application n'a que trois endroits
 * ou l'on va vraiment : ce qui se passe aujourd'hui, les equipes, et les
 * reglages.
 *
 * Chaque onglet porte une icone et une etiquette. Une barre d'onglets sans
 * texte oblige a apprendre des pictogrammes, ce qui se paie a chaque nouvel
 * utilisateur.
 */

/**
 * Pictogrammes traces en caracteres geometriques.
 *
 * Aucun emoji : leur rendu depend de la police du systeme, ils changent d'un
 * telephone a l'autre et ne suivent pas la couleur de l'onglet actif. Aucune
 * bibliotheque d'icones non plus, pour ne pas ajouter un module natif au seul
 * profit de trois symboles.
 */
function Glyph({ shape, colour }: { shape: "pulse" | "squad" | "gear"; colour: ColorValue }) {
  const symbol = shape === "pulse" ? "◗" : shape === "squad" ? "◍" : "⚙";
  return (
    <Text style={{ fontSize: 20, color: colour, lineHeight: 24 }} allowFontScaling={false}>
      {symbol}
    </Text>
  );
}

export default function AppTabs() {
  const theme = useTheme();
  const t = useT();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.panel,
          borderTopColor: theme.border,
          minHeight: TOUCH + 12,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.dashboard"),
          tabBarIcon: ({ color }) => <Glyph shape="pulse" colour={color} />,
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: t("nav.teams"),
          tabBarIcon: ({ color }) => <Glyph shape="squad" colour={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("nav.settings"),
          tabBarIcon: ({ color }) => <Glyph shape="gear" colour={color} />,
        }}
      />
    </Tabs>
  );
}
