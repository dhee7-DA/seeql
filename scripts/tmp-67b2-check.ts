/**
 * Task 67-b2 self-check — sql-premium3-commerce.ts (SeeQL premium batch 7, file 2 of 6).
 *
 * Mirrors scripts/lc-sql-verify.ts execution semantics:
 *   - bun:sqlite in-memory database (rebuilt FRESH for each of the two runs),
 *   - the REAL splitStatements/countStatements from src/lib/sql-statements,
 *   - floats normalised to 4dp before comparison, rows compared order-sensitively.
 *
 * Per dive it asserts:
 *   structural : code is exactly ONE statement; writeVerify exists IFF code is a
 *                write (DELETE/UPDATE/INSERT) and is itself exactly one SELECT;
 *                order:"exact" carries a result-level ORDER BY — checked on the
 *                writeVerify for the DELETE dive and on the code after stripping
 *                comments + balanced OVER(...) spans for reads; xp matches spec;
 *                no backticks / template holes; ddl and seed end with ';' and
 *                nothing after; 2 examples, 3 constraints, 3 breakdown paras of
 *                >=3 sentences, >=3 edges, 3 rungs, 3 walkthrough steps, >=2
 *                followUps, >=3 related — every related slug present in LC_ALL.
 *   engine     : ddl -> seed -> solution executed TWICE (fresh db each run,
 *                determinism), columns + FULL row arrays hard-asserted against
 *                the hand-derived contract; the write dive runs the DELETE then
 *                grades via its writeVerify SELECT.
 *
 * Run: bun scripts/tmp-67b2-check.ts
 * (Intentionally LEFT IN PLACE as the batch's verification artifact.)
 */

import { Database } from "bun:sqlite";
import { SQL_PREMIUM3_COMMERCE } from "../src/lib/leetcode/content/sql-premium3-commerce";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
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

/** Count sentences: split on [.!?] followed by whitespace + a capital/quote. */
function sentenceCount(para: string): number {
  return para.split(/(?<=[.!?])\s+(?=[A-Z"'])/).filter((s) => s.trim().length > 0).length;
}

/** Hand-derived output contracts (columns + rows, in graded order). */
const EXPECTED: Record<string, { columns: string[]; rows: CellValue[][] }> = {
  "drop-type-1-orders-for-customers-with-type-0-orders": {
    columns: ["order_id"],
    rows: [[1], [3], [4], [6]],
  },
  "the-number-of-users-that-are-eligible-for-discount": {
    columns: ["eligible_users"],
    rows: [[2]],
  },
  "the-users-that-are-eligible-for-discount": {
    columns: ["user_id"],
    rows: [[501], [502]],
  },
  "number-of-times-a-driver-was-a-passenger": {
    columns: ["user_id", "passenger_rides"],
    rows: [
      [901, 2],
      [902, 0],
      [903, 1],
      [904, 1],
      [905, 0],
    ],
  },
  "product-sales-analysis-iv": {
    columns: ["buyer_id", "product_name"],
    rows: [
      [701, "Espresso"],
      [702, "Kettle"],
      [703, "Grinder"],
      [704, "Mug"],
    ],
  },
  "product-sales-analysis-v": {
    columns: ["buyer_id", "total_quantity"],
    rows: [
      [801, 25],
      [802, 19],
    ],
  },
};

const XP_BY_SLUG: Record<string, number> = {
  "drop-type-1-orders-for-customers-with-type-0-orders": 20, // Medium
  "the-number-of-users-that-are-eligible-for-discount": 10, // Easy
  "the-users-that-are-eligible-for-discount": 10, // Easy
  "number-of-times-a-driver-was-a-passenger": 20, // Medium
  "product-sales-analysis-iv": 20, // Medium
  "product-sales-analysis-v": 10, // Easy
};

/** Related slugs — every one must exist in LC_ALL (the wired registries). */
const LC_ALL_SLUGS = new Set(LC_ALL.map((r) => r.slug));

let failures = 0;
let assertions = 0;
const failsFor = (slug: string, msg: string) => {
  failures++;
  console.log(`   FAIL ${slug}: ${msg}`);
};
const assert = (slug: string, cond: boolean, msg: string) => {
  assertions++;
  if (!cond) failsFor(slug, msg);
  return cond;
};

/** Build a fresh db from ddl+seed. */
function buildDb(ddl: string, seed: string): Database {
  const db = new Database(":memory:");
  for (const s of splitStatements(ddl)) db.run(s);
  for (const s of splitStatements(seed)) db.run(s);
  return db;
}

for (const dive of SQL_PREMIUM3_COMMERCE) {
  const tag = `[${dive.slug}]`;
  let ok = true;
  const fail = (msg: string) => {
    ok = false;
    failsFor(dive.slug, msg);
  };

  // -- write/read shape ------------------------------------------------------
  const isWrite = /^\s*(delete|update|insert)\b/i.test(dive.code);
  assert(dive.slug, isWrite === Boolean(dive.writeVerify), `writeVerify must exist IFF code is a write (isWrite=${isWrite})`);
  if (dive.writeVerify) {
    assert(dive.slug, /^\s*select\b/i.test(dive.writeVerify), "writeVerify must be a SELECT");
    assert(dive.slug, countStatements(dive.writeVerify) === 1, "writeVerify must be exactly one statement");
  }

  // -- structural ------------------------------------------------------------
  assert(dive.slug, countStatements(dive.code) === 1, `code must be exactly one statement (got ${countStatements(dive.code)})`);
  assert(dive.slug, dive.order === "exact", `order must be "exact" (got "${dive.order}")`);
  const orderByTarget = isWrite && dive.writeVerify ? dive.writeVerify : dive.code;
  assert(
    dive.slug,
    /\border\s+by\b/i.test(stripForOrderByCheck(orderByTarget)),
    `order:"exact" needs a result-level ORDER BY (on ${isWrite ? "writeVerify" : "code"})`,
  );
  assert(dive.slug, dive.xp === XP_BY_SLUG[dive.slug], `xp ${dive.xp} != spec ${XP_BY_SLUG[dive.slug]}`);
  for (const [field, s] of [
    ["ddl", dive.schema.ddl],
    ["seed", dive.schema.seed],
    ["code", dive.code],
  ] as const) {
    assert(dive.slug, !s.includes("`") && !s.includes("${"), `${field} contains backtick or template hole`);
    assert(dive.slug, s.trimEnd().endsWith(";"), `${field} must end with ';'`);
    const tail = s.trimEnd().slice(s.trimEnd().lastIndexOf(";") + 1);
    assert(dive.slug, !/\S/.test(tail), `${field} has content after the final semicolon`);
  }
  assert(dive.slug, dive.examples.length === 2, `needs exactly 2 examples (got ${dive.examples.length})`);
  assert(dive.slug, dive.constraints.length === 3, `needs exactly 3 constraints (got ${dive.constraints.length})`);
  assert(dive.slug, dive.breakdown.length === 3, `needs exactly 3 breakdown paragraphs (got ${dive.breakdown.length})`);
  for (let i = 0; i < dive.breakdown.length; i++) {
    const n = sentenceCount(dive.breakdown[i]);
    assert(dive.slug, n >= 3 && n <= 5, `breakdown para ${i} has ${n} sentences (need 3-5)`);
  }
  assert(dive.slug, dive.edges.length >= 3 && dive.edges.length <= 4, `needs 3-4 edges (got ${dive.edges.length})`);
  assert(dive.slug, dive.ladder.length === 3, `needs exactly 3 ladder rungs (got ${dive.ladder.length})`);
  assert(dive.slug, dive.walkthrough.length === 3, `needs exactly 3 walkthrough steps (got ${dive.walkthrough.length})`);
  assert(dive.slug, (dive.followUps?.length ?? 0) >= 2, `needs >= 2 followUps`);
  assert(dive.slug, (dive.related?.length ?? 0) >= 3, `needs >= 3 related slugs`);
  assert(dive.slug, dive.approach.length > 0 && !dive.approach.includes("\n"), `approach must be one line`);
  for (const rel of dive.related ?? []) {
    assert(dive.slug, LC_ALL_SLUGS.has(rel), `related slug "${rel}" not found in LC_ALL`);
  }

  // -- engine: run TWICE against freshly built dbs -----------------------------
  const exp = EXPECTED[dive.slug];
  if (!assert(dive.slug, Boolean(exp), `no expected contract registered`)) {
    console.log(`     ${tag} ${dive.slug} — see failures above`);
    continue;
  }

  try {
    let columns: string[] = [];
    let rows: CellValue[][] = [];
    for (let run = 1; run <= 2; run++) {
      const db = buildDb(dive.schema.ddl, dive.schema.seed); // FRESH db per run
      if (isWrite && dive.writeVerify) {
        const clean = dive.code.replace(/;+\s*$/, "");
        db.run(clean); // the DELETE (or other write)
        const st = db.prepare(dive.writeVerify.replace(/;+\s*$/, ""));
        const got = st.all() as Record<string, unknown>[];
        const runRows = got.map((r) => st.columnNames.map((c) => norm(r[c])));
        if (run === 2 && JSON.stringify(runRows) !== JSON.stringify(rows))
          fail(`non-deterministic output between runs`);
        columns = st.columnNames;
        rows = runRows;
      } else {
        const st = db.prepare(dive.code.replace(/;+\s*$/, ""));
        const got = st.all() as Record<string, unknown>[];
        const runRows = got.map((r) => st.columnNames.map((c) => norm(r[c])));
        if (run === 2 && JSON.stringify(runRows) !== JSON.stringify(rows))
          fail(`non-deterministic output between runs`);
        columns = st.columnNames;
        rows = runRows;
      }
      db.close();
    }

    assert(dive.slug, JSON.stringify(columns) === JSON.stringify(exp.columns),
      `columns ${JSON.stringify(columns)} != expected ${JSON.stringify(exp.columns)}`);
    assert(dive.slug, JSON.stringify(rows) === JSON.stringify(exp.rows),
      `rows mismatch:\n     got      ${JSON.stringify(rows)}\n     expected ${JSON.stringify(exp.rows)}`);
  } catch (err) {
    fail(`engine error: ${err instanceof Error ? err.message : String(err)}`);
  }

  console.log(
    ok
      ? `PASS ${tag} ${dive.slug} (${EXPECTED[dive.slug].rows.length} expected rows, xp ${dive.xp}${dive.writeVerify ? ", write+writeVerify" : ", read"})`
      : `     ${tag} ${dive.slug} — see failures above`,
  );
}

console.log(`\n${assertions} assertions across ${SQL_PREMIUM3_COMMERCE.length} dives`);
console.log(
  failures === 0
    ? `ALL CHECKS PASS ${SQL_PREMIUM3_COMMERCE.length}/${SQL_PREMIUM3_COMMERCE.length}`
    : `\n${failures} FAILURE(S)`,
);
process.exit(failures === 0 ? 0 : 1);
