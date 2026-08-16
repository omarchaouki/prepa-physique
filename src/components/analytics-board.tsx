"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, GitCompareArrows, Table2 } from "lucide-react";

import { ScatterCompare, SquadBarChart } from "@/components/charts/charts";
import { Panel, PanelHeader, StatCard } from "@/components/ui/primitives";
import { useLocaleTag, useT } from "@/lib/i18n/client";
import { formatNumber, percentileColor } from "@/lib/utils";

export interface AnalyticsPlayer {
  id: string;
  name: string;
  position: string;
  status: string;
  metrics: Record<string, { value: number; percentile: number | null }>;
}

export interface AnalyticsMetric {
  key: string;
  label: string;
  unit: string;
  decimals: number;
  higherIsBetter: boolean;
  normMean: number | null;
}

export function AnalyticsBoard({
  players,
  metrics,
  teamName,
}: {
  players: AnalyticsPlayer[];
  metrics: AnalyticsMetric[];
  teamName: string;
}) {
  const t = useT();
  const tag = useLocaleTag();
  const [primary, setPrimary] = useState(metrics[0]?.key ?? "");
  const [secondary, setSecondary] = useState(metrics[1]?.key ?? metrics[0]?.key ?? "");
  const [positionFilter, setPositionFilter] = useState("ALL");

  const positions = useMemo(
    () => [...new Set(players.map((p) => p.position))].sort(),
    [players],
  );

  const filtered = useMemo(
    () => players.filter((p) => positionFilter === "ALL" || p.position === positionFilter),
    [players, positionFilter],
  );

  const primaryMetric = metrics.find((m) => m.key === primary);
  const secondaryMetric = metrics.find((m) => m.key === secondary);

  const barData = filtered
    .filter((p) => p.metrics[primary] !== undefined)
    .map((p) => ({ id: p.id, name: p.name, value: p.metrics[primary].value }));

  const values = barData.map((d) => d.value);
  const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const spread = values.length > 1
    ? Math.sqrt(values.reduce((a, v) => a + (v - average) ** 2, 0) / (values.length - 1))
    : 0;
  const best = values.length > 0
    ? primaryMetric?.higherIsBetter
      ? Math.max(...values)
      : Math.min(...values)
    : 0;
  const worst = values.length > 0
    ? primaryMetric?.higherIsBetter
      ? Math.min(...values)
      : Math.max(...values)
    : 0;

  const scatterData = filtered
    .filter((p) => p.metrics[primary] !== undefined && p.metrics[secondary] !== undefined)
    .map((p) => ({
      name: p.name,
      x: p.metrics[primary].value,
      y: p.metrics[secondary].value,
    }));

  // Repartition en tranches de percentile, pour voir d'un coup d'oeil
  // combien de joueurs sont sous la norme.
  const distribution = useMemo(() => {
    const bands = [
      { label: t("analytics.bandVeryLow"), min: 0, max: 15, count: 0 },
      { label: t("analytics.bandLow"), min: 15, max: 35, count: 0 },
      { label: t("analytics.bandAverage"), min: 35, max: 65, count: 0 },
      { label: t("analytics.bandGood"), min: 65, max: 85, count: 0 },
      { label: t("analytics.bandVeryGood"), min: 85, max: 101, count: 0 },
    ];
    for (const player of filtered) {
      const percentile = player.metrics[primary]?.percentile;
      if (percentile == null) continue;
      const band = bands.find((b) => percentile >= b.min && percentile < b.max);
      if (band) band.count += 1;
    }
    return bands;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, primary, t]);

  const totalWithPercentile = distribution.reduce((a, b) => a + b.count, 0);

  return (
    <div className="space-y-4">
      {/* Selecteurs */}
      <Panel>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="label" htmlFor="metric-primary">
              {t("analytics.primaryMetric")}
            </label>
            <select
              id="metric-primary"
              value={primary}
              onChange={(event) => setPrimary(event.target.value)}
              className="field cursor-pointer"
            >
              {metrics.map((metric) => (
                <option key={metric.key} value={metric.key}>
                  {metric.label} ({metric.unit})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="metric-secondary">
              {t("analytics.secondaryMetric")}
            </label>
            <select
              id="metric-secondary"
              value={secondary}
              onChange={(event) => setSecondary(event.target.value)}
              className="field cursor-pointer"
            >
              {metrics.map((metric) => (
                <option key={metric.key} value={metric.key}>
                  {metric.label} ({metric.unit})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="analytics-position">
              {t("analytics.position")}
            </label>
            <select
              id="analytics-position"
              value={positionFilter}
              onChange={(event) => setPositionFilter(event.target.value)}
              className="field cursor-pointer"
            >
              <option value="ALL">{t("analytics.allPositions")}</option>
              {positions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Panel>

      {/* Indicateurs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label={t("analytics.groupMean")}
          value={formatNumber(average, primaryMetric?.decimals ?? 2, tag)}
          unit={primaryMetric?.unit}
          hint={`${barData.length} ${t("analytics.playersMeasured")}`}
        />
        <StatCard
          label={t("analytics.sd")}
          value={formatNumber(spread, primaryMetric?.decimals ?? 2, tag)}
          unit={primaryMetric?.unit}
          hint={average !== 0 ? `${formatNumber((spread / average) * 100, 1, tag)} % ${t("analytics.variation")}` : undefined}
        />
        <StatCard
          label={t("analytics.best")}
          value={formatNumber(best, primaryMetric?.decimals ?? 2, tag)}
          unit={primaryMetric?.unit}
          tone="positive"
        />
        <StatCard
          label={t("analytics.worst")}
          value={formatNumber(worst, primaryMetric?.decimals ?? 2, tag)}
          unit={primaryMetric?.unit}
          tone="warning"
        />
      </section>

      {/* Classement du groupe */}
      <Panel>
        <PanelHeader
          title={`${t("analytics.ranking")} : ${primaryMetric?.label ?? ""}`}
          subtitle={`${teamName}${positionFilter !== "ALL" ? ` · ${positionFilter}` : ""}`}
          icon={<BarChart3 size={16} />}
        />
        <SquadBarChart
          data={barData}
          unit={primaryMetric?.unit ?? ""}
          higherIsBetter={primaryMetric?.higherIsBetter ?? true}
          squadMean={average}
          height={360}
        />
      </Panel>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Repartition */}
        <Panel>
          <PanelHeader
            title={t("analytics.distribution")}
            subtitle={`${totalWithPercentile} ${t("analytics.distributionHint")}`}
            icon={<Table2 size={16} />}
          />
          <div className="space-y-2.5 mt-1">
            {distribution.map((band) => {
              const share = totalWithPercentile === 0 ? 0 : (band.count / totalWithPercentile) * 100;
              const color = percentileColor((band.min + band.max) / 2);
              return (
                <div key={band.label}>
                  <div className="flex items-center justify-between text-[0.8125rem] mb-1">
                    <span style={{ color: "var(--text-secondary)" }}>{band.label}</span>
                    <span className="tabular" style={{ color: "var(--text-muted)" }}>
                      {band.count} {band.count > 1 ? t("common.players") : t("common.player")} · {share.toFixed(0)} %
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--surface-sunken)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.max(share, band.count > 0 ? 3 : 0)}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[0.75rem] mt-3 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {t("analytics.distributionNote")}
          </p>
        </Panel>

        {/* Croisement */}
        <Panel>
          <PanelHeader
            title={t("analytics.crossing")}
            subtitle={`${primaryMetric?.label ?? ""} ${t("analytics.crossingVersus")} ${secondaryMetric?.label ?? ""}`}
            icon={<GitCompareArrows size={16} />}
          />
          <ScatterCompare
            data={scatterData}
            xLabel={primaryMetric?.label ?? ""}
            yLabel={secondaryMetric?.label ?? ""}
            xUnit={primaryMetric?.unit ?? ""}
            yUnit={secondaryMetric?.unit ?? ""}
            height={330}
          />
          <p className="text-[0.75rem] mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {t("analytics.crossingNote")}
          </p>
        </Panel>
      </div>

      {/* Tableau detaille */}
      <Panel padded={false} className="p-4">
        <PanelHeader
          title={t("analytics.perPlayer")}
          subtitle={t("analytics.perPlayerSubtitle")}
          icon={<Table2 size={16} />}
        />
        <div className="scroll-x">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">{t("squad.player")}</th>
                <th scope="col">{t("squad.position")}</th>
                <th scope="col">{primaryMetric?.label}</th>
                <th scope="col">{t("player.percentile")}</th>
                <th scope="col">{secondaryMetric?.label}</th>
                <th scope="col">{t("analytics.gapToMean")}</th>
              </tr>
            </thead>
            <tbody>
              {[...filtered]
                .filter((p) => p.metrics[primary] !== undefined)
                .sort((a, b) =>
                  primaryMetric?.higherIsBetter
                    ? a.metrics[primary].value - b.metrics[primary].value
                    : b.metrics[primary].value - a.metrics[primary].value,
                )
                .map((player) => {
                  const cell = player.metrics[primary];
                  const gap = average === 0 ? 0 : ((cell.value - average) / average) * 100;
                  const secondaryCell = player.metrics[secondary];
                  return (
                    <tr key={player.id}>
                      <td>
                        <Link
                          href={`/app/players/${player.id}`}
                          className="font-medium cursor-pointer hover:underline"
                        >
                          {player.name}
                        </Link>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{player.position}</td>
                      <td className="tabular">
                        {formatNumber(cell.value, primaryMetric?.decimals ?? 2, tag)}
                      </td>
                      <td className="tabular">
                        {cell.percentile == null ? (
                          <span style={{ color: "var(--text-muted)" }}>—</span>
                        ) : (
                          <span style={{ color: percentileColor(cell.percentile), fontWeight: 500 }}>
                            {cell.percentile}
                          </span>
                        )}
                      </td>
                      <td className="tabular">
                        {secondaryCell
                          ? formatNumber(secondaryCell.value, secondaryMetric?.decimals ?? 2, tag)
                          : "—"}
                      </td>
                      <td className="tabular" style={{ color: "var(--text-secondary)" }}>
                        {gap > 0 ? "+" : ""}
                        {formatNumber(gap, 1, tag)} %
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
