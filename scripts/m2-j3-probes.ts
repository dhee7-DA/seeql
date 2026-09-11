/// <reference types="bun:sqlite" />
/**
 * Targeted probes for J3 batch specifics (cs-401..450). Read-only copy, rerunnable.
 * Every figure used in cases-j3.ts must come from this run or the shared fact sheet.
 */
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m2j3.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (label: string, sql: string) => {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`## ${label}`);
    console.log(rows.length ? rows.slice(0, 40).map((r) => "   " + Object.values(r).join(" | ")).join("\n") : "   (0 rows)");
    if (rows.length > 40) console.log(`   … ${rows.length} rows`);
  } catch (e) {
    console.log(`## ${label}\n   ERROR: ${e instanceof Error ? e.message : e}`);
  }
};

// ---- reference lists -------------------------------------------------------
q("suppliers", `SELECT id, name, region, rating FROM suppliers ORDER BY id`);
q("customers compact", `SELECT id, name, city, region, active FROM customers ORDER BY id`);
q("payment methods", `SELECT method, COUNT(*) n, ROUND(SUM(amount_cents)/100.0,2) amt FROM payments GROUP BY method`);

// ---- cs-401 void invoice owner --------------------------------------------
q("void invoice owner", `SELECT i.number, i.amount_cents, c.name, c.city FROM invoices i JOIN customers c ON i.customer_id = c.id WHERE i.status = 'void'`);
q("void invoice payments (LEFT)", `SELECT i.number, p.id, p.paid_on FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE i.status = 'void'`);

// ---- cs-402 Farid cancelled ------------------------------------------------
q("Farid cancelled", `SELECT o.id, o.total FROM orders o JOIN customers c ON o.customer_id = c.id WHERE c.name = 'Farid Nasser' AND o.status = 'cancelled' ORDER BY o.total DESC`);
q("Farid all orders", `SELECT o.id, o.status, o.total FROM orders o JOIN customers c ON o.customer_id = c.id WHERE c.name = 'Farid Nasser' ORDER BY o.id`);

// ---- cs-403 products over 100 ---------------------------------------------
q("products > 100", `SELECT p.name, p.price, s.name AS supplier FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE p.price > 100 ORDER BY p.price DESC`);
q("products > 50 count", `SELECT COUNT(*) n FROM products p WHERE p.price > 50`);

// ---- cs-404 Andes Naturals --------------------------------------------------
q("Andes products", `SELECT p.name, p.price, s.region FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Andes Naturals' AND s.region = 'LATAM' ORDER BY p.price DESC`);
q("Nordic EU products", `SELECT p.name, p.price FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Nordic Gadgets AB' AND s.region = 'EU' ORDER BY p.price DESC`);

// ---- cs-405 Bruno orders ----------------------------------------------------
q("Bruno delivered orders", `SELECT o.id, o.status, o.total FROM orders o JOIN customers c ON o.customer_id = c.id WHERE c.name = 'Bruno Silva' AND o.status = 'delivered' ORDER BY o.id`);
q("Bruno all orders", `SELECT o.id, o.status, o.total FROM orders o JOIN customers c ON o.customer_id = c.id WHERE c.name = 'Bruno Silva' ORDER BY o.id`);

// ---- cs-406 compound ON rating ----------------------------------------------
q("rating >= 4.6 via ON", `SELECT p.name, p.stock, s.name AS supplier, s.rating FROM products p JOIN suppliers s ON s.id = p.supplier_id AND s.rating >= 4.6 ORDER BY p.stock DESC`);
q("rating >= 4.7 count", `SELECT COUNT(*) n FROM products p JOIN suppliers s ON s.id = p.supplier_id AND s.rating >= 4.7`);
q("rating >= 4.9 count", `SELECT COUNT(*) n FROM products p JOIN suppliers s ON s.id = p.supplier_id AND s.rating >= 4.9`);
q("rating >= 4.6 OR variant", `SELECT COUNT(*) n FROM products p JOIN suppliers s ON s.id = p.supplier_id OR s.rating >= 4.6`);

// ---- cs-407 open invoices ---------------------------------------------------
q("open invoices w/ names", `SELECT c.name, i.number, i.amount_cents FROM invoices i JOIN customers c ON i.customer_id = c.id WHERE i.status = 'open' ORDER BY i.amount_cents DESC`);
q("open invoices LEFT count", `SELECT COUNT(*) n FROM invoices i LEFT JOIN customers c ON i.customer_id = c.id`);

// ---- cs-408 delivered AND active --------------------------------------------
q("delivered AND active compound", `SELECT COUNT(*) n FROM orders o JOIN customers c ON o.customer_id = c.id AND c.active = 1 WHERE o.status = 'delivered'`);
q("delivered inactive", `SELECT COUNT(*) n FROM orders o JOIN customers c ON o.customer_id = c.id AND c.active = 0 WHERE o.status = 'delivered'`);
q("inactive customers", `SELECT name, city FROM customers WHERE active = 0`);

// ---- cs-409 big orders ------------------------------------------------------
q("orders >= 500 delivered", `SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.total >= 500 AND o.status = 'delivered' ORDER BY o.total DESC`);
q("orders >= 500 delivered count", `SELECT COUNT(*) n FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.total >= 500 AND o.status = 'delivered'`);
q("orders >= 100 delivered count", `SELECT COUNT(*) n FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.total >= 100 AND o.status = 'delivered'`);
q("orders >= 500 shipped count", `SELECT COUNT(*) n FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.total >= 500 AND o.status = 'shipped'`);

// ---- cs-410 Nordic lines ----------------------------------------------------
q("Nordic lines", `SELECT COUNT(*) n, SUM(oi.quantity) units FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Nordic Gadgets AB'`);
q("Nordic lines sample", `SELECT oi.quantity, p.name FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Nordic Gadgets AB' ORDER BY p.name, oi.id LIMIT 8`);
q("Shenzhen lines sample", `SELECT oi.quantity, p.name FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Shenzhen Electro' ORDER BY p.name, oi.id LIMIT 4`);
q("s.id = p.id coincidence lines", `SELECT COUNT(*) n FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.id WHERE s.name = 'Nordic Gadgets AB'`);

// ---- cs-411 latest payments ---------------------------------------------------
q("latest 5 payments", `SELECT p.paid_on, i.number, c.name, p.method FROM payments p JOIN invoices i ON i.id = p.invoice_id JOIN customers c ON i.customer_id = c.id ORDER BY p.paid_on DESC, p.id DESC LIMIT 5`);
q("latest 3 payments", `SELECT p.paid_on, i.number, c.name FROM payments p JOIN invoices i ON i.id = p.invoice_id JOIN customers c ON i.customer_id = c.id ORDER BY p.paid_on DESC, p.id DESC LIMIT 3`);
q("i.id = p.id coincidence count", `SELECT COUNT(*) n FROM payments p JOIN invoices i ON p.id = i.id JOIN customers c ON i.customer_id = c.id`);

// ---- cs-412 cancelled lines ---------------------------------------------------
q("cancelled lines", `SELECT o.id, oi.quantity, p.name FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id WHERE o.status = 'cancelled' ORDER BY o.id, oi.id`);
q("cancelled lines count", `SELECT COUNT(*) n FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.status = 'cancelled'`);

// ---- cs-413 Desk Mat lines ----------------------------------------------------
q("Desk Mat lines", `SELECT COUNT(*) n, SUM(oi.quantity) units FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE p.name = 'Desk Mat Extended'`);
q("Desk Mat lines sample", `SELECT o.id, oi.quantity, oi.unit_price FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE p.name = 'Desk Mat Extended' AND p.category = 'Accessories' ORDER BY oi.unit_price DESC, o.id LIMIT 10`);
q("Headset lines count", `SELECT COUNT(*) n FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE p.name = 'Noise-Canceling Headset'`);
q("Desk Mat category", `SELECT category, price FROM products WHERE name = 'Desk Mat Extended'`);

// ---- cs-414 Andes/LATAM lines --------------------------------------------------
q("LATAM supplier lines", `SELECT oi.quantity, p.name, oi.unit_price FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON p.supplier_id = s.id WHERE s.region = 'LATAM' ORDER BY oi.quantity DESC, p.name`);
q("LATAM supplier lines count", `SELECT COUNT(*) n, SUM(oi.quantity) units FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON p.supplier_id = s.id WHERE s.region = 'LATAM'`);
q("product_id = s.id variant count", `SELECT COUNT(*) n FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON oi.product_id = s.id WHERE s.region = 'LATAM'`);

// ---- cs-415 city lines ----------------------------------------------------------
q("city lines top", `SELECT c.city, COUNT(*) AS lines FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items oi ON oi.order_id = o.id GROUP BY c.city ORDER BY lines DESC LIMIT 5`);
q("city lines all", `SELECT c.city, COUNT(*) AS lines FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items oi ON oi.order_id = o.id GROUP BY c.city ORDER BY lines DESC`);

// ---- cs-416 Midwest per-product --------------------------------------------------
q("Midwest per-product", `SELECT p.name, COUNT(*) AS lines, SUM(oi.quantity) AS units FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id WHERE s.name = 'Midwest Hardware Co.' GROUP BY p.id ORDER BY units DESC`);
q("Nordic per-product", `SELECT p.name, COUNT(*) AS lines, SUM(oi.quantity) AS units FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id WHERE s.name = 'Nordic Gadgets AB' GROUP BY p.id ORDER BY units DESC`);

// ---- cs-417 invoiced per customer ------------------------------------------------
q("invoiced per customer top6", `SELECT c.name, ROUND(SUM(i.amount_cents) / 100.0, 2) AS invoiced FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id GROUP BY c.id ORDER BY invoiced DESC LIMIT 6`);
q("invoiced per customer LIMIT 8 rows", `SELECT COUNT(*) n FROM (SELECT 1 x)`);

// ---- cs-418 active-filter LEFT ----------------------------------------------------
q("LEFT active-filter tally", `SELECT c.name, COUNT(o.id) AS orders FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND c.active = 1 GROUP BY c.id ORDER BY c.name`);
q("active = 0 tally rows", `SELECT c.name, COUNT(o.id) AS orders FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND c.active = 0 GROUP BY c.id ORDER BY c.name`);

// ---- cs-419 void trail -------------------------------------------------------------
q("void invoice row", `SELECT i.number, i.status, p.paid_on, p.amount_cents FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE i.number = 'INV-2024-011'`);
q("INV-2024-018 row", `SELECT i.number, i.status, p.paid_on FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE i.number = 'INV-2024-018'`);

// ---- cs-420 premium-line tally ------------------------------------------------------
q("premium > 130 tally", `SELECT p.name, COUNT(oi.id) AS premium_lines FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.unit_price > 130 GROUP BY p.id ORDER BY premium_lines DESC, p.name`);
q("premium > 120 tally top", `SELECT p.name, COUNT(oi.id) AS premium_lines FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.unit_price > 120 GROUP BY p.id ORDER BY premium_lines DESC, p.name LIMIT 4`);
q("premium > 200 tally top", `SELECT p.name, COUNT(oi.id) AS premium_lines FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.unit_price > 200 GROUP BY p.id ORDER BY premium_lines DESC, p.name LIMIT 4`);

// ---- cs-421 collected per customer ----------------------------------------------------
q("collected per customer top6", `SELECT c.name, ROUND(COALESCE(SUM(p.amount_cents), 0) / 100.0, 2) AS collected FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id GROUP BY c.id ORDER BY collected DESC LIMIT 6`);
q("collected per customer bottom", `SELECT c.name, ROUND(COALESCE(SUM(p.amount_cents), 0) / 100.0, 2) AS collected FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id GROUP BY c.id ORDER BY collected DESC LIMIT 6 OFFSET 10`);

// ---- cs-422 cancelled tally --------------------------------------------------------------
q("cancelled tally", `SELECT c.name, COUNT(o.id) AS cancelled FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled' GROUP BY c.id ORDER BY cancelled DESC, c.name`);
q("shipped tally top", `SELECT c.name, COUNT(o.id) AS shipped FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' GROUP BY c.id ORDER BY shipped DESC, c.name LIMIT 4`);

// ---- cs-423 no big orders ------------------------------------------------------------------
q("no order >= 500", `SELECT c.name, c.region FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.total >= 500 WHERE o.id IS NULL ORDER BY c.name`);
q("no order >= 100 count", `SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.total >= 100 WHERE o.id IS NULL`);
q("no order >= 500 count", `SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.total >= 500 WHERE o.id IS NULL`);

// ---- cs-424 no qty-3 lines -------------------------------------------------------------------
q("no qty-3 lines (all)", `SELECT p.name, p.category FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.quantity = 3 WHERE oi.id IS NULL ORDER BY p.name`);
q("no qty-3 lines Accessories", `SELECT p.name FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.quantity = 3 WHERE oi.id IS NULL AND p.category = 'Accessories' ORDER BY p.name`);
q("no qty-2 lines Accessories", `SELECT p.name FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.quantity = 2 WHERE oi.id IS NULL AND p.category = 'Accessories' ORDER BY p.name`);
q("qty-3 lines per product", `SELECT p.name, COUNT(*) n FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.quantity = 3 GROUP BY p.id ORDER BY n DESC`);

// ---- cs-425 no shipped ------------------------------------------------------------------------
q("no shipped orders", `SELECT c.name, c.city FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' WHERE o.id IS NULL ORDER BY c.name`);
q("no delivered orders", `SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered' WHERE o.id IS NULL`);

// ---- cs-426/430 self product pairs --------------------------------------------------------------
q("same-supplier product pairs", `SELECT COUNT(*) AS pairs FROM products a JOIN products b ON a.supplier_id = b.supplier_id AND a.id < b.id`);
q("same-supplier pairs <=", `SELECT COUNT(*) AS pairs FROM products a JOIN products b ON a.supplier_id = b.supplier_id AND a.id <= b.id`);
q("same-supplier pairs !=", `SELECT COUNT(*) AS pairs FROM products a JOIN products b ON a.supplier_id = b.supplier_id AND a.id != b.id`);
q("same-category pairs", `SELECT COUNT(*) AS pairs FROM products a JOIN products b ON a.category = b.category AND a.id < b.id`);
q("same-category pairs Wearables", `SELECT COUNT(*) AS pairs FROM products a JOIN products b ON a.category = b.category AND a.id < b.id WHERE a.category = 'Wearables'`);
q("same-category pairs Fitness", `SELECT COUNT(*) AS pairs FROM products a JOIN products b ON a.category = b.category AND a.id < b.id WHERE a.category = 'Fitness'`);
q("same-category pairs Audio", `SELECT COUNT(*) AS pairs FROM products a JOIN products b ON a.category = b.category AND a.id < b.id WHERE a.category = 'Audio'`);
q("category sizes", `SELECT category, COUNT(*) n FROM products GROUP BY category ORDER BY n DESC`);

// ---- cs-427 no payments double anti ---------------------------------------------------------------
q("customers with no payments", `SELECT c.name, c.region FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL ORDER BY c.name`);
q("payments via INNER i LEFT p", `SELECT c.name FROM customers c JOIN invoices i ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL ORDER BY c.name`);
q("i.id IS NULL variant", `SELECT c.name FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id WHERE i.id IS NULL ORDER BY c.name`);

// ---- cs-428 no paid invoice ------------------------------------------------------------------------
q("no PAID invoice", `SELECT c.name, c.region FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id AND i.status = 'paid' WHERE i.id IS NULL ORDER BY c.name`);
q("no VOID invoice count", `SELECT COUNT(*) n FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id AND i.status = 'void' WHERE i.id IS NULL`);
q("no OPEN invoice count", `SELECT COUNT(*) n FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id AND i.status = 'open' WHERE i.id IS NULL`);

// ---- cs-431 invoice pairs ---------------------------------------------------------------------------
q("invoice pairs per customer", `SELECT c.name, COUNT(*) AS pairs FROM customers c JOIN invoices a ON a.customer_id = c.id JOIN invoices b ON a.customer_id = b.customer_id AND a.id < b.id GROUP BY c.id HAVING pairs >= 2 ORDER BY pairs DESC`);
q("invoice pairs total", `SELECT COUNT(*) n FROM invoices a JOIN invoices b ON a.customer_id = b.customer_id AND a.id < b.id`);
q("invoice pairs <= total", `SELECT COUNT(*) n FROM invoices a JOIN invoices b ON a.customer_id = b.customer_id AND a.id <= b.id`);
q("invoice pairs = 2 customers", `SELECT c.name, COUNT(*) AS pairs FROM customers c JOIN invoices a ON a.customer_id = c.id JOIN invoices b ON a.customer_id = b.customer_id AND a.id < b.id GROUP BY c.id HAVING pairs = 2 ORDER BY c.name`);
q("invoice pairs >= 3 customers", `SELECT c.name, COUNT(*) AS pairs FROM customers c JOIN invoices a ON a.customer_id = c.id JOIN invoices b ON a.customer_id = b.customer_id AND a.id < b.id GROUP BY c.id HAVING pairs >= 3 ORDER BY pairs DESC`);

// ---- cs-432 cancelled-delivered pairs -----------------------------------------------------------------
q("cancelled x delivered pairs", `SELECT a.id, b.id, a.total, b.total FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND a.id < b.id WHERE a.status = 'cancelled' AND b.status = 'delivered' ORDER BY a.id DESC`);
q("cancelled x delivered pairs count", `SELECT COUNT(*) n FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND a.id < b.id WHERE a.status = 'cancelled' AND b.status = 'delivered'`);
q("cancelled x shipped pairs count", `SELECT COUNT(*) n FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND a.id < b.id WHERE a.status = 'cancelled' AND b.status = 'shipped'`);
q("cancelled x pending pairs count", `SELECT COUNT(*) n FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND a.id < b.id WHERE a.status = 'cancelled' AND b.status = 'pending'`);

// ---- cs-433 HAVING orders -------------------------------------------------------------------------------
q("customers >= 14 orders", `SELECT c.name, COUNT(*) AS orders FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING orders >= 14 ORDER BY orders DESC`);
q("customers >= 10 orders", `SELECT c.name, COUNT(*) AS orders FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING orders >= 10 ORDER BY orders DESC`);
q("customers >= 20 orders", `SELECT c.name, COUNT(*) AS orders FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING orders >= 20 ORDER BY orders DESC`);

// ---- cs-434 Wearables units ------------------------------------------------------------------------------
q("Wearables per-product units", `SELECT p.name, SUM(oi.quantity) AS units FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE p.category = 'Wearables' GROUP BY p.id ORDER BY units DESC`);
q("Audio per-product units", `SELECT p.name, SUM(oi.quantity) AS units FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE p.category = 'Audio' GROUP BY p.id ORDER BY units DESC`);

// ---- cs-435 line revenue ----------------------------------------------------------------------------------
q("line revenue total", `SELECT ROUND(SUM(oi.quantity * oi.unit_price), 2) AS line_revenue FROM order_items oi JOIN orders o ON oi.order_id = o.id`);
q("line revenue AVG", `SELECT ROUND(AVG(oi.quantity * oi.unit_price), 2) AS avg_line FROM order_items oi JOIN orders o ON oi.order_id = o.id`);
q("line revenue wrong fk", `SELECT ROUND(SUM(oi.quantity * oi.unit_price), 2) AS line_revenue FROM order_items oi JOIN orders o ON oi.product_id = o.id`);

// ---- cs-436 supplier revenue + rating -----------------------------------------------------------------------
q("supplier revenue + rating", `SELECT s.name, s.rating, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS line_rev FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON p.supplier_id = s.id GROUP BY s.id ORDER BY line_rev DESC`);
q("supplier revenue by rating order", `SELECT s.name, s.rating, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS line_rev FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON p.supplier_id = s.id GROUP BY s.id ORDER BY s.rating DESC`);

// ---- cs-437 multi-paid ----------------------------------------------------------------------------------------
q("multi-paid invoices", `SELECT i.number, COUNT(*) AS payments, ROUND(SUM(p.amount_cents) / 100.0, 2) AS paid FROM invoices i JOIN payments p ON p.invoice_id = i.id GROUP BY i.id HAVING payments > 1 ORDER BY paid DESC`);
q("multi-paid HAVING payments > 2", `SELECT COUNT(*) n FROM invoices i JOIN payments p ON p.invoice_id = i.id GROUP BY i.id HAVING payments > 2`);

// ---- cs-438 avg order by region --------------------------------------------------------------------------------
q("avg order by region", `SELECT c.region, ROUND(AVG(o.total), 2) AS avg_order FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.region ORDER BY avg_order DESC`);
q("avg order by region ASC first", `SELECT c.region, ROUND(AVG(o.total), 2) AS avg_order FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.region ORDER BY avg_order ASC LIMIT 1`);

// ---- cs-439 per-product pair counts ------------------------------------------------------------------------------
q("per-product pair counts >= 100", `SELECT p.name, COUNT(*) AS pairs FROM order_items a JOIN order_items b ON a.product_id = b.product_id AND a.id < b.id JOIN products p ON p.id = a.product_id GROUP BY p.id HAVING pairs >= 100 ORDER BY pairs DESC`);
q("per-product pair counts >= 50", `SELECT p.name, COUNT(*) AS pairs FROM order_items a JOIN order_items b ON a.product_id = b.product_id AND a.id < b.id JOIN products p ON p.id = a.product_id GROUP BY p.id HAVING pairs >= 50 ORDER BY pairs DESC`);
q("per-product pair counts all top", `SELECT p.name, COUNT(*) AS pairs FROM order_items a JOIN order_items b ON a.product_id = b.product_id AND a.id < b.id JOIN products p ON p.id = a.product_id GROUP BY p.id ORDER BY pairs DESC LIMIT 8`);

// ---- cs-440 products per supplier region ---------------------------------------------------------------------------
q("products per supplier region", `SELECT s.region, COUNT(*) AS products FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.region ORDER BY products DESC, s.region`);

// ---- cs-441 mesh by status -------------------------------------------------------------------------------------------
q("Alice mesh by status", `SELECT o.status, COUNT(*) AS mesh_rows FROM invoices i JOIN orders o ON i.customer_id = o.customer_id WHERE i.customer_id = 1 GROUP BY o.status ORDER BY mesh_rows DESC`);
q("Alice mesh total", `SELECT COUNT(*) n FROM invoices i JOIN orders o ON i.customer_id = o.customer_id WHERE i.customer_id = 1`);
q("Emma mesh total", `SELECT COUNT(*) n FROM invoices i JOIN orders o ON i.customer_id = o.customer_id WHERE i.customer_id = 2`);
q("mesh by id coincidence Alice", `SELECT COUNT(*) n FROM invoices i JOIN orders o ON i.customer_id = o.id WHERE i.customer_id = 1`);

// ---- cs-444 USING products x suppliers ---------------------------------------------------------------------------------
q("USING(id) products x suppliers", `SELECT p.name, s.name FROM products p JOIN suppliers s USING (id) ORDER BY p.id`);
q("ON (id) error probe", `SELECT COUNT(*) n FROM products p JOIN suppliers s ON (id)`);

// ---- cs-446 delivered supplier units ------------------------------------------------------------------------------------
q("delivered supplier units >= 30", `SELECT s.name, SUM(oi.quantity) AS units, COUNT(*) AS lines FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE o.status = 'delivered' GROUP BY s.id HAVING units >= 30 ORDER BY units DESC`);
q("delivered supplier units >= 20", `SELECT s.name, SUM(oi.quantity) AS units FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE o.status = 'delivered' GROUP BY s.id HAVING units >= 20 ORDER BY units DESC`);
q("shipped supplier units >= 30", `SELECT s.name, SUM(oi.quantity) AS units FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE o.status = 'shipped' GROUP BY s.id HAVING units >= 30 ORDER BY units DESC`);

// ---- cs-447 open invoices with payments ------------------------------------------------------------------------------------
q("open invoices LEFT payments", `SELECT c.name, i.number, p.paid_on FROM customers c JOIN invoices i ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id WHERE i.status = 'open' ORDER BY i.number`);
q("open invoices INNER payments", `SELECT c.name, i.number, p.paid_on FROM customers c JOIN invoices i ON i.customer_id = c.id JOIN payments p ON p.invoice_id = i.id WHERE i.status = 'open' ORDER BY i.number`);

// ---- cs-448 USING customers x orders ------------------------------------------------------------------------------------------
q("USING customers x orders sample", `SELECT c.name, o.total FROM customers c JOIN orders o USING (id) ORDER BY c.name LIMIT 6`);
q("USING customers x orders count", `SELECT COUNT(*) n FROM customers c JOIN orders o USING (id)`);

// ---- cs-449 wrong FK names ------------------------------------------------------------------------------------------------------
q("wrong FK o.id = c.id rows", `SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON o.id = c.id ORDER BY o.id`);
q("wrong FK count", `SELECT COUNT(*) n FROM orders o JOIN customers c ON o.id = c.id`);
q("o.id = o.customer_id count", `SELECT COUNT(*) n FROM orders o JOIN customers c ON o.id = o.customer_id`);

// ---- cs-450 per-supplier catalog price ------------------------------------------------------------------------------------------
q("supplier product count + avg price", `SELECT s.name, COUNT(*) AS products, ROUND(AVG(p.price), 2) AS avg_price FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id ORDER BY avg_price DESC`);
q("supplier product count by products", `SELECT s.name, COUNT(*) AS products, ROUND(AVG(p.price), 2) AS avg_price FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id ORDER BY products DESC, s.name`);

rmSync(COPY, { force: true });
console.log("\n(done — copy removed)");
