/**
 * Task 68-b5 self-check — sql-premium4-boards.ts
 * Mirrors scripts/lc-sql-verify.ts semantics: builds each dive's schema in
 * bun:sqlite :memory:, runs the solution TWICE (determinism), and HARD-asserts
 * the exact columns + full row arrays (order-sensitive) against hand-derived
 * contracts, plus the batch's structural invariants AND the planted-trap
 * claims made in each dive's edges. Related slugs are verified against LC_ALL
 * (imported from the registry).
 *
 * Run: bun scripts/tmp-68b5-check.ts
 */
import { Database } from "bun:sqlite";
import { SQL_PREMIUM4_BOARDS } from "../src/lib/leetcode/content/sql-premium4-boards";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import type { CellValue } from "../src/lib/sql-types";
import type { LcSqlDive } from "../src/lib/leetcode/types";

// -- hand-derived contracts (slug -> columns, rows in graded order) ---------
const CONTRACTS: Record<string, { columns: string[]; rows: CellValue[][] }> = {
  "manager-of-the-largest-department": {
    columns: ["dept_id", "dept_name", "manager_id", "manager_name"],
    rows: [[1, "Harbor Operations", 11, "Ada"]],
  },
  "calculate-compressed-mean": {
    columns: ["mean_wage"],
    rows: [[377.27]],
  },
  "find-third-transaction": {
    columns: ["user_id", "third_amount", "third_time"],
    rows: [
      [1, 80, "2024-05-03"],
      [2, 30, "2024-05-03"],
      [4, 25, "2024-05-02"],
    ],
  },
  "top-three-wineries": {
    columns: ["region", "winery_name", "rating", "rnk"],
    rows: [
      ["Douro", "Quinta Alma", 88, 1],
      ["Loire", "Chateau Lumiere", 90, 1],
      ["Loire", "Clos Rene", 80, 2],
      ["Mosel", "Weingut Falk", 90, 1],
      ["Mosel", "Kupfer Grube", 85, 2],
      ["Mosel", "Stern Lay", 85, 2],
      ["Rioja", "Bodega Luna", 90, 1],
      ["Rioja", "Bodega Sol", 90, 1],
    ],
  },
  "top-percentile-fraud": {
    columns: ["state", "tx_id", "amount"],
    rows: [
      ["Nevada", 1, 200],
      ["Oregon", 21, 100],
    ],
  },
  "employees-project-allocation": {
    columns: ["project_id", "employee_id", "role", "best_skill", "years"],
    rows: [
      [1, 101, "lead", "Python", 6],
      [1, 102, "builder", "Go", 5],
      [1, 103, "builder", "SQL", 4],
      [2, 103, "reviewer", "SQL", 4],
      [2, 104, "lead", "Scala", 7],
      [2, 105, "builder", "Python", 9],
    ],
  },
  "find-candidates-for-data-scientist-position": {
    columns: ["candidate_id"],
    rows: [[1], [4]],
  },
};

const XP_BY_SLUG: Record<string, number> = {
  "manager-of-the-largest-department": 20,
  "calculate-compressed-mean": 10,
  "find-third-transaction": 20,
  "top-three-wineries": 35,
  "top-percentile-fraud": 20,
  "employees-project-allocation": 35,
  "find-candidates-for-data-scientist-position": 10,
};

const REQUIRED_ORDER = Object.keys(CONTRACTS);

// -- planted-trap probes: each re-runs a deliberately WRONG query against the
//    dive's own schema/seed and asserts the failure mode the edges describe ---
type TrapProbe = { name: string; setup?: string; sql: (code: string) => string; check: (rows: CellValue[][]) => string | null };
const TRAP_PROBES: Record<string, TrapProbe[]> = {
  "manager-of-the-largest-department": [
    {
      name: "manager name joined from Employee resolves to the planted collision 'June'",
      sql: (c) => c.replace("JOIN People p ON p.people_id = d.manager_id", "JOIN Employee p ON p.emp_id = d.manager_id"),
      check: (rows) =>
        JSON.stringify(rows) === JSON.stringify([[1, "Harbor Operations", 11, "June"]])
          ? null
          : `wrong-join rows ${JSON.stringify(rows)}`,
    },
  ],
  "calculate-compressed-mean": [
    {
      name: "dropping the 1.0 promotion collapses to integer division (377)",
      sql: (c) => c.replace("* 1.0", ""),
      check: (rows) => (JSON.stringify(rows) === JSON.stringify([[377]]) ? null : `rows ${JSON.stringify(rows)}`),
    },
    {
      name: "plain AVG(hourly_wage) gives the naive 382.5",
      sql: () => "SELECT AVG(hourly_wage) AS v FROM SalaryBucket",
      check: (rows) => (rows.length === 1 && Math.abs(Number(rows[0][0]) - 382.5) < 1e-9 ? null : `rows ${JSON.stringify(rows)}`),
    },
  ],
  "find-third-transaction": [
    {
      name: "tx_id-only ordering makes user 4's third tx 13 (15 on 05-01)",
      sql: (c) => c.replace("ORDER BY paid_at, tx_id", "ORDER BY tx_id"),
      check: (rows) =>
        JSON.stringify(rows) ===
        JSON.stringify([
          [1, 80, "2024-05-03"],
          [2, 30, "2024-05-03"],
          [4, 15, "2024-05-01"],
        ])
          ? null
          : `rows ${JSON.stringify(rows)}`,
    },
    {
      name: "rn <= 3 leaks eleven rows instead of three",
      sql: (c) => c.replace("rn = 3", "rn <= 3"),
      check: (rows) => (rows.length === 11 ? null : `got ${rows.length} rows`),
    },
  ],
  "top-three-wineries": [
    {
      name: "DENSE_RANK wrongly rescues Rioja's 80 (Bodega Mar)",
      sql: (c) => c.replace("RANK()", "DENSE_RANK()"),
      check: (rows) =>
        rows.some((r) => r[1] === "Bodega Mar") ? null : "Bodega Mar should leak in under DENSE_RANK",
    },
    {
      name: "ROW_NUMBER drops one of Mosel's tied 85s",
      sql: (c) => c.replace("RANK()", "ROW_NUMBER()"),
      check: (rows) => {
        const mosel = rows.filter((r) => r[0] === "Mosel");
        return mosel.length === 2 && !mosel.some((r) => r[1] === "Kupfer Grube")
          ? null
          : `Mosel rows ${JSON.stringify(mosel)}`;
      },
    },
  ],
  "top-percentile-fraud": [
    {
      name: "unpartitioned PERCENT_RANK leaks Nevada tx 2 (190)",
      sql: (c) => c.replace(/PARTITION BY state\s*\n\s*ORDER BY amount/, "ORDER BY amount"),
      check: (rows) =>
        JSON.stringify(rows) ===
        JSON.stringify([
          ["Nevada", 1, 200],
          ["Nevada", 2, 190],
        ])
          ? null
          : `rows ${JSON.stringify(rows)}`,
    },
    {
      name: "a tie at Oregon's max demotes BOTH max rows below the bar (8/9)",
      setup: "UPDATE Txn SET amount = 100 WHERE tx_id = 22;",
      sql: () =>
        `WITH scored AS (SELECT tx_id, state, amount, PERCENT_RANK() OVER (PARTITION BY state ORDER BY amount) AS pr FROM Txn WHERE state = 'Oregon')
         SELECT tx_id, pr FROM scored WHERE tx_id IN (21, 22)`,
      check: (rows) => {
        if (rows.length !== 2) return `expected the two Oregon max rows, got ${JSON.stringify(rows)}`;
        return rows.every((r) => Math.abs(Number(r[1]) - 8 / 9) < 1e-4) ? null : `pr values ${JSON.stringify(rows)}`;
      },
    },
  ],
  "employees-project-allocation": [
    {
      name: "project-only grouping paints all of project 1 with 'Python'",
      sql: () =>
        `WITH tops AS (
           SELECT pe.project_id AS project_id, MAX(es.experience_years) AS years
           FROM ProjectEmployee pe JOIN EmployeeSkill es ON es.employee_id = pe.employee_id
           GROUP BY pe.project_id
         ), named AS (
           SELECT t.project_id AS project_id, MIN(es.skill) AS best_skill
           FROM tops t, ProjectEmployee pe2, EmployeeSkill es
           WHERE pe2.project_id = t.project_id AND es.employee_id = pe2.employee_id
             AND es.experience_years = t.years
           GROUP BY t.project_id
         )
         SELECT pe.project_id, pe.employee_id, n.best_skill
         FROM ProjectEmployee pe JOIN named n ON n.project_id = pe.project_id
         ORDER BY pe.project_id, pe.employee_id`,
      check: (rows) =>
        rows.length === 6 && rows.every((r) => r[2] === "Python")
          ? null
          : `project-only rows ${JSON.stringify(rows)}`,
    },
    {
      name: "RANK() = 1 over raw rows duplicates employee 103's SQL row",
      sql: () =>
        `SELECT project_id, employee_id, best_skill, years FROM (
           SELECT pe.project_id, pe.employee_id, es.skill AS best_skill, es.experience_years AS years,
                  RANK() OVER (PARTITION BY pe.project_id, pe.employee_id ORDER BY es.experience_years DESC, es.skill ASC) AS rnk
           FROM ProjectEmployee pe JOIN EmployeeSkill es ON es.employee_id = pe.employee_id
         ) WHERE rnk = 1 AND project_id = 1 AND employee_id = 103`,
      check: (rows) => (rows.length === 2 ? null : `expected 2 duplicate rows for (1, 103), got ${JSON.stringify(rows)}`),
    },
  ],
  "find-candidates-for-data-scientist-position": [
    {
      name: ">= 2 boundary wrongly qualifies candidate 3",
      sql: (c) => c.split("> 2").join(">= 2"),
      check: (rows) =>
        JSON.stringify(rows) === JSON.stringify([[1], [3], [4]]) ? null : `rows ${JSON.stringify(rows)}`,
    },
    {
      name: "no-skill-filter HAVING COUNT >= 2 AND MAX > 2 also qualifies candidate 3",
      sql: () =>
        `SELECT candidate_id FROM Candidate
         GROUP BY candidate_id
         HAVING COUNT(*) >= 2 AND MAX(years_of_experience) > 2
         ORDER BY candidate_id`,
      check: (rows) =>
        JSON.stringify(rows) === JSON.stringify([[1], [3], [4]]) ? null : `rows ${JSON.stringify(rows)}`,
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

// deliverable shape: exactly the 7 prescribed slugs, in the prescribed order
ok(SQL_PREMIUM4_BOARDS.length === 7, `expected 7 dives, got ${SQL_PREMIUM4_BOARDS.length}`);
ok(
  JSON.stringify(SQL_PREMIUM4_BOARDS.map((d) => d.slug)) === JSON.stringify(REQUIRED_ORDER),
  `dive order mismatch: ${SQL_PREMIUM4_BOARDS.map((d) => d.slug).join(", ")}`,
);

const perDive: Array<{ slug: string; pass: boolean }> = [];

for (const dive of SQL_PREMIUM4_BOARDS as LcSqlDive[]) {
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

  // no ';' inside comments (ddl/seed/code)
  for (const [key, val] of [["ddl", dive.schema.ddl], ["seed", dive.schema.seed], ["code", dive.code]] as const) {
    for (const line of val.split("\n")) {
      const idx = line.indexOf("--");
      if (idx >= 0) ok(!line.slice(idx).includes(";"), `${tag} ${key} comment contains ';': ${line.trim()}`);
    }
  }

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
    }
    if (pass === 1) {
      // planted-trap probes run against the freshly seeded second-pass db
      for (const probe of TRAP_PROBES[dive.slug] ?? []) {
        try {
          if (probe.setup) db.exec(probe.setup);
          const st2 = db.prepare(probe.sql(dive.code).replace(/;\s*$/, ""));
          const rows2 = (st2.all() as Record<string, unknown>[]).map((r) => Object.values(r).map(norm));
          const verdict = probe.check(rows2);
          ok(verdict === null, `${tag} trap probe "${probe.name}": ${verdict ?? ""}`);
        } catch (err) {
          fails.push(`${tag} trap probe "${probe.name}" threw: ${err instanceof Error ? err.message : String(err)}`);
          checks++;
        }
      }
    }
    db.close();
  }

  perDive.push({ slug: dive.slug, pass: fails.length === before });
}

// -- PASS/FAIL table ----------------------------------------------------------
console.log("\ndive                                                  result");
console.log("------------------------------------------------------------");
for (const d of perDive) {
  console.log(`${d.slug.padEnd(54)}${d.pass ? "PASS" : "FAIL"}`);
}
console.log(`\n${checks} assertions across ${SQL_PREMIUM4_BOARDS.length} dives`);
if (fails.length) {
  console.error(`\n${fails.length} FAILURE(S):`);
  for (const f of fails) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("ALL CHECKS PASS 7/7");
