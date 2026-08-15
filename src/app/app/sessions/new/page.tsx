import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { listTeams } from "@/lib/queries";
import { CATEGORY_LABELS, TEST_BATTERIES, TEST_DEFINITIONS } from "@/lib/sports-science/catalog";
import { formatDateInput } from "@/lib/utils";
import { EmptyState, PageHeader, Panel } from "@/components/ui/primitives";
import { NewSessionForm } from "./new-session-form";

export const dynamic = "force-dynamic";

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const user = await requireUser();
  const { team } = await searchParams;
  const teams = await listTeams(user);

  if (teams.length === 0) {
    return (
      <>
        <PageHeader title="Nouvelle passation" />
        <Panel>
          <EmptyState
            title="Aucune equipe accessible"
            description="Vous devez etre rattache a au moins une equipe pour creer une passation."
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
            Passations
          </Link>
        }
        title="Nouvelle passation"
        description="Choisissez l'equipe, la date et les tests. La grille de saisie sera construite automatiquement a partir du protocole de chaque test."
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
          name: t.name.fr,
          shortName: t.shortName.fr,
          category: t.category,
          durationMin: t.durationMin,
          description: t.description.fr,
        }))}
        batteries={TEST_BATTERIES.map((b) => ({
          key: b.key,
          name: b.name.fr,
          description: b.description.fr,
          testKeys: b.testKeys,
          estimatedMinutesPerPlayer: b.estimatedMinutesPerPlayer,
          when: b.when.fr,
        }))}
        categoryLabels={CATEGORY_LABELS}
        defaultTeamId={team}
        today={formatDateInput(new Date())}
      />
    </>
  );
}
