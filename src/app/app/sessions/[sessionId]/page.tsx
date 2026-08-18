import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, ClipboardList, Lock, UserPlus } from "lucide-react";

import { canAccessTeam, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getTest } from "@/lib/sports-science/catalog";
import { toTestSpec } from "@/lib/sports-science/types";
import { getLocaleTag, getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";
import {
  Alert,
  Badge,
  PageHeader,
  Panel,
  PanelHeader,
  StatCard,
} from "@/components/ui/primitives";
import { Skeleton, SkeletonStats, SkeletonTable } from "@/components/ui/skeleton";
import { SessionTabs, type SessionTab } from "@/components/session-tabs";

export const dynamic = "force-dynamic";

const SURFACE_KEYS = {
  NATURAL_GRASS: "sessions.surfaceGrass",
  ARTIFICIAL: "sessions.surfaceArtificial",
  INDOOR: "sessions.surfaceIndoor",
  TRACK: "sessions.surfaceTrack",
} as const;

/**
 * La grille de saisie doit charger l'effectif complet et les resultats deja
 * enregistres. L'entete de la passation, lui, tient dans une seule ligne : il
 * part immediatement pendant que la grille se construit.
 */
async function EntrySection({
  sessionId,
  teamId,
  testKeys,
  canEdit,
}: {
  sessionId: string;
  teamId: string;
  testKeys: string[];
  canEdit: boolean;
}) {
  const [t, players, results] = await Promise.all([
    getT(),
    prisma.player.findMany({
      where: { teamId, status: { not: "LEFT" } },
      orderBy: [{ lastName: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        position: true,
        status: true,
        heightCm: true,
        weightKg: true,
      },
    }),
    prisma.testResult.findMany({
      where: { sessionId },
      select: { playerId: true, testKey: true, rawJson: true },
    }),
  ]);

  const tabs: SessionTab[] = testKeys
    .map((key) => {
      const definition = getTest(key);
      if (!definition) return null;

      const initialValues: Record<string, Record<string, string>> = {};
      for (const result of results.filter((r) => r.testKey === key)) {
        try {
          const raw = JSON.parse(result.rawJson) as Record<string, unknown>;
          initialValues[result.playerId] = Object.fromEntries(
            Object.entries(raw).map(([field, value]) => [field, String(value)]),
          );
        } catch {
          initialValues[result.playerId] = {};
        }
      }

      return {
        spec: toTestSpec(definition),
        initialValues,
        filledCount: Object.keys(initialValues).length,
      };
    })
    .filter((tab): tab is SessionTab => tab !== null);

  const totalExpected = players.length * tabs.length;
  const totalFilled = tabs.reduce((acc, tab) => acc + tab.filledCount, 0);
  const completion = totalExpected === 0 ? 0 : Math.round((totalFilled / totalExpected) * 100);

  return (
    <>
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          label={t("sessions.statPlayers")}
          value={players.length}
          hint={t("sessions.statPlayersHint")}
        />
        <StatCard
          label={t("sessions.statTests")}
          value={tabs.length}
          hint={t("sessions.statTestsHint")}
        />
        <StatCard
label={t("sessions.statEntered")}
          value={totalFilled}
hint={`${t("common.of")} ${totalExpected} ${t("sessions.statEnteredHint")}`}
          tone={completion === 100 ? "positive" : completion > 0 ? "warning" : "neutral"}
        />
        <StatCard
label={t("sessions.statProgress")}
          value={completion}
          unit="%"
          tone={completion === 100 ? "positive" : "neutral"}
        />
      </section>

      <Panel>
        <PanelHeader
title={t("sessions.entry")}
          subtitle={t("sessions.entrySubtitle")}
          icon={<ClipboardList size={16} />}
        />
        {players.length === 0 ? (
          // Une passation sans effectif n'a rien a saisir : on renvoie la ou les
          // joueurs s'ajoutent, dans l'equipe de cette passation precisement.
          <div className="py-8 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {t("sessions.noPlayersBody")}
            </p>
            {canEdit ? (
              <Link href={`/app/teams/${teamId}/manage`} className="btn btn-primary mt-3">
                <UserPlus size={15} aria-hidden="true" />
                {t("manage.addPlayer")}
              </Link>
            ) : null}
          </div>
        ) : (
          <SessionTabs
            sessionId={sessionId}
            tabs={tabs}
            players={players}
            canEdit={canEdit}
          />
        )}
      </Panel>
    </>
  );
}

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const [user, t, tag, session] = await Promise.all([
    requireUser(),
    getT(),
    getLocaleTag(),
    prisma.testSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        name: true,
        date: true,
        testKeys: true,
        surface: true,
        temperatureC: true,
        notes: true,
        isLocked: true,
        teamId: true,
        team: { select: { id: true, name: true, category: true } },
      },
    }),
  ]);
  if (!session) notFound();

  const access = await canAccessTeam(user, session.teamId);
  if (!access.allowed) redirect("/app/sessions");

  const testKeys = session.testKeys.split(",").filter(Boolean);

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
        title={session.name}
        description={`${formatDate(session.date, tag)} · ${session.team.name}${session.surface && session.surface in SURFACE_KEYS ? ` · ${t(SURFACE_KEYS[session.surface as keyof typeof SURFACE_KEYS])}` : ""}${session.temperatureC != null ? ` · ${session.temperatureC} °C` : ""}`}
        action={
          <>
            <Badge tone="brand">{session.team.category}</Badge>
            <Link href={`/app/teams/${session.team.id}`} className="btn btn-secondary">
              {t("teams.viewSquad")}
            </Link>
          </>
        }
      />

      {session.notes ? (
        <div className="mb-4">
          <Alert tone="info" title={t("sessions.notesTitle")}>
            {session.notes}
          </Alert>
        </div>
      ) : null}

      {session.isLocked ? (
        <div className="mb-4">
          <Alert tone="warning" title={t("sessions.locked")}>
            <span className="inline-flex items-center gap-1.5">
              <Lock size={14} aria-hidden="true" />
              {t("sessions.lockedBody")}
            </span>
          </Alert>
        </div>
      ) : null}

      <Suspense
        fallback={
          <>
            <div className="mb-4">
              <SkeletonStats />
            </div>
            <Panel>
              <PanelHeader
title={t("sessions.entry")}
                subtitle={t("sessions.entrySubtitle")}
                icon={<ClipboardList size={16} />}
              />
              <div className="flex gap-1 mb-4">
                {testKeys.map((key) => (
                  <Skeleton key={key} className="h-10 w-24 rounded-lg" />
                ))}
              </div>
              <SkeletonTable rows={10} columns={6} />
            </Panel>
          </>
        }
      >
        <EntrySection
          sessionId={session.id}
          teamId={session.teamId}
          testKeys={testKeys}
          canEdit={access.canEdit && !session.isLocked}
        />
      </Suspense>
    </>
  );
}
