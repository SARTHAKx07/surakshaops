// Generic "table + add/edit form" used by most modules.
// Describe the fields once; the component handles search, filter, validation,
// create, edit (no duplicates) and delete (with confirmation).
import { useMemo, useState, type ReactNode } from "react";
import { Pencil, Plus, Search, Trash2, Eye } from "lucide-react";
import { newId, useCollection } from "@/lib/store";
import type { Rec } from "@/lib/types";
import { Badge, DemoTag, Empty, Modal } from "./ui-kit";

export type Field = {
  key: string; label: string;
  type?: "text" | "textarea" | "select" | "date" | "number";
  options?: string[]; required?: boolean; inTable?: boolean; badge?: boolean; full?: boolean;
};

type Props = {
  storeKey: string;
  itemName: string;
  fields: Field[];
  newItem: () => Record<string, any>;
  scope?: (r: Rec) => boolean;
  filterKey?: string;
  beforeSave?: (r: Rec, prev?: Rec) => Rec | null;
  formTop?: (form: Rec, set: (r: Rec) => void) => ReactNode;
  extraColumns?: { label: string; render: (r: Rec) => ReactNode }[];
};

export function CrudPage({ storeKey, itemName, fields, newItem, scope, filterKey, beforeSave, formTop, extraColumns = [] }: Props) {
  const { items, save, remove } = useCollection(storeKey);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState<Rec | null>(null);
  const [viewing, setViewing] = useState<Rec | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const filterField = fields.find((f) => f.key === filterKey);
  const tableFields = fields.filter((f) => f.inTable);

  const rows = useMemo(() => items.filter((r) => (!scope || scope(r)) &&
    (!filter || r[filterKey!] === filter) &&
    (!q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase()))), [items, scope, filter, filterKey, q]);

  const submit = () => {
    if (!form) return;
    const missing = fields.filter((f) => f.required && !String(form[f.key] ?? "").trim()).map((f) => f.label);
    if (missing.length) return setErrors(missing);
    const prev = items.find((r) => r.id === form.id);
    const final = beforeSave ? beforeSave(form, prev) : form;
    if (!final) return;
    save(final);
    setForm(null);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <div className="relative min-w-48 flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
          <input className="input pl-9" placeholder={`Search ${itemName.toLowerCase()}s…`} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {filterField && (
          <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All {filterField.label.toLowerCase()}</option>
            {filterField.options?.map((o) => <option key={o}>{o}</option>)}
          </select>
        )}
        <button className="btn-primary" onClick={() => { setErrors([]); setForm({ ...newItem(), id: newId() } as Rec); }}>
          <Plus size={16} /> Add {itemName}
        </button>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="data-table">
          <thead><tr>{tableFields.map((f) => <th key={f.key}>{f.label}</th>)}{extraColumns.map((c) => <th key={c.label}>{c.label}</th>)}<th className="w-28" /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                {tableFields.map((f, i) => (
                  <td key={f.key}>{f.badge ? <Badge value={r[f.key]} /> : String(r[f.key] ?? "")}{i === 0 && <DemoTag show={r.demo} />}</td>
                ))}
                {extraColumns.map((c) => <td key={c.label}>{c.render(r)}</td>)}
                <td className="whitespace-nowrap text-right">
                  <button className="btn-ghost p-1.5" title="View" onClick={() => setViewing(r)}><Eye size={15} /></button>
                  <button className="btn-ghost p-1.5" title="Edit" onClick={() => { setErrors([]); setForm({ ...r }); }}><Pencil size={15} /></button>
                  <button className="btn-danger p-1.5" title="Delete" onClick={() => confirm(`Delete this ${itemName.toLowerCase()}? This cannot be undone.`) && remove(r.id)}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <Empty text={`No ${itemName.toLowerCase()} records found.`} />}
      </div>

      {viewing && (
        <Modal title={`${itemName} details`} onClose={() => setViewing(null)}>
          <dl className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                <dt className="label">{f.label}</dt>
                <dd className="whitespace-pre-wrap text-sm">{String(viewing[f.key] ?? "") || "—"}</dd>
              </div>
            ))}
            {extraColumns.map((c) => <div key={c.label}><dt className="label">{c.label}</dt><dd>{c.render(viewing)}</dd></div>)}
          </dl>
        </Modal>
      )}

      {form && (
        <Modal title={`${items.some((r) => r.id === form.id) ? "Edit" : "New"} ${itemName}`} onClose={() => setForm(null)} wide>
          {formTop?.(form, setForm)}
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.key} className={f.type === "textarea" || f.full ? "sm:col-span-2" : ""}>
                <label className="label">{f.label}{f.required && <span className="text-primary"> *</span>}</label>
                <FieldInput f={f} value={form[f.key] ?? ""} onChange={(v) => setForm({ ...form, [f.key]: v })} />
              </div>
            ))}
          </div>
          {errors.length > 0 && <p className="mt-3 text-sm text-destructive">Please fill in: {errors.join(", ")}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <button className="btn-outline" onClick={() => setForm(null)}>Cancel</button>
            <button className="btn-primary" onClick={submit}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function FieldInput({ f, value, onChange }: { f: Field; value: any; onChange: (v: any) => void }) {
  if (f.type === "textarea") return <textarea className="input min-h-20" value={value} onChange={(e) => onChange(e.target.value)} />;
  if (f.type === "select") return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select…</option>
      {f.options?.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
  return <input className="input" type={f.type ?? "text"} value={value} onChange={(e) => onChange(f.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)} />;
}
