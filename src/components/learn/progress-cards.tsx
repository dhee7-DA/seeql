"use client";

// Overview dashboard cards — a 14-day XP activity strip against the daily
// goal, and a per-lesson mastery grid (quiz + practice completion at a
// glance). Pure visualization over the progress store; clicking a mastery
// cell opens that lesson.

import { useMemo } from "react";
import { LESSONS, MODULES } from "@/lib/curriculum/lessons";
import { useProgress } from "@/lib/curriculum/progress";
import { dayKey } from "@/lib/curriculum/gamification";
import { cn } from "@/lib/utils";

const STRIP_DAYS = 14;

function lastDayKeys(n: number): string[] {
  const keys: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    keys.unshift(dayKey(d));
    d.setDate(d.getDate() - 1);
  }
  return keys;
}

function weekdayOf(key: string): string {
  // key is "YYYY-MM-DD" in local time — anchor noon to avoid DST edges
  const d = new Date(`${key}T12:00:00`);
  return ["S", "M", "T", "W", "T", "F", "S"][d.getDay()] ?? "";
}

function monthDayOf(key: string): string {
  const [, m, dd] = key.split("-");
  return `${Number(m)}/${Number(dd)}`;
}

export function ActivityStrip() {
  const xpByDay = useProgress((s) => s.xpByDay);
  const dailyGoal = useProgress((s) => s.dailyGoal);

  const days = useMemo(() => {
    const keys = lastDayKeys(STRIP_DAYS);
    return keys.map((k) => ({ key: k, xp: xpByDay[k] ?? 0 }));
  }, [xpByDay]);

  const weekXp = days.reduce((a, d) => a + d.xp, 0);
  const hit = days.filter((d) => d.xp >= dailyGoal).length;

  return (
    <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-sm font-semibold text-zinc-100">Last {STRIP_DAYS} days</h3>
        <p className="tnum text-[11px] text-zinc-500">
          <span className="font-mono text-zinc-300">{weekXp.toLocaleString()} XP</span> · goal hit {hit}/{STRIP_DAYS} days
        </p>
      </div>
      <div className="relative mt-4 flex h-20 items-end gap-1.5">
        {/* goal line — bars are scaled so the goal sits at 75% height */}
        <div
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-zinc-700"
          style={{ bottom: "75%" }}
        />
        {days.map((d) => {
          const ratio = Math.min(d.xp / dailyGoal, 1);
          const h = Math.max(ratio * 75, d.xp > 0 ? 4 : 2);
          return (
            <div key={d.key} className="flex h-full flex-1 flex-col justify-end" title={`${monthDayOf(d.key)} · ${d.xp} XP`}>
              <div
                className={cn(
                  "w-full rounded-[3px]",
                  d.xp >= dailyGoal ? "bg-emerald-400" : d.xp > 0 ? "bg-emerald-400/45" : "bg-zinc-800",
                )}
                style={{ height: `${h}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {days.map((d) => (
          <span key={d.key} className={cn("flex-1 text-center font-mono text-[9px]", d.xp >= dailyGoal ? "text-emerald-300/80" : "text-zinc-600")}>
            {weekdayOf(d.key)}
          </span>
        ))}
      </div>
      <p className="mt-1 text-center text-[10px] text-zinc-600">
        bars scale to your {dailyGoal} XP daily goal — dashed line marks it
      </p>
    </div>
  );
}

type Mastery = { done: boolean; started: boolean; quiz: number; practice: number };

function masteryFor(
  state: Pick<ReturnType<typeof useProgress.getState>, "xpEvents" | "mcqAttempts">,
  lessonId: string,
  mcqIds: string[],
  problemIds: string[],
): Mastery {
  const quiz = mcqIds.filter((id) => state.mcqAttempts[id] !== undefined).length;
  const practice = problemIds.filter((id) => state.xpEvents[`solve:${id}`] !== undefined).length;
  const started = quiz > 0 || practice > 0;
  const done = state.xpEvents[`lesson:${lessonId}`] !== undefined;
  return { done, started, quiz, practice };
}

export function MasteryGrid({ onOpenLesson }: { onOpenLesson: (id: string) => void }) {
  // subscribe so the grid re-renders on progress changes
  const xpEvents = useProgress((s) => s.xpEvents);
  const mcqAttempts = useProgress((s) => s.mcqAttempts);

  const grid = useMemo(
    () =>
      MODULES.map((m) => ({
        module: m,
        cells: m.lessons.map((l) => ({
          lesson: l,
          m: masteryFor({ xpEvents, mcqAttempts }, l.id, l.mcqs.map((q) => q.id), l.problems.map((p) => p.id)),
        })),
      })),
    [xpEvents, mcqAttempts],
  );

  return (
    <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-sm font-semibold text-zinc-100">Course mastery</h3>
        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[2px] bg-emerald-400" /> complete</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[2px] border border-zinc-600 bg-zinc-800" /> started</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[2px] border border-zinc-800" /> untouched</span>
        </div>
      </div>
      <div className="mt-3 space-y-3">
        {grid.map(({ module, cells }) => (
          <div key={module.id}>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
              Module {module.num} · {module.title}
            </p>
            <div className="flex gap-1.5">
              {cells.map(({ lesson, m }) => (
                <button
                  key={lesson.id}
                  onClick={() => onOpenLesson(lesson.id)}
                  title={`Lesson ${lesson.num} · ${lesson.title}\nquiz ${m.quiz}/${lesson.mcqs.length} · practice ${m.practice}/${lesson.problems.length}`}
                  className={cn(
                    "cell-lift flex-1 rounded-md border px-1.5 pb-1.5 pt-1.5 text-center",
                    m.done
                      ? "border-emerald-400/60 bg-emerald-400/10 hover:border-emerald-400/80 hover:bg-emerald-400/20"
                      : m.started
                        ? "border-zinc-600 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800"
                        : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900",
                  )}
                >
                  <span
                    className={cn(
                      "block font-mono text-xs font-semibold",
                      m.done ? "text-emerald-300" : m.started ? "text-zinc-200" : "text-zinc-600",
                    )}
                  >
                    {String(lesson.num).padStart(2, "0")}
                  </span>
                  <span className="mt-1 block h-[3px] w-full overflow-hidden rounded-full bg-zinc-800">
                    <span
                      className={cn("block h-full", m.done ? "bg-emerald-400" : "bg-sky-400/70")}
                      style={{ width: `${lesson.mcqs.length ? (m.quiz / lesson.mcqs.length) * 100 : 0}%` }}
                    />
                  </span>
                  <span className="mt-0.5 block h-[3px] w-full overflow-hidden rounded-full bg-zinc-800">
                    <span
                      className={cn("block h-full", m.done ? "bg-emerald-400" : "bg-violet-400/70")}
                      style={{ width: `${lesson.problems.length ? (m.practice / lesson.problems.length) * 100 : 0}%` }}
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-zinc-600">
        top bar = quiz answers checked · bottom bar = graded queries solved · click a cell to open the lesson
      </p>
    </div>
  );
}

/** Total course volume, for the overview blurb. */
export function courseTotals() {
  return {
    lessons: LESSONS.length,
    mcqs: LESSONS.reduce((a, l) => a + l.mcqs.length, 0),
    problems: LESSONS.reduce((a, l) => a + l.problems.length, 0),
  };
}
