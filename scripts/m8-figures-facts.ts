// Truth probe for the M8 batch-2 figure fleet (d1b, d1c, d2b, d2c, d3b, d3c, d4b, d4c, d5b, d5c).
import { PrismaClient } from "@prisma/client";
import { resetDatabase } from "../src/lib/sample-db";

const db = new PrismaClient({ log: [] });

const q = async (label: string, sql: string) => {
  const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  const clean = JSON.parse(JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? Number(v) : typeof v === "number" ? Math.round(v * 100) / 100 : v)));
  console.log(`${label}: ${JSON.stringify(clean)}`);
};

async function main() {
  await resetDatabase();

  // d1c — introspection on the coupons shape from the lesson
  await db.$executeRawUnsafe(`CREATE TABLE coupons (
    id      INTEGER PRIMARY KEY,
    code    TEXT NOT NULL UNIQUE,
    pct     INTEGER NOT NULL CHECK (pct BETWEEN 1 AND 50),
    active  INTEGER NOT NULL DEFAULT 1
  )`);
  await q("d1c.pragma-coupons", `SELECT name, type, "notnull", COALESCE(CAST(dflt_value AS TEXT), '—') AS dflt, pk FROM pragma_table_info('coupons')`);

  // d2b — ADD COLUMN with DEFAULT backfills existing rows
  await db.$executeRawUnsafe(`ALTER TABLE customers ADD COLUMN tier TEXT NOT NULL DEFAULT 'standard'`);
  await q("d2b.tier-count", `SELECT tier, COUNT(*) AS n FROM customers GROUP BY tier`);

  // d2c — rename proof: data survives
  await db.$executeRawUnsafe(`ALTER TABLE products RENAME COLUMN stock TO units_in_stock`);
  await q("d2c.rename-check", `SELECT id, name, units_in_stock FROM products WHERE id IN (1, 2)`);

  // d3b — view stores the query: pending count
  await db.$executeRawUnsafe(`CREATE VIEW pending_orders AS SELECT id, customer_id, total FROM orders WHERE status = 'pending'`);
  await q("d3b.pending-count", `SELECT COUNT(*) AS n FROM pending_orders`);
  await q("d3b.pending-minmax", `SELECT MIN(total) AS lo, MAX(total) AS hi FROM pending_orders`);

  // d3c — filters push through: view + outer filter
  await q("d3c.pushdown", `SELECT COUNT(*) AS n FROM pending_orders WHERE total > 100`);
  await q("d3c.pushdown-check", `SELECT COUNT(*) AS n FROM orders WHERE status = 'pending' AND total > 100`);

  // d4b — plan before/after index
  await q("d4b.plan-scan", `EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 1`);
  await db.$executeRawUnsafe(`CREATE INDEX idx_orders_customer ON orders(customer_id)`);
  await q("d4b.plan-search", `EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 1`);
  await q("d4b.customer1-rows", `SELECT COUNT(*) AS n FROM orders WHERE customer_id = 1`);

  // d4c — the case-family indexes
  await db.$executeRawUnsafe(`CREATE INDEX idx_orders_status ON orders(status)`);
  await q("d4c.plan-status", `EXPLAIN QUERY PLAN SELECT * FROM orders WHERE status = 'shipped'`);
  await q("d4c.status-shipped", `SELECT COUNT(*) AS n FROM orders WHERE status = 'shipped'`);

  // d5b — recursive sequence batches
  await q("d5b.seq", `WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 10) SELECT n FROM seq`);

  // d5c — comma walk
  await q("d5c.split", `WITH RECURSIVE split(status, rest) AS (
    SELECT '', 'delivered,shipped,pending,cancelled'
    UNION ALL
    SELECT substr(rest, 1, INSTR(rest, ',') - 1), substr(rest, INSTR(rest, ',') + 1)
    FROM split WHERE rest LIKE '%,%'
  ) SELECT status FROM split WHERE status != ''`);

  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
