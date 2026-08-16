"use client";

import { useMemo, useState } from "react";
import { TrendChart } from "@/components/charts/charts";
import { useLocaleTag, useT } from "@/lib/i18n/client";
import { formatNumber } from "@/lib/utils";

export interface TrendSeries {
  key: string;
  label: string;
  unit: string;
  decimals: number;
  higherIsBetter: boolean;
  normMean: number | null;
  points: Array<{ date: string; value: number }>;
}

export function PlayerTrends({ series }: { series: TrendSeries[] }) {
  const t = useT();
  const tag = useLocaleTag();
  const [selected, setSelected] = useState(series[0]?.key ?? "");
  const current = useMemo(() => series.find((s) => s.key === selected), [series, selected]);

  if (series.length === 0) {
    return (
      <p className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>
        {t("player.noTrend")}
      </p>
    );
  }

  const first = current?.points[0]?.value;
  const last = current?.points[current.points.length - 1]?.value;
  const change = first != null && last != null && first !== 0 ? ((last - first) / first) * 100 : null;
  const improved =
    change === null ? null : current?.higherIsBetter ? change > 0 : change < 0;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <label className="sr-only" htmlFor="trend-metric">
          {t("player.selectMetric")}
        </label>
        <select
          id="trend-metric"
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
          className="field cursor-pointer"
          style={{ width: "auto", minWidth: "14rem" }}
        >
          {series.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label} ({s.unit})
            </option>
          ))}
        </select>

        {change !== null ? (
          <span
            className="text-sm tabular font-medium px-2 py-1 rounded-md"
            style={{
              color: improved ? "var(--success)" : "var(--danger)",
              background: improved ? "var(--success-soft)" : "var(--danger-soft)",
            }}
          >
            {change > 0 ? "+" : ""}
            {change.toFixed(1)} % {t("player.sinceFirst")}
          </span>
        ) : null}
      </div>

      {current ? (
        <>
          <TrendChart
            data={current.points}
            unit={current.unit}
            label={current.label}
            referenceValue={current.normMean}
            referenceLabel={t("chart.reference")}
            higherIsBetter={current.higherIsBetter}
            height={240}
          />
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-[0.8125rem]" style={{ color: "var(--text-muted)" }}>
            <span className="tabular">
              {t("player.firstMeasure")} : {formatNumber(first ?? 0, current.decimals, tag)} {current.unit}
            </span>
            <span className="tabular">
              {t("player.lastMeasure")} : {formatNumber(last ?? 0, current.decimals, tag)} {current.unit}
            </span>
            <span className="tabular">{current.points.length} {t("player.measurements")}</span>
            {current.normMean != null ? (
              <span className="tabular">
                {t("player.populationReference")} : {formatNumber(current.normMean, current.decimals, tag)} {current.unit}
              </span>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
