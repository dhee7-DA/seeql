/// <reference types="bun-types" />
/** M5 wave-2 fact probes — t5 rankers / t6 partition / t7 offsets / t8 running+frames+NTILE. */
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
let n = 195;
const q = (label: string, sql: string) => {
  n++;
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const cells = rows.map((r) => Object.values(r).map((v) => (v === null ? "NULL" : typeof v === "number" ? (Number.isInteger(v) ? v : Number(v.toFixed(6))) : v)).join(" | "));
    console.log(`T${String(n).padStart(2, "0")} ${label}`);
    console.log(`   ${cells.slice(0, 22).join("  ;;  ") || "(0 rows)"}`);
  } catch (e) {
    console.log(`T${String(n).padStart(2, "0")} ${label} ERROR: ${e instanceof Error ? e.message : e}`);
  }
};

// ---------- spend stage (per-customer totals) ----------
const SPEND = `SELECT c.id, c.name, c.region, ROUND(SUM(o.total), 2) AS spend, COUNT(o.id) AS n_orders FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id`;

// ---------- t5: rankers ----------
q("spend leaderboard ranked", `WITH s AS (${SPEND}) SELECT name, spend, ROW_NUMBER() OVER (ORDER BY spend DESC) rn, RANK() OVER (ORDER BY spend DESC) rk, DENSE_RANK() OVER (ORDER BY spend DESC) drk FROM s ORDER BY spend DESC LIMIT 8`);
q("spend leaderboard bottom", `WITH s AS (${SPEND}) SELECT name, spend, ROW_NUMBER() OVER (ORDER BY spend DESC) rn FROM s ORDER BY spend DESC LIMIT 4 OFFSET 12`);
q("spend rank of 6640.56", `WITH s AS (${SPEND}) SELECT name, spend, RANK() OVER (ORDER BY spend DESC) rk FROM s WHERE spend = 6640.56`);
q("order totals ranked desc", `SELECT id, total, ROW_NUMBER() OVER (ORDER BY total DESC) rn FROM orders ORDER BY total DESC LIMIT 6`);
q("order total rank 10", `SELECT id, total FROM (SELECT id, total, ROW_NUMBER() OVER (ORDER BY total DESC) rn FROM orders) WHERE rn = 10`);
q("order total rank 25", `SELECT id, total FROM (SELECT id, total, ROW_NUMBER() OVER (ORDER BY total DESC) rn FROM orders) WHERE rn = 25`);
q("order totals tie check", `SELECT total, COUNT(*) FROM orders GROUP BY total HAVING COUNT(*) > 1 LIMIT 6`);
q("product price rank desc", `SELECT name, price, RANK() OVER (ORDER BY price DESC) rk FROM products ORDER BY price DESC LIMIT 5`);
q("product price rank 199.99", `SELECT name, RANK() OVER (ORDER BY price DESC) rk FROM products WHERE price = 199.99`);
q("dense vs rank on prices", `SELECT DENSE_RANK() OVER (ORDER BY price DESC) drk, COUNT(*) FROM products GROUP BY drk`);
q("signup order by date rn", `SELECT name, created_at, ROW_NUMBER() OVER (ORDER BY created_at) rn FROM customers ORDER BY rn LIMIT 4`);
q("signup rn 8", `SELECT name, created_at FROM (SELECT name, created_at, ROW_NUMBER() OVER (ORDER BY created_at) rn FROM customers) WHERE rn = 8`);
q("top spend per region rn1", `WITH s AS (${SPEND}), r AS (SELECT name, region, spend, ROW_NUMBER() OVER (PARTITION BY region ORDER BY spend DESC) rn FROM s) SELECT region, name, spend FROM r WHERE rn = 1 ORDER BY spend DESC`);
q("supplier rating rank", `SELECT name, rating, RANK() OVER (ORDER BY rating DESC) rk FROM suppliers ORDER BY rk`);
q("order count per customer rank", `WITH s AS (${SPEND}) SELECT name, n_orders, RANK() OVER (ORDER BY n_orders DESC) rk FROM s ORDER BY rk LIMIT 6`);

// ---------- t6: partition ----------
q("region spend ranks full", `WITH s AS (${SPEND}) SELECT region, name, spend, RANK() OVER (PARTITION BY region ORDER BY spend DESC) rk FROM s ORDER BY region, rk`);
q("region podium count", `WITH s AS (${SPEND}), r AS (SELECT region, name, RANK() OVER (PARTITION BY region ORDER BY spend DESC) rk FROM s) SELECT COUNT(*) FROM r WHERE rk <= 2`);
q("status month ranks", `WITH m AS (SELECT status, strftime('%Y-%m', created_at) mo, COUNT(*) n FROM orders GROUP BY status, mo) SELECT status, mo, n, RANK() OVER (PARTITION BY status ORDER BY n DESC) rk FROM m WHERE rk <= 2`);
q("category price ranks", `SELECT category, name, price, RANK() OVER (PARTITION BY category ORDER BY price DESC) rk FROM products ORDER BY category, rk`);
q("category top prices", `SELECT category, name, price FROM (SELECT category, name, price, RANK() OVER (PARTITION BY category ORDER BY price DESC) rk FROM products) WHERE rk = 1 ORDER BY price DESC`);
q("customer monthly order ranks", `WITH m AS (SELECT customer_id, strftime('%Y-%m', created_at) mo, COUNT(*) n FROM orders GROUP BY customer_id, mo) SELECT COUNT(*) FROM (SELECT customer_id, mo, RANK() OVER (PARTITION BY customer_id ORDER BY n DESC) rk FROM m) WHERE rk = 1 AND n >= 2`);
q("status counts ranked", `SELECT status, n, RANK() OVER (ORDER BY n DESC) rk FROM (SELECT status, COUNT(*) n FROM orders GROUP BY status) ORDER BY rk`);
q("supplier product count rank", `SELECT s.name, COUNT(p.id) n, RANK() OVER (ORDER BY COUNT(p.id) DESC) rk FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id GROUP BY s.id ORDER BY rk`);
q("best day per customer", `WITH d AS (SELECT customer_id, DATE(created_at) day, SUM(total) rev FROM orders GROUP BY customer_id, day), r AS (SELECT customer_id, day, rev, RANK() OVER (PARTITION BY customer_id ORDER BY rev DESC) rk FROM d) SELECT COUNT(*) FROM r WHERE rk = 1`);
q("region order-count rank", `WITH r AS (SELECT region, COUNT(*) n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY region) SELECT region, n, RANK() OVER (ORDER BY n DESC) rk FROM r ORDER BY rk`);

// ---------- t7: LAG / LEAD ----------
q("month revenue with lag", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, ROUND(SUM(total), 2) rev FROM orders GROUP BY mo) SELECT mo, rev, ROUND(rev - LAG(rev) OVER (ORDER BY mo), 2) delta FROM m ORDER BY mo`);
q("month order-count lag", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, COUNT(*) n FROM orders GROUP BY mo) SELECT mo, n, n - LAG(n) OVER (ORDER BY mo) d FROM m ORDER BY mo`);
q("month rev MoM drops", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) rev FROM orders GROUP BY mo), d AS (SELECT mo, rev - LAG(rev) OVER (ORDER BY mo) delta FROM m) SELECT COUNT(*) FROM d WHERE delta < 0`);
q("month rev MoM gains", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) rev FROM orders GROUP BY mo), d AS (SELECT mo, rev - LAG(rev) OVER (ORDER BY mo) delta FROM m) SELECT COUNT(*) FROM d WHERE delta > 0`);
q("first month LEAD check", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) rev FROM orders GROUP BY mo) SELECT mo, rev, LAG(rev) OVER (ORDER BY mo) prev, LEAD(rev) OVER (ORDER BY mo) nxt FROM m ORDER BY mo LIMIT 3`);
q("alice order gaps", `WITH a AS (SELECT created_at, julianday(created_at) jd FROM orders WHERE customer_id = 1 ORDER BY created_at) SELECT created_at, ROUND(jd - LAG(jd) OVER (ORDER BY jd), 1) gap FROM a`);
q("per-customer first-order gaps", `WITH g AS (SELECT customer_id, created_at, julianday(created_at) jd FROM orders ORDER BY customer_id, created_at), l AS (SELECT customer_id, created_at, jd - LAG(jd) OVER (PARTITION BY customer_id ORDER BY jd) gap FROM g) SELECT COUNT(*) FROM l WHERE gap IS NULL`);
q("customer order sequences", `WITH g AS (SELECT customer_id, created_at, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at) rn FROM orders) SELECT COUNT(*) FROM g WHERE rn = 1`);
q("alice order count", `SELECT COUNT(*) FROM orders WHERE customer_id = 1`);
q("order-to-order lag same customer > 30d", `WITH g AS (SELECT customer_id, created_at, julianday(created_at) jd FROM orders), l AS (SELECT customer_id, created_at, jd - LAG(jd) OVER (PARTITION BY customer_id ORDER BY jd) gap FROM g) SELECT COUNT(*) FROM l WHERE gap > 30`);
q("invoice months lag", `WITH m AS (SELECT strftime('%Y-%m', issued_on) mo, SUM(amount_cents) pot FROM invoices GROUP BY mo) SELECT mo, pot, pot - LAG(pot) OVER (ORDER BY mo) d FROM m ORDER BY mo LIMIT 6`);
q("expense months lag", `WITH m AS (SELECT strftime('%Y-%m', spent_on) mo, SUM(amount_cents) pot FROM expenses GROUP BY mo) SELECT mo, pot, pot - LAG(pot) OVER (ORDER BY mo) d FROM m ORDER BY mo LIMIT 4`);
q("lag over customer spend rank", `WITH s AS (${SPEND}) SELECT name, spend, LAG(spend) OVER (ORDER BY spend DESC) above FROM s ORDER BY spend DESC LIMIT 5`);

// ---------- t8: running totals, frames, NTILE ----------
q("running revenue over months", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, ROUND(SUM(total), 2) rev FROM orders GROUP BY mo) SELECT mo, rev, ROUND(SUM(rev) OVER (ORDER BY mo), 2) run FROM m ORDER BY mo`);
q("running total final", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) rev FROM orders GROUP BY mo) SELECT ROUND(SUM(rev) OVER (ORDER BY mo), 2) FROM m ORDER BY mo DESC LIMIT 1`);
q("running total crosses 20000", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) rev FROM orders GROUP BY mo), r AS (SELECT mo, SUM(rev) OVER (ORDER BY mo) run FROM m) SELECT COUNT(*) FROM r WHERE run < 20000`);
q("running crosses 25000 at", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) rev FROM orders GROUP BY mo), r AS (SELECT mo, SUM(rev) OVER (ORDER BY mo) run FROM m) SELECT mo, ROUND(run, 2) FROM r WHERE run >= 25000 ORDER BY mo LIMIT 1`);
q("ntile4 spend quartiles", `WITH s AS (${SPEND}) SELECT NTILE(4) OVER (ORDER BY spend DESC) q, COUNT(*) n, ROUND(MIN(spend), 2) lo, ROUND(MAX(spend), 2) hi FROM s GROUP BY q ORDER BY q`);
q("ntile4 top quartile min", `WITH s AS (${SPEND}), t AS (SELECT spend, NTILE(4) OVER (ORDER BY spend DESC) q FROM s) SELECT ROUND(MIN(spend), 2) FROM t WHERE q = 1`);
q("ntile4 bottom quartile max", `WITH s AS (${SPEND}), t AS (SELECT spend, NTILE(4) OVER (ORDER BY spend DESC) q FROM s) SELECT ROUND(MAX(spend), 2) FROM t WHERE q = 4`);
q("moving avg 3-month", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) rev FROM orders GROUP BY mo) SELECT mo, ROUND(AVG(rev) OVER (ORDER BY mo ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) ma2 FROM m ORDER BY mo LIMIT 6`);
q("frame 2-month ma first", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) rev FROM orders GROUP BY mo) SELECT ROUND(AVG(rev) OVER (ORDER BY mo ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) FROM m ORDER BY mo LIMIT 1`);
q("running orders count", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, COUNT(*) n FROM orders GROUP BY mo) SELECT mo, n, SUM(n) OVER (ORDER BY mo) run FROM m ORDER BY mo LIMIT 6`);
q("sum over partition region", `WITH s AS (${SPEND}) SELECT name, region, spend, ROUND(SUM(spend) OVER (PARTITION BY region), 2) region_pot FROM s ORDER BY region, spend DESC`);
q("region pots", `WITH s AS (${SPEND}) SELECT DISTINCT ROUND(SUM(spend) OVER (PARTITION BY region), 2) pot FROM s ORDER BY pot DESC`);
q("running total over order dates crosses 5000", `WITH d AS (SELECT DATE(created_at) day, SUM(total) rev FROM orders GROUP BY day), r AS (SELECT day, SUM(rev) OVER (ORDER BY day) run FROM d) SELECT COUNT(*) FROM r WHERE run < 5000`);
db.close();
