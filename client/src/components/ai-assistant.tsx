import { useState, useRef, useEffect } from "react";
import aiFabIcon from "@assets/ai-fab-icon.svg";

const ASSET_LOGO = "https://www.figma.com/api/mcp/asset/f082240c-6cf6-4077-bfb9-9552e0aa06dd";
const ASSET_CLOSE = "https://www.figma.com/api/mcp/asset/ada45d95-25a2-498f-9930-5a047a7a0240";
const ASSET_SEND = "https://www.figma.com/api/mcp/asset/684a2f0a-d2b1-409a-beed-899606bf4e7a";

interface Message {
  id: number;
  role: "ai" | "user";
  text: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: "ai",
    text: "Hello! I'm Carlie, your intelligent Copilot. How can I help you today?",
  },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2" style={{ minWidth: 48 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#c0c8d8",
            display: "inline-block",
            animation: "carlieTyping 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes carlieTyping {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function getResponse(q: string): string {
    const t = q.toLowerCase();
    if (t.match(/revenue|risk|\$|money|financial/))
      return "$810K is currently at risk across 35 stalled jobs. Assembly Letter leads at $340K (14 overdue), followed by Inspection at $290K (8 overdue) and NOA/Warranty at $180K. Resolving SIG-001 — the EPDM seam tape spec gap — would clear ~64% of the Assembly backlog and unblock the downstream chain.";
    if (t.match(/assembly|letter|design.?analyst|epdm|seam.?tape|sig.?001/))
      return "Assembly Letter is the critical bottleneck. 89 active orders, 14 past the 1-day SLA — currently running at 2.1× average. Root cause: SIG-001, missing EPDM seam tape sub-type data causing a 31% revision rate. 23 jobs have looped back for rework, adding +1.4 days each. Estimated 2-day fix that would recover ~$340K in stalled fee value.";
    if (t.match(/inspection|fsr|field.?service|re.?inspect/))
      return "8 inspections are 7+ days overdue — concentrated in Atlanta where FSR capacity is maxed. Re-inspection rate is 22%, above the 15% benchmark. 6 failures trace to EPDM seam lap spec mismatches (SIG-004), meaning the product library gap is creating rework downstream. Each re-inspection costs ~$1.8K. Reallocating 3 jobs to the Mid-Atlantic FSR team would clear the backlog within 48 hours.";
    if (t.match(/noa|warranty|certificate|admin.?capacity/))
      return "Warranty Admin is at 112% capacity. 6 contractors are waiting over 5 days for NOA approval — $120K at risk. 2 cases involve PVC multi-ply stacking questions with no product library guidance, forcing manual escalation each time. A 2-hour documentation update would prevent future recurrence.";
    if (t.match(/signal|alert|critical|bottleneck|biggest.?issue|biggest.?problem/))
      return "3 critical signals, 1 high-priority active now. (1) SIG-002 — Design Analyst queue at 89 jobs, 14 overdue. (2) SIG-001 — EPDM seam tape gap, 31% revision rate on affected jobs. (3) SIG-007 — FSR backlog in Atlanta, 8 inspections overdue, $480K at risk. Fixing SIG-001 resolves the root cause for ~64% of all downstream delays.";
    if (t.match(/dallas|phoenix|san antonio/)) {
      const city = t.includes("dallas") ? "Dallas" : t.includes("phoenix") ? "Phoenix" : "San Antonio";
      const pct = city === "Dallas" ? "10%" : "9–10%";
      return `${city} is flagged as a risk market with a ${pct} overdue rate — highest tier across all 25 cities. Recommend a regional review with the Southwest sales team and spot-check the product spec submissions coming from that market.`;
    }
    if (t.match(/atlanta/))
      return "Atlanta is your highest-volume market — 40 active work orders, 7% overdue rate (watch). It's also where the FSR inspection backlog is concentrated: 8 jobs 7+ days overdue, $480K at risk. Apex Roofing LLC, your largest Atlanta contractor, has jobs flagged across Assembly Letter and Inspection for EPDM issues.";
    if (t.match(/city|cities|market|geographic|where|region/))
      return "Across 25 markets: Dallas, Phoenix, and San Antonio are risk-flagged (8–10% overdue). Atlanta, Houston, Detroit, Kansas City, Baltimore, Raleigh, and Los Angeles are on watch (4–8%). New York, Chicago, Boston, Nashville, Charlotte, Tampa, and Orlando are clean. Focus action on the Southwest corridor first.";
    if (t.match(/contractor|account|apex|summit|trident|keystone|horizon|atlas|meridian|crown/))
      return "Top 5 contractors by pipeline value: Apex Roofing ($2.4M, 18 jobs — At Risk, EPDM backlog), Summit Commercial ($1.9M, 14 jobs — On Track), Trident Contractors ($1.6M, 12 jobs — Watch), Keystone Roofing ($1.1M, 9 jobs — On Track), Horizon Commercial ($0.8M, 7 jobs — At Risk, Dallas overdue). Apex and Horizon need immediate attention.";
    if (t.match(/cycle.?time|sla|over.?sla|past.?sla|how.?fast|how.?slow/))
      return "Cycle time vs SLA across 6 stages: Proposal 1.2d ✓ (SLA 2d), Assembly Letter 2.1d ✗ (SLA 1d — 2.1× over), Submittal 0.8d ✓ (SLA 1d), Quote 1.5d ✓ (SLA 2d), NOA/Warranty 3.2d ✗ (SLA 3d — marginal), Inspection 6.4d ✗ (SLA 5d). Two stages — Assembly and Inspection — are breaching SLA and driving revenue risk.";
    if (t.match(/product.?library|spec.?gap|insulation|r.?value/))
      return "Highest-impact product library gap: SIG-001 — EPDM seam tape sub-types not differentiated (lap sealant vs. cover tape vs. splice tape). 23 jobs reworked this month, +1.4 days each. Secondary: insulation R-value / ASHRAE 90.1 data missing, affecting 9 jobs. PVC multi-ply warranty stacking also undocumented — stalling 5 quotes. All three are fixable within a sprint.";
    if (t.match(/overdue|past.?due|late/))
      return "Current overdue snapshot: Assembly Letter — 14 jobs (critical, $340K), Inspection — 8 jobs (high, $290K), NOA/Warranty — 6 jobs (high, $120K), Proposal — 2 jobs (minor), Quote — 2 jobs (minor). Assembly and Inspection combined account for $630K of the $810K total at risk.";
    if (t.match(/proposal|pipeline|funnel|stage|volume/))
      return "Pipeline snapshot across 391 active work orders: Proposal 124 (healthy), Assembly Letter 89 (bottleneck — critical), Submittal 67 (healthy), Quote 45 (healthy), NOA/Warranty 38 (watch), Inspection 28 (watch). The Assembly Letter stage is the primary flow constraint — clearing the backlog unlocks all downstream stages.";
    if (t.match(/missing.?field|contractor.?form|submission.?form/))
      return "6 contractor proposal submissions are missing required job-scope fields this month — most commonly membrane type and installation square footage. These incomplete records add ~0.5 days to the proposal stage before they can be qualified and advanced to Assembly Letter.";
    if (t.match(/redistribute|workload|staff|analyst.?queue/))
      return "Current Design Analyst queue is 89 jobs across 3 analysts — 29.7 per analyst vs a benchmark of ~20. Recommend re-routing 8 non-wind-uplift letters to a secondary or contract analyst immediately. Medium-term: resolve SIG-001 to eliminate revision loops that re-inflate the queue.";
    if (t.match(/schedule|inspector.?schedule|reschedule|availability/))
      return "FSR scheduling delays are averaging 4.1 days for rescheduling in high-density metros, primarily Atlanta and New York. Optimizing routing to allow adjacent-day re-bookings and setting a 48-hour auto-escalation threshold would reduce overdue inspection count by an estimated 40%.";
    return "I can help with revenue risk, pipeline health, city performance, contractor accounts, cycle times, product library gaps, and active signals. What would you like to dig into?";
  }

  function send(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    const userMsg: Message = { id: Date.now(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "ai", text: getResponse(text) },
      ]);
    }, 900);
  }

  return (
    <>
      {/* Floating panel */}
      {open && (
        <div
          className="fixed z-50 flex flex-col overflow-hidden"
          style={{
            bottom: 104,
            right: 32,
            width: 400,
            height: 560,
            borderRadius: 12,
            boxShadow: "0 24px 64px rgba(0,0,0,0.28)",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          {/* Header */}
          <div
            className="shrink-0 flex items-center justify-between px-5"
            style={{
              height: 72,
              background: "linear-gradient(135deg, #0039c9 0%, #082e83 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <img src={ASSET_LOGO} alt="" style={{ width: 32, height: 32, objectFit: "contain" }} />
              <div>
                <p className="text-white font-semibold text-[15px] leading-tight">Carlie</p>
                <p className="text-[rgba(255,255,255,0.6)] text-[11px] leading-tight mt-0.5">Powered by Carlisle Intelligence</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
              style={{ width: 32, height: 32 }}
            >
              <img src={ASSET_CLOSE} alt="Close" style={{ width: 18, height: 18, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 py-4"
            style={{ background: "#f8f8f8" }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "ai" && (
                  <div
                    className="shrink-0 rounded-full flex items-center justify-center mr-2 mt-0.5"
                    style={{ width: 28, height: 28, background: "linear-gradient(135deg, #0039c9 0%, #082e83 100%)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 128 88" fill="white">
                      <path fillRule="evenodd" clipRule="evenodd" d="M34.3638 36.58L25.0448 43.9347H39.4533L31.6863 45.8456L27.0977 59.7698C26.4058 61.8693 24.9774 63.6459 23.0778 64.7699L21 65.999H45.939L45.7264 65.5802C44.8972 63.947 44.7595 62.0478 45.3446 60.3117L52.6539 38.6228C52.9921 37.6194 52.2475 36.5796 51.1909 36.5797L34.3638 36.58Z"/>
                    </svg>
                  </div>
                )}
                <div
                  className="max-w-[72%] px-3 py-2 text-[13px] leading-relaxed"
                  style={{
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: msg.role === "user" ? "#0039c9" : "white",
                    color: msg.role === "user" ? "white" : "#1a1a1a",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div
                  className="shrink-0 rounded-full flex items-center justify-center mr-2 mt-0.5"
                  style={{ width: 28, height: 28, background: "linear-gradient(135deg, #0039c9 0%, #082e83 100%)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 128 88" fill="white">
                    <path fillRule="evenodd" clipRule="evenodd" d="M34.3638 36.58L25.0448 43.9347H39.4533L31.6863 45.8456L27.0977 59.7698C26.4058 61.8693 24.9774 63.6459 23.0778 64.7699L21 65.999H45.939L45.7264 65.5802C44.8972 63.947 44.7595 62.0478 45.3446 60.3117L52.6539 38.6228C52.9921 37.6194 52.2475 36.5796 51.1909 36.5797L34.3638 36.58Z"/>
                  </svg>
                </div>
                <div
                  style={{
                    borderRadius: "16px 16px 16px 4px",
                    background: "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Prompt pills — shown only on fresh conversation */}
          {messages.length === 1 && (
            <div className="shrink-0 px-3 pt-3 pb-1 flex flex-wrap gap-1.5" style={{ background: "#f8f8f8" }}>
              {[
                "How much revenue is at risk?",
                "What's our biggest bottleneck?",
                "Which cities are underperforming?",
                "Pipeline health summary",
                "Key contractor risks",
                "What's causing assembly delays?",
                "Active signals overview",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => send(prompt)}
                  className="text-[11.5px] font-medium px-2.5 py-1.5 rounded-full transition-colors hover:bg-[#0039c9] hover:text-white"
                  style={{ background: "white", color: "#0039c9", border: "1px solid #d0d8f5", lineHeight: 1 }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div
            className="shrink-0 flex items-center gap-2 px-3 py-3"
            style={{ background: "white", borderTop: "1px solid rgba(0,0,0,0.08)" }}
          >
            <input
              className="flex-1 text-[13px] outline-none placeholder:text-gray-400"
              style={{
                background: "#f3f4f6",
                borderRadius: 20,
                padding: "9px 14px",
                color: "#1a1a1a",
                border: "none",
              }}
              placeholder="Ask Carlie anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            />
            <button
              onClick={send}
              className="shrink-0 flex items-center justify-center rounded-full transition-opacity hover:opacity-80"
              style={{
                width: 36,
                height: 36,
                background: input.trim() && !loading ? "#3ed851" : "#e5e7eb",
                opacity: loading ? 0.5 : 1,
              }}
            >
              <img src={ASSET_SEND} alt="Send" style={{ width: 16, height: 16, objectFit: "contain" }} />
            </button>
          </div>
        </div>
      )}

      {/* FAB trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed z-50 transition-transform hover:scale-105 active:scale-95"
        style={{ bottom: 32, right: 32, width: 80, height: 80, background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <img src={aiFabIcon} alt="AI Assistant" style={{ width: 80, height: 80 }} />
      </button>
    </>
  );
}
