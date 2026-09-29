// Probe: top payment coverage percentages.
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function main() {
  await resetDatabase();
  const rows = (await db.$queryRawUnsafe(
    `SELECT i.number AS number, ROUND(pay.amount_cents * 100.0 / i.amount_cents, 0) AS pct FROM payments pay JOIN invoices i ON pay.invoice_id = i.id ORDER BY pct ASC LIMIT 8`,
  )) as Array<Record<string, unknown>>;
  console.log("bottom coverages:", JSON.stringify(rows, (_, v) => (typeof v === "bigint" ? Number(v) : v)));
  const n = (await db.$queryRawUnsafe(
    `SELECT COUNT(*) AS n FROM payments pay JOIN invoices i ON pay.invoice_id = i.id WHERE pay.amount_cents >= i.amount_cents * 0.95`,
  )) as Array<Record<string, unknown>>;
  console.log("count >= 95%:", JSON.stringify(n, (_, v) => (typeof v === "bigint" ? Number(v) : v)));
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
