// Task 77-f self-check — sql-df-wh-b.ts (3 Warehouse Trust B dives with primers:
// scd2-build 8064 Hard, late-arriving-restatement 8065 Hard, snapshot-delta-detect
// 8066 Medium). Imports the content file DIRECTLY (not content.ts — the lead wires
// that later). Builds each dive's schema in bun:sqlite, runs the solution, asserts
// the exact expected rows, and runs trap variants asserting the pinned wrong values
// from each dive's edges.
// bun scripts/tmp-77-f-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_WH_B } from "../src/lib/leetcode/content/sql-df-wh-b";
import type { LcSqlDive } from "../src/lib/leetcode/types";

let pass = 0, fail = 0;
const failures: string[] = [];
const ok = (label: string, cond: boolean, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; failures.push(label + (detail ? ` — ${detail}` : "")); console.log(`  FAIL  ${label}${detail ? " — " + detail : ""}`); }
};
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const setEq = (a: unknown[][], b: unknown[][]) =>
  eq(a.map((r) => JSON.stringify(r)).sort(), b.map((r) => JSON.stringify(r)).sort());

/* ---------- helpers (b4 protocol) ---------- */
const stripComments = (sql: string) =>
  sql.split("\n").map((l) => { const i = l.indexOf("--"); return i >= 0 ? l.slice(0, i) : l; }).join("\n");

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
  if (d.primer) {
    out.push(d.primer.hook, d.primer.where, ...d.primer.concept, ...d.primer.worked,
      ...d.primer.glossary.flatMap((g) => [g.term, g.def]), ...d.primer.reallife);
  }
  return out;
};
const proseStrings = (d: LcSqlDive): string[] =>
  [d.statement, d.approach, d.time, d.space,
    ...d.examples.flatMap((e) => [e.input, e.output, e.explanation ?? ""]),
    ...d.constraints, ...d.breakdown, ...d.edges, ...d.walkthrough,
    ...d.followUps ?? [], ...d.ladder.flatMap((r) => [r.title, r.body]),
    ...(d.schema.tables ?? []).map((t) => t.note),
    ...(d.primer ? [d.primer.hook, d.primer.where, ...d.primer.concept, ...d.primer.worked,
      ...d.primer.glossary.flatMap((g) => [g.term, g.def]), ...d.primer.reallife] : [])];

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

/* ---------- spec ---------- */
// Pinned output contracts (hand-derived, confirmed by the engine).
const SPEC: Array<{
  slug: string; id: number; difficulty: "Easy" | "Medium" | "Hard"; xp: number;
  columns: string[]; rows: unknown[][]; realColumns: string[]; intColumns: string[];
  order: "exact" | "any";
}> = [
  { slug: "scd2-build", id: 8064, difficulty: "Hard", xp: 35,
    columns: ["customer_id", "city", "valid_from", "valid_to", "is_current"],
    rows: [
      [1, "Austin", "2026-01-10", "2026-03-05", 0],
      [1, "Denver", "2026-03-05", "2026-06-20", 0],
      [1, "Seattle", "2026-06-20", "9999-12-31", 1],
      [2, "Boston", "2026-02-01", "9999-12-31", 1],
      [3, "Austin", "2026-01-05", "2026-02-10", 0],
      [3, "Dallas", "2026-02-10", "2026-05-30", 0],
      [3, "Austin", "2026-05-30", "9999-12-31", 1],
      [4, "Miami", "2026-03-15", "9999-12-31", 1],
    ],
    realColumns: [], intColumns: ["customer_id", "is_current"], order: "exact" },
  { slug: "late-arriving-restatement", id: 8065, difficulty: "Hard", xp: 35,
    columns: ["event_date", "true_events", "counted_same_day", "restatement_delta"],
    rows: [
      ["2026-09-09", 2, 1, 1],
      ["2026-09-10", 3, 0, 3],
      ["2026-09-11", 2, 1, 1],
      ["2026-09-14", 2, 1, 1],
      ["2026-09-16", 2, 1, 1],
    ],
    realColumns: [],
    intColumns: ["true_events", "counted_same_day", "restatement_delta"], order: "exact" },
  { slug: "snapshot-delta-detect", id: 8066, difficulty: "Medium", xp: 20,
    columns: ["status", "row_count"],
    rows: [
      ["changed", 3],
      ["inserted", 2],
      ["removed", 1],
      ["unchanged", 2],
    ],
    realColumns: [], intColumns: ["row_count"], order: "exact" },
];
const XP: Record<string, number> = { Easy: 10, Medium: 20, Hard: 35 };

// related slugs may ONLY come from the Data & Finance track (batch 1-3 registry).
const RELATED_POOL = new Set([
  "ab-sample-ratio-mismatch", "ab-test-conversion-lift", "amount-anomaly-zscore", "ar-aging-schedule",
  "balance-rollforward", "beta-benchmark", "chargeback-rate-ranking", "circular-transfers",
  "cohort-retention-matrix", "credit-utilization-bands", "daily-balance-interest", "dau-wau-stickiness",
  "deferred-revenue", "delinquency-buckets", "delinquency-roll-rates", "dividend-income-calendar",
  "dormant-reactivation", "duplicate-charge-pairs", "expected-credit-loss", "feature-adoption-windows",
  "fifo-inventory-cogs", "funnel-step-conversion", "fx-exposure-report", "gl-reconciliation",
  "growth-accounting", "journal-gap-detection", "loan-amortization-schedule", "max-drawdown",
  "median-time-to-convert", "portfolio-concentration-hhi", "portfolio-weights", "prepayment-detection",
  "realized-pnl-average-cost", "risk-based-pricing", "rolling-7d-actives", "sessionize-events",
  "settlement-fails-aging", "sharpe-ratio", "split-adjusted-position", "structuring-detection",
  "time-weighted-return", "transaction-velocity", "trial-balance-check", "usage-tier-percentiles",
  "value-at-risk", "vintage-default-curves", "wash-trade-detection", "week-over-week-churn",
]);
const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));

console.log(`\n=== sql-df-wh-b.ts — ${SQL_DF_WH_B.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_WH_B.length === 3 && SPEC.every((s, i) => SQL_DF_WH_B[i]?.slug === s.slug),
  SQL_DF_WH_B.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_WH_B[i];
  const spec = SPEC[i];
  console.log(`\n--- dive ${i + 1}: ${d.slug} ---`);

  // statement count + read-only + order semantics
  ok("exactly ONE statement (countStatements)", countStatements(d.code) === 1);
  ok("exactly ONE statement (splitStatements)", splitStatements(d.code).length === 1);
  ok("read-only statement (WITH/SELECT)", /^\s*(with|select)\b/i.test(stripComments(d.code).trim()));
  ok(`order === "${spec.order}"`, d.order === spec.order);
  if (spec.order === "exact") {
    ok("result-level ORDER BY present (order:exact)", /order\s+by/i.test(stripComments(d.code)));
  }
  ok(`xp === ${spec.xp}`, d.xp === spec.xp);
  ok("approach is ONE line", !d.approach.includes("\n"));

  // trailing-semicolon + comment hygiene
  ok("code ends with a single trailing ';'", trailingSemicolonClean(d.code));
  ok("ddl ends with ';' and nothing after", trailingSemicolonClean(d.schema.ddl));
  ok("seed ends with ';' and nothing after", trailingSemicolonClean(d.schema.seed));
  ok("no ';' inside comments of ddl/seed/code",
    noSemiInComments(d.schema.ddl) && noSemiInComments(d.schema.seed) && noSemiInComments(d.code));

  // structure
  const sc = sentenceCount(d.statement);
  ok(`statement has 3-6 sentences (got ${sc})`, sc >= 3 && sc <= 6);
  ok("2 examples with input+output+explanation",
    d.examples.length === 2 && d.examples.every((e) => e.input.trim() && e.output.trim() && (e.explanation ?? "").trim()));
  ok("3-4 constraints", d.constraints.length >= 3 && d.constraints.length <= 4);
  ok("exactly 3 breakdown paragraphs", d.breakdown.length === 3);
  d.breakdown.forEach((p, j) => {
    const c = sentenceCount(p);
    ok(`breakdown para ${j + 1} has 3-6 sentences (got ${c})`, c >= 3 && c <= 6);
  });
  ok("4 edges", d.edges.length === 4, String(d.edges.length));
  d.edges.forEach((p, j) =>
    ok(`edge ${j + 1} has >= 1 full sentence (got ${sentenceCount(p)})`, sentenceCount(p) >= 1));
  ok("3 ladder rungs (title+body)", d.ladder.length === 3 && d.ladder.every((r) => r.title.trim() && r.body.trim()));
  d.ladder.forEach((r, j) =>
    ok(`ladder rung ${j + 1} body has >= 2 sentences (got ${sentenceCount(r.body)})`, sentenceCount(r.body) >= 2));
  ok("walkthrough: one paragraph per logical chunk (3)", d.walkthrough.length === 3);
  d.walkthrough.forEach((p, j) =>
    ok(`walkthrough para ${j + 1} has >= 3 sentences (got ${sentenceCount(p)})`, sentenceCount(p) >= 3));
  ok("2-3 followUps", (d.followUps?.length ?? 0) >= 2 && (d.followUps?.length ?? 0) <= 3);
  ok("exactly 3 related slugs", d.related?.length === 3, String(d.related?.length));
  d.related?.forEach((r) => {
    ok(`related slug from the Data & Finance pool: ${r}`, RELATED_POOL.has(r));
    ok(`related slug exists in the registry: ${r}`, LC_SLUGS.has(r));
  });
  ok(`schema.tables has one entry per DDL table (${tableCount(d.schema.ddl)})`,
    (d.schema.tables?.length ?? 0) === tableCount(d.schema.ddl));

  // PRIMER audits
  const p = d.primer;
  ok("primer present", !!p);
  if (p) {
    const hs = sentenceCount(p.hook);
    ok(`primer hook is exactly 1 sentence (got ${hs})`, hs === 1);
    ok(`primer concept has 3-4 paragraphs (got ${p.concept.length})`, p.concept.length >= 3 && p.concept.length <= 4);
    p.concept.forEach((c, j) =>
      ok(`primer concept para ${j + 1} has >= 3 sentences (got ${sentenceCount(c)})`, sentenceCount(c) >= 3));
    ok(`primer worked has 3-5 steps (got ${p.worked.length})`, p.worked.length >= 3 && p.worked.length <= 5);
    p.worked.forEach((w, j) =>
      ok(`primer worked step ${j + 1} is a full sentence`, sentenceCount(w) >= 1));
    ok(`primer glossary has 4-6 entries (got ${p.glossary.length})`, p.glossary.length >= 4 && p.glossary.length <= 6);
    p.glossary.forEach((g, j) =>
      ok(`primer glossary ${j + 1} "${g.term}" def has >= 5 words (got ${g.def.trim().split(/\s+/).length})`,
        g.term.trim().length > 0 && g.def.trim().split(/\s+/).length >= 5));
    ok(`primer reallife has 2-3 paragraphs (got ${p.reallife.length})`, p.reallife.length >= 2 && p.reallife.length <= 3);
    p.reallife.forEach((c, j) =>
      ok(`primer reallife para ${j + 1} has >= 3 sentences (got ${sentenceCount(c)})`, sentenceCount(c) >= 3));
    ok("primer where is nonempty", p.where.trim().length > 0);
  }

  // hygiene: backticks / ${ / platform mention / e.g.-i.e. in any dive string (primer included)
  const strs = allStrings(d);
  ok("no backticks in any string", strs.every((s) => !s.includes("`")));
  ok("no ${ in any string", strs.every((s) => !s.includes("${")));
  ok("no platform mention in any string",
    strs.every((s) => !/leetcode|hackerrank|datalemur|stratascratch/i.test(s)));
  ok('no "e.g."/"i.e." in prose',
    proseStrings(d).every((s) => !/\be\.g\.|\bi\.e\./i.test(s)));

  // MONEY convention: every money column (name ending _cents/_minor) in the DDL
  // is INTEGER (REAL is reserved for rates/pcts; this family has none).
  const ddlMoney = (d.schema.ddl.match(/^\s*(\w+_cents|\w+_minor)\s+(\w+)/gim) ?? [])
    .map((m) => m.trim().split(/\s+/));
  ok(`every *_cents/_minor DDL column is INTEGER (${ddlMoney.length} money columns)`,
    ddlMoney.every((part) => part[1] === "INTEGER"), JSON.stringify(ddlMoney));
  ok("no REAL-typed DDL column anywhere", !/\bREAL\b/i.test(d.schema.ddl));
  ok("no julianday anywhere (dates are plain labels)", !/julianday/i.test(d.code) && !/julianday/i.test(d.schema.seed));

  // registry tuple: STRICT whenever the row is wired; PEND while the lead owes wiring
  const regRow = LC_ALL.find((row) => row.slug === spec.slug);
  if (regRow) {
    ok(`registry tuple ${spec.slug}: num === ${spec.id}`, regRow.num === spec.id, String(regRow.num));
    ok(`registry tuple ${spec.slug}: difficulty === ${spec.difficulty}`, regRow.difficulty === spec.difficulty, String(regRow.difficulty));
    ok(`registry tuple ${spec.slug}: xp(${XP[regRow.difficulty]}) === ${spec.xp}`, XP[regRow.difficulty] === spec.xp);
  } else {
    console.log(`  PEND  registry tuple ${spec.id} ${spec.slug} — row not yet wired by the lead (assert is armed)`);
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
        const col = spec.columns[ci];
        const exp = spec.rows[ri][ci];
        ok(`cell(${ri + 1},${ci + 1}) ${col} === ${JSON.stringify(exp)}`, eq(cell, exp), JSON.stringify(cell));
      });
    });
    if (spec.order === "exact") {
      ok("rows === spec (order-sensitive, whole-array)", eq(r1, spec.rows), JSON.stringify(r1));
    } else {
      ok("rows === spec (set-compare, whole-array)", setEq(r1, spec.rows), JSON.stringify(r1));
    }
    ok("every declared-integer cell is an integer",
      r1.every((row) => spec.intColumns.every((c) => Number.isInteger(row[spec.columns.indexOf(c)]))));
  } catch (e) {
    ok("engine build+run", false, String(e));
  }
}

/* ---------- planted-trap probes: the WRONG queries must produce the documented wrong outputs ---------- */
console.log("\n=== planted-trap probes ===");

// D1 scd2-build traps
{
  const d = SQL_DF_WH_B[0];
  const db = buildDb(d);
  const HEAD = `WITH ordered AS (
      SELECT customer_id, city, changed_date,
        LAG(city) OVER (PARTITION BY customer_id ORDER BY changed_date) AS prev_city
      FROM customer_changes)`;
  ok("D1 trap: no dedupe at all ships 9 rows with overlapping Boston versions",
    eq(runSql(db, `WITH win AS (
        SELECT customer_id, city, changed_date,
          LEAD(changed_date) OVER (PARTITION BY customer_id ORDER BY changed_date) AS next_start
        FROM customer_changes)
      SELECT customer_id, city, changed_date AS valid_from,
        COALESCE(next_start, '9999-12-31') AS valid_to,
        CASE WHEN next_start IS NULL THEN 1 ELSE 0 END AS is_current
      FROM win
      ORDER BY customer_id ASC, valid_from ASC`),
      [
        [1, "Austin", "2026-01-10", "2026-03-05", 0],
        [1, "Denver", "2026-03-05", "2026-06-20", 0],
        [1, "Seattle", "2026-06-20", "9999-12-31", 1],
        [2, "Boston", "2026-02-01", "2026-04-15", 0],
        [2, "Boston", "2026-04-15", "9999-12-31", 1],
        [3, "Austin", "2026-01-05", "2026-02-10", 0],
        [3, "Dallas", "2026-02-10", "2026-05-30", 0],
        [3, "Austin", "2026-05-30", "9999-12-31", 1],
        [4, "Miami", "2026-03-15", "9999-12-31", 1],
      ]));
  ok("D1 trap: NULL sentinel + ORDER BY valid_to floats every current row to the top",
    eq(runSql(db, `${HEAD},
      versions AS (
        SELECT customer_id, city, changed_date,
          LEAD(changed_date) OVER (PARTITION BY customer_id ORDER BY changed_date) AS next_start
        FROM ordered WHERE prev_city IS NULL OR city <> prev_city)
      SELECT customer_id, city, changed_date AS valid_from, next_start AS valid_to,
        CASE WHEN next_start IS NULL THEN 1 ELSE 0 END AS is_current
      FROM versions
      ORDER BY customer_id ASC, valid_to ASC`),
      [
        [1, "Seattle", "2026-06-20", null, 1],
        [1, "Austin", "2026-01-10", "2026-03-05", 0],
        [1, "Denver", "2026-03-05", "2026-06-20", 0],
        [2, "Boston", "2026-02-01", null, 1],
        [3, "Austin", "2026-05-30", null, 1],
        [3, "Austin", "2026-01-05", "2026-02-10", 0],
        [3, "Dallas", "2026-02-10", "2026-05-30", 0],
        [4, "Miami", "2026-03-15", null, 1],
      ]));
  ok("D1 trap: LEAD before dedupe closes customer 2's open version on the no-op date",
    eq(runSql(db, `WITH lead_raw AS (
        SELECT customer_id, city, changed_date,
          LEAD(changed_date) OVER (PARTITION BY customer_id ORDER BY changed_date) AS next_start
        FROM customer_changes),
      deduped AS (
        SELECT customer_id, city, changed_date, next_start,
          LAG(city) OVER (PARTITION BY customer_id ORDER BY changed_date) AS prev_city
        FROM lead_raw)
      SELECT customer_id, city, changed_date AS valid_from,
        COALESCE(next_start, '9999-12-31') AS valid_to,
        CASE WHEN next_start IS NULL THEN 1 ELSE 0 END AS is_current
      FROM deduped
      WHERE prev_city IS NULL OR city <> prev_city
      ORDER BY customer_id ASC, valid_from ASC`),
      [
        [1, "Austin", "2026-01-10", "2026-03-05", 0],
        [1, "Denver", "2026-03-05", "2026-06-20", 0],
        [1, "Seattle", "2026-06-20", "9999-12-31", 1],
        [2, "Boston", "2026-02-01", "2026-04-15", 0],
        [3, "Austin", "2026-01-05", "2026-02-10", 0],
        [3, "Dallas", "2026-02-10", "2026-05-30", 0],
        [3, "Austin", "2026-05-30", "9999-12-31", 1],
        [4, "Miami", "2026-03-15", "9999-12-31", 1],
      ]));
  ok("D1 trap: city <> prev_city without the IS NULL escape drops both first rows and customer 2 entirely (4 rows)",
    eq(runSql(db, `${HEAD},
      versions AS (
        SELECT customer_id, city, changed_date,
          LEAD(changed_date) OVER (PARTITION BY customer_id ORDER BY changed_date) AS next_start
        FROM ordered WHERE city <> prev_city)
      SELECT customer_id, city, changed_date AS valid_from,
        COALESCE(next_start, '9999-12-31') AS valid_to,
        CASE WHEN next_start IS NULL THEN 1 ELSE 0 END AS is_current
      FROM versions
      ORDER BY customer_id ASC, valid_from ASC`),
      [
        [1, "Denver", "2026-03-05", "2026-06-20", 0],
        [1, "Seattle", "2026-06-20", "9999-12-31", 1],
        [3, "Dallas", "2026-02-10", "2026-05-30", 0],
        [3, "Austin", "2026-05-30", "9999-12-31", 1],
      ]));
  db.close();
}

// D2 late-arriving-restatement traps
{
  const d = SQL_DF_WH_B[1];
  const db = buildDb(d);
  ok("D2 trap: GROUP BY processed_date re-keys the report to ingestion days",
    eq(runSql(db, `SELECT
          processed_date AS event_date,
          COUNT(*) AS true_events,
          SUM(CASE WHEN processed_date = event_date THEN 1 ELSE 0 END) AS counted_same_day,
          COUNT(*) - SUM(CASE WHEN processed_date = event_date THEN 1 ELSE 0 END) AS restatement_delta
        FROM events
        GROUP BY processed_date
        HAVING COUNT(*) - SUM(CASE WHEN processed_date = event_date THEN 1 ELSE 0 END) > 0
        ORDER BY processed_date ASC`),
      [
        ["2026-09-11", 2, 1, 1],
        ["2026-09-14", 3, 1, 2],
        ["2026-09-15", 4, 2, 2],
        ["2026-09-18", 2, 1, 1],
        ["2026-09-21", 1, 0, 1],
      ]));
  ok("D2 trap: dropping the strict filter rides every clean day along (8 rows)",
    eq(runSql(db, `SELECT
          event_date,
          COUNT(*) AS true_events,
          SUM(CASE WHEN processed_date = event_date THEN 1 ELSE 0 END) AS counted_same_day,
          COUNT(*) - SUM(CASE WHEN processed_date = event_date THEN 1 ELSE 0 END) AS restatement_delta
        FROM events
        GROUP BY event_date
        ORDER BY event_date ASC`),
      [
        ["2026-09-07", 3, 3, 0],
        ["2026-09-09", 2, 1, 1],
        ["2026-09-10", 3, 0, 3],
        ["2026-09-11", 2, 1, 1],
        ["2026-09-14", 2, 1, 1],
        ["2026-09-15", 2, 2, 0],
        ["2026-09-16", 2, 1, 1],
        ["2026-09-18", 1, 1, 0],
      ]));
  ok("D2 trap: flipped sign (counted - true) with a strict > 0 gate empties the report (0 rows)",
    eq(runSql(db, `SELECT
          event_date,
          COUNT(*) AS true_events,
          SUM(CASE WHEN processed_date = event_date THEN 1 ELSE 0 END) AS counted_same_day,
          SUM(CASE WHEN processed_date = event_date THEN 1 ELSE 0 END) - COUNT(*) AS restatement_delta
        FROM events
        GROUP BY event_date
        HAVING SUM(CASE WHEN processed_date = event_date THEN 1 ELSE 0 END) - COUNT(*) > 0
        ORDER BY event_date ASC`),
      []));
  ok("D2 trap: pre-filtering to late events loses the true/counted split (5 rows of late counts)",
    eq(runSql(db, `SELECT event_date, COUNT(*) AS late_events
        FROM events
        WHERE processed_date <> event_date
        GROUP BY event_date
        ORDER BY event_date ASC`),
      [
        ["2026-09-09", 1],
        ["2026-09-10", 3],
        ["2026-09-11", 1],
        ["2026-09-14", 1],
        ["2026-09-16", 1],
      ]));
  ok("D2 sanity: 7 of the 17 events are late (delta column sums to 7)",
    eq(runSql(db, `SELECT COUNT(*) FROM events WHERE processed_date <> event_date`), [[7]]));
  db.close();
}

// D3 snapshot-delta-detect traps
{
  const d = SQL_DF_WH_B[2];
  const db = buildDb(d);
  const PAIRED = `WITH paired AS (
      SELECT COALESCE(y.acct_key, t.acct_key) AS acct_key,
        y.balance_cents AS y_balance, t.balance_cents AS t_balance
      FROM snap_yesterday y
      FULL OUTER JOIN snap_today t ON t.acct_key = y.acct_key)`;
  ok("D3 trap: INNER JOIN blinds the diff to inserted+removed (changed 3, unchanged 2)",
    eq(runSql(db, `WITH paired AS (
        SELECT COALESCE(y.acct_key, t.acct_key) AS acct_key,
          y.balance_cents AS y_balance, t.balance_cents AS t_balance
        FROM snap_yesterday y
        JOIN snap_today t ON t.acct_key = y.acct_key)
      SELECT CASE
          WHEN y_balance IS NULL THEN 'inserted'
          WHEN t_balance IS NULL THEN 'removed'
          WHEN y_balance <> t_balance THEN 'changed'
          ELSE 'unchanged'
        END AS status,
        COUNT(*) AS row_count
      FROM paired
      GROUP BY status
      ORDER BY status ASC`),
      [["changed", 3], ["unchanged", 2]]));
  ok("D3 trap: guardless equality-first CASE swallows unmatched keys into changed (changed 6, unchanged 2)",
    eq(runSql(db, `${PAIRED}
      SELECT CASE WHEN y_balance = t_balance THEN 'unchanged' ELSE 'changed' END AS status,
        COUNT(*) AS row_count
      FROM paired
      GROUP BY status
      ORDER BY status ASC`),
      [["changed", 6], ["unchanged", 2]]));
  ok("D3 trap: COALESCE(t_balance, 0) before the removed check empties the removed group (3 rows, removed missing, changed 4)",
    eq(runSql(db, `${PAIRED}
      SELECT CASE
          WHEN y_balance IS NULL THEN 'inserted'
          WHEN COALESCE(t_balance, 0) <> y_balance THEN 'changed'
          WHEN t_balance IS NULL THEN 'removed'
          ELSE 'unchanged'
        END AS status,
        COUNT(*) AS row_count
      FROM paired
      GROUP BY status
      ORDER BY status ASC`),
      [["changed", 4], ["inserted", 2], ["unchanged", 2]]));
  ok("D3 trap: swapped IS-NULL labels accuse the pipeline of the opposite (inserted 1, removed 2)",
    eq(runSql(db, `${PAIRED}
      SELECT CASE
          WHEN y_balance IS NULL THEN 'removed'
          WHEN t_balance IS NULL THEN 'inserted'
          WHEN y_balance <> t_balance THEN 'changed'
          ELSE 'unchanged'
        END AS status,
        COUNT(*) AS row_count
      FROM paired
      GROUP BY status
      ORDER BY status ASC`),
      [["changed", 3], ["inserted", 1], ["removed", 2], ["unchanged", 2]]));
  ok("D3 sanity: 8 distinct keys across both snapshots (counts sum to 8)",
    eq(runSql(db, `SELECT COUNT(*) FROM (
        SELECT acct_key FROM snap_yesterday UNION SELECT acct_key FROM snap_today)`), [[8]]));
  db.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log(`ALL CHECKS PASS ${SQL_DF_WH_B.length}/3`);
