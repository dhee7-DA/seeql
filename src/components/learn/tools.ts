// Tool registry — ONE source of truth for every non-lesson destination in
// the app. The desktop sidebar (Toolbox / Practice lab groups), the mobile
// ToolRail chips and the drift-guard in learn-app.tsx all derive from this
// list. Adding tool #18 is now: a View union member + one entry here.
// (Labels live here too, so the three former parallel lists can't drift.)

import {
  Activity,
  Bot,
  Briefcase,
  Bug,
  CalendarDays,
  Dumbbell,
  Eye,
  FileStack,
  FlaskConical,
  Flag,
  Frame,
  Gauge,
  Ghost,
  LayoutDashboard,
  MessagesSquare,
  Network,
  Printer,
  Shapes,
  Table2,
} from "lucide-react";

export type ToolKind =
  | "overview"
  | "seeq"
  | "daily"
  | "frames"
  | "mentor"
  | "explorer"
  | "library"
  | "drills"
  | "mixed"
  | "cases"
  | "predict"
  | "clinic"
  | "golf"
  | "perf"
  | "interview"
  | "studio"
  | "explain"
  | "mastery"
  | "sheet";

export interface ToolDef {
  kind: ToolKind;
  icon: React.ComponentType<{ className?: string }>;
  /** Sidebar label (also used for aria-labels). */
  label: string;
  /** Sub-line under the sidebar label. */
  note: string;
  /** Short label for the mobile ToolRail chips. */
  short: string;
  /** Sidebar grouping: "core" (overview) sits atop the Toolbox group. */
  section: "core" | "toolbox" | "lab";
}

// Registry order == mobile rail order (curated: Overview, SeeQ, Mentor first).
export const TOOLS: ToolDef[] = [
  { kind: "overview", icon: LayoutDashboard, label: "Course overview", note: "progress & badges", short: "Overview", section: "core" },
  { kind: "seeq", icon: Ghost, label: "SeeQ playground", note: "dress & place your buddy", short: "SeeQ", section: "toolbox" },
  { kind: "daily", icon: CalendarDays, label: "Daily puzzle", note: "one a day — keep the streak", short: "Daily", section: "toolbox" },
  { kind: "frames", icon: Frame, label: "Window-frame playground", note: "watch the frame slide, live", short: "Frames", section: "toolbox" },
  { kind: "mentor", icon: Bot, label: "AI Mentor", note: "tiered hints on your live data", short: "Mentor", section: "lab" },
  { kind: "explorer", icon: Table2, label: "Data explorer", note: "browse the live tables", short: "Data", section: "toolbox" },
  { kind: "library", icon: Shapes, label: "Diagram library", note: "every visual, one wall", short: "Diagrams", section: "toolbox" },
  { kind: "drills", icon: Dumbbell, label: "Keyword drills", note: "every keyword, six angles", short: "Drills", section: "toolbox" },
  { kind: "mixed", icon: FlaskConical, label: "Mixed quiz", note: "10 from the whole course", short: "Quiz", section: "toolbox" },
  { kind: "cases", icon: FileStack, label: "Case files", note: "rebuild real stakeholder queries", short: "Cases", section: "toolbox" },
  { kind: "predict", icon: Eye, label: "Predict the output", note: "freeze the grid before it runs", short: "Predict", section: "lab" },
  { kind: "clinic", icon: Bug, label: "Error clinic", note: "diagnose real bugs, loud & silent", short: "Clinic", section: "lab" },
  { kind: "golf", icon: Flag, label: "Query golf", note: "same rows, fewer strokes", short: "Golf", section: "lab" },
  { kind: "perf", icon: Gauge, label: "Performance lab", note: "SCAN vs SEARCH, index stings", short: "Perf", section: "lab" },
  { kind: "interview", icon: Briefcase, label: "Interview prep", note: "the screening classics, graded", short: "Interview", section: "lab" },
  { kind: "studio", icon: Network, label: "Schema studio", note: "spot the design smell", short: "Schema", section: "lab" },
  { kind: "explain", icon: MessagesSquare, label: "Explain back", note: "say what the query does", short: "Explain", section: "lab" },
  { kind: "mastery", icon: Activity, label: "Mastery map", note: "your skills, your daily quest", short: "Mastery", section: "lab" },
  { kind: "sheet", icon: Printer, label: "Cheat sheet", note: "personal revision, prints to PDF", short: "Sheet", section: "lab" },
];

/** Sidebar group 1: overview + toolbox tools, in registry order. */
export const CORE_AND_TOOLBOX = TOOLS.filter((t) => t.section === "core" || t.section === "toolbox");
/** Sidebar group 2: practice-lab tools, in registry order. */
export const LAB_TOOLS = TOOLS.filter((t) => t.section === "lab");
