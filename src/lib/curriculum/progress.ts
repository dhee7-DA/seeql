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
// puzzleDone tracks which day's daily puzzle was solved (the calendar),
// and freezes counts streak-freeze tokens: earned at every natural 7-day
// puzzle milestone (max 2 held), consumed to bridge missed days — the
// bridging itself is DERIVED at read time by puzzleStreak() in daily.ts.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dayKey } from "./gamification";
import { dayKeyOf } from "./daily";

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

/** Leitner card for the review deck: a miss drops to box 0 (due in 10
 *  minutes), a recall promotes one box. Box intervals are BOX_MS below;
 *  box MAX_BOX (the 16-day interval) is "graduated". */
export interface LeitnerCard {
  due: number;
  box: number;
}

/** Exam ledger per module: attempts, best score, and when it was passed. */
export interface ExamRecord {
  attempts: number;
  best: number;
  total: number;
  passedAt?: number;
}

/** One finished LeetCode contest run (Timed SQL tab) — the personal-best
 *  ledger. Solved/total plus wall time; perfect sweeps pay a daily bonus
 *  under `lc-contest:<dayKey>` (banked by the contest view, not here). */
export interface LcContestRun {
  id: string;
  at: number;
  label: string;
  solved: number;
  total: number;
  durationSec: number;
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
  /** question/fill id → Leitner card in the review deck (misses land here) */
  review: Record<string, LeitnerCard>;
  /** lifetime recall / miss counts inside review-deck sessions */
  reviewCorrect: number;
  reviewWrong: number;
  /** moduleId → exam history (attempts, best, pass) */
  exams: Record<string, ExamRecord>;
  /** mcq id → true once answered correctly (drives quiz score dots) */
  mcqBest: Record<string, boolean>;
  /** dayKey → timestamp the adaptive quest was cleared */
  questDone: Record<string, number>;
  /** dayKey → timestamp the daily puzzle was solved (today's ledger — this
   *  one builds the streak; backlog solves go to backlogDone) */
  puzzleDone: Record<string, number>;
  /** dayKey → timestamp a BACKLOG (past-month) puzzle was solved — no
   *  streak credit, but the calendar and Perfect-Month math count it */
  backlogDone: Record<string, number>;
  /** streak-freeze tokens held (earned at 7-day puzzle milestones, cap 2) */
  freezes: number;
  /** weekly XP target (null = not set) — read by the overview weekly-goal
   *  picker; setting it pays no XP of its own */
  weeklyGoalXp: number | null;
  /** finished contest runs (cap 20) — personal-best source for the LC band */
  lcContests: LcContestRun[];
  /** dayKey → timestamp today's LC Daily Challenge was verified-solved
   *  (self-claims don't count — the daily is a verified-only streak) */
  lcDailyDone: Record<string, number>;
  awardXp: (key: string, amount: number) => boolean;
  recordMcqCheck: (id: string, correct: boolean) => boolean;
  markLessonDone: (id: string) => boolean;
  setDailyGoal: (n: number) => void;
  /** set the weekly XP target (null clears it) — pure preference, no rewards */
  setWeeklyGoalXp: (n: number | null) => void;
  unlockBadge: (id: string) => boolean;
  /** tally a practice-lab answer into the skill ledger */
  recordSkill: (skill: string, correct: boolean) => void;
  /** spaced repetition: correct advances 1d→3d→7d→14d, wrong resets to 1d */
  scheduleReview: (key: string, correct: boolean) => void;
  /** review deck: a miss anywhere enrolls the item at box 0 (due 10 min) */
  recordMiss: (id: string) => void;
  /** review deck: a recalled card promotes one box and reschedules */
  recordRecall: (id: string) => void;
  /** record a module exam attempt (score, total, pass) */
  recordExam: (moduleId: string, score: number, total: number, pass: boolean) => void;
  /** clear a review card (answered right on a resurfaced visit) */
  clearReview: (key: string) => void;
  markQuestDone: () => boolean;
  /** mark today's puzzle solved (idempotent); pays a freeze token at each
   *  natural 7-day milestone while under the 2-token cap */
  markPuzzleDone: () => { ok: boolean; freezeEarned: boolean };
  /** mark a backlog day solved (idempotent, no streak side effects) */
  markBacklogDone: (day: string) => boolean;
  /** bank a finished contest run (idempotent by run id, newest first, cap 20) */
  saveContest: (run: LcContestRun) => void;
  /** mark today's LC Daily Challenge solved (idempotent) */
  markLcDailyDone: () => boolean;
  resetAll: () => void;
}

/** Spaced-repetition ladder in ms: 1d → 3d → 7d → 14d (then it graduates). */
export const REVIEW_INTERVALS = [1, 3, 7, 14].map((d) => d * 86_400_000);

/** Leitner ladder in ms, indexed by box: 10min → 1d → 2d → 4d → 8d → 16d. */
export const BOX_MS = [10 * 60_000, 1, 2, 4, 8, 16].map((d) => d * 86_400_000);

/** Highest Leitner box — reaching it means the card reads "graduated". */
export const MAX_BOX = BOX_MS.length - 1;

/** Was this MCQ ever answered correctly (first attempt wins)? */
export function mcqPassed(state: Pick<ProgressState, "mcqAttempts">, id: string): boolean {
  return state.mcqAttempts[id]?.correct === true;
}

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
      review: {},
      reviewCorrect: 0,
      reviewWrong: 0,
      exams: {},
      mcqBest: {},
      questDone: {},
      puzzleDone: {},
      backlogDone: {},
      freezes: 1,
      weeklyGoalXp: null,
      lcContests: [],
      lcDailyDone: {},

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
        if (prev) {
          // a later correct answer still upgrades the best-of ledger
          if (correct && !get().mcqBest[id]) {
            set((s) => ({ mcqBest: { ...s.mcqBest, [id]: true } }));
          }
          return false;
        }
        set((s) => ({
          mcqAttempts: { ...s.mcqAttempts, [id]: { correct, firstTry: correct } },
          mcqBest: correct ? { ...s.mcqBest, [id]: true } : s.mcqBest,
        }));
        return true;
      },

      markLessonDone: (id) => {
        if (get().lessonsDone[id] !== undefined) return false;
        set((s) => ({ lessonsDone: { ...s.lessonsDone, [id]: Date.now() } }));
        return true;
      },

      setDailyGoal: (n) => set({ dailyGoal: n }),

      setWeeklyGoalXp: (n) => set({ weeklyGoalXp: n }),

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

      recordMiss: (id) => {
        set((s) => ({
          review: { ...s.review, [id]: { due: Date.now() + BOX_MS[0], box: 0 } },
          reviewWrong: s.reviewWrong + 1,
        }));
      },

      recordRecall: (id) => {
        const prev = get().review[id];
        const box = Math.min((prev?.box ?? -1) + 1, MAX_BOX);
        set((s) => ({
          review: { ...s.review, [id]: { due: Date.now() + BOX_MS[box], box } },
          reviewCorrect: s.reviewCorrect + 1,
        }));
      },

      recordExam: (moduleId, score, total, pass) => {
        const prev = get().exams[moduleId];
        set((s) => ({
          exams: {
            ...s.exams,
            [moduleId]: {
              attempts: (prev?.attempts ?? 0) + 1,
              best: Math.max(prev?.best ?? 0, score),
              total,
              passedAt: pass ? (prev?.passedAt ?? Date.now()) : prev?.passedAt,
            },
          },
        }));
      },

      markQuestDone: () => {
        const k = dayKey();
        if (get().questDone[k] !== undefined) return false;
        set((s) => ({ questDone: { ...s.questDone, [k]: Date.now() } }));
        return true;
      },

      markPuzzleDone: () => {
        const k = dayKey();
        if (get().puzzleDone[k] !== undefined) return { ok: false, freezeEarned: false };
        // natural consecutive run of SOLVED days ending today (freezes
        // bridge gaps but don't build the earning run)
        const done = { ...get().puzzleDone, [k]: Date.now() };
        let run = 0;
        const d = new Date();
        while (done[dayKeyOf(d)] !== undefined) {
          run++;
          d.setDate(d.getDate() - 1);
        }
        const freezeEarned = run > 0 && run % 7 === 0 && get().freezes < 2;
        set((s) => ({
          puzzleDone: done,
          freezes: freezeEarned ? s.freezes + 1 : s.freezes,
        }));
        return { ok: true, freezeEarned };
      },

      markBacklogDone: (day) => {
        if (get().backlogDone[day] !== undefined) return false;
        set((s) => ({ backlogDone: { ...s.backlogDone, [day]: Date.now() } }));
        return true;
      },

      saveContest: (run) => {
        if (get().lcContests.some((r) => r.id === run.id)) return;
        set((s) => ({ lcContests: [run, ...(s.lcContests ?? [])].slice(0, 20) }));
      },

      markLcDailyDone: () => {
        const k = dayKey();
        if (get().lcDailyDone[k] !== undefined) return false;
        set((s) => ({ lcDailyDone: { ...s.lcDailyDone, [k]: Date.now() } }));
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
          review: {},
          reviewCorrect: 0,
          reviewWrong: 0,
          exams: {},
          mcqBest: {},
          questDone: {},
          puzzleDone: {},
          backlogDone: {},
          freezes: 1,
          weeklyGoalXp: null,
          lcContests: [],
          lcDailyDone: {},
        }),
    }),
    { name: "sql-visualizer-learn-v1" },
  ),
);
