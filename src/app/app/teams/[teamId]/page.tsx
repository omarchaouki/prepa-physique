import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BarChart3, ChevronLeft, Plus, Users } from "lucide-react";

import { canAccessTeam, requireUser } from "@/lib/auth";
import { getSquadOverview, getTeamHeader, metricLabel } from "@/lib/queries";
import { TEAM_LEVEL_LABELS, type TeamLevel } from "@/lib/constants";
import { resolvePopulation } from "@/lib/sports-science/norms";
import { formatNumber } from "@/lib/utils";
import {
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  PanelHeader,
  StatCard,
} from "@/components/ui/primitives";
import { SkeletonStats, SkeletonTable } from "@/components/ui/skeleton";
import { SquadTable, type SquadTableColumn } from "@/components/squad-table";

export const dynamic = "force-dynamic";

/** Colonnes affichees dans le tableau d'effectif, dans l'ordre de lecture du staff. */
const COLUMN_CONFIG: Array<{ key: string; decimals: number; unit: string; higherIsBetter: boolean }> = [
  { key: "sprint_10m", decimals: 3, unit: "s", higherIsBetter: false },
  { key: "sprint_30m", decimals: 3, unit: "s", higherIsBetter: false },
  { key: "sprint_vmax", decimals: 1, unit: "km/h", higherIsBetter: true },
  { key: "sprint_f0", decimals: 2, unit: "N/kg", higherIsBetter: true },
  { key: "cmj_height", decimals: 1, unit: "cm", higherIsBetter: true },
  { key: "cmj_asym", decimals: 1, unit: "%", higherIsBetter: false },
  { key: "cod_505_best", decimals: 3, unit: "s", higherIsBetter: false },
  { key: "nordic_rel", decimals: 2, unit: "N/kg", higherIsBetter: true },
  { key: "groin_add_rel", decimals: 2, unit: "N/kg", higherIsBetter: true },
  { key: "vift", decimals: 1, unit: "km/h", higherIsBetter: true },
  { key: "vo2max_ift", decimals: 1, unit: "ml/kg/min", higherIsBetter: true },
  { key: "vo2max_yoyo", decimals: 1, unit: "ml/kg/min", higherIsBetter: true },
  { key: "body_fat", decimals: 1, unit: "%", higherIsBetter: false },
];

// ---------------------------------------------------------------------------
// Indicateurs de l'effectif
// ---------------------------------------------------------------------------

async function SquadStatsSection({ teamId }: { teamId: string }) {
  const overview = await getSquadOverview(teamId);
  if (!overview) return null;

  const { rows } = overview;
  const availablePlayers = rows.filter((r) => r.status === "ACTIVE").length;
  const totalAlerts = rows.reduce((a, r) => a + r.alerts, 0);
  const criticalAlerts = rows.reduce((a, r) => a + r.criticalAlerts, 0);
  const testedPlayers = rows.filter((r) => Object.keys(r.metrics).length > 0).length;

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label="Effectif"
        value={rows.length}
        hint={`${availablePlayers} disponibles`}
        icon={<Users size={15} />}
      />
      <StatCard
        label="Joueurs testes"
        value={testedPlayers}
        hint={`sur ${rows.length}`}
        tone={testedPlayers < rows.length ? "warning" : "positive"}
      />
      <StatCard
        label="Alertes"
        value={totalAlerts}
        hint="sur l'ensemble du groupe"
        tone={totalAlerts > 0 ? "warning" : "positive"}
      />
      <StatCard
        label="Alertes critiques"
        value={criticalAlerts}
        hint="a traiter en priorite"
        tone={criticalAlerts > 0 ? "danger" : "positive"}
      />
    </section>
  );
}

// ---------------------------------------------------------------------------
// Tableau d'effectif et synthese statistique
// ---------------------------------------------------------------------------

async function SquadSection({ teamId }: { teamId: string }) {
  const overview = await getSquadOverview(teamId);
  if (!overview) return null;

  const { rows, squadStats } = overview;

  // On ne garde que les colonnes reellement renseignees pour cette equipe.
  const columns: SquadTableColumn[] = COLUMN_CONFIG.filter((config) =>
    rows.some((row) => row.metrics[config.key] !== undefined),
  ).map((config) => ({
    key: config.key,
    label: metricLabel(config.key),
    unit: config.unit,
    decimals: config.decimals,
    higherIsBetter: config.higherIsBetter,
  }));

  const statsRecord = Object.fromEntries(
    [...squadStats.entries()].map(([key, stats]) => [
      key,
      { mean: stats.mean, sd: stats.sd, n: stats.n },
    ]),
  );

  return (
    <>
      <Panel className="p-4">
        <PanelHeader
          title="Effectif"
          subtitle="Dernieres valeurs mesurees, comparees a la population de reference"
          icon={<Users size={16} />}
        />
        {rows.length === 0 ? (
          <EmptyState
            title="Aucun joueur dans cette equipe"
            description="Ajoutez les joueurs avant de programmer une passation de tests."
            icon={<Users size={20} />}
          />
        ) : columns.length === 0 ? (
          <EmptyState
            title="Aucune donnee de test"
            description="Les joueurs sont enregistres mais aucun test n'a encore ete saisi."
            action={
              <Link href={`/app/sessions/new?team=${teamId}`} className="btn btn-primary">
                <Plus size={15} aria-hidden="true" />
                Creer une passation
              </Link>
            }
          />
        ) : (
          <SquadTable rows={rows} columns={columns} squadStats={statsRecord} />
        )}
      </Panel>

      {squadStats.size > 0 ? (
        <Panel className="mt-4">
          <PanelHeader
            title="Statistiques du groupe"
            subtitle="Moyenne, ecart type et effectif mesure pour chaque qualite"
            icon={<BarChart3 size={16} />}
          />
          <div className="scroll-x">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Metrique</th>
                  <th scope="col">Moyenne</th>
                  <th scope="col">Ecart type</th>
                  <th scope="col">Coefficient de variation</th>
                  <th scope="col">Joueurs mesures</th>
                </tr>
              </thead>
              <tbody>
                {[...squadStats.entries()]
                  .filter(([key]) => COLUMN_CONFIG.some((c) => c.key === key))
                  .map(([key, stats]) => {
                    const config = COLUMN_CONFIG.find((c) => c.key === key)!;
                    const cv = stats.mean === 0 ? 0 : (stats.sd / stats.mean) * 100;
                    return (
                      <tr key={key}>
                        <td className="font-medium">{metricLabel(key)}</td>
                        <td className="tabular">
                          {formatNumber(stats.mean, config.decimals)}{" "}
                          <span style={{ color: "var(--text-muted)" }}>{stats.unit}</span>
                        </td>
                        <td className="tabular">{formatNumber(stats.sd, config.decimals)}</td>
                        <td className="tabular">{formatNumber(cv, 1)} %</td>
                        <td className="tabular">{stats.n}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <p className="text-[0.75rem] mt-2" style={{ color: "var(--text-muted)" }}>
            Un coefficient de variation eleve signale un groupe heterogene sur cette qualite, donc un
            besoin d'individualisation plus fort.
          </p>
        </Panel>
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------------------

export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;

  // Trois requetes legeres et indexees, groupees en deux allers retours :
  // le cadre de la page est donc affiche sans attendre le calcul de l'effectif.
  const [user, team] = await Promise.all([requireUser(), getTeamHeader(teamId)]);
  if (!team) notFound();

  const access = await canAccessTeam(user, teamId);
  if (!access.allowed) redirect("/app/teams");

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link
            href="/app/teams"
            className="inline-flex items-center gap-1 text-[0.8125rem] cursor-pointer hover:underline"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronLeft size={14} aria-hidden="true" />
            Equipes
          </Link>
        }
        title={team.name}
        description={`${team.organization.name} · saison ${team.season} · population de reference ${resolvePopulation(team.category, team.level).replace(/_/g, " ").toLowerCase()}`}
        action={
          <>
            <Link href={`/app/analytics?team=${team.id}`} className="btn btn-secondary">
              <BarChart3 size={15} aria-hidden="true" />
              Analyses
            </Link>
            <Link href={`/app/sessions/new?team=${team.id}`} className="btn btn-primary">
              <Plus size={15} aria-hidden="true" />
              Nouvelle passation
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <Badge tone="brand">{team.category}</Badge>
        {team.level ? (
          <Badge>{TEAM_LEVEL_LABELS[team.level as TeamLevel]?.fr ?? team.level}</Badge>
        ) : null}
        <Badge>{team.sex === "F" ? "Feminin" : "Masculin"}</Badge>
      </div>

      <div className="mb-5">
        <Suspense fallback={<SkeletonStats />}>
          <SquadStatsSection teamId={teamId} />
        </Suspense>
      </div>

      <Suspense
        fallback={
          <Panel className="p-4">
            <PanelHeader
              title="Effectif"
              subtitle="Dernieres valeurs mesurees, comparees a la population de reference"
              icon={<Users size={16} />}
            />
            <SkeletonTable rows={10} columns={7} />
          </Panel>
        }
      >
        <SquadSection teamId={teamId} />
      </Suspense>
    </>
  );
}
