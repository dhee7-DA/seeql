/// <reference types="bun-types" />
// Ground-truth facts for company-kit case studies. Probes db/custom.db
// (read-only) and writes scripts/company-facts.md — the single source of
// truth kit authors cite. Every figure is the output of the receipt SQL
// shown beside it, so case-audit's number-slot verification holds.
import { Database } from "bun:sqlite";
import { writeFileSync } from "node:fs";

const db = new Database("db/custom.db", { readonly: true });
const rows = (sql: string): Record<string, unknown>[] => db.query(sql).all() as Record<string, unknown>[];
const one = (sql: string): Record<string, unknown> => db.query(sql).get() as Record<string, unknown>;

const out: string[] = [];
const P = (s = "") => out.push(s);
const table = (title: string, sql: string, receipt?: string) => {
  P(`### ${title}`);
  if (receipt) P("```sql\n" + receipt + "\n```");
  const rs = rows(sql);
  if (rs.length === 0) { P("(empty)"); P(""); return; }
  const cols = Object.keys(rs[0]);
  P("| " + cols.join(" | ") + " |");
  P("|" + cols.map(() => "---").join("|") + "|");
  for (const r of rs) P("| " + cols.map((c) => String(r[c] ?? "NULL")).join(" | ") + " |");
  P("");
};

P("# Storefront db — probed ground truth for company-kit case studies");
P("");
P(`Probed ${new Date().toISOString().slice(0, 10)} against db/custom.db (read-only).`);
P("Every figure below is copy-paste safe for case briefs and number slots.");
P("");

// ---- scale -----------------------------------------------------------------
table("Scale census", `
SELECT (SELECT COUNT(*) FROM customers) AS customers,
       (SELECT COUNT(*) FROM suppliers) AS suppliers,
       (SELECT COUNT(*) FROM products)  AS products,
       (SELECT COUNT(*) FROM orders)    AS orders,
       (SELECT COUNT(*) FROM order_items) AS order_items,
       (SELECT COUNT(*) FROM invoices)  AS invoices,
       (SELECT COUNT(*) FROM payments)  AS payments,
       (SELECT COUNT(*) FROM expenses)  AS expenses,
       (SELECT COUNT(*) FROM ledger_entries) AS ledger_entries`,
  "SELECT COUNT(*) FROM <each table>");

table("Order value totals", `
SELECT COUNT(*) AS orders,
       ROUND(SUM(total), 2) AS total_value,
       ROUND(AVG(total), 2) AS avg_order_value,
       ROUND(MIN(total), 2) AS min_total,
       ROUND(MAX(total), 2) AS max_total
FROM orders`,
  "SELECT COUNT(*), ROUND(SUM(total),2), ROUND(AVG(total),2), MIN(total), MAX(total) FROM orders");

// ---- statuses --------------------------------------------------------------
table("Order status distribution", `
SELECT status, COUNT(*) AS n, ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM orders), 1) AS pct
FROM orders GROUP BY status ORDER BY n DESC`,
  "SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY n DESC");

table("Status x region (orders via customer)", `
SELECT c.region, o.status, COUNT(*) AS n
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.region, o.status ORDER BY c.region, n DESC`,
  "SELECT c.region, o.status, COUNT(*) FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region, o.status");

table("Region census — orders, buyers, revenue", `
SELECT c.region,
       COUNT(*) AS orders,
       COUNT(DISTINCT o.customer_id) AS buyers,
       ROUND(SUM(o.total), 2) AS revenue,
       ROUND(AVG(o.total), 2) AS aov
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.region ORDER BY orders DESC`,
  "SELECT c.region, COUNT(*), COUNT(DISTINCT o.customer_id), ROUND(SUM(o.total),2), ROUND(AVG(o.total),2) FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region");

table("Cancellation share by region", `
SELECT c.region,
       COUNT(*) AS placed,
       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS cancel_pct
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.region ORDER BY cancel_pct DESC`,
  "100.0 * SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END)/COUNT(*) grouped by region");

// ---- customers -------------------------------------------------------------
table("Customer cities", `
SELECT city, region, COUNT(*) AS customers FROM customers GROUP BY city, region ORDER BY customers DESC`,
  "SELECT city, region, COUNT(*) FROM customers GROUP BY city, region");

table("Repeat vs one-time buyers", `
SELECT orders_n, COUNT(*) AS buyers FROM (
  SELECT customer_id, COUNT(*) AS orders_n FROM orders GROUP BY customer_id
) GROUP BY orders_n ORDER BY orders_n`,
  "SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id");

table("Top spenders", `
SELECT c.id, c.name, c.region, COUNT(o.id) AS orders, ROUND(SUM(o.total), 2) AS spend
FROM customers c JOIN orders o ON o.customer_id = c.id
GROUP BY c.id ORDER BY spend DESC`,
  "top spenders by SUM(o.total)");

table("Customer spend concentration", `
WITH s AS (SELECT customer_id, SUM(total) AS v FROM orders GROUP BY customer_id),
t AS (SELECT SUM(v) AS tv FROM s)
SELECT ROUND(100.0 * SUM(CASE WHEN v >= 3000 THEN v ELSE 0 END) / tv, 1) AS top_spenders_3000_plus_pct,
       ROUND(100.0 * SUM(CASE WHEN v >= 2000 THEN v ELSE 0 END) / tv, 1) AS spenders_2000_plus_pct
FROM s, t`,
  "share of revenue from customers whose lifetime spend crosses a threshold");

table("Never-ordered customers", `
SELECT COUNT(*) AS never_ordered FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`,
  "anti-join count");

// ---- products & categories -------------------------------------------------
table("Category crowns — revenue, units, products", `
SELECT p.category,
       COUNT(DISTINCT p.id) AS products,
       SUM(oi.quantity) AS units,
       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM products p JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.category ORDER BY revenue DESC`,
  "category revenue/units from order_items");

table("Category order fan-out", `
SELECT p.category, COUNT(DISTINCT oi.order_id) AS orders_touched
FROM products p JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.category ORDER BY orders_touched DESC`,
  "distinct orders touching each category");

table("Price bands", `
SELECT CASE WHEN price < 50 THEN 'budget (<50)'
            WHEN price < 200 THEN 'mid (50-200)'
            ELSE 'premium (>=200)' END AS band,
       COUNT(*) AS products, ROUND(AVG(price), 2) AS avg_price
FROM products GROUP BY band ORDER BY products DESC`,
  "CASE price bands over products.price");

table("Product price ranking", `
SELECT id, name, category, price, stock FROM products ORDER BY price DESC`,
  "full product list by price");

table("Never-ordered products", `
SELECT p.id, p.name, p.category, p.price, p.stock
FROM products p WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id)`,
  "anti-join");

table("Stock vs sold per product", `
SELECT p.id, p.name, p.category, p.stock,
       COALESCE(SUM(oi.quantity), 0) AS units_sold,
       p.stock - COALESCE(SUM(oi.quantity), 0) AS remaining
FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.id ORDER BY units_sold DESC`,
  "stock minus sold per product");

// ---- suppliers -------------------------------------------------------------
table("Supplier revenue + listings + rating", `
SELECT s.id, s.name, s.region, s.rating,
       COUNT(DISTINCT p.id) AS listings,
       ROUND(COALESCE(SUM(oi.quantity * oi.unit_price), 0), 2) AS revenue
FROM suppliers s
LEFT JOIN products p ON p.supplier_id = s.id
LEFT JOIN order_items oi ON oi.product_id = p.id
GROUP BY s.id ORDER BY revenue DESC`,
  "supplier revenue via products->order_items");

table("Supplier revenue share", `
WITH r AS (SELECT s.id, s.name, COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS v
           FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id
           LEFT JOIN order_items oi ON oi.product_id = p.id GROUP BY s.id),
t AS (SELECT SUM(v) AS tv FROM r)
SELECT r.name, ROUND(r.v, 2) AS revenue, ROUND(100.0 * r.v / t.tv, 1) AS pct FROM r, t ORDER BY r.v DESC`,
  "each supplier's % of total revenue");

table("Trusted supplier bench (rating >= 4.5)", `
SELECT s.name, s.region, s.rating, COUNT(p.id) AS listings,
       ROUND(AVG(p.price), 2) AS avg_price
FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id
WHERE s.rating >= 4.5 GROUP BY s.id`,
  "suppliers with rating >= 4.5 and their catalog");

// ---- time ------------------------------------------------------------------
table("Date range", `
SELECT MIN(created_at) AS first_order, MAX(created_at) AS last_order,
       MIN(shipped_at) AS first_ship, MAX(shipped_at) AS last_ship FROM orders`,
  "min/max order dates");

table("Monthly order trend", `
SELECT SUBSTR(created_at, 1, 7) AS month, COUNT(*) AS orders,
       ROUND(SUM(total), 2) AS revenue,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
FROM orders GROUP BY month ORDER BY month`,
  "orders grouped by SUBSTR(created_at,1,7)");

table("Ship latency (days, where shipped)", `
SELECT COUNT(*) AS shipped,
       ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) AS avg_days,
       ROUND(MIN(julianday(shipped_at) - julianday(created_at)), 2) AS min_days,
       ROUND(MAX(julianday(shipped_at) - julianday(created_at)), 2) AS max_days
FROM orders WHERE shipped_at IS NOT NULL`,
  "julianday delta where shipped_at IS NOT NULL");

table("Latency by region (delivered+shipped only)", `
SELECT c.region, COUNT(*) AS shipped_orders,
       ROUND(AVG(julianday(o.shipped_at) - julianday(o.created_at)), 2) AS avg_days
FROM orders o JOIN customers c ON c.id = o.customer_id
WHERE o.shipped_at IS NOT NULL GROUP BY c.region ORDER BY avg_days DESC`,
  "regional ship latency, shipped_at IS NOT NULL");

// ---- finance tables --------------------------------------------------------
table("Invoice status", `
SELECT status, COUNT(*) AS n, ROUND(SUM(amount_cents) / 100.0, 2) AS total_amount
FROM invoices GROUP BY status`,
  "invoice status distribution");

table("Invoice aging vs max paid date", `
SELECT status, COUNT(*) AS invoices, ROUND(SUM(amount_cents)/100.0, 2) AS amount
FROM invoices GROUP BY status`,
  "aging context: reference date = MAX(paid_on) in payments");

table("Payments by method", `
SELECT method, COUNT(*) AS payments, ROUND(SUM(amount_cents)/100.0, 2) AS total
FROM payments GROUP BY method ORDER BY total DESC`,
  "payment method mix");

table("AR: invoices without payment", `
SELECT COUNT(*) AS unpaid_invoices, ROUND(SUM(i.amount_cents)/100.0, 2) AS unpaid_amount
FROM invoices i WHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)`,
  "anti-join AR");

table("Expenses by category", `
SELECT category, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0, 2) AS total
FROM expenses GROUP BY category ORDER BY total DESC`,
  "expense categories");

table("Payment coverage per invoice (partial-payment check)", `
SELECT CASE WHEN pay.cnt IS NULL THEN 'no payment'
            WHEN pay.sum_cents < i.amount_cents THEN 'partial'
            WHEN pay.sum_cents = i.amount_cents THEN 'exact'
            ELSE 'overpaid' END AS coverage,
       COUNT(*) AS invoices, ROUND(SUM(i.amount_cents)/100.0, 2) AS invoice_amount,
       ROUND(COALESCE(SUM(pay.sum_cents), 0)/100.0, 2) AS paid_amount
FROM invoices i
LEFT JOIN (SELECT invoice_id, COUNT(*) AS cnt, SUM(amount_cents) AS sum_cents
           FROM payments GROUP BY invoice_id) pay ON pay.invoice_id = i.id
GROUP BY coverage ORDER BY invoices DESC`,
  "invoices LEFT JOIN grouped payments, classified exact/partial/none");

table("Invoice issue-to-due window (days)", `
SELECT ROUND(AVG(julianday(due_on) - julianday(issued_on)), 1) AS avg_terms_days,
       MIN(julianday(due_on) - julianday(issued_on)) AS min_days,
       MAX(julianday(due_on) - julianday(issued_on)) AS max_days
FROM invoices`,
  "payment terms spread");

table("Paid-invoice settlement days", `
SELECT COUNT(*) AS paid_invoices,
       ROUND(AVG(julianday(p.first_paid) - julianday(i.issued_on)), 1) AS avg_days_to_pay,
       MIN(julianday(p.first_paid) - julianday(i.issued_on)) AS fastest,
       MAX(julianday(p.first_paid) - julianday(i.issued_on)) AS slowest
FROM invoices i
JOIN (SELECT invoice_id, MIN(paid_on) AS first_paid FROM payments GROUP BY invoice_id) p ON p.invoice_id = i.id
WHERE i.status = 'paid'`,
  "days from issue to first payment, paid invoices only");

table("Region x category revenue (top combos)", `
SELECT c.region, p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
GROUP BY c.region, p.category ORDER BY revenue DESC LIMIT 12`,
  "region x category revenue");

table("Expenses by month", `
SELECT SUBSTR(spent_on, 1, 7) AS month, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0, 2) AS total
FROM expenses GROUP BY month ORDER BY month`,
  "expense monthly trend");

table("Ledger trial balance", `
SELECT ROUND(SUM(debit_cents)/100.0, 2) AS total_debits,
       ROUND(SUM(credit_cents)/100.0, 2) AS total_credits,
       ROUND((SUM(debit_cents) - SUM(credit_cents))/100.0, 2) AS delta
FROM ledger_entries`,
  "global ledger balance check");

table("Ledger balances by account", `
SELECT account, COUNT(*) AS entries,
       ROUND(SUM(debit_cents)/100.0, 2) AS debits,
       ROUND(SUM(credit_cents)/100.0, 2) AS credits,
       ROUND((SUM(debit_cents) - SUM(credit_cents))/100.0, 2) AS net
FROM ledger_entries GROUP BY account ORDER BY net DESC`,
  "ledger balance per account");

table("Reconciliation anomalies (verified row-level)", `
SELECT i.id, i.status, ROUND(i.amount_cents/100.0, 2) AS invoice_amount,
       COUNT(p.id) AS payment_rows,
       ROUND(COALESCE(SUM(p.amount_cents), 0)/100.0, 2) AS paid_amount
FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id
GROUP BY i.id
HAVING (i.status = 'void' AND COUNT(p.id) > 0)
    OR (i.status = 'paid' AND COUNT(p.id) = 0)
    OR (COUNT(p.id) > 0 AND SUM(p.amount_cents) != i.amount_cents)
    OR COUNT(p.id) > 1`,
  "anomalies: void-but-paid #11 (925.00), paid-no-payments #28 (1756.00), 5 split-payment invoices (1,5,12,19,22), 1 partial (4000 of 6148)");

writeFileSync("scripts/company-facts.md", out.join("\n"));
console.log("wrote scripts/company-facts.md (" + out.join("\n").length + " chars)");
db.close();
