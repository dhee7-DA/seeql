// Task 15-e verification — re-check the facts referenced by lessons 20–24.
// Run: bunx tsx scripts/verify-15e.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

const q = async (sql: string) =>
  (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;

async function main() {
  await resetDatabase();
  const out: Record<string, unknown> = {};

  out.supplierRegions = await q(
    `SELECT region, COUNT(*) AS n FROM suppliers GROUP BY region ORDER BY region`,
  );
  out.customerRegions = await q(
    `SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY region`,
  );
  out.rawPileChain = (await q(
    `SELECT region FROM suppliers
     UNION ALL
     SELECT region FROM suppliers
     UNION
     SELECT region FROM customers`,
  )).length; // expected 4 (final UNION dedupes)
  out.rawPileNoDedupe = (await q(
    `SELECT region FROM suppliers
     UNION ALL
     SELECT region FROM suppliers
     UNION ALL
     SELECT region FROM customers`,
  )).length; // 28? (worklog's "22" was customers UNION ALL suppliers)
  out.chainMixed = (await q(
    `SELECT region FROM suppliers
     UNION ALL
     SELECT region FROM suppliers
     UNION
     SELECT region FROM customers`,
  )).length;

  // L20 facts
  out.exceptNoShipped = await q(
    `SELECT id FROM customers EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status = 'shipped' ORDER BY id`,
  );
  out.deliveredExceptCancelled = (await q(
    `SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'
     EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'`,
  )).length;
  out.cancelledExceptDelivered = (await q(
    `SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'
     EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'`,
  )).length;
  out.shippedExceptDelivered = (await q(
    `SELECT DISTINCT customer_id FROM orders WHERE status = 'shipped'
     EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'`,
  )).length;
  out.price100ExceptAudio = await q(
    `SELECT name FROM products WHERE price > 100
     EXCEPT SELECT name FROM products WHERE category = 'Audio'
     ORDER BY name`,
  );

  // L21 facts
  out.sets = {
    delivered: (await q(`SELECT DISTINCT customer_id FROM orders WHERE status='delivered'`)).length,
    cancelled: (await q(`SELECT DISTINCT customer_id FROM orders WHERE status='cancelled'`)).length,
    pending: (await q(`SELECT DISTINCT customer_id FROM orders WHERE status='pending'`)).length,
  };
  out.ltoR = (await q(
    `SELECT * FROM (
       SELECT DISTINCT customer_id AS v FROM orders WHERE status='delivered'
       UNION
       SELECT DISTINCT customer_id AS v FROM orders WHERE status='cancelled'
     )
     INTERSECT
     SELECT DISTINCT customer_id AS v FROM orders WHERE status='pending'`,
  )).length;
  out.standard = (await q(
    `SELECT DISTINCT customer_id AS v FROM orders WHERE status='delivered'
     UNION
     SELECT * FROM (
       SELECT DISTINCT customer_id AS v FROM orders WHERE status='cancelled'
       INTERSECT
       SELECT DISTINCT customer_id AS v FROM orders WHERE status='pending'
     )`,
  )).length;

  // L22 facts
  out.statusCounts = await q(
    `SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY status`,
  );
  out.noElseNull = (await q(
    `SELECT COUNT(*) AS n FROM (SELECT CASE WHEN status='cancelled' THEN 'dead' END AS tag FROM orders) WHERE tag IS NULL`,
  ))[0].n;
  out.simpleCaseBuckets = await q(
    `SELECT CASE status WHEN 'delivered' THEN 1 WHEN 'shipped' THEN 1 ELSE 0 END AS closed, COUNT(*) AS n
     FROM orders GROUP BY closed ORDER BY closed`,
  );

  // L23 facts
  out.kpi = (await q(
    `SELECT COUNT(*) AS all_orders,
            SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END) AS delivered,
            SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending
     FROM orders`,
  ))[0];
  out.pivot = await q(
    `SELECT c.region,
       SUM(CASE WHEN o.status='delivered' THEN 1 ELSE 0 END) AS delivered,
       SUM(CASE WHEN o.status='shipped' THEN 1 ELSE 0 END) AS shipped,
       SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) AS pending,
       SUM(CASE WHEN o.status='cancelled' THEN 1 ELSE 0 END) AS cancelled,
       COUNT(*) AS total
     FROM orders o JOIN customers c ON c.id = o.customer_id
     GROUP BY c.region ORDER BY c.region`,
  );
  out.shareByRegion = await q(
    `SELECT c.region, ROUND(AVG(CASE WHEN o.status='delivered' THEN 1.0 ELSE 0 END) * 100, 1) AS delivered_pct
     FROM orders o JOIN customers c ON c.id = o.customer_id
     GROUP BY c.region ORDER BY delivered_pct DESC, c.region`,
  );

  // L24 facts
  out.tiers = await q(
    `SELECT tier, COUNT(*) AS customers FROM (
       SELECT CASE WHEN SUM(o.total) >= 3000 THEN 'high'
                   WHEN SUM(o.total) >= 1000 THEN 'mid'
                   ELSE 'low' END AS tier
       FROM customers c JOIN orders o ON o.customer_id = c.id
       GROUP BY c.id
     ) GROUP BY tier ORDER BY customers DESC, tier`,
  );
  out.ledger = await q(
    `SELECT month, orders, revenue FROM (
       SELECT substr(created_at, 1, 7) AS month, COUNT(*) AS orders, ROUND(SUM(total), 2) AS revenue
       FROM orders WHERE status = 'delivered'
       GROUP BY month ORDER BY month DESC LIMIT 3
     )
     UNION ALL
     SELECT 'TOTAL', COUNT(*), ROUND(SUM(total), 2)
     FROM orders WHERE status = 'delivered'
     ORDER BY month`,
  );
  out.deliveredOnlyCategory = await q(
    `SELECT p.category
     FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id
     WHERE o.status = 'delivered' GROUP BY p.category
     EXCEPT
     SELECT p.category
     FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id
     WHERE o.status = 'pending' GROUP BY p.category
     ORDER BY category`,
  );
  out.buckets = await q(
    `SELECT bucket, orders, revenue FROM (
       SELECT CASE WHEN status IN ('delivered','shipped') THEN 'BIG'
                   WHEN status = 'pending' THEN 'OPEN'
                   ELSE 'LOST' END AS bucket,
              COUNT(*) AS orders, ROUND(SUM(total), 2) AS revenue
       FROM orders GROUP BY bucket
     )
     UNION ALL
     SELECT 'TOTAL', COUNT(*), ROUND(SUM(total), 2)
     FROM orders
     ORDER BY bucket`,
  );

  const json = JSON.stringify(
    out,
    (_k, v) => (typeof v === "bigint" ? Number(v) : v),
    2,
  );
  console.log(json);
}

main();
