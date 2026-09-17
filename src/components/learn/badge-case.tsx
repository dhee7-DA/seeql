"use client";

// BadgeCase — the trophy shelf. Earned badges shine with their unlock date;
// locked ones show exactly how far away they are ("2/5 solved"). A new badge
// landing while the case is open fires a celebrate burst at its tile.

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Briefcase,
  Flame,
  Flag,
  Gem,
  GraduationCap,
  Hammer,
  Lock,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { BADGES, bestStreak, currentStreak, totalXp } from "@/lib/curriculum/gamification";
import { LESSONS } from "@/lib/curriculum/lessons";
import { useProgress } from "@/lib/curriculum/progress";
import { cn } from "@/lib/utils";
import { flutterBurst, Wiggle } from "./flutter";

const ICONS: Record<string, LucideIcon> = {
  "first-xp": Zap,
  solver: Hammer,
  "five-solved": Target,
  flawless: Gem,
  apprentice: GraduationCap,
  "streak-3": Flame,
  halfway: Flag,
  analyst: Briefcase,
};

function dayLabel(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function BadgeCase() {
  const xpEvents = useProgress((s) => s.xpEvents);
  const mcqAttempts = useProgress((s) => s.mcqAttempts);
  const badges = useProgress((s) => s.badges);
  const xpByDay = useProgress((s) => s.xpByDay);
  const dailyGoal = useProgress((s) => s.dailyGoal);

  const xp = useMemo(() => totalXp({ xpEvents }), [xpEvents]);
  const streak = useMemo(() => currentStreak({ xpByDay, dailyGoal }), [xpByDay, dailyGoal]);
  const best = useMemo(() => bestStreak({ xpByDay, dailyGoal }), [xpByDay, dailyGoal]);

  const ctx = useMemo(() => {
    const problemsSolved = Object.keys(xpEvents).filter((k) => k.startsWith("solve:")).length;
    const lessonsDone = Object.keys(xpEvents).filter((k) => k.startsWith("lesson:")).length;
    const perfectQuizzes = LESSONS.filter((l) =>
      l.mcqs.every((m) => mcqAttempts[m.id]?.firstTry),
    ).length;
    return { lessonsDone, problemsSolved, perfectQuizzes };
  }, [xpEvents, mcqAttempts]);

  /** have/need progress toward each badge — powers the locked tiles */
  const progress = useMemo<Record<string, { have: number; need: number; unit: string }>>(() => {
    const p = (have: number, need: number, unit: string) => ({ have: Math.min(have, need), need, unit });
    return {
      "first-xp": p(xp > 0 ? 1 : 0, 1, "first XP"),
      solver: p(ctx.problemsSolved, 1, "solved"),
      "five-solved": p(ctx.problemsSolved, 5, "solved"),
      flawless: p(ctx.perfectQuizzes, 1, "perfect quiz"),
      apprentice: p(xp, 400, "XP"),
      "streak-3": p(Math.max(streak, best > 0 ? 0 : 0), 3, "day streak"),
      halfway: p(ctx.lessonsDone, 4, "lessons"),
      analyst: p(xp, 1000, "XP"),
    };
  }, [xp, ctx, streak, best]);

  // celebrate a badge unlocking while the case is visible
  const seen = useRef<Set<string>>(new Set(Object.keys(badges)));
  const tileRefs = useRef<Record<string, HTMLDivElement | null>>({});
  useEffect(() => {
    for (const id of Object.keys(badges)) {
      if (!seen.current.has(id)) {
        seen.current.add(id);
        const el = tileRefs.current[id];
        if (el) {
          const r = el.getBoundingClientRect();
          flutterBurst("celebrate", r.left + r.width / 2, r.top + r.height / 2);
        }
      }
    }
  }, [badges]);

  const earnedCount = Object.keys(badges).length;

  return (
    <div className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="flex items-center gap-1.5 font-display text-sm font-semibold text-zinc-100">
          <Award className="h-4 w-4 text-amber-300" />
          Badge case
        </h3>
        <p className="tnum text-[11px] text-zinc-500">
          <span className="font-mono text-amber-300">{earnedCount}</span>/{BADGES.length} earned
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {BADGES.map((b, i) => {
          const ts = badges[b.id];
          const earned = ts !== undefined;
          const Icon = ICONS[b.id] ?? Award;
          const prog = progress[b.id];
          return (
            <motion.div
              key={b.id}
              ref={(el) => {
                tileRefs.current[b.id] = el;
              }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 24 }}
            >
              <Wiggle strength={earned ? 1 : 0.5}>
                <div
                  title={b.desc}
                  className={cn(
                    "flex h-full flex-col items-center gap-1.5 rounded-lg border px-2.5 py-3 text-center transition-colors",
                    earned
                      ? "border-amber-400/40 bg-gradient-to-b from-amber-400/[0.10] to-transparent"
                      : "border-dashed border-zinc-800 bg-zinc-900/30",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border",
                      earned
                        ? "border-amber-300/60 bg-amber-400/15 text-amber-300"
                        : "border-zinc-700 bg-zinc-900 text-zinc-600",
                    )}
                  >
                    {earned ? <Icon className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
                  </span>
                  <p className={cn("text-[11px] font-semibold leading-tight", earned ? "text-amber-200" : "text-zinc-500")}>
                    {b.title}
                  </p>
                  {earned ? (
                    <p className="font-mono text-[9px] text-zinc-500">{dayLabel(ts!)}</p>
                  ) : (
                    <p className="w-full text-[9px] leading-tight text-zinc-600">
                      {prog.need > 1 ? (
                        <>
                          <span className="tnum text-zinc-400">
                            {prog.have}/{prog.need}
                          </span>{" "}
                          {prog.unit}
                          <span className="mt-1 block h-[3px] w-full overflow-hidden rounded-full bg-zinc-800">
                            <span
                              className="block h-full bg-amber-400/50"
                              style={{ width: `${(prog.have / prog.need) * 100}%` }}
                            />
                          </span>
                        </>
                      ) : (
                        b.desc
                      )}
                    </p>
                  )}
                </div>
              </Wiggle>
            </motion.div>
          );
        })}
      </div>
      <p className="mt-3 text-[10px] text-zinc-600">hover a badge for a wiggle — locked ones show how close you are</p>
    </div>
  );
}
