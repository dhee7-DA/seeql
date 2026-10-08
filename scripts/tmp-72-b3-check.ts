// Task 72-b3 self-check — sql-df-money.ts (Finance Core money file, 3 dives).
// bun scripts/tmp-72-b3-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_MONEY } from "../src/lib/leetcode/content/sql-df-money";
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

/* ---------- related-slug pool (verified, from the task spec) ---------- */
const RELATED_POOL = new Set([
  "odd-and-even-transactions", "seasonal-sales-analysis", "year-on-year-growth-rate",
  "customer-purchasing-behavior-analysis", "analyze-organization-hierarchy", "restaurant-growth",
  "rolling-average-steps", "find-overbooked-employees", "calculate-product-final-price",
  "npv-queries", "bank-account-summary-ii", "analyze-subscription-conversion",
]);
const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));

/* ---------- spec: engine-verified snapshots ---------- */
const SPEC: Array<{ slug: string; xp: number; columns: string[]; rows: unknown[][] }> = [
  {
    slug: "loan-amortization-schedule", xp: 20,
    columns: ["loan_id", "month_no", "interest_cents", "principal_cents", "ending_balance_cents"],
    rows: [
      [1, 1, 600, 9730, 110270], [1, 2, 551, 9779, 100491], [1, 3, 502, 9828, 90663],
      [1, 4, 453, 9877, 80786], [1, 5, 404, 9926, 70860], [1, 6, 354, 9976, 60884],
      [1, 7, 304, 10026, 50858], [1, 8, 254, 10076, 40782], [1, 9, 204, 10126, 30656],
      [1, 10, 153, 10177, 20479], [1, 11, 102, 10228, 10251], [1, 12, 51, 10251, 0],
      [2, 1, 0, 8334, 41666], [2, 2, 0, 8334, 33332], [2, 3, 0, 8334, 24998],
      [2, 4, 0, 8334, 16664], [2, 5, 0, 8334, 8330], [2, 6, 0, 8330, 0],
    ],
  },
  {
    slug: "delinquency-buckets", xp: 10,
    columns: ["loan_id", "dpd_bucket"],
    rows: [[1, "current"], [2, "current"], [3, "1-30"], [4, "31-60"], [5, "61-90"], [6, "90+"]],
  },
  {
    slug: "portfolio-weights", xp: 10,
    columns: ["account_id", "symbol", "market_value_c", "weight_pct"],
    rows: [
      [1, "AAPL", 790000, 49.62], [1, "MSFT", 498000, 31.28], [1, "NVDA", 304000, 19.1],
      [2, "XOM", 2178000, 40.9], [2, "JNJ", 1407600, 26.43], [2, "PG", 955500, 17.94],
      [2, "TSCO", 784500, 14.73],
    ],
  },
];

console.log(`\n=== sql-df-money.ts — ${SQL_DF_MONEY.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_MONEY.length === 3 && SPEC.every((s, i) => SQL_DF_MONEY[i]?.slug === s.slug),
  SQL_DF_MONEY.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_MONEY[i];
  const spec = SPEC[i];
  console.log(`\n--- dive ${i + 1}: ${d.slug} ---`);

  // single statement + result-level ORDER BY + grading shape
  ok("exactly ONE statement (countStatements)", countStatements(d.code) === 1);
  ok("exactly ONE statement (splitStatements)", splitStatements(d.code).length === 1);
  const stripped = stripOver(stripComments(d.code));
  ok("result-level ORDER BY after stripping comments/OVER spans", /order\s+by/i.test(stripped));
  ok('order === "exact"', d.order === "exact");
  ok(`xp === ${spec.xp}`, d.xp === spec.xp);
  ok("no writeVerify", (d as unknown as Record<string, unknown>).writeVerify === undefined);
  ok("approach is ONE line", !d.approach.includes("\n"));

  // trailing-semicolon + comment hygiene
  ok("ddl ends with ';' and nothing after", trailingSemicolonClean(d.schema.ddl));
  ok("seed ends with ';' and nothing after", trailingSemicolonClean(d.schema.seed));
  ok("code ends with ';' and nothing after", trailingSemicolonClean(d.code));
  ok("no ';' inside comments of ddl/seed/code",
    noSemiInComments(d.schema.ddl) && noSemiInComments(d.schema.seed) && noSemiInComments(d.code));

  // quality-bar structure
  ok("statement has 3-6 sentences", sentenceCount(d.statement) >= 3 && sentenceCount(d.statement) <= 6,
    String(sentenceCount(d.statement)));
  ok("2 examples with input+output, >=1 explanation",
    d.examples.length === 2 && d.examples.every((e) => e.input.trim() && e.output.trim()) &&
    d.examples.some((e) => (e.explanation ?? "").trim()));
  ok("2-4 constraints", d.constraints.length >= 2 && d.constraints.length <= 4, String(d.constraints.length));
  ok("3 breakdown paragraphs", d.breakdown.length === 3);
  d.breakdown.forEach((p, j) =>
    ok(`breakdown para ${j + 1} has 3-6 sentences (got ${sentenceCount(p)})`,
      sentenceCount(p) >= 3 && sentenceCount(p) <= 6));
  ok("3-5 edges", d.edges.length >= 3 && d.edges.length <= 5, String(d.edges.length));
  d.edges.forEach((e, j) => ok(`edge ${j + 1} has >= 1 sentence`, sentenceCount(e) >= 1));
  ok("3 ladder rungs, bodies >= 2 sentences",
    d.ladder.length === 3 && d.ladder.every((r) => r.title.trim() && sentenceCount(r.body) >= 2));
  ok("3 walkthrough paragraphs", d.walkthrough.length === 3);
  d.walkthrough.forEach((p, j) =>
    ok(`walkthrough para ${j + 1} has >= 3 sentences (got ${sentenceCount(p)})`, sentenceCount(p) >= 3));
  ok("2-3 followUps", (d.followUps?.length ?? 0) >= 2 && (d.followUps?.length ?? 0) <= 3);
  ok("2-3 related", (d.related?.length ?? 0) >= 2 && (d.related?.length ?? 0) <= 3);
  d.related?.forEach((r) => {
    ok(`related slug in verified pool: ${r}`, RELATED_POOL.has(r));
    ok(`related slug registered in LC_ALL: ${r}`, LC_SLUGS.has(r));
  });
  ok("schema.tables note present", (d.schema.tables?.length ?? 0) >= 1);

  // hygiene: backticks / ${ / platform mention in any dive string
  const strs = allStrings(d);
  ok("no backticks in any string", strs.every((s) => !s.includes("`")));
  ok("no ${ in any string", strs.every((s) => !s.includes("${")));
  ok("no platform mention in any string", strs.every((s) => !/leetcode/i.test(s)));

  // engine: build from ddl+seed, run solution TWICE, hard-assert columns + every cell + order
  try {
    const db = build(d);
    const r1 = runSql(db, d.code);
    const c1 = getCols(db, d.code);
    const r2 = runSql(db, d.code);
    db.close();
    ok("determinism: two runs identical", eq(r1, r2));
    ok(`columns === [${spec.columns.join(", ")}]`, eq(c1, spec.columns), JSON.stringify(c1));
    ok(`rows === ${spec.rows.length} cells exact (order-sensitive)`, eq(r1, spec.rows), JSON.stringify(r1));
  } catch (e) {
    ok("engine build+run", false, String(e));
  }
}

/* ---------- amortization closure: the schedule must close to 0 on the final month ---------- */
console.log("\n=== amortization closure (dive 1) ===");
{
  const d = SQL_DF_MONEY[0];
  try {
    const db = build(d);
    const rows = runSql(db, d.code) as number[][];
    const l1 = rows.filter((r) => r[0] === 1);
    const l2 = rows.filter((r) => r[0] === 2);
    ok("loan 1 schedule is exactly 12 rows", l1.length === 12, String(l1.length));
    ok("loan 2 schedule is exactly 6 rows", l2.length === 6, String(l2.length));
    ok("loan 1 months run 1..term (no phantom month 13)", Math.max(...l1.map((r) => r[1])) === 12);
    ok("loan 2 months run 1..term (no phantom month 7)", Math.max(...l2.map((r) => r[1])) === 6);
    ok("loan 1 closes: final month ending_balance_cents = 0", l1[l1.length - 1][4] === 0);
    ok("loan 2 closes: final month ending_balance_cents = 0", l2[l2.length - 1][4] === 0);
    ok("loan 1 final row === [1, 12, 51, 10251, 0] (the cap bites)", eq(l1[l1.length - 1], [1, 12, 51, 10251, 0]));
    ok("loan 2 final row === [2, 6, 0, 8330, 0] (the cap bites)", eq(l2[l2.length - 1], [2, 6, 0, 8330, 0]));
    ok("loan 1 principal sums back to the 120000 principal",
      l1.reduce((a, r) => a + r[3], 0) === 120000, String(l1.reduce((a, r) => a + r[3], 0)));
    ok("loan 2 principal sums back to the 50000 principal",
      l2.reduce((a, r) => a + r[3], 0) === 50000, String(l2.reduce((a, r) => a + r[3], 0)));
    ok("loan 1 interest totals 3932 cents", l1.reduce((a, r) => a + r[2], 0) === 3932,
      String(l1.reduce((a, r) => a + r[2], 0)));
    ok("loan 2 interest totals 0 (the 0% path)", l2.reduce((a, r) => a + r[2], 0) === 0);
    ok("no ending_balance_cents ever goes negative",
      rows.every((r) => r[4] >= 0));
    db.close();
  } catch (e) {
    ok("amortization closure block", false, String(e));
  }
}

/* ---------- planted-trap probes: the WRONG queries must produce the documented wrong outputs ---------- */
console.log("\n=== planted-trap probes ===");
const probe = (label: string, cond: boolean, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; failures.push(label + (detail ? ` — ${detail}` : "")); console.log(`  FAIL  ${label}${detail ? " — " + detail : ""}`); }
};

// D1a: capping the PAYMENT instead of the principal strands a 51-cent balance -> phantom month 13
{
  const db = build(SQL_DF_MONEY[0]);
  const wrong = `WITH RECURSIVE w(loan_id, month_no, start_balance) AS (
    SELECT loan_id, 1, principal_cents FROM loans
    UNION ALL
    SELECT w.loan_id, w.month_no + 1,
      w.start_balance - (MIN(l.monthly_payment_cents, w.start_balance) - CAST(ROUND(w.start_balance * l.annual_rate_pct / 1200.0) AS INTEGER))
    FROM w JOIN loans l ON l.loan_id = w.loan_id
    WHERE w.start_balance - (MIN(l.monthly_payment_cents, w.start_balance) - CAST(ROUND(w.start_balance * l.annual_rate_pct / 1200.0) AS INTEGER)) > 0
  )
  SELECT COUNT(*) FROM w`;
  probe("D1a payment-cap variant emits a phantom 13th month (19 rows total)",
    runSql(db, wrong)[0][0] === 19, JSON.stringify(runSql(db, wrong)));
  const wrongM12 = `WITH RECURSIVE w(loan_id, month_no, start_balance) AS (
    SELECT loan_id, 1, principal_cents FROM loans
    UNION ALL
    SELECT w.loan_id, w.month_no + 1,
      w.start_balance - (MIN(l.monthly_payment_cents, w.start_balance) - CAST(ROUND(w.start_balance * l.annual_rate_pct / 1200.0) AS INTEGER))
    FROM w JOIN loans l ON l.loan_id = w.loan_id
    WHERE w.start_balance - (MIN(l.monthly_payment_cents, w.start_balance) - CAST(ROUND(w.start_balance * l.annual_rate_pct / 1200.0) AS INTEGER)) > 0
  )
  SELECT MIN(l.monthly_payment_cents, w.start_balance) - CAST(ROUND(w.start_balance * l.annual_rate_pct / 1200.0) AS INTEGER) AS principal
  FROM w JOIN loans l ON l.loan_id = w.loan_id WHERE w.loan_id = 1 AND w.month_no = 12`;
  probe("D1a payment-cap month 12 retires only 10200 (not 10251) and strands 51 cents",
    runSql(db, wrongM12)[0][0] === 10200, JSON.stringify(runSql(db, wrongM12)));

  // D1b: testing the START balance in the WHERE appends an all-zero month to each loan
  const wrongWhere = `WITH RECURSIVE w(loan_id, month_no, start_balance) AS (
    SELECT loan_id, 1, principal_cents FROM loans
    UNION ALL
    SELECT s.loan_id, s.month_no + 1,
      s.start_balance - MIN(l.monthly_payment_cents - CAST(ROUND(s.start_balance * l.annual_rate_pct / 1200.0) AS INTEGER), s.start_balance)
    FROM w s JOIN loans l ON l.loan_id = s.loan_id
    WHERE s.start_balance > 0
  )
  SELECT COUNT(*), MAX(month_no) FROM w`;
  const wb = runSql(db, wrongWhere)[0];
  probe("D1b start-balance WHERE appends an all-zero month per loan (20 rows, max month 13)",
    wb[0] === 20 && wb[1] === 13, JSON.stringify(wb));
  db.close();
}

// D2a: MAX(due_date) misreads loan 6 as '1-30'; D2b: dropping the due-date guard
// hands loan 1 a future MIN (dpd -4); D2c: INNER JOIN ships 4 rows; D2d: bottom-up CASE flattens buckets
{
  const db = build(SQL_DF_MONEY[1]);
  const maxVar = `WITH overdue AS (
      SELECT loan_id, MAX(due_date) AS newest_unpaid FROM loan_payments
      WHERE paid_date IS NULL AND due_date < '2026-10-01' GROUP BY loan_id),
    bucketed AS (
      SELECT loan_id, CAST(julianday('2026-10-01') - julianday(newest_unpaid) AS INTEGER) AS dpd FROM overdue)
    SELECT p.loan_id, COALESCE(CASE WHEN b.dpd >= 90 THEN '90+' WHEN b.dpd >= 61 THEN '61-90'
      WHEN b.dpd >= 31 THEN '31-60' WHEN b.dpd >= 1 THEN '1-30' END, 'current') AS dpd_bucket
    FROM (SELECT DISTINCT loan_id FROM loan_payments) p
    LEFT JOIN bucketed b ON b.loan_id = p.loan_id ORDER BY p.loan_id`;
  probe("D2a MAX(due_date) misreads loan 6 as '1-30' (and loan 4 down to '1-30')",
    eq(runSql(db, maxVar), [[1, "current"], [2, "current"], [3, "1-30"], [4, "1-30"], [5, "31-60"], [6, "1-30"]]),
    JSON.stringify(runSql(db, maxVar)));
  const noGuard = `SELECT loan_id, MIN(due_date) AS oldest,
      CAST(julianday('2026-10-01') - julianday(MIN(due_date)) AS INTEGER) AS dpd
    FROM loan_payments WHERE paid_date IS NULL GROUP BY loan_id ORDER BY loan_id`;
  probe("D2b dropping the due-date guard gives loan 1 a future MIN (2026-10-05, dpd -4)",
    eq(runSql(db, noGuard).slice(0, 2), [[1, "2026-10-05", -4], [3, "2026-09-11", 20]]),
    JSON.stringify(runSql(db, noGuard)));
  const innerJoin = `WITH overdue AS (
      SELECT loan_id, MIN(due_date) AS oldest_unpaid FROM loan_payments
      WHERE paid_date IS NULL AND due_date < '2026-10-01' GROUP BY loan_id),
    bucketed AS (
      SELECT loan_id, CAST(julianday('2026-10-01') - julianday(oldest_unpaid) AS INTEGER) AS dpd FROM overdue)
    SELECT p.loan_id, CASE WHEN b.dpd >= 90 THEN '90+' WHEN b.dpd >= 61 THEN '61-90'
      WHEN b.dpd >= 31 THEN '31-60' WHEN b.dpd >= 1 THEN '1-30' END AS dpd_bucket
    FROM (SELECT DISTINCT loan_id FROM loan_payments) p
    JOIN bucketed b ON b.loan_id = p.loan_id ORDER BY p.loan_id`;
  probe("D2c INNER JOIN ships only 4 rows (loans 1 and 2 lost)",
    eq(runSql(db, innerJoin), [[3, "1-30"], [4, "31-60"], [5, "61-90"], [6, "90+"]]),
    JSON.stringify(runSql(db, innerJoin)));
  const bottomUp = `WITH overdue AS (
      SELECT loan_id, MIN(due_date) AS oldest_unpaid FROM loan_payments
      WHERE paid_date IS NULL AND due_date < '2026-10-01' GROUP BY loan_id),
    bucketed AS (
      SELECT loan_id, CAST(julianday('2026-10-01') - julianday(oldest_unpaid) AS INTEGER) AS dpd FROM overdue)
    SELECT p.loan_id, COALESCE(CASE WHEN b.dpd >= 1 THEN '1-30' WHEN b.dpd >= 31 THEN '31-60'
      WHEN b.dpd >= 61 THEN '61-90' WHEN b.dpd >= 90 THEN '90+' END, 'current') AS dpd_bucket
    FROM (SELECT DISTINCT loan_id FROM loan_payments) p
    LEFT JOIN bucketed b ON b.loan_id = p.loan_id ORDER BY p.loan_id`;
  probe("D2d bottom-up CASE flattens every delinquent loan into '1-30' (loan 6's 100 included)",
    eq(runSql(db, bottomUp), [[1, "current"], [2, "current"], [3, "1-30"], [4, "1-30"], [5, "1-30"], [6, "1-30"]]),
    JSON.stringify(runSql(db, bottomUp)));
  db.close();
}

// D3a: GROUP BY collapses to 2 rows; D3b: integer division truncates AAPL to 49;
// D3c: OVER () without PARTITION BY borrows the grand total; D3d: weight-only order interleaves accounts
{
  const db = build(SQL_DF_MONEY[2]);
  probe("D3a GROUP BY account_id collapses to 2 rows",
    eq(runSql(db, `SELECT account_id, SUM(qty * last_price_cents) AS t FROM holdings GROUP BY account_id ORDER BY account_id`),
      [[1, 1592000], [2, 5325600]]));
  probe("D3b integer division truncates AAPL's weight to 49",
    runSql(db, `SELECT 100 * 790000 / 1592000`)[0][0] === 49);
  const bookWeight = `WITH valued AS (
      SELECT account_id, symbol, qty * last_price_cents AS market_value_c FROM holdings)
    SELECT account_id, symbol, ROUND(100.0 * market_value_c / SUM(market_value_c) OVER (), 2) AS w
    FROM valued ORDER BY account_id, symbol`;
  probe("D3c OVER () with no PARTITION BY borrows the 6917600 grand total (AAPL 11.42)",
    eq(runSql(db, bookWeight)[0], [1, "AAPL", 11.42]), JSON.stringify(runSql(db, bookWeight)[0]));
  const noLeadQ = `WITH valued AS (
      SELECT account_id, symbol, qty * last_price_cents AS market_value_c FROM holdings),
    account_total AS (
      SELECT account_id, symbol, market_value_c,
        SUM(market_value_c) OVER (PARTITION BY account_id) AS account_value_c FROM valued),
    weighted AS (
      SELECT account_id, symbol,
        ROUND(100.0 * market_value_c / account_value_c, 2) AS weight_pct FROM account_total)
    SELECT symbol FROM weighted ORDER BY weight_pct DESC`;
  probe("D3d weight-only ORDER interleaves the accounts (AAPL, XOM, MSFT, JNJ, ...)",
    eq(runSql(db, noLeadQ).map((r) => r[0]), ["AAPL", "XOM", "MSFT", "JNJ", "NVDA", "PG", "TSCO"]),
    JSON.stringify(runSql(db, noLeadQ)));
  db.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log("ALL CHECKS PASS 3/3");
