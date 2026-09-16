// Wave-5 q2 probe completion — J..P blocks + band detail.
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const q = (sql: string) => db.query(sql).all();

console.log("I2 band bounds:", q(`SELECT (SELECT AVG(price)*0.8 FROM products) lo, (SELECT AVG(price)*1.1 FROM products) hi`));
console.log("I3 band members:", q(`SELECT name, price FROM products WHERE price BETWEEN (SELECT AVG(price)*0.8 FROM products) AND (SELECT AVG(price)*1.1 FROM products)`));
// cs-1125 payments above the payment average
console.log("J1 pay>avg:", q(`SELECT COUNT(*) n FROM payments WHERE amount_cents > (SELECT AVG(amount_cents) FROM payments)`));
console.log("J2 pay avg/n:", q(`SELECT AVG(amount_cents) v, COUNT(*) n FROM payments`));
// cs-1126 open invoices over the paid book's average
console.log("K1 open>paid-avg:", q(`SELECT COUNT(*) n FROM invoices WHERE status='open' AND amount_cents > (SELECT AVG(amount_cents) FROM invoices WHERE status='paid')`));
console.log("K2 open>overall-avg:", q(`SELECT COUNT(*) n FROM invoices WHERE status='open' AND amount_cents > (SELECT AVG(amount_cents) FROM invoices)`));
// cs-1127 runner-up bar
console.log("L1 above-runner-up:", q(`SELECT COUNT(*) n FROM orders WHERE total > (SELECT MAX(total) FROM orders WHERE total < (SELECT MAX(total) FROM orders))`));
console.log("L2 runner-up value:", q(`SELECT MAX(total) v FROM orders WHERE total < (SELECT MAX(total) FROM orders)`));
// cs-1128 expenses over half the biggest claim
console.log("M1 exp>max/2:", q(`SELECT COUNT(*) n FROM expenses WHERE amount_cents > (SELECT MAX(amount_cents)/2 FROM expenses)`));
// cs-1129 products under half the ceiling
console.log("N1 prod<max/2:", q(`SELECT COUNT(*) n FROM products WHERE price < (SELECT MAX(price)/2 FROM products)`));
console.log("N2 max price:", q(`SELECT MAX(price) v FROM products`));
// cs-1130 the void yardstick
console.log("O1 inv>void:", q(`SELECT COUNT(*) n FROM invoices WHERE amount_cents > (SELECT amount_cents FROM invoices WHERE status='void')`));
console.log("O2 inv<void:", q(`SELECT COUNT(*) n FROM invoices WHERE amount_cents < (SELECT amount_cents FROM invoices WHERE status='void')`));
console.log("O3 void amount:", q(`SELECT amount_cents v FROM invoices WHERE status='void'`));
// cs-1131-reserve: vendors above the ledger's own average line
console.log("P1 vendors>ledger-avg:", q(`SELECT COUNT(*) n FROM (SELECT vendor FROM expenses GROUP BY vendor HAVING AVG(amount_cents) > (SELECT AVG(amount_cents) FROM expenses))`));
console.log("P2 vendor avgs:", q(`SELECT vendor, AVG(amount_cents) a FROM expenses GROUP BY vendor`));
console.log("P3 ledger avg:", q(`SELECT AVG(amount_cents) v FROM expenses`));
