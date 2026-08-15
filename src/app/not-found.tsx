import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-dvh grid place-items-center px-6">
      <div className="text-center max-w-md">
        <span
          className="grid place-items-center size-12 rounded-full mx-auto mb-4"
          style={{ background: "var(--surface-sunken)", color: "var(--text-muted)" }}
          aria-hidden="true"
        >
          <SearchX size={22} />
        </span>
        <h1 className="text-xl font-semibold tracking-tight">Page introuvable</h1>
        <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
          La page demandee n'existe pas ou vous n'avez pas les droits pour y acceder.
        </p>
        <Link href="/app" className="btn btn-primary mt-5">
          Retour au tableau de bord
        </Link>
      </div>
    </main>
  );
}
