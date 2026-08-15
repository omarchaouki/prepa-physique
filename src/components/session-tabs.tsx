"use client";

import { useState } from "react";

import { TestEntryGrid, type EntryPlayer } from "./test-entry-grid";
import type { TestSpec } from "@/lib/sports-science/types";

export interface SessionTab {
  spec: TestSpec;
  initialValues: Record<string, Record<string, string>>;
  filledCount: number;
}

export function SessionTabs({
  sessionId,
  tabs,
  players,
  canEdit,
}: {
  sessionId: string;
  tabs: SessionTab[];
  players: EntryPlayer[];
  canEdit: boolean;
}) {
  const [active, setActive] = useState(tabs[0]?.spec.key ?? "");
  const current = tabs.find((tab) => tab.spec.key === active) ?? tabs[0];

  if (!current) {
    return (
      <p className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>
        Aucun test rattache a cette passation.
      </p>
    );
  }

  return (
    <div>
      {/* Onglets : un par test de la passation */}
      <div
        className="scroll-x flex gap-1 mb-4 pb-1"
        role="tablist"
        aria-label="Tests de la passation"
      >
        {tabs.map((tab) => {
          const isActive = tab.spec.key === current.spec.key;
          const complete = tab.filledCount >= players.length && players.length > 0;
          return (
            <button
              key={tab.spec.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.spec.key)}
              className="btn shrink-0 cursor-pointer"
              style={{
                background: isActive ? "var(--accent)" : "var(--surface-sunken)",
                color: isActive ? "var(--accent-text)" : "var(--text-secondary)",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {tab.spec.shortName.fr}
              <span
                className="tabular text-[0.6875rem] px-1.5 rounded-full"
                style={{
                  background: isActive
                    ? "rgb(255 255 255 / 0.22)"
                    : complete
                      ? "var(--success-soft)"
                      : "var(--surface-panel)",
                  color: isActive ? "inherit" : complete ? "var(--success)" : "var(--text-muted)",
                }}
              >
                {tab.filledCount}/{players.length}
              </span>
            </button>
          );
        })}
      </div>

      <TestEntryGrid
        key={current.spec.key}
        sessionId={sessionId}
        test={current.spec}
        players={players}
        initialValues={current.initialValues}
        canEdit={canEdit}
      />
    </div>
  );
}
