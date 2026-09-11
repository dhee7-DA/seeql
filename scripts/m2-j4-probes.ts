// Probe sheet for case batch J4 (cs-451..cs-500) — read-only copy, self-cleaning.
// Every figure quoted in cases-j4.ts is printed here. Rerun anytime.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m2j4.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`\n## ${label}  (${rows.length} rows)`);
    for (const r of rows.slice(0, 60)) console.log("  " + JSON.stringify(r));
  } catch (e) {
    console.log(`\n## ${label}  ERROR: ${e instanceof Error ? e.message : e}`);
  }
}

// ---- A. catalog / suppliers ------------------------------------------------
q("A1 audio products w/ maker", `SELECT p.name, p.price, p.stock, s.name AS maker FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE p.category = 'Audio' ORDER BY p.stock DESC`);
q("A2 products from suppliers rated >= 4.6", `SELECT p.name, p.price, p.stock, s.name, s.rating FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE s.rating >= 4.6 ORDER BY p.price DESC, p.name`);
q("A3 products from suppliers rated >= 4.4", `SELECT p.name, p.stock, s.rating FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE s.rating >= 4.4 ORDER BY p.stock DESC`);
q("A4 Shenzhen Electro products", `SELECT p.name, p.price, p.stock FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Shenzhen Electro' ORDER BY p.price DESC`);
q("A5 products priced >= 100", `SELECT p.name, p.price, s.name AS maker FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE p.price >= 100 ORDER BY p.price DESC`);
q("A6 all product stock values", `SELECT p.id, p.name, p.stock, p.category, s.name AS maker FROM products p JOIN suppliers s ON s.id = p.supplier_id ORDER BY p.stock DESC, p.id`);
q("A7 same-stock product pairs (p1.id<p2.id)", `SELECT p1.name, p2.name, p1.stock FROM products p1 JOIN products p2 ON p1.stock = p2.stock AND p1.id < p2.id ORDER BY p1.stock, p1.id`);
q("A8 same-supplier+category product pairs", `SELECT p1.name, p2.name, p1.category, s.name FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.category = p2.category AND p1.id < p2.id JOIN suppliers s ON s.id = p1.supplier_id ORDER BY p1.id`);
q("A9 suppliers with NO product in category Fitness", `SELECT s.name, s.region FROM suppliers s LEFT JOIN products p ON s.id = p.supplier_id AND p.category = 'Fitness' WHERE p.id IS NULL ORDER BY s.name`);
q("A10 Fitness products by supplier", `SELECT p.name, s.name FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE p.category = 'Fitness' ORDER BY s.name`);
q("A11 products with a qty>=2 line (ON placement) — rows and NULL products", `SELECT COUNT(*) AS rows_, SUM(CASE WHEN oi.id IS NULL THEN 1 ELSE 0 END) AS null_products FROM products p LEFT JOIN order_items oi ON p.id = oi.product_id AND oi.quantity >= 2`);
q("A12 products having a qty=3 line vs not", `SELECT SUM(CASE WHEN oi.id IS NOT NULL THEN 1 ELSE 0 END) AS has3, SUM(CASE WHEN oi.id IS NULL THEN 1 ELSE 0 END) AS no3 FROM products p LEFT JOIN order_items oi ON p.id = oi.product_id AND oi.quantity = 3`);
q("A13 products with a qty=2 line", `SELECT SUM(CASE WHEN oi.id IS NOT NULL THEN 1 ELSE 0 END) AS has2 FROM products p LEFT JOIN order_items oi ON p.id = oi.product_id AND oi.quantity = 2`);

// ---- B. orders / customers -------------------------------------------------
q("B1 LATAM customers' orders (Bruno)", `SELECT c.name, o.id, o.total, o.status, o.created_at FROM customers c JOIN orders o ON o.customer_id = c.id WHERE c.region = 'LATAM' ORDER BY o.created_at`);
q("B2 orders with total >= 400", `SELECT o.id, c.name, o.total, o.status FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.total >= 400 ORDER BY o.total DESC, c.name`);
q("B3 orders total >= 350", `SELECT COUNT(*) FROM orders o WHERE o.total >= 350`);
q("B4 same-total order pairs within a customer", `SELECT o1.id, o2.id, o1.customer_id, o1.total FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id AND o1.total = o2.total ORDER BY o1.id`);
q("B5 same-status order pairs within a customer", `SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id AND o1.status = o2.status`);
q("B6 monthly order counts", `SELECT strftime('%Y-%m', o.created_at) AS month, COUNT(*) AS orders, ROUND(SUM(o.total),2) AS revenue FROM orders o JOIN customers c ON o.customer_id = c.id GROUP BY month ORDER BY month`);
q("B7 delivered revenue", `SELECT COUNT(*) AS n, ROUND(SUM(o.total),2) AS revenue FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.status = 'delivered'`);
q("B8 unshipped coverage: customers LEFT JOIN orders ON ... AND shipped_at IS NULL", `SELECT c.name, COUNT(o.id) AS unshipped FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.shipped_at IS NULL GROUP BY c.id ORDER BY c.name`);
q("B9 unshipped-in-ON total rows / matched / NULL customers", `SELECT COUNT(*) AS rows_, COUNT(o.id) AS matched FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.shipped_at IS NULL`);
q("B10 shipped-in-ON variant rows", `SELECT COUNT(*) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.shipped_at IS NOT NULL`);
q("B11 pending lines at line grain (order→items→products)", `SELECT oi.order_id, p.name, oi.quantity FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id WHERE o.status = 'pending' ORDER BY oi.order_id, p.name`);
q("B12 region: orders vs lines vs units (4-hop)", `SELECT c.region, COUNT(DISTINCT o.id) AS orders, COUNT(*) AS lines, SUM(oi.quantity) AS units FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items oi ON oi.order_id = o.id GROUP BY c.region ORDER BY units DESC`);
q("B13 orders of the never-invoiced five (anti-join on customer_id)", `SELECT c.name, COUNT(*) AS orders, ROUND(SUM(o.total),2) AS value FROM orders o LEFT JOIN invoices i ON i.customer_id = o.customer_id LEFT JOIN customers c ON c.id = o.customer_id WHERE i.id IS NULL GROUP BY o.customer_id ORDER BY orders DESC`);

// ---- C. invoices / payments ------------------------------------------------
q("C1 open invoices w/ due dates + buyer", `SELECT i.number, c.name, i.due_on, ROUND(i.amount_cents/100.0,2) AS owed FROM invoices i JOIN customers c ON i.customer_id = c.id WHERE i.status = 'open' ORDER BY i.due_on`);
q("C2 INV-2024-001 chain", `SELECT i.number, c.name, p.id, p.paid_on, p.method, p.amount_cents/100.0 AS paid FROM invoices i JOIN customers c ON i.customer_id = c.id JOIN payments p ON p.invoice_id = i.id WHERE i.number = 'INV-2024-001' ORDER BY p.id`);
q("C3 invoices >= 4000.00 (400000 cents)", `SELECT i.number, c.name, i.status, i.amount_cents/100.0 AS billed, COUNT(p.id) AS payments FROM invoices i JOIN customers c ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id WHERE i.amount_cents >= 400000 GROUP BY i.id ORDER BY i.amount_cents DESC`);
q("C4 invoices >= 5000.00", `SELECT i.number, c.name, i.amount_cents/100.0 AS billed FROM invoices i WHERE i.amount_cents >= 500000 ORDER BY i.amount_cents DESC`);
q("C5 invoices LEFT JOIN payments listing (sorted by number) — NULL owners", `SELECT i.number, c.name, i.status, p.id FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id LEFT JOIN customers c ON c.id = i.customer_id ORDER BY i.number, p.id`);
q("C6 void invoice payments?", `SELECT i.number, i.status, p.id, p.amount_cents/100.0 FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE i.status = 'void'`);
q("C7 payment methods", `SELECT p.method, COUNT(*) AS n, ROUND(SUM(p.amount_cents)/100.0,2) AS cash FROM payments p GROUP BY p.method ORDER BY n DESC`);
q("C8 paid-status but zero payments (the anomaly)", `SELECT i.number, c.name, i.status, ROUND(i.amount_cents/100.0,2) AS billed FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id JOIN customers c ON c.id = i.customer_id WHERE i.status = 'paid' AND p.id IS NULL`);
q("C9 open invoices with zero payments", `SELECT COUNT(*) AS n FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE i.status = 'open' AND p.id IS NULL`);
q("C10 multi-paid invoices", `SELECT i.number, c.name, COUNT(p.id) AS payments, ROUND(SUM(p.amount_cents)/100.0,2) AS cash FROM invoices i JOIN payments p ON p.invoice_id = i.id JOIN customers c ON c.id = i.customer_id GROUP BY i.id HAVING COUNT(p.id) >= 2 ORDER BY cash DESC`);
q("C11 per-customer cash top 6", `SELECT c.name, c.city, COUNT(p.id) AS payments, ROUND(SUM(p.amount_cents)/100.0,2) AS cash FROM customers c JOIN invoices i ON i.customer_id = c.id JOIN payments p ON p.invoice_id = i.id GROUP BY c.id ORDER BY cash DESC LIMIT 6`);
q("C12 same-amount payment pairs", `SELECT p1.id, p2.id, p1.amount_cents/100.0 AS amt FROM payments p1 JOIN payments p2 ON p1.amount_cents = p2.amount_cents AND p1.id < p2.id ORDER BY p1.id`);
q("C13 same-amount invoice pairs", `SELECT i1.number, i2.number, i1.amount_cents/100.0 FROM invoices i1 JOIN invoices i2 ON i1.amount_cents = i2.amount_cents AND i1.id < i2.id`);
q("C14 city-level invoice+payment counts (4-table)", `SELECT c.city, COUNT(i.id) AS invoices, COUNT(p.id) AS payments FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id GROUP BY c.city ORDER BY invoices DESC, c.city`);
q("C15 LEFT JOIN invoices with payment threshold >= 4000 IN ON — rows/matched", `SELECT COUNT(*) AS rows_, COUNT(p.id) AS matched FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id AND p.amount_cents >= 400000`);
q("C16 payments >= 4000.00 count", `SELECT COUNT(*) FROM payments p WHERE p.amount_cents >= 400000`);
q("C17 payments against paid-status invoices", `SELECT COUNT(*) AS rows_, ROUND(SUM(p.amount_cents)/100.0,2) AS cash FROM customers c JOIN invoices i ON i.customer_id = c.id JOIN payments p ON p.invoice_id = i.id WHERE i.status = 'paid'`);
q("C18 customers with NO paid invoice", `SELECT c.name, c.region FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id AND i.status = 'paid' WHERE i.id IS NULL ORDER BY c.name`);
q("C19 per-customer invoice counts (paid only)", `SELECT c.name, COUNT(i.id) AS paid_invoices FROM customers c JOIN invoices i ON i.customer_id = c.id AND i.status = 'paid' GROUP BY c.id ORDER BY paid_invoices DESC`);
q("C20 mesh rows per customer (invoices x orders on customer_id)", `SELECT c.name, COUNT(*) AS mesh FROM customers c JOIN invoices i ON i.customer_id = c.id JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY mesh DESC`);
q("C21 mesh totals", `SELECT COUNT(*) AS rows_, ROUND(SUM(i.amount_cents)/100.0,2) AS inflated FROM customers c JOIN invoices i ON i.customer_id = c.id JOIN orders o ON o.customer_id = c.id`);

// ---- D. join mechanics -----------------------------------------------------
q("D1 NATURAL orders x products listing", `SELECT o.id, p.name FROM orders o NATURAL JOIN products p ORDER BY o.id`);
q("D2 NATURAL LEFT orders x products count", `SELECT COUNT(*) FROM orders o NATURAL LEFT JOIN products p`);
q("D3 USING(id) products x suppliers listing", `SELECT p.name, s.name FROM products p JOIN suppliers s USING (id) ORDER BY p.id`);
q("D4 NATURAL products x suppliers count", `SELECT COUNT(*) FROM products p NATURAL JOIN suppliers s`);
q("D5 USING(id) orders x order_items count", `SELECT COUNT(*) FROM orders o JOIN order_items oi USING (id)`);
q("D6 avg line unit_price per supplier", `SELECT s.name, ROUND(AVG(oi.unit_price),2) AS avg_price, COUNT(*) AS lines, SUM(oi.quantity) AS units FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id ORDER BY avg_price DESC`);
q("D7 units per product, top 8", `SELECT p.name, SUM(oi.quantity) AS units, COUNT(*) AS lines FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id ORDER BY units DESC LIMIT 8`);
q("D8 Nordic Gadgets product lines", `SELECT s.name, p.name, oi.quantity FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Nordic Gadgets AB' ORDER BY oi.quantity DESC, p.name`);
q("D9 Video category lines", `SELECT COUNT(*) AS lines, SUM(oi.quantity) AS units, ROUND(SUM(oi.quantity*oi.unit_price),2) AS spend FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE p.category = 'Video'`);
q("D10 EU cash rows c→i→p by method", `SELECT p.method, COUNT(*) AS rows_ FROM customers c JOIN invoices i ON i.customer_id = c.id JOIN payments p ON p.invoice_id = i.id WHERE c.region = 'EU' GROUP BY p.method`);
q("D11 c→i→p rows for EU", `SELECT c.name, i.number, p.method, p.amount_cents/100.0 AS paid FROM customers c JOIN invoices i ON i.customer_id = c.id JOIN payments p ON p.invoice_id = i.id WHERE c.region = 'EU' ORDER BY p.amount_cents DESC`);
q("D12 low-stock products (<= 60) all", `SELECT p.name, p.stock, s.name, s.rating FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE p.stock <= 60 ORDER BY p.stock, p.name`);
q("D13 low stock AND rated >= 4.5", `SELECT p.name, p.stock, s.name, s.rating FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE p.stock <= 60 AND s.rating >= 4.5 ORDER BY p.stock, p.name`);
q("D14 shipped orders to US buyers", `SELECT COUNT(*) AS n, ROUND(SUM(o.total),2) AS revenue FROM orders o JOIN customers c ON o.customer_id = c.id WHERE c.region = 'US' AND o.status = 'shipped'`);

// ---- E. second-round probes (redesigned cases + distractor safety) ---------
q("E1 same-category product pairs (p1.id<p2.id)", `SELECT p1.name, p2.name, p1.category FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id ORDER BY p1.id`);
q("E2 same-price product pairs", `SELECT COUNT(*) FROM products p1 JOIN products p2 ON p1.price = p2.price AND p1.id < p2.id`);
q("E3 same-supplier product pairs", `SELECT p1.name, p2.name, s.name AS maker FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id < p2.id JOIN suppliers s ON s.id = p1.supplier_id ORDER BY s.name, p1.id`);
q("E4 same-supplier pairs pinned to EU", `SELECT COUNT(*) FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id < p2.id JOIN suppliers s ON s.id = p1.supplier_id WHERE s.region = 'EU'`);
q("E5 same-supplier pairs pinned to APAC", `SELECT COUNT(*) FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id < p2.id JOIN suppliers s ON s.id = p1.supplier_id WHERE s.region = 'APAC'`);
q("E6 same-status order pairs per status", `SELECT o1.status, COUNT(*) AS pairs FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id AND o1.status = o2.status GROUP BY o1.status ORDER BY pairs DESC`);
q("E7 customers LEFT JOIN orders ON total >= 400 (ON placement)", `SELECT COUNT(*) AS rows_, COUNT(o.id) AS matched FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.total >= 400`);
q("E8 same but threshold 500", `SELECT COUNT(*) AS rows_, COUNT(o.id) AS matched FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.total >= 500`);
q("E9 wrong-FK o.id = c.id AND total >= 400", `SELECT COUNT(*) FROM customers c LEFT JOIN orders o ON o.id = c.id AND o.total >= 400`);
q("E10 invoices >= 3000.00 count", `SELECT COUNT(*) FROM invoices i WHERE i.amount_cents >= 300000`);
q("E11 customer ids and regions", `SELECT id, name, region, city FROM customers ORDER BY id`);
q("E12 c.id = o.id joined, region LATAM", `SELECT COUNT(*) FROM customers c JOIN orders o ON c.id = o.id WHERE c.region = 'LATAM'`);
q("E13 same-amount AND same-method payment pairs", `SELECT COUNT(*) FROM payments p1 JOIN payments p2 ON p1.amount_cents = p2.amount_cents AND p1.id < p2.id AND p1.method = p2.method`);
q("E14 APAC same-region pair listing (name-sort sanity)", `SELECT a.name, b.name FROM customers a JOIN customers b ON a.region = b.region AND a.id < b.id WHERE a.region = 'APAC' ORDER BY a.name, b.name`);
q("E15 4-hop supplier-region units", `SELECT s.region, SUM(oi.quantity) AS units FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.region ORDER BY units DESC`);
q("E16 suppliers lacking Apparel products", `SELECT s.name FROM suppliers s LEFT JOIN products p ON s.id = p.supplier_id AND p.category = 'Apparel' WHERE p.id IS NULL ORDER BY s.name`);
q("E17 lines joinable via p.id = oi.order_id, pending only", `SELECT COUNT(*) FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.order_id WHERE o.status = 'pending'`);
q("E18 USING(id) products x suppliers — coincidence pairs with real supplier", `SELECT p.id, p.name, p.supplier_id, s.id, s.name FROM products p JOIN suppliers s USING (id) ORDER BY p.id`);
q("E19 USING(name) products x suppliers", `SELECT COUNT(*) FROM products p JOIN suppliers s USING (name)`);
q("E20 CROSS JOIN with USING — error?", `SELECT COUNT(*) FROM orders o CROSS JOIN order_items oi USING (id)`);
q("E21 mesh HAVING >= 10", `SELECT COUNT(*) FROM customers c JOIN invoices i ON i.customer_id = c.id JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING COUNT(*) >= 10`);
q("E22 payments >= 3000.00 count", `SELECT COUNT(*) FROM payments p WHERE p.amount_cents >= 300000`);
q("E23 orders of unbilled five via wrong-FK o.id = i.id", `SELECT COUNT(*) FROM orders o LEFT JOIN invoices i ON o.id = i.id WHERE i.id IS NULL`);
q("E24 suppliers with no product at/below stock 60", `SELECT s.name FROM suppliers s LEFT JOIN products p ON s.id = p.supplier_id AND p.stock <= 60 WHERE p.id IS NULL ORDER BY s.name`);
q("E25 suppliers with no product at/below stock 100", `SELECT COUNT(*) FROM suppliers s LEFT JOIN products p ON s.id = p.supplier_id AND p.stock <= 100 WHERE p.id IS NULL`);
q("E26 wrong-FK s.id = p.id, stock <= 60, rating >= 4.5", `SELECT COUNT(*) FROM products p JOIN suppliers s ON s.id = p.id WHERE p.stock <= 60 AND s.rating >= 4.5`);
q("E27 wrong-FK s.id = p.id, rating >= 4.6", `SELECT COUNT(*) FROM products p JOIN suppliers s ON s.id = p.id WHERE s.rating >= 4.6`);
q("E28 unshipped coverage wrong-FK variant", `SELECT COUNT(*) FROM customers c LEFT JOIN orders o ON o.id = c.id AND o.shipped_at IS NULL`);
q("E29 EU cash by method sums", `SELECT p.method, COUNT(*) AS rows_, ROUND(SUM(p.amount_cents)/100.0,2) AS cash FROM customers c JOIN invoices i ON i.customer_id = c.id JOIN payments p ON p.invoice_id = i.id WHERE c.region = 'EU' GROUP BY p.method ORDER BY rows_ DESC`);
q("E30 rating >= 4.8 products (distractor check)", `SELECT COUNT(*) FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE s.rating >= 4.8`);
q("E31 NATURAL LEFT JOIN orders x products (distractor check)", `SELECT COUNT(*) FROM orders o NATURAL LEFT JOIN products p`);
q("E32 video lines via wrong join p.supplier_id = oi.product_id", `SELECT COUNT(*) FROM order_items oi JOIN products p ON p.supplier_id = oi.product_id WHERE p.category = 'Video'`);
q("E33 multi-paid invoice payment methods", `SELECT i.number, p1.method AS m1, p2.method AS m2 FROM invoices i JOIN payments p1 ON p1.invoice_id = i.id JOIN payments p2 ON p2.invoice_id = i.id AND p2.id > p1.id WHERE i.number IN ('INV-2024-001','INV-2024-005','INV-2024-012','INV-2024-019','INV-2024-022') ORDER BY i.number`);
q("E34 pending lines via oi.id = o.id wrong join", `SELECT COUNT(*) FROM order_items oi JOIN orders o ON oi.id = o.id JOIN products p ON p.id = oi.product_id WHERE o.status = 'pending'`);
q("E35 same-category pairs count only", `SELECT COUNT(*) FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id`);
q("E36 same-supplier pairs count only", `SELECT COUNT(*) FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id < p2.id`);
q("E37 Shenzhen via wrong-FK p.id = s.id", `SELECT COUNT(*) FROM products p JOIN suppliers s ON p.id = s.id WHERE s.name = 'Shenzhen Electro'`);
q("E38 audio via wrong join s.region = p.category", `SELECT COUNT(*) FROM products p JOIN suppliers s ON s.region = p.category WHERE p.category = 'Audio'`);
q("E39 >=4500 invoices JOIN variant (no NULL check)", `SELECT COUNT(*) FROM invoices i JOIN payments p ON p.invoice_id = i.id WHERE i.amount_cents >= 450000`);
q("E40 >=4000 invoices via INNER second hop", `SELECT COUNT(*) FROM invoices i JOIN customers c ON i.customer_id = c.id JOIN payments p ON p.invoice_id = i.id WHERE i.amount_cents >= 400000 GROUP BY i.id`);

db.close();
rmSync(COPY, { force: true });
console.log("\n(probe copy removed)");
