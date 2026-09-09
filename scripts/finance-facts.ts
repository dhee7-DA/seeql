// Prints every teaching fact Module 9 needs, straight from the seeded db.
// Run: bunx tsx scripts/finance-facts.ts

import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

const AS_OF = "2025-03-15";

async function q<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  return (await db.$queryRawUnsafe(sql)) as T[];
}

const money = (c: number | null) => (c === null ? "NULL" : (c / 100).toFixed(2));

async function main() {
  await resetDatabase();

  console.log("== counts ==");
  for (const t of ["invoices", "payments", "expenses", "ledger_entries"]) {
    const r = await q(`SELECT COUNT(*) AS n FROM ${t}`);
    console.log(t, Number(r[0].n));
  }

  console.log("\n== invoice status split (count, cents, dollars) ==");
  console.log(
    await q(
      `SELECT status, COUNT(*) AS n, SUM(amount_cents) AS c FROM invoices GROUP BY status ORDER BY status`,
    ).then((rows) => rows.map((r) => `${r.status}: ${r.n} · ${money(Number(r.c))}`).join("\n")),
  );

  console.log("\n== monthly invoiced revenue (non-void), with MoM growth ==");
  console.log(
    (
      await q(`
      SELECT strftime('%Y-%m', issued_on) AS mon, SUM(amount_cents) AS rev
      FROM invoices WHERE status != 'void' GROUP BY mon ORDER BY mon`)
    ).map((r) => `${r.mon}  ${money(Number(r.rev))}`).join("\n"),
  );

  console.log("\n== MoM growth % ==");
  const mons = await q<{ mon: string; rev: number }>(
    `SELECT strftime('%Y-%m', issued_on) AS mon, SUM(amount_cents) AS rev
     FROM invoices WHERE status != 'void' GROUP BY mon ORDER BY mon`,
  );
  mons.forEach((r, i) => {
    if (i === 0) return console.log(`${r.mon}  first`);
    const prev = Number(mons[i - 1].rev);
    const cur = Number(r.rev);
    console.log(`${r.mon}  ${(((cur - prev) / prev) * 100).toFixed(1)}%  (${money(prev)} -> ${money(cur)})`);
  });

  console.log("\n== trailing 3-month moving average of monthly revenue ==");
  mons.forEach((r, i) => {
    if (i < 2) return;
    const avg = (Number(mons[i].rev) + Number(mons[i - 1].rev) + Number(mons[i - 2].rev)) / 3;
    console.log(`${r.mon}  ${money(Math.round(avg * 100) / 100)}`);
  });

  console.log("\n== AR aging at AS OF (open invoices, overdue vs due date) ==");
  const aging = await q<{ customer: string; number: string; due_on: string; amt: number; ovd: number }>(
    `SELECT c.name AS customer, i.number, i.due_on, i.amount_cents - COALESCE((SELECT SUM(p.amount_cents) FROM payments p WHERE p.invoice_id = i.id), 0) AS amt,
            CAST(julianday('${AS_OF}') - julianday(i.due_on) AS INTEGER) AS ovd
     FROM invoices i JOIN customers c ON c.id = i.customer_id
     WHERE i.status = 'open' ORDER BY ovd DESC`,
  );
  for (const r of aging) console.log(`${r.number}  ${r.customer.padEnd(15)} due ${r.due_on}  overdue ${r.ovd}d  outstanding ${money(Number(r.amt))}`);
  const buckets = { current: 0, "1-30": 0, "31-60": 0, "61-90": 0, "90+": 0 };
  for (const r of aging) {
    const o = Number(r.ovd);
    const a = Number(r.amt);
    if (o <= 0) buckets.current += a;
    else if (o <= 30) buckets["1-30"] += a;
    else if (o <= 60) buckets["31-60"] += a;
    else if (o <= 90) buckets["61-90"] += a;
    else buckets["90+"] += a;
  }
  console.log("buckets (dollars):", Object.entries(buckets).map(([k, v]) => `${k}=${money(v)}`).join("  "));
  console.log("total outstanding:", money(aging.reduce((a, r) => a + Number(r.amt), 0)));

  console.log("\n== outstanding per customer (top) ==");
  console.log(
    (
      await q(`
      SELECT c.name AS customer, SUM(i.amount_cents - COALESCE((SELECT SUM(p.amount_cents) FROM payments p WHERE p.invoice_id = i.id), 0)) AS out_c
      FROM invoices i JOIN customers c ON c.id = i.customer_id
      WHERE i.status = 'open' GROUP BY c.name ORDER BY out_c DESC`)
    ).map((r) => `${r.customer}: ${money(Number(r.out_c))}`).join("\n"),
  );

  console.log("\n== paid invoices with NO payment rows (the audit catch) ==");
  console.log(
    await q(
      `SELECT i.id, i.number, i.amount_cents FROM invoices i
       WHERE i.status = 'paid' AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)`,
    ).then((rows) => rows.map((r) => `${r.number} (id ${r.id}) ${money(Number(r.amount_cents))}`).join("\n") || "none"),
  );

  console.log("\n== payments against VOID invoices (refund owed) ==");
  console.log(
    await q(
      `SELECT p.id, i.number, p.amount_cents, p.paid_on FROM payments p
       JOIN invoices i ON i.id = p.invoice_id WHERE i.status = 'void'`,
    ).then((rows) => rows.map((r) => `payment ${r.id} -> ${r.number}: ${money(Number(r.amount_cents))} on ${r.paid_on}`).join("\n") || "none"),
  );

  console.log("\n== ledger trial balance ==");
  const tb = await q<{ account: string; d: number; c: number }>(
    `SELECT account, SUM(debit_cents) AS d, SUM(credit_cents) AS c FROM ledger_entries GROUP BY account ORDER BY account`,
  );
  let td = 0,
    tc = 0;
  for (const r of tb) {
    td += Number(r.d);
    tc += Number(r.c);
    console.log(`${r.account.padEnd(20)} debit ${money(Number(r.d))}  credit ${money(Number(r.c))}  net ${money(Number(r.d) - Number(r.c))}`);
  }
  console.log(`TOTALS              debit ${money(td)}  credit ${money(tc)}  ${td === tc ? "BALANCED" : "IMBALANCE!"}`);

  console.log("\n== expense totals by month (spike hunting) ==");
  console.log(
    (
      await q(
        `SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) AS c FROM expenses GROUP BY mon ORDER BY mon`,
      )
    )
      .map((r) => `${r.mon}  ${money(Number(r.c))}`)
      .join("\n"),
  );

  console.log("\n== expense stats for the outlier lesson ==");
  const monthly = (await q<{ mon: string; c: number }>(`SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) AS c FROM expenses GROUP BY mon ORDER BY mon`)).map((r) => Number(r.c));
  const mean = monthly.reduce((a, b) => a + b, 0) / monthly.length;
  const variance = monthly.reduce((a, b) => a + (b - mean) ** 2, 0) / monthly.length;
  const sd = Math.sqrt(variance);
  console.log(`monthly mean ${money(Math.round(mean))}  population sd ${money(Math.round(sd))}  (sd/mean = ${(sd / mean).toFixed(2)})`);
  console.log(`aug 2024 spike 321000 cents -> z-score ${((321000 - mean) / sd).toFixed(2)}`);

  console.log("\n== expense totals by category ==");
  console.log(
    (
      await q(`SELECT category, COUNT(*) AS n, SUM(amount_cents) AS c FROM expenses GROUP BY category ORDER BY c DESC`)
    )
      .map((r) => `${r.category}: ${r.n} rows · ${money(Number(r.c))}`)
      .join("\n"),
  );

  console.log("\n== payment method split ==");
  console.log(
    (
      await q(`SELECT method, COUNT(*) AS n, SUM(amount_cents) AS c FROM payments GROUP BY method ORDER BY c DESC`)
    )
      .map((r) => `${r.method}: ${r.n} · ${money(Number(r.c))}`)
      .join("\n"),
  );

  console.log("\n== cash balance walk (net cash by month end, cumulative) ==");
  const walk = await q<{ mon: string; net: number }>(
    `SELECT strftime('%Y-%m', entry_date) AS mon,
            SUM(CASE WHEN account='cash' THEN debit_cents - credit_cents ELSE 0 END) AS net
     FROM ledger_entries GROUP BY mon ORDER BY mon`,
  );
  let cum = 0;
  for (const r of walk) {
    cum += Number(r.net);
    console.log(`${r.mon}  month net ${money(Number(r.net))}  cumulative ${money(cum)}`);
  }

  console.log("\n== Alice's statement (customer 1: invoices & her payments) ==");
  const alice = await q<{ kind: string; d: string; amt: number; ref: string }>(
    `SELECT 'invoice' AS kind, issued_on AS d, amount_cents AS amt, number AS ref FROM invoices WHERE customer_id = 1
     UNION ALL
     SELECT 'payment', p.paid_on, -p.amount_cents, i.number FROM payments p JOIN invoices i ON i.id = p.invoice_id JOIN customers c ON c.id = i.customer_id WHERE c.id = 1
     ORDER BY d`,
  );
  let bal = 0;
  for (const r of alice) {
    bal += Number(r.amt);
    console.log(`${r.d}  ${r.kind.padEnd(7)} ${r.ref}  ${r.amt > 0 ? "+" : ""}${money(Math.abs(Number(r.amt)))}  balance ${money(bal)}`);
  }

  console.log("\n== collections by month (payments table) ==");
  console.log(
    (
      await q(`SELECT strftime('%Y-%m', paid_on) AS mon, SUM(amount_cents) AS c, COUNT(*) AS n FROM payments GROUP BY mon ORDER BY mon`)
    )
      .map((r) => `${r.mon}  ${money(Number(r.c))}  (${r.n} payments)`)
      .join("\n"),
  );

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
