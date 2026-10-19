import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Runtime visibility into the db integrity gate. Read-only probe of the live
// storefront db via Prisma; the boot-time self-heal lives in scripts/db-health.ts
// (wired into `dev` and `prebuild`), this endpoint only reports.
export const dynamic = "force-dynamic";

const CORE_TABLES = [
  "orders", "order_items", "customers", "products", "suppliers",
  "invoices", "payments", "expenses",
];

export async function GET() {
  try {
    const masterRows = await db.$queryRawUnsafe<{ name: string }[]>(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    const tables = masterRows.map(r => r.name);
    const missing = CORE_TABLES.filter(t => !tables.includes(t));
    let orders = -1;
    if (tables.includes("orders")) {
      const c = await db.$queryRawUnsafe<{ c: number }[]>("SELECT count(*) as c FROM orders");
      orders = Number(c[0]?.c ?? -1);
    }
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
