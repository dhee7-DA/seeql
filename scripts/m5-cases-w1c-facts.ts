/// <reference types="bun-types" />
/** M5 wave-1 probes, batch 3 — ambiguity-safety receipts. */
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
let n = 135;
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

q("ledger credit-zero count", `SELECT COUNT(*) FROM ledger_entries WHERE credit_cents = 0`);
q("ledger debit-zero count", `SELECT COUNT(*) FROM ledger_entries WHERE debit_cents = 0`);
q("ledger both-zero count", `SELECT COUNT(*) FROM ledger_entries WHERE credit_cents = 0 AND debit_cents = 0`);
q("ledger date span", `SELECT MIN(entry_date), MAX(entry_date), COUNT(*) FROM ledger_entries`);
q("ledger cash credit-zero", `SELECT COUNT(*) FROM ledger_entries WHERE account = 'cash' AND credit_cents = 0`);
q("EU o-names", `SELECT COUNT(*) FROM customers WHERE INSTR(LOWER(name), 'o') > 0 AND region = 'EU'`);
q("non-EU o-names", `SELECT COUNT(*) FROM customers WHERE INSTR(LOWER(name), 'o') > 0 AND region != 'EU'`);
q("email length spread", `SELECT MIN(LENGTH(email)), MAX(LENGTH(email)) FROM customers`);
q("emails longer than 30", `SELECT COUNT(*) FROM customers WHERE LENGTH(email) > 30`);
q("void invoice detail", `SELECT number, amount_cents, issued_on, due_on FROM invoices WHERE status = 'void'`);
q("late payments (paid>due)", `SELECT COUNT(*) FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE p.paid_on > i.due_on`);
q("never-invoiced customers", `SELECT COUNT(*) FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id WHERE i.id IS NULL`);
q("unpaid invoice ids", `SELECT i.id FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL ORDER BY i.id`);
q("unpaid ids over 25", `SELECT COUNT(*) FROM (SELECT i.id FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL) WHERE id > 25`);
q("first-pay-never ids over 25", `SELECT COUNT(*) FROM (SELECT i.id, COALESCE(MIN(p.paid_on), 'never') fp FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id GROUP BY i.id) WHERE fp = 'never' AND id > 25`);
q("never-shipped totals over 300", `SELECT COUNT(*) FROM orders WHERE shipped_at IS NULL AND total > 300`);
q("never-shipped totals over 400", `SELECT COUNT(*) FROM orders WHERE shipped_at IS NULL AND total > 400`);
q("zero-fill ids over 25", `SELECT COUNT(*) FROM (SELECT i.id, COALESCE(SUM(p.amount_cents), 0) paid FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id GROUP BY i.id) WHERE paid = 0 AND id > 25`);
q("split ids over 25", `SELECT COUNT(*) FROM (SELECT i.id, COUNT(p.id) n FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id GROUP BY i.id) WHERE n = 2 AND id > 25`);
q("single-pay ids over 25", `SELECT COUNT(*) FROM (SELECT i.id, COUNT(p.id) n FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id GROUP BY i.id) WHERE n = 1 AND id > 25`);
q("active o-names", `SELECT COUNT(*) FROM customers WHERE INSTR(LOWER(name), 'o') > 0 AND active = 1`);
q("names starting with o", `SELECT COUNT(*) FROM customers WHERE SUBSTR(LOWER(name), 1, 1) = 'o'`);
q("month with 8 orders count", `SELECT COUNT(*) FROM (SELECT strftime('%Y-%m', created_at) mo, COUNT(*) n FROM orders GROUP BY mo) WHERE n = 8`);
q("month with 7 orders count", `SELECT COUNT(*) FROM (SELECT strftime('%Y-%m', created_at) mo, COUNT(*) n FROM orders GROUP BY mo) WHERE n = 7`);
q("months with delivered", `SELECT COUNT(*) FROM (SELECT DISTINCT strftime('%Y-%m', created_at) FROM orders WHERE status = 'delivered')`);
q("months rev over 3000", `SELECT COUNT(*) FROM (SELECT strftime('%Y-%m', created_at) mo, SUM(total) rev FROM orders GROUP BY mo) WHERE rev > 3000`);
q("2024-02 delivered rev", `SELECT ROUND(SUM(total), 2) FROM orders WHERE status = 'delivered' AND strftime('%Y-%m', created_at) = '2024-02'`);
q("expenses Rent pot", `SELECT SUM(amount_cents) FROM expenses WHERE category = 'Rent'`);
q("expenses Ads pot", `SELECT SUM(amount_cents) FROM expenses WHERE category = 'Ads'`);
q("expenses months with rent", `SELECT COUNT(*) FROM (SELECT DISTINCT strftime('%Y-%m', spent_on) FROM expenses WHERE category = 'Rent')`);
q("payments methods", `SELECT method, COUNT(*) n FROM payments GROUP BY method ORDER BY n DESC`);
q("orders total over 300 count", `SELECT COUNT(*) FROM orders WHERE total > 300`);
q("delivered lag exactly 3", `SELECT COUNT(*) FROM orders WHERE status = 'delivered' AND julianday(shipped_at) - julianday(created_at) = 3`);
q("delivered lag exactly 2", `SELECT COUNT(*) FROM orders WHERE status = 'delivered' AND julianday(shipped_at) - julianday(created_at) = 2`);
q("shipped-status lag 4", `SELECT COUNT(*) FROM orders WHERE status = 'shipped' AND julianday(shipped_at) - julianday(created_at) = 4`);
q("orders 2024-02 not delivered", `SELECT COUNT(*) FROM orders WHERE strftime('%Y-%m', created_at) = '2024-02' AND status != 'delivered'`);
q("pending by month", `SELECT strftime('%Y-%m', created_at) mo, COUNT(*) FROM orders WHERE status = 'pending' GROUP BY mo ORDER BY mo`);
q("2025 delivered rev", `SELECT ROUND(SUM(total), 2) FROM orders WHERE status = 'delivered' AND strftime('%Y', created_at) = '2025'`);
q("2025-01 rev", `SELECT ROUND(SUM(total), 2) FROM orders WHERE strftime('%Y-%m', created_at) = '2025-01'`);
q("2025-02 rev", `SELECT ROUND(SUM(total), 2) FROM orders WHERE strftime('%Y-%m', created_at) = '2025-02'`);
q("months rev over 2500", `SELECT COUNT(*) FROM (SELECT strftime('%Y-%m', created_at) mo, SUM(total) rev FROM orders GROUP BY mo) WHERE rev > 2500`);
q("signup 2024 count", `SELECT COUNT(*) FROM customers WHERE strftime('%Y', created_at) = '2024'`);
q("day-2 orders", `SELECT COUNT(*) FROM orders WHERE CAST(strftime('%d', created_at) AS INTEGER) = 2`);
q("lastnames ending s", `SELECT COUNT(*) FROM customers WHERE SUBSTR(SUBSTR(name, INSTR(name, ' ') + 1), -1) = 's'`);
q("products starting with digit", `SELECT COUNT(*) FROM products WHERE SUBSTR(name, 1, 1) IN ('0','1','2','3','4','5','6','7','8','9')`);
q("pending totals pot", `SELECT ROUND(SUM(total), 2) FROM orders WHERE status = 'pending'`);
q("suppliers EU count", `SELECT COUNT(*) FROM suppliers WHERE region = 'EU'`);
q("o-city customers", `SELECT COUNT(*) FROM customers WHERE INSTR(LOWER(city), 'o') > 0`);
q("invoice 2024 count", `SELECT COUNT(*) FROM invoices WHERE strftime('%Y', issued_on) = '2024'`);
q("invoice 2025 count", `SELECT COUNT(*) FROM invoices WHERE strftime('%Y', issued_on) = '2025'`);
db.close();
