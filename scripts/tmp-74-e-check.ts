// Task 74-e self-check — sql-df-acct-a.ts (3 accounting-close dives, batch 3 with primers).
// bun scripts/tmp-74-e-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_ACCT_A } from "../src/lib/leetcode/content/sql-df-acct-a";
import type { LcSqlDive } from "../src/lib/leetcode/types";

let pass = 0, fail = 0;
const failures: string[] = [];
const ok = (label: string, cond: boolean, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; failures.push(label + (detail ? ` — ${detail}` : "")); console.log(`  FAIL  ${label}${detail ? " — " + detail : ""}`); }
};
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/* ---------- helpers (73-c protocol) ---------- */
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
  const p = d.primer;
  return [
    d.slug, d.statement, d.approach, d.code, d.time, d.space,
    ...d.examples.flatMap((e) => [e.input, e.output, e.explanation ?? ""]),
    ...d.constraints, ...d.breakdown, ...d.edges, ...d.walkthrough,
    ...d.followUps ?? [], ...d.related ?? [],
    ...d.ladder.flatMap((r) => [r.title, r.body]),
    d.schema.ddl, d.schema.seed, ...(d.schema.tables ?? []).flatMap((t) => [t.name, t.note]),
    ...(p ? [p.hook, p.where, ...p.concept, ...p.worked, ...p.glossary.flatMap((g) => [g.term, g.def]), ...p.reallife] : []),
  ];
};
const proseStrings = (d: LcSqlDive): string[] => {
  const p = d.primer;
  return [
    d.statement, d.approach, d.time, d.space,
    ...d.examples.flatMap((e) => [e.input, e.output, e.explanation ?? ""]),
    ...d.constraints, ...d.breakdown, ...d.edges, ...d.walkthrough,
    ...d.followUps ?? [], ...d.ladder.flatMap((r) => [r.title, r.body]),
    ...(d.schema.tables ?? []).map((t) => t.note),
    ...(p ? [p.hook, p.where, ...p.concept, ...p.worked, ...p.glossary.flatMap((g) => [g.term, g.def]), ...p.reallife] : []),
  ];
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
// Pinned output contracts (hand-derived, confirmed by the engine).
const SPEC: Array<{
  slug: string; id: number; difficulty: "Easy" | "Medium" | "Hard"; xp: number;
  columns: string[]; rows: unknown[][]; realColumns: string[]; intColumns: string[];
}> = [
  { slug: "trial-balance-check", id: 8037, difficulty: "Easy", xp: 10,
    columns: ["account_id", "account_name", "debit_total_cents", "credit_total_cents", "delta_cents", "balance_status"],
    rows: [
      [1, "cash", 575000, 575000, 0, "balanced"],
      [2, "sales_revenue", 30000, 600000, -570000, "credit balance"],
      [3, "accounts_payable", 0, 95000, -95000, "credit balance"],
      [4, "accounts_receivable", 260000, 140000, 120000, "debit balance"],
      [5, "payroll_expense", 202000, 200000, 2000, "debit balance"],
      [6, "inventory_clearing", 4700, 5000, -300, "credit balance"],
    ],
    realColumns: [], intColumns: ["account_id", "debit_total_cents", "credit_total_cents", "delta_cents"] },
  { slug: "ar-aging-schedule", id: 8038, difficulty: "Medium", xp: 20,
    columns: ["customer_id", "current_cents", "days_1_30_cents", "days_31_60_cents", "days_61_90_cents", "days_over_90_cents", "total_outstanding_cents"],
    rows: [
      [501, 90000, 60000, 45000, 30000, 25000, 250000],
      [502, 0, 0, 0, 0, 70000, 70000],
    ],
    realColumns: [],
    intColumns: ["customer_id", "current_cents", "days_1_30_cents", "days_31_60_cents", "days_61_90_cents", "days_over_90_cents", "total_outstanding_cents"] },
  { slug: "balance-rollforward", id: 8039, difficulty: "Medium", xp: 20,
    columns: ["account_id", "opening_cents", "debit_total_cents", "credit_total_cents", "closing_cents"],
    rows: [
      [1, 125000, 0, 0, 125000],
      [2, 40000, 85000, 30000, 95000],
      [3, 10000, 57000, 0, 67000],
      [4, 80000, 0, 36000, 44000],
      [5, 0, 70000, 25000, 45000],
    ],
    realColumns: [], intColumns: ["account_id", "opening_cents", "debit_total_cents", "credit_total_cents", "closing_cents"] },
];
const XP: Record<string, number> = { Easy: 10, Medium: 20, Hard: 35 };

// related slugs may ONLY come from the brief's verified pool.
const RELATED_POOL = new Set([
  "gl-reconciliation", "settlement-fails-aging", "delinquency-buckets", "loan-amortization-schedule",
  "portfolio-weights", "fx-exposure-report", "duplicate-charge-pairs", "realized-pnl-average-cost",
  "npv-queries", "calculate-product-final-price", "bank-account-summary-ii",
]);
const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));

console.log(`\n=== sql-df-acct-a.ts — ${SQL_DF_ACCT_A.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_ACCT_A.length === 3 && SPEC.every((s, i) => SQL_DF_ACCT_A[i]?.slug === s.slug),
  SQL_DF_ACCT_A.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_ACCT_A[i];
  const spec = SPEC[i];
  console.log(`\n--- dive ${i + 1}: ${d.slug} ---`);

  // statement count + result-level ORDER BY + read-only
  ok("exactly ONE statement (countStatements)", countStatements(d.code) === 1);
  ok("exactly ONE statement (splitStatements)", splitStatements(d.code).length === 1);
  ok("result-level ORDER BY present", /order\s+by/i.test(stripComments(d.code)));
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
  ok("3-4 constraints", d.constraints.length >= 3 && d.constraints.length <= 4);
  ok("exactly 3 breakdown paragraphs", d.breakdown.length === 3);
  d.breakdown.forEach((p, j) => {
    const c = sentenceCount(p);
    ok(`breakdown para ${j + 1} has 3-6 sentences (got ${c})`, c >= 3 && c <= 6);
  });
  ok("exactly 4 edges", d.edges.length === 4);
  d.edges.forEach((p, j) =>
    ok(`edge ${j + 1} has >= 1 full sentence (got ${sentenceCount(p)})`, sentenceCount(p) >= 1));
  ok("3 ladder rungs (title+body)", d.ladder.length === 3 && d.ladder.every((r) => r.title.trim() && r.body.trim()));
  d.ladder.forEach((r, j) =>
    ok(`ladder rung ${j + 1} body has >= 2 sentences (got ${sentenceCount(r.body)})`, sentenceCount(r.body) >= 2));
  ok("walkthrough: exactly 3 paragraphs", d.walkthrough.length === 3);
  d.walkthrough.forEach((p, j) =>
    ok(`walkthrough para ${j + 1} has >= 3 sentences (got ${sentenceCount(p)})`, sentenceCount(p) >= 3));
  ok("2-3 followUps", (d.followUps?.length ?? 0) >= 2 && (d.followUps?.length ?? 0) <= 3);
  ok("exactly 3 related slugs", d.related?.length === 3, String(d.related?.length));
  d.related?.forEach((r) => {
    ok(`related slug from the verified pool: ${r}`, RELATED_POOL.has(r));
    ok(`related slug exists in the registry: ${r}`, LC_SLUGS.has(r));
  });
  ok(`schema.tables has one entry per DDL table (${tableCount(d.schema.ddl)})`,
    (d.schema.tables?.length ?? 0) === tableCount(d.schema.ddl));

  // NEW in batch 3 — primer audits
  const p = d.primer;
  ok("dive carries a primer (batch-3 requirement)", !!p);
  if (p) {
    const hc = sentenceCount(p.hook);
    ok(`primer hook is exactly 1 sentence (got ${hc})`, hc === 1);
    ok("primer concept has 3-4 paragraphs", p.concept.length >= 3 && p.concept.length <= 4);
    p.concept.forEach((para, j) =>
      ok(`primer concept para ${j + 1} has >= 3 sentences (got ${sentenceCount(para)})`, sentenceCount(para) >= 3));
    ok("primer worked has 3-5 steps", p.worked.length >= 3 && p.worked.length <= 5);
    p.worked.forEach((step, j) => ok(`primer worked step ${j + 1} nonempty`, step.trim().length > 0));
    ok("primer glossary has 4-6 entries", p.glossary.length >= 4 && p.glossary.length <= 6);
    p.glossary.forEach((g, j) => {
      const words = g.def.trim().split(/\s+/).length;
      ok(`primer glossary ${j + 1} (${g.term}) def has >= 5 words (got ${words})`, words >= 5 && g.term.trim().length > 0);
    });
    ok("primer reallife has 2-3 paragraphs", p.reallife.length >= 2 && p.reallife.length <= 3);
    p.reallife.forEach((para, j) =>
      ok(`primer reallife para ${j + 1} has >= 3 sentences (got ${sentenceCount(para)})`, sentenceCount(para) >= 3));
    ok("primer where is nonempty and exactly 1 sentence",
      p.where.trim().length > 0 && sentenceCount(p.where) === 1, p.where);
  }

  // hygiene: backticks / ${ / platform mention / e.g.-i.e. in any dive string (primer included)
  const strs = allStrings(d);
  ok("no backticks in any string", strs.every((s) => !s.includes("`")));
  ok("no ${ in any string", strs.every((s) => !s.includes("${")));
  ok("no platform mention in any string",
    strs.every((s) => !/leetcode|hackerrank|datalemur|stratascratch/i.test(s)));
  ok('no "e.g."/"i.e." in prose (sentence heuristic safety)',
    proseStrings(d).every((s) => !/\be\.g\.|\bi\.e\./i.test(s)));

  // MONEY convention: every money column (input or output, name ending _cents/_minor)
  // is INTEGER in the DDL and declared-integer in the contract.
  const moneyOut = spec.columns.filter((c) => /(_cents|_minor)$/.test(c));
  ok("every *_cents/_minor output column is declared integer", moneyOut.every((c) => spec.intColumns.includes(c)));
  const ddlMoney = (d.schema.ddl.match(/^\s*(\w+_cents|\w+_minor)\s+(\w+)/gim) ?? [])
    .map((m) => m.trim().split(/\s+/));
  ok(`every *_cents/_minor DDL column is INTEGER (${ddlMoney.length} money columns)`,
    ddlMoney.length > 0 && ddlMoney.every((parts) => parts[1] === "INTEGER"), JSON.stringify(ddlMoney));
  ok("declared REAL columns appear in the output", spec.realColumns.every((c) => spec.columns.includes(c)));

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
console.log("\n=== trial-balance — seed integrity + hand sums ===");
{
  const d = SQL_DF_ACCT_A[0];
  const db = buildDb(d);
  ok("XOR integrity: no line has BOTH sides nonzero",
    eq(runSql(db, `SELECT COUNT(*) FROM journal_lines WHERE debit_cents > 0 AND credit_cents > 0`), [[0]]));
  ok("XOR integrity: no line has NEITHER side nonzero",
    eq(runSql(db, `SELECT COUNT(*) FROM journal_lines WHERE NOT (debit_cents > 0 OR credit_cents > 0)`), [[0]]));
  ok("per-account hand sums straight from the seed",
    eq(runSql(db, `SELECT account_id, SUM(debit_cents), SUM(credit_cents) FROM journal_lines
        GROUP BY account_id ORDER BY account_id ASC`),
      [[1, 575000, 575000], [2, 30000, 600000], [3, 0, 95000], [4, 260000, 140000], [5, 202000, 200000], [6, 4700, 5000]]));
  ok("grand totals 1071700 / 1615000 (the fanout probe's wrong cells)",
    eq(runSql(db, `SELECT SUM(debit_cents), SUM(credit_cents) FROM journal_lines`), [[1071700, 1615000]]));
  ok("account 7 has zero lines (the silent row)",
    eq(runSql(db, `SELECT COUNT(*) FROM journal_lines WHERE account_id = 7`), [[0]]));
  db.close();
}

console.log("\n=== ar-aging — julianday exactness + per-invoice hand grid ===");
{
  const d = SQL_DF_ACCT_A[1];
  const db = buildDb(d);
  ok("julianday date-only difference is EXACTLY 30.0 (an integer float)",
    (() => { const r = runSql(db, `SELECT julianday('2026-10-01') - julianday('2026-09-01')`); return r[0][0] === 30 && Number.isInteger(r[0][0]); })());
  ok("days_past_due per invoice: 0 / 30 / 60 / 76 / 103 / 139 / 21 / 11",
    eq(runSql(db, `SELECT CAST(julianday('2026-10-01') - julianday(due_date) AS INTEGER) AS dpd
        FROM invoices ORDER BY invoice_id ASC`),
      [[0], [30], [60], [76], [103], [139], [21], [11]]));
  ok("per-invoice outstanding (payments SUMmed): full totals, 70000, 0, -15000",
    eq(runSql(db, `SELECT i.invoice_id, i.total_cents - COALESCE(SUM(p.paid_cents), 0) AS outstanding
        FROM invoices i LEFT JOIN invoice_payments p ON p.invoice_id = i.invoice_id
        GROUP BY i.invoice_id ORDER BY i.invoice_id ASC`),
      [[11, 90000], [12, 60000], [13, 45000], [14, 30000], [15, 25000], [16, 70000], [17, 0], [18, -15000]]));
  ok("customer 501's five buckets hand-sum to 250000",
    90000 + 60000 + 45000 + 30000 + 25000 === 250000);
  ok("boundary invoices: 30 days and 60 days (the two edges the buckets must place)",
    eq(runSql(db, `SELECT invoice_id, due_date FROM invoices
        WHERE due_date IN ('2026-09-01', '2026-08-02') ORDER BY invoice_id ASC`),
      [[12, "2026-09-01"], [13, "2026-08-02"]]));
  db.close();
}

console.log("\n=== balance-rollforward — window arithmetic hand checks ===");
{
  const d = SQL_DF_ACCT_A[2];
  const db = buildDb(d);
  ok("8 lines inside the September window (the 09-30 line counts)",
    eq(runSql(db, `SELECT COUNT(*) FROM journal_lines
        WHERE entry_date BETWEEN '2026-09-01' AND '2026-09-30'`), [[8]]));
  ok("exactly one line sits on the inclusive upper edge 2026-09-30",
    eq(runSql(db, `SELECT COUNT(*) FROM journal_lines WHERE entry_date = '2026-09-30'`), [[1]]));
  ok("the two outside-window lines exist (2026-08-31 and 2026-10-01)",
    eq(runSql(db, `SELECT entry_date, COUNT(*) FROM journal_lines
        WHERE entry_date IN ('2026-08-31', '2026-10-01') GROUP BY entry_date ORDER BY entry_date ASC`),
      [["2026-08-31", 1], ["2026-10-01", 1]]));
  ok("per-account window sums: 85000/30000, 57000/0, 0/36000, 70000/25000 (account 1 absent)",
    eq(runSql(db, `SELECT account_id, SUM(debit_cents), SUM(credit_cents) FROM journal_lines
        WHERE entry_date BETWEEN '2026-09-01' AND '2026-09-30'
        GROUP BY account_id ORDER BY account_id ASC`),
      [[2, 85000, 30000], [3, 57000, 0], [4, 0, 36000], [5, 70000, 25000]]));
  ok("hand closings: 125000, 95000, 67000, 44000, 45000",
    [125000, 40000 + 85000 - 30000, 10000 + 57000 - 0, 80000 + 0 - 36000, 0 + 70000 - 25000]
      .join(",") === "125000,95000,67000,44000,45000");
  db.close();
}

/* ---------- planted-trap probes: the WRONG queries must produce the documented wrong outputs ---------- */
console.log("\n=== planted-trap probes ===");

// D1 traps
{
  const db = buildDb(SQL_DF_ACCT_A[0]);
  const BAL = (deltaExpr: string, joinOn: string, joinKind = "JOIN") => `SELECT
      a.account_id, a.account_name,
      SUM(l.debit_cents) AS debit_total_cents, SUM(l.credit_cents) AS credit_total_cents,
      ${deltaExpr} AS delta_cents,
      CASE WHEN ${deltaExpr} = 0 THEN 'balanced'
           WHEN ${deltaExpr} > 0 THEN 'debit balance'
           ELSE 'credit balance' END AS balance_status
    FROM accounts a ${joinKind} journal_lines l ON ${joinOn}
    GROUP BY a.account_id, a.account_name ORDER BY a.account_id ASC`;
  const grand = (id: number, name: string) => [id, name, 1071700, 1615000, -543300, "credit balance"];
  ok("D1 join on a non-key filter fans 15 lines x 7 accounts to 105 rows",
    eq(runSql(db, `SELECT COUNT(*) AS rows_out FROM accounts a JOIN journal_lines l ON l.debit_cents >= 0`),
      [[105]]));
  ok("D1 fanout probe: every account reads the grand totals 1071700/1615000 and 'credit balance'",
    eq(runSql(db, BAL("SUM(l.debit_cents) - SUM(l.credit_cents)", "l.debit_cents >= 0")),
      [grand(1, "cash"), grand(2, "sales_revenue"), grand(3, "accounts_payable"),
        grand(4, "accounts_receivable"), grand(5, "payroll_expense"), grand(6, "inventory_clearing"),
        grand(7, "suspense_bridge")]));
  ok("D1 one-total probe: SUM(debit + credit) reads cash 1150000 (contract: a 0 delta)",
    eq(runSql(db, `SELECT a.account_id, a.account_name, SUM(l.debit_cents + l.credit_cents) AS combined_cents
        FROM accounts a JOIN journal_lines l ON l.account_id = a.account_id
        GROUP BY a.account_id, a.account_name ORDER BY a.account_id ASC`),
      [[1, "cash", 1150000], [2, "sales_revenue", 630000], [3, "accounts_payable", 95000],
        [4, "accounts_receivable", 400000], [5, "payroll_expense", 402000], [6, "inventory_clearing", 9700]]));
  ok("D1 sign-flip probe: delta = credit - debit relabels all five nonzero accounts",
    eq(runSql(db, BAL("SUM(l.credit_cents) - SUM(l.debit_cents)", "l.account_id = a.account_id")),
      [[1, "cash", 575000, 575000, 0, "balanced"],
        [2, "sales_revenue", 30000, 600000, 570000, "debit balance"],
        [3, "accounts_payable", 0, 95000, 95000, "debit balance"],
        [4, "accounts_receivable", 260000, 140000, -120000, "credit balance"],
        [5, "payroll_expense", 202000, 200000, -2000, "credit balance"],
        [6, "inventory_clearing", 4700, 5000, 300, "debit balance"]]));
  ok("D1 LEFT JOIN probe: the line-less account ships a 7th row with NULL totals and the ELSE label",
    eq(runSql(db, BAL("SUM(l.debit_cents) - SUM(l.credit_cents)", "l.account_id = a.account_id", "LEFT JOIN")),
      [[1, "cash", 575000, 575000, 0, "balanced"],
        [2, "sales_revenue", 30000, 600000, -570000, "credit balance"],
        [3, "accounts_payable", 0, 95000, -95000, "credit balance"],
        [4, "accounts_receivable", 260000, 140000, 120000, "debit balance"],
        [5, "payroll_expense", 202000, 200000, 2000, "debit balance"],
        [6, "inventory_clearing", 4700, 5000, -300, "credit balance"],
        [7, "suspense_bridge", null, null, null, "credit balance"]]));
  db.close();
}

// D2 traps
{
  const db = buildDb(SQL_DF_ACCT_A[1]);
  const AGED = (outExpr: string) => `WITH aged AS (
      SELECT i.customer_id, i.invoice_id,
        CAST(julianday('2026-10-01') - julianday(i.due_date) AS INTEGER) AS days_past_due,
        ${outExpr} AS outstanding_cents
      FROM invoices i
      LEFT JOIN invoice_payments p ON p.invoice_id = i.invoice_id
      GROUP BY i.invoice_id, i.customer_id, i.due_date, i.total_cents)`;
  const PIVOT = (c30: string, c60: string, c90: string, cover: string, where: string) => `
    SELECT customer_id,
      SUM(CASE WHEN days_past_due <= 0 THEN outstanding_cents ELSE 0 END) AS current_cents,
      SUM(CASE WHEN ${c30} THEN outstanding_cents ELSE 0 END) AS days_1_30_cents,
      SUM(CASE WHEN ${c60} THEN outstanding_cents ELSE 0 END) AS days_31_60_cents,
      SUM(CASE WHEN ${c90} THEN outstanding_cents ELSE 0 END) AS days_61_90_cents,
      SUM(CASE WHEN ${cover} THEN outstanding_cents ELSE 0 END) AS days_over_90_cents,
      SUM(outstanding_cents) AS total_outstanding_cents
    FROM aged ${where}
    GROUP BY customer_id ORDER BY customer_id ASC`;
  const CONTRACT_ARMS = ["days_past_due BETWEEN 1 AND 30", "days_past_due BETWEEN 31 AND 60",
    "days_past_due BETWEEN 61 AND 90", "days_past_due >= 91"];
  ok("D2 strict-< bucket edges slide the 30-day invoice to days_31_60 and the 60-day to days_61_90: 0/60000/75000/25000",
    eq(runSql(db, `${AGED("i.total_cents - COALESCE(SUM(p.paid_cents), 0)")}
      ${PIVOT("days_past_due >= 1 AND days_past_due < 30", "days_past_due >= 30 AND days_past_due < 60",
        "days_past_due >= 60 AND days_past_due < 90", "days_past_due >= 90", "WHERE outstanding_cents > 0")}`),
      [[501, 90000, 0, 60000, 75000, 25000, 250000], [502, 0, 0, 0, 0, 70000, 70000]]));
  ok("D2 dropping the outstanding > 0 filter ships the fully-paid zeros AND the -15000 overpayment inside days_1_30",
    eq(runSql(db, `${AGED("i.total_cents - COALESCE(SUM(p.paid_cents), 0)")}
      ${PIVOT(CONTRACT_ARMS[0], CONTRACT_ARMS[1], CONTRACT_ARMS[2], CONTRACT_ARMS[3], "")}`),
      [[501, 90000, 60000, 45000, 30000, 25000, 250000],
        [502, 0, 0, 0, 0, 70000, 70000],
        [503, 0, 0, 0, 0, 0, 0],
        [504, 0, -15000, 0, 0, 0, -15000]]));
  ok("D2 join-fanout single-payment read double-counts invoice 16 (120000 + 130000 = 250000) and drops every unpaid invoice",
    eq(runSql(db, `SELECT i.customer_id,
        SUM(CASE WHEN CAST(julianday('2026-10-01') - julianday(i.due_date) AS INTEGER) <= 0 THEN i.total_cents - p.paid_cents ELSE 0 END) AS current_cents,
        SUM(CASE WHEN CAST(julianday('2026-10-01') - julianday(i.due_date) AS INTEGER) BETWEEN 1 AND 30 THEN i.total_cents - p.paid_cents ELSE 0 END) AS days_1_30_cents,
        SUM(CASE WHEN CAST(julianday('2026-10-01') - julianday(i.due_date) AS INTEGER) BETWEEN 31 AND 60 THEN i.total_cents - p.paid_cents ELSE 0 END) AS days_31_60_cents,
        SUM(CASE WHEN CAST(julianday('2026-10-01') - julianday(i.due_date) AS INTEGER) BETWEEN 61 AND 90 THEN i.total_cents - p.paid_cents ELSE 0 END) AS days_61_90_cents,
        SUM(CASE WHEN CAST(julianday('2026-10-01') - julianday(i.due_date) AS INTEGER) >= 91 THEN i.total_cents - p.paid_cents ELSE 0 END) AS days_over_90_cents,
        SUM(i.total_cents - p.paid_cents) AS total_outstanding_cents
      FROM invoices i JOIN invoice_payments p ON p.invoice_id = i.invoice_id
      WHERE i.total_cents - p.paid_cents > 0
      GROUP BY i.customer_id ORDER BY i.customer_id ASC`),
      [[502, 0, 0, 0, 0, 250000, 250000]]));
  ok("D2 MAX-based single-payment read: invoice 16 underpays to 120000 and the payment-less invoices NULL out entirely",
    eq(runSql(db, `${AGED("i.total_cents - MAX(p.paid_cents)")}
      ${PIVOT(CONTRACT_ARMS[0], CONTRACT_ARMS[1], CONTRACT_ARMS[2], CONTRACT_ARMS[3], "WHERE outstanding_cents > 0")}`),
      [[502, 0, 0, 0, 0, 120000, 120000]]));
  db.close();
}

// D3 traps
{
  const db = buildDb(SQL_DF_ACCT_A[2]);
  const ROLL = (thru: string, joinKind: string, coalesce: boolean, closing: string) => `WITH activity AS (
      SELECT o.account_id, o.opening_cents,
        ${coalesce ? "COALESCE(SUM(l.debit_cents), 0)" : "SUM(l.debit_cents)"} AS debit_total_cents,
        ${coalesce ? "COALESCE(SUM(l.credit_cents), 0)" : "SUM(l.credit_cents)"} AS credit_total_cents
      FROM opening_balances o
      ${joinKind} JOIN journal_lines l
        ON l.account_id = o.account_id
       AND l.entry_date BETWEEN '2026-09-01' AND '${thru}'
      GROUP BY o.account_id, o.opening_cents)
    SELECT account_id, opening_cents, debit_total_cents, credit_total_cents,
      ${closing} AS closing_cents
    FROM activity ORDER BY account_id ASC`;
  const CLOSE = "opening_cents + debit_total_cents - credit_total_cents";
  ok("D3 INNER JOIN probe: the carry-forward account 1 vanishes (4 rows)",
    eq(runSql(db, ROLL("2026-09-30", "INNER", true, CLOSE)),
      [[2, 40000, 85000, 30000, 95000], [3, 10000, 57000, 0, 67000],
        [4, 80000, 0, 36000, 44000], [5, 0, 70000, 25000, 45000]]));
  ok("D3 missing COALESCE probe: account 1 reads 125000/NULL/NULL/NULL",
    eq(runSql(db, ROLL("2026-09-30", "LEFT", false, CLOSE)),
      [[1, 125000, null, null, null], [2, 40000, 85000, 30000, 95000],
        [3, 10000, 57000, 0, 67000], [4, 80000, 0, 36000, 44000], [5, 0, 70000, 25000, 45000]]));
  ok("D3 window leak probe: upper bound '2026-10-01' pulls the October line into account 2 (110000/120000); the August line stays out — it sits BELOW the window, so only the lower bound could leak it",
    eq(runSql(db, ROLL("2026-10-01", "LEFT", true, CLOSE)),
      [[1, 125000, 0, 0, 125000], [2, 40000, 110000, 30000, 120000],
        [3, 10000, 57000, 0, 67000], [4, 80000, 0, 36000, 44000], [5, 0, 70000, 25000, 45000]]));
  ok("D3 off-by-one probe: upper bound '2026-09-29' drops the 09-30 line (account 2: 65000/75000)",
    eq(runSql(db, ROLL("2026-09-29", "LEFT", true, CLOSE)),
      [[1, 125000, 0, 0, 125000], [2, 40000, 65000, 30000, 75000],
        [3, 10000, 57000, 0, 67000], [4, 80000, 0, 36000, 44000], [5, 0, 70000, 25000, 45000]]));
  ok("D3 credit-as-positive probe: account 4 inflates to 116000 (contract 44000)",
    eq(runSql(db, ROLL("2026-09-30", "LEFT", true, "opening_cents + debit_total_cents + credit_total_cents")),
      [[1, 125000, 0, 0, 125000], [2, 40000, 85000, 30000, 155000],
        [3, 10000, 57000, 0, 67000], [4, 80000, 0, 36000, 116000], [5, 0, 70000, 25000, 95000]]));
  db.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log(`ALL CHECKS PASS ${SQL_DF_ACCT_A.length}/3`);
