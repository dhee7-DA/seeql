/// <reference types="bun-types" />
/** M6 wave-2 probe round 4 — final figures for case drafting. */
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.m6w2-facts4.db");
const db = new Database("scripts/.m6w2-facts4.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`## ${label}`);
    console.log(JSON.stringify(rows).slice(0, 1200));
  } catch (e) {
    console.log(`## ${label}\nERROR ${(e as Error).message.slice(0, 140)}`);
  }
}

// V1: exact folds for walkthroughs
q("V1 no-inv fold", `SELECT GROUP_CONCAT(c.name, ', ' ORDER BY c.name) AS line FROM invoices i
  RIGHT JOIN customers c ON i.customer_id = c.id WHERE i.id IS NULL`);
q("V2 APAC fold", `SELECT GROUP_CONCAT(c.name, ', ' ORDER BY c.name) AS line FROM invoices i
  RIGHT JOIN customers c ON i.customer_id = c.id WHERE i.id IS NULL AND c.region = 'APAC'`);
q("V3 paid-only fold", `SELECT GROUP_CONCAT(c.name, ', ' ORDER BY c.name) AS line
  FROM (SELECT DISTINCT customer_id FROM invoices WHERE status='open') o
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM invoices WHERE status='paid') p
    ON o.customer_id = p.customer_id
  JOIN customers c ON c.id = COALESCE(o.customer_id, p.customer_id)
  WHERE o.customer_id IS NULL`);
// V4: regions of key members
q("V4 open-only regions", `SELECT c.name, c.region
  FROM (SELECT DISTINCT customer_id FROM invoices WHERE status='open') o
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM invoices WHERE status='paid') p
    ON o.customer_id = p.customer_id
  JOIN customers c ON c.id = COALESCE(o.customer_id, p.customer_id)
  WHERE o.customer_id IS NOT NULL AND p.customer_id IS NULL ORDER BY c.name`);
q("V5 both-side regions", `SELECT c.name, c.region
  FROM (SELECT DISTINCT customer_id FROM invoices WHERE status='open') o
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM invoices WHERE status='paid') p
    ON o.customer_id = p.customer_id
  JOIN customers c ON c.id = COALESCE(o.customer_id, p.customer_id)
  WHERE o.customer_id IS NOT NULL AND p.customer_id IS NOT NULL ORDER BY c.name`);
q("V6 paid-only APAC count", `SELECT COUNT(*) AS n
  FROM (SELECT DISTINCT customer_id FROM invoices WHERE status='open') o
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM invoices WHERE status='paid') p
    ON o.customer_id = p.customer_id
  JOIN customers c ON c.id = COALESCE(o.customer_id, p.customer_id)
  WHERE o.customer_id IS NULL AND c.region = 'APAC'`);
// V7: open-only unpaid value (their open invoices)
q("V7 open-only unpaid value", `SELECT ROUND(SUM(i.amount_cents)/100.0, 2) AS val
  FROM (SELECT DISTINCT customer_id FROM invoices WHERE status='open') o
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM invoices WHERE status='paid') p
    ON o.customer_id = p.customer_id
  JOIN invoices i ON i.customer_id = COALESCE(o.customer_id, p.customer_id) AND i.status = 'open'
  WHERE o.customer_id IS NOT NULL AND p.customer_id IS NULL`);
// V8: Hiro order value + orders
q("V8 Hiro orders", `SELECT ROUND(SUM(total),2) AS rev, COUNT(*) AS n FROM orders o
  JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Hiro Tanaka'`);
// V9: void invoice payment check
q("V9 void with payment", `SELECT i.number, i.status, COUNT(p.id) AS pay_n FROM payments p
  RIGHT JOIN invoices i ON p.invoice_id = i.id
  WHERE i.status = 'void' GROUP BY i.id`);
q("V9b void invoice detail", `SELECT i.number, i.amount_cents FROM invoices i WHERE i.status = 'void'`);
// V10: invoice-free members' order extremes
q("V10 max single order no-inv", `SELECT c.name, o.total FROM invoices i
  RIGHT JOIN customers c ON i.customer_id = c.id
  JOIN orders o ON o.customer_id = c.id
  WHERE i.id IS NULL ORDER BY o.total DESC LIMIT 3`);
q("V11 avg order no-inv", `SELECT ROUND(AVG(o.total), 2) AS avg_order, COUNT(*) AS n FROM invoices i
  RIGHT JOIN customers c ON i.customer_id = c.id
  JOIN orders o ON o.customer_id = c.id
  WHERE i.id IS NULL`);
// V12: shipped-only and pending-only lists
q("V12 shipped-only", `SELECT c.name, c.region
  FROM (SELECT DISTINCT customer_id FROM orders WHERE status='shipped') s
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM orders WHERE status='pending') p2
    ON s.customer_id = p2.customer_id
  JOIN customers c ON c.id = COALESCE(s.customer_id, p2.customer_id)
  WHERE p2.customer_id IS NULL ORDER BY c.name`);
q("V13 pending-only", `SELECT c.name, c.region
  FROM (SELECT DISTINCT customer_id FROM orders WHERE status='shipped') s
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM orders WHERE status='pending') p2
    ON s.customer_id = p2.customer_id
  JOIN customers c ON c.id = COALESCE(s.customer_id, p2.customer_id)
  WHERE s.customer_id IS NULL ORDER BY c.name`);
// V14: card-vs-wire checks (wire subset of card)
q("V14 wire-only count", `SELECT COUNT(*) AS wire_only
  FROM (SELECT DISTINCT i.customer_id AS customer_id FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE p.method='card') cd
  FULL OUTER JOIN (SELECT DISTINCT i.customer_id AS customer_id FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE p.method='wire') w
    ON cd.customer_id = w.customer_id WHERE cd.customer_id IS NULL`);
// V15: zero-payment invoice value total (open only confirmed 13461?)
q("V15 unpaid open value", `SELECT ROUND(SUM(i.amount_cents)/100.0, 2) AS val FROM payments p
  RIGHT JOIN invoices i ON p.invoice_id = i.id
  WHERE p.id IS NULL AND i.status = 'open'`);
// V16: 2024-only/2025-only region splits
q("V16 2024-only regions", `SELECT c.region, COUNT(*) AS n
  FROM (SELECT DISTINCT customer_id FROM invoices WHERE issued_on >= '2024-01-01' AND issued_on < '2025-01-01') o4
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM invoices WHERE issued_on >= '2025-01-01' AND issued_on < '2026-01-01') y
    ON o4.customer_id = y.customer_id
  JOIN customers c ON c.id = COALESCE(o4.customer_id, y.customer_id)
  WHERE y.customer_id IS NULL GROUP BY c.region ORDER BY n DESC`);
// V17: 2025-only Hiro order count
q("V17 Hiro order count", `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.name='Hiro Tanaka'`);
// V18: unpaid-by-status full values
q("V18 unpaid by status", `SELECT i.status, COUNT(*) AS n, ROUND(SUM(i.amount_cents)/100.0,2) AS val FROM payments p
  RIGHT JOIN invoices i ON p.invoice_id = i.id WHERE p.id IS NULL GROUP BY i.status`);
// V19: orders count for invoice-free = 15?
q("V19 no-inv order count", `SELECT COUNT(*) AS n FROM invoices i
  RIGHT JOIN customers c ON i.customer_id = c.id
  JOIN orders o ON o.customer_id = c.id WHERE i.id IS NULL`);
// V20: both-side open+paid value exposure
q("V20 both-side open value", `SELECT ROUND(SUM(i.amount_cents)/100.0,2) AS open_val
  FROM (SELECT DISTINCT customer_id FROM invoices WHERE status='open') o
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM invoices WHERE status='paid') p
    ON o.customer_id = p.customer_id
  JOIN invoices i ON i.customer_id = COALESCE(o.customer_id, p.customer_id) AND i.status='open'
  WHERE o.customer_id IS NOT NULL AND p.customer_id IS NOT NULL`);

db.close();
