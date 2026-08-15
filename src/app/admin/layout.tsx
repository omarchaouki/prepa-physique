import { AppShell, adminNavigation } from "@/components/shell/app-shell";
import { requireOwner } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireOwner();
  return (
    <AppShell user={user} sections={adminNavigation()}>
      {children}
    </AppShell>
  );
}
