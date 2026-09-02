// M2 third-figure facts — verifies every hardcoded number that will appear in
// the new join-module diagrams (Task 19). SELECT-only; never resets the db.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function q<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  return (await db.$queryRawUnsafe(sql)) as T[];
}

async function main() {
  console.log("== L09 direction figure: top orderer + repetition ==");
  console.log(await q(`SELECT c.id, c.name, COUNT(*) n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY n DESC LIMIT 3`));
  console.log(await q(`SELECT COUNT(*) rows_from_orders_side, (SELECT COUNT(*) FROM customers c JOIN orders o ON o.customer_id = c.id) rows_from_customers_side FROM orders o JOIN customers c ON c.id = o.customer_id`));

  console.log("== L10 multiply figure: lines per product (max) ==");
  console.log(await q(`SELECT p.id, p.name, COUNT(*) lines, COUNT(DISTINCT oi.order_id) distinct_orders FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id ORDER BY lines DESC LIMIT 3`));

  console.log("== L11 referential map: fanout ratios ==");
  console.log(await q(`SELECT (SELECT COUNT(*) FROM customers) customers, (SELECT COUNT(*) FROM orders) orders, (SELECT COUNT(*) FROM order_items) items, (SELECT COUNT(*) FROM products) products, (SELECT COUNT(*) FROM suppliers) suppliers`));
  console.log(await q(`SELECT COUNT(DISTINCT customer_id) buyers FROM orders`));
  console.log(await q(`SELECT COUNT(DISTINCT order_id) orders_with_lines, COUNT(DISTINCT product_id) products_sold FROM order_items`));
  console.log(await q(`SELECT COUNT(DISTINCT supplier_id) suppliers_with_products FROM products`));

  console.log("== L12 gap anatomy: shipped ==");
  console.log(await q(`SELECT COUNT(*) shipped_orders, COUNT(DISTINCT customer_id) customers_with_shipped FROM orders WHERE status = 'shipped'`));
  console.log(await q(`SELECT COUNT(*) gap_customers FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped')`));
  console.log(await q(`SELECT c.name, o.id AS order_id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' ORDER BY c.name, o.id LIMIT 8`));

  console.log("== L13 subquery flow: pending distinct products ==");
  console.log(await q(`SELECT COUNT(DISTINCT oi.product_id) pending_products FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.status = 'pending'`));
  console.log(await q(`SELECT COUNT(*) never_pending FROM products p WHERE NOT EXISTS (SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE oi.product_id = p.id AND o.status = 'pending')`));
  console.log(await q(`SELECT COUNT(*) pending_orders, COUNT(DISTINCT product_id) FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.status = 'pending'`));

  console.log("== L14 mirror matrix: APAC pairs ==");
  console.log(await q(`SELECT region, COUNT(*) n, COUNT(*) * (COUNT(*) - 1) / 2 pairs FROM customers GROUP BY region ORDER BY region`));

  console.log("== L15 ghost row: COUNT(*) vs COUNT(o.id) after shipped LEFT JOIN ==");
  console.log(await q(`SELECT COUNT(*) total_rows, SUM(CASE WHEN o.id IS NULL THEN 1 ELSE 0 END) ghost_rows, COUNT(o.id) real_matches FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'`));
  console.log(await q(`SELECT x.has_shipped, COUNT(*) customers, SUM(x.cstar) cstar_sum, SUM(x.coid) coid_sum FROM (SELECT c.id, CASE WHEN o.id IS NULL THEN 0 ELSE 1 END has_shipped, COUNT(o.id) + 1 AS cstar, COUNT(o.id) coid FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' GROUP BY c.id) x GROUP BY x.has_shipped`));

  console.log("== L16 checklist: verify anchor numbers ==");
  console.log(await q(`SELECT ROUND(SUM(total), 2) honest FROM orders`));
  console.log(await q(`SELECT ROUND(SUM(o.total), 2) inflated FROM orders o JOIN order_items oi ON oi.order_id = o.id`));
  console.log(await q(`SELECT MIN(lines) min_l, MAX(lines) max_l, ROUND(AVG(lines), 2) avg_l FROM (SELECT COUNT(*) lines FROM order_items GROUP BY order_id)`));

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
