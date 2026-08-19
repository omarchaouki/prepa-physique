import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Stack, useFocusEffect, useLocalSearchParams } from "expo-router";

import { openDb } from "../../src/db";
import { getSession, getSessionEntries, listPlayers, type PlayerRow, type SessionRow } from "../../src/db/queries";
import { enqueue, newId, readCatalog, type TestSpec } from "../../src/sync/engine";
import { useSession } from "../../src/state/session";
import { Badge, Button, Empty, Screen, Title, useT } from "../../src/components/ui";
import { TOUCH, radius, space, useTheme } from "../../src/theme";

/**
 * Saisie des resultats d'une passation.
 *
 * C'est l'ecran qui justifie toute l'architecture hors ligne : il se remplit un
 * chronometre dans l'autre main, au bord d'un terrain, souvent sans reseau.
 *
 * Trois decisions d'usage :
 *
 * 1. Rien n'est envoye directement. Chaque enregistrement depose une operation
 *    dans la file locale et ecrit immediatement la valeur en base du telephone.
 *    L'utilisateur voit sa saisie conservee, que le reseau existe ou non.
 * 2. Les valeurs calculees, elles, viennent du serveur a la synchronisation.
 *    Le telephone ne recalcule pas un profil force vitesse : ces formules
 *    vivent en un seul endroit, et les dupliquer creerait deux verites.
 * 3. Le clavier est numerique et le champ suivant s'atteint sans quitter la
 *    main du chronometre. Saisir vingt joueurs ne doit pas demander vingt
 *    allers retours vers l'ecran.
 */
export default function SessionEntryScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const theme = useTheme();
  const t = useT();
  const { locale, refreshPending, sync, online } = useSession();

  const [session, setSession] = useState<SessionRow | null>(null);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [tests, setTests] = useState<TestSpec[]>([]);
  const [testKey, setTestKey] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const inputs = useRef<Record<string, TextInput | null>>({});

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void (async () => {
        const current = await getSession(sessionId);
        if (!current || !alive) return;
        const [squad, catalog] = await Promise.all([listPlayers(current.teamId), readCatalog()]);
        if (!alive) return;

        const keys = current.testKeys.split(",").map((key) => key.trim()).filter(Boolean);
        const available = (catalog?.tests ?? []).filter((test) => keys.includes(test.key));

        setSession(current);
        setPlayers(squad);
        setTests(available);
        const first = available[0]?.key ?? null;
        setTestKey((existing) => existing ?? first);
        if (first) setValues(await getSessionEntries(sessionId, first));
      })();
      return () => {
        alive = false;
      };
    }, [sessionId]),
  );

  const test = useMemo(() => tests.find((item) => item.key === testKey) ?? null, [tests, testKey]);

  const chooseTest = async (key: string) => {
    setTestKey(key);
    setNotice(null);
    setValues(await getSessionEntries(sessionId, key));
  };

  const setValue = (playerId: string, field: string, value: string) => {
    setValues((current) => ({
      ...current,
      [playerId]: { ...(current[playerId] ?? {}), [field]: value },
    }));
  };

  const save = async () => {
    if (!session || !test || saving) return;
    setSaving(true);
    setNotice(null);

    try {
      const entries = Object.entries(values)
        .map(([playerId, fields]) => ({
          playerId,
          values: Object.fromEntries(
            Object.entries(fields).filter(([, value]) => String(value).trim() !== ""),
          ),
        }))
        .filter((entry) => Object.keys(entry.values).length > 0);

      if (entries.length === 0) {
        setSaving(false);
        return;
      }

      // Ecriture locale immediate : la saisie est conservee avant meme qu'une
      // connexion existe. L'identifiant est genere ici, ce qui rend le renvoi
      // idempotent cote serveur.
      const db = await openDb();
      const now = new Date().toISOString();
      for (const entry of entries) {
        const existing = await db.getFirstAsync<{ id: string }>(
          "SELECT id FROM results WHERE sessionId = ? AND playerId = ? AND testKey = ?",
          sessionId,
          entry.playerId,
          test.key,
        );
        await db.runAsync(
          `INSERT OR REPLACE INTO results
             (id, sessionId, playerId, teamId, testKey, date, rawJson, computedJson, quality, updatedAt, pending)
           VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT computedJson FROM results WHERE id = ?), '{}'), 'GOOD', ?, 1)`,
          existing?.id ?? newId(),
          sessionId,
          entry.playerId,
          session.teamId,
          test.key,
          session.date,
          JSON.stringify(entry.values),
          existing?.id ?? "",
          now,
        );
      }

      await enqueue("results.save", { sessionId, testKey: test.key, entries });
      await refreshPending();

      setNotice(online ? t("session.saved") : t("session.savedQueued"));
      if (online) void sync({ silent: true });
    } finally {
      setSaving(false);
    }
  };

  if (!session) {
    return (
      <Screen>
        <Empty message={t("common.loading")} />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: session.name, headerShown: true }} />
      <Screen edges={[]} scroll={false}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 140 }}>
          <Title sub={session.teamName}>{t("session.entry")}</Title>

          {/* Choix du test, en bande horizontale : une passation en porte
              rarement plus de six, et un menu deroulant couterait un geste. */}
          {tests.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: space.sm, paddingBottom: space.lg }}
            >
              {tests.map((item) => {
                const active = item.key === testKey;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => void chooseTest(item.key)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    style={{
                      minHeight: 44,
                      justifyContent: "center",
                      paddingHorizontal: space.lg,
                      borderRadius: radius.pill,
                      backgroundColor: active ? theme.accent : theme.sunken,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: active ? theme.onAccent : theme.textSecondary,
                      }}
                    >
                      {item.shortName[locale]}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : null}

          {test ? (
            <>
              <Text style={{ fontSize: 13, color: theme.textMuted, marginBottom: space.lg, lineHeight: 19 }}>
                {test.protocol[locale]}
              </Text>

              {players.map((player) => (
                <View
                  key={player.id}
                  style={{
                    paddingVertical: space.md,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm, marginBottom: space.sm }}>
                    <Text style={{ flex: 1, fontSize: 16, fontWeight: "600", color: theme.textPrimary }}>
                      {player.lastName} {player.firstName}
                    </Text>
                    {player.status !== "ACTIVE" ? (
                      <Badge label={player.status} tone={player.status === "INJURED" ? "danger" : "warning"} />
                    ) : null}
                  </View>

                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
                    {test.fields
                      .filter((field) => field.type === "number")
                      .slice(0, 4)
                      .map((field) => (
                        <View key={field.key} style={{ flexGrow: 1, flexBasis: "44%" }}>
                          <Text style={{ fontSize: 12, color: theme.textMuted, marginBottom: 4 }}>
                            {field.label[locale]}
                            {field.unit ? ` (${field.unit})` : ""}
                          </Text>
                          <TextInput
                            ref={(element) => {
                              inputs.current[`${player.id}.${field.key}`] = element;
                            }}
                            value={values[player.id]?.[field.key] ?? ""}
                            onChangeText={(text) => setValue(player.id, field.key, text)}
                            // Clavier decimal : le pave numerique simple ne
                            // porte pas de separateur, et toutes ces mesures en
                            // ont un.
                            keyboardType="decimal-pad"
                            inputMode="decimal"
                            returnKeyType="next"
                            accessibilityLabel={`${player.lastName} ${field.label[locale]}`}
                            style={{
                              minHeight: TOUCH,
                              borderRadius: radius.md,
                              borderWidth: 1,
                              borderColor: theme.border,
                              backgroundColor: theme.panel,
                              paddingHorizontal: space.md,
                              fontSize: 17,
                              fontVariant: ["tabular-nums"],
                              color: theme.textPrimary,
                            }}
                          />
                        </View>
                      ))}
                  </View>
                </View>
              ))}
            </>
          ) : (
            <Empty message={t("session.chooseTest")} />
          )}
        </ScrollView>

        {/* Barre d'action fixe : le bouton reste atteignable au pouce, quel que
            soit le nombre de joueurs a faire defiler. */}
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
          {notice ? (
            <Text
              accessibilityLiveRegion="polite"
              style={{ fontSize: 13, color: theme.success, marginBottom: space.sm, textAlign: "center" }}
            >
              {notice}
            </Text>
          ) : null}
          <Button label={t("session.save")} onPress={() => void save()} busy={saving} disabled={!test} />
        </View>
      </Screen>
    </>
  );
}
