// M2 hard-case facts, round 3: every remaining figure for cs-2181..cs-2210.
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q(sql: string): Promise<Array<Record<string, unknown>>> {
  return db.$queryRawUnsafe(sql);
}

async function main() {
  await resetDatabase();
  const P = async (label: string, sql: string) => {
    try {
      console.log(`\n== ${label} ==`);
      console.log(JSON.stringify(await q(sql), (_, v) => typeof v === "bigint" ? Number(v) : v));
    } catch (e) {
      console.log(`\n== ${label} == ERROR: ${e instanceof Error ? e.message.slice(0, 140) : e}`);
    }
  };

  await P("p1 no-pending AND no-shipped", `SELECT c.name FROM customers c LEFT JOIN orders p ON p.customer_id=c.id AND p.status='pending' LEFT JOIN orders s ON s.customer_id=c.id AND s.status='shipped' WHERE p.id IS NULL AND s.id IS NULL ORDER BY c.name`);
  await P("p2 orders>=400 per region", `SELECT c.region, COUNT(*) AS n FROM orders o JOIN customers c ON o.customer_id=c.id WHERE o.total >= 400 GROUP BY c.region ORDER BY n DESC`);
  await P("p3a equal unit-price same-product pairs", `SELECT COUNT(*) AS n FROM order_items x JOIN order_items y ON x.product_id=y.product_id AND x.unit_price=y.unit_price AND x.id<>y.id`);
  await P("p3b x<y price pairs with x.id<y.id", `SELECT COUNT(*) AS n FROM order_items x JOIN order_items y ON x.product_id=y.product_id AND x.id<y.id AND x.unit_price<y.unit_price`);
  await P("p4 same-status same-month pairs", `SELECT COUNT(*) AS n FROM orders a JOIN orders b ON a.customer_id=b.customer_id AND a.id<b.id AND strftime('%Y-%m',a.created_at)=strftime('%Y-%m',b.created_at) WHERE a.status=b.status`);
  await P("p5a same-region signup-month pairs", `SELECT COUNT(*) AS n FROM customers a JOIN customers b ON a.id<b.id AND strftime('%Y-%m',a.created_at)=strftime('%Y-%m',b.created_at) WHERE a.region=b.region`);
  await P("p5b same-year signup pairs", `SELECT COUNT(*) AS n FROM customers a JOIN customers b ON a.id<b.id AND strftime('%Y',a.created_at)=strftime('%Y',b.created_at)`);
  await P("p6 double-paid sums", `SELECT i.number, ROUND(SUM(pay.amount_cents)/100.0,2) AS paid, ROUND(SUM(pay.amount_cents)/100.0,1) AS paid1 FROM invoices i JOIN payments pay ON pay.invoice_id=i.id GROUP BY i.id HAVING COUNT(pay.id)>=2 ORDER BY i.number`);
  await P("p7a EU unshipped >=100", `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON o.customer_id=c.id WHERE c.region='EU' AND o.shipped_at IS NULL AND o.total>=100`);
  await P("p7b totals exactly 100?", `SELECT COUNT(*) AS n FROM orders WHERE total=100`);
  await P("p8 invoiced per region", `SELECT c.region, SUM(i.amount_cents)/100.0 AS invoiced FROM invoices i JOIN customers c ON i.customer_id=c.id GROUP BY c.region ORDER BY invoiced DESC`);
  await P("p9a sweep invoices>=2000", `SELECT COUNT(pay.id) AS paid_rows, COUNT(*) AS sweep_rows FROM invoices i LEFT OUTER JOIN payments pay ON pay.invoice_id=i.id WHERE i.amount_cents>=200000`);
  await P("p9b >=1000", `SELECT COUNT(pay.id) AS paid_rows, COUNT(*) AS sweep_rows FROM invoices i LEFT OUTER JOIN payments pay ON pay.invoice_id=i.id WHERE i.amount_cents>=100000`);
  await P("p9c >=3000", `SELECT COUNT(pay.id) AS paid_rows, COUNT(*) AS sweep_rows FROM invoices i LEFT OUTER JOIN payments pay ON pay.invoice_id=i.id WHERE i.amount_cents>=300000`);
  await P("p10a below-list lines per product top5", `SELECT p.name, SUM(oi.unit_price < p.price) AS under FROM order_items oi JOIN products p ON p.id=oi.product_id GROUP BY p.id ORDER BY under DESC, p.name ASC LIMIT 5`);
  await P("p10b above/equal-list counts", `SELECT SUM(oi.unit_price > p.price) AS above, SUM(oi.unit_price = p.price) AS at_list, COUNT(*) AS all_lines FROM order_items oi JOIN products p ON p.id=oi.product_id`);
  await P("p11 products not in any pending order", `SELECT p.name FROM products p LEFT JOIN order_items oi ON oi.product_id=p.id LEFT JOIN orders o ON o.id=oi.order_id AND o.status='pending' WHERE oi.id IS NOT NULL AND o.id IS NULL GROUP BY p.id ORDER BY p.name`);
  await P("p12 lines per supplier rating<4.5", `SELECT s.name, COUNT(oi.id) AS lines FROM suppliers s JOIN products p ON p.supplier_id=s.id JOIN order_items oi ON oi.product_id=p.id WHERE s.rating < 4.5 GROUP BY s.id ORDER BY lines DESC, s.name ASC`);
  await P("p13a co-purchase top pairs", `SELECT p1.name AS first_pick, p2.name AS second_pick, COUNT(*) AS times FROM order_items x JOIN order_items y ON x.order_id=y.order_id AND x.product_id<y.product_id JOIN products p1 ON p1.id=x.product_id JOIN products p2 ON p2.id=y.product_id GROUP BY p1.id, p2.id ORDER BY times DESC, first_pick ASC LIMIT 5`);
  await P("p13b same-product same-order line pairs", `SELECT COUNT(*) AS n FROM order_items x JOIN order_items y ON x.order_id=y.order_id AND x.product_id=y.product_id AND x.id<>y.id`);
  await P("p14 active-only unshipped per region", `SELECT c.region, COUNT(o.id) AS unshipped FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.shipped_at IS NULL WHERE c.active=1 GROUP BY c.region ORDER BY unshipped DESC, c.region ASC`);
  await P("p15 unpaid issued_on distinct", `SELECT COUNT(DISTINCT i.issued_on) AS dates, COUNT(*) AS n FROM invoices i LEFT JOIN payments pay ON pay.invoice_id=i.id WHERE pay.id IS NULL`);
  await P("p16 audio line revenue top3", `SELECT p.name, ROUND(SUM(oi.quantity*oi.unit_price),2) AS rev FROM order_items oi JOIN products p ON p.id=oi.product_id WHERE p.category='Audio' GROUP BY p.id ORDER BY rev DESC LIMIT 3`);
  await P("p17 order 2 and 6 receipts", `SELECT o.id, SUM(oi.quantity) AS units, COUNT(*) AS lines FROM order_items oi JOIN orders o ON oi.order_id=o.id WHERE o.id IN (1,2,6) GROUP BY o.id`);
  await P("p18 total same-customer pairs", `SELECT COUNT(*) AS n FROM orders a JOIN orders b ON a.customer_id=b.customer_id AND a.id<b.id`);
  await P("p19 supplier rating>=4.5 lines", `SELECT s.name, COUNT(oi.id) AS lines FROM suppliers s JOIN products p ON p.supplier_id=s.id JOIN order_items oi ON oi.product_id=p.id WHERE s.rating >= 4.5 GROUP BY s.id ORDER BY lines DESC`);
  await P("p20a price<100 product count", `SELECT COUNT(*) AS n FROM products WHERE price < 100`);
  await P("p20b cross combos rating>=4.0 per supplier", `SELECT s.name, COUNT(*) AS combos FROM products p CROSS JOIN suppliers s WHERE s.rating>=4.0 AND p.price<100 GROUP BY s.id ORDER BY s.name`);
  await P("p21 EU unshipped list ids", `SELECT o.id, o.total FROM orders o JOIN customers c ON o.customer_id=c.id WHERE c.region='EU' AND o.shipped_at IS NULL ORDER BY o.id`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
