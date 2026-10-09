// Task 73-a self-check — sql-df-growth-a.ts (3 Data & Finance growth dives).
// bun scripts/tmp-73-a-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_GROWTH_A } from "../src/lib/leetcode/content/sql-df-growth-a";
import { LC_XP } from "../src/lib/leetcode/types";
import type { LcSqlDive } from "../src/lib/leetcode/types";

let pass = 0, fail = 0;
const failures: string[] = [];
const ok = (label: string, cond: boolean, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; failures.push(label + (detail ? ` — ${detail}` : "")); console.log(`  FAIL  ${label}${detail ? " — " + detail : ""}`); }
};
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/* ---------- helpers (protocol copied from tmp-72-b4-check.ts) ---------- */
const stripComments = (sql: string) =>
  sql.split("\n").map((l) => { const i = l.indexOf("--"); return i >= 0 ? l.slice(0, i) : l; }).join("\n");

const stripOver = (sql: string) => {
  let s = "", i = 0;
  while (i < sql.length) {
    const m = /\bover\s*\(/i.exec(sql.slice(i));
    if (!m) { s += sql.slice(i); break; }
    const start = i + m.index;
    s += sql.slice(i, start);
    let depth = 0, j = start + m[0].length - 1;
    for (; j < sql.length; j++) {
      if (sql[j] === "(") depth++;
      else if (sql[j] === ")") { depth--; if (depth === 0) { j++; break; } }
    }
    i = j;
  }
  return s;
};

const sentenceCount = (p: string) => {
  const noDecimals = p.replace(/\d+\.\d+/g, "N");
  return noDecimals.split(/[.!?]+(?:\s|$)/).map((s) => s.trim()).filter(Boolean).length;
};

/** ddl/seed/code must end with ';' and NOTHING after it on the same line or beyond. */
const trailingSemicolonClean = (s: string) => {
  const t = s.trimEnd();
  if (!t.endsWith(";")) return false;
  const lastNl = t.lastIndexOf("\n");
  const lastLine = t.slice(lastNl + 1);
  return lastLine.trimEnd().endsWith(";") && lastLine.indexOf(";") === lastLine.trimEnd().length - 1;
};
/** no ';' may live inside a -- comment of ddl/seed/code. */
const noSemiInComments = (s: string) =>
  s.split("\n").every((l) => { const i = l.indexOf("--"); return i < 0 || !l.slice(i + 2).includes(";"); });

/** count CREATE TABLE statements in a ddl payload. */
const tableCount = (ddl: string) => (ddl.match(/create\s+table/gi) ?? []).length;

const allStrings = (d: LcSqlDive): string[] => {
  const out: string[] = [d.slug, d.statement, d.approach, d.code, d.time, d.space,
    ...d.examples.flatMap((e) => [e.input, e.output, e.explanation ?? ""]),
    ...d.constraints, ...d.breakdown, ...d.edges, ...d.walkthrough,
    ...d.followUps ?? [], ...d.related ?? [],
    ...d.ladder.flatMap((r) => [r.title, r.body]),
    d.schema.ddl, d.schema.seed, ...(d.schema.tables ?? []).flatMap((t) => [t.name, t.note])];
  return out;
};

const runSql = (db: Database, sql: string): unknown[][] => {
  const rows = db.query(sql).all() as Record<string, unknown>[];
  return rows.map((r) => Object.values(r)); // alias order = column order
};
const getCols = (db: Database, sql: string): string[] => {
  const rows = db.query(sql).all() as Record<string, unknown>[];
  if (!rows.length) throw new Error("solution returned zero rows — cannot read columns");
  return Object.keys(rows[0]);
};

const buildDb = (d: LcSqlDive): Database => {
  const db = new Database(":memory:");
  for (const st of splitStatements(d.schema.ddl)) db.run(st);
  for (const st of splitStatements(d.schema.seed)) db.run(st);
  return db;
};
const one = (db: Database, sql: string): unknown => (db.query(sql).get() as Record<string, unknown>);
const nOf = (db: Database, sql: string): number => (one(db, sql) as { n: number }).n;

/* ---------- spec ---------- */
type ColType = "text" | "int" | "real";
const SPEC: Array<{
  slug: string; id: number; difficulty: "Medium" | "Hard"; xp: number;
  columns: string[]; types: ColType[]; realColumns: string[]; rows: unknown[][];
  pin: RegExp; // the constraint that pins the dive's exact formula(s)
}> = [
  {
    slug: "week-over-week-churn", id: 8013, difficulty: "Medium", xp: 20,
    columns: ["week_start", "actives", "retained", "churned", "churn_rate"],
    types: ["text", "int", "int", "int", "real"], realColumns: ["churn_rate"],
    rows: [["2026-08-10", 11, 8, 2, 20.0], ["2026-08-17", 12, 9, 2, 18.2]],
    pin: /week_start = date\(event_date, '-' \|\| \(\(CAST\(strftime\('%w', event_date\) AS INTEGER\) \+ 6\) % 7\) \|\| ' days'\)/,
  },
  {
    slug: "median-time-to-convert", id: 8014, difficulty: "Hard", xp: 35,
    columns: ["cohort_month", "cohort_size", "converted", "unconverted", "median_days"],
    types: ["text", "int", "int", "int", "real"], realColumns: ["median_days"],
    rows: [["2026-07", 5, 4, 1, 2.5], ["2026-08", 4, 4, 0, 3.5], ["2026-09", 6, 5, 1, 12.0]],
    pin: /rn IN \(\(n\+1\)\/2, \(n\+2\)\/2\) under INTEGER division/,
  },
  {
    slug: "rolling-7d-actives", id: 8015, difficulty: "Medium", xp: 20,
    columns: ["day", "rolling_actives", "delta"],
    types: ["text", "int", "int"], realColumns: [],
    rows: [
      ["2026-09-08", 11, 2], ["2026-09-09", 12, 1], ["2026-09-10", 12, 0],
      ["2026-09-11", 12, 0], ["2026-09-12", 12, 0], ["2026-09-13", 12, 0],
      ["2026-09-14", 11, -1], ["2026-09-15", 9, -2], ["2026-09-16", 9, 0],
      ["2026-09-17", 12, 3],
    ],
    pin: /rolling_actives\(day\) = COUNT\(DISTINCT user_id\) with at least one event in \[date\(day, '-6 days'\), day\]/,
  },
];

// related slugs may ONLY come from the lead-verified pool for this batch.
const RELATED_POOL = new Set([
  "growth-accounting", "dau-wau-stickiness", "cohort-retention-matrix", "funnel-step-conversion",
  "restaurant-growth", "rolling-average-steps", "sessionize-events",
]);
const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));
const LC_BY_SLUG = new Map(LC_ALL.map((p) => [p.slug, p]));
const LC_BY_NUM = new Map(LC_ALL.map((p) => [p.num, p]));

console.log(`\n=== sql-df-growth-a.ts — ${SQL_DF_GROWTH_A.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order (8013-8015)",
  SQL_DF_GROWTH_A.length === 3 && SPEC.every((s, i) => SQL_DF_GROWTH_A[i]?.slug === s.slug),
  SQL_DF_GROWTH_A.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_GROWTH_A[i];
  const spec = SPEC[i];
  console.log(`\n--- dive ${i + 1}: ${d.slug} (id ${spec.id}, ${spec.difficulty}) ---`);

  // statement count + result-level ORDER BY
  ok("exactly ONE statement (countStatements)", countStatements(d.code) === 1);
  ok("exactly ONE statement (splitStatements)", splitStatements(d.code).length === 1);
  const stripped = stripOver(stripComments(d.code));
  ok("result-level ORDER BY after stripping comments/OVER spans", /order\s+by/i.test(stripped));
  ok('order === "exact"', d.order === "exact");
  ok(`xp === ${spec.xp}`, d.xp === spec.xp);
  // LcSqlDive carries no difficulty field — the brief's difficulty is pinned
  // via the registry tuple (above, once wired) and the LC_XP table here.
  ok(`xp matches LC_XP for the brief's difficulty (${spec.difficulty})`, d.xp === LC_XP[spec.difficulty]);
  ok("approach is ONE line", !d.approach.includes("\n"));
  ok("no writeVerify (read-only problem)", (d as unknown as Record<string, unknown>).writeVerify === undefined);

  // trailing-semicolon + comment hygiene
  ok("code ends with a single trailing ';'", trailingSemicolonClean(d.code));
  ok("ddl ends with ';' and nothing after", trailingSemicolonClean(d.schema.ddl));
  ok("seed ends with ';' and nothing after", trailingSemicolonClean(d.schema.seed));
  ok("no ';' inside comments of ddl/seed/code",
    noSemiInComments(d.schema.ddl) && noSemiInComments(d.schema.seed) && noSemiInComments(d.code));

  // ddl/seed statement counters agree (multi-statement payloads allowed)
  ok("ddl counters agree (countStatements === splitStatements.length)",
    countStatements(d.schema.ddl) === splitStatements(d.schema.ddl).length);
  ok("seed counters agree (countStatements === splitStatements.length)",
    countStatements(d.schema.seed) === splitStatements(d.schema.seed).length);

  // structure
  const sc = sentenceCount(d.statement);
  ok(`statement has 3-6 sentences (got ${sc})`, sc >= 3 && sc <= 6);
  ok("exactly 2 examples with input+output+explanation citing real numbers",
    d.examples.length === 2 &&
    d.examples.every((e) => e.input.trim() && e.output.trim() && /\d/.test(e.explanation ?? "")));
  ok('output strings are " · "-separated', d.examples.every((e) => e.output.includes(" · ")));
  ok("3-4 constraints", d.constraints.length >= 3 && d.constraints.length <= 4);
  ok("exactly 3 breakdown paragraphs", d.breakdown.length === 3);
  d.breakdown.forEach((p, j) => {
    const c = sentenceCount(p);
    ok(`breakdown para ${j + 1} has 3-6 sentences (got ${c})`, c >= 3 && c <= 6);
  });
  ok("3-5 edges", d.edges.length >= 3 && d.edges.length <= 5);
  d.edges.forEach((p, j) =>
    ok(`edge ${j + 1} has >= 1 full sentence (got ${sentenceCount(p)})`, sentenceCount(p) >= 1));
  ok("exactly 3 ladder rungs (title+body)", d.ladder.length === 3 && d.ladder.every((r) => r.title.trim() && r.body.trim()));
  d.ladder.forEach((r, j) =>
    ok(`ladder rung ${j + 1} body has >= 2 sentences (got ${sentenceCount(r.body)})`, sentenceCount(r.body) >= 2));
  ok("walkthrough: one paragraph per logical chunk (3)", d.walkthrough.length === 3);
  d.walkthrough.forEach((p, j) =>
    ok(`walkthrough para ${j + 1} has >= 3 sentences (got ${sentenceCount(p)})`, sentenceCount(p) >= 3));
  ok("2-3 followUps", (d.followUps?.length ?? 0) >= 2 && (d.followUps?.length ?? 0) <= 3);
  ok("exactly 3 related slugs, all from the verified pool", (d.related?.length ?? 0) === 3 && (d.related ?? []).every((r) => RELATED_POOL.has(r)));
  d.related?.forEach((r) => {
    ok(`related slug exists in the wired registry: ${r}`, LC_SLUGS.has(r));
  });
  ok(`schema.tables has one entry per DDL table (${tableCount(d.schema.ddl)})`,
    (d.schema.tables?.length ?? 0) === tableCount(d.schema.ddl));
  ok("a constraint pins the dive's exact formula(s)", spec.pin.test(d.constraints.join("\n")));
  ok("ORDER BY stated in a constraint", d.constraints.some((c) => /ORDER BY/.test(c)));

  // hygiene: backticks / ${ / platform mention in any dive string
  const strs = allStrings(d);
  ok("no backticks in any string", strs.every((s) => !s.includes("`")));
  ok("no ${ in any string", strs.every((s) => !s.includes("${")));
  ok("no platform mention in any string (leetcode/hackerrank/datalemur/stratascratch)",
    strs.every((s) => !/leetcode|hackerrank|datalemur|stratascratch/i.test(s)));

  // registry tuple: strict in both wiring states.
  // Batch 1 ends at id 8012 — the lead wires 8013-8015 AFTER this file lands.
  // Pre-wiring the dive must be absent AND no other row may claim its slug or id;
  // post-wiring the full tuple must match. The script stays green and honest in both.
  const reg = LC_BY_SLUG.get(d.slug);
  if (reg) {
    ok(`registry tuple: num === ${spec.id}`, reg.num === spec.id, String(reg.num));
    ok(`registry tuple: difficulty === ${spec.difficulty}`, reg.difficulty === spec.difficulty, reg.difficulty);
    // LcRef carries no xp field — the dive's xp is pinned against LC_XP above.
  } else {
    ok("pre-wiring: no row claims this slug (lead wires batch 2 after delivery)", !LC_BY_SLUG.has(d.slug));
    ok(`pre-wiring: no row claims id ${spec.id} (collision-free)`, !LC_BY_NUM.has(spec.id));
  }

  // engine: build from ddl+seed, run solution TWICE, hard-assert columns + every cell
  try {
    const db = buildDb(d);
    const r1 = runSql(db, d.code);
    const c1 = getCols(db, d.code);
    const r2 = runSql(db, d.code);
    db.close();
    ok("determinism: two runs identical", eq(r1, r2));
    ok(`columns === [${spec.columns.join(", ")}]`, eq(c1, spec.columns), JSON.stringify(c1));
    ok(`row count === ${spec.rows.length}`, r1.length === spec.rows.length, String(r1.length));
    r1.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        ok(`cell(${ri + 1},${ci + 1}) ${spec.columns[ci]} === ${JSON.stringify(spec.rows[ri][ci])}`,
          eq(cell, spec.rows[ri][ci]), JSON.stringify(cell));
      });
    });
    // per-column type contract (text/int/real)
    r1.forEach((row, ri) => {
      spec.types.forEach((t, ci) => {
        const cell = row[ci];
        const good = t === "text" ? typeof cell === "string"
          : t === "int" ? typeof cell === "number" && Number.isInteger(cell)
          : typeof cell === "number";
        ok(`type(${ri + 1},${spec.columns[ci]}) is ${t}`, good, JSON.stringify(cell));
      });
    });
    // REAL cells: tolerance assert on top of exact equality
    spec.realColumns.forEach((colName) => {
      const ci = spec.columns.indexOf(colName);
      r1.forEach((row, ri) => {
        const cell = row[ci] as number;
        ok(`real cell(${ri + 1},${colName}) within 1e-9 of ${JSON.stringify(spec.rows[ri][ci])}`,
          Math.abs(cell - (spec.rows[ri][ci] as number)) < 1e-9, String(cell));
      });
    });
    // every declared REAL output column must be produced by an explicit ROUND in the code
    ok("REAL output columns are produced by explicit ROUND(...) in the code",
      spec.realColumns.length === 0 ? true : /round\s*\(/i.test(stripped));
    ok("rows === spec (order-sensitive, whole-array)", eq(r1, spec.rows), JSON.stringify(r1));
  } catch (e) {
    ok("engine build+run", false, String(e));
  }
}

/* ================= hand-verification sections ================= */

/* ---------- D1: Monday-shift arithmetic + week grain, hand-verified ---------- */
console.log("\n=== D1 week-over-week-churn — Monday-shift + grain hand-checks ===");
{
  const d = SQL_DF_GROWTH_A[0];
  const db = buildDb(d);
  const shift = (col: string) =>
    `date(${col}, '-' || ((CAST(strftime('%w', ${col}) AS INTEGER) + 6) % 7) || ' days')`;
  // the three Mondays really are Mondays (%w = 1)
  const mon = runSql(db, `SELECT '2026-08-03' AS d, strftime('%w', '2026-08-03') AS w
    UNION ALL SELECT '2026-08-10', strftime('%w', '2026-08-10')
    UNION ALL SELECT '2026-08-17', strftime('%w', '2026-08-17')`);
  ok("2026-08-03/10/17 are Mondays (strftime %w = 1 on all three)",
    mon.length === 3 && mon.every((r) => r[1] === "1"), JSON.stringify(mon));
  // the pinned expression maps every distinct event_date onto the right Monday
  const map = runSql(db, `SELECT event_date, ${shift("event_date")} AS week_start
    FROM events GROUP BY event_date ORDER BY event_date`);
  ok("every distinct event_date maps onto its Monday (18 distinct dates)",
    map.length === 18 &&
    eq(map.filter((r) => r[0] === "2026-08-09")[0][1], "2026-08-03") &&
    eq(map.filter((r) => r[0] === "2026-08-11")[0][1], "2026-08-10") &&
    eq(map.filter((r) => r[0] === "2026-08-16")[0][1], "2026-08-10") &&
    eq(map.filter((r) => r[0] === "2026-08-18")[0][1], "2026-08-17") &&
    eq(map.filter((r) => r[0] === "2026-08-23")[0][1], "2026-08-17"));
  // no event date is itself a Monday (the seed keeps all dates Tue-Sun)
  ok("no event date is a Monday (Tue-Sun only)", nOf(db, `SELECT COUNT(*) AS n FROM events WHERE strftime('%w', event_date) = '1'`) === 0);
  // the weeks CTE grain: 33 (user, week) pairs — 10/11/12 per week
  const grain = runSql(db, `WITH weeks AS (SELECT DISTINCT user_id, ${shift("event_date")} AS week_start FROM events)
    SELECT week_start, COUNT(*) AS pairs FROM weeks GROUP BY week_start ORDER BY week_start`);
  ok("(user, week) pairs read 10 / 11 / 12 across the three weeks",
    eq(grain, [["2026-08-03", 10], ["2026-08-10", 11], ["2026-08-17", 12]]), JSON.stringify(grain));
  // the audit identity: prior actives = retained + churned on BOTH output rows
  ok("identity prior_actives = retained + churned: 10 = 8+2 and 11 = 9+2",
    nOf(db, `SELECT COUNT(*) AS n FROM (
      SELECT 10 AS prior_actives, 8 AS retained, 2 AS churned UNION ALL
      SELECT 11, 9, 2) WHERE prior_actives = retained + churned`) === 2);
  db.close();
}

/* ---------- D2: per-user days + median parity, hand-verified ---------- */
console.log("\n=== D2 median-time-to-convert — per-user clocks + parity hand-checks ===");
{
  const d = SQL_DF_GROWTH_A[1];
  const db = buildDb(d);
  // every converted user's day count, hand-computed from the seed dates
  const days = runSql(db, `SELECT u.user_id, CAST(julianday(MIN(o.order_date)) - julianday(u.signup_date) AS INTEGER) AS days
    FROM users u JOIN orders o ON o.user_id = u.user_id GROUP BY u.user_id ORDER BY u.user_id`);
  ok("per-user days: 1→0, 2→2, 3→3, 4→10, 6→2, 7→2, 8→5, 9→11, 10→3, 11→7, 12→12, 13→14, 14→30",
    eq(days, [[1, 0], [2, 2], [3, 3], [4, 10], [6, 2], [7, 2], [8, 5], [9, 11], [10, 3], [11, 7], [12, 12], [13, 14], [14, 30]]),
    JSON.stringify(days));
  // users 5 and 15 never order
  ok("users 5 and 15 hold ZERO orders (the unconverted pair)",
    nOf(db, `SELECT COUNT(*) AS n FROM users u WHERE u.user_id IN (5, 15)
      AND EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.user_id)`) === 0);
  // the multi-order trap users really do hold two orders each
  ok("users 2 and 4 hold TWO orders each (later orders exist to trap MAX)",
    eq(runSql(db, `SELECT user_id, COUNT(*) AS c FROM orders WHERE user_id IN (2, 4) GROUP BY user_id ORDER BY user_id`),
      [[2, 2], [4, 2]]));
  // parity walk for cohort 2026-07: n = 4, mirror ranks 2+3, days 2 and 3 → 2.5
  const ranks7 = runSql(db, `WITH first_orders AS (
      SELECT u.user_id, u.signup_date, strftime('%Y-%m', u.signup_date) AS cm, MIN(o.order_date) AS fod
      FROM users u JOIN orders o ON o.user_id = u.user_id GROUP BY u.user_id, u.signup_date),
    timed AS (SELECT cm, user_id, CAST(julianday(fod) - julianday(signup_date) AS INTEGER) AS days FROM first_orders),
    ranked AS (SELECT cm, days, ROW_NUMBER() OVER (PARTITION BY cm ORDER BY days, user_id) AS rn,
      COUNT(*) OVER (PARTITION BY cm) AS n FROM timed)
    SELECT days, rn, n FROM ranked WHERE cm = '2026-07' ORDER BY rn`);
  ok("cohort 2026-07 ranks: days 0/2/3/10 at rn 1-4, n = 4 → mirror keeps rn 2,3 → days 2 and 3",
    eq(ranks7, [[0, 1, 4], [2, 2, 4], [3, 3, 4], [10, 4, 4]]) &&
    eq(ranks7.filter((r) => (r[1] as number) === Math.floor((4 + 1) / 2) || (r[1] as number) === Math.floor((4 + 2) / 2)).map((r) => r[0]), [2, 3]),
    JSON.stringify(ranks7));
  db.close();
}

/* ---------- D3: spine + daily grain, hand-verified ---------- */
console.log("\n=== D3 rolling-7d-actives — spine + daily grain hand-checks ===");
{
  const d = SQL_DF_GROWTH_A[2];
  const db = buildDb(d);
  ok("exactly 69 event rows, 12 distinct users",
    nOf(db, "SELECT COUNT(*) AS n FROM events") === 69 &&
    nOf(db, "SELECT COUNT(DISTINCT user_id) AS n FROM events") === 12);
  // no user active outside the 17-day span
  ok("zero events outside 2026-09-01..2026-09-17",
    nOf(db, `SELECT COUNT(*) AS n FROM events WHERE event_date < '2026-09-01' OR event_date > '2026-09-17'`) === 0);
  // users 1 and 2 never miss a day
  ok("users 1 and 2 are active on all 17 days",
    eq(runSql(db, `SELECT user_id, COUNT(DISTINCT event_date) AS days FROM events WHERE user_id IN (1, 2) GROUP BY user_id ORDER BY user_id`),
      [[1, 17], [2, 17]]));
  // the spine is gap-free: 17 distinct days, first to last
  ok("spine is gap-free: 17 distinct days from 2026-09-01 to 2026-09-17",
    nOf(db, "SELECT COUNT(DISTINCT event_date) AS n FROM events") === 17 &&
    eq((one(db, "SELECT MIN(event_date) AS n FROM events") as { n: string }).n, "2026-09-01") &&
    eq((one(db, "SELECT MAX(event_date) AS n FROM events") as { n: string }).n, "2026-09-17"));
  // daily distinct counts, hand-pinned
  const daily = runSql(db, `SELECT event_date, COUNT(DISTINCT user_id) AS actives FROM events GROUP BY event_date ORDER BY event_date`);
  ok("daily distinct actives: 2,3,2,3,5,4,5,6,5,3,3,2,3,3,4,4,8",
    eq(daily.map((r) => r[1]), [2, 3, 2, 3, 5, 4, 5, 6, 5, 3, 3, 2, 3, 3, 4, 4, 8]), JSON.stringify(daily));
  // exactly four double-log days, and they are the pinned ones
  const dupDays = runSql(db, `SELECT event_date, COUNT(*) - COUNT(DISTINCT user_id) AS dupes
    FROM events GROUP BY event_date HAVING dupes > 0 ORDER BY event_date`);
  ok("exactly four double-log days: Sep 8 (user 1), Sep 10 (user 2), Sep 14 (user 6), Sep 17 (user 5)",
    eq(dupDays, [["2026-09-08", 1], ["2026-09-10", 1], ["2026-09-14", 1], ["2026-09-17", 1]]), JSON.stringify(dupDays));
  // the boundary arithmetic: MAX - 10 days = 2026-09-07, so reported days start Sep 8
  ok("boundary: date(MAX(day), '-10 days') = 2026-09-07, so the report starts 2026-09-08",
    eq((one(db, `SELECT date(MAX(event_date), '-10 days') AS n FROM events`) as { n: string }).n, "2026-09-07"));
  db.close();
}

/* ================= planted-trap probes ================= */
console.log("\n=== planted-trap probes ===");
const probe = (label: string, cond: boolean, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; failures.push(label + (detail ? ` — ${detail}` : "")); console.log(`  FAIL  ${label}${detail ? " — " + detail : ""}`); }
};

// D1 traps
{
  const db = buildDb(SQL_DF_GROWTH_A[0]);
  const head = `WITH weeks AS (SELECT DISTINCT user_id,
      date(event_date, '-' || ((CAST(strftime('%w', event_date) AS INTEGER) + 6) % 7) || ' days') AS week_start FROM events),
    pivoted AS (SELECT user_id, week_start,
      CASE WHEN LAG(week_start) OVER (PARTITION BY user_id ORDER BY week_start) = date(week_start, '-7 days') THEN 1 ELSE 0 END AS active_prev,
      LEAD(week_start) OVER (PARTITION BY user_id ORDER BY week_start) AS next_week FROM weeks),
    weekly AS (SELECT week_start, COUNT(*) AS actives, SUM(active_prev) AS retained FROM pivoted GROUP BY week_start),
    departed AS (SELECT date(week_start, '+7 days') AS week_start FROM pivoted
      WHERE next_week IS NULL OR next_week > date(week_start, '+7 days')),
    churned AS (SELECT week_start, COUNT(*) AS churned FROM departed GROUP BY week_start),
    rated AS (SELECT w.week_start, w.actives, w.retained, COALESCE(c.churned, 0) AS churned,
      LAG(w.actives) OVER (ORDER BY w.week_start) AS prior_actives
      FROM weekly w LEFT JOIN churned c ON c.week_start = w.week_start)`;
  probe("D1 (a) this-week actives as the churn denominator reads 16.7 for week 2 (2/12), not 18.2",
    eq(runSql(db, `${head} SELECT week_start, actives, retained, churned,
        ROUND(100.0 * churned / actives, 1) AS churn_rate FROM rated
        WHERE week_start > (SELECT MIN(week_start) FROM weeks) ORDER BY week_start`),
      [["2026-08-10", 11, 8, 2, 18.2], ["2026-08-17", 12, 9, 2, 16.7]]));
  probe("D1 (b) any-prior-activity-as-retained counts the resurrected user 9: week 2 retained reads 10, not 9",
    eq(runSql(db, `WITH weeks AS (SELECT DISTINCT user_id,
        date(event_date, '-' || ((CAST(strftime('%w', event_date) AS INTEGER) + 6) % 7) || ' days') AS week_start FROM events),
      pivoted AS (SELECT user_id, week_start,
        CASE WHEN LAG(week_start) OVER (PARTITION BY user_id ORDER BY week_start) IS NOT NULL THEN 1 ELSE 0 END AS active_prev,
        LEAD(week_start) OVER (PARTITION BY user_id ORDER BY week_start) AS next_week FROM weeks),
      weekly AS (SELECT week_start, COUNT(*) AS actives, SUM(active_prev) AS retained FROM pivoted GROUP BY week_start),
      departed AS (SELECT date(week_start, '+7 days') AS week_start FROM pivoted
        WHERE next_week IS NULL OR next_week > date(week_start, '+7 days')),
      churned AS (SELECT week_start, COUNT(*) AS churned FROM departed GROUP BY week_start),
      rated AS (SELECT w.week_start, w.actives, w.retained, COALESCE(c.churned, 0) AS churned,
        LAG(w.actives) OVER (ORDER BY w.week_start) AS prior_actives
        FROM weekly w LEFT JOIN churned c ON c.week_start = w.week_start)
      SELECT week_start, actives, retained, churned, ROUND(100.0 * churned / prior_actives, 1) AS churn_rate
      FROM rated WHERE week_start > (SELECT MIN(week_start) FROM weeks) ORDER BY week_start`),
      [["2026-08-10", 11, 8, 2, 20.0], ["2026-08-17", 12, 10, 2, 18.2]]));
  probe("D1 (c) naive COUNT(*) of event rows reads 13/12/14 weekly rows where the truth is 10/11/12 users",
    eq(runSql(db, `SELECT date(event_date, '-' || ((CAST(strftime('%w', event_date) AS INTEGER) + 6) % 7) || ' days') AS week_start,
        COUNT(*) AS actives FROM events GROUP BY week_start ORDER BY week_start`),
      [["2026-08-03", 13], ["2026-08-10", 12], ["2026-08-17", 14]]));
  db.close();
}

// D2 traps
{
  const db = buildDb(SQL_DF_GROWTH_A[1]);
  const head = (joinKind: string, dayExpr: string, agg: string, rankOrder: string) => `WITH first_orders AS (
      SELECT u.user_id, u.signup_date, strftime('%Y-%m', u.signup_date) AS cohort_month, ${agg}(o.order_date) AS first_order_date
      FROM users u ${joinKind} orders o ON o.user_id = u.user_id GROUP BY u.user_id, u.signup_date),
    timed AS (SELECT cohort_month, user_id, ${dayExpr} AS days FROM first_orders),
    ranked AS (SELECT cohort_month, days,
      ROW_NUMBER() OVER (PARTITION BY cohort_month ORDER BY ${rankOrder}) AS rn,
      COUNT(*) OVER (PARTITION BY cohort_month) AS n FROM timed)`;
  probe("D2 (a) unconverted users as days-0 sentinels: 2026-07 reads 2.0 and 2026-09 reads 9.5 (2026-08 untouched)",
    eq(runSql(db, `${head("LEFT JOIN", "CAST(COALESCE(julianday(first_order_date) - julianday(signup_date), 0) AS INTEGER)", "MIN", "days, user_id")},
      middle AS (SELECT cohort_month, days FROM ranked WHERE rn IN ((n + 1) / 2, (n + 2) / 2)),
      medians AS (SELECT cohort_month, AVG(days) AS median_days FROM middle GROUP BY cohort_month)
      SELECT cohort_month, ROUND(median_days, 1) AS median_days FROM medians ORDER BY cohort_month`),
      [["2026-07", 2.0], ["2026-08", 3.5], ["2026-09", 9.5]]));
  probe("D2 (b) unconditional rn IN (n/2, n/2+1) breaks odd n: 2026-09 averages ranks 2+3 → 9.5, not 12.0",
    eq(runSql(db, `${head("JOIN", "CAST(julianday(first_order_date) - julianday(signup_date) AS INTEGER)", "MIN", "days, user_id")},
      middle AS (SELECT cohort_month, days FROM ranked WHERE rn IN (n / 2, n / 2 + 1)),
      medians AS (SELECT cohort_month, AVG(days) AS median_days FROM middle GROUP BY cohort_month)
      SELECT cohort_month, ROUND(median_days, 1) AS median_days FROM medians ORDER BY cohort_month`),
      [["2026-07", 2.5], ["2026-08", 3.5], ["2026-09", 9.5]]));
  probe("D2 (c) tie-order safety: ORDER BY days WITHOUT user_id still reports 2.5 / 3.5 / 12.0 (median is order-insensitive among ties)",
    eq(runSql(db, `${head("JOIN", "CAST(julianday(first_order_date) - julianday(signup_date) AS INTEGER)", "MIN", "days")},
      middle AS (SELECT cohort_month, days FROM ranked WHERE rn IN ((n + 1) / 2, (n + 2) / 2)),
      medians AS (SELECT cohort_month, AVG(days) AS median_days FROM middle GROUP BY cohort_month)
      SELECT cohort_month, ROUND(median_days, 1) AS median_days FROM medians ORDER BY cohort_month`),
      [["2026-07", 2.5], ["2026-08", 3.5], ["2026-09", 12.0]]));
  probe("D2 (d) MAX instead of MIN shifts the multi-order clocks: 2026-07 reads 11.0, not 2.5",
    eq(runSql(db, `WITH first_orders AS (
        SELECT u.user_id, u.signup_date, strftime('%Y-%m', u.signup_date) AS cohort_month, MAX(o.order_date) AS first_order_date
        FROM users u JOIN orders o ON o.user_id = u.user_id GROUP BY u.user_id, u.signup_date),
      timed AS (SELECT cohort_month, user_id, CAST(julianday(first_order_date) - julianday(signup_date) AS INTEGER) AS days FROM first_orders),
      ranked AS (SELECT cohort_month, days,
        ROW_NUMBER() OVER (PARTITION BY cohort_month ORDER BY days, user_id) AS rn,
        COUNT(*) OVER (PARTITION BY cohort_month) AS n FROM timed),
      middle AS (SELECT cohort_month, days FROM ranked WHERE rn IN ((n + 1) / 2, (n + 2) / 2)),
      medians AS (SELECT cohort_month, AVG(days) AS median_days FROM middle GROUP BY cohort_month),
      sizes AS (SELECT strftime('%Y-%m', signup_date) AS cohort_month, COUNT(*) AS cohort_size FROM users GROUP BY 1),
      conv AS (SELECT cohort_month, COUNT(*) AS converted FROM first_orders GROUP BY cohort_month)
      SELECT cs.cohort_month, cs.cohort_size, cc.converted, cs.cohort_size - cc.converted AS unconverted,
        ROUND(m.median_days, 1) AS median_days
      FROM sizes cs JOIN conv cc ON cc.cohort_month = cs.cohort_month JOIN medians m ON m.cohort_month = cs.cohort_month
      ORDER BY cs.cohort_month`),
      [["2026-07", 5, 4, 1, 11.0], ["2026-08", 4, 4, 0, 3.5], ["2026-09", 6, 5, 1, 12.0]]));
  probe("D2 (e) dropping the CAST (raw REAL diffs) happens to agree on this whole-day seed: 2.5 / 3.5 / 12.0",
    eq(runSql(db, `${head("JOIN", "julianday(first_order_date) - julianday(signup_date)", "MIN", "days, user_id")},
      middle AS (SELECT cohort_month, days FROM ranked WHERE rn IN ((n + 1) / 2, (n + 2) / 2)),
      medians AS (SELECT cohort_month, AVG(days) AS median_days FROM middle GROUP BY cohort_month)
      SELECT cohort_month, ROUND(median_days, 1) AS median_days FROM medians ORDER BY cohort_month`),
      [["2026-07", 2.5], ["2026-08", 3.5], ["2026-09", 12.0]]));
  db.close();
}

// D3 traps
{
  const db = buildDb(SQL_DF_GROWTH_A[2]);
  probe("D3 (a) SUM of daily distincts over a 7-row frame reads 28 on 2026-09-17 (truth: 12) — distinct does not survive the frame",
    eq(runSql(db, `WITH days AS (SELECT DISTINCT event_date AS day FROM events),
      daily AS (SELECT event_date AS day, COUNT(DISTINCT user_id) AS actives FROM events GROUP BY event_date),
      framed AS (SELECT day, SUM(actives) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS rolling_actives FROM daily),
      deltas AS (SELECT day, rolling_actives,
        rolling_actives - LAG(rolling_actives) OVER (ORDER BY day) AS delta FROM framed)
      SELECT day, rolling_actives, delta FROM deltas
      WHERE day > date((SELECT MAX(day) FROM days), '-10 days') ORDER BY day`),
      [["2026-09-08", 28, 4], ["2026-09-09", 30, 2], ["2026-09-10", 31, 1], ["2026-09-11", 31, 0],
       ["2026-09-12", 28, -3], ["2026-09-13", 27, -1], ["2026-09-14", 25, -2], ["2026-09-15", 23, -2],
       ["2026-09-16", 22, -1], ["2026-09-17", 27, 5]]));
  probe("D3 (b) window off-by-one ('-7 days' = 8-day window): Sep 14 reads 12 not 11, Sep 15 reads 11 not 9",
    eq(runSql(db, `WITH days AS (SELECT DISTINCT event_date AS day FROM events),
      windowed AS (SELECT d.day, COUNT(DISTINCT e2.user_id) AS rolling_actives
        FROM days d JOIN events e2 ON e2.event_date BETWEEN date(d.day, '-7 days') AND d.day GROUP BY d.day),
      deltas AS (SELECT day, rolling_actives,
        rolling_actives - LAG(rolling_actives) OVER (ORDER BY day) AS delta FROM windowed)
      SELECT day, rolling_actives, delta FROM deltas
      WHERE day > date((SELECT MAX(day) FROM days), '-10 days') ORDER BY day`),
      [["2026-09-08", 11, 2], ["2026-09-09", 12, 1], ["2026-09-10", 12, 0], ["2026-09-11", 12, 0],
       ["2026-09-12", 12, 0], ["2026-09-13", 12, 0], ["2026-09-14", 12, 0], ["2026-09-15", 11, -1],
       ["2026-09-16", 9, -2], ["2026-09-17", 12, 3]]));
  probe("D3 (c) COUNT(user_id) without DISTINCT counts event rows: Sep 8 reads 29 (7 rows that day alone), not 11 users",
    eq(runSql(db, `WITH days AS (SELECT DISTINCT event_date AS day FROM events),
      windowed AS (SELECT d.day, COUNT(e2.user_id) AS rolling_actives
        FROM days d JOIN events e2 ON e2.event_date BETWEEN date(d.day, '-6 days') AND d.day GROUP BY d.day),
      deltas AS (SELECT day, rolling_actives,
        rolling_actives - LAG(rolling_actives) OVER (ORDER BY day) AS delta FROM windowed)
      SELECT day, rolling_actives, delta FROM deltas
      WHERE day > date((SELECT MAX(day) FROM days), '-10 days') ORDER BY day`),
      [["2026-09-08", 29, 5], ["2026-09-09", 31, 2], ["2026-09-10", 33, 2], ["2026-09-11", 33, 0],
       ["2026-09-12", 30, -3], ["2026-09-13", 29, -1], ["2026-09-14", 28, -1], ["2026-09-15", 25, -3],
       ["2026-09-16", 24, -1], ["2026-09-17", 29, 5]]));
  db.close();
}

/* ---------- house header present on the content file ---------- */
console.log("\n=== file header ===");
{
  const src = await Bun.file(new URL("../src/lib/leetcode/content/sql-df-growth-a.ts", import.meta.url)).text();
  ok("house header comment opens the content file",
    src.startsWith("// Deep-dives — Data & Finance growth file A: week-over-week churn, median"));
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log(`ALL CHECKS PASS ${SQL_DF_GROWTH_A.length}/3`);
