import { BookOpen, Clock, Package, Quote } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { CATEGORY_LABELS, TEST_BATTERIES, testsByCategory } from "@/lib/sports-science/catalog";
import { NORMS } from "@/lib/sports-science/norms";
import { metricLabel } from "@/lib/queries";
import { Badge, PageHeader, Panel, PanelHeader } from "@/components/ui/primitives";

export const metadata = { title: "Referentiel des tests | Prepa Physique" };

export default async function ReferencePage() {
  await requireUser();
  const groups = testsByCategory();

  // Sources citees, dedoublonnees, pour la bibliographie de bas de page.
  const sources = [...new Set(NORMS.map((n) => n.source))].sort();

  return (
    <>
      <PageHeader
        title="Referentiel des tests"
        description="Protocole, materiel, duree et source scientifique de chaque test disponible dans l'application. Ce sont ces protocoles qui rendent les comparaisons valides d'une passation a l'autre."
      />

      {/* Batteries */}
      <Panel className="mb-4">
        <PanelHeader
          title="Batteries pretes a l'emploi"
          subtitle="Regroupements de tests alignes sur les moments cles de la saison"
          icon={<Package size={16} />}
        />
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {TEST_BATTERIES.map((battery) => (
            <div key={battery.key} className="panel-sunken p-3">
              <p className="font-medium text-sm">{battery.name.fr}</p>
              <p className="text-[0.8125rem] mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {battery.description.fr}
              </p>
              <p className="text-[0.75rem] mt-2" style={{ color: "var(--text-muted)" }}>
                Quand : {battery.when.fr}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {battery.testKeys.map((key) => (
                  <Badge key={key}>{key}</Badge>
                ))}
              </div>
              <p className="text-[0.75rem] mt-2 tabular" style={{ color: "var(--text-muted)" }}>
                Environ {battery.estimatedMinutesPerPlayer} minutes par joueur
              </p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Tests par categorie */}
      <div className="space-y-4">
        {groups.map((group) => (
          <Panel key={group.category}>
            <PanelHeader
              title={CATEGORY_LABELS[group.category].fr}
              subtitle={`${group.tests.length} test${group.tests.length > 1 ? "s" : ""}`}
              icon={<BookOpen size={16} />}
            />
            <div className="space-y-3">
              {group.tests.map((test) => (
                <details key={test.key} className="panel-sunken p-3">
                  <summary className="cursor-pointer">
                    <span className="font-medium text-[0.9375rem]">{test.name.fr}</span>
                    <span className="inline-flex items-center gap-1 ml-2 text-[0.75rem]" style={{ color: "var(--text-muted)" }}>
                      <Clock size={12} aria-hidden="true" />
                      {test.durationMin} min
                    </span>
                  </summary>

                  <div className="mt-3 space-y-2.5 text-[0.875rem] leading-relaxed">
                    <p style={{ color: "var(--text-secondary)" }}>{test.description.fr}</p>

                    <div>
                      <p className="font-medium text-[0.8125rem] mb-0.5">Protocole</p>
                      <p style={{ color: "var(--text-secondary)" }}>{test.protocol.fr}</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2.5">
                      <div>
                        <p className="font-medium text-[0.8125rem] mb-0.5">Materiel</p>
                        <p className="text-[0.8125rem]" style={{ color: "var(--text-secondary)" }}>
                          {test.equipment.fr}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-[0.8125rem] mb-0.5">Source</p>
                        <p className="text-[0.8125rem]" style={{ color: "var(--text-secondary)" }}>
                          {test.reference}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-[0.8125rem] mb-1">Valeurs a saisir</p>
                      <div className="scroll-x">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th scope="col">Champ</th>
                              <th scope="col">Unite</th>
                              <th scope="col">Obligatoire</th>
                              <th scope="col">Precision</th>
                            </tr>
                          </thead>
                          <tbody>
                            {test.fields.map((field) => (
                              <tr key={field.key}>
                                <td className="font-medium">{field.label.fr}</td>
                                <td>{field.unit || "—"}</td>
                                <td>{field.optional ? "non" : "oui"}</td>
                                <td style={{ color: "var(--text-muted)" }}>
                                  {field.help?.fr ?? "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </Panel>
        ))}
      </div>

      {/* Valeurs de reference */}
      <Panel className="mt-4">
        <PanelHeader
          title="Valeurs de reference"
          subtitle="Moyennes et ecarts types utilises pour calculer les percentiles"
          icon={<Quote size={16} />}
        />
        <div className="scroll-x" style={{ maxHeight: "28rem", overflowY: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Metrique</th>
                <th scope="col">Population</th>
                <th scope="col">Sexe</th>
                <th scope="col">Poste</th>
                <th scope="col">Moyenne</th>
                <th scope="col">Ecart type</th>
                <th scope="col">Sens</th>
                <th scope="col">Source</th>
              </tr>
            </thead>
            <tbody>
              {NORMS.map((norm, index) => (
                <tr key={`${norm.metricKey}-${norm.population}-${norm.sex}-${norm.position ?? ""}-${index}`}>
                  <td className="font-medium">{metricLabel(norm.metricKey)}</td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    {norm.population.replace(/_/g, " ").toLowerCase()}
                  </td>
                  <td>{norm.sex === "F" ? "F" : "M"}</td>
                  <td style={{ color: "var(--text-muted)" }}>{norm.position ?? "tous"}</td>
                  <td className="tabular">{norm.mean}</td>
                  <td className="tabular">{norm.sd}</td>
                  <td className="text-[0.8125rem]" style={{ color: "var(--text-muted)" }}>
                    {norm.higherIsBetter ? "plus haut est mieux" : "plus bas est mieux"}
                  </td>
                  <td className="text-[0.8125rem]" style={{ color: "var(--text-muted)" }}>
                    {norm.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Bibliographie */}
      <Panel className="mt-4">
        <PanelHeader title="Sources" subtitle="Travaux qui fondent les calculs et les valeurs de reference" />
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-[0.8125rem]" style={{ color: "var(--text-secondary)" }}>
          {sources.map((source) => (
            <li key={source} className="flex gap-2">
              <span
                className="mt-1.5 size-1 rounded-full shrink-0"
                style={{ background: "var(--accent)" }}
                aria-hidden="true"
              />
              {source}
            </li>
          ))}
        </ul>
        <p className="text-[0.75rem] mt-3 leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Les valeurs de reference sont des reperes de population issus d'echantillons publies. Elles
          servent a situer un joueur, pas a fixer un objectif. La comparaison la plus fiable reste
          toujours l'evolution du joueur par rapport a ses propres mesures anterieures.
        </p>
      </Panel>
    </>
  );
}
