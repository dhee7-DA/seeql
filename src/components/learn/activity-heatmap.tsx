"use client";

// Activity heatmap — a 26-week GitHub-style grid of practice XP, one cell
// per day, measured against the learner's daily goal. Weeks run Sunday →
// Saturday (the last column is the current week), the grid scrolls on
// narrow screens, and month labels drop themselves when two would collide.
//
// The ramp is intentionally alpha-based emerald over the theme surface:
// it reads correctly on all six themes without per-theme overrides, and
// reduced-motion is irrelevant (the grid is fully static).

import { useMemo } from "react";
import { useProgress } from "@/lib/curriculum/progress";
import { dayKey } from "@/lib/curriculum/gamification";
import { cn } from "@/lib/utils";

const WEEKS = 26;

const LEVEL_CLASS = [
  "bg-zinc-500/15",
  "bg-emerald-400/25",
  "bg-emerald-400/45",
  "bg-emerald-400/70",
  "bg-emerald-400",
] as const;

/** XP relative to the daily goal → 0–4 intensity (GitHub quartiles). */
function levelFor(xp: number, goal: number): 0 | 1 | 2 | 3 | 4 {
  if (xp <= 0) return 0;
  const r = xp / Math.max(goal, 1);
  if (r < 0.25) return 1;
  if (r < 0.5) return 2;
  if (r < 1) return 3;
  return 4;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ActivityHeatmap() {
  const xpByDay = useProgress((s) => s.xpByDay);
  const dailyGoal = useProgress((s) => s.dailyGoal);

  const { cols, months, activeDays, todayXp } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Grow the grid so the CURRENT week is the last, complete column.
    const end = new Date(today);
    end.setDate(today.getDate() + (6 - today.getDay())); // Saturday of this week
    const start = new Date(end);
    start.setDate(end.getDate() - (WEEKS * 7 - 1));
    start.setHours(0, 0, 0, 0);

    const outCols: Array<Array<{ key: string; label: string; xp: number; future: boolean; today: boolean }>> = [];
    const outMonths: Array<{ col: number; name: string }> = [];
    let lastMonthCol = -4; // collision guard: ≥3 clear columns between labels
    let active = 0;
    const cur = new Date(start);
    for (let w = 0; w < WEEKS; w++) {
      const col: Array<{ key: string; label: string; xp: number; future: boolean; today: boolean }> = [];
      for (let d = 0; d < 7; d++) {
        const future = cur.getTime() > today.getTime();
        const key = dayKey(cur);
        const xp = future ? 0 : (xpByDay[key] ?? 0);
        if (!future && xp > 0) active++;
        col.push({
          key: future ? `f${w}-${d}` : key,
          label: `${cur.toLocaleDateString(undefined, { month: "short", day: "numeric" })}${future ? "" : ` — ${xp} XP`}`,
          xp,
          future,
          today: cur.getTime() === today.getTime(),
        });
        // A month label goes on the column where that month's 1st–7th first appears
        if (d === 0 && cur.getDate() <= 7 && w - lastMonthCol >= 3) {
          outMonths.push({ col: w, name: MONTHS[cur.getMonth()] });
          lastMonthCol = w;
        }
        cur.setDate(cur.getDate() + 1);
      }
      outCols.push(col);
    }
    const tx = xpByDay[dayKey(today)] ?? 0;
    return { cols: outCols, months: outMonths, activeDays: active, todayXp: tx };
  }, [xpByDay, dailyGoal]);

  return (
    <section className="mt-7" data-tour="heatmap">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="flex items-center gap-2.5 font-display text-sm font-semibold text-zinc-200">
          Practice activity
        </h2>
        <span className="tnum text-[11px] text-zinc-500">
          goal {dailyGoal} XP/day{todayXp > 0 ? ` · today ${todayXp} XP` : ""}
        </span>
      </div>
      <div className="mt-3 overflow-x-auto pb-1">
        <div className="min-w-max">
          {/* month labels — positioned over their week columns */}
          <div className="relative mb-1 h-3.5">
            {months.map((m) => (
              <span
                key={`${m.name}-${m.col}`}
                className="absolute font-mono text-[10px] text-zinc-500"
                style={{ left: `${m.col * 15}px` }}
              >
                {m.name}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px]" role="img" aria-label={`Practice activity over the last ${WEEKS} weeks: ${activeDays} active days against a ${dailyGoal} XP daily goal.`}>
            {cols.map((col, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {col.map((cell) => (
                  <div
                    key={cell.key}
                    title={cell.future ? undefined : cell.label}
                    className={cn(
                      "h-3 w-3 rounded-[3px]",
                      cell.future ? "bg-transparent" : LEVEL_CLASS[levelFor(cell.xp, dailyGoal)],
                      cell.today && "ring-1 ring-emerald-300/80",
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* legend */}
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-500">quiet</span>
            {LEVEL_CLASS.map((c) => (
              <span key={c} className={cn("h-2.5 w-2.5 rounded-[2px]", c)} />
            ))}
            <span className="text-[10px] text-zinc-500">goal+</span>
          </div>
        </div>
      </div>
    </section>
  );
}
