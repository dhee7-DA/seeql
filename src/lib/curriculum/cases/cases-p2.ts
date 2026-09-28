// Case batch M11 (part 2) — "Covering & composite" (p3) + "Perf capstone" (p4),
// cs-2003…cs-2012. Read-only rebuilds; anchored live facts: delivered = 52
// orders / $15,571.07 · customer 1 = 24 orders · 84 order days · statuses
// 52/30/14/7 (pending+shipped = 44) · July 2024 = 8 orders · customers
// 'A%' = 1 and '%a%' = 14 · 12 fiscal-2024 months · 16 products / 6 suppliers.
import type { CaseStudy } from "./types";

export const casesP2: CaseStudy[] = [
  {
    id: "cs-2003",
    tier: "medium",
    topic: "p3",
    universe: "funnel",
    title: "The covered board",
    brief:
      "From: Funnel. Re: the status probe.\n\nThe query the status-total covering index was built to answer: delivered orders only — the count and the money in one row, at least 52 orders so the filter is honest. On a real engine its plan prints USING COVERING INDEX; the tree answers without touching the table. Rebuild the probe.",
    ask: "Delivered orders: status, n, board = SUM(total) — one row, at least 52 orders.",
    template: `SELECT status, COUNT(*) AS n,
  {1}(total) AS board
FROM orders
WHERE status = {2}
GROUP BY status
HAVING COUNT(*) {3} 52;`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the board's money aggregate",
        why: "SUM(total) is the delivered money — $15,571.07 across 52 orders. AVG would print the average cart (~$299.44) and the board would read the wrong story.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the probed status",
        why: "The board probes one status at a time — delivered is the money view. The equality on status is the leftmost column the covering tree descends.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the guard operator",
        why: "HAVING COUNT(*) >= 52 keeps the row only when the group is the full delivered cohort — a self-check that the filter matched everything it should.",
      },
    ],
    distractors: ["AVG", "'shipped'", "<", ">"],
    walkthrough:
      "One row: delivered, 52 orders, $15,571.07. This is the covering-index showcase query: SELECT the status you filter by and the total you display — both columns live inside (status, total), so the plan prints SCAN orders USING COVERING INDEX idx_orders_status_total (status=?) and the table b-tree is never visited. The HAVING >= 52 is a cheap integrity guard: it admits only the full delivered cohort, so a mis-typed filter can't publish a half-census as the board. Covering design is exactly this: filter column leftmost, payload column appended, nothing left to fetch.",
  },
  {
    id: "cs-2004",
    tier: "medium",
    topic: "p3",
    universe: "growth",
    title: "The account timeline",
    brief:
      "From: Growth. Re: the account page.\n\nCustomer 1's order history, chronologically — the query the (customer_id, created_at) covering composite answers entirely from the tree: filter on the leftmost column, read the payload, even skip the sort because entries within the customer are stored in date order. Rebuild the page's query.",
    ask: "Customer 1's orders: created_at and total, oldest first, stable by id.",
    template: `SELECT {1}, total
FROM orders
WHERE customer_id = {2}
ORDER BY created_at {3}, id;`,
    slots: [
      {
        answer: "created_at",
        kind: "keyword",
        label: "the timeline column",
        why: "The account page is a timeline — created_at is both the display column and the composite's second entry, which is why the tree serves the sort for free.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the probed account",
        why: "Customer 1 — Alice, 24 orders, the store's heaviest account and the reason the composite pays for itself. Any account id probes the same shape.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the oldest-first direction",
        why: "A timeline reads oldest first — ASC, with id as the deterministic tiebreak for same-day orders. Flip it and the account story ends before it begins.",
      },
    ],
    distractors: ["status", "2", "DESC"],
    walkthrough:
      "Twenty-four rows: customer 1's orders, oldest first, id as the deterministic tiebreak for same-day orders. On the zero-index schema this sweeps 103 rows and sorts; with (customer_id, created_at) the plan becomes a covered index walk — filter served by the leftmost column, payload (created_at) carried in the tree, ORDER BY satisfied by the stored order. Three clauses, one index, zero table fetches. That's the covering composite's whole pitch: the queries you run thousands of times a day deserve a tree that contains them entirely.",
  },
  {
    id: "cs-2005",
    tier: "medium",
    topic: "p3",
    universe: "inventory",
    title: "The backward walk",
    brief:
      "From: Warehouse. Re: the newest-stock report.\n\nSomeone proposed a second index 'for the DESC version' of the newest-orders report. The rebuttal is this query: the three highest ids — because ORDER BY id IS a walk of the rowid tree, and DESC is the same tree read backwards. One index, both directions, no duplicate trees.",
    ask: "The three newest orders by id: id, created_at, total — highest id first.",
    template: `SELECT id, created_at, {1}
FROM orders
ORDER BY id {2}
LIMIT {3};`,
    slots: [
      {
        answer: "total",
        kind: "keyword",
        label: "the display column",
        why: "The report shows each order's money next to its date — total is the payload fetched per row. On the rowid walk it's the table lookup after each index entry.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the newest-first direction",
        why: "Highest ids are the newest orders, and id is the rowid — the tree IS sorted by it, walked backwards for DESC at zero extra cost. This is why a 'DESC index' proposal dies.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the page depth",
        why: "LIMIT 3 — the report's page. On the rowid tree this is a three-entry backward walk; no temp b-tree, no scan, no second index.",
      },
    ],
    distractors: ["status", "customer_id", "ASC", "5"],
    walkthrough:
      "The three highest-id orders with their dates and totals — a query whose plan is already perfect on the zero-index schema, because id is INTEGER PRIMARY KEY: the rowid b-tree is the index. ORDER BY id DESC is a backward walk of that tree (b-trees are linked both ways — one structure serves ASC and DESC for a single key), LIMIT stops it after three entries. The proposal for a second 'DESC' index would have doubled the write bill to duplicate a walk the engine does for free. Read the plan, know the tree, decline the index.",
  },
  {
    id: "cs-2006",
    tier: "hard",
    topic: "p3",
    universe: "pricing",
    title: "The hostile rewrite",
    brief:
      "From: Pricing. Re: the July report.\n\nThe report spells its month filter with SUBSTR — and even with an index on created_at, that shape scans forever, because a function on the column hides the sort order. Rewrite the predicate the index-friendly way (bare column, half-open range) and produce July's stats: order count and total money.",
    ask: "July 2024 orders: july_stat = SUM(total), n — date filter as a bare-column half-open range.",
    template: `SELECT {1}(total) AS july_stat, COUNT(*) AS n
FROM orders
WHERE created_at {2} '2024-07-01'
  AND created_at {3} '2024-08-01';`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the month's money aggregate",
        why: "SUM(total) is July's booked money. The count rides alongside; the money is the number the pricing review argues about.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the inclusive month start",
        why: "created_at >= '2024-07-01' — the bare column against a constant: the exact shape an index descends. The SUBSTR spelling computed the same rows and forfeited every tree.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the exclusive month end",
        why: "< '2024-08-01' closes the window without losing any moment of July 31st — BETWEEN '2024-07-01' AND '2024-07-31' would drop the month's last day the moment times are involved.",
      },
    ],
    distractors: ["AVG", "MAX", "<", "!=", "="],
    walkthrough:
      "Eight July orders and their summed total — same rows the SUBSTR spelling returned, completely different plan: the half-open range on the bare column (>= '2024-07-01' AND < '2024-08-01') is a seekable window that an index on created_at serves as two descent bounds. This is the module's core rewrite: functions on the column (SUBSTR, DATE, CAST, UPPER) hide the sort order and sentence the query to a scan; the bare-column range keeps the tree visible. Fix the query first — it's free and portable — and reach for expression indexes only when the query can't be touched.",
  },
  {
    id: "cs-2007",
    tier: "medium",
    topic: "p3",
    universe: "refund-audit",
    title: "The wildcard bill",
    brief:
      "From: Support. Re: the search box.\n\nThe search runs both spellings — names starting with a letter (index-friendly prefix seek) and names containing one (a scan forever). Show the bill: for customers whose name CONTAINS an 'a', the count and the highest id, keeping only groups of at least 10 matches.",
    ask: "Customers with names containing 'a' (via the LIKE census): n, top_id = MAX(id) — at least 10 matches.",
    template: `SELECT COUNT(*) AS n, MAX({1}) AS top_id
FROM customers
WHERE name LIKE {2}
HAVING COUNT(*) {3} 10;`,
    slots: [
      {
        answer: "id",
        kind: "keyword",
        label: "the maximized column",
        why: "MAX(id) is the most recent matching customer — a deterministic audit anchor. Maxing a text column would return lexicographic nonsense.",
      },
      {
        answer: "'%a%'",
        kind: "keyword",
        label: "the containment pattern",
        why: "The leading wildcard is the always-scan shape: no entry point into any tree, every row read and tested. Fourteen of 16 customers match — the prefix spelling ('A%') would descend and find one.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the census guard",
        why: "HAVING COUNT(*) >= 10 documents that this census only reports when the match set is big — the guard that keeps a near-empty result from reading as a trend.",
      },
    ],
    distractors: ["region", "active", "'A%'", "<"],
    walkthrough:
      "Fourteen customers contain an 'a' in their name — and the plan for this query is a full scan of all 16, because '%a%' has no prefix to seek. Contrast the prefix spelling 'A%' (one customer): a descent to the A-band, the same family as >= / <. Same operator, opposite access methods — the wildcard's POSITION decides. The design consequence for the search box: autocomplete (prefix) indexes beautifully; containment search needs full-text machinery, not a b-tree. And the HAVING guard keeps the census honest about its own size.",
  },
  {
    id: "cs-2008",
    tier: "hard",
    topic: "p4",
    universe: "month-close",
    title: "The tuned close report",
    brief:
      "From: Controller. Re: close-night rewrite.\n\nCapstone the module: fiscal-2024 monthly revenue, cancelled excluded — the date window spelled on the BARE column as a half-open range so the timeline index can serve it as two seek bounds, while the display keeps its month slice. Twelve months of truth, seekable end to end.",
    ask: "Fiscal-2024 monthly revenue (cancelled excluded): month, revenue (2dp), calendar order.",
    template: `SELECT SUBSTR(created_at, 1, 7) AS month,
  ROUND(SUM(total), 2) AS revenue
FROM orders
WHERE created_at {1} '2024-01-01'
  AND created_at {2} '2025-01-01'
  AND status != {3}
GROUP BY month
ORDER BY month;`,
    slots: [
      {
        answer: ">=",
        kind: "keyword",
        label: "the fiscal year's open end",
        why: "created_at >= '2024-01-01' — the bare-column lower bound the timeline index descends to. The slice stays in the SELECT for display; the filter stays bare for the tree.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the fiscal year's exclusive end",
        why: "< '2025-01-01' keeps every moment of December 31st — the half-open spelling that BETWEEN's inclusive end breaks the day timestamps enter the picture.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the excluded status",
        why: "The close books real and in-flight money — delivered, shipped, pending — and excludes only cancellations. That's the same gate every revenue view in this course uses.",
      },
    ],
    distractors: ["<", ">", "<=", "'delivered'"],
    walkthrough:
      "Twelve monthly rows: the fiscal-2024 close, cancelled excluded, calendar order. The rewrite is the module in one query — display uses SUBSTR (the alias is presentation), the WHERE uses bare created_at in a half-open range (two seek bounds for the timeline index), and the status gate keeps the business rule explicit instead of baked into a view nobody can tune. Run EXPLAIN QUERY PLAN before and after the index exists and watch SCAN become SEARCH — the plan is the receipt for the whole exercise.",
  },
  {
    id: "cs-2009",
    tier: "medium",
    topic: "p4",
    universe: "fraud",
    title: "The pipeline probe",
    brief:
      "From: Fraud. Re: the in-flight filter.\n\nThe pipeline probe grew arm by arm into `status = 'pending' OR status = 'shipped'` — same column, two arms. Fold it into the single-predicate spelling (one column, one index, N descents), then produce the pipeline's numbers: the count and the total money.",
    ask: "In-flight orders (pending + shipped): pipeline = SUM(total), n — folded into one IN predicate.",
    template: `SELECT {1}(total) AS pipeline, COUNT(*) AS n
FROM orders
WHERE status {2} ('pending', {3});`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the in-flight money aggregate",
        why: "SUM(total) over the pipeline is the money in motion — the number the fraud desk watches. COUNT rides along; the money is the headline.",
      },
      {
        answer: "IN",
        kind: "keyword",
        label: "the folded predicate",
        why: "Same-column OR folds into IN — one readable predicate that plans as one index descent per listed value. It also can't drift into the cross-column OR trap, where arms want different trees and the planner scans.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the second in-flight state",
        why: "Pending AND shipped are the pipeline — 14 + 30 = 44 orders between cart and doorstep. Delivered and cancelled are the story's ends, not its middle.",
      },
    ],
    distractors: ["AVG", "NOT IN", "'delivered'", "'cancelled'"],
    walkthrough:
      "One row: 44 in-flight orders and their summed total. The rewrite looks cosmetic and plans materially: status IN ('pending','shipped') is two descents of one tree once the status index exists — and adding a third state is adding a list item, not a third OR arm. The trap it forecloses: cross-column OR (status = ? OR customer_id = ?), where each arm wants a different index and one table access gets one. Same column → IN. Different columns → two probes via UNION ALL, or accept the scan knowingly.",
  },
  {
    id: "cs-2010",
    tier: "hard",
    topic: "p4",
    universe: "growth",
    title: "The heavy hitters",
    brief:
      "From: Growth. Re: the retention census.\n\nThe capstone census: customers holding at least 10 orders, counted and ranked — the cohort whose repeated account visits justify the covering composite. Four accounts clear the bar. Rebuild it with the rule in the clause, busiest first, deterministic ties.",
    ask: "Customers with at least 10 orders: customer_id, n — busiest first, ties by customer_id.",
    template: `SELECT customer_id, COUNT(*) AS n
FROM orders
GROUP BY customer_id
HAVING COUNT(*) {1} {2}
ORDER BY n {3}, customer_id;`,
    slots: [
      {
        answer: ">=",
        kind: "keyword",
        label: "the inclusion operator",
        why: "At least 10 means >= 10 — the customer sitting exactly on the bar stays in. A strict > silently drops them, and nobody files a ticket about a missing census row.",
      },
      {
        answer: "10",
        kind: "number",
        noVerify: true,
        label: "the heavy-hitter bar",
        why: "Ten orders — the business rule living in HAVING, where it's readable and movable. The survivors (24, 17, 14, 13) are the data's answer, not a hardcoded LIMIT.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the busiest-first direction",
        why: "n DESC with customer_id as the tiebreak — the deterministic presentation the ranking lessons teach. Flip it and the smallest heavy hitter leads the board.",
      },
    ],
    distractors: ["<", "=", "ASC"],
    walkthrough:
      "Four rows: customers 1 (24), 5 (17), 7 (14), 13 (13). The census is the argument for the index: these four accounts drive the repeat traffic, the repeat traffic is the hot path, and the hot path is what the (customer_id, created_at) covering composite serves. The clause-level rule (HAVING >= 10) keeps the threshold honest — change the bar to 15 and the census re-answers without a rewrite. Grouped, filtered, ordered, deterministic: the shape every census in this course ends with, now with a performance story attached.",
  },
  {
    id: "cs-2011",
    tier: "medium",
    topic: "p4",
    universe: "inventory",
    title: "The catalogue board",
    brief:
      "From: Inventory. Re: the supplier page.\n\nThe supplier page's query — one row per supplier, product counts and the average rating, biggest catalogues first. It's the grouped probe a foreign-key index on products.supplier_id serves on every page view; rebuild the board.",
    ask: "Per supplier: supplier_id, product count n, avg_price (2dp) — biggest n first.",
    template: `SELECT supplier_id, COUNT(*) AS n,
  ROUND({1}(price), 2) AS avg_price
FROM products
GROUP BY {2}
ORDER BY n {3}, supplier_id;`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the price aggregate",
        why: "AVG(price) is the supplier's catalogue price point on a comparable scale. SUM would grow with catalogue size — a bigger supplier would look 'pricier' for no reason.",
      },
      {
        answer: "supplier_id",
        kind: "keyword",
        label: "the grouping key",
        why: "One row per supplier — the FK the page probes by. This is the column the index decision is about, and the grain the whole board hangs on.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first direction",
        why: "n DESC — the fullest catalogues first, supplier_id as the stable tiebreak. The page's fixed layout depends on that determinism between runs.",
      },
    ],
    distractors: ["MAX", "category", "id", "ASC"],
    walkthrough:
      "Six suppliers, their product counts and average catalogue prices, fullest catalogues leading. The page loads constantly and probes by supplier_id every time — exactly the shape a FK index turns from a 16-row sweep into a 2–3-row descent (16 products ÷ 6 suppliers). Small numbers today; the census is the habit. And the aggregate choice matters as much as the index: AVG answers 'where does this supplier sit in the range', SUM would only answer 'how much product do they carry' — a question the count column already answered.",
  },
  {
    id: "cs-2012",
    tier: "hard",
    topic: "p4",
    universe: "catalog",
    title: "The product page",
    brief:
      "From: Catalog. Re: the product page.\n\nFinal assembly: product 1's order lines with quantities, heaviest lines first — the query the product_id index serves on every product view. Note the honest limit the sort exposes: the tree is sorted by product_id, not quantity, so the ORDER BY is work the index doesn't remove (a (product_id, quantity) composite would).",
    ask: "Product 1's lines: product_id, quantity — heaviest lines first, stable by id.",
    template: `SELECT product_id, quantity
FROM order_items
WHERE product_id = {1}
  AND quantity {2} 0
ORDER BY quantity {3}, id;`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the probed product",
        why: "Product 1 — the page's stand-in. The equality on product_id is the leftmost column of the tree the product page needs; every product view descends the same way.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the sanity gate",
        why: "quantity >= 0 documents that lines carry real quantities — a guard clause that costs nothing and catches corrupted imports loudly.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the heaviest-first direction",
        why: "Quantity DESC — pickers pull the biggest lines first, id as the stable tiebreak. The sort the (product_id) tree does NOT serve — that's the composite upgrade's job.",
      },
    ],
    distractors: ["2", "<", "ASC"],
    walkthrough:
      "Product 1's lines, heaviest first. The plan lesson inside the capstone: the (product_id) index serves the FILTER — a descent to product 1's band instead of a 251-line sweep — but the tree stores entries by (product_id, rowid), not by quantity, so ORDER BY quantity still needs its own pass. The upgrade is the covering-composite rule one more time: (product_id, quantity) serves the filter AND the sort AND, if the page selected nothing else, the whole query. Every query is a conversation between the shape you write and the tree that answers it — this one ends with the composite.",
  },
];
