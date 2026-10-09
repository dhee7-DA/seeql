// Task 74-f self-check — sql-df-acct-b.ts (3 accounting dives with domain primers).
// bun scripts/tmp-74-f-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_ACCT_B } from "../src/lib/leetcode/content/sql-df-acct-b";
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
  if (d.primer) {
    out.push(d.primer.hook, d.primer.where, ...d.primer.concept, ...d.primer.worked,
      ...d.primer.glossary.flatMap((g) => [g.term, g.def]), ...d.primer.reallife);
  }
  return out;
};
const proseStrings = (d: LcSqlDive): string[] => {
  const out = [d.statement, d.approach, d.time, d.space,
    ...d.examples.flatMap((e) => [e.input, e.output, e.explanation ?? ""]),
    ...d.constraints, ...d.breakdown, ...d.edges, ...d.walkthrough,
    ...d.followUps ?? [], ...d.ladder.flatMap((r) => [r.title, r.body]),
    ...(d.schema.tables ?? []).map((t) => t.note)];
  if (d.primer) {
    out.push(d.primer.hook, d.primer.where, ...d.primer.concept, ...d.primer.worked,
      ...d.primer.glossary.map((g) => g.def), ...d.primer.reallife);
  }
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
// Pinned output contracts (hand-derived, confirmed by the engine).
const SPEC: Array<{
  slug: string; id: number; difficulty: "Easy" | "Medium" | "Hard"; xp: number;
  columns: string[]; rows: unknown[][]; realColumns: string[]; intColumns: string[];
}> = [
  { slug: "fifo-inventory-cogs", id: 8040, difficulty: "Hard", xp: 35,
    columns: ["sale_id", "units_sold", "cogs_cents"],
    rows: [
      [1, 80, 24000],
      [2, 60, 18800],
      [3, 180, 56900],
    ],
    realColumns: [], intColumns: ["sale_id", "units_sold", "cogs_cents"] },
  { slug: "deferred-revenue", id: 8041, difficulty: "Medium", xp: 20,
    columns: ["sub_id", "month", "recognized_cents"],
    rows: [
      [1, "2026-07", 10000],
      [1, "2026-08", 10000],
      [1, "2026-09", 10000],
      [2, "2026-08", 7000],
      [2, "2026-09", 7000],
    ],
    realColumns: [], intColumns: ["sub_id", "recognized_cents"] },
  { slug: "journal-gap-detection", id: 8042, difficulty: "Medium", xp: 20,
    columns: ["missing_doc_no"],
    rows: [
      [1004],
      [1005],
      [1010],
    ],
    realColumns: [], intColumns: ["missing_doc_no"] },
];
const XP: Record<string, number> = { Easy: 10, Medium: 20, Hard: 35 };

// related slugs may ONLY come from the brief's pool.
const RELATED_POOL = new Set([
  "gl-reconciliation", "settlement-fails-aging", "realized-pnl-average-cost", "sessionize-events",
  "daily-balance-interest", "portfolio-weights", "loan-amortization-schedule", "delinquency-buckets",
  "npv-queries", "calculate-product-final-price", "bank-account-summary-ii",
]);
const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));

console.log(`\n=== sql-df-acct-b.ts — ${SQL_DF_ACCT_B.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_ACCT_B.length === 3 && SPEC.every((s, i) => SQL_DF_ACCT_B[i]?.slug === s.slug),
  SQL_DF_ACCT_B.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_ACCT_B[i];
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
  ok(`xp matches the ${spec.difficulty} map (10/20/35)`, XP[spec.difficulty] === d.xp);
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
  ok("3-5 edges (spec asks 4)", d.edges.length >= 3 && d.edges.length <= 5);
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

  // NEW THIS BATCH — primer audits
  const p = d.primer;
  ok("primer present", !!p);
  if (p) {
    ok(`hook is exactly 1 sentence (got ${sentenceCount(p.hook)})`, sentenceCount(p.hook) === 1);
    ok("hook nonempty", p.hook.trim().length > 0);
    ok(`concept has 3-4 paragraphs (got ${p.concept.length})`, p.concept.length >= 3 && p.concept.length <= 4);
    p.concept.forEach((c, j) =>
      ok(`concept para ${j + 1} has >= 3 sentences (got ${sentenceCount(c)})`, sentenceCount(c) >= 3));
    ok(`worked has 3-5 steps (got ${p.worked.length})`, p.worked.length >= 3 && p.worked.length <= 5);
    p.worked.forEach((w, j) => ok(`worked step ${j + 1} nonempty`, w.trim().length > 0));
    ok(`glossary has 4-6 terms (got ${p.glossary.length})`, p.glossary.length >= 4 && p.glossary.length <= 6);
    p.glossary.forEach((g, j) =>
      ok(`glossary ${j + 1} (${g.term}) def >= 5 words (got ${g.def.trim().split(/\s+/).length})`,
        g.term.trim().length > 0 && g.def.trim().split(/\s+/).length >= 5));
    ok(`reallife has 2-3 paragraphs (got ${p.reallife.length})`, p.reallife.length >= 2 && p.reallife.length <= 3);
    p.reallife.forEach((r, j) =>
      ok(`reallife para ${j + 1} has >= 3 sentences (got ${sentenceCount(r)})`, sentenceCount(r) >= 3));
    ok("where nonempty", p.where.trim().length > 0);
  }

  // hygiene: backticks / ${ / platform mention / e.g.-i.e. in any dive string (primer included)
  const strs = allStrings(d);
  ok("no backticks in any string", strs.every((s) => !s.includes("`")));
  ok("no ${ in any string", strs.every((s) => !s.includes("${")));
  ok("no platform mention in any string",
    strs.every((s) => !/leetcode|hacker_rank|hackerrank|datalemur|stratascratch/i.test(s)));
  ok('no "e.g."/"i.e." in prose (sentence heuristic safety)',
    proseStrings(d).every((s) => !/\be\.g\.|\bi\.e\./i.test(s)));

  // MONEY convention: every money column (input or output, name ending _cents/_minor)
  // is INTEGER in the DDL and declared-integer in the contract.
  const moneyOut = spec.columns.filter((c) => /(_cents|_minor)$/.test(c));
  ok("every *_cents/_minor output column is declared integer", moneyOut.every((c) => spec.intColumns.includes(c)));
  const ddlMoney = (d.schema.ddl.match(/^\s*(\w+_cents|\w+_minor)\s+(\w+)/gim) ?? [])
    .map((m) => m.trim().split(/\s+/));
  ok(`every *_cents/_minor DDL column is INTEGER (${ddlMoney.length} money columns)`,
    ddlMoney.every((parts) => parts[1] === "INTEGER"), JSON.stringify(ddlMoney));

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
console.log("\n=== FIFO — supply axis + take matrix + TS mirror + leftovers ===");
{
  const d = SQL_DF_ACCT_B[0];
  const db = buildDb(d);
  ok("supply axis totals: 450 units, 140000 cents",
    eq(runSql(db, `SELECT SUM(units) AS u, SUM(units * unit_cost_cents) AS c FROM batches`), [[450, 140000]]));
  // shared CTE prefix of the shipped solution (everything before the final SELECT)
  const D1_CTES = d.code.slice(0, d.code.indexOf("\nSELECT\n    sale_id,"));
  ok("take matrix (9 cells, hand-pinned)",
    eq(runSql(db, `${D1_CTES}
SELECT sale_id, batch_id, units_taken FROM layers ORDER BY sale_id ASC, batch_id ASC;`),
      [[1, 1, 80], [1, 2, 0], [1, 3, 0], [2, 1, 20], [2, 2, 40], [2, 3, 0],
       [3, 1, 0], [3, 2, 110], [3, 3, 70]]));
  ok("leftover inventory: batches 1 and 2 empty, batch 3 keeps 130 units",
    eq(runSql(db, `${D1_CTES}
SELECT b.batch_id, b.units - COALESCE(SUM(l.units_taken), 0) AS left_units
FROM batches b LEFT JOIN layers l ON l.batch_id = b.batch_id
GROUP BY b.batch_id ORDER BY b.batch_id ASC;`),
      [[1, 0], [2, 0], [3, 130]]));
  db.close();

  // TS mirror of the clamped FIFO consumption per (sale, batch)
  const batches = [[1, 100, 300], [2, 150, 320], [3, 200, 310]]; // id, units, unit_cost_cents
  const sales = [[1, 80], [2, 60], [3, 180]]; // id, units (chronological)
  let cp = 0;
  const supSpans = batches.map(([id, units, cost]) => {
    const span = { id, units, cost, before: cp, through: cp + units }; cp += units; return span;
  });
  let cs = 0;
  const soldSpans = sales.map(([id, units]) => {
    const span = { id, units, before: cs, through: cs + units }; cs += units; return span;
  });
  const clampMin = (s: (typeof soldSpans)[number], b: (typeof supSpans)[number]) =>
    Math.max(0, Math.min(b.through - s.before, b.units, s.units, s.through - b.before));
  const tsMatrix = soldSpans.flatMap((s) => supSpans.map((b) => clampMin(s, b)));
  ok("TS mirror: 9-cell take matrix === [80,0,0,20,40,0,0,110,70]",
    eq(tsMatrix, [80, 0, 0, 20, 40, 0, 0, 110, 70]), JSON.stringify(tsMatrix));
  const tsCogs = soldSpans.map((s) =>
    supSpans.reduce((acc, b) => acc + clampMin(s, b) * b.cost, 0));
  ok("TS mirror: per-sale COGS === [24000, 18800, 56900]",
    eq(tsCogs, [24000, 18800, 56900]), JSON.stringify(tsCogs));
  const tsLeft = supSpans.map((b) =>
    b.units - soldSpans.reduce((acc, s) => acc + clampMin(s, b), 0));
  ok("TS mirror: leftovers === [0, 0, 130]", eq(tsLeft, [0, 0, 130]), JSON.stringify(tsLeft));
}

console.log("\n=== deferred revenue — spine labels + integer slices ===");
{
  const d = SQL_DF_ACCT_B[1];
  const db = buildDb(d);
  const D2_SPINE = `WITH RECURSIVE months(sub_id, term_months, idx) AS (
    SELECT sub_id, term_months, 0 FROM subscriptions
    UNION ALL
    SELECT sub_id, term_months, idx + 1 FROM months
    WHERE idx + 1 < term_months
)`;
  const labels = runSql(db, `${D2_SPINE}
SELECT m.sub_id, m.idx, strftime('%Y-%m', date(s.start_date, '+' || m.idx || ' months')) AS label
FROM months m JOIN subscriptions s ON s.sub_id = m.sub_id
ORDER BY m.sub_id ASC, m.idx ASC;`);
  ok("spine emits exactly 21 rows (12 + 3 + 6)", labels.length === 21, String(labels.length));
  ok("spine labels hand-pinned (sub 1 2026-06..2027-05, sub 2 2026-08..10, sub 3 2026-01..06)",
    eq(labels, [
      [1, 0, "2026-06"], [1, 1, "2026-07"], [1, 2, "2026-08"], [1, 3, "2026-09"],
      [1, 4, "2026-10"], [1, 5, "2026-11"], [1, 6, "2026-12"], [1, 7, "2027-01"],
      [1, 8, "2027-02"], [1, 9, "2027-03"], [1, 10, "2027-04"], [1, 11, "2027-05"],
      [2, 0, "2026-08"], [2, 1, "2026-09"], [2, 2, "2026-10"],
      [3, 0, "2026-01"], [3, 1, "2026-02"], [3, 2, "2026-03"],
      [3, 3, "2026-04"], [3, 4, "2026-05"], [3, 5, "2026-06"],
    ]), JSON.stringify(labels));
  ok("integer slices: 10000 / 7000 / 8000",
    eq(runSql(db, `SELECT sub_id, total_cents / term_months AS monthly_cents
        FROM subscriptions ORDER BY sub_id ASC`),
      [[1, 10000], [2, 7000], [3, 8000]]));
  ok("TS divisibility check: every total_cents % term_months === 0",
    [[120000, 12], [21000, 3], [48000, 6]].every(([t, m]) => t % m === 0));
  db.close();
}

console.log("\n=== journal gaps — bounds + register shape ===");
{
  const d = SQL_DF_ACCT_B[2];
  const db = buildDb(d);
  ok("bounds: MIN 1001, MAX 1012",
    eq(runSql(db, `SELECT MIN(doc_no) AS lo, MAX(doc_no) AS hi FROM journal_entries`), [[1001, 1012]]));
  ok("9 postings on file", eq(runSql(db, `SELECT COUNT(*) AS n FROM journal_entries`), [[9]]));
  // the tight register quoted by example 2
  ok("tight register 1006..1012 reports only 1010",
    eq(runSql(db, `WITH RECURSIVE seq(n) AS (
        SELECT 1006 UNION ALL SELECT n + 1 FROM seq WHERE n < 1012)
      SELECT n AS missing_doc_no FROM seq
      WHERE n NOT IN (SELECT doc_no FROM journal_entries) ORDER BY n ASC;`),
      [[1010]]));
  db.close();
}

/* ---------- planted-trap probes: the WRONG queries must produce the documented wrong outputs ---------- */
console.log("\n=== planted-trap probes ===");

// D1 traps: LIFO, average cost, no-clamp
{
  const db = buildDb(SQL_DF_ACCT_B[0]);
  const SOLD = `WITH sold AS (
      SELECT sale_id, units,
        COALESCE(SUM(units) OVER (ORDER BY sale_date, sale_id
            ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) AS cum_sold_before,
        SUM(units) OVER (ORDER BY sale_date, sale_id
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_sold_through
      FROM sales
    )`;
  const SUPPLY = (dir: string) => `supply AS (
      SELECT batch_id, unit_cost_cents, units,
        COALESCE(SUM(units) OVER (ORDER BY batch_date ${dir}, batch_id ${dir}
            ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) AS cum_supply_before,
        SUM(units) OVER (ORDER BY batch_date ${dir}, batch_id ${dir}
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_supply_through
      FROM batches
    )`;
  const LAYERS = `layers AS (
      SELECT s.sale_id, b.unit_cost_cents,
        MAX(0, MIN(b.cum_supply_through - s.cum_sold_before, b.units, s.units,
                   s.cum_sold_through - b.cum_supply_before)) AS units_taken
      FROM sold s CROSS JOIN supply b
    )`;
  ok("D1 LIFO (supply windows mirrored, newest-first) books 24800 / 18600 / 57000",
    eq(runSql(db, `${SOLD}, ${SUPPLY("DESC")}, ${LAYERS}
      SELECT sale_id, SUM(units_taken * unit_cost_cents) AS cogs_cents
      FROM layers WHERE units_taken > 0 GROUP BY sale_id ORDER BY sale_id ASC;`),
      [[1, 24800], [2, 18600], [3, 57000]]));
  ok("D1 average cost (blended 140000/450 = 311.11 per unit) books 24889 / 18667 / 56000",
    eq(runSql(db, `WITH sup AS (SELECT SUM(units) AS u, SUM(units * unit_cost_cents) AS c FROM batches)
      SELECT s.sale_id, CAST(ROUND(s.units * sup.c * 1.0 / sup.u) AS INTEGER) AS cogs_cents
      FROM sales s, sup ORDER BY s.sale_id ASC;`),
      [[1, 24889], [2, 18667], [3, 56000]]));
  ok("D1 no-clamp variant (MIN without MAX(0,...), no filter) sums the negative layers: -35100 / -15300 / 44900",
    eq(runSql(db, `${SOLD}, ${SUPPLY("ASC")},
      layers AS (
        SELECT s.sale_id, b.unit_cost_cents,
          MIN(b.cum_supply_through - s.cum_sold_before, b.units, s.units,
              s.cum_sold_through - b.cum_supply_before) AS units_taken
        FROM sold s CROSS JOIN supply b
      )
      SELECT sale_id, SUM(units_taken * unit_cost_cents) AS cogs_cents
      FROM layers GROUP BY sale_id ORDER BY sale_id ASC;`),
      [[1, -35100], [2, -15300], [3, 44900]]));
  db.close();
}

// D2 traps: term-end off-by-one, proration, REAL division, label-range (agrees)
{
  const db = buildDb(SQL_DF_ACCT_B[1]);
  const SPINE = (bound: string) => `WITH RECURSIVE months(sub_id, term_months, idx) AS (
      SELECT sub_id, term_months, 0 FROM subscriptions
      UNION ALL
      SELECT sub_id, term_months, idx + 1 FROM months
      WHERE ${bound}
    ),
    recognized AS (
      SELECT m.sub_id,
        strftime('%Y-%m', date(s.start_date, '+' || m.idx || ' months')) AS month,
        s.total_cents / s.term_months AS recognized_cents
      FROM months m JOIN subscriptions s ON s.sub_id = m.sub_id
    )
    SELECT sub_id, month, recognized_cents FROM recognized
    WHERE month IN ('2026-07', '2026-08', '2026-09') ORDER BY sub_id ASC, month ASC`;
  ok("D2 term-end off-by-one (spine running to idx = term_months) adds sub 3's phantom July 8000: 6 rows",
    eq(runSql(db, SPINE("idx < term_months")),
      [[1, "2026-07", 10000], [1, "2026-08", 10000], [1, "2026-09", 10000],
       [2, "2026-08", 7000], [2, "2026-09", 7000], [3, "2026-07", 8000]]));
  ok("D2 prorated start month (days-based, 31-day August) books sub 2 at 6097, not 7000",
    eq(runSql(db, `WITH RECURSIVE months(sub_id, term_months, idx) AS (
        SELECT sub_id, term_months, 0 FROM subscriptions
        UNION ALL SELECT sub_id, term_months, idx + 1 FROM months WHERE idx + 1 < term_months
      ),
      recognized AS (
        SELECT m.sub_id,
          strftime('%Y-%m', date(s.start_date, '+' || m.idx || ' months')) AS month,
          CASE WHEN m.idx = 0
               THEN CAST(ROUND(1.0 * s.total_cents / s.term_months
                    * (31 - (CAST(strftime('%d', s.start_date) AS INTEGER) - 1)) / 31.0) AS INTEGER)
               ELSE s.total_cents / s.term_months END AS recognized_cents
        FROM months m JOIN subscriptions s ON s.sub_id = m.sub_id
      )
      SELECT sub_id, month, recognized_cents FROM recognized
      WHERE month IN ('2026-07', '2026-08', '2026-09') ORDER BY sub_id ASC, month ASC;`),
      [[1, "2026-07", 10000], [1, "2026-08", 10000], [1, "2026-09", 10000],
       [2, "2026-08", 6097], [2, "2026-09", 7000]]));
  ok("D2 REAL division (total * 1.0 / term) pollutes all 5 cells to typeof 'real'",
    eq(runSql(db, `SELECT COUNT(*) AS real_cells FROM (
        WITH RECURSIVE months(sub_id, term_months, idx) AS (
          SELECT sub_id, term_months, 0 FROM subscriptions
          UNION ALL SELECT sub_id, term_months, idx + 1 FROM months WHERE idx + 1 < term_months
        ),
        recognized AS (
          SELECT m.sub_id,
            strftime('%Y-%m', date(s.start_date, '+' || m.idx || ' months')) AS month,
            s.total_cents * 1.0 / s.term_months AS recognized_cents
          FROM months m JOIN subscriptions s ON s.sub_id = m.sub_id
        )
        SELECT sub_id, month, recognized_cents FROM recognized
        WHERE month IN ('2026-07', '2026-08', '2026-09'))
      WHERE typeof(recognized_cents) = 'real';`),
      [[5]]));
  // documented non-live probe: a label-range filter agrees on this seed
  // (labels sort chronologically, so BETWEEN matches the IN set exactly)
  ok("D2 label-range BETWEEN '2026-07' AND '2026-09' HAPPENS TO AGREE with the pinned IN list on this seed",
    eq(runSql(db, `WITH RECURSIVE months(sub_id, term_months, idx) AS (
        SELECT sub_id, term_months, 0 FROM subscriptions
        UNION ALL SELECT sub_id, term_months, idx + 1 FROM months WHERE idx + 1 < term_months
      ),
      recognized AS (
        SELECT m.sub_id,
          strftime('%Y-%m', date(s.start_date, '+' || m.idx || ' months')) AS month,
          s.total_cents / s.term_months AS recognized_cents
        FROM months m JOIN subscriptions s ON s.sub_id = m.sub_id
      )
      SELECT sub_id, month, recognized_cents FROM recognized
      WHERE month BETWEEN '2026-07' AND '2026-09' ORDER BY sub_id ASC, month ASC;`),
      [[1, "2026-07", 10000], [1, "2026-08", 10000], [1, "2026-09", 10000],
       [2, "2026-08", 7000], [2, "2026-09", 7000]]));
  db.close();
}

// D3 traps: anchor 0, swapped bounds, NULL kill, inverted predicate
{
  const db = buildDb(SQL_DF_ACCT_B[2]);
  const ANCHOR0 = `WITH RECURSIVE seq(n) AS (
      SELECT 0 UNION ALL SELECT n + 1 FROM seq
      WHERE n < (SELECT MAX(doc_no) FROM journal_entries))
    SELECT n AS missing_doc_no FROM seq
    WHERE n NOT IN (SELECT doc_no FROM journal_entries) ORDER BY n ASC;`;
  const anchor0 = runSql(db, ANCHOR0);
  ok("D3 anchor-at-0 reports 1004 findings — 0 through 1000 phantom (1001 numbers) plus the 3 true gaps",
    anchor0.length === 1004 && eq(anchor0[0], [0]) && anchor0.some((r) => eq(r, [1004]))
      && anchor0.some((r) => eq(r, [1005])) && anchor0.some((r) => eq(r, [1010])),
    String(anchor0.length));
  ok("D3 swapped bounds (recursion bounded at MIN) terminates after one step: 0 rows",
    eq(runSql(db, `WITH RECURSIVE seq(n) AS (
        SELECT MIN(doc_no) FROM journal_entries
        UNION ALL SELECT n + 1 FROM seq
        WHERE n < (SELECT MIN(doc_no) FROM journal_entries))
      SELECT n AS missing_doc_no FROM seq
      WHERE n NOT IN (SELECT doc_no FROM journal_entries) ORDER BY n ASC;`),
      []));
  ok("D3 NOT IN without NULLs keeps a known-missing 1004 (1 hit)",
    eq(runSql(db, `WITH cand(n) AS (VALUES (1004))
      SELECT COUNT(*) AS hits FROM cand
      WHERE n NOT IN (SELECT doc_no FROM journal_entries);`),
      [[1]]));
  ok("D3 one NULL in the doc_no set kills NOT IN entirely (0 hits) — the no-NULL constraint is load-bearing",
    eq(runSql(db, `WITH cand(n) AS (VALUES (1004))
      SELECT COUNT(*) AS hits FROM cand
      WHERE n NOT IN (SELECT doc_no FROM journal_entries UNION ALL SELECT NULL);`),
      [[0]]));
  ok("D3 inverted predicate (n IN present) reads the 9 EXISTING numbers, not the gaps",
    eq(runSql(db, `WITH RECURSIVE seq(n) AS (
        SELECT MIN(doc_no) FROM journal_entries
        UNION ALL SELECT n + 1 FROM seq
        WHERE n < (SELECT MAX(doc_no) FROM journal_entries))
      SELECT COUNT(*) AS present FROM seq
      WHERE n IN (SELECT doc_no FROM journal_entries);`),
      [[9]]));
  db.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log(`ALL CHECKS PASS ${SQL_DF_ACCT_B.length}/3`);
