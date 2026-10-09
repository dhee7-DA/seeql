// Task 74-h self-check — sql-df-quant-b.ts (3 Quant desk B dives).
// bun scripts/tmp-74-h-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_QUANT_B } from "../src/lib/leetcode/content/sql-df-quant-b";
import type { LcSqlDive } from "../src/lib/leetcode/types";

let pass = 0, fail = 0;
const failures: string[] = [];
const ok = (label: string, cond: boolean, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; failures.push(label + (detail ? ` — ${detail}` : "")); console.log(`  FAIL  ${label}${detail ? " — " + detail : ""}`); }
};
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const near = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps;

/* ---------- helpers (b4/73-c protocol) ---------- */
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

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

const allStrings = (d: LcSqlDive): string[] => {
  const out: string[] = [d.slug, d.statement, d.approach, d.code, d.time, d.space,
    ...d.examples.flatMap((e) => [e.input, e.output, e.explanation ?? ""]),
    ...d.constraints, ...d.breakdown, ...d.edges, ...d.walkthrough,
    ...d.followUps ?? [], ...d.related ?? [],
    ...d.ladder.flatMap((r) => [r.title, r.body]),
    d.schema.ddl, d.schema.seed, ...(d.schema.tables ?? []).flatMap((t) => [t.name, t.note])];
  if (d.primer) {
    out.push(d.primer.hook, d.primer.where,
      ...d.primer.concept, ...d.primer.worked, ...d.primer.reallife,
      ...d.primer.glossary.flatMap((g) => [g.term, g.def]));
  }
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
  slug: string; id: number; difficulty: "Easy" | "Medium" | "Hard"; xp: number; order: "exact" | "any";
  columns: string[]; rows: unknown[][]; realColumns: string[]; intColumns: string[];
}> = [
  { slug: "beta-benchmark", id: 8046, difficulty: "Hard", xp: 35, order: "any",
    columns: ["n_days", "covariance", "benchmark_variance", "beta", "style"],
    rows: [[24, 1.207988, 0.845399, 1.4289, "aggressive"]],
    realColumns: ["covariance", "benchmark_variance", "beta"], intColumns: ["n_days"] },
  { slug: "split-adjusted-position", id: 8047, difficulty: "Medium", xp: 20, order: "exact",
    columns: ["trade_id", "symbol", "raw_shares", "adjusted_shares", "raw_price_cents", "adjusted_price_cents", "adjustment"],
    rows: [
      [1, "ACME", 100, 200, 20000, 10000, "split-adjusted"],
      [2, "ACME", 40, 80, 21000, 10500, "split-adjusted"],
      [3, "ACME", 30, 60, 19500, 9750, "split-adjusted"],
      [4, "ACME", 50, 50, 10200, 10200, "as-traded"],
      [5, "ACME", 60, 60, 10400, 10400, "as-traded"],
      [6, "ACME", 25, 25, 10800, 10800, "as-traded"],
      [7, "ZYGO", 120, 120, 7500, 7500, "as-traded"],
      [8, "ZYGO", 70, 70, 7800, 7800, "as-traded"],
      [9, "ZYGO", 90, 90, 8100, 8100, "as-traded"],
    ],
    realColumns: [], intColumns: ["trade_id", "raw_shares", "adjusted_shares", "raw_price_cents", "adjusted_price_cents"] },
  { slug: "wash-trade-detection", id: 8048, difficulty: "Medium", xp: 20, order: "exact",
    columns: ["account_id", "symbol", "buy_trade_id", "sell_trade_id", "seconds_apart", "round_trip_pct"],
    rows: [
      [701, "QUA", 1, 2, 1, 0.0],
      [704, "WLT", 13, 14, 300, 1.0],
      [702, "ORB", 3, 4, 600, 0.5],
      [701, "NVI", 5, 6, 3600, 1.0],
    ],
    realColumns: ["round_trip_pct"], intColumns: ["account_id", "buy_trade_id", "sell_trade_id", "seconds_apart"] },
];
const XP: Record<string, number> = { Easy: 10, Medium: 20, Hard: 35 };

// related slugs may ONLY come from the brief's pool.
const RELATED_POOL = new Set([
  "max-drawdown", "duplicate-charge-pairs", "realized-pnl-average-cost", "dividend-income-calendar",
  "portfolio-concentration-hhi", "fx-exposure-report", "daily-balance-interest", "settlement-fails-aging",
  "npv-queries", "calculate-product-final-price", "bank-account-summary-ii",
]);
const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));

console.log(`\n=== sql-df-quant-b.ts — ${SQL_DF_QUANT_B.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_QUANT_B.length === 3 && SPEC.every((s, i) => SQL_DF_QUANT_B[i]?.slug === s.slug),
  SQL_DF_QUANT_B.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_QUANT_B[i];
  const spec = SPEC[i];
  console.log(`\n--- dive ${i + 1}: ${d.slug} ---`);

  // statement count + read-only + order contract
  ok("exactly ONE statement (countStatements)", countStatements(d.code) === 1);
  ok("exactly ONE statement (splitStatements)", splitStatements(d.code).length === 1);
  ok("read-only statement (WITH/SELECT)", /^\s*(with|select)\b/i.test(stripComments(d.code).trim()));
  ok(`order === "${spec.order}"`, d.order === spec.order);
  if (spec.order === "exact") {
    ok("result-level ORDER BY after stripping comments/OVER spans",
      /order\s+by/i.test(stripOver(stripComments(d.code))));
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
  ok("walkthrough: 3 paragraphs", d.walkthrough.length === 3);
  d.walkthrough.forEach((p, j) =>
    ok(`walkthrough para ${j + 1} has >= 3 sentences (got ${sentenceCount(p)})`, sentenceCount(p) >= 3));
  ok("2-3 followUps", (d.followUps?.length ?? 0) >= 2 && (d.followUps?.length ?? 0) <= 3);
  ok("exactly 3 related slugs", d.related?.length === 3, String(d.related?.length));
  d.related?.forEach((r) => {
    ok(`related slug from the brief's pool: ${r}`, RELATED_POOL.has(r));
    ok(`related slug exists in the registry: ${r}`, LC_SLUGS.has(r));
  });
  ok(`schema.tables has one entry per DDL table (${tableCount(d.schema.ddl)})`,
    (d.schema.tables?.length ?? 0) === tableCount(d.schema.ddl));

  // PRIMER audits (new in batch 3)
  ok("primer present", !!d.primer);
  if (d.primer) {
    const p = d.primer;
    ok(`primer hook is exactly 1 sentence (got ${sentenceCount(p.hook)})`, sentenceCount(p.hook) === 1);
    ok(`primer concept has 3-4 paragraphs (got ${p.concept.length})`, p.concept.length >= 3 && p.concept.length <= 4);
    p.concept.forEach((c, j) =>
      ok(`primer concept para ${j + 1} has >= 3 sentences (got ${sentenceCount(c)})`, sentenceCount(c) >= 3));
    ok(`primer worked has 3-5 steps (got ${p.worked.length})`, p.worked.length >= 3 && p.worked.length <= 5);
    ok("primer worked steps all nonempty", p.worked.every((w) => w.trim().length > 0));
    ok(`primer glossary has 4-6 entries (got ${p.glossary.length})`, p.glossary.length >= 4 && p.glossary.length <= 6);
    p.glossary.forEach((g, j) =>
      ok(`primer glossary entry ${j + 1} (${g.term}) def has >= 5 words (got ${wordCount(g.def)})`,
        g.term.trim().length > 0 && wordCount(g.def) >= 5));
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

  // MONEY convention: every money column (input or output, name ending _cents)
  // is INTEGER in the DDL and declared-integer in the contract; REAL is
  // reserved for returns/percentages (dive 1 legitimately has no _cents column).
  const moneyOut = spec.columns.filter((c) => /_cents$/.test(c));
  ok("every *_cents output column is declared integer", moneyOut.every((c) => spec.intColumns.includes(c)));
  const ddlMoney = (d.schema.ddl.match(/^\s*(\w+_cents)\s+(\w+)/gim) ?? [])
    .map((m) => m.trim().split(/\s+/));
  ok(`every *_cents DDL column is INTEGER (${ddlMoney.length} money columns)`,
    ddlMoney.every((p) => p[1] === "INTEGER"), JSON.stringify(ddlMoney));
  ok("declared REAL columns appear in the output", spec.realColumns.every((c) => spec.columns.includes(c)));
  ok("integer-timestamp DDL columns are INTEGER (no REAL ts)",
    (d.schema.ddl.match(/^\s*(\w+_ts)\s+(\w+)/gim) ?? []).every((m) => m.trim().split(/\s+/)[1] === "INTEGER"));

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
            near(Number(cell), Number(exp)), String(cell));
        }
      });
    });
    if (spec.order === "exact") {
      ok("rows === spec (order-sensitive, whole-array)", eq(r1, spec.rows), JSON.stringify(r1));
    } else {
      // order:"any": set-compare rows
      const a = r1.map((r) => JSON.stringify(r)).sort();
      const b = spec.rows.map((r) => JSON.stringify(r)).sort();
      ok("rows === spec (set-compare, order-insensitive)", eq(a, b), JSON.stringify(r1));
    }
    ok("every declared-integer cell is an integer",
      r1.every((row) => spec.intColumns.every((c) => Number.isInteger(row[spec.columns.indexOf(c)]))));
  } catch (e) {
    ok("engine build+run", false, String(e));
  }
}

/* ---------- per-dive hand verification ---------- */
console.log("\n=== beta — TS float mirror of covariance / variance / beta (1e-9) ===");
{
  const d = SQL_DF_QUANT_B[0];
  const db = buildDb(d);
  // the series as the ENGINE sees it (read back from the DB, date-ascending)
  const series = runSql(db, `SELECT asset_return_pct AS x, benchmark_return_pct AS y
      FROM daily_returns ORDER BY r_date ASC`);
  const xs = series.map((r) => r[0] as number);
  const ys = series.map((r) => r[1] as number);
  const n = 24;
  const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);
  const Sx = sum(xs), Sy = sum(ys);
  const Syy = sum(ys.map((v) => v * v));
  const Sxy = sum(xs.map((v, i) => v * ys[i]));
  const Sxx = sum(xs.map((v) => v * v));
  const tsCov = (Sxy - Sx * Sy / n) / n;
  const tsVar = (Syy - Sy * Sy / n) / n;
  const tsBeta = (n * Sxy - Sx * Sy) / (n * Syy - Sy * Sy);
  // the RAW aggregates straight out of the engine
  const raw = runSql(db, `SELECT COUNT(*) AS n, SUM(asset_return_pct) AS sx,
      SUM(benchmark_return_pct) AS sy,
      SUM(benchmark_return_pct * benchmark_return_pct) AS syy,
      SUM(asset_return_pct * benchmark_return_pct) AS sxy,
      SUM(asset_return_pct * asset_return_pct) AS sxx
    FROM daily_returns`)[0] as number[];
  ok("engine COUNT === 24", raw[0] === 24, String(raw[0]));
  ok(`|engine SUM(x) - ts| < 1e-9`, near(raw[1] as number, Sx), `${raw[1]} vs ${Sx}`);
  ok(`|engine SUM(y) - ts| < 1e-9`, near(raw[2] as number, Sy), `${raw[2]} vs ${Sy}`);
  ok(`|engine SUM(y*y) - ts| < 1e-9`, near(raw[3] as number, Syy), `${raw[3]} vs ${Syy}`);
  ok(`|engine SUM(x*y) - ts| < 1e-9`, near(raw[4] as number, Sxy), `${raw[4]} vs ${Sxy}`);
  ok(`|engine SUM(x*x) - ts| < 1e-9`, near(raw[5] as number, Sxx), `${raw[5]} vs ${Sxx}`);
  ok("hand-pinned sums: Sx -1.21, Sy -0.7, Syy 20.31, Sxy 29.027 (within 1e-9)",
    near(Sx, -1.21) && near(Sy, -0.7) && near(Syy, 20.31) && near(Sxy, 29.027),
    `${Sx} ${Sy} ${Syy} ${Sxy}`);
  // raw closed forms: engine expressions vs TS mirrors, all within 1e-9
  const rawForm = runSql(db, `SELECT (sxy - sx * sy * 1.0 / n) / n AS cov,
        (syy - sy * sy * 1.0 / n) / n AS var_y,
        (n * sxy - sx * sy) * 1.0 / (n * syy - sy * sy) AS beta
      FROM (SELECT COUNT(*) AS n, SUM(asset_return_pct) AS sx, SUM(benchmark_return_pct) AS sy,
        SUM(benchmark_return_pct * benchmark_return_pct) AS syy,
        SUM(asset_return_pct * benchmark_return_pct) AS sxy FROM daily_returns)`);
  ok(`|engine covariance(raw) - ts| < 1e-9`, near(rawForm[0][0] as number, tsCov), `${rawForm[0][0]} vs ${tsCov}`);
  ok(`|engine variance(raw) - ts| < 1e-9`, near(rawForm[0][1] as number, tsVar), `${rawForm[0][1]} vs ${tsVar}`);
  ok(`|engine beta(raw) - ts| < 1e-9`, near(rawForm[0][2] as number, tsBeta), `${rawForm[0][2]} vs ${tsBeta}`);
  ok("cov/var identity: |tsBeta - tsCov/tsVar| < 1e-9", near(tsBeta, tsCov / tsVar));
  ok(`raw beta ${tsBeta.toFixed(7)} in the target band [1.35, 1.45] and clearly above 1.05`,
    tsBeta >= 1.35 && tsBeta <= 1.45 && tsBeta > 1.05, String(tsBeta));
  // rounding agreement (SQLite ROUND is half-away-from-zero; all pins positive)
  ok(`ROUND(ts cov, 6) === 1.207988`, Math.round(tsCov * 1e6) / 1e6 === 1.207988, String(tsCov));
  ok(`ROUND(ts var, 6) === 0.845399`, Math.round(tsVar * 1e6) / 1e6 === 0.845399, String(tsVar));
  ok(`ROUND(ts beta, 4) === 1.4289`, Math.round(tsBeta * 1e4) / 1e4 === 1.4289, String(tsBeta));
  db.close();
}

console.log("\n=== split-adjusted — hand checks + value-invariance identity ===");
{
  const d = SQL_DF_QUANT_B[1];
  const db = buildDb(d);
  ok("exactly 3 split-adjusted trades (the pre-split ACME fills)",
    eq(runSql(db, `SELECT COUNT(*) FROM trades t JOIN splits s
        ON s.symbol = t.symbol AND s.split_date > t.trade_date`), [[3]]));
  ok("value invariance: adjusted_shares * adjusted_price_cents == shares * price_cents on ALL 9 trades",
    eq(runSql(db, `SELECT COUNT(*) FROM (
        SELECT CASE WHEN s.symbol IS NULL THEN t.shares
                 ELSE t.shares * s.ratio_num / s.ratio_den END
               * CASE WHEN s.symbol IS NULL THEN t.price_cents
                 ELSE t.price_cents * s.ratio_den / s.ratio_num END AS adj_value,
               t.shares * t.price_cents AS raw_value
        FROM trades t LEFT JOIN splits s ON s.symbol = t.symbol AND s.split_date > t.trade_date)
      WHERE adj_value = raw_value`), [[9]]));
  ok("hand restatements: trade 1 -> 200 @ 10000, trade 2 -> 80 @ 10500, trade 3 -> 60 @ 9750",
    eq(runSql(db, `SELECT trade_id, shares * 2 / 1, price_cents * 1 / 2 FROM trades
        WHERE trade_id IN (1, 2, 3) ORDER BY trade_id ASC`),
      [[1, 200, 10000], [2, 80, 10500], [3, 60, 9750]]));
  db.close();
}

console.log("\n=== wash-trade — hand checks on candidate pairs ===");
{
  const d = SQL_DF_QUANT_B[2];
  const db = buildDb(d);
  ok("17 seeded fills", eq(runSql(db, `SELECT COUNT(*) FROM trades`), [[17]]));
  ok("candidate pairs before the rank: exactly 5",
    eq(runSql(db, `SELECT COUNT(*) FROM trades b JOIN trades s
        ON s.account_id = b.account_id AND s.symbol = b.symbol AND s.quantity = b.quantity
       AND s.side = 'sell' AND s.trade_ts - b.trade_ts BETWEEN 1 AND 3600
       WHERE b.side = 'buy'`), [[5]]));
  ok("shipped seconds_apart column in order: 1 / 300 / 600 / 3600",
    (() => {
      const rows = runSql(db, d.code.replace(/;$/, ""));
      return eq(rows.map((r) => r[4]), [1, 300, 600, 3600]);
    })());
  ok("ZED pair at 3601 seconds excluded",
    eq(runSql(db, `SELECT COUNT(*) FROM trades b JOIN trades s
        ON s.account_id = b.account_id AND s.symbol = b.symbol AND s.quantity = b.quantity
       AND s.side = 'sell' AND s.trade_ts - b.trade_ts BETWEEN 1 AND 3600
       WHERE b.side = 'buy' AND b.trade_id = 7`), [[0]]));
  ok("hand round-trip percents: QUA 0.0, WLT 1.0, ORB 0.5, NVI 1.0 (within 1e-9)",
    (() => {
      const rows = runSql(db, `SELECT b.trade_id AS buy_trade_id, 100.0 * (s.price_cents - b.price_cents) / b.price_cents
          FROM trades b JOIN trades s ON s.trade_id = CASE b.trade_id
            WHEN 1 THEN 2 WHEN 13 THEN 14 WHEN 3 THEN 4 WHEN 5 THEN 6 END
        ORDER BY buy_trade_id ASC`);
      const exp: Record<number, number> = { 1: 0.0, 3: 0.5, 5: 1.0, 13: 1.0 };
      return rows.length === 4 && rows.every((r) => near(r[1] as number, exp[r[0] as number]));
    })());
  db.close();
}

/* ---------- planted-trap probes: the WRONG queries must produce the documented wrong outputs ---------- */
console.log("\n=== planted-trap probes ===");

// D1 traps
{
  const db = buildDb(SQL_DF_QUANT_B[0]);
  const AGG = `WITH agg AS (SELECT COUNT(*) AS n, SUM(asset_return_pct) AS sx,
      SUM(benchmark_return_pct) AS sy, SUM(benchmark_return_pct * benchmark_return_pct) AS syy,
      SUM(asset_return_pct * benchmark_return_pct) AS sxy,
      SUM(asset_return_pct * asset_return_pct) AS sxx FROM daily_returns)`;
  ok("D1 correlation instead of beta reads 0.9973 — a different question answered on the same sums",
    (() => {
      const r = runSql(db, `${AGG} SELECT (sxy - sx * sy * 1.0 / n) / n
          / sqrt((sxx - sx * sx * 1.0 / n) / n * (syy - sy * sy * 1.0 / n) / n) AS corr FROM agg`);
      return r.length === 1 && near(r[0][0] as number, 0.9973485649468069, 1e-12) && (r[0][0] as number) !== 1.4289;
    })());
  ok("D1 n-1 sample variant: covariance 1.260509, variance 0.882156 — beta UNCHANGED at 1.4289 (HAPPENS TO AGREE on the slope)",
    eq(runSql(db, `${AGG} SELECT
        ROUND((sxy - sx * sy * 1.0 / n) / (n - 1), 6),
        ROUND((syy - sy * sy * 1.0 / n) / (n - 1), 6),
        ROUND(((n * sxy - sx * sy) * 1.0 / (n - 1)) / ((n * syy - sy * sy) * 1.0 / (n - 1)), 4)
      FROM agg`),
      [[1.260509, 0.882156, 1.4289]]));
  ok("D1 swapping x and y reads the benchmark's beta against the asset: 0.6961, near but not equal to 1/1.4289 = 0.6998",
    (() => {
      const r = runSql(db, `${AGG} SELECT ROUND((n * sxy - sx * sy) * 1.0 / (n * sxx - sx * sx), 4),
        ROUND(1.0 / ((n * sxy - sx * sy) * 1.0 / (n * syy - sy * sy)), 4) FROM agg`);
      return r.length === 1 && r[0][0] === 0.6961 && r[0][1] === 0.6998 && Number(r[0][0]) !== Number(r[0][1]);
    })());
  ok("D1 testing the ROUNDED beta in the CASE lands the same row on this seed (HAPPENS TO AGREE — boundary seeds would expose it)",
    eq(runSql(db, `${AGG} SELECT n,
        ROUND((sxy - sx * sy * 1.0 / n) / n, 6),
        ROUND((syy - sy * sy * 1.0 / n) / n, 6),
        ROUND((n * sxy - sx * sy) * 1.0 / (n * syy - sy * sy), 4),
        CASE WHEN ROUND((n * sxy - sx * sy) * 1.0 / (n * syy - sy * sy), 4) > 1.05 THEN 'aggressive'
             WHEN ROUND((n * sxy - sx * sy) * 1.0 / (n * syy - sy * sy), 4) < 0.95 THEN 'defensive'
             ELSE 'market-like' END
      FROM agg`),
      [[24, 1.207988, 0.845399, 1.4289, "aggressive"]]));
  db.close();
}

// D2 traps
{
  const db = buildDb(SQL_DF_QUANT_B[1]);
  const ADJ = (joinOn: string, shares: string, price: string) => `SELECT
      t.trade_id, t.symbol, t.shares,
      CASE WHEN s.symbol IS NULL THEN t.shares ELSE t.shares * ${shares} END,
      t.price_cents,
      CASE WHEN s.symbol IS NULL THEN t.price_cents ELSE t.price_cents * ${price} END,
      CASE WHEN s.symbol IS NULL THEN 'as-traded' ELSE 'split-adjusted' END
    FROM trades t LEFT JOIN splits s ON ${joinOn}
    ORDER BY t.trade_id ASC`;
  ok("D2 date-only join (no symbol key) corrupts ZYGO trade 7 into 240 @ 3750 'split-adjusted'",
    eq(runSql(db, ADJ("s.split_date > t.trade_date", "s.ratio_num / s.ratio_den", "s.ratio_den / s.ratio_num")),
      [
        [1, "ACME", 100, 200, 20000, 10000, "split-adjusted"],
        [2, "ACME", 40, 80, 21000, 10500, "split-adjusted"],
        [3, "ACME", 30, 60, 19500, 9750, "split-adjusted"],
        [4, "ACME", 50, 50, 10200, 10200, "as-traded"],
        [5, "ACME", 60, 60, 10400, 10400, "as-traded"],
        [6, "ACME", 25, 25, 10800, 10800, "as-traded"],
        [7, "ZYGO", 120, 240, 7500, 3750, "split-adjusted"],
        [8, "ZYGO", 70, 70, 7800, 7800, "as-traded"],
        [9, "ZYGO", 90, 90, 8100, 8100, "as-traded"],
      ]));
  ok("D2 loosening to >= restates the ON-date trade too: trade 4 corrupts to 100 @ 5100 'split-adjusted' (5-6 still escape)",
    eq(runSql(db, ADJ("s.symbol = t.symbol AND s.split_date >= t.trade_date", "s.ratio_num / s.ratio_den", "s.ratio_den / s.ratio_num")),
      [
        [1, "ACME", 100, 200, 20000, 10000, "split-adjusted"],
        [2, "ACME", 40, 80, 21000, 10500, "split-adjusted"],
        [3, "ACME", 30, 60, 19500, 9750, "split-adjusted"],
        [4, "ACME", 50, 100, 10200, 5100, "split-adjusted"],
        [5, "ACME", 60, 60, 10400, 10400, "as-traded"],
        [6, "ACME", 25, 25, 10800, 10800, "as-traded"],
        [7, "ZYGO", 120, 120, 7500, 7500, "as-traded"],
        [8, "ZYGO", 70, 70, 7800, 7800, "as-traded"],
        [9, "ZYGO", 90, 90, 8100, 8100, "as-traded"],
      ]));
  ok("D2 flipping the join to split_date <= trade_date restates every POST-split fill instead: trades 4-6 corrupt, 1-3 escape",
    eq(runSql(db, ADJ("s.symbol = t.symbol AND s.split_date <= t.trade_date", "s.ratio_num / s.ratio_den", "s.ratio_den / s.ratio_num")),
      [
        [1, "ACME", 100, 100, 20000, 20000, "as-traded"],
        [2, "ACME", 40, 40, 21000, 21000, "as-traded"],
        [3, "ACME", 30, 30, 19500, 19500, "as-traded"],
        [4, "ACME", 50, 100, 10200, 5100, "split-adjusted"],
        [5, "ACME", 60, 120, 10400, 5200, "split-adjusted"],
        [6, "ACME", 25, 50, 10800, 5400, "split-adjusted"],
        [7, "ZYGO", 120, 120, 7500, 7500, "as-traded"],
        [8, "ZYGO", 70, 70, 7800, 7800, "as-traded"],
        [9, "ZYGO", 90, 90, 8100, 8100, "as-traded"],
      ]));
  ok("D2 inverting the price direction DOUBLES pre-split prices: 40000 / 42000 / 39000 instead of halving",
    eq(runSql(db, ADJ("s.symbol = t.symbol AND s.split_date > t.trade_date", "s.ratio_num / s.ratio_den", "s.ratio_num / s.ratio_den")),
      [
        [1, "ACME", 100, 200, 20000, 40000, "split-adjusted"],
        [2, "ACME", 40, 80, 21000, 42000, "split-adjusted"],
        [3, "ACME", 30, 60, 19500, 39000, "split-adjusted"],
        [4, "ACME", 50, 50, 10200, 10200, "as-traded"],
        [5, "ACME", 60, 60, 10400, 10400, "as-traded"],
        [6, "ACME", 25, 25, 10800, 10800, "as-traded"],
        [7, "ZYGO", 120, 120, 7500, 7500, "as-traded"],
        [8, "ZYGO", 70, 70, 7800, 7800, "as-traded"],
        [9, "ZYGO", 90, 90, 8100, 8100, "as-traded"],
      ]));
  ok("D2 ratio_den as the share numerator HALVES pre-split shares: 50 / 20 / 15 instead of doubling",
    eq(runSql(db, ADJ("s.symbol = t.symbol AND s.split_date > t.trade_date", "s.ratio_den / s.ratio_num", "s.ratio_den / s.ratio_num")),
      [
        [1, "ACME", 100, 50, 20000, 10000, "split-adjusted"],
        [2, "ACME", 40, 20, 21000, 10500, "split-adjusted"],
        [3, "ACME", 30, 15, 19500, 9750, "split-adjusted"],
        [4, "ACME", 50, 50, 10200, 10200, "as-traded"],
        [5, "ACME", 60, 60, 10400, 10400, "as-traded"],
        [6, "ACME", 25, 25, 10800, 10800, "as-traded"],
        [7, "ZYGO", 120, 120, 7500, 7500, "as-traded"],
        [8, "ZYGO", 70, 70, 7800, 7800, "as-traded"],
        [9, "ZYGO", 90, 90, 8100, 8100, "as-traded"],
      ]));
  ok("D2 an INNER JOIN under the correct date rule silently DROPS every non-pre-split trade: 3 rows",
    eq(runSql(db, `SELECT t.trade_id FROM trades t JOIN splits s
        ON s.symbol = t.symbol AND s.split_date > t.trade_date ORDER BY t.trade_id ASC`),
      [[1], [2], [3]]));
  db.close();
}

// D3 traps
{
  const db = buildDb(SQL_DF_QUANT_B[2]);
  const PAIRS = (window: string, extraJoin = "", rank = true) =>
    `WITH pairs AS (SELECT b.account_id AS account_id, b.symbol AS symbol,
        b.trade_id AS buy_trade_id, s.trade_id AS sell_trade_id,
        s.trade_ts - b.trade_ts AS seconds_apart,
        ROUND(100.0 * (s.price_cents - b.price_cents) / b.price_cents, 2) AS round_trip_pct,
        ROW_NUMBER() OVER (PARTITION BY b.trade_id ORDER BY s.trade_ts ASC, s.trade_id ASC) AS rn
      FROM trades b JOIN trades s
        ON s.account_id = b.account_id AND s.symbol = b.symbol AND s.quantity = b.quantity
       AND s.side = 'sell' ${extraJoin}
       AND s.trade_ts - b.trade_ts ${window}
      WHERE b.side = 'buy')
    SELECT account_id, symbol, buy_trade_id, sell_trade_id, seconds_apart, round_trip_pct
    FROM pairs ${rank ? "WHERE rn = 1" : ""} ORDER BY seconds_apart ASC, buy_trade_id ASC`;
  ok("D3 exclusive far bound (BETWEEN 1 AND 3599) drops the exactly-3600 NVI pair: 3 rows",
    eq(runSql(db, PAIRS("BETWEEN 1 AND 3599")),
      [[701, "QUA", 1, 2, 1, 0.0], [704, "WLT", 13, 14, 300, 1.0], [702, "ORB", 3, 4, 600, 0.5]]));
  ok("D3 bad self-join with the side guards kept pairs a buy with ITSELF — returns nothing (a trade carries one side)",
    eq(runSql(db, `SELECT COUNT(*) FROM trades b JOIN trades s
        ON s.trade_id = b.trade_id AND s.trade_ts - b.trade_ts >= 0
       WHERE b.side = 'buy' AND s.side = 'sell'`), [[0]]));
  ok("D3 fully unguarded self-pairing prints one phantom pair per fill: 17 garbage rows the guards prevent",
    eq(runSql(db, `SELECT COUNT(*) FROM trades b JOIN trades s
        ON s.trade_id = b.trade_id AND s.trade_ts - b.trade_ts >= 0`), [[17]]));
  ok("D3 dropping the rn = 1 rank fans out to 5 rows and invents the trade-15 trip (800s, 1.6)",
    eq(runSql(db, PAIRS("BETWEEN 1 AND 3600", "", false)),
      [
        [701, "QUA", 1, 2, 1, 0.0],
        [704, "WLT", 13, 14, 300, 1.0],
        [702, "ORB", 3, 4, 600, 0.5],
        [704, "WLT", 13, 15, 800, 1.6],
        [701, "NVI", 5, 6, 3600, 1.0],
      ]));
  ok("D3 dropping the quantity key resurrects the MNO 60-vs-50 mismatch: 5 rows with a 100-second trip",
    eq(runSql(db, `WITH pairs AS (SELECT b.account_id AS account_id, b.symbol AS symbol,
          b.trade_id AS buy_trade_id, s.trade_id AS sell_trade_id,
          s.trade_ts - b.trade_ts AS seconds_apart,
          ROUND(100.0 * (s.price_cents - b.price_cents) / b.price_cents, 2) AS round_trip_pct,
          ROW_NUMBER() OVER (PARTITION BY b.trade_id ORDER BY s.trade_ts ASC, s.trade_id ASC) AS rn
        FROM trades b JOIN trades s
          ON s.account_id = b.account_id AND s.symbol = b.symbol
         AND s.side = 'sell' AND s.trade_ts - b.trade_ts BETWEEN 1 AND 3600
        WHERE b.side = 'buy')
      SELECT account_id, symbol, buy_trade_id, sell_trade_id, seconds_apart, round_trip_pct
      FROM pairs WHERE rn = 1 ORDER BY seconds_apart ASC, buy_trade_id ASC`),
      [
        [701, "QUA", 1, 2, 1, 0.0],
        [703, "MNO", 9, 10, 100, 1.0],
        [704, "WLT", 13, 14, 300, 1.0],
        [702, "ORB", 3, 4, 600, 0.5],
        [701, "NVI", 5, 6, 3600, 1.0],
      ]));
  ok("D3 an ABS(delta) window resurrects the reversed PQR pair (sell 50 seconds BEFORE its buy): 5 rows led by -50",
    eq(runSql(db, `WITH pairs AS (SELECT b.account_id AS account_id, b.symbol AS symbol,
          b.trade_id AS buy_trade_id, s.trade_id AS sell_trade_id,
          s.trade_ts - b.trade_ts AS seconds_apart,
          ROUND(100.0 * (s.price_cents - b.price_cents) / b.price_cents, 2) AS round_trip_pct,
          ROW_NUMBER() OVER (PARTITION BY b.trade_id ORDER BY s.trade_ts ASC, s.trade_id ASC) AS rn
        FROM trades b JOIN trades s
          ON s.account_id = b.account_id AND s.symbol = b.symbol AND s.quantity = b.quantity
         AND s.side = 'sell' AND ABS(s.trade_ts - b.trade_ts) BETWEEN 1 AND 3600
        WHERE b.side = 'buy')
      SELECT account_id, symbol, buy_trade_id, sell_trade_id, seconds_apart, round_trip_pct
      FROM pairs WHERE rn = 1 ORDER BY seconds_apart ASC, buy_trade_id ASC`),
      [
        [702, "PQR", 12, 11, -50, 0.0],
        [701, "QUA", 1, 2, 1, 0.0],
        [704, "WLT", 13, 14, 300, 1.0],
        [702, "ORB", 3, 4, 600, 0.5],
        [701, "NVI", 5, 6, 3600, 1.0],
      ]));
  db.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log(`ALL CHECKS PASS ${SQL_DF_QUANT_B.length}/3`);
