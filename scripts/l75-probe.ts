// Lesson 75 fact verification. Run: npx tsx scripts/l75-probe.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function main() {
  await resetDatabase();
  console.log("reset done");
  const q = async (sql: string) => (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  const one = async (sql: string): Promise<number> => Number(Object.values((await q(sql))[0] ?? { n: 0 })[0]);

  console.log("text-compare > '1500':", await one(`SELECT COUNT(*) n FROM events_scale WHERE amount_cents > '1500'`));
  console.log("numeric-cast > 1500:", await one(`SELECT COUNT(*) n FROM events_scale WHERE amount_cents GLOB '[0-9]*' AND CAST(amount_cents AS INTEGER) > 1500`));
  console.log("june substr:", await one(`SELECT COUNT(*) n FROM events_scale WHERE SUBSTR(event_ts, 1, 7) = '2025-06'`));
  console.log("june range:", await one(`SELECT COUNT(*) n FROM events_scale WHERE event_ts >= '2025-06-01' AND event_ts < '2025-07-01'`));
  console.log("june range normalized:", await one(`SELECT COUNT(*) n FROM events_scale WHERE REPLACE(event_ts, ' ', 'T') >= '2025-06-01' AND REPLACE(event_ts, ' ', 'T') < '2025-07-01'`));
  console.log("page_view IN-fold:", await one(`SELECT COUNT(*) n FROM events_scale WHERE action IN ('page_view', 'Page_View')`));
  console.log("page_view OR:", await one(`SELECT COUNT(*) n FROM events_scale WHERE action = 'page_view' OR action = 'Page_View'`));
  console.log("cross OR raw:", await one(`SELECT COUNT(*) n FROM events_scale WHERE user_id = 4321 OR LOWER(TRIM(action)) = 'refund'`));
  console.log("user rows:", await one(`SELECT COUNT(*) n FROM events_scale WHERE user_id = 4321`));
  console.log("refund rows:", await one(`SELECT COUNT(*) n FROM events_scale WHERE LOWER(TRIM(action)) = 'refund'`));
  console.log("intersection:", await one(`SELECT COUNT(*) n FROM events_scale WHERE user_id = 4321 AND LOWER(TRIM(action)) = 'refund'`));
  console.log("distinct fingerprints:", await one(`SELECT COUNT(*) n FROM (SELECT DISTINCT event_ts, user_id, action, page, amount_cents FROM events_scale)`));
  console.log("dirty per string:", await q(`SELECT amount_cents, COUNT(*) n FROM events_scale WHERE amount_cents IN ('12,500', 'n/a', '3,140.50', '—') GROUP BY amount_cents ORDER BY n DESC, amount_cents`));
  console.log("canonical pages:", await q(`SELECT TRIM(page) p, COUNT(*) n FROM events_scale GROUP BY p ORDER BY n DESC, p`));
  console.log("checkout money:", await one(`SELECT SUM(CAST(amount_cents AS INTEGER)) n FROM events_scale WHERE LOWER(TRIM(action)) = 'checkout' AND amount_cents GLOB '[0-9]*'`));
  console.log("per-action census:", await q(`SELECT LOWER(TRIM(action)) a, COUNT(*) n, SUM(CASE WHEN amount_cents GLOB '[0-9]*' THEN CAST(amount_cents AS INTEGER) ELSE 0 END) cents FROM events_scale GROUP BY a ORDER BY a`));
  console.log("refund money:", await one(`SELECT SUM(CAST(amount_cents AS INTEGER)) n FROM events_scale WHERE LOWER(TRIM(action)) = 'refund' AND amount_cents GLOB '[0-9]*'`));
  const eqp = (await q(`EXPLAIN QUERY PLAN SELECT COUNT(*) FROM events_scale WHERE CAST(amount_cents AS INTEGER) > 1500`)) as Array<Record<string, unknown>>;
  console.log("EQP cast filter:", eqp.map((r) => Object.values(r).join(" | ")).join(" ;; "));

  await db.$disconnect();
}
main();
