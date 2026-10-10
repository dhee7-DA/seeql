// Task 77-e self-check — sql-df-wh-a.ts (3 Warehouse A dives with primers).
// bun scripts/tmp-77-e-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_WH_A } from "../src/lib/leetcode/content/sql-df-wh-a";
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
  columns: string[]; rows: unknown[][]; intColumns: string[];
  order: "exact" | "any";
}> = [
  { slug: "keep-latest-dedupe", id: 8061, difficulty: "Easy", xp: 10,
    columns: ["order_id", "status", "updated_at"],
    rows: [
      [101, "shipped", "2026-09-03 08:05:00"],
      [102, "shipped", "2026-09-02 11:30:00"],
      [103, "shipped", "2026-09-02 14:20:00"],
      [104, "cancelled", "2026-09-04 09:30:00"],
      [105, "placed", "2026-09-04 12:00:00"],
      [106, "delivered", "2026-09-05 17:25:00"],
    ],
    intColumns: ["order_id"], order: "exact" },
  { slug: "null-blank-audit", id: 8062, difficulty: "Easy", xp: 10,
    columns: ["total_rows", "null_emails", "blank_emails", "null_phone", "blank_phone", "null_city", "stale_rows", "pass"],
    rows: [[8, 1, 2, 1, 1, 1, 1, 0]],
    intColumns: ["total_rows", "null_emails", "blank_emails", "null_phone", "blank_phone", "null_city", "stale_rows", "pass"],
    order: "any" },
  { slug: "point-in-time-asof", id: 8063, difficulty: "Medium", xp: 20,
    columns: ["customer_id", "city_asof", "valid_from", "valid_to"],
    rows: [
      [201, "Porto", "2026-03-01", "9999-12-31"],
      [202, "Madrid", "2026-01-01", "2026-09-01"],
      [203, "Berlin", "2026-07-15", "9999-12-31"],
      [204, "Stuttgart", "2026-07-15", "9999-12-31"],
      [205, "Vienna", "2026-01-01", "9999-12-31"],
    ],
    intColumns: ["customer_id"], order: "exact" },
];
const XP: Record<string, number> = { Easy: 10, Medium: 20, Hard: 35 };

// related slugs may ONLY come from the Data & Finance track (registry rows).
const RELATED_POOL = new Set([
  "fx-exposure-report", "credit-utilization-bands", "duplicate-charge-pairs",
  "trial-balance-check", "gl-reconciliation", "journal-gap-detection",
  "ar-aging-schedule", "dividend-income-calendar", "daily-balance-interest",
]);
const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));

console.log(`\n=== sql-df-wh-a.ts — ${SQL_DF_WH_A.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_WH_A.length === 3 && SPEC.every((s, i) => SQL_DF_WH_A[i]?.slug === s.slug),
  SQL_DF_WH_A.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_WH_A[i];
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
  ok("constraints carry the PINNED lines", d.constraints.some((c) => c.startsWith("PINNED")));
  ok("exactly 3 breakdown paragraphs", d.breakdown.length === 3);
  d.breakdown.forEach((p, j) => {
    const c = sentenceCount(p);
    ok(`breakdown para ${j + 1} has 3-6 sentences (got ${c})`, c >= 3 && c <= 6);
  });
  ok("3-5 edges with pinned numbers", d.edges.length >= 3 && d.edges.length <= 5 && d.edges.every((e) => /\d/.test(e)),
    String(d.edges.length));
  d.edges.forEach((p, j) =>
    ok(`edge ${j + 1} has >= 1 full sentence (got ${sentenceCount(p)})`, sentenceCount(p) >= 1));
  ok("3 ladder rungs (title+body)", d.ladder.length === 3 && d.ladder.every((r) => r.title.trim() && r.body.trim()));
  d.ladder.forEach((r, j) =>
    ok(`ladder rung ${j + 1} body has >= 2 sentences (got ${sentenceCount(r.body)})`, sentenceCount(r.body) >= 2));
  ok("walkthrough: one paragraph per logical chunk (3)", d.walkthrough.length === 3);
  d.walkthrough.forEach((p, j) =>
    ok(`walkthrough para ${j + 1} has >= 3 sentences (got ${sentenceCount(p)})`, sentenceCount(p) >= 3));
  ok("exactly 2 followUps", d.followUps?.length === 2, String(d.followUps?.length));
  ok("exactly 3 related slugs", d.related?.length === 3, String(d.related?.length));
  d.related?.forEach((r) => {
    ok(`related slug from the DF-track pool: ${r}`, RELATED_POOL.has(r));
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
    ok("primer where is nonempty and names companies", p.where.trim().length > 0);
  }

  // hygiene: backticks / ${ / platform mention / e.g.-i.e. in any dive string (primer included)
  const strs = allStrings(d);
  ok("no backticks in any string", strs.every((s) => !s.includes("`")));
  ok("no ${ in any string", strs.every((s) => !s.includes("${")));
  ok("no platform mention in any string",
    strs.every((s) => !/leetcode|hackerrank|datalemur|stratascratch/i.test(s)));
  ok('no "e.g."/"i.e." in prose',
    proseStrings(d).every((s) => !/\be\.g\.|\bi\.e\./i.test(s)));

  // MONEY convention: this family is money-free — no _cents columns and no REAL
  // declarations may appear in the DDL (REAL is reserved for rates/pcts).
  const ddlMoney = (d.schema.ddl.match(/^\s*(\w+_cents|\w+_minor)\s+(\w+)/gim) ?? []);
  ok("family is money-free: no _cents DDL columns", ddlMoney.length === 0, JSON.stringify(ddlMoney));
  ok("no REAL declarations in DDL (counts and labels only)", !/\bREAL\b/i.test(d.schema.ddl));
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

/* ---------- per-dive hand verification: TS mirrors ---------- */

console.log("\n=== keep-latest-dedupe — TS mirror of the lexicographic latest ===");
{
  const d = SQL_DF_WH_A[0];
  const db = buildDb(d);
  const all = runSql(db, `SELECT event_id, order_id, status, updated_at FROM status_feed`);
  ok("seed holds 13 events", all.length === 13, String(all.length));
  // TS mirror: per order, pick the max (updated_at, event_id) pair
  const perOrder = new Map<number, { ev: number; st: string; ts: string }>();
  for (const [ev, oid, st, ts] of all as Array<[number, number, string, string]>) {
    const cur = perOrder.get(oid);
    if (!cur || ts > cur.ts || (ts === cur.ts && ev > cur.ev)) perOrder.set(oid, { ev, st, ts });
  }
  const tsRows = [...perOrder.entries()].sort((a, b) => a[0] - b[0]).map(([oid, v]) => [oid, v.st, v.ts]);
  ok("TS mirror event counts per order 101..106 === 3,3,2,2,1,2",
    eq([101, 102, 103, 104, 105, 106].map((o) => (all as unknown[][]).filter((r) => r[1] === o).length), [3, 3, 2, 2, 1, 2]));
  const eng = runSql(db, d.code);
  ok(`TS mirror of latest-per-order matches the engine (${JSON.stringify(tsRows)})`, eq(tsRows, eng));
  ok("mirror pins the tie order 102 -> shipped (event 4)", tsRows[1][1] === "shipped" && tsRows[1][2] === "2026-09-02 11:30:00");
  db.close();
}

console.log("\n=== null-blank-audit — TS mirror of the bucket counts ===");
{
  const d = SQL_DF_WH_A[1];
  const db = buildDb(d);
  const all = runSql(db, `SELECT email, phone, city, updated_at FROM customers_raw`);
  ok("seed holds 8 rows", all.length === 8, String(all.length));
  let nullE = 0, blankE = 0, nullP = 0, blankP = 0, nullC = 0, stale = 0;
  for (const [e, ph, c, u] of all as Array<[string | null, string | null, string | null, string]>) {
    if (e === null) nullE++;
    else if (e.trim() === "") blankE++;
    if (ph === null) nullP++;
    else if (ph.trim() === "") blankP++;
    if (c === null) nullC++;
    if (u < "2026-09-01") stale++;
  }
  const eng = runSql(db, d.code)[0];
  ok("TS mirror counts === engine row", eq(eng, [8, nullE, blankE, nullP, blankP, nullC, stale, 0]),
    JSON.stringify(eng));
  ok("mirror pins 1/2/1/1/1/1", nullE === 1 && blankE === 2 && nullP === 1 && blankP === 1 && nullC === 1 && stale === 1);
  db.close();
}

console.log("\n=== point-in-time-asof — TS mirror of the half-open read ===");
{
  const d = SQL_DF_WH_A[2];
  const db = buildDb(d);
  const all = runSql(db, `SELECT customer_id, city, valid_from, valid_to FROM dim_customers`);
  ok("dimension holds 8 version rows", all.length === 8, String(all.length));
  const ASOF = "2026-07-15";
  // TS mirror: per customer, the version with valid_from <= ASOF < valid_to
  const pick = new Map<number, [string, string, string]>();
  for (const [cid, city, vf, vt] of all as Array<[number, string, string, string]>) {
    if (vf <= ASOF && ASOF < vt) pick.set(cid, [city, vf, vt]);
  }
  const tsRows = [...pick.entries()].sort((a, b) => a[0] - b[0]).map(([cid, v]) => [cid, ...v]);
  ok("TS mirror matches exactly one version per customer (5 rows)", tsRows.length === 5, JSON.stringify(tsRows));
  const eng = runSql(db, d.code);
  ok(`TS mirror of the as-of read matches the engine (${JSON.stringify(tsRows)})`, eq(tsRows, eng));
  ok("mirror pins the decoy 202 -> Madrid (not Barcelona)", tsRows[1][1] === "Madrid");
  db.close();
}

/* ---------- planted-trap probes: the WRONG queries must produce the documented wrong outputs ---------- */
console.log("\n=== planted-trap probes ===");

// D1 traps
{
  const d = SQL_DF_WH_A[0];
  const db = buildDb(d);
  ok("D1 bare-column GROUP BY quirk pairs order 102 with paid (engine-verified tie behavior)",
    eq(runSql(db, `SELECT order_id, status, MAX(updated_at) FROM status_feed GROUP BY order_id ORDER BY order_id`),
      [[101, "shipped", "2026-09-03 08:05:00"], [102, "paid", "2026-09-02 11:30:00"], [103, "shipped", "2026-09-02 14:20:00"],
       [104, "cancelled", "2026-09-04 09:30:00"], [105, "placed", "2026-09-04 12:00:00"], [106, "delivered", "2026-09-05 17:25:00"]]));
  ok("D1 adding a second aggregate voids the lone-MAX special case — 102 still pairs paid",
    eq(runSql(db, `SELECT order_id, status, COUNT(*), MAX(updated_at) FROM status_feed GROUP BY order_id ORDER BY order_id`),
      [[101, "shipped", 3, "2026-09-03 08:05:00"], [102, "paid", 3, "2026-09-02 11:30:00"], [103, "shipped", 2, "2026-09-02 14:20:00"],
       [104, "cancelled", 2, "2026-09-04 09:30:00"], [105, "placed", 1, "2026-09-04 12:00:00"], [106, "delivered", 2, "2026-09-05 17:25:00"]]));
  ok("D1 tie broken by the LOWER event_id flips 102 to paid (event 3)",
    eq(runSql(db, `WITH ranked AS (
        SELECT order_id, status, updated_at,
          ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY updated_at DESC, event_id ASC) AS rn
        FROM status_feed)
      SELECT order_id, status, updated_at FROM ranked WHERE rn = 1 ORDER BY order_id ASC`),
      [[101, "shipped", "2026-09-03 08:05:00"], [102, "paid", "2026-09-02 11:30:00"], [103, "shipped", "2026-09-02 14:20:00"],
       [104, "cancelled", "2026-09-04 09:30:00"], [105, "placed", "2026-09-04 12:00:00"], [106, "delivered", "2026-09-05 17:25:00"]]));
  ok("D1 ranking by event_id DESC flips 102 AND 103 to their backfilled placed rows",
    eq(runSql(db, `WITH ranked AS (
        SELECT order_id, status, updated_at,
          ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY event_id DESC) AS rn
        FROM status_feed)
      SELECT order_id, status, updated_at FROM ranked WHERE rn = 1 ORDER BY order_id ASC`),
      [[101, "shipped", "2026-09-03 08:05:00"], [102, "placed", "2026-09-01 16:45:00"], [103, "placed", "2026-09-01 09:00:00"],
       [104, "cancelled", "2026-09-04 09:30:00"], [105, "placed", "2026-09-04 12:00:00"], [106, "delivered", "2026-09-05 17:25:00"]]));
  ok("D1 ascending sort ships every order's EARLIEST event (5 of 6 wrong)",
    eq(runSql(db, `WITH ranked AS (
        SELECT order_id, status, updated_at,
          ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY updated_at ASC, event_id ASC) AS rn
        FROM status_feed)
      SELECT order_id, status, updated_at FROM ranked WHERE rn = 1 ORDER BY order_id ASC`),
      [[101, "placed", "2026-09-02 09:15:00"], [102, "placed", "2026-09-01 16:45:00"], [103, "placed", "2026-09-01 09:00:00"],
       [104, "placed", "2026-09-03 10:10:00"], [105, "placed", "2026-09-04 12:00:00"], [106, "paid", "2026-09-05 09:00:00"]]));
  db.close();
}

// D2 traps
{
  const d = SQL_DF_WH_A[1];
  const db = buildDb(d);
  ok("D2 counting NULL as blank reads blank_emails 3 and blank_phone 2 (double-count)",
    eq(runSql(db, `SELECT
        SUM(CASE WHEN COALESCE(TRIM(email), '') = '' THEN 1 ELSE 0 END),
        SUM(CASE WHEN COALESCE(TRIM(phone), '') = '' THEN 1 ELSE 0 END)
      FROM customers_raw`), [[3, 2]]));
  ok("D2 forgetting TRIM (plain = '') reads blank_emails 1 and blank_phone 0",
    eq(runSql(db, `SELECT
        SUM(CASE WHEN email = '' THEN 1 ELSE 0 END),
        SUM(CASE WHEN phone = '' THEN 1 ELSE 0 END)
      FROM customers_raw`), [[1, 0]]));
  ok("D2 <= instead of < reads stale_rows 2 (boundary row 8 swallowed)",
    eq(runSql(db, `SELECT SUM(CASE WHEN updated_at <= '2026-09-01' THEN 1 ELSE 0 END) FROM customers_raw`), [[2]]));
  ok("D2 TRIM without COALESCE HAPPENS TO AGREE on this seed (2 and 1) — guard still load-bearing for the COALESCE variant",
    eq(runSql(db, `SELECT
        SUM(CASE WHEN TRIM(email) = '' THEN 1 ELSE 0 END),
        SUM(CASE WHEN TRIM(phone) = '' THEN 1 ELSE 0 END)
      FROM customers_raw`), [[2, 1]]));
  db.run(`DELETE FROM customers_raw WHERE customer_id BETWEEN 2 AND 7`);
  ok("D2 positive control: the two clean rows alone pass the gate (2,0,0,0,0,0,0,1)",
    eq(runSql(db, d.code), [[2, 0, 0, 0, 0, 0, 0, 1]]));
  db.close();
}

// D3 traps
{
  const d = SQL_DF_WH_A[2];
  const db = buildDb(d);
  ok("D3 BETWEEN double-picks the seam: 6 rows, Munich returns beside Stuttgart",
    eq(runSql(db, `SELECT customer_id, city AS city_asof, valid_from, valid_to FROM dim_customers
        WHERE '2026-07-15' BETWEEN valid_from AND valid_to ORDER BY customer_id, valid_from`),
      [[201, "Porto", "2026-03-01", "9999-12-31"], [202, "Madrid", "2026-01-01", "2026-09-01"],
       [203, "Berlin", "2026-07-15", "9999-12-31"], [204, "Munich", "2026-02-01", "2026-07-15"],
       [204, "Stuttgart", "2026-07-15", "9999-12-31"], [205, "Vienna", "2026-01-01", "9999-12-31"]]));
  ok("D3 is_current = 1 reads TODAY: 202 flips to Barcelona",
    eq(runSql(db, `SELECT customer_id, city AS city_asof, valid_from, valid_to FROM dim_customers
        WHERE is_current = 1 ORDER BY customer_id`),
      [[201, "Porto", "2026-03-01", "9999-12-31"], [202, "Barcelona", "2026-09-01", "9999-12-31"],
       [203, "Berlin", "2026-07-15", "9999-12-31"], [204, "Stuttgart", "2026-07-15", "9999-12-31"],
       [205, "Vienna", "2026-01-01", "9999-12-31"]]));
  ok("D3 matching by customer_id alone ships every version: 8 rows",
    eq(runSql(db, `SELECT COUNT(*) FROM dim_customers`), [[8]]));
  db.close();

  // NULL-sentinel world: common alternative convention breaks the same predicate
  const db2 = new Database(":memory:");
  db2.run(`CREATE TABLE dim_n (customer_id INTEGER NOT NULL, city TEXT NOT NULL,
    valid_from TEXT NOT NULL, valid_to TEXT, PRIMARY KEY (customer_id, valid_from));`);
  db2.run(`INSERT INTO dim_n (customer_id, city, valid_from, valid_to) VALUES
    (201, 'Lisbon',    '2026-01-01', '2026-03-01'),
    (201, 'Porto',     '2026-03-01', NULL),
    (202, 'Madrid',    '2026-01-01', '2026-09-01'),
    (202, 'Barcelona', '2026-09-01', NULL),
    (203, 'Berlin',    '2026-07-15', NULL),
    (204, 'Munich',    '2026-02-01', '2026-07-15'),
    (204, 'Stuttgart', '2026-07-15', NULL),
    (205, 'Vienna',    '2026-01-01', NULL);`);
  ok("D3 NULL-sentinel world + valid_to > as-of loses every current row: only 202 Madrid survives (1 row)",
    eq(runSql(db2, `SELECT customer_id, city AS city_asof, valid_from, valid_to FROM dim_n
        WHERE valid_from <= '2026-07-15' AND valid_to > '2026-07-15' ORDER BY customer_id`),
      [[202, "Madrid", "2026-01-01", "2026-09-01"]]));
  db2.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log(`ALL CHECKS PASS ${SQL_DF_WH_A.length}/3`);
