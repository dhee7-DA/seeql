// Task 77-a self-check — sql-df-saas-a.ts (3 SaaS A dives with primers).
// bun scripts/tmp-77-a-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_SAAS_A } from "../src/lib/leetcode/content/sql-df-saas-a";
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
// Pinned output contracts (hand-derived, engine-confirmed in the scratch run).
const SPEC: Array<{
  slug: string; id: number; difficulty: "Easy" | "Medium" | "Hard"; xp: number;
  columns: string[]; rows: unknown[][]; realColumns: string[]; intColumns: string[];
  moneyDdlColumns: number;
  order: "exact" | "any";
}> = [
  { slug: "trial-to-paid-funnel", id: 8049, difficulty: "Easy", xp: 10,
    columns: ["week", "trials", "activated", "converted", "activation_pct", "conversion_pct"],
    rows: [
      ["2026-08-03", 6, 3, 3, 50, 50],
      ["2026-08-10", 6, 4, 3, 66.67, 50],
      ["2026-08-17", 7, 6, 0, 85.71, 0],
      ["2026-08-24", 7, 4, 2, 57.14, 28.57],
    ],
    realColumns: ["activation_pct", "conversion_pct"], intColumns: ["trials", "activated", "converted"],
    moneyDdlColumns: 0, order: "exact" },
  { slug: "plan-migration-paths", id: 8050, difficulty: "Medium", xp: 20,
    columns: ["customer_id", "prev_month", "month", "from_plan", "to_plan", "direction"],
    rows: [
      [1, "2026-04", "2026-05", "starter", "pro", "upgrade"],
      [1, "2026-06", "2026-07", "pro", "business", "upgrade"],
      [2, "2026-04", "2026-05", "business", "starter", "downgrade"],
      [3, "2026-05", "2026-06", "pro", "team", "lateral"],
      [4, "2026-03", "2026-04", "team", "business", "upgrade"],
      [4, "2026-04", "2026-05", "business", "team", "downgrade"],
      [6, "2026-03", "2026-05", "pro", "starter", "downgrade"],
    ],
    realColumns: [], intColumns: ["customer_id"],
    moneyDdlColumns: 0, order: "exact" },
  { slug: "mrr-waterfall", id: 8051, difficulty: "Hard", xp: 35,
    columns: ["month", "new_mrr", "expansion_mrr", "contraction_mrr", "churned_mrr", "ending_mrr"],
    rows: [
      ["2026-04", 23500, 0, 0, 0, 23500],
      ["2026-05", 4000, 1600, 800, 3000, 25300],
      ["2026-06", 3200, 2500, 600, 2600, 27800],
      ["2026-07", 2400, 300, 400, 2500, 27600],
      ["2026-08", 2200, 500, 200, 5300, 24800],
      ["2026-09", 1300, 200, 200, 3200, 22900],
    ],
    realColumns: [], intColumns: ["new_mrr", "expansion_mrr", "contraction_mrr", "churned_mrr", "ending_mrr"],
    moneyDdlColumns: 1, order: "exact" },
];
const XP: Record<string, number> = { Easy: 10, Medium: 20, Hard: 35 };

// related slugs may ONLY come from the Data & Finance track (registry 8xxx rows).
const DF_SLUGS = new Set(
  LC_ALL.filter((p) => (p.lists ?? []).some((l) => l.includes("Data & Finance")) || p.topics.some((t) => t.includes("Data & Finance")))
    .map((p) => p.slug)
);
const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));

console.log(`\n=== sql-df-saas-a.ts — ${SQL_DF_SAAS_A.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_SAAS_A.length === 3 && SPEC.every((s, i) => SQL_DF_SAAS_A[i]?.slug === s.slug),
  SQL_DF_SAAS_A.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_SAAS_A[i];
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
  ok("constraints carry PINNED lines", d.constraints.some((c) => c.includes("PINNED")));
  ok("exactly 3 breakdown paragraphs", d.breakdown.length === 3);
  d.breakdown.forEach((p, j) => {
    const c = sentenceCount(p);
    ok(`breakdown para ${j + 1} has 3-6 sentences (got ${c})`, c >= 3 && c <= 6);
  });
  ok("4 edges", d.edges.length === 4, String(d.edges.length));
  ok("edges carry pinned probe numbers", d.edges.every((e) => /\d/.test(e)));
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
    ok(`related slug from the Data & Finance track: ${r}`, DF_SLUGS.has(r));
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
    ok("primer where names the registry companies", /Slack|Zoom|Atlassian|Notion|Stripe|Salesforce/.test(p.where));
  }

  // hygiene: backticks / ${ / platform mention / e.g.-i.e. / emojis in any dive string
  const strs = allStrings(d);
  ok("no backticks in any string", strs.every((s) => !s.includes("`")));
  ok("no ${ in any string", strs.every((s) => !s.includes("${")));
  ok("no platform mention in any string",
    strs.every((s) => !/leetcode|hackerrank|datalemur|stratascratch/i.test(s)));
  ok('no "e.g."/"i.e." in prose (sentence heuristic safety)',
    proseStrings(d).every((s) => !/\be\.g\.|\bi\.e\./i.test(s)));
  ok("no emojis in any string",
    strs.every((s) => !/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u.test(s)));

  // MONEY convention: *_cents DDL columns must be INTEGER; REAL is reserved
  // for rates/pcts (dive 1 only).
  const ddlMoney = (d.schema.ddl.match(/^\s*(\w+_cents|\w+_minor)\s+(\w+)/gim) ?? [])
    .map((m) => m.trim().split(/\s+/));
  ok(`all *_cents/_minor DDL columns are INTEGER (expected ${spec.moneyDdlColumns}, got ${ddlMoney.length})`,
    ddlMoney.length === spec.moneyDdlColumns && ddlMoney.every((part) => part[1] === "INTEGER"),
    JSON.stringify(ddlMoney));
  ok("no julianday anywhere (dates are plain labels)",
    !/julianday/i.test(d.code) && !/julianday/i.test(d.schema.seed));

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

console.log("\n=== trial-to-paid-funnel — TS mirror of the weekly percentages ===");
{
  const d = SQL_DF_SAAS_A[0];
  const db = buildDb(d);
  // TS mirror of the seed semantics: [trials, activatedInWindow, converted] per week
  const weeks: Array<[number, number, number]> = [[6, 3, 3], [6, 4, 3], [7, 6, 0], [7, 4, 2]];
  const raw = runSql(db, `WITH weeks AS (
      SELECT s.user_id,
        strftime('%Y-%m-%d', s.signup_date, '-6 days', 'weekday 1') AS week,
        EXISTS (SELECT 1 FROM activations a WHERE a.user_id = s.user_id
                  AND a.activated_date >= s.signup_date
                  AND a.activated_date <= date(s.signup_date, '+14 days')) AS did_activate,
        CASE WHEN s.converted_date IS NOT NULL THEN 1 ELSE 0 END AS did_convert
      FROM signups s)
    SELECT week, COUNT(*), SUM(did_activate), SUM(did_convert),
      100.0 * SUM(did_activate) / COUNT(*), 100.0 * SUM(did_convert) / COUNT(*)
    FROM weeks GROUP BY week ORDER BY week ASC`);
  ok("raw query returns the 4 week rows", raw.length === 4, String(raw.length));
  raw.forEach((row, i) => {
    const [trials, act, conv] = weeks[i];
    ok(`W${i + 1} counts ${trials}/${act}/${conv}`, row[1] === trials && row[2] === act && row[3] === conv,
      JSON.stringify(row.slice(1, 4)));
    ok(`W${i + 1} activation raw within 1e-9 of TS mirror (${100.0 * act / trials})`,
      Math.abs((row[4] as number) - 100.0 * act / trials) < 1e-9, String(row[4]));
    ok(`W${i + 1} conversion raw within 1e-9 of TS mirror (${100.0 * conv / trials})`,
      Math.abs((row[5] as number) - 100.0 * conv / trials) < 1e-9, String(row[5]));
  });
  ok("hand pins: 66.666... rounds to 66.67; 85.714... to 85.71; 28.571... to 28.57",
    Math.round((100.0 * 4 / 6) * 100) / 100 === 66.67 &&
    Math.round((100.0 * 6 / 7) * 100) / 100 === 85.71 &&
    Math.round((100.0 * 2 / 7) * 100) / 100 === 28.57,
    [100.0 * 4 / 6, 100.0 * 6 / 7, 100.0 * 2 / 7].join(" | "));
  ok("window wall: user 106 activation 2026-08-25 > 2026-08-08 + 14 days (2026-08-22)",
    (runSql(db, `SELECT date('2026-08-08', '+14 days')`)[0][0]) === "2026-08-22");
  db.close();
}

console.log("\n=== plan-migration-paths — TS mirror of pair counts ===");
{
  const d = SQL_DF_SAAS_A[1];
  const db = buildDb(d);
  const counts = runSql(db, `SELECT
      (SELECT COUNT(*) FROM subscriptions) AS rows_total,
      (SELECT COUNT(*) FROM (
        SELECT customer_id, LAG(plan) OVER (PARTITION BY customer_id ORDER BY month) AS pp
        FROM subscriptions) WHERE pp IS NOT NULL) AS pairs_total,
      (SELECT COUNT(*) FROM (
        SELECT LAG(plan) OVER (PARTITION BY customer_id ORDER BY month) AS pp, plan
        FROM subscriptions) WHERE pp IS NOT NULL AND pp <> plan) AS changes_total`)[0];
  ok("25 subscription rows -> 19 adjacent-active pairs -> 7 changes",
    counts[0] === 25 && counts[1] === 19 && counts[2] === 7, JSON.stringify(counts));
  ok("rank facts: starter 1 < pro 2 = team 2 < business 3 < enterprise 4",
    eq(runSql(db, `SELECT tier_rank FROM plans ORDER BY tier_rank, plan ASC`), [[1], [2], [2], [3], [4]]));
  db.close();
}

console.log("\n=== mrr-waterfall — TS mirror of the waterfall identity ===");
{
  const d = SQL_DF_SAAS_A[2];
  const db = buildDb(d);
  const rows = runSql(db, d.code.replace(/;\s*$/, ""));
  let prevEnding = 0;
  rows.forEach((row, i) => {
    const [month, nw, exp, con, ch, ending] = row as [string, number, number, number, number, number];
    ok(`${month} identity: prior ${prevEnding} + ${nw} + ${exp} - ${con} - ${ch} === ${ending}`,
      prevEnding + nw + exp - con - ch === ending, JSON.stringify(row));
    prevEnding = ending;
  });
  ok("hand pins: April new 23500 / August churn 5300 / September ending 22900",
    rows[0][1] === 23500 && rows[4][4] === 5300 && rows[5][5] === 22900, JSON.stringify(rows));
  db.close();
}

/* ---------- planted-trap probes: the WRONG queries must produce the documented wrong outputs ---------- */
console.log("\n=== planted-trap probes ===");

// D1 traps
{
  const d = SQL_DF_SAAS_A[0];
  const db = buildDb(d);
  const WEEKS = `WITH weeks AS (
      SELECT s.user_id,
        strftime('%Y-%m-%d', s.signup_date, '-6 days', 'weekday 1') AS week,
        EXISTS (SELECT 1 FROM activations a WHERE a.user_id = s.user_id
                  AND a.activated_date >= s.signup_date
                  AND a.activated_date <= date(s.signup_date, '+14 days')) AS did_activate,
        CASE WHEN s.converted_date IS NOT NULL THEN 1 ELSE 0 END AS did_convert
      FROM signups s)`;
  ok("D1 no 14-day guard: week 2026-08-03 leaks to activated 4, pct 66.67 (others untouched)",
    eq(runSql(db, `WITH weeks AS (
        SELECT s.user_id,
          strftime('%Y-%m-%d', s.signup_date, '-6 days', 'weekday 1') AS week,
          EXISTS (SELECT 1 FROM activations a WHERE a.user_id = s.user_id) AS did_activate
        FROM signups s)
      SELECT week, COUNT(*), SUM(did_activate), ROUND(100.0 * SUM(did_activate) / COUNT(*), 2)
      FROM weeks GROUP BY week ORDER BY week ASC`),
      [["2026-08-03", 6, 4, 66.67], ["2026-08-10", 6, 4, 66.67], ["2026-08-17", 7, 6, 85.71], ["2026-08-24", 7, 4, 57.14]]));
  ok("D1 conversion over ACTIVATED instead of trials: 100 / 75 / 0 / 50",
    eq(runSql(db, `${WEEKS}
      SELECT week, ROUND(100.0 * SUM(did_convert) / SUM(did_activate), 2)
      FROM weeks GROUP BY week ORDER BY week ASC`),
      [["2026-08-03", 100], ["2026-08-10", 75], ["2026-08-17", 0], ["2026-08-24", 50]]));
  ok("D1 INNER JOIN collapses trials to activated: 2026-08-17 reads 6 trials at 100.0",
    eq(runSql(db, `WITH weeks AS (
        SELECT s.user_id,
          strftime('%Y-%m-%d', s.signup_date, '-6 days', 'weekday 1') AS week
        FROM signups s
        JOIN activations a ON a.user_id = s.user_id
          AND a.activated_date >= s.signup_date
          AND a.activated_date <= date(s.signup_date, '+14 days'))
      SELECT week, COUNT(*), ROUND(100.0, 2)
      FROM weeks GROUP BY week ORDER BY week ASC`),
      [["2026-08-03", 3, 100], ["2026-08-10", 4, 100], ["2026-08-17", 6, 100], ["2026-08-24", 4, 100]]));
  ok("D1 'weekday 1' without '-6 days': 5 rows, 2026-08-03 holds 1, phantom 2026-08-31 holds 6",
    eq(runSql(db, `WITH weeks AS (
        SELECT s.user_id,
          strftime('%Y-%m-%d', s.signup_date, 'weekday 1') AS week
        FROM signups s)
      SELECT week, COUNT(*) FROM weeks GROUP BY week ORDER BY week ASC`),
      [["2026-08-03", 1], ["2026-08-10", 6], ["2026-08-17", 6], ["2026-08-24", 7], ["2026-08-31", 6]]));
  db.close();
}

// D2 traps
{
  const d = SQL_DF_SAAS_A[1];
  const db = buildDb(d);
  const PAIRS = `WITH pairs AS (
      SELECT s.customer_id,
        LAG(s.month) OVER (PARTITION BY s.customer_id ORDER BY s.month) AS prev_month,
        s.month,
        LAG(s.plan) OVER (PARTITION BY s.customer_id ORDER BY s.month) AS prev_plan,
        s.plan
      FROM subscriptions s)`;
  ok("D2 alphabetical direction inverts labels: row 1 reads downgrade, row 4 (lateral) reads upgrade",
    eq(runSql(db, `${PAIRS}
      SELECT p.customer_id, p.prev_month, p.month, p.prev_plan, p.plan,
        CASE WHEN p.plan > p.prev_plan THEN 'upgrade'
             WHEN p.plan < p.prev_plan THEN 'downgrade'
             ELSE 'lateral' END AS direction
      FROM pairs p
      WHERE p.prev_plan IS NOT NULL AND p.prev_plan <> p.plan
      ORDER BY p.customer_id ASC, p.month ASC`),
      [
        [1, "2026-04", "2026-05", "starter", "pro", "downgrade"],
        [1, "2026-06", "2026-07", "pro", "business", "downgrade"],
        [2, "2026-04", "2026-05", "business", "starter", "upgrade"],
        [3, "2026-05", "2026-06", "pro", "team", "upgrade"],
        [4, "2026-03", "2026-04", "team", "business", "downgrade"],
        [4, "2026-04", "2026-05", "business", "team", "upgrade"],
        [6, "2026-03", "2026-05", "pro", "starter", "upgrade"],
      ]));
  ok("D2 rank-change-only filter drops the lateral: 6 rows, no pro->team",
    eq(runSql(db, `${PAIRS},
      ranked AS (SELECT p.*, pf.tier_rank AS fr, pt.tier_rank AS tr
        FROM pairs p
        JOIN plans pf ON pf.plan = p.prev_plan
        JOIN plans pt ON pt.plan = p.plan
        WHERE p.prev_plan IS NOT NULL AND p.prev_plan <> p.plan AND pf.tier_rank <> pt.tier_rank)
      SELECT COUNT(*) FROM ranked`),
      [[6]]));
  ok("D2 no same-plan filter: 19 rows instead of 7",
    eq(runSql(db, `${PAIRS}
      SELECT COUNT(*) FROM pairs p
      WHERE p.prev_plan IS NOT NULL`),
      [[19]]));
  ok("D2 consecutive-calendar-months requirement drops the cross-gap pair: 6 rows",
    eq(runSql(db, `${PAIRS}
      SELECT COUNT(*) FROM pairs p
      WHERE p.prev_plan IS NOT NULL AND p.prev_plan <> p.plan
        AND CAST(substr(p.month, 1, 4) AS INTEGER) * 12 + CAST(substr(p.month, 6, 2) AS INTEGER)
          = CAST(substr(p.prev_month, 1, 4) AS INTEGER) * 12 + CAST(substr(p.prev_month, 6, 2) AS INTEGER) + 1`),
      [[6]]));
  db.close();
}

// D3 traps
{
  const d = SQL_DF_SAAS_A[2];
  const db = buildDb(d);
  const SPINE = `WITH months AS (SELECT DISTINCT month FROM mrr_snapshots),
    customers AS (SELECT DISTINCT customer_id FROM mrr_snapshots),
    grid AS (SELECT c.customer_id, m.month, s.mrr_cents
      FROM customers c CROSS JOIN months m
      LEFT JOIN mrr_snapshots s ON s.customer_id = c.customer_id AND s.month = m.month),
    moves AS (SELECT customer_id, month, mrr_cents,
      LAG(mrr_cents) OVER (PARTITION BY customer_id ORDER BY month) AS prev_mrr FROM grid)`;
  ok("D3 churned as 0: May reads churned_mrr 0 instead of 3000",
    eq(runSql(db, `${SPINE}
      SELECT month, 0 AS churned_mrr FROM moves GROUP BY month ORDER BY month ASC`),
      [["2026-04", 0], ["2026-05", 0], ["2026-06", 0], ["2026-07", 0], ["2026-08", 0], ["2026-09", 0]]));
  ok("D3 expansion swallowing new (COALESCE prior to 0): April 23500, May 5600 instead of 0 / 1600",
    eq(runSql(db, `${SPINE}
      SELECT month,
        COALESCE(SUM(CASE WHEN mrr_cents > COALESCE(prev_mrr, 0)
                          THEN mrr_cents - COALESCE(prev_mrr, 0) END), 0) AS expansion_mrr
      FROM moves GROUP BY month ORDER BY month ASC`),
      [["2026-04", 23500], ["2026-05", 5600], ["2026-06", 5700], ["2026-07", 2700], ["2026-08", 2700], ["2026-09", 1500]]));
  ok("D3 ending as running total: May 48800 instead of 25300, June 76600 instead of 27800",
    eq(runSql(db, `${SPINE},
      per_month AS (SELECT month, COALESCE(SUM(mrr_cents), 0) AS ending FROM moves GROUP BY month)
      SELECT month, SUM(ending) OVER (ORDER BY month) AS running_ending
      FROM per_month ORDER BY month ASC`),
      [["2026-04", 23500], ["2026-05", 48800], ["2026-06", 76600], ["2026-07", 104200], ["2026-08", 129000], ["2026-09", 151900]]));
  ok("D3 raw LAG without the spine: June reads (0, 2700, 600, 0) instead of (3200, 2500, 600, 2600)",
    eq(runSql(db, `WITH moves AS (
        SELECT customer_id, month, mrr_cents,
          LAG(mrr_cents) OVER (PARTITION BY customer_id ORDER BY month) AS prev_mrr
        FROM mrr_snapshots)
      SELECT month,
        COALESCE(SUM(CASE WHEN prev_mrr IS NULL THEN mrr_cents END), 0) AS new_mrr,
        COALESCE(SUM(CASE WHEN prev_mrr IS NOT NULL AND mrr_cents > prev_mrr
                          THEN mrr_cents - prev_mrr END), 0) AS expansion_mrr,
        COALESCE(SUM(CASE WHEN prev_mrr IS NOT NULL AND mrr_cents < prev_mrr
                          THEN prev_mrr - mrr_cents END), 0) AS contraction_mrr,
        0 AS churned_mrr,
        COALESCE(SUM(mrr_cents), 0) AS ending_mrr
      FROM moves GROUP BY month ORDER BY month ASC`),
      [
        ["2026-04", 23500, 0, 0, 0, 23500],
        ["2026-05", 4000, 1600, 800, 0, 25300],
        ["2026-06", 0, 2700, 600, 0, 27800],
        ["2026-07", 0, 300, 600, 0, 27600],
        ["2026-08", 0, 500, 500, 0, 24800],
        ["2026-09", 0, 200, 400, 0, 22900],
      ]));
  db.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log(`ALL CHECKS PASS ${SQL_DF_SAAS_A.length}/3`);
