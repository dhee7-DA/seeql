// Task 73-c self-check — sql-df-markets-a.ts (3 Markets & Risk dives).
// bun scripts/tmp-73-c-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_MARKETS_A } from "../src/lib/leetcode/content/sql-df-markets-a";
import type { LcSqlDive } from "../src/lib/leetcode/types";

let pass = 0, fail = 0;
const failures: string[] = [];
const ok = (label: string, cond: boolean, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; failures.push(label + (detail ? ` — ${detail}` : "")); console.log(`  FAIL  ${label}${detail ? " — " + detail : ""}`); }
};
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/* ---------- helpers (b4 protocol) ---------- */
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
const proseStrings = (d: LcSqlDive): string[] =>
  [d.statement, d.approach, d.time, d.space,
    ...d.examples.flatMap((e) => [e.input, e.output, e.explanation ?? ""]),
    ...d.constraints, ...d.breakdown, ...d.edges, ...d.walkthrough,
    ...d.followUps ?? [], ...d.ladder.flatMap((r) => [r.title, r.body]),
    ...(d.schema.tables ?? []).map((t) => t.note)];

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
// realColumns: cells whose contract type is REAL (asserted within 1e-9 as well).
// intColumns: cells whose contract type is INTEGER.
const SPEC: Array<{
  slug: string; id: number; difficulty: "Easy" | "Medium" | "Hard"; xp: number;
  columns: string[]; rows: unknown[][]; realColumns: string[]; intColumns: string[];
}> = [
  { slug: "fx-exposure-report", id: 8019, difficulty: "Medium", xp: 20,
    columns: ["account_id", "account_name", "currency", "balance_minor", "usd_value_cents"],
    rows: [
      [3, "Toronto Payroll", "CAD", 500000, 362000],
      [1, "Frankfurt Operating", "EUR", 250000, 293000],
      [4, "NY Treasury", "USD", 125000, 125000],
      [2, "London Trading", "GBP", 89000, 119349],
      [5, "Paris Marketing", "EUR", 43750, 51275],
    ],
    realColumns: [], intColumns: ["account_id", "balance_minor", "usd_value_cents"] },
  { slug: "portfolio-concentration-hhi", id: 8020, difficulty: "Medium", xp: 20,
    columns: ["portfolio_id", "positions", "largest_pct", "hhi", "concentration"],
    rows: [
      [1, 4, 50.0, 3450, "concentrated"],
      [2, 4, 25.0, 2500, "moderate"],
      [3, 8, 20.0, 1364, "diversified"],
    ],
    realColumns: ["largest_pct"], intColumns: ["portfolio_id", "positions", "hhi"] },
  { slug: "daily-balance-interest", id: 8021, difficulty: "Hard", xp: 35,
    columns: ["account_id", "apy_pct", "interest_cents", "end_balance_cents"],
    rows: [
      [1, 4.0, 606, 180000],
      [2, 3.5, 188, 60000],
      [3, 5.0, 329, 150000],
    ],
    realColumns: ["apy_pct"], intColumns: ["account_id", "interest_cents", "end_balance_cents"] },
];
const XP: Record<string, number> = { Easy: 10, Medium: 20, Hard: 35 };

// related slugs may ONLY come from the brief's per-dive pools.
const RELATED_POOL: Record<string, Set<string>> = {
  "fx-exposure-report": new Set(["calculate-product-final-price", "gl-reconciliation", "realized-pnl-average-cost", "portfolio-weights"]),
  "portfolio-concentration-hhi": new Set(["portfolio-weights", "realized-pnl-average-cost", "settlement-fails-aging", "delinquency-buckets"]),
  "daily-balance-interest": new Set(["loan-amortization-schedule", "restaurant-growth", "rolling-average-steps", "realized-pnl-average-cost"]),
};
const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));

console.log(`\n=== sql-df-markets-a.ts — ${SQL_DF_MARKETS_A.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_MARKETS_A.length === 3 && SPEC.every((s, i) => SQL_DF_MARKETS_A[i]?.slug === s.slug),
  SQL_DF_MARKETS_A.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_MARKETS_A[i];
  const spec = SPEC[i];
  console.log(`\n--- dive ${i + 1}: ${d.slug} ---`);

  // statement count + result-level ORDER BY + read-only
  ok("exactly ONE statement (countStatements)", countStatements(d.code) === 1);
  ok("exactly ONE statement (splitStatements)", splitStatements(d.code).length === 1);
  const stripped = stripOver(stripComments(d.code));
  ok("result-level ORDER BY after stripping comments/OVER spans", /order\s+by/i.test(stripped));
  ok("read-only statement (WITH/SELECT)", /^\s*(with|select)\b/i.test(stripComments(d.code).trim()));
  ok('order === "exact"', d.order === "exact");
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
  ok("2-4 constraints", d.constraints.length >= 2 && d.constraints.length <= 4);
  ok("exactly 3 breakdown paragraphs", d.breakdown.length === 3);
  d.breakdown.forEach((p, j) => {
    const c = sentenceCount(p);
    ok(`breakdown para ${j + 1} has 3-6 sentences (got ${c})`, c >= 3 && c <= 6);
  });
  ok("3-5 edges", d.edges.length >= 3 && d.edges.length <= 5);
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
    ok(`related slug from the verified pool: ${r}`, RELATED_POOL[spec.slug].has(r));
    ok(`related slug exists in the registry: ${r}`, LC_SLUGS.has(r));
  });
  ok(`schema.tables has one entry per DDL table (${tableCount(d.schema.ddl)})`,
    (d.schema.tables?.length ?? 0) === tableCount(d.schema.ddl));

  // hygiene: backticks / ${ / platform mention / e.g.-i.e. in any dive string
  const strs = allStrings(d);
  ok("no backticks in any string", strs.every((s) => !s.includes("`")));
  ok("no ${ in any string", strs.every((s) => !s.includes("${")));
  ok("no platform mention in any string",
    strs.every((s) => !/leetcode|hackerrank|datalemur|stratascratch/i.test(s)));
  ok('no "e.g."/"i.e." in prose (sentence heuristic safety)',
    proseStrings(d).every((s) => !/\be\.g\.|\bi\.e\./i.test(s)));

  // MONEY convention: every money column (input or output, name ending _cents/_minor)
  // is INTEGER in the DDL and declared-integer in the contract (outputs hhi-style
  // derived integers ride intColumns; REAL is reserved for rates/pcts).
  const moneyOut = spec.columns.filter((c) => /(_cents|_minor)$/.test(c));
  ok("every *_cents/_minor output column is declared integer", moneyOut.every((c) => spec.intColumns.includes(c)));
  const ddlMoney = (d.schema.ddl.match(/^\s*(\w+_cents|\w+_minor)\s+(\w+)/gim) ?? [])
    .map((m) => m.trim().split(/\s+/));
  ok(`every *_cents/_minor DDL column is INTEGER (${ddlMoney.length} money columns)`,
    ddlMoney.length > 0 && ddlMoney.every((p) => p[1] === "INTEGER"), JSON.stringify(ddlMoney));
  ok("declared REAL columns appear in the output", spec.realColumns.every((c) => spec.columns.includes(c)));

  // registry tuple: STRICT whenever the row is wired; PEND while the lead owes wiring
  const regRow = LC_ALL.find((p) => p.slug === spec.slug);
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
        if (spec.realColumns.includes(col)) {
          ok(`cell(${ri + 1},${ci + 1}) ${col} REAL within 1e-9 of ${exp}`,
            Math.abs(Number(cell) - Number(exp)) < 1e-9, String(cell));
        }
      });
    });
    ok("rows === spec (order-sensitive, whole-array)", eq(r1, spec.rows), JSON.stringify(r1));
    ok("every declared-integer cell is an integer",
      r1.every((row) => spec.intColumns.every((c) => Number.isInteger(row[spec.columns.indexOf(c)]))));
  } catch (e) {
    ok("engine build+run", false, String(e));
  }
}

/* ---------- per-dive hand verification ---------- */
console.log("\n=== fx-exposure — driving rates + hand multiplies ===");
{
  const d = SQL_DF_MARKETS_A[0];
  const db = buildDb(d);
  ok("driving rate dates (latest <= as-of, per currency)",
    eq(runSql(db, `SELECT currency, MAX(rate_date) AS drive_date FROM fx_rates
        WHERE rate_date <= '2026-10-01' GROUP BY currency ORDER BY currency ASC`),
      [["CAD", "2026-09-30"], ["EUR", "2026-09-28"], ["GBP", "2026-08-15"], ["USD", "2026-01-01"]]));
  const rates = runSql(db, `SELECT f.currency, r.usd_per_unit FROM
      (SELECT currency, MAX(rate_date) AS md FROM fx_rates WHERE rate_date <= '2026-10-01' GROUP BY currency) f
      JOIN fx_rates r ON r.currency = f.currency AND r.rate_date = f.md ORDER BY f.currency ASC`);
  const rateMap: Record<string, number> = {};
  rates.forEach((r) => { rateMap[r[0] as string] = r[1] as number; });
  ok("driving rates: CAD 0.724, EUR 1.172, GBP 1.341, USD 1.0",
    rateMap["CAD"] === 0.724 && rateMap["EUR"] === 1.172 && rateMap["GBP"] === 1.341 && rateMap["USD"] === 1.0,
    JSON.stringify(rateMap));
  // hand re-multiply of every account (TS doubles mirror the one-step contract)
  const accts = runSql(db, `SELECT account_id, currency, balance_minor FROM accounts ORDER BY account_id ASC`);
  const hand = accts.map(([id, cur, bal]) =>
    [id, Math.round((bal as number) * rateMap[cur as string])]);
  ok("hand re-multiply of all 5 accounts matches the contract cells",
    eq(hand, [[1, 293000], [2, 119349], [3, 362000], [4, 125000], [5, 51275]]), JSON.stringify(hand));
  db.close();
}

console.log("\n=== HHI — weights identity + hand squares ===");
{
  const d = SQL_DF_MARKETS_A[1];
  const db = buildDb(d);
  const sums = runSql(db, `WITH weights AS (
      SELECT portfolio_id, 100.0 * market_value_cents
          / SUM(market_value_cents) OVER (PARTITION BY portfolio_id) AS w
      FROM positions)
    SELECT portfolio_id, SUM(w) AS total_w FROM weights GROUP BY portfolio_id ORDER BY portfolio_id ASC`);
  ok("each portfolio's weights sum to 100 (within 1e-9)",
    sums.length === 3 && sums.every((r) => Math.abs((r[1] as number) - 100) < 1e-9), JSON.stringify(sums));
  // hand square-sums straight from the seed percents
  const hand = runSql(db, `WITH weights AS (
      SELECT portfolio_id, 100.0 * market_value_cents
          / SUM(market_value_cents) OVER (PARTITION BY portfolio_id) AS w
      FROM positions)
    SELECT portfolio_id, SUM(w * w) AS hhi_raw FROM weights GROUP BY portfolio_id ORDER BY portfolio_id ASC`);
  ok("hand square-sums: 3450 / 2500 / 1364 (exact on this seed)",
    hand.length === 3 && hand[0][1] === 3450 && hand[1][1] === 2500 && hand[2][1] === 1364,
    JSON.stringify(hand));
  db.close();
}

console.log("\n=== daily-balance interest — TS double mirror + hand cent-days ===");
{
  const d = SQL_DF_MARKETS_A[2];
  const db = buildDb(d);
  const SPINE = `WITH RECURSIVE days(d) AS (
      SELECT '2026-09-01' UNION ALL SELECT date(d, '+1 day') FROM days WHERE d < '2026-09-30'),
    daily_net AS (SELECT account_id, txn_date AS d, SUM(amount_cents) AS net_cents
      FROM ledger GROUP BY account_id, txn_date),
    balance_days AS (SELECT a.account_id, a.apy_pct, days.d, COALESCE(n.net_cents, 0) AS net_cents
      FROM accounts a CROSS JOIN days LEFT JOIN daily_net n ON n.account_id = a.account_id AND n.d = days.d),
    running AS (SELECT account_id, apy_pct, d,
      SUM(net_cents) OVER (PARTITION BY account_id ORDER BY d) AS eod_cents FROM balance_days)`;
  const raw = runSql(db, `${SPINE} SELECT account_id, SUM(eod_cents * apy_pct / 100.0 / 365) AS raw_interest
    FROM running GROUP BY account_id, apy_pct ORDER BY account_id ASC`);
  // TS mirror of the engine's float ops, day by day
  const txns: Record<number, Array<[string, number]>> = {
    1: [["2026-09-01", 200000], ["2026-09-15", -50000], ["2026-09-20", 30000]],
    2: [["2026-09-05", 80000], ["2026-09-10", 120000], ["2026-09-10", -120000], ["2026-09-25", -20000]],
    3: [["2026-09-15", 150000]],
  };
  const apys: Record<number, number> = { 1: 4.0, 2: 3.5, 3: 5.0 };
  const expects = [606, 188, 329];
  const centDayExpects = [5530000, 1960000, 2400000];
  for (let a = 1; a <= 3; a++) {
    let tsSum = 0, centDays = 0;
    for (let i = 0; i < 30; i++) {
      const day = `2026-09-${String(i + 1).padStart(2, "0")}`;
      let eod = 0;
      for (const [td, amt] of txns[a]) if (td <= day) eod += amt;
      centDays += eod;
      tsSum += (eod * apys[a]) / 100.0 / 365;
    }
    ok(`A${a} cent-days hand total === ${centDayExpects[a - 1]}`, centDays === centDayExpects[a - 1], String(centDays));
    ok(`A${a} TS float mirror within 1e-9 of the engine's raw sum`,
      Math.abs(((raw[a - 1][1]) as number) - tsSum) < 1e-9,
      `${raw[a - 1][1]} vs ${tsSum}`);
    ok(`A${a} hand closed-form within 1e-9 of the TS mirror`,
      Math.abs(tsSum - (centDays * apys[a]) / 100.0 / 365) < 1e-9, String(tsSum));
    ok(`A${a} Math.round(tsSum) === ${expects[a - 1]}`, Math.round(tsSum) === expects[a - 1], String(Math.round(tsSum)));
    ok(`A${a} engine raw sum rounds to ${expects[a - 1]}`,
      Math.round(raw[a - 1][1] as number) === expects[a - 1], String(raw[a - 1][1]));
  }
  ok("end balances equal SUM(amount_cents) straight from the ledger",
    eq(runSql(db, `SELECT account_id, SUM(amount_cents) FROM ledger GROUP BY account_id ORDER BY account_id ASC`),
      [[1, 180000], [2, 60000], [3, 150000]]));
  db.close();
}

/* ---------- planted-trap probes: the WRONG queries must produce the documented wrong outputs ---------- */
console.log("\n=== planted-trap probes ===");

// D1 traps
{
  const db = buildDb(SQL_DF_MARKETS_A[0]);
  const RATES = (dir: string, gate: boolean) => `WITH latest_rates AS (
      SELECT currency, rate_date, usd_per_unit,
        ROW_NUMBER() OVER (PARTITION BY currency ORDER BY rate_date ${dir}) AS rn
      FROM fx_rates${gate ? " WHERE rate_date <= '2026-10-01'" : ""})
    SELECT a.account_id, a.currency, CAST(ROUND(a.balance_minor * r.usd_per_unit) AS INTEGER) AS usd_value_cents
    FROM accounts a JOIN latest_rates r ON r.currency = a.currency AND r.rn = 1
    ORDER BY a.account_id ASC`;
  ok("D1 dropping the as-of gate lets the FUTURE 2026-10-05 EUR rate drive: Frankfurt 295250, Paris 51669",
    eq(runSql(db, RATES("DESC", false)),
      [[1, "EUR", 295250], [2, "GBP", 119349], [3, "CAD", 362000], [4, "USD", 125000], [5, "EUR", 51669]]));
  ok("D1 MIN(rate_date) (oldest row) drives the stale 1.1640 EUR rate: Frankfurt 291000, Paris 50925",
    eq(runSql(db, RATES("ASC", true)),
      [[1, "EUR", 291000], [2, "GBP", 119349], [3, "CAD", 362000], [4, "USD", 125000], [5, "EUR", 50925]]));
  ok("D1 join without the currency equality fans out to 25 rows (5 accounts x 5 gate-surviving rates)",
    eq(runSql(db, `SELECT COUNT(*) AS rows_out FROM accounts a
        JOIN fx_rates r ON r.rate_date <= '2026-10-01'`),
      [[25]]));
  ok("D1 two-step integer-division scale slip truncates Paris (43750/100 = 437): 51216, not 51275",
    eq(runSql(db, `WITH latest_rates AS (
        SELECT currency, usd_per_unit, ROW_NUMBER() OVER (PARTITION BY currency ORDER BY rate_date DESC) AS rn
        FROM fx_rates WHERE rate_date <= '2026-10-01')
      SELECT a.account_id, CAST(ROUND((a.balance_minor / 100) * r.usd_per_unit * 100) AS INTEGER) AS usd_value_cents
      FROM accounts a JOIN latest_rates r ON r.currency = a.currency AND r.rn = 1
      ORDER BY a.account_id ASC`),
      [[1, 293000], [2, 119349], [3, 362000], [4, 125000], [5, 51216]]));
  ok("D1 global-latest join (2026-09-30 is a CAD row) leaves every non-CAD account unmatched: 1 row",
    eq(runSql(db, `SELECT a.account_id FROM accounts a
        JOIN fx_rates r ON r.currency = a.currency
          AND r.rate_date = (SELECT MAX(rate_date) FROM fx_rates WHERE rate_date <= '2026-10-01')
        ORDER BY a.account_id ASC`),
      [[3]]));
  db.close();
}

// D2 traps
{
  const db = buildDb(SQL_DF_MARKETS_A[1]);
  const SCORED = (over: string) => `WITH weights AS (
      SELECT portfolio_id, 100.0 * market_value_cents / SUM(market_value_cents) ${over} AS w FROM positions),
    scored AS (SELECT portfolio_id, COUNT(*) AS positions, MAX(w) AS largest_w, SUM(w * w) AS hhi_raw
      FROM weights GROUP BY portfolio_id)
    SELECT portfolio_id, positions, ROUND(largest_w, 1) AS largest_pct,
      CAST(ROUND(hhi_raw) AS INTEGER) AS hhi,
      CASE WHEN hhi_raw > 2500 THEN 'concentrated' WHEN hhi_raw >= 1500 THEN 'moderate' ELSE 'diversified' END AS concentration
    FROM scored ORDER BY portfolio_id ASC`;
  ok("D2 0-1 fractional scale reads ~0.345 / 0.25 / 0.1364 — 10000x off the contract scale",
    (() => {
      const rows = runSql(db, `WITH weights AS (
          SELECT portfolio_id, market_value_cents * 1.0
              / SUM(market_value_cents) OVER (PARTITION BY portfolio_id) AS w FROM positions)
        SELECT portfolio_id, SUM(w * w) AS hhi_fraction FROM weights GROUP BY portfolio_id ORDER BY portfolio_id ASC`);
      const expect = [0.345, 0.25, 0.1364];
      return rows.length === 3 && rows.every((r, i) => Math.abs((r[1] as number) - expect[i]) < 1e-9);
    })());
  ok("D2 SUM(...) OVER () without PARTITION BY divides by 2250000: 681/494/17, all relabeled 'diversified'",
    eq(runSql(db, SCORED("OVER ()")),
      [[1, 4, 22.2, 681, "diversified"], [2, 4, 11.1, 494, "diversified"], [3, 8, 2.2, 17, "diversified"]]));
  ok("D2 >= 2500 boundary flip mislabels portfolio 2 'concentrated' (2500 exactly)",
    eq(runSql(db, SCORED("OVER (PARTITION BY portfolio_id)").replace(
      "WHEN hhi_raw > 2500 THEN 'concentrated'", "WHEN hhi_raw >= 2500 THEN 'concentrated'")),
      [[1, 4, 50.0, 3450, "concentrated"], [2, 4, 25.0, 2500, "concentrated"], [3, 8, 20.0, 1364, "diversified"]]));
  ok("D2 largest_pct against the whole-table denominator reads 22.2 / 11.1 / 2.2, not 50.0 / 25.0 / 20.0",
    eq(runSql(db, `WITH weights AS (
        SELECT portfolio_id, 100.0 * market_value_cents
            / SUM(market_value_cents) OVER (PARTITION BY portfolio_id) AS w FROM positions),
      scored AS (SELECT portfolio_id, COUNT(*) AS positions, SUM(w * w) AS hhi_raw
        FROM weights GROUP BY portfolio_id),
      books AS (SELECT portfolio_id, MAX(market_value_cents) AS max_mv FROM positions GROUP BY portfolio_id)
      SELECT s.portfolio_id, s.positions,
        ROUND(100.0 * b.max_mv / (SELECT SUM(market_value_cents) FROM positions), 1) AS largest_pct,
        CAST(ROUND(s.hhi_raw) AS INTEGER) AS hhi,
        CASE WHEN s.hhi_raw > 2500 THEN 'concentrated' WHEN s.hhi_raw >= 1500 THEN 'moderate' ELSE 'diversified' END AS concentration
      FROM scored s JOIN books b ON b.portfolio_id = s.portfolio_id ORDER BY s.portfolio_id ASC`),
      [[1, 4, 22.2, 3450, "concentrated"], [2, 4, 11.1, 2500, "moderate"], [3, 8, 2.2, 1364, "diversified"]]));
  db.close();
}

// D3 traps
{
  const db = buildDb(SQL_DF_MARKETS_A[2]);
  const SPINE = `WITH RECURSIVE days(d) AS (
      SELECT '2026-09-01' UNION ALL SELECT date(d, '+1 day') FROM days WHERE d < '2026-09-30'),
    daily_net AS (SELECT account_id, txn_date AS d, SUM(amount_cents) AS net_cents
      FROM ledger GROUP BY account_id, txn_date),
    balance_days AS (SELECT a.account_id, a.apy_pct, days.d, COALESCE(n.net_cents, 0) AS net_cents
      FROM accounts a CROSS JOIN days LEFT JOIN daily_net n ON n.account_id = a.account_id AND n.d = days.d)`;
  ok("D3 per-txn accrual (no spine) drops silent days AND double-counts the 09-10 pair: 58 / 40 / 21",
    eq(runSql(db, `WITH flow AS (SELECT account_id, txn_date, amount_cents,
          SUM(amount_cents) OVER (PARTITION BY account_id ORDER BY txn_date, rowid) AS bal_after FROM ledger)
      SELECT f.account_id, CAST(ROUND(SUM(f.bal_after * a.apy_pct / 100.0 / 365)) AS INTEGER) AS interest_cents
      FROM flow f JOIN accounts a ON a.account_id = f.account_id
      GROUP BY f.account_id, a.apy_pct ORDER BY f.account_id ASC`),
      [[1, 58], [2, 40], [3, 21]]));
  ok("D3 accrual on the OPENING (prior-EOD) balance shifts day 1 to 0: 586 / 182 / 308",
    eq(runSql(db, `${SPINE}, running AS (SELECT account_id, apy_pct, d,
        SUM(net_cents) OVER (PARTITION BY account_id ORDER BY d
          ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS open_cents FROM balance_days)
      SELECT account_id, CAST(ROUND(SUM(COALESCE(open_cents, 0) * apy_pct / 100.0 / 365)) AS INTEGER) AS interest_cents
      FROM running GROUP BY account_id, apy_pct ORDER BY account_id ASC`),
      [[1, 586], [2, 182], [3, 308]]));
  ok("D3 360-day banker's year inflates every total: 614 / 191 / 333",
    eq(runSql(db, `${SPINE}, running AS (SELECT account_id, apy_pct, d,
        SUM(net_cents) OVER (PARTITION BY account_id ORDER BY d) AS eod_cents FROM balance_days)
      SELECT account_id, CAST(ROUND(SUM(eod_cents * apy_pct / 100.0 / 360)) AS INTEGER) AS interest_cents
      FROM running GROUP BY account_id, apy_pct ORDER BY account_id ASC`),
      [[1, 614], [2, 191], [3, 333]]));
  ok("D3 daily ROUND instead of the single end-round drifts: 608 / 196 / 336",
    eq(runSql(db, `${SPINE}, running AS (SELECT account_id, apy_pct, d,
        SUM(net_cents) OVER (PARTITION BY account_id ORDER BY d) AS eod_cents FROM balance_days)
      SELECT account_id, CAST(SUM(ROUND(eod_cents * apy_pct / 100.0 / 365)) AS INTEGER) AS interest_cents
      FROM running GROUP BY account_id, apy_pct ORDER BY account_id ASC`),
      [[1, 608], [2, 196], [3, 336]]));
  ok("D3 no spine (accrue on ledger dates only) collapses the carry: 58 / 21 / 21 — A3 loses 15 earning days",
    eq(runSql(db, `WITH dated AS (SELECT account_id, txn_date AS d, SUM(amount_cents) AS net_cents
          FROM ledger GROUP BY account_id, txn_date),
      running AS (SELECT account_id, d,
        SUM(net_cents) OVER (PARTITION BY account_id ORDER BY d) AS eod_cents FROM dated)
      SELECT r.account_id, CAST(ROUND(SUM(r.eod_cents * a.apy_pct / 100.0 / 365)) AS INTEGER) AS interest_cents
      FROM running r JOIN accounts a ON a.account_id = r.account_id
      GROUP BY r.account_id, a.apy_pct ORDER BY r.account_id ASC`),
      [[1, 58], [2, 21], [3, 21]]));
  db.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log(`ALL CHECKS PASS ${SQL_DF_MARKETS_A.length}/3`);
