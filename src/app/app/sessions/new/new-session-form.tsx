"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Clock, Loader2 } from "lucide-react";

import { createSessionAction } from "@/app/actions/tests";
import type { ActionState } from "@/app/actions/auth";
import type { I18nText, TestCategory } from "@/lib/sports-science/types";
import { Badge, Panel, PanelHeader } from "@/components/ui/primitives";
import { useLocale, useT } from "@/lib/i18n/client";

export interface TeamOption {
  id: string;
  name: string;
  organizationName: string;
  category: string;
}

export interface TestOption {
  key: string;
  name: string;
  shortName: string;
  category: TestCategory;
  durationMin: number;
  description: string;
}

export interface BatteryOption {
  key: string;
  name: string;
  description: string;
  testKeys: string[];
  estimatedMinutesPerPlayer: number;
  when: string;
}

function SubmitButton({ count }: { count: number }) {
  const t = useT();
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending || count === 0}>
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          {t("sessions.creating")}
        </>
      ) : (
        <>
          {t("sessions.createSession")}
          {count > 0 ? ` (${count})` : ""}
        </>
      )}
    </button>
  );
}

export function NewSessionForm({
  teams,
  tests,
  batteries,
  categoryLabels,
  defaultTeamId,
  today,
}: {
  teams: TeamOption[];
  tests: TestOption[];
  batteries: BatteryOption[];
  categoryLabels: Record<string, I18nText>;
  defaultTeamId?: string;
  today: string;
}) {
  const t = useT();
  const locale = useLocale();
  const [state, formAction] = useActionState<ActionState, FormData>(createSessionAction, {});
  const [selected, setSelected] = useState<string[]>([]);
  const [teamId, setTeamId] = useState(defaultTeamId ?? teams[0]?.id ?? "");

  const toggle = (key: string) =>
    setSelected((previous) =>
      previous.includes(key) ? previous.filter((k) => k !== key) : [...previous, key],
    );

  const applyBattery = (battery: BatteryOption) => setSelected(battery.testKeys);

  const grouped = useMemo(() => {
    const map = new Map<TestCategory, TestOption[]>();
    for (const test of tests) {
      const list = map.get(test.category) ?? [];
      list.push(test);
      map.set(test.category, list);
    }
    return [...map.entries()];
  }, [tests]);

  const totalMinutes = selected.reduce(
    (acc, key) => acc + (tests.find((t) => t.key === key)?.durationMin ?? 0),
    0,
  );

  const selectedTeam = teams.find((t) => t.id === teamId);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <div
          className="rounded-lg px-3 py-2.5 text-sm"
          style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
          role="alert"
        >
          {state.error}
        </div>
      ) : null}

      {/* Informations generales */}
      <Panel>
        <PanelHeader title={t("sessions.info")} subtitle={t("sessions.infoSubtitle")} />
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="teamId">
              {t("sessions.team")} *
            </label>
            <select
              id="teamId"
              name="teamId"
              required
              value={teamId}
              onChange={(event) => setTeamId(event.target.value)}
              className="field cursor-pointer"
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} · {team.organizationName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="date">
              {t("common.date")} *
            </label>
            <input id="date" name="date" type="date" required defaultValue={today} className="field" />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="name">
              {t("sessions.sessionName")} *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              className="field"
              placeholder={t("sessions.namePlaceholder")}
            />
          </div>

          <div>
            <label className="label" htmlFor="surface">
              {t("sessions.surface")}
            </label>
            <select id="surface" name="surface" className="field cursor-pointer" defaultValue="">
              <option value="">{t("sessions.surfaceNone")}</option>
              <option value="NATURAL_GRASS">{t("sessions.surfaceGrass")}</option>
              <option value="ARTIFICIAL">{t("sessions.surfaceArtificial")}</option>
              <option value="INDOOR">{t("sessions.surfaceIndoor")}</option>
              <option value="TRACK">{t("sessions.surfaceTrack")}</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="temperatureC">
              {t("sessions.temperature")}
            </label>
            <input
              id="temperatureC"
              name="temperatureC"
              type="number"
              step="0.5"
              min={-10}
              max={50}
              className="field"
              placeholder={t("sessions.temperatureUnit")}
            />
            <p className="text-[0.75rem] mt-1" style={{ color: "var(--text-muted)" }}>
              {t("sessions.temperatureHelp")}
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="notes">
              {t("common.notes")}
            </label>
            <textarea id="notes" name="notes" rows={2} className="field" placeholder={t("sessions.notesPlaceholder")} />
          </div>
        </div>
      </Panel>

      {/* Batteries pretes a l'emploi */}
      <Panel>
        <PanelHeader
title={t("sessions.batteries")}
          subtitle={t("sessions.batteriesSubtitle")}
        />
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {batteries.map((battery) => {
            const isApplied =
              battery.testKeys.length === selected.length &&
              battery.testKeys.every((key) => selected.includes(key));
            return (
              <button
                key={battery.key}
                type="button"
                onClick={() => applyBattery(battery)}
                className="panel-sunken p-3 text-left cursor-pointer transition-colors hover:bg-[var(--surface-hover)]"
                style={isApplied ? { borderColor: "var(--accent)", boxShadow: "0 0 0 1px var(--accent)" } : undefined}
                aria-pressed={isApplied}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{battery.name}</p>
                  {isApplied ? (
                    <Check size={15} style={{ color: "var(--accent)" }} aria-hidden="true" />
                  ) : null}
                </div>
                <p className="text-[0.75rem] mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {battery.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-[0.6875rem]" style={{ color: "var(--text-muted)" }}>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} aria-hidden="true" />
                    {t("entry.durationAbout")} {battery.estimatedMinutesPerPlayer} min {t("sessions.perPlayer")}
                  </span>
                  <span>· {battery.testKeys.length} {t("sessions.tests").toLowerCase()}</span>
                </div>
              </button>
            );
          })}
        </div>
      </Panel>

      {/* Selection des tests */}
      <Panel>
        <PanelHeader
title={t("sessions.testsToRun")}
          subtitle={t("sessions.testsToRunSubtitle")}
          action={
            selected.length > 0 ? (
              <button type="button" className="btn btn-ghost" onClick={() => setSelected([])}>
                {t("sessions.clearSelection")}
              </button>
            ) : null
          }
        />

        <div className="space-y-4">
          {grouped.map(([category, list]) => (
            <div key={category}>
              <p
                className="text-[0.6875rem] font-semibold uppercase tracking-wider mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                {categoryLabels[category]?.[locale] ?? category}
              </p>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2">
                {list.map((test) => {
                  const checked = selected.includes(test.key);
                  return (
                    <label
                      key={test.key}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer transition-colors"
                      style={{
                        background: checked ? "var(--accent-soft)" : "var(--surface-sunken)",
                        border: `1px solid ${checked ? "var(--accent)" : "var(--border-subtle)"}`,
                      }}
                    >
                      <input
                        type="checkbox"
                        name="testKeys"
                        value={test.key}
                        checked={checked}
                        onChange={() => toggle(test.key)}
                        className="mt-0.5 size-4 shrink-0 cursor-pointer"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium truncate">{test.name}</span>
                        <span
                          className="block text-[0.75rem] mt-0.5"
                          style={{ color: checked ? "var(--accent-soft-text)" : "var(--text-muted)" }}
                        >
                          {t("entry.durationAbout")} {test.durationMin} min
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Barre de validation */}
      <div
        className="sticky bottom-0 flex flex-wrap items-center gap-3 p-3 rounded-lg"
        style={{
          background: "var(--surface-panel)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-panel)",
        }}
      >
        <SubmitButton count={selected.length} />
        {selected.length > 0 ? (
          <>
            <Badge tone="brand">{selected.length} {t("sessions.tests").toLowerCase()}</Badge>
            <span className="text-[0.8125rem] tabular" style={{ color: "var(--text-muted)" }}>
              {t("entry.durationAbout")} {totalMinutes} {t("sessions.protocolMinutes")}
            </span>
          </>
        ) : (
          <span className="text-[0.8125rem]" style={{ color: "var(--text-muted)" }}>
            {t("sessions.selectAtLeastOne")}
          </span>
        )}
        {selectedTeam ? (
          <span className="text-[0.8125rem] ml-auto" style={{ color: "var(--text-muted)" }}>
            {selectedTeam.name} · {t("sessions.category")} {selectedTeam.category}
          </span>
        ) : null}
      </div>
    </form>
  );
}
