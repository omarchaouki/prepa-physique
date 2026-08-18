import { useState } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import Constants from "expo-constants";

import { API_BASE } from "../../src/api/client";
import { useSession } from "../../src/state/session";
import { Button, Card, Screen, SyncBar, Title, useT } from "../../src/components/ui";
import { radius, space, useTheme } from "../../src/theme";
import type { Locale } from "../../src/i18n";

/**
 * Reglages.
 *
 * Deux points meritent l'attention qui leur est donnee ici.
 *
 * La deconnexion efface la base locale. Ce n'est pas une precaution de facade :
 * cette base contient des resultats de tests, donc des donnees de sante, sur
 * des joueurs souvent mineurs. Les laisser sur un telephone dont plus personne
 * n'est responsable serait indefendable. L'avertissement precede l'action, avec
 * mention explicite des saisies non encore envoyees.
 *
 * Les liens legaux pointent vers le site. Google Play exige une politique de
 * confidentialite atteignable depuis l'application elle meme, pas seulement
 * depuis la fiche du magasin.
 */
export default function SettingsScreen() {
  const theme = useTheme();
  const t = useT();
  const { user, locale, setLocale, signOut, pending, sync } = useSession();
  const [busy, setBusy] = useState(false);

  const confirmSignOut = () => {
    const warning =
      pending > 0
        ? `${t("settings.logoutWarning")}\n\n${t("sync.pending", { count: pending })}`
        : t("settings.logoutWarning");

    Alert.alert(t("settings.logout"), warning, [
      { text: t("settings.cancel"), style: "cancel" },
      {
        text: t("settings.logoutConfirm"),
        style: "destructive",
        onPress: () => {
          setBusy(true);
          void signOut().finally(() => setBusy(false));
        },
      },
    ]);
  };

  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <Screen onRefresh={() => void sync()}>
      <Title>{t("settings.title")}</Title>
      <SyncBar />

      <Card style={{ marginBottom: space.lg }}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: theme.textMuted, marginBottom: 6 }}>
          {t("settings.account")}
        </Text>
        <Text style={{ fontSize: 17, fontWeight: "600", color: theme.textPrimary }}>{user?.name}</Text>
        <Text style={{ fontSize: 14, color: theme.textMuted, marginTop: 2 }}>{user?.email}</Text>
        {user?.organizationName ? (
          <Text style={{ fontSize: 14, color: theme.textMuted, marginTop: 2 }}>
            {user.organizationName}
          </Text>
        ) : null}
      </Card>

      <Card style={{ marginBottom: space.lg }}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: theme.textMuted, marginBottom: space.sm }}>
          {t("settings.language")}
        </Text>
        <View style={{ flexDirection: "row", gap: space.sm }}>
          {(["fr", "en"] as Locale[]).map((code) => {
            const active = locale === code;
            return (
              <Pressable
                key={code}
                onPress={() => void setLocale(code)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={code === "fr" ? "Francais" : "English"}
                style={{
                  flex: 1,
                  minHeight: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: radius.md,
                  backgroundColor: active ? theme.accentSoft : theme.sunken,
                  borderWidth: 1,
                  borderColor: active ? theme.accent : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: active ? "700" : "500",
                    color: active ? theme.onAccentSoft : theme.textSecondary,
                  }}
                >
                  {code === "fr" ? "Francais" : "English"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={{ marginBottom: space.lg }}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: theme.textMuted, marginBottom: 6 }}>
          {t("settings.data")}
        </Text>
        <Text style={{ fontSize: 14, color: theme.textSecondary, lineHeight: 20 }}>
          {t("settings.storedOnDevice")}
        </Text>
      </Card>

      <View style={{ gap: space.sm, marginBottom: space.xl }}>
        {[
          { label: t("settings.privacy"), path: "/legal/confidentialite" },
          { label: t("settings.terms"), path: "/legal/conditions" },
        ].map((link) => (
          <Pressable
            key={link.path}
            onPress={() => void Linking.openURL(`${API_BASE}${link.path}`)}
            accessibilityRole="link"
            accessibilityLabel={link.label}
            style={{ minHeight: 48, justifyContent: "center" }}
          >
            <Text style={{ fontSize: 15, color: theme.accent, fontWeight: "600" }}>{link.label}</Text>
          </Pressable>
        ))}
      </View>

      <Button label={t("settings.logout")} onPress={confirmSignOut} variant="danger" busy={busy} />

      <Text style={{ marginTop: space.xl, fontSize: 12, color: theme.textMuted, textAlign: "center" }}>
        {t("settings.version")} {version}
      </Text>
    </Screen>
  );
}
