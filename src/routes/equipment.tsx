import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, type Field } from "@/components/CrudPage";
import { PageHeader } from "@/components/ui-kit";
import { pageMeta } from "@/lib/meta";
import { today } from "@/lib/store";

export const Route = createFileRoute("/equipment")({
  head: () => pageMeta("Equipment", "Equipment register with inspection and maintenance tracking."),
  component: EquipmentPage,
});

const fields: Field[] = [
  { key: "eqId", label: "Equipment ID", required: true, inTable: true },
  { key: "name", label: "Name", required: true, inTable: true },
  { key: "category", label: "Category", type: "select", options: ["Cutting", "Haulage", "Ventilation", "Dewatering", "Electrical", "Loading", "Other"], required: true, inTable: true },
  { key: "location", label: "Location", required: true, inTable: true },
  { key: "status", label: "Operational status", type: "select", options: ["Operational", "Under Maintenance", "Breakdown"], required: true, inTable: true, badge: true },
  { key: "lastInspection", label: "Last inspection", type: "date", inTable: true },
  { key: "nextMaintenance", label: "Next maintenance", type: "date", required: true },
  { key: "notes", label: "Notes", type: "textarea" },
];

function EquipmentPage() {
  return (
    <>
      <PageHeader title="Equipment" description="Overdue maintenance automatically appears as a pending action on the dashboard." />
      <CrudPage storeKey="equipment" itemName="Equipment" fields={fields} filterKey="status"
        newItem={() => ({ status: "Operational", lastInspection: today() })}
        extraColumns={[{ label: "Next maintenance", render: (r) => (
          <span className={r.nextMaintenance && r.nextMaintenance < today() ? "font-medium text-destructive" : ""}>
            {r.nextMaintenance}{r.nextMaintenance && r.nextMaintenance < today() && " (overdue)"}
          </span>) }]} />
    </>
  );
}
