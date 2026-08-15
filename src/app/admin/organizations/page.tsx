import { Suspense } from "react";
import { Building2, Power } from "lucide-react";

import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toggleOrganizationAction } from "@/app/actions/admin";
import { PLANS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Badge, PageHeader, Panel, PanelHeader } from "@/components/ui/primitives";
import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";
import { CreateOrganizationForm, CreateTeamForm } from "./forms";

export const dynamic = "force-dynamic";

async function OrganizationList() {
  const organizations = await prisma.organization.findMany({
    include: {
      _count: { select: { users: true, teams: true } },
      teams: {
        select: {
          id: true,
          name: true,
          category: true,
          season: true,
          _count: { select: { players: true, testSessions: true } },
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (organizations.length === 0) {
    return (
      <Panel>
        <p className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>
          Aucun club enregistre. Creez le premier avec le formulaire a droite.
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      {organizations.map((organization) => {
        const playerCount = organization.teams.reduce((a, t) => a + t._count.players, 0);
        return (
          <Panel key={organization.id}>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{organization.name}</h2>
                  <Badge tone="brand">{organization.plan}</Badge>
                  <Badge tone={organization.isActive ? "success" : "danger"}>
                    {organization.isActive ? "Actif" : "Suspendu"}
                  </Badge>
                </div>
                <p className="text-[0.8125rem] mt-1" style={{ color: "var(--text-muted)" }}>
                  {[organization.city, organization.country].filter(Boolean).join(", ") ||
                    "Localisation non renseignee"}
                  {" · "}
                  cree le {formatDate(organization.createdAt)}
                  {organization.expiresAt ? ` · expire le ${formatDate(organization.expiresAt)}` : ""}
                </p>
              </div>

              <form
                action={async () => {
                  "use server";
                  await toggleOrganizationAction(organization.id);
                }}
              >
                <button
                  type="submit"
                  className={organization.isActive ? "btn btn-secondary" : "btn btn-primary"}
                >
                  <Power size={15} aria-hidden="true" />
                  {organization.isActive ? "Suspendre" : "Reactiver"}
                </button>
              </form>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {[
                { label: "Equipes", value: `${organization._count.teams} / ${organization.maxTeams}` },
                { label: "Joueurs", value: `${playerCount} / ${organization.maxPlayers}` },
                { label: "Utilisateurs", value: organization._count.users },
                {
                  label: "Passations",
                  value: organization.teams.reduce((a, t) => a + t._count.testSessions, 0),
                },
              ].map((stat) => (
                <div key={stat.label} className="panel-sunken p-2.5">
                  <p
                    className="text-[0.6875rem] uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {stat.label}
                  </p>
                  <p className="text-base font-semibold tabular mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>

            {organization.teams.length > 0 ? (
              <div className="scroll-x">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Equipe</th>
                      <th scope="col">Categorie</th>
                      <th scope="col">Saison</th>
                      <th scope="col">Joueurs</th>
                      <th scope="col">Passations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organization.teams.map((team) => (
                      <tr key={team.id}>
                        <td className="font-medium">{team.name}</td>
                        <td>{team.category}</td>
                        <td style={{ color: "var(--text-muted)" }}>{team.season}</td>
                        <td className="tabular">{team._count.players}</td>
                        <td className="tabular">{team._count.testSessions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[0.8125rem]" style={{ color: "var(--text-muted)" }}>
                Aucune equipe pour ce club.
              </p>
            )}
          </Panel>
        );
      })}
    </div>
  );
}

async function TeamFormSection() {
  const organizations = await prisma.organization.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return <CreateTeamForm organizations={organizations} />;
}

export default async function OrganizationsPage() {
  await requireOwner();

  return (
    <>
      <PageHeader
        title="Clubs"
        description="Chaque club est isole des autres. Ses utilisateurs ne voient que ses propres equipes et joueurs."
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Suspense
            fallback={
              <div className="space-y-4">
                {[0, 1].map((index) => (
                  <Panel key={index}>
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-3 w-64 mb-4" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                      {[0, 1, 2, 3].map((cell) => (
                        <div key={cell} className="panel-sunken p-2.5">
                          <Skeleton className="h-2.5 w-16" />
                          <Skeleton className="h-5 w-12 mt-1.5" />
                        </div>
                      ))}
                    </div>
                    <SkeletonTable rows={3} columns={5} firstColumnWide={false} />
                  </Panel>
                ))}
              </div>
            }
          >
            <OrganizationList />
          </Suspense>
        </div>

        <div className="space-y-4">
          <Panel>
            <PanelHeader
              title="Nouveau club"
              subtitle="Ouvrir un compte client"
              icon={<Building2 size={16} />}
            />
            <CreateOrganizationForm plans={[...PLANS]} />
          </Panel>

          <Panel>
            <PanelHeader title="Nouvelle equipe" subtitle="Rattachee a un club existant" />
            <Suspense
              fallback={
                <div className="space-y-3">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index}>
                      <Skeleton className="h-3 w-24 mb-1.5" />
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                  ))}
                </div>
              }
            >
              <TeamFormSection />
            </Suspense>
          </Panel>
        </div>
      </div>
    </>
  );
}
