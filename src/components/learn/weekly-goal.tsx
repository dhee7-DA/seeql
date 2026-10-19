"use client";

// Weekly goal picker — a row of flat preset chips + one thin progress bar.
// The goal lives in the progress store (weeklyGoalXp, default null = not
// set) and steers nothing but this card: picking a goal pays no XP. The bar
// reads the existing xpByDay buckets, summed over the last 7 local days.

import { useMemo } from "react";
import { dayKey } from "@/lib/curriculum/gamification";
import { useProgress } from "@/lib/curriculum/progress";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./ui/kit";

const WEEKLY_GOAL_PRESETS = [100, 250, 500];

export function WeeklyGoalPicker() {
  const weeklyGoalXp = useProgress((s) => s.weeklyGoalXp);
  const setWeeklyGoalXp = useProgress((s) => s.setWeeklyGoalXp);
  const xpByDay = useProgress((s) => s.xpByDay);

  // trailing-7-day XP sum (today + the six before it) from xpByDay
  const weekXp = useMemo(() => {
    let sum = 0;
    const d = new Date();
    for (let i = 0; i < 7; i++) {
      sum += xpByDay[dayKey(d)] ?? 0;
      d.setDate(d.getDate() - 1);
    }
    return sum;
  }, [xpByDay]);

  return (
    <div className="sheen mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm font-semibold text-zinc-100">Weekly goal</h3>
        <div className="flex items-center gap-1.5" role="group" aria-label="Weekly XP goal">
          {WEEKLY_GOAL_PRESETS.map((n) => {
            const current = weeklyGoalXp === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setWeeklyGoalXp(current ? null : n)}
                aria-pressed={current}
                title={current ? `Current weekly goal (${n} XP) — tap to clear` : `Set ${n} XP per week`}
                className={cn(
                  "cursor-pointer rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors",
                  current
                    ? "border-emerald-400/60 bg-emerald-400/[0.08] text-emerald-300 ring-1 ring-emerald-400/40"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200",
                )}
              >
                <span className="tnum">{n}</span>
                <span className={cn("ml-1", current ? "text-emerald-300/70" : "text-zinc-600")}>XP</span>
              </button>
            );
          })}
        </div>
      </div>
      {weeklyGoalXp === null ? (
        <p className="mt-2.5 text-[11px] leading-relaxed text-zinc-500">
          Pick a weekly XP target — the bar tracks your last 7 days. Picking a goal pays no XP; the week&apos;s
          answers do.
        </p>
      ) : (
        <>
          <ProgressBar value={Math.min(1, weekXp / weeklyGoalXp)} className="mt-3" />
          <p className="mt-1.5 text-[11px] text-zinc-500">
            <span className="tnum font-mono text-zinc-300">{weekXp.toLocaleString()}</span>
            {" / "}
            <span className="tnum font-mono">{weeklyGoalXp.toLocaleString()}</span> XP this week
            {weekXp >= weeklyGoalXp && <span className="text-emerald-300"> — goal met</span>}
          </p>
        </>
      )}
    </div>
  );
}
