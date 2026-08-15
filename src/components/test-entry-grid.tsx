"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { AlertTriangle, Check, Info, Loader2, Save } from "lucide-react";

import { saveResultsAction, type SaveResultsResponse } from "@/app/actions/tests";
import type { TestSpec } from "@/lib/sports-science/types";
import { Alert, Badge } from "@/components/ui/primitives";

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
      const key = field.group?.fr ?? "";
      const list = map.get(key) ?? [];
      list.push(field);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [test.fields]);

  return (
    <div>
      {/* Protocole */}
      <details className="panel-sunken p-3 mb-3">
        <summary className="cursor-pointer text-sm font-medium flex items-center gap-2">
          <Info size={15} aria-hidden="true" />
          Protocole et materiel
        </summary>
        <div className="mt-2.5 space-y-2 text-[0.8125rem] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <p>{test.description.fr}</p>
          <p>
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>
              Protocole :
            </span>{" "}
            {test.protocol.fr}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[0.75rem]" style={{ color: "var(--text-muted)" }}>
            <span>Materiel : {test.equipment.fr}</span>
            <span>Duree : environ {test.durationMin} minutes</span>
            <span>Reference : {test.reference}</span>
          </div>
        </div>
      </details>

      {missingContext.length > 0 ? (
        <div className="mb-3">
          <Alert tone="warning" title="Donnees morphologiques manquantes">
            {missingContext.length} joueur{missingContext.length > 1 ? "s n'ont" : " n'a"} pas de taille
            ou de masse enregistree. Les calculs qui en dependent utiliseront une valeur par defaut,
            ce qui fausse le resultat. Realiser d'abord le test d'anthropometrie.
          </Alert>
        </div>
      ) : null}

      {/* Grille de saisie */}
      <div className="scroll-x panel" style={{ maxHeight: "65vh", overflowY: "auto" }}>
        <table className="data-table" ref={gridRef}>
          <caption className="sr-only">
            Grille de saisie du test {test.name.fr}, un joueur par ligne
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
                    {groupName || "Mesures"}
                  </th>
                ))}
              </tr>
            ) : null}
            <tr>
              <th scope="col" style={{ minWidth: "12rem", position: "sticky", left: 0, zIndex: 3 }}>
                Joueur
              </th>
              {test.fields.map((field) => (
                <th key={field.key} scope="col" style={{ minWidth: "7rem" }}>
                  <span className="block truncate" title={field.label.fr}>
                    {field.label.fr}
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
                        aria-label={hasValue ? "Ligne renseignee" : "Ligne vide"}
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {player.lastName} {player.firstName}
                        </span>
                        <span className="block text-[0.6875rem]" style={{ color: "var(--text-muted)" }}>
                          {player.position}
                          {player.status !== "ACTIVE" ? " · indisponible" : ""}
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
                          aria-label={`${field.label.fr} pour ${player.lastName}`}
                        >
                          <option value="">—</option>
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label.fr}
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
                          aria-label={`${field.label.fr} pour ${player.lastName} ${player.firstName}`}
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
              Enregistrement
            </>
          ) : (
            <>
              <Save size={16} aria-hidden="true" />
              Enregistrer {test.shortName.fr}
            </>
          )}
        </button>

        <span className="text-[0.8125rem] tabular" style={{ color: "var(--text-muted)" }}>
          {filledCount} / {players.length} joueurs renseignes
        </span>

        <span className="text-[0.75rem] ml-auto" style={{ color: "var(--text-muted)" }}>
          Entree ou fleche bas pour passer au joueur suivant
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
                Points d'attention detectes automatiquement
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
