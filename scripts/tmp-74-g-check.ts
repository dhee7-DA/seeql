// Task 74-g self-check — sql-df-quant-a.ts (3 Quant Desk A dives with primers).
// bun scripts/tmp-74-g-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_QUANT_A } from "../src/lib/leetcode/content/sql-df-quant-a";
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
  { slug: "time-weighted-return", id: 8043, difficulty: "Hard", xp: 35,
    columns: ["period_no", "period_start", "period_end", "flow_cents", "period_return_pct"],
    rows: [
      [1, "2026-09-01", "2026-09-08", 10000, -0.5],
      [2, "2026-09-08", "2026-09-18", -5000, -4.1096],
      [3, "2026-09-18", "2026-09-30", 0, 8],
    ],
    realColumns: ["period_return_pct"], intColumns: ["period_no", "flow_cents"], order: "exact" },
  { slug: "sharpe-ratio", id: 8044, difficulty: "Medium", xp: 20,
    columns: ["trading_days", "mean_excess_pct", "daily_vol_pct", "sharpe_daily"],
    rows: [[29, 0.043, 0.3874, 0.11]],
    realColumns: ["mean_excess_pct", "daily_vol_pct", "sharpe_daily"], intColumns: ["trading_days"], order: "any" },
  { slug: "value-at-risk", id: 8045, difficulty: "Medium", xp: 20,
    columns: ["n_returns", "var95_pct", "worst_pct"],
    rows: [[100, -1.3056, -3.1904]],
    realColumns: ["var95_pct", "worst_pct"], intColumns: ["n_returns"], order: "any" },
];
const XP: Record<string, number> = { Easy: 10, Medium: 20, Hard: 35 };

// related slugs may ONLY come from the brief's verified pool.
const RELATED_POOL = new Set([
  "max-drawdown", "portfolio-concentration-hhi", "realized-pnl-average-cost", "daily-balance-interest",
  "dividend-income-calendar", "fx-exposure-report", "loan-amortization-schedule", "portfolio-weights",
  "npv-queries", "calculate-product-final-price", "bank-account-summary-ii",
]);
const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));

console.log(`\n=== sql-df-quant-a.ts — ${SQL_DF_QUANT_A.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_QUANT_A.length === 3 && SPEC.every((s, i) => SQL_DF_QUANT_A[i]?.slug === s.slug),
  SQL_DF_QUANT_A.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_QUANT_A[i];
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
    ok(`related slug from the verified pool: ${r}`, RELATED_POOL.has(r));
    ok(`related slug exists in the registry: ${r}`, LC_SLUGS.has(r));
  });
  ok(`schema.tables has one entry per DDL table (${tableCount(d.schema.ddl)})`,
    (d.schema.tables?.length ?? 0) === tableCount(d.schema.ddl));

  // PRIMER audits (new in this batch — every dive must carry one)
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

  // MONEY convention: every money column (input or output, name ending _cents/_minor)
  // is INTEGER in the DDL and declared-integer in the contract (REAL is reserved
  // for returns/percentages).
  const moneyOut = spec.columns.filter((c) => /(_cents|_minor)$/.test(c));
  ok("every *_cents/_minor output column is declared integer", moneyOut.every((c) => spec.intColumns.includes(c)));
  const ddlMoney = (d.schema.ddl.match(/^\s*(\w+_cents|\w+_minor)\s+(\w+)/gim) ?? [])
    .map((m) => m.trim().split(/\s+/));
  ok(`every *_cents/_minor DDL column is INTEGER (${ddlMoney.length} money columns)`,
    ddlMoney.length > 0 && ddlMoney.every((part) => part[1] === "INTEGER"), JSON.stringify(ddlMoney));
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

/* ---------- per-dive hand verification: TS float mirrors (1e-9) ---------- */

console.log("\n=== time-weighted-return — TS mirror of the three sub-period returns ===");
{
  const d = SQL_DF_QUANT_A[0];
  const db = buildDb(d);
  const RAW = `WITH boundaries(period_no, boundary_date) AS (
      VALUES (1, '2026-09-01'), (2, '2026-09-08'), (3, '2026-09-18'), (4, '2026-09-30')),
    periods AS (SELECT a.period_no, a.boundary_date AS period_start, b.boundary_date AS period_end
      FROM boundaries a JOIN boundaries b ON b.period_no = a.period_no + 1),
    flow_at_end AS (SELECT p.period_no, COALESCE(SUM(f.cash_flow_cents), 0) AS flow_cents
      FROM periods p LEFT JOIN flows f ON f.flow_date = p.period_end GROUP BY p.period_no)
    SELECT p.period_no, fe.flow_cents, v0.eod_value_cents AS v0c, v1.eod_value_cents AS v1c,
      100.0 * ((v1.eod_value_cents - fe.flow_cents) - v0.eod_value_cents) / v0.eod_value_cents AS r_raw
    FROM periods p
    JOIN flow_at_end fe ON fe.period_no = p.period_no
    JOIN valuations v0 ON v0.value_date = p.period_start
    JOIN valuations v1 ON v1.value_date = p.period_end
    ORDER BY p.period_no ASC`;
  const raw = runSql(db, RAW);
  ok("raw query returns the 3 sub-periods", raw.length === 3, String(raw.length));
  // TS mirror, identical op order per period
  const periods: Array<[number, number]> = [[100000, 109500], [109500, 100000], [100000, 108000]];
  const flows = [10000, -5000, 0];
  const tsR: number[] = [];
  periods.forEach(([v0, v1], i) => {
    const r = ((v1 - flows[i]) - v0) * 100.0 / v0;
    tsR.push(r);
    ok(`P${i + 1} engine raw within 1e-9 of TS mirror (${r})`,
      Math.abs((raw[i][4] as number) - r) < 1e-9, `${raw[i][4]} vs ${r}`);
    ok(`P${i + 1} engine flow_cents === ${flows[i]}`, raw[i][1] === flows[i], String(raw[i][1]));
  });
  ok("hand pins: -0.5 / -4.109589041095891 / 8 (1e-9)",
    Math.abs(tsR[0] - (-0.5)) < 1e-9 && Math.abs(tsR[1] - (-4.109589041095891)) < 1e-9 && Math.abs(tsR[2] - 8) < 1e-9,
    JSON.stringify(tsR));
  // chained TWR: TS product vs SQL direct product on the same raws
  const tsChained = (1.0 + tsR[0] / 100.0) * (1.0 + tsR[1] / 100.0) * (1.0 + tsR[2] / 100.0) - 1.0;
  const sqlChained = runSql(db, `WITH r AS (${RAW})
    SELECT (1.0 + (SELECT r_raw FROM r WHERE period_no = 1) / 100.0)
         * (1.0 + (SELECT r_raw FROM r WHERE period_no = 2) / 100.0)
         * (1.0 + (SELECT r_raw FROM r WHERE period_no = 3) / 100.0) - 1.0 AS chained`)[0][0] as number;
  ok(`chained TWR within 1e-9 of TS mirror (${tsChained})`, Math.abs(sqlChained - tsChained) < 1e-9, `${sqlChained} vs ${tsChained}`);
  ok("chained TWR rounds to 3.0438 pct", Math.round(tsChained * 100.0 * 10000) / 10000 === 3.0438, String(tsChained * 100.0));
  // averaging the ROUNDED report cells is the documented wrong read
  const solAvg = runSql(db, `WITH solution AS (${d.code.slice(0, -1)}) SELECT AVG(period_return_pct) FROM solution`)[0][0] as number;
  const tsAvg = (-0.5 + -4.1096 + 8.0) / 3.0;
  ok(`average-of-rounded-cells within 1e-9 of TS mirror (${tsAvg})`, Math.abs(solAvg - tsAvg) < 1e-9, `${solAvg} vs ${tsAvg}`);
  ok("average is NOT the chained TWR (gap > 1.5 pct points)", Math.abs(solAvg - tsChained * 100.0) > 1.5,
    `${solAvg} vs ${tsChained * 100.0}`);
  db.close();
}

console.log("\n=== sharpe-ratio — TS float mirror of the raw aggregates ===");
{
  const d = SQL_DF_QUANT_A[1];
  const db = buildDb(d);
  const V: number[] = [];
  for (let t = 0; t < 30; t++) V.push(100000 + 45 * t + (t % 2 === 1 ? 195 : -195));
  ok("seed mirror: 30 values ending at 101500", V.length === 30 && V[0] === 99805 && V[29] === 101500, `${V[0]}..${V[29]}`);
  // TS mirror, identical op order: (Vt - Vprev) * 100.0 / Vprev, then - 4.0/252.0
  let sum = 0, sumsq = 0, sumR = 0;
  for (let t = 1; t < 30; t++) {
    const r = (V[t] - V[t - 1]) * 100.0 / V[t - 1];
    const ex = r - 4.0 / 252.0;
    sumR += r; sum += ex; sumsq += ex * ex;
  }
  const mean = sum / 29.0;
  const sigma = Math.sqrt(sumsq / 29.0 - mean * mean);
  const sharpe = mean / sigma;
  const raw = runSql(db, `WITH rets AS (
      SELECT 100.0 * (eod_value_cents - LAG(eod_value_cents) OVER (ORDER BY value_date))
          / LAG(eod_value_cents) OVER (ORDER BY value_date) AS r_pct
      FROM daily_values),
    excess AS (SELECT r_pct - 4.0 / 252.0 AS ex FROM rets WHERE r_pct IS NOT NULL)
    SELECT COUNT(*), AVG(ex), sqrt(AVG(1.0 * ex * ex) - AVG(1.0 * ex) * AVG(1.0 * ex)),
      AVG(ex) / sqrt(AVG(1.0 * ex * ex) - AVG(1.0 * ex) * AVG(1.0 * ex)) FROM excess`)[0];
  ok("engine trading_days raw === 29", raw[0] === 29, String(raw[0]));
  ok(`engine raw mean within 1e-9 of TS mirror (${mean})`, Math.abs((raw[1] as number) - mean) < 1e-9, `${raw[1]} vs ${mean}`);
  ok(`engine raw sigma within 1e-9 of TS mirror (${sigma})`, Math.abs((raw[2] as number) - sigma) < 1e-9, `${raw[2]} vs ${sigma}`);
  ok(`engine raw sharpe within 1e-9 of TS mirror (${sharpe})`, Math.abs((raw[3] as number) - sharpe) < 1e-9, `${raw[3]} vs ${sharpe}`);
  ok("pins: mean 0.04296477683056378 / sigma 0.3874242363097246 / sharpe 0.11089852622492047",
    raw[1] === 0.04296477683056378 && raw[2] === 0.3874242363097246 && raw[3] === 0.11089852622492047,
    JSON.stringify([raw[1], raw[2], raw[3]]));
  ok("sharpe_daily lands clearly off the 2dp rounding edges (>= 3 of 1000 from x.xx5)",
    Math.abs((sharpe * 1000) % 10 - 5) >= 3, String(sharpe));
  ok("first daily return mirror === 0.4358499073192726 (the example's 0.4358)",
    Math.abs((V[1] - V[0]) * 100.0 / V[0] - 0.4358499073192726) < 1e-9,
    String((V[1] - V[0]) * 100.0 / V[0]));
  db.close();
}

console.log("\n=== value-at-risk — TS mirror of the ranked tail ===");
{
  const d = SQL_DF_QUANT_A[2];
  const db = buildDb(d);
  // TS mirror of ALL 100 returns straight from the seeded cents
  const vals = runSql(db, `SELECT value_date, eod_value_cents FROM daily_values ORDER BY value_date ASC`);
  ok("seed holds exactly 101 consecutive rows", vals.length === 101, String(vals.length));
  const rets: number[] = [];
  for (let t = 1; t < vals.length; t++) rets.push(((vals[t][1] as number) - (vals[t - 1][1] as number)) * 100.0 / (vals[t - 1][1] as number));
  ok("TS mirror produces exactly 100 returns", rets.length === 100, String(rets.length));
  ok("all 100 returns distinct (ROW_NUMBER tie-free)", new Set(rets).size === 100, String(new Set(rets).size));
  const sorted = [...rets].sort((a, b) => a - b);
  const raw = runSql(db, `WITH rets AS (
      SELECT 100.0 * (eod_value_cents - LAG(eod_value_cents) OVER (ORDER BY value_date))
          / LAG(eod_value_cents) OVER (ORDER BY value_date) AS r_pct
      FROM daily_values),
    ranked AS (SELECT r_pct, ROW_NUMBER() OVER (ORDER BY r_pct ASC) AS rn FROM rets WHERE r_pct IS NOT NULL)
    SELECT (SELECT r_pct FROM ranked WHERE rn = 1), (SELECT r_pct FROM ranked WHERE rn = 4),
      (SELECT r_pct FROM ranked WHERE rn = 5), (SELECT r_pct FROM ranked WHERE rn = 6), MIN(r_pct) FROM ranked`)[0];
  ([1, 4, 5, 6] as const).forEach((rn, i) => {
    const ts = sorted[rn - 1];
    ok(`rank ${rn} engine raw within 1e-9 of TS mirror (${ts})`, Math.abs((raw[i] as number) - ts) < 1e-9, `${raw[i]} vs ${ts}`);
  });
  ok("worst (MIN) within 1e-9 of TS mirror", Math.abs((raw[4] as number) - sorted[0]) < 1e-9, `${raw[4]} vs ${sorted[0]}`);
  // the five worst are separated by >= 10 bps from each other and from rank 6
  const gaps = [0, 1, 2, 3, 4].map((i) => sorted[i] - sorted[i + 1]);
  ok(`five worst gaps all >= 10 bps (${gaps.map((g) => (g * 100).toFixed(1)).join(", ")})`,
    gaps.every((g) => Math.abs(g) >= 0.1), JSON.stringify(gaps));
  ok("pins: var95 raw -1.3055540444976337 / worst raw -3.1904287138584246",
    raw[2] === -1.3055540444976337 && raw[4] === -3.1904287138584246,
    JSON.stringify([raw[2], raw[4]]));
  ok("crash-day example: 2026-07-07 100300 -> 97100 reads -3.1904287... (1e-9)",
    Math.abs((97100 - 100300) * 100.0 / 100300 - sorted[0]) < 1e-9,
    String((97100 - 100300) * 100.0 / 100300));
  db.close();
}

/* ---------- planted-trap probes: the WRONG queries must produce the documented wrong outputs ---------- */
console.log("\n=== planted-trap probes ===");

// D1 traps
{
  const d = SQL_DF_QUANT_A[0];
  const db = buildDb(d);
  const BOUNDS = `WITH boundaries(period_no, boundary_date) AS (
      VALUES (1, '2026-09-01'), (2, '2026-09-08'), (3, '2026-09-18'), (4, '2026-09-30')),
    periods AS (SELECT a.period_no, a.boundary_date AS period_start, b.boundary_date AS period_end
      FROM boundaries a JOIN boundaries b ON b.period_no = a.period_no + 1),
    flow_at_end AS (SELECT p.period_no, COALESCE(SUM(f.cash_flow_cents), 0) AS flow_cents
      FROM periods p LEFT JOIN flows f ON f.flow_date = p.period_end GROUP BY p.period_no)`;
  ok("D1 naive (V1 - V0) / V0 treats the deposit as return: 9.5 / -8.6758 / 8",
    eq(runSql(db, `${BOUNDS}
      SELECT p.period_no, ROUND(100.0 * (v1.eod_value_cents - v0.eod_value_cents) / v0.eod_value_cents, 4) AS naive_pct
      FROM periods p
      JOIN valuations v0 ON v0.value_date = p.period_start
      JOIN valuations v1 ON v1.value_date = p.period_end
      ORDER BY p.period_no ASC`),
      [[1, 9.5], [2, -8.6758], [3, 8]]));
  ok("D1 sign-flipped flows (withdrawal subtracted twice): 19.5 / -13.242 / 8",
    eq(runSql(db, `${BOUNDS}
      SELECT p.period_no, ROUND(100.0 * ((v1.eod_value_cents + fe.flow_cents) - v0.eod_value_cents) / v0.eod_value_cents, 4) AS flipped_pct
      FROM periods p
      JOIN flow_at_end fe ON fe.period_no = p.period_no
      JOIN valuations v0 ON v0.value_date = p.period_start
      JOIN valuations v1 ON v1.value_date = p.period_end
      ORDER BY p.period_no ASC`),
      [[1, 19.5], [2, -13.242], [3, 8]]));
  ok("D1 decoy MAX-in-window read: 9.5 / 2.2831 / 11.0 (grabs 112000 and 111000)",
    eq(runSql(db, `${BOUNDS}
      SELECT p.period_no, ROUND(100.0 * ((SELECT MAX(eod_value_cents) FROM valuations
          WHERE value_date > p.period_start AND value_date <= p.period_end)
        - v0.eod_value_cents) / v0.eod_value_cents, 4) AS decoy_pct
      FROM periods p
      JOIN valuations v0 ON v0.value_date = p.period_start
      ORDER BY p.period_no ASC`),
      [[1, 9.5], [2, 2.2831], [3, 11]]));
  ok("D1 INNER join to flows drops the flowless period 3: 2 rows",
    eq(runSql(db, `SELECT COUNT(*) AS rows_out FROM (
        ${d.code.trim().replace(/;$/, "").replace("LEFT JOIN flows f ON f.flow_date = p.period_end", "JOIN flows f ON f.flow_date = p.period_end")} )`),
      [[2]]));
  // boundary valuation missing -> the INNER joins silently erase periods 2 AND 3
  const db2 = buildDb(d);
  db2.run(`DELETE FROM valuations WHERE value_date = '2026-09-18'`);
  ok("D1 deleting the 2026-09-18 boundary valuation erases periods 2 AND 3: 1 row",
    runSql(db2, d.code).length === 1, String(runSql(db2, d.code).length));
  db2.close();
  db.close();
}

// D2 traps
{
  const d = SQL_DF_QUANT_A[1];
  const db = buildDb(d);
  const EX = `WITH rets AS (
      SELECT 100.0 * (eod_value_cents - LAG(eod_value_cents) OVER (ORDER BY value_date))
          / LAG(eod_value_cents) OVER (ORDER BY value_date) AS r_pct
      FROM daily_values),
    excess AS (SELECT r_pct - 4.0 / 252.0 AS ex FROM rets WHERE r_pct IS NOT NULL)`;
  ok("D2 sample sigma (n - 1) reads 0.3943, not the contract's 0.3874",
    eq(runSql(db, `${EX}
      SELECT ROUND(sqrt((SUM(1.0 * ex * ex) - SUM(ex) * SUM(ex) / COUNT(*)) / (COUNT(*) - 1)), 4) AS sample_vol FROM excess`),
      [[0.3943]]));
  ok("D2 skipping the risk-free subtraction reads 0.0588, not 0.043",
    eq(runSql(db, `WITH rets AS (
        SELECT 100.0 * (eod_value_cents - LAG(eod_value_cents) OVER (ORDER BY value_date))
            / LAG(eod_value_cents) OVER (ORDER BY value_date) AS r_pct
        FROM daily_values)
      SELECT ROUND(AVG(r_pct), 4) AS mean_raw FROM rets WHERE r_pct IS NOT NULL`),
      [[0.0588]]));
  ok("D2 annualizing with x252 (27.95) instead of sqrt(252) (1.76) overstates by a factor of ~15.9",
    eq(runSql(db, `${EX},
      agg AS (SELECT AVG(ex) AS m, sqrt(AVG(1.0 * ex * ex) - AVG(1.0 * ex) * AVG(1.0 * ex)) AS s FROM excess)
      SELECT ROUND(m / s * 252, 2), ROUND(m / s * sqrt(252.0), 2) FROM agg`),
      [[27.95, 1.76]]));
  ok("D2 rounding before the division HAPPENS TO AGREE on this seed (0.11 == 0.11) — contract still divides raw",
    eq(runSql(db, `${EX},
      agg AS (SELECT AVG(ex) AS m, sqrt(AVG(1.0 * ex * ex) - AVG(1.0 * ex) * AVG(1.0 * ex)) AS s FROM excess)
      SELECT ROUND(ROUND(m, 4) / ROUND(s, 4), 2) FROM agg`),
      [[0.11]]));
  ok("D2 counting the LAG-less rows (no NULL filter) reads 30, not 29",
    eq(runSql(db, `WITH rets AS (
        SELECT 100.0 * (eod_value_cents - LAG(eod_value_cents) OVER (ORDER BY value_date))
            / LAG(eod_value_cents) OVER (ORDER BY value_date) AS r_pct
        FROM daily_values)
      SELECT COUNT(*) FROM rets`),
      [[30]]));
  db.close();
}

// D3 traps
{
  const d = SQL_DF_QUANT_A[2];
  const db = buildDb(d);
  const RANK = `WITH rets AS (
      SELECT 100.0 * (eod_value_cents - LAG(eod_value_cents) OVER (ORDER BY value_date))
          / LAG(eod_value_cents) OVER (ORDER BY value_date) AS r_pct
      FROM daily_values),
    ranked AS (SELECT r_pct, ROW_NUMBER() OVER (ORDER BY r_pct ASC) AS rn FROM rets WHERE r_pct IS NOT NULL)`;
  ok("D3 rn = 4 off-by-one reads the 4th-worst crash: -1.717, not -1.3056",
    eq(runSql(db, `${RANK}
      SELECT ROUND((SELECT r_pct FROM ranked WHERE rn = 4), 4) AS wrong_var FROM ranked LIMIT 1`),
      [[-1.717]]));
  ok("D3 sorting DESC reads the 5th BEST day: +0.0824, not -1.3056",
    eq(runSql(db, `WITH rets AS (
        SELECT 100.0 * (eod_value_cents - LAG(eod_value_cents) OVER (ORDER BY value_date))
            / LAG(eod_value_cents) OVER (ORDER BY value_date) AS r_pct
        FROM daily_values),
      ranked AS (SELECT r_pct, ROW_NUMBER() OVER (ORDER BY r_pct DESC) AS rn FROM rets WHERE r_pct IS NOT NULL)
      SELECT ROUND((SELECT r_pct FROM ranked WHERE rn = 5), 4) AS wrong_var FROM ranked LIMIT 1`),
      [[0.0824]]));
  ok("D3 printing the absolute value inverts the loss: +1.3056, not -1.3056",
    eq(runSql(db, `${RANK}
      SELECT ROUND(ABS((SELECT r_pct FROM ranked WHERE rn = 5)), 4) AS wrong_var FROM ranked LIMIT 1`),
      [[1.3056]]));
  ok("D3 counting daily_values instead of returns reads 101, not 100",
    eq(runSql(db, `SELECT COUNT(*) AS n FROM daily_values`), [[101]]));
  ok("D3 rn = 6 reads the mild -0.066 (>= 10 bps above VaR95), not -1.3056",
    eq(runSql(db, `${RANK}
      SELECT ROUND((SELECT r_pct FROM ranked WHERE rn = 6), 4) AS rank6 FROM ranked LIMIT 1`),
      [[-0.066]]));
  db.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log(`ALL CHECKS PASS ${SQL_DF_QUANT_A.length}/3`);
