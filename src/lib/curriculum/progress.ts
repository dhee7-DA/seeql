"use client";

// Progress store — persisted to localStorage under the SAME key as the
// original build ("sql-visualizer-learn-v1"), so returning learners keep
// their XP. The xpEvents ledger is idempotent: every award has a stable
// key (mcq:l3-q2, solve:l8-p4, lesson:lesson-02 …) and re-awarding is a
// no-op. xpByDay buckets XP per local day to drive the streak + goal ring.
//
// Practice-lab layer (predict / clinic / golf / interview / studio /
// explain): skillAttempts tallies per-SQL-skill right/wrong counts — the
// raw signal behind the Mastery Map. reviewSchedule is the spaced
// repetition ledger: any graded item can schedule itself for resurfacing
// at 1d → 3d → 7d → 14d after a correct answer, 1d after a wrong one.
// questDone tracks which day's adaptive quest was completed.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dayKey } from "./gamification";

export interface SkillTally {
  /** correct answers */
  c: number;
  /** wrong answers */
  w: number;
}

export interface ReviewCard {
  /** epoch ms when the card should resurface */
  due: number;
  /** index into REVIEW_INTERVALS — how many successes in a row so far */
  step: number;
  /** how many times the item was answered wrong since the last success */
  lapses: number;
}

export interface ProgressState {
  xpEvents: Record<string, number>;
  xpByDay: Record<string, number>;
  dailyGoal: number;
  badges: Record<string, number>;
  mcqAttempts: Record<string, { correct: boolean; firstTry: boolean }>;
  lessonsDone: Record<string, number>;
  /** skill id → right/wrong tally across every practice-lab format */
  skillAttempts: Record<string, SkillTally>;
  /** ledger key (e.g. "mcq:l3-q2", "predict:p1") → spaced-repetition card */
  reviewSchedule: Record<string, ReviewCard>;
  /** dayKey → timestamp the adaptive quest was cleared */
  questDone: Record<string, number>;
  awardXp: (key: string, amount: number) => boolean;
  recordMcqCheck: (id: string, correct: boolean) => boolean;
  markLessonDone: (id: string) => boolean;
  setDailyGoal: (n: number) => void;
  unlockBadge: (id: string) => boolean;
  /** tally a practice-lab answer into the skill ledger */
  recordSkill: (skill: string, correct: boolean) => void;
  /** spaced repetition: correct advances 1d→3d→7d→14d, wrong resets to 1d */
  scheduleReview: (key: string, correct: boolean) => void;
  /** clear a review card (answered right on a resurfaced visit) */
  clearReview: (key: string) => void;
  markQuestDone: () => boolean;
  resetAll: () => void;
}

/** Spaced-repetition ladder in ms: 1d → 3d → 7d → 14d (then it graduates). */
export const REVIEW_INTERVALS = [1, 3, 7, 14].map((d) => d * 86_400_000);

/** Cards due for resurfacing right now. */
export function dueReviews(
  schedule: Record<string, ReviewCard>,
  now = Date.now(),
): Array<{ key: string } & ReviewCard> {
  return Object.entries(schedule)
    .filter(([, card]) => card.due <= now)
    .map(([key, card]) => ({ key, ...card }))
    .sort((a, b) => a.due - b.due);
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
      skillAttempts: {},
      reviewSchedule: {},
      questDone: {},

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

      recordSkill: (skill, correct) => {
        const prev = get().skillAttempts[skill] ?? { c: 0, w: 0 };
        set((s) => ({
          skillAttempts: {
            ...s.skillAttempts,
            [skill]: correct ? { ...prev, c: prev.c + 1 } : { ...prev, w: prev.w + 1 },
          },
        }));
      },

      scheduleReview: (key, correct) => {
        const prev = get().reviewSchedule[key];
        if (correct) {
          const step = Math.min((prev?.step ?? -1) + 1, REVIEW_INTERVALS.length);
          // graduating past the last interval clears the card entirely
          if (step >= REVIEW_INTERVALS.length) {
            set((s) => {
              const next = { ...s.reviewSchedule };
              delete next[key];
              return { reviewSchedule: next };
            });
            return;
          }
          set((s) => ({
            reviewSchedule: {
              ...s.reviewSchedule,
              [key]: { due: Date.now() + REVIEW_INTERVALS[step], step, lapses: prev?.lapses ?? 0 },
            },
          }));
        } else {
          set((s) => ({
            reviewSchedule: {
              ...s.reviewSchedule,
              [key]: { due: Date.now() + REVIEW_INTERVALS[0], step: -1, lapses: (prev?.lapses ?? 0) + 1 },
            },
          }));
        }
      },

      clearReview: (key) => {
        set((s) => {
          const next = { ...s.reviewSchedule };
          delete next[key];
          return { reviewSchedule: next };
        });
      },

      markQuestDone: () => {
        const k = dayKey();
        if (get().questDone[k] !== undefined) return false;
        set((s) => ({ questDone: { ...s.questDone, [k]: Date.now() } }));
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
          skillAttempts: {},
          reviewSchedule: {},
          questDone: {},
        }),
    }),
    { name: "sql-visualizer-learn-v1" },
  ),
);
