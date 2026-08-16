import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, UsersRound } from "lucide-react";

import { requireUser, type CurrentUser } from "@/lib/auth";
import { listTeams } from "@/lib/queries";
import { TEAM_LEVEL_LABELS, type TeamLevel } from "@/lib/constants";
import { getLocale, getT } from "@/lib/i18n/server";
import { Badge, EmptyState, PageHeader, Panel } from "@/components/ui/primitives";
import { SkeletonCards } from "@/components/ui/skeleton";

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

export default async function TeamsPage() {
  const [user, t] = await Promise.all([requireUser(), getT()]);

  return (
    <>
      <PageHeader title={t("teams.title")} description={t("teams.subtitle")} />
      <Suspense fallback={<SkeletonCards count={3} />}>
        <TeamsGrid user={user} />
      </Suspense>
    </>
  );
}
