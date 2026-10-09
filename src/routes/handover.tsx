import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, Pencil, Plus, Search, Trash2, CornerDownRight } from "lucide-react";
import { Badge, DemoTag, Empty, Modal, PageHeader } from "@/components/ui-kit";
import { pageMeta } from "@/lib/meta";
import { newId, today, useCollection } from "@/lib/store";
import { openIssues } from "@/lib/derive";
import { DEPARTMENTS, SHIFTS, type Handover } from "@/lib/types";

export const Route = createFileRoute("/handover")({
  head: () => pageMeta("Shift Handover", "Digital shift handover log replacing paper registers."),
  component: HandoverPage,
});

const REQUIRED: [keyof Handover, string][] = [
  ["date", "Date"], ["shift", "Shift"], ["department", "Department"], ["outgoing", "Outgoing supervisor"],
  ["incoming", "Incoming supervisor"], ["workCompleted", "Work completed"], ["equipmentStatus", "Equipment status"],
];

function currentShift() {
  const h = new Date().getHours();
  return h >= 6 && h < 14 ? SHIFTS[0] : h >= 14 && h < 22 ? SHIFTS[1] : SHIFTS[2];
}

function HandoverPage() {
  const { items, save, remove } = useCollection<Handover>("handovers");
  const { items: employees } = useCollection("employees");
  const [form, setForm] = useState<Handover | null>(null);
  const [view, setView] = useState<Handover | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [newIssue, setNewIssue] = useState("");

  const supervisors = employees.filter((e) => e.status === "Active").map((e) => e.name);
  const rows = useMemo(() => [...items].sort((a, b) => b.date.localeCompare(a.date))
    .filter((h) => (!status || h.status === status) && (!q || JSON.stringify(h).toLowerCase().includes(q.toLowerCase()))), [items, q, status]);

  const startNew = () => {
    const last = [...items].filter((h) => h.status === "Submitted").sort((a, b) => b.date.localeCompare(a.date))[0];
    setErrors([]);
    setForm({
      id: newId(), date: today(), shift: currentShift(), department: last?.department ?? "Mining",
      outgoing: last?.incoming ?? "", incoming: "", workCompleted: "", production: 0, equipmentStatus: "",
      hazards: "", issues: [], instructions: "", status: "Draft",
    });
  };

  const persist = (submit: boolean) => {
    if (!form) return;
    if (submit) {
      const missing = REQUIRED.filter(([k]) => !String(form[k] ?? "").trim()).map(([, l]) => l);
      if (form.outgoing && form.outgoing === form.incoming) missing.push("Incoming supervisor must differ from outgoing");
      if (Number(form.production) < 0) missing.push("Production cannot be negative");
      if (missing.length) return setErrors(missing);
      if (!confirm("Submit this handover? Submitted records are final but can still be corrected later.")) return;
    }
    save({ ...form, production: Number(form.production) || 0, status: submit ? "Submitted" : "Draft" });
    setForm(null);
  };

  const pending = form ? openIssues(items, form.id).filter(({ issue }) => !form.issues.some((i) => i.rootId === issue.rootId)) : [];
  const set = (k: keyof Handover, v: any) => form && setForm({ ...form, [k]: v });

  return (
    <>
      <PageHeader title="Shift Handover" description="Record work done, equipment, hazards and open issues for the next shift."
        actions={<button className="btn-primary" onClick={startNew}><Plus size={16} /> New handover</button>} />

      <div className="mb-3 flex flex-wrap gap-2">
        <div className="relative min-w-48 flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
          <input className="input pl-9" placeholder="Search handovers…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option><option>Draft</option><option>Submitted</option>
        </select>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="data-table">
          <thead><tr><th>Date</th><th>Shift</th><th>Department</th><th>Outgoing → Incoming</th><th>Production (t)</th><th>Open issues</th><th>Status</th><th /></tr></thead>
          <tbody>
            {rows.map((h) => (
              <tr key={h.id}>
                <td>{h.date}<DemoTag show={h.demo} /></td><td>{h.shift}</td><td>{h.department}</td>
                <td>{h.outgoing} → {h.incoming}</td><td>{h.production}</td>
                <td>{h.issues.filter((i) => !i.resolved).length}</td><td><Badge value={h.status} /></td>
                <td className="whitespace-nowrap text-right">
                  <button className="btn-ghost p-1.5" title="View" onClick={() => setView(h)}><Eye size={15} /></button>
                  <button className="btn-ghost p-1.5" title="Edit" onClick={() => { setErrors([]); setForm(structuredClone(h)); }}><Pencil size={15} /></button>
                  <button className="btn-danger p-1.5" title="Delete" onClick={() => confirm("Delete this handover?") && remove(h.id)}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <Empty text="No handovers found." />}
      </div>

      {view && (
        <Modal title={`Handover — ${view.date}, Shift ${view.shift}`} onClose={() => setView(null)} wide>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {([["Department", view.department], ["Status", view.status], ["Outgoing", view.outgoing], ["Incoming", view.incoming],
              ["Production", `${view.production} t`], ["Equipment status", view.equipmentStatus], ["Work completed", view.workCompleted],
              ["Hazards & safety concerns", view.hazards || "—"], ["Instructions for next shift", view.instructions || "—"]] as const).map(([k, v]) => (
              <div key={k}><dt className="label">{k}</dt><dd className="whitespace-pre-wrap">{v}</dd></div>
            ))}
            <div className="sm:col-span-2"><dt className="label">Issues</dt>
              {view.issues.length ? view.issues.map((i) => <dd key={i.id}>{i.resolved ? "✓ " : "• "}{i.text} {i.rootId !== i.id && <span className="badge-muted">carried forward</span>}</dd>) : <dd>None</dd>}
            </div>
          </dl>
        </Modal>
      )}

      {form && (
        <Modal title={items.some((h) => h.id === form.id) ? "Edit handover" : "New handover"} onClose={() => setForm(null)} wide>
          <div className="grid gap-3 sm:grid-cols-3">
            <Fld label="Date *"><input type="date" className="input" value={form.date} onChange={(e) => set("date", e.target.value)} /></Fld>
            <Fld label="Shift *"><select className="input" value={form.shift} onChange={(e) => set("shift", e.target.value)}>{SHIFTS.map((s) => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Department *"><select className="input" value={form.department} onChange={(e) => set("department", e.target.value)}>{DEPARTMENTS.map((s) => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Outgoing supervisor *"><select className="input" value={form.outgoing} onChange={(e) => set("outgoing", e.target.value)}><option value="">Select…</option>{supervisors.map((s) => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Incoming supervisor *"><select className="input" value={form.incoming} onChange={(e) => set("incoming", e.target.value)}><option value="">Select…</option>{supervisors.map((s) => <option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Production (tonnes)"><input type="number" min={0} className="input" value={form.production} onChange={(e) => set("production", e.target.value)} /></Fld>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Fld label="Work completed *"><textarea className="input min-h-20" value={form.workCompleted} onChange={(e) => set("workCompleted", e.target.value)} /></Fld>
            <Fld label="Equipment status *"><textarea className="input min-h-20" value={form.equipmentStatus} onChange={(e) => set("equipmentStatus", e.target.value)} /></Fld>
            <Fld label="Hazards & safety concerns"><textarea className="input min-h-20" value={form.hazards} onChange={(e) => set("hazards", e.target.value)} /></Fld>
            <Fld label="Instructions for next shift"><textarea className="input min-h-20" value={form.instructions} onChange={(e) => set("instructions", e.target.value)} /></Fld>
          </div>

          <div className="mt-4">
            <div className="label">Unresolved issues</div>
            {pending.length > 0 && (
              <div className="mb-3 rounded-md border border-warning/40 bg-warning/10 p-3">
                <div className="mb-2 text-sm font-medium text-warning">Open issues from previous shifts</div>
                {pending.map(({ issue, h }) => (
                  <div key={issue.rootId} className="flex items-center justify-between gap-2 py-1 text-sm">
                    <span>{issue.text} <span className="text-xs text-muted-foreground">({h.date}, {h.shift.split(" ")[0]})</span></span>
                    <button className="btn-outline px-2 py-1 text-xs" onClick={() => confirm(`Carry forward "${issue.text}" to this shift?`) &&
                      set("issues", [...form.issues, { id: newId(), rootId: issue.rootId, text: issue.text, resolved: false }])}>
                      <CornerDownRight size={14} /> Carry forward
                    </button>
                  </div>
                ))}
              </div>
            )}
            {form.issues.map((i) => (
              <div key={i.id} className="flex items-center gap-2 py-1 text-sm">
                <input type="checkbox" checked={i.resolved} onChange={(e) => set("issues", form.issues.map((x) => x.id === i.id ? { ...x, resolved: e.target.checked } : x))} />
                <span className={i.resolved ? "text-muted-foreground line-through" : ""}>{i.text}</span>
                {i.rootId !== i.id && <span className="badge-muted">carried</span>}
                <button className="btn-danger ml-auto p-1" onClick={() => set("issues", form.issues.filter((x) => x.id !== i.id))}><Trash2 size={14} /></button>
              </div>
            ))}
            <div className="mt-2 flex gap-2">
              <input className="input" placeholder="Add a new unresolved issue…" value={newIssue} onChange={(e) => setNewIssue(e.target.value)} />
              <button className="btn-outline" onClick={() => { if (!newIssue.trim()) return; const id = newId();
                set("issues", [...form.issues, { id, rootId: id, text: newIssue.trim(), resolved: false }]); setNewIssue(""); }}>Add</button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Tick an issue to mark it resolved in this shift.</p>
          </div>

          {errors.length > 0 && <p className="mt-3 text-sm text-destructive">Please fix: {errors.join(", ")}</p>}
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button className="btn-outline" onClick={() => setForm(null)}>Cancel</button>
            <button className="btn-outline" onClick={() => persist(false)}>Save draft</button>
            <button className="btn-primary" onClick={() => persist(true)}>Submit handover</button>
          </div>
        </Modal>
      )}
    </>
  );
}

const Fld = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div><label className="label">{label}</label>{children}</div>
);
