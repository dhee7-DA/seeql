// Sample database for the "Run" feature: DDL + deterministic seed data.
// Server-only (imports the Prisma client). All queries run against SQLite.

import { db } from "@/lib/db";

export const SAMPLE_TABLES = [
  "order_items",
  "orders",
  "products",
  "suppliers",
  "customers",
] as const;

const DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT NOT NULL,
    region TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    rating REAL NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id)
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    status TEXT NOT NULL,
    total REAL NOT NULL,
    created_at TEXT NOT NULL,
    shipped_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL
  )`,
];

/* ---------------- deterministic data generation ---------------- */

/** Tiny LCG so the dataset is identical on every reset. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const CUSTOMERS: Array<[string, string, string, string, number, string]> = [
  // name, email, city, region, active, signup
  ["Alice Chen", "alice.chen@example.com", "Berlin", "EU", 1, "2023-11-02"],
  ["Bruno Silva", "bruno.silva@example.com", "São Paulo", "LATAM", 1, "2023-11-17"],
  ["Chloe Dubois", "chloe.dubois@example.com", "Lyon", "EU", 1, "2023-12-05"],
  ["Dmitri Volkov", "d.volkov@example.com", "Tallinn", "EU", 0, "2023-12-19"],
  ["Emma Wilson", "emma.wilson@example.com", "Austin", "US", 1, "2024-01-08"],
  ["Farid Nasser", "farid.n@example.com", "Dubai", "APAC", 1, "2024-01-22"],
  ["Grace Kim", "grace.kim@example.com", "Seoul", "APAC", 1, "2024-02-03"],
  ["Hiro Tanaka", "hiro.tanaka@example.com", "Osaka", "APAC", 1, "2024-02-14"],
  ["Isabella Rossi", "bella.rossi@example.com", "Milan", "EU", 1, "2024-03-01"],
  ["Jamal Wright", "jamal.wright@example.com", "Chicago", "US", 1, "2024-03-18"],
  ["Keiko Sato", "keiko.sato@example.com", "Nagoya", "APAC", 0, "2024-04-02"],
  ["Liam O'Brien", "liam.obrien@example.com", "Cork", "EU", 1, "2024-04-21"],
  ["Maya Patel", "maya.patel@example.com", "Mumbai", "APAC", 1, "2024-05-09"],
  ["Noah Meyer", "noah.meyer@example.com", "Hamburg", "EU", 1, "2024-05-27"],
  ["Olivia Brown", "olivia.brown@example.com", "London", "EU", 1, "2024-06-11"],
  ["Pedro Alvarez", "pedro.alv@example.com", "Madrid", "EU", 1, "2024-07-03"],
];

const SUPPLIERS: Array<[string, string, number]> = [
  ["Nordic Gadgets AB", "EU", 4.6],
  ["Shenzhen Electro", "APAC", 4.1],
  ["Pacific Textiles", "APAC", 3.9],
  ["Midwest Hardware Co", "US", 4.4],
  ["Alpine Audio GmbH", "EU", 4.8],
  ["Andes Naturals SA", "LATAM", 4.0],
];

const PRODUCTS: Array<[string, string, number, number]> = [
  // name, category, price, stock
  ["Mechanical Keyboard K1", "Electronics", 89.99, 120],
  ["Wireless Mouse M3", "Electronics", 34.5, 300],
  ["USB-C Hub 7-in-1", "Electronics", 49.0, 85],
  ["Noise-Canceling Headset", "Audio", 149.99, 60],
  ["Studio Desktop Mic", "Audio", 119.0, 45],
  ["Bluetooth Speaker Mini", "Audio", 59.99, 210],
  ["4K Webcam Pro", "Video", 129.0, 70],
  ["Ring Light 14\"", "Video", 39.99, 150],
  ["HDMI 2.1 Cable 2m", "Accessories", 14.99, 500],
  ["Laptop Stand Aluminum", "Accessories", 42.5, 180],
  ["Desk Mat Extended", "Accessories", 24.99, 260],
  ["Fitness Band X2", "Wearables", 79.0, 95],
  ["Smart Watch S", "Wearables", 199.99, 40],
  ["Running Socks 3-pack", "Apparel", 18.5, 400],
  ["Cycling Jersey Pro", "Apparel", 65.0, 110],
  ["Yoga Mat Eco 6mm", "Fitness", 32.0, 220],
];

const STATUSES = ["delivered", "delivered", "delivered", "delivered", "delivered", "shipped", "shipped", "shipped", "pending", "pending", "cancelled"] as const;

interface SeedRow {
  table: string;
  values: Array<string | number | null>;
}

function buildSeed(): { rows: SeedRow[]; counts: Record<string, number> } {
  const rng = makeRng(20240601);
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
  const rows: SeedRow[] = [];
  const counts: Record<string, number> = {};

  CUSTOMERS.forEach((c, i) =>
    rows.push({ table: "customers", values: [i + 1, c[0], c[1], c[2], c[3], c[4], c[5]] }),
  );
  SUPPLIERS.forEach((s, i) =>
    rows.push({ table: "suppliers", values: [i + 1, s[0], s[1], s[2]] }),
  );
  PRODUCTS.forEach((p, i) => {
    const supplierId = (i % SUPPLIERS.length) + 1;
    rows.push({ table: "products", values: [i + 1, p[0], p[1], p[2], p[3], supplierId] });
  });

  // Customers 1, 5, 7, 13 are "power buyers" — weighted so aggregates are interesting.
  const heavy = new Set([0, 4, 6, 12]);
  const customerPool: number[] = [];
  CUSTOMERS.forEach((_, i) => {
    const weight = heavy.has(i) ? 8 : 2;
    for (let w = 0; w < weight; w++) customerPool.push(i + 1);
  });

  let orderId = 0;
  let itemId = 0;
  const months = ["2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06", "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12", "2025-01", "2025-02"];

  for (let m = 0; m < months.length; m++) {
    const ordersThisMonth = 6 + Math.floor(rng() * 4); // 6-9 orders per month
    for (let k = 0; k < ordersThisMonth; k++) {
      orderId++;
      const customerId = pick(customerPool);
      const status = pick(STATUSES);
      const day = 1 + Math.floor(rng() * 27);
      const created = `${months[m]}-${String(day).padStart(2, "0")}`;

      // 1-4 distinct items per order
      const itemCount = 1 + Math.floor(rng() * 4);
      const usedProducts = new Set<number>();
      let total = 0;
      const itemRows: Array<[number, number, number]> = [];
      for (let j = 0; j < itemCount; j++) {
        let productId = Math.floor(rng() * PRODUCTS.length) + 1;
        let guard = 0;
        while (usedProducts.has(productId) && guard++ < 10) {
          productId = Math.floor(rng() * PRODUCTS.length) + 1;
        }
        usedProducts.add(productId);
        const product = PRODUCTS[productId - 1];
        const quantity = 1 + Math.floor(rng() * 3);
        const unitPrice = Math.round(product[2] * (0.95 + rng() * 0.1) * 100) / 100;
        total += quantity * unitPrice;
        itemRows.push([productId, quantity, unitPrice]);
      }
      total = Math.round(total * 100) / 100;

      // shipped_at: set once the order leaves the warehouse — pending and
      // cancelled orders keep it NULL (this is the lesson-4 teaching data).
      let shippedAt: string | null = null;
      if (status === "delivered" || status === "shipped") {
        const d = new Date(`${created}T00:00:00Z`);
        d.setUTCDate(d.getUTCDate() + 2 + Math.floor(rng() * 3));
        shippedAt = d.toISOString().slice(0, 10);
      }
      rows.push({ table: "orders", values: [orderId, customerId, status, total, created, shippedAt] });
      for (const [productId, quantity, unitPrice] of itemRows) {
        itemId++;
        rows.push({ table: "order_items", values: [itemId, orderId, productId, quantity, unitPrice] });
      }
    }
  }

  for (const t of ["customers", "suppliers", "products", "orders", "order_items"]) {
    counts[t] = rows.filter((r) => r.table === t).length;
  }
  return { rows, counts };
}

/* ---------------- lifecycle ---------------- */

async function insertSeed() {
  const { rows } = buildSeed();
  const statements: Array<[string, Array<string | number | null>]> = [];
  const columns: Record<string, string[]> = {
    customers: ["id", "name", "email", "city", "region", "active", "created_at"],
    suppliers: ["id", "name", "region", "rating"],
    products: ["id", "name", "category", "price", "stock", "supplier_id"],
    orders: ["id", "customer_id", "status", "total", "created_at", "shipped_at"],
    order_items: ["id", "order_id", "product_id", "quantity", "unit_price"],
  };
  for (const r of rows) {
    const cols = columns[r.table];
    const placeholders = cols.map(() => "?").join(", ");
    statements.push([
      `INSERT INTO ${r.table} (${cols.join(", ")}) VALUES (${placeholders})`,
      r.values,
    ]);
  }
  await db.$transaction(statements.map(([sql, args]) => db.$executeRawUnsafe(sql, ...args)));
}

/** Create tables if missing and seed when empty. Safe to call repeatedly.
 *  Self-heals stale db files: `CREATE TABLE IF NOT EXISTS` cannot add columns
 *  to an existing table, so if `orders` lacks a column the DDL expects
 *  (shipped_at was added later), the sample dataset is dropped and reseeded. */
// Single-flight: the playground fires /api/query and /api/stats (and the
// learn app can fire more) in parallel on cold start — without this lock
// both callers see an empty database and both seed, and the loser dies on
// "UNIQUE constraint failed: customers.id". The promise lives on globalThis
// because Next bundles sample-db into EACH route separately — a module-level
// variable would give every route its own lock and serialize nothing.
const globalForSeed = globalThis as unknown as { __seeqlEnsure?: Promise<void> };

export function ensureDatabase(): Promise<void> {
  if (!globalForSeed.__seeqlEnsure) {
    globalForSeed.__seeqlEnsure = runEnsure().catch((err) => {
      globalForSeed.__seeqlEnsure = undefined; // failed — allow the next call to retry
      throw err;
    });
  }
  return globalForSeed.__seeqlEnsure;
}

async function runEnsure(): Promise<void> {
  for (const stmt of DDL) await db.$executeRawUnsafe(stmt);
  const cols = (await db.$queryRawUnsafe(`PRAGMA table_info(orders)`)) as Array<{ name: string }>;
  if (!cols.some((c) => c.name === "shipped_at")) {
    await resetDatabase();
    return;
  }
  const res = (await db.$queryRawUnsafe(`SELECT COUNT(*) AS n FROM customers`)) as Array<{
    n: number | bigint;
  }>;
  if (Number(res[0]?.n ?? 0) === 0) await insertSeed();
}

/** Drop + recreate + reseed everything. */
export async function resetDatabase(): Promise<Record<string, number>> {
  for (const t of SAMPLE_TABLES) await db.$executeRawUnsafe(`DROP TABLE IF EXISTS ${t}`);
  for (const stmt of DDL) await db.$executeRawUnsafe(stmt);
  await insertSeed();
  return buildSeed().counts;
}
