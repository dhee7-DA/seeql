// Module 3 facts — every number used in lessons 17–24 prose/diagrams/MCQs,
// computed live from the seeded storefront db. Run: bunx tsx scripts/facts-m3.ts
import { pathToFileURL } from "node:url";
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

const q = async (sql: string) =>
  (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;

async function main() {
  await resetDatabase();

  const facts: Record<string, unknown> = {};

  /* ---- L17: UNION vs UNION ALL mechanics ---- */
  facts.statusUnionAll = (await q(`SELECT status FROM orders`)).length; // expect 103
  facts.statusUnion = (await q(`SELECT status FROM orders UNION SELECT status FROM orders`)).length; // 4
  facts.statusDistinct = (await q(`SELECT DISTINCT status FROM orders ORDER BY status`));
  facts.regionPile = await q(
    `SELECT region, COUNT(*) AS n FROM (
       SELECT region FROM customers UNION ALL SELECT region FROM suppliers
     ) GROUP BY region ORDER BY region`,
  );
  facts.regionPileTotal = (await q(
    `SELECT region FROM customers UNION ALL SELECT region FROM suppliers`,
  )).length; // 22
  facts.regionUnion = await q(
    `SELECT region FROM customers UNION SELECT region FROM suppliers ORDER BY region`,
  );
  /* column names come from the first arm */
  facts.colNamesFromFirst = (await q(
    `SELECT name AS first_col FROM customers UNION ALL SELECT name FROM suppliers LIMIT 1`,
  ));

  /* ---- membership sets per status ---- */
  for (const s of ["delivered", "shipped", "pending", "cancelled"]) {
    const rows = await q(
      `SELECT DISTINCT customer_id FROM orders WHERE status = '${s}' ORDER BY customer_id`,
    );
    facts[`cust_${s}`] = rows.map((r) => Number(r.customer_id));
  }

  /* ---- L19: INTERSECT ---- */
  facts.intersectDeliveredCancelled = await q(
    `SELECT DISTINCT customer_id FROM orders WHERE status='delivered'
     INTERSECT
     SELECT DISTINCT customer_id FROM orders WHERE status='cancelled' ORDER BY customer_id`,
  );
  facts.intersectDeliveredPendingCount = (
    await q(
      `SELECT DISTINCT customer_id FROM orders WHERE status='delivered'
       INTERSECT
       SELECT DISTINCT customer_id FROM orders WHERE status='pending'`,
    )
  ).length;
  facts.intersectEquivalentJoin = (
    await q(
      `SELECT COUNT(*) AS n FROM (
         SELECT DISTINCT a.customer_id
         FROM orders a JOIN orders b ON b.customer_id = a.customer_id
         WHERE a.status='delivered' AND b.status='cancelled'
       )`,
    )
  )[0].n;
  /* products: stock > 100 INTERSECT price < 50 */
  facts.intersectProducts = await q(
    `SELECT name FROM products WHERE stock > 100
     INTERSECT
     SELECT name FROM products WHERE price < 50 ORDER BY name`,
  );

  /* ---- L20: EXCEPT ---- */
  facts.exceptDeliveredCancelled = await q(
    `SELECT DISTINCT customer_id FROM orders WHERE status='delivered'
     EXCEPT
     SELECT DISTINCT customer_id FROM orders WHERE status='cancelled' ORDER BY customer_id`,
  );
  facts.exceptCounts = {
    delivered_except_cancelled: (
      await q(
        `SELECT DISTINCT customer_id FROM orders WHERE status='delivered'
         EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status='cancelled'`,
      )
    ).length,
    cancelled_except_delivered: (
      await q(
        `SELECT DISTINCT customer_id FROM orders WHERE status='cancelled'
         EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status='delivered'`,
      )
    ).length,
    shipped_except_delivered: (
      await q(
        `SELECT DISTINCT customer_id FROM orders WHERE status='shipped'
         EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status='delivered'`,
      )
    ).length,
    customers_except_shipped: (
      await q(`SELECT id FROM customers EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status='shipped'`)
    ).length,
  };
  facts.exceptProducts = await q(
    `SELECT name FROM products WHERE price > 100
     EXCEPT
     SELECT name FROM products WHERE category = 'Audio' ORDER BY name`,
  );
  /* EXCEPT vs the M2 anti-join — same 6 customers */
  facts.exceptNoShippedNames = await q(
    `SELECT name FROM customers
     EXCEPT
     SELECT c.name FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'shipped'
     ORDER BY name`,
  );

  /* ---- L21: precedence — does SQLite evaluate left-to-right? ---- */
  // A = delivered customers, B = cancelled, C = pending
  // Q1 ungrouped:   A UNION B INTERSECT C
  // Q2 INTERSECT-first: A UNION (B INTERSECT C)
  // Q3 left-to-right:   (A UNION B) INTERSECT C
  const A = `SELECT DISTINCT customer_id AS v FROM orders WHERE status='delivered'`;
  const B = `SELECT DISTINCT customer_id AS v FROM orders WHERE status='cancelled'`;
  const C = `SELECT DISTINCT customer_id AS v FROM orders WHERE status='pending'`;
  const safe = async (label: string, sql: string) => {
    try {
      facts[label] = await q(sql);
    } catch (e) {
      facts[label] = { syntaxError: String(e).includes('near "(": syntax error') ? "paren around compound arm rejected" : String(e) };
    }
  };
  // q1: what SQLite actually does with A UNION B INTERSECT C (no parens)
  await safe("precQ1NoParens", `SELECT * FROM (${A} UNION ${B} INTERSECT ${C}) ORDER BY v`);
  // qStd: standard grouping — INTERSECT binds tighter
  await safe("precQStdGrouped", `SELECT * FROM (${A} UNION (${B} INTERSECT ${C})) ORDER BY v`);
  // qL2R: left-to-right grouping, expressed so SQLite can parse it
  // (FROM-subquery as the left compound operand; parens around the whole
  //  compound as a FROM-subquery are a syntax error in SQLite)
  await safe("precQL2RGrouped", `SELECT * FROM (${A} UNION ${B}) INTERSECT ${C} ORDER BY v`);
  // parenthesized compound inside another compound — the portability question
  await safe("precParenArm", `SELECT * FROM ((${A} UNION ${B}) INTERSECT ${C}) ORDER BY v`);

  /* chained UNION ALL + UNION mixing */
  facts.chainMixed = (await q(
    `SELECT region FROM suppliers
     UNION ALL
     SELECT region FROM suppliers
     UNION
     SELECT region FROM customers`,
  )).length; // 4 if final UNION dedupes everything

  /* arm-level LIMIT via parentheses (portability question) */
  try {
    const r = await q(
      `(SELECT status FROM orders ORDER BY total DESC LIMIT 2) UNION ALL SELECT region FROM suppliers`,
    );
    facts.armLimit = { ok: true, n: r.length, rows: r };
  } catch (e) {
    facts.armLimit = { ok: false, err: String(e) };
  }

  /* ---- L22: CASE basics ---- */
  facts.caseLabels = await q(
    `SELECT status,
            CASE WHEN status='delivered' THEN 'done'
                 WHEN status='shipped'  THEN 'on its way'
                 WHEN status='pending'  THEN 'waiting'
                 ELSE 'dead end' END AS label
     FROM orders GROUP BY status, label ORDER BY status`,
  );
  facts.caseNoElseNulls = (
    await q(
      `SELECT COUNT(*) AS n FROM (
         SELECT CASE WHEN status='cancelled' THEN 'dead' END AS tag FROM orders
       ) WHERE tag IS NULL`,
    )
  )[0].n; // 96 (103 - 7 cancelled)
  facts.simpleCase = await q(
    `SELECT CASE status
              WHEN 'delivered' THEN 1
              WHEN 'shipped' THEN 1
              ELSE 0
            END AS closed,
            COUNT(*) AS n
     FROM orders GROUP BY closed ORDER BY closed`,
  );
  /* branch order matters: put 'pending' first vs last with overlapping predicates */
  facts.caseOrderMatters = await q(
    `SELECT
       CASE WHEN status LIKE '%pend%' THEN 'first-match'
            WHEN status = 'pending'   THEN 'exact' END AS v1,
       CASE WHEN status = 'pending'   THEN 'exact'
            WHEN status LIKE '%pend%' THEN 'first-match' END AS v2,
       COUNT(*) AS n
     FROM orders GROUP BY v1, v2`,
  );

  /* ---- L23: CASE in aggregates / pivots / ORDER BY ---- */
  facts.pivotRegionStatus = await q(
    `SELECT region,
        SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END) AS delivered,
        SUM(CASE WHEN status='shipped'  THEN 1 ELSE 0 END) AS shipped,
        SUM(CASE WHEN status='pending'  THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) AS cancelled,
        COUNT(*) AS total
     FROM orders o JOIN customers c ON c.id = o.customer_id
     GROUP BY region ORDER BY region`,
  );
  facts.countVsSumCase = await q(
    `SELECT COUNT(CASE WHEN status='delivered' THEN 1 END) AS cnt_null_skip,
            SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END) AS sum_01,
            ROUND(AVG(CASE WHEN status='delivered' THEN 1.0 ELSE 0 END) * 100, 1) AS delivered_pct
     FROM orders`,
  );
  facts.deliveredShareByRegion = await q(
    `SELECT region,
            ROUND(AVG(CASE WHEN status='delivered' THEN 1.0 ELSE 0 END) * 100, 1) AS delivered_pct
     FROM orders o JOIN customers c ON c.id = o.customer_id
     GROUP BY region ORDER BY delivered_pct DESC`,
  );
  facts.customSort = await q(
    `SELECT id, status, total FROM orders
     ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'shipped' THEN 1 WHEN 'delivered' THEN 2 ELSE 3 END, id
     LIMIT 8`,
  );
  facts.caseInWhere = (
    await q(
      `SELECT COUNT(*) AS n FROM orders
       WHERE CASE WHEN status = 'cancelled' THEN 0 ELSE 1 END = 1`,
    )
  )[0].n; // 96

  /* ---- L24: capstone ---- */
  facts.spendAll = await q(
    `SELECT c.name, ROUND(SUM(o.total), 2) AS spend, COUNT(*) AS orders
     FROM customers c JOIN orders o ON o.customer_id = c.id
     GROUP BY c.id ORDER BY spend DESC`,
  );
  facts.tiers = await q(
    `SELECT CASE
              WHEN SUM(o.total) >= 3000 THEN 'high'
              WHEN SUM(o.total) >= 1000 THEN 'mid'
              ELSE 'low' END AS tier,
            COUNT(*) AS customers
     FROM customers c JOIN orders o ON o.customer_id = c.id
     GROUP BY c.id`,
  );
  facts.tierCounts = await q(
    `SELECT tier, COUNT(*) AS n FROM (
       SELECT CASE
                WHEN SUM(o.total) >= 3000 THEN 'high'
                WHEN SUM(o.total) >= 1000 THEN 'mid'
                ELSE 'low' END AS tier
       FROM customers c JOIN orders o ON o.customer_id = c.id
       GROUP BY c.id
     ) GROUP BY tier ORDER BY n DESC`,
  );
  facts.monthlyDelivered = await q(
    `SELECT substr(created_at, 1, 7) AS month,
            COUNT(*) AS orders,
            ROUND(SUM(total), 2) AS revenue
     FROM orders WHERE status = 'delivered'
     GROUP BY month ORDER BY month DESC LIMIT 3`,
  );
  facts.monthlyWithTotal = await q(
    `SELECT month, orders, revenue FROM (
       SELECT substr(created_at, 1, 7) AS month,
              COUNT(*) AS orders,
              ROUND(SUM(total), 2) AS revenue
       FROM orders WHERE status='delivered'
       GROUP BY month ORDER BY month DESC LIMIT 3
     )
     UNION ALL
     SELECT 'TOTAL',
            COUNT(*),
            ROUND(SUM(total), 2)
     FROM orders WHERE status='delivered'`,
  );
  /* category delivered revenue EXCEPT nothing-sold check — use EXCEPT to find
     categories with revenue but no delivered orders? compute both lists */
  facts.categoryRevenueDelivered = await q(
    `SELECT p.category, ROUND(SUM(o.total), 2) AS rev
     FROM orders o JOIN order_items oi ON oi.order_id = o.id
                   JOIN products p ON p.id = oi.product_id
     WHERE o.status = 'delivered'
     GROUP BY p.category ORDER BY rev DESC`,
  );
  facts.categoryRevenuePending = await q(
    `SELECT p.category, ROUND(SUM(o.total), 2) AS rev
     FROM orders o JOIN order_items oi ON oi.order_id = o.id
                   JOIN products p ON p.id = oi.product_id
     WHERE o.status = 'pending'
     GROUP BY p.category ORDER BY rev DESC`,
  );

  console.log(JSON.stringify(facts, (k, v) => (typeof v === "bigint" ? Number(v) : v), 2));
  await db.$disconnect();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main();
}
