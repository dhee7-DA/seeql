// Domain Mastery — Retail & RFM · 60 query problems (20 Easy / 20 Medium /
// 20 Hard), all reading the ONE shared world seed in dm-retail-seed.ts.
// Statements cite only probe-verified facts (scripts/r9-dm-probe.ts +
// scripts/r9-facts.txt). Expected outputs are engine-generated into
// dm-expected.ts by scripts/r9-dm-verify.ts — never hand-written.
import type { DmQuery } from "../domain-packs";

export const DM_RETAIL_QUERIES: DmQuery[] = [
  // ---------------------------------------------------------------- Easy 20
  {
    id: "q01",
    difficulty: "Easy",
    company: "Amazon",
    title: "Delivered order count",
    statement:
      "Count how many orders in the orders table have status 'delivered'. Output a single column named delivered_orders with one row.",
    code: `SELECT COUNT(*) AS delivered_orders
FROM orders
WHERE status = 'delivered';`,
    order: "exact",
  },
  {
    id: "q02",
    difficulty: "Easy",
    company: "Amazon",
    title: "US shoppers roster",
    statement:
      "List the customers based in the US region. Output customer_id, name, city and signup_date, ordered by signup_date ascending (earliest first).",
    code: `SELECT customer_id, name, city, signup_date
FROM customers
WHERE region = 'US'
ORDER BY signup_date ASC;`,
    order: "exact",
  },
  {
    id: "q03",
    difficulty: "Easy",
    company: "Walmart",
    title: "Premium Audio catalog",
    statement:
      "From the products table, list products in the 'Audio' category whose catalog price is at least 10000 cents. Output product_id, name and price_cents, ordered by price_cents descending.",
    code: `SELECT product_id, name, price_cents
FROM products
WHERE category = 'Audio' AND price_cents >= 10000
ORDER BY price_cents DESC;`,
    order: "exact",
  },
  {
    id: "q04",
    difficulty: "Easy",
    company: "eBay",
    title: "Distinct order statuses",
    statement:
      "List every distinct status value that appears in the orders table, one per row, ordered alphabetically. Single column: status.",
    code: `SELECT DISTINCT status
FROM orders
ORDER BY status ASC;`,
    order: "exact",
  },
  {
    id: "q05",
    difficulty: "Easy",
    company: "Shopify",
    title: "Customer count per region",
    statement:
      "Count the customers per region. Output region and customer_count, ordered by customer_count descending, then region ascending.",
    code: `SELECT region, COUNT(*) AS customer_count
FROM customers
GROUP BY region
ORDER BY customer_count DESC, region ASC;`,
    order: "exact",
  },
  {
    id: "q06",
    difficulty: "Easy",
    company: "Amazon",
    title: "Top 5 catalog prices",
    statement:
      "List the five most expensive products by catalog price. Output product_id, name and price_cents, ordered by price_cents descending.",
    code: `SELECT product_id, name, price_cents
FROM products
ORDER BY price_cents DESC
LIMIT 5;`,
    order: "exact",
  },
  {
    id: "q07",
    difficulty: "Easy",
    company: "Walmart",
    title: "Discounted line count",
    statement:
      "Count how many order_items rows carry a discount (discount_cents is not null). Output a single column discounted_lines with one row.",
    code: `SELECT COUNT(*) AS discounted_lines
FROM order_items
WHERE discount_cents IS NOT NULL;`,
    order: "exact",
  },
  {
    id: "q08",
    difficulty: "Easy",
    company: "Amazon",
    title: "June order volume",
    statement:
      "Count the orders placed in June 2026 (order_date between '2026-06-01' and '2026-06-30', inclusive). Output a single column june_orders with one row.",
    code: `SELECT COUNT(*) AS june_orders
FROM orders
WHERE order_date BETWEEN '2026-06-01' AND '2026-06-30';`,
    order: "exact",
  },
  {
    id: "q09",
    difficulty: "Easy",
    company: "eBay",
    title: "April signups",
    statement:
      "List customers who signed up in April 2026. Output customer_id, name and signup_date, ordered by signup_date ascending.",
    code: `SELECT customer_id, name, signup_date
FROM customers
WHERE signup_date BETWEEN '2026-04-01' AND '2026-04-30'
ORDER BY signup_date ASC;`,
    order: "exact",
  },
  {
    id: "q10",
    difficulty: "Easy",
    company: "Shopify",
    title: "Basket size spread",
    statement:
      "On the order_items table, count how many lines have each quantity value. Output quantity and line_count, ordered by quantity ascending.",
    code: `SELECT quantity, COUNT(*) AS line_count
FROM order_items
GROUP BY quantity
ORDER BY quantity ASC;`,
    order: "exact",
  },
  {
    id: "q11",
    difficulty: "Easy",
    company: "Walmart",
    title: "Thin-margin products",
    statement:
      "A product's margin rate is 100.0 * (price_cents - cost_cents) / price_cents. List the products whose margin rate is strictly below 40 percent. Output product_id, name and margin_pct rounded to 1 decimal, ordered by margin_pct ascending.",
    code: `SELECT product_id, name,
       ROUND(100.0 * (price_cents - cost_cents) / price_cents, 1) AS margin_pct
FROM products
WHERE 100.0 * (price_cents - cost_cents) / price_cents < 40
ORDER BY margin_pct ASC;`,
    order: "exact",
  },
  {
    id: "q12",
    difficulty: "Easy",
    company: "Amazon",
    title: "Event type census",
    statement:
      "Count the events per event_type. Output event_type and event_count, ordered by event_count descending, then event_type ascending.",
    code: `SELECT event_type, COUNT(*) AS event_count
FROM events
GROUP BY event_type
ORDER BY event_count DESC, event_type ASC;`,
    order: "exact",
  },
  {
    id: "q13",
    difficulty: "Easy",
    company: "eBay",
    title: "VIP roster",
    statement:
      "List the customers whose segment is 'vip'. Output customer_id, name and city, ordered by customer_id ascending.",
    code: `SELECT customer_id, name, city
FROM customers
WHERE segment = 'vip'
ORDER BY customer_id ASC;`,
    order: "exact",
  },
  {
    id: "q14",
    difficulty: "Easy",
    company: "Shopify",
    title: "Units sold of the flagship",
    statement:
      "Sum the quantity across all order_items lines for product_id 1 (the Pulse Wireless Headphones), regardless of order status. Output a single column units_sold with one row.",
    code: `SELECT SUM(quantity) AS units_sold
FROM order_items
WHERE product_id = 1;`,
    order: "exact",
  },
  {
    id: "q15",
    difficulty: "Easy",
    company: "Walmart",
    title: "Product pages browsed",
    statement:
      "Count the distinct page values in events that start with '/product/'. Output a single column product_pages with one row.",
    code: `SELECT COUNT(DISTINCT page) AS product_pages
FROM events
WHERE page LIKE '/product/%';`,
    order: "exact",
  },
  {
    id: "q16",
    difficulty: "Easy",
    company: "Amazon",
    title: "Average catalog price per category",
    statement:
      "For each product category, compute the average catalog price in cents, rounded to 2 decimals. Output category and avg_price, ordered by avg_price descending.",
    code: `SELECT category, ROUND(AVG(price_cents), 2) AS avg_price
FROM products
GROUP BY category
ORDER BY avg_price DESC;`,
    order: "exact",
  },
  {
    id: "q17",
    difficulty: "Easy",
    company: "eBay",
    title: "Latest three orders",
    statement:
      "List the three most recent orders by order_date. Output order_id, order_date and status, ordered by order_date descending, then order_id descending.",
    code: `SELECT order_id, order_date, status
FROM orders
ORDER BY order_date DESC, order_id DESC
LIMIT 3;`,
    order: "exact",
  },
  {
    id: "q18",
    difficulty: "Easy",
    company: "Shopify",
    title: "Budget shelf",
    statement:
      "List the three cheapest products by catalog price. Output product_id, name and price_cents, ordered by price_cents ascending.",
    code: `SELECT product_id, name, price_cents
FROM products
ORDER BY price_cents ASC
LIMIT 3;`,
    order: "exact",
  },
  {
    id: "q19",
    difficulty: "Easy",
    company: "Walmart",
    title: "Multi-unit lines",
    statement:
      "List the order_items lines where at least 2 units were bought. Output order_item_id, order_id, product_id and quantity, ordered by quantity descending, then order_item_id ascending.",
    code: `SELECT order_item_id, order_id, product_id, quantity
FROM order_items
WHERE quantity >= 2
ORDER BY quantity DESC, order_item_id ASC;`,
    order: "exact",
  },
  {
    id: "q20",
    difficulty: "Easy",
    company: "Amazon",
    title: "Launch-day traffic",
    statement:
      "Count the events whose timestamp falls on 2026-07-20 UTC — event_ts between 1784505600 (the day's opener) and 1784591999 (its last second), inclusive. Output a single column day_events with one row.",
    code: `SELECT COUNT(*) AS day_events
FROM events
WHERE event_ts BETWEEN 1784505600 AND 1784591999;`,
    order: "exact",
  },

  // -------------------------------------------------------------- Medium 20
  {
    id: "q21",
    difficulty: "Medium",
    company: "Amazon",
    title: "Revenue ladder",
    statement:
      "Rank the customers by delivered gross revenue — the sum of quantity * unit_price_cents over lines of delivered orders. Output customer_id and gross_revenue, highest first; break ties by customer_id ascending. Two customers sit exactly tied here — the tiebreak decides their order.",
    code: `SELECT o.customer_id,
       SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
WHERE o.status = 'delivered'
GROUP BY o.customer_id
ORDER BY gross_revenue DESC, o.customer_id ASC;`,
    order: "exact",
  },
  {
    id: "q22",
    difficulty: "Medium",
    company: "Shopify",
    title: "Monthly gross",
    statement:
      "Compute delivered gross revenue per calendar month (strftime('%Y-%m', order_date)). Output month and gross_revenue, ordered by month ascending.",
    code: `SELECT strftime('%Y-%m', o.order_date) AS month,
       SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
WHERE o.status = 'delivered'
GROUP BY month
ORDER BY month ASC;`,
    order: "exact",
  },
  {
    id: "q23",
    difficulty: "Medium",
    company: "Walmart",
    title: "Category gross",
    statement:
      "Compute delivered gross revenue per product category. Output category and gross_revenue, ordered by gross_revenue descending.",
    code: `SELECT p.category,
       SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue
FROM order_items oi
JOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'
JOIN products p ON p.product_id = oi.product_id
GROUP BY p.category
ORDER BY gross_revenue DESC;`,
    order: "exact",
  },
  {
    id: "q24",
    difficulty: "Medium",
    company: "Amazon",
    title: "Every customer's order count",
    statement:
      "Count the orders of every customer, INCLUDING customers who never ordered — they must show 0, not vanish. Output customer_id and order_count for all 12 customers, ordered by order_count descending, then customer_id ascending.",
    code: `SELECT c.customer_id, COUNT(o.order_id) AS order_count
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id
ORDER BY order_count DESC, c.customer_id ASC;`,
    order: "exact",
  },
  {
    id: "q25",
    difficulty: "Medium",
    company: "eBay",
    title: "Revenue by region",
    statement:
      "Compute delivered gross revenue per customer region. Output region and gross_revenue, ordered by gross_revenue descending.",
    code: `SELECT c.region,
       SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id AND o.status = 'delivered'
JOIN order_items oi ON oi.order_id = o.order_id
GROUP BY c.region
ORDER BY gross_revenue DESC;`,
    order: "exact",
  },
  {
    id: "q26",
    difficulty: "Medium",
    company: "Amazon",
    title: "Unit movers podium",
    statement:
      "Rank products by delivered units sold (sum of quantity). Return only the top THREE ranks using RANK() — ties share a rank and the next rank skips. Output rank, product_id and units, ordered by rank ascending, then product_id ascending.",
    code: `WITH units AS (
  SELECT p.product_id, SUM(oi.quantity) AS units
  FROM order_items oi
  JOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'
  JOIN products p ON p.product_id = oi.product_id
  GROUP BY p.product_id
)
SELECT RANK() OVER (ORDER BY units DESC) AS rank,
       product_id, units
FROM units
ORDER BY rank ASC, product_id ASC
LIMIT 3;`,
    order: "exact",
  },
  {
    id: "q27",
    difficulty: "Medium",
    company: "Shopify",
    title: "Basket value ladder",
    statement:
      "Average order value per customer: delivered gross revenue divided by that customer's delivered order count, rounded to 2 decimals. Output customer_id and aov, ordered by aov descending, then customer_id ascending.",
    code: `SELECT o.customer_id,
       ROUND(SUM(oi.quantity * oi.unit_price_cents) * 1.0
             / COUNT(DISTINCT o.order_id), 2) AS aov
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
WHERE o.status = 'delivered'
GROUP BY o.customer_id
ORDER BY aov DESC, o.customer_id ASC;`,
    order: "exact",
  },
  {
    id: "q28",
    difficulty: "Medium",
    company: "Walmart",
    title: "Net revenue ladder",
    statement:
      "Net revenue counts discounts: sum of quantity * unit_price_cents - COALESCE(discount_cents, 0) over delivered lines, per customer. Output customer_id and net_revenue, ordered by net_revenue descending, then customer_id ascending. The mirror pair at the top of the middle of the ladder is planted — both land on the same net figure.",
    code: `SELECT o.customer_id,
       SUM(oi.quantity * oi.unit_price_cents - COALESCE(oi.discount_cents, 0)) AS net_revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
WHERE o.status = 'delivered'
GROUP BY o.customer_id
ORDER BY net_revenue DESC, o.customer_id ASC;`,
    order: "exact",
  },
  {
    id: "q29",
    difficulty: "Medium",
    company: "Amazon",
    title: "Repeat buyers",
    statement:
      "List customers with at least 2 delivered orders. Output customer_id and delivered_orders, ordered by delivered_orders descending, then customer_id ascending.",
    code: `SELECT o.customer_id, COUNT(*) AS delivered_orders
FROM orders o
WHERE o.status = 'delivered'
GROUP BY o.customer_id
HAVING COUNT(*) >= 2
ORDER BY delivered_orders DESC, o.customer_id ASC;`,
    order: "exact",
  },
  {
    id: "q30",
    difficulty: "Medium",
    company: "eBay",
    title: "Window shoppers",
    statement:
      "Using the events table, find customers who viewed products but NEVER added anything to the cart. Output customer_id and view_count, ordered by view_count descending, then customer_id ascending. Two customers qualify — one of them browses constantly.",
    code: `SELECT customer_id,
       SUM(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END) AS view_count
FROM events
GROUP BY customer_id
HAVING SUM(CASE WHEN event_type = 'cart' THEN 1 ELSE 0 END) = 0
ORDER BY view_count DESC, customer_id ASC;`,
    order: "exact",
  },
  {
    id: "q31",
    difficulty: "Medium",
    company: "Shopify",
    title: "Month over month",
    statement:
      "Compute delivered gross revenue per month plus the previous month's figure beside it (LAG). Output month, gross_revenue and prev_month_revenue, ordered by month ascending. The first month's prev is NULL.",
    code: `WITH monthly AS (
  SELECT strftime('%Y-%m', o.order_date) AS month,
         SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY month
)
SELECT month, gross_revenue,
       LAG(gross_revenue) OVER (ORDER BY month) AS prev_month_revenue
FROM monthly
ORDER BY month ASC;`,
    order: "exact",
  },
  {
    id: "q32",
    difficulty: "Medium",
    company: "Walmart",
    title: "Cross-category baskets",
    statement:
      "Find the delivered orders whose lines span at least 2 distinct product categories. Output order_id and category_count, ordered by category_count descending, then order_id ascending.",
    code: `SELECT o.order_id, COUNT(DISTINCT p.category) AS category_count
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
JOIN products p ON p.product_id = oi.product_id
WHERE o.status = 'delivered'
GROUP BY o.order_id
HAVING COUNT(DISTINCT p.category) >= 2
ORDER BY category_count DESC, o.order_id ASC;`,
    order: "exact",
  },
  {
    id: "q33",
    difficulty: "Medium",
    company: "Amazon",
    title: "Most recent purchase",
    statement:
      "For each customer who has at least one delivered order, show their most recent delivered order date. Output customer_id and last_order, ordered by last_order descending, then customer_id ascending. Customers with no delivered orders must not appear.",
    code: `SELECT o.customer_id, MAX(o.order_date) AS last_order
FROM orders o
WHERE o.status = 'delivered'
GROUP BY o.customer_id
ORDER BY last_order DESC, o.customer_id ASC;`,
    order: "exact",
  },
  {
    id: "q34",
    difficulty: "Medium",
    company: "eBay",
    title: "The shelf sitter",
    statement:
      "Find products that appear in NO order_items line at all (any status). Output product_id, name and category. Exactly one product qualifies.",
    code: `SELECT p.product_id, p.name, p.category
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.product_id
WHERE oi.order_item_id IS NULL;`,
    order: "exact",
  },
  {
    id: "q35",
    difficulty: "Medium",
    company: "Shopify",
    title: "Discount ledger",
    statement:
      "Per customer, count the discounted delivered lines and sum the discounts given. Only customers with at least one discounted delivered line appear. Output customer_id, discounted_lines and total_discount, ordered by total_discount descending, then customer_id ascending.",
    code: `SELECT o.customer_id, COUNT(*) AS discounted_lines,
       SUM(oi.discount_cents) AS total_discount
FROM order_items oi
JOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'
WHERE oi.discount_cents IS NOT NULL
GROUP BY o.customer_id
ORDER BY total_discount DESC, o.customer_id ASC;`,
    order: "exact",
  },
  {
    id: "q36",
    difficulty: "Medium",
    company: "Amazon",
    title: "Checkout days",
    statement:
      "Count the checkout events per calendar day (strftime('%Y-%m-%d', event_ts, 'unixepoch')). Output day and checkouts, ordered by day ascending.",
    code: `SELECT strftime('%Y-%m-%d', event_ts, 'unixepoch') AS day,
       SUM(CASE WHEN event_type = 'checkout' THEN 1 ELSE 0 END) AS checkouts
FROM events
GROUP BY day
ORDER BY day ASC;`,
    order: "exact",
  },
  {
    id: "q37",
    difficulty: "Medium",
    company: "Walmart",
    title: "Regional champions",
    statement:
      "For each customer region, find the customer with the highest delivered gross revenue. Output region, customer_id and gross_revenue, ordered by region ascending. Use ROW_NUMBER over a region partition so exactly one winner ships per region, and break within-region ties by customer_id ascending.",
    code: `WITH spend AS (
  SELECT c.region, o.customer_id,
         SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue
  FROM customers c
  JOIN orders o ON o.customer_id = c.customer_id AND o.status = 'delivered'
  JOIN order_items oi ON oi.order_id = o.order_id
  GROUP BY c.region, o.customer_id
),
ranked AS (
  SELECT region, customer_id, gross_revenue,
         ROW_NUMBER() OVER (PARTITION BY region
                            ORDER BY gross_revenue DESC, customer_id ASC) AS rn
  FROM spend
)
SELECT region, customer_id, gross_revenue
FROM ranked
WHERE rn = 1
ORDER BY region ASC;`,
    order: "exact",
  },
  {
    id: "q38",
    difficulty: "Medium",
    company: "Amazon",
    title: "Cumulative revenue",
    statement:
      "Compute delivered gross revenue per calendar day, then a running total across days in date order. Output order_date, day_gross and running_gross, ordered by order_date ascending.",
    code: `WITH daily AS (
  SELECT o.order_date,
         SUM(oi.quantity * oi.unit_price_cents) AS day_gross
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY o.order_date
)
SELECT order_date, day_gross,
       SUM(day_gross) OVER (ORDER BY order_date
                            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_gross
FROM daily
ORDER BY order_date ASC;`,
    order: "exact",
  },
  {
    id: "q39",
    difficulty: "Medium",
    company: "eBay",
    title: "The biggest baskets",
    statement:
      "Find the delivered orders with the LARGEST line count. Several orders tie at the maximum — all of them must ship, ranked with RANK(). Output rank, order_id and line_count, ordered by rank ascending, then order_id ascending.",
    code: `WITH sizes AS (
  SELECT o.order_id, COUNT(*) AS line_count
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY o.order_id
),
ranked AS (
  SELECT RANK() OVER (ORDER BY line_count DESC) AS rank,
         order_id, line_count
  FROM sizes
)
SELECT rank, order_id, line_count
FROM ranked
WHERE rank = 1
ORDER BY order_id ASC;`,
    order: "exact",
  },
  {
    id: "q40",
    difficulty: "Medium",
    company: "Shopify",
    title: "Signup-to-first-order lag",
    statement:
      "For each customer with at least one delivered order, compute the days from signup to their FIRST delivered order: CAST(julianday(first_order) - julianday(signup_date) AS INTEGER). Output customer_id and lag_days, ordered by lag_days descending, then customer_id ascending.",
    code: `SELECT c.customer_id,
       CAST(julianday(MIN(o.order_date)) - julianday(c.signup_date) AS INTEGER) AS lag_days
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id AND o.status = 'delivered'
GROUP BY c.customer_id
ORDER BY lag_days DESC, c.customer_id ASC;`,
    order: "exact",
  },

  // ---------------------------------------------------------------- Hard 20
  {
    id: "q41",
    difficulty: "Hard",
    company: "Northwind Goods",
    title: "Raw RFM columns",
    statement:
      "Build the RFM inputs per customer over DELIVERED orders, anchored to the fixed review date '2026-09-01' (pin it once in a named CTE): recency = CAST(julianday('2026-09-01') - julianday(MAX(order_date)) AS INTEGER), frequency = the delivered order count, monetary = delivered gross revenue. Output customer_id, recency, frequency and monetary, ordered by monetary descending, then customer_id ascending.",
    code: `WITH anchor(review_date) AS (VALUES ('2026-09-01')),
rfm AS (
  SELECT o.customer_id,
         MAX(o.order_date) AS last_order,
         COUNT(DISTINCT o.order_id) AS frequency,
         SUM(oi.quantity * oi.unit_price_cents) AS monetary
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY o.customer_id
)
SELECT r.customer_id,
       CAST(julianday(a.review_date) - julianday(r.last_order) AS INTEGER) AS recency,
       r.frequency, r.monetary
FROM rfm r CROSS JOIN anchor a
ORDER BY r.monetary DESC, r.customer_id ASC;`,
    order: "exact",
  },
  {
    id: "q42",
    difficulty: "Hard",
    company: "Shopify",
    title: "RFM quintile scores",
    statement:
      "Score the delivered customers on each RFM axis with NTILE(5) over the 11 customers: monetary_score = NTILE(5) ordered by monetary DESC, frequency_score = NTILE(5) ordered by frequency DESC, recency_score = NTILE(5) ordered by recency ASC (smaller recency = better = higher score). Output customer_id, recency_score, frequency_score and monetary_score, ordered by monetary_score descending, then frequency_score descending, then customer_id ascending.",
    code: `WITH rfm AS (
  SELECT o.customer_id,
         CAST(julianday('2026-09-01') - julianday(MAX(o.order_date)) AS INTEGER) AS recency,
         COUNT(DISTINCT o.order_id) AS frequency,
         SUM(oi.quantity * oi.unit_price_cents) AS monetary
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY o.customer_id
)
SELECT customer_id,
       NTILE(5) OVER (ORDER BY recency ASC) AS recency_score,
       NTILE(5) OVER (ORDER BY frequency DESC) AS frequency_score,
       NTILE(5) OVER (ORDER BY monetary DESC) AS monetary_score
FROM rfm
ORDER BY monetary_score DESC, frequency_score DESC, customer_id ASC;`,
    order: "exact",
  },
  {
    id: "q43",
    difficulty: "Hard",
    company: "Walmart",
    title: "Three-day smoothing",
    statement:
      "Over the delivered revenue-by-day series, compute a 3-day moving average: the average of day_gross for the current day and the two preceding calendar days IN THE SERIES (not the calendar — days with no orders simply do not exist here), rounded to 2 decimals. Output order_date, day_gross and ma3, ordered by order_date ascending.",
    code: `WITH daily AS (
  SELECT o.order_date,
         SUM(oi.quantity * oi.unit_price_cents) AS day_gross
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY o.order_date
)
SELECT order_date, day_gross,
       ROUND(AVG(day_gross) OVER (
         ORDER BY order_date
         ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS ma3
FROM daily
ORDER BY order_date ASC;`,
    order: "exact",
  },
  {
    id: "q44",
    difficulty: "Hard",
    company: "Kartly",
    title: "Session counter",
    statement:
      "Sessionize the events with a 1800-second gap rule: a new session starts when the gap to the customer's previous event (by event_ts) exceeds 1800 seconds, or when there is no previous event. Count the sessions per customer. Output customer_id and sessions, ordered by sessions descending, then customer_id ascending.",
    code: `WITH seq AS (
  SELECT customer_id, event_ts,
         LAG(event_ts) OVER (PARTITION BY customer_id ORDER BY event_ts) AS prev_ts
  FROM events
),
stamped AS (
  SELECT customer_id, event_ts,
         SUM(CASE WHEN prev_ts IS NULL OR event_ts - prev_ts > 1800
                  THEN 1 ELSE 0 END) OVER (
           PARTITION BY customer_id ORDER BY event_ts
           ROWS UNBOUNDED PRECEDING) AS session_id
  FROM seq
)
SELECT customer_id, COUNT(DISTINCT session_id) AS sessions
FROM stamped
GROUP BY customer_id
ORDER BY sessions DESC, customer_id ASC;`,
    order: "exact",
  },
  {
    id: "q45",
    difficulty: "Hard",
    company: "Kartly",
    title: "Same-day full funnel",
    statement:
      "Find the (customer, calendar day) pairs — day from strftime('%Y-%m-%d', event_ts, 'unixepoch') — where all three funnel steps happened on that day: at least one view, at least one cart and at least one checkout. Output customer_id, day, views, carts and checkouts, ordered by day ascending, then customer_id ascending.",
    code: `SELECT customer_id,
       strftime('%Y-%m-%d', event_ts, 'unixepoch') AS day,
       SUM(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END) AS views,
       SUM(CASE WHEN event_type = 'cart' THEN 1 ELSE 0 END) AS carts,
       SUM(CASE WHEN event_type = 'checkout' THEN 1 ELSE 0 END) AS checkouts
FROM events
GROUP BY customer_id, day
HAVING views >= 1 AND carts >= 1 AND checkouts >= 1
ORDER BY day ASC, customer_id ASC;`,
    order: "exact",
  },
  {
    id: "q46",
    difficulty: "Hard",
    company: "eBay",
    title: "Tied-day census",
    statement:
      "The mirror structure plants day-level revenue ties: several delivered days share the same gross. Find every delivered day-gross value that occurs on MORE THAN ONE date, and list each tied value with its dates concatenated in date order using GROUP_CONCAT(order_date, ','). Output tied_gross and dates, ordered by tied_gross descending.",
    code: `WITH daily AS (
  SELECT o.order_date,
         SUM(oi.quantity * oi.unit_price_cents) AS day_gross
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY o.order_date
),
tallied AS (
  SELECT day_gross, COUNT(*) AS n,
         GROUP_CONCAT(order_date, ',') AS dates
  FROM daily
  GROUP BY day_gross
)
SELECT day_gross AS tied_gross, dates
FROM tallied
WHERE n > 1
ORDER BY tied_gross DESC;`,
    order: "exact",
  },
  {
    id: "q47",
    difficulty: "Hard",
    company: "Northwind Goods",
    title: "The six-figure net wall",
    statement:
      "Compliance grades accounts on NET delivered spend — quantity * unit_price_cents - COALESCE(discount_cents, 0), summed per customer. List every customer whose net delivered spend is at least 100000 cents. Output customer_id and net_spend, ordered by net_spend descending. The planted trap: the mirror pair crosses the wall on GROSS but stays under it on NET — measure what the rule actually names.",
    code: `SELECT o.customer_id,
       SUM(oi.quantity * oi.unit_price_cents - COALESCE(oi.discount_cents, 0)) AS net_spend
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
WHERE o.status = 'delivered'
GROUP BY o.customer_id
HAVING SUM(oi.quantity * oi.unit_price_cents - COALESCE(oi.discount_cents, 0)) >= 100000
ORDER BY net_spend DESC;`,
    order: "exact",
  },
  {
    id: "q48",
    difficulty: "Hard",
    company: "Amazon",
    title: "Category leaders podium",
    statement:
      "Per product category, take the top TWO products by delivered gross revenue. Output category, product_id and gross_revenue, ordered by category ascending, then gross_revenue descending, then product_id ascending. Use ROW_NUMBER in a category partition so exactly two ship per category.",
    code: `WITH prod AS (
  SELECT p.category, p.product_id,
         SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue
  FROM order_items oi
  JOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'
  JOIN products p ON p.product_id = oi.product_id
  GROUP BY p.category, p.product_id
),
ranked AS (
  SELECT category, product_id, gross_revenue,
         ROW_NUMBER() OVER (PARTITION BY category
                            ORDER BY gross_revenue DESC, product_id ASC) AS rn
  FROM prod
)
SELECT category, product_id, gross_revenue
FROM ranked
WHERE rn <= 2
ORDER BY category ASC, gross_revenue DESC, product_id ASC;`,
    order: "exact",
  },
  {
    id: "q49",
    difficulty: "Hard",
    company: "Shopify",
    title: "Cohort conversion lag",
    statement:
      "Build signup cohorts by month (strftime('%Y-%m', signup_date)) and count, per cohort, how many customers placed their first delivered order in the SAME month they signed up versus a LATER month (or never). Output cohort_month, same_month and later_or_never, ordered by cohort_month ascending. Include every cohort month that has at least one customer.",
    code: `WITH firsts AS (
  SELECT c.customer_id, strftime('%Y-%m', c.signup_date) AS cohort_month,
         MIN(o.order_date) AS first_order
  FROM customers c
  JOIN orders o ON o.customer_id = c.customer_id AND o.status = 'delivered'
  GROUP BY c.customer_id
)
SELECT cohort_month,
       SUM(CASE WHEN strftime('%Y-%m', first_order) = cohort_month THEN 1 ELSE 0 END) AS same_month,
       SUM(CASE WHEN strftime('%Y-%m', first_order) <> cohort_month THEN 1 ELSE 0 END) AS later_or_never
FROM firsts
GROUP BY cohort_month
ORDER BY cohort_month ASC;`,
    order: "exact",
  },
  {
    id: "q50",
    difficulty: "Hard",
    company: "Walmart",
    title: "Weekly pulse with delta",
    statement:
      "Bucket delivered orders into ISO-like weeks as strftime('%Y-W%W', order_date) and count them. Then compute the week-over-week change: orders_this_week minus orders_previous_week (LAG). Output week, orders and wow_delta, ordered by week ascending. The first week's delta is NULL.",
    code: `WITH weekly AS (
  SELECT strftime('%Y-W%W', order_date) AS week, COUNT(*) AS orders
  FROM orders
  WHERE status = 'delivered'
  GROUP BY week
)
SELECT week, orders,
       orders - LAG(orders) OVER (ORDER BY week) AS wow_delta
FROM weekly
ORDER BY week ASC;`,
    order: "exact",
  },
  {
    id: "q51",
    difficulty: "Hard",
    company: "eBay",
    title: "Return-abuse flag",
    statement:
      "Flag return abuse: per customer, count their returns and their delivered order lines, and keep customers with at least 3 returns AND a return rate (returns * 1.0 / delivered_lines) above 0.25, rounded to 2 decimals. Output customer_id, returns, delivered_lines and return_rate, ordered by returns descending, then customer_id ascending.",
    code: `WITH lines AS (
  SELECT o.customer_id, COUNT(*) AS delivered_lines
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY o.customer_id
),
rets AS (
  SELECT o.customer_id, COUNT(*) AS returns
  FROM returns r
  JOIN order_items oi ON oi.order_item_id = r.order_item_id
  JOIN orders o ON o.order_id = oi.order_id
  GROUP BY o.customer_id
)
SELECT rets.customer_id, rets.returns, lines.delivered_lines,
       ROUND(rets.returns * 1.0 / lines.delivered_lines, 2) AS return_rate
FROM rets
JOIN lines ON lines.customer_id = rets.customer_id
WHERE rets.returns >= 3
  AND rets.returns * 1.0 / lines.delivered_lines > 0.25
ORDER BY rets.returns DESC, rets.customer_id ASC;`,
    order: "exact",
  },
  {
    id: "q52",
    difficulty: "Hard",
    company: "Kartly",
    title: "Burst detector",
    statement:
      "Detect same-type event bursts: for each event, look back 300 seconds (its timestamp minus the previous same-type event's timestamp for the same customer, using LAG over a (customer_id, event_type) partition ordered by event_ts). A burst member is an event whose gap to the previous same-type event is 300 seconds OR LESS. Report every (customer_id, event_type) pair that has at least 3 burst members. Output customer_id, event_type and burst_events, ordered by burst_events descending, then customer_id ascending, then event_type ascending. The planted burst is four carts 90 seconds apart.",
    code: `WITH gaps AS (
  SELECT customer_id, event_type, event_ts,
         event_ts - LAG(event_ts) OVER (
           PARTITION BY customer_id, event_type ORDER BY event_ts) AS gap
  FROM events
),
members AS (
  SELECT customer_id, event_type
  FROM gaps
  WHERE gap IS NOT NULL AND gap <= 300
)
SELECT customer_id, event_type, COUNT(*) AS burst_events
FROM members
GROUP BY customer_id, event_type
HAVING COUNT(*) >= 3
ORDER BY burst_events DESC, customer_id ASC, event_type ASC;`,
    order: "exact",
  },
  {
    id: "q53",
    difficulty: "Hard",
    company: "Amazon",
    title: "Peak month argmax",
    statement:
      "Find the calendar month with the highest delivered gross revenue. Output a single row with month and gross_revenue. Use an ORDER BY + LIMIT 1 (or an equivalent argmax) — and no ties exist to worry about here.",
    code: `WITH monthly AS (
  SELECT strftime('%Y-%m', o.order_date) AS month,
         SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY month
)
SELECT month, gross_revenue
FROM monthly
ORDER BY gross_revenue DESC
LIMIT 1;`,
    order: "exact",
  },
  {
    id: "q54",
    difficulty: "Hard",
    company: "Northwind Goods",
    title: "VIP blind spots",
    statement:
      "The VIP segment (customers with segment 'vip') has never bought certain products. Find products that appear on NO delivered line of ANY vip customer. Output product_id, name and category, ordered by product_id ascending.",
    code: `SELECT p.product_id, p.name, p.category
FROM products p
WHERE NOT EXISTS (
  SELECT 1
  FROM order_items oi
  JOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'
  JOIN customers c ON c.customer_id = o.customer_id
  WHERE oi.product_id = p.product_id AND c.segment = 'vip'
)
ORDER BY p.product_id ASC;`,
    order: "exact",
  },
  {
    id: "q55",
    difficulty: "Hard",
    company: "Walmart",
    title: "Share of category",
    statement:
      "For every sold product (delivered lines), compute its gross revenue and its share of its category's delivered gross: 100.0 * product_gross / category_gross, rounded to 1 decimal. Output product_id, category, gross_revenue and share_pct, ordered by category ascending, then gross_revenue descending, then product_id ascending.",
    code: `WITH prod AS (
  SELECT p.product_id, p.category,
         SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue
  FROM order_items oi
  JOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'
  JOIN products p ON p.product_id = oi.product_id
  GROUP BY p.product_id
)
SELECT product_id, category, gross_revenue,
       ROUND(100.0 * gross_revenue
             / SUM(gross_revenue) OVER (PARTITION BY category), 1) AS share_pct
FROM prod
ORDER BY category ASC, gross_revenue DESC, product_id ASC;`,
    order: "exact",
  },
  {
    id: "q56",
    difficulty: "Hard",
    company: "eBay",
    title: "Lapsed-window watchlist",
    statement:
      "Per customer, walk their delivered orders in date order and measure the gap in days from each order to the previous one (julianday difference, CAST to INTEGER; the first order's gap is NULL). Keep only the customer-day rows where the gap exceeds 30 days — the lapsed windows worth a win-back email. Output customer_id, order_date and gap_days, ordered by gap_days descending, then customer_id ascending, then order_date ascending.",
    code: `WITH seq AS (
  SELECT o.customer_id, o.order_date,
         LAG(o.order_date) OVER (PARTITION BY o.customer_id ORDER BY o.order_date) AS prev_date
  FROM orders o
  WHERE o.status = 'delivered'
)
SELECT customer_id, order_date,
       CAST(julianday(order_date) - julianday(prev_date) AS INTEGER) AS gap_days
FROM seq
WHERE prev_date IS NOT NULL
  AND julianday(order_date) - julianday(prev_date) > 30
ORDER BY gap_days DESC, customer_id ASC, order_date ASC;`,
    order: "exact",
  },
  {
    id: "q57",
    difficulty: "Hard",
    company: "Shopify",
    title: "Dense net ladder",
    statement:
      "Rank customers by NET delivered spend (discounts subtracted via COALESCE) using DENSE_RANK — the two planted ties must share a rank and the next rank must NOT skip. Output dense_rank, customer_id and net_spend, ordered by dense_rank ascending, then customer_id ascending.",
    code: `WITH net AS (
  SELECT o.customer_id,
         SUM(oi.quantity * oi.unit_price_cents - COALESCE(oi.discount_cents, 0)) AS net_spend
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY o.customer_id
)
SELECT DENSE_RANK() OVER (ORDER BY net_spend DESC) AS dense_rank,
       customer_id, net_spend
FROM net
ORDER BY dense_rank ASC, customer_id ASC;`,
    order: "exact",
  },
  {
    id: "q58",
    difficulty: "Hard",
    company: "Kartly",
    title: "Longest session span",
    statement:
      "Sessionize events with the 1800-second gap rule (new session when the gap to the previous event exceeds 1800 seconds). For each session compute its span: last event_ts minus first event_ts, in seconds. Report each customer's LONGEST session span (a one-event session has span 0). Output customer_id and max_span, ordered by max_span descending, then customer_id ascending.",
    code: `WITH seq AS (
  SELECT customer_id, event_ts,
         LAG(event_ts) OVER (PARTITION BY customer_id ORDER BY event_ts) AS prev_ts
  FROM events
),
stamped AS (
  SELECT customer_id, event_ts,
         SUM(CASE WHEN prev_ts IS NULL OR event_ts - prev_ts > 1800
                  THEN 1 ELSE 0 END) OVER (
           PARTITION BY customer_id ORDER BY event_ts
           ROWS UNBOUNDED PRECEDING) AS session_id
  FROM seq
),
spans AS (
  SELECT customer_id, session_id,
         MAX(event_ts) - MIN(event_ts) AS span
  FROM stamped
  GROUP BY customer_id, session_id
)
SELECT customer_id, MAX(span) AS max_span
FROM spans
GROUP BY customer_id
ORDER BY max_span DESC, customer_id ASC;`,
    order: "exact",
  },
  {
    id: "q59",
    difficulty: "Hard",
    company: "Northwind Goods",
    title: "Snapshot margin by category",
    statement:
      "Margin must use the SNAPSHOT price the customer actually paid: per category, sum quantity * (unit_price_cents - cost_cents) over delivered lines, where cost_cents still comes from the catalog join. Output category and line_margin, ordered by line_margin descending. The three drifted snapshot rows are inside these sums — joining the catalog price instead would flatter the numbers.",
    code: `SELECT p.category,
       SUM(oi.quantity * (oi.unit_price_cents - p.cost_cents)) AS line_margin
FROM order_items oi
JOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'
JOIN products p ON p.product_id = oi.product_id
GROUP BY p.category
ORDER BY line_margin DESC;`,
    order: "exact",
  },
  {
    id: "q60",
    difficulty: "Hard",
    company: "Kartly",
    title: "Hour-of-day heatmap",
    statement:
      "Build the traffic heatmap: for each hour of day (CAST(strftime('%H', event_ts, 'unixepoch') AS INTEGER)), count the events and count how many DISTINCT customers were active. Output hour, events and active_customers, ordered by events descending, then hour ascending. Ties on the event count are broken by the earlier hour.",
    code: `SELECT CAST(strftime('%H', event_ts, 'unixepoch') AS INTEGER) AS hour,
       COUNT(*) AS events,
       COUNT(DISTINCT customer_id) AS active_customers
FROM events
GROUP BY hour
ORDER BY events DESC, hour ASC;`,
    order: "exact",
  },
];
