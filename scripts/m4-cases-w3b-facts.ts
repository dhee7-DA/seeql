/// <reference types="bun:sqlite" />
/** Wave-3 supplement probes (walkthrough detail). Run: bun scripts/m4-cases-w3b-facts.ts 2>&1 | tee scripts/m4-cases-w3b-out.txt */
import { Database } from "bun:sqlite";

const db = new Database("db/custom.db", { readonly: true });

const probes: Array<[string, string]> = [
  ["S01 every-order-above-bar names", `SELECT c.name, (SELECT MIN(o.total) FROM orders o WHERE o.customer_id = c.id) floor_total
FROM customers c WHERE (SELECT MIN(o.total) FROM orders o WHERE o.customer_id = c.id) > (SELECT AVG(total) FROM orders)`],
  ["S02 Bruno order spread", `SELECT MIN(total) mn, MAX(total) mx, COUNT(*) n FROM orders WHERE customer_id = (SELECT id FROM customers WHERE name = 'Bruno Silva')`],
  ["S03 final-30-day names", `SELECT c.name FROM customers c WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id
    AND o.created_at >= (SELECT date(MAX(created_at), '-29 day') FROM orders)
) ORDER BY c.name`],
  ["S04 electronics two-hop customers", `SELECT COUNT(*) n FROM customers WHERE id IN (
  SELECT customer_id FROM orders WHERE id IN (
    SELECT order_id FROM order_items WHERE product_id IN (
      SELECT id FROM products WHERE category = 'Electronics'))) `],
  ["S05 never-paid invoice detail", `SELECT number, status FROM invoices WHERE id NOT IN (SELECT invoice_id FROM payments) ORDER BY number`],
  ["S06 wearables above catalog avg", `SELECT COUNT(*) n FROM products WHERE category = 'Wearables' AND price > (SELECT AVG(price) FROM products)`],
  ["S07 max-order-customer names top4", `SELECT c.name, (SELECT MAX(o.total) FROM orders o WHERE o.customer_id = c.id) biggest
FROM customers c WHERE (SELECT MAX(o.total) FROM orders o WHERE o.customer_id = c.id) > 800 ORDER BY biggest DESC`],
  ["S08 status invoice counts", `SELECT status, COUNT(*) n FROM invoices GROUP BY status`],
  ["S09 top gap order owners", `SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.id IN (74, 43, 39) ORDER BY o.total DESC`],
  ["S10 pending-only club (pending but never cancelled)", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending')
  AND NOT EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = 'cancelled')`],
  ["S11 apparel two-hop customers", `SELECT COUNT(*) n FROM customers WHERE id IN (
  SELECT customer_id FROM orders WHERE id IN (
    SELECT order_id FROM order_items WHERE product_id IN (
      SELECT id FROM products WHERE category = 'Apparel')))`],
  ["S12 video customer names", `SELECT name FROM customers WHERE id IN (
  SELECT customer_id FROM orders WHERE id IN (
    SELECT order_id FROM order_items WHERE product_id IN (
      SELECT id FROM products WHERE category = 'Video'))) ORDER BY name`],
];

for (const [label, sql] of probes) {
  try {
    const rows = db.query(sql).all();
    console.log(`${label}: ${JSON.stringify(rows)}`);
  } catch (e) {
    console.log(`${label}: ERROR ${e instanceof Error ? e.message : String(e)}`);
  }
}
console.log(`--- ${probes.length} probes done`);
db.close();
