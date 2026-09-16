/// <reference types="bun-types" />
/** M5 wave-6 facts probe — fresh window figures for cs-1451–1500 on the restored DB. */
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.w6-facts.db");
const db = new Database("scripts/.w6-facts.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`## ${label}`);
    console.log(JSON.stringify(rows).slice(0, 900));
  } catch (e) {
    console.log(`## ${label}\nERROR ${(e as Error).message.slice(0, 140)}`);
  }
}

// ===== T5 rankers =====
q("T5.1 spend ladder full", `SELECT c.name, ROUND(SUM(o.total), 2) AS spend, RANK() OVER (ORDER BY SUM(o.total) DESC) rk, DENSE_RANK() OVER (ORDER BY SUM(o.total) DESC) drk, ROW_NUMBER() OVER (ORDER BY SUM(o.total) DESC) rn FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY rk`);
q("T5.2 distinct spend count", `SELECT COUNT(DISTINCT s) AS distinct_spends FROM (SELECT ROUND(SUM(total), 2) AS s FROM orders GROUP BY customer_id)`);
q("T5.3 order-count ladder", `SELECT c.name, COUNT(o.id) n, RANK() OVER (ORDER BY COUNT(o.id) DESC) rk FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY rk, c.name`);
q("T5.4 supplier rating ladder", `SELECT name, rating, RANK() OVER (ORDER BY rating DESC) rk, ROW_NUMBER() OVER (ORDER BY rating DESC) rn FROM suppliers`);
q("T5.5 product price ladder", `SELECT name, price, RANK() OVER (ORDER BY price DESC) rk FROM products ORDER BY rk`);
q("T5.6 items-per-order ties", `SELECT n, COUNT(*) AS orders_with_n FROM (SELECT order_id, COUNT(*) AS n FROM order_items GROUP BY order_id) GROUP BY n ORDER BY n`);
q("T5.7 spend ASC ladder tail", `SELECT c.name, ROUND(SUM(o.total), 2) AS spend, ROW_NUMBER() OVER (ORDER BY SUM(o.total)) rn FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY rn DESC LIMIT 4`);

// ===== T6 partitions =====
q("T6.1 region member counts + pots", `SELECT c.region, COUNT(DISTINCT c.id) members, ROUND(SUM(o.total), 2) pot FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.region`);
q("T6.2 per-region floor and crown", `SELECT region, name, spend FROM (SELECT c.region, c.name, ROUND(SUM(o.total), 2) AS spend, MIN(ROUND(SUM(o.total), 2)) OVER (PARTITION BY c.region) AS floor, MAX(ROUND(SUM(o.total), 2)) OVER (PARTITION BY c.region) AS crown FROM customers c JOIN orders o ON o.customer_id = c.id) WHERE spend = floor OR spend = crown ORDER BY region, spend`);
q("T6.3 per-region member rank (who is rk1 per region)", `SELECT region, name, spend, rk FROM (SELECT c.region, c.name, ROUND(SUM(o.total), 2) AS spend, RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) rk FROM customers c JOIN orders o ON o.customer_id = c.id) WHERE rk = 1 ORDER BY spend DESC`);
q("T6.4 category stock + price stats", `SELECT category, COUNT(*) n, SUM(stock) stock_pot, ROUND(AVG(price), 2) avg_price, MAX(price) top_price FROM products GROUP BY category`);
q("T6.5 category price ranks", `SELECT name, category, price, RANK() OVER (PARTITION BY category ORDER BY price DESC) rk FROM products WHERE rk <= 2 ORDER BY category, rk`.replace("WHERE rk <= 2", "").replace("ORDER BY category, rk", "ORDER BY category, price DESC"));
q("T6.6 status pots by month count", `SELECT status, COUNT(*) n, ROUND(SUM(total), 2) pot FROM orders GROUP BY status`);
q("T6.7 per-region NTILE on spend", `SELECT region, name, spend, q FROM (SELECT c.region, c.name, ROUND(SUM(o.total), 2) AS spend, NTILE(2) OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) q FROM customers c JOIN orders o ON o.customer_id = c.id) WHERE q = 2 ORDER BY region, spend`);
q("T6.8 invoice amounts", `SELECT COUNT(*) n, MIN(amount) min_inv, MAX(amount) max_inv, ROUND(AVG(amount), 2) avg_inv FROM invoices`);

// ===== T7 lag/lead =====
q("T7.1 month revenue series", `SELECT strftime('%Y-%m', created_at) mo, ROUND(SUM(total), 2) rev FROM orders GROUP BY mo ORDER BY mo`);
q("T7.2 month-over-month delta", `SELECT mo, rev, delta FROM (SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total), 2) AS rev, ROUND(SUM(total) - LAG(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS delta FROM orders GROUP BY mo) WHERE delta IS NOT NULL ORDER BY mo`);
q("T7.3 biggest leap / biggest drop", `SELECT mo, delta FROM (SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total) - LAG(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS delta FROM orders GROUP BY mo) WHERE delta IS NOT NULL ORDER BY delta DESC LIMIT 3`);
q("T7.4 biggest drop", `SELECT mo, delta FROM (SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total) - LAG(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS delta FROM orders GROUP BY mo) WHERE delta IS NOT NULL ORDER BY delta LIMIT 2`);
q("T7.5 up/down month census", `SELECT SUM(CASE WHEN delta > 0 THEN 1 ELSE 0 END) up, SUM(CASE WHEN delta < 0 THEN 1 ELSE 0 END) down FROM (SELECT ROUND(SUM(total) - LAG(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS delta FROM orders GROUP BY strftime('%Y-%m', created_at)) WHERE delta IS NOT NULL`);
q("T7.6 per-customer max gap days", `SELECT name, max_gap FROM (SELECT c.name, MAX(julianday(o.created_at) - LAG(julianday(o.created_at)) OVER (PARTITION BY o.customer_id ORDER BY o.created_at)) AS max_gap FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING COUNT(o.id) > 1) ORDER BY max_gap DESC LIMIT 6`);
q("T7.7 gap census >30d", `SELECT COUNT(*) big_gaps FROM (SELECT julianday(o.created_at) - LAG(julianday(o.created_at)) OVER (PARTITION BY o.customer_id ORDER BY o.created_at) AS gap FROM orders o) WHERE gap IS NOT NULL AND gap > 30`);
q("T7.8 ship lag stats", `SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) avg_lag, MAX(julianday(shipped_at) - julianday(created_at)) max_lag, MIN(julianday(shipped_at) - julianday(created_at)) min_lag, COUNT(*) shipped_n FROM orders WHERE shipped_at IS NOT NULL`);
q("T7.9 ship lag histogram", `SELECT julianday(shipped_at) - julianday(created_at) AS lag_days, COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL GROUP BY lag_days ORDER BY n DESC`);

// ===== T8 running/frames/NTILE =====
q("T8.1 running revenue + crossings", `SELECT mo, rev, run FROM (SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total), 2) AS rev, ROUND(SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS run FROM orders GROUP BY mo) WHERE run >= 20000 ORDER BY mo LIMIT 3`);
q("T8.2 full running series", `SELECT mo, rev, run FROM (SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total), 2) AS rev, ROUND(SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS run FROM orders GROUP BY mo) ORDER BY mo`);
q("T8.3 NTILE(4) month buckets", `SELECT mo, rev, q FROM (SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total), 2) AS rev, NTILE(4) OVER (ORDER BY SUM(total)) q FROM orders GROUP BY mo) ORDER BY q, rev`);
q("T8.4 quartile edges", `SELECT q, MIN(rev) q_min, MAX(rev) q_max, COUNT(*) n FROM (SELECT ROUND(SUM(total), 2) AS rev, NTILE(4) OVER (ORDER BY SUM(total)) q FROM orders GROUP BY strftime('%Y-%m', created_at)) GROUP BY q`);
q("T8.5 moving averages", `SELECT mo, rev, ma2, ma3 FROM (SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total), 2) AS rev, ROUND(AVG(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at) ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) AS ma2, ROUND(AVG(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at) ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS ma3 FROM orders GROUP BY mo) ORDER BY mo`);
q("T8.6 running per-region pot (partition)", `SELECT region, mo, rev, run FROM (SELECT c.region, strftime('%Y-%m', o.created_at) AS mo, ROUND(SUM(o.total), 2) AS rev, ROUND(SUM(SUM(o.total)) OVER (PARTITION BY c.region ORDER BY strftime('%Y-%m', o.created_at)), 2) AS run FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.region, mo) WHERE region = 'LATAM' ORDER BY mo`);
q("T8.7 spend NTILE4 customer buckets", `SELECT q, MIN(spend) q_min, MAX(spend) q_max FROM (SELECT ROUND(SUM(total), 2) AS spend, NTILE(4) OVER (ORDER BY SUM(total)) q FROM orders GROUP BY customer_id) GROUP BY q ORDER BY q`);
q("T8.8 crown cross-check NTILE + RANK", `SELECT name, spend, q, rk FROM (SELECT c.name, ROUND(SUM(o.total), 2) AS spend, NTILE(4) OVER (ORDER BY SUM(o.total)) q, RANK() OVER (ORDER BY SUM(o.total) DESC) rk FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id) WHERE q = 4 AND rk = 1`);
q("T8.9 expenses by month", `SELECT strftime('%Y-%m', entry_date) mo, COUNT(*) n, SUM(debit_cents) debit FROM ledger_entries WHERE debit_cents > 0 GROUP BY mo ORDER BY mo LIMIT 20`);

db.close();
