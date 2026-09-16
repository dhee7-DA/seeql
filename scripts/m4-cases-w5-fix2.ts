// Second fix-probe batch: per-city invoiced counts (cs-1102), category fills
// (cs-1109), expense duplicate claims (cs-1112 alternative), projection misfills.
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const q = (sql: string) => db.query(sql).all();

console.log("Q1 invoiced by city:", q(`SELECT city, COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM invoices) GROUP BY city ORDER BY n DESC, city`));
console.log("Q2 cs-1109 Fitness fill:", q(`SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category='Fitness')))`));
console.log("Q3 cs-1109 Apparel fill:", q(`SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category='Apparel')))`));
console.log("Q4 expense duplicate vendor+amount rows:", q(`SELECT COUNT(*) n FROM expenses WHERE vendor || amount_cents IN (SELECT vendor || amount_cents FROM expenses GROUP BY vendor, amount_cents HAVING COUNT(*) > 1)`));
console.log("Q5 duplicate amount_pairs:", q(`SELECT vendor, amount_cents, COUNT(*) n FROM expenses GROUP BY vendor, amount_cents HAVING COUNT(*) > 1`));
console.log("Q6 duplicate amounts vendor-free:", q(`SELECT amount_cents, COUNT(*) n FROM expenses GROUP BY amount_cents HAVING COUNT(*) > 1`));
console.log("Q7 invoices id-projection misfill (cs-1102):", q(`SELECT COUNT(*) n FROM customers WHERE city IN ('Berlin','Austin','Tokyo') AND id IN (SELECT id FROM invoices)`));
console.log("Q8 cs-1102 correct fill:", q(`SELECT COUNT(*) n FROM customers WHERE city IN ('Berlin','Austin','Tokyo') AND id IN (SELECT customer_id FROM invoices)`));
console.log("Q9 amount_cents projection misfill:", q(`SELECT COUNT(*) n FROM customers WHERE city IN ('Berlin','Austin','Tokyo') AND id IN (SELECT amount_cents FROM invoices)`));
