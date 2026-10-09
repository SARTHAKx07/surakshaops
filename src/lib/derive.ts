// Calculations derived from saved records (no hardcoded statistics).
import type { Handover, Issue, Rec, Settings } from "./types";
import { today } from "./store";

export function riskLevel(score: number, s: Settings) {
  if (score <= s.lowMax) return "Low";
  if (score <= s.mediumMax) return "Medium";
  if (score <= s.highMax) return "High";
  return "Critical";
}

/** Latest state of every issue chain that is still unresolved. */
export function openIssues(handovers: Handover[], excludeHandoverId?: string) {
  const latest = new Map<string, { issue: Issue; h: Handover }>();
  [...handovers]
    .filter((h) => h.status === "Submitted" && h.id !== excludeHandoverId)
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((h) => (h.issues || []).forEach((i) => latest.set(i.rootId, { issue: i, h })));
  return [...latest.values()].filter((x) => !x.issue.resolved);
}

export function productionByDay(handovers: Handover[], days = 7) {
  const out: { date: string; total: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const total = handovers.filter((h) => h.status === "Submitted" && h.date === date)
      .reduce((s, h) => s + (Number(h.production) || 0), 0);
    out.push({ date, total });
  }
  return out;
}

export type Pending = { kind: string; text: string; due?: string; to: "/smp" | "/incidents" | "/equipment" | "/handover" };

export function pendingActions(p: { hazards: Rec[]; incidents: Rec[]; equipment: Rec[]; handovers: Handover[] }): Pending[] {
  const t = today();
  const list: Pending[] = [];
  p.hazards.forEach((h) => {
    if (h.status !== "Closed" && h.reviewDate && h.reviewDate < t) list.push({ kind: "Hazard review overdue", text: `${h.hazardId} ${h.description}`, due: h.reviewDate, to: "/smp" });
    if (h.review === "Pending review") list.push({ kind: "Risk assessment needs review", text: `${h.hazardId} ${h.description}`, to: "/smp" });
  });
  p.incidents.forEach((i) => {
    if (i.status !== "Closed" && i.correctiveDue && i.correctiveDue < t) list.push({ kind: "Corrective action overdue", text: i.description, due: i.correctiveDue, to: "/incidents" });
  });
  p.equipment.forEach((e) => {
    if (e.nextMaintenance && e.nextMaintenance < t) list.push({ kind: "Maintenance overdue", text: `${e.eqId} ${e.name}`, due: e.nextMaintenance, to: "/equipment" });
  });
  openIssues(p.handovers).forEach(({ issue, h }) => list.push({ kind: "Unresolved handover issue", text: issue.text, due: h.date, to: "/handover" }));
  return list;
}

export const inRange = (date: string, from: string, to: string) => (!from || date >= from) && (!to || date <= to);
