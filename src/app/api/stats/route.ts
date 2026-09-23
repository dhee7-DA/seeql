import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureDatabase } from "@/lib/sample-db";
import { ensureWorlds, ALL_WORLD_TABLES } from "@/lib/worlds";

const STOREFRONT_TABLES = [
  "customers",
  "suppliers",
  "products",
  "orders",
  "order_items",
] as const;

export async function GET() {
  try {
    await ensureDatabase();
    await ensureWorlds();
    const tables = [...STOREFRONT_TABLES, ...ALL_WORLD_TABLES];
    const counts: Record<string, number> = {};
    let total = 0;
    for (const t of tables) {
      const res = (await db.$queryRawUnsafe(
        `SELECT COUNT(*) AS n FROM ${t}`,
      )) as Array<{ n: number | bigint }>;
      const n = Number(res[0]?.n ?? 0);
      counts[t] = n;
      total += n;
    }
    return NextResponse.json({ ok: true, counts, total });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
