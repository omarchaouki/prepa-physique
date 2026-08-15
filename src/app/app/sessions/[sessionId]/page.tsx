import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, ClipboardList, Lock } from "lucide-react";

import { canAccessTeam, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getTest } from "@/lib/sports-science/catalog";
import { toTestSpec } from "@/lib/sports-science/types";
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

const SURFACE_LABELS: Record<string, string> = {
  NATURAL_GRASS: "Pelouse naturelle",
  ARTIFICIAL: "Synthetique",
  INDOOR: "Salle",
  TRACK: "Piste",
};

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
  const [players, results] = await Promise.all([
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
        <StatCard label="Joueurs" value={players.length} hint="dans l'effectif" />
        <StatCard label="Tests" value={tabs.length} hint="dans cette passation" />
        <StatCard
          label="Resultats saisis"
          value={totalFilled}
          hint={`sur ${totalExpected} attendus`}
          tone={completion === 100 ? "positive" : completion > 0 ? "warning" : "neutral"}
        />
        <StatCard
          label="Avancement"
          value={completion}
          unit="%"
          tone={completion === 100 ? "positive" : "neutral"}
        />
      </section>

      <Panel>
        <PanelHeader
          title="Saisie des resultats"
          subtitle="Un onglet par test. Les valeurs derivees sont calculees a l'enregistrement."
          icon={<ClipboardList size={16} />}
        />
        {players.length === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>
            Aucun joueur dans cette equipe. Ajoutez l'effectif avant de saisir des resultats.
          </p>
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

  const [user, session] = await Promise.all([
    requireUser(),
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
            Passations
          </Link>
        }
        title={session.name}
        description={`${formatDate(session.date)} · ${session.team.name}${session.surface ? ` · ${SURFACE_LABELS[session.surface] ?? session.surface}` : ""}${session.temperatureC != null ? ` · ${session.temperatureC} degres` : ""}`}
        action={
          <>
            <Badge tone="brand">{session.team.category}</Badge>
            <Link href={`/app/teams/${session.team.id}`} className="btn btn-secondary">
              Voir l'effectif
            </Link>
          </>
        }
      />

      {session.notes ? (
        <div className="mb-4">
          <Alert tone="info" title="Notes de la passation">
            {session.notes}
          </Alert>
        </div>
      ) : null}

      {session.isLocked ? (
        <div className="mb-4">
          <Alert tone="warning" title="Passation verrouillee">
            <span className="inline-flex items-center gap-1.5">
              <Lock size={14} aria-hidden="true" />
              Les resultats ne peuvent plus etre modifies.
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
                title="Saisie des resultats"
                subtitle="Un onglet par test. Les valeurs derivees sont calculees a l'enregistrement."
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
