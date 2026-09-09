import { db } from "../src/lib/db";
async function main() {
  const rows = await db.$queryRawUnsafe(`
    WITH monthly AS (
      SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) AS spend
      FROM expenses GROUP BY mon
    ),
    stats AS (
      SELECT AVG(spend) AS a, AVG(spend*spend) - AVG(spend)*AVG(spend) AS var
      FROM monthly
    ),
    newton(n, g) AS (
      SELECT 0, (SELECT var FROM stats) / 2.0 + 0.5
      UNION ALL
      SELECT n + 1, (g + (SELECT var FROM stats) / g) / 2.0
      FROM newton WHERE n < 30
    )
    SELECT ROUND((SELECT a FROM stats) / 100.0, 2) AS avg_spend,
           ROUND((SELECT var FROM stats) / 10000.0, 2) AS var_dollars2,
           ROUND((SELECT g FROM newton WHERE n = 30) / 100.0, 2) AS sd_spend`) as Array<Record<string, unknown>>;
  console.log(JSON.stringify(rows));
  await db.$disconnect();
}
main();
