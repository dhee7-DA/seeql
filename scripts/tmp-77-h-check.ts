// Task 77-h self-check — sql-df-retail-b.ts (3 Retail B dives with primers).
// bun scripts/tmp-77-h-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_RETAIL_B } from "../src/lib/leetcode/content/sql-df-retail-b";
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
  { slug: "weeks-of-supply", id: 8070, difficulty: "Medium", xp: 20,
    columns: ["sku", "on_hand_units", "weekly_rate", "weeks_of_supply", "reorder"],
    rows: [
      ["FST-1101", 140, 280, 0.5, 1],
      ["BND-4477", 200, 100, 2, 0],
      ["OKG-2205", 480, 90, 5.3, 0],
      ["OVR-3390", 2400, 75, 32, 0],
      ["NOS-5512", 310, 0, 99.9, 1],
    ],
    realColumns: ["weekly_rate", "weeks_of_supply"], intColumns: ["on_hand_units", "reorder"], order: "exact" },
  { slug: "returns-rate-by-category", id: 8071, difficulty: "Easy", xp: 10,
    columns: ["category", "sold_units", "returned_units", "return_pct", "flagged"],
    rows: [
      ["Accessories", 40, 5, 12.5, 1],
      ["Footwear", 200, 20, 10, 1],
      ["Outerwear", 250, 20, 8, 0],
      ["Home", 180, 0, 0, 0],
    ],
    realColumns: ["return_pct"], intColumns: ["sold_units", "returned_units", "flagged"], order: "exact" },
  { slug: "cohort-repeat-revenue", id: 8072, difficulty: "Hard", xp: 35,
    columns: ["cohort_month", "m0_revenue", "m1_revenue", "m2_revenue", "repeat_share_pct"],
    rows: [
      ["2026-05", 15000, 2000, 4500, 30.23],
      ["2026-06", 12500, 3500, 0, 21.88],
      ["2026-07", 15000, 0, 0, 0],
    ],
    realColumns: ["repeat_share_pct"], intColumns: ["m0_revenue", "m1_revenue", "m2_revenue"], order: "exact" },
];
const XP: Record<string, number> = { Easy: 10, Medium: 20, Hard: 35 };

// related slugs may ONLY come from the wired Data & Finance track (8001-8048).
const DF_POOL = new Set([
  "dau-wau-stickiness", "growth-accounting", "funnel-step-conversion", "cohort-retention-matrix",
  "sessionize-events", "ab-test-conversion-lift", "loan-amortization-schedule", "delinquency-buckets",
  "portfolio-weights", "settlement-fails-aging", "realized-pnl-average-cost", "gl-reconciliation",
  "week-over-week-churn", "median-time-to-convert", "rolling-7d-actives", "usage-tier-percentiles",
  "ab-sample-ratio-mismatch", "feature-adoption-windows", "fx-exposure-report", "portfolio-concentration-hhi",
  "daily-balance-interest", "dividend-income-calendar", "max-drawdown", "duplicate-charge-pairs",
  "vintage-default-curves", "delinquency-roll-rates", "credit-utilization-bands", "expected-credit-loss",
  "risk-based-pricing", "prepayment-detection", "structuring-detection", "transaction-velocity",
  "circular-transfers", "amount-anomaly-zscore", "chargeback-rate-ranking", "dormant-reactivation",
  "trial-balance-check", "ar-aging-schedule", "balance-rollforward", "fifo-inventory-cogs",
  "deferred-revenue", "journal-gap-detection", "time-weighted-return", "sharpe-ratio",
  "value-at-risk", "beta-benchmark", "split-adjusted-position", "wash-trade-detection",
]);
const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));

console.log(`\n=== sql-df-retail-b.ts — ${SQL_DF_RETAIL_B.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_RETAIL_B.length === 3 && SPEC.every((s, i) => SQL_DF_RETAIL_B[i]?.slug === s.slug),
  SQL_DF_RETAIL_B.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_RETAIL_B[i];
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
  ok("3-5 edges", d.edges.length >= 3 && d.edges.length <= 5, String(d.edges.length));
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
    ok(`related slug from the Data & Finance track: ${r}`, DF_POOL.has(r));
    ok(`related slug exists in the registry: ${r}`, LC_SLUGS.has(r));
  });
  ok(`schema.tables has one entry per DDL table (${tableCount(d.schema.ddl)})`,
    (d.schema.tables?.length ?? 0) === tableCount(d.schema.ddl));

  // PRIMER audits (every dive must carry one)
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
  ok('no "e.g."/"i.e." in prose (sentence heuristic safety)',
    proseStrings(d).every((s) => !/\be\.g\.|\bi\.e\./i.test(s)));

  // MONEY convention: revenue_cents-style money columns are INTEGER in the DDL
  const ddlMoney = (d.schema.ddl.match(/^\s*(\w+_cents)\s+(\w+)/gim) ?? [])
    .map((m) => m.trim().split(/\s+/));
  ok("every *_cents DDL column is INTEGER",
    ddlMoney.every((part) => part[1] === "INTEGER"), JSON.stringify(ddlMoney));
  const moneyOut = spec.columns.filter((c) => /_cents$/.test(c));
  ok("every *_cents output column is declared integer", moneyOut.every((c) => spec.intColumns.includes(c)));
  ok("declared REAL columns appear in the output", spec.realColumns.every((c) => spec.columns.includes(c)));
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

/* ---------- per-dive hand verification: TS float mirrors (1e-9) ---------- */

console.log("\n=== weeks-of-supply — TS mirror of the pace and countdown ===");
{
  const d = SQL_DF_RETAIL_B[0];
  const db = buildDb(d);
  // TS mirror from the seed's raw unit sums (hand-added per sku)
  const handSums: Record<string, number> = {
    "FST-1101": 120 + 160 + 130 + 150 + 145 + 155 + 135 + 125,
    "BND-4477": 90 + 110 + 95 + 105,
    "OKG-2205": 60 + 50 + 70 + 65 + 55 + 60,
    "OVR-3390": 80 + 70 + 75 + 75,
  };
  ok("hand sums: FST 1120 / BND 400 / OKG 360 / OVR 300",
    handSums["FST-1101"] === 1120 && handSums["BND-4477"] === 400
      && handSums["OKG-2205"] === 360 && handSums["OVR-3390"] === 300,
    JSON.stringify(handSums));
  const raw = runSql(db, `SELECT sku, 1.0 * SUM(units) / 4 AS pace_raw FROM sales GROUP BY sku ORDER BY sku`);
  for (const [sku, sum] of Object.entries(handSums)) {
    const row = raw.find((r) => r[0] === sku);
    ok(`${sku} engine raw pace within 1e-9 of TS mirror (${sum / 4})`,
      !!row && Math.abs((row[1] as number) - sum / 4) < 1e-9, String(row?.[1]));
  }
  const onHand = runSql(db, `SELECT sku, on_hand_units FROM inventory ORDER BY sku`);
  const wosTs = (sku: string) => {
    const pace = handSums[sku] / 4;
    const hand = (onHand.find((r) => r[0] === sku) ?? [])[1] as number;
    return Math.round((hand / pace) * 10) / 10;
  };
  ok("TS countdowns: FST 0.5 / BND 2.0 / OKG 5.3 / OVR 32.0",
    wosTs("FST-1101") === 0.5 && wosTs("BND-4477") === 2.0 && wosTs("OKG-2205") === 5.3 && wosTs("OVR-3390") === 32,
    JSON.stringify([wosTs("FST-1101"), wosTs("BND-4477"), wosTs("OKG-2205"), wosTs("OVR-3390")]));
  ok("boundary planted: BND-4477 pace is exactly 100.0 (no rounding drift)",
    Math.abs(handSums["BND-4477"] / 4 - 100.0) < 1e-12);
  ok("no-sales sku present in inventory, absent from sales",
    onHand.some((r) => r[0] === "NOS-5512")
      && !raw.some((r) => r[0] === "NOS-5512"));
  db.close();
}

console.log("\n=== returns-rate-by-category — TS mirror of the pooled rates ===");
{
  const d = SQL_DF_RETAIL_B[1];
  const db = buildDb(d);
  // hand-added category sums from the seed
  const sold = { Footwear: 50 + 40 + 70 + 40, Accessories: 25 + 15, Outerwear: 150 + 100, Home: 100 + 80 };
  const returned = { Footwear: 7 + 5 + 5 + 3, Accessories: 4 + 1, Outerwear: 10 + 10, Home: 0 };
  ok("hand sums: sold 200/40/250/180, returned 20/5/20/0",
    sold.Footwear === 200 && sold.Accessories === 40 && sold.Outerwear === 250 && sold.Home === 180
      && returned.Footwear === 20 && returned.Accessories === 5 && returned.Outerwear === 20 && returned.Home === 0,
    JSON.stringify({ sold, returned }));
  const raw = runSql(db, `SELECT p.category, 1.0 * SUM(s.units) AS su FROM products p JOIN sales s ON s.sku = p.sku GROUP BY p.category`);
  for (const [cat, su] of Object.entries(sold)) {
    const row = raw.find((r) => r[0] === cat);
    ok(`${cat} engine raw sold within 1e-9 of TS mirror (${su})`,
      !!row && Math.abs((row[1] as number) - su) < 1e-9, String(row?.[1]));
  }
  const rate = (cat: string) => Math.round((100.0 * returned[cat as keyof typeof returned] / sold[cat as keyof typeof sold]) * 100) / 100;
  ok("TS pooled rates: Accessories 12.5 / Footwear 10.0 / Outerwear 8.0 / Home 0.0",
    rate("Accessories") === 12.5 && rate("Footwear") === 10 && rate("Outerwear") === 8 && rate("Home") === 0,
    JSON.stringify([rate("Accessories"), rate("Footwear"), rate("Outerwear"), rate("Home")]));
  ok("boundary planted: Outerwear is exactly 8.00 (strictly-greater keeps it unflagged)",
    100.0 * returned.Outerwear / sold.Outerwear === 8.0);
  db.close();
}

console.log("\n=== cohort-repeat-revenue — TS mirror of the offset arithmetic ===");
{
  const d = SQL_DF_RETAIL_B[2];
  const db = buildDb(d);
  // TS mirror straight from the seeded rows: month index = year*12 + month
  const ORDERS: Array<[number, string, number]> = [
    [101, "2026-05-04", 4000], [101, "2026-06-09", 2000], [101, "2026-07-14", 1500],
    [102, "2026-05-11", 6000], [102, "2026-07-02", 3000],
    [103, "2026-05-26", 5000],
    [201, "2026-06-07", 8000], [201, "2026-07-19", 2500],
    [202, "2026-06-19", 4500], [202, "2026-07-27", 1000],
    [301, "2026-07-03", 9500], [302, "2026-07-21", 5500],
  ];
  const idx = (dte: string) => Number(dte.slice(0, 4)) * 12 + Number(dte.slice(5, 7));
  const firstIdx = new Map<number, number>();
  for (const [c, dte] of ORDERS) firstIdx.set(c, Math.min(firstIdx.get(c) ?? Infinity, idx(dte)));
  const buckets: Record<string, number[]> = { "2026-05": [0, 0, 0], "2026-06": [0, 0, 0], "2026-07": [0, 0, 0] };
  for (const [c, dte, rev] of ORDERS) {
    const label = `${String(Math.floor((firstIdx.get(c) ?? 0) / 12))}-${String((firstIdx.get(c) ?? 0) % 12).padStart(2, "0")}`;
    buckets[label][idx(dte) - (firstIdx.get(c) ?? 0)] += rev;
  }
  ok("TS buckets: 2026-05 [15000,2000,4500] / 2026-06 [12500,3500,0] / 2026-07 [15000,0,0]",
    eq(buckets["2026-05"], [15000, 2000, 4500]) && eq(buckets["2026-06"], [12500, 3500, 0]) && eq(buckets["2026-07"], [15000, 0, 0]),
    JSON.stringify(buckets));
  const share = (b: number[]) => Math.round((100.0 * (b[1] + b[2]) / (b[0] + b[1] + b[2])) * 100) / 100;
  ok("TS shares: 30.23 / 21.88 / 0.0 (21.875 rounds half-away to 21.88)",
    share(buckets["2026-05"]) === 30.23 && share(buckets["2026-06"]) === 21.88 && share(buckets["2026-07"]) === 0,
    JSON.stringify([share(buckets["2026-05"]), share(buckets["2026-06"]), share(buckets["2026-07"])]));
  const raw = runSql(db, `SELECT customer_id, strftime('%Y-%m', MIN(order_date)) AS cm FROM orders GROUP BY customer_id ORDER BY customer_id`);
  ok("engine cohort labels: 101/102/103 -> 2026-05, 201/202 -> 2026-06, 301/302 -> 2026-07",
    eq(raw, [[101, "2026-05"], [102, "2026-05"], [103, "2026-05"], [201, "2026-06"], [202, "2026-06"], [301, "2026-07"], [302, "2026-07"]]),
    JSON.stringify(raw));
  ok("youngest cohort planted: no orders after 2026-07",
    !ORDERS.some(([, dte]) => dte.slice(0, 7) > "2026-07"));
  db.close();
}

/* ---------- planted-trap probes: the WRONG queries must produce the documented wrong outputs ---------- */
console.log("\n=== planted-trap probes ===");

// D1 traps
{
  const d = SQL_DF_RETAIL_B[0];
  const db = buildDb(d);
  const SOLD = `WITH sold AS (
      SELECT i.sku, i.on_hand_units, COALESCE(SUM(s.units), 0) AS units_28d
      FROM inventory i LEFT JOIN sales s ON s.sku = i.sku
      GROUP BY i.sku, i.on_hand_units)`;
  ok("D1 30-day-month pace (SUM/30*7): rates 93.3 / 261.3 / 0.0 / 84.0 / 70.0 by sku ASC",
    eq(runSql(db, `${SOLD}
      SELECT ROUND(1.0 * units_28d / 30 * 7, 1) AS bad_rate FROM sold ORDER BY sku ASC`),
      [[93.3], [261.3], [0], [84], [70]]));
  ok("D1 30-day-month countdowns: FST 0.5, BND 2.1, OKG 5.7, OVR 34.3, NOS 99.9 (guard kept)",
    eq(runSql(db, `${SOLD}
      SELECT sku,
        CASE WHEN units_28d = 0 THEN 99.9
             ELSE ROUND(1.0 * on_hand_units / ROUND(1.0 * units_28d / 30 * 7, 1), 1) END AS wos
      FROM sold ORDER BY sku ASC`),
      [["BND-4477", 2.1], ["FST-1101", 0.5], ["NOS-5512", 99.9], ["OKG-2205", 5.7], ["OVR-3390", 34.3]]));
  ok("D1 sentinel forgotten: the NOS row ships weeks_of_supply NULL and reorder 0 (310 / 0.0 is NULL in SQLite)",
    eq(runSql(db, `${SOLD}, calc AS (
        SELECT sku, on_hand_units, units_28d, ROUND(1.0 * units_28d / 4, 1) AS weekly_rate FROM sold)
      SELECT sku, on_hand_units, weekly_rate,
        ROUND(1.0 * on_hand_units / weekly_rate, 1) AS weeks_of_supply,
        CASE WHEN ROUND(1.0 * on_hand_units / weekly_rate, 1) < 2.0 THEN 1 ELSE 0 END AS reorder
      FROM calc WHERE sku = 'NOS-5512'`),
      [["NOS-5512", 310, 0, null, 0]]));
  ok("D1 inclusive <= boundary: BND-4477 flips to reorder 1 (strict < keeps it 0)",
    eq(runSql(db, `${SOLD}
      SELECT sku,
        CASE WHEN units_28d = 0 OR ROUND(1.0 * on_hand_units / ROUND(1.0 * units_28d / 4, 1), 1) <= 2.0
             THEN 1 ELSE 0 END AS bad_reorder
      FROM sold ORDER BY sku ASC`),
      [["BND-4477", 1], ["FST-1101", 1], ["NOS-5512", 1], ["OKG-2205", 0], ["OVR-3390", 0]]));
  ok("D1 INNER JOIN to sales drops the no-sales sku: 4 skus instead of 5",
    eq(runSql(db, `SELECT COUNT(DISTINCT i.sku) AS n FROM inventory i JOIN sales s ON s.sku = i.sku`),
      [[4]]));
  db.close();
}

// D2 traps
{
  const d = SQL_DF_RETAIL_B[1];
  const db = buildDb(d);
  ok("D2 INNER JOIN to returns drops Home: 3 categories instead of 4",
    eq(runSql(db, `SELECT COUNT(DISTINCT p.category) AS n
        FROM products p JOIN sales s ON s.sku = p.sku JOIN returns r ON r.sku = p.sku`),
      [[3]]));
  ok("D2 >= 8.0 flags the boundary category Outerwear (exactly 8.00) with 1",
    eq(runSql(db, `WITH sold AS (
        SELECT p.category, SUM(s.units) AS su FROM products p JOIN sales s ON s.sku = p.sku GROUP BY p.category),
      ret AS (
        SELECT p.category, SUM(r.units) AS ru FROM products p JOIN returns r ON r.sku = p.sku GROUP BY p.category)
      SELECT s.category,
        CASE WHEN ROUND(100.0 * COALESCE(r.ru, 0) / s.su, 2) >= 8.0 THEN 1 ELSE 0 END AS bad_flag
      FROM sold s LEFT JOIN ret r ON r.category = s.category ORDER BY s.category ASC`),
      [["Accessories", 1], ["Footwear", 1], ["Home", 0], ["Outerwear", 1]]));
  ok("D2 per-sku averaged rate: Accessories 11.33, Footwear 9.33, Outerwear 8.33, Home 0.0 (not 12.5/10.0/8.0/0.0)",
    eq(runSql(db, `WITH per_sku AS (
        SELECT p.category, p.sku,
          COALESCE((SELECT SUM(s.units) FROM sales s WHERE s.sku = p.sku), 0) AS su,
          COALESCE((SELECT SUM(r.units) FROM returns r WHERE r.sku = p.sku), 0) AS ru
        FROM products p)
      SELECT category, ROUND(AVG(100.0 * ru / su), 2) AS bad_pct
      FROM per_sku GROUP BY category ORDER BY bad_pct DESC, category ASC`),
      [["Accessories", 11.33], ["Footwear", 9.33], ["Outerwear", 8.33], ["Home", 0]]));
  ok("D2 integer division (100 * ru / su): Accessories truncates to 12 instead of 12.5",
    eq(runSql(db, `WITH sold AS (
        SELECT p.category, SUM(s.units) AS su FROM products p JOIN sales s ON s.sku = p.sku GROUP BY p.category),
      ret AS (
        SELECT p.category, SUM(r.units) AS ru FROM products p JOIN returns r ON r.sku = p.sku GROUP BY p.category)
      SELECT s.category, 100 * COALESCE(r.ru, 0) / s.su AS bad_pct
      FROM sold s LEFT JOIN ret r ON r.category = s.category ORDER BY s.category ASC`),
      [["Accessories", 12], ["Footwear", 10], ["Home", 0], ["Outerwear", 8]]));
  db.close();
}

// D3 traps
{
  const d = SQL_DF_RETAIL_B[2];
  const db = buildDb(d);
  const BASE = `WITH base AS (
      SELECT customer_id, order_date, revenue_cents,
        CAST(strftime('%Y', order_date) AS INTEGER) * 12
          + CAST(strftime('%m', order_date) AS INTEGER) AS month_idx
      FROM orders),
    firsts AS (
      SELECT customer_id, MIN(order_date) AS first_order,
        strftime('%Y-%m', MIN(order_date)) AS cohort_month,
        MIN(CAST(strftime('%Y', order_date) AS INTEGER) * 12
          + CAST(strftime('%m', order_date) AS INTEGER)) AS cohort_idx
      FROM orders GROUP BY customer_id)`;
  ok("D3 day-gap/30 offsets: customer 102's 52-day gap mis-files m2 -> m1 (2026-05 reads m1 5000, m2 1500)",
    eq(runSql(db, `${BASE},
      tagged30 AS (
        SELECT f.cohort_month,
          CAST((julianday(b.order_date) - julianday(f.first_order)) / 30 AS INTEGER) AS bad_off,
          b.revenue_cents
        FROM base b JOIN firsts f ON f.customer_id = b.customer_id),
      pv AS (
        SELECT cohort_month,
          SUM(CASE WHEN bad_off = 0 THEN revenue_cents ELSE 0 END) AS m0,
          SUM(CASE WHEN bad_off = 1 THEN revenue_cents ELSE 0 END) AS m1,
          SUM(CASE WHEN bad_off = 2 THEN revenue_cents ELSE 0 END) AS m2
        FROM tagged30 GROUP BY cohort_month)
      SELECT cohort_month, m0, m1, m2 FROM pv ORDER BY cohort_month ASC`),
      [["2026-05", 15000, 5000, 1500], ["2026-06", 12500, 3500, 0], ["2026-07", 15000, 0, 0]]));
  ok("D3 share over m0 alone: 43.33 / 28.0 / 0.0 instead of 30.23 / 21.88 / 0.0",
    eq(runSql(db, `WITH solution AS (${d.code.trim().replace(/;$/, "")})
      SELECT cohort_month,
        ROUND(100.0 * (m1_revenue + m2_revenue) / m0_revenue, 2) AS bad_share
      FROM solution ORDER BY cohort_month ASC`),
      [["2026-05", 43.33], ["2026-06", 28], ["2026-07", 0]]));
  ok("D3 HAVING m1 + m2 > 0 drops the youngest cohort: 2 rows instead of 3",
    eq(runSql(db, `WITH solution AS (${d.code.trim().replace(/;$/, "")})
      SELECT cohort_month FROM solution WHERE m1_revenue + m2_revenue > 0 ORDER BY cohort_month ASC`),
      [["2026-05"], ["2026-06"]]));
  ok("D3 month-only leak (no customer join-back): 2026-05 reads m0 15000, m1 14500, m2 23000",
    eq(runSql(db, `${BASE},
      spine AS (SELECT DISTINCT cohort_month, cohort_idx FROM firsts),
      leaked AS (
        SELECT s.cohort_month, b.month_idx - s.cohort_idx AS off, b.revenue_cents
        FROM spine s JOIN base b ON b.month_idx - s.cohort_idx BETWEEN 0 AND 2)
      SELECT s.cohort_month,
        COALESCE(SUM(CASE WHEN l.off = 0 THEN l.revenue_cents END), 0) AS m0,
        COALESCE(SUM(CASE WHEN l.off = 1 THEN l.revenue_cents END), 0) AS m1,
        COALESCE(SUM(CASE WHEN l.off = 2 THEN l.revenue_cents END), 0) AS m2
      FROM spine s
      LEFT JOIN leaked l ON l.cohort_month = s.cohort_month
      GROUP BY s.cohort_month ORDER BY s.cohort_month ASC`),
      [["2026-05", 15000, 14500, 23000], ["2026-06", 14500, 23000, 0], ["2026-07", 23000, 0, 0]]));
  db.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log(`ALL CHECKS PASS ${SQL_DF_RETAIL_B.length}/3`);
