import { Database } from "bun:sqlite";
const db = new Database("scripts/.probe-ha2.db", { readonly: true });
const q = (sql: string) => db.query(sql).all();

console.log("== P5a products full (stock/price ties) ==");
console.log(q("SELECT id, name, category, price, stock, supplier_id FROM products ORDER BY stock DESC, price DESC"));
console.log("== P5b stock ties ==");
console.log(q("SELECT stock, COUNT(*) n, GROUP_CONCAT(id) ids FROM products GROUP BY stock HAVING n > 1"));
console.log("== P5c price ties ==");
console.log(q("SELECT price, COUNT(*) n, GROUP_CONCAT(id) ids FROM products GROUP BY price HAVING n > 1"));

console.log("== P6a order_items extended value top10 ==");
console.log(q("SELECT id, order_id, product_id, quantity, unit_price, ROUND(quantity*unit_price,2) v FROM order_items ORDER BY quantity*unit_price DESC LIMIT 12"));
console.log("== P6b extended value ties ==");
console.log(q("SELECT ROUND(quantity*unit_price,2) v, COUNT(*) n, GROUP_CONCAT(id) ids FROM order_items GROUP BY v HAVING n > 1 ORDER BY v DESC"));

console.log("== P8a payments methods ==");
console.log(q("SELECT method, COUNT(*) n, MIN(amount_cents) lo, MAX(amount_cents) hi FROM payments GROUP BY method"));
console.log("== P8b payments amount range ==");
console.log(q("SELECT MIN(amount_cents) lo, MAX(amount_cents) hi, COUNT(*) n FROM payments"));

console.log("== P11a invoices statuses ==");
console.log(q("SELECT status, COUNT(*) n, MIN(amount_cents) lo, MAX(amount_cents) hi FROM invoices GROUP BY status"));
console.log("== P11b invoices full ==");
console.log(q("SELECT id, customer_id, number, issued_on, due_on, amount_cents, status FROM invoices ORDER BY amount_cents DESC"));
