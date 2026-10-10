// Task 77-c self-check — sql-df-mktg-a.ts (3 Marketing & Attribution A dives).
// bun scripts/tmp-77-c-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_MKTG_A } from "../src/lib/leetcode/content/sql-df-mktg-a";
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
  { slug: "roas-by-campaign", id: 8055, difficulty: "Easy", xp: 10,
    columns: ["campaign", "spend_cents", "revenue_cents", "roas", "rn"],
    rows: [
      ["search-brand", 30000, 132000, 4.4, 1],
      ["social-ads", 32000, 72050, 2.25, 2],
      ["video-ads", 40000, 90000, 2.25, 2],
      ["display-retargeting", 25000, 38750, 1.55, 4],
      ["podcast-sponsorships", 18000, 0, 0, 5],
    ],
    realColumns: ["roas"], intColumns: ["spend_cents", "revenue_cents", "rn"], order: "exact" },
  { slug: "first-last-touch-attribution", id: 8056, difficulty: "Easy", xp: 10,
    columns: ["conversion_id", "first_channel", "last_channel"],
    rows: [
      [1, "Meta", "Google"],
      [2, "Google", "Google"],
      [3, "Email", "Email"],
      [4, "none", "none"],
      [5, "Email", "Google"],
      [6, "none", "none"],
    ],
    realColumns: [], intColumns: ["conversion_id"], order: "exact" },
  { slug: "email-engagement-funnel", id: 8057, difficulty: "Medium", xp: 20,
    columns: ["campaign", "sent", "delivered", "opened", "clicked", "converted", "open_pct", "click_pct"],
    rows: [
      ["newsletter-weekly", 8, 3, 0, 0, 0, 0, 0],
      ["product-launch", 6, 6, 5, 1, 1, 83.33, 20],
      ["spring-sale", 10, 9, 6, 3, 2, 66.67, 50],
    ],
    realColumns: ["open_pct", "click_pct"], intColumns: ["sent", "delivered", "opened", "clicked", "converted"], order: "exact" },
];
const XP: Record<string, number> = { Easy: 10, Medium: 20, Hard: 35 };

// related slugs must come from the Data & Finance track (registry rows 8001-8048).
const RELATED_POOL = new Set([
  "dau-wau-stickiness", "growth-accounting", "funnel-step-conversion", "cohort-retention-matrix",
  "sessionize-events", "ab-test-conversion-lift", "loan-amortization-schedule", "delinquency-buckets",
  "portfolio-weights", "settlement-fails-aging", "realized-pnl-average-cost", "gl-reconciliation",
  "week-over-week-churn", "median-time-to-convert", "rolling-7d-actives", "usage-tier-percentiles",
  "ab-sample-ratio-mismatch", "feature-adoption-windows", "fx-exposure-report",
  "portfolio-concentration-hhi", "daily-balance-interest", "dividend-income-calendar", "max-drawdown",
  "duplicate-charge-pairs", "vintage-default-curves", "delinquency-roll-rates", "credit-utilization-bands",
  "expected-credit-loss", "risk-based-pricing", "prepayment-detection", "structuring-detection",
  "transaction-velocity", "circular-transfers", "amount-anomaly-zscore", "chargeback-rate-ranking",
  "dormant-reactivation", "trial-balance-check", "ar-aging-schedule", "balance-rollforward",
  "fifo-inventory-cogs", "deferred-revenue", "journal-gap-detection", "time-weighted-return",
  "sharpe-ratio", "value-at-risk", "beta-benchmark", "split-adjusted-position", "wash-trade-detection",
]);
const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));

console.log(`\n=== sql-df-mktg-a.ts — ${SQL_DF_MKTG_A.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_MKTG_A.length === 3 && SPEC.every((s, i) => SQL_DF_MKTG_A[i]?.slug === s.slug),
  SQL_DF_MKTG_A.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_MKTG_A[i];
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
    ok(`related slug from the Data & Finance pool: ${r}`, RELATED_POOL.has(r));
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
  ok('no "e.g."/"i.e." in prose',
    proseStrings(d).every((s) => !/\be\.g\.|\bi\.e\./i.test(s)));

  // MONEY convention (dive 1 only — the other two carry no money columns)
  const ddlMoney = (d.schema.ddl.match(/^\s*(\w+_cents|\w+_minor)\s+(\w+)/gim) ?? [])
    .map((m) => m.trim().split(/\s+/));
  if (i === 0) {
    const moneyOut = spec.columns.filter((c) => /(_cents|_minor)$/.test(c));
    ok("every *_cents output column is declared integer", moneyOut.every((c) => spec.intColumns.includes(c)));
    ok(`every *_cents DDL column is INTEGER (${ddlMoney.length} money columns)`,
      ddlMoney.length === 2 && ddlMoney.every((part) => part[1] === "INTEGER"), JSON.stringify(ddlMoney));
  } else {
    ok("no money columns in this dive", ddlMoney.length === 0 && !spec.columns.some((c) => /_cents$/.test(c)));
  }
  ok("declared REAL columns appear in the output", spec.realColumns.every((c) => spec.columns.includes(c)));
  ok("no julianday anywhere (dates are plain labels)", !/julianday/i.test(d.code) && !/julianday/i.test(d.schema.seed));

  // registry tuple: PEND while the lead owes wiring
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

console.log("\n=== roas-by-campaign — TS mirror of weekly totals and raw ratios ===");
{
  const d = SQL_DF_MKTG_A[0];
  const db = buildDb(d);
  const totals = runSql(db, `SELECT s.campaign, SUM(s.spend_cents),
      (SELECT SUM(r.revenue_cents) FROM attributed_revenue r WHERE r.campaign = s.campaign) AS rev
    FROM campaign_spend s GROUP BY s.campaign ORDER BY s.campaign ASC`);
  // TS-side hand sums straight from the seed rows
  const TS: Record<string, [number, number]> = {
    "display-retargeting": [25000, 38750],
    "podcast-sponsorships": [18000, 0],
    "search-brand": [30000, 132000],
    "social-ads": [32000, 72050],
    "video-ads": [40000, 90000],
  };
  ok("engine weekly totals within 1 of TS hand sums (podcast revenue NULL)",
    totals.length === 5 && totals.every(([c, sp, rv]) => {
      const [tsp, trv] = TS[c as string];
      return Math.abs((sp as number) - tsp) <= 0 &&
        (rv === null ? trv === 0 : Math.abs((rv as number) - trv) <= 0);
    }), JSON.stringify(totals));
  // raw ratios: engine vs TS, identical op order
  const rawRatios: Array<[string, number, number]> = [
    ["search-brand", 132000, 30000], ["social-ads", 72050, 32000], ["video-ads", 90000, 40000],
    ["display-retargeting", 38750, 25000], ["podcast-sponsorships", 0, 18000],
  ];
  for (const [camp, rev, sp] of rawRatios) {
    const eng = runSql(db, `SELECT ROUND(1.0 * ${rev} / ${sp}, 2), 1.0 * ${rev} / ${sp}`)[0];
    const ts = rev * 1.0 / sp;
    ok(`${camp} raw ratio within 1e-9 of TS mirror (${ts})`, Math.abs((eng[1] as number) - ts) < 1e-9, `${eng[1]} vs ${ts}`);
    ok(`${camp} ROUND lands at ${eng[0]}`, eq(eng[0], Math.round(ts * 100) / 100), String(eng[0]));
  }
  ok("tie pair pins: social-ads raw 2.2515625 and video-ads raw 2.25 both ROUND to 2.25",
    runSql(db, `SELECT ROUND(1.0 * 72050 / 32000, 2) = ROUND(1.0 * 90000 / 40000, 2)`)[0][0] === 1);
  ok("integer-division mirror: 132000/30000=4, 72050/32000=2, 90000/40000=2, 38750/25000=1, 0/18000=0",
    eq(runSql(db, `SELECT 132000/30000, 72050/32000, 90000/40000, 38750/25000, 0/18000`), [[4, 2, 2, 1, 0]]));
  db.close();
}

console.log("\n=== first-last-touch-attribution — date window + in-window counts mirror ===");
{
  const d = SQL_DF_MKTG_A[1];
  const db = buildDb(d);
  // date arithmetic the window depends on
  ok("date('2026-09-20','-29 days') === 2026-08-22 (day -29 inclusive bound)",
    runSql(db, `SELECT date('2026-09-20','-29 days')`)[0][0] === "2026-08-22");
  ok("date('2026-09-21','-29 days') === 2026-08-23 and date('2026-09-21','-30 days') === 2026-08-22",
    eq(runSql(db, `SELECT date('2026-09-21','-29 days'), date('2026-09-21','-30 days')`), [["2026-08-23", "2026-08-22"]]));
  ok("boundary facts: 2026-08-22 is day -29 for conversion 3 (09-20) and day -30 for conversion 4 (09-21)",
    eq(runSql(db, `SELECT CAST(julianday('2026-09-20') - julianday('2026-08-22') AS INTEGER),
      CAST(julianday('2026-09-21') - julianday('2026-08-22') AS INTEGER)`), [[29, 30]]));
  // in-window touch counts per conversion (hand-derived)
  const counts = runSql(db, `SELECT c.conversion_id, COUNT(t.touch_id)
    FROM conversions c
    LEFT JOIN touches t ON t.user_id = c.user_id
      AND t.touch_date >= date(c.conversion_date, '-29 days')
      AND t.touch_date <= c.conversion_date
    GROUP BY c.conversion_id ORDER BY c.conversion_id ASC`);
  ok("in-window touch counts === [3, 3, 1, 0, 2, 0] (hand-derived)",
    eq(counts, [[1, 3], [2, 3], [3, 1], [4, 0], [5, 2], [6, 0]]), JSON.stringify(counts));
  // LAST_VALUE default-frame facts on the same-day tie partition (conversion 5)
  const frame = runSql(db, `WITH paired AS (
      SELECT c.conversion_id, t.channel, t.touch_date, t.touch_id
      FROM conversions c LEFT JOIN touches t ON t.user_id = c.user_id
        AND t.touch_date >= date(c.conversion_date, '-29 days')
        AND t.touch_date <= c.conversion_date
      WHERE c.conversion_id = 5),
    w AS (SELECT touch_id, channel,
      LAST_VALUE(channel) OVER pw AS broken_last,
      LAST_VALUE(channel) OVER (pw ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS full_last
      FROM paired
      WINDOW pw AS (PARTITION BY conversion_id ORDER BY touch_date, touch_id))
    SELECT touch_id, broken_last, full_last FROM w ORDER BY touch_id ASC`);
  ok("frame probe: default-frame LAST_VALUE on row 1 reads the CURRENT row (Email); full frame reads Google on both rows",
    eq(frame, [[11, "Email", "Google"], [12, "Google", "Google"]]), JSON.stringify(frame));
  db.close();
}

console.log("\n=== email-engagement-funnel — raw rates + planted duplicate mirror ===");
{
  const d = SQL_DF_MKTG_A[2];
  const db = buildDb(d);
  ok("planted duplicate exists: (spring-sale, user 5, opened) appears twice",
    runSql(db, `SELECT COUNT(*) FROM email_events
      WHERE campaign = 'spring-sale' AND user_id = 5 AND event = 'opened'`)[0][0] === 2);
  ok("COUNT(DISTINCT) reads 6 openers where COUNT(*) reads 7 rows",
    eq(runSql(db, `SELECT COUNT(DISTINCT user_id), COUNT(*) FROM email_events
      WHERE campaign = 'spring-sale' AND event = 'opened'`), [[6, 7]]));
  ok("event-row census: spring-sale 29, newsletter-weekly 11, product-launch 18",
    eq(runSql(db, `SELECT campaign, COUNT(*) FROM email_events GROUP BY campaign ORDER BY campaign ASC`),
      [["newsletter-weekly", 11], ["product-launch", 18], ["spring-sale", 29]]));
  const raw = runSql(db, `SELECT 100.0 * 6 / 9, ROUND(100.0 * 6 / 9, 2),
      100.0 * 5 / 6, ROUND(100.0 * 5 / 6, 2), 100.0 * 3 / 6, 100.0 * 1 / 5,
      ROUND(100.0 * 3 / 9, 2), ROUND(100.0 * 1 / 6, 2),
      ROUND(100.0 * 7 / 9, 2), ROUND(100.0 * 3 / 7, 2)`);
  const ts = [100 * 6 / 9, 100 * 5 / 6];
  ok("raw open-rate mirrors within 1e-9 of TS (66.666..., 83.333...)",
    Math.abs((raw[0][0] as number) - ts[0]) < 1e-9 && Math.abs((raw[0][2] as number) - ts[1]) < 1e-9,
    JSON.stringify([raw[0][0], raw[0][2]]));
  ok("pinned ROUNDs: 66.67, 83.33, 50.0, 20.0, 33.33, 16.67, 77.78, 42.86",
    eq([raw[0][1], raw[0][3], raw[0][4], raw[0][5], raw[0][6], raw[0][7], raw[0][8], raw[0][9]],
      [66.67, 83.33, 50, 20, 33.33, 16.67, 77.78, 42.86]), JSON.stringify(raw[0]));
  ok("division by zero yields NULL, COALESCE stamps 0.0, delivered>0 division reads 0.0",
    eq(runSql(db, `SELECT ROUND(100.0 * 0 / 0, 2), COALESCE(ROUND(100.0 * 0 / 0, 2), 0.0), ROUND(100.0 * 0 / 3, 2)`),
      [[null, 0, 0]]));
  // conversion join fan-out the DISTINCT must survive
  const fan = runSql(db, `SELECT e.campaign, COUNT(*), COUNT(DISTINCT c.user_id)
    FROM email_events e LEFT JOIN email_conversions c ON c.campaign = e.campaign
    GROUP BY e.campaign ORDER BY e.campaign ASC`);
  ok("fan-out census: spring-sale 58 rows / 2 converters, product-launch 18 / 1, newsletter 11 / 0",
    eq(fan, [["newsletter-weekly", 11, 0], ["product-launch", 18, 1], ["spring-sale", 58, 2]]), JSON.stringify(fan));
  db.close();
}

/* ---------- planted-trap probes: the WRONG queries must produce the documented wrong outputs ---------- */
console.log("\n=== planted-trap probes ===");

// D1 traps (roas-by-campaign)
{
  const d = SQL_DF_MKTG_A[0];
  const db = buildDb(d);
  const COMBINED = (joinKind: "LEFT" | "INNER", coalesce: boolean) => `WITH spend AS (
      SELECT campaign, SUM(spend_cents) AS spend_cents FROM campaign_spend GROUP BY campaign),
    revenue AS (
      SELECT campaign, SUM(revenue_cents) AS revenue_cents FROM attributed_revenue GROUP BY campaign),
    combined AS (
      SELECT s.campaign, s.spend_cents,
        ${coalesce ? "COALESCE(r.revenue_cents, 0)" : "r.revenue_cents"} AS revenue_cents,
        ROUND(1.0 * ${coalesce ? "COALESCE(r.revenue_cents, 0)" : "r.revenue_cents"} / s.spend_cents, 2) AS roas
      FROM spend s ${joinKind} JOIN revenue r ON r.campaign = s.campaign)`;
  ok("D1 INNER JOIN drops podcast-sponsorships: 4 rows and no podcast row",
    eq(runSql(db, `${COMBINED("INNER", true)}
      SELECT campaign, spend_cents, revenue_cents, roas FROM combined ORDER BY campaign ASC`),
      [["display-retargeting", 25000, 38750, 1.55],
       ["search-brand", 30000, 132000, 4.4],
       ["social-ads", 32000, 72050, 2.25],
       ["video-ads", 40000, 90000, 2.25]]));
  ok("D1 ROW_NUMBER breaks the tie: rn reads 1, 2, 3, 4, 5 (video-ads 3 instead of sharing 2)",
    eq(runSql(db, `${COMBINED("LEFT", true)}
      SELECT campaign, ROW_NUMBER() OVER (ORDER BY roas DESC) AS rn FROM combined ORDER BY rn ASC, campaign ASC`),
      [["search-brand", 1], ["social-ads", 2], ["video-ads", 3], ["display-retargeting", 4], ["podcast-sponsorships", 5]]));
  ok("D1 integer division truncates every ratio: 4.0 / 2.0 / 2.0 / 1.0 / 0.0",
    eq(runSql(db, `WITH spend AS (
        SELECT campaign, SUM(spend_cents) AS spend_cents FROM campaign_spend GROUP BY campaign),
      revenue AS (
        SELECT campaign, SUM(revenue_cents) AS revenue_cents FROM attributed_revenue GROUP BY campaign),
      combined AS (
        SELECT s.campaign, COALESCE(r.revenue_cents, 0) AS revenue_cents, s.spend_cents
        FROM spend s LEFT JOIN revenue r ON r.campaign = s.campaign)
      SELECT campaign, ROUND(revenue_cents / spend_cents, 2) AS roas_wrong
      FROM combined ORDER BY campaign ASC`),
      [["display-retargeting", 1], ["podcast-sponsorships", 0], ["search-brand", 4],
       ["social-ads", 2], ["video-ads", 2]]));
  ok("D1 without COALESCE the zero-revenue campaign prints revenue NULL and roas NULL",
    eq(runSql(db, `${COMBINED("LEFT", false)}
      SELECT campaign, revenue_cents, roas FROM combined WHERE campaign = 'podcast-sponsorships'`),
      [["podcast-sponsorships", null, null]]));
  db.close();
}

// D2 traps (first-last-touch-attribution)
{
  const d = SQL_DF_MKTG_A[1];
  const db = buildDb(d);
  const PAIRED = (op: ">=" | ">", lower: string, userMatch: boolean) => `WITH paired AS (
      SELECT c.conversion_id, t.channel, t.touch_date, t.touch_id
      FROM conversions c
      LEFT JOIN touches t
        ON ${userMatch ? "t.user_id = c.user_id AND" : ""} t.touch_date ${op} ${lower}
       AND t.touch_date <= c.conversion_date)`;
  const ATTRIBUTED = `attributed AS (
        SELECT conversion_id,
          ROW_NUMBER() OVER w AS rn,
          FIRST_VALUE(channel) OVER w AS first_channel,
          LAST_VALUE(channel) OVER (w ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_channel
        FROM paired
        WINDOW w AS (PARTITION BY conversion_id ORDER BY touch_date, touch_id))`;
  const PICK = (filter: string) => `SELECT conversion_id, COALESCE(first_channel, 'none'), COALESCE(last_channel, 'none')
      FROM attributed WHERE rn = 1 ${filter} ORDER BY conversion_id ASC`;
  ok("D2 strict lower bound (> -29 days) erases the boundary touch: conversion 3 reads none / none",
    eq(runSql(db, `${PAIRED(">", "date(c.conversion_date, '-29 days')", true)},
      ${ATTRIBUTED}
      ${PICK("AND conversion_id = 3")}`),
      [[3, "none", "none"]]));
  ok("D2 30-day-back window revives the day -30 touch: conversion 4 reads Meta / Meta",
    eq(runSql(db, `${PAIRED(">=", "date(c.conversion_date, '-30 days')", true)},
      ${ATTRIBUTED}
      ${PICK("AND conversion_id = 4")}`),
      [[4, "Meta", "Meta"]]));
  ok("D2 missing user match cross-contaminates: conversion 6 reads Meta / Google, conversion 1 reads Email / Google",
    eq(runSql(db, `${PAIRED(">=", "date(c.conversion_date, '-29 days')", false)},
      ${ATTRIBUTED}
      ${PICK("AND conversion_id IN (1, 6)")}`),
      [[1, "Email", "Google"], [6, "Meta", "Google"]]));
  ok("D2 frameless LAST_VALUE + one-row-per-conversion pick of the EARLIEST row: c1 last Meta (not Google), c5 last Email (not Google)",
    eq(runSql(db, `${PAIRED(">=", "date(c.conversion_date, '-29 days')", true)},
      broken AS (
        SELECT conversion_id, touch_date, touch_id, channel,
          FIRST_VALUE(channel) OVER w AS first_channel,
          LAST_VALUE(channel) OVER w AS last_channel
        FROM paired
        WINDOW w AS (PARTITION BY conversion_id ORDER BY touch_date, touch_id)),
      ranked AS (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY conversion_id ORDER BY touch_date, touch_id) AS rn FROM broken)
      SELECT conversion_id, COALESCE(first_channel, 'none'), COALESCE(last_channel, 'none')
      FROM ranked WHERE rn = 1 ORDER BY conversion_id ASC`),
      [[1, "Meta", "Meta"], [2, "Google", "Google"], [3, "Email", "Email"],
       [4, "none", "none"], [5, "Email", "Email"], [6, "none", "none"]]));
  db.close();
}

// D3 traps (email-engagement-funnel)
{
  const d = SQL_DF_MKTG_A[2];
  const db = buildDb(d);
  const PER_CAMPAIGN = `WITH per_campaign AS (
      SELECT e.campaign,
        COUNT(DISTINCT CASE WHEN e.event = 'sent' THEN e.user_id END) AS sent,
        COUNT(DISTINCT CASE WHEN e.event = 'delivered' THEN e.user_id END) AS delivered,
        COUNT(DISTINCT CASE WHEN e.event = 'opened' THEN e.user_id END) AS opened,
        COUNT(DISTINCT CASE WHEN e.event = 'clicked' THEN e.user_id END) AS clicked,
        COUNT(DISTINCT c.user_id) AS converted
      FROM email_events e LEFT JOIN email_conversions c ON c.campaign = e.campaign
      GROUP BY e.campaign)`;
  ok("D3 open_pct against SENT: spring-sale reads 60.0 instead of 66.67 (product-launch agrees at 83.33, newsletter 0.0)",
    eq(runSql(db, `${PER_CAMPAIGN}
      SELECT campaign, ROUND(100.0 * opened / sent, 2) AS open_pct_wrong
      FROM per_campaign ORDER BY campaign ASC`),
      [["newsletter-weekly", 0], ["product-launch", 83.33], ["spring-sale", 60]]));
  ok("D3 click_pct against DELIVERED: spring-sale 33.33 (not 50.0), product-launch 16.67 (not 20.0)",
    eq(runSql(db, `${PER_CAMPAIGN}
      SELECT campaign, COALESCE(ROUND(100.0 * clicked / delivered, 2), 0.0) AS click_pct_wrong
      FROM per_campaign ORDER BY campaign ASC`),
      [["newsletter-weekly", 0], ["product-launch", 16.67], ["spring-sale", 33.33]]));
  ok("D3 COUNT(*) instead of COUNT(DISTINCT): spring-sale opened reads 7, open_pct 77.78, click_pct 42.86",
    eq(runSql(db, `SELECT campaign,
        COUNT(CASE WHEN event = 'sent' THEN user_id END) AS sent,
        COUNT(CASE WHEN event = 'delivered' THEN user_id END) AS delivered,
        COUNT(CASE WHEN event = 'opened' THEN user_id END) AS opened,
        COUNT(CASE WHEN event = 'clicked' THEN user_id END) AS clicked
      FROM email_events GROUP BY campaign ORDER BY campaign ASC`),
      [["newsletter-weekly", 8, 3, 0, 0], ["product-launch", 6, 6, 5, 1], ["spring-sale", 10, 9, 7, 3]]),
    );
  ok("D3 COUNT(*) rates drift too: 100.0 * 7 / 9 rounds to 77.78 and 100.0 * 3 / 7 to 42.86",
    eq(runSql(db, `SELECT ROUND(100.0 * 7 / 9, 2), ROUND(100.0 * 3 / 7, 2)`), [[77.78, 42.86]]));
  ok("D3 without the COALESCE guard newsletter-weekly's click_pct prints NULL, not 0.0",
    eq(runSql(db, `${PER_CAMPAIGN}
      SELECT campaign, ROUND(100.0 * clicked / opened, 2) AS click_pct_no_guard
      FROM per_campaign WHERE campaign = 'newsletter-weekly'`),
      [["newsletter-weekly", null]]));
  db.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log(`ALL CHECKS PASS ${SQL_DF_MKTG_A.length}/3`);
