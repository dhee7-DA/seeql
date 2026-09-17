/// <reference types="bun-types" />
// m5-c6 probe tool — read-only COPY of db/custom.db, self-deleting (.m5c6.db).
// Every figure used in cases-w6.ts must trace to this output.
// Re-verifies durable r6/r4 receipts plus the w6-specific pipeline receipts.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5c6.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label}`);
  console.log(JSON.stringify(q(sql)));
};
const err = (label: string, sql: string) => {
  try {
    q(sql);
    console.log(`\n[ERR ${label}]  no error`);
  } catch (e) {
    console.log(`\n[ERR ${label}]  ${e instanceof Error ? e.message : String(e)}`);
  }
};

console.log("sqlite", db.query("SELECT sqlite_version() AS v").get());

// ---- A: folds & shares -----------------------------------------------------
show("A1 region count share 1dp (E1)", `SELECT region, n, ROUND(100.0 * n / SUM(n) OVER (), 1) AS pct FROM (
  SELECT c.region AS region, COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id
  GROUP BY c.region) ORDER BY pct DESC`);
show("A2 grand paint LIMIT 3 (E2)", `SELECT c.id, COUNT(*) n, ROUND(SUM(SUM(o.total)) OVER (), 2) grand
FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY c.id LIMIT 3`);
show("A3 status census rank LIMIT 2 (E4)", `SELECT status, COUNT(*) n, RANK() OVER (ORDER BY COUNT(*) DESC) rk
FROM orders GROUP BY status ORDER BY rk LIMIT 2`);
show("A4 vendor share 1dp (E5)", `WITH v AS (SELECT vendor, SUM(amount_cents)/100.0 spend FROM expenses GROUP BY vendor)
SELECT vendor, ROUND(spend, 2) spend, ROUND(100.0*spend/SUM(spend) OVER (), 1) pct FROM v ORDER BY pct DESC`);
show("A5 category price share 1dp (E7)", `WITH c AS (SELECT category, ROUND(SUM(price),2) cat_price FROM products GROUP BY category)
SELECT category, cat_price, ROUND(100.0*cat_price/SUM(cat_price) OVER (), 1) pct FROM c ORDER BY pct DESC`);
show("A6 customer share 1dp LIMIT 3 (E10)", `SELECT c.name name, ROUND(SUM(o.total),2) spend,
  ROUND(100.0*SUM(o.total)/SUM(SUM(o.total)) OVER (), 1) pct
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.id ORDER BY pct DESC LIMIT 3`);
show("A7 stock share+rank top5 1dp (E11)", `WITH s AS (SELECT name, stock, RANK() OVER (ORDER BY stock DESC) rk,
  SUM(stock) OVER () all_stock FROM products)
SELECT name, stock, rk, ROUND(100.0*stock/all_stock, 1) share FROM s WHERE rk <= 5 ORDER BY rk`);
show("A8 NTILE(4) price ASC tile=1 (E12)", `WITH t AS (SELECT name, price, NTILE(4) OVER (ORDER BY price ASC) tile FROM products)
SELECT name, price, tile FROM t WHERE tile = 1 ORDER BY price`);
show("A9 region rev share+rank 1dp (M2)", `WITH r AS (SELECT c.region region, ROUND(SUM(o.total),2) rev
  FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region)
SELECT region, rev, ROUND(100.0*rev/SUM(rev) OVER (), 1) pct, RANK() OVER (ORDER BY rev DESC) rk FROM r ORDER BY rk`);
show("A10 customer spend tiles NTILE(4) (M9)", `WITH s AS (SELECT c.name name, ROUND(SUM(o.total),2) spend,
  NTILE(4) OVER (ORDER BY SUM(o.total) DESC) tile
  FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id)
SELECT tile, COUNT(*) n, ROUND(SUM(spend),2) tile_spend FROM s GROUP BY tile ORDER BY tile`);
show("A11 supplier stock share+rank (M12)", `WITH s AS (SELECT sup.name name, SUM(p.stock) total_stock
  FROM suppliers sup JOIN products p ON p.supplier_id = sup.id GROUP BY sup.id)
SELECT name, total_stock, RANK() OVER (ORDER BY total_stock DESC) rk,
  ROUND(100.0*total_stock/SUM(total_stock) OVER (), 1) pct FROM s ORDER BY rk, name`);
show("A12 customers-per-region share 1dp nested-agg (M13)", `SELECT region, COUNT(*) n,
  ROUND(100.0*COUNT(*)/SUM(COUNT(*)) OVER (), 1) pct
FROM customers GROUP BY region ORDER BY pct DESC, region`);
err("A12b alias-of-aggregate inside OVER", `SELECT region, COUNT(*) n, ROUND(100.0*n/SUM(n) OVER (), 1) pct
FROM customers GROUP BY region`);
show("A12c customers-per-region share via derived table", `SELECT region, n, ROUND(100.0*n/SUM(n) OVER (), 1) pct FROM (
  SELECT region, COUNT(*) n FROM customers GROUP BY region) ORDER BY pct DESC, region`);
show("A13 grand+share 2dp LIMIT 3 (H4)", `SELECT c.name name, ROUND(SUM(o.total),2) spend,
  ROUND(SUM(SUM(o.total)) OVER (), 2) grand,
  ROUND(100.0*SUM(o.total)/SUM(SUM(o.total)) OVER (), 2) pct
FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY pct DESC LIMIT 3`);
show("A14 region rev 2dp rk<=2 (H6)", `WITH r AS (SELECT c.region region, ROUND(SUM(o.total),2) rev
  FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region),
t AS (SELECT region, rev, ROUND(100.0*rev/SUM(rev) OVER (), 2) pct, RANK() OVER (ORDER BY rev DESC) rk FROM r)
SELECT region, rev, pct, rk FROM t WHERE rk <= 2 ORDER BY rk`);
show("A15 customer share 2dp top3 (H8)", `WITH s AS (SELECT c.name name, ROUND(SUM(o.total),2) spend
  FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id),
t AS (SELECT name, spend, ROUND(100.0*spend/SUM(spend) OVER (), 2) pct, RANK() OVER (ORDER BY spend DESC) rk FROM s)
SELECT name, spend, pct, rk FROM t WHERE rk <= 3 ORDER BY rk`);
show("A16 ledger opex share top2 1dp (H10)", `WITH m AS (SELECT strftime('%Y-%m', entry_date) mon,
  SUM(debit_cents)/100.0 spend FROM ledger_entries WHERE account = 'operating_expenses' GROUP BY mon)
SELECT mon, ROUND(spend,2) spend, ROUND(100.0*spend/SUM(spend) OVER (), 1) pct FROM m ORDER BY pct DESC LIMIT 2`);
show("A17 month count share+rank LIMIT 4 (H11)", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n
  FROM orders GROUP BY mon)
SELECT mon, n, ROUND(100.0*n/SUM(n) OVER (), 1) pct, RANK() OVER (ORDER BY n DESC) rk
FROM m ORDER BY rk, mon LIMIT 4`);
show("A18 supplier value NTILE(3) band=1 (H7)", `WITH s AS (SELECT sup.name name, COUNT(p.id) items,
  ROUND(SUM(p.price),2) value FROM suppliers sup JOIN products p ON p.supplier_id = sup.id GROUP BY sup.id),
b AS (SELECT name, items, value, NTILE(3) OVER (ORDER BY value DESC) band FROM s)
SELECT name, items, value, band FROM b WHERE band = 1 ORDER BY value DESC`);

// ---- B: running / months ---------------------------------------------------
show("B1 month running LIMIT 4 (E9)", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend
  FROM orders GROUP BY mon)
SELECT mon, spend, ROUND(SUM(spend) OVER (ORDER BY mon), 2) run FROM m ORDER BY mon LIMIT 4`);
show("B2 two-window month dashboard (M1)", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend
  FROM orders GROUP BY mon)
SELECT mon, spend, ROUND(100.0*spend/SUM(spend) OVER (), 1) pct,
  ROUND(SUM(spend) OVER (ORDER BY mon), 2) run FROM m ORDER BY mon`);
show("B3 top-3 months run+rank (M5)", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend
  FROM orders GROUP BY mon),
t AS (SELECT mon, spend, ROUND(SUM(spend) OVER (ORDER BY mon), 2) run, RANK() OVER (ORDER BY spend DESC) rk FROM m)
SELECT mon, spend, run, rk FROM t WHERE rk <= 3 ORDER BY rk`);
show("B4 three-window top-3 (H2)", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend
  FROM orders GROUP BY mon),
t AS (SELECT mon, spend, ROUND(100.0*spend/SUM(spend) OVER (), 1) pct,
  ROUND(SUM(spend) OVER (ORDER BY mon), 2) run, RANK() OVER (ORDER BY spend DESC) rk FROM m)
SELECT mon, spend, pct, run, rk FROM t WHERE rk <= 3 ORDER BY rk`);
show("B5 MoM pct <= -25 (M6)", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend
  FROM orders GROUP BY mon),
p AS (SELECT mon, spend, LAG(spend) OVER (ORDER BY mon) prev FROM m),
q AS (SELECT mon, spend, prev, ROUND(100.0*(spend-prev)/prev, 1) pct FROM p)
SELECT mon, spend, prev, pct FROM q WHERE pct <= -25 ORDER BY pct`);
show("B6 worst deltas rank LIMIT 2 (H3)", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend
  FROM orders GROUP BY mon),
p AS (SELECT mon, spend, LAG(spend) OVER (ORDER BY mon) prev FROM m),
q AS (SELECT mon, spend, prev, ROUND(spend - prev, 2) delta FROM p)
SELECT mon, delta, RANK() OVER (ORDER BY delta) rk FROM q WHERE prev IS NOT NULL ORDER BY rk LIMIT 2`);
show("B7 expense run+delta head 8 (H9)", `WITH m AS (SELECT strftime('%Y-%m', spent_on) mon,
  ROUND(SUM(amount_cents)/100.0, 2) spend FROM expenses GROUP BY mon)
SELECT mon, spend, ROUND(SUM(spend) OVER (ORDER BY mon), 2) run,
  ROUND(spend - LAG(spend) OVER (ORDER BY mon), 2) delta FROM m ORDER BY mon LIMIT 8`);
show("B8 cohort cumulative (M10)", `WITH f AS (SELECT customer_id, strftime('%Y-%m', MIN(created_at)) cohort
  FROM orders GROUP BY customer_id),
k AS (SELECT cohort, COUNT(*) new_custs FROM f GROUP BY cohort)
SELECT cohort, new_custs, SUM(new_custs) OVER (ORDER BY cohort) cum FROM k ORDER BY cohort`);

// ---- C: tops & outer filters ------------------------------------------------
show("C1 top-1 customer per region (M3)", `WITH s AS (SELECT c.region region, c.name name, ROUND(SUM(o.total),2) spend,
  ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) rn
  FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id)
SELECT region, name, spend FROM s WHERE rn = 1 ORDER BY region`);
show("C2 top-2 customers per region by spend (M4)", `WITH s AS (SELECT c.region region, c.name name,
  ROUND(SUM(o.total),2) spend, ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) rn
  FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id)
SELECT region, name, spend, rn FROM s WHERE rn <= 2 ORDER BY region, rn`);
show("C3 top-2 customers per region by orders (H1)", `WITH s AS (SELECT c.region region, c.name name, COUNT(*) n,
  ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY COUNT(*) DESC) rn
  FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id)
SELECT region, name, n, rn FROM s WHERE rn <= 2 ORDER BY region, rn`);
show("C4 pending share 2dp head3 (M7)", `SELECT o.id, o.total, COUNT(*) OVER () crowd,
  ROUND(100.0*o.total/SUM(o.total) OVER (), 2) share
FROM orders o WHERE o.status = 'pending' ORDER BY share DESC LIMIT 3`);
show("C5 pending 1dp share + pot + crowd LIMIT 2 (H5)", `SELECT o.id, o.total, COUNT(*) OVER () crowd,
  ROUND(SUM(o.total) OVER (), 2) pot, ROUND(100.0*o.total/SUM(o.total) OVER (), 1) share
FROM orders o WHERE o.status = 'pending' ORDER BY share DESC LIMIT 2`);
show("C6 exposure share+rank LIMIT 6 (M8)", `WITH x AS (SELECT c.name name, ROUND(SUM(o.total),2) exposure
  FROM orders o JOIN customers c ON c.id = o.customer_id
  WHERE o.status IN ('cancelled','pending') GROUP BY c.id)
SELECT name, exposure, ROUND(100.0*exposure/SUM(exposure) OVER (), 1) pct,
  RANK() OVER (ORDER BY exposure DESC) rk FROM x ORDER BY rk, name LIMIT 6`);
show("C7 exposure 2dp pct >= 15 (H13)", `WITH x AS (SELECT c.name name, ROUND(SUM(o.total),2) exposure
  FROM orders o JOIN customers c ON c.id = o.customer_id
  WHERE o.status IN ('cancelled','pending') GROUP BY c.id),
t AS (SELECT name, exposure, ROUND(100.0*exposure/SUM(exposure) OVER (), 2) pct,
  RANK() OVER (ORDER BY exposure DESC) rk FROM x)
SELECT name, exposure, pct, rk FROM t WHERE pct >= 15 ORDER BY rk`);
show("C8 one-pass LAG(SUM) leaderboard LIMIT 4 (H12)", `SELECT c.name name, ROUND(SUM(o.total), 2) spend,
  RANK() OVER (ORDER BY SUM(o.total) DESC) rk,
  ROUND(LAG(SUM(o.total)) OVER (ORDER BY SUM(o.total) DESC), 2) prev_spend
FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY rk LIMIT 4`);
show("C9 pending census LIMIT 3 (E3)", `SELECT o.id, o.total, COUNT(*) OVER () crowd
FROM orders o WHERE o.status = 'pending' ORDER BY o.id LIMIT 3`);
show("C10 delivered run+cnum LIMIT 5 (E8)", `SELECT id, total, ROUND(SUM(total) OVER (ORDER BY id), 2) run,
  COUNT(*) OVER (ORDER BY id) cnum FROM orders WHERE status = 'delivered' ORDER BY id LIMIT 5`);

// ---- D: prose receipts / engine quirks --------------------------------------
show("D1 storewide avg vs pending avg", `SELECT
  (SELECT ROUND(AVG(total), 2) FROM orders) store_avg,
  (SELECT ROUND(AVG(total), 2) FROM orders WHERE status = 'pending') pend_avg`);
err("D2 alias inside OVER (single-level fold)", `SELECT strftime('%Y-%m', created_at) mon,
  SUM(SUM(total)) OVER (ORDER BY mon) FROM orders GROUP BY mon`);
err("D3 aliased window in WHERE", `SELECT id, ROW_NUMBER() OVER (ORDER BY id) rn FROM orders WHERE rn <= 2`);
show("D4 one-pass LAG(SUM) unrounded", `SELECT c.name, LAG(SUM(o.total)) OVER (ORDER BY SUM(o.total) DESC) raw_prev
FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY SUM(o.total) DESC LIMIT 2`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done, copy removed");
