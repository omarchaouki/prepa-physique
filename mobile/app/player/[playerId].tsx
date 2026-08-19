import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { Stack, useFocusEffect, useLocalSearchParams } from "expo-router";

import { ageOf, getPlayer, latestMetrics, type MetricRow, type PlayerRow } from "../../src/db/queries";
import { useSession } from "../../src/state/session";
import { Badge, Card, Empty, Screen, Title, useT } from "../../src/components/ui";
import { localeTag } from "../../src/i18n";
import { space, useTheme } from "../../src/theme";

/**
 * Fiche joueur, en lecture.
 *
 * Elle montre la derniere valeur connue de chaque metrique, telle que le
 * serveur l'a calculee. Les percentiles et les recommandations restent sur le
 * site : ils demandent les tables de normes et le moteur de recommandations, et
 * un telephone au bord d'un terrain n'est pas l'endroit ou on lit une analyse
 * de quatre paragraphes.
 */
export default function PlayerScreen() {
  const { playerId } = useLocalSearchParams<{ playerId: string }>();
  const theme = useTheme();
  const t = useT();
  const { locale } = useSession();

  const [player, setPlayer] = useState<PlayerRow | null>(null);
  const [metrics, setMetrics] = useState<MetricRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void (async () => {
        const [row, values] = await Promise.all([getPlayer(playerId), latestMetrics(playerId)]);
        if (!alive) return;
        setPlayer(row);
        setMetrics(values);
      })();
      return () => {
        alive = false;
      };
    }, [playerId]),
  );

  if (!player) {
    return (
      <Screen>
        <Empty message={t("common.loading")} />
      </Screen>
    );
  }

  const dateFormat = new Intl.DateTimeFormat(localeTag(locale), { day: "numeric", month: "short", year: "numeric" });

  const facts = [
    { label: t("squad.position"), value: player.position },
    { label: t("squad.age"), value: ageOf(player.birthDate).toFixed(0) },
    { label: t("player.height"), value: player.heightCm ? `${player.heightCm} cm` : "—" },
    { label: t("player.weight"), value: player.weightKg ? `${player.weightKg} kg` : "—" },
  ];

  return (
    <>
      <Stack.Screen
        options={{ title: `${player.lastName} ${player.firstName}`, headerShown: true }}
      />
      <Screen edges={[]}>
        <Title
          sub={player.jerseyNumber ? `#${player.jerseyNumber}` : undefined}
        >
          {player.lastName} {player.firstName}
        </Title>

        {player.status !== "ACTIVE" ? (
          <View style={{ marginBottom: space.lg, alignItems: "flex-start" }}>
            <Badge label={player.status} tone={player.status === "INJURED" ? "danger" : "warning"} />
          </View>
        ) : null}

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.md, marginBottom: space.xl }}>
          {facts.map((fact) => (
            <Card key={fact.label} style={{ flexGrow: 1, flexBasis: "44%", padding: space.md }}>
              <Text style={{ fontSize: 20, fontWeight: "700", color: theme.textPrimary, fontVariant: ["tabular-nums"] }}>
                {fact.value}
              </Text>
              <Text style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }}>{fact.label}</Text>
            </Card>
          ))}
        </View>

        <Text
          accessibilityRole="header"
          style={{ fontSize: 17, fontWeight: "700", color: theme.textPrimary, marginBottom: space.sm }}
        >
          {t("player.lastResults")}
        </Text>

        {metrics.length === 0 ? (
          <Empty message={t("player.noResults")} />
        ) : (
          metrics.map((metric) => (
            <View
              key={`${metric.key}.${metric.side ?? ""}`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: space.md,
                paddingVertical: space.md,
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, color: theme.textPrimary }}>
                  {metric.key}
                  {metric.side ? ` (${metric.side})` : ""}
                </Text>
                <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                  {dateFormat.format(new Date(metric.date))}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: theme.textPrimary,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {metric.value}
                <Text style={{ fontSize: 13, fontWeight: "400", color: theme.textMuted }}>
                  {metric.unit ? ` ${metric.unit}` : ""}
                </Text>
              </Text>
            </View>
          ))
        )}
      </Screen>
    </>
  );
}
