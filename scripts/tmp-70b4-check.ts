/**
 * Task 70-b4 self-check — sql-free-org.ts (SeeQL batch 10, file 4 of 5)
 * Mirrors scripts/lc-sql-verify.ts semantics: builds each dive's schema in
 * bun:sqlite :memory:, runs the solution TWICE (determinism), and HARD-asserts
 * the exact columns + full row arrays (order-sensitive) against hand-derived
 * contracts, plus the batch's structural invariants and planted-trap probes
 * (each wrong query re-run against the seed to pin its documented failure).
 * Related slugs are verified against LC_ALL (imported from the registry).
 *
 * Run: bun scripts/tmp-70b4-check.ts
 */
import { Database } from "bun:sqlite";
import { SQL_FREE_ORG } from "../src/lib/leetcode/content/sql-free-org";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import type { CellValue } from "../src/lib/sql-types";
import type { LcSqlDive } from "../src/lib/leetcode/types";

// -- hand-derived contracts (slug -> columns, rows in graded order) ---------
const CONTRACTS: Record<string, { columns: string[]; rows: CellValue[][] }> = {
  "analyze-organization-hierarchy": {
    columns: ["staff_id", "name", "level", "subordinates", "subtree_salary"],
    rows: [
      [1, "Nadia", 1, 6, 820],
      [2, "Omar", 2, 2, 310],
      [3, "Priya", 2, 2, 310],
      [4, "Quinn", 3, 1, 160],
      [5, "Rhea", 3, 0, 90],
      [6, "Sami", 3, 0, 80],
      [7, "Tara", 4, 0, 60],
    ],
  },
  "analyze-subscription-conversion": {
    columns: ["user_id", "trial_start", "converted", "days_to_convert"],
    rows: [
      [201, "2024-01-10", "yes", 3],
      [202, "2024-02-05", "yes", 0],
      [203, "2024-03-28", "yes", 33],
      [204, "2024-01-15", "no", null],
    ],
  },
  "find-overbooked-employees": {
    columns: ["employee_id"],
    rows: [[31], [33]],
  },
  "find-covid-recovery-patients": {
    columns: ["patient_id", "positive_date", "recovery_date"],
    rows: [
      [41, "2024-01-05", "2024-01-12"],
      [42, "2024-02-10", "2024-02-20"],
      [43, "2024-03-03", "2024-03-15"],
    ],
  },
  "find-books-with-no-available-copies": {
    columns: ["book_id", "title"],
    rows: [
      [61, "Chain of Office"],
      [62, "Quiet Ledger"],
    ],
  },
};

const XP_BY_SLUG: Record<string, number> = {
  "analyze-organization-hierarchy": 35,
  "analyze-subscription-conversion": 20,
  "find-overbooked-employees": 20,
  "find-covid-recovery-patients": 20,
  "find-books-with-no-available-copies": 10,
};

// -- planted-trap probes: wrong query -> the documented wrong result --------
const PROBES: Record<string, Array<{ label: string; sql: (code: string) => string; expect: CellValue[][] }>> = {
  "analyze-organization-hierarchy": [
    {
      label: "direct-reports-only count: CEO reads 2 not 6, Omar 1 not 2",
      sql: () =>
        `SELECT s.staff_id, COUNT(c.staff_id) AS subordinates
FROM Staff s
LEFT JOIN Staff c ON c.manager_id = s.staff_id
GROUP BY s.staff_id
ORDER BY s.staff_id`,
      expect: [[1, 2], [2, 1], [3, 2], [4, 1], [5, 0], [6, 0], [7, 0]],
    },
    {
      label: "headcount forgetting the -1 (self-pair included): every manager +1",
      sql: (c) => c.replace("COUNT(p.descendant) - 1 AS subordinates", "COUNT(p.descendant) AS subordinates"),
      expect: [
        [1, "Nadia", 1, 7, 820],
        [2, "Omar", 2, 3, 310],
        [3, "Priya", 2, 3, 310],
        [4, "Quinn", 3, 2, 160],
        [5, "Rhea", 3, 1, 90],
        [6, "Sami", 3, 1, 80],
        [7, "Tara", 4, 1, 60],
      ],
    },
    {
      label: "salary excluding self: CEO reads 620, leaves read 0",
      sql: (c) => c.replace("SUM(d.salary)           AS subtree_salary", "SUM(d.salary) - s.salary AS subtree_salary"),
      expect: [
        [1, "Nadia", 1, 6, 620],
        [2, "Omar", 2, 2, 160],
        [3, "Priya", 2, 2, 170],
        [4, "Quinn", 3, 1, 60],
        [5, "Rhea", 3, 0, 0],
        [6, "Sami", 3, 0, 0],
        [7, "Tara", 4, 0, 0],
      ],
    },
  ],
  "analyze-subscription-conversion": [
    {
      label: "INNER join deletes the non-converter (204 vanishes)",
      sql: (c) => c.replace("LEFT JOIN PaidConversion", "JOIN PaidConversion"),
      expect: [
        [201, "2024-01-10", "yes", 3],
        [202, "2024-02-05", "yes", 0],
        [203, "2024-03-28", "yes", 33],
      ],
    },
    {
      label: "raw TEXT subtraction coerces 2024-2024=0 for EVERY row",
      sql: (c) => c.replace("julianday(p.paid_date) - julianday(t.trial_start)", "p.paid_date - t.trial_start"),
      expect: [
        [201, "2024-01-10", "yes", 0],
        [202, "2024-02-05", "yes", 0],
        [203, "2024-03-28", "yes", 0],
        [204, "2024-01-15", "no", null],
      ],
    },
    {
      label: "flipped join (FROM PaidConversion): orphan 205 surfaces, 204 vanishes",
      sql: () =>
        `SELECT
    p.user_id,
    t.trial_start,
    CASE WHEN p.paid_date IS NOT NULL THEN 'yes' ELSE 'no' END AS converted,
    CAST(julianday(p.paid_date) - julianday(t.trial_start) AS INTEGER) AS days_to_convert
FROM PaidConversion p
LEFT JOIN TrialUser t ON t.user_id = p.user_id
ORDER BY p.user_id`,
      expect: [
        [201, "2024-01-10", "yes", 3],
        [202, "2024-02-05", "yes", 0],
        [203, "2024-03-28", "yes", 33],
        [205, null, "yes", null],
      ],
    },
  ],
  "find-overbooked-employees": [
    {
      label: "closed intervals (<=) fabricate the touch employee 32",
      sql: (c) =>
        c
          .replace("a.start_time  < b.end_time ", "a.start_time <= b.end_time ")
          .replace("b.start_time  < a.end_time ", "b.start_time <= a.end_time "),
      expect: [[31], [32], [33]],
    },
    {
      label: "no id guard: self-pairs flag EVERY employee (even clean 32/34)",
      sql: (c) => c.replace(" AND  a.entry_id    < b.entry_id      -- each unordered pair once, no self-pairs\n", ""),
      expect: [[31], [32], [33], [34]],
    },
    {
      label: "no DISTINCT: employee 31 prints once per overlapping pair",
      sql: (c) => c.replace("SELECT DISTINCT\n    a.employee_id", "SELECT a.employee_id"),
      expect: [[31], [31], [31], [33]],
    },
    {
      label: "one-sided starts-inside test (inclusive): misses engulfed 33, admits touch 32",
      sql: (c) =>
        c.replace(
          " AND  a.start_time  < b.end_time      -- strict on BOTH sides:\n AND  b.start_time  < a.end_time      -- endpoints may touch, never overlap\n",
          " AND  b.start_time BETWEEN a.start_time AND a.end_time  -- one-sided: only tests the later entry\n",
        ),
      expect: [[31], [32]],
    },
  ],
  "find-covid-recovery-patients": [
    {
      label: "global first negative (anchor filter dropped): 42 recovers BEFORE infection",
      sql: (c) =>
        c.replace(" AND  t.tested_on  > f.positive_date     -- strictly later: skips pre-positive negatives\n", ""),
      expect: [
        [41, "2024-01-05", "2024-01-12"],
        [42, "2024-02-10", "2024-02-01"],
        [43, "2024-03-03", "2024-03-15"],
      ],
    },
    {
      label: "per-positive pairing fabricates a second row for double-positive 43",
      sql: () =>
        `SELECT f.patient_id, f.tested_on AS positive_date, MIN(t.tested_on) AS recovery_date
FROM TestResult f
JOIN TestResult t
  ON  t.patient_id = f.patient_id
 AND  t.result     = 'negative'
 AND  t.tested_on  > f.tested_on
WHERE f.result = 'positive'
GROUP BY f.patient_id, f.tested_on
ORDER BY f.patient_id, f.tested_on`,
      expect: [
        [41, "2024-01-05", "2024-01-12"],
        [42, "2024-02-10", "2024-02-20"],
        [43, "2024-03-03", "2024-03-15"],
        [43, "2024-03-08", "2024-03-15"],
      ],
    },
    {
      label: "LEFT JOIN dresses positive-only 44 as recovered with NULL recovery",
      sql: (c) => c.replace("JOIN TestResult t", "LEFT JOIN TestResult t"),
      expect: [
        [41, "2024-01-05", "2024-01-12"],
        [42, "2024-02-10", "2024-02-20"],
        [43, "2024-03-03", "2024-03-15"],
        [44, "2024-04-02", null],
      ],
    },
  ],
  "find-books-with-no-available-copies": [
    {
      label: "COUNT(*) as the loan count: 65's phantom row reads 1 and wrongly qualifies",
      sql: (c) => c.replace("HAVING COUNT(l.loan_id) = b.total_copies", "HAVING COUNT(*) = b.total_copies"),
      expect: [
        [61, "Chain of Office"],
        [62, "Quiet Ledger"],
        [65, "Glass Harbor"],
      ],
    },
    {
      label: "returned filter dropped: 63 (3 raw loans on 3 copies) and 64 wrongly in",
      sql: (c) => c.replace(" AND  l.returned = 0              -- only still-out loans occupy a copy\n", ""),
      expect: [
        [61, "Chain of Office"],
        [62, "Quiet Ledger"],
        [63, "The Long Walk"],
        [64, "Salt and Ember"],
      ],
    },
    {
      label: "COUNT(*) AND no filter: every book reads fully loaned",
      sql: (c) =>
        c
          .replace(" AND  l.returned = 0              -- only still-out loans occupy a copy\n", "")
          .replace("HAVING COUNT(l.loan_id) = b.total_copies", "HAVING COUNT(*) = b.total_copies"),
      expect: [
        [61, "Chain of Office"],
        [62, "Quiet Ledger"],
        [63, "The Long Walk"],
        [64, "Salt and Ember"],
        [65, "Glass Harbor"],
      ],
    },
  ],
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
ok(SQL_FREE_ORG.length === 5, `expected 5 dives, got ${SQL_FREE_ORG.length}`);
ok(
  JSON.stringify(SQL_FREE_ORG.map((d) => d.slug)) === JSON.stringify(REQUIRED_ORDER),
  `dive order mismatch: ${SQL_FREE_ORG.map((d) => d.slug).join(", ")}`,
);

const perDive: Array<{ slug: string; pass: boolean; probes: number }> = [];

for (const dive of SQL_FREE_ORG as LcSqlDive[]) {
  const tag = `[${dive.slug}]`;
  const before = fails.length;

  // xp / order / no writes
  ok(dive.xp === XP_BY_SLUG[dive.slug], `${tag} xp ${dive.xp} != ${XP_BY_SLUG[dive.slug]}`);
  ok(dive.order === "exact", `${tag} order must be "exact"`);
  ok(dive.writeVerify === undefined, `${tag} read problem must not carry writeVerify`);

  // exactly one statement + result-level ORDER BY (comments and OVER spans stripped)
  ok(countStatements(dive.code) === 1, `${tag} code must be exactly 1 statement (got ${countStatements(dive.code)})`);
  ok(/\border\s+by\b/i.test(stripCommentsAndOver(dive.code)), `${tag} order:"exact" but no result-level ORDER BY`);

  // statement substance
  ok(dive.statement.length > 100, `${tag} statement suspiciously short (${dive.statement.length} chars)`);

  // approach: ONE line
  ok(!dive.approach.includes("\n"), `${tag} approach must be a single line`);
  ok(dive.approach.trim().length > 0 && dive.approach.trim() === dive.approach, `${tag} approach not trimmed`);

  // no backticks / template holes anywhere in string values
  const hits: string[] = [];
  walkStrings(dive, dive.slug, hits);
  ok(hits.length === 0, `${tag} backtick or \${ found in: ${hits.join(", ")}`);

  // no platform mention in any prose/SQL string of the dive
  const strings: string[] = [];
  walkStrings(dive, dive.slug, strings);
  ok(!strings.some((p) => /leetcode/i.test(p)), `${tag} platform mention inside dive strings`);

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
  // no ';' inside any comment of ddl/seed/code
  for (const [key, val] of [["ddl", dive.schema.ddl], ["seed", dive.schema.seed], ["code", dive.code]] as const) {
    for (const line of val.split("\n")) {
      const ci = line.indexOf("--");
      if (ci !== -1) ok(!line.slice(ci).includes(";"), `${tag} ${key} comment holds a ';': ${line.trim()}`);
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
  const probes = PROBES[dive.slug] ?? [];

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

  // -- planted-trap probes: the WRONG query yields the documented wrong rows --
  for (const probe of probes) {
    const db = new Database(":memory:");
    try {
      for (const s of splitStatements(dive.schema.ddl)) db.run(s);
      for (const s of splitStatements(dive.schema.seed)) db.run(s);
      const st = db.prepare(executable(probe.sql(dive.code)));
      const rows = st.all() as Record<string, unknown>[];
      const columns = st.columnNames;
      const normed = rows.map((r) => columns.map((c) => norm(r[c])));
      ok(
        JSON.stringify(normed) === JSON.stringify(probe.expect),
        `${tag} probe [${probe.label}] mismatch:\n  got      ${JSON.stringify(normed)}\n  expected ${JSON.stringify(probe.expect)}`,
      );
    } catch (err) {
      fails.push(`${tag} probe [${probe.label}] FAILED: ${err instanceof Error ? err.message : String(err)}`);
      checks++;
    } finally {
      db.close();
    }
  }

  perDive.push({ slug: dive.slug, pass: fails.length === before, probes: probes.length });
}

// -- PASS/FAIL table ----------------------------------------------------------
console.log("\ndive                                          result  probes");
console.log("---------------------------------------------------------------");
for (const d of perDive) {
  console.log(`${d.slug.padEnd(46)}${d.pass ? "PASS" : "FAIL"}    ${d.probes}`);
}
console.log(`\n${checks} assertions across ${SQL_FREE_ORG.length} dives`);
if (fails.length) {
  console.error(`\n${fails.length} FAILURE(S):`);
  for (const f of fails) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("ALL CHECKS PASS 5/5");
