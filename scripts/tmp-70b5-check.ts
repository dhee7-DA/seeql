// Task 70-b5 self-check — sql-free-market.ts (5 dives).
// bun scripts/tmp-70b5-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_FREE_MARKET } from "../src/lib/leetcode/content/sql-free-market";
import type { LcSqlDive } from "../src/lib/leetcode/types";

let pass = 0, fail = 0;
const failures: string[] = [];
const ok = (label: string, cond: boolean, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; failures.push(label + (detail ? ` — ${detail}` : "")); console.log(`  FAIL  ${label}${detail ? " — " + detail : ""}`); }
};
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

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

/** ddl/seed must end with ';' and NOTHING after it on the same line or beyond. */
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

/* ---------- spec ---------- */
const SPEC: Array<{ slug: string; xp: number; columns: string[]; rows: unknown[][] }> = [
  { slug: "find-product-recommendation-pairs", xp: 20,
    columns: ["product1", "product2", "pairs_count"], rows: [[1, 2, 4], [3, 4, 3]] },
  { slug: "find-category-recommendation-pairs", xp: 35,
    columns: ["category1", "category2", "affinity"],
    rows: [["bakery", "dairy", 3], ["dairy", "bakery", 3], ["meat", "produce", 2], ["produce", "meat", 2]] },
  { slug: "seasonal-sales-analysis", xp: 20,
    columns: ["season", "total_sales", "sale_count"],
    rows: [["summer", 900, 1], ["spring", 700, 3], ["winter", 700, 2], ["autumn", 430, 4]] },
  { slug: "odd-and-even-transactions", xp: 20,
    columns: ["parity", "total_amount", "tx_count"], rows: [["even", 303, 3], ["odd", 330, 3]] },
  { slug: "find-drivers-with-improved-fuel-efficiency", xp: 20,
    columns: ["driver_id", "first_efficiency", "latest_efficiency", "gain"],
    rows: [[11, 7.5, 8.0, 0.5], [12, 9.0, 9.1, 0.1]] },
];

const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));
console.log(`\n=== sql-free-market.ts — ${SQL_FREE_MARKET.length} dives expected ===\n`);
ok("file exports exactly 5 dives in spec order",
  SQL_FREE_MARKET.length === 5 && SPEC.every((s, i) => SQL_FREE_MARKET[i]?.slug === s.slug),
  SQL_FREE_MARKET.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_FREE_MARKET[i];
  const spec = SPEC[i];
  console.log(`\n--- dive ${i + 1}: ${d.slug} ---`);

  // statement count + result-level ORDER BY
  ok("exactly ONE statement (countStatements)", countStatements(d.code) === 1);
  ok("exactly ONE statement (splitStatements)", splitStatements(d.code).length === 1);
  const stripped = stripOver(stripComments(d.code));
  ok("result-level ORDER BY after stripping comments/OVER spans", /order\s+by/i.test(stripped));
  ok('order === "exact"', d.order === "exact");
  ok(`xp === ${spec.xp}`, d.xp === spec.xp);
  ok("no writeVerify", (d as unknown as Record<string, unknown>).writeVerify === undefined);
  ok("approach is ONE line", !d.approach.includes("\n"));

  // trailing-semicolon + comment hygiene
  ok("ddl ends with ';' and nothing after", trailingSemicolonClean(d.schema.ddl));
  ok("seed ends with ';' and nothing after", trailingSemicolonClean(d.schema.seed));
  ok("no ';' inside comments of ddl/seed/code",
    noSemiInComments(d.schema.ddl) && noSemiInComments(d.schema.seed) && noSemiInComments(d.code));

  // structure
  ok("2 examples with input+output",
    d.examples.length === 2 && d.examples.every((e) => e.input.trim() && e.output.trim()));
  ok("3 constraints", d.constraints.length === 3);
  ok("3 breakdown paragraphs", d.breakdown.length === 3);
  d.breakdown.forEach((p, j) =>
    ok(`breakdown para ${j + 1} has 3-5 sentences (got ${sentenceCount(p)})`,
      sentenceCount(p) >= 3 && sentenceCount(p) <= 5));
  ok("3-4 edges", d.edges.length >= 3 && d.edges.length <= 4);
  ok("3 ladder rungs (title+body)", d.ladder.length === 3 && d.ladder.every((r) => r.title.trim() && r.body.trim()));
  ok("3 walkthrough steps", d.walkthrough.length === 3);
  ok(">= 2 followUps", (d.followUps?.length ?? 0) >= 2);
  ok("exactly 3 related", d.related?.length === 3);
  d.related?.forEach((r) => ok(`related slug in LC_ALL: ${r}`, LC_SLUGS.has(r)));
  ok("schema.tables notes present", (d.schema.tables?.length ?? 0) >= 1);

  // hygiene: backticks / ${ / platform mention in any dive string
  const strs = allStrings(d);
  ok("no backticks in any string", strs.every((s) => !s.includes("`")));
  ok("no ${ in any string", strs.every((s) => !s.includes("${")));
  ok("no platform mention in any string", strs.every((s) => !/leetcode/i.test(s)));

  // engine: build from ddl+seed, run solution TWICE, hard-assert columns + rows
  try {
    const db = new Database(":memory:");
    for (const st of splitStatements(d.schema.ddl)) db.run(st);
    for (const st of splitStatements(d.schema.seed)) db.run(st);
    const r1 = runSql(db, d.code);
    const c1 = getCols(db, d.code);
    const r2 = runSql(db, d.code);
    db.close();
    ok("determinism: two runs identical", eq(r1, r2));
    ok(`columns === [${spec.columns.join(", ")}]`, eq(c1, spec.columns), JSON.stringify(c1));
    ok(`rows === ${JSON.stringify(spec.rows)} (order-sensitive)`, eq(r1, spec.rows), JSON.stringify(r1));
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

// D1: COUNT(*) promotes (1,3) to 3 and ships a phantom row; strict > 3 drops the boundary pair
{
  const db = new Database(":memory:");
  for (const st of splitStatements(SQL_FREE_MARKET[0].schema.ddl)) db.run(st);
  for (const st of splitStatements(SQL_FREE_MARKET[0].schema.seed)) db.run(st);
  probe("D1 COUNT(*) ships phantom (1,3,3)", eq(runSql(db, `SELECT a.product_id AS p1, b.product_id AS p2, COUNT(*) AS c
    FROM BasketLine a JOIN BasketLine b ON a.basket_id = b.basket_id AND a.product_id < b.product_id
    GROUP BY a.product_id, b.product_id HAVING COUNT(*) >= 3
    ORDER BY c DESC, p1, p2`), [[1, 2, 4], [1, 3, 3], [3, 4, 3]]));
  probe("D1 strict > 3 drops boundary pair (3,4)", eq(runSql(db, `SELECT a.product_id AS p1, b.product_id AS p2, COUNT(DISTINCT a.basket_id) AS c
    FROM BasketLine a JOIN BasketLine b ON a.basket_id = b.basket_id AND a.product_id < b.product_id
    GROUP BY a.product_id, b.product_id HAVING COUNT(DISTINCT a.basket_id) > 3
    ORDER BY c DESC, p1, p2`), [[1, 2, 4]]));
  probe("D1 un-canonicalized join doubles pair rows",
    (runSql(db, `SELECT COUNT(*) AS c FROM BasketLine a JOIN BasketLine b
      ON a.basket_id = b.basket_id AND a.product_id <> b.product_id
      WHERE (a.product_id = 1 AND b.product_id = 2) OR (a.product_id = 2 AND b.product_id = 1)`)[0][0]) === 8);
  db.close();
}
// D2: raw-log join inflates affinity to 4; c1 < c2 halves the report
{
  const db = new Database(":memory:");
  for (const st of splitStatements(SQL_FREE_MARKET[1].schema.ddl)) db.run(st);
  for (const st of splitStatements(SQL_FREE_MARKET[1].schema.seed)) db.run(st);
  probe("D2 naive purchase-count reads affinity 4 on top pair",
    eq(runSql(db, `SELECT a.category AS c1, b.category AS c2, COUNT(*) AS aff
      FROM PurchaseLog a JOIN PurchaseLog b ON a.buyer_id = b.buyer_id AND a.category != b.category
      GROUP BY a.category, b.category HAVING COUNT(*) >= 2 ORDER BY aff DESC, c1, c2`),
      [["bakery", "dairy", 4], ["dairy", "bakery", 4], ["meat", "produce", 2], ["produce", "meat", 2]]));
  probe("D2 c1 < c2 ships only 2 rows (both-orders contract broken)",
    eq(runSql(db, `WITH bought AS (SELECT DISTINCT buyer_id, category FROM PurchaseLog)
      SELECT a.category AS c1, b.category AS c2, COUNT(DISTINCT a.buyer_id) AS aff
      FROM bought a JOIN bought b ON a.buyer_id = b.buyer_id AND a.category < b.category
      GROUP BY a.category, b.category HAVING COUNT(DISTINCT a.buyer_id) >= 2
      ORDER BY aff DESC, c1`), [["bakery", "dairy", 3], ["meat", "produce", 2]]));
  db.close();
}
// D3: missing CAST collapses everything into ELSE 'autumn'
{
  const db = new Database(":memory:");
  for (const st of splitStatements(SQL_FREE_MARKET[2].schema.ddl)) db.run(st);
  for (const st of splitStatements(SQL_FREE_MARKET[2].schema.seed)) db.run(st);
  probe("D3 no-CAST collapses to single autumn row 2730/10", eq(runSql(db, `WITH tagged AS (SELECT amount, CASE
      WHEN strftime('%m', sold_on) IN (12, 1, 2) THEN 'winter'
      WHEN strftime('%m', sold_on) IN (3, 4, 5) THEN 'spring'
      WHEN strftime('%m', sold_on) IN (6, 7, 8) THEN 'summer'
      ELSE 'autumn' END AS season FROM SaleRecord)
    SELECT season, SUM(amount) AS t, COUNT(*) AS c FROM tagged GROUP BY season ORDER BY t DESC, season`),
    [["autumn", 2730, 10]]));
  probe("D3 the 700 tie exists (top-2 by total only is non-deterministic territory)",
    eq(runSql(db, `WITH tagged AS (SELECT amount, CASE
      WHEN CAST(strftime('%m', sold_on) AS INTEGER) IN (12, 1, 2) THEN 'winter'
      WHEN CAST(strftime('%m', sold_on) AS INTEGER) IN (3, 4, 5) THEN 'spring'
      WHEN CAST(strftime('%m', sold_on) AS INTEGER) IN (6, 7, 8) THEN 'summer'
      ELSE 'autumn' END AS season FROM SaleRecord)
      SELECT SUM(amount) AS t FROM tagged GROUP BY season ORDER BY t DESC LIMIT 2`).map((r) => r[0]),
    [900, 700]));
  db.close();
}
// D4: amount-parity classification misreads the buckets
{
  const db = new Database(":memory:");
  for (const st of splitStatements(SQL_FREE_MARKET[3].schema.ddl)) db.run(st);
  for (const st of splitStatements(SQL_FREE_MARKET[3].schema.seed)) db.run(st);
  probe("D4 amount-parity misread prints 402/231", eq(runSql(db, `WITH tagged AS (SELECT amount,
      CASE WHEN amount % 2 = 0 THEN 'even' ELSE 'odd' END AS parity FROM Payment)
    SELECT parity, SUM(amount) AS t, COUNT(*) AS c FROM tagged GROUP BY parity ORDER BY parity`),
    [["even", 402, 3], ["odd", 231, 3]]));
  db.close();
}
// D5: MIN/MAX-of-metric (or insertion order) fabricates driver 15's improvement; unrounded gain is noise
{
  const db = new Database(":memory:");
  for (const st of splitStatements(SQL_FREE_MARKET[4].schema.ddl)) db.run(st);
  for (const st of splitStatements(SQL_FREE_MARKET[4].schema.seed)) db.run(st);
  probe("D5 MIN/MAX-metric wrongly includes driver 15", eq(runSql(db, `SELECT driver_id, MIN(km_per_liter) AS f, MAX(km_per_liter) AS l
    FROM FuelLog GROUP BY driver_id HAVING l > f ORDER BY driver_id`),
    [[11, 7.5, 8.0], [12, 9.0, 9.1], [15, 8.0, 8.5]]));
  const unrounded = runSql(db, `WITH ranked AS (SELECT driver_id, km_per_liter,
      ROW_NUMBER() OVER (PARTITION BY driver_id ORDER BY log_id) AS a,
      ROW_NUMBER() OVER (PARTITION BY driver_id ORDER BY log_id DESC) AS b FROM FuelLog),
    bounds AS (SELECT driver_id,
      MAX(CASE WHEN a = 1 THEN km_per_liter END) AS f,
      MAX(CASE WHEN b = 1 THEN km_per_liter END) AS l FROM ranked GROUP BY driver_id)
    SELECT l - f AS g FROM bounds WHERE l > f ORDER BY driver_id`);
  const g12 = unrounded[1][0] as number;
  probe("D5 unrounded gain for driver 12 is binary noise (not 0.1)",
    g12 !== 0.1 && Math.abs(g12 - 0.09999999999999964) < 1e-15, String(g12));
  db.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log("ALL CHECKS PASS 5/5");
