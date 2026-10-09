import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard, ArrowLeftRight, ShieldAlert, Siren, BookOpen, Users, Wrench,
  FileText, Network, Settings, Menu, HardHat,
} from "lucide-react";
import { useSettings } from "@/lib/store";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/handover", label: "Shift Handover", icon: ArrowLeftRight },
  { to: "/smp", label: "Safety Plan (SMP)", icon: ShieldAlert },
  { to: "/incidents", label: "Incidents", icon: Siren },
  { to: "/logbooks", label: "Log Books", icon: BookOpen },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/equipment", label: "Equipment", icon: Wrench },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/erp", label: "ERP Integration", icon: Network },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [settings] = useSettings();
  const pathname = useRouterState({
  select: (state) => state.location.pathname,
});

if (pathname === "/login") {
  return <>{children}</>;
}
  return (
    <div className="flex min-h-screen">
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 border-r border-border bg-sidebar transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <div className="rounded bg-primary p-1.5 text-primary-foreground"><HardHat size={20} /></div>
          <div>
            <div className="font-display text-lg font-bold leading-none">SurakshaOps</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Safer Mines. Smarter Operations.</div>
          </div>
        </div>
        <nav className="space-y-0.5 p-2">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              activeProps={{ className: "!bg-primary/15 !text-primary font-medium" }}>
              <Icon size={17} /> {label}
            </Link>
          ))}
              </nav>

      <div className="absolute bottom-4 left-0 w-full px-4">
        <button
          onClick={async () => {
            const { error } = await supabase.auth.signOut();
            if (!error) {
              window.location.href = "/login";
            } else {
              alert("Logout failed. Please try again.");
            }
          }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
      {open && <div className="fixed inset-0 z-30 bg-background/70 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 items-center gap-3 border-b border-border bg-sidebar px-4">
          <button className="btn-ghost p-1.5 lg:hidden" onClick={() => setOpen(true)} aria-label="Menu"><Menu size={18} /></button>
          <span className="truncate text-sm text-muted-foreground">Coal Mine Productivity & Safety Management System</span>
          <span className="ml-auto truncate text-xs text-muted-foreground">{settings.siteName}</span>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
        
      </div>
    </div>
  );
}
