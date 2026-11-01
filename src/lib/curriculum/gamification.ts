// XP economy, career ladder, daily goals and badges.
// Pure functions + constants — no React, no storage.

import type { ProgressState } from "./progress";

export const XP = {
  mcq: 5,
  mcqFirstBonus: 3,
  fill: 8,
  fillFirstBonus: 4,
  examPass: 60,
  lessonBonus: 50,
  // universe layer — completion bonuses only: the timed screen itself stays
  // XP-free while it runs (you against the clock), then banks on the report.
  mock: 25,
  mockStrongBonus: 15,
  theory: 4,
  theoryHalf: 2,
  domainQuiz: 10,
} as const;

export type Difficulty = "easy" | "medium" | "hard";

export function xpForDifficulty(d: Difficulty): number {
  return d === "easy" ? 5 : d === "medium" ? 10 : 20;
}

/** Star string for a difficulty, e.g. medium → "★★☆". */
export function starsFor(d: Difficulty): string {
  return d === "easy" ? "★☆☆" : d === "medium" ? "★★☆" : "★★★";
}

/** Longest calendar run of days that ever met the daily goal. */
export function bestStreak(
  state: Pick<ProgressState, "xpByDay" | "dailyGoal">,
): number {
  const met = Object.keys(state.xpByDay)
    .filter((k) => (state.xpByDay[k] ?? 0) >= state.dailyGoal)
    .sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of met) {
    const [y, m, d] = k.split("-").map(Number);
    const day = new Date(y, m - 1, d);
    const consecutive =
      prev !== null && day.getTime() - prev.getTime() === 86_400_000;
    run = consecutive ? run + 1 : 1;
    if (run > best) best = run;
    prev = day;
  }
  return best;
}

export interface LevelInfo {
  index: number;
  title: string;
  base: number;
  next: number | null;
  /** 0..1 progress to next rank (1 at max). */
  pct: number;
}

export const LEVELS: Array<{ title: string; base: number }> = [
  { title: "Data Novice", base: 0 },
  { title: "Query Apprentice", base: 400 },
  { title: "Analyst I", base: 1000 },
  { title: "Analyst II", base: 1800 },
  { title: "Senior Analyst", base: 2800 },
  { title: "Query Wizard", base: 4000 },
];

export function totalXp(state: Pick<ProgressState, "xpEvents">): number {
  let sum = 0;
  for (const k in state.xpEvents) sum += state.xpEvents[k];
  return sum;
}

export function levelFor(xp: number): LevelInfo {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].base) idx = i;
  const cur = LEVELS[idx];
  const next = idx + 1 < LEVELS.length ? LEVELS[idx + 1].base : null;
  const pct =
    next === null ? 1 : Math.min(1, Math.max(0, (xp - cur.base) / (next - cur.base)));
  return { index: idx, title: cur.title, base: cur.base, next, pct };
}

export const DAILY_GOALS = [30, 60, 100];

/** Local calendar day key, e.g. "2026-08-30". */
export function dayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Consecutive days (ending today or yesterday) that met the daily goal. */
export function currentStreak(
  state: Pick<ProgressState, "xpByDay" | "dailyGoal">,
): number {
  let streak = 0;
  const d = new Date();
  // Today not yet at goal doesn't break the streak — it's still in progress.
  if ((state.xpByDay[dayKey(d)] ?? 0) < state.dailyGoal) d.setDate(d.getDate() - 1);
  while ((state.xpByDay[dayKey(d)] ?? 0) >= state.dailyGoal) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export interface BadgeCtx {
  lessonsDone: number;
  problemsSolved: number;
  mcqsCorrect: number;
  perfectQuizzes: number;
  /** lifetime count of daily puzzles solved */
  puzzlesDone: number;
  /** current puzzle streak incl. freeze-bridged days */
  puzzleStreak: number;
  /** how many calendar months had every day solved */
  perfectMonths: number;
  // universe layer (mock screens, theory, targeting)
  /** completed mock screens (per-kit + omni) */
  mocks: number;
  /** best overall % across all completed mocks */
  mockBestPct: number;
  /** a company is currently targeted */
  targetSet: boolean;
  /** kit MCQs answered correct (kit tab + mock runs combined, deduped) */
  universeCorrect: number;
  // LeetCode band (verified + self-claimed solves on the lc: ledgers)
  /** distinct problems solved (verified + self-claimed) */
  lcSolved: number;
  /** verified in the sandbox / code lab only */
  lcVerified: number;
  /** verified HARD problems — the red dots that count */
  lcHardVerified: number;
  /** official SQL 50 study-list problems solved */
  lcSql50Solved: number;
  /** SQL skill sections with every problem solved */
  lcSectionsCleared: number;
  /** the whole Data & Finance band cleared */
  lcDatafinCleared: boolean;
}

export interface Badge {
  id: string;
  title: string;
  desc: string;
  test: (ctx: BadgeCtx, xp: number, streak: number) => boolean;
}

export const BADGES: Badge[] = [
  {
    id: "first-xp",
    title: "First Steps",
    desc: "Earn your first XP",
    test: (_c, xp) => xp > 0,
  },
  {
    id: "solver",
    title: "Problem Solver",
    desc: "Solve your first graded query",
    test: (c) => c.problemsSolved >= 1,
  },
  {
    id: "five-solved",
    title: "Getting Serious",
    desc: "Solve 5 graded queries",
    test: (c) => c.problemsSolved >= 5,
  },
  {
    id: "flawless",
    title: "Flawless",
    desc: "Finish a lesson quiz with every answer right",
    test: (c) => c.perfectQuizzes >= 1,
  },
  {
    id: "apprentice",
    title: "Apprentice",
    desc: "Reach Query Apprentice (400 XP)",
    test: (_c, xp) => xp >= 400,
  },
  {
    id: "streak-3",
    title: "Habit Forming",
    desc: "Hit your daily goal 3 days in a row",
    test: (_c, _xp, streak) => streak >= 3,
  },
  {
    id: "halfway",
    title: "Halfway There",
    desc: "Complete 4 lessons",
    test: (c) => c.lessonsDone >= 4,
  },
  {
    id: "analyst",
    title: "Analyst",
    desc: "Reach Analyst I (1,000 XP)",
    test: (_c, xp) => xp >= 1000,
  },
  {
    id: "puzzle-1",
    title: "Daily Grind",
    desc: "Solve your first daily puzzle",
    test: (c) => c.puzzlesDone >= 1,
  },
  {
    id: "puzzle-7",
    title: "Sealed Week",
    desc: "Solve the daily puzzle 7 days in a row",
    test: (c) => c.puzzleStreak >= 7,
  },
  {
    id: "puzzle-30",
    title: "Calendar Keeper",
    desc: "Solve 30 daily puzzles (lifetime)",
    test: (c) => c.puzzlesDone >= 30,
  },
  {
    id: "month-perfect",
    title: "Perfect Month",
    desc: "Solve every daily puzzle in a calendar month",
    test: (c) => c.perfectMonths >= 1,
  },
  // universe badges — the 208-company layer
  {
    id: "first-mock",
    title: "Screen Rookie",
    desc: "Finish your first company mock screen",
    test: (c) => c.mocks >= 1,
  },
  {
    id: "mock-5",
    title: "Mock Veteran",
    desc: "Finish 5 mock screens",
    test: (c) => c.mocks >= 5,
  },
  {
    id: "mock-70",
    title: "Hiring Signal",
    desc: "Score 70%+ on a mock screen",
    test: (c) => c.mockBestPct >= 70,
  },
  {
    id: "targeted",
    title: "Locked In",
    desc: "Target a company and start its readiness track",
    test: (c) => c.targetSet,
  },
  {
    id: "universe-100",
    title: "Universe 100",
    desc: "Answer 100 universe MCQs correctly",
    test: (c) => c.universeCorrect >= 100,
  },
  // LeetCode band — verified solves pay full XP, self-claims pay half;
  // every badge below counts the honest ledger the same way
  {
    id: "lc-first-blood",
    title: "First Blood",
    desc: "Solve your first LeetCode problem",
    test: (c) => c.lcSolved >= 1,
  },
  {
    id: "lc-sql-50",
    title: "SQL 50 Club",
    desc: "Solve the entire official SQL 50 study list",
    test: (c) => c.lcSql50Solved >= 50,
  },
  {
    id: "lc-25",
    title: "Board Regular",
    desc: "Solve 25 LeetCode problems",
    test: (c) => c.lcSolved >= 25,
  },
  {
    id: "lc-100",
    title: "Century Board",
    desc: "Solve 100 LeetCode problems",
    test: (c) => c.lcSolved >= 100,
  },
  {
    id: "lc-section-sweeper",
    title: "Section Sweeper",
    desc: "Clear every problem in one SQL skill section",
    test: (c) => c.lcSectionsCleared >= 1,
  },
  {
    id: "lc-datafin",
    title: "DataFin Finisher",
    desc: "Clear the whole Data & Finance band",
    test: (c) => c.lcDatafinCleared,
  },
  {
    id: "lc-hard-10",
    title: "Red Climber",
    desc: "Verify 10 Hard problems in the sandbox",
    test: (c) => c.lcHardVerified >= 10,
  },
  {
    id: "lc-show-your-work",
    title: "Show Your Work",
    desc: "25 verified solves — graded, not claimed",
    test: (c) => c.lcVerified >= 25,
  },
];
