import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
 * Les pictogrammes viennent de `@expo/vector-icons`, livre avec Expo. C'est une
 * police d'icones, donc aucune vue supplementaire, aucun module natif a
 * installer, et la couleur suit celle de l'onglet actif.
 *
 * La version precedente dessinait des caracteres unicode. Ils s'affichaient
 * differemment d'un telephone a l'autre selon la police du systeme, et donnaient
 * a la barre un aspect bricole. C'etait le bon reflexe pour eviter une
 * dependance, mais la dependance etait deja la.
 *
 * Chaque onglet porte une icone et une etiquette. Une barre sans texte oblige a
 * apprendre des pictogrammes, ce qui se paie a chaque nouvel utilisateur.
 */
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
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.dashboard"),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "chart-line" : "chart-line-variant"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: t("nav.teams"),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "account-group" : "account-group-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("nav.settings"),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "cog" : "cog-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
