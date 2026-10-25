// Domain Mastery — Retail & RFM · 60 case studies (20 Easy / 20 Medium /
// 20 Hard). Each case = a work scenario + TWO engine-graded steps; the
// expected outputs are generated into dm-expected.ts by scripts/r9-dm-verify.ts.
import type { DmCase } from "../domain-packs";

export const DM_RETAIL_CASES: DmCase[] = [
  // ---------------------------------------------------------------- Easy 20
  {
    id: "c01",
    difficulty: "Easy",
    company: "Amazon",
    title: "March intake audit",
    scenario:
      "Month-close is tomorrow and the intake lead wants the March picture first: how much traffic hit the pipeline, then the orders themselves for the walkthrough deck.",
    steps: [
      { prompt: "Count the orders placed in March 2026 (order_date between '2026-03-01' and '2026-03-31'). One column: march_orders.", code: `SELECT COUNT(*) AS march_orders\nFROM orders\nWHERE order_date BETWEEN '2026-03-01' AND '2026-03-31';`, order: "exact" },
      { prompt: "List those March orders: order_id, order_date, status, ordered by order_date ascending, then order_id ascending.", code: `SELECT order_id, order_date, status\nFROM orders\nWHERE order_date BETWEEN '2026-03-01' AND '2026-03-31'\nORDER BY order_date ASC, order_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c02",
    difficulty: "Easy",
    company: "Walmart",
    title: "Catalog sweep",
    scenario:
      "The category review starts in an hour. First the shelf sizes, then the cheapest entry in each category so the buyer knows where the floor sits.",
    steps: [
      { prompt: "Count products per category. Output category and product_count, ordered by product_count descending, then category ascending.", code: `SELECT category, COUNT(*) AS product_count\nFROM products\nGROUP BY category\nORDER BY product_count DESC, category ASC;`, order: "exact" },
      { prompt: "Find the cheapest catalog price per category. Output category and min_price, ordered by min_price ascending.", code: `SELECT category, MIN(price_cents) AS min_price\nFROM products\nGROUP BY category\nORDER BY min_price ASC;`, order: "exact" },
    ],
  },
  {
    id: "c03",
    difficulty: "Easy",
    company: "eBay",
    title: "Status hygiene",
    scenario:
      "Ops flagged the cancelled queue for review. Quantify it, then pull the actual rows so the team can call the customers.",
    steps: [
      { prompt: "Count cancelled orders. One column: cancelled_orders.", code: `SELECT COUNT(*) AS cancelled_orders\nFROM orders\nWHERE status = 'cancelled';`, order: "exact" },
      { prompt: "List the cancelled orders: order_id, customer_id, order_date, ordered by order_date ascending, then order_id ascending.", code: `SELECT order_id, customer_id, order_date\nFROM orders\nWHERE status = 'cancelled'\nORDER BY order_date ASC, order_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c04",
    difficulty: "Easy",
    company: "Shopify",
    title: "Region roster",
    scenario:
      "The regional roadshow needs its headcounts. Start wide, then zoom into the smallest region for the intro slides.",
    steps: [
      { prompt: "Count customers per region. Output region and customer_count, ordered by customer_count descending, then region ascending.", code: `SELECT region, COUNT(*) AS customer_count\nFROM customers\nGROUP BY region\nORDER BY customer_count DESC, region ASC;`, order: "exact" },
      { prompt: "List the LATAM customers: customer_id, name, city, ordered by customer_id ascending.", code: `SELECT customer_id, name, city\nFROM customers\nWHERE region = 'LATAM'\nORDER BY customer_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c05",
    difficulty: "Easy",
    company: "Amazon",
    title: "Big-ticket shelf",
    scenario:
      "Marketing wants to push premium hardware this quarter. Price the shelf, then price the average ticket so the campaign math has a baseline.",
    steps: [
      { prompt: "List products priced at 15000 cents or more: product_id, name, price_cents, ordered by price_cents descending.", code: `SELECT product_id, name, price_cents\nFROM products\nWHERE price_cents >= 15000\nORDER BY price_cents DESC;`, order: "exact" },
      { prompt: "Compute the average catalog price of those same products, rounded to 2 decimals. One column: premium_avg.", code: `SELECT ROUND(AVG(price_cents), 2) AS premium_avg\nFROM products\nWHERE price_cents >= 15000;`, order: "exact" },
    ],
  },
  {
    id: "c06",
    difficulty: "Easy",
    company: "Walmart",
    title: "Discount census",
    scenario:
      "Finance asked how much promo money moved this half. Count the discounted lines, then total the giveaway.",
    steps: [
      { prompt: "Count order_items lines with a non-null discount_cents. One column: discounted_lines.", code: `SELECT COUNT(*) AS discounted_lines\nFROM order_items\nWHERE discount_cents IS NOT NULL;`, order: "exact" },
      { prompt: "Sum those discounts in cents. One column: total_discount.", code: `SELECT SUM(discount_cents) AS total_discount\nFROM order_items\nWHERE discount_cents IS NOT NULL;`, order: "exact" },
    ],
  },
  {
    id: "c07",
    difficulty: "Easy",
    company: "eBay",
    title: "Signup rhythm",
    scenario:
      "Growth wants the acquisition cadence. Monthly buckets first, then the May cohort by name for the welcome-mail batch.",
    steps: [
      { prompt: "Count signups per month: strftime('%Y-%m', signup_date). Output cohort and signups, ordered by cohort ascending.", code: `SELECT strftime('%Y-%m', signup_date) AS cohort, COUNT(*) AS signups\nFROM customers\nGROUP BY cohort\nORDER BY cohort ASC;`, order: "exact" },
      { prompt: "List customers who signed up in May 2026: customer_id, name, signup_date, ordered by signup_date ascending.", code: `SELECT customer_id, name, signup_date\nFROM customers\nWHERE signup_date BETWEEN '2026-05-01' AND '2026-05-31'\nORDER BY signup_date ASC;`, order: "exact" },
    ],
  },
  {
    id: "c08",
    difficulty: "Easy",
    company: "Shopify",
    title: "Segment mix",
    scenario:
      "CRM is rebuilding its lists. Size each segment, then pull the newest one for the onboarding flow.",
    steps: [
      { prompt: "Count customers per segment. Output segment and customer_count, ordered by customer_count descending, then segment ascending.", code: `SELECT segment, COUNT(*) AS customer_count\nFROM customers\nGROUP BY segment\nORDER BY customer_count DESC, segment ASC;`, order: "exact" },
      { prompt: "List the 'new' segment customers: customer_id, name, city, ordered by customer_id ascending.", code: `SELECT customer_id, name, city\nFROM customers\nWHERE segment = 'new'\nORDER BY customer_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c09",
    difficulty: "Easy",
    company: "Amazon",
    title: "April volume",
    scenario:
      "The April retrospective needs its headline numbers. Volume first, then what became of those orders.",
    steps: [
      { prompt: "Count orders placed in April 2026. One column: april_orders.", code: `SELECT COUNT(*) AS april_orders\nFROM orders\nWHERE order_date BETWEEN '2026-04-01' AND '2026-04-30';`, order: "exact" },
      { prompt: "Count April orders per status. Output status and order_count, ordered by order_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS order_count\nFROM orders\nWHERE order_date BETWEEN '2026-04-01' AND '2026-04-30'\nGROUP BY status\nORDER BY order_count DESC, status ASC;`, order: "exact" },
    ],
  },
  {
    id: "c10",
    difficulty: "Easy",
    company: "Walmart",
    title: "Wearables ladder",
    scenario:
      "The wearables buyer is re-pricing. Show the top of the ladder, then anchor the bottom of the accessories shelf for contrast.",
    steps: [
      { prompt: "List the three most expensive Wearables: product_id, name, price_cents, ordered by price_cents descending.", code: `SELECT product_id, name, price_cents\nFROM products\nWHERE category = 'Wearables'\nORDER BY price_cents DESC\nLIMIT 3;`, order: "exact" },
      { prompt: "List the two cheapest Accessories: product_id, name, price_cents, ordered by price_cents ascending.", code: `SELECT product_id, name, price_cents\nFROM products\nWHERE category = 'Accessories'\nORDER BY price_cents ASC\nLIMIT 2;`, order: "exact" },
    ],
  },
  {
    id: "c11",
    difficulty: "Easy",
    company: "eBay",
    title: "City footprint",
    scenario:
      "The logistics deck opens with coverage. Count the cities, then name them.",
    steps: [
      { prompt: "Count distinct customer cities. One column: city_count.", code: `SELECT COUNT(DISTINCT city) AS city_count\nFROM customers;`, order: "exact" },
      { prompt: "List the distinct cities alphabetically. Single column: city.", code: `SELECT DISTINCT city\nFROM customers\nORDER BY city ASC;`, order: "exact" },
    ],
  },
  {
    id: "c12",
    difficulty: "Easy",
    company: "Shopify",
    title: "Multi-unit habits",
    scenario:
      "Bundling tests need real multi-unit demand. Find it, then detail it.",
    steps: [
      { prompt: "Count order_items lines with quantity = 2. One column: double_lines.", code: `SELECT COUNT(*) AS double_lines\nFROM order_items\nWHERE quantity = 2;`, order: "exact" },
      { prompt: "List those lines: order_item_id, order_id, product_id, ordered by order_item_id ascending.", code: `SELECT order_item_id, order_id, product_id\nFROM order_items\nWHERE quantity = 2\nORDER BY order_item_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c13",
    difficulty: "Easy",
    company: "Amazon",
    title: "Event census",
    scenario:
      "The tracking audit starts from the top: what event types exist and how loud was day two.",
    steps: [
      { prompt: "Count events per event_type. Output event_type and event_count, ordered by event_count descending, then event_type ascending.", code: `SELECT event_type, COUNT(*) AS event_count\nFROM events\nGROUP BY event_type\nORDER BY event_count DESC, event_type ASC;`, order: "exact" },
      { prompt: "Count events on 2026-07-21 (event_ts between 1784592000 and 1784678399). One column: day_events.", code: `SELECT COUNT(*) AS day_events\nFROM events\nWHERE event_ts BETWEEN 1784592000 AND 1784678399;`, order: "exact" },
    ],
  },
  {
    id: "c14",
    difficulty: "Easy",
    company: "Walmart",
    title: "Margin extremes",
    scenario:
      "The pricing committee wants the honest edges of the catalog. Best margin rates first, worst rates second.",
    steps: [
      { prompt: "Top 3 products by margin rate 100.0*(price_cents-cost_cents)/price_cents, rounded to 1 decimal: product_id, name, margin_pct, ordered by margin_pct descending.", code: `SELECT product_id, name,\n       ROUND(100.0 * (price_cents - cost_cents) / price_cents, 1) AS margin_pct\nFROM products\nORDER BY margin_pct DESC\nLIMIT 3;`, order: "exact" },
      { prompt: "Bottom 3 by the same rate: product_id, name, margin_pct, ordered by margin_pct ascending.", code: `SELECT product_id, name,\n       ROUND(100.0 * (price_cents - cost_cents) / price_cents, 1) AS margin_pct\nFROM products\nORDER BY margin_pct ASC\nLIMIT 3;`, order: "exact" },
    ],
  },
  {
    id: "c15",
    difficulty: "Easy",
    company: "eBay",
    title: "Order 104 forensics",
    scenario:
      "A customer disputes order 104. Show the clerk the lines, then confirm the line count for the ticket.",
    steps: [
      { prompt: "List order 104's lines: order_item_id, product_id, quantity, unit_price_cents, ordered by order_item_id ascending.", code: `SELECT order_item_id, product_id, quantity, unit_price_cents\nFROM order_items\nWHERE order_id = 104\nORDER BY order_item_id ASC;`, order: "exact" },
      { prompt: "Count order 104's lines. One column: line_count.", code: `SELECT COUNT(*) AS line_count\nFROM order_items\nWHERE order_id = 104;`, order: "exact" },
    ],
  },
  {
    id: "c16",
    difficulty: "Easy",
    company: "Shopify",
    title: "VIP book",
    scenario:
      "The concierge team is staffing up. Who are the VIPs, and which cities do they cover?",
    steps: [
      { prompt: "List VIP customers: customer_id, name, city, ordered by customer_id ascending.", code: `SELECT customer_id, name, city\nFROM customers\nWHERE segment = 'vip'\nORDER BY customer_id ASC;`, order: "exact" },
      { prompt: "List the distinct cities of VIP customers alphabetically. Single column: city.", code: `SELECT DISTINCT city\nFROM customers\nWHERE segment = 'vip'\nORDER BY city ASC;`, order: "exact" },
    ],
  },
  {
    id: "c17",
    difficulty: "Easy",
    company: "Amazon",
    title: "First June week",
    scenario:
      "The June kickoff meeting reviews the opening week. Single-day pulse first, then the whole week.",
    steps: [
      { prompt: "Count orders on 2026-06-06 exactly. One column: day_orders.", code: `SELECT COUNT(*) AS day_orders\nFROM orders\nWHERE order_date = '2026-06-06';`, order: "exact" },
      { prompt: "Count orders between '2026-06-01' and '2026-06-07' inclusive. One column: week_orders.", code: `SELECT COUNT(*) AS week_orders\nFROM orders\nWHERE order_date BETWEEN '2026-06-01' AND '2026-06-07';`, order: "exact" },
    ],
  },
  {
    id: "c18",
    difficulty: "Easy",
    company: "Walmart",
    title: "Units by category",
    scenario:
      "Units tell the warehouse story the money hides. Sum them per category, then crown the volume leader.",
    steps: [
      { prompt: "Sum quantity per category across ALL order lines (any status). Output category and units, ordered by units descending.", code: `SELECT p.category, SUM(oi.quantity) AS units\nFROM order_items oi\nJOIN products p ON p.product_id = oi.product_id\nGROUP BY p.category\nORDER BY units DESC;`, order: "exact" },
      { prompt: "Return just the top row of that read: category and units of the highest-volume category. One row.", code: `SELECT p.category, SUM(oi.quantity) AS units\nFROM order_items oi\nJOIN products p ON p.product_id = oi.product_id\nGROUP BY p.category\nORDER BY units DESC\nLIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c19",
    difficulty: "Easy",
    company: "eBay",
    title: "Return ledger",
    scenario:
      "The returns desk files its weekly sheet. Reasons first, then the total.",
    steps: [
      { prompt: "Count returns per reason. Output reason and return_count, ordered by return_count descending, then reason ascending.", code: `SELECT reason, COUNT(*) AS return_count\nFROM returns\nGROUP BY reason\nORDER BY return_count DESC, reason ASC;`, order: "exact" },
      { prompt: "Count all returns. One column: total_returns.", code: `SELECT COUNT(*) AS total_returns\nFROM returns;`, order: "exact" },
    ],
  },
  {
    id: "c20",
    difficulty: "Easy",
    company: "Shopify",
    title: "Cart pressure",
    scenario:
      "Growth wants cart volume context before the checkout A/B read. Total carts, then the burst day's carts.",
    steps: [
      { prompt: "Count cart events across the whole events table. One column: total_carts.", code: `SELECT COUNT(*) AS total_carts\nFROM events\nWHERE event_type = 'cart';`, order: "exact" },
      { prompt: "Count cart events on 2026-07-21 (event_ts between 1784592000 and 1784678399). One column: burst_day_carts.", code: `SELECT COUNT(*) AS burst_day_carts\nFROM events\nWHERE event_type = 'cart' AND event_ts BETWEEN 1784592000 AND 1784678399;`, order: "exact" },
    ],
  },

  // -------------------------------------------------------------- Medium 20
  {
    id: "c21",
    difficulty: "Medium",
    company: "Amazon",
    title: "Spend ladder briefing",
    scenario:
      "The QBR deck opens with who the money is. Build the full ladder, then freeze the top five for the headline slide.",
    steps: [
      { prompt: "Delivered gross revenue per customer (SUM quantity * unit_price_cents over delivered lines). Output customer_id and gross_revenue, ordered by gross_revenue descending, then customer_id ascending.", code: `SELECT o.customer_id,\n       SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'delivered'\nGROUP BY o.customer_id\nORDER BY gross_revenue DESC, o.customer_id ASC;`, order: "exact" },
      { prompt: "Keep only the top five rows of that ladder. Output customer_id and gross_revenue, same ordering.", code: `SELECT o.customer_id,\n       SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'delivered'\nGROUP BY o.customer_id\nORDER BY gross_revenue DESC, o.customer_id ASC\nLIMIT 5;`, order: "exact" },
    ],
  },
  {
    id: "c22",
    difficulty: "Medium",
    company: "Shopify",
    title: "Trend memo",
    scenario:
      "Leadership asks for the monthly curve with context, not just levels. Build the monthlies, then attach each month's delta against the month before.",
    steps: [
      { prompt: "Delivered gross revenue per month (strftime('%Y-%m', order_date)). Output month and gross_revenue, ordered by month ascending.", code: `SELECT strftime('%Y-%m', o.order_date) AS month,\n       SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'delivered'\nGROUP BY month\nORDER BY month ASC;`, order: "exact" },
      { prompt: "Add the month-over-month change: gross_revenue minus the previous month's (LAG), first month NULL. Output month, gross_revenue and mom_delta, ordered by month ascending.", code: `WITH monthly AS (\n  SELECT strftime('%Y-%m', o.order_date) AS month,\n         SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status = 'delivered'\n  GROUP BY month\n)\nSELECT month, gross_revenue,\n       gross_revenue - LAG(gross_revenue) OVER (ORDER BY month) AS mom_delta\nFROM monthly\nORDER BY month ASC;`, order: "exact" },
    ],
  },
  {
    id: "c23",
    difficulty: "Medium",
    company: "Walmart",
    title: "Category mix read",
    scenario:
      "The category review needs absolute money AND relative weight. Gross per category, then each category's share of the delivered total.",
    steps: [
      { prompt: "Delivered gross per category. Output category and gross_revenue, ordered by gross_revenue descending.", code: `SELECT p.category,\n       SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue\nFROM order_items oi\nJOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'\nJOIN products p ON p.product_id = oi.product_id\nGROUP BY p.category\nORDER BY gross_revenue DESC;`, order: "exact" },
      { prompt: "Add share of total: 100.0 * category_gross / SUM(category_gross) OVER (), rounded to 1 decimal. Output category, gross_revenue and share_pct, ordered by gross_revenue descending.", code: `WITH cat AS (\n  SELECT p.category,\n         SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue\n  FROM order_items oi\n  JOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'\n  JOIN products p ON p.product_id = oi.product_id\n  GROUP BY p.category\n)\nSELECT category, gross_revenue,\n       ROUND(100.0 * gross_revenue / SUM(gross_revenue) OVER (), 1) AS share_pct\nFROM cat\nORDER BY gross_revenue DESC;`, order: "exact" },
    ],
  },
  {
    id: "c24",
    difficulty: "Medium",
    company: "eBay",
    title: "Regional reach",
    scenario:
      "Expansion wants to know where customers actually are versus where the money is. Reach per region first, then the money view.",
    steps: [
      { prompt: "Count DISTINCT customers with at least one delivered order, per region. Output region and active_customers, ordered by active_customers descending, then region ascending.", code: `SELECT c.region, COUNT(DISTINCT o.customer_id) AS active_customers\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id AND o.status = 'delivered'\nGROUP BY c.region\nORDER BY active_customers DESC, c.region ASC;`, order: "exact" },
      { prompt: "Delivered gross per region. Output region and gross_revenue, ordered by gross_revenue descending.", code: `SELECT c.region,\n       SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id AND o.status = 'delivered'\nJOIN order_items oi ON oi.order_id = o.order_id\nGROUP BY c.region\nORDER BY gross_revenue DESC;`, order: "exact" },
    ],
  },
  {
    id: "c25",
    difficulty: "Medium",
    company: "Amazon",
    title: "Basket depth study",
    scenario:
      "Merchandising wonders how deep real baskets run. Line counts per order, then the average depth.",
    steps: [
      { prompt: "Count lines per DELIVERED order. Output order_id and line_count, ordered by line_count descending, then order_id ascending.", code: `SELECT o.order_id, COUNT(*) AS line_count\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'delivered'\nGROUP BY o.order_id\nORDER BY line_count DESC, o.order_id ASC;`, order: "exact" },
      { prompt: "Average line count across delivered orders, rounded to 2 decimals. One column: avg_depth.", code: `SELECT ROUND(AVG(line_count), 2) AS avg_depth\nFROM (\n  SELECT o.order_id, COUNT(*) AS line_count\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status = 'delivered'\n  GROUP BY o.order_id\n);`, order: "exact" },
    ],
  },
  {
    id: "c26",
    difficulty: "Medium",
    company: "Shopify",
    title: "First-purchase timing",
    scenario:
      "Lifecycle wants the activation story. When did each customer first buy, and how long did they take after signup?",
    steps: [
      { prompt: "First delivered order date per customer. Output customer_id and first_order, ordered by first_order ascending, then customer_id ascending.", code: `SELECT o.customer_id, MIN(o.order_date) AS first_order\nFROM orders o\nWHERE o.status = 'delivered'\nGROUP BY o.customer_id\nORDER BY first_order ASC, o.customer_id ASC;`, order: "exact" },
      { prompt: "Days from signup to that first delivered order, CAST to INTEGER. Output customer_id and lag_days, ordered by lag_days descending, then customer_id ascending. Join customers for signup_date.", code: `SELECT c.customer_id,\n       CAST(julianday(MIN(o.order_date)) - julianday(c.signup_date) AS INTEGER) AS lag_days\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id AND o.status = 'delivered'\nGROUP BY c.customer_id\nORDER BY lag_days DESC, c.customer_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c27",
    difficulty: "Medium",
    company: "Walmart",
    title: "Snapshot drift audit",
    scenario:
      "Internal audit heard the catalog and the receipts disagree. Find the drifted lines, then price the disagreement.",
    steps: [
      { prompt: "Find order_items lines where unit_price_cents differs from the catalog price_cents: order_item_id, order_id, unit_price_cents, price_cents, ordered by order_item_id ascending.", code: `SELECT oi.order_item_id, oi.order_id, oi.unit_price_cents, p.price_cents\nFROM order_items oi\nJOIN products p ON p.product_id = oi.product_id\nWHERE oi.unit_price_cents <> p.price_cents\nORDER BY oi.order_item_id ASC;`, order: "exact" },
      { prompt: "Total cents of drift if every line had sold at catalog price: SUM(quantity * (price_cents - unit_price_cents)) over the drifted lines. One column: drift_value.", code: `SELECT SUM(oi.quantity * (p.price_cents - oi.unit_price_cents)) AS drift_value\nFROM order_items oi\nJOIN products p ON p.product_id = oi.product_id\nWHERE oi.unit_price_cents <> p.price_cents;`, order: "exact" },
    ],
  },
  {
    id: "c28",
    difficulty: "Medium",
    company: "eBay",
    title: "Cancellation forensics",
    scenario:
      "Cancelled baskets still tell you demand. Price them, then name who walked.",
    steps: [
      { prompt: "Total line value (SUM quantity * unit_price_cents) of CANCELLED orders. One column: cancelled_value.", code: `SELECT SUM(oi.quantity * oi.unit_price_cents) AS cancelled_value\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'cancelled';`, order: "exact" },
      { prompt: "List customers with at least one cancelled order: customer_id and cancelled_orders count, ordered by cancelled_orders descending, then customer_id ascending.", code: `SELECT o.customer_id, COUNT(*) AS cancelled_orders\nFROM orders o\nWHERE o.status = 'cancelled'\nGROUP BY o.customer_id\nORDER BY cancelled_orders DESC, o.customer_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c29",
    difficulty: "Medium",
    company: "Amazon",
    title: "Product reach",
    scenario:
      "Reach answers 'how many households touched this'. Count distinct buyers per product, then isolate the one-buyer products.",
    steps: [
      { prompt: "Distinct delivered buyers per product (top 5 by reach): product_id, buyer_count, ordered by buyer_count descending, then product_id ascending, LIMIT 5.", code: `SELECT oi.product_id, COUNT(DISTINCT o.customer_id) AS buyer_count\nFROM order_items oi\nJOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'\nGROUP BY oi.product_id\nORDER BY buyer_count DESC, oi.product_id ASC\nLIMIT 5;`, order: "exact" },
      { prompt: "Products with EXACTLY one distinct delivered buyer: product_id, name, ordered by product_id ascending. Join products for the name.", code: `SELECT p.product_id, p.name\nFROM order_items oi\nJOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'\nJOIN products p ON p.product_id = oi.product_id\nGROUP BY p.product_id\nHAVING COUNT(DISTINCT o.customer_id) = 1\nORDER BY p.product_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c30",
    difficulty: "Medium",
    company: "Shopify",
    title: "Repeat-rate snapshot",
    scenario:
      "The board card needs one number: how many buyers came back. List them, then count them.",
    steps: [
      { prompt: "Customers with at least 2 delivered orders: customer_id and delivered_orders, ordered by delivered_orders descending, then customer_id ascending.", code: `SELECT o.customer_id, COUNT(*) AS delivered_orders\nFROM orders o\nWHERE o.status = 'delivered'\nGROUP BY o.customer_id\nHAVING COUNT(*) >= 2\nORDER BY delivered_orders DESC, o.customer_id ASC;`, order: "exact" },
      { prompt: "Count those repeat buyers. One column: repeat_buyers.", code: `SELECT COUNT(*) AS repeat_buyers\nFROM (\n  SELECT o.customer_id\n  FROM orders o\n  WHERE o.status = 'delivered'\n  GROUP BY o.customer_id\n  HAVING COUNT(*) >= 2\n);`, order: "exact" },
    ],
  },
  {
    id: "c31",
    difficulty: "Medium",
    company: "Walmart",
    title: "Discount depth",
    scenario:
      "Promo ROI starts with who got what. Discounts per customer, then the average depth per discounted line.",
    steps: [
      { prompt: "Delivered discount totals per customer: customer_id and total_discount (SUM over non-null discounts), ordered by total_discount descending, then customer_id ascending.", code: `SELECT o.customer_id, SUM(oi.discount_cents) AS total_discount\nFROM order_items oi\nJOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'\nWHERE oi.discount_cents IS NOT NULL\nGROUP BY o.customer_id\nORDER BY total_discount DESC, o.customer_id ASC;`, order: "exact" },
      { prompt: "Average discount per discounted delivered line, rounded to 2 decimals. One column: avg_discount.", code: `SELECT ROUND(AVG(oi.discount_cents), 2) AS avg_discount\nFROM order_items oi\nJOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'\nWHERE oi.discount_cents IS NOT NULL;`, order: "exact" },
    ],
  },
  {
    id: "c32",
    difficulty: "Medium",
    company: "eBay",
    title: "Funnel pressure days",
    scenario:
      "Ops wants the days the funnel actually worked. Cart volume per day, then the high-pressure days.",
    steps: [
      { prompt: "Cart events per calendar day (strftime('%Y-%m-%d', event_ts, 'unixepoch')). Output day and carts, ordered by day ascending.", code: `SELECT strftime('%Y-%m-%d', event_ts, 'unixepoch') AS day,\n       SUM(CASE WHEN event_type = 'cart' THEN 1 ELSE 0 END) AS carts\nFROM events\nGROUP BY day\nORDER BY day ASC;`, order: "exact" },
      { prompt: "Keep only days with at least 4 cart events. Output day and carts, ordered by day ascending.", code: `SELECT strftime('%Y-%m-%d', event_ts, 'unixepoch') AS day,\n       SUM(CASE WHEN event_type = 'cart' THEN 1 ELSE 0 END) AS carts\nFROM events\nGROUP BY day\nHAVING carts >= 4\nORDER BY day ASC;`, order: "exact" },
    ],
  },
  {
    id: "c33",
    difficulty: "Medium",
    company: "Amazon",
    title: "City money map",
    scenario:
      "The expansion map colors cities by spend. Build the city ladder, then crown the top city.",
    steps: [
      { prompt: "Delivered gross per customer city: city and gross_revenue, ordered by gross_revenue descending, then city ascending.", code: `SELECT c.city,\n       SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id AND o.status = 'delivered'\nJOIN order_items oi ON oi.order_id = o.order_id\nGROUP BY c.city\nORDER BY gross_revenue DESC, c.city ASC;`, order: "exact" },
      { prompt: "Just the top city row. Output city and gross_revenue, one row.", code: `SELECT c.city,\n       SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id AND o.status = 'delivered'\nJOIN order_items oi ON oi.order_id = o.order_id\nGROUP BY c.city\nORDER BY gross_revenue DESC, c.city ASC\nLIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c34",
    difficulty: "Medium",
    company: "Shopify",
    title: "Gross vs net",
    scenario:
      "Pricing wants to see who discounts actually touch. Net per customer, then just the discounted ones.",
    steps: [
      { prompt: "NET delivered revenue per customer (COALESCE discounts): customer_id and net_revenue, ordered by net_revenue descending, then customer_id ascending.", code: `SELECT o.customer_id,\n       SUM(oi.quantity * oi.unit_price_cents - COALESCE(oi.discount_cents, 0)) AS net_revenue\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'delivered'\nGROUP BY o.customer_id\nORDER BY net_revenue DESC, o.customer_id ASC;`, order: "exact" },
      { prompt: "Customers whose net is STRICTLY below gross (they received a discount on a delivered line): customer_id and net_revenue, ordered by net_revenue descending, then customer_id ascending.", code: `SELECT o.customer_id,\n       SUM(oi.quantity * oi.unit_price_cents - COALESCE(oi.discount_cents, 0)) AS net_revenue\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'delivered'\nGROUP BY o.customer_id\nHAVING SUM(oi.discount_cents) > 0\nORDER BY net_revenue DESC, o.customer_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c35",
    difficulty: "Medium",
    company: "Walmart",
    title: "Price bands",
    scenario:
      "The merchandising grid buckets the catalog. Define the bands, then count the shelf per band.",
    steps: [
      { prompt: "Assign each product a price_band via CASE: 'budget' under 5000, 'mainstream' 5000-9999, 'premium' 10000-19999, 'flagship' 20000 and above. Output product_id, name and price_band, ordered by product_id ascending.", code: `SELECT product_id, name,\n       CASE\n         WHEN price_cents < 5000 THEN 'budget'\n         WHEN price_cents < 10000 THEN 'mainstream'\n         WHEN price_cents < 20000 THEN 'premium'\n         ELSE 'flagship'\n       END AS price_band\nFROM products\nORDER BY product_id ASC;`, order: "exact" },
      { prompt: "Count products per price_band. Output price_band and product_count, ordered by product_count descending, then price_band ascending.", code: `SELECT CASE\n         WHEN price_cents < 5000 THEN 'budget'\n         WHEN price_cents < 10000 THEN 'mainstream'\n         WHEN price_cents < 20000 THEN 'premium'\n         ELSE 'flagship'\n       END AS price_band,\n       COUNT(*) AS product_count\nFROM products\nGROUP BY price_band\nORDER BY product_count DESC, price_band ASC;`, order: "exact" },
    ],
  },
  {
    id: "c36",
    difficulty: "Medium",
    company: "eBay",
    title: "Return economics",
    scenario:
      "Returns cost money twice — the count and the value. Reasons by count, then reasons by value.",
    steps: [
      { prompt: "Return counts per reason. Output reason and return_count, ordered by return_count descending, then reason ascending.", code: `SELECT reason, COUNT(*) AS return_count\nFROM returns\nGROUP BY reason\nORDER BY return_count DESC, reason ASC;`, order: "exact" },
      { prompt: "Returned line value per reason (SUM quantity * unit_price_cents of returned lines): reason and returned_value, ordered by returned_value descending.", code: `SELECT r.reason,\n       SUM(oi.quantity * oi.unit_price_cents) AS returned_value\nFROM returns r\nJOIN order_items oi ON oi.order_item_id = r.order_item_id\nGROUP BY r.reason\nORDER BY returned_value DESC;`, order: "exact" },
    ],
  },
  {
    id: "c37",
    difficulty: "Medium",
    company: "Amazon",
    title: "Traffic by hour",
    scenario:
      "Infra scheduling needs the load curve. Events per hour, then the single hottest hour.",
    steps: [
      { prompt: "Event counts per hour of day: CAST(strftime('%H', event_ts, 'unixepoch') AS INTEGER). Output hour and events, ordered by events descending, then hour ascending.", code: `SELECT CAST(strftime('%H', event_ts, 'unixepoch') AS INTEGER) AS hour,\n       COUNT(*) AS events\nFROM events\nGROUP BY hour\nORDER BY events DESC, hour ASC;`, order: "exact" },
      { prompt: "Only the busiest hour (top row of that read). Output hour and events, one row.", code: `SELECT CAST(strftime('%H', event_ts, 'unixepoch') AS INTEGER) AS hour,\n       COUNT(*) AS events\nFROM events\nGROUP BY hour\nORDER BY events DESC, hour ASC\nLIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c38",
    difficulty: "Medium",
    company: "Shopify",
    title: "Customer lifetime",
    scenario:
      "Tenure analytics: how long does a buying relationship stretch? First-to-last span per customer, then the record holder.",
    steps: [
      { prompt: "Days between each customer's first and last DELIVERED order: CAST(julianday(MAX) - julianday(MIN) AS INTEGER). Output customer_id and lifetime_days, ordered by lifetime_days descending, then customer_id ascending.", code: `SELECT o.customer_id,\n       CAST(julianday(MAX(o.order_date)) - julianday(MIN(o.order_date)) AS INTEGER) AS lifetime_days\nFROM orders o\nWHERE o.status = 'delivered'\nGROUP BY o.customer_id\nORDER BY lifetime_days DESC, o.customer_id ASC;`, order: "exact" },
      { prompt: "Just the top row: the customer with the longest delivered lifetime. Output customer_id and lifetime_days, one row.", code: `SELECT o.customer_id,\n       CAST(julianday(MAX(o.order_date)) - julianday(MIN(o.order_date)) AS INTEGER) AS lifetime_days\nFROM orders o\nWHERE o.status = 'delivered'\nGROUP BY o.customer_id\nORDER BY lifetime_days DESC, o.customer_id ASC\nLIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c39",
    difficulty: "Medium",
    company: "Walmart",
    title: "Units by status",
    scenario:
      "How many physical units moved, by pipeline stage? Units per status, then the delivered share.",
    steps: [
      { prompt: "Sum quantity per order status across lines. Output status and units, ordered by units descending.", code: `SELECT o.status, SUM(oi.quantity) AS units\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nGROUP BY o.status\nORDER BY units DESC;`, order: "exact" },
      { prompt: "Delivered units as a share of all units: 100.0 * delivered_units / total_units, rounded to 1 decimal. One column: delivered_share_pct.", code: `SELECT ROUND(\n  100.0 * SUM(CASE WHEN o.status = 'delivered' THEN oi.quantity ELSE 0 END)\n  / SUM(oi.quantity), 1) AS delivered_share_pct\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id;`, order: "exact" },
    ],
  },
  {
    id: "c40",
    difficulty: "Medium",
    company: "eBay",
    title: "Multi-line baskets",
    scenario:
      "Single-line baskets are the walk-away pattern. Split the delivered fleet into multi-line vs single-line.",
    steps: [
      { prompt: "Delivered orders with 2 or more lines: order_id and line_count, ordered by line_count descending, then order_id ascending.", code: `SELECT o.order_id, COUNT(*) AS line_count\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'delivered'\nGROUP BY o.order_id\nHAVING COUNT(*) >= 2\nORDER BY line_count DESC, o.order_id ASC;`, order: "exact" },
      { prompt: "Count delivered orders with exactly ONE line. One column: single_line_orders.", code: `SELECT COUNT(*) AS single_line_orders\nFROM (\n  SELECT o.order_id\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status = 'delivered'\n  GROUP BY o.order_id\n  HAVING COUNT(*) = 1\n);`, order: "exact" },
    ],
  },

  // ---------------------------------------------------------------- Hard 20
  {
    id: "c41",
    difficulty: "Hard",
    company: "Northwind Goods",
    title: "The RFM build",
    scenario:
      "Northwind's CRM migration needs the RFM table rebuilt from raw orders, anchored to the review date 2026-09-01. Raw axes first, then quintile scores on top.",
    steps: [
      { prompt: "Raw RFM per customer over DELIVERED orders: recency = CAST(julianday('2026-09-01') - julianday(MAX(order_date)) AS INTEGER), frequency = delivered order count, monetary = delivered gross. Output customer_id, recency, frequency, monetary, ordered by monetary descending, then customer_id ascending.", code: `SELECT o.customer_id,\n       CAST(julianday('2026-09-01') - julianday(MAX(o.order_date)) AS INTEGER) AS recency,\n       COUNT(DISTINCT o.order_id) AS frequency,\n       SUM(oi.quantity * oi.unit_price_cents) AS monetary\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'delivered'\nGROUP BY o.customer_id\nORDER BY monetary DESC, o.customer_id ASC;`, order: "exact" },
      { prompt: "Score the axes with NTILE(5) over the customers: recency_score ordered by recency ASC, frequency_score by frequency DESC, monetary_score by monetary DESC. Output customer_id, recency_score, frequency_score, monetary_score, ordered by monetary_score descending, frequency_score descending, customer_id ascending.", code: `WITH rfm AS (\n  SELECT o.customer_id,\n         CAST(julianday('2026-09-01') - julianday(MAX(o.order_date)) AS INTEGER) AS recency,\n         COUNT(DISTINCT o.order_id) AS frequency,\n         SUM(oi.quantity * oi.unit_price_cents) AS monetary\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status = 'delivered'\n  GROUP BY o.customer_id\n)\nSELECT customer_id,\n       NTILE(5) OVER (ORDER BY recency ASC) AS recency_score,\n       NTILE(5) OVER (ORDER BY frequency DESC) AS frequency_score,\n       NTILE(5) OVER (ORDER BY monetary DESC) AS monetary_score\nFROM rfm\nORDER BY monetary_score DESC, frequency_score DESC, customer_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c42",
    difficulty: "Hard",
    company: "Kartly",
    title: "Session forensics",
    scenario:
      "Kartly's growth review needs real session math on the four tracked days. Stamp sessions with the 1800-second rule, then measure how deep the average session runs.",
    steps: [
      { prompt: "Sessions per customer with the 1800-second gap rule (new session when the gap to the previous event exceeds 1800 seconds). Output customer_id and sessions, ordered by sessions descending, then customer_id ascending.", code: `WITH seq AS (\n  SELECT customer_id, event_ts,\n         LAG(event_ts) OVER (PARTITION BY customer_id ORDER BY event_ts) AS prev_ts\n  FROM events\n),\nstamped AS (\n  SELECT customer_id, event_ts,\n         SUM(CASE WHEN prev_ts IS NULL OR event_ts - prev_ts > 1800\n                  THEN 1 ELSE 0 END) OVER (\n           PARTITION BY customer_id ORDER BY event_ts\n           ROWS UNBOUNDED PRECEDING) AS session_id\n  FROM seq\n)\nSELECT customer_id, COUNT(DISTINCT session_id) AS sessions\nFROM stamped\nGROUP BY customer_id\nORDER BY sessions DESC, customer_id ASC;`, order: "exact" },
      { prompt: "Average events per session across the whole events table, rounded to 2 decimals. One column: avg_events_per_session.", code: `WITH seq AS (\n  SELECT customer_id, event_ts,\n         LAG(event_ts) OVER (PARTITION BY customer_id ORDER BY event_ts) AS prev_ts\n  FROM events\n),\nstamped AS (\n  SELECT customer_id, event_ts,\n         SUM(CASE WHEN prev_ts IS NULL OR event_ts - prev_ts > 1800\n                  THEN 1 ELSE 0 END) OVER (\n           PARTITION BY customer_id ORDER BY event_ts\n           ROWS UNBOUNDED PRECEDING) AS session_id\n  FROM seq\n)\nSELECT ROUND(1.0 * COUNT(*) / COUNT(DISTINCT customer_id || ':' || session_id), 2) AS avg_events_per_session\nFROM stamped;`, order: "exact" },
    ],
  },
  {
    id: "c43",
    difficulty: "Hard",
    company: "Amazon",
    title: "Pareto stack",
    scenario:
      "The classic 80/20 question, priced: how concentrated is the revenue? Share per customer, then the cumulative share down the ladder.",
    steps: [
      { prompt: "Delivered gross per customer with its share of the total: 100.0 * gross / SUM(gross) OVER (), rounded to 2 decimals. Output customer_id, gross_revenue and share_pct, ordered by gross_revenue descending, then customer_id ascending.", code: `WITH spend AS (\n  SELECT o.customer_id,\n         SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status = 'delivered'\n  GROUP BY o.customer_id\n)\nSELECT customer_id, gross_revenue,\n       ROUND(100.0 * gross_revenue / SUM(gross_revenue) OVER (), 2) AS share_pct\nFROM spend\nORDER BY gross_revenue DESC, customer_id ASC;`, order: "exact" },
      { prompt: "Add the running share down the same ladder: SUM(share) OVER (ORDER BY gross_revenue DESC, customer_id ROWS UNBOUNDED PRECEDING), rounded to 2 decimals. Output customer_id, gross_revenue and cum_share_pct, ordered by gross_revenue descending, then customer_id ascending.", code: `WITH spend AS (\n  SELECT o.customer_id,\n         SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status = 'delivered'\n  GROUP BY o.customer_id\n),\nshared AS (\n  SELECT customer_id, gross_revenue,\n         100.0 * gross_revenue / SUM(gross_revenue) OVER () AS share_pct\n  FROM spend\n)\nSELECT customer_id, gross_revenue,\n       ROUND(SUM(share_pct) OVER (ORDER BY gross_revenue DESC, customer_id\n             ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS cum_share_pct\nFROM shared\nORDER BY gross_revenue DESC, customer_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c44",
    difficulty: "Hard",
    company: "Shopify",
    title: "Cohort grid",
    scenario:
      "Retention reviews live on cohort grids. Size the signup cohorts, then cross each cohort against the month of first purchase.",
    steps: [
      { prompt: "Customer counts per signup cohort (strftime('%Y-%m', signup_date)). Output cohort_month and customers, ordered by cohort_month ascending.", code: `SELECT strftime('%Y-%m', signup_date) AS cohort_month, COUNT(*) AS customers\nFROM customers\nGROUP BY cohort_month\nORDER BY cohort_month ASC;`, order: "exact" },
      { prompt: "Per signup cohort, split customers by the MONTH of their first delivered order: same month as signup vs a later month (or no orders at all — count them as later_or_never via LEFT JOIN logic). Output cohort_month, same_month and later_or_never, ordered by cohort_month ascending.", code: `WITH signed AS (\n  SELECT customer_id, strftime('%Y-%m', signup_date) AS cohort_month\n  FROM customers\n),\nfirsts AS (\n  SELECT o.customer_id, MIN(o.order_date) AS first_order\n  FROM orders o\n  WHERE o.status = 'delivered'\n  GROUP BY o.customer_id\n),\njoined AS (\n  SELECT s.cohort_month, f.first_order\n  FROM signed s LEFT JOIN firsts f ON f.customer_id = s.customer_id\n)\nSELECT cohort_month,\n       SUM(CASE WHEN first_order IS NOT NULL\n                 AND strftime('%Y-%m', first_order) = cohort_month THEN 1 ELSE 0 END) AS same_month,\n       SUM(CASE WHEN first_order IS NULL\n                 OR strftime('%Y-%m', first_order) <> cohort_month THEN 1 ELSE 0 END) AS later_or_never\nFROM joined\nGROUP BY cohort_month\nORDER BY cohort_month ASC;`, order: "exact" },
    ],
  },
  {
    id: "c45",
    difficulty: "Hard",
    company: "Walmart",
    title: "Category podiums",
    scenario:
      "Every category lead wants their top two on one page. Rank products inside each category, then cut to the podium rows.",
    steps: [
      { prompt: "Rank products by delivered gross INSIDE each category with RANK() OVER (PARTITION BY category ORDER BY gross DESC, product_id). Output category, product_id, gross_revenue and rank, ordered by category ascending, rank ascending.", code: `WITH prod AS (\n  SELECT p.category, p.product_id,\n         SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue\n  FROM order_items oi\n  JOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'\n  JOIN products p ON p.product_id = oi.product_id\n  GROUP BY p.category, p.product_id\n)\nSELECT category, product_id, gross_revenue,\n       RANK() OVER (PARTITION BY category ORDER BY gross_revenue DESC, product_id ASC) AS rank\nFROM prod\nORDER BY category ASC, rank ASC;`, order: "exact" },
      { prompt: "Keep only rank <= 2. Output category, product_id, gross_revenue, ordered by category ascending, gross_revenue descending, product_id ascending.", code: `WITH prod AS (\n  SELECT p.category, p.product_id,\n         SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue\n  FROM order_items oi\n  JOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'\n  JOIN products p ON p.product_id = oi.product_id\n  GROUP BY p.category, p.product_id\n),\nranked AS (\n  SELECT category, product_id, gross_revenue,\n         RANK() OVER (PARTITION BY category ORDER BY gross_revenue DESC, product_id ASC) AS rank\n  FROM prod\n)\nSELECT category, product_id, gross_revenue\nFROM ranked\nWHERE rank <= 2\nORDER BY category ASC, gross_revenue DESC, product_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c46",
    difficulty: "Hard",
    company: "eBay",
    title: "Return-abuse case build",
    scenario:
      "Risk needs a defensible shortlist, not a hunch. Count returns against delivered lines per customer, then apply the two-part rule.",
    steps: [
      { prompt: "Per customer: returns count (from returns → order_items → orders) and delivered line count. Output customer_id, returns, delivered_lines, ordered by returns descending, then customer_id ascending. Only customers with at least one return appear.", code: `WITH lines AS (\n  SELECT o.customer_id, COUNT(*) AS delivered_lines\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status = 'delivered'\n  GROUP BY o.customer_id\n),\nrets AS (\n  SELECT o.customer_id, COUNT(*) AS returns\n  FROM returns r\n  JOIN order_items oi ON oi.order_item_id = r.order_item_id\n  JOIN orders o ON o.order_id = oi.order_id\n  GROUP BY o.customer_id\n)\nSELECT rets.customer_id, rets.returns, lines.delivered_lines\nFROM rets\nJOIN lines ON lines.customer_id = rets.customer_id\nORDER BY rets.returns DESC, rets.customer_id ASC;`, order: "exact" },
      { prompt: "Apply the rule: keep customers with returns >= 3 AND return_rate (returns*1.0/delivered_lines, rounded to 2) > 0.25. Output customer_id, returns, delivered_lines, return_rate, ordered by returns descending, then customer_id ascending.", code: `WITH lines AS (\n  SELECT o.customer_id, COUNT(*) AS delivered_lines\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status = 'delivered'\n  GROUP BY o.customer_id\n),\nrets AS (\n  SELECT o.customer_id, COUNT(*) AS returns\n  FROM returns r\n  JOIN order_items oi ON oi.order_item_id = r.order_item_id\n  JOIN orders o ON o.order_id = oi.order_id\n  GROUP BY o.customer_id\n)\nSELECT rets.customer_id, rets.returns, lines.delivered_lines,\n       ROUND(rets.returns * 1.0 / lines.delivered_lines, 2) AS return_rate\nFROM rets\nJOIN lines ON lines.customer_id = rets.customer_id\nWHERE rets.returns >= 3 AND rets.returns * 1.0 / lines.delivered_lines > 0.25\nORDER BY rets.returns DESC, rets.customer_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c47",
    difficulty: "Hard",
    company: "Northwind Goods",
    title: "Margin: snapshot vs catalog",
    scenario:
      "Two margin truths exist in this data — what customers paid, and what today's catalog says. Compute both per category, then price the gap.",
    steps: [
      { prompt: "Line margin per category using the SNAPSHOT price: SUM(quantity * (unit_price_cents - cost_cents)) over delivered lines. Output category and line_margin, ordered by line_margin descending.", code: `SELECT p.category,\n       SUM(oi.quantity * (oi.unit_price_cents - p.cost_cents)) AS line_margin\nFROM order_items oi\nJOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'\nJOIN products p ON p.product_id = oi.product_id\nGROUP BY p.category\nORDER BY line_margin DESC;`, order: "exact" },
      { prompt: "The catalog-price version: SUM(quantity * (price_cents - cost_cents)) over the same delivered lines. Output category and catalog_margin, ordered by catalog_margin descending.", code: `SELECT p.category,\n       SUM(oi.quantity * (p.price_cents - p.cost_cents)) AS catalog_margin\nFROM order_items oi\nJOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'\nJOIN products p ON p.product_id = oi.product_id\nGROUP BY p.category\nORDER BY catalog_margin DESC;`, order: "exact" },
    ],
  },
  {
    id: "c48",
    difficulty: "Hard",
    company: "Kartly",
    title: "Burst census",
    scenario:
      "Kartly's anti-abuse pass looks for same-type event chains. Measure the gaps, then name the chains that meet the bar.",
    steps: [
      { prompt: "Per (customer, event_type), count the GAPS of 300 seconds or less between consecutive same-type events (LAG over a (customer_id, event_type) partition ordered by event_ts; the first event of each type has no gap). Output customer_id, event_type and chained_gaps, ordered by chained_gaps descending, customer_id ascending, event_type ascending.", code: `WITH gaps AS (\n  SELECT customer_id, event_type, event_ts,\n         event_ts - LAG(event_ts) OVER (\n           PARTITION BY customer_id, event_type ORDER BY event_ts) AS gap\n  FROM events\n)\nSELECT customer_id, event_type, COUNT(*) AS chained_gaps\nFROM gaps\nWHERE gap IS NOT NULL AND gap <= 300\nGROUP BY customer_id, event_type\nORDER BY chained_gaps DESC, customer_id ASC, event_type ASC;`, order: "exact" },
      { prompt: "Keep only pairs with at least 3 chained gaps. Output customer_id, event_type and chained_gaps, same ordering.", code: `WITH gaps AS (\n  SELECT customer_id, event_type, event_ts,\n         event_ts - LAG(event_ts) OVER (\n           PARTITION BY customer_id, event_type ORDER BY event_ts) AS gap\n  FROM events\n)\nSELECT customer_id, event_type, COUNT(*) AS chained_gaps\nFROM gaps\nWHERE gap IS NOT NULL AND gap <= 300\nGROUP BY customer_id, event_type\nHAVING COUNT(*) >= 3\nORDER BY chained_gaps DESC, customer_id ASC, event_type ASC;`, order: "exact" },
    ],
  },
  {
    id: "c49",
    difficulty: "Hard",
    company: "Amazon",
    title: "Silence watchlist",
    scenario:
      "Win-back email targets the quiet gaps, not the quiet people — a customer silent for 100 days after years of activity is the lead. Measure every inter-order gap, then keep the alarming ones.",
    steps: [
      { prompt: "Every inter-order gap per customer over DELIVERED orders: LAG(order_date) partitioned by customer ordered by date; gap_days = CAST(julianday(order_date) - julianday(prev) AS INTEGER); first orders drop (NULL prev). Output customer_id, order_date, gap_days, ordered by gap_days descending, customer_id ascending, order_date ascending.", code: `WITH seq AS (\n  SELECT o.customer_id, o.order_date,\n         LAG(o.order_date) OVER (PARTITION BY o.customer_id ORDER BY o.order_date) AS prev_date\n  FROM orders o\n  WHERE o.status = 'delivered'\n)\nSELECT customer_id, order_date,\n       CAST(julianday(order_date) - julianday(prev_date) AS INTEGER) AS gap_days\nFROM seq\nWHERE prev_date IS NOT NULL\nORDER BY gap_days DESC, customer_id ASC, order_date ASC;`, order: "exact" },
      { prompt: "Keep only gaps over 30 days. Output customer_id, order_date, gap_days, same ordering.", code: `WITH seq AS (\n  SELECT o.customer_id, o.order_date,\n         LAG(o.order_date) OVER (PARTITION BY o.customer_id ORDER BY o.order_date) AS prev_date\n  FROM orders o\n  WHERE o.status = 'delivered'\n)\nSELECT customer_id, order_date,\n       CAST(julianday(order_date) - julianday(prev_date) AS INTEGER) AS gap_days\nFROM seq\nWHERE prev_date IS NOT NULL\n  AND julianday(order_date) - julianday(prev_date) > 30\nORDER BY gap_days DESC, customer_id ASC, order_date ASC;`, order: "exact" },
    ],
  },
  {
    id: "c50",
    difficulty: "Hard",
    company: "Shopify",
    title: "Dense ladder with ties",
    scenario:
      "The pricing board reads ranks off a shared dashboard, so ties must be honest. Net spend per customer, then DENSE_RANK so the mirror tie does not skip.",
    steps: [
      { prompt: "NET delivered spend per customer (COALESCE discounts): customer_id and net_spend, ordered by net_spend descending, then customer_id ascending.", code: `SELECT o.customer_id,\n       SUM(oi.quantity * oi.unit_price_cents - COALESCE(oi.discount_cents, 0)) AS net_spend\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'delivered'\nGROUP BY o.customer_id\nORDER BY net_spend DESC, o.customer_id ASC;`, order: "exact" },
      { prompt: "Rank with DENSE_RANK() OVER (ORDER BY net_spend DESC). Output dense_rank, customer_id, net_spend, ordered by dense_rank ascending, then customer_id ascending.", code: `WITH net AS (\n  SELECT o.customer_id,\n         SUM(oi.quantity * oi.unit_price_cents - COALESCE(oi.discount_cents, 0)) AS net_spend\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status = 'delivered'\n  GROUP BY o.customer_id\n)\nSELECT DENSE_RANK() OVER (ORDER BY net_spend DESC) AS dense_rank,\n       customer_id, net_spend\nFROM net\nORDER BY dense_rank ASC, customer_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c51",
    difficulty: "Hard",
    company: "Walmart",
    title: "Smoothing the series",
    scenario:
      "The daily revenue series is spiky; the exec deck wants the 3-day shape. Build the series, then overlay the moving average.",
    steps: [
      { prompt: "Delivered gross per calendar day. Output order_date and day_gross, ordered by order_date ascending.", code: `SELECT o.order_date,\n       SUM(oi.quantity * oi.unit_price_cents) AS day_gross\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'delivered'\nGROUP BY o.order_date\nORDER BY o.order_date ASC;`, order: "exact" },
      { prompt: "Add ma3: AVG(day_gross) over ROWS BETWEEN 2 PRECEDING AND CURRENT ROW, rounded to 2 decimals. Output order_date, day_gross, ma3, ordered by order_date ascending.", code: `WITH daily AS (\n  SELECT o.order_date,\n         SUM(oi.quantity * oi.unit_price_cents) AS day_gross\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status = 'delivered'\n  GROUP BY o.order_date\n)\nSELECT order_date, day_gross,\n       ROUND(AVG(day_gross) OVER (ORDER BY order_date\n             ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS ma3\nFROM daily\nORDER BY order_date ASC;`, order: "exact" },
    ],
  },
  {
    id: "c52",
    difficulty: "Hard",
    company: "eBay",
    title: "Weekly pulse",
    scenario:
      "Ops tracks the delivery pipeline in weeks. Count delivered orders per week, then compute the week-over-week change.",
    steps: [
      { prompt: "Delivered order counts per week (strftime('%Y-W%W', order_date)). Output week and orders, ordered by week ascending.", code: `SELECT strftime('%Y-W%W', order_date) AS week, COUNT(*) AS orders\nFROM orders\nWHERE status = 'delivered'\nGROUP BY week\nORDER BY week ASC;`, order: "exact" },
      { prompt: "Add wow_delta: orders minus LAG(orders) over the week order, first week NULL. Output week, orders, wow_delta, ordered by week ascending.", code: `WITH weekly AS (\n  SELECT strftime('%Y-W%W', order_date) AS week, COUNT(*) AS orders\n  FROM orders\n  WHERE status = 'delivered'\n  GROUP BY week\n)\nSELECT week, orders,\n       orders - LAG(orders) OVER (ORDER BY week) AS wow_delta\nFROM weekly\nORDER BY week ASC;`, order: "exact" },
    ],
  },
  {
    id: "c53",
    difficulty: "Hard",
    company: "Amazon",
    title: "Same-day funnel completion",
    scenario:
      "A same-day view→cart→checkout is the strongest intent signal in the funnel. Count every step per customer-day, then isolate the completions.",
    steps: [
      { prompt: "Per (customer, calendar day via strftime('%Y-%m-%d', event_ts, 'unixepoch')): views, carts and checkouts. Output customer_id, day, views, carts, checkouts, ordered by day ascending, then customer_id ascending.", code: `SELECT customer_id,\n       strftime('%Y-%m-%d', event_ts, 'unixepoch') AS day,\n       SUM(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END) AS views,\n       SUM(CASE WHEN event_type = 'cart' THEN 1 ELSE 0 END) AS carts,\n       SUM(CASE WHEN event_type = 'checkout' THEN 1 ELSE 0 END) AS checkouts\nFROM events\nGROUP BY customer_id, day\nORDER BY day ASC, customer_id ASC;`, order: "exact" },
      { prompt: "Keep only rows where views >= 1 AND carts >= 1 AND checkouts >= 1. Output customer_id, day, views, carts, checkouts, same ordering.", code: `SELECT customer_id,\n       strftime('%Y-%m-%d', event_ts, 'unixepoch') AS day,\n       SUM(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END) AS views,\n       SUM(CASE WHEN event_type = 'cart' THEN 1 ELSE 0 END) AS carts,\n       SUM(CASE WHEN event_type = 'checkout' THEN 1 ELSE 0 END) AS checkouts\nFROM events\nGROUP BY customer_id, day\nHAVING views >= 1 AND carts >= 1 AND checkouts >= 1\nORDER BY day ASC, customer_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c54",
    difficulty: "Hard",
    company: "Northwind Goods",
    title: "VIP blind spots",
    scenario:
      "Assortment for the VIP program needs the reach map first. Which products have VIPs actually touched, and which have they never touched on a delivered order?",
    steps: [
      { prompt: "Products bought by at least one VIP on a delivered order: product_id and buyer count (DISTINCT vip customers), ordered by buyer count descending, then product_id ascending.", code: `SELECT p.product_id, COUNT(DISTINCT o.customer_id) AS vip_buyers\nFROM order_items oi\nJOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'\nJOIN customers c ON c.customer_id = o.customer_id\nJOIN products p ON p.product_id = oi.product_id\nWHERE c.segment = 'vip'\nGROUP BY p.product_id\nORDER BY vip_buyers DESC, p.product_id ASC;`, order: "exact" },
      { prompt: "Products with NO delivered VIP purchase: product_id, name, category, ordered by product_id ascending (NOT EXISTS against the vip join).", code: `SELECT p.product_id, p.name, p.category\nFROM products p\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM order_items oi\n  JOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'\n  JOIN customers c ON c.customer_id = o.customer_id\n  WHERE oi.product_id = p.product_id AND c.segment = 'vip'\n)\nORDER BY p.product_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c55",
    difficulty: "Hard",
    company: "Kartly",
    title: "Hour × step matrix",
    scenario:
      "The redesign targets the hour where the funnel thins. Cross hours with event types, then read the checkout hour profile.",
    steps: [
      { prompt: "Event counts per (hour of day, event_type): CAST(strftime('%H', event_ts, 'unixepoch') AS INTEGER). Output hour, event_type and events, ordered by hour ascending, then event_type ascending.", code: `SELECT CAST(strftime('%H', event_ts, 'unixepoch') AS INTEGER) AS hour,\n       event_type, COUNT(*) AS events\nFROM events\nGROUP BY hour, event_type\nORDER BY hour ASC, event_type ASC;`, order: "exact" },
      { prompt: "Checkout events per hour: hour and checkouts, ordered by checkouts descending, then hour ascending.", code: `SELECT CAST(strftime('%H', event_ts, 'unixepoch') AS INTEGER) AS hour,\n       COUNT(*) AS checkouts\nFROM events\nWHERE event_type = 'checkout'\nGROUP BY hour\nORDER BY checkouts DESC, hour ASC;`, order: "exact" },
    ],
  },
  {
    id: "c56",
    difficulty: "Hard",
    company: "Shopify",
    title: "Discount efficiency",
    scenario:
      "Promo postmortem: which customers' discounts actually moved money, and who was barely touched? Compute the net-to-gross ratio, then isolate the discounted cohort.",
    steps: [
      { prompt: "Per customer over delivered lines: gross_revenue, net_revenue (COALESCE discounts) and ratio = ROUND(100.0 * net / gross, 2). Output customer_id, gross_revenue, net_revenue, ratio_pct, ordered by ratio_pct ascending, then customer_id ascending.", code: `SELECT o.customer_id,\n       SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue,\n       SUM(oi.quantity * oi.unit_price_cents - COALESCE(oi.discount_cents, 0)) AS net_revenue,\n       ROUND(100.0 * SUM(oi.quantity * oi.unit_price_cents - COALESCE(oi.discount_cents, 0))\n             / SUM(oi.quantity * oi.unit_price_cents), 2) AS ratio_pct\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'delivered'\nGROUP BY o.customer_id\nORDER BY ratio_pct ASC, o.customer_id ASC;`, order: "exact" },
      { prompt: "Keep only customers whose ratio is strictly below 100 (they gave or received discounts): customer_id and ratio_pct, ordered by ratio_pct ascending, then customer_id ascending.", code: `SELECT o.customer_id,\n       ROUND(100.0 * SUM(oi.quantity * oi.unit_price_cents - COALESCE(oi.discount_cents, 0))\n             / SUM(oi.quantity * oi.unit_price_cents), 2) AS ratio_pct\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'delivered'\nGROUP BY o.customer_id\nHAVING SUM(COALESCE(oi.discount_cents, 0)) > 0\nORDER BY ratio_pct ASC, o.customer_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c57",
    difficulty: "Hard",
    company: "Walmart",
    title: "Velocity and share",
    scenario:
      "The replenishment meeting wants units AND money context per product. Units per product, then each product's gross share of its category.",
    steps: [
      { prompt: "Delivered units per product: product_id and units, ordered by units descending, then product_id ascending.", code: `SELECT oi.product_id, SUM(oi.quantity) AS units\nFROM order_items oi\nJOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'\nGROUP BY oi.product_id\nORDER BY units DESC, oi.product_id ASC;`, order: "exact" },
      { prompt: "Per product: gross and its share of the CATEGORY's delivered gross (window SUM partitioned by category), rounded to 1 decimal. Output product_id, category, gross_revenue, share_pct, ordered by category ascending, gross_revenue descending.", code: `WITH prod AS (\n  SELECT p.product_id, p.category,\n         SUM(oi.quantity * oi.unit_price_cents) AS gross_revenue\n  FROM order_items oi\n  JOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'\n  JOIN products p ON p.product_id = oi.product_id\n  GROUP BY p.product_id\n)\nSELECT product_id, category, gross_revenue,\n       ROUND(100.0 * gross_revenue\n             / SUM(gross_revenue) OVER (PARTITION BY category), 1) AS share_pct\nFROM prod\nORDER BY category ASC, gross_revenue DESC;`, order: "exact" },
    ],
  },
  {
    id: "c58",
    difficulty: "Hard",
    company: "eBay",
    title: "Tied-day register",
    scenario:
      "Finance spotted duplicated daily totals and wants the register. Find every delivered day-gross that occurs more than once, then concatenate the dates for each.",
    steps: [
      { prompt: "Day-gross values occurring on more than one delivered date: tied_gross and the number of dates, ordered by tied_gross descending.", code: `WITH daily AS (\n  SELECT o.order_date,\n         SUM(oi.quantity * oi.unit_price_cents) AS day_gross\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status = 'delivered'\n  GROUP BY o.order_date\n)\nSELECT day_gross AS tied_gross, COUNT(*) AS day_count\nFROM daily\nGROUP BY day_gross\nHAVING COUNT(*) > 1\nORDER BY tied_gross DESC;`, order: "exact" },
      { prompt: "Same read but with the dates concatenated in date order via GROUP_CONCAT(order_date, ','). Output tied_gross and dates, ordered by tied_gross descending.", code: `WITH daily AS (\n  SELECT o.order_date,\n         SUM(oi.quantity * oi.unit_price_cents) AS day_gross\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status = 'delivered'\n  GROUP BY o.order_date\n)\nSELECT day_gross AS tied_gross, GROUP_CONCAT(order_date, ',') AS dates\nFROM daily\nGROUP BY day_gross\nHAVING COUNT(*) > 1\nORDER BY tied_gross DESC;`, order: "exact" },
    ],
  },
  {
    id: "c59",
    difficulty: "Hard",
    company: "Northwind Goods",
    title: "Basket value distribution",
    scenario:
      "Merchandising segments orders by ticket size against the storewide average. Price every delivered basket, then flag the above-average ones.",
    steps: [
      { prompt: "Delivered gross per order: order_id and order_gross, ordered by order_gross descending, then order_id ascending.", code: `SELECT o.order_id,\n       SUM(oi.quantity * oi.unit_price_cents) AS order_gross\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'delivered'\nGROUP BY o.order_id\nORDER BY order_gross DESC, o.order_id ASC;`, order: "exact" },
      { prompt: "Orders whose gross is strictly above the storewide AVERAGE order gross (a scalar subquery over the same delivered population): order_id and order_gross, ordered by order_gross descending, then order_id ascending.", code: `SELECT o.order_id,\n       SUM(oi.quantity * oi.unit_price_cents) AS order_gross\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'delivered'\nGROUP BY o.order_id\nHAVING SUM(oi.quantity * oi.unit_price_cents) > (\n  SELECT SUM(oi2.quantity * oi2.unit_price_cents) * 1.0 / COUNT(DISTINCT o2.order_id)\n  FROM orders o2\n  JOIN order_items oi2 ON oi2.order_id = o2.order_id\n  WHERE o2.status = 'delivered'\n)\nORDER BY order_gross DESC, o.order_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c60",
    difficulty: "Hard",
    company: "Kartly",
    title: "Session spans",
    scenario:
      "Engagement is span, not volume: how long does a real session last? Compute every session's span under the 1800-second rule, then rank customers by their longest.",
    steps: [
      { prompt: "Span per session: sessionize events with the 1800-second gap rule, then MAX(event_ts) - MIN(event_ts) per (customer, session). Output customer_id, session_id and span, ordered by customer_id ascending, then session_id ascending.", code: `WITH seq AS (\n  SELECT customer_id, event_ts,\n         LAG(event_ts) OVER (PARTITION BY customer_id ORDER BY event_ts) AS prev_ts\n  FROM events\n),\nstamped AS (\n  SELECT customer_id, event_ts,\n         SUM(CASE WHEN prev_ts IS NULL OR event_ts - prev_ts > 1800\n                  THEN 1 ELSE 0 END) OVER (\n           PARTITION BY customer_id ORDER BY event_ts\n           ROWS UNBOUNDED PRECEDING) AS session_id\n  FROM seq\n)\nSELECT customer_id, session_id,\n       MAX(event_ts) - MIN(event_ts) AS span\nFROM stamped\nGROUP BY customer_id, session_id\nORDER BY customer_id ASC, session_id ASC;`, order: "exact" },
      { prompt: "Longest session span per customer. Output customer_id and max_span, ordered by max_span descending, then customer_id ascending.", code: `WITH seq AS (\n  SELECT customer_id, event_ts,\n         LAG(event_ts) OVER (PARTITION BY customer_id ORDER BY event_ts) AS prev_ts\n  FROM events\n),\nstamped AS (\n  SELECT customer_id, event_ts,\n         SUM(CASE WHEN prev_ts IS NULL OR event_ts - prev_ts > 1800\n                  THEN 1 ELSE 0 END) OVER (\n           PARTITION BY customer_id ORDER BY event_ts\n           ROWS UNBOUNDED PRECEDING) AS session_id\n  FROM seq\n),\nspans AS (\n  SELECT customer_id, session_id,\n         MAX(event_ts) - MIN(event_ts) AS span\n  FROM stamped\n  GROUP BY customer_id, session_id\n)\nSELECT customer_id, MAX(span) AS max_span\nFROM spans\nGROUP BY customer_id\nORDER BY max_span DESC, customer_id ASC;`, order: "exact" },
    ],
  },
];
