import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { openDb } from "../../src/db";
import { getTeam, type TeamRow } from "../../src/db/queries";
import { enqueue, newId, readCatalog, type Catalog } from "../../src/sync/engine";
import { useSession } from "../../src/state/session";
import { Button, Field, Screen, Title, useT } from "../../src/components/ui";
import { radius, space, useTheme } from "../../src/theme";

/**
 * Creation d'une passation, utilisable sans reseau.
 *
 * L'identifiant est genere sur le telephone. C'est ce qui permet de creer la
 * passation, d'y saisir des resultats et de tout envoyer plus tard en un seul
 * bloc coherent : sans identifiant local, il faudrait attendre la reponse du
 * serveur avant de pouvoir saisir la premiere valeur, donc attendre le reseau.
 */
export default function NewSessionScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const theme = useTheme();
  const t = useT();
  const router = useRouter();
  const { locale, refreshPending, sync, online } = useSession();

  const [team, setTeam] = useState<TeamRow | null>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void (async () => {
        const [current, loaded] = await Promise.all([getTeam(teamId), readCatalog()]);
        if (!alive) return;
        setTeam(current);
        setCatalog(loaded);
        setName((existing) =>
          existing ||
          new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
            day: "numeric",
            month: "long",
          }).format(new Date()),
        );
      })();
      return () => {
        alive = false;
      };
    }, [teamId, locale]),
  );

  const toggle = (key: string) =>
    setSelected((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );

  const create = async () => {
    if (busy) return;
    if (!name.trim()) {
      setError(t("common.required"));
      return;
    }
    if (selected.length === 0) {
      setError(t("session.chooseTest"));
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const id = newId();
      const date = new Date();
      const payload = {
        id,
        teamId,
        name: name.trim(),
        date: date.toISOString(),
        testKeys: selected,
        surface: null,
        weather: null,
        temperatureC: null,
        notes: null,
      };

      // Ecriture locale d'abord : la passation existe pour l'utilisateur avant
      // d'exister pour le serveur. `pending` la marque comme non confirmee.
      const db = await openDb();
      await db.runAsync(
        `INSERT OR REPLACE INTO sessions
           (id, teamId, date, name, testKeys, surface, weather, temperatureC, notes, isLocked, updatedAt, pending)
         VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, 0, ?, 1)`,
        id,
        teamId,
        payload.date,
        payload.name,
        selected.join(","),
        payload.date,
      );

      await enqueue("session.upsert", payload);
      await refreshPending();
      if (online) void sync({ silent: true });

      router.replace(`/session/${id}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: t("session.new"), headerShown: true }} />
      <Screen edges={[]} scroll={false}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 120 }}>
          <Title sub={team?.name}>{t("session.new")}</Title>

          <Field
            label={t("session.name")}
            value={name}
            onChangeText={setName}
            error={error}
            editable={!busy}
            returnKeyType="done"
          />

          <Text style={{ fontSize: 13, fontWeight: "600", color: theme.textSecondary, marginBottom: space.sm }}>
            {t("session.chooseTest")}
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
            {(catalog?.tests ?? []).map((test) => {
              const active = selected.includes(test.key);
              return (
                <Pressable
                  key={test.key}
                  onPress={() => toggle(test.key)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={test.name[locale]}
                  style={{
                    minHeight: 44,
                    justifyContent: "center",
                    paddingHorizontal: space.lg,
                    borderRadius: radius.pill,
                    backgroundColor: active ? theme.accentSoft : theme.sunken,
                    borderWidth: 1,
                    borderColor: active ? theme.accent : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: active ? "700" : "500",
                      color: active ? theme.onAccentSoft : theme.textSecondary,
                    }}
                  >
                    {test.shortName[locale]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: space.lg,
            backgroundColor: theme.panel,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          <Button label={t("session.create")} onPress={() => void create()} busy={busy} />
        </View>
      </Screen>
    </>
  );
}
