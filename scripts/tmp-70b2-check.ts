/**
 * Task 70-b2 self-check — sql-free-windows.ts
 * Mirrors scripts/lc-sql-verify.ts semantics: builds each dive's schema in
 * bun:sqlite :memory:, runs the solution TWICE (determinism), and HARD-asserts
 * the exact columns + full row arrays (order-sensitive) against hand-derived
 * contracts, plus the batch's structural invariants. Related slugs are
 * verified against LC_ALL (imported from the registry). Each dive also gets
 * planted-trap probes: the WRONG queries re-run with their documented wrong
 * outputs asserted.
 *
 * Run: bun scripts/tmp-70b2-check.ts
 */
import { Database } from "bun:sqlite";
import { SQL_FREE_WINDOWS } from "../src/lib/leetcode/content/sql-free-windows";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import type { CellValue } from "../src/lib/sql-types";
import type { LcSqlDive } from "../src/lib/leetcode/types";

// -- hand-derived contracts (slug -> columns, rows in graded order) ---------
const CONTRACTS: Record<string, { columns: string[]; rows: CellValue[][] }> = {
  "human-traffic-of-stadium": {
    columns: ["day", "visitors"],
    rows: [
      [1, 120], [2, 115], [3, 130],
      [10, 145], [11, 100], [12, 118],
      [14, 160], [15, 155], [16, 150], [17, 170],
    ],
  },
  "customers-who-bought-all-products": {
    columns: ["shopper_id"],
    rows: [[1], [2]],
  },
  "restaurant-growth": {
    columns: ["visited_on", "rolling_avg"],
    rows: [
      ["2024-06-07", 117.14],
      ["2024-06-08", 125.71],
      ["2024-06-09", 123.57],
      ["2024-06-10", 120],
    ],
  },
  "find-students-who-improved": {
    columns: ["student_id", "subject", "first_score", "second_score"],
    rows: [
      [1, "Math", 70, 85],
      [1, "Physics", 80, 92],
      [2, "Math", 65, 78],
      [4, "Physics", 59, 60],
    ],
  },
  "find-consistently-improving-employees": {
    columns: ["employee_id", "review_count"],
    rows: [[1, 4], [2, 3]],
  },
};

const XP_BY_SLUG: Record<string, number> = {
  "human-traffic-of-stadium": 35,
  "customers-who-bought-all-products": 20,
  "restaurant-growth": 20,
  "find-students-who-improved": 20,
  "find-consistently-improving-employees": 20,
};

const REQUIRED_ORDER = Object.keys(CONTRACTS);

// -- planted-trap probes: WRONG queries with their documented wrong outputs --
const TRAPS: Record<string, Array<{ name: string; sql: string; want: unknown }>> = {
  "human-traffic-of-stadium": [
    { name: "bare WHERE >= 100 ships the isolated day", sql: "SELECT COUNT(*) FROM VenueDay WHERE visitors >= 100", want: [[13]] },
    {
      name: "> 100 flag deletes exactly-100 day 11 and strands its run",
      sql: `WITH f AS (SELECT day, CASE WHEN visitors > 100 THEN 1 ELSE 0 END AS hot FROM VenueDay),
            i AS (SELECT day, day - SUM(hot) OVER (ORDER BY day) AS grp FROM f WHERE hot = 1)
            SELECT day FROM i WHERE grp IN (SELECT grp FROM i GROUP BY grp HAVING COUNT(*) >= 3) ORDER BY day`,
      want: [[1], [2], [3], [14], [15], [16], [17]],
    },
    {
      name: "HAVING > 3 drops the 3-day streaks",
      sql: `WITH f AS (SELECT day, CASE WHEN visitors >= 100 THEN 1 ELSE 0 END AS hot FROM VenueDay),
            i AS (SELECT day, day - SUM(hot) OVER (ORDER BY day) AS grp FROM f WHERE hot = 1)
            SELECT day FROM i WHERE grp IN (SELECT grp FROM i GROUP BY grp HAVING COUNT(*) > 3) ORDER BY day`,
      want: [[14], [15], [16], [17]],
    },
    {
      name: "run-length counted over ALL rows leaks the 2-day pair",
      sql: `WITH f AS (SELECT day, CASE WHEN visitors >= 100 THEN 1 ELSE 0 END AS hot FROM VenueDay),
            i AS (SELECT day, day - SUM(hot) OVER (ORDER BY day) AS grp, hot FROM f)
            SELECT day FROM i WHERE grp IN (SELECT grp FROM i GROUP BY grp HAVING COUNT(*) >= 3) AND hot = 1 ORDER BY day`,
      want: [[1], [2], [3], [7], [8], [10], [11], [12], [14], [15], [16], [17]],
    },
  ],
  "customers-who-bought-all-products": [
    { name: "COUNT(*) vs catalogue drops the duplicate buyer", sql: "SELECT shopper_id FROM ShopperCart GROUP BY shopper_id HAVING COUNT(*) = (SELECT COUNT(*) FROM Product) ORDER BY shopper_id", want: [[1]] },
    { name: "HAVING >= 2 admits the 2-of-3 near-miss", sql: "SELECT shopper_id FROM ShopperCart GROUP BY shopper_id HAVING COUNT(DISTINCT product_id) >= 2 ORDER BY shopper_id", want: [[1], [2], [3]] },
    { name: "no DISTINCT with a literal count", sql: "SELECT shopper_id FROM ShopperCart GROUP BY shopper_id HAVING COUNT(*) = 3 ORDER BY shopper_id", want: [[1]] },
  ],
  "restaurant-growth": [
    {
      name: "no frame filter prints underfilled weeks (day 1 = 12.86)",
      sql: "SELECT visited_on, ROUND(SUM(amount) OVER (ORDER BY visited_on ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) * 1.0 / 7, 2) AS r FROM CafeDay ORDER BY visited_on LIMIT 1",
      want: [["2024-06-01", 12.86]],
    },
    {
      name: "pre-window WHERE date filter degenerates the frames",
      sql: `WITH w AS (SELECT visited_on, ROUND(SUM(amount) OVER (ORDER BY visited_on ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) * 1.0 / 7, 2) AS r
                  FROM CafeDay WHERE visited_on >= '2024-06-07')
            SELECT visited_on, r FROM w ORDER BY visited_on`,
      want: [["2024-06-07", 18.57], ["2024-06-08", 40], ["2024-06-09", 53.57], ["2024-06-10", 68.57]],
    },
    {
      name: "integer division without * 1.0 floors the averages",
      sql: `WITH w AS (SELECT visited_on, ROUND(SUM(amount) OVER (ORDER BY visited_on ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) / 7, 2) AS r,
                          COUNT(*) OVER (ORDER BY visited_on ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS n FROM CafeDay)
            SELECT visited_on, r FROM w WHERE n = 7 ORDER BY visited_on`,
      want: [["2024-06-07", 117], ["2024-06-08", 125], ["2024-06-09", 123], ["2024-06-10", 120]],
    },
  ],
  "find-students-who-improved": [
    {
      name: ">= admits the equal pair (4, Math, 84, 84)",
      sql: `SELECT t1.student_id, t1.subject FROM TestScore t1
            JOIN TestScore t2 ON t1.student_id = t2.student_id AND t1.subject = t2.subject
                 AND t1.attempt = 1 AND t2.attempt = 2
            WHERE t2.score >= t1.score ORDER BY t1.student_id, t1.subject`,
      want: [[1, "Math"], [1, "Physics"], [2, "Math"], [4, "Math"], [4, "Physics"]],
    },
    {
      name: "missing subject key fabricates 9 rows incl. student 3",
      sql: `SELECT t1.student_id, t1.subject, t2.score FROM TestScore t1
            JOIN TestScore t2 ON t1.student_id = t2.student_id AND t1.attempt = 1 AND t2.attempt = 2
            WHERE t2.score > t1.score ORDER BY t1.student_id, t1.subject, t2.score`,
      want: [
        [1, "Math", 85], [1, "Math", 92], [1, "Physics", 85], [1, "Physics", 92],
        [2, "Math", 78], [2, "Math", 88],
        [3, "Chemistry", 81],
        [4, "Physics", 60], [4, "Physics", 84],
      ],
    },
    {
      name: "<> counts declines as improvement (student 3 leaks)",
      sql: `SELECT t1.student_id, t1.subject FROM TestScore t1
            JOIN TestScore t2 ON t1.student_id = t2.student_id AND t1.subject = t2.subject
                 AND t1.attempt = 1 AND t2.attempt = 2
            WHERE t2.score <> t1.score ORDER BY t1.student_id, t1.subject`,
      want: [[1, "Math"], [1, "Physics"], [2, "Biology"], [2, "Math"], [3, "Chemistry"], [3, "Math"], [4, "Physics"]],
    },
  ],
  "find-consistently-improving-employees": [
    {
      name: "no >= 3 gate crowns the two-review employee",
      sql: `WITH flagged AS (SELECT employee_id, rating,
                  CASE WHEN LAG(rating) OVER (PARTITION BY employee_id ORDER BY review_id) >= rating THEN 1 ELSE 0 END AS bad_step
                FROM PerformanceReview),
              safe AS (SELECT employee_id, rating, MAX(bad_step) OVER (PARTITION BY employee_id) AS ever_bad FROM flagged)
              SELECT employee_id, COUNT(*) FROM safe WHERE ever_bad = 0 GROUP BY employee_id HAVING COUNT(*) >= 1 ORDER BY employee_id`,
      want: [[1, 4], [2, 3], [5, 2]],
    },
    {
      name: "strictly-falling-only flag keeps the 7-7 plateau employee",
      sql: `WITH flagged AS (SELECT employee_id, rating,
                  CASE WHEN LAG(rating) OVER (PARTITION BY employee_id ORDER BY review_id) > rating THEN 1 ELSE 0 END AS bad_step
                FROM PerformanceReview),
              safe AS (SELECT employee_id, rating, MAX(bad_step) OVER (PARTITION BY employee_id) AS ever_bad FROM flagged)
              SELECT employee_id, COUNT(*) FROM safe WHERE ever_bad = 0 GROUP BY employee_id HAVING COUNT(*) >= 3 ORDER BY employee_id`,
      want: [[1, 4], [2, 3], [3, 3]],
    },
    {
      name: "HAVING > 3 erases the exactly-three boundary employee",
      sql: `WITH flagged AS (SELECT employee_id, rating,
                  CASE WHEN LAG(rating) OVER (PARTITION BY employee_id ORDER BY review_id) >= rating THEN 1 ELSE 0 END AS bad_step
                FROM PerformanceReview),
              safe AS (SELECT employee_id, rating, MAX(bad_step) OVER (PARTITION BY employee_id) AS ever_bad FROM flagged)
              SELECT employee_id, COUNT(*) FROM safe WHERE ever_bad = 0 GROUP BY employee_id HAVING COUNT(*) > 3 ORDER BY employee_id`,
      want: [[1, 4]],
    },
    {
      name: "MIN < MAX heuristic admits the late dip and the plateau",
      sql: "SELECT employee_id, COUNT(*) FROM PerformanceReview GROUP BY employee_id HAVING COUNT(*) >= 3 AND MIN(rating) < MAX(rating) ORDER BY employee_id",
      want: [[1, 4], [2, 3], [3, 3], [4, 5]],
    },
  ],
};

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
    if (v.includes("`") || v.includes("${")) hits.push(`${path} (backtick/hole)`);
    if (/leetcode/i.test(v)) hits.push(`${path} (platform mention)`);
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
ok(SQL_FREE_WINDOWS.length === 5, `expected 5 dives, got ${SQL_FREE_WINDOWS.length}`);
ok(
  JSON.stringify(SQL_FREE_WINDOWS.map((d) => d.slug)) === JSON.stringify(REQUIRED_ORDER),
  `dive order mismatch: ${SQL_FREE_WINDOWS.map((d) => d.slug).join(", ")}`,
);

const perDive: Array<{ slug: string; pass: boolean }> = [];

for (const dive of SQL_FREE_WINDOWS as LcSqlDive[]) {
  const tag = `[${dive.slug}]`;
  const before = fails.length;

  // xp / order / no writes / statement shape
  ok(dive.xp === XP_BY_SLUG[dive.slug], `${tag} xp ${dive.xp} != ${XP_BY_SLUG[dive.slug]}`);
  ok(dive.order === "exact", `${tag} order must be "exact"`);
  ok(dive.writeVerify === undefined, `${tag} read problem must not carry writeVerify`);
  ok(countStatements(dive.code) === 1, `${tag} code must be exactly 1 statement (got ${countStatements(dive.code)})`);
  ok(/\border\s+by\b/i.test(stripCommentsAndOver(dive.code)), `${tag} order:"exact" but no result-level ORDER BY`);
  ok(dive.statement.length > 100, `${tag} statement suspiciously short`);

  // approach: ONE line
  ok(!dive.approach.includes("\n"), `${tag} approach must be a single line`);
  ok(dive.approach.trim().length > 0 && dive.approach.trim() === dive.approach, `${tag} approach not trimmed`);

  // no backticks / template holes / platform mention anywhere in string values
  const hits: string[] = [];
  walkStrings(dive, dive.slug, hits);
  ok(hits.length === 0, `${tag} forbidden string content: ${hits.join(", ")}`);

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
  for (const line of dive.code.split("\n")) {
    ok(!/--[^'\n]*;/.test(line.replace(/'[^']*'/g, "")), `${tag} code comment holds a ';': ${line.trim()}`);
  }
  ok((dive.schema.tables?.length ?? 0) >= 1, `${tag} schema.tables missing`);

  // structural counts
  ok(dive.examples.length === 2, `${tag} needs exactly 2 examples (got ${dive.examples.length})`);
  ok(dive.examples.every((e) => e.input.trim() && e.output.trim() && (e.explanation ?? "").trim()), `${tag} an example is missing input/output/explanation`);
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

  // -- planted-trap probes: the WRONG queries must fail AS DOCUMENTED --------
  const db2 = new Database(":memory:");
  try {
    for (const s of splitStatements(dive.schema.ddl)) db2.run(s);
    for (const s of splitStatements(dive.schema.seed)) db2.run(s);
    for (const trap of TRAPS[dive.slug] ?? []) {
      const st = db2.prepare(trap.sql.endsWith(";") ? trap.sql : `${trap.sql};`);
      const rows = (st.all() as Record<string, unknown>[]).map((r) => st.columnNames.map((c) => norm(r[c])));
      ok(
        JSON.stringify(rows) === JSON.stringify(trap.want),
        `${tag} TRAP "${trap.name}": got ${JSON.stringify(rows)} want ${JSON.stringify(trap.want)}`,
      );
    }
  } catch (err) {
    fails.push(`${tag} TRAP SETUP FAILED: ${err instanceof Error ? err.message : String(err)}`);
    checks++;
  } finally {
    db2.close();
  }

  perDive.push({ slug: dive.slug, pass: fails.length === before });
}

// -- PASS/FAIL table ----------------------------------------------------------
console.log("\ndive                                                          result");
console.log("-------------------------------------------------------------------");
for (const d of perDive) {
  console.log(`${d.slug.padEnd(62)}${d.pass ? "PASS" : "FAIL"}`);
}
console.log(`\n${checks} assertions across ${SQL_FREE_WINDOWS.length} dives`);
if (fails.length) {
  console.error(`\n${fails.length} FAILURE(S):`);
  for (const f of fails) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("ALL CHECKS PASS 5/5");
