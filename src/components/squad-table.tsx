"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";

import { POSITION_LABELS, PLAYER_STATUS_LABELS, type PlayerStatus, type Position } from "@/lib/constants";
import { useLocale, useLocaleTag, useT } from "@/lib/i18n/client";
import { formatNumber, percentileColor } from "@/lib/utils";
import { Badge } from "@/components/ui/primitives";

export interface SquadTableColumn {
  key: string;
  label: string;
  unit: string;
  decimals: number;
  higherIsBetter: boolean;
}

export interface SquadTableRow {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  status: string;
  jerseyNumber: number | null;
  ageYears: number;
  metrics: Record<
    string,
    { value: number; percentile: number | null; thresholdStatus: "bon" | "vigilance" | "alerte" | null } | undefined
  >;
  alerts: number;
  criticalAlerts: number;
}

const THRESHOLD_COLOR: Record<"bon" | "vigilance" | "alerte", string> = {
  bon: "var(--success)",
  vigilance: "var(--warning)",
  alerte: "var(--danger)",
};

type SortKey = "name" | "position" | "age" | "alerts" | string;

export function SquadTable({
  rows,
  columns,
  squadStats,
}: {
  rows: SquadTableRow[];
  columns: SquadTableColumn[];
  squadStats: Record<string, { mean: number; sd: number; n: number }>;
}) {
  const t = useT();
  const locale = useLocale();
  const tag = useLocaleTag();
  const [query, setQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let list = rows.filter((row) => {
      const matchesQuery =
        normalized === "" ||
        `${row.firstName} ${row.lastName}`.toLowerCase().includes(normalized);
      const matchesPosition = positionFilter === "ALL" || row.position === positionFilter;
      return matchesQuery && matchesPosition;
    });

    list = [...list].sort((a, b) => {
      let comparison = 0;
      if (sortKey === "name") comparison = a.lastName.localeCompare(b.lastName);
      else if (sortKey === "position") comparison = a.position.localeCompare(b.position);
      else if (sortKey === "age") comparison = a.ageYears - b.ageYears;
      else if (sortKey === "alerts") comparison = a.alerts - b.alerts;
      else {
        const av = a.metrics[sortKey]?.value;
        const bv = b.metrics[sortKey]?.value;
        if (av === undefined && bv === undefined) comparison = 0;
        else if (av === undefined) return 1;
        else if (bv === undefined) return -1;
        else comparison = av - bv;
      }
      return sortAsc ? comparison : -comparison;
    });

    return list;
  }, [rows, query, positionFilter, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(key === "name" || key === "position");
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown size={11} className="opacity-40" aria-hidden="true" />;
    return sortAsc ? <ArrowUp size={11} aria-hidden="true" /> : <ArrowDown size={11} aria-hidden="true" />;
  };

  const positions = [...new Set(rows.map((r) => r.position))].sort();

  return (
    <div>
      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[12rem] max-w-xs">
          <Search
            size={15}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-muted)" }}
            aria-hidden="true"
          />
          <label className="sr-only" htmlFor="squad-search">
            {t("squad.searchPlayer")}
          </label>
          <input
            id="squad-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("squad.searchPlayer")}
            className="field pl-8"
          />
        </div>

        <div>
          <label className="sr-only" htmlFor="squad-position">
            {t("squad.filterPosition")}
          </label>
          <select
            id="squad-position"
            value={positionFilter}
            onChange={(event) => setPositionFilter(event.target.value)}
            className="field cursor-pointer"
            style={{ width: "auto", minWidth: "9rem" }}
          >
            <option value="ALL">{t("squad.allPositions")}</option>
            {positions.map((position) => (
              <option key={position} value={position}>
                {POSITION_LABELS[position as Position]?.[locale] ?? position}
              </option>
            ))}
          </select>
        </div>

        <span className="text-[0.8125rem] tabular ml-auto" style={{ color: "var(--text-muted)" }}>
          {filtered.length} {filtered.length > 1 ? t("common.players") : t("common.player")}
        </span>
      </div>

      {/* Tableau */}
      <div className="scroll-x panel" style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <table className="data-table">
          <caption className="sr-only">
            {t("squad.caption")}
          </caption>
          <thead>
            <tr>
              <th scope="col" style={{ minWidth: "12rem", position: "sticky", left: 0, zIndex: 2 }}>
                <button
                  type="button"
                  onClick={() => toggleSort("name")}
                  className="inline-flex items-center gap-1 cursor-pointer"
                  aria-sort={sortKey === "name" ? (sortAsc ? "ascending" : "descending") : "none"}
                >
                  {t("squad.player")} <SortIcon column="name" />
                </button>
              </th>
              <th scope="col">
                <button
                  type="button"
                  onClick={() => toggleSort("position")}
                  className="inline-flex items-center gap-1 cursor-pointer"
                >
                  {t("squad.position")} <SortIcon column="position" />
                </button>
              </th>
              <th scope="col">
                <button
                  type="button"
                  onClick={() => toggleSort("age")}
                  className="inline-flex items-center gap-1 cursor-pointer"
                >
                  {t("squad.age")} <SortIcon column="age" />
                </button>
              </th>
              {columns.map((column) => (
                <th key={column.key} scope="col" style={{ minWidth: "6.5rem" }}>
                  <button
                    type="button"
                    onClick={() => toggleSort(column.key)}
                    className="inline-flex items-center gap-1 cursor-pointer text-left"
                    title={`${column.label} (${column.unit})`}
                  >
                    <span className="truncate max-w-[7rem]">{column.label}</span>
                    <SortIcon column={column.key} />
                  </button>
                </th>
              ))}
              <th scope="col">
                <button
                  type="button"
                  onClick={() => toggleSort("alerts")}
                  className="inline-flex items-center gap-1 cursor-pointer"
                >
                  {t("squad.alerts")} <SortIcon column="alerts" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td style={{ position: "sticky", left: 0, background: "var(--surface-panel)", zIndex: 1 }}>
                  <Link
                    href={`/app/players/${row.id}`}
                    className="flex items-center gap-2 cursor-pointer hover:underline"
                  >
                    <span
                      className="grid place-items-center size-7 rounded-full text-[0.625rem] font-semibold shrink-0"
                      style={{ background: "var(--surface-sunken)", color: "var(--text-secondary)" }}
                      aria-hidden="true"
                    >
                      {row.firstName.charAt(0)}
                      {row.lastName.charAt(0)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {row.lastName} {row.firstName}
                      </span>
                      {row.status !== "ACTIVE" ? (
                        <span
                          className="block text-[0.6875rem]"
                          style={{
                            color: row.status === "INJURED" ? "var(--danger)" : "var(--warning)",
                          }}
                        >
                          {PLAYER_STATUS_LABELS[row.status as PlayerStatus]?.[locale] ?? row.status}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </td>
                <td>
                  <span className="text-[0.8125rem]" style={{ color: "var(--text-secondary)" }}>
                    {row.position}
                  </span>
                </td>
                <td className="tabular">{row.ageYears.toFixed(0)}</td>
                {columns.map((column) => {
                  const cell = row.metrics[column.key];
                  if (!cell) {
                    return (
                      <td key={column.key} style={{ color: "var(--text-muted)" }}>
                        —
                      </td>
                    );
                  }
                  return (
                    <td key={column.key}>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="tabular font-medium"
                          style={
                            cell.thresholdStatus
                              ? { color: THRESHOLD_COLOR[cell.thresholdStatus] }
                              : undefined
                          }
                        >
                          {formatNumber(cell.value, column.decimals, tag)}
                        </span>
                        {cell.percentile != null ? (
                          <span
                            className="text-[0.6875rem] tabular px-1 rounded"
                            style={{
                              color: percentileColor(cell.percentile),
                              background: "var(--surface-sunken)",
                            }}
                            title={`${cell.percentile}${t("chart.percentileSuffix")}`}
                          >
                            {cell.percentile}
                          </span>
                        ) : cell.thresholdStatus ? (
                          <span
                            className="text-[0.6875rem] px-1 rounded"
                            style={{
                              color: THRESHOLD_COLOR[cell.thresholdStatus],
                              background: "var(--surface-sunken)",
                            }}
                            title={t("player.thresholdTitle")}
                          >
                            {cell.thresholdStatus === "bon"
                              ? t("squad.thresholdOk")
                              : cell.thresholdStatus === "vigilance"
                                ? t("squad.thresholdWarn")
                                : "!"}
                          </span>
                        ) : null}
                      </div>
                    </td>
                  );
                })}
                <td>
                  {row.alerts === 0 ? (
                    <span style={{ color: "var(--text-muted)" }}>—</span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <AlertTriangle
                        size={13}
                        style={{
                          color: row.criticalAlerts > 0 ? "var(--danger)" : "var(--warning)",
                        }}
                        aria-hidden="true"
                      />
                      <span
                        className="tabular text-[0.8125rem] font-medium"
                        style={{
                          color: row.criticalAlerts > 0 ? "var(--danger)" : "var(--warning)",
                        }}
                      >
                        {row.alerts}
                      </span>
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {/* Ligne de synthese du groupe */}
            {filtered.length > 1 ? (
              <tr style={{ background: "var(--surface-sunken)" }}>
                <td
                  style={{
                    position: "sticky",
                    left: 0,
                    background: "var(--surface-sunken)",
                    zIndex: 1,
                    fontWeight: 600,
                  }}
                >
                  {t("squad.groupAverage")}
                </td>
                <td />
                <td className="tabular" style={{ fontWeight: 600 }}>
                  {(filtered.reduce((a, r) => a + r.ageYears, 0) / filtered.length).toFixed(0)}
                </td>
                {columns.map((column) => {
                  const values = filtered
                    .map((row) => row.metrics[column.key]?.value)
                    .filter((v): v is number => v !== undefined);
                  const average =
                    values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
                  return (
                    <td key={column.key} className="tabular" style={{ fontWeight: 600 }}>
                      {average === null ? "—" : formatNumber(average, column.decimals, tag)}
                      {squadStats[column.key] ? (
                        <span
                          className="ml-1 text-[0.6875rem] font-normal"
                          style={{ color: "var(--text-muted)" }}
                        >
                          ± {formatNumber(squadStats[column.key].sd, column.decimals, tag)}
                        </span>
                      ) : null}
                    </td>
                  );
                })}
                <td className="tabular" style={{ fontWeight: 600 }}>
                  {filtered.reduce((a, r) => a + r.alerts, 0)}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm py-8" style={{ color: "var(--text-muted)" }}>
          {t("squad.noMatch")}
        </p>
      ) : null}

      <p className="text-[0.75rem] mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {t("squad.legend")}
      </p>
    </div>
  );
}
