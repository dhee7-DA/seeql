import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureDatabase } from "@/lib/sample-db";

export async function GET() {
  try {
    await ensureDatabase();
    const res = (await db.$queryRawUnsafe(
      `SELECT
        (SELECT COUNT(*) FROM customers) AS customers,
        (SELECT COUNT(*) FROM suppliers) AS suppliers,
        (SELECT COUNT(*) FROM products)  AS products,
        (SELECT COUNT(*) FROM orders)    AS orders,
        (SELECT COUNT(*) FROM order_items) AS order_items`,
    )) as Array<Record<string, unknown>>;
    const r = res[0] ?? {};
    const counts: Record<string, number> = {};
    let total = 0;
    for (const key of ["customers", "suppliers", "products", "orders", "order_items"]) {
      const n = Number(r[key] ?? 0);
      counts[key] = n;
      total += n;
    }
    return NextResponse.json({ ok: true, counts, total });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
