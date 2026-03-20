import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { getWorkOrder, STAGE_ORDER, STAGE_LABELS } from "@/data/work-orders";
import { ProNav } from "@/components/pro-nav";
import { AiAssistant } from "@/components/ai-assistant";
import building1 from "@assets/building1.jpg";
import building2 from "@assets/building2.jpg";
import building3 from "@assets/building3.jpg";
import { STAGE_ICONS } from "@/lib/stage-icons";
import aiFabIcon from "@assets/ai-fab-icon.svg";

// ── Building photos (cycled by work order ID) ────────────────────────────────
const BUILDING_IMGS = [building1, building2, building3];

function buildingImg(id: string): string {
  const n = parseInt(id.replace(/\D/g, "").slice(-3) || "0", 10);
  return BUILDING_IMGS[n % BUILDING_IMGS.length];
}

// ── Stable local assets ──
const svg = (s: string) => `data:image/svg+xml;base64,${btoa(s)}`;
const ASSET_SEND      = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2L2 8l6 4 4 6 6-16z"/></svg>');
const ASSET_UPLOAD    = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13V3m0 0L6 7m4-4l4 4"/><path d="M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2"/></svg>');
const ASSET_DOC_DL    = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3v10m0 0l-4-4m4 4l4-4"/><path d="M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2"/></svg>');
const ASSET_DOC_MORE  = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 20" fill="currentColor"><circle cx="2" cy="4" r="1.5"/><circle cx="2" cy="10" r="1.5"/><circle cx="2" cy="16" r="1.5"/></svg>');
const ASSET_CHECK     = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" fill="none" stroke="#3ed851" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,7 6,11 12,3"/></svg>');
const ASSET_CARLY     = aiFabIcon;
const ASSET_BACK      = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="7,1 3,5.5 7,10"/></svg>');
const ASSET_VIEW_ALL  = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,1 7,6 1,11"/></svg>');
const ASSET_STATUS_AL       = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="#3b5bdb" stroke-width="1.5"><rect x="3" y="2" width="14" height="16" rx="2"/><line x1="7" y1="7" x2="13" y2="7"/><line x1="7" y1="10" x2="13" y2="10"/><line x1="7" y1="13" x2="10" y2="13"/></svg>');
const ASSET_STATUS_SUB      = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="#f59e0b" stroke-width="1.5"><rect x="3" y="2" width="14" height="16" rx="2"/><polyline points="7,10 9,12 13,8" stroke-linecap="round" stroke-linejoin="round"/></svg>');
const ASSET_STATUS_INS      = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="#8b5cf6" stroke-width="1.5"><circle cx="10" cy="9" r="5"/><circle cx="10" cy="9" r="2" fill="#8b5cf6"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="10" y1="14" x2="10" y2="16"/><line x1="3" y1="9" x2="5" y2="9"/><line x1="15" y1="9" x2="17" y2="9"/></svg>');
const ASSET_STATUS_COMPLETE = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#3ed851"/><polyline points="9,16 14,21 23,11" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');

// ── Helpers ───────────────────────────────────────────────────────────────────

type BadgeType = "complete" | "in-progress" | "not-started";

function StatusBadge({ type }: { type: BadgeType }) {
  const styles: Record<BadgeType, { bg: string; text: string; label: string }> = {
    "complete":    { bg: "#d6f7da", text: "#15803d", label: "Complete" },
    "in-progress": { bg: "#f6f7fa", text: "#404a62", label: "In Progress" },
    "not-started": { bg: "#f6f7fa", text: "#404a62", label: "Not Started" },
  };
  const s = styles[type];
  return (
    <div className="inline-flex items-start rounded-[80px] px-[10px] py-[3px]" style={{ background: s.bg }}>
      <span className="text-[12px] font-medium whitespace-nowrap" style={{ color: s.text }}>{s.label}</span>
    </div>
  );
}

interface StepCardProps {
  status: BadgeType;
  title: string;
  desc: string;
  footer?: "verified" | "carly" | "action";
  verifier?: string;
  actionLabel?: string;
}

function StepCard({ status, title, desc, footer = "verified", verifier, actionLabel }: StepCardProps) {
  return (
    <div className="flex flex-col gap-3 flex-1 min-w-0">
      <StatusBadge type={status} />
      <p className="text-[18px] font-medium leading-[24px] text-[#404a62] whitespace-nowrap">{title}</p>
      <p className="text-[14px] font-normal text-[#404a62] leading-normal" style={{ maxWidth: 233 }}>{desc}</p>
      {footer === "verified" && verifier && (
        <div className="flex items-center gap-2">
          <img src={ASSET_CHECK} alt="" style={{ width: 14, height: 14 }} />
          <span className="text-[12px] text-[#828282]">Verified by {verifier}</span>
        </div>
      )}
      {footer === "carly" && (
        <div className="flex items-center gap-2">
          <img src={ASSET_CARLY} alt="" style={{ width: 14, height: 13 }} />
          <span className="text-[12px] text-[#0a84ff]">Carly can help</span>
        </div>
      )}
      {footer === "action" && actionLabel && (
        <div className="inline-flex items-center justify-center px-2 py-0 rounded-[4px] bg-[#0a84ff]">
          <span className="text-[12px] text-white leading-[20px]">{actionLabel}</span>
        </div>
      )}
    </div>
  );
}

interface SectionPanelProps {
  title: string;
  children: React.ReactNode;
}

function SectionPanel({ title, children }: SectionPanelProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[20px] font-medium text-[#121212]">{title}</h3>
        <button className="flex items-center gap-1 text-[14px] font-medium text-[#0a84ff]">
          View All
          <img src={ASSET_VIEW_ALL} alt="" style={{ width: 7.5, height: 12 }} />
        </button>
      </div>
      <div className="bg-white rounded-[8px] p-10 flex gap-6">
        {children}
      </div>
    </div>
  );
}

// ── Stage Stepper ─────────────────────────────────────────────────────────────

function StageStepper({ currentStage }: { currentStage: string }) {
  const currentIdx = STAGE_ORDER.indexOf(currentStage as typeof STAGE_ORDER[number]);

  return (
    <div>
      <h3 className="text-[20px] font-medium text-[#121212] mb-3">Pre-Award Pipeline</h3>
      <div className="bg-white rounded-[8px] p-10">
        <div className="flex items-center">
          {STAGE_ORDER.map((stageKey, idx) => {
            const isComplete = idx < currentIdx;
            const isActive   = idx === currentIdx;

            let circleBg    = "#e5e7eb";
            let circleColor = "#9ca3af";
            let labelColor  = "#9ca3af";
            let badgeBg     = "#f3f4f6";
            let badgeColor  = "#9ca3af";
            let badgeText   = "Pending";

            if (isComplete) {
              circleBg   = "#2a8a4a";
              circleColor = "white";
              labelColor = "#404040";
              badgeBg    = "rgba(42,138,74,0.10)";
              badgeColor = "#2a8a4a";
              badgeText  = "Complete";
            } else if (isActive) {
              circleBg   = "#0039c9";
              circleColor = "white";
              labelColor = "#121212";
              badgeBg    = "rgba(0,57,201,0.10)";
              badgeColor = "#0039c9";
              badgeText  = "In Progress";
            }

            return (
              <div key={stageKey} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center mb-2"
                    style={{ background: circleBg }}
                  >
                    {isComplete ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={circleColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span style={{ color: circleColor }}>{STAGE_ICONS[stageKey]}</span>
                    )}
                  </div>
                  <div className="text-[10.5px] font-medium text-center leading-tight mb-1.5 whitespace-nowrap" style={{ color: labelColor }}>
                    {STAGE_LABELS[stageKey]}
                  </div>
                  <div className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full" style={{ background: badgeBg, color: badgeColor }}>
                    {badgeText}
                  </div>
                </div>
                {idx < STAGE_ORDER.length - 1 && (
                  <div
                    className="flex-1 h-[2px] mx-2 mb-10 rounded-full"
                    style={{
                      background: isComplete
                        ? "#2a8a4a"
                        : isActive
                        ? "linear-gradient(90deg, #0039c9 0%, #e5e7eb 100%)"
                        : "#e5e7eb",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Documents introduced at each stage (cumulative — each stage inherits all prior docs)
const DOCS_BY_STAGE: Record<string, { name: string; size: string }[]> = {
  proposal: [
    { name: "Contractor Proposal Form.pdf",   size: "84 KB"  },
    { name: "Product Spec Sheet.pdf",         size: "96 KB"  },
    { name: "Site Assessment Form.pdf",       size: "52 KB"  },
    { name: "Project Scope Summary.pdf",      size: "118 KB" },
  ],
  assembly: [
    { name: "Assembly Letter Draft.pdf",      size: "142 KB" },
    { name: "Technical Data Sheets.pdf",      size: "210 KB" },
    { name: "Wind Uplift Calc.pdf",           size: "215 KB" },
  ],
  submittal: [
    { name: "Submittal Package.zip",          size: "1.4 MB" },
  ],
  quote: [
    { name: "Quote Request.pdf",              size: "74 KB"  },
    { name: "Pricing Summary.pdf",            size: "88 KB"  },
  ],
  noa: [
    { name: "NOA Application.pdf",            size: "130 KB" },
    { name: "Warranty Request Form.pdf",      size: "68 KB"  },
  ],
  inspection: [
    { name: "FSR Inspection Checklist.pdf",   size: "92 KB"  },
    { name: "Site Photos.zip",                size: "3.2 MB" },
    { name: "FSR Report Draft.pdf",           size: "178 KB" },
  ],
};

function getDocsUpToStage(currentStage: string): { name: string; size: string }[] {
  const currentIdx = STAGE_ORDER.indexOf(currentStage as typeof STAGE_ORDER[number]);
  return STAGE_ORDER.slice(0, currentIdx + 1).flatMap(key => DOCS_BY_STAGE[key] ?? []);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WorkOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [comment, setComment] = useState("");

  const wo = getWorkOrder(params.id ?? "");

  if (!wo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7fa]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="text-center">
          <p className="text-[20px] font-medium text-[#121212] mb-2">Work order not found</p>
          <button onClick={() => navigate("/stage-activity")} className="text-[#0a84ff] text-[14px]">← Back to Stage Activity</button>
        </div>
      </div>
    );
  }

  const currentIdx = STAGE_ORDER.indexOf(wo.currentStage as typeof STAGE_ORDER[number]);

  // Derive pct + label for the 4 key status pill stages
  function stageStatus(key: string): { pct: number; label: string } {
    const idx = STAGE_ORDER.indexOf(key as typeof STAGE_ORDER[number]);
    if (idx < currentIdx) return { pct: 100, label: "Complete" };
    if (idx === currentIdx) return { pct: 50, label: "In Progress" };
    return { pct: 0, label: "Pending" };
  }

  const assemblyStatus  = stageStatus("assembly");
  const submittalStatus = stageStatus("submittal");
  const noaStatus       = stageStatus("noa");
  const inspectionStatus = stageStatus("inspection");

  // StepCard status helper
  function cardStatus(key: string): BadgeType {
    const s = stageStatus(key);
    if (s.pct === 100) return "complete";
    if (s.pct > 0)     return "in-progress";
    return "not-started";
  }

  const analyst = wo.analyst;

  return (
    <div className="min-h-screen bg-[#f6f7fa]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <ProNav active="stage-activity" />

      {/* ── Body ── */}
      <div className="bg-[#f8f8f8] rounded-t-[24px]" style={{ minHeight: "calc(100vh - 132px)" }}>
        <div className="mx-auto" style={{ maxWidth: 1512, padding: "0 120px 80px" }}>

          {/* Back link */}
          <div className="pt-10 pb-6">
            <button
              onClick={() => navigate(`/stage-activity?stage=${wo.currentStage}`)}
              className="flex items-center gap-1 text-[14px] text-[#6c757d]"
            >
              <img src={ASSET_BACK} alt="" style={{ width: 10, height: 11 }} />
              Back to Stage Activity
            </button>
          </div>

          {/* Title row */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <h1 className="text-[32px] font-medium text-[#121212] tracking-[-0.02em]">
                {wo.projectName}
              </h1>
              <p className="text-[15px] text-[#6d6d6d] mt-0.5">{wo.contractor}</p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span
                className="text-[13px] font-semibold tracking-wide px-3 py-1 rounded-[6px]"
                style={{ background: "rgba(0,57,201,0.08)", color: "#0039c9" }}
              >
                {wo.id}
              </span>
              {wo.statusColor === "risk" && (
                <span className="text-[12px] font-semibold px-3 py-1 rounded-[6px]" style={{ background: "rgba(239,68,68,0.10)", color: "#ef4444" }}>
                  SLA Breach
                </span>
              )}
            </div>
          </div>

          {/* Meta line */}
          <div className="flex items-center gap-2 text-[14px] text-[#6d6d6d] mb-8 mt-4">
            <span>{wo.address}</span>
            <span className="text-[#cdcdcd]">·</span>
            <span>{wo.sqft} sq ft</span>
            <span className="text-[#cdcdcd]">·</span>
            <span>{wo.product}</span>
            <span className="text-[#cdcdcd]">·</span>
            <span>Submitted {wo.submitted}</span>
            <span className="text-[#cdcdcd]">·</span>
            <span>Age: {wo.age}</span>
            {wo.revision !== "None" && (
              <>
                <span className="text-[#cdcdcd]">·</span>
                <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: wo.statusColor === "risk" ? "rgba(239,68,68,0.10)" : "rgba(245,158,11,0.10)",
                    color: wo.statusColor === "risk" ? "#ef4444" : "#b45309",
                  }}>
                  {wo.revision}
                </span>
              </>
            )}
          </div>

          {/* Two-column layout */}
          <div className="flex gap-16 items-start">

            {/* ── LEFT column ── */}
            <div className="flex flex-col gap-8" style={{ width: 795, flexShrink: 0 }}>

              {/* Building photo */}
              <div className="rounded-[8px] overflow-hidden" style={{ height: 280 }}>
                <img src={buildingImg(wo.id)} alt={wo.contractor} className="w-full h-full object-cover" />
              </div>

              {/* Pipeline Stepper */}
              <StageStepper currentStage={wo.currentStage} />

              {/* Status pills */}
              <div>
                <h3 className="text-[20px] font-medium text-[#121212] mb-3">Status</h3>
                <div className="flex gap-4">
                  {[
                    { key: "assembly",   label: "Assembly Letter", icon: ASSET_STATUS_AL,  svgIcon: null, s: assemblyStatus   },
                    { key: "submittal",  label: "Submittal",       icon: ASSET_STATUS_SUB, svgIcon: null, s: submittalStatus  },
                    { key: "noa",        label: "NOA / Warranty",  icon: "",               svgIcon: (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          <path d="M9 12l2 2 4-4"/>
                        </svg>
                      ), s: noaStatus },
                    { key: "inspection", label: "Inspection",      icon: "",               svgIcon: (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                          <rect x="9" y="3" width="6" height="4" rx="2"/>
                          <path d="M9 12l2 2 4-4"/>
                        </svg>
                      ), s: inspectionStatus },
                  ].map(({ key, label, icon, svgIcon, s }) => {
                    const isComplete = s.pct === 100;
                    return (
                      <div key={key} className="flex flex-col gap-[3px] items-center py-6 rounded-[8px] shrink-0" style={{
                        width: 188,
                        background: isComplete ? "linear-gradient(138deg, #3ed851 2.7%, #0039c9 105%)" : "white",
                      }}>
                        {isComplete
                          ? <img src={ASSET_STATUS_COMPLETE} alt="" style={{ width: 32, height: 32 }} />
                          : svgIcon
                            ? <div style={{ width: 32, height: 32, color: "#545454", display: "flex", alignItems: "center", justifyContent: "center" }}>{svgIcon}</div>
                            : <img src={icon} alt="" style={{ width: 32, height: 32 }} />
                        }
                        <div className="flex flex-col gap-[2px] items-center">
                          <div className="flex items-center justify-center p-[10px]">
                            <span className="text-[16px] font-semibold leading-none" style={{ color: isComplete ? "white" : "#545454" }}>{label}</span>
                          </div>
                          <div className="flex gap-2 items-center justify-center w-full">
                            <span className="text-[12px] font-medium leading-none" style={{ color: isComplete ? "#87f594" : "#949494" }}>{s.pct}%</span>
                            <div className="self-stretch opacity-40" style={{ width: 1, background: isComplete ? "#87f594" : "#cdcdcd" }} />
                            <span className="text-[12px] font-medium leading-none" style={{ color: isComplete ? "#87f594" : "#949494" }}>{s.label}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assembly Letter */}
              <SectionPanel title="Assembly Letter">
                <StepCard
                  status={cardStatus("assembly")}
                  title="Initial Assessment"
                  desc="Roof assessment and product spec confirmed for this work order."
                  footer={cardStatus("assembly") === "complete" ? "verified" : "carly"}
                  verifier={analyst}
                />
                <StepCard
                  status={cardStatus("assembly")}
                  title="Component Selection"
                  desc="All roofing system components selected and validated."
                  footer={cardStatus("assembly") === "complete" ? "verified" : "carly"}
                  verifier={analyst}
                />
                <StepCard
                  status={cardStatus("assembly")}
                  title="Final Assembly"
                  desc="Assembly letter drafted and ready for contractor review."
                  footer={cardStatus("assembly") === "complete" ? "verified" : "carly"}
                  verifier={analyst}
                />
              </SectionPanel>

              {/* Submittal Package */}
              <SectionPanel title="Submittal Package">
                <StepCard
                  status={cardStatus("submittal")}
                  title="Template"
                  desc={`${wo.product} Submittal template selected.`}
                  footer={cardStatus("submittal") === "complete" ? "verified" : "carly"}
                  verifier={analyst}
                />
                <StepCard
                  status={cardStatus("submittal")}
                  title="Documents"
                  desc={cardStatus("submittal") === "complete" ? "All required documents submitted and approved." : "Missing some required documents."}
                  footer={cardStatus("submittal") === "complete" ? "verified" : "carly"}
                  verifier={analyst}
                />
                <StepCard
                  status={cardStatus("submittal")}
                  title="Wind Load Calculations"
                  desc={cardStatus("submittal") === "complete" ? "Wind uplift compliance verified and approved." : "Missing proof of wind uplift compliance."}
                  footer={cardStatus("submittal") === "complete" ? "verified" : "carly"}
                  verifier={analyst}
                />
              </SectionPanel>

              {/* NOA / Warranty */}
              <SectionPanel title="NOA / Warranty">
                {cardStatus("noa") === "not-started" ? (
                  <>
                    <StepCard status="not-started" title="Request NOA" desc="NOA request has not been submitted for this work order." footer="action" actionLabel="Request NOA" />
                    <StepCard status="not-started" title="Warranty Terms" desc="Coverage length and exclusions still need internal sign-off." footer="carly" />
                    <StepCard status="not-started" title="Certificate" desc="The official warranty document has not been issued yet." footer="carly" />
                  </>
                ) : (
                  <>
                    <StepCard status={cardStatus("noa")} title="Request NOA" desc="NOA request submitted and processed." footer={cardStatus("noa") === "complete" ? "verified" : "carly"} verifier={analyst} />
                    <StepCard status={cardStatus("noa")} title="Warranty Terms" desc="Coverage terms confirmed and signed off." footer={cardStatus("noa") === "complete" ? "verified" : "carly"} verifier={analyst} />
                    <StepCard status={cardStatus("noa")} title="Certificate" desc="Official warranty certificate issued and delivered." footer={cardStatus("noa") === "complete" ? "verified" : "carly"} verifier={analyst} />
                  </>
                )}
              </SectionPanel>

              {/* Inspection */}
              <SectionPanel title="Inspection">
                {cardStatus("inspection") === "not-started" ? (
                  <>
                    <StepCard status="not-started" title="Schedule Inspection" desc="FSR inspection has not been scheduled for this work order." footer="action" actionLabel="Schedule FSR" />
                    <StepCard status="not-started" title="On-Site Review" desc="Field service review pending scheduling." footer="carly" />
                    <StepCard status="not-started" title="Final Sign-Off" desc="Inspection sign-off and report not yet issued." footer="carly" />
                  </>
                ) : (
                  <>
                    <StepCard status={cardStatus("inspection")} title="Schedule Inspection" desc="FSR inspection scheduled and confirmed." footer={cardStatus("inspection") === "complete" ? "verified" : "carly"} verifier={analyst} />
                    <StepCard status={cardStatus("inspection")} title="On-Site Review" desc="Field service completed roof system verification." footer={cardStatus("inspection") === "complete" ? "verified" : "carly"} verifier={analyst} />
                    <StepCard status={cardStatus("inspection")} title="Final Sign-Off" desc="Inspection report issued and all items cleared." footer={cardStatus("inspection") === "complete" ? "verified" : "carly"} verifier={analyst} />
                  </>
                )}
              </SectionPanel>
            </div>

            {/* ── RIGHT column ── */}
            <div className="flex flex-col gap-6 flex-1 min-w-0">

              {/* Team */}
              <div>
                <h3 className="text-[20px] font-medium text-[#121212] mb-3">Team</h3>
                <div className="bg-white rounded-[8px] overflow-hidden p-10 flex flex-col gap-6">
                  {/* Analyst */}
                  <div className="flex flex-col gap-2">
                    <p className="text-[14px] font-semibold leading-[1.4] text-[#6d6d6d]">CCM Design Analyst</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                        <img src={wo.team.analyst?.avatarUrl ?? "https://randomuser.me/api/portraits/women/28.jpg"} alt={wo.analyst} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col gap-[2px]">
                        <p className="text-[16px] font-semibold text-[#404a62] leading-[1.4]">{wo.analyst}</p>
                        <p className="text-[14px] font-normal text-[#404a62] leading-[1.4]">Carlisle | (480) 555.0100</p>
                      </div>
                    </div>
                  </div>
                  {/* Sales Rep */}
                  <div className="flex flex-col gap-2">
                    <p className="text-[14px] font-semibold leading-[1.4] text-[#6d6d6d]">Sales Rep</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                        <img src={wo.team.salesRep.avatarUrl} alt={wo.team.salesRep.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col gap-[2px]">
                        <p className="text-[16px] font-semibold text-[#404a62] leading-[1.4]">{wo.team.salesRep.name}</p>
                        <p className="text-[14px] font-normal text-[#404a62] leading-[1.4]">{wo.team.salesRep.email}</p>
                      </div>
                    </div>
                  </div>
                  {/* Contractor Contact */}
                  <div className="flex flex-col gap-2">
                    <p className="text-[14px] font-semibold leading-[1.4] text-[#6d6d6d]">Contractor Contact</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                        <img src={wo.team.contractorContact.avatarUrl} alt={wo.team.contractorContact.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col gap-[2px]">
                        <p className="text-[16px] font-semibold text-[#404a62] leading-[1.4]">{wo.team.contractorContact.name}</p>
                        <p className="text-[14px] font-normal text-[#404a62] leading-[1.4]">{wo.team.contractorContact.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity & Communication */}
              <div>
                <h3 className="text-[20px] font-medium text-[#121212] mb-3">Activity &amp; Communication</h3>
                <div className="bg-white rounded-[8px] overflow-hidden flex flex-col">
                  <div className="flex flex-col gap-[34px] px-10 py-6">
                    {wo.activity.map((msg, i) => (
                      <div key={i} className="flex flex-col gap-3 w-[317px]">
                        <div className="flex items-start">
                          <p className={`text-[16px] font-semibold leading-[1.4] flex-1 ${msg.type === "system" ? "text-[#0a84ff]" : "text-[#404a62]"}`}>
                            {msg.author}
                          </p>
                          <p className="text-[12px] font-normal text-[#828282] leading-[1.4] text-right">{msg.time}</p>
                        </div>
                        <p className={`text-[16px] font-normal leading-[1.4] ${msg.type === "system" ? "text-[#0a84ff]" : "text-[#404a62]"}`}>
                          {msg.text}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#c7c7c7] flex items-center justify-between px-6 py-4">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment or update"
                      className="flex-1 text-[16px] font-light text-[#a8a8a8] bg-transparent outline-none"
                    />
                    <button className="flex items-start p-[10px] rounded-[8px] shrink-0 ml-3" style={{ background: "#2ebe40" }}>
                      <img src={ASSET_SEND} alt="Send" style={{ width: 20, height: 20 }} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Documents */}
              <div>
                <h3 className="text-[20px] font-medium text-[#121212] mb-3">Recent Documents</h3>
                <div className="bg-white rounded-[8px] overflow-hidden flex flex-col">
                  <div className="flex flex-col gap-[34px] px-10 py-6">
                    {getDocsUpToStage(wo.currentStage).map((doc, i) => (
                      <div key={i} className="flex items-center gap-[10px]">
                        <div className="flex flex-col gap-[6px] flex-1 min-w-0">
                          <p className="text-[16px] font-semibold text-[#404a62] leading-[1.4] truncate">{doc.name}</p>
                          <p className="text-[12px] font-normal text-[#404a62] leading-[1.4]">{wo.submitted} | {doc.size} | by {wo.analyst}</p>
                        </div>
                        <div className="flex items-center justify-between shrink-0" style={{ width: 48 }}>
                          <img src={ASSET_DOC_DL} alt="Download" style={{ width: 19, height: 20 }} />
                          <img src={ASSET_DOC_MORE} alt="More" style={{ width: 4, height: 20 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#c7c7c7] flex items-center justify-center gap-4 px-6 py-4">
                    <img src={ASSET_UPLOAD} alt="" style={{ width: 19, height: 20 }} />
                    <span className="text-[18px] font-medium text-[#404a62]">Upload New Document</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <AiAssistant />
    </div>
  );
}
