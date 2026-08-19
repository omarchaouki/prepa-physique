import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { counts, listSessions, unavailablePlayers, type Counts, type SessionRow } from "../../src/db/queries";
import { useSession } from "../../src/state/session";
import { Badge, Card, Empty, Row, Screen, SyncBar, Title, useT } from "../../src/components/ui";
import { localeTag } from "../../src/i18n";
import { space, useTheme } from "../../src/theme";

/**
 * Tableau de bord.
 *
 * Tout vient de la base locale : l'ecran s'affiche instantanement, avec ou sans
 * reseau. Les alertes se limitent volontairement aux joueurs declares
 * indisponibles, la seule chose que le telephone puisse etablir seul. Les
 * alertes fines, celles qui croisent asymetries et charge, demandent le moteur
 * de recommandations qui vit sur le serveur : les afficher a moitie ici serait
 * pire que de ne pas les afficher.
 */
export default function DashboardScreen() {
  const theme = useTheme();
  const t = useT();
  const router = useRouter();
  const { user, locale, lastSync, sync } = useSession();

  const [stats, setStats] = useState<Counts | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [watch, setWatch] = useState<Array<{ id: string; firstName: string; lastName: string; teamName: string; status: string }>>([]);

  // Rechargement a chaque venue sur l'ecran : une synchronisation a pu passer
  // pendant qu'on etait ailleurs.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void (async () => {
        const [c, s, w] = await Promise.all([counts(), listSessions(6), unavailablePlayers()]);
        if (!alive) return;
        setStats(c);
        setSessions(s);
        setWatch(w);
      })();
      return () => {
        alive = false;
      };
    }, []),
  );

  const dateFormat = new Intl.DateTimeFormat(localeTag(locale), { day: "numeric", month: "short" });
  const vide = stats !== null && stats.teams === 0;

  return (
    <Screen onRefresh={() => void sync()}>
      <Title sub={user?.name}>{t("dashboard.title")}</Title>
      <SyncBar />

      {vide ? (
        <Empty message={t("dashboard.empty")} />
      ) : (
        <>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.md, marginBottom: space.xl }}>
            {[
              { label: t("dashboard.teams"), value: stats?.teams },
              { label: t("dashboard.players"), value: stats?.players },
              { label: t("dashboard.sessions"), value: stats?.sessions },
              { label: t("dashboard.unavailable"), value: stats?.unavailable },
            ].map((item) => (
              <Card key={item.label} style={{ flexGrow: 1, flexBasis: "44%", padding: space.md }}>
                <Text style={{ fontSize: 28, fontWeight: "700", color: theme.textPrimary, fontVariant: ["tabular-nums"] }}>
                  {item.value ?? "—"}
                </Text>
                <Text style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }}>{item.label}</Text>
              </Card>
            ))}
          </View>

          <Text accessibilityRole="header" style={{ fontSize: 17, fontWeight: "700", color: theme.textPrimary, marginBottom: space.sm }}>
            {t("dashboard.alerts")}
          </Text>
          {watch.length === 0 ? (
            <Empty message={t("dashboard.noAlerts")} />
          ) : (
            watch.slice(0, 6).map((player) => (
              <Row
                key={player.id}
                title={`${player.lastName} ${player.firstName}`}
                subtitle={player.teamName}
                right={<Badge label={player.status} tone={player.status === "INJURED" ? "danger" : "warning"} />}
                onPress={() => router.push(`/player/${player.id}`)}
              />
            ))
          )}

          <Text
            accessibilityRole="header"
            style={{ fontSize: 17, fontWeight: "700", color: theme.textPrimary, marginTop: space.xl, marginBottom: space.sm }}
          >
            {t("dashboard.recentSessions")}
          </Text>
          {sessions.length === 0 ? (
            <Empty message={t("session.empty")} />
          ) : (
            sessions.map((item) => (
              <Row
                key={item.id}
                title={item.name}
                subtitle={`${item.teamName} . ${dateFormat.format(new Date(item.date))}`}
                right={
                  item.pending === 1 ? (
                    <Badge label={t("sync.offline")} tone="warning" />
                  ) : (
                    <Badge label={`${item.resultCount}`} />
                  )
                }
                onPress={() => router.push(`/session/${item.id}`)}
              />
            ))
          )}

          {lastSync ? (
            <Text style={{ marginTop: space.xl, fontSize: 12, color: theme.textMuted, textAlign: "center" }}>
              {t("sync.lastAt", {
                when: new Intl.DateTimeFormat(localeTag(locale), {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(lastSync),
              })}
            </Text>
          ) : null}
        </>
      )}
    </Screen>
  );
}
