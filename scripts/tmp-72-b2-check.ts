// Task 72-b2 self-check — sql-df-cohorts.ts (3 dives: 8004-8006, Product Analytics).
// bun scripts/tmp-72-b2-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_COHORTS } from "../src/lib/leetcode/content/sql-df-cohorts";
import type { LcSqlDive } from "../src/lib/leetcode/types";

let pass = 0, fail = 0;
const failures: string[] = [];
const ok = (label: string, cond: boolean, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; failures.push(label + (detail ? ` — ${detail}` : "")); console.log(`  FAIL  ${label}${detail ? " — " + detail : ""}`); }
};
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/* ---------- helpers ---------- */
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

/** ddl/seed must end with ';' and NOTHING after it on the same line or beyond. */
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
const build = (d: LcSqlDive): Database => {
  const db = new Database(":memory:");
  for (const st of splitStatements(d.schema.ddl)) db.run(st);
  for (const st of splitStatements(d.schema.seed)) db.run(st);
  return db;
};

/* ---------- the lead's verified related-slug pool ---------- */
const POOL = new Set([
  "restaurant-growth", "human-traffic-of-stadium", "find-consistently-improving-employees",
  "analyze-subscription-conversion", "rolling-average-steps",
  "customers-with-maximum-number-of-transactions-on-consecutive-days", "year-on-year-growth-rate",
  "seasonal-sales-analysis", "find-students-who-improved", "customer-purchasing-behavior-analysis",
  "find-covid-recovery-patients", "analyze-organization-hierarchy",
]);

/* ---------- spec: exact columns + rows per problem ---------- */
const SPEC: Array<{ slug: string; id: number; xp: number; columns: string[]; rows: unknown[][] }> = [
  { slug: "cohort-retention-matrix", id: 8004, xp: 20,
    columns: ["signup_month", "cohort", "m0_pct", "m1_pct", "m2_pct"],
    rows: [["2026-06", 4, 75, 50, 50], ["2026-07", 2, 100, 100, 100], ["2026-08", 4, 100, 0, 0]] },
  { slug: "sessionize-events", id: 8005, xp: 35,
    columns: ["user_id", "sessions", "avg_min"],
    rows: [[201, 3, 19.3], [202, 1, 0], [203, 2, 29.5], [204, 2, 40], [205, 4, 25], [206, 2, 26.5]] },
  { slug: "ab-test-conversion-lift", id: 8006, xp: 20,
    columns: ["variant", "users", "conversions", "conv_pct", "lift_pp"],
    rows: [["control", 20, 11, 55, 20], ["treatment", 20, 15, 75, 20]] },
];

const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));
console.log(`\n=== sql-df-cohorts.ts — ${SQL_DF_COHORTS.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_COHORTS.length === 3 && SPEC.every((s, i) => SQL_DF_COHORTS[i]?.slug === s.slug),
  SQL_DF_COHORTS.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_COHORTS[i];
  const spec = SPEC[i];
  console.log(`\n--- dive ${i + 1}: ${d.slug} (id ${spec.id}) ---`);

  // single statement, read-only, result-level ORDER BY
  ok("exactly ONE statement (countStatements)", countStatements(d.code) === 1);
  ok("exactly ONE statement (splitStatements)", splitStatements(d.code).length === 1);
  const stripped = stripOver(stripComments(d.code));
  ok("code is a read-only WITH/SELECT statement", /^\s*(with|select)\b/i.test(stripped.trim()));
  ok("result-level ORDER BY after stripping comments/OVER spans", /order\s+by/i.test(stripped));
  ok('order === "exact"', d.order === "exact");
  ok(`xp === ${spec.xp}`, d.xp === spec.xp);
  ok("no writeVerify", (d as unknown as Record<string, unknown>).writeVerify === undefined);
  ok("approach is ONE line", !d.approach.includes("\n"));

  // trailing-semicolon + comment hygiene
  ok("ddl ends with ';' and nothing after", trailingSemicolonClean(d.schema.ddl));
  ok("seed ends with ';' and nothing after", trailingSemicolonClean(d.schema.seed));
  ok("no ';' inside comments of ddl/seed/code",
    noSemiInComments(d.schema.ddl) && noSemiInComments(d.schema.seed) && noSemiInComments(d.code));

  // teaching shape
  ok(`statement is 3-6 sentences (got ${sentenceCount(d.statement)})`,
    sentenceCount(d.statement) >= 3 && sentenceCount(d.statement) <= 6);
  ok("2 examples with input+output+explanation",
    d.examples.length === 2 && d.examples.every((e) => e.input.trim() && e.output.trim() && (e.explanation ?? "").trim()));
  ok("2-4 constraints", d.constraints.length >= 2 && d.constraints.length <= 4);
  ok("3 breakdown paragraphs", d.breakdown.length === 3);
  d.breakdown.forEach((p, j) =>
    ok(`breakdown para ${j + 1} has 3-5 sentences (got ${sentenceCount(p)})`,
      sentenceCount(p) >= 3 && sentenceCount(p) <= 5));
  ok("3-5 edges", d.edges.length >= 3 && d.edges.length <= 5);
  d.edges.forEach((e, j) =>
    ok(`edge ${j + 1} is a full sentence (got ${sentenceCount(e)})`, sentenceCount(e) >= 1));
  ok("3 ladder rungs (title+body)", d.ladder.length === 3 && d.ladder.every((r) => r.title.trim() && r.body.trim()));
  d.ladder.forEach((r, j) =>
    ok(`ladder rung ${j + 1} body has >= 2 sentences (got ${sentenceCount(r.body)})`, sentenceCount(r.body) >= 2));
  ok("walkthrough: one paragraph per chunk, each >= 3 sentences",
    d.walkthrough.length >= 3 && d.walkthrough.every((p) => sentenceCount(p) >= 3));
  ok("2-3 followUps", (d.followUps?.length ?? 0) >= 2 && (d.followUps?.length ?? 0) <= 3);
  ok("2-3 related slugs", (d.related?.length ?? 0) >= 2 && (d.related?.length ?? 0) <= 3);
  d.related?.forEach((r) => {
    ok(`related slug in lead's verified pool: ${r}`, POOL.has(r));
    ok(`related slug exists in registry: ${r}`, LC_SLUGS.has(r));
  });
  ok("schema.tables: one note per table", (d.schema.tables?.length ?? 0) >= 1 &&
    (d.schema.tables ?? []).every((t) => t.name.trim() && t.note.trim()));

  // hygiene: backticks / ${ / platform mention in any dive string
  const strs = allStrings(d);
  ok("no backticks in any string", strs.every((s) => !s.includes("`")));
  ok("no ${ in any string", strs.every((s) => !s.includes("${")));
  ok("no platform mention in any string", strs.every((s) => !/leetcode/i.test(s)));

  // engine: build from ddl+seed, run solution TWICE, hard-assert columns + EVERY cell + order
  try {
    const db = build(d);
    const r1 = runSql(db, d.code);
    const c1 = getCols(db, d.code);
    const r2 = runSql(db, d.code);
    db.close();
    ok("determinism: two runs identical", eq(r1, r2));
    ok(`columns === [${spec.columns.join(", ")}]`, eq(c1, spec.columns), JSON.stringify(c1));
    ok(`row count === ${spec.rows.length}`, r1.length === spec.rows.length, String(r1.length));
    ok("whole matrix exact + row order (JSON)", eq(r1, spec.rows), JSON.stringify(r1));
    r1.forEach((row, ri) => {
      const bad = row.map((cell, ci) => ({ ci, cell, want: spec.rows[ri][ci] }))
        .filter((x) => x.cell !== x.want);
      ok(`row ${ri + 1}: every cell exact (${row.length} cells)`, bad.length === 0,
        JSON.stringify(bad));
    });
  } catch (e) {
    ok("engine build+run", false, String(e));
  }
}

/* ---------- planted-trap probes: the WRONG queries must produce the documented wrong outputs ---------- */
console.log("\n=== planted-trap probes ===");
const probe = (label: string, cond: boolean, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; failures.push(label + (detail ? ` — ${detail}` : "")); console.log(`  FAIL  ${label}${detail ? " — " + detail : ""}`); }
};

const D1 = () => build(SQL_DF_COHORTS[0]);
const D2 = () => build(SQL_DF_COHORTS[1]);
const D3 = () => build(SQL_DF_COHORTS[2]);

// D1 probe 1: INNER JOIN erases user 104 -> cohort 3, m0 100.0
{
  const db = D1();
  probe("D1 INNER JOIN drops silent user 104 (cohort 3, m0 100.0)", eq(runSql(db, `
    WITH spanned AS (
      SELECT u.user_id, u.signup_month,
        (CAST(substr(a.active_month,1,4) AS INTEGER)*12 + CAST(substr(a.active_month,6,2) AS INTEGER))
      - (CAST(substr(u.signup_month,1,4) AS INTEGER)*12 + CAST(substr(u.signup_month,6,2) AS INTEGER)) AS mo
      FROM users u JOIN activity a ON a.user_id = u.user_id)
    SELECT signup_month, COUNT(DISTINCT user_id) AS cohort,
      ROUND(100.0*COUNT(DISTINCT CASE WHEN mo=0 THEN user_id END)/COUNT(DISTINCT user_id),1) AS m0,
      ROUND(100.0*COUNT(DISTINCT CASE WHEN mo=1 THEN user_id END)/COUNT(DISTINCT user_id),1) AS m1,
      ROUND(100.0*COUNT(DISTINCT CASE WHEN mo=2 THEN user_id END)/COUNT(DISTINCT user_id),1) AS m2
    FROM spanned GROUP BY signup_month ORDER BY signup_month`),
    [["2026-06", 3, 100, 66.7, 66.7], ["2026-07", 2, 100, 100, 100], ["2026-08", 4, 100, 0, 0]]));
  // D1 probe 2: activity-row denominator inflates and deflates the percentages
  probe("D1 activity-row denominator reads m0 37.5 on 2026-06", eq(runSql(db, `
    WITH spanned AS (
      SELECT u.user_id, u.signup_month,
        (CAST(substr(a.active_month,1,4) AS INTEGER)*12 + CAST(substr(a.active_month,6,2) AS INTEGER))
      - (CAST(substr(u.signup_month,1,4) AS INTEGER)*12 + CAST(substr(u.signup_month,6,2) AS INTEGER)) AS mo
      FROM users u LEFT JOIN activity a ON a.user_id = u.user_id)
    SELECT signup_month, COUNT(*) AS rows_n,
      ROUND(100.0*COUNT(DISTINCT CASE WHEN mo=0 THEN user_id END)/COUNT(*),1) AS m0,
      ROUND(100.0*COUNT(DISTINCT CASE WHEN mo=1 THEN user_id END)/COUNT(*),1) AS m1,
      ROUND(100.0*COUNT(DISTINCT CASE WHEN mo=2 THEN user_id END)/COUNT(*),1) AS m2
    FROM spanned GROUP BY signup_month ORDER BY signup_month`),
    [["2026-06", 9, 33.3, 22.2, 22.2], ["2026-07", 6, 33.3, 33.3, 33.3], ["2026-08", 4, 100, 0, 0]]));
  // D1 probe 3: the three offset arithmetics disagree on user 103's 2027-01 return
  probe("D1 offset arithmetics: fold 7 / month-only -5 / YYYYMM 95", eq(runSql(db, `
    SELECT (2027*12+1) - (2026*12+6) AS folded, 1 - 6 AS month_only, 202701 - 202606 AS yyyymm`),
    [[7, -5, 95]]));
  db.close();
}
// D2 probes: >= flag splits user 204; insertion order scrambles; epoch arithmetic is exact
{
  const db = D2();
  probe("D2 '>= 1800' flag splits 204's exact-30:00 pair (3 sessions, avg 16.7)", eq(runSql(db, `
    WITH ordered AS (
      SELECT user_id, event_ts, LAG(event_ts) OVER (PARTITION BY user_id ORDER BY event_ts) AS prev_ts FROM events),
    flagged AS (
      SELECT user_id, event_ts, CASE WHEN prev_ts IS NULL THEN 1
        WHEN CAST(strftime('%s', event_ts) AS INTEGER) - CAST(strftime('%s', prev_ts) AS INTEGER) >= 1800 THEN 1
        ELSE 0 END AS is_start FROM ordered),
    numbered AS (
      SELECT user_id, event_ts, SUM(is_start) OVER (PARTITION BY user_id ORDER BY event_ts) AS session_no FROM flagged),
    sessions AS (
      SELECT user_id, session_no,
        (CAST(strftime('%s', MAX(event_ts)) AS INTEGER) - CAST(strftime('%s', MIN(event_ts)) AS INTEGER)) / 60.0 AS dur
      FROM numbered GROUP BY user_id, session_no)
    SELECT user_id, COUNT(*) AS sessions, ROUND(AVG(dur), 1) AS avg_min
    FROM sessions GROUP BY user_id ORDER BY user_id`),
    [[201, 3, 19.3], [202, 1, 0], [203, 2, 29.5], [204, 3, 16.7], [205, 4, 25], [206, 2, 26.5]]));
  probe("D2 user 205's first INSERTED row is 12:02:00, not the MIN 07:05:00",
    runSql(db, `SELECT event_ts FROM events WHERE user_id = 205 ORDER BY rowid LIMIT 1`)[0][0] === "2026-03-08 12:02:00"
    && runSql(db, `SELECT MIN(event_ts) FROM events WHERE user_id = 205`)[0][0] === "2026-03-08 07:05:00");
  const epochGap = runSql(db, `SELECT CAST(strftime('%s','2026-03-07 08:30:00') AS INTEGER)
    - CAST(strftime('%s','2026-03-07 08:00:00') AS INTEGER) AS s`)[0][0];
  probe("D2 epoch gap for 204's exact pair is INTEGER 1800 (1800 > 1800 is cleanly false)",
    epochGap === 1800, String(epochGap));
  const jd = runSql(db, `SELECT (julianday('2026-03-07 08:30:00') - julianday('2026-03-07 08:00:00')) * 1440.0 AS d`)[0][0] as number;
  probe("D2 julianday REAL path lands within 1e-6 of 30.0 (float — not trusted at the boundary)",
    Math.abs(jd - 30) < 1e-6, String(jd));
  const midnight = runSql(db, `SELECT CAST(strftime('%s','2026-03-06 00:19:00') AS INTEGER)
    - CAST(strftime('%s','2026-03-05 23:40:00') AS INTEGER) AS s`)[0][0];
  probe("D2 midnight-crossing span 23:40:00 -> 00:19:00 is one 2340-second session",
    midnight === 2340, String(midnight));
  db.close();
}
// D3 probes: integer division zeroes the report; swapped literals flip the lift; self-lift zeroes it
{
  const db = D3();
  probe("D3 integer division SUM/COUNT reads conv_pct 0.0 on both rows", eq(runSql(db, `
    WITH rates AS (SELECT variant, COUNT(*) AS users, SUM(converted) AS conversions,
        SUM(converted)/COUNT(*)*100.0 AS raw_pct
      FROM assignments GROUP BY variant)
    SELECT r.variant, r.users, r.conversions, ROUND(r.raw_pct,1) AS conv_pct,
      ROUND(t.raw_pct - c.raw_pct,1) AS lift
    FROM rates r JOIN rates t ON t.variant = 'treatment' JOIN rates c ON c.variant = 'control'
    ORDER BY r.variant`),
    [["control", 20, 11, 0, 0], ["treatment", 20, 15, 0, 0]]));
  probe("D3 swapped join literals print lift -20.0", eq(runSql(db, `
    WITH rates AS (SELECT variant, 100.0*SUM(converted)/COUNT(*) AS raw_pct FROM assignments GROUP BY variant)
    SELECT r.variant, ROUND(t.raw_pct - c.raw_pct, 1) AS lift
    FROM rates r JOIN rates t ON t.variant = 'control' JOIN rates c ON c.variant = 'treatment'
    ORDER BY r.variant`),
    [["control", -20], ["treatment", -20]]));
  probe("D3 per-row self-lift prints 0.0 on both rows", eq(runSql(db, `
    WITH rates AS (SELECT variant, 100.0*SUM(converted)/COUNT(*) AS raw_pct FROM assignments GROUP BY variant)
    SELECT r.variant, ROUND(r.raw_pct - r.raw_pct, 1) AS lift FROM rates r ORDER BY r.variant`),
    [["control", 0], ["treatment", 0]]));
  const raw = runSql(db, `SELECT 100.0*11/20 AS c, 100.0*15/20 AS t`)[0];
  probe("D3 raw rates 100.0*11/20 = 55 exact, 100.0*15/20 = 75 exact, difference 20 exact",
    raw[0] === 55 && raw[1] === 75 && (raw[1] as number) - (raw[0] as number) === 20,
    JSON.stringify(raw));
  db.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log("ALL CHECKS PASS 3/3");
