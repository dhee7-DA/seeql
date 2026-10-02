// M8 facts part 4 — figures for the Views/CTAS problem verifies.
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  return (await db.$queryRawUnsafe(sql)) as T[];
}

async function main() {
  await resetDatabase();
  console.log("pending>500:", await q(`SELECT COUNT(*) n, ROUND(SUM(total),2) book FROM orders WHERE status='pending' AND total > 500`));
  console.log("pending all:", await q(`SELECT COUNT(*) n, ROUND(SUM(total),2) book FROM orders WHERE status='pending'`));
  console.log("delivered 2024:", await q(`SELECT COUNT(*) n FROM orders WHERE status='delivered' AND created_at LIKE '2024%'`));
  console.log("delivered 2024-07:", await q(`SELECT ROUND(SUM(total),2) s FROM orders WHERE status='delivered' AND created_at LIKE '2024-07%'`));
  console.log("stock<15:", await q(`SELECT COUNT(*) n FROM products WHERE stock < 15`));
  console.log("total>=400:", await q(`SELECT COUNT(*) n, ROUND(SUM(total),2) book FROM orders WHERE total >= 400`));
  console.log("avg by status:", await q(`SELECT status, ROUND(AVG(total),2) avg_total FROM orders GROUP BY status ORDER BY status`));
  console.log("supplier spend:", await q(`SELECT s.id, s.name, ROUND(SUM(i.unit_price * i.quantity),2) AS spend FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items i ON i.product_id = p.id GROUP BY s.id ORDER BY spend DESC`));
  console.log("supplier max rating:", await q(`SELECT name, rating FROM suppliers ORDER BY rating DESC LIMIT 2`));
  console.log("cancelled 2024:", await q(`SELECT COUNT(*) n FROM orders WHERE status='cancelled' AND created_at LIKE '2024%'`));
  console.log("open invoices:", await q(`SELECT id, amount_cents, amount_cents/100 AS dollars FROM invoices WHERE status='open' ORDER BY id`));
  // pragma hidden value for generated virtual column (play engine)
  try {
    await db.$transaction(async (tx) => {
      await tx.$queryRawUnsafe(`CREATE TABLE gen (price REAL, fee REAL GENERATED ALWAYS AS (price * 0.2) VIRTUAL)`);
      const r = (await tx.$queryRawUnsafe(`SELECT name, hidden FROM pragma_table_info('gen') ORDER BY cid`)) as Array<Record<string, unknown>>;
      console.log("generated hidden:", r);
      throw new Error("__rb__");
    });
  } catch (e) { if ((e as Error).message !== "__rb__") throw e; }
}

main().catch((e) => { console.error(e); process.exit(1); });
