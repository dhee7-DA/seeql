/**
 * Task 67-b4 self-check — sql-premium3-mold.ts (batch 7, file 4 of 6)
 * Mirrors the batch conventions: per dive asserts exactly-one-statement,
 * result-level ORDER BY (after stripping comments / OVER spans), xp, no
 * writeVerify, ddl+seed ending with ';' and NOTHING after, structural counts,
 * related slugs present in LC_ALL, then builds the schema in bun:sqlite
 * :memory:, runs the solution TWICE (fresh db each time — determinism) and
 * HARD-asserts the exact columns + full row arrays (order-sensitive) against
 * hand-derived contracts.
 *
 * Run: bun scripts/tmp-67b4-check.ts
 */
import { Database } from "bun:sqlite";
import { SQL_PREMIUM3_MOLD } from "../src/lib/leetcode/content/sql-premium3-mold";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import type { CellValue } from "../src/lib/sql-types";
import type { LcSqlDive } from "../src/lib/leetcode/types";
import { LC_ALL } from "../src/lib/leetcode/registry";

// -- hand-derived contracts (slug -> columns, rows in graded order) ----------
const CONTRACTS: Record<string, { columns: string[]; rows: CellValue[][] }> = {
  "build-the-equation": {
    columns: ["equation"],
    rows: [["4x^3+x^2+3x"]],
  },
  "order-two-columns-independently": {
    columns: ["asc_val", "desc_val"],
    rows: [
      [10, 95],
      [23, 87],
      [41, 33],
      [64, 12],
    ],
  },
  "dynamic-pivoting-of-a-table": {
    columns: ["store_id", "jan", "feb", "mar"],
    rows: [
      [1, 30, 40, 50],
      [2, 20, null, 15],
      [3, 25, 10, null],
      [4, null, 35, null],
    ],
  },
  "dynamic-unpivoting-of-a-table": {
    columns: ["store_id", "quarter", "sales"],
    rows: [
      [1, "Q1", 120],
      [1, "Q2", 0],
      [1, "Q3", 95],
      [2, "Q1", 60],
      [2, "Q3", 60],
      [3, "Q1", 45],
    ],
  },
  "arrange-table-by-gender": {
    columns: ["person_id", "name", "gender"],
    rows: [
      [2, "Hana", "F"],
      [3, "Emil", "M"],
      [4, "Aiko", "F"],
      [6, "Gustav", "M"],
      [7, "Dara", "F"],
      [9, "Bruno", "M"],
      [8, "Farah", "F"],
      [1, "Cleo", "O"],
      [5, "Ivo", "O"],
    ],
  },
};

const EXPECTED_SLUGS = [
  "build-the-equation",
  "order-two-columns-independently",
  "dynamic-pivoting-of-a-table",
  "dynamic-unpivoting-of-a-table",
  "arrange-table-by-gender",
];
const EXPECTED_XP = [35, 20, 35, 35, 20];

const allSlugs = new Set(LC_ALL.map((p) => p.slug));

// -- helpers -----------------------------------------------------------------
let assertions = 0;
const failures: string[] = [];

function ok(cond: boolean, label: string) {
  assertions++;
  if (!cond) failures.push(label);
}

/** Strip -- comments (string-aware) then remove balanced OVER(...) spans. */
function stripForOrderByCheck(sql: string): string {
  // 1) remove line comments, respecting single-quoted strings
  let out = "";
  let inStr = false;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (inStr) {
      out += ch;
      if (ch === "'") {
        if (sql[i + 1] === "'") { out += "'"; i++; } else inStr = false;
      }
      continue;
    }
    if (ch === "'") { inStr = true; out += ch; continue; }
    if (ch === "-" && sql[i + 1] === "-") {
      while (i < sql.length && sql[i] !== "\n") i++;
      out += "\n";
      continue;
    }
    out += ch;
  }
  // 2) remove OVER(...) spans (balanced parens)
  let res = "";
  const re = /OVER\s*\(/gi;
  let idx = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(out)) !== null) {
    let depth = 0;
    let j = m.index + m[0].length - 1; // at the '('
    for (; j < out.length; j++) {
      if (out[j] === "(") depth++;
      else if (out[j] === ")") { depth--; if (depth === 0) break; }
    }
    res += out.slice(idx, m.index) + "OVER()";
    idx = j + 1;
    re.lastIndex = idx;
  }
  res += out.slice(idx);
  return res;
}

function cellsEqual(a: CellValue, b: CellValue): boolean {
  if (a === null || b === null) return a === null && b === null;
  if (typeof a === "number" && typeof b === "number") return a === b;
  return a === b;
}

function rowsEqual(a: CellValue[][], b: CellValue[][]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j++) if (!cellsEqual(a[i][j], b[i][j])) return false;
  }
  return true;
}

/** Every ';' in the payload must terminate its line (whitespace only after). */
function semicolonsClean(s: string): boolean {
  const lines = s.split("\n");
  for (const line of lines) {
    const sc = line.lastIndexOf(";");
    if (sc !== -1 && line.slice(sc + 1).trim() !== "") return false;
  }
  return true;
}

// -- real runner -------------------------------------------------------------
function buildAndRun(dive: LcSqlDive): { columns: string[]; rows: CellValue[][] } {
  const db = new Database(":memory:");
  try {
    for (const s of splitStatements(dive.schema.ddl)) db.run(s);
    for (const s of splitStatements(dive.schema.seed)) db.run(s);
    const cleanCode = dive.code.replace(/;+\s*$/, "");
    const stmt = db.prepare(cleanCode);
    const columns = stmt.columnNames;
    const recs = stmt.all() as Record<string, unknown>[];
    const rows = recs.map((r) => columns.map((c) => (r[c] ?? null) as CellValue));
    return { columns, rows };
  } finally {
    db.close();
  }
}

// -- per-dive checks ---------------------------------------------------------
const table: Array<{ slug: string; pass: boolean; note: string }> = [];

if (SQL_PREMIUM3_MOLD.length !== 5) {
  failures.push(`export holds ${SQL_PREMIUM3_MOLD.length} dives, expected 5`);
}
SQL_PREMIUM3_MOLD.forEach((d, i) => ok(d.slug === EXPECTED_SLUGS[i], `slug order [${i}]: ${d.slug}`));
SQL_PREMIUM3_MOLD.forEach((d, i) => ok(d.xp === EXPECTED_XP[i], `xp [${d.slug}]: ${d.xp}`));

for (const dive of SQL_PREMIUM3_MOLD) {
  const tag = dive.slug;
  const before = failures.length;

  // one statement only
  ok(countStatements(dive.code) === 1, `${tag}: code is exactly 1 statement`);
  ok(splitStatements(dive.code).length === 1, `${tag}: splitStatements yields 1`);

  // result-level ORDER BY (strip comments + OVER spans first)
  const stripped = stripForOrderByCheck(dive.code);
  ok(/\bORDER\s+BY\b/i.test(stripped), `${tag}: result-level ORDER BY present`);

  // exact-order read problem, no writeVerify
  ok(dive.order === "exact", `${tag}: order exact`);
  ok(dive.writeVerify === undefined, `${tag}: no writeVerify`);

  // ddl / seed hygiene: end with ';' and nothing after; clean semicolon lines
  for (const [k, v] of [["ddl", dive.schema.ddl], ["seed", dive.schema.seed]] as const) {
    const t = v.trimEnd();
    ok(t.endsWith(";"), `${tag}: ${k} ends with ';'`);
    ok(t.slice(t.lastIndexOf(";") + 1).trim() === "", `${tag}: ${k} nothing after final ';'`);
    ok(semicolonsClean(v), `${tag}: ${k} semicolon lines carry no trailing comments`);
    ok(!v.includes("`") && !v.includes("${"), `${tag}: ${k} no backticks/${"$"}{`);
  }
  ok(!dive.code.includes("`") && !dive.code.includes("${"), `${tag}: code no backticks/${"$"}{`);
  ok(!dive.code.includes("writeVerify"), `${tag}: code no writeVerify mention`);

  // structure
  ok(dive.statement.length > 0, `${tag}: statement present`);
  ok(dive.examples.length === 2, `${tag}: 2 examples`);
  ok(dive.constraints.length === 3, `${tag}: 3 constraints`);
  ok(dive.breakdown.length === 3, `${tag}: 3 breakdown paragraphs`);
  dive.breakdown.forEach((p, i) => {
    const n = (p.match(/[.!?](?:\s|$)/g) ?? []).length;
    ok(n >= 3, `${tag}: breakdown para ${i + 1} has >= 3 sentences (got ${n})`);
  });
  ok(dive.edges.length >= 3 && dive.edges.length <= 4, `${tag}: 3-4 edges`);
  ok(dive.ladder.length === 3, `${tag}: 3 rungs`);
  ok(dive.walkthrough.length === 3, `${tag}: 3 walkthrough steps`);
  ok((dive.followUps?.length ?? 0) >= 2, `${tag}: >= 2 followUps`);
  ok((dive.related?.length ?? 0) >= 3, `${tag}: >= 3 related`);
  ok(dive.approach.length > 0 && !dive.approach.includes("\n"), `${tag}: approach is one line`);
  ok(dive.schema.tables !== undefined && dive.schema.tables.length >= 1, `${tag}: tables notes present`);

  // related slugs all exist in LC_ALL
  for (const r of dive.related ?? []) ok(allSlugs.has(r), `${tag}: related '${r}' in LC_ALL`);

  // engine: build db, run TWICE on fresh builds, compare to contract
  const run1 = buildAndRun(dive);
  const run2 = buildAndRun(dive);
  ok(rowsEqual(run1.rows, run2.rows), `${tag}: deterministic across two fresh builds`);
  const contract = CONTRACTS[tag];
  ok(contract !== undefined, `${tag}: contract exists`);
  if (contract) {
    ok(
      JSON.stringify(run1.columns) === JSON.stringify(contract.columns),
      `${tag}: columns ${JSON.stringify(run1.columns)} == ${JSON.stringify(contract.columns)}`,
    );
    ok(
      rowsEqual(run1.rows, contract.rows),
      `${tag}: rows match contract (got ${JSON.stringify(run1.rows)})`,
    );
  }

  table.push({ slug: tag, pass: failures.length === before, note: `${assertions} assertions so far` });
}

// -- report ------------------------------------------------------------------
console.log("dive                                | result");
console.log("------------------------------------|-------");
for (const row of table) {
  console.log(`${row.slug.padEnd(36)}| ${row.pass ? "PASS" : "FAIL"}`);
}
console.log(`\n${assertions} assertions, ${failures.length} failures`);
if (failures.length) {
  console.log("\nFAILURES:");
  for (const f of failures) console.log("  ✗ " + f);
  process.exit(1);
} else {
  console.log(`\nALL CHECKS PASS ${table.length}/${table.length}`);
}
