// m4-bank-d probes round 3 — readonly, bun:sqlite only
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });

const probes: Array<[string, string]> = [
  ["D1 empty-inner scalar NULL", `SELECT COUNT(*) AS n FROM customers c WHERE (SELECT MAX(total) FROM orders o WHERE o.customer_id = c.id AND o.status='nope') IS NULL`],
  ["D2 column-list step rename", `WITH RECURSIVE c(x) AS (SELECT 1 AS n UNION ALL SELECT x+1 FROM c WHERE x < 3) SELECT * FROM c`],
  ["D3 anchor alias no list", `WITH RECURSIVE c AS (SELECT 1 AS n UNION ALL SELECT n+1 FROM c WHERE n < 3) SELECT * FROM c LIMIT 1`],
  ["D4 ORDER BY 1 inside parens", `WITH RECURSIVE c(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM c WHERE n < 5 ORDER BY 1) SELECT count(*) AS n FROM c`],
  ["D5 forward ref CTEs", `WITH a AS (SELECT * FROM b), b AS (SELECT 1 AS x) SELECT * FROM a`],
  ["D6 mutual recursive", `WITH RECURSIVE a AS (SELECT 1 AS x UNION ALL SELECT x FROM b), b AS (SELECT 2 AS x) SELECT * FROM a`],
  ["D7 empty ladder days", `WITH RECURSIVE days(d) AS (SELECT date((SELECT MIN(created_at) FROM orders)) AS d UNION ALL SELECT date(d, '+1 day') FROM days WHERE d < date((SELECT MAX(created_at) FROM orders))) SELECT COUNT(*) AS n_empty FROM days LEFT JOIN orders o ON date(o.created_at) = days.d WHERE o.id IS NULL`],
  ["D8 solo-order customers", `SELECT c.id, c.name FROM customers c JOIN (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id HAVING COUNT(*) = 1) s ON s.customer_id = c.id`],
  ["D9 flag covers 2nd CTE", `WITH RECURSIVE a AS (SELECT 1 AS x), b AS (SELECT 1 AS y UNION ALL SELECT y+1 FROM b WHERE y < 3) SELECT group_concat(y) AS g FROM b`],
  ["D10 per-CTE RECURSIVE", `WITH a AS (SELECT 1 AS x), RECURSIVE b AS (SELECT 2 AS x) SELECT * FROM a, b`],
  ["D11 pending with shipped_at", `SELECT COUNT(*) AS n FROM orders WHERE status='pending' AND shipped_at IS NOT NULL`],
  ["D12 orders on first day", `SELECT COUNT(*) AS n FROM orders WHERE date(created_at) = (SELECT MIN(date(created_at)) FROM orders)`],
  ["D13 busiest day", `SELECT date(created_at) AS d, COUNT(*) AS n FROM orders GROUP BY date(created_at) ORDER BY n DESC, d ASC LIMIT 1`],
  ["D14 big order pairs", `SELECT group_concat(id || ':' || total) AS pairs FROM orders WHERE total > 900`],
  ["D15 LATAM customer", `SELECT c.id, c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS n_orders FROM customers c WHERE c.region = 'LATAM'`],
  ["D16 NOT EXISTS shipped-status", `SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped')`],
  ["D17 EXISTS shipped-status", `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='shipped')`],
  ["D18 store avg stamp value", `SELECT (SELECT ROUND(AVG(total),2) FROM orders) AS v`],
  ["D19 c2 name", `SELECT name FROM customers WHERE id = 2`],
  ["D21 derived over-2000", `SELECT COUNT(*) AS n FROM (SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id) WHERE s > 2000`],
  ["D22 EU region spend", `SELECT c.region AS region, ROUND(SUM(o.total),2) AS spend FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.region ORDER BY spend DESC LIMIT 1`],
  ["D23 max total", `SELECT MAX(total) AS v FROM orders`],
];

for (const [label, sql] of probes) {
  try {
    console.log(label, "=>", JSON.stringify(db.query(sql).all()));
  } catch (e: any) {
    console.log(label, "=> ERROR:", e.message);
  }
}
