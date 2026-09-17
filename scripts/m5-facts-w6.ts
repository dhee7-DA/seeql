/// <reference types="bun-types" />
// m5-c6 probe tool (w6 window pipelines) — read-only COPY of db/custom.db, self-deleting.
// Every figure used in cases-w6.ts that is not already in a committed receipt
// (m5-facts-r4/r6/c3/w3/w5.out) must trace to this output.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5w6.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label}`);
  console.log(JSON.stringify(q(sql)));
};

console.log("sqlite", db.query("SELECT sqlite_version() AS v").get());

// ---- signup waves (funnel) -------------------------------------------------
show("signup month census + rank", `WITH m AS (
  SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n
  FROM customers GROUP BY mon)
SELECT mon, n, RANK() OVER (ORDER BY n DESC) rk FROM m ORDER BY mon`);
show("signup waves share of book", `WITH m AS (
  SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n
  FROM customers GROUP BY mon)
SELECT mon, n, COUNT(*) OVER () waves,
  ROUND(100.0 * n / SUM(n) OVER (), 2) share
FROM m ORDER BY n DESC, mon`);

// ---- status pots / champions ----------------------------------------------
show("status pots + rank", `WITH s AS (
  SELECT status, ROUND(SUM(total), 2) pot, COUNT(*) n
  FROM orders GROUP BY status)
SELECT status, pot, n, RANK() OVER (ORDER BY pot DESC) rk FROM s ORDER BY rk`);
show("status champions ranked", `WITH c AS (
  SELECT status, id, total,
    ROW_NUMBER() OVER (PARTITION BY status ORDER BY total DESC, id) rn
  FROM orders)
SELECT status, id, total,
  RANK() OVER (ORDER BY total DESC) rk
FROM c WHERE rn = 1 ORDER BY rk`);

// ---- pending money per customer --------------------------------------------
show("pending money per customer", `WITH p AS (
  SELECT customer_id, ROUND(SUM(total), 2) pend, COUNT(*) n
  FROM orders WHERE status = 'pending' GROUP BY customer_id)
SELECT c.name, p.pend, p.n,
  RANK() OVER (ORDER BY p.pend DESC) rk
FROM p JOIN customers c ON c.id = p.customer_id ORDER BY rk`);
show("pending per-customer headcount", `SELECT COUNT(DISTINCT customer_id) custs,
  ROUND(SUM(total), 2) pot FROM orders WHERE status = 'pending'`);

// ---- invoice ladder --------------------------------------------------------
show("invoice amount ladder head+tail", `WITH l AS (
  SELECT id, number, status, amount_cents / 100.0 amt,
    ROW_NUMBER() OVER (ORDER BY amount_cents DESC) rn
  FROM invoices)
SELECT id, number, status, ROUND(amt, 2) amt, rn FROM l WHERE rn <= 3 OR rn >= 26 ORDER BY rn`);
show("void invoice rank", `WITH l AS (
  SELECT id, number, status, amount_cents / 100.0 amt,
    ROW_NUMBER() OVER (ORDER BY amount_cents DESC) rn
  FROM invoices)
SELECT id, number, status, ROUND(amt, 2) amt, rn FROM l WHERE status != 'paid' ORDER BY rn`);
show("invoice status count rank", `WITH s AS (
  SELECT status, COUNT(*) n FROM invoices GROUP BY status)
SELECT status, n, RANK() OVER (ORDER BY n DESC) rk FROM s ORDER BY rk`);

// ---- per-customer champions ranked globally --------------------------------
show("customer champions global rank", `WITH best AS (
  SELECT customer_id, id, total,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id) rn
  FROM orders)
SELECT c.name, b.id, b.total,
  RANK() OVER (ORDER BY b.total DESC) rk
FROM best b JOIN customers c ON c.id = b.customer_id
WHERE b.rn = 1 ORDER BY rk`);

// ---- mean paints -----------------------------------------------------------
show("customer mean paint + above count", `WITH s AS (
  SELECT c.name, ROUND(SUM(o.total), 2) spend,
    ROUND(AVG(SUM(o.total)) OVER (), 2) mean
  FROM orders o JOIN customers c ON c.id = o.customer_id
  GROUP BY c.id)
SELECT (SELECT COUNT(*) FROM s WHERE spend > mean) above,
  (SELECT mean FROM s WHERE name = 'Alice Chen') mean,
  (SELECT MIN(spend) FROM s WHERE spend > mean) lowest_above,
  (SELECT MAX(spend) FROM s WHERE spend <= mean) biggest_below`);
show("region mean paint + above count", `WITH s AS (
  SELECT c.region, ROUND(SUM(o.total), 2) spend,
    ROUND(AVG(SUM(o.total)) OVER (), 2) mean
  FROM orders o JOIN customers c ON c.id = o.customer_id
  GROUP BY c.region)
SELECT region, spend, mean, (spend > mean) above FROM s ORDER BY spend DESC`);
show("price mean paint + club ranks", `WITH s AS (
  SELECT name, price, ROUND(AVG(price) OVER (), 2) mean,
    RANK() OVER (ORDER BY price DESC) rk
  FROM products)
SELECT name, price, mean, rk FROM s WHERE price > mean ORDER BY rk`);

// ---- concentration shares --------------------------------------------------
show("top-2 category shelves share", `WITH c AS (
  SELECT category, ROUND(SUM(price), 2) value,
    ROW_NUMBER() OVER (ORDER BY SUM(price) DESC) rn
  FROM products GROUP BY category)
SELECT ROUND(SUM(value), 2) top2_value,
  ROUND(100.0 * SUM(value) / SUM(SUM(value)) OVER (), 2) share2,
  ROUND(100.0 * SUM(value) / SUM(SUM(value)) OVER (), 1) share2_1dp
FROM c WHERE rn <= 2`);
show("top-3 stock piles share", `WITH s AS (
  SELECT name, stock, ROW_NUMBER() OVER (ORDER BY stock DESC) rn
  FROM products)
SELECT SUM(stock) top3_units,
  ROUND(100.0 * SUM(stock) / SUM(SUM(stock)) OVER (), 2) share2,
  ROUND(100.0 * SUM(stock) / SUM(SUM(stock)) OVER (), 1) share1
FROM s WHERE rn <= 3`);
show("top-8 priciest share", `WITH s AS (
  SELECT name, price, ROW_NUMBER() OVER (ORDER BY price DESC) rn
  FROM products)
SELECT ROUND(SUM(price), 2) top8_value,
  ROUND(100.0 * SUM(price) / SUM(SUM(price)) OVER (), 2) share2,
  ROUND(100.0 * SUM(price) / SUM(SUM(price)) OVER (), 1) share1
FROM s WHERE rn <= 8`);
show("exposure top-3 share", `WITH x AS (
  SELECT c.name, ROUND(SUM(o.total), 2) exposure,
    ROW_NUMBER() OVER (ORDER BY SUM(o.total) DESC) rn
  FROM orders o JOIN customers c ON c.id = o.customer_id
  WHERE o.status IN ('cancelled', 'pending') GROUP BY c.id)
SELECT ROUND(SUM(exposure), 2) top3_exposure,
  ROUND(100.0 * SUM(exposure) / SUM(SUM(exposure)) OVER (), 2) share2,
  ROUND(100.0 * SUM(exposure) / SUM(SUM(exposure)) OVER (), 1) share1
FROM x WHERE rn <= 3`);

// ---- opex vs revenue monthly ratio -----------------------------------------
show("opex vs revenue monthly ratio", `WITH r AS (
  SELECT strftime('%Y-%m', created_at) mon, SUM(total) rev
  FROM orders GROUP BY mon),
e AS (
  SELECT strftime('%Y-%m', spent_on) mon, SUM(amount_cents) / 100.0 opex
  FROM expenses GROUP BY mon)
SELECT r.mon, ROUND(r.rev, 2) rev, ROUND(e.opex, 2) opex,
  ROUND(100.0 * e.opex / r.rev, 1) ratio,
  RANK() OVER (ORDER BY e.opex / r.rev DESC) rk
FROM r JOIN e ON e.mon = r.mon ORDER BY rk LIMIT 4`);

// ---- cohort revenue league -------------------------------------------------
show("cohort revenue league", `WITH f AS (
  SELECT customer_id, strftime('%Y-%m', MIN(created_at)) cohort,
    SUM(total) spend
  FROM orders GROUP BY customer_id),
c AS (
  SELECT cohort, ROUND(SUM(spend), 2) rev, COUNT(*) members
  FROM f GROUP BY cohort)
SELECT cohort, members, rev,
  ROUND(100.0 * rev / SUM(rev) OVER (), 1) share,
  RANK() OVER (ORDER BY rev DESC) rk
FROM c ORDER BY rk`);

// ---- supplier divergence + gaps --------------------------------------------
show("supplier stock-rk vs value-rk", `WITH s AS (
  SELECT sup.name,
    SUM(p.stock) stock_sum, ROUND(SUM(p.price), 2) value
  FROM suppliers sup JOIN products p ON p.supplier_id = sup.id
  GROUP BY sup.id)
SELECT name, stock_sum, value,
  RANK() OVER (ORDER BY stock_sum DESC) stock_rk,
  RANK() OVER (ORDER BY value DESC) value_rk
FROM s ORDER BY stock_rk`);
show("supplier rating gaps all", `WITH s AS (
  SELECT name, rating, MAX(rating) OVER () top_rating,
    RANK() OVER (ORDER BY rating DESC) rk
  FROM suppliers)
SELECT name, rating, rk, ROUND(top_rating - rating, 1) gap FROM s ORDER BY rk`);

// ---- pipeline asserts ------------------------------------------------------
show("month staged bar+crowd+rank rows", `WITH m AS (
  SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total), 2) spend
  FROM orders GROUP BY mon),
p AS (
  SELECT mon, spend,
    MAX(spend) OVER () bar,
    COUNT(*) OVER () waves,
    RANK() OVER (ORDER BY spend DESC) rk
  FROM m)
SELECT mon, spend, bar, waves, rk FROM p WHERE mon IN ('2024-11', '2025-02') ORDER BY mon`);
show("month rung 2024-06 verify", `WITH m AS (
  SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total), 2) spend
  FROM orders GROUP BY mon)
SELECT mon, ROUND(SUM(spend) OVER (ORDER BY mon), 2) run FROM m WHERE mon = '2024-06'`);
show("category sku count ranks", `WITH s AS (
  SELECT category, COUNT(*) n FROM products GROUP BY category)
SELECT category, n, RANK() OVER (ORDER BY n DESC) rk FROM s ORDER BY rk, category`);
show("price cellar rn16", `WITH s AS (
  SELECT id, name, price, ROW_NUMBER() OVER (ORDER BY price) rn
  FROM products)
SELECT id, name, price, rn FROM s WHERE rn >= 15 ORDER BY rn`);
show("spend league midpoint", `WITH s AS (
  SELECT c.name, ROUND(SUM(o.total), 2) spend,
    RANK() OVER (ORDER BY SUM(o.total) DESC) rk
  FROM orders o JOIN customers c ON c.id = o.customer_id
  GROUP BY c.id)
SELECT name, spend, rk FROM s WHERE rk BETWEEN 8 AND 10 ORDER BY rk`);
show("global top-5 orders", `WITH s AS (
  SELECT id, total, ROW_NUMBER() OVER (ORDER BY total DESC) rn
  FROM orders)
SELECT id, total, rn FROM s WHERE rn <= 5 ORDER BY rn`);
show("supplier piles cut rk<=4", `WITH p AS (
  SELECT sup.name, SUM(p.stock) pile,
    RANK() OVER (ORDER BY SUM(p.stock) DESC) rk
  FROM products p JOIN suppliers sup ON sup.id = p.supplier_id
  GROUP BY sup.id)
SELECT name, pile, rk FROM p ORDER BY rk`);
show("supplier value league full", `WITH v AS (
  SELECT sup.name, ROUND(SUM(p.price), 2) value
  FROM suppliers sup JOIN products p ON p.supplier_id = sup.id
  GROUP BY sup.id)
SELECT name, value, RANK() OVER (ORDER BY value DESC) rk FROM v ORDER BY rk`);
show("status count ranks", `WITH s AS (
  SELECT status, COUNT(*) n FROM orders GROUP BY status)
SELECT status, n, RANK() OVER (ORDER BY n DESC) rk FROM s ORDER BY rk`);
show("expense bill-count ranks", `WITH s AS (
  SELECT category, COUNT(*) n FROM expenses GROUP BY category)
SELECT category, n, RANK() OVER (ORDER BY n DESC) rk FROM s ORDER BY rk`);
show("floor lifts club", `WITH s AS (
  SELECT name, price, MIN(price) OVER () floor_price,
    ROUND(price - MIN(price) OVER (), 2) lift
  FROM products)
SELECT name, price, floor_price, lift FROM s WHERE lift >= 100 ORDER BY lift DESC`);
show("below-mean stock deepest", `WITH s AS (
  SELECT name, stock, ROUND(AVG(stock) OVER (), 1) avg_stock
  FROM products)
SELECT name, stock, avg_stock FROM s
WHERE stock < avg_stock ORDER BY stock DESC LIMIT 2`);
show("above-mean price club full", `WITH s AS (
  SELECT name, price, ROUND(AVG(price) OVER (), 2) mean
  FROM products)
SELECT name, price, mean FROM s WHERE price > mean ORDER BY price DESC`);

// ---- round 2: case-specific receipts ---------------------------------------
show("R2 order 57 owner", `SELECT o.id, c.name, o.total, o.status
FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.id = 57`);
show("R2 payment method shares", `WITH m AS (
  SELECT method, COUNT(*) n, SUM(amount_cents) cents
  FROM payments GROUP BY method)
SELECT method, n, ROUND(cents / 100.0, 2) paid,
  ROUND(100.0 * cents / SUM(cents) OVER (), 1) pct,
  RANK() OVER (ORDER BY cents DESC) rk
FROM m ORDER BY rk`);
show("R2 pending-only top-3 combined", `WITH x AS (
  SELECT c.name, ROUND(SUM(o.total), 2) exposure,
    ROW_NUMBER() OVER (ORDER BY SUM(o.total) DESC) rn,
    SUM(SUM(o.total)) OVER () pot
  FROM orders o JOIN customers c ON c.id = o.customer_id
  WHERE o.status = 'pending' GROUP BY c.id)
SELECT ROUND(SUM(100.0 * exposure / pot), 1) combined FROM x WHERE rn <= 3`);
show("R2 exposure MAX-pot shares top3", `WITH x AS (
  SELECT c.name, ROUND(SUM(o.total), 2) exposure,
    ROW_NUMBER() OVER (ORDER BY SUM(o.total) DESC) rn
  FROM orders o JOIN customers c ON c.id = o.customer_id
  WHERE o.status IN ('cancelled', 'pending') GROUP BY c.id)
SELECT name, exposure, rn, ROUND(100.0 * exposure / MAX(exposure) OVER (), 1) rebased
FROM x WHERE rn <= 3 ORDER BY rn`);
show("R2 top-8 boundary row + combined", `WITH s AS (
  SELECT name, price, ROW_NUMBER() OVER (ORDER BY price DESC) rn,
    SUM(price) OVER () pot
  FROM products)
SELECT (SELECT name || ' | ' || price FROM s WHERE rn = 8) boundary,
  (SELECT ROUND(100.0 * price / pot, 1) FROM s WHERE rn = 8) boundary_share,
  (SELECT ROUND(100.0 * SUM(price) / MAX(pot), 1) FROM s WHERE rn <= 8) top8_combined`);
show("R2 catalog bottom-2 / top-3 combined", `WITH c AS (
  SELECT category, ROUND(SUM(price), 2) value,
    ROW_NUMBER() OVER (ORDER BY SUM(price) DESC) rn,
    SUM(SUM(price)) OVER () pot
  FROM products GROUP BY category)
SELECT
  (SELECT ROUND(SUM(100.0 * value / pot), 1) FROM c WHERE rn >= 6) bottom2,
  (SELECT ROUND(SUM(100.0 * value / pot), 1) FROM c WHERE rn <= 3) top3`);
show("R2 stock ASC top-3 share", `WITH s AS (
  SELECT stock, ROW_NUMBER() OVER (ORDER BY stock) rn, SUM(stock) OVER () pot
  FROM products)
SELECT ROUND(100.0 * SUM(stock) / MAX(pot), 1) share FROM s WHERE rn <= 3`);
show("R2 vendor MAX-pot rebase Skyline", `WITH v AS (
  SELECT vendor, SUM(amount_cents) cents, MAX(SUM(amount_cents)) OVER () top
  FROM expenses GROUP BY vendor)
SELECT vendor, ROUND(100.0 * cents / top, 1) rebased FROM v WHERE vendor = 'Skyline Travel'`);
show("R2 rn<=5 exposure combined", `WITH x AS (
  SELECT c.name, ROUND(SUM(o.total), 2) exposure,
    ROW_NUMBER() OVER (ORDER BY SUM(o.total) DESC) rn,
    SUM(SUM(o.total)) OVER () pot
  FROM orders o JOIN customers c ON c.id = o.customer_id
  WHERE o.status IN ('cancelled', 'pending') GROUP BY c.id)
SELECT ROUND(SUM(100.0 * exposure / pot), 1) combined FROM x WHERE rn <= 5`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done, copy removed");
