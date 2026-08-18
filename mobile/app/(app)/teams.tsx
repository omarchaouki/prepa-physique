import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";

import { listTeams, type TeamRow } from "../../src/db/queries";
import { useSession } from "../../src/state/session";
import { Badge, Empty, Row, Screen, SyncBar, Title, useT } from "../../src/components/ui";

export default function TeamsScreen() {
  const t = useT();
  const router = useRouter();
  const { sync } = useSession();
  const [teams, setTeams] = useState<TeamRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void listTeams().then((rows) => {
        if (alive) setTeams(rows);
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  return (
    <Screen onRefresh={() => void sync()}>
      <Title>{t("teams.title")}</Title>
      <SyncBar />

      {teams.length === 0 ? (
        <Empty message={t("teams.empty")} />
      ) : (
        teams.map((team) => (
          <Row
            key={team.id}
            title={team.name}
            subtitle={[team.category, team.level, team.season].filter(Boolean).join(" . ")}
            right={<Badge label={`${team.playerCount} ${t("teams.players")}`} />}
            onPress={() => router.push(`/team/${team.id}`)}
          />
        ))
      )}
    </Screen>
  );
}
