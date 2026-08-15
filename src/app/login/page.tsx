import { redirect } from "next/navigation";
import { Activity } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Connexion | Prepa Physique" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const [user, { from }] = await Promise.all([getCurrentUser(), searchParams]);
  if (user) redirect(user.role === "OWNER" ? "/admin" : "/app");

  return (
    <main className="min-h-dvh grid lg:grid-cols-2">
      {/* Colonne de presentation, masquee sur mobile pour laisser la place au formulaire */}
      <section
        className="hidden lg:flex flex-col justify-between p-10"
        style={{ background: "var(--surface-panel)", borderRight: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="grid place-items-center size-9 rounded-lg"
            style={{ background: "var(--accent)", color: "var(--accent-text)" }}
          >
            <Activity size={19} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="font-semibold text-lg tracking-tight">Prepa Physique</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-2xl font-semibold leading-snug tracking-tight">
            La preparation physique du football, appuyee sur les donnees.
          </h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Batterie de tests complete, calculs automatiques issus de la litterature scientifique,
            profils individuels compares aux normes de la population, detection des asymetries et
            recommandations de programmation.
          </p>

          <ul className="mt-6 space-y-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
            {[
              "Profil force vitesse horizontal par la methode de Samozino",
              "Depistage du risque lesionnel : Nordic, adducteurs, asymetries",
              "Capacite intermittente et vitesses de prescription individualisees",
              "Maturation biologique et adaptation de la charge chez les jeunes",
            ].map((item) => (
              <li key={item} className="flex gap-2.5">
                <span
                  className="mt-1.5 size-1.5 rounded-full shrink-0"
                  style={{ background: "var(--accent)" }}
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Les valeurs de reference proviennent de travaux publies. Chaque calcul cite sa source dans
          le referentiel de l'application.
        </p>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <span
              className="grid place-items-center size-9 rounded-lg"
              style={{ background: "var(--accent)", color: "var(--accent-text)" }}
            >
              <Activity size={19} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <span className="font-semibold text-lg tracking-tight">Prepa Physique</span>
          </div>

          <h2 className="text-xl font-semibold tracking-tight">Connexion</h2>
          <p className="text-sm mt-1 mb-6" style={{ color: "var(--text-secondary)" }}>
            Accedez a l'espace de votre equipe.
          </p>

          <LoginForm from={from} />
        </div>
      </section>
    </main>
  );
}
