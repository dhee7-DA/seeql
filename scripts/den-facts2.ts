// Facts for den-flat-2 batch: six s-family companion figures (L18/19/20/21/23/24).
import { PrismaClient } from "@prisma/client";
import { resetDatabase } from "../src/lib/sample-db";
const db = new PrismaClient({ log: [] });
const q = async (label: string, sql: string) => {
  try {
    const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
    console.log(`${label}: ${JSON.stringify(JSON.parse(JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? Number(v) : v))))}`);
  } catch (e) {
    console.log(`${label}: ERROR ${(e as Error).message.split("\n")[0]}`);
  }
};
async function main() {
  await resetDatabase();

  // -- L18 s10b-arm-wrap: top shelf / bottom shelf -------------------------
  await q("wrap.top3", `SELECT id, total FROM orders ORDER BY total DESC, id ASC LIMIT 3`);
  await q("wrap.bottom3", `SELECT id, total FROM orders ORDER BY total ASC, id ASC LIMIT 3`);
  await q("wrap.pile", `SELECT id, total, tag FROM (
    SELECT id, total, 'top' AS tag FROM (SELECT id, total FROM orders ORDER BY total DESC, id ASC LIMIT 3)
    UNION ALL
    SELECT id, total, 'bottom' FROM (SELECT id, total FROM orders ORDER BY total ASC, id ASC LIMIT 3)
  ) ORDER BY tag DESC, total DESC, id`);

  // -- L19 s3b-null-safe: grouping vs comparison semantics -----------------
  await q("null.raw10", `SELECT id, shipped_at FROM orders WHERE id <= 10 ORDER BY id`);
  await q("null.intersect", `SELECT COUNT(*) AS n FROM (SELECT shipped_at FROM orders WHERE id <= 10 INTERSECT SELECT shipped_at FROM orders WHERE id <= 10)`);
  await q("null.intersect-list", `SELECT shipped_at FROM orders WHERE id <= 10 INTERSECT SELECT shipped_at FROM orders WHERE id <= 10 ORDER BY 1`);
  await q("null.compare-eq", `SELECT COUNT(*) AS n FROM orders WHERE id <= 10 AND shipped_at = shipped_at`);
  await q("null.count-col", `SELECT COUNT(shipped_at) AS n, COUNT(*) AS total FROM orders WHERE id <= 10`);

  // -- L20 s4b-null-killer: NOT IN vs the NULL silent killer ---------------
  await q("killer.notin", `SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE status = 'shipped')`);
  await q("killer.notin-null", `SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE status = 'shipped' UNION SELECT NULL)`);
  await q("killer.names", `SELECT name FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE status = 'shipped') ORDER BY name`);
  await q("killer.except", `SELECT COUNT(*) AS n FROM (SELECT id FROM customers EXCEPT SELECT customer_id FROM orders WHERE status = 'shipped')`);

  // -- L21 s5b-paren-maze: bare chain, standard reading, paren syntax ------
  await q("maze.ltr", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'delivered' UNION SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'cancelled' INTERSECT SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'pending')`);
  await q("maze.ltr-ids", `SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'delivered' UNION SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'cancelled' INTERSECT SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'pending' ORDER BY v`);
  await q("maze.std", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'delivered' UNION SELECT * FROM (SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'cancelled' INTERSECT SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'pending'))`);
  await q("maze.paren", `SELECT COUNT(*) AS n FROM ((SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'delivered') UNION (SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'cancelled'))`);
  await q("maze.wrap", `SELECT COUNT(*) AS n FROM (SELECT * FROM (SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'delivered' UNION SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'cancelled') INTERSECT SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'pending')`);

  // -- L23 s7b-custom-sort: alphabetical vs CASE priority ------------------
  await q("sort.alpha", `SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY status`);
  await q("sort.case", `SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'shipped' THEN 1 WHEN 'delivered' THEN 2 ELSE 3 END, id`);

  // -- L24 s8b-total-row: ledger + pinned TOTAL ----------------------------
  await q("ledger.detail", `SELECT substr(created_at, 1, 7) AS month, COUNT(*) AS orders, ROUND(SUM(total), 2) AS revenue FROM orders WHERE status = 'delivered' GROUP BY month ORDER BY month DESC LIMIT 3`);
  await q("ledger.total", `SELECT COUNT(*) AS orders, ROUND(SUM(total), 2) AS revenue FROM orders WHERE status = 'delivered'`);
  await q("ledger.full", `SELECT month, orders, revenue FROM (
    SELECT substr(created_at, 1, 7) AS month, COUNT(*) AS orders, ROUND(SUM(total), 2) AS revenue FROM orders WHERE status = 'delivered' GROUP BY month ORDER BY month DESC LIMIT 3
  ) UNION ALL SELECT 'TOTAL', COUNT(*), ROUND(SUM(total), 2) FROM orders WHERE status = 'delivered' ORDER BY month`);

  await db.$disconnect();
}
main();
