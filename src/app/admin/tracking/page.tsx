import { Radar } from "lucide-react";

import { requireOwner } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { getTracking } from "@/lib/tracking";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/primitives";
import { hasCapiToken } from "@/lib/capi";
import { TrackingForm } from "./tracking-form";

export const dynamic = "force-dynamic";

/**
 * Reglage des balises de mesure, reserve au proprietaire.
 *
 * La page tient en une colonne : deux champs, et la liste de ce que le pixel
 * remonte. Cette liste n'est pas de la documentation decorative. Sans elle, il
 * faut ouvrir le gestionnaire de publicites de Meta et deviner quel evenement
 * choisir comme conversion, ce qui se solde par une campagne qui optimise sur
 * des pages vues et depense sans amener une inscription.
 */
export default async function TrackingPage() {
  await requireOwner();
  const [t, tracking, capiConfigured] = await Promise.all([
    getT(),
    getTracking(),
    hasCapiToken(),
  ]);

  const events = [
    { name: "PageView", label: t("tracking.eventPageView") },
    { name: "SignupStarted", label: t("tracking.eventSignupStarted") },
    { name: "Lead", label: t("tracking.eventLead") },
    { name: "CompleteRegistration", label: t("tracking.eventRegistration") },
  ];

  return (
    <>
      <PageHeader title={t("tracking.title")} description={t("tracking.subtitle")} />

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <Panel>
          <PanelHeader title={t("tracking.title")} icon={<Radar size={16} />} />
          <TrackingForm
            facebookPixelId={tracking.facebookPixelId ?? ""}
            clarityProjectId={tracking.clarityProjectId ?? ""}
            // Un booleen, jamais le jeton : voir le commentaire du composant.
            capiConfigured={capiConfigured}
          />
        </Panel>

        <Panel>
          <PanelHeader title={t("tracking.eventsTitle")} subtitle={t("tracking.eventsIntro")} />

          <dl className="space-y-3">
            {events.map((event) => (
              <div key={event.name} className="flex flex-col gap-0.5">
                <dt className="text-[0.8125rem] font-semibold tabular">{event.name}</dt>
                <dd className="text-[0.8125rem]" style={{ color: "var(--text-secondary)" }}>
                  {event.label}
                </dd>
              </div>
            ))}
          </dl>

          <hr className="rule my-4" />

          <p className="text-[0.75rem] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {t("tracking.envNote")}
          </p>
          <p className="text-[0.75rem] leading-relaxed mt-2" style={{ color: "var(--text-muted)" }}>
            {t("tracking.privacyNote")}
          </p>
        </Panel>
      </div>
    </>
  );
}
