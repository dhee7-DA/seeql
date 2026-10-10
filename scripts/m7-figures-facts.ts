// Truth probe for the M7 batch-2 figure fleet (w1b, w1c, w2b, w2c, w3b, w3c, w4b, w4c).
// Every number a figure will display is verified here before it ships.
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

  // w1b — INSERT INTO … SELECT: the clearance mirror source rows
  await q("w1b.apparel", `SELECT id, name, price, stock, supplier_id FROM products WHERE category = 'Apparel' ORDER BY id`);
  await q("w1b.apparel-count", `SELECT COUNT(*) AS n FROM products WHERE category = 'Apparel'`);

  // w1c — next-id ladder
  await q("w1c.max-cust", `SELECT MAX(id) AS m, COUNT(*) AS n FROM customers`);
  await q("w1c.max-orders", `SELECT MAX(id) AS m, COUNT(*) AS n FROM orders`);
  await q("w1c.max-prod", `SELECT MAX(id) AS m, COUNT(*) AS n FROM products`);

  // w2b — CASE inside SET: who is under 50?
  await q("w2b.thin", `SELECT id, name, stock, stock + 40 AS after FROM products WHERE stock < 50 ORDER BY id`);
  await q("w2b.thin-count", `SELECT COUNT(*) AS n FROM products WHERE stock < 50`);

  // w2c — UPDATE … FROM: EU suppliers, rating/5 factor, their products
  await q("w2c.eu-suppliers", `SELECT id, name, rating, ROUND(rating / 5.0, 2) AS factor FROM suppliers WHERE region = 'EU' ORDER BY id`);
  await q("w2c.eu-products", `SELECT p.id, p.name, p.price, s.rating, ROUND(p.price * (s.rating / 5.0), 2) AS new_price FROM products p JOIN suppliers s ON p.supplier_id = s.id WHERE s.region = 'EU' ORDER BY p.id`);
  await q("w2c.eu-count", `SELECT COUNT(*) AS n FROM products p JOIN suppliers s ON p.supplier_id = s.id WHERE s.region = 'EU'`);

  // w3b — soft delete: status census of orders
  await q("w3b.status", `SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY status`);
  await q("w3b.alive", `SELECT COUNT(*) AS n FROM orders WHERE status != 'cancelled'`);

  // w3c — the receipt: preview = delete width, children first
  await q("w3c.cancelled", `SELECT COUNT(*) AS n FROM orders WHERE status = 'cancelled'`);
  await q("w3c.cancelled-items", `SELECT COUNT(*) AS n FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE status = 'cancelled')`);

  // w4b/w4c — upsert + replace ground: K1 row
  await q("w4.k1", `SELECT id, name, category, price, stock, supplier_id FROM products WHERE id = 1`);
  await q("w4.products-schema", `SELECT sql FROM sqlite_master WHERE name = 'products'`);

  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
