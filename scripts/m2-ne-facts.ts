// Non-equi bank facts: figures for kb-ne-* problems and cases.
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q(sql: string): Promise<Array<Record<string, unknown>>> {
  return db.$queryRawUnsafe(sql);
}

async function main() {
  await resetDatabase();
  const P = async (label: string, sql: string) => {
    try { console.log(`== ${label} ==\n${JSON.stringify(await q(sql), (_, v) => typeof v === "bigint" ? Number(v) : v).slice(0, 700)}`); }
    catch (e) { console.log(`== ${label} == ERROR: ${e instanceof Error ? e.message.slice(0, 140) : e}`); }
  };

  await P("N1 order pairs one >= 2x other", `SELECT COUNT(*) AS n FROM orders a JOIN orders b ON a.id < b.id AND (a.total >= 2 * b.total OR b.total >= 2 * a.total)`);
  await P("N2 same-region spend pairs within 500", `SELECT COUNT(*) AS n FROM (SELECT c.id, c.region, COALESCE(SUM(o.total),0) AS spend FROM customers c LEFT JOIN orders o ON o.customer_id=c.id GROUP BY c.id) a JOIN (SELECT c.id, c.region, COALESCE(SUM(o.total),0) AS spend FROM customers c LEFT JOIN orders o ON o.customer_id=c.id GROUP BY c.id) b ON a.id < b.id AND a.region = b.region WHERE ABS(a.spend - b.spend) < 500`);
  await P("N3 products within 50% markup pairs", `SELECT COUNT(*) AS n FROM products a JOIN products b ON a.id < b.id AND b.price BETWEEN a.price AND a.price * 1.5`);
  await P("N4 order-total pairs within 50", `SELECT COUNT(*) AS n FROM orders a JOIN orders b ON a.id < b.id AND ABS(a.total - b.total) <= 50`);
  await P("N5 payments covering >= half invoice", `SELECT COUNT(*) AS n FROM payments pay JOIN invoices i ON pay.invoice_id = i.id WHERE pay.amount_cents >= i.amount_cents / 2.0`);
  await P("N6 lines 10%-plus below list", `SELECT COUNT(*) AS n FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.unit_price < 0.9 * p.price`);
  await P("N7 supplier pairs rating within 0.5", `SELECT COUNT(*) AS n FROM suppliers a JOIN suppliers b ON a.id < b.id AND ABS(a.rating - b.rating) < 0.5`);
  await P("N8 demand exceeds stock", `SELECT p.name, p.stock, SUM(oi.quantity) AS demanded FROM products p JOIN order_items oi ON oi.product_id = p.id GROUP BY p.id HAVING SUM(oi.quantity) > p.stock ORDER BY demanded - p.stock DESC`);
  await P("N9 price gaps <= 5", `SELECT a.name AS lo, b.name AS hi, ROUND(b.price - a.price, 2) AS gap FROM products a JOIN products b ON b.price > a.price WHERE b.price - a.price <= 5 ORDER BY gap`);
  await P("N10 orders total BETWEEN 100 AND 300 with names count", `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.total BETWEEN 100 AND 300`);
  await P("N11 same-customer orders where later total bigger", `SELECT COUNT(*) AS n FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND a.id < b.id AND b.total > a.total`);
  await P("N12 invoice pairs same customer amount within 10%", `SELECT COUNT(*) AS n FROM invoices a JOIN invoices b ON a.customer_id = b.customer_id AND a.id < b.id AND b.amount_cents BETWEEN a.amount_cents AND a.amount_cents * 1.1`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
