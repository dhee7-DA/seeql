// M3 waves 5–6 case receipts — probes for cases-s5.ts (cs-801..850) and
// cases-s6.ts (cs-851..900): CASE WHEN mechanics (s6), CASE pivots (s7),
// Set+CASE capstone (s8), plus a few fresh s1–s5 spread receipts.
// Run: bun scripts/m3-facts-s56.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3s56.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());
const many = (sql: string) =>
  JSON.stringify(db.prepare(sql).all()).replace(/[\[\]{}"]/g, "").slice(0, 500);

console.log("== BASE CENSUSES ==");
console.log("a1) invoice statuses:", one(`SELECT status, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS money FROM invoices GROUP BY status ORDER BY status`));
console.log("a2) ledger accounts + debit/credit:", one(`SELECT account, COUNT(*) AS n, ROUND(SUM(debit_cents)/100.0,2) AS dr, ROUND(SUM(credit_cents)/100.0,2) AS cr FROM ledger_entries GROUP BY account ORDER BY account`));
console.log("a3) expense vendors:", one(`SELECT vendor, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS money FROM expenses GROUP BY vendor ORDER BY money DESC`));
console.log("a4) customer signup years:", one(`SELECT substr(created_at,1,4) AS y, COUNT(*) AS n FROM customers GROUP BY y ORDER BY y`));
console.log("a5) cities:", one(`SELECT COUNT(DISTINCT city) AS n FROM customers`));
console.log("a6) city list:", many(`SELECT DISTINCT city FROM customers ORDER BY city`));
console.log("a7) product price bands 50/120:", one(`SELECT CASE WHEN price < 50 THEN 'lo' WHEN price < 120 THEN 'mid' ELSE 'hi' END AS band, COUNT(*) AS n FROM products GROUP BY band ORDER BY band`));
console.log("a8) order total bands 80/200:", one(`SELECT CASE WHEN total >= 200 THEN 'big' WHEN total >= 80 THEN 'mid' ELSE 'small' END AS band, COUNT(*) AS n FROM orders GROUP BY band ORDER BY n DESC`));
console.log("a9) order total bands 100/300:", one(`SELECT CASE WHEN total >= 300 THEN 'xl' WHEN total >= 100 THEN 'lg' ELSE 'base' END AS band, COUNT(*) AS n FROM orders GROUP BY band ORDER BY band`));

console.log("\n== S6: CASE WHEN MECHANICS ==");
console.log("b1) simple CASE status buckets:", one(`SELECT CASE status WHEN 'pending' THEN 'open' WHEN 'cancelled' THEN 'dead' ELSE 'closed' END AS bucket, COUNT(*) AS n FROM orders GROUP BY bucket ORDER BY n DESC`));
console.log("b2) first-match trap: bands written ascending:", one(`SELECT CASE WHEN total >= 80 THEN 'mid-or-big' WHEN total >= 200 THEN 'big' ELSE 'small' END AS band, COUNT(*) AS n FROM orders GROUP BY band ORDER BY band`));
console.log("b3) CASE in WHERE counts delivered-equivalent:", one(`SELECT COUNT(*) AS n FROM orders WHERE CASE WHEN status = 'cancelled' THEN 0 ELSE 1 END = 1`));
console.log("b4) ELSE omitted gives NULL:", one(`SELECT CASE WHEN total >= 300 THEN 'xl' END AS band, COUNT(*) AS n FROM orders GROUP BY band ORDER BY band`));
console.log("b5) CASE on shipped_at NULL-aware:", one(`SELECT CASE WHEN shipped_at IS NULL THEN 'awaiting' ELSE 'dispatched' END AS slot, COUNT(*) AS n FROM orders GROUP BY slot ORDER BY n`));
console.log("b6) customer active CASE:", one(`SELECT CASE WHEN active = 1 THEN 'live' ELSE 'paused' END AS state, COUNT(*) AS n FROM customers GROUP BY state`));
console.log("b7) invoice aging CASE 30/60:", one(`SELECT CASE WHEN amount_cents >= 300000 THEN 'whale' WHEN amount_cents >= 100000 THEN ' dolphin' ELSE 'minnow' END AS size, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS money FROM invoices GROUP BY size ORDER BY n`));
console.log("b8) ORDER BY CASE custom sort:", many(`SELECT status FROM orders GROUP BY status ORDER BY CASE status WHEN 'pending' THEN 1 WHEN 'shipped' THEN 2 WHEN 'delivered' THEN 3 ELSE 4 END`));
console.log("b9) ORDER BY CASE reverse:", many(`SELECT status FROM orders GROUP BY status ORDER BY CASE status WHEN 'cancelled' THEN 1 WHEN 'delivered' THEN 2 WHEN 'shipped' THEN 3 ELSE 4 END`));
console.log("b10) payment method flags:", one(`SELECT SUM(CASE WHEN method = 'card' THEN 1 ELSE 0 END) AS card_n, SUM(CASE WHEN method = 'wire' THEN 1 ELSE 0 END) AS wire_n FROM payments`));
console.log("b11) nested band overlap (first match wins):", one(`SELECT SUM(CASE WHEN total >= 80 THEN 1 ELSE 0 END) AS ge80, SUM(CASE WHEN total >= 200 THEN 1 ELSE 0 END) AS ge200, SUM(CASE WHEN total >= 80 AND total < 200 THEN 1 ELSE 0 END) AS mid_only FROM orders`));
console.log("b12) CASE distinct regions label:", one(`SELECT CASE region WHEN 'EU' THEN 'domestic-eu' ELSE 'export' END AS lane, COUNT(*) AS n FROM customers GROUP BY lane ORDER BY n`));

console.log("\n== S7: PIVOTS ==");
console.log("c1) region x status pivot (counts):", one(`SELECT c.region, SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS pend, SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS shp, SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS del, SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS can, COUNT(*) AS all_n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY c.region`));
console.log("c2) region x status pivot (money):", one(`SELECT c.region, ROUND(SUM(CASE WHEN o.status = 'pending' THEN o.total ELSE 0 END),2) AS pend_m, ROUND(SUM(CASE WHEN o.status = 'delivered' THEN o.total ELSE 0 END),2) AS del_m FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY c.region`));
console.log("c3) pivot w/o ELSE zero default vs NULL:", one(`SELECT SUM(CASE WHEN status = 'pending' THEN total END) AS null_else, SUM(CASE WHEN status = 'pending' THEN total ELSE 0 END) AS zero_else FROM orders`));
console.log("c4) invoice status x method money:", one(`SELECT i.status, ROUND(SUM(CASE WHEN p.method = 'card' THEN p.amount_cents ELSE 0 END)/100.0,2) AS card_m, ROUND(SUM(CASE WHEN p.method = 'wire' THEN p.amount_cents ELSE 0 END)/100.0,2) AS wire_m FROM invoices i JOIN payments p ON p.invoice_id = i.id GROUP BY i.status ORDER BY i.status`));
console.log("c5) expense month x top categories:", one(`SELECT substr(spent_on,1,7) AS m, SUM(CASE WHEN category = 'Rent' THEN amount_cents ELSE 0 END)/100.0 AS rent, SUM(CASE WHEN category = 'Travel' THEN amount_cents ELSE 0 END)/100.0 AS travel FROM expenses GROUP BY m ORDER BY m`));
console.log("c6) COUNT(CASE) vs SUM(CASE) parity:", one(`SELECT COUNT(CASE WHEN status = 'delivered' THEN 1 END) AS cnt_form, SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS sum_form, SUM(status = 'delivered') AS sqlite_bool FROM orders`));
console.log("c7) signup-year cohort x orders:", one(`SELECT substr(cu.created_at,1,4) AS cohort, COUNT(o.id) AS orders_n FROM customers cu LEFT JOIN orders o ON o.customer_id = cu.id GROUP BY cohort ORDER BY cohort`));
console.log("c8) honest-zero: region pivot with cancelled:", one(`SELECT c.region, SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS can FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region HAVING can = 0 ORDER BY c.region`));
console.log("c9) ledger debit/credit pivot:", one(`SELECT SUM(CASE WHEN debit_cents > 0 THEN debit_cents ELSE 0 END)/100.0 AS dr_total, SUM(CASE WHEN credit_cents > 0 THEN credit_cents ELSE 0 END)/100.0 AS cr_total, COUNT(*) AS n FROM ledger_entries`));
console.log("c10) pivot by shipped quarter:", one(`SELECT CASE WHEN shipped_at < '2024-04' THEN 'q1' WHEN shipped_at < '2024-07' THEN 'q2' ELSE 'q3' END AS q, COUNT(*) AS n FROM orders WHERE shipped_at IS NOT NULL GROUP BY q ORDER BY q`));
console.log("c11) pivot N-way method x invoice-status counts:", one(`SELECT i.status, COUNT(CASE WHEN p.method = 'card' THEN 1 END) AS card_n, COUNT(CASE WHEN p.method = 'wire' THEN 1 END) AS wire_n FROM invoices i JOIN payments p ON p.invoice_id = i.id GROUP BY i.status ORDER BY i.status`));
console.log("c12) region x big-order flag:", one(`SELECT c.region, SUM(CASE WHEN o.total >= 200 THEN 1 ELSE 0 END) AS big_n, COUNT(*) AS all_n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY c.region`));

console.log("\n== S8: SET + CASE CAPSTONE ==");
console.log("d1) labeled pivot stack orders|invoices:", one(`SELECT * FROM (SELECT 'orders' AS book, c.region, ROUND(SUM(CASE WHEN o.status = 'delivered' THEN o.total ELSE 0 END),2) AS delivered_m FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region UNION ALL SELECT 'invoices', c.region, ROUND(SUM(CASE WHEN i.status = 'paid' THEN i.amount_cents ELSE 0 END)/100.0,2) FROM invoices i JOIN customers c ON c.id = i.customer_id GROUP BY c.region) ORDER BY region, book`));
console.log("d2) CASE label in UNION arms (open/closed census stack):", one(`SELECT book, status_word, n FROM (SELECT 'orders' AS book, CASE WHEN status IN ('pending','cancelled') THEN 'in-flight' ELSE 'settled' END AS status_word, COUNT(*) AS n FROM orders GROUP BY 2 UNION ALL SELECT 'invoices', CASE WHEN status = 'paid' THEN 'settled' ELSE 'in-flight' END, COUNT(*) FROM invoices GROUP BY 2) ORDER BY status_word, book`));
console.log("d3) pivot regions EXCEPT zero-cancel regions:", one(`SELECT * FROM (SELECT c.region FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region EXCEPT SELECT c.region FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled' GROUP BY c.region)`));
console.log("d4) INTERSECT of big-order regions and paid-invoice regions:", one(`SELECT * FROM (SELECT DISTINCT c.region FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.total >= 200 INTERSECT SELECT DISTINCT c.region FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.status = 'paid')`));
console.log("d5) CASE-sorted UNION census (pending first):", one(`SELECT v, n FROM (SELECT status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region) ORDER BY CASE WHEN v IN ('pending','shipped','delivered','cancelled') THEN 0 ELSE 1 END, n DESC LIMIT 4`));
console.log("d6) stacked band censuses orders vs invoices:", one(`SELECT book, band, n FROM (SELECT 'orders' AS book, CASE WHEN total >= 200 THEN 'big' WHEN total >= 80 THEN 'mid' ELSE 'small' END AS band, COUNT(*) AS n FROM orders GROUP BY 2 UNION ALL SELECT 'invoices', CASE WHEN amount_cents >= 300000 THEN 'big' WHEN amount_cents >= 100000 THEN 'mid' ELSE 'small' END, COUNT(*) FROM invoices GROUP BY 2) ORDER BY band, book`));
console.log("d7) EXCEPT with CASE-normalized keys:", one(`SELECT COUNT(*) AS n FROM (SELECT CASE WHEN active = 1 THEN city END AS k FROM customers EXCEPT SELECT CASE WHEN status = 'void' THEN NULL END FROM invoices)`));
console.log("d8) capstone: per-region fill-rate pivot from UNION'd books:", one(`SELECT region, SUM(CASE WHEN book = 'orders' THEN n ELSE 0 END) AS ord, SUM(CASE WHEN book = 'invoices' THEN n ELSE 0 END) AS inv FROM (SELECT c.region AS region, 'orders' AS book, COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region UNION ALL SELECT c.region, 'invoices', COUNT(*) FROM invoices i JOIN customers c ON c.id = i.customer_id GROUP BY c.region) GROUP BY region ORDER BY region`));
console.log("d9) zero-honesty via pivot + EXCEPT (pending-zero regions):", one(`SELECT * FROM (SELECT c.region, SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS pend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region) WHERE pend = 0`));
console.log("d10) method-word vs account-word set inside CASE:", one(`SELECT COUNT(*) AS n FROM (SELECT CASE WHEN method IS NOT NULL THEN method END AS w FROM payments EXCEPT SELECT CASE WHEN account IS NOT NULL THEN account END FROM ledger_entries)`));

console.log("\n== SPREAD (s1–s5) FRESH RECEIPTS ==");
console.log("e1) supplier-rating bands UNION order bands:", one(`SELECT v, n FROM (SELECT CASE WHEN rating >= 4.5 THEN 'top' ELSE 'ok' END AS v, COUNT(*) AS n FROM suppliers GROUP BY 1 UNION ALL SELECT CASE WHEN total >= 200 THEN 'top' ELSE 'ok' END, COUNT(*) FROM orders GROUP BY 1) ORDER BY v`));
console.log("e2) method/status vocab INTERSECT:", one(`SELECT COUNT(*) AS n FROM (SELECT method FROM payments INTERSECT SELECT status FROM orders)`));
console.log("e3) expense cats EXCEPT invoice statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT category FROM expenses EXCEPT SELECT status FROM invoices)`));
console.log("e4) EU city list EXCEPT APAC:", one(`SELECT GROUP_CONCAT(city) AS eu_only, COUNT(*) AS n FROM (SELECT city FROM customers WHERE region = 'EU' EXCEPT SELECT city FROM customers WHERE region = 'APAC')`));
console.log("e5) vendors∪suppliers count:", one(`SELECT COUNT(*) AS n FROM (SELECT vendor FROM expenses UNION SELECT name FROM suppliers)`));
console.log("e6) trailing-dedup pile:", one(`SELECT COUNT(*) AS n FROM (SELECT vendor FROM expenses UNION ALL SELECT name FROM suppliers UNION ALL SELECT vendor FROM expenses UNION SELECT vendor FROM expenses)`));

db.close();
rmSync(COPY);
console.log("\nDONE");
