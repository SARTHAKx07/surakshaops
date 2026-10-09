import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Clock, Pickaxe, Siren, AlertTriangle } from "lucide-react";
import { Badge, Empty, PageHeader, Stat } from "@/components/ui-kit";
import { pageMeta } from "@/lib/meta";
import { today, useCollection } from "@/lib/store";
import { openIssues, pendingActions, productionByDay } from "@/lib/derive";
import type { Handover } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => pageMeta("Dashboard", "Live overview of coal production, shifts, hazards and pending safety actions."),
  component: Dashboard,
});

function Dashboard() {
  const { items: employees } = useCollection("employees");
  const { items: handovers } = useCollection<Handover>("handovers");
  const { items: hazards } = useCollection("hazards");
  const { items: incidents } = useCollection("incidents");
  const { items: equipment } = useCollection("equipment");

  const t = today();
  const todays = handovers.filter((h) => h.date === t);
  const prod = productionByDay(handovers);
  const max = Math.max(1, ...prod.map((p) => p.total));
  const weekTotal = prod.reduce((s, p) => s + p.total, 0);
  const openInc = incidents.filter((i) => i.status !== "Closed");
  const pending = pendingActions({ hazards, incidents, equipment, handovers });
  const levels = ["Low", "Medium", "High", "Critical"].map((l) => ({ l, n: hazards.filter((h) => h.level === l && h.status !== "Closed").length }));
  const maxL = Math.max(1, ...levels.map((x) => x.n));
  const demoCount = [employees, handovers, hazards, incidents, equipment].flat().filter((r) => r.demo).length;

  return (
    <>
      <PageHeader title="Dashboard" description="All figures are calculated from saved records." />
      
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active employees" value={employees.filter((e) => e.status === "Active").length} sub={`${employees.length} total`} icon={<Users />} />
        <Stat label="Shifts logged today" value={todays.length} sub={`${todays.filter((h) => h.status === "Draft").length} drafts`} icon={<Clock />} />
        <Stat label="Today's production" value={`${todays.filter((h) => h.status === "Submitted").reduce((s, h) => s + Number(h.production), 0)} t`} sub={`7-day total ${weekTotal} t · avg ${(weekTotal / 7).toFixed(0)} t/day`} icon={<Pickaxe />} />
        <Stat label="Open incidents" value={openInc.length} sub={`${openIssues(handovers).length} unresolved handover issues`} icon={<Siren />} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-3 font-semibold">Coal production — last 7 days (tonnes)</h2>
          <div className="flex h-48 items-end gap-2">
            {prod.map((p) => (
              <div key={p.date} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">{p.total || ""}</span>
                <div className="w-full rounded-t bg-primary/80" style={{ height: `${(p.total / max) * 150}px`, minHeight: 2 }} />
                <span className="text-[10px] text-muted-foreground">{p.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="mb-3 font-semibold">Hazard risk summary (active)</h2>
          <div className="space-y-3">
            {levels.map(({ l, n }) => (
              <div key={l}>
                <div className="mb-1 flex justify-between text-sm"><Badge value={l} /><span>{n}</span></div>
                <div className="h-2 rounded bg-muted"><div className={`h-2 rounded ${l === "Low" ? "bg-success" : l === "Medium" ? "bg-warning" : "bg-destructive"}`} style={{ width: `${(n / maxL) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-2 font-semibold">Recent incidents</h2>
          {incidents.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map((i) => (
            <Link to="/incidents" key={i.id} className="flex items-center justify-between gap-2 border-b border-border/60 py-2 text-sm hover:text-primary">
              <span className="truncate">{i.date} · {i.category} · {i.location}</span><Badge value={i.status} />
            </Link>
          ))}
          {!incidents.length && <Empty text="No incidents recorded." />}
        </div>
        <div className="card">
          <h2 className="mb-2 flex items-center gap-2 font-semibold"><AlertTriangle size={16} className="text-primary" /> Pending actions ({pending.length})</h2>
          <div className="max-h-72 overflow-y-auto">
            {pending.map((p, i) => (
              <Link to={p.to} key={i} className="block border-b border-border/60 py-2 text-sm hover:text-primary">
                <div className="text-xs text-warning">{p.kind}{p.due && ` · ${p.due}`}</div>
                <div className="truncate">{p.text}</div>
              </Link>
            ))}
            {!pending.length && <Empty text="Nothing pending." />}
          </div>
        </div>
      </div>
    </>
  );
}
