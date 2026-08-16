import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { listTeams } from "@/lib/queries";
import { CATEGORY_LABELS, TEST_BATTERIES, TEST_DEFINITIONS } from "@/lib/sports-science/catalog";
import { getLocale, getT, pick } from "@/lib/i18n/server";
import { formatDateInput } from "@/lib/utils";
import { EmptyState, PageHeader, Panel } from "@/components/ui/primitives";
import { NewSessionForm } from "./new-session-form";

export const dynamic = "force-dynamic";

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const [user, { team }, t, locale] = await Promise.all([
    requireUser(),
    searchParams,
    getT(),
    getLocale(),
  ]);
  const teams = await listTeams(user);

  if (teams.length === 0) {
    return (
      <>
        <PageHeader title={t("sessions.new")} />
        <Panel>
          <EmptyState
title={t("analytics.noTeam")}
description={t("teams.noneBody")}
          />
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link
            href="/app/sessions"
            className="inline-flex items-center gap-1 text-[0.8125rem] cursor-pointer hover:underline"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronLeft size={14} aria-hidden="true" />
            {t("sessions.title")}
          </Link>
        }
title={t("sessions.new")}
        description={t("sessions.newSubtitle")}
      />

      <NewSessionForm
        teams={teams.map((t) => ({
          id: t.id,
          name: t.name,
          organizationName: t.organization.name,
          category: t.category,
        }))}
        tests={TEST_DEFINITIONS.map((t) => ({
          key: t.key,
          name: pick(t.name, locale),
          shortName: pick(t.shortName, locale),
          category: t.category,
          durationMin: t.durationMin,
          description: pick(t.description, locale),
        }))}
        batteries={TEST_BATTERIES.map((b) => ({
          key: b.key,
          name: pick(b.name, locale),
          description: pick(b.description, locale),
          testKeys: b.testKeys,
          estimatedMinutesPerPlayer: b.estimatedMinutesPerPlayer,
          when: pick(b.when, locale),
        }))}
        categoryLabels={CATEGORY_LABELS}
        defaultTeamId={team}
        today={formatDateInput(new Date())}
      />
    </>
  );
}
