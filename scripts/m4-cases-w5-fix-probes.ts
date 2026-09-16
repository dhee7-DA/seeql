// Wave-5 fix probes: receipts for redesigning the 7 audit-failing cases.
// P1 cs-1101 (invoiced APAC/LATAM) · P2 cs-1102 (shipped residents/city)
// P3 cs-1103 (two-stage vendor list, >300 gate) · P4 cs-1109 (middle-hop projection)
// P5 cs-1112 (twin-ticket sweep) — cs-1111/cs-1115 need no new figures.
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const q = (sql: string) => db.query(sql).all();

console.log("P1a APAC+LATAM invoiced:", q(`SELECT COUNT(*) n FROM customers WHERE region IN ('APAC','LATAM') AND id IN (SELECT customer_id FROM invoices)`));
console.log("P1b invoiced by region:", q(`SELECT region, COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM invoices) GROUP BY region`));

console.log("P2 shipped residents by city:", q(`SELECT city, COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status='shipped') GROUP BY city ORDER BY n DESC, city`));

console.log("P3a vendor line stats:", q(`SELECT vendor, MAX(amount_cents) mx, COUNT(*) lines, SUM(amount_cents) tot FROM expenses GROUP BY vendor`));
console.log("P3b correct (>300, Travel+Tools):", q(`SELECT DISTINCT vendor FROM expenses WHERE amount_cents > 300 AND vendor IN (SELECT vendor FROM expenses WHERE category IN ('Travel','Tools')) ORDER BY vendor`));
console.log("P3c Fitness slot:", q(`SELECT DISTINCT vendor FROM expenses WHERE amount_cents > 300 AND vendor IN (SELECT vendor FROM expenses WHERE category IN ('Travel','Fitness'))`));
console.log("P3d Ads-in-Tools slot:", q(`SELECT DISTINCT vendor FROM expenses WHERE amount_cents > 300 AND vendor IN (SELECT vendor FROM expenses WHERE category IN ('Travel','Ads'))`));
console.log("P3e Ads-in-Travel slot:", q(`SELECT DISTINCT vendor FROM expenses WHERE amount_cents > 300 AND vendor IN (SELECT vendor FROM expenses WHERE category IN ('Ads','Tools'))`));
console.log("P3f category tautology:", q(`SELECT COUNT(*) n FROM (SELECT DISTINCT vendor FROM expenses WHERE amount_cents > 300 AND vendor IN (SELECT vendor FROM expenses WHERE category IN (category,'Tools')))`));
console.log("P3g category projection:", q(`SELECT DISTINCT category FROM expenses WHERE amount_cents > 300 AND vendor IN (SELECT vendor FROM expenses WHERE category IN ('Travel','Tools'))`));

console.log("P4a order_items ddl:", q(`SELECT sql FROM sqlite_master WHERE name='order_items'`));
console.log("P4b product_id misfill:", q(`SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE id IN (SELECT product_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category='Wearables')))`));
console.log("P4c correct wearables:", q(`SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category='Wearables')))`));

console.log("P5a twin-ticket correct:", q(`SELECT COUNT(*) n FROM orders WHERE total IN (SELECT total FROM orders GROUP BY total HAVING COUNT(*) > 1)`));
console.log("P5b '=' misfill:", q(`SELECT COUNT(*) n FROM orders WHERE total IN (SELECT total FROM orders GROUP BY total HAVING COUNT(*) = 1)`));
console.log("P5c duplicated totals:", q(`SELECT total, COUNT(*) n FROM orders GROUP BY total HAVING COUNT(*) > 1 ORDER BY n DESC`));
console.log("P5d '<' misfill:", q(`SELECT COUNT(*) n FROM orders WHERE total IN (SELECT total FROM orders GROUP BY total HAVING COUNT(*) < 1)`));
