import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import img31 from "@assets/image31.png";
import { JOBS } from "@/data/jobs";
import { AiAssistant } from "@/components/ai-assistant";

// ── Stable local assets ──
const svg = (s: string) => `data:image/svg+xml;base64,${btoa(s)}`;
const ASSET_AVATAR  = "https://picsum.photos/seed/mark_johnson/80/80";
const ASSET_ELLIPSE = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1838 1283"><defs><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#3b5bdb" stop-opacity="0.55"/><stop offset="100%" stop-color="#3b5bdb" stop-opacity="0"/></radialGradient></defs><ellipse cx="919" cy="641" rx="919" ry="641" fill="url(#g)"/></svg>')}`;
// Action button icons
const ICON_ASSEMBLY   = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="white" stroke-width="1.5"><rect x="3" y="2" width="14" height="16" rx="2"/><line x1="7" y1="7" x2="13" y2="7"/><line x1="7" y1="10" x2="13" y2="10"/><line x1="7" y1="13" x2="10" y2="13"/></svg>');
const ICON_INSPECTION = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" stroke="white" stroke-width="1.8"><circle cx="20" cy="18" r="10"/><circle cx="20" cy="18" r="4" fill="white" fill-opacity="0.3"/><line x1="20" y1="5" x2="20" y2="9"/><line x1="20" y1="27" x2="20" y2="31"/><line x1="7" y1="18" x2="11" y2="18"/><line x1="29" y1="18" x2="33" y2="18"/></svg>');
const ICON_UPLOAD     = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13V3m0 0L6 7m4-4l4 4"/><path d="M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2"/></svg>');
const ICON_ASCE7      = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="white" stroke-width="1.5"><rect x="2" y="2" width="16" height="16" rx="2"/><text x="6" y="14" font-family="monospace" font-size="7" fill="white">7</text><line x1="5" y1="8" x2="15" y2="8"/></svg>');
const ICON_WARRANTY   = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="white" stroke-width="1.5"><path d="M10 2l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V5l7-3z"/><polyline points="7,10 9,12 13,8" stroke-linecap="round" stroke-linejoin="round"/></svg>');

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (searchOpen) searchInputRef.current?.focus(); }, [searchOpen]);
  function closeSearch() { setSearchOpen(false); setSearchVal(""); }

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

        {/* Diagonal stripe */}
        <div className="absolute pointer-events-none" style={{
          left: "50%", bottom: -626, transform: "translateX(-50%) skewX(-18deg) scaleY(0.95)",
          width: 2821, height: 1375, mixBlendMode: "overlay",
        }}>
          <img src={img31} alt="" className="absolute w-full" style={{ top: "-9.27%", height: "118.53%", maxWidth: "none" }} />
        </div>

        {/* Nav */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between"
          style={{ padding: "42px 120px 0" }}
        >
          {/* Logo */}
          <img
            src={`data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 28"><text x="0" y="21" font-family="Inter,system-ui,sans-serif" font-size="20" font-weight="700" letter-spacing="-0.5" fill="white">C PRO</text></svg>')}`}
            alt="PRO"
            className="shrink-0"
            style={{ height: 28, width: 110, objectFit: "contain", objectPosition: "left" }}
          />

          {/* Center pill nav */}
          <div
            className="flex gap-2 items-center p-1 rounded-[8px]"
            style={{
              backdropFilter: "blur(50px)",
              boxShadow: "inset 0px 1px 0px 0px rgba(255,255,255,0.1)",
            }}
          >
            {searchOpen ? (
              <div className="flex items-center gap-2 rounded-[8px] px-3" style={{ width: 260, height: 43, background: "rgba(255,255,255,0.10)", boxShadow: "inset 0px 1px 0px 0px rgba(255,255,255,0.12)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input ref={searchInputRef} type="text" value={searchVal} onChange={e => setSearchVal(e.target.value)} onKeyDown={e => e.key === "Escape" && closeSearch()} placeholder="Search…" className="flex-1 bg-transparent outline-none text-[14px] text-white placeholder:text-white/40" />
                <button onClick={closeSearch} className="text-white/40 hover:text-white/80 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ) : (
              <button className="flex items-center justify-center rounded-[8px] transition-opacity hover:opacity-70" style={{ width: 43, height: 43, color: "white" }} onClick={() => setSearchOpen(true)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
            )}
            {["Dashboard", "Signals", "Stage Activity", "Field Experience", "Assistant"].map((label) => {
              const hrefs: Record<string, string> = {
                Dashboard: "/dashboard",
                Signals: "/signals",
                "Stage Activity": "/stage-activity",
                "Field Experience": "/field-experience",
                Assistant: "/chat",
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
