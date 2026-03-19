import { Switch, Route } from "wouter";
import { useState, useRef, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ChatPage from "@/pages/chat";
import LogsPage from "@/pages/logs";
import DashboardPage from "@/pages/dashboard";
import SignalsPage from "@/pages/signals";
import StageActivityPage from "@/pages/stage-activity";
import FieldExperiencePage from "@/pages/field-experience";
import JobDetailPage from "@/pages/job-detail";
import WorkOrderDetailPage from "@/pages/work-order-detail";
import ChartGalleryPage from "@/pages/chart-gallery";
import NotFound from "@/pages/not-found";

const ASSET_LOGO = "https://www.figma.com/api/mcp/asset/8e8192b2-8ea0-4404-9a49-182465ca2693";

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function attempt() {
    if (value.toLowerCase() === "carlie") {
      sessionStorage.setItem("unlocked", "1");
      onUnlock();
    } else {
      setError(true);
      setShaking(true);
      setValue("");
      setTimeout(() => setShaking(false), 500);
    }
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: "#121212", fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Subtle radial glow */}
      <div className="absolute pointer-events-none" style={{
        top: "50%", left: "50%", transform: "translate(-50%, -60%)",
        width: 800, height: 800,
        background: "radial-gradient(circle, rgba(0,57,201,0.18) 0%, transparent 70%)",
      }} />

      <div className="relative flex flex-col items-center gap-8" style={{ width: 340 }}>
        <img src={ASSET_LOGO} alt="PRO" style={{ height: 32, width: 130, objectFit: "contain" }} />

        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-white text-[22px] font-medium leading-tight">Welcome back</p>
          <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.45)" }}>Enter your access password to continue</p>
        </div>

        <div
          className="w-full flex flex-col gap-3"
          style={{
            animation: shaking ? "shake 0.45s ease" : undefined,
          }}
        >
          <style>{`
            @keyframes shake {
              0%,100% { transform: translateX(0); }
              20%      { transform: translateX(-8px); }
              40%      { transform: translateX(8px); }
              60%      { transform: translateX(-6px); }
              80%      { transform: translateX(6px); }
            }
          `}</style>

          <input
            ref={inputRef}
            type="password"
            value={value}
            onChange={e => { setValue(e.target.value); setError(false); }}
            onKeyDown={e => e.key === "Enter" && attempt()}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-[10px] text-[15px] text-white outline-none placeholder:text-white/30"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: `1px solid ${error ? "rgba(239,68,68,0.7)" : "rgba(255,255,255,0.12)"}`,
              boxShadow: error ? "0 0 0 3px rgba(239,68,68,0.12)" : undefined,
            }}
          />

          {error && (
            <p className="text-[13px] text-center" style={{ color: "rgba(239,68,68,0.85)" }}>
              Incorrect password. Please try again.
            </p>
          )}

          <button
            onClick={attempt}
            className="w-full py-3 rounded-[10px] text-[15px] font-medium text-white transition-opacity hover:opacity-80"
            style={{ background: "#0039c9" }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/logs" component={LogsPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/signals" component={SignalsPage} />
      <Route path="/stage-activity" component={StageActivityPage} />
      <Route path="/field-experience" component={FieldExperiencePage} />
      <Route path="/job/:id" component={JobDetailPage} />
      <Route path="/work-order/:id" component={WorkOrderDetailPage} />
      <Route path="/chart-gallery" component={ChartGalleryPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // const [unlocked, setUnlocked] = useState(
  //   () => sessionStorage.getItem("unlocked") === "1"
  // );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {/* Password gate disabled: {unlocked ? <Router /> : <PasswordGate onUnlock={() => setUnlocked(true)} />} */}
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
