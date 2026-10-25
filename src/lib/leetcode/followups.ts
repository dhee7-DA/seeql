// The Follow-up Gauntlet — mutation engine for interviewer-style push-backs.
//
// Every SQL dive ships a working model solution. This module can DERIVE new
// graded challenges from that solution: flip the sort, raise the top-N cutoff,
// swap the ranking family, complement the filter… Each mutation is a pure
// string transform, so the SAME code runs in two places:
//
//   1. scripts/lc-followups-gen.ts (build time, bun:sqlite) — tries every
//      mutation against the real seed data and only promotes the ones that
//      run, differ from the original, and stay meaningful → followup-specs.ts
//   2. the UI (runtime) — re-applies the promoted transform to show the
//      statement, reveal the model SQL after a pass, and grade through the
//      same /api/lc-sql + gradeSqlResult pipeline as the base problem.
//
// Trust model: nothing ships that the generator did not execute successfully
// against the problem's own seeded database.

import type { LcSqlDive } from "./types";

/* ------------------------------------------------------------------ */
/* Mutation kinds                                                      */
/* ------------------------------------------------------------------ */

export type FuKind =
  | "rank-swap" // ROW_NUMBER ↔ RANK ↔ DENSE_RANK — the ties follow-up
  | "top-n" // per-group window cutoff changed (rn <= 3 → 5)
  | "min-max" // MAX ↔ MIN — flip the extremum
  | "agg-swap" // SUM → AVG — averages instead of totals
  | "having" // HAVING threshold moved ±1
  | "limit-grow" // LIMIT n → n+3 — "top 8 instead of top 5"
  | "limit-add" // no LIMIT + ORDER BY → cap at first 3
  | "order-flip" // ASC ↔ DESC — bottom-up presentation
  | "where-not" // NOT (original filter) — the complement set
  | "distinct-drop" // SELECT DISTINCT → allow duplicates
  | "having-add" // GROUP BY without HAVING → gate at COUNT(*) >= 2
  | "cte-wrap"; // refactor: the whole query into one CTE named result

export interface FuSpec {
  kind: FuKind;
  /** parameter (new limit, new threshold, target function…) */
  param?: string;
}

export interface FuDerived {
  statement: string;
  modelSql: string;
  hint: string;
  /** exact = row order graded (sort is the point); any = compared as a set */
  order: "exact" | "any";
}

/* ------------------------------------------------------------------ */
/* SQL text helpers (top-level clause aware, string/comment safe)      */
/* ------------------------------------------------------------------ */

/** Strip -- comments (string-literal aware) and collapse whitespace. */
export function stripComments(sql: string): string {
  return sql
    .split("\n")
    .map((line) => {
      let inStr = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === "'") inStr = !inStr;
        else if (!inStr && line[i] === "-" && line[i + 1] === "-") return line.slice(0, i);
      }
      return line;
    })
    .join("\n")
    .replace(/\s+/g, " ")
    .trim();
}

/** Char-level scan state: which positions are real SQL code, and the paren
 *  depth at each. Skips single-quoted strings and -- comments. */
function scanState(sql: string): { depth: Int32Array; code: Uint8Array } {
  const n = sql.length;
  const depth = new Int32Array(n);
  const code = new Uint8Array(n);
  let d = 0;
  let inStr = false;
  for (let i = 0; i < n; i++) {
    const ch = sql[i];
    if (inStr) {
      if (ch === "'") inStr = false;
      continue;
    }
    if (ch === "'") {
      inStr = true;
      continue;
    }
    if (ch === "-" && sql[i + 1] === "-") {
      const nl = sql.indexOf("\n", i);
      i = (nl === -1 ? n : nl) - 1; // comment runs to end of line
      continue;
    }
    if (ch === "(") d++;
    else if (ch === ")") d = Math.max(0, d - 1);
    depth[i] = d;
    code[i] = 1;
  }
  return { depth, code };
}

/** First `kw` occurrence that is real, top-level SQL code. */
function findTopLevel(sql: string, kw: string): number {
  const { depth, code } = scanState(sql);
  const re = new RegExp(`\\b${kw}\\b`, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql))) {
    if (code[m.index] && depth[m.index] === 0) return m.index;
  }
  return -1;
}

/** End of the top-level clause starting at `start` — the next top-level
 *  keyword among `next`, or end of string. */
function clauseSpan(sql: string, start: number, next: string[]): number {
  const { depth, code } = scanState(sql);
  const re = new RegExp(`\\b(${next.join("|")})\\b`, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql))) {
    if (m.index > start && code[m.index] && depth[m.index] === 0) return m.index;
  }
  return sql.length;
}

const CLAUSE_NEXT = ["group\\s+by", "having", "order\\s+by", "limit", "window", "union", "intersect", "except"];

/* ------------------------------------------------------------------ */
/* The transforms — each returns null when it does not apply           */
/* ------------------------------------------------------------------ */

function mutOrderFlip(code: string): string | null {
  const i = findTopLevel(code, "order\\s+by");
  if (i < 0) return null;
  const end = clauseSpan(code, i, CLAUSE_NEXT);
  const clause = code.slice(i, end);
  if (!/\b(asc|desc)\b/i.test(clause)) {
    // A trailing `;` (and any trailing space) sits inside the clause span when
    // ORDER BY is the last clause — DESC must land BEFORE it, not after.
    const semi = clause.lastIndexOf(";");
    if (semi >= 0) return `${code.slice(0, i)}${clause.slice(0, semi)} DESC${clause.slice(semi)}${code.slice(end)}`;
    return `${code.slice(0, i)}${clause} DESC${code.slice(end)}`;
  }
  const flipped = clause.replace(/\basc\b/gi, "§§A").replace(/\bdesc\b/gi, "ASC").replace(/§§A/g, "DESC");
  return `${code.slice(0, i)}${flipped}${code.slice(end)}`;
}

function mutLimitGrow(code: string): { sql: string; from: number; to: number } | null {
  const i = findTopLevel(code, "limit");
  if (i < 0) return null;
  const m = /\d+/.exec(code.slice(i, i + 16));
  if (!m) return null;
  const to = Number(m[0]) + 3;
  return { sql: code.slice(0, i + m.index) + String(to) + code.slice(i + m.index + m[0].length), from: Number(m[0]), to };
}

function mutLimitAdd(code: string, n = 3): string | null {
  if (findTopLevel(code, "limit") >= 0) return null;
  if (findTopLevel(code, "order\\s+by") < 0) return null; // top-K must be deterministic
  return `${code} LIMIT ${n}`;
}

const RANK_FNS = ["ROW_NUMBER", "RANK", "DENSE_RANK"] as const;
function mutRankSwap(code: string): { sql: string; from: string; to: string } | null {
  for (const fn of RANK_FNS) {
    const re = new RegExp(`\\b${fn}\\s*\\(`, "i");
    if (re.test(code)) {
      const to = fn === "ROW_NUMBER" ? "RANK" : fn === "RANK" ? "DENSE_RANK" : "ROW_NUMBER";
      return { sql: code.replace(re, `${to}(`), from: fn, to };
    }
  }
  return null;
}

function mutMinMax(code: string): { sql: string; to: "min" | "max" } | null {
  if (/\bMAX\s*\(/i.test(code)) return { sql: code.replace(/\bMAX\s*\(/gi, "MIN("), to: "min" };
  if (/\bMIN\s*\(/i.test(code)) return { sql: code.replace(/\bMIN\s*\(/gi, "MAX("), to: "max" };
  return null;
}

function mutAggSwap(code: string): string | null {
  if (/\bAVG\s*\(/i.test(code)) return null; // already averaging
  if (!/\bSUM\s*\(/i.test(code)) return null;
  return code.replace(/\bSUM\s*\(/gi, "AVG(");
}

function mutHaving(code: string, bump: 1 | -1): { sql: string; to: string } | null {
  const i = findTopLevel(code, "having");
  if (i < 0) return null;
  const end = clauseSpan(code, i, CLAUSE_NEXT);
  const clause = code.slice(i, end);
  const m = /(>=|<=|=|>|<)\s*(\d+(?:\.\d+)?)/.exec(clause);
  if (!m) return null;
  const to = String(Math.round((Number(m[2]) + bump) * 100) / 100);
  const next = clause.slice(0, m.index) + m[1] + " " + to + clause.slice(m.index + m[0].length);
  return { sql: code.slice(0, i) + next + code.slice(end), to };
}

const RANK_ALIASES = /^(rn|rk|rnk|r_num|row_num|rownum|rnum|dr|drk|drank|rank|dense|seq|pos|rec_num|rec_rank)$/i;
function mutTopN(code: string, bump: 1 | -1): { sql: string; to: number } | null {
  if (!/\bover\s*\(/i.test(code) || !/\bpartition\s+by\b/i.test(code)) return null;
  const re = /\b([a-z_][a-z0-9_]*)\s*(<=|=)\s*(\d+)\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    if (!RANK_ALIASES.test(m[1])) continue;
    const cur = Number(m[3]);
    const to = cur + bump;
    if (to < 1) continue;
    return { sql: code.slice(0, m.index) + `${m[1]} ${m[2]} ${to}` + code.slice(m.index + m[0].length), to };
  }
  return null;
}

function mutWhereNot(code: string): string | null {
  const i = findTopLevel(code, "where");
  if (i < 0) return null;
  const end = clauseSpan(code, i, CLAUSE_NEXT);
  const cond = code.slice(i + 5, end).trim();
  if (!cond) return null;
  return `${code.slice(0, i)}WHERE NOT (${cond})${code.slice(end)}`;
}

function mutDistinctDrop(code: string): string | null {
  const i = findTopLevel(code, "distinct");
  if (i < 0) return null;
  return `${code.slice(0, i).replace(/\s+$/, "")} ${code.slice(i + "distinct".length).replace(/^\s+/, "")}`;
}

/** GROUP BY without HAVING → gate the groups at two or more members. */
function mutHavingAdd(code: string): string | null {
  if (findTopLevel(code, "having") >= 0) return null;
  const i = findTopLevel(code, "group\\s+by");
  if (i < 0) return null;
  const end = clauseSpan(code, i, CLAUSE_NEXT);
  return `${code.slice(0, end).replace(/\s+$/, "")} HAVING COUNT(*) >= 2${end === code.length ? "" : " "}${code.slice(end)}`;
}

/** The universal refactor push: same rows, the pipeline wrapped as a CTE.
 *  Output-preserving, so the generator promotes it only when the wrapped
 *  query returns EXACTLY the baseline (order-aware) — never when it drifts. */
function mutCteWrap(code: string): string | null {
  const body = code.replace(/;+\s*$/, "").trim();
  if (!/^(select|with)\b/i.test(body)) return null; // SELECT/WITH pipelines only
  return `WITH result AS (${body}) SELECT * FROM result`;
}

/* --- drill-only mutations: plausible WRONG outputs, never follow-ups --- */

function mutHavingDrop(code: string): string | null {
  const i = findTopLevel(code, "having");
  if (i < 0) return null;
  const end = clauseSpan(code, i, CLAUSE_NEXT);
  return `${code.slice(0, i).replace(/\s+$/, "")} ${code.slice(end).replace(/^\s+/, "")}`;
}

function mutGroupDrop(code: string): string | null {
  if (!/\b(count|sum|avg|min|max)\s*\(/i.test(code)) return null;
  const i = findTopLevel(code, "group\\s+by");
  if (i < 0) return null;
  const end = clauseSpan(code, i, CLAUSE_NEXT);
  return `${code.slice(0, i).replace(/\s+$/, "")} ${code.slice(end).replace(/^\s+/, "")}`;
}

function mutLimitShrink(code: string): string | null {
  const i = findTopLevel(code, "limit");
  if (i < 0) return null;
  const m = /\d+/.exec(code.slice(i, i + 16));
  if (!m || Number(m[0]) < 2) return null;
  return code.slice(0, i + m.index) + String(Number(m[0]) - 1) + code.slice(i + m.index + m[0].length);
}

function mutOffsetShift(code: string): string | null {
  const i = findTopLevel(code, "limit");
  if (i < 0) return null;
  if (/offset\s+\d+/i.test(code.slice(i))) return null;
  const end = clauseSpan(code, i, ["offset", "union", "intersect", "except"]);
  return `${code.slice(0, end).replace(/\s+$/, "")} OFFSET 1${code.slice(end)}`;
}

function mutDistinctAdd(code: string): string | null {
  if (findTopLevel(code, "distinct") >= 0) return null;
  const sel = findTopLevel(code, "select");
  if (sel < 0) return null;
  return `${code.slice(0, sel + 6)} DISTINCT${code.slice(sel + 6)}`;
}

function mutDropOrder(code: string): string | null {
  const i = findTopLevel(code, "order\\s+by");
  if (i < 0) return null;
  const end = clauseSpan(code, i, ["limit", "offset", "union", "intersect", "except"]);
  return `${code.slice(0, i).replace(/\s+$/, "")} ${code.slice(end).replace(/^\s+/, "")}`;
}

/** Remove the top-level WHERE clause (predict-drill distractor). */
function mutDropWhere(code: string): string | null {
  const i = findTopLevel(code, "where");
  if (i < 0) return null;
  const end = clauseSpan(code, i, CLAUSE_NEXT);
  return `${code.slice(0, i).replace(/\s+$/, "")} ${code.slice(end).replace(/^\s+/, "")}`;
}

/* ------------------------------------------------------------------ */
/* Statement templates — the interviewer's voice                       */
/* ------------------------------------------------------------------ */

const STATEMENTS: Record<FuKind, (param?: string) => string> = {
  "rank-swap": (p) =>
    p === "ROW_NUMBER"
      ? "The interviewer pushes: every row needs its own position — break the ties apart and re-rank, gaps included."
      : "The interviewer pushes: ties must share a rank now — and the next rank must not skip. Switch the ranking function.",
  "top-n": (p) => `The interviewer pushes: the per-group cutoff moved to ${p ?? "N"} — adjust the window filter.`,
  "min-max": (p) =>
    p === "min"
      ? "The interviewer pushes: flip the extremum — I want the smallest, not the largest."
      : "The interviewer pushes: flip the extremum — I want the largest, not the smallest.",
  "agg-swap": () => "The interviewer pushes: averages, not totals — swap the aggregate and keep the grouping honest.",
  having: (p) => `The interviewer pushes: the bar just moved — the threshold is now ${p ?? "…"} in the HAVING clause.`,
  "limit-grow": (p) => `The interviewer pushes: the ask changed — return the top ${p ?? "N"} instead. Your ORDER BY stays; the cap moves.`,
  "limit-add": (p) => `The interviewer pushes: leadership only wants the first ${p ?? "3"} rows — cap the result.`,
  "order-flip": () => "The interviewer pushes: same numbers, bottom-up — reverse the presentation order.",
  "where-not": () => "The interviewer pushes: give me the complement — everyone the original filter would have excluded.",
  "distinct-drop": () => "The interviewer pushes: drop the DISTINCT — show every raw row, duplicates included.",
  "having-add": () => "The interviewer pushes: keep only the groups with at least two members — add the HAVING gate.",
  "cte-wrap": () => "The interviewer pushes: restructure it — same rows, but the whole pipeline lives in one CTE named result.",
};

const HINTS: Record<FuKind, string> = {
  "rank-swap": "ROW_NUMBER counts positions, RANK ties-and-skips, DENSE_RANK ties-and-continues.",
  "top-n": "The cutoff lives in the outer WHERE on the window alias — change the number, nothing else.",
  "min-max": "One aggregate keyword changes; the GROUP BY contract stays exactly the same.",
  "agg-swap": "AVG ignores NULLs and returns a float — the grouping and join work is untouched.",
  having: "HAVING filters after aggregation — only the comparison moves.",
  "limit-grow": "LIMIT caps rows after ORDER BY — raise the number, keep the sort.",
  "limit-add": "ORDER BY makes the top-K well-defined; LIMIT n takes the first n of it.",
  "order-flip": "Swap the direction keyword on every ORDER BY key — the keys themselves stay.",
  "where-not": "NOT (…) inverts the predicate — watch what NULL rows do under NOT.",
  "distinct-drop": "Delete DISTINCT and the engine shows every underlying row it collapsed.",
  "having-add": "HAVING filters groups after aggregation — COUNT(*) >= 2 keeps groups with two or more rows.",
  "cte-wrap": "WITH result AS ( …your entire query… ) SELECT * FROM result — the clauses stay in the same order.",
};

/** Apply a promoted spec to a dive — deterministic on both sides. */
export function deriveFollowUp(dive: LcSqlDive, spec: FuSpec): FuDerived | null {
  const code = stripComments(dive.code);
  let sql: string | null = null;
  switch (spec.kind) {
    case "order-flip":
      sql = mutOrderFlip(code);
      break;
    case "limit-grow": {
      const r = mutLimitGrow(code);
      if (r) sql = r.sql;
      break;
    }
    case "limit-add":
      sql = mutLimitAdd(code, Number(spec.param ?? 3));
      break;
    case "rank-swap": {
      const r = mutRankSwap(code);
      if (r) sql = r.sql;
      break;
    }
    case "min-max": {
      const r = mutMinMax(code);
      if (r) sql = r.sql;
      break;
    }
    case "agg-swap":
      sql = mutAggSwap(code);
      break;
    case "having": {
      const r = mutHaving(code, spec.param?.startsWith("-") ? -1 : 1);
      if (r) sql = r.sql;
      break;
    }
    case "top-n": {
      const r = mutTopN(code, spec.param?.startsWith("-") ? -1 : 1);
      if (r) sql = r.sql;
      break;
    }
    case "where-not":
      sql = mutWhereNot(code);
      break;
    case "distinct-drop":
      sql = mutDistinctDrop(code);
      break;
    case "having-add":
      sql = mutHavingAdd(code);
      break;
    case "cte-wrap":
      sql = mutCteWrap(code);
      break;
  }
  if (!sql) return null;
  const order: FuDerived["order"] = /\border\s+by\b/i.test(sql) && dive.order === "exact" ? "exact" : "any";
  return {
    statement: STATEMENTS[spec.kind](spec.param?.replace(/^-/, "")),
    modelSql: sql,
    hint: HINTS[spec.kind],
    order,
  };
}

/* ------------------------------------------------------------------ */
/* Candidate enumeration (generator side)                              */
/* ------------------------------------------------------------------ */

/** All candidate specs for a dive, in promotion-preference order. */
export function fuCandidates(dive: LcSqlDive): FuSpec[] {
  const code = stripComments(dive.code);
  const out: FuSpec[] = [];
  const rank = mutRankSwap(code);
  if (rank) out.push({ kind: "rank-swap", param: rank.to });
  const topUp = mutTopN(code, 1);
  if (topUp) out.push({ kind: "top-n", param: String(topUp.to) });
  const mm = mutMinMax(code);
  if (mm) out.push({ kind: "min-max", param: mm.to });
  if (mutAggSwap(code)) out.push({ kind: "agg-swap" });
  const hav = mutHaving(code, 1);
  if (hav) out.push({ kind: "having", param: hav.to });
  const lim = mutLimitGrow(code);
  if (lim) out.push({ kind: "limit-grow", param: String(lim.to) });
  if (mutLimitAdd(code)) out.push({ kind: "limit-add", param: "3" });
  if (dive.order === "exact" && mutOrderFlip(code)) out.push({ kind: "order-flip" });
  if (mutWhereNot(code)) out.push({ kind: "where-not" });
  if (mutDistinctDrop(code)) out.push({ kind: "distinct-drop" });
  if (mutHavingAdd(code)) out.push({ kind: "having-add" });
  if (mutCteWrap(code)) out.push({ kind: "cte-wrap" }); // universal fallback
  return out;
}

/** Distractor specs for Predict-the-Output, in try order — drill-only
 *  mutations included (plausible wrong tables, not graded challenges). */
export function fuDistractorSpecs(dive: LcSqlDive): FuSpec[] {
  const code = stripComments(dive.code);
  const out: FuSpec[] = [];
  if (mutDropWhere(code)) out.push({ kind: "where-not", param: "drop" }); // marker — applyFn swaps in dropWhere
  const rank = mutRankSwap(code);
  if (rank) out.push({ kind: "rank-swap", param: rank.to });
  const mm = mutMinMax(code);
  if (mm) out.push({ kind: "min-max", param: mm.to });
  if (mutHavingDrop(code)) out.push({ kind: "having", param: "drop" });
  if (mutGroupDrop(code)) out.push({ kind: "agg-swap", param: "drop-group" });
  if (mutOffsetShift(code)) out.push({ kind: "limit-grow", param: "offset" });
  if (mutLimitShrink(code)) out.push({ kind: "limit-grow", param: "shrink" });
  if (mutAggSwap(code)) out.push({ kind: "agg-swap" });
  const hav = mutHaving(code, 1);
  if (hav) out.push({ kind: "having", param: hav.to });
  const lim = mutLimitGrow(code);
  if (lim) out.push({ kind: "limit-grow", param: String(lim.to) });
  const topUp = mutTopN(code, 1);
  if (topUp) out.push({ kind: "top-n", param: String(topUp.to) });
  if (mutDistinctAdd(code)) out.push({ kind: "distinct-drop", param: "add" });
  if (mutDistinctDrop(code)) out.push({ kind: "distinct-drop" });
  if (dive.order === "exact" && mutDropOrder(code)) out.push({ kind: "order-flip", param: "drop" });
  if (dive.order === "exact" && mutOrderFlip(code)) out.push({ kind: "order-flip" });
  if (mutWhereNot(code)) out.push({ kind: "where-not" });
  if (mutHavingAdd(code)) out.push({ kind: "having-add" });
  return out;
}

/** Apply a spec — including the drill-only marker params — to model SQL. */
export function applyFuSpec(dive: LcSqlDive, spec: FuSpec): string | null {
  const code = stripComments(dive.code);
  if (spec.kind === "where-not" && spec.param === "drop") return mutDropWhere(code);
  if (spec.kind === "having" && spec.param === "drop") return mutHavingDrop(code);
  if (spec.kind === "agg-swap" && spec.param === "drop-group") return mutGroupDrop(code);
  if (spec.kind === "limit-grow" && spec.param === "offset") return mutOffsetShift(code);
  if (spec.kind === "limit-grow" && spec.param === "shrink") return mutLimitShrink(code);
  if (spec.kind === "distinct-drop" && spec.param === "add") return mutDistinctAdd(code);
  if (spec.kind === "order-flip" && spec.param === "drop") return mutDropOrder(code);
  return deriveFollowUp(dive, spec)?.modelSql ?? null;
}

/** Human label for a distractor origin (drill feedback). */
export function fuDistractorLabel(spec: FuSpec): string {
  if (spec.kind === "where-not" && spec.param === "drop") return "forgot the WHERE filter";
  if (spec.kind === "having" && spec.param === "drop") return "dropped the HAVING gate";
  if (spec.kind === "agg-swap" && spec.param === "drop-group") return "forgot the GROUP BY";
  if (spec.kind === "limit-grow" && spec.param === "offset") return "skipped the first row (OFFSET 1)";
  if (spec.kind === "limit-grow" && spec.param === "shrink") return "capped one row short";
  if (spec.kind === "distinct-drop" && spec.param === "add") return "collapsed duplicates with DISTINCT";
  if (spec.kind === "order-flip" && spec.param === "drop") return "lost the ORDER BY";
  switch (spec.kind) {
    case "rank-swap":
      return `used ${spec.param} instead of the right ranking function`;
    case "order-flip":
      return "sorted in the opposite direction";
    case "min-max":
      return `took the ${spec.param === "min" ? "minimum" : "maximum"} instead`;
    case "agg-swap":
      return "averaged instead of summing";
    case "having":
      return `kept the old HAVING bar (${spec.param})`;
    case "limit-grow":
      return `capped at ${spec.param} rows`;
    case "top-n":
      return `used a per-group cutoff of ${spec.param}`;
    case "distinct-drop":
      return "kept duplicate rows";
    case "where-not":
      return "negated the filter instead";
    case "having-add":
      return "gated the groups at two or more members";
    default:
      return "a near miss";
  }
}

/* ------------------------------------------------------------------ */
/* Constraint runs — challenge modifiers on the base problem           */
/* ------------------------------------------------------------------ */

export type SqlMod = "no-sub" | "one-cte" | "no-join" | "golf";

export const SQL_MODS: Array<{ id: SqlMod; label: string; blurb: string }> = [
  { id: "no-sub", label: "No subqueries", blurb: "flat queries only — CTEs are your friends" },
  { id: "one-cte", label: "One CTE max", blurb: "a single WITH, however you structure it" },
  { id: "no-join", label: "No JOIN keyword", blurb: "correlate with EXISTS / IN or comma-joins" },
  { id: "golf", label: "Code golf", blurb: "shortest correct query wins" },
];

export const modXpKey = (slug: string, mod: SqlMod) => `lc-mod:${slug}:${mod}`;
export const fuXpKey = (slug: string, idx: number) => `lc-fu:${slug}:${idx}`;
export const readXpKey = (slug: string) => `lc-read:${slug}`;
export const cleanKey = (slug: string) => `lc-clean:${slug}`;

/** Golf cap: 1.6× the model's length, generous but real. */
export function golfCap(dive: LcSqlDive): number {
  return Math.ceil(stripComments(dive.code).length * 1.6);
}

export interface ModViolation {
  mod: SqlMod;
  why: string;
}

/** Validate the user's SQL against the active modifiers (client-side, before grading). */
export function checkMods(sql: string, mods: SqlMod[], cap?: number): ModViolation[] {
  const v: ModViolation[] = [];
  const s = stripComments(sql);
  if (mods.includes("no-sub") && /\(\s*(select|with)\b/i.test(s))
    v.push({ mod: "no-sub", why: "a subquery crept in — flatten it with a CTE, an EXISTS, or a join" });
  if (mods.includes("one-cte")) {
    const withs = (s.match(/\bwith\b/gi) ?? []).length + (s.match(/\)\s*,\s*[a-z_][a-z0-9_]*\s+as\s*\(/gi) ?? []).length;
    if (withs > 1) v.push({ mod: "one-cte", why: "more than one CTE — chain the logic inside a single WITH" });
  }
  if (mods.includes("no-join") && /\bjoin\b/i.test(s))
    v.push({ mod: "no-join", why: "the JOIN keyword is banned — try EXISTS / IN, or a comma-join in FROM" });
  if (mods.includes("golf") && cap !== undefined && s.length > cap)
    v.push({ mod: "golf", why: `${s.length} chars — the cap is ${cap}. Trim spacing, alias shorter.` });
  return v;
}

/** Nudge ladder for the base problem — derived, never the raw solution. */
export function nudgeFunctions(dive: LcSqlDive): string[] {
  const code = stripComments(dive.code);
  const fns = new Set<string>();
  for (const re of [
    /\b(ROW_NUMBER|RANK|DENSE_RANK|NTILE|LAG|LEAD|FIRST_VALUE|LAST_VALUE)\s*\(/gi,
    /\b(COUNT|SUM|AVG|MIN|MAX|ROUND|COALESCE|CAST|ABS|LENGTH|UPPER|LOWER|SUBSTR|REPLACE|DATE|STRFTIME|JULIANDAY|IFNULL|NULLIF|IIF)\s*\(/gi,
    /\b(DISTINCT|CASE|EXISTS|UNION ALL?|INTERSECT|EXCEPT)\b/gi,
    /\b(PARTITION BY|OVER|WITH|GROUP BY|HAVING|ORDER BY|LIMIT|JOIN)\b/gi,
  ]) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(code))) fns.add(m[1].toUpperCase());
  }
  return [...fns].slice(0, 10);
}
