// Wave-5 q2 (scalar subquery) block probes — cs-1116..1130 figures.
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const q = (sql: string) => db.query(sql).all();

// cs-1116 orders above the delivered average
console.log("A1 orders>delivered-avg:", q(`SELECT COUNT(*) n FROM orders WHERE total > (SELECT AVG(total) FROM orders WHERE status='delivered')`));
console.log("A2 delivered avg:", q(`SELECT AVG(total) v FROM orders WHERE status='delivered'`));
// cs-1117 cheapest above-avg product
console.log("B1 min above avg:", q(`SELECT MIN(price) m FROM products WHERE price > (SELECT AVG(price) FROM products)`));
// cs-1118 invoices above storewide bar
console.log("C1 invoices>avg:", q(`SELECT COUNT(*) n FROM invoices WHERE amount_cents > (SELECT AVG(amount_cents) FROM invoices)`));
console.log("C2 invoices<avg:", q(`SELECT COUNT(*) n FROM invoices WHERE amount_cents < (SELECT AVG(amount_cents) FROM invoices)`));
// cs-1119 expenses over twice the minimum
console.log("D1 exp>2xmin:", q(`SELECT COUNT(*) n FROM expenses WHERE amount_cents > 2*(SELECT MIN(amount_cents) FROM expenses)`));
console.log("D2 exp=min:", q(`SELECT COUNT(*) n FROM expenses WHERE amount_cents = (SELECT MIN(amount_cents) FROM expenses)`));
// cs-1120 suppliers above the bench's average rating
console.log("E1 sup>avg-rating:", q(`SELECT COUNT(*) n FROM suppliers WHERE rating > (SELECT AVG(rating) FROM suppliers)`));
console.log("E2 sup avg rating:", q(`SELECT AVG(rating) v FROM suppliers`));
console.log("E3 sup<avg:", q(`SELECT COUNT(*) n FROM suppliers WHERE rating < (SELECT AVG(rating) FROM suppliers)`));
// cs-1121 pending over shipped pace (Y29 says 5 — verify)
console.log("F1 pending>shipped-avg:", q(`SELECT COUNT(*) n FROM orders WHERE status='pending' AND total > (SELECT AVG(total) FROM orders WHERE status='shipped')`));
// cs-1122 orders under the shipped pace
console.log("G1 orders<shipped-avg:", q(`SELECT COUNT(*) n FROM orders WHERE total < (SELECT AVG(total) FROM orders WHERE status='shipped')`));
// cs-1123 no invoice at the average (zero-honest)
console.log("H1 invoices=avg:", q(`SELECT COUNT(*) n FROM invoices WHERE amount_cents = (SELECT AVG(amount_cents) FROM invoices)`));
// cs-1124 near-average price band
console.log("I1 band .8-1.1:", q(`SELECT COUNT(*) n FROM products WHERE price BETWEEN (SELECT AVG(price)*0.8 FROM products) AND (SELECT AVG(price)*1.1 FROM products)`));
console.log("I2 band bounds:", q(`SELECT (SELECT AVG(price)*0.8) lo, (SELECT AVG(price)*1.1) hi`));
// cs-1125 payments above the payment average
console.log("J1 pay>avg:", q(`SELECT COUNT(*) n FROM payments WHERE amount_cents > (SELECT AVG(amount_cents) FROM payments)`));
console.log("J2 pay avg/n:", q(`SELECT AVG(amount_cents) v, COUNT(*) n FROM payments`));
// cs-1126 open invoices over the paid book's average
console.log("K1 open>paid-avg:", q(`SELECT COUNT(*) n FROM invoices WHERE status='open' AND amount_cents > (SELECT AVG(amount_cents) FROM invoices WHERE status='paid')`));
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
console.log("P1 vendors>ledger-avg:", q(`SELECT COUNT(*) n FROM expenses GROUP BY vendor HAVING AVG(amount_cents) > (SELECT AVG(amount_cents) FROM expenses)`));
console.log("P2 vendor avgs:", q(`SELECT vendor, AVG(amount_cents) a FROM expenses GROUP BY vendor`));
console.log("P3 ledger avg:", q(`SELECT AVG(amount_cents) v FROM expenses`));
