// Probe sandbox mechanics (transaction + forced rollback) for write/DDL
// statements, and harvest seed facts for Modules 7-8 content.
// Run: bunx tsx scripts/facts-m78.ts

import { pathToFileURL } from "node:url";
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

class Rollback extends Error {
  constructor(public payload: unknown) { super("__rollback__"); }
}

/** Run `work` inside a transaction, then force a rollback; return captured rows/changes. */
async function sandbox(work: (tx: typeof db) => Promise<unknown>) {
  let captured: unknown = null;
  try {
    await db.$transaction(async (tx) => {
      captured = await work(tx as unknown as typeof db);
      throw new Rollback(captured);
    }, { maxWait: 5000, timeout: 10000 });
  } catch (e) {
    if (e instanceof Rollback) return e.payload;
    throw e;
  }
  return captured;
}

const q = async (sql: string) =>
  (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;

const J = (v: unknown) =>
  JSON.stringify(v, (_, x) => (typeof x === "bigint" ? Number(x) : x));

async function main() {
  const counts = await resetDatabase();
  console.log("seeded:", counts);

  const version = await q(`SELECT sqlite_version() AS v`);
  console.log("sqlite_version:", version[0].v);

  /* ---------------- 1. sandbox mechanics ---------------- */

  // A) plain INSERT (no RETURNING) via $queryRawUnsafe inside txn
  try {
    const r = await sandbox(async (tx) => {
      const rows = await (tx as never as { $queryRawUnsafe: (s: string) => Promise<unknown[]> })
        .$queryRawUnsafe(`INSERT INTO customers (id, name, email, city, region, active, created_at)
                          VALUES (99, 'Zed Tester', 'zed@example.com', 'Berlin', 'EU', 1, '2026-01-01')`);
      const after = await (tx as never as { $queryRawUnsafe: (s: string) => Promise<Array<Record<string, unknown>>> })
        .$queryRawUnsafe(`SELECT COUNT(*) AS n FROM customers`);
      const tc = await (tx as never as { $queryRawUnsafe: (s: string) => Promise<Array<Record<string, unknown>>> })
        .$queryRawUnsafe(`SELECT total_changes() AS c`);
      return { rows, customersInTxn: after[0].n, totalChanges: tc[0].c };
    });
    console.log("A) plain INSERT in txn:", J(r));
  } catch (e) { console.log("A) FAIL:", e instanceof Error ? e.message : e); }

  // B) INSERT ... RETURNING
  try {
    const r = await sandbox(async (tx) => {
      const t = tx as never as { $queryRawUnsafe: (s: string) => Promise<Array<Record<string, unknown>>> };
      const rows = await t.$queryRawUnsafe(
        `INSERT INTO products (id, name, category, price, stock, supplier_id)
         VALUES (99, 'Test Gadget', 'Electronics', 9.99, 5, 1)
         RETURNING id, name, price`);
      return { rows };
    });
    console.log("B) INSERT...RETURNING:", J(r));
  } catch (e) { console.log("B) FAIL:", e instanceof Error ? e.message : e); }

  // C) UPDATE ... RETURNING + verify select
  try {
    const r = await sandbox(async (tx) => {
      const t = tx as never as { $queryRawUnsafe: (s: string) => Promise<Array<Record<string, unknown>>> };
      const rows = await t.$queryRawUnsafe(
        `UPDATE products SET price = price * 1.1 WHERE category = 'Fitness' RETURNING id, name, ROUND(price, 2) AS new_price`);
      const verify = await t.$queryRawUnsafe(`SELECT id, ROUND(price,2) AS p FROM products WHERE category = 'Fitness' ORDER BY id`);
      return { rows, verify };
    });
    console.log("C) UPDATE...RETURNING:", J(r));
  } catch (e) { console.log("C) FAIL:", e instanceof Error ? e.message : e); }

  // D) DELETE ... RETURNING + total_changes diff
  try {
    const r = await sandbox(async (tx) => {
      const t = tx as never as { $queryRawUnsafe: (s: string) => Promise<Array<Record<string, unknown>>> };
      const before = await t.$queryRawUnsafe(`SELECT total_changes() AS c`);
      const rows = await t.$queryRawUnsafe(`DELETE FROM orders WHERE status = 'cancelled' RETURNING id`);
      const after = await t.$queryRawUnsafe(`SELECT total_changes() AS c`);
      return { rowCount: rows.length, changes: Number(after[0].c) - Number(before[0].c) };
    });
    console.log("D) DELETE...RETURNING:", J(r));
  } catch (e) { console.log("D) FAIL:", e instanceof Error ? e.message : e); }

  // E) CREATE TABLE + pragma_table_info inside txn
  try {
    const r = await sandbox(async (tx) => {
      const t = tx as never as { $queryRawUnsafe: (s: string) => Promise<Array<Record<string, unknown>>> };
      await t.$queryRawUnsafe(`CREATE TABLE notes (
        id INTEGER PRIMARY KEY,
        body TEXT NOT NULL,
        done INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1))
      )`);
      const cols = await t.$queryRawUnsafe(`SELECT name, type, "notnull" AS nn, dflt_value FROM pragma_table_info('notes')`);
      const master = await t.$queryRawUnsafe(`SELECT name, type FROM sqlite_master WHERE name = 'notes'`);
      return { cols, master };
    });
    console.log("E) CREATE TABLE + pragma:", J(r));
  } catch (e) { console.log("E) FAIL:", e instanceof Error ? e.message : e); }

  // F) CREATE VIEW + select from it in same txn
  try {
    const r = await sandbox(async (tx) => {
      const t = tx as never as { $queryRawUnsafe: (s: string) => Promise<Array<Record<string, unknown>>> };
      await t.$queryRawUnsafe(`CREATE VIEW eu_customers AS SELECT id, name, city FROM customers WHERE region = 'EU'`);
      const rows = await t.$queryRawUnsafe(`SELECT COUNT(*) AS n FROM eu_customers`);
      const master = await t.$queryRawUnsafe(`SELECT name, type FROM sqlite_master WHERE name = 'eu_customers'`);
      return { rows: rows[0], master };
    });
    console.log("F) CREATE VIEW + select:", J(r));
  } catch (e) { console.log("F) FAIL:", e instanceof Error ? e.message : e); }

  // G) CREATE INDEX + EXPLAIN QUERY PLAN uses it?
  try {
    const r = await sandbox(async (tx) => {
      const t = tx as never as { $queryRawUnsafe: (s: string) => Promise<Array<Record<string, unknown>>> };
      await t.$queryRawUnsafe(`CREATE INDEX idx_orders_customer ON orders(customer_id)`);
      const plan = await t.$queryRawUnsafe(`EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 1`);
      return { plan };
    });
    console.log("G) index + EQP:", J(r));
  } catch (e) { console.log("G) FAIL:", e instanceof Error ? e.message : e); }

  // H) ALTER TABLE inside txn
  try {
    const r = await sandbox(async (tx) => {
      const t = tx as never as { $queryRawUnsafe: (s: string) => Promise<Array<Record<string, unknown>>> };
      await t.$queryRawUnsafe(`ALTER TABLE suppliers ADD COLUMN phone TEXT`);
      const cols = await t.$queryRawUnsafe(`SELECT name FROM pragma_table_info('suppliers')`);
      await t.$queryRawUnsafe(`ALTER TABLE suppliers RENAME COLUMN phone TO contact_phone`);
      const cols2 = await t.$queryRawUnsafe(`SELECT name FROM pragma_table_info('suppliers')`);
      await t.$queryRawUnsafe(`ALTER TABLE suppliers RENAME TO vendors`);
      const master = await t.$queryRawUnsafe(`SELECT name FROM sqlite_master WHERE name IN ('suppliers','vendors')`);
      return { colsAfterAdd: cols.map((c) => c.name), colsAfterRename: cols2.map((c) => c.name), master };
    });
    console.log("H) ALTER:", J(r));
  } catch (e) { console.log("H) FAIL:", e instanceof Error ? e.message : e); }

  // I) UPSERT shapes
  try {
    const r = await sandbox(async (tx) => {
      const t = tx as never as { $queryRawUnsafe: (s: string) => Promise<Array<Record<string, unknown>>> };
      const up = await t.$queryRawUnsafe(
        `INSERT INTO products (id, name, category, price, stock, supplier_id)
         VALUES (1, 'Mechanical Keyboard K1', 'Electronics', 89.99, 999, 1)
         ON CONFLICT(id) DO UPDATE SET stock = stock + 50
         RETURNING id, stock`);
      const ignore = await t.$queryRawUnsafe(
        `INSERT INTO products (id, name, category, price, stock, supplier_id)
         VALUES (1, 'Dup', 'Electronics', 1, 1, 1)
         ON CONFLICT(id) DO NOTHING
         RETURNING id`);
      const orReplace = await t.$queryRawUnsafe(
        `INSERT OR REPLACE INTO products (id, name, category, price, stock, supplier_id)
         VALUES (1, 'Replaced', 'Electronics', 1, 1, 1)
         RETURNING id, name`);
      return { up, ignoreRowCount: ignore.length, orReplace };
    });
    console.log("I) UPSERT:", J(r));
  } catch (e) { console.log("I) FAIL:", e instanceof Error ? e.message : e); }

  // J) UPDATE ... FROM + WITH RECURSIVE
  try {
    const r = await sandbox(async (tx) => {
      const t = tx as never as { $queryRawUnsafe: (s: string) => Promise<Array<Record<string, unknown>>> };
      const updFrom = await t.$queryRawUnsafe(
        `UPDATE products SET stock = stock + 1
         FROM (SELECT id AS pid FROM suppliers WHERE region = 'EU') s
         WHERE products.supplier_id = s.pid
         RETURNING id`);
      const rec = await t.$queryRawUnsafe(
        `WITH RECURSIVE seq(n) AS (
           SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 5
         ) SELECT n FROM seq`);
      const recJoin = await t.$queryRawUnsafe(
        `WITH RECURSIVE months(m, label) AS (
           SELECT 1, '2024-01'
           UNION ALL
           SELECT m + 1, substr(printf('%04d-%02d', 2024 + (m) / 12, (m) % 12 + 1), 1, 7)
           FROM months WHERE m < 14
         ) SELECT m, label FROM months`);
      return { updFromCount: updFrom.length, rec, recJoin };
    });
    console.log("J) UPDATE FROM + RECURSIVE:", J(r));
  } catch (e) { console.log("J) FAIL:", e instanceof Error ? e.message : e); }

  // K) rollback really rolled back?
  const afterAll = await q(`SELECT
      (SELECT COUNT(*) FROM customers) AS c,
      (SELECT COUNT(*) FROM orders) AS o,
      (SELECT COUNT(*) FROM products WHERE id = 99) AS p99,
      (SELECT COUNT(*) FROM sqlite_master WHERE name = 'notes') AS t_notes,
      (SELECT COUNT(*) FROM pragma_table_info('suppliers') WHERE name = 'phone') AS col_phone`);
  console.log("K) post-rollback state:", J(afterAll[0]));

  // L) is FK enforcement really on? and a probe of SELECT inside txn after failed stmt
  try {
    await sandbox(async (tx) => {
      const t = tx as never as { $queryRawUnsafe: (s: string) => Promise<Array<Record<string, unknown>>> };
      await t.$queryRawUnsafe(`DELETE FROM customers WHERE id = 1`);
      return "deleted customer 1?!";
    });
    console.log("L) FK delete customer 1: SUCCEEDED (FK off!)");
  } catch (e) {
    console.log("L) FK delete customer 1 blocked:", e instanceof Error ? e.message.slice(0, 120) : e);
  }

  /* ---------------- 2. seed facts for content ---------------- */

  const facts: Record<string, unknown> = {};
  const one = async (sql: string) => (await q(sql))[0];

  facts.cancelled = await one(`SELECT COUNT(*) AS n, ROUND(SUM(total),2) AS v FROM orders WHERE status='cancelled'`);
  facts.pending = await one(`SELECT COUNT(*) AS n FROM orders WHERE status='pending'`);
  facts.productsNeverOrdered = await q(
    `SELECT p.id, p.name FROM products p
     WHERE p.id NOT IN (SELECT DISTINCT product_id FROM order_items)`);
  facts.nextProductId = await one(`SELECT MAX(id) AS m FROM products`);
  facts.nextCustomerId = await one(`SELECT MAX(id) AS m FROM customers`);
  facts.nextOrderId = await one(`SELECT MAX(id) AS m FROM orders`);
  facts.fitness = await q(`SELECT id, name, price, stock FROM products WHERE category='Fitness' ORDER BY id`);
  facts.cheap = await one(`SELECT COUNT(*) AS n FROM products WHERE price < 25`);
  facts.stockUnder100 = await q(`SELECT id, name, stock FROM products WHERE stock < 100 ORDER BY stock DESC, id`);
  facts.euSuppliers = await one(`SELECT COUNT(*) AS n FROM suppliers WHERE region='EU'`);
  facts.under50 = await one(`SELECT COUNT(*) AS n FROM products WHERE price < 50`);
  facts.zeroStock = await one(`SELECT COUNT(*) AS n FROM products WHERE stock = 0`);
  facts.ringLight = await one(`SELECT id, name, price, stock FROM products WHERE name LIKE 'Ring Light%'`);
  facts.keyboard1 = await one(`SELECT id, name, price, stock FROM products WHERE id = 1`);
  facts.audioStock = await one(`SELECT COUNT(*) AS n, SUM(stock) AS s FROM products WHERE category='Audio'`);
  facts.mice = await one(`SELECT id, name, price, stock FROM products WHERE name LIKE 'Wireless Mouse%'`);
  facts.dupEmails = await one(`SELECT COUNT(*) AS n FROM customers`);
  facts.euActive = await one(`SELECT COUNT(*) AS n FROM customers WHERE region='EU' AND active=1`);
  facts.euAll = await one(`SELECT COUNT(*) AS n FROM customers WHERE region='EU'`);
  facts.supplierIds = await q(`SELECT id, name, region FROM suppliers ORDER BY id`);
  facts.ordersPerStatus = await q(`SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY n DESC`);
  facts.liamOrders = await one(`SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.name='Liam O''Brien'`);
  facts.bigOrders = await one(`SELECT COUNT(*) AS n FROM orders WHERE total > 500`);
  facts.avgTotal = await one(`SELECT ROUND(AVG(total),2) AS a FROM orders`);
  facts.eqpNoIndex = await q(`EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 1`);
  facts.monthsSpan = await q(`SELECT DISTINCT substr(created_at, 1, 7) AS m FROM orders ORDER BY m`);

  console.log("\n--- FACTS ---");
  console.log(J(facts));

  await db.$disconnect();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main();
}
