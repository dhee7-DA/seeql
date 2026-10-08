/**
 * Task 68-b2 self-check — sql-premium4-money.ts
 * Mirrors scripts/lc-sql-verify.ts semantics: builds each dive's schema in
 * bun:sqlite :memory:, runs the solution TWICE (determinism), and HARD-asserts
 * the exact columns + full row arrays (order-sensitive) against hand-derived
 * contracts, plus the batch's structural invariants AND engine-proven
 * wrong-query probes for every planted trap. Related slugs are verified
 * against LC_ALL (imported from the registry).
 *
 * Run: bun scripts/tmp-68b2-check.ts
 */
import { Database } from "bun:sqlite";
import { SQL_PREMIUM4_MONEY } from "../src/lib/leetcode/content/sql-premium4-money";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import type { CellValue } from "../src/lib/sql-types";
import type { LcSqlDive } from "../src/lib/leetcode/types";

// -- hand-derived contracts (slug -> columns, rows in graded order) ---------
const CONTRACTS: Record<string, { columns: string[]; rows: CellValue[][] }> = {
  "highest-salaries-difference": {
    columns: ["salary_gap"],
    rows: [[8000]],
  },
  "rolling-average-steps": {
    columns: ["user_id", "walk_date", "rolling_avg"],
    rows: [
      [201, "2024-06-01", 6000],
      [201, "2024-06-02", 6500],
      [201, "2024-06-03", 7500],
      [201, "2024-06-04", 8500],
      [202, "2024-06-01", 4000],
      [202, "2024-06-02", 4500],
      [202, "2024-06-04", 7000],
      [202, "2024-06-05", 7500],
    ],
  },
  "market-analysis-iii": {
    columns: ["item_id"],
    rows: [[501], [504]],
  },
  "find-expensive-cities": {
    columns: ["city", "city_avg"],
    rows: [["Alder", 210]],
  },
  "class-performance": {
    columns: ["student_id", "name", "subject", "score", "subject_avg"],
    rows: [
      [41, "Anya", "Algebra", 55, 79],
      [41, "Anya", "Biology", 60, 76],
      [44, "Dov", "Algebra", 76, 79],
    ],
  },
  "loan-types": {
    columns: ["user_id", "name", "loan_type"],
    rows: [
      [601, "Ana", "both"],
      [602, "Bram", "personal"],
      [603, "Cleo", "business"],
      [604, "Dov", "none"],
      [605, "Ana", "personal"],
    ],
  },
};

const XP_BY_SLUG: Record<string, number> = {
  "highest-salaries-difference": 10,
  "rolling-average-steps": 20,
  "market-analysis-iii": 20,
  "find-expensive-cities": 10,
  "class-performance": 20,
  "loan-types": 10,
};

const REQUIRED_ORDER = Object.keys(CONTRACTS);

// -- engine-proven wrong-query probes (slug -> probes) -----------------------
// Each probe pins a trap claim made in the prose: build the dive's schema,
// run the WRONG query, and assert the exact wrong answer it produces.
type Probe = { label: string; sql: string; expect: CellValue[][] };
const PROBES: Record<string, Probe[]> = {
  "highest-salaries-difference": [
    { label: "MAX(DISTINCT)-MAX prints 0 (duplicate-top trap)", sql: "SELECT MAX(amount) - MAX(DISTINCT amount) AS g FROM Salary", expect: [[0]] },
    {
      label: "ROW_NUMBER 2 lands on the second 95000 row",
      sql: "SELECT amount FROM (SELECT amount, ROW_NUMBER() OVER (ORDER BY amount DESC) AS rn FROM Salary) WHERE rn = 2",
      expect: [[95000]],
    },
    { label: "MAX-MIN reports the spread, not the gap", sql: "SELECT MAX(amount) - MIN(amount) AS g FROM Salary", expect: [[14000]] },
  ],
  "rolling-average-steps": [
    {
      label: "ROWS 1 PRECEDING pulls the pre-gap row across the hole (06-04 = 6000)",
      sql: `SELECT user_id, walk_date, ROUND(AVG(steps) OVER (PARTITION BY user_id ORDER BY walk_date ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) AS ra
            FROM Steps ORDER BY user_id, walk_date`,
      expect: [
        [201, "2024-06-01", 6000],
        [201, "2024-06-02", 6500],
        [201, "2024-06-03", 7500],
        [201, "2024-06-04", 8500],
        [202, "2024-06-01", 4000],
        [202, "2024-06-02", 4500],
        [202, "2024-06-04", 6000],
        [202, "2024-06-05", 7500],
      ],
    },
    {
      label: "RANGE on the TEXT date degrades to current-row-only frames (06-02 = 7000)",
      sql: `SELECT user_id, walk_date, ROUND(AVG(steps) OVER (PARTITION BY user_id ORDER BY walk_date RANGE BETWEEN 1 PRECEDING AND CURRENT ROW), 2) AS ra
            FROM Steps ORDER BY user_id, walk_date`,
      expect: [
        [201, "2024-06-01", 6000],
        [201, "2024-06-02", 7000],
        [201, "2024-06-03", 8000],
        [201, "2024-06-04", 9000],
        [202, "2024-06-01", 4000],
        [202, "2024-06-02", 5000],
        [202, "2024-06-04", 7000],
        [202, "2024-06-05", 8000],
      ],
    },
  ],
  "market-analysis-iii": [
    { label: "TEXT year vs INTEGER 2022 matches nothing (type-order trap)", sql: "SELECT COUNT(*) AS c FROM OrderItem WHERE strftime('%Y', order_date) = 2022", expect: [[0]] },
    { label: "missing DISTINCT prints item 504 three times", sql: `WITH y2022 AS (SELECT item_id FROM OrderItem WHERE CAST(strftime('%Y', order_date) AS INTEGER) = 2022),
      y2021 AS (SELECT item_id FROM OrderItem WHERE CAST(strftime('%Y', order_date) AS INTEGER) = 2021)
      SELECT item_id FROM y2022 WHERE item_id NOT IN (SELECT item_id FROM y2021) ORDER BY item_id`, expect: [[501], [504], [504], [504]] },
    { label: "year-blind filter leaks the both-years item 502", sql: "SELECT DISTINCT item_id FROM OrderItem WHERE CAST(strftime('%Y', order_date) AS INTEGER) = 2022 ORDER BY item_id", expect: [[501], [502], [504]] },
  ],
  "find-expensive-cities": [
    {
      label: ">= ships the boundary city Corton beside Alder",
      sql: `WITH city_avg AS (SELECT city, AVG(price) AS avg_price FROM Listing GROUP BY city)
            SELECT city, ROUND(avg_price, 2) AS city_avg FROM city_avg
            WHERE avg_price >= (SELECT AVG(price) FROM Listing) ORDER BY city_avg DESC, city ASC`,
      expect: [["Alder", 210], ["Corton", 150]],
    },
    {
      label: "row-filter-in-WHERE rebuilds Bexley as 495 and ships it first",
      sql: `SELECT city, ROUND(AVG(price), 2) AS city_avg FROM Listing
            WHERE price > (SELECT AVG(price) FROM Listing) GROUP BY city ORDER BY city_avg DESC, city ASC`,
      expect: [["Bexley", 495], ["Alder", 210]],
    },
    { label: "mean-of-means is a different benchmark (164.29, not 150.0)", sql: "SELECT ROUND(AVG(m) * 1.0, 2) AS g FROM (SELECT AVG(price) AS m FROM Listing GROUP BY city)", expect: [[164.29]] },
  ],
  "class-performance": [
    {
      label: "<= brands the exact-mean row (Bram Biology 76) as needing help",
      sql: `WITH tagged AS (SELECT student_id, name, subject, score, AVG(score) OVER (PARTITION BY subject) AS subject_avg FROM Score)
            SELECT student_id, name, subject, score FROM tagged WHERE score <= subject_avg ORDER BY student_id, subject`,
      expect: [
        [41, "Anya", "Algebra", 55],
        [41, "Anya", "Biology", 60],
        [42, "Bram", "Biology", 76],
        [44, "Dov", "Algebra", 76],
      ],
    },
    {
      label: "partition-less window flags 5 rows via the class-wide 77.5",
      sql: `WITH t AS (SELECT student_id, name, subject, score, AVG(score) OVER () AS g FROM Score)
            SELECT student_id, name, subject, score FROM t WHERE score < g ORDER BY student_id, subject`,
      expect: [
        [41, "Anya", "Algebra", 55],
        [41, "Anya", "Biology", 60],
        [42, "Bram", "Biology", 76],
        [44, "Dov", "Algebra", 76],
        [44, "Dov", "Biology", 77],
      ],
    },
  ],
  "loan-types": [
    {
      label: "COUNT(*) makes Bram 'both' (2 rows) and Dov NULL (MAX over all-NULLs)",
      sql: `SELECT u.user_id, CASE WHEN COUNT(*) = 2 THEN 'both' WHEN COUNT(*) = 1 THEN MAX(l.loan_type) ELSE 'none' END AS loan_type
            FROM User u LEFT JOIN Loan l ON l.user_id = u.user_id GROUP BY u.user_id, u.name ORDER BY u.user_id`,
      expect: [[601, "both"], [602, "both"], [603, "business"], [604, null], [605, "personal"]],
    },
    {
      label: "INNER JOIN erases the none user 604",
      sql: `SELECT u.user_id, u.name FROM User u JOIN Loan l ON l.user_id = u.user_id GROUP BY u.user_id, u.name ORDER BY u.user_id`,
      expect: [[601, "Ana"], [602, "Bram"], [603, "Cleo"], [605, "Ana"]],
    },
    {
      label: "GROUP BY name fuses the two Anas into one 'both' row",
      sql: `SELECT u.name, CASE WHEN COUNT(DISTINCT l.loan_type) = 2 THEN 'both' WHEN COUNT(DISTINCT l.loan_type) = 1 THEN MAX(l.loan_type) ELSE 'none' END AS lt
            FROM User u LEFT JOIN Loan l ON l.user_id = u.user_id GROUP BY u.name ORDER BY u.name`,
      expect: [["Ana", "both"], ["Bram", "personal"], ["Cleo", "business"], ["Dov", "none"]],
    },
  ],
};

// -- extra NULL-path probes (scratch tables, own dbs) ------------------------
const NULL_PATH_PROBES: Probe[] = [
  {
    label: "[highest-salaries] single distinct amount -> NULL via MAX-of-empty",
    sql: `WITH ranked AS (SELECT amount, DENSE_RANK() OVER (ORDER BY amount DESC) AS rnk FROM Salary2)
          SELECT MAX(CASE WHEN rnk = 1 THEN amount END) - MAX(CASE WHEN rnk = 2 THEN amount END) AS salary_gap FROM ranked`,
    expect: [[null]],
  },
  {
    label: "[highest-salaries] one NULL in a NOT IN set makes the gap NULL",
    sql: "SELECT MAX(a) AS g FROM t1 WHERE a NOT IN (SELECT x FROM t2)",
    expect: [[null]],
  },
];

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

function collectProse(dive: LcSqlDive): string[] {
  return [
    dive.statement,
    ...dive.examples.flatMap((e) => [e.input, e.output, e.explanation ?? ""]),
    ...dive.constraints,
    ...dive.breakdown,
    ...dive.edges,
    ...dive.ladder.map((r) => r.title + " " + r.body),
    dive.approach,
    ...dive.walkthrough,
    ...(dive.followUps ?? []),
  ];
}

// -- run ---------------------------------------------------------------------
const fails: string[] = [];
let checks = 0;
const ok = (cond: boolean, msg: string) => {
  checks++;
  if (!cond) fails.push(msg);
};

// deliverable shape: exactly the 6 prescribed slugs, in the prescribed order
ok(SQL_PREMIUM4_MONEY.length === 6, `expected 6 dives, got ${SQL_PREMIUM4_MONEY.length}`);
ok(
  JSON.stringify(SQL_PREMIUM4_MONEY.map((d) => d.slug)) === JSON.stringify(REQUIRED_ORDER),
  `dive order mismatch: ${SQL_PREMIUM4_MONEY.map((d) => d.slug).join(", ")}`,
);

const perDive: Array<{ slug: string; pass: boolean }> = [];

function runRows(db: Database, sql: string): { columns: string[]; rows: CellValue[][] } {
  const st = db.prepare(sql.replace(/;+\s*$/, ""));
  const rows = st.all() as Record<string, unknown>[];
  const columns = st.columnNames;
  return { columns, rows: rows.map((r) => columns.map((c) => norm(r[c]))) };
}

for (const dive of SQL_PREMIUM4_MONEY as LcSqlDive[]) {
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

  // no backticks / template holes anywhere in string values, no platform mention in prose
  const hits: string[] = [];
  walkStrings(dive, dive.slug, hits);
  ok(hits.length === 0, `${tag} backtick or \${ found in: ${hits.join(", ")}`);
  const prose = collectProse(dive).join("\n").toLowerCase();
  ok(!prose.includes("leetcode") && !prose.includes("leetcode.com"), `${tag} prose mentions the source site`);

  // ddl/seed end with ';' and nothing after (incl. the trailing-comment bug class)
  for (const [key, val] of [["ddl", dive.schema.ddl], ["seed", dive.schema.seed]] as const) {
    const t = val.trim();
    ok(t.endsWith(";"), `${tag} ${key} does not end with ';'`);
    ok(/;\s*$/.test(val), `${tag} ${key} has content after the final semicolon`);
    ok(countStatements(val) >= 1, `${tag} ${key} holds no statements`);
    for (const line of val.split("\n")) {
      ok(!/;.*--/.test(line), `${tag} ${key} has a trailing comment after a semicolon: ${line.trim()}`);
      const commentIdx = line.indexOf("--");
      if (commentIdx >= 0) ok(!line.slice(commentIdx).includes(";"), `${tag} ${key} comment holds a ';': ${line.trim()}`);
    }
  }
  // code: no ';' inside comments either
  for (const line of dive.code.split("\n")) {
    const commentIdx = line.indexOf("--");
    if (commentIdx >= 0) ok(!line.slice(commentIdx).includes(";"), `${tag} code comment holds a ';': ${line.trim()}`);
  }
  ok((dive.schema.tables?.length ?? 0) >= 1, `${tag} schema.tables missing`);

  // structural counts
  ok(dive.examples.length === 2, `${tag} needs exactly 2 examples (got ${dive.examples.length})`);
  ok(dive.examples.every((e) => e.input.trim() && e.output.trim() && (e.explanation ?? "").trim()), `${tag} an example has an empty field`);
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
      const out = runRows(db, dive.code);
      if (pass === 0) {
        first = out;
        ok(
          JSON.stringify(out.columns) === JSON.stringify(contract.columns),
          `${tag} columns ${JSON.stringify(out.columns)} != ${JSON.stringify(contract.columns)}`,
        );
        ok(
          JSON.stringify(out.rows) === JSON.stringify(contract.rows),
          `${tag} rows mismatch:\n  got      ${JSON.stringify(out.rows)}\n  expected ${JSON.stringify(contract.rows)}`,
        );
      } else {
        ok(JSON.stringify(first) === JSON.stringify(out), `${tag} non-deterministic across runs`);
      }
    } catch (err) {
      fails.push(`${tag} FAILED: ${err instanceof Error ? err.message : String(err)}`);
      checks++;
    } finally {
      db.close();
    }
  }

  // -- wrong-query trap probes ------------------------------------------------
  for (const probe of PROBES[dive.slug] ?? []) {
    const db = new Database(":memory:");
    try {
      for (const s of splitStatements(dive.schema.ddl)) db.run(s);
      for (const s of splitStatements(dive.schema.seed)) db.run(s);
      const out = runRows(db, probe.sql);
      ok(
        JSON.stringify(out.rows) === JSON.stringify(probe.expect),
        `${tag} trap probe FAILED (${probe.label}):\n  got      ${JSON.stringify(out.rows)}\n  expected ${JSON.stringify(probe.expect)}`,
      );
    } catch (err) {
      fails.push(`${tag} trap probe (${probe.label}) threw: ${err instanceof Error ? err.message : String(err)}`);
      checks++;
    } finally {
      db.close();
    }
  }

  perDive.push({ slug: dive.slug, pass: fails.length === before });
}

// -- NULL-path probes on scratch tables (dive 1's stated edge semantics) -----
{
  const db = new Database(":memory:");
  try {
    db.run("CREATE TABLE Salary2 (salary_id INTEGER PRIMARY KEY, employee_id INTEGER NOT NULL, amount INTEGER NOT NULL);");
    db.run("INSERT INTO Salary2 VALUES (1, 11, 60000), (2, 12, 60000);");
    db.run("CREATE TABLE t1 (a INTEGER); INSERT INTO t1 VALUES (95000), (87000);");
    db.run("CREATE TABLE t2 (x INTEGER); INSERT INTO t2 VALUES (95000), (NULL);");
    for (const probe of NULL_PATH_PROBES) {
      const out = runRows(db, probe.sql);
      ok(
        JSON.stringify(out.rows) === JSON.stringify(probe.expect),
        `null-path probe FAILED (${probe.label}):\n  got      ${JSON.stringify(out.rows)}\n  expected ${JSON.stringify(probe.expect)}`,
      );
    }
  } finally {
    db.close();
  }
}

// -- PASS/FAIL table ----------------------------------------------------------
console.log("\ndive                                          result");
console.log("-------------------------------------------------------");
for (const d of perDive) {
  console.log(`${d.slug.padEnd(46)}${d.pass ? "PASS" : "FAIL"}`);
}
console.log(`\n${checks} assertions across ${SQL_PREMIUM4_MONEY.length} dives`);
if (fails.length) {
  console.error(`\n${fails.length} FAILURE(S):`);
  for (const f of fails) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("ALL CHECKS PASS 6/6");
