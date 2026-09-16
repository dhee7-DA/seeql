/// <reference types="bun-types" />
/** M5 wave-1 fact probes, batch 2 — gap fills for t1/t2/t3/t4. */
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
let n = 75; // continue numbering from batch 1
const q = (label: string, sql: string) => {
  n++;
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const cells = rows.map((r) => Object.values(r).map((v) => (v === null ? "NULL" : typeof v === "number" ? (Number.isInteger(v) ? v : Number(v.toFixed(6))) : v)).join(" | "));
    console.log(`T${String(n).padStart(2, "0")} ${label}`);
    console.log(`   ${cells.slice(0, 26).join("  ;;  ") || "(0 rows)"}`);
  } catch (e) {
    console.log(`T${String(n).padStart(2, "0")} ${label} ERROR: ${e instanceof Error ? e.message : e}`);
  }
};

// ---------- t2 gaps: invoices vs payments, ledger ----------
q("ledger schema", `SELECT sql FROM sqlite_master WHERE name = 'ledger_entries'`);
q("ledger NULL pattern", `SELECT SUM(CASE WHEN debit_cents IS NULL THEN 1 ELSE 0 END) dnull, SUM(CASE WHEN credit_cents IS NULL THEN 1 ELSE 0 END) cnull, COUNT(*) FROM ledger_entries`);
q("ledger accounts", `SELECT account, COUNT(*) n FROM ledger_entries GROUP BY account ORDER BY n DESC`);
q("invoices unpaid (no payment row)", `SELECT COUNT(*) FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL`);
q("unpaid invoices detail", `SELECT i.number, i.amount_cents, i.status FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL ORDER BY i.amount_cents DESC`);
q("invoice status census", `SELECT status, COUNT(*) n FROM invoices GROUP BY status ORDER BY n DESC`);
q("unpaid pot cents", `SELECT COALESCE(SUM(i.amount_cents), 0) FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL`);
q("paid invoices", `SELECT COUNT(*) FROM invoices i JOIN payments p ON p.invoice_id = i.id`);
q("overpaid invoices", `SELECT COUNT(*) FROM (SELECT i.id FROM invoices i JOIN payments p ON p.invoice_id = i.id GROUP BY i.id HAVING SUM(p.amount_cents) > i.amount_cents)`);
q("exact-paid invoices", `SELECT COUNT(*) FROM (SELECT i.id FROM invoices i JOIN payments p ON p.invoice_id = i.id GROUP BY i.id HAVING SUM(p.amount_cents) = i.amount_cents)`);
q("underpaid invoices", `SELECT COUNT(*) FROM (SELECT i.id FROM invoices i JOIN payments p ON p.invoice_id = i.id GROUP BY i.id HAVING SUM(p.amount_cents) < i.amount_cents)`);
q("coalesce unpaid zero-fill", `SELECT i.number, COALESCE(SUM(p.amount_cents), 0) paid FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id GROUP BY i.id HAVING COALESCE(SUM(p.amount_cents), 0) = 0`);
q("payments per invoice dist", `SELECT n, COUNT(*) FROM (SELECT i.id, COUNT(p.id) n FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id GROUP BY i.id) GROUP BY n ORDER BY n`);
q("expenses category census", `SELECT category, COUNT(*) n FROM expenses GROUP BY category ORDER BY n DESC`);
q("expense vendor count", `SELECT COUNT(DISTINCT vendor) FROM expenses`);
q("expense vendors", `SELECT DISTINCT vendor FROM expenses ORDER BY vendor`);

// ---------- t1 gaps: more text shapes ----------
q("region length census", `SELECT LENGTH(region) len, COUNT(*) FROM customers GROUP BY len ORDER BY len`);
q("name contains 'o'", `SELECT COUNT(*) FROM customers WHERE INSTR(LOWER(name), 'o') > 0`);
q("name contains 'e'", `SELECT COUNT(*) FROM customers WHERE INSTR(LOWER(name), 'e') > 0`);
q("product name contains 'K'", `SELECT COUNT(*) FROM products WHERE INSTR(name, 'K') > 0`);
q("email dot positions", `SELECT COUNT(*) FROM customers WHERE INSTR(email, '.') = INSTR(email, '@') - 4`);
q("email first-4 census", `SELECT COUNT(DISTINCT SUBSTR(email, 1, 4)) FROM customers`);
q("product category name lengths", `SELECT category, COUNT(*), ROUND(AVG(LENGTH(name)), 2) FROM products GROUP BY category ORDER BY 3 DESC`);
q("city upper len same", `SELECT COUNT(*) FROM customers WHERE LENGTH(UPPER(city)) != LENGTH(city)`);
q("initial unique check", `SELECT COUNT(DISTINCT SUBSTR(name, 1, 1)) FROM customers`);
q("lastname length census", `SELECT LENGTH(SUBSTR(name, INSTR(name, ' ') + 1)) len, COUNT(*) n FROM customers GROUP BY len ORDER BY len DESC`);
q("longest lastname", `SELECT name, SUBSTR(name, INSTR(name, ' ') + 1) last, LENGTH(SUBSTR(name, INSTR(name, ' ') + 1)) FROM customers ORDER BY LENGTH(SUBSTR(name, INSTR(name, ' ') + 1)) DESC LIMIT 4`);
q("cast rating int", `SELECT DISTINCT CAST(rating AS INTEGER) FROM suppliers ORDER BY 1`);
q("rating text len", `SELECT name, LENGTH(CAST(rating AS TEXT)) FROM suppliers ORDER BY id`);
q("product name ends with digit", `SELECT COUNT(*) FROM products WHERE SUBSTR(name, -1) IN ('0','1','2','3','4','5','6','7','8','9')`);
q("product last char census", `SELECT name, SUBSTR(name, -1) ch FROM products ORDER BY id`);
q("name first-char uppercase check", `SELECT COUNT(*) FROM customers WHERE SUBSTR(name, 1, 1) != UPPER(SUBSTR(name, 1, 1))`);
q("names with double-o", `SELECT name FROM customers WHERE name LIKE '%oo%'`);
q("vendor length census", `SELECT LENGTH(vendor) len, COUNT(*) n FROM expenses GROUP BY len ORDER BY len DESC`);

// ---------- t3 gaps: lag histogram, finer date shapes ----------
q("ship lag histogram", `SELECT CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) days, COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL GROUP BY days ORDER BY days`);
q("lag 4-day rows", `SELECT COUNT(*) FROM orders WHERE julianday(shipped_at) - julianday(created_at) >= 4`);
q("lag 3-day rows", `SELECT COUNT(*) FROM orders WHERE julianday(shipped_at) - julianday(created_at) >= 3`);
q("lag exactly 2", `SELECT COUNT(*) FROM orders WHERE julianday(shipped_at) - julianday(created_at) = 2`);
q("avg lag by status", `SELECT status, ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) FROM orders WHERE shipped_at IS NOT NULL GROUP BY status`);
q("delivered lag avg", `SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) FROM orders WHERE status = 'delivered'`);
q("shipped-status lag avg", `SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) FROM orders WHERE status = 'shipped'`);
q("order day-of-month census", `SELECT CAST(strftime('%d', created_at) AS INTEGER) d, COUNT(*) FROM orders GROUP BY d ORDER BY d`);
q("day-1 orders", `SELECT COUNT(*) FROM orders WHERE CAST(strftime('%d', created_at) AS INTEGER) = 1`);
q("year census orders", `SELECT strftime('%Y', created_at) y, COUNT(*) n FROM orders GROUP BY y`);
q("2025 orders", `SELECT COUNT(*) FROM orders WHERE strftime('%Y', created_at) = '2025'`);
q("signup weekday census", `SELECT strftime('%w', created_at) wd, COUNT(*) FROM customers GROUP BY wd ORDER BY 2 DESC`);
q("customers per signup month exact", `SELECT strftime('%Y-%m', created_at) mo, COUNT(*) n, GROUP_CONCAT(name) FROM customers GROUP BY mo ORDER BY mo`);
q("weeks census (ISO)", `SELECT COUNT(DISTINCT strftime('%W', created_at)) FROM orders`);
q("month-name census", `SELECT DISTINCT strftime('%m', created_at) FROM orders ORDER BY 1`);

// ---------- t4 gaps: bucket discriminators ----------
q("months with 9 orders", `SELECT COUNT(*) FROM (SELECT strftime('%Y-%m', created_at) mo, COUNT(*) n FROM orders GROUP BY mo HAVING n = 9)`);
q("months with 6 orders", `SELECT COUNT(*) FROM (SELECT strftime('%Y-%m', created_at) mo, COUNT(*) n FROM orders GROUP BY mo HAVING n = 6)`);
q("avg orders per month", `SELECT ROUND(AVG(n), 2) FROM (SELECT COUNT(*) n FROM orders GROUP BY strftime('%Y-%m', created_at))`);
q("month count 2024 vs 2025", `SELECT strftime('%Y', created_at) y, COUNT(DISTINCT strftime('%m', created_at)) FROM orders GROUP BY y`);
q("revenue 2024 total", `SELECT ROUND(SUM(total), 2) FROM orders WHERE strftime('%Y', created_at) = '2024'`);
q("revenue 2025 total", `SELECT ROUND(SUM(total), 2) FROM orders WHERE strftime('%Y', created_at) = '2025'`);
q("delivered count by month 2025", `SELECT strftime('%Y-%m', created_at) mo, COUNT(*) FROM orders WHERE status = 'delivered' AND strftime('%Y-%m', created_at) >= '2025-01' GROUP BY mo`);
q("cancelled by month", `SELECT strftime('%Y-%m', created_at) mo, COUNT(*) FROM orders WHERE status = 'cancelled' GROUP BY mo HAVING COUNT(*) >= 1 ORDER BY mo`);
q("bucket via date() check", `SELECT COUNT(*) FROM (SELECT DISTINCT DATE(created_at, 'start of month') FROM orders)`);
q("month bucket avg revenue", `SELECT ROUND(AVG(rev), 2) FROM (SELECT SUM(total) rev FROM orders GROUP BY strftime('%Y-%m', created_at))`);
q("below-avg-order months", `SELECT COUNT(*) FROM (SELECT strftime('%Y-%m', created_at) mo, COUNT(*) n FROM orders GROUP BY mo) WHERE n < (SELECT ROUND(AVG(n), 4) FROM (SELECT COUNT(*) n FROM orders GROUP BY strftime('%Y-%m', created_at)))`);
db.close();
