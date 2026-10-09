import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, type Field } from "@/components/CrudPage";
import { Badge, DemoTag, Empty, PageHeader } from "@/components/ui-kit";
import { pageMeta } from "@/lib/meta";
import { today, useCollection, useSettings } from "@/lib/store";
import { riskLevel } from "@/lib/derive";

export const Route = createFileRoute("/smp")({
  head: () => pageMeta("Safety Management Plan", "Hazard register, risk assessment, control measures, monitoring and responsibilities."),
  component: SmpPage,
});

// Illustrative starting points only — not an approved statutory checklist.
const LIBRARY = [
  { description: "Roof instability", category: "Strata", controls: "Systematic support rules, roof bolting, roof testing every shift" },
  { description: "Methane accumulation", category: "Gas", controls: "Continuous gas monitoring, adequate ventilation, flameproof equipment" },
  { description: "Dust exposure", category: "Health", controls: "Water sprays, dust suppression, respirators, periodic medical checks" },
  { description: "Electrical hazards", category: "Electrical", controls: "Earthing checks, lockout/tagout, competent electricians only" },
  { description: "Ventilation problems", category: "Ventilation", controls: "Regular air measurements, maintain stoppings and doors" },
  { description: "Equipment malfunction", category: "Machinery", controls: "Preventive maintenance, pre-use checks, guarding" },
];
const SCALE = ["1", "2", "3", "4", "5"];
const TABS = ["Hazard Register", "Control Measures", "Monitoring Plan", "Responsibility Matrix"] as const;

function SmpPage() {
  const [settings] = useSettings();
  const { items: hazards } = useCollection("hazards");
  const { items: employees } = useCollection("employees");
  const [tab, setTab] = useState<(typeof TABS)[number]>("Hazard Register");

  const fields: Field[] = [
    { key: "hazardId", label: "Hazard ID", required: true, inTable: true },
    { key: "description", label: "Description", required: true, inTable: true },
    { key: "category", label: "Category", type: "select", options: ["Strata", "Gas", "Health", "Electrical", "Ventilation", "Machinery", "Fire", "Other"], required: true },
    { key: "location", label: "Location", required: true, inTable: true },
    { key: "likelihood", label: "Likelihood (1–5)", type: "select", options: SCALE, required: true },
    { key: "severity", label: "Severity (1–5)", type: "select", options: SCALE, required: true },
    { key: "controls", label: "Control measures", type: "textarea", required: true },
    { key: "responsible", label: "Responsible person", type: "select", options: employees.map((e) => e.name), required: true, inTable: true },
    { key: "monitoring", label: "Monitoring frequency", type: "select", options: ["Continuous", "Every shift", "Daily", "Weekly", "Monthly"] },
    { key: "reviewDate", label: "Review date", type: "date", required: true },
    { key: "status", label: "Status", type: "select", options: ["Open", "Controlled", "Closed"], required: true, inTable: true, badge: true },
    { key: "review", label: "Human review", type: "select", options: ["Pending review", "Reviewed"], required: true, inTable: true, badge: true },
  ];

  const nextId = `HZ-${String(hazards.length + 1).padStart(3, "0")}`;

  return (
    <>
      <PageHeader title="Safety Management Plan" description="Example hazards and controls are configurable starting points — verify against applicable DGMS requirements." />

      <div className="card mb-4 text-sm">
        <div className="font-medium">Risk formula: <span className="text-primary">Risk score = Likelihood × Severity</span> (each 1–5)</div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="badge-success">Low: 1–{settings.lowMax}</span>
          <span className="badge-warning">Medium: {settings.lowMax + 1}–{settings.mediumMax}</span>
          <span className="badge-danger">High: {settings.mediumMax + 1}–{settings.highMax}</span>
          <span className="badge-danger">Critical: {settings.highMax + 1}–25</span>
          <span className="text-xs text-muted-foreground">Thresholds can be changed in Settings. Every assessment must be reviewed by a competent person.</span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 text-sm ${tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>

      {tab === "Hazard Register" && (
        <CrudPage storeKey="hazards" itemName="Hazard" fields={fields} filterKey="status"
          newItem={() => ({ hazardId: nextId, status: "Open", review: "Pending review", reviewDate: today(), likelihood: "3", severity: "3", monitoring: "Daily" })}
          beforeSave={(r) => {
            const score = Number(r.likelihood) * Number(r.severity);
            return { ...r, score, level: riskLevel(score, settings) };
          }}
          extraColumns={[{ label: "Risk", render: (r) => <span className="whitespace-nowrap">{r.score} <Badge value={r.level} /></span> }]}
          formTop={(form, set) => (
            <div className="mb-4 rounded-md border border-dashed border-border p-3">
              <label className="label">Pick from hazard library (optional)</label>
              <select className="input" value="" onChange={(e) => {
                const h = LIBRARY.find((x) => x.description === e.target.value);
                if (h) set({ ...form, ...h });
              }}>
                <option value="">Select an example hazard…</option>
                {LIBRARY.map((h) => <option key={h.description}>{h.description}</option>)}
              </select>
              <p className="mt-2 text-xs text-muted-foreground">
                Current score: {Number(form.likelihood || 0) * Number(form.severity || 0)} ({riskLevel(Number(form.likelihood || 0) * Number(form.severity || 0), settings)})
              </p>
            </div>
          )} />
      )}

      {tab === "Control Measures" && (
        <SimpleTable heads={["Hazard", "Risk", "Control measures", "Review"]} rows={hazards.map((h) => [
          <>{h.hazardId} {h.description}<DemoTag show={h.demo} /></>, <Badge value={h.level} />, h.controls, <Badge value={h.review} />])} />
      )}

      {tab === "Monitoring Plan" && (
        <SimpleTable heads={["Hazard", "Location", "Frequency", "Next review", "Status"]} rows={hazards.map((h) => [
          `${h.hazardId} ${h.description}`, h.location, h.monitoring,
          <span className={h.status !== "Closed" && h.reviewDate < today() ? "text-destructive" : ""}>{h.reviewDate}{h.status !== "Closed" && h.reviewDate < today() && " (overdue)"}</span>,
          <Badge value={h.status} />])} />
      )}

      {tab === "Responsibility Matrix" && (
        <SimpleTable heads={["Responsible person", "Designation", "Hazards assigned", "Open"]} rows={
          [...new Set(hazards.map((h) => h.responsible))].map((name) => {
            const mine = hazards.filter((h) => h.responsible === name);
            return [name, employees.find((e) => e.name === name)?.designation ?? "—",
              mine.map((h) => h.hazardId).join(", "), mine.filter((h) => h.status === "Open").length];
          })} />
      )}
    </>
  );
}

function SimpleTable({ heads, rows }: { heads: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="card overflow-x-auto p-0">
      <table className="data-table">
        <thead><tr>{heads.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
      </table>
      {!rows.length && <Empty text="No hazards recorded yet." />}
    </div>
  );
}
