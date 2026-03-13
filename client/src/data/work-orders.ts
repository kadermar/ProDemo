// ── Work Order Data ────────────────────────────────────────────────────────────
// Shared data file for all pre-award pipeline work orders.
// Used by stage-activity and work-order-detail pages.

export type StatusColor = "ok" | "warn" | "risk";

export interface WorkOrderRecord {
  id: string;
  contractor: string;
  city: string;
  product: string;
  analyst: string;
  submitted: string;
  age: string;
  revision: string;
  status: string;
  statusColor: StatusColor;
  currentStage: string;
}

export interface ContractorTeam {
  salesRep: { name: string; email: string };
  contractorContact: { name: string; email: string };
}

export interface ActivityMessage {
  author: string;
  role: string;
  time: string;
  text: string;
  type?: "system" | "user";
}

export interface WorkOrderDetail extends WorkOrderRecord {
  team: ContractorTeam;
  activity: ActivityMessage[];
}

// ── Pipeline stage order ────────────────────────────────────────────────────────

export const STAGE_ORDER = [
  "proposal",
  "assembly",
  "submittal",
  "quote",
  "noa",
  "inspection",
] as const;

export type StageKey = typeof STAGE_ORDER[number];

export const STAGE_LABELS: Record<string, string> = {
  proposal: "Proposal",
  assembly: "Assembly Letter",
  submittal: "Submittal",
  quote: "Quote",
  noa: "NOA / Warranty",
  inspection: "Inspection",
};

// ── Contractor team data ────────────────────────────────────────────────────────

const CONTRACTOR_TEAMS: Record<string, ContractorTeam> = {
  "Apex Roofing LLC": {
    salesRep: { name: "D. Mercer", email: "d.mercer@apex.com" },
    contractorContact: { name: "Tom Hicks", email: "thicks@apex.com" },
  },
  "Summit Commercial": {
    salesRep: { name: "L. Park", email: "l.park@carlisle.com" },
    contractorContact: { name: "Amy Lin", email: "alin@summit.com" },
  },
  "Trident Contractors": {
    salesRep: { name: "R. Okafor", email: "r.okafor@carlisle.com" },
    contractorContact: { name: "Ben Cruz", email: "b.cruz@trident.com" },
  },
  "Keystone Roofing": {
    salesRep: { name: "L. Park", email: "l.park@carlisle.com" },
    contractorContact: { name: "Mike Stone", email: "m.stone@keystone.com" },
  },
  "Horizon Commercial": {
    salesRep: { name: "R. Okafor", email: "r.okafor@carlisle.com" },
    contractorContact: { name: "Julia West", email: "j.west@horizon.com" },
  },
  "Atlas Roofing Co.": {
    salesRep: { name: "D. Mercer", email: "d.mercer@carlisle.com" },
    contractorContact: { name: "Sam Torres", email: "s.torres@atlas.com" },
  },
  "Meridian Systems": {
    salesRep: { name: "K. Young", email: "k.young@carlisle.com" },
    contractorContact: { name: "Paul Reed", email: "p.reed@meridian.com" },
  },
  "Crown Commercial": {
    salesRep: { name: "D. Mercer", email: "d.mercer@carlisle.com" },
    contractorContact: { name: "Grace Kim", email: "g.kim@crown.com" },
  },
};

// ── Activity log builder ────────────────────────────────────────────────────────

function buildActivity(wo: WorkOrderRecord): ActivityMessage[] {
  const isOverdue = wo.statusColor === "risk";
  const hasRevision = wo.revision !== "None" && wo.revision !== "Flagged";
  const isFlagged = wo.revision === "Flagged";

  const base: ActivityMessage[] = [
    {
      author: wo.analyst,
      role: "Design Analyst",
      time: `${wo.submitted}, 9:14 AM`,
      text: `Work order ${wo.id} submitted for ${wo.contractor}. Product: ${wo.product}. Stage: ${STAGE_LABELS[wo.currentStage]}.`,
      type: "user",
    },
    {
      author: wo.analyst,
      role: "Design Analyst",
      time: `${wo.submitted}, 2:30 PM`,
      text: `Initial review complete. ${wo.product} spec confirmed against current product library. No technical holds at intake.`,
      type: "user",
    },
  ];

  if (hasRevision) {
    base.push({
      author: "System",
      role: "Automated Alert",
      time: `${wo.submitted}, 4:00 PM`,
      text: `Revision cycle triggered: ${wo.revision}. Review requested before stage advancement.`,
      type: "system",
    });
  }

  if (isFlagged) {
    base.push({
      author: "System",
      role: "Automated Alert",
      time: `${wo.submitted}, 3:45 PM`,
      text: `Work order flagged for manual review. Escalation sent to stage lead.`,
      type: "system",
    });
  }

  if (isOverdue) {
    base.push({
      author: "System",
      role: "SLA Monitor",
      time: "Mar 12, 8:00 AM",
      text: `SLA breach detected for ${wo.id}. Current age: ${wo.age}. Immediate action required to prevent downstream cascade.`,
      type: "system",
    });
  }

  if (!isOverdue && !hasRevision && !isFlagged) {
    base.push({
      author: wo.analyst,
      role: "Design Analyst",
      time: "Mar 11, 10:00 AM",
      text: `Status update: ${wo.status}. No issues identified. On track for stage completion within SLA.`,
      type: "user",
    });
  }

  return base;
}

// ── Raw work order records ──────────────────────────────────────────────────────

const RAW_WORK_ORDERS: WorkOrderRecord[] = [
  // Proposal stage
  { id: "PR-1104", contractor: "Apex Roofing LLC",    city: "Atlanta",      product: "EPDM",     analyst: "K. Torres", submitted: "Mar 10", age: "1d",   revision: "None",         status: "On Track",  statusColor: "ok",   currentStage: "proposal" },
  { id: "PR-1108", contractor: "Summit Commercial",   city: "New York",     product: "TPO 80mil", analyst: "J. Kim",    submitted: "Mar 10", age: "1d",   revision: "None",         status: "On Track",  statusColor: "ok",   currentStage: "proposal" },
  { id: "PR-1095", contractor: "Trident Contractors", city: "Chicago",      product: "PVC 60mil", analyst: "K. Torres", submitted: "Mar 9",  age: "2d",   revision: "None",         status: "On Track",  statusColor: "ok",   currentStage: "proposal" },
  { id: "PR-1088", contractor: "Keystone Roofing",   city: "New York",     product: "EPDM",     analyst: "J. Kim",    submitted: "Mar 8",  age: "3d",   revision: "None",         status: "In Review", statusColor: "warn", currentStage: "proposal" },
  { id: "PR-1074", contractor: "Horizon Commercial", city: "Dallas",       product: "TPO 60mil", analyst: "K. Torres", submitted: "Mar 7",  age: "4d",   revision: "None",         status: "In Review", statusColor: "warn", currentStage: "proposal" },
  { id: "PR-1061", contractor: "Atlas Roofing Co.",  city: "Los Angeles",  product: "PVC 50mil", analyst: "J. Kim",    submitted: "Mar 6",  age: "5d",   revision: "None",         status: "Overdue",   statusColor: "risk", currentStage: "proposal" },

  // Assembly Letter stage
  { id: "AL-2847", contractor: "Apex Roofing LLC",    city: "Atlanta",      product: "EPDM",     analyst: "J. Hoffman", submitted: "Mar 3",  age: "8d",   revision: "2nd revision", status: "Overdue",   statusColor: "risk", currentStage: "assembly" },
  { id: "AL-2851", contractor: "Summit Commercial",   city: "New York",     product: "EPDM",     analyst: "S. Patel",   submitted: "Mar 4",  age: "7d",   revision: "1st revision", status: "Overdue",   statusColor: "risk", currentStage: "assembly" },
  { id: "AL-2863", contractor: "Trident Contractors", city: "Chicago",      product: "TPO 80mil", analyst: "J. Hoffman", submitted: "Mar 5",  age: "6d",   revision: "None",         status: "Overdue",   statusColor: "risk", currentStage: "assembly" },
  { id: "AL-2871", contractor: "Keystone Roofing",   city: "New York",     product: "PVC 60mil", analyst: "T. Nguyen",  submitted: "Mar 7",  age: "4d",   revision: "None",         status: "In Review", statusColor: "warn", currentStage: "assembly" },
  { id: "AL-2879", contractor: "Horizon Commercial", city: "Dallas",       product: "EPDM",     analyst: "S. Patel",   submitted: "Mar 8",  age: "3d",   revision: "1st revision", status: "Pending",   statusColor: "warn", currentStage: "assembly" },
  { id: "AL-2882", contractor: "Atlas Roofing Co.",  city: "Los Angeles",  product: "TPO 60mil", analyst: "T. Nguyen",  submitted: "Mar 9",  age: "2d",   revision: "None",         status: "On Track",  statusColor: "ok",   currentStage: "assembly" },
  { id: "AL-2885", contractor: "Meridian Systems",   city: "Chicago",      product: "PVC 50mil", analyst: "J. Hoffman", submitted: "Mar 10", age: "1d",   revision: "None",         status: "On Track",  statusColor: "ok",   currentStage: "assembly" },
  { id: "AL-2888", contractor: "Crown Commercial",   city: "Atlanta",      product: "EPDM",     analyst: "S. Patel",   submitted: "Mar 10", age: "1d",   revision: "Flagged",      status: "Watch",     statusColor: "warn", currentStage: "assembly" },

  // Submittal stage
  { id: "SB-0441", contractor: "Apex Roofing LLC",    city: "Atlanta",      product: "TPO 80mil", analyst: "T. Nguyen",  submitted: "Mar 9",  age: "2d",   revision: "None",         status: "On Track",  statusColor: "ok",   currentStage: "submittal" },
  { id: "SB-0438", contractor: "Summit Commercial",   city: "New York",     product: "PVC 60mil", analyst: "J. Hoffman", submitted: "Mar 8",  age: "3d",   revision: "None",         status: "On Track",  statusColor: "ok",   currentStage: "submittal" },
  { id: "SB-0431", contractor: "Trident Contractors", city: "Chicago",      product: "EPDM",     analyst: "S. Patel",   submitted: "Mar 7",  age: "4d",   revision: "None",         status: "In Review", statusColor: "warn", currentStage: "submittal" },
  { id: "SB-0428", contractor: "Keystone Roofing",   city: "New York",     product: "TPO 60mil", analyst: "T. Nguyen",  submitted: "Mar 6",  age: "5d",   revision: "1st revision", status: "Overdue",   statusColor: "risk", currentStage: "submittal" },
  { id: "SB-0422", contractor: "Horizon Commercial", city: "Dallas",       product: "PVC 50mil", analyst: "J. Hoffman", submitted: "Mar 8",  age: "3d",   revision: "None",         status: "On Track",  statusColor: "ok",   currentStage: "submittal" },
  { id: "SB-0418", contractor: "Atlas Roofing Co.",  city: "Los Angeles",  product: "EPDM",     analyst: "S. Patel",   submitted: "Mar 9",  age: "2d",   revision: "None",         status: "On Track",  statusColor: "ok",   currentStage: "submittal" },

  // Quote stage
  { id: "QT-0781", contractor: "Apex Roofing LLC",    city: "Atlanta",      product: "TPO 80mil", analyst: "M. Davis",   submitted: "Mar 9",  age: "2d",   revision: "None",         status: "On Track",  statusColor: "ok",   currentStage: "quote" },
  { id: "QT-0776", contractor: "Summit Commercial",   city: "New York",     product: "PVC 60mil", analyst: "K. Torres",  submitted: "Mar 8",  age: "3d",   revision: "None",         status: "On Track",  statusColor: "ok",   currentStage: "quote" },
  { id: "QT-0769", contractor: "Trident Contractors", city: "Chicago",      product: "EPDM",     analyst: "M. Davis",   submitted: "Mar 7",  age: "4d",   revision: "1st revision", status: "In Review", statusColor: "warn", currentStage: "quote" },
  { id: "QT-0764", contractor: "Keystone Roofing",   city: "New York",     product: "TPO 60mil", analyst: "K. Torres",  submitted: "Mar 6",  age: "5d",   revision: "None",         status: "Overdue",   statusColor: "risk", currentStage: "quote" },
  { id: "QT-0758", contractor: "Horizon Commercial", city: "Dallas",       product: "EPDM",     analyst: "M. Davis",   submitted: "Mar 8",  age: "3d",   revision: "None",         status: "On Track",  statusColor: "ok",   currentStage: "quote" },
  { id: "QT-0753", contractor: "Atlas Roofing Co.",  city: "Los Angeles",  product: "PVC 50mil", analyst: "K. Torres",  submitted: "Mar 10", age: "1d",   revision: "None",         status: "On Track",  statusColor: "ok",   currentStage: "quote" },

  // NOA / Warranty stage
  { id: "WR-0312", contractor: "Apex Roofing LLC",    city: "Atlanta",      product: "TPO 80mil", analyst: "R. Chen",    submitted: "Mar 2",  age: "9d",   revision: "1st revision", status: "Overdue",   statusColor: "risk", currentStage: "noa" },
  { id: "WR-0308", contractor: "Summit Commercial",   city: "New York",     product: "EPDM",     analyst: "M. Okonkwo", submitted: "Mar 3",  age: "8d",   revision: "2nd revision", status: "Overdue",   statusColor: "risk", currentStage: "noa" },
  { id: "WR-0304", contractor: "Trident Contractors", city: "Chicago",      product: "PVC 60mil", analyst: "R. Chen",    submitted: "Mar 5",  age: "6d",   revision: "None",         status: "In Review", statusColor: "warn", currentStage: "noa" },
  { id: "WR-0299", contractor: "Keystone Roofing",   city: "New York",     product: "TPO 60mil", analyst: "M. Okonkwo", submitted: "Mar 7",  age: "4d",   revision: "None",         status: "In Review", statusColor: "warn", currentStage: "noa" },
  { id: "WR-0294", contractor: "Horizon Commercial", city: "Dallas",       product: "EPDM",     analyst: "R. Chen",    submitted: "Mar 8",  age: "3d",   revision: "None",         status: "On Track",  statusColor: "ok",   currentStage: "noa" },
  { id: "WR-0290", contractor: "Atlas Roofing Co.",  city: "Los Angeles",  product: "PVC 50mil", analyst: "M. Okonkwo", submitted: "Mar 10", age: "1d",   revision: "None",         status: "On Track",  statusColor: "ok",   currentStage: "noa" },

  // Inspection stage
  { id: "IN-0091", contractor: "Apex Roofing LLC",    city: "Atlanta",      product: "EPDM",     analyst: "P. Walsh",   submitted: "Feb 28", age: "11d",  revision: "Re-inspect",   status: "Overdue",   statusColor: "risk", currentStage: "inspection" },
  { id: "IN-0088", contractor: "Summit Commercial",   city: "New York",     product: "TPO 80mil", analyst: "L. Santos",  submitted: "Mar 2",  age: "9d",   revision: "Re-inspect",   status: "Overdue",   statusColor: "risk", currentStage: "inspection" },
  { id: "IN-0084", contractor: "Trident Contractors", city: "Chicago",      product: "PVC 60mil", analyst: "P. Walsh",   submitted: "Mar 4",  age: "7d",   revision: "None",         status: "Overdue",   statusColor: "risk", currentStage: "inspection" },
  { id: "IN-0081", contractor: "Keystone Roofing",   city: "New York",     product: "EPDM",     analyst: "L. Santos",  submitted: "Mar 6",  age: "5d",   revision: "1st revision", status: "In Review", statusColor: "warn", currentStage: "inspection" },
  { id: "IN-0077", contractor: "Horizon Commercial", city: "Dallas",       product: "TPO 60mil", analyst: "P. Walsh",   submitted: "Mar 7",  age: "4d",   revision: "None",         status: "In Review", statusColor: "warn", currentStage: "inspection" },
  { id: "IN-0074", contractor: "Atlas Roofing Co.",  city: "Los Angeles",  product: "PVC 50mil", analyst: "L. Santos",  submitted: "Mar 9",  age: "2d",   revision: "None",         status: "On Track",  statusColor: "ok",   currentStage: "inspection" },
  { id: "IN-0071", contractor: "Meridian Systems",   city: "Houston",      product: "EPDM",     analyst: "P. Walsh",   submitted: "Mar 10", age: "1d",   revision: "None",         status: "On Track",  statusColor: "ok",   currentStage: "inspection" },
];

// ── Enriched work orders with team + activity ───────────────────────────────────

export const WORK_ORDERS: WorkOrderDetail[] = RAW_WORK_ORDERS.map(wo => ({
  ...wo,
  team: CONTRACTOR_TEAMS[wo.contractor] ?? {
    salesRep: { name: "—", email: "" },
    contractorContact: { name: "—", email: "" },
  },
  activity: buildActivity(wo),
}));

// ── Lookup function ─────────────────────────────────────────────────────────────

export function getWorkOrder(id: string): WorkOrderDetail | undefined {
  return WORK_ORDERS.find(wo => wo.id === id);
}
