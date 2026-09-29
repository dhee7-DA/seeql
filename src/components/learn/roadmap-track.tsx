"use client";

// The 30-day sprint view — a winding day-by-day path with a hard gate.
//
// The blob sits on the current day and bounces; every later day is locked
// until the current day's FULL list is done (theory via the lesson bonus,
// every quiz question correct, every graded query solved, every mapped
// case file rebuilt, module exams passed — the Day-30 clearing house wants
// the whole drill bank). Completed days stay open for revision. All volume
// numbers are live from the course registries — nothing here can drift.

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Check,
  Dumbbell,
  GraduationCap,
  Lock,
  MapPin,
  Route,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/curriculum/progress";
import { EXAM_FILLS, EXAM_MCQS, EXAM_PASS } from "@/lib/curriculum/exams";
import { DRILL_SETS } from "@/lib/curriculum/drills";
import {
  DRILL_TOTAL,
  ROADMAP,
  currentDayIndex,
  dayMinutes,
  daySummary,
  lessonById,
  lessonSubProgress,
  moduleById,
  sprintCleared,
  sprintStats,
  type ProgSlice,
  type RoadmapDay,
  type RoadmapItem,
} from "@/lib/curriculum/roadmap";
import { Btn, Panel, SectionLabel } from "./ui/kit";
import { Icon3D } from "./ui/icon3d";

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
              : `${EXAM_MCQS + EXAM_FILLS} questions · pass at ${EXAM_PASS}`}
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
            {fmt(mastered)}/{fmt(DRILL_TOTAL)} mastered across all keyword banks
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

  // lesson item
  const l = lessonById(item.lessonId);
  if (!l) return null;
  const sub = lessonSubProgress(l, prog);
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
          {sub.casesTotal > 0 ? ` · ${sub.casesDone}/${sub.casesTotal} cases` : ""} · {l.minutes} min
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
      {/* rail + node */}
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
      {/* the bouncing blob — sits on the current day's node */}
      {state === "current" && (
        <motion.span
          aria-hidden
          className="absolute left-[26px] top-[-9px] h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_10px_2px_rgba(252,211,77,0.55)]"
          animate={reduced ? undefined : { y: [0, -7, 0] }}
          transition={reduced ? undefined : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* card */}
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

  const stats = sprintStats();
  const cur = currentDayIndex(prog);
  const cleared = sprintCleared(prog);

  const stateFor = (index: number): DayState =>
    cleared || index < cur ? "done" : index === cur ? "current" : "locked";

  const jump = (day: number) => {
    document.getElementById(`sprint-day-${day}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="max-w-3xl">
      {/* header + live census */}
      <Panel pad={5}>
        <p className="font-mono text-xs text-zinc-500">THE 30-DAY SPRINT · HARD GATE</p>
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

        {/* jump rail */}
        <div className="mt-5">
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
      </Panel>

      {/* the winding path */}
      <ol className="relative mt-7">
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
        <Panel rounded="lg" className="mt-2">
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
    </div>
  );
}
