/**
 * Task 69-b2 self-check — sql-premium5-system.ts
 * Mirrors scripts/lc-sql-verify.ts semantics: builds each dive's schema in
 * bun:sqlite :memory:, runs the solution TWICE (determinism), and HARD-asserts
 * the exact columns + full row arrays (order-sensitive) against hand-derived
 * contracts, plus the batch's structural invariants AND engine-proven
 * wrong-query probes for every planted trap. Related slugs are verified
 * against LC_ALL (imported from the registry).
 *
 * Run: bun scripts/tmp-69b2-check.ts
 */
import { Database } from "bun:sqlite";
import { SQL_PREMIUM5_SYSTEM } from "../src/lib/leetcode/content/sql-premium5-system";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import type { CellValue } from "../src/lib/sql-types";
import type { LcSqlDive } from "../src/lib/leetcode/types";

// -- hand-derived contracts (slug -> columns, rows in graded order) ---------
const CONTRACTS: Record<string, { columns: string[]; rows: CellValue[][] }> = {
  "find-longest-calls": {
    columns: ["caller_id", "call_id", "duration_minutes"],
    rows: [
      [101, 3, 30],
      [102, 4, 18],
      [103, 8, 14],
      [104, 6, 0],
    ],
  },
  "server-utilization-time": {
    columns: ["server_id", "total_minutes", "utilization_pct"],
    rows: [
      [1, 300, 100.0],
      [2, 240, 59.26],
      [3, 100, 100.0],
    ],
  },
  "consecutive-available-seats-ii": {
    columns: ["seat_id", "best_run"],
    rows: [
      [1, 4],
      [2, 3],
      [5, 7],
    ],
  },
  "calculate-parking-fees-and-duration": {
    columns: ["stay_id", "plate", "minutes", "hours_billed", "fee"],
    rows: [
      [1, "KDA-204", 60, 1, 4],
      [2, "MRF-88", 61, 2, 8],
      [3, "TXR-11", 1439, 24, 96],
      [4, "PLM-5", 30, 1, 4],
    ],
  },
  "second-day-verification": {
    columns: ["user_id"],
    rows: [[71], [73], [75]],
  },
  "invalid-tweets-ii": {
    columns: ["invalid_count"],
    rows: [[5]],
  },
};

const XP_BY_SLUG: Record<string, number> = {
  "find-longest-calls": 20,
  "server-utilization-time": 20,
  "consecutive-available-seats-ii": 20,
  "calculate-parking-fees-and-duration": 20,
  "second-day-verification": 10,
  "invalid-tweets-ii": 10,
};

const REQUIRED_ORDER = Object.keys(CONTRACTS);

// -- engine-proven wrong-query probes (slug -> probes) -----------------------
// Each probe pins a trap claim made in the prose: build the dive's schema,
// run the WRONG query, and assert the exact wrong answer it produces.
type Probe = { label: string; sql: string; expect: CellValue[][] };
const PROBES: Record<string, Probe[]> = {
  "find-longest-calls": [
    {
      label: "recency tie-break ships call 7 for 102 and call 9 for 104",
      sql: `WITH ranked AS (SELECT caller_id, call_id, duration_minutes,
              ROW_NUMBER() OVER (PARTITION BY caller_id ORDER BY duration_minutes DESC, call_time DESC) AS rn
            FROM PhoneCall)
            SELECT caller_id, call_id, duration_minutes FROM ranked WHERE rn = 1 ORDER BY caller_id`,
      expect: [
        [101, 3, 30],
        [102, 7, 18],
        [103, 8, 14],
        [104, 9, 0],
      ],
    },
    {
      label: "call_id DESC tie-break loses BOTH ties (larger id wins wrongly)",
      sql: `WITH ranked AS (SELECT caller_id, call_id, duration_minutes,
              ROW_NUMBER() OVER (PARTITION BY caller_id ORDER BY duration_minutes DESC, call_id DESC) AS rn
            FROM PhoneCall)
            SELECT caller_id, call_id, duration_minutes FROM ranked WHERE rn = 1 ORDER BY caller_id`,
      expect: [
        [101, 3, 30],
        [102, 7, 18],
        [103, 8, 14],
        [104, 9, 0],
      ],
    },
    {
      label: "receiver rows leak: 103 steals call 3, receivers 201-203 invented",
      sql: `WITH both_sides AS (
              SELECT caller_id AS uid, call_id, duration_minutes FROM PhoneCall
              UNION ALL
              SELECT receiver_id, call_id, duration_minutes FROM PhoneCall),
            ranked AS (SELECT uid, call_id, duration_minutes,
              ROW_NUMBER() OVER (PARTITION BY uid ORDER BY duration_minutes DESC, call_id ASC) AS rn
            FROM both_sides)
            SELECT uid, call_id, duration_minutes FROM ranked WHERE rn = 1 ORDER BY uid`,
      expect: [
        [101, 3, 30],
        [102, 4, 18],
        [103, 3, 30],
        [104, 6, 0],
        [201, 8, 14],
        [202, 2, 25],
        [203, 4, 18],
      ],
    },
  ],
  "server-utilization-time": [
    {
      label: "no 100.0 promotion: server 2 floors to 59 instead of 59.26",
      sql: `WITH spans AS (
              SELECT server_id,
                     SUM((strftime('%s', end_time) - strftime('%s', start_time)) / 60) AS total_minutes,
                     (strftime('%s', MAX(end_time)) - strftime('%s', MIN(start_time))) / 60 AS observed_minutes
              FROM ServerSession GROUP BY server_id)
            SELECT server_id, total_minutes, ROUND(100 * total_minutes / observed_minutes, 2) AS pct
            FROM spans ORDER BY server_id`,
      expect: [
        [1, 300, 100],
        [2, 240, 59],
        [3, 100, 100],
      ],
    },
    {
      label: "raw TEXT subtraction coerces to year 2024 -> delta 0 -> pct NULL",
      sql: `WITH spans AS (
              SELECT server_id,
                     SUM((strftime('%s', end_time) - strftime('%s', start_time)) / 60) AS total_minutes,
                     MAX(end_time) - MIN(start_time) AS observed_minutes
              FROM ServerSession GROUP BY server_id)
            SELECT server_id, total_minutes, ROUND(100.0 * total_minutes / observed_minutes, 2) AS pct
            FROM spans ORDER BY server_id`,
      expect: [
        [1, 300, null],
        [2, 240, null],
        [3, 100, null],
      ],
    },
    {
      label: "sum-as-denominator ignores the gap: every server reads 100.0",
      sql: `WITH spans AS (
              SELECT server_id,
                     SUM((strftime('%s', end_time) - strftime('%s', start_time)) / 60) AS total_minutes
              FROM ServerSession GROUP BY server_id)
            SELECT server_id, total_minutes, ROUND(100.0 * total_minutes / total_minutes, 2) AS pct
            FROM spans ORDER BY server_id`,
      expect: [
        [1, 300, 100],
        [2, 240, 100],
        [3, 100, 100],
      ],
    },
  ],
  "consecutive-available-seats-ii": [
    {
      label: "numbering WITHOUT the free filter: every seat reads one island of 7",
      sql: `WITH tagged AS (
              SELECT seat_id, day,
                     day - ROW_NUMBER() OVER (PARTITION BY seat_id ORDER BY day) AS island_key
              FROM SeatDay),
            runs AS (
              SELECT seat_id, island_key, COUNT(*) AS run_len
              FROM tagged GROUP BY seat_id, island_key)
            SELECT seat_id, MAX(run_len) AS best_run
            FROM runs GROUP BY seat_id HAVING MAX(run_len) >= 3 ORDER BY seat_id`,
      expect: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
    },
    {
      label: "free-day COUNT >= 3 (no consecutiveness) admits all five seats",
      sql: `SELECT seat_id, COUNT(*) AS free_days FROM SeatDay WHERE is_free = 1
            GROUP BY seat_id HAVING COUNT(*) >= 3 ORDER BY seat_id`,
      expect: [[1, 4], [2, 5], [3, 4], [4, 4], [5, 7]],
    },
    {
      label: "HAVING > 3 drops the exactly-3 seat 2",
      sql: `WITH free_days AS (SELECT seat_id, day FROM SeatDay WHERE is_free = 1),
            islands AS (
              SELECT seat_id, day,
                     day - ROW_NUMBER() OVER (PARTITION BY seat_id ORDER BY day) AS island_key
              FROM free_days),
            runs AS (
              SELECT seat_id, island_key, COUNT(*) AS run_len
              FROM islands GROUP BY seat_id, island_key)
            SELECT seat_id, MAX(run_len) AS best_run
            FROM runs GROUP BY seat_id HAVING MAX(run_len) > 3 ORDER BY seat_id`,
      expect: [[1, 4], [5, 7]],
    },
    {
      label: "mid-step best_run per seat: the split seats cap at 2",
      sql: `WITH free_days AS (SELECT seat_id, day FROM SeatDay WHERE is_free = 1),
            islands AS (
              SELECT seat_id, day,
                     day - ROW_NUMBER() OVER (PARTITION BY seat_id ORDER BY day) AS island_key
              FROM free_days),
            runs AS (
              SELECT seat_id, island_key, COUNT(*) AS run_len
              FROM islands GROUP BY seat_id, island_key)
            SELECT seat_id, MAX(run_len) AS best_run
            FROM runs GROUP BY seat_id ORDER BY seat_id`,
      expect: [[1, 4], [2, 3], [3, 2], [4, 2], [5, 7]],
    },
  ],
  "calculate-parking-fees-and-duration": [
    {
      label: "INTEGER division inside CEIL: stay 2 bills 1h/4, stay 3 bills 23h/92, stay 4 bills 0",
      sql: `WITH timed AS (
              SELECT stay_id, plate,
                     (strftime('%s', exit_time) - strftime('%s', entry_time)) / 60 AS minutes
              FROM ParkingStay)
            SELECT stay_id, plate, minutes,
                   CAST(CEIL(minutes / 60) AS INTEGER) AS hours_billed,
                   CAST(CEIL(minutes / 60) AS INTEGER) * 4 AS fee
            FROM timed ORDER BY stay_id`,
      expect: [
        [1, "KDA-204", 60, 1, 4],
        [2, "MRF-88", 61, 1, 4],
        [3, "TXR-11", 1439, 23, 92],
        [4, "PLM-5", 30, 0, 0],
      ],
    },
    {
      label: "ROUND instead of CEIL undercharges the 61-minute stay 2",
      sql: `WITH timed AS (
              SELECT stay_id, plate,
                     (strftime('%s', exit_time) - strftime('%s', entry_time)) / 60 AS minutes
              FROM ParkingStay)
            SELECT stay_id, plate, minutes,
                   CAST(ROUND(minutes / 60.0) AS INTEGER) AS hours_billed,
                   CAST(ROUND(minutes / 60.0) AS INTEGER) * 4 AS fee
            FROM timed ORDER BY stay_id`,
      expect: [
        [1, "KDA-204", 60, 1, 4],
        [2, "MRF-88", 61, 1, 4],
        [3, "TXR-11", 1439, 24, 96],
        [4, "PLM-5", 30, 1, 4],
      ],
    },
    {
      label: "FLOOR + 1 overcharges the exact-hour stay 1",
      sql: `WITH timed AS (
              SELECT stay_id, plate,
                     (strftime('%s', exit_time) - strftime('%s', entry_time)) / 60 AS minutes
              FROM ParkingStay)
            SELECT stay_id, plate, minutes,
                   CAST(FLOOR(minutes / 60.0) AS INTEGER) + 1 AS hours_billed
            FROM timed ORDER BY stay_id`,
      expect: [
        [1, "KDA-204", 60, 2],
        [2, "MRF-88", 61, 2],
        [3, "TXR-11", 1439, 24],
        [4, "PLM-5", 30, 1],
      ],
    },
    {
      label: "julianday REAL days truncate: 59 / 60 / 1438 minutes",
      sql: `SELECT stay_id,
                     CAST((julianday(exit_time) - julianday(entry_time)) * 24 * 60 AS INTEGER) AS minutes
              FROM ParkingStay ORDER BY stay_id`,
      expect: [[1, 59], [2, 60], [3, 1438], [4, 30]],
    },
    {
      label: "raw TEXT subtraction coerces both sides to the year: all zeros",
      sql: `WITH timed AS (SELECT stay_id, plate, exit_time - entry_time AS minutes FROM ParkingStay)
            SELECT stay_id, plate, minutes,
                   CAST(CEIL(minutes / 60.0) AS INTEGER) AS hours_billed,
                   CAST(CEIL(minutes / 60.0) AS INTEGER) * 4 AS fee
            FROM timed ORDER BY stay_id`,
      expect: [
        [1, "KDA-204", 0, 0, 0],
        [2, "MRF-88", 0, 0, 0],
        [3, "TXR-11", 0, 0, 0],
        [4, "PLM-5", 0, 0, 0],
      ],
    },
  ],
  "second-day-verification": [
    {
      label: "no DISTINCT: user 75 ships twice (pair grain, not user grain)",
      sql: `SELECT a.user_id
            FROM LoginEvent a
            JOIN LoginEvent b
              ON b.user_id = a.user_id
             AND julianday(b.login_date) = julianday(a.login_date) + 1
            ORDER BY a.user_id`,
      expect: [[71], [73], [75], [75]],
    },
    {
      label: "raw numeric date + 1 matches NOTHING (every pair dies)",
      sql: `SELECT DISTINCT a.user_id
            FROM LoginEvent a
            JOIN LoginEvent b
              ON b.user_id = a.user_id
             AND b.login_date = a.login_date + 1
            ORDER BY a.user_id`,
      expect: [],
    },
    {
      label: "id-adjacency join admits the gapped user 72",
      sql: `SELECT DISTINCT a.user_id
            FROM LoginEvent a
            JOIN LoginEvent b
              ON b.user_id = a.user_id
             AND b.login_id = a.login_id + 1
            ORDER BY a.user_id`,
      expect: [[71], [72], [73], [75]],
    },
    {
      label: "DATE +1 day modifier is the correct alternative (month rolls)",
      sql: `SELECT DISTINCT a.user_id
            FROM LoginEvent a
            JOIN LoginEvent b
              ON b.user_id = a.user_id
             AND b.login_date = DATE(a.login_date, '+1 day')
            ORDER BY a.user_id`,
      expect: [[71], [73], [75]],
    },
  ],
  "invalid-tweets-ii": [
    {
      label: "missing trim arm: the empty string AND the 3-space tweet go uncounted (3)",
      sql: "SELECT COUNT(*) AS c FROM Tweet WHERE content IS NULL OR LENGTH(content) > 140",
      expect: [[3]],
    },
    {
      label: "content = NULL never fires: the NULL tweet drops (4)",
      sql: "SELECT COUNT(*) AS c FROM Tweet WHERE content = NULL OR TRIM(content) = '' OR LENGTH(content) > 140",
      expect: [[4]],
    },
    {
      label: ">= 140 brands the boundary tweet 4 (6)",
      sql: "SELECT COUNT(*) AS c FROM Tweet WHERE content IS NULL OR TRIM(content) = '' OR LENGTH(content) >= 140",
      expect: [[6]],
    },
    {
      label: "trim-before-length reads the same 5 (tweet 6 over the cap either way)",
      sql: "SELECT COUNT(*) AS c FROM Tweet WHERE content IS NULL OR TRIM(content) = '' OR LENGTH(TRIM(content)) > 140",
      expect: [[5]],
    },
  ],
};

// -- extra engine-fact probes (scratch statements, own db) -------------------
const FACT_PROBES: Probe[] = [
  {
    label: "[server-utilization] julianday REAL minutes for a 61-minute span CAST to 60",
    sql: `SELECT CAST((julianday('2024-06-03 10:31') - julianday('2024-06-03 09:30')) * 24 * 60 AS INTEGER) AS jd_minutes,
                 (strftime('%s', '2024-06-03 10:31') - strftime('%s', '2024-06-03 09:30')) / 60 AS s_minutes`,
    expect: [[60, 61]],
  },
  {
    label: "[second-day] DATE modifier rolls the month boundary",
    sql: "SELECT DATE('2024-05-31', '+1 day') AS next_day",
    expect: [["2024-06-01"]],
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
ok(SQL_PREMIUM5_SYSTEM.length === 6, `expected 6 dives, got ${SQL_PREMIUM5_SYSTEM.length}`);
ok(
  JSON.stringify(SQL_PREMIUM5_SYSTEM.map((d) => d.slug)) === JSON.stringify(REQUIRED_ORDER),
  `dive order mismatch: ${SQL_PREMIUM5_SYSTEM.map((d) => d.slug).join(", ")}`,
);

const perDive: Array<{ slug: string; pass: boolean }> = [];

function runRows(db: Database, sql: string): { columns: string[]; rows: CellValue[][] } {
  const st = db.prepare(sql.replace(/;+\s*$/, ""));
  const rows = st.all() as Record<string, unknown>[];
  const columns = st.columnNames;
  return { columns, rows: rows.map((r) => columns.map((c) => norm(r[c]))) };
}

for (const dive of SQL_PREMIUM5_SYSTEM as LcSqlDive[]) {
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

// -- engine-fact probes (scratch statements) ---------------------------------
{
  const db = new Database(":memory:");
  try {
    for (const probe of FACT_PROBES) {
      const out = runRows(db, probe.sql);
      ok(
        JSON.stringify(out.rows) === JSON.stringify(probe.expect),
        `fact probe FAILED (${probe.label}):\n  got      ${JSON.stringify(out.rows)}\n  expected ${JSON.stringify(probe.expect)}`,
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
console.log(`\n${checks} assertions across ${SQL_PREMIUM5_SYSTEM.length} dives`);
if (fails.length) {
  console.error(`\n${fails.length} FAILURE(S):`);
  for (const f of fails) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("ALL CHECKS PASS 6/6");
