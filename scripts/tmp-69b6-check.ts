/**
 * Task 69-b6 self-check — sql-premium5-finales.ts (batch 9, file 6 of 6)
 * Mirrors scripts/lc-sql-verify.ts semantics: builds each dive's schema in
 * bun:sqlite :memory:, runs the solution TWICE (determinism), and HARD-asserts
 * the exact columns + full row arrays (order-sensitive) against hand-derived
 * contracts, plus the batch's structural invariants and planted-trap probes
 * (each wrong query re-run against the seed to pin its documented failure).
 * Related slugs are verified against LC_ALL (imported from the registry).
 *
 * Run: bun scripts/tmp-69b6-check.ts
 */
import { Database } from "bun:sqlite";
import { SQL_PREMIUM5_FINALS } from "../src/lib/leetcode/content/sql-premium5-finales";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import type { CellValue } from "../src/lib/sql-types";
import type { LcSqlDive } from "../src/lib/leetcode/types";

// -- hand-derived contracts (slug -> columns, rows in graded order) ---------
const CONTRACTS: Record<string, { columns: string[]; rows: CellValue[][] }> = {
  "find-top-scoring-students": {
    columns: ["student_id", "passed_subjects"],
    rows: [
      [3, 3],
      [1, 2],
      [2, 2],
    ],
  },
  "find-top-scoring-students-ii": {
    columns: ["student_id", "subjects_attempted", "min_subject_score"],
    rows: [
      [501, 3, 85],
      [503, 2, 80],
      [505, 2, 82],
    ],
  },
  "find-overlapping-shifts": {
    columns: ["employee_id", "shift_id_a", "shift_id_b"],
    rows: [
      [11, 1, 2],
      [33, 5, 6],
    ],
  },
  "find-overlapping-shifts-ii": {
    columns: ["employee_id", "max_concurrent"],
    rows: [
      [11, 3],
      [22, 1],
      [33, 1],
    ],
  },
  "books-with-null-ratings": {
    columns: ["rated_count", "unrated_count", "avg_rated"],
    rows: [[4, 1, 6]],
  },
  "first-letter-capitalization": {
    columns: ["entry_id", "transformed"],
    rows: [
      [1, "Hello world Again today"],
      [2, "Hello"],
      [3, "Once upon A time Today"],
    ],
  },
};

const XP_BY_SLUG: Record<string, number> = {
  "find-top-scoring-students": 20,
  "find-top-scoring-students-ii": 35,
  "find-overlapping-shifts": 20,
  "find-overlapping-shifts-ii": 35,
  "books-with-null-ratings": 10,
  "first-letter-capitalization": 35,
};

// -- planted-trap probes: wrong query -> the documented wrong result --------
// Each is run against the dive's own ddl+seed; the assertion is that the
// WRONG query produces exactly the wrong rows named in the prose.
const PROBES: Record<string, Array<{ label: string; sql: (code: string) => string; expect: CellValue[][] }>> = {
  "find-top-scoring-students": [
    {
      label: "AVG-per-subject demotes student 3 (retake drags it down)",
      sql: (c) => c.replace("MAX(score) AS top_score", "AVG(score) AS top_score"),
      expect: [[1, 2], [2, 2], [3, 2]],
    },
    {
      label: "raw-row filter counts attempts: student 5 wrongly admitted",
      sql: () =>
        `SELECT student_id, COUNT(*) AS passed_subjects
FROM ExamScore
WHERE score >= 80
GROUP BY student_id
HAVING COUNT(*) >= 2
ORDER BY passed_subjects DESC, student_id ASC`,
      expect: [[3, 3], [1, 2], [2, 2], [5, 2]],
    },
    {
      label: "strict > 80 erases the boundary student 2",
      sql: (c) => c.replace("WHERE top_score >= 80", "WHERE top_score > 80"),
      expect: [[3, 3], [1, 2]],
    },
  ],
  "find-top-scoring-students-ii": [
    {
      label: "raw-MIN single stage: 504 wrongly in (min 91), 505 wrongly out",
      sql: () =>
        `SELECT
  student_id,
  COUNT(*) AS subjects_attempted,
  MIN(score) AS min_subject_score
FROM ExamScore
GROUP BY student_id
HAVING MIN(score) >= 80 AND COUNT(*) >= 2
ORDER BY student_id`,
      expect: [[501, 3, 85], [503, 2, 80], [504, 2, 91]],
    },
    {
      label: "dropping the >= 2 gate admits one-subject student 504",
      sql: (c) => c.replace("       AND COUNT(*) >= 2", ""),
      expect: [[501, 3, 85], [503, 2, 80], [504, 1, 95], [505, 2, 82]],
    },
  ],
  "find-overlapping-shifts": [
    {
      label: "closed intervals (<=) fabricate the touch pair (22, 3, 4)",
      sql: (c) => c.replace("a.start_time  < b.end_time", "a.start_time <= b.end_time").replace("b.start_time  < a.end_time", "b.start_time <= a.end_time"),
      expect: [[11, 1, 2], [22, 3, 4], [33, 5, 6]],
    },
    {
      label: "no id guard: self-pairs and mirrored twins (12 rows)",
      sql: (c) => c.replace(" AND a.shift_id    < b.shift_id     -- dedupe the join's mirrored output\n", ""),
      expect: [
        [11, 1, 1], [11, 1, 2], [11, 2, 1], [11, 2, 2],
        [22, 3, 3], [22, 4, 4],
        [33, 5, 5], [33, 5, 6], [33, 6, 5], [33, 6, 6],
        [44, 7, 7], [44, 8, 8],
      ],
    },
  ],
  "find-overlapping-shifts-ii": [
    {
      label: "delta DESC flip stacks the touch: employee 22 reports 2",
      sql: (c) => c.replace("ORDER BY ts ASC, delta ASC", "ORDER BY ts ASC, delta DESC"),
      expect: [[11, 3], [22, 2], [33, 1]],
    },
    {
      label: "no window ORDER BY: partition totals report 0 everywhere",
      sql: () =>
        `SELECT employee_id, SUM(delta) AS max_concurrent
FROM (
  SELECT employee_id, 1 AS delta FROM Shift
  UNION ALL
  SELECT employee_id, -1 AS delta FROM Shift
)
GROUP BY employee_id
ORDER BY employee_id`,
      expect: [[11, 0], [22, 0], [33, 0]],
    },
    {
      label: "pair-count + 1: employee 11 reads 4, employees 22/33 vanish",
      sql: () =>
        `SELECT employee_id, COUNT(*) + 1 AS max_concurrent
FROM (
  SELECT a.employee_id
  FROM Shift a
  JOIN Shift b
    ON a.employee_id = b.employee_id
   AND a.shift_id < b.shift_id
   AND a.start_time < b.end_time
   AND b.start_time < a.end_time
)
GROUP BY employee_id
ORDER BY employee_id`,
      expect: [[11, 4]],
    },
    {
      label: "default RANGE frame (frame dropped): coincides on this seed (no dup (ts, delta) peers)",
      sql: (c) =>
        c.replace("            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n", ""),
      expect: [[11, 3], [22, 1], [33, 1]],
    },
  ],
  "books-with-null-ratings": [
    {
      label: "COALESCE(rating, 0) dilutes the mean to 4.8",
      sql: () => `SELECT ROUND(AVG(COALESCE(rating, 0)), 2) AS avg_rated FROM Book`,
      expect: [[4.8]],
    },
    {
      label: "NULLIF(rating, 0) demotes the real zero: 3 / 2 / 8.0",
      sql: () =>
        `SELECT
  COUNT(NULLIF(rating, 0)) AS rated_count,
  COUNT(*) - COUNT(NULLIF(rating, 0)) AS unrated_count,
  ROUND(AVG(NULLIF(rating, 0)), 2) AS avg_rated
FROM Book`,
      expect: [[3, 2, 8]],
    },
    {
      label: "COUNT(*) as rated_count reads 5",
      sql: () => `SELECT COUNT(*) AS rated_count FROM Book`,
      expect: [[5]],
    },
    {
      label: "hand-rolled SUM/COUNT is INTEGER division (24/4 = 6 here; (8,7,9,1) variant floors to 6 vs AVG 6.25)",
      sql: () => `SELECT SUM(rating) / COUNT(rating) AS avg_rated FROM Book`,
      expect: [[6]],
    },
  ],
  "first-letter-capitalization": [
    {
      label: "capitalize-every-word: parity destroyed at indexes 1 and 3",
      sql: (c) =>
        c.replace(
          `CASE WHEN (idx + 1) % 2 = 0                          -- the NEXT word is even
             THEN upper(substr(substr(rest, 1, instr(rest || ' ', ' ') - 1), 1, 1))
                  || substr(substr(rest, 1, instr(rest || ' ', ' ') - 1), 2)
             ELSE substr(rest, 1, instr(rest || ' ', ' ') - 1)  -- odd: leave lowercase
        END`,
          `upper(substr(substr(rest, 1, instr(rest || ' ', ' ') - 1), 1, 1))
          || substr(substr(rest, 1, instr(rest || ' ', ' ') - 1), 2)`,
        ),
      expect: [
        [1, "Hello World Again Today"],
        [2, "Hello"],
        [3, "Once Upon A Time Today"],
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

// deliverable shape: exactly the 6 prescribed slugs, in the prescribed order
ok(SQL_PREMIUM5_FINALS.length === 6, `expected 6 dives, got ${SQL_PREMIUM5_FINALS.length}`);
ok(
  JSON.stringify(SQL_PREMIUM5_FINALS.map((d) => d.slug)) === JSON.stringify(REQUIRED_ORDER),
  `dive order mismatch: ${SQL_PREMIUM5_FINALS.map((d) => d.slug).join(", ")}`,
);

const perDive: Array<{ slug: string; pass: boolean; probes: number }> = [];

for (const dive of SQL_PREMIUM5_FINALS as LcSqlDive[]) {
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

  // no platform mention in any prose/SQL string of the dive
  const prose: string[] = [];
  walkStrings(dive, dive.slug, prose);
  ok(!prose.some((p) => /leetcode/i.test(p)), `${tag} platform mention inside dive strings`);

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
console.log(`\n${checks} assertions across ${SQL_PREMIUM5_FINALS.length} dives`);
if (fails.length) {
  console.error(`\n${fails.length} FAILURE(S):`);
  for (const f of fails) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("ALL CHECKS PASS 6/6");
