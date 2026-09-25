// Validates every daily-puzzle solution against the freshly seeded sandbox
// DB: each must run clean and return >= 1 row. Also prints the enum facts
// (invoice statuses, payment methods, ledger accounts, categories, regions,
// date spans) and dp-09 candidate cutoff counts so the bank stays honest.
//
// Run: bunx tsx scripts/validate-daily.ts

import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";
import { DAILY_PUZZLES } from "../src/lib/curriculum/daily";

async function q(sql: string): Promise<Array<Record<string, unknown>>> {
  return (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
}

async function facts() {
  const spans = await q(`SELECT
    (SELECT MIN(created_at) FROM orders) AS ord_min,
    (SELECT MAX(created_at) FROM orders) AS ord_max,
    (SELECT MIN(issued_on) FROM invoices) AS inv_min,
    (SELECT MAX(issued_on) FROM invoices) AS inv_max,
    (SELECT MIN(due_on) FROM invoices) AS due_min,
    (SELECT MAX(due_on) FROM invoices) AS due_max,
    (SELECT MIN(paid_on) FROM payments) AS pay_min,
    (SELECT MAX(paid_on) FROM payments) AS pay_max`);
  console.log("DATE SPANS", spans[0]);
  console.log("INVOICE STATUS", await q(`SELECT status, COUNT(*) n FROM invoices GROUP BY status`));
  console.log("PAY METHODS", await q(`SELECT method, COUNT(*) n, SUM(amount_cents) s FROM payments GROUP BY method`));
  console.log("LEDGER ACCOUNTS", await q(`SELECT account, COUNT(*) n FROM ledger_entries GROUP BY account`));
  console.log("EXPENSE CATS", await q(`SELECT category, COUNT(*) n, SUM(amount_cents) s FROM expenses GROUP BY category`));
  console.log("PRODUCT CATS", await q(`SELECT category, COUNT(*) n FROM products GROUP BY category`));
  console.log("REGIONS", await q(`SELECT region, COUNT(*) n FROM customers GROUP BY region`));
  console.log("SUPPLIER REGIONS", await q(`SELECT region, COUNT(*) n FROM suppliers GROUP BY region`));
  for (const cutoff of ["2024-09-01", "2024-09-15", "2024-10-01"]) {
    const r = await q(
      `SELECT COUNT(*) n FROM invoices WHERE status='open' AND due_on < '${cutoff}'`,
    );
    console.log(`dp-09 cutoff ${cutoff} →`, r[0].n, "rows");
  }
}

async function main() {
  await resetDatabase();
  await facts();

  let fails = 0;
  for (const p of DAILY_PUZZLES) {
    try {
      const rows = await q(p.solution);
      const cols = rows[0] ? Object.keys(rows[0]).join(",") : "(none)";
      const head = rows
        .slice(0, 2)
        .map((r) => JSON.stringify(Object.values(r).map((v) => (typeof v === "bigint" ? Number(v) : v))))
        .join(" | ");
      const flag = rows.length === 0 ? "⚠ EMPTY" : "ok";
      if (rows.length === 0) fails++;
      console.log(`${flag} ${p.id} [${p.skill}/${p.difficulty}] ${rows.length} rows :: ${cols}\n     ${head}`);
    } catch (e) {
      fails++;
      console.log(`FAIL ${p.id}: ${(e as Error).message.split("\n")[0]}`);
    }
  }
  console.log(fails === 0 ? `\nALL ${DAILY_PUZZLES.length} SOLUTIONS OK` : `\n${fails} FAILURES`);
  await db.$disconnect();
  process.exit(fails === 0 ? 0 : 1);
}

main();
