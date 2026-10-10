// Window-functions problem bank A — wf-p001…wf-p060.
// G1 "OVER() fundamentals" (p001–030): aggregates that keep every row.
// G2 "ROW_NUMBER" (p031–060): sequencing, dedup, top-N, latest-per-group.
// All solutions are graded live against the seed db by wf-gen-expected.
import type { Problem } from "../types";
import { EXPECTED_WF } from "./expected-wf";

export const problemsWfA: Problem[] = [
  {
    id: "wf-p001",
    title: "Revenue on every row",
    brief:
      "Finance wants the grand revenue total echoed next to every order — no collapsing. Return every order's id, its total, and the company-wide revenue as grand_total (sum of all order totals, rounded to 2 decimals). Keep rows in id order.",
    difficulty: "easy",
    hints: [
      "An aggregate with an empty OVER () window aggregates ALL rows but does not group them — every input row survives.",
      "SELECT id, total, ROUND(SUM(total) OVER (), 2) AS grand_total FROM orders …",
    ],
    solution:
      "SELECT id, total, ROUND(SUM(total) OVER (), 2) AS grand_total\nFROM orders\nORDER BY id;",
    ordered: true,
    mistakes: [
      {
        test: "GROUP\\s+BY",
        message: "GROUP BY collapses one row per group — the whole point of OVER () is to keep every order row.",
      },
    ],
    expected: EXPECTED_WF["wf-p001"],
  },
  {
    id: "wf-p002",
    title: "Catalog average, row by row",
    brief:
      "Pricing review: list every product's name and price with the catalog-wide average price alongside as catalog_avg (rounded to 2 decimals). One row per product, sorted by product id.",
    difficulty: "easy",
    hints: [
      "AVG(price) OVER () computes the mean over the whole set while keeping each product row.",
      "SELECT name, price, ROUND(AVG(price) OVER (), 2) AS catalog_avg FROM products …",
    ],
    solution:
      "SELECT name, price, ROUND(AVG(price) OVER (), 2) AS catalog_avg\nFROM products\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p002"],
  },
  {
    id: "wf-p003",
    title: "Count without collapsing",
    brief:
      "Show every order's id and status with the total number of orders in the table as all_orders on each row. A GROUP BY would erase the per-order detail — a windowed COUNT will not. Sort by id.",
    difficulty: "easy",
    hints: [
      "COUNT(*) OVER () counts every row of the result set without grouping.",
      "SELECT id, status, COUNT(*) OVER () AS all_orders FROM orders ORDER BY id;",
    ],
    solution: "SELECT id, status, COUNT(*) OVER () AS all_orders\nFROM orders\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p003"],
  },
  {
    id: "wf-p004",
    title: "How far below the peak",
    brief:
      "For delivered orders only, show id, total, and below_peak — the gap between the largest delivered total and this order's total (rounded to 2 decimals). Sort by id.",
    difficulty: "easy",
    hints: [
      "MAX(total) OVER () repeats the peak on every row; subtract the row's own total from it.",
      "SELECT id, total, ROUND(MAX(total) OVER () - total, 2) AS below_peak FROM orders WHERE status = 'delivered' …",
    ],
    solution:
      "SELECT id, total, ROUND(MAX(total) OVER () - total, 2) AS below_peak\nFROM orders\nWHERE status = 'delivered'\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p004"],
  },
  {
    id: "wf-p005",
    title: "Shipped spread",
    brief:
      "Merchandising wants the spread of shipped-order values on every row. For status = 'shipped', return id, total, min_total (smallest shipped total) and max_total (largest shipped total), both rounded to 2 decimals. Sort by id.",
    difficulty: "easy",
    hints: [
      "Two window aggregates side by side: MIN(total) OVER () and MAX(total) OVER ().",
      "SELECT id, total, ROUND(MIN(total) OVER (), 2) AS min_total, … FROM orders WHERE status = 'shipped' …",
    ],
    solution:
      "SELECT id, total, ROUND(MIN(total) OVER (), 2) AS min_total, ROUND(MAX(total) OVER (), 2) AS max_total\nFROM orders\nWHERE status = 'shipped'\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p005"],
  },
  {
    id: "wf-p006",
    title: "Share of total spend",
    brief:
      "Expense report: for every expense show id, category, and pct_of_spend — the expense's amount_cents as a percentage of ALL expense spend, rounded to 2 decimals. Sort by id.",
    difficulty: "medium",
    hints: [
      "Multiply by 100.0 BEFORE dividing so integer cents don't truncate, then divide by the windowed grand sum.",
      "SELECT id, category, ROUND(100.0 * amount_cents / SUM(amount_cents) OVER (), 2) AS pct_of_spend FROM expenses …",
    ],
    solution:
      "SELECT id, category, ROUND(100.0 * amount_cents / SUM(amount_cents) OVER (), 2) AS pct_of_spend\nFROM expenses\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p006"],
  },
  {
    id: "wf-p007",
    title: "Versus the typical payment",
    brief:
      "Cash ops: for each payment show id, method, amount_cents, and delta_avg — how much the payment differs from the average payment amount (amount minus average, rounded to 2 decimals; negative means below typical). Sort by id.",
    difficulty: "medium",
    hints: [
      "AVG(amount_cents) OVER () carries the mean payment onto every row; subtract and round.",
      "SELECT id, method, amount_cents, ROUND(amount_cents - AVG(amount_cents) OVER (), 2) AS delta_avg FROM payments …",
    ],
    solution:
      "SELECT id, method, amount_cents, ROUND(amount_cents - AVG(amount_cents) OVER (), 2) AS delta_avg\nFROM payments\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p007"],
  },
  {
    id: "wf-p008",
    title: "The whole book, per entry",
    brief:
      "Ledger check: show every entry's id, account, debit_cents, credit_cents, plus total_debits and total_credits — the sums across the entire book — on each row. Sort by id.",
    difficulty: "easy",
    hints: [
      "Two empty-window sums: SUM(debit_cents) OVER () and SUM(credit_cents) OVER ().",
      "SELECT id, account, debit_cents, credit_cents, SUM(debit_cents) OVER () AS total_debits, … FROM ledger_entries …",
    ],
    solution:
      "SELECT id, account, debit_cents, credit_cents, SUM(debit_cents) OVER () AS total_debits, SUM(credit_cents) OVER () AS total_credits\nFROM ledger_entries\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p008"],
  },
  {
    id: "wf-p009",
    title: "Distance from the biggest invoice",
    brief:
      "AR review: for each invoice show id, amount_cents, and below_top — the difference between the largest invoice amount and this invoice's amount. Sort by id.",
    difficulty: "easy",
    hints: [
      "MAX(amount_cents) OVER () is the flagship invoice; the gap is that minus the row's own amount.",
      "SELECT id, amount_cents, MAX(amount_cents) OVER () - amount_cents AS below_top FROM invoices …",
    ],
    solution:
      "SELECT id, amount_cents, MAX(amount_cents) OVER () - amount_cents AS below_top\nFROM invoices\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p009"],
  },
  {
    id: "wf-p010",
    title: "Price ladder facts",
    brief:
      "For every product show name, price, max_price (the dearest price in the catalog), and product_count (how many products exist) — all on one row per product. Sort by id.",
    difficulty: "easy",
    hints: [
      "Window aggregates can be mixed freely on one SELECT: MAX(price) OVER () and COUNT(*) OVER ().",
      "SELECT name, price, MAX(price) OVER () AS max_price, COUNT(*) OVER () AS product_count FROM products …",
    ],
    solution:
      "SELECT name, price, MAX(price) OVER () AS max_price, COUNT(*) OVER () AS product_count\nFROM products\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p010"],
  },
  {
    id: "wf-p011",
    title: "Delivered: value and volume",
    brief:
      "On every delivered order show id, total, delivered_revenue (sum of delivered totals) and delivered_count (how many delivered orders). Sort by id.",
    difficulty: "easy",
    hints: [
      "The WHERE narrows the rows first; the empty windows then aggregate exactly those delivered rows.",
      "SELECT id, total, ROUND(SUM(total) OVER (), 2) AS delivered_revenue, COUNT(*) OVER () AS delivered_count FROM orders WHERE status = 'delivered' …",
    ],
    solution:
      "SELECT id, total, ROUND(SUM(total) OVER (), 2) AS delivered_revenue, COUNT(*) OVER () AS delivered_count\nFROM orders\nWHERE status = 'delivered'\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p011"],
  },
  {
    id: "wf-p012",
    title: "2024 in two numbers",
    brief:
      "For orders placed in 2024 (created_at in that year), show id, total, year_revenue (sum of 2024 totals, 2 decimals) and year_avg (mean 2024 total, 2 decimals) on every row. Sort by id.",
    difficulty: "easy",
    hints: [
      "Filter with strftime('%Y', created_at) = '2024' (or a BETWEEN on dates); the windows see only filtered rows.",
      "SELECT id, total, ROUND(SUM(total) OVER (), 2) AS year_revenue, … FROM orders WHERE strftime('%Y', created_at) = '2024' …",
    ],
    solution:
      "SELECT id, total, ROUND(SUM(total) OVER (), 2) AS year_revenue, ROUND(AVG(total) OVER (), 2) AS year_avg\nFROM orders\nWHERE strftime('%Y', created_at) = '2024'\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p012"],
  },
  {
    id: "wf-p013",
    title: "Counting customers, active or not",
    brief:
      "Show every customer's name and active flag, with all_customers (total customer rows) and active_customers (rows where active = 1) as two windowed counts on each row. Use FILTER inside the window for the active count. Sort by id.",
    difficulty: "hard",
    hints: [
      "SQLite window aggregates accept FILTER: COUNT(*) FILTER (WHERE active = 1) OVER ().",
      "SELECT name, active, COUNT(*) OVER () AS all_customers, COUNT(*) FILTER (WHERE active = 1) OVER () AS active_customers FROM customers …",
    ],
    solution:
      "SELECT name, active, COUNT(*) OVER () AS all_customers, COUNT(*) FILTER (WHERE active = 1) OVER () AS active_customers\nFROM customers\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p013"],
  },
  {
    id: "wf-p014",
    title: "Units behind every line",
    brief:
      "Order lines: for each order_items row show id, quantity, and total_units — the sum of quantity across every line in the table. Sort by id.",
    difficulty: "easy",
    hints: [
      "SUM(quantity) OVER () totals the quantity column while preserving one row per line item.",
      "SELECT id, quantity, SUM(quantity) OVER () AS total_units FROM order_items ORDER BY id;",
    ],
    solution: "SELECT id, quantity, SUM(quantity) OVER () AS total_units\nFROM order_items\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p014"],
  },
  {
    id: "wf-p015",
    title: "Line vs entire book of lines",
    brief:
      "For each order_items row show id, line_value (quantity * unit_price, 2 decimals) and book_value (that expression summed over ALL rows, 2 decimals). Sort by id.",
    difficulty: "medium",
    hints: [
      "Repeat the quantity * unit_price expression outside and inside the window: SUM(quantity * unit_price) OVER ().",
      "SELECT id, ROUND(quantity * unit_price, 2) AS line_value, ROUND(SUM(quantity * unit_price) OVER (), 2) AS book_value FROM order_items …",
    ],
    solution:
      "SELECT id, ROUND(quantity * unit_price, 2) AS line_value, ROUND(SUM(quantity * unit_price) OVER (), 2) AS book_value\nFROM order_items\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p015"],
  },
  {
    id: "wf-p016",
    title: "Ticket vs typical ticket",
    brief:
      "For every order show id and ticket_ratio — the order's total divided by the average order total, rounded to 2 decimals. A ratio above 1 means bigger than a typical basket. Sort by id.",
    difficulty: "medium",
    hints: [
      "Divide the row's total by AVG(total) OVER (); cast with 1.0 * if needed to avoid integer math.",
      "SELECT id, ROUND(total / AVG(total) OVER (), 2) AS ticket_ratio FROM orders ORDER BY id;",
    ],
    solution: "SELECT id, ROUND(total / AVG(total) OVER (), 2) AS ticket_ratio\nFROM orders\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p016"],
  },
  {
    id: "wf-p017",
    title: "Flag the big baskets",
    brief:
      "Return every order's id, total, and size_tag: 'big' when the total is strictly greater than the average order total (windowed), otherwise 'normal'. Sort by id.",
    difficulty: "medium",
    hints: [
      "CASE can compare against a window aggregate computed in the same SELECT.",
      "SELECT id, total, CASE WHEN total > AVG(total) OVER () THEN 'big' ELSE 'normal' END AS size_tag FROM orders …",
    ],
    solution:
      "SELECT id, total, CASE WHEN total > AVG(total) OVER () THEN 'big' ELSE 'normal' END AS size_tag\nFROM orders\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p017"],
  },
  {
    id: "wf-p018",
    title: "Invoices against the mean",
    brief:
      "For each invoice show number, amount_cents, and vs_mean — the amount minus the average invoice amount, rounded to 2 decimals. Sort by id.",
    difficulty: "easy",
    hints: [
      "amount_cents - AVG(amount_cents) OVER () gives a signed distance from the mean.",
      "SELECT number, amount_cents, ROUND(amount_cents - AVG(amount_cents) OVER (), 2) AS vs_mean FROM invoices …",
    ],
    solution:
      "SELECT number, amount_cents, ROUND(amount_cents - AVG(amount_cents) OVER (), 2) AS vs_mean\nFROM invoices\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p018"],
  },
  {
    id: "wf-p019",
    title: "The price corridor",
    brief:
      "Catalog: show every product's name and price with min_price and max_price — the cheapest and dearest prices in the whole catalog — on each row. Sort by id.",
    difficulty: "easy",
    hints: [
      "MIN(price) OVER () and MAX(price) OVER () bracket the corridor; no GROUP BY needed.",
      "SELECT name, price, MIN(price) OVER () AS min_price, MAX(price) OVER () AS max_price FROM products …",
    ],
    solution:
      "SELECT name, price, MIN(price) OVER () AS min_price, MAX(price) OVER () AS max_price\nFROM products\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p019"],
  },
  {
    id: "wf-p020",
    title: "Rent line by line",
    brief:
      "For every Rent expense show id, spent_on, amount_cents, and rent_total — the sum of all Rent amounts. Filter inside WHERE so the window only sees Rent rows. Sort by id.",
    difficulty: "easy",
    hints: [
      "WHERE category = 'Rent' narrows the set; SUM(amount_cents) OVER () then totals exactly those rows.",
      "SELECT id, spent_on, amount_cents, SUM(amount_cents) OVER () AS rent_total FROM expenses WHERE category = 'Rent' …",
    ],
    solution:
      "SELECT id, spent_on, amount_cents, SUM(amount_cents) OVER () AS rent_total\nFROM expenses\nWHERE category = 'Rent'\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p020"],
  },
  {
    id: "wf-p021",
    title: "Shipped snapshot",
    brief:
      "On every shipped order show id, total, shipped_revenue (sum of shipped totals, 2 decimals) and shipped_count (count of shipped orders). Sort by id.",
    difficulty: "easy",
    hints: [
      "Same pattern as the delivered snapshot, but the WHERE keeps status = 'shipped'.",
      "SELECT id, total, ROUND(SUM(total) OVER (), 2) AS shipped_revenue, COUNT(*) OVER () AS shipped_count FROM orders WHERE status = 'shipped' …",
    ],
    solution:
      "SELECT id, total, ROUND(SUM(total) OVER (), 2) AS shipped_revenue, COUNT(*) OVER () AS shipped_count\nFROM orders\nWHERE status = 'shipped'\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p021"],
  },
  {
    id: "wf-p022",
    title: "Net movement, whole book",
    brief:
      "Ledger: for every entry show id, entry_date, net (debit_cents - credit_cents) and book_net — the net summed across ALL entries. Sort by id.",
    difficulty: "medium",
    hints: [
      "Compute the row's net inline, then window-sum the same expression: SUM(debit_cents - credit_cents) OVER ().",
      "SELECT id, entry_date, debit_cents - credit_cents AS net, SUM(debit_cents - credit_cents) OVER () AS book_net FROM ledger_entries …",
    ],
    solution:
      "SELECT id, entry_date, debit_cents - credit_cents AS net, SUM(debit_cents - credit_cents) OVER () AS book_net\nFROM ledger_entries\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p022"],
  },
  {
    id: "wf-p023",
    title: "Share of the shelf",
    brief:
      "Inventory: for each product show name, stock, and pct_of_stock — the product's stock as a percent of ALL stocked units (rounded to 2 decimals). Sort by id.",
    difficulty: "medium",
    hints: [
      "100.0 * stock / SUM(stock) OVER () — multiply first to dodge integer division.",
      "SELECT name, stock, ROUND(100.0 * stock / SUM(stock) OVER (), 2) AS pct_of_stock FROM products …",
    ],
    solution:
      "SELECT name, stock, ROUND(100.0 * stock / SUM(stock) OVER (), 2) AS pct_of_stock\nFROM products\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p023"],
  },
  {
    id: "wf-p024",
    title: "Payment extremes together",
    brief:
      "For every payment show id, method, amount_cents, min_payment (smallest payment made) and max_payment (largest payment made), side by side on each row. Sort by id.",
    difficulty: "easy",
    hints: [
      "MIN and MAX with empty OVER () both see the entire payments table on every row.",
      "SELECT id, method, amount_cents, MIN(amount_cents) OVER () AS min_payment, MAX(amount_cents) OVER () AS max_payment FROM payments …",
    ],
    solution:
      "SELECT id, method, amount_cents, MIN(amount_cents) OVER () AS min_payment, MAX(amount_cents) OVER () AS max_payment\nFROM payments\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p024"],
  },
  {
    id: "wf-p025",
    title: "Value written off",
    brief:
      "Cancelled orders: for each one show id, total, and lost_value — the sum of ALL cancelled order totals (2 decimals) — so the team sees each cancellation next to the total revenue written off. Sort by id.",
    difficulty: "easy",
    hints: [
      "WHERE status = 'cancelled' scopes the rows; SUM(total) OVER () totals exactly those.",
      "SELECT id, total, ROUND(SUM(total) OVER (), 2) AS lost_value FROM orders WHERE status = 'cancelled' …",
    ],
    solution:
      "SELECT id, total, ROUND(SUM(total) OVER (), 2) AS lost_value\nFROM orders\nWHERE status = 'cancelled'\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p025"],
  },
  {
    id: "wf-p026",
    title: "Outstanding, line by line",
    brief:
      "AR: for every open invoice show number, issued_on, amount_cents, and outstanding — the total amount across all open invoices (in cents). Sort by id.",
    difficulty: "easy",
    hints: [
      "Filter to status = 'open', then SUM(amount_cents) OVER () carries the receivable total onto each row.",
      "SELECT number, issued_on, amount_cents, SUM(amount_cents) OVER () AS outstanding FROM invoices WHERE status = 'open' …",
    ],
    solution:
      "SELECT number, issued_on, amount_cents, SUM(amount_cents) OVER () AS outstanding\nFROM invoices\nWHERE status = 'open'\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p026"],
  },
  {
    id: "wf-p027",
    title: "Above the catalog mean?",
    brief:
      "Return every product's name, price, and above_avg: 'yes' when the price is strictly above the catalog-wide average price (windowed), else 'no'. Sort by id.",
    difficulty: "medium",
    hints: [
      "The CASE compares the row's price with AVG(price) OVER () computed in the same pass.",
      "SELECT name, price, CASE WHEN price > AVG(price) OVER () THEN 'yes' ELSE 'no' END AS above_avg FROM products …",
    ],
    solution:
      "SELECT name, price, CASE WHEN price > AVG(price) OVER () THEN 'yes' ELSE 'no' END AS above_avg\nFROM products\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p027"],
  },
  {
    id: "wf-p028",
    title: "Unit price vs the norm",
    brief:
      "For each order_items row show id, unit_price, and price_gap — the row's unit_price minus the average unit_price across all lines, rounded to 2 decimals. Sort by id.",
    difficulty: "medium",
    hints: [
      "AVG(unit_price) OVER () is the norm; the signed gap is unit_price minus that.",
      "SELECT id, unit_price, ROUND(unit_price - AVG(unit_price) OVER (), 2) AS price_gap FROM order_items …",
    ],
    solution:
      "SELECT id, unit_price, ROUND(unit_price - AVG(unit_price) OVER (), 2) AS price_gap\nFROM order_items\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p028"],
  },
  {
    id: "wf-p029",
    title: "Every expense vs the typical one",
    brief:
      "For each expense show id, vendor, amount_cents, and typical (the average expense amount across ALL expenses, rounded to 2 decimals). Sort by id.",
    difficulty: "easy",
    hints: [
      "ROUND(AVG(amount_cents) OVER (), 2) repeats the typical expense on every row.",
      "SELECT id, vendor, amount_cents, ROUND(AVG(amount_cents) OVER (), 2) AS typical FROM expenses …",
    ],
    solution:
      "SELECT id, vendor, amount_cents, ROUND(AVG(amount_cents) OVER (), 2) AS typical\nFROM expenses\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p029"],
  },
  {
    id: "wf-p030",
    title: "Fulfilled and counted",
    brief:
      "For orders that actually have a shipped_at date (not NULL), show id, total, fulfilled_count (how many orders have a shipped_at) and fulfilled_revenue (their total revenue, 2 decimals). Sort by id.",
    difficulty: "easy",
    hints: [
      "WHERE shipped_at IS NULL is false here — we want IS NOT NULL; the windows then aggregate the fulfilled set.",
      "SELECT id, total, COUNT(*) OVER () AS fulfilled_count, ROUND(SUM(total) OVER (), 2) AS fulfilled_revenue FROM orders WHERE shipped_at IS NOT NULL …",
    ],
    solution:
      "SELECT id, total, COUNT(*) OVER () AS fulfilled_count, ROUND(SUM(total) OVER (), 2) AS fulfilled_revenue\nFROM orders\nWHERE shipped_at IS NOT NULL\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p030"],
  },
  {
    id: "wf-p031",
    title: "Rank every order by value",
    brief:
      "Number every order from 1 starting with the biggest total (rn = 1 is the largest). Break ties by smaller id first. Return id, total, and rn, ordered by rn. ROW_NUMBER guarantees a strict 1…N sequence.",
    difficulty: "easy",
    hints: [
      "ROW_NUMBER() OVER (ORDER BY total DESC, id ASC) hands out 1…N with no gaps and no ties.",
      "SELECT id, total, ROW_NUMBER() OVER (ORDER BY total DESC, id ASC) AS rn FROM orders …",
    ],
    solution:
      "SELECT id, total, ROW_NUMBER() OVER (ORDER BY total DESC, id ASC) AS rn\nFROM orders\nORDER BY rn;",
    ordered: true,
    mistakes: [
      {
        test: "RANK\\s*\\(",
        message: "RANK would give tied totals the same number and skip the next — the brief wants a strict 1…N sequence, which is ROW_NUMBER's job.",
      },
    ],
    expected: EXPECTED_WF["wf-p031"],
  },
  {
    id: "wf-p032",
    title: "Cheapest first",
    brief:
      "Number all products from cheapest to dearest (rn = 1 is the cheapest), breaking price ties by name alphabetically. Return name, price, and rn, ordered by rn.",
    difficulty: "easy",
    hints: [
      "ORDER BY price ASC inside OVER (), with name as the deterministic tiebreaker.",
      "SELECT name, price, ROW_NUMBER() OVER (ORDER BY price ASC, name ASC) AS rn FROM products …",
    ],
    solution:
      "SELECT name, price, ROW_NUMBER() OVER (ORDER BY price ASC, name ASC) AS rn\nFROM products\nORDER BY rn;",
    ordered: true,
    expected: EXPECTED_WF["wf-p032"],
  },
  {
    id: "wf-p033",
    title: "Alphabetical roll call",
    brief:
      "Number the customers alphabetically by name (rn = 1 is first alphabetically; break exact-name ties by smaller id). Return name, city, and rn, ordered by rn.",
    difficulty: "easy",
    hints: [
      "ROW_NUMBER() OVER (ORDER BY name ASC, id ASC) — the id tiebreaker keeps the numbering deterministic.",
      "SELECT name, city, ROW_NUMBER() OVER (ORDER BY name ASC, id ASC) AS rn FROM customers …",
    ],
    solution:
      "SELECT name, city, ROW_NUMBER() OVER (ORDER BY name ASC, id ASC) AS rn\nFROM customers\nORDER BY rn;",
    ordered: true,
    expected: EXPECTED_WF["wf-p033"],
  },
  {
    id: "wf-p034",
    title: "Each customer's latest order",
    brief:
      "One row per customer: their most recent order. Using a CTE, number each customer's orders from newest to oldest (break same-date ties by bigger order id) and keep rn = 1. Return customer_id, order_id, total, and created_at, ordered by customer_id.",
    difficulty: "medium",
    hints: [
      "Stage with a CTE: ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) AS rn, then filter rn = 1 outside.",
      "WITH ranked AS (…ROW_NUMBER() OVER (PARTITION BY customer_id …) AS rn FROM orders) SELECT … FROM ranked WHERE rn = 1 …",
    ],
    solution:
      "WITH ranked AS (\n  SELECT customer_id, id AS order_id, total, created_at,\n         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) AS rn\n  FROM orders\n)\nSELECT customer_id, order_id, total, created_at\nFROM ranked\nWHERE rn = 1\nORDER BY customer_id;",
    ordered: true,
    mistakes: [
      {
        test: "WHERE[^\\(]*rn\\s*=\\s*1[^\\)]*OVER\\s*\\(",
        message: "Window functions can't be filtered inside the same SELECT's WHERE — stage them in a CTE (or derived table) first, then keep rn = 1.",
      },
    ],
    expected: EXPECTED_WF["wf-p034"],
  },
  {
    id: "wf-p035",
    title: "Each customer's first order",
    brief:
      "Anniversary report: one row per customer — their EARLIEST order (same-date ties: smaller order id wins). Return customer_id, order_id, and created_at, ordered by customer_id.",
    difficulty: "medium",
    hints: [
      "Same PARTITION BY customer_id shape as the latest-order pattern, but ORDER BY created_at ASC.",
      "WITH ranked AS (SELECT customer_id, id AS order_id, created_at, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS rn FROM orders) …",
    ],
    solution:
      "WITH ranked AS (\n  SELECT customer_id, id AS order_id, created_at,\n         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS rn\n  FROM orders\n)\nSELECT customer_id, order_id, created_at\nFROM ranked\nWHERE rn = 1\nORDER BY customer_id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p035"],
  },
  {
    id: "wf-p036",
    title: "Budget champion per category",
    brief:
      "One row per product category: its CHEAPEST product (price ties: alphabetically first name wins). Return category, name, and price, ordered by category.",
    difficulty: "medium",
    hints: [
      "PARTITION BY category, ORDER BY price ASC, name ASC, keep rn = 1.",
      "WITH r AS (SELECT category, name, price, ROW_NUMBER() OVER (PARTITION BY category ORDER BY price ASC, name ASC) AS rn FROM products) SELECT … WHERE rn = 1 …",
    ],
    solution:
      "WITH r AS (\n  SELECT category, name, price,\n         ROW_NUMBER() OVER (PARTITION BY category ORDER BY price ASC, name ASC) AS rn\n  FROM products\n)\nSELECT category, name, price\nFROM r\nWHERE rn = 1\nORDER BY category;",
    ordered: true,
    expected: EXPECTED_WF["wf-p036"],
  },
  {
    id: "wf-p037",
    title: "Premium pick per category",
    brief:
      "One row per product category: its MOST EXPENSIVE product (price ties: alphabetically first name wins). Return category, name, and price, ordered by category.",
    difficulty: "medium",
    hints: [
      "Same CTE + rn = 1 shape, with ORDER BY price DESC inside the partition.",
      "WITH r AS (SELECT category, name, price, ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC, name ASC) AS rn FROM products) …",
    ],
    solution:
      "WITH r AS (\n  SELECT category, name, price,\n         ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC, name ASC) AS rn\n  FROM products\n)\nSELECT category, name, price\nFROM r\nWHERE rn = 1\nORDER BY category;",
    ordered: true,
    expected: EXPECTED_WF["wf-p037"],
  },
  {
    id: "wf-p038",
    title: "Two premium picks per category",
    brief:
      "The pricing team shortlists the 2 most expensive products in every category (ties: alphabetical). Return category, name, price, and rn (1 = dearest of the pair), ordered by category then rn.",
    difficulty: "medium",
    hints: [
      "Rank inside the category partition, then keep rn <= 2 in the outer query.",
      "WITH r AS (… ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC, name ASC) AS rn …) SELECT … WHERE rn <= 2 ORDER BY category, rn;",
    ],
    solution:
      "WITH r AS (\n  SELECT category, name, price,\n         ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC, name ASC) AS rn\n  FROM products\n)\nSELECT category, name, price, rn\nFROM r\nWHERE rn <= 2\nORDER BY category, rn;",
    ordered: true,
    expected: EXPECTED_WF["wf-p038"],
  },
  {
    id: "wf-p039",
    title: "Top 3 baskets per status",
    brief:
      "Fulfilment audit: the 3 biggest orders within EACH status (ties: smaller id first). Return status, id, and total, plus rn (1 = biggest of the three), ordered by status then rn.",
    difficulty: "medium",
    hints: [
      "PARTITION BY status, ORDER BY total DESC, id ASC; outer WHERE rn <= 3.",
      "WITH r AS (SELECT status, id, total, ROW_NUMBER() OVER (PARTITION BY status ORDER BY total DESC, id ASC) AS rn FROM orders) …",
    ],
    solution:
      "WITH r AS (\n  SELECT status, id, total,\n         ROW_NUMBER() OVER (PARTITION BY status ORDER BY total DESC, id ASC) AS rn\n  FROM orders\n)\nSELECT status, id, total, rn\nFROM r\nWHERE rn <= 3\nORDER BY status, rn;",
    ordered: true,
    expected: EXPECTED_WF["wf-p039"],
  },
  {
    id: "wf-p040",
    title: "Latest payment per invoice",
    brief:
      "Cash application: for each invoice, its most recent payment (same-day ties: bigger payment id wins). Return invoice_id, payment_id, paid_on, and amount_cents, ordered by invoice_id.",
    difficulty: "medium",
    hints: [
      "PARTITION BY invoice_id, ORDER BY paid_on DESC, id DESC, keep rn = 1.",
      "WITH r AS (SELECT invoice_id, id AS payment_id, paid_on, amount_cents, ROW_NUMBER() OVER (PARTITION BY invoice_id ORDER BY paid_on DESC, id DESC) AS rn FROM payments) …",
    ],
    solution:
      "WITH r AS (\n  SELECT invoice_id, id AS payment_id, paid_on, amount_cents,\n         ROW_NUMBER() OVER (PARTITION BY invoice_id ORDER BY paid_on DESC, id DESC) AS rn\n  FROM payments\n)\nSELECT invoice_id, payment_id, paid_on, amount_cents\nFROM r\nWHERE rn = 1\nORDER BY invoice_id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p040"],
  },
  {
    id: "wf-p041",
    title: "Latest entry per account",
    brief:
      "Bookkeeping: for each ledger account, its most recent entry (same-date ties: bigger entry id wins). Return account, entry_id, entry_date, and memo, ordered by account.",
    difficulty: "medium",
    hints: [
      "PARTITION BY account, ORDER BY entry_date DESC, id DESC, keep rn = 1.",
      "WITH r AS (SELECT account, id AS entry_id, entry_date, memo, ROW_NUMBER() OVER (PARTITION BY account ORDER BY entry_date DESC, id DESC) AS rn FROM ledger_entries) …",
    ],
    solution:
      "WITH r AS (\n  SELECT account, id AS entry_id, entry_date, memo,\n         ROW_NUMBER() OVER (PARTITION BY account ORDER BY entry_date DESC, id DESC) AS rn\n  FROM ledger_entries\n)\nSELECT account, entry_id, entry_date, memo\nFROM r\nWHERE rn = 1\nORDER BY account;",
    ordered: true,
    expected: EXPECTED_WF["wf-p041"],
  },
  {
    id: "wf-p042",
    title: "The line that carries each order",
    brief:
      "For every order, the single order_items line with the highest line value (quantity * unit_price; ties: smaller item id). Return order_id, item_id, and line_value rounded to 2 decimals, ordered by order_id.",
    difficulty: "hard",
    hints: [
      "Compute line_value in the CTE first, rank by it DESC inside each order, keep rn = 1.",
      "WITH v AS (SELECT order_id, id AS item_id, quantity * unit_price AS line_value, ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY quantity * unit_price DESC, id ASC) AS rn FROM order_items) …",
    ],
    solution:
      "WITH v AS (\n  SELECT order_id, id AS item_id, ROUND(quantity * unit_price, 2) AS line_value,\n         ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY quantity * unit_price DESC, id ASC) AS rn\n  FROM order_items\n)\nSELECT order_id, item_id, line_value\nFROM v\nWHERE rn = 1\nORDER BY order_id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p042"],
  },
  {
    id: "wf-p043",
    title: "One flagship order per customer and status",
    brief:
      "Dedup pass: for each customer AND status combination keep only their biggest order (total ties: smaller id). Return customer_id, status, order_id, and total, ordered by customer_id then status.",
    difficulty: "hard",
    hints: [
      "The partition key can be two columns: PARTITION BY customer_id, status.",
      "WITH r AS (SELECT customer_id, status, id AS order_id, total, ROW_NUMBER() OVER (PARTITION BY customer_id, status ORDER BY total DESC, id ASC) AS rn FROM orders) …",
    ],
    solution:
      "WITH r AS (\n  SELECT customer_id, status, id AS order_id, total,\n         ROW_NUMBER() OVER (PARTITION BY customer_id, status ORDER BY total DESC, id ASC) AS rn\n  FROM orders\n)\nSELECT customer_id, status, order_id, total\nFROM r\nWHERE rn = 1\nORDER BY customer_id, status;",
    ordered: true,
    expected: EXPECTED_WF["wf-p043"],
  },
  {
    id: "wf-p044",
    title: "Each customer's purchase sequence",
    brief:
      "Number every order 1, 2, 3… within its customer, oldest to newest (same-day ties: smaller id first). Return customer_id, order_id, created_at, and seq, ordered by customer_id then seq.",
    difficulty: "medium",
    hints: [
      "PARTITION BY customer_id ORDER BY created_at ASC, id ASC gives each customer a fresh 1…N count.",
      "SELECT customer_id, id AS order_id, created_at, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS seq FROM orders …",
    ],
    solution:
      "SELECT customer_id, id AS order_id, created_at,\n       ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS seq\nFROM orders\nORDER BY customer_id, seq;",
    ordered: true,
    expected: EXPECTED_WF["wf-p044"],
  },
  {
    id: "wf-p045",
    title: "Months by order volume",
    brief:
      "Aggregate orders per month (strftime '%Y-%m' of created_at), then number the months from busiest (rn = 1) down; break volume ties by earlier month. Return month, orders, and rn, ordered by rn.",
    difficulty: "hard",
    hints: [
      "Two stages: a CTE that GROUPs by month and counts, then ROW_NUMBER() OVER (ORDER BY orders DESC, month ASC) over the CTE.",
      "WITH m AS (SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS orders FROM orders GROUP BY month) SELECT … ROW_NUMBER() OVER (ORDER BY orders DESC, month ASC) AS rn …",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS orders\n  FROM orders\n  GROUP BY month\n)\nSELECT month, orders, ROW_NUMBER() OVER (ORDER BY orders DESC, month ASC) AS rn\nFROM m\nORDER BY rn;",
    ordered: true,
    expected: EXPECTED_WF["wf-p045"],
  },
  {
    id: "wf-p046",
    title: "Regions by revenue",
    brief:
      "Join orders to customers, sum revenue per region (2 decimals), then number regions from highest revenue (rn = 1); ties: alphabetical region. Return region, revenue, and rn, ordered by rn.",
    difficulty: "hard",
    hints: [
      "Stage the per-region revenue in a CTE (JOIN + GROUP BY), then rank the small result with ROW_NUMBER.",
      "WITH rev AS (SELECT c.region, ROUND(SUM(o.total), 2) AS revenue FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region) …",
    ],
    solution:
      "WITH rev AS (\n  SELECT c.region, ROUND(SUM(o.total), 2) AS revenue\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region\n)\nSELECT region, revenue, ROW_NUMBER() OVER (ORDER BY revenue DESC, region ASC) AS rn\nFROM rev\nORDER BY rn;",
    ordered: true,
    expected: EXPECTED_WF["wf-p046"],
  },
  {
    id: "wf-p047",
    title: "Newest order per status",
    brief:
      "For each order status, its most recent order (same-date ties: bigger id). Return status, order_id, created_at, and total, ordered by status.",
    difficulty: "easy",
    hints: [
      "PARTITION BY status ORDER BY created_at DESC, id DESC, keep rn = 1 — only a handful of statuses exist.",
      "WITH r AS (SELECT status, id AS order_id, created_at, total, ROW_NUMBER() OVER (PARTITION BY status ORDER BY created_at DESC, id DESC) AS rn FROM orders) …",
    ],
    solution:
      "WITH r AS (\n  SELECT status, id AS order_id, created_at, total,\n         ROW_NUMBER() OVER (PARTITION BY status ORDER BY created_at DESC, id DESC) AS rn\n  FROM orders\n)\nSELECT status, order_id, created_at, total\nFROM r\nWHERE rn = 1\nORDER BY status;",
    ordered: true,
    expected: EXPECTED_WF["wf-p047"],
  },
  {
    id: "wf-p048",
    title: "Biggest payment per method",
    brief:
      "For each payment method (card, wire), the largest single payment (ties: smaller id). Return method, payment_id, and amount_cents, ordered by method.",
    difficulty: "easy",
    hints: [
      "PARTITION BY method, ORDER BY amount_cents DESC, id ASC, keep rn = 1.",
      "WITH r AS (SELECT method, id AS payment_id, amount_cents, ROW_NUMBER() OVER (PARTITION BY method ORDER BY amount_cents DESC, id ASC) AS rn FROM payments) …",
    ],
    solution:
      "WITH r AS (\n  SELECT method, id AS payment_id, amount_cents,\n         ROW_NUMBER() OVER (PARTITION BY method ORDER BY amount_cents DESC, id ASC) AS rn\n  FROM payments\n)\nSELECT method, payment_id, amount_cents\nFROM r\nWHERE rn = 1\nORDER BY method;",
    ordered: true,
    expected: EXPECTED_WF["wf-p048"],
  },
  {
    id: "wf-p049",
    title: "Five best sellers by units",
    brief:
      "Sum the quantity sold per product, then number products from most units sold (rn = 1); ties: alphabetical name. Keep the top 5. Return name, units, and rn, ordered by rn.",
    difficulty: "hard",
    hints: [
      "CTE: JOIN order_items to products, GROUP BY product, SUM(quantity). Then ROW_NUMBER over the CTE and filter rn <= 5.",
      "WITH sales AS (SELECT p.name, SUM(oi.quantity) AS units FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id, p.name) …",
    ],
    solution:
      "WITH sales AS (\n  SELECT p.name, SUM(oi.quantity) AS units\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.id, p.name\n),\nranked AS (\n  SELECT name, units, ROW_NUMBER() OVER (ORDER BY units DESC, name ASC) AS rn\n  FROM sales\n)\nSELECT name, units, rn\nFROM ranked\nWHERE rn <= 5\nORDER BY rn;",
    ordered: true,
    expected: EXPECTED_WF["wf-p049"],
  },
  {
    id: "wf-p050",
    title: "Top 5 spenders",
    brief:
      "Rank customers by lifetime spend (sum of order totals, 2 decimals) — rn = 1 is the biggest spender; ties: alphabetical name. Keep the top 5. Return name, spend, and rn, ordered by rn.",
    difficulty: "hard",
    hints: [
      "Stage per-customer spend in a CTE (orders JOIN customers, GROUP BY customer), then ROW_NUMBER + rn <= 5.",
      "WITH spend AS (SELECT c.name, ROUND(SUM(o.total), 2) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id, c.name) …",
    ],
    solution:
      "WITH spend AS (\n  SELECT c.name, ROUND(SUM(o.total), 2) AS spend\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n),\nranked AS (\n  SELECT name, spend, ROW_NUMBER() OVER (ORDER BY spend DESC, name ASC) AS rn\n  FROM spend\n)\nSELECT name, spend, rn\nFROM ranked\nWHERE rn <= 5\nORDER BY rn;",
    ordered: true,
    expected: EXPECTED_WF["wf-p050"],
  },
  {
    id: "wf-p051",
    title: "Cities by order count",
    brief:
      "Count orders per customer city, then number cities from most orders (rn = 1); ties: alphabetical city. Return city, orders, and rn, ordered by rn.",
    difficulty: "medium",
    hints: [
      "CTE joins orders to customers and GROUPs BY city; ROW_NUMBER then ranks the counts.",
      "WITH t AS (SELECT c.city, COUNT(*) AS orders FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.city) …",
    ],
    solution:
      "WITH t AS (\n  SELECT c.city, COUNT(*) AS orders\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.city\n)\nSELECT city, orders, ROW_NUMBER() OVER (ORDER BY orders DESC, city ASC) AS rn\nFROM t\nORDER BY rn;",
    ordered: true,
    expected: EXPECTED_WF["wf-p051"],
  },
  {
    id: "wf-p052",
    title: "Smallest invoice per customer",
    brief:
      "Credit-control sampling: for each customer, their SMALLEST invoice (amount ties: alphabetically first number). Return customer_id, number, and amount_cents, ordered by customer_id.",
    difficulty: "medium",
    hints: [
      "PARTITION BY customer_id ORDER BY amount_cents ASC, number ASC, keep rn = 1.",
      "WITH r AS (SELECT customer_id, number, amount_cents, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount_cents ASC, number ASC) AS rn FROM invoices) …",
    ],
    solution:
      "WITH r AS (\n  SELECT customer_id, number, amount_cents,\n         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount_cents ASC, number ASC) AS rn\n  FROM invoices\n)\nSELECT customer_id, number, amount_cents\nFROM r\nWHERE rn = 1\nORDER BY customer_id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p052"],
  },
  {
    id: "wf-p053",
    title: "Two biggest expenses per category",
    brief:
      "For each expense category, the 2 largest single expenses (ties: smaller id). Return category, vendor, amount_cents, and rn, ordered by category then rn.",
    difficulty: "medium",
    hints: [
      "PARTITION BY category, ORDER BY amount_cents DESC, id ASC, keep rn <= 2.",
      "WITH r AS (SELECT category, vendor, amount_cents, ROW_NUMBER() OVER (PARTITION BY category ORDER BY amount_cents DESC, id ASC) AS rn FROM expenses) …",
    ],
    solution:
      "WITH r AS (\n  SELECT category, vendor, amount_cents,\n         ROW_NUMBER() OVER (PARTITION BY category ORDER BY amount_cents DESC, id ASC) AS rn\n  FROM expenses\n)\nSELECT category, vendor, amount_cents, rn\nFROM r\nWHERE rn <= 2\nORDER BY category, rn;",
    ordered: true,
    expected: EXPECTED_WF["wf-p053"],
  },
  {
    id: "wf-p054",
    title: "Five largest invoices",
    brief:
      "Number invoices from largest amount_cents to smallest (ties: smaller id) and keep the top 5. Return number, amount_cents, and rn, ordered by rn.",
    difficulty: "easy",
    hints: [
      "A single ROW_NUMBER() OVER (ORDER BY amount_cents DESC, id ASC) plus rn <= 5.",
      "SELECT number, amount_cents, ROW_NUMBER() OVER (ORDER BY amount_cents DESC, id ASC) AS rn FROM invoices …",
    ],
    solution:
      "SELECT number, amount_cents, ROW_NUMBER() OVER (ORDER BY amount_cents DESC, id ASC) AS rn\nFROM invoices\nORDER BY rn\nLIMIT 5;",
    ordered: true,
    mistakes: [
      {
        test: "LIMIT\\s+5[\\s\\S]*ROW_NUMBER|ROW_NUMBER[\\s\\S]*LIMIT\\s+5",
        message: "Careful: LIMIT alone after the window is fine here, but if you also filter rn <= 5 you'd double-limit — one mechanism is enough.",
      },
    ],
    expected: EXPECTED_WF["wf-p054"],
  },
  {
    id: "wf-p055",
    title: "Each customer's biggest basket",
    brief:
      "One row per customer: the single order with the highest total (ties: smaller order id). Return customer_id, order_id, and total, ordered by customer_id.",
    difficulty: "medium",
    hints: [
      "PARTITION BY customer_id, ORDER BY total DESC, id ASC, keep rn = 1.",
      "WITH r AS (SELECT customer_id, id AS order_id, total, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id ASC) AS rn FROM orders) …",
    ],
    solution:
      "WITH r AS (\n  SELECT customer_id, id AS order_id, total,\n         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id ASC) AS rn\n  FROM orders\n)\nSELECT customer_id, order_id, total\nFROM r\nWHERE rn = 1\nORDER BY customer_id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p055"],
  },
  {
    id: "wf-p056",
    title: "Low-stock watchlist",
    brief:
      "Restock first: list the 5 products with the SMALLEST stock (ties: alphabetical name), numbered rn = 1..5 with rn = 1 the most depleted. Return name, stock, and rn, ordered by rn.",
    difficulty: "easy",
    hints: [
      "Rank by stock ASC with name as tiebreaker, then keep rn <= 5 in a second stage (WHERE can't see the window alias).",
      "WITH ranked AS (SELECT name, stock, ROW_NUMBER() OVER (ORDER BY stock ASC, name ASC) AS rn FROM products) SELECT * FROM ranked WHERE rn <= 5 …",
    ],
    solution:
      "WITH ranked AS (\n  SELECT name, stock, ROW_NUMBER() OVER (ORDER BY stock ASC, name ASC) AS rn\n  FROM products\n)\nSELECT name, stock, rn\nFROM ranked\nWHERE rn <= 5\nORDER BY rn;",
    ordered: true,
    expected: EXPECTED_WF["wf-p056"],
  },
  {
    id: "wf-p057",
    title: "First ten deliveries",
    brief:
      "Number delivered orders chronologically (created_at ASC, ties by id ASC) and keep the first 10. Return id, created_at, total, and seq, ordered by seq.",
    difficulty: "easy",
    hints: [
      "ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS seq, filter seq <= 10.",
      "SELECT id, created_at, total, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS seq FROM orders WHERE status = 'delivered' …",
    ],
    solution:
      "SELECT id, created_at, total, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS seq\nFROM orders\nWHERE status = 'delivered'\nORDER BY seq\nLIMIT 10;",
    ordered: true,
    expected: EXPECTED_WF["wf-p057"],
  },
  {
    id: "wf-p058",
    title: "Each supplier's premium item",
    brief:
      "One row per supplier: their most expensive product (price ties: alphabetically first name). Return supplier, product, and price, ordered by supplier. Join products to suppliers for the name.",
    difficulty: "hard",
    hints: [
      "Join first (or in the CTE), partition by the SUPPLIER NAME, order by price DESC, name ASC, keep rn = 1.",
      "WITH r AS (SELECT s.name AS supplier, p.name AS product, p.price, ROW_NUMBER() OVER (PARTITION BY s.name ORDER BY p.price DESC, p.name ASC) AS rn FROM products p JOIN suppliers s ON s.id = p.supplier_id) …",
    ],
    solution:
      "WITH r AS (\n  SELECT s.name AS supplier, p.name AS product, p.price,\n         ROW_NUMBER() OVER (PARTITION BY s.name ORDER BY p.price DESC, p.name ASC) AS rn\n  FROM products p\n  JOIN suppliers s ON s.id = p.supplier_id\n)\nSELECT supplier, product, price\nFROM r\nWHERE rn = 1\nORDER BY supplier;",
    ordered: true,
    expected: EXPECTED_WF["wf-p058"],
  },
  {
    id: "wf-p059",
    title: "Opening entries",
    brief:
      "The ledger's first five entries ever: number rows by entry_date ASC (ties: id ASC) and keep 1–5. Return id, entry_date, account, and seq, ordered by seq.",
    difficulty: "easy",
    hints: [
      "ROW_NUMBER() OVER (ORDER BY entry_date ASC, id ASC) AS seq, keep seq <= 5.",
      "SELECT id, entry_date, account, ROW_NUMBER() OVER (ORDER BY entry_date ASC, id ASC) AS seq FROM ledger_entries …",
    ],
    solution:
      "SELECT id, entry_date, account, ROW_NUMBER() OVER (ORDER BY entry_date ASC, id ASC) AS seq\nFROM ledger_entries\nORDER BY seq\nLIMIT 5;",
    ordered: true,
    expected: EXPECTED_WF["wf-p059"],
  },
  {
    id: "wf-p060",
    title: "Biggest basket per city",
    brief:
      "For each customer city, the single largest order total placed there (ties: smaller order id). Return city, order_id, and total, ordered by city. Join orders to customers for the city.",
    difficulty: "hard",
    hints: [
      "Join orders to customers, partition by city, order by total DESC, id ASC, keep rn = 1.",
      "WITH r AS (SELECT c.city, o.id AS order_id, o.total, ROW_NUMBER() OVER (PARTITION BY c.city ORDER BY o.total DESC, o.id ASC) AS rn FROM orders o JOIN customers c ON c.id = o.customer_id) …",
    ],
    solution:
      "WITH r AS (\n  SELECT c.city, o.id AS order_id, o.total,\n         ROW_NUMBER() OVER (PARTITION BY c.city ORDER BY o.total DESC, o.id ASC) AS rn\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n)\nSELECT city, order_id, total\nFROM r\nWHERE rn = 1\nORDER BY city;",
    ordered: true,
    expected: EXPECTED_WF["wf-p060"],
  },
];
