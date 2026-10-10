/// <reference types="bun-types" />
/** M6 wave-4 probe — x8 capstone figures (multi-clinic-move assemblies). */
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.m6w4-facts.db");
const db = new Database("scripts/.m6w4-facts.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`## ${label}`);
    console.log(JSON.stringify(rows).slice(0, 1200));
  } catch (e) {
    console.log(`## ${label}\nERROR ${(e as Error).message.slice(0, 140)}`);
  }
}

// C1: per-region lane census (FILTER + join)
q("C1 region lanes", `SELECT c.region,
  COUNT(*) FILTER (WHERE o.status = 'delivered') AS del,
  COUNT(*) FILTER (WHERE o.status = 'shipped') AS shp,
  COUNT(*) FILTER (WHERE o.status = 'pending') AS pnd,
  COUNT(*) FILTER (WHERE o.status = 'cancelled') AS can
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.region ORDER BY c.region`);
// C2: global spend rank rn2 + rn3
q("C2 spend ranks", `SELECT name, spend, rn FROM (
  SELECT c.name, ROUND(SUM(o.total),2) AS spend,
    ROW_NUMBER() OVER (ORDER BY SUM(o.total) DESC) AS rn
  FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id
) WHERE rn <= 3`);
// C3: product price stats + premium count
q("C3 avg price", `SELECT ROUND(AVG(price),2) AS avg_price, COUNT(*) AS n FROM products WHERE price > (SELECT AVG(price) FROM products)`);
// C4: customer quartiles
q("C4 quartiles", `SELECT q, COUNT(*) AS members, ROUND(SUM(spend),2) AS pot FROM (
  SELECT c.id, ROUND(SUM(o.total),2) AS spend,
    NTILE(4) OVER (ORDER BY SUM(o.total) DESC) AS q
  FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id
) GROUP BY q ORDER BY q`);
// C5: lane revenue shares
q("C5 lane shares", `SELECT status, ROUND(SUM(total),2) AS rev, ROUND(100.0 * SUM(total) / (SELECT SUM(total) FROM orders), 2) AS share FROM orders GROUP BY status ORDER BY rev DESC`);
// C6: invoice-free members' global ranks
q("C6 ghost ranks", `SELECT c.name, ROUND(SUM(o.total),2) AS spend,
  RANK() OVER (ORDER BY SUM(o.total) DESC) AS rk
FROM orders o JOIN customers c ON c.id = o.customer_id
WHERE c.id IN (SELECT customer_id FROM orders
  EXCEPT SELECT customer_id FROM invoices)
GROUP BY c.id ORDER BY rk`);
// C7: region spend half census (NTILE 2 per region)
q("C7 region halves", `SELECT region, COUNT(*) AS bottom_half FROM (
  SELECT c.region, c.id, NTILE(2) OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) AS q
  FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region, c.id
) WHERE q = 2 GROUP BY region ORDER BY region`);
// C8: month count jumps
q("C8 month jumps", `SELECT mo, n, dn FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n,
    COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS dn
  FROM orders GROUP BY mo) WHERE dn IS NOT NULL ORDER BY dn DESC LIMIT 3`);
// C9: two-source stack
q("C9 source stack", `SELECT 'orders' AS source, COUNT(*) AS rows_n FROM orders UNION ALL SELECT 'invoices', COUNT(*) FROM invoices UNION ALL SELECT 'payments', COUNT(*) FROM payments`);
// C10: card running wall + window (recheck)
q("C10 card wall", `SELECT paid_on, run FROM (
  SELECT paid_on, ROUND(SUM(SUM(amount_cents)) OVER (ORDER BY paid_on), 2) / 100 AS run
  FROM payments WHERE method = 'card' GROUP BY paid_on) WHERE run >= 30000 LIMIT 1`);
// C11: region crowns
q("C11 region crowns", `SELECT region, name, spend FROM (
  SELECT c.region, c.name, ROUND(SUM(o.total),2) AS spend,
    RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) AS rk
  FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region, c.id
) WHERE rk = 1 ORDER BY region`);
// C12: ghost fold via CTE (verify)
q("C12 ghost cte", `WITH ghost AS (
  SELECT c.name FROM invoices i RIGHT JOIN customers c ON i.customer_id = c.id WHERE i.id IS NULL
) SELECT GROUP_CONCAT(name, ', ' ORDER BY name) AS line FROM ghost`);
// C13: big-month census via FILTER (months with > N orders)
q("C13 busy months", `SELECT COUNT(*) AS busy FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n FROM orders GROUP BY mo
) WHERE n >= 7`);
q("C13b month counts", `SELECT n, COUNT(*) AS months FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n FROM orders GROUP BY mo
) GROUP BY n ORDER BY n`);
// C14: MA2 month (window + smooth)
q("C14 ma2", `SELECT mo, ma FROM (
  SELECT strftime('%Y-%m', created_at) AS mo,
    ROUND(AVG(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at) ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) AS ma
  FROM orders GROUP BY mo) WHERE mo = '2024-07'`);

db.close();
