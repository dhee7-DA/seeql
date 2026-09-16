/// <reference types="bun-types" />
/** M5 wave-1 probes, batch 4 — audit-fix figures. */
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
let n = 185;
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

q("ghost customers detail", `SELECT c.id, c.name, c.region, c.active, c.created_at, LENGTH(c.email) FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id WHERE i.id IS NULL ORDER BY c.id`);
q("ghosts active=0", `SELECT COUNT(*) FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id WHERE i.id IS NULL AND c.active = 0`);
q("ghosts min created", `SELECT MIN(c.created_at) FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id WHERE i.id IS NULL`);
q("payments-table ghost count", `SELECT COUNT(*) FROM (SELECT p.id FROM payments p LEFT JOIN invoices i ON i.customer_id = p.id WHERE i.id IS NULL)`);
q("delivered weekday census", `SELECT strftime('%w', created_at) wd, COUNT(*) n FROM orders WHERE status = 'delivered' GROUP BY wd ORDER BY n DESC`);
q("shipped weekday census", `SELECT strftime('%w', created_at) wd, COUNT(*) n FROM orders WHERE status = 'shipped' GROUP BY wd ORDER BY n DESC`);
q("pace via shipped months", `SELECT COUNT(*) FROM (SELECT strftime('%Y-%m', shipped_at) mo, COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL GROUP BY mo) WHERE n < (SELECT ROUND(AVG(n), 4) FROM (SELECT COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL GROUP BY strftime('%Y-%m', shipped_at)))`);
q("unpaid numbers+ids", `SELECT i.id, i.number FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL ORDER BY i.id`);
q("customers name-length avg", `SELECT ROUND(AVG(LENGTH(name)), 2) FROM customers`);
q("lag2 total over 300", `SELECT COUNT(*) FROM orders WHERE julianday(shipped_at) - julianday(created_at) = 2 AND total > 300`);
db.close();
