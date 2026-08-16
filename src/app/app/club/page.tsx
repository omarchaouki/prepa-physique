import { Building2, Package, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLocale, getLocaleTag, getT } from "@/lib/i18n/server";
import { TEAM_LEVEL_LABELS, type TeamLevel } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Alert, Badge, PageHeader, Panel, PanelHeader, StatCard } from "@/components/ui/primitives";
import { ClubForm } from "@/components/manage/club-form";
import { TeamForm } from "@/components/manage/team-form";

export const dynamic = "force-dynamic";

/**
 * Espace du club, pour l'administrateur de club.
 *
 * Il y modifie les coordonnees de son club et cree ses equipes, dans la limite
 * de son forfait. Le forfait lui meme et les plafonds restent la main du
 * proprietaire de l'application : un client ne releve pas ses propres limites.
 */
export default async function ClubPage() {
  const [user, t, locale, tag] = await Promise.all([
    requireUser(),
    getT(),
    getLocale(),
    getLocaleTag(),
  ]);

  if (user.role !== "CLUB_ADMIN" || !user.organizationId) redirect("/app");

  const organization = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    include: {
      teams: {
        include: { _count: { select: { players: true, testSessions: true } } },
        orderBy: { name: "asc" },
      },
      _count: { select: { users: true } },
    },
  });
  if (!organization) redirect("/app");

  const playerCount = organization.teams.reduce((a, team) => a + team._count.players, 0);
  const atTeamLimit = organization.teams.length >= organization.maxTeams;

  return (
    <>
      <PageHeader title={t("manage.club")} description={t("manage.clubSubtitle")} />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          label={t("admin.teams")}
          value={`${organization.teams.length} / ${organization.maxTeams}`}
          tone={atTeamLimit ? "warning" : "neutral"}
        />
        <StatCard
          label={t("dashboard.statPlayers")}
          value={`${playerCount} / ${organization.maxPlayers}`}
          tone={playerCount >= organization.maxPlayers ? "warning" : "neutral"}
        />
        <StatCard label={t("admin.users")} value={organization._count.users} />
        <StatCard
          label={t("manage.plan")}
          value={organization.plan}
          hint={
            organization.expiresAt
              ? `${t("admin.expiresOn")} ${formatDate(organization.expiresAt, tag)}`
              : undefined
          }
        />
      </section>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel>
          <PanelHeader title={t("manage.clubIdentity")} icon={<Building2 size={16} />} />
          <ClubForm
            values={{
              organizationId: organization.id,
              name: organization.name,
              city: organization.city ?? "",
              country: organization.country ?? "",
            }}
          />

          <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <p className="text-[0.8125rem] font-medium mb-1">{t("manage.plan")}</p>
            <p className="text-[0.75rem] mb-2" style={{ color: "var(--text-muted)" }}>
              {t("manage.planSubtitle")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="brand">{organization.plan}</Badge>
              <Badge>
                {organization.maxTeams} {t("admin.teams").toLowerCase()}
              </Badge>
              <Badge>
                {organization.maxPlayers} {t("common.players")}
              </Badge>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title={t("manage.newTeam")}
            subtitle={t("manage.newTeamSubtitle")}
            icon={<Plus size={16} />}
          />
          {atTeamLimit ? (
            <Alert tone="warning">
              {t("manage.teamLimit")} {organization.plan} : {organization.maxTeams}.
            </Alert>
          ) : (
            <TeamForm
              mode="create"
              values={{
                organizationId: organization.id,
                name: "",
                category: "SENIOR",
                level: "AMATEUR",
                sex: "M",
                season: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
                colorHex: "#1E40AF",
              }}
            />
          )}
        </Panel>
      </div>

      <Panel className="mt-4">
        <PanelHeader
          title={t("teams.title")}
          subtitle={t("teams.subtitle")}
          icon={<Package size={16} />}
        />
        <div className="scroll-x">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">{t("players.team")}</th>
                <th scope="col">{t("admin.category")}</th>
                <th scope="col">{t("admin.level")}</th>
                <th scope="col">{t("admin.season")}</th>
                <th scope="col">{t("dashboard.statPlayers")}</th>
                <th scope="col">{t("dashboard.statSessions")}</th>
                <th scope="col">{t("common.status")}</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {organization.teams.map((team) => (
                <tr key={team.id}>
                  <td>
                    <Link
                      href={`/app/teams/${team.id}`}
                      className="inline-flex items-center gap-1.5 font-medium cursor-pointer hover:underline"
                    >
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ background: team.colorHex }}
                        aria-hidden="true"
                      />
                      {team.name}
                    </Link>
                  </td>
                  <td>{team.category}</td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    {team.level
                      ? (TEAM_LEVEL_LABELS[team.level as TeamLevel]?.[locale] ?? team.level)
                      : "—"}
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{team.season}</td>
                  <td className="tabular">{team._count.players}</td>
                  <td className="tabular">{team._count.testSessions}</td>
                  <td>
                    <Badge tone={team.isActive ? "success" : "neutral"}>
                      {team.isActive ? t("admin.active") : t("manage.archived")}
                    </Badge>
                  </td>
                  <td>
                    <Link
                      href={`/app/teams/${team.id}/manage`}
                      className="btn btn-ghost"
                      style={{ minHeight: "2rem", padding: "0.25rem 0.625rem" }}
                    >
                      {t("manage.open")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
