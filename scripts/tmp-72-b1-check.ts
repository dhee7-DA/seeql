// Task 72-b1 — ENGINE SELF-CHECK for sql-df-metrics.ts (standalone: bun + bun:sqlite,
// NOT the app's imports — the only import is the content file itself, RELATIVE).
// Run: bun scripts/tmp-72-b1-check.ts
//
// For each of the 3 dives: build an in-memory DB, run the dive's DDL + seed verbatim,
// run the dive's code, then assert column names, row count, EVERY cell (incl. rounding),
// row order, plus seed/trap probes and structural quality-bar checks.
import { Database } from "bun:sqlite";
import { SQL_DF_METRICS } from "../src/lib/leetcode/content/sql-df-metrics";

/* ---------------- tiny harness ---------------- */
let pass = 0;
const failures: string[] = [];
function ok(cond: boolean, label: string) {
  if (cond) pass++;
  else failures.push(label);
}
function eqCell(actual: unknown, expected: unknown, label: string) {
  const good =
    typeof expected === "number" && typeof actual === "number"
      ? Math.abs(actual - expected) < 1e-9
      : actual === expected;
  ok(good, `${label} (got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)})`);
}
function eqArr(actual: unknown[], expected: unknown[], label: string) {
  const good =
    actual.length === expected.length && actual.every((a, i) => a === expected[i]);
  ok(good, `${label} (got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)})`);
}

/* ---------------- related-slug pool (verified) ---------------- */
const RELATED_POOL = new Set([
  "restaurant-growth",
  "human-traffic-of-stadium",
  "find-consistently-improving-employees",
  "analyze-subscription-conversion",
  "rolling-average-steps",
  "customers-with-maximum-number-of-transactions-on-consecutive-days",
  "year-on-year-growth-rate",
  "seasonal-sales-analysis",
  "odd-and-even-transactions",
  "consecutive-numbers",
  "find-students-who-improved",
  "customer-purchasing-behavior-analysis",
]);

/* ---------------- structural quality-bar checks ---------------- */
ok(SQL_DF_METRICS.length === 3, "file exports exactly 3 dives");
const bySlug = new Map(SQL_DF_METRICS.map((d) => [d.slug, d]));
const SPEC = [
  { slug: "dau-wau-stickiness", xp: 20 },
  { slug: "growth-accounting", xp: 20 },
  { slug: "funnel-step-conversion", xp: 10 },
];
for (const { slug, xp } of SPEC) {
  const d = bySlug.get(slug);
  ok(!!d, `dive ${slug} present`);
  if (!d) continue;
  ok(d.order === "exact", `${slug}: order is "exact"`);
  ok(d.xp === xp, `${slug}: xp is ${xp}`);
  ok(d.examples.length === 2, `${slug}: exactly 2 examples`);
  ok(d.examples.some((e) => e.explanation), `${slug}: explanation on at least one example`);
  ok(d.constraints.length >= 2 && d.constraints.length <= 4, `${slug}: 2-4 constraints`);
  ok(d.breakdown.length === 3, `${slug}: exactly 3 breakdown items`);
  ok(d.breakdown.every((b) => b.length >= 200), `${slug}: breakdown items are full paragraphs`);
  ok(d.edges.length >= 3 && d.edges.length <= 5, `${slug}: 3-5 edges`);
  ok(d.edges.every((e) => e.length >= 80), `${slug}: edge lines are full sentences`);
  ok(d.ladder.length === 3, `${slug}: exactly 3 ladder rungs`);
  ok(d.ladder.every((r) => r.body.length >= 120), `${slug}: ladder bodies >= 2 sentences`);
  ok(d.walkthrough.length >= 3, `${slug}: >= 3 walkthrough paragraphs`);
  ok(d.walkthrough.every((w) => w.length >= 200), `${slug}: walkthrough paragraphs are chunks`);
  ok(
    (d.followUps?.length ?? 0) >= 2 && (d.followUps?.length ?? 0) <= 3,
    `${slug}: 2-3 followUps`,
  );
  ok(
    (d.related?.length ?? 0) >= 2 &&
      (d.related?.length ?? 0) <= 3 &&
      (d.related ?? []).every((r) => RELATED_POOL.has(r)),
    `${slug}: related drawn only from the verified pool`,
  );
  ok(d.schema.tables?.length === 1, `${slug}: one tables note`);
  const tnote = d.schema.tables?.[0];
  ok(!!tnote && tnote.name.length > 0 && tnote.note.length > 0, `${slug}: table note filled`);
  ok(d.writeVerify === undefined, `${slug}: read-only (no writeVerify)`);
  const stmts = d.code
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  ok(stmts.length === 1, `${slug}: code is exactly ONE statement`);
  ok(d.code.trim().endsWith(";"), `${slug}: single trailing semicolon`);
  ok(/^\s*(WITH|SELECT)\b/.test(d.code), `${slug}: code starts with WITH/SELECT`);
  ok(
    !/\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE)\b/.test(d.code.replace(/^--.*$/gm, "")),
    `${slug}: solution statement is read-only`,
  );
}

/* ---------------- engine harness ---------------- */
function runDive(slug: string) {
  const d = bySlug.get(slug)!;
  const db = new Database(":memory:");
  db.run(d.schema.ddl);
  db.run(d.schema.seed);
  const stmt = db.prepare(d.code);
  const cols = stmt.columnNames as string[];
  const rows = stmt.values() as unknown[][];
  return { db, cols, rows };
}
const nOf = (db: Database, sql: string): number =>
  (db.query(sql).get() as { n: number }).n;

/* ================= Problem 1 — dau-wau-stickiness ================= */
{
  const { db, cols, rows } = runDive("dau-wau-stickiness");
  eqArr(cols, ["day", "dau", "wau7", "stickiness_pct"], "P1: exact column names/order");

  // seed probes
  ok(nOf(db, "SELECT COUNT(*) AS n FROM events") === 48, "P1: seed loads 48 event rows");
  ok(
    nOf(db, "SELECT COUNT(DISTINCT date(event_ts)) AS n FROM events") === 12,
    "P1: 12 distinct calendar days 2026-09-01..2026-09-12",
  );
  ok(
    nOf(db, "SELECT COUNT(*) AS n FROM events WHERE user_id = 1 AND date(event_ts) = '2026-09-01'") === 2,
    "P1: user 1 logs twice on 2026-09-01 (DISTINCT trap present)",
  );

  // hand-derived expected grid (day, dau, wau7, stickiness_pct)
  const P1: [string, number, number, number][] = [
    ["2026-09-01", 4, 4, 100.0],
    ["2026-09-02", 5, 6, 83.3],
    ["2026-09-03", 5, 7, 71.4],
    ["2026-09-04", 3, 7, 42.9],
    ["2026-09-05", 3, 8, 37.5],
    ["2026-09-06", 5, 9, 55.6],
    ["2026-09-07", 5, 10, 50.0],
    ["2026-09-08", 2, 10, 20.0],
    ["2026-09-09", 5, 10, 50.0],
    ["2026-09-10", 4, 10, 40.0],
    ["2026-09-11", 3, 10, 30.0],
    ["2026-09-12", 3, 9, 33.3],
  ];
  ok(rows.length === 12, `P1: 12 output rows (got ${rows.length})`);
  for (let i = 0; i < P1.length; i++) {
    for (let j = 0; j < 4; j++) {
      eqCell(rows[i]?.[j], P1[i][j], `P1: row ${i} col ${cols[j]}`);
    }
  }
  eqArr(rows.map((r) => r[0]), P1.map((r) => r[0]), "P1: rows ordered by day ASC");

  // window semantics pinned: wau7 >= dau everywhere; equality ONLY on the truncated first day
  ok(rows.every((r) => (r[2] as number) >= (r[1] as number)), "P1: wau7 >= dau on every day");
  ok(rows[0][1] === rows[0][2], "P1: day 1 truncated window -> wau7 == dau (4 == 4)");
  ok(
    rows.slice(1).every((r) => (r[2] as number) > (r[1] as number)),
    "P1: days 2-12 -> wau7 > dau strictly (coincide nowhere else)",
  );
  db.close();
}

/* ================= Problem 2 — growth-accounting ================= */
{
  const { db, cols, rows } = runDive("growth-accounting");
  eqArr(
    cols,
    ["month", "new_users", "retained", "resurrected", "churned"],
    "P2: exact column names/order",
  );

  // seed probes
  const seedStats = db
    .query(
      "SELECT COUNT(*) AS n, COUNT(DISTINCT user_id || '-' || active_month) AS d FROM activity",
    )
    .get() as { n: number; d: number };
  ok(seedStats.n === 33, "P2: seed loads 33 user-month rows");
  ok(seedStats.n === seedStats.d, "P2: (user_id, active_month) pairs are distinct");
  ok(
    nOf(db, "SELECT COUNT(DISTINCT active_month) AS n FROM activity") === 5,
    "P2: five months 2026-05..2026-09 present",
  );

  // hand-derived expected grid (month, new_users, retained, resurrected, churned)
  const P2: [string, number, number, number, number][] = [
    ["2026-05", 6, 0, 0, 0],
    ["2026-06", 3, 4, 0, 2],
    ["2026-07", 1, 4, 1, 3],
    ["2026-08", 1, 4, 2, 2],
    ["2026-09", 1, 6, 0, 1],
  ];
  ok(rows.length === 5, `P2: 5 output rows (got ${rows.length})`);
  for (let i = 0; i < P2.length; i++) {
    for (let j = 0; j < 5; j++) {
      eqCell(rows[i]?.[j], P2[i][j], `P2: row ${i} col ${cols[j]}`);
    }
  }
  eqArr(rows.map((r) => r[0]), P2.map((r) => r[0]), "P2: rows ordered by month ASC");

  // growth-accounting identities, checked straight against the seed
  const actives = (m: string) =>
    (db.query("SELECT COUNT(*) AS n FROM activity WHERE active_month = ?").get(m) as { n: number }).n;
  for (let i = 0; i < P2.length; i++) {
    const [, nu, re, rs, ch] = P2[i];
    ok(
      nu + re + rs === actives(P2[i][0]),
      `P2: ${P2[i][0]} actives = new+retained+resurrected (${nu}+${re}+${rs} = ${actives(P2[i][0])})`,
    );
    if (i > 0) {
      ok(
        re + ch === actives(P2[i - 1][0]),
        `P2: ${P2[i][0]} retained+churned = ${P2[i - 1][0]} actives (${re}+${ch} = ${actives(P2[i - 1][0])})`,
      );
    }
  }
  db.close();
}

/* ================= Problem 3 — funnel-step-conversion ================= */
{
  const { db, cols, rows } = runDive("funnel-step-conversion");
  eqArr(
    cols,
    ["step", "users", "pct_of_visitors", "pct_from_prev"],
    "P3: exact column names/order",
  );

  // seed probes
  ok(nOf(db, "SELECT COUNT(*) AS n FROM funnel") === 30, "P3: seed loads 30 funnel rows");
  ok(
    nOf(db, "SELECT COUNT(DISTINCT user_id) AS n FROM funnel WHERE step = 'visit'") === 12,
    "P3: 12 distinct visitors",
  );
  ok(
    nOf(db, "SELECT COUNT(*) AS n FROM funnel WHERE step = 'cart'") === 6 &&
      nOf(db, "SELECT COUNT(DISTINCT user_id) AS n FROM funnel WHERE step = 'cart'") === 5,
    "P3: cart has 6 rows but 5 distinct users (user 3's repeat row)",
  );

  // hand-derived expected grid (step, users, pct_of_visitors, pct_from_prev)
  const P3: [string, number, number, number][] = [
    ["visit", 12, 100.0, 100.0],
    ["signup", 8, 66.7, 66.7],
    ["cart", 5, 41.7, 62.5],
    ["purchase", 3, 25.0, 60.0],
  ];
  ok(rows.length === 4, `P3: 4 output rows (got ${rows.length})`);
  for (let i = 0; i < P3.length; i++) {
    for (let j = 0; j < 4; j++) {
      eqCell(rows[i]?.[j], P3[i][j], `P3: row ${i} col ${cols[j]}`);
    }
  }
  eqArr(
    rows.map((r) => r[0]),
    ["visit", "signup", "cart", "purchase"],
    "P3: rows in FUNNEL order (not alphabetical)",
  );
  ok(rows[0][3] === 100 || Math.abs((rows[0][3] as number) - 100) < 1e-9, "P3: visit row pct_from_prev = 100.0");
  db.close();
}

/* ---------------- report ---------------- */
const total = pass + failures.length;
console.log(`\n=== 72-b1 self-check: ${pass}/${total} assertions passed ===`);
if (failures.length) {
  console.log("FAILURES:");
  for (const f of failures) console.log("  ✗ " + f);
  process.exit(1);
} else {
  console.log("ALL GREEN");
}
