import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, type Field } from "@/components/CrudPage";
import { PageHeader } from "@/components/ui-kit";
import { pageMeta } from "@/lib/meta";
import { today, useCollection } from "@/lib/store";

export const Route = createFileRoute("/incidents")({
  head: () => pageMeta("Incident Reporting", "Report, investigate and track mine safety incidents and corrective actions."),
  component: IncidentsPage,
});

function IncidentsPage() {
  const { items: employees } = useCollection("employees");
  const names = employees.filter((e) => e.status === "Active").map((e) => e.name);
  const fields: Field[] = [
    { key: "date", label: "Incident date", type: "date", required: true, inTable: true },
    { key: "location", label: "Location", required: true, inTable: true },
    { key: "category", label: "Category", type: "select", options: ["Near Miss", "Injury", "Roof Fall", "Gas", "Fire", "Equipment Failure", "Electrical", "Other"], required: true, inTable: true },
    { key: "severity", label: "Severity", type: "select", options: ["Minor", "Moderate", "Major", "Fatal"], required: true, inTable: true, badge: true },
    { key: "description", label: "Description", type: "textarea", required: true },
    { key: "immediateAction", label: "Immediate action taken", type: "textarea" },
    { key: "responsible", label: "Responsible person", type: "select", options: names, required: true, inTable: true },
    { key: "investigation", label: "Investigation notes", type: "textarea" },
    { key: "corrective", label: "Corrective actions", type: "textarea" },
    { key: "correctiveDue", label: "Corrective action due date", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["Open", "Under Investigation", "Closed"], required: true, inTable: true, badge: true },
  ];
  return (
    <>
      <PageHeader title="Incident Reporting" description="Incidents are only closed after you confirm it." />
      <CrudPage storeKey="incidents" itemName="Incident" fields={fields} filterKey="status"
        newItem={() => ({ date: today(), status: "Open" })}
        beforeSave={(r, prev) => {
          if (r.status === "Closed" && prev?.status !== "Closed" &&
            !confirm("Confirm this incident is resolved and corrective actions are complete?")) return null;
          return r;
        }} />
    </>
  );
}
