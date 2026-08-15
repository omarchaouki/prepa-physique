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
  getRecentSessions,
  getSquadAlerts,
  listTeams,
} from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import {
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  PanelHeader,
  StatCard,
} from "@/components/ui/primitives";
import {
  SkeletonCards,
  SkeletonList,
  SkeletonStats,
} from "@/components/ui/skeleton";

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

// ---------------------------------------------------------------------------

async function StatsSection({ user }: { user: CurrentUser }) {
  const stats = await getDashboardStats(user);
  const daysSinceLastTest = stats.lastTestDate
    ? Math.floor((Date.now() - stats.lastTestDate.getTime()) / 86_400_000)
    : null;

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label="Equipes"
        value={stats.teamCount}
        hint={stats.teamCount > 1 ? "suivies" : "suivie"}
        icon={<UsersRound size={15} />}
      />
      <StatCard
        label="Joueurs"
        value={stats.playerCount}
        hint={`${stats.injuredCount} indisponibles`}
        tone={stats.injuredCount > 0 ? "warning" : "neutral"}
        icon={<Activity size={15} />}
      />
      <StatCard
        label="Passations"
        value={stats.sessionCount}
        hint="depuis le debut"
        icon={<ClipboardList size={15} />}
      />
      <StatCard
        label="Dernier test"
        value={daysSinceLastTest === null ? "—" : daysSinceLastTest}
        unit={daysSinceLastTest === null ? undefined : "j"}
        hint={stats.lastTestDate ? formatDate(stats.lastTestDate) : "aucune donnee"}
        tone={daysSinceLastTest !== null && daysSinceLastTest > 60 ? "warning" : "neutral"}
        icon={<CalendarClock size={15} />}
      />
    </section>
  );
}

// ---------------------------------------------------------------------------

async function AlertsSection({ user }: { user: CurrentUser }) {
  const alerts = await getSquadAlerts(user);

  if (alerts.length === 0) {
    return (
      <EmptyState
        title="Aucune alerte active"
        description="Aucun joueur ne depasse les seuils de vigilance sur les tests enregistres."
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
                {alert.teamName} · {alert.position} · {alert.ageYears.toFixed(0)} ans
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {alert.criticalAlerts > 0 ? (
                <Badge tone="danger">
                  {alert.criticalAlerts} critique{alert.criticalAlerts > 1 ? "s" : ""}
                </Badge>
              ) : null}
              <Badge tone="warning">{alert.alerts} alertes</Badge>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------

async function RecentSessionsSection({ user }: { user: CurrentUser }) {
  const sessions = await getRecentSessions(user);

  if (sessions.length === 0) {
    return (
      <EmptyState
        title="Aucune passation"
        description="Commencez par creer une session de tests."
        action={
          <Link href="/app/sessions/new" className="btn btn-primary">
            <Plus size={15} aria-hidden="true" />
            Creer une passation
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
              {formatDate(session.date)} · {session.team.name} · {session._count.results} resultats
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------

async function TeamsSection({ user }: { user: CurrentUser }) {
  const teams = await listTeams(user);

  if (teams.length === 0) {
    return (
      <EmptyState
        title="Aucune equipe"
        description="Votre administrateur doit vous rattacher a une equipe pour commencer."
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
                  {team._count.players} joueurs · {team._count.testSessions} passations
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader
        title={`Bonjour ${user.name.split(" ")[0]}`}
        description="Vue d'ensemble de vos equipes, des dernieres passations et des joueurs a surveiller."
        action={
          <Link href="/app/sessions/new" className="btn btn-primary">
            <Plus size={16} aria-hidden="true" />
            Nouvelle passation
          </Link>
        }
      />

      <div className="mb-5">
        <Suspense fallback={<SkeletonStats />}>
          <StatsSection user={user} />
        </Suspense>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="Joueurs a surveiller"
            subtitle="Classes par gravite des alertes issues des dernieres mesures"
            icon={<AlertTriangle size={16} />}
          />
          <Suspense fallback={<SkeletonList items={6} />}>
            <AlertsSection user={user} />
          </Suspense>
        </Panel>

        <Panel>
          <PanelHeader
            title="Dernieres passations"
            subtitle="Les cinq plus recentes"
            icon={<ClipboardList size={16} />}
          />
          <Suspense fallback={<SkeletonList items={5} avatar={false} />}>
            <RecentSessionsSection user={user} />
          </Suspense>
        </Panel>
      </div>

      <Panel className="mt-4">
        <PanelHeader
          title="Vos equipes"
          subtitle="Acces direct a l'effectif et aux analyses"
          icon={<UsersRound size={16} />}
          action={
            <Link href="/app/teams" className="btn btn-ghost">
              Tout voir
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
