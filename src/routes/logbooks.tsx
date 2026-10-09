import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CrudPage, type Field } from "@/components/CrudPage";
import { Badge, PageHeader } from "@/components/ui-kit";
import { pageMeta } from "@/lib/meta";
import { today, useCollection, useSettings } from "@/lib/store";
import { SHIFTS } from "@/lib/types";

export const Route = createFileRoute("/logbooks")({
  head: () => pageMeta("Log Books", "Configurable statutory and non-statutory digital logbooks."),
  component: LogbooksPage,
});

function LogbooksPage() {
  const [settings] = useSettings();
  const { items: logs } = useCollection("logs");
  const { items: employees } = useCollection("employees");
  const cats = settings.logCategories;
  const [sel, setSel] = useState<string>("");
  const cat = cats.find((c) => c.id === sel) ?? cats[0];

  const fields: Field[] = cat ? [
    { key: "date", label: "Date", type: "date", required: true, inTable: true },
    { key: "shift", label: "Shift", type: "select", options: SHIFTS, required: true, inTable: true },
    { key: "recordedBy", label: "Recorded by", type: "select", options: employees.map((e) => e.name), required: true, inTable: true },
    ...cat.fields.map((f, i) => ({ key: f, label: f, inTable: i < 2 })),
    { key: "remarks", label: "Remarks", type: "textarea" as const },
  ] : [];

  return (
    <>
      <PageHeader title="Log Books" description="Forms are configurable in Settings. Verify statutory formats against applicable requirements." />
      <div className="mb-4 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c.id} onClick={() => setSel(c.id)} className={c.id === cat?.id ? "btn-primary" : "btn-outline"}>
            {c.name} <span className="opacity-70">({logs.filter((l) => l.book === c.id).length})</span>
          </button>
        ))}
        <Link to="/settings" className="btn-ghost">+ Configure logbooks</Link>
      </div>
      {cat ? (
        <>
          <div className="mb-3 text-sm text-muted-foreground"><Badge value={cat.type} /> {cat.name}</div>
          <CrudPage key={cat.id} storeKey="logs" itemName="Log entry" fields={fields}
            scope={(r) => r.book === cat.id} newItem={() => ({ book: cat.id, date: today() })} />
        </>
      ) : <p className="text-muted-foreground">No logbook categories. Add one in Settings.</p>}
    </>
  );
}
