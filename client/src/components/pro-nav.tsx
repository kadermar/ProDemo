import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import img31 from "@assets/image31.png";

// Figma assets (expire 7 days from 2026-03-12)
const ASSET_LOGO    = "https://www.figma.com/api/mcp/asset/8e8192b2-8ea0-4404-9a49-182465ca2693";
const ASSET_ELLIPSE = "https://www.figma.com/api/mcp/asset/f21c6f64-f5cc-4cea-9296-a2580d1f37a2";
const ASSET_AVATAR  = "https://www.figma.com/api/mcp/asset/34af509e-7911-4862-b545-1f1dd092177b";

type ActivePage = "dashboard" | "signals" | "stage-activity" | "field-experience" | "chat";

interface ProNavProps {
  active?: ActivePage;
}

const NAV = [
  { label: "Dashboard",        href: "/dashboard",        key: "dashboard"        as ActivePage },
  { label: "Signals",          href: "/signals",          key: "signals"          as ActivePage },
  { label: "Stage Activity",   href: "/stage-activity",   key: "stage-activity"   as ActivePage },
  { label: "Field Experience", href: "/field-experience", key: "field-experience" as ActivePage },
  { label: "Assistant",        href: "/chat",             key: "chat"             as ActivePage },
];

export function ProNav({ active = "dashboard" }: ProNavProps) {
  const [, navigate] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  function closeSearch() {
    setSearchOpen(false);
    setSearchVal("");
  }

  return (
    <div
      className="relative bg-[#121212] overflow-hidden shrink-0"
      style={{ height: 132, fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          bottom: -576,
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
        <img src={img31} alt="" className="absolute w-full" style={{ top: "-9.27%", height: "118.53%", maxWidth: "none" }} />
      </div>

      {/* Nav row */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between"
        style={{ padding: "42px 120px 0" }}
      >
        {/* Logo */}
        <img
          src={ASSET_LOGO}
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
          {/* Search */}
          {searchOpen ? (
            <div
              className="flex items-center gap-2 rounded-[8px] px-3"
              style={{
                width: 260,
                height: 43,
                background: "rgba(255,255,255,0.10)",
                boxShadow: "inset 0px 1px 0px 0px rgba(255,255,255,0.12)",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                onKeyDown={e => e.key === "Escape" && closeSearch()}
                placeholder="Search…"
                className="flex-1 bg-transparent outline-none text-[14px] text-white placeholder:text-white/40"
              />
              <button onClick={closeSearch} className="text-white/40 hover:text-white/80 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ) : (
            <button
              className="flex items-center justify-center rounded-[8px] transition-opacity hover:opacity-70"
              style={{ width: 43, height: 43, color: "white" }}
              onClick={() => setSearchOpen(true)}
              title="Search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          )}

          {NAV.map((item) => {
            const isActive = item.key === active;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.href)}
                className="flex items-center justify-center text-white text-[16px] font-medium whitespace-nowrap rounded-[8px] transition-colors"
                style={{
                  height: 43,
                  padding: "12px 26px",
                  background: isActive ? "rgba(194,203,255,0.3)" : "transparent",
                  boxShadow: isActive ? "inset 0px 1px 0px 0px rgba(255,255,255,0.1)" : undefined,
                  backdropFilter: isActive ? "blur(50px)" : undefined,
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right: bell + avatar */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="relative w-[30px] h-[30px] flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div
              className="absolute flex items-center justify-center rounded-full border-2 border-[#121212]"
              style={{ top: -2, right: -2, minWidth: 14, height: 14, background: "#3ed851", padding: "0 3px" }}
            >
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
    </div>
  );
}
