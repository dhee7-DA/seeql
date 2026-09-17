"use client";

// Milestone watcher — turns progress deltas into celebration moments.
// One brain, two mounts: LearnApp uses the returned values for its sidebar,
// and the playground mounts <MilestoneWatcher /> so wins earned there
// (missions, XP) celebrate on the spot instead of silently in the ledger.
//
// Moments it owns:
//   badge unlock     → toast + spark burst near the toast stack
//   level up         → toast + big celebrate burst top-center
//   daily goal hit   → toast + spark burst top-center
//   module complete  → toast (the lesson's own burst already fired)

import { useEffect, useMemo, useRef } from "react";
import { LESSONS, MODULES } from "@/lib/curriculum/lessons";
import { useProgress } from "@/lib/curriculum/progress";
import { BADGES, currentStreak, dayKey, levelFor, totalXp } from "@/lib/curriculum/gamification";
import { celebrate } from "./celebrate";
import { flutterBurst } from "./flutter";

function completeModules(xpEvents: Record<string, unknown>): Set<number> {
  const set = new Set<number>();
  for (const m of MODULES) {
    if (m.lessons.every((l) => xpEvents[`lesson:${l.id}`] !== undefined)) set.add(m.num);
  }
  return set;
}

export function useMilestoneWatcher() {
  const xpEvents = useProgress((s) => s.xpEvents);
  const mcqAttempts = useProgress((s) => s.mcqAttempts);
  const xpByDay = useProgress((s) => s.xpByDay);
  const dailyGoal = useProgress((s) => s.dailyGoal);
  const prevLevel = useRef(-1);
  const prevGoal = useRef(false);
  const prevModules = useRef<Set<number> | null>(null);
  const ready = useRef(false);

  const xp = useMemo(() => totalXp({ xpEvents }), [xpEvents]);
  const level = levelFor(xp);
  const streak = useMemo(() => currentStreak({ xpByDay, dailyGoal }), [xpByDay, dailyGoal]);
  const goalHit = (xpByDay[dayKey()] ?? 0) >= dailyGoal;

  const ctx = useMemo(() => {
    const problemsSolved = Object.keys(xpEvents).filter((k) => k.startsWith("solve:")).length;
    const mcqsCorrect = Object.values(mcqAttempts).filter((a) => a.correct).length;
    const lessonsDone = Object.keys(xpEvents).filter((k) => k.startsWith("lesson:")).length;
    const perfectQuizzes = LESSONS.filter((l) => l.mcqs.every((m) => mcqAttempts[m.id]?.firstTry)).length;
    return { lessonsDone, problemsSolved, mcqsCorrect, perfectQuizzes };
  }, [xpEvents, mcqAttempts]);

  useEffect(() => {
    if (!ready.current) {
      ready.current = true;
      prevLevel.current = level.index;
      prevGoal.current = goalHit;
      prevModules.current = completeModules(xpEvents);
      return;
    }
    const store = useProgress.getState();
    const badges = store.badges;

    for (const b of BADGES) {
      if (badges[b.id] === undefined && b.test(ctx, xp, streak)) {
        if (store.unlockBadge(b.id)) {
          celebrate({ kind: "badge", title: `Badge · ${b.title}`, sub: b.desc });
          // spark right where the toast lands, so the reward feels physical
          flutterBurst("spark", window.innerWidth - 150, window.innerHeight - 70);
        }
      }
    }

    if (level.index > prevLevel.current) {
      celebrate({ kind: "level", title: `Level up — ${level.title}`, sub: `Rank ${level.index + 1} of 6` });
      flutterBurst("celebrate", window.innerWidth / 2, 130);
      prevLevel.current = level.index;
    }

    if (goalHit && !prevGoal.current) {
      celebrate({ kind: "xp", title: "Daily goal hit — streak safe", sub: `${dailyGoal} XP earned today` });
      flutterBurst("spark", window.innerWidth / 2, 130);
    }
    prevGoal.current = goalHit;

    const done = completeModules(xpEvents);
    const before = prevModules.current;
    if (before) {
      for (const m of MODULES) {
        if (done.has(m.num) && !before.has(m.num)) {
          celebrate({ kind: "level", title: `Module ${m.num} complete`, sub: m.title });
        }
      }
    }
    prevModules.current = done;
  }, [ctx, xp, streak, level, goalHit, xpEvents, dailyGoal]);

  return { xp, level, streak, ctx };
}

/** Null component for mounts that only want the moments (playground). */
export function MilestoneWatcher() {
  useMilestoneWatcher();
  return null;
}
