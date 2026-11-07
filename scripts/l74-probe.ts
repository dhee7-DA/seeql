// Verify every EQP text lesson 74 will cite. Run: npx tsx scripts/l74-probe.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function show(label: string, sql: string) {
  const r = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  console.log(`-- ${label}`);
  for (const row of r) console.log("  ", Object.values(row).join(" | "));
}

async function main() {
  await resetDatabase();
  console.log("reset done");

  await show("baseline window count", `EXPLAIN QUERY PLAN SELECT COUNT(*) FROM events_scale WHERE event_ts >= '2025-06-01' AND event_ts < '2025-07-01'`);

  // in-txn index experiments (rolled back automatically? — this script uses
  // plain statements; we DROP at the end instead)
  await db.$executeRawUnsafe(`CREATE INDEX idx_scale_user ON events_scale(user_id)`);
  await show("point filter with idx_scale_user", `EXPLAIN QUERY PLAN SELECT COUNT(*) FROM events_scale WHERE user_id = 4321`);
  await db.$executeRawUnsafe(`DROP INDEX idx_scale_user`);

  await db.$executeRawUnsafe(`CREATE INDEX idx_scale_user_ts ON events_scale(user_id, event_ts)`);
  await show("point+sort with composite", `EXPLAIN QUERY PLAN SELECT id, event_ts FROM events_scale WHERE user_id = 4321 ORDER BY event_ts DESC LIMIT 3`);
  await show("date-only filter with composite", `EXPLAIN QUERY PLAN SELECT COUNT(*) FROM events_scale WHERE event_ts >= '2025-06-01'`);
  await db.$executeRawUnsafe(`DROP INDEX idx_scale_user_ts`);

  await db.$executeRawUnsafe(`CREATE INDEX idx_scale_action_norm ON events_scale(LOWER(TRIM(action)))`);
  await show("canonical group-by with expression index", `EXPLAIN QUERY PLAN SELECT LOWER(TRIM(action)) a, COUNT(*) n FROM events_scale GROUP BY a`);
  await db.$executeRawUnsafe(`DROP INDEX idx_scale_action_norm`);

  await db.$executeRawUnsafe(`CREATE INDEX idx_scale_bots ON events_scale(user_id) WHERE user_id >= 9000`);
  await show("bot count with partial index", `EXPLAIN QUERY PLAN SELECT COUNT(*) FROM events_scale WHERE user_id >= 9000`);
  await show("human count with partial index present", `EXPLAIN QUERY PLAN SELECT COUNT(*) FROM events_scale WHERE user_id < 9000`);
  await db.$executeRawUnsafe(`DROP INDEX idx_scale_bots`);

  await db.$executeRawUnsafe(`CREATE INDEX idx_scale_action_amount ON events_scale(action, amount_cents)`);
  await show("raw action census with covering pair", `EXPLAIN QUERY PLAN SELECT action, COUNT(*) n FROM events_scale GROUP BY action`);
  await db.$executeRawUnsafe(`DROP INDEX idx_scale_action_amount`);

  // ANALYZE + stat1 check (sandboxed in real problems)
  await db.$executeRawUnsafe(`CREATE INDEX idx_scale_user ON events_scale(user_id)`);
  await db.$executeRawUnsafe(`ANALYZE`);
  await show("sqlite_stat1 after ANALYZE", `SELECT tbl, idx, stat FROM sqlite_stat1 ORDER BY tbl`);
  await db.$executeRawUnsafe(`DROP INDEX idx_scale_user`);
  await db.$executeRawUnsafe(`DROP TABLE IF EXISTS sqlite_stat1`);

  // window count number for l74
  const r = (await db.$queryRawUnsafe(`SELECT COUNT(*) n FROM events_scale WHERE event_ts >= '2025-12-01'`)) as Array<Record<string, unknown>>;
  console.log("december count:", Number(r[0].n));

  await db.$disconnect();
}
main();
