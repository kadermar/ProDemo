import { useState } from "react";
import { useLocation } from "wouter";
import { PageHero } from "@/components/page-hero";
import { AiAssistant } from "@/components/ai-assistant";
import { STAGE_ICONS, StageBadge, ROLE_ICONS } from "@/lib/stage-icons";

// ── Data ─────────────────────────────────────────────────────────────────────

const SIGNALS = [
  // ── Critical ────────────────────────────────────────────────────────────────
  {
    id: "SIG-001",
    level: "critical",
    stage: "📚 Product Library",
    title: "EPDM Seam Tape Spec Gap — 31% Assembly Letter Revision Rate",
    roles: ["🔬 Design Analyst", "🏗 Contractor", "📐 Architect"],
    desc: "The product library is missing seam tape sub-type differentiation for EPDM systems (lap sealant vs. cover tape vs. splice tape width variants). Contractors and architects are referencing incorrect products in their assembly letter requests, triggering revisions that loop jobs back to the design analyst queue — directly fueling SIG-002.",
    evidence: [
      { val: "31%",  valColor: "risk", label: "revision rate"      },
      { val: "23",   valColor: null,   label: "letters reworked"   },
      { val: "+1.4d",valColor: "risk", label: "cycle time added"   },
      { val: "$48K", valColor: "risk", label: "est. revenue risk"  },
    ],
    rec: "Add seam tape sub-type filtering to EPDM product library. Differentiate lap sealant, cover tape, and splice tape with compatible spec sheets and SKU cross-reference. Estimated 2-day fix; will reduce queue backlog by ~8 jobs/week.",
    libLink: "EPDM Membranes — Seam Tape variants missing sub-type data",
    status: "open",
    statusLabel: "Open",
    date: "Detected Mar 4, 2026",
    action: "Update Product Library →",
  },
  {
    id: "SIG-002",
    level: "critical",
    stage: "📐 Assembly Letter",
    title: "Design Analyst Queue Overloaded — 14 Letters Past SLA",
    roles: ["🔬 Design Analyst", "🏗 Contractor", "💼 Sales Rep"],
    desc: "14 assembly letters have exceeded the 48-hour SLA threshold. The queue of 89 active letters is 2.1× above normal capacity for the current analyst team. Root cause is compounded by high EPDM revision rates (SIG-001) looping jobs back into the queue.",
    evidence: [
      { val: "14",    valColor: "risk", label: "overdue items" },
      { val: "89",    valColor: null,   label: "queue depth"   },
      { val: "2.1d",  valColor: "risk", label: "avg vs 1d SLA" },
      { val: "$220K", valColor: "risk", label: "jobs on hold"  },
    ],
    rec: "Immediate: Re-route 8 non-wind-uplift letters to secondary analyst. Medium-term: Resolve SIG-001 product gap to eliminate revision loops before they re-enter the queue.",
    libLink: null,
    status: "review",
    statusLabel: "Under Review",
    date: "Detected Mar 5, 2026",
    action: "Open in Work Orders →",
  },
  {
    id: "SIG-007",
    level: "critical",
    stage: "🔍 Inspection",
    title: "FSR Inspection Overdue — 8 Properties, Atlanta",
    roles: ["🔍 Field Service Rep", "📜 Warranty Admin", "🏢 Building Owner"],
    desc: "8 warranty inspections in Atlanta are 7+ days past their scheduled date. Two FSRs are at full capacity; no reallocation has been triggered. Building owners and contractors are receiving no status updates, risking NPS deterioration.",
    evidence: [
      { val: "8",     valColor: "risk", label: "overdue jobs"      },
      { val: "7+ days",valColor:"risk", label: "past scheduled"    },
      { val: "$480K", valColor: null,   label: "warranty fee risk" },
      { val: "Atlanta",valColor: null,  label: "geography"         },
    ],
    rec: "Reallocate 3 inspections to Mid-Atlantic FSR team. Trigger automated status notification to affected contractors and building owners. Escalate to regional manager if not cleared within 48 hrs.",
    libLink: null,
    status: "open",
    statusLabel: "Open",
    date: "Detected Mar 3, 2026",
    action: "Assign FSR →",
  },

  // ── High ─────────────────────────────────────────────────────────────────────
  {
    id: "SIG-003",
    level: "high",
    stage: "📜 NOA / Warranty",
    title: "PVC Multi-Ply Warranty Re-Review Backlog — 12 Applications",
    roles: ["📜 Warranty Admin", "🔬 Design Analyst", "🏗 Contractor"],
    desc: "12 PVC multi-ply NOA applications have been flagged for second technical review because warranty stacking rules for these systems are not documented in the product library. Analysts are making ad-hoc calls to the product team, adding 1–2 days per application and consuming capacity needed elsewhere.",
    evidence: [
      { val: "12",   valColor: "warn", label: "in re-review"   },
      { val: "+1.8d",valColor: "warn", label: "avg delay each" },
      { val: "$95K", valColor: "warn", label: "fees delayed"   },
      { val: "PVC",  valColor: null,   label: "system type"    },
    ],
    rec: "Publish a PVC multi-ply warranty stacking decision guide to the product library. Establish a fast-track review path for standard multi-ply configurations. Estimated 3-day documentation effort eliminates ad-hoc escalations entirely.",
    libLink: "PVC multi-ply warranty stacking rules not documented",
    status: "open",
    statusLabel: "Open",
    date: "Detected Feb 28, 2026",
    action: "View Re-Review Queue →",
  },
  {
    id: "SIG-004",
    level: "high",
    stage: "🔍 Inspection",
    title: "EPDM Installation Spec Mismatch — 6 Failed Inspections",
    roles: ["🔍 Field Service Rep", "🏗 Contractor", "🔬 Design Analyst"],
    desc: "6 inspections have failed because seam lap distances in the field did not match the product library's EPDM guidance. Contractors are using outdated spec sheets downloaded before the Feb 2026 library update. Each failure requires rescheduling and adds ~3.2 days plus $1.8K re-inspection cost.",
    evidence: [
      { val: "6",     valColor: "warn", label: "failed inspections"  },
      { val: "+3.2d", valColor: "warn", label: "per re-inspection"   },
      { val: "$10.8K",valColor: "warn", label: "re-inspect cost"     },
      { val: "EPDM",  valColor: null,   label: "system type"         },
    ],
    rec: "Push updated EPDM seam lap spec sheets to all active contractors via the portal. Add a version-mismatch warning to the product library download flow. Cross-reference with SIG-001 — same root-cause library gap.",
    libLink: "EPDM seam lap distance spec out of date in library",
    status: "open",
    statusLabel: "Open",
    date: "Detected Mar 2, 2026",
    action: "View Inspection Queue →",
  },
  {
    id: "SIG-005",
    level: "high",
    stage: "📜 NOA / Warranty",
    title: "NOA Processing Delays — 6 Contractors Waiting >5 Days",
    roles: ["📜 Warranty Admin", "🏗 Contractor", "💼 Sales Rep"],
    desc: "Warranty Admin capacity is at 112% this month. 6 contractors have been waiting more than 5 days for NOA approval; 2 of these involve PVC multi-ply systems where warranty stacking guidance is unclear, requiring additional back-and-forth with technical services.",
    evidence: [
      { val: "6",     valColor: "warn", label: "contractors waiting" },
      { val: "5+ days",valColor: null,  label: "avg wait time"      },
      { val: "$120K", valColor: "warn", label: "fees at risk"        },
      { val: "112%",  valColor: null,   label: "admin capacity"      },
    ],
    rec: "Prioritize the 4 standard NOAs immediately. Publish a PVC warranty stacking decision guide to prevent future escalations (see SIG-003). Flag to sales rep for contractor relationship management.",
    libLink: "PVC multi-ply warranty stacking data missing",
    status: "review",
    statusLabel: "Under Review",
    date: "Detected Mar 1, 2026",
    action: "View NOA Queue →",
  },
  {
    id: "SIG-009",
    level: "high",
    stage: "📐 Assembly Letter",
    title: "Insulation R-Value / ASHRAE 90.1 Data Gap — 9 Jobs Affected",
    roles: ["🔬 Design Analyst", "📐 Architect", "🏗 Contractor"],
    desc: "The product library is missing ASHRAE 90.1-2022 R-value compliance data for polyisocyanurate insulation in climate zones 5–7. 9 assembly letters have stalled at the design analyst review step because analysts cannot confirm code compliance without pulling the standard manually.",
    evidence: [
      { val: "9",    valColor: "warn", label: "jobs stalled"      },
      { val: "+0.9d",valColor: "warn", label: "avg added per job" },
      { val: "CZ 5–7",valColor: null,  label: "climate zones"     },
      { val: "$62K", valColor: "warn", label: "fees at risk"      },
    ],
    rec: "Add ASHRAE 90.1-2022 R-value tables for polyiso insulation, segmented by climate zone, to the product library. Attach compliance quick-reference to each affected product SKU. Estimated 1-day fix.",
    libLink: "Polyiso insulation R-value / ASHRAE 90.1-2022 data missing",
    status: "open",
    statusLabel: "Open",
    date: "Detected Mar 6, 2026",
    action: "Update Product Library →",
  },

  // ── Medium ───────────────────────────────────────────────────────────────────
  {
    id: "SIG-006",
    level: "medium",
    stage: "📦 Submittal",
    title: "Submittal Package Version Mismatch — 3 Packages Outdated",
    roles: ["🔬 Design Analyst", "📦 Submittal Specialist", "🏗 Contractor"],
    desc: "3 submittal packages were sent to contractors referencing an older spec revision. The product library was updated in late February but the submittal wizard cached the prior version. While no rejections have occurred yet, the mismatch creates confusion at the Quote stage if the contractor references the wrong spec sheet.",
    evidence: [
      { val: "3",     valColor: null, label: "packages affected" },
      { val: "+0.3d", valColor: null, label: "avg delay if caught"},
      { val: "Feb",   valColor: null, label: "library update month"},
      { val: "TPO",   valColor: null, label: "system type"       },
    ],
    rec: "Force-refresh submittal wizard cache against current product library. Add a spec-version timestamp to all generated packages so analysts can spot mismatches at a glance.",
    libLink: null,
    status: "open",
    statusLabel: "Open",
    date: "Detected Mar 7, 2026",
    action: "View Submittal Queue →",
  },
  {
    id: "SIG-010",
    level: "medium",
    stage: "📋 Proposal",
    title: "Incomplete Submission Forms — 6 Contractors Missing Required Fields",
    roles: ["🏗 Contractor", "💼 Sales Rep", "🔬 Design Analyst"],
    desc: "6 active proposals are missing required job-scope fields (roof area, deck type, or drainage configuration) needed to generate an accurate assembly letter. Submissions with missing data create a back-and-forth correction loop before the job can advance, adding half a day to average cycle time.",
    evidence: [
      { val: "6",     valColor: null, label: "incomplete forms"   },
      { val: "+0.5d", valColor: null, label: "avg cycle added"    },
      { val: "3",     valColor: null, label: "field types missing"},
      { val: "Low",   valColor: null, label: "revenue risk"       },
    ],
    rec: "Add inline validation to the contractor proposal submission form for the 3 most-missed fields. Trigger an automated reminder email 24 hours after an incomplete submission. Sales rep should follow up within 48 hours.",
    libLink: null,
    status: "open",
    statusLabel: "Open",
    date: "Detected Mar 8, 2026",
    action: "View Proposals →",
  },
  {
    id: "SIG-011",
    level: "medium",
    stage: "💬 Quote",
    title: "PVC Multi-Ply Warranty Stacking Guidance Missing — 5 Quotes Stalled",
    roles: ["💼 Sales Rep", "🏗 Contractor", "💲 Pricing Team"],
    desc: "5 quotes are stalled because sales reps cannot confirm warranty stacking eligibility for PVC multi-ply roofing systems without calling the product team directly. The product library does not document stacking rules for this configuration, creating delays and inconsistent answers to contractors.",
    evidence: [
      { val: "5",     valColor: null, label: "quotes stalled"   },
      { val: "+0.8d", valColor: null, label: "avg delay per job"},
      { val: "PVC",   valColor: null, label: "system type"      },
      { val: "$38K",  valColor: null, label: "fees on hold"     },
    ],
    rec: "Add PVC multi-ply warranty stacking decision table to the product library. Cross-reference with SIG-003 — same documentation gap appearing at two pipeline stages.",
    libLink: "PVC multi-ply warranty stacking rules not documented",
    status: "open",
    statusLabel: "Open",
    date: "Detected Mar 9, 2026",
    action: "View Quote Queue →",
  },
  {
    id: "SIG-012",
    level: "medium",
    stage: "📚 Product Library",
    title: "IBC 2021 Compliance References Outdated — 3 Western States",
    roles: ["🔬 Design Analyst", "📐 Architect", "📦 Submittal Specialist"],
    desc: "Code compliance references in the product library for California, Oregon, and Nevada still reflect IBC 2018 section numbers. IBC 2021 was adopted by all three states in Q4 2025. Analysts catching this manually are adding correction steps to submittal reviews; those who miss it risk producing non-compliant packages.",
    evidence: [
      { val: "3",    valColor: null, label: "states affected"    },
      { val: "IBC",  valColor: null, label: "code standard"      },
      { val: "2021", valColor: null, label: "current edition"     },
      { val: "6 SKUs",valColor: null, label: "docs to update"    },
    ],
    rec: "Update IBC 2021 section cross-references for all affected product SKUs sold in CA, OR, and NV. Flag the 6 specific SKUs for expedited review. Estimated 1-day update.",
    libLink: "IBC 2021 compliance section references need update (CA, OR, NV)",
    status: "open",
    statusLabel: "Open",
    date: "Detected Mar 10, 2026",
    action: "Update Product Library →",
  },

  // ── Implemented ───────────────────────────────────────────────────────────────
  {
    id: "SIG-008",
    level: "implemented",
    stage: "📚 Product Library",
    title: "TPO 90-mil Third-Party Equivalents — Cross-Reference Added",
    roles: ["🔬 Design Analyst", "📦 Submittal Specialist"],
    desc: "Third-party equivalent cross-references for 90-mil TPO were missing, causing submittal package errors. Product library updated with competitor cross-reference table. Revision rate dropped from 18% to 4% post-implementation.",
    evidence: [
      { val: "78%",    valColor: "success", label: "revision reduction" },
      { val: "4%",     valColor: "success", label: "new revision rate"  },
      { val: "3",      valColor: null,      label: "docs updated"       },
      { val: "12 days",valColor: null,      label: "to resolve"         },
    ],
    rec: "",
    libLink: null,
    status: "implemented",
    statusLabel: "Implemented Feb 20",
    date: "Closed 19 days ago",
    action: "View Change Log →",
  },
];

const STAGE_BREAKDOWN = [
  { key: "assembly",      name: "Assembly Letter", sub: "Design Analyst bottleneck", count: "2 signals", countColor: "#ef4444", detail: "1 critical, 1 high"    },
  { key: "inspection",    name: "Inspection",      sub: "FSR capacity & spec gap",   count: "2 signals", countColor: "#ef4444", detail: "1 critical, 1 high"    },
  { key: "noa",           name: "NOA / Warranty",  sub: "Warranty Admin overload",   count: "2 signals", countColor: "#f59e0b", detail: "2 high"                },
  { key: "productLibrary",name: "Product Library", sub: "Spec & compliance gaps",    count: "3 signals", countColor: "#ef4444", detail: "1 critical, 1 medium"  },
  { key: "submittal",     name: "Submittal",       sub: "Version & compliance",      count: "1 signal",  countColor: "#0039c9", detail: "medium"                },
  { key: "quote",         name: "Quote",           sub: "Warranty stacking unknown", count: "1 signal",  countColor: "#0039c9", detail: "medium"                },
  { key: "proposal",      name: "Proposal",        sub: "Incomplete submission data",count: "1 signal",  countColor: "#808488", detail: "medium"                },
];

const RISK_SCORES = [
  { name: "EPDM Seam Tape",    pct: 72, color: "#ef4444" },
  { name: "PVC Warranty",      pct: 58, color: "#f59e0b" },
  { name: "Insulation R-Value",pct: 47, color: "#f59e0b" },
  { name: "IBC 2021 Compliance",pct: 35, color: "#0039c9" },
  { name: "TPO Standard",      pct: 8,  color: "#3ed851" },
];

const ROLE_IMPACT = [
  { name: "Design Analyst",   count: "7 signals", color: "#ef4444" },
  { name: "Contractor",       count: "5 signals", color: "#ef4444" },
  { name: "Warranty Admin",   count: "3 signals", color: "#f59e0b" },
  { name: "Field Service Rep",count: "2 signals", color: "#f59e0b" },
  { name: "Sales Rep",        count: "3 signals", color: "#0039c9" },
];

const criticalCount    = SIGNALS.filter(s => s.level === "critical").length;
const highCount        = SIGNALS.filter(s => s.level === "high").length;
const mediumCount      = SIGNALS.filter(s => s.level === "medium").length;
const implementedCount = SIGNALS.filter(s => s.level === "implemented").length;
const totalOpen        = SIGNALS.filter(s => s.level !== "implemented").length;

const FILTERS = [
  "All",
  `Critical (${criticalCount})`,
  `High (${highCount})`,
  `Medium (${mediumCount})`,
  `Implemented (${implementedCount})`,
];

function matchesFilter(sig: typeof SIGNALS[0], filter: string): boolean {
  if (filter === "All") return true;
  if (filter.startsWith("Critical"))    return sig.level === "critical";
  if (filter.startsWith("High"))        return sig.level === "high";
  if (filter.startsWith("Medium"))      return sig.level === "medium";
  if (filter.startsWith("Implemented")) return sig.level === "implemented";
  return true;
}

function matchesSearch(sig: typeof SIGNALS[0], query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    sig.title.toLowerCase().includes(q) ||
    sig.desc.toLowerCase().includes(q) ||
    sig.stage.toLowerCase().includes(q) ||
    sig.id.toLowerCase().includes(q) ||
    sig.roles.some(r => r.toLowerCase().includes(q))
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function evidenceColor(c: string | null) {
  if (c === "risk") return "#ef4444";
  if (c === "warn") return "#f59e0b";
  if (c === "success") return "#2a8a4a";
  return "#121212";
}

function levelColor(level: string) {
  if (level === "critical")    return { border: "#ef4444", bg: "rgba(239,68,68,0.06)"  };
  if (level === "high")        return { border: "#f59e0b", bg: "rgba(245,158,11,0.04)" };
  if (level === "implemented") return { border: "#3ed851", bg: "rgba(62,216,81,0.04)"  };
  return { border: "#0039c9", bg: "rgba(0,57,201,0.04)" };
}

function levelBadge(level: string): { bg: string; fg: string; label: string } {
  if (level === "critical")    return { bg: "#fee2e2", fg: "#991b1b", label: "● Critical" };
  if (level === "high")        return { bg: "#fef3c7", fg: "#92400e", label: "● High" };
  if (level === "implemented") return { bg: "#d6f7da", fg: "#15803d", label: "✓ Implemented" };
  return { bg: "rgba(194,203,255,0.4)", fg: "#0039c9", label: "● Medium" };
}

function statusBadge(s: string): { bg: string; fg: string } {
  if (s === "open")        return { bg: "#fef3c7", fg: "#92400e" };
  if (s === "review")      return { bg: "rgba(194,203,255,0.4)", fg: "#0039c9" };
  if (s === "implemented") return { bg: "#d6f7da", fg: "#15803d" };
  return { bg: "#f3f4f6", fg: "#808488" };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SignalsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const CARD_SHADOW = "0px 4px 24px 0px rgba(0,0,0,0.06)";

  const visibleSignals = SIGNALS.filter(
    sig => matchesFilter(sig, activeFilter) && matchesSearch(sig, searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#f8f8f8]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <PageHero
        title="Intelligence Signals"
        active="signals"
        action={
          <button className="text-white text-[13px] font-medium px-4 py-2 rounded-[8px]" style={{ background: "#0039c9" }}>
            + Flag Signal
          </button>
        }
      />

      <div className="bg-[#f8f8f8] rounded-t-[24px] -mt-6">
        <div className="px-[120px] py-10">

          {/* Summary KPI strip */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {[
              { val: String(criticalCount),    label: "Critical",      color: "#ef4444" },
              { val: String(highCount),         label: "High Priority", color: "#f59e0b" },
              { val: String(mediumCount),       label: "Medium",        color: "#0039c9" },
              { val: String(implementedCount),  label: "Implemented",   color: "#2a8a4a" },
              { val: String(totalOpen),         label: "Total Open",    color: "#121212" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-[8px] px-6 py-5" style={{ boxShadow: CARD_SHADOW }}>
                <div className="text-[32px] font-normal leading-none mb-2" style={{ color: s.color }}>{s.val}</div>
                <div className="text-[13px]" style={{ color: "#808488" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="px-4 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors"
                style={{
                  background: activeFilter === f ? "#0039c9" : "white",
                  color: activeFilter === f ? "white" : "#808488",
                  boxShadow: activeFilter === f ? undefined : CARD_SHADOW,
                }}
              >
                {f}
              </button>
            ))}
            <div className="ml-auto bg-white rounded-[8px] px-4 py-1.5 text-[13px] flex items-center gap-2" style={{ boxShadow: CARD_SHADOW }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#808488" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search signals..."
                className="outline-none bg-transparent w-40"
                style={{ color: "#121212" }}
              />
            </div>
          </div>

          {/* Main layout */}
          <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 300px" }}>

            {/* Signal cards */}
            <div className="flex flex-col gap-4">
              {visibleSignals.length === 0 && (
                <div className="bg-white rounded-[8px] p-10 text-center" style={{ boxShadow: CARD_SHADOW, color: "#808488" }}>
                  No signals match your filter or search.
                </div>
              )}
              {visibleSignals.map(sig => {
                const lc = levelColor(sig.level);
                const lb = levelBadge(sig.level);
                const sb = statusBadge(sig.status);
                return (
                  <div
                    key={sig.id}
                    className="bg-white rounded-[8px] p-6 border-l-[3px]"
                    style={{ boxShadow: CARD_SHADOW, borderLeftColor: lc.border, background: `white` }}
                  >
                    {/* Top row */}
                    <div className="flex items-center gap-2.5 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-[4px]"
                        style={{ background: lb.bg, color: lb.fg }}>
                        {lb.label}
                      </span>
                      <StageBadge stage={sig.stage} className="text-[11px] px-2 py-0.5 rounded-[4px] border" style={{ color: "#808488", borderColor: "#e5e5e5", background: "#fafafa" }} />
                      <span className="text-[11px] ml-auto" style={{ color: "#808488" }}>{sig.id}</span>
                    </div>

                    {/* Title */}
                    <p className="text-[15px] font-semibold mb-2.5" style={{ color: "#121212" }}>{sig.title}</p>

                    {/* Description */}
                    <p className="text-[13px] leading-relaxed mb-4" style={{ color: "#404040" }}>{sig.desc}</p>

                    {/* Evidence strip */}
                    <div className="grid grid-cols-4 rounded-[8px] overflow-hidden mb-4" style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}>
                      {sig.evidence.map((e, i) => (
                        <div key={i} className="px-4 py-3 text-center" style={{ borderRight: i < sig.evidence.length - 1 ? "1px solid #f0f0f0" : undefined }}>
                          <div className="text-[18px] font-semibold leading-none mb-1" style={{ color: evidenceColor(e.valColor) }}>{e.val}</div>
                          <div className="text-[10.5px]" style={{ color: "#808488" }}>{e.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Library link */}
                    {sig.libLink && (
                      <div
                        className="flex items-center gap-2 px-3 py-2.5 rounded-[8px] mb-4 cursor-pointer transition-opacity hover:opacity-80"
                        style={{ background: "rgba(0,57,201,0.06)", border: "1px solid rgba(0,57,201,0.12)" }}
                        onClick={() => {
                          if      (sig.id === "SIG-001") navigate("/chat?q=What EPDM seam tape sub-types should be added to the product library?");
                          else if (sig.id === "SIG-003") navigate("/chat?q=What PVC multi-ply warranty stacking rules need to be added to resolve the NOA re-review backlog?");
                          else if (sig.id === "SIG-004") navigate("/chat?q=What EPDM seam lap distance spec updates are needed in the product library?");
                          else if (sig.id === "SIG-005") navigate("/chat?q=What PVC multi-ply warranty stacking guidance is missing from the product library?");
                          else if (sig.id === "SIG-009") navigate("/chat?q=What ASHRAE 90.1-2022 R-value data is missing for polyiso insulation in the product library?");
                          else if (sig.id === "SIG-011") navigate("/chat?q=What PVC multi-ply warranty stacking guidance is needed to unblock stalled quotes?");
                          else if (sig.id === "SIG-012") navigate("/chat?q=Which IBC 2021 compliance references need updating in the product library for California, Oregon, and Nevada?");
                        }}
                      >
                        <span className="text-[15px]">📚</span>
                        <span className="text-[12px] font-medium flex-1" style={{ color: "#0039c9" }}>Linked to Product Library: {sig.libLink}</span>
                        <span className="text-[12px]" style={{ color: "#0039c9" }}>→</span>
                      </div>
                    )}

                    {/* Recommendation */}
                    {sig.rec && (
                      <div className="text-[12.5px] px-4 py-3 rounded-[8px] border-l-[3px] mb-4"
                        style={{ background: "#fafafa", borderLeftColor: "#0039c9", color: "#404040" }}>
                        → {sig.rec}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "#f0f0f0" }}>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-[4px]"
                        style={{ background: sb.bg, color: sb.fg }}>{sig.statusLabel}</span>
                      <span className="text-[11.5px]" style={{ color: "#808488" }}>{sig.date}</span>
                      <button
                        className="text-[13px] font-medium transition-opacity hover:opacity-70"
                        style={{ color: "#0039c9" }}
                        onClick={() => {
                          if      (sig.id === "SIG-001") navigate("/chat?q=What EPDM seam tape sub-types should be added to the product library?");
                          else if (sig.id === "SIG-002") navigate("/stage-activity?stage=assembly");
                          else if (sig.id === "SIG-003") navigate("/stage-activity?stage=noa");
                          else if (sig.id === "SIG-004") navigate("/stage-activity?stage=inspection");
                          else if (sig.id === "SIG-005") navigate("/stage-activity?stage=noa");
                          else if (sig.id === "SIG-006") navigate("/stage-activity?stage=submittal");
                          else if (sig.id === "SIG-007") navigate("/field-experience");
                          else if (sig.id === "SIG-008") navigate("/chat?q=Show me the TPO 90-mil third-party equivalent cross-reference that was added to the product library");
                          else if (sig.id === "SIG-009") navigate("/chat?q=What ASHRAE 90.1-2022 R-value data is missing for polyiso insulation in the product library?");
                          else if (sig.id === "SIG-010") navigate("/stage-activity?stage=proposal");
                          else if (sig.id === "SIG-011") navigate("/stage-activity?stage=quote");
                          else if (sig.id === "SIG-012") navigate("/chat?q=Which IBC 2021 compliance references need updating in the product library for California, Oregon, and Nevada?");
                        }}
                      >{sig.action}</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right sidebar */}
            <div className="flex flex-col gap-4">

              {/* Signals by stage */}
              <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: CARD_SHADOW }}>
                <h3 className="text-[16px] font-medium mb-1" style={{ color: "#121212" }}>By Pipeline Stage</h3>
                <p className="text-[12px] mb-4" style={{ color: "#808488" }}>Active signal distribution</p>
                <div className="flex flex-col gap-0">
                  {STAGE_BREAKDOWN.map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between py-3"
                      style={{ borderBottom: i < STAGE_BREAKDOWN.length - 1 ? "1px solid #f0f0f0" : undefined }}>
                      <div>
                        <div className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "#121212" }}>
                          <span style={{ color: "#808488" }}>{STAGE_ICONS[s.key]}</span>
                          {s.name}
                        </div>
                        <div className="text-[11px] mt-0.5" style={{ color: "#808488" }}>{s.sub}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[14px] font-semibold" style={{ color: s.countColor }}>{s.count}</div>
                        <div className="text-[11px]" style={{ color: "#808488" }}>{s.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product library risk */}
              <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: CARD_SHADOW }}>
                <h3 className="text-[16px] font-medium mb-1" style={{ color: "#121212" }}>Product Library Risk</h3>
                <p className="text-[12px] mb-4" style={{ color: "#808488" }}>Gap severity causing rework</p>
                <div className="flex flex-col gap-3">
                  {RISK_SCORES.map(r => (
                    <div key={r.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-medium" style={{ color: "#404040" }}>{r.name}</span>
                        <span className="text-[12px] font-semibold" style={{ color: r.color }}>{r.pct}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#f0f0f0" }}>
                        <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roles impacted */}
              <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: CARD_SHADOW }}>
                <h3 className="text-[16px] font-medium mb-1" style={{ color: "#121212" }}>Roles Most Impacted</h3>
                <p className="text-[12px] mb-4" style={{ color: "#808488" }}>Signals per role</p>
                <div className="flex flex-col gap-2">
                  {ROLE_IMPACT.map(r => (
                    <div key={r.name} className="flex items-center justify-between px-3 py-2.5 rounded-[8px]"
                      style={{ background: "#fafafa" }}>
                      <span className="inline-flex items-center gap-2 text-[13px]" style={{ color: "#404040" }}>
                        <span style={{ color: "#808488" }}>{ROLE_ICONS[r.name]}</span>
                        {r.name}
                      </span>
                      <span className="text-[13px] font-semibold" style={{ color: r.color }}>{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 flex justify-between" style={{ borderTop: "1px solid #f0f0f0" }}>
            <span className="text-[11.5px]" style={{ color: "#808488" }}>Pro Intelligence · Signals refresh every 6 hours · Fiscal Year 2026</span>
            <div className="flex gap-4">
              <button onClick={() => navigate("/dashboard")} className="text-[11.5px] font-medium transition-opacity hover:opacity-70" style={{ color: "#0039c9" }}>← Operations Overview</button>
              <button onClick={() => navigate("/stage-activity")} className="text-[11.5px] font-medium transition-opacity hover:opacity-70" style={{ color: "#0039c9" }}>Stage Activity</button>
              <button className="text-[11.5px] font-medium transition-opacity hover:opacity-70" style={{ color: "#0039c9" }}>Export Signals</button>
            </div>
          </div>

        </div>
      </div>
      <AiAssistant />
    </div>
  );
}
