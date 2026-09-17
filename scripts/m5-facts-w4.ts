/// <reference types="bun-types" />
// m5-c4 probe tool — w4 LAG & LEAD wave (cs-1317..1352). Read-only COPY of
// db/custom.db, self-deleting. Every figure used in cases-w4.ts must trace to
// this output or to the committed scripts/m5-facts-r4.out. Run:
//   bun scripts/m5-facts-w4.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5w4.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string, max = 30) => {
  const rows = q(sql) as Record<string, unknown>[];
  const shown = rows.slice(0, max).map(r => Object.values(r).map(v =>
    v === null ? "NULL" : String(v)
  ).join(" | "));
  console.log(`\n== ${label}  (${rows.length} rows)`);
  shown.forEach(s => console.log("  " + s));
  if (rows.length > max) console.log(`  … +${rows.length - max} more`);
};
const err = (label: string, sql: string) => {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const head = rows.slice(0, 3).map(r => Object.values(r).map(v => v === null ? "NULL" : String(v)).join(" | "));
    console.log(`\n[NO ERR ${label}]  ${rows.length} rows  ${head.join(" ;; ")}`);
  } catch (e) {
    console.log(`\n[ERR ${label}]  ${e instanceof Error ? e.message : e}`);
  }
};

console.log("sqlite", (db.query("SELECT sqlite_version() AS v").get() as { v: string }).v);

// ---------- S. schemas (distractor-error groundwork) ----------
for (const t of ["orders", "products", "expenses", "invoices", "payments", "customers", "suppliers"]) {
  const cols = (q(`PRAGMA table_info(${t})`) as Record<string, unknown>[]).map(r => String(r.name));
  console.log(`\n== S ${t}: ${cols.join(", ")}`);
}

// ---------- C. the 36 case fills (correct answers) ----------
// cs-1317
show("C1317 fill", `SELECT id, name, created_at,
       LEAD(name) OVER (ORDER BY id) AS next_signup
FROM customers
ORDER BY id
LIMIT 5`);
// cs-1318
show("C1318 fill", `SELECT id, name, price,
       LEAD(price) OVER (ORDER BY price) AS next_price
FROM products
ORDER BY price
LIMIT 3`);
// cs-1319
show("C1319 fill", `WITH monthly AS (
  SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS spend
  FROM orders GROUP BY mon
)
SELECT mon, spend,
       ROUND(spend - LAG(spend, 1) OVER (ORDER BY mon), 2) AS delta
FROM monthly
ORDER BY mon
LIMIT 3`);
// cs-1320
show("C1320 fill", `SELECT id, customer_id, total,
       LAG(total) OVER (ORDER BY id) AS prev_total
FROM orders
WHERE status = 'pending'
ORDER BY id
LIMIT 5`);
// cs-1321
show("C1321 fill", `SELECT id, name, stock,
       LEAD(stock) OVER (ORDER BY stock) AS next_stock
FROM products
ORDER BY stock
LIMIT 5`);
// cs-1322
show("C1322 fill", `SELECT id, name, rating,
       LAG(rating, 1) OVER (ORDER BY rating) AS below,
       LEAD(rating) OVER (ORDER BY rating) AS above
FROM suppliers
ORDER BY rating`);
// cs-1323
show("C1323 fill", `WITH monthly AS (
  SELECT strftime('%Y-%m', spent_on) AS mon, ROUND(SUM(amount_cents) / 100.0, 2) AS spend
  FROM expenses GROUP BY mon
)
SELECT mon, spend,
       ROUND(spend - LAG(spend) OVER (ORDER BY mon), 2) AS delta
FROM monthly
ORDER BY mon
LIMIT 4`);
// cs-1324
show("C1324 fill", `WITH signups AS (
  SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS joined
  FROM customers GROUP BY mon
)
SELECT mon, joined,
       LEAD(joined, 1, 0) OVER (ORDER BY mon) AS next_wave
FROM signups
ORDER BY mon`);
// cs-1325
show("C1325 fill", `SELECT id, created_at, total,
       LEAD(created_at, 1) OVER (ORDER BY created_at, id) AS next_cancel
FROM orders
WHERE status = 'cancelled'
ORDER BY created_at, id`);
// cs-1326
show("C1326 fill", `SELECT id, name, price,
       LAG(price) OVER (ORDER BY price, id) AS cheaper
FROM products
WHERE price <= 34.5
ORDER BY price, id`);
// cs-1327
show("C1327 fill", `SELECT id, name, stock,
       LEAD(stock) OVER (ORDER BY stock, id) - stock AS headroom
FROM products
WHERE stock <= 150 AND stock >= 60
ORDER BY stock, id`);
// cs-1328
show("C1328 fill", `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n
  FROM orders GROUP BY mon
)
SELECT mon, n, n - LAG(n) OVER (ORDER BY mon) AS dn
FROM m
ORDER BY mon`);
// cs-1329
show("C1329 fill", `WITH monthly AS (
  SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS spend
  FROM orders GROUP BY mon
), swung AS (
  SELECT mon, spend, LAG(spend) OVER (ORDER BY mon) AS prev_spend FROM monthly
), deltas AS (
  SELECT mon, spend, prev_spend, spend - prev_spend AS delta FROM swung
)
SELECT mon, spend, prev_spend, ROUND(delta, 2) AS delta
FROM deltas WHERE delta < 0 ORDER BY mon`);
// cs-1330
show("C1330 fill", `WITH refunded AS (
  SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS refunded
  FROM orders WHERE status = 'cancelled' GROUP BY mon
), swung AS (
  SELECT mon, refunded, LAG(refunded) OVER (ORDER BY mon) AS prev_refunded FROM refunded
)
SELECT mon, refunded, prev_refunded, ROUND(refunded - prev_refunded, 2) AS delta
FROM swung ORDER BY mon`);
// cs-1331
show("C1331 fill", `SELECT id, name, price,
       LEAD(price) OVER (ORDER BY price, id) AS next_price
FROM products
WHERE price >= 42.5
ORDER BY price, id`);
// cs-1332
show("C1332 fill", `WITH g AS (
  SELECT id, customer_id, created_at, total,
         julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS gap
  FROM orders
)
SELECT id, customer_id, created_at, total
FROM g
WHERE gap = 0
ORDER BY created_at, id`);
// cs-1333
show("C1333 fill", `SELECT id, created_at, total,
       CAST(julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS INTEGER) AS gap_d
FROM orders
WHERE customer_id = 1
ORDER BY created_at, id`);
// cs-1334
show("C1334 fill", `WITH ladder AS (
  SELECT p.id, p.name, s.name AS supplier, p.price,
         LAG(p.price) OVER (PARTITION BY s.id ORDER BY p.price) AS cheaper_in_supplier
  FROM products p JOIN suppliers s ON s.id = p.supplier_id
)
SELECT supplier, name, price, cheaper_in_supplier
FROM ladder
WHERE cheaper_in_supplier IS NOT NULL
ORDER BY supplier, price`);
// cs-1335
show("C1335 fill", `WITH monthly AS (
  SELECT strftime('%Y-%m', spent_on) AS mon, ROUND(SUM(amount_cents) / 100.0, 2) AS spend
  FROM expenses GROUP BY mon
), swung AS (
  SELECT mon, spend, ROUND(spend - LAG(spend) OVER (ORDER BY mon), 2) AS delta FROM monthly
)
SELECT mon, spend, delta FROM swung WHERE delta > 400 ORDER BY mon`);
// cs-1336
show("C1336 fill", `WITH banded AS (
  SELECT id, name, stock,
         stock - LAG(stock) OVER (ORDER BY stock, id) AS step_down
  FROM products
)
SELECT id, name, stock, step_down
FROM banded
WHERE step_down >= 30
ORDER BY stock DESC, id`);
// cs-1337
show("C1337 fill", `WITH laddered AS (
  SELECT id, name, region, rating,
         LEAD(rating) OVER (PARTITION BY region ORDER BY rating, id) AS above
  FROM suppliers
)
SELECT region, COUNT(*) AS n, COUNT(above) AS with_above
FROM laddered
GROUP BY region
HAVING with_above = 1
ORDER BY region`);
// cs-1338
show("C1338 fill", `WITH steps AS (
  SELECT id, name, price, LEAD(price) OVER (ORDER BY price, id) AS next_price
  FROM products
)
SELECT id, name, price, next_price, ROUND(next_price - price, 2) AS step_up
FROM steps
WHERE next_price IS NOT NULL AND next_price - price >= 10.99
ORDER BY price, id`);
// cs-1339
show("C1339 fill", `WITH monthly AS (
  SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS spend
  FROM orders GROUP BY mon
), ratioed AS (
  SELECT mon, spend, ROUND(100.0 * spend / LAG(spend) OVER (ORDER BY mon), 1) AS pct_of_prev
  FROM monthly
)
SELECT mon, spend, pct_of_prev
FROM ratioed
WHERE pct_of_prev >= 100
ORDER BY pct_of_prev DESC`);
// cs-1340
show("C1340 fill", `WITH c AS (
  SELECT id, created_at,
         CAST(julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS INTEGER) AS gap_d
  FROM orders WHERE status = 'cancelled'
)
SELECT id, created_at, gap_d FROM c ORDER BY created_at, id`);
// cs-1341
show("C1341 fill", `WITH monthly AS (
  SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS spend
  FROM orders GROUP BY mon
)
SELECT mon, spend, LAG(spend, 1, 0) OVER (ORDER BY mon) AS prev_spend
FROM monthly
ORDER BY mon
LIMIT 3`);
// cs-1342
show("C1342 fill", `SELECT id, total,
       LAG(total, -1) OVER (ORDER BY id) AS neighbor
FROM orders
ORDER BY id
LIMIT 4`);
// cs-1343
show("C1343 fill", `WITH walked AS (
  SELECT id, created_at, total,
         CAST(julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS INTEGER) AS gap_d
  FROM orders WHERE customer_id = 1
)
SELECT id, created_at, total, gap_d
FROM walked
WHERE gap_d >= 20
ORDER BY created_at, id`);
// cs-1344
show("C1344 fill", `SELECT c.name, o.id, o.created_at, o.total,
       CAST(julianday(o.created_at) - julianday(LAG(o.created_at) OVER (ORDER BY o.created_at, o.id)) AS INTEGER) AS wait_d
FROM orders o JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'pending'
ORDER BY o.created_at, o.id`);
// cs-1345
show("C1345 fill", `WITH rent AS (
  SELECT id, spent_on, amount_cents / 100.0 AS amt,
         CAST(julianday(spent_on) - julianday(LAG(spent_on) OVER (PARTITION BY category ORDER BY spent_on)) AS INTEGER) AS gap_d
  FROM expenses
  WHERE category = 'Rent'
)
SELECT id, spent_on, amt, gap_d
FROM rent
WHERE gap_d IS NOT NULL
ORDER BY spent_on`);
// cs-1346
show("C1346 fill", `WITH s AS (
  SELECT id, name, created_at,
         julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS gap
  FROM customers
)
SELECT id, name, created_at, CAST(gap AS INTEGER) AS gap_days
FROM s
WHERE gap IS NOT NULL
ORDER BY created_at, id`);
// cs-1347
show("C1347 fill", `WITH ranked AS (
  SELECT id, name, category, price,
         LEAD(price) OVER (PARTITION BY category ORDER BY price) AS neighbor_price
  FROM products
)
SELECT category, name, price
FROM ranked
WHERE neighbor_price IS NULL
ORDER BY category, price`);
// cs-1348
show("C1348 fill", `WITH monthly AS (
  SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS orders
  FROM orders GROUP BY mon
), d AS (
  SELECT mon, orders, orders - LAG(orders) OVER (ORDER BY mon) AS d_orders
  FROM monthly
)
SELECT mon, orders, d_orders
FROM d
WHERE d_orders = -2
ORDER BY mon`);
// cs-1349
show("C1349 fill", `WITH walked AS (
  SELECT id, customer_id, total,
         total - LAG(total) OVER (PARTITION BY customer_id ORDER BY id) AS swing
  FROM orders
)
SELECT customer_id, id, total, ROUND(swing, 2) AS swing
FROM walked
WHERE swing >= 500
ORDER BY customer_id, id`);
// cs-1350
show("C1350 fill", `SELECT i.customer_id, c.name, i.number, i.amount_cents / 100.0 AS amt,
       LAG(i.amount_cents) OVER (ORDER BY i.issued_on) / 100.0 AS prev_amt
FROM invoices i
JOIN customers c ON c.id = i.customer_id
WHERE c.id = 1
ORDER BY i.issued_on`);
// cs-1351
show("C1351 fill", `WITH laddered AS (
  SELECT s.id, s.name, s.region, s.rating,
         LEAD(s.rating) OVER (PARTITION BY region ORDER BY rating, s.id) AS above
  FROM suppliers s
)
SELECT region, name, rating
FROM laddered
WHERE above IS NULL
ORDER BY region, rating`);
// cs-1352
show("C1352 fill", `SELECT id, customer_id, total,
       LAG(total, 1) OVER (ORDER BY total DESC, id) AS bigger_total
FROM orders
ORDER BY total DESC, id
LIMIT 6`);

// ---------- U. distractor-consequence probes (cited in why/walkthrough) ----------
err("U1 LIMIT customer_id", `SELECT id FROM orders WHERE status='pending' ORDER BY id LIMIT customer_id`);
err("U2 LAG(spend, spend) col as offset", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total),2) AS spend FROM orders GROUP BY mon) SELECT mon, ROUND(spend - LAG(spend, spend) OVER (ORDER BY mon), 2) d FROM m LIMIT 3`);
err("U3 LEAD(created_at, total) col as offset", `SELECT id, LEAD(created_at, total) OVER (ORDER BY id) n FROM orders LIMIT 3`);
err("U4 LAG(total, total) col as offset", `SELECT id, LAG(total, total) OVER (ORDER BY id) n FROM orders LIMIT 3`);
show("U5 strftime('%Y-%m', 100)", `SELECT strftime('%Y-%m', 100) x, strftime('%Y-%m', 14) y`);
err("U6 ROUND(x,'%m')", `SELECT ROUND(-122.32999999999993, '%m') r`);
err("U7 PARTITION BY 2 ordinal", `SELECT id, customer_id, LAG(total) OVER (PARTITION BY 2 ORDER BY id) p FROM orders LIMIT 3`);
err("U8 PARTITION BY 0", `SELECT id, LAG(total) OVER (PARTITION BY 0 ORDER BY id) p FROM orders LIMIT 3`);
err("U9 PARTITION BY 400 const", `SELECT id, LAG(total) OVER (PARTITION BY 400 ORDER BY id) p FROM orders LIMIT 3`);
err("U10 LIMIT total", `SELECT id FROM orders ORDER BY id LIMIT total`);
err("U11 LEAD(joined,1,joined) default col", `WITH s AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS joined FROM customers GROUP BY mon) SELECT mon, LEAD(joined, 1, joined) OVER (ORDER BY mon) n FROM s ORDER BY mon DESC LIMIT 2`);
err("U12 strftime(spend, created_at) alias as fmt", `SELECT strftime(spend, created_at) x FROM (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total),2) AS spend FROM orders GROUP BY mon) LIMIT 2`);
err("U13 name AS alias ref in WHERE-expr scope", `SELECT total - LAG(total) OVER (ORDER BY id) d FROM orders ORDER BY id LIMIT 2`);
show("U14 cancelled by id vs created_at,id order", `SELECT id, created_at FROM orders WHERE status='cancelled' ORDER BY id`);
show("U15 gap = customer_id rows", `WITH g AS (SELECT id, customer_id, julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS gap FROM orders) SELECT id, customer_id, gap FROM g WHERE gap = customer_id`);
show("U16 gap = 2 count", `WITH g AS (SELECT julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS gap FROM orders) SELECT COUNT(*) n FROM g WHERE gap = 2`);
show("U17 per-customer gap = 2 count", `WITH g AS (SELECT julianday(created_at) - julianday(LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id)) AS gap FROM orders) SELECT COUNT(*) n FROM g WHERE gap = 2`);
show("U18 per-customer gap = 3 count", `WITH g AS (SELECT julianday(created_at) - julianday(LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id)) AS gap FROM orders) SELECT COUNT(*) n FROM g WHERE gap = 3`);
show("U19 status = total count", `SELECT COUNT(*) n FROM orders WHERE status = total`);
show("U20 c.id = i.id join rows", `SELECT COUNT(*) n FROM invoices i JOIN customers c ON c.id = i.id`);
show("U21 WHERE c.id = i.id rows", `SELECT i.id, i.customer_id FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE c.id = i.id`);
show("U22 LAG(total,1) OVER (ORDER BY total ASC) head", `SELECT id, total, LAG(total, 1) OVER (ORDER BY total ASC, id) AS smaller_total FROM orders ORDER BY total DESC, id LIMIT 3`);
show("U23 LAG(total,0) echo head", `SELECT id, total, LAG(total, 0) OVER (ORDER BY total DESC, id) AS self_total FROM orders ORDER BY total DESC, id LIMIT 3`);
show("U24 FIRST_VALUE rating per region counts", `WITH laddered AS (SELECT id, name, region, rating, FIRST_VALUE(rating) OVER (PARTITION BY region ORDER BY rating, id) AS above FROM suppliers) SELECT region, COUNT(*) n, COUNT(above) wa FROM laddered GROUP BY region HAVING wa = 1 ORDER BY region`);
show("U25 SUM(rating) running per region counts", `WITH laddered AS (SELECT id, name, region, rating, SUM(rating) OVER (PARTITION BY region ORDER BY rating, id) AS above FROM suppliers) SELECT region, COUNT(*) n, COUNT(above) wa FROM laddered GROUP BY region HAVING wa = 1 ORDER BY region`);
show("U26 %m bucket census", `SELECT strftime('%m', created_at) mon, COUNT(*) n FROM orders GROUP BY mon ORDER BY mon`);
show("U27 '%Y' bucket census", `SELECT strftime('%Y', created_at) mon, COUNT(*) n FROM orders GROUP BY mon ORDER BY mon`);
show("U28 swing >= 0 count", `WITH walked AS (SELECT id, customer_id, total, total - LAG(total) OVER (PARTITION BY customer_id ORDER BY id) AS swing FROM orders) SELECT COUNT(*) n FROM walked WHERE swing >= 0`);
show("U29 swing LEAD positive >= 500", `WITH walked AS (SELECT id, customer_id, total, total - LEAD(total) OVER (PARTITION BY customer_id ORDER BY id) AS swing FROM orders) SELECT customer_id, id, ROUND(swing,2) s FROM walked WHERE swing >= 500 ORDER BY customer_id, id`);
show("U30 pct >= 50 count", `WITH monthly AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total),2) AS spend FROM orders GROUP BY mon), r AS (SELECT mon, spend, ROUND(100.0 * spend / LAG(spend) OVER (ORDER BY mon), 1) AS pct_of_prev FROM monthly) SELECT COUNT(*) n FROM r WHERE pct_of_prev >= 50`);
show("U31 steps >= 1 count", `WITH steps AS (SELECT id, name, price, LEAD(price) OVER (ORDER BY price, id) AS next_price FROM products) SELECT COUNT(*) n FROM steps WHERE next_price IS NOT NULL AND next_price - price >= 1`);
show("U32 stock >= name rows", `SELECT COUNT(*) n FROM products WHERE stock <= 150 AND stock >= name`);
show("U33 price <= stock rows", `SELECT COUNT(*) n FROM products WHERE price <= stock`);
show("U34 step_down >= name rows", `WITH banded AS (SELECT id, name, stock, stock - LAG(stock) OVER (ORDER BY stock, id) AS step_down FROM products) SELECT COUNT(*) n FROM banded WHERE step_down >= name`);
show("U35 gap_d >= total rows (Alice)", `WITH walked AS (SELECT id, created_at, total, CAST(julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS INTEGER) AS gap_d FROM orders WHERE customer_id = 1) SELECT COUNT(*) n FROM walked WHERE gap_d >= total`);
show("U36 next-price - price >= stock err?", `WITH steps AS (SELECT id, name, price, stock, LEAD(price) OVER (ORDER BY price, id) AS next_price FROM products) SELECT COUNT(*) n FROM steps WHERE next_price IS NOT NULL AND next_price - price >= stock`);
show("U37 cancelled ORDER BY 'shipped', id head", `SELECT id, created_at FROM orders WHERE status='cancelled' ORDER BY 'shipped', id LIMIT 7`);
show("U38 pending wait first rows (LAG)", `SELECT c.name, o.id, o.created_at, o.total, CAST(julianday(o.created_at) - julianday(LAG(o.created_at) OVER (ORDER BY o.created_at, o.id)) AS INTEGER) AS wait_d FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'pending' ORDER BY o.created_at, o.id LIMIT 4`);
show("U39 CAST gap AS TEXT sample", `SELECT CAST(31.0 AS TEXT) a, CAST(20.0 AS TEXT) b`);
show("U40 id-order tops per category", `WITH ranked AS (SELECT id, name, category, price, LEAD(price) OVER (PARTITION BY category ORDER BY id) AS neighbor_price FROM products) SELECT category, name, price FROM ranked WHERE neighbor_price IS NULL ORDER BY category, price`);
show("U41 name-order tops per category", `WITH ranked AS (SELECT id, name, category, price, LEAD(price) OVER (PARTITION BY category ORDER BY name) AS neighbor_price FROM products) SELECT category, name, price FROM ranked WHERE neighbor_price IS NULL ORDER BY category, price`);
show("U42 LAG bottoms per category", `WITH ranked AS (SELECT id, name, category, price, LAG(price) OVER (PARTITION BY category ORDER BY price) AS neighbor_price FROM products) SELECT category, name, price FROM ranked WHERE neighbor_price IS NULL ORDER BY category, price`);
show("U43 region-partition supplier tops (id order)", `WITH laddered AS (SELECT s.id, s.name, s.region, s.rating, LEAD(s.rating) OVER (PARTITION BY region ORDER BY s.id) AS above FROM suppliers s) SELECT region, name, rating FROM laddered WHERE above IS NULL ORDER BY region, rating`);
show("U44 EURating bottom (LAG tops filter)", `WITH laddered AS (SELECT s.id, s.name, s.region, s.rating, LAG(s.rating) OVER (PARTITION BY region ORDER BY rating, s.id) AS above FROM suppliers s) SELECT region, name, rating FROM laddered WHERE above IS NULL ORDER BY region, rating`);
show("U45 IS NOT NULL flip supplier tops", `WITH laddered AS (SELECT s.id, s.name, s.region, s.rating, LEAD(s.rating) OVER (PARTITION BY region ORDER BY rating, s.id) AS above FROM suppliers s) SELECT region, name, rating FROM laddered WHERE above IS NOT NULL ORDER BY region, rating`);
show("U46 n - LAG(COUNT(*)) err?", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon) SELECT mon, n - LAG(AVG(n)) OVER (ORDER BY mon) dn FROM m LIMIT 2`);
show("U47 n - AVG(n) mix", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon) SELECT mon, n, n - AVG(n) dn FROM m LIMIT 3`);
show("U48 d_orders = 0 count", `WITH monthly AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS orders FROM orders GROUP BY mon), d AS (SELECT mon, orders, orders - LAG(orders) OVER (ORDER BY mon) AS d_orders FROM monthly) SELECT COUNT(*) n FROM d WHERE d_orders = 0`);
show("U49 pending wall by customer_id order head", `SELECT id, total, LAG(total) OVER (ORDER BY customer_id) AS prev_total FROM orders WHERE status='pending' ORDER BY id LIMIT 5`);
show("U50 name-order customer walk head", `SELECT id, name, LEAD(name) OVER (ORDER BY name) AS next_signup FROM customers ORDER BY id LIMIT 5`);
show("U51 region-order customer walk head", `SELECT id, name, LEAD(name) OVER (ORDER BY region) AS next_signup FROM customers ORDER BY id LIMIT 5`);
show("U52 LAG(rating,2) below col", `SELECT id, name, rating, LAG(rating, 2) OVER (ORDER BY rating) AS below FROM suppliers ORDER BY rating`);
show("U53 LAG as above col", `SELECT id, name, rating, LAG(rating, 1) OVER (ORDER BY rating) AS below, LAG(rating) OVER (ORDER BY rating) AS above FROM suppliers ORDER BY rating`);
show("U54 FIRST_VALUE above col", `SELECT id, name, rating, LAG(rating, 1) OVER (ORDER BY rating) AS below, FIRST_VALUE(rating) OVER (ORDER BY rating) AS above FROM suppliers ORDER BY rating`);
show("U55 id-order stock ladder head", `SELECT id, name, stock, LEAD(stock) OVER (ORDER BY id) AS next_stock FROM products ORDER BY stock LIMIT 5`);
show("U56 name-order stock ladder head", `SELECT id, name, stock, LEAD(stock) OVER (ORDER BY name) AS next_stock FROM products ORDER BY stock LIMIT 5`);
show("U57 LIMIT 12 stock ladder", `SELECT id, name, stock, LEAD(stock) OVER (ORDER BY stock) AS next_stock FROM products ORDER BY stock LIMIT 12`);
show("U58 name-ordered rating ladder", `SELECT id, name, rating, LEAD(rating) OVER (ORDER BY rating) AS above FROM suppliers ORDER BY name`);
show("U59 total-ordered rating ladder", `SELECT id, name, MAX(0) z, LEAD(rating) OVER (ORDER BY total) AS above FROM (SELECT id, name, rating, rating AS total FROM suppliers) ORDER BY rating`);
err("U60 LAG(rating, name) text offset", `SELECT LAG(rating, name) OVER (ORDER BY rating) FROM suppliers LIMIT 2`);
err("U61 LEAD(created_at, 3) vs 1 same?", `SELECT id, created_at, LEAD(created_at, 3) OVER (ORDER BY created_at, id) n3 FROM orders WHERE status='cancelled' ORDER BY created_at, id`);
show("U62 LEAD(created_at, id) col offset", `SELECT id, created_at, LEAD(created_at, id) OVER (ORDER BY created_at, id) nc FROM orders WHERE status='cancelled' ORDER BY created_at, id LIMIT 7`);
show("U63 cancelled id-order wall", `SELECT id, created_at, LAG(created_at) OVER (ORDER BY id) p FROM orders WHERE status='cancelled' ORDER BY id`);
show("U64 LAG(spend,2,0) head", `WITH monthly AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total),2) AS spend FROM orders GROUP BY mon) SELECT mon, spend, LAG(spend, 2, 0) OVER (ORDER BY mon) p FROM monthly ORDER BY mon LIMIT 3`);
show("U65 LAG(spend,5,0) head", `WITH monthly AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total),2) AS spend FROM orders GROUP BY mon) SELECT mon, spend, LAG(spend, 5, 0) OVER (ORDER BY mon) p FROM monthly ORDER BY mon LIMIT 3`);
show("U66 LAG(spend,1,spend) default col", `WITH monthly AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total),2) AS spend FROM orders GROUP BY mon) SELECT mon, spend, LAG(spend, 1, spend) OVER (ORDER BY mon) p FROM monthly ORDER BY mon LIMIT 3`);
show("U67 LAG(spend,2,0) full first3", `WITH monthly AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total),2) AS spend FROM orders GROUP BY mon) SELECT mon, spend, LAG(spend, 2, 0) OVER (ORDER BY mon) p FROM monthly ORDER BY mon LIMIT 3`);
show("U68 spend-order months head", `WITH monthly AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total),2) AS spend FROM orders GROUP BY mon) SELECT mon, spend, LAG(spend, 1, 0) OVER (ORDER BY spend) p FROM monthly ORDER BY mon LIMIT 3`);
show("U69 total-order neighbors vs id-order", `SELECT id, total, LAG(total, -1) OVER (ORDER BY total) n FROM orders ORDER BY id LIMIT 4`);
show("U70 id-order-4 limit rows", `SELECT id, total, LAG(total, -1) OVER (ORDER BY id) n FROM orders ORDER BY id LIMIT 4`);
show("U71 Alice >= 10 rows count", `WITH walked AS (SELECT id, created_at, total, CAST(julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS INTEGER) AS gap_d FROM orders WHERE customer_id = 1) SELECT COUNT(*) n FROM walked WHERE gap_d >= 10`);
show("U72 customer 10 orders", `SELECT COUNT(*) n FROM orders WHERE customer_id = 10`);
show("U73 swing ROUND 400dp dust", `WITH walked AS (SELECT id, customer_id, total, total - LAG(total) OVER (PARTITION BY customer_id ORDER BY id) AS swing FROM orders) SELECT customer_id, id, ROUND(swing, 400) s FROM walked WHERE swing >= 500 ORDER BY customer_id, id LIMIT 2`);
show("U74 swing ROUND 0dp", `WITH walked AS (SELECT id, customer_id, total, total - LAG(total) OVER (PARTITION BY customer_id ORDER BY id) AS swing FROM orders) SELECT customer_id, id, ROUND(swing, 0) s FROM walked WHERE swing >= 500 ORDER BY customer_id, id LIMIT 2`);
show("U75 ROUND 1dp step_up head", `WITH steps AS (SELECT id, name, price, LEAD(price) OVER (ORDER BY price, id) AS next_price FROM products) SELECT id, ROUND(next_price - price, 1) s FROM steps WHERE next_price IS NOT NULL AND next_price - price >= 10.99 ORDER BY price, id`);
show("U76 ROUND 20dp step_up head", `WITH steps AS (SELECT id, name, price, LEAD(price) OVER (ORDER BY price, id) AS next_price FROM products) SELECT id, ROUND(next_price - price, 20) s FROM steps WHERE next_price IS NOT NULL AND next_price - price >= 10.99 ORDER BY price, id`);
show("U77 ROUND 20dp delta dust", `WITH monthly AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS spend FROM orders GROUP BY mon) SELECT mon, ROUND(spend - LAG(spend) OVER (ORDER BY mon), 20) d FROM monthly ORDER BY mon LIMIT 3`);
show("U78 ROUND 1dp delta head", `WITH monthly AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS spend FROM orders GROUP BY mon) SELECT mon, ROUND(spend - LAG(spend) OVER (ORDER BY mon), 1) d FROM monthly ORDER BY mon LIMIT 3`);
show("U79 ROUND 0dp delta head", `WITH monthly AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS spend FROM orders GROUP BY mon) SELECT mon, ROUND(spend - LAG(spend) OVER (ORDER BY mon), 0) d FROM monthly ORDER BY mon LIMIT 3`);
show("U80 expenses ORDER BY amount_cents deltas head", `WITH monthly AS (SELECT strftime('%Y-%m', spent_on) AS mon, ROUND(SUM(amount_cents) / 100.0, 2) AS spend FROM expenses GROUP BY mon) SELECT mon, spend, ROUND(spend - LAG(spend) OVER (ORDER BY spend), 2) AS delta FROM monthly ORDER BY mon LIMIT 4`);
show("U81 expense mon by amount bucket garbage", `WITH monthly AS (SELECT strftime('%Y-%m', amount_cents) AS mon, ROUND(SUM(amount_cents) / 100.0, 2) AS spend FROM expenses GROUP BY mon) SELECT COUNT(*) n FROM monthly`);
err("U82 expenses strftime created_at", `WITH monthly AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(amount_cents) / 100.0, 2) AS spend FROM expenses GROUP BY mon) SELECT COUNT(*) n FROM monthly`);
show("U83 expense month 100-bucket", `WITH monthly AS (SELECT strftime('%Y-%m', 100) AS mon, ROUND(SUM(amount_cents) / 100.0, 2) AS spend FROM expenses GROUP BY mon) SELECT mon, spend FROM monthly`);
show("U84 suppliers by name ladder", `SELECT id, name, rating, LAG(rating) OVER (ORDER BY name) AS below FROM suppliers ORDER BY rating`);
show("U85 gap=customer_id vs gap=0 rows differ", `WITH g AS (SELECT id, customer_id, julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS gap FROM orders) SELECT COUNT(*) n FROM g WHERE gap = customer_id AND gap = 0`);
show("U86 ORDER BY total ASC outer desc first3", `SELECT id, total, LAG(total, 1) OVER (ORDER BY total ASC, id) AS bigger_total FROM orders ORDER BY total DESC, id LIMIT 3`);
show("U87 next total pending (LEAD flip) head", `SELECT id, total, LEAD(total) OVER (ORDER BY id) AS next_total FROM orders WHERE status='pending' ORDER BY id LIMIT 5`);
show("U88 stock-name order ladder head", `SELECT id, name, stock, LAG(stock) OVER (ORDER BY name, id) AS cheaper FROM products WHERE price <= 34.5 ORDER BY price, id LIMIT 5`);
show("U89 price<=32 rows", `SELECT COUNT(*) n FROM products WHERE price <= 32`);
show("U90 stock >= 40 headroom rows", `SELECT id, name, stock, LEAD(stock) OVER (ORDER BY stock, id) - stock AS headroom FROM products WHERE stock <= 150 AND stock >= 40 ORDER BY stock, id`);
show("U91 cancelled wait gap=customer id?", `SELECT COUNT(*) n FROM orders WHERE status = 'cancelled' AND customer_id = id`);
show("U92 LAG(name) walk head", `SELECT id, name, LAG(name) OVER (ORDER BY id) AS prev_signup FROM customers ORDER BY id LIMIT 5`);
show("U93 LIMIT 16 walk count", `SELECT COUNT(*) n FROM (SELECT id, name, LEAD(name) OVER (ORDER BY id) AS next_signup FROM customers ORDER BY id LIMIT 16)`);
show("U94 FIRST_VALUE joined default", `WITH signups AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS joined FROM customers GROUP BY mon) SELECT mon, joined, LEAD(joined, 1, joined) OVER (ORDER BY mon) AS next_wave FROM signups ORDER BY mon DESC LIMIT 2`);
show("U95 LAG joined flip head", `WITH signups AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS joined FROM customers GROUP BY mon) SELECT mon, joined, LAG(joined, 1, 0) OVER (ORDER BY mon) AS prev_wave FROM signups ORDER BY mon LIMIT 2`);
show("U96 LAG spend flip head", `WITH monthly AS (SELECT strftime('%Y-%m', spent_on) AS mon, ROUND(SUM(amount_cents) / 100.0, 2) AS spend FROM expenses GROUP BY mon) SELECT mon, spend, ROUND(spend - LEAD(spend) OVER (ORDER BY mon), 2) AS delta FROM monthly ORDER BY mon LIMIT 4`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done, copy removed");
