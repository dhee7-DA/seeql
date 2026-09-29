// M2 error-claim verification round 2
// Run: npx tsx scripts/m2-error-facts2.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function probe(label: string, sql: string): Promise<void> {
  try {
    const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
    const n = rows.length === 1 && Object.keys(rows[0]).length === 1 ? String(Object.values(rows[0])[0]) : `${rows.length} rows`;
    console.log(`OK    ${label} -> ${n}`);
  } catch (e) {
    console.log(`ERR   ${label} -> ${e instanceof Error ? e.message : String(e)}`);
  }
}

async function main() {
  await resetDatabase();

  await probe("ambiguous column in self-join (bare name)", `SELECT name FROM customers a INNER JOIN customers b ON a.region = b.region`);
  await probe("ambiguous id in orders x customers", `SELECT id FROM orders o INNER JOIN customers c ON o.customer_id = c.id`);
  await probe("unknown alias", `SELECT x.name FROM customers c INNER JOIN orders o ON o.customer_id = c.id`);
  await probe("unknown column in ON", `SELECT c.name FROM customers c INNER JOIN orders o ON o.cust_id = c.id`);
  await probe("USING works", `SELECT COUNT(*) FROM orders o INNER JOIN customers c USING (id)`);
  await probe("ON c.id = c.id (always true)", `SELECT COUNT(*) FROM orders o INNER JOIN customers c ON c.id = c.id`);
  await probe("LEFT JOIN ON TRUE-ish constant", `SELECT COUNT(*) FROM customers c LEFT JOIN orders o ON 1 = 1`);
  await probe("RIGHT JOIN flipped = LEFT JOIN", `SELECT COUNT(*) FROM customers c RIGHT JOIN orders o ON o.customer_id = c.id`);
  await probe("FULL OUTER orders-customers rows", `SELECT COUNT(*) FROM orders o FULL OUTER JOIN customers c ON o.customer_id = c.id`);
  await probe("anti-join via NOT IN empty subquery", `SELECT COUNT(*) FROM customers c WHERE c.id NOT IN (SELECT customer_id FROM orders)`);
  await probe("LEFT JOIN LATERAL? (not in sqlite)", `SELECT * FROM customers c LEFT JOIN LATERAL (SELECT 1) x ON true`);
  await probe("FULL OUTER with IS NULL both sides", `SELECT COUNT(*) FROM invoices i FULL OUTER JOIN payments pay ON pay.invoice_id = i.id WHERE i.id IS NULL OR pay.id IS NULL`);
  await probe("COUNT(*) in LEFT JOIN pending (22)", `SELECT COUNT(*) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'`);
  await probe("RIGHT JOIN pending in ON", `SELECT COUNT(*) FROM orders o RIGHT JOIN customers c ON o.customer_id = c.id AND o.status = 'pending'`);
  await probe("FULL OUTER pending in ON", `SELECT COUNT(*) FROM customers c FULL OUTER JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'`);
  await probe("self-join same active flag pairs", `SELECT COUNT(*) FROM customers a INNER JOIN customers b ON a.active = b.active AND a.id < b.id`);
  await probe("same price decoy pairs", `SELECT COUNT(*) FROM products a INNER JOIN products b ON a.price = b.price AND a.id < b.id`);
  await probe("cross join pair with self (a=b)", `SELECT COUNT(*) FROM products a INNER JOIN products b ON a.id = b.id`);
  await probe("LEFT JOIN two conditions both columns", `SELECT COUNT(*) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.total > 500`);
  await probe("distinct customers with big orders", `SELECT COUNT(DISTINCT c.id) FROM customers c INNER JOIN orders o ON o.customer_id = c.id WHERE o.total > 500`);
  await probe("orders total > 500 count", `SELECT COUNT(*) n FROM orders WHERE total > 500`);
  await probe("EU unshipped via left join compound", `SELECT COUNT(*) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.shipped_at IS NULL WHERE o.id IS NOT NULL AND c.region = 'EU'`);
  await probe("2-payment invoices count", `SELECT COUNT(*) FROM invoices i INNER JOIN payments pay ON pay.invoice_id = i.id GROUP BY i.id HAVING COUNT(pay.id) = 2`);
  await probe("invoices grouped 2-payments rows", `SELECT * FROM (SELECT i.number, COUNT(pay.id) np FROM invoices i LEFT JOIN payments pay ON pay.invoice_id = i.id GROUP BY i.id) WHERE np = 2`);
}

main().catch((e) => { console.error(e); process.exit(1); });
