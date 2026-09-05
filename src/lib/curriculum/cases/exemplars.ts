// Exemplar case files — one per batch slice, written as the quality bar for
// authoring: real memo voice, real audited numbers, per-slot coaching that
// explains the WHY, and a walkthrough that narrates how an analyst thinks.

import type { CaseStudy } from "./types";

export const casesExemplars: CaseStudy[] = [
  {
    id: "cs-016",
    topic: "l2",
    universe: "growth",
    title: "The board pack's catalog snapshot",
    brief:
      "From: Chief of Staff. Re: Thursday's board pack.\n\nI'm assembling the appendix slides and the design team needs our product catalog as raw material — names, categories, list prices. One twist: finance plans next quarter at an 8% markup, so add a planning column showing each price with that markup applied, rounded to cents so the slides don't look messy.",
    ask: "Every product's name, category and price, plus a planning column price_with_tax = price with 8% markup, rounded to 2 decimals.",
    template: `{1} name, category, price,
       ROUND(price * {2}, 2) {3} price_with_tax
{4} products;`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "A read of existing columns starts with SELECT — it declares exactly which fields each row of the result carries.",
      },
      {
        answer: "1.08",
        kind: "number",
        label: "the markup multiplier",
        why: "An 8% markup means the new price is 108% of the old one — multiply by 1.08, not 0.08 (that would compute the 8% slice alone).",
        noVerify: true,
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the column alias",
        why: "AS renames the computed column to price_with_tax — without it the header would be the raw expression text.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "FROM names the table the rows come from; every SELECT needs one (unless it selects literals only).",
      },
    ],
    distractors: ["WHERE", "IS", "WITH", "0.08", "1.8"],
    walkthrough:
      "This is a pure projection: one table, no filtering, no math beyond a per-row calculation. I read the brief as 'which columns, from where, with what rename' — name/category/price come straight off products, the planning column is derived per row, so ROUND(price * 1.08, 2) sits right in the SELECT list where each row gets its own computed value. The two beginner tells here: the multiplier (8% ON a price is 1.08× the price; 0.08× would give you just the tax slice) and the AS alias, which exists purely so the exported spreadsheet has a human column header. Run it and you get 16 rows — the full catalog, one planning price per product.",
  },
  {
    id: "cs-041",
    topic: "l3",
    universe: "refund-audit",
    title: "Cancelled orders worth chasing",
    brief:
      "From: refunds@ internal ticket #4412.\n\nQuarter-end goodwill review. We manually assess cancelled orders that were big enough to hurt — anything over 300 in value. I don't need the list yet, just the size of the queue: how many orders are we talking about? If it's more than a handful we'll staff a temp reviewer for the week.",
    ask: "Count the cancelled orders whose total is greater than 300.",
    template: `SELECT {1}(*)
FROM orders
{2} status = {3} AND total > {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The deliverable is a headcount of rows, so COUNT(*) is the aggregate — SUM would try to add up the text '*' and fail, AVG would make no sense.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row filter",
        why: "Both conditions apply to individual rows before any grouping, so WHERE is the gate. HAVING only makes sense after a GROUP BY.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status value",
        why: "The audit targets cancelled orders specifically — and SQL string literals need the quotes: status = 'cancelled', not bare cancelled.",
      },
      {
        answer: "300",
        kind: "number",
        label: "the value threshold",
        why: "The ticket says 'over 300', so the comparison is total > 300 — strictly greater, orders worth exactly 300.00 would not qualify.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "AVG", "HAVING", "'pending'", "'delivered'", "500"],
    walkthrough:
      "The ask is a queue size, not a list — that's COUNT(*). Both filters are per-row facts (what status is this order? how big is it?), so they belong in WHERE, joined with AND because an order must satisfy both. The trap to respect: 'cancelled' is a value, so it wears quotes; the bare word would be read as a column name and blow up. Run it and the answer is 1 — a single cancelled order clears the 300 bar (the biggest cancellation on file is 397.99). One row in the queue means no temp reviewer needed; finance can clear it by hand.",
  },
  {
    id: "cs-071",
    topic: "l4",
    universe: "month-close",
    title: "The hole in the shipment ledger",
    brief:
      "From: Financial Controller. Re: January close.\n\nBefore I sign the revenue number I need to know what's still in limbo. Our system leaves shipped_at empty until the warehouse confirms dispatch, so orders with a NULL shipped date are, accounting-wise, nowhere. Put one number on my desk: the total value sitting in that state.",
    ask: "Sum of totals across every order that has no shipped date.",
    template: `SELECT {1}(total) AS value_in_limbo
FROM orders
WHERE shipped_at {2} {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the value aggregate",
        why: "You're asked for total value, so SUM adds the totals across rows. COUNT would return a row count and AVG would water it down to a mean.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the NULL operator",
        why: "NULL is not a value you can compare with =; SQL reads shipped_at = NULL as 'unknown equals unknown' and matches nothing. The test for emptiness is IS NULL.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty marker",
        why: "shipped_at IS NULL is the exact predicate for 'no dispatch timestamp yet' — precisely the limbo state the controller described.",
      },
    ],
    distractors: ["COUNT", "=", "NOT NULL", "0"],
    walkthrough:
      "Two ideas carry this query. First, the accounting state: an order with no dispatch confirmation has shipped_at = NULL, and the only correct predicate is IS NULL — the classic = NULL looks symmetric but evaluates to unknown for every row and returns an empty set, silently reporting a limbo value of nothing. Second, the deliverable: SUM(total) over the surviving rows. The result is 7,265.49 across 21 orders — that's the value the controller will hold out of the signed revenue. Cross-check worth knowing: those 21 unshipped orders are exactly the 14 pending plus 7 cancelled ones, because shipped_at is only ever stamped for orders that actually leave the building.",
  },
  {
    id: "cs-091",
    topic: "l5",
    universe: "fraud",
    title: "Three biggest tickets for manual review",
    brief:
      "From: Risk team, spot-check rotation.\n\nMonthly fraud sweep. Policy: we eyeball the largest orders by value, biggest first, capped at three per cycle — that's what the review team can clear in a sitting. Send the order ids with their totals so the reviewers can pull the full records.",
    ask: "Order id and total for the 3 highest-value orders, sorted biggest first.",
    template: `SELECT id, total
FROM orders
{1} BY total {2}
{3} {4};`,
    slots: [
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the sort clause",
        why: "Ranking rows by value is sorting, so ORDER BY. GROUP BY would collapse the table into value-buckets instead of listing individual orders.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest first means descending. The default ASC would hand the reviewers the three smallest orders — the opposite of the policy.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the row cap",
        why: "LIMIT 3 trims the result to the first three rows after sorting — exactly the review team's per-cycle capacity.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the cap size",
        why: "The policy caps the sweep at three tickets per cycle — no more, no fewer.",
        noVerify: true,
      },
    ],
    distractors: ["GROUP", "ASC", "OFFSET", "TOP", "5"],
    walkthrough:
      "'Biggest first, capped at three' decomposes into three independent clauses: sort by total, descending, then cut. ORDER BY total DESC does the ranking; LIMIT 3 does the cutting — and the order of operations matters, because LIMIT applies after the sort, so you truly get the three largest, not just any three. The rows that come back: order 74 at 1,088.44, order 43 at 945.21, order 39 at 845.92. One thing worth flagging to the risk team: the two biggest tickets are both still pending — large, undelivered, and worth looking at early.",
  },
  {
    id: "cs-136",
    topic: "l7",
    universe: "month-close",
    title: "Headline numbers for the close deck",
    brief:
      "From: Financial Controller. Re: slide 1 of the close deck.\n\nEvery close deck opens with two numbers: total booked revenue and the average order value, both rounded so the slide looks deliberate. These come straight off the orders table — all statuses, no filters, the raw shape of the period. Two cells, nothing else.",
    ask: "One row with total revenue across all orders and the average order value, both rounded to 2 decimals.",
    template: `SELECT {1}(total) AS revenue,
       ROUND({2}(total), 2) AS avg_order
FROM {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the total aggregate",
        why: "Total revenue means every total added together — SUM. COUNT would give an order count, MAX only the single largest.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean aggregate",
        why: "Average order value is the mean of the total column — AVG. Wrapped in ROUND(...,2) it lands on clean cents for the slide.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Order values live in orders.total — order_items has per-line prices (no total column) and products is the catalog, not transactions.",
      },
    ],
    distractors: ["COUNT", "MAX", "MIN", "SUM", "order_items", "products"],
    walkthrough:
      "Aggregates collapse a column into one number, and this deck slide needs the two canonical ones: SUM for the total, AVG for the mean. No WHERE clause — the controller explicitly said all statuses — so the aggregates sweep all 103 orders. The numbers that land: revenue 34,833.28 and average order 338.19. Analyst habit worth copying: when two headline aggregates must be comparable, compute them in one query (one pass, one row, impossible to mismatch filters between cells). And notice ROUND wraps only the AVG — SUM of money at 2 decimals is already cent-exact here.",
  },
  {
    id: "cs-166",
    topic: "l8",
    universe: "pricing",
    title: "Categories carrying premium pricing",
    brief:
      "From: Head of Product. Re: pricing review kickoff.\n\nWe're repositioning the catalog and I want to know where premium perception already exists. Show me the categories whose average price is already above 100 — those are the shelves we build the premium story on. Category name plus its average price to 2 decimals, please.",
    ask: "Each category with average price above 100, showing the category and its average price rounded to 2 decimals.",
    template: `SELECT category, ROUND({1}(price), 2) AS avg_price
FROM products
{2} BY category
{3} AVG(price) > {4};`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean aggregate",
        why: "The brief is about average price, so AVG(price) inside the rounding — SUM would add the shelves' prices together and misrepresent every category.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "One output row per category requires GROUP BY category — it partitions the 16 products into shelves so aggregates compute per shelf.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the group filter",
        why: "The filter applies to an aggregate (AVG after grouping), and aggregates can't live in WHERE — filtering groups is exactly what HAVING exists for.",
      },
      {
        answer: "100",
        kind: "number",
        label: "the premium threshold",
        why: "The brief defines premium as an average above 100 — strictly greater, so a category averaging exactly 100.00 would miss the cut.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "COUNT", "ORDER", "WHERE", "150", "50"],
    walkthrough:
      "The question shape is 'per-bucket metric, filtered on the metric' — a GROUP BY with a HAVING. GROUP BY category builds one bucket per shelf; AVG(price) measures each; HAVING keeps only the buckets above the bar. The threshold lands in HAVING, not WHERE, because WHERE runs before buckets exist and cannot see averages. Two categories clear the 100 bar: Wearables at 139.50 and Audio at 109.66 — those carry the premium story. Watch the distractor ORDER: ORDER BY category would list every shelf unfiltered — sorted, yes, but the premium question unanswered.",
  },
];
