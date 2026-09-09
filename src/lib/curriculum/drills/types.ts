// Keyword Drill bank — per-keyword MCQ collections that cover every aspect
// of a keyword: syntax, semantics, edge cases, error reading, output
// prediction on the live storefront db, and judgment (when NOT to use it).
// Client-safe types only; the UI (DrillYard) runs rounds of 10 through the
// same McqCard + idempotent XP ledger as lesson quizzes.

/** The six angles every keyword is drilled from. */
export type DrillAspect =
  | "syntax"     // grammar, clause order, valid forms
  | "semantics"  // what the keyword actually does to rows
  | "edge"       // NULLs, empty sets, ties, boundaries
  | "errors"     // reading and fixing failures
  | "predict"    // engine-verified output on the storefront db
  | "judgment";  // when to use it — and when not

/** Coverage tier from the approved M1–M5 plan. */
export type DrillTier = "core" | "secondary" | "utility";

export interface DrillQ {
  /** Stable id, e.g. "dr1-wh-07" — module 1, keyword abbrev, question number.
   *  Referenced by the XP ledger (mcq:<id> / mcqfirst:<id>). */
  id: string;
  keyword: string;
  tier: DrillTier;
  aspect: DrillAspect;
  prompt: string;
  choices: string[];
  /** Index of the correct choice. */
  answer: number;
  /** Shown after answering, right or wrong. */
  why: string;
  /** Coached explanation for the most tempting wrong choice(s). */
  notes?: Array<{ choice: number; why: string }>;
}

export interface DrillSet {
  /** SQL keyword or family, e.g. "WHERE", "ORDER BY + LIMIT". */
  keyword: string;
  /** Short card label, e.g. "WHERE". */
  label: string;
  /** Curriculum module this set belongs to. */
  module: number;
  tier: DrillTier;
  /** One-line description shown on the picker card. */
  blurb: string;
  questions: DrillQ[];
}

/** Aspect metadata for badges and session subtitles. */
export const ASPECT_LABELS: Record<DrillAspect, string> = {
  syntax: "syntax",
  semantics: "semantics",
  edge: "edge case",
  errors: "read the error",
  predict: "predict the output",
  judgment: "judgment",
};
