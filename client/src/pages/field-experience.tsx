import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Check,
  AlertCircle,
  Upload,
  X,
  CheckCircle,
  FileText,
  User,
  MapPin,
  ClipboardList,
  Camera,
  MessageSquare,
  Shield,
  Loader2,
  ChevronRight,
  Sparkles,
  HardHat,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import rightPanelImage from "@assets/Right.png";

// ── Field Experience local assets (downloaded from Figma 2985:454 & 3194:584) ─
import feAvatar from "@assets/fe-avatar.png";
import feMap from "@assets/fe-map.png";
import fePartlyCloudy from "@assets/fe-partly-cloudy.png";
import feSignalBars from "@assets/fe-signal-bars.png";
import feWifi from "@assets/fe-wifi.png";
import feBattery from "@assets/fe-battery.png";
import feLogo from "@assets/fe-logo.png";
import feSearch from "@assets/fe-search.png";
import feBell from "@assets/fe-bell.png";
import feFilterList from "@assets/fe-filter-list.png";
import feMapMarker from "@assets/fe-map-marker.png";
import feRouteLine from "@assets/fe-route-line.png";
import fePlus from "@assets/fe-plus.png";
import feMinus from "@assets/fe-minus.png";
import feExpand from "@assets/fe-expand.png";
import feMarkerBlue from "@assets/fe-marker-blue.png";
import feMarkerBlack from "@assets/fe-marker-black.png";
import feCarlisleLogo from "@assets/fe-carlisle-logo.png";
import feCloseCircle from "@assets/fe-close-circle.png";
import feSignalGood from "@assets/fe-signal-good.png";
import feArrowRight from "@assets/fe-arrow-right.png";
import fePhoneFlip from "@assets/fe-phone-flip.png";
import feEngineWarning from "@assets/fe-engine-warning.png";
import feLocationTrack from "@assets/fe-location-track.png";
import fe2Avatar from "@assets/fe2-avatar.png";
import fe2Building3d from "@assets/fe2-building3d.png";
import fe2Photo1 from "@assets/fe2-photo1.jpg";
import fe2Photo2 from "@assets/fe2-photo2.jpg";
import fe2Photo3 from "@assets/fe2-photo3.jpg";
import fe2Photo4 from "@assets/fe2-photo4.jpg";
import fe2Photo5 from "@assets/fe2-photo5.jpg";
import fe2Logo from "@assets/fe2-logo.png";
import fe2Search from "@assets/fe2-search.png";
import fe2Bell from "@assets/fe2-bell.png";
import fe2WrenchRed from "@assets/fe2-wrench-red.png";
import fe2WrenchOutline from "@assets/fe2-wrench-outline.png";
import fe2Spinner from "@assets/fe2-spinner.png";
import fe2CheckCircle from "@assets/fe2-check-circle.png";
import fe2CheckCircle2 from "@assets/fe2-check-circle2.png";
import fe2CloseCircle from "@assets/fe2-close-circle.png";
import fe2Exclamation from "@assets/fe2-exclamation.png";
import fe2HelmetUser from "@assets/fe2-helmet-user.png";
import fe2Calendar from "@assets/fe2-calendar.png";
import fe2Chevron from "@assets/fe2-chevron.png";
import fe2Eye from "@assets/fe2-eye.png";
import fe2Camera from "@assets/fe2-camera.png";
import fe2SignalGood from "@assets/fe2-signal-good.png";
import fe2SignalBars from "@assets/fe2-signal-bars.png";
import fe2ArrowLeft from "@assets/fe2-arrow-left.png";

// ── Static Carlisle field data ───────────────────────────────────────────────

const FSR_WORKERS = [
  { id: "fsr-001", name: "Marcus Johnson", region: "Atlanta, GA" },
  { id: "fsr-002", name: "Sarah Chen", region: "Dallas, TX" },
  { id: "fsr-003", name: "Derek Williams", region: "New York, NY" },
  { id: "fsr-004", name: "Amanda Torres", region: "Chicago, IL" },
];

const JOB_SITES = [
  { id: "site-001", name: "One Peachtree Center", location: "Atlanta, GA" },
  { id: "site-002", name: "Riverside Commerce Park", location: "Jacksonville, FL" },
  { id: "site-003", name: "Midtown Office Complex", location: "Charlotte, NC" },
  { id: "site-004", name: "Harbor Distribution Center", location: "Tampa, FL" },
  { id: "site-005", name: "Northgate Industrial Park", location: "Nashville, TN" },
];

const PRODUCT_SYSTEMS = [
  { id: "epdm-60", name: "EPDM 60-mil Black Membrane", category: "EPDM", assemblyRef: "AL-2024-0312" },
  { id: "tpo-60", name: "TPO 60-mil White Membrane", category: "TPO", assemblyRef: "AL-2024-0289" },
  { id: "pvc-50", name: "PVC 50-mil White Membrane", category: "PVC", assemblyRef: "AL-2024-0301" },
  { id: "iso-30", name: "HP ISO 3.0 Polyiso Insulation", category: "Insulation", assemblyRef: "AL-2024-0275" },
];

const INSPECTION_STEPS: Record<string, Array<{ id: string; step: number; name: string; critical: boolean; verify: boolean }>> = {
  "epdm-60": [
    { id: "e1", step: 1, name: "Verify substrate condition and moisture survey complete", critical: true, verify: true },
    { id: "e2", step: 2, name: "Confirm insulation fastening per FM/UL requirements", critical: true, verify: false },
    { id: "e3", step: 3, name: "Inspect EPDM membrane gauge — 60-mil minimum confirmed", critical: true, verify: true },
    { id: "e4", step: 4, name: "Verify lap seam preparation: clean, dry, and primed", critical: true, verify: false },
    { id: "e5", step: 5, name: "Confirm Sure-Seal tape width — 3\" minimum overlap on all seams", critical: true, verify: true },
    { id: "e6", step: 6, name: "Inspect all penetration flashings and termination bars", critical: false, verify: false },
    { id: "e7", step: 7, name: "Confirm drain clamping ring torque — field taped all drains", critical: false, verify: true },
    { id: "e8", step: 8, name: "Photograph all seam intersections per warranty protocol", critical: false, verify: false },
    { id: "e9", step: 9, name: "Verify perimeter attachment per wind uplift design spec", critical: true, verify: true },
    { id: "e10", step: 10, name: "Product lot numbers documented for warranty registration", critical: false, verify: true },
  ],
  "tpo-60": [
    { id: "t1", step: 1, name: "Inspect substrate and recovery board installation", critical: true, verify: true },
    { id: "t2", step: 2, name: "Verify TPO membrane thickness — 60-mil minimum", critical: true, verify: true },
    { id: "t3", step: 3, name: "Inspect heat-welded seam integrity — 1.5\" weld width minimum", critical: true, verify: true },
    { id: "t4", step: 4, name: "Probe-check all hot-air welds for seal continuity", critical: true, verify: false },
    { id: "t5", step: 5, name: "Inspect all pipe boot and penetration details", critical: false, verify: false },
    { id: "t6", step: 6, name: "Verify metal edge and termination bar installation", critical: false, verify: true },
    { id: "t7", step: 7, name: "Confirm drain installation with clamping rings seated", critical: false, verify: false },
    { id: "t8", step: 8, name: "Check adhesive coverage rates at field laps", critical: false, verify: false },
    { id: "t9", step: 9, name: "Photograph completed seam welds for warranty documentation", critical: false, verify: false },
    { id: "t10", step: 10, name: "Confirm installer certification current for warranty compliance", critical: true, verify: true },
  ],
  "pvc-50": [
    { id: "p1", step: 1, name: "Verify substrate is clean, dry, and compatible with PVC", critical: true, verify: true },
    { id: "p2", step: 2, name: "Confirm PVC membrane thickness — 50-mil minimum", critical: true, verify: true },
    { id: "p3", step: 3, name: "Inspect heat-welded seams — 1.5\" minimum weld width", critical: true, verify: true },
    { id: "p4", step: 4, name: "Verify chemical compatibility with any existing insulation", critical: true, verify: false },
    { id: "p5", step: 5, name: "Inspect all penetration details and flashing terminations", critical: false, verify: false },
    { id: "p6", step: 6, name: "Check walkway pad placement and adhesion", critical: false, verify: false },
    { id: "p7", step: 7, name: "Confirm drain collar welding and clamping", critical: false, verify: true },
    { id: "p8", step: 8, name: "Document all lot numbers and membrane roll IDs", critical: false, verify: true },
  ],
  "iso-30": [
    { id: "i1", step: 1, name: "Verify ISO board R-value specification matches assembly letter", critical: true, verify: true },
    { id: "i2", step: 2, name: "Inspect board joints — staggered and tight with no gaps > 1/4\"", critical: true, verify: false },
    { id: "i3", step: 3, name: "Confirm fastener pattern per FM/UL wind uplift design", critical: true, verify: true },
    { id: "i4", step: 4, name: "Check ISO board for moisture damage or delamination", critical: true, verify: false },
    { id: "i5", step: 5, name: "Verify tapered ISO layout matches slope plan", critical: false, verify: true },
    { id: "i6", step: 6, name: "Confirm cover board installed where required per spec", critical: false, verify: false },
    { id: "i7", step: 7, name: "Document ISO lot numbers and thicknesses for warranty", critical: false, verify: true },
  ],
};

// ── Local assets from Figma ───────────────────────────────────────────────────

const svg = (s: string) => `data:image/svg+xml;base64,${btoa(s)}`;

const FA = {
  avatar:          feAvatar,
  map:             feMap,
  partlyCloudy:    fePartlyCloudy,
  signalBars:      feSignalBars,
  signalBarsLight: svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 17 11'><rect x='0' y='7' width='3' height='4' rx='.5' fill='#1a1a1a'/><rect x='4.5' y='4.5' width='3' height='6.5' rx='.5' fill='#1a1a1a'/><rect x='9' y='2' width='3' height='9' rx='.5' fill='#1a1a1a'/><rect x='13.5' y='0' width='3' height='11' rx='.5' fill='#1a1a1a' opacity='.35'/></svg>`),
  wifi:            feWifi,
  wifiLight:       svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 14' fill='none'><circle cx='9' cy='12.5' r='1.5' fill='#1a1a1a'/><path d='M5.5 9.5c.9-.9 2.1-1.5 3.5-1.5s2.6.6 3.5 1.5' stroke='#1a1a1a' stroke-width='1.5' stroke-linecap='round'/><path d='M2.5 6.5c1.8-1.8 4.1-2.5 6.5-2.5s4.7.7 6.5 2.5' stroke='#1a1a1a' stroke-width='1.5' stroke-linecap='round' opacity='.5'/></svg>`),
  battery:         feBattery,
  batteryLight:    svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 13'><rect x='0' y='1.5' width='23' height='10' rx='2' stroke='#1a1a1a' stroke-width='1.3' fill='none'/><rect x='1.5' y='3' width='18' height='7' rx='1.5' fill='#1a1a1a'/><path d='M24.5 4.5v4' stroke='#1a1a1a' stroke-width='1.5' stroke-linecap='round'/></svg>`),
  logo:            feLogo,
  filterList:      feFilterList,
  mapMarkerIcon:   feMapMarker,
  routeLine:       feRouteLine,
  plus:            fePlus,
  minus:           feMinus,
  expand:          feExpand,
  markerBlack:     feMarkerBlack,
  markerBlue:      feMarkerBlue,
  carlisleLogo:    feCarlisleLogo,
  closeCircle:     feCloseCircle,
  signalGood:      feSignalGood,
  arrowRight:      feArrowRight,
  phoneFlip:       fePhoneFlip,
  engineWarning:   feEngineWarning,
  locationTrack:   feLocationTrack,
  search:          feSearch,
  bell:            feBell,
};

// ── Animation variants ────────────────────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.07 } },
};

// ── Login screen (Figma: node 3173:1482) ─────────────────────────────────────

function LoginScreen({ onSignIn }: { onSignIn: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    onSignIn();
  };

  return (
    <div className="flex h-full" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>

      {/* Left panel — SSO only */}
      <div className="flex flex-col items-center justify-center px-12 py-10 flex-1 gap-8 min-w-0">
        {/* Headline */}
        <div className="text-center">
          <p className="text-[22px] text-[#1a191b]">Sign in to CarlislePro</p>
          <p className="text-[13px] text-[#797d7e] mt-2">Use your Carlisle company credentials</p>
        </div>

        {/* SSO button */}
        <button
          onClick={handleSignIn}
          className="bg-[#003591] text-white h-12 rounded-lg w-full max-w-[320px] text-[13px] font-medium hover:bg-[#002a73] active:bg-[#001f55] transition-colors flex items-center justify-center gap-3 shadow-sm"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Sign in with SSO
            </>
          )}
        </button>

        <p className="text-[11px] text-[#b8c0c2] text-center max-w-[260px] leading-relaxed">
          Secured via your organization's identity provider. Contact IT if you need access.
        </p>
      </div>

      {/* Right panel — brand image */}
      <div className="relative w-[584px] shrink-0 self-stretch overflow-hidden">
        <img
          src={rightPanelImage}
          alt="Carlisle Pro"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

// ── Progress ring ─────────────────────────────────────────────────────────────

function ProgressRing({ progress, size = 52, strokeWidth = 5 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle className="text-white/20" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
        <motion.circle
          className="text-[#2966B8]"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold text-white">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

// ── iPad Pro 11" M4 landscape frame ──────────────────────────────────────────
// Screen: 1024 × 706px  (ratio ≈ 1.45:1, matches actual 2420×1668)

function TabletFrame({ children, statusBarTheme = "light" }: { children: React.ReactNode; statusBarTheme?: "light" | "dark" }) {
  const SW = 1024, SH = 706, BEZEL = 10, BTN = 28;
  const isDark = statusBarTheme === "dark";
  const OW = SW + BEZEL * 2, OH = SH + BEZEL * 2;

  return (
    <div className="flex items-start justify-center py-8 overflow-x-auto">
      <div className="relative shrink-0">
        {/* Drop shadow */}
        <div className="absolute inset-0 bg-black/20 blur-3xl translate-y-6 scale-95" />

        {/* Device body — Space Black aluminum */}
        <div
          className="relative bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] shadow-2xl"
          style={{ width: OW, height: OH, borderRadius: 22 }}
        >
          {/* Aluminum sheen top edge */}
          <div className="absolute inset-x-0 top-0 h-px bg-white/20 rounded-t-[22px]" />

          {/* Volume buttons — top edge (landscape: short side = left) */}
          <div className="absolute left-[-3px] top-[120px] w-[3px] h-[32px] bg-[#3a3a3a] rounded-l-sm" />
          <div className="absolute left-[-3px] top-[162px] w-[3px] h-[32px] bg-[#3a3a3a] rounded-l-sm" />

          {/* Power button — right edge */}
          <div className="absolute right-[-3px] top-[140px] w-[3px] h-[40px] bg-[#3a3a3a] rounded-r-sm" />

          {/* USB-C port — bottom edge center-right */}
          <div className="absolute bottom-[-2px] right-[60px] w-[18px] h-[2px] bg-[#555] rounded-b-sm" />

          {/* Front camera dot — top bezel, right of center */}
          <div
            className="absolute bg-[#111] rounded-full border border-[#333]"
            style={{ width: 7, height: 7, top: (BEZEL - 7) / 2 + 2, left: OW * 0.55 }}
          />

          {/* Screen */}
          <div
            className="absolute bg-white overflow-hidden"
            style={{
              top: BEZEL,
              left: BEZEL,
              width: SW,
              height: SH,
              borderRadius: 14,
            }}
          >
            {/* Status bar — iPad Pro M4 landscape style */}
            <div
              className={`flex items-center justify-between px-6 shrink-0 transition-colors duration-300 ${isDark ? "bg-[#003591]" : "bg-white"}`}
              style={{ height: BTN }}
            >
              <div className="flex items-center gap-3">
                <span className="text-[11.5px] font-semibold" style={{ fontFamily: "'SF Pro', system-ui, sans-serif", color: isDark ? "white" : "#1a1a1a" }}>9:41</span>
                <span className="text-[11px]" style={{ fontFamily: "'SF Pro', system-ui, sans-serif", color: isDark ? "rgba(255,255,255,0.7)" : "#6e6e73" }}>Mon Jun 10</span>
              </div>
              <div className="flex items-center gap-2.5">
                {isDark ? (
                  <>
                    <img src={FA.signalBars} className="h-[11px]" alt="" />
                    <img src={FA.wifi} className="h-[11px]" alt="" />
                    <span className="text-[11px] font-medium text-white" style={{ fontFamily: "'SF Pro', system-ui, sans-serif" }}>100%</span>
                    <img src={FA.battery} className="h-[12px]" alt="" />
                  </>
                ) : (
                  <>
                    <img src={FA.signalBarsLight} style={{ height: 10, width: 16.5 }} alt="" />
                    <img src={FA.wifiLight} style={{ height: 10, width: 14 }} alt="" />
                    <span className="text-[11px] font-medium" style={{ fontFamily: "'SF Pro', system-ui, sans-serif", color: "#1a1a1a" }}>100%</span>
                    <img src={FA.batteryLight} style={{ height: 12, width: 26.5 }} alt="" />
                  </>
                )}
              </div>
            </div>

            {/* Content area */}
            <div className="overflow-y-auto" style={{ height: SH - BTN }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FA2 = {
  building3d:    fe2Building3d,
  photo1:        fe2Photo1,
  photo2:        fe2Photo2,
  photo3:        fe2Photo3,
  photo4:        fe2Photo4,
  photo5:        fe2Photo5,
  wrenchRed:     fe2WrenchRed,
  wrenchOutline: fe2WrenchOutline,
  spinner:       fe2Spinner,
  checkCircle:   fe2CheckCircle,
  checkCircle2:  fe2CheckCircle2,
  closeCircle:   fe2CloseCircle,
  exclamation:   fe2Exclamation,
  helmetUser:    fe2HelmetUser,
  calendar:      fe2Calendar,
  star:          svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'><path d='M5 1l1.2 2.4L9 3.9 7 5.8l.5 3L5 7.5 2.5 8.8 3 5.8 1 3.9l2.8-.5z' fill='#FDB53A'/></svg>`),
  check:         svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' fill='none'><path d='M1.5 4l2 2 3-3' stroke='#34C759' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>`),
  eye:           fe2Eye,
  camera:        fe2Camera,
  arrowLeft:     fe2ArrowLeft,
  chevron:       fe2Chevron,
  signalGood:    fe2SignalGood,
  signalBars:    fe2SignalBars,
  avatar2:       fe2Avatar,
  logo2:         fe2Logo,
  search2:       fe2Search,
  bell2:         fe2Bell,
};

// ── Main FSR inspection form ──────────────────────────────────────────────────

function FsrInspectionForm({ onBack }: { onBack: () => void }) {
  const [selectedWorker] = useState(() => FSR_WORKERS[Math.floor(Math.random() * FSR_WORKERS.length)]);
  const [selectedSite] = useState(() => JOB_SITES[Math.floor(Math.random() * JOB_SITES.length)].id);
  const [selectedSystem] = useState(() => PRODUCT_SYSTEMS[Math.floor(Math.random() * PRODUCT_SYSTEMS.length)].id);
  const [stepStatus, setStepStatus] = useState<Map<string, "pass" | "fail">>(new Map());
  const [stepNotes, setStepNotes] = useState<Map<string, string>>(new Map());
  const [stepImages, setStepImages] = useState<Map<string, string[]>>(new Map());
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stage, setStage] = useState<"checks" | "documentation" | "confirmed">("checks");
  const [showToast, setShowToast] = useState(false);
  const [activeTab, setActiveTab] = useState<"checks" | "comments" | "activity">("checks");

  const steps = useMemo(() => (selectedSystem ? INSPECTION_STEPS[selectedSystem] ?? [] : []), [selectedSystem]);
  const selectedSystemData = PRODUCT_SYSTEMS.find(s => s.id === selectedSystem);
  const selectedSiteData = JOB_SITES.find(s => s.id === selectedSite);
  const failedCount = useMemo(() => steps.filter(s => stepStatus.get(s.id) === "fail").length, [steps, stepStatus]);
  const inspectionProgress = useMemo(() => steps.length === 0 ? 0 : (stepStatus.size / steps.length) * 100, [steps, stepStatus]);
  // All critical checks explicitly passed
  // Can proceed once every step has been reviewed (pass or fail) — failures can be reported in comments
  const canProceed = useMemo(() => steps.length > 0 && steps.every(s => stepStatus.has(s.id)), [steps, stepStatus]);

  const stageProgress = {
    preparation: 100,
    inspection: stage === "checks" ? inspectionProgress : 100,
    documentation: stage === "documentation" ? 100 : stage === "confirmed" ? 100 : 0,
    confirmation: stage === "confirmed" ? 100 : 0,
  };

  const setCheck = (id: string, status: "pass" | "fail") => {
    if (stage !== "checks") return;
    const next = new Map(stepStatus);
    // clicking same status again clears it
    next.get(id) === status ? next.delete(id) : next.set(id, status);
    setStepStatus(next);
  };

  // Step 1: all critical checks passed → move to documentation + open comments
  const handleProceedToDocumentation = () => {
    if (!canProceed || stage !== "checks") return;
    setStage("documentation");
    setActiveTab("comments");
  };

  // Step 2: final submit → complete all stages + toast
  const handleFinalSubmit = async () => {
    if (isSubmitting || stage !== "documentation") return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsSubmitting(false);
    setStage("confirmed");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4500);
  };

  const font = "'Helvetica Neue', Helvetica, sans-serif";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white relative" style={{ fontFamily: font }}>

      {/* App header */}
      <div className="bg-[#003591] flex items-center gap-4 px-4 shrink-0" style={{ height: 56 }}>
        <div className="relative" style={{ width: 68, height: 16 }}>
          <img src={FA2.logo2} alt="C PRO" className="absolute inset-0 w-full h-full object-contain object-left" />
        </div>
        <div className="flex-1 text-white text-[18px] font-medium">Inspection Details</div>
        <div className="flex items-center gap-6">
          <img src={FA2.search2} className="w-5 h-5" alt="" />
          <div className="relative">
            <img src={FA2.bell2} className="w-5 h-5" alt="" />
            <div className="absolute -top-1.5 -right-1.5 bg-[#f05f52] rounded-full w-[14px] h-[14px] flex items-center justify-center">
              <span className="text-[8px] text-white font-medium leading-none">3</span>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full border border-[#e0e0e0] overflow-hidden shrink-0">
            <img src={FA2.avatar2} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Breadcrumb bar */}
      <div className="border-b border-[#e7e7e7] flex items-center gap-3 px-5 shrink-0" style={{ height: 57 }}>
        <button
          onClick={onBack}
          className="border border-[#e7e7e7] rounded-[8px] w-8 h-8 flex items-center justify-center shrink-0 hover:bg-slate-50"
        >
          <img src={FA2.arrowLeft} className="w-4 h-4 rotate-180" alt="back" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[16px] text-[#1a191b] truncate">Empire Heights — Re-Inspection</p>
          <p className="text-[10px] text-[#9d9a9a] truncate">Empire Heights Skyscraper, 20 W 34th St., New York, NY 10001</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {stage === "confirmed" ? (
            <div className="bg-[#e0f0ff] rounded-[4px] flex items-center gap-1 px-1.5 py-1">
              <div className="w-1 h-1 rounded-full bg-[#003591]" />
              <span className="text-[#003591] text-[10px] font-medium">Complete</span>
            </div>
          ) : (
            <div className="bg-[#e0f7f4] rounded-[4px] flex items-center gap-1 px-1.5 py-1">
              <div className="w-1 h-1 rounded-full bg-[#1b7c74]" />
              <span className="text-[#1b7c74] text-[10px] font-medium">Active</span>
            </div>
          )}
          <div className="border border-[#e7e7e7] rounded-[4px] flex items-center px-1.5 py-1">
            <span className="text-[#1a191b] text-[10px] font-medium">12:00 PM</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-1">
            <img src={FA2.signalGood} className="w-1.5 h-1.5" alt="" />
            <span className="text-[#1a191b] text-[10px] font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1a191b] text-white rounded-[10px] px-5 py-3 flex items-center gap-3 shadow-2xl"
          style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif", minWidth: 340 }}
        >
          <div className="w-6 h-6 rounded-full bg-[#28992a] flex items-center justify-center shrink-0">
            <CheckCircle className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-[12px] font-medium">Report submitted successfully</p>
            <p className="text-[11px] text-white/60 mt-0.5">Ref: {selectedSystemData?.assemblyRef} · {selectedSiteData?.name}</p>
          </div>
        </motion.div>
      )}

      {/* Main content: left roof view + right details panel */}
      <div className="flex-1 relative overflow-hidden">

        {/* ── LEFT: Roof / building view ── */}
        <div className="absolute inset-0" style={{ right: 465 }}>

          {/* 3D Building image */}
          <div className="absolute overflow-hidden" style={{ inset: 0 }}>
            <img
              src={FA2.building3d}
              alt="Roof view"
              className="absolute pointer-events-none"
              style={{ width: 1357.5, height: 905, left: -300, top: -16, maxWidth: "none" }}
            />
          </div>

          {/* Wrench markers */}
          {[{ l: 252, t: 244 }, { l: 344, t: 130 }, { l: 435, t: 370 }, { l: 127, t: 258 }].map((pos, i) => (
            <div key={i}
              className="absolute bg-[#fc3030] border-2 border-white rounded-[8px] w-[26px] h-[32px] flex items-center justify-center"
              style={{ left: pos.l, top: pos.t, boxShadow: "0px 4px 4px rgba(0,0,0,0.06)", zIndex: 2 }}
            >
              <img src={FA2.wrenchRed} className="w-3 h-3" alt="" />
            </div>
          ))}
          {/* Active wrench marker (outline) */}
          <div
            className="absolute bg-white border-2 border-[#fc3030] rounded-[8px] w-[26px] h-[32px] flex items-center justify-center"
            style={{ left: 454, top: 248, zIndex: 2, boxShadow: "0 0 0 3px #fec3c3, 0px 4px 4px rgba(0,0,0,0.06)" }}
          >
            <img src={FA2.wrenchOutline} className="w-3 h-3" alt="" />
          </div>

          {/* Progress card — top overlay */}
          <div
            className="absolute bg-white border border-[#e7e7e7] rounded-[8px] flex flex-col"
            style={{ left: 15, top: 16, width: 512, zIndex: 3, boxShadow: "0px 4px 16px rgba(0,0,0,0.08)" }}
          >
            <div className="flex flex-col gap-4 p-4">
              <span className="text-[12px] font-medium text-[#1a191b]">Inspection Progress</span>
              <div className="flex gap-3 items-start">
                {(["preparation", "inspection", "documentation", "confirmation"] as const).map(s => (
                  <div key={s} className="flex flex-col gap-2" style={{ width: 111 }}>
                    <div className="bg-[#e9e9e9] h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-[#28992a] h-1 rounded-full transition-all duration-700"
                        style={{ width: `${stageProgress[s]}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-[#1a191b] capitalize">{s}</span>
                      {s === "inspection" && stageProgress.inspection > 0 && stageProgress.inspection < 100 && (
                        <img src={FA2.spinner} className="w-3 h-3" alt="" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#e7e7e7] h-px" />
            <div className="flex items-center justify-between gap-4 p-4">
              <div className="border border-[#e7e7e7] rounded-full flex items-center gap-1.5 px-2 py-1.5">
                <img src={FA2.checkCircle} className="w-2 h-2" alt="" />
                <span className="text-[10px] text-[#797d7e]">Estimated time to complete:</span>
                <span className="text-[10px] text-[#1a191b] font-medium">1 hr 30 min</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Complete & Send Report — only active in documentation stage */}
                {stage === "confirmed" ? (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-[4px] text-[10px] font-medium text-[#28992a] bg-[#f0f9f1] border border-[#a0dfa4]">
                    <CheckCircle className="w-3 h-3" /> Report Sent
                  </div>
                ) : (
                  <button
                    onClick={stage === "documentation" ? handleFinalSubmit : undefined}
                    disabled={stage !== "documentation" || isSubmitting}
                    className={`flex items-center gap-2 px-3 py-2 rounded-[4px] text-[10px] font-medium text-white transition-colors ${
                      stage === "documentation" ? "bg-[#003591] hover:bg-[#002a73] cursor-pointer" : "bg-[#003591] opacity-30 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Complete & Send Report"}
                  </button>
                )}
                {/* Next → always visible in checks stage; disabled until all steps reviewed */}
                {stage === "checks" && (
                  <button
                    onClick={canProceed ? handleProceedToDocumentation : undefined}
                    disabled={!canProceed}
                    className={`flex items-center gap-1 px-2.5 py-2 rounded-[4px] text-[10px] font-medium border transition-colors ${
                      canProceed
                        ? "text-[#003591] border-[#003591] hover:bg-[#003591] hover:text-white cursor-pointer"
                        : "text-[#b0b0b0] border-[#e7e7e7] cursor-not-allowed"
                    }`}
                  >
                    Next
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Photo strip — bottom */}
          <div className="absolute flex gap-2" style={{ left: 15, bottom: 16, zIndex: 3 }}>
            {[FA2.photo4, FA2.photo5].map((src, i) => (
              <div key={i} className="rounded-[8px] overflow-hidden shrink-0" style={{ width: 83, height: 76 }}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="rounded-[8px] relative overflow-hidden shrink-0" style={{ width: 83, height: 76 }}>
              <img src={FA2.photo3} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[rgba(26,25,27,0.75)] flex items-center justify-center">
                <span className="text-white text-[16px] font-medium">+7</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Details panel ── */}
        <div
          className="absolute bg-white border border-[#e7e7e7] rounded-[8px] flex flex-col overflow-hidden"
          style={{ right: 16, top: 16, width: 449, bottom: 16, boxShadow: "0px 4px 16px rgba(0,0,0,0.08)" }}
        >
          {/* Panel header */}
          <div className="flex flex-col gap-6 p-4 shrink-0">
            {/* ID + tags + close */}
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <span className="text-[16px] font-medium text-[#1a191b]">{selectedSystemData?.assemblyRef ?? "EH-392304"}</span>
                <button onClick={onBack} className="w-5 h-5">
                  <img src={FA2.closeCircle} className="w-5 h-5" alt="close" />
                </button>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <div className={`rounded-[4px] flex items-center gap-1 px-1.5 py-1 ${stage === "confirmed" ? "bg-[#e0f0ff]" : "bg-[#fff4e5]"}`}>
                  <div className={`w-1 h-1 rounded-full ${stage === "confirmed" ? "bg-[#003591]" : "bg-[#b54708]"}`} />
                  <span className={`text-[10px] font-medium ${stage === "confirmed" ? "text-[#003591]" : "text-[#b54708]"}`}>
                    {stage === "confirmed" ? "Completed" : stage === "documentation" ? "In Review" : "Pending"}
                  </span>
                </div>
                <div className="border border-[#e7e7e7] rounded-[4px] flex items-center px-1.5 py-1">
                  <span className="text-[#1a191b] text-[10px] font-medium">{selectedSystemData?.category ?? "EPDM"}</span>
                </div>
                {failedCount > 0 && (
                  <div className="flex items-center gap-1 px-1.5 py-1">
                    <img src={FA2.exclamation} className="w-2 h-2" alt="" />
                    <span className="text-[#ff3345] text-[10px] font-medium">{failedCount} Checks Failed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Photo strip */}
            <div className="flex gap-2 h-[104px]">
              <div className="flex-1 rounded-[8px] overflow-hidden">
                <img src={FA2.photo1} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 rounded-[8px] overflow-hidden">
                <img src={FA2.photo2} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="relative rounded-[8px] overflow-hidden shrink-0 w-[91px]">
                <img src={FA2.photo3} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[rgba(26,25,27,0.75)] flex items-center justify-center">
                  <span className="text-white text-[16px] font-medium">+4</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[#e7e7e7] flex gap-8 px-4 shrink-0">
            {(["checks", "comments", "activity"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex flex-col items-center gap-2 pb-0"
              >
                <span className={`text-[12px] py-2 ${activeTab === tab ? "text-[#003591] font-medium" : "text-[#1a191b]"}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </span>
                {activeTab === tab && <div className="bg-[#003591] h-[3px] w-full rounded-t" />}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "checks" && (
              <div className="flex flex-col gap-3 p-4">
                {steps.map(step => {
                  const status = stepStatus.get(step.id) ?? null;
                  const isExpanded = expandedStep === step.id;
                  const noteVal = stepNotes.get(step.id) ?? "";
                  const imgs = stepImages.get(step.id) ?? [];
                  return (
                    <div key={step.id} className="border border-[#e7e7e7] rounded-[8px] overflow-hidden">
                      {/* Row */}
                      <div className="flex items-center gap-2 p-4">
                        <div className="flex-1 flex flex-col gap-3 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {step.critical && (
                              <div className="w-1 h-1 rounded-full bg-[#fc3030] shrink-0" />
                            )}
                            <span className="text-[10px] font-medium text-[#1a191b]">{step.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <img src={FA2.helmetUser} className="w-[10px] h-[10px]" alt="" />
                              <span className="text-[10px] text-[#797d7e]">{selectedWorker.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <img src={FA2.calendar} className="w-[10px] h-[10px]" alt="" />
                              <span className="text-[10px] text-[#797d7e]">Jun 10, 2026</span>
                            </div>
                          </div>
                        </div>
                        {/* Status badge */}
                        {status === "pass" && (
                          <div className="bg-[#f0f9f1] border border-[#a0dfa4] rounded-[4px] flex items-center gap-1 px-1.5 py-1 shrink-0">
                            <img src={FA2.checkCircle2} className="w-2 h-2" alt="" />
                            <span className="text-[10px] text-[#1a191b] font-medium">Passed</span>
                          </div>
                        )}
                        {status === "fail" && (
                          <div className="bg-[rgba(255,235,236,0.73)] border border-[#fddee0] rounded-[4px] flex items-center gap-1 px-1.5 py-1 shrink-0">
                            <img src={FA2.exclamation} className="w-2 h-2" alt="" />
                            <span className="text-[10px] text-[#1a191b] font-medium">Failed</span>
                          </div>
                        )}
                        {status === null && (
                          <div className="border border-[#e7e7e7] rounded-[4px] flex items-center gap-1 px-1.5 py-1 shrink-0">
                            <span className="text-[10px] text-[#797d7e] font-medium">Pending</span>
                          </div>
                        )}
                        {/* Pass / Fail buttons */}
                        {stage === "checks" && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setCheck(step.id, "pass")}
                              title="Pass"
                              className={`w-7 h-7 rounded-[6px] flex items-center justify-center transition-colors ${
                                status === "pass" ? "bg-[#28992a] text-white" : "border border-[#e7e7e7] text-[#797d7e] hover:border-[#28992a] hover:text-[#28992a]"
                              }`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setCheck(step.id, "fail")}
                              title="Fail"
                              className={`w-7 h-7 rounded-[6px] flex items-center justify-center transition-colors ${
                                status === "fail" ? "bg-[#fc3030] text-white" : "border border-[#e7e7e7] text-[#797d7e] hover:border-[#fc3030] hover:text-[#fc3030]"
                              }`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                      {/* Footer tags + expand toggle */}
                      <div className="bg-[#fcfcfc] border-t border-[#e7e7e7] flex items-center gap-2 px-4 py-2.5">
                        <div className="border border-[#e7e7e7] rounded-full flex items-center gap-1 px-1.5 py-1">
                          <img src={FA2.eye} className="w-2 h-2" alt="" />
                          <span className="text-[10px] text-[#1a191b] font-medium">Visual Check</span>
                        </div>
                        {step.verify && (
                          <div className="border border-[#e7e7e7] rounded-full flex items-center gap-1 px-1.5 py-1">
                            <img src={FA2.camera} className="w-2 h-2" alt="" />
                            <span className="text-[10px] text-[#1a191b] font-medium">Photo Required</span>
                          </div>
                        )}
                        {/* Note / image indicator badges */}
                        {noteVal && (
                          <div className="border border-[#003591]/30 bg-[#e8edf7] rounded-full flex items-center gap-1 px-1.5 py-1">
                            <MessageSquare className="w-2 h-2 text-[#003591]" />
                            <span className="text-[10px] text-[#003591] font-medium">Note</span>
                          </div>
                        )}
                        {imgs.length > 0 && (
                          <div className="border border-[#003591]/30 bg-[#e8edf7] rounded-full flex items-center gap-1 px-1.5 py-1">
                            <Camera className="w-2 h-2 text-[#003591]" />
                            <span className="text-[10px] text-[#003591] font-medium">{imgs.length} photo{imgs.length > 1 ? "s" : ""}</span>
                          </div>
                        )}
                        <button
                          onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                          className="ml-auto flex items-center gap-1 text-[#797d7e] hover:text-[#003591] transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span className="text-[10px]">{isExpanded ? "Hide" : "Add note"}</span>
                          <svg className={`w-2.5 h-2.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                          </svg>
                        </button>
                      </div>
                      {/* Expandable note + image upload */}
                      {isExpanded && (
                        <div className="border-t border-[#e7e7e7] bg-[#fafafa] p-3 flex flex-col gap-2">
                          <textarea
                            value={noteVal}
                            onChange={e => {
                              const next = new Map(stepNotes);
                              next.set(step.id, e.target.value);
                              setStepNotes(next);
                            }}
                            placeholder="Add a note for this check..."
                            className="w-full border border-[#e7e7e7] rounded-[6px] p-2 text-[11px] text-[#1a191b] resize-none focus:outline-none focus:border-[#003591] bg-white"
                            style={{ height: 68 }}
                          />
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 cursor-pointer border border-[#e7e7e7] rounded-[6px] px-2.5 py-1.5 text-[10px] text-[#797d7e] hover:border-[#003591] hover:text-[#003591] transition-colors bg-white">
                              <Camera className="w-3 h-3" />
                              Attach photo
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={e => {
                                  const files = Array.from(e.target.files ?? []);
                                  if (!files.length) return;
                                  const urls = files.map(f => URL.createObjectURL(f));
                                  const next = new Map(stepImages);
                                  next.set(step.id, [...(next.get(step.id) ?? []), ...urls]);
                                  setStepImages(next);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                            {imgs.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {imgs.map((url, idx) => (
                                  <div key={idx} className="relative w-10 h-10 rounded-[4px] overflow-hidden border border-[#e7e7e7] group">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    <button
                                      onClick={() => {
                                        const next = new Map(stepImages);
                                        next.set(step.id, imgs.filter((_, i) => i !== idx));
                                        setStepImages(next);
                                      }}
                                      className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center"
                                    >
                                      <X className="w-3 h-3 text-white" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "comments" && (
              <div className="p-4 flex flex-col gap-3">
                <p className="text-[12px] font-medium text-[#1a191b]">Field Notes</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add notes about this inspection..."
                  className="w-full border border-[#e7e7e7] rounded-[8px] p-3 text-[12px] text-[#1a191b] resize-none focus:outline-none focus:border-[#003591]"
                  style={{ height: 160 }}
                />
                {stage === "documentation" && (
                  <button
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-[8px] text-[13px] font-medium text-white bg-[#003591] hover:bg-[#002a73] transition-colors mt-2"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : (
                      <>Complete & Send Report</>
                    )}
                  </button>
                )}
                {stage === "confirmed" && (
                  <div className="w-full flex items-center justify-center gap-2 py-3 rounded-[8px] text-[13px] font-medium text-[#28992a] bg-[#f0f9f1] border border-[#a0dfa4]">
                    <CheckCircle className="w-4 h-4" /> Report Sent
                  </div>
                )}
              </div>
            )}

            {activeTab === "activity" && (
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#003591] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[8px] text-white font-bold">{selectedWorker.name[0]}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-[#1a191b]">{selectedWorker.name}</span>
                    <span className="text-[11px] text-[#797d7e]"> started inspection</span>
                    <p className="text-[10px] text-[#9d9a9a] mt-0.5">Today 12:00 PM · {selectedWorker.region}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Inspections screen (Figma: node 2985:454) ────────────────────────────────

function InspectionsScreen({ onInspect }: { onInspect: () => void }) {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-white" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>

      {/* App header */}
      <div className="bg-[#003591] flex items-center gap-4 px-4 shrink-0" style={{ height: 56 }}>
        <div className="relative" style={{ width: 68, height: 16 }}>
          <img src={FA.logo} alt="C PRO" className="absolute inset-0 w-full h-full object-contain object-left" />
        </div>
        <div className="flex-1 text-white text-[18px] font-medium">Inspections</div>
        <div className="flex items-center gap-6">
          {/* Search */}
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          {/* Bell with badge */}
          <div className="relative">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
            <div className="absolute -top-1.5 -right-1.5 bg-[#f05f52] rounded-full w-[14px] h-[14px] flex items-center justify-center">
              <span className="text-[8px] text-white font-medium leading-none">3</span>
            </div>
          </div>
          {/* Avatar */}
          <div className="w-6 h-6 rounded-full border border-[#e0e0e0] overflow-hidden shrink-0">
            <img src={FA.avatar} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#e7e7e7] flex items-center justify-between px-5 shrink-0 bg-white">
        <div className="flex items-start gap-8">
          <div className="flex flex-col items-center gap-0">
            <div className="flex items-center gap-1.5 pt-3 pb-3">
              <span className="text-[#003591] text-[14px] font-medium">Scheduled</span>
              <div className="bg-[#ff4a4a] rounded-[4px] w-4 h-4 flex items-center justify-center">
                <span className="text-[9px] text-white font-medium leading-none">5</span>
              </div>
            </div>
            <div className="bg-[#003591] h-[5px] w-[122px] rounded-tl-[16px] rounded-tr-[16px]" />
          </div>
          <div className="pt-3 pb-3">
            <span className="text-[#1a191b] text-[14px]">Archived</span>
          </div>
        </div>
        <div className="flex items-center gap-7">
          <div className="flex items-center gap-2 cursor-pointer">
            <img src={FA.filterList} className="w-4 h-4" alt="" />
            <span className="text-[14px] text-[#797d7e]">Today</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <img src={FA.mapMarkerIcon} className="w-4 h-4" alt="" />
            <span className="text-[14px] text-[#797d7e]">Map View</span>
          </div>
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map background */}
        <img
          src={FA.map}
          alt="Map"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Route line — elbow (Manhattan) routing through marker centers */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <path
            d="M 551 316 L 551 263 L 599 263 L 599 197 L 482 197 L 482 64 L 570 64 L 570 16"
            fill="none"
            stroke="#003591"
            strokeWidth="3.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>

        {/* Markers — dark (rendered above route line) */}
        {[{ l: 469, t: 48 }, { l: 469, t: 181 }, { l: 557, t: 0 }, { l: 586, t: 247 }].map((pos, i) => (
          <div key={i}
            className="absolute bg-[#1a191b] border-2 border-white rounded-[8px] w-[26px] h-[32px] flex items-center justify-center shadow-md"
            style={{ left: pos.l, top: Math.max(0, pos.t), zIndex: 2 }}
          >
            <img src={FA.markerBlack} className="w-3 h-3" alt="" />
          </div>
        ))}

        {/* Active marker — blue */}
        <div
          className="absolute bg-white border-2 border-[#003591] rounded-[8px] w-[26px] h-[32px] flex items-center justify-center"
          style={{ left: 538, top: 300, zIndex: 2, boxShadow: "0 0 0 3px rgba(203,194,255,0.6), 0 4px 4px rgba(0,0,0,0.16)" }}
        >
          <img src={FA.markerBlue} className="w-3 h-3" alt="" />
        </div>

        {/* Inspection popup card */}
        <div
          className="absolute bg-white border border-[#e7e7e7] rounded-[8px] flex flex-col p-4"
          style={{ left: 184, top: 100, width: 332, gap: 28, zIndex: 10, boxShadow: "0px 4px 16px rgba(0,0,0,0.08)" }}
        >
          {/* Card header */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <img src={FA.carlisleLogo} alt="Carlisle" style={{ height: 9, width: 56, objectFit: "contain", objectPosition: "left" }} />
              <img src={FA.closeCircle} className="w-5 h-5 cursor-pointer" alt="close" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[#797d7e] text-[12px]">1209688</span>
                <span className="text-[#1a191b] text-[14px] font-bold">Empire Heights - Re-Inspection</span>
                <div className="flex items-center gap-1.5">
                  <img src={FA.mapMarkerIcon} className="w-[10px] h-[10px]" alt="" />
                  <span className="text-[#9d9a9a] text-[10px] truncate">Empire Heights Skyscraper, 20 W 34th St., New York, NY 10001</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="bg-[#e0f7f4] rounded-[4px] flex items-center gap-1 px-1.5 py-1">
                  <div className="w-1 h-1 rounded-full bg-[#1b7c74]" />
                  <span className="text-[#1b7c74] text-[10px] font-medium">Active</span>
                </div>
                <div className="border border-[#e7e7e7] rounded-[4px] flex items-center px-1.5 py-1">
                  <span className="text-[#1a191b] text-[10px] font-medium">12:00 PM</span>
                </div>
                <div className="flex items-center gap-1 px-1.5 py-1">
                  <img src={FA.signalGood} className="w-1.5 h-1.5" alt="" />
                  <span className="text-[#1a191b] text-[10px] font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions + Info */}
          <div className="flex flex-col gap-7">
            <div className="flex items-start gap-8">
              <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={onInspect}>
                <div className="bg-[#003591] rounded-full p-2">
                  <img src={FA.arrowRight} className="w-4 h-4" alt="" />
                </div>
                <span className="text-[#003591] text-[12px]">Inspect</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer">
                <div className="bg-[#f1f1f1] rounded-full p-2">
                  <img src={FA.phoneFlip} className="w-4 h-4" alt="" />
                </div>
                <span className="text-[#1a191b] text-[12px]">Contact</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer">
                <div className="bg-[#f1f1f1] rounded-full p-2">
                  <img src={FA.engineWarning} className="w-4 h-4" alt="" />
                </div>
                <span className="text-[#1a191b] text-[12px]">Report</span>
              </div>
            </div>

            <div className="border border-[#e7e7e7] rounded-[8px] flex gap-4 p-2.5">
              <div className="flex-1 flex flex-col gap-2">
                <span className="text-[10px] font-medium text-[#1a191b]">Re-Inspection</span>
                <span className="text-[10px] text-[#797d7e]">Type</span>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <span className="text-[10px] font-medium text-[#1a191b]">38,500</span>
                <span className="text-[10px] text-[#797d7e]">Square Footage</span>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <span className="text-[10px] font-medium text-[#1a191b]">1 hr 30 min</span>
                <span className="text-[10px] text-[#797d7e]">Complete Time</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="bg-[#e9e9e9] h-1 rounded-full overflow-hidden">
                <div className="bg-[#28992a] h-1 rounded-full" style={{ width: "22%" }} />
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="text-[#797d7e]">Current</span>
                  <span className="text-[#28992a] font-medium">Preparation</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#797d7e]">Next</span>
                  <span className="text-[#1a191b] font-medium">Inspection</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weather widget */}
        <div
          className="absolute bg-white border border-[#e7e7e7] rounded-[8px] flex flex-col p-2"
          style={{ right: 23, top: 16, gap: 6, boxShadow: "0px 4px 16px rgba(0,0,0,0.08)" }}
        >
          <div className="flex items-center gap-1">
            <img src={FA.partlyCloudy} className="w-[26px] h-[26px]" alt="" />
            <span className="text-[14px] text-black">86°</span>
          </div>
          <div className="flex items-center gap-1.5 px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3ad53d]" />
            <span className="text-[10px] text-[#797d7e]">33 AQI</span>
          </div>
        </div>

        {/* Zoom controls */}
        <div
          className="absolute bg-white border border-[#e7e7e7] rounded-[8px] flex flex-col items-center py-3 w-11"
          style={{ right: 23, bottom: 80, gap: 10, boxShadow: "0px 2px 4px rgba(0,0,0,0.16)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="cursor-pointer" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 3v10M3 8h10" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div className="bg-[#e7e7e7] h-px w-full" />
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="cursor-pointer" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8h10" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Expand */}
        <div
          className="absolute bg-white border border-[#e7e7e7] rounded-[8px] flex items-center justify-center w-11 h-11 cursor-pointer"
          style={{ right: 23, bottom: 26, boxShadow: "0px 2px 4px rgba(0,0,0,0.16)" }}
        >
          <img src={FA.expand} className="w-4 h-4" alt="" />
        </div>

        {/* Location */}
        <div
          className="absolute bg-white border border-[#e7e7e7] rounded-[8px] flex items-center justify-center w-11 h-11 cursor-pointer"
          style={{ left: 23, bottom: 26, boxShadow: "0px 2px 4px rgba(0,0,0,0.16)" }}
        >
          <img src={FA.locationTrack} className="w-4 h-4" alt="" />
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FieldExperiencePage() {
  const [view, setView] = useState<"login" | "inspections" | "form">("login");

  return (
    <div className="min-h-screen bg-[#f8f8f8]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <PageHero
        title="Field Experience"
        active="field-experience"
        action={
          view !== "login"
            ? <div className="text-[13px] font-semibold px-4 py-2 rounded-[8px]" style={{ background: "#d6f7da", color: "#15803d" }}>● FSR Online</div>
            : <div className="text-[13px] px-4 py-2 rounded-[8px] bg-white text-[#808488]">Not signed in</div>
        }
      />

      <div className="bg-[#f8f8f8] rounded-t-[24px] -mt-6">
      {/* Tablet */}
      <div className="flex-1 max-w-[1440px] mx-auto w-full px-[120px] py-10">
        <TabletFrame statusBarTheme={view !== "login" ? "dark" : "light"}>
          <AnimatePresence mode="wait">
            {view === "login" && (
              <motion.div
                key="login"
                className="h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <LoginScreen onSignIn={() => setView("inspections")} />
              </motion.div>
            )}
            {view === "inspections" && (
              <motion.div
                key="inspections"
                className="h-full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <InspectionsScreen onInspect={() => setView("form")} />
              </motion.div>
            )}
            {view === "form" && (
              <motion.div
                key="form"
                className="h-full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <FsrInspectionForm onBack={() => setView("inspections")} />
              </motion.div>
            )}
          </AnimatePresence>
        </TabletFrame>
      </div>
      </div>
    </div>
  );
}
