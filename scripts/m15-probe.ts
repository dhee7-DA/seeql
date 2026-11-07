// Module 15 webhook + scale facts — run AFTER sample-db.ts wiring.
// Rebuilds the whole dataset via resetDatabase() (the real seeding path),
// then prints every number the lessons cite. Run: npx tsx scripts/m15-probe.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function main() {
  const t0 = Date.now();
  const counts = await resetDatabase();
  console.log("reset ms:", Date.now() - t0);
  console.log("counts:", JSON.stringify(counts));

  const q = async (sql: string) => (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  const one = async (sql: string): Promise<number> => Number(Object.values((await q(sql))[0] ?? { n: 0 })[0]);

  console.log("\n== webhook facts ==");
  console.log("total:", await one(`SELECT COUNT(*) n FROM webhook_events`));
  console.log("by source:", await q(`SELECT source, COUNT(*) n FROM webhook_events GROUP BY source ORDER BY n DESC`));
  console.log("invalid json:", await one(`SELECT COUNT(*) n FROM webhook_events WHERE json_valid(payload) = 0`));
  console.log("string totals:", await one(`SELECT COUNT(*) n FROM webhook_events WHERE source = 'checkout' AND json_valid(payload) = 1 AND json_type(payload, '$.total_cents') = 'text'`));
  console.log("int totals:", await one(`SELECT COUNT(*) n FROM webhook_events WHERE source = 'checkout' AND json_valid(payload) = 1 AND json_type(payload, '$.total_cents') = 'integer'`));
  console.log("missing email key:", await one(`SELECT COUNT(*) n FROM webhook_events WHERE source = 'checkout' AND json_valid(payload) = 1 AND json_type(payload, '$.email') IS NULL`));
  console.log("null email value:", await one(`SELECT COUNT(*) n FROM webhook_events WHERE source = 'checkout' AND json_valid(payload) = 1 AND json_type(payload, '$.email') = 'null'`));
  console.log("present email:", await one(`SELECT COUNT(*) n FROM webhook_events WHERE source = 'checkout' AND json_valid(payload) = 1 AND json_type(payload, '$.email') = 'text'`));
  console.log("string amounts (billing):", await one(`SELECT COUNT(*) n FROM webhook_events WHERE source = 'billing' AND json_valid(payload) = 1 AND json_type(payload, '$.amount_cents') = 'text'`));
  console.log("dirty billing status:", await one(`SELECT COUNT(*) n FROM webhook_events WHERE source = 'billing' AND json_extract(payload, '$.status') = 'Paid'`));
  console.log("lowercase countries:", await one(`SELECT COUNT(*) n FROM webhook_events WHERE source = 'kyc' AND json_extract(payload, '$.country') IN ('de','us','jp','br','in')`));
  console.log("dup exact groups:", await one(`SELECT COUNT(*) n FROM (SELECT source, received_at, payload FROM webhook_events GROUP BY 1,2,3 HAVING COUNT(*) > 1)`));
  console.log("excess rows:", await one(`SELECT SUM(c) - COUNT(*) n FROM (SELECT COUNT(*) c FROM webhook_events GROUP BY source, received_at, payload)`));
  console.log("checkout total cents (numeric, cast):", await one(`SELECT SUM(CAST(json_extract(payload,'$.total_cents') AS INTEGER)) n FROM webhook_events WHERE source='checkout' AND json_valid(payload)=1`));
  console.log("sample checkout:", (await q(`SELECT payload FROM webhook_events WHERE source='checkout' LIMIT 1`))[0].payload);
  console.log("sample invalid:", (await q(`SELECT payload FROM webhook_events WHERE json_valid(payload) = 0 LIMIT 1`))[0].payload);

  console.log("\n== scale re-verify (post-reset) ==");
  console.log("events_scale rows:", await one(`SELECT COUNT(*) n FROM events_scale`));
  console.log("dup groups:", await one(`SELECT COUNT(*) n FROM (SELECT event_ts, user_id, action, page, amount_cents FROM events_scale GROUP BY 1,2,3,4,5 HAVING COUNT(*) > 1)`));
  console.log("null users:", await one(`SELECT COUNT(*) n FROM events_scale WHERE user_id IS NULL`));

  console.log("\n== timing feel (fresh, no indexes) ==");
  let t = Date.now();
  await one(`SELECT COUNT(*) n FROM events_scale WHERE user_id = 4321`);
  console.log("pointless filter count:", `${Date.now() - t} ms`);
  t = Date.now();
  await q(`SELECT LOWER(TRIM(action)) a, COUNT(*) n FROM events_scale GROUP BY a ORDER BY n DESC`);
  console.log("canonical group-by:", `${Date.now() - t} ms`);
  t = Date.now();
  await q(`SELECT id, event_ts, amount_cents FROM events_scale WHERE LOWER(TRIM(action)) = 'checkout' AND amount_cents GLOB '[0-9]*' ORDER BY CAST(amount_cents AS INTEGER) DESC LIMIT 5`);
  console.log("dirty-ish top5:", `${Date.now() - t} ms`);

  await db.$disconnect();
}
main();
