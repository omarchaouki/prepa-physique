import Link from "next/link";
import { SearchX } from "lucide-react";

import { getT } from "@/lib/i18n/server";

export default async function NotFound() {
  const t = await getT();
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
        <h1 className="text-xl font-semibold tracking-tight">{t("error.notFound")}</h1>
        <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
          {t("error.notFoundBody")}
        </p>
        <Link href="/app" className="btn btn-primary mt-5">
          {t("error.backToDashboard")}
        </Link>
      </div>
    </main>
  );
}
