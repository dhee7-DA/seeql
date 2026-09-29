// M2 pass fact probe — engine receipts for the Joins keyword banks and the
// Module-2 gauntlet (MCQ predict items, case walkthroughs, problem solutions).
// Run: npx tsx scripts/m2-facts.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  return (await db.$queryRawUnsafe(sql)) as T[];
}
async function one(sql: string): Promise<Record<string, unknown>> {
  const rows = await q(sql);
  return rows[0] ?? {};
}
const n = (v: unknown) => Math.round(Number(v) * 100) / 100;

async function main() {
  const counts = await resetDatabase();
  console.log("seeded:", counts, "\n");

  console.log("== sqlite version ==");
  console.log(await one(`SELECT sqlite_version() v`));

  console.log("\n== inner join volumes ==");
  // every order belongs to a customer? every item belongs to an order/product?
  console.log("orders w/ customer:", await one(`SELECT COUNT(*) n FROM orders o INNER JOIN customers c ON o.customer_id = c.id`));
  console.log("items w/ order:", await one(`SELECT COUNT(*) n FROM order_items oi INNER JOIN orders o ON oi.order_id = o.id`));
  console.log("items w/ product:", await one(`SELECT COUNT(*) n FROM order_items oi INNER JOIN products p ON oi.product_id = p.id`));
  console.log("3-table chain rows:", await one(`SELECT COUNT(*) n FROM order_items oi INNER JOIN orders o ON oi.order_id = o.id INNER JOIN customers c ON o.customer_id = c.id`));
  console.log("EU orders:", await one(`SELECT COUNT(*) n FROM orders o INNER JOIN customers c ON o.customer_id = c.id WHERE c.region = 'EU'`));
  console.log("pending w/ names:", await one(`SELECT COUNT(*) n FROM orders o INNER JOIN customers c ON o.customer_id = c.id WHERE o.status = 'pending'`));

  console.log("\n== customers x orders grain ==");
  console.log("customers with no orders (anti-join):", await q(`SELECT c.id, c.name, c.region FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL ORDER BY c.id`));
  console.log("left join row count:", await one(`SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id`));
  console.log("customers with orders:", await one(`SELECT COUNT(DISTINCT c.id) n FROM customers c INNER JOIN orders o ON o.customer_id = c.id`));
  console.log("orders per customer:", await q(`SELECT c.name, COUNT(o.id) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY n DESC, c.name LIMIT 6`));
  console.log("max orders one customer:", await one(`SELECT MAX(n) mx FROM (SELECT COUNT(*) n FROM orders GROUP BY customer_id)`));

  console.log("\n== right / full outer ==");
  console.log("right join orders<-customers:", await one(`SELECT COUNT(*) n FROM orders o RIGHT JOIN customers c ON o.customer_id = c.id`));
  console.log("right join unmatched (o.id IS NULL):", await q(`SELECT c.name FROM orders o RIGHT JOIN customers c ON o.customer_id = c.id WHERE o.id IS NULL ORDER BY c.name`));
  console.log("full outer customers x orders:", await one(`SELECT COUNT(*) n FROM customers c FULL OUTER JOIN orders o ON o.customer_id = c.id`));
  console.log("full outer unmatched both sides:", await q(`SELECT c.name AS cname, o.id AS oid FROM customers c FULL OUTER JOIN orders o ON o.customer_id = c.id WHERE c.id IS NULL OR o.id IS NULL ORDER BY cname, oid`));

  console.log("\n== cross join ==");
  console.log("products x products:", await one(`SELECT COUNT(*) n FROM products a CROSS JOIN products b`));
  console.log("customers x products:", await one(`SELECT COUNT(*) n FROM customers c CROSS JOIN products p`));
  console.log("cross + filter same category:", await one(`SELECT COUNT(*) n FROM products a CROSS JOIN products b WHERE a.category = b.category`));
  console.log("pairwise distinct category pairs:", await one(`SELECT COUNT(*) n FROM (SELECT DISTINCT a.category || '-' || b.category pr FROM products a CROSS JOIN products b)`));
  console.log("cheaper->pricier same category:", await one(`SELECT COUNT(*) n FROM products a CROSS JOIN products b WHERE a.category = b.category AND a.price < b.price`));

  console.log("\n== self join ==");
  console.log("same-region customer pairs (a.id<b.id):", await one(`SELECT COUNT(*) n FROM customers a INNER JOIN customers b ON a.region = b.region AND a.id < b.id`));
  console.log("per-region pair counts:", await q(`SELECT a.region, COUNT(*) n FROM customers a INNER JOIN customers b ON a.region = b.region AND a.id < b.id GROUP BY a.region ORDER BY n DESC`));
  console.log("same-city pairs:", await q(`SELECT a.name, b.name, a.city FROM customers a INNER JOIN customers b ON a.city = b.city AND a.id < b.id ORDER BY a.city, a.name`));
  console.log("same-region AND same-city:", await one(`SELECT COUNT(*) n FROM customers a INNER JOIN customers b ON a.region = b.region AND a.city = b.city AND a.id < b.id`));
  console.log("products same supplier+category pairs:", await one(`SELECT COUNT(*) n FROM products a INNER JOIN products b ON a.supplier_id = b.supplier_id AND a.category = b.category AND a.id < b.id`));
  console.log("orders same customer same status pairs:", await one(`SELECT COUNT(*) n FROM orders a INNER JOIN orders b ON a.customer_id = b.customer_id AND a.status = b.status AND a.id < b.id`));

  console.log("\n== on vs where ==");
  // LEFT JOIN + right-table predicate in ON: keeps unmatched customers with NULLs
  console.log("ON placement (pending in ON):", await one(`SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'`));
  // same predicate in WHERE: unmatched customers vanish -> inner behaviour
  console.log("WHERE placement (pending in WHERE):", await one(`SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.status = 'pending'`));
  console.log("ON-placement pending rows only:", await one(`SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.id IS NOT NULL`));
  // pending orders count for reference
  console.log("pending orders total:", await one(`SELECT COUNT(*) n FROM orders WHERE status = 'pending'`));
  console.log("customers with pending:", await one(`SELECT COUNT(DISTINCT customer_id) n FROM orders WHERE status = 'pending'`));

  console.log("\n== fan-out & grain ==");
  // naive: join orders->items and sum o.total => inflated
  console.log("honest total:", await one(`SELECT ROUND(SUM(total),2) v FROM orders`));
  console.log("fan-out inflated total:", await one(`SELECT ROUND(SUM(o.total),2) v FROM orders o INNER JOIN order_items oi ON oi.order_id = o.id`));
  console.log("fan-out multiplier:", await one(`SELECT ROUND(SUM(o.total)/(SELECT SUM(total) FROM orders),4) v FROM orders o INNER JOIN order_items oi ON oi.order_id = o.id`));
  console.log("row fanout:", await one(`SELECT COUNT(*) n FROM orders o INNER JOIN order_items oi ON oi.order_id = o.id`));
  console.log("worst inflated single order:", await q(`SELECT o.id, ROUND(o.total,2) t, COUNT(oi.id) items, ROUND(SUM(o.total) OVER (PARTITION BY o.id),2) dup FROM orders o INNER JOIN order_items oi ON oi.order_id = o.id GROUP BY o.id ORDER BY items DESC LIMIT 3`));
  console.log("items per order avg:", await one(`SELECT ROUND(AVG(n),2) v FROM (SELECT COUNT(*) n FROM order_items GROUP BY order_id)`));
  // fanout fixed via pre-aggregation
  console.log("pre-aggregated fix:", await one(`SELECT ROUND(SUM(x.order_total),2) v FROM (SELECT o.id, o.total AS order_total FROM orders o) x`));
  console.log("distinct orders in join:", await one(`SELECT COUNT(DISTINCT o.id) n FROM orders o INNER JOIN order_items oi ON oi.order_id = o.id`));

  console.log("\n== anti-join variants ==");
  console.log("never ordered (NOT EXISTS):", await one(`SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`));
  console.log("never ordered (LEFT JOIN/IS NULL):", await one(`SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL`));
  console.log("never DELIVERED (anti vs subset):", await q(`SELECT c.name, c.region FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered') ORDER BY c.name`));
  console.log("products never ordered:", await q(`SELECT p.name FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL ORDER BY p.name`));
  console.log("suppliers never ordered:", await q(`SELECT s.name FROM suppliers s WHERE NOT EXISTS (SELECT 1 FROM products p INNER JOIN order_items oi ON oi.product_id = p.id WHERE p.supplier_id = s.id) ORDER BY s.name`));

  console.log("\n== left join aggregates ==");
  console.log("spend per customer incl zero:", await q(`SELECT c.name, ROUND(COALESCE(SUM(o.total),0),2) spend FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY spend DESC LIMIT 5`));
  console.log("zero-spend via SUM:", await q(`SELECT c.name, SUM(o.total) s FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING COUNT(o.id) = 0 ORDER BY c.name`));
  console.log("orders count per region:", await q(`SELECT c.region, COUNT(o.id) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.region ORDER BY n DESC`));

  console.log("\n== misc named facts ==");
  console.log("total distinct (customer,product) pairs bought:", await one(`SELECT COUNT(*) n FROM (SELECT DISTINCT o.customer_id, oi.product_id FROM orders o INNER JOIN order_items oi ON oi.order_id = o.id)`));
  console.log("max possible pairs 16x16:", 256);
  console.log("customers same region both ordered:", await one(`SELECT COUNT(*) n FROM (SELECT DISTINCT a.id aid, b.id bid FROM customers a INNER JOIN customers b ON a.region = b.region AND a.id < b.id INNER JOIN orders oa ON oa.customer_id = a.id INNER JOIN orders ob ON ob.customer_id = b.id)`));
  console.log("product pairs same price:", await q(`SELECT a.name, b.name, a.price FROM products a INNER JOIN products b ON a.price = b.price AND a.id < b.id`));
}

main().catch((e) => { console.error(e); process.exit(1); });
