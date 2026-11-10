"use client";

// Roadmap & Personal Timetable — combines the winding day-by-day sprint path
// (hard-gated across all 78 lessons, 14 exams, and the drill yard) with a
// pace-customizable weekly timetable, per-topic time breakdown (Theory / Quiz
// / SQL Lab), and a persistent daily focus timer in localStorage.

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  CalendarClock,
  Check,
  Clock,
  Dumbbell,
  GraduationCap,
  Lock,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  Route,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/curriculum/progress";
import { EXAM_FILLS, EXAM_MCQS, EXAM_PASS } from "@/lib/curriculum/exams";
import { DRILL_SETS } from "@/lib/curriculum/drills";
import {
  DRILL_TOTAL,
  ROADMAP,
  buildTimetable,
  currentDayIndex,
  dayMinutes,
  daySummary,
  lessonById,
  lessonSubProgress,
  moduleById,
  moduleTimeBudgets,
  sprintCleared,
  sprintStats,
  topicTimeSplit,
  type ModuleTimeBudget,
  type ProgSlice,
  type RoadmapDay,
  type RoadmapItem,
  type TimetableSession,
} from "@/lib/curriculum/roadmap";
import { Btn, Panel, SectionLabel } from "./ui/kit";
import { Icon3D } from "./ui/icon3d";

const TIMETABLE_LS_KEY = "seeql.timetable.v1";
const PACE_OPTIONS = [30, 60, 90, 120] as const;

interface TimetablePrefs {
  paceMin: number;
  startDateIso: string;
  tab: "timetable" | "sprint";
  /** Minutes logged per YYYY-MM-DD calendar date */
  loggedMinutesByDate: Record<string, number>;
}

function todayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function defaultPrefs(): TimetablePrefs {
  return {
    paceMin: 60,
    startDateIso: todayIso(),
    tab: "timetable",
    loggedMinutesByDate: {},
  };
}

/** Format YYYY-MM-DD into a compact UTC-safe human label (e.g. "Tue, Nov 10"). */
function formatShortDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatDuration(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const rem = min % 60;
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
}

/** Deterministic thousands separator — hydration-safe on both servers. */
function fmt(n: number): string {
  const s = String(Math.abs(n));
  const out = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return n < 0 ? `-${out}` : out;
}

function StatCell({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-2.5 text-center">
      <div className="tnum font-mono text-base font-semibold text-emerald-300">{fmt(n)}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
    </div>
  );
}

/** One sentence of live volume for the header paragraph. */
function sprintLine(): string {
  const s = sprintStats();
  return `${s.exams} module exams · ${s.fills} fill drills woven in · about ${fmt(Math.round(s.minutes / 60))} hours end to end`;
}

/** "ON THIS DAY" volume line for a day card. */
function onThisDay(day: RoadmapDay): string {
  const s = daySummary(day);
  const parts: string[] = [];
  if (s.lessons > 0) parts.push(`${s.lessons} lesson${s.lessons === 1 ? "" : "s"}`);
  if (s.mcqs > 0) parts.push(`${fmt(s.mcqs)} quiz`);
  if (s.queries > 0) parts.push(`${fmt(s.queries)} queries`);
  if (s.cases > 0) parts.push(`${fmt(s.cases)} cases`);
  if (s.exams > 0) parts.push(`${s.exams} exam${s.exams === 1 ? "" : "s"}`);
  if (s.drills) parts.push(`the full drill bank (${fmt(DRILL_TOTAL)})`);
  return parts.join(" · ");
}

function drillMastered(prog: ProgSlice): number {
  let n = 0;
  for (const s of DRILL_SETS) {
    for (const q of s.questions) {
      if (prog.mcqAttempts[q.id]?.correct === true) n++;
    }
  }
  return n;
}

type DayState = "done" | "current" | "locked";

function ItemRow({
  item,
  state,
  prog,
  onOpenLesson,
  onOpenExam,
  onOpenDrills,
}: {
  item: RoadmapItem;
  state: DayState;
  prog: ProgSlice;
  onOpenLesson: (id: string) => void;
  onOpenExam: (moduleId: string) => void;
  onOpenDrills: () => void;
}) {
  if (item.kind === "exam") {
    const mod = moduleById(item.moduleId);
    const rec = prog.exams[item.moduleId];
    const passed = rec?.passedAt !== undefined;
    const done = state === "done" || passed;
    return (
      <div className="flex items-center gap-2.5 rounded-md border border-zinc-800/70 bg-zinc-900/40 px-2.5 py-2">
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
            done ? "bg-emerald-400 text-[var(--brand-ink)]" : "border border-zinc-700 text-zinc-500",
          )}
        >
          {done ? <Check className="h-2.5 w-2.5" /> : <GraduationCap className="h-3 w-3" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium text-zinc-200">
            Module {mod?.num} exam — {mod?.title}
          </span>
          <span className="block text-[10px] text-zinc-500">
            {rec
              ? `best ${rec.best}/${rec.total} · ${rec.attempts} attempt${rec.attempts === 1 ? "" : "s"}`
              : `${EXAM_MCQS + EXAM_FILLS} questions · pass at ${EXAM_PASS} · 12 min`}
          </span>
        </span>
        {state !== "locked" && (
          <Btn variant="soft" className="shrink-0 px-2.5 py-1 text-[11px]" onClick={() => onOpenExam(item.moduleId)}>
            {passed ? "Retake" : "Sit exam"}
          </Btn>
        )}
      </div>
    );
  }

  if (item.kind === "drills") {
    const mastered = drillMastered(prog);
    const done = state === "done" || (DRILL_TOTAL > 0 && mastered === DRILL_TOTAL);
    return (
      <div className="flex items-center gap-2.5 rounded-md border border-zinc-800/70 bg-zinc-900/40 px-2.5 py-2">
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
            done ? "bg-emerald-400 text-[var(--brand-ink)]" : "border border-zinc-700 text-zinc-500",
          )}
        >
          {done ? <Check className="h-2.5 w-2.5" /> : <Dumbbell className="h-3 w-3" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium text-zinc-200">Drill Yard — every bank cleared</span>
          <span className="tnum block text-[10px] text-zinc-500">
            {fmt(mastered)}/{fmt(DRILL_TOTAL)} mastered across all keyword banks · 120 min
          </span>
        </span>
        {state !== "locked" && (
          <Btn variant="soft" className="shrink-0 px-2.5 py-1 text-[11px]" onClick={onOpenDrills}>
            Open yard
          </Btn>
        )}
      </div>
    );
  }

  const l = lessonById(item.lessonId);
  if (!l) return null;
  const sub = lessonSubProgress(l, prog);
  const split = topicTimeSplit(item);
  const lessonPaid = prog.xpEvents[`lesson:${l.id}`] !== undefined;
  const done = state === "done" || (lessonPaid && sub.casesDone === sub.casesTotal);
  return (
    <div className="flex items-center gap-2.5 rounded-md border border-zinc-800/70 bg-zinc-900/40 px-2.5 py-2">
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          done ? "bg-emerald-400 text-[var(--brand-ink)]" : "border border-zinc-700 text-zinc-500",
        )}
      >
        {done ? <Check className="h-2.5 w-2.5" /> : <BookOpen className="h-3 w-3" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium text-zinc-200">
          Lesson {l.num} — {l.title}
        </span>
        <span className="tnum block text-[10px] text-zinc-500">
          {sub.mcqsDone}/{sub.mcqsTotal} quiz · {sub.problemsDone}/{sub.problemsTotal} queries
          {sub.casesTotal > 0 ? ` · ${sub.casesDone}/${sub.casesTotal} cases` : ""} ·{" "}
          <span className="text-zinc-400">
            {l.minutes} min ({split.theoryMin}m theory · {split.quizMin}m quiz · {split.labMin}m SQL)
          </span>
        </span>
      </span>
      {state !== "locked" && (
        <Btn variant="soft" className="shrink-0 px-2.5 py-1 text-[11px]" onClick={() => onOpenLesson(l.id)}>
          {done ? "Review" : "Open"}
        </Btn>
      )}
    </div>
  );
}

function DayCard({
  day,
  index,
  state,
  prog,
  onOpenLesson,
  onOpenExam,
  onOpenDrills,
}: {
  day: RoadmapDay;
  index: number;
  state: DayState;
  prog: ProgSlice;
  onOpenLesson: (id: string) => void;
  onOpenExam: (moduleId: string) => void;
  onOpenDrills: () => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const minutes = dayMinutes(day);

  return (
    <li id={`sprint-day-${day.day}`} className="relative pl-14 pb-5 last:pb-0">
      <span
        aria-hidden
        className={cn(
          "absolute bottom-0 left-[21px] top-0 w-0.5",
          index === ROADMAP.length - 1 ? "bg-transparent" : "bg-zinc-800",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-full border font-mono text-xs font-semibold",
          state === "done" && "border-emerald-400/50 bg-emerald-400/10 text-emerald-300",
          state === "current" && "border-emerald-400 bg-emerald-400 text-[var(--brand-ink)]",
          state === "locked" && "border-zinc-800 bg-zinc-950 text-zinc-600",
        )}
      >
        {state === "done" ? <Check className="h-4 w-4" /> : state === "locked" ? <Lock className="h-3.5 w-3.5" /> : day.day}
      </span>
      {state === "current" && (
        <motion.span
          aria-hidden
          className="absolute left-[26px] top-[-9px] h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_10px_2px_rgba(252,211,77,0.55)]"
          animate={reduced ? undefined : { y: [0, -7, 0] }}
          transition={reduced ? undefined : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div
        className={cn(
          "rounded-xl border bg-zinc-950 p-4 transition-colors",
          state === "current" && "border-emerald-400/40 shadow-[0_0_24px_-8px_rgba(52,211,153,0.35)]",
          state === "done" && "border-zinc-800",
          state === "locked" && "border-zinc-800/70 opacity-70",
        )}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="font-display text-sm font-semibold text-zinc-100">
            <span className="font-mono text-[10px] font-normal uppercase tracking-wider text-zinc-500">Day {day.day} · </span>
            {day.title}
          </h3>
          <span className="tnum font-mono text-[10px] text-zinc-500">
            ~{minutes} min{state === "done" ? " · cleared" : ""}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-zinc-400">{day.focus}</p>
        <p className="tnum mt-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          On this day · {onThisDay(day)}
        </p>

        <div className="mt-3 flex flex-col gap-1.5">
          {day.items.map((item, i) => (
            <ItemRow
              key={i}
              item={item}
              state={state}
              prog={prog}
              onOpenLesson={onOpenLesson}
              onOpenExam={onOpenExam}
              onOpenDrills={onOpenDrills}
            />
          ))}
        </div>

        {state === "locked" && (
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Lock className="h-3 w-3 shrink-0" />
            Locked — finish Day {day.day - 1} in full to open this day.
          </p>
        )}
      </div>
    </li>
  );
}

/** Interactive countdown timer that logs today's study minutes to localStorage. */
function FocusTimerBar({
  dailyGoalMin,
  loggedTodayMin,
  onLogMinutes,
}: {
  dailyGoalMin: number;
  loggedTodayMin: number;
  onLogMinutes: (delta: number) => void;
}) {
  const [presetMin, setPresetMin] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          onLogMinutes(presetMin);
          return presetMin * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, presetMin, onLogMinutes]);

  const choosePreset = (min: number) => {
    setRunning(false);
    setPresetMin(min);
    setSecondsLeft(min * 60);
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const pct = Math.min(100, Math.round((loggedTodayMin / Math.max(1, dailyGoalMin)) * 100));

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/90 px-3.5 py-2.5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-500/25 bg-emerald-500/10 text-emerald-300">
          <Clock className="h-3.5 w-3.5" />
        </span>
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
            <span>Focus timer</span>
            <span className="tnum font-mono text-sm font-semibold text-emerald-300">
              {mm}:{ss}
            </span>
          </div>
          <div className="tnum text-[10px] text-zinc-500">
            Today: {loggedTodayMin}/{dailyGoalMin} min logged ({pct}%)
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {[15, 25, 45, 60].map((m) => (
          <button
            key={m}
            onClick={() => choosePreset(m)}
            className={cn(
              "tnum rounded border px-2 py-0.5 font-mono text-[10px] transition-colors",
              presetMin === m
                ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-200"
                : "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200",
            )}
          >
            {m}m
          </button>
        ))}
        <button
          onClick={() => setRunning((r) => !r)}
          className="inline-flex items-center gap-1 rounded border border-emerald-400/40 bg-emerald-400/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-200 hover:bg-emerald-400/25"
        >
          {running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {running ? "Pause" : "Start"}
        </button>
        <button
          onClick={() => {
            setRunning(false);
            setSecondsLeft(presetMin * 60);
          }}
          aria-label="Reset focus timer"
          className="rounded border border-zinc-800 p-1 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
        <button
          onClick={() => onLogMinutes(15)}
          title="Manually log 15 minutes of study today"
          className="tnum rounded border border-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
        >
          +15m log
        </button>
      </div>
    </div>
  );
}

function ModuleBudgetTable({
  budgets,
  prog,
  onOpenLesson,
}: {
  budgets: ModuleTimeBudget[];
  prog: ProgSlice;
  onOpenLesson: (id: string) => void;
}) {
  return (
    <Panel pad={5}>
      <SectionLabel>Topic time budget · all 14 core modules</SectionLabel>
      <p className="mt-1 text-xs text-zinc-400">
        Recommended split per module: ~25% Theory & visual diagrams, ~25% Recall Quiz, ~50% Live SQL Lab & case files.
      </p>

      <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-zinc-800 bg-zinc-900/70 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-3 py-2">Module & Topic</th>
              <th className="px-2.5 py-2 text-right">Lessons</th>
              <th className="px-2.5 py-2 text-right">Theory</th>
              <th className="px-2.5 py-2 text-right">Quiz</th>
              <th className="px-2.5 py-2 text-right">SQL Lab</th>
              <th className="px-2.5 py-2 text-right">Total</th>
              <th className="px-3 py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/70 bg-zinc-950/60">
            {budgets.map((b) => {
              const examPassed = prog.exams[b.moduleId]?.passedAt !== undefined;
              const minL = Math.min(...b.lessonNums);
              const maxL = Math.max(...b.lessonNums);
              return (
                <tr key={b.moduleId} className="hover:bg-zinc-900/40">
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-zinc-200">
                      M{b.num}: {b.title}
                    </div>
                    <div className="font-mono text-[10px] text-zinc-500">
                      L{minL}–L{maxL} · {b.mcqCount} MCQs · {b.queryCount} SQL
                      {b.caseCount > 0 ? ` · ${b.caseCount} cases` : ""}
                    </div>
                  </td>
                  <td className="tnum px-2.5 py-2.5 text-right font-mono text-zinc-300">{b.lessonCount}</td>
                  <td className="tnum px-2.5 py-2.5 text-right font-mono text-sky-300/90">{b.split.theoryMin}m</td>
                  <td className="tnum px-2.5 py-2.5 text-right font-mono text-amber-300/90">{b.split.quizMin}m</td>
                  <td className="tnum px-2.5 py-2.5 text-right font-mono text-emerald-300/90">{b.split.labMin}m</td>
                  <td className="tnum px-2.5 py-2.5 text-right font-mono font-semibold text-zinc-100">
                    {formatDuration(b.totalMinutes)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => onOpenLesson(b.firstLessonId)}
                      className={cn(
                        "rounded border px-2 py-0.5 font-mono text-[10px] transition-colors",
                        examPassed
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : "border-zinc-700 text-zinc-300 hover:border-zinc-500",
                      )}
                    >
                      {examPassed ? "Cleared ✓" : "Open L" + minL}
                    </button>
                  </td>
                </tr>
              );
            })}
            <tr className="bg-zinc-900/30 text-zinc-400">
              <td className="px-3 py-2.5">
                <div className="font-medium text-emerald-300">Post-Sprint: Interview & Domain Mastery</div>
                <div className="font-mono text-[10px] text-zinc-500">
                  208 Company Kits · 437 LeetCode/DataFin · 10 Industry Packs
                </div>
              </td>
              <td className="tnum px-2.5 py-2.5 text-right font-mono">—</td>
              <td className="tnum px-2.5 py-2.5 text-right font-mono">10m/d</td>
              <td className="tnum px-2.5 py-2.5 text-right font-mono">10m/d</td>
              <td className="tnum px-2.5 py-2.5 text-right font-mono">25m/d</td>
              <td className="tnum px-2.5 py-2.5 text-right font-mono font-semibold text-zinc-200">45m/day</td>
              <td className="px-3 py-2.5 text-right font-mono text-[10px] text-zinc-500">Ongoing</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function TimetableScheduleView({
  sessions,
  paceMin,
  startDateIso,
  onChangePace,
  onChangeStartDate,
  onOpenLesson,
  onOpenExam,
  onOpenDrills,
}: {
  sessions: TimetableSession[];
  paceMin: number;
  startDateIso: string;
  onChangePace: (min: number) => void;
  onChangeStartDate: (iso: string) => void;
  onOpenLesson: (id: string) => void;
  onOpenExam: (moduleId: string) => void;
  onOpenDrills: () => void;
}) {
  const [selectedWeek, setSelectedWeek] = useState<number>(0); // 0 = all weeks

  const weeks = useMemo(() => {
    const map = new Map<number, TimetableSession[]>();
    for (const s of sessions) {
      const list = map.get(s.weekNum) ?? [];
      list.push(s);
      map.set(s.weekNum, list);
    }
    return Array.from(map.entries()).map(([weekNum, items]) => ({ weekNum, items }));
  }, [sessions]);

  const finishDate = sessions.length > 0 ? formatShortDate(sessions[sessions.length - 1].dateIso) : "—";
  const visibleWeeks = selectedWeek === 0 ? weeks : weeks.filter((w) => w.weekNum === selectedWeek);

  return (
    <div className="space-y-4">
      {/* Pace & Calendar Controls */}
      <Panel pad={5}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <SectionLabel>Personal timetable generator</SectionLabel>
            <p className="mt-1 text-xs text-zinc-400">
              Pick your daily study budget to automatically generate a calendar timetable covering all 78 lessons, 14 exams & drills.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="tnum font-mono">
              {sessions.length} study days · Finish: <strong>{finishDate}</strong>
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800/80 pt-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Daily pace:</span>
            {PACE_OPTIONS.map((p) => (
              <button
                key={p}
                onClick={() => onChangePace(p)}
                className={cn(
                  "tnum rounded-md border px-2.5 py-1 font-mono text-xs transition-colors",
                  paceMin === p
                    ? "border-emerald-400 bg-emerald-400/15 font-semibold text-emerald-200"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200",
                )}
              >
                {p} min/day
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Start date:</span>
            <input
              type="date"
              value={startDateIso}
              onChange={(e) => e.target.value && onChangeStartDate(e.target.value)}
              className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
            />
          </label>
        </div>

        {/* Week Filter Pills */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedWeek(0)}
            className={cn(
              "rounded border px-2 py-0.5 font-mono text-[10px]",
              selectedWeek === 0
                ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"
                : "border-zinc-800 text-zinc-400 hover:border-zinc-700",
            )}
          >
            All Weeks ({weeks.length})
          </button>
          {weeks.map((w) => (
            <button
              key={w.weekNum}
              onClick={() => setSelectedWeek(w.weekNum)}
              className={cn(
                "rounded border px-2 py-0.5 font-mono text-[10px]",
                selectedWeek === w.weekNum
                  ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-700",
              )}
            >
              Week {w.weekNum}
            </button>
          ))}
        </div>
      </Panel>

      {/* Week-by-Week Calendar Timetable */}
      {visibleWeeks.map((week) => (
        <Panel key={week.weekNum} pad={4}>
          <div className="mb-3 flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <h3 className="font-display text-sm font-semibold text-zinc-100">
              Week {week.weekNum}{" "}
              <span className="font-mono text-[11px] font-normal text-zinc-500">
                · {formatShortDate(week.items[0].dateIso)} – {formatShortDate(week.items[week.items.length - 1].dateIso)}
              </span>
            </h3>
            <span className="tnum font-mono text-[11px] text-zinc-400">
              {formatDuration(week.items.reduce((a, s) => a + s.totalMinutes, 0))} total
            </span>
          </div>

          <div className="space-y-2.5">
            {week.items.map((session) => (
              <div
                key={session.sessionNum}
                className={cn(
                  "rounded-lg border p-3 transition-colors",
                  session.containsCurrentDay
                    ? "border-emerald-400/40 bg-emerald-950/15"
                    : session.allDone
                      ? "border-zinc-800/60 bg-zinc-950/40 opacity-80"
                      : "border-zinc-800/80 bg-zinc-950/70",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="tnum rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-300">
                      Session {session.sessionNum}
                    </span>
                    <span className="font-mono text-xs text-zinc-200">{formatShortDate(session.dateIso)}</span>
                    {session.containsCurrentDay && !session.allDone && (
                      <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                        Active Now
                      </span>
                    )}
                    {session.allDone && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">
                        <Check className="h-2.5 w-2.5" /> Done
                      </span>
                    )}
                  </div>
                  <span className="tnum font-mono text-xs font-medium text-zinc-400">~{session.totalMinutes} min</span>
                </div>

                <div className="mt-2.5 space-y-1.5">
                  {session.tasks.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-800/60 bg-zinc-900/40 px-2.5 py-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-zinc-500">{t.moduleTitle}</span>
                          <span className="text-zinc-700">·</span>
                          <span className={cn("truncate text-xs font-medium", t.done ? "text-emerald-300" : "text-zinc-200")}>
                            {t.label}
                          </span>
                        </div>
                        <div className="tnum mt-0.5 font-mono text-[10px] text-zinc-500">
                          {t.minutes}m total
                          {t.kind === "lesson"
                            ? ` (${t.split.theoryMin}m theory · ${t.split.quizMin}m quiz · ${t.split.labMin}m SQL lab)`
                            : ` · ${t.sublabel}`}
                        </div>
                      </div>

                      {!t.locked ? (
                        <Btn
                          variant="soft"
                          className="shrink-0 px-2 py-0.5 text-[10px]"
                          onClick={() => {
                            if (t.item.kind === "lesson") onOpenLesson(t.item.lessonId);
                            else if (t.item.kind === "exam") onOpenExam(t.item.moduleId);
                            else onOpenDrills();
                          }}
                        >
                          {t.done ? "Review" : "Open"}
                        </Btn>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-600">
                          <Lock className="h-2.5 w-2.5" /> Sprint Day {t.sprintDay}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ))}
    </div>
  );
}

export function RoadmapTrack({
  onOpenLesson,
  onOpenExam,
  onOpenDrills,
}: {
  onOpenLesson: (id: string) => void;
  onOpenExam: (moduleId: string) => void;
  onOpenDrills: () => void;
}) {
  const xpEvents = useProgress((s) => s.xpEvents);
  const mcqAttempts = useProgress((s) => s.mcqAttempts);
  const exams = useProgress((s) => s.exams);
  const prog = useMemo<ProgSlice>(() => ({ xpEvents, mcqAttempts, exams }), [xpEvents, mcqAttempts, exams]);

  const [prefs, setPrefs] = useState<TimetablePrefs>(defaultPrefs);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TIMETABLE_LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<TimetablePrefs>;
        setPrefs((prev) => ({
          paceMin: typeof parsed.paceMin === "number" ? parsed.paceMin : prev.paceMin,
          startDateIso: typeof parsed.startDateIso === "string" ? parsed.startDateIso : prev.startDateIso,
          tab: parsed.tab === "sprint" || parsed.tab === "timetable" ? parsed.tab : prev.tab,
          loggedMinutesByDate:
            parsed.loggedMinutesByDate && typeof parsed.loggedMinutesByDate === "object"
              ? parsed.loggedMinutesByDate
              : prev.loggedMinutesByDate,
        }));
      }
    } catch {
      /* ignore private mode */
    }
  }, []);

  const updatePrefs = (updater: (p: TimetablePrefs) => TimetablePrefs) => {
    setPrefs((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(TIMETABLE_LS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const logStudyMinutes = (delta: number) => {
    const key = todayIso();
    updatePrefs((p) => ({
      ...p,
      loggedMinutesByDate: {
        ...p.loggedMinutesByDate,
        [key]: (p.loggedMinutesByDate[key] ?? 0) + delta,
      },
    }));
  };

  const stats = sprintStats();
  const budgets = moduleTimeBudgets();
  const cur = currentDayIndex(prog);
  const cleared = sprintCleared(prog);

  const sessions = useMemo(
    () => buildTimetable(prefs.paceMin, prefs.startDateIso, prog),
    [prefs.paceMin, prefs.startDateIso, prog],
  );

  const stateFor = (index: number): DayState =>
    cleared || index < cur ? "done" : index === cur ? "current" : "locked";

  const jump = (day: number) => {
    document.getElementById(`sprint-day-${day}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const loggedToday = prefs.loggedMinutesByDate[todayIso()] ?? 0;

  return (
    <div className="max-w-3xl space-y-5">
      {/* header + live census */}
      <Panel pad={5}>
        <p className="font-mono text-xs text-zinc-500">
          THE {stats.days}-DAY CURRICULUM · TIMETABLE & SPRINT
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <h1 className="flex items-center gap-3.5 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50">
            <Icon3D name="rocket" size={46} anim="float" />
            Your roadmap
          </h1>
          {cleared ? (
            <span className="flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-400/10 px-3 py-1 text-[11px] font-medium text-amber-200">
              <Check className="h-3 w-3" /> Sprint cleared — every day done
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium text-emerald-200">
              <MapPin className="h-3 w-3" /> You are on Day {cur + 1} of {ROADMAP.length}
            </span>
          )}
        </div>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-zinc-400">
          {stats.lessons} lessons, {stats.exams} exams and one drill-bank finale across {stats.days} days. A day
          unlocks the next only when its whole list is done — every quiz question, every graded query, every mapped
          case file. {sprintLine()}.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
          <StatCell n={stats.days} label="Days" />
          <StatCell n={stats.lessons} label="Lessons" />
          <StatCell n={stats.mcqs} label="Quiz" />
          <StatCell n={stats.queries} label="Queries" />
          <StatCell n={stats.caseFiles} label="Case files" />
          <StatCell n={stats.drills} label="Drills" />
        </div>

        {/* Live Study Focus Timer */}
        <FocusTimerBar
          dailyGoalMin={prefs.paceMin}
          loggedTodayMin={loggedToday}
          onLogMinutes={logStudyMinutes}
        />

        {/* View Mode Switcher */}
        <div className="mt-4 flex items-center gap-2 border-t border-zinc-800/80 pt-4">
          <button
            onClick={() => updatePrefs((p) => ({ ...p, tab: "timetable" }))}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              prefs.tab === "timetable"
                ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-200"
                : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200",
            )}
          >
            <CalendarClock className="h-3.5 w-3.5" /> Timetable & Topic Times
          </button>
          <button
            onClick={() => updatePrefs((p) => ({ ...p, tab: "sprint" }))}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              prefs.tab === "sprint"
                ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-200"
                : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200",
            )}
          >
            <Route className="h-3.5 w-3.5" /> Winding Sprint Path ({ROADMAP.length}d)
          </button>
        </div>

        {prefs.tab === "sprint" && (
          <div className="mt-4">
            <SectionLabel className="mb-1.5">Jump to a day</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {ROADMAP.map((d, i) => {
                const st = stateFor(i);
                return (
                  <button
                    key={d.day}
                    onClick={() => jump(d.day)}
                    disabled={st === "locked"}
                    aria-label={`Day ${d.day}`}
                    className={cn(
                      "tnum rounded-md border px-2 py-1 font-mono text-[11px] transition-colors",
                      st === "current" && "border-emerald-400/60 bg-emerald-400/10 text-emerald-200",
                      st === "done" && "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200",
                      st === "locked" && "cursor-not-allowed border-zinc-800/60 text-zinc-600",
                    )}
                  >
                    {st === "done" ? "✓ " : ""}
                    {d.day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Panel>

      {prefs.tab === "timetable" ? (
        <>
          <ModuleBudgetTable budgets={budgets} prog={prog} onOpenLesson={onOpenLesson} />
          <TimetableScheduleView
            sessions={sessions}
            paceMin={prefs.paceMin}
            startDateIso={prefs.startDateIso}
            onChangePace={(paceMin) => updatePrefs((p) => ({ ...p, paceMin }))}
            onChangeStartDate={(startDateIso) => updatePrefs((p) => ({ ...p, startDateIso }))}
            onOpenLesson={onOpenLesson}
            onOpenExam={onOpenExam}
            onOpenDrills={onOpenDrills}
          />
        </>
      ) : (
        <>
          <ol className="relative">
            {ROADMAP.map((d, i) => (
              <DayCard
                key={d.day}
                day={d}
                index={i}
                state={stateFor(i)}
                prog={prog}
                onOpenLesson={onOpenLesson}
                onOpenExam={onOpenExam}
                onOpenDrills={onOpenDrills}
              />
            ))}
          </ol>

          {!cleared && (
            <Panel rounded="lg">
              <p className="flex items-start gap-2.5 text-sm leading-relaxed text-zinc-300">
                <Route className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <span>
                  <span className="font-medium text-zinc-100">Finish Day {cur + 1} in full</span> — theory, quiz, queries
                  {daySummary(ROADMAP[cur]).cases > 0 ? ", case files" : ""}
                  {daySummary(ROADMAP[cur]).exams > 0 ? " and the exam" : ""} — and Day {cur + 2} opens by itself.
                </span>
              </p>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}
