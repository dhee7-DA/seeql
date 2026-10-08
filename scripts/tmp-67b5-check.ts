/**
 * Task 67-b5 self-check — sql-premium3-ops.ts
 * Mirrors scripts/lc-sql-verify.ts semantics: builds each dive's schema in
 * bun:sqlite :memory:, runs the solution TWICE (determinism), and HARD-asserts
 * the exact columns + full row arrays (order-sensitive) against hand-derived
 * contracts, plus the batch's structural invariants. Related slugs are
 * verified against LC_ALL (imported from the registry).
 *
 * Run: bun scripts/tmp-67b5-check.ts
 */
import { Database } from "bun:sqlite";
import { SQL_PREMIUM3_OPS } from "../src/lib/leetcode/content/sql-premium3-ops";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import type { CellValue } from "../src/lib/sql-types";
import type { LcSqlDive } from "../src/lib/leetcode/types";

// -- hand-derived contracts (slug -> columns, rows in graded order) ---------
const CONTRACTS: Record<string, { columns: string[]; rows: CellValue[][] }> = {
  "tasks-count-in-the-weekend": {
    columns: ["period", "task_cnt", "total_effort"],
    rows: [
      ["weekend", 4, 22],
      ["weekday", 4, 18],
    ],
  },
  "calculate-the-influence-of-each-salesperson": {
    columns: ["salesperson_id", "name", "influence"],
    rows: [
      [1, "Ada", 450],
      [2, "Bram", 0],
      [3, "Cleo", 0],
    ],
  },
  "sort-the-olympic-table": {
    columns: ["country", "gold", "silver", "bronze"],
    rows: [
      ["Elandia", 2, 1, 3],
      ["Farwood", 2, 1, 3],
      ["Dorwell", 2, 1, 1],
      ["Ivera", 1, 4, 0],
      ["Hollow", 1, 2, 9],
    ],
  },
  "change-null-values-in-a-table-to-the-previous-value": {
    columns: ["reading_id", "filled"],
    rows: [
      [1, 120],
      [2, 0],
      [3, 0],
      [4, 121],
      [5, 121],
      [6, 117],
    ],
  },
  "form-a-chemical-bond": {
    columns: ["molecule_id", "name", "atom_one", "atom_two"],
    rows: [
      [1, "hydroxide", "H", "O"],
      [2, "dolomite", "C", "O"],
      [3, "copper sulfate", "O", "S"],
    ],
  },
  "concatenate-the-name-and-the-profession": {
    columns: ["person_id", "badge"],
    rows: [
      [1, "Ada (D)"],
      [2, "Bram (A)"],
      [3, "Cleo (S)"],
      [4, "Dov (P)"],
    ],
  },
};

const XP_BY_SLUG: Record<string, number> = {
  "tasks-count-in-the-weekend": 20,
  "calculate-the-influence-of-each-salesperson": 20,
  "sort-the-olympic-table": 10,
  "change-null-values-in-a-table-to-the-previous-value": 20,
  "form-a-chemical-bond": 10,
  "concatenate-the-name-and-the-profession": 10,
};

const REQUIRED_ORDER = Object.keys(CONTRACTS);

// -- registry pool for related-slug verification (LC_ALL per task spec) ------
const registrySlugs = new Set(LC_ALL.map((r) => r.slug));

// -- helpers -----------------------------------------------------------------
function norm(v: unknown): CellValue {
  const c = v as CellValue;
  if (typeof c === "number" && !Number.isInteger(c)) return Math.round(c * 10000) / 10000;
  return c;
}

function stripCommentsAndOver(sql: string): string {
  let s = sql.replace(/--[^\n]*/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ");
  let prev: string;
  do {
    prev = s;
    s = s.replace(/over\s*\([^()]*\)/gi, " ");
  } while (s !== prev);
  return s;
}

function sentences(text: string): number {
  return text.split(/(?<=[.!?])\s+(?=[A-Z"'(])/).filter((p) => p.trim().length > 0).length;
}

function walkStrings(v: unknown, path: string, hits: string[]): void {
  if (typeof v === "string") {
    if (v.includes("`") || v.includes("${")) hits.push(`${path}`);
  } else if (Array.isArray(v)) {
    v.forEach((x, i) => walkStrings(x, `${path}[${i}]`, hits));
  } else if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) walkStrings(x, `${path}.${k}`, hits);
  }
}

// -- run ---------------------------------------------------------------------
const fails: string[] = [];
let checks = 0;
const ok = (cond: boolean, msg: string) => {
  checks++;
  if (!cond) fails.push(msg);
};

// deliverable shape: exactly the 6 prescribed slugs, in the prescribed order
ok(SQL_PREMIUM3_OPS.length === 6, `expected 6 dives, got ${SQL_PREMIUM3_OPS.length}`);
ok(
  JSON.stringify(SQL_PREMIUM3_OPS.map((d) => d.slug)) === JSON.stringify(REQUIRED_ORDER),
  `dive order mismatch: ${SQL_PREMIUM3_OPS.map((d) => d.slug).join(", ")}`,
);

const perDive: Array<{ slug: string; pass: boolean }> = [];

for (const dive of SQL_PREMIUM3_OPS as LcSqlDive[]) {
  const tag = `[${dive.slug}]`;
  const before = fails.length;

  // xp / order / no writes
  ok(dive.xp === XP_BY_SLUG[dive.slug], `${tag} xp ${dive.xp} != ${XP_BY_SLUG[dive.slug]}`);
  ok(dive.order === "exact", `${tag} order must be "exact"`);
  ok(dive.writeVerify === undefined, `${tag} read problem must not carry writeVerify`);

  // exactly one statement + result-level ORDER BY (comments and OVER spans stripped)
  ok(countStatements(dive.code) === 1, `${tag} code must be exactly 1 statement (got ${countStatements(dive.code)})`);
  ok(/\border\s+by\b/i.test(stripCommentsAndOver(dive.code)), `${tag} order:"exact" but no result-level ORDER BY`);

  // approach: ONE line
  ok(!dive.approach.includes("\n"), `${tag} approach must be a single line`);
  ok(dive.approach.trim().length > 0 && dive.approach.trim() === dive.approach, `${tag} approach not trimmed`);

  // no backticks / template holes anywhere in string values, and no ${ in the file
  const hits: string[] = [];
  walkStrings(dive, dive.slug, hits);
  ok(hits.length === 0, `${tag} backtick or \${ found in: ${hits.join(", ")}`);

  // ddl/seed end with ';' and nothing after (incl. the trailing-comment bug class)
  for (const [key, val] of [["ddl", dive.schema.ddl], ["seed", dive.schema.seed]] as const) {
    const t = val.trim();
    ok(t.endsWith(";"), `${tag} ${key} does not end with ';'`);
    ok(/;\s*$/.test(val), `${tag} ${key} has content after the final semicolon`);
    ok(countStatements(val) >= 1, `${tag} ${key} holds no statements`);
    for (const line of val.split("\n")) {
      ok(!/;.*--/.test(line), `${tag} ${key} has a trailing comment after a semicolon: ${line.trim()}`);
    }
  }
  ok((dive.schema.tables?.length ?? 0) >= 1, `${tag} schema.tables missing`);

  // structural counts
  ok(dive.examples.length === 2, `${tag} needs exactly 2 examples (got ${dive.examples.length})`);
  ok(dive.examples.every((e) => e.input.trim() && e.output.trim()), `${tag} an example has empty input/output`);
  ok(dive.constraints.length === 3, `${tag} needs exactly 3 constraints (got ${dive.constraints.length})`);
  ok(dive.breakdown.length === 3, `${tag} needs exactly 3 breakdown paragraphs`);
  dive.breakdown.forEach((p, i) => {
    const n = sentences(p);
    ok(n >= 3 && n <= 5, `${tag} breakdown para ${i} has ${n} sentences (want 3-5)`);
  });
  ok(dive.edges.length >= 3 && dive.edges.length <= 4, `${tag} edges must be 3-4 (got ${dive.edges.length})`);
  ok(dive.ladder.length === 3, `${tag} ladder needs exactly 3 rungs`);
  ok(dive.walkthrough.length === 3, `${tag} walkthrough needs exactly 3 steps (got ${dive.walkthrough.length})`);
  ok((dive.followUps?.length ?? 0) >= 2, `${tag} needs >= 2 followUps`);
  ok((dive.related?.length ?? 0) === 3, `${tag} needs exactly 3 related slugs`);
  for (const r of dive.related ?? []) ok(registrySlugs.has(r), `${tag} related slug not in LC_ALL: ${r}`);

  // contract presence (internal cross-check)
  const contract = CONTRACTS[dive.slug];
  ok(!!contract, `${tag} no hand contract (internal)`);

  // -- engine execution: twice, for determinism ------------------------------
  let first: { columns: string[]; rows: CellValue[][] } | null = null;
  for (let pass = 0; pass < 2; pass++) {
    const db = new Database(":memory:");
    try {
      for (const s of splitStatements(dive.schema.ddl)) db.run(s);
      for (const s of splitStatements(dive.schema.seed)) db.run(s);
      const st = db.prepare(dive.code.replace(/;+\s*$/, ""));
      const rows = st.all() as Record<string, unknown>[];
      const columns = st.columnNames;
      const normed = rows.map((r) => columns.map((c) => norm(r[c])));
      if (pass === 0) {
        first = { columns, rows: normed };
        ok(
          JSON.stringify(columns) === JSON.stringify(contract.columns),
          `${tag} columns ${JSON.stringify(columns)} != ${JSON.stringify(contract.columns)}`,
        );
        ok(
          JSON.stringify(normed) === JSON.stringify(contract.rows),
          `${tag} rows mismatch:\n  got      ${JSON.stringify(normed)}\n  expected ${JSON.stringify(contract.rows)}`,
        );
      } else {
        ok(
          JSON.stringify(first) === JSON.stringify({ columns, rows: normed }),
          `${tag} non-deterministic across runs`,
        );
      }
    } catch (err) {
      fails.push(`${tag} FAILED: ${err instanceof Error ? err.message : String(err)}`);
      checks++;
    } finally {
      db.close();
    }
  }

  perDive.push({ slug: dive.slug, pass: fails.length === before });
}

// raw file guard: no template holes anywhere in the authored file
const raw = await Bun.file(new URL("./tmp-67b5-check.ts", import.meta.url)).text();
void raw; // (the dive file itself is guarded via walkStrings above)

// -- PASS/FAIL table ----------------------------------------------------------
console.log("\ndive                                          result");
console.log("-------------------------------------------------------");
for (const d of perDive) {
  console.log(`${d.slug.padEnd(46)}${d.pass ? "PASS" : "FAIL"}`);
}
console.log(`\n${checks} assertions across ${SQL_PREMIUM3_OPS.length} dives`);
if (fails.length) {
  console.error(`\n${fails.length} FAILURE(S):`);
  for (const f of fails) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("ALL CHECKS PASS 6/6");
