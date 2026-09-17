// M4 D1 receipts — scalar subqueries + IN / NOT IN (lesson 25).
// Probed on a read-only COPY of db/custom.db (SQLite 3.53, bun:sqlite).
// Run: bun scripts/m4-facts-d1.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m4d1.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());
const err = (sql: string) => {
  try {
    db.prepare(sql).all();
    return "NO ERROR";
  } catch (e) {
    return String(e).slice(0, 130);
  }
};

console.log("== SANITY ==");
console.log("customers/orders:", one(`SELECT (SELECT COUNT(*) FROM customers) AS c, (SELECT COUNT(*) FROM orders) AS o`));
console.log("regions:", one(`SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY region`));
console.log("statuses:", one(`SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY status`));

console.log("\n== SCALAR · AVG PATTERN ==");
console.log("avg total raw:", one(`SELECT AVG(total) FROM orders`));
console.log("avg rounded:", one(`SELECT ROUND(AVG(total), 4) FROM orders`));
console.log("count total > avg:", one(`SELECT COUNT(*) n FROM orders WHERE total > (SELECT AVG(total) FROM orders)`));
console.log("count total < avg:", one(`SELECT COUNT(*) n FROM orders WHERE total < (SELECT AVG(total) FROM orders)`));
console.log("count total >= avg:", one(`SELECT COUNT(*) n FROM orders WHERE total >= (SELECT AVG(total) FROM orders)`));
console.log("count total <= avg:", one(`SELECT COUNT(*) n FROM orders WHERE total <= (SELECT AVG(total) FROM orders)`));
console.log("count total = avg:", one(`SELECT COUNT(*) n FROM orders WHERE total = (SELECT AVG(total) FROM orders)`));
console.log("sum total:", one(`SELECT ROUND(SUM(total), 2) FROM orders`));
console.log("avg by customer vs overall > count:", one(`SELECT COUNT(*) n FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING AVG(total) > (SELECT AVG(total) FROM orders))`));

console.log("\n== SCALAR · TOP ORDERER / LIMIT 1 ==");
console.log("top orderer via scalar:", one(`SELECT name FROM customers WHERE id = (SELECT customer_id FROM orders GROUP BY customer_id ORDER BY COUNT(*) DESC LIMIT 1)`));
console.log("max total:", one(`SELECT MAX(total) FROM orders`));
console.log("rows at max total:", one(`SELECT COUNT(*) n FROM orders WHERE total = (SELECT MAX(total) FROM orders)`));
console.log("rows at max via ORDER BY LIMIT 1 scalar:", one(`SELECT COUNT(*) n FROM orders WHERE total = (SELECT total FROM orders ORDER BY total DESC LIMIT 1)`));
console.log("min total:", one(`SELECT MIN(total) FROM orders`));
console.log("rows at min total:", one(`SELECT COUNT(*) n FROM orders WHERE total = (SELECT MIN(total) FROM orders)`));
console.log("rows at min via ORDER BY LIMIT 1 scalar:", one(`SELECT COUNT(*) n FROM orders WHERE total = (SELECT total FROM orders ORDER BY total ASC LIMIT 1)`));
console.log("max in top-orderer subq (ties?):", one(`SELECT COUNT(*) n FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) = (SELECT MAX(c) FROM (SELECT COUNT(*) c FROM orders GROUP BY customer_id)))`));
console.log("alice city:", one(`SELECT city FROM customers WHERE name = 'Alice Chen'`));
console.log("rows sharing alice city:", one(`SELECT COUNT(*) n FROM customers WHERE city = (SELECT city FROM customers WHERE name = 'Alice Chen')`));
console.log("distinct cities:", one(`SELECT COUNT(DISTINCT city) n FROM customers`));

console.log("\n== SCALAR · EMPTY / NULL ==");
console.log("= over empty scalar:", one(`SELECT COUNT(*) n FROM orders WHERE total = (SELECT total FROM orders WHERE 1 = 0)`));
console.log("> over empty scalar:", one(`SELECT COUNT(*) n FROM orders WHERE total > (SELECT total FROM orders WHERE 1 = 0)`));
console.log("scalar is NULL over empty:", one(`SELECT (SELECT total FROM orders WHERE 1 = 0) IS NULL AS is_null`));
console.log("scalar NULL from no-match:", one(`SELECT (SELECT shipped_at FROM orders WHERE id = 999)`));
console.log("= scalar NULL (no-match row):", one(`SELECT COUNT(*) n FROM orders WHERE total = (SELECT shipped_at FROM orders WHERE id = 999)`));
console.log("scalar in SELECT list over empty:", one(`SELECT COUNT(*) n, COUNT((SELECT total FROM orders WHERE 1 = 0)) AS non_null FROM customers`));
console.log("scalar AVG in select list:", one(`SELECT COUNT(*) n, COUNT(DISTINCT (SELECT ROUND(AVG(total), 2) FROM orders)) AS distinct_vals FROM customers`));

console.log("\n== SCALAR · MULTI-ROW (SQLite takes FIRST) ==");
console.log("first region by id:", one(`SELECT region FROM customers ORDER BY id LIMIT 1`));
console.log("region = (ORDER BY id LIMIT 2):", one(`SELECT COUNT(*) n FROM customers WHERE region = (SELECT region FROM customers ORDER BY id LIMIT 2)`));
console.log("region = (US rows ordered):", one(`SELECT COUNT(*) n FROM customers WHERE region = (SELECT region FROM customers WHERE region = 'US' ORDER BY id)`));
console.log("region = (GROUP BY region, 4 rows):", one(`SELECT COUNT(*) n FROM customers WHERE region = (SELECT region FROM customers GROUP BY region)`));
console.log("region = (all 16 rows, unsorted):", one(`SELECT COUNT(*) n FROM customers WHERE region = (SELECT region FROM customers)`));

console.log("\n== SCALAR · IN SELECT LIST / CORRELATED ==");
console.log("pair select (uncorrelated + correlated):", one(`SELECT (SELECT COUNT(*) FROM customers) AS c, (SELECT COUNT(*) FROM orders) AS o`));
console.log("correlated top3:", one(`SELECT name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS n FROM customers c ORDER BY n DESC, name LIMIT 3`));
console.log("correlated sum:", one(`SELECT SUM(n) s FROM (SELECT (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS n FROM customers c)`));
console.log("uncorrelated scalar column:", one(`SELECT COUNT(*) n FROM customers WHERE (SELECT AVG(total) FROM orders) > 300`));
console.log("min orders customer name:", one(`SELECT name FROM customers WHERE id = (SELECT customer_id FROM orders GROUP BY customer_id ORDER BY COUNT(*) ASC LIMIT 1)`));

console.log("\n== SCALAR · ERRORS (SQLite 3.53 verbatim) ==");
console.log("bare aggregate in WHERE:", err(`SELECT id FROM orders WHERE total > AVG(total)`));
console.log("missing parens around subquery:", err(`SELECT id FROM orders WHERE total > SELECT AVG(total) FROM orders`));
console.log("multi-column scalar:", err(`SELECT name FROM customers WHERE id = (SELECT id, region FROM customers LIMIT 1)`));
console.log("typo column inside scalar:", err(`SELECT id FROM orders WHERE total > (SELECT AVG(totl) FROM orders)`));
console.log("typo table inside scalar:", err(`SELECT id FROM orders WHERE total > (SELECT AVG(total) FROM oderz)`));
console.log("scalar w/ ORDER BY but no LIMIT:", one(`SELECT COUNT(*) n FROM orders WHERE total = (SELECT total FROM orders ORDER BY total DESC)`));

console.log("\n== IN · LITERAL LISTS ==");
console.log("status IN (pending,shipped):", one(`SELECT COUNT(*) n FROM orders WHERE status IN ('pending','shipped')`));
console.log("status IN (pending):", one(`SELECT COUNT(*) n FROM orders WHERE status IN ('pending')`));
console.log("status = 'pending':", one(`SELECT COUNT(*) n FROM orders WHERE status = 'pending'`));
console.log("region IN (EU,APAC):", one(`SELECT COUNT(*) n FROM customers WHERE region IN ('EU','APAC')`));
console.log("region IN (EU,APAC,US):", one(`SELECT COUNT(*) n FROM customers WHERE region IN ('EU','APAC','US')`));
console.log("region NOT IN (EU):", one(`SELECT COUNT(*) n FROM customers WHERE region NOT IN ('EU')`));
console.log("region NOT IN (APAC,US,LATAM):", one(`SELECT COUNT(*) n FROM customers WHERE region NOT IN ('APAC','US','LATAM')`));
console.log("status IN (1,2):", one(`SELECT COUNT(*) n FROM orders WHERE status IN (1, 2)`));
console.log("name IN (SELECT region FROM customers):", one(`SELECT COUNT(*) n FROM customers WHERE name IN (SELECT region FROM customers)`));
console.log("region IN (SELECT region FROM suppliers):", one(`SELECT COUNT(*) n FROM customers WHERE region IN (SELECT region FROM suppliers)`));
console.log("status IN (pending, NULL):", one(`SELECT COUNT(*) n FROM orders WHERE status IN ('pending', NULL)`));

console.log("\n== IN · SUBQUERY MEMBERSHIP ==");
console.log("id IN (all customer_ids):", one(`SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders)`));
console.log("id NOT IN (all customer_ids):", one(`SELECT COUNT(*) n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders)`));
console.log("id IN (empty subq):", one(`SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE 1 = 0)`));
console.log("id NOT IN (empty subq):", one(`SELECT COUNT(*) n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE 1 = 0)`));
console.log("distinct pending customers:", one(`SELECT COUNT(DISTINCT customer_id) n FROM orders WHERE status = 'pending'`));
console.log("id IN (pending customer_ids):", one(`SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = 'pending')`));
console.log("id NOT IN (pending customer_ids):", one(`SELECT COUNT(*) n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE status = 'pending')`));
console.log("id IN (HAVING >= 20):", one(`SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 20)`));
console.log("id IN (HAVING >= 20) count:", one(`SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 20)`));
console.log("id IN (HAVING < 5):", one(`SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) < 5)`));
console.log("id IN (HAVING = 24):", one(`SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) = 24)`));

console.log("\n== NOT IN · THE NULL LANDMINE ==");
console.log("region NOT IN ('EU', NULL):", one(`SELECT COUNT(*) n FROM customers WHERE region NOT IN ('EU', NULL)`));
console.log("id NOT IN (full UNION NULL):", one(`SELECT COUNT(*) n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders UNION SELECT NULL)`));
console.log("cancelled-order customers:", one(`SELECT COUNT(DISTINCT customer_id) n FROM orders WHERE status = 'cancelled'`));
console.log("id NOT IN (cancelled customer_ids):", one(`SELECT COUNT(*) n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled')`));
console.log("NOT EXISTS cancelled (same 12?):", one(`SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled')`));
console.log("EXISTS delivered:", one(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')`));
console.log("customer w/ no delivered:", one(`SELECT name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')`));
console.log("0 pending customers:", one(`SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending')`));
console.log("id NOT IN (UNION NULL of pending):", one(`SELECT COUNT(*) n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE status = 'pending' UNION SELECT NULL)`));

console.log("\n== IN · ERRORS (SQLite 3.53 verbatim) ==");
console.log("IN multi-column subquery:", err(`SELECT id FROM customers WHERE id IN (SELECT id, region FROM customers LIMIT 1)`));
console.log("IN empty list:", err(`SELECT id FROM orders WHERE status IN ()`));
console.log("missing comma in list:", err(`SELECT id FROM orders WHERE status IN ('pending' 'shipped')`));
console.log("= ANY (unsupported):", err(`SELECT id FROM orders WHERE status = ANY (SELECT status FROM orders)`));
console.log("typo table in subquery:", err(`SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM oderz)`));
console.log("missing FROM in subquery:", err(`SELECT id FROM orders WHERE status IN (SELECT WHERE status = 'pending')`));
console.log("IN subquery ORDER BY legal?:", one(`SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders ORDER BY customer_id DESC)`));

console.log("\n== HISTOGRAM RECHECK ==");
console.log("per-customer order counts:", one(`SELECT COUNT(*) n, COUNT(*) FROM orders GROUP BY customer_id ORDER BY n`));
console.log("mean:", one(`SELECT ROUND(AVG(c), 4) m FROM (SELECT COUNT(*) c FROM orders GROUP BY customer_id)`));
console.log("above mean:", one(`SELECT COUNT(*) n FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) > (SELECT AVG(c) FROM (SELECT COUNT(*) c FROM orders GROUP BY customer_id)))`));
console.log("below 5:", one(`SELECT COUNT(*) n FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) < 5)`));
console.log("gte 20:", one(`SELECT COUNT(*) n FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 20)`));
console.log("top3 avg:", one(`SELECT ROUND(AVG(c), 2) a FROM (SELECT COUNT(*) c FROM orders GROUP BY customer_id ORDER BY c DESC LIMIT 3)`));

db.close();
rmSync(COPY, { force: true });
console.log("\n(done — copy removed)");
