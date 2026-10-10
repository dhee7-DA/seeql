/// <reference types="bun-types" />
// m5-c-r4 probe tool — LAG/LEAD wave (cs-1332..1374). Read-only COPY of
// db/custom.db, self-deleting. Every figure used in cases-r4.ts must trace
// to this output. Run: bun scripts/m5-facts-r4.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5c-r4.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string, max = 100) => {
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
    db.query(sql).all();
    console.log(`\n[ERR ${label}]  no error`);
  } catch (e) {
    console.log(`\n[ERR ${label}]  ${e instanceof Error ? e.message : e}`);
  }
};

console.log("sqlite", (db.query("SELECT sqlite_version() AS v").get() as { v: string }).v);

// ---------- A. base censuses ----------
show("A1 status census", "SELECT status, COUNT(*) n FROM orders GROUP BY status");
show("A2 month counts + spends (staged)", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n, ROUND(SUM(total),2) spend FROM orders GROUP BY mon) SELECT mon, n, spend FROM m ORDER BY mon`);
show("A3 customers dump", "SELECT id, name, region, active, created_at FROM customers ORDER BY id");
show("A4 per-customer orders + spend", "SELECT c.id, c.name, COUNT(*) n, ROUND(SUM(o.total),2) spend FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.id ORDER BY c.id");
show("A5 orders per region", "SELECT c.region, COUNT(*) n, ROUND(SUM(o.total),2) spend FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region ORDER BY n DESC");
show("A6 pending 14 detail", "SELECT id, customer_id, total, created_at, shipped_at FROM orders WHERE status='pending' ORDER BY id");
show("A7 cancelled detail", "SELECT id, customer_id, total, created_at FROM orders WHERE status='cancelled' ORDER BY id");
show("A8 products dump", "SELECT id, name, category, price, stock, supplier_id FROM products ORDER BY id");
show("A9 suppliers dump", "SELECT id, name, region, rating FROM suppliers ORDER BY id");
show("A10 invoices dump", "SELECT id, customer_id, number, issued_on, due_on, amount_cents, status FROM invoices ORDER BY id");
show("A11 payments dump", "SELECT id, invoice_id, paid_on, amount_cents, method FROM payments ORDER BY id");
show("A12 expenses by category", "SELECT category, COUNT(*) n, SUM(amount_cents) sum_c FROM expenses GROUP BY category");
show("A13 expense month spends (staged)", `WITH m AS (SELECT strftime('%Y-%m', spent_on) mon, ROUND(SUM(amount_cents)/100.0,2) spend, COUNT(*) n FROM expenses GROUP BY mon) SELECT mon, n, spend FROM m ORDER BY mon`);
show("A14 customer signup months (staged)", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM customers GROUP BY mon) SELECT mon, n FROM m ORDER BY mon`);
show("A15 created_at ties detail", "SELECT created_at, COUNT(*) n, GROUP_CONCAT(id) ids FROM orders GROUP BY created_at HAVING n > 1 ORDER BY created_at");
show("A16 ship-lag census", `SELECT CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) lag_days, COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL GROUP BY lag_days ORDER BY lag_days`);
show("A17 ship-lag avg", "SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)),2) avg_lag, COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL");
show("A18 ledger accounts", "SELECT account, COUNT(*) n, SUM(debit_cents) d, SUM(credit_cents) c FROM ledger_entries GROUP BY account");

// ---------- B. month pipeline (MoM) ----------
show("B1 MoM deltas (staged)", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend FROM orders GROUP BY mon) SELECT mon, spend, ROUND(spend - LAG(spend) OVER (ORDER BY mon),2) delta FROM m ORDER BY mon`);
show("B2 MoM pct 1dp (staged)", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend FROM orders GROUP BY mon) SELECT mon, spend, ROUND(100.0*(spend - LAG(spend) OVER (ORDER BY mon))/LAG(spend) OVER (ORDER BY mon),1) pct FROM m ORDER BY mon`);
show("B3 MoM pct 2dp (staged)", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend FROM orders GROUP BY mon) SELECT mon, ROUND(100.0*(spend - LAG(spend) OVER (ORDER BY mon))/LAG(spend) OVER (ORDER BY mon),2) pct FROM m ORDER BY mon`);
show("B4 gap-to-prev-spend multiple", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend FROM orders GROUP BY mon) SELECT mon, spend, ROUND(spend / LAG(spend) OVER (ORDER BY mon),2) ratio FROM m ORDER BY mon`);
show("B5 2024-11 drop row", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend FROM orders GROUP BY mon), d AS (SELECT mon, spend, LAG(spend) OVER (ORDER BY mon) prev FROM m) SELECT mon, prev, spend, ROUND(prev - spend,2) drop_amt FROM d WHERE mon='2024-11'`);
show("B6 2024-08 jump row", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend FROM orders GROUP BY mon), d AS (SELECT mon, spend, LAG(spend) OVER (ORDER BY mon) prev FROM m) SELECT mon, prev, spend, ROUND(100.0*(spend-prev)/prev,1) pct FROM d WHERE mon='2024-08'`);
show("B7 monthly order-count delta", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM orders GROUP BY mon) SELECT mon, n, n - LAG(n) OVER (ORDER BY mon) dn FROM m ORDER BY mon`);
show("B8 month spends plain", "SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend FROM orders GROUP BY mon ORDER BY mon");

// ---------- C. partition walls ----------
show("C1 per-customer LAG NULL census", `SELECT COUNT(*) n FROM (SELECT LAG(total) OVER (PARTITION BY customer_id ORDER BY id) p FROM orders) WHERE p IS NULL`);
show("C2 per-customer LEAD NULL census", `SELECT COUNT(*) n FROM (SELECT LEAD(total) OVER (PARTITION BY customer_id ORDER BY id) n FROM orders) WHERE n IS NULL`);
show("C3 global LAG NULL census (no partition)", `SELECT COUNT(*) n FROM (SELECT LAG(total) OVER (ORDER BY id) p FROM orders) WHERE p IS NULL`);
show("C4 per-region LAG wall", `SELECT o.id, c.name, c.region, o.total, LAG(o.total) OVER (PARTITION BY c.region ORDER BY o.id) prev_region FROM orders o JOIN customers c ON c.id=o.customer_id ORDER BY o.id LIMIT 12`);
show("C5 per-region wall NULL census", `SELECT COUNT(*) n FROM (SELECT LAG(o.total) OVER (PARTITION BY c.region ORDER BY o.id) p FROM orders o JOIN customers c ON c.id=o.customer_id) WHERE p IS NULL`);
show("C6 Bruno (cust 2) chain", `SELECT id, total, LAG(total) OVER (PARTITION BY customer_id ORDER BY id) prev FROM orders WHERE customer_id=2 ORDER BY id`);
show("C7 Maya (cust 13) chain", `SELECT id, total, LAG(total) OVER (PARTITION BY customer_id ORDER BY id) prev FROM orders WHERE customer_id=13 ORDER BY id`);
show("C8 Emma (cust 5) chain", `SELECT id, total, LAG(total) OVER (PARTITION BY customer_id ORDER BY id) prev FROM orders WHERE customer_id=5 ORDER BY id`);
show("C9 Liam (cust 12) chain", `SELECT id, total, LEAD(total) OVER (PARTITION BY customer_id ORDER BY id) nxt FROM orders WHERE customer_id=12 ORDER BY id`);
show("C10 pending-wall (filter-first) first 5", `SELECT id, total, LAG(total) OVER (ORDER BY id) prev FROM orders WHERE status='pending' ORDER BY id LIMIT 5`);
show("C11 pending-wall full 14", `SELECT id, total, LAG(total) OVER (ORDER BY id) prev FROM orders WHERE status='pending' ORDER BY id`);
show("C12 region wall for LATAM (2 orders)", `SELECT o.id, o.total, LAG(o.total) OVER (PARTITION BY c.region ORDER BY o.id) prev FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='LATAM' ORDER BY o.id`);
show("C13 Alice first-5 chain", `SELECT id, total, LAG(total) OVER (PARTITION BY customer_id ORDER BY id) prev FROM orders WHERE customer_id=1 ORDER BY id LIMIT 5`);
show("C14 APAC wall head", `SELECT o.id, o.total, LAG(o.total) OVER (PARTITION BY c.region ORDER BY o.id) prev FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='APAC' ORDER BY o.id LIMIT 5`);

// ---------- D. edge offsets ----------
show("D1 LAG(total,0) echoes", "SELECT id, total, LAG(total, 0) OVER (ORDER BY id) self FROM orders ORDER BY id LIMIT 3");
show("D2 LAG(total,-1) forward", "SELECT id, total, LAG(total, -1) OVER (ORDER BY id) fwd FROM orders ORDER BY id LIMIT 3");
show("D3 LEAD(total,-1) backward", "SELECT id, total, LEAD(total, -1) OVER (ORDER BY id) back FROM orders ORDER BY id LIMIT 3");
show("D4 LAG(total,1000) non-null", `SELECT COUNT(*) n FROM (SELECT LAG(total, 1000) OVER (ORDER BY id) p FROM orders) WHERE p IS NOT NULL`);
show("D5 LAG(total,2) rows 1-4", "SELECT id, total, LAG(total, 2) OVER (ORDER BY id) p2 FROM orders ORDER BY id LIMIT 4");
show("D6 LAG(total,1,0) first rows", "SELECT id, total, LAG(total, 1, 0) OVER (ORDER BY id) p FROM orders ORDER BY id LIMIT 3");
show("D7 LEAD(spend,1,0) last month", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend FROM orders GROUP BY mon) SELECT mon, spend, LEAD(spend, 1, 0) OVER (ORDER BY mon) nxt FROM m ORDER BY mon DESC LIMIT 2`);
show("D8 month LAG default 0 first row", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend FROM orders GROUP BY mon) SELECT mon, spend, spend - LAG(spend, 1, 0) OVER (ORDER BY mon) delta FROM m ORDER BY mon LIMIT 2`);
show("D9 LEAD(total,2) tail", "SELECT id, total, LEAD(total, 2) OVER (ORDER BY id) n2 FROM orders ORDER BY id DESC LIMIT 3");
show("D10 big-offset NULL vs 0 count", `SELECT (SELECT COUNT(*) FROM (SELECT LAG(total, 1000) OVER (ORDER BY id) p FROM orders) WHERE p IS NULL) all_null, (SELECT COUNT(*) FROM (SELECT LAG(total, 1, 0) OVER (ORDER BY id) p FROM orders) WHERE p = 0) zeros`);
show("D11 LEAD(total,3,−1) sample", "SELECT id, total, LEAD(total, 3, -1) OVER (ORDER BY id) n3 FROM orders ORDER BY id DESC LIMIT 4");

// ---------- E. intervals / aging ----------
show("E1 Alice repurchase gaps (all 24)", `SELECT id, created_at, total, CAST(julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS INTEGER) gap_d FROM orders WHERE customer_id=1 ORDER BY created_at, id`);
show("E2 Alice gap census", `WITH g AS (SELECT CAST(julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS INTEGER) gap_d FROM orders WHERE customer_id=1) SELECT COUNT(*) n, MIN(gap_d) mn, MAX(gap_d) mx, ROUND(AVG(gap_d),1) avg_d, SUM(gap_d) tot FROM g WHERE gap_d IS NOT NULL`);
show("E3 Bruno repurchase gaps", `SELECT id, created_at, CAST(julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS INTEGER) gap_d FROM orders WHERE customer_id=2 ORDER BY created_at, id`);
show("E4 Emma repurchase gaps", `SELECT id, created_at, CAST(julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS INTEGER) gap_d FROM orders WHERE customer_id=5 ORDER BY created_at, id`);
show("E5 storewide consecutive-order gaps census", `WITH g AS (SELECT CAST(julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS INTEGER) gap_d FROM orders) SELECT gap_d, COUNT(*) n FROM g WHERE gap_d IS NOT NULL GROUP BY gap_d ORDER BY gap_d`);
show("E6 invoices cust 1 gaps", `SELECT id, issued_on, CAST(julianday(issued_on) - julianday(LAG(issued_on) OVER (ORDER BY issued_on)) AS INTEGER) gap_d FROM invoices WHERE customer_id=1 ORDER BY issued_on`);
show("E7 invoices cust 2 gaps", `SELECT id, issued_on, CAST(julianday(issued_on) - julianday(LAG(issued_on) OVER (ORDER BY issued_on)) AS INTEGER) gap_d FROM invoices WHERE customer_id=2 ORDER BY issued_on`);
show("E8 consecutive ship-date gaps (shipped only)", `WITH s AS (SELECT id, shipped_at, CAST(julianday(shipped_at) - julianday(LAG(shipped_at) OVER (ORDER BY shipped_at, id)) AS INTEGER) gap_d FROM orders WHERE shipped_at IS NOT NULL) SELECT * FROM s WHERE gap_d IS NOT NULL AND gap_d > 0 ORDER BY gap_d DESC LIMIT 8`);
show("E9 expenses Rent sequence", `SELECT id, spent_on, amount_cents/100.0 amt, CAST(julianday(spent_on) - julianday(LAG(spent_on) OVER (PARTITION BY category ORDER BY spent_on)) AS INTEGER) gap_d FROM expenses WHERE category='Rent' ORDER BY spent_on`);
show("E10 cancelled-order aging gaps", `WITH c AS (SELECT id, created_at, CAST(julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS INTEGER) gap_d FROM orders WHERE status='cancelled') SELECT * FROM c`);
show("E11 payments per-invoice gaps head", `SELECT p.invoice_id, p.paid_on, CAST(julianday(p.paid_on) - julianday(LAG(p.paid_on) OVER (ORDER BY p.paid_on, p.id)) AS INTEGER) gap_d FROM payments p ORDER BY p.paid_on, p.id LIMIT 10`);
show("E12 signup-month signup delta", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM customers GROUP BY mon) SELECT mon, n, n - LAG(n) OVER (ORDER BY mon) dn FROM m ORDER BY mon`);

// ---------- F. neighbors over value orderings ----------
show("F1 product price neighbors", `SELECT id, name, price, LAG(price) OVER (ORDER BY price, id) cheaper, LEAD(price) OVER (ORDER BY price, id) pricier FROM products ORDER BY price, id`);
show("F2 product stock neighbors", `SELECT id, name, stock, LEAD(stock) OVER (ORDER BY stock, id) next_stock FROM products ORDER BY stock, id LIMIT 12`);
show("F3 supplier rating neighbors", `SELECT id, name, rating, LAG(rating) OVER (ORDER BY rating, id) below, LEAD(rating) OVER (ORDER BY rating, id) above FROM suppliers ORDER BY rating, id`);
show("F4 order total neighbors (id order) head", `SELECT id, total, LAG(total) OVER (ORDER BY id) prev, LEAD(total) OVER (ORDER BY id) nxt FROM orders ORDER BY id LIMIT 6`);
show("F5 order total neighbors tail", `SELECT id, total, LEAD(total) OVER (ORDER BY id) nxt FROM orders ORDER BY id DESC LIMIT 3`);
show("F6 order-total neighbors by total desc", `SELECT id, total, LAG(total) OVER (ORDER BY total DESC, id) smaller FROM orders ORDER BY total DESC, id LIMIT 6`);
show("F7 customer LEAD walk", "SELECT id, name, LEAD(name) OVER (ORDER BY id) nxt FROM customers ORDER BY id");
show("F8 category census products", "SELECT category, COUNT(*) n, ROUND(AVG(price),2) avg_p FROM products GROUP BY category ORDER BY category");
show("F9 top-3 orders", "SELECT id, customer_id, total FROM orders ORDER BY total DESC LIMIT 3");
show("F10 top-3 spends per customer", "SELECT * FROM (SELECT c.name, o.total, RANK() OVER (PARTITION BY c.id ORDER BY o.total DESC) rk FROM orders o JOIN customers c ON c.id=o.customer_id) WHERE rk <= 2 ORDER BY name, rk LIMIT 8");
show("F11 expense month deltas", `WITH m AS (SELECT strftime('%Y-%m', spent_on) mon, ROUND(SUM(amount_cents)/100.0,2) spend FROM expenses GROUP BY mon) SELECT mon, spend, ROUND(spend - LAG(spend) OVER (ORDER BY mon),2) delta FROM m ORDER BY mon`);
show("F12 invoice amount neighbors cust 1", `SELECT id, number, amount_cents/100.0 amt, LAG(amount_cents) OVER (ORDER BY issued_on)/100.0 prev_amt FROM invoices WHERE customer_id=1 ORDER BY issued_on`);
show("F13 distinct totals?", `SELECT COUNT(*) n, COUNT(DISTINCT total) dt FROM orders`);

// ---------- G. error probes (distractor ammunition) ----------
err("G1 bare LAG", "SELECT LAG(total) FROM orders LIMIT 1");
err("G2 window fn in WHERE", "SELECT id FROM orders WHERE LAG(total) OVER (ORDER BY id) > 100");
err("G3 WHERE on window alias", "SELECT id, total - LAG(total) OVER (ORDER BY id) AS d FROM orders WHERE d > 0");
err("G4 OVER (ORDER BY select-alias)", "SELECT id, strftime('%Y-%m', created_at) AS mon, LAG(total) OVER (ORDER BY mon) p FROM orders LIMIT 3");
err("G5 LAG() no args", "SELECT LAG() OVER (ORDER BY id) FROM orders LIMIT 1");
err("G6 LAG(SUM) OVER (ORDER BY alias)", "SELECT strftime('%Y-%m', created_at) AS mon, LAG(SUM(total)) OVER (ORDER BY mon) p FROM orders GROUP BY mon");
err("G7 one-pass LAG(SUM) unrounded (accepted)", "SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total),2) s, LAG(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) raw_lag FROM orders GROUP BY strftime('%Y-%m', created_at) ORDER BY mon LIMIT 3");
err("G8 PARTITION after ORDER", "SELECT LAG(total) OVER (ORDER BY id PARTITION BY customer_id) FROM orders LIMIT 1");
err("G9 LAG over date text directly diff", "SELECT id, created_at - LAG(created_at) OVER (ORDER BY id) g FROM orders ORDER BY id LIMIT 3");

// ==== ROUND 2: case-fill receipts (exact templates of cases-r4.ts) ====
const F = (label: string, sql: string, max = 40) => show(label, sql, max);

F("H01 cs-1332 fill", `SELECT id, customer_id, total,
       LAG(total) OVER (ORDER BY id) AS prev_total
FROM orders
WHERE status = 'pending'
ORDER BY id
LIMIT 5`);
F("H02 cs-1333 fill", `SELECT id, name, price,
       LEAD(price, 1) OVER (ORDER BY price, id) AS next_price
FROM products
WHERE category = 'Electronics'
ORDER BY price, id`);
F("H03 cs-1334 fill", `WITH monthly AS (
  SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total), 2) spend
  FROM orders GROUP BY mon
)
SELECT mon, spend,
       ROUND(spend - LAG(spend) OVER (ORDER BY mon), 2) AS delta
FROM monthly
WHERE mon >= '2024-07'
ORDER BY mon`);
F("H04 cs-1335 fill", `SELECT id, name, price,
       LEAD(price) OVER (ORDER BY price, id) AS next_price
FROM products
WHERE price >= 42.5
ORDER BY price, id`);
F("H05 cs-1336 fill", `WITH signups AS (
  SELECT strftime('%Y-%m', created_at) mon, COUNT(*) joined
  FROM customers
  GROUP BY mon
)
SELECT mon, joined, joined - LAG(joined) OVER (ORDER BY mon) AS d_joined
FROM signups
WHERE joined <= 1
ORDER BY mon`);
F("H06 cs-1337 fill", `WITH laddered AS (
  SELECT id, name, region, rating,
         LEAD(rating) OVER (PARTITION BY region ORDER BY rating, id) AS above
  FROM suppliers
)
SELECT region, COUNT(*) AS n, COUNT(above) AS with_above
FROM laddered
GROUP BY region
HAVING with_above = 1
ORDER BY region`);
F("H07 cs-1338 fill", `SELECT id, name, created_at,
       LEAD(name) OVER (ORDER BY id) AS next_name
FROM customers
ORDER BY id
LIMIT 5`);
F("H08 cs-1339 fill", `SELECT id, created_at, total,
       CAST(julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS INTEGER) AS days_since_prev
FROM orders
WHERE status = 'cancelled'
ORDER BY created_at, id`);
F("H09 cs-1340 fill", `WITH banded AS (
  SELECT id, name, stock,
         stock - LAG(stock) OVER (ORDER BY stock, id) AS step_down
  FROM products
)
SELECT id, name, stock, step_down
FROM banded
WHERE step_down >= 30
ORDER BY stock DESC, id`);
F("H10 cs-1341 fill", `WITH monthly AS (
  SELECT strftime('%Y-%m', spent_on) mon, ROUND(SUM(amount_cents) / 100.0, 2) spend
  FROM expenses GROUP BY mon
)
SELECT mon, spend, LAG(spend) OVER (ORDER BY mon) AS neighbor
FROM monthly
ORDER BY mon
LIMIT 4`);
F("H11 cs-1342 fill", `WITH g AS (
  SELECT id, customer_id, created_at, total,
         julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS gap
  FROM orders
)
SELECT id, customer_id, created_at, total
FROM g
WHERE gap = 0
ORDER BY created_at, id`);
F("H11b cs-1342 gap=1 variant count", `WITH g AS (
  SELECT id, customer_id, created_at, total,
         julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS gap
  FROM orders
)
SELECT COUNT(*) n FROM g WHERE gap = 1`);
F("H12 cs-1343 fill", `WITH ranked AS (
  SELECT id, name, category, price,
         LEAD(price) OVER (PARTITION BY category ORDER BY price) AS neighbor_price
  FROM products
)
SELECT category, name, price
FROM ranked
WHERE neighbor_price IS NULL
ORDER BY category, price`);
F("H13 cs-1344 fill", `WITH monthly AS (
  SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total), 2) spend
  FROM orders GROUP BY mon
)
SELECT mon, spend, LAG(spend, 1, 0) OVER (ORDER BY mon) AS prev_spend
FROM monthly
ORDER BY mon
LIMIT 3`);
F("H14 cs-1345 fill", `WITH ladder AS (
  SELECT p.id, p.name, s.name AS supplier, p.price,
         LAG(p.price) OVER (PARTITION BY s.id ORDER BY p.price) AS cheaper_in_supplier
  FROM products p JOIN suppliers s ON s.id = p.supplier_id
)
SELECT supplier, name, price, cheaper_in_supplier
FROM ladder
WHERE cheaper_in_supplier IS NOT NULL
ORDER BY supplier, price`);
F("H15 cs-1346 fill", `WITH s AS (
  SELECT id, name, created_at,
         julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS gap
  FROM customers
)
SELECT id, name, created_at, CAST(gap AS INTEGER) AS gap_days
FROM s
WHERE gap IS NOT NULL
ORDER BY created_at, id`);
F("H16 cs-1347 fill", `SELECT id, name, rating,
       LEAD(rating, 1) OVER (ORDER BY rating, id) AS next_rating
FROM suppliers
WHERE region = 'EU'
ORDER BY rating, id`);
F("H17 cs-1348 fill", `WITH monthly AS (
  SELECT strftime('%Y-%m', created_at) mon, COUNT(*) orders
  FROM orders GROUP BY mon
), d AS (
  SELECT mon, orders, orders - LAG(orders) OVER (ORDER BY mon) AS d_orders
  FROM monthly
)
SELECT mon, orders, d_orders
FROM d
WHERE d_orders = -2
ORDER BY mon`);
F("H18 cs-1349 fill", `WITH refunded AS (
  SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total), 2) refunded
  FROM orders
  WHERE status = 'cancelled'
  GROUP BY mon
), swung AS (
  SELECT mon, refunded, LAG(refunded) OVER (ORDER BY mon) AS prev_refunded
  FROM refunded
)
SELECT mon, refunded, prev_refunded,
       ROUND(refunded - prev_refunded, 2) AS delta
FROM swung
ORDER BY mon`);
F("H19 cs-1350 fill", `SELECT id, name, stock,
       LEAD(stock, 1) OVER (ORDER BY stock, id) AS next_stock
FROM products
WHERE stock <= 120
ORDER BY stock, id`);
F("H20 cs-1351 fill", `WITH monthly AS (
  SELECT strftime('%Y-%m', spent_on) mon, ROUND(SUM(amount_cents) / 100.0, 2) spend
  FROM expenses GROUP BY mon
)
SELECT mon, spend,
       ROUND(spend - LAG(spend) OVER (ORDER BY mon), 2) AS delta
FROM monthly
ORDER BY mon`);
F("H21 cs-1352 fill", `WITH walked AS (
  SELECT id, customer_id, created_at, total,
         julianday(created_at) - julianday(LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id)) AS gap
  FROM orders
)
SELECT id, customer_id, created_at, total
FROM walked
WHERE gap = 0
ORDER BY customer_id, created_at, id`);
F("H21b cs-1352 per-customer gap=1 count", `WITH walked AS (
  SELECT id, customer_id, created_at, total,
         julianday(created_at) - julianday(LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id)) AS gap
  FROM orders
)
SELECT COUNT(*) n FROM walked WHERE gap = 1`);
F("H21c cs-1352 PARTITION BY 1 fallback", `WITH walked AS (
  SELECT id, customer_id, created_at, total,
         julianday(created_at) - julianday(LAG(created_at) OVER (PARTITION BY 1 ORDER BY created_at, id)) AS gap
  FROM orders
)
SELECT COUNT(*) n FROM walked WHERE gap = 0`);
F("H22 cs-1353 fill", `SELECT id, name, price,
       LAG(price) OVER (ORDER BY price, id) AS cheaper
FROM products
WHERE price <= 34.5
ORDER BY price, id`);
F("H23 cs-1354 fill", `WITH monthly AS (
  SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total), 2) spend
  FROM orders GROUP BY mon
), swung AS (
  SELECT mon, spend, LAG(spend) OVER (ORDER BY mon) AS prev_spend
  FROM monthly
)
SELECT mon, prev_spend, spend, ROUND(prev_spend - spend, 2) AS drop_amt
FROM swung
ORDER BY mon`);
F("H24 order_items census", `SELECT COUNT(*) n, COUNT(DISTINCT unit_price) dp, MIN(unit_price) mn, MAX(unit_price) mx FROM order_items`);
F("H24b order_items unit-price steps", `SELECT id, order_id, product_id, unit_price,
       ROUND(LEAD(unit_price) OVER (ORDER BY unit_price, id) - unit_price, 2) AS step_up
FROM order_items
ORDER BY unit_price, id`, 200);
F("H25 cs-1356 fill", `SELECT id, name,
       LAG(name) OVER (ORDER BY id) AS prev_signup
FROM customers
WHERE region = 'EU'
ORDER BY id
LIMIT 4`);
F("H26 cs-1357 fill", `SELECT s.name, s.rating, COUNT(p.id) AS products,
       LAG(s.rating) OVER (ORDER BY s.rating, s.id) AS rating_below
FROM suppliers s
JOIN products p ON p.supplier_id = s.id
GROUP BY s.id
HAVING products = 3
ORDER BY s.rating, s.id`);
F("H27 cs-1358 fill", `WITH monthly AS (
  SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total), 2) spend
  FROM orders GROUP BY mon
), ratioed AS (
  SELECT mon, spend, ROUND(100.0 * spend / LAG(spend) OVER (ORDER BY mon), 1) AS pct_of_prev
  FROM monthly
)
SELECT mon, spend, pct_of_prev
FROM ratioed
WHERE pct_of_prev >= 100
ORDER BY pct_of_prev DESC`);
F("H28 cs-1359 fill", `SELECT id, created_at, total,
       LEAD(created_at) OVER (ORDER BY created_at, id) AS next_cancel
FROM orders
WHERE status = 'cancelled'
ORDER BY created_at, id`);
F("H29 cs-1360 fill", `SELECT id, name, stock,
       LEAD(stock) OVER (ORDER BY stock, id) - stock AS headroom
FROM products
WHERE stock <= 150 AND stock >= 60
ORDER BY stock, id`);
F("H30 cs-1361 fill", `WITH gapped AS (
  SELECT id, category, vendor, spent_on, amount_cents,
         julianday(spent_on) - julianday(LAG(spent_on) OVER (PARTITION BY category ORDER BY spent_on, id)) AS gap
  FROM expenses
)
SELECT category, COUNT(*) AS entries, COUNT(gap) AS with_prev, ROUND(AVG(gap), 1) AS avg_gap
FROM gapped
GROUP BY category
HAVING with_prev = 13
ORDER BY category`);
F("H30b expense avg gaps all categories", `WITH gapped AS (
  SELECT id, category, vendor, spent_on, amount_cents,
         julianday(spent_on) - julianday(LAG(spent_on) OVER (PARTITION BY category ORDER BY spent_on, id)) AS gap
  FROM expenses
)
SELECT category, COUNT(*) AS entries, COUNT(gap) AS with_prev, ROUND(AVG(gap), 1) AS avg_gap
FROM gapped
GROUP BY category
ORDER BY category`);
F("H30c vendors per category", `SELECT category, vendor, COUNT(*) n FROM expenses GROUP BY category, vendor ORDER BY category, vendor`);
F("H31 cs-1362 fill", `SELECT id, customer_id, total,
       LAG(total) OVER (ORDER BY total DESC, id) AS bigger_total
FROM orders
ORDER BY total DESC, id
LIMIT 5`);
F("H32 cs-1363 fill", `WITH steps AS (
  SELECT id, name, price, LEAD(price) OVER (ORDER BY price, id) AS next_price
  FROM products
)
SELECT id, name, price, next_price,
       ROUND(next_price - price, 2) AS step_up
FROM steps
WHERE next_price IS NOT NULL
  AND next_price - price >= 10.99
ORDER BY price, id`);
F("H33 cs-1364 fill", `WITH monthly AS (
  SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total), 2) spend
  FROM orders GROUP BY mon
), swung AS (
  SELECT mon, spend, LAG(spend) OVER (ORDER BY mon) AS prev_spend
  FROM monthly
)
SELECT mon, prev_spend, spend, ROUND(prev_spend - spend, 2) AS drop_amt
FROM swung
WHERE mon = '2024-11'
ORDER BY mon`);
F("H34 cs-1365 fill", `SELECT i.customer_id, c.name, i.number, i.amount_cents / 100.0 AS amt,
       LAG(i.amount_cents) OVER (ORDER BY i.issued_on) / 100.0 AS prev_amt
FROM invoices i
JOIN customers c ON c.id = i.customer_id
WHERE c.id = 1
ORDER BY i.issued_on`);
F("H35 cs-1366 fill", `WITH signups AS (
  SELECT strftime('%Y-%m', created_at) mon, COUNT(*) joined
  FROM customers GROUP BY mon
)
SELECT mon, joined,
       LEAD(joined, 1, 0) OVER (ORDER BY mon) AS next_wave
FROM signups
ORDER BY mon`);
F("H36 cs-1367 fill", `WITH laddered AS (
  SELECT s.id, s.name, s.region, s.rating,
         LEAD(s.rating) OVER (PARTITION BY s.region ORDER BY s.rating, s.id) AS above
  FROM suppliers s
)
SELECT region, name, rating
FROM laddered
WHERE above IS NULL
ORDER BY region, rating`);
F("H37 cs-1368 fill", `WITH monthly AS (
  SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total), 2) spend
  FROM orders GROUP BY mon
)
SELECT mon, spend, LEAD(spend) OVER (ORDER BY mon) AS next_spend
FROM monthly
ORDER BY mon
LIMIT 3`);
F("H38 cs-1369 fill", `SELECT c.name, o.id, o.created_at, o.total,
       CAST(julianday(o.created_at) - julianday(LAG(o.created_at) OVER (ORDER BY o.created_at, o.id)) AS INTEGER) AS wait_d
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'pending'
ORDER BY o.created_at, o.id`);
F("H39 cs-1370 fill", `WITH shelves AS (
  SELECT id, name, category, stock,
         LAG(stock) OVER (PARTITION BY category ORDER BY stock, id) AS below
  FROM products
)
SELECT category, COUNT(*) AS n, COUNT(below) AS with_below
FROM shelves
GROUP BY category
HAVING with_below = 2
ORDER BY category`);
F("H40 cs-1371 fill", `SELECT id, vendor, spent_on, amount_cents / 100.0 AS amt,
       LAG(amount_cents) OVER (ORDER BY spent_on, id) / 100.0 AS prev_amt
FROM expenses
WHERE category = 'Ads'
ORDER BY spent_on, id`);
F("H40b Ads amounts divisible by 100?", `SELECT amount_cents, amount_cents % 100 AS rem FROM expenses WHERE category='Ads' ORDER BY spent_on, id`);
F("H41 cs-1372 fill", `WITH walked AS (
  SELECT id, customer_id, total,
         total - LAG(total) OVER (PARTITION BY customer_id ORDER BY id) AS swing
  FROM orders
)
SELECT customer_id, id, total, ROUND(swing, 2) AS swing
FROM walked
WHERE swing >= 500
ORDER BY customer_id, id`);
F("H41b per-customer swing census", `WITH walked AS (
  SELECT id, customer_id, total,
         total - LAG(total) OVER (PARTITION BY customer_id ORDER BY id) AS swing
  FROM orders
)
SELECT COUNT(*) n, MIN(swing) mn, MAX(swing) mx FROM walked WHERE swing IS NOT NULL`);
F("H41c swings >= 400 count", `WITH walked AS (
  SELECT id, customer_id, total,
         total - LAG(total) OVER (PARTITION BY customer_id ORDER BY id) AS swing
  FROM orders
)
SELECT COUNT(*) n FROM walked WHERE swing >= 400`);
F("H42 cs-1373 fill", `WITH laddered AS (
  SELECT id, name, category, price,
         LAG(price) OVER (PARTITION BY category ORDER BY price, id) AS cheaper,
         LEAD(price) OVER (PARTITION BY category ORDER BY price, id) AS pricier
  FROM products
)
SELECT category, name, price, cheaper, pricier
FROM laddered
WHERE cheaper IS NOT NULL
ORDER BY category, price`);
F("H43 cs-1374 fill", `WITH monthly AS (
  SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total), 2) spend
  FROM orders GROUP BY mon
), swung AS (
  SELECT mon, spend, LAG(spend) OVER (ORDER BY mon) AS prev_spend
  FROM monthly
), deltas AS (
  SELECT mon, spend, prev_spend, spend - prev_spend AS delta
  FROM swung
)
SELECT mon, spend, prev_spend, ROUND(delta, 2) AS delta
FROM deltas
WHERE delta < 0
ORDER BY mon`);

// ==== ROUND 2: uncertain error / edge behaviors ====
err("X01 LIMIT 'shipped'", `SELECT id FROM orders WHERE status='pending' LIMIT 'shipped'`);
err("X02 LIMIT '%Y'", `SELECT id FROM orders WHERE status='pending' LIMIT '%Y'`);
err("X03 LIMIT ASC", `SELECT id FROM orders LIMIT ASC`);
err("X04 rating(rating) fn", `SELECT rating(rating) FROM suppliers`);
err("X05 id(stock) fn", `SELECT id(stock) FROM products`);
err("X06 name(price) fn", `SELECT name(price) FROM products`);
err("X07 LEAD(rating,'EU') offset", `SELECT LEAD(rating,'EU') OVER (ORDER BY rating) FROM suppliers LIMIT 2`);
err("X08 LEAD(rating,4.8) real offset", `SELECT LEAD(rating,4.8) OVER (ORDER BY rating) FROM suppliers LIMIT 2`);
err("X09 ORDER BY total 3", `SELECT id, total FROM orders ORDER BY total 3, id`);
err("X10 ORDER BY NOT NULL", `SELECT category, price FROM products ORDER BY NOT NULL, price`);
err("X11 PARTITION BY NOT NULL", `SELECT LEAD(rating) OVER (PARTITION BY NOT NULL ORDER BY rating) FROM suppliers`);
err("X12 PARTITION BY NULL", `SELECT LEAD(rating) OVER (PARTITION BY NULL ORDER BY rating) FROM suppliers`);
err("X13 ORDER BY 13 ordinal", `SELECT i.customer_id, c.name, i.number FROM invoices i JOIN customers c ON c.id=i.customer_id ORDER BY 13`);
err("X14 strftime(2, ...) fmt", `SELECT strftime(2, created_at) FROM orders LIMIT 1`);
err("X15 strftime(1, ...) fmt", `SELECT strftime(1, created_at) FROM orders LIMIT 1`);
err("X16 strftime(-1, ...) fmt", `SELECT strftime(-1, created_at) FROM orders LIMIT 1`);
err("X17 LEAD(price,'Audio') offset", `SELECT LEAD(price,'Audio') OVER (ORDER BY price) FROM products LIMIT 2`);
err("X18 date() OVER", `SELECT date(created_at) OVER (ORDER BY id) FROM orders LIMIT 1`);
err("X19 strftime('cancelled',...)", `SELECT strftime('cancelled', created_at) FROM orders LIMIT 1`);
err("X20 COUNT() args", `SELECT COUNT() FROM orders`);
err("X21 SUM(*) args", `SELECT SUM(*) FROM orders`);
err("X22 orders(created_at) fn", `SELECT orders(created_at) FROM orders`);
err("X23 ROUND('2024-08',2)", `SELECT ROUND('2024-08', 2)`);
err("X24 spend - '%Y'", `SELECT 100 - '%Y'`);
err("X25 ROUND('%m',2)", `SELECT ROUND('%m', 2)`);
err("X26 amount/100 vs /100.0 Ads", `SELECT amount_cents/100 a, amount_cents/100.0 b FROM expenses WHERE category='Ads' LIMIT 3`);
err("X27 '2024-08' numeric coercion", `SELECT '2024-08' + 0, '2024-11' + 0, '%Y' + 0`);
err("X28 price <= id compare", `SELECT COUNT(*) FROM products WHERE price >= id`);
err("X29 status = id / = total / = created_at", `SELECT (SELECT COUNT(*) FROM orders WHERE status=id) a, (SELECT COUNT(*) FROM orders WHERE status=total) b, (SELECT COUNT(*) FROM orders WHERE status=created_at) c`);
err("X30 gap = id collisions (storewide)", `WITH g AS (SELECT id, julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS gap FROM orders) SELECT COUNT(*) FROM g WHERE gap = id`);
err("X31 gap = 1 rows storewide (already H11b) + gap=3", `WITH g AS (SELECT id, julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS gap FROM orders) SELECT COUNT(*) FROM g WHERE gap = 3`);
err("X32 strftime(5,...)", `SELECT strftime(5, created_at) FROM orders LIMIT 1`);
err("X33 LEAD vs LAG month-delta flip equality", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend FROM orders GROUP BY mon), a AS (SELECT mon, ROUND(spend - LAG(spend) OVER (ORDER BY mon),2) d FROM m), b AS (SELECT mon, ROUND(spend - LEAD(spend) OVER (ORDER BY mon),2) d FROM m) SELECT COUNT(*) FROM a JOIN b ON a.mon=b.mon WHERE a.d IS b.d OR a.d = b.d`);
err("X34 LEAD vs LAG pending-queue flip", `WITH a AS (SELECT id, LAG(total) OVER (ORDER BY id) p FROM orders WHERE status='pending'), b AS (SELECT id, LEAD(total) OVER (ORDER BY id) p FROM orders WHERE status='pending') SELECT COUNT(*) FROM a JOIN b ON a.id=b.id WHERE a.p IS b.p OR a.p = b.p`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe round 2 done, copy removed");
