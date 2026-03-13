import { useState } from "react";
import { useLocation } from "wouter";
import { PageHero } from "@/components/page-hero";
import { AiAssistant } from "@/components/ai-assistant";
import { STAGE_ICONS, StageBadge, ROLE_ICONS } from "@/lib/stage-icons";

// ── Data ─────────────────────────────────────────────────────────────────────

const SIGNALS = [
  {
    id: "SIG-002",
    level: "critical",
    stage: "📐 Assembly Letter",
    title: "Design Analyst Queue Overloaded — 14 Letters Past SLA",
    roles: ["🔬 Design Analyst", "🏗 Contractor", "💼 Sales Rep"],
    desc: "14 assembly letters have exceeded the 48-hour SLA threshold. The queue of 89 active letters is 2.1× above normal capacity for the current analyst team. Root cause is compounded by high EPDM revision rates (SIG-001) looping jobs back into the queue.",
    evidence: [
      { val: "14", valColor: "risk", label: "overdue items" },
      { val: "89", valColor: null, label: "queue depth" },
      { val: "2.1d", valColor: "risk", label: "avg vs 1d SLA" },
      { val: "$220K", valColor: "risk", label: "jobs on hold" },
    ],
    rec: "Immediate: Re-route 8 non-wind-uplift letters to secondary analyst. Medium-term: Resolve SIG-001 product gap to eliminate revision loops before they re-enter the queue.",
    libLink: null,
    status: "review",
    statusLabel: "Under Review",
    date: "Detected Mar 5, 2026",
    action: "Open in Work Orders →",
  },
  {
    id: "SIG-001",
    level: "critical",
    stage: "📚 Product Library",
    title: "EPDM Seam Tape Spec Gap — 31% Assembly Letter Revision Rate",
    roles: ["🔬 Design Analyst", "🏗 Contractor", "📐 Architect"],
    desc: "The product library is missing seam tape sub-type differentiation for EPDM systems (lap sealant vs. cover tape vs. splice tape width variants). Contractors and architects are referencing incorrect products in their assembly letter requests, triggering revisions that loop jobs back to the design analyst queue — directly fueling SIG-002.",
    evidence: [
      { val: "31%", valColor: "risk", label: "revision rate" },
      { val: "23", valColor: null, label: "letters reworked" },
      { val: "+1.4d", valColor: "risk", label: "cycle time added" },
      { val: "$48K", valColor: "risk", label: "est. revenue risk" },
    ],
    rec: "Add seam tape sub-type filtering to EPDM product library. Differentiate lap sealant, cover tape, and splice tape with compatible spec sheets and SKU cross-reference. Estimated 2-day fix; will reduce queue backlog by ~8 jobs/week.",
    libLink: "EPDM Membranes — Seam Tape variants missing sub-type data",
    status: "open",
    statusLabel: "Open",
    date: "Detected Mar 4, 2026",
    action: "Update Product Library →",
  },
  {
    id: "SIG-007",
    level: "critical",
    stage: "🔍 Inspection",
    title: "FSR Inspection Overdue — 8 Properties, Atlanta",
    roles: ["🔍 Field Service Rep", "📜 Warranty Admin", "🏢 Building Owner"],
    desc: "8 warranty inspections in Atlanta are 7+ days past their scheduled date. Two FSRs are at full capacity; no reallocation has been triggered. Building owners and contractors are receiving no status updates, risking NPS deterioration.",
    evidence: [
      { val: "8", valColor: "risk", label: "overdue jobs" },
      { val: "7+ days", valColor: "risk", label: "past scheduled" },
      { val: "$480K", valColor: null, label: "warranty fee risk" },
      { val: "Atlanta", valColor: null, label: "geography" },
    ],
    rec: "Reallocate 3 inspections to Mid-Atlantic FSR team. Trigger automated status notification to affected contractors and building owners. Escalate to regional manager if not cleared within 48 hrs.",
    libLink: null,
    status: "open",
    statusLabel: "Open",
    date: "Detected Mar 3, 2026",
    action: "Assign FSR →",
  },
  {
    id: "SIG-005",
    level: "high",
    stage: "📜 NOA / Warranty",
    title: "NOA Processing Delays — 6 Contractors Waiting >5 Days",
    roles: ["📜 Warranty Admin", "🏗 Contractor", "💼 Sales Rep"],
    desc: "Warranty Admin capacity is at 112% this month. 6 contractors have been waiting more than 5 days for NOA approval; 2 of these involve PVC multi-ply systems where warranty stacking guidance is unclear, requiring additional back-and-forth with technical services.",
    evidence: [
      { val: "6", valColor: "warn", label: "contractors waiting" },
      { val: "5+ days", valColor: null, label: "avg wait time" },
      { val: "$120K", valColor: "warn", label: "fees at risk" },
      { val: "112%", valColor: null, label: "admin capacity" },
    ],
    rec: "Prioritize the 4 standard NOAs immediately. Publish a PVC warranty stacking decision guide to prevent future escalations (see SIG-003). Flag to sales rep for contractor relationship management.",
    libLink: "PVC multi-ply warranty stacking data missing",
    status: "review",
    statusLabel: "Under Review",
    date: "Detected Mar 1, 2026",
    action: "View NOA Queue →",
  },
  {
    id: "SIG-008",
    level: "implemented",
    stage: "📚 Product Library",
    title: "TPO 90-mil Third-Party Equivalents — Cross-Reference Added",
    roles: ["🔬 Design Analyst", "📦 Submittal Specialist"],
    desc: "Third-party equivalent cross-references for 90-mil TPO were missing, causing submittal package errors. Product library updated with competitor cross-reference table. Revision rate dropped from 18% to 4% post-implementation.",
    evidence: [
      { val: "78%", valColor: "success", label: "revision reduction" },
      { val: "4%", valColor: "success", label: "new revision rate" },
      { val: "3", valColor: null, label: "docs updated" },
      { val: "12 days", valColor: null, label: "to resolve" },
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
  { key: "assembly",      name: "Assembly Letter", sub: "Design Analyst bottleneck", count: "3 signals", countColor: "#ef4444", detail: "2 critical" },
  { key: "inspection",    name: "Inspection",      sub: "FSR capacity",              count: "2 signals", countColor: "#ef4444", detail: "1 critical" },
  { key: "noa",           name: "NOA / Warranty",  sub: "Warranty Admin overload",   count: "2 signals", countColor: "#f59e0b", detail: "2 high" },
  { key: "productLibrary",name: "Product Library", sub: "Spec data gaps",            count: "3 signals", countColor: "#f59e0b", detail: "driving revisions" },
  { key: "submittal",     name: "Submittal",       sub: "Bid package errors",        count: "2 signals", countColor: "#0039c9", detail: "medium" },
];

const RISK_SCORES = [
  { name: "EPDM Seam Tape",    pct: 72, color: "#ef4444" },
  { name: "PVC Warranty",      pct: 58, color: "#f59e0b" },
  { name: "Insulation R-Value",pct: 47, color: "#f59e0b" },
  { name: "PVC Multi-Ply",     pct: 38, color: "#0039c9" },
  { name: "TPO Standard",      pct: 15, color: "#3ed851" },
];

const ROLE_IMPACT = [
  { name: "Design Analyst",   count: "5 signals", color: "#ef4444" },
  { name: "Field Service Rep",count: "3 signals", color: "#ef4444" },
  { name: "Warranty Admin",   count: "3 signals", color: "#f59e0b" },
  { name: "Contractor",       count: "4 signals", color: "#0039c9" },
  { name: "Sales Rep",        count: "2 signals", color: "#808488" },
];

const FILTERS = ["All", "Critical (3)", "High (4)", "Assembly Letter", "Inspection", "Product Library"];

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
  const [, navigate] = useLocation();

  const CARD_SHADOW = "0px 4px 24px 0px rgba(0,0,0,0.06)";

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
              { val: "3",  label: "Critical",    color: "#ef4444" },
              { val: "4",  label: "High Priority",color: "#f59e0b" },
              { val: "5",  label: "Medium",       color: "#0039c9" },
              { val: "6",  label: "Implemented",  color: "#2a8a4a" },
              { val: "12", label: "Total Open",   color: "#121212" },
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
            <div className="ml-auto bg-white rounded-[8px] px-4 py-1.5 text-[13px] flex items-center gap-2" style={{ boxShadow: CARD_SHADOW, color: "#808488" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#808488" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Search signals...
            </div>
          </div>

          {/* Main layout */}
          <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 300px" }}>

            {/* Signal cards */}
            <div className="flex flex-col gap-4">
              {SIGNALS.map(sig => {
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
                          if (sig.id === "SIG-001") navigate("/chat?q=What EPDM seam tape sub-types should be added to the product library?");
                          else if (sig.id === "SIG-005") navigate("/chat?q=What PVC multi-ply warranty stacking guidance is missing from the product library?");
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
                          if (sig.id === "SIG-001") navigate("/chat?q=What EPDM seam tape sub-types should be added to the product library?");
                          else if (sig.id === "SIG-002") navigate("/stage-activity?stage=assembly");
                          else if (sig.id === "SIG-005") navigate("/stage-activity?stage=noa");
                          else if (sig.id === "SIG-007") navigate("/field-experience");
                          else if (sig.id === "SIG-008") navigate("/chat?q=Show me the TPO 90-mil third-party equivalent cross-reference that was added to the product library");
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
