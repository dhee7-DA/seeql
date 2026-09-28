// Case batch M11 — Query Performance & Index Design (lesson 64),
// cs-1993…cs-2002: "Reading the plan" (p1) + "Index design" (p2).
// Read-only rebuilds of the queries whose plans the module reads — every
// figure anchored live: statuses 52/30/14/7 · 84 order days · top totals
// 1088.44/945.21/845.92 · customer 1 = 24 orders $7,262.35 · 16 products / 6
// suppliers / 251 order_items / 103 orders · schema starts with ZERO indexes.
import type { CaseStudy } from "./types";

export const casesP1: CaseStudy[] = [
  {
    id: "cs-1993",
    tier: "easy",
    topic: "p1",
    universe: "funnel",
    title: "The four verdicts",
    brief:
      "From: Performance. Re: the ops board.\n\nEvery funnel review opens with this board — one row per status, the count and the average order value. It is also THE query whose plan reads 'SCAN orders': the sweep the module teaches you to recognize. Rebuild it: statuses grouped, counts, averages rounded, biggest group first.",
    ask: "Per status: the status, order count n, and avg_total (2dp) — biggest groups first.",
    template: `SELECT status, COUNT(*) AS n,
  ROUND({1}({3}), 2) AS avg_total
FROM orders
GROUP BY {2}
ORDER BY n DESC;`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the board's aggregate",
        why: "avg_total is AVG(total) — the average order value per status. SUM would print the status's whole revenue under an average's name and misread the board.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the grouping column",
        why: "Four statuses, four rows: GROUP BY status. Grouping by a key that isn't displayed (or by id) destroys the board's grain — one row per status is the contract.",
      },
      {
        answer: "total",
        kind: "keyword",
        label: "the averaged measure",
        why: "The board's money view is AVG(total) — the average order value per status. Averaging id would print a meaningless number; averaging the total is what the close actually reads.",
      },
    ],
    distractors: ["SUM", "MAX", "id", "customer_id", "shipped_at"],
    walkthrough:
      "SELECT status, COUNT(*) AS n, ROUND(AVG(total), 2) AS avg_total FROM orders GROUP BY status ORDER BY n DESC — four rows: delivered 52, shipped 30, pending 14, cancelled 7. This is the query behind the module's most-quoted plan line: with no index on status, EXPLAIN QUERY PLAN says SCAN orders — every row read to build four groups. At 103 rows that's the right plan; at ten million it's the board that gets an index or a summary table. The plan is a fact, the grain is a choice, and both live in this one rebuild.",
  },
  {
    id: "cs-1994",
    tier: "easy",
    topic: "p1",
    universe: "fraud",
    title: "The rowid window",
    brief:
      "From: Fraud desk. Re: the id-range probe.\n\nThe fraud sweep pages through orders by id — the one lookup SQLite gives you for free, because INTEGER PRIMARY KEY IS the rowid b-tree. Rebuild the probe for the id window [50, 60): the count of orders and their average total, using the half-open spelling an index descent would serve.",
    ask: "Orders with id from 50 (inclusive) to 60 (exclusive): count n and avg_total (2dp).",
    template: `SELECT COUNT(*) AS n,
  ROUND(AVG({3}), 2) AS avg_total
FROM orders
WHERE id {1} 50
  AND id {2} 60;`,
    slots: [
      {
        answer: ">=",
        kind: "keyword",
        label: "the inclusive lower bound",
        why: "Half-open windows start with >=: order 50 itself is in. A bare > would silently drop it — the classic off-by-one that changes the census without any error.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the exclusive upper bound",
        why: "The window ends with < 60: order 60 is out. Half-open ranges tile perfectly — [50,60) plus [60,70) never overlaps and never gaps, which is why plans and code both prefer them.",
      },
      {
        answer: "total",
        kind: "keyword",
        label: "the averaged measure",
        why: "The probe's money column is total — the average order value inside the id window. It's the payload the rowid descent fetches per row.",
      },
    ],
    distractors: [">", "<=", "=", "unit_price"],
    walkthrough:
      "WHERE id >= 50 AND id < 60 — ten orders, ids 50 through 59, one clean row back with their average total. The plan for this shape is the module's 'free descent': SEARCH orders USING INTEGER PRIMARY KEY (rowid=?) — no CREATE INDEX required, because the id column IS the table's b-tree. And the spelling matters beyond id: half-open ranges are the index-friendly shape for dates too (>= '2024-07-01' AND < '2024-08-01'), where BETWEEN's inclusive end quietly drops rows with time components. Free structure, honest windows.",
  },
  {
    id: "cs-1995",
    tier: "easy",
    topic: "p1",
    universe: "growth",
    title: "The top of the sweep",
    brief:
      "From: Growth board. Re: the leaderboard.\n\nThe leaderboard shows the biggest orders — and its plan is the module's sort-surcharge exhibit: SCAN orders plus USE TEMP B-TREE FOR ORDER BY, a structure built on every page load because no index on total exists. Rebuild the query itself: the 3 largest orders by total, heaviest first.",
    ask: "The three largest orders: id and total, heaviest first.",
    template: `SELECT id, total
FROM orders
ORDER BY {1} {2}
LIMIT {3};`,
    slots: [
      {
        answer: "total",
        kind: "keyword",
        label: "the ranked measure",
        why: "Biggest orders means ORDER BY total. Total is also the column the missing index would carry — sorting by it without one is what builds the temp b-tree.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the heaviest-first direction",
        why: "DESC puts the biggest total first. Flip it to ASC and the leaderboard congratulates the cheapest cart — same plan, opposite business meaning.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the leaderboard depth",
        why: "LIMIT 3 — the podium. The LIMIT never removes the sort: the engine still orders every row (or walks a tree) before handing back three.",
      },
    ],
    distractors: ["id", "ASC", "5"],
    walkthrough:
      "SELECT id, total FROM orders ORDER BY total DESC LIMIT 3 — ids 74 ($1,088.44), 43 ($945.21), 39 ($845.92). The plan, on this zero-index schema: SCAN orders, then USE TEMP B-TREE FOR ORDER BY — a temporary sorted structure materialized on every request, discarded, rebuilt next load. The performance fix is sort-serving: an index on orders(total) reads out pre-sorted (backwards for DESC — b-trees walk both ways for free), and the temp b-tree line vanishes. Until then, this query pays the sort tax on every render — which is exactly why the plan gets read before the caching band-aids.",
  },
  {
    id: "cs-1996",
    tier: "medium",
    topic: "p1",
    universe: "month-close",
    title: "The close's monthly census",
    brief:
      "From: Controller. Re: close night.\n\nThe close runs the monthly census: for every month, the order count and the money — cancelled orders excluded, months in calendar order. Its plan carries the grouping tax (SCAN + USE TEMP B-TREE FOR GROUP BY) because the month slice isn't sorted in any tree. Rebuild the census.",
    ask: "Per month: month, order count n, revenue (2dp) — cancelled excluded, calendar order.",
    template: `SELECT SUBSTR(created_at, 1, 7) AS {1},
  COUNT(*) AS n,
  ROUND(SUM({2}), 2) AS revenue
FROM orders
WHERE status != {3}
GROUP BY month
ORDER BY month;`,
    slots: [
      {
        answer: "month",
        kind: "keyword",
        label: "the bucket alias",
        why: "SUBSTR(created_at, 1, 7) slices '2024-07-15' to '2024-07' — aliased month, the grain every consumer filters and groups by. The alias is the census's public API.",
      },
      {
        answer: "total",
        kind: "keyword",
        label: "the summed measure",
        why: "Revenue is SUM(total) — the order ledger's money column. Summing ids or dates produces numbers that look plausible and mean nothing.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the excluded status",
        why: "status != 'cancelled' keeps delivered, shipped AND pending — all the money that is real or in flight. Filtering to 'delivered' alone would quietly understate every month.",
      },
    ],
    distractors: ["year", "id", "'delivered'"],
    walkthrough:
      "Fourteen months, 2024-01 through 2025-02, each with its count and rounded revenue, cancelled excluded. The plan is the teaching point: SCAN orders, then USE TEMP B-TREE FOR GROUP BY — grouping wants rows in month order, and with no sorted source the engine builds a temporary tree on every close-night run. The index-friendly rewrite keeps the slice for DISPLAY but filters on the bare column (created_at >= '2024-01-01' AND < '2025-01-01'), which a timeline index serves as two seek bounds. Display with functions, filter with ranges — the close gets both.",
  },
  {
    id: "cs-1997",
    tier: "medium",
    topic: "p1",
    universe: "catalog",
    title: "The catalogue census",
    brief:
      "From: Catalog. Re: the pricing review.\n\nThe merch team's board: for every product category, how many products and the average price — but only categories with at least one product, biggest first. This is the grouped shape the planner meets constantly; rebuild it over the 16-product catalogue.",
    ask: "Per category with at least 1 product: category, n, avg_price (2dp) — biggest n first.",
    template: `SELECT category, COUNT(*) AS n,
  ROUND(AVG({1}), 2) AS avg_price
FROM products
GROUP BY category
HAVING COUNT(*) {2} {3}
ORDER BY n DESC, category;`,
    slots: [
      {
        answer: "price",
        kind: "keyword",
        label: "the averaged measure",
        why: "avg_price is AVG(price) — the category's price point. Averaging stock or ids would render a column the pricing review can't use.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the inclusion operator",
        why: "HAVING COUNT(*) >= 1 keeps every category that exists — the filter that documents itself. Flip the operator and the board silently shows nothing.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the inclusion threshold",
        why: "The threshold is 1 — at least one product. The clause looks redundant today, but it's the hook the review tightens to '>= 3' when the board needs substance filters.",
      },
    ],
    distractors: ["stock", "<", "="],
    walkthrough:
      "Products grouped by category, counted, averaged on price, kept with >= 1, biggest groups first with the category as deterministic tiebreak. Every grouped query like this one meets the same planner arithmetic the module teaches: aggregates want grouped rows, grouped rows want sorted input, and with no index serving the sort the plan adds a temp b-tree. The HAVING threshold is written as a clause (>= 1), not a hardcoded row count, so the business rule — not LIMIT — decides what survives. Change the rule, rerun the census, and the board updates itself.",
  },
  {
    id: "cs-1998",
    tier: "easy",
    topic: "p2",
    universe: "funnel",
    title: "The heavy hitters",
    brief:
      "From: Data eng. Re: the retention census.\n\nThe census that justifies the composite index: customers with at least 10 orders, their lifetime money summed, busiest first. Four accounts make the bar — and they're the reason the account page gets a covering composite. Rebuild the census.",
    ask: "Customers with at least 10 orders: customer_id, n, lifetime = SUM(total) — busiest first.",
    template: `SELECT customer_id, COUNT(*) AS n,
  {1}({2}) AS lifetime
FROM orders
GROUP BY customer_id
HAVING COUNT(*) >= {3}
ORDER BY n DESC, customer_id;`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the lifetime aggregate",
        why: "Lifetime value is SUM(total) — every order's money added up per customer. AVG would print their average cart; the retention team wants the stock, not the flow.",
      },
      {
        answer: "total",
        kind: "keyword",
        label: "the summed column",
        why: "orders.total carries the money. Summing ids or customer_ids produces numbers with no business meaning — the aggregate verb is only half of the pair.",
      },
      {
        answer: "10",
        kind: "number",
        noVerify: true,
        label: "the heavy-hitter bar",
        why: "At least 10 orders — the rule in the clause, not a hardcoded row count. The four survivors (24, 17, 14, 13) are the data's answer, and the bar moves with the business.",
      },
    ],
    distractors: ["AVG", "MAX", "quantity", "status"],
    walkthrough:
      "GROUP BY customer_id, HAVING COUNT(*) >= 10, SUM(total) as the lifetime — four rows: customer 1 with 24 orders, then 17, 14, 13. This census is the bridge between performance work and business value: these four accounts generate the repeated account-page visits, and repeated visits are what justify the (customer_id, created_at) covering composite from the lesson. The plan for the census itself scans all 103 orders and sorts groups in a temp b-tree — acceptable for a nightly census, unacceptable for the page loads in between. That contrast IS index design: batch work sweeps, hot paths descend.",
  },
  {
    id: "cs-1999",
    tier: "medium",
    topic: "p2",
    universe: "fraud",
    title: "The account probe",
    brief:
      "From: Fraud desk. Re: the account page.\n\nThe probe the composite index serves: customer 1's full ledger — order count, lifetime money, average cart — in one row. It runs on every account visit; the (customer_id, …) index turns it from a 103-row sweep into a 24-row descent. Rebuild the probe.",
    ask: "Customer 1's ledger: order count n, lifetime = SUM(total), avg_total (2dp).",
    template: `SELECT COUNT(*) AS n,
  {1}({2}) AS lifetime,
  ROUND(AVG(total), 2) AS avg_total
FROM orders
WHERE customer_id {3} 1;`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the lifetime aggregate",
        why: "SUM(total) is the lifetime money — customer 1's 24 orders add to $7,262.35. The other aggregates would answer different questions (average cart, biggest order).",
      },
      {
        answer: "total",
        kind: "keyword",
        label: "the money column",
        why: "The ledger's money lives in orders.total. Inside the aggregate it must be the column the business sums — nothing else produces a lifetime value.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the account selector",
        why: "customer_id = 1 — the equality probe. Equality on the index's leftmost column is exactly what a composite descends; the plan flips from SCAN to SEARCH the moment the tree exists.",
      },
    ],
    distractors: ["AVG", "MAX", "id", "!="],
    walkthrough:
      "One row for customer 1: 24 orders, $7,262.35 lifetime, a ~$302.60 average cart. The equality predicate customer_id = 1 is the shape every index discussion starts from — sixteen distinct customers across 103 orders means an average probe lands on ~6 rows, and customer 1 (the heaviest) on 24: both beat the 103-row scan, which is why the composite's leftmost column is customer_id. The probe also shows the aggregate trio in context: COUNT for the activity, SUM for the stock, AVG for the flow — one sweep today, one descent after the index, same numbers either way.",
  },
  {
    id: "cs-2000",
    tier: "medium",
    topic: "p2",
    universe: "supplier",
    title: "The phone-book census",
    brief:
      "From: Data eng. Re: the FK review.\n\nBefore indexing products.supplier_id, review what probes it serves: suppliers grouped with their product counts and average rating — kept where a supplier has at least one product, biggest first. It's the phone-book test in data: what does the tree actually look up?",
    ask: "Per supplier with at least 1 product: supplier_id, n, avg_price (2dp) — biggest n first.",
    template: `SELECT supplier_id, COUNT(*) AS n,
  ROUND({1}(price), 2) AS avg_price
FROM products
GROUP BY {2}
HAVING COUNT(*) >= 1
ORDER BY n {3}, supplier_id;`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the price aggregate",
        why: "avg_price is AVG(price) — the supplier's catalogue price point. SUM of prices would grow with catalogue size and mislead the review.",
      },
      {
        answer: "supplier_id",
        kind: "keyword",
        label: "the grouping key",
        why: "GROUP BY supplier_id — one row per supplier, the FK the review is deciding whether to index. Grouping by anything else changes the census's whole grain.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first direction",
        why: "n DESC puts the most-stocked supplier first, with supplier_id as the deterministic tiebreak — the same ordering discipline the ranking lessons teach.",
      },
    ],
    distractors: ["MAX", "category", "id", "ASC"],
    walkthrough:
      "Six suppliers, each with their product count and average catalogue price, biggest catalogues first. This is the census to run BEFORE building the FK index: how many products per supplier? If probes land on handfuls of rows (16 products ÷ 6 suppliers ≈ 2–3), the index earns its keep for the supplier page; if the table were one supplier, it wouldn't. Selectivity first, CREATE INDEX second — the same arithmetic the planner runs, done by hand. The HAVING >= 1 documents that only real suppliers appear, and the tiebreak keeps the board stable between runs.",
  },
  {
    id: "cs-2001",
    tier: "medium",
    topic: "p2",
    universe: "month-close",
    title: "The repeat-biller census",
    brief:
      "From: Controller. Re: AR follow-ups.\n\nCollections works the customers with multiple invoices: who has at least 2 on the books, how many, and how much they've been billed in total — heaviest billers first. It's the probe a foreign-key index on invoices would serve all day. Rebuild the census.",
    ask: "Customers with at least 2 invoices: customer_id, n, billed = SUM(amount_cents)/100 — biggest n first.",
    template: `SELECT customer_id, COUNT(*) AS n,
  ROUND({1}(amount_cents) / 100.0, 2) AS billed
FROM invoices
GROUP BY customer_id
HAVING COUNT(*) >= {2}
ORDER BY n {3}, customer_id;`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the billing aggregate",
        why: "SUM(amount_cents) totals the customer's billed money — integer cents divided by 100 for dollars. The AR team works the stock of debt, not the average invoice.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the repeat threshold",
        why: "At least 2 invoices makes a customer a REPEAT biller — one invoice is normal business. The threshold lives in the HAVING clause, where the rule is readable and movable.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the heaviest-first direction",
        why: "n DESC — the most-invoiced customers lead the call list, ties broken by customer_id for determinism. Collections starts at the top.",
      },
    ],
    distractors: ["AVG", "3", "ASC", "MAX"],
    walkthrough:
      "The AR follow-up list: customers holding two or more of the 28 invoices, their counts, and their billed totals in dollars — SUM(amount_cents)/100.0 with the cents-to-dollars discipline this course's finance module lives by. Grouped queries like this one are why FK columns end up indexed: every collections run, every account view, every dunning letter groups or filters by customer_id, and each of those probes is a descent with a tree or a sweep without one. The census reads the same either way — the plan is what changes.",
  },
  {
    id: "cs-2002",
    tier: "hard",
    topic: "p2",
    universe: "expense",
    title: "The spend report",
    brief:
      "From: Expense. Re: the vendor review.\n\nThe finance team's spend board: per vendor, the expense count and the total dollars (cents converted, rounded) — and the whole board ordered biggest spender first with a stable tiebreak. It's the grouped aggregate the vendor-probe index would serve. Rebuild it.",
    ask: "Per vendor: vendor, expense count n, dollars = SUM(amount_cents)/100 (2dp) — biggest n first.",
    template: `SELECT vendor, COUNT(*) AS n,
  ROUND(SUM({1}) / 100.0, 2) AS dollars
FROM expenses
GROUP BY {2}
ORDER BY n {3}, vendor;`,
    slots: [
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "the money column",
        why: "The expenses ledger keeps money in integer cents — SUM(amount_cents) then /100.0 converts to dollars the report can print. Summing the wrong column mints phantom money.",
      },
      {
        answer: "vendor",
        kind: "keyword",
        label: "the grouping key",
        why: "GROUP BY vendor — one row per vendor, the grain of the spend review and the column any vendor probe would filter. Grouping by category or date changes the meeting.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first direction",
        why: "n DESC — the most expense EVENTS first (count, not dollars — that's this board's sort), vendor as the deterministic tiebreak.",
      },
    ],
    distractors: ["id", "spent_on", "ASC"],
    walkthrough:
      "The 36 expenses fold into per-vendor rows: count and dollar total, biggest event-counts leading. Every clause here is a performance decision in disguise: GROUP BY vendor is the probe pattern (equalities on vendor descend a tree once it exists), the ORDER BY wants sorted output (a covering (vendor, amount_cents) index would even serve the group sum from the tree alone), and the cents-to-dollars conversion keeps the finance module's integer-money contract. The board reads identically before and after indexing — the plan, the latency, and the write bill are what change.",
  },
];
