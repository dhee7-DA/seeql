// Capstone — the last section of SeeQL. Takes the Messy Data Gym's parse +
// profile of ANY uploaded CSV and turns it into a complete A→Z analyst
// project: meet the data → audit the damage → describe → break down →
// slice time → rank & run → domain briefs → the brief (an executive
// one-row answer plus a stated conclusion). SeeQ guides every question,
// and every question deep-links back to the exact lesson that teaches it.
//
// Design rules (inherited from the gym — non-negotiable):
//  - Checkers grade the RESULT (shape + values), never the SQL text.
//  - Every expected value derives from cellAsStored — the client mirror of
//    what api/sandbox actually stores — so checkers agree with the
//    database by construction, and scripts/capstone-verify.ts proves it
//    against a real SQLite engine.
//  - The gym's own missions (buildGymMissions) are Stage B verbatim —
//    same ids, same XP keys, so progress earned in the plain gym carries
//    into the capstone with zero migration.
//  - Pure functions + data. No React, no storage, no fetch. XP flows
//    through the existing awardXp(gymXpKey(parse, questionId)) ledger.

import { xpForDifficulty, type Difficulty } from "./curriculum/gamification";
import { cellAsStored, type GymParse } from "./csv-table";
import {
  buildGymMissions,
  failShape,
  failValue,
  isSingleCellNamed,
  numEq,
  rowsMatchOrdered,
  rowsMatchUnordered,
  type GymCheck,
  type GymMission,
  type GymProfile,
} from "./messy-gym";
import type { CellValue, ExecResult } from "./sql-types";

// ---- column roles -----------------------------------------------------------
// One semantic role per column. Roles drive the question templates: a
// "money" column earns a payroll brief, a "date" column unlocks the time
// stage, a low-cardinality "category" becomes the GROUP BY spine.

export type GymRole =
  | "id"
  | "person"
  | "date"
  | "money"
  | "measure"
  | "status"
  | "location"
  | "email"
  | "category"
  | "flag"
  | "text";

export interface RoleCol {
  name: string;
  role: GymRole;
}

// date signatures — mirrored from lib/messy-gym.ts cellStats (heuristic
// layer only; the parse/storage semantics stay single-sourced in
// lib/csv-table.ts, which this file never re-implements).
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLASH_DATE_RE = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
const DMON_DATE_RE = /^\d{1,2}-[A-Za-z]{3,}-\d{4}$/;
const MOND_DATE_RE = /^[A-Za-z]{3,}\s+\d{1,2},?\s+\d{4}$/;

function isDateShape(v: string): boolean {
  return ISO_DATE_RE.test(v) || SLASH_DATE_RE.test(v) || DMON_DATE_RE.test(v) || MOND_DATE_RE.test(v);
}

const MONEY_NAME_RE = /(price|amount|cost|revenue|salary|due|fee|pay|budget|usd|eur|total|spend|bonus|wage|rate)/;
const DATE_NAME_RE = /(date|_at$|day|month|year|when|joined|hire|start|end|checkin|checkout)/;
const ID_NAME_RE = /(^|_)(id|code|sku|ref|no|num)$/;
const PERSON_NAME_RE = /(name|analyst|member|customer|employee|owner|author|agent|manager|trainer|rep|user|contact|staff)/;
const STATUS_NAME_RE = /(status|stage|rating|priority|tier|plan|grade|level|performance|review|score)/;
const LOCATION_NAME_RE = /(city|country|state|region|zone|location|branch|office|territory|site|area)/;
const EMAIL_NAME_RE = /(e?mail)/;
const FLAG_WORDS = new Set(["yes", "no", "true", "false", "y", "n"]);

export function detectRoles(parse: GymParse): RoleCol[] {
  return parse.columns.map((c, ci) => {
    const values = parse.rows.map((r) => cellAsStored(r[ci] ?? "", c.type));
    const filled = values.filter((v) => v !== null);
    const strings = filled.map(String);
    const distinct = new Set(strings).size;
    const lowCard = distinct <= Math.max(8, filled.length / 3);
    const name = c.name;

    const isEmailCol =
      EMAIL_NAME_RE.test(name) ||
      (strings.length > 0 && strings.filter((s) => s.includes("@")).length / strings.length > 0.6);
    if (isEmailCol) return { name, role: "email" as GymRole };

    const dateShaped = strings.length > 0 && strings.filter(isDateShape).length / strings.length >= 0.5;
    if (dateShaped) return { name, role: "date" as GymRole };

    // high-cardinality identifier — before the numeric check, so a pure
    // integer id (101, 102, …) doesn't masquerade as a measure
    if (ID_NAME_RE.test(name) && filled.length > 0 && distinct >= filled.length * 0.9)
      return { name, role: "id" as GymRole };

    // a clean numeric column is a measure, whatever it's called — salary,
    // rating, minutes. (Decorated numerics are TEXT and fall through to
    // the money-name check below, which is exactly the costume case.)
    if (c.type !== "TEXT") return { name, role: "measure" as GymRole };

    if (MONEY_NAME_RE.test(name)) return { name, role: "money" as GymRole };
    if (DATE_NAME_RE.test(name)) return { name, role: "date" as GymRole };

    if (PERSON_NAME_RE.test(name)) return { name, role: "person" as GymRole };

    if (STATUS_NAME_RE.test(name) && lowCard) return { name, role: "status" as GymRole };
    if (LOCATION_NAME_RE.test(name)) return { name, role: "location" as GymRole };
    if (distinct === 2 && strings.every((s) => FLAG_WORDS.has(s.trim().toLowerCase())))
      return { name, role: "flag" as GymRole };
    if (lowCard) return { name, role: "category" as GymRole };
    return { name, role: "text" as GymRole };
  });
}

// ---- domain -----------------------------------------------------------------

export type GymDomain = "finance" | "fitness" | "sales" | "hr" | "ecommerce" | "marketing" | "saas" | "generic";

const DOMAIN_WORDS: Array<{ domain: Exclude<GymDomain, "generic">; re: RegExp }> = [
  { domain: "finance", re: /(ticker|target|analyst|sector|stock|market|portfolio|dividend|currency)/ },
  { domain: "fitness", re: /(member|checkin|check_in|gym|trainer|visit|workout|class|plan)/ },
  { domain: "sales", re: /(order|customer|region|product|quantity|qty|deal|pipeline|quota|discount)/ },
  { domain: "hr", re: /(employee|salary|department|hire|manager|payroll|staff|performance)/ },
  { domain: "ecommerce", re: /(sku|cart|checkout|shipping|warehouse|inventory|brand|supplier|refund|return)/ },
  { domain: "marketing", re: /(campaign|channel|impressions|clicks|ctr|open_rate|creative|audience|leads|conversions)/ },
  { domain: "saas", re: /(subscription|mrr|churn|signup|trial|seat|renewal|activation)/ },
];

const DOMAIN_LABEL: Record<GymDomain, string> = {
  finance: "markets & research",
  fitness: "gym & fitness",
  sales: "sales & orders",
  hr: "people & payroll",
  ecommerce: "e-commerce",
  marketing: "marketing & growth",
  saas: "SaaS & subscriptions",
  generic: "a general business export",
};

/** Classify the file from its raw headers + table name. The highest count
 *  of matching headers wins; zero matches → generic (still a full project,
 *  just with domain-neutral copy). */
export function detectDomain(rawHeaders: string[], tableName: string): GymDomain {
  const haystack = [...rawHeaders.map((h) => h.toLowerCase()), tableName.toLowerCase()];
  let best: { domain: GymDomain; score: number } = { domain: "generic", score: 0 };
  for (const { domain, re } of DOMAIN_WORDS) {
    const score = haystack.filter((h) => re.test(h)).length;
    if (score > best.score) best = { domain, score };
  }
  return best.domain;
}

// ---- the skill → lesson bridge ----------------------------------------------
// Every CapQ lists skill ids; each id maps to REAL lesson ids from the
// curriculum (MODULES/LESSONS). scripts/capstone-verify.ts asserts every
// lesson id here exists, so a dead "go learn" link can never ship.

export interface LessonRef {
  id: string;
  label: string;
}

export const SKILL_LESSONS: Record<string, LessonRef[]> = {
  select: [{ id: "lesson-02", label: "SELECT & FROM — reading data" }],
  filter: [{ id: "lesson-03", label: "WHERE — filtering rows" }],
  null: [{ id: "lesson-04", label: "NULL — working with missing data" }],
  sort: [{ id: "lesson-05", label: "ORDER BY & LIMIT — sorting and top-N" }],
  distinct: [{ id: "lesson-06", label: "DISTINCT — the uniqueness lens" }],
  aggregates: [{ id: "lesson-07", label: "Aggregates — COUNT, SUM, AVG, MIN, MAX" }],
  groupby: [{ id: "lesson-08", label: "GROUP BY & HAVING — buckets and gates" }],
  case: [
    { id: "lesson-22", label: "CASE WHEN: branching inside a query" },
    { id: "lesson-23", label: "CASE at work: counters, pivots, custom sorts" },
  ],
  subquery: [
    { id: "lesson-25", label: "Subqueries inside WHERE — ask in two steps" },
    { id: "lesson-27", label: "Derived tables — a query in FROM" },
  ],
  cte: [{ id: "lesson-28", label: "CTEs — WITH, the readable subquery" }],
  text: [{ id: "lesson-29", label: "Text & type toolkit — reshape any value" }],
  dates: [{ id: "lesson-30", label: "Dates & buckets — slicing the calendar" }],
  "windows-rank": [{ id: "lesson-31", label: "Windows I — rank without collapsing" }],
  "windows-offset": [{ id: "lesson-32", label: "Windows II — offsets & running totals" }],
};

// ---- shared value helpers ----------------------------------------------------
// Expected values are computed on the STORED view (cellAsStored) — exactly
// what SQLite holds after the sandbox route's inserts.

type Stored = string | number | null;

function storedCol(parse: GymParse, colName: string): Stored[] {
  const ci = parse.columns.findIndex((c) => c.name === colName);
  return parse.rows.map((r) => cellAsStored(r[ci] ?? "", parse.columns[ci].type));
}

function filled(parse: GymParse, colName: string): Array<string | number> {
  return storedCol(parse, colName).filter((v): v is string | number => v !== null);
}

/** LOWER()-folded group counts over non-null values — what
 *  GROUP BY LOWER(col) computes in SQLite. */
function lowerCounts(parse: GymParse, colName: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const v of storedCol(parse, colName)) {
    if (v === null) continue;
    const k = String(v).toLowerCase();
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return counts;
}

/** GROUP BY ORDER BY count DESC, value ASC — the shared ranking of groups
 *  (also the tie-break law for every "leading group" question). */
function groupsRanked(parse: GymParse, colName: string): Array<[string, number]> {
  return [...lowerCounts(parse, colName).entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function isoCount(parse: GymParse, colName: string): number {
  return filled(parse, colName).filter((v) => ISO_DATE_RE.test(String(v).trim())).length;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

/** Tolerant unordered grid match: strings exact, numbers within 0.006 —
 *  so a learner who rounds an AVG to 2 decimals still clears the check. */
function rowsMatchTolerant(got: CellValue[][], want: CellValue[][]): boolean {
  if (got.length !== want.length) return false;
  const key = (row: CellValue[]) => row.map((v) => (typeof v === "string" ? v : "num")).join("|");
  const pool = new Map<string, CellValue[][]>();
  for (const w of want) {
    const k = key(w);
    pool.set(k, [...(pool.get(k) ?? []), w]);
  }
  for (const g of got) {
    const candidates = pool.get(key(g));
    if (!candidates || candidates.length === 0) return false;
    const idx = candidates.findIndex((w) =>
      w.every((wv, i) => {
        const gv = g[i];
        if (typeof wv === "number" && typeof gv === "number") return Math.abs(wv - gv) <= 0.006;
        return String(wv) === String(gv);
      }),
    );
    if (idx === -1) return false;
    candidates.splice(idx, 1);
  }
  return true;
}

// ---- the project model ------------------------------------------------------

export type CapStageId = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";

export interface CapStage {
  id: CapStageId;
  letter: string;
  title: string;
  /** the explainer line — why analysts work this way */
  why: string;
}

export interface CapPick {
  options: string[];
  answer: string;
  explain: string;
}

export interface CapQ {
  id: string;
  stage: CapStageId;
  kind: "sql" | "pick";
  /** skill credited via recordSkill (same vocabulary the gym uses) */
  skill: string;
  /** lesson-link skill ids — every entry must exist in SKILL_LESSONS */
  skills: string[];
  difficulty: Difficulty;
  label: string;
  prompt: string;
  /** SeeQ's always-visible what-to-do note */
  coach: string;
  /** hint ladder: conceptual nudge → the technique */
  hints: string[];
  starter: string;
  xp: number;
  expected: string;
  check: (r: ExecResult) => GymCheck;
  /** pick questions are graded by choice (The Brief's conclusion check) */
  pick?: CapPick;
}

export interface CapstoneProject {
  domain: GymDomain;
  domainLabel: string;
  /** SeeQ's auto-written story of the file — the project's opening */
  story: string;
  stages: CapStage[];
  questions: CapQ[];
}

export const CAP_STAGES: CapStage[] = [
  {
    id: "a",
    letter: "A",
    title: "Meet the data",
    why: "Analysts never query blind. One peek at a real row tells you what a 'record' even means here — before any counting starts.",
  },
  {
    id: "b",
    letter: "B",
    title: "Audit the damage",
    why: "Every conclusion you'll draw rests on this file being honest with you. Blanks, dupes and costumes found now are wrong answers avoided later.",
  },
  {
    id: "c",
    letter: "C",
    title: "Describe the columns",
    why: "Before 'interesting', get true: ranges, averages, distinct values. This is the vocabulary every breakdown that follows will use.",
  },
  {
    id: "d",
    letter: "D",
    title: "Break it down",
    why: "One row per group is where data starts talking. GROUP BY turns a pile of records into a comparison a human can read.",
  },
  {
    id: "e",
    letter: "E",
    title: "Slice time",
    why: "Dates turn a snapshot into a story. Per-month counts expose growth, seasonality and the months nobody talks about.",
  },
  {
    id: "f",
    letter: "F",
    title: "Rank & run",
    why: "Window functions rank without collapsing and total without regrouping — the difference between a summary and an analysis.",
  },
  {
    id: "g",
    letter: "G",
    title: "Domain briefs",
    why: "Now the domain takes over: the questions a stakeholder in THIS data would actually pay for, built on the roles we detected.",
  },
  {
    id: "h",
    letter: "H",
    title: "The brief",
    why: "Analysis ends in a deliverable: one row a busy lead can absorb, and a conclusion you're willing to say out loud.",
  },
];

// ---- Stage A — meet the data --------------------------------------------------

function buildA(t: string, parse: GymParse): CapQ[] {
  return [
    {
      id: "a-peek",
      stage: "a",
      kind: "sql",
      skill: "select",
      skills: ["select"],
      difficulty: "easy",
      label: "First contact",
      prompt: `Show the very first row of ${t} — every column, one row. Before counting anything, look at what one record actually looks like.`,
      coach:
        "Every analysis starts with an eyeball, not an aggregate. Read the row like a form someone filled in by hand — that's exactly where the mess hides.",
      hints: [
        "SELECT * means every column; LIMIT 1 trims the result to a single row.",
        `SELECT * FROM ${t} LIMIT 1; — no WHERE, no ORDER BY needed.`,
      ],
      starter: `SELECT *\nFROM ${t}\nLIMIT 1;`,
      xp: xpForDifficulty("easy"),
      expected: `1 row — all ${parse.columns.length} columns of ${t}`,
      check: (r) => {
        const wantCols = parse.columns.map((c) => c.name);
        if (r.rows.length !== 1) return failShape("exactly one row");
        if (
          r.columns.length !== wantCols.length ||
          r.columns.some((c, i) => c.trim().toLowerCase() !== wantCols[i])
        )
          return failShape(`all ${wantCols.length} columns in file order — plain SELECT *`);
        return {
          pass: true,
          feedback:
            "That's your record. The blanks, costumes and repeats you can already smell are exactly what Stage B hunts down.",
        };
      },
    },
  ];
}

// ---- Stage B — audit the damage (the gym's own missions, verbatim) -------------

const B_COACH: Record<string, string> = {
  "row-count":
    "Ground truth first: if this number surprises you, everything after it is speculation. Load, count, breathe.",
  "null-hunt":
    "Blanks became NULL on the way in. IS NULL is the only honest test — = NULL matches nothing, ever.",
  "case-count":
    "Case chaos is identity theft for categories: 'pro' and 'PRO' are one value wearing two shirts. Fold with LOWER before counting.",
  "dupe-hunt":
    "Duplicates inflate every total you'll ever run on this file. Quantify them before you dedupe — Stage C's math depends on it.",
  "iso-dates":
    "One column, several calendars. Count the well-formed rows first — that's your baseline for the rescue.",
  "junk-sum":
    "Numbers in text costumes are the classic landmine: '$1,200.50' sums as 0 until you strip and cast. The analyst's least glamorous, most-valued trick.",
  "top-clean":
    "The payoff of the audit: group on the NORMALIZED value so case chaos can't split your groups. This is 80% of analysis SQL.",
};

const B_SKILLS: Record<string, string[]> = {
  "row-count": ["select", "aggregates"],
  "null-hunt": ["null", "filter"],
  "case-count": ["text", "distinct"],
  "dupe-hunt": ["groupby", "subquery"],
  "iso-dates": ["text", "dates"],
  "junk-sum": ["text", "aggregates"],
  "top-clean": ["groupby", "sort"],
};

function buildB(parse: GymParse, profile: GymProfile): CapQ[] {
  return buildGymMissions(parse, profile).map((m: GymMission) => ({
    id: m.id,
    stage: "b" as const,
    kind: "sql" as const,
    skill: m.skill,
    skills: B_SKILLS[m.id] ?? [m.skill],
    difficulty: m.difficulty,
    label: m.label,
    prompt: m.prompt,
    coach: B_COACH[m.id] ?? "Deliver exactly what the prompt asks — the result is graded, never the wording.",
    hints: [m.hint],
    starter: m.starter,
    xp: m.xp,
    expected: m.expected,
    check: m.check,
  }));
}

// ---- Stage C — describe the columns ---------------------------------------------

function strongestMeasure(parse: GymParse): string | null {
  const candidates = parse.columns
    .filter((c) => c.type !== "TEXT")
    .map((c) => ({ name: c.name, nulls: storedCol(parse, c.name).filter((v) => v === null).length }))
    .sort((a, b) => a.nulls - b.nulls);
  return candidates.length > 0 ? candidates[0].name : null;
}

function buildC(t: string, parse: GymParse, roles: RoleCol[], caseColName: string | null): CapQ[] {
  const qs: CapQ[] = [];
  const measure = strongestMeasure(parse);

  if (measure) {
    const vals = filled(parse, measure).map(Number);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    qs.push({
      id: "c-minmax",
      stage: "c",
      kind: "sql",
      skill: "aggregates",
      skills: ["aggregates"],
      difficulty: "easy",
      label: "The range",
      prompt: `Find the smallest and largest value of ${t}.${measure} — one row, two columns named min_v and max_v. Blanks never win MIN or MAX; aggregates ignore them.`,
      coach: "MIN and MAX give you the plausible envelope. Anything outside it later is a data-entry ghost, not a record.",
      hints: [
        "Two aggregates in one SELECT: MIN(col) and MAX(col), each with its alias.",
        `SELECT MIN(${measure}) AS min_v, MAX(${measure}) AS max_v FROM ${t};`,
      ],
      starter: `SELECT MIN(${measure}) AS min_v, MAX(${measure}) AS max_v\nFROM ${t};`,
      xp: xpForDifficulty("easy"),
      expected: `${fmt(min)} and ${fmt(max)} — columns min_v + max_v`,
      check: (r) => {
        if (r.columns.length !== 2 || r.columns[0].trim().toLowerCase() !== "min_v" || r.columns[1].trim().toLowerCase() !== "max_v")
          return failShape('one row, two columns named "min_v" and "max_v"');
        if (r.rows.length !== 1) return failShape("one row");
        return rowsMatchTolerant(r.rows, [[min, max]])
          ? { pass: true, feedback: `${fmt(min)} to ${fmt(max)} — the honest envelope of ${measure}.` }
          : failValue(`${fmt(min)} / ${fmt(max)}`);
      },
    });

    if (vals.length >= 3) {
      const avg = vals.reduce((a, v) => a + v, 0) / vals.length;
      qs.push({
        id: "c-avg",
        stage: "c",
        kind: "sql",
        skill: "aggregates",
        skills: ["aggregates"],
        difficulty: "easy",
        label: "The center",
        prompt: `Average ${t}.${measure} — one cell named avg_value. Full precision or a rounding, the checker tolerates a decimal's difference. Blanks are excluded, not zero.`,
        coach: "AVG skips NULLs silently — which is why the null count from Stage B matters: blanks never drag the center down.",
        hints: [
          "AVG(col) is the aggregate; alias it with AS avg_value.",
          `SELECT AVG(${measure}) AS avg_value FROM ${t}; — ROUND(..., 2) if you like.`,
        ],
        starter: `SELECT AVG(${measure}) AS avg_value\nFROM ${t};`,
        xp: xpForDifficulty("easy"),
        expected: `${avg.toFixed(2)} — column avg_value`,
        check: (r) =>
          !isSingleCellNamed(r, "avg_value")
            ? failShape('one cell named "avg_value"')
            : numEq(r.rows[0][0], avg, 0.006)
              ? { pass: true, feedback: `${avg.toFixed(2)} — the center of gravity of ${measure}, blanks honestly excluded.` }
              : failValue(`${avg.toFixed(2)}`),
      });
    }
  }

  // date range — only for a PURE iso column (mixed calendars poison MIN/MAX)
  const dateCol = roles.find((r) => r.role === "date");
  if (dateCol) {
    const f = filled(parse, dateCol.name).map((v) => String(v).trim());
    if (f.length > 0 && f.every((s) => ISO_DATE_RE.test(s))) {
      const earliest = [...f].sort()[0];
      const latest = [...f].sort()[f.length - 1];
      qs.push({
        id: "c-range",
        stage: "c",
        kind: "sql",
        skill: "aggregates",
        skills: ["aggregates", "dates"],
        difficulty: "easy",
        label: "The calendar span",
        prompt: `Over what period does ${t}.${dateCol.name} run? Return the earliest and latest date — one row, two columns named earliest and latest. ISO dates sort correctly as text, so MIN/MAX just work.`,
        coach: "A date range frames every time question you'll ask later. ISO dates are text-sortable — one of the few free lunches in SQL.",
        hints: [
          "MIN on a TEXT date works because YYYY-MM-DD sorts lexicographically.",
          `SELECT MIN(${dateCol.name}) AS earliest, MAX(${dateCol.name}) AS latest FROM ${t};`,
        ],
        starter: `SELECT MIN(${dateCol.name}) AS earliest, MAX(${dateCol.name}) AS latest\nFROM ${t};`,
        xp: xpForDifficulty("easy"),
        expected: `${earliest} → ${latest} — columns earliest + latest`,
        check: (r) => {
          if (r.columns.length !== 2 || r.columns[0].trim().toLowerCase() !== "earliest" || r.columns[1].trim().toLowerCase() !== "latest")
            return failShape('one row, two columns named "earliest" and "latest"');
          if (r.rows.length !== 1) return failShape("one row");
          return rowsMatchUnordered(r.rows, [[earliest, latest]])
            ? { pass: true, feedback: `${earliest} to ${latest} — that's the window your whole story happens in.` }
            : failValue(`${earliest} / ${latest}`);
        },
      });
    }
  }

  // distinct count on a category-ish column that the case mission didn't claim
  const pool = roles.filter(
    (r) => ["category", "status", "location"].includes(r.role) && r.name !== caseColName,
  );
  const dcol = pool[0];
  if (dcol && lowerCounts(parse, dcol.name).size >= 2) {
    const want = lowerCounts(parse, dcol.name).size;
    qs.push({
      id: "c-distinct",
      stage: "c",
      kind: "sql",
      skill: "distinct",
      skills: ["distinct", "text"],
      difficulty: "easy",
      label: "The catalog",
      prompt: `How many distinct ${dcol.name} values exist in ${t}, case-folded? One cell named distinct_values. Folding first means 'West' and 'west' count once.`,
      coach: "DISTINCT answers 'what does this dimension even contain' — the checklist every breakdown and filter will draw from.",
      hints: [
        "COUNT(DISTINCT LOWER(col)) folds case before counting.",
        `SELECT COUNT(DISTINCT LOWER(${dcol.name})) AS distinct_values FROM ${t};`,
      ],
      starter: `SELECT COUNT(DISTINCT LOWER(${dcol.name})) AS distinct_values\nFROM ${t};`,
      xp: xpForDifficulty("easy"),
      expected: `${want}, column distinct_values`,
      check: (r) =>
        !isSingleCellNamed(r, "distinct_values")
          ? failShape('one cell named "distinct_values"')
          : numEq(r.rows[0][0], want)
            ? { pass: true, feedback: `${want} real values in ${dcol.name} — that's your breakdown menu for Stage D.` }
            : failValue(`${want}`),
    });
  }

  return qs;
}

// ---- Stage D — break it down ----------------------------------------------------

function buildD(
  t: string,
  parse: GymParse,
  roles: RoleCol[],
  topCleanCol: string | null,
): { qs: CapQ[]; groupCol: string | null } {
  const qs: CapQ[] = [];
  const pool = roles.filter((r) => ["category", "status", "location"].includes(r.role));
  const groupCol =
    pool.find((r) => r.name !== topCleanCol && lowerCounts(parse, r.name).size >= 2)?.name ?? null;
  if (!groupCol) return { qs, groupCol: null };

  const ranked = groupsRanked(parse, groupCol);
  qs.push({
    id: "d-groups",
    stage: "d",
    kind: "sql",
    skill: "groupby",
    skills: ["groupby", "sort"],
    difficulty: "medium",
    label: "The split",
    prompt: `Break ${t} down by ${groupCol}: every distinct value (lowercased, so case chaos can't split groups) with its row count, biggest first. Two columns named group_value and group_rows. Ties: alphabetical.`,
    coach: "This is the table's first opinion. Every bar chart your stakeholder has ever asked for starts as exactly this query.",
    hints: [
      "GROUP BY LOWER(col), COUNT(*) AS the count, ORDER BY count DESC then value ASC.",
      `SELECT LOWER(${groupCol}) AS group_value, COUNT(*) AS group_rows\nFROM ${t}\nGROUP BY LOWER(${groupCol})\nORDER BY group_rows DESC, group_value ASC;`,
    ],
    starter: `SELECT LOWER(${groupCol}) AS group_value, COUNT(*) AS group_rows\nFROM ${t}\nGROUP BY LOWER(${groupCol})\nORDER BY group_rows DESC, group_value ASC;`,
    xp: xpForDifficulty("medium"),
    expected: `${ranked.length} rows — columns group_value + group_rows`,
    check: (r) => {
      if (r.columns.length !== 2 || r.columns[0].trim().toLowerCase() !== "group_value" || r.columns[1].trim().toLowerCase() !== "group_rows")
        return failShape('two columns named "group_value" and "group_rows"');
      return rowsMatchUnordered(r.rows, ranked.map(([v, n]) => [v, n] as CellValue[]))
        ? {
            pass: true,
            feedback: `All ${ranked.length} groups, honest counts. Note which group leads — Stage H will ask you to say it out loud.`,
          }
        : failValue(`${ranked.length} group rows matching the data`);
    },
  });

  const measure = strongestMeasure(parse);
  if (measure) {
    // average measure per group (NULL measure rows are ignored by AVG — a
    // group whose measure is ALL null still appears, with NULL)
    const perGroup = new Map<string, { sum: number; n: number }>();
    const gcIdx = parse.columns.findIndex((c) => c.name === groupCol);
    const mIdx = parse.columns.findIndex((c) => c.name === measure);
    for (const row of parse.rows) {
      const g = cellAsStored(row[gcIdx] ?? "", parse.columns[gcIdx].type);
      if (g === null) continue;
      const k = String(g).toLowerCase();
      const m = cellAsStored(row[mIdx] ?? "", parse.columns[mIdx].type);
      const acc = perGroup.get(k) ?? { sum: 0, n: 0 };
      if (m !== null) {
        acc.sum += Number(m);
        acc.n += 1;
      }
      perGroup.set(k, acc);
    }
    const wantAvg: CellValue[][] = [...perGroup.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, { sum, n }]) => [k, n > 0 ? sum / n : null]);
    qs.push({
      id: "d-avg-per-group",
      stage: "d",
      kind: "sql",
      skill: "groupby",
      skills: ["groupby", "aggregates"],
      difficulty: "medium",
      label: "The metric split",
      prompt: `For each ${groupCol} (lowercased), the average ${measure} — two columns named group_value and avg_metric. Don't round; the checker tolerates a decimal. Rows with a blank ${measure} simply don't pull the average.`,
      coach: "Two dimensions in one breath: 'how much' sliced by 'what kind'. This is the query behind every per-segment dashboard tile.",
      hints: [
        "GROUP BY LOWER(group col) and AVG(measure) together; alias both.",
        `SELECT LOWER(${groupCol}) AS group_value, AVG(${measure}) AS avg_metric\nFROM ${t}\nGROUP BY LOWER(${groupCol});`,
      ],
      starter: `SELECT LOWER(${groupCol}) AS group_value, AVG(${measure}) AS avg_metric\nFROM ${t}\nGROUP BY LOWER(${groupCol});`,
      xp: xpForDifficulty("medium"),
      expected: `${wantAvg.length} rows — columns group_value + avg_metric`,
      check: (r) => {
        if (r.columns.length !== 2 || r.columns[0].trim().toLowerCase() !== "group_value" || r.columns[1].trim().toLowerCase() !== "avg_metric")
          return failShape('two columns named "group_value" and "avg_metric"');
        return rowsMatchTolerant(r.rows, wantAvg)
          ? { pass: true, feedback: "Per-group averages, blanks handled the way the engine handles them. That's production-grade honesty." }
          : failValue(`${wantAvg.length} rows of matching averages`);
      },
    });

    // total per second group dimension (status-flavored), when one exists
    const second =
      pool.find((r) => r.name !== groupCol && r.name !== topCleanCol && lowerCounts(parse, r.name).size >= 2)?.name ?? null;
    if (second) {
      const sIdx = parse.columns.findIndex((c) => c.name === second);
      const perSum = new Map<string, { sum: number | null }>();
      for (const row of parse.rows) {
        const g = cellAsStored(row[sIdx] ?? "", parse.columns[sIdx].type);
        if (g === null) continue;
        const k = String(g).toLowerCase();
        const m = cellAsStored(row[mIdx] ?? "", parse.columns[mIdx].type);
        const acc = perSum.get(k) ?? { sum: null };
        if (m !== null) acc.sum = (acc.sum ?? 0) + Number(m);
        perSum.set(k, acc);
      }
      const wantSum: CellValue[][] = [...perSum.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([k, { sum }]) => [k, sum]);
      qs.push({
        id: "d-status-total",
        stage: "d",
        kind: "sql",
        skill: "groupby",
        skills: ["groupby", "aggregates"],
        difficulty: "medium",
        label: "The second lens",
        prompt: `Same idea, second dimension: total ${measure} for each ${second} (lowercased) — columns group_value and total_value. Blanks in ${measure} count nothing, but the group still shows (with a NULL total if it has nothing).`,
        coach: "Pivot thinking: same rows, different grouping key. Compare this with the last query and you'll see the whole table from two sides.",
        hints: [
          "SUM(measure) GROUP BY LOWER(second col) — same skeleton as the average, different aggregate.",
          `SELECT LOWER(${second}) AS group_value, SUM(${measure}) AS total_value\nFROM ${t}\nGROUP BY LOWER(${second});`,
        ],
        starter: `SELECT LOWER(${second}) AS group_value, SUM(${measure}) AS total_value\nFROM ${t}\nGROUP BY LOWER(${second});`,
        xp: xpForDifficulty("medium"),
        expected: `${wantSum.length} rows — columns group_value + total_value`,
        check: (r) => {
          if (r.columns.length !== 2 || r.columns[0].trim().toLowerCase() !== "group_value" || r.columns[1].trim().toLowerCase() !== "total_value")
            return failShape('two columns named "group_value" and "total_value"');
          return rowsMatchTolerant(r.rows, wantSum)
            ? { pass: true, feedback: "Two lenses on one table — that's how analysts cross-check a story before telling it." }
            : failValue(`${wantSum.length} rows of matching totals`);
        },
      });
    }
  }

  return { qs, groupCol };
}

// ---- Stage E — slice time --------------------------------------------------------

interface Months {
  col: string;
  counts: Array<[string, number]>;
}

function monthCounts(parse: GymParse, dateCol: string): Months | null {
  const f = filled(parse, dateCol).map((v) => String(v).trim());
  const iso = f.filter((s) => ISO_DATE_RE.test(s));
  if (iso.length < 2 || iso.length < f.length * 0.5) return null;
  const counts = new Map<string, number>();
  for (const s of iso) {
    const m = s.slice(0, 7);
    counts.set(m, (counts.get(m) ?? 0) + 1);
  }
  return { col: dateCol, counts: [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])) };
}

function buildE(t: string, months: Months): CapQ[] {
  const qs: CapQ[] = [];
  const d = months.col;
  qs.push({
    id: "e-months",
    stage: "e",
    kind: "sql",
    skill: "dates",
    skills: ["dates", "groupby"],
    difficulty: "medium",
    label: "The rhythm",
    prompt: `Count the ISO-formatted rows of ${t}.${d} per month (YYYY-MM) — two columns named month and rows. This file mixes date formats, so filter to the well-formed ones first: the pattern is '____-__-__' at the start of the value.`,
    coach: "The first time question is never 'trend' — it's 'what does one month even look like here'. Counts per month are the spine of every time series.",
    hints: [
      "WHERE col GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]' keeps ISO rows; SUBSTR(col, 1, 7) slices the month.",
      `SELECT SUBSTR(${d}, 1, 7) AS month, COUNT(*) AS rows\nFROM ${t}\nWHERE ${d} GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'\nGROUP BY month;`,
    ],
    starter: `SELECT SUBSTR(${d}, 1, 7) AS month, COUNT(*) AS rows\nFROM ${t}\nWHERE ${d} GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'\nGROUP BY month;`,
    xp: xpForDifficulty("medium"),
    expected: `${months.counts.length} months — columns month + rows`,
    check: (r) => {
      if (r.columns.length !== 2 || r.columns[0].trim().toLowerCase() !== "month" || r.columns[1].trim().toLowerCase() !== "rows")
        return failShape('two columns named "month" and "rows"');
      return rowsMatchUnordered(r.rows, months.counts.map(([m, n]) => [m, n] as CellValue[]))
        ? { pass: true, feedback: `${months.counts.length} months on the board. Look at the shape — that's the file's heartbeat.` }
        : failValue(`${months.counts.length} month rows matching the ISO data`);
    },
  });

  const busiest = [...months.counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  qs.push({
    id: "e-busiest",
    stage: "e",
    kind: "sql",
    skill: "sort",
    skills: ["dates", "sort"],
    difficulty: "medium",
    label: "The peak",
    prompt: `Which month holds the most ISO-formatted rows in ${t}.${d}? One cell named busiest_month. Tie-break: the earliest month wins.`,
    coach: "One cell, one headline. 'Our busiest month was…' is the first sentence of a thousand status reports.",
    hints: [
      "Group per month as before, ORDER BY the count DESC, then month ASC for ties, LIMIT 1.",
      `SELECT SUBSTR(${d}, 1, 7) AS busiest_month\nFROM ${t}\nWHERE ${d} GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'\nGROUP BY busiest_month\nORDER BY COUNT(*) DESC, busiest_month ASC\nLIMIT 1;`,
    ],
    starter: `SELECT SUBSTR(${d}, 1, 7) AS busiest_month\nFROM ${t}\nWHERE ${d} GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'\nGROUP BY busiest_month\nORDER BY COUNT(*) DESC, busiest_month ASC\nLIMIT 1;`,
    xp: xpForDifficulty("medium"),
    expected: `${busiest[0]}, column busiest_month`,
    check: (r) =>
      !isSingleCellNamed(r, "busiest_month")
        ? failShape('one cell named "busiest_month"')
        : String(r.rows[0]?.[0] ?? "") === busiest[0]
          ? { pass: true, feedback: `${busiest[0]} — ${busiest[1]} records. That's your headline month.` }
          : failValue(busiest[0]),
  });

  return qs;
}

// ---- Stage F — rank & run ---------------------------------------------------------

function buildF(t: string, parse: GymParse, roles: RoleCol[], months: Months | null, dGroupCol: string | null): CapQ[] {
  const qs: CapQ[] = [];

  // top item per bucket — needs two workable group dimensions
  const pool = roles.filter((r) => ["category", "status", "location"].includes(r.role));
  const inner = pool.find((r) => r.name !== dGroupCol && lowerCounts(parse, r.name).size >= 2);
  const outer = pool.find((r) => r.name !== inner?.name && lowerCounts(parse, r.name).size >= 2);
  if (inner && outer) {
    const gi = parse.columns.findIndex((c) => c.name === inner.name);
    const go = parse.columns.findIndex((c) => c.name === outer.name);
    const pairs = new Map<string, Map<string, number>>();
    for (const row of parse.rows) {
      const o = cellAsStored(row[go] ?? "", parse.columns[go].type);
      const i = cellAsStored(row[gi] ?? "", parse.columns[gi].type);
      if (o === null || i === null) continue;
      const kOut = String(o).toLowerCase();
      const kIn = String(i).toLowerCase();
      const bucket = pairs.get(kOut) ?? new Map<string, number>();
      bucket.set(kIn, (bucket.get(kIn) ?? 0) + 1);
      pairs.set(kOut, bucket);
    }
    const want: CellValue[][] = [...pairs.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([bucket, items]) => {
        const [item, n] = [...items.entries()].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))[0];
        return [bucket, item, n];
      });
    qs.push({
      id: "f-top-per-group",
      stage: "f",
      kind: "sql",
      skill: "windows-rank",
      skills: ["windows-rank", "cte"],
      difficulty: "hard",
      label: "The champion",
      prompt: `The champion question: for each ${outer.name} (lowercased), which ${inner.name} (lowercased) appears most often? Three columns named bucket, item, n. Window territory: rank inside each bucket without collapsing it. Ties: alphabetical.`,
      coach:
        "Top-N per group is the classic window-function interview: aggregate the pairs in a CTE, then ROW_NUMBER() over each partition and keep rn = 1.",
      hints: [
        "A CTE counts pairs (bucket, item, n); then ROW_NUMBER() OVER (PARTITION BY bucket ORDER BY n DESC, item ASC) and keep the first row per bucket.",
        `WITH counts AS (\n  SELECT LOWER(${outer.name}) AS bucket, LOWER(${inner.name}) AS item, COUNT(*) AS n\n  FROM ${t}\n  WHERE ${outer.name} IS NOT NULL AND ${inner.name} IS NOT NULL\n  GROUP BY bucket, item\n)\nSELECT bucket, item, n FROM (\n  SELECT bucket, item, n,\n         ROW_NUMBER() OVER (PARTITION BY bucket ORDER BY n DESC, item ASC) AS rn\n  FROM counts\n)\nWHERE rn = 1;`,
      ],
      starter: `WITH counts AS (\n  SELECT LOWER(${outer.name}) AS bucket, LOWER(${inner.name}) AS item, COUNT(*) AS n\n  FROM ${t}\n  WHERE ${outer.name} IS NOT NULL AND ${inner.name} IS NOT NULL\n  GROUP BY bucket, item\n)\nSELECT bucket, item, n FROM (\n  SELECT bucket, item, n,\n         ROW_NUMBER() OVER (PARTITION BY bucket ORDER BY n DESC, item ASC) AS rn\n  FROM counts\n)\nWHERE rn = 1;`,
      xp: xpForDifficulty("hard"),
      expected: `${want.length} buckets — columns bucket + item + n`,
      check: (r) => {
        if (
          r.columns.length !== 3 ||
          r.columns[0].trim().toLowerCase() !== "bucket" ||
          r.columns[1].trim().toLowerCase() !== "item" ||
          r.columns[2].trim().toLowerCase() !== "n"
        )
          return failShape('three columns named "bucket", "item" and "n"');
        return rowsMatchUnordered(r.rows, want)
          ? { pass: true, feedback: "One champion per bucket, ties settled calmly. That's the window-function pattern worth drilling until it's reflex." }
          : failValue(`${want.length} champion rows matching the data`);
      },
    });
  }

  // running total over the month spine — order is part of the deliverable
  if (months) {
    const d = months.col;
    const spine = months.counts;
    let acc = 0;
    const want = spine.map(([m, n]) => {
      acc += n;
      return [m, acc] as CellValue[];
    });
    qs.push({
      id: "f-running",
      stage: "f",
      kind: "sql",
      skill: "windows-offset",
      skills: ["windows-offset", "cte"],
      difficulty: "hard",
      label: "The snowball",
      prompt: `Running total over time: monthly counts of the ISO rows in ${t}.${d}, then a cumulative sum — two columns named month and running_total, ordered by month. SUM(...) OVER (ORDER BY month) is the snowball.`,
      coach:
        "Running totals answer 'how did we get here' — and unlike every question so far, the row ORDER is part of the deliverable. Order by month or the snowball melts.",
      hints: [
        "Build the month counts in a CTE, then SUM(rows) OVER (ORDER BY month) AS running_total.",
        `WITH months AS (\n  SELECT SUBSTR(${d}, 1, 7) AS month, COUNT(*) AS n\n  FROM ${t}\n  WHERE ${d} GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'\n  GROUP BY month\n)\nSELECT month, SUM(n) OVER (ORDER BY month) AS running_total\nFROM months\nORDER BY month;`,
      ],
      starter: `WITH months AS (\n  SELECT SUBSTR(${d}, 1, 7) AS month, COUNT(*) AS n\n  FROM ${t}\n  WHERE ${d} GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'\n  GROUP BY month\n)\nSELECT month, SUM(n) OVER (ORDER BY month) AS running_total\nFROM months\nORDER BY month;`,
      xp: xpForDifficulty("hard"),
      expected: `${want.length} months in order — columns month + running_total`,
      check: (r) => {
        if (r.columns.length !== 2 || r.columns[0].trim().toLowerCase() !== "month" || r.columns[1].trim().toLowerCase() !== "running_total")
          return failShape('two columns named "month" and "running_total"');
        return rowsMatchOrdered(r.rows, want)
          ? { pass: true, feedback: "A snowball that ends at the full ISO count — ordered, cumulative, honest. Windows officially unlocked." }
          : failValue(`${want.length} rows in month order, ending at ${acc}`);
      },
    });
  }

  return qs;
}

// ---- Stage G — domain briefs -------------------------------------------------------

const G_SUM_ALIAS: Record<GymDomain, string> = {
  fitness: "total_minutes",
  sales: "total_units",
  hr: "payroll_total",
  ecommerce: "total_units",
  marketing: "total_conversions",
  saas: "total_seats",
  finance: "grand_total",
  generic: "grand_total",
};

const BUYISH = ["buy", "strong buy", "overweight", "outperform", "positive", "accumulate"];
const SELLISH = ["sell", "strong sell", "underweight", "underperform", "negative", "reduce"];

function buildG(
  t: string,
  parse: GymParse,
  domain: GymDomain,
  roles: RoleCol[],
  dGroupsFired: boolean,
  dGroupCol: string | null,
): CapQ[] {
  const qs: CapQ[] = [];

  // the domain headline — a plain SUM over the clean measure
  const measure = strongestMeasure(parse);
  if (measure) {
    const sum = filled(parse, measure).reduce<number>((a, v) => a + Number(v), 0);
    const alias = G_SUM_ALIAS[domain];
    qs.push({
      id: "g-sum",
      stage: "g",
      kind: "sql",
      skill: "aggregates",
      skills: ["aggregates"],
      difficulty: "medium",
      label: "The headline number",
      prompt: `Every brief opens with one number. Total ${measure} across ${t} — one cell named ${alias}. Blanks contribute nothing; everything else counts.`,
      coach: "One query, one number, zero decoration — this is the figure that goes in the subject line of the email.",
      hints: [
        "SUM ignores NULLs on its own — no filter needed.",
        `SELECT SUM(${measure}) AS ${alias} FROM ${t};`,
      ],
      starter: `SELECT SUM(${measure}) AS ${alias}\nFROM ${t};`,
      xp: xpForDifficulty("medium"),
      expected: `${fmt(sum)}, column ${alias}`,
      check: (r) =>
        !isSingleCellNamed(r, alias)
          ? failShape(`one cell named "${alias}"`)
          : numEq(r.rows[0][0], sum)
            ? { pass: true, feedback: `${fmt(sum)} — the headline. Every brief, deck and dashboard opens with exactly this shape of number.` }
            : failValue(`${fmt(sum)}`),
    });
  }

  // the leading group, asked as a two-step query
  if (dGroupsFired && dGroupCol) {
    const ranked = groupsRanked(parse, dGroupCol);
    const top = ranked[0];
    qs.push({
      id: "g-leading-group",
      stage: "g",
      kind: "sql",
      skill: "subquery",
      skills: ["subquery", "groupby"],
      difficulty: "medium",
      label: "The leader",
      prompt: `Stage D showed all groups; a brief only needs the leader. Which ${dGroupCol} (lowercased) has the most rows in ${t}? One cell named leading_group. Ties: alphabetical.`,
      coach: "'Ask in two steps': the inner query ranks the groups, the outer picks one. This is where subqueries stop being scary and start being useful.",
      hints: [
        "Reuse the Stage D query as an inner query, ORDER BY count DESC then value ASC, LIMIT 1.",
        `SELECT LOWER(${dGroupCol}) AS leading_group\nFROM ${t}\nWHERE ${dGroupCol} IS NOT NULL\nGROUP BY leading_group\nORDER BY COUNT(*) DESC, leading_group ASC\nLIMIT 1;`,
      ],
      starter: `SELECT LOWER(${dGroupCol}) AS leading_group\nFROM ${t}\nWHERE ${dGroupCol} IS NOT NULL\nGROUP BY leading_group\nORDER BY COUNT(*) DESC, leading_group ASC\nLIMIT 1;`,
      xp: xpForDifficulty("medium"),
      expected: `${top[0]}, column leading_group`,
      check: (r) =>
        !isSingleCellNamed(r, "leading_group")
          ? failShape('one cell named "leading_group"')
          : String(r.rows[0]?.[0] ?? "") === top[0]
            ? { pass: true, feedback: `${top[0]} — ${fmt(top[1])} rows. Remember this name; The Brief will ask you to say it out loud.` }
            : failValue(top[0]),
    });
  }

  // finance only: the bullishness census (CASE counting on real rating words)
  const statusCol = roles.find((r) => r.role === "status");
  if (domain === "finance" && statusCol) {
    const vals = filled(parse, statusCol.name).map((v) => String(v).trim().toLowerCase());
    const bull = vals.filter((v) => BUYISH.includes(v)).length;
    const bear = vals.filter((v) => SELLISH.includes(v)).length;
    if (bull + bear >= 3 && bull !== bear) {
      const net = bull - bear;
      const inList = (words: string[]) => words.map((w) => `'${w}'`).join(", ");
      qs.push({
        id: "g-net-bullish",
        stage: "g",
        kind: "sql",
        skill: "case",
        skills: ["case", "aggregates"],
        difficulty: "hard",
        label: "The sentiment census",
        prompt: `The research desk wants the room's mood. Count every bullish rating (exactly: ${BUYISH.join(", ")}) minus every bearish rating (exactly: ${SELLISH.join(", ")}) in ${t}.${statusCol.name} — one cell named net_bullish. Anything else counts zero. Values are case-folded first.`,
        coach: "CASE WHEN inside SUM is SQL's counting machine: one pass over the rows, one counter per branch. The lists must match exactly — the brief defines the vocabulary.",
        hints: [
          "Two SUM(CASE WHEN ... THEN 1 ELSE 0 END) branches, subtract one from the other.",
          `SELECT\n  SUM(CASE WHEN LOWER(${statusCol.name}) IN (${inList(BUYISH)}) THEN 1 ELSE 0 END)\n  - SUM(CASE WHEN LOWER(${statusCol.name}) IN (${inList(SELLISH)}) THEN 1 ELSE 0 END) AS net_bullish\nFROM ${t};`,
        ],
        starter: `SELECT\n  SUM(CASE WHEN LOWER(${statusCol.name}) IN (${inList(BUYISH)}) THEN 1 ELSE 0 END)\n  - SUM(CASE WHEN LOWER(${statusCol.name}) IN (${inList(SELLISH)}) THEN 1 ELSE 0 END) AS net_bullish\nFROM ${t};`,
        xp: xpForDifficulty("hard"),
        expected: `${net}, column net_bullish`,
        check: (r) =>
          !isSingleCellNamed(r, "net_bullish")
            ? failShape('one cell named "net_bullish"')
            : numEq(r.rows[0][0], net)
              ? { pass: true, feedback: `Net ${net > 0 ? "bullish" : "bearish"} by ${Math.abs(net)}. You just built a sentiment meter out of CASE and SUM.` }
              : failValue(`${net}`),
      });
    }
  }

  return qs;
}

// ---- Stage H — the brief ------------------------------------------------------------

function buildH(t: string, parse: GymParse, dGroupCol: string | null, pickOptions: string[], pickAnswer: string, pickCount: number): CapQ[] {
  const qs: CapQ[] = [];
  const measure = dGroupCol ? strongestMeasure(parse) : null;
  const hasGroup = Boolean(dGroupCol);
  const cols = hasGroup ? (measure ? 3 : 2) : 1;

  const selectLines: string[] = ["COUNT(*) AS n"];
  if (measure && hasGroup)
    selectLines.push(`ROUND(AVG(${measure}), 1) AS avg_metric`);
  if (hasGroup)
    selectLines.push(
      `(SELECT LOWER(${dGroupCol}) FROM ${t} WHERE ${dGroupCol} IS NOT NULL GROUP BY LOWER(${dGroupCol}) ORDER BY COUNT(*) DESC, LOWER(${dGroupCol}) ASC LIMIT 1) AS top_group`,
    );

  const ranked = hasGroup && dGroupCol ? groupsRanked(parse, dGroupCol) : null;
  const top = ranked ? ranked[0][0] : null;
  const avg =
    measure && dGroupCol
      ? filled(parse, measure).reduce<number>((a, v) => a + Number(v), 0) / filled(parse, measure).length
      : null;
  const colNames = ["n", ...(measure && hasGroup ? ["avg_metric"] : []), ...(hasGroup ? ["top_group"] : [])];

  qs.push({
    id: "h-exec",
    stage: "h",
    kind: "sql",
    skill: "subquery",
    skills: ["subquery", "aggregates", ...(hasGroup ? ["groupby"] : [])],
    difficulty: "hard",
    label: "The executive row",
    prompt:
      cols === 3
        ? `The whole project in one row: row count (n), the average ${measure} rounded to 1 decimal (avg_metric), and the leading ${dGroupCol} lowercased (top_group — a scalar subquery may fetch it). Three columns, one row, from ${t}.`
        : cols === 2
          ? `The whole project in one row: row count (n) and the leading ${dGroupCol} lowercased (top_group — a scalar subquery may fetch it). Two columns, one row, from ${t}.`
          : `The whole project in one row: the row count of ${t} as a single column named n. One cell, one number — the load is verified and the brief is real.`,
    coach:
      "Everything you audited, described and ranked condenses into one row a busy lead can absorb in five seconds. This is the deliverable the whole project was building.",
    hints: [
      "Aggregates in the outer SELECT; the leading group can come from a scalar subquery in the SELECT list — SQLite allows that.",
      `SELECT ${selectLines.join(",\n  ")}\nFROM ${t};`,
    ],
    starter: `SELECT ${selectLines.join(",\n  ")}\nFROM ${t};`,
    xp: xpForDifficulty("hard"),
    expected: `1 row — columns ${colNames.join(" + ")}`,
    check: (r) => {
      if (r.columns.length !== cols || r.columns.some((c, i) => c.trim().toLowerCase() !== colNames[i]))
        return failShape(`one row, columns ${colNames.join(" + ")}`);
      if (r.rows.length !== 1) return failShape("exactly one row");
      const row = r.rows[0];
      if (!numEq(row[0], parse.rows.length)) return failValue(`${parse.rows.length}`);
      if (measure && hasGroup && avg !== null && !numEq(row[1], avg, 0.06)) return failValue(`avg_metric ≈ ${avg.toFixed(1)}`);
      if (hasGroup && top !== null && String(row[row.length - 1]) !== top) return failValue(`top_group = ${top}`);
      return {
        pass: true,
        feedback: "That's the brief. One row, every number defensible, nothing to scroll. This is what 'done' looks like.",
      };
    },
  });

  qs.push({
    id: "h-verdict",
    stage: "h",
    kind: "pick",
    skill: "select",
    skills: ["select"],
    difficulty: "medium",
    label: "Say it out loud",
    prompt: hasGroup
      ? `Last step — the conclusion. SeeQ asks: which ${dGroupCol} leads this table? Pick the finding you'd say out loud to your lead. If your pick disagrees with your executive row, one of you is wrong — go find out which.`
      : `Last step — the conclusion. SeeQ asks: how many rows does ${t} actually hold? Pick the finding you'd put in the first line of your brief.`,
    coach:
      "A query isn't an analysis until someone can repeat its conclusion from memory. Say it, own it, and check it against your own numbers — that's the whole job.",
    hints: ["Look at your Stage D split (or your executive row) — the answer is already on your screen."],
    starter: "",
    xp: xpForDifficulty("medium"),
    expected: pickAnswer,
    check: () => ({ pass: false, feedback: "Pick your answer below — this one is graded by choice, not by query." }),
    pick: {
      options: pickOptions,
      answer: pickAnswer,
      explain: `"${pickAnswer}" leads with ${fmt(pickCount)} rows. Your executive row's ${
        hasGroup ? "top_group" : "count"
      } should say exactly the same — if it doesn't, one of you is lying, and finding out which is the job.`,
    },
  });

  return qs;
}

// ---- the story -----------------------------------------------------------------

function buildStory(parse: GymParse, profile: GymProfile, domainLabel: string): string {
  const worst = profile.columns
    .filter((c) => c.flags.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);
  const parts: string[] = [];
  parts.push(
    `${parse.table} lands with ${fmt(profile.rowCount)} rows and ${parse.columns.length} columns — and I can already smell the trouble.`,
  );
  if (worst.length > 0)
    parts.push(`${worst.map((c) => `${c.name} (${c.detail})`).join(" and ")} — that's where we'll start digging.`);
  if (profile.dupRows > 0)
    parts.push(`There ${profile.dupRows === 1 ? "is" : "are"} ${profile.dupRows} exact duplicate row${profile.dupRows === 1 ? "" : "s"} wearing a real record's clothes.`);
  parts.push(
    `This reads like ${domainLabel}. We go A to Z: meet it, audit it, describe it, break it down, slice time, rank it — then brief your stakeholder like a pro. I'll be at every question, and whenever one feels alien, I'll hand you the exact lesson that teaches it.`,
  );
  return parts.join(" ");
}

// ---- the assembler ---------------------------------------------------------------

/** Mirror of the gym's top-clean group-column pick — Stage D skips this
 *  column so the two never compete. */
function gymTopCleanCol(parse: GymParse, profile: GymProfile): string | null {
  const textCols = profile.columns.filter((c) => c.type === "TEXT");
  const caseHit = textCols.find((c) => c.flags.some((f) => f.id === "case"));
  if (caseHit) return caseHit.name;
  const hit = textCols.find(
    (c) => c.nulls < parse.rows.length && c.distinct > 1 && c.distinct <= Math.max(8, parse.rows.length / 2),
  );
  return hit?.name ?? null;
}

export function buildCapstone(parse: GymParse, profile: GymProfile): CapstoneProject {
  const t = parse.table;
  const domain = detectDomain(parse.rawHeaders, t);
  const roles = detectRoles(parse);
  const topClean = gymTopCleanCol(parse, profile);
  const caseCol =
    profile.columns.find((c) => c.flags.some((f) => f.id === "case"))?.name ?? null;

  const aQs = buildA(t, parse);
  const bQs = buildB(parse, profile);
  const cQs = buildC(t, parse, roles, caseCol);
  const dRes = buildD(t, parse, roles, topClean);
  const dateRole = roles.find((r) => r.role === "date");
  const months = dateRole ? monthCounts(parse, dateRole.name) : null;
  const eQs = months ? buildE(t, months) : [];
  const fQs = buildF(t, parse, roles, months, dRes.groupCol);
  const gQs = buildG(t, parse, domain, roles, dRes.qs.length > 0, dRes.groupCol);

  // The Brief's conclusion pick: the leading group (or the row count when
  // no group dimension exists)
  let pickAnswer = String(parse.rows.length);
  let pickCount = parse.rows.length;
  let pickOptions: string[] = [];
  if (dRes.groupCol) {
    const ranked = groupsRanked(parse, dRes.groupCol);
    pickAnswer = ranked[0][0];
    pickCount = ranked[0][1];
    pickOptions = ranked.slice(0, 4).map(([v]) => v);
    if (!pickOptions.includes(pickAnswer)) pickOptions.unshift(pickAnswer);
  } else {
    pickOptions = [pickAnswer];
  }
  const hQs = buildH(t, parse, dRes.groupCol, pickOptions, pickAnswer, pickCount);

  const questions = [...aQs, ...bQs, ...cQs, ...dRes.qs, ...eQs, ...fQs, ...gQs, ...hQs];
  const byStage = new Map<CapStageId, number>();
  for (const q of questions) byStage.set(q.stage, (byStage.get(q.stage) ?? 0) + 1);
  const stages = CAP_STAGES.filter((s) => (byStage.get(s.id) ?? 0) > 0);

  return {
    domain,
    domainLabel: DOMAIN_LABEL[domain],
    story: buildStory(parse, profile, DOMAIN_LABEL[domain]),
    stages,
    questions,
  };
}
