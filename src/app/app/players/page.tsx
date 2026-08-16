import { Suspense } from "react";
import Link from "next/link";
import { Users } from "lucide-react";

import { requireUser, accessibleTeamIds, type CurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  POSITION_LABELS,
  PLAYER_STATUS_LABELS,
  type PlayerStatus,
  type Position,
} from "@/lib/constants";
import { getLocale, getT } from "@/lib/i18n/server";
import { ageExact } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, Panel } from "@/components/ui/primitives";
import { SkeletonTable } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

async function PlayersTable({ user }: { user: CurrentUser }) {
  const [ids, t, locale] = await Promise.all([accessibleTeamIds(user), getT(), getLocale()]);

  const players = await prisma.player.findMany({
    where: ids === "ALL" ? {} : { teamId: { in: ids } },
    include: {
      team: { select: { id: true, name: true, colorHex: true } },
      _count: { select: { testResults: true } },
    },
    orderBy: [{ team: { name: "asc" } }, { lastName: "asc" }],
  });

  if (players.length === 0) {
    return (
      <EmptyState
        title={t("players.none")}
        description={t("players.noneBody")}
        icon={<Users size={20} />}
      />
    );
  }

  return (
    <div className="scroll-x" style={{ maxHeight: "75vh", overflowY: "auto" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col" style={{ minWidth: "13rem" }}>{t("squad.player")}</th>
            <th scope="col">{t("players.team")}</th>
            <th scope="col">{t("squad.position")}</th>
            <th scope="col">{t("squad.age")}</th>
            <th scope="col">{t("players.height")}</th>
            <th scope="col">{t("players.weight")}</th>
            <th scope="col">{t("players.tests")}</th>
            <th scope="col">{t("common.status")}</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.id}>
              <td>
                <Link
                  href={`/app/players/${player.id}`}
                  className="flex items-center gap-2 cursor-pointer hover:underline font-medium"
                >
                  <span
                    className="grid place-items-center size-7 rounded-full text-[0.625rem] font-semibold shrink-0"
                    style={{ background: "var(--surface-sunken)", color: "var(--text-secondary)" }}
                    aria-hidden="true"
                  >
                    {player.firstName.charAt(0)}
                    {player.lastName.charAt(0)}
                  </span>
                  <span className="truncate">
                    {player.lastName} {player.firstName}
                  </span>
                </Link>
              </td>
              <td>
                <Link
                  href={`/app/teams/${player.team.id}`}
                  className="inline-flex items-center gap-1.5 cursor-pointer hover:underline"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ background: player.team.colorHex }}
                    aria-hidden="true"
                  />
                  {player.team.name}
                </Link>
              </td>
              <td style={{ color: "var(--text-secondary)" }}>
                {POSITION_LABELS[player.position as Position]?.[locale] ?? player.position}
              </td>
              <td className="tabular">{ageExact(player.birthDate).toFixed(0)}</td>
              <td className="tabular">{player.heightCm ? `${player.heightCm} cm` : "—"}</td>
              <td className="tabular">{player.weightKg ? `${player.weightKg} kg` : "—"}</td>
              <td className="tabular">{player._count.testResults}</td>
              <td>
                <Badge
                  tone={
                    player.status === "ACTIVE"
                      ? "success"
                      : player.status === "INJURED"
                        ? "danger"
                        : player.status === "REHAB"
                          ? "warning"
                          : "neutral"
                  }
                >
                  {PLAYER_STATUS_LABELS[player.status as PlayerStatus]?.[locale] ?? player.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function PlayersPage() {
  const [user, t] = await Promise.all([requireUser(), getT()]);

  return (
    <>
      <PageHeader title={t("players.title")} description={t("players.subtitle")} />
      <Panel padded={false} className="p-1">
        <Suspense fallback={<SkeletonTable rows={12} columns={6} />}>
          <PlayersTable user={user} />
        </Suspense>
      </Panel>
    </>
  );
}
