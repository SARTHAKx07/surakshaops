import { createFileRoute } from "@tanstack/react-router";
import { Network } from "lucide-react";
import { PageHeader } from "@/components/ui-kit";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/erp")({
  head: () => pageMeta("ERP Integration", "Planned ERP integration for SurakshaOps — not yet configured."),
  component: ErpPage,
});

function ErpPage() {
  return (
    <>
      <PageHeader title="ERP Integration" description="Planned for a future version." />
      <div className="card max-w-2xl space-y-3 text-sm">
        <div className="flex items-center gap-2"><Network className="text-primary" /><span className="badge-muted">Not configured</span></div>
        <p>No ERP system is connected. SurakshaOps does not send or receive data from any external system.</p>
        <p>The app keeps its data logic separate from the screens, so a future version could exchange records such as:</p>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Shift production figures → production / sales planning modules</li>
          <li>Equipment maintenance due dates → plant maintenance modules</li>
          <li>Employee directory ← HR master data</li>
          <li>Incidents and corrective actions → EHS modules</li>
        </ul>
        <p className="text-muted-foreground">Integration would require a proper backend, user authentication and approval from the organisation's IT team.</p>
      </div>
    </>
  );
}
