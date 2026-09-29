import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";
async function q(sql: string): Promise<Array<Record<string, unknown>>> { return db.$queryRawUnsafe(sql); }
async function main() {
  await resetDatabase();
  const P = async (label: string, sql: string) => {
    try { console.log(`== ${label} == ${JSON.stringify(await q(sql), (_, v) => typeof v === "bigint" ? Number(v) : v)}`); }
    catch (e) { console.log(`== ${label} == ERROR: ${e instanceof Error ? e.message.slice(0, 140) : e}`); }
  };
  await P("N14 order pairs >= 3x", `SELECT COUNT(*) AS n FROM orders a JOIN orders b ON a.id < b.id AND (a.total >= 3 * b.total OR b.total >= 3 * a.total)`);
  await P("N15 order pairs >= 1.5x", `SELECT COUNT(*) AS n FROM orders a JOIN orders b ON a.id < b.id AND (a.total >= 1.5 * b.total OR b.total >= 1.5 * a.total)`);
  await P("N17 order total diffs exactly 50", `SELECT COUNT(*) AS n FROM orders a JOIN orders b ON a.id < b.id AND ABS(a.total - b.total) = 50`);
  await P("N17b order total diffs <= 25", `SELECT COUNT(*) AS n FROM orders a JOIN orders b ON a.id < b.id AND ABS(a.total - b.total) <= 25`);
  await P("N20 payments exactly half invoice", `SELECT COUNT(*) AS n FROM payments pay JOIN invoices i ON pay.invoice_id = i.id WHERE pay.amount_cents * 2 = i.amount_cents`);
  await P("N20b payments exactly full invoice", `SELECT COUNT(*) AS n FROM payments pay JOIN invoices i ON pay.invoice_id = i.id WHERE pay.amount_cents = i.amount_cents`);
  await P("N29a supplier pairs rating diff = 0.5", `SELECT COUNT(*) AS n FROM suppliers a JOIN suppliers b ON a.id < b.id AND ABS(a.rating - b.rating) = 0.5`);
  await P("N29b supplier pairs rating diff > 0.5", `SELECT COUNT(*) AS n FROM suppliers a JOIN suppliers b ON a.id < b.id AND ABS(a.rating - b.rating) > 0.5`);
  await P("N29c supplier pairs rating diff >= 0.5", `SELECT COUNT(*) AS n FROM suppliers a JOIN suppliers b ON a.id < b.id AND ABS(a.rating - b.rating) >= 0.5`);
  await P("N25 orders total < 100", `SELECT COUNT(*) AS n FROM orders WHERE total < 100`);
  await P("N26 customers with 100-300 orders", `SELECT COUNT(DISTINCT c.id) AS n FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.total BETWEEN 100 AND 300`);
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
