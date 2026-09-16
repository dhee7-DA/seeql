/// <reference types="bun-types" />
/** Probe schemas + figures for rebuilding cs-1429 and cs-1444. */
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.verify-t5b.db");
const db = new Database("scripts/.verify-t5b.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`${label}: ${JSON.stringify(rows).slice(0, 400)}`);
  } catch (e) {
    console.log(`${label}: ERROR ${(e as Error).message.slice(0, 140)}`);
  }
}

// schemas
for (const t of ["expenses", "invoices", "payments", "shipments", "order_items"]) {
  q(`schema ${t}`, `SELECT sql FROM sqlite_master WHERE name = '${t}'`);
}

// cs-1429 candidates: span on other tables
q("expenses span", `SELECT ROUND(julianday(MAX(spent_at)) - julianday(MIN(spent_at)), 0) AS span_days FROM expenses`);
q("invoices span", `SELECT ROUND(julianday(MAX(invoice_date)) - julianday(MIN(invoice_date)), 0) AS span_days FROM invoices`);
q("payments span", `SELECT ROUND(julianday(MAX(settled_at)) - julianday(MIN(settled_at)), 0) AS span_days FROM payments`);

// cs-1444 candidates: pair-month census on orders by status
q("cancelled pair months", `SELECT COUNT(*) AS pair_months FROM (SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n FROM orders WHERE status = 'cancelled' GROUP BY mo) WHERE n = 2 AND mo >= '2024-01'`);
q("shipped pair months", `SELECT COUNT(*) AS pair_months FROM (SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n FROM orders WHERE status = 'shipped' GROUP BY mo) WHERE n = 2 AND mo >= '2024-01'`);
q("delivered pair months", `SELECT COUNT(*) AS pair_months FROM (SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n FROM orders WHERE status = 'delivered' GROUP BY mo) WHERE n = 2 AND mo >= '2024-01'`);
// alternate: pair-WEEK census on orders (all statuses), 2024 only
q("pair weeks 2024", `SELECT COUNT(*) AS pair_weeks FROM (SELECT strftime('%Y-%W', created_at) AS wk, COUNT(*) AS n FROM orders GROUP BY wk) WHERE n = 2 AND wk >= '2024'`);
// alternate: expense pair months
q("expense pair months", `SELECT COUNT(*) AS pair_months FROM (SELECT strftime('%Y-%m', spent_at) AS mo, COUNT(*) AS n FROM expenses GROUP BY mo) WHERE n = 2 AND mo >= '2024-01'`);

db.close();
