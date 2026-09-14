// Case Files — rebuild-the-query scenarios (Modules 1–2).
// Module 1 topics (l1…l8, cap) stay single-table; Module 2 topics (j1…j8,
// lessons 9–16) are join queries over the same storefront db. A case is a
// memo from a stakeholder plus a broken-down query: figures and SQL keywords
// have been pulled out into numbered slots. The learner rebuilds the query
// from a chip bank (correct answers + distractors), gets per-slot coaching on
// wrong placements, and a full walkthrough when the query is restored. Every
// case is mechanically audited against the live seed db by
// scripts/case-audit.ts.

export type CaseSlotKind = "number" | "keyword";

/** Difficulty tier — deck filter axis alongside topic. */
export type CaseTier = "easy" | "medium" | "hard";

export interface CaseSlot {
  /** The exact chip text that belongs here. */
  answer: string;
  /** "number" → audited by presence in the query result; "keyword" → audited by distractor consequence. */
  kind: CaseSlotKind;
  /** Short human label used in coaching, e.g. "the status filter". */
  label: string;
  /** Coaching shown when a wrong chip sits here — explains why the right chip is right. */
  why: string;
  /**
   * Skip the mechanical value check for this slot (LIMIT/OFFSET constants,
   * threshold comparisons, date-filter literals — figures that legitimately
   * never appear in the result set). Audit caps these at 3 per case.
   */
  noVerify?: boolean;
}

export interface CaseStudy {
  /** Stable id cs-001… — XP ledger key `case:cs-001`. */
  id: string;
  /** Difficulty tier (easy = single-concept recall, medium = two-stage build, hard = full assembly + traps). */
  tier: CaseTier;
  /** Foundations toolkit: "l1"…"l8", or "cap" for the capstone mix. */
  topic: string;
  /** Business universe id — see CASE_UNIVERSES. */
  universe: string;
  title: string;
  /** Memo-style brief from the stakeholder (2–4 sentences, in-world). */
  brief: string;
  /** The one-line deliverable the analyst must produce. */
  ask: string;
  /** Completed query with {1}…{9} slot markers, each marker used exactly once. */
  template: string;
  slots: CaseSlot[];
  /** Decoy chips mixed into the bank (2–4). Every keyword-slot decoy must change the outcome. */
  distractors: string[];
  /** Full walkthrough shown after a correct rebuild (the "how an analyst thinks" layer). */
  walkthrough: string;
}

export interface CaseTopicMeta {
  id: string;
  label: string;
  lessonNum: number | null;
}

export const CASE_TOPICS: CaseTopicMeta[] = [
  { id: "l1", label: "Tables & keys", lessonNum: 1 },
  { id: "l2", label: "SELECT & FROM", lessonNum: 2 },
  { id: "l3", label: "WHERE filters", lessonNum: 3 },
  { id: "l4", label: "NULL handling", lessonNum: 4 },
  { id: "l5", label: "ORDER BY & LIMIT", lessonNum: 5 },
  { id: "l6", label: "DISTINCT", lessonNum: 6 },
  { id: "l7", label: "Aggregates", lessonNum: 7 },
  { id: "l8", label: "GROUP BY & HAVING", lessonNum: 8 },
  { id: "cap", label: "Capstone mix", lessonNum: null },
  // Module 2 — Joins & Relationships (lessons 9–16)
  { id: "j1", label: "Two tables", lessonNum: 9 },
  { id: "j2", label: "INNER JOIN", lessonNum: 10 },
  { id: "j3", label: "3-table chains", lessonNum: 11 },
  { id: "j4", label: "LEFT JOIN", lessonNum: 12 },
  { id: "j5", label: "Anti-join", lessonNum: 13 },
  { id: "j6", label: "Self-join", lessonNum: 14 },
  { id: "j7", label: "Joins + aggregates", lessonNum: 15 },
  { id: "j8", label: "Join capstone", lessonNum: 16 },
  // Module 3 — Set Operations & CASE (lessons 17–24)
  { id: "s1", label: "UNION stacks", lessonNum: 17 },
  { id: "s2", label: "Stacked reports", lessonNum: 18 },
  { id: "s3", label: "INTERSECT", lessonNum: 19 },
  { id: "s4", label: "EXCEPT", lessonNum: 20 },
  { id: "s5", label: "Set chains", lessonNum: 21 },
  { id: "s6", label: "CASE WHEN", lessonNum: 22 },
  { id: "s7", label: "CASE pivots", lessonNum: 23 },
  { id: "s8", label: "Set+CASE capstone", lessonNum: 24 },
  // Module 4 — Subqueries & CTEs (lessons 25–28 + 38)
  { id: "q1", label: "IN subqueries", lessonNum: 25 },
  { id: "q2", label: "Scalar subqueries", lessonNum: 25 },
  { id: "q3", label: "EXISTS tests", lessonNum: 26 },
  { id: "q4", label: "Correlated", lessonNum: 26 },
  { id: "q5", label: "Derived tables", lessonNum: 27 },
  { id: "q6", label: "CTEs", lessonNum: 28 },
  { id: "q7", label: "Recursive CTEs", lessonNum: 28 },
  { id: "q8", label: "Subquery capstone", lessonNum: 38 },
];

export interface CaseUniverseMeta {
  id: string;
  label: string;
}

/** The ten rotating business universes — one storefront db, many stakeholder hats. */
export const CASE_UNIVERSES: CaseUniverseMeta[] = [
  { id: "month-close", label: "Month-end close" },
  { id: "refund-audit", label: "Refund audit" },
  { id: "pricing", label: "Pricing review" },
  { id: "inventory", label: "Inventory count" },
  { id: "funnel", label: "Marketing funnel" },
  { id: "supplier", label: "Supplier audit" },
  { id: "expense", label: "Spend report" },
  { id: "growth", label: "Growth board deck" },
  { id: "fraud", label: "Fraud spot-check" },
  { id: "catalog", label: "Warehouse catalog" },
];

export function caseTopicLabel(id: string): string {
  return CASE_TOPICS.find((t) => t.id === id)?.label ?? id;
}

export function caseUniverseLabel(id: string): string {
  return CASE_UNIVERSES.find((u) => u.id === id)?.label ?? id;
}

/** XP awarded the first time a case is rebuilt correctly (ledger key `case:<id>`). */
export const CASE_XP = 10;
