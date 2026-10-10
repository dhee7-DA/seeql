// Truth probe for the M9 batch-2 figure fleet (fin1b, fin1c, fin2b, fin2c, fin3b, fin3c, fin4b, fin4c, fin5b, fin5c, fin6b, fin6c).
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

  // fin1b — status census
  await q("fin1b.status", `SELECT status, COUNT(*) AS n, ROUND(SUM(amount_cents) / 100.0, 2) AS total FROM invoices GROUP BY status ORDER BY status`);
  await q("fin1b.count", `SELECT COUNT(*) AS n FROM invoices`);

  // fin1c — cents conversion
  await q("fin1c.first3", `SELECT number, amount_cents, ROUND(amount_cents / 100.0, 2) AS dollars FROM invoices ORDER BY id LIMIT 3`);

  // fin2b — Alice's statement walk
  await q("fin2b.alice", `WITH events AS (
    SELECT issued_on AS d, amount_cents / 100.0 AS amt, 'invoice' AS kind FROM invoices WHERE customer_id = 1
    UNION ALL
    SELECT paid_on, -amount_cents / 100.0, 'payment' FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.customer_id = 1
  ), walked AS (
    SELECT d, kind, amt, ROUND(SUM(amt) OVER (ORDER BY d, kind), 2) AS bal FROM events
  ) SELECT COUNT(*) AS events, MIN(bal) AS lo, MAX(bal) AS hi, (SELECT bal FROM walked ORDER BY d DESC, kind DESC LIMIT 1) AS final FROM walked`);

  // fin3b — aging as of pin
  await q("fin3b.top-open", `SELECT i.number, ROUND((i.amount_cents - COALESCE((SELECT SUM(p.amount_cents) FROM payments p WHERE p.invoice_id = i.id), 0)) / 100.0, 2) AS outstanding FROM invoices i WHERE i.status = 'open' ORDER BY outstanding DESC LIMIT 2`);

  // fin3c — bucket ladder as of 2025-03-15
  await q("fin3c.ladder", `SELECT CASE
      WHEN days_late <= 0 THEN 'a'
      WHEN days_late <= 30 THEN 'b'
      WHEN days_late <= 60 THEN 'c'
      WHEN days_late <= 90 THEN 'd'
      ELSE 'e' END AS bucket, COUNT(*) AS n, ROUND(SUM(outstanding) / 100.0, 2) AS total
    FROM (
      SELECT i.due_on,
        CAST(julianday('2025-03-15') - julianday(i.due_on) AS INT) AS days_late,
        i.amount_cents - COALESCE((SELECT SUM(p.amount_cents) FROM payments p WHERE p.invoice_id = i.id), 0) AS outstanding
      FROM invoices i WHERE i.status = 'open'
    ) GROUP BY bucket ORDER BY bucket`);

  // fin4b — monthly revenue extremes for growth bridge
  await q("fin4b.extremes", `WITH monthly AS (SELECT strftime('%Y-%m', issued_on) AS mon, SUM(amount_cents) AS rev FROM invoices WHERE status != 'void' GROUP BY mon)
    SELECT mon, ROUND(rev / 100.0, 2) AS rev FROM monthly ORDER BY rev DESC LIMIT 1`);
  await q("fin4b.trough", `WITH monthly AS (SELECT strftime('%Y-%m', issued_on) AS mon, SUM(amount_cents) AS rev FROM invoices WHERE status != 'void' GROUP BY mon)
    SELECT mon, ROUND(rev / 100.0, 2) AS rev FROM monthly ORDER BY rev ASC LIMIT 1`);
  await q("fin4b.jan", `WITH monthly AS (SELECT strftime('%Y-%m', issued_on) AS mon, SUM(amount_cents) AS rev FROM invoices WHERE status != 'void' GROUP BY mon)
    SELECT mon, ROUND(rev / 100.0, 2) AS rev, ROUND(LAG(rev) OVER (ORDER BY mon) / 100.0, 2) AS prev FROM monthly ORDER BY mon LIMIT 3`);

  // fin5c — the two catches
  await q("fin5c.catch1", `SELECT i.number, ROUND(i.amount_cents / 100.0, 2) AS amount FROM invoices i WHERE i.status = 'paid' AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)`);
  await q("fin5c.catch2", `SELECT i.number, p.paid_on, ROUND(p.amount_cents / 100.0, 2) AS amount FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.status = 'void'`);

  // fin6b — CUME_DIST top of the distribution
  await q("fin6b.cume", `SELECT number, ROUND(amount_cents / 100.0, 2) AS amount, ROUND(CUME_DIST() OVER (ORDER BY amount_cents), 3) AS cd FROM invoices WHERE status != 'void' ORDER BY amount_cents DESC LIMIT 3`);

  // fin6c — z-score of the worst month
  await q("fin6c.stats", `WITH monthly AS (SELECT strftime('%Y-%m', issued_on) AS mon, SUM(amount_cents) AS spend FROM monthly_expenses GROUP BY mon),
    stats AS (SELECT AVG(spend) AS a, COUNT(*) AS n FROM monthly), newton AS (SELECT 0 AS g UNION ALL SELECT g + 1 FROM newton WHERE g < 29)
    SELECT ROUND(a / 100.0, 2) AS mean, ROUND((SELECT spend FROM monthly WHERE mon = '2024-08') / 100.0, 2) AS aug, n AS samples FROM stats`);

  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
