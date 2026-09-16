// Wave-5 q3 (EXISTS) + q4 (correlated) block probes — cs-1131..1150 figures.
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const q = (sql: string) => db.query(sql).all();

// --- q3 EXISTS block ---
console.log("T1 EU shipped club:", q(`SELECT COUNT(*) n FROM customers WHERE region='EU' AND EXISTS (SELECT 1 FROM orders WHERE customer_id=customers.id AND status='shipped')`));
console.log("T2 pending+delivered:", q(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id AND o.status='pending') AND EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id=c.id AND o2.status='delivered')`));
console.log("T3 pending AND NOT-shipped:", q(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id AND o.status='pending') AND NOT EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id=c.id AND o2.status='shipped')`));
console.log("T4 no-cancelled club:", q(`SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id AND o.status='cancelled')`));
console.log("T5 any-order>store-avg:", q(`SELECT COUNT(*) n FROM customers WHERE EXISTS (SELECT 1 FROM orders WHERE customer_id=customers.id AND total > (SELECT AVG(total) FROM orders))`));
console.log("T6 open-club:", q(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id=c.id AND i.status='open')`));
console.log("T7 open AND no-void:", q(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id=c.id AND i.status='open') AND NOT EXISTS (SELECT 1 FROM invoices i2 WHERE i2.customer_id=c.id AND i2.status='void')`));
console.log("T8 void club:", q(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id=c.id AND i.status='void')`));
console.log("T9 paid club:", q(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id=c.id AND i.status='paid')`));

// --- q4 correlated block ---
console.log("U1 products>supplier-avg:", q(`SELECT COUNT(*) n FROM products p WHERE price > (SELECT AVG(price) FROM products p2 WHERE p2.supplier_id=p.supplier_id)`));
console.log("U2 pid-fill:", q(`SELECT COUNT(*) n FROM products p WHERE price > (SELECT AVG(price) FROM products p2 WHERE p2.supplier_id=p.id)`));
console.log("U3a cust-avg>300:", q(`SELECT COUNT(*) n FROM customers c WHERE (SELECT AVG(total) FROM orders WHERE customer_id=c.id) > 300`));
console.log("U3b cust-avg>400:", q(`SELECT COUNT(*) n FROM customers c WHERE (SELECT AVG(total) FROM orders WHERE customer_id=c.id) > 400`));
console.log("U4 invoices>own-cust-avg:", q(`SELECT COUNT(*) n FROM invoices i WHERE amount_cents > (SELECT AVG(amount_cents) FROM invoices WHERE customer_id=i.customer_id)`));
console.log("U5 orders>own-cust-avg:", q(`SELECT COUNT(*) n FROM orders o WHERE total > (SELECT AVG(total) FROM orders WHERE customer_id=o.customer_id)`));
console.log("U6 expenses>own-vendor-avg:", q(`SELECT COUNT(*) n FROM expenses e WHERE amount_cents > (SELECT AVG(amount_cents) FROM expenses e2 WHERE e2.vendor=e.vendor)`));
console.log("U7 inv-max>100x-ord-max:", q(`SELECT COUNT(*) n FROM customers c WHERE (SELECT MAX(amount_cents) FROM invoices WHERE customer_id=c.id) > 100*(SELECT MAX(total) FROM orders WHERE customer_id=c.id)`));
console.log("U8a suppliers>2products:", q(`SELECT COUNT(*) n FROM suppliers s WHERE 2 < (SELECT COUNT(*) FROM products WHERE supplier_id=s.id)`));
console.log("U8b id-fill:", q(`SELECT COUNT(*) n FROM suppliers s WHERE 2 < (SELECT COUNT(*) FROM products WHERE supplier_id=id)`));
console.log("U9a shipped>4:", q(`SELECT COUNT(*) n FROM customers c WHERE (SELECT COUNT(*) FROM orders WHERE customer_id=c.id AND status='shipped') > 4`));
console.log("U9b delivered>4:", q(`SELECT COUNT(*) n FROM customers c WHERE (SELECT COUNT(*) FROM orders WHERE customer_id=c.id AND status='delivered') > 4`));
console.log("U10 inv>=own-max:", q(`SELECT COUNT(*) n FROM invoices i WHERE amount_cents >= (SELECT MAX(amount_cents) FROM invoices WHERE customer_id=i.customer_id)`));
console.log("U11 maya id:", q(`SELECT id, name FROM customers WHERE name='Maya Patel'`));
console.log("U12 min invoice:", q(`SELECT MIN(amount_cents) v FROM invoices`));
console.log("U13 shipped MIN total:", q(`SELECT MIN(total) v FROM orders WHERE status='shipped'`));
