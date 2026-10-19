import { NextResponse } from "next/server";
import { Database } from "bun:sqlite";
import path from "node:path";

// Runtime visibility into the db integrity gate. Read-only probe of the live
// storefront db; the boot-time self-heal lives in scripts/db-health.ts (wired
// into `dev` and `prebuild`), this endpoint only reports.
export const dynamic = "force-dynamic";

const CORE_TABLES = [
  "orders", "order_items", "customers", "products", "suppliers",
  "invoices", "payments", "expenses",
];

export async function GET() {
  const file = path.join(process.cwd(), "db", "custom.db");
  try {
    const db = new Database(file, { readonly: true });
    const tables = db
      .query("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((r: any) => r.name as string);
    const missing = CORE_TABLES.filter(t => !tables.includes(t));
    const orders = tables.includes("orders")
      ? (db.query("SELECT count(*) c FROM orders").get() as any).c
      : -1;
    db.close();
    const healthy = missing.length === 0 && orders >= 50 && tables.length >= 20;
    return NextResponse.json({
      healthy,
      tables: tables.length,
      orders,
      missing,
      note: healthy ? "storefront db intact" : "db regressed — heals on next boot (bun run db:health)",
    });
  } catch (e: any) {
    return NextResponse.json(
      { healthy: false, tables: 0, orders: -1, missing: CORE_TABLES, note: e?.message ?? "probe failed" },
      { status: 503 }
    );
  }
}
