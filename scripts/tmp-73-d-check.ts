// Task 73-d self-check — sql-df-markets-b.ts (3 Data & Finance markets dives).
// bun scripts/tmp-73-d-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_MARKETS_B } from "../src/lib/leetcode/content/sql-df-markets-b";
import { LC_XP } from "../src/lib/leetcode/types";
import type { LcSqlDive, LcDifficulty } from "../src/lib/leetcode/types";

let pass = 0, fail = 0;
const failures: string[] = [];
const ok = (label: string, cond: boolean, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; failures.push(label + (detail ? ` — ${detail}` : "")); console.log(`  FAIL  ${label}${detail ? " — " + detail : ""}`); }
};
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const near = (a: unknown, b: number, tol = 1e-9) => typeof a === "number" && Math.abs(a - b) < tol;

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
// Pinned output contracts (hand-derived, engine-verified; see per-cell asserts).
const SPEC: Array<{
  slug: string; num: number; difficulty: LcDifficulty; xp: number;
  columns: string[]; rows: unknown[][]; intColumns: string[];
  ddlCount: number; seedCount: number; relatedPool: string[];
}> = [
  {
    slug: "dividend-income-calendar", num: 8022, difficulty: "Medium", xp: 20,
    columns: ["account_id", "symbol", "pay_date", "shares", "income_cents"],
    rows: [
      [1, "JNJ", "2026-12-08", 40, 5200],
      [2, "JNJ", "2026-12-08", 75, 9750],
      [1, "KO", "2026-12-11", 150, 7200],
      [2, "KO", "2026-12-11", 300, 14400],
      [1, "KO", "2027-03-12", 150, 7800],
      [2, "KO", "2027-03-12", 300, 15600],
    ],
    intColumns: ["account_id", "shares", "income_cents"],
    ddlCount: 2, seedCount: 2,
    relatedPool: ["calculate-product-final-price", "realized-pnl-average-cost", "portfolio-weights", "settlement-fails-aging"],
  },
  {
    slug: "max-drawdown", num: 8023, difficulty: "Hard", xp: 35,
    columns: ["portfolio_id", "max_drawdown_pct", "trough_date", "peak_date"],
    rows: [
      [1, -3.42, "2026-09-10", "2026-09-08"],
      [2, -8.1, "2026-09-11", "2026-09-09"],
    ],
    intColumns: ["portfolio_id"],
    ddlCount: 1, seedCount: 1,
    relatedPool: ["year-on-year-growth-rate", "portfolio-weights", "rolling-average-steps", "growth-accounting"],
  },
  {
    slug: "duplicate-charge-pairs", num: 8024, difficulty: "Medium", xp: 20,
    columns: ["charge_id_a", "charge_id_b", "seconds_apart"],
    rows: [
      [101, 102, 90],
      [102, 103, 110],
      [110, 111, 45],
      [120, 121, 120],
      [170, 171, 0],
    ],
    intColumns: ["charge_id_a", "charge_id_b", "seconds_apart"],
    ddlCount: 1, seedCount: 1,
    relatedPool: ["top-percentile-fraud", "gl-reconciliation", "delinquency-buckets", "settlement-fails-aging"],
  },
];

const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));

/* ---------- raw-file hygiene (covers the header comment too) ---------- */
console.log(`\n=== sql-df-markets-b.ts — ${SQL_DF_MARKETS_B.length} dives expected ===\n`);
{
  const raw = await Bun.file(new URL("../src/lib/leetcode/content/sql-df-markets-b.ts", import.meta.url)).text();
  ok("raw file: no platform strings (leetcode/hackerrank/datalemur/stratascratch)", !/leetcode|hackerrank|datalemur|stratascratch/i.test(raw));
  ok("raw file: no ${ template interpolation", !raw.includes("${"));
  ok("raw file: header pins the lead wiring (8022/8023/8024)",
    raw.includes("8022 dividend-income-calendar") && raw.includes("8023 max-drawdown") && raw.includes("8024 duplicate-charge-pairs"));
}

ok("file exports exactly 3 dives in spec order",
  SQL_DF_MARKETS_B.length === 3 && SPEC.every((s, i) => SQL_DF_MARKETS_B[i]?.slug === s.slug),
  SQL_DF_MARKETS_B.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_MARKETS_B[i];
  const spec = SPEC[i];
  console.log(`\n--- dive ${i + 1}: ${d.slug} ---`);

  // statement count + result-level ORDER BY
  ok("exactly ONE statement (countStatements)", countStatements(d.code) === 1);
  ok("exactly ONE statement (splitStatements)", splitStatements(d.code).length === 1);
  const stripped = stripOver(stripComments(d.code));
  ok("result-level ORDER BY after stripping comments/OVER spans", /order\s+by/i.test(stripped));
  ok('order === "exact"', d.order === "exact");
  ok(`xp === ${spec.xp}`, d.xp === spec.xp);
  ok(`xp matches LC_XP[${spec.difficulty}] (Easy 10 / Medium 20 / Hard 35)`, d.xp === LC_XP[spec.difficulty]);
  ok("no writeVerify (read-only problem)", (d as unknown as Record<string, unknown>).writeVerify === undefined);
  ok("approach is ONE line", !d.approach.includes("\n"));

  // trailing-semicolon + comment hygiene
  ok("code ends with a single trailing ';'", trailingSemicolonClean(d.code));
  ok("ddl ends with ';' and nothing after", trailingSemicolonClean(d.schema.ddl));
  ok("seed ends with ';' and nothing after", trailingSemicolonClean(d.schema.seed));
  ok("no ';' inside comments of ddl/seed/code",
    noSemiInComments(d.schema.ddl) && noSemiInComments(d.schema.seed) && noSemiInComments(d.code));

  // ddl/seed statement counts via BOTH counters
  ok(`ddl === ${spec.ddlCount} statements (countStatements)`, countStatements(d.schema.ddl) === spec.ddlCount);
  ok(`ddl === ${spec.ddlCount} statements (splitStatements)`, splitStatements(d.schema.ddl).length === spec.ddlCount);
  ok(`seed === ${spec.seedCount} statements (countStatements)`, countStatements(d.schema.seed) === spec.seedCount);
  ok(`seed === ${spec.seedCount} statements (splitStatements)`, splitStatements(d.schema.seed).length === spec.seedCount);

  // structure
  const sc = sentenceCount(d.statement);
  ok(`statement has 3-6 sentences (got ${sc})`, sc >= 3 && sc <= 6);
  ok("2 examples with input+output+explanation",
    d.examples.length === 2 && d.examples.every((e) => e.input.trim() && e.output.trim() && (e.explanation ?? "").trim()));
  ok("3-4 constraints", d.constraints.length >= 3 && d.constraints.length <= 4);
  ok("a constraint pins the exact formula(s)",
    d.constraints.some((c) => /CAST\(ROUND\(shares \* dps \* 100\)|100\.0 \* \(nav - running_peak\)|strftime\('%s', b\.charged_at\) - strftime\('%s', a\.charged_at\)/.test(c)));
  ok("a constraint states the ORDER BY", d.constraints.some((c) => /order by/i.test(c)));
  ok("exactly 3 breakdown paragraphs", d.breakdown.length === 3);
  d.breakdown.forEach((p, j) => {
    const n = sentenceCount(p);
    ok(`breakdown para ${j + 1} has 3-6 sentences (got ${n})`, n >= 3 && n <= 6);
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
  ok("exactly 3 related slugs", (d.related?.length ?? 0) === 3);
  d.related?.forEach((r) => {
    ok(`related slug from the verified pool: ${r}`, spec.relatedPool.includes(r));
    ok(`related slug exists in the registry: ${r}`, LC_SLUGS.has(r));
  });
  ok(`schema.tables has one entry per DDL table (${tableCount(d.schema.ddl)})`,
    (d.schema.tables?.length ?? 0) === tableCount(d.schema.ddl));

  // hygiene: backticks / ${ / platform mention in any dive string
  const strs = allStrings(d);
  ok("no backticks in any string", strs.every((s) => !s.includes("`")));
  ok("no ${ in any string", strs.every((s) => !s.includes("${")));
  ok("no platform mention in any string",
    strs.every((s) => !/leetcode|hackerrank|datalemur|stratascratch/i.test(s)));
  ok('no "e.g."/"i.e." in any string (sentence-heuristic safety)',
    strs.every((s) => !/\be\.g\.|\bi\.e\./i.test(s)));

  // registry tuple: live the moment the lead wires the row; pre-wiring is the
  // documented expected state (b4 precedent) — the tuple is pre-pinned here.
  const reg = LC_ALL.find((p) => p.slug === d.slug);
  if (reg) {
    ok(`registry tuple ${d.slug}: num ${spec.num} · ${spec.difficulty} · xp ${spec.xp}`,
      reg.num === spec.num && reg.difficulty === spec.difficulty && LC_XP[reg.difficulty] === spec.xp,
      JSON.stringify(reg));
  } else {
    ok(`registry row for ${d.slug} not yet wired (lead wires post-delivery) — tuple pre-pinned ${spec.num} · ${spec.difficulty} · xp ${spec.xp}, dive xp matches`, true);
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
        ok(`cell(${ri + 1},${ci + 1}) ${spec.columns[ci]} === ${JSON.stringify(spec.rows[ri][ci])}`,
          eq(cell, spec.rows[ri][ci]), JSON.stringify(cell));
      });
    });
    ok("rows === spec (order-sensitive, whole-array)", eq(r1, spec.rows), JSON.stringify(r1));
    // REAL cells get an explicit tolerance assert alongside eq
    spec.rows.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        if (typeof cell === "number" && !Number.isInteger(cell)) {
          ok(`REAL cell(${ri + 1},${ci + 1}) ${spec.columns[ci]} within 1e-9 of ${cell}`,
            near(r1[ri][ci], cell as number));
        }
      });
    });
    // INTEGER columns really are integers
    const intIdx = spec.columns.map((c, k) => (spec.intColumns.includes(c) ? k : -1)).filter((k) => k >= 0);
    ok(`integer columns [${spec.intColumns.join(", ")}] hold integers`,
      r1.every((row) => intIdx.every((k) => Number.isInteger(row[k]))));
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

// D1 — dividend-income-calendar
{
  const db = buildDb(SQL_DF_MARKETS_B[0]);
  const main = SQL_DF_MARKETS_B[0].code;

  probe("D1 pay-date gate resurrects O's past-ex dividend as 2 phantom rows that even LEAD the report (8 rows)",
    eq(runSql(db, main.replace("WHERE ex_date > '2026-10-01'", "WHERE pay_date > '2026-10-01'")), [
      [1, "O", "2026-10-15", 200, 12600],
      [2, "O", "2026-10-15", 100, 6300],
      [1, "JNJ", "2026-12-08", 40, 5200],
      [2, "JNJ", "2026-12-08", 75, 9750],
      [1, "KO", "2026-12-11", 150, 7200],
      [2, "KO", "2026-12-11", 300, 14400],
      [1, "KO", "2027-03-12", 150, 7800],
      [2, "KO", "2027-03-12", 300, 15600],
    ]));

  probe("D1 GROUP BY 'cleanup' of the KO fanout collapses income (15000/30000) under the FAR pay date (4 rows)",
    eq(runSql(db, `SELECT h.account_id, h.symbol, MAX(u.pay_date) AS pay_date, h.shares,
        CAST(ROUND(SUM(h.shares * u.dps * 100)) AS INTEGER) AS income_cents
      FROM holdings h
      JOIN (SELECT symbol, pay_date, dps FROM dividends WHERE ex_date > '2026-10-01') u ON u.symbol = h.symbol
      GROUP BY h.account_id, h.symbol
      ORDER BY pay_date ASC, h.account_id ASC, h.symbol ASC`), [
      [1, "JNJ", "2026-12-08", 40, 5200],
      [2, "JNJ", "2026-12-08", 75, 9750],
      [1, "KO", "2027-03-12", 150, 15000],
      [2, "KO", "2027-03-12", 300, 30000],
    ]));

  probe("D1 dropping the x100 reads 52 and 98 instead of 5200 and 9750 (97.5 even rounds UP to 98)",
    eq(runSql(db, main.replace("CAST(ROUND(h.shares * u.dps * 100) AS INTEGER)", "CAST(ROUND(h.shares * u.dps) AS INTEGER)")), [
      [1, "JNJ", "2026-12-08", 40, 52],
      [2, "JNJ", "2026-12-08", 75, 98],
      [1, "KO", "2026-12-11", 150, 72],
      [2, "KO", "2026-12-11", 300, 144],
      [1, "KO", "2027-03-12", 150, 78],
      [2, "KO", "2027-03-12", 300, 156],
    ]));

  probe("D1 LEFT JOIN with the gate in WHERE collapses to INNER and coincides (BRKB absent either way, 6 rows)",
    eq(runSql(db, `SELECT h.account_id, h.symbol, u.pay_date, h.shares,
        CAST(ROUND(h.shares * u.dps * 100) AS INTEGER) AS income_cents
      FROM holdings h
      LEFT JOIN (SELECT symbol, pay_date, dps FROM dividends WHERE ex_date > '2026-10-01') u ON u.symbol = h.symbol
      WHERE u.symbol IS NOT NULL
      ORDER BY u.pay_date ASC, h.account_id ASC, h.symbol ASC`), SPEC[0].rows));
  db.close();
}

// D2 — max-drawdown
{
  const db = buildDb(SQL_DF_MARKETS_B[1]);
  const main = SQL_DF_MARKETS_B[1].code;
  const wrongFrame = main.replace("ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING");

  const wrongRows = runSql(db, `WITH seq AS (
      SELECT portfolio_id, snap_date, nav,
        MAX(nav) OVER (PARTITION BY portfolio_id ORDER BY snap_date
          ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS running_peak
      FROM nav),
    dd AS (SELECT portfolio_id, snap_date, nav, running_peak,
      100.0 * (nav - running_peak) / running_peak AS dd FROM seq)
    SELECT portfolio_id, snap_date, dd FROM dd
    WHERE (portfolio_id = 1 AND snap_date IN ('2026-09-01', '2026-09-08'))
       OR (portfolio_id = 2 AND snap_date = '2026-09-09')
    ORDER BY portfolio_id, snap_date`);
  probe("D2 excluded-frame: day 1 has no prior rows so running_peak/drawdown go NULL",
    eq(wrongRows[0], [1, "2026-09-01", null]), JSON.stringify(wrongRows[0]));
  probe("D2 excluded-frame: P1's new-high day 2026-09-08 reads +0.8858 instead of 0.00",
    near(wrongRows[1][2] as number, 0.8857808857808884), JSON.stringify(wrongRows[1][2]));
  probe("D2 excluded-frame: P2's new-high day 2026-09-09 reads +1.4199 instead of 0.00",
    near(wrongRows[2][2] as number, 1.4198782961460445), JSON.stringify(wrongRows[2][2]));

  probe("D2 excluded-frame final answer COINCIDES on this seed — positives can never win a MIN (documented)",
    eq(runSql(db, wrongFrame), SPEC[1].rows));

  probe("D2 peak_date = trough's own nav collapses both peak_dates onto the trough dates",
    eq(runSql(db, main.replace("n2.nav = p.running_peak", "n2.nav = p.nav")), [
      [1, -3.42, "2026-09-10", "2026-09-10"],
      [2, -8.1, "2026-09-11", "2026-09-11"],
    ]));

  const maxRows = runSql(db, main.replace("MIN(drawdown_pct)", "MAX(drawdown_pct)"));
  probe("D2 MAX instead of MIN ties every new-high day at 0.0: 14 rows instead of 2, all zero drawdown",
    maxRows.length === 14 && maxRows.every((r) => r[1] === 0),
    `rows=${maxRows.length}`);

  probe("D2 round-first trough selection coincides on this seed (ROUND is monotone; rounded candidates all distinct)",
    eq(runSql(db, `WITH seq AS (
        SELECT portfolio_id, snap_date, nav,
          MAX(nav) OVER (PARTITION BY portfolio_id ORDER BY snap_date
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_peak
        FROM nav),
      dd AS (SELECT portfolio_id, snap_date, nav, running_peak,
        100.0 * (nav - running_peak) / running_peak AS drawdown_pct FROM seq),
      trough AS (SELECT portfolio_id, MIN(ROUND(drawdown_pct, 2)) AS max_dd FROM dd GROUP BY portfolio_id)
      SELECT t.portfolio_id, t.max_dd AS max_drawdown_pct, p.snap_date AS trough_date,
        (SELECT MIN(n2.snap_date) FROM nav n2
          WHERE n2.portfolio_id = p.portfolio_id AND n2.nav = p.running_peak
            AND n2.snap_date <= p.snap_date) AS peak_date
      FROM trough t
      JOIN dd p ON p.portfolio_id = t.portfolio_id AND ROUND(p.drawdown_pct, 2) = t.max_dd
      ORDER BY t.portfolio_id ASC`), SPEC[1].rows));
  db.close();
}

// D3 — duplicate-charge-pairs
{
  const db = buildDb(SQL_DF_MARKETS_B[2]);
  const main = SQL_DF_MARKETS_B[2].code;

  probe("D3 strict upper bound (< 120) silently drops the exactly-120s Grocer pair (4 rows)",
    eq(runSql(db, main.replace("BETWEEN 0 AND 120", "BETWEEN 0 AND 119")), [
      [101, 102, 90],
      [102, 103, 110],
      [110, 111, 45],
      [170, 171, 0],
    ]));

  probe("D3 charged_at-strict-only (no charge_id tiebreak) drops the same-second Taxi pair (4 rows)",
    eq(runSql(db, `SELECT a.charge_id AS charge_id_a, b.charge_id AS charge_id_b,
        strftime('%s', b.charged_at) - strftime('%s', a.charged_at) AS seconds_apart
      FROM charges a JOIN charges b
        ON a.card_id = b.card_id AND a.merchant = b.merchant AND a.amount_cents = b.amount_cents
       AND a.charged_at < b.charged_at
       AND a.charge_id <> b.charge_id
      WHERE strftime('%s', b.charged_at) - strftime('%s', a.charged_at) BETWEEN 0 AND 120
      ORDER BY a.charged_at ASC, a.charge_id ASC, b.charge_id ASC`), [
      [101, 102, 90],
      [102, 103, 110],
      [110, 111, 45],
      [120, 121, 120],
    ]));

  probe("D3 dropping merchant equality re-pairs the group: Cafe 160 pairs with 101 AND 102 (7 rows)",
    eq(runSql(db, `SELECT a.charge_id AS charge_id_a, b.charge_id AS charge_id_b,
        strftime('%s', b.charged_at) - strftime('%s', a.charged_at) AS seconds_apart
      FROM charges a JOIN charges b
        ON a.card_id = b.card_id AND a.amount_cents = b.amount_cents
       AND a.charged_at <= b.charged_at
       AND (a.charged_at < b.charged_at OR a.charge_id < b.charge_id)
       AND a.charge_id <> b.charge_id
      WHERE strftime('%s', b.charged_at) - strftime('%s', a.charged_at) BETWEEN 0 AND 120
      ORDER BY a.charged_at ASC, a.charge_id ASC, b.charge_id ASC`), [
      [101, 102, 90],
      [101, 160, 20],
      [160, 102, 70],
      [102, 103, 110],
      [110, 111, 45],
      [120, 121, 120],
      [170, 171, 0],
    ]));

  probe("D3 dropping the a<=b ordering rule double-counts every pair both ways (10 rows)",
    eq(runSql(db, `SELECT a.charge_id AS charge_id_a, b.charge_id AS charge_id_b,
        ABS(strftime('%s', b.charged_at) - strftime('%s', a.charged_at)) AS seconds_apart
      FROM charges a JOIN charges b
        ON a.card_id = b.card_id AND a.merchant = b.merchant AND a.amount_cents = b.amount_cents
       AND a.charge_id <> b.charge_id
      WHERE ABS(strftime('%s', b.charged_at) - strftime('%s', a.charged_at)) BETWEEN 0 AND 120
      ORDER BY a.charge_id ASC, b.charge_id ASC`), [
      [101, 102, 90], [102, 101, 90],
      [102, 103, 110], [103, 102, 110],
      [110, 111, 45], [111, 110, 45],
      [120, 121, 120], [121, 120, 120],
      [170, 171, 0], [171, 170, 0],
    ]));

  const epochGap = db.query(
    `SELECT strftime('%s', '2026-10-05 10:01:30') - strftime('%s', '2026-10-05 10:00:00') AS g`).get() as Record<string, unknown>;
  const jdGap = (db.query(
    `SELECT (julianday('2026-10-05 10:01:30') - julianday('2026-10-05 10:00:00')) * 86400.0 AS g`).get() as Record<string, unknown>).g as number;
  const jdGap120 = (db.query(
    `SELECT (julianday('2026-10-06 09:32:00') - julianday('2026-10-06 09:30:00')) * 86400.0 AS g`).get() as Record<string, unknown>).g as number;
  probe("D3 epoch path: the 90-second gap reads exactly the INTEGER 90",
    epochGap.g === 90 && Number.isInteger(epochGap.g as number), JSON.stringify(epochGap));
  probe("D3 julianday path: the same gap reads 89.99999463558197 — float noise, NOT the integer",
    !Number.isInteger(jdGap) && Math.abs(jdGap - 90) < 1e-3 && jdGap !== 90, String(jdGap));
  probe("D3 julianday path: the 120-second boundary pair reads 119.99999284744263 — noise at the wall",
    !Number.isInteger(jdGap120) && Math.abs(jdGap120 - 120) < 1e-3 && jdGap120 !== 120, String(jdGap120));
  db.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log(`ALL CHECKS PASS ${SQL_DF_MARKETS_B.length}/3`);
