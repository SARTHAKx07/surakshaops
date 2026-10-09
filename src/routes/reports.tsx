import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/ui-kit";
import { pageMeta } from "@/lib/meta";
import { today, useCollection, useSettings } from "@/lib/store";
import { inRange } from "@/lib/derive";
import { downloadReport, type ReportData } from "@/lib/pdf";
import type { Handover } from "@/lib/types";
import { daysFromToday } from "@/lib/seed";

export const Route = createFileRoute("/reports")({
  head: () => pageMeta("Reports", "Generate branded PDF reports for handovers, production, safety and incidents."),
  component: ReportsPage,
});

const TYPES = ["Shift handover report", "Coal production summary", "Safety inspection & SMP report", "Incident report"] as const;

function ReportsPage() {
  const [settings] = useSettings();
  const { items: handovers } = useCollection<Handover>("handovers");
  const { items: hazards } = useCollection("hazards");
  const { items: incidents } = useCollection("incidents");
  const [type, setType] = useState<(typeof TYPES)[number]>(TYPES[0]);
  const [from, setFrom] = useState(daysFromToday(-30));
  const [to, setTo] = useState(today());

  const report: ReportData = useMemo(() => {
    const base = { title: type, from, to, site: settings.siteName };
    const hs = handovers.filter((h) => inRange(h.date, from, to)).sort((a, b) => a.date.localeCompare(b.date));
    const sub = hs.filter((h) => h.status === "Submitted");
    if (type === "Shift handover report") return { ...base,
      head: ["Date", "Shift", "Dept", "Outgoing", "Incoming", "Work completed", "Prod. (t)", "Open issues", "Status"],
      body: hs.map((h) => [h.date, h.shift, h.department, h.outgoing, h.incoming, h.workCompleted, h.production, h.issues.filter((i) => !i.resolved).map((i) => i.text).join("; "), h.status]),
      totals: [["Handovers", hs.length], ["Submitted", sub.length], ["Drafts", hs.length - sub.length]] };
    if (type === "Coal production summary") {
      const days = new Map<string, number>();
      sub.forEach((h) => days.set(h.date, (days.get(h.date) ?? 0) + Number(h.production)));
      const total = sub.reduce((s, h) => s + Number(h.production), 0);
      return { ...base, head: ["Date", "Shifts reported", "Production (t)"],
        body: [...days].map(([d, t]) => [d, sub.filter((h) => h.date === d).length, t]),
        totals: [["Total production", `${total} t`], ["Days with production", days.size],
          ["Average per day", days.size ? `${(total / days.size).toFixed(1)} t` : "0 t"],
          ["Average per shift", sub.length ? `${(total / sub.length).toFixed(1)} t` : "0 t"]] };
    }
    if (type === "Safety inspection & SMP report") {
      const hz = hazards.filter((h) => inRange(h.reviewDate, from, to) || h.status !== "Closed");
      return { ...base, head: ["ID", "Hazard", "Location", "L", "S", "Score", "Level", "Controls", "Responsible", "Review date", "Status"],
        body: hz.map((h) => [h.hazardId, h.description, h.location, h.likelihood, h.severity, h.score, h.level, h.controls, h.responsible, h.reviewDate, `${h.status} / ${h.review}`]),
        totals: [["Hazards listed", hz.length], ["Open", hz.filter((h) => h.status === "Open").length],
          ["High/Critical", hz.filter((h) => h.level === "High" || h.level === "Critical").length],
          ["Pending human review", hz.filter((h) => h.review === "Pending review").length]] };
    }
    const inc = incidents.filter((i) => inRange(i.date, from, to));
    return { ...base, head: ["Date", "Location", "Category", "Severity", "Description", "Responsible", "Corrective action", "Status"],
      body: inc.map((i) => [i.date, i.location, i.category, i.severity, i.description, i.responsible, i.corrective, i.status]),
      totals: [["Incidents", inc.length], ["Open", inc.filter((i) => i.status !== "Closed").length], ["Closed", inc.filter((i) => i.status === "Closed").length]] };
  }, [type, from, to, settings, handovers, hazards, incidents]);

  return (
    <>
      <PageHeader title="Reports" description="Reports are built from your saved records — no re-typing needed." />
      <div className="card mb-4 grid gap-3 sm:grid-cols-4 sm:items-end">
        <div className="sm:col-span-2"><label className="label">Report type</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value as any)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><label className="label">From</label><input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><label className="label">To</label><input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} /></div>
      </div>
      <div className="card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Preview: {type}</h2>
          <button className="btn-primary" onClick={() => downloadReport(report)}><Download size={16} /> Download PDF</button>
        </div>
        <div className="mb-3 flex flex-wrap gap-4 text-sm">
          {report.totals.map(([k, v]) => <div key={k}><span className="text-muted-foreground">{k}:</span> <b>{v}</b></div>)}
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>{report.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{report.body.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
          </table>
          {!report.body.length && <p className="py-6 text-center text-sm text-muted-foreground">No records in this date range.</p>}
        </div>
      </div>
    </>
  );
}
