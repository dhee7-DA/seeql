/// <reference types="bun-types" />
/** M5 probe follow-ups: NTILE buckets via subquery wrap, RANK tie demos. */
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m5d2.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const one = (sql: string, label: string) => {
  try {
    const r = db.query(sql).all();
    console.log(`${label} =`, JSON.stringify(r).slice(0, 400));
  } catch (e) {
    console.log(`${label} ERR:`, e instanceof Error ? e.message : String(e));
  }
};

one("SELECT q, COUNT(*) n FROM (SELECT NTILE(4) OVER (ORDER BY id) q FROM orders) GROUP BY q ORDER BY q", "ntile4-orders-103");
one("SELECT q, COUNT(*) n FROM (SELECT NTILE(3) OVER (ORDER BY id) q FROM orders) GROUP BY q ORDER BY q", "ntile3-orders-103");
one("SELECT q, COUNT(*) n FROM (SELECT NTILE(1) OVER (ORDER BY id) q FROM orders) GROUP BY q", "ntile1-orders");
one("SELECT COUNT(DISTINCT q) n, MIN(q) mn, MAX(q) mx FROM (SELECT NTILE(150) OVER (ORDER BY id) q FROM orders)", "ntile150-over-103");
one("SELECT q, COUNT(*) n FROM (SELECT NTILE(4) OVER (ORDER BY t DESC) q FROM (SELECT SUM(total) t FROM orders GROUP BY customer_id)) GROUP BY q ORDER BY q", "ntile4-customer-spends");
one("SELECT name, t, q FROM (SELECT c.name, SUM(o.total) t, NTILE(4) OVER (ORDER BY SUM(o.total) DESC) q FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id) WHERE q = 4", "top-quartile-names");
one("WITH m AS (SELECT strftime('%Y-%m', created_at) mo, COUNT(*) n FROM orders GROUP BY mo) SELECT mo, n, RANK() OVER (ORDER BY n DESC) rk, DENSE_RANK() OVER (ORDER BY n DESC) dr FROM m ORDER BY rk, mo", "rank-month-counts");
one("WITH w AS (SELECT strftime('%w', created_at) wd, COUNT(*) n FROM orders GROUP BY wd) SELECT wd, n, RANK() OVER (ORDER BY n DESC) rk, DENSE_RANK() OVER (ORDER BY n DESC) dr FROM w ORDER BY rk, wd", "rank-weekday-counts");
one("SELECT q, COUNT(*) n FROM (SELECT NTILE(4) OVER (PARTITION BY region ORDER BY id) q FROM customers) GROUP BY q ORDER BY q", "ntile4-region-partition");
one("SELECT COUNT(*) n FROM (SELECT id, NTILE(4) OVER (ORDER BY total DESC) q FROM orders) WHERE q = 1", "orders-top-quartile");
one("SELECT id, total, NTILE(2) OVER (ORDER BY id) h FROM orders WHERE id <= 5", "ntile2-head");
one("SELECT SUM(total) OVER (ORDER BY id RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) running FROM orders WHERE id = 5", "range-unbounded-id5");
one("SELECT id, total, SUM(total) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND 1 FOLLOWING) w FROM orders WHERE id <= 3", "frame-2p1f");
one("SELECT id, COUNT(*) OVER (PARTITION BY customer_id) n_orders FROM orders WHERE id <= 3", "count-partition-stamp");
one("SELECT id, created_at, strftime('%Y-%m', created_at) mo, ROW_NUMBER() OVER (PARTITION BY strftime('%Y-%m', created_at) ORDER BY total DESC) rn FROM orders WHERE id <= 6", "rownum-in-month");

db.close();
rmSync(COPY);
console.log("(copy deleted)");
