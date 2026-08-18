"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AlertTriangle, Check, CloudOff, Info, Loader2, Save } from "lucide-react";

import { saveResultsAction, type SaveResultsResponse } from "@/app/actions/tests";
import type { TestSpec } from "@/lib/sports-science/types";
import { Alert, Badge } from "@/components/ui/primitives";
import { usePick, useT } from "@/lib/i18n/client";
import { useOffline } from "@/lib/offline/provider";
import { deleteDraft, readDraft, saveDraft } from "@/lib/offline/store";

export interface EntryPlayer {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  status: string;
  heightCm: number | null;
  weightKg: number | null;
}

/** Attente apres la derniere frappe avant l'envoi automatique. */
const AUTOSAVE_DELAY_MS = 1200;

type SaveState = "idle" | "saving" | "saved" | "queued";

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
  const { online, queueSave } = useOffline();
  const [values, setValues] = useState<Record<string, Record<string, string>>>(initialValues);
  const [response, setResponse] = useState<SaveResultsResponse | null>(null);
  const [pending, startTransition] = useTransition();
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const gridRef = useRef<HTMLTableElement>(null);

  /**
   * Joueurs modifies depuis le dernier envoi reussi.
   *
   * C'est le coeur de l'enregistrement automatique : seules ces lignes partent.
   * Renvoyer tout l'effectif a chaque frappe recalculerait les metriques
   * derivees de vingt cinq joueurs pour une valeur changee, et ecraserait au
   * passage le travail d'un collegue qui saisit la meme passation sur un autre
   * appareil.
   */
  const dirty = useRef<Set<string>>(new Set());
  const timer = useRef<number | null>(null);
  /** Derniere version des valeurs, lisible depuis un minuteur ou un evenement. */
  const latest = useRef(values);
  latest.current = values;

  // ---------------------------------------------------------------------------
  // Brouillon local
  // ---------------------------------------------------------------------------

  /**
   * Reprise d'une saisie interrompue.
   *
   * Le brouillon ne prime que la ou il apporte quelque chose : une valeur deja
   * enregistree cote serveur reste la reference, une valeur tapee mais jamais
   * partie est restauree. Ce qui compte est de ne jamais afficher une grille vide
   * alors que le travail a ete fait.
   */
  useEffect(() => {
    let cancelled = false;
    void readDraft(sessionId, test.key).then((draft) => {
      if (cancelled || !draft) return;
      setValues((current) => {
        const merged = { ...current };
        for (const [playerId, fields] of Object.entries(draft.values)) {
          merged[playerId] = { ...(current[playerId] ?? {}), ...fields };
        }
        return merged;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [sessionId, test.key]);

  // ---------------------------------------------------------------------------
  // Envoi
  // ---------------------------------------------------------------------------

  const commit = useCallback(
    (playerIds: string[], silent: boolean) => {
      if (!canEdit || playerIds.length === 0) return;

      const entries = playerIds.map((playerId) => ({
        playerId,
        values: latest.current[playerId] ?? {},
      }));

      // Les lignes partent : elles ne sont plus en attente de frappe. En cas
      // d'echec reseau elles rejoignent la file, pas cet ensemble.
      for (const playerId of playerIds) dirty.current.delete(playerId);
      setSaveState("saving");

      startTransition(async () => {
        try {
          const result = await saveResultsAction({
            sessionId,
            testKey: test.key,
            entries,
            silent,
          });
          setResponse(result);
          setSaveState("saved");
          setSavedAt(new Date());

          /*
           * Plus rien en attente : le brouillon local n'a plus de raison d'etre,
           * et il devient nuisible. Conserve, il serait refusionne a la prochaine
           * ouverture et masquerait une correction faite entre temps depuis un
           * autre appareil. Le brouillon n'existe donc que le temps ou il porte du
           * travail non envoye.
           */
          if (dirty.current.size === 0) await deleteDraft(sessionId, test.key);
        } catch {
          // Reseau absent : la saisie part en file locale et repartira seule.
          await queueSave({ sessionId, testKey: test.key, entries });
          setSaveState("queued");
        }
      });
    },
    [canEdit, queueSave, sessionId, test.key],
  );

  const schedule = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      commit([...dirty.current], true);
    }, AUTOSAVE_DELAY_MS);
  }, [commit]);

  const setValue = (playerId: string, fieldKey: string, value: string) => {
    const next = {
      ...latest.current,
      [playerId]: { ...(latest.current[playerId] ?? {}), [fieldKey]: value },
    };
    latest.current = next;
    setValues(next);
    setResponse(null);
    dirty.current.add(playerId);
    void saveDraft(sessionId, test.key, next);
    schedule();
  };

  /**
   * Un ecran de telephone qui s'eteint, une application basculee en arriere plan :
   * le minuteur ne se declenchera peut etre jamais. On envoie donc ce qui reste
   * des que la page cesse d'etre visible.
   */
  useEffect(() => {
    const flushNow = () => {
      if (dirty.current.size === 0) return;
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
      commit([...dirty.current], true);
    };

    const onHide = () => {
      if (document.visibilityState === "hidden") flushNow();
    };

    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [commit]);

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

  /**
   * Enregistrement explicite.
   *
   * L'enregistrement automatique suffit, mais le bouton reste : sur le terrain on
   * veut pouvoir decider soi meme que la ligne est finie, et voir la confirmation
   * arriver. C'est aussi ce qui declenche la revalidation des autres ecrans, que
   * l'enregistrement automatique reporte volontairement.
   */
  const save = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    const filled = players
      .filter((player) =>
        Object.values(latest.current[player.id] ?? {}).some((v) => String(v).trim() !== ""),
      )
      .map((player) => player.id);
    commit(filled, false);
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

        {/* Etat de l'enregistrement automatique. Discret, mais toujours present :
            c'est ce qui autorise a ne plus penser au bouton. */}
        {canEdit ? (
          <span
            className="inline-flex items-center gap-1.5 text-[0.8125rem]"
            style={{
              color:
                saveState === "queued"
                  ? "var(--warning)"
                  : saveState === "saved"
                    ? "var(--success)"
                    : "var(--text-muted)",
            }}
            aria-live="polite"
          >
            {saveState === "saving" ? (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                {t("common.saving")}
              </>
            ) : saveState === "queued" ? (
              <>
                <CloudOff size={14} aria-hidden="true" />
                {t("entry.savedOnDevice")}
              </>
            ) : saveState === "saved" && savedAt ? (
              <>
                <Check size={14} aria-hidden="true" />
                {t("entry.autosaved")}{" "}
                <span className="tabular">
                  {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </>
            ) : (
              <>
                {!online ? <CloudOff size={14} aria-hidden="true" /> : null}
                {t("entry.autosaveOn")}
              </>
            )}
          </span>
        ) : null}

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
