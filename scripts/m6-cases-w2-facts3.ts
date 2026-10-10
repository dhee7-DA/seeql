/// <reference types="bun-types" />
/** M6 wave-2 probe round 3 — scoped-set FULL OUTER pairs with two-sided exclusives. */
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.m6w2-facts3.db");
const db = new Database("scripts/.m6w2-facts3.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`## ${label}`);
    console.log(JSON.stringify(rows).slice(0, 1200));
  } catch (e) {
    console.log(`## ${label}\nERROR ${(e as Error).message.slice(0, 140)}`);
  }
}

// S1: open-invoice customers vs paid-invoice customers
q("S1 open-vs-paid customers", `SELECT COUNT(*) AS members,
    SUM(CASE WHEN p.customer_id IS NULL THEN 1 ELSE 0 END) AS open_only,
    SUM(CASE WHEN o.customer_id IS NULL THEN 1 ELSE 0 END) AS paid_only
  FROM (SELECT DISTINCT customer_id FROM invoices WHERE status='open') o
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM invoices WHERE status='paid') p
    ON o.customer_id = p.customer_id`);
q("S1b names", `SELECT c.name,
    CASE WHEN o.customer_id IS NOT NULL AND p.customer_id IS NULL THEN 'open-only'
         WHEN p.customer_id IS NOT NULL AND o.customer_id IS NULL THEN 'paid-only'
         ELSE 'both' END AS side
  FROM (SELECT DISTINCT customer_id FROM invoices WHERE status='open') o
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM invoices WHERE status='paid') p
    ON o.customer_id = p.customer_id
  JOIN customers c ON c.id = COALESCE(o.customer_id, p.customer_id)
  ORDER BY side, c.name`);
// S2: delivered-orders customers vs cancelled-orders customers
q("S2 delivered-vs-cancelled", `SELECT COUNT(*) AS members,
    SUM(CASE WHEN x.customer_id IS NULL THEN 1 ELSE 0 END) AS del_only,
    SUM(CASE WHEN d.customer_id IS NULL THEN 1 ELSE 0 END) AS can_only
  FROM (SELECT DISTINCT customer_id FROM orders WHERE status='delivered') d
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM orders WHERE status='cancelled') x
    ON d.customer_id = x.customer_id`);
q("S2b lists", `SELECT c.name,
    CASE WHEN d.customer_id IS NOT NULL AND x.customer_id IS NULL THEN 'delivered-only'
         WHEN x.customer_id IS NOT NULL AND d.customer_id IS NULL THEN 'cancelled-only'
         ELSE 'both' END AS side
  FROM (SELECT DISTINCT customer_id FROM orders WHERE status='delivered') d
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM orders WHERE status='cancelled') x
    ON d.customer_id = x.customer_id
  JOIN customers c ON c.id = COALESCE(d.customer_id, x.customer_id)
  ORDER BY side, c.name`);
// S3: 2024-invoice customers vs 2025-invoice customers
q("S3 2024-vs-2025", `SELECT COUNT(*) AS members,
    SUM(CASE WHEN y.customer_id IS NULL THEN 1 ELSE 0 END) AS only24,
    SUM(CASE WHEN o4.customer_id IS NULL THEN 1 ELSE 0 END) AS only25
  FROM (SELECT DISTINCT customer_id FROM invoices WHERE issued_on >= '2024-01-01' AND issued_on < '2025-01-01') o4
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM invoices WHERE issued_on >= '2025-01-01' AND issued_on < '2026-01-01') y
    ON o4.customer_id = y.customer_id`);
q("S3b names", `SELECT c.name,
    CASE WHEN o4.customer_id IS NOT NULL AND y.customer_id IS NULL THEN '2024-only'
         WHEN y.customer_id IS NOT NULL AND o4.customer_id IS NULL THEN '2025-only'
         ELSE 'both' END AS side
  FROM (SELECT DISTINCT customer_id FROM invoices WHERE issued_on >= '2024-01-01' AND issued_on < '2025-01-01') o4
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM invoices WHERE issued_on >= '2025-01-01' AND issued_on < '2026-01-01') y
    ON o4.customer_id = y.customer_id
  JOIN customers c ON c.id = COALESCE(o4.customer_id, y.customer_id)
  ORDER BY side, c.name`);
// S4: card-paying vs wire-paying customers (payments -> invoices -> customer)
q("S4 card-vs-wire", `SELECT COUNT(*) AS members,
    SUM(CASE WHEN w.customer_id IS NULL THEN 1 ELSE 0 END) AS card_only,
    SUM(CASE WHEN cd.customer_id IS NULL THEN 1 ELSE 0 END) AS wire_only
  FROM (SELECT DISTINCT i.customer_id AS customer_id FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE p.method='card') cd
  FULL OUTER JOIN (SELECT DISTINCT i.customer_id AS customer_id FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE p.method='wire') w
    ON cd.customer_id = w.customer_id`);
q("S4b names", `SELECT c.name,
    CASE WHEN cd.customer_id IS NOT NULL AND w.customer_id IS NULL THEN 'card-only'
         WHEN w.customer_id IS NOT NULL AND cd.customer_id IS NULL THEN 'wire-only'
         ELSE 'both' END AS side
  FROM (SELECT DISTINCT i.customer_id AS customer_id FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE p.method='card') cd
  FULL OUTER JOIN (SELECT DISTINCT i.customer_id AS customer_id FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE p.method='wire') w
    ON cd.customer_id = w.customer_id
  JOIN customers c ON c.id = COALESCE(cd.customer_id, w.customer_id)
  ORDER BY side, c.name`);
// S5: order months vs invoice months
q("S5 order-months", `SELECT DISTINCT strftime('%Y-%m', created_at) AS mo FROM orders ORDER BY mo`);
q("S5b invoice-months", `SELECT DISTINCT strftime('%Y-%m', issued_on) AS mo FROM invoices ORDER BY mo`);
q("S5c month full-outer", `SELECT COUNT(*) AS members,
    SUM(CASE WHEN i.mo IS NULL THEN 1 ELSE 0 END) AS order_only_months,
    SUM(CASE WHEN o.mo IS NULL THEN 1 ELSE 0 END) AS invoice_only_months
  FROM (SELECT DISTINCT strftime('%Y-%m', created_at) AS mo FROM orders) o
  FULL OUTER JOIN (SELECT DISTINCT strftime('%Y-%m', issued_on) AS mo FROM invoices) i
    ON o.mo = i.mo`);
// S6: shipped vs pending customers
q("S6 shipped-vs-pending", `SELECT COUNT(*) AS members,
    SUM(CASE WHEN p2.customer_id IS NULL THEN 1 ELSE 0 END) AS ship_only,
    SUM(CASE WHEN s.customer_id IS NULL THEN 1 ELSE 0 END) AS pend_only
  FROM (SELECT DISTINCT customer_id FROM orders WHERE status='shipped') s
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM orders WHERE status='pending') p2
    ON s.customer_id = p2.customer_id`);
// S7: verified cross-checks for x4 shapes under LEFT/INNER consequences
q("S7 right-join tally groups", `SELECT COUNT(*) AS groups_n FROM (
  SELECT c.id FROM invoices i RIGHT JOIN customers c ON i.customer_id = c.id GROUP BY c.id)`);
q("S7b left-join tally groups", `SELECT COUNT(*) AS groups_n FROM (
  SELECT c.id FROM invoices i LEFT JOIN customers c ON i.customer_id = c.id GROUP BY c.id)`);
// S8: unpaid invoice numbers+amounts for distractor checks; invoice 2025-025 partial
q("S8 partial payment", `SELECT i.number, i.amount_cents, SUM(p.amount_cents) AS paid_cents
  FROM invoices i JOIN payments p ON p.invoice_id = i.id
  GROUP BY i.id HAVING paid_cents < i.amount_cents`);
// S9: customers with orders but no invoices — value check F7 again (exact)
q("S9 no-inv value", `SELECT c.name, ROUND(SUM(o.total),2) AS rev, COUNT(o.id) AS n
  FROM invoices i RIGHT JOIN customers c ON i.customer_id = c.id
  JOIN orders o ON o.customer_id = c.id
  WHERE i.id IS NULL GROUP BY c.id ORDER BY rev DESC`);
// S10: per-region no-invoice census for scope flips
q("S10 no-inv region EU", `SELECT COUNT(*) AS n FROM invoices i
  RIGHT JOIN customers c ON i.customer_id = c.id
  WHERE i.id IS NULL AND c.region = 'EU'`);

db.close();
