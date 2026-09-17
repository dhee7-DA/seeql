/// <reference types="bun-types" />
// probe-j8a3 — round 3: last figure gaps before authoring (Ingrid per-buyer
// claim counts, cs-281 'shipped' arm + s.id=oi.id under cancelled, cs-279
// 'failed' arm, min order_items id for collision prose). Read-only COPY only.
import { Database } from "bun:sqlite";

const db = new Database("scripts/.tmp-j8a.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all();
    console.log(`\n== ${label} ==`);
    console.log(JSON.stringify(rows));
  } catch (e) {
    console.log(`\n== ${label} == ERROR: ${e instanceof Error ? e.message : String(e)}`);
  }
}

q("Ingrid per-buyer claims (cs-278 fill)",
  `SELECT c.name, c.region, COUNT(r.id) AS claims_signed
   FROM employees e
   JOIN refunds r ON r.processed_by = e.id
   JOIN orders o ON r.order_id = o.id
   JOIN customers c ON c.id = o.customer_id
   WHERE e.name = 'Ingrid Larsen'
   GROUP BY c.id
   ORDER BY c.name`);
q("cs-281 'shipped' arm count",
  `SELECT COUNT(*) n FROM orders o
   JOIN order_items oi ON oi.order_id = o.id
   JOIN products p ON p.id = oi.product_id
   JOIN suppliers s ON s.id = p.supplier_id
   WHERE o.status='shipped'`);
q("cs-281 s.id = oi.id under cancelled",
  `SELECT COUNT(*) n FROM orders o
   JOIN order_items oi ON oi.order_id = o.id
   JOIN products p ON p.id = oi.product_id
   JOIN suppliers s ON s.id = oi.id
   WHERE o.status='cancelled'`);
q("cs-279 'failed' arm channels",
  `SELECT a.channel, ROUND(SUM(p.amount),2) cash
   FROM acquisitions a
   JOIN customers c ON c.id = a.customer_id
   JOIN orders o ON o.customer_id = c.id
   JOIN payments p ON p.order_id = o.id
   WHERE p.status = 'failed'
   GROUP BY a.channel`);
q("min/max order_items id", `SELECT MIN(id) mn, MAX(id) mx FROM order_items`);
q("min/max shipment id / payment id / refund id", `SELECT (SELECT MIN(id) FROM shipments) s_mn, (SELECT MAX(id) FROM shipments) s_mx, (SELECT MIN(id) FROM payments) p_mn, (SELECT MAX(id) FROM payments) p_mx, (SELECT MIN(id) FROM refunds) r_mn, (SELECT MAX(id) FROM refunds) r_mx`);
q("Emma per-supplier ticket counts (cs-276 alt col)",
  `SELECT s.name, COUNT(DISTINCT o.id) tickets FROM customers c
   JOIN orders o ON o.customer_id = c.id
   JOIN order_items oi ON oi.order_id = o.id
   JOIN products p ON p.id = oi.product_id
   JOIN suppliers s ON s.id = p.supplier_id
   WHERE c.name = 'Emma Wilson' GROUP BY s.id ORDER BY s.name`);
q("cs-277 EU tickets per supplier (final fill check)",
  `SELECT s.name, COUNT(DISTINCT o.id) AS eu_tickets
   FROM suppliers s
   JOIN products p ON p.supplier_id = s.id
   JOIN order_items oi ON oi.product_id = p.id
   JOIN orders o ON o.id = oi.order_id
   JOIN customers c ON c.id = o.customer_id
   WHERE c.region = 'EU'
   GROUP BY s.id
   ORDER BY s.name`);
q("Ingrid claim buyers detail",
  `SELECT r.id, o.id ticket, c.name buyer, r.amount, r.reason
   FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
   WHERE r.processed_by = 7 ORDER BY r.id`);

db.close();
console.log("\nprobe-j8a3 done");
