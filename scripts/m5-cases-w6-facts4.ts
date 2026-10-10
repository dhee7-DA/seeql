/// <reference types="bun-types" />
/** M5 wave-6 facts probe round 4 — last verification batch. */
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.w6-facts6.db");
const db = new Database("scripts/.w6-facts6.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`## ${label}`);
    console.log(JSON.stringify(rows).slice(0, 1000));
  } catch (e) {
    console.log(`## ${label}\nERROR ${(e as Error).message.slice(0, 140)}`);
  }
}

// 1. distinct customers with a >60d order gap (fold distractor for census case)
q("V1 gap60 distinct customers", `SELECT COUNT(*) AS gaps, COUNT(DISTINCT customer_id) AS custs FROM (
  SELECT customer_id, julianday(created_at) - LAG(julianday(created_at)) OVER (PARTITION BY customer_id ORDER BY created_at) AS gap
  FROM orders) WHERE gap IS NOT NULL AND gap > 60`);

// 2. invoice issue gaps per customer (t7-k candidate)
q("V2 invoice issue gaps census", `SELECT COUNT(*) AS total_gaps,
  SUM(CASE WHEN gap > 90 THEN 1 ELSE 0 END) AS g90,
  SUM(CASE WHEN gap > 60 THEN 1 ELSE 0 END) AS g60,
  ROUND(MAX(gap)) AS max_gap FROM (
  SELECT customer_id, julianday(issued_on) - LAG(julianday(issued_on)) OVER (PARTITION BY customer_id ORDER BY issued_on) AS gap
  FROM invoices) WHERE gap IS NOT NULL`);
q("V3 invoice gap ladder per customer", `SELECT c.name, ROUND(MAX(v.gap)) AS max_gap FROM (
  SELECT customer_id, julianday(issued_on) - LAG(julianday(issued_on)) OVER (PARTITION BY customer_id ORDER BY issued_on) AS gap
  FROM invoices) v JOIN customers c ON c.id = v.customer_id GROUP BY v.customer_id ORDER BY max_gap DESC LIMIT 6`);

// 3. cancelled lane top tickets (crown uniqueness)
q("V4 cancelled top tickets", `SELECT c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id
  WHERE o.status = 'cancelled' ORDER BY o.total DESC LIMIT 3`);

// 4. shipped lane top-4 (3rd ticket determinism)
q("V5 shipped top tickets", `SELECT c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id
  WHERE o.status = 'shipped' ORDER BY o.total DESC LIMIT 4`);

// 5. delivered lane 2nd/3rd (Alice 705.23 uniqueness)
q("V6 delivered top tickets", `SELECT c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id
  WHERE o.status = 'delivered' ORDER BY o.total DESC LIMIT 4`);

// 6. Alice max ticket (bench-case distractor sanity)
q("V7 Alice ticket stats", `SELECT MAX(total) AS top_t, COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Alice Chen'`);

// 7. expenses > 0 filter sanity (distractor '<' → empty?)
q("V8 expenses negative count", `SELECT COUNT(*) AS neg FROM expenses WHERE amount_cents < 0`);
q("V9 ledger negative debit count", `SELECT COUNT(*) AS neg FROM ledger_entries WHERE debit_cents < 0`);

// 8. June delta (slide case)
q("V10 june slide delta", `SELECT mo, delta FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total) - LAG(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS delta
  FROM orders GROUP BY mo) WHERE mo = '2024-06'`);

// 9. pending floor uniqueness
q("V11 pending low tickets", `SELECT total, COUNT(*) AS n FROM orders WHERE status = 'pending' GROUP BY total ORDER BY total LIMIT 3`);

// 10. EU rk3 (Pedro) + ASC flip rows
q("V12 EU ladder asc rk3", `SELECT name, spend, rk FROM (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend, RANK() OVER (ORDER BY SUM(o.total)) AS rk
  FROM customers c JOIN orders o ON o.customer_id = c.id WHERE c.region = 'EU' GROUP BY c.id) WHERE rk = 3`);

db.close();
