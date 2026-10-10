// Second probe: pre-filtered anti-join universes + LEFT JOIN arithmetic
// for M2 case briefs. Ground truth saved to facts-cases-m2b-out.txt.
// Run: bunx tsx scripts/facts-cases-m2b.ts > scripts/facts-cases-m2b-out.txt 2>/dev/null
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

const q = async (sql: string) =>
  (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;

async function main() {
  await resetDatabase();

  console.log("orders_2025_count:", await q(
    `SELECT COUNT(*) AS n, ROUND(SUM(total),2) AS v FROM orders WHERE created_at >= '2025-01-01'`));
  console.log("lj_arith_2025:", await q(
    `SELECT COUNT(*) AS star, COUNT(o.id) AS oid, COUNT(DISTINCT c.id) AS custs
     FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.created_at >= '2025-01-01'`));
  console.log("lj_arith_delivered:", await q(
    `SELECT COUNT(*) AS star, COUNT(o.id) AS oid
     FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.status='delivered'`));

  console.log("\n-- anti-join universes (pre-filtered) --");
  console.log("products_never_delivered:", await q(
    `SELECT p.name, p.category FROM products p
     LEFT JOIN (SELECT DISTINCT oi.product_id FROM order_items oi
                JOIN orders o ON o.id=oi.order_id WHERE o.status='delivered') d
       ON d.product_id = p.id
     WHERE d.product_id IS NULL ORDER BY p.name`));
  console.log("products_never_in_2025:", await q(
    `SELECT p.name FROM products p
     LEFT JOIN (SELECT DISTINCT oi.product_id FROM order_items oi
                JOIN orders o ON o.id=oi.order_id WHERE o.created_at >= '2025-01-01') d
       ON d.product_id = p.id
     WHERE d.product_id IS NULL ORDER BY p.name`));
  console.log("customers_never_audio:", await q(
    `SELECT c.name FROM customers c
     LEFT JOIN (SELECT DISTINCT o.customer_id AS cid FROM orders o
                JOIN order_items oi ON oi.order_id=o.id
                JOIN products p ON p.id=oi.product_id
                WHERE p.category='Audio') a ON a.cid = c.id
     WHERE a.cid IS NULL ORDER BY c.name`));
  console.log("suppliers_never_pending:", await q(
    `SELECT s.name FROM suppliers s
     LEFT JOIN (SELECT DISTINCT p.supplier_id AS sid FROM order_items oi
                JOIN products p ON p.id=oi.product_id
                JOIN orders o ON o.id=oi.order_id
                WHERE o.status='pending') t ON t.sid = s.id
     WHERE t.sid IS NULL ORDER BY s.name`));
  console.log("customers_never_watch:", await q(
    `SELECT c.name FROM customers c
     LEFT JOIN (SELECT DISTINCT o.customer_id AS cid FROM orders o
                JOIN order_items oi ON oi.order_id=o.id
                JOIN products p ON p.id=oi.product_id
                WHERE p.name='Smart Watch S') w ON w.cid = c.id
     WHERE w.cid IS NULL ORDER BY c.name`));
  console.log("categories_never_us:", await q(
    `SELECT p.category FROM products p
     LEFT JOIN (SELECT DISTINCT oi.product_id AS pid FROM order_items oi
                JOIN orders o ON o.id=oi.order_id
                JOIN customers c ON c.id=o.customer_id
                WHERE c.region='US') u ON u.pid = p.id
     WHERE u.pid IS NULL ORDER BY p.category`));
  console.log("products_never_eu:", await q(
    `SELECT p.name FROM products p
     LEFT JOIN (SELECT DISTINCT oi.product_id AS pid FROM order_items oi
                JOIN orders o ON o.id=oi.order_id
                JOIN customers c ON c.id=o.customer_id
                WHERE c.region='EU') e ON e.pid = p.id
     WHERE e.pid IS NULL ORDER BY p.name`));
  console.log("suppliers_never_2025:", await q(
    `SELECT s.name FROM suppliers s
     LEFT JOIN (SELECT DISTINCT p.supplier_id AS sid FROM order_items oi
                JOIN products p ON p.id=oi.product_id
                JOIN orders o ON o.id=oi.order_id
                WHERE o.created_at >= '2025-01-01') t ON t.sid = s.id
     WHERE t.sid IS NULL ORDER BY s.name`));
  console.log("customers_never_cancelled:", await q(
    `SELECT c.name FROM customers c
     LEFT JOIN (SELECT DISTINCT o.customer_id AS cid FROM orders o WHERE o.status='cancelled') x
       ON x.cid = c.id
     WHERE x.cid IS NULL ORDER BY c.name`));

  console.log("\n-- per-customer delivered counts (L12 compound ON) --");
  console.log("delivered_count_per_customer:", await q(
    `SELECT c.name, COUNT(o.id) AS delivered FROM customers c
     LEFT JOIN orders o ON o.customer_id=c.id AND o.status='delivered'
     GROUP BY c.id ORDER BY delivered DESC, c.name LIMIT 8`));
  console.log("delivered_count_bottom:", await q(
    `SELECT c.name, COUNT(o.id) AS delivered FROM customers c
     LEFT JOIN orders o ON o.customer_id=c.id AND o.status='delivered'
     GROUP BY c.id ORDER BY delivered ASC, c.name LIMIT 8`));
  console.log("pending_per_customer:", await q(
    `SELECT c.name, COUNT(o.id) AS pending FROM customers c
     LEFT JOIN orders o ON o.customer_id=c.id AND o.status='pending'
     GROUP BY c.id HAVING COUNT(o.id) > 0 ORDER BY pending DESC, c.name`));
  console.log("shipped_per_customer:", await q(
    `SELECT c.name, COUNT(o.id) AS shipped FROM customers c
     LEFT JOIN orders o ON o.customer_id=c.id AND o.status='shipped'
     GROUP BY c.id ORDER BY shipped DESC, c.name LIMIT 5`));

  console.log("\n-- L11 chain spot facts --");
  console.log("lines_per_eu_delivered:", await q(
    `SELECT COUNT(*) AS n FROM order_items oi
     JOIN orders o ON o.id=oi.order_id
     JOIN customers c ON c.id=o.customer_id
     WHERE c.region='EU' AND o.status='delivered'`));
  console.log("audio_units_delivered:", await q(
    `SELECT SUM(oi.quantity) AS units FROM order_items oi
     JOIN products p ON p.id=oi.product_id
     JOIN orders o ON o.id=oi.order_id
     WHERE p.category='Audio' AND o.status='delivered'`));
  console.log("alice_line_revenue:", await q(
    `SELECT ROUND(SUM(oi.quantity*oi.unit_price),2) AS v, COUNT(oi.id) AS lines
     FROM customers c
     JOIN orders o ON o.customer_id=c.id
     JOIN order_items oi ON oi.order_id=o.id
     WHERE c.name='Alice Chen'`));
  console.log("emma_lines_pending:", await q(
    `SELECT COUNT(oi.id) AS n FROM customers c
     JOIN orders o ON o.customer_id=c.id
     JOIN order_items oi ON oi.order_id=o.id
     WHERE c.name='Emma Wilson' AND o.status='pending'`));
  console.log("nordic_products_sold_lines:", await q(
    `SELECT COUNT(oi.id) AS n, SUM(oi.quantity) AS units FROM order_items oi
     JOIN products p ON p.id=oi.product_id
     JOIN suppliers s ON s.id=p.supplier_id
     WHERE s.name='Nordic Gadgets AB'`));
  console.log("midwest_lines:", await q(
    `SELECT COUNT(oi.id) AS n FROM order_items oi
     JOIN products p ON p.id=oi.product_id
     JOIN suppliers s ON s.id=p.supplier_id
     WHERE s.name='Midwest Hardware Co'`));
  console.log("order74_detail:", await q(
    `SELECT p.name, oi.quantity, oi.unit_price FROM order_items oi
     JOIN products p ON p.id=oi.product_id
     WHERE oi.order_id=74`));
  console.log("order51_detail:", await q(
    `SELECT p.name, oi.quantity, oi.unit_price FROM order_items oi
     JOIN products p ON p.id=oi.product_id
     WHERE oi.order_id=51`));
  console.log("keyboard_lines_2024:", await q(
    `SELECT COUNT(*) AS n FROM order_items oi
     JOIN products p ON p.id=oi.product_id
     JOIN orders o ON o.id=oi.order_id
     WHERE p.name='Mechanical Keyboard K1' AND o.created_at LIKE '2024%'`));
  console.log("watch_2025_lines:", await q(
    `SELECT oi.quantity, o.created_at, c.name FROM order_items oi
     JOIN products p ON p.id=oi.product_id
     JOIN orders o ON o.id=oi.order_id
     JOIN customers c ON c.id=o.customer_id
     WHERE p.name='Smart Watch S' AND o.created_at >= '2025-01-01'`));

  await db.$disconnect?.();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
