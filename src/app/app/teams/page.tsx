import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, UsersRound } from "lucide-react";

import { requireUser, type CurrentUser } from "@/lib/auth";
import { listTeams } from "@/lib/queries";
import { TEAM_LEVEL_LABELS, type TeamLevel } from "@/lib/constants";
import { getLocale, getT } from "@/lib/i18n/server";
import { Alert, Badge, EmptyState, PageHeader, Panel, PanelHeader } from "@/components/ui/primitives";
import { SkeletonCards } from "@/components/ui/skeleton";
import { TeamForm } from "@/components/manage/team-form";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function TeamsGrid({ user }: { user: CurrentUser }) {
  const [teams, t, locale] = await Promise.all([listTeams(user), getT(), getLocale()]);

  if (teams.length === 0) {
    return (
      <Panel>
        <EmptyState
          title={t("teams.none")}
          description={t("teams.noneBody")}
          icon={<UsersRound size={20} />}
        />
      </Panel>
    );
  }

  const byOrganization = teams.reduce<Record<string, typeof teams>>((acc, team) => {
    const key = team.organization.name;
    acc[key] = acc[key] ?? [];
    acc[key].push(team);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {Object.entries(byOrganization).map(([organization, list]) => (
        <section key={organization}>
          {Object.keys(byOrganization).length > 1 ? (
            <h2
              className="text-[0.6875rem] font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              {organization}
            </h2>
          ) : null}
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {list.map((team) => (
              <Link
                key={team.id}
                href={`/app/teams/${team.id}`}
                className="panel p-4 cursor-pointer transition-colors hover:bg-[var(--surface-hover)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className="mt-1 size-3 rounded-full shrink-0"
                      style={{ background: team.colorHex }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{team.name}</p>
                      <p className="text-[0.8125rem] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {t("teams.season")} {team.season}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: "var(--text-muted)" }} aria-hidden="true" />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  <Badge tone="brand">{team.category}</Badge>
                  {team.level ? (
                    <Badge>{TEAM_LEVEL_LABELS[team.level as TeamLevel]?.[locale] ?? team.level}</Badge>
                  ) : null}
                </div>

                <div
                  className="grid grid-cols-2 gap-2 mt-3 pt-3"
                  style={{ borderTop: "1px solid var(--border-subtle)" }}
                >
                  <div>
                    <p className="text-lg font-semibold tabular leading-none">
                      {team._count.players}
                    </p>
                    <p className="text-[0.75rem] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {t("common.players")}
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold tabular leading-none">
                      {team._count.testSessions}
                    </p>
                    <p className="text-[0.75rem] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {t("dashboard.sessions")}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/**
 * Creation d'une equipe, directement depuis la liste.
 *
 * Elle vivait auparavant dans l'espace du club, ou personne ne pensait a aller
 * la chercher : quelqu'un qui veut creer une equipe ouvre la page des equipes.
 * Un formulaire cache dans un autre menu n'existe pas.
 *
 * Ouvert a tous les roles sauf la lecture seule. Dans un club reel, celui qui
 * monte l'equipe est souvent l'entraineur ou le preparateur.
 */
async function CreateTeam({ user }: { user: CurrentUser }) {
  const t = await getT();

  if (user.role === "VIEWER") return null;
  if (!user.organizationId) {
    // Le proprietaire n'appartient a aucun club : il cree les equipes depuis
    // le panneau d'administration, ou il choisit le club de destination.
    if (user.role === "OWNER") return null;
    return (
      <Panel className="mb-5">
        <Alert tone="info">{t("teams.noClub")}</Alert>
      </Panel>
    );
  }

  const organization = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: { id: true, maxTeams: true, plan: true, _count: { select: { teams: true } } },
  });
  if (!organization) return null;

  const full = organization._count.teams >= organization.maxTeams;

  return (
    <Panel className="mb-5">
      <PanelHeader
        title={t("teams.create")}
        subtitle={t("teams.createSubtitle")}
        icon={<UsersRound size={16} />}
      />
      {full ? (
        <Alert tone="warning">
          {t("teams.limitReached").replace("{max}", String(organization.maxTeams))}
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
            season: `${new Date().getFullYear()}/${String(new Date().getFullYear() + 1).slice(2)}`,
            colorHex: "#1E40AF",
          }}
        />
      )}
    </Panel>
  );
}

export default async function TeamsPage() {
  const [user, t] = await Promise.all([requireUser(), getT()]);

  return (
    <>
      <PageHeader title={t("teams.title")} description={t("teams.subtitle")} />

      <Suspense fallback={null}>
        <CreateTeam user={user} />
      </Suspense>

      <Suspense fallback={<SkeletonCards count={3} />}>
        <TeamsGrid user={user} />
      </Suspense>
    </>
  );
}
