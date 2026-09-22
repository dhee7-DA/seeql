// Daily puzzle calendar — the puzzle bank, the date→puzzle assignment and
// the streak/freeze math. Pure functions + data, no React, no storage.
//
// One puzzle per calendar day, chosen deterministically so every client
// agrees on "today's puzzle" without a server: index = (dayNumber * 7) % 24.
// The stride 7 is coprime with the bank length (24), so consecutive days are
// spread across skills and the bank cycles without a repeat for 24 straight
// days. Backlog days (missed past days) can still be solved for reduced XP —
// but only TODAY pays full XP and advances the streak.

import type { Difficulty } from "./gamification";

export interface DailyPuzzle {
  id: string;
  /** short tab title */
  title: string;
  /** the business framing the learner reads */
  prompt: string;
  /** reference solution — also the grading target (rows must match) */
  solution: string;
  hint1: string;
  hint2: string;
  /** shown after a correct solve — why the pattern matters */
  lesson: string;
  /** mastery-map skill tag */
  skill: string;
  difficulty: Difficulty;
  /** true when the target rows are order-sensitive */
  ordered?: boolean;
}

export const DAILY_PUZZLES: DailyPuzzle[] = [
  {
    id: "dp-01",
    title: "Pipeline value by status",
    prompt:
      "Sales wants the total value of orders grouped by status. Show each status with its order count and the sum of order totals, rounded to 2 decimals — biggest value first.",
    solution:
      "SELECT status, COUNT(*) AS orders, ROUND(SUM(total), 2) AS value\nFROM orders\nGROUP BY status\nORDER BY value DESC",
    hint1: "One table is enough: orders. GROUP BY status, then COUNT(*) and SUM(total).",
    hint2: "ROUND(SUM(total), 2) keeps the money readable, and ORDER BY the summed value DESC puts the biggest bucket on top.",
    lesson:
      "Status pipelines are the first dashboard every stakeholder asks for. GROUP BY + SUM turns a row-per-order table into one decision-ready row per stage — and sorting by value (not count) surfaces where the money actually sits.",
    skill: "aggregates",
    difficulty: "easy",
  },
  {
    id: "dp-02",
    title: "Big-ticket line items",
    prompt:
      "Find every line item belonging to an order worth more than 1000. Return the order id, customer name, product name, quantity and unit price — sorted by order id, then product name.",
    solution:
      "SELECT o.id AS order_id, c.name AS customer, p.name AS product,\n       oi.quantity, oi.unit_price\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nWHERE o.total > 1000\nORDER BY o.id, p.name",
    hint1: "Chain four tables: orders → customers (who bought), orders → order_items → products (what was bought).",
    hint2: "Filter on o.total > 1000 BEFORE thinking about aggregation — no GROUP BY needed, this is a plain filtered join.",
    lesson:
      "This is the classic four-table chain behind almost every order-history screen. Note the aliasing habit (o, c, oi, p): once queries grow, readable aliases are the difference between a query you can debug and one you rewrite.",
    skill: "joins",
    difficulty: "medium",
  },
  {
    id: "dp-03",
    title: "Orders per month",
    prompt:
      "Show a month-by-month order count. Return the month as a YYYY-MM string plus the number of orders placed, sorted chronologically.",
    solution:
      "SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS orders\nFROM orders\nGROUP BY month\nORDER BY month",
    hint1: "SQLite has no DATE_TRUNC — strftime('%Y-%m', created_at) slices a text date into month buckets.",
    hint2: "GROUP BY the alias `month` (SQLite allows it) and ORDER BY month — text YYYY-MM sorts chronologically for free.",
    lesson:
      "Bucketing timestamps by month is half of all reporting. In SQLite the trick is strftime; in Postgres it's DATE_TRUNC. Either way you're grouping by a DERIVED column — and because YYYY-MM is fixed-width text, alphabetical order IS chronological order.",
    skill: "text-dates",
    difficulty: "medium",
  },
  {
    id: "dp-04",
    title: "The customers who never received",
    prompt:
      "Which customers have never had a single DELIVERED order? Return name and region, sorted by name. (A cancelled or pending history doesn't count as delivered.)",
    solution:
      "SELECT c.name, c.region\nFROM customers c\nWHERE c.id NOT IN (\n  SELECT o.customer_id FROM orders o WHERE o.status = 'delivered'\n)\nORDER BY c.name",
    hint1: "\"Never did X\" is an anti-join. NOT IN over a subquery of delivered-order customer ids is the cleanest form here.",
    hint2: "Filter INSIDE the subquery (status = 'delivered'), not outside — filtering after the NOT IN changes the meaning entirely.",
    lesson:
      "Anti-joins answer churn, gaps and compliance questions: who never converted, which products never sold, which accounts never paid. NOT IN has one famous trap — if the subquery returns a single NULL, nothing matches. NOT EXISTS is the NULL-proof variant.",
    skill: "subqueries",
    difficulty: "medium",
  },
  {
    id: "dp-05",
    title: "Top 5 spenders, ranked",
    prompt:
      "Rank customers by lifetime spend (sum of order totals, excluding cancelled orders). Show rank, name, spend rounded to 2 decimals — rank 1 first, ties get the same rank.",
    solution:
      "SELECT RANK() OVER (ORDER BY SUM(o.total) DESC) AS rank,\n       c.name, ROUND(SUM(o.total), 2) AS spend\nFROM customers c\nJOIN orders o ON o.customer_id = c.id AND o.status != 'cancelled'\nGROUP BY c.id, c.name\nORDER BY rank, c.name\nLIMIT 5",
    hint1: "Aggregate first (GROUP BY customer), then rank the aggregates with a window function — RANK() OVER (ORDER BY SUM(...) DESC).",
    hint2: "Put the status filter in the JOIN's ON clause or a WHERE before grouping. ROUND after SUM; LIMIT 5 after ranking.",
    lesson:
      "Aggregation + window ranking is the leaderboard pattern: GROUP BY builds the scoreboard, RANK() OVER stamps positions, and unlike ROW_NUMBER, RANK gives tied spenders the same podium spot — which is what fair leaderboards do.",
    skill: "windows",
    difficulty: "medium",
  },
  {
    id: "dp-06",
    title: "Still in the warehouse",
    prompt:
      "Operations needs the list of orders that have NO shipped_at value. Return id, status and created_at, oldest first. (Hint: = NULL is always wrong.)",
    solution:
      "SELECT id, status, created_at\nFROM orders\nWHERE shipped_at IS NULL\nORDER BY created_at",
    hint1: "NULL never equals anything, not even NULL. The only test that finds holes is IS NULL.",
    hint2: "WHERE shipped_at IS NULL ORDER BY created_at — oldest first so the team works the backlog top-down.",
    lesson:
      "WHERE x = NULL returns zero rows, always, silently — one of the two classic SQL bugs. A NULL shipped_at isn't 'missing data', it's a real business state: not shipped yet. Modelling states as NULL and finding them with IS NULL is a core SQL reflex.",
    skill: "null",
    difficulty: "easy",
  },
  {
    id: "dp-07",
    title: "Spot-check the reconciliation",
    prompt:
      "Finance wants to spot-check that stored order totals match the line items beneath them. For the 5 orders with the highest computed line-item value, return order id, stored total and computed sum (quantity × unit_price) — both rounded to 2 decimals, biggest computed value first.",
    solution:
      "SELECT o.id, ROUND(o.total, 2) AS stored, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS computed\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nGROUP BY o.id, o.total\nORDER BY SUM(oi.quantity * oi.unit_price) DESC\nLIMIT 5",
    hint1: "Join orders to order_items, GROUP BY the order, and compare SUM(quantity * unit_price) with o.total.",
    hint2: "ORDER BY SUM(oi.quantity * oi.unit_price) DESC LIMIT 5 — you can order by an aggregate you didn't SELECT.",
    lesson:
      "Every real warehouse should reconcile: cached totals equal their detail rows. Here they do — but the audit that would catch drift is one HAVING away: HAVING ABS(o.total - SUM(...)) > 0.01 keeps only mismatched orders. The 0.01 tolerance matters because floating-point money never compares cleanly with =.",
    skill: "aggregates",
    difficulty: "hard",
  },
  {
    id: "dp-08",
    title: "Billed AND shipped",
    prompt:
      "Which customers have BOTH placed at least one order AND been issued at least one invoice? Return their names sorted alphabetically, each name once.",
    solution:
      "SELECT DISTINCT c.name\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN invoices i ON i.customer_id = c.id\nORDER BY c.name",
    hint1: "A customer with an order AND an invoice appears on both sides — an inner join to both tables keeps only customers present in each.",
    hint2: "DISTINCT collapses the duplicates from customers with many orders/invoices. (An INTERSECT of two id subqueries is a valid alternative.)",
    lesson:
      "\"Did X and Y\" over one dimension is a overlap question. Two inner joins + DISTINCT is the readable form; INTERSECT is the set-algebra form. Both beat the mistake of counting customers with orders and invoices as separate numbers and adding them — that double-counts the overlap.",
    skill: "setops",
    difficulty: "medium",
  },
  {
    id: "dp-09",
    title: "The collections worklist",
    prompt:
      "Finance works its open invoices soonest-due-first. Return invoice number, customer name, due_on and amount (in dollars, 2 decimals) for every invoice with status 'open', sorted by due date — the one due next sits on top.",
    solution:
      "SELECT i.number, c.name, i.due_on, ROUND(i.amount_cents / 100.0, 2) AS amount\nFROM invoices i\nJOIN customers c ON c.id = i.customer_id\nWHERE i.status = 'open'\nORDER BY i.due_on",
    hint1: "Amounts live in cents — divide by 100.0 (not 100, that would integer-divide) and round to 2.",
    hint2: "WHERE status = 'open', then ORDER BY due_on — text ISO dates sort chronologically, so the soonest due date lands on top.",
    lesson:
      "Money in integer cents avoids float drift — the display layer divides. And the overdue query is just a filtered join, but the sort order IS the feature: an AR dashboard is only useful when the oldest debt is the first row you see.",
    skill: "finance",
    difficulty: "medium",
  },
  {
    id: "dp-10",
    title: "Outstanding balances",
    prompt:
      "For every invoice that has received at least one payment, show the invoice number, amount due, total paid and the remaining balance (amount − paid). Only show invoices that still owe something. Biggest balance first, amounts in dollars with 2 decimals.",
    solution:
      "SELECT i.number,\n       ROUND(i.amount_cents / 100.0, 2) AS due,\n       ROUND(SUM(p.amount_cents) / 100.0, 2) AS paid,\n       ROUND((i.amount_cents - SUM(p.amount_cents)) / 100.0, 2) AS balance\nFROM invoices i\nJOIN payments p ON p.invoice_id = i.id\nGROUP BY i.id, i.number, i.amount_cents\nHAVING SUM(p.amount_cents) < i.amount_cents\nORDER BY balance DESC",
    hint1: "Join invoices to payments, GROUP BY the invoice, SUM the payment cents.",
    hint2: "The 'still owes something' filter is HAVING SUM(payments) < amount — a group-level condition, so HAVING not WHERE.",
    lesson:
      "Balance = parent amount − SUM(child payments). This parent-with-children reconciliation is the shape of every AR ledger, subscription quota and campaign budget. Spot the pattern once and a dozen finance queries become the same query.",
    skill: "finance",
    difficulty: "hard",
  },
  {
    id: "dp-11",
    title: "Priced per category",
    prompt:
      "Report the average product price per category, rounded to 2 decimals, but only for categories that have at least 3 distinct products. Cheapest category on top.",
    solution:
      "SELECT category, COUNT(*) AS products, ROUND(AVG(price), 2) AS avg_price\nFROM products\nGROUP BY category\nHAVING COUNT(*) >= 3\nORDER BY avg_price",
    hint1: "GROUP BY category with COUNT(*) and AVG(price).",
    hint2: "HAVING COUNT(*) >= 3 filters the GROUPS after aggregation — WHERE can't see aggregates. Sort by the average, ascending.",
    lesson:
      "HAVING exists precisely because WHERE runs before grouping. 'Average per group, minimum group size, sorted' is the workload WHERE can never do — and minimum-sample-size filters like this keep tiny groups from pretending to be trends.",
    skill: "aggregates",
    difficulty: "easy",
  },
  {
    id: "dp-12",
    title: "Customers off the books",
    prompt:
      "Invoicing wants to know who is missing from their ledger. Which customers have NEVER been issued an invoice? Return name and region, sorted by name.",
    solution:
      "SELECT c.name, c.region\nFROM customers c\nWHERE c.id NOT IN (SELECT customer_id FROM invoices)\nORDER BY c.name",
    hint1: "\"Never invoiced\" is an anti-join: customers whose id is not in the invoices customer list.",
    hint2: "WHERE c.id NOT IN (SELECT customer_id FROM invoices) ORDER BY c.name — the subquery collects everyone who IS on the books.",
    lesson:
      "Anti-joins find the absence of rows — an inner join to invoices would silently DROP exactly the customers you're hunting. Absence questions (never ordered, never paid, never logged in) need NOT IN / NOT EXISTS / LEFT JOIN … IS NULL.",
    skill: "subqueries",
    difficulty: "medium",
  },
  {
    id: "dp-13",
    title: "Share of wallet",
    prompt:
      "For every delivered order, show the customer name, order total and what percentage that order is of that customer's delivered spend (2 decimals). Sort by customer, then biggest share first.",
    solution:
      "SELECT c.name, ROUND(o.total, 2) AS order_total,\n       ROUND(100.0 * o.total / SUM(o.total) OVER (PARTITION BY c.id), 2) AS pct_of_spend\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.status = 'delivered'\nORDER BY c.name, pct_of_spend DESC",
    hint1: "SUM(o.total) OVER (PARTITION BY customer) gives each row its customer's total WITHOUT collapsing rows.",
    hint2: "100.0 * total / window_sum — the 100.0 forces decimal division. Sort by name then share.",
    lesson:
      "Window aggregates answer \"this row vs its group\" without a self-join: share of wallet, % of quota, row's slice of the pie. PARTITION BY is GROUP BY that keeps every row — the single most useful window trick in analytics.",
    skill: "windows",
    difficulty: "hard",
  },
  {
    id: "dp-14",
    title: "How fast we ship",
    prompt:
      "For shipped orders (they have a shipped_at), compute the shipping lag in days (shipped_at − created_at) and report the average per status, rounded to 1 decimal. Slowest status on top.",
    solution:
      "SELECT status, ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 1) AS avg_lag_days\nFROM orders\nWHERE shipped_at IS NOT NULL\nGROUP BY status\nORDER BY avg_lag_days DESC",
    hint1: "julianday(date_text) turns a date into a number you can subtract — the SQLite way to count days between dates.",
    hint2: "WHERE shipped_at IS NOT NULL keeps NULLs out of the math, GROUP BY status, AVG the lag, round to 1 decimal.",
    lesson:
      "Date arithmetic differs by engine — julianday here, DATEDIFF in SQL Server, plain subtraction in Postgres — but the shape is universal: convert to a number, subtract, aggregate. Always filter NULL dates first or one hole poisons the average.",
    skill: "text-dates",
    difficulty: "medium",
  },
  {
    id: "dp-15",
    title: "Basket size bands",
    prompt:
      "Bucket every order into three bands: 'small' (total ≤ 100), 'medium' (100 < total ≤ 500), 'large' (total > 500). Return band name and order count, ordered small → medium → large.",
    solution:
      "SELECT CASE\n         WHEN total <= 100 THEN 'small'\n         WHEN total <= 500 THEN 'medium'\n         ELSE 'large'\n       END AS band,\n       COUNT(*) AS orders\nFROM orders\nGROUP BY band\nORDER BY MIN(total)",
    hint1: "A searched CASE WHEN total <= 100 THEN 'small' ... builds the band per row; GROUP BY the CASE's alias.",
    hint2: "To force small→medium→large order, ORDER BY MIN(total) — bands sort by their cheapest member. (Or ORDER BY the CASE again.)",
    lesson:
      "CASE inside GROUP BY is how SQL builds histograms from continuous data. The ordering trick — sorting bands by MIN of their defining column — works because every row in the 'small' band is ≤ every row in 'medium'. No lookup table needed.",
    skill: "case",
    difficulty: "medium",
  },
  {
    id: "dp-16",
    title: "Same-region pairs",
    prompt:
      "List every pair of DISTINCT customers who share the same region. Return the two names (alphabetically smaller first) and the region, sorted by region then first name. Never pair a customer with themselves, never list a pair twice.",
    solution:
      "SELECT a.name AS name_a, b.name AS name_b, a.region\nFROM customers a\nJOIN customers b ON a.region = b.region AND a.id < b.id\nORDER BY a.region, a.name",
    hint1: "Self-join customers to itself ON a.region = b.region — and a.id < b.id kills both self-pairs and mirror duplicates.",
    hint2: "With a.id < b.id each pair appears exactly once with the smaller-id customer as A; ORDER BY region then name for readability.",
    lesson:
      "Self-joins pair rows of one table: co-customers, manager hierarchies, duplicate detection. The a.id < b.id (or ≠) trick is the whole game — without it you get every pair twice plus self-pairs, and the row count explodes quadratically.",
    skill: "joins",
    difficulty: "hard",
  },
  {
    id: "dp-17",
    title: "Where the money leaks",
    prompt:
      "Total up expenses by category. Show category, expense count and total in dollars (2 decimals), biggest total first.",
    solution:
      "SELECT category, COUNT(*) AS entries, ROUND(SUM(amount_cents) / 100.0, 2) AS total\nFROM expenses\nGROUP BY category\nORDER BY total DESC",
    hint1: "Single table: expenses. GROUP BY category, SUM the cents, divide by 100.0 for dollars.",
    hint2: "COUNT(*) alongside SUM shows both frequency and magnitude — a category with 2 huge entries tells a different story than 40 small ones.",
    lesson:
      "Spend-by-category is GROUP BY in its purest form — but pairing COUNT with SUM is the analyst's habit that matters: totals without counts hide whether a leak is one whale or a thousand minnows.",
    skill: "finance",
    difficulty: "easy",
  },
  {
    id: "dp-18",
    title: "Trial balance",
    prompt:
      "From ledger_entries, produce a trial balance: per account, total debits, total credits (dollars, 2 decimals) and the balance = debits − credits. Sort by absolute balance, biggest movement first.",
    solution:
      "SELECT account,\n       ROUND(SUM(debit_cents) / 100.0, 2) AS debits,\n       ROUND(SUM(credit_cents) / 100.0, 2) AS credits,\n       ROUND((SUM(debit_cents) - SUM(credit_cents)) / 100.0, 2) AS balance\nFROM ledger_entries\nGROUP BY account\nORDER BY ABS(SUM(debit_cents) - SUM(credit_cents)) DESC",
    hint1: "One GROUP BY account; SUM(debit_cents), SUM(credit_cents), and the balance is their difference.",
    hint2: "ORDER BY ABS(balance) needs the full expression — ABS(SUM(debit_cents) - SUM(credit_cents)) — since SQLite won't always reuse a rounded alias.",
    lesson:
      "The trial balance is the oldest aggregation in bookkeeping: every account, debits minus credits, biggest movement first. Debit/credit columns that mean opposite things by sign-convention are exactly why ABS() exists in reporting.",
    skill: "finance",
    difficulty: "hard",
  },
  {
    id: "dp-19",
    title: "Thin shelves in fat categories",
    prompt:
      "Find products whose stock is BELOW the average stock of their own category. Return product name, category, stock and the category average (2 decimals), sorted by the shortfall (stock − category avg), worst first.",
    solution:
      "SELECT p.name, p.category, p.stock,\n       ROUND((SELECT AVG(p2.stock) FROM products p2 WHERE p2.category = p.category), 2) AS cat_avg\nFROM products p\nWHERE p.stock < (SELECT AVG(p2.stock) FROM products p2 WHERE p2.category = p.category)\nORDER BY p.stock - (SELECT AVG(p2.stock) FROM products p2 WHERE p2.category = p.category)",
    hint1: "A correlated subquery does it in one table: WHERE stock < (SELECT AVG(stock) ... WHERE category = p.category).",
    hint2: "Repeat the correlated subquery in ORDER BY for the shortfall sort — or wrap the whole thing in an outer query that computes stock - cat_avg once.",
    lesson:
      "\"Below MY group's average\" is a correlated subquery — the inner query re-runs per row with that row's context. Window functions (AVG OVER PARTITION) express the same thing in one pass; knowing both forms means you can write it in any engine, old or new.",
    skill: "subqueries",
    difficulty: "hard",
  },
  {
    id: "dp-20",
    title: "The running till",
    prompt:
      "Build a running total of order value by day: for each order date, show the date, that day's revenue (2 decimals) and the cumulative revenue up to and including that day (2 decimals). Chronological order.",
    solution:
      "SELECT created_at AS day, ROUND(SUM(total), 2) AS day_total,\n       ROUND(SUM(SUM(total)) OVER (ORDER BY created_at), 2) AS running_total\nFROM orders\nGROUP BY created_at\nORDER BY day",
    hint1: "GROUP BY created_at first for daily totals, then a window over the aggregate: SUM(SUM(total)) OVER (ORDER BY date).",
    hint2: "The nested SUM(SUM(...)) looks odd but is exact: inner SUM = the group aggregate, outer SUM OVER = running across groups in date order.",
    lesson:
      "Running totals are windows OVER aggregates: aggregate first, then SUM(...) OVER (ORDER BY date). The double-SUM idiom (or a subquery/CTE) is the standard bridge between the two layers — and it's what powers every cash-till and growth curve you've seen.",
    skill: "windows",
    difficulty: "hard",
  },
  {
    id: "dp-21",
    title: "How people pay",
    prompt:
      "Break down payments by method: count of payments and total amount in dollars (2 decimals) per method, plus each method's percentage of total payment volume (2 decimals). Biggest method first.",
    solution:
      "SELECT method, COUNT(*) AS payments, ROUND(SUM(amount_cents) / 100.0, 2) AS total,\n       ROUND(100.0 * SUM(amount_cents) / (SELECT SUM(amount_cents) FROM payments), 2) AS pct\nFROM payments\nGROUP BY method\nORDER BY total DESC",
    hint1: "GROUP BY method with COUNT and SUM; the grand total for percentages comes from a scalar subquery.",
    hint2: "100.0 * SUM(...) / (SELECT SUM(...) FROM payments) — the 100.0 guards against integer division.",
    lesson:
      "Mix reports need each group's share of the grand total. The scalar subquery (SELECT SUM(...) FROM same_table) is the portable form; some engines let you window it instead. Either way: never compute percentages by hand — the DB has the truth.",
    skill: "aggregates",
    difficulty: "medium",
  },
  {
    id: "dp-22",
    title: "First buy, then how many",
    prompt:
      "For each customer: their first order month (YYYY-MM) and how many orders they've placed since (inclusive). Return name, first_month, order count — most active customer first.",
    solution:
      "SELECT c.name,\n       strftime('%Y-%m', MIN(o.created_at)) AS first_month,\n       COUNT(*) AS orders\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name\nORDER BY orders DESC, c.name",
    hint1: "MIN(created_at) gives the first order timestamp per customer; wrap it in strftime to month-bucket it.",
    hint2: "COUNT(*) in the same GROUP BY counts ALL orders (which are, by definition, 'since' the first one). Most orders first.",
    lesson:
      "MIN(date) inside strftime is the cohort tag; COUNT(*) in the same group is the activity metric. Cohort + volume in one GROUP BY — this is the seed of every retention analysis: when did they arrive, and what did they do after.",
    skill: "aggregates",
    difficulty: "medium",
  },
  {
    id: "dp-23",
    title: "Loyal and valuable",
    prompt:
      "Which customers placed MORE than 5 orders? Show name, order count and average order value (2 decimals), best average first.",
    solution:
      "SELECT c.name, COUNT(*) AS orders, ROUND(AVG(o.total), 2) AS avg_order\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name\nHAVING COUNT(*) > 5\nORDER BY avg_order DESC",
    hint1: "GROUP BY the customer, COUNT(*) the orders, AVG(total) the value.",
    hint2: "HAVING COUNT(*) > 5 — the loyalty filter is a group filter, so HAVING. Sort by average value, descending.",
    lesson:
      "Frequency + value is the RFM heart of customer analytics. HAVING COUNT(*) > N finds the loyal cohort; sorting by average basket instead of count answers the question marketing actually asks — of the loyal ones, who spends the most per visit.",
    skill: "aggregates",
    difficulty: "medium",
  },
  {
    id: "dp-24",
    title: "Above the regional bar",
    prompt:
      "List products supplied by APAC-region suppliers that are priced above the average price of ALL APAC-supplied products. Return name, price and supplier name, priciest first.",
    solution:
      "SELECT p.name, p.price, s.name AS supplier\nFROM products p\nJOIN suppliers s ON s.id = p.supplier_id\nWHERE s.region = 'APAC'\n  AND p.price > (SELECT AVG(p2.price) FROM products p2 JOIN suppliers s2 ON s2.id = p2.supplier_id WHERE s2.region = 'APAC')\nORDER BY p.price DESC",
    hint1: "Join products to suppliers for the region filter; the comparison bar is a scalar subquery with the SAME join+filter inside.",
    hint2: "WHERE region = 'APAC' appears twice — once for the rows you show, once inside the subquery that computes the average they must beat.",
    lesson:
      "Filter-and-compare-with-your-own-cohort needs the same predicate twice: outer rows and inner average. Miss the inner filter and you're comparing APAC products against the whole world's average — a subtle, silent, very common analytics bug.",
    skill: "subqueries",
    difficulty: "hard",
  },
];

export const PUZZLE_BANK_SIZE = DAILY_PUZZLES.length; // 24

/** Parse a "YYYY-MM-DD" key into {y, m, d} numbers. */
function parseKey(key: string): { y: number; m: number; d: number } {
  const [y, m, d] = key.split("-").map(Number);
  return { y, m, d };
}

/** Days since a fixed epoch — a stable linear day number. */
export function dayNumber(dateKey: string): number {
  const { y, m, d } = parseKey(dateKey);
  // Date.UTC months are 0-based
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

/**
 * Deterministic puzzle assignment: every client picks the same puzzle for a
 * given day with no server. Stride 7 × bank size 24 (coprime) → consecutive
 * days land 7 apart in the bank and the full cycle takes 24 days, so a week
 * never repeats a puzzle.
 */
export function puzzleIndexFor(dateKey: string): number {
  return (dayNumber(dateKey) * 7) % PUZZLE_BANK_SIZE;
}

export function puzzleForDate(dateKey: string): DailyPuzzle {
  return DAILY_PUZZLES[puzzleIndexFor(dateKey)];
}

/** XP for solving a daily puzzle: full for today, reduced for backlog days. */
export const PUZZLE_XP = { today: 25, backlog: 15, cleanBonus: 5 } as const;

export interface PuzzleStreak {
  /** consecutive solved days ending today (or yesterday if today is open) */
  streak: number;
  /** days bridged by freeze tokens (derived, oldest-gap-first from today) */
  frozenDays: string[];
}

/**
 * Puzzle streak with freeze bridging. Semantics:
 *  - today unsolved → still in progress, doesn't break anything;
 *  - the LIVE RUN = consecutive solved days ending today (or yesterday);
 *  - a freeze token bridges a GAP only when the gap sits strictly between
 *    two solved stretches (never conjures pre-history, never extends a
 *    fresh ledger); a gap of N days costs N tokens if it can be afforded,
 *    otherwise the walk stops there.
 * Tokens are a read-time resource: earning one can visibly repair an old
 * gap. Forgiving by design, honest about nothing-happened-yet.
 */
export function puzzleStreak(
  puzzleDone: Record<string, number>,
  freezes: number,
  todayKey = dayKeyOf(new Date()),
): PuzzleStreak {
  const keys = Object.keys(puzzleDone);
  if (keys.length === 0) return { streak: 0, frozenDays: [] };
  const minSolved = keys.reduce((a, b) => (a < b ? a : b));
  const shift = (k: string, delta: number) => dayKeyOf(addDays(parseKey(k), delta));

  const frozenDays: string[] = [];
  let tokens = freezes;
  let streak = 0;
  let cursor = todayKey;
  // today not yet done → step back; today is still "in progress"
  if (puzzleDone[cursor] === undefined) cursor = shift(todayKey, -1);

  const consumeRun = () => {
    while (puzzleDone[cursor] !== undefined) {
      streak++;
      cursor = shift(cursor, -1);
    }
  };

  // live run
  consumeRun();
  if (cursor < minSolved) return { streak, frozenDays };

  // gaps — bridge only with a solved day on the far side and enough tokens
  for (;;) {
    if (cursor < minSolved) break; // nothing solved further back
    let probe = cursor;
    let gap = 0;
    while (probe >= minSolved && puzzleDone[probe] === undefined) {
      gap++;
      probe = shift(probe, -1);
    }
    if (probe < minSolved || gap > tokens) break; // no far side / can't afford
    tokens -= gap;
    for (let i = 0; i < gap; i++) frozenDays.push(shift(cursor, -i));
    streak += gap;
    cursor = probe;
    consumeRun();
  }
  return { streak, frozenDays };
}

/** How many days of the CURRENT month have elapsed (including today). */
export function elapsedDaysThisMonth(todayKey = dayKeyOf(new Date())): number {
  const { y, m, d } = parseKey(todayKey);
  return d;
}

/** Count of puzzles solved within a given YYYY-MM month. */
export function solvedInMonth(puzzleDone: Record<string, number>, monthKey: string): number {
  let n = 0;
  for (const k in puzzleDone) if (k.startsWith(monthKey)) n++;
  return n;
}

/** True when every elapsed day of `monthKey` (e.g. "2026-09") is solved —
 *  today's ledger and backlog solves both count (a month can be perfected
 *  one month late through the backlog, but never after that). */
export function monthPerfect(
  puzzleDone: Record<string, number>,
  backlogDone: Record<string, number>,
  monthKey: string,
  todayKey = dayKeyOf(new Date()),
): boolean {
  const { y, m } = parseKey(monthKey);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const last =
    todayKey.startsWith(monthKey) ? parseKey(todayKey).d : daysInMonth;
  if (todayKey.startsWith(monthKey) && last < 25) return false; // too early to judge
  for (let d = 1; d <= last; d++) {
    const k = `${monthKey}-${String(d).padStart(2, "0")}`;
    if (puzzleDone[k] === undefined && backlogDone[k] === undefined) return false;
  }
  return true;
}

/** Distinct months (YYYY-MM) that appear in the done ledger. */
export function monthsInLedger(puzzleDone: Record<string, number>): string[] {
  const set = new Set<string>();
  for (const k in puzzleDone) set.add(k.slice(0, 7));
  return [...set].sort();
}

// ---- small date helpers (kept local; gamification's dayKey is the format) --

export function dayKeyOf(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays({ y, m, d }: { y: number; m: number; d: number }, delta: number): Date {
  return new Date(y, m - 1, d + delta);
}
