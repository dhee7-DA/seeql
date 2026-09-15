// Wave-5 q2 probe batch 3 — slice figures for walkthroughs + slot design.
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const q = (sql: string) => db.query(sql).all();

console.log("S1 products>avg count:", q(`SELECT COUNT(*) n FROM products WHERE price > (SELECT AVG(price) FROM products)`));
console.log("S2 paid>store-avg:", q(`SELECT COUNT(*) n FROM invoices WHERE status='paid' AND amount_cents > (SELECT AVG(amount_cents) FROM invoices)`));
console.log("S3 cancelled<shipped-avg:", q(`SELECT COUNT(*) n FROM orders WHERE status='cancelled' AND total < (SELECT AVG(total) FROM orders WHERE status='shipped')`));
console.log("S4 delivered<shipped-avg:", q(`SELECT COUNT(*) n FROM orders WHERE status='delivered' AND total < (SELECT AVG(total) FROM orders WHERE status='shipped')`));
console.log("S5 pending<shipped-avg:", q(`SELECT COUNT(*) n FROM orders WHERE status='pending' AND total < (SELECT AVG(total) FROM orders WHERE status='shipped')`));
console.log("S6 status counts:", q(`SELECT status, COUNT(*) n FROM orders GROUP BY status`));
console.log("S7 payment methods:", q(`SELECT method, COUNT(*) n FROM payments GROUP BY method`));
console.log("S8 pay>avg by method:", q(`SELECT method, COUNT(*) n FROM payments WHERE amount_cents > (SELECT AVG(amount_cents) FROM payments) GROUP BY method`));
console.log("S9 max-below-invoice-avg:", q(`SELECT MAX(amount_cents) v FROM invoices WHERE amount_cents < (SELECT AVG(amount_cents) FROM invoices)`));
console.log("S10 shipped SUM bar:", q(`SELECT SUM(total) v FROM orders WHERE status='shipped'`));
console.log("S11 paid MAX:", q(`SELECT MAX(amount_cents) v FROM invoices WHERE status='paid'`));
console.log("S12 expenses>AVG/2:", q(`SELECT COUNT(*) n FROM expenses WHERE amount_cents > (SELECT MAX(amount_cents)/2 FROM expenses WHERE 1) OR 0`, ));
console.log("S12b avg/2 bar count:", q(`SELECT COUNT(*) n FROM expenses WHERE amount_cents > (SELECT AVG(amount_cents)/2 FROM expenses)`));
console.log("S13 prod<AVG/2:", q(`SELECT COUNT(*) n FROM products WHERE price < (SELECT AVG(price)/2 FROM products)`));
console.log("S14 band 0.9-1.1:", q(`SELECT COUNT(*) n FROM products WHERE price BETWEEN (SELECT AVG(price)*0.9 FROM products) AND (SELECT AVG(price)*1.1 FROM products)`));
console.log("S15 band 0.8-1.2:", q(`SELECT COUNT(*) n FROM products WHERE price BETWEEN (SELECT AVG(price)*0.8 FROM products) AND (SELECT AVG(price)*1.2 FROM products)`));
