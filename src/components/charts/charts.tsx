"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import { formatDateShort, formatNumber } from "@/lib/utils";

const AXIS = { fontSize: 11, fill: "var(--text-muted)" } as const;
const GRID = "var(--chart-grid)";

const tooltipStyle = {
  background: "var(--surface-panel)",
  border: "1px solid var(--border-strong)",
  borderRadius: "0.5rem",
  fontSize: "0.8125rem",
  color: "var(--text-primary)",
  boxShadow: "var(--shadow-panel)",
  padding: "0.5rem 0.625rem",
};

// ---------------------------------------------------------------------------
// Evolution d'une metrique dans le temps
// ---------------------------------------------------------------------------

export function TrendChart({
  data,
  unit,
  label,
  referenceValue,
  referenceLabel,
  higherIsBetter = true,
  height = 220,
}: {
  data: Array<{ date: string | Date; value: number }>;
  unit: string;
  label: string;
  referenceValue?: number | null;
  referenceLabel?: string;
  higherIsBetter?: boolean;
  height?: number;
}) {
  if (data.length === 0) {
    return (
      <div
        className="grid place-items-center text-sm"
        style={{ height, color: "var(--text-muted)" }}
      >
        Aucune mesure enregistree
      </div>
    );
  }

  const chartData = data.map((point) => ({
    label: formatDateShort(point.date),
    value: point.value,
  }));

  const values = data.map((d) => d.value);
  const min = Math.min(...values, referenceValue ?? Number.POSITIVE_INFINITY);
  const max = Math.max(...values, referenceValue ?? Number.NEGATIVE_INFINITY);
  const padding = (max - min) * 0.25 || Math.abs(max) * 0.1 || 1;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id={`trend-${label.replace(/\W/g, "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis
          tick={AXIS}
          axisLine={false}
          tickLine={false}
          domain={[min - padding, max + padding]}
          width={48}
          tickFormatter={(v: number) => formatNumber(v, v > 100 ? 0 : 2)}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number) => [`${formatNumber(value, 2)} ${unit}`, label]}
          cursor={{ stroke: "var(--border-strong)" }}
        />
        {referenceValue != null ? (
          <ReferenceLine
            y={referenceValue}
            stroke="var(--text-muted)"
            strokeDasharray="4 4"
            label={{
              value: referenceLabel ?? "Reference",
              position: "insideTopRight",
              fontSize: 10,
              fill: "var(--text-muted)",
            }}
          />
        ) : null}
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--accent)"
          strokeWidth={2}
          fill={`url(#trend-${label.replace(/\W/g, "")})`}
          dot={{ r: 3, fill: "var(--accent)", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          name={label}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// Radar de profil en percentiles
// ---------------------------------------------------------------------------

export function ProfileRadar({
  data,
  height = 280,
}: {
  data: Array<{ label: string; percentile: number | null }>;
  height?: number;
}) {
  const usable = data.filter((d) => d.percentile != null);
  if (usable.length < 3) {
    return (
      <div className="grid place-items-center text-sm px-4 text-center" style={{ height, color: "var(--text-muted)" }}>
        Il faut au moins trois qualites mesurees pour tracer le profil. Completer la batterie de
        tests.
      </div>
    );
  }

  const chartData = data.map((d) => ({ label: d.label, percentile: d.percentile ?? 0 }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={chartData} outerRadius="72%">
        <PolarGrid stroke={GRID} />
        <PolarAngleAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--text-muted)" }} tickCount={5} />
        <Radar
          name="Percentile"
          dataKey="percentile"
          stroke="var(--accent)"
          fill="var(--accent)"
          fillOpacity={0.28}
          isAnimationActive={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number) => [`${value}e percentile`, "Niveau"]}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// Comparaison du groupe sur une metrique
// ---------------------------------------------------------------------------

export function SquadBarChart({
  data,
  unit,
  higherIsBetter,
  squadMean,
  highlightId,
  height = 320,
}: {
  data: Array<{ id: string; name: string; value: number }>;
  unit: string;
  higherIsBetter: boolean;
  squadMean?: number;
  highlightId?: string;
  height?: number;
}) {
  if (data.length === 0) {
    return (
      <div className="grid place-items-center text-sm" style={{ height, color: "var(--text-muted)" }}>
        Aucune donnee pour cette metrique
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => (higherIsBetter ? b.value - a.value : a.value - b.value));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={sorted} margin={{ top: 8, right: 12, left: -8, bottom: 60 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ ...AXIS, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          angle={-45}
          textAnchor="end"
          interval={0}
          height={60}
        />
        <YAxis
          tick={AXIS}
          axisLine={false}
          tickLine={false}
          width={48}
          tickFormatter={(v: number) => formatNumber(v, v > 100 ? 0 : 2)}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "var(--surface-hover)" }}
          formatter={(value: number) => [`${formatNumber(value, 2)} ${unit}`, "Valeur"]}
        />
        {squadMean != null ? (
          <ReferenceLine
            y={squadMean}
            stroke="var(--text-muted)"
            strokeDasharray="4 4"
            label={{
              value: "Moyenne equipe",
              position: "insideTopRight",
              fontSize: 10,
              fill: "var(--text-muted)",
            }}
          />
        ) : null}
        <Bar dataKey="value" radius={[3, 3, 0, 0]} isAnimationActive={false}>
          {sorted.map((entry) => (
            <Cell
              key={entry.id}
              fill={entry.id === highlightId ? "var(--warning)" : "var(--accent)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// Profil force vitesse horizontal
// ---------------------------------------------------------------------------

export function ForceVelocityChart({
  f0,
  v0,
  pmax,
  height = 240,
}: {
  f0: number;
  v0: number;
  pmax: number;
  height?: number;
}) {
  // La droite force vitesse relie (0, F0) a (V0, 0).
  const line = Array.from({ length: 21 }, (_, i) => {
    const velocity = (v0 * i) / 20;
    return {
      velocity: Number(velocity.toFixed(2)),
      force: Number(Math.max(0, f0 - (f0 / v0) * velocity).toFixed(2)),
      power: Number((Math.max(0, f0 - (f0 / v0) * velocity) * velocity).toFixed(2)),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={line} margin={{ top: 8, right: 16, left: -8, bottom: 8 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        <XAxis
          dataKey="velocity"
          tick={AXIS}
          axisLine={false}
          tickLine={false}
          label={{ value: "Vitesse (m/s)", position: "insideBottom", offset: -4, fontSize: 10, fill: "var(--text-muted)" }}
        />
        <YAxis
          yAxisId="force"
          tick={AXIS}
          axisLine={false}
          tickLine={false}
          width={44}
          label={{ value: "N/kg", angle: -90, position: "insideLeft", fontSize: 10, fill: "var(--text-muted)" }}
        />
        <YAxis yAxisId="power" orientation="right" tick={AXIS} axisLine={false} tickLine={false} width={44} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number, name: string) => [
            `${formatNumber(value, 2)} ${name === "Force" ? "N/kg" : "W/kg"}`,
            name,
          ]}
          labelFormatter={(v) => `${v} m/s`}
        />
        <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
        <Line
          yAxisId="force"
          type="linear"
          dataKey="force"
          name="Force"
          stroke="var(--accent)"
          strokeWidth={2.5}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          yAxisId="power"
          type="monotone"
          dataKey="power"
          name="Puissance"
          stroke="var(--warning)"
          strokeWidth={2}
          strokeDasharray="5 3"
          dot={false}
          isAnimationActive={false}
        />
        <ReferenceLine
          yAxisId="power"
          y={pmax}
          stroke="var(--warning)"
          strokeDasharray="2 2"
          label={{ value: "Pmax", position: "right", fontSize: 10, fill: "var(--warning)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// Nuage de points pour croiser deux qualites
// ---------------------------------------------------------------------------

export function ScatterCompare({
  data,
  xLabel,
  yLabel,
  xUnit,
  yUnit,
  height = 320,
}: {
  data: Array<{ name: string; x: number; y: number }>;
  xLabel: string;
  yLabel: string;
  xUnit: string;
  yUnit: string;
  height?: number;
}) {
  if (data.length < 2) {
    return (
      <div className="grid place-items-center text-sm px-4 text-center" style={{ height, color: "var(--text-muted)" }}>
        Il faut au moins deux joueurs disposant des deux mesures pour tracer ce croisement.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 12, right: 16, left: 0, bottom: 24 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="x"
          name={xLabel}
          tick={AXIS}
          axisLine={false}
          tickLine={false}
          domain={["dataMin - 0.5", "dataMax + 0.5"]}
          label={{ value: `${xLabel} (${xUnit})`, position: "insideBottom", offset: -12, fontSize: 10, fill: "var(--text-muted)" }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={yLabel}
          tick={AXIS}
          axisLine={false}
          tickLine={false}
          width={48}
          domain={["dataMin - 1", "dataMax + 1"]}
          label={{ value: yUnit, angle: -90, position: "insideLeft", fontSize: 10, fill: "var(--text-muted)" }}
        />
        <ZAxis range={[70, 70]} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ strokeDasharray: "3 3" }}
          formatter={(value: number, name: string) => [formatNumber(value, 2), name]}
          labelFormatter={() => ""}
          content={({ payload }) => {
            if (!payload || payload.length === 0) return null;
            const point = payload[0].payload as { name: string; x: number; y: number };
            return (
              <div style={tooltipStyle}>
                <p className="font-medium">{point.name}</p>
                <p className="tabular">
                  {xLabel} : {formatNumber(point.x, 2)} {xUnit}
                </p>
                <p className="tabular">
                  {yLabel} : {formatNumber(point.y, 2)} {yUnit}
                </p>
              </div>
            );
          }}
        />
        <Scatter data={data} fill="var(--accent)" isAnimationActive={false} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// Comparaison gauche droite
// ---------------------------------------------------------------------------

/**
 * Les mesures bilaterales n'ont pas la meme unite : centimetres, secondes, newtons.
 * Les tracer sur une echelle commune rendrait les petites valeurs invisibles.
 * On represente donc l'ecart en pourcentage, seule grandeur comparable d'une
 * mesure a l'autre, avec les seuils de vigilance et d'alerte en repere.
 */
export function AsymmetryChart({
  items,
  height = 200,
  warnThreshold = 10,
  dangerThreshold = 15,
}: {
  items: Array<{ label: string; left: number; right: number; unit: string }>;
  height?: number;
  warnThreshold?: number;
  dangerThreshold?: number;
}) {
  if (items.length === 0) {
    return (
      <div className="grid place-items-center text-sm" style={{ height, color: "var(--text-muted)" }}>
        Aucune mesure bilaterale
      </div>
    );
  }

  const data = items
    .map((item) => {
      const high = Math.max(item.left, item.right);
      const low = Math.min(item.left, item.right);
      const gap = high === 0 ? 0 : ((high - low) / high) * 100;
      return {
        label: item.label,
        gap: Number(gap.toFixed(1)),
        stronger: item.left >= item.right ? "gauche" : "droite",
      };
    })
    .sort((a, b) => b.gap - a.gap);

  const maxGap = Math.max(...data.map((d) => d.gap), dangerThreshold + 4);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 20 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, Math.ceil(maxGap)]}
          tick={AXIS}
          axisLine={false}
          tickLine={false}
          unit=" %"
          label={{
            value: "Ecart entre les deux cotes",
            position: "insideBottom",
            offset: -10,
            fontSize: 10,
            fill: "var(--text-muted)",
          }}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ ...AXIS, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "var(--surface-hover)" }}
          formatter={(value: number, _name: string, entry: { payload?: { stronger?: string } }) => [
            `${formatNumber(value, 1)} %  (cote fort : ${entry.payload?.stronger ?? ""})`,
            "Ecart",
          ]}
        />
        <ReferenceLine
          x={warnThreshold}
          stroke="var(--warning)"
          strokeDasharray="4 3"
          label={{ value: `${warnThreshold} %`, position: "top", fontSize: 10, fill: "var(--warning)" }}
        />
        <ReferenceLine
          x={dangerThreshold}
          stroke="var(--danger)"
          strokeDasharray="4 3"
          label={{ value: `${dangerThreshold} %`, position: "top", fontSize: 10, fill: "var(--danger)" }}
        />
        <Bar dataKey="gap" name="Ecart" radius={[0, 3, 3, 0]} isAnimationActive={false}>
          {data.map((entry) => (
            <Cell
              key={entry.label}
              fill={
                entry.gap >= dangerThreshold
                  ? "var(--danger)"
                  : entry.gap >= warnThreshold
                    ? "var(--warning)"
                    : "var(--accent)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
