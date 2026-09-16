/// <reference types="bun-types" />
/** M6 wave-2 facts probe round 2 — payment-side orphans, tallies, scope splits. */
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.m6w2-facts2.db");
const db = new Database("scripts/.m6w2-facts2.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`## ${label}`);
    console.log(JSON.stringify(rows).slice(0, 1100));
  } catch (e) {
    console.log(`## ${label}\nERROR ${(e as Error).message.slice(0, 140)}`);
  }
}

// P1: invoices with no payments (payments RIGHT JOIN invoices)
q("P1 unpaid invoices", `SELECT i.number, i.status, i.amount_cents FROM payments p
  RIGHT JOIN invoices i ON p.invoice_id = i.id
  WHERE p.id IS NULL ORDER BY i.amount_cents DESC`);
q("P2 unpaid invoice count", `SELECT COUNT(*) AS unpaid FROM payments p
  RIGHT JOIN invoices i ON p.invoice_id = i.id WHERE p.id IS NULL`);
q("P3 unpaid by status", `SELECT i.status, COUNT(*) AS n FROM payments p
  RIGHT JOIN invoices i ON p.invoice_id = i.id
  WHERE p.id IS NULL GROUP BY i.status ORDER BY n DESC`);
// P4: per-customer invoice tally incl zeros
q("P4 invoice tally incl zero", `SELECT c.name, COUNT(i.id) AS n FROM invoices i
  RIGHT JOIN customers c ON i.customer_id = c.id
  GROUP BY c.id ORDER BY n ASC, c.name LIMIT 8`);
// P5: invoice status distribution
q("P5 invoice statuses", `SELECT status, COUNT(*) AS n FROM invoices GROUP BY status`);
// P6: paid coverage — invoices with >=1 payment
q("P6 paid invoices", `SELECT COUNT(DISTINCT invoice_id) AS paid_inv, (SELECT COUNT(*) FROM invoices) AS all_inv FROM payments`);
// P7: per-supplier product tally (RIGHT JOIN keeps all 6)
q("P7 supplier tally", `SELECT s.name, COUNT(p.id) AS n FROM products p
  RIGHT JOIN suppliers s ON p.supplier_id = s.id
  GROUP BY s.id ORDER BY n ASC, s.name`);
// P8: per-product order-item tally extremes
q("P8 product tally min", `SELECT p.name, COUNT(oi.id) AS n FROM order_items oi
  RIGHT JOIN products p ON oi.product_id = p.id
  GROUP BY p.id ORDER BY n ASC, p.name LIMIT 6`);
q("P9 product tally max", `SELECT p.name, COUNT(oi.id) AS n FROM order_items oi
  RIGHT JOIN products p ON oi.product_id = p.id
  GROUP BY p.id ORDER BY n DESC, p.name LIMIT 4`);
// P10: unpaid invoice value
q("P10 unpaid value", `SELECT ROUND(SUM(i.amount_cents)/100.0, 2) AS unpaid_val FROM payments p
  RIGHT JOIN invoices i ON p.invoice_id = i.id WHERE p.id IS NULL`);
// P11: no-OPEN-invoice customers (scoped orphan)
q("P11 no-open-invoice", `SELECT c.name, c.region FROM invoices i
  RIGHT JOIN customers c ON i.customer_id = c.id AND i.status = 'open'
  WHERE i.id IS NULL ORDER BY c.name`);
// P12: open invoices by customer for cross-check
q("P12 open by customer", `SELECT c.name, COUNT(*) AS n FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.status='open' GROUP BY c.id ORDER BY n DESC`);
// P13: payments per invoice extremes
q("P13 payments per invoice", `SELECT i.number, COUNT(p.id) AS n FROM payments p
  RIGHT JOIN invoices i ON p.invoice_id = i.id
  GROUP BY i.id ORDER BY n DESC, i.number LIMIT 5`);
// P14: FULL OUTER payments-invoices per invoice with amounts (overpaid/underpaid)
q("P14 paid-vs-billed", `SELECT i.number, i.amount_cents/100.0 AS billed,
    ROUND(COALESCE(SUM(p.amount_cents),0)/100.0, 2) AS paid
  FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id
  GROUP BY i.id
  HAVING paid < billed ORDER BY billed - paid DESC LIMIT 6`);
// P15: region census of customers with no invoices
q("P15 no-inv regions", `SELECT c.region, COUNT(*) AS n, GROUP_CONCAT(c.name, ', ') AS names
  FROM invoices i RIGHT JOIN customers c ON i.customer_id = c.id
  WHERE i.id IS NULL GROUP BY c.region`);
// P16: customers with no 2024 invoices (scoped by year)
q("P16 no-2024-invoice", `SELECT COUNT(*) AS n FROM invoices i
  RIGHT JOIN customers c ON i.customer_id = c.id AND i.issued_on >= '2024-01-01' AND i.issued_on < '2025-01-01'
  WHERE i.id IS NULL`);
// P17: invoice-free customers total value of orders (tie-in to F7)
q("P17 no-inv order value", `SELECT ROUND(SUM(o.total), 2) AS val FROM invoices i
  RIGHT JOIN customers c ON i.customer_id = c.id
  JOIN orders o ON o.customer_id = c.id
  WHERE i.id IS NULL`);
// P18: payments methods distribution
q("P18 payment methods", `SELECT method, COUNT(*) AS n FROM payments GROUP BY method`);

db.close();
