import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BarChart3, ChevronLeft, Plus, Settings, UserPlus, Users } from "lucide-react";

import { canAccessTeam, requireUser } from "@/lib/auth";
import { getSquadOverview, getTeamHeader, metricLabel } from "@/lib/queries";
import { TEAM_LEVEL_LABELS, type TeamLevel } from "@/lib/constants";
import { resolvePopulation } from "@/lib/sports-science/norms";
import { getLocale, getLocaleTag, getT } from "@/lib/i18n/server";
import { formatNumber } from "@/lib/utils";
import {
  Alert,
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  PanelHeader,
  StatCard,
} from "@/components/ui/primitives";
import { SkeletonStats, SkeletonTable } from "@/components/ui/skeleton";
import { SquadTable, type SquadTableColumn } from "@/components/squad-table";

export const dynamic = "force-dynamic";

/** Colonnes affichees dans le tableau d'effectif, dans l'ordre de lecture du staff. */
const COLUMN_CONFIG: Array<{ key: string; decimals: number; unit: string; higherIsBetter: boolean }> = [
  { key: "sprint_10m", decimals: 3, unit: "s", higherIsBetter: false },
  { key: "sprint_30m", decimals: 3, unit: "s", higherIsBetter: false },
  { key: "sprint_vmax", decimals: 1, unit: "km/h", higherIsBetter: true },
  { key: "sprint_f0", decimals: 2, unit: "N/kg", higherIsBetter: true },
  { key: "cmj_height", decimals: 1, unit: "cm", higherIsBetter: true },
  { key: "cmj_asym", decimals: 1, unit: "%", higherIsBetter: false },
  { key: "cod_505_best", decimals: 3, unit: "s", higherIsBetter: false },
  { key: "nordic_rel", decimals: 2, unit: "N/kg", higherIsBetter: true },
  { key: "groin_add_rel", decimals: 2, unit: "N/kg", higherIsBetter: true },
  { key: "vift", decimals: 1, unit: "km/h", higherIsBetter: true },
  { key: "vo2max_ift", decimals: 1, unit: "ml/kg/min", higherIsBetter: true },
  { key: "vo2max_yoyo", decimals: 1, unit: "ml/kg/min", higherIsBetter: true },
  { key: "body_fat", decimals: 1, unit: "%", higherIsBetter: false },
];

async function SquadStatsSection({ teamId }: { teamId: string }) {
  const [overview, t] = await Promise.all([getSquadOverview(teamId), getT()]);
  if (!overview) return null;

  const { rows } = overview;
  const availablePlayers = rows.filter((r) => r.status === "ACTIVE").length;
  const totalAlerts = rows.reduce((a, r) => a + r.alerts, 0);
  const criticalAlerts = rows.reduce((a, r) => a + r.criticalAlerts, 0);
  const testedPlayers = rows.filter((r) => Object.keys(r.metrics).length > 0).length;

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label={t("teams.statSquad")}
        value={rows.length}
        hint={`${availablePlayers} ${t("teams.statAvailable")}`}
        icon={<Users size={15} />}
      />
      <StatCard
        label={t("teams.statTested")}
        value={testedPlayers}
        hint={`${t("common.of")} ${rows.length}`}
        tone={testedPlayers < rows.length ? "warning" : "positive"}
      />
      <StatCard
        label={t("teams.statAlerts")}
        value={totalAlerts}
        hint={t("teams.statAlertsHint")}
        tone={totalAlerts > 0 ? "warning" : "positive"}
      />
      <StatCard
        label={t("teams.statCritical")}
        value={criticalAlerts}
        hint={t("teams.statCriticalHint")}
        tone={criticalAlerts > 0 ? "danger" : "positive"}
      />
    </section>
  );
}

async function SquadSection({ teamId, canEdit }: { teamId: string; canEdit: boolean }) {
  const [overview, t, locale, tag] = await Promise.all([
    getSquadOverview(teamId),
    getT(),
    getLocale(),
    getLocaleTag(),
  ]);
  if (!overview) return null;

  const { rows, squadStats } = overview;

  // On ne garde que les colonnes reellement renseignees pour cette equipe.
  const columns: SquadTableColumn[] = COLUMN_CONFIG.filter((config) =>
    rows.some((row) => row.metrics[config.key] !== undefined),
  ).map((config) => ({
    key: config.key,
    label: metricLabel(config.key, locale),
    unit: config.unit,
    decimals: config.decimals,
    higherIsBetter: config.higherIsBetter,
  }));

  const statsRecord = Object.fromEntries(
    [...squadStats.entries()].map(([key, stats]) => [
      key,
      { mean: stats.mean, sd: stats.sd, n: stats.n },
    ]),
  );

  return (
    <>
      <Panel className="p-4">
        <PanelHeader
          title={t("teams.squad")}
          subtitle={t("teams.squadSubtitle")}
          icon={<Users size={16} />}
        />
        {rows.length === 0 ? (
          <EmptyState
            title={t("teams.noPlayers")}
            description={t("teams.noPlayersBody")}
            icon={<Users size={20} />}
            action={
              canEdit ? (
                <Link href={`/app/teams/${teamId}/manage`} className="btn btn-primary">
                  <UserPlus size={15} aria-hidden="true" />
                  {t("manage.addPlayer")}
                </Link>
              ) : null
            }
          />
        ) : (
          /*
           * L'effectif s'affiche des qu'il y a un joueur, meme sans aucune mesure.
           * Auparavant l'absence de colonne renvoyait vers un etat vide, ce qui
           * masquait completement les joueurs d'une equipe qui n'a pas encore
           * passe de tests : on croyait l'ajout perdu.
           */
          <>
            {columns.length === 0 ? (
              <div className="mb-3">
                <Alert tone="info" title={t("teams.noTestData")}>
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    {t("teams.noTestDataBody")}
                    {canEdit ? (
                      <Link
                        href={`/app/sessions/new?team=${teamId}`}
                        className="underline cursor-pointer font-medium"
                      >
                        {t("dashboard.createSession")}
                      </Link>
                    ) : null}
                  </span>
                </Alert>
              </div>
            ) : null}
            <SquadTable rows={rows} columns={columns} squadStats={statsRecord} />
          </>
        )}
      </Panel>

      {squadStats.size > 0 ? (
        <Panel className="mt-4">
          <PanelHeader
            title={t("teams.groupStats")}
            subtitle={t("teams.groupStatsSubtitle")}
            icon={<BarChart3 size={16} />}
          />
          <div className="scroll-x">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">{t("teams.metric")}</th>
                  <th scope="col">{t("teams.mean")}</th>
                  <th scope="col">{t("teams.sd")}</th>
                  <th scope="col">{t("teams.cv")}</th>
                  <th scope="col">{t("teams.measured")}</th>
                </tr>
              </thead>
              <tbody>
                {[...squadStats.entries()]
                  .filter(([key]) => COLUMN_CONFIG.some((c) => c.key === key))
                  .map(([key, stats]) => {
                    const config = COLUMN_CONFIG.find((c) => c.key === key)!;
                    const cv = stats.mean === 0 ? 0 : (stats.sd / stats.mean) * 100;
                    return (
                      <tr key={key}>
                        <td className="font-medium">{metricLabel(key, locale)}</td>
                        <td className="tabular">
                          {formatNumber(stats.mean, config.decimals, tag)}{" "}
                          <span style={{ color: "var(--text-muted)" }}>{stats.unit}</span>
                        </td>
                        <td className="tabular">{formatNumber(stats.sd, config.decimals, tag)}</td>
                        <td className="tabular">{formatNumber(cv, 1, tag)} %</td>
                        <td className="tabular">{stats.n}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <p className="text-[0.75rem] mt-2" style={{ color: "var(--text-muted)" }}>
            {t("teams.cvNote")}
          </p>
        </Panel>
      ) : null}
    </>
  );
}

export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;

  // Trois requetes legeres et indexees, groupees en deux allers retours :
  // le cadre de la page est donc affiche sans attendre le calcul de l'effectif.
  const [user, team, t, locale] = await Promise.all([
    requireUser(),
    getTeamHeader(teamId),
    getT(),
    getLocale(),
  ]);
  if (!team) notFound();

  const access = await canAccessTeam(user, teamId);
  if (!access.allowed) redirect("/app/teams");

  const population = resolvePopulation(team.category, team.level)
    .replace(/_/g, " ")
    .toLowerCase();

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link
            href="/app/teams"
            className="inline-flex items-center gap-1 text-[0.8125rem] cursor-pointer hover:underline"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronLeft size={14} aria-hidden="true" />
            {t("teams.title")}
          </Link>
        }
        title={team.name}
        description={`${team.organization.name} · ${t("teams.season").toLowerCase()} ${team.season} · ${t("teams.referencePopulation")} ${population}`}
        action={
          <>
            {access.canEdit ? (
              <Link href={`/app/teams/${team.id}/manage`} className="btn btn-secondary">
                <Settings size={15} aria-hidden="true" />
                {t("manage.open")}
              </Link>
            ) : null}
            <Link href={`/app/analytics?team=${team.id}`} className="btn btn-secondary">
              <BarChart3 size={15} aria-hidden="true" />
              {t("teams.analytics")}
            </Link>
            <Link href={`/app/sessions/new?team=${team.id}`} className="btn btn-primary">
              <Plus size={15} aria-hidden="true" />
              {t("dashboard.newSession")}
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <Badge tone="brand">{team.category}</Badge>
        {team.level ? (
          <Badge>{TEAM_LEVEL_LABELS[team.level as TeamLevel]?.[locale] ?? team.level}</Badge>
        ) : null}
        <Badge>{team.sex === "F" ? t("teams.feminine") : t("teams.masculine")}</Badge>
      </div>

      <div className="mb-5">
        <Suspense fallback={<SkeletonStats />}>
          <SquadStatsSection teamId={teamId} />
        </Suspense>
      </div>

      <Suspense
        fallback={
          <Panel className="p-4">
            <PanelHeader
              title={t("teams.squad")}
              subtitle={t("teams.squadSubtitle")}
              icon={<Users size={16} />}
            />
            <SkeletonTable rows={10} columns={7} />
          </Panel>
        }
      >
        <SquadSection teamId={teamId} canEdit={access.canEdit} />
      </Suspense>
    </>
  );
}
