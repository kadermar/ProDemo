import { useLocation } from "wouter";

const STAGES_DATA = [
  { name: "Proposal",        vol: 124, cyclePct: 60,  overdue: 0,  atRisk: 0,      cycleStr: "1.2d", sla: "2d",  health: "ok"   },
  { name: "Assembly Letter", vol: 89,  cyclePct: 210, overdue: 14, atRisk: 340000, cycleStr: "2.1d", sla: "1d",  health: "risk" },
  { name: "Submittal",       vol: 67,  cyclePct: 80,  overdue: 0,  atRisk: 0,      cycleStr: "0.8d", sla: "1d",  health: "ok"   },
  { name: "Quote",           vol: 45,  cyclePct: 75,  overdue: 1,  atRisk: 38000,  cycleStr: "1.5d", sla: "2d",  health: "ok"   },
  { name: "NOA / Warranty",  vol: 38,  cyclePct: 160, overdue: 6,  atRisk: 180000, cycleStr: "3.2d", sla: "2d",  health: "warn" },
  { name: "Inspection",      vol: 28,  cyclePct: 128, overdue: 8,  atRisk: 290000, cycleStr: "6.4d", sla: "5d",  health: "warn" },
];

const healthColor = (h: string) =>
  h === "risk" ? "#ef4444" : h === "warn" ? "#f59e0b" : "#2a8a4a";
const healthFill = (h: string) =>
  h === "risk" ? "rgba(239,68,68,0.12)" : h === "warn" ? "rgba(245,158,11,0.10)" : "rgba(42,138,74,0.10)";

function fmt$(n: number) {
  if (n === 0) return "—";
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}

/* ─── Option 1 ─────────────────────────────────────────────────── */
function Chart1() {
  return (
    <div className="flex flex-col gap-3">
      {STAGES_DATA.map((s) => {
        const barPct = Math.min(s.cyclePct, 100);
        const color = healthColor(s.health);
        return (
          <div key={s.name} className="flex items-center gap-4">
            <span className="text-[13px] text-[#121212] font-medium" style={{ width: 130, flexShrink: 0 }}>
              {s.name}
            </span>
            <div className="flex-1 relative" style={{ height: 8 }}>
              <div className="absolute inset-0 rounded-full bg-[#f0f0f0]" />
              <div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{ width: `${barPct}%`, background: color, transition: "width 0.4s" }}
              />
              {/* red 100% marker */}
              <div
                className="absolute top-0 h-full"
                style={{ left: "100%", width: 2, background: "#ef4444", transform: "translateX(-1px)" }}
              />
              <span
                className="absolute text-[11px] font-semibold"
                style={{ right: 4, top: -14, color }}
              >
                {s.cyclePct}%
              </span>
            </div>
            <div style={{ width: 60, textAlign: "right", flexShrink: 0 }}>
              {s.overdue > 0 ? (
                <span
                  className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: "#ef4444" }}
                >
                  {s.overdue} overdue
                </span>
              ) : (
                <span className="text-[12px] text-[#c0c0c0]">—</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Option 2 ─────────────────────────────────────────────────── */
function GaugeSVG({ stage }: { stage: typeof STAGES_DATA[0] }) {
  const cx = 60, cy = 70, r = 50;
  const startDeg = 200, totalDeg = 140;
  const maxPct = 200;

  function degToRad(d: number) { return (d * Math.PI) / 180; }
  function polarToXY(deg: number) {
    const rad = degToRad(deg);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  function arcPath(startD: number, endD: number) {
    const s = polarToXY(startD);
    const e = polarToXY(endD);
    const large = endD - startD > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const endDeg = startDeg + totalDeg;
  const pct100Deg = startDeg + (100 / maxPct) * totalDeg;
  const needlePct = Math.min(s.cyclePct, maxPct);
  const needleDeg = startDeg + (needlePct / maxPct) * totalDeg;
  const needleEnd = polarToXY(needleDeg);
  const color = healthColor(stage.health);

  return (
    <svg viewBox="0 0 120 80" width={130} height={87}>
      {/* bg arc gray */}
      <path d={arcPath(startDeg, pct100Deg)} fill="none" stroke="#e5e7eb" strokeWidth={8} strokeLinecap="round" />
      {/* red zone 100–200% */}
      <path d={arcPath(pct100Deg, endDeg)} fill="none" stroke="rgba(239,68,68,0.18)" strokeWidth={8} />
      {/* foreground arc */}
      <path d={arcPath(startDeg, needleDeg)} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" />
      {/* needle */}
      <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke="#121212" strokeWidth={2} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={3} fill="#121212" />
      {/* labels */}
      <text x={cx} y={cy - 14} textAnchor="middle" fontSize={9} fill={color} fontWeight="700">
        {stage.cyclePct}%
      </text>
      <text x={cx} y={79} textAnchor="middle" fontSize={8} fill="#808488">
        {stage.name.length > 12 ? stage.name.slice(0, 11) + "…" : stage.name}
      </text>
    </svg>
  );
}

function Chart2() {
  return (
    <div className="flex flex-wrap gap-6 justify-center">
      {STAGES_DATA.map((s) => (
        <div key={s.name} className="flex flex-col items-center">
          <GaugeSVG stage={s} />
        </div>
      ))}
    </div>
  );
}

/* ─── Option 3 ─────────────────────────────────────────────────── */
function Chart3() {
  const metrics = [
    { label: "Volume", key: "vol" as const },
    { label: "SLA %",  key: "cyclePct" as const },
    { label: "Overdue", key: "overdue" as const },
    { label: "$ at Risk", key: "atRisk" as const },
  ];

  function cellBg(key: string, val: number) {
    if (key === "vol") {
      const t = val / 124;
      return `rgba(0,57,201,${0.05 + t * 0.22})`;
    }
    if (key === "cyclePct") {
      if (val < 100) return "rgba(42,138,74,0.12)";
      if (val <= 150) return "rgba(245,158,11,0.12)";
      return "rgba(239,68,68,0.14)";
    }
    if (key === "overdue") {
      if (val === 0) return "rgba(42,138,74,0.10)";
      if (val <= 5) return "rgba(245,158,11,0.12)";
      return "rgba(239,68,68,0.14)";
    }
    if (key === "atRisk") {
      if (val === 0) return "rgba(42,138,74,0.10)";
      if (val < 150000) return "rgba(245,158,11,0.12)";
      return "rgba(239,68,68,0.14)";
    }
    return "#fff";
  }

  function cellText(key: string, val: number) {
    if (key === "vol") return String(val);
    if (key === "cyclePct") return `${val}%`;
    if (key === "overdue") return String(val);
    if (key === "atRisk") return val === 0 ? "—" : fmt$(val);
    return String(val);
  }

  function cellColor(key: string, val: number) {
    if (key === "cyclePct") {
      if (val < 100) return "#2a8a4a";
      if (val <= 150) return "#f59e0b";
      return "#ef4444";
    }
    if (key === "overdue") {
      if (val === 0) return "#2a8a4a";
      if (val <= 5) return "#f59e0b";
      return "#ef4444";
    }
    if (key === "atRisk") {
      if (val === 0) return "#2a8a4a";
      if (val < 150000) return "#f59e0b";
      return "#ef4444";
    }
    return "#121212";
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 4 }}>
        <thead>
          <tr>
            <th style={{ width: 100 }} />
            {STAGES_DATA.map((s) => (
              <th
                key={s.name}
                className="text-[11px] font-bold uppercase tracking-widest text-[#808488] text-center pb-2"
                style={{ fontWeight: 700 }}
              >
                {s.name.split(" ")[0]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.key}>
              <td className="text-[12px] font-semibold text-[#808488] pr-3 py-1" style={{ whiteSpace: "nowrap" }}>
                {m.label}
              </td>
              {STAGES_DATA.map((s) => {
                const val = s[m.key] as number;
                return (
                  <td
                    key={s.name}
                    className="text-center py-3 px-2 rounded-[4px]"
                    style={{
                      background: cellBg(m.key, val),
                      color: cellColor(m.key, val),
                      fontWeight: 700,
                      fontSize: 14,
                      borderRadius: 4,
                    }}
                  >
                    {cellText(m.key, val)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Option 4 ─────────────────────────────────────────────────── */
function Chart4() {
  const maxVol = 130;
  const svgH = 220;
  const barW = 52;
  const chartH = 160;
  const baseline = svgH - 40;
  const stages = STAGES_DATA;
  const n = stages.length;
  const totalW = 560;
  const gap = (totalW - n * barW) / (n + 1);

  return (
    <svg viewBox={`0 0 ${totalW} ${svgH}`} width="100%" style={{ maxWidth: totalW }}>
      {/* Y-axis gridlines */}
      {[0, 50, 100, 130].map((v) => {
        const y = baseline - (v / maxVol) * chartH;
        return (
          <g key={v}>
            <line x1={40} x2={totalW - 10} y1={y} y2={y} stroke="#f0f0f0" strokeWidth={1} />
            <text x={35} y={y + 4} textAnchor="end" fontSize={9} fill="#b0b0b0">{v}</text>
          </g>
        );
      })}

      {stages.map((s, i) => {
        const x = gap + i * (barW + gap);
        const totalH = (s.vol / maxVol) * chartH;
        const overdueH = s.overdue > 0 ? Math.max((s.overdue / s.vol) * totalH, 14) : 0;
        const healthyH = totalH - overdueH;
        const color = healthColor(s.health);

        return (
          <g key={s.name}>
            {/* healthy portion */}
            <rect
              x={x} y={baseline - totalH} width={barW} height={healthyH}
              fill={s.health === "ok" ? "#2a8a4a" : color}
              rx={s.overdue === 0 ? 4 : 0}
              style={{ opacity: 0.85 }}
            />
            {/* overdue portion */}
            {overdueH > 0 && (
              <>
                <rect
                  x={x} y={baseline - overdueH} width={barW} height={overdueH}
                  fill="#ef4444" rx={4}
                  style={{ opacity: 0.9 }}
                />
                <text x={x + barW / 2} y={baseline - overdueH / 2 + 4} textAnchor="middle" fontSize={9} fill="white" fontWeight="700">
                  {s.overdue}
                </text>
              </>
            )}
            {/* vol label */}
            <text x={x + barW / 2} y={baseline - totalH - 6} textAnchor="middle" fontSize={11} fill="#121212" fontWeight="700">
              {s.vol}
            </text>
            {/* stage name */}
            <text x={x + barW / 2} y={baseline + 14} textAnchor="middle" fontSize={9} fill="#808488">
              {s.name.split(" ")[0]}
            </text>
            {s.name.split(" ").length > 1 && (
              <text x={x + barW / 2} y={baseline + 24} textAnchor="middle" fontSize={9} fill="#808488">
                {s.name.split(" ").slice(1).join(" ")}
              </text>
            )}
          </g>
        );
      })}

      {/* Legend */}
      <rect x={160} y={svgH - 14} width={10} height={10} fill="#2a8a4a" rx={2} />
      <text x={174} y={svgH - 5} fontSize={10} fill="#808488">On Track</text>
      <rect x={240} y={svgH - 14} width={10} height={10} fill="#ef4444" rx={2} />
      <text x={254} y={svgH - 5} fontSize={10} fill="#808488">Overdue</text>
    </svg>
  );
}

/* ─── Option 5 ─────────────────────────────────────────────────── */
function Chart5() {
  const maxTotal = STAGES_DATA.reduce((mx, s) => {
    const healthy = s.vol * 15000 - s.atRisk;
    return Math.max(mx, healthy + s.atRisk);
  }, 0);

  return (
    <div className="flex flex-col gap-3">
      {STAGES_DATA.map((s) => {
        const healthy = Math.max(s.vol * 15000 - s.atRisk, 0);
        const total = healthy + s.atRisk;
        const healthyPct = (healthy / maxTotal) * 100;
        const riskPct = (s.atRisk / maxTotal) * 100;

        return (
          <div key={s.name} className="flex items-center gap-4">
            <span className="text-[13px] font-medium text-[#121212]" style={{ width: 140, flexShrink: 0 }}>
              {s.name}
            </span>
            <div className="flex-1 flex h-9 rounded-[6px] overflow-hidden" style={{ background: "#f0f0f0" }}>
              <div
                style={{ width: `${healthyPct}%`, background: "#2a8a4a", opacity: 0.85 }}
                className="flex items-center justify-end pr-2"
              >
                <span className="text-[11px] font-semibold text-white">{fmt$(healthy)}</span>
              </div>
              {s.atRisk > 0 && (
                <div
                  style={{ width: `${riskPct}%`, background: "#ef4444", opacity: 0.9 }}
                  className="flex items-center justify-center"
                >
                  <span className="text-[11px] font-bold text-white whitespace-nowrap px-1">
                    {fmt$(s.atRisk)} at risk
                  </span>
                </div>
              )}
              {s.atRisk === 0 && (
                <div className="flex items-center pl-3">
                  <span className="text-[11px] font-semibold text-[#2a8a4a]">Clear</span>
                </div>
              )}
            </div>
            <span className="text-[12px] text-[#808488]" style={{ width: 60, textAlign: "right", flexShrink: 0 }}>
              {fmt$(total)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Option 6 ─────────────────────────────────────────────────── */
function Chart6() {
  const cols = ["Stage", "Active WOs", "Avg Cycle", "SLA", "% of SLA", "Overdue", "$ at Risk"];

  function rowBg(h: string) {
    if (h === "risk") return "#fef2f2";
    if (h === "warn") return "#fffbeb";
    return "#ffffff";
  }
  function slaColor(v: number) {
    if (v < 100) return "#2a8a4a";
    if (v <= 150) return "#f59e0b";
    return "#ef4444";
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#fafafa" }}>
            {cols.map((c) => (
              <th
                key={c}
                className="text-[11px] font-bold uppercase tracking-widest text-[#808488] text-left px-4 py-3"
                style={{ borderBottom: "1px solid #f0f0f0" }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {STAGES_DATA.map((s, i) => (
            <tr key={s.name} style={{ background: rowBg(s.health), borderBottom: "1px solid #f5f5f5" }}>
              <td className="px-4 py-3 text-[13px] font-semibold text-[#121212]">{s.name}</td>
              <td className="px-4 py-3 text-[13px] text-[#121212]">{s.vol}</td>
              <td className="px-4 py-3 text-[13px] text-[#121212]">{s.cycleStr}</td>
              <td className="px-4 py-3 text-[13px] text-[#808488]">{s.sla}</td>
              <td className="px-4 py-3">
                <span
                  className="text-[13px] font-bold"
                  style={{ color: slaColor(s.cyclePct) }}
                >
                  {s.cyclePct}%
                </span>
              </td>
              <td className="px-4 py-3 text-[13px]">
                {s.overdue > 0 ? (
                  <span className="font-bold text-[#ef4444]">{s.overdue}</span>
                ) : (
                  <span className="text-[#c0c0c0]">0</span>
                )}
              </td>
              <td className="px-4 py-3 text-[13px]">
                {s.atRisk > 0 ? (
                  <span className="font-semibold" style={{ color: slaColor(s.cyclePct) }}>
                    {fmt$(s.atRisk)}
                  </span>
                ) : (
                  <span className="text-[#c0c0c0]">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Option 7 ─────────────────────────────────────────────────── */
function Chart7() {
  // Row 1: Assembly Letter ($340K), Inspection ($290K)
  // Row 2: NOA ($180K), Quote ($38K), Proposal (clear), Submittal (clear)
  const row1 = [
    { ...STAGES_DATA[1], widthPct: 55 },  // Assembly Letter
    { ...STAGES_DATA[5], widthPct: 45 },  // Inspection
  ];
  const row2 = [
    { ...STAGES_DATA[4], widthPct: 38 }, // NOA
    { ...STAGES_DATA[3], widthPct: 20 }, // Quote
    { ...STAGES_DATA[0], widthPct: 21 }, // Proposal (clear)
    { ...STAGES_DATA[2], widthPct: 21 }, // Submittal (clear)
  ];

  function Tile({ s, widthPct, rowH }: { s: typeof STAGES_DATA[0]; widthPct: number; rowH: number }) {
    return (
      <div
        style={{
          width: `${widthPct}%`,
          height: rowH,
          background: healthFill(s.health),
          border: `1.5px solid ${healthColor(s.health)}30`,
          borderRadius: 8,
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#121212", marginBottom: 2 }}>{s.name}</div>
          {s.atRisk > 0 ? (
            <div style={{ fontSize: 22, fontWeight: 800, color: healthColor(s.health), lineHeight: 1.1 }}>
              {fmt$(s.atRisk)}
            </div>
          ) : (
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2a8a4a" }}>Clear</div>
          )}
        </div>
        <div style={{ fontSize: 11, color: "#808488" }}>
          {s.overdue > 0 ? (
            <span style={{ color: "#ef4444", fontWeight: 700 }}>{s.overdue} overdue</span>
          ) : (
            <span>{s.vol} WOs · on track</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {row1.map((item) => (
          <Tile key={item.name} s={item} widthPct={item.widthPct} rowH={110} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {row2.map((item) => (
          <Tile key={item.name} s={item} widthPct={item.widthPct} rowH={90} />
        ))}
      </div>
    </div>
  );
}

/* ─── Option 8 ─────────────────────────────────────────────────── */
const SLOPE_DATA = [
  { ...STAGES_DATA[0], feb: 55,  mar: 60  },  // Proposal   — flat/ok
  { ...STAGES_DATA[1], feb: 170, mar: 210 },  // Assembly   — worsening
  { ...STAGES_DATA[2], feb: 90,  mar: 80  },  // Submittal  — improving
  { ...STAGES_DATA[3], feb: 80,  mar: 75  },  // Quote      — improving
  { ...STAGES_DATA[4], feb: 140, mar: 160 },  // NOA        — worsening
  { ...STAGES_DATA[5], feb: 110, mar: 128 },  // Inspection — worsening
];

function Chart8() {
  const svgW = 560, svgH = 260;
  const xFeb = 150, xMar = 430;
  const yTop = 20, yBot = 220;
  const maxY = 220;

  function yPos(pct: number) {
    return yTop + ((maxY - Math.min(pct, maxY)) / maxY) * (yBot - yTop);
  }

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" style={{ maxWidth: svgW }}>
      {/* Y gridlines */}
      {[0, 50, 100, 150, 200].map((v) => {
        const y = yPos(v);
        return (
          <g key={v}>
            <line
              x1={80} x2={svgW - 40} y1={y} y2={y}
              stroke={v === 100 ? "#ef4444" : "#f0f0f0"}
              strokeWidth={v === 100 ? 1.5 : 1}
              strokeDasharray={v === 100 ? "6 4" : "0"}
            />
            <text x={75} y={y + 4} textAnchor="end" fontSize={9} fill={v === 100 ? "#ef4444" : "#b0b0b0"}>{v}%</text>
          </g>
        );
      })}

      {/* Column headers */}
      <text x={xFeb} y={yTop - 6} textAnchor="middle" fontSize={11} fill="#808488" fontWeight="700">Feb</text>
      <text x={xMar} y={yTop - 6} textAnchor="middle" fontSize={11} fill="#808488" fontWeight="700">Mar</text>

      {SLOPE_DATA.map((s) => {
        const yF = yPos(s.feb);
        const yM = yPos(s.mar);
        const worsening = s.mar > s.feb + 2;
        const improving = s.feb > s.mar + 2;
        const lineColor = worsening ? "#ef4444" : improving ? "#2a8a4a" : "#c0c0c0";
        const arrow = worsening ? "↑" : improving ? "↓" : "→";

        return (
          <g key={s.name}>
            <line x1={xFeb} y1={yF} x2={xMar} y2={yM} stroke={lineColor} strokeWidth={2} />
            <circle cx={xFeb} cy={yF} r={5} fill={lineColor} />
            <circle cx={xMar} cy={yM} r={5} fill={lineColor} />
            {/* Left label */}
            <text x={xFeb - 10} y={yF + 4} textAnchor="end" fontSize={10} fill="#121212">
              {s.name.split(" ")[0]} {arrow}
            </text>
            <text x={xFeb - 10} y={yF + 15} textAnchor="end" fontSize={9} fill="#808488">
              {s.feb}%
            </text>
            {/* Right label */}
            <text x={xMar + 10} y={yM + 4} textAnchor="start" fontSize={10} fill={lineColor} fontWeight="700">
              {s.mar}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Option 9 ─────────────────────────────────────────────────── */
function Chart9() {
  const maxVol = 124;
  const svgW = 580, svgH = 200;
  const barW = 60;
  const n = STAGES_DATA.length;
  const spacing = (svgW - n * barW) / (n + 1);
  const maxBarH = 140;
  const cy = svgH / 2;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" style={{ maxWidth: svgW }}>
      {STAGES_DATA.map((s, i) => {
        const x = spacing + i * (barW + spacing);
        const barH = Math.max((s.vol / maxVol) * maxBarH, 24);
        const y = cy - barH / 2;
        const overdueH = s.overdue > 0 ? Math.max((s.overdue / s.vol) * barH, 12) : 0;
        const color = healthColor(s.health);

        return (
          <g key={s.name}>
            {/* Main bar */}
            <rect x={x} y={y} width={barW} height={barH} fill={color} rx={6} opacity={0.85} />
            {/* Overdue overlay */}
            {overdueH > 0 && (
              <rect
                x={x + 4} y={y + 4} width={barW - 8} height={overdueH - 4}
                fill="#ef4444" rx={4} opacity={0.7}
              />
            )}
            {/* Vol label inside */}
            <text x={x + barW / 2} y={cy + 5} textAnchor="middle" fontSize={11} fill="white" fontWeight="700">
              {s.vol}
            </text>
            {/* Stage name above */}
            <text x={x + barW / 2} y={y - 10} textAnchor="middle" fontSize={8} fill="#808488">
              {s.name.split(" ")[0]}
            </text>
            {s.name.split(" ").length > 1 && (
              <text x={x + barW / 2} y={y - 2} textAnchor="middle" fontSize={8} fill="#808488">
                {s.name.split(" ").slice(1).join(" ")}
              </text>
            )}
            {/* At risk below */}
            {s.atRisk > 0 && (
              <text x={x + barW / 2} y={y + barH + 14} textAnchor="middle" fontSize={8} fill="#ef4444" fontWeight="700">
                {fmt$(s.atRisk)}
              </text>
            )}
            {/* Arrow to next */}
            {i < n - 1 && (
              <text
                x={x + barW + spacing / 2}
                y={cy + 5}
                textAnchor="middle"
                fontSize={14}
                fill="#c0c0c0"
              >
                →
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Option 10 ─────────────────────────────────────────────────── */
function Chart10() {
  const cx = 140, cy = 140, r = 100;
  // Clockwise from top: Proposal, Assembly Letter, Quote, Inspection, NOA/Warranty, Submittal
  const order = [0, 1, 3, 5, 4, 2]; // indices into STAGES_DATA
  const stages = order.map((i) => STAGES_DATA[i]);

  function healthScore(s: typeof STAGES_DATA[0]) {
    const excess = Math.max(s.cyclePct - 100, 0);
    return Math.max(100 - Math.min(excess, 100), 0);
  }

  function axisPoint(i: number, radius: number) {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  }

  // Concentric hexagons
  const rings = [25, 50, 75, 100];
  function hexPath(radius: number) {
    const pts = Array.from({ length: 6 }, (_, i) => axisPoint(i, radius));
    return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  }

  // Data polygon
  const dataPoints = stages.map((s, i) => {
    const score = healthScore(s);
    return axisPoint(i, (score / 100) * r);
  });
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 280 280" width={280} height={280}>
        {/* Grid rings */}
        {rings.map((pct) => (
          <path
            key={pct}
            d={hexPath((pct / 100) * r)}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={pct === 100 ? 1.5 : 1}
          />
        ))}

        {/* Axis lines */}
        {stages.map((_, i) => {
          const tip = axisPoint(i, r);
          return (
            <line key={i} x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="#e5e7eb" strokeWidth={1} />
          );
        })}

        {/* Data polygon */}
        <path d={dataPath} fill="rgba(0,57,201,0.12)" stroke="#0039c9" strokeWidth={2} />

        {/* Dots + labels */}
        {stages.map((s, i) => {
          const score = healthScore(s);
          const dot = axisPoint(i, (score / 100) * r);
          const tip = axisPoint(i, r + 18);
          const color = healthColor(s.health);

          return (
            <g key={s.name}>
              <circle cx={dot.x} cy={dot.y} r={4} fill="#0039c9" />
              {s.overdue > 0 && (
                <g>
                  <circle cx={dot.x + 8} cy={dot.y - 8} r={7} fill="#ef4444" />
                  <text x={dot.x + 8} y={dot.y - 5} textAnchor="middle" fontSize={7} fill="white" fontWeight="700">
                    {s.overdue}
                  </text>
                </g>
              )}
              <text
                x={tip.x}
                y={tip.y}
                textAnchor={tip.x < cx - 10 ? "end" : tip.x > cx + 10 ? "start" : "middle"}
                fontSize={9}
                fill={color}
                fontWeight="600"
              >
                {s.name.split(" ")[0]}
              </text>
            </g>
          );
        })}

        {/* Ring % labels */}
        {rings.map((pct) => (
          <text key={pct} x={cx + 2} y={cy - (pct / 100) * r + 4} textAnchor="middle" fontSize={7} fill="#c0c0c0">
            {pct}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */
const CHARTS: {
  name: string;
  desc: string;
  component: React.FC;
}[] = [
  { name: "Horizontal SLA Progress Bars",  desc: "Each stage as a row · Bar = cycle time as % of SLA · Red marker at 100% threshold",                            component: Chart1  },
  { name: "SLA Gauge Row",                 desc: "Six arc gauges · Needle position = cycle % of SLA · Red zone beyond 100%",                                       component: Chart2  },
  { name: "Heatmap Matrix",                desc: "Stages as columns · 4 metrics as rows · Color-coded cells from green to red",                                    component: Chart3  },
  { name: "Stacked Bar Chart",             desc: "Total WO volume per stage · Split into on-track (green) and at-risk (red/amber) jobs",                           component: Chart4  },
  { name: "Revenue Waterfall",             desc: "Dollar value flowing cleanly vs stalled at each stage · Sized to financial impact",                              component: Chart5  },
  { name: "Executive Scorecard Table",     desc: "All metrics in one scannable table · Color-coded rows by health status",                                         component: Chart6  },
  { name: "Treemap",                       desc: "Rectangles sized by revenue at risk · Color by health · Instantly shows where money is stuck",                   component: Chart7  },
  { name: "Slope / Trend Chart",           desc: "Last month vs this month SLA performance · Lines show trajectory — improving, worsening, or flat",               component: Chart8  },
  { name: "Pipeline Funnel with Risk Overlay", desc: "Volume flows left to right · Red overlay shows stalled jobs · $ at risk labeled per stage",                 component: Chart9  },
  { name: "Radar / Spider Chart",          desc: "Hexagonal chart · Each axis = one stage · Shape shows where the operation is out of balance",                    component: Chart10 },
];

export default function ChartGalleryPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#f8f8f8]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="bg-[#121212]" style={{ padding: "40px 120px" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#808488] text-[13px] mb-1">Dashboard · Stage Health Chart</p>
            <h1 className="text-white text-[36px] font-medium leading-none">10 Chart Options</h1>
            <p className="text-[#808488] text-[14px] mt-2">Review each visualization and tell me which to use</p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-white text-[14px] font-medium px-5 py-2.5 rounded-[8px]"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="bg-[#f8f8f8] rounded-t-[24px] -mt-4">
        <div style={{ padding: "48px 120px 80px" }} className="flex flex-col gap-6">
          {CHARTS.map((chart, idx) => {
            const Comp = chart.component;
            return (
              <div
                key={chart.name}
                className="bg-white rounded-[8px] p-8"
                style={{ boxShadow: "0px 4px 24px 0px rgba(0,0,0,0.06)" }}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-[#f0f0f0] text-[#808488]">
                    Option {idx + 1}
                  </span>
                  <h3 className="text-[20px] font-medium text-[#121212]">{chart.name}</h3>
                </div>
                <p className="text-[13px] text-[#808488] mb-6">{chart.desc}</p>
                <Comp />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
