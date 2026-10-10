/// <reference types="bun:sqlite" />
/** J3 follow-up probes (corrections + walkthrough receipts). Read-only copy, rerunnable. */
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m2j3b.db";
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

// cancelled orders with buyer names (cs-402 fill + walkthrough)
q("cancelled w/ names", `SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.status = 'cancelled' ORDER BY o.total DESC`);

// cs-432 clean columns
q("cancelled->delivered pairs sample", `SELECT a.id AS cancelled_id, b.id AS delivered_id FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND a.id < b.id WHERE a.status = 'cancelled' AND b.status = 'delivered' ORDER BY a.id DESC, b.id DESC LIMIT 6`);
q("cancelled->delivered Keiko rows", `SELECT a.id, b.id FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND a.id < b.id WHERE a.status = 'cancelled' AND b.status = 'delivered' AND a.customer_id = (SELECT id FROM customers WHERE name='Keiko Sato')`);

// cs-404 exact Andes name
q("Andes SA products", `SELECT p.name, p.price, s.region FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Andes Naturals SA' AND s.region = 'LATAM' ORDER BY p.price DESC`);
q("Pacific Textiles products", `SELECT p.name, p.price FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Pacific Textiles' ORDER BY p.price DESC`);

// cs-416 exact Midwest name
q("Midwest per-product", `SELECT p.name, COUNT(*) AS lines, SUM(oi.quantity) AS units FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id WHERE s.name = 'Midwest Hardware Co' GROUP BY p.id ORDER BY units DESC`);

// cs-413 Desk Mat top lines
q("Desk Mat top lines", `SELECT oi.order_id, oi.quantity, oi.unit_price FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE p.name = 'Desk Mat Extended' AND p.category = 'Accessories' ORDER BY oi.unit_price DESC, oi.order_id LIMIT 10`);
q("Headset top line prices", `SELECT oi.order_id, oi.unit_price FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE p.name = 'Noise-Canceling Headset' ORDER BY oi.unit_price DESC, oi.order_id LIMIT 3`);

// cs-424 premium ceiling anti
q("products with lines > 150", `SELECT p.name, COUNT(*) n FROM products p JOIN order_items oi ON oi.product_id = p.id AND oi.unit_price > 150 GROUP BY p.id`);
q("products with lines > 100", `SELECT p.name, COUNT(*) n FROM products p JOIN order_items oi ON oi.product_id = p.id AND oi.unit_price > 100 GROUP BY p.id`);
q("products with lines > 250", `SELECT p.name, COUNT(*) n FROM products p JOIN order_items oi ON oi.product_id = p.id AND oi.unit_price > 250 GROUP BY p.id`);
q("anti > 150 rows", `SELECT p.name FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.unit_price > 150 WHERE oi.id IS NULL ORDER BY p.name`);

// cs-435 wrong-fk consequence
q("line revenue oi.order_id = o.customer_id", `SELECT ROUND(SUM(oi.quantity * oi.unit_price), 2) AS v, COUNT(*) n FROM order_items oi JOIN orders o ON oi.order_id = o.customer_id`);

// cs-441 Emma mesh (customer 5)
q("Emma mesh total", `SELECT COUNT(*) n FROM invoices i JOIN orders o ON i.customer_id = o.customer_id WHERE i.customer_id = 5`);
q("Bruno(2) mesh total", `SELECT COUNT(*) n FROM invoices i JOIN orders o ON i.customer_id = o.customer_id WHERE i.customer_id = 2`);

// cs-444 clean USING rows
q("USING(id) p x s clean", `SELECT p.id, p.name AS product, s.name AS supplier FROM products p JOIN suppliers s USING (id) ORDER BY p.id`);

// cs-426 pair listing sample (walkthrough)
q("same-supplier pairs by supplier", `SELECT s.name, COUNT(*) AS pairs FROM products a JOIN products b ON a.supplier_id = b.supplier_id AND a.id < b.id JOIN suppliers s ON s.id = a.supplier_id GROUP BY s.id ORDER BY pairs DESC`);

// cs-431 Alice invoice pairs sample
q("Alice invoice pair count", `SELECT COUNT(*) n FROM invoices a JOIN invoices b ON a.customer_id = b.customer_id AND a.id < b.id WHERE a.customer_id = 1`);
q("a.id = c.id coincidence (431 distractor)", `SELECT COUNT(*) n FROM customers c JOIN invoices a ON a.id = c.id JOIN invoices b ON a.customer_id = b.customer_id AND a.id < b.id`);

// cs-442 top cancelled rows
q("cancelled top3", `SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.status = 'cancelled' ORDER BY o.total DESC LIMIT 3`);

// cs-421 collected full list (verify zero set = 8)
q("collected per customer all", `SELECT c.name, ROUND(COALESCE(SUM(p.amount_cents), 0) / 100.0, 2) AS collected FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id GROUP BY c.id ORDER BY collected DESC, c.name`);

// cs-417 invoiced all (verify zero set = 5)
q("invoiced per customer zeros", `SELECT c.name FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id GROUP BY c.id HAVING SUM(i.amount_cents) IS NULL ORDER BY c.name`);

// cs-409 top rows check under 400 (distractor threshold shift)
q("orders >= 400 delivered count", `SELECT COUNT(*) n FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.total >= 400 AND o.status = 'delivered'`);

// cs-406 WHERE variant (INNER equivalence check for distractor safety)
q("rating >= 4.6 via WHERE", `SELECT COUNT(*) n FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE s.rating >= 4.6`);

// cs-447: which open invoice has the payment (amount)
q("Alice open invoice payment", `SELECT i.number, p.paid_on, p.amount_cents, p.method FROM invoices i JOIN payments p ON p.invoice_id = i.id WHERE i.status = 'open'`);

// cs-411: verify latest-5 with deterministic tiebreak
q("latest 5 payments tiebreak", `SELECT p.paid_on, i.number, c.name, p.method FROM payments p JOIN invoices i ON i.id = p.invoice_id JOIN customers c ON i.customer_id = c.id ORDER BY p.paid_on DESC, p.id DESC LIMIT 5`);
q("latest 5 LIMIT 3 differs", `SELECT p.paid_on, i.number, c.name FROM payments p JOIN invoices i ON i.id = p.invoice_id JOIN customers c ON i.customer_id = c.id ORDER BY p.paid_on DESC, p.id DESC LIMIT 3`);

// cs-433: alias in HAVING sanity (orders alias)
q("HAVING orders >= 14 verify", `SELECT c.name, COUNT(*) AS orders FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING orders >= 14 ORDER BY orders DESC, c.name`);

// cs-439: tie sanity + >= 100 set with name tiebreak
q("pair counts >= 100 named", `SELECT p.name, COUNT(*) AS pairs FROM order_items a JOIN order_items b ON a.product_id = b.product_id AND a.id < b.id JOIN products p ON p.id = a.product_id GROUP BY p.id HAVING pairs >= 100 ORDER BY pairs DESC, p.name`);

// cs-450: revenue-order vs price-order rows for walkthrough
q("supplier avg price DESC rows", `SELECT s.name, COUNT(*) AS products, ROUND(AVG(p.price), 2) AS avg_price FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id ORDER BY avg_price DESC, s.name`);

rmSync(COPY, { force: true });
console.log("\n(done — copy removed)");
