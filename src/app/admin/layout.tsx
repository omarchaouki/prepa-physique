import { AppShell, adminNavigation } from "@/components/shell/app-shell";
import { requireOwner } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, t] = await Promise.all([requireOwner(), getT()]);
  return (
    <AppShell user={user} sections={adminNavigation(t)}>
      {children}
    </AppShell>
  );
}
