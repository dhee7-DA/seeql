import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";
async function q(sql: string): Promise<Array<Record<string, unknown>>> { return db.$queryRawUnsafe(sql); }
async function main() {
  await resetDatabase();
  console.log(JSON.stringify(await q(`SELECT a.number AS invoice_a, b.number AS invoice_b, ROUND((b.amount_cents - a.amount_cents) / 100.0, 2) AS drift, ROUND((b.amount_cents - a.amount_cents) / 100.0, 1) AS drift1 FROM invoices a JOIN invoices b ON a.customer_id = b.customer_id AND a.id < b.id AND b.amount_cents BETWEEN a.amount_cents AND a.amount_cents * 1.1 ORDER BY drift DESC`), (_, v) => typeof v === "bigint" ? Number(v) : v));
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
