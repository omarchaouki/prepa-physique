import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Pencil, Settings, UserPlus, Users, UserX } from "lucide-react";

import { canAccessTeam, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { removeTeamMemberAction, toggleTeamActiveAction } from "@/app/actions/squad";
import {
  POSITION_LABELS,
  PLAYER_STATUS_LABELS,
  ROLE_LABELS,
  type PlayerStatus,
  type Position,
  type Role,
} from "@/lib/constants";
import { getLocale, getT } from "@/lib/i18n/server";
import { ageExact } from "@/lib/utils";
import { Alert, Badge, PageHeader, Panel, PanelHeader } from "@/components/ui/primitives";
import { PlayerForm } from "@/components/manage/player-form";
import { emptyPlayer } from "@/components/manage/player-values";
import { TeamForm } from "@/components/manage/team-form";
import { AddStaffForm } from "@/components/manage/staff-form";

export const dynamic = "force-dynamic";

export default async function ManageTeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const [user, t, locale] = await Promise.all([requireUser(), getT(), getLocale()]);

  const access = await canAccessTeam(user, teamId);
  if (!access.allowed) redirect("/app/teams");
  if (!access.canEdit) redirect(`/app/teams/${teamId}`);

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      organization: { select: { id: true, name: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      players: { orderBy: [{ status: "asc" }, { lastName: "asc" }] },
    },
  });
  if (!team) notFound();

  const isClubAdmin = user.role === "OWNER" || user.role === "CLUB_ADMIN";

  // Equipes vers lesquelles un joueur peut etre transfere : celles que
  // l'utilisateur a lui meme le droit de modifier.
  const candidateTeams = await prisma.team.findMany({
    where:
      user.role === "OWNER"
        ? { organizationId: team.organizationId }
        : user.role === "CLUB_ADMIN"
          ? { organizationId: user.organizationId ?? "" }
          : { members: { some: { userId: user.id, accessLevel: "MANAGE" } } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Staff du club pas encore rattache a cette equipe.
  const assignable = isClubAdmin
    ? await prisma.user.findMany({
        where: {
          organizationId: team.organizationId,
          isActive: true,
          id: { notIn: team.members.map((m) => m.userId) },
        },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link
            href={`/app/teams/${teamId}`}
            className="inline-flex items-center gap-1 text-[0.8125rem] cursor-pointer hover:underline"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronLeft size={14} aria-hidden="true" />
            {team.name}
          </Link>
        }
        title={t("manage.title")}
        description={`${team.name} · ${team.organization.name}`}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Effectif */}
        <Panel className="lg:col-span-2">
          <PanelHeader
            title={t("manage.squad")}
            subtitle={t("manage.squadSubtitle")}
            icon={<Users size={16} />}
            action={<Badge tone="brand">{team.players.length}</Badge>}
          />

          {team.players.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: "var(--text-muted)" }}>
              {t("teams.noPlayers")}
            </p>
          ) : (
            <div className="scroll-x" style={{ maxHeight: "34rem", overflowY: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col" style={{ minWidth: "12rem" }}>{t("squad.player")}</th>
                    <th scope="col">{t("squad.position")}</th>
                    <th scope="col">{t("squad.age")}</th>
                    <th scope="col">{t("players.height")}</th>
                    <th scope="col">{t("players.weight")}</th>
                    <th scope="col">{t("common.status")}</th>
                    <th scope="col" />
                  </tr>
                </thead>
                <tbody>
                  {team.players.map((player) => (
                    <tr key={player.id}>
                      <td>
                        <Link
                          href={`/app/players/${player.id}`}
                          className="font-medium cursor-pointer hover:underline"
                        >
                          {player.lastName} {player.firstName}
                        </Link>
                        {player.jerseyNumber ? (
                          <span
                            className="ml-1.5 text-[0.75rem] tabular"
                            style={{ color: "var(--text-muted)" }}
                          >
                            #{player.jerseyNumber}
                          </span>
                        ) : null}
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {POSITION_LABELS[player.position as Position]?.[locale] ?? player.position}
                      </td>
                      <td className="tabular">{ageExact(player.birthDate).toFixed(0)}</td>
                      <td className="tabular">{player.heightCm ? `${player.heightCm}` : "—"}</td>
                      <td className="tabular">{player.weightKg ? `${player.weightKg}` : "—"}</td>
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
                          {PLAYER_STATUS_LABELS[player.status as PlayerStatus]?.[locale] ??
                            player.status}
                        </Badge>
                      </td>
                      <td>
                        <Link
                          href={`/app/players/${player.id}/edit`}
                          className="btn btn-ghost"
                          style={{ minHeight: "2rem", padding: "0.25rem 0.5rem" }}
                          title={t("manage.editPlayer")}
                          aria-label={`${t("manage.editPlayer")} ${player.lastName}`}
                        >
                          <Pencil size={14} aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* Ajout rapide */}
        <Panel>
          <PanelHeader
            title={t("manage.addPlayer")}
            subtitle={t("manage.addPlayerSubtitle")}
            icon={<UserPlus size={16} />}
          />
          <PlayerForm mode="create" values={emptyPlayer(teamId)} teams={candidateTeams} />
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        {/* Reglages de l'equipe */}
        <Panel>
          <PanelHeader
            title={t("manage.teamSettings")}
            subtitle={t("manage.teamSettingsSubtitle")}
            icon={<Settings size={16} />}
          />
          <TeamForm
            mode="edit"
            values={{
              id: team.id,
              name: team.name,
              category: team.category,
              level: team.level ?? "AMATEUR",
              sex: team.sex,
              season: team.season,
              colorHex: team.colorHex,
            }}
            extra={
              isClubAdmin ? (
                <form
                  action={async () => {
                    "use server";
                    await toggleTeamActiveAction(teamId);
                  }}
                >
                  <button type="submit" className="btn btn-secondary">
                    {team.isActive ? t("manage.archive") : t("manage.unarchive")}
                  </button>
                </form>
              ) : null
            }
          />
          {isClubAdmin ? (
            <p className="text-[0.75rem] mt-2" style={{ color: "var(--text-muted)" }}>
              {t("manage.archiveHint")}
            </p>
          ) : null}
        </Panel>

        {/* Staff */}
        <Panel>
          <PanelHeader
            title={t("manage.staff")}
            subtitle={t("manage.staffSubtitle")}
            icon={<Users size={16} />}
          />

          {team.members.length === 0 ? (
            <p className="text-[0.8125rem] mb-3" style={{ color: "var(--text-muted)" }}>
              {t("manage.staffNone")}
            </p>
          ) : (
            <ul className="space-y-1.5 mb-3">
              {team.members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between gap-3 panel-sunken p-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-[0.8125rem] font-medium truncate">{member.user.name}</p>
                    <p className="text-[0.75rem] truncate" style={{ color: "var(--text-muted)" }}>
                      {member.user.email} ·{" "}
                      {ROLE_LABELS[member.user.role as Role]?.[locale] ?? member.user.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge>
                      {member.accessLevel === "MANAGE"
                        ? t("settings.accessManage")
                        : t("settings.accessView")}
                    </Badge>
                    {isClubAdmin ? (
                      <form
                        action={async () => {
                          "use server";
                          await removeTeamMemberAction(teamId, member.userId);
                        }}
                      >
                        <button
                          type="submit"
                          className="btn btn-ghost"
                          style={{ minHeight: "2rem", padding: "0.25rem 0.5rem" }}
                          title={t("manage.removeStaff")}
                          aria-label={`${t("manage.removeStaff")} ${member.user.name}`}
                        >
                          <UserX size={14} aria-hidden="true" />
                        </button>
                      </form>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {isClubAdmin ? (
            assignable.length > 0 ? (
              <AddStaffForm teamId={teamId} users={assignable} />
            ) : (
              <Alert tone="info">{t("manage.staffNone")}</Alert>
            )
          ) : null}
        </Panel>
      </div>

    </>
  );
}
