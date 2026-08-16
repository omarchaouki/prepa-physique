import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ChevronLeft,
  ClipboardList,
  Gauge,
  Info,
  Lightbulb,
  Pencil,
  Radar as RadarIcon,
  Scale,
  TrendingUp,
} from "lucide-react";

import { canAccessTeam, requireUser } from "@/lib/auth";
import { getMetricSeries, getPlayerIdentity, getPlayerProfile, metricLabel } from "@/lib/queries";
import {
  POSITION_LABELS,
  PLAYER_STATUS_LABELS,
  type PlayerStatus,
  type Position,
} from "@/lib/constants";
import { areaLabel, severityLabel, type Severity } from "@/lib/sports-science/recommendations";
import { getTest } from "@/lib/sports-science/catalog";
import { getLocale, getLocaleTag, getT, pick } from "@/lib/i18n/server";
import type { Locale, Translator } from "@/lib/i18n/dictionary";
import { ageExact, formatDate, formatNumber, percentileColor } from "@/lib/utils";
import {
  Alert,
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  PanelHeader,
  PercentileBar,
  StatCard,
} from "@/components/ui/primitives";
import {
  Skeleton,
  SkeletonChart,
  SkeletonList,
  SkeletonRadar,
  SkeletonStats,
  SkeletonTable,
  SkeletonText,
} from "@/components/ui/skeleton";
import { AsymmetryChart, ForceVelocityChart, ProfileRadar } from "@/components/charts/charts";
import { PlayerTrends, type TrendSeries } from "@/components/player-trends";

export const dynamic = "force-dynamic";

/**
 * La fiche joueur combine tout l'historique de mesures, les percentiles et le
 * moteur de recommandations. C'est l'ecran le plus couteux de l'application.
 *
 * L'identite du joueur vient d'une requete d'une seule ligne : le nom, le poste
 * et les badges sont donc affiches immediatement. Tout le reste arrive ensuite,
 * par blocs, chacun avec un squelette a sa taille exacte pour qu'aucun element
 * ne se decale a l'arrivee des donnees.
 */

const SEVERITY_TONE: Record<Severity, "danger" | "warning" | "info" | "neutral"> = {
  critique: "danger",
  important: "warning",
  suivi: "info",
  information: "neutral",
};

const HIGHLIGHT_METRICS: Array<{ key: string; decimals: number; higherIsBetter: boolean }> = [
  { key: "sprint_10m", decimals: 3, higherIsBetter: false },
  { key: "sprint_vmax", decimals: 1, higherIsBetter: true },
  { key: "cmj_height", decimals: 1, higherIsBetter: true },
  { key: "vift", decimals: 1, higherIsBetter: true },
];

const DECIMALS: Record<string, number> = {
  sprint_5m: 3, sprint_10m: 3, sprint_20m: 3, sprint_30m: 3, sprint_40m: 3,
  cod_505: 3, cod_505_best: 3, cod_deficit: 3, sprint_tau: 3, dj_contact: 3,
  cmj_rsi_mod: 3, cmj_eur: 3, sprint_drf: 3,
  cmj_power: 0, imtp_peak: 0, nordic_force: 0, groin_add: 0, hr_rest: 0, hr_max: 0,
  hr_reserve: 0, yoyo_ir1_distance: 0, yoyo_ir2_distance: 0, imtp_rfd100: 0, imtp_rfd200: 0,
};

const decimalsFor = (key: string) => DECIMALS[key] ?? 2;

/** Contexte linguistique commun a toutes les zones de la fiche. */
const localeBundle = async (): Promise<{ t: Translator; locale: Locale; tag: string }> => {
  const [t, locale, tag] = await Promise.all([getT(), getLocale(), getLocaleTag()]);
  return { t, locale, tag };
};

// ---------------------------------------------------------------------------
// Indicateurs cles
// ---------------------------------------------------------------------------

async function HighlightsSection({ playerId }: { playerId: string }) {
  const { t, locale, tag } = await localeBundle();
  const profile = await getPlayerProfile(playerId, locale);
  if (!profile) return null;

  const find = (key: string) => profile.comparisons.find((c) => c.key === key && !c.side);

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {HIGHLIGHT_METRICS.map((highlight) => {
        const metric = find(highlight.key);
        if (!metric) {
          return (
            <StatCard
              key={highlight.key}
              label={metricLabel(highlight.key, locale)}
              value="—"
              hint={t("player.testNotDone")}
            />
          );
        }
        const tone =
          metric.percentile === null
            ? "neutral"
            : metric.percentile < 25
              ? "danger"
              : metric.percentile < 40
                ? "warning"
                : metric.percentile > 70
                  ? "positive"
                  : "neutral";
        return (
          <StatCard
            key={highlight.key}
            label={metricLabel(highlight.key, locale)}
            value={formatNumber(metric.value, highlight.decimals, tag)}
            unit={metric.unit}
            hint={
              metric.percentile !== null
                ? `${metric.percentile}${t("player.percentileSuffix")}`
                : formatDate(metric.date, tag)
            }
            tone={tone}
            trend={
              metric.changePct !== null
                ? { value: metric.changePct, goodWhenPositive: highlight.higherIsBetter }
                : undefined
            }
          />
        );
      })}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Radar de profil
// ---------------------------------------------------------------------------

async function RadarSection({ playerId }: { playerId: string }) {
  const { t, locale } = await localeBundle();
  const profile = await getPlayerProfile(playerId, locale);
  if (!profile) return null;

  return (
    <>
      <ProfileRadar data={profile.radar} height={280} />
      <div className="mt-2 space-y-1.5">
        {profile.radar.map((entry) => (
          <div key={entry.key} className="flex items-center justify-between gap-3 text-[0.8125rem]">
            <span className="truncate" style={{ color: "var(--text-secondary)" }}>
              {entry.label}
            </span>
            {entry.percentile !== null ? (
              <PercentileBar percentile={entry.percentile} />
            ) : (
              <span style={{ color: "var(--text-muted)" }}>{t("common.notMeasured")}</span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Recommandations
// ---------------------------------------------------------------------------

async function RecommendationsSection({ playerId }: { playerId: string }) {
  const { t, locale } = await localeBundle();
  const profile = await getPlayerProfile(playerId, locale);
  if (!profile) return null;

  const { recommendations } = profile;

  if (recommendations.length === 0) {
    return (
      <EmptyState
        title={t("player.noRecommendations")}
        description={t("player.noRecommendationsBody")}
        icon={<Lightbulb size={20} />}
      />
    );
  }

  return (
    <ul className="space-y-2.5">
      {recommendations.map((recommendation) => (
        <li
          key={recommendation.id}
          className="panel-sunken p-3"
          style={{
            borderLeft: `3px solid ${
              recommendation.severity === "critique"
                ? "var(--danger)"
                : recommendation.severity === "important"
                  ? "var(--warning)"
                  : "var(--accent)"
            }`,
          }}
        >
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <Badge tone={SEVERITY_TONE[recommendation.severity]}>
              {severityLabel(recommendation.severity, locale)}
            </Badge>
            <Badge>{areaLabel(recommendation.area, locale)}</Badge>
          </div>

          <p className="font-medium text-[0.9375rem]">{recommendation.title}</p>
          <p className="text-[0.8125rem] mt-1 tabular" style={{ color: "var(--text-primary)" }}>
            {recommendation.finding}
          </p>
          <p
            className="text-[0.8125rem] mt-1.5 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {recommendation.rationale}
          </p>

          <ul className="mt-2 space-y-1">
            {recommendation.actions.map((action) => (
              <li key={action} className="flex gap-2 text-[0.8125rem]">
                <span
                  className="mt-1.5 size-1 rounded-full shrink-0"
                  style={{ background: "var(--accent)" }}
                  aria-hidden="true"
                />
                <span style={{ color: "var(--text-secondary)" }}>{action}</span>
              </li>
            ))}
          </ul>

          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 pt-2 text-[0.75rem]"
            style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}
          >
            {recommendation.weeklyDose ? (
              <span>
                {t("player.dose")} : {recommendation.weeklyDose}
              </span>
            ) : null}
            <span>
              {t("common.source")} : {recommendation.reference}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Evolution
// ---------------------------------------------------------------------------

async function TrendsSection({ playerId }: { playerId: string }) {
  const { locale } = await localeBundle();
  const profile = await getPlayerProfile(playerId, locale);
  if (!profile) return null;

  const { metrics, comparisons } = profile;
  const find = (key: string) => comparisons.find((c) => c.key === key && !c.side);

  const trendKeys = [...new Set(metrics.filter((m) => !m.side).map((m) => m.key))];
  const series: TrendSeries[] = trendKeys
    .map((key) => {
      const points = getMetricSeries(metrics, key, null);
      const comparison = find(key);
      return {
        key,
        label: metricLabel(key, locale),
        unit: comparison?.unit ?? "",
        decimals: decimalsFor(key),
        higherIsBetter: comparison?.higherIsBetter ?? true,
        normMean: comparison?.normMean ?? null,
        points: points.map((p) => ({ date: p.date.toISOString(), value: p.value })),
      };
    })
    .filter((s) => s.points.length >= 2)
    .sort((a, b) => a.label.localeCompare(b.label));

  return <PlayerTrends series={series} />;
}

// ---------------------------------------------------------------------------
// Asymetries
// ---------------------------------------------------------------------------

async function AsymmetrySection({ playerId }: { playerId: string }) {
  const { t, locale, tag } = await localeBundle();
  const profile = await getPlayerProfile(playerId, locale);
  if (!profile) return null;

  const { comparisons } = profile;
  const bilateralKeys = [...new Set(comparisons.filter((c) => c.side).map((c) => c.key))];
  const items = bilateralKeys
    .map((key) => {
      const left = comparisons.find((c) => c.key === key && c.side === "L");
      const right = comparisons.find((c) => c.key === key && c.side === "R");
      if (!left || !right) return null;
      return {
        label: metricLabel(key, locale),
        left: left.value,
        right: right.value,
        unit: left.unit,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <>
      <AsymmetryChart items={items} height={Math.max(190, items.length * 46 + 50)} />
      {items.length > 0 ? (
        <div className="scroll-x mt-3">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">{t("player.measure")}</th>
                <th scope="col">{t("player.left")}</th>
                <th scope="col">{t("player.right")}</th>
                <th scope="col">{t("player.gap")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const high = Math.max(item.left, item.right);
                const low = Math.min(item.left, item.right);
                const gap = high === 0 ? 0 : ((high - low) / high) * 100;
                return (
                  <tr key={item.label}>
                    <td className="font-medium">{item.label}</td>
                    <td className="tabular">
                      {formatNumber(item.left, 1, tag)} {item.unit}
                    </td>
                    <td className="tabular">
                      {formatNumber(item.right, 1, tag)} {item.unit}
                    </td>
                    <td
                      className="tabular font-medium"
                      style={{
                        color:
                          gap > 15 ? "var(--danger)" : gap > 10 ? "var(--warning)" : "var(--success)",
                      }}
                    >
                      {formatNumber(gap, 1, tag)} %
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------------------
// Profil force vitesse
// ---------------------------------------------------------------------------

async function ForceVelocitySection({ playerId }: { playerId: string }) {
  const { t, locale, tag } = await localeBundle();
  const profile = await getPlayerProfile(playerId, locale);
  if (!profile) return null;

  const find = (key: string) => profile.comparisons.find((c) => c.key === key && !c.side);
  const f0 = find("sprint_f0");
  const v0 = find("sprint_v0");
  const pmax = find("sprint_pmax");

  if (!f0 || !v0 || !pmax) {
    return (
      <EmptyState
        title={t("player.fvUnavailable")}
        description={t("player.fvUnavailableBody")}
        icon={<Gauge size={20} />}
      />
    );
  }

  return (
    <>
      <ForceVelocityChart f0={f0.value} v0={v0.value} pmax={pmax.value} height={230} />
      <div className="grid grid-cols-3 gap-2 mt-3">
        {[
          { label: "F0", metric: f0, unit: "N/kg" },
          { label: "V0", metric: v0, unit: "m/s" },
          { label: "Pmax", metric: pmax, unit: "W/kg" },
        ].map((item) => (
          <div key={item.label} className="panel-sunken p-2.5 text-center">
            <p
              className="text-[0.6875rem] uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              {item.label}
            </p>
            <p className="text-lg font-semibold tabular mt-0.5">
              {formatNumber(item.metric.value, 2, tag)}
            </p>
            <p className="text-[0.6875rem]" style={{ color: "var(--text-muted)" }}>
              {item.unit}
            </p>
            {item.metric.percentile !== null ? (
              <p
                className="text-[0.6875rem] mt-1 tabular font-medium"
                style={{ color: percentileColor(item.metric.percentile) }}
              >
                {item.metric.percentile}
                {t("player.percentileSuffix")}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      <p className="text-[0.75rem] mt-2.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {t("player.fvNote")}
      </p>
    </>
  );
}

// ---------------------------------------------------------------------------
// Toutes les mesures
// ---------------------------------------------------------------------------

async function MeasuresSection({ playerId }: { playerId: string }) {
  const { t, locale, tag } = await localeBundle();
  const profile = await getPlayerProfile(playerId, locale);
  if (!profile) return null;

  const rows = profile.comparisons
    .filter((c) => !c.side)
    .sort((a, b) => {
      if (a.percentile === null && b.percentile === null) return a.label.localeCompare(b.label);
      if (a.percentile === null) return 1;
      if (b.percentile === null) return -1;
      return a.percentile - b.percentile;
    });

  return (
    <>
      <div className="scroll-x">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col" style={{ minWidth: "13rem" }}>{t("teams.metric")}</th>
              <th scope="col">{t("common.value")}</th>
              <th scope="col">{t("player.change")}</th>
              <th scope="col">{t("player.reference")}</th>
              <th scope="col" style={{ minWidth: "9rem" }}>{t("player.percentile")}</th>
              <th scope="col">{t("player.group")}</th>
              <th scope="col">{t("common.date")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((comparison) => (
              <tr key={`${comparison.key}-${comparison.side ?? ""}`}>
                <td className="font-medium">{comparison.label}</td>
                <td className="tabular">
                  {formatNumber(comparison.value, decimalsFor(comparison.key), tag)}{" "}
                  <span style={{ color: "var(--text-muted)" }}>{comparison.unit}</span>
                </td>
                <td className="tabular">
                  {comparison.changePct === null ? (
                    <span style={{ color: "var(--text-muted)" }}>—</span>
                  ) : (
                    <span
                      style={{
                        color:
                          comparison.changePct === 0
                            ? "var(--text-muted)"
                            : (
                                  comparison.higherIsBetter
                                    ? comparison.changePct > 0
                                    : comparison.changePct < 0
                                )
                              ? "var(--success)"
                              : "var(--danger)",
                      }}
                    >
                      {comparison.changePct > 0 ? "+" : ""}
                      {formatNumber(comparison.changePct, 1, tag)} %
                    </span>
                  )}
                </td>
                <td className="tabular" style={{ color: "var(--text-muted)" }}>
                  {comparison.normMean === null
                    ? "—"
                    : formatNumber(comparison.normMean, decimalsFor(comparison.key), tag)}
                </td>
                <td>
                  {comparison.percentile !== null ? (
                    <PercentileBar percentile={comparison.percentile} />
                  ) : comparison.thresholdStatus ? (
                    <span
                      className="badge"
                      style={{
                        background:
                          comparison.thresholdStatus === "bon"
                            ? "var(--success-soft)"
                            : comparison.thresholdStatus === "vigilance"
                              ? "var(--warning-soft)"
                              : "var(--danger-soft)",
                        color:
                          comparison.thresholdStatus === "bon"
                            ? "var(--success)"
                            : comparison.thresholdStatus === "vigilance"
                              ? "var(--warning)"
                              : "var(--danger)",
                      }}
                    >
                      {comparison.thresholdStatus === "bon"
                        ? t("player.belowThreshold")
                        : comparison.thresholdStatus === "vigilance"
                          ? t("player.caution")
                          : t("player.aboveThreshold")}
                    </span>
                  ) : (
                    <span style={{ color: "var(--text-muted)" }}>{t("player.notReferenced")}</span>
                  )}
                </td>
                <td className="tabular">
                  {comparison.vsSquadPct === null ? (
                    <span style={{ color: "var(--text-muted)" }}>—</span>
                  ) : (
                    <span style={{ color: "var(--text-secondary)" }}>
                      {comparison.vsSquadPct > 0 ? "+" : ""}
                      {formatNumber(comparison.vsSquadPct, 1, tag)} %
                    </span>
                  )}
                </td>
                <td style={{ color: "var(--text-muted)" }}>{formatDate(comparison.date, tag)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {profile.comparisons.some((c) => c.percentile === null) ? (
        <div className="mt-3">
          <Alert tone="info" title={t("player.thresholdTitle")}>
            {t("player.thresholdBody")}
          </Alert>
        </div>
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------------------
// Historique des passations
// ---------------------------------------------------------------------------

async function HistorySection({ playerId }: { playerId: string }) {
  const { t, locale, tag } = await localeBundle();
  const profile = await getPlayerProfile(playerId, locale);
  if (!profile) return null;

  const { results } = profile;

  if (results.length === 0) {
    return <EmptyState title={t("player.noTests")} icon={<ClipboardList size={20} />} />;
  }

  return (
    <div className="scroll-x">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">{t("common.date")}</th>
            <th scope="col">{t("player.test")}</th>
            <th scope="col">{t("player.session")}</th>
            <th scope="col">{t("squad.alerts")}</th>
          </tr>
        </thead>
        <tbody>
          {results.slice(0, 40).map((result) => {
            const definition = getTest(result.testKey);
            let flags: string[] = [];
            try {
              flags = (JSON.parse(result.computedJson).flags as string[]) ?? [];
            } catch {
              flags = [];
            }
            return (
              <tr key={result.id}>
                <td style={{ color: "var(--text-secondary)" }}>{formatDate(result.date, tag)}</td>
                <td className="font-medium">
                  {definition ? pick(definition.name, locale) : result.testKey}
                </td>
                <td>
                  {result.session ? (
                    <Link
                      href={`/app/sessions/${result.session.id}`}
                      className="cursor-pointer hover:underline"
                      style={{ color: "var(--accent)" }}
                    >
                      {result.session.name}
                    </Link>
                  ) : (
                    <span style={{ color: "var(--text-muted)" }}>
                      {t("player.standaloneEntry")}
                    </span>
                  )}
                </td>
                <td>
                  {flags.length === 0 ? (
                    <span style={{ color: "var(--text-muted)" }}>—</span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1"
                      style={{ color: "var(--warning)" }}
                    >
                      <AlertTriangle size={13} aria-hidden="true" />
                      <span className="tabular text-[0.8125rem]">{flags.length}</span>
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------

export default async function PlayerPage({ params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = await params;

  // Les requetes sont independantes : les lancer ensemble economise un aller
  // retour complet, ce qui se voit des que la base est distante.
  const [user, player, t, locale] = await Promise.all([
    requireUser(),
    getPlayerIdentity(playerId),
    getT(),
    getLocale(),
  ]);
  if (!player) notFound();

  const access = await canAccessTeam(user, player.teamId);
  if (!access.allowed) redirect("/app/teams");

  const ageYears = ageExact(player.birthDate);
  const statusTone =
    player.status === "INJURED" ? "danger" : player.status === "REHAB" ? "warning" : "success";

  const footLabel =
    player.dominantFoot === "L"
      ? t("players.footLeft")
      : player.dominantFoot === "B"
        ? t("players.footBoth")
        : t("players.footRight");

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link
            href={`/app/teams/${player.teamId}`}
            className="inline-flex items-center gap-1 text-[0.8125rem] cursor-pointer hover:underline"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronLeft size={14} aria-hidden="true" />
            {player.team.name}
          </Link>
        }
        title={`${player.firstName} ${player.lastName}`}
        description={`${POSITION_LABELS[player.position as Position]?.[locale] ?? player.position} · ${ageYears.toFixed(1)} ${t("common.years")} · ${player.team.organization.name}`}
        action={
          access.canEdit ? (
            <Link href={`/app/players/${playerId}/edit`} className="btn btn-secondary">
              <Pencil size={15} aria-hidden="true" />
              {t("common.edit")}
            </Link>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <Badge tone={statusTone}>
          {PLAYER_STATUS_LABELS[player.status as PlayerStatus]?.[locale] ?? player.status}
        </Badge>
        {player.jerseyNumber ? (
          <Badge>
            {t("players.jersey")} {player.jerseyNumber}
          </Badge>
        ) : null}
        <Badge>
          {t("players.foot")} {footLabel}
        </Badge>
        {player.heightCm ? <Badge>{player.heightCm} cm</Badge> : null}
        {player.weightKg ? <Badge>{player.weightKg} kg</Badge> : null}
      </div>

      <div className="mb-4">
        <Suspense fallback={<SkeletonStats />}>
          <HighlightsSection playerId={playerId} />
        </Suspense>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Panel>
          <PanelHeader
            title={t("player.profile")}
            subtitle={t("player.profileSubtitle")}
            icon={<RadarIcon size={16} />}
          />
          <Suspense fallback={<SkeletonRadar height={280} />}>
            <RadarSection playerId={playerId} />
          </Suspense>
        </Panel>

        <Panel className="lg:col-span-2">
          <PanelHeader
            title={t("player.recommendations")}
            subtitle={t("player.recommendationsSubtitle")}
            icon={<Lightbulb size={16} />}
          />
          <Suspense
            fallback={
              <div className="space-y-2.5">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="panel-sunken p-3">
                    <div className="flex gap-1.5 mb-2">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-64 mb-2" />
                    <SkeletonText lines={3} />
                  </div>
                ))}
              </div>
            }
          >
            <RecommendationsSection playerId={playerId} />
          </Suspense>
        </Panel>
      </div>

      <Panel className="mb-4">
        <PanelHeader
          title={t("player.trend")}
          subtitle={t("player.trendSubtitle")}
          icon={<TrendingUp size={16} />}
        />
        <Suspense
          fallback={
            <>
              <Skeleton className="h-10 w-56 rounded-lg mb-3" />
              <SkeletonChart height={240} />
            </>
          }
        >
          <TrendsSection playerId={playerId} />
        </Suspense>
      </Panel>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Panel>
          <PanelHeader
            title={t("player.asymmetry")}
            subtitle={t("player.asymmetrySubtitle")}
            icon={<Scale size={16} />}
          />
          <Suspense fallback={<SkeletonChart height={200} />}>
            <AsymmetrySection playerId={playerId} />
          </Suspense>
        </Panel>

        <Panel>
          <PanelHeader
            title={t("player.fvProfile")}
            subtitle={t("player.fvProfileSubtitle")}
            icon={<Gauge size={16} />}
          />
          <Suspense fallback={<SkeletonChart height={230} />}>
            <ForceVelocitySection playerId={playerId} />
          </Suspense>
        </Panel>
      </div>

      <Panel className="mb-4">
        <PanelHeader
          title={t("player.allMeasures")}
          subtitle={t("player.allMeasuresSubtitle")}
          icon={<Activity size={16} />}
        />
        <Suspense fallback={<SkeletonTable rows={10} columns={7} firstColumnWide={false} />}>
          <MeasuresSection playerId={playerId} />
        </Suspense>
      </Panel>

      <Panel>
        <PanelHeader
          title={t("player.history")}
          subtitle={t("player.historySubtitle")}
          icon={<ClipboardList size={16} />}
        />
        <Suspense fallback={<SkeletonList items={5} avatar={false} />}>
          <HistorySection playerId={playerId} />
        </Suspense>
      </Panel>

      <p
        className="flex items-start gap-2 text-[0.75rem] mt-4 leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        <Info size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
        {t("player.footer")}
      </p>
    </>
  );
}
