// DB integrity gate — detects the recurring runtime regression of db/custom.db
// (24-table storefront silently shrinking to 6 tables, seen 5x this session)
// and self-heals by copying the committed pristine snapshot over it.
//
// Usage:
//   bun scripts/db-health.ts          -> exit 0 healthy, exit 1 unhealthy (no fix)
//   bun scripts/db-health.ts --fix    -> restore from db/custom.healthy.db when unhealthy
import { Database } from "bun:sqlite";
import { copyFileSync, existsSync } from "node:fs";

const DB = "db/custom.db";
const SNAPSHOT = "db/custom.healthy.db";

const CORE_TABLES = [
  "orders", "order_items", "customers", "products", "suppliers",
  "invoices", "payments", "expenses",
];

function probe(path: string) {
  try {
    const db = new Database(path, { readonly: true });
    const tables = db
      .query("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((r: any) => r.name);
    const missing = CORE_TABLES.filter(t => !tables.includes(t));
    let orders = -1;
    if (tables.includes("orders")) orders = (db.query("SELECT count(*) c FROM orders").get() as any).c;
    db.close();
    return { tables: tables.length, missing, orders, ok: missing.length === 0 && orders >= 50 && tables.length >= 20 };
  } catch {
    return { tables: 0, missing: CORE_TABLES, orders: -1, ok: false };
  }
}

const before = probe(DB);
if (before.ok) {
  console.log(`[db-gate] healthy: ${before.tables} tables, ${before.orders} orders, core tables intact`);
  process.exit(0);
}

console.error(`[db-gate] UNHEALTHY: ${before.tables} tables, orders=${before.orders}, missing: ${before.missing.join(", ")}`);

if (process.argv.includes("--fix") && existsSync(SNAPSHOT)) {
  copyFileSync(SNAPSHOT, DB);
  const after = probe(DB);
  if (after.ok) {
    console.log(`[db-gate] HEALED: restored ${SNAPSHOT} -> ${DB} (${after.tables} tables, ${after.orders} orders)`);
    process.exit(0);
  }
  console.error("[db-gate] restore attempted but db still unhealthy");
  process.exit(1);
}

console.error(`[db-gate] run with --fix to restore from ${SNAPSHOT}`);
process.exit(1);
