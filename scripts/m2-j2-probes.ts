// m2-cases-j2 probes — read-only copy, self-cleaning.
// Every figure quoted in cases-j2.ts is probed here (or comes from the shared fact sheet).
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m2j2.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

let n = 0;
function probe(label: string, sql: string) {
  n++;
  console.log(`\n### P${n} ${label}`);
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    if (rows.length === 0) console.log("(0 rows)");
    else {
      const cols = Object.keys(rows[0]);
      console.log(cols.join(" | "));
      for (const r of rows) console.log(cols.map((c) => String(r[c])).join(" | "));
      if (rows.length > 40) console.log(`... (${rows.length} rows total)`);
    }
  } catch (e) {
    console.log("ERROR:", e instanceof Error ? e.message : String(e));
  }
}

// ---- j1 ----
probe("351 shipped orders by region", `SELECT c.region, COUNT(*) AS shipped FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.status = 'shipped' GROUP BY c.region ORDER BY shipped DESC;`);
probe("351b shipped distractor o.id=c.id", `SELECT COUNT(*) FROM orders o JOIN customers c ON o.id = c.id WHERE o.status = 'shipped';`);
probe("352 products from EU suppliers", `SELECT p.name, p.price, s.name FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE s.region = 'EU' ORDER BY p.name;`);
probe("352b distractor p.id=s.id EU", `SELECT COUNT(*) FROM products p JOIN suppliers s ON p.id = s.id WHERE s.region = 'EU';`);
probe("352c distractor 'eu'", `SELECT COUNT(*) FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE s.region = 'eu';`);
probe("353 cancelled by customer", `SELECT c.name, COUNT(*) AS cancelled, ROUND(SUM(o.total), 2) AS lost FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.status = 'cancelled' GROUP BY c.id HAVING SUM(o.total) >= 140 ORDER BY lost DESC;`);
probe("353b all cancelled by customer (no HAVING)", `SELECT c.name, COUNT(*) AS cancelled, ROUND(SUM(o.total), 2) AS lost FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.status = 'cancelled' GROUP BY c.id ORDER BY lost DESC;`);
probe("354 per supplier region: count, avg stock, avg price", `SELECT s.region, COUNT(p.id) AS products, ROUND(AVG(p.stock), 2) AS avg_stock, ROUND(AVG(p.price), 2) AS avg_price, SUM(p.stock) AS shelf FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.region ORDER BY avg_stock DESC;`);
probe("354b distractor HAVING >= 4 (products)", `SELECT s.region, COUNT(p.id) AS products, ROUND(AVG(p.stock), 2) AS avg_stock FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.region HAVING COUNT(p.id) >= 4 ORDER BY avg_stock DESC;`);
probe("354c HAVING >= 2", `SELECT s.region, COUNT(p.id) AS products, ROUND(AVG(p.stock), 2) AS avg_stock FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.region HAVING COUNT(p.id) >= 2 ORDER BY avg_stock DESC;`);

// ---- j2 ----
probe("355 accessories list", `SELECT p.name, p.price, s.name FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE p.category = 'Accessories' ORDER BY p.price DESC;`);
probe("355b products per category", `SELECT p.category, COUNT(*) AS products FROM products p GROUP BY p.category ORDER BY products DESC;`);
probe("356 open invoices with names", `SELECT i.number, c.name, ROUND(i.amount_cents / 100.0, 2) AS billed FROM invoices i JOIN customers c ON i.customer_id = c.id WHERE i.status = 'open' ORDER BY billed DESC;`);
probe("357 pending manifest by city", `SELECT o.id, c.name, c.city FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.status = 'pending' ORDER BY c.city, o.id;`);
probe("357b distractor o.id=c.id pending", `SELECT o.id, c.name, c.city FROM orders o JOIN customers c ON o.id = c.id WHERE o.status = 'pending' ORDER BY c.city, o.id;`);
probe("358 per supplier product count + avg price", `SELECT s.name, COUNT(*) AS products, ROUND(AVG(p.price), 2) AS avg_price FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id ORDER BY avg_price DESC;`);
probe("358b stock avg per supplier", `SELECT s.name, COUNT(*) AS products, ROUND(AVG(p.stock), 2) AS avg_stock FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id ORDER BY avg_stock DESC;`);
probe("359 suppliers and regions", `SELECT s.id, s.name, s.region, s.rating, COUNT(p.id) AS products, SUM(p.stock) AS shelf FROM suppliers s JOIN products p ON p.supplier_id = s.id GROUP BY s.id ORDER BY s.id;`);
probe("359b APAC shelf", `SELECT s.name, COUNT(*) AS products, SUM(p.stock) AS shelf FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE s.region = 'APAC' GROUP BY s.id ORDER BY shelf DESC;`);
probe("359c distractor s.id=p.id APAC", `SELECT s.name, COUNT(*) AS products, SUM(p.stock) AS shelf FROM products p JOIN suppliers s ON p.id = s.id WHERE s.region = 'APAC' GROUP BY s.id ORDER BY shelf DESC;`);
probe("360 payments by method", `SELECT p.method, COUNT(*) AS payments, ROUND(SUM(p.amount_cents) / 100.0, 2) AS cash FROM invoices i JOIN payments p ON p.invoice_id = i.id GROUP BY p.method ORDER BY cash DESC;`);
probe("360b distractor SUM(i.amount_cents) by method", `SELECT p.method, ROUND(SUM(i.amount_cents) / 100.0, 2) AS cash FROM invoices i JOIN payments p ON p.invoice_id = i.id GROUP BY p.method ORDER BY cash DESC;`);
probe("361 customers with 10+ orders (order grain)", `SELECT c.name, COUNT(*) AS orders, ROUND(SUM(o.total), 2) AS spend FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING COUNT(*) >= 10 ORDER BY orders DESC;`);
probe("361b HAVING >= 5", `SELECT c.name, COUNT(*) AS orders FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING COUNT(*) >= 5 ORDER BY orders DESC;`);
probe("362 delivered revenue by region", `SELECT c.region, ROUND(SUM(o.total), 2) AS delivered_revenue, COUNT(*) AS orders FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.status = 'delivered' GROUP BY c.region ORDER BY delivered_revenue DESC;`);
probe("362b shipped revenue by region", `SELECT c.region, ROUND(SUM(o.total), 2) AS shipped_revenue FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.status = 'shipped' GROUP BY c.region ORDER BY shipped_revenue DESC;`);

// ---- j3 ----
probe("363 top products by units with supplier", `SELECT p.name, s.name AS supplier, SUM(oi.quantity) AS units FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id GROUP BY p.id ORDER BY units DESC LIMIT 8;`);
probe("364 units per customer", `SELECT c.name, SUM(oi.quantity) AS units, COUNT(oi.id) AS lines FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items oi ON oi.order_id = o.id GROUP BY c.id ORDER BY units DESC LIMIT 8;`);
probe("365 multi-paid invoices", `SELECT i.number, c.name, COUNT(p.id) AS payments, ROUND(SUM(p.amount_cents) / 100.0, 2) AS collected, ROUND(i.amount_cents / 100.0, 2) AS billed FROM invoices i JOIN customers c ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id GROUP BY i.id HAVING COUNT(p.id) > 1 ORDER BY payments DESC, i.number;`);
probe("366 cash by account", `SELECT c.name, COUNT(p.id) AS payments, ROUND(SUM(p.amount_cents) / 100.0, 2) AS cash FROM customers c JOIN invoices i ON i.customer_id = c.id JOIN payments p ON p.invoice_id = i.id GROUP BY c.id ORDER BY cash DESC;`);
probe("367 categories with 40+ lines", `SELECT p.category, COUNT(oi.id) AS lines, SUM(oi.quantity) AS units, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category HAVING COUNT(oi.id) >= 40 ORDER BY revenue DESC;`);
probe("367b threshold 30 / 50", `SELECT p.category, COUNT(oi.id) AS lines FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category HAVING COUNT(oi.id) >= 30 ORDER BY lines DESC;`);
probe("368 supplier line counts and revenue", `SELECT s.name, COUNT(oi.id) AS lines, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id ORDER BY revenue DESC;`);
probe("368b HAVING >= 40", `SELECT s.name, COUNT(oi.id) AS lines FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id HAVING COUNT(oi.id) >= 40 ORDER BY lines DESC;`);
probe("368c HAVING >= 60", `SELECT s.name, COUNT(oi.id) AS lines FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id HAVING COUNT(oi.id) >= 60 ORDER BY lines DESC;`);

// ---- j4 ----
probe("369 invoice coverage by region", `SELECT c.region, COUNT(*) AS rows_, COUNT(i.id) AS with_invoice FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id GROUP BY c.region ORDER BY rows_ DESC;`);
probe("370 per-invoice payment tally (zeros first)", `SELECT i.number, i.status, COUNT(p.id) AS payments FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id GROUP BY i.id ORDER BY payments ASC, i.number LIMIT 12;`);
probe("371 ledger row count", `SELECT COUNT(*) AS ledger_rows FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id;`);
probe("371b ledger sample", `SELECT i.number, i.status, i.amount_cents / 100.0 AS billed, p.amount_cents / 100.0 AS paid FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id ORDER BY i.number, p.id LIMIT 14;`);
probe("372 conditional delivered join rows", `SELECT COUNT(*) AS kept, COUNT(o.id) AS matched FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered';`);
probe("372b customers with zero delivered", `SELECT c.name, COUNT(o.id) AS delivered FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered' GROUP BY c.id HAVING COUNT(o.id) = 0 ORDER BY c.name;`);
probe("373 invoices vs paid per customer", `SELECT c.name, COUNT(i.id) AS invoices, COUNT(DISTINCT p.invoice_id) AS paid FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id GROUP BY c.id HAVING COUNT(i.id) > COUNT(DISTINCT p.invoice_id) ORDER BY c.name;`);
probe("373b full per-customer table", `SELECT c.name, COUNT(i.id) AS invoices, COUNT(DISTINCT p.invoice_id) AS paid FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id GROUP BY c.id ORDER BY c.name;`);
probe("373c INNER on payments variant", `SELECT c.name, COUNT(i.id) AS invoices, COUNT(DISTINCT p.invoice_id) AS paid FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id JOIN payments p ON p.invoice_id = i.id GROUP BY c.id HAVING COUNT(i.id) > COUNT(DISTINCT p.invoice_id) ORDER BY c.name;`);
probe("374 two-hop count erosion", `SELECT COUNT(*) AS rows_, COUNT(i.id) AS inv_rows, COUNT(p.id) AS pay_rows FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id;`);
probe("374b inner variant", `SELECT COUNT(*) AS rows_, COUNT(i.id) AS inv_rows, COUNT(p.id) AS pay_rows FROM customers c JOIN invoices i ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id;`);
probe("375 billed by status after LEFT join", `SELECT i.status, COUNT(*) AS rows_, ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed_shown FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id GROUP BY i.status ORDER BY billed_shown DESC;`);
probe("375b billed by status INNER", `SELECT i.status, COUNT(*) AS rows_, ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed_shown FROM invoices i JOIN payments p ON p.invoice_id = i.id GROUP BY i.status ORDER BY billed_shown DESC;`);
probe("375c true billed by status", `SELECT i.status, COUNT(*) AS invoices, ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed FROM invoices i GROUP BY i.status ORDER BY billed DESC;`);

// ---- j5 ----
probe("376 no-cash customers (two-hop anti)", `SELECT c.name, c.region FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL ORDER BY c.name;`);
probe("376b distractor i.id IS NULL", `SELECT c.name, c.region FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id WHERE i.id IS NULL ORDER BY c.name;`);
probe("377 open and unpaid", `SELECT i.number, ROUND(i.amount_cents / 100.0, 2) AS owed FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL AND i.status = 'open' ORDER BY owed DESC;`);
probe("378 phantom paid", `SELECT COUNT(*) AS phantoms, ROUND(SUM(i.amount_cents) / 100.0, 2) AS stale FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL AND i.status = 'paid';`);
probe("378b phantom detail", `SELECT i.number, c.name, i.amount_cents / 100.0 AS owed FROM invoices i JOIN customers c ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL AND i.status = 'paid';`);
probe("379 dead SKU count", `SELECT COUNT(*) AS dead_skus FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL;`);
probe("379b dead SKU wrong-key join", `SELECT COUNT(*) AS dead_skus FROM products p LEFT JOIN order_items oi ON p.id = oi.order_id WHERE oi.id IS NULL;`);
probe("380 unpaid by region", `SELECT c.region, COUNT(*) AS unpaid_invoices, ROUND(SUM(i.amount_cents) / 100.0, 2) AS exposure FROM customers c JOIN invoices i ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL GROUP BY c.region ORDER BY exposure DESC;`);
probe("380b with LEFT on invoices too (uninvoiced included)", `SELECT c.region, COUNT(*) AS rows_, ROUND(SUM(i.amount_cents) / 100.0, 2) AS exposure FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL GROUP BY c.region ORDER BY exposure DESC;`);
probe("380c distractor i.id IS NULL by region", `SELECT c.region, COUNT(*) AS unbilled FROM customers c JOIN invoices i ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id WHERE i.id IS NULL GROUP BY c.region ORDER BY unbilled DESC;`);
probe("381 suppliers with no qty-3 line", `SELECT s.name FROM suppliers s JOIN products p ON p.supplier_id = s.id LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.quantity = 3 WHERE oi.id IS NULL ORDER BY s.name;`);
probe("381b qty-3 lines per supplier", `SELECT s.name, COUNT(oi.id) AS qty3_lines FROM suppliers s JOIN products p ON p.supplier_id = s.id LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.quantity = 3 GROUP BY s.id ORDER BY qty3_lines DESC;`);
probe("381c suppliers with no qty-2 line", `SELECT s.name FROM suppliers s JOIN products p ON p.supplier_id = s.id LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.quantity = 2 WHERE oi.id IS NULL ORDER BY s.name;`);

// ---- j6 ----
probe("382 same-supplier product pairs", `SELECT COUNT(*) AS pairs FROM products a JOIN products b ON a.supplier_id = b.supplier_id AND a.id < b.id;`);
probe("382b <= variant", `SELECT COUNT(*) AS pairs FROM products a JOIN products b ON a.supplier_id = b.supplier_id AND a.id <= b.id;`);
probe("382c distractor a.supplier_id = b.id", `SELECT COUNT(*) AS pairs FROM products a JOIN products b ON a.supplier_id = b.id AND a.id < b.id;`);
probe("383 same-status order pairs by status", `SELECT o1.status, COUNT(*) AS pairs FROM orders o1 JOIN orders o2 ON o1.status = o2.status AND o1.id < o2.id GROUP BY o1.status ORDER BY pairs DESC;`);
probe("383b same-total order pairs", `SELECT COUNT(*) AS pairs FROM orders o1 JOIN orders o2 ON o1.total = o2.total AND o1.id < o2.id;`);
probe("383c same-status <= variant", `SELECT COUNT(*) AS pairs FROM orders o1 JOIN orders o2 ON o1.status = o2.status AND o1.id <= o2.id;`);
probe("384 same-category product pairs", `SELECT p1.category, COUNT(*) AS pairs FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id GROUP BY p1.category ORDER BY pairs DESC;`);
probe("385 customers per region", `SELECT region, COUNT(*) AS customers FROM customers GROUP BY region ORDER BY customers DESC;`);
probe("385b same-region pairs by region", `SELECT a.region, COUNT(*) AS pairs FROM customers a JOIN customers b ON a.region = b.region AND a.id < b.id GROUP BY a.region ORDER BY pairs DESC;`);
probe("385c <= variant", `SELECT a.region, COUNT(*) AS pairs FROM customers a JOIN customers b ON a.region = b.region AND a.id <= b.id GROUP BY a.region ORDER BY pairs DESC;`);
probe("386 invoice same-customer pairs per account", `SELECT c.name, COUNT(*) AS co_invoices FROM invoices a JOIN invoices b ON a.customer_id = b.customer_id AND a.id < b.id JOIN customers c ON c.id = a.customer_id GROUP BY c.id ORDER BY co_invoices DESC;`);
probe("386b total", `SELECT COUNT(*) AS pairs FROM invoices a JOIN invoices b ON a.customer_id = b.customer_id AND a.id < b.id;`);
probe("386c <= variant total", `SELECT COUNT(*) AS pairs FROM invoices a JOIN invoices b ON a.customer_id = b.customer_id AND a.id <= b.id;`);
probe("386d distractor c.id = a.id", `SELECT c.name, COUNT(*) AS co_invoices FROM invoices a JOIN invoices b ON a.customer_id = b.customer_id AND a.id < b.id JOIN customers c ON c.id = a.id GROUP BY c.id ORDER BY co_invoices DESC;`);

// ---- j7 ----
probe("387 line-grain revenue total", `SELECT ROUND(SUM(oi.quantity * oi.unit_price), 2) AS line_revenue FROM orders o JOIN order_items oi ON oi.order_id = o.id;`);
probe("388 category line-avg vs list-avg", `SELECT p.category, ROUND(AVG(oi.unit_price), 2) AS line_avg, ROUND(AVG(p.price), 2) AS list_avg FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category ORDER BY line_avg DESC;`);
probe("389 supplier shelf vs floor (fan-out stock)", `SELECT s.name, SUM(p.stock) AS shelf_shown, SUM(oi.quantity) AS sold FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id GROUP BY s.id ORDER BY sold DESC;`);
probe("389b honest shelf per supplier", `SELECT s.name, SUM(p.stock) AS shelf FROM suppliers s JOIN products p ON p.supplier_id = s.id GROUP BY s.id ORDER BY shelf DESC;`);
probe("390 supplier line revenue leaderboard", `SELECT s.name, COUNT(oi.id) AS lines, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id ORDER BY revenue DESC;`);
probe("390b grouped by region instead", `SELECT s.region, COUNT(oi.id) AS lines, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.region ORDER BY revenue DESC;`);
probe("391 biggest baskets by units", `SELECT o.id, SUM(oi.quantity) AS units, COUNT(oi.id) AS lines FROM orders o JOIN order_items oi ON oi.order_id = o.id GROUP BY o.id ORDER BY units DESC LIMIT 8;`);
probe("392 cash by region x method", `SELECT c.region, p.method, COUNT(*) AS payments, ROUND(SUM(p.amount_cents) / 100.0, 2) AS cash FROM payments p JOIN invoices i ON p.invoice_id = i.id JOIN customers c ON i.customer_id = c.id GROUP BY c.region, p.method ORDER BY cash DESC;`);
probe("393 delivered fan-out average", `SELECT COUNT(*) AS joined_rows, ROUND(AVG(o.total), 2) AS avg_shown FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.status = 'delivered';`);
probe("393b true delivered avg", `SELECT COUNT(*) AS orders, ROUND(SUM(o.total) / COUNT(*), 2) AS true_avg FROM orders o WHERE o.status = 'delivered';`);
probe("393c shipped fan-out average", `SELECT COUNT(*) AS joined_rows, ROUND(AVG(o.total), 2) AS avg_shown FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.status = 'shipped';`);
probe("394 cancelled at line grain", `SELECT COUNT(*) AS joined_rows, SUM(oi.quantity) AS units, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS lost FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.status = 'cancelled';`);

// ---- j8 ----
probe("395 USING(id) coincidence", `SELECT COUNT(*) AS matched FROM customers c JOIN orders o USING (id);`);
probe("395b ON (id) — ambiguous?", `SELECT COUNT(*) AS matched FROM customers c JOIN orders o ON (id);`);
probe("395c USING (customer_id) — error?", `SELECT COUNT(*) AS matched FROM customers c JOIN orders o USING (customer_id);`);
probe("396 NATURAL customers x orders", `SELECT COUNT(*) AS matched FROM customers c NATURAL JOIN orders o;`);
probe("396b NATURAL orders x products", `SELECT COUNT(*) AS matched, ROUND(SUM(o.total), 2) AS money FROM orders o NATURAL JOIN products p;`);
probe("396c what matches", `SELECT o.id, o.total, p.price FROM orders o NATURAL JOIN products p LIMIT 20;`);
probe("396d JOIN without ON", `SELECT COUNT(*) AS rows_ FROM orders o JOIN products p;`);
probe("396e LEFT JOIN without ON", `SELECT COUNT(*) AS rows_ FROM orders o LEFT JOIN products p;`);
probe("396f CROSS JOIN no ON", `SELECT COUNT(*) AS rows_ FROM orders o CROSS JOIN products p;`);
probe("397 pending placement in ON", `SELECT COUNT(*) AS kept, COUNT(o.id) AS with_pending FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending';`);
probe("397b pending in WHERE", `SELECT COUNT(*) AS kept, COUNT(o.id) AS with_pending FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.status = 'pending';`);
probe("397c shipped in ON", `SELECT COUNT(*) AS kept, COUNT(o.id) AS with_shipped FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped';`);
probe("398 accidental mesh", `SELECT COUNT(*) AS mesh_rows, ROUND(SUM(o.total), 2) AS inflated FROM invoices i JOIN orders o ON o.customer_id = i.customer_id;`);
probe("398b mesh distractor o.id = i.customer_id", `SELECT COUNT(*) AS mesh_rows, ROUND(SUM(o.total), 2) AS inflated FROM invoices i JOIN orders o ON o.id = i.customer_id;`);
probe("398c mesh distractor i.id = o.customer_id", `SELECT COUNT(*) AS mesh_rows, ROUND(SUM(o.total), 2) AS inflated FROM invoices i JOIN orders o ON i.id = o.customer_id;`);
probe("398d mesh per invoice top", `SELECT i.number, COUNT(*) AS mesh_rows, ROUND(SUM(o.total), 2) AS inflated FROM invoices i JOIN orders o ON o.customer_id = i.customer_id GROUP BY i.id ORDER BY inflated DESC LIMIT 6;`);
probe("399 unshipped placement in ON", `SELECT COUNT(*) AS kept, COUNT(o.id) AS unshipped FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.shipped_at IS NULL;`);
probe("399b unshipped in WHERE", `SELECT COUNT(*) AS kept, COUNT(o.id) AS unshipped FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.shipped_at IS NULL;`);
probe("399c IS NOT NULL variant", `SELECT COUNT(*) AS kept, COUNT(o.id) AS shipped_rows FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.shipped_at IS NOT NULL;`);
probe("400 EU in ON", `SELECT COUNT(*) AS kept, COUNT(o.id) AS matched FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND c.region = 'EU';`);
probe("400b 'eu' in ON", `SELECT COUNT(*) AS kept, COUNT(o.id) AS matched FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND c.region = 'eu';`);
probe("400c APAC in ON", `SELECT COUNT(*) AS kept, COUNT(o.id) AS matched FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND c.region = 'APAC';`);

// ---- extra / edge checks ----
probe("X1 ROUND 100 vs 100.0 (375)", `SELECT i.status, ROUND(SUM(i.amount_cents) / 100, 2) AS billed_int FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id GROUP BY i.status ORDER BY billed_int DESC;`);
probe("X2 orders totals sum vs line money", `SELECT ROUND(SUM(total), 2) FROM orders;`);
probe("X3 pending order ids <= 16", `SELECT id, status, total FROM orders WHERE id <= 16 ORDER BY id;`);
probe("X4 i.id = c.id garbage (366 distractor)", `SELECT COUNT(*) FROM customers c JOIN invoices i ON i.id = c.id JOIN payments p ON p.invoice_id = i.id;`);
probe("X5 oi.id = p.id count (363 distractor)", `SELECT COUNT(*) FROM order_items oi JOIN products p ON oi.id = p.id JOIN suppliers s ON s.id = p.supplier_id;`);
probe("X6 oi.id = o.id count (391/394 distractor)", `SELECT COUNT(*) FROM orders o JOIN order_items oi ON oi.id = o.id;`);
probe("X7 a.id = b.id products", `SELECT COUNT(*) FROM products a JOIN products b ON a.supplier_id = b.supplier_id AND a.id = b.id;`);
probe("X8 o1.id = o2.id same status", `SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.status = o2.status AND o1.id = o2.id;`);
probe("X9 a.customer_id = b.id invoices", `SELECT COUNT(*) FROM invoices a JOIN invoices b ON a.customer_id = b.id AND a.id < b.id;`);
probe("X10 oi.id = p.id revenue garbage (390)", `SELECT s.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue FROM order_items oi JOIN products p ON oi.id = p.id JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id;`);
probe("X11 p.id = oi.order_id (388 distractor)", `SELECT COUNT(*) FROM order_items oi JOIN products p ON p.id = oi.order_id;`);
probe("X12 pending holders cities", `SELECT DISTINCT c.city FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.status = 'pending' ORDER BY c.city;`);
probe("X13 delivered holders", `SELECT COUNT(DISTINCT o.customer_id) AS holders FROM orders o WHERE o.status = 'delivered';`);
probe("X14 units per order top ties", `SELECT o.id, SUM(oi.quantity) AS units FROM orders o JOIN order_items oi ON oi.order_id = o.id GROUP BY o.id ORDER BY units DESC, o.id LIMIT 12;`);
probe("X15 supplier rating list", `SELECT id, name, region, rating FROM suppliers ORDER BY id;`);
probe("X16 method list", `SELECT method, COUNT(*) FROM payments GROUP BY method;`);
probe("X17 ORDER BY pairs tie check 384", `SELECT p1.category, COUNT(*) AS pairs FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id GROUP BY p1.category ORDER BY pairs DESC, p1.category;`);
probe("X18 avg price per supplier ties (358)", `SELECT s.name, ROUND(AVG(p.price), 2) AS avg_price FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id ORDER BY avg_price DESC, s.name;`);
probe("X19 AVG stock per region distinct (354)", `SELECT s.region, ROUND(AVG(p.stock), 2) AS avg_stock FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.region ORDER BY avg_stock DESC;`);
probe("X20 371 sort by paid check", `SELECT COUNT(*) FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id ORDER BY p.amount_cents;`);

db.close();
rmSync(COPY, { force: true });
console.log(`\n(${n} probes done, copy removed)`);
