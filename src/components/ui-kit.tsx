// Small reusable UI pieces used across pages.
import type { ReactNode } from "react";
import { X } from "lucide-react";

const tone: Record<string, string> = {
  Active: "badge-success", Operational: "badge-success", Submitted: "badge-success", Closed: "badge-success",
  Controlled: "badge-success", Reviewed: "badge-success", Low: "badge-success", Minor: "badge-info",
  Draft: "badge-muted", Inactive: "badge-muted", Medium: "badge-warning", Moderate: "badge-warning",
  "Under Maintenance": "badge-warning", "Under Investigation": "badge-warning", "Pending review": "badge-warning",
  Open: "badge-danger", High: "badge-danger", Critical: "badge-danger", Major: "badge-danger",
  Fatal: "badge-danger", Breakdown: "badge-danger", Statutory: "badge-primary",
};

export function Badge({ value }: { value?: string }) {
  if (!value) return null;
  return <span className={tone[value] ?? "badge-info"}>{value}</span>;
}

export const DemoTag = ({ show }: { show?: boolean }) => (show ? <span className="badge-muted ml-1">Demo</span> : null);

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex flex-wrap gap-2">{actions}</div>
    </div>
  );
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm">
      <div className={`card my-8 w-full ${wide ? "max-w-3xl" : "max-w-xl"} p-0`}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="btn-ghost p-1" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export function Stat({ label, value, sub, icon }: { label: string; value: ReactNode; sub?: string; icon?: ReactNode }) {
  return (
    <div className="card flex items-start justify-between">
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-1 font-display text-3xl font-semibold">{value}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
      <div className="text-primary">{icon}</div>
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return <div className="py-8 text-center text-sm text-muted-foreground">{text}</div>;
}
