"use client";

// Learn shell — sidebar (module, rank, streak, lessons) + lesson content.
// A watcher effect converts progress into badges and level-up celebrations.

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Download,
  Flame,
  GraduationCap,
  RotateCcw,
  Swords,
  Upload,
  Zap,
} from "lucide-react";
import { LESSONS, MODULES } from "@/lib/curriculum/lessons";
import { useProgress } from "@/lib/curriculum/progress";
import { BADGES, currentStreak, levelFor, totalXp } from "@/lib/curriculum/gamification";
import { useUniverse, universeMcqCorrect } from "@/lib/universe/progress";
import { monthPerfect, monthsInLedger, puzzleStreak } from "@/lib/curriculum/daily";
import { cn } from "@/lib/utils";
import { LessonView } from "./lesson-view";
import { ExamView } from "./exam-view";
import { ReviewDeck } from "./review";
import { RoadmapTrack } from "./roadmap-track";
import { DataExplorer } from "./data-explorer";
import { MixedQuiz } from "./mixed-quiz";
import { BlitzMode } from "./blitz-mode";
import { CaseFiles } from "./case-files";
import { DiagramLibrary } from "./diagram-library";
import { DrillYard } from "./drill-yard";
import { PredictView } from "./predict-view";
import { ErrorClinic } from "./error-clinic";
import { QueryGolf } from "./query-golf";
import { MasteryMap } from "./mastery-map";
import { InterviewTrack } from "./interview-track";
import { SchemaStudio } from "./schema-studio";
import { ExplainBack } from "./explain-back";
import { CheatSheet } from "./cheat-sheet";
import { MentorChat } from "./mentor-chat";
import { PerfLab } from "./perf-lab";
import { DailyPuzzle } from "./daily-puzzle";
import { FramePlayground } from "./frame-playground";
import { SeeqView } from "./seeq-view";
import { GauntletView } from "./gauntlet-view";
import { KeywordPractice } from "./keyword-practice";
import { LeetCodeView } from "./leetcode-view";
import { CompaniesView } from "./companies-view";
import { gauntletFor } from "@/lib/curriculum/gauntlet";
import { ActivityStrip, MasteryGrid } from "./progress-cards";
import { CelebrationHost, celebrate } from "./celebrate";
import { CORE_AND_TOOLBOX, LAB_TOOLS, TOOLS, type ToolKind } from "./tools";
import { Btn, Chip, Panel, ProgressBar, SectionLabel, ToolRow } from "./ui/kit";
import { Icon3D } from "./ui/icon3d";
import { ActivityHeatmap } from "./activity-heatmap";
import { CsvSandbox } from "./csv-sandbox";
import { QueryNotebook } from "./query-notebook";
import { OnboardingTour, TourReplayButton, markTourSeen, tourSeen } from "./onboarding-tour";
import { BackupError, buildBackup, downloadBackup, importBackupFile } from "@/lib/port";
import { BAND_BY_MODULE } from "@/lib/leetcode/sections";

type View =
  | { kind: "overview" }
  | { kind: "roadmap" }
  | { kind: "seeq" }
  | { kind: "daily" }
  | { kind: "frames" }
  | { kind: "lesson"; id: string }
  | { kind: "exam"; moduleId: string }
  | { kind: "gauntlet"; moduleId: string }
  | { kind: "practice" }
  | { kind: "explorer" }
  | { kind: "mixed" }
  | { kind: "blitz" }
  | { kind: "cases" }
  | { kind: "drills" }
  | { kind: "library" }
  | { kind: "predict" }
  | { kind: "clinic" }
  | { kind: "golf" }
  | { kind: "mastery" }
  | { kind: "interview" }
  | { kind: "companies"; domain?: string; company?: string }
  | { kind: "studio" }
  | { kind: "explain" }
  | { kind: "perf"; sql?: string; tab?: "pipeline" | "workbench" | "detective" }
  | { kind: "sheet" }
  | { kind: "mentor" }
  | { kind: "sandbox" }
  | { kind: "notebook" }
  | { kind: "lc"; topic?: string; slug?: string }
  | { kind: "recall" };

// Drift guard — the registry in tools.ts must name every non-lesson view
// (and vice versa). A compile error here means: update tools.ts too.
// ("exam" is argumented per-module like "lesson", so it sits outside the
// registry — its entry point lives in each module's sidebar section.)
type NonLessonViews = Exclude<View["kind"], "lesson" | "exam" | "gauntlet">;
export type RegistryCoversViews = [NonLessonViews] extends [ToolKind]
  ? [ToolKind] extends [NonLessonViews]
    ? true
    : false
  : false;

// ---- Collapsible module state (persisted) -------------------------------

const MODULES_OPEN_KEY = "seeql.modules-open";

function loadOpenModules(): number[] | null {
  try {
    const raw = localStorage.getItem(MODULES_OPEN_KEY);
    if (!raw) return null;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((n) => typeof n === "number") : null;
  } catch {
    return null;
  }
}

/** Smooth height-reveal wrapper for module lesson lists. */
function Collapse({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="body"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function moduleOf(lessonId: string) {
  return MODULES.find((m) => m.lessons.some((l) => l.id === lessonId));
}

function useBadgeWatcher() {
  const xpEvents = useProgress((s) => s.xpEvents);
  const mcqAttempts = useProgress((s) => s.mcqAttempts);
  const badges = useProgress((s) => s.badges);
  const xpByDay = useProgress((s) => s.xpByDay);
  const dailyGoal = useProgress((s) => s.dailyGoal);
  const puzzleDone = useProgress((s) => s.puzzleDone);
  const backlogDone = useProgress((s) => s.backlogDone);
  const freezes = useProgress((s) => s.freezes);
  const universeMocks = useUniverse((s) => s.mocks);
  const universeMockMcq = useUniverse((s) => s.mockMcq);
  const universeTarget = useUniverse((s) => s.target);
  const prevLevel = useRef(-1);
  const ready = useRef(false);

  const xp = useMemo(() => totalXp({ xpEvents }), [xpEvents]);
  const level = levelFor(xp);

  const ctx = useMemo(() => {
    const problemsSolved = Object.keys(xpEvents).filter((k) => k.startsWith("solve:")).length;
    const mcqsCorrect = Object.values(mcqAttempts).filter((a) => a.correct).length;
    const lessonsDone = Object.keys(xpEvents).filter((k) => k.startsWith("lesson:")).length;
    const perfectQuizzes = LESSONS.filter((l) =>
      l.mcqs.every((m) => mcqAttempts[m.id]?.firstTry),
    ).length;
    const puzzlesDone = Object.keys(puzzleDone).length + Object.keys(backlogDone).length;
    const puzzleStreakNow = puzzleStreak(puzzleDone, freezes).streak;
    const months = new Set([...monthsInLedger(puzzleDone), ...monthsInLedger(backlogDone)]);
    let perfectMonths = 0;
    for (const mk of months) if (monthPerfect(puzzleDone, backlogDone, mk)) perfectMonths++;
    // universe layer — kit MCQs correct (tab side, deduped) + mock-screen side;
    // the same question answered in both places counts once (BadgeCtx contract)
    const universeTabCorrect = universeMcqCorrect(mcqAttempts);
    let universeMockOnly = 0;
    for (const [key, a] of Object.entries(universeMockMcq)) {
      if (!a.correct) continue;
      const mcqId = key.split(":")[2];
      if (mcqId && mcqAttempts[mcqId]?.correct) continue;
      universeMockOnly += 1;
    }
    return {
      lessonsDone,
      problemsSolved,
      mcqsCorrect,
      perfectQuizzes,
      puzzlesDone,
      puzzleStreak: puzzleStreakNow,
      perfectMonths,
      mocks: universeMocks.length,
      mockBestPct: universeMocks.reduce((b, m) => Math.max(b, m.pct), 0),
      targetSet: universeTarget !== null,
      universeCorrect: universeTabCorrect + universeMockOnly,
    };
  }, [xpEvents, mcqAttempts, puzzleDone, backlogDone, freezes, universeMocks, universeMockMcq, universeTarget]);

  const streak = useMemo(() => currentStreak({ xpByDay, dailyGoal }), [xpByDay, dailyGoal]);

  useEffect(() => {
    if (!ready.current) {
      ready.current = true;
      prevLevel.current = level.index;
      return;
    }
    const store = useProgress.getState();
    for (const b of BADGES) {
      if (store.badges[b.id] === undefined && b.test(ctx, xp, streak)) {
        if (store.unlockBadge(b.id)) {
          celebrate({ kind: "badge", title: `Badge · ${b.title}`, sub: b.desc });
        }
      }
    }
    if (level.index > prevLevel.current) {
      celebrate({ kind: "level", title: `Level up — ${level.title}`, sub: `Rank ${level.index + 1} of 6` });
      prevLevel.current = level.index;
    }
  }, [ctx, xp, streak, level]);

  return { xp, level, streak, ctx };
}

/** Shell-header rank chips — the always-visible XP total and the daily-streak
 *  flame, mounted in the app header (page.tsx) so gamification is present on
 *  EVERY learn view, not just the overview sidebar. Subscribes directly to
 *  the shared ledger, so universe XP banks light it up too. */
export function HeaderRank() {
  const xpEvents = useProgress((s) => s.xpEvents);
  const xpByDay = useProgress((s) => s.xpByDay);
  const dailyGoal = useProgress((s) => s.dailyGoal);
  const xp = useMemo(() => totalXp({ xpEvents }), [xpEvents]);
  const streak = useMemo(() => currentStreak({ xpByDay, dailyGoal }), [xpByDay, dailyGoal]);
  return (
    <div className="flex items-center gap-1.5" aria-label={`Total XP ${xp}, streak ${streak} days`}>
      <span
        className="flex items-center gap-1 rounded-md border border-amber-400/25 bg-amber-400/[0.08] px-2 py-1 text-[11px] font-semibold text-amber-200"
        title="Total XP — every correct answer, mock and lesson banks here"
      >
        <Zap className="h-3 w-3" />
        <span className="tnum">{xp.toLocaleString()}</span>
        <span className="hidden text-amber-200/70 sm:inline">XP</span>
      </span>
      <span
        className={cn(
          "flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold",
          streak > 0
            ? "border-orange-400/25 bg-orange-400/[0.08] text-orange-200"
            : "border-zinc-800 bg-zinc-900 text-zinc-500",
        )}
        title={streak > 0 ? `${streak}-day streak — hit your daily goal to keep it alive` : "Hit your daily goal to start a streak"}
      >
        <Flame className={cn("h-3 w-3", streak === 0 && "opacity-50 grayscale")} />
        <span className="tnum">{streak > 0 ? `${streak}d` : "—"}</span>
      </span>
    </div>
  );
}

function RankBlock({ xp, level, streak }: { xp: number; level: ReturnType<typeof levelFor>; streak: number }) {
  return (
    <Panel tone="nested" pad={3.5} rounded="lg">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-semibold text-zinc-100">{level.title}</span>
        <span className="tnum font-mono text-xs text-emerald-300">{xp.toLocaleString()} XP</span>
      </div>
      <ProgressBar value={level.pct} className="mt-2.5" />
      <p className="mt-1.5 text-[11px] text-zinc-500">
        {level.next === null ? "Top rank reached — Query Wizard" : `${(level.next - xp).toLocaleString()} XP to ${titleAfter(level.index)}`}
      </p>
      <div className="mt-2.5 flex items-center gap-1.5 border-t border-zinc-800 pt-2.5 text-[11px] text-zinc-400">
        <Icon3D name="fire" size={18} anim={streak > 0 ? "wiggle" : "none"} className={streak > 0 ? "" : "opacity-30 grayscale"} />
        {streak > 0 ? `${streak}-day streak — keep it alive` : "Hit your daily goal to start a streak"}
      </div>
    </Panel>
  );
}

/** Overview card: compact module chip with a progress ring — lessons reveal on demand. */
function OverviewModuleCard({
  module,
  open,
  onToggle,
  onOpenLesson,
  onOpenLc,
  xpEvents,
}: {
  module: (typeof MODULES)[number];
  open: boolean;
  onToggle: () => void;
  onOpenLesson: (id: string) => void;
  onOpenLc: () => void;
  xpEvents: Record<string, unknown>;
}) {
  // Lesson-less band modules (12 LeetCode SQL 50+, 13 Data & Finance SQL) —
  // progress lives in the lc:<slug> XP ledger, counted per module's own slugs.
  const band = BAND_BY_MODULE[module.id];
  const isLcBand = module.lessons.length === 0;
  const mTotal = band ? band.slugs.length : module.lessons.length;
  const mDone = band
    ? band.slugs.filter((s) => xpEvents[`lc:${s}`] !== undefined).length
    : module.lessons.filter((l) => xpEvents[`lesson:${l.id}`] !== undefined).length;
  const nextInModule = module.lessons.find((l) => xpEvents[`lesson:${l.id}`] === undefined);
  const complete = mDone === mTotal;
  const pct = Math.round((mDone / mTotal) * 100);

  return (
    <div className="sheen card-hover overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <button onClick={onToggle} aria-expanded={open} className="block w-full p-3.5 text-left">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(var(--color-emerald-400) ${pct}%, var(--color-zinc-800) ${pct}%)`,
            }}
          >
            <span
              className={cn(
                "flex h-[26px] w-[26px] items-center justify-center rounded-full bg-zinc-950 font-mono text-[10px] font-medium",
                complete ? "text-emerald-300" : "text-zinc-300",
              )}
            >
              {complete ? <Check className="h-3 w-3" /> : module.num}
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-zinc-100">{module.title}</span>
            <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Module {module.num} · {module.level}
            </span>
          </span>
          <span className="tnum shrink-0 font-mono text-[10px] text-zinc-500">
            {mDone}/{mTotal}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-zinc-600 transition-transform duration-200",
              open && "rotate-180 text-zinc-400",
            )}
          />
        </div>
        {!open && nextInModule && (
          <p className="mt-2.5 truncate text-[11px] text-zinc-500">
            Up next · lesson {nextInModule.num} — {nextInModule.title}
          </p>
        )}
      </button>

      <Collapse open={open}>
        <div className="border-t border-zinc-800/60 px-3 pb-3 pt-2">
          <p className="px-1 pb-2 text-[11px] leading-relaxed text-zinc-500">{module.blurb}</p>
          {isLcBand ? (
            <>
              <div className="flex flex-col gap-0.5">
                {(band?.sections ?? []).map((sec) => {
                  const sDone = sec.slugs.filter((s) => xpEvents[`lc:${s}`] !== undefined).length;
                  return (
                    <button
                      key={sec.id}
                      onClick={onOpenLc}
                      className="group/lesson flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-zinc-900"
                    >
                      <span className="tnum flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border border-zinc-700 font-mono text-[8px] text-zinc-500">
                        {sec.slugs.length}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs text-zinc-300">{sec.title}</span>
                      <span className="tnum shrink-0 font-mono text-[10px] text-zinc-600">
                        {sDone}/{sec.slugs.length}
                      </span>
                    </button>
                  );
                })}
              </div>
              <Btn variant="soft" className="mt-2 w-full" onClick={onOpenLc}>
                Open the band — {mDone}/{mTotal} solved →
              </Btn>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-0.5">
                {module.lessons.map((l) => {
                  const done = xpEvents[`lesson:${l.id}`] !== undefined;
                  return (
                    <button
                      key={l.id}
                      onClick={() => onOpenLesson(l.id)}
                      className="group/lesson flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-zinc-900"
                    >
                      <span
                        className={cn(
                          "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-[9px] font-medium",
                          done ? "bg-emerald-400 text-[var(--brand-ink)]" : "border border-zinc-700 text-zinc-500",
                        )}
                      >
                        {done ? <Check className="h-2.5 w-2.5" /> : l.num}
                      </span>
                      <span className={cn("min-w-0 flex-1 truncate text-xs", done ? "text-zinc-500" : "text-zinc-300")}>
                        {l.title}
                      </span>
                      <span className="tnum shrink-0 font-mono text-[10px] text-zinc-600">{l.minutes}m</span>
                      <ArrowRight className="h-3 w-3 shrink-0 text-zinc-700 opacity-0 transition-opacity group-hover/lesson:opacity-100" />
                    </button>
                  );
                })}
              </div>
              {nextInModule && (
                <Btn variant="soft" className="mt-2 w-full" onClick={() => onOpenLesson(nextInModule.id)}>
                  {mDone > 0 ? "Continue module" : "Start module"} — lesson {nextInModule.num} →
                </Btn>
              )}
            </>
          )}
        </div>
      </Collapse>
    </div>
  );
}

/** Mobile-only quick nav — the whole registry as one horizontal thumb-scroll. */
function ToolRail({ view, setView }: { view: View; setView: (v: View) => void }) {
  return (
    <nav aria-label="Quick tools" className="mb-4 flex gap-1.5 overflow-x-auto pb-1 thin-scrollbar lg:hidden">
      {TOOLS.map((t) => (
        <Btn
          key={t.kind}
          variant="pill"
          active={view.kind === t.kind}
          aria-current={view.kind === t.kind ? "page" : undefined}
          onClick={() => setView({ kind: t.kind } as View)}
        >
          <t.icon className="h-3 w-3 shrink-0" />
          {t.short}
        </Btn>
      ))}
    </nav>
  );
}

function titleAfter(index: number): string {
  const ladder = ["Query Apprentice", "Analyst I", "Analyst II", "Senior Analyst", "Query Wizard"];
  return ladder[Math.min(index, ladder.length - 1)];
}

/** Course overview — the default view: hero ("where was I"), the course map,
    activity strip, mastery grid and badges. Owns its own reveal state. */
function Overview({
  xp,
  level,
  streak,
  ctx,
  openLesson,
  onOpenLc,
}: {
  xp: number;
  level: ReturnType<typeof levelFor>;
  streak: number;
  ctx: ReturnType<typeof useBadgeWatcher>["ctx"];
  openLesson: (id: string) => void;
  onOpenLc: () => void;
}) {
  const xpEvents = useProgress((s) => s.xpEvents);
  const badgesMap = useProgress((s) => s.badges);
  const [openOverview, setOpenOverview] = useState<Set<number>>(() => new Set());

  const nextLesson =
    LESSONS.find((l) => xpEvents[`lesson:${l.id}`] === undefined) ?? LESSONS[LESSONS.length - 1];
  const doneCount = LESSONS.filter((l) => xpEvents[`lesson:${l.id}`] !== undefined).length;
  const totalProblems = LESSONS.reduce((a, l) => a + l.problems.length, 0);
  const totalMcqs = LESSONS.reduce((a, l) => a + l.mcqs.length, 0);
  const toggleOverviewModule = (num: number) =>
    setOpenOverview((s) => {
      const n = new Set(s);
      if (n.has(num)) n.delete(num);
      else n.add(num);
      return n;
    });

  return (
    <div className="max-w-4xl">
      {/* Hero — "where was I" + the one tap that matters, before any scrolling */}
      <Panel pad={5}>
        <p className="font-mono text-xs text-zinc-500">{MODULES.length} MODULES · BEGINNER → EXPERT</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <h1 className="flex items-center gap-3.5 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50">
            <Icon3D name="db" size={52} anim="float" />
            The SeeQL course
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Chip k="Rank" v={level.title} />
            <Chip k="Total XP" v={xp.toLocaleString()} />
            <Chip k="Streak" v={streak > 0 ? `${streak}d` : "—"} />
            <Chip k="Badges" v={`${Object.keys(badgesMap).length}/${BADGES.length}`} />
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-zinc-400">
          {MODULES.length} modules, one real storefront database. Read a concept, prove it in a quiz, then solve
          graded live queries — {totalMcqs} quiz questions and {totalProblems} graded queries in total.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <Btn variant="primary" data-tour="hero-cta" onClick={() => openLesson(nextLesson.id)}>
            {ctx.lessonsDone > 0 ? `Continue — lesson ${nextLesson.num} · ${nextLesson.title} →` : "Start learning →"}
          </Btn>
          <span className="tnum text-[11px] text-zinc-500">
            {ctx.problemsSolved} queries solved · {ctx.mcqsCorrect} quiz answers
          </span>
        </div>

        <div className="mt-4">
          <ProgressBar value={doneCount / LESSONS.length} />
          <p className="mt-1.5 text-[11px] text-zinc-500">
            {ctx.lessonsDone > 0
              ? `Welcome back — ${doneCount}/${LESSONS.length} lessons complete.`
              : "Start with lesson 1 — no setup, everything runs live."}
          </p>
        </div>
      </Panel>

      {/* Activity heatmap — the last 26 weeks at a glance */}
      <ActivityHeatmap />

      {/* Course map — all modules scannable in one screenful, lessons reveal on demand */}
      <section className="mt-7" data-tour="course-map">
        <div className="flex items-baseline justify-between">
          <h2 className="flex items-center gap-2.5 font-display text-sm font-semibold text-zinc-200">
            <Icon3D name="book" size={22} />
            Course map
          </h2>
          <span className="text-[11px] text-zinc-500">tap a module to reveal its lessons</span>
        </div>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <OverviewModuleCard
              key={m.id}
              module={m}
              open={openOverview.has(m.num)}
              onToggle={() => toggleOverviewModule(m.num)}
              onOpenLesson={openLesson}
              onOpenLc={onOpenLc}
              xpEvents={xpEvents}
            />
          ))}
        </div>
      </section>

      <div className="mt-7 grid gap-3 lg:grid-cols-2">
        <ActivityStrip />
        <MasteryGrid onOpenLesson={openLesson} />
      </div>

      <Panel rounded="lg" className="mt-6">
        <h3 className="flex items-center gap-2.5 font-display text-sm font-semibold text-zinc-100">
          <Icon3D name="trophy" size={24} />
          Badges
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {BADGES.map((b) => {
            const earned = badgesMap[b.id] !== undefined;
            return (
              <span
                key={b.id}
                title={b.desc}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[11px]",
                  earned ? "border-amber-400/50 bg-amber-400/10 text-amber-200" : "border-zinc-800 text-zinc-600",
                )}
              >
                {earned ? b.title : "· · ·"}
              </span>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

/** The active view's body — one switch, fed by the shared helpers and the
    gamification values (the overview needs them for its hero). */
function ViewBody({
  view,
  openLesson,
  openPerf,
  openExam,
  openDrills,
  openLc,
  exitExam,
  xp,
  level,
  streak,
  ctx,
}: {
  view: View;
  openLesson: (id: string) => void;
  openPerf: (sql: string) => void;
  openExam: (moduleId: string) => void;
  openDrills: () => void;
  openLc: (topic?: string, slug?: string) => void;
  exitExam: () => void;
  xp: number;
  level: ReturnType<typeof levelFor>;
  streak: number;
  ctx: ReturnType<typeof useBadgeWatcher>["ctx"];
}) {
  switch (view.kind) {
    case "lesson": {
      const lesson = LESSONS.find((l) => l.id === view.id) ?? null;
      return lesson ? <LessonView key={lesson.id} lesson={lesson} /> : null;
    }
    case "exam":
      return <ExamView key={view.moduleId} moduleId={view.moduleId} onExit={exitExam} />;
    case "gauntlet":
      return <GauntletView key={view.moduleId} moduleId={view.moduleId} onExit={exitExam} />;
    case "practice":
      return <KeywordPractice />;
    case "roadmap":
      return <RoadmapTrack onOpenLesson={openLesson} onOpenExam={openExam} onOpenDrills={openDrills} />;
    case "seeq":
      return <SeeqView />;
    case "daily":
      return <DailyPuzzle />;
    case "frames":
      return <FramePlayground />;
    case "explorer":
      return <DataExplorer />;
    case "library":
      return <DiagramLibrary onOpenLesson={openLesson} />;
    case "drills":
      return <DrillYard />;
    case "mixed":
      return <MixedQuiz />;
    case "blitz":
      return <BlitzMode />;
    case "cases":
      return <CaseFiles />;
    case "predict":
      return <PredictView />;
    case "clinic":
      return <ErrorClinic />;
    case "golf":
      return <QueryGolf onOpenPerf={openPerf} />;
    case "perf":
      return <PerfLab initialSql={view.sql} initialTab={view.tab} onOpenLesson={openLesson} />;
    case "interview":
      return <InterviewTrack />;
    case "studio":
      return <SchemaStudio />;
    case "explain":
      return <ExplainBack />;
    case "mastery":
      return <MasteryMap onOpenLesson={openLesson} />;
    case "sheet":
      return <CheatSheet />;
    case "mentor":
      return <MentorChat />;
    case "sandbox":
      return <CsvSandbox />;
    case "notebook":
      return <QueryNotebook />;
    case "lc":
      return <LeetCodeView key={`${view.topic ?? "lc"}:${view.slug ?? ""}`} initialTopic={view.topic} initialSlug={view.slug} />;
    case "recall":
      return <ReviewDeck />;
    case "companies":
      return <CompaniesView initialDomain={view.domain} initialCompany={view.company} openLc={(slug) => openLc(undefined, slug)} />;
    default:
      return <Overview xp={xp} level={level} streak={streak} ctx={ctx} openLesson={openLesson} onOpenLc={() => openLc("SQL")} />;
  }
}

export function LearnApp() {
  const [view, setView] = useState<View>({ kind: "overview" });
  // Set when a seeql:nav event arrives (deep links: companies/roadmap/lesson/
  // seeq, plus header nav). A user who arrived with an explicit destination
  // wants that destination — never the onboarding tour on top of it.
  const deepLinkedRef = useRef(false);

  // Every view change lands at the top of the new view. On narrow viewports
  // the sidebar renders BELOW the content, so a rail tap swaps the view
  // thousands of pixels above the thumb and reads as "nothing opened" —
  // scroll snaps the fresh view into place. (In-view navigation like the LC
  // list ⇄ dive drill-down is component state, not a view change, so list
  // scroll positions survive back-navigation.)
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);

  // Guided tour — auto-starts once for first-run visitors (the seen flag is
  // written on close, complete or skipped); the sidebar Tour chip replays it.
  // Deep-link arrivals are exempt: the tour's steps target the learn home, so
  // starting it over #learn?view=companies (strip CTA) or a lesson link dims
  // the requested page behind a modal whose spotlight has nothing to point
  // at — the page reads as dead. Child effects flush before this parent's
  // timeout, so a mount-time deep-link dispatch is already recorded here.
  const [tourStep, setTourStep] = useState<number | null>(null);
  useEffect(() => {
    if (tourSeen()) return;
    const t = setTimeout(() => {
      if (deepLinkedRef.current) return;
      setTourStep(0);
    }, 900);
    return () => clearTimeout(t);
  }, []);
  const closeTour = () => {
    markTourSeen();
    setTourStep(null);
  };

  // Progress backup / restore — all seeql.* stores as one JSON file.
  const fileRef = useRef<HTMLInputElement>(null);
  const [portMsg, setPortMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashPort = (text: string, ok: boolean) => {
    setPortMsg({ text, ok });
    if (msgTimer.current) clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setPortMsg(null), 5000);
  };
  useEffect(
    () => () => {
      if (msgTimer.current) clearTimeout(msgTimer.current);
    },
    [],
  );
  const onExport = () => {
    try {
      const backup = buildBackup();
      downloadBackup(backup);
      flashPort(`Backed up ${Object.keys(backup.entries).length} stores — check your downloads.`, true);
    } catch {
      flashPort("Export failed — storage unavailable.", false);
    }
  };
  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file after a fix
    if (!file) return;
    try {
      const { count, summary } = await importBackupFile(file);
      flashPort(`Restored ${count} stores · ${summary} — reloading…`, true);
      setTimeout(() => window.location.reload(), 900);
    } catch (err) {
      flashPort(err instanceof BackupError ? err.message : "Import failed.", false);
    }
  };

  // The top header's SeeQ button (page shell) navigates here by event — the
  // view state is private to this component. Listener callbacks are event
  // handlers, so the setState inside is compliant.
  useEffect(() => {
    const onNav = (e: Event) => {
      const detail = (e as CustomEvent<{ kind?: View["kind"]; id?: string }>).detail;
      if (!detail?.kind) return;
      deepLinkedRef.current = true;
      setView(detail.kind === "lesson" && detail.id ? { kind: "lesson", id: detail.id } : ({ kind: detail.kind } as View));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("seeql:nav", onNav);
    return () => window.removeEventListener("seeql:nav", onNav);
  }, []);
  const { xp, level, streak, ctx } = useBadgeWatcher();
  const xpEvents = useProgress((s) => s.xpEvents);
  const exams = useProgress((s) => s.exams);
  const resetAll = useProgress((s) => s.resetAll);
  const [confirmReset, setConfirmReset] = useState(false);

  // Collapsible modules — persisted; the sidebar defaults to the "continue"
  // module. (The overview course map keeps its own reveal state.)
  const nextLesson = LESSONS.find((l) => xpEvents[`lesson:${l.id}`] === undefined) ?? LESSONS[LESSONS.length - 1];
  const continueModuleNum = moduleOf(nextLesson.id)?.num ?? 1;
  const [openModules, setOpenModules] = useState<Set<number>>(() => {
    const saved = loadOpenModules();
    return new Set(saved ?? [continueModuleNum]);
  });

  useEffect(() => {
    try {
      localStorage.setItem(MODULES_OPEN_KEY, JSON.stringify([...openModules]));
    } catch {
      /* private mode — ignore */
    }
  }, [openModules]);

  const toggleModule = (num: number) =>
    setOpenModules((s) => {
      const n = new Set(s);
      if (n.has(num)) n.delete(num);
      else n.add(num);
      return n;
    });

  const openLesson = (id: string) => {
    const mod = moduleOf(id);
    if (mod) {
      // Auto-reveal the module that owns the lesson being opened.
      setOpenModules((s) => (s.has(mod.num) ? s : new Set(s).add(mod.num)));
    }
    setView({ kind: "lesson", id });
  };

  const openPerf = (sql: string) => setView({ kind: "perf", sql, tab: "workbench" });
  const openExam = (moduleId: string) => setView({ kind: "exam", moduleId });
  const openDrills = () => setView({ kind: "drills" });
  const openLc = (topic?: string, slug?: string) => setView({ kind: "lc", topic, slug });
  const exitExam = () => setView({ kind: "overview" });
  const doneCount = LESSONS.filter((l) => xpEvents[`lesson:${l.id}`] !== undefined).length;
  const totalProblems = LESSONS.reduce((a, l) => a + l.problems.length, 0);
  const totalMcqs = LESSONS.reduce((a, l) => a + l.mcqs.length, 0);
  const allOpen = openModules.size === MODULES.length;
  const reduced = useReducedMotion() ?? false;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row">
      <CelebrationHost />
      <OnboardingTour step={tourStep} setStep={setTourStep} onClose={closeTour} />
      {/* keyboard users can jump straight past the 300px rail */}
      <a
        href="#learn-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-md focus:border focus:border-zinc-600 focus:bg-zinc-950 focus:px-3 focus:py-2 focus:text-xs focus:text-zinc-100"
      >
        Skip to content
      </a>
      {/* SeeqBuddy now mounts at the app root (page.tsx) so the buddy is on
          every view — landing, playground, learn — and survives switches. */}

      {/* sidebar — below the content on mobile, sticky rail on desktop */}
      {/* Definite height (not max-height): max-h-full on the inner panel is a
          percentage, which only resolves against a definite parent height —
          with max-height alone the panel overflows and buries the Toolbox. */}
      {/* ONE scroll region (rank + curriculum + Toolbox + Practice lab) with
          only the header and Reset pinned. Pinning the tool groups used to
          starve the curriculum: on a 1440x900 laptop the 21 pinned rows alone
          exceed the panel height, flex squeezed the lesson list to zero and
          the Lab clipped mid-row. */}
      <aside className="order-2 w-full shrink-0 lg:order-1 lg:sticky lg:top-[76px] lg:h-[calc(100vh-96px)] lg:w-[300px] lg:self-start">
        <Panel pad={0} className="flex max-h-full flex-col overflow-hidden">
          <div className="shrink-0 border-b border-zinc-800 p-4" data-tour="curriculum">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon3D name="cap" size={22} />
                <h2 className="font-display text-sm font-semibold text-zinc-100">SeeQL Curriculum</h2>
              </div>
              <div className="flex items-center gap-0.5">
                <Btn
                  variant="ghost"
                  onClick={() => setOpenModules(new Set(MODULES.map((m) => m.num)))}
                  disabled={allOpen}
                  title="Expand all modules"
                  aria-label="Expand all modules"
                >
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                </Btn>
                <Btn
                  variant="ghost"
                  onClick={() => setOpenModules(new Set())}
                  disabled={!allOpen}
                  title="Collapse all modules"
                  aria-label="Collapse all modules"
                >
                  <ChevronsDownUp className="h-3.5 w-3.5" />
                </Btn>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              {MODULES.length} modules · {LESSONS.length} lessons · {totalProblems} graded queries · {totalMcqs} quiz questions
            </p>
            <ProgressBar value={doneCount / LESSONS.length} className="mt-3" />
            <p className="mt-1.5 text-[11px] text-zinc-500">{doneCount}/{LESSONS.length} lessons complete</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto thin-scrollbar">
            <div className="shrink-0 p-3">
              <RankBlock xp={xp} level={level} streak={streak} />
            </div>
            {MODULES.map((m) => {
              // Lesson-less band modules (12 + 13) read progress from the
              // lc:<slug> XP ledger, counted per module's own slugs.
              const band = BAND_BY_MODULE[m.id];
              const isLcBand = m.lessons.length === 0;
              const mTotal = band ? band.slugs.length : m.lessons.length;
              const mDone = band
                ? band.slugs.filter((s) => xpEvents[`lc:${s}`] !== undefined).length
                : m.lessons.filter((l) => xpEvents[`lesson:${l.id}`] !== undefined).length;
              const open = openModules.has(m.num);
              const isContinue = m.num === continueModuleNum;
              const containsActive = view.kind === "lesson" && moduleOf(view.id)?.num === m.num;
              return (
                <nav key={m.id} className="border-b border-zinc-800/60 px-3 pb-1.5 pt-2 last:border-b-0">
                  {/* module header — click to expand/collapse */}
                  <button
                    onClick={() => toggleModule(m.num)}
                    aria-expanded={open}
                    className="group flex w-full items-center gap-2.5 rounded-md px-1.5 py-2 text-left transition-colors hover:bg-zinc-900"
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-[10px] font-medium transition-colors",
                        mDone === mTotal
                          ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                          : containsActive
                            ? "border-emerald-400/40 text-emerald-300"
                            : isContinue
                              ? "border-emerald-400/30 text-emerald-300/90"
                              : "border-zinc-800 text-zinc-500",
                      )}
                    >
                      {mDone === mTotal ? <Check className="h-3 w-3" /> : m.num}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-xs font-medium",
                          containsActive || mDone === mTotal ? "text-zinc-100" : "text-zinc-300 group-hover:text-zinc-100",
                        )}
                      >
                        {m.title}
                      </span>
                      <span className="mt-1.5 block h-0.5 overflow-hidden rounded-full bg-zinc-800">
                        <span
                          className="block h-full rounded-full bg-emerald-400/80 transition-[width] duration-500 ease-out"
                          style={{ width: `${(mDone / mTotal) * 100}%` }}
                        />
                      </span>
                    </span>
                    <span className="tnum shrink-0 font-mono text-[10px] text-zinc-600">
                      {mDone}/{mTotal}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 text-zinc-600 transition-transform duration-200",
                        open && "rotate-180 text-zinc-400",
                      )}
                    />
                  </button>

                  {/* lessons — revealed on expand, connected by a tree rail.
                      The lesson-less LC band shows its seven SQL sections + an
                      open CTA instead of lessons/exam rows. */}
                  <Collapse open={open}>
                    {isLcBand ? (
                      <div className="ml-[16px] mt-0.5 flex flex-col gap-0.5 border-l border-zinc-800/70 pl-2 pb-2">
                        {(band?.sections ?? []).map((sec) => {
                          const sDone = sec.slugs.filter((s) => xpEvents[`lc:${s}`] !== undefined).length;
                          return (
                            <button
                              key={sec.id}
                              onClick={() => setView({ kind: "lc", topic: "SQL" })}
                              className={cn(
                                "relative flex items-start gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors",
                                view.kind === "lc" ? "bg-emerald-400/[0.09]" : "hover:bg-zinc-900",
                              )}
                            >
                              <span className="tnum mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-700 font-mono text-[9px] text-zinc-500">
                                {sec.slugs.length}
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-xs font-medium text-zinc-300">{sec.title}</span>
                                <span className="block text-[10px] text-zinc-600">{sec.blurb.split(" — ")[0]}</span>
                              </span>
                              <span className="tnum ml-auto shrink-0 font-mono text-[10px] text-zinc-600">
                                {sDone}/{sec.slugs.length}
                              </span>
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setView({ kind: "lc", topic: "SQL" })}
                          className={cn(
                            "relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors",
                            view.kind === "lc" ? "bg-emerald-400/[0.09]" : "hover:bg-zinc-900",
                          )}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-[var(--brand-ink)]">
                            <ArrowRight className="h-2.5 w-2.5" />
                          </span>
                          <span className="block truncate text-xs font-medium text-emerald-300">
                            Open the band — {mDone}/{mTotal} solved
                          </span>
                        </button>
                      </div>
                    ) : (
                      <div className="ml-[16px] mt-0.5 flex flex-col gap-0.5 border-l border-zinc-800/70 pl-2 pb-2">
                      {m.lessons.map((l) => {
                        const done = xpEvents[`lesson:${l.id}`] !== undefined;
                        const active = view.kind === "lesson" && view.id === l.id;
                        return (
                          <button
                            key={l.id}
                            onClick={() => openLesson(l.id)}
                            className={cn(
                              "relative flex items-start gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors",
                              active ? "bg-emerald-400/[0.09]" : "hover:bg-zinc-900",
                            )}
                          >
                            {active && <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-emerald-400" />}
                            <span
                              className={cn(
                                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium transition-colors",
                                done
                                  ? "bg-emerald-400 text-[var(--brand-ink)]"
                                  : active
                                    ? "border border-emerald-400/60 text-emerald-200"
                                    : "border border-zinc-700 text-zinc-500",
                              )}
                            >
                              {done ? <Check className="h-2.5 w-2.5" /> : l.num}
                            </span>
                            <span className="min-w-0">
                              <span className={cn("block truncate text-xs font-medium", active ? "text-zinc-50" : done ? "text-zinc-500" : "text-zinc-300")}>
                                {l.title}
                              </span>
                              <span className="block text-[10px] text-zinc-600">{l.minutes} min · {l.problems.length} queries</span>
                            </span>
                          </button>
                        );
                      })}
                      {/* module exam — the module's own timed gate; the fill
                          rebuilds live here, so this row is the fill bank's
                          front door */}
                      <button
                        onClick={() => setView({ kind: "exam", moduleId: m.id })}
                        className={cn(
                          "relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors",
                          view.kind === "exam" && view.moduleId === m.id ? "bg-emerald-400/[0.09]" : "hover:bg-zinc-900",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors",
                            exams[m.id]?.passedAt ? "bg-emerald-400 text-[var(--brand-ink)]" : "border border-zinc-700 text-zinc-500",
                          )}
                        >
                          {exams[m.id]?.passedAt ? <Check className="h-2.5 w-2.5" /> : <GraduationCap className="h-2.5 w-2.5" />}
                        </span>
                        <span className="min-w-0">
                          <span className={cn("block truncate text-xs font-medium", exams[m.id]?.passedAt ? "text-zinc-500" : "text-zinc-300")}>
                            Module exam
                          </span>
                          <span className="block text-[10px] text-zinc-600">
                            {exams[m.id]
                              ? `best ${exams[m.id].best}/${exams[m.id].total} · ${exams[m.id].attempts} attempt${exams[m.id].attempts === 1 ? "" : "s"}`
                              : "12 questions · pass at 9"}
                          </span>
                        </span>
                      </button>
                      {gauntletFor(m.num) && (
                        <button
                          onClick={() => setView({ kind: "gauntlet", moduleId: m.id })}
                          className={cn(
                            "relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors",
                            view.kind === "gauntlet" && view.moduleId === m.id ? "bg-indigo-400/[0.12]" : "hover:bg-zinc-900",
                          )}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-indigo-700 text-indigo-400">
                            <Swords className="h-2.5 w-2.5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-medium text-zinc-300">Module gauntlet</span>
                            <span className="block text-[10px] text-zinc-600">50 quiz · 90 cases · 90 problems</span>
                          </span>
                        </button>
                      )}
                      </div>
                    )}
                  </Collapse>
                </nav>
              );
            })}
            {/* Toolbox + Practice lab live INSIDE the scroll region so the
                curriculum can never be crowded out — see the sidebar comment. */}
            <div className="border-t border-zinc-800/60 p-3">
              <SectionLabel className="mb-1.5">Toolbox</SectionLabel>
              <div className="flex flex-col gap-0.5" data-tour="toolbox">
                {CORE_AND_TOOLBOX.map((t, i) => (
                  <ToolRow
                    key={t.kind}
                    index={i + 1}
                    label={t.label}
                    note={t.note}
                    active={view.kind === t.kind}
                    onClick={() => setView({ kind: t.kind } as View)}
                  />
                ))}
              </div>
              <SectionLabel className="mb-1 mt-2">Practice lab</SectionLabel>
              <div className="flex flex-col gap-0.5" data-tour="lab">
                {LAB_TOOLS.map((t, i) => (
                  <ToolRow
                    key={t.kind}
                    index={i + 1}
                    label={t.label}
                    note={t.note}
                    active={view.kind === t.kind}
                    onClick={() => setView({ kind: t.kind } as View)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-zinc-800 p-3">
            {confirmReset ? (
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="text-zinc-400">Erase all progress?</span>
                <span className="flex gap-1.5">
                  <Btn variant="outline" danger onClick={() => { resetAll(); setConfirmReset(false); }}>Erase</Btn>
                  <Btn variant="outline" onClick={() => setConfirmReset(false)}>Keep</Btn>
                </span>
              </div>
            ) : (
              <>
                {/* the quiet utilities: tour, backup, restore, reset */}
                <div className="flex items-center justify-between gap-0.5">
                  <TourReplayButton
                    onClick={() => setTourStep(0)}
                  />
                  <Btn
                    variant="ghost"
                    onClick={onExport}
                    title="Download all your progress as a JSON backup"
                    aria-label="Export progress backup"
                    className="gap-1 p-0 text-[11px] text-zinc-600 hover:bg-transparent hover:text-zinc-400"
                  >
                    <Download className="h-3 w-3" /> Export
                  </Btn>
                  <Btn
                    variant="ghost"
                    onClick={() => fileRef.current?.click()}
                    title="Restore progress from a SeeQL backup file"
                    aria-label="Import progress backup"
                    className="gap-1 p-0 text-[11px] text-zinc-600 hover:bg-transparent hover:text-zinc-400"
                  >
                    <Upload className="h-3 w-3" /> Import
                  </Btn>
                  <Btn
                    variant="ghost"
                    onClick={() => setConfirmReset(true)}
                    className="gap-1 p-0 text-[11px] text-zinc-600 hover:bg-transparent hover:text-zinc-400"
                  >
                    <RotateCcw className="h-3 w-3" /> Reset
                  </Btn>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  aria-hidden="true"
                  tabIndex={-1}
                  onChange={onImportFile}
                />
                {portMsg && (
                  <p
                    role="status"
                    className={cn("mt-1.5 text-[10px] leading-snug", portMsg.ok ? "text-emerald-300" : "text-rose-300")}
                  >
                    {portMsg.text}
                  </p>
                )}
              </>
            )}
          </div>
        </Panel>
      </aside>

      {/* content — first on mobile so the course starts at the top of the page.
          Each switch gets the same 0.2s fade-and-rise entrance (reduced-motion
          aware), so moving between tools feels intentional, not like a page
          hard-swapping underneath you. */}
      <main id="learn-main" className="order-1 min-w-0 flex-1 pb-16 lg:order-2">
        <ToolRail view={view} setView={setView} />
        <motion.div
          key={
            view.kind === "lesson"
              ? `lesson:${view.id}`
              : view.kind === "exam"
                ? `exam:${view.moduleId}`
                : view.kind
          }
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <ViewBody view={view} openLesson={openLesson} openPerf={openPerf} openExam={openExam} openDrills={openDrills} openLc={openLc} exitExam={exitExam} xp={xp} level={level} streak={streak} ctx={ctx} />
        </motion.div>
      </main>
    </div>
  );
}
