// Window-functions problem bank D — wf-p181…wf-p240.
// G7 "Running totals & frames" (p181–210): cumulative sums, moving windows,
//     ROWS BETWEEN semantics, balance walks.
// G8 "NTILE / CUME_DIST / PERCENT_RANK" (p211–240): buckets and percentiles.
import type { Problem } from "../types";
import { EXPECTED_WF } from "./expected-wf";

export const problemsWfD: Problem[] = [
  {
    id: "wf-p181",
    title: "The running revenue clock",
    brief:
      "Walk the order timeline (created_at ASC, id ASC) and show id, created_at, total, and running_revenue — the cumulative sum of totals up to and including this order (2 decimals). Ordered by the timeline.",
    difficulty: "medium",
    hints: [
      "SUM(total) OVER (ORDER BY created_at ASC, id ASC) — with ORDER BY the frame defaults to everything from the start through the current row.",
      "For explicitness you may spell it out: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW.",
    ],
    solution:
      "SELECT id, created_at, total,\n       ROUND(SUM(total) OVER (ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS running_revenue\nFROM orders\nORDER BY created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p181"],
  },
  {
    id: "wf-p182",
    title: "Each customer's running spend",
    brief:
      "Per customer, chronologically: show id, customer_id, created_at, total, and cust_running — the cumulative spend within that customer's orders (2 decimals). Ordered by customer_id then timeline.",
    difficulty: "medium",
    hints: [
      "SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC).",
      "The partition restarts the running total at each customer.",
    ],
    solution:
      "SELECT id, customer_id, created_at, total,\n       ROUND(SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS cust_running\nFROM orders\nORDER BY customer_id, created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p182"],
  },
  {
    id: "wf-p183",
    title: "Expense meter",
    brief:
      "Chronological expense walk (spent_on ASC, id ASC): show id, spent_on, amount_cents, and spent_so_far — the running sum of amount_cents. Ordered by the walk.",
    difficulty: "easy",
    hints: [
      "SUM(amount_cents) OVER (ORDER BY spent_on ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).",
      "Integer cents keep the arithmetic clean.",
    ],
    solution:
      "SELECT id, spent_on, amount_cents,\n       SUM(amount_cents) OVER (ORDER BY spent_on ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS spent_so_far\nFROM expenses\nORDER BY spent_on ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p183"],
  },
  {
    id: "wf-p184",
    title: "Three-basket moving average",
    brief:
      "Walk the order timeline and show id, total, and ma3 — the average of this order's total and the TWO before it (a 3-row trailing window, 2 decimals; early rows average fewer than 3). Ordered by the timeline.",
    difficulty: "hard",
    hints: [
      "AVG(total) OVER (ORDER BY created_at ASC, id ASC ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), rounded.",
      "ROWS (not RANGE) makes it a pure row-count window.",
    ],
    solution:
      "SELECT id, total,\n       ROUND(AVG(total) OVER (ORDER BY created_at ASC, id ASC ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS ma3\nFROM orders\nORDER BY created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p184"],
  },
  {
    id: "wf-p185",
    title: "Smoothed with my neighbors",
    brief:
      "Centered smoothing: show id, total, and ma3c — the average of the previous row, this row, and the next row's totals in the timeline (2 decimals; edges use what exists). Ordered by the timeline (created_at, id).",
    difficulty: "hard",
    hints: [
      "Frame ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING.",
      "AVG(total) OVER (ORDER BY created_at ASC, id ASC ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING).",
    ],
    solution:
      "SELECT id, total,\n       ROUND(AVG(total) OVER (ORDER BY created_at ASC, id ASC ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING), 2) AS ma3c\nFROM orders\nORDER BY created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p185"],
  },
  {
    id: "wf-p186",
    title: "Three-day spend smoothing",
    brief:
      "Stage per-day expense totals (spent_on, SUM of cents). Then show day, spend, and ma3 — the trailing 3-day average of daily spend (2 decimals). Only days that HAVE expenses appear. Ordered by day.",
    difficulty: "hard",
    hints: [
      "CTE: GROUP BY spent_on. Then AVG(spend) OVER (ORDER BY day ASC ROWS BETWEEN 2 PRECEDING AND CURRENT ROW).",
      "Divide-by-count happens inside AVG automatically, even for partial frames at the start.",
    ],
    solution:
      "WITH d AS (\n  SELECT spent_on AS day, SUM(amount_cents) AS spend\n  FROM expenses\n  GROUP BY spent_on\n)\nSELECT day, spend,\n       ROUND(AVG(spend) OVER (ORDER BY day ASC ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS ma3\nFROM d\nORDER BY day;",
    ordered: true,
    expected: EXPECTED_WF["wf-p186"],
  },
  {
    id: "wf-p187",
    title: "Order number so far",
    brief:
      "For every order show id, customer_id, created_at, and orders_so_far — the cumulative COUNT of that customer's orders including this one. Ordered by customer_id then timeline.",
    difficulty: "medium",
    hints: [
      "COUNT(*) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).",
      "The running count is the customer's 1st, 2nd, 3rd… order marker.",
    ],
    solution:
      "SELECT id, customer_id, created_at,\n       COUNT(*) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS orders_so_far\nFROM orders\nORDER BY customer_id, created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p187"],
  },
  {
    id: "wf-p188",
    title: "Cumulative revenue by month",
    brief:
      "Stage monthly revenue, then show month, revenue, and cum_revenue — the running sum across months (2 decimals). Ordered by month.",
    difficulty: "medium",
    hints: [
      "SUM(revenue) OVER (ORDER BY month ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) over the CTE.",
      "Monthly rows are unique, so the default frame would also be safe — spelling it out is good hygiene.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month, ROUND(revenue, 2) AS revenue,\n       ROUND(SUM(revenue) OVER (ORDER BY month ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS cum_revenue\nFROM m\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p188"],
  },
  {
    id: "wf-p189",
    title: "Balance walk",
    brief:
      "Ledger, chronological (entry_date ASC, id ASC): show id, entry_date, memo, and balance — the running net (sum of debit_cents - credit_cents from the start). Ordered by the walk.",
    difficulty: "hard",
    hints: [
      "SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).",
      "This is the classic running bank balance pattern.",
    ],
    solution:
      "SELECT id, entry_date, memo,\n       SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS balance\nFROM ledger_entries\nORDER BY entry_date ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p189"],
  },
  {
    id: "wf-p190",
    title: "Account-by-account balance",
    brief:
      "Per ledger account, chronological: show id, account, entry_date, and acct_balance — the running net within that account only. Ordered by account then timeline.",
    difficulty: "hard",
    hints: [
      "SUM(debit_cents - credit_cents) OVER (PARTITION BY account ORDER BY entry_date ASC, id ASC ROWS …).",
      "Same walk as the book-wide balance, but the partition resets per account.",
    ],
    solution:
      "SELECT id, account, entry_date,\n       SUM(debit_cents - credit_cents) OVER (PARTITION BY account ORDER BY entry_date ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS acct_balance\nFROM ledger_entries\nORDER BY account, entry_date ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p190"],
  },
  {
    id: "wf-p191",
    title: "Cumulative share of revenue",
    brief:
      "Monthly revenue plus cum_pct — the cumulative revenue through this month as a percent of the FULL-PERIOD revenue (2 decimals). The final month must read 100.0. Ordered by month.",
    difficulty: "hard",
    hints: [
      "Two layers: cumulative sum in a CTE, then divide by the grand total (SUM(revenue) OVER () in the outer SELECT), times 100.0.",
      "WITH m AS (…), c AS (SELECT month, revenue, SUM(revenue) OVER (ORDER BY month ROWS UNBOUNDED PRECEDING) AS cum FROM m) SELECT …",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n),\nc AS (\n  SELECT month, revenue, SUM(revenue) OVER (ORDER BY month ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum\n  FROM m\n)\nSELECT month, ROUND(revenue, 2) AS revenue, ROUND(100.0 * cum / SUM(revenue) OVER (), 2) AS cum_pct\nFROM c\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p191"],
  },
  {
    id: "wf-p192",
    title: "Units on the assembly line",
    brief:
      "For order_items lines of each product, ordered by line id: show id, product_id, quantity, and units_so_far — the running sum of that product's quantities. Ordered by product_id then line id.",
    difficulty: "medium",
    hints: [
      "SUM(quantity) OVER (PARTITION BY product_id ORDER BY id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).",
      "Each product's count resets and then accumulates.",
    ],
    solution:
      "SELECT id, product_id, quantity,\n       SUM(quantity) OVER (PARTITION BY product_id ORDER BY id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS units_so_far\nFROM order_items\nORDER BY product_id, id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p192"],
  },
  {
    id: "wf-p193",
    title: "Customers acquired, cumulatively",
    brief:
      "Stage the count of customers created per month (customers.created_at), then show month, joined, and cum_joined — the running total of acquisitions. Ordered by month.",
    difficulty: "medium",
    hints: [
      "CTE: GROUP BY strftime('%Y-%m', created_at), COUNT(*). Then SUM(joined) OVER (ORDER BY month …).",
      "Every month in the table appears (no gap filling needed).",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS joined\n  FROM customers\n  GROUP BY month\n)\nSELECT month, joined,\n       SUM(joined) OVER (ORDER BY month ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_joined\nFROM m\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p193"],
  },
  {
    id: "wf-p194",
    title: "Monthly revenue, smoothed",
    brief:
      "Monthly revenue with ma3 — the trailing 3-month average (2 decimals; first months use fewer terms). Ordered by month.",
    difficulty: "medium",
    hints: [
      "AVG(revenue) OVER (ORDER BY month ASC ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) over the month CTE.",
      "This is the smoothing analysts put next to MoM growth.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month, ROUND(revenue, 2) AS revenue,\n       ROUND(AVG(revenue) OVER (ORDER BY month ASC ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS ma3\nFROM m\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p194"],
  },
  {
    id: "wf-p195",
    title: "Distance below the running peak",
    brief:
      "Timeline walk: show id, total, peak_so_far (running max) and below_peak (peak_so_far minus total, 2 decimals). Ordered by the timeline (created_at, id).",
    difficulty: "hard",
    hints: [
      "MAX(total) OVER (ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS peak_so_far, then subtract in an outer layer (or compute both columns with the same window).",
      "Two columns can share one window definition — SQLite computes it once.",
    ],
    solution:
      "SELECT id, total,\n       MAX(total) OVER w AS peak_so_far,\n       ROUND(MAX(total) OVER w - total, 2) AS below_peak\nFROM orders\nWINDOW w AS (ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)\nORDER BY created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p195"],
  },
  {
    id: "wf-p196",
    title: "Spend meter inside each category",
    brief:
      "Per expense category, chronological: show id, category, spent_on, amount_cents, and cat_so_far — the running category spend. Ordered by category then timeline.",
    difficulty: "medium",
    hints: [
      "SUM(amount_cents) OVER (PARTITION BY category ORDER BY spent_on ASC, id ASC ROWS …).",
      "Partition + running frame combine both skills.",
    ],
    solution:
      "SELECT id, category, spent_on, amount_cents,\n       SUM(amount_cents) OVER (PARTITION BY category ORDER BY spent_on ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cat_so_far\nFROM expenses\nORDER BY category, spent_on ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p196"],
  },
  {
    id: "wf-p197",
    title: "The cash book",
    brief:
      "Payments in date order (paid_on ASC, id ASC): show id, paid_on, amount_cents, and cash_in — the running total of collected cents. Ordered by the walk.",
    difficulty: "easy",
    hints: [
      "SUM(amount_cents) OVER (ORDER BY paid_on ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).",
      "The treasurer's daily running total.",
    ],
    solution:
      "SELECT id, paid_on, amount_cents,\n       SUM(amount_cents) OVER (ORDER BY paid_on ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cash_in\nFROM payments\nORDER BY paid_on ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p197"],
  },
  {
    id: "wf-p198",
    title: "Trailing five-basket average",
    brief:
      "Per customer: show id, customer_id, total, and ma5 — the average of their LAST 5 orders including this one (2 decimals; early orders average fewer). Ordered by customer_id then timeline.",
    difficulty: "hard",
    hints: [
      "AVG(total) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC ROWS BETWEEN 4 PRECEDING AND CURRENT ROW).",
      "ROWS BETWEEN 4 PRECEDING AND CURRENT ROW is the trailing five.",
    ],
    solution:
      "SELECT id, customer_id, total,\n       ROUND(AVG(total) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC ROWS BETWEEN 4 PRECEDING AND CURRENT ROW), 2) AS ma5\nFROM orders\nORDER BY customer_id, created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p198"],
  },
  {
    id: "wf-p199",
    title: "Orders so far this month",
    brief:
      "Show every order's id, month (strftime '%Y-%m'), created_at, and month_so_far — the running count of orders within THAT month (1 = first of the month). Ordered by month then timeline.",
    difficulty: "medium",
    hints: [
      "COUNT(*) OVER (PARTITION BY strftime('%Y-%m', created_at) ORDER BY created_at ASC, id ASC ROWS …).",
      "Partition by the month expression, running frame inside it.",
    ],
    solution:
      "SELECT id, strftime('%Y-%m', created_at) AS month, created_at,\n       COUNT(*) OVER (PARTITION BY strftime('%Y-%m', created_at) ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS month_so_far\nFROM orders\nORDER BY month, created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p199"],
  },
  {
    id: "wf-p200",
    title: "Order volume clock",
    brief:
      "Count orders per month, then add cum_orders — the running count across months (the volume twin of the revenue clock). Return month, orders, cum_orders, ordered by month.",
    difficulty: "easy",
    hints: [
      "CTE: GROUP BY month, COUNT(*). Then SUM(orders) OVER (ORDER BY month ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).",
      "Counts accumulate exactly like money does.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS orders\n  FROM orders\n  GROUP BY month\n)\nSELECT month, orders,\n       SUM(orders) OVER (ORDER BY month ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_orders\nFROM m\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p200"],
  },
  {
    id: "wf-p201",
    title: "Invoicing meter",
    brief:
      "Invoices in issue order (issued_on ASC, id ASC): show id, issued_on, amount_cents, and billed_so_far — the running invoice total in cents. Ordered by the walk.",
    difficulty: "easy",
    hints: [
      "SUM(amount_cents) OVER (ORDER BY issued_on ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).",
      "Same running-total skeleton, different table.",
    ],
    solution:
      "SELECT id, issued_on, amount_cents,\n       SUM(amount_cents) OVER (ORDER BY issued_on ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS billed_so_far\nFROM invoices\nORDER BY issued_on ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p201"],
  },
  {
    id: "wf-p202",
    title: "Two-month revenue pairs",
    brief:
      "Monthly revenue plus pair_sum — the sum of this month's and the previous month's revenue (2 decimals; first month is just itself). Frame: ROWS BETWEEN 1 PRECEDING AND CURRENT ROW. Ordered by month.",
    difficulty: "medium",
    hints: [
      "SUM(revenue) OVER (ORDER BY month ASC ROWS BETWEEN 1 PRECEDING AND CURRENT ROW).",
      "A two-row trailing window.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month, ROUND(revenue, 2) AS revenue,\n       ROUND(SUM(revenue) OVER (ORDER BY month ASC ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) AS pair_sum\nFROM m\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p202"],
  },
  {
    id: "wf-p203",
    title: "Book-wide net, entry by entry",
    brief:
      "Ledger by id: show id, account, and net_so_far — the running sum of (debit_cents - credit_cents) across the WHOLE book in id order. Ordered by id.",
    difficulty: "medium",
    hints: [
      "SUM(debit_cents - credit_cents) OVER (ORDER BY id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).",
      "No partition — one continuous walk.",
    ],
    solution:
      "SELECT id, account,\n       SUM(debit_cents - credit_cents) OVER (ORDER BY id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS net_so_far\nFROM ledger_entries\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p203"],
  },
  {
    id: "wf-p204",
    title: "Delivered revenue clock",
    brief:
      "Delivered orders only, chronological: show id, created_at, total, and delivered_running — the running delivered revenue (2 decimals). Ordered by the timeline.",
    difficulty: "medium",
    hints: [
      "WHERE status = 'delivered' first; the running SUM then only sees delivered rows.",
      "SUM(total) OVER (ORDER BY created_at ASC, id ASC ROWS UNBOUNDED PRECEDING…).",
    ],
    solution:
      "SELECT id, created_at, total,\n       ROUND(SUM(total) OVER (ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS delivered_running\nFROM orders\nWHERE status = 'delivered'\nORDER BY created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p204"],
  },
  {
    id: "wf-p205",
    title: "Vendor meters",
    brief:
      "Per expense vendor, chronological: show id, vendor, spent_on, amount_cents, and vendor_so_far — the running vendor spend. Ordered by vendor then timeline.",
    difficulty: "medium",
    hints: [
      "SUM(amount_cents) OVER (PARTITION BY vendor ORDER BY spent_on ASC, id ASC ROWS …).",
      "Partition by vendor, run the clock inside.",
    ],
    solution:
      "SELECT id, vendor, spent_on, amount_cents,\n       SUM(amount_cents) OVER (PARTITION BY vendor ORDER BY spent_on ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS vendor_so_far\nFROM expenses\nORDER BY vendor, spent_on ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p205"],
  },
  {
    id: "wf-p206",
    title: "Running versus lifetime",
    brief:
      "Per customer per order: show id, customer_id, total, cust_running (running spend) and cust_total (their lifetime total via an empty-partition window). The last row of each customer makes the two equal. Ordered by customer_id then timeline.",
    difficulty: "hard",
    hints: [
      "cust_running: SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC ROWS …).",
      "cust_total: SUM(total) OVER (PARTITION BY customer_id) — no ORDER BY means the whole partition.",
    ],
    solution:
      "SELECT id, customer_id, total,\n       ROUND(SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS cust_running,\n       ROUND(SUM(total) OVER (PARTITION BY customer_id), 2) AS cust_total\nFROM orders\nORDER BY customer_id, created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p206"],
  },
  {
    id: "wf-p207",
    title: "Three views of one series",
    brief:
      "Monthly revenue with three lenses: revenue (rounded), cum_revenue (running sum), and this_month (SUM over a frame that only covers the current row: ROWS BETWEEN CURRENT ROW AND CURRENT ROW). Ordered by month.",
    difficulty: "hard",
    hints: [
      "Three window calls over the same CTE with three different frames.",
      "The degenerate frame isolates the current row — a teaching device for how frames bound aggregation.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month, ROUND(revenue, 2) AS revenue,\n       ROUND(SUM(revenue) OVER (ORDER BY month ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS cum_revenue,\n       ROUND(SUM(revenue) OVER (ORDER BY month ASC ROWS BETWEEN CURRENT ROW AND CURRENT ROW), 2) AS this_month\nFROM m\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p207"],
  },
  {
    id: "wf-p208",
    title: "Customer count clock",
    brief:
      "Customers in creation order (created_at ASC, id ASC): show id, name, created_at, and customers_so_far — the running count of signups. Ordered by the walk.",
    difficulty: "easy",
    hints: [
      "COUNT(*) OVER (ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).",
      "A running integer clock over the signups.",
    ],
    solution:
      "SELECT id, name, created_at,\n       COUNT(*) OVER (ORDER BY created_at ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS customers_so_far\nFROM customers\nORDER BY created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p208"],
  },
  {
    id: "wf-p209",
    title: "Invoice meter within customer",
    brief:
      "Per customer, invoices in issue order: show id, customer_id, issued_on, amount_cents, and cust_billed_so_far — the running billed cents for that customer. Ordered by customer_id then issued_on.",
    difficulty: "medium",
    hints: [
      "SUM(amount_cents) OVER (PARTITION BY customer_id ORDER BY issued_on ASC, id ASC ROWS …).",
      "The AR version of the running spend meter.",
    ],
    solution:
      "SELECT id, customer_id, issued_on, amount_cents,\n       SUM(amount_cents) OVER (PARTITION BY customer_id ORDER BY issued_on ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cust_billed_so_far\nFROM invoices\nORDER BY customer_id, issued_on ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p209"],
  },
  {
    id: "wf-p210",
    title: "Trailing payment average",
    brief:
      "Payments in date order: show id, paid_on, amount_cents, and ma3 — the trailing 3-payment average in cents (2 decimals; early rows average fewer). Ordered by the walk (paid_on, id).",
    difficulty: "medium",
    hints: [
      "AVG(amount_cents) OVER (ORDER BY paid_on ASC, id ASC ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), rounded.",
      "Cents in, decimals out — ROUND handles the average.",
    ],
    solution:
      "SELECT id, paid_on, amount_cents,\n       ROUND(AVG(amount_cents) OVER (ORDER BY paid_on ASC, id ASC ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS ma3\nFROM payments\nORDER BY paid_on ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p210"],
  },
  {
    id: "wf-p211",
    title: "Order quartiles",
    brief:
      "Split all orders into 4 equal buckets by total (cheapest bucket = 1): show id, total, and tile — NTILE(4) over the price-ascending walk (ties: smaller id first). Ordered by total then id.",
    difficulty: "medium",
    hints: [
      "NTILE(4) OVER (ORDER BY total ASC, id ASC).",
      "103 orders into 4 tiles gives buckets of 26/26/26/25.",
    ],
    solution:
      "SELECT id, total, NTILE(4) OVER (ORDER BY total ASC, id ASC) AS tile\nFROM orders\nORDER BY total ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p211"],
  },
  {
    id: "wf-p212",
    title: "Good, better, premium",
    brief:
      "Split the catalog into 3 price tiers by price (ascending; tile 1 = cheapest): show name, price, and tier — NTILE(3). Ordered by price then name.",
    difficulty: "easy",
    hints: [
      "NTILE(3) OVER (ORDER BY price ASC, name ASC).",
      "16 products into 3 tiles gives 6/5/5.",
    ],
    solution:
      "SELECT name, price, NTILE(3) OVER (ORDER BY price ASC, name ASC) AS tier\nFROM products\nORDER BY price ASC, name ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p212"],
  },
  {
    id: "wf-p213",
    title: "Revenue halves",
    brief:
      "Stage monthly revenue and split the months into 2 buckets by revenue (ascending; 1 = weaker half): show month, revenue, and half — NTILE(2). Ordered by revenue then month.",
    difficulty: "medium",
    hints: [
      "NTILE(2) OVER (ORDER BY revenue ASC, month ASC) over the month CTE.",
      "14 months split 7/7.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month, ROUND(revenue, 2) AS revenue, NTILE(2) OVER (ORDER BY revenue ASC, month ASC) AS half\nFROM m\nORDER BY revenue ASC, month ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p213"],
  },
  {
    id: "wf-p214",
    title: "Invoice quartile labels",
    brief:
      "Bucket invoices into 4 amount tiers and LABEL them: show number, amount_cents, and quartile — 'Q1' (smallest) through 'Q4' (largest) via NTILE(4) plus a CASE. Ordered by amount then id.",
    difficulty: "medium",
    hints: [
      "Wrap NTILE(4) in a CASE in an outer layer, or CASE over the window directly in the SELECT list.",
      "CASE WHEN NTILE(4) OVER (ORDER BY amount_cents ASC, id ASC) = 1 THEN 'Q1' … END AS quartile",
    ],
    solution:
      "SELECT number, amount_cents,\n       CASE NTILE(4) OVER (ORDER BY amount_cents ASC, id ASC)\n         WHEN 1 THEN 'Q1' WHEN 2 THEN 'Q2' WHEN 3 THEN 'Q3' ELSE 'Q4'\n       END AS quartile\nFROM invoices\nORDER BY amount_cents ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p214"],
  },
  {
    id: "wf-p215",
    title: "Price tiles inside each category",
    brief:
      "Within EACH category, split products into 2 price tiles (ascending; 1 = cheaper half): show name, category, price, and tile — NTILE(2) partitioned by category. Ordered by category then price.",
    difficulty: "medium",
    hints: [
      "NTILE(2) OVER (PARTITION BY category ORDER BY price ASC, name ASC).",
      "The tile counter resets per category.",
    ],
    solution:
      "SELECT name, category, price, NTILE(2) OVER (PARTITION BY category ORDER BY price ASC, name ASC) AS tile\nFROM products\nORDER BY category, price ASC, name ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p215"],
  },
  {
    id: "wf-p216",
    title: "Cumulative distribution of baskets",
    brief:
      "For every order show id, total, and cum_dist — CUME_DIST over the total-ascending walk (the fraction of orders with total ≤ this one), rounded to 4 decimals. The last row must read 1.0. Ordered by total then id.",
    difficulty: "medium",
    hints: [
      "ROUND(CUME_DIST() OVER (ORDER BY total ASC, id ASC), 4).",
      "CUME_DIST always peaks at 1.0 on the final peer group.",
    ],
    solution:
      "SELECT id, total, ROUND(CUME_DIST() OVER (ORDER BY total ASC, id ASC), 4) AS cum_dist\nFROM orders\nORDER BY total ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p216"],
  },
  {
    id: "wf-p217",
    title: "Percent rank of baskets",
    brief:
      "For every order show id, total, and pr — PERCENT_RANK over the total-ascending walk ((rank-1)/(rows-1)), rounded to 4 decimals. The first row is 0.0, the last 1.0. Ordered by total then id.",
    difficulty: "medium",
    hints: [
      "ROUND(PERCENT_RANK() OVER (ORDER BY total ASC, id ASC), 4).",
      "Unlike CUME_DIST, PERCENT_RANK starts at exactly 0.",
    ],
    solution:
      "SELECT id, total, ROUND(PERCENT_RANK() OVER (ORDER BY total ASC, id ASC), 4) AS pr\nFROM orders\nORDER BY total ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p217"],
  },
  {
    id: "wf-p218",
    title: "Two percentiles side by side",
    brief:
      "For every product show name, price, cd (CUME_DIST) and pr (PERCENT_RANK), both over the price-ascending walk, both rounded to 4 decimals. Ordered by price then name.",
    difficulty: "medium",
    hints: [
      "Two window calls over the same ORDER BY price ASC, name ASC.",
      "Compare the first rows: cd > 0 but pr = 0.",
    ],
    solution:
      "SELECT name, price,\n       ROUND(CUME_DIST() OVER (ORDER BY price ASC, name ASC), 4) AS cd,\n       ROUND(PERCENT_RANK() OVER (ORDER BY price ASC, name ASC), 4) AS pr\nFROM products\nORDER BY price ASC, name ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p218"],
  },
  {
    id: "wf-p219",
    title: "Price distribution within category",
    brief:
      "For every product show name, category, price, and cat_cd — CUME_DIST of price within its category (4 decimals). Ordered by category then price.",
    difficulty: "medium",
    hints: [
      "CUME_DIST() OVER (PARTITION BY category ORDER BY price ASC, name ASC).",
      "Each category's distribution independently reaches 1.0.",
    ],
    solution:
      "SELECT name, category, price, ROUND(CUME_DIST() OVER (PARTITION BY category ORDER BY price ASC, name ASC), 4) AS cat_cd\nFROM products\nORDER BY category, price ASC, name ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p219"],
  },
  {
    id: "wf-p220",
    title: "My baskets, percentile ranked",
    brief:
      "For every order show id, customer_id, total, and my_pr — PERCENT_RANK of the total within THAT customer's orders (4 decimals). Single-order customers read 0.0. Ordered by customer_id then total.",
    difficulty: "medium",
    hints: [
      "PERCENT_RANK() OVER (PARTITION BY customer_id ORDER BY total ASC, id ASC).",
      "One row in the partition makes (rank-1)/(rows-1) = 0/0 — SQL returns 0.",
    ],
    solution:
      "SELECT id, customer_id, total, ROUND(PERCENT_RANK() OVER (PARTITION BY customer_id ORDER BY total ASC, id ASC), 4) AS my_pr\nFROM orders\nORDER BY customer_id, total ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p220"],
  },
  {
    id: "wf-p221",
    title: "Top-quarter spenders",
    brief:
      "Rank customers by lifetime spend, split into 4 tiles, and keep tile 4 (the top quarter): show name, spend (2 decimals), and tile. Ordered by spend DESC.",
    difficulty: "hard",
    hints: [
      "CTE for spend, then NTILE(4) OVER (ORDER BY spend DESC) — tile 4 is the top quarter when you rank DESC.",
      "Filter tiles in an outer layer: WHERE tile = 4.",
    ],
    solution:
      "WITH s AS (\n  SELECT c.name, SUM(o.total) AS spend\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n),\nt AS (\n  SELECT name, spend, NTILE(4) OVER (ORDER BY spend DESC, name ASC) AS tile\n  FROM s\n)\nSELECT name, ROUND(spend, 2) AS spend, tile\nFROM t\nWHERE tile = 4\nORDER BY spend DESC, name ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p221"],
  },
  {
    id: "wf-p222",
    title: "Month revenue percentiles",
    brief:
      "Stage monthly revenue; show month, revenue, and pr — PERCENT_RANK of the month's revenue among months (4 decimals). Ordered by revenue then month.",
    difficulty: "medium",
    hints: [
      "PERCENT_RANK() OVER (ORDER BY revenue ASC, month ASC) over the CTE.",
      "Tied revenues share the same percent rank.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month, ROUND(revenue, 2) AS revenue, ROUND(PERCENT_RANK() OVER (ORDER BY revenue ASC, month ASC), 4) AS pr\nFROM m\nORDER BY revenue ASC, month ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p222"],
  },
  {
    id: "wf-p223",
    title: "Stock distribution",
    brief:
      "For every product show name, stock, and cd — CUME_DIST over stock DESCENDING (the fraction of products with stock ≥ this one), 4 decimals. Ordered by stock DESC then name.",
    difficulty: "medium",
    hints: [
      "CUME_DIST() OVER (ORDER BY stock DESC, name ASC).",
      "Direction flips the meaning: 1.0 lands on the deepest shelf.",
    ],
    solution:
      "SELECT name, stock, ROUND(CUME_DIST() OVER (ORDER BY stock DESC, name ASC), 4) AS cd\nFROM products\nORDER BY stock DESC, name ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p223"],
  },
  {
    id: "wf-p224",
    title: "Expense quintiles",
    brief:
      "Split expenses into 5 amount buckets: show id, category, amount_cents, and quintile — NTILE(5) over amount ascending (ties by id). Ordered by amount then id.",
    difficulty: "easy",
    hints: [
      "NTILE(5) OVER (ORDER BY amount_cents ASC, id ASC).",
      "36 expenses into 5 tiles gives 8/7/7/7/7.",
    ],
    solution:
      "SELECT id, category, amount_cents, NTILE(5) OVER (ORDER BY amount_cents ASC, id ASC) AS quintile\nFROM expenses\nORDER BY amount_cents ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p224"],
  },
  {
    id: "wf-p225",
    title: "The heavier half of invoices",
    brief:
      "Keep only invoices in the heavier half by amount: show number, amount_cents, and cd where CUME_DIST (amount ascending) is at least 0.5. Return them ordered by amount then id.",
    difficulty: "hard",
    hints: [
      "CUME_DIST in a CTE/derived table, then WHERE cd >= 0.5 outside.",
      "WHERE can't filter a window directly — stage it first.",
    ],
    solution:
      "WITH d AS (\n  SELECT id, number, amount_cents, CUME_DIST() OVER (ORDER BY amount_cents ASC, id ASC) AS cd\n  FROM invoices\n)\nSELECT number, amount_cents, ROUND(cd, 4) AS cd\nFROM d\nWHERE cd >= 0.5\nORDER BY amount_cents ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p225"],
  },
  {
    id: "wf-p226",
    title: "Tiles within each status",
    brief:
      "Within each status, bucket orders into 2 groups by total (ascending; 1 = smaller half): show id, status, total, and tile — NTILE(2) partitioned by status. Ordered by status then total.",
    difficulty: "medium",
    hints: [
      "NTILE(2) OVER (PARTITION BY status ORDER BY total ASC, id ASC).",
      "Odd-sized partitions give the extra row to the EARLIER tiles.",
    ],
    solution:
      "SELECT id, status, total, NTILE(2) OVER (PARTITION BY status ORDER BY total ASC, id ASC) AS tile\nFROM orders\nORDER BY status, total ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p226"],
  },
  {
    id: "wf-p227",
    title: "Where this month stands",
    brief:
      "Monthly revenue with pr — PERCENT_RANK among months (4 decimals) — and cd — CUME_DIST (4 decimals). Return month, revenue, pr, cd, ordered by revenue then month.",
    difficulty: "medium",
    hints: [
      "Both functions over ORDER BY revenue ASC, month ASC on the CTE.",
      "Same walk, two statistics.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month, ROUND(revenue, 2) AS revenue,\n       ROUND(PERCENT_RANK() OVER (ORDER BY revenue ASC, month ASC), 4) AS pr,\n       ROUND(CUME_DIST() OVER (ORDER BY revenue ASC, month ASC), 4) AS cd\nFROM m\nORDER BY revenue ASC, month ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p227"],
  },
  {
    id: "wf-p228",
    title: "Spend distribution of the customer base",
    brief:
      "Stage per-customer lifetime spend; show name, spend (2 decimals), and cd — CUME_DIST over spend ascending (4 decimals). Ordered by spend then name.",
    difficulty: "hard",
    hints: [
      "CTE: JOIN + GROUP BY customer. CUME_DIST() OVER (ORDER BY spend ASC, name ASC).",
      "The biggest spender's cd is 1.0.",
    ],
    solution:
      "WITH s AS (\n  SELECT c.name, SUM(o.total) AS spend\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n)\nSELECT name, ROUND(spend, 2) AS spend, ROUND(CUME_DIST() OVER (ORDER BY spend ASC, name ASC), 4) AS cd\nFROM s\nORDER BY spend ASC, name ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p228"],
  },
  {
    id: "wf-p229",
    title: "Invoice deciles",
    brief:
      "Split invoices into 10 amount tiles (ascending): show number, amount_cents, and decile — NTILE(10). Ordered by amount then id.",
    difficulty: "easy",
    hints: [
      "NTILE(10) OVER (ORDER BY amount_cents ASC, id ASC).",
      "28 invoices across 10 tiles: earlier tiles get 3, later ones 2.",
    ],
    solution:
      "SELECT number, amount_cents, NTILE(10) OVER (ORDER BY amount_cents ASC, id ASC) AS decile\nFROM invoices\nORDER BY amount_cents ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p229"],
  },
  {
    id: "wf-p230",
    title: "Price percentile ladder",
    brief:
      "For every product show name, price, and pr — PERCENT_RANK over price ascending (4 decimals). The cheapest product must read 0.0 and the dearest 1.0. Ordered by price then name.",
    difficulty: "easy",
    hints: [
      "PERCENT_RANK() OVER (ORDER BY price ASC, name ASC).",
      "With no ties, the ladder runs smoothly 0 → 1.",
    ],
    solution:
      "SELECT name, price, ROUND(PERCENT_RANK() OVER (ORDER BY price ASC, name ASC), 4) AS pr\nFROM products\nORDER BY price ASC, name ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p230"],
  },
  {
    id: "wf-p231",
    title: "Supplier price distributions",
    brief:
      "Join products to suppliers: show product name, supplier name, price, and sup_cd — CUME_DIST of price within that supplier's catalog (4 decimals). Ordered by supplier then price.",
    difficulty: "medium",
    hints: [
      "CUME_DIST() OVER (PARTITION BY s.name ORDER BY p.price ASC, p.name ASC) after the join.",
      "Each supplier's distribution peaks at 1.0 independently.",
    ],
    solution:
      "SELECT p.name, s.name AS supplier, p.price,\n       ROUND(CUME_DIST() OVER (PARTITION BY s.name ORDER BY p.price ASC, p.name ASC), 4) AS sup_cd\nFROM products p\nJOIN suppliers s ON s.id = p.supplier_id\nORDER BY supplier, p.price ASC, p.name ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p231"],
  },
  {
    id: "wf-p232",
    title: "Ledger debit tiles",
    brief:
      "Split ledger entries into 4 tiles by debit_cents (ascending, ties by id): show id, account, debit_cents, and tile — NTILE(4). Ordered by debit then id.",
    difficulty: "easy",
    hints: [
      "NTILE(4) OVER (ORDER BY debit_cents ASC, id ASC).",
      "Zero-credit entries (debits 0) sink to tile 1.",
    ],
    solution:
      "SELECT id, account, debit_cents, NTILE(4) OVER (ORDER BY debit_cents ASC, id ASC) AS tile\nFROM ledger_entries\nORDER BY debit_cents ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p232"],
  },
  {
    id: "wf-p233",
    title: "Quartile and distribution together",
    brief:
      "For every invoice show number, amount_cents, tile (NTILE(4) by amount ASC) and cd (CUME_DIST, 4 decimals) — the bucket AND the position in one row. Ordered by amount then id.",
    difficulty: "medium",
    hints: [
      "Two window calls over ORDER BY amount_cents ASC, id ASC.",
      "Tiles segment; distribution locates.",
    ],
    solution:
      "SELECT number, amount_cents,\n       NTILE(4) OVER (ORDER BY amount_cents ASC, id ASC) AS tile,\n       ROUND(CUME_DIST() OVER (ORDER BY amount_cents ASC, id ASC), 4) AS cd\nFROM invoices\nORDER BY amount_cents ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p233"],
  },
  {
    id: "wf-p234",
    title: "Category price percent-rank",
    brief:
      "For every product show name, category, price, and cat_pr — PERCENT_RANK of price within its category (4 decimals). Ordered by category then price.",
    difficulty: "medium",
    hints: [
      "PERCENT_RANK() OVER (PARTITION BY category ORDER BY price ASC, name ASC).",
      "Solo products in a category read 0.0.",
    ],
    solution:
      "SELECT name, category, price, ROUND(PERCENT_RANK() OVER (PARTITION BY category ORDER BY price ASC, name ASC), 4) AS cat_pr\nFROM products\nORDER BY category, price ASC, name ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p234"],
  },
  {
    id: "wf-p235",
    title: "Below the spend median",
    brief:
      "Stage per-customer spend and keep the lower half: show name, spend (2 decimals), and cd where CUME_DIST (spend ascending) ≤ 0.5. Ordered by spend then name.",
    difficulty: "hard",
    hints: [
      "CUME_DIST in a CTE, filter cd <= 0.5 outside.",
      "Ties at the boundary stay because <= is inclusive.",
    ],
    solution:
      "WITH s AS (\n  SELECT c.name, SUM(o.total) AS spend\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n),\nd AS (\n  SELECT name, spend, CUME_DIST() OVER (ORDER BY spend ASC, name ASC) AS cd\n  FROM s\n)\nSELECT name, ROUND(spend, 2) AS spend, ROUND(cd, 4) AS cd\nFROM d\nWHERE cd <= 0.5\nORDER BY spend ASC, name ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p235"],
  },
  {
    id: "wf-p236",
    title: "Revenue tiles by month",
    brief:
      "Stage monthly revenue and bucket the months into 4 revenue tiles (ascending): show month, revenue, and tile — NTILE(4). Ordered by revenue then month.",
    difficulty: "easy",
    hints: [
      "NTILE(4) OVER (ORDER BY revenue ASC, month ASC) over the CTE.",
      "14 months → tiles of 4/4/3/3.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month, ROUND(revenue, 2) AS revenue, NTILE(4) OVER (ORDER BY revenue ASC, month ASC) AS tile\nFROM m\nORDER BY revenue ASC, month ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p236"],
  },
  {
    id: "wf-p237",
    title: "Line-value distribution",
    brief:
      "For every order_items line show id, line_value (quantity * unit_price, 2 decimals) and cd — CUME_DIST over line_value ascending (4 decimals). Ordered by line_value then id.",
    difficulty: "medium",
    hints: [
      "ROUND(quantity * unit_price, 2) plus CUME_DIST() OVER (ORDER BY the same expression ASC, id ASC), 4 decimals.",
      "Order the distribution by the computed expression, not the rounded alias.",
    ],
    solution:
      "SELECT id, ROUND(quantity * unit_price, 2) AS line_value,\n       ROUND(CUME_DIST() OVER (ORDER BY quantity * unit_price ASC, id ASC), 4) AS cd\nFROM order_items\nORDER BY quantity * unit_price ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p237"],
  },
  {
    id: "wf-p238",
    title: "Old half vs new half",
    brief:
      "Within each customer's orders, split chronologically into 2 tiles (1 = older half): show id, customer_id, created_at, and era — NTILE(2) partitioned by customer, ordered by created_at ASC, id ASC. Ordered by customer then created_at.",
    difficulty: "medium",
    hints: [
      "NTILE(2) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC).",
      "A customer with 5 orders lands 3 in era 1 and 2 in era 2.",
    ],
    solution:
      "SELECT id, customer_id, created_at, NTILE(2) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS era\nFROM orders\nORDER BY customer_id, created_at ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p238"],
  },
  {
    id: "wf-p239",
    title: "Share and standing",
    brief:
      "Monthly revenue with pct (this month's share of the year-and-a-bit total, 2 decimals) and pr (PERCENT_RANK among months, 4 decimals). Return month, revenue, pct, pr, ordered by month.",
    difficulty: "hard",
    hints: [
      "pct: 100.0 * revenue / SUM(revenue) OVER (); pr: PERCENT_RANK() OVER (ORDER BY revenue ASC, month ASC).",
      "One CTE, two different windows — an aggregate window plus a ranking window.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month, ROUND(revenue, 2) AS revenue,\n       ROUND(100.0 * revenue / SUM(revenue) OVER (), 2) AS pct,\n       ROUND(PERCENT_RANK() OVER (ORDER BY revenue ASC, month ASC), 4) AS pr\nFROM m\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p239"],
  },
  {
    id: "wf-p240",
    title: "Payment quartiles",
    brief:
      "Bucket payments into 4 amount tiles (ascending; ties by id): show id, method, amount_cents, and tile — NTILE(4). Ordered by amount then id.",
    difficulty: "easy",
    hints: [
      "NTILE(4) OVER (ORDER BY amount_cents ASC, id ASC).",
      "27 payments → tiles of 7/7/7/6.",
    ],
    solution:
      "SELECT id, method, amount_cents, NTILE(4) OVER (ORDER BY amount_cents ASC, id ASC) AS tile\nFROM payments\nORDER BY amount_cents ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p240"],
  },
];