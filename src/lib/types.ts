// Shared data types for SurakshaOps. All records carry an `id`.
// `demo: true` marks demonstration records so they can be told apart from real data.

export type Rec = { id: string; demo?: boolean; [key: string]: any };

export type Employee = Rec & {
  empId: string; name: string; designation: string; department: string;
  role: string; shift: string; status: "Active" | "Inactive";
};

export type Issue = { id: string; rootId: string; text: string; resolved: boolean };

export type Handover = Rec & {
  date: string; shift: string; department: string; outgoing: string; incoming: string;
  workCompleted: string; production: number; equipmentStatus: string; hazards: string;
  issues: Issue[]; instructions: string; status: "Draft" | "Submitted";
};

export type LogCategory = { id: string; name: string; type: "Statutory" | "Non-statutory"; fields: string[] };

export type Settings = {
  siteName: string;
  lowMax: number;     // score <= lowMax → Low
  mediumMax: number;  // score <= mediumMax → Medium
  highMax: number;    // score <= highMax → High, above → Critical
  logCategories: LogCategory[];
};

export const SHIFTS = ["A (06:00–14:00)", "B (14:00–22:00)", "C (22:00–06:00)"];
export const DEPARTMENTS = ["Mining", "Electrical", "Mechanical", "Ventilation", "Safety", "Survey"];
