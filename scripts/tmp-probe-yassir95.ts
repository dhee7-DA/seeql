// Temp probe for Task 95 yassir expansion — read-only, deleted after use.
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const q = (sql: string) => db.query(sql).all();

console.log("inv cols:", q("PRAGMA table_info(invoices)").map((r: any) => r.name).join(","));
console.log("pay cols:", q("PRAGMA table_info(payments)").map((r: any) => r.name).join(","));
console.log("exp cols:", q("PRAGMA table_info(expenses)").map((r: any) => r.name).join(","));

console.log("=== cs-3: per-invoice coverage classifier (first 10 rows) ===");
console.log(q(`
SELECT i.id, i.status AS claim_status,
  CASE
    WHEN COUNT(p.id) = 0 THEN 'no settlement'
    WHEN SUM(p.amount_cents) = i.amount_cents THEN 'exact'
    ELSE 'partial'
  END AS coverage,
  ROUND(i.amount_cents / 100.0, 2) AS billed,
  ROUND(SUM(COALESCE(p.amount_cents, 0)) / 100.0, 2) AS settled
FROM invoices i
LEFT JOIN payments p ON p.invoice_id = i.id
GROUP BY i.id
ORDER BY settled ASC, i.id
`).slice(0, 10));

console.log("=== cs-4: monthly pacing walk ===");
console.log(q(`
WITH monthly AS (
  SELECT STRFTIME('%Y-%m', created_at) AS month,
         ROUND(SUM(total), 2) AS revenue
  FROM orders
  GROUP BY month
),
pacing AS (
  SELECT month, revenue,
         ROUND(revenue - LAG(revenue) OVER (ORDER BY month), 2) AS delta
  FROM monthly
)
SELECT month, revenue, delta FROM pacing WHERE delta < -1000 ORDER BY month
`));
console.log("LEAD variant rows:", q(`
WITH monthly AS (
  SELECT STRFTIME('%Y-%m', created_at) AS month, ROUND(SUM(total), 2) AS revenue FROM orders GROUP BY month
), pacing AS (
  SELECT month, revenue, ROUND(revenue - LEAD(revenue) OVER (ORDER BY month), 2) AS delta FROM monthly
) SELECT month, revenue, delta FROM pacing WHERE delta < -1000 ORDER BY month
`));
console.log("%Y variant rows:", q(`
WITH monthly AS (
  SELECT STRFTIME('%Y', created_at) AS month, ROUND(SUM(total), 2) AS revenue FROM orders GROUP BY month
), pacing AS (
  SELECT month, revenue, ROUND(revenue - LAG(revenue) OVER (ORDER BY month), 2) AS delta FROM monthly
) SELECT month, revenue, delta FROM pacing WHERE delta < -1000 ORDER BY month
`));
console.log("window-order-revenue variant rows:", q(`
WITH monthly AS (
  SELECT STRFTIME('%Y-%m', created_at) AS month, ROUND(SUM(total), 2) AS revenue FROM orders GROUP BY month
), pacing AS (
  SELECT month, revenue, ROUND(revenue - LAG(revenue) OVER (ORDER BY revenue), 2) AS delta FROM monthly
) SELECT month, revenue, delta FROM pacing WHERE delta < -1000 ORDER BY month
`));
console.log("delta<0 variant count:", q(`
WITH monthly AS (
  SELECT STRFTIME('%Y-%m', created_at) AS month, ROUND(SUM(total), 2) AS revenue FROM orders GROUP BY month
), pacing AS (
  SELECT month, revenue, ROUND(revenue - LAG(revenue) OVER (ORDER BY month), 2) AS delta FROM monthly
) SELECT COUNT(*) AS n FROM pacing WHERE delta < 0
`));

console.log("=== cs-5: cluster aov vs platform mean ===");
console.log(q(`
SELECT c.region AS cluster,
       COUNT(*) AS jobs,
       ROUND(AVG(o.total), 2) AS avg_job_value,
       ROUND((SELECT AVG(total) FROM orders), 2) AS platform_mean
FROM orders o
JOIN customers c ON c.id = o.customer_id
GROUP BY c.region
HAVING AVG(o.total) > (SELECT AVG(total) FROM orders)
ORDER BY avg_job_value DESC
`));
console.log("platform mean unrounded:", q("SELECT AVG(total) FROM orders"));
console.log("AVG(o.id) variant:", q(`
SELECT c.region, COUNT(*) AS n, ROUND(AVG(o.id), 2) AS v
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.region HAVING AVG(o.id) > (SELECT AVG(total) FROM orders)
`));
console.log("join o.id=c.id variant:", q(`
SELECT c.region AS cluster, COUNT(*) AS jobs, ROUND(AVG(o.total), 2) AS v
FROM orders o JOIN customers c ON o.id = c.id
GROUP BY c.region
HAVING AVG(o.total) > (SELECT AVG(total) FROM orders)
ORDER BY v DESC
`));

console.log("=== cs-6: settlement rails census ===");
console.log(q(`
SELECT COUNT(*) AS settlements,
       ROUND(SUM(amount_cents) / 100.0, 2) AS settled_value,
       COUNT(*) FILTER (WHERE method = 'card') AS card_rows,
       ROUND(SUM(amount_cents) FILTER (WHERE method = 'card') / 100.0, 2) AS card_value,
       COUNT(*) FILTER (WHERE method = 'wire') AS wire_rows,
       ROUND(SUM(amount_cents) FILTER (WHERE method = 'wire') / 100.0, 2) AS wire_value,
       ROUND(SUM(amount_cents) FILTER (WHERE amount_cents >= 50000) / 100.0, 2) AS big_ticket_value,
       COUNT(*) FILTER (WHERE amount_cents >= 50000) AS big_ticket_rows
FROM payments
`));
console.log("threshold ladder:", q(`
SELECT
  ROUND(SUM(amount_cents) FILTER (WHERE amount_cents >= 0) / 100.0, 2) AS t0,
  ROUND(SUM(amount_cents) FILTER (WHERE amount_cents >= 25000) / 100.0, 2) AS t250,
  ROUND(SUM(amount_cents) FILTER (WHERE amount_cents >= 50000) / 100.0, 2) AS t500,
  ROUND(SUM(amount_cents) FILTER (WHERE amount_cents >= 100000) / 100.0, 2) AS t1000
FROM payments
`));
console.log("payment methods:", q("SELECT method, COUNT(*) n, ROUND(SUM(amount_cents)/100.0,2) v FROM payments GROUP BY method"));

db.close();
