/// <reference types="bun-types" />
/** M5 wave-3 probes — t1/t2/t3/t4 deepening figures. */
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
let n = 255;
const q = (label: string, sql: string) => {
  n++;
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const cells = rows.map((r) => Object.values(r).map((v) => (v === null ? "NULL" : typeof v === "number" ? (Number.isInteger(v) ? v : Number(v.toFixed(6))) : v)).join(" | "));
    console.log(`T${String(n).padStart(2, "0")} ${label}`);
    console.log(`   ${cells.slice(0, 20).join("  ;;  ") || "(0 rows)"}`);
  } catch (e) {
    console.log(`T${String(n).padStart(2, "0")} ${label} ERROR: ${e instanceof Error ? e.message : e}`);
  }
};
// t1 deepening
q("at-position census", `SELECT INSTR(email, '@') pos, COUNT(*) FROM customers GROUP BY pos ORDER BY pos`);
q("names over 12 chars", `SELECT COUNT(*) FROM customers WHERE LENGTH(name) > 12`);
q("name len by region avg", `SELECT region, ROUND(AVG(LENGTH(name)), 2) FROM customers GROUP BY region ORDER BY 2 DESC`);
q("product len by category max", `SELECT category, MAX(LENGTH(name)) FROM products GROUP BY category ORDER BY 2 DESC`);
q("vendor last char census", `SELECT SUBSTR(vendor, -1) ch, COUNT(*) FROM expenses GROUP BY ch ORDER BY 2 DESC`);
q("city 2-prefix census", `SELECT UPPER(SUBSTR(city, 1, 2)) p, COUNT(*) FROM customers GROUP BY p HAVING COUNT(*) > 1`);
q("cast stock int census", `SELECT DISTINCT CAST(stock AS INTEGER) FROM products ORDER BY 1 LIMIT 8`);
q("rating text fold", `SELECT COUNT(*) FROM suppliers WHERE CAST(rating AS TEXT) = '4.8'`);
q("region upper lower diff", `SELECT COUNT(*) FROM customers WHERE UPPER(region) != region`);
q("name-contains-census letters", `SELECT COUNT(*) FROM customers WHERE INSTR(LOWER(name), 'a') > 0`);
q("product-hyphen count", `SELECT COUNT(*) FROM products WHERE INSTR(name, '-') > 0`);
q("email local min max", `SELECT MIN(INSTR(email, '@') - 1), MAX(INSTR(email, '@') - 1) FROM customers`);
// t2 deepening
q("ledger debit lines by account", `SELECT account, COUNT(*) FROM ledger_entries WHERE credit_cents = 0 GROUP BY account ORDER BY 2 DESC`);
q("unpaid by issue year", `SELECT strftime('%Y', issued_on) y, COUNT(*) FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL GROUP BY y`);
q("void amount", `SELECT SUM(amount_cents) FROM invoices WHERE status = 'void'`);
q("expense rent months count", `SELECT COUNT(DISTINCT strftime('%Y-%m', spent_on)) FROM expenses WHERE category = 'Rent'`);
q("nullif stock zero", `SELECT COUNT(*) FROM products WHERE NULLIF(stock, 0) IS NULL`);
q("coalesce ship label delivered", `SELECT COUNT(*) FROM orders WHERE COALESCE(shipped_at, 'x') = 'x' AND status = 'delivered'`);
q("ifnull ship sentry all", `SELECT COUNT(*) FROM orders WHERE IFNULL(shipped_at, '1900-01-01') = '1900-01-01'`);
q("unpaid open ids over 20", `SELECT COUNT(*) FROM (SELECT i.id FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL AND i.status = 'open') WHERE id > 20`);
q("payments pot cents", `SELECT SUM(amount_cents) FROM payments`);
q("invoice pot cents", `SELECT SUM(amount_cents) FROM invoices`);
// t3 deepening
q("order span days", `SELECT ROUND(julianday(MAX(created_at)) - julianday(MIN(created_at)), 0) FROM orders`);
q("signup span days", `SELECT ROUND(julianday(MAX(created_at)) - julianday(MIN(created_at)), 0) FROM customers`);
q("distinct ship dates", `SELECT COUNT(DISTINCT DATE(shipped_at)) FROM orders WHERE shipped_at IS NOT NULL`);
q("invoice paid weekday", `SELECT strftime('%w', paid_on) wd, COUNT(*) FROM payments GROUP BY wd ORDER BY 2 DESC`);
q("lag 2 delivered count", `SELECT COUNT(*) FROM orders WHERE status='delivered' AND julianday(shipped_at) - julianday(created_at) = 2`);
q("lag histogram delivered", `SELECT CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) d, COUNT(*) FROM orders WHERE status = 'delivered' GROUP BY d ORDER BY d`);
q("orders on weekends 2024", `SELECT COUNT(*) FROM orders WHERE strftime('%w', created_at) IN ('0','6') AND strftime('%Y', created_at) = '2024'`);
q("signup weekend count", `SELECT COUNT(*) FROM customers WHERE strftime('%w', created_at) IN ('0','6')`);
q("day-15 orders", `SELECT COUNT(*) FROM orders WHERE CAST(strftime('%d', created_at) AS INTEGER) = 15`);
q("first-order days late month", `SELECT COUNT(*) FROM (SELECT customer_id, MIN(created_at) f FROM orders GROUP BY customer_id) WHERE CAST(strftime('%d', f) AS INTEGER) >= 15`);
// t4 deepening
q("expense months census", `SELECT strftime('%Y-%m', spent_on) mo, SUM(amount_cents) FROM expenses GROUP BY mo ORDER BY mo LIMIT 4`);
q("expense month count", `SELECT COUNT(DISTINCT strftime('%Y-%m', spent_on)) FROM expenses`);
q("expense top month", `SELECT strftime('%Y-%m', spent_on) mo, SUM(amount_cents) s FROM expenses GROUP BY mo ORDER BY s DESC LIMIT 1`);
q("invoice month pots count", `SELECT COUNT(DISTINCT strftime('%Y-%m', issued_on)) FROM invoices`);
q("payments month count", `SELECT COUNT(DISTINCT strftime('%Y-%m', paid_on)) FROM payments`);
q("signup q1 members", `SELECT COUNT(*) FROM customers WHERE CAST(strftime('%m', created_at) AS INTEGER) <= 3`);
q("2024-09 revenue", `SELECT ROUND(SUM(total), 2) FROM orders WHERE strftime('%Y-%m', created_at) = '2024-09'`);
q("2024-09 delivered count", `SELECT COUNT(*) FROM orders WHERE strftime('%Y-%m', created_at) = '2024-09' AND status = 'delivered'`);
q("months with pending", `SELECT COUNT(*) FROM (SELECT DISTINCT strftime('%Y-%m', created_at) FROM orders WHERE status = 'pending')`);
q("avg signup per month", `SELECT ROUND(AVG(n), 2) FROM (SELECT COUNT(*) n FROM customers GROUP BY strftime('%Y-%m', created_at))`);
db.close();
