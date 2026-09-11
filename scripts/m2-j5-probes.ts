// Probe script for case batch J5 (cs-501..cs-550).
// Runs read-only against a COPY of db/custom.db; removes the copy at the end.
// Rerunnable: bun scripts/m2-j5-probes.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m2j5.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function probe(label: string, sql: string) {
  console.log(`\n## ${label}`);
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    if (rows.length === 0) {
      console.log("(0 rows)");
      return;
    }
    const cols = Object.keys(rows[0]!);
    console.log(cols.join(" | "));
    for (const r of rows) console.log(cols.map((c) => String(r[c])).join(" | "));
    console.log(`(${rows.length} rows)`);
  } catch (e) {
    console.log(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// ---- base tables ----
probe("A. suppliers", `SELECT id, name, region, rating FROM suppliers ORDER BY id`);
probe("B. catalog with maker", `SELECT p.id, p.name, p.category, p.price, p.stock, s.name AS supplier, s.region FROM products p JOIN suppliers s ON s.id = p.supplier_id ORDER BY p.id`);

// ---- 501 / 542: void invoice trail ----
probe("C. void invoice + buyer", `SELECT i.number, i.status, i.amount_cents, c.name FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.status = 'void'`);
probe("D. payments against the void invoice", `SELECT i.number, p.id, p.paid_on, p.amount_cents, p.method FROM invoices i JOIN payments p ON p.invoice_id = i.id WHERE i.status = 'void' ORDER BY p.paid_on`);
probe("C2. coincidence: i.customer_id = c.id swapped to i.id = c.id (void)", `SELECT i.number, c.name FROM invoices i JOIN customers c ON i.id = c.id WHERE i.status = 'void'`);

// ---- 503: Electronics catalog with maker ----
probe("E. Electronics products with maker", `SELECT p.name, p.price, s.name AS supplier FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE p.category = 'Electronics' ORDER BY p.price DESC`);
probe("E2. coincidence s.id=p.id within Electronics", `SELECT p.name, s.name FROM products p JOIN suppliers s ON s.id = p.id WHERE p.category = 'Electronics'`);

// ---- 504: quantity-3 lines ----
probe("G. lines with quantity 3", `SELECT oi.order_id, p.name, oi.quantity FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.quantity = 3 ORDER BY oi.order_id`);
probe("G2. quantity 2 count", `SELECT COUNT(*) FROM order_items WHERE quantity = 2`);
probe("G3. coincidence p.id = oi.order_id within qty3", `SELECT oi.order_id, p.name FROM order_items oi JOIN products p ON p.id = oi.order_id WHERE oi.quantity = 3`);

// ---- 505: headset trail p->oi->o ----
probe("I. headset trail", `SELECT o.id, o.status, oi.quantity FROM products p JOIN order_items oi ON oi.product_id = p.id JOIN orders o ON o.id = oi.order_id WHERE p.name = 'Noise-Canceling Headset' ORDER BY o.id`);
probe("I2. webcam trail count (distractor literal)", `SELECT COUNT(*) FROM products p JOIN order_items oi ON oi.product_id = p.id JOIN orders o ON o.id = oi.order_id WHERE p.name = '4K Webcam Pro'`);
probe("I3. coincidence oi.id = o.id within headset", `SELECT COUNT(*) FROM products p JOIN order_items oi ON oi.id = o.id JOIN orders o2 ON o2.id = oi.order_id WHERE p.name = 'Noise-Canceling Headset'`);

// ---- 506: US suppliers, left-side filter in ON ----
probe("J. US suppliers + products (filter in ON)", `SELECT s.name, p.name, p.price FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id AND s.region = 'US' ORDER BY s.name, p.price`);
probe("J2. same but WHERE (inner behavior)", `SELECT s.name, p.name FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id WHERE s.region = 'US' ORDER BY s.name`);
probe("J3. coincidence p.id = s.id", `SELECT s.name, p.name FROM suppliers s LEFT JOIN products p ON p.id = s.id ORDER BY s.name`);

// ---- 507: no PAID invoice ----
probe("K. customers with no paid invoice", `SELECT c.name, c.region FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id AND i.status = 'paid' WHERE i.id IS NULL ORDER BY c.name`);
probe("K2. their invoice status mix", `SELECT c.name, GROUP_CONCAT(i.status) AS statuses FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id GROUP BY c.id HAVING SUM(i.status = 'paid') = 0 ORDER BY c.name`);

// ---- 508: invoice self-pairs ----
probe("L. invoice self-pair total", `SELECT COUNT(*) FROM invoices i1 JOIN invoices i2 ON i1.customer_id = i2.customer_id AND i1.id < i2.id`);
probe("L2. pairs per customer", `SELECT c.name, COUNT(*) AS pairs FROM invoices i1 JOIN invoices i2 ON i1.customer_id = i2.customer_id AND i1.id < i2.id JOIN customers c ON c.id = i1.customer_id GROUP BY i1.customer_id ORDER BY pairs DESC`);

// ---- 509: cancelled per customer ----
probe("M. cancelled per customer", `SELECT c.name, COUNT(*) AS cancels, ROUND(SUM(o.total), 2) AS value FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled' GROUP BY c.id ORDER BY value DESC`);

// ---- 511: due-date board ----
probe("N. open invoices by due date", `SELECT i.number, c.name, i.due_on, ROUND(i.amount_cents / 100.0, 2) AS owed FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.status = 'open' ORDER BY i.due_on`);
probe("N2. issued vs due order differ?", `SELECT i.number, i.issued_on, i.due_on FROM invoices i WHERE i.status = 'open' ORDER BY i.issued_on`);

// ---- 512: payment methods ----
probe("O. payment methods", `SELECT method, COUNT(*) AS n, ROUND(SUM(amount_cents) / 100.0, 2) AS total FROM payments GROUP BY method ORDER BY total DESC`);
probe("P. card payments on paid invoices", `SELECT p.id, i.number, ROUND(p.amount_cents / 100.0, 2) AS paid FROM payments p JOIN invoices i ON p.invoice_id = i.id WHERE p.method = 'card' AND i.status = 'paid' ORDER BY paid DESC`);

// ---- 513: Nordic lines ----
probe("Q. Nordic Gadgets lines", `SELECT p.name, oi.order_id, oi.quantity, oi.unit_price FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id WHERE s.name = 'Nordic Gadgets AB' ORDER BY p.name, oi.order_id`);

// ---- 514: low-stock sales ----
probe("R. stock < 60 products with their order lines", `SELECT p.name, p.stock, o.id FROM products p JOIN order_items oi ON oi.product_id = p.id JOIN orders o ON o.id = oi.order_id WHERE p.stock < 60 ORDER BY p.stock, p.name`);
probe("R2. stock < 60 products", `SELECT name, stock FROM products WHERE stock < 60 ORDER BY stock`);

// ---- 515: AVG trap ----
probe("S. c LEFT JOIN i aggregates", `SELECT COUNT(*) AS rows_, COUNT(i.id) AS with_inv, ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed, ROUND(AVG(i.amount_cents) / 100.0, 2) AS avg_cents_col, ROUND(SUM(i.amount_cents) / COUNT(*) / 100.0, 2) AS sum_over_star`);

// ---- 516: supplier units + distinct sold products ----
probe("T. supplier units + distinct products sold", `SELECT s.name, COUNT(DISTINCT p.id) AS prods_sold, SUM(oi.quantity) AS units FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id GROUP BY s.id ORDER BY units DESC`);

// ---- 517: never-invoiced per region ----
probe("U. never-invoiced per region", `SELECT c.region, COUNT(*) AS unbilled FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id WHERE i.id IS NULL GROUP BY c.region ORDER BY unbilled DESC`);
probe("U2. with US present (all four regions)", `SELECT c.region, COUNT(*) AS unbilled FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id WHERE i.id IS NULL AND c.region IN ('EU','APAC','US','LATAM') GROUP BY c.region ORDER BY c.region`);

// ---- 518: same-supplier pairs ----
probe("V. same-supplier product pairs", `SELECT s.name, p1.name, p2.name FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id < p2.id JOIN suppliers s ON s.id = p1.supplier_id ORDER BY s.name`);
probe("V2. same-supplier pair count", `SELECT COUNT(*) FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id < p2.id`);

// ---- 519: never-shipped / never-delivered customers ----
probe("W. customers with no shipped order", `SELECT c.name, c.city FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' WHERE o.id IS NULL ORDER BY c.name`);
probe("W2. customers with no delivered order", `SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered' WHERE o.id IS NULL ORDER BY c.name`);

// ---- 520: Shenzhen chain ----
probe("X. Shenzhen Electro lines", `SELECT oi.order_id, p.name, oi.quantity FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Shenzhen Electro' ORDER BY oi.order_id`);
probe("X2. USING(id) coincidence on same query", `SELECT COUNT(*) FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s USING (id) WHERE s.name = 'Shenzhen Electro'`);

// ---- 521 / 531: open invoices ----
probe("Y. open invoices by amount", `SELECT i.number, c.name, ROUND(i.amount_cents / 100.0, 2) AS owed FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.status = 'open' ORDER BY owed DESC`);
probe("AH. EU open invoices", `SELECT i.number, c.name, ROUND(i.amount_cents / 100.0, 2) AS owed FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE c.region = 'EU' AND i.status = 'open' ORDER BY owed DESC`);
probe("Y2. coincidence i.id = c.id among invoices", `SELECT i.number, c.name FROM invoices i JOIN customers c ON i.id = c.id`);

// ---- 522: big invoices ----
probe("Z. invoices >= 400000 cents", `SELECT i.number, c.name, ROUND(i.amount_cents / 100.0, 2) AS owed FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.amount_cents >= 400000 ORDER BY owed DESC`);
probe("Z2. invoices >= 200000 count", `SELECT COUNT(*) FROM invoices WHERE amount_cents >= 200000`);

// ---- 523: Alice premium lines ----
probe("AA. Alice lines >= 100", `SELECT o.id, oi.unit_price FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items oi ON oi.order_id = o.id WHERE c.name = 'Alice Chen' AND oi.unit_price >= 100 ORDER BY oi.unit_price DESC`);
probe("AA2. count >= 50", `SELECT COUNT(*) FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items oi ON oi.order_id = o.id WHERE c.name = 'Alice Chen' AND oi.unit_price >= 50`);

// ---- 524: lines per product ----
probe("AB. lines per product + stock", `SELECT p.name, p.stock, COUNT(oi.id) AS lines FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id GROUP BY p.id ORDER BY lines DESC, p.name`);

// ---- 525: shipped-in-ON coverage ----
probe("AC. shipped-in-ON coverage", `SELECT c.name, o.id, o.total FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' ORDER BY c.name, o.id`);

// ---- 526: MAX line per supplier ----
probe("AD. biggest line per supplier", `SELECT s.name, ROUND(MAX(oi.quantity * oi.unit_price), 2) AS biggest_line, COUNT(*) AS lines FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id GROUP BY s.id ORDER BY biggest_line DESC`);

// ---- 528: heavy order pairs ----
probe("AE. same-customer order pairs both > 200", `SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id WHERE o1.total > 200 AND o2.total > 200`);
probe("AE2. thresholds 150 / 250 / >=200", `SELECT
 (SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id WHERE o1.total > 150 AND o2.total > 150) AS t150,
 (SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id WHERE o1.total > 250 AND o2.total > 250) AS t250,
 (SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id WHERE o1.total >= 200 AND o2.total >= 200) AS t200inc`);

// ---- 529: unpaid by status ----
probe("AF. unpaid invoices grouped by status", `SELECT i.status, COUNT(*) AS n, ROUND(SUM(i.amount_cents) / 100.0, 2) AS exposure FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL GROUP BY i.status ORDER BY exposure DESC`);

// ---- 530: premium lines with filter in ON ----
probe("AG. products LEFT JOIN premium lines (unit_price >= 100 in ON)", `SELECT p.name, oi.unit_price FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.unit_price >= 100 ORDER BY p.name, oi.unit_price`);

// ---- 532: APAC cash ----
probe("AI. APAC payments", `SELECT p.id, i.number, c.city, ROUND(p.amount_cents / 100.0, 2) AS paid FROM payments p JOIN invoices i ON i.id = p.invoice_id JOIN customers c ON c.id = i.customer_id WHERE c.region = 'APAC' ORDER BY paid DESC`);

// ---- 533: premium catalog per supplier ----
probe("AJ. suppliers LEFT JOIN premium products (price >= 100 in ON)", `SELECT s.name, p.name, p.price FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id AND p.price >= 100 ORDER BY s.name, p.price`);

// ---- 534: single-unit-only products ----
probe("AK. products never bought in multiples (no qty>=2 line)", `SELECT p.name, p.stock FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.quantity >= 2 WHERE oi.id IS NULL ORDER BY p.name`);
probe("AK2. products never in a DELIVERED line (join+left+having)", `SELECT p.name, COUNT(oi.id) AS lines, COUNT(o.id) AS delivered_lines FROM products p JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'delivered' GROUP BY p.id HAVING COUNT(o.id) = 0 ORDER BY p.name`);

// ---- 535: APAC pairs ----
probe("AL. APAC same-region pairs", `SELECT a.name, b.name FROM customers a JOIN customers b ON a.region = b.region AND a.id < b.id WHERE a.region = 'APAC' ORDER BY a.name`);

// ---- 536: rows vs distinct orders per supplier ----
probe("AM. supplier fan-out: rows vs distinct orders", `SELECT s.name, COUNT(*) AS rows_, COUNT(DISTINCT o.id) AS orders FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id JOIN orders o ON o.id = oi.order_id GROUP BY s.id ORDER BY rows_ DESC`);

// ---- 537 / 512: cash by method ----
probe("AN2. cash by method via join", `SELECT p.method, COUNT(*) AS payments, ROUND(SUM(p.amount_cents) / 100.0, 2) AS cash FROM payments p JOIN invoices i ON i.id = p.invoice_id GROUP BY p.method ORDER BY cash DESC`);

// ---- 538: inflated per-customer report ----
probe("AP. inflated SUM(o.total) per customer over fanned join", `SELECT c.name, COUNT(*) AS rows_, ROUND(SUM(o.total), 2) AS inflated FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items oi ON oi.order_id = o.id GROUP BY c.id ORDER BY inflated DESC`);
probe("AP2. honest line spend for contrast", `SELECT c.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS honest FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items oi ON oi.order_id = o.id GROUP BY c.id ORDER BY honest DESC`);

// ---- 539: phantom mesh ----
probe("AO. phantom mesh big invoices x same-customer orders", `SELECT i.number, COUNT(*) AS phantom_orders FROM invoices i JOIN orders o ON o.customer_id = i.customer_id WHERE i.amount_cents >= 400000 GROUP BY i.id ORDER BY i.number`);
probe("AO2. big invoices + their customer's order count", `SELECT i.number, c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = i.customer_id) AS ords FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.amount_cents >= 400000 ORDER BY i.number`);
probe("AO3. wrong-FK o.customer_id = i.id count", `SELECT COUNT(*) FROM invoices i JOIN orders o ON o.customer_id = i.id`);
probe("AO4. wrong-FK o.id = i.customer_id count", `SELECT COUNT(*) FROM invoices i JOIN orders o ON o.id = i.customer_id`);

// ---- 540: APAC catalog ----
probe("AY. APAC-sourced products", `SELECT p.name, p.price, s.name AS supplier FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE s.region = 'APAC' ORDER BY p.price DESC`);

// ---- 541: big cash ----
probe("AU. payments >= 500000 cents", `SELECT p.id, i.number, ROUND(p.amount_cents / 100.0, 2) AS paid, p.method FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE p.amount_cents >= 500000 ORDER BY paid DESC`);
probe("AU2. payments >= 300000 count", `SELECT COUNT(*) FROM payments WHERE amount_cents >= 300000`);

// ---- 543: big invoices + payment coverage ----
probe("AV. big invoices LEFT JOIN payments", `SELECT i.number, i.status, p.id, ROUND(p.amount_cents / 100.0, 2) AS paid FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE i.amount_cents >= 400000 ORDER BY i.number, p.id`);

// ---- 545: same-category product pairs ----
probe("AQ. category sizes", `SELECT category, COUNT(*) AS n FROM products GROUP BY category ORDER BY n DESC`);
probe("AQ2. same-category pair count", `SELECT COUNT(*) FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id`);
probe("AQ3. same-price pairs", `SELECT COUNT(*) FROM products p1 JOIN products p2 ON p1.price = p2.price AND p1.id < p2.id`);

// ---- 546: revenue per unit by supplier region ----
probe("AR. revenue per unit by supplier region", `SELECT s.region, ROUND(SUM(oi.quantity * oi.unit_price) / SUM(oi.quantity), 2) AS rev_per_unit, SUM(oi.quantity) AS units FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.region ORDER BY rev_per_unit DESC`);

// ---- 547: cash by month ----
probe("AN. cash by month", `SELECT strftime('%Y-%m', p.paid_on) AS month, COUNT(*) AS payments, ROUND(SUM(p.amount_cents) / 100.0, 2) AS cash FROM payments p JOIN invoices i ON i.id = p.invoice_id GROUP BY month ORDER BY month`);

// ---- 548: per-customer orders + spend ----
probe("AS. customers with 10+ orders", `SELECT c.name, COUNT(*) AS orders, ROUND(SUM(o.total), 2) AS spend FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING COUNT(*) >= 10 ORDER BY spend DESC`);
probe("AS2. order counts 8/9 boundary", `SELECT c.name, COUNT(*) FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING COUNT(*) < 10 ORDER BY COUNT(*) DESC LIMIT 6`);

// ---- 549: order 7 affinity ----
probe("AT. order 7 with buyer", `SELECT o.id, c.name, c.city, o.total, o.status FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.id = '7'`);
probe("AT2. who is customer 7", `SELECT id, name, city FROM customers WHERE id = 7`);
probe("AT3. wrong-FK o.id = c.id pinned to 7", `SELECT o.id, c.name FROM orders o JOIN customers c ON o.id = c.id WHERE o.id = '7'`);

// ---- 550: revenue per unit (fallbacks) ----
probe("AR2. rev/unit by category", `SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price) / SUM(oi.quantity), 2) AS rpu FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category ORDER BY rpu DESC`);

// ---- 502: cancelled list ----
probe("M2. cancelled list by id", `SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled' ORDER BY o.id`);
probe("M3. coincidence o.id = c.id among cancelled", `SELECT o.id, c.name FROM orders o JOIN customers c ON o.id = c.id WHERE o.status = 'cancelled'`);

// ---- extra: unshipped-in-ON row counts for 525 verification ----
probe("AC2. shipped-in-ON totals", `SELECT COUNT(*) AS total_rows, SUM(o.id IS NULL) AS null_rows, SUM(o.id IS NOT NULL) AS matched FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'`);

db.close();
rmSync(COPY, { force: true });
console.log("\n(done; copy removed)");
