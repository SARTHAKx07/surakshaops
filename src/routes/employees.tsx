import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, type Field } from "@/components/CrudPage";
import { PageHeader } from "@/components/ui-kit";
import { pageMeta } from "@/lib/meta";
import { DEPARTMENTS, SHIFTS } from "@/lib/types";

export const Route = createFileRoute("/employees")({
  head: () => pageMeta("Employees", "Employee directory reused across handovers and safety responsibilities."),
  component: EmployeesPage,
});

const fields: Field[] = [
  { key: "empId", label: "Employee ID", required: true, inTable: true },
  { key: "name", label: "Name", required: true, inTable: true },
  { key: "designation", label: "Designation", required: true, inTable: true },
  { key: "department", label: "Department", type: "select", options: DEPARTMENTS, required: true, inTable: true },
  { key: "role", label: "Role", type: "select", options: ["Manager", "Supervisor", "Safety Officer", "Officer", "Operator", "Worker"], required: true },
  { key: "shift", label: "Assigned shift", type: "select", options: [...SHIFTS, "General"], inTable: true },
  { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"], required: true, inTable: true, badge: true },
];

function EmployeesPage() {
  return (
    <>
      <PageHeader title="Employees" description="Directory used to fill supervisors and responsible persons automatically." />
      <CrudPage storeKey="employees" itemName="Employee" fields={fields} filterKey="status"
        newItem={() => ({ status: "Active", department: "Mining", shift: "General" })} />
    </>
  );
}
