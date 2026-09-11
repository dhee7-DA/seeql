// Ground-truth receipts for join-syntax.ts (Module 2 "USING & aliases" drills).
// Run: bun scripts/m2-facts-sy.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m2fe.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const QUERIES: Record<string, string> = {
  sqlite_version: `SELECT sqlite_version() AS v`,
  // --- JOIN ... USING ---
  using_orders_customers: `SELECT COUNT(*) AS n FROM orders JOIN customers USING (id)`,
  using_created_at: `SELECT COUNT(*) AS n FROM orders JOIN customers USING (created_at)`,
  using_star_columns: `SELECT * FROM orders JOIN customers USING (id) LIMIT 1`,
  using_qualified_left: `SELECT COUNT(o.id) AS n FROM orders JOIN customers USING (id)`,
  using_qualified_right: `SELECT COUNT(c.id) AS n FROM orders JOIN customers USING (id)`,
  using_eu_rows: `SELECT COUNT(*) AS n FROM orders JOIN customers USING (id) WHERE region = 'EU'`,
  using_multi_table: `SELECT COUNT(*) AS n FROM order_items oi JOIN orders o USING (id)`,
  using_selfjoin_region: `SELECT COUNT(*) AS n FROM customers a JOIN customers b USING (region)`,
  // --- NATURAL JOIN ---
  natural_products_suppliers: `SELECT COUNT(*) AS n FROM products NATURAL JOIN suppliers`,
  natural_orders_customers: `SELECT COUNT(*) AS n FROM orders NATURAL JOIN customers`,
  natural_items_orders: `SELECT COUNT(*) AS n FROM order_items NATURAL JOIN orders`,
  natural_orders_products: `SELECT COUNT(*) AS n FROM orders NATURAL JOIN products`,
  natural_customers_suppliers: `SELECT COUNT(*) AS n FROM customers NATURAL JOIN suppliers`,
  natural_invoices_payments: `SELECT COUNT(*) AS n FROM invoices NATURAL JOIN payments`,
  natural_selfjoin: `SELECT COUNT(*) AS n FROM customers a NATURAL JOIN customers b`,
  natural_using_mix: `SELECT COUNT(*) AS n FROM orders o NATURAL JOIN customers c JOIN invoices i ON i.customer_id = c.id`,
  // --- CROSS JOIN explicit ---
  cross_explicit: `SELECT COUNT(*) AS n FROM orders CROSS JOIN customers`,
  cross_with_on: `SELECT COUNT(*) AS n FROM suppliers s CROSS JOIN customers c ON c.id = s.id`,
  cross_cte: `WITH tiny(n) AS (VALUES (1),(2),(3)) SELECT COUNT(*) AS n FROM tiny CROSS JOIN tiny t2`,
  // --- comma join legacy ---
  comma_where: `SELECT COUNT(*) AS n FROM orders o, customers c WHERE c.id = o.customer_id`,
  comma_no_where: `SELECT COUNT(*) AS n FROM orders, customers`,
  comma_mixed_precedence: `SELECT COUNT(*) AS n FROM customers c, orders o JOIN order_items oi ON oi.order_id = o.id`,
  comma_three_tables: `SELECT COUNT(*) AS n FROM order_items oi, orders o, customers c WHERE o.id = oi.order_id AND c.id = o.customer_id`,
  // --- keyword optionality ---
  inner_explicit: `SELECT COUNT(*) AS n FROM orders o INNER JOIN customers c ON c.id = o.customer_id`,
  left_outer_spelled: `SELECT COUNT(*) AS n FROM customers c LEFT OUTER JOIN orders o ON o.customer_id = c.id`,
  right_join: `SELECT COUNT(*) AS n FROM customers c RIGHT JOIN orders o ON o.customer_id = c.id`,
  right_join_invoices: `SELECT COUNT(*) AS n FROM customers c RIGHT JOIN invoices i ON i.customer_id = c.id`,
  right_join_nulls: `SELECT COUNT(*) AS n FROM invoices i RIGHT JOIN customers c ON i.customer_id = c.id WHERE i.id IS NULL`,
  full_outer: `SELECT COUNT(*) AS n FROM customers c FULL OUTER JOIN orders o ON o.customer_id = c.id`,
  outer_alone: `SELECT COUNT(*) AS n FROM customers c OUTER JOIN orders o ON o.customer_id = c.id`,
  // --- alias rules ---
  alias_no_as: `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id`,
  alias_retires: `SELECT COUNT(*) FROM orders o JOIN customers c ON customers.id = o.customer_id`,
  selfjoin_no_alias: `SELECT COUNT(*) FROM customers JOIN customers ON customers.region = customers.region`,
  alias_usable_in_own_on: `SELECT COUNT(*) AS n FROM customers c JOIN orders o ON c.id = o.customer_id AND c.active = 1`,
  alias_unaliased_table_still_ok: `SELECT COUNT(*) AS n FROM orders JOIN customers c ON c.id = orders.customer_id`,
  alias_same_alias_twice: `SELECT COUNT(*) FROM orders o JOIN customers o ON o.id = o.customer_id`,
  // --- quoting / keywords as identifiers ---
  quoted_ident: `SELECT COUNT(*) AS n FROM orders WHERE "status" = 'pending'`,
  bracket_ident: `SELECT COUNT(*) AS n FROM orders WHERE [status] = 'pending'`,
  string_as_ident: `SELECT COUNT(*) AS n FROM orders WHERE 'status' = 'pending'`,
  quoted_keyword_ident: `WITH "order" AS (SELECT 1 AS x) SELECT COUNT(*) AS n FROM "order"`,
  double_vs_single: `SELECT "status" = 'status' AS q FROM orders LIMIT 1`,
};

for (const [name, sql] of Object.entries(QUERIES)) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`== ${name} ==`);
    for (const r of rows.slice(0, 10)) console.log("  ", JSON.stringify(r));
    if (rows.length > 10) console.log(`   ... ${rows.length} rows`);
  } catch (e) {
    console.log(`== ${name} == ERROR: ${(e as Error).message}`);
  }
}
// print result column names for the USING SELECT * probe
try {
  const q = db.query(`SELECT * FROM orders JOIN customers USING (id) LIMIT 1`);
  q.all();
  console.log(`== using_star_column_names ==\n  `, JSON.stringify(q.columns().map((c: { name: string }) => c.name)));
} catch (e) {
  console.log(`== using_star_column_names == ERROR: ${(e as Error).message}`);
}
rmSync(COPY);
