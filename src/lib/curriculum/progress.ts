"use client";

// Progress store — persisted to localStorage under the SAME key as the
// original build ("sql-visualizer-learn-v1"), so returning learners keep
// their XP. The xpEvents ledger is idempotent: every award has a stable
// key (mcq:l3-q2, solve:l8-p4, lesson:lesson-02 …) and re-awarding is a
// no-op. xpByDay buckets XP per local day to drive the streak + goal ring.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dayKey } from "./gamification";

export interface ProgressState {
  xpEvents: Record<string, number>;
  xpByDay: Record<string, number>;
  dailyGoal: number;
  badges: Record<string, number>;
  mcqAttempts: Record<string, { correct: boolean; firstTry: boolean }>;
  lessonsDone: Record<string, number>;
  awardXp: (key: string, amount: number) => boolean;
  recordMcqCheck: (id: string, correct: boolean) => boolean;
  markLessonDone: (id: string) => boolean;
  setDailyGoal: (n: number) => void;
  unlockBadge: (id: string) => boolean;
  resetAll: () => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      xpEvents: {},
      xpByDay: {},
      dailyGoal: 60,
      badges: {},
      mcqAttempts: {},
      lessonsDone: {},

      awardXp: (key, amount) => {
        if (get().xpEvents[key] !== undefined) return false;
        set((s) => ({
          xpEvents: { ...s.xpEvents, [key]: amount },
          xpByDay: { ...s.xpByDay, [dayKey()]: (s.xpByDay[dayKey()] ?? 0) + amount },
        }));
        return true;
      },

      recordMcqCheck: (id, correct) => {
        const prev = get().mcqAttempts[id];
        if (prev) return false;
        set((s) => ({
          mcqAttempts: { ...s.mcqAttempts, [id]: { correct, firstTry: correct } },
        }));
        return true;
      },

      markLessonDone: (id) => {
        if (get().lessonsDone[id] !== undefined) return false;
        set((s) => ({ lessonsDone: { ...s.lessonsDone, [id]: Date.now() } }));
        return true;
      },

      setDailyGoal: (n) => set({ dailyGoal: n }),

      unlockBadge: (id) => {
        if (get().badges[id] !== undefined) return false;
        set((s) => ({ badges: { ...s.badges, [id]: Date.now() } }));
        return true;
      },

      resetAll: () =>
        set({
          xpEvents: {},
          xpByDay: {},
          dailyGoal: 60,
          badges: {},
          mcqAttempts: {},
          lessonsDone: {},
        }),
    }),
    { name: "sql-visualizer-learn-v1" },
  ),
);
