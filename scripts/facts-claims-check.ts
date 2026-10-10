// Verify numeric claims made in M1 lesson prose (Phase 1 theory expansion QA).
import { db } from "../src/lib/db";
import { ensureDatabase } from "../src/lib/sample-db";

const q = async (label: string, sql: string) => {
  const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  const slim = rows.map((r) =>
    Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === "bigint" ? Number(v) : v])),
  );
  console.log(`${label}: ${JSON.stringify(slim)}`);
};

async function main() {
  await ensureDatabase();
  await q("total > 500 (L3 claim: 25)", `SELECT COUNT(*) n FROM orders WHERE total > 500`);
  await q("delivered AND 2024 (L3 claim: 45)", `SELECT COUNT(*) n FROM orders WHERE status='delivered' AND created_at LIKE '2024%'`);
  await q("delivered AND total>200 (L3 code example)", `SELECT COUNT(*) n FROM orders WHERE status='delivered' AND total > 200`);
  await q("EU or APAC customers (L3 claim: 13)", `SELECT COUNT(*) n FROM customers WHERE region IN ('EU','APAC')`);
  await q("SUM(price*stock) (L35 claim: 126031.60)", `SELECT ROUND(SUM(price*stock),2) v FROM products`);
  await q("SUM(stock) (L35 claim: 2845)", `SELECT SUM(stock) v FROM products`);
  await q("price < 50 (L35 claim: 8)", `SELECT COUNT(*) n FROM products WHERE price < 50`);
  await q("products at exactly 50 (L35 claim: boundary invisible)", `SELECT COUNT(*) n FROM products WHERE price = 50`);
  await q("crowded categories >2 (L35 claim: 3)", `SELECT COUNT(*) n FROM (SELECT category FROM products GROUP BY category HAVING COUNT(*) > 2)`);
  await q("delivered avg (figure claim 299.44)", `SELECT ROUND(AVG(total),2) v FROM orders WHERE status='delivered'`);
  await q("L3 table: total>200 (65)", `SELECT COUNT(*) n FROM orders WHERE total > 200`);
  await q("L3 table: BETWEEN 50 200 (30)", `SELECT COUNT(*) n FROM orders WHERE total BETWEEN 50 AND 200`);
  await q("L3 table: IN shipped delivered (82)", `SELECT COUNT(*) n FROM orders WHERE status IN ('shipped','delivered')`);
  await q("L3 table: LIKE 2024% (90)", `SELECT COUNT(*) n FROM orders WHERE created_at LIKE '2024%'`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
