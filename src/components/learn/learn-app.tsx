"use client";

// Learn shell — sidebar (module, rank, streak, lessons) + lesson content.
// A watcher effect converts progress into badges and level-up celebrations.

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Dumbbell,
  FileStack,
  FlaskConical,
  Flame,
  GraduationCap,
  LayoutDashboard,
  RotateCcw,
  Table2,
} from "lucide-react";
import { LESSONS, MODULES } from "@/lib/curriculum/lessons";
import { useProgress } from "@/lib/curriculum/progress";
import { BADGES, currentStreak, levelFor, totalXp } from "@/lib/curriculum/gamification";
import { cn } from "@/lib/utils";
import { LessonView } from "./lesson-view";
import { DataExplorer } from "./data-explorer";
import { MixedQuiz } from "./mixed-quiz";
import { CaseFiles } from "./case-files";
import { DrillYard } from "./drill-yard";
import { ActivityStrip, MasteryGrid } from "./progress-cards";
import { CelebrationHost, celebrate } from "./celebrate";

type View =
  | { kind: "overview" }
  | { kind: "lesson"; id: string }
  | { kind: "explorer" }
  | { kind: "mixed" }
  | { kind: "cases" }
  | { kind: "drills" };

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
    return { lessonsDone, problemsSolved, mcqsCorrect, perfectQuizzes };
  }, [xpEvents, mcqAttempts]);

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

function RankBlock({ xp, level, streak }: { xp: number; level: ReturnType<typeof levelFor>; streak: number }) {
  return (
    <div className="sheen rounded-lg border border-zinc-800 bg-zinc-900/50 p-3.5">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-semibold text-zinc-100">{level.title}</span>
        <span className="tnum font-mono text-xs text-emerald-300">{xp.toLocaleString()} XP</span>
      </div>
      <div className="bar-shimmer mt-2.5 h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-emerald-400 transition-[width] duration-700 ease-out"
          style={{ width: `${Math.round(level.pct * 100)}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-zinc-500">
        {level.next === null ? "Top rank reached — Query Wizard" : `${(level.next - xp).toLocaleString()} XP to ${titleAfter(level.index)}`}
      </p>
      <div className="mt-2.5 flex items-center gap-1.5 border-t border-zinc-800 pt-2.5 text-[11px] text-zinc-400">
        <Flame className={cn("h-3.5 w-3.5", streak > 0 ? "flame-live text-amber-400" : "text-zinc-600")} />
        {streak > 0 ? `${streak}-day streak — keep it alive` : "Hit your daily goal to start a streak"}
      </div>
    </div>
  );
}

/** Overview card: module summary + expandable lesson list. */
function OverviewModuleCard({
  module,
  open,
  onToggle,
  onOpenLesson,
  xpEvents,
}: {
  module: (typeof MODULES)[number];
  open: boolean;
  onToggle: () => void;
  onOpenLesson: (id: string) => void;
  xpEvents: Record<string, unknown>;
}) {
  const mDone = module.lessons.filter((l) => xpEvents[`lesson:${l.id}`] !== undefined).length;
  const nextInModule = module.lessons.find((l) => xpEvents[`lesson:${l.id}`] === undefined);
  const complete = mDone === module.lessons.length;

  return (
    <div className="sheen card-hover overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <button onClick={onToggle} aria-expanded={open} className="block w-full p-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Module {module.num} · {module.level}
            </p>
            <h3 className="font-display mt-1.5 text-sm font-semibold text-zinc-100">{module.title}</h3>
          </div>
          <ChevronDown
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0 text-zinc-600 transition-transform duration-200",
              open && "rotate-180 text-zinc-400",
            )}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">{module.blurb}</p>
        <div className="mt-3 flex items-center gap-2.5">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-400 transition-[width] duration-700 ease-out"
              style={{ width: `${(mDone / module.lessons.length) * 100}%` }}
            />
          </div>
          <span className="tnum shrink-0 font-mono text-[10px] text-zinc-500">
            {mDone}/{module.lessons.length}
          </span>
        </div>
        <p className="mt-1.5 text-[11px] text-zinc-500">
          {complete ? "Module complete" : nextInModule ? `Up next · lesson ${nextInModule.num} — ${nextInModule.title}` : ""}
          {" · "}
          {module.lessons.reduce((a, l) => a + l.problems.length, 0)} graded queries
        </p>
      </button>

      <Collapse open={open}>
        <div className="border-t border-zinc-800/60 px-3 pb-3 pt-2">
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
                      done ? "bg-emerald-400 text-[#052e1c]" : "border border-zinc-700 text-zinc-500",
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
            <button
              onClick={() => onOpenLesson(nextInModule.id)}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-emerald-400/30 bg-emerald-400/[0.06] px-3 py-1.5 text-[11px] font-medium text-emerald-300 transition-colors hover:bg-emerald-400/[0.12]"
            >
              {mDone > 0 ? "Continue module" : "Start module"} — lesson {nextInModule.num} →
            </button>
          )}
        </div>
      </Collapse>
    </div>
  );
}

function titleAfter(index: number): string {
  const ladder = ["Query Apprentice", "Analyst I", "Analyst II", "Senior Analyst", "Query Wizard"];
  return ladder[Math.min(index, ladder.length - 1)];
}

export function LearnApp() {
  const [view, setView] = useState<View>({ kind: "overview" });
  const { xp, level, streak, ctx } = useBadgeWatcher();
  const xpEvents = useProgress((s) => s.xpEvents);
  const badgesMap = useProgress((s) => s.badges);
  const resetAll = useProgress((s) => s.resetAll);
  const [confirmReset, setConfirmReset] = useState(false);

  // Collapsible modules — persisted; defaults to the "continue" module.
  const nextLesson = LESSONS.find((l) => xpEvents[`lesson:${l.id}`] === undefined) ?? LESSONS[LESSONS.length - 1];
  const continueModuleNum = moduleOf(nextLesson.id)?.num ?? 1;
  const [openModules, setOpenModules] = useState<Set<number>>(() => {
    const saved = loadOpenModules();
    return new Set(saved ?? [continueModuleNum]);
  });
  const [openOverview, setOpenOverview] = useState<Set<number>>(() => new Set([continueModuleNum]));

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
  const toggleOverviewModule = (num: number) =>
    setOpenOverview((s) => {
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

  const lesson = view.kind === "lesson" ? LESSONS.find((l) => l.id === view.id) ?? null : null;
  const doneCount = LESSONS.filter((l) => xpEvents[`lesson:${l.id}`] !== undefined).length;
  const totalProblems = LESSONS.reduce((a, l) => a + l.problems.length, 0);
  const totalMcqs = LESSONS.reduce((a, l) => a + l.mcqs.length, 0);
  const allOpen = openModules.size === MODULES.length;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row">
      <CelebrationHost />

      {/* sidebar */}
      {/* Definite height (not max-height): max-h-full on the inner panel is a
          percentage, which only resolves against a definite parent height —
          with max-height alone the panel overflows and buries the Toolbox. */}
      <aside className="w-full shrink-0 lg:sticky lg:top-[76px] lg:h-[calc(100vh-96px)] lg:w-[300px] lg:self-start">
        <div className="sheen flex max-h-full flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
          <div className="shrink-0 border-b border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-emerald-400" />
                <h2 className="font-display text-sm font-semibold text-zinc-100">SeeQL Curriculum</h2>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setOpenModules(new Set(MODULES.map((m) => m.num)))}
                  disabled={allOpen}
                  title="Expand all modules"
                  className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setOpenModules(new Set())}
                  disabled={!allOpen}
                  title="Collapse all modules"
                  className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronsDownUp className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              {MODULES.length} modules · {LESSONS.length} lessons · {totalProblems} graded queries · {totalMcqs} quiz questions
            </p>
            <div className="bar-shimmer mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-400 transition-[width] duration-700 ease-out"
                style={{ width: `${(doneCount / LESSONS.length) * 100}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-zinc-500">{doneCount}/{LESSONS.length} lessons complete</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto thin-scrollbar">
            <div className="shrink-0 p-3">
              <RankBlock xp={xp} level={level} streak={streak} />
            </div>
            {MODULES.map((m) => {
              const mDone = m.lessons.filter((l) => xpEvents[`lesson:${l.id}`] !== undefined).length;
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
                        mDone === m.lessons.length
                          ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                          : containsActive
                            ? "border-emerald-400/40 text-emerald-300"
                            : isContinue
                              ? "border-emerald-400/30 text-emerald-300/90"
                              : "border-zinc-800 text-zinc-500",
                      )}
                    >
                      {mDone === m.lessons.length ? <Check className="h-3 w-3" /> : m.num}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-xs font-medium",
                          containsActive || mDone === m.lessons.length ? "text-zinc-100" : "text-zinc-300 group-hover:text-zinc-100",
                        )}
                      >
                        {m.title}
                      </span>
                      <span className="mt-1.5 block h-0.5 overflow-hidden rounded-full bg-zinc-800">
                        <span
                          className="block h-full rounded-full bg-emerald-400/80 transition-[width] duration-500 ease-out"
                          style={{ width: `${(mDone / m.lessons.length) * 100}%` }}
                        />
                      </span>
                    </span>
                    <span className="tnum shrink-0 font-mono text-[10px] text-zinc-600">
                      {mDone}/{m.lessons.length}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 text-zinc-600 transition-transform duration-200",
                        open && "rotate-180 text-zinc-400",
                      )}
                    />
                  </button>

                  {/* lessons — revealed on expand, connected by a tree rail */}
                  <Collapse open={open}>
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
                                  ? "bg-emerald-400 text-[#052e1c]"
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
                    </div>
                  </Collapse>
                </nav>
              );
            })}
          </div>

          <div className="shrink-0 border-t border-zinc-800/60 p-3">
            <p className="mb-1.5 px-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Toolbox</p>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => setView({ kind: "overview" })}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                  view.kind === "overview" ? "bg-zinc-800" : "hover:bg-zinc-900",
                )}
              >
                <LayoutDashboard className={cn("h-4 w-4 shrink-0", view.kind === "overview" ? "text-emerald-300" : "text-zinc-500")} />
                <span className="min-w-0">
                  <span className={cn("block truncate text-xs font-medium", view.kind === "overview" ? "text-zinc-100" : "text-zinc-300")}>
                    Course overview
                  </span>
                  <span className="block text-[10px] text-zinc-600">progress &amp; badges</span>
                </span>
              </button>
              {[
                { kind: "explorer" as const, icon: Table2, label: "Data explorer", note: "browse the live tables" },
                { kind: "drills" as const, icon: Dumbbell, label: "Keyword drills", note: "every keyword, six angles" },
                { kind: "mixed" as const, icon: FlaskConical, label: "Mixed quiz", note: "10 from the whole course" },
                { kind: "cases" as const, icon: FileStack, label: "Case files", note: "rebuild real stakeholder queries" },
              ].map((t) => (
                <button
                  key={t.kind}
                  onClick={() => setView({ kind: t.kind })}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                    view.kind === t.kind ? "bg-zinc-800" : "hover:bg-zinc-900",
                  )}
                >
                  <t.icon className={cn("h-4 w-4 shrink-0", view.kind === t.kind ? "text-emerald-300" : "text-zinc-500")} />
                  <span className="min-w-0">
                    <span className={cn("block truncate text-xs font-medium", view.kind === t.kind ? "text-zinc-100" : "text-zinc-300")}>
                      {t.label}
                    </span>
                    <span className="block text-[10px] text-zinc-600">{t.note}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="shrink-0 border-t border-zinc-800 p-3">
            {confirmReset ? (
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="text-zinc-400">Erase all progress?</span>
                <span className="flex gap-1.5">
                  <button onClick={() => { resetAll(); setConfirmReset(false); }} className="rounded border border-rose-400/50 px-2 py-1 text-rose-300 hover:bg-rose-400/10">Erase</button>
                  <button onClick={() => setConfirmReset(false)} className="rounded border border-zinc-700 px-2 py-1 text-zinc-400 hover:bg-zinc-900">Keep</button>
                </span>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="flex items-center gap-1.5 text-[11px] text-zinc-600 transition-colors hover:text-zinc-400"
              >
                <RotateCcw className="h-3 w-3" /> Reset progress
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* content */}
      <main className="min-w-0 flex-1 pb-16">
        {lesson ? (
          <LessonView key={lesson.id} lesson={lesson} />
        ) : view.kind === "explorer" ? (
          <DataExplorer />
        ) : view.kind === "drills" ? (
          <DrillYard />
        ) : view.kind === "mixed" ? (
          <MixedQuiz />
        ) : view.kind === "cases" ? (
          <CaseFiles />
        ) : (
          <div className="bg-ambient max-w-3xl">
            <p className="font-mono text-xs text-zinc-500">{MODULES.length} MODULES · BEGINNER → EXPERT</p>
            <h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">The SeeQL course</h1>
            <p className="mt-3 text-[15px] leading-7 text-zinc-400">
              Eight modules, one real storefront database. Read a concept, prove it in a quiz, then solve
              graded live queries — {totalMcqs} quiz questions and {totalProblems} graded queries in total.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MODULES.map((m) => (
                <OverviewModuleCard
                  key={m.id}
                  module={m}
                  open={openOverview.has(m.num)}
                  onToggle={() => toggleOverviewModule(m.num)}
                  onOpenLesson={openLesson}
                  xpEvents={xpEvents}
                />
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Rank", level.title],
                ["Total XP", xp.toLocaleString()],
                ["Streak", streak > 0 ? `${streak} days` : "—"],
                ["Badges", `${Object.keys(badgesMap).length}/${BADGES.length}`],
              ].map(([k, v]) => (
                <div key={k} className="sheen rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-3">
                  <p className="text-[11px] uppercase tracking-wider text-zinc-500">{k}</p>
                  <p className="tnum mt-1 truncate text-sm font-medium text-zinc-100">{v}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-2">
              <ActivityStrip />
              <MasteryGrid onOpenLesson={openLesson} />
            </div>

            <div className="sheen mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <h3 className="font-display text-sm font-semibold text-zinc-100">Badges</h3>
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
            </div>

            <div className="sheen mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-zinc-100">
                  {ctx.lessonsDone > 0 ? "Welcome back." : "Start with lesson 1 — no setup, everything runs live."}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {ctx.problemsSolved} queries solved · {ctx.mcqsCorrect} quiz questions answered
                </p>
              </div>
              <button
                onClick={() => openLesson(nextLesson.id)}
                className="btn-glow rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[#052e1c] transition-colors hover:bg-emerald-300"
              >
                {ctx.lessonsDone > 0 ? `Continue — lesson ${nextLesson.num} →` : "Start learning →"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
