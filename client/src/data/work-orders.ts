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
  projectName: string;
  address: string;
  sqft: string;
  roofType: string;
}

export interface ContractorTeam {
  salesRep: { name: string; email: string; avatarUrl: string };
  contractorContact: { name: string; email: string; avatarUrl: string };
  analyst?: { avatarUrl: string };
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
    salesRep:          { name: "D. Mercer",  email: "d.mercer@apex.com",        avatarUrl: "https://randomuser.me/api/portraits/men/18.jpg" },
    contractorContact: { name: "Tom Hicks",  email: "thicks@apex.com",          avatarUrl: "https://randomuser.me/api/portraits/men/25.jpg" },
    analyst:           { avatarUrl: "https://randomuser.me/api/portraits/women/28.jpg" },
  },
  "Summit Commercial": {
    salesRep:          { name: "L. Park",    email: "l.park@carlisle.com",       avatarUrl: "https://randomuser.me/api/portraits/women/35.jpg" },
    contractorContact: { name: "Amy Lin",    email: "alin@summit.com",           avatarUrl: "https://randomuser.me/api/portraits/women/22.jpg" },
    analyst:           { avatarUrl: "https://randomuser.me/api/portraits/women/42.jpg" },
  },
  "Trident Contractors": {
    salesRep:          { name: "R. Okafor",  email: "r.okafor@carlisle.com",     avatarUrl: "https://randomuser.me/api/portraits/men/54.jpg" },
    contractorContact: { name: "Ben Cruz",   email: "b.cruz@trident.com",        avatarUrl: "https://randomuser.me/api/portraits/men/61.jpg" },
    analyst:           { avatarUrl: "https://randomuser.me/api/portraits/women/28.jpg" },
  },
  "Keystone Roofing": {
    salesRep:          { name: "L. Park",    email: "l.park@carlisle.com",       avatarUrl: "https://randomuser.me/api/portraits/women/35.jpg" },
    contractorContact: { name: "Mike Stone", email: "m.stone@keystone.com",      avatarUrl: "https://randomuser.me/api/portraits/men/73.jpg" },
    analyst:           { avatarUrl: "https://randomuser.me/api/portraits/women/42.jpg" },
  },
  "Horizon Commercial": {
    salesRep:          { name: "R. Okafor",  email: "r.okafor@carlisle.com",     avatarUrl: "https://randomuser.me/api/portraits/men/54.jpg" },
    contractorContact: { name: "Julia West", email: "j.west@horizon.com",        avatarUrl: "https://randomuser.me/api/portraits/women/48.jpg" },
    analyst:           { avatarUrl: "https://randomuser.me/api/portraits/women/28.jpg" },
  },
  "Atlas Roofing Co.": {
    salesRep:          { name: "D. Mercer",  email: "d.mercer@carlisle.com",     avatarUrl: "https://randomuser.me/api/portraits/men/18.jpg" },
    contractorContact: { name: "Sam Torres", email: "s.torres@atlas.com",        avatarUrl: "https://randomuser.me/api/portraits/men/44.jpg" },
    analyst:           { avatarUrl: "https://randomuser.me/api/portraits/women/42.jpg" },
  },
  "Meridian Systems": {
    salesRep:          { name: "K. Young",   email: "k.young@carlisle.com",      avatarUrl: "https://randomuser.me/api/portraits/women/55.jpg" },
    contractorContact: { name: "Paul Reed",  email: "p.reed@meridian.com",       avatarUrl: "https://randomuser.me/api/portraits/men/67.jpg" },
    analyst:           { avatarUrl: "https://randomuser.me/api/portraits/women/28.jpg" },
  },
  "Crown Commercial": {
    salesRep:          { name: "D. Mercer",  email: "d.mercer@carlisle.com",     avatarUrl: "https://randomuser.me/api/portraits/men/18.jpg" },
    contractorContact: { name: "Grace Kim",  email: "g.kim@crown.com",           avatarUrl: "https://randomuser.me/api/portraits/women/38.jpg" },
    analyst:           { avatarUrl: "https://randomuser.me/api/portraits/women/42.jpg" },
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
      text: `Work order ${wo.id} submitted for ${wo.contractor} — ${wo.projectName}. Product: ${wo.product} (${wo.sqft} sq ft, ${wo.roofType}). Stage: ${STAGE_LABELS[wo.currentStage]}.`,
      type: "user",
    },
    {
      author: wo.analyst,
      role: "Design Analyst",
      time: `${wo.submitted}, 2:30 PM`,
      text: `Initial review complete. ${wo.product} spec confirmed against current product library for ${wo.roofType} application. No technical holds at intake.`,
      type: "user",
    },
  ];

  if (hasRevision) {
    base.push({
      author: "System",
      role: "Automated Alert",
      time: `${wo.submitted}, 4:00 PM`,
      text: `Revision cycle triggered: ${wo.revision}. Contractor resubmission required before stage advancement. Details sent to ${wo.team?.contractorContact?.name ?? "contractor contact"}.`,
      type: "system",
    });
    base.push({
      author: wo.team?.contractorContact?.name ?? "Contractor",
      role: "Contractor Contact",
      time: `${wo.submitted}, 4:45 PM`,
      text: `Acknowledged revision request. Updated documents will be resubmitted within 48 hours.`,
      type: "user",
    });
  }

  if (isFlagged) {
    base.push({
      author: "System",
      role: "Automated Alert",
      time: `${wo.submitted}, 3:45 PM`,
      text: `Work order flagged for manual review. Escalation sent to stage lead. Reason: spec discrepancy detected during automated validation.`,
      type: "system",
    });
    base.push({
      author: wo.analyst,
      role: "Design Analyst",
      time: `${wo.submitted}, 5:10 PM`,
      text: `Flagged item under manual review. Spec discrepancy relates to fastener pattern for ${wo.product} on low-slope section. Awaiting engineering sign-off.`,
      type: "user",
    });
  }

  if (isOverdue) {
    base.push({
      author: "System",
      role: "SLA Monitor",
      time: "Mar 12, 8:00 AM",
      text: `SLA breach detected for ${wo.id} — ${wo.projectName}. Current age: ${wo.age}. Immediate action required to prevent downstream cascade on ${wo.contractor} pipeline.`,
      type: "system",
    });
    base.push({
      author: wo.analyst,
      role: "Design Analyst",
      time: "Mar 12, 9:30 AM",
      text: `Escalating ${wo.id} to stage lead. Delays caused by pending contractor documentation for ${wo.sqft} sq ft ${wo.roofType} scope. Priority review requested.`,
      type: "user",
    });
  }

  if (!isOverdue && !hasRevision && !isFlagged) {
    base.push({
      author: wo.analyst,
      role: "Design Analyst",
      time: "Mar 11, 10:00 AM",
      text: `Status update: ${wo.status}. ${wo.projectName} (${wo.sqft} sq ft) is tracking on schedule. No issues identified at current stage.`,
      type: "user",
    });
    base.push({
      author: wo.team?.salesRep?.name ?? "Sales Rep",
      role: "Sales Rep",
      time: "Mar 11, 11:15 AM",
      text: `Confirmed with ${wo.contractor} that project timeline remains intact. ${wo.product} material lead time is acceptable for scheduled install window.`,
      type: "user",
    });
  }

  return base;
}

// ── Raw work order records ──────────────────────────────────────────────────────

const RAW_WORK_ORDERS: WorkOrderRecord[] = [
  // Proposal stage
  {
    id: "PR-1104", contractor: "Apex Roofing LLC",    city: "Atlanta",     product: "EPDM",      analyst: "K. Torres",  submitted: "Mar 10", age: "1d",  revision: "None",         status: "On Track",  statusColor: "ok",
    currentStage: "proposal",    projectName: "Piedmont Center Tower",        address: "1 Piedmont Ctr NE, Atlanta, GA 30305",          sqft: "38,200",  roofType: "Low-Slope Commercial",
  },
  {
    id: "PR-1108", contractor: "Summit Commercial",   city: "New York",    product: "TPO 80mil", analyst: "J. Kim",     submitted: "Mar 10", age: "1d",  revision: "None",         status: "On Track",  statusColor: "ok",
    currentStage: "proposal",    projectName: "Hudson Yards Office Block C",  address: "500 W 33rd St, New York, NY 10001",              sqft: "61,400",  roofType: "High-Rise Flat Roof",
  },
  {
    id: "PR-1095", contractor: "Trident Contractors", city: "Chicago",     product: "PVC 60mil", analyst: "K. Torres",  submitted: "Mar 9",  age: "2d",  revision: "None",         status: "On Track",  statusColor: "ok",
    currentStage: "proposal",    projectName: "Lakefront Logistics Hub",      address: "2200 S Lakeside Dr, Chicago, IL 60616",          sqft: "92,000",  roofType: "Industrial Low-Slope",
  },
  {
    id: "PR-1088", contractor: "Keystone Roofing",    city: "New York",    product: "EPDM",      analyst: "J. Kim",     submitted: "Mar 8",  age: "3d",  revision: "None",         status: "In Review", statusColor: "warn",
    currentStage: "proposal",    projectName: "Brooklyn Navy Yard Bldg 92",   address: "63 Flushing Ave, Brooklyn, NY 11205",            sqft: "44,800",  roofType: "Historic Retrofit",
  },
  {
    id: "PR-1074", contractor: "Horizon Commercial",  city: "Dallas",      product: "TPO 60mil", analyst: "K. Torres",  submitted: "Mar 7",  age: "4d",  revision: "None",         status: "In Review", statusColor: "warn",
    currentStage: "proposal",    projectName: "Uptown Dallas Plaza",          address: "2001 McKinney Ave, Dallas, TX 75201",            sqft: "29,600",  roofType: "Low-Slope Commercial",
  },
  {
    id: "PR-1061", contractor: "Atlas Roofing Co.",   city: "Los Angeles", product: "PVC 50mil", analyst: "J. Kim",     submitted: "Mar 6",  age: "5d",  revision: "None",         status: "Overdue",   statusColor: "risk",
    currentStage: "proposal",    projectName: "Wilshire Creative Campus",     address: "5900 Wilshire Blvd, Los Angeles, CA 90036",      sqft: "53,100",  roofType: "Multi-Section Flat",
  },

  // Assembly Letter stage
  {
    id: "AL-2847", contractor: "Apex Roofing LLC",    city: "Atlanta",     product: "EPDM",      analyst: "J. Hoffman", submitted: "Mar 3",  age: "8d",  revision: "2nd revision", status: "Overdue",   statusColor: "risk",
    currentStage: "assembly",    projectName: "Buckhead Corporate Centre",    address: "3399 Peachtree Rd NE, Atlanta, GA 30326",        sqft: "47,500",  roofType: "Low-Slope Commercial",
  },
  {
    id: "AL-2851", contractor: "Summit Commercial",   city: "New York",    product: "EPDM",      analyst: "S. Patel",   submitted: "Mar 4",  age: "7d",  revision: "1st revision", status: "Overdue",   statusColor: "risk",
    currentStage: "assembly",    projectName: "Midtown South Warehouse",      address: "450 W 31st St, New York, NY 10001",              sqft: "78,200",  roofType: "Industrial Re-Roof",
  },
  {
    id: "AL-2863", contractor: "Trident Contractors", city: "Chicago",     product: "TPO 80mil", analyst: "J. Hoffman", submitted: "Mar 5",  age: "6d",  revision: "None",         status: "Overdue",   statusColor: "risk",
    currentStage: "assembly",    projectName: "McCormick Place Annex",        address: "2233 S Martin Luther King Dr, Chicago, IL 60616", sqft: "115,000", roofType: "Convention Center",
  },
  {
    id: "AL-2871", contractor: "Keystone Roofing",    city: "New York",    product: "PVC 60mil", analyst: "T. Nguyen",  submitted: "Mar 7",  age: "4d",  revision: "None",         status: "In Review", statusColor: "warn",
    currentStage: "assembly",    projectName: "Queens Distribution Center",   address: "124-01 Springfield Blvd, Queens, NY 11413",      sqft: "88,400",  roofType: "Distribution Facility",
  },
  {
    id: "AL-2879", contractor: "Horizon Commercial",  city: "Dallas",      product: "EPDM",      analyst: "S. Patel",   submitted: "Mar 8",  age: "3d",  revision: "1st revision", status: "Pending",   statusColor: "warn",
    currentStage: "assembly",    projectName: "Deep Ellum Mixed-Use",         address: "2500 Elm St, Dallas, TX 75226",                  sqft: "35,700",  roofType: "Mixed-Use Retail",
  },
  {
    id: "AL-2882", contractor: "Atlas Roofing Co.",   city: "Los Angeles", product: "TPO 60mil", analyst: "T. Nguyen",  submitted: "Mar 9",  age: "2d",  revision: "None",         status: "On Track",  statusColor: "ok",
    currentStage: "assembly",    projectName: "LAX Terminal 6 Support Bldg",  address: "1 World Way, Los Angeles, CA 90045",             sqft: "22,300",  roofType: "Aviation Support",
  },
  {
    id: "AL-2885", contractor: "Meridian Systems",    city: "Chicago",     product: "PVC 50mil", analyst: "J. Hoffman", submitted: "Mar 10", age: "1d",  revision: "None",         status: "On Track",  statusColor: "ok",
    currentStage: "assembly",    projectName: "West Loop Tech Campus Bldg B", address: "300 S Riverside Plaza, Chicago, IL 60606",       sqft: "41,200",  roofType: "Class A Office",
  },
  {
    id: "AL-2888", contractor: "Crown Commercial",    city: "Atlanta",     product: "EPDM",      analyst: "S. Patel",   submitted: "Mar 10", age: "1d",  revision: "Flagged",      status: "Watch",     statusColor: "warn",
    currentStage: "assembly",    projectName: "Old Fourth Ward Retail Center", address: "675 Ponce de Leon Ave NE, Atlanta, GA 30308",   sqft: "27,900",  roofType: "Retail Strip",
  },

  // Submittal stage
  {
    id: "SB-0441", contractor: "Apex Roofing LLC",    city: "Atlanta",     product: "TPO 80mil", analyst: "T. Nguyen",  submitted: "Mar 9",  age: "2d",  revision: "None",         status: "On Track",  statusColor: "ok",
    currentStage: "submittal",   projectName: "Midtown Atlanta Medical Tower", address: "550 Peachtree St NE, Atlanta, GA 30308",        sqft: "56,100",  roofType: "Healthcare Facility",
  },
  {
    id: "SB-0438", contractor: "Summit Commercial",   city: "New York",    product: "PVC 60mil", analyst: "J. Hoffman", submitted: "Mar 8",  age: "3d",  revision: "None",         status: "On Track",  statusColor: "ok",
    currentStage: "submittal",   projectName: "Long Island City Office Park",  address: "44-36 Vernon Blvd, Queens, NY 11101",           sqft: "49,300",  roofType: "Multi-Tenant Office",
  },
  {
    id: "SB-0431", contractor: "Trident Contractors", city: "Chicago",     product: "EPDM",      analyst: "S. Patel",   submitted: "Mar 7",  age: "4d",  revision: "None",         status: "In Review", statusColor: "warn",
    currentStage: "submittal",   projectName: "River North Parking Structure", address: "430 N Orleans St, Chicago, IL 60654",           sqft: "33,800",  roofType: "Parking Deck Topping",
  },
  {
    id: "SB-0428", contractor: "Keystone Roofing",    city: "New York",    product: "TPO 60mil", analyst: "T. Nguyen",  submitted: "Mar 6",  age: "5d",  revision: "1st revision", status: "Overdue",   statusColor: "risk",
    currentStage: "submittal",   projectName: "Bronx Gateway Industrial",     address: "850 Hunts Point Ave, Bronx, NY 10474",           sqft: "67,200",  roofType: "Industrial Re-Roof",
  },
  {
    id: "SB-0422", contractor: "Horizon Commercial",  city: "Dallas",      product: "PVC 50mil", analyst: "J. Hoffman", submitted: "Mar 8",  age: "3d",  revision: "None",         status: "On Track",  statusColor: "ok",
    currentStage: "submittal",   projectName: "Las Colinas Corporate Center",  address: "5221 N O'Connor Blvd, Irving, TX 75039",        sqft: "44,000",  roofType: "Class A Office",
  },
  {
    id: "SB-0418", contractor: "Atlas Roofing Co.",   city: "Los Angeles", product: "EPDM",      analyst: "S. Patel",   submitted: "Mar 9",  age: "2d",  revision: "None",         status: "On Track",  statusColor: "ok",
    currentStage: "submittal",   projectName: "Culver City Studios Soundstage", address: "9336 W Washington Blvd, Culver City, CA 90232", sqft: "31,500",  roofType: "Entertainment Facility",
  },

  // Quote stage
  {
    id: "QT-0781", contractor: "Apex Roofing LLC",    city: "Atlanta",     product: "TPO 80mil", analyst: "M. Davis",   submitted: "Mar 9",  age: "2d",  revision: "None",         status: "On Track",  statusColor: "ok",
    currentStage: "quote",       projectName: "Airport Industrial Park Bldg 4", address: "2300 Sullivan Rd, College Park, GA 30337",    sqft: "72,400",  roofType: "Industrial Warehouse",
  },
  {
    id: "QT-0776", contractor: "Summit Commercial",   city: "New York",    product: "PVC 60mil", analyst: "K. Torres",  submitted: "Mar 8",  age: "3d",  revision: "None",         status: "On Track",  statusColor: "ok",
    currentStage: "quote",       projectName: "Chelsea Market Annex",         address: "75 9th Ave, New York, NY 10011",                 sqft: "28,700",  roofType: "Historic Adaptive Reuse",
  },
  {
    id: "QT-0769", contractor: "Trident Contractors", city: "Chicago",     product: "EPDM",      analyst: "M. Davis",   submitted: "Mar 7",  age: "4d",  revision: "1st revision", status: "In Review", statusColor: "warn",
    currentStage: "quote",       projectName: "O'Hare Business Center",       address: "8501 W Higgins Rd, Chicago, IL 60631",           sqft: "55,600",  roofType: "Low-Slope Commercial",
  },
  {
    id: "QT-0764", contractor: "Keystone Roofing",    city: "New York",    product: "TPO 60mil", analyst: "K. Torres",  submitted: "Mar 6",  age: "5d",  revision: "None",         status: "Overdue",   statusColor: "risk",
    currentStage: "quote",       projectName: "Staten Island Ferry Terminal",  address: "4 Whitehall St, New York, NY 10004",            sqft: "39,100",  roofType: "Transit Infrastructure",
  },
  {
    id: "QT-0758", contractor: "Horizon Commercial",  city: "Dallas",      product: "EPDM",      analyst: "M. Davis",   submitted: "Mar 8",  age: "3d",  revision: "None",         status: "On Track",  statusColor: "ok",
    currentStage: "quote",       projectName: "Frisco Medical Campus Phase 2", address: "6000 Warren Pkwy, Frisco, TX 75034",           sqft: "48,900",  roofType: "Healthcare Facility",
  },
  {
    id: "QT-0753", contractor: "Atlas Roofing Co.",   city: "Los Angeles", product: "PVC 50mil", analyst: "K. Torres",  submitted: "Mar 10", age: "1d",  revision: "None",         status: "On Track",  statusColor: "ok",
    currentStage: "quote",       projectName: "Downtown LA Financial Tower",  address: "333 S Grand Ave, Los Angeles, CA 90071",         sqft: "21,800",  roofType: "High-Rise Penthouse",
  },

  // NOA / Warranty stage
  {
    id: "WR-0312", contractor: "Apex Roofing LLC",    city: "Atlanta",     product: "TPO 80mil", analyst: "R. Chen",    submitted: "Mar 2",  age: "9d",  revision: "1st revision", status: "Overdue",   statusColor: "risk",
    currentStage: "noa",         projectName: "Avalon Perimeter Center",      address: "11000 Avalon Blvd, Alpharetta, GA 30009",        sqft: "63,200",  roofType: "Mixed-Use Development",
  },
  {
    id: "WR-0308", contractor: "Summit Commercial",   city: "New York",    product: "EPDM",      analyst: "M. Okonkwo", submitted: "Mar 3",  age: "8d",  revision: "2nd revision", status: "Overdue",   statusColor: "risk",
    currentStage: "noa",         projectName: "Javits Center North Pavilion", address: "655 W 34th St, New York, NY 10001",              sqft: "104,000", roofType: "Convention Center",
  },
  {
    id: "WR-0304", contractor: "Trident Contractors", city: "Chicago",     product: "PVC 60mil", analyst: "R. Chen",    submitted: "Mar 5",  age: "6d",  revision: "None",         status: "In Review", statusColor: "warn",
    currentStage: "noa",         projectName: "Wicker Park Mixed-Use Block",  address: "1600 N Milwaukee Ave, Chicago, IL 60647",        sqft: "26,400",  roofType: "Mixed-Use Retail",
  },
  {
    id: "WR-0299", contractor: "Keystone Roofing",    city: "New York",    product: "TPO 60mil", analyst: "M. Okonkwo", submitted: "Mar 7",  age: "4d",  revision: "None",         status: "In Review", statusColor: "warn",
    currentStage: "noa",         projectName: "Astoria Community Health Ctr",  address: "30-71 21st St, Astoria, NY 11102",             sqft: "34,500",  roofType: "Healthcare Facility",
  },
  {
    id: "WR-0294", contractor: "Horizon Commercial",  city: "Dallas",      product: "EPDM",      analyst: "R. Chen",    submitted: "Mar 8",  age: "3d",  revision: "None",         status: "On Track",  statusColor: "ok",
    currentStage: "noa",         projectName: "Plano Commerce Park Bldg 7",   address: "5700 Headquarters Dr, Plano, TX 75024",          sqft: "57,800",  roofType: "Class A Office",
  },
  {
    id: "WR-0290", contractor: "Atlas Roofing Co.",   city: "Los Angeles", product: "PVC 50mil", analyst: "M. Okonkwo", submitted: "Mar 10", age: "1d",  revision: "None",         status: "On Track",  statusColor: "ok",
    currentStage: "noa",         projectName: "Marina del Rey Boathouse Hub",  address: "13755 Fiji Way, Marina del Rey, CA 90292",     sqft: "18,300",  roofType: "Coastal Low-Slope",
  },

  // Inspection stage
  {
    id: "IN-0091", contractor: "Apex Roofing LLC",    city: "Atlanta",     product: "EPDM",      analyst: "P. Walsh",   submitted: "Feb 28", age: "11d", revision: "Re-inspect",   status: "Overdue",   statusColor: "risk",
    currentStage: "inspection",  projectName: "Turner Field Redevelopment",   address: "755 Hank Aaron Dr SW, Atlanta, GA 30315",       sqft: "82,100",  roofType: "Stadium Adaptive Reuse",
  },
  {
    id: "IN-0088", contractor: "Summit Commercial",   city: "New York",    product: "TPO 80mil", analyst: "L. Santos",  submitted: "Mar 2",  age: "9d",  revision: "Re-inspect",   status: "Overdue",   statusColor: "risk",
    currentStage: "inspection",  projectName: "Columbia University Uris Hall", address: "3022 Broadway, New York, NY 10027",            sqft: "41,600",  roofType: "Institutional Roof",
  },
  {
    id: "IN-0084", contractor: "Trident Contractors", city: "Chicago",     product: "PVC 60mil", analyst: "P. Walsh",   submitted: "Mar 4",  age: "7d",  revision: "None",         status: "Overdue",   statusColor: "risk",
    currentStage: "inspection",  projectName: "Navy Pier Festival Hall",      address: "600 E Grand Ave, Chicago, IL 60611",            sqft: "68,000",  roofType: "Entertainment Venue",
  },
  {
    id: "IN-0081", contractor: "Keystone Roofing",    city: "New York",    product: "EPDM",      analyst: "L. Santos",  submitted: "Mar 6",  age: "5d",  revision: "1st revision", status: "In Review", statusColor: "warn",
    currentStage: "inspection",  projectName: "JFK Cargo Terminal A",         address: "Building 151, Jamaica, NY 11430",               sqft: "95,300",  roofType: "Aviation Cargo Facility",
  },
  {
    id: "IN-0077", contractor: "Horizon Commercial",  city: "Dallas",      product: "TPO 60mil", analyst: "P. Walsh",   submitted: "Mar 7",  age: "4d",  revision: "None",         status: "In Review", statusColor: "warn",
    currentStage: "inspection",  projectName: "Arlington Medical Center",     address: "800 W Randol Mill Rd, Arlington, TX 76012",      sqft: "52,700",  roofType: "Healthcare Facility",
  },
  {
    id: "IN-0074", contractor: "Atlas Roofing Co.",   city: "Los Angeles", product: "PVC 50mil", analyst: "L. Santos",  submitted: "Mar 9",  age: "2d",  revision: "None",         status: "On Track",  statusColor: "ok",
    currentStage: "inspection",  projectName: "Miracle Mile Retail Complex",  address: "5900 Wilshire Blvd, Los Angeles, CA 90036",      sqft: "36,900",  roofType: "Retail Low-Slope",
  },
  {
    id: "IN-0071", contractor: "Meridian Systems",    city: "Houston",     product: "EPDM",      analyst: "P. Walsh",   submitted: "Mar 10", age: "1d",  revision: "None",         status: "On Track",  statusColor: "ok",
    currentStage: "inspection",  projectName: "Houston Energy Corridor Bldg", address: "1600 Smith St, Houston, TX 77002",              sqft: "44,100",  roofType: "Class A Office",
  },
];

// ── Enriched work orders with team + activity ───────────────────────────────────

export const WORK_ORDERS: WorkOrderDetail[] = RAW_WORK_ORDERS.map(wo => ({
  ...wo,
  team: CONTRACTOR_TEAMS[wo.contractor] ?? {
    salesRep: { name: "—", email: "", avatarUrl: "" },
    contractorContact: { name: "—", email: "", avatarUrl: "" },
  },
  activity: buildActivity(wo),
}));

// ── Lookup function ─────────────────────────────────────────────────────────────

export function getWorkOrder(id: string): WorkOrderDetail | undefined {
  return WORK_ORDERS.find(wo => wo.id === id);
}
