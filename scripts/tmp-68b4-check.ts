/**
 * Task 68-b4 self-check — sql-premium4-city.ts (SeeQL premium batch 8, file 4 of 6).
 *
 * Mirrors scripts/lc-sql-verify.ts execution semantics:
 *   - bun:sqlite in-memory database,
 *   - the REAL splitStatements/countStatements from src/lib/sql-statements,
 *   - floats normalised to 4dp before comparison.
 *
 * Per dive it asserts:
 *   structural : slug set + order match the spec; code is exactly ONE statement;
 *                order:"exact" carries a result-level ORDER BY (comments +
 *                OVER(...) spans stripped so window ORDER BYs cannot fake it);
 *                no writeVerify on a read; no backticks / template holes in
 *                ddl, seed or code; ddl and seed end with ';' and nothing
 *                after it; xp matches the spec'd difficulty; no platform
 *                mention in any content field; 2 examples / exactly 3
 *                constraints / 3 breakdown paragraphs of 3-5 sentences each /
 *                3-4 edges / 3 rungs / 3+ walkthrough steps / 2+ followUps /
 *                exactly 3 related slugs, all present in LC_ALL (imported
 *                from the wired registry).
 *   engine     : ddl -> seed -> solution executed TWICE (determinism), and
 *                columns + FULL row arrays match the hand-derived expected
 *                contract by value AND order.
 *
 * Run: bun scripts/tmp-68b4-check.ts
 * (Intentionally LEFT IN PLACE as the batch's verification artifact.)
 */

import { Database } from "bun:sqlite";
import { SQL_PREMIUM4_CITY } from "../src/lib/leetcode/content/sql-premium4-city";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import type { CellValue } from "../src/lib/sql-types";

/** Round floats to 4dp so comparisons are stable (same as lc-sql-verify). */
function norm(v: unknown): CellValue {
  const c = v as CellValue;
  if (typeof c === "number" && !Number.isInteger(c)) return Math.round(c * 10000) / 10000;
  return c;
}

/** Strip -- comments and balanced OVER(...) spans, so a window ORDER BY
 *  cannot satisfy the result-level ORDER BY check. */
function stripForOrderByCheck(sql: string): string {
  const noComments = sql.replace(/--[^\n]*/g, "");
  let out = "", depth = 0, i = 0;
  while (i < noComments.length) {
    const m = /^over\s*\(/i.exec(noComments.slice(i));
    if (m) { depth = 1; i += m[0].length; continue; }
    const ch = noComments[i];
    if (depth > 0) {
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      i++;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

/** Sentence count for a breakdown paragraph (terminator + whitespace). */
function sentenceCount(p: string): number {
  return p
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0).length;
}

/** The spec's slug order — the deliverable must match it exactly. */
const SPEC_SLUG_ORDER = [
  "find-peak-calling-hours-for-each-city",
  "symmetric-coordinates",
  "flight-occupancy-and-waitlist-analysis",
  "classifying-triangles-by-lengths",
  "binary-tree-nodes",
  "snaps-analysis",
];

/** Hand-derived output contracts (columns + rows, in graded order). */
const EXPECTED: Record<string, { columns: string[]; rows: CellValue[][] }> = {
  "find-peak-calling-hours-for-each-city": {
    columns: ["city", "peak_hour", "peak_calls"],
    rows: [
      ["Hillcrest", 13, 2],
      ["Lakeside", 9, 2],
      ["Riverton", 8, 3],
    ],
  },
  "symmetric-coordinates": {
    columns: ["axis_a", "axis_b"],
    rows: [
      [2, 5],
      [3, 4],
    ],
  },
  "flight-occupancy-and-waitlist-analysis": {
    columns: ["flight_no", "booked", "status", "waitlisted"],
    rows: [
      ["FJ201", 3, "full", 0],
      ["FJ204", 6, "full", 2],
      ["FJ210", 2, "seats available", 0],
      ["FJ215", 0, "seats available", 0],
    ],
  },
  "classifying-triangles-by-lengths": {
    columns: ["shape_id", "classification"],
    rows: [
      [1, "equilateral"],
      [2, "isosceles"],
      [3, "isosceles"],
      [4, "scalene"],
    ],
  },
  "binary-tree-nodes": {
    columns: ["node_id", "label", "node_type"],
    rows: [
      [1, "trunk", "root"],
      [2, "oak", "inner"],
      [3, "acorn", "leaf"],
      [4, "fern", "leaf"],
      [5, "pine", "inner"],
      [6, "moss", "leaf"],
    ],
  },
  "snaps-analysis": {
    columns: ["age_bucket", "sending_users", "opening_users"],
    rows: [
      [18, 0, 1],
      [21, 1, 1],
      [25, 1, 1],
      [29, 2, 1],
    ],
  },
};

const XP_BY_SLUG: Record<string, number> = {
  "find-peak-calling-hours-for-each-city": 20, // Medium
  "symmetric-coordinates": 20, // Medium
  "flight-occupancy-and-waitlist-analysis": 20, // Medium
  "classifying-triangles-by-lengths": 10, // Easy
  "binary-tree-nodes": 20, // Medium
  "snaps-analysis": 20, // Medium
};

// -- slug set + order ---------------------------------------------------------
if (JSON.stringify(SQL_PREMIUM4_CITY.map((d) => d.slug)) !== JSON.stringify(SPEC_SLUG_ORDER)) {
  console.log(`FAIL dive order: ${JSON.stringify(SQL_PREMIUM4_CITY.map((d) => d.slug))}`);
  process.exit(1);
}

/** Every wired registry slug — related slugs must all live here. */
const REGISTRY_SLUGS = new Set(LC_ALL.map((p) => p.slug));

let failures = 0;
const failsFor = (slug: string, msg: string) => {
  failures++;
  console.log(`   FAIL ${slug}: ${msg}`);
};

const results: Array<{ slug: string; ok: boolean; rows: number }> = [];

for (const dive of SQL_PREMIUM4_CITY) {
  const tag = `[${dive.slug}]`;
  let ok = true;
  const fail = (msg: string) => {
    ok = false;
    failsFor(dive.slug, msg);
  };

  // -- structural ----------------------------------------------------------
  if (countStatements(dive.code) !== 1)
    fail(`code must be exactly one statement (got ${countStatements(dive.code)})`);
  if (dive.order !== "exact") fail(`order must be "exact" (got "${dive.order}")`);
  if (dive.order === "exact" && !/\border\s+by\b/i.test(stripForOrderByCheck(dive.code)))
    fail(`order:"exact" needs a result-level ORDER BY`);
  if (dive.writeVerify) fail(`read solution must not carry writeVerify`);
  if (dive.xp !== XP_BY_SLUG[dive.slug])
    fail(`xp ${dive.xp} != spec ${XP_BY_SLUG[dive.slug]}`);
  for (const [field, s] of [
    ["ddl", dive.schema.ddl],
    ["seed", dive.schema.seed],
    ["code", dive.code],
  ] as const) {
    if (s.includes("`") || s.includes("${")) fail(`${field} contains backtick or template hole`);
    if (!s.trimEnd().endsWith(";")) fail(`${field} must end with ';'`);
    if (/[;\s]+\S/.test(s.trimEnd().slice(s.trimEnd().lastIndexOf(";") + 1)))
      fail(`${field} has content after the final semicolon`);
  }
  if (dive.examples.length !== 2) fail(`needs exactly 2 examples`);
  for (const ex of dive.examples) {
    if (!ex.input.trim() || !ex.output.trim()) fail(`example missing input/output`);
    if (!ex.explanation?.trim()) fail(`example missing explanation`);
  }
  if (dive.constraints.length !== 3) fail(`needs exactly 3 constraints (got ${dive.constraints.length})`);
  if (dive.breakdown.length !== 3) fail(`needs exactly 3 breakdown paragraphs`);
  for (const [i, p] of dive.breakdown.entries()) {
    const n = sentenceCount(p);
    if (n < 3 || n > 5) fail(`breakdown para ${i + 1} has ${n} sentences (need 3-5)`);
  }
  if (dive.edges.length < 3 || dive.edges.length > 4) fail(`needs 3-4 edges (got ${dive.edges.length})`);
  if (dive.ladder.length !== 3) fail(`needs exactly 3 ladder rungs`);
  if (dive.walkthrough.length < 3) fail(`needs >= 3 walkthrough steps`);
  if ((dive.followUps?.length ?? 0) < 2) fail(`needs >= 2 followUps`);
  if ((dive.related?.length ?? 0) !== 3) fail(`needs exactly 3 related slugs`);
  if (dive.approach.includes("\n")) fail(`approach must be one line`);

  // -- no platform mentions in content -------------------------------------
  const proseFields = [
    dive.statement,
    dive.approach,
    ...dive.examples.flatMap((e) => [e.input, e.output, e.explanation ?? ""]),
    ...dive.constraints,
    ...dive.breakdown,
    ...dive.edges,
    ...dive.ladder.flatMap((r) => [r.title, r.body]),
    ...dive.walkthrough,
    ...(dive.followUps ?? []),
    ...(dive.schema.tables ?? []).map((t) => t.note),
  ];
  for (const f of proseFields) {
    if (/leetcode|leetcode\.com/i.test(f)) fail(`content mentions the platform: "${f.slice(0, 60)}..."`);
  }

  // -- related slugs exist in the wired registry ----------------------------
  for (const slug of dive.related ?? []) {
    if (!REGISTRY_SLUGS.has(slug)) fail(`related slug "${slug}" not present in LC_ALL`);
  }

  // -- engine ---------------------------------------------------------------
  let ranRows = 0;
  try {
    const db = new Database(":memory:");
    for (const s of splitStatements(dive.schema.ddl)) db.run(s);
    for (const s of splitStatements(dive.schema.seed)) db.run(s);

    const cleanCode = dive.code.replace(/;+\s*$/, "");
    const exp = EXPECTED[dive.slug];
    if (!exp) fail(`no expected contract registered`);

    let columns: string[] = [], rows: CellValue[][] = [];
    for (let run = 1; run <= 2; run++) {
      const st = db.prepare(cleanCode);
      const got = st.all() as Record<string, unknown>[];
      const runRows = got.map((r) => st.columnNames.map((c) => norm(r[c])));
      if (run === 2 && JSON.stringify(runRows) !== JSON.stringify(rows))
        fail(`non-deterministic output between runs`);
      columns = st.columnNames;
      rows = runRows;
    }
    db.close();
    ranRows = rows.length;

    if (exp && JSON.stringify(columns) !== JSON.stringify(exp.columns))
      fail(`columns ${JSON.stringify(columns)} != expected ${JSON.stringify(exp.columns)}`);
    if (exp && JSON.stringify(rows) !== JSON.stringify(exp.rows)) {
      fail(
        `rows mismatch:\n     got      ${JSON.stringify(rows)}\n     expected ${JSON.stringify(exp.rows)}`,
      );
    }
  } catch (err) {
    fail(`engine error: ${err instanceof Error ? err.message : String(err)}`);
  }

  results.push({ slug: dive.slug, ok, rows: ranRows });
  void tag;
}

// -- PASS/FAIL table -----------------------------------------------------------
console.log("\ndive                                          result  rows");
console.log("----------------------------------------------------------------");
for (const r of results) {
  console.log(
    `${r.slug.padEnd(45)} ${r.ok ? "PASS" : "FAIL"}    ${String(r.rows).padStart(3)}`,
  );
}

console.log(
  failures === 0
    ? `\nALL CHECKS PASS ${SQL_PREMIUM4_CITY.length}/${SQL_PREMIUM4_CITY.length}`
    : `\n${failures} FAILURE(S)`,
);
process.exit(failures === 0 ? 0 : 1);
