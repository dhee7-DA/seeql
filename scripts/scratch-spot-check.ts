import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

// Completed SQL exactly as the audit substitutes answers into m03 templates.
const SPOTS: Array<[string, string]> = [
  ["l17-f2 city/region stack",
`SELECT city FROM customers
UNION ALL
SELECT region FROM suppliers
ORDER BY city;`],
  ["l17-f5 labeled arm2 fix",
`SELECT name, 'customer' AS kind FROM customers
UNION ALL
SELECT name, 'supplier' FROM suppliers;`],
  ["l18-f1 labeled directory",
`SELECT name, 'customer' AS kind FROM customers
UNION ALL
SELECT name, 'supplier' FROM suppliers
ORDER BY kind, name;`],
  ["l22-f1 fate labels",
`SELECT status,
  CASE WHEN status = 'cancelled' THEN 'dead'
       ELSE 'alive'
  END AS fate
FROM orders
GROUP BY status, fate
ORDER BY status;`],
  ["l22-f4 two labels side by side",
`SELECT id,
  CASE WHEN total > 800 THEN 'big'
       WHEN total > 300 THEN 'medium'
       ELSE 'small' END AS size_band,
  CASE WHEN shipped_at IS NULL THEN 'unshipped'
       ELSE 'shipped' END AS ship_band
FROM orders
ORDER BY id
LIMIT 15;`],
  ["l37-f4 workflow sort fixed",
`SELECT status, COUNT(*) AS n
FROM orders
GROUP BY status
ORDER BY CASE status
  WHEN 'pending'   THEN 1
  WHEN 'shipped'   THEN 2
  WHEN 'delivered' THEN 3
  ELSE 4
END;`],
];

async function main() {
  await resetDatabase();
  const seen = (v: unknown): string =>
    JSON.stringify(v, (_k, x) => (typeof x === "bigint" ? Number(x) : x));
  for (const [label, sql] of SPOTS) {
    try {
      const rows = (await db.$queryRawUnsafe(sql)) as unknown[];
      const head = (rows as unknown[]).slice(0, 4);
      console.log(`OK ${label} (${rows.length} rows) e.g. ${seen(head)}`);
    } catch (e) {
      console.log(`ERR ${label} => ${(e as Error).message.split("\n")[0]}`);
    }
  }
  process.exit(0);
}
main();
