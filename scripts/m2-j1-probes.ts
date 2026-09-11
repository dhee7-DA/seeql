/// <reference types="bun:sqlite" />
/**
 * Targeted probes for J1 batch specifics (cs-301..350). Read-only copy, rerunnable.
 */
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m2j1.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (label: string, sql: string) => {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`## ${label}`);
    console.log(rows.length ? rows.slice(0, 30).map((r) => "   " + Object.values(r).join(" | ")).join("\n") : "   (0 rows)");
    if (rows.length > 30) console.log(`   … ${rows.length} rows`);
  } catch (e) {
    console.log(`## ${label}\n   ERROR: ${e instanceof Error ? e.message : e}`);
  }
};

// cs-327: line-grain revenue + units by supplier region
q("supplier-region line revenue + units", `SELECT s.region, COUNT(*) lines, SUM(oi.quantity) units, ROUND(SUM(oi.quantity*oi.unit_price),2) rev FROM order_items oi JOIN products p ON p.id=oi.product_id JOIN suppliers s ON s.id=p.supplier_id GROUP BY s.region ORDER BY rev DESC`);

// cs-328: cash by city (payments chain), top 3
q("cash by city top5", `SELECT c.city, COUNT(p.id) payments, ROUND(SUM(p.amount_cents)/100.0,2) cash FROM payments p JOIN invoices i ON p.invoice_id=i.id JOIN customers c ON i.customer_id=c.id GROUP BY c.city ORDER BY cash DESC LIMIT 5`);

// cs-341: unpaid invoices exposure
q("unpaid count + exposure", `SELECT COUNT(*) unpaid, ROUND(SUM(i.amount_cents)/100.0,2) exposure FROM invoices i LEFT JOIN payments p ON p.invoice_id=i.id WHERE p.id IS NULL`);
q("unpaid by status", `SELECT i.status, COUNT(*) n FROM invoices i LEFT JOIN payments p ON p.invoice_id=i.id WHERE p.id IS NULL GROUP BY i.status`);

// cs-331/334: order filters used in ON probes (id ranges of pending/shipped)
q("pending order ids", `SELECT id FROM orders WHERE status='pending' ORDER BY id`);
q("shipped order ids sample", `SELECT MIN(id) mn, MAX(id) mx, COUNT(*) n FROM orders WHERE status='shipped'`);

// cs-333/340 distractor consequence checks
q("ON o.id=c.id AND pending", `SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.id=c.id AND o.status='pending'`);
q("pending-in-ON by name check (Bruno rows)", `SELECT c.name, COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.status='pending' GROUP BY c.id HAVING COUNT(o.id)>0 ORDER BY c.name`);

// cs-316: order 1 lines with product + supplier
q("order 1 lines + supplier", `SELECT oi.quantity, p.name, s.name FROM order_items oi JOIN products p ON p.id=oi.product_id JOIN suppliers s ON s.id=p.supplier_id WHERE oi.order_id=1 ORDER BY oi.id`);

// cs-326: avg line price by category (verify claim in walkthrough)
q("avg unit_price by category", `SELECT p.category, ROUND(AVG(oi.unit_price),2) avg_line, COUNT(*) lines FROM order_items oi JOIN products p ON p.id=oi.product_id GROUP BY p.category ORDER BY avg_line DESC`);

// cs-347/350: units + distinct orders over the fan-out
q("units total + distinct orders", `SELECT SUM(oi.quantity) units, COUNT(DISTINCT o.id) orders, COUNT(*) rows_ FROM orders o JOIN order_items oi ON oi.order_id=o.id`);

// cs-342: same-city pairs <= (self pairs)
q("same-city pairs <=", `SELECT COUNT(*) n FROM customers a JOIN customers b ON a.city=b.city AND a.id<=b.id`);

// cs-343: != guard
q("order pairs !=", `SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id=o2.customer_id AND o1.id != o2.id`);
q("order pairs o1.id=o2.id AND < ", `SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id=o2.customer_id AND o1.id = o2.id AND o1.id < o2.id`);

// cs-338: i.id IS NULL vs other columns (sanity)
q("LEFT invoices i.customer_id IS NULL count", `SELECT COUNT(*) n FROM customers c LEFT JOIN invoices i ON i.customer_id=c.id WHERE i.customer_id IS NULL`);

// cs-330: COUNT(i.number) sanity
q("COUNT(*) vs COUNT(i.id) vs COUNT(i.number)", `SELECT COUNT(*) a, COUNT(i.id) b, COUNT(i.number) c FROM customers c LEFT JOIN invoices i ON i.customer_id=c.id`);

// cs-336: second-hop INNER kills preserved rows
q("LEFT then INNER payments count", `SELECT COUNT(*) n FROM customers c LEFT JOIN invoices i ON i.customer_id=c.id JOIN payments p ON p.invoice_id=i.id`);
q("LEFT LEFT chain total", `SELECT COUNT(*) n, COUNT(i.id) mi, COUNT(p.id) mp FROM customers c LEFT JOIN invoices i ON i.customer_id=c.id LEFT JOIN payments p ON p.invoice_id=i.id`);

// cs-349: top-3 line-grain spenders
q("top3 line spenders", `SELECT c.name, ROUND(SUM(oi.quantity*oi.unit_price),2) spend FROM customers c JOIN orders o ON o.customer_id=c.id JOIN order_items oi ON oi.order_id=o.id GROUP BY c.id ORDER BY spend DESC LIMIT 5`);

// cs-335: region buckets with_orders equality
q("region rows vs with_orders", `SELECT c.region, COUNT(*) rows_, COUNT(o.id) with_orders, ROUND(SUM(o.total),2) total FROM customers c LEFT JOIN orders o ON o.customer_id=c.id GROUP BY c.region ORDER BY rows_ DESC`);

// cs-318/323: s.region=p.category sanity (expect 0)
q("join on region=category", `SELECT COUNT(*) n FROM order_items oi JOIN products p ON p.id=oi.product_id JOIN suppliers s ON s.region=p.category`);

// cs-317: customer line counts + order-grain for EU hard case alt
q("EU customers order-grain spend", `SELECT c.name, COUNT(o.id) orders, ROUND(SUM(o.total),2) spend FROM customers c JOIN orders o ON o.customer_id=c.id WHERE c.region='EU' GROUP BY c.id ORDER BY spend DESC`);

db.close();
rmSync(COPY, { force: true });
