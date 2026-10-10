// Task 77-g self-check — sql-df-retail-a.ts (3 Retail Analytics A dives).
// bun scripts/tmp-77-g-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_RETAIL_A } from "../src/lib/leetcode/content/sql-df-retail-a";
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

/* ---------- spec ---------- */
// Pinned output contracts (hand-derived, confirmed by the engine).
const SPEC: Array<{
  slug: string; id: number; difficulty: "Easy" | "Medium" | "Hard"; xp: number;
  columns: string[]; rows: unknown[][]; realColumns: string[]; intColumns: string[];
  order: "exact" | "any";
}> = [
  { slug: "basket-depth-aov", id: 8067, difficulty: "Easy", xp: 10,
    columns: ["month", "orders", "aov_cents", "items_per_order"],
    rows: [
      ["2026-07", 3, 4500, 2.7],
      ["2026-08", 4, 2525, 2],
      ["2026-09", 4, 24375, 4.5],
    ],
    realColumns: ["items_per_order"], intColumns: ["orders", "aov_cents"], order: "exact" },
  { slug: "repeat-purchase-rate", id: 8068, difficulty: "Easy", xp: 10,
    columns: ["month", "customers", "repeaters", "repeat_pct"],
    rows: [
      ["2026-07", 5, 2, 40],
      ["2026-08", 7, 1, 14.29],
      ["2026-09", 4, 1, 25],
    ],
    realColumns: ["repeat_pct"], intColumns: ["customers", "repeaters"], order: "exact" },
  { slug: "rfm-segmentation", id: 8069, difficulty: "Medium", xp: 20,
    columns: ["customer_id", "recency_days", "frequency", "monetary_cents", "r", "f", "m", "segment"],
    rows: [
      [1, 2, 12, 162000, 5, 5, 5, "champion"],
      [2, 5, 11, 148500, 5, 5, 5, "champion"],
      [3, 9, 10, 4200, 4, 4, 1, "loyal"],
      [4, 41, 9, 41500, 2, 4, 4, "at risk"],
      [5, 14, 8, 22600, 4, 3, 3, "promising"],
      [6, 20, 7, 34200, 3, 3, 4, "core"],
      [7, 27, 6, 28900, 3, 2, 3, "core"],
      [8, 53, 5, 18700, 2, 2, 2, "hibernating"],
      [9, 67, 4, 15800, 2, 2, 2, "hibernating"],
      [10, 82, 3, 12400, 1, 1, 2, "hibernating"],
      [11, 104, 2, 9100, 1, 1, 1, "hibernating"],
      [12, 151, 1, 6800, 1, 1, 1, "hibernating"],
    ],
    realColumns: [], intColumns: ["customer_id", "recency_days", "frequency", "monetary_cents", "r", "f", "m"], order: "exact" },
];
const XP: Record<string, number> = { Easy: 10, Medium: 20, Hard: 35 };

// related slugs may ONLY come from the wired Data & Finance track (8069's
// batch-4 siblings are not yet registry rows, so the pool is batch-3 only).
const RELATED_POOL = new Set([
  "usage-tier-percentiles", "dau-wau-stickiness", "week-over-week-churn",
  "cohort-retention-matrix", "ab-test-conversion-lift",
]);
const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));

console.log(`\n=== sql-df-retail-a.ts — ${SQL_DF_RETAIL_A.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_RETAIL_A.length === 3 && SPEC.every((s, i) => SQL_DF_RETAIL_A[i]?.slug === s.slug),
  SQL_DF_RETAIL_A.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_RETAIL_A[i];
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
  ok("constraints carry PINNED lines", d.constraints.filter((c) => c.includes("PINNED")).length >= 1);
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

  // MONEY convention: every money column is INTEGER in the DDL and
  // declared-integer in the contract (REAL is reserved for rates/depths).
  const moneyOut = spec.columns.filter((c) => /(_cents|_minor)$/.test(c));
  ok("every *_cents/_minor output column is declared integer", moneyOut.every((c) => spec.intColumns.includes(c)));
  const ddlMoney = (d.schema.ddl.match(/^\s*(\w+_cents|\w+_minor)\s+(\w+)/gim) ?? [])
    .map((m) => m.trim().split(/\s+/));
  ok(`every *_cents/_minor DDL column is INTEGER (${ddlMoney.length} money columns)`,
    ddlMoney.every((part) => part[1] === "INTEGER"), JSON.stringify(ddlMoney));
  ok(`money-column census matches the contract (DDL ${ddlMoney.length}, output ${moneyOut.length})`,
    moneyOut.length > 0 ? ddlMoney.length > 0 : true);
  ok("declared REAL columns appear in the output", spec.realColumns.every((c) => spec.columns.includes(c)));

  // date-tool contract: only the RFM dive is pinned to julianday
  if (d.slug === "rfm-segmentation") ok("rfm code uses the pinned julianday as-of read", /julianday\('2026-09-30'\)/.test(d.code));
  else ok(`${d.slug} code uses strftime months only (no julianday)`, !/julianday/i.test(d.code));

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

/* ---------- per-dive hand verification: TS float mirrors ---------- */

console.log("\n=== basket-depth-aov — TS mirror of the three monthly reads ===");
{
  const d = SQL_DF_RETAIL_A[0];
  const db = buildDb(d);
  // TS mirror straight from the seed design: [revenue, units] per basket
  const months: Record<string, Array<[number, number]>> = {
    "2026-07": [[4500, 3], [1200, 1], [7800, 4]],
    "2026-08": [[2600, 1], [3100, 3], [2400, 2], [2000, 2]],
    "2026-09": [[1500, 1], [90000, 12], [3200, 3], [2800, 2]],
  };
  const raw = runSql(db, `WITH per_order AS (
      SELECT o.order_id, strftime('%Y-%m', o.order_date) AS month, o.revenue_cents, SUM(i.qty) AS q
      FROM orders o JOIN order_items i ON i.order_id = o.order_id
      GROUP BY o.order_id, o.order_date, o.revenue_cents)
    SELECT month, COUNT(*) AS n, AVG(revenue_cents) AS avg_rev, 1.0 * SUM(q) / COUNT(*) AS raw_depth
    FROM per_order GROUP BY month ORDER BY month ASC`);
  ok("raw query returns 3 months", raw.length === 3, String(raw.length));
  const keys = Object.keys(months);
  keys.forEach((m, i) => {
    const bs = months[m];
    const n = bs.length;
    const rev = bs.reduce((s, b) => s + b[0], 0);
    const units = bs.reduce((s, b) => s + b[1], 0);
    ok(`${m} engine orders === ${n}`, raw[i][1] === n, String(raw[i][1]));
    ok(`${m} engine avg_rev within 1e-9 of TS mirror (${rev / n})`, Math.abs((raw[i][2] as number) - rev / n) < 1e-9, `${raw[i][2]} vs ${rev / n}`);
    ok(`${m} engine raw depth within 1e-9 of TS mirror (${1.0 * units / n})`, Math.abs((raw[i][3] as number) - 1.0 * units / n) < 1e-9, `${raw[i][3]} vs ${1.0 * units / n}`);
    ok(`${m} depth rounds to ${(Math.round((units / n) * 10) / 10).toFixed(1)}`,
      eq(runSql(db, `SELECT ROUND(${JSON.stringify(units / n)}, 1)`)[0][0], Math.round((units / n) * 10) / 10));
  });
  ok("hand pins: July 4500 / 2.7, August 2525 / 2.0, September 24375 / 4.5",
    eq(runSql(db, d.code), SPEC[0].rows));
  // zero-item order exists in the seed and is July's 4th order
  ok("seed holds the zero-item 999-cent order in July",
    eq(runSql(db, `SELECT revenue_cents FROM orders WHERE order_id NOT IN (SELECT order_id FROM order_items)`), [[999]]));
  db.close();
}

console.log("\n=== repeat-purchase-rate — TS mirror of the three monthly rates ===");
{
  const d = SQL_DF_RETAIL_A[1];
  const db = buildDb(d);
  const months: Record<string, Record<number, number>> = {
    "2026-07": { 1: 2, 2: 1, 3: 2, 4: 1, 5: 1 },
    "2026-08": { 6: 1, 1: 2, 7: 1, 8: 1, 2: 1, 9: 1, 10: 1 },
    "2026-09": { 3: 4, 4: 1, 10: 1, 5: 1 },
  };
  const raw = runSql(db, `WITH monthly AS (
      SELECT strftime('%Y-%m', order_date) AS month, customer_id, COUNT(*) AS order_cnt
      FROM orders GROUP BY month, customer_id)
    SELECT month, COUNT(*) AS cust,
      SUM(CASE WHEN order_cnt >= 2 THEN 1 ELSE 0 END) AS rep,
      100.0 * SUM(CASE WHEN order_cnt >= 2 THEN 1 ELSE 0 END) / COUNT(*) AS raw_pct
    FROM monthly GROUP BY month ORDER BY month ASC`);
  ok("raw query returns 3 months", raw.length === 3, String(raw.length));
  const keys = Object.keys(months);
  keys.forEach((m, i) => {
    const buyers = months[m];
    const cust = Object.keys(buyers).length;
    const rep = Object.values(buyers).filter((n) => n >= 2).length;
    const pct = 100.0 * rep / cust;
    ok(`${m} engine customers === ${cust}`, raw[i][1] === cust, String(raw[i][1]));
    ok(`${m} engine repeaters === ${rep}`, raw[i][2] === rep, String(raw[i][2]));
    ok(`${m} engine raw pct within 1e-9 of TS mirror (${pct})`, Math.abs((raw[i][3] as number) - pct) < 1e-9, `${raw[i][3]} vs ${pct}`);
    ok(`${m} pct rounds to ${Math.round(pct * 100) / 100}`,
      eq(runSql(db, `SELECT ROUND(${JSON.stringify(pct)}, 2)`)[0][0], Math.round(pct * 100) / 100));
  });
  ok("hand pins: July 5/2/40, August 7/1/14.29, September 4/1/25",
    eq(runSql(db, d.code), SPEC[1].rows));
  // customer 3 orders 4 times in September (counts once as a repeater)
  ok("customer 3 places exactly 4 September orders",
    eq(runSql(db, `SELECT COUNT(*) FROM orders WHERE customer_id = 3 AND order_date >= '2026-09-01' AND order_date < '2026-10-01'`), [[4]]));
  db.close();
}

console.log("\n=== rfm-segmentation — TS mirror of aggregates, tiles and ladder ===");
{
  const d = SQL_DF_RETAIL_A[2];
  const db = buildDb(d);
  // TS mirror straight from the seed design: per-customer [lastOrder, freq, monetary]
  const design: Array<[number, string, number, number]> = [
    [1, "2026-09-28", 12, 162000], [2, "2026-09-25", 11, 148500], [3, "2026-09-21", 10, 4200],
    [4, "2026-08-20", 9, 41500], [5, "2026-09-16", 8, 22600], [6, "2026-09-10", 7, 34200],
    [7, "2026-09-03", 6, 28900], [8, "2026-08-08", 5, 18700], [9, "2026-07-25", 4, 15800],
    [10, "2026-07-10", 3, 12400], [11, "2026-06-18", 2, 9100], [12, "2026-05-02", 1, 6800],
  ];
  const asOf = Date.UTC(2026, 8, 30);
  const day = (iso: string) => Math.round((asOf - Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10))) / 86400000);
  const cust = design.map(([id, last, freq, mon]) => ({ id, recency: day(last), freq, mon }));
  ok("TS recency mirror matches the pinned per-customer day counts (c1..c12: 2,5,9,41,14,20,27,53,67,82,104,151)",
    eq(cust.map((c) => c.recency), [2, 5, 9, 41, 14, 20, 27, 53, 67, 82, 104, 151]),
    JSON.stringify(cust.map((c) => c.recency)));
  // NTILE(5) over 12 rows: sizes 3,3,2,2,2, remainder tiles first
  const tile = (vals: Array<{ id: number; key: number }>): Map<number, number> => {
    const sorted = [...vals].sort((a, b) => a.key - b.key); // ASC dealing
    const out = new Map<number, number>();
    const base = Math.floor(12 / 5), extra = 12 % 5; // base 2, first 2 tiles get 3
    let pos = 0;
    for (let t = 1; t <= 5; t++) {
      const size = base + (t <= extra ? 1 : 0);
      for (let k = 0; k < size; k++) out.set(sorted[pos++].id, t);
    }
    return out;
  };
  const rTile = tile(cust.map((c) => ({ id: c.id, key: -c.recency }))); // DESC == ASC on negated key
  const fTile = tile(cust.map((c) => ({ id: c.id, key: c.freq })));
  const mTile = tile(cust.map((c) => ({ id: c.id, key: c.mon })));
  const ladder = (r: number, f: number, m: number) =>
    r >= 4 && f >= 4 && m >= 4 ? "champion"
    : r >= 4 && f >= 4 ? "loyal"
    : r >= 4 ? "promising"
    : r <= 2 && f >= 4 ? "at risk"
    : r <= 2 ? "hibernating"
    : "core";
  const tsRows = cust.map((c) => {
    const r = rTile.get(c.id)!, f = fTile.get(c.id)!, m = mTile.get(c.id)!;
    return [c.id, c.recency, c.freq, c.mon, r, f, m, ladder(r, f, m)];
  });
  ok("TS tile sizes are 3,3,2,2,2 on every axis",
    [[...rTile.values()], [...fTile.values()], [...mTile.values()]]
      .every((tiles) => eq([1, 2, 3, 4, 5].map((t) => tiles.filter((x) => x === t).length), [3, 3, 2, 2, 2])));
  const members = (t: Map<number, number>, tile: number) =>
    cust.filter((c) => t.get(c.id) === tile).map((c) => c.id).sort((a, b) => a - b);
  ok("TS tile membership r (sorted per tile): {10,11,12} {4,8,9} {6,7} {3,5} {1,2}",
    eq([1, 2, 3, 4, 5].map((t) => members(rTile, t)),
      [[10, 11, 12], [4, 8, 9], [6, 7], [3, 5], [1, 2]]));
  ok("TS tile membership f (sorted per tile): {10,11,12} {7,8,9} {5,6} {3,4} {1,2}",
    eq([1, 2, 3, 4, 5].map((t) => members(fTile, t)),
      [[10, 11, 12], [7, 8, 9], [5, 6], [3, 4], [1, 2]]));
  ok("TS tile membership m (sorted per tile): {3,11,12} {8,9,10} {5,7} {4,6} {1,2}",
    eq([1, 2, 3, 4, 5].map((t) => members(mTile, t)),
      [[3, 11, 12], [8, 9, 10], [5, 7], [4, 6], [1, 2]]));
  ok("TS ladder mirror covers 2 champion / 1 loyal / 1 promising / 1 at risk / 5 hibernating / 2 core",
    eq(["champion", "loyal", "promising", "at risk", "hibernating", "core"].map((s) => tsRows.filter((r) => r[7] === s).length),
      [2, 1, 1, 1, 5, 2]));
  ok("full TS mirror === engine output (12 rows, every cell)",
    eq(runSql(db, d.code), tsRows), JSON.stringify(runSql(db, d.code)));
  ok("TS mirror === SPEC pinned rows", eq(tsRows, SPEC[2].rows));
  // determinism guard: all three axis keys are distinct across the 12 customers
  const distinct = runSql(db, `WITH per_customer AS (
      SELECT customer_id, CAST(julianday('2026-09-30') - julianday(MAX(order_date)) AS INTEGER) AS recency_days,
             COUNT(*) AS frequency, SUM(revenue_cents) AS monetary_cents
      FROM orders GROUP BY customer_id)
    SELECT (SELECT COUNT(DISTINCT recency_days) FROM per_customer),
           (SELECT COUNT(DISTINCT frequency) FROM per_customer),
           (SELECT COUNT(DISTINCT monetary_cents) FROM per_customer),
           (SELECT COUNT(*) FROM orders), (SELECT COUNT(DISTINCT customer_id) FROM orders)`);
  ok("all 12 recency/frequency/monetary keys distinct; 78 orders, 12 customers",
    eq(distinct, [[12, 12, 12, 78, 12]]), JSON.stringify(distinct));
  db.close();
}

/* ---------- planted-trap probes: the WRONG queries must produce the documented wrong outputs ---------- */
console.log("\n=== planted-trap probes ===");

// D1 traps
{
  const d = SQL_DF_RETAIL_A[0];
  const db = buildDb(d);
  ok("D1 LEFT JOIN keeps the zero-item order: July reads 4 orders / aov 3625 (not 3 / 4500)",
    eq(runSql(db, `WITH per_order AS (
        SELECT o.order_id, strftime('%Y-%m', o.order_date) AS month, o.revenue_cents,
               COALESCE(SUM(i.qty), 0) AS q
        FROM orders o LEFT JOIN order_items i ON i.order_id = o.order_id
        GROUP BY o.order_id, o.order_date, o.revenue_cents)
      SELECT month, COUNT(*) AS orders, CAST(ROUND(AVG(revenue_cents), 0) AS INTEGER) AS aov_cents
      FROM per_order GROUP BY month ORDER BY month ASC`),
      [["2026-07", 4, 3625], ["2026-08", 4, 2525], ["2026-09", 4, 24375]]));
  ok("D1 line-weighted AVG over the raw join: July 5 / 5160, September 5 / 20060",
    eq(runSql(db, `SELECT strftime('%Y-%m', o.order_date) AS month,
          COUNT(o.order_id) AS orders, CAST(ROUND(AVG(o.revenue_cents), 0) AS INTEGER) AS aov_cents
        FROM orders o JOIN order_items i ON i.order_id = o.order_id
        GROUP BY month ORDER BY month ASC`),
      [["2026-07", 5, 5160], ["2026-08", 4, 2525], ["2026-09", 5, 20060]]));
  ok("D1 counting item ROWS instead of units: depth reads 1.7 / 1.0 / 1.3 (not 2.7 / 2.0 / 4.5)",
    eq(runSql(db, `SELECT strftime('%Y-%m', o.order_date) AS month,
          ROUND(1.0 * COUNT(*) / COUNT(DISTINCT o.order_id), 1) AS lines_per_order
        FROM orders o JOIN order_items i ON i.order_id = o.order_id
        GROUP BY month ORDER BY month ASC`),
      [["2026-07", 1.7], ["2026-08", 1], ["2026-09", 1.3]]));
  ok("D1 per-order depths averaged with the empty basket in the pool: July 2.0 (not 2.7)",
    eq(runSql(db, `WITH per_order AS (
        SELECT o.order_id, strftime('%Y-%m', o.order_date) AS month, COALESCE(SUM(i.qty), 0) AS q
        FROM orders o LEFT JOIN order_items i ON i.order_id = o.order_id
        GROUP BY o.order_id, o.order_date)
      SELECT ROUND(AVG(q), 1) AS wrong_depth FROM per_order WHERE month = '2026-07'`),
      [[2]]));
  db.close();
}

// D2 traps
{
  const d = SQL_DF_RETAIL_A[1];
  const db = buildDb(d);
  const M = `WITH monthly AS (
      SELECT strftime('%Y-%m', order_date) AS month, customer_id, COUNT(*) AS order_cnt
      FROM orders GROUP BY month, customer_id),
    agg AS (SELECT month, COUNT(*) AS cust, SUM(CASE WHEN order_cnt >= 2 THEN 1 ELSE 0 END) AS rep
      FROM monthly GROUP BY month)`;
  ok("D2 orders as customers: July 7 / 28.57, August 8 / 12.5, September 7 / 14.29",
    eq(runSql(db, `${M},
      oc AS (SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS n FROM orders GROUP BY month)
      SELECT agg.month, oc.n, agg.rep, ROUND(100.0 * agg.rep / oc.n, 2) AS wrong_pct
      FROM agg JOIN oc ON oc.month = agg.month ORDER BY agg.month`),
      [["2026-07", 7, 2, 28.57], ["2026-08", 8, 1, 12.5], ["2026-09", 7, 1, 14.29]]));
  ok("D2 orders-denominator with the customer column kept: August prints 12.5 beside customers 7",
    eq(runSql(db, `${M},
      oc AS (SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS n FROM orders GROUP BY month)
      SELECT agg.month, agg.cust, ROUND(100.0 * agg.rep / oc.n, 2) AS wrong_pct
      FROM agg JOIN oc ON oc.month = agg.month ORDER BY agg.month`),
      [["2026-07", 5, 28.57], ["2026-08", 7, 12.5], ["2026-09", 4, 14.29]]));
  ok("D2 HAVING >= 2 collapse: every month reads 100.0 (2/2, 1/1, 1/1)",
    eq(runSql(db, `WITH monthly AS (
        SELECT strftime('%Y-%m', order_date) AS month, customer_id, COUNT(*) AS order_cnt
        FROM orders GROUP BY month, customer_id HAVING COUNT(*) >= 2)
      SELECT month, COUNT(*) AS customers, COUNT(*) AS repeaters,
             ROUND(100.0 * COUNT(*) / COUNT(*), 2) AS repeat_pct
      FROM monthly GROUP BY month ORDER BY month`),
      [["2026-07", 2, 2, 100], ["2026-08", 1, 1, 100], ["2026-09", 1, 1, 100]]));
  ok("D2 monthless rollup: ONE row 10 / 6 / 60.0 instead of three monthly rows",
    eq(runSql(db, `SELECT COUNT(DISTINCT customer_id) AS customers,
          SUM(CASE WHEN cnt >= 2 THEN 1 ELSE 0 END) AS repeaters,
          ROUND(100.0 * SUM(CASE WHEN cnt >= 2 THEN 1 ELSE 0 END) / COUNT(DISTINCT customer_id), 2) AS repeat_pct
        FROM (SELECT customer_id, COUNT(*) AS cnt FROM orders GROUP BY customer_id)`),
      [[10, 6, 60]]));
  db.close();
}

// D3 traps
{
  const d = SQL_DF_RETAIL_A[2];
  const db = buildDb(d);
  const S = (tileN: number, rDir: string) => `WITH per_customer AS (
      SELECT customer_id, CAST(julianday('2026-09-30') - julianday(MAX(order_date)) AS INTEGER) AS recency_days,
             COUNT(*) AS frequency, SUM(revenue_cents) AS monetary_cents
      FROM orders GROUP BY customer_id),
    scored AS (SELECT *, NTILE(${tileN}) OVER (ORDER BY recency_days ${rDir}) AS r,
        NTILE(${tileN}) OVER (ORDER BY frequency ASC) AS f,
        NTILE(${tileN}) OVER (ORDER BY monetary_cents ASC) AS m FROM per_customer)`;
  const LADDER = `CASE
        WHEN r >= 4 AND f >= 4 AND m >= 4 THEN 'champion'
        WHEN r >= 4 AND f >= 4 THEN 'loyal'
        WHEN r >= 4 THEN 'promising'
        WHEN r <= 2 AND f >= 4 THEN 'at risk'
        WHEN r <= 2 THEN 'hibernating'
        ELSE 'core' END`;
  ok("D3 r direction flipped (ASC): customer 1 reads at risk, champions 0, promising 4",
    eq(runSql(db, `${S(5, "ASC")},
      seg AS (SELECT customer_id, ${LADDER} AS segment FROM scored)
      SELECT (SELECT segment FROM seg WHERE customer_id = 1),
             (SELECT COUNT(*) FROM seg WHERE segment = 'champion'),
             (SELECT COUNT(*) FROM seg WHERE segment = 'promising')`),
      [["at risk", 0, 4]]));
  ok("D3 stale branches dropped (ELSE core): customer 4 reads core, hibernating 0, core 8",
    eq(runSql(db, `${S(5, "DESC")},
      seg AS (SELECT customer_id, CASE
          WHEN r >= 4 AND f >= 4 AND m >= 4 THEN 'champion'
          WHEN r >= 4 AND f >= 4 THEN 'loyal'
          WHEN r >= 4 THEN 'promising'
          ELSE 'core' END AS segment FROM scored)
      SELECT (SELECT segment FROM seg WHERE customer_id = 4),
             (SELECT COUNT(*) FROM seg WHERE segment = 'hibernating'),
             (SELECT COUNT(*) FROM seg WHERE segment = 'core')`),
      [["core", 0, 8]]));
  ok("D3 champion rule without the m gate: customer 3 (m tile 1) reads champion, loyal 0",
    eq(runSql(db, `${S(5, "DESC")},
      seg AS (SELECT customer_id, m, CASE
          WHEN r >= 4 AND f >= 4 THEN 'champion'
          WHEN r >= 4 THEN 'promising'
          WHEN r <= 2 AND f >= 4 THEN 'at risk'
          WHEN r <= 2 THEN 'hibernating'
          ELSE 'core' END AS segment FROM scored)
      SELECT (SELECT segment FROM seg WHERE customer_id = 3),
             (SELECT COUNT(*) FROM seg WHERE segment = 'champion'),
             (SELECT COUNT(*) FROM seg WHERE segment = 'loyal')`),
      [["champion", 3, 0]]));
  ok("D3 quartiles NTILE(4): customer 4 reads hibernating, customer 5 reads core",
    eq(runSql(db, `${S(4, "DESC")},
      seg AS (SELECT customer_id, ${LADDER} AS segment FROM scored)
      SELECT (SELECT segment FROM seg WHERE customer_id = 4),
             (SELECT segment FROM seg WHERE customer_id = 5),
             (SELECT COUNT(*) FROM seg WHERE segment = 'at risk'),
             (SELECT COUNT(*) FROM seg WHERE segment = 'promising')`),
      [["hibernating", "core", 0, 0]]));
  db.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log(`ALL CHECKS PASS ${SQL_DF_RETAIL_A.length}/3`);
