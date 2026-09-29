// M2 hard-case + non-equi bank facts, round 2.
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q(sql: string): Promise<Array<Record<string, unknown>>> {
  return db.$queryRawUnsafe(sql);
}

async function main() {
  await resetDatabase();

  console.log("== S1. full same-category cheaper→pricier list (expect 12) ==");
  console.log(await q(`SELECT a.name AS cheaper, a.price AS lo, b.name AS pricier, b.price AS hi FROM products a JOIN products b ON a.category = b.category AND a.price < b.price ORDER BY a.price`));

  console.log("== S2. argmax per supplier via non-equi anti-join ==");
  console.log(await q(`SELECT s.name AS supplier, a.name AS flagship, a.price FROM suppliers s JOIN products a ON a.supplier_id = s.id LEFT JOIN products b ON b.supplier_id = a.supplier_id AND b.price > a.price WHERE b.id IS NULL ORDER BY a.price DESC`));

  console.log("== S3. big orders (>=500) per region ==");
  console.log(await q(`SELECT c.region, COUNT(*) AS n FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.total >= 500 GROUP BY c.region ORDER BY n DESC`));

  console.log("== S4. payment sums per method ==");
  console.log(await q(`SELECT pay.method, COUNT(*) AS n, SUM(pay.amount_cents) / 100.0 AS paid FROM payments pay JOIN invoices i ON pay.invoice_id = i.id GROUP BY pay.method ORDER BY paid DESC`));

  console.log("== S5. same-product different line-price pairs ==");
  console.log(await q(`SELECT COUNT(*) AS n FROM order_items x JOIN order_items y ON x.product_id = y.product_id AND x.id < y.id AND x.unit_price < y.unit_price`));
  console.log(await q(`SELECT p.name, x.unit_price AS lo, y.unit_price AS hi FROM order_items x JOIN order_items y ON x.product_id = y.product_id AND x.id < y.id AND x.unit_price < y.unit_price JOIN products p ON p.id = x.product_id ORDER BY hi - lo DESC LIMIT 5`));

  console.log("== S6. same signup-month customer pairs ==");
  console.log(await q(`SELECT COUNT(*) AS n FROM customers a JOIN customers b ON strftime('%Y-%m', a.created_at) = strftime('%Y-%m', b.created_at) AND a.id < b.id`));

  console.log("== S7. overpaid lines (payment > invoice amount) ==");
  console.log(await q(`SELECT COUNT(*) AS n FROM payments pay JOIN invoices i ON pay.invoice_id = i.id WHERE pay.amount_cents > i.amount_cents`));

  console.log("== S8. double-paid invoices ==");
  console.log(await q(`SELECT i.number, COUNT(pay.id) AS n FROM invoices i JOIN payments pay ON pay.invoice_id = i.id GROUP BY i.id HAVING COUNT(pay.id) >= 2 ORDER BY i.id`));

  console.log("== S9. no pending AND no cancelled customers (two-sided anti) ==");
  console.log(await q(`SELECT c.name FROM customers c LEFT JOIN orders p ON p.customer_id = c.id AND p.status = 'pending' LEFT JOIN orders x ON x.customer_id = c.id AND x.status = 'cancelled' WHERE p.id IS NULL AND x.id IS NULL ORDER BY c.name`));

  console.log("== S10. closest price pair overall ==");
  console.log(await q(`SELECT a.name AS lo_name, b.name AS hi_name, ROUND(b.price - a.price, 2) AS gap FROM products a JOIN products b ON b.price > a.price ORDER BY gap ASC LIMIT 3`));

  console.log("== S11. next-price-up join count sanity (15 products have a pricier one) ==");
  console.log(await q(`SELECT COUNT(*) AS products_with_next FROM products a JOIN products b ON b.price > a.price GROUP BY a.id`));

  console.log("== S12. nearest higher: verify Yoga→Mouse pair ==");
  console.log(await q(`SELECT a.name AS product, MIN(b.price) AS next_up FROM products a JOIN products b ON b.price > a.price AND a.category = 'Fitness' GROUP BY a.id`));

  console.log("== S13. same-region both-active pairs (expect 28) ==");
  console.log(await q(`SELECT COUNT(*) AS n FROM customers a JOIN customers b ON a.region = b.region AND a.id < b.id WHERE a.active = 1 AND b.active = 1`));

  console.log("== S14. delivered EU revenue ==");
  console.log(await q(`SELECT ROUND(SUM(o.total), 2) AS rev FROM orders o JOIN customers c ON o.customer_id = c.id WHERE c.region = 'EU' AND o.status = 'delivered'`));

  console.log("== S15. non-equi bank problem drafts (run each) ==");
  const drafts: Array<[string, string]> = [
    ["ne-p01", `SELECT a.name AS cheaper, b.name AS pricier, ROUND(b.price - a.price, 2) AS gap FROM products a JOIN products b ON a.category = b.category AND a.price < b.price ORDER BY gap DESC, cheaper ASC;`],
    ["ne-p02", `SELECT a.name AS product, COUNT(b.id) AS pricier_peers FROM products a LEFT JOIN products b ON b.category = a.category AND b.price > a.price GROUP BY a.id ORDER BY pricier_peers ASC, product ASC;`],
    ["ne-p03", `SELECT s.name AS supplier, a.name AS flagship, a.price FROM suppliers s JOIN products a ON a.supplier_id = s.id LEFT JOIN products b ON b.supplier_id = a.supplier_id AND b.price > a.price WHERE b.id IS NULL ORDER BY a.price DESC, s.name ASC;`],
    ["ne-p04", `SELECT a.name AS customer_a, b.name AS customer_b, ROUND(ABS(a.spend - b.spend), 2) AS gap FROM (SELECT c.id, c.name, c.region, COALESCE(SUM(o.total), 0) AS spend FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id) a JOIN (SELECT c.id, c.name, c.region, COALESCE(SUM(o.total), 0) AS spend FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id) b ON a.region = b.region AND a.id < b.id WHERE ABS(a.spend - b.spend) >= 1000 ORDER BY gap DESC;`],
    ["ne-p05", `SELECT a.name AS earlier, b.name AS later, ROUND(b.price - a.price, 2) AS step_up FROM products a JOIN products b ON b.price > a.price WHERE (b.price - a.price) = (SELECT MIN(...) )`],
  ];
  for (const [id, sql] of drafts) {
    if (sql.includes("(SELECT MIN(")) { console.log(`SKIP ${id} (draft placeholder)`); continue; }
    try {
      const rows = await q(sql);
      console.log(`OK   ${id}  ${rows.length} rows`);
    } catch (e) {
      console.log(`FAIL ${id}  ${e instanceof Error ? e.message.slice(0, 120) : e}`);
    }
  }

  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
