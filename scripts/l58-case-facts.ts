// Truth probe for the L58 case study (M9 finance capstone): the close pack.
// Probes every number the lesson prose, figures and problem briefs will claim.
// READ-ONLY against the DB.
import { PrismaClient } from "@prisma/client";
import { resetDatabase } from "../src/lib/sample-db";

const db = new PrismaClient({ log: [] });

const q = async (label: string, sql: string) => {
  const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  const clean = JSON.parse(JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? Number(v) : typeof v === "number" ? Math.round(v * 100) / 100 : v)));
  console.log(`${label}: ${JSON.stringify(clean)}`);
};

async function main() {
  await resetDatabase();

  // ---- p3: collections forecast — open AR by due month
  await q("p3.forecast", `SELECT SUBSTR(due_on, 1, 7) AS due_mon, COUNT(*) AS n, ROUND(SUM(amount_cents) / 100.0, 2) AS due_dollars FROM invoices WHERE status = 'open' GROUP BY due_mon ORDER BY due_mon`);

  // ---- p1 cash curve: collections by month with LAG + growth
  await q("p1.cash", `SELECT mon, ROUND(collected / 100.0, 2) AS collected, ROUND(prev / 100.0, 2) AS prev, CASE WHEN prev IS NULL THEN NULL ELSE ROUND(100.0 * (collected - prev) / prev, 1) END AS pct FROM (
    SELECT strftime('%Y-%m', paid_on) AS mon, SUM(amount_cents) AS collected,
      LAG(SUM(amount_cents)) OVER (ORDER BY strftime('%Y-%m', paid_on)) AS prev
    FROM payments GROUP BY mon
  ) ORDER BY mon`);

  // ---- p2 customer rollforward: billed / collected / net
  await q("p2.rollforward", `SELECT c.name, ROUND(SUM(DISTINCT 0) / 100.0, 2) AS skip FROM customers c WHERE 1=0`);
  await q("p2.billed", `SELECT c.name, ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.status != 'void' GROUP BY c.id ORDER BY c.name`);
  await q("p2.collected", `SELECT c.name, ROUND(SUM(p.amount_cents) / 100.0, 2) AS collected FROM payments p JOIN invoices i ON i.id = p.invoice_id JOIN customers c ON c.id = i.customer_id GROUP BY c.id ORDER BY c.name`);
  await q("p2.rollforward_full", `SELECT c.name,
    ROUND((SELECT SUM(i.amount_cents) FROM invoices i WHERE i.customer_id = c.id AND i.status != 'void') / 100.0, 2) AS billed,
    ROUND(COALESCE((SELECT SUM(p.amount_cents) FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.customer_id = c.id), 0) / 100.0, 2) AS collected,
    ROUND(((SELECT SUM(i.amount_cents) FROM invoices i WHERE i.customer_id = c.id AND i.status != 'void') - COALESCE((SELECT SUM(p.amount_cents) FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.customer_id = c.id), 0)) / 100.0, 2) AS net_owed
  FROM customers c
  WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id AND i.status != 'void')
  ORDER BY net_owed DESC, c.name`);

  // ---- p4 tie-out: open_ar vs ledger_ar vs gap; ghost & void decomposition
  await q("p4.tieout", `SELECT
    ROUND((SELECT SUM(i.amount_cents - COALESCE((SELECT SUM(p.amount_cents) FROM payments p WHERE p.invoice_id = i.id), 0)) FROM invoices i WHERE i.status = 'open') / 100.0, 2) AS open_ar,
    ROUND((SELECT SUM(debit_cents) - SUM(credit_cents) FROM ledger_entries WHERE account = 'accounts_receivable') / 100.0, 2) AS ledger_ar,
    ROUND(((SELECT SUM(debit_cents) - SUM(credit_cents) FROM ledger_entries WHERE account = 'accounts_receivable') - (SELECT SUM(i.amount_cents - COALESCE((SELECT SUM(p.amount_cents) FROM payments p WHERE p.invoice_id = i.id), 0)) FROM invoices i WHERE i.status = 'open')) / 100.0, 2) AS gap`);
  await q("p4.ghost", `SELECT number, ROUND(amount_cents / 100.0, 2) AS amount FROM invoices i WHERE status = 'paid' AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)`);
  await q("p4.voidpay", `SELECT i.number, ROUND(p.amount_cents / 100.0, 2) AS refund FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.status = 'void'`);
  await q("p4.ledger_ar_legs", `SELECT COUNT(*) AS legs, ROUND(SUM(debit_cents) / 100.0, 2) AS debits, ROUND(SUM(credit_cents) / 100.0, 2) AS credits FROM ledger_entries WHERE account = 'accounts_receivable'`);

  // ---- p5 exposure league: per-customer net with CUME_DIST share of exposure
  await q("p5.league", `SELECT name, net, ROUND(CUME_DIST() OVER (ORDER BY net), 3) AS cd FROM (
    SELECT c.name AS name,
      (SELECT SUM(i.amount_cents) FROM invoices i WHERE i.customer_id = c.id AND i.status != 'void')
      - COALESCE((SELECT SUM(p.amount_cents) FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.customer_id = c.id), 0) AS net
    FROM customers c
    WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id AND i.status != 'void')
  ) ORDER BY net DESC, name`);
  await q("p5.top3share", `SELECT ROUND(SUM(net) / (SELECT SUM(net) FROM (
    SELECT (SELECT SUM(i.amount_cents) FROM invoices i WHERE i.customer_id = c.id AND i.status != 'void')
      - COALESCE((SELECT SUM(p.amount_cents) FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.customer_id = c.id), 0) AS net
    FROM customers c
    WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id AND i.status != 'void')
  )) * 100.0, 1) AS top3_pct FROM (
    SELECT c.name AS name,
      (SELECT SUM(i.amount_cents) FROM invoices i WHERE i.customer_id = c.id AND i.status != 'void')
      - COALESCE((SELECT SUM(p.amount_cents) FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.customer_id = c.id), 0) AS net
    FROM customers c
    WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id AND i.status != 'void')
    ORDER BY net DESC LIMIT 3
  )`);

  // ---- figure 3: cash vs booked monthly (for the two-panel figure)
  await q("fig3.revenue", `SELECT strftime('%Y-%m', issued_on) AS mon, ROUND(SUM(amount_cents) / 100.0, 2) AS rev FROM invoices WHERE status != 'void' GROUP BY mon ORDER BY mon`);
  await q("fig3.cash", `SELECT strftime('%Y-%m', paid_on) AS mon, ROUND(SUM(amount_cents) / 100.0, 2) AS cash FROM payments GROUP BY mon ORDER BY mon`);

  // ---- open invoice detail (for prose claims)
  await q("detail.open", `SELECT i.number, c.name, ROUND(i.amount_cents / 100.0, 2) AS amount, i.due_on FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.status = 'open' ORDER BY i.due_on`);

  await db.$disconnect();
}

main();
