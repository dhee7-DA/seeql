/// <reference types="bun-types" />
// m5-c-r6 probe tool — read-only COPY of db/custom.db, self-deleting.
// Every figure used in cases-r6.ts must trace to this output.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5c-r6.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label}`);
  console.log(JSON.stringify(q(sql)));
};

console.log("sqlite", db.query("SELECT sqlite_version() AS v").get());

// ---- leaderboard / shares -------------------------------------------------
show("customer leaderboard", `SELECT c.name, ROUND(SUM(o.total),2) spend,
  RANK() OVER (ORDER BY SUM(o.total) DESC) rk
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.id ORDER BY rk`);
show("per-customer share of grand (1dp)", `SELECT c.name, ROUND(SUM(o.total),2) spend,
  ROUND(100.0 * SUM(o.total) / SUM(SUM(o.total)) OVER (), 1) pct
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.id ORDER BY spend DESC`);
show("per-customer share of grand (2dp)", `SELECT c.name,
  ROUND(100.0 * SUM(o.total) / SUM(SUM(o.total)) OVER (), 2) pct
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.id ORDER BY pct DESC`);
show("grand paint via SUM(SUM) OVER ()", `SELECT c.id, COUNT(*) n,
  SUM(SUM(o.total)) OVER () grand
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.id ORDER BY c.id LIMIT 3`);
show("region order counts", `SELECT c.region, COUNT(*) n FROM orders o
  JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY n DESC`);
show("region share 1dp", `SELECT region, n, ROUND(100.0*n/SUM(n) OVER (), 1) pct FROM (
  SELECT c.region region, COUNT(*) n FROM orders o
  JOIN customers c ON c.id = o.customer_id GROUP BY c.region) ORDER BY pct DESC`);
show("region share 2dp", `SELECT region, n, ROUND(100.0*n/SUM(n) OVER (), 2) pct FROM (
  SELECT c.region region, COUNT(*) n FROM orders o
  JOIN customers c ON c.id = o.customer_id GROUP BY c.region) ORDER BY pct DESC`);
show("region revenue+custs+orders", `SELECT c.region, COUNT(DISTINCT c.id) custs,
  COUNT(o.id) orders, ROUND(SUM(o.total),2) rev,
  RANK() OVER (ORDER BY SUM(o.total) DESC) rk,
  ROUND(100.0*SUM(o.total)/SUM(SUM(o.total)) OVER (), 1) pct
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.region ORDER BY rk`);
show("share of first order row", `SELECT o.id, o.total,
  ROUND(100.0*o.total/SUM(o.total) OVER (), 2) share
FROM orders o ORDER BY o.id LIMIT 3`);

// ---- months ---------------------------------------------------------------
show("month spends staged + rank by spend", `WITH m AS (
  SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend
  FROM orders GROUP BY mon)
SELECT mon, spend, RANK() OVER (ORDER BY spend DESC) rk FROM m ORDER BY rk`);
show("month spend tie census", `WITH m AS (
  SELECT strftime('%Y-%m', created_at) mon, SUM(total) spend
  FROM orders GROUP BY mon)
SELECT COUNT(*) n, COUNT(DISTINCT spend) d FROM m`);
show("month running line", `WITH m AS (
  SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend
  FROM orders GROUP BY mon)
SELECT mon, spend, ROUND(SUM(spend) OVER (ORDER BY mon),2) run FROM m ORDER BY mon`);
show("month MoM pct staged", `WITH m AS (
  SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend
  FROM orders GROUP BY mon),
p AS (SELECT mon, spend, LAG(spend) OVER (ORDER BY mon) prev FROM m)
SELECT mon, spend, prev, ROUND(100.0*(spend-prev)/prev, 1) pct FROM p ORDER BY mon`);
show("month share top", `WITH m AS (
  SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend
  FROM orders GROUP BY mon)
SELECT mon, spend, ROUND(100.0*spend/SUM(spend) OVER (), 1) pct,
  RANK() OVER (ORDER BY spend DESC) rk
FROM m ORDER BY rk LIMIT 4`);
show("month counts", `SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n
  FROM orders GROUP BY mon ORDER BY mon`);

// ---- statuses -------------------------------------------------------------
show("status census + rank", `SELECT status, COUNT(*) n,
  RANK() OVER (ORDER BY COUNT(*) DESC) rk FROM orders GROUP BY status ORDER BY rk`);
show("pending crowd detail", `SELECT o.id, o.total,
  ROUND(100.0*o.total/SUM(o.total) OVER (), 1) share
FROM orders o WHERE o.status = 'pending' ORDER BY share DESC`);
show("pending crowd paint", `SELECT COUNT(*) OVER () crowd,
  ROUND(SUM(o.total) OVER (), 2) pot, ROUND(AVG(o.total) OVER (), 2) avg_t
FROM orders o WHERE o.status = 'pending' LIMIT 2`);
show("cancelled detail", `SELECT o.id, o.total, o.created_at FROM orders o
  WHERE o.status = 'cancelled' ORDER BY o.total DESC`);
show("cancelled+pending exposure by customer", `WITH x AS (
  SELECT c.name, ROUND(SUM(o.total),2) exposure
  FROM orders o JOIN customers c ON c.id = o.customer_id
  WHERE o.status IN ('cancelled','pending') GROUP BY c.id)
SELECT name, exposure, ROUND(100.0*exposure/SUM(exposure) OVER (), 1) pct,
  RANK() OVER (ORDER BY exposure DESC) rk FROM x ORDER BY rk LIMIT 6`);
show("delivered running head", `SELECT id, total,
  ROUND(SUM(total) OVER (ORDER BY id),2) run, COUNT(*) OVER (ORDER BY id) cnum
FROM orders WHERE status = 'delivered' ORDER BY id LIMIT 5`);
show("delivered total-order check", `SELECT id, total FROM orders
  WHERE status = 'delivered' ORDER BY total LIMIT 5`);

// ---- orders / ntile / ties ------------------------------------------------
show("ntile4 orders by id census", `SELECT tile, COUNT(*) n, MIN(id) lo, MAX(id) hi FROM (
  SELECT id, NTILE(4) OVER (ORDER BY id) tile FROM orders) GROUP BY tile`);
show("ntile4 orders DESC total tile edges", `SELECT tile, COUNT(*) n, MIN(total) lo, MAX(total) hi FROM (
  SELECT total, NTILE(4) OVER (ORDER BY total DESC) tile FROM orders) GROUP BY tile`);
show("ntile5 orders census", `SELECT tile, COUNT(*) n FROM (
  SELECT id, NTILE(5) OVER (ORDER BY id) tile FROM orders) GROUP BY tile`);
show("created_at tie census", `SELECT created_at, COUNT(*) n FROM orders
  GROUP BY created_at HAVING n > 1 ORDER BY n DESC, created_at`);
show("same-day pair rows (created_at = prev)", `WITH d AS (
  SELECT id, created_at, total,
    LAG(created_at) OVER (ORDER BY created_at, id) prev_at
  FROM orders)
SELECT COUNT(*) n, MIN(id) lo, MAX(id) hi FROM d WHERE created_at = prev_at`);
show("same-day rows by id", `WITH d AS (
  SELECT id, created_at, LAG(created_at) OVER (ORDER BY created_at, id) prev_at
  FROM orders)
SELECT id, created_at FROM d WHERE created_at = prev_at ORDER BY id`);
show("order-count ladder per customer", `WITH k AS (
  SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id)
SELECT n, COUNT(*) custs, RANK() OVER (ORDER BY n DESC) rk,
  DENSE_RANK() OVER (ORDER BY n DESC) drk FROM k GROUP BY n ORDER BY n DESC`);
show("total jump deltas", `WITH d AS (
  SELECT id, total, LAG(total) OVER (ORDER BY id) prev FROM orders)
SELECT id, total, prev, ROUND(total - prev, 2) jump FROM d WHERE prev IS NOT NULL
ORDER BY ABS(jump) DESC LIMIT 8`);
show("jump threshold census", `WITH d AS (
  SELECT id, total, LAG(total) OVER (ORDER BY id) prev FROM orders)
SELECT
  SUM(CASE WHEN total - prev > 500 THEN 1 ELSE 0 END) gt500,
  SUM(CASE WHEN total - prev > 400 THEN 1 ELSE 0 END) gt400,
  SUM(CASE WHEN total - prev > 600 THEN 1 ELSE 0 END) gt600,
  SUM(CASE WHEN total - prev > 800 THEN 1 ELSE 0 END) gt800
FROM d WHERE prev IS NOT NULL`);
show("running total+count head", `SELECT id, total,
  ROUND(SUM(total) OVER (ORDER BY id),2) run, COUNT(*) OVER (ORDER BY id) rn
FROM orders ORDER BY id LIMIT 4`);
show("cohort (first-order month) census + cumulative", `WITH f AS (
  SELECT customer_id, strftime('%Y-%m', MIN(created_at)) cohort
  FROM orders GROUP BY customer_id),
k AS (SELECT cohort, COUNT(*) new_custs FROM f GROUP BY cohort)
SELECT cohort, new_custs, SUM(new_custs) OVER (ORDER BY cohort) cum FROM k ORDER BY cohort`);

// ---- products / suppliers / catalog ---------------------------------------
show("products dump", `SELECT id, name, category, price, stock, supplier_id FROM products ORDER BY id`);
show("product price rank + gap to floor", `SELECT name, price,
  RANK() OVER (ORDER BY price) rk, MIN(price) OVER () floor_price
FROM products ORDER BY rk`);
show("product avg price", `SELECT ROUND(AVG(price), 2) avg_price FROM products`);
show("price tiles 4 + tile sums", `WITH t AS (
  SELECT name, price, NTILE(4) OVER (ORDER BY price DESC) tile FROM products)
SELECT tile, COUNT(*) n, ROUND(SUM(price),2) tile_price,
  ROUND(100.0*SUM(price)/SUM(SUM(price)) OVER (), 1) pct
FROM t GROUP BY tile ORDER BY tile`);
show("stock census + rank", `SELECT name, stock, RANK() OVER (ORDER BY stock DESC) rk
FROM products ORDER BY rk`);
show("stock below avg", `WITH s AS (
  SELECT name, stock, ROUND(AVG(stock) OVER (), 1) avg_stock FROM products)
SELECT name, stock, avg_stock FROM s WHERE stock < avg_stock ORDER BY stock`);
show("stock tiles 4", `WITH t AS (
  SELECT name, stock, NTILE(4) OVER (ORDER BY stock DESC) tile FROM products)
SELECT tile, name, stock FROM t WHERE tile = 1 ORDER BY stock DESC`);
show("category price census", `WITH c AS (
  SELECT category, COUNT(*) n, ROUND(SUM(price),2) cat_price
  FROM products GROUP BY category)
SELECT category, n, cat_price,
  ROUND(100.0*cat_price/SUM(cat_price) OVER (), 1) pct,
  RANK() OVER (ORDER BY cat_price DESC) rk
FROM c ORDER BY rk`);
show("suppliers dump", `SELECT id, name, region, rating FROM suppliers ORDER BY id`);
show("supplier rating ties", `SELECT rating, COUNT(*) n FROM suppliers GROUP BY rating HAVING n > 1`);
show("supplier product counts", `SELECT s.name, COUNT(p.id) n,
  RANK() OVER (ORDER BY COUNT(p.id) DESC) rk
FROM suppliers s JOIN products p ON p.supplier_id = s.id
GROUP BY s.id ORDER BY rk, s.name`);
show("supplier value + share", `WITH s AS (
  SELECT sup.name, COUNT(p.id) items, ROUND(SUM(p.price),2) value
  FROM suppliers sup JOIN products p ON p.supplier_id = sup.id
  GROUP BY sup.id)
SELECT name, items, value, ROUND(100.0*value/SUM(value) OVER (), 1) pct,
  RANK() OVER (ORDER BY value DESC) rk FROM s ORDER BY rk`);
show("supplier stock sums", `WITH s AS (
  SELECT sup.name, SUM(p.stock) total_stock FROM suppliers sup
  JOIN products p ON p.supplier_id = sup.id GROUP BY sup.id)
SELECT name, total_stock, RANK() OVER (ORDER BY total_stock DESC) rk,
  ROUND(100.0*total_stock/SUM(total_stock) OVER (), 1) pct FROM s ORDER BY rk`);

// ---- expenses / ledger ----------------------------------------------------
show("travel rows + delta", `SELECT id, spent_on, vendor, amount_cents/100.0 amt,
  ROUND(amount_cents/100.0 - LAG(amount_cents/100.0) OVER (ORDER BY spent_on), 2) delta
FROM expenses WHERE category = 'Travel' ORDER BY spent_on`);
show("travel id vs date order check", `SELECT id, spent_on FROM expenses
  WHERE category = 'Travel' ORDER BY spent_on`);
show("vendor spend census", `WITH v AS (
  SELECT vendor, ROUND(SUM(amount_cents)/100.0, 2) spend FROM expenses GROUP BY vendor)
SELECT vendor, spend, ROUND(100.0*spend/SUM(spend) OVER (), 1) pct,
  RANK() OVER (ORDER BY spend DESC) rk FROM v ORDER BY rk LIMIT 4`);
show("expense monthly running", `WITH m AS (
  SELECT strftime('%Y-%m', spent_on) mon, SUM(amount_cents)/100.0 spend
  FROM expenses GROUP BY mon)
SELECT mon, ROUND(spend,2) spend, ROUND(SUM(spend) OVER (ORDER BY mon),2) run
FROM m ORDER BY mon`);
show("expense month rank", `WITH m AS (
  SELECT strftime('%Y-%m', spent_on) mon, SUM(amount_cents)/100.0 spend
  FROM expenses GROUP BY mon)
SELECT mon, ROUND(spend,2) spend, RANK() OVER (ORDER BY spend DESC) rk FROM m ORDER BY rk LIMIT 3`);
show("expense category share 1dp", `WITH c AS (
  SELECT category, ROUND(SUM(amount_cents)/100.0, 2) spend FROM expenses GROUP BY category)
SELECT category, spend, ROUND(100.0*spend/SUM(spend) OVER (), 1) pct FROM c ORDER BY pct DESC`);
show("ledger opex monthly + MoM", `WITH m AS (
  SELECT strftime('%Y-%m', entry_date) mon, SUM(debit_cents)/100.0 spend
  FROM ledger_entries WHERE account = 'operating_expenses' GROUP BY mon)
SELECT mon, ROUND(spend,2) spend,
  ROUND(spend - LAG(spend) OVER (ORDER BY mon), 2) delta
FROM m ORDER BY mon`);

// ---- invoices / payments --------------------------------------------------
show("invoice amounts dollars head", `SELECT id, number, issued_on, amount_cents/100.0 amt
FROM invoices ORDER BY issued_on LIMIT 8`);
show("invoice amount census", `SELECT COUNT(*) n, MIN(amount_cents) lo, MAX(amount_cents) hi,
  ROUND(SUM(amount_cents)/100.0, 2) total FROM invoices`);
show("payments by method", `SELECT method, COUNT(*) n, ROUND(SUM(amount_cents)/100.0, 2) paid
FROM payments GROUP BY method`);

// ---- verbatim errors ------------------------------------------------------
const errs: [string, string][] = [
  ["window in WHERE", `SELECT name FROM customers WHERE RANK() OVER (ORDER BY id) = 1`],
  ["aliased window in WHERE", `SELECT name, ROW_NUMBER() OVER (ORDER BY id) rn FROM customers WHERE rn = 1`],
  ["OVER ORDER BY alias", `SELECT name, RANK() OVER (ORDER BY rk) x FROM (
     SELECT name, 1 AS rk FROM customers) sub`],
  ["GROUP BY aggregate alias", `SELECT region, COUNT(*) n FROM customers GROUP BY n`],
  ["aggregate around window", `SELECT SUM(SUM(total) OVER ()) FROM orders`],
  ["window fn named in WHERE (SUM)", `SELECT id FROM orders WHERE SUM(total) OVER () > 100`],
];
for (const [label, sql] of errs) {
  try {
    q(sql);
    console.log(`\n[ERR ${label}]  no error`);
  } catch (e) {
    console.log(`\n[ERR ${label}]  ${e instanceof Error ? e.message : String(e)}`);
  }
}

// ---- round 2: case-specific receipts --------------------------------------
show("R1 product price running ladder head", `SELECT name, price,
  ROW_NUMBER() OVER (ORDER BY price) rn,
  ROUND(SUM(price) OVER (ORDER BY price), 2) running
FROM products ORDER BY rn LIMIT 5`);
show("R2 price gap above mean", `WITH p AS (
  SELECT name, price, ROUND(AVG(price) OVER (), 2) avg_price,
         ROUND(price - AVG(price) OVER (), 2) gap
  FROM products)
SELECT name, price, avg_price, gap FROM p WHERE gap > 0 ORDER BY gap DESC`);
show("R3 lifts over floor rk<=4", `WITH r AS (
  SELECT name, price, RANK() OVER (ORDER BY price DESC) rk,
         MIN(price) OVER () floor_price
  FROM products)
SELECT name, price, rk, ROUND(price - floor_price, 2) lift
FROM r WHERE rk <= 4 ORDER BY rk`);
show("R4 stock shares rk<=5", `WITH s AS (
  SELECT name, stock, RANK() OVER (ORDER BY stock DESC) rk,
         SUM(stock) OVER () all_stock
  FROM products)
SELECT name, stock, rk, ROUND(100.0 * stock / all_stock, 1) share
FROM s WHERE rk <= 5 ORDER BY rk`);
show("R5 order-count board top6", `WITH per AS (
  SELECT c.name AS name, COUNT(o.id) AS n
  FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id)
SELECT name, n, RANK() OVER (ORDER BY n DESC) rk,
  ROUND(100.0 * n / SUM(n) OVER (), 1) pct
FROM per ORDER BY rk LIMIT 6`);
show("R6 jump > 500 rows", `WITH d AS (
  SELECT id, total, LAG(total) OVER (ORDER BY id) prev FROM orders)
SELECT id, total, prev, ROUND(total - prev, 2) jump FROM d
WHERE jump > 500 ORDER BY jump DESC`);
show("R6b LEAD variant jump > 500 count", `WITH d AS (
  SELECT id, total, LEAD(total) OVER (ORDER BY id) nxt FROM orders)
SELECT COUNT(*) n FROM d WHERE total - nxt > 500`);
show("R7 exposure ladder full", `WITH x AS (
  SELECT c.name AS name, ROUND(SUM(o.total),2) exposure
  FROM orders o JOIN customers c ON c.id = o.customer_id
  WHERE o.status IN ('cancelled','pending') GROUP BY c.id)
SELECT COUNT(*) custs, ROUND(SUM(exposure),2) pot FROM x`);
show("R7b exposure top5", `WITH x AS (
  SELECT c.name AS name, ROUND(SUM(o.total),2) exposure
  FROM orders o JOIN customers c ON c.id = o.customer_id
  WHERE o.status IN ('cancelled','pending') GROUP BY c.id)
SELECT name, exposure, ROUND(100.0*exposure/SUM(exposure) OVER (), 1) pct,
  RANK() OVER (ORDER BY exposure DESC) rk
FROM x ORDER BY rk LIMIT 5`);
show("R8 cohorts via MAX(created_at)", `WITH f AS (
  SELECT customer_id, strftime('%Y-%m', MAX(created_at)) cohort
  FROM orders GROUP BY customer_id),
k AS (SELECT cohort, COUNT(*) new_custs FROM f GROUP BY cohort)
SELECT cohort, new_custs, SUM(new_custs) OVER (ORDER BY cohort) cum FROM k ORDER BY cohort`);
show("R8b cumulative thresholds", `WITH f AS (
  SELECT customer_id, strftime('%Y-%m', MIN(created_at)) cohort
  FROM orders GROUP BY customer_id),
k AS (SELECT cohort, COUNT(*) new_custs FROM f GROUP BY cohort),
c AS (SELECT cohort, new_custs, SUM(new_custs) OVER (ORDER BY cohort) cum FROM k)
SELECT SUM(CASE WHEN cum <= 10 THEN 1 ELSE 0 END) le10,
  SUM(CASE WHEN cum <= 14 THEN 1 ELSE 0 END) le14,
  SUM(CASE WHEN cum <= 13 THEN 1 ELSE 0 END) le13 FROM c`);
show("R9 customer spend tiles", `WITH s AS (
  SELECT c.name AS name, ROUND(SUM(o.total),2) spend,
         NTILE(4) OVER (ORDER BY SUM(o.total) DESC) tile
  FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id)
SELECT tile, COUNT(*) n, ROUND(SUM(spend),2) tile_spend,
  ROUND(100.0*SUM(spend)/SUM(SUM(spend)) OVER (), 1) pct
FROM s GROUP BY tile ORDER BY tile`);
show("R10 supplier rating bands NTILE 3/2/6", `WITH b AS (
  SELECT name, rating, NTILE(3) OVER (ORDER BY rating DESC) band FROM suppliers)
SELECT band, COUNT(*) n, MIN(rating) lo, MAX(rating) hi FROM b GROUP BY band`);
show("R10b", `WITH b AS (
  SELECT name, rating, NTILE(2) OVER (ORDER BY rating DESC) band FROM suppliers)
SELECT band, COUNT(*) n, MIN(rating) lo, MAX(rating) hi FROM b GROUP BY band`);
show("R10c", `WITH b AS (
  SELECT name, rating, NTILE(6) OVER (ORDER BY rating DESC) band FROM suppliers)
SELECT band, COUNT(*) n FROM b WHERE band = 1`);
show("R11 cash/sales_revenue debit sums", `SELECT account, SUM(debit_cents) d, COUNT(*) n
  FROM ledger_entries GROUP BY account`);
show("R12 day buckets orders vs expenses", `SELECT
  (SELECT COUNT(DISTINCT strftime('%d', created_at)) FROM orders) order_days,
  (SELECT COUNT(DISTINCT strftime('%d', spent_on)) FROM expenses) expense_days`);
show("R13 LAG vs LEAD same-day id sets", `WITH d AS (
  SELECT id, created_at,
    LAG(created_at) OVER (ORDER BY created_at, id) lag_at,
    LEAD(created_at) OVER (ORDER BY created_at, id) lead_at
  FROM orders)
SELECT
  (SELECT COUNT(*) FROM d WHERE created_at = lag_at) lag_n,
  (SELECT COUNT(*) FROM d WHERE created_at = lead_at) lead_n`);
try {
  q(`SELECT id FROM orders ORDER BY created_at, ROW_NUMBER()`);
  console.log("\n[R14 window fn inside OVER ORDER BY]  no error");
} catch (e) {
  console.log(`\n[R14 window fn inside OVER ORDER BY]  ${e instanceof Error ? e.message : String(e)}`);
}
show("R15 NTILE 3 and 4 ASC tiles", `WITH t AS (
  SELECT name, price, NTILE(3) OVER (ORDER BY price) tile FROM products)
SELECT tile, COUNT(*) n, MIN(price) lo, MAX(price) hi FROM t GROUP BY tile`);
show("R15b", `WITH t AS (
  SELECT name, price, NTILE(4) OVER (ORDER BY price) tile FROM products)
SELECT tile, COUNT(*) n, MIN(price) lo, MAX(price) hi FROM t GROUP BY tile`);
show("R16 expense delta thresholds", `WITH m AS (
  SELECT strftime('%Y-%m', spent_on) mon, SUM(amount_cents)/100.0 spend
  FROM expenses GROUP BY mon),
d AS (SELECT mon, spend, spend - LAG(spend) OVER (ORDER BY mon) delta FROM m)
SELECT
  SUM(CASE WHEN delta > 200 THEN 1 ELSE 0 END) gt200,
  SUM(CASE WHEN delta > 500 THEN 1 ELSE 0 END) gt500,
  SUM(CASE WHEN delta > 100 THEN 1 ELSE 0 END) gt100 FROM d`);
show("R16b expense delta > 200 rows", `WITH m AS (
  SELECT strftime('%Y-%m', spent_on) mon, ROUND(SUM(amount_cents)/100.0, 2) spend
  FROM expenses GROUP BY mon),
d AS (SELECT mon, spend, ROUND(spend - LAG(spend) OVER (ORDER BY mon), 2) delta FROM m)
SELECT mon, spend, delta FROM d WHERE delta > 200 ORDER BY delta DESC`);
show("R17 month pct < -20 rows", `WITH m AS (
  SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend
  FROM orders GROUP BY mon),
p AS (SELECT mon, spend, LAG(spend) OVER (ORDER BY mon) prev FROM m)
SELECT mon, spend, prev, ROUND(100.0*(spend-prev)/prev, 1) pct FROM p
WHERE pct < -20 ORDER BY pct`);
show("R18 region rev pct 2dp", `WITH r AS (
  SELECT c.region region, ROUND(SUM(o.total),2) rev
  FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region)
SELECT region, rev, ROUND(100.0*rev/SUM(rev) OVER (), 2) pct2,
  ROUND(100.0*rev/SUM(rev) OVER (), 0) pct0 FROM r ORDER BY rev DESC`);
show("R19 stock < name rowcount", `SELECT COUNT(*) n FROM products WHERE stock < name`);
show("R20 supplier value bands", `WITH s AS (
  SELECT sup.name name, COUNT(p.id) items, ROUND(SUM(p.price),2) value
  FROM suppliers sup JOIN products p ON p.supplier_id = sup.id GROUP BY sup.id)
SELECT name, items, value, NTILE(3) OVER (ORDER BY value DESC) band FROM s ORDER BY band, value DESC`);
show("R21 rating gaps 1dp", `WITH s AS (
  SELECT name, rating, RANK() OVER (ORDER BY rating DESC) rk,
         MAX(rating) OVER () top_rating
  FROM suppliers)
SELECT name, rating, rk, ROUND(top_rating - rating, 1) gap FROM s ORDER BY rk LIMIT 4`);
show("R22 prev_spend one-pass head", `SELECT c.name, ROUND(SUM(o.total), 2) spend,
  RANK() OVER (ORDER BY SUM(o.total) DESC) rk,
  ROUND(LAG(SUM(o.total)) OVER (ORDER BY SUM(o.total) DESC), 2) prev_spend
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.id ORDER BY rk LIMIT 5`);
show("R23 pending shares full 14", `SELECT o.id, o.total,
  ROUND(100.0*o.total/SUM(o.total) OVER (), 2) share2
FROM orders o WHERE o.status = 'pending' ORDER BY o.total DESC`);
show("R24 month running digits check", `WITH m AS (
  SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend
  FROM orders GROUP BY mon)
SELECT ROUND(SUM(spend) OVER (ORDER BY mon), 2) run FROM m WHERE mon = '2025-02'`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done, copy removed");
