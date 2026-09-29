// M1 gauntlet — hard-tier predict facts (round 2)
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  return (await db.$queryRawUnsafe(sql)) as T[];
}

async function main() {
  await resetDatabase();
  console.log("A aud/access>100:", await q(`SELECT COUNT(*) n FROM products WHERE category IN ('Audio','Accessories') AND price > 100`));
  console.log("B >200 by status:", await q(`SELECT status, COUNT(*) n FROM orders WHERE total > 200 GROUP BY status ORDER BY status`));
  console.log("C like PRO ci:", await q(`SELECT name FROM products WHERE name LIKE '%PRO%'`));
  console.log("D audio names+prices:", await q(`SELECT name, price FROM products WHERE category = 'Audio' ORDER BY price DESC`));
  console.log("E accessories names+prices:", await q(`SELECT name, price FROM products WHERE category = 'Accessories' ORDER BY price`));
  console.log("F EU active:", await q(`SELECT COUNT(*) n FROM customers WHERE region = 'EU' AND active = 1`));
  console.log("G delivered>200:", await q(`SELECT COUNT(*) n FROM orders WHERE status = 'delivered' AND total > 200`));
  console.log("H status pending totals:", await q(`SELECT ROUND(MIN(total),2) mn, ROUND(MAX(total),2) mx FROM orders WHERE status = 'pending'`));
  console.log("I products stock desc top3:", await q(`SELECT name, stock FROM products ORDER BY stock DESC, id ASC LIMIT 3`));
  console.log("J orders per status avg:", await q(`SELECT status, ROUND(AVG(total),2) avg_total FROM orders GROUP BY status ORDER BY status`));
  console.log("K having avg>300:", await q(`SELECT status, ROUND(AVG(total),2) a FROM orders GROUP BY status HAVING AVG(total) > 300 ORDER BY status`));
  console.log("L inactive regions:", await q(`SELECT region, COUNT(*) n FROM customers WHERE active = 0 GROUP BY region ORDER BY region`));
  console.log("M non-delivered count:", await q(`SELECT COUNT(*) n FROM orders WHERE status != 'delivered'`));
  console.log("Ngmail-or-outlook:", await q(`SELECT COUNT(*) n FROM customers WHERE email LIKE '%gmail%' OR email LIKE '%outlook%'`));
  console.log("O distinct customers who ordered >500:", await q(`SELECT COUNT(*) n FROM (SELECT DISTINCT customer_id FROM orders WHERE total > 500)`));
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
