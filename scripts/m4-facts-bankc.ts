// Bank-C extra probes (m4 derived.ts + cte.ts drafting) — read-only, bun:sqlite.
// Receipts P01–P56 live in scripts/m4-facts.ts / m4-facts-out.txt; this file
// only covers behaviors those 56 didn't pin down: parse-error texts, EQP for a
// single-ref CTE, scope/shadow edges, stage-join counts, top-4 boundary, etc.
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const q = (label: string, sql: string) => {
  try { console.log(label + ": " + JSON.stringify(db.query(sql).all())); }
  catch (e: any) { console.log(label + ": ERROR " + e.message); }
};

// --- derived: alias / naming / shape ---
q("A1 alias-less derived in FROM", "SELECT name FROM (SELECT name, city FROM customers WHERE region='EU')");
q("A2 outer refs un-aliased expr col", "SELECT spend FROM (SELECT customer_id, SUM(total) FROM orders GROUP BY customer_id) WHERE spend > 1000");
q("A3 ghost header SELECT * FROM (SELECT 1)", "SELECT * FROM (SELECT 1)");
q("A4 quoted expr-text name", `SELECT "SUM(total)" AS v FROM (SELECT customer_id, SUM(total) FROM orders GROUP BY customer_id) LIMIT 1`);
q("A5 unbalanced paren", "SELECT name FROM (SELECT name FROM customers");
q("A6 WHERE after GROUP BY", "SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id WHERE spend > 1000");
q("A7 outer refs inner source alias", "SELECT o.total FROM (SELECT customer_id, SUM(total) AS spend FROM orders o GROUP BY customer_id) d");
q("A8 forgot GROUP BY (bare col)", "SELECT customer_id, SUM(total) FROM orders");
q("A9 stage joined to customers count", "SELECT COUNT(*) AS n FROM (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) d JOIN customers c ON c.id = d.customer_id");
q("A10 ambiguous customer_id on join", "SELECT customer_id FROM (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) d JOIN customers c ON c.id = d.customer_id");
q("A11 empty stage COUNT/AVG", "SELECT COUNT(*) AS n, AVG(spend) AS a FROM (SELECT customer_id, SUM(total) AS spend FROM orders WHERE total > 99999 GROUP BY customer_id)");
q("A12 top-4 boundary", "SELECT id, total FROM orders ORDER BY total DESC LIMIT 4");
q("A13 empty top-N stage join", "SELECT COUNT(*) AS n FROM (SELECT id, customer_id, total FROM orders WHERE total > 99999 ORDER BY total DESC LIMIT 3) b JOIN customers c ON c.id = b.customer_id");
q("A14 LEFT JOIN stage NULL spends", "SELECT COUNT(*) AS n, SUM(d.spend IS NULL) AS nulls FROM customers c LEFT JOIN (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) d ON d.customer_id = c.id");
q("A15 stage WHERE-outside over-1000", "SELECT COUNT(*) AS n FROM (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) WHERE spend > 1000");
q("A16 stage over-2177.08", "SELECT COUNT(*) AS n FROM (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) WHERE spend > 2177.08");
q("A17 fan-out stage store sum", "SELECT ROUND(SUM(o.total),2) AS s, COUNT(*) AS n FROM orders o JOIN order_items oi ON oi.order_id = o.id");

// --- CTE: syntax shapes and their error texts ---
q("B1 missing comma between CTEs", "WITH a AS (SELECT 1 AS n) b AS (SELECT 2 AS m) SELECT * FROM a");
q("B2 semicolon kills scope", "WITH a AS (SELECT 1 AS n); SELECT * FROM a");
q("B3 forward reference", "WITH vips AS (SELECT * FROM spends WHERE spend > 1), spends AS (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) SELECT * FROM vips");
q("B4 typo'd CTE name", "WITH s AS (SELECT 1 AS n) SELECT * FROM spnds");
q("B5 recursive WITHOUT RECURSIVE", "WITH counter AS (SELECT 1 AS n UNION ALL SELECT n+1 FROM counter WHERE n<5) SELECT group_concat(n) FROM counter");
q("B6 WITH mid-statement", "SELECT 1 WITH x AS (SELECT 2)");
q("B7 WITH alone, no main SELECT", "WITH s AS (SELECT 1 AS n)");
q("B8 AS omitted", "WITH s (SELECT 1 AS n) SELECT * FROM s");
q("B9 column-name list", "WITH s(a, b) AS (SELECT customer_id, SUM(total) FROM orders GROUP BY customer_id) SELECT COUNT(*) AS n FROM s");
q("B10 duplicate CTE names", "WITH s AS (SELECT 1 AS n), s AS (SELECT 2 AS m) SELECT * FROM s");
q("B11 WITH leading INSERT (parse check, readonly)", "WITH s AS (SELECT 1 AS n) INSERT INTO expenses (category, vendor, spent_on, amount_cents) SELECT 'x','y','2024-01-01',1");
q("B12 WITH inside a subquery", "SELECT * FROM (WITH s AS (SELECT 1 AS n) SELECT * FROM s)");
q("B13 WITH inside IN()", "SELECT COUNT(*) AS n FROM customers WHERE id IN (WITH s AS (SELECT customer_id FROM orders) SELECT customer_id FROM s)");

// --- CTE: pipeline / semantics receipts ---
q("C1 two-stage vips count", "WITH spends AS (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id), vips AS (SELECT * FROM spends WHERE spend > 2177.08) SELECT COUNT(*) AS n FROM vips");
q("C2 stage join names desc", "WITH big AS (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id HAVING SUM(total) > 1000) SELECT c.name FROM big JOIN customers c ON c.id = big.customer_id ORDER BY big.spend DESC");
q("C3 alice spend from stage", "WITH s AS (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) SELECT spend FROM s WHERE customer_id = 1");
q("C4 top region", "WITH r AS (SELECT c.region AS region, SUM(o.total) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region) SELECT region, spend FROM r ORDER BY spend DESC LIMIT 1");
q("C5 veterans via CTE", "WITH st AS (SELECT DISTINCT customer_id, status FROM orders) SELECT name FROM customers WHERE id IN (SELECT customer_id FROM st GROUP BY customer_id HAVING COUNT(DISTINCT status) = 4)");
q("C6 bare-count lie", "WITH st AS (SELECT DISTINCT customer_id, status FROM orders) SELECT name FROM customers WHERE id IN (SELECT customer_id FROM st GROUP BY customer_id HAVING COUNT(*) = 4)");
q("C7 runs-and-lies HAVING", "SELECT COUNT(*) AS n FROM customers WHERE id IN (SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM(total) > AVG(total))");
q("C8 WHERE-aggregate misuse", "SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE total > AVG(total))");
q("C9 forgot JOIN in region stage", "WITH r AS (SELECT region, SUM(total) AS spend FROM orders GROUP BY region) SELECT * FROM r");
q("C10 shadow count", "WITH customers AS (SELECT 'ghost row' AS name) SELECT COUNT(*) AS n FROM customers");
q("C11 empty CTE COUNT/AVG", "WITH vips AS (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id HAVING SUM(total) > 99999) SELECT COUNT(*) AS n, AVG(spend) AS a FROM vips");
q("C12 CTE LEFT JOIN nulls", "WITH s AS (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) SELECT COUNT(*) AS n, SUM(s.spend IS NULL) AS nulls FROM customers c LEFT JOIN s ON s.customer_id = c.id");
q("C13 ORDER BY inside CTE body", "WITH s AS (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id ORDER BY spend DESC) SELECT COUNT(*) AS n FROM s");

// --- EQP: single-ref CTE plan ---
q("E1 EQP single-ref CTE", "EXPLAIN QUERY PLAN WITH s AS (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) SELECT COUNT(*) FROM s");
console.log("--- probes done");
