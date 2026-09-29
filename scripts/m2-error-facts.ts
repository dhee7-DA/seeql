// M2 error-claim verification — every "this fails with X" MCQ claim gets an engine receipt.
// Run: npx tsx scripts/m2-error-facts.ts
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

  await probe("LEFT JOIN without ON", `SELECT c.name FROM customers c LEFT JOIN orders`);
  await probe("CROSS JOIN with ON", `SELECT COUNT(*) FROM products a CROSS JOIN products b ON a.id = b.id`);
  await probe("bare JOIN without ON (cartesian?)", `SELECT COUNT(*) FROM suppliers s JOIN products p`);
  await probe("RIGHT JOIN without ON", `SELECT c.name FROM orders o RIGHT JOIN customers c`);
  await probe("FULL OUTER without ON", `SELECT c.id FROM customers c FULL OUTER JOIN orders`);
  await probe("same-supplier product pairs any-category", `SELECT COUNT(*) FROM products a INNER JOIN products b ON a.supplier_id = b.supplier_id AND a.id < b.id`);
  await probe("CROSS + WHERE = inner semantics", `SELECT COUNT(*) FROM products a CROSS JOIN products b WHERE a.supplier_id = b.supplier_id AND a.id < b.id`);
  await probe("orders x order_items cartesian", `SELECT COUNT(*) FROM orders o JOIN order_items oi`);
  await probe("LEFT JOIN pending HAVING COUNT=0", `SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' GROUP BY c.id HAVING COUNT(o.id) = 0`);
  await probe("RIGHT JOIN compound ON", `SELECT COUNT(*) FROM invoices i RIGHT JOIN payments pay ON pay.invoice_id = i.id AND i.status = 'paid'`);
  await probe("FULL OUTER with WHERE on right col", `SELECT COUNT(*) FROM invoices i FULL OUTER JOIN payments pay ON pay.invoice_id = i.id WHERE i.status = 'paid'`);
  await probe("unpaid count via right-join IS NULL", `SELECT COUNT(*) FROM payments pay RIGHT JOIN invoices i ON pay.invoice_id = i.id WHERE pay.id IS NULL`);
  await probe("orders same customer diff status pairs", `SELECT COUNT(*) FROM orders a INNER JOIN orders b ON a.customer_id = b.customer_id AND a.status <> b.status AND a.id < b.id`);
  await probe("self-join no dedupe (all ordered pairs same region)", `SELECT COUNT(*) FROM customers a INNER JOIN customers b ON a.region = b.region`);
  await probe("LEFT JOIN chain items->orders->customers rows", `SELECT COUNT(*) FROM order_items oi LEFT JOIN orders o ON o.id = oi.order_id LEFT JOIN customers c ON c.id = o.customer_id`);
  await probe("sum per customer with compound ON pending", `SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' GROUP BY c.id`);
  await probe("SUM over no-match group is NULL?", `SELECT c.name, SUM(o.total) s FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled' GROUP BY c.id ORDER BY s LIMIT 3`);
  await probe("no-cancelled roster", `SELECT GROUP_CONCAT(c.name, ' | ') v FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled' WHERE o.id IS NULL`);
  await probe("RIGHT JOIN keeps right dupes", `SELECT COUNT(*) FROM payments pay RIGHT JOIN invoices i ON pay.invoice_id = i.id`);
  await probe("cross via comma syntax", `SELECT COUNT(*) FROM products a, products b`);
  await probe("products never ordered NOT EXISTS", `SELECT COUNT(*) n FROM products p WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id)`);
  await probe("customers who never ordered anything NOT EXISTS", `SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`);
  await probe("never shipped NOT EXISTS", `SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.shipped_at IS NOT NULL)`);
  await probe("never pending NOT EXISTS", `SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending')`);
  await probe("cork/berlin pairs", `SELECT COUNT(*) FROM customers a INNER JOIN customers b ON a.city = b.city AND a.id < b.id`);
  await probe("EU pending count via join", `SELECT COUNT(*) FROM orders o INNER JOIN customers c ON c.id = o.customer_id WHERE c.region = 'EU' AND o.status = 'pending'`);
  await probe("products priced under 25 cross products under 25", `SELECT COUNT(*) FROM products a CROSS JOIN products b WHERE a.price < 25 AND b.price < 25`);
  await probe("products under 25 count", `SELECT COUNT(*) n FROM products WHERE price < 25`);
  await probe("Audio products x Audio products", `SELECT COUNT(*) FROM products a CROSS JOIN products b WHERE a.category = 'Audio' AND b.category = 'Audio'`);
  await probe("supplier self pairs distinct suppliers", `SELECT COUNT(DISTINCT s1.id) FROM suppliers s1 INNER JOIN suppliers s2 ON s1.region = s2.region AND s1.id < s2.id`);
  await probe("supplier same-region pairs", `SELECT COUNT(*) FROM suppliers s1 INNER JOIN suppliers s2 ON s1.region = s2.region AND s1.id < s2.id`);
  await probe("orders joined to pending-on-on then where IS NOT NULL", `SELECT COUNT(*) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.id IS NOT NULL`);
}

main().catch((e) => { console.error(e); process.exit(1); });
