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

// ── Figma asset URLs (node 2985:454, expire in 7 days) ───────────────────────

const FA = {
  avatar:         "https://www.figma.com/api/mcp/asset/4275529b-39be-4511-97bf-708d12a1f1ae",
  map:            "https://www.figma.com/api/mcp/asset/497ede6e-5304-4958-ad9e-08713267b5fa",
  partlyCloudy:   "https://www.figma.com/api/mcp/asset/713bf473-879a-4c01-b60e-088a8e039231",
  signalBars:     "https://www.figma.com/api/mcp/asset/fdd515a5-e29a-4b1c-b0cc-3308b16b83ea",
  wifi:           "https://www.figma.com/api/mcp/asset/a999ba3c-9a71-4ce2-9fe8-37a4a8c63220",
  battery:        "https://www.figma.com/api/mcp/asset/cada8ecd-e86e-4c4b-ae0c-872631d21dff",
  logo:           "https://www.figma.com/api/mcp/asset/c74bbac3-2258-48e1-842f-8eff8c4d8293",
  filterList:     "https://www.figma.com/api/mcp/asset/a7260711-6bc0-4380-9633-95fb8b80f02c",
  mapMarkerIcon:  "https://www.figma.com/api/mcp/asset/be172395-9890-4d43-a44a-4200aa31f43d",
  routeLine:      "https://www.figma.com/api/mcp/asset/cff9f128-02fd-4ed0-aec4-3028296117b8",
  plus:           "https://www.figma.com/api/mcp/asset/8ef8c5dc-e8b9-4a84-b35d-053dd497dac8",
  minus:          "https://www.figma.com/api/mcp/asset/7df98277-f9d8-4418-bcd7-4cc435a9810a",
  expand:         "https://www.figma.com/api/mcp/asset/4968d6a5-bbf7-45df-902c-1618774421b9",
  markerBlack:    "https://www.figma.com/api/mcp/asset/3998e3c5-4475-41ae-afe9-76f7d429faee",
  markerBlue:     "https://www.figma.com/api/mcp/asset/d39334b7-df4c-453c-a8f5-764b3d50880f",
  carlisleLogo:   "https://www.figma.com/api/mcp/asset/b1a1ef3f-b04f-4321-8f67-74220ecb361b",
  closeCircle:    "https://www.figma.com/api/mcp/asset/b2c86b88-a85c-4c7d-b3d9-b537decb4298",
  signalGood:     "https://www.figma.com/api/mcp/asset/23d581a0-f7d0-46da-808e-34793b8b5bce",
  arrowRight:     "https://www.figma.com/api/mcp/asset/7e72cc56-1b81-4a95-acd0-1a0cde187304",
  phoneFlip:      "https://www.figma.com/api/mcp/asset/3748925e-770b-404d-a71c-c51c4b25b9ef",
  engineWarning:  "https://www.figma.com/api/mcp/asset/19253967-c74f-4b4f-81fa-fec57ae343f8",
  locationTrack:  "https://www.figma.com/api/mcp/asset/15679a0f-a196-4582-90b9-ea1a1d2b7e9e",
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
                    <img src="https://www.figma.com/api/mcp/asset/bbf33f8c-9710-4621-9599-8183f23c8c90" style={{ height: 10, width: 16.5 }} alt="" />
                    <img src="https://www.figma.com/api/mcp/asset/0e8b62e9-cb6c-499a-9bba-53ecb6625422" style={{ height: 10, width: 14 }} alt="" />
                    <span className="text-[11px] font-medium" style={{ fontFamily: "'SF Pro', system-ui, sans-serif", color: "#1a1a1a" }}>100%</span>
                    <img src="https://www.figma.com/api/mcp/asset/a575c084-c096-4f58-93d6-9d3fdf2516e1" style={{ height: 12, width: 26.5 }} alt="" />
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
  building3d:    "https://www.figma.com/api/mcp/asset/a954b9ac-6396-4c5d-b3fa-e32a79bd8038",
  photo1:        "https://www.figma.com/api/mcp/asset/3b02c321-4ff9-4039-a637-cd13dde85caa",
  photo2:        "https://www.figma.com/api/mcp/asset/029caf3b-8c07-4ccf-9dd2-e434e4eb5b1e",
  photo3:        "https://www.figma.com/api/mcp/asset/543f3098-3e4f-4977-9b25-eef120876eeb",
  photo4:        "https://www.figma.com/api/mcp/asset/5db14aeb-fb53-43a9-9ec0-6c1abc19ff4b",
  photo5:        "https://www.figma.com/api/mcp/asset/6cdf194f-bc17-4d4f-bc96-ac4b8169515b",
  wrenchRed:     "https://www.figma.com/api/mcp/asset/cc95e58a-b318-4ce5-a1b3-8f0063cb2821",
  wrenchOutline: "https://www.figma.com/api/mcp/asset/4126a52d-6282-4b05-84a7-f65e45f3c749",
  spinner:       "https://www.figma.com/api/mcp/asset/44ea16c6-9f17-4557-b95f-e40754f5af8b",
  checkCircle:   "https://www.figma.com/api/mcp/asset/517cad7d-1fb8-46d6-8a42-e6b8443e9c42",
  checkCircle2:  "https://www.figma.com/api/mcp/asset/4610448a-1cf0-41bf-92ac-24d9ab16447a",
  closeCircle:   "https://www.figma.com/api/mcp/asset/76f34564-ce11-4edf-aefa-587bd5b57bc8",
  exclamation:   "https://www.figma.com/api/mcp/asset/73b579b9-e1c7-447f-b9be-02a267c25555",
  helmetUser:    "https://www.figma.com/api/mcp/asset/9e494b9e-8b0a-48bf-85da-b9febaef86be",
  calendar:      "https://www.figma.com/api/mcp/asset/e75fcad3-7f01-4949-8eea-ea6a44e14d21",
  star:          "https://www.figma.com/api/mcp/asset/f6fbb05c-c4be-46b9-8a49-569a3a4eb109",
  check:         "https://www.figma.com/api/mcp/asset/81e80225-f02b-44cf-bd30-d4de9c8e3ce5",
  eye:           "https://www.figma.com/api/mcp/asset/58428411-4aee-4064-82bf-efeff515c361",
  camera:        "https://www.figma.com/api/mcp/asset/3a107fd4-2479-4007-856b-ed0da10bf907",
  arrowLeft:     "https://www.figma.com/api/mcp/asset/a83affe5-2fd6-4a68-8857-fa340732acc1",
  signalGood:    "https://www.figma.com/api/mcp/asset/cd326090-f79f-4a46-be34-1efaf53d0d4b",
  avatar2:       "https://www.figma.com/api/mcp/asset/0ba9a9f4-ec92-4bd2-b774-54ec8bee7d19",
  logo2:         "https://www.figma.com/api/mcp/asset/68fa5cc0-be9b-42ab-9103-9000767dac37",
  search2:       "https://www.figma.com/api/mcp/asset/42c35a6a-0946-4ed5-a94d-6cbe09a6ea4c",
  bell2:         "https://www.figma.com/api/mcp/asset/d2545cb3-3406-4331-83a1-13dc76f18629",
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
