// Authoring facts for the window-functions material (Task 41).
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q(sql: string): Promise<Array<Record<string, unknown>>> {
  return (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
}

async function main() {
  await resetDatabase();
  const facts: Record<string, unknown> = {};

  facts.orderRange = await q(`SELECT MIN(created_at) AS min, MAX(created_at) AS max FROM orders`);
  facts.statusCounts = await q(`SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY n DESC`);
  facts.ordersPerMonth = await q(
    `SELECT strftime('%Y-%m', created_at) AS ym, COUNT(*) AS n FROM orders GROUP BY ym ORDER BY ym`,
  );
  facts.ordersPerCustomerTop = await q(
    `SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id ORDER BY n DESC LIMIT 8`,
  );
  facts.totalTies = await q(
    `SELECT COUNT(*) AS tied_pairs FROM (SELECT total FROM orders GROUP BY total HAVING COUNT(*) > 1)`,
  );
  facts.bigTies = await q(
    `SELECT total, COUNT(*) AS n FROM orders GROUP BY total HAVING COUNT(*) > 2 ORDER BY n DESC LIMIT 5`,
  );
  facts.customerOrderCountTies = await q(
    `SELECT n, COUNT(*) AS customers_with_n FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) GROUP BY n ORDER BY n DESC`,
  );
  facts.regions = await q(
    `SELECT c.region, COUNT(DISTINCT c.id) AS customers, COUNT(o.id) AS orders FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.region ORDER BY orders DESC`,
  );
  facts.cities = await q(`SELECT DISTINCT city FROM customers ORDER BY city`);
  facts.categories = await q(
    `SELECT category, COUNT(*) AS n, ROUND(MIN(price),2) AS min_p, ROUND(MAX(price),2) AS max_p FROM products GROUP BY category ORDER BY n DESC`,
  );
  facts.productPriceTies = await q(
    `SELECT COUNT(*) AS tied FROM (SELECT price FROM products GROUP BY price HAVING COUNT(*) > 1)`,
  );
  facts.categoryRevenue = await q(
    `SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category ORDER BY revenue DESC`,
  );
  facts.invoiceStatus = await q(`SELECT status, COUNT(*) AS n, SUM(amount_cents) AS cents FROM invoices GROUP BY status`);
  facts.invoiceRange = await q(`SELECT MIN(issued_on) AS min, MAX(issued_on) AS max FROM invoices`);
  facts.paymentMethods = await q(`SELECT method, COUNT(*) AS n, SUM(amount_cents) AS cents FROM payments GROUP BY method`);
  facts.expenseCats = await q(
    `SELECT category, COUNT(*) AS n, SUM(amount_cents) AS cents FROM expenses GROUP BY category ORDER BY cents DESC`,
  );
  facts.expenseRange = await q(`SELECT MIN(spent_on) AS min, MAX(spent_on) AS max FROM expenses`);
  facts.ledgerAccounts = await q(
    `SELECT account, COUNT(*) AS n, SUM(debit_cents) AS debits, SUM(credit_cents) AS credits FROM ledger_entries GROUP BY account ORDER BY account`,
  );
  facts.ledgerRange = await q(`SELECT MIN(entry_date) AS min, MAX(entry_date) AS max FROM ledger_entries`);
  facts.suppliers = await q(`SELECT id, name, region, rating FROM suppliers ORDER BY id`);
  facts.shippedNull = await q(`SELECT COUNT(*) AS n FROM orders WHERE shipped_at IS NULL`);
  facts.stockZero = await q(`SELECT COUNT(*) AS n FROM products WHERE stock = 0`);
  facts.inactiveCustomers = await q(`SELECT COUNT(*) AS n FROM customers WHERE active = 0`);
  facts.productNames = await q(`SELECT id, name, category, price, stock FROM products ORDER BY id`);
  facts.customerNames = await q(`SELECT id, name, city, region, active FROM customers ORDER BY id`);

  console.log(JSON.stringify(facts, (_k, v) => (typeof v === "bigint" ? Number(v) : v), 1));
  await db.$disconnect();
}
main();
