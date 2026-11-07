// Scale-tier feasibility probe: build events_scale (1M rows) inside SQLite
// via one recursive-CTE INSERT, measure time + file growth, and print every
// fact the Module 15 lessons will cite. Run: npx tsx scripts/scale-probe.ts
import { PrismaClient } from "@prisma/client";

async function main() {
const db = new PrismaClient();
const q = async (sql: string) => (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
const one = async (sql: string): Promise<number> => Number(Object.values((await q(sql))[0] ?? { n: 0 })[0]);

const t0 = Date.now();
await db.$executeRawUnsafe(`DROP TABLE IF EXISTS events_scale`);
await db.$executeRawUnsafe(`CREATE TABLE events_scale (
  id INTEGER PRIMARY KEY,
  event_ts TEXT NOT NULL,
  user_id INTEGER,
  action TEXT NOT NULL,
  page TEXT NOT NULL,
  amount_cents TEXT
)`);
console.log("ddl ms:", Date.now() - t0);

const t1 = Date.now();
// base 1M — deterministic arithmetic on i (the seeded generator, SQL-side)
await db.$executeRawUnsafe(`
INSERT INTO events_scale (event_ts, user_id, action, page, amount_cents)
WITH RECURSIVE seq(i) AS (
  SELECT 1 UNION ALL SELECT i + 1 FROM seq WHERE i < 1000000
)
SELECT
  CASE WHEN i % 23 = 9
       THEN datetime(1735700400 + i * 31, 'unixepoch')
       ELSE REPLACE(datetime(1735700400 + i * 31, 'unixepoch'), ' ', 'T')
  END,
  CASE WHEN i % 97 = 3 THEN NULL
       WHEN i % 101 = 7 THEN 9000 + (i % 40)
       ELSE 1 + (i * 7919) % 5000
  END,
  CASE i % 5
    WHEN 0 THEN CASE WHEN i % 13 = 0 THEN 'Page_View'    ELSE 'page_view' END
    WHEN 1 THEN CASE WHEN i % 13 = 0 THEN 'Product_View' ELSE 'product_view' END
    WHEN 2 THEN CASE WHEN i % 13 = 0 THEN ' add_to_cart' ELSE 'add_to_cart' END
    WHEN 3 THEN CASE WHEN i % 13 = 0 THEN 'CHECKOUT'     ELSE 'checkout' END
    ELSE      CASE WHEN i % 13 = 0 THEN 'refund '        ELSE 'refund' END
  END,
  CASE WHEN i % 11 = 0
       THEN (CASE i % 8 WHEN 0 THEN 'home' WHEN 1 THEN 'catalog' WHEN 2 THEN 'cart'
                        WHEN 3 THEN 'pay'  WHEN 4 THEN 'confirm' WHEN 5 THEN 'account'
                        WHEN 6 THEN 'search' ELSE 'profile' END) || ' '
       ELSE (CASE i % 8 WHEN 0 THEN 'home' WHEN 1 THEN 'catalog' WHEN 2 THEN 'cart'
                        WHEN 3 THEN 'pay'  WHEN 4 THEN 'confirm' WHEN 5 THEN 'account'
                        WHEN 6 THEN 'search' ELSE 'profile' END)
  END,
  CASE
    WHEN i % 5 = 3 THEN
      CASE WHEN i % 503 = 5
           THEN (CASE (i / 503) % 4 WHEN 0 THEN '12,500' WHEN 1 THEN 'n/a' WHEN 2 THEN '3,140.50' ELSE '—' END)
           ELSE CAST(1200 + (i * 37) % 8800 AS TEXT)
      END
    WHEN i % 5 = 4 THEN CAST(300 + (i * 53) % 2900 AS TEXT)
    ELSE NULL
  END
FROM seq
`);
console.log("insert-1M ms:", Date.now() - t1);

const t2 = Date.now();
// replays: exact copies of every row whose id ends the 13-of-97 class
await db.$executeRawUnsafe(`
INSERT INTO events_scale (event_ts, user_id, action, page, amount_cents)
SELECT event_ts, user_id, action, page, amount_cents FROM events_scale WHERE id % 97 = 13`);
// one burst: 7 extra copies of row 500000
await db.$executeRawUnsafe(`
INSERT INTO events_scale (event_ts, user_id, action, page, amount_cents)
SELECT e.event_ts, e.user_id, e.action, e.page, e.amount_cents
FROM events_scale e
JOIN (SELECT 1 a UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
      UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7) k
WHERE e.id = 500000`);
console.log("replays ms:", Date.now() - t2);

console.log("total rows:", await one(`SELECT COUNT(*) n FROM events_scale`));
const sz = await q(`SELECT page_count * page_size / 1048576.0 mb FROM pragma_page_count(), pragma_page_size()`);
console.log("db size MB:", sz[0].mb);

console.log("\n== facts the lessons cite ==");
console.log("distinct actions raw:", await one(`SELECT COUNT(DISTINCT action) n FROM events_scale`));
console.log("action census:", await q(`SELECT action, COUNT(*) n FROM events_scale GROUP BY action ORDER BY n DESC`));
console.log("null users:", await one(`SELECT COUNT(*) n FROM events_scale WHERE user_id IS NULL`));
console.log("bot orphans:", await one(`SELECT COUNT(*) n FROM events_scale WHERE user_id >= 9000`));
console.log("distinct users (non-null, <9000):", await one(`SELECT COUNT(DISTINCT user_id) n FROM events_scale WHERE user_id < 9000`));
console.log("drifted ts:", await one(`SELECT COUNT(*) n FROM events_scale WHERE event_ts LIKE '% %'`));
console.log("whitespace pages:", await one(`SELECT COUNT(*) n FROM events_scale WHERE page LIKE '% '`));
console.log("dirty money rows:", await one(`SELECT COUNT(*) n FROM events_scale WHERE amount_cents IN ('12,500','n/a','3,140.50','—')`));
console.log("checkout rows:", await one(`SELECT COUNT(*) n FROM events_scale WHERE LOWER(TRIM(action)) = 'checkout'`));
console.log("refund rows:", await one(`SELECT COUNT(*) n FROM events_scale WHERE LOWER(TRIM(action)) = 'refund'`));
console.log("dup groups (exact fingerprint):", await one(`SELECT COUNT(*) n FROM (SELECT event_ts, user_id, action, page, amount_cents FROM events_scale GROUP BY 1,2,3,4,5 HAVING COUNT(*) > 1)`));
console.log("excess rows:", await one(`SELECT SUM(c) - COUNT(*) n FROM (SELECT COUNT(*) c FROM events_scale GROUP BY event_ts, user_id, action, page, amount_cents)`));
console.log("min/max ts:", await q(`SELECT MIN(event_ts) mn, MAX(event_ts) mx FROM events_scale`));
console.log("canonical action census:", await q(`SELECT LOWER(TRIM(action)) a, COUNT(*) n FROM events_scale GROUP BY a ORDER BY n DESC`));
console.log("amount sum (numeric-text castable):", await one(`SELECT SUM(CAST(amount_cents AS INTEGER)) n FROM events_scale WHERE amount_cents GLOB '[0-9]*'`));
console.log("pages census:", await q(`SELECT TRIM(page) p, COUNT(*) n FROM events_scale GROUP BY p ORDER BY n DESC`));

console.log("\n== timing feel (dev) ==");
let t3 = Date.now();
console.log("count(*):", await one(`SELECT COUNT(*) n FROM events_scale`), `${Date.now() - t3} ms`);
t3 = Date.now();
console.log("filter count:", await one(`SELECT COUNT(*) n FROM events_scale WHERE user_id = 1234`), `${Date.now() - t3} ms`);
t3 = Date.now();
console.log("group by:", (await q(`SELECT action, COUNT(*) n FROM events_scale GROUP BY action`)).length, `${Date.now() - t3} ms`);
t3 = Date.now();
console.log("order+limit:", (await q(`SELECT id, event_ts FROM events_scale ORDER BY event_ts DESC LIMIT 5`)).length, `${Date.now() - t3} ms`);

await db.$disconnect();
}
main();
