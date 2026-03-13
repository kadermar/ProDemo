import { useState } from "react";
import { useLocation } from "wouter";
import img31 from "@assets/image31.png";
import { JOBS } from "@/data/jobs";
import { AiAssistant } from "@/components/ai-assistant";

// ── Figma asset URLs (expire 7 days from 2026-03-12) ─────────────────────────
const ASSET_AVATAR = "https://www.figma.com/api/mcp/asset/34af509e-7911-4862-b545-1f1dd092177b";
const ASSET_ELLIPSE = "https://www.figma.com/api/mcp/asset/f21c6f64-f5cc-4cea-9296-a2580d1f37a2";
// Action button icons
const ICON_ASSEMBLY  = "https://www.figma.com/api/mcp/asset/614f708a-f7b4-4fe0-aa3f-c4832c7c6fe6";
const ICON_INSPECTION = "https://www.figma.com/api/mcp/asset/a0e2d7fb-c33f-4b60-95f4-38b2be439125";
const ICON_UPLOAD    = "https://www.figma.com/api/mcp/asset/0d65892f-a78a-4281-ade2-a00864f0a313";
const ICON_ASCE7     = "https://www.figma.com/api/mcp/asset/1c5b541c-9b3d-424a-adc4-fbce17c7b843";
const ICON_WARRANTY  = "https://www.figma.com/api/mcp/asset/38b311af-eede-439f-a551-4c5d0685be13";

// ── Stat cards ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  delta: number;
  deltaLabel: string;
  accent?: boolean;
}

function StatCard({ label, value, delta, deltaLabel, accent }: StatCardProps) {
  return (
    <div
      className="flex-1 flex flex-col gap-10 px-6 py-8 rounded-[8px] relative"
      style={{
        background: accent ? "#3ed851" : "rgba(194,203,255,0.3)",
        backdropFilter: "blur(50px)",
        boxShadow: "inset 0px 1px 0px 0px rgba(255,255,255,0.1)",
      }}
    >
      <p
        className="text-[16px] font-medium leading-none"
        style={{ color: accent ? "#121212" : "white" }}
      >
        {label}
      </p>
      <div className="flex items-center gap-4">
        <span
          className="text-[40px] font-normal leading-none"
          style={{ color: accent ? "#121212" : "white" }}
        >
          {value}
        </span>
        <div
          className="self-stretch opacity-40"
          style={{ width: 1, background: accent ? "#121212" : "white" }}
        />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            {/* Up arrow */}
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              className={accent ? "" : "scale-y-[-1]"}
            >
              <path d="M5 8V2M5 2L2 5M5 2L8 5" stroke={accent ? "#121212" : "white"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span
              className="text-[18px] font-medium leading-none"
              style={{ color: accent ? "#121212" : "white" }}
            >
              {delta}
            </span>
          </div>
          <span
            className="text-[12px] font-medium leading-none"
            style={{ color: accent ? "#121212" : "white" }}
          >
            {deltaLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Action buttons ────────────────────────────────────────────────────────────

const ACTIONS = [
  { label: "Request Assembly Letter", icon: ICON_ASSEMBLY,   iconSize: { w: 16.4, h: 20 } },
  { label: "Request Inspection",      icon: ICON_INSPECTION, iconSize: { w: 41,   h: 40 } },
  { label: "Upload Documents",        icon: ICON_UPLOAD,     iconSize: { w: 17.8, h: 20 } },
  { label: "ASCE 7 Calculator",       icon: ICON_ASCE7,      iconSize: { w: 18,   h: 20 } },
  { label: "Warranty Application",    icon: ICON_WARRANTY,   iconSize: { w: 16,   h: 20 } },
];

const JOB_TABS = ["Recent", "Active", "Completed", "All"];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardV2Page() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("Recent");

  const filteredJobs = JOBS.filter((job) => {
    if (activeTab === "Active")    return job.jobState === "active";
    if (activeTab === "Completed") return job.jobState === "completed";
    return true; // Recent + All show everything
  });

  return (
    <div
      className="min-h-screen bg-[#f6f7fa]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── Dark hero section ── */}
      <div className="relative bg-[#121212] overflow-hidden" style={{ height: 438 }}>
        {/* Radial glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "50%",
            bottom: -421,
            transform: "translateX(calc(-50% + 195px))",
            width: 1838,
            height: 1283,
            backgroundImage: `url(${ASSET_ELLIPSE})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Diagonal stripe overlay */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "50%",
            bottom: -626,
            transform: "translateX(-50%) skewX(-18deg) scaleY(0.95)",
            width: 2821,
            height: 1375,
            mixBlendMode: "overlay",
          }}
        >
          <img
            src={img31}
            alt=""
            className="absolute w-full"
            style={{ top: "-9.27%", height: "118.53%", maxWidth: "none" }}
          />
        </div>

        {/* Nav */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between"
          style={{ padding: "42px 120px 0" }}
        >
          {/* Logo */}
          <img
            src="https://www.figma.com/api/mcp/asset/8e8192b2-8ea0-4404-9a49-182465ca2693"
            alt="PRO"
            className="shrink-0"
            style={{ height: 28, width: 110, objectFit: "contain", objectPosition: "left" }}
          />

          {/* Center pill nav */}
          <div
            className="flex gap-2 items-start p-1 rounded-[8px]"
            style={{
              backdropFilter: "blur(50px)",
              boxShadow: "inset 0px 1px 0px 0px rgba(255,255,255,0.1)",
            }}
          >
            {["Dashboard", "Signals", "Stage Activity", "Field Experience", "Chat"].map((label) => {
              const hrefs: Record<string, string> = {
                Dashboard: "/dashboard-v2",
                Signals: "/signals",
                "Stage Activity": "/stage-activity",
                "Field Experience": "/field-experience",
                Chat: "/",
              };
              const isActive = label === "Dashboard";
              return (
                <button
                  key={label}
                  onClick={() => navigate(hrefs[label])}
                  className="flex items-center justify-center text-white text-[16px] font-medium whitespace-nowrap rounded-[8px] transition-colors"
                  style={{
                    height: 43,
                    padding: "12px 26px",
                    background: isActive ? "rgba(194,203,255,0.3)" : "transparent",
                    boxShadow: isActive ? "inset 0px 1px 0px 0px rgba(255,255,255,0.1)" : undefined,
                    backdropFilter: isActive ? "blur(50px)" : undefined,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Right: bell + avatar */}
          <div className="flex items-center gap-6 shrink-0">
            {/* Bell */}
            <div className="relative w-[30px] h-[30px] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <div
                className="absolute flex items-center justify-center rounded-full border-2 border-[#0e3258]"
                style={{ top: -2, right: -2, minWidth: 14, height: 14, background: "#3ed851", padding: "0 3px" }}
              >
                <span className="text-[9px] text-[#121212] font-semibold leading-none">3</span>
              </div>
            </div>

            {/* Avatar + chevron */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                <img src={ASSET_AVATAR} alt="" className="w-full h-full object-cover" style={{ objectPosition: "-14% 0" }} />
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6l4 4 4-4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Welcome + stat cards */}
        <div
          className="absolute flex flex-col gap-6"
          style={{ top: 133, left: 120, right: 120 }}
        >
          <p className="text-white text-[40px] font-medium leading-none">Welcome back, Mark.</p>

          <div
            className="flex gap-4"
            style={{ boxShadow: "0px 8px 16px 0px rgba(0,0,0,0.12)" }}
          >
            <StatCard label="Active Jobs" value={8} delta={3} deltaLabel="Since last month" accent />
            <StatCard label="Inspections" value={2} delta={3} deltaLabel="Since last month" />
            <StatCard label="Jobs at Risk" value={3} delta={1} deltaLabel="Since last month" />
            <StatCard label="Pending Submittals" value={4} delta={0} deltaLabel="Since last month" />
          </div>
        </div>
      </div>

      {/* ── White card section ── */}
      <div className="relative bg-[#f8f8f8] rounded-t-[24px] -mt-6 min-h-[542px]">
        {/* My Jobs header + tabs */}
        <div
          className="flex items-end justify-between pt-20 pb-0"
          style={{ padding: "80px 120px 0" }}
        >
          <div className="flex items-end gap-[60px]">
            <h2 className="text-[32px] font-medium text-[#121212] tracking-[-0.02em] leading-tight">My Jobs</h2>
            <div className="flex gap-10 items-center">
              {JOB_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="text-[20px] font-medium leading-tight transition-colors"
                  style={{ color: activeTab === tab ? "#0039c9" : "#808488" }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <button
              className="flex items-center gap-2 border border-[#ccc] rounded-[8px] text-[#121212] text-[16px] font-medium"
              style={{ padding: "16px 24px 16px 16px" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 6h14M6 10h8M9 14h2" stroke="#121212" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Filters
            </button>
            <button
              className="flex items-center gap-2 rounded-[8px] text-white text-[16px] font-medium"
              style={{ background: "#2ebe40", padding: "16px 24px 16px 16px" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4v12M4 10h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              New Job
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div
          className="flex gap-4 mt-[30px]"
          style={{ padding: "0 120px" }}
        >
          {ACTIONS.map((a) => (
            <button
              key={a.label}
              className="flex-1 flex items-center gap-2 border border-[#ccc] rounded-[8px] text-[#121212] text-[14px] font-medium"
              style={{ padding: 10 }}
            >
              <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center">
                <img
                  src={a.icon}
                  alt=""
                  style={{ width: a.iconSize.w, height: a.iconSize.h, objectFit: "contain" }}
                />
              </div>
              {a.label}
            </button>
          ))}
        </div>

        {/* Job cards */}
        <div
          className="grid gap-4 mt-4"
          style={{ padding: "0 120px 48px", gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          {filteredJobs.map((job) => (
            <div
              key={job.title}
              className="flex flex-col overflow-hidden rounded-[8px] cursor-pointer"
              style={{ boxShadow: "0px 4px 24px 0px rgba(0,0,0,0.06)" }}
              onClick={() => navigate(`/job/${job.id}`)}
            >
              {/* Job image */}
              <div className="relative shrink-0" style={{ height: 206 }}>
                <img
                  src={job.img}
                  alt={job.title}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
              </div>

              {/* Job info */}
              <div className="bg-white flex flex-col flex-1 p-6 justify-between">
                <div className="flex gap-3 items-start">
                  <div className="flex flex-col gap-2 flex-1">
                    <p className="text-[20px] font-semibold text-[#121212] leading-[1.2]">{job.title}</p>
                    <p className="text-[14px] font-normal text-[#808488] leading-none">{job.system}</p>
                    <p className="text-[14px] font-normal text-[#808488] leading-none">{job.location}</p>
                  </div>
                  <span className="text-[12px] font-medium text-[#808488] whitespace-nowrap shrink-0 mt-1">
                    {job.days}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <p className="text-[12px] font-semibold text-[#121212]">Up Next: {job.next}</p>
                  <div
                    className="flex items-center gap-1 rounded-[4px] pl-1 pr-2 py-0.5"
                    style={{ background: "#d6f7da" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="#3ba649">
                      <path fillRule="evenodd" clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" />
                    </svg>
                    <span className="text-[12px] font-semibold text-[#3ba649]">{job.updates} Updates</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <AiAssistant />
    </div>
  );
}
