// Shared job data used by dashboard-v2 and job-detail pages
// ── Stable local assets ──
import building1 from "@assets/building1.jpg";
import building2 from "@assets/building2.jpg";
import building3 from "@assets/building3.jpg";

export type JobState = "active" | "completed";

export interface JobVerifiers {
  assemblyLetter: string;
  submittal: string;
  inspection: string;
  warranty: string;
}

export interface Job {
  id: string;
  img: string;
  title: string;
  system: string;
  location: string;
  address: string;
  dateCreated: string;
  days: string;
  next: string;
  updates: number;
  team: TeamMember[];
  status: JobStatus;
  chat: ChatMessage[];
  jobState: JobState;
  verifiers: JobVerifiers;
}

export interface TeamMember {
  role: string;
  name: string;
  contact: string;
  avatarUrl: string;
  avatarStyle?: React.CSSProperties;
}

export interface JobStatus {
  assemblyLetter: { pct: number; label: string };
  submittal:      { pct: number; label: string };
  inspection:     { pct: number; label: string };
  warranty:       { pct: number; label: string };
}

export interface ChatMessage {
  sender: string;
  time: string;
  text: string;
  isSystem?: boolean;
}

const AVATAR_MARK  = "https://randomuser.me/api/portraits/men/32.jpg";
const AVATAR_JON   = "https://randomuser.me/api/portraits/men/45.jpg";
const AVATAR_ROB   = "https://randomuser.me/api/portraits/women/28.jpg";
const AVATAR_LISA  = "https://randomuser.me/api/portraits/women/42.jpg";

export const JOBS: Job[] = [
  {
    id: "metro-hospital",
    img: building1,
    title: "Metro Hospital Expansion",
    system: "TPO Membrane System",
    location: "Seattle, WA",
    address: "1327 South SE Loop 323, Seattle, WA 75701",
    dateCreated: "December 13, 2024",
    days: "12 days",
    next: "Assembly Letter",
    updates: 2,
    team: [
      { role: "Contractor",         name: "Mark Reynolds",   contact: "MetroRoof Solutions | (212) 555.1234", avatarUrl: AVATAR_MARK, avatarStyle: { objectPosition: "-14% 0" } },
      { role: "Contractor",         name: "Jon Carpenter",   contact: "Roofs by Jon | (212) 555.4567",        avatarUrl: AVATAR_JON },
      { role: "CCM Design Analyst", name: "Roberta Sanchez", contact: "Carlisle | (480) 555.4567",            avatarUrl: AVATAR_ROB, avatarStyle: { objectPosition: "-28% -40%" } },
      { role: "CCM Design Analyst", name: "Lisa Weber",      contact: "Carlisle | (480) 555.2253",            avatarUrl: AVATAR_LISA },
    ],
    status: {
      assemblyLetter: { pct: 100, label: "Complete"    },
      submittal:      { pct: 45,  label: "In Progress" },
      inspection:     { pct: 0,   label: "Pending"     },
      warranty:       { pct: 0,   label: "Pending"     },
    },
    jobState: "active",
    verifiers: { assemblyLetter: "Lisa Weber", submittal: "Lisa Weber", inspection: "Lisa Weber", warranty: "Lisa Weber" },
    chat: [
      { sender: "System",        time: "01-14-2025 at 3:42 PM", text: "Submittal package submitted for review",                                                      isSystem: true  },
      { sender: "Mark Reynolds", time: "01-14-2025 at 4:33 PM", text: "I updated technical specifications based on Lisa's feedback. Ready for final review."                       },
      { sender: "Lisa Weber",    time: "01-14-2025 at 5:06 PM", text: "Site measurements confirmed. All dimensions match the original specifications."                            },
    ],
  },
  {
    id: "westfield-shopping",
    img: building2,
    title: "Westfield Shopping Center - Building A",
    system: "FleeceBACK® Membrane",
    location: "Portland, OR",
    address: "4500 NE Sandy Blvd, Portland, OR 97213",
    dateCreated: "November 28, 2024",
    days: "12 days",
    next: "Assembly Letter",
    updates: 2,
    team: [
      { role: "Contractor",         name: "Sarah Mitchell",  contact: "Pacific Roofing Co | (503) 555.2200", avatarUrl: AVATAR_JON },
      { role: "CCM Design Analyst", name: "Lisa Weber",      contact: "Carlisle | (480) 555.2253",           avatarUrl: AVATAR_LISA },
      { role: "CCM Design Analyst", name: "Roberta Sanchez", contact: "Carlisle | (480) 555.4567",           avatarUrl: AVATAR_ROB, avatarStyle: { objectPosition: "-28% -40%" } },
    ],
    status: {
      assemblyLetter: { pct: 100, label: "Complete"    },
      submittal:      { pct: 80,  label: "In Progress" },
      inspection:     { pct: 20,  label: "In Progress" },
      warranty:       { pct: 0,   label: "Pending"     },
    },
    jobState: "active",
    verifiers: { assemblyLetter: "Lisa Johnson", submittal: "Lisa Johnson", inspection: "Lisa Johnson", warranty: "Lisa Johnson" },
    chat: [
      { sender: "System",         time: "01-10-2025 at 9:15 AM", text: "Assembly letter approved and filed.",                                     isSystem: true  },
      { sender: "Sarah Mitchell", time: "01-10-2025 at 10:02 AM", text: "Wind load calcs updated per structural engineer's notes."                                },
      { sender: "Lisa Weber",     time: "01-10-2025 at 11:30 AM", text: "Submittal package 80% complete. Missing insulation spec sheet."                          },
    ],
  },
  {
    id: "industrial-park",
    img: building3,
    title: "Industrial Park Phase 2",
    system: "EPDM Roofing System",
    location: "Tacoma, WA",
    address: "8800 Pacific Ave, Tacoma, WA 98444",
    dateCreated: "October 15, 2024",
    days: "12 days",
    next: "Completed",
    updates: 0,
    team: [
      { role: "Contractor",         name: "Tom Bradley",     contact: "Cascade Roofing | (253) 555.3300",    avatarUrl: AVATAR_MARK, avatarStyle: { objectPosition: "-14% 0" } },
      { role: "Contractor",         name: "Jon Carpenter",   contact: "Roofs by Jon | (212) 555.4567",       avatarUrl: AVATAR_JON },
      { role: "CCM Design Analyst", name: "Roberta Sanchez", contact: "Carlisle | (480) 555.4567",           avatarUrl: AVATAR_ROB, avatarStyle: { objectPosition: "-28% -40%" } },
    ],
    status: {
      assemblyLetter: { pct: 100, label: "Complete" },
      submittal:      { pct: 100, label: "Complete" },
      inspection:     { pct: 100, label: "Complete" },
      warranty:       { pct: 100, label: "Complete" },
    },
    jobState: "completed",
    verifiers: { assemblyLetter: "Roberta Sanchez", submittal: "Roberta Sanchez", inspection: "Tom Bradley", warranty: "Roberta Sanchez" },
    chat: [
      { sender: "System",          time: "12-20-2024 at 2:00 PM",  text: "Job created. Assembly letter in progress.",                                  isSystem: true },
      { sender: "Tom Bradley",     time: "12-20-2024 at 3:15 PM",  text: "Initial site assessment complete. EPDM spec confirmed for all 6 buildings."              },
      { sender: "Roberta Sanchez", time: "12-21-2024 at 9:00 AM",  text: "Assembly letter approved and filed."                                                     },
      { sender: "System",          time: "01-05-2025 at 10:00 AM", text: "Submittal package approved.",                                               isSystem: true },
      { sender: "Tom Bradley",     time: "01-12-2025 at 2:45 PM",  text: "Inspection passed. All 6 buildings signed off."                                          },
      { sender: "System",          time: "01-15-2025 at 8:30 AM",  text: "Warranty issued. Job complete.",                                            isSystem: true },
    ],
  },
];

export function getJob(id: string): Job | undefined {
  return JOBS.find((j) => j.id === id);
}
