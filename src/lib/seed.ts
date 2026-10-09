// Demonstration data. Every record is flagged `demo: true`.
// These are illustrative examples only — not real readings or incidents.
import type { Settings } from "./types";

export const daysFromToday = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export const defaultSettings: Settings = {
  siteName: "Demo Colliery – Section 1",
  lowMax: 4,
  mediumMax: 9,
  highMax: 15,
  logCategories: [
    { id: "lc1", name: "Ventilation Log", type: "Statutory", fields: ["Location", "Air quantity (m³/min)", "CH₄ reading (%)"] },
    { id: "lc2", name: "Shot Firing Register", type: "Statutory", fields: ["Location", "Holes charged", "Explosive used (kg)"] },
    { id: "lc3", name: "Daily Inspection Report", type: "Statutory", fields: ["District", "Conditions observed"] },
    { id: "lc4", name: "Maintenance Log", type: "Non-statutory", fields: ["Equipment", "Work done"] },
  ],
};

export function buildSeed(): Record<string, unknown> {
  const d = true;
  return {
    settings: defaultSettings,
    employees: [
      { id: "e1", demo: d, empId: "EMP-001", name: "Rajesh Kumar", designation: "Mine Manager", department: "Mining", role: "Manager", shift: "General", status: "Active" },
      { id: "e2", demo: d, empId: "EMP-002", name: "Anil Mahato", designation: "Overman", department: "Mining", role: "Supervisor", shift: "A (06:00–14:00)", status: "Active" },
      { id: "e3", demo: d, empId: "EMP-003", name: "Suresh Oraon", designation: "Mining Sirdar", department: "Mining", role: "Supervisor", shift: "B (14:00–22:00)", status: "Active" },
      { id: "e4", demo: d, empId: "EMP-004", name: "Priya Singh", designation: "Safety Officer", department: "Safety", role: "Safety Officer", shift: "General", status: "Active" },
      { id: "e5", demo: d, empId: "EMP-005", name: "Manoj Das", designation: "Electrical Foreman", department: "Electrical", role: "Supervisor", shift: "C (22:00–06:00)", status: "Active" },
      { id: "e6", demo: d, empId: "EMP-006", name: "Vikram Yadav", designation: "Ventilation Officer", department: "Ventilation", role: "Officer", shift: "General", status: "Active" },
    ],
    equipment: [
      { id: "q1", demo: d, eqId: "EQ-101", name: "Continuous Miner CM-1", category: "Cutting", location: "Panel P-3", status: "Operational", lastInspection: daysFromToday(-20), nextMaintenance: daysFromToday(10), notes: "" },
      { id: "q2", demo: d, eqId: "EQ-102", name: "Belt Conveyor BC-2", category: "Haulage", location: "Main Trunk", status: "Under Maintenance", lastInspection: daysFromToday(-40), nextMaintenance: daysFromToday(-3), notes: "Idler replacement" },
      { id: "q3", demo: d, eqId: "EQ-103", name: "Main Mine Fan", category: "Ventilation", location: "Fan House", status: "Operational", lastInspection: daysFromToday(-7), nextMaintenance: daysFromToday(23), notes: "" },
      { id: "q4", demo: d, eqId: "EQ-104", name: "Pump Set PS-4", category: "Dewatering", location: "Sump 2", status: "Breakdown", lastInspection: daysFromToday(-60), nextMaintenance: daysFromToday(-15), notes: "Motor fault" },
    ],
    hazards: [
      { id: "h1", demo: d, hazardId: "HZ-001", description: "Roof instability at junctions", category: "Strata", location: "Panel P-3", likelihood: "3", severity: "5", score: 15, level: "High", controls: "Roof bolting, regular roof testing, support plan adherence", responsible: "Anil Mahato", monitoring: "Every shift", reviewDate: daysFromToday(5), status: "Open", review: "Pending review" },
      { id: "h2", demo: d, hazardId: "HZ-002", description: "Methane accumulation in return airway", category: "Gas", location: "Return R-2", likelihood: "2", severity: "5", score: 10, level: "High", controls: "Continuous gas monitoring, flameproof equipment", responsible: "Vikram Yadav", monitoring: "Continuous", reviewDate: daysFromToday(-2), status: "Open", review: "Reviewed" },
      { id: "h3", demo: d, hazardId: "HZ-003", description: "Dust exposure at transfer point", category: "Health", location: "Transfer Pt. T-1", likelihood: "3", severity: "2", score: 6, level: "Medium", controls: "Water sprays, PPE (respirators)", responsible: "Priya Singh", monitoring: "Weekly", reviewDate: daysFromToday(14), status: "Controlled", review: "Reviewed" },
    ],
    incidents: [
      { id: "i1", demo: d, date: daysFromToday(-4), location: "Panel P-3", category: "Near Miss", description: "Small roof fall near face; no injuries.", severity: "Moderate", immediateAction: "Area cordoned, additional supports installed", responsible: "Anil Mahato", investigation: "", corrective: "Review support plan", correctiveDue: daysFromToday(-1), status: "Open" },
      { id: "i2", demo: d, date: daysFromToday(-10), location: "Workshop", category: "Equipment Failure", description: "Pump motor tripped.", severity: "Minor", immediateAction: "Standby pump started", responsible: "Manoj Das", investigation: "Winding insulation failure", corrective: "Rewind motor", correctiveDue: daysFromToday(7), status: "Under Investigation" },
    ],
    handovers: [
      { id: "s1", demo: d, date: daysFromToday(-2), shift: "A (06:00–14:00)", department: "Mining", outgoing: "Anil Mahato", incoming: "Suresh Oraon", workCompleted: "Cutting at face P-3, 2 cuts", production: 420, equipmentStatus: "CM-1 operational", hazards: "Minor roof weakness at junction 4", issues: [{ id: "is1", rootId: "is1", text: "Belt conveyor idlers noisy", resolved: false }], instructions: "Check roof at junction 4", status: "Submitted" },
      { id: "s2", demo: d, date: daysFromToday(-1), shift: "B (14:00–22:00)", department: "Mining", outgoing: "Suresh Oraon", incoming: "Manoj Das", workCompleted: "Roof bolting completed, 1 cut", production: 310, equipmentStatus: "BC-2 under maintenance", hazards: "None new", issues: [{ id: "is2", rootId: "is2", text: "Pump PS-4 not starting", resolved: false }], instructions: "Arrange electrician for PS-4", status: "Submitted" },
    ],
    logs: [
      { id: "l1", demo: d, book: "lc1", date: daysFromToday(-1), shift: "A (06:00–14:00)", recordedBy: "Vikram Yadav", "Location": "Return R-2", "Air quantity (m³/min)": "1450", "CH₄ reading (%)": "0.3", remarks: "Demo entry" },
    ],
  };
}
