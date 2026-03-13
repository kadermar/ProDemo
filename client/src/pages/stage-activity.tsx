import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { PageHero } from "@/components/page-hero";
import { AiAssistant } from "@/components/ai-assistant";
import { STAGE_ICONS, ROLE_ICONS } from "@/lib/stage-icons";

// ── Stage tabs ─────────────────────────────────────────────────────────────────

const STAGE_TABS = [
  { key: "proposal",   icon: "📋", name: "Proposal",        count: 124, avgDays: "1.2", badge: "On Track",  health: "ok"   },
  { key: "assembly",   icon: "📐", name: "Assembly Letter", count: 89,  avgDays: "2.1", badge: "14 overdue", health: "risk" },
  { key: "submittal",  icon: "📦", name: "Submittal",       count: 67,  avgDays: "0.8", badge: "On Track",  health: "ok"   },
  { key: "quote",      icon: "💬", name: "Quote",           count: 45,  avgDays: "1.5", badge: "On Track",  health: "ok"   },
  { key: "noa",        icon: "📜", name: "NOA / Warranty",  count: 38,  avgDays: "3.2", badge: "6 overdue", health: "warn" },
  { key: "inspection", icon: "🔍", name: "Inspection",      count: 28,  avgDays: "6.4", badge: "8 overdue", health: "warn" },
];

// ── Per-stage data ─────────────────────────────────────────────────────────────

type WorkOrder = { id: string; contractor: string; region: string; product: string; productColor: string; analyst: string; submitted: string; age: string; ageColor: string | null; revision: string; revColor: string; status: string; statusColor: string; };
type Signal   = { level: string; id: string; title: string; desc: string; stats: string[]; chatQuery?: string; };
type LibItem  = { name: string; revisions: string; desc: string; bg: string; action: string | null; };
type RevCause = { label: string; sub: string; val: string; color: string; };
type Downstream = { label: string; sub: string; val: string; color: string; };

interface StageDetail {
  heroLabel: string;
  heroTitle: string;
  heroDesc: string;
  kpis: { val: string; label: string; color: string }[];
  alertBox: { title: string; sub: string; color: string };
  roles: { name: string; task: string; stat: string; statColor: string; bg: string }[];
  tableTitle: string;
  tableNote: string;
  workOrders: WorkOrder[];
  woTotal: number;
  woBadge: string;
  signals: Signal[];
  libItems: LibItem[];
  trendTitle: string;
  trendMonths: string[];
  trendBars: number[];
  trendRows: { label: string; val: string; color: string }[];
  revCauses: RevCause[];
  revInsight: string;
  downstream: Downstream[];
  downInsight: string;
}

const STAGE_DATA: Record<string, StageDetail> = {

  proposal: {
    heroLabel: "✓ Stage Healthy — Proposal",
    heroTitle: "📋 Proposal Review",
    heroDesc: "Contractor submits initial job details → Sales Rep qualifies opportunity → Enters pipeline and creates Assembly Letter request",
    kpis: [
      { val: "124", label: "Active proposals", color: "text-emerald-700" },
      { val: "2",   label: "Overdue (>24hr)", color: "text-amber-600" },
      { val: "1.2d", label: "Avg cycle vs 1d SLA", color: "text-emerald-700" },
      { val: "4%",  label: "Drop-off rate", color: "text-slate-500" },
      { val: "98",  label: "Accepted this month", color: "text-emerald-700" },
    ],
    alertBox: { title: "Healthy", sub: "No active signals", color: "bg-emerald-50 text-emerald-700" },
    roles: [
      { name: "Sales Rep",   task: "Qualifies lead, creates proposal record", stat: "124 in queue · 2 overdue", statColor: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
      { name: "Contractor", task: "Submits job scope & product intent",      stat: "6 incomplete forms",      statColor: "text-amber-600",   bg: "bg-amber-50 border-amber-200"   },
      { name: "Architect",  task: "References spec requirements",             stat: "14 spec downloads",       statColor: "text-slate-400",   bg: "bg-slate-50 border-slate-200"   },
    ],
    tableTitle: "Work Orders in Proposal Stage",
    tableNote: "Sorted by submission date · All proposal types",
    workOrders: [
      { id: "PR-1104", contractor: "Apex Roofing LLC",    region: "Atlanta",     product: "EPDM",    productColor: "blue", analyst: "K. Torres",  submitted: "Mar 10", age: "1d",  ageColor: null,   revision: "None",    revColor: "muted", status: "On Track",  statusColor: "ok"   },
      { id: "PR-1108", contractor: "Summit Commercial",   region: "New York",   product: "TPO 80mil", productColor: "blue", analyst: "J. Kim",   submitted: "Mar 10", age: "1d",  ageColor: null,   revision: "None",    revColor: "muted", status: "On Track",  statusColor: "ok"   },
      { id: "PR-1095", contractor: "Trident Contractors", region: "Chicago",    product: "PVC 60mil", productColor: "blue", analyst: "K. Torres", submitted: "Mar 9", age: "2d",  ageColor: null,   revision: "None",    revColor: "muted", status: "On Track",  statusColor: "ok"   },
      { id: "PR-1088", contractor: "Keystone Roofing",   region: "New York",   product: "EPDM",    productColor: "blue", analyst: "J. Kim",    submitted: "Mar 8",  age: "3d",  ageColor: null,   revision: "None",    revColor: "muted", status: "In Review", statusColor: "warn" },
      { id: "PR-1074", contractor: "Horizon Commercial", region: "Dallas",     product: "TPO 60mil", productColor: "blue", analyst: "K. Torres", submitted: "Mar 7", age: "4d",  ageColor: "warn", revision: "None",    revColor: "muted", status: "In Review", statusColor: "warn" },
      { id: "PR-1061", contractor: "Atlas Roofing Co.",  region: "Los Angeles", product: "PVC 50mil", productColor: "blue", analyst: "J. Kim",   submitted: "Mar 6",  age: "5d",  ageColor: "warn", revision: "None",    revColor: "muted", status: "Overdue",   statusColor: "risk" },
    ],
    woTotal: 124,
    woBadge: "2 proposals nearing SLA",
    signals: [
      { level: "warn", id: "SIG-010", title: "Incomplete Submission Forms", desc: "6 contractors missing required job-scope fields. Slows handoff to Assembly Letter.", stats: ["6 affected", "+0.5d avg"], chatQuery: "What required fields are most commonly missing from contractor proposal forms?" },
    ],
    libItems: [
      { name: "TPO Product Selector",    revisions: "0 issues",   desc: "Fully populated. Contractors finding correct specs on first attempt.", bg: "bg-slate-50 border-slate-200", action: null },
      { name: "EPDM Thickness Guide",    revisions: "2 revisions", desc: "Minor gaps in 60-mil vs 90-mil usage guidance for low-slope roofs.", bg: "bg-amber-50 border-amber-500", action: "→ Add thickness comparison table" },
      { name: "PVC Chemical Resistance", revisions: "0 issues",   desc: "Complete and current. No revisions in 90 days.", bg: "bg-slate-50 border-slate-200", action: null },
    ],
    trendTitle: "Cycle Time Trend — Proposal",
    trendMonths: ["Oct","Nov","Dec","Jan","Feb","Mar"],
    trendBars: [60, 55, 58, 62, 68, 55],
    trendRows: [
      { label: "Oct – Dec avg", val: "1.0d",  color: "text-emerald-700" },
      { label: "Jan – Feb avg", val: "1.1d",  color: "text-emerald-700" },
      { label: "March (current)", val: "1.2d", color: "text-emerald-700" },
      { label: "SLA target",    val: "1.0d",  color: "text-slate-800"   },
    ],
    revCauses: [
      { label: "Incomplete contractor submission", sub: "Missing job-scope fields",         val: "6 jobs", color: "text-amber-600" },
      { label: "Product type not specified",       sub: "Contractor unsure of membrane",    val: "3 jobs", color: "text-amber-600" },
      { label: "Conflicting spec references",      sub: "Outdated library pull",            val: "1 job",  color: "text-slate-400" },
    ],
    revInsight: "Mostly human error — library gaps are minor at this stage",
    downstream: [
      { label: "Assembly — queue fed",   sub: "Healthy handoff rate",        val: "98/mo",  color: "text-emerald-700" },
      { label: "Submittal — projected",  sub: "Based on current acceptance", val: "~81/mo", color: "text-slate-500"   },
      { label: "Est. fee value queued",  sub: "Proposals currently active",  val: "$4.2M",  color: "text-slate-700"   },
    ],
    downInsight: "Pipeline health at proposal is strong — no major blockers",
  },

  assembly: {
    heroLabel: "⚠ Stage Under Pressure — Assembly Letter",
    heroTitle: "📐 Assembly Letter Review",
    heroDesc: "Contractor submits request → Design Analyst validates code and warranty rules → Issues approved letter → Feeds Submittal Wizard",
    kpis: [
      { val: "89",   label: "Active work orders",  color: "text-red-600"     },
      { val: "14",   label: "Overdue (>48hr SLA)", color: "text-red-600"     },
      { val: "2.1d", label: "Avg cycle vs 1d SLA", color: "text-amber-600"   },
      { val: "19%",  label: "Revision rate",        color: "text-red-600"     },
      { val: "112",  label: "Approved this month",  color: "text-emerald-700" },
    ],
    alertBox: { title: "Overloaded", sub: "2 active signals", color: "bg-red-50 text-red-700" },
    roles: [
      { name: "Design Analyst", task: "Review, validate, sign off",                stat: "89 in queue · 14 overdue", statColor: "text-red-600",   bg: "bg-red-50 border-red-200"     },
      { name: "Contractor",    task: "Submits request, provides job data",          stat: "23 revision loops",        statColor: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
      { name: "Sales Rep",     task: "Supports submission, monitors status",         stat: "12 jobs tracking",         statColor: "text-slate-400", bg: "bg-slate-50 border-slate-200" },
      { name: "Architect",     task: "References product library for specs",         stat: "8 spec pulls",             statColor: "text-slate-400", bg: "bg-slate-50 border-slate-200" },
    ],
    tableTitle: "Work Orders in Assembly Letter Stage",
    tableNote: "Sorted by age · EPDM jobs flagged due to SIG-001 product library gap",
    workOrders: [
      { id: "AL-2847", contractor: "Apex Roofing LLC",    region: "Atlanta",     product: "EPDM",     productColor: "risk", analyst: "J. Hoffman", submitted: "Mar 3",  age: "8d ↑", ageColor: "risk", revision: "2nd revision", revColor: "risk", status: "Overdue",   statusColor: "risk" },
      { id: "AL-2851", contractor: "Summit Commercial",   region: "New York",   product: "EPDM",     productColor: "risk", analyst: "S. Patel",  submitted: "Mar 4",  age: "7d ↑", ageColor: "risk", revision: "1st revision", revColor: "warn", status: "Overdue",   statusColor: "risk" },
      { id: "AL-2863", contractor: "Trident Contractors", region: "Chicago",    product: "TPO 80mil", productColor: "blue", analyst: "J. Hoffman", submitted: "Mar 5", age: "6d ↑", ageColor: "risk", revision: "None",         revColor: "muted", status: "Overdue",   statusColor: "risk" },
      { id: "AL-2871", contractor: "Keystone Roofing",   region: "New York",   product: "PVC 60mil", productColor: "blue", analyst: "T. Nguyen", submitted: "Mar 7",  age: "4d",   ageColor: "warn", revision: "None",         revColor: "muted", status: "In Review", statusColor: "warn" },
      { id: "AL-2879", contractor: "Horizon Commercial", region: "Dallas",     product: "EPDM",     productColor: "risk", analyst: "S. Patel",  submitted: "Mar 8",  age: "3d",   ageColor: "warn", revision: "1st revision", revColor: "risk", status: "Pending",   statusColor: "warn" },
      { id: "AL-2882", contractor: "Atlas Roofing Co.",  region: "Los Angeles", product: "TPO 60mil", productColor: "blue", analyst: "T. Nguyen", submitted: "Mar 9",  age: "2d",   ageColor: null,   revision: "None",         revColor: "muted", status: "On Track",  statusColor: "ok"   },
      { id: "AL-2885", contractor: "Meridian Systems",   region: "Chicago",    product: "PVC 50mil", productColor: "blue", analyst: "J. Hoffman", submitted: "Mar 10", age: "1d", ageColor: null,   revision: "None",         revColor: "muted", status: "On Track",  statusColor: "ok"   },
      { id: "AL-2888", contractor: "Crown Commercial",   region: "Atlanta",    product: "EPDM",     productColor: "risk", analyst: "S. Patel",  submitted: "Mar 10", age: "1d",   ageColor: null,   revision: "Flagged",      revColor: "warn", status: "Watch",     statusColor: "warn" },
    ],
    woTotal: 89,
    woBadge: "5 EPDM jobs linked to SIG-001 product gap",
    signals: [
      { level: "risk", id: "SIG-002", title: "Design Analyst Queue Overloaded", desc: "14 letters past SLA. 89 in queue at 2.1× normal capacity. Fueled by revision loops from SIG-001.", stats: ["14 overdue", "$220K on hold"], chatQuery: "How can we redistribute assembly letter workload across design analysts to clear the current backlog?" },
      { level: "risk", id: "SIG-001", title: "EPDM Seam Tape Gap — Product Library", desc: "Missing seam tape sub-types causing 31% revision rate. Every EPDM job re-enters queue after first review.", stats: ["23 letters reworked", "+1.4d per job"], chatQuery: "What EPDM seam tape sub-types should be added to the product library to eliminate SIG-001 revision loops?" },
    ],
    libItems: [
      { name: "EPDM Seam Tape variants",    revisions: "23 revisions", desc: "Lap sealant, cover tape, splice tape — sub-type data missing. Contractors referencing wrong products.", bg: "bg-red-50 border-red-600",     action: "→ Open in Product Library · Add Sub-Types" },
      { name: "Insulation R-Value / ASHRAE", revisions: "9 revisions",  desc: "Energy code climate zone references missing. Analysts manually cross-checking ASHRAE 90.1 tables.",   bg: "bg-amber-50 border-amber-500", action: "→ Open in Product Library · Add ASHRAE Tables" },
      { name: "TPO Wind Uplift Zones",       revisions: "4 revisions",  desc: "Well covered. Minor geolocation gaps in ASCE 7 zone mapping.",                                         bg: "bg-slate-50 border-slate-200", action: null },
    ],
    trendTitle: "Cycle Time Trend — Assembly Letter",
    trendMonths: ["Oct","Nov","Dec","Jan","Feb","Mar"],
    trendBars: [30, 36, 28, 50, 80, 100],
    trendRows: [
      { label: "Oct – Dec avg",     val: "1.1d",   color: "text-emerald-700" },
      { label: "Jan – Feb avg",     val: "1.6d",   color: "text-amber-600"   },
      { label: "March (current)",   val: "2.1d ↑", color: "text-red-600"     },
      { label: "SLA target",        val: "1.0d",   color: "text-slate-800"   },
    ],
    revCauses: [
      { label: "EPDM seam tape spec gap",       sub: "Product library issue · SIG-001", val: "23 jobs", color: "text-red-600"   },
      { label: "Insulation R-value missing",     sub: "Product library issue · SIG-009", val: "9 jobs",  color: "text-amber-600" },
      { label: "Wind zone / ASCE 7 conflict",    sub: "Geolocation not captured",        val: "4 jobs",  color: "text-amber-600" },
      { label: "Incomplete contractor submission",sub: "Missing job data fields",         val: "3 jobs",  color: "text-slate-400" },
    ],
    revInsight: "64% of revisions caused by addressable product library gaps",
    downstream: [
      { label: "Submittal — delayed jobs",  sub: "Waiting on Assembly Letter",  val: "18 jobs", color: "text-amber-600" },
      { label: "Quote — blocked",           sub: "Cannot quote without letter",  val: "11 jobs", color: "text-amber-600" },
      { label: "NOA — queue impact",        sub: "Compounding warranty delays",  val: "6 jobs",  color: "text-slate-400" },
      { label: "Est. warranty fee risk",    sub: "Jobs stalled across pipeline", val: "$340K",   color: "text-red-600"   },
    ],
    downInsight: "Resolving SIG-001 clears est. 64% of downstream delays",
  },

  submittal: {
    heroLabel: "✓ Stage Healthy — Submittal",
    heroTitle: "📦 Submittal Processing",
    heroDesc: "Assembly Letter issued → Submittal Wizard packages job → Design Analyst reviews compliance → Approved package sent to client",
    kpis: [
      { val: "67",   label: "Active submittals",    color: "text-slate-700"   },
      { val: "3",    label: "Overdue (>48hr SLA)",  color: "text-amber-600"   },
      { val: "0.8d", label: "Avg cycle vs 1d SLA",  color: "text-emerald-700" },
      { val: "6%",   label: "Revision rate",         color: "text-emerald-700" },
      { val: "84",   label: "Approved this month",   color: "text-emerald-700" },
    ],
    alertBox: { title: "On Track", sub: "1 minor signal", color: "bg-emerald-50 text-emerald-700" },
    roles: [
      { name: "Design Analyst", task: "Compliance review, approve package", stat: "67 active · 3 overdue", statColor: "text-amber-600", bg: "bg-amber-50 border-amber-200"   },
      { name: "Contractor",    task: "Receives package, confirms scope",   stat: "4 revision loops",      statColor: "text-slate-400", bg: "bg-slate-50 border-slate-200" },
      { name: "Sales Rep",     task: "Tracks delivery, client updates",    stat: "9 monitoring",          statColor: "text-slate-400", bg: "bg-slate-50 border-slate-200" },
    ],
    tableTitle: "Work Orders in Submittal Stage",
    tableNote: "Sorted by submission date · Healthy queue",
    workOrders: [
      { id: "SB-0441", contractor: "Apex Roofing LLC",    region: "Atlanta",     product: "TPO 80mil", productColor: "blue", analyst: "T. Nguyen",  submitted: "Mar 9",  age: "2d",   ageColor: null,   revision: "None",    revColor: "muted", status: "On Track",  statusColor: "ok"   },
      { id: "SB-0438", contractor: "Summit Commercial",   region: "New York",   product: "PVC 60mil", productColor: "blue", analyst: "J. Hoffman", submitted: "Mar 8",  age: "3d",   ageColor: null,   revision: "None",    revColor: "muted", status: "On Track",  statusColor: "ok"   },
      { id: "SB-0431", contractor: "Trident Contractors", region: "Chicago",    product: "EPDM",     productColor: "blue", analyst: "S. Patel",   submitted: "Mar 7",  age: "4d",   ageColor: "warn", revision: "None",    revColor: "muted", status: "In Review", statusColor: "warn" },
      { id: "SB-0428", contractor: "Keystone Roofing",   region: "New York",   product: "TPO 60mil", productColor: "blue", analyst: "T. Nguyen",  submitted: "Mar 6",  age: "5d",   ageColor: "warn", revision: "1st revision", revColor: "warn", status: "Overdue", statusColor: "risk" },
      { id: "SB-0422", contractor: "Horizon Commercial", region: "Dallas",     product: "PVC 50mil", productColor: "blue", analyst: "J. Hoffman", submitted: "Mar 8",  age: "3d",   ageColor: null,   revision: "None",    revColor: "muted", status: "On Track",  statusColor: "ok"   },
      { id: "SB-0418", contractor: "Atlas Roofing Co.",  region: "Los Angeles", product: "EPDM",     productColor: "blue", analyst: "S. Patel",   submitted: "Mar 9",  age: "2d",   ageColor: null,   revision: "None",    revColor: "muted", status: "On Track",  statusColor: "ok"   },
    ],
    woTotal: 67,
    woBadge: "3 jobs approaching SLA threshold",
    signals: [
      { level: "warn", id: "SIG-006", title: "Submittal Package Version Mismatch", desc: "3 packages sent with outdated spec revision. Minor but creates confusion at Quote stage if uncorrected.", stats: ["3 packages", "+0.3d avg"], chatQuery: "What causes submittal package version mismatches and how can we prevent outdated spec revisions from being sent?" },
    ],
    libItems: [
      { name: "Submittal Template Library",  revisions: "0 issues",   desc: "Current and complete. All membrane types covered.", bg: "bg-slate-50 border-slate-200", action: null },
      { name: "Code Compliance Reference",   revisions: "3 revisions", desc: "IBC 2021 section references need update for 3 western states.", bg: "bg-amber-50 border-amber-500", action: "→ Update IBC section mapping" },
      { name: "Warranty Inclusion Checklist", revisions: "0 issues",  desc: "Fully maintained. Reduces warranty follow-up by 40%.", bg: "bg-slate-50 border-slate-200", action: null },
    ],
    trendTitle: "Cycle Time Trend — Submittal",
    trendMonths: ["Oct","Nov","Dec","Jan","Feb","Mar"],
    trendBars: [50, 45, 52, 48, 40, 35],
    trendRows: [
      { label: "Oct – Dec avg",   val: "0.9d",  color: "text-emerald-700" },
      { label: "Jan – Feb avg",   val: "0.8d",  color: "text-emerald-700" },
      { label: "March (current)", val: "0.8d",  color: "text-emerald-700" },
      { label: "SLA target",      val: "1.0d",  color: "text-slate-800"   },
    ],
    revCauses: [
      { label: "Spec version mismatch",   sub: "Outdated library pull · SIG-006",  val: "3 jobs", color: "text-amber-600" },
      { label: "Missing compliance note", sub: "IBC 2021 update pending",           val: "2 jobs", color: "text-amber-600" },
      { label: "Client request change",   sub: "Scope change after submission",     val: "1 job",  color: "text-slate-400" },
    ],
    revInsight: "83% of revisions addressable with library updates",
    downstream: [
      { label: "Quote — packages ready", sub: "Awaiting submittal completion",  val: "61/mo",    color: "text-emerald-700" },
      { label: "NOA — on schedule",      sub: "Healthy handoff from submittal", val: "On track", color: "text-emerald-700" },
      { label: "Est. fee value queued",  sub: "Submittals currently active",    val: "$3.1M",    color: "text-slate-700"   },
    ],
    downInsight: "Submittal is a healthy throughput stage — minor gains available",
  },

  quote: {
    heroLabel: "✓ Stage Healthy — Quote",
    heroTitle: "💬 Quote Generation",
    heroDesc: "Submittal approved → Sales Rep builds quote → Pricing configured against product library → Quote delivered to contractor or building owner",
    kpis: [
      { val: "45",   label: "Active quotes",         color: "text-slate-700"   },
      { val: "2",    label: "Overdue (>72hr SLA)",   color: "text-amber-600"   },
      { val: "1.5d", label: "Avg cycle vs 2d SLA",   color: "text-emerald-700" },
      { val: "8%",   label: "Revision rate",          color: "text-emerald-700" },
      { val: "56",   label: "Quotes issued this month", color: "text-emerald-700" },
    ],
    alertBox: { title: "On Track", sub: "No critical signals", color: "bg-emerald-50 text-emerald-700" },
    roles: [
      { name: "Sales Rep",     task: "Builds and delivers quote",         stat: "45 active · 2 overdue", statColor: "text-amber-600", bg: "bg-amber-50 border-amber-200"   },
      { name: "Contractor",   task: "Reviews, negotiates, accepts",       stat: "8 in negotiation",      statColor: "text-slate-400", bg: "bg-slate-50 border-slate-200" },
      { name: "Building Owner", task: "Final approval authority",         stat: "12 pending approval",   statColor: "text-slate-400", bg: "bg-slate-50 border-slate-200" },
      { name: "Pricing Team", task: "Sets product pricing, validates margin", stat: "3 custom quotes",   statColor: "text-slate-400", bg: "bg-slate-50 border-slate-200" },
    ],
    tableTitle: "Work Orders in Quote Stage",
    tableNote: "Sorted by quote value · Healthy mix of products",
    workOrders: [
      { id: "QT-0781", contractor: "Apex Roofing LLC",    region: "Atlanta",     product: "TPO 80mil", productColor: "blue", analyst: "M. Davis",  submitted: "Mar 9",  age: "2d",   ageColor: null,   revision: "None",    revColor: "muted", status: "On Track",  statusColor: "ok"   },
      { id: "QT-0776", contractor: "Summit Commercial",   region: "New York",   product: "PVC 60mil", productColor: "blue", analyst: "K. Torres", submitted: "Mar 8",  age: "3d",   ageColor: null,   revision: "None",    revColor: "muted", status: "On Track",  statusColor: "ok"   },
      { id: "QT-0769", contractor: "Trident Contractors", region: "Chicago",    product: "EPDM",     productColor: "blue", analyst: "M. Davis",  submitted: "Mar 7",  age: "4d",   ageColor: "warn", revision: "1st revision", revColor: "warn", status: "In Review", statusColor: "warn" },
      { id: "QT-0764", contractor: "Keystone Roofing",   region: "New York",   product: "TPO 60mil", productColor: "blue", analyst: "K. Torres", submitted: "Mar 6",  age: "5d",   ageColor: "warn", revision: "None",    revColor: "muted", status: "Overdue",  statusColor: "risk" },
      { id: "QT-0758", contractor: "Horizon Commercial", region: "Dallas",     product: "EPDM",     productColor: "blue", analyst: "M. Davis",  submitted: "Mar 8",  age: "3d",   ageColor: null,   revision: "None",    revColor: "muted", status: "On Track",  statusColor: "ok"   },
      { id: "QT-0753", contractor: "Atlas Roofing Co.",  region: "Los Angeles", product: "PVC 50mil", productColor: "blue", analyst: "K. Torres", submitted: "Mar 10", age: "1d",   ageColor: null,   revision: "None",    revColor: "muted", status: "On Track",  statusColor: "ok"   },
    ],
    woTotal: 45,
    woBadge: "2 quotes approaching 72hr SLA",
    signals: [
      { level: "warn", id: "SIG-011", title: "Multi-Ply Warranty Stacking Guidance Missing", desc: "5 quotes stalled because sales reps cannot confirm warranty stacking for PVC multi-ply systems. Product library missing this guidance.", stats: ["5 quotes affected", "+0.8d delay"], chatQuery: "What PVC multi-ply warranty stacking guidance should be added to the product library to unblock quotes?" },
    ],
    libItems: [
      { name: "Pricing Reference Tables",     revisions: "0 issues",   desc: "Current and complete. Regional pricing up to date as of Feb 2026.", bg: "bg-slate-50 border-slate-200", action: null },
      { name: "PVC Multi-Ply Warranty Guide", revisions: "5 stalls",   desc: "Stacking rules for multi-ply PVC systems not documented. Reps calling Product team directly.", bg: "bg-amber-50 border-amber-500", action: "→ Add warranty stacking rules to library" },
      { name: "EPDM Repair vs Replace Guide", revisions: "0 issues",   desc: "Helpful reference for re-roof quotes. Well maintained.", bg: "bg-slate-50 border-slate-200", action: null },
    ],
    trendTitle: "Cycle Time Trend — Quote",
    trendMonths: ["Oct","Nov","Dec","Jan","Feb","Mar"],
    trendBars: [55, 60, 52, 58, 62, 65],
    trendRows: [
      { label: "Oct – Dec avg",   val: "1.3d",  color: "text-emerald-700" },
      { label: "Jan – Feb avg",   val: "1.4d",  color: "text-emerald-700" },
      { label: "March (current)", val: "1.5d",  color: "text-emerald-700" },
      { label: "SLA target",      val: "2.0d",  color: "text-slate-800"   },
    ],
    revCauses: [
      { label: "PVC warranty stacking unknown", sub: "Library gap · SIG-011",      val: "5 jobs", color: "text-amber-600" },
      { label: "Custom scope change",           sub: "Client-requested revision",   val: "3 jobs", color: "text-slate-400" },
      { label: "Pricing override needed",       sub: "Non-standard job geometry",   val: "2 jobs", color: "text-slate-400" },
    ],
    revInsight: "50% of quote revisions addressable with one library addition",
    downstream: [
      { label: "NOA — quotes converting",  sub: "Healthy acceptance rate",      val: "78%",   color: "text-emerald-700" },
      { label: "Inspection — scheduled",   sub: "Post-NOA inspection bookings", val: "22/mo", color: "text-emerald-700" },
      { label: "Est. conversion value",    sub: "Quotes currently in pipeline", val: "$2.8M", color: "text-slate-700"   },
    ],
    downInsight: "Quote stage is efficient — PVC library gap is the one action item",
  },

  noa: {
    heroLabel: "⚡ Stage Watch — NOA / Warranty",
    heroTitle: "📜 NOA / Warranty Issuance",
    heroDesc: "Quote accepted → NOA application filed → Warranty review and approval → Certificate issued to contractor and building owner",
    kpis: [
      { val: "38",   label: "Active NOA filings",    color: "text-slate-700"   },
      { val: "6",    label: "Overdue (>5d SLA)",     color: "text-amber-600"   },
      { val: "3.2d", label: "Avg cycle vs 3d SLA",   color: "text-amber-600"   },
      { val: "12%",  label: "Pending re-review",      color: "text-amber-600"   },
      { val: "41",   label: "Issued this month",      color: "text-emerald-700" },
    ],
    alertBox: { title: "Watch", sub: "Backlog growing from Assembly delays", color: "bg-amber-50 text-amber-700" },
    roles: [
      { name: "Warranty Admin",  task: "Files NOA, tracks compliance deadlines", stat: "38 active · 6 overdue", statColor: "text-amber-600", bg: "bg-amber-50 border-amber-200"   },
      { name: "Design Analyst", task: "Confirms technical spec before issue",    stat: "12 technical holds",    statColor: "text-amber-600", bg: "bg-amber-50 border-amber-200"   },
      { name: "Sales Rep",      task: "Notifies owner, tracks receipt",          stat: "38 tracking",           statColor: "text-slate-400", bg: "bg-slate-50 border-slate-200" },
      { name: "Building Owner", task: "Receives and files warranty certificate", stat: "6 awaiting cert",       statColor: "text-amber-600", bg: "bg-amber-50 border-amber-200"   },
    ],
    tableTitle: "Work Orders in NOA / Warranty Stage",
    tableNote: "Sorted by filing date · 6 jobs compounding from Assembly Letter delays",
    workOrders: [
      { id: "WR-0312", contractor: "Apex Roofing LLC",    region: "Atlanta",     product: "TPO 80mil", productColor: "blue", analyst: "R. Chen",    submitted: "Mar 2",  age: "9d ↑",  ageColor: "risk", revision: "1st revision", revColor: "warn", status: "Overdue",   statusColor: "risk" },
      { id: "WR-0308", contractor: "Summit Commercial",   region: "New York",   product: "EPDM",     productColor: "risk", analyst: "M. Okonkwo", submitted: "Mar 3",  age: "8d ↑",  ageColor: "risk", revision: "2nd revision", revColor: "risk", status: "Overdue",   statusColor: "risk" },
      { id: "WR-0304", contractor: "Trident Contractors", region: "Chicago",    product: "PVC 60mil", productColor: "blue", analyst: "R. Chen",    submitted: "Mar 5",  age: "6d",    ageColor: "warn", revision: "None",         revColor: "muted", status: "In Review", statusColor: "warn" },
      { id: "WR-0299", contractor: "Keystone Roofing",   region: "New York",   product: "TPO 60mil", productColor: "blue", analyst: "M. Okonkwo", submitted: "Mar 7",  age: "4d",    ageColor: "warn", revision: "None",         revColor: "muted", status: "In Review", statusColor: "warn" },
      { id: "WR-0294", contractor: "Horizon Commercial", region: "Dallas",     product: "EPDM",     productColor: "risk", analyst: "R. Chen",    submitted: "Mar 8",  age: "3d",    ageColor: null,   revision: "None",         revColor: "muted", status: "On Track",  statusColor: "ok"   },
      { id: "WR-0290", contractor: "Atlas Roofing Co.",  region: "Los Angeles", product: "PVC 50mil", productColor: "blue", analyst: "M. Okonkwo", submitted: "Mar 10", age: "1d",    ageColor: null,   revision: "None",         revColor: "muted", status: "On Track",  statusColor: "ok"   },
    ],
    woTotal: 38,
    woBadge: "6 NOA filings overdue — mostly compounding from Assembly delays",
    signals: [
      { level: "warn", id: "SIG-007", title: "Warranty Re-Review Backlog", desc: "12 NOA applications requiring second technical review. EPDM-related jobs returning post-assembly delay — analysts overloaded.", stats: ["12 in re-review", "+1.8d avg"], chatQuery: "What is causing the warranty re-review backlog and what process changes would reduce NOA re-review rates?" },
      { level: "warn", id: "SIG-008", title: "Certificate Delivery Delays", desc: "6 building owners waiting >7 days for warranty certificates. Manual PDF generation and email process causing bottleneck.", stats: ["6 certificates pending", "3 escalations"], chatQuery: "How can we automate warranty certificate delivery to eliminate manual PDF generation bottlenecks?" },
    ],
    libItems: [
      { name: "Warranty Certificate Templates", revisions: "0 issues",   desc: "Fully maintained. 14 product-specific templates current.", bg: "bg-slate-50 border-slate-200", action: null },
      { name: "NOA Compliance Checklist",       revisions: "4 re-reviews", desc: "EPDM-specific compliance requirements need update post-2025 Florida code changes.", bg: "bg-amber-50 border-amber-500", action: "→ Update Florida code compliance items" },
      { name: "Multi-Year Warranty Extension",  revisions: "2 issues",  desc: "20-year extension terms not documented. 2 sales reps quoting incorrectly.", bg: "bg-amber-50 border-amber-500", action: "→ Add 20-year extension terms" },
    ],
    trendTitle: "Cycle Time Trend — NOA / Warranty",
    trendMonths: ["Oct","Nov","Dec","Jan","Feb","Mar"],
    trendBars: [40, 42, 38, 55, 75, 85],
    trendRows: [
      { label: "Oct – Dec avg",   val: "2.8d",   color: "text-emerald-700" },
      { label: "Jan – Feb avg",   val: "3.1d",   color: "text-amber-600"   },
      { label: "March (current)", val: "3.2d ↑", color: "text-amber-600"   },
      { label: "SLA target",      val: "3.0d",   color: "text-slate-800"   },
    ],
    revCauses: [
      { label: "Assembly Letter delay carryover", sub: "Upstream from SIG-001 / SIG-002", val: "8 jobs", color: "text-amber-600" },
      { label: "Florida code compliance gap",      sub: "NOA checklist outdated",           val: "4 jobs", color: "text-amber-600" },
      { label: "Incorrect warranty term quoted",   sub: "20-year extension undocumented",   val: "2 jobs", color: "text-slate-400" },
    ],
    revInsight: "Most NOA delays trace upstream to Assembly Letter — fixing SIG-001 clears 67%",
    downstream: [
      { label: "Inspection — dependent", sub: "Can't book until NOA issued",  val: "12 blocked", color: "text-amber-600" },
      { label: "Revenue — at risk",         sub: "Warranty fee collection delay", val: "$180K",       color: "text-amber-600" },
      { label: "Owner escalations",         sub: "Waiting on certificates",       val: "3 open",      color: "text-red-600"   },
    ],
    downInsight: "NOA delays cascade into inspection — 12 jobs blocked from scheduling",
  },

  inspection: {
    heroLabel: "⚡ Stage Watch — Inspection",
    heroTitle: "🔍 Inspection & Close-Out",
    heroDesc: "Warranty issued → Field inspection scheduled → Installation verified against spec → Project closed out and warranty activated",
    kpis: [
      { val: "28",   label: "Active inspections",    color: "text-slate-700"   },
      { val: "8",    label: "Overdue (>7d SLA)",     color: "text-amber-600"   },
      { val: "6.4d", label: "Avg cycle vs 5d SLA",   color: "text-amber-600"   },
      { val: "22%",  label: "Fail / re-inspect rate", color: "text-amber-600"   },
      { val: "19",   label: "Closed this month",      color: "text-emerald-700" },
    ],
    alertBox: { title: "Watch", sub: "Re-inspect rate elevated — 2 active signals", color: "bg-amber-50 text-amber-700" },
    roles: [
      { name: "Field Inspector",  task: "On-site verification against spec", stat: "28 scheduled · 8 overdue",  statColor: "text-amber-600", bg: "bg-amber-50 border-amber-200"   },
      { name: "Contractor",      task: "Prepares site, provides access",    stat: "6 re-inspect scheduled",    statColor: "text-amber-600", bg: "bg-amber-50 border-amber-200"   },
      { name: "Sales Rep",       task: "Coordinates scheduling, close-out", stat: "28 tracking",               statColor: "text-slate-400", bg: "bg-slate-50 border-slate-200" },
      { name: "Building Owner",  task: "Signs off on close-out package",    stat: "8 awaiting sign-off",       statColor: "text-amber-600", bg: "bg-amber-50 border-amber-200"   },
    ],
    tableTitle: "Work Orders in Inspection Stage",
    tableNote: "Sorted by scheduled date · Re-inspect jobs flagged",
    workOrders: [
      { id: "IN-0091", contractor: "Apex Roofing LLC",    region: "Atlanta",     product: "EPDM",     productColor: "risk", analyst: "P. Walsh",   submitted: "Feb 28", age: "11d ↑", ageColor: "risk", revision: "Re-inspect",   revColor: "risk", status: "Overdue",   statusColor: "risk" },
      { id: "IN-0088", contractor: "Summit Commercial",   region: "New York",   product: "TPO 80mil", productColor: "blue", analyst: "L. Santos",  submitted: "Mar 2",  age: "9d ↑",  ageColor: "risk", revision: "Re-inspect",   revColor: "risk", status: "Overdue",   statusColor: "risk" },
      { id: "IN-0084", contractor: "Trident Contractors", region: "Chicago",    product: "PVC 60mil", productColor: "blue", analyst: "P. Walsh",   submitted: "Mar 4",  age: "7d",    ageColor: "warn", revision: "None",         revColor: "muted", status: "Overdue",   statusColor: "risk" },
      { id: "IN-0081", contractor: "Keystone Roofing",   region: "New York",   product: "EPDM",     productColor: "risk", analyst: "L. Santos",  submitted: "Mar 6",  age: "5d",    ageColor: "warn", revision: "1st revision", revColor: "warn", status: "In Review", statusColor: "warn" },
      { id: "IN-0077", contractor: "Horizon Commercial", region: "Dallas",     product: "TPO 60mil", productColor: "blue", analyst: "P. Walsh",   submitted: "Mar 7",  age: "4d",    ageColor: "warn", revision: "None",         revColor: "muted", status: "In Review", statusColor: "warn" },
      { id: "IN-0074", contractor: "Atlas Roofing Co.",  region: "Los Angeles", product: "PVC 50mil", productColor: "blue", analyst: "L. Santos",  submitted: "Mar 9",  age: "2d",    ageColor: null,   revision: "None",         revColor: "muted", status: "On Track",  statusColor: "ok"   },
      { id: "IN-0071", contractor: "Meridian Systems",   region: "Houston",    product: "EPDM",     productColor: "risk", analyst: "P. Walsh",   submitted: "Mar 10", age: "1d",    ageColor: null,   revision: "None",         revColor: "muted", status: "On Track",  statusColor: "ok"   },
    ],
    woTotal: 28,
    woBadge: "6 re-inspect jobs — 3 linked to EPDM installation spec gap",
    signals: [
      { level: "warn", id: "SIG-004", title: "EPDM Installation Spec Mismatch", desc: "6 failed inspections where seam lap distances did not match product library guidance. Contractors using outdated spec sheets.", stats: ["6 failed", "+3.2d per re-inspect"], chatQuery: "What EPDM installation spec updates are needed to reduce field inspection failures related to seam lap distances?" },
      { level: "warn", id: "SIG-007", title: "Inspection Scheduling Delays", desc: "8 jobs overdue primarily due to inspector availability in high-density metros. Average wait time for rescheduling is 4.1 days.", stats: ["8 overdue", "4.1d avg reschedule"], chatQuery: "How can we optimize field inspector scheduling to reduce the 4.1 day reschedule wait time in high-density metro areas?" },
    ],
    libItems: [
      { name: "EPDM Seam Lap Distance Guide", revisions: "6 failures", desc: "Field installations not matching spec. Inspector photos show inconsistent lap distances vs product library guidance.", bg: "bg-red-50 border-red-600",     action: "→ Update seam lap spec with field-verified measurements" },
      { name: "Inspection Checklist v2.1",    revisions: "0 issues",   desc: "Current and complete. Inspectors following consistently.", bg: "bg-slate-50 border-slate-200", action: null },
      { name: "Close-Out Package Templates",  revisions: "1 issue",   desc: "Digital signature workflow broken for 2 building owners using older email systems.", bg: "bg-amber-50 border-amber-500", action: "→ Add PDF fallback for close-out sign-off" },
    ],
    trendTitle: "Cycle Time Trend — Inspection",
    trendMonths: ["Oct","Nov","Dec","Jan","Feb","Mar"],
    trendBars: [45, 48, 42, 60, 78, 90],
    trendRows: [
      { label: "Oct – Dec avg",   val: "4.8d",   color: "text-emerald-700" },
      { label: "Jan – Feb avg",   val: "5.5d",   color: "text-amber-600"   },
      { label: "March (current)", val: "6.4d ↑", color: "text-amber-600"   },
      { label: "SLA target",      val: "5.0d",   color: "text-slate-800"   },
    ],
    revCauses: [
      { label: "EPDM seam lap spec mismatch", sub: "Installation vs library gap · SIG-004", val: "6 jobs", color: "text-amber-600" },
      { label: "Inspector scheduling delay",   sub: "Metro capacity constraint · SIG-007",   val: "5 jobs", color: "text-amber-600" },
      { label: "Close-out sign-off failure",   sub: "Digital signature system issue",        val: "2 jobs", color: "text-slate-400" },
      { label: "Contractor prep incomplete",   sub: "Site not ready at inspection time",     val: "1 job",  color: "text-slate-400" },
    ],
    revInsight: "43% of failures addressable with EPDM spec update — 3 days of cycle time recovery",
    downstream: [
      { label: "Revenue — warranty activated", sub: "Upon inspection close-out",    val: "19/mo",  color: "text-emerald-700" },
      { label: "Revenue — at risk",            sub: "Jobs stalled before close-out", val: "$290K",  color: "text-amber-600"   },
      { label: "Owner satisfaction",           sub: "Based on close-out NPS",        val: "74/100", color: "text-slate-700"   },
      { label: "Re-inspect cost",              sub: "Per additional site visit",     val: "$1.8K/job", color: "text-amber-600" },
    ],
    downInsight: "Each re-inspection costs $1.8K and risks owner satisfaction — spec fix has clear ROI",
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const HEALTH_COLOR = { ok: "#2a8a4a", warn: "#f59e0b", risk: "#ef4444" } as const;

function tagColors(color: string | null): { bg: string; fg: string } {
  if (color === "risk") return { bg: "#fee2e2", fg: "#991b1b" };
  if (color === "warn") return { bg: "#fef3c7", fg: "#92400e" };
  if (color === "ok")   return { bg: "#d6f7da", fg: "#15803d" };
  if (color === "blue") return { bg: "rgba(194,203,255,0.4)", fg: "#0039c9" };
  return { bg: "#f3f4f6", fg: "#808488" };
}

function ageColor(c: string | null): string {
  if (c === "risk") return "#ef4444";
  if (c === "warn") return "#f59e0b";
  return "#808488";
}

function tailwindColorToHex(c: string): string {
  if (c.includes("red"))     return "#ef4444";
  if (c.includes("amber"))   return "#f59e0b";
  if (c.includes("emerald")) return "#2a8a4a";
  if (c.includes("2966B8") || c.includes("blue")) return "#0039c9";
  return "#121212";
}

const CARD_SHADOW = "0px 4px 24px 0px rgba(0,0,0,0.06)";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StageActivityPage() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const stageParam = params.get("stage");
  const [activeStage, setActiveStage] = useState(
    STAGE_TABS.find(s => s.key === stageParam) ? stageParam! : "proposal"
  );
  const [, navigate] = useLocation();

  useEffect(() => {
    if (stageParam && STAGE_TABS.find(s => s.key === stageParam)) {
      setActiveStage(stageParam);
    }
  }, [stageParam]);

  const handleStageSelect = (key: string) => {
    setActiveStage(key);
    navigate(`/stage-activity?stage=${key}`);
  };

  const d = STAGE_DATA[activeStage];
  const tab = STAGE_TABS.find(s => s.key === activeStage)!;
  const isHealthy = tab.health === "ok";
  const healthColor = HEALTH_COLOR[tab.health as keyof typeof HEALTH_COLOR];
  const barColor = (h: number) => h <= 40 ? "#2a8a4a" : h <= 60 ? "#c47a0a" : "#c0392b";

  return (
    <div className="min-h-screen bg-[#f8f8f8]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <PageHero
        title="Stage Activity"
        active="stage-activity"
        action={
          <div className="flex gap-2">
            <div className="bg-white rounded-[8px] px-3.5 py-2 text-[12.5px]" style={{ color: "#808488" }}>All Cities</div>
            <button className="text-white text-[13px] font-medium px-4 py-2 rounded-[8px]" style={{ background: "#0039c9" }}>↓ Export</button>
          </div>
        }
      />

      <div className="bg-[#f8f8f8] rounded-t-[24px] -mt-6">
      <div className="px-[120px] py-10">

        {/* Stage selector strip */}
        <div className="flex gap-3 mb-6">
          {STAGE_TABS.map(s => {
            const isActive = activeStage === s.key;
            const hc = HEALTH_COLOR[s.health as keyof typeof HEALTH_COLOR];
            return (
              <button
                key={s.key}
                onClick={() => handleStageSelect(s.key)}
                className="flex-1 flex flex-col items-center gap-1.5 py-4 px-3 rounded-[8px] transition-all hover:-translate-y-0.5"
                style={{
                  background: isActive ? "#0039c9" : "white",
                  boxShadow: isActive ? "0 4px 16px rgba(0,57,201,0.25)" : CARD_SHADOW,
                  borderTop: isActive ? "none" : `3px solid ${hc}`,
                }}
              >
                <span style={{ color: isActive ? "rgba(255,255,255,0.8)" : hc }}>
                  {STAGE_ICONS[s.key]}
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wide whitespace-nowrap"
                  style={{ color: isActive ? "rgba(255,255,255,0.75)" : "#808488" }}>{s.name}</span>
                <span className="text-[28px] font-normal leading-none"
                  style={{ color: isActive ? "white" : "#121212" }}>{s.count}</span>
                <span className="text-[11px]" style={{ color: isActive ? "rgba(255,255,255,0.6)" : "#808488" }}>avg {s.avgDays}d</span>
              </button>
            );
          })}
        </div>

        {/* Stage hero */}
        <div className="bg-white rounded-[8px] p-6 mb-5 border-l-[4px]"
          style={{ boxShadow: CARD_SHADOW, borderLeftColor: healthColor }}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="text-[20px] font-medium mb-1" style={{ color: "#121212" }}>{d.heroTitle.replace(/^[\p{Emoji}\s]+/u, "").trim()}</div>
              <div className="text-[13px]" style={{ color: "#808488" }}>{d.heroDesc}</div>
            </div>
            <div className="flex items-start gap-8 ml-8">
              {d.kpis.map(k => (
                <div key={k.label} className="text-center shrink-0">
                  <div className="text-[28px] font-normal leading-none mb-1"
                    style={{ color: tailwindColorToHex(k.color) }}>{k.val}</div>
                  <div className="text-[11px] max-w-[80px] leading-snug" style={{ color: "#808488" }}>{k.label}</div>
                </div>
              ))}
            </div>
            <div className="ml-6 shrink-0 px-5 py-3 rounded-[8px] text-center"
              style={{ background: d.alertBox.color.includes("red") ? "rgba(239,68,68,0.08)" : d.alertBox.color.includes("amber") ? "rgba(245,158,11,0.08)" : "rgba(42,138,74,0.08)" }}>
              <div className="text-[15px] font-semibold" style={{ color: tailwindColorToHex(d.alertBox.color) }}>{d.alertBox.title}</div>
              <div className="text-[11px] mt-0.5" style={{ color: "#808488" }}>{d.alertBox.sub}</div>
            </div>
          </div>

        </div>

        {/* Main 2-col */}
        <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: "1fr 340px" }}>

          {/* Work order table */}
          <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: CARD_SHADOW }}>
            <h3 className="text-[16px] font-medium mb-0.5" style={{ color: "#121212" }}>{d.tableTitle}</h3>
            <p className="text-[13px] mb-5" style={{ color: "#808488" }}>{d.tableNote}</p>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["Job ID","Contractor","City","Product","Assigned To","Submitted","Age","Revision","Status"].map(h => (
                    <th key={h} className="text-[10.5px] font-semibold uppercase tracking-wide px-2.5 py-2.5 text-left whitespace-nowrap"
                      style={{ color: "#808488", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.workOrders.map(wo => {
                  const pt = tagColors(wo.productColor);
                  const rt = tagColors(wo.revColor);
                  const st = tagColors(wo.statusColor);
                  return (
                    <tr key={wo.id} style={{ borderBottom: "1px solid #fafafa" }}
                      className="hover:bg-[#fafafa] transition-colors cursor-pointer"
                      onClick={() => navigate(`/work-order/${wo.id}`)}>
                      <td className="px-2.5 py-2.5 text-[12.5px] font-semibold" style={{ color: "#0039c9" }}>{wo.id}</td>
                      <td className="px-2.5 py-2.5 text-[12.5px]" style={{ color: "#404040" }}>{wo.contractor}</td>
                      <td className="px-2.5 py-2.5">
                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-[4px]"
                          style={{ background: "#f0f4ff", color: "#0039c9" }}>{wo.region}</span>
                      </td>
                      <td className="px-2.5 py-2.5">
                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-[4px]"
                          style={{ background: pt.bg, color: pt.fg }}>{wo.product}</span>
                      </td>
                      <td className="px-2.5 py-2.5 text-[12.5px]" style={{ color: "#808488" }}>{wo.analyst}</td>
                      <td className="px-2.5 py-2.5 text-[12.5px]" style={{ color: "#808488" }}>{wo.submitted}</td>
                      <td className="px-2.5 py-2.5 text-[12.5px] font-medium" style={{ color: ageColor(wo.ageColor) }}>{wo.age}</td>
                      <td className="px-2.5 py-2.5">
                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-[4px]"
                          style={{ background: rt.bg, color: rt.fg }}>{wo.revision}</span>
                      </td>
                      <td className="px-2.5 py-2.5">
                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-[4px]"
                          style={{ background: st.bg, color: st.fg }}>{wo.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1px solid #f0f0f0" }}>
              <span className="text-[12px]" style={{ color: "#808488" }}>Showing {d.workOrders.length} of {d.woTotal} · {d.woBadge}</span>
              <button className="text-[13px] font-medium transition-opacity hover:opacity-70"
                style={{ color: "#0039c9" }}>View All {d.woTotal} →</button>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-4">

            {/* Signals */}
            <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: CARD_SHADOW }}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[16px] font-medium" style={{ color: "#121212" }}>Signals</h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-[4px]"
                  style={{
                    background: d.signals.length === 0 ? "#d6f7da" : isHealthy ? "#fef3c7" : "#fee2e2",
                    color: d.signals.length === 0 ? "#15803d" : isHealthy ? "#92400e" : "#991b1b",
                  }}>
                  {d.signals.length === 0 ? "None" : `${d.signals.length} Active`}
                </span>
              </div>
              <p className="text-[12.5px] mb-4" style={{ color: "#808488" }}>Flagged at {tab.name}</p>
              {d.signals.length === 0 ? (
                <div className="text-[13px] px-3 py-2.5 rounded-[8px]"
                  style={{ background: "#d6f7da", color: "#15803d" }}>
                  No active signals — pipeline healthy.
                </div>
              ) : d.signals.map(sig => (
                <div key={sig.id} className="rounded-[8px] p-4 border-l-[3px] mb-3"
                  style={{
                    background: sig.level === "risk" ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)",
                    borderLeftColor: sig.level === "risk" ? "#ef4444" : "#f59e0b",
                  }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-[3px]"
                      style={{
                        background: sig.level === "risk" ? "#fee2e2" : "#fef3c7",
                        color: sig.level === "risk" ? "#991b1b" : "#92400e",
                      }}>● {sig.level === "risk" ? "Critical" : "Watch"}</span>
                    <span className="text-[11px]" style={{ color: "#808488" }}>{sig.id}</span>
                  </div>
                  <p className="text-[13px] font-medium mb-1" style={{ color: "#121212" }}>{sig.title}</p>
                  <p className="text-[12px] leading-snug mb-2" style={{ color: "#808488" }}>{sig.desc}</p>
                  <div className="flex gap-2 mb-2">
                    {sig.stats.map(s => <span key={s} className="text-[11.5px] font-semibold" style={{ color: "#404040" }}>{s}</span>)}
                  </div>
                  {sig.chatQuery && (
                    <button
                      onClick={() => navigate(`/?q=${encodeURIComponent(sig.chatQuery!)}`)}
                      className="text-[12px] font-medium transition-opacity hover:opacity-70"
                      style={{ color: "#0039c9" }}
                    >→ Ask AI to resolve this signal</button>
                  )}
                </div>
              ))}
            </div>

            {/* Product library context */}
            <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: CARD_SHADOW }}>
              <h3 className="text-[16px] font-medium mb-0.5" style={{ color: "#121212" }}>Product Library Impact</h3>
              <p className="text-[12.5px] mb-4" style={{ color: "#808488" }}>Spec gaps causing rework</p>
              {d.libItems.map(item => {
                const libColor = item.bg.includes("red") ? "#ef4444" : item.bg.includes("amber") ? "#f59e0b" : "#2a8a4a";
                return (
                  <div key={item.name} className="px-4 py-3 rounded-[8px] border-l-[3px] mb-3"
                    style={{ background: "#fafafa", borderLeftColor: libColor }}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[13px] font-medium" style={{ color: "#121212" }}>{item.name}</span>
                      <span className="text-[12px] font-semibold" style={{ color: libColor }}>{item.revisions}</span>
                    </div>
                    <p className="text-[11.5px] leading-snug mb-1.5" style={{ color: "#808488" }}>{item.desc}</p>
                    {item.action && (
                      <button className="text-[12px] font-medium transition-opacity hover:opacity-70"
                        style={{ color: "#0039c9" }}>{item.action}</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom 3-col */}
        <div className="grid grid-cols-3 gap-5">

          {/* Cycle time trend */}
          <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: CARD_SHADOW }}>
            <h3 className="text-[16px] font-medium mb-0.5" style={{ color: "#121212" }}>{d.trendTitle}</h3>
            <p className="text-[12.5px] mb-5" style={{ color: "#808488" }}>Oct 2025 – Mar 2026 · Avg days</p>
            <div className="flex items-end gap-1 h-[50px] mb-2">
              {d.trendBars.map((h, i) => (
                <div key={i} className="flex-1 rounded-t"
                  style={{ height: `${h}%`, background: barColor(h), opacity: h <= 40 ? 0.7 : h <= 60 ? 0.85 : 1 }} />
              ))}
            </div>
            <div className="flex justify-between mb-4" style={{ fontSize: 10.5, color: "#808488" }}>
              {d.trendMonths.map(m => <span key={m}>{m}</span>)}
            </div>
            {d.trendRows.map((r, i) => (
              <div key={r.label} className="flex justify-between items-center py-2.5"
                style={{ borderBottom: i < d.trendRows.length - 1 ? "1px solid #f0f0f0" : undefined }}>
                <span className="text-[13px]" style={{ color: "#404040" }}>{r.label}</span>
                <span className="text-[13px] font-semibold" style={{ color: tailwindColorToHex(r.color) }}>{r.val}</span>
              </div>
            ))}
          </div>

          {/* Revision causes */}
          <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: CARD_SHADOW }}>
            <h3 className="text-[16px] font-medium mb-0.5" style={{ color: "#121212" }}>Revision Causes</h3>
            <p className="text-[12.5px] mb-5" style={{ color: "#808488" }}>Why jobs are looping back in March</p>
            {d.revCauses.map((r, i) => (
              <div key={r.label} className="flex justify-between items-start py-2.5"
                style={{ borderBottom: i < d.revCauses.length - 1 ? "1px solid #f0f0f0" : undefined }}>
                <div>
                  <div className="text-[13px]" style={{ color: "#404040" }}>{r.label}</div>
                  <div className="text-[11px]" style={{ color: "#808488" }}>{r.sub}</div>
                </div>
                <span className="text-[13px] font-semibold shrink-0 ml-3" style={{ color: tailwindColorToHex(r.color) }}>{r.val}</span>
              </div>
            ))}
            <div className="mt-4 px-3 py-2.5 rounded-[8px] text-[12px]"
              style={{ background: "rgba(0,57,201,0.06)", color: "#0039c9" }}>{d.revInsight}</div>
          </div>

          {/* Downstream impact */}
          <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: CARD_SHADOW }}>
            <h3 className="text-[16px] font-medium mb-0.5" style={{ color: "#121212" }}>Downstream Impact</h3>
            <p className="text-[12.5px] mb-5" style={{ color: "#808488" }}>Delays here ripple into later stages</p>
            {d.downstream.map((r, i) => (
              <div key={r.label} className="flex justify-between items-start py-2.5"
                style={{ borderBottom: i < d.downstream.length - 1 ? "1px solid #f0f0f0" : undefined }}>
                <div>
                  <div className="text-[13px]" style={{ color: "#404040" }}>{r.label}</div>
                  <div className="text-[11px]" style={{ color: "#808488" }}>{r.sub}</div>
                </div>
                <span className="text-[13px] font-semibold shrink-0 ml-3" style={{ color: tailwindColorToHex(r.color) }}>{r.val}</span>
              </div>
            ))}
            <div className="mt-4 px-3 py-2.5 rounded-[8px] text-[12px]"
              style={{
                background: isHealthy ? "rgba(42,138,74,0.08)" : "rgba(239,68,68,0.08)",
                color: isHealthy ? "#2a8a4a" : "#ef4444",
              }}>{d.downInsight}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 flex justify-between" style={{ borderTop: "1px solid #f0f0f0" }}>
          <span className="text-[11.5px]" style={{ color: "#808488" }}>Pro Intelligence · Stage Activity · Roles & Responsibilities Matrix v1.2</span>
          <div className="flex gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-[11.5px] font-medium transition-opacity hover:opacity-70" style={{ color: "#0039c9" }}>← Operations Overview</button>
            <button onClick={() => navigate("/signals")} className="text-[11.5px] font-medium transition-opacity hover:opacity-70" style={{ color: "#0039c9" }}>Intelligence Signals</button>
            <button className="text-[11.5px] font-medium transition-opacity hover:opacity-70" style={{ color: "#0039c9" }}>Export Stage Report</button>
          </div>
        </div>
      </div>
      </div>
      <AiAssistant />
    </div>
  );
}
