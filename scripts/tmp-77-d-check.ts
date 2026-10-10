// Task 77-d self-check — sql-df-mktg-b.ts (3 Marketing B dives with primers):
// 8058 linear-multi-touch · 8059 budget-pacing · 8060 channel-ltv-vs-cac.
// bun scripts/tmp-77-d-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_MKTG_B } from "../src/lib/leetcode/content/sql-df-mktg-b";
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
// Pinned output contracts (hand-derived from the seeds, confirmed by the engine).
const SPEC: Array<{
  slug: string; id: number; difficulty: "Easy" | "Medium" | "Hard"; xp: number;
  columns: string[]; rows: unknown[][]; realColumns: string[]; intColumns: string[];
  order: "exact" | "any";
}> = [
  { slug: "linear-multi-touch", id: 8058, difficulty: "Medium", xp: 20,
    columns: ["channel", "touches_assisted", "credited_conversions"],
    rows: [
      ["Email", 6, 1.83],
      ["Meta", 6, 1.75],
      ["Google", 6, 1.42],
      ["Affiliate", 1, 1.0],
    ],
    realColumns: ["credited_conversions"], intColumns: ["touches_assisted"], order: "exact" },
  { slug: "budget-pacing", id: 8059, difficulty: "Medium", xp: 20,
    columns: ["campaign", "breach_day", "cum_spend_at_breach", "budget_cents", "over_by_cents"],
    rows: [
      ["flash_sale", "2026-10-03", 53000, 50000, 3000],
      ["brand_search", "2026-10-09", 76000, 75000, 1000],
    ],
    realColumns: [], intColumns: ["cum_spend_at_breach", "budget_cents", "over_by_cents"], order: "exact" },
  { slug: "channel-ltv-vs-cac", id: 8060, difficulty: "Hard", xp: 35,
    columns: ["channel", "customers", "cac_cents", "rev90_cents", "rev90_per_customer", "ltv_cac_ratio"],
    rows: [
      ["search", 4, 9000, 236000, 59000, 6.56],
      ["email", 4, 6000, 55000, 13750, 2.29],
      ["social", 5, 1000, 3000, 600, 0.6],
    ],
    realColumns: ["rev90_per_customer", "ltv_cac_ratio"], intColumns: ["customers", "cac_cents", "rev90_cents"], order: "exact" },
];
const XP: Record<string, number> = { Easy: 10, Medium: 20, Hard: 35 };

// related slugs may ONLY come from the registered Data & Finance track.
const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));
const RELATED_POOL = new Set([...LC_SLUGS]); // batch-4 siblings not yet wired: registry only

console.log(`\n=== sql-df-mktg-b.ts — ${SQL_DF_MKTG_B.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_MKTG_B.length === 3 && SPEC.every((s, i) => SQL_DF_MKTG_B[i]?.slug === s.slug),
  SQL_DF_MKTG_B.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_MKTG_B[i];
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
    ok(`related slug from the Data & Finance registry: ${r}`, RELATED_POOL.has(r));
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

  // MONEY convention: every money column (input) is INTEGER in the DDL; the
  // output money sums are integer-VALUED; only the pinned 2dp cells are REAL.
  const ddlMoney = (d.schema.ddl.match(/^\s*(\w+_cents|\w+_minor)\s+(\w+)/gim) ?? [])
    .map((m) => m.trim().split(/\s+/));
  ok(`every *_cents/_minor DDL column is INTEGER (${ddlMoney.length} money columns)`,
    ddlMoney.length === 0 || ddlMoney.every((part) => part[1] === "INTEGER"), JSON.stringify(ddlMoney));
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
    ok("every declared-integer cell is integer-valued",
      r1.every((row) => spec.intColumns.every((c) => Number.isInteger(row[spec.columns.indexOf(c)]))));
  } catch (e) {
    ok("engine build+run", false, String(e));
  }
}

/* ---------- per-dive hand verification: TS float mirrors (1e-9) ---------- */

console.log("\n=== linear-multi-touch — TS mirror of the channel fraction sums ===");
{
  const d = SQL_DF_MKTG_B[0];
  const db = buildDb(d);
  // raw (unrounded) per-channel sums straight from the engine
  const raw = runSql(db, `WITH pairs AS (
      SELECT c.conversion_id, t.channel
      FROM conversions c
      JOIN touches t ON t.user_id = c.user_id
        AND t.touch_date >= date(c.conversion_date, '-29 day')
        AND t.touch_date <= c.conversion_date),
    sized AS (SELECT conversion_id, channel, COUNT(*) OVER (PARTITION BY conversion_id) AS n FROM pairs)
    SELECT channel, COUNT(*), SUM(1.0 / n) FROM sized GROUP BY channel ORDER BY channel`);
  ok("raw query returns 4 channels", raw.length === 4, String(raw.length));
  // TS mirror: exact real-number credit pools per channel from the seed design
  const third = 1 / 3, sixth = 1 / 6;
  const mirror: Record<string, [number, number]> = {
    Affiliate: [1, 1.0],
    Email: [6, 0.25 + 0.25 + 0.5 + third + third + sixth],
    Google: [6, 0.25 + third + third + 0.5],
    Meta: [6, 0.25 + 0.5 + third + third + third],
  };
  raw.forEach((row) => {
    const ch = row[0] as string;
    const [tA, cRaw] = mirror[ch];
    ok(`${ch}: engine touches_assisted === ${tA}`, row[1] === tA, String(row[1]));
    ok(`${ch}: engine raw credit within 1e-9 of TS mirror (${cRaw})`,
      Math.abs((row[2] as number) - cRaw) < 1e-9, `${row[2]} vs ${cRaw}`);
  });
  // the audit: total credit === conversions (6) exactly
  const total = Object.values(mirror).reduce((s, [, c]) => s + c, 0);
  ok(`audit: all-channel credit sums to 6.0 conversions (${total})`, Math.abs(total - 6) < 1e-9, String(total));
  // boundary sanity: conversion 1's window opens 2026-09-11 — the 09-10 decoy is day -30
  const decoy = runSql(db, `SELECT COUNT(*) FROM touches t
      WHERE t.touch_date = '2026-09-10'
        AND date('2026-10-10', '-29 day') <= t.touch_date`);
  ok("2026-09-10 decoy is OUTSIDE conversion 1's window (day -30)", decoy[0][0] === 0, String(decoy[0][0]));
  const boundary = runSql(db, `SELECT COUNT(*) FROM touches
      WHERE user_id = 102 AND touch_date = date('2026-10-12', '-29 day')`);
  ok("conversion 2's Meta touch sits exactly on day -29 (IN)", boundary[0][0] === 1, String(boundary[0][0]));
  db.close();
}

console.log("\n=== budget-pacing — TS mirror of the cumulative lines ===");
{
  const d = SQL_DF_MKTG_B[1];
  const db = buildDb(d);
  const lines = runSql(db, `SELECT campaign, day, spend_cents FROM campaign_spend ORDER BY campaign, day`);
  const byCampaign: Record<string, Array<[string, number]>> = {};
  lines.forEach((r) => {
    (byCampaign[r[0] as string] ??= []).push([r[1] as string, r[2] as number]);
  });
  const budgets = Object.fromEntries(
    runSql(db, `SELECT campaign, budget_cents FROM campaign_budgets`).map((r) => [r[0] as string, r[1] as number]));
  ok("4 campaigns seeded", Object.keys(byCampaign).length === 4, JSON.stringify(Object.keys(byCampaign)));
  // flash_sale: front-loader, first strictly-over day index 2 (2026-10-03), over 3000
  {
    let cum = 0, breach: [string, number] | null = null;
    for (const [day, s] of byCampaign["flash_sale"]) { cum += s; if (!breach && cum > budgets["flash_sale"]) breach = [day, cum]; }
    ok("flash_sale breach 2026-10-03 at 53000 (over 3000)",
      !!breach && breach[0] === "2026-10-03" && breach[1] === 53000, JSON.stringify(breach));
  }
  // brand_search: steady climber, first breach 2026-10-09 at 76000 (over 1000)
  {
    let cum = 0, breach: [string, number] | null = null;
    for (const [day, s] of byCampaign["brand_search"]) { cum += s; if (!breach && cum > budgets["brand_search"]) breach = [day, cum]; }
    ok("brand_search breach 2026-10-09 at 76000 (over 1000)",
      !!breach && breach[0] === "2026-10-09" && breach[1] === 76000, JSON.stringify(breach));
  }
  // retargeting: peaks EXACTLY at budget — never strictly over (no row)
  {
    let cum = 0, max = 0;
    for (const [, s] of byCampaign["retargeting"]) { cum += s; max = cum; }
    ok("retargeting peaks at exactly 40000 == budget (no breach)", max === 40000 && budgets["retargeting"] === 40000,
      `${max} vs ${budgets["retargeting"]}`);
    ok("retargeting flies 6 contiguous days", byCampaign["retargeting"].length === 6, String(byCampaign["retargeting"].length));
  }
  // always_on: never near 200000
  {
    const total = byCampaign["always_on"].reduce((s, [, v]) => s + v, 0);
    ok("always_on totals 48000 against a 200000 budget", total === 48000, String(total));
  }
  db.close();
}

console.log("\n=== channel-ltv-vs-cac — TS mirror of the 90-day clocks ===");
{
  const d = SQL_DF_MKTG_B[2];
  const db = buildDb(d);
  const DAY = 86400000;
  const toMs = (s: string) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  const custs = runSql(db, `SELECT customer_id, channel, acquisition_date FROM customers`);
  const orders = runSql(db, `SELECT customer_id, order_date, revenue_cents FROM orders`);
  ok("13 customers seeded", custs.length === 13, String(custs.length));
  ok("39 orders seeded", orders.length === 39, String(orders.length));
  const revByCust: Record<number, number> = {};
  orders.forEach((o) => { revByCust[o[0] as number] = (revByCust[o[0] as number] ?? 0) + (o[2] as number); });
  // TS mirror: rev90 on each customer's OWN [acq, acq + 89] clock
  const chRev: Record<string, { customers: number; rev90: number }> = {};
  custs.forEach((c) => {
    const [id, ch, acq] = [c[0] as number, c[1] as string, c[2] as string];
    const end = toMs(acq) + 89 * DAY;
    let r = 0;
    orders.forEach((o) => {
      if ((o[0] as number) !== id) return;
      const od = toMs(o[1] as string);
      if (od >= toMs(acq) && od <= end) r += o[2] as number;
    });
    (chRev[ch] ??= { customers: 0, rev90: 0 });
    chRev[ch].customers++; chRev[ch].rev90 += r;
  });
  ok("TS mirror search: 4 customers, rev90 236000",
    chRev["search"].customers === 4 && chRev["search"].rev90 === 236000, JSON.stringify(chRev["search"]));
  ok("TS mirror email: 4 customers, rev90 55000",
    chRev["email"].customers === 4 && chRev["email"].rev90 === 55000, JSON.stringify(chRev["email"]));
  ok("TS mirror social: 5 customers, rev90 3000",
    chRev["social"].customers === 5 && chRev["social"].rev90 === 3000, JSON.stringify(chRev["social"]));
  // the boundary pair: customer 101's two orders sit on day 89 and day 90
  const c101 = orders.filter((o) => o[0] === 101).map((o) => Math.round((toMs(o[1] as string) - toMs("2026-07-01")) / DAY));
  ok("customer 101 order days include 89 AND 90 (the pinned pair)",
    c101.includes(89) && c101.includes(90), JSON.stringify(c101.sort((a, b) => a - b)));
  // day arithmetic spot-check: date('2026-07-01', '+89 day') === 2026-09-28
  const endSql = runSql(db, `SELECT date('2026-07-01', '+89 day')`)[0][0];
  ok("SQLite +89 day from 2026-07-01 reads 2026-09-28", endSql === "2026-09-28", String(endSql));
  // exact-division honesty: every pinned division is exact on this seed
  ok("36000/4, 236000/4, 55000/4, 5000/5, 3000/5 all divide exactly",
    36000 % 4 === 0 && 236000 % 4 === 0 && 55000 % 4 === 0 && 5000 % 5 === 0 && 3000 % 5 === 0);
  db.close();
}

/* ---------- planted-trap probes: the WRONG queries must produce the documented wrong outputs ---------- */
console.log("\n=== planted-trap probes ===");

// D1 traps (8058)
{
  const d = SQL_DF_MKTG_B[0];
  const db = buildDb(d);
  const PAIRS = `WITH pairs AS (
      SELECT c.conversion_id, t.channel
      FROM conversions c
      JOIN touches t ON t.user_id = c.user_id
        AND t.touch_date >= date(c.conversion_date, '-29 day')
        AND t.touch_date <= c.conversion_date)`;
  ok("D1 integer division SUM(1/n): Affiliate keeps 1.0, every other channel collapses to 0",
    eq(runSql(db, `${PAIRS},
      sized AS (SELECT conversion_id, channel, COUNT(*) OVER (PARTITION BY conversion_id) AS n FROM pairs)
      SELECT channel, COUNT(*) AS touches_assisted, ROUND(SUM(1 / n), 2) AS credited
      FROM sized GROUP BY channel ORDER BY credited DESC, channel ASC`),
      [["Affiliate", 1, 1], ["Email", 6, 0], ["Google", 6, 0], ["Meta", 6, 0]]));
  // "round before the final SUM" trap at conversion grain: each conversion's
  // per-channel share is rounded before the shares are summed per channel —
  // Email happens to still agree, Meta and Google each lose a hundredth
  ok("D1 ROUND per-conversion share before SUM: Email 1.83 (agrees), Meta 1.74, Google 1.41, Affiliate 1.0",
    eq(runSql(db, `${PAIRS},
      sized AS (SELECT conversion_id, channel, COUNT(*) OVER (PARTITION BY conversion_id) AS n FROM pairs),
      shares AS (SELECT conversion_id, channel, ROUND(SUM(1.0 / n), 2) AS frac FROM sized GROUP BY conversion_id, channel)
      SELECT channel, ROUND(SUM(frac), 2) AS credited
      FROM shares GROUP BY channel ORDER BY credited DESC, channel ASC`),
      [["Email", 1.83], ["Meta", 1.74], ["Google", 1.41], ["Affiliate", 1]]));
  ok("D1 per-share rounding breaks the 6.0 audit: all-channel total reads 5.98",
    eq(runSql(db, `${PAIRS},
      sized AS (SELECT conversion_id, channel, COUNT(*) OVER (PARTITION BY conversion_id) AS n FROM pairs),
      shares AS (SELECT conversion_id, channel, ROUND(SUM(1.0 / n), 2) AS frac FROM sized GROUP BY conversion_id, channel)
      SELECT ROUND(SUM(frac), 2) FROM shares`),
      [[5.98]]));
  ok("D1 DISTINCT conversions as credit: Email 5, Meta 5, Google 4, Affiliate 1",
    eq(runSql(db, `${PAIRS}
      SELECT channel, COUNT(DISTINCT conversion_id) AS credited
      FROM pairs GROUP BY channel ORDER BY credited DESC, channel ASC`),
      [["Email", 5], ["Meta", 5], ["Google", 4], ["Affiliate", 1]]));
  ok("D1 raw-table touch counts (no pairing): Google 8, Email 7, Meta 7, Affiliate 1",
    eq(runSql(db, `SELECT channel, COUNT(*) AS n FROM touches GROUP BY channel ORDER BY channel`),
      [["Affiliate", 1], ["Email", 7], ["Google", 8], ["Meta", 7]]));
  db.close();
}

// D2 traps (8059)
{
  const d = SQL_DF_MKTG_B[1];
  const db = buildDb(d);
  const PACED = `WITH paced AS (
      SELECT s.campaign, s.day,
        SUM(s.spend_cents) OVER (PARTITION BY s.campaign ORDER BY s.day) AS cum_spend_cents,
        b.budget_cents
      FROM campaign_spend s
      JOIN campaign_budgets b ON b.campaign = s.campaign)`;
  ok("D2 >= breach test swallows the exactly-at-budget campaign: 3 rows with retargeting over_by 0",
    eq(runSql(db, `${PACED},
      breaches AS (SELECT campaign, day, cum_spend_cents, budget_cents,
        ROW_NUMBER() OVER (PARTITION BY campaign ORDER BY day) AS rn
        FROM paced WHERE cum_spend_cents >= budget_cents)
      SELECT campaign, day AS breach_day, cum_spend_cents AS cum_spend_at_breach, budget_cents,
        cum_spend_cents - budget_cents AS over_by_cents
      FROM breaches WHERE rn = 1 ORDER BY breach_day ASC, campaign ASC`),
      [["flash_sale", "2026-10-03", 53000, 50000, 3000],
       ["retargeting", "2026-10-06", 40000, 40000, 0],
       ["brand_search", "2026-10-09", 76000, 75000, 1000]]));
  ok("D2 reporting EVERY breach day ships 14 rows (flash 10, brand 4), not 2",
    eq(runSql(db, `SELECT COUNT(*) FROM (${PACED}
        SELECT campaign, day FROM paced WHERE cum_spend_cents > budget_cents)`),
      [[14]]));
  ok("D2 no-partition running sum: all four campaigns breach against the global line (retargeting 10-01, brand_search + flash_sale 10-02 at 81000, always_on 10-09 at 216500)",
    eq(runSql(db, `WITH paced AS (
        SELECT s.campaign, s.day,
          SUM(s.spend_cents) OVER (ORDER BY s.day) AS cum_spend_cents,
          b.budget_cents
        FROM campaign_spend s
        JOIN campaign_budgets b ON b.campaign = s.campaign),
      breaches AS (SELECT campaign, day, cum_spend_cents, budget_cents,
        ROW_NUMBER() OVER (PARTITION BY campaign ORDER BY day) AS rn
        FROM paced WHERE cum_spend_cents > budget_cents)
      SELECT campaign, day AS breach_day, cum_spend_cents AS cum_spend_at_breach, budget_cents,
        cum_spend_cents - budget_cents AS over_by_cents
      FROM breaches WHERE rn = 1 ORDER BY breach_day ASC, campaign ASC`),
      [["retargeting", "2026-10-01", 42000, 40000, 2000],
       ["brand_search", "2026-10-02", 81000, 75000, 6000],
       ["flash_sale", "2026-10-02", 81000, 50000, 31000],
       ["always_on", "2026-10-09", 216500, 200000, 16500]]));
  // dollar-vs-cent budgets: rebuild with budgets / 100 and rerun the solution
  const db2 = buildDb(d);
  db2.run(`UPDATE campaign_budgets SET budget_cents = budget_cents / 100`);
  const dollarRows = runSql(db2, d.code);
  ok("D2 dollar budgets read as cents: 4 rows, all breaching on 2026-10-01",
    dollarRows.length === 4 && dollarRows.every((r) => r[1] === "2026-10-01"),
    JSON.stringify(dollarRows));
  // always_on's budget 200000 reads 2000 in dollars, so it breaches at 4000 over_by 2000
  ok("D2 dollar-budget rows: always_on 4000/2000/2000, brand 8000/750/7250, flash 20000/500/19500, retarget 10000/400/9600",
    eq(dollarRows.map((r) => [r[0], r[2], r[3], r[4]]),
      [["always_on", 4000, 2000, 2000], ["brand_search", 8000, 750, 7250],
       ["flash_sale", 20000, 500, 19500], ["retargeting", 10000, 400, 9600]]));
  db2.close();
  db.close();
}

// D3 traps (8060)
{
  const d = SQL_DF_MKTG_B[2];
  const db = buildDb(d);
  ok("D3 global channel clock (MIN acquisition + 89d): search 6.06, email 1.92, social 0.44",
    eq(runSql(db, `WITH clocks AS (
        SELECT channel, MIN(acquisition_date) AS gstart FROM customers GROUP BY channel),
      rev AS (
        SELECT c.channel, c.customer_id,
          COALESCE(SUM(CASE WHEN o.order_date >= k.gstart
                         AND o.order_date <= date(k.gstart, '+89 day')
                        THEN o.revenue_cents END), 0) AS r
        FROM customers c
        JOIN clocks k ON k.channel = c.channel
        LEFT JOIN orders o ON o.customer_id = c.customer_id
        GROUP BY c.channel, c.customer_id)
      SELECT v.channel, v.customers, ROUND(cs.spend_cents * 1.0 / v.customers, 0) AS cac_cents,
        v.rev90_cents, ROUND(v.rev90_cents * 1.0 / v.customers, 2) AS rev90_per_customer,
        ROUND(ROUND(v.rev90_cents * 1.0 / v.customers, 2)
          / ROUND(cs.spend_cents * 1.0 / v.customers, 0), 2) AS ltv_cac_ratio
      FROM (SELECT channel, COUNT(*) AS customers, SUM(r) AS rev90_cents FROM rev GROUP BY channel) v
      JOIN channel_spend cs ON cs.channel = v.channel
      ORDER BY ltv_cac_ratio DESC`),
      [["search", 4, 9000, 218000, 54500, 6.06],
       ["email", 4, 6000, 46000, 11500, 1.92],
       ["social", 5, 1000, 2200, 440, 0.44]]));
  // day-90 inclusive: swap the pinned +89 for +90 in the real solution
  const d90 = d.code.replace(/\+89 day/g, "+90 day");
  ok("D3 day-90 inclusive window: only search moves (248000, per-customer 62000, ratio 6.89)",
    eq(runSql(db, d90),
      [["search", 4, 9000, 248000, 62000, 6.89],
       ["email", 4, 6000, 55000, 13750, 2.29],
       ["social", 5, 1000, 3000, 600, 0.6]]));
  // excluding zero-order customers: LEFT JOIN -> JOIN drops customer 104
  const inner = d.code.replace("LEFT JOIN orders o", "JOIN orders o");
  ok("D3 INNER JOIN drops zero-order customer 104: search reads 3 customers, cac 12000, per-customer 78666.67, ratio survives 6.56",
    eq(runSql(db, inner),
      [["search", 3, 12000, 236000, 78666.67, 6.56],
       ["email", 4, 6000, 55000, 13750, 2.29],
       ["social", 5, 1000, 3000, 600, 0.6]]));
  // the 100x misread of the pinned ratio
  ok("D3 rev90_per_customer * 100 / cac blows up a hundredfold: search 655.56 (vs 6.56)",
    eq(runSql(db, `WITH rev90 AS (
        SELECT c.customer_id, c.channel, COALESCE(SUM(o.revenue_cents), 0) AS rev_cents
        FROM customers c
        LEFT JOIN orders o
          ON o.customer_id = c.customer_id
         AND o.order_date >= c.acquisition_date
         AND o.order_date <= date(c.acquisition_date, '+89 day')
        GROUP BY c.customer_id, c.channel),
      per_channel AS (
        SELECT channel, COUNT(*) AS customers, SUM(rev_cents) AS rev90_cents
        FROM rev90 GROUP BY channel)
      SELECT p.channel,
        ROUND(ROUND(p.rev90_cents * 1.0 / p.customers, 2)
          * 100 / ROUND(cs.spend_cents * 1.0 / p.customers, 0), 2) AS wrong_ratio
      FROM per_channel p
      JOIN channel_spend cs ON cs.channel = p.channel
      ORDER BY wrong_ratio DESC`),
      [["search", 655.56], ["email", 229.17], ["social", 60]]));
  db.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log(`ALL CHECKS PASS ${SQL_DF_MKTG_B.length}/3`);
