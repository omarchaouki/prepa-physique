import { Suspense } from "react";
import Link from "next/link";
import { UserPlus, Users } from "lucide-react";

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
import { Alert, Badge, EmptyState, PageHeader, Panel, PanelHeader } from "@/components/ui/primitives";
import { SkeletonTable } from "@/components/ui/skeleton";
import { PlayerForm } from "@/components/manage/player-form";
import { emptyPlayer } from "@/components/manage/player-values";

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

/**
 * Ajout d'un joueur, directement depuis la liste des joueurs.
 *
 * Il fallait auparavant passer par une equipe puis par son ecran de gestion,
 * ce qui suppose de savoir qu'un joueur appartient a une equipe. Quelqu'un qui
 * veut ajouter un joueur ouvre la page des joueurs, pas celle des equipes.
 *
 * Le formulaire porte un selecteur d'equipe d'accueil, puisqu'il n'y a pas de
 * contexte d'equipe ici. S'il n'existe aucune equipe, la regle est expliquee
 * plutot que constatee : un joueur appartient toujours a une equipe, il faut
 * donc en creer une d'abord.
 */
async function AddPlayer({ user }: { user: CurrentUser }) {
  const t = await getT();
  if (user.role === "VIEWER") return null;

  const ids = await accessibleTeamIds(user);
  const teams = await prisma.team.findMany({
    where:
      ids === "ALL"
        ? { isActive: true }
        : { id: { in: ids }, isActive: true },
    // Le sexe de l'equipe est necessaire : celui du joueur en decoule, et
    // c'est lui qui determine la population de reference des percentiles.
    select: { id: true, name: true, sex: true, organizationId: true },
    orderBy: { name: "asc" },
  });

  if (teams.length === 0) {
    return (
      <Panel className="mb-5">
        <PanelHeader title={t("players.add")} icon={<UserPlus size={16} />} />
        <Alert tone="info">{t("players.needTeam")}</Alert>
        <Link href="/app/teams" className="btn btn-primary mt-3">
          {t("teams.create")}
        </Link>
      </Panel>
    );
  }

  // Le plafond du forfait se compte au niveau du club, pas de l'equipe.
  const organizationId = teams[0].organizationId;
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { maxPlayers: true },
  });
  const used = await prisma.player.count({
    where: { team: { organizationId }, status: { not: "LEFT" } },
  });
  const full = Boolean(organization && used >= organization.maxPlayers);

  return (
    <Panel className="mb-5">
      <PanelHeader
        title={t("players.add")}
        subtitle={t("players.addSubtitle")}
        icon={<UserPlus size={16} />}
      />
      {full && organization ? (
        <Alert tone="warning">
          {t("players.limitReached").replace("{max}", String(organization.maxPlayers))}
        </Alert>
      ) : (
        <PlayerForm
          mode="create"
          values={emptyPlayer(teams[0].id)}
          teams={teams.map((team) => ({ id: team.id, name: team.name, sex: team.sex }))}
        />
      )}
    </Panel>
  );
}

export default async function PlayersPage() {
  const [user, t] = await Promise.all([requireUser(), getT()]);

  return (
    <>
      <PageHeader title={t("players.title")} description={t("players.subtitle")} />

      <Suspense fallback={null}>
        <AddPlayer user={user} />
      </Suspense>

      <Panel padded={false} className="p-1">
        <Suspense fallback={<SkeletonTable rows={12} columns={6} />}>
          <PlayersTable user={user} />
        </Suspense>
      </Panel>
    </>
  );
}
