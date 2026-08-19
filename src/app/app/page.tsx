import { Suspense } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  Plus,
  UsersRound,
} from "lucide-react";

import { requireUser, type CurrentUser } from "@/lib/auth";
import {
  getDashboardStats,
  getOnboardingState,
  getRecentSessions,
  getSquadAlerts,
  listTeams,
} from "@/lib/queries";
import { Onboarding } from "@/components/app/onboarding";
import { getLocaleTag, getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";
import {
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  PanelHeader,
  StatCard,
} from "@/components/ui/primitives";
import { SkeletonCards, SkeletonList, SkeletonStats } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

/**
 * Le tableau de bord s'affiche en trois temps.
 *
 * Le cadre et le titre partent immediatement. Les indicateurs, les alertes, les
 * dernieres passations et les equipes sont quatre requetes independantes, donc
 * quatre frontieres Suspense : chaque zone apparait des que sa donnee est prete,
 * sans attendre les autres. Les alertes, de loin les plus couteuses puisqu'elles
 * evaluent les recommandations de chaque joueur, ne retardent plus rien.
 */

/**
 * Guide de demarrage, en tete du tableau de bord.
 *
 * Il occupe sa propre frontiere Suspense : ses trois comptes ne doivent pas
 * retarder l'affichage des indicateurs, et inversement.
 */
async function OnboardingSection({ user }: { user: CurrentUser }) {
  const [state, t] = await Promise.all([getOnboardingState(user), getT()]);
  return <Onboarding state={state} t={t} firstTeamId={state.firstTeamId} />;
}

async function StatsSection({ user }: { user: CurrentUser }) {
  const [stats, t, tag] = await Promise.all([getDashboardStats(user), getT(), getLocaleTag()]);
  const daysSinceLastTest = stats.lastTestDate
    ? Math.floor((Date.now() - stats.lastTestDate.getTime()) / 86_400_000)
    : null;

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label={t("dashboard.statTeams")}
        value={stats.teamCount}
        hint={stats.teamCount > 1 ? t("dashboard.statTeamsHintMany") : t("dashboard.statTeamsHintOne")}
        icon={<UsersRound size={15} />}
      />
      <StatCard
        label={t("dashboard.statPlayers")}
        value={stats.playerCount}
        hint={`${stats.injuredCount} ${t("dashboard.statPlayersHint")}`}
        tone={stats.injuredCount > 0 ? "warning" : "neutral"}
        icon={<Activity size={15} />}
      />
      <StatCard
        label={t("dashboard.statSessions")}
        value={stats.sessionCount}
        hint={t("dashboard.statSessionsHint")}
        icon={<ClipboardList size={15} />}
      />
      <StatCard
        label={t("dashboard.statLastTest")}
        value={daysSinceLastTest === null ? "—" : daysSinceLastTest}
        unit={daysSinceLastTest === null ? undefined : t("common.days")}
        hint={stats.lastTestDate ? formatDate(stats.lastTestDate, tag) : t("dashboard.statLastTestNone")}
        tone={daysSinceLastTest !== null && daysSinceLastTest > 60 ? "warning" : "neutral"}
        icon={<CalendarClock size={15} />}
      />
    </section>
  );
}

async function AlertsSection({ user }: { user: CurrentUser }) {
  const [alerts, t] = await Promise.all([getSquadAlerts(user), getT()]);

  if (alerts.length === 0) {
    return (
      <EmptyState
        title={t("dashboard.noAlerts")}
        description={t("dashboard.noAlertsBody")}
        icon={<AlertTriangle size={20} />}
      />
    );
  }

  return (
    <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
      {alerts.map((alert) => (
        <li key={alert.playerId}>
          <Link
            href={`/app/players/${alert.playerId}`}
            className="flex items-center gap-3 py-2.5 px-1 -mx-1 rounded-lg cursor-pointer transition-colors hover:bg-[var(--surface-hover)]"
          >
            <span
              className="grid place-items-center size-8 rounded-full text-[0.6875rem] font-semibold shrink-0"
              style={{
                background: alert.criticalAlerts > 0 ? "var(--danger-soft)" : "var(--warning-soft)",
                color: alert.criticalAlerts > 0 ? "var(--danger)" : "var(--warning)",
              }}
              aria-hidden="true"
            >
              {alert.playerName
                .split(" ")
                .map((part) => part.charAt(0))
                .join("")
                .slice(0, 2)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{alert.playerName}</p>
              <p className="text-[0.75rem] truncate" style={{ color: "var(--text-muted)" }}>
                {alert.teamName} · {alert.position} · {alert.ageYears.toFixed(0)} {t("common.years")}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {alert.criticalAlerts > 0 ? (
                <Badge tone="danger">
                  {alert.criticalAlerts}{" "}
                  {alert.criticalAlerts > 1
                    ? t("dashboard.criticalMany")
                    : t("dashboard.criticalOne")}
                </Badge>
              ) : null}
              <Badge tone="warning">
                {alert.alerts} {t("dashboard.alerts")}
              </Badge>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function RecentSessionsSection({ user }: { user: CurrentUser }) {
  const [sessions, t, tag] = await Promise.all([getRecentSessions(user), getT(), getLocaleTag()]);

  if (sessions.length === 0) {
    return (
      <EmptyState
        title={t("dashboard.noSessions")}
        description={t("dashboard.noSessionsBody")}
        action={
          <Link href="/app/sessions/new" className="btn btn-primary">
            <Plus size={15} aria-hidden="true" />
            {t("dashboard.createSession")}
          </Link>
        }
        icon={<ClipboardList size={20} />}
      />
    );
  }

  return (
    <ul className="space-y-1">
      {sessions.map((session) => (
        <li key={session.id}>
          <Link
            href={`/app/sessions/${session.id}`}
            className="block py-2 px-2 -mx-1 rounded-lg cursor-pointer transition-colors hover:bg-[var(--surface-hover)]"
          >
            <p className="text-sm font-medium truncate">{session.name}</p>
            <p className="text-[0.75rem] mt-0.5 tabular" style={{ color: "var(--text-muted)" }}>
              {formatDate(session.date, tag)} · {session.team.name} · {session._count.results}{" "}
              {t("dashboard.results")}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function TeamsSection({ user }: { user: CurrentUser }) {
  const [teams, t] = await Promise.all([listTeams(user), getT()]);

  if (teams.length === 0) {
    return (
      <EmptyState
        title={t("dashboard.noTeams")}
        description={t("dashboard.noTeamsBody")}
        icon={<UsersRound size={20} />}
      />
    );
  }

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {teams.map((team) => (
        <Link
          key={team.id}
          href={`/app/teams/${team.id}`}
          className="panel-sunken p-3 cursor-pointer transition-colors hover:bg-[var(--surface-hover)]"
        >
          <div className="flex items-start gap-2.5">
            <span
              className="mt-0.5 size-2.5 rounded-full shrink-0"
              style={{ background: team.colorHex }}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{team.name}</p>
              <p className="text-[0.75rem] truncate" style={{ color: "var(--text-muted)" }}>
                {team.organization.name}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <Badge tone="brand">{team.category}</Badge>
                <span className="text-[0.75rem] tabular" style={{ color: "var(--text-muted)" }}>
                  {team._count.players} {t("common.players")} · {team._count.testSessions}{" "}
                  {t("dashboard.sessions")}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const [user, t] = await Promise.all([requireUser(), getT()]);

  return (
    <>
      <PageHeader
        title={`${t("dashboard.greeting")} ${user.name.split(" ")[0]}`}
        description={t("dashboard.subtitle")}
        action={
          <Link href="/app/sessions/new" className="btn btn-primary">
            <Plus size={16} aria-hidden="true" />
            {t("dashboard.newSession")}
          </Link>
        }
      />

      {/* Le guide passe avant les indicateurs : sur un compte neuf, ceux ci
          affichent des zeros qui n'apprennent rien, alors que le guide dit
          quoi faire. Il disparait seul une fois les trois etapes franchies. */}
      <Suspense fallback={null}>
        <OnboardingSection user={user} />
      </Suspense>

      <div className="mb-5">
        <Suspense fallback={<SkeletonStats />}>
          <StatsSection user={user} />
        </Suspense>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2">
          <PanelHeader
            title={t("dashboard.watchlist")}
            subtitle={t("dashboard.watchlistSubtitle")}
            icon={<AlertTriangle size={16} />}
          />
          <Suspense fallback={<SkeletonList items={6} />}>
            <AlertsSection user={user} />
          </Suspense>
        </Panel>

        <Panel>
          <PanelHeader
            title={t("dashboard.recentSessions")}
            subtitle={t("dashboard.recentSessionsSubtitle")}
            icon={<ClipboardList size={16} />}
          />
          <Suspense fallback={<SkeletonList items={5} avatar={false} />}>
            <RecentSessionsSection user={user} />
          </Suspense>
        </Panel>
      </div>

      <Panel className="mt-4">
        <PanelHeader
          title={t("dashboard.yourTeams")}
          subtitle={t("dashboard.yourTeamsSubtitle")}
          icon={<UsersRound size={16} />}
          action={
            <Link href="/app/teams" className="btn btn-ghost">
              {t("common.viewAll")}
            </Link>
          }
        />
        <Suspense fallback={<SkeletonCards count={3} />}>
          <TeamsSection user={user} />
        </Suspense>
      </Panel>
    </>
  );
}
