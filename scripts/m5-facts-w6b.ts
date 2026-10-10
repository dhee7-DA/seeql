/// <reference types="bun-types" />
// m5-c6 addendum probe (w6 window pipelines) — read-only COPY of db/custom.db, self-deleting.
// Covers the citations in cases-w6.ts that are NOT already in m5-facts-w6.out /
// r4 / r6 / w5 receipts: share paints, gap-to-crown ladders, ASC ladder rungs,
// combined-cut sums, and the verbatim behavior of numeric literals appended to
// ORDER BY expressions (the w4 constant-trap check for this wave's banks).
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5w6b.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label}`);
  console.log(JSON.stringify(q(sql)));
};

console.log("sqlite", db.query("SELECT sqlite_version() AS v").get());

// ---- cs-1419: status pots with share of grand ------------------------------
show("status pots pct of grand", `SELECT status, ROUND(SUM(total), 2) pot,
  ROUND(100.0 * SUM(total) / SUM(SUM(total)) OVER (), 1) pct
FROM orders GROUP BY status ORDER BY pct DESC`);

// ---- cs-1413: gap-to-crown ladder ------------------------------------------
show("behind-the-crown ladder top5", `WITH s AS (
  SELECT c.name, ROUND(SUM(o.total), 2) spend,
    ROUND(MAX(SUM(o.total)) OVER (), 2) top
  FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id)
SELECT name, spend, ROUND(top - spend, 2) behind FROM s ORDER BY spend DESC LIMIT 5`);

// ---- cs-1416 / cs-1420: combined-cut sums ----------------------------------
show("pending exposure combined rn<=2/3/5", `WITH x AS (
  SELECT c.name, ROUND(SUM(o.total), 2) exposure,
    ROW_NUMBER() OVER (ORDER BY SUM(o.total) DESC) rn,
    SUM(SUM(o.total)) OVER () pot
  FROM orders o JOIN customers c ON c.id = o.customer_id
  WHERE o.status = 'pending' GROUP BY c.id)
SELECT
  (SELECT ROUND(SUM(100.0 * exposure / pot), 1) FROM x WHERE rn <= 2) rn2,
  (SELECT ROUND(SUM(100.0 * exposure / pot), 1) FROM x WHERE rn <= 3) rn3,
  (SELECT ROUND(SUM(100.0 * exposure / pot), 1) FROM x WHERE rn <= 5) rn5 FROM x LIMIT 1`);
show("cancelled+pending exposure combined rn<=1/3", `WITH x AS (
  SELECT c.name, ROUND(SUM(o.total), 2) exposure,
    ROW_NUMBER() OVER (ORDER BY SUM(o.total) DESC) rn,
    SUM(SUM(o.total)) OVER () pot
  FROM orders o JOIN customers c ON c.id = o.customer_id
  WHERE o.status IN ('cancelled', 'pending') GROUP BY c.id)
SELECT
  (SELECT ROUND(SUM(100.0 * exposure / pot), 1) FROM x WHERE rn <= 1) rn1,
  (SELECT ROUND(SUM(100.0 * exposure / pot), 1) FROM x WHERE rn <= 3) rn3 FROM x LIMIT 1`);

// ---- cs-1414: expense month share of annual pot (staged: window sees all 14) -
show("expense month share of annual pot", `WITH m AS (
  SELECT strftime('%Y-%m', spent_on) mon, SUM(amount_cents) / 100.0 spend
  FROM expenses GROUP BY mon),
r AS (SELECT mon, spend,
  ROUND(100.0 * spend / SUM(spend) OVER (), 1) pct,
  RANK() OVER (ORDER BY spend ASC) rk_asc
FROM m)
SELECT mon, ROUND(spend, 2) spend, pct, rk_asc FROM r WHERE mon IN ('2024-02', '2024-08') ORDER BY mon`);

// ---- cs-1424: supplier stock rebase on the leader --------------------------
show("supplier stock rebase on MAX pile", `WITH p AS (
  SELECT sup.name, SUM(p.stock) pile, MAX(SUM(p.stock)) OVER () top
  FROM products p JOIN suppliers sup ON sup.id = p.supplier_id GROUP BY sup.id)
SELECT name, pile, ROUND(100.0 * pile / top, 1) rebase FROM p ORDER BY pile DESC`);

// ---- cs-1423: champions ASC rung + 767.64 global position ------------------
show("champion league ASC rungs", `WITH best AS (
  SELECT customer_id, id, total,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id) rn
  FROM orders)
SELECT c.name, b.id, b.total,
  RANK() OVER (ORDER BY b.total ASC) rk_asc
FROM best b JOIN customers c ON c.id = b.customer_id
WHERE b.rn = 1 ORDER BY rk_asc`);
show("767.64 position among all orders DESC", `SELECT COUNT(*) ahead FROM orders WHERE total > 767.64`);

// ---- cs-1393: sku-count dense ladder ----------------------------------------
show("category sku counts rank+dense", `WITH s AS (
  SELECT category, COUNT(*) n,
    RANK() OVER (ORDER BY COUNT(*) DESC) rk,
    DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) drk
  FROM products GROUP BY category)
SELECT category, n, rk, drk FROM s ORDER BY rk, category`);

// ---- cs-1394: ASC spend league rk8 ------------------------------------------
show("spend league ASC rk 7..9", `WITH s AS (
  SELECT c.name, ROUND(SUM(o.total), 2) spend,
    RANK() OVER (ORDER BY SUM(o.total) ASC) rk
  FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id)
SELECT name, spend, rk FROM s WHERE rk BETWEEN 7 AND 9 ORDER BY rk`);

// ---- cs-1415: supplier piles ASC rk4 ----------------------------------------
show("supplier piles ASC ladder", `WITH p AS (
  SELECT sup.name, SUM(p.stock) pile,
    RANK() OVER (ORDER BY SUM(p.stock) ASC) rk
  FROM products p JOIN suppliers sup ON sup.id = p.supplier_id GROUP BY sup.id)
SELECT name, pile, rk FROM p ORDER BY rk`);

// ---- cs-1408: boundary-row share pins ---------------------------------------
show("price ladder share pins", `WITH s AS (
  SELECT name, price, ROW_NUMBER() OVER (ORDER BY price DESC) rn,
    ROUND(100.0 * price / SUM(price) OVER (), 1) share
  FROM products)
SELECT name, price, rn, share FROM s WHERE rn IN (1, 8, 16) ORDER BY rn`);

// ---- cs-1406: opex/revenue ratio ASC head -----------------------------------
show("opex vs revenue ratio ASC head", `WITH r AS (
  SELECT strftime('%Y-%m', created_at) mon, SUM(total) rev FROM orders GROUP BY mon),
e AS (SELECT strftime('%Y-%m', spent_on) mon, SUM(amount_cents) / 100.0 opex
  FROM expenses GROUP BY mon)
SELECT r.mon, ROUND(100.0 * e.opex / r.rev, 1) ratio,
  RANK() OVER (ORDER BY e.opex / r.rev ASC) rk_asc
FROM r JOIN e ON e.mon = r.mon ORDER BY rk_asc LIMIT 3`);

// ---- cs-1410: category concentration combined cuts --------------------------
show("category pct combined top2/bottom2", `WITH c AS (
  SELECT category, ROUND(SUM(price), 2) value,
    ROW_NUMBER() OVER (ORDER BY SUM(price) DESC) rn,
    ROUND(100.0 * SUM(price) / SUM(SUM(price)) OVER (), 1) pct
  FROM products GROUP BY category)
SELECT
  (SELECT ROUND(SUM(pct), 1) FROM c WHERE rn <= 2) top2,
  (SELECT ROUND(SUM(pct), 1) FROM c WHERE rn >= 6) bottom2,
  (SELECT ROUND(SUM(pct), 1) FROM c WHERE rn >= 7) bottom1,
  (SELECT ROUND(SUM(pct), 1) FROM c WHERE rn >= 5) bottom3 FROM c LIMIT 1`);

// ---- cs-1407: cohort share re-based on leader -------------------------------
show("cohort share re-based on MAX", `WITH f AS (
  SELECT customer_id, strftime('%Y-%m', MIN(created_at)) cohort, SUM(total) spend
  FROM orders GROUP BY customer_id),
c AS (SELECT cohort, COUNT(*) members, ROUND(SUM(spend), 2) rev FROM f GROUP BY cohort)
SELECT cohort, rev, ROUND(100.0 * rev / MAX(rev) OVER (), 1) rebased FROM c ORDER BY rev DESC`);

// ---- cs-1422: share+rank cut rows -------------------------------------------
show("spend shares with rank cut rows", `WITH s AS (
  SELECT c.name, ROUND(SUM(o.total), 2) spend,
    ROUND(100.0 * SUM(o.total) / SUM(SUM(o.total)) OVER (), 1) pct,
    RANK() OVER (ORDER BY SUM(o.total) DESC) rk
  FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id)
SELECT name, spend, pct, rk FROM s WHERE rk <= 3 ORDER BY rk`);

// ---- cs-1421: layered walk assert row ----------------------------------------
show("opex walk rank+run assert rows", `WITH m AS (
  SELECT strftime('%Y-%m', spent_on) mo, SUM(amount_cents) / 100.0 spend
  FROM expenses GROUP BY mo),
r AS (SELECT mo, spend,
  SUM(spend) OVER (ORDER BY mo) run,
  RANK() OVER (ORDER BY spend DESC) rk FROM m)
SELECT mo, ROUND(spend, 2) spend, ROUND(run, 2) run, rk FROM r WHERE rk IN (1, 2) ORDER BY rk`);

// ---- cs-1391/1401: filled-shape confirmations --------------------------------
show("above-mean price club head (filled shape)", `WITH s AS (
  SELECT name, price, ROUND(AVG(price) OVER (), 2) mean FROM products)
SELECT name, price, mean FROM s WHERE price > mean AND price = 199.99 AND mean = 71.78`);
show("above-own-mean spenders (filled shape)", `WITH s AS (
  SELECT c.name, ROUND(SUM(o.total), 2) spend,
    ROUND(AVG(SUM(o.total)) OVER (), 2) mean
  FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id)
SELECT name, spend, mean FROM s WHERE spend > mean AND spend = 2667.93 AND mean = 2177.08`);

// ---- numeric literal appended to ORDER BY expressions (w4 trap check) --------
const traps: [string, string][] = [
  ["outer ORDER BY expr then number", `SELECT id FROM orders ORDER BY id 5`],
  ["OVER ORDER BY expr then number", `SELECT id, ROW_NUMBER() OVER (ORDER BY id 5) rn FROM orders`],
  ["OVER ORDER BY agg then number", `SELECT category, COUNT(*) n FROM expenses GROUP BY category ORDER BY n 14`],
  ["outer ORDER BY expr then decimal", `SELECT id FROM orders ORDER BY id 0.5`],
  ["OVER ORDER BY expr then big number", `SELECT id, ROW_NUMBER() OVER (ORDER BY total 945.21) rn FROM orders`],
  ["SUM(*) stage", `SELECT category, SUM(*) n FROM expenses GROUP BY category`],
  ["MAX(*) stage", `SELECT category, MAX(*) n FROM expenses GROUP BY category`],
  ["number into direction slot (outer)", `SELECT status, pot, RANK() OVER (ORDER BY pot DESC) rk FROM (
     SELECT status, SUM(total) pot FROM orders GROUP BY status) WHERE pot = 6113 ORDER BY pot 15571.07`],
];
for (const [label, sql] of traps) {
  try {
    q(sql);
    console.log(`\n[TRAP ${label}]  no error — PARSES`);
  } catch (e) {
    console.log(`\n[TRAP ${label}]  ${e instanceof Error ? e.message : String(e)}`);
  }
}

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done, copy removed");
