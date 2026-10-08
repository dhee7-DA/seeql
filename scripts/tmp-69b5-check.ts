/**
 * Task 69-b5 self-check — sql-premium5-market.ts
 * Mirrors scripts/lc-sql-verify.ts semantics: builds each dive's schema in
 * bun:sqlite :memory:, runs the solution TWICE (determinism), and HARD-asserts
 * the exact columns + full row arrays (order-sensitive) against hand-derived
 * contracts, plus the batch's structural invariants. Related slugs are
 * verified against LC_ALL (imported from the registry).
 *
 * Run: bun scripts/tmp-69b5-check.ts
 */
import { Database } from "bun:sqlite";
import { SQL_PREMIUM5_MARKET } from "../src/lib/leetcode/content/sql-premium5-market";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import type { CellValue } from "../src/lib/sql-types";
import type { LcSqlDive } from "../src/lib/leetcode/types";

// -- hand-derived contracts (slug -> columns, rows in graded order) ---------
const CONTRACTS: Record<string, { columns: string[]; rows: CellValue[][] }> = {
  "year-on-year-growth-rate": {
    columns: ["product_id", "year", "revenue", "prior_revenue", "growth_pct"],
    rows: [
      [1, 2022, 145, 100, 45],
      [1, 2023, 200, 145, 37.93],
      [2, 2022, 190, 250, -24],
      [3, 2023, 130, 90, 44.44],
    ],
  },
  "customer-purchasing-behavior-analysis": {
    columns: ["customer_id", "segment", "total_spent", "order_count"],
    rows: [
      [501, "big", 1000, 2],
      [502, "occasional", 299, 2],
      [503, "regular", 300, 1],
      [504, "big", 2500, 1],
      [505, "regular", 350, 5],
    ],
  },
  "calculate-product-final-price": {
    columns: ["product_id", "base_price", "final_price"],
    rows: [
      [101, 400, 300],
      [102, 800, 800],
      [103, 550, 550],
      [104, 999, 499.5],
    ],
  },
  "find-top-performing-driver": {
    columns: ["driver_id", "total_runs", "on_time_rate"],
    rows: [[9, 5, 100]],
  },
  "find-candidates-for-data-scientist-position-ii": {
    columns: ["applicant_id"],
    rows: [[601], [604], [606]],
  },
};

const XP_BY_SLUG: Record<string, number> = {
  "year-on-year-growth-rate": 35,
  "customer-purchasing-behavior-analysis": 20,
  "calculate-product-final-price": 20,
  "find-top-performing-driver": 20,
  "find-candidates-for-data-scientist-position-ii": 20,
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

/** The single executable statement: split, then cut at the last top-level ';'
 *  so any absorbed trailing-comment run never reaches prepare(). */
function executable(sql: string): string {
  const s = splitStatements(sql)[0] ?? "";
  const cut = s.lastIndexOf(";");
  return cut === -1 ? s : s.slice(0, cut + 1);
}

// -- run ---------------------------------------------------------------------
const fails: string[] = [];
let checks = 0;
const ok = (cond: boolean, msg: string) => {
  checks++;
  if (!cond) fails.push(msg);
};

// deliverable shape: exactly the 5 prescribed slugs, in the prescribed order
ok(SQL_PREMIUM5_MARKET.length === 5, `expected 5 dives, got ${SQL_PREMIUM5_MARKET.length}`);
ok(
  JSON.stringify(SQL_PREMIUM5_MARKET.map((d) => d.slug)) === JSON.stringify(REQUIRED_ORDER),
  `dive order mismatch: ${SQL_PREMIUM5_MARKET.map((d) => d.slug).join(", ")}`,
);

const perDive: Array<{ slug: string; pass: boolean }> = [];

for (const dive of SQL_PREMIUM5_MARKET as LcSqlDive[]) {
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

  // no backticks / template holes anywhere in string values
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
      const st = db.prepare(executable(dive.code));
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

// -- PASS/FAIL table ----------------------------------------------------------
console.log("\ndive                                                          result");
console.log("-------------------------------------------------------------------");
for (const d of perDive) {
  console.log(`${d.slug.padEnd(62)}${d.pass ? "PASS" : "FAIL"}`);
}
console.log(`\n${checks} assertions across ${SQL_PREMIUM5_MARKET.length} dives`);
if (fails.length) {
  console.error(`\n${fails.length} FAILURE(S):`);
  for (const f of fails) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("ALL CHECKS PASS 5/5");
