import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import {
  ageOf,
  getTeam,
  listPlayers,
  listSessions,
  type PlayerRow,
  type SessionRow,
  type TeamRow,
} from "../../src/db/queries";
import { useSession } from "../../src/state/session";
import { Badge, Button, Empty, Row, Screen, Title, useT } from "../../src/components/ui";
import { localeTag } from "../../src/i18n";
import { space, useTheme } from "../../src/theme";

/** Effectif d'une equipe, et ses dernieres passations. */
export default function TeamScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const theme = useTheme();
  const t = useT();
  const router = useRouter();
  const { locale } = useSession();

  const [team, setTeam] = useState<TeamRow | null>(null);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void (async () => {
        const [a, b, c] = await Promise.all([
          getTeam(teamId),
          listPlayers(teamId),
          listSessions(5, teamId),
        ]);
        if (!alive) return;
        setTeam(a);
        setPlayers(b);
        setSessions(c);
      })();
      return () => {
        alive = false;
      };
    }, [teamId]),
  );

  const dateFormat = new Intl.DateTimeFormat(localeTag(locale), { day: "numeric", month: "short" });

  return (
    <>
      <Stack.Screen options={{ title: team?.name ?? t("squad.title"), headerShown: true }} />
      <Screen edges={[]}>
        <Title sub={[team?.category, team?.level, team?.season].filter(Boolean).join(" . ")}>
          {t("squad.title")}
        </Title>

        <Button
          label={t("squad.newSession")}
          onPress={() => router.push(`/session/new?teamId=${teamId}`)}
          style={{ marginBottom: space.xl }}
        />

        {sessions.length > 0 ? (
          <View style={{ marginBottom: space.xl }}>
            <Text
              accessibilityRole="header"
              style={{ fontSize: 17, fontWeight: "700", color: theme.textPrimary, marginBottom: space.sm }}
            >
              {t("dashboard.recentSessions")}
            </Text>
            {sessions.map((item) => (
              <Row
                key={item.id}
                title={item.name}
                subtitle={dateFormat.format(new Date(item.date))}
                right={
                  item.pending === 1 ? (
                    <Badge label={t("sync.offline")} tone="warning" />
                  ) : (
                    <Badge label={`${item.resultCount}`} />
                  )
                }
                onPress={() => router.push(`/session/${item.id}`)}
              />
            ))}
          </View>
        ) : null}

        <Text
          accessibilityRole="header"
          style={{ fontSize: 17, fontWeight: "700", color: theme.textPrimary, marginBottom: space.sm }}
        >
          {t("squad.title")}
        </Text>

        {players.length === 0 ? (
          <Empty message={t("squad.empty")} />
        ) : (
          players.map((player) => (
            <Row
              key={player.id}
              title={`${player.lastName} ${player.firstName}`}
              subtitle={`${player.position} . ${ageOf(player.birthDate).toFixed(0)} ${t("squad.age").toLowerCase()}`}
              right={
                player.status === "ACTIVE" ? (
                  player.jerseyNumber ? (
                    <Text style={{ fontSize: 15, color: theme.textMuted, fontVariant: ["tabular-nums"] }}>
                      {player.jerseyNumber}
                    </Text>
                  ) : null
                ) : (
                  <Badge
                    label={player.status}
                    tone={player.status === "INJURED" ? "danger" : "warning"}
                  />
                )
              }
              onPress={() => router.push(`/player/${player.id}`)}
            />
          ))
        )}
      </Screen>
    </>
  );
}
