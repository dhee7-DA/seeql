// Task 22 density-backfill fact harvest — verify every number used in the
// new L41–49 MCQs/problems before they're written.
// Run: bunx tsx scripts/facts-t22.ts

import { pathToFileURL } from "node:url";

if (process.argv[1] !== pathToFileURL(import.meta.url).href) {
  // allow direct execution only
}

import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

const q = async (sql: string) =>
  (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;

/** JSON-safe rows: BigInt → number, BigInt nested inside arrays too. */
function js(rows: Array<Record<string, unknown>>) {
  return JSON.parse(
    JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? Number(v) : v)),
  );
}

async function main() {
  const counts = await resetDatabase();
  console.log("seeded:", JSON.stringify(counts));

  const out: Record<string, unknown> = {};

  // L41 — expression in VALUES, multi-row changes, sequence previews
  out.nextCustomerId = await q(`SELECT MAX(id) + 1 AS n FROM customers`);
  out.nextOrderId = await q(`SELECT MAX(id) + 1 AS n FROM orders`);
  out.apparel = await q(`SELECT COUNT(*) AS n FROM products WHERE category = 'Apparel'`);
  out.inactive = await q(`SELECT COUNT(*) AS n FROM customers WHERE active = 0`);
  out.inactiveList = await q(`SELECT id, name FROM customers WHERE active = 0 ORDER BY id`);

  // sandbox probe: expression VALUES + 3-row changes
  let exprProbe: unknown = null;
  try {
    await db.$transaction(async (tx) => {
      const r = (await (tx as typeof db).$queryRawUnsafe(
        `INSERT INTO products (name, category, price, stock, supplier_id)
         VALUES ('Desk Mat XL', 'Accessories', 19.99 * 2, 80, 4)
         RETURNING name, price`,
      )) as Array<Record<string, unknown>>;
      const three = (await (tx as typeof db).$queryRawUnsafe(
        `INSERT INTO suppliers (name, region, rating) VALUES ('A', 'EU', 4.0), ('B', 'US', 3.0), ('C', 'APAC', 5.0)`,
      )) as unknown;
      exprProbe = { returned: r, three };
      throw new Error("__rb__");
    });
  } catch (e) {
    if ((e as Error).message !== "__rb__") console.error("exprProbe FAIL", e);
  }
  out.exprProbe = exprProbe;

  // L42 — Round Light markup, pending-before-2025, pending sweep
  out.ringLightMarkup = await q(
    `SELECT name, ROUND(price * 1.05, 2) AS new_price FROM products WHERE id = 8`,
  );
  out.pendingPre2025 = await q(
    `SELECT COUNT(*) AS n FROM orders WHERE status = 'pending' AND created_at < '2025-01-01'`,
  );
  out.pendingAll = await q(`SELECT COUNT(*) AS n FROM orders WHERE status = 'pending'`);

  // L43 — purge candidates
  out.itemsOver80 = await q(`SELECT COUNT(*) AS n FROM order_items WHERE unit_price > 80`);
  out.itemsQty1 = await q(`SELECT COUNT(*) AS n FROM order_items WHERE quantity = 1`);
  out.itemsAfterQty3 = await q(
    `SELECT COUNT(*) - (SELECT COUNT(*) FROM order_items WHERE quantity >= 3) AS n FROM order_items`,
  );
  out.cancelledOrders = await q(`SELECT COUNT(*) AS n FROM orders WHERE status = 'cancelled'`);
  out.zeroStock = await q(`SELECT COUNT(*) AS n FROM products WHERE stock = 0`);

  // L44 — mixed upsert changes (2 new + 1 collision)
  let upsertProbe: unknown = null;
  try {
    await db.$transaction(async (tx) => {
      const before = (await (tx as typeof db).$queryRawUnsafe(
        `SELECT total_changes() AS c`,
      )) as Array<Record<string, unknown>>;
      await (tx as typeof db).$queryRawUnsafe(
        `INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES
         (900, 'Probe A', 'Audio', 1.0, 1, 1),
         (1, 'Probe K1', 'Electronics', 1.0, 5, 1),
         (901, 'Probe B', 'Audio', 2.0, 2, 1)
         ON CONFLICT(id) DO UPDATE SET stock = stock + excluded.stock`,
      );
      const after = (await (tx as typeof db).$queryRawUnsafe(
        `SELECT total_changes() AS c`,
      )) as Array<Record<string, unknown>>;
      upsertProbe = {
        changes: Number(after[0].c) - Number(before[0].c),
        k1: await (tx as typeof db).$queryRawUnsafe(`SELECT stock FROM products WHERE id = 1`),
      };
      throw new Error("__rb__");
    });
  } catch (e) {
    if ((e as Error).message !== "__rb__") console.error("upsertProbe FAIL", e);
  }
  out.upsertProbe = upsertProbe;

  // L45 — pragma forensics
  out.productCols = await q(`SELECT COUNT(*) AS n FROM pragma_table_info('products')`);
  out.customerCols = await q(`SELECT COUNT(*) AS n FROM pragma_table_info('customers')`);
  out.productNotNull = await q(
    `SELECT name FROM pragma_table_info('products') WHERE "notnull" = 1 ORDER BY cid`,
  );

  // L46 — column counts after ALTER probes
  out.supplierCols = await q(`SELECT COUNT(*) AS n FROM pragma_table_info('suppliers')`);

  // L47 — view row counts on the seed
  out.activeCustomers = await q(`SELECT COUNT(*) AS n FROM customers WHERE active = 1`);
  out.cheapCatalog = await q(
    `SELECT name, price FROM products WHERE price < 20 ORDER BY price`,
  );
  out.euActive = await q(
    `SELECT COUNT(*) AS n FROM customers WHERE region = 'EU' AND active = 1`,
  );
  out.customerOrderCounts = await q(
    `SELECT COUNT(*) AS n FROM (SELECT c.id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id)`,
  );

  // L48 — pristine index census + email uniqueness proof
  out.pristineOrderItemIndexes = await q(
    `SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'index' AND tbl_name = 'order_items'`,
  );
  out.pristineOrderIndexes = await q(
    `SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'index' AND tbl_name = 'orders' AND name NOT LIKE 'sqlite_%'`,
  );
  out.dupEmailGroups = await q(
    `SELECT COUNT(*) AS n FROM (SELECT email FROM customers GROUP BY email HAVING COUNT(*) > 1)`,
  );
  out.ordersEqpScan = await q(`EXPLAIN QUERY PLAN SELECT * FROM orders WHERE status = 'shipped'`);

  // L49 — countdown + powers
  out.top3Months = await q(
    `SELECT strftime('%Y-%m', created_at) AS month, ROUND(SUM(total), 2) AS revenue
     FROM orders GROUP BY month ORDER BY revenue DESC, month ASC LIMIT 3`,
  );

  console.log("FACTS =", JSON.stringify(out, (_k, v) => (typeof v === "bigint" ? Number(v) : v), 1));
  const post = await q(`SELECT COUNT(*) AS n FROM orders`);
  console.log("post-check orders:", JSON.stringify(post));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
