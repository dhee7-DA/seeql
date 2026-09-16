/// <reference types="bun-types" />
/** M6 wave-2 probe round 5 — ambiguity guards for drafted cases. */
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.m6w2-facts5.db");
const db = new Database("scripts/.m6w2-facts5.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`## ${label}`);
    console.log(JSON.stringify(rows).slice(0, 900));
  } catch (e) {
    console.log(`## ${label}\nERROR ${(e as Error).message.slice(0, 140)}`);
  }
}

// P-A: global min spender (cs-1575 NOT NULL guard)
q("P-A min spender", `SELECT c.name, ROUND(SUM(o.total),2) AS spend FROM orders o
  JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY spend ASC LIMIT 2`);
// P-B: global max single order (cs-1572 NOT NULL guard)
q("P-B max order", `SELECT c.name, total FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY total DESC LIMIT 1`);
// P-C: cs-1566 MIN/MAX guard — counts under MIN/MAX must differ from 7
q("P-C behind-MIN", `SELECT COUNT(*) AS n FROM (
  SELECT i.number FROM payments p RIGHT JOIN invoices i ON p.invoice_id = i.id
  GROUP BY i.id HAVING COALESCE(MIN(p.amount_cents), 0) < i.amount_cents)`);
q("P-C behind-MAX", `SELECT COUNT(*) AS n FROM (
  SELECT i.number FROM payments p RIGHT JOIN invoices i ON p.invoice_id = i.id
  GROUP BY i.id HAVING COALESCE(MAX(p.amount_cents), 0) < i.amount_cents)`);
// P-D: shipped∧pending both-side EU members (cs-1589/1593 NOT NULL guard)
q("P-D both EU", `SELECT COUNT(*) AS n, GROUP_CONCAT(c.name, ', ' ORDER BY c.name) AS names FROM (
  SELECT COALESCE(s.customer_id, p2.customer_id) AS member_id FROM
  (SELECT DISTINCT customer_id FROM orders WHERE status='shipped') s
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM orders WHERE status='pending') p2
    ON s.customer_id = p2.customer_id
  WHERE s.customer_id IS NOT NULL AND p2.customer_id IS NOT NULL) b
  JOIN customers c ON c.id = b.member_id WHERE c.region = 'EU'`);
// P-J: payments grouped by invoice status (cs-1571 cells)
q("P-J lane tally", `SELECT i.status, COUNT(p.id) AS pays FROM payments p
  RIGHT JOIN invoices i ON p.invoice_id = i.id GROUP BY i.status ORDER BY pays ASC`);
// P-K: single-payment invoices count (cs-1565: 6 zeros + singles = 23?)
q("P-K tally dist", `SELECT COUNT(p.id) AS n, COUNT(*) AS members FROM payments p
  RIGHT JOIN invoices i ON p.invoice_id = i.id GROUP BY i.id`);
// P-L: no-paid-invoice members (cs-1558 'paid' guard)
q("P-L no-paid members", `SELECT COUNT(*) AS n FROM invoices i
  RIGHT JOIN customers c ON i.customer_id = c.id AND i.status = 'paid'
  WHERE i.id IS NULL`);
// P-M: 2024-01 order revenue (cs-1598 cell)
q("P-M opener", `SELECT ROUND(SUM(total), 2) AS rev FROM orders WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01'`);
// P-N: both-side 2024∧2025 members in EU (cs-1585 NOT NULL guard)
q("P-N both EU 2425", `SELECT COUNT(*) AS n FROM (
  SELECT COALESCE(o4.customer_id, y.customer_id) AS member_id FROM
  (SELECT DISTINCT customer_id FROM invoices WHERE strftime('%Y', issued_on)='2024') o4
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM invoices WHERE strftime('%Y', issued_on)='2025') y
    ON o4.customer_id = y.customer_id
  WHERE o4.customer_id IS NOT NULL AND y.customer_id IS NOT NULL) b
  JOIN customers c ON c.id = b.member_id WHERE c.region = 'EU'`);
// P-O: both-side shipped∧pending NOT NULL guard for cs-1590 grid (13,5,3 vs swapped)
q("P-O grid NOTNULL", `SELECT COUNT(*) AS members,
  SUM(CASE WHEN p2.customer_id IS NOT NULL THEN 1 ELSE 0 END) AS ship_only,
  SUM(CASE WHEN s.customer_id IS NULL THEN 1 ELSE 0 END) AS pend_only
  FROM (SELECT DISTINCT customer_id FROM orders WHERE status='shipped') s
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM orders WHERE status='pending') p2
    ON s.customer_id = p2.customer_id`);
// P-P: open-vs-paid grid with 'paid' in slot (cs-1591 {3} 'paid' guard)
q("P-P grid swap", `SELECT COUNT(*) AS members,
  SUM(CASE WHEN p.customer_id IS NULL THEN 1 ELSE 0 END) AS open_only,
  SUM(CASE WHEN o.customer_id IS NULL THEN 1 ELSE 0 END) AS paid_only
  FROM (SELECT DISTINCT customer_id FROM invoices WHERE status='paid') o
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM invoices WHERE status='open') p
    ON o.customer_id = p.customer_id`);
// P-Q: void member in open set? (cs-1578 'void' guard)
q("P-Q void member", `SELECT i.customer_id, c.name FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.status = 'void'`);
// P-R: 2025-only NOT NULL variant (cs-1580 {3} NOT NULL guard) — both = 4
q("P-R 2425 both", `SELECT COUNT(*) AS n FROM
  (SELECT DISTINCT customer_id FROM invoices WHERE strftime('%Y', issued_on)='2024') o4
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM invoices WHERE strftime('%Y', issued_on)='2025') y
    ON o4.customer_id = y.customer_id
  WHERE o4.customer_id IS NOT NULL AND y.customer_id IS NOT NULL`);

db.close();
