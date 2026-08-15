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
import { ageExact } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, Panel } from "@/components/ui/primitives";
import { SkeletonTable } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

async function PlayersTable({ user }: { user: CurrentUser }) {
  const ids = await accessibleTeamIds(user);

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
        title="Aucun joueur"
        description="Les joueurs apparaitront ici des qu'une equipe vous sera rattachee."
        icon={<Users size={20} />}
      />
    );
  }

  return (
    <div className="scroll-x" style={{ maxHeight: "75vh", overflowY: "auto" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col" style={{ minWidth: "13rem" }}>Joueur</th>
            <th scope="col">Equipe</th>
            <th scope="col">Poste</th>
            <th scope="col">Age</th>
            <th scope="col">Taille</th>
            <th scope="col">Masse</th>
            <th scope="col">Tests</th>
            <th scope="col">Statut</th>
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
                {POSITION_LABELS[player.position as Position]?.fr ?? player.position}
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
                  {PLAYER_STATUS_LABELS[player.status as PlayerStatus]?.fr ?? player.status}
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
  const user = await requireUser();

  return (
    <>
      <PageHeader
        title="Joueurs"
        description="Tous les joueurs des equipes auxquelles vous avez acces."
      />
      <Panel padded={false} className="p-1">
        <Suspense fallback={<SkeletonTable rows={12} columns={6} />}>
          <PlayersTable user={user} />
        </Suspense>
      </Panel>
    </>
  );
}
