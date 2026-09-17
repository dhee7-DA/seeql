/**
 * Standalone runner for ensureDatabase() — the storefront self-heal.
 *
 * Why this exists: dev.sh runs `prisma db push --accept-data-loss` at every
 * container boot, and the Prisma schema only models 5 tables (no shipped_at
 * on orders, no finance tables). After a boot that touches the db file, the
 * storefront is left degraded (missing columns/tables) until someone hits
 * /api/stats. Twice now (2026-09-11, 2026-09-12) this silently broke
 * case-audit (254/800 cases failing on "no such column: shipped_at") and the
 * broken binary got committed. Running this script right after db:push in
 * dev.sh makes the heal deterministic instead of user-triggered.
 *
 * Usage: bun scripts/db-ensure.ts
 */
import { ensureDatabase } from "@/lib/sample-db";
import { db } from "@/lib/db";

await ensureDatabase();

const tables = (
  (await db.$queryRawUnsafe(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`,
  )) as Array<{ name: string }>
).map((r) => r.name);

const orderCols = (
  (await db.$queryRawUnsafe(`PRAGMA table_info(orders)`)) as Array<{ name: string }>
).map((c) => c.name);

const counts: Array<[string, number]> = [];
for (const t of tables) {
  const rows = (await db.$queryRawUnsafe(`SELECT COUNT(*) AS n FROM ${t}`)) as Array<{
    n: number | bigint;
  }>;
  counts.push([t, Number(rows[0]?.n ?? 0)]);
}

console.log("tables:", tables.join(", "));
console.log("orders columns:", orderCols.join(", "));
console.log("row counts:", counts.map(([t, n]) => `${t}=${n}`).join(" "));

const ok =
  tables.length === 9 &&
  orderCols.includes("shipped_at") &&
  tables.includes("ledger_entries");
if (!ok) {
  console.error("DB STILL DEGRADED — ensureDatabase did not fully heal");
  process.exit(1);
}
console.log("DB OK — 9 tables, shipped_at present, finance books present");
