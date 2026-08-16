import { BookOpen, Clock, Package, Quote } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { CATEGORY_LABELS, TEST_BATTERIES, testsByCategory } from "@/lib/sports-science/catalog";
import { NORMS } from "@/lib/sports-science/norms";
import { metricLabel } from "@/lib/queries";
import { getLocale, getT, pick } from "@/lib/i18n/server";
import { Badge, PageHeader, Panel, PanelHeader } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function ReferencePage() {
  const [, t, locale] = await Promise.all([requireUser(), getT(), getLocale()]);
  const groups = testsByCategory();

  // Sources citees, dedoublonnees, pour la bibliographie de bas de page.
  const sources = [...new Set(NORMS.map((n) => n.source))].sort();

  return (
    <>
      <PageHeader title={t("reference.title")} description={t("reference.subtitle")} />

      {/* Batteries */}
      <Panel className="mb-4">
        <PanelHeader
          title={t("reference.batteries")}
          subtitle={t("reference.batteriesSubtitle")}
          icon={<Package size={16} />}
        />
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {TEST_BATTERIES.map((battery) => (
            <div key={battery.key} className="panel-sunken p-3">
              <p className="font-medium text-sm">{pick(battery.name, locale)}</p>
              <p
                className="text-[0.8125rem] mt-1 leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {pick(battery.description, locale)}
              </p>
              <p className="text-[0.75rem] mt-2" style={{ color: "var(--text-muted)" }}>
                {t("reference.when")} : {pick(battery.when, locale)}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {battery.testKeys.map((key) => (
                  <Badge key={key}>{key}</Badge>
                ))}
              </div>
              <p className="text-[0.75rem] mt-2 tabular" style={{ color: "var(--text-muted)" }}>
                {t("entry.durationAbout")} {battery.estimatedMinutesPerPlayer}{" "}
                {t("sessions.protocolMinutes").split(" ")[0]} {t("sessions.perPlayer")}
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
              title={pick(CATEGORY_LABELS[group.category], locale)}
              subtitle={`${group.tests.length} ${group.tests.length > 1 ? t("sessions.tests").toLowerCase() : t("player.test").toLowerCase()}`}
              icon={<BookOpen size={16} />}
            />
            <div className="space-y-3">
              {group.tests.map((test) => (
                <details key={test.key} className="panel-sunken p-3">
                  <summary className="cursor-pointer">
                    <span className="font-medium text-[0.9375rem]">{pick(test.name, locale)}</span>
                    <span
                      className="inline-flex items-center gap-1 ml-2 text-[0.75rem]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Clock size={12} aria-hidden="true" />
                      {test.durationMin} min
                    </span>
                  </summary>

                  <div className="mt-3 space-y-2.5 text-[0.875rem] leading-relaxed">
                    <p style={{ color: "var(--text-secondary)" }}>{pick(test.description, locale)}</p>

                    <div>
                      <p className="font-medium text-[0.8125rem] mb-0.5">
                        {t("entry.protocolLabel")}
                      </p>
                      <p style={{ color: "var(--text-secondary)" }}>{pick(test.protocol, locale)}</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2.5">
                      <div>
                        <p className="font-medium text-[0.8125rem] mb-0.5">{t("entry.equipment")}</p>
                        <p className="text-[0.8125rem]" style={{ color: "var(--text-secondary)" }}>
                          {pick(test.equipment, locale)}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-[0.8125rem] mb-0.5">{t("common.source")}</p>
                        <p className="text-[0.8125rem]" style={{ color: "var(--text-secondary)" }}>
                          {test.reference}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-[0.8125rem] mb-1">{t("reference.fields")}</p>
                      <div className="scroll-x">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th scope="col">{t("reference.field")}</th>
                              <th scope="col">{t("common.unit")}</th>
                              <th scope="col">{t("common.required")}</th>
                              <th scope="col">{t("reference.precision")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {test.fields.map((field) => (
                              <tr key={field.key}>
                                <td className="font-medium">{pick(field.label, locale)}</td>
                                <td>{field.unit || "—"}</td>
                                <td>{field.optional ? t("common.no") : t("common.yes")}</td>
                                <td style={{ color: "var(--text-muted)" }}>
                                  {field.help ? pick(field.help, locale) : "—"}
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
          title={t("reference.norms")}
          subtitle={t("reference.normsSubtitle")}
          icon={<Quote size={16} />}
        />
        <div className="scroll-x" style={{ maxHeight: "28rem", overflowY: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">{t("teams.metric")}</th>
                <th scope="col">{t("reference.population")}</th>
                <th scope="col">{t("reference.sex")}</th>
                <th scope="col">{t("squad.position")}</th>
                <th scope="col">{t("teams.mean")}</th>
                <th scope="col">{t("teams.sd")}</th>
                <th scope="col">{t("reference.direction")}</th>
                <th scope="col">{t("common.source")}</th>
              </tr>
            </thead>
            <tbody>
              {NORMS.map((norm, index) => (
                <tr
                  key={`${norm.metricKey}-${norm.population}-${norm.sex}-${norm.position ?? ""}-${index}`}
                >
                  <td className="font-medium">{metricLabel(norm.metricKey, locale)}</td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    {norm.population.replace(/_/g, " ").toLowerCase()}
                  </td>
                  <td>{norm.sex === "F" ? "F" : "M"}</td>
                  <td style={{ color: "var(--text-muted)" }}>
                    {norm.position ?? t("reference.allPositions")}
                  </td>
                  <td className="tabular">{norm.mean}</td>
                  <td className="tabular">{norm.sd}</td>
                  <td className="text-[0.8125rem]" style={{ color: "var(--text-muted)" }}>
                    {norm.higherIsBetter ? t("reference.higherBetter") : t("reference.lowerBetter")}
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
        <PanelHeader title={t("reference.sources")} subtitle={t("reference.sourcesSubtitle")} />
        <ul
          className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-[0.8125rem]"
          style={{ color: "var(--text-secondary)" }}
        >
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
          {t("reference.footer")}
        </p>
      </Panel>
    </>
  );
}
