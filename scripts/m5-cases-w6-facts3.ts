/// <reference types="bun-types" />
/** M5 wave-6 facts probe round 3 — fixed-shape window grounds + schema check. */
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.w6-facts5.db");
const db = new Database("scripts/.w6-facts5.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`## ${label}`);
    console.log(JSON.stringify(rows).slice(0, 1100));
  } catch (e) {
    console.log(`## ${label}\nERROR ${(e as Error).message.slice(0, 140)}`);
  }
}

// ---- schema ----
for (const t of ["customers", "orders", "invoices", "payments", "expenses", "ledger_entries"]) {
  q(`schema ${t}`, `SELECT name FROM pragma_table_info('${t}')`);
}

// ---- A: per-region member ladders (FIXED shape: GROUP BY region, id) ----
q("A1 region ladders", `SELECT region, name, spend, rk, drk FROM (
  SELECT c.region, c.name, ROUND(SUM(o.total), 2) AS spend,
    RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) AS rk,
    DENSE_RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) AS drk
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.region, c.id)
ORDER BY region, rk`);
q("A2 region rk1 count", `SELECT COUNT(*) AS crowns FROM (
  SELECT c.region, RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) AS rk
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.region, c.id) WHERE rk = 1`);
q("A3 NTILE(2) per region q2 census", `SELECT COUNT(*) AS bottom_half FROM (
  SELECT c.region, NTILE(2) OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) AS q
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.region, c.id) WHERE q = 2`);
q("A4 NTILE(2) per region q2 members", `SELECT region, name, spend FROM (
  SELECT c.region, c.name, ROUND(SUM(o.total), 2) AS spend,
    NTILE(2) OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) AS q
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.region, c.id) WHERE q = 2 ORDER BY region, spend DESC`);

// ---- C: per-customer invoice counts (ranker ties?) ----
q("C1 invoice count ladder", `SELECT c.name, n, RANK() OVER (ORDER BY n DESC) rk FROM (
  SELECT customer_id, COUNT(*) AS n FROM invoices GROUP BY customer_id) i2
  JOIN customers c ON c.id = i2.customer_id ORDER BY rk, c.name`);
q("C2 invoice count distinct", `SELECT n, COUNT(*) AS members FROM (
  SELECT customer_id, COUNT(*) AS n FROM invoices GROUP BY customer_id) GROUP BY n ORDER BY n`);
q("C3 customers without invoices", `SELECT COUNT(*) AS no_inv FROM customers c WHERE NOT EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id)`);

// ---- D: gap grounds (proper wrap) ----
q("D1 global max gap", `SELECT MAX(gap) AS max_gap, COUNT(*) AS total_gaps FROM (
  SELECT julianday(created_at) - LAG(julianday(created_at)) OVER (PARTITION BY customer_id ORDER BY created_at) AS gap FROM orders) WHERE gap IS NOT NULL`);
q("D2 per-customer max gaps", `SELECT c.name, ROUND(MAX(g.gap)) AS max_gap FROM (
  SELECT customer_id, julianday(created_at) - LAG(julianday(created_at)) OVER (PARTITION BY customer_id ORDER BY created_at) AS gap FROM orders) g
  JOIN customers c ON c.id = g.customer_id GROUP BY g.customer_id ORDER BY max_gap DESC LIMIT 10`);

// ---- E: LAG offsets on month revenue ----
q("E1 opening delta with zero default", `SELECT mo, rev, delta FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total), 2) AS rev,
    ROUND(SUM(total) - LAG(SUM(total), 1, 0) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS delta
  FROM orders GROUP BY mo) WHERE mo IN ('2024-01','2025-02') ORDER BY mo`);
q("E2 offset-2 swings", `SELECT mo, rev, prev2, swing FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total), 2) AS rev,
    LAG(ROUND(SUM(total), 2), 2) OVER (ORDER BY strftime('%Y-%m', created_at)) AS prev2,
    ROUND(SUM(total) - LAG(SUM(total), 2) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS swing
  FROM orders GROUP BY mo) WHERE prev2 IS NOT NULL ORDER BY mo LIMIT 6`);
q("E3 LEAD next-month pins", `SELECT mo, rev, nxt FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total), 2) AS rev,
    LEAD(ROUND(SUM(total), 2)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS nxt
  FROM orders GROUP BY mo) WHERE mo IN ('2024-01','2024-06','2024-10','2025-01') ORDER BY mo`);

// ---- L: ledger month debit deltas ----
q("L1 ledger month debit deltas", `SELECT mo, debit, delta FROM (
  SELECT strftime('%Y-%m', entry_date) AS mo, SUM(debit_cents) AS debit,
    SUM(debit_cents) - LAG(SUM(debit_cents)) OVER (ORDER BY strftime('%Y-%m', entry_date)) AS delta
  FROM ledger_entries WHERE debit_cents > 0 GROUP BY mo) WHERE delta IS NOT NULL ORDER BY delta DESC LIMIT 4`);
q("L2 ledger month debit deltas drops", `SELECT mo, debit, delta FROM (
  SELECT strftime('%Y-%m', entry_date) AS mo, SUM(debit_cents) AS debit,
    SUM(debit_cents) - LAG(SUM(debit_cents)) OVER (ORDER BY strftime('%Y-%m', entry_date)) AS delta
  FROM ledger_entries WHERE debit_cents > 0 GROUP BY mo) WHERE delta IS NOT NULL ORDER BY delta LIMIT 3`);
q("L3 expense month deltas", `SELECT mo, pot, delta FROM (
  SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents) AS pot,
    SUM(amount_cents) - LAG(SUM(amount_cents)) OVER (ORDER BY strftime('%Y-%m', spent_on)) AS delta
  FROM expenses GROUP BY mo) WHERE delta IS NOT NULL ORDER BY delta DESC LIMIT 3`);

// ---- G: lane min/max tickets ----
q("G1 lane ticket floors", `SELECT status, MIN(total) AS floor_t, MAX(total) AS top_t, COUNT(*) AS n FROM orders GROUP BY status`);
q("G2 delivered 2nd ticket", `SELECT name, total FROM (
  SELECT c.name, o.total, ROW_NUMBER() OVER (PARTITION BY o.status ORDER BY o.total DESC) AS rn
  FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'delivered') WHERE rn = 2`);
q("G3 shipped 3rd ticket", `SELECT name, total FROM (
  SELECT c.name, o.total, ROW_NUMBER() OVER (PARTITION BY o.status ORDER BY o.total DESC) AS rn
  FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'shipped') WHERE rn = 3`);

// ---- J: order-count ladder with name tiebreak ----
q("J1 order ladder numbered", `SELECT name, n, rn FROM (
  SELECT c.name, COUNT(o.id) AS n, ROW_NUMBER() OVER (ORDER BY COUNT(o.id) DESC, c.name) AS rn
  FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id) WHERE rn BETWEEN 5 AND 12 ORDER BY rn`);

// ---- K: payment method running crossings ----
q("K1 card running crossings", `SELECT paid_on, run FROM (
  SELECT paid_on, ROUND(SUM(SUM(amount_cents)) OVER (ORDER BY paid_on), 2) / 100 AS run
  FROM payments WHERE method = 'card' GROUP BY paid_on) WHERE run >= 30000 LIMIT 2`);
q("K2 wire running crossings", `SELECT paid_on, run FROM (
  SELECT paid_on, ROUND(SUM(SUM(amount_cents)) OVER (ORDER BY paid_on), 2) / 100 AS run
  FROM payments WHERE method = 'wire' GROUP BY paid_on) WHERE run >= 25000 LIMIT 2`);
q("K3 wire running full tail", `SELECT paid_on, run FROM (
  SELECT paid_on, ROUND(SUM(SUM(amount_cents)) OVER (ORDER BY paid_on), 2) / 100 AS run
  FROM payments WHERE method = 'wire' GROUP BY paid_on) ORDER BY paid_on DESC LIMIT 4`);

// ---- month order counts (LAG on counts) ----
q("M1 orders per month + delta", `SELECT mo, n, dn FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n,
    COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS dn
  FROM orders GROUP BY mo) WHERE dn IS NOT NULL ORDER BY dn DESC LIMIT 4`);
q("M2 orders per month full", `SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n FROM orders GROUP BY mo ORDER BY mo`);

// ---- invoices: amounts ----
q("I1 invoice amount stats", `SELECT COUNT(*) n, MIN(amount_cents) min_c, MAX(amount_cents) max_c, ROUND(AVG(amount_cents), 2) avg_c FROM invoices`);
q("I2 open invoice count by region", `SELECT c.region, COUNT(*) n FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.status = 'open' GROUP BY c.region`);

db.close();
