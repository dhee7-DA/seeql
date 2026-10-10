// Messy Data Gym — the engine. Takes any CSV (Stratasearch export, CRM
// dump, government spreadsheet…), profiles the mess EXACTLY the way the
// sandbox route stores it (shared lib/csv-table machinery — no drift),
// generates graded practice missions whose expected answers are computed
// from the real data, and can inject realistic mess into a clean file so
// there is always something to clean.
//
// Design rules:
//  - Checkers grade the RESULT (shape + values), never the SQL text —
//    same philosophy as lib/missions.ts. Two learners, two queries, both
//    right: both pass.
//  - Every expected value derives from parseForTable(), which mirrors
//    api/sandbox byte-for-byte. If the profile says 7 nulls, the database
//    holds 7 nulls.
//  - Pure functions + data. No React, no storage, no fetch — the view
//    brings the interactivity, XP flows through awardPracticeXp().

import { xpForDifficulty, type Difficulty } from "./curriculum/gamification";
import {
  cellAsStored,
  parseCsv,
  sniffDelimiter,
  type GymParse,
  type SandboxColType,
} from "./csv-table";
import type { CellValue, ExecResult } from "./sql-types";

// ---- profiling -------------------------------------------------------------

export type GymFlagId = "nulls" | "whitespace" | "case" | "junk" | "dates";

export interface GymFlag {
  id: GymFlagId;
  label: string;
  /** cells (or rows) affected */
  count: number;
  /** one offending stored value, for the report UI */
  example?: string;
}

export interface GymColumnProfile {
  name: string;
  rawHeader: string;
  type: SandboxColType;
  /** stored NULLs (empty cells) */
  nulls: number;
  distinct: number;
  flags: GymFlag[];
  /** the loudest issue, one line, for the report */
  detail: string;
  /** 0–100 mess score for this column */
  score: number;
}

export interface GymProfile {
  columns: GymColumnProfile[];
  rowCount: number;
  /** rows that are exact duplicates of an earlier row (stored view) */
  dupRows: number;
  /** 0–100 table mess score */
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  gradeLine: string;
}

const INTERNAL_WS_RE = /\S(\s{2,})\S/; // doubled internal spaces / tabs
const DECORATED_NUM_RE = /^\s*[$€£]?\s*-?[\d,]+(\.\d+)?\s*%?\s*$/;
const PLACEHOLDER_RE = /^(n\/?a|na|-{1,2}|tbd|unknown|null|none|nil|\?)$/i;
const NUM_PREFIX_RE = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLASH_DATE_RE = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
const DMON_DATE_RE = /^\d{1,2}-[A-Za-z]{3,}-\d{4}$/;
const MOND_DATE_RE = /^[A-Za-z]{3,}\s+\d{1,2},?\s+\d{4}$/;

function dateSignature(v: string): "iso" | "slash" | "dmon" | "mond" | null {
  if (ISO_DATE_RE.test(v)) return "iso";
  if (SLASH_DATE_RE.test(v)) return "slash";
  if (DMON_DATE_RE.test(v)) return "dmon";
  if (MOND_DATE_RE.test(v)) return "mond";
  return null;
}

/** SQLite CAST(x AS REAL) semantics: parse the leading numeric prefix,
 *  everything else is 0. The junk-sum mission's expected value uses this
 *  so any reasonable REPLACE+CAST attempt agrees with the checker. */
function sqliteCastReal(s: string): number {
  const m = NUM_PREFIX_RE.exec(s.trim());
  return m ? Number.parseFloat(m[0]) : 0;
}

/** Strip the decorations the junk-sum prompt promises to allow: currency
 *  symbols, thousands commas, percent signs, padding spaces. */
export function stripNumericDecor(s: string): string {
  return s.replace(/[$€£%,\s]/g, "");
}

interface CellStats {
  stored: Array<string | number | null>;
  nulls: number;
  internalWs: number;
  caseExcess: number;
  caseDistinctLower: number;
  caseExample?: string;
  junkCells: number;
  junkExample?: string;
  junkSum: number;
  dateSigs: Map<"iso" | "slash" | "dmon" | "mond", number>;
}

function cellStats(parse: GymParse, ci: number): CellStats {
  const type = parse.columns[ci].type;
  const stored: Array<string | number | null> = [];
  let nulls = 0;
  let internalWs = 0;
  let caseExcess = 0;
  let caseExample: string | undefined;
  let junkCells = 0;
  let junkExample: string | undefined;
  let junkSum = 0;
  const dateSigs = new Map<"iso" | "slash" | "dmon" | "mond", number>();

  const lowerGroups = new Map<string, Set<string>>();
  for (const row of parse.rows) {
    const raw = row[ci] ?? "";
    const v = cellAsStored(raw, type);
    stored.push(v);
    if (v === null) {
      nulls++;
      continue;
    }
    const s = String(v);
    if (typeof v === "string") {
      if (INTERNAL_WS_RE.test(s)) internalWs++;
      const key = s.toLowerCase();
      const group = lowerGroups.get(key) ?? new Set<string>();
      group.add(s);
      lowerGroups.set(key, group);
      // junk numerics: decorated numbers or placeholder tokens in a TEXT column
      if (type === "TEXT") {
        if (DECORATED_NUM_RE.test(s) && /[$€£%,]/.test(s)) {
          junkCells++;
          junkExample ??= s;
        } else if (PLACEHOLDER_RE.test(s)) {
          junkCells++;
          junkExample ??= s;
        }
        // the junk-sum expected value follows the PROMPT's rule over the
        // whole column (strip $ , % spaces; non-numbers count 0) — exactly
        // what SUM(CAST(REPLACE(...) AS REAL)) computes in SQLite
        junkSum += sqliteCastReal(stripNumericDecor(s));
      }
    }
    if (typeof v === "string") {
      const sig = dateSignature(v);
      if (sig) dateSigs.set(sig, (dateSigs.get(sig) ?? 0) + 1);
    }
  }
  for (const group of lowerGroups.values()) {
    if (group.size > 1) {
      caseExcess += group.size;
      // example: the least common variant reads best in the report
      caseExample ??= [...group].sort().slice(1)[0] ?? [...group][0];
    }
  }
  return {
    stored,
    nulls,
    internalWs,
    caseExcess,
    caseDistinctLower: lowerGroups.size,
    caseExample,
    junkCells,
    junkExample,
    junkSum,
    dateSigs,
  };
}

function colScore(nulls: number, flags: GymFlag[], filled: number): number {
  const density = filled > 0 ? nulls / filled : 0;
  let s = Math.min(30, density * 60); // up to 30 for heavy nulls
  for (const f of flags) {
    if (f.id === "junk") s += 25;
    if (f.id === "case") s += 20;
    if (f.id === "dates") s += 15;
    if (f.id === "whitespace") s += 10;
  }
  return Math.round(Math.min(100, s));
}

export function profileGym(parse: GymParse): GymProfile {
  const rowCount = parse.rows.length;
  const columns: GymColumnProfile[] = parse.columns.map((c, ci) => {
    const st = cellStats(parse, ci);
    const filled = rowCount - st.nulls;
    const flags: GymFlag[] = [];
    if (st.nulls > 0) flags.push({ id: "nulls", label: "blanks", count: st.nulls });
    if (st.junkCells > 0)
      flags.push({ id: "junk", label: "numbers stored as text", count: st.junkCells, example: st.junkExample });
    if (st.caseExcess > 0)
      flags.push({ id: "case", label: "case chaos", count: st.caseExcess, example: st.caseExample });
    const sigs = [...st.dateSigs.entries()].filter(([, n]) => n > 0);
    if (sigs.length >= 2)
      flags.push({ id: "dates", label: "mixed date formats", count: sigs.reduce((a, [, n]) => a + n, 0) });
    if (st.internalWs > 0)
      flags.push({ id: "whitespace", label: "double spaces", count: st.internalWs });

    let detail = "clean";
    if (flags.length > 0) {
      const order: GymFlagId[] = ["junk", "dates", "case", "nulls", "whitespace"];
      const worst = flags.slice().sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))[0];
      detail =
        worst.id === "nulls"
          ? `${worst.count} blank cell${worst.count === 1 ? "" : "s"}`
          : worst.id === "junk"
            ? `${worst.count} decorated / placeholder number${worst.count === 1 ? "" : "s"}${worst.example ? ` — e.g. ${worst.example}` : ""}`
            : worst.id === "case"
              ? `${worst.count} cells hide behind casing${worst.example ? ` — e.g. ${worst.example}` : ""}`
              : worst.id === "dates"
                ? `${sigs.length} date formats mixed`
                : `${worst.count} cells with doubled spaces`;
    }
    return {
      name: c.name,
      rawHeader: parse.rawHeaders[ci] ?? c.name,
      type: c.type,
      nulls: st.nulls,
      distinct: new Set(st.stored.map((v) => (v === null ? "\u0000null" : String(v)))).size - (st.nulls > 0 ? 1 : 0),
      flags,
      detail,
      score: colScore(st.nulls, flags, filled),
    };
  });

  // duplicate rows on the STORED view (what the database actually holds)
  const seen = new Set<string>();
  let dupRows = 0;
  for (const row of parse.rows) {
    const key = JSON.stringify(row.map((v, ci) => cellAsStored(v, parse.columns[ci].type)));
    if (seen.has(key)) dupRows++;
    else seen.add(key);
  }

  const colAvg = columns.reduce((a, c) => a + c.score, 0) / Math.max(1, columns.length);
  const dupeDensity = rowCount > 0 ? dupRows / rowCount : 0;
  const score = Math.round(Math.min(100, colAvg * 0.88 + dupeDensity * 120));
  const grade = score < 5 ? "A" : score < 20 ? "B" : score < 40 ? "C" : score < 60 ? "D" : "F";
  const gradeLine =
    grade === "A"
      ? "suspiciously clean — are you sure this came from the real world?"
      : grade === "B"
        ? "lightly seasoned — a warm-up, not a workout"
        : grade === "C"
          ? "honestly messy — a proper analysis workout"
          : grade === "D"
            ? "data landfill — tread carefully, learn plenty"
            : "dumpster fire — exactly what analysis looks like in the wild";

  return { columns, rowCount, dupRows, score, grade, gradeLine };
}

// ---- missions ---------------------------------------------------------------

export interface GymCheck {
  pass: boolean;
  feedback: string;
}

export interface GymMission {
  id: string;
  skill: string;
  difficulty: Difficulty;
  label: string;
  prompt: string;
  hint: string;
  starter: string;
  xp: number;
  /** human-readable target, shown under the prompt */
  expected: string;
  check: (r: ExecResult) => GymCheck;
}

const XP_KEY_PREFIX = "gym";

/** Stable per-table XP ledger key: same file re-opened pays once. */
export function gymXpKey(parse: GymParse, missionId: string): string {
  return `${XP_KEY_PREFIX}:${parse.table}:${parse.rows.length}r${parse.columns.length}c:${missionId}`;
}

export function isSingleCell(r: ExecResult): boolean {
  return r.columns.length === 1 && r.rows.length === 1 && r.rows[0].length === 1;
}

export function numEq(a: CellValue, b: number, tol = 0.005): boolean {
  return typeof a === "number" && Math.abs(a - b) <= tol;
}

/** Serialize stored rows for exact (unordered) comparison. */
export function rowKey(cells: CellValue[]): string {
  return JSON.stringify(cells.map((v) => (typeof v === "number" ? Math.round(v * 1000) / 1000 : v)));
}

export function rowsMatchUnordered(got: CellValue[][], want: CellValue[][]): boolean {
  if (got.length !== want.length) return false;
  const count = new Map<string, number>();
  for (const r of want) count.set(rowKey(r), (count.get(rowKey(r)) ?? 0) + 1);
  for (const r of got) {
    const n = count.get(rowKey(r)) ?? 0;
    if (n === 0) return false;
    count.set(rowKey(r), n - 1);
  }
  return true;
}

export const failShape = (hint: string): GymCheck => ({
  pass: false,
  feedback: `Wrong result shape — ${hint}`,
});
export const failValue = (expected: string): GymCheck => ({
  pass: false,
  feedback: `Ran clean, but that's not the number — expected ${expected}. Check the filter (and whether blanks should count).`,
});

/** One row, one column, named exactly as the brief demands — the alias is
 *  part of the deliverable (it's how a stakeholder would ask for it), and
 *  it stops two same-numbered missions from being cleared by one query. */
export function isSingleCellNamed(r: ExecResult, alias: string): boolean {
  return isSingleCell(r) && r.columns[0].trim().toLowerCase() === alias;
}

/** Order-SENSITIVE twin of rowsMatchUnordered — for results whose row order
 *  is part of the deliverable (running totals ordered by month). */
export function rowsMatchOrdered(got: CellValue[][], want: CellValue[][]): boolean {
  if (got.length !== want.length) return false;
  return got.every((row, i) => rowKey(row) === rowKey(want[i]));
}

/**
 * Build the practice missions this table can support. 5–7 missions for a
 * messy file, 2 for a pristine one. Order: warm-up → cleanup → analysis.
 */
export function buildGymMissions(parse: GymParse, profile: GymProfile): GymMission[] {
  const t = parse.table;
  const missions: GymMission[] = [];
  const textCols = profile.columns.filter((c) => c.type === "TEXT");

  // 1 — handshake (always): row count
  missions.push({
    id: "row-count",
    skill: "select",
    difficulty: "easy",
    label: "Ground truth",
    prompt: `How many rows landed in ${t}? One number in, one number out — always verify the load before you analyze. Return it as a single column named row_count.`,
    hint: "COUNT(*) counts every row, blanks included. Name the column with AS row_count.",
    starter: `SELECT COUNT(*) AS row_count\nFROM ${t};`,
    xp: xpForDifficulty("easy"),
    expected: `${profile.rowCount}, column row_count`,
    check: (r) =>
      !isSingleCellNamed(r, "row_count")
        ? failShape('one row, one column named "row_count"')
        : numEq(r.rows[0][0], profile.rowCount)
          ? { pass: true, feedback: `${profile.rowCount} rows — the load is exactly what the file promised.` }
          : failValue(`${profile.rowCount}`),
  });

  // 2 — null hunt (needs a column with blanks)
  const nullCol = profile.columns.slice().sort((a, b) => b.nulls - a.nulls)[0];
  if (nullCol && nullCol.nulls > 0) {
    const n = nullCol.nulls;
    missions.push({
      id: "null-hunt",
      skill: "null",
      difficulty: "easy",
      label: "Null hunt",
      prompt: `Count the rows where ${t}.${nullCol.name} is missing (NULL). Blanks in the file became NULL on the way in. Return the count as a column named null_rows.`,
      hint: "IS NULL — never = NULL; three-valued logic bites. Name the column with AS null_rows.",
      starter: `SELECT COUNT(*) AS null_rows\nFROM ${t}\nWHERE ${nullCol.name} IS NULL;`,
      xp: xpForDifficulty("easy"),
      expected: `${n}, column null_rows`,
      check: (r) =>
        !isSingleCellNamed(r, "null_rows")
          ? failShape('one row, one column named "null_rows"')
          : numEq(r.rows[0][0], n)
            ? { pass: true, feedback: `${n} blanks in ${nullCol.name} — found. IS NULL, not = NULL.` }
            : failValue(`${n}`),
    });
  }

  // 3 — case cleanup (needs case chaos)
  const caseCol = profile.columns.find((c) => c.flags.some((f) => f.id === "case"));
  if (caseCol) {
    const st = cellStats(parse, parse.columns.findIndex((c) => c.name === caseCol.name));
    const want = st.caseDistinctLower;
    missions.push({
      id: "case-count",
      skill: "text-dates",
      difficulty: "easy",
      label: "Case cleanup",
      prompt: `${t}.${caseCol.name} spells the same value several ways. Count how many DISTINCT values exist once case is normalized (lowercase) — return it as a column named real_values.`,
      hint: "COUNT(DISTINCT LOWER(col)) — fold the variants before counting. Name the column AS real_values.",
      starter: `SELECT COUNT(DISTINCT LOWER(${caseCol.name})) AS real_values\nFROM ${t};`,
      xp: xpForDifficulty("easy"),
      expected: `${want}, column real_values`,
      check: (r) =>
        !isSingleCellNamed(r, "real_values")
          ? failShape('one row, one column named "real_values"')
          : numEq(r.rows[0][0], want)
            ? {
                pass: true,
                feedback: `${want} real values behind the chaos. In reports, GROUP BY the normalized form so they merge.`,
              }
            : failValue(`${want}`),
    });
  }

  // 4 — duplicate hunt (needs duplicated rows)
  if (profile.dupRows > 0) {
    const d = profile.dupRows;
    missions.push({
      id: "dupe-hunt",
      skill: "aggregates",
      difficulty: "medium",
      label: "Duplicate hunt",
      prompt: `${d} row${d === 1 ? " is an exact duplicate" : "s are exact duplicates"} of an earlier row in ${t}. Count them — a row repeated twice contributes 1. Return it as a column named dup_rows.`,
      hint: "GROUP BY every column, HAVING COUNT(*) > 1, and sum (COUNT(*) − 1) — or compare COUNT(*) with COUNT of a DISTINCT row set in a subquery. Name it AS dup_rows.",
      starter: `SELECT SUM(n - 1) AS dup_rows\nFROM (\n  SELECT COUNT(*) AS n\n  FROM ${t}\n  GROUP BY ${parse.columns.map((c) => c.name).join(", ")}\n  HAVING COUNT(*) > 1\n) AS repeats;`,
      xp: xpForDifficulty("medium"),
      expected: `${d}, column dup_rows`,
      check: (r) =>
        !isSingleCellNamed(r, "dup_rows")
          ? failShape('one row, one column named "dup_rows"')
          : numEq(r.rows[0][0], d)
            ? { pass: true, feedback: `${d} excess cop${d === 1 ? "y" : "ies"} — dedupe before any per-row math, or totals will inflate.` }
            : failValue(`${d}`),
    });
  }

  // 5 — date format rescue (needs mixed date formats)
  const dateCol = profile.columns.find((c) => c.flags.some((f) => f.id === "dates"));
  if (dateCol) {
    const st = cellStats(parse, parse.columns.findIndex((c) => c.name === dateCol.name));
    const iso = st.dateSigs.get("iso") ?? 0;
    if (iso > 0) {
      missions.push({
        id: "iso-dates",
        skill: "text-dates",
        difficulty: "medium",
        label: "Date format rescue",
        prompt: `${t}.${dateCol.name} mixes formats. Count the rows already stored as proper ISO dates (YYYY-MM-DD, like 2024-03-04) — return it as a column named iso_rows.`,
        hint: "GLOB '____-__-__' matches the shape; or check substr(date, 5, 1) = '-'. Name it AS iso_rows.",
        starter: `SELECT COUNT(*) AS iso_rows\nFROM ${t}\nWHERE ${dateCol.name} GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]';`,
        xp: xpForDifficulty("medium"),
        expected: `${iso}, column iso_rows`,
        check: (r) =>
          !isSingleCellNamed(r, "iso_rows")
            ? failShape('one row, one column named "iso_rows"')
            : numEq(r.rows[0][0], iso)
              ? { pass: true, feedback: `${iso} ISO dates. Before any date math, normalize the rest — one format to rule them all.` }
              : failValue(`${iso}`),
      });
    }
  }

  // 6 — number rescue (needs decorated numerics)
  const junkCol = profile.columns.find((c) => c.flags.some((f) => f.id === "junk"));
  if (junkCol) {
    const st = cellStats(parse, parse.columns.findIndex((c) => c.name === junkCol.name));
    const want = Math.round(st.junkSum * 100) / 100;
    if (want !== 0) {
      missions.push({
        id: "junk-sum",
        skill: "text-dates",
        difficulty: "hard",
        label: "Number rescue",
        prompt: `${t}.${junkCol.name} is TEXT wearing a number costume ("$1,200.50", "N/A"). Sum the real values: strip $ , % and spaces; anything that is not a number afterwards counts as 0. Round is on us — return the plain sum as a column named total.`,
        hint: "REPLACE away $ , % then CAST(... AS REAL) — SQLite reads a numeric prefix and treats the rest as 0, which is exactly the rule. Name it AS total.",
        starter: `SELECT SUM(CAST(\n  REPLACE(REPLACE(REPLACE(REPLACE(${junkCol.name}, '$', ''), ',', ''), '%', ''), ' ', '')\n  AS REAL\n)) AS total\nFROM ${t};`,
        xp: xpForDifficulty("hard"),
        expected: `${want.toLocaleString("en-US")}, column total`,
        check: (r) =>
          !isSingleCellNamed(r, "total")
            ? failShape('one row, one column named "total"')
            : numEq(r.rows[0][0], want)
              ? { pass: true, feedback: `${want.toLocaleString("en-US")} rescued from the text costume. That's the analyst's least glamorous, most-valued trick.` }
              : failValue(`${want.toLocaleString("en-US")}`),
      });
    }
  }

  // 7 — the analysis (always): top-N on the normalized text column
  const groupCol =
    textCols.find((c) => c.flags.some((f) => f.id === "case")) ??
    textCols.find((c) => c.nulls < parse.rows.length && c.distinct > 1 && c.distinct <= Math.max(8, parse.rows.length / 2));
  if (groupCol) {
    const ci = parse.columns.findIndex((c) => c.name === groupCol.name);
    const counts = new Map<string, number>();
    for (const row of parse.rows) {
      const v = cellAsStored(row[ci] ?? "", groupCol.type);
      if (v === null) continue;
      const key = String(v).toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const n = Math.min(5, counts.size);
    const want: CellValue[][] = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, n)
      .map(([k, c]) => [k, c]);
    missions.push({
      id: "top-clean",
      skill: "groupby",
      difficulty: "hard",
      label: "The analysis",
      prompt: `The payoff: top ${n} values of ${t}.${groupCol.name} by row count, biggest first — grouping on the LOWERCASED value so case chaos can't split the groups. Two columns named value and rows (the lowercased value, then the count). Ties: alphabetical.`,
      hint: "GROUP BY LOWER(col), ORDER BY count DESC, then the value ASC for ties, LIMIT " + n + ". Alias the columns AS value and AS rows.",
      starter: `SELECT LOWER(${groupCol.name}) AS value, COUNT(*) AS rows\nFROM ${t}\nGROUP BY LOWER(${groupCol.name})\nORDER BY rows DESC, value ASC\nLIMIT ${n};`,
      xp: xpForDifficulty("hard"),
      expected: `${n} rows — columns value + rows`,
      check: (r) => {
        if (
          r.columns.length !== 2 ||
          r.columns[0].trim().toLowerCase() !== "value" ||
          r.columns[1].trim().toLowerCase() !== "rows"
        )
          return failShape('two columns named "value" and "rows"');
        if (r.rows.length !== n) return failValue(`${n} rows`);
        if (!rowsMatchUnordered(r.rows, want)) {
          return {
            pass: false,
            feedback: `Right idea — but the rows don't match. Remember: lowercase the group key, count every row (blanks excluded), and break ties alphabetically.`,
          };
        }
        return {
          pass: true,
          feedback: `That's the deliverable: ${n} clean groups with honest counts. This is 80% of analysis SQL.`,
        };
      },
    });
  }

  return missions;
}

// ---- the dirt injector ------------------------------------------------------

export interface DirtReport {
  blanks: number;
  pads: number;
  caseFlips: number;
  junked: number;
  dateSwaps: number;
  dupes: number;
}

/** Deterministic PRNG so the same file + seed always produces the same mess. */
function lcg(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1_664_525 + 1_013_904_223) >>> 0;
    return s / 2 ** 32;
  };
}

function csvEscape(v: string, delimiter: string): string {
  if (v === "") return "";
  if (v.includes('"') || v.includes(delimiter) || v.includes("\n") || v.includes("\r")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function swapDate(v: string, rnd: () => number): string | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (iso) {
    const [, y, m, d] = iso;
    return rnd() < 0.5 ? `${Number(m)}/${Number(d)}/${y}` : `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
  }
  const slash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v);
  if (slash) {
    const [, a, b, y] = slash;
    return `${y}-${a.padStart(2, "0")}-${b.padStart(2, "0")}`;
  }
  const dmon = /^(\d{1,2}) ([A-Za-z]{3}) (\d{4})$/.exec(v);
  if (dmon) {
    const [, d, mon, y] = dmon;
    const m = String(MONTHS.findIndex((x) => x.toLowerCase() === mon.toLowerCase()) + 1).padStart(2, "0");
    return `${y}-${m}-${d.padStart(2, "0")}`;
  }
  return null;
}

function junkify(v: string, rnd: () => number): string {
  const n = Number.parseFloat(v);
  if (Number.isNaN(n)) return rnd() < 0.5 ? "N/A" : "—";
  const roll = rnd();
  if (roll < 0.35) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  if (roll < 0.6) return (n % 1 === 0 ? Math.round(n) : n).toLocaleString("en-US");
  if (roll < 0.8) return `${n}%`;
  return rnd() < 0.5 ? "N/A" : "tbd";
}

/**
 * Take a CLEAN csv and make it practice-grade messy. Deterministic for a
 * given (text, seed). Returns the dirtied CSV plus a report of everything
 * that was done, so the UI can show the damage honestly.
 */
export function dirtyCsv(text: string, seed: number): { csv: string; report: DirtReport } {
  const rnd = lcg(seed);
  const delimiter = sniffDelimiter(text);
  const grid = parseCsv(text, delimiter);
  if (grid.length < 2) return { csv: text, report: { blanks: 0, pads: 0, caseFlips: 0, junked: 0, dateSwaps: 0, dupes: 0 } };

  const header = grid[0];
  const rows = grid.slice(1).map((r) => {
    const out = r.slice(0, header.length);
    while (out.length < header.length) out.push("");
    return out;
  });

  // per-column shape, from the clean data
  const colShape = header.map((_, ci) => {
    const vals = rows.map((r) => r[ci]).filter((v) => v.trim() !== "");
    const numeric = vals.length > 0 && vals.every((v) => /^[+-]?[\d,]*\.?\d+%?$/.test(v.replace(/^\$/, "")));
    const dateish = vals.length > 0 && vals.every((v) => dateSignature(v) !== null);
    const lowCardinality = new Set(vals.map((v) => v.toLowerCase())).size <= Math.max(4, vals.length / 3);
    return { numeric, dateish, lowCardinality };
  });

  const report: DirtReport = { blanks: 0, pads: 0, caseFlips: 0, junked: 0, dateSwaps: 0, dupes: 0 };
  const out: string[][] = [];

  for (const row of rows) {
    const dirty = row.map((v, ci) => {
      if (v === "") return v;
      const shape = colShape[ci];
      const roll = rnd();
      // ~7% of cells get touched
      if (roll > 0.93) {
        const op = rnd();
        if (shape.dateish) {
          const swapped = swapDate(v, rnd);
          if (swapped && swapped !== v) {
            report.dateSwaps++;
            return swapped;
          }
        }
        if (op < 0.25) {
          report.blanks++;
          return "";
        }
        if (shape.numeric) {
          const bare = v.replace(/^\$/, "").replace(/,/g, "");
          const j = junkify(bare, rnd);
          if (j !== v) report.junked++;
          return j;
        }
        if (op < 0.55) {
          report.caseFlips++;
          // only flip low-cardinality text (categories), never ids/names
          return shape.lowCardinality ? (rnd() < 0.5 ? v.toUpperCase() : v.toLowerCase()) : v;
        }
        if (op < 0.7) {
          report.pads++;
          return rnd() < 0.5 ? `  ${v}` : `${v}  `;
        }
        if (op < 0.85 && v.length > 3) {
          report.pads++;
          return v.replace(/ /, "  ");
        }
        report.blanks++;
        return "";
      }
      return v;
    });
    out.push(dirty);
    // ~2% of rows get copied verbatim right below (exact duplicates)
    if (rnd() < 0.02) {
      report.dupes++;
      out.push([...dirty]);
    }
  }

  // guarantee at least one duplicate on realistic files, so the dupe-hunt
  // mission always exists after an injection (deterministic row pick)
  if (rows.length >= 6 && report.dupes === 0) {
    out.push([...out[Math.floor(rnd() * out.length)]]);
    report.dupes++;
  }

  const csv = [header, ...out].map((r) => r.map((v) => csvEscape(v, delimiter)).join(delimiter)).join("\n");
  return { csv, report };
}

// ---- built-in samples -------------------------------------------------------

/** A realistic "research export" with every mess the profiler flags —
 *  try the gym with zero preparation. */
export const GYM_SAMPLE_CSV = [
  "Ticker,Company,Sector,Report Date,Price USD,Target Price,Rating,Analyst",
  'AAPL,Apple Inc,TECH,2024-03-04,"$182.50",210,Buy,J. Chen',
  'aapl,"Apple  Inc",tech,03/14/2024,187.30,"$215.00",buy,j. chen',
  'MSFT,Microsoft Corp,tech,2024-02-27,"1,204.00",tbd,HOLD,R. Patel',
  'msft,Microsoft Corp,TECH,27-Feb-2024,1198.4,"$1,300.00",hold,r. patel',
  'NVDA,"NVIDIA Corp",TECH,2024-03-08,"$880.25",N/A,BUY,M. Ito',
  'nvda,NVIDIA Corp,tech,3/18/2024,895.1,975,buy,M. Ito',
  'AMZN,"Amazon  Com",Consumer,2024-02-15,"$178.10",N/A,Sell,L. Novak',
  'amzn,Amazon Com,consumer,25-Feb-2024,176.9,"€160.00",sell,L. Novak',
  'TSLA,Tesla Inc,Consumer,2024-03-11,175.2,190,Hold,A. Rey',
  'tsla,"Tesla  Inc",CONSUMER,3/21/2024,"$171.90",tbd,hold,a. rey',
  'GOOG,Alphabet Inc,TECH,2024-01-30,"$1,502.30",1650,Buy,K. Osei',
  'goog,Alphabet Inc,tech,8-Feb-2024,1518.6,"$1,700.00",BUY,k. osei',
  'META,Meta Platforms,TECH,2024-02-02,"$474.90",N/A,HOLD,',
  'JPM,"JP Morgan Chase",Finance,2024-02-20,197.4,"$210.00",buy,T. Walsh',
  'jpm,JP Morgan Chase,finance,2/29/2024,"$199.80",tbd,BUY,t. walsh',
  'XOM,Exxon Mobil,Energy,2024-01-25,103.2,115,Sell,P. Duval',
  'xom,"Exxon  Mobil",ENERGY,05-Feb-2024,"$104.60",N/A,sell,p. duval',
  'JNJ,"Johnson & Johnson",Healthcare,2024-03-01,158.7,"$165.00",Hold,N. Farah',
  'jnj,Johnson & Johnson,healthcare,3/12/2024,"$160.20",tbd,hold,n. farah',
  'V,Visa Inc,Finance,2024-02-22,"$278.40",300,BUY,R. Patel',
  'DIS,Walt Disney Co,Consumer,2024-02-12,110.9,"$125.00",HOLD,A. Rey',
  'dis,"Walt  Disney Co",CONSUMER,21-Feb-2024,"$112.30",N/A,hold,a. rey',
  'NFLX,Netflix Inc,TECH,2024-01-26,"$582.60",640,Buy,M. Ito',
  'KO,"Coca-Cola Co",Consumer,2024-02-16,60.2,"€58.00",HOLD,L. Novak',
  'ko,Coca-Cola Co,consumer,26-Feb-2024,"$60.90",tbd,sell,',
  'PEP,PepsiCo Inc,,2024-02-09,169.5,180,Hold,P. Duval',
  'BA,Boeing Co,Industrial,2024-03-05,"$187.20",N/A,Sell,',
  'ba,Boeing Co,INDUSTRIAL,3/15/2024,191.4,"$205.00",sell,t. walsh',
  'CAT,Caterpillar Inc,Industrial,2024-02-28,"$352.10",380,Buy,K. Osei',
  'WMT,Walmart Inc,Consumer,2024-02-20,60.1,,HOLD,N. Farah',
  'wmt,Walmart Inc,consumer,2/27/2024,"$61.30",tbd,hold,',
  'CVX,Chevron Corp,Energy,2024-02-23,"$155.80",165,Sell,P. Duval',
  'DIS,Walt Disney Co,Consumer,2024-02-12,110.9,"$125.00",HOLD,A. Rey',
  'NFLX,Netflix Inc,TECH,2024-01-26,"$582.60",640,Buy,M. Ito',
].join("\n");

/** A clean export of the same shape — feed it through the dirt injector
 *  to manufacture practice material. */
export const GYM_CLEAN_SAMPLE_CSV = [
  "ticker,company,sector,report_date,price_usd,target_price,rating,analyst",
  "AAPL,Apple Inc,Tech,2024-03-04,182.50,210,Buy,J. Chen",
  "MSFT,Microsoft Corp,Tech,2024-02-27,1204.00,1300,Hold,R. Patel",
  "NVDA,NVIDIA Corp,Tech,2024-03-08,880.25,975,Buy,M. Ito",
  "AMZN,Amazon Com,Consumer,2024-02-15,178.10,195,Sell,L. Novak",
  "TSLA,Tesla Inc,Consumer,2024-03-11,175.20,190,Hold,A. Rey",
  "GOOG,Alphabet Inc,Tech,2024-01-30,1502.30,1650,Buy,K. Osei",
  "META,Meta Platforms,Tech,2024-02-02,474.90,520,Hold,S. Brandt",
  "JPM,JP Morgan Chase,Finance,2024-02-20,197.40,210,Buy,T. Walsh",
  "XOM,Exxon Mobil,Energy,2024-01-25,103.20,115,Sell,P. Duval",
  "JNJ,Johnson & Johnson,Healthcare,2024-03-01,158.70,165,Hold,N. Farah",
  "V,Visa Inc,Finance,2024-02-22,278.40,300,Buy,R. Patel",
  "DIS,Walt Disney Co,Consumer,2024-02-12,110.90,125,Hold,A. Rey",
  "NFLX,Netflix Inc,Tech,2024-01-26,582.60,640,Buy,M. Ito",
  "KO,Coca-Cola Co,Consumer,2024-02-16,60.20,58,Sell,L. Novak",
  "PEP,PepsiCo Inc,Consumer,2024-02-09,169.50,180,Hold,P. Duval",
  "BA,Boeing Co,Industrial,2024-03-05,187.20,205,Sell,T. Walsh",
  "CAT,Caterpillar Inc,Industrial,2024-02-28,352.10,380,Buy,K. Osei",
  "WMT,Walmart Inc,Consumer,2024-02-20,60.10,68,Hold,N. Farah",
].join("\n");

// re-export for the view's convenience
export { parseForTable } from "./csv-table";
export type { GymParse } from "./csv-table";
export { cellAsStored } from "./csv-table";
