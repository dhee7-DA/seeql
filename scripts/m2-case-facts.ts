/// <reference types="bun-types" />
/**
 * M2 case-facts harvest — every figure family the Module 2 (joins) case
 * authors need, probed fresh on a READ-ONLY COPY of the seed db. Output is
 * the receipt sheet pasted into author briefs. Rerunnable.
 */
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m2case.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (label: string, sql: string) => {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const show = rows.slice(0, 25).map((r) => Object.values(r).join(" | "));
    console.log(`## ${label}`);
    console.log(show.length ? show.map((s) => "   " + s).join("\n") : "   (0 rows)");
    if (rows.length > 25) console.log(`   … ${rows.length} rows total`);
  } catch (e) {
    console.log(`## ${label}\n   ERROR: ${e instanceof Error ? e.message : e}`);
  }
};

console.log("=== M2 CASE FACTS (seed db, read-only) ===\n");

q("customer x order count (all 16)", `SELECT c.name, COUNT(o.id) n FROM customers c JOIN orders o ON o.customer_id=c.id GROUP BY c.id ORDER BY n DESC`);
q("city x order count", `SELECT c.city, COUNT(*) n FROM customers c JOIN orders o ON o.customer_id=c.id GROUP BY c.city ORDER BY n DESC`);
q("region x order count + revenue (order grain)", `SELECT c.region, COUNT(*) n, ROUND(SUM(o.total),2) rev, ROUND(AVG(o.total),2) avg_order FROM customers c JOIN orders o ON o.customer_id=c.id GROUP BY c.region ORDER BY rev DESC`);
q("status x count", `SELECT status, COUNT(*) n FROM orders GROUP BY status`);
q("pending orders value", `SELECT COUNT(*) n, ROUND(SUM(total),2) v FROM orders WHERE status='pending'`);
q("cancelled orders list", `SELECT id, customer_id, total FROM orders WHERE status='cancelled'`);
q("unshipped count", `SELECT COUNT(*) n, ROUND(SUM(total),2) v FROM orders WHERE shipped_at IS NULL`);

q("customer x invoice count (LEFT, zero-bucket shows)", `SELECT c.name, COUNT(i.id) n FROM customers c LEFT JOIN invoices i ON i.customer_id=c.id GROUP BY c.id ORDER BY n DESC`);
q("uninvoiced customers (anti-join)", `SELECT c.name, c.region FROM customers c LEFT JOIN invoices i ON i.customer_id=c.id WHERE i.id IS NULL`);
q("invoices by status", `SELECT status, COUNT(*) n, ROUND(SUM(amount_cents)/100.0,2) v FROM invoices GROUP BY status`);
q("invoices total money", `SELECT COUNT(*) n, ROUND(SUM(amount_cents)/100.0,2) v FROM invoices`);
q("customer x invoice money (top)", `SELECT c.name, COUNT(i.id) n, ROUND(SUM(i.amount_cents)/100.0,2) v FROM customers c JOIN invoices i ON i.customer_id=c.id GROUP BY c.id ORDER BY v DESC`);
q("LEFT JOIN invoices rows vs count(i.id)", `SELECT COUNT(*) rows_, COUNT(i.id) matched, COUNT(DISTINCT c.id) customers FROM customers c LEFT JOIN invoices i ON i.customer_id=c.id`);
q("invoices LEFT JOIN payments", `SELECT COUNT(*) rows_, COUNT(p.id) matched FROM invoices i LEFT JOIN payments p ON p.invoice_id=i.id`);
q("multi-paid invoices", `SELECT i.number, COUNT(p.id) n, ROUND(SUM(p.amount_cents)/100.0,2) v FROM invoices i JOIN payments p ON p.invoice_id=i.id GROUP BY i.id HAVING COUNT(p.id)>1`);
q("unpaid invoices (anti payments)", `SELECT i.number, ROUND(i.amount_cents)/100.0 v FROM invoices i LEFT JOIN payments p ON p.invoice_id=i.id WHERE p.id IS NULL`);
q("customers->invoices->payments chain", `SELECT COUNT(*) rows_, COUNT(DISTINCT c.id) customers FROM customers c JOIN invoices i ON i.customer_id=c.id JOIN payments p ON p.invoice_id=i.id`);
q("region x paid money (payments chain)", `SELECT c.region, COUNT(*) pays, ROUND(SUM(p.amount_cents)/100.0,2) v FROM payments p JOIN invoices i ON p.invoice_id=i.id JOIN customers c ON i.customer_id=c.id GROUP BY c.region ORDER BY v DESC`);

q("lines count + money (line grain)", `SELECT COUNT(*) n, ROUND(SUM(quantity*unit_price),2) v, COUNT(DISTINCT order_id) orders FROM order_items`);
q("orders x line count dist", `SELECT lines, COUNT(*) orders FROM (SELECT o.id, COUNT(oi.id) lines FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id GROUP BY o.id) GROUP BY lines ORDER BY lines`);
q("customer x lines (top)", `SELECT c.name, COUNT(oi.id) lines, ROUND(SUM(oi.quantity*oi.unit_price),2) v FROM customers c JOIN orders o ON o.customer_id=c.id JOIN order_items oi ON oi.order_id=o.id GROUP BY c.id ORDER BY lines DESC`);
q("product x units + revenue (top)", `SELECT p.name, SUM(oi.quantity) units, ROUND(SUM(oi.quantity*oi.unit_price),2) rev FROM order_items oi JOIN products p ON p.id=oi.product_id GROUP BY p.id ORDER BY units DESC`);
q("category x units + revenue", `SELECT p.category, COUNT(DISTINCT p.id) products, SUM(oi.quantity) units, ROUND(SUM(oi.quantity*oi.unit_price),2) rev FROM order_items oi JOIN products p ON p.id=oi.product_id GROUP BY p.category ORDER BY rev DESC`);
q("supplier x units (via products)", `SELECT s.name, s.region, SUM(oi.quantity) units FROM order_items oi JOIN products p ON p.id=oi.product_id JOIN suppliers s ON s.id=p.supplier_id GROUP BY s.id ORDER BY units DESC`);
q("supplier region x units", `SELECT s.region, SUM(oi.quantity) units, COUNT(DISTINCT p.id) products FROM order_items oi JOIN products p ON p.id=oi.product_id JOIN suppliers s ON s.id=p.supplier_id GROUP BY s.region ORDER BY units DESC`);
q("suppliers x products", `SELECT s.name, s.region, COUNT(p.id) products FROM suppliers s LEFT JOIN products p ON p.supplier_id=s.id GROUP BY s.id ORDER BY products DESC`);
q("products x suppliers (16 rows sample)", `SELECT p.name, s.name supplier, s.region FROM products p JOIN suppliers s ON s.id=p.supplier_id ORDER BY p.id LIMIT 16`);

q("same-region customer pairs (no guard)", `SELECT COUNT(*) n FROM customers a JOIN customers b ON a.region=b.region`);
q("same-region pairs a.id < b.id", `SELECT COUNT(*) n FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id`);
q("same-region pairs a.id <= b.id", `SELECT COUNT(*) n FROM customers a JOIN customers b ON a.region=b.region AND a.id<=b.id`);
q("same-city pairs < ", `SELECT COUNT(*) n FROM customers a JOIN customers b ON a.city=b.city AND a.id<b.id`);
q("same-region pairs sample EU", `SELECT a.name, b.name FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.region='EU'`);
q("order pairs per customer max", `SELECT c.name, COUNT(*) pairs FROM orders o1 JOIN orders o2 ON o1.customer_id=o2.customer_id AND o1.id<o2.id JOIN customers c ON c.id=o1.customer_id GROUP BY o1.customer_id ORDER BY pairs DESC`);
q("same-product line pairs", `SELECT COUNT(*) n FROM order_items a JOIN order_items b ON a.product_id=b.product_id AND a.id<b.id`);

q("pending in ON vs WHERE (LEFT)", `SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.status='pending'`);
q("pending in WHERE (collapses)", `SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id=c.id WHERE o.status='pending'`);
q("unshipped in ON", `SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.shipped_at IS NULL`);
q("EU in ON (LEFT preserved)", `SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND c.region='EU'`);
q("EU in WHERE (collapses to inner)", `SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id=c.id WHERE c.region='EU'`);
q("cancelled in ON", `SELECT COUNT(*) n, COUNT(DISTINCT c.id) customers FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.status='cancelled'`);
q("zero-order buckets false? every customer has orders", `SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id=c.id WHERE o.id IS NULL`);

q("USING(id) customers x orders", `SELECT COUNT(*) n FROM customers JOIN orders USING (id)`);
q("NATURAL customers x orders", `SELECT COUNT(*) n FROM customers NATURAL JOIN orders`);
q("NATURAL orders x products", `SELECT COUNT(*) n FROM orders NATURAL JOIN products`);
q("CROSS JOIN + ON honored", `SELECT COUNT(*) n FROM orders o CROSS JOIN customers c ON c.id=o.customer_id`);
q("comma join with WHERE", `SELECT COUNT(*) n FROM orders o, customers c WHERE c.id=o.customer_id`);
q("comma join no WHERE", `SELECT COUNT(*) n FROM customers, orders`);
q("wrong FK join c.id=o.id", `SELECT COUNT(*) n FROM customers c JOIN orders o ON c.id=o.id`);
q("region case: ='eu' vs ='EU'", `SELECT (SELECT COUNT(*) FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='eu') eu_lower, (SELECT COUNT(*) FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='EU') eu_upper`);
q("invoices x orders same customer (mesh)", `SELECT COUNT(*) n, ROUND(SUM(o.total),2) v FROM invoices i JOIN orders o ON o.customer_id=i.customer_id`);
q("o.id='7' affinity join", `SELECT COUNT(*) n FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.id='7'`);

q("orders x items row inflation", `SELECT (SELECT COUNT(*) FROM orders) bare, (SELECT COUNT(*) FROM orders o JOIN order_items oi ON oi.order_id=o.id) joined, (SELECT ROUND(SUM(total),2) FROM orders) sum_bare, (SELECT ROUND(SUM(o.total),2) FROM orders o JOIN order_items oi ON oi.order_id=o.id) sum_joined`);
q("customer with orders+invoices full shape (Alice)", `SELECT (SELECT COUNT(*) FROM orders WHERE customer_id=1) orders, (SELECT COUNT(*) FROM invoices WHERE customer_id=1) invoices, (SELECT COUNT(*) FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.customer_id=1) lines`);
q("customer list for briefs (all 16)", `SELECT id, name, city, region, active FROM customers ORDER BY id`);
q("supplier list", `SELECT * FROM suppliers ORDER BY id`);
q("product catalog", `SELECT id, name, category, price, stock, supplier_id FROM products ORDER BY id`);
q("expenses by category", `SELECT category, COUNT(*) n, ROUND(SUM(amount_cents)/100.0,2) v FROM expenses GROUP BY category ORDER BY v DESC`);
q("expenses x nothing joins — sanity", `SELECT COUNT(*) n FROM expenses`);

db.close();
rmSync(COPY, { force: true });
