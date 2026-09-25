// Inspect the seed db via the app's own Prisma client.
import { db } from "../src/lib/db";

async function main() {
  const tables = await db.$queryRawUnsafe<Array<{ name: string }>>(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
  );
  console.log("tables:", tables.map((t) => t.name).join(", "));

  for (const tb of ["invoices", "payments", "expenses", "ledger_entries"]) {
    const n = await db.$queryRawUnsafe<Array<{ n: number }>>(`SELECT COUNT(*) AS n FROM ${tb}`);
    const cols = await db.$queryRawUnsafe<Array<{ name: string; type: string }>>(
      `PRAGMA table_info(${tb})`,
    );
    console.log(`\n${tb}: ${n[0].n} rows · ${cols.map((c) => `${c.name}:${c.type}`).join(", ")}`);
  }

  // facts the fills will cite
  const invStatus = await db.$queryRawUnsafe<Array<{ status: string; n: number; total: number }>>(
    "SELECT status, COUNT(*) n, SUM(amount_cents) total FROM invoices GROUP BY status ORDER BY status",
  );
  console.log("\ninvoice status:", invStatus);

  const payN = await db.$queryRawUnsafe<Array<{ n: number; total: number }>>(
    "SELECT COUNT(*) n, SUM(amount_cents) total FROM payments",
  );
  console.log("payments:", payN[0]);

  const expCats = await db.$queryRawUnsafe<Array<{ category: string; n: number }>>(
    "SELECT category, COUNT(*) n FROM expenses GROUP BY category ORDER BY n DESC",
  );
  console.log("expense categories:", expCats);

  const ledAcct = await db.$queryRawUnsafe<Array<{ account: string; n: number }>>(
    "SELECT account, COUNT(*) n FROM ledger_entries GROUP BY account ORDER BY account",
  );
  console.log("ledger accounts:", ledAcct);

  const ledgerBal = await db.$queryRawUnsafe<Array<{ d: number; c: number }>>(
    "SELECT SUM(debit_cents) d, SUM(credit_cents) c FROM ledger_entries",
  );
  console.log("ledger totals:", ledgerBal[0]);

  const ghost = await db.$queryRawUnsafe<Array<{ n: number }>>(
    "SELECT COUNT(*) n FROM payments p LEFT JOIN invoices i ON i.id = p.invoice_id WHERE i.id IS NULL",
  );
  console.log("payments w/o invoice (ghost):", ghost[0].n);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
