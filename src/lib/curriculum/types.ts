// Curriculum content types — client-safe.
import type { CellValue } from "@/lib/sql-types";

export type FigureId =
  | "l1-anatomy"
  | "l2-projection"
  | "l3-where-gate"
  | "l3-null-logic"
  | "l4-sort-limit"
  | "l5-distinct"
  | "l6-aggregate"
  | "l7-groupby"
  | "l8-where-having"
  | "l8-bins-space-3d"
  | "j1-fk-lookup"
  | "j2-inner-match"
  | "j2-join-space-3d"
  | "j3-chain"
  | "j4-left-join"
  | "j5-anti-join"
  | "j6-self-join"
  | "j7-fanout"
  | "j8-join-aggregate"
  | "s1-union"
  | "s2-stack-labels"
  | "s3-intersect"
  | "s4-except"
  | "s5-precedence"
  | "s6-case-switch"
  | "s7-case-agg"
  | "s8-capstone"
  | "l1-schema-map"
  | "l2-expr-math"
  | "l3-like-match"
  | "l4-null-spread"
  | "l5-multikey-sort"
  | "l6-distinct-mech"
  | "l7-count-star"
  | "j9-mental-model"
  | "j10-cartesian"
  | "j11-hop-map"
  | "j12-where-vs-on"
  | "j13-three-spellings"
  | "j14-two-aliases"
  | "j15-agg-pipeline"
  | "j16-agg-first"
  | "j9-direction"
  | "j10-multiply"
  | "j11-fanmap"
  | "j12-gap-anatomy"
  | "j12-left-space-3d"
  | "j13-subquery-flow"
  | "j14-mirror"
  | "j15-ghost-row"
  | "j16-preflight"
  | "s9-union-vs-all"
  | "s10-position-binding"
  | "s11-both-sides"
  | "s12-except-audit"
  | "s13-eval-order"
  | "s14-row-router"
  | "s15-pivot-build"
  | "s16-two-stage"
  | "q1-nested"
  | "q2-probe"
  | "q3-two-stage"
  | "q4-staging"
  | "q5-in-pipeline"
  | "q6-correlated"
  | "q7-fanout-safe"
  | "q8-cte-chain"
  | "t1-text-pipeline"
  | "t2-calendar"
  | "t3-ranked"
  | "t4-window"
  | "t5-null-coalesce"
  | "t6-month-buckets"
  | "t7-partition-rank"
  | "t8-running-total"
  | "t32-running-space-3d"
  | "x1-string-agg"
  | "x2-join-atlas"
  | "x3-total-stack"
  | "x4-range-join"
  | "w1-insert-map"
  | "w2-update-sweep"
  | "w3-delete-scope"
  | "w4-upsert-fork"
  | "w44-atomic-space-3d"
  | "d1-table-anatomy"
  | "d2-alter-paths"
  | "d3-view-lens"
  | "d4-index-lookup"
  | "d48-index-space-3d"
  | "d5-recursive-unfold"
  | "fin1-books-map"
  | "fin2-statement-walk"
  | "fin3-aging-ladder"
  | "fin4-mom-bridge"
  | "fin5-trial-balance"
  | "fin6-frame-slide"
  | "v1-grain-zoom"
  | "v2-select-pipeline"
  | "v3-where-gate-ladder"
  | "v4-null-three-gates"
  | "v5-sort-slice"
  | "v6-distinct-sieve"
  | "v7-aggregate-collapse"
  | "v8-bucket-gate"
  | "l35-report-anatomy"
  | "l35-question-to-sql"
  | "l35-clause-order"
  | "l1-data-types"
  | "l1-pk-address"
  | "l2-star-expand"
  | "l2-alias-rename"
  | "l3-filter-funnel"
  | "l3-and-or"
  | "l4-3vl-table"
  | "l4-null-dropped"
  | "l5-top-n"
  | "l5-offset-pages"
  | "l6-city-vs-region"
  | "l6-pair-distinct"
  | "l7-agg-collapse"
  | "l7-count-holes"
  | "l8-status-buckets"
  | "l8-having-position"
  | "l1-why-db"
  | "l1-crud-doors"
  | "l2-clause-pipeline"
  | "l2-everything-table"
  | "l3-predicate-toolbox"
  | "l3-row-triage"
  | "l4-three-causes"
  | "l4-count-verdict"
  | "l5-sort-directions"
  | "l5-window"
  | "l6-cardinality"
  | "l6-dropdown"
  | "l7-five-aggregates"
  | "l7-count-menu"
  | "l8-group-pipeline"
  | "l8-select-rule"
  | "l36-join-instruments"
  | "l37-setop-pivot"
  | "l38-nested-asks"
  | "l39-ops-calendar"
  | "l40-exec-onepager"
  | "d50-fix-ticket"
  | "d51-reporting-layer"

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "steps"; items: string[] }
  | { kind: "code"; sql: string; caption?: string; runnable?: boolean }
  | { kind: "diagram"; figure: FigureId }
  | { kind: "tip"; text: string }
  | { kind: "warn"; text: string }
  | { kind: "dialect"; db: DbDialect; text: string }
  | { kind: "table"; headers: string[]; rows: string[][]; caption?: string };

/** Engine whose behavior differs from SQLite in the context of the note. */
export type DbDialect = "postgres" | "mysql" | "sqlite";

/** Blocks for the Deep dive tab — the premium theory layer. Reuses the
 *  visual vocabulary of Block and adds four deep-dive-only kinds:
 *  mind (mental model), engine (execution walkthrough), myth (misconception
 *  pairs), edge (edge-case gallery). */
export type DeepBlock =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "code"; sql: string; caption?: string; runnable?: boolean }
  | { kind: "diagram"; figure: FigureId }
  | { kind: "table"; headers: string[]; rows: string[][]; caption?: string }
  | { kind: "tip"; text: string }
  | { kind: "mind"; text: string }
  | { kind: "engine"; title: string; steps: string[] }
  | { kind: "myth"; myth: string; truth: string }
  | { kind: "edge"; items: Array<{ c: string; r: string }> };

export interface Mcq {
  /** Stable id, e.g. "l3-q2" — referenced by the XP ledger. */
  id: string;
  prompt: string;
  choices: string[];
  /** Index of the correct choice. */
  answer: number;
  /** Shown after answering, right or wrong. */
  why: string;
  /** Coached explanations for the most tempting wrong choice(s), shown when picked. */
  notes?: Array<{ choice: number; why: string }>;
  /** Difficulty tag (expansion banks are tagged; inline lesson MCQs may omit). */
  difficulty?: "easy" | "medium" | "hard";
}

export interface ExpectedResult {
  columns: string[];
  rows: CellValue[][];
  /** For write/DDL problems graded by affected-row count (rows empty). */
  changes?: number | null;
}

/** Coaching rule: fires when a failed attempt matches `test` (case-insensitive
 *  regex source run against the whitespace-normalized SQL). */
export interface ProblemMistake {
  test: string;
  message: string;
}

export interface Problem {
  /** Stable id, e.g. "l3-p2" — referenced by the XP ledger. */
  id: string;
  title: string;
  brief: string;
  /** Progressive help: [0] conceptual nudge, [1] syntax skeleton. */
  hints?: [string, string];
  /** @deprecated legacy flat hint — migrated to `hints` across the curriculum. */
  hint?: string;
  difficulty: "easy" | "medium" | "hard";
  /** Reference solution — also shown after solving. */
  solution: string;
  /** Grading target, generated by running `solution` on the seed db. */
  expected: ExpectedResult;
  /** Require exact row order (for ORDER BY tasks). Default: order-insensitive. */
  ordered?: boolean;
  /** Column names may differ by case/alias when false. Default: exact match. */
  relaxedColumns?: boolean;
  /** Targeted coaching for common wrong attempts, checked on failed runs. */
  mistakes?: ProblemMistake[];
  /** Write/DDL statement — the grader runs it sandboxed (transaction + rollback). */
  mutating?: boolean;
  /** Optional read statement run after the write inside the same sandbox;
   *  its rows become the grading target (used to verify writes/DDL). */
  verify?: string;
}

/** Fill-in-the-blank drill: rebuild a query by placing chips into the
 *  numbered slots of `template` ({1}, {2} …). First all-correct Check pays
 *  XP; a miss enrolls the fill in the review deck (Leitner). Every fill's
 *  completed SQL is mechanically audited against the seed database. */
export interface Fill {
  /** Stable id, e.g. "l45-f1" — referenced by the XP ledger. */
  id: string;
  prompt: string;
  /** SQL with numbered slots, e.g. "SELECT {1}\nFROM {2};" */
  template: string;
  /** Answer chips + distractors, shown as the placement pool. */
  chips: string[];
  /** Exact chip per slot, in slot order. */
  answers: string[];
  /** Shown after answering, right or wrong. */
  why: string;
  /** Coached explanation for a wrong slot (keyed by 1-based slot number). */
  notes?: Array<{ slot: number; why: string }>;
}

/** Scenario case — the fill machinery wearing a business memo. The lesson
 *  number comes from the case-studies registry; Card renders `ask` as the
 *  prompt and pays case XP (never enrolls in the review deck). */
export interface CaseStudy extends Omit<Fill, "prompt"> {
  title: string;
  /** Optional one-line teaser under the title. */
  subtitle?: string;
  /** The business brief shown above the ask. */
  brief: string;
  /** The one-line ask — becomes the card's prompt. */
  ask: string;
  difficulty?: "easy" | "medium" | "hard";
}

/** Legacy theory-block union — matches the dormant TheoryBlocks renderer.
 *  Live lessons use `Block` / `DeepBlock` instead. */
export type TheoryBlock =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "list"; ordered?: boolean; items: string[] }
  | { kind: "code"; sql: string; caption?: string; tryIt?: boolean }
  | { kind: "table"; headers: string[]; rows: string[][]; caption?: string }
  | { kind: "diagram"; figure: FigureId }
  | { kind: "note"; tone: "tip" | "pitfall" | "warning" | "info"; title: string; text: string };

/** Back-compat alias used by the lesson quiz runner. */
export type MCQ = Mcq;

export interface Lesson {
  /** Stable id, e.g. "lesson-01" — referenced by the XP ledger. */
  id: string;
  num: number;
  title: string;
  blurb: string;
  minutes: number;
  blocks: Block[];
  mcqs: Mcq[];
  problems: Problem[];
  /** One-sentence closing takeaway, shown at the end of the theory tab. */
  takeaway?: string;
  /** Deep dive — premium theory layer (engine mechanics, mental models,
   *  misconceptions, edge cases). Rendered in its own tab when present. */
  deep?: DeepBlock[];
}

/** Inline `code` and **bold** markers are rendered by the rich-text helper. */
export type RichText = string;
