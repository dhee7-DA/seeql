// Window-functions problem bank C — wf-p121…wf-p180.
// G5 "LAG & LEAD" (p121–150): offsets, MoM deltas, gaps, intervals.
// G6 "FIRST_VALUE / LAST_VALUE / NTH_VALUE" (p151–180): champions, frames.
import type { Problem } from "../types";
import { EXPECTED_WF } from "./expected-wf";

export const problemsWfC: Problem[] = [
  {
    id: "wf-p121",
    title: "The order before this one",
    brief:
      "Walk the order timeline (created_at ASC, id ASC tiebreak). On every order show id, created_at, total, and prev_total — the total of the PREVIOUS order in that walk (NULL for the very first). Ordered by the same timeline.",
    difficulty: "medium",
    hints: [
      "LAG(total) OVER (ORDER BY created_at ASC, id ASC) reaches one row back.",
      "SELECT id, created_at, total, LAG(total) OVER (ORDER BY created_at ASC, id ASC) AS prev_total FROM orders …",
    ],
    solution:
      "SELECT id, created_at, total, LAG(total) OVER (ORDER BY created_at ASC, id ASC) AS prev_total\nFROM orders\nORDER BY created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p121"],
  },
  {
    id: "wf-p122",
    title: "Month revenue with last month",
    brief:
      "Stage monthly revenue in a CTE (strftime '%Y-%m', rounded sum). Then show month, revenue, and prev_revenue — the previous month's revenue (NULL for the first month). Ordered by month.",
    difficulty: "medium",
    hints: [
      "LAG(revenue) OVER (ORDER BY month ASC) over the CTE.",
      "WITH m AS (SELECT strftime('%Y-%m', created_at) AS month, ROUND(SUM(total), 2) AS revenue FROM orders GROUP BY month) SELECT …",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month, revenue, LAG(revenue) OVER (ORDER BY month ASC) AS prev_revenue\nFROM m\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p122"],
  },
  {
    id: "wf-p123",
    title: "Month-over-month growth",
    brief:
      "The classic MoM: monthly revenue plus growth_pct — the percent change versus the previous month (2 decimals, NULL for the first month). Formula: 100.0 * (revenue - prev) / prev. Ordered by month.",
    difficulty: "hard",
    hints: [
      "LAG inside a CTE first; compute the percent in the outer SELECT so prev is a plain column.",
      "WITH m AS (…), d AS (SELECT month, revenue, LAG(revenue) OVER (ORDER BY month) AS prev FROM m) SELECT month, revenue, ROUND(100.0 * (revenue - prev) / prev, 2) AS growth_pct FROM d …",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n),\nd AS (\n  SELECT month, revenue, LAG(revenue) OVER (ORDER BY month ASC) AS prev\n  FROM m\n)\nSELECT month, ROUND(revenue, 2) AS revenue, ROUND(100.0 * (revenue - prev) / prev, 2) AS growth_pct\nFROM d\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p123"],
  },
  {
    id: "wf-p124",
    title: "The order after this one",
    brief:
      "Same timeline walk, but looking FORWARD: show id, created_at, total, and next_total — the FOLLOWING order's total (NULL on the last row). Ordered by the timeline.",
    difficulty: "medium",
    hints: [
      "LEAD(total) OVER (ORDER BY created_at ASC, id ASC) peeks one row ahead.",
      "SELECT id, created_at, total, LEAD(total) OVER (ORDER BY created_at ASC, id ASC) AS next_total FROM orders …",
    ],
    solution:
      "SELECT id, created_at, total, LEAD(total) OVER (ORDER BY created_at ASC, id ASC) AS next_total\nFROM orders\nORDER BY created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p124"],
  },
  {
    id: "wf-p125",
    title: "Previous total, zero default",
    brief:
      "Like LAG but the first row shows 0 instead of NULL: show id, total, and prev0 — the previous order's total with LAG's third argument set to 0. Timeline order (created_at, id).",
    difficulty: "medium",
    hints: [
      "LAG(total, 1, 0) OVER (…) — the third argument is the default for missing rows.",
      "SELECT id, total, LAG(total, 1, 0) OVER (ORDER BY created_at ASC, id ASC) AS prev0 FROM orders …",
    ],
    solution:
      "SELECT id, total, LAG(total, 1, 0.0) OVER (ORDER BY created_at ASC, id ASC) AS prev0\nFROM orders\nORDER BY created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p125"],
  },
  {
    id: "wf-p126",
    title: "Days between a customer's orders",
    brief:
      "For every order show id, customer_id, created_at, and days_since_prev — whole days since THAT customer's previous order (NULL for their first). Use julianday on the dates. Ordered by customer_id then created_at.",
    difficulty: "hard",
    hints: [
      "LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id), then CAST(julianday(created_at) - julianday(prev) AS INTEGER).",
      "Stage the LAG in a CTE; julianday math goes in the outer SELECT.",
    ],
    solution:
      "WITH w AS (\n  SELECT id, customer_id, created_at,\n         LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS prev\n  FROM orders\n)\nSELECT id, customer_id, created_at,\n       CAST(julianday(created_at) - julianday(prev) AS INTEGER) AS days_since_prev\nFROM w\nORDER BY customer_id, created_at, id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p126"],
  },
  {
    id: "wf-p127",
    title: "Days between installments",
    brief:
      "For every payment show id, invoice_id, paid_on, and gap_days — days since the previous payment on the SAME invoice (NULL for an invoice's first payment). Ordered by invoice_id then paid_on.",
    difficulty: "hard",
    hints: [
      "PARTITION BY invoice_id, LAG(paid_on), then julianday subtraction cast to INTEGER.",
      "WITH w AS (SELECT id, invoice_id, paid_on, LAG(paid_on) OVER (PARTITION BY invoice_id ORDER BY paid_on ASC, id ASC) AS prev FROM payments) …",
    ],
    solution:
      "WITH w AS (\n  SELECT id, invoice_id, paid_on,\n         LAG(paid_on) OVER (PARTITION BY invoice_id ORDER BY paid_on ASC, id ASC) AS prev\n  FROM payments\n)\nSELECT id, invoice_id, paid_on, CAST(julianday(paid_on) - julianday(prev) AS INTEGER) AS gap_days\nFROM w\nORDER BY invoice_id, paid_on, id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p127"],
  },
  {
    id: "wf-p128",
    title: "Revenue step by step",
    brief:
      "Monthly revenue plus revenue_step — this month's revenue minus the previous month's (2 decimals; NULL first month). A negative step means the month shrank. Ordered by month.",
    difficulty: "medium",
    hints: [
      "LAG the revenue in a CTE; subtract in the outer SELECT and round.",
      "WITH m AS (…), d AS (SELECT month, revenue, LAG(revenue) OVER (ORDER BY month) AS prev FROM m) SELECT …, ROUND(revenue - prev, 2) AS revenue_step …",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n),\nd AS (\n  SELECT month, revenue, LAG(revenue) OVER (ORDER BY month ASC) AS prev\n  FROM m\n)\nSELECT month, ROUND(revenue, 2) AS revenue, ROUND(revenue - prev, 2) AS revenue_step\nFROM d\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p128"],
  },
  {
    id: "wf-p129",
    title: "Previous order in my status",
    brief:
      "Walk each status group separately: on every order show id, status, total, and prev_in_status — the total of the previous order WITH THE SAME STATUS (timeline order; NULL at each group start). Ordered by status then timeline.",
    difficulty: "medium",
    hints: [
      "LAG(total) OVER (PARTITION BY status ORDER BY created_at ASC, id ASC).",
      "SELECT id, status, total, LAG(total) OVER (PARTITION BY status ORDER BY created_at ASC, id ASC) AS prev_in_status FROM orders …",
    ],
    solution:
      "SELECT id, status, total, LAG(total) OVER (PARTITION BY status ORDER BY created_at ASC, id ASC) AS prev_in_status\nFROM orders\nORDER BY status, created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p129"],
  },
  {
    id: "wf-p130",
    title: "Price of the next product up",
    brief:
      "Rank the catalog by price (ties by name) and show name, price, and next_price — the NEXT product's price up the ladder (NULL at the top). Ordered by the price ladder.",
    difficulty: "medium",
    hints: [
      "LEAD(price) OVER (ORDER BY price ASC, name ASC).",
      "SELECT name, price, LEAD(price) OVER (ORDER BY price ASC, name ASC) AS next_price FROM products …",
    ],
    solution:
      "SELECT name, price, LEAD(price) OVER (ORDER BY price ASC, name ASC) AS next_price\nFROM products\nORDER BY price ASC, name ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p130"],
  },
  {
    id: "wf-p131",
    title: "New-customer flags",
    brief:
      "Walk the global order timeline and flag first appearances: show order id, customer_id, created_at, and is_new — 'yes' when the previous row's customer_id differs (or is NULL), else 'no'. Ordered by the timeline.",
    difficulty: "hard",
    hints: [
      "LAG(customer_id) OVER (ORDER BY created_at, id) then CASE WHEN prev IS NULL OR prev != customer_id THEN 'yes' ELSE 'no' END.",
      "Stage the LAG in a CTE so the CASE reads the plain prev column.",
    ],
    solution:
      "WITH w AS (\n  SELECT id, customer_id, created_at,\n         LAG(customer_id) OVER (ORDER BY created_at ASC, id ASC) AS prev\n  FROM orders\n)\nSELECT id, customer_id, created_at,\n       CASE WHEN prev IS NULL OR prev != customer_id THEN 'yes' ELSE 'no' END AS is_new\nFROM w\nORDER BY created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p131"],
  },
  {
    id: "wf-p132",
    title: "Repeat-purchase interval",
    brief:
      "For every order show id, customer_id, and days_since_prev — days since this customer's previous order (NULL on their first). This is the retention-team classic. Ordered by customer_id then created_at, id.",
    difficulty: "hard",
    hints: [
      "Same shape as the days-between-orders problem: PARTITION BY customer_id, LAG(created_at), julianday difference cast to INTEGER.",
      "WITH w AS (SELECT id, customer_id, LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS prev FROM orders) …",
    ],
    solution:
      "WITH w AS (\n  SELECT id, customer_id, created_at,\n         LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS prev\n  FROM orders\n)\nSELECT id, customer_id, CAST(julianday(created_at) - julianday(prev) AS INTEGER) AS days_since_prev\nFROM w\nORDER BY customer_id, id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p132"],
  },
  {
    id: "wf-p133",
    title: "Back-to-back customers",
    brief:
      "In the global timeline, mark consecutive orders by the SAME customer: show id, customer_id, and same_as_prev — 'yes' when the previous timeline row has the same customer_id, else 'no' (the first row is 'no'). Ordered by timeline.",
    difficulty: "medium",
    hints: [
      "LAG(customer_id) OVER (ORDER BY created_at, id); compare with the current customer_id.",
      "WITH w AS (SELECT id, customer_id, LAG(customer_id) OVER (ORDER BY created_at ASC, id ASC) AS prev FROM orders) SELECT id, customer_id, CASE WHEN prev = customer_id THEN 'yes' ELSE 'no' END AS same_as_prev …",
    ],
    solution:
      "WITH w AS (\n  SELECT id, customer_id, LAG(customer_id) OVER (ORDER BY created_at ASC, id ASC) AS prev\n  FROM orders\n)\nSELECT id, customer_id, CASE WHEN prev = customer_id THEN 'yes' ELSE 'no' END AS same_as_prev\nFROM w\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p133"],
  },
  {
    id: "wf-p134",
    title: "Cash-in cadence",
    brief:
      "Across the whole payments timeline (paid_on ASC, id ASC): show id, paid_on, amount_cents, and days_since_prev — days since the previous payment of ANY invoice (NULL on the first). Ordered by the timeline.",
    difficulty: "medium",
    hints: [
      "LAG(paid_on) OVER (ORDER BY paid_on ASC, id ASC), then julianday diff cast to INTEGER.",
      "WITH w AS (SELECT id, paid_on, amount_cents, LAG(paid_on) OVER (ORDER BY paid_on ASC, id ASC) AS prev FROM payments) …",
    ],
    solution:
      "WITH w AS (\n  SELECT id, paid_on, amount_cents, LAG(paid_on) OVER (ORDER BY paid_on ASC, id ASC) AS prev\n  FROM payments\n)\nSELECT id, paid_on, amount_cents, CAST(julianday(paid_on) - julianday(prev) AS INTEGER) AS days_since_prev\nFROM w\nORDER BY paid_on ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p134"],
  },
  {
    id: "wf-p135",
    title: "Previous entry in my account",
    brief:
      "Ledger: for every entry show id, account, entry_date, and prev_date — the previous entry date within the SAME account (NULL at each account's start). Ordered by account then entry_date, id.",
    difficulty: "easy",
    hints: [
      "LAG(entry_date) OVER (PARTITION BY account ORDER BY entry_date ASC, id ASC).",
      "SELECT id, account, entry_date, LAG(entry_date) OVER (PARTITION BY account ORDER BY entry_date ASC, id ASC) AS prev_date FROM ledger_entries …",
    ],
    solution:
      "SELECT id, account, entry_date, LAG(entry_date) OVER (PARTITION BY account ORDER BY entry_date ASC, id ASC) AS prev_date\nFROM ledger_entries\nORDER BY account, entry_date ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p135"],
  },
  {
    id: "wf-p136",
    title: "Expense months, one back",
    brief:
      "Total expense cents per month (strftime '%Y-%m' of spent_on), then add prev_spend — the previous month's total (NULL first). Ordered by month.",
    difficulty: "medium",
    hints: [
      "CTE sums by month; LAG over the month order.",
      "WITH m AS (SELECT strftime('%Y-%m', spent_on) AS month, SUM(amount_cents) AS spend FROM expenses GROUP BY month) SELECT month, spend, LAG(spend) OVER (ORDER BY month ASC) AS prev_spend FROM m …",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', spent_on) AS month, SUM(amount_cents) AS spend\n  FROM expenses\n  GROUP BY month\n)\nSELECT month, spend, LAG(spend) OVER (ORDER BY month ASC) AS prev_spend\nFROM m\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p136"],
  },
  {
    id: "wf-p137",
    title: "Bracketed by neighbors",
    brief:
      "Monthly revenue with BOTH neighbors: prev_revenue (LAG) and next_revenue (LEAD), NULLs at the edges. Return month, revenue, prev_revenue, next_revenue, ordered by month.",
    difficulty: "medium",
    hints: [
      "Two window calls over the same ORDER BY month inside one CTE.",
      "SELECT month, revenue, LAG(revenue) OVER (ORDER BY month) AS prev_revenue, LEAD(revenue) OVER (ORDER BY month) AS next_revenue FROM m …",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month, revenue,\n       LAG(revenue) OVER (ORDER BY month ASC) AS prev_revenue,\n       LEAD(revenue) OVER (ORDER BY month ASC) AS next_revenue\nFROM m\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p137"],
  },
  {
    id: "wf-p138",
    title: "Two orders back",
    brief:
      "LAG with an offset of 2: on the timeline show id, total, and prev2 — the total from TWO orders back (NULLs for the first two rows). Ordered by the timeline (created_at, id).",
    difficulty: "medium",
    hints: [
      "LAG(total, 2) OVER (ORDER BY created_at ASC, id ASC) — the second argument is the offset.",
      "SELECT id, total, LAG(total, 2) OVER (ORDER BY created_at ASC, id ASC) AS prev2 FROM orders …",
    ],
    solution:
      "SELECT id, total, LAG(total, 2) OVER (ORDER BY created_at ASC, id ASC) AS prev2\nFROM orders\nORDER BY created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p138"],
  },
  {
    id: "wf-p139",
    title: "Next total, gracefully filled",
    brief:
      "LEAD into the future with a default: show id, total, and next0 — the NEXT order's total, or 0 on the final row (use LEAD's third argument). Ordered by the timeline (created_at, id).",
    difficulty: "easy",
    hints: [
      "LEAD(total, 1, 0) OVER (ORDER BY created_at ASC, id ASC).",
      "SELECT id, total, LEAD(total, 1, 0) OVER (ORDER BY created_at ASC, id ASC) AS next0 FROM orders …",
    ],
    solution:
      "SELECT id, total, LEAD(total, 1, 0) OVER (ORDER BY created_at ASC, id ASC) AS next0\nFROM orders\nORDER BY created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p139"],
  },
  {
    id: "wf-p140",
    title: "Category revenue steps",
    brief:
      "Stage per-category revenue (2 decimals). Walking categories from biggest revenue to smallest, show category, revenue, and step — the drop to the NEXT category below (revenue minus next, 2 decimals; NULL on the last). Ordered by revenue DESC.",
    difficulty: "hard",
    hints: [
      "CTE 1: category revenue. Outer: LEAD(revenue) OVER (ORDER BY revenue DESC, category ASC), subtract in a second stage.",
      "WITH r AS (…), d AS (SELECT category, revenue, LEAD(revenue) OVER (ORDER BY revenue DESC, category ASC) AS nxt FROM r) SELECT category, revenue, ROUND(revenue - nxt, 2) AS step …",
    ],
    solution:
      "WITH r AS (\n  SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.category\n),\nd AS (\n  SELECT category, revenue, LEAD(revenue) OVER (ORDER BY revenue DESC, category ASC) AS nxt\n  FROM r\n)\nSELECT category, revenue, ROUND(revenue - nxt, 2) AS step\nFROM d\nORDER BY revenue DESC, category ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p140"],
  },
  {
    id: "wf-p141",
    title: "Days since my last invoice",
    brief:
      "For every invoice show id, customer_id, issued_on, and days_since_prev — days since that customer's PREVIOUS invoice (NULL for their first). Ordered by customer_id then issued_on.",
    difficulty: "hard",
    hints: [
      "LAG(issued_on) OVER (PARTITION BY customer_id ORDER BY issued_on ASC, id ASC) + julianday math.",
      "WITH w AS (SELECT id, customer_id, issued_on, LAG(issued_on) OVER (PARTITION BY customer_id ORDER BY issued_on ASC, id ASC) AS prev FROM invoices) …",
    ],
    solution:
      "WITH w AS (\n  SELECT id, customer_id, issued_on,\n         LAG(issued_on) OVER (PARTITION BY customer_id ORDER BY issued_on ASC, id ASC) AS prev\n  FROM invoices\n)\nSELECT id, customer_id, issued_on, CAST(julianday(issued_on) - julianday(prev) AS INTEGER) AS days_since_prev\nFROM w\nORDER BY customer_id, issued_on, id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p141"],
  },
  {
    id: "wf-p142",
    title: "Units month over month",
    brief:
      "Join order_items to orders, total the quantity per order MONTH, then show month, units, and prev_units — last month's units (NULL first). Ordered by month.",
    difficulty: "hard",
    hints: [
      "CTE: JOIN on order_id, GROUP BY strftime('%Y-%m', o.created_at), SUM(quantity). LAG over month.",
      "WITH m AS (SELECT strftime('%Y-%m', o.created_at) AS month, SUM(oi.quantity) AS units FROM order_items oi JOIN orders o ON o.id = oi.order_id GROUP BY month) …",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', o.created_at) AS month, SUM(oi.quantity) AS units\n  FROM order_items oi\n  JOIN orders o ON o.id = oi.order_id\n  GROUP BY month\n)\nSELECT month, units, LAG(units) OVER (ORDER BY month ASC) AS prev_units\nFROM m\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p142"],
  },
  {
    id: "wf-p143",
    title: "Price moves per product",
    brief:
      "For every order_items line show id, product_id, unit_price, and prev_price — the previous line's unit price for the SAME product (NULL at each product's first line). Ordered by product_id then line id.",
    difficulty: "medium",
    hints: [
      "LAG(unit_price) OVER (PARTITION BY product_id ORDER BY id ASC).",
      "SELECT id, product_id, unit_price, LAG(unit_price) OVER (PARTITION BY product_id ORDER BY id ASC) AS prev_price FROM order_items …",
    ],
    solution:
      "SELECT id, product_id, unit_price, LAG(unit_price) OVER (PARTITION BY product_id ORDER BY id ASC) AS prev_price\nFROM order_items\nORDER BY product_id, id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p143"],
  },
  {
    id: "wf-p144",
    title: "Account switches in the ledger",
    brief:
      "Walk ledger entries by id and show id, account, and prev_account — the previous entry's account (NULL on the first row). Rows where the two differ are the account switches. Ordered by id.",
    difficulty: "easy",
    hints: [
      "LAG(account) OVER (ORDER BY id ASC) — no partition, pure timeline.",
      "SELECT id, account, LAG(account) OVER (ORDER BY id ASC) AS prev_account FROM ledger_entries ORDER BY id;",
    ],
    solution:
      "SELECT id, account, LAG(account) OVER (ORDER BY id ASC) AS prev_account\nFROM ledger_entries\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p144"],
  },
  {
    id: "wf-p145",
    title: "Days until the next order",
    brief:
      "For every order show id, customer_id, and days_to_next — days until that customer's NEXT order (NULL after their last). Ordered by customer_id then created_at.",
    difficulty: "hard",
    hints: [
      "LEAD(created_at) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC), julianday diff, cast to INTEGER.",
      "WITH w AS (SELECT id, customer_id, created_at, LEAD(created_at) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS nxt FROM orders) …",
    ],
    solution:
      "WITH w AS (\n  SELECT id, customer_id, created_at,\n         LEAD(created_at) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS nxt\n  FROM orders\n)\nSELECT id, customer_id, CAST(julianday(nxt) - julianday(created_at) AS INTEGER) AS days_to_next\nFROM w\nORDER BY customer_id, created_at, id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p145"],
  },
  {
    id: "wf-p146",
    title: "Previous basket in my month",
    brief:
      "Walk each calendar month's orders chronologically: show id, month (strftime '%Y-%m'), total, and prev_in_month — the previous order's total within the SAME month (NULL at month starts). Ordered by month then timeline.",
    difficulty: "hard",
    hints: [
      "Partition by the month expression: LAG(total) OVER (PARTITION BY strftime('%Y-%m', created_at) ORDER BY created_at ASC, id ASC).",
      "SELECT id, strftime('%Y-%m', created_at) AS month, total, LAG(total) OVER (PARTITION BY strftime('%Y-%m', created_at) ORDER BY created_at ASC, id ASC) AS prev_in_month FROM orders …",
    ],
    solution:
      "SELECT id, strftime('%Y-%m', created_at) AS month, total,\n       LAG(total) OVER (PARTITION BY strftime('%Y-%m', created_at) ORDER BY created_at ASC, id ASC) AS prev_in_month\nFROM orders\nORDER BY month, created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p146"],
  },
  {
    id: "wf-p147",
    title: "Up, down, or flat",
    brief:
      "Monthly revenue with direction: direction is 'up' when revenue beats the previous month, 'down' when below, 'flat' when equal ('start' on the first month). Return month, revenue, direction, ordered by month.",
    difficulty: "hard",
    hints: [
      "LAG the revenue in a CTE; the outer CASE compares revenue with prev, guarding NULL first.",
      "CASE WHEN prev IS NULL THEN 'start' WHEN revenue > prev THEN 'up' WHEN revenue < prev THEN 'down' ELSE 'flat' END",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n),\nd AS (\n  SELECT month, revenue, LAG(revenue) OVER (ORDER BY month ASC) AS prev\n  FROM m\n)\nSELECT month, ROUND(revenue, 2) AS revenue,\n       CASE WHEN prev IS NULL THEN 'start' WHEN revenue > prev THEN 'up' WHEN revenue < prev THEN 'down' ELSE 'flat' END AS direction\nFROM d\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p147"],
  },
  {
    id: "wf-p148",
    title: "Payment months, one back",
    brief:
      "Count payments per month (strftime '%Y-%m' of paid_on) and add prev_count — the previous month's payment count (NULL first). Return month, payments, prev_count, ordered by month.",
    difficulty: "medium",
    hints: [
      "CTE counts by month; LAG over the month order.",
      "WITH m AS (SELECT strftime('%Y-%m', paid_on) AS month, COUNT(*) AS payments FROM payments GROUP BY month) …",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', paid_on) AS month, COUNT(*) AS payments\n  FROM payments\n  GROUP BY month\n)\nSELECT month, payments, LAG(payments) OVER (ORDER BY month ASC) AS prev_count\nFROM m\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p148"],
  },
  {
    id: "wf-p149",
    title: "Previous invoice per customer",
    brief:
      "For every invoice show id, customer_id, amount_cents, and prev_amount — the customer's PREVIOUS invoice amount (NULL at their first). Ordered by customer_id then issued_on.",
    difficulty: "medium",
    hints: [
      "LAG(amount_cents) OVER (PARTITION BY customer_id ORDER BY issued_on ASC, id ASC).",
      "SELECT id, customer_id, amount_cents, LAG(amount_cents) OVER (PARTITION BY customer_id ORDER BY issued_on ASC, id ASC) AS prev_amount FROM invoices …",
    ],
    solution:
      "SELECT id, customer_id, amount_cents, LAG(amount_cents) OVER (PARTITION BY customer_id ORDER BY issued_on ASC, id ASC) AS prev_amount\nFROM invoices\nORDER BY customer_id, issued_on ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p149"],
  },
  {
    id: "wf-p150",
    title: "Days until my category's next spend",
    brief:
      "For every expense show id, category, spent_on, and days_to_next — days until the NEXT expense of the SAME category (NULL after the last). Ordered by category then spent_on.",
    difficulty: "hard",
    hints: [
      "LEAD(spent_on) OVER (PARTITION BY category ORDER BY spent_on ASC, id ASC), julianday diff cast to INTEGER.",
      "WITH w AS (SELECT id, category, spent_on, LEAD(spent_on) OVER (PARTITION BY category ORDER BY spent_on ASC, id ASC) AS nxt FROM expenses) …",
    ],
    solution:
      "WITH w AS (\n  SELECT id, category, spent_on,\n         LEAD(spent_on) OVER (PARTITION BY category ORDER BY spent_on ASC, id ASC) AS nxt\n  FROM expenses\n)\nSELECT id, category, spent_on, CAST(julianday(nxt) - julianday(spent_on) AS INTEGER) AS days_to_next\nFROM w\nORDER BY category, spent_on, id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p150"],
  },
  {
    id: "wf-p151",
    title: "The category champion, on every shelf row",
    brief:
      "For every product show name, category, price, and cat_top — the name of the MOST EXPENSIVE product in its category, repeated on each of the category's rows. Ties: alphabetical. Ordered by id.",
    difficulty: "medium",
    hints: [
      "FIRST_VALUE(name) OVER (PARTITION BY category ORDER BY price DESC, name ASC).",
      "SELECT name, category, price, FIRST_VALUE(name) OVER (PARTITION BY category ORDER BY price DESC, name ASC) AS cat_top FROM products …",
    ],
    solution:
      "SELECT name, category, price, FIRST_VALUE(name) OVER (PARTITION BY category ORDER BY price DESC, name ASC) AS cat_top\nFROM products\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p151"],
  },
  {
    id: "wf-p152",
    title: "The budget anchor per category",
    brief:
      "Same shelf, other end: for every product show name, category, price, and cat_floor — the CHEAPEST product name in its category on every row. Ties: alphabetical. Ordered by id.",
    difficulty: "medium",
    hints: [
      "FIRST_VALUE(name) OVER (PARTITION BY category ORDER BY price ASC, name ASC).",
      "SELECT name, category, price, FIRST_VALUE(name) OVER (PARTITION BY category ORDER BY price ASC, name ASC) AS cat_floor FROM products …",
    ],
    solution:
      "SELECT name, category, price, FIRST_VALUE(name) OVER (PARTITION BY category ORDER BY price ASC, name ASC) AS cat_floor\nFROM products\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p152"],
  },
  {
    id: "wf-p153",
    title: "First name of each region",
    brief:
      "For every customer show name, region, and region_first — the alphabetically FIRST customer name of their region on every row. Ordered by id.",
    difficulty: "easy",
    hints: [
      "FIRST_VALUE(name) OVER (PARTITION BY region ORDER BY name ASC, id ASC).",
      "SELECT name, region, FIRST_VALUE(name) OVER (PARTITION BY region ORDER BY name ASC, id ASC) AS region_first FROM customers …",
    ],
    solution:
      "SELECT name, region, FIRST_VALUE(name) OVER (PARTITION BY region ORDER BY name ASC, id ASC) AS region_first\nFROM customers\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p153"],
  },
  {
    id: "wf-p154",
    title: "LAST_VALUE needs a frame",
    brief:
      "The trap, live: per category ordered by price ASC, show name, price, last_default (LAST_VALUE with the default frame) and last_true (LAST_VALUE with ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING). last_default trails the current row; last_true is the real category maximum's name. Ordered by id.",
    difficulty: "hard",
    hints: [
      "Default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, so default LAST_VALUE lands on the current row.",
      "LAST_VALUE(name) OVER (PARTITION BY category ORDER BY price ASC, name ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_true",
    ],
    solution:
      "SELECT name, category, price,\n       LAST_VALUE(name) OVER (PARTITION BY category ORDER BY price ASC, name ASC) AS last_default,\n       LAST_VALUE(name) OVER (PARTITION BY category ORDER BY price ASC, name ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_true\nFROM products\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p154"],
  },
  {
    id: "wf-p155",
    title: "Everyone's first order date",
    brief:
      "For every order show id, customer_id, created_at, and first_order — the customer's EARLIEST order date, repeated on their rows. Ordered by id.",
    difficulty: "medium",
    hints: [
      "FIRST_VALUE(created_at) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC).",
      "SELECT id, customer_id, created_at, FIRST_VALUE(created_at) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS first_order FROM orders …",
    ],
    solution:
      "SELECT id, customer_id, created_at, FIRST_VALUE(created_at) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS first_order\nFROM orders\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p155"],
  },
  {
    id: "wf-p156",
    title: "Everyone's latest order date",
    brief:
      "For every order show id, customer_id, and last_order — the customer's LATEST order date on every row. The frame must span the whole partition (ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) or LAST_VALUE will lie. Ordered by id.",
    difficulty: "hard",
    hints: [
      "LAST_VALUE(created_at) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING).",
      "Alternatively ORDER BY created_at DESC with FIRST_VALUE — but the brief asks for LAST_VALUE with the full frame.",
    ],
    solution:
      "SELECT id, customer_id, created_at,\n       LAST_VALUE(created_at) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_order\nFROM orders\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p156"],
  },
  {
    id: "wf-p157",
    title: "Each status's opening order",
    brief:
      "For every order show id, status, and status_first — the EARLIEST order date within its status group. Ordered by id.",
    difficulty: "easy",
    hints: [
      "FIRST_VALUE(created_at) OVER (PARTITION BY status ORDER BY created_at ASC, id ASC).",
      "SELECT id, status, FIRST_VALUE(created_at) OVER (PARTITION BY status ORDER BY created_at ASC, id ASC) AS status_first FROM orders …",
    ],
    solution:
      "SELECT id, status, FIRST_VALUE(created_at) OVER (PARTITION BY status ORDER BY created_at ASC, id ASC) AS status_first\nFROM orders\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p157"],
  },
  {
    id: "wf-p158",
    title: "Silver medal per category",
    brief:
      "NTH_VALUE, take 2: for every product show name, category, price, and cat_second — the SECOND-most-expensive product name in its category (NULL where a category has only one product). Ties: alphabetical. Ordered by id.",
    difficulty: "hard",
    hints: [
      "NTH_VALUE(name, 2) OVER (PARTITION BY category ORDER BY price DESC, name ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING).",
      "The full frame matters — without it NTH_VALUE sees only the rows up to the current one.",
    ],
    solution:
      "SELECT name, category, price,\n       NTH_VALUE(name, 2) OVER (PARTITION BY category ORDER BY price DESC, name ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS cat_second\nFROM products\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p158"],
  },
  {
    id: "wf-p159",
    title: "FIRST_VALUE and MIN agree",
    brief:
      "Two roads to the same number: for every product show name, category, price, floor_fv (FIRST_VALUE of price, ascending) and floor_min (MIN(price) OVER the same partition). Both equal the category minimum. Ordered by id.",
    difficulty: "medium",
    hints: [
      "FIRST_VALUE(price) OVER (PARTITION BY category ORDER BY price ASC, name ASC) and MIN(price) OVER (PARTITION BY category).",
      "SELECT name, category, price, … AS floor_fv, … AS floor_min FROM products ORDER BY id;",
    ],
    solution:
      "SELECT name, category, price,\n       FIRST_VALUE(price) OVER (PARTITION BY category ORDER BY price ASC, name ASC) AS floor_fv,\n       MIN(price) OVER (PARTITION BY category) AS floor_min\nFROM products\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p159"],
  },
  {
    id: "wf-p160",
    title: "Gap to the champion's price",
    brief:
      "For every product show name, category, price, and below_top — the gap between its category's top price and its own (2 decimals), computed with FIRST_VALUE over a descending partition. Ordered by id.",
    difficulty: "medium",
    hints: [
      "FIRST_VALUE(price) OVER (PARTITION BY category ORDER BY price DESC, name ASC) - price, rounded.",
      "SELECT name, category, price, ROUND(FIRST_VALUE(price) OVER (…) - price, 2) AS below_top FROM products …",
    ],
    solution:
      "SELECT name, category, price, ROUND(FIRST_VALUE(price) OVER (PARTITION BY category ORDER BY price DESC, name ASC) - price, 2) AS below_top\nFROM products\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p160"],
  },
  {
    id: "wf-p161",
    title: "First-basket value",
    brief:
      "For every order show id, customer_id, total, and first_total — the customer's FIRST order's total (chronological, id tiebreak) on every row. Ordered by id.",
    difficulty: "medium",
    hints: [
      "FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC).",
      "SELECT id, customer_id, total, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS first_total FROM orders …",
    ],
    solution:
      "SELECT id, customer_id, total, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS first_total\nFROM orders\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p161"],
  },
  {
    id: "wf-p162",
    title: "When the account opened",
    brief:
      "Ledger: for every entry show id, account, entry_date, and opened_on — the account's first entry date. Ordered by id.",
    difficulty: "easy",
    hints: [
      "FIRST_VALUE(entry_date) OVER (PARTITION BY account ORDER BY entry_date ASC, id ASC).",
      "SELECT id, account, entry_date, FIRST_VALUE(entry_date) OVER (PARTITION BY account ORDER BY entry_date ASC, id ASC) AS opened_on FROM ledger_entries …",
    ],
    solution:
      "SELECT id, account, entry_date, FIRST_VALUE(entry_date) OVER (PARTITION BY account ORDER BY entry_date ASC, id ASC) AS opened_on\nFROM ledger_entries\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p162"],
  },
  {
    id: "wf-p163",
    title: "Each supplier's bargain",
    brief:
      "Join products to suppliers: for every product show product name, supplier name, and supplier_floor — the supplier's cheapest product name on each of their rows. Ties: alphabetical. Ordered by product id.",
    difficulty: "medium",
    hints: [
      "FIRST_VALUE(p.name) OVER (PARTITION BY s.name ORDER BY p.price ASC, p.name ASC) after the join.",
      "SELECT p.name, s.name AS supplier, FIRST_VALUE(p.name) OVER (…) AS supplier_floor FROM products p JOIN suppliers s ON s.id = p.supplier_id …",
    ],
    solution:
      "SELECT p.name, s.name AS supplier,\n       FIRST_VALUE(p.name) OVER (PARTITION BY s.name ORDER BY p.price ASC, p.name ASC) AS supplier_floor\nFROM products p\nJOIN suppliers s ON s.id = p.supplier_id\nORDER BY p.id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p163"],
  },
  {
    id: "wf-p164",
    title: "Running minimum price",
    brief:
      "Walking the catalog from cheapest (price ASC, name ASC): show name, price, and min_so_far — the cheapest price seen so far in the walk. Use FIRST_VALUE with the frame ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. Ordered by the walk.",
    difficulty: "hard",
    hints: [
      "FIRST_VALUE(price) OVER (ORDER BY price ASC, name ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).",
      "The truncated frame is what makes the value 'so far' instead of 'overall'.",
    ],
    solution:
      "SELECT name, price,\n       FIRST_VALUE(price) OVER (ORDER BY price ASC, name ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS min_so_far\nFROM products\nORDER BY price ASC, name ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p164"],
  },
  {
    id: "wf-p165",
    title: "Running maximum total",
    brief:
      "Walking the order timeline (created_at ASC, id ASC): show id, total, and max_so_far — the biggest order total seen so far in the walk. A windowed MAX with the truncated frame ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW is the running maximum. Ordered by the timeline.",
    difficulty: "hard",
    hints: [
      "MAX(total) OVER (ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).",
      "The truncated frame is what turns the whole-partition MAX into a 'so far' running max.",
    ],
    solution:
      "WITH walk AS (\n  SELECT id, total, created_at,\n         MAX(total) OVER (ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS max_so_far\n  FROM orders\n)\nSELECT id, total, max_so_far FROM walk ORDER BY created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p165"],
  },
  {
    id: "wf-p166",
    title: "Latest delivery per customer",
    brief:
      "For delivered orders only: show id, customer_id, created_at, and last_delivered — the customer's most recent DELIVERED order date on each of their delivered rows. Full frame required. Ordered by id.",
    difficulty: "hard",
    hints: [
      "WHERE status = 'delivered', then LAST_VALUE(created_at) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING).",
      "Ordering ASC with the full frame puts the true max in LAST_VALUE.",
    ],
    solution:
      "SELECT id, customer_id, created_at,\n       LAST_VALUE(created_at) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_delivered\nFROM orders\nWHERE status = 'delivered'\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p166"],
  },
  {
    id: "wf-p167",
    title: "First payment per invoice",
    brief:
      "For every payment show id, invoice_id, paid_on, and first_paid — the invoice's first payment date on each of its payment rows. Ordered by id.",
    difficulty: "easy",
    hints: [
      "FIRST_VALUE(paid_on) OVER (PARTITION BY invoice_id ORDER BY paid_on ASC, id ASC).",
      "SELECT id, invoice_id, paid_on, FIRST_VALUE(paid_on) OVER (PARTITION BY invoice_id ORDER BY paid_on ASC, id ASC) AS first_paid FROM payments …",
    ],
    solution:
      "SELECT id, invoice_id, paid_on, FIRST_VALUE(paid_on) OVER (PARTITION BY invoice_id ORDER BY paid_on ASC, id ASC) AS first_paid\nFROM payments\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p167"],
  },
  {
    id: "wf-p168",
    title: "Last payment per invoice",
    brief:
      "For every payment show id, invoice_id, paid_on, and last_paid — the invoice's most recent payment date (full frame so LAST_VALUE sees the whole partition). Ordered by id.",
    difficulty: "hard",
    hints: [
      "LAST_VALUE(paid_on) OVER (PARTITION BY invoice_id ORDER BY paid_on ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING).",
      "Without the frame, LAST_VALUE returns the current row's date — the classic bug.",
    ],
    solution:
      "SELECT id, invoice_id, paid_on,\n       LAST_VALUE(paid_on) OVER (PARTITION BY invoice_id ORDER BY paid_on ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_paid\nFROM payments\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p168"],
  },
  {
    id: "wf-p169",
    title: "Biggest spend of each category",
    brief:
      "For every expense show id, category, amount_cents, and cat_max — the category's largest single expense amount on each row. Ordered by id.",
    difficulty: "easy",
    hints: [
      "FIRST_VALUE(amount_cents) OVER (PARTITION BY category ORDER BY amount_cents DESC, id ASC).",
      "SELECT id, category, amount_cents, FIRST_VALUE(amount_cents) OVER (…) AS cat_max FROM expenses ORDER BY id;",
    ],
    solution:
      "SELECT id, category, amount_cents, FIRST_VALUE(amount_cents) OVER (PARTITION BY category ORDER BY amount_cents DESC, id ASC) AS cat_max\nFROM expenses\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p169"],
  },
  {
    id: "wf-p170",
    title: "First invoice per customer",
    brief:
      "For every invoice show id, customer_id, issued_on, and first_invoice — the customer's earliest invoice date on each row. Ordered by id.",
    difficulty: "easy",
    hints: [
      "FIRST_VALUE(issued_on) OVER (PARTITION BY customer_id ORDER BY issued_on ASC, id ASC).",
      "SELECT id, customer_id, issued_on, FIRST_VALUE(issued_on) OVER (…) AS first_invoice FROM invoices ORDER BY id;",
    ],
    solution:
      "SELECT id, customer_id, issued_on, FIRST_VALUE(issued_on) OVER (PARTITION BY customer_id ORDER BY issued_on ASC, id ASC) AS first_invoice\nFROM invoices\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p170"],
  },
  {
    id: "wf-p171",
    title: "Benchmark month on every row",
    brief:
      "Stage monthly revenue; on every month show month, revenue, and best_month — the name of the HIGHEST-revenue month repeated on all rows (FIRST_VALUE over revenue DESC). Ordered by month.",
    difficulty: "medium",
    hints: [
      "FIRST_VALUE(month) OVER (ORDER BY revenue DESC, month ASC) over the CTE.",
      "WITH m AS (…) SELECT month, revenue, FIRST_VALUE(month) OVER (ORDER BY revenue DESC, month ASC) AS best_month FROM m …",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month, revenue, FIRST_VALUE(month) OVER (ORDER BY revenue DESC, month ASC) AS best_month\nFROM m\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p171"],
  },
  {
    id: "wf-p172",
    title: "Third-largest basket",
    brief:
      "NTH_VALUE over the whole table: show every order's id, total, and third_biggest — the third-largest order total (NULL while fewer than three rows precede in the full frame). Ties: smaller id wins earlier position. Ordered by id.",
    difficulty: "hard",
    hints: [
      "NTH_VALUE(total, 3) OVER (ORDER BY total DESC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING).",
      "The full frame makes every row see the same third value.",
    ],
    solution:
      "SELECT id, total,\n       NTH_VALUE(total, 3) OVER (ORDER BY total DESC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS third_biggest\nFROM orders\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p172"],
  },
  {
    id: "wf-p173",
    title: "First name of each city",
    brief:
      "For every customer show name, city, and city_first — the alphabetically first customer name of their city. Ordered by id.",
    difficulty: "easy",
    hints: [
      "FIRST_VALUE(name) OVER (PARTITION BY city ORDER BY name ASC, id ASC).",
      "SELECT name, city, FIRST_VALUE(name) OVER (PARTITION BY city ORDER BY name ASC, id ASC) AS city_first FROM customers …",
    ],
    solution:
      "SELECT name, city, FIRST_VALUE(name) OVER (PARTITION BY city ORDER BY name ASC, id ASC) AS city_first\nFROM customers\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p173"],
  },
  {
    id: "wf-p174",
    title: "The best month, honestly",
    brief:
      "Stage monthly revenue. On every row show month, revenue, and last_by_default (LAST_VALUE ordered by revenue DESC) versus best_true (LAST_VALUE with ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING). The first column lies on non-final rows; the second is always the top month. Ordered by month.",
    difficulty: "hard",
    hints: [
      "LAST_VALUE(month) OVER (ORDER BY revenue DESC, month ASC) vs the same with the full frame.",
      "Alias them exactly last_by_default and best_true.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month, revenue,\n       LAST_VALUE(month) OVER (ORDER BY revenue DESC, month ASC) AS last_by_default,\n       LAST_VALUE(month) OVER (ORDER BY revenue DESC, month ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS best_true\nFROM m\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p174"],
  },
  {
    id: "wf-p175",
    title: "Region champion order",
    brief:
      "Join orders to customers: on every order show order id, region, and top_order — the id of the biggest-total order within that region (ties: smaller id). Ordered by order id.",
    difficulty: "hard",
    hints: [
      "FIRST_VALUE(o.id) OVER (PARTITION BY c.region ORDER BY o.total DESC, o.id ASC).",
      "SELECT o.id, c.region, FIRST_VALUE(o.id) OVER (…) AS top_order FROM orders o JOIN customers c ON c.id = o.customer_id …",
    ],
    solution:
      "SELECT o.id, c.region, FIRST_VALUE(o.id) OVER (PARTITION BY c.region ORDER BY o.total DESC, o.id ASC) AS top_order\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nORDER BY o.id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p175"],
  },
  {
    id: "wf-p176",
    title: "Each status's closing order",
    brief:
      "For every order show id, status, and status_last — the id of the MOST RECENT order in its status group (full frame; timeline ties by bigger id first so LAST_VALUE lands on the newest). Ordered by id.",
    difficulty: "hard",
    hints: [
      "LAST_VALUE(id) OVER (PARTITION BY status ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) — with ASC ordering the last row is the newest.",
      "The id ASC tiebreak within the same created_at makes the newest row deterministic.",
    ],
    solution:
      "SELECT id, status,\n       LAST_VALUE(id) OVER (PARTITION BY status ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS status_last\nFROM orders\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p176"],
  },
  {
    id: "wf-p177",
    title: "Distance above the floor",
    brief:
      "For every product show name, category, price, and above_floor — the amount its price sits above the category's CHEAPEST price (2 decimals). Ordered by id.",
    difficulty: "medium",
    hints: [
      "price - FIRST_VALUE(price) OVER (PARTITION BY category ORDER BY price ASC, name ASC), rounded.",
      "SELECT name, category, price, ROUND(price - FIRST_VALUE(price) OVER (…), 2) AS above_floor FROM products …",
    ],
    solution:
      "SELECT name, category, price, ROUND(price - FIRST_VALUE(price) OVER (PARTITION BY category ORDER BY price ASC, name ASC), 2) AS above_floor\nFROM products\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p177"],
  },
  {
    id: "wf-p178",
    title: "First and last baskets",
    brief:
      "Per customer, both ends of history on every order: first_total (FIRST_VALUE chronological) and last_total (LAST_VALUE with the full frame). Return id, customer_id, total, first_total, last_total, ordered by id.",
    difficulty: "hard",
    hints: [
      "Two windows over the same partition: FIRST_VALUE(total) … ORDER BY created_at ASC, id ASC; LAST_VALUE(total) … same order plus the full frame.",
      "Alias them exactly first_total and last_total.",
    ],
    solution:
      "SELECT id, customer_id, total,\n       FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS first_total,\n       LAST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_total\nFROM orders\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p178"],
  },
  {
    id: "wf-p179",
    title: "Oldest so far in the walk",
    brief:
      "Walking orders chronologically (created_at ASC, id ASC): show id, created_at, and oldest_so_far — the earliest created_at seen so far in the walk (FIRST_VALUE with the truncated frame UNBOUNDED PRECEDING AND CURRENT ROW). Ordered by the walk.",
    difficulty: "medium",
    hints: [
      "FIRST_VALUE(created_at) OVER (ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).",
      "Because the walk is chronological, the running first stays fixed at the global first — but the frame makes the semantics explicit.",
    ],
    solution:
      "SELECT id, created_at,\n       FIRST_VALUE(created_at) OVER (ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS oldest_so_far\nFROM orders\nORDER BY created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p179"],
  },
  {
    id: "wf-p180",
    title: "A product's first sale date",
    brief:
      "Join order_items to orders: for every line show line id, product_id, and first_sold — the product's earliest order date, repeated on all its lines. Ordered by line id.",
    difficulty: "hard",
    hints: [
      "FIRST_VALUE(o.created_at) OVER (PARTITION BY oi.product_id ORDER BY o.created_at ASC, o.id ASC) after the join.",
      "SELECT oi.id, oi.product_id, FIRST_VALUE(o.created_at) OVER (…) AS first_sold FROM order_items oi JOIN orders o ON o.id = oi.order_id …",
    ],
    solution:
      "SELECT oi.id, oi.product_id,\n       FIRST_VALUE(o.created_at) OVER (PARTITION BY oi.product_id ORDER BY o.created_at ASC, o.id ASC) AS first_sold\nFROM order_items oi\nJOIN orders o ON o.id = oi.order_id\nORDER BY oi.id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p180"],
  },
];