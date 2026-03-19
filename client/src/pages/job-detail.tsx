import { useState } from "react";
import { useLocation } from "wouter";
import { getJob } from "@/data/jobs";
import { ProNav } from "@/components/pro-nav";
import { AiAssistant } from "@/components/ai-assistant";
import aiFabIcon from "@assets/ai-fab-icon.svg";

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
const ASSET_FAB       = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"><circle cx="10" cy="10" r="8"/><path d="M10 6v8M6 10h8"/></svg>');
// Status icons
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

const DOCS = [
  "Submittal Package.zip",
  "Assembly Letter V2.pdf",
  "Technical Data Sheets.pdf",
  "Site Photos.zip",
  "Assembly Letter V2.pdf",
  "Technical Data Sheets.pdf",
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [, navigate] = useLocation();
  const [comment, setComment] = useState("");

  const job = getJob(params.id);
  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7fa]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="text-center">
          <p className="text-[20px] font-medium text-[#121212] mb-2">Job not found</p>
          <button onClick={() => navigate("/dashboard")} className="text-[#0a84ff] text-[14px]">← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fa]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <ProNav active="dashboard" />

      {/* ── White body ── */}
      <div className="bg-[#f8f8f8] rounded-t-[24px]" style={{ minHeight: "calc(100vh - 132px)" }}>
        <div className="mx-auto" style={{ maxWidth: 1512, padding: "0 120px 80px" }}>

          {/* Back link */}
          <div className="pt-10 pb-6">
            <button onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1 text-[14px] text-[#6c757d]">
              <img src={ASSET_BACK} alt="" style={{ width: 10, height: 11 }} />
              Back All Jobs
            </button>
          </div>

          {/* Job title */}
          <h1 className="text-[32px] font-medium text-[#121212] tracking-[-0.02em] mb-4">
            {job.title}
          </h1>

          {/* Two-column layout */}
          <div className="flex gap-16 items-start">

            {/* ── LEFT column ── */}
            <div className="flex flex-col gap-8" style={{ width: 795, flexShrink: 0 }}>

              {/* Job photo */}
              <div className="rounded-[8px] overflow-hidden" style={{ height: 396 }}>
                <img src={job.img} alt={job.title} className="w-full h-full object-cover" />
              </div>

              {/* Location + date */}
              <div className="flex items-center justify-between text-[16px]">
                <p className="text-[#404a62]">
                  <span className="text-[#6d6d6d]">Location: </span>
                  <span className="text-[#121212]">{job.address}</span>
                </p>
                <p className="text-[#404a62] text-right shrink-0 ml-8">
                  <span className="text-[rgba(109,109,109,0.87)]">Date Created: </span>
                  <span className="text-[#121212]">{job.dateCreated}</span>
                </p>
              </div>

              {/* Status pills */}
              <div>
                <h3 className="text-[20px] font-medium text-[#121212] mb-3">Status</h3>
                <div className="flex gap-4">
                  {[
                    { key: "assemblyLetter", label: "Assembly Letter", icon: ASSET_STATUS_AL,  svgIcon: null, s: job.status.assemblyLetter },
                    { key: "submittal",      label: "Submittal",       icon: ASSET_STATUS_SUB, svgIcon: null, s: job.status.submittal      },
                    { key: "inspection",     label: "Inspection",      icon: "",               svgIcon: (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                          <rect x="9" y="3" width="6" height="4" rx="2"/>
                          <path d="M9 12l2 2 4-4"/>
                        </svg>
                      ), s: job.status.inspection },
                    { key: "warranty",       label: "Warranty",        icon: "",               svgIcon: (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          <path d="M9 12l2 2 4-4"/>
                        </svg>
                      ), s: job.status.warranty },
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
                <StepCard status="complete" title="Initial Assessment"  desc="Roof assessment and measurements completed on March 5, 2024." footer="verified" verifier={job.verifiers.assemblyLetter} />
                <StepCard status="complete" title="Component Selection" desc="All roofing components selected and approved."               footer="verified" verifier={job.verifiers.assemblyLetter} />
                <StepCard status="complete" title="Final Assembly"      desc="Assembly letter draft ready for review."                    footer="verified" verifier={job.verifiers.assemblyLetter} />
              </SectionPanel>

              {/* Submittal Package */}
              <SectionPanel title="Submittal Package">
                <StepCard status="complete" title="Template" desc="TPO Mechanically Fastened Submittal." footer="verified" verifier={job.verifiers.submittal} />
                {job.status.submittal.pct === 100 ? (
                  <>
                    <StepCard status="complete" title="Documents"              desc="All required documents submitted and approved."  footer="verified" verifier={job.verifiers.submittal} />
                    <StepCard status="complete" title="Wind Load Calculations" desc="Wind uplift compliance verified and approved."   footer="verified" verifier={job.verifiers.submittal} />
                  </>
                ) : (
                  <>
                    <StepCard status="in-progress" title="Documents"              desc="Missing some required documents."            footer="carly" />
                    <StepCard status="in-progress" title="Wind Load Calculations" desc="Missing proof of wind uplift compliance."    footer="carly" />
                  </>
                )}
              </SectionPanel>

              {/* Inspection */}
              <SectionPanel title="Inspection">
                <StepCard status="complete" title="Initial Assessment" desc="Roof assessment and measurements completed on March 5, 2024" footer="verified" verifier={job.verifiers.inspection} />
                {job.status.inspection.pct === 100 ? (
                  <>
                    <StepCard status="complete" title="Component Selection"    desc="All roofing components inspected and approved."  footer="verified" verifier={job.verifiers.inspection} />
                    <StepCard status="complete" title="Wind Load Calculations" desc="Wind uplift compliance confirmed on-site."       footer="verified" verifier={job.verifiers.inspection} />
                  </>
                ) : (
                  <>
                    <StepCard status="in-progress" title="Component Selection"    desc="All roofing components selected and approved." footer="carly" />
                    <StepCard status="in-progress" title="Wind Load Calculations" desc="Proof of wind uplift compliance."              footer="carly" />
                  </>
                )}
              </SectionPanel>

              {/* Warranty Information */}
              <SectionPanel title="Warranty Information">
                {job.status.warranty.pct === 100 ? (
                  <>
                    <StepCard status="complete" title="Request Warranty"     desc="Warranty request submitted and processed."           footer="verified" verifier={job.verifiers.warranty} />
                    <StepCard status="complete" title="Warranty Terms"       desc="Coverage terms confirmed and signed off."            footer="verified" verifier={job.verifiers.warranty} />
                    <StepCard status="complete" title="Warranty Certificate" desc="Official warranty certificate issued and delivered." footer="verified" verifier={job.verifiers.warranty} />
                  </>
                ) : (
                  <>
                    <StepCard status="not-started" title="Request Warranty"     desc="Warranty request has not been started for this job."                    footer="action" actionLabel="Request Warranty" />
                    <StepCard status="not-started" title="Warranty Terms"       desc="Coverage length, exclusions, and details still need internal sign-off." footer="carly" />
                    <StepCard status="not-started" title="Warranty Certificate" desc="The official warranty document has not been created or sent yet."       footer="carly" />
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
                  {job.team.map((m) => (
                    <div key={m.name} className="flex flex-col gap-2">
                      <p className="text-[14px] font-semibold leading-[1.4] text-[#6d6d6d]">{m.role}</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#e9ecef]">
                          <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" style={m.avatarStyle} />
                        </div>
                        <div className="flex flex-col gap-[2px]">
                          <p className="text-[16px] font-semibold text-[#404a62] leading-[1.4]">{m.name}</p>
                          <p className="text-[14px] font-normal text-[#404a62] leading-[1.4]">{m.contact}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity & Communication */}
              <div>
                <h3 className="text-[20px] font-medium text-[#121212] mb-3">Activity &amp; Communication</h3>
                <div className="bg-white rounded-[8px] overflow-hidden flex flex-col">
                  {/* Chat messages */}
                  <div className="flex flex-col gap-[34px] px-10 py-6">
                    {job.chat.map((msg, i) => (
                      <div key={i} className="flex flex-col gap-3 w-[317px]">
                        <div className="flex items-start">
                          <p className={`text-[16px] font-semibold leading-[1.4] flex-1 ${msg.isSystem ? "text-[#0a84ff]" : "text-[#404a62]"}`}>{msg.sender}</p>
                          <p className="text-[12px] font-normal text-[#828282] leading-[1.4] text-right">{msg.time}</p>
                        </div>
                        <p className={`text-[16px] font-normal leading-[1.4] ${msg.isSystem ? "text-[#0a84ff]" : "text-[#404a62]"}`}>{msg.text}</p>
                      </div>
                    ))}
                  </div>
                  {/* Text input */}
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
                    {DOCS.map((doc, i) => (
                      <div key={i} className="flex items-center gap-[10px]">
                        <div className="flex flex-col gap-[6px] flex-1 min-w-0">
                          <p className="text-[16px] font-semibold text-[#404a62] leading-[1.4] truncate">{doc}</p>
                          <p className="text-[12px] font-normal text-[#404a62] leading-[1.4]">01-14-2025 | 2.3MB | by Lisa Weber</p>
                        </div>
                        <div className="flex items-center justify-between shrink-0" style={{ width: 48 }}>
                          <img src={ASSET_DOC_DL} alt="Download" style={{ width: 19, height: 20 }} />
                          <img src={ASSET_DOC_MORE} alt="More" style={{ width: 4, height: 20 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Upload footer */}
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
