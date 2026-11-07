// Lesson 76-78 dialect fact verification. Run: npx tsx scripts/l76-probe.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function main() {
  await resetDatabase();
  console.log("reset done");
  const show = async (label: string, sql: string) => {
    const r = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
    console.log(label + ":", r.map((x) => Object.values(x).join(" | ")).join(" ;; "));
  };

  await show("int division 1/2", "SELECT 1/2 AS a, 7/2 AS b, typeof(1/2) AS t");
  await show("div by zero", "SELECT 1/0 AS a, 0/0 AS b");
  await show("real division", "SELECT 1.0/2 AS a, typeof(1.0/2) AS t");
  await show("casts", "SELECT CAST('12abc' AS INTEGER) a, CAST('abc' AS INTEGER) b, CAST(NULL AS INTEGER) c, CAST('129.90' AS INTEGER) d");
  await show("null concat", "SELECT NULL || 'x' AS a, 'a' || NULL AS b, IFNULL(NULL || 'x', 'fallback') AS c");
  await show("date diff", "SELECT julianday('2024-03-01') - julianday('2024-02-01') AS leap_feb, julianday('2024-01-15') - julianday('2024-01-10') AS d5");
  await show("month bucket", "SELECT SUBSTR('2024-07-15', 1, 7) AS m, strftime('%Y-%m', '2024-07-15') AS s");
  await show("date funcs", "SELECT date('2024-01-31', '+1 month') AS clamp, date('2024-01-31', '+30 days') AS d30");
  await show("compare 12500", "SELECT '12,500' > '1500' AS text_cmp, CAST('12,500' AS INTEGER) > 1500 AS cast_cmp");
  await show("bool storage", "SELECT typeof(1) AS t1, typeof('1') AS t2, 1 = '1' AS loose_eq, CAST('1' AS INTEGER) = 1 AS strict_eq");
  await show("glob vs like", "SELECT 'user123' GLOB 'user*' AS g, 'user123' LIKE 'user%' AS l");
  await show("order with null", "SELECT v FROM (SELECT 2 AS v UNION ALL SELECT NULL UNION ALL SELECT 1) ORDER BY v");
  await show("max of nulls", "SELECT MAX(v) AS mx, COUNT(v) AS cv, COUNT(*) AS cs FROM (SELECT 2 AS v UNION ALL SELECT NULL UNION ALL SELECT 1)");
  await show("null ship", "SELECT COUNT(*) n FROM orders WHERE shipped_at IS NULL");
  await show("regions", "SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY n DESC, region");
  await show("null email probe", "SELECT COUNT(*) n FROM customers WHERE email IS NULL");
  await show("avg shipped lag", "SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 1) lag FROM orders WHERE shipped_at IS NOT NULL");
  await db.$disconnect();
}
main();
