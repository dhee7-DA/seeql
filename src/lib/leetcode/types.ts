// The Big 300 — types. Every LeetCode classic the registry tracks, plus the
// deep-dive report format. All statements are ORIGINAL PARAPHRASES written
// for this app (never scraped text); company tags are community-sourced
// interview-report knowledge, not LeetCode premium data.

import type { CellValue } from "@/lib/sql-types";

export type LcDifficulty = "Easy" | "Medium" | "Hard";

/** One registry row — metadata only (the deep-dive lives separately). */
export interface LcRef {
  num: number;
  slug: string;
  title: string;
  difficulty: LcDifficulty;
  /** Primary topic (plus any secondary, pipe-split in source data). */
  topics: string[];
  /** Canonical lists this problem appears on. */
  lists: string[];
  /** Top 3 companies that ask it, most-asked first (community-sourced). */
  companies: string[];
  /** Freely viewable on leetcode.com (false = premium-only). */
  free: boolean;
  /** SQL problem — graded in the in-app sandbox (phase 2 wiring). */
  sql: boolean;
}

/** Where a problem is curated: the four canonical lists + our extras. */
export const LISTS = ["NeetCode 150", "Blind 75", "Top Interview 150", "SQL 50", "Big 300 extras"] as const;
export type LcList = (typeof LISTS)[number];

export interface LcExample {
  input: string;
  output: string;
  explanation?: string;
}

/** One rung of the logic-building ladder (brute force → pattern → optimal). */
export interface LcRung {
  title: string;
  body: string;
}

/** A test case for the Python solution harness (JSON-native args). */
export interface LcVerifyCase {
  args: unknown[];
  expect: unknown;
}

/** How the harness wraps args / unwraps results for special signatures. */
export type LcWrap =
  | "plain" // args are JSON-native, result compared directly
  | "matrix" // plain, but documents that args contain 2-D boards
  | "listnode" // arg0 array → ListNode chain; result ListNode → array
  | "listnodeTwo" // arg0+arg1 arrays → two chains; result → array
  | "listnodeCycle" // arg0 array + arg1 pos → cycled chain; expect bool
  | "listnodeIdx" // arg0 array + arg1 n → chain; result → array
  | "listnodeInPlace" // arg0 array → chain; fn mutates; result → traversed chain
  | "codec" // round-trip: expect decode(encode(arg0)) === arg0
  | "class"; // arg0 = [[op, arg?], …]; results of non-void ops compared

/** Normalizer applied before comparison (for order-insensitive outputs). */
export type LcNormalize = "none" | "sortGroups" | "sortFlat";

export interface LcVerify {
  /** Function name(s) defined by the code (codec = encode + decode). */
  fn: string;
  wrap: LcWrap;
  normalize?: LcNormalize;
  cases: LcVerifyCase[];
}

/** The full deep-dive report for one problem. */
export interface LcDeepDive {
  slug: string;
  statement: string;
  examples: LcExample[];
  constraints: string[];
  /** What the problem is REALLY asking + naive missteps. */
  breakdown: string[];
  /** Traps and edge cases worth naming before coding. */
  edges: string[];
  /** 3 rungs: brute force → the pattern → the optimal idea. */
  ladder: LcRung[];
  /** Name of the optimal approach. */
  approach: string;
  /** Python 3 solution, commented. */
  code: string;
  /** One paragraph per logical chunk of the code. */
  walkthrough: string[];
  time: string;
  space: string;
  followUps?: string[];
  related?: string[];
  verify: LcVerify;
  /** XP for a first honest solve: Easy 10 / Medium 20 / Hard 35. */
  xp: number;
}

export const LC_XP: Record<LcDifficulty, number> = { Easy: 10, Medium: 20, Hard: 35 };

/** Ledger key for a solved problem in the shared progress store. */
export const lcSolveKey = (slug: string) => `lc:${slug}`;

/* ------------------------------------------------------------------ */
/* SQL 50 deep-dives — solved in the in-app SQLite sandbox             */
/* ------------------------------------------------------------------ */

/** Per-problem schema: exact LeetCode-style tables, loaded into a sandboxed
 *  transaction for every run (created, seeded, queried, rolled back). */
export interface LcSqlSchema {
  /** CREATE TABLE statements (SQLite dialect), semicolon-terminated. */
  ddl: string;
  /** INSERT statements loading the sample data, semicolon-terminated. */
  seed: string;
  /** Optional one-line-per-table notes shown next to the DDL. */
  tables?: Array<{ name: string; note: string }>;
}

/** What a SQL problem's solution returns on its seed data (snapshot). */
export interface LcSqlExpected {
  slug: string;
  columns: string[];
  rows: CellValue[][];
  /** exact = row order graded (ORDER BY is the point); any = compared as a set. */
  order: "exact" | "any";
}

/** Section-level STUDY GUIDE — the detailed learning material shown under a
 *  section header: a real-life walkthrough of the domain, a premium flow
 *  diagram (keyed into the art library) and the suggested reading order. */
export interface LcSectionStudy {
  /** 2-3 paragraphs teaching the domain from zero — start here. */
  intro: string[];
  /** Key into the study-flow art library (lc-df-art). Optional — text-only
   *  study guides (the SQL 50 band) render without flow art. */
  flow?: string;
  /** Suggested solving order with the WHY of each stop. */
  path: Array<{ slug: string; why: string }>;
}

/* ------------------------------------------------------------------ */
/* Domain primers — the concept taught from zero, before the SQL        */
/* ------------------------------------------------------------------ */

/** One glossary entry — jargon defined in one line. */
export interface LcPrimerTerm {
  term: string;
  def: string;
}

/** A per-problem CONCEPT PRIMER — for learners meeting the domain for the
 *  first time. Renders as the first teaching panel (before the breakdown):
 *  what the concept is in real life, a tiny example walked by hand, the
 *  jargon defined, and where interviews actually use it. */
export interface LcPrimer {
  /** One-sentence real-life pitch — "why this number exists". */
  hook: string;
  /** 3-4 paragraphs teaching the concept from zero, no unexplained jargon. */
  concept: string[];
  /** 3-5 steps working a tiny example by hand (before any SQL). */
  worked: string[];
  /** 4-6 domain terms defined in one line each. */
  glossary: LcPrimerTerm[];
  /** 2-3 paragraphs: how this plays out at a real company — who runs it,
   *  what breaks, what decisions the numbers drive. */
  reallife: string[];
  /** Which roles / companies ask this — one sentence. */
  where: string;
}

/** Deep-dive for a SQL problem — same teaching shape, SQL solution. */
export interface LcSqlDive {
  slug: string;
  statement: string;
  examples: LcExample[];
  constraints: string[];
  /** Optional domain primer — concept from zero (Data & Finance track). */
  primer?: LcPrimer;
  breakdown: string[];
  edges: string[];
  ladder: LcRung[];
  approach: string;
  schema: LcSqlSchema;
  /** SQLite solution — exactly ONE statement (CTEs welcome), commented. */
  code: string;
  /** For write problems (DELETE/UPDATE): the SELECT that grades the result. */
  writeVerify?: string;
  /** exact = row order graded (ORDER BY is the point); any = compared as a set. */
  order: "exact" | "any";
  walkthrough: string[];
  time: string;
  space: string;
  followUps?: string[];
  related?: string[];
  xp: number;
}
