import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import img31 from "@assets/image31.png";
import { AiAssistant } from "@/components/ai-assistant";
import { STAGE_ICONS as SHARED_STAGE_ICONS, StageBadge } from "@/lib/stage-icons";

// ── Figma asset URLs (expire 7 days from 2026-03-12) ─────────────────────────
const ASSET_LOGO    = "https://www.figma.com/api/mcp/asset/8e8192b2-8ea0-4404-9a49-182465ca2693";
const ASSET_ELLIPSE = "https://www.figma.com/api/mcp/asset/f21c6f64-f5cc-4cea-9296-a2580d1f37a2";
const ASSET_AVATAR  = "https://www.figma.com/api/mcp/asset/34af509e-7911-4862-b545-1f1dd092177b";

// ── Data ─────────────────────────────────────────────────────────────────────

const KPI_DATA = [
  { label: "Active Work Orders",         value: "391",  delta: "+12%",  deltaLabel: "vs last month",   variant: "accent"  },
  { label: "Overdue Actions",            value: "23",   delta: "+5",    deltaLabel: "since last week",  variant: "default" },
  { label: "Avg Assembly Letter Cycle",  value: "2.1d", delta: "−55%",  deltaLabel: "vs baseline",      variant: "default" },
  { label: "Warranty Issuance Rate",     value: "94%",  delta: "+3pts", deltaLabel: "vs Q4 2025",       variant: "default" },
];

const STAGES = [
  { icon: "📋", key: "proposal",   name: "Proposal",        count: 124, days: "avg 1.2d · SLA 2d",  badge: "On Track",   health: "ok"   },
  { icon: "📐", key: "assembly",   name: "Assembly Letter", count: 89,  days: "avg 2.1d · SLA 1d",  badge: "14 overdue", health: "risk" },
  { icon: "📦", key: "submittal",  name: "Submittal",       count: 67,  days: "avg 0.8d · SLA 1d",  badge: "On Track",   health: "ok"   },
  { icon: "💬", key: "quote",      name: "Quote",           count: 45,  days: "avg 1.5d · SLA 2d",  badge: "On Track",   health: "ok"   },
  { icon: "📜", key: "noa",        name: "NOA / Warranty",  count: 38,  days: "avg 3.2d · SLA 2d",  badge: "6 overdue",  health: "warn" },
  { icon: "🔍", key: "inspection", name: "Inspection",      count: 28,  days: "avg 6.4d · SLA 5d",  badge: "8 overdue",  health: "warn" },
];

const DRIVERS = [
  { label: "Baseline\nCapacity",   group: "Base",       value:  1850000, type: "base"     },
  { label: "Assembly\nLetter",     group: "Stage Drag",  value:  -340000, type: "negative" },
  { label: "Inspection\nBacklog",  group: "Stage Drag",  value:  -290000, type: "negative" },
  { label: "NOA /\nWarranty",      group: "Stage Drag",  value:  -180000, type: "negative" },
  { label: "Quote\nDelay",         group: "Stage Drag",  value:   -38000, type: "negative" },
  { label: "Proposal\nEfficiency", group: "Upside",      value:    62000, type: "positive" },
  { label: "Submittal\nSpeed",     group: "Upside",      value:    44000, type: "positive" },
  { label: "Net\nProjection",      group: "Total",       value:  1108000, type: "total"    },
];

const CI_SIGNALS = [
  { level: "critical", stage: "📐 Assembly Letter", title: "Design Analyst Queue Overloaded",  desc: "14 letters past SLA. Revision loops from EPDM spec gap compounding backlog.",        stats: [{ label: "overdue", val: "14" }, { label: "on hold", val: "$220K" }] },
  { level: "critical", stage: "📚 Product Library", title: "EPDM Seam Tape Spec Gap",          desc: "Missing sub-type data causing 31% assembly letter revision rate.",                    stats: [{ label: "reworked", val: "23" }, { label: "cycle", val: "+1.4d" }] },
  { level: "critical", stage: "🔍 Inspection",      title: "FSR Backlog — Atlanta",             desc: "8 inspections 7+ days overdue. No FSR reallocation triggered.",                      stats: [{ label: "overdue", val: "8"  }, { label: "risk",  val: "$480K" }] },
  { level: "high",     stage: "📜 NOA / Warranty",  title: "NOA Processing Delays",             desc: "Warranty Admin at 112% capacity. 6 contractors waiting >5 days.",                    stats: [{ label: "at risk", val: "$120K" }, { label: "wait", val: "3.2d" }] },
];

function fmt$K(n: number) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : n > 0 ? "+" : "";
  if (abs >= 1000000) return `${sign}$${(abs / 1000000).toFixed(2)}M`;
  if (abs >= 1000) return `${sign}$${Math.round(abs / 1000)}K`;
  return `${sign}$${abs}`;
}

// ── Stat card (v2 style) ──────────────────────────────────────────────────────

type StatVariant = "accent" | "risk" | "success" | "default";

function StatCard({ label, value, delta, deltaLabel, variant = "default" }: {
  label: string; value: string | number; delta: string; deltaLabel: string; variant?: StatVariant;
}) {
  const bg =
    variant === "accent"  ? "#3ed851" :
    variant === "risk"    ? "rgba(255,90,70,0.22)" :
    variant === "success" ? "rgba(62,216,81,0.18)" :
    "rgba(194,203,255,0.3)";
  const fg = variant === "accent" ? "#121212" : "white";

  const isDown = delta.startsWith("−") || delta.startsWith("↓");

  return (
    <div
      className="flex-1 flex flex-col gap-8 px-6 py-7 rounded-[8px]"
      style={{ background: bg, backdropFilter: "blur(50px)", boxShadow: "inset 0px 1px 0px 0px rgba(255,255,255,0.1)" }}
    >
      <p className="text-[15px] font-medium leading-none" style={{ color: fg }}>{label}</p>
      <div className="flex items-center gap-4">
        <span className="text-[36px] font-normal leading-none" style={{ color: fg }}>{value}</span>
        <div className="self-stretch opacity-40" style={{ width: 1, background: fg }} />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: isDown ? "none" : "scaleY(-1)" }}>
              <path d="M5 8V2M5 2L2 5M5 2L8 5" stroke={fg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[16px] font-medium leading-none" style={{ color: fg }}>{delta}</span>
          </div>
          <span className="text-[11px] font-medium leading-none opacity-80" style={{ color: fg }}>{deltaLabel}</span>
        </div>
      </div>
    </div>
  );
}

// ── Performance Drivers Bridge Chart ─────────────────────────────────────────

function PerformanceDriversChart() {
  // All coords in a fixed viewBox; SVG scales to fill container width
  const W = 800, H = 460;
  const padL = 48, padR = 12, padT = 80, padB = 56;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const n = DRIVERS.length;
  const barW = Math.floor(chartW / n) - 10;
  const gap = Math.floor((chartW - n * barW) / (n + 1));
  const maxVal = 1850000;
  const yScale = (v: number) => (v / maxVal) * chartH;

  const bars: { x: number; yTop: number; h: number; fill: string; label: string; valLabel: string; group: string; isGroupStart: boolean }[] = [];
  let running = 0;
  let prevGroup = "";
  DRIVERS.forEach((d) => {
    const i = bars.length;
    const x = padL + gap + i * (barW + gap);
    let yTop: number, h: number, fill: string;
    if (d.type === "base") {
      h = yScale(d.value); yTop = padT + chartH - h; fill = "#1a3d2b"; running = d.value;
    } else if (d.type === "total") {
      h = yScale(d.value); yTop = padT + chartH - h; fill = "#0039c9";
    } else if (d.type === "positive") {
      h = yScale(d.value); yTop = padT + chartH - yScale(running) - h; fill = "#2a8a4a"; running += d.value;
    } else {
      h = yScale(Math.abs(d.value)); yTop = padT + chartH - yScale(running); fill = "#ef4444"; running += d.value;
    }
    const isGroupStart = d.group !== prevGroup;
    prevGroup = d.group;
    bars.push({ x, yTop, h: Math.max(h, 2), fill, label: d.label, valLabel: fmt$K(d.value), group: d.group, isGroupStart });
  });

  const gridVals = [0, 500000, 1000000, 1500000, 1850000];

  return (
    <div style={{ width: "100%", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ display: "block", overflow: "visible", flex: 1, minHeight: 0 }}>
        {/* Gridlines */}
        {gridVals.map((v) => {
          const y = padT + chartH - yScale(v);
          return (
            <g key={v}>
              <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#f0f0f0" strokeWidth={1} />
              <text x={padL - 5} y={y + 4} textAnchor="end" fontSize={8} fill="#c8c8c8">
                {v === 0 ? "0" : v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : `$${v / 1000}K`}
              </text>
            </g>
          );
        })}

        {/* Group separators */}
        {bars.filter(b => b.isGroupStart && b.group !== "Base").map((b, i) => (
          <line key={i} x1={b.x - gap / 2} x2={b.x - gap / 2} y1={padT - 36} y2={padT + chartH} stroke="#e8e8e8" strokeWidth={1} strokeDasharray="4 3" />
        ))}

        {/* Group headers */}
        {(["Base", "Stage Drag", "Upside", "Total"] as const).map((grp) => {
          const grpBars = bars.filter((_, i) => DRIVERS[i].group === grp);
          if (!grpBars.length) return null;
          const midX = (grpBars[0].x + grpBars[grpBars.length - 1].x + barW) / 2;
          return (
            <text key={grp} x={midX} y={padT - 30} textAnchor="middle" fontSize={9} fontWeight="700"
              fill={grp === "Stage Drag" ? "#ef4444" : grp === "Upside" ? "#2a8a4a" : "#909090"}>
              {grp.toUpperCase()}
            </text>
          );
        })}

        {/* Connectors */}
        {bars.map((b, i) => {
          if (i === 0 || i === bars.length - 1) return null;
          const prev = bars[i - 1];
          const connY = DRIVERS[i].type === "positive" ? prev.yTop : prev.yTop + prev.h;
          return <line key={i} x1={prev.x + barW} x2={b.x} y1={connY} y2={connY} stroke="#d0d0d0" strokeWidth={1} strokeDasharray="4 3" />;
        })}

        {/* Bars */}
        {bars.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={b.yTop} width={barW} height={b.h} fill={b.fill} rx={3} opacity={0.9} />
            <text x={b.x + barW / 2} y={b.yTop - 7} textAnchor="middle" fontSize={9} fill={b.fill} fontWeight="700">
              {b.valLabel}
            </text>
            {b.label.split("\n").map((line, li) => (
              <text key={li} x={b.x + barW / 2} y={padT + chartH + 13 + li * 12} textAnchor="middle" fontSize={8} fill="#909090">
                {line}
              </text>
            ))}
          </g>
        ))}

        {/* Baseline axis */}
        <line x1={padL} x2={W - padR} y1={padT + chartH} y2={padT + chartH} stroke="#d8d8d8" strokeWidth={1} />
      </svg>

      <div className="flex gap-5 mt-3 flex-shrink-0" style={{ paddingLeft: padL }}>
        {[
          { color: "#1a3d2b", label: "Baseline capacity" },
          { color: "#ef4444", label: "Stage drag" },
          { color: "#2a8a4a", label: "Efficiency upside" },
          { color: "#0039c9", label: "Net projection" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="rounded-sm" style={{ width: 9, height: 9, background: color, flexShrink: 0 }} />
            <span className="text-[11px] text-[#808488]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Pipeline funnel ───────────────────────────────────────────────────────────

function PipelineFunnel() {
  const [, navigate] = useLocation();
  const healthDot: Record<string, string> = { ok: "#3ed851", warn: "#f59e0b", risk: "#ef4444" };
  const countColor: Record<string, string>= { ok: "#121212", warn: "#92400e", risk: "#991b1b" };
  const iconColor: Record<string, string> = { ok: "#2a8a4a", warn: "#92400e", risk: "#991b1b" };

  return (
    <div className="bg-white rounded-[8px] p-8" style={{ boxShadow: "0px 4px 24px 0px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[20px] font-medium text-[#121212]">Work Order Pipeline</h3>
        <button
          onClick={() => navigate("/stage-activity")}
          className="text-[13px] font-medium transition-colors hover:opacity-70"
          style={{ color: "#0039c9" }}
        >
          View More →
        </button>
      </div>
      <p className="text-[13px] text-[#808488] mb-6">Pre-award to warranty · Click to explore</p>

      <div className="flex gap-3">
        {STAGES.map((s) => (
          <button
            key={s.key}
            onClick={() => navigate(`/stage-activity?stage=${s.key}`)}
            className="flex-1 flex flex-col items-center gap-2 p-4 rounded-[8px] border border-[#e5e5e5] hover:border-[#0039c9] hover:-translate-y-0.5 transition-all duration-150 group"
            style={{ background: "#fafafa" }}
          >
            <div className="flex items-center gap-1.5">
              <span style={{ color: iconColor[s.health] }}>{SHARED_STAGE_ICONS[s.key]}</span>
              <span className="text-[11px] font-medium text-[#808488] uppercase tracking-wide whitespace-nowrap">{s.name}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[32px] font-normal leading-none" style={{ color: countColor[s.health] }}>{s.count}</span>
              <span className="text-[10px] text-[#808488]">active</span>
            </div>
            <span className="text-[11px] text-[#808488]">{s.days}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-6 mt-5 pt-4 border-t border-[#f0f0f0]">
        <span className="text-[13px] text-[#808488]">YTD Closed:</span>
        <span className="text-[15px] font-semibold" style={{ color: "#2a8a4a" }}>456 work orders</span>
      </div>
    </div>
  );
}

// ── Signals ───────────────────────────────────────────────────────────────────

function CiSignals() {
  const [, navigate] = useLocation();
  return (
    <div className="bg-white rounded-[8px] p-8 flex flex-col" style={{ boxShadow: "0px 4px 24px 0px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[20px] font-medium text-[#121212]">Active Signals</h3>
        <button
          onClick={() => navigate("/signals")}
          className="text-[13px] font-medium transition-colors hover:opacity-70"
          style={{ color: "#0039c9" }}
        >View More →</button>
      </div>
      <p className="text-[13px] text-[#808488] mb-5">Bottlenecks & product library gaps · Tagged by stage</p>

      <div className="flex flex-col gap-3 flex-1">
        {CI_SIGNALS.map((sig) => {
          const isCrit = sig.level === "critical";
          return (
            <div
              key={sig.title}
              className="rounded-[8px] p-4 border-l-[3px] cursor-pointer"
              style={{
                background: isCrit ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)",
                borderLeftColor: isCrit ? "#ef4444" : "#f59e0b",
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-[3px]"
                  style={{ background: isCrit ? "#fee2e2" : "#fef3c7", color: isCrit ? "#991b1b" : "#92400e" }}>
                  ● {sig.level}
                </span>
                <StageBadge stage={sig.stage} className="text-[11px] text-[#808488] bg-white border border-[#e5e5e5] px-2 py-0.5 rounded-[4px]" />
              </div>
              <p className="text-[13px] font-semibold text-[#121212] mb-0.5">{sig.title}</p>
              <p className="text-[12px] text-[#808488] leading-snug mb-2">{sig.desc}</p>
              <div className="flex gap-4">
                {sig.stats.map(s => (
                  <span key={s.label} className="text-[11px] text-[#808488]">
                    <strong className="text-[#121212]">{s.val}</strong> {s.label}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate("/signals")}
        className="w-full mt-5 text-[13px] font-medium py-2.5 rounded-[8px] border transition-colors"
        style={{ border: "1px solid #0039c9", color: "#0039c9", background: "rgba(0,57,201,0.04)" }}
      >
        View All Signals →
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard",        href: "/dashboard"       },
  { label: "Signals",          href: "/signals"         },
  { label: "Stage Activity",   href: "/stage-activity"  },
  { label: "Field Experience", href: "/field-experience"},
  { label: "Assistant",        href: "/chat"             },
];

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (searchOpen) searchInputRef.current?.focus(); }, [searchOpen]);
  function closeSearch() { setSearchOpen(false); setSearchVal(""); }

  return (
    <div className="min-h-screen bg-[#f6f7fa]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Dark hero ── */}
      <div className="relative bg-[#121212] overflow-hidden" style={{ height: 420 }}>
        {/* Radial glow */}
        <div className="absolute pointer-events-none" style={{
          left: "50%", bottom: -421, transform: "translateX(calc(-50% + 195px))",
          width: 1838, height: 1283,
          backgroundImage: `url(${ASSET_ELLIPSE})`,
          backgroundSize: "contain", backgroundRepeat: "no-repeat",
        }} />

        {/* Diagonal stripe */}
        <div className="absolute pointer-events-none" style={{
          left: "50%", bottom: -626, transform: "translateX(-50%) skewX(-18deg) scaleY(0.95)",
          width: 2821, height: 1375, mixBlendMode: "overlay",
        }}>
          <img src={img31} alt="" className="absolute w-full" style={{ top: "-9.27%", height: "118.53%", maxWidth: "none" }} />
        </div>

        {/* Nav */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between" style={{ padding: "42px 120px 0" }}>
          <img src={ASSET_LOGO} alt="PRO" className="shrink-0" style={{ height: 28, width: 110, objectFit: "contain", objectPosition: "left" }} />

          <div className="flex gap-2 items-center p-1 rounded-[8px]" style={{ backdropFilter: "blur(50px)", boxShadow: "inset 0px 1px 0px 0px rgba(255,255,255,0.1)" }}>
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
            {NAV_ITEMS.map(({ label, href }) => {
              const isActive = label === "Dashboard";
              return (
                <button key={label} onClick={() => navigate(href)}
                  className="flex items-center justify-center text-white text-[16px] font-medium whitespace-nowrap rounded-[8px] transition-colors"
                  style={{
                    height: 43, padding: "12px 26px",
                    background: isActive ? "rgba(194,203,255,0.3)" : "transparent",
                    boxShadow: isActive ? "inset 0px 1px 0px 0px rgba(255,255,255,0.1)" : undefined,
                    backdropFilter: isActive ? "blur(50px)" : undefined,
                  }}>
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="relative w-[30px] h-[30px] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <div className="absolute flex items-center justify-center rounded-full border-2 border-[#121212]"
                style={{ top: -2, right: -2, minWidth: 14, height: 14, background: "#3ed851", padding: "0 3px" }}>
                <span className="text-[9px] text-[#121212] font-semibold leading-none">3</span>
              </div>
            </div>
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

        {/* Title + KPI cards */}
        <div className="absolute flex flex-col gap-6" style={{ top: 133, left: 120, right: 120 }}>
          <p className="text-white text-[40px] font-medium leading-none">Welcome back, Mark!</p>

          <div className="flex gap-4" style={{ boxShadow: "0px 8px 16px 0px rgba(0,0,0,0.12)" }}>
            {KPI_DATA.map((k) => (
              <StatCard key={k.label} {...k} />
            ))}
          </div>
        </div>
      </div>

      {/* ── White body ── */}
      <div className="bg-[#f8f8f8] rounded-t-[24px] -mt-6" style={{ minHeight: "calc(100vh - 420px)" }}>
        <div style={{ padding: "48px 120px 72px" }}>

          {/* Pipeline funnel */}
          <div className="mb-5">
            <PipelineFunnel />
          </div>

          {/* Bubble chart + CI signals */}
          <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: "1fr 400px" }}>
            <div className="bg-white rounded-[8px] p-8 flex flex-col" style={{ boxShadow: "0px 4px 24px 0px rgba(0,0,0,0.06)" }}>
              <h3 className="text-[20px] font-medium text-[#121212] mb-0.5">Performance Drivers</h3>
              <p className="text-[13px] text-[#808488] mb-5">Baseline capacity · Stage drag by bottleneck · Net pipeline projection</p>
              <div className="flex-1 flex flex-col min-h-0">
                <PerformanceDriversChart />
              </div>
            </div>
            <CiSignals />
          </div>

          {/* Bottom 3-col */}
          <div className="grid grid-cols-3 gap-5">

            {/* Revenue at Risk */}
            <div className="bg-white rounded-[8px] p-8" style={{ boxShadow: "0px 4px 24px 0px rgba(0,0,0,0.06)" }}>
              <h3 className="text-[20px] font-medium text-[#121212] mb-0.5">Revenue at Risk</h3>
              <p className="text-[13px] text-[#808488] mb-4">Jobs stalled across pipeline stages</p>
              <div className="mb-5">
                <div className="text-[40px] font-normal leading-none" style={{ color: "#ef4444" }}>$810K</div>
                <div className="text-[12px] mt-1" style={{ color: "#808488" }}>total at risk · 35 jobs affected</div>
              </div>
              {[
                { stage: "Assembly Letter", amount: "$340K", jobs: 14, color: "#ef4444" },
                { stage: "Inspection",      amount: "$290K", jobs:  8, color: "#f59e0b" },
                { stage: "NOA / Warranty",  amount: "$180K", jobs:  6, color: "#f59e0b" },
                { stage: "Submittal",       amount: "$0",    jobs:  0, color: "#2a8a4a" },
              ].map(r => (
                <div key={r.stage} className="flex items-center justify-between py-2.5 border-b border-[#f0f0f0] last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: r.color }} />
                    <span className="text-[13px]" style={{ color: "#404040" }}>{r.stage}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[13px] font-semibold" style={{ color: r.jobs === 0 ? "#2a8a4a" : r.color }}>{r.jobs === 0 ? "Clear" : r.amount}</span>
                    {r.jobs > 0 && <span className="text-[11px] ml-1.5" style={{ color: "#808488" }}>{r.jobs} jobs</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* City Scorecard */}
            <div className="bg-white rounded-[8px] p-8" style={{ boxShadow: "0px 4px 24px 0px rgba(0,0,0,0.06)" }}>
              <h3 className="text-[20px] font-medium text-[#121212] mb-0.5">Overdue Rate by Market</h3>
              <p className="text-[13px] text-[#808488] mb-4">25 markets · ranked high to low</p>
              <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
              {[
                { city: "Dallas",        vol: 24, overdue: 6,  pct: 10, health: "risk" },
                { city: "Phoenix",       vol: 11, overdue: 4,  pct: 10, health: "risk" },
                { city: "San Antonio",   vol: 14, overdue: 4,  pct: 9,  health: "risk" },
                { city: "Kansas City",   vol: 9,  overdue: 2,  pct: 8,  health: "warn" },
                { city: "Detroit",       vol: 10, overdue: 3,  pct: 8,  health: "warn" },
                { city: "Atlanta",       vol: 40, overdue: 8,  pct: 7,  health: "warn" },
                { city: "Houston",       vol: 26, overdue: 5,  pct: 6,  health: "warn" },
                { city: "Raleigh",       vol: 9,  overdue: 2,  pct: 6,  health: "warn" },
                { city: "Baltimore",     vol: 9,  overdue: 2,  pct: 6,  health: "warn" },
                { city: "Los Angeles",   vol: 11, overdue: 2,  pct: 6,  health: "warn" },
                { city: "Nashville",     vol: 14, overdue: 2,  pct: 5,  health: "ok"   },
                { city: "New York",      vol: 34, overdue: 4,  pct: 4,  health: "ok"   },
                { city: "Boston",        vol: 22, overdue: 2,  pct: 4,  health: "ok"   },
                { city: "Philadelphia",  vol: 16, overdue: 2,  pct: 4,  health: "ok"   },
                { city: "Miami",         vol: 18, overdue: 2,  pct: 4,  health: "ok"   },
                { city: "Denver",        vol: 8,  overdue: 1,  pct: 4,  health: "ok"   },
                { city: "Indianapolis",  vol: 8,  overdue: 1,  pct: 4,  health: "ok"   },
                { city: "Chicago",       vol: 30, overdue: 3,  pct: 3,  health: "ok"   },
                { city: "Minneapolis",   vol: 8,  overdue: 1,  pct: 3,  health: "ok"   },
                { city: "Orlando",       vol: 12, overdue: 1,  pct: 3,  health: "ok"   },
                { city: "Charlotte",     vol: 14, overdue: 1,  pct: 2,  health: "ok"   },
                { city: "Tampa",         vol: 12, overdue: 1,  pct: 2,  health: "ok"   },
                { city: "St. Louis",     vol: 10, overdue: 0,  pct: 0,  health: "ok"   },
                { city: "Cincinnati",    vol: 7,  overdue: 0,  pct: 0,  health: "ok"   },
                { city: "Seattle",       vol: 7,  overdue: 0,  pct: 0,  health: "ok"   },
              ].map(r => {
                const hc = r.health === "risk" ? "#ef4444" : r.health === "warn" ? "#f59e0b" : "#2a8a4a";
                return (
                  <div key={r.city} className="flex items-center gap-2.5 py-1.5 border-b border-[#f0f0f0] last:border-0">
                    <span className="text-[10.5px] font-medium w-24 shrink-0" style={{ color: "#404040" }}>{r.city}</span>
                    <div className="flex-1">
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: "#f0f0f0" }}>
                        <div className="h-full rounded-full" style={{ width: `${(r.vol / 40) * 100}%`, background: hc, opacity: 0.55 }} />
                      </div>
                    </div>
                    <span className="text-[11px] w-6 text-right shrink-0" style={{ color: "#808488" }}>{r.vol}</span>
                    <span className="text-[10.5px] font-semibold w-12 text-right shrink-0" style={{ color: hc }}>{r.overdue > 0 ? `${r.pct}% OD` : "Clear"}</span>
                  </div>
                );
              })}
              </div>
            </div>

            {/* Key Account Watch */}
            <div className="bg-white rounded-[8px] p-8" style={{ boxShadow: "0px 4px 24px 0px rgba(0,0,0,0.06)" }}>
              <h3 className="text-[20px] font-medium text-[#121212] mb-0.5">Key Account Watch</h3>
              <p className="text-[13px] text-[#808488] mb-5">Top contractors by pipeline value</p>
              {[
                { name: "Apex Roofing LLC",    value: "$2.4M", jobs: 18, status: "At Risk",  statusColor: "#ef4444", bg: "rgba(239,68,68,0.06)"   },
                { name: "Summit Commercial",   value: "$1.9M", jobs: 14, status: "On Track",  statusColor: "#2a8a4a", bg: "rgba(42,138,74,0.06)"   },
                { name: "Trident Contractors", value: "$1.6M", jobs: 12, status: "Watch",     statusColor: "#f59e0b", bg: "rgba(245,158,11,0.06)"  },
                { name: "Keystone Roofing",    value: "$1.1M", jobs:  9, status: "On Track",  statusColor: "#2a8a4a", bg: "rgba(42,138,74,0.06)"   },
                { name: "Horizon Commercial",  value: "$0.8M", jobs:  7, status: "At Risk",   statusColor: "#ef4444", bg: "rgba(239,68,68,0.06)"   },
              ].map(r => (
                <div key={r.name} className="flex items-center justify-between py-2.5 border-b border-[#f0f0f0] last:border-0">
                  <div>
                    <div className="text-[13px] font-medium" style={{ color: "#121212" }}>{r.name}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: "#808488" }}>{r.jobs} jobs · {r.value}</div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-[4px]" style={{ background: r.bg, color: r.statusColor }}>{r.status}</span>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>

      <AiAssistant />
    </div>
  );
}
