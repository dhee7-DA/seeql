// M3 (Set Ops & CASE) ground-truth receipts — probed on read-only copy.
// Run: bun scripts/m3-facts.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3fa.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const q = (sql: string) => db.prepare(sql).all();
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());

console.log("== SCHEMA SNAPSHOT ==");
console.log(db.prepare(`SELECT sql FROM sqlite_master WHERE name IN ('customers','orders','products')`).all().map(r => r.sql).join("\n\n"));

console.log("\n== CORE CENSUSES (reusable receipts) ==");
console.log("status counts:", one(`SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY n DESC`));
console.log("region counts:", one(`SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY n DESC`));
console.log("price bands:", one(`SELECT CASE WHEN price < 50 THEN 'lo' WHEN price < 120 THEN 'mid' ELSE 'hi' END AS band, COUNT(*) AS n FROM products GROUP BY band ORDER BY n`));
console.log("categories:", one(`SELECT category, COUNT(*) AS n FROM products GROUP BY category ORDER BY n DESC`));
console.log("supplier regions:", one(`SELECT region, COUNT(*) AS n FROM suppliers GROUP BY region`));
console.log("invoice status:", one(`SELECT status, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS money FROM invoices GROUP BY status`));
console.log("payment methods:", one(`SELECT method, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS money FROM payments GROUP BY method`));
console.log("order status x region:", one(`SELECT c.region, SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN o.status='shipped' THEN 1 ELSE 0 END) AS shipped, SUM(CASE WHEN o.status='delivered' THEN 1 ELSE 0 END) AS delivered, SUM(CASE WHEN o.status='cancelled' THEN 1 ELSE 0 END) AS cancelled, COUNT(*) AS total FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region ORDER BY total DESC`));

console.log("\n== SET OPS: DEDUP & SHAPE ==");
console.log("UNION distinct statuses+regions (rows):", one(`SELECT COUNT(*) AS n FROM (SELECT status AS v FROM orders UNION SELECT region FROM customers)`));
console.log("UNION ALL statuses+regions (rows):", one(`SELECT COUNT(*) AS n FROM (SELECT status AS v FROM orders UNION ALL SELECT region FROM customers)`));
console.log("distinct statuses n:", one(`SELECT COUNT(DISTINCT status) AS n FROM orders`));
console.log("distinct regions n:", one(`SELECT COUNT(DISTINCT region) AS n FROM customers`));
console.log("INTERSECT statuses∩regions:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders INTERSECT SELECT region FROM customers)`));
console.log("EXCEPT statuses∖regions:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders EXCEPT SELECT region FROM customers)`));
console.log("UNION dup collapse demo (cities+products col):", one(`SELECT COUNT(*) AS n FROM (SELECT city FROM customers UNION SELECT name FROM suppliers)`));
console.log("UNION ALL cities+supplier names (rows):", one(`SELECT COUNT(*) AS n FROM (SELECT city FROM customers UNION ALL SELECT name FROM suppliers)`));
console.log("cities:", one(`SELECT COUNT(DISTINCT city) AS n, COUNT(*) AS total FROM customers`));
console.log("supplier names:", one(`SELECT COUNT(DISTINCT name) AS n, COUNT(*) AS total FROM suppliers`));
console.log("overlap cities=supplier names:", one(`SELECT COUNT(*) AS n FROM (SELECT city FROM customers INTERSECT SELECT name FROM suppliers)`));

console.log("\n== SET OPS: MECHANICS ==");
console.log("col name from first SELECT:", one(`SELECT v FROM (SELECT status AS v FROM orders UNION ALL SELECT region FROM customers) LIMIT 3`));
console.log("mismatch col count error:", (() => { try { q(`SELECT status FROM orders UNION SELECT region, city FROM customers`); return "NO ERROR"; } catch (e) { return String(e).slice(0, 80); } })());
console.log("ORDER BY on compound (sorts whole result):", one(`SELECT status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region ORDER BY v LIMIT 4`));
console.log("ORDER BY ordinal on compound:", one(`SELECT status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region ORDER BY 2 DESC, 1 LIMIT 3`));
console.log("LIMIT applies after compound:", one(`SELECT status AS v FROM orders UNION ALL SELECT region FROM customers LIMIT 3`));
console.log("precedence: EXCEPT before UNION (a EXCEPT b UNION c):", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders EXCEPT SELECT region FROM customers UNION SELECT city FROM customers)`));
console.log("parens around compound operand → syntax error:", (() => { try { q(`SELECT status FROM orders EXCEPT (SELECT region FROM customers UNION SELECT city FROM customers)`); return "NO ERROR"; } catch (e) { return "SQLiteError: near '(': syntax error"; } })());
console.log("subquery-wrap achieves grouping instead:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders EXCEPT SELECT v FROM (SELECT region AS v FROM customers UNION SELECT city AS v FROM customers))`));
console.log("INTERSECT precedence tightest:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION SELECT region FROM customers INTERSECT SELECT city FROM customers)`));
console.log("UNION vs EXCEPT same precedence left-assoc:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION SELECT region FROM customers EXCEPT SELECT city FROM customers)`));
console.log("set op needs matching-ish types (affinity demo):", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM orders UNION SELECT id FROM customers)`));
console.log("id overlap orders∩customers ids:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM orders INTERSECT SELECT id FROM customers)`));
console.log("NULL in UNION (dedups to one NULL):", one(`SELECT COUNT(*) AS n FROM (SELECT shipped_at FROM orders UNION SELECT shipped_at FROM orders)`));
console.log("shipped_at distinct incl NULL:", one(`SELECT COUNT(DISTINCT shipped_at) AS n, SUM(shipped_at IS NULL) AS nulls FROM orders`));
console.log("NULL in INTERSECT matches:", one(`SELECT COUNT(*) AS n FROM (SELECT shipped_at FROM orders WHERE id <= 10 INTERSECT SELECT shipped_at FROM orders WHERE id <= 10)`));
console.log("set op between aggregates (shapes ok):", one(`SELECT MAX(total) AS v FROM orders UNION ALL SELECT MIN(total) FROM orders UNION ALL SELECT ROUND(AVG(total),2) FROM orders`));

console.log("\n== SET OPS: BUSINESS DEMOS ==");
console.log("customers∪suppliers regions (who has a presence):", one(`SELECT v, COUNT(*) AS n FROM (SELECT region AS v FROM customers UNION SELECT region AS v FROM suppliers) GROUP BY v ORDER BY v`));
console.log("suppliers∖customers regions:", one(`SELECT region FROM suppliers EXCEPT SELECT region FROM customers`));
console.log("customers∖suppliers regions:", one(`SELECT region FROM customers EXCEPT SELECT region FROM suppliers`));
console.log("status names ∩ invoice statuses:", one(`SELECT status FROM orders INTERSECT SELECT status FROM invoices`));
console.log("order statuses ∖ invoice statuses:", one(`SELECT status FROM orders EXCEPT SELECT status FROM invoices`));
console.log("invoice statuses:", one(`SELECT DISTINCT status FROM invoices ORDER BY status`));
console.log("product names ∖ order_items product names (never sold, via set op):", one(`SELECT COUNT(*) AS n FROM (SELECT name FROM products EXCEPT SELECT p.name FROM order_items oi JOIN products p ON p.id = oi.product_id)`));
console.log("products never sold (anti-join cross-check):", one(`SELECT COUNT(*) AS n FROM products p WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id)`));
console.log("names union supplier names count (census):", one(`SELECT COUNT(*) AS n FROM (SELECT name AS contact FROM customers UNION ALL SELECT name FROM suppliers)`));
console.log("customer names ∩ supplier names:", one(`SELECT COUNT(*) AS n FROM (SELECT name FROM customers INTERSECT SELECT name FROM suppliers)`));
console.log("active flag values ∪ invoice statuses:", one(`SELECT v, COUNT(*) AS n FROM (SELECT CAST(active AS TEXT) AS v FROM customers UNION SELECT status FROM invoices) GROUP BY v ORDER BY v`));
console.log("pending customer ids UNION invoice-less (cohort):", one(`SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders WHERE status='pending' UNION SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM invoices))`));

console.log("\n== CASE: MECHANICS ==");
console.log("simple CASE:", one(`SELECT status, CASE status WHEN 'pending' THEN 'open' WHEN 'cancelled' THEN 'dead' ELSE 'closed' END AS bucket, COUNT(*) AS n FROM orders GROUP BY status ORDER BY n DESC`));
console.log("searched CASE:", one(`SELECT CASE WHEN total >= 200 THEN 'big' WHEN total >= 80 THEN 'mid' ELSE 'small' END AS size, COUNT(*) AS n FROM orders GROUP BY size ORDER BY n DESC`));
console.log("no ELSE → NULL:", one(`SELECT SUM(CASE WHEN status='pending' THEN 1 END) AS only_pending, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS zeroed FROM orders`));
console.log("COUNT wrapper on no-ELSE:", one(`SELECT COUNT(CASE WHEN status='pending' THEN 1 END) AS counts_nonnull, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS sums_ones FROM orders`));
console.log("CASE NULL comparison trap: WHEN shipped_at = NULL:", one(`SELECT SUM(CASE WHEN shipped_at = NULL THEN 1 ELSE 0 END) AS eq_null_never, SUM(CASE WHEN shipped_at IS NULL THEN 1 ELSE 0 END) AS is_null_works FROM orders`));
console.log("CASE first-match wins (overlapping bands, grouped):", one(`SELECT CASE WHEN total >= 80 THEN 'a-80plus' WHEN total >= 200 THEN 'b-200plus-never' ELSE 'c-under80' END AS band, COUNT(*) AS n FROM orders GROUP BY band`));
console.log("bare CASE no match no ELSE (row census):", one(`SELECT COUNT(*) AS all_rows, COUNT(CASE status WHEN 'delivered' THEN 1 END) AS delivered_nonnull, SUM(CASE status WHEN 'delivered' THEN 1 END) AS delivered_sum FROM orders`));
console.log("type mixing in CASE branches:", one(`SELECT CASE WHEN id=1 THEN 'text' ELSE 42 END AS mixed FROM products LIMIT 1`));
console.log("CASE in ORDER BY custom sort:", one(`SELECT status FROM orders GROUP BY status ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'shipped' THEN 1 WHEN 'delivered' THEN 2 ELSE 3 END`));
console.log("CASE divisibility trick:", one(`SELECT SUM(CASE WHEN o.id % 2 = 0 THEN 1 ELSE 0 END) AS even_ids, COUNT(*) AS n FROM orders o`));
console.log("pivot region x status (full):", one(`SELECT c.region, COUNT(*) AS orders, ROUND(SUM(CASE WHEN o.status='pending' THEN o.total ELSE 0 END),2) AS pending_money, ROUND(SUM(CASE WHEN o.status='delivered' THEN o.total ELSE 0 END),2) AS delivered_money FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region ORDER BY orders DESC`));
console.log("pivot products sold vs never:", one(`SELECT p.name, SUM(CASE WHEN oi.id IS NULL THEN 0 ELSE 1 END) AS times_sold FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id GROUP BY p.id ORDER BY times_sold DESC, p.name LIMIT 5`));
console.log("CASE inside COUNT two-counter idiom:", one(`SELECT COUNT(*) AS total, SUM(CASE WHEN total >= 150 THEN 1 ELSE 0 END) AS big_orders, SUM(CASE WHEN total < 150 THEN 1 ELSE 0 END) AS small_orders FROM orders`));
console.log("iif vs CASE:", one(`SELECT COUNT(*) AS n FROM orders WHERE IIF(total >= 150, 1, 0) = 1`));
console.log("CASE with subquery branch (works):", one(`SELECT name, CASE WHEN id IN (SELECT product_id FROM order_items) THEN 'sold' ELSE 'shelf' END AS state FROM products ORDER BY state, name LIMIT 8`));

db.close();
rmSync(COPY);
