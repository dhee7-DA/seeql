// Task 72-b4 self-check — sql-df-ledger.ts (3 Finance Core dives).
// bun scripts/tmp-72-b4-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_LEDGER } from "../src/lib/leetcode/content/sql-df-ledger";
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

/* ---------- spec ---------- */
// Pinned output contracts (verified against the engine; see per-cell asserts).
const SPEC: Array<{ slug: string; xp: number; columns: string[]; rows: unknown[][] }> = [
  { slug: "settlement-fails-aging", xp: 20,
    columns: ["fail_bucket", "fails", "fail_value_c"],
    rows: [["1-3 days", 1, 525000], ["4-7 days", 1, 500000], ["8+ days", 1, 300000]] },
  { slug: "realized-pnl-average-cost", xp: 35,
    columns: ["account_id", "symbol", "realized_pnl_c"],
    rows: [[101, "AAPL", 13200], [102, "MSFT", -2139]] },
  { slug: "gl-reconciliation", xp: 20,
    columns: ["account", "ledger_net_c", "system_balance_c", "delta_c"],
    rows: [["cash_payroll", 22000, 20000, 2000], ["accounts_payable", -8300, -8000, -300]] },
];

// related slugs may ONLY come from the lead-verified pool for this batch.
const RELATED_POOL = new Set([
  "odd-and-even-transactions", "year-on-year-growth-rate", "customer-purchasing-behavior-analysis",
  "bank-account-summary-ii", "npv-queries", "seasonal-sales-analysis", "calculate-product-final-price",
  "analyze-subscription-conversion", "find-overbooked-employees", "calculate-orders-within-each-interval",
]);
const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));

console.log(`\n=== sql-df-ledger.ts — ${SQL_DF_LEDGER.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_LEDGER.length === 3 && SPEC.every((s, i) => SQL_DF_LEDGER[i]?.slug === s.slug),
  SQL_DF_LEDGER.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_LEDGER[i];
  const spec = SPEC[i];
  console.log(`\n--- dive ${i + 1}: ${d.slug} ---`);

  // statement count + result-level ORDER BY
  ok("exactly ONE statement (countStatements)", countStatements(d.code) === 1);
  ok("exactly ONE statement (splitStatements)", splitStatements(d.code).length === 1);
  const stripped = stripOver(stripComments(d.code));
  ok("result-level ORDER BY after stripping comments/OVER spans", /order\s+by/i.test(stripped));
  ok('order === "exact"', d.order === "exact");
  ok(`xp === ${spec.xp}`, d.xp === spec.xp);
  ok("no writeVerify (read-only problem)", (d as unknown as Record<string, unknown>).writeVerify === undefined);
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
  ok("2 examples with input+output",
    d.examples.length === 2 && d.examples.every((e) => e.input.trim() && e.output.trim()));
  ok("at least one example carries an explanation", d.examples.some((e) => (e.explanation ?? "").trim()));
  ok("2-4 constraints", d.constraints.length >= 2 && d.constraints.length <= 4);
  ok("exactly 3 breakdown paragraphs", d.breakdown.length === 3);
  d.breakdown.forEach((p, j) =>
    ok(`breakdown para ${j + 1} has >= 3 sentences (got ${sentenceCount(p)})`, sentenceCount(p) >= 3));
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
  ok("2-3 related slugs", (d.related?.length ?? 0) >= 2 && (d.related?.length ?? 0) <= 3);
  d.related?.forEach((r) => {
    ok(`related slug from the verified pool: ${r}`, RELATED_POOL.has(r));
    ok(`related slug exists in the registry: ${r}`, LC_SLUGS.has(r));
  });
  ok(`schema.tables has one entry per DDL table (${tableCount(d.schema.ddl)})`,
    (d.schema.tables?.length ?? 0) === tableCount(d.schema.ddl));

  // hygiene: backticks / ${ / platform mention in any dive string
  const strs = allStrings(d);
  ok("no backticks in any string", strs.every((s) => !s.includes("`")));
  ok("no ${ in any string", strs.every((s) => !s.includes("${")));
  ok("no platform mention in any string", strs.every((s) => !/leetcode/i.test(s)));

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
    ok("rows === spec (order-sensitive, whole-array)",
      eq(r1, spec.rows), JSON.stringify(r1));
    ok("every money/count cell is an integer",
      r1.every((row) => row.every((cell) => typeof cell !== "number" || Number.isInteger(cell))));
  } catch (e) {
    ok("engine build+run", false, String(e));
  }
}

/* ---------- realized P&L: per-sell hand verification ---------- */
console.log("\n=== realized P&L — per-sell arithmetic, hand-verified ===");
{
  const d = SQL_DF_LEDGER[1];
  const db = buildDb(d);
  // same windows as the solution, but row-level: one row per sell, in replay order
  const rows = runSql(db, `WITH flow AS (
      SELECT account_id, symbol, side, qty, price_cents, seq,
          SUM(CASE WHEN side = 'buy' THEN qty ELSE 0 END) OVER (PARTITION BY account_id, symbol ORDER BY seq) AS cum_buy_qty,
          SUM(CASE WHEN side = 'buy' THEN qty * price_cents ELSE 0 END) OVER (PARTITION BY account_id, symbol ORDER BY seq) AS cum_buy_cost
      FROM trades)
    SELECT account_id, seq, qty, cum_buy_qty, cum_buy_cost,
        qty * price_cents - qty * (cum_buy_cost * 1.0 / cum_buy_qty) AS realized
    FROM flow WHERE side = 'sell' ORDER BY account_id, seq`);
  ok("four sell rows, in (account, seq) replay order", rows.length === 4 &&
    eq(rows.map((r) => [r[0], r[1]]), [[101, 50], [101, 90], [102, 40], [102, 80]]), JSON.stringify(rows.map((r) => [r[0], r[1]])));
  // HAND-CHECK (account 101, seq 50): buys so far 100@1000 + 100@1100 → avg = 210000/200 = 1050;
  // realized = 80×1200 − 80×1050 = 96000 − 84000 = 12000
  ok("101 seq 50 realized === 12000 (hand: 80*1200 - 80*(210000/200) = 96000 - 84000)",
    eq(rows[0][5], 12000), JSON.stringify(rows[0][5]));
  // HAND-CHECK (account 101, seq 90): buys so far +50@1150 → 267500/250 = 1070;
  // realized = 60×1090 − 60×1070 = 65400 − 64200 = 1200
  ok("101 seq 90 realized === 1200 (hand: 60*1090 - 60*(267500/250) = 65400 - 64200)",
    eq(rows[1][5], 1200), JSON.stringify(rows[1][5]));
  // HAND-CHECK (account 102, seq 40): buys so far 50@500 → avg 500;
  // realized = 30×450 − 30×500 = 13500 − 15000 = −1500
  ok("102 seq 40 realized === -1500 (hand: 30*450 - 30*(25000/50))",
    eq(rows[2][5], -1500), JSON.stringify(rows[2][5]));
  // HAND-CHECK (account 102, seq 80): buys so far 50@500 + 40@400 → 41000/90 = 455.555... (float);
  // realized = 25×430 − 25×455.555... = 10750 − 11388.888... = −638.888... (exactly −57500/90 as a rational)
  const engineVal = rows[3][5] as number;
  const tsVal = 10750 - 25 * (41000 / 90); // identical double ops to the engine expression
  ok("102 seq 80 realized matches the engine's double arithmetic exactly",
    eq(engineVal, tsVal), `${engineVal} vs ${tsVal}`);
  ok("102 seq 80 realized is −57500/90 within 1e-9 (≈ −638.8889, never a .5 tie)",
    Math.abs(engineVal - (-57500 / 90)) < 1e-9, String(engineVal));
  // end-round: −1500 + (−638.888...) = −2138.888... → ROUND half-away-from-zero → −2139
  ok("final 102 total: CAST(ROUND(−1500 + tsVal)) === −2139 (round fires ONCE)",
    Math.round(-1500 + tsVal) === -2139, String(Math.round(-1500 + tsVal)));
  db.close();
}

/* ---------- planted-trap probes: the WRONG queries must produce the documented wrong outputs ---------- */
console.log("\n=== planted-trap probes ===");
const probe = (label: string, cond: boolean, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; failures.push(label + (detail ? ` — ${detail}` : "")); console.log(`  FAIL  ${label}${detail ? " — " + detail : ""}`); }
};

// D1 traps
{
  const db = buildDb(SQL_DF_LEDGER[0]);
  const base = `WITH settle AS (SELECT qty, price_cents, settled, date(trade_date, '+2 day') AS settle_date FROM trades),
    aged AS (SELECT qty, price_cents, CAST(julianday('2026-10-01') - julianday(settle_date) AS INTEGER) AS late_days
      FROM settle WHERE %COND%)
    SELECT CASE WHEN late_days BETWEEN 1 AND 3 THEN '1-3 days' WHEN late_days BETWEEN 4 AND 7 THEN '4-7 days'
        ELSE '8+ days' END AS fail_bucket, COUNT(*) AS fails, SUM(qty * price_cents) AS fail_value_c
    FROM aged GROUP BY fail_bucket ORDER BY CASE fail_bucket WHEN '1-3 days' THEN 1 WHEN '4-7 days' THEN 2 ELSE 3 END`;
  probe("D1 dropping settled = 0 ships settled trade 8 (840000c) and the settled rows: 3,085,000 in '1-3 days'",
    eq(runSql(db, base.replace("%COND%", "settle_date < '2026-10-01'")),
      [["1-3 days", 3, 3085000], ["4-7 days", 3, 4920000], ["8+ days", 1, 300000]]));
  probe("D1 dropping the as-of gate pulls not-yet-due trades 6/7/9 into '8+ days' (4 fails, 1,461,000)",
    eq(runSql(db, base.replace("%COND%", "settled = 0")),
      [["1-3 days", 1, 525000], ["4-7 days", 1, 500000], ["8+ days", 4, 1461000]]));
  probe("D1 alphabetical ORDER BY happens to agree on THESE labels (documented coincidence)",
    eq(runSql(db, `WITH settle AS (SELECT qty, price_cents, settled, date(trade_date, '+2 day') AS settle_date FROM trades),
        aged AS (SELECT qty, price_cents, CAST(julianday('2026-10-01') - julianday(settle_date) AS INTEGER) AS late_days
          FROM settle WHERE settled = 0 AND settle_date < '2026-10-01')
        SELECT CASE WHEN late_days BETWEEN 1 AND 3 THEN '1-3 days' WHEN late_days BETWEEN 4 AND 7 THEN '4-7 days'
            ELSE '8+ days' END AS fail_bucket, COUNT(*) AS fails, SUM(qty * price_cents) AS fail_value_c
        FROM aged GROUP BY fail_bucket ORDER BY fail_bucket`),
      [["1-3 days", 1, 525000], ["4-7 days", 1, 500000], ["8+ days", 1, 300000]]));
  db.close();
}
// D2 traps
{
  const db = buildDb(SQL_DF_LEDGER[1]);
  probe("D2 sells-also-count rewrite contaminates averages: 101 → 7987, 102 → −1438 (ROUND(−1437.5) = −1438, half away from zero)",
    eq(runSql(db, `WITH flow AS (SELECT account_id, symbol, side, qty, price_cents,
          SUM(qty) OVER (PARTITION BY account_id, symbol ORDER BY seq) AS cq,
          SUM(qty * price_cents) OVER (PARTITION BY account_id, symbol ORDER BY seq) AS cc FROM trades), r AS (
        SELECT account_id, symbol, qty * price_cents - qty * (cc * 1.0 / cq) AS realized FROM flow WHERE side = 'sell')
      SELECT account_id, symbol, CAST(ROUND(SUM(realized)) AS INTEGER) AS pnl
      FROM r GROUP BY account_id, symbol ORDER BY account_id`),
      [[101, "AAPL", 7987], [102, "MSFT", -1438]]));
  probe("D2 integer-division rewrite truncates 41000/90 to 455: 102 → −2125, not −2139",
    eq(runSql(db, `WITH flow AS (SELECT account_id, symbol, side, qty, price_cents,
          SUM(CASE WHEN side = 'buy' THEN qty ELSE 0 END) OVER (PARTITION BY account_id, symbol ORDER BY seq) AS cum_buy_qty,
          SUM(CASE WHEN side = 'buy' THEN qty * price_cents ELSE 0 END) OVER (PARTITION BY account_id, symbol ORDER BY seq) AS cum_buy_cost
        FROM trades), r AS (
        SELECT account_id, symbol, qty * price_cents - qty * (cum_buy_cost / cum_buy_qty) AS realized FROM flow WHERE side = 'sell')
      SELECT account_id, symbol, CAST(ROUND(SUM(realized)) AS INTEGER) AS pnl
      FROM r GROUP BY account_id, symbol ORDER BY account_id`),
      [[101, "AAPL", 13200], [102, "MSFT", -2125]]));
  probe("D2 per-sell ROUND happens to agree on this seed (101 → 13200, 102 → −2139) — the contract still pins the end-round",
    eq(runSql(db, `WITH flow AS (SELECT account_id, symbol, side, qty, price_cents,
          SUM(CASE WHEN side = 'buy' THEN qty ELSE 0 END) OVER (PARTITION BY account_id, symbol ORDER BY seq) AS cum_buy_qty,
          SUM(CASE WHEN side = 'buy' THEN qty * price_cents ELSE 0 END) OVER (PARTITION BY account_id, symbol ORDER BY seq) AS cum_buy_cost
        FROM trades), r AS (
        SELECT account_id, symbol, ROUND(qty * price_cents - qty * (cum_buy_cost * 1.0 / cum_buy_qty)) AS realized FROM flow WHERE side = 'sell')
      SELECT account_id, symbol, CAST(SUM(realized) AS INTEGER) AS pnl
      FROM r GROUP BY account_id, symbol ORDER BY account_id`),
      [[101, "AAPL", 13200], [102, "MSFT", -2139]]));
  probe("D2 dropping WHERE side = 'sell' books phantom buy realizations: 101 → 22200, 102 → −4125",
    eq(runSql(db, `WITH flow AS (SELECT account_id, symbol, side, qty, price_cents,
          SUM(CASE WHEN side = 'buy' THEN qty ELSE 0 END) OVER (PARTITION BY account_id, symbol ORDER BY seq) AS cum_buy_qty,
          SUM(CASE WHEN side = 'buy' THEN qty * price_cents ELSE 0 END) OVER (PARTITION BY account_id, symbol ORDER BY seq) AS cum_buy_cost
        FROM trades), r AS (
        SELECT account_id, symbol, qty * price_cents - qty * (cum_buy_cost * 1.0 / cum_buy_qty) AS realized FROM flow)
      SELECT account_id, symbol, CAST(ROUND(SUM(realized)) AS INTEGER) AS pnl
      FROM r GROUP BY account_id, symbol ORDER BY account_id`),
      [[101, "AAPL", 22200], [102, "MSFT", -4125]]));
  db.close();
}
// D3 traps
{
  const db = buildDb(SQL_DF_LEDGER[2]);
  probe("D3 forgetting WHERE delta_c <> 0 ships all five accounts (zeros tie-broken by name)",
    eq(runSql(db, `WITH ledger AS (SELECT account, SUM(debit_c) - SUM(credit_c) AS ledger_net_c FROM journal GROUP BY account),
        compared AS (SELECT ledger.account, ledger.ledger_net_c, s.balance_c AS system_balance_c,
          ledger.ledger_net_c - s.balance_c AS delta_c FROM ledger JOIN system_balance s ON s.account = ledger.account)
      SELECT account, ledger_net_c, system_balance_c, delta_c FROM compared
      ORDER BY ABS(delta_c) DESC, account ASC`),
      [["cash_payroll", 22000, 20000, 2000], ["accounts_payable", -8300, -8000, -300],
       ["accounts_receivable", 15000, 15000, 0], ["cash_main", 45000, 45000, 0], ["fees_income", -32500, -32500, 0]]));
  probe("D3 credit-minus-debit sign flip fails every cell: all five accounts report as breaks",
    eq(runSql(db, `WITH ledger AS (SELECT account, SUM(credit_c) - SUM(debit_c) AS ledger_net_c FROM journal GROUP BY account),
        compared AS (SELECT ledger.account, ledger.ledger_net_c, s.balance_c AS system_balance_c,
          ledger.ledger_net_c - s.balance_c AS delta_c FROM ledger JOIN system_balance s ON s.account = ledger.account)
      SELECT account, ledger_net_c, system_balance_c, delta_c FROM compared WHERE delta_c <> 0
      ORDER BY ABS(delta_c) DESC, account ASC`),
      [["cash_main", -45000, 45000, -90000], ["fees_income", 32500, -32500, 65000],
       ["cash_payroll", -22000, 20000, -42000], ["accounts_receivable", -15000, 15000, -30000],
       ["accounts_payable", 8300, -8000, 16300]]));
  db.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log(`ALL CHECKS PASS ${SQL_DF_LEDGER.length}/3`);
