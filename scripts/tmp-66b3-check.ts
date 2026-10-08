/**
 * Task 66-b3 self-check — sql-premium2-market.ts
 * Mirrors scripts/lc-sql-verify.ts semantics: builds each dive's schema in
 * bun:sqlite :memory:, runs the solution, and HARD-asserts the exact columns
 * + rows (order-sensitive) against hand-derived contracts, plus the batch's
 * structural invariants.
 *
 * Run: bun scripts/tmp-66b3-check.ts
 */
import { Database } from "bun:sqlite";
import { SQL_PREMIUM2_MARKET } from "../src/lib/leetcode/content/sql-premium2-market";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import type { CellValue } from "../src/lib/sql-types";
import type { LcSqlDive } from "../src/lib/leetcode/types";

// -- hand-derived contracts (slug -> columns, rows in graded order) ---------
const CONTRACTS: Record<string, { columns: string[]; rows: CellValue[][] }> = {
  "market-analysis-ii": {
    columns: ["buyer_id"],
    rows: [[1]],
  },
  "page-recommendations": {
    columns: ["page_id"],
    rows: [[24], [25], [26], [27]],
  },
  "running-total-for-different-genders": {
    columns: ["gender", "day", "total"],
    rows: [
      ["F", "2019-02-01", 560],
      ["F", "2019-02-05", 940],
      ["F", "2019-02-09", 1360],
      ["F", "2019-02-14", 2000],
      ["M", "2019-02-02", 450],
      ["M", "2019-02-06", 960],
      ["M", "2019-02-11", 1260],
      ["M", "2019-02-16", 2030],
    ],
  },
  "students-with-invalid-departments": {
    columns: ["name"],
    rows: [["Quincy"], ["Ravi"], ["Tomas"]],
  },
  "number-of-trusted-contacts-of-a-customer": {
    columns: ["customer_id", "customer_name", "trusted_contacts_count", "total_call_duration"],
    rows: [
      [1, "Ava Chen", 2, 19],
      [2, "Ben Ode", 2, 30],
      [3, "Cara Vaux", 1, 0],
      [4, "Dov Lin", 0, 0],
    ],
  },
  "evaluate-boolean-expression": {
    columns: ["expression_id", "value"],
    rows: [
      [1, "true"],
      [2, "false"],
      [3, "true"],
      [4, "false"],
      [5, "true"],
    ],
  },
};

const XP_BY_SLUG: Record<string, number> = {
  "market-analysis-ii": 35,
  "page-recommendations": 20,
  "running-total-for-different-genders": 20,
  "students-with-invalid-departments": 10,
  "number-of-trusted-contacts-of-a-customer": 20,
  "evaluate-boolean-expression": 20,
};

const REQUIRED_ORDER = Object.keys(CONTRACTS);

// -- registry slugs (for related-slug verification) --------------------------
const registrySlugs = new Set<string>();
for (const f of new Bun.Glob("registry*.ts").scanSync({ cwd: new URL("../src/lib/leetcode/", import.meta.url).pathname })) {
  const text = await Bun.file(new URL(`../src/lib/leetcode/${f}`, import.meta.url)).text();
  for (const m of text.matchAll(/\[\s*\d+,\s*"([a-z0-9-]+)"/g)) registrySlugs.add(m[1]);
}

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
ok(SQL_PREMIUM2_MARKET.length === 6, `expected 6 dives, got ${SQL_PREMIUM2_MARKET.length}`);
ok(
  JSON.stringify(SQL_PREMIUM2_MARKET.map((d) => d.slug)) === JSON.stringify(REQUIRED_ORDER),
  `dive order mismatch: ${SQL_PREMIUM2_MARKET.map((d) => d.slug).join(", ")}`,
);

for (const dive of SQL_PREMIUM2_MARKET as LcSqlDive[]) {
  const tag = `[${dive.slug}]`;

  // xp / order / no writes
  ok(dive.xp === XP_BY_SLUG[dive.slug], `${tag} xp ${dive.xp} != ${XP_BY_SLUG[dive.slug]}`);
  ok(dive.order === "exact", `${tag} order must be "exact"`);
  ok(dive.writeVerify === undefined, `${tag} read problem must not carry writeVerify`);

  // exactly one statement + result-level ORDER BY (comments and OVER spans stripped)
  ok(countStatements(dive.code) === 1, `${tag} code must be exactly 1 statement (got ${countStatements(dive.code)})`);
  ok(/\border\s+by\b/i.test(stripCommentsAndOver(dive.code)), `${tag} order:"exact" but no result-level ORDER BY`);

  // no backticks / template holes anywhere
  const hits: string[] = [];
  walkStrings(dive, dive.slug, hits);
  ok(hits.length === 0, `${tag} backtick or \${ found in: ${hits.join(", ")}`);

  // ddl/seed end with ';' and nothing after
  for (const [key, val] of [["ddl", dive.schema.ddl], ["seed", dive.schema.seed]] as const) {
    const t = val.trim();
    ok(t.endsWith(";"), `${tag} ${key} does not end with ';'`);
    ok(/;\s*$/.test(val), `${tag} ${key} has content after the final semicolon`);
    ok(countStatements(val) >= 1, `${tag} ${key} holds no statements`);
  }
  ok((dive.schema.tables?.length ?? 0) >= 1, `${tag} schema.tables missing`);

  // structural counts
  ok(dive.examples.length === 2, `${tag} needs exactly 2 examples (got ${dive.examples.length})`);
  ok(dive.constraints.length >= 3, `${tag} needs >= 3 constraints`);
  ok(dive.breakdown.length === 3, `${tag} needs exactly 3 breakdown paragraphs`);
  dive.breakdown.forEach((p, i) => ok(sentences(p) >= 3, `${tag} breakdown para ${i} has ${sentences(p)} sentences (< 3)`));
  ok(dive.edges.length >= 3, `${tag} needs >= 3 edges`);
  ok(dive.ladder.length === 3, `${tag} ladder needs exactly 3 rungs`);
  ok(dive.walkthrough.length >= 3, `${tag} walkthrough needs >= 3 steps`);
  ok((dive.followUps?.length ?? 0) >= 2, `${tag} needs >= 2 followUps`);
  ok((dive.related?.length ?? 0) >= 3, `${tag} needs >= 3 related slugs`);
  for (const r of dive.related ?? []) ok(registrySlugs.has(r), `${tag} related slug not in registry: ${r}`);

  // statement/examples are self-contained enough to grade against the seed
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
}

console.log(`${checks} assertions across ${SQL_PREMIUM2_MARKET.length} dives`);
if (fails.length) {
  console.error(`${fails.length} FAILURE(S):`);
  for (const f of fails) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("ALL CHECKS PASS 6/6");
