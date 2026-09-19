import { APP_NAME, SidebarBrandMark } from "@/app/components/brand-logo";
import { SidebarNav } from "@/app/components/sidebar-nav";
import { SidebarUser } from "@/app/components/sidebar-user";
import { isAdmin } from "@/lib/auth-helpers";
import { getSession } from "@/lib/session";

export default async function SideNav() {
  const session = await getSession();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-14 shrink-0 items-center gap-2 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <SidebarBrandMark />
        </div>
        <span className="text-sm font-semibold text-foreground">{APP_NAME}</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4">
        <p className="mb-2 px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Plataforma
        </p>
        <SidebarNav showAdmin={isAdmin(session)} />
      </div>

      {session && (
        <SidebarUser name={session.name} email={session.email} />
      )}
    </aside>
  );
}
