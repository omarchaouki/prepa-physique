"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { AlertTriangle, Check, Info, Loader2, Save } from "lucide-react";

import { saveResultsAction, type SaveResultsResponse } from "@/app/actions/tests";
import type { TestSpec } from "@/lib/sports-science/types";
import { Alert, Badge } from "@/components/ui/primitives";
import { usePick, useT } from "@/lib/i18n/client";

export interface EntryPlayer {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  status: string;
  heightCm: number | null;
  weightKg: number | null;
}

export function TestEntryGrid({
  sessionId,
  test,
  players,
  initialValues,
  canEdit,
}: {
  sessionId: string;
  test: TestSpec;
  players: EntryPlayer[];
  initialValues: Record<string, Record<string, string>>;
  canEdit: boolean;
}) {
  const t = useT();
  const pick = usePick();
  const [values, setValues] = useState<Record<string, Record<string, string>>>(initialValues);
  const [response, setResponse] = useState<SaveResultsResponse | null>(null);
  const [pending, startTransition] = useTransition();
  const gridRef = useRef<HTMLTableElement>(null);

  const setValue = (playerId: string, fieldKey: string, value: string) => {
    setValues((previous) => ({
      ...previous,
      [playerId]: { ...(previous[playerId] ?? {}), [fieldKey]: value },
    }));
    setResponse(null);
  };

  const filledCount = useMemo(
    () =>
      players.filter((player) =>
        Object.values(values[player.id] ?? {}).some((v) => String(v).trim() !== ""),
      ).length,
    [players, values],
  );

  const missingContext = players.filter(
    (player) =>
      (test.needsContext?.includes("bodyMassKg") && !player.weightKg) ||
      (test.needsContext?.includes("heightCm") && !player.heightCm),
  );

  /**
   * Deplacement au clavier dans la grille : Entree et les fleches passent a la
   * ligne suivante sur la meme colonne, ce qui correspond a la facon dont un
   * staff saisit sur le terrain, joueur apres joueur.
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    const move = (nextRow: number, nextCol: number) => {
      const selector = `[data-cell="${nextRow}-${nextCol}"]`;
      const target = gridRef.current?.querySelector<HTMLInputElement>(selector);
      if (target) {
        event.preventDefault();
        target.focus();
        target.select();
      }
    };

    if (event.key === "Enter" || event.key === "ArrowDown") move(rowIndex + 1, colIndex);
    else if (event.key === "ArrowUp") move(rowIndex - 1, colIndex);
  };

  const save = () => {
    startTransition(async () => {
      const result = await saveResultsAction({
        sessionId,
        testKey: test.key,
        entries: players.map((player) => ({
          playerId: player.id,
          values: values[player.id] ?? {},
        })),
      });
      setResponse(result);
    });
  };

  // Les champs sont regroupes selon les intitules declares dans le catalogue.
  const groups = useMemo(() => {
    const map = new Map<string, typeof test.fields>();
    for (const field of test.fields) {
      const key = field.group ? pick(field.group) : "";
      const list = map.get(key) ?? [];
      list.push(field);
      map.set(key, list);
    }
    return [...map.entries()];
    // pick depend de la langue : le regroupement doit se recalculer si elle change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test.fields, pick]);

  return (
    <div>
      {/* Protocole */}
      <details className="panel-sunken p-3 mb-3">
        <summary className="cursor-pointer text-sm font-medium flex items-center gap-2">
          <Info size={15} aria-hidden="true" />
          {t("entry.protocol")}
        </summary>
        <div className="mt-2.5 space-y-2 text-[0.8125rem] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <p>{pick(test.description)}</p>
          <p>
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>
              {t("entry.protocolLabel")} :
            </span>{" "}
            {pick(test.protocol)}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[0.75rem]" style={{ color: "var(--text-muted)" }}>
            <span>{t("entry.equipment")} : {pick(test.equipment)}</span>
            <span>{t("entry.duration")} : {t("entry.durationAbout")} {test.durationMin} min</span>
            <span>{t("entry.reference")} : {test.reference}</span>
          </div>
        </div>
      </details>

      {missingContext.length > 0 ? (
        <div className="mb-3">
          <Alert tone="warning" title={t("entry.missingContext")}>
            {missingContext.length}{" "}
            {missingContext.length > 1 ? t("common.players") : t("common.player")}{" "}
            {missingContext.length > 1
              ? t("entry.missingContextBody")
              : t("entry.missingContextOne")}
          </Alert>
        </div>
      ) : null}

      {/* Grille de saisie */}
      <div className="scroll-x panel" style={{ maxHeight: "65vh", overflowY: "auto" }}>
        <table className="data-table" ref={gridRef}>
          <caption className="sr-only">
            {t("entry.caption")} {pick(test.name)}, {t("entry.onePlayerPerRow")}
          </caption>
          <thead>
            {groups.length > 1 ? (
              <tr>
                <th scope="col" style={{ position: "sticky", left: 0, zIndex: 3 }} />
                {groups.map(([groupName, fields]) => (
                  <th
                    key={groupName || "sans-groupe"}
                    scope="colgroup"
                    colSpan={fields.length}
                    style={{ textAlign: "center", borderLeft: "1px solid var(--border-subtle)" }}
                  >
                    {groupName || t("entry.measures")}
                  </th>
                ))}
              </tr>
            ) : null}
            <tr>
              <th scope="col" style={{ minWidth: "12rem", position: "sticky", left: 0, zIndex: 3 }}>
                {t("squad.player")}
              </th>
              {test.fields.map((field) => (
                <th key={field.key} scope="col" style={{ minWidth: "7rem" }}>
                  <span className="block truncate" title={pick(field.label)}>
                    {pick(field.label)}
                    {field.optional ? "" : " *"}
                  </span>
                  {field.unit ? (
                    <span className="block font-normal normal-case" style={{ color: "var(--text-muted)" }}>
                      {field.unit}
                    </span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((player, rowIndex) => {
              const hasValue = Object.values(values[player.id] ?? {}).some(
                (v) => String(v).trim() !== "",
              );
              return (
                <tr key={player.id}>
                  <td
                    style={{
                      position: "sticky",
                      left: 0,
                      background: "var(--surface-panel)",
                      zIndex: 1,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-1.5 rounded-full shrink-0"
                        style={{ background: hasValue ? "var(--success)" : "var(--border-strong)" }}
                        aria-label={hasValue ? t("entry.rowFilled") : t("entry.rowEmpty")}
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {player.lastName} {player.firstName}
                        </span>
                        <span className="block text-[0.6875rem]" style={{ color: "var(--text-muted)" }}>
                          {player.position}
                          {player.status !== "ACTIVE" ? ` · ${t("entry.unavailable")}` : ""}
                        </span>
                      </span>
                    </div>
                  </td>

                  {test.fields.map((field, colIndex) => (
                    <td key={field.key} style={{ padding: "0.25rem 0.375rem" }}>
                      {field.type === "select" ? (
                        <select
                          value={values[player.id]?.[field.key] ?? ""}
                          onChange={(event) => setValue(player.id, field.key, event.target.value)}
                          disabled={!canEdit}
                          className="field"
                          style={{ minHeight: "2.25rem", padding: "0.25rem 0.5rem" }}
                          aria-label={`${pick(field.label)} — ${player.lastName}`}
                        >
                          <option value="">—</option>
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {pick(option.label)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="number"
                          inputMode="decimal"
                          step={field.step ?? "any"}
                          min={field.min}
                          max={field.max}
                          value={values[player.id]?.[field.key] ?? ""}
                          onChange={(event) => setValue(player.id, field.key, event.target.value)}
                          onKeyDown={(event) => handleKeyDown(event, rowIndex + 1, colIndex)}
                          onFocus={(event) => event.target.select()}
                          disabled={!canEdit}
                          data-cell={`${rowIndex}-${colIndex}`}
                          className="field tabular"
                          style={{ minHeight: "2.25rem", padding: "0.25rem 0.5rem" }}
                          aria-label={`${pick(field.label)} — ${player.lastName} ${player.firstName}`}
                          placeholder={field.optional ? "" : "—"}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Barre d'action */}
      <div className="flex flex-wrap items-center gap-3 mt-3">
        <button type="button" className="btn btn-primary" onClick={save} disabled={!canEdit || pending}>
          {pending ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              {t("common.saving")}
            </>
          ) : (
            <>
              <Save size={16} aria-hidden="true" />
              {t("entry.save")} {pick(test.shortName)}
            </>
          )}
        </button>

        <span className="text-[0.8125rem] tabular" style={{ color: "var(--text-muted)" }}>
          {filledCount} / {players.length} {t("entry.playersFilled")}
        </span>

        <span className="text-[0.75rem] ml-auto" style={{ color: "var(--text-muted)" }}>
          {t("entry.keyboardHint")}
        </span>
      </div>

      {/* Retour d'enregistrement */}
      {response ? (
        <div className="mt-3 space-y-2" aria-live="polite">
          <Alert tone={response.ok && response.saved > 0 ? "success" : "warning"}>
            <span className="inline-flex items-center gap-1.5">
              {response.ok && response.saved > 0 ? (
                <Check size={15} aria-hidden="true" />
              ) : (
                <AlertTriangle size={15} aria-hidden="true" />
              )}
              {response.message}
            </span>
          </Alert>

          {response.flags.length > 0 ? (
            <div className="panel-sunken p-3">
              <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <AlertTriangle size={15} style={{ color: "var(--warning)" }} aria-hidden="true" />
                {t("entry.flagsTitle")}
              </p>
              <ul className="space-y-2">
                {response.flags.map((flag) => (
                  <li key={flag.playerName}>
                    <Badge tone="warning">{flag.playerName}</Badge>
                    <ul className="mt-1 space-y-0.5">
                      {flag.messages.map((message) => (
                        <li
                          key={message}
                          className="text-[0.8125rem] leading-relaxed pl-3"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {message}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
