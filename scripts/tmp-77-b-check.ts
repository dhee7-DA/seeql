// Task 77-b self-check — sql-df-saas-b.ts (3 SaaS Analytics B dives with primers).
// bun scripts/tmp-77-b-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_SAAS_B } from "../src/lib/leetcode/content/sql-df-saas-b";
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

/* ---------- spec: pinned output contracts (engine-verified before writing) ---------- */
const SPEC: Array<{
  slug: string; id: number; difficulty: "Easy" | "Medium" | "Hard"; xp: number;
  columns: string[]; rows: unknown[][]; realColumns: string[]; intColumns: string[];
  order: "exact" | "any";
}> = [
  { slug: "net-revenue-retention", id: 8052, difficulty: "Medium", xp: 20,
    columns: ["cohort_month", "m0_mrr", "m3_mrr", "nrr_pct"],
    rows: [
      ["2026-04-01", 28000, 43000, 153.57],
      ["2026-05-01", 20000, 20000, 100],
      ["2026-06-01", 30000, 11000, 36.67],
    ],
    realColumns: ["nrr_pct"], intColumns: ["m0_mrr", "m3_mrr"], order: "exact" },
  { slug: "ltv-cac-payback", id: 8053, difficulty: "Medium", xp: 20,
    columns: ["channel", "customers", "arpu_mrr", "monthly_churn_pct", "cac_cents", "ltv_cents", "ltv_to_cac", "payback_months"],
    rows: [
      ["organic", 5, 4950, 5, 10000, 79200, 7.92, 2.5],
      ["paid_search", 4, 10312.5, 6.25, 100000, 132000, 1.32, 12.1],
      ["paid_social", 5, 6000, 25, 80000, 19200, 0.24, 16.7],
    ],
    realColumns: ["arpu_mrr", "monthly_churn_pct", "ltv_to_cac", "payback_months"],
    intColumns: ["customers", "cac_cents", "ltv_cents"], order: "exact" },
  { slug: "winback-recovery", id: 8054, difficulty: "Hard", xp: 35,
    columns: ["cancel_reason", "churned_customers", "recovered", "recovery_pct", "avg_days_to_return"],
    rows: [
      ["missing_features", 4, 2, 50, 40.5],
      ["price", 4, 3, 75, 59.7],
      ["bugs", 3, 1, 33.33, 49],
      ["switching", 3, 0, 0, 0],
    ],
    realColumns: ["recovery_pct", "avg_days_to_return"],
    intColumns: ["churned_customers", "recovered"], order: "exact" },
];
const XP: Record<string, number> = { Easy: 10, Medium: 20, Hard: 35 };

// related slugs may ONLY come from the Data & Finance track (registry-wired).
const RELATED_POOL = new Set([
  "cohort-retention-matrix", "growth-accounting", "week-over-week-churn",
  "vintage-default-curves", "expected-credit-loss", "loan-amortization-schedule",
  "dormant-reactivation",
]);
const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));

console.log(`\n=== sql-df-saas-b.ts — ${SQL_DF_SAAS_B.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_SAAS_B.length === 3 && SPEC.every((s, i) => SQL_DF_SAAS_B[i]?.slug === s.slug),
  SQL_DF_SAAS_B.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_SAAS_B[i];
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
    ok(`related slug from the DF-track pool: ${r}`, RELATED_POOL.has(r));
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

  // hygiene: backticks / ${ / platform mention / e.g.-i.e. / emoji in any dive string
  const strs = allStrings(d);
  ok("no backticks in any string", strs.every((s) => !s.includes("`")));
  ok("no ${ in any string", strs.every((s) => !s.includes("${")));
  ok("no markdown markers in prose strings",
    proseStrings(d).every((s) => !/^\s*#{1,6}\s|\*\*|^\s*[-*]\s/m.test(s)));
  ok("no emoji in any string",
    strs.every((s) => !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(s)));
  ok("no platform mention in any string",
    strs.every((s) => !/leetcode|hackerrank|datalemur|stratascratch/i.test(s)));
  ok('no "e.g."/"i.e." in prose (sentence heuristic safety)',
    proseStrings(d).every((s) => !/\be\.g\.|\bi\.e\./i.test(s)));

  // MONEY convention: every DDL money column is INTEGER; declared REAL outputs exist
  const ddlMoney = (d.schema.ddl.match(/^\s*(\w+_cents|\w+_minor)\s+(\w+)/gim) ?? [])
    .map((m) => m.trim().split(/\s+/));
  ok(`every *_cents/_minor DDL column is INTEGER (${ddlMoney.length} money columns)`,
    ddlMoney.length > 0 && ddlMoney.every((part) => part[1] === "INTEGER"), JSON.stringify(ddlMoney));
  ok("declared REAL columns appear in the output", spec.realColumns.every((c) => spec.columns.includes(c)));
  const moneyOut = spec.columns.filter((c) => /_cents$/.test(c));
  ok("every *_cents output column is declared integer", moneyOut.every((c) => spec.intColumns.includes(c)));

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
          ok(`cell(${ri + 1},${ci + 1}) ${col} is a REAL number`, typeof cell === "number");
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

/* ---------- dive 1: net-revenue-retention — trap probes + TS mirror ---------- */

console.log("\n=== net-revenue-retention — trap probes (pinned wrong values) ===");
{
  const d = SQL_DF_SAAS_B[0];
  const db = buildDb(d);
  const M3 = `SELECT c.cohort_month, COALESCE(SUM(s.mrr_cents), 0) AS m3_mrr
    FROM customers c
    LEFT JOIN mrr_snapshots s ON s.customer_id = c.customer_id
      AND s.month = date(c.cohort_month, '+3 month')
    GROUP BY c.cohort_month`;

  // TRAP A: survivor-only denominator (churned customers dropped from m0)
  const trapA = `WITH m3 AS (${M3}),
    present AS (
      SELECT DISTINCT c.cohort_month, s.customer_id
      FROM customers c JOIN mrr_snapshots s
        ON s.customer_id = c.customer_id AND s.month = date(c.cohort_month, '+3 month')),
    m0surv AS (
      SELECT p.cohort_month, SUM(s.mrr_cents) AS m0_mrr
      FROM present p JOIN mrr_snapshots s
        ON s.customer_id = p.customer_id AND s.month = p.cohort_month
      GROUP BY p.cohort_month)
    SELECT m0surv.cohort_month, m0surv.m0_mrr, m3.m3_mrr,
      ROUND(100.0 * m3.m3_mrr / m0surv.m0_mrr, 2) AS nrr_pct
    FROM m0surv JOIN m3 ON m3.cohort_month = m0surv.cohort_month
    WHERE date(m0surv.cohort_month, '+3 month') <= (SELECT MAX(month) FROM mrr_snapshots)
    ORDER BY m0surv.cohort_month ASC`;
  const a = runSql(db, trapA);
  ok("TRAP A (survivor denominator) rows === [[22000,43000,195.45],[20000,20000,100],[17000,11000,64.71]]",
    eq(a, [["2026-04-01", 22000, 43000, 195.45], ["2026-05-01", 20000, 20000, 100], ["2026-06-01", 17000, 11000, 64.71]]),
    JSON.stringify(a));

  // TRAP B: +90 day drift instead of +3 month
  const trapB = `WITH m0 AS (
      SELECT c.cohort_month, SUM(s.mrr_cents) AS m0_mrr
      FROM customers c JOIN mrr_snapshots s
        ON s.customer_id = c.customer_id AND s.month = c.cohort_month
      GROUP BY c.cohort_month),
    m3 AS (
      SELECT c.cohort_month, COALESCE(SUM(s.mrr_cents), 0) AS m3_mrr
      FROM customers c
      LEFT JOIN mrr_snapshots s ON s.customer_id = c.customer_id
        AND s.month = date(c.cohort_month, '+90 day')
      GROUP BY c.cohort_month)
    SELECT m0.cohort_month, m0.m0_mrr, m3.m3_mrr,
      ROUND(100.0 * m3.m3_mrr / m0.m0_mrr, 2) AS nrr_pct
    FROM m0 JOIN m3 ON m3.cohort_month = m0.cohort_month
    WHERE date(m0.cohort_month, '+3 month') <= (SELECT MAX(month) FROM mrr_snapshots)
    ORDER BY m0.cohort_month ASC`;
  const b = runSql(db, trapB);
  ok("TRAP B (+90 day drift) all m3 = 0, nrr_pct = 0",
    eq(b, [["2026-04-01", 28000, 0, 0], ["2026-05-01", 20000, 0, 0], ["2026-06-01", 30000, 0, 0]]),
    JSON.stringify(b));

  // TRAP C: M1 masquerading as M0 (+1 month instead of the cohort month)
  const trapC = `WITH m0wrong AS (
      SELECT c.cohort_month, SUM(s.mrr_cents) AS m0_mrr
      FROM customers c JOIN mrr_snapshots s
        ON s.customer_id = c.customer_id AND s.month = date(c.cohort_month, '+1 month')
      GROUP BY c.cohort_month),
    m3 AS (${M3})
    SELECT m0wrong.cohort_month, m0wrong.m0_mrr, m3.m3_mrr,
      ROUND(100.0 * m3.m3_mrr / m0wrong.m0_mrr, 2) AS nrr_pct
    FROM m0wrong JOIN m3 ON m3.cohort_month = m0wrong.cohort_month
    WHERE date(m0wrong.cohort_month, '+3 month') <= (SELECT MAX(month) FROM mrr_snapshots)
    ORDER BY m0wrong.cohort_month ASC`;
  const c = runSql(db, trapC);
  ok("TRAP C (M1 as M0) 2026-05 row reads 23000 / 86.96, others unchanged",
    eq(c, [["2026-04-01", 28000, 43000, 153.57], ["2026-05-01", 23000, 20000, 86.96], ["2026-06-01", 30000, 11000, 36.67]]),
    JSON.stringify(c));

  // TS mirror of the raw ratios (1e-9)
  const raw = runSql(db, `SELECT 100.0*43000/28000 AS apr, 100.0*20000/20000 AS may,
      100.0*11000/30000 AS jun, 100.0*43000/22000 AS survApr, 100.0*11000/17000 AS survJun,
      100.0*20000/23000 AS m1May, 100.0*ROUND(43000.0/28000, 2) AS roundFirstApr`);
  const pins: Array<[string, number, number]> = [
    ["apr raw", raw[0][0] as number, 153.57142857142858],
    ["jun raw", raw[0][2] as number, 36.666666666666664],
    ["survivor apr raw", raw[0][3] as number, 195.45454545454547],
    ["survivor jun raw", raw[0][4] as number, 64.70588235294117],
    ["m1-denominator may raw", raw[0][5] as number, 86.95652173913044],
  ];
  for (const [label, got, want] of pins) {
    ok(`mirror ${label} within 1e-9 of ${want}`, Math.abs(got - want) < 1e-9, `${got} vs ${want}`);
  }
  ok("round-before-scale april reads 154 (vs pinned 153.57)", eq(raw[0][6], 154), String(raw[0][6]));
  db.close();
}

/* ---------- dive 2: ltv-cac-payback — trap probes + TS mirror ---------- */

console.log("\n=== ltv-cac-payback — trap probes (pinned wrong values) ===");
{
  const d = SQL_DF_SAAS_B[1];
  const db = buildDb(d);
  const byCh = (rows: unknown[][], ch: string) => rows.find((r) => r[0] === ch)!;

  // TRAP D: payback without margin (cac / arpu)
  const trapD = `WITH final_month AS (SELECT MAX(month) AS fm FROM mrr_snapshots),
    cust_span AS (SELECT s.customer_id, MAX(s.month) AS last_month FROM mrr_snapshots s GROUP BY s.customer_id),
    churns AS (SELECT c.channel, COUNT(*) AS churned_n FROM customers c
      JOIN cust_span cs ON cs.customer_id = c.customer_id CROSS JOIN final_month f
      WHERE cs.last_month < f.fm GROUP BY c.channel),
    billed AS (SELECT c.channel, COUNT(*) AS customer_months, AVG(s.mrr_cents) AS arpu
      FROM customers c JOIN mrr_snapshots s ON s.customer_id = c.customer_id GROUP BY c.channel),
    sizes AS (SELECT channel, COUNT(*) AS customers FROM customers GROUP BY channel),
    base AS (SELECT b.channel, sz.customers, b.customer_months, b.arpu,
      COALESCE(ch.churned_n, 0) AS churned_n,
      100.0 * COALESCE(ch.churned_n, 0) / b.customer_months AS churn_pct
      FROM billed b JOIN sizes sz ON sz.channel = b.channel LEFT JOIN churns ch ON ch.channel = b.channel)
    SELECT b.channel, ROUND((sp.spend_cents * 1.0 / b.customers) / b.arpu, 1) AS payback_months
    FROM base b JOIN channel_spend sp ON sp.channel = b.channel
    ORDER BY b.channel ASC`;
  const drows = runSql(db, trapD);
  ok("TRAP D (payback no margin) === organic 2.0 / paid_search 9.7 / paid_social 13.3",
    eq(drows, [["organic", 2], ["paid_search", 9.7], ["paid_social", 13.3]]), JSON.stringify(drows));

  // TRAP E: churn denominator = customers instead of customer-months
  const trapE = trapD.replace(
    "100.0 * COALESCE(ch.churned_n, 0) / b.customer_months AS churn_pct",
    "100.0 * COALESCE(ch.churned_n, 0) / sz.customers AS churn_pct")
    .replace(
      "SELECT b.channel, ROUND((sp.spend_cents * 1.0 / b.customers) / b.arpu, 1) AS payback_months",
      `SELECT b.channel, b.churn_pct AS monthly_churn_pct,
        CASE WHEN b.churn_pct = 0 THEN 0 ELSE CAST(ROUND(b.arpu * 0.80 / (b.churn_pct / 100.0), 0) AS INTEGER) END AS ltv_cents,
        ROUND(b.arpu * 0.80 / (b.churn_pct / 100.0) / (sp.spend_cents * 1.0 / b.customers), 2) AS ltv_to_cac`);
  const erows = runSql(db, trapE);
  ok("TRAP E (churn over customers) churn === 20.0 / 25.0 / 60.0",
    eq(erows.map((r) => r[1]), [20, 25, 60]), JSON.stringify(erows));
  ok("TRAP E feeds ltv === 19800 / 33000 / 8000",
    eq(erows.map((r) => r[2]), [19800, 33000, 8000]), JSON.stringify(erows));
  ok("TRAP E feeds ratio === 1.98 / 0.33 / 0.1",
    eq(erows.map((r) => r[3]), [1.98, 0.33, 0.1]), JSON.stringify(erows));

  // TRAP F: churn percent fed in without /100 — the PERCENT itself becomes the rate and ltv collapses a hundredfold
  const trapF = `WITH billed AS (SELECT c.channel, AVG(s.mrr_cents) AS arpu, COUNT(*) AS cm
      FROM customers c JOIN mrr_snapshots s ON s.customer_id = c.customer_id GROUP BY c.channel),
    churns AS (SELECT c.channel, COUNT(*) AS churned_n FROM customers c
      JOIN (SELECT s.customer_id, MAX(s.month) AS last_month FROM mrr_snapshots s GROUP BY s.customer_id) cs
        ON cs.customer_id = c.customer_id
      WHERE cs.last_month < (SELECT MAX(month) FROM mrr_snapshots) GROUP BY c.channel),
    joined AS (SELECT b.channel, b.arpu, 100.0 * COALESCE(ch.churned_n, 0) / b.cm AS rate
      FROM billed b LEFT JOIN churns ch ON ch.channel = b.channel)
    SELECT channel, CAST(ROUND(arpu * 0.80 / rate, 0) AS INTEGER) AS ltv_pct_bug
    FROM joined ORDER BY channel ASC`;
  const frows = runSql(db, trapF);
  ok("TRAP F (percent-as-rate) ltv === 792 / 1320 / 192",
    eq(frows.map((r) => r[1]), [792, 1320, 192]), JSON.stringify(frows));

  // TRAP G: margin AFTER the churn division (round gross, then multiply) — happens to agree
  const trapG = `WITH billed AS (SELECT c.channel, AVG(s.mrr_cents) AS arpu, COUNT(*) AS cm
      FROM customers c JOIN mrr_snapshots s ON s.customer_id = c.customer_id GROUP BY c.channel),
    churns AS (SELECT c.channel, COUNT(*) AS churned_n FROM customers c
      JOIN (SELECT s.customer_id, MAX(s.month) AS last_month FROM mrr_snapshots s GROUP BY s.customer_id) cs
        ON cs.customer_id = c.customer_id
      WHERE cs.last_month < (SELECT MAX(month) FROM mrr_snapshots) GROUP BY c.channel),
    joined AS (SELECT b.channel, b.arpu, 1.0 * COALESCE(ch.churned_n, 0) / b.cm AS rate
      FROM billed b LEFT JOIN churns ch ON ch.channel = b.channel)
    SELECT channel, CAST(ROUND(ROUND(arpu / rate, 0) * 0.80, 0) AS INTEGER) AS ltv_reordered
    FROM joined ORDER BY channel ASC`;
  const grows = runSql(db, trapG);
  ok("TRAP G (margin after churn division) HAPPENS TO AGREE on this seed: 79200 / 132000 / 19200",
    eq(grows.map((r) => r[1]), [79200, 132000, 19200]), JSON.stringify(grows));

  // TS mirror of the raw ladder (1e-9)
  const raw = runSql(db, `SELECT 4950.0*0.80 AS m1, 10312.5*0.80 AS m2, 6000.0*0.80 AS m3,
      100.0*1.0/20 AS c1, 100.0*1.0/16 AS c2, 100.0*3.0/12 AS c3,
      (4950.0*0.80)/(100.0*1.0/20.0/100.0) AS l1,
      (10312.5*0.80)/(100.0*1.0/16.0/100.0) AS l2,
      (6000.0*0.80)/(100.0*3.0/12.0/100.0) AS l3,
      10000.0/(4950.0*0.80) AS p1, 100000.0/(10312.5*0.80) AS p2, 80000.0/(6000.0*0.80) AS p3`);
  const pins: Array<[number, number]> = [
    [raw[0][0] as number, 3960], [raw[0][1] as number, 8250], [raw[0][2] as number, 4800],
    [raw[0][3] as number, 5], [raw[0][4] as number, 6.25], [raw[0][5] as number, 25],
    [raw[0][6] as number, 79200], [raw[0][7] as number, 132000], [raw[0][8] as number, 19200],
    [raw[0][9] as number, 2.525252525252525], [raw[0][10] as number, 12.121212121212121],
    [raw[0][11] as number, 16.666666666666668],
  ];
  pins.forEach(([got, want], j) =>
    ok(`mirror raw ladder ${j + 1} within 1e-9 of ${want}`, Math.abs(got - want) < 1e-9, `${got} vs ${want}`));

  // guard sanity: churn 0 path returns 0 without crashing
  ok("zero-churn guard shape present in code (CASE WHEN)", /CASE\s+WHEN\s+b\.churn_pct\s*=\s*0/i.test(stripComments(d.code)));
  db.close();
}

/* ---------- dive 3: winback-recovery — trap probes + TS mirror ---------- */

console.log("\n=== winback-recovery — trap probes (pinned wrong values) ===");
{
  const d = SQL_DF_SAAS_B[2];
  const db = buildDb(d);
  const BY = (rows: unknown[][]) =>
    Object.fromEntries(rows.map((r) => [r[0], r])) as Record<string, unknown[]>;

  // TRAP 1: exclusive day-90 boundary
  const trap1 = d.code.replace(/;+\s*$/, "").replace(
    "AND r.resub_date <= date(ce.churn_date, '+90 day')",
    "AND r.resub_date < date(ce.churn_date, '+90 day')");
  const t1 = BY(runSql(db, trap1));
  ok("TRAP 1 (exclusive day 90) price === 4, 2, 50.0, 44.5",
    eq(t1["price"], ["price", 4, 2, 50, 44.5]), JSON.stringify(t1["price"]));
  ok("TRAP 1 other reasons unchanged (missing_features 2/50.0/40.5, bugs 1/33.33/49.0, switching 0/0.0/0.0)",
    eq(t1["missing_features"], ["missing_features", 4, 2, 50, 40.5]) &&
    eq(t1["bugs"], ["bugs", 3, 1, 33.33, 49]) && eq(t1["switching"], ["switching", 3, 0, 0, 0]));

  // TRAP 2: no upper bound (any resub after the churn counts)
  const trap2 = d.code.replace(/;+\s*$/, "").replace(
    "\n   AND r.resub_date <= date(ce.churn_date, '+90 day')", "");
  const t2 = BY(runSql(db, trap2));
  ok("TRAP 2 (no upper bound) missing_features === 4, 3, 75.0, 57.3",
    eq(t2["missing_features"], ["missing_features", 4, 3, 75, 57.3]), JSON.stringify(t2["missing_features"]));
  ok("TRAP 2 other reasons unchanged (price 3/75.0/59.7, bugs 1/33.33/49.0, switching 0/0.0/0.0)",
    eq(t2["price"], ["price", 4, 3, 75, 59.7]) && eq(t2["bugs"], ["bugs", 3, 1, 33.33, 49]) &&
    eq(t2["switching"], ["switching", 3, 0, 0, 0]));

  // TRAP 3: INNER JOIN drops zero-recovery reasons
  const trap3 = d.code.replace(/;+\s*$/, "").replace("LEFT JOIN resubscriptions", "INNER JOIN resubscriptions");
  const t3 = runSql(db, trap3);
  ok("TRAP 3 (INNER JOIN) ships 3 rows instead of 4, switching gone",
    t3.length === 3 && !t3.some((r) => r[0] === "switching"), JSON.stringify(t3));
  ok("TRAP 3 every surviving reason reads a lying 100.0 pct",
    t3.every((r) => r[3] === 100), JSON.stringify(t3));

  // TRAP 4: naive customer-only join (no window guards)
  const trap4 = `SELECT
      ce.cancel_reason,
      COUNT(*) AS churned_customers,
      COUNT(r.resub_date) AS recovered,
      ROUND(100.0 * COUNT(r.resub_date) / COUNT(*), 2) AS recovery_pct,
      ROUND(COALESCE(AVG(julianday(r.resub_date) - julianday(ce.churn_date)), 0.0), 1) AS avg_days_to_return
    FROM churn_events ce
    LEFT JOIN resubscriptions r ON r.customer_id = ce.customer_id
    GROUP BY ce.cancel_reason
    ORDER BY churned_customers DESC, cancel_reason ASC`;
  const t4 = BY(runSql(db, trap4));
  ok("TRAP 4 (naive join) bugs === 3, 2, 66.67, -15.5 (back-dated resub strikes)",
    eq(t4["bugs"], ["bugs", 3, 2, 66.67, -15.5]), JSON.stringify(t4["bugs"]));
  ok("TRAP 4 missing_features inflates to 3 / 75.0 / 57.3 with the day-91 return",
    eq(t4["missing_features"], ["missing_features", 4, 3, 75, 57.3]), JSON.stringify(t4["missing_features"]));

  // TS mirror: the julianday gaps are exact integers straight from the seed
  const gaps = runSql(db, `SELECT CAST(julianday('2026-03-12') - julianday('2026-02-01') AS INTEGER) AS g1,
      CAST(julianday('2026-06-08') - julianday('2026-03-10') AS INTEGER) AS g2,
      CAST(julianday('2026-04-01') - julianday('2026-02-10') AS INTEGER) AS g3,
      CAST(julianday('2026-04-21') - julianday('2026-01-20') AS INTEGER) AS g4,
      CAST(julianday('2026-03-16') - julianday('2026-02-14') AS INTEGER) AS g5,
      CAST(julianday('2026-06-25') - julianday('2026-05-05') AS INTEGER) AS g6,
      CAST(julianday('2026-05-10') - julianday('2026-03-22') AS INTEGER) AS g7,
      CAST(julianday('2026-04-01') - julianday('2026-06-20') AS INTEGER) AS g8`);
  ok("mirror gaps === [39, 90, 50, 91, 30, 51, 49, -80] (day 90 in, day 91 out, back-dated -80)",
    eq(gaps[0], [39, 90, 50, 91, 30, 51, 49, -80]), JSON.stringify(gaps[0]));
  ok("price avg mirror (39+90+50)/3 = 59.666... rounds to 59.7",
    Math.abs((39 + 90 + 50) / 3 - 59.66666666666667) < 1e-9);
  db.close();
}

/* ---------- summary ---------- */
console.log(`\n=== RESULT: ${pass} PASS, ${fail} FAIL ===`);
if (fail > 0) {
  console.log("Failures:");
  failures.forEach((f) => console.log("  - " + f));
  process.exit(1);
}
