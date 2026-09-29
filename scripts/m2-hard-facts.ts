// M2 hard-case + non-equi-bank facts: probe every figure BEFORE writing items.
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q(sql: string): Promise<Array<Record<string, unknown>>> {
  return db.$queryRawUnsafe(sql);
}

async function main() {
  await resetDatabase();

  console.log("== A. same-category cheaper→pricier pairs (12) ==");
  console.log(await q(`SELECT a.name AS cheaper, b.name AS pricier, ROUND(b.price - a.price, 2) AS diff FROM products a JOIN products b ON a.category = b.category AND a.id < b.id AND a.price < b.price ORDER BY diff DESC`));

  console.log("== B. cross-category cheaper→pricier pairs (any category) count ==");
  console.log(await q(`SELECT COUNT(*) AS n FROM products a JOIN products b ON a.price < b.price`));

  console.log("== C. price bands: entry 0-30, core 30-60, pro 60-120, elite 120+ ==");
  console.log(await q(`SELECT CASE WHEN p.price < 30 THEN 'entry' WHEN p.price < 60 THEN 'core' WHEN p.price < 120 THEN 'pro' ELSE 'elite' END AS band, COUNT(*) AS n FROM products p GROUP BY band ORDER BY n DESC`));

  console.log("== D. spend-per-customer: gap pairs >= thresholds (same-region) ==");
  console.log(await q(`SELECT COUNT(*) AS pairs_ge_1000 FROM (SELECT c.id, c.name, c.region, COALESCE(SUM(o.total),0) AS spend FROM customers c LEFT JOIN orders o ON o.customer_id=c.id GROUP BY c.id) a JOIN (SELECT c.id, c.name, c.region, COALESCE(SUM(o.total),0) AS spend FROM customers c LEFT JOIN orders o ON o.customer_id=c.id GROUP BY c.id) b ON a.id < b.id AND a.region = b.region WHERE ABS(a.spend-b.spend) >= 1000`));
  console.log(await q(`SELECT a.name AS na, b.name AS nb, ROUND(a.spend,2) AS sa, ROUND(b.spend,2) AS sb, ROUND(ABS(a.spend-b.spend),2) AS gap FROM (SELECT c.id, c.name, c.region, COALESCE(SUM(o.total),0) AS spend FROM customers c LEFT JOIN orders o ON o.customer_id=c.id GROUP BY c.id) a JOIN (SELECT c.id, c.name, c.region, COALESCE(SUM(o.total),0) AS spend FROM customers c LEFT JOIN orders o ON o.customer_id=c.id GROUP BY c.id) b ON a.id < b.id AND a.region=b.region WHERE ABS(a.spend-b.spend) >= 1000 ORDER BY gap DESC LIMIT 6`));

  console.log("== E. order totals BETWEEN buckets ==");
  console.log(await q(`SELECT COUNT(*) AS ge_500 FROM orders WHERE total >= 500`));
  console.log(await q(`SELECT COUNT(*) AS b_100_300 FROM orders WHERE total BETWEEN 100 AND 300`));
  console.log(await q(`SELECT COUNT(*) AS b_300_600 FROM orders WHERE total BETWEEN 300 AND 600`));
  console.log(await q(`SELECT MIN(total) AS mn, ROUND(MAX(total),2) AS mx FROM orders`));

  console.log("== F. invoice amount ranges ==");
  console.log(await q(`SELECT COUNT(*) AS n, ROUND(MIN(amount_cents)/100.0,2) AS mn, ROUND(MAX(amount_cents)/100.0,2) AS mx FROM invoices`));
  console.log(await q(`SELECT COUNT(*) AS b_1000_2000 FROM invoices WHERE amount_cents BETWEEN 100000 AND 200000`));
  console.log(await q(`SELECT COUNT(*) AS ge_2000 FROM invoices WHERE amount_cents >= 200000`));

  console.log("== G. expense amounts ==");
  console.log(await q(`SELECT category, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS total FROM expenses GROUP BY category ORDER BY total DESC`));
  console.log(await q(`SELECT COUNT(*) AS ge_500 FROM expenses WHERE amount_cents >= 50000`));
  console.log(await q(`SELECT COUNT(*) AS b_100_500 FROM expenses WHERE amount_cents BETWEEN 10000 AND 50000`));

  console.log("== H. 'next pricier product' (classic non-equi: nearest higher price) ==");
  console.log(await q(`SELECT a.name AS product, MIN(b.price) AS next_up FROM products a JOIN products b ON b.price > a.price GROUP BY a.id ORDER BY next_up ASC`));

  console.log("== I. products per supplier with price range (join supplier → agg) ==");
  console.log(await q(`SELECT s.name, COUNT(p.id) AS n, MIN(p.price) AS lo, MAX(p.price) AS hi FROM suppliers s JOIN products p ON p.supplier_id = s.id GROUP BY s.id ORDER BY n DESC, s.name ASC`));

  console.log("== J. same-supplier cheaper→pricier (non-equi + equality mix) ==");
  console.log(await q(`SELECT COUNT(*) AS n FROM products a JOIN products b ON a.supplier_id = b.supplier_id AND a.id < b.id AND a.price < b.price`));

  console.log("== K. order-month self pairs: same customer orders in same month ==");
  console.log(await q(`SELECT COUNT(*) AS same_month_pairs FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND a.id < b.id AND strftime('%Y-%m', a.created_at) = strftime('%Y-%m', b.created_at)`));

  console.log("== L. FULL OUTER invoices/payments unmatched rows ==");
  console.log(await q(`SELECT i.number, pay.id AS pay_id FROM invoices i LEFT JOIN payments pay ON pay.invoice_id = i.id WHERE pay.id IS NULL`));

  console.log("== M. RIGHT JOIN payments→invoices: matched count ==");
  console.log(await q(`SELECT COUNT(*) AS n FROM payments pay RIGHT JOIN invoices i ON pay.invoice_id = i.id`));
  console.log(await q(`SELECT COUNT(*) AS n FROM payments pay RIGHT JOIN invoices i ON pay.invoice_id = i.id WHERE pay.id IS NULL`));

  console.log("== N. CROSS products × categories-ish: per-category price floor vs own products ==");
  console.log(await q(`SELECT a.name, ROUND(a.price,2) AS price, (SELECT COUNT(*) FROM products b WHERE b.category = a.category AND b.price < a.price) AS cheaper_peers FROM products a WHERE a.category='Electronics' ORDER BY a.price`));

  console.log("== O. order_items fanout: orders with items priced above their product avg per category (heavy) — sample: items where unit_price > product avg unit price ==");
  console.log(await q(`SELECT COUNT(*) AS n FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.unit_price > (SELECT AVG(unit_price) FROM order_items oi2 WHERE oi2.product_id = p.id)`));

  console.log("== P. supplier revenue bands (join chain) ==");
  console.log(await q(`SELECT s.name, ROUND(SUM(oi.unit_price * oi.quantity),2) AS revenue FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id GROUP BY s.id ORDER BY revenue DESC`));

  console.log("== Q. anti-join: products never ordered ==");
  console.log(await q(`SELECT p.name FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL`));
  console.log("== Q2. suppliers with no orders at all (via products→items) ==");
  console.log(await q(`SELECT s.name FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL GROUP BY s.id`));

  console.log("== R. date-slice: orders per month (for range joins on months) ==");
  console.log(await q(`SELECT strftime('%Y-%m', created_at) AS ym, COUNT(*) AS n FROM orders GROUP BY ym ORDER BY ym`));

  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
