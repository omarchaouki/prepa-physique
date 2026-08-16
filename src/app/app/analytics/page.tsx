import { Suspense } from "react";
import Link from "next/link";
import { BarChart3 } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { getSquadOverview, listTeams, metricLabel } from "@/lib/queries";
import { compareToNorm } from "@/lib/sports-science/norms";
import { getLocale, getT } from "@/lib/i18n/server";
import { EmptyState, PageHeader, Panel } from "@/components/ui/primitives";
import { Skeleton, SkeletonChart, SkeletonStats, SkeletonTable } from "@/components/ui/skeleton";
import {
  AnalyticsBoard,
  type AnalyticsMetric,
  type AnalyticsPlayer,
} from "@/components/analytics-board";

export const dynamic = "force-dynamic";

/** Metriques proposees dans les analyses, avec leur mise en forme. */
const METRIC_CONFIG: Array<{ key: string; decimals: number; unit: string; higherIsBetter: boolean }> = [
  { key: "sprint_10m", decimals: 3, unit: "s", higherIsBetter: false },
  { key: "sprint_20m", decimals: 3, unit: "s", higherIsBetter: false },
  { key: "sprint_30m", decimals: 3, unit: "s", higherIsBetter: false },
  { key: "sprint_vmax", decimals: 1, unit: "km/h", higherIsBetter: true },
  { key: "sprint_f0", decimals: 2, unit: "N/kg", higherIsBetter: true },
  { key: "sprint_v0", decimals: 2, unit: "m/s", higherIsBetter: true },
  { key: "sprint_pmax", decimals: 2, unit: "W/kg", higherIsBetter: true },
  { key: "cmj_height", decimals: 1, unit: "cm", higherIsBetter: true },
  { key: "cmj_power_rel", decimals: 1, unit: "W/kg", higherIsBetter: true },
  { key: "cmj_rsi_mod", decimals: 3, unit: "m/s", higherIsBetter: true },
  { key: "cmj_asym", decimals: 1, unit: "%", higherIsBetter: false },
  { key: "cod_505_best", decimals: 3, unit: "s", higherIsBetter: false },
  { key: "cod_505_asym", decimals: 1, unit: "%", higherIsBetter: false },
  { key: "nordic_rel", decimals: 2, unit: "N/kg", higherIsBetter: true },
  { key: "nordic_asym", decimals: 1, unit: "%", higherIsBetter: false },
  { key: "groin_add_rel", decimals: 2, unit: "N/kg", higherIsBetter: true },
  { key: "groin_ratio", decimals: 2, unit: "", higherIsBetter: true },
  { key: "vift", decimals: 1, unit: "km/h", higherIsBetter: true },
  { key: "vo2max_ift", decimals: 1, unit: "ml/kg/min", higherIsBetter: true },
  { key: "vo2max_yoyo", decimals: 1, unit: "ml/kg/min", higherIsBetter: true },
  { key: "body_fat", decimals: 1, unit: "%", higherIsBetter: false },
  { key: "lean_mass", decimals: 1, unit: "kg", higherIsBetter: true },
  { key: "weight", decimals: 1, unit: "kg", higherIsBetter: true },
  { key: "height", decimals: 1, unit: "cm", higherIsBetter: true },
];

async function AnalyticsSection({ teamId }: { teamId: string }) {
  const [overview, t, locale] = await Promise.all([getSquadOverview(teamId), getT(), getLocale()]);

  if (!overview || overview.rows.length === 0) {
    return (
      <Panel>
        <EmptyState
          title={t("analytics.noData")}
          description={t("analytics.noDataBody")}
          icon={<BarChart3 size={20} />}
        />
      </Panel>
    );
  }

  const availableMetrics: AnalyticsMetric[] = METRIC_CONFIG.filter((config) =>
    overview.rows.some((row) => row.metrics[config.key] !== undefined),
  ).map((config) => {
    const sample = overview.rows.find((row) => row.metrics[config.key] !== undefined);
    const comparison = sample
      ? compareToNorm(config.key, sample.metrics[config.key]!.value, overview.population, "M")
      : null;
    return {
      key: config.key,
      label: metricLabel(config.key, locale),
      unit: config.unit,
      decimals: config.decimals,
      higherIsBetter: config.higherIsBetter,
      normMean: comparison?.normMean ?? null,
    };
  });

  const players: AnalyticsPlayer[] = overview.rows.map((row) => ({
    id: row.id,
    name: `${row.lastName} ${row.firstName.charAt(0)}.`,
    position: row.position,
    status: row.status,
    metrics: Object.fromEntries(
      Object.entries(row.metrics).filter(([, value]) => value !== undefined),
    ) as AnalyticsPlayer["metrics"],
  }));

  return (
    <AnalyticsBoard players={players} metrics={availableMetrics} teamName={overview.team.name} />
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <Panel>
        <div className="grid sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((index) => (
            <div key={index}>
              <Skeleton className="h-3 w-28 mb-1.5" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </Panel>
      <SkeletonStats />
      <Panel>
        <Skeleton className="h-4 w-56 mb-1.5" />
        <Skeleton className="h-3 w-40 mb-4" />
        <SkeletonChart height={360} />
      </Panel>
      <div className="grid lg:grid-cols-2 gap-4">
        <Panel>
          <Skeleton className="h-4 w-48 mb-4" />
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((index) => (
              <div key={index}>
                <Skeleton className="h-3 w-full mb-1.5" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <Skeleton className="h-4 w-52 mb-4" />
          <SkeletonChart height={280} />
        </Panel>
      </div>
      <Panel className="p-4">
        <Skeleton className="h-4 w-40 mb-4" />
        <SkeletonTable rows={8} columns={6} firstColumnWide={false} />
      </Panel>
    </div>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const user = await requireUser();
  const [{ team: teamParam }, teams, t] = await Promise.all([
    searchParams,
    listTeams(user),
    getT(),
  ]);

  if (teams.length === 0) {
    return (
      <>
        <PageHeader title={t("analytics.title")} />
        <Panel>
          <EmptyState title={t("analytics.noTeam")} icon={<BarChart3 size={20} />} />
        </Panel>
      </>
    );
  }

  const activeTeamId = teamParam && teams.some((t) => t.id === teamParam) ? teamParam : teams[0].id;

  return (
    <>
      <PageHeader
        title={t("analytics.title")}
        description={t("analytics.subtitle")}
      />

      {teams.length > 1 ? (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/app/analytics?team=${team.id}`}
              className="btn cursor-pointer"
              style={{
                background: team.id === activeTeamId ? "var(--accent)" : "var(--surface-panel)",
                color: team.id === activeTeamId ? "var(--accent-text)" : "var(--text-secondary)",
                border: `1px solid ${team.id === activeTeamId ? "var(--accent)" : "var(--border-strong)"}`,
                fontWeight: team.id === activeTeamId ? 600 : 400,
              }}
              aria-current={team.id === activeTeamId ? "page" : undefined}
            >
              {team.name}
            </Link>
          ))}
        </div>
      ) : null}

      {/* La cle force un nouveau squelette quand on change d'equipe. */}
      <Suspense key={activeTeamId} fallback={<AnalyticsSkeleton />}>
        <AnalyticsSection teamId={activeTeamId} />
      </Suspense>
    </>
  );
}
