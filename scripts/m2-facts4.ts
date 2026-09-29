// M2 invoice-dimension facts for RIGHT JOIN problems
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";
async function q(label: string, sql: string) {
  const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  console.log(`-- ${label}`);
  for (const r of rows) console.log(Object.values(r).map((v) => String(v)).join("\t"));
}
async function main() {
  await resetDatabase();
  await q("unpaid invoices: number, customer, region, issued_on", `SELECT i.number, c.name, c.region, i.issued_on FROM invoices i INNER JOIN customers c ON c.id = i.customer_id WHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id) ORDER BY i.number`);
  await q("invoices per customer", `SELECT c.name, COUNT(i.id) n FROM invoices i RIGHT JOIN customers c ON i.customer_id = c.id GROUP BY c.id ORDER BY n DESC, c.name`);
  await q("payments per invoice status", `SELECT i.status, COUNT(i.id) invoices, COUNT(pay.id) payments FROM invoices i LEFT JOIN payments pay ON pay.invoice_id = i.id GROUP BY i.status ORDER BY i.status`);
  await q("method per invoice status", `SELECT i.status, pay.method, COUNT(*) n FROM payments pay RIGHT JOIN invoices i ON pay.invoice_id = i.id GROUP BY i.status, pay.method ORDER BY i.status, n DESC`);
  await q("issued month of unpaid", `SELECT strftime('%Y-%m', i.issued_on) m, COUNT(*) n FROM invoices i LEFT JOIN payments pay ON pay.invoice_id = i.id WHERE pay.id IS NULL GROUP BY m ORDER BY m`);
  await q("2-payment invoice amounts", `SELECT i.number, i.amount_cents FROM invoices i LEFT JOIN payments pay ON pay.invoice_id = i.id GROUP BY i.id HAVING COUNT(pay.id) = 2 ORDER BY i.number`);
  await q("unpaid total", `SELECT ROUND(SUM(i.amount_cents)/100.0, 2) v FROM invoices i LEFT JOIN payments pay ON pay.invoice_id = i.id WHERE pay.id IS NULL`);
  await q("2-payment total", `SELECT ROUND(SUM(amount_cents)/100.0, 2) v FROM (SELECT i.amount_cents AS amount_cents, COUNT(pay.id) np FROM invoices i LEFT JOIN payments pay ON pay.invoice_id = i.id GROUP BY i.id) WHERE np = 2`);
  await q("np distribution (np, invoices)", `SELECT np, COUNT(*) n FROM (SELECT i.id, COUNT(pay.id) np FROM invoices i LEFT JOIN payments pay ON pay.invoice_id = i.id GROUP BY i.id) GROUP BY np ORDER BY np`);
  await q("status x has-payment matrix", `SELECT status, grp, COUNT(*) n FROM (SELECT i.status AS status, CASE WHEN COUNT(pay.id) > 0 THEN 'has_payments' ELSE 'no_payments' END grp FROM payments pay RIGHT JOIN invoices i ON pay.invoice_id = i.id GROUP BY i.id) GROUP BY status, grp ORDER BY status, grp`);
  await q("suppliers right join chain HAVING 0 (never-ordered)", `SELECT s.name FROM order_items oi RIGHT JOIN products p ON oi.product_id = p.id RIGHT JOIN suppliers s ON p.supplier_id = s.id GROUP BY s.id HAVING COUNT(oi.id) = 0`);
  await q("region unpaid exposure", `SELECT c.region, COUNT(*) unpaid FROM payments pay RIGHT JOIN invoices i ON pay.invoice_id = i.id INNER JOIN customers c ON c.id = i.customer_id WHERE pay.id IS NULL GROUP BY c.region ORDER BY unpaid DESC`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
