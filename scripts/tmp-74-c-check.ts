// Task 74-c self-check — sql-df-fraud-a.ts (3 fraud/AML dives, batch 3, with primers).
// bun scripts/tmp-74-c-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_FRAUD_A } from "../src/lib/leetcode/content/sql-df-fraud-a";
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
  const p = d.primer;
  return [
    d.slug, d.statement, d.approach, d.code, d.time, d.space,
    ...d.examples.flatMap((e) => [e.input, e.output, e.explanation ?? ""]),
    ...d.constraints, ...d.breakdown, ...d.edges, ...d.walkthrough,
    ...d.followUps ?? [], ...d.related ?? [],
    ...d.ladder.flatMap((r) => [r.title, r.body]),
    d.schema.ddl, d.schema.seed, ...(d.schema.tables ?? []).flatMap((t) => [t.name, t.note]),
    ...(p ? [p.hook, p.where, ...p.concept, ...p.worked, ...p.reallife, ...p.glossary.flatMap((g) => [g.term, g.def])] : []),
  ];
};
const proseStrings = (d: LcSqlDive): string[] => {
  const p = d.primer;
  return [
    d.statement, d.approach, d.time, d.space,
    ...d.examples.flatMap((e) => [e.input, e.output, e.explanation ?? ""]),
    ...d.constraints, ...d.breakdown, ...d.edges, ...d.walkthrough,
    ...d.followUps ?? [], ...d.ladder.flatMap((r) => [r.title, r.body]),
    ...(d.schema.tables ?? []).map((t) => t.note),
    ...(p ? [p.hook, p.where, ...p.concept, ...p.worked, ...p.reallife, ...p.glossary.flatMap((g) => [g.term, g.def])] : []),
  ];
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
  { slug: "structuring-detection", id: 8031, difficulty: "Medium", xp: 20,
    columns: ["customer_id", "deposit_date", "deposit_count", "day_total_cents"],
    rows: [
      [7, "2026-09-14", 4, 1040000],
      [3, "2026-09-16", 3, 1020000],
      [2, "2026-09-18", 3, 1000000],
    ],
    realColumns: [], intColumns: ["customer_id", "deposit_count", "day_total_cents"] },
  { slug: "transaction-velocity", id: 8032, difficulty: "Hard", xp: 35,
    columns: ["card_id", "window_start", "txn_count", "window_total_cents"],
    rows: [
      [11, 1758067200, 5, 404000],
      [12, 1758067800, 3, 510000],
      [14, 1758068400, 4, 395000],
      [16, 1758069300, 2, 500000],
    ],
    realColumns: [], intColumns: ["card_id", "window_start", "txn_count", "window_total_cents"] },
  { slug: "circular-transfers", id: 8033, difficulty: "Medium", xp: 20,
    columns: ["a_account", "b_account", "out_cents", "back_cents", "days_apart"],
    rows: [
      [501, 502, 700000, 700000, 0],
      [510, 511, 400000, 380000, 2],
      [520, 521, 250000, 250000, 7],
    ],
    realColumns: [], intColumns: ["a_account", "b_account", "out_cents", "back_cents", "days_apart"] },
];
const XP: Record<string, number> = { Easy: 10, Medium: 20, Hard: 35 };

// related slugs may ONLY come from the brief's pool.
const RELATED_POOL = new Set([
  "duplicate-charge-pairs", "gl-reconciliation", "settlement-fails-aging", "fx-exposure-report",
  "realized-pnl-average-cost", "delinquency-buckets", "loan-amortization-schedule", "portfolio-weights",
  "dau-wau-stickiness", "rolling-7d-actives", "sessionize-events", "npv-queries",
  "calculate-product-final-price", "bank-account-summary-ii",
]);
const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));

console.log(`\n=== sql-df-fraud-a.ts — ${SQL_DF_FRAUD_A.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_FRAUD_A.length === 3 && SPEC.every((s, i) => SQL_DF_FRAUD_A[i]?.slug === s.slug),
  SQL_DF_FRAUD_A.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_FRAUD_A[i];
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
  ok("approach is ONE line", !d.approach.includes("\n"));
  ok("time/space nonempty", d.time.trim().length > 0 && d.space.trim().length > 0);

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
  ok("exactly 4 edges", d.edges.length === 4, String(d.edges.length));
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
  ok("primer present (batch-3 requirement)", !!p);
  if (p) {
    ok(`primer hook is exactly 1 sentence (got ${sentenceCount(p.hook)})`, sentenceCount(p.hook) === 1);
    ok(`primer concept has 3-4 paragraphs (got ${p.concept.length})`, p.concept.length >= 3 && p.concept.length <= 4);
    p.concept.forEach((para, j) =>
      ok(`primer concept para ${j + 1} has >= 3 sentences (got ${sentenceCount(para)})`, sentenceCount(para) >= 3));
    ok(`primer worked has 3-5 steps (got ${p.worked.length})`, p.worked.length >= 3 && p.worked.length <= 5);
    p.worked.forEach((s, j) =>
      ok(`primer worked step ${j + 1} is nonempty prose (>= 1 sentence, got ${sentenceCount(s)})`,
        s.trim().length > 0 && sentenceCount(s) >= 1));
    ok(`primer glossary has 4-6 entries (got ${p.glossary.length})`, p.glossary.length >= 4 && p.glossary.length <= 6);
    p.glossary.forEach((g, j) => {
      ok(`primer glossary ${j + 1} term nonempty (${g.term})`, g.term.trim().length > 0);
      const words = g.def.trim().split(/\s+/).length;
      ok(`primer glossary ${j + 1} def has >= 5 words (got ${words})`, words >= 5);
    });
    ok(`primer reallife has 2-3 paragraphs (got ${p.reallife.length})`, p.reallife.length >= 2 && p.reallife.length <= 3);
    p.reallife.forEach((para, j) =>
      ok(`primer reallife para ${j + 1} has >= 3 sentences (got ${sentenceCount(para)})`, sentenceCount(para) >= 3));
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

  // MONEY convention
  const moneyOut = spec.columns.filter((c) => /(_cents|_minor)$/.test(c));
  ok("every *_cents/_minor output column is declared integer", moneyOut.every((c) => spec.intColumns.includes(c)));
  const ddlMoney = (d.schema.ddl.match(/^\s*(\w+_cents|\w+_minor)\s+(\w+)/gim) ?? [])
    .map((m) => m.trim().split(/\s+/));
  ok(`every *_cents/_minor DDL column is INTEGER (${ddlMoney.length} money columns)`,
    ddlMoney.length > 0 && ddlMoney.every((parts) => parts[1] === "INTEGER"), JSON.stringify(ddlMoney));
  ok("declared REAL columns appear in the output", spec.realColumns.every((c) => spec.columns.includes(c)));

  // registry tuple: STRICT whenever the row is wired; PEND while the lead owes wiring
  const regRow = LC_ALL.find((r) => r.slug === spec.slug);
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
console.log("\n=== structuring — hand-aggregated customer-days + the named wall ===");
{
  const d = SQL_DF_FRAUD_A[0];
  const db = buildDb(d);
  const raw = runSql(db, `SELECT customer_id, deposit_date, amount_cents FROM deposits ORDER BY deposit_id ASC`);
  const agg = new Map<string, { n: number; sum: number; max: number }>();
  for (const [cust, date, amt] of raw as Array<[number, string, number]>) {
    const k = `${cust}|${date}`;
    const g = agg.get(k) ?? { n: 0, sum: 0, max: 0 };
    g.n += 1; g.sum += amt; g.max = Math.max(g.max, amt);
    agg.set(k, g);
  }
  ok("customer 7 on 2026-09-14: 4 deposits, 1040000 total, max 260000",
    (() => { const g = agg.get("7|2026-09-14"); return !!g && g.n === 4 && g.sum === 1040000 && g.max === 260000; })());
  ok("customer 3 on 2026-09-16: 3 deposits, 1020000 total, max 340000",
    (() => { const g = agg.get("3|2026-09-16"); return !!g && g.n === 3 && g.sum === 1020000 && g.max === 340000; })());
  ok("customer 2 on 2026-09-18: 3 deposits, EXACTLY 1000000, max 500000",
    (() => { const g = agg.get("2|2026-09-18"); return !!g && g.n === 3 && g.sum === 1000000 && g.max === 500000; })());
  ok("customer 9 on 2026-09-17: 5 deposits, 995000 total (5000 short), max 199000",
    (() => { const g = agg.get("9|2026-09-17"); return !!g && g.n === 5 && g.sum === 995000 && g.max === 199000; })());
  ok("customer 4 on 2026-09-15: 3 deposits, 1400000 total, max 1200000 (the CTR contrast)",
    (() => { const g = agg.get("4|2026-09-15"); return !!g && g.n === 3 && g.sum === 1400000 && g.max === 1200000; })());
  ok("customer 5 on 2026-09-14: 2 deposits, 900000 total (count < 3)",
    (() => { const g = agg.get("5|2026-09-14"); return !!g && g.n === 2 && g.sum === 900000 && g.max === 450000; })());
  ok("customer 8: one 350000 deposit on each of 3 days (1050000 across days, never on one day)",
    (() => {
      const days = ["2026-09-14", "2026-09-15", "2026-09-16"];
      return days.every((day) => { const g = agg.get(`8|${day}`); return !!g && g.n === 1 && g.sum === 350000; });
    })());
  ok("customer 7 whole-week: 7 deposits totalling 2639000 (the per-customer trap figure)",
    (() => {
      let n = 0, sum = 0;
      for (const [k, g] of agg) if (k.startsWith("7|")) { n += g.n; sum += g.sum; }
      return n === 7 && sum === 2639000;
    })());
  // the wall lives ONCE in the code, as the named CTE constant
  const body = stripComments(d.code);
  ok("the wall is a named constant: VALUES (1000000) appears exactly once in the code",
    /\bvalues\s*\(\s*1000000\s*\)/i.test(body) && (body.match(/1000000/g) ?? []).length === 1);
  ok("the all-under guard compares MAX against the named wall",
    /max\s*\(\s*d\.amount_cents\s*\)\s*<\s*wall\.threshold_cents/i.test(body));
  db.close();
}

console.log("\n=== velocity — epoch base, bucket arithmetic, TS mirror ===");
{
  const d = SQL_DF_FRAUD_A[1];
  const db = buildDb(d);
  ok("base second 1758067200 is 2025-09-17 00:00 UTC (date print)",
    new Date(1758067200 * 1000).toISOString().startsWith("2025-09-17"));
  ok("the day starts exactly on a bucket boundary (1758067200 % 300 === 0)", 1758067200 % 300 === 0);
  ok("bucket walls: 1758067799 -> 1758067500 and 1758067800 -> 1758067800 (integer division)",
    Math.trunc(1758067799 / 300) * 300 === 1758067500 && Math.trunc(1758067800 / 300) * 300 === 1758067800);
  ok("card 12's third purchase sits on the exact half 5860226.5 (1758067950 % 300 === 150) — the round-nearest bait",
    1758067950 % 300 === 150);
  const raw = runSql(db, `SELECT card_id, txn_ts, amount_cents, direction FROM txns ORDER BY txn_id ASC`);
  const buckets = new Map<string, { n: number; sum: number }>();
  for (const [card, ts, amt, dir] of raw as Array<[number, number, number, string]>) {
    if (dir !== "purchase") continue; // purchases only, before grouping
    const k = `${card}|${Math.trunc(ts / 300) * 300}`;
    const g = buckets.get(k) ?? { n: 0, sum: 0 };
    g.n += 1; g.sum += amt;
    buckets.set(k, g);
  }
  const flagged = [...buckets.entries()]
    .filter(([, g]) => g.n >= 4 || g.sum >= 500000)
    .map(([k, g]) => [Number(k.split("|")[0]), Number(k.split("|")[1]), g.n, g.sum])
    .sort((a, b) => (a[0] as number) - (b[0] as number) || (a[1] as number) - (b[1] as number));
  ok("TS mirror of the whole rule (purchases only, integer buckets, OR flags) === the 4 contract rows",
    eq(flagged, SPEC[1].rows), JSON.stringify(flagged));
  ok("hand sums: card 11 404000 · card 12 510000 · card 14 purchases 395000 + refunds 560000 · card 15 480000 · card 16 500000",
    (() => {
      const s: Record<number, number> = {}, r: Record<number, number> = {};
      for (const [card, , amt, dir] of raw as Array<[number, number, number, string]>) {
        if (dir === "purchase") s[card] = (s[card] ?? 0) + amt; else r[card] = (r[card] ?? 0) + amt;
      }
      return s[11] === 404000 && s[12] === 510000 && s[14] === 395000 && s[15] === 480000 && s[16] === 500000
        && r[14] === 560000;
    })());
  db.close();
}

console.log("\n=== circular — TS mirror of the pair join + window arithmetic ===");
{
  const d = SQL_DF_FRAUD_A[2];
  const db = buildDb(d);
  ok("the DDL carries the CHECK (from_account <> to_account) constraint line",
    /check\s*\(\s*from_account\s*<>\s*to_account\s*\)/i.test(d.schema.ddl));
  const raw = runSql(db, `SELECT transfer_id, from_account, to_account, amount_cents, transfer_ts
      FROM transfers ORDER BY transfer_id ASC`) as Array<[number, number, number, number, number]>;
  const hand: unknown[][] = [];
  for (const t1 of raw) {
    for (const t2 of raw) {
      if (t2[0] <= t1[0]) continue; // t1.transfer_id < t2.transfer_id
      if (t2[2] !== t1[1] || t2[1] !== t1[2]) continue; // swapped endpoints (from/to)
      const gap = t2[4] - t1[4];
      if (gap < 0 || gap > 604800) continue;
      hand.push([t1[1], t1[2], t1[3], t2[3], Math.trunc(gap / 86400)]);
    }
  }
  hand.sort((a, b) => (a[4] as number) - (b[4] as number) || (a[0] as number) - (b[0] as number) || (a[1] as number) - (b[1] as number));
  ok("TS mirror of the swapped-endpoint join === the 3 contract rows", eq(hand, SPEC[2].rows), JSON.stringify(hand));
  ok("pair gaps: 5400 (same day) · 172800 (2 days) · 604800 (exactly the wall)",
    (() => {
      const gap = (a: number, b: number) => {
        const t1 = raw.find((r) => r[0] === a)!, t2 = raw.find((r) => r[0] === b)!;
        return t2[4] - t1[4];
      };
      return gap(10, 11) === 5400 && gap(12, 13) === 172800 && gap(14, 15) === 604800;
    })());
  ok("the 8-day return sits 691200 s out — over the 604800 wall",
    (() => {
      const t1 = raw.find((r) => r[0] === 23)!, t2 = raw.find((r) => r[0] === 24)!;
      return t2[4] - t1[4] === 691200 && t2[4] - t1[4] > 604800;
    })());
  ok("the reversed-precedes pair fails BOTH orientations (time order and id order disagree)",
    (() => {
      const t25 = raw.find((r) => r[0] === 25)!, t26 = raw.find((r) => r[0] === 26)!;
      const asWritten = t26[4] >= t25[4]; // (25, 26): return after outbound?
      const flipped = t25[0] > t26[0];    // (26, 25): t1.id < t2.id?
      return !asWritten && !flipped;
    })());
  ok("days division is exact on whole-day gaps: 5400->0 · 172800->2 · 604800->7",
    Math.trunc(5400 / 86400) === 0 && Math.trunc(172800 / 86400) === 2 && Math.trunc(604800 / 86400) === 7);
  db.close();
}

/* ---------- planted-trap probes: the WRONG queries must produce the documented wrong outputs ---------- */
console.log("\n=== planted-trap probes ===");

// D1 traps
{
  const db = buildDb(SQL_DF_FRAUD_A[0]);
  const BASE = (having: string) => `SELECT
      d.customer_id, d.deposit_date, COUNT(*) AS deposit_count, SUM(d.amount_cents) AS day_total_cents
    FROM deposits d CROSS JOIN wall
    GROUP BY d.customer_id, d.deposit_date
    HAVING ${having}
    ORDER BY day_total_cents DESC, d.customer_id ASC, d.deposit_date ASC`;
  const WALL = `WITH wall(threshold_cents) AS (VALUES (1000000))`;
  ok("D1 dropping the all-under guard lets the 1200000-cent CTR customer slip in: 4 rows, (4, '2026-09-15', 3, 1400000) on top",
    eq(runSql(db, `${WALL} ${BASE("COUNT(*) >= 3 AND SUM(d.amount_cents) >= wall.threshold_cents")}`),
      [[4, "2026-09-15", 3, 1400000], [7, "2026-09-14", 4, 1040000], [3, "2026-09-16", 3, 1020000], [2, "2026-09-18", 3, 1000000]]));
  ok("D1 strict > on the total erases customer 2's exactly-1000000 day: 2 rows",
    eq(runSql(db, `${WALL} ${BASE("COUNT(*) >= 3 AND SUM(d.amount_cents) > wall.threshold_cents AND MAX(d.amount_cents) < wall.threshold_cents")}`),
      [[7, "2026-09-14", 4, 1040000], [3, "2026-09-16", 3, 1020000]]));
  ok("D1 strict > 3 on the count erases customer 3 (exactly 3) and customer 2: 1 row",
    eq(runSql(db, `${WALL} ${BASE("COUNT(*) > 3 AND SUM(d.amount_cents) >= wall.threshold_cents AND MAX(d.amount_cents) < wall.threshold_cents")}`),
      [[7, "2026-09-14", 4, 1040000]]));
  ok("D1 per-customer grain (days dissolved) false-flags customer 8 (1050000 spread) and inflates customer 7 to 2639000",
    eq(runSql(db, `${WALL} SELECT d.customer_id, COUNT(*) AS deposit_count, SUM(d.amount_cents) AS total_cents
        FROM deposits d CROSS JOIN wall
        GROUP BY d.customer_id
        HAVING COUNT(*) >= 3 AND SUM(d.amount_cents) >= wall.threshold_cents AND MAX(d.amount_cents) < wall.threshold_cents
        ORDER BY d.customer_id ASC`),
      [[2, 3, 1000000], [3, 3, 1020000], [7, 7, 2639000], [8, 3, 1050000]]));
  db.close();
}

// D2 traps
{
  const db = buildDb(SQL_DF_FRAUD_A[1]);
  const V = (over: string, where: string, having: string) => `SELECT
      card_id, ${over} AS window_start, COUNT(*) AS txn_count, SUM(amount_cents) AS window_total_cents
    FROM txns
    ${where}
    GROUP BY card_id, ${over}
    HAVING ${having}
    ORDER BY card_id ASC, window_start ASC`;
  const FLAGS = "COUNT(*) >= 4 OR SUM(amount_cents) >= 500000";
  ok("D2 counting refunds too prints (14, ..., 5, 455000) AND flags the refunds-only bucket (14, 1758068700, 2, 500000)",
    eq(runSql(db, V("(txn_ts / 300) * 300", "", FLAGS)),
      [[11, 1758067200, 5, 404000], [12, 1758067800, 3, 510000], [14, 1758068400, 5, 455000],
       [14, 1758068700, 2, 500000], [16, 1758069300, 2, 500000]]));
  ok("D2 GROUP BY without card_id collides card 12 and card 13 in bucket 1758067800: (1758067800, 5, 765000) phantom",
    eq(runSql(db, `SELECT (txn_ts / 300) * 300 AS window_start, COUNT(*) AS txn_count, SUM(amount_cents) AS window_total_cents
        FROM txns
        WHERE direction = 'purchase'
        GROUP BY (txn_ts / 300) * 300
        HAVING ${FLAGS}
        ORDER BY window_start ASC`),
      [[1758067200, 6, 409000], [1758067800, 5, 765000], [1758068400, 4, 395000], [1758069300, 2, 500000]]));
  ok("D2 float-then-truncate buckets CAST(txn_ts / 300.0 AS INTEGER) * 300 HAPPENS TO AGREE here (identical 4 rows) — the contract still pins integer division",
    eq(runSql(db, V("CAST(txn_ts / 300.0 AS INTEGER) * 300", "WHERE direction = 'purchase'", FLAGS)),
      [[11, 1758067200, 5, 404000], [12, 1758067800, 3, 510000], [14, 1758068400, 4, 395000], [16, 1758069300, 2, 500000]]));
  ok("D2 bare float buckets (txn_ts / 300.0) * 300 shatter every non-aligned second: 0 flagged buckets",
    eq(runSql(db, `SELECT COUNT(*) AS flagged FROM (
        SELECT card_id, (txn_ts / 300.0) * 300 AS window_start
        FROM txns WHERE direction = 'purchase'
        GROUP BY card_id, (txn_ts / 300.0) * 300
        HAVING ${FLAGS})`),
      [[0]]));
  ok("D2 round-nearest buckets kill card 12's 510000 (exact half 5860226.5 rounds away) and false-flag card 13's collapsed straddle (13, 1758067800, 4, 510000)",
    eq(runSql(db, V("ROUND(txn_ts / 300.0) * 300", "WHERE direction = 'purchase'", FLAGS)),
      [[11, 1758067200, 5, 404000], [13, 1758067800, 4, 510000], [14, 1758068400, 4, 395000], [16, 1758069300, 2, 500000]]));
  ok("D2 strict > 4 on the count erases card 14 (exactly 4 purchases): 3 rows",
    eq(runSql(db, V("(txn_ts / 300) * 300", "WHERE direction = 'purchase'", "COUNT(*) > 4 OR SUM(amount_cents) >= 500000")),
      [[11, 1758067200, 5, 404000], [12, 1758067800, 3, 510000], [16, 1758069300, 2, 500000]]));
  ok("D2 strict > 500000 on the total erases card 16 (exactly 500000): 3 rows",
    eq(runSql(db, V("(txn_ts / 300) * 300", "WHERE direction = 'purchase'", "COUNT(*) >= 4 OR SUM(amount_cents) > 500000")),
      [[11, 1758067200, 5, 404000], [12, 1758067800, 3, 510000], [14, 1758068400, 4, 395000]]));
  db.close();
}

// D3 traps
{
  const db = buildDb(SQL_DF_FRAUD_A[2]);
  const P = (extra: string, daysExpr: string) => `SELECT
      t1.from_account AS a_account, t1.to_account AS b_account,
      t1.amount_cents AS out_cents, t2.amount_cents AS back_cents,
      ${daysExpr} AS days_apart
    FROM transfers t1
    JOIN transfers t2
      ON t2.from_account = t1.to_account
     AND t2.to_account = t1.from_account
     AND t2.transfer_ts >= t1.transfer_ts
     AND t2.transfer_ts - t1.transfer_ts ${extra}
     AND t1.transfer_id < t2.transfer_id
    ORDER BY days_apart ASC, a_account ASC, b_account ASC`;
  const DAYS = "CAST((t2.transfer_ts - t1.transfer_ts) / 86400 AS INTEGER)";
  ok("D3 strict < 604800 erases the exactly-7-day pair: 2 rows",
    eq(runSql(db, P("< 604800", DAYS)),
      [[501, 502, 700000, 700000, 0], [510, 511, 400000, 380000, 2]]));
  ok("D3 matching the return leg BACKWARDS (same direction, no endpoint swap) drops all 3 real pairs and prints only the bogus (560, 561, 90000, 95000, 0)",
    eq(runSql(db, `SELECT
        t1.from_account AS a_account, t1.to_account AS b_account,
        t1.amount_cents AS out_cents, t2.amount_cents AS back_cents,
        ${DAYS} AS days_apart
      FROM transfers t1
      JOIN transfers t2
        ON t2.from_account = t1.from_account
       AND t2.to_account = t1.to_account
       AND t2.transfer_ts >= t1.transfer_ts
       AND t2.transfer_ts - t1.transfer_ts <= 604800
       AND t1.transfer_id < t2.transfer_id
      ORDER BY days_apart ASC, a_account ASC, b_account ASC`),
      [[560, 561, 90000, 95000, 0]]));
  ok("D3 dropping the transfer_id dedupe lets the reversed-precedes pair back in as (553, 552, 150000, 150000, 1): 4 rows",
    eq(runSql(db, `SELECT
        t1.from_account AS a_account, t1.to_account AS b_account,
        t1.amount_cents AS out_cents, t2.amount_cents AS back_cents,
        ${DAYS} AS days_apart
      FROM transfers t1
      JOIN transfers t2
        ON t2.from_account = t1.to_account
       AND t2.to_account = t1.from_account
       AND t2.transfer_ts >= t1.transfer_ts
       AND t2.transfer_ts - t1.transfer_ts <= 604800
      ORDER BY days_apart ASC, a_account ASC, b_account ASC`),
      [[501, 502, 700000, 700000, 0], [553, 552, 150000, 150000, 1], [510, 511, 400000, 380000, 2], [520, 521, 250000, 250000, 7]]));
  ok("D3 julianday on epoch-integer data is out of range and reads NULL: every days_apart collapses (honestly wrong)",
    eq(runSql(db, P("<= 604800", "CAST(julianday(t2.transfer_ts) - julianday(t1.transfer_ts) AS INTEGER)")),
      [[501, 502, 700000, 700000, null], [510, 511, 400000, 380000, null], [520, 521, 250000, 250000, null]]));
  ok("D3 the naive three-leg cycle detector DOES catch the 530-531-532 chain — exactly what the pairwise contract excludes",
    eq(runSql(db, `SELECT t1.transfer_id AS leg1, t2.transfer_id AS leg2, t3.transfer_id AS leg3
        FROM transfers t1
        JOIN transfers t2 ON t2.from_account = t1.to_account AND t2.transfer_ts > t1.transfer_ts
        JOIN transfers t3 ON t3.from_account = t2.to_account AND t3.transfer_ts > t2.transfer_ts
         AND t3.to_account = t1.from_account
        ORDER BY leg1 ASC`),
      [[20, 21, 22]]));
  // self-loops: the shipped CHECK makes them impossible; a constraint-less copy shows why it matters
  const db2 = new Database(":memory:");
  db2.run(`CREATE TABLE transfers (
    transfer_id  INTEGER PRIMARY KEY,
    from_account INTEGER NOT NULL,
    to_account   INTEGER NOT NULL,
    amount_cents INTEGER NOT NULL,
    transfer_ts  INTEGER NOT NULL
  );`);
  db2.run(`INSERT INTO transfers (transfer_id, from_account, to_account, amount_cents, transfer_ts) VALUES
    (60, 550, 550, 100000, 1758097200),
    (61, 550, 550, 100000, 1758107200);`);
  ok("D3 without the CHECK, two same-account self-loops pair as the bogus (550, 550, 100000, 100000, 0) — the constraint exists for this",
    eq(runSql(db2, P("<= 604800", DAYS)), [[550, 550, 100000, 100000, 0]]));
  db.close();
  db2.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log(`ALL CHECKS PASS ${SQL_DF_FRAUD_A.length}/3`);
