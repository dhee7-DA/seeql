// Case batch WF2 — window functions deep-dive, t5 (RANK & friends),
// cs-2126…cs-2150.
import type { CaseStudy } from "./types";

export const casesWf2: CaseStudy[] = [
  {
    id: "cs-2126",
    tier: "easy",
    topic: "t5",
    universe: "month-close",
    title: "The five biggest payments",
    brief:
      "From: Controller. Re: the cash board.\n\nThe treasury board pins the five largest single payments. Number them largest-first with strict positions, smaller id winning any tie, and trim the board to five rows.",
    ask: "Rank payments by size, show the top five.",
    template: `SELECT id, method, amount_cents, {1}() OVER (ORDER BY amount_cents {2}, id ASC) AS rk
FROM payments
ORDER BY rk
{3};`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the board stamp", why: "Five distinct slots need distinct numbers — ROW_NUMBER deals them without sharing." },
      { answer: "DESC", kind: "keyword", label: "the size direction", why: "Largest payment at rank 1 is amount DESC." },
      { answer: "LIMIT 5", kind: "keyword", noVerify: true, label: "the board cut", why: "The treasury board shows five rows — LIMIT 5 trims the ranked book." },
    ],
    distractors: ["LAG", "ASC", "LIMIT 2"],
    walkthrough:
      "The board is a pure ranking read over the payments table: window on amount DESC with the id tiebreak inside the window, output re-sorted by rank, LIMIT 5 for the display. Offset functions like LAG would not run without an argument, and flipping the direction would rank the smallest cash-in first — the board would celebrate the wrong payments.",
  },
  {
    id: "cs-2127",
    tier: "medium",
    topic: "t5",
    universe: "inventory",
    title: "Dense stock bands",
    brief:
      "From: Inventory count. Re: the shelf bands.\n\nBand the catalog by stock depth WITHOUT gaps: products with equal stock share a band and the next band continues with the next integer. Deepest stock takes band 1, and the chart prints all sixteen rows.",
    ask: "Band products by stock with DENSE_RANK.",
    template: `SELECT name, stock, {1}() OVER (ORDER BY stock {2}, name ASC) AS band
FROM products
ORDER BY band, name
LIMIT {3};`,
    slots: [
      { answer: "DENSE_RANK", kind: "keyword", label: "the gapless band", why: "Bands share on ties and never skip — DENSE_RANK's contract; argument-less chips like LAG would not run." },
      { answer: "DESC", kind: "keyword", label: "the depth direction", why: "Deepest shelf is band 1, so stock sorts descending." },
      { answer: "8", kind: "keyword", noVerify: true, label: "the chart cut", why: "The chart prints the deepest eight shelves — LIMIT 8 trims the banded catalog." },
    ],
    distractors: ["LAG", "ASC", "4"],
    walkthrough:
      "DENSE_RANK walks stock from deepest to shallowest, sharing numbers on equal shelves and never leaving a hole; LIMIT 8 keeps the chart to one screen. Flipping the direction would band the emptiest shelves first — the chart would read like a restock alarm instead of a depth report.",
  },
  {
    id: "cs-2128",
    tier: "medium",
    topic: "t5",
    universe: "growth",
    title: "Lifetime spend ladder",
    brief:
      "From: Growth lead. Re: the VIP list.\n\nStage each customer's lifetime spend, then stamp a strict ladder from biggest spender down. The VIP list prints the top eight, ties resolved alphabetically by name in the display.",
    ask: "Rank customers by lifetime spend, top eight.",
    template: `WITH s AS (
  SELECT c.name, {1}(o.total) AS spend
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  GROUP BY c.id, c.name
)
SELECT name, spend, ROW_NUMBER() OVER (ORDER BY spend {2}) AS rn
FROM s
ORDER BY rn
{3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the money fold", why: "Lifetime spend is the sum of order totals — SUM in the staging layer; COUNT would tally baskets instead." },
      { answer: "DESC", kind: "keyword", label: "the spend direction", why: "Biggest spender at rung 1 is spend DESC." },
      { answer: "LIMIT 8", kind: "keyword", noVerify: true, label: "the VIP cut", why: "The list carries eight names — LIMIT 8 trims the staged ladder." },
    ],
    distractors: ["COUNT", "ASC", "LIMIT 3"],
    walkthrough:
      "Stage then rank: the CTE folds each customer's orders to one spend figure, the window deals strict rungs from the biggest spender down, and LIMIT 8 prints the VIP list. COUNT would rank by order volume — loyal-but-small buyers — which is a different campaign. Flipping the direction would put the one-order customers at the top of the VIP list.",
  },
  {
    id: "cs-2129",
    tier: "easy",
    topic: "t5",
    universe: "expense",
    title: "Heaviest ledger entries",
    brief:
      "From: Spend report. Re: the debit watchlist.\n\nThe watchlist pins the six largest single debits in the ledger. Stamp each entry with its position in the debit walk — strict numbering, smaller id on ties — and print the first six.",
    ask: "Rank ledger debits, show the top six.",
    template: `SELECT id, account, debit_cents, {1}() OVER (ORDER BY debit_cents {2}, id ASC) AS rk
FROM ledger_entries
ORDER BY rk
{3};`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the watchlist stamp", why: "Strict positions come from ROW_NUMBER — offset functions would not run argument-less." },
      { answer: "DESC", kind: "keyword", label: "the debit direction", why: "Heaviest debit at rank 1 is debit_cents DESC." },
      { answer: "LIMIT 6", kind: "keyword", noVerify: true, label: "the watchlist cut", why: "The watchlist carries six rows — LIMIT 6 trims the ranked ledger." },
    ],
    distractors: ["NTILE", "ASC", "LIMIT 10"],
    walkthrough:
      "One window over the ledger, one competition: debit_cents DESC with the id tiebreak, positions re-sorted for display, LIMIT 6 for the watchlist. NTILE would need a constant argument and deal tiles instead of a ladder. The direction flip is the classic silent bug — the watchlist would fill with zero-debit credit rows instead of the heavy debits.",
  },
  {
    id: "cs-2130",
    tier: "medium",
    topic: "t5",
    universe: "catalog",
    title: "Stock rungs inside each category",
    brief:
      "From: Warehouse catalog. Re: the category restock map.\n\nWithin each category, rank products by stock ascending — the emptiest shelf of each category takes rung 1. The map restarts per category so each buyer sees their own aisle only.",
    ask: "Rank products by stock within their category.",
    template: `SELECT name, category, stock,
       {1}() OVER (PARTITION BY {2} ORDER BY stock {3}, name ASC) AS rung
FROM products
ORDER BY category, rung;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the rung stamp", why: "Each category's ladder is strict — ROW_NUMBER deals unique rungs inside every partition." },
      { answer: "category", kind: "keyword", label: "the aisle boundary", why: "PARTITION BY category restarts the ladder per aisle — the map's whole point." },
      { answer: "ASC", kind: "keyword", label: "the emptiness direction", why: "Emptiest shelf at rung 1 is stock ASC — the restock map leads with the gap." },
    ],
    distractors: ["LAG", "supplier_id", "DESC"],
    walkthrough:
      "The partition slices the catalog into aisles; ROW_NUMBER deals rungs inside each aisle with stock ascending so rung 1 is the emptiest shelf. Repartitioning by supplier would mix categories inside one supplier's ladder — a different map. The DESC flip would celebrate the fullest shelves, which is a depth report, not a restock map.",
  },
  {
    id: "cs-2131",
    tier: "easy",
    topic: "t5",
    universe: "growth",
    title: "Status league table",
    brief:
      "From: Growth lead. Re: the funnel snapshot.\n\nStage one row per order status with its order count, then rank the statuses from busiest. The snapshot shows strict positions — ties would break alphabetically in the display, but positions themselves never share.",
    ask: "Rank order statuses by volume, strict positions.",
    template: `WITH s AS (
  SELECT status, {1}(*) AS n
  FROM orders
  GROUP BY status
)
SELECT status, n, {2}() OVER (ORDER BY n {3}) AS rk
FROM s
ORDER BY rk;`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the volume counter", why: "The league table ranks how many orders each status holds — COUNT(*) in the staging layer." },
      { answer: "ROW_NUMBER", kind: "keyword", label: "the strict stamp", why: "Strict positions never share — ROW_NUMBER's dealing; argument-less chips would not run." },
      { answer: "DESC", kind: "keyword", label: "the volume direction", why: "Busiest status at rank 1 is count DESC — the ASC flip would crown 'cancelled' as the headline." },
    ],
    distractors: ["SUM", "NTILE", "ASC"],
    walkthrough:
      "Stage then rank: four statuses fold out of the orders table, the window deals strict positions busiest-first. SUM(*) would not run — SUM needs a column argument — and the direction flip would crown 'cancelled' as the funnel's headline. The status counts are distinct here, so a competition RANK would agree with ROW_NUMBER; the snapshot asks for strict positions anyway.",
  },
  {
    id: "cs-2132",
    tier: "hard",
    topic: "t5",
    universe: "supplier",
    title: "Two premium picks per supplier",
    brief:
      "From: Supplier audit. Re: the negotiation sheet.\n\nFor each supplier, pin their two most expensive products. Rank products inside their supplier partition biggest-first, stage the rank, then keep only rungs 1 and 2.",
    ask: "List each supplier's two priciest products.",
    template: `WITH r AS (
  SELECT s.name AS supplier, p.name AS product, p.price,
         {1}() OVER (PARTITION BY p.supplier_id ORDER BY p.price {2}, p.name ASC) AS rk
  FROM products p
  JOIN suppliers s ON s.id = p.supplier_id
)
SELECT supplier, product, price, rk
FROM r
WHERE rk {3} 2
ORDER BY supplier, rk;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the sheet stamp", why: "Two distinct picks per supplier need distinct rungs — ROW_NUMBER never shares." },
      { answer: "DESC", kind: "keyword", label: "the premium direction", why: "Priciest at rung 1 is price DESC inside each supplier." },
      { answer: "<=", kind: "keyword", label: "the pick cut", why: "Keeping rungs 1 and 2 is rk <= 2; a bare '=' would drop every runner-up." },
    ],
    distractors: ["LAG", "ASC", "<"],
    walkthrough:
      "The join names each product's supplier; the partition makes every supplier its own competition; the staged rank lets the outer query trim to the two picks. The <= is load-bearing — switching to = would fire the second pick from every supplier and halve the negotiation sheet. Direction flips would rank each supplier's bargains instead of their premium shelf.",
  },
  {
    id: "cs-2133",
    tier: "hard",
    topic: "t5",
    universe: "funnel",
    title: "Months by units sold",
    brief:
      "From: Marketing funnel. Re: the demand appendix.\n\nJoin order lines to their orders, fold the quantity sold per month, and rank months from most units. The appendix shows the top five with strict rungs.",
    ask: "Rank months by units sold, top five.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', o.created_at) AS month, {1}(oi.quantity) AS units
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  GROUP BY month
)
SELECT month, units, ROW_NUMBER() OVER (ORDER BY units {2}, month ASC) AS rn
FROM m
ORDER BY rn
{3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the demand fold", why: "Units sold per month is the sum of line quantities — SUM in the staging CTE." },
      { answer: "DESC", kind: "keyword", label: "the demand direction", why: "Heaviest month at rung 1 is units DESC — the ASC flip would crown the weakest month." },
      { answer: "LIMIT 5", kind: "keyword", noVerify: true, label: "the appendix cut", why: "The appendix prints five months — LIMIT 5 trims the ranked ladder." },
    ],
    distractors: ["COUNT", "ASC", "LIMIT 9"],
    walkthrough:
      "The join hands each line its order month; GROUP BY folds one units figure per month; the window deals strict rungs from the heaviest month down. COUNT would rank by how many LINES a month had, not how many units moved — a subtle but real difference when baskets hold multiples. The month tiebreak in the window keeps the rungs deterministic.",
  },
  {
    id: "cs-2134",
    tier: "medium",
    topic: "t5",
    universe: "funnel",
    title: "City volume with shared ranks",
    brief:
      "From: Marketing funnel. Re: the city board.\n\nCount orders per city and rank the cities from busiest. Tied cities share a rank and the next one skips — the gap is the board's tie evidence. Print the whole board, ties displayed alphabetically.",
    ask: "Rank cities by order count with competition ranks.",
    template: `WITH t AS (
  SELECT c.city, {1}(*) AS n
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  GROUP BY c.city
)
SELECT city, n, {2}() OVER (ORDER BY n {3}) AS rk
FROM t
ORDER BY rk, city;`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the volume counter", why: "The board ranks how many orders each city placed — COUNT(*) per city." },
      { answer: "RANK", kind: "keyword", label: "the gap-leaving rank", why: "Tied cities share a rank and the next skips — RANK's signature; strict stamps would hide the ties." },
      { answer: "DESC", kind: "keyword", label: "the volume direction", why: "Busiest city at rank 1 is count DESC — the ASC flip would rank ghost towns first." },
    ],
    distractors: ["SUM", "ROW_NUMBER", "ASC"],
    walkthrough:
      "The CTE folds orders into city counts; the window ranks those counts high to low with NO tiebreaker inside the window — that's what lets ties stay ties. RANK shares the number on equal counts and skips the next, and the outer ORDER BY rk, city sorts the display deterministically. ROW_NUMBER would deal unique numbers and bury the tie evidence the board exists to show.",
  },
  {
    id: "cs-2135",
    tier: "medium",
    topic: "t5",
    universe: "month-close",
    title: "Strict ladder for customer volume",
    brief:
      "From: Controller. Re: the volume roster.\n\nThis roster wants STRICT positions on customer order counts — even where counts tie, every customer gets a unique rung, smaller customer id first. Print the whole roster.",
    ask: "Stamp customers with strict volume rungs.",
    template: `WITH t AS (
  SELECT customer_id, {1}(*) AS n
  FROM orders
  GROUP BY customer_id
)
SELECT customer_id, n, {2}() OVER (ORDER BY n {3}, customer_id ASC) AS rk
FROM t
ORDER BY rk;`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the volume counter", why: "Rungs follow order volume — COUNT(*) per customer in the staging CTE." },
      { answer: "ROW_NUMBER", kind: "keyword", label: "the strict stamp", why: "Unique rungs even on ties — ROW_NUMBER's contract; the roster explicitly forbids shared numbers, so rank functions would quietly break the rule." },
      { answer: "DESC", kind: "keyword", label: "the volume direction", why: "Heaviest buyer at rung 1 is count DESC — the ASC flip would list one-order customers first." },
    ],
    distractors: ["SUM", "LAG", "ASC"],
    walkthrough:
      "The roster is the tie-averse twin of the rank board: the customer_id INSIDE the window makes every row unique, so RANK could never share a number even if it wanted to — the memo demands strictness, and ROW_NUMBER is the function that promises it. The DESC walk puts the twenty-four-order customer on rung 1; SUM would rank by money, not visits.",
  },
  {
    id: "cs-2136",
    tier: "medium",
    topic: "t5",
    universe: "expense",
    title: "Vendor shelf rungs",
    brief:
      "From: Spend report. Re: the vendor book.\n\nWithin each vendor, rank their expense lines by amount descending — the biggest charge of each vendor takes rung 1. The book restarts per vendor so procurement reads one vendor at a time.",
    ask: "Rank each vendor's expense lines by size.",
    template: `SELECT id, vendor, amount_cents,
       {1}() OVER (PARTITION BY {2} ORDER BY amount_cents {3}, id ASC) AS rung
FROM expenses
ORDER BY vendor, rung;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the book stamp", why: "Each vendor's ladder is strict — ROW_NUMBER deals unique rungs per partition." },
      { answer: "vendor", kind: "keyword", label: "the book boundary", why: "PARTITION BY vendor restarts the ladder per vendor — a column that is not in the table would not run at all." },
      { answer: "DESC", kind: "keyword", label: "the size direction", why: "Biggest charge at rung 1 is amount DESC within each vendor." },
    ],
    distractors: ["NTILE", "warehouse", "ASC"],
    walkthrough:
      "Partitioning by vendor gives every supplier its own ladder; the DESC walk puts their biggest charge on rung 1; the id tiebreak keeps rungs stable. The ASC flip would lead each vendor's page with their smallest charge — the opposite of what procurement escalates.",
  },
  {
    id: "cs-2137",
    tier: "hard",
    topic: "t5",
    universe: "funnel",
    title: "Two flagships per region",
    brief:
      "From: Marketing funnel. Re: the regional poster.\n\nEach region's poster pins its two biggest delivered baskets. Rank delivered baskets inside their region partition, stage the rank, and keep rungs 1 and 2.",
    ask: "List each region's two biggest delivered baskets.",
    template: `WITH r AS (
  SELECT c.region, o.id, o.total,
         {1}() OVER (PARTITION BY c.region ORDER BY o.total {2}, o.id ASC) AS rk
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  WHERE o.status = '{3}'
)
SELECT region, id, total, rk
FROM r
WHERE rk <= 2
ORDER BY region, rk;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the poster stamp", why: "Two distinct poster slots per region — ROW_NUMBER keeps rungs 1 and 2 unique." },
      { answer: "DESC", kind: "keyword", label: "the flagship direction", why: "The biggest basket takes rung 1, so totals sort descending inside each region." },
      { answer: "delivered", kind: "keyword", label: "the status gate", why: "Only delivered baskets qualify for the poster; cancelled orders would be fiction." },
    ],
    distractors: ["LAG", "ASC", "pending"],
    walkthrough:
      "The gate runs before the window: WHERE delivered trims the world, the partition gives each region its own competition, and the staged rank lets the outer query keep rungs 1..2. Argument-less chips like LAG would not run; the ASC flip would rank each region's bargains instead of their flagships.",
  },
  {
    id: "cs-2138",
    tier: "medium",
    topic: "t5",
    universe: "pricing",
    title: "Product revenue rungs",
    brief:
      "From: Pricing review. Re: the revenue ladder.\n\nFold each product's sold revenue (quantity times unit price), then stamp strict rungs from the biggest earner down. The ladder prints the top six.",
    ask: "Rank products by sold revenue, top six.",
    template: `WITH s AS (
  SELECT p.name, {1}(oi.quantity * oi.unit_price) AS revenue
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  GROUP BY p.id, p.name
)
SELECT name, revenue, ROW_NUMBER() OVER (ORDER BY revenue {2}, name ASC) AS rn
FROM s
ORDER BY rn
{3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the revenue fold", why: "Product revenue is the sum of line values — SUM in the staging CTE." },
      { answer: "DESC", kind: "keyword", label: "the earner direction", why: "Biggest earner at rung 1 is revenue DESC." },
      { answer: "LIMIT 6", kind: "keyword", noVerify: true, label: "the ladder cut", why: "The ladder prints six products — LIMIT 6 trims the staged rungs." },
    ],
    distractors: ["COUNT", "ASC", "LIMIT 12"],
    walkthrough:
      "The join attaches product names to lines; GROUP BY folds one revenue figure per product; the window deals strict rungs biggest-first. COUNT would rank by how many lines each product appeared in — popularity, not revenue. The name tiebreak inside the window keeps the rungs deterministic; the direction flip would crown the weakest seller.",
  },
  {
    id: "cs-2139",
    tier: "medium",
    topic: "t5",
    universe: "growth",
    title: "Average-basket bands",
    brief:
      "From: Growth lead. Re: the basket-quality bands.\n\nStage each customer's average order value and band them with dense ranks — the richest average basket takes band 1, equal averages share, and no band number is ever skipped.",
    ask: "Band customers by average order value, gaplessly.",
    template: `WITH s AS (
  SELECT c.name, {1}(o.total) AS avg_order
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  GROUP BY c.id, c.name
)
SELECT name, avg_order, {2}() OVER (ORDER BY avg_order {3}, name ASC) AS band
FROM s
ORDER BY band, name;`,
    slots: [
      { answer: "AVG", kind: "keyword", label: "the quality fold", why: "Average order value is AVG(total) per customer — the basket-quality figure." },
      { answer: "DENSE_RANK", kind: "keyword", label: "the gapless band", why: "Bands share on ties and never skip — DENSE_RANK's contract; argument-less chips like LAG would not run." },
      { answer: "DESC", kind: "keyword", label: "the richness direction", why: "Richest average at band 1 is avg_order DESC — the ASC flip would band the thriftiest baskets first." },
    ],
    distractors: ["SUM", "LAG", "ASC"],
    walkthrough:
      "AVG stages the quality figure; DENSE_RANK bands it without gaps. The distinction from RANK matters when two customers tie — RANK would leave a hole after the tie group, and the band chart would show a missing row number that doesn't correspond to anyone. The name inside the window orders equals; the outer sort presents band by band.",
  },
  {
    id: "cs-2140",
    tier: "hard",
    topic: "t5",
    universe: "month-close",
    title: "Each status's newest order",
    brief:
      "From: Controller. Re: the status watch.\n\nFor each order status, pin the single NEWEST order. Rank orders inside their status partition by date descending and keep rung 1. Date ties go to the bigger order id.",
    ask: "Pin the newest order of every status.",
    template: `WITH r AS (
  SELECT status, id, created_at,
         {1}() OVER (PARTITION BY {3} ORDER BY created_at {2}, id DESC) AS rk
  FROM orders
)
SELECT status, id, created_at
FROM r
WHERE rk = 1
ORDER BY status;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the watch stamp", why: "One pinned order per status needs one winning rung — argument-less chips like LAG would not even run." },
      { answer: "DESC", kind: "keyword", label: "the recency direction", why: "Newest at rung 1 is created_at DESC inside each status; the id DESC tiebreak picks the later order on same dates." },
      { answer: "status", kind: "keyword", label: "the watch boundary", why: "PARTITION BY status gives every funnel stage its own timeline — repartitioning by customer would pin each person's newest order instead." },
    ],
    distractors: ["LAG", "ASC", "customer_id"],
    walkthrough:
      "The partition gives each status its own timeline; the DESC walk puts the newest order on rung 1; the id DESC tiebreak picks the later order when two share a date. Staging is mandatory — the winner exists only after the window runs, and WHERE rk = 1 happens outside it. The ASC flip would pin each status's OLDEST order and the watch would go stale.",
  },
  {
    id: "cs-2141",
    tier: "easy",
    topic: "t5",
    universe: "catalog",
    title: "The first ten orders ever",
    brief:
      "From: Warehouse catalog. Re: the archive wall.\n\nThe archive wall shows the store's first ten orders in chronological order, each stamped with its sequence number. Same-second orders resolve to the smaller id first.",
    ask: "Sequence the first ten orders chronologically.",
    template: `SELECT id, created_at, {1}() OVER (ORDER BY created_at {2}, id ASC) AS seq
FROM orders
ORDER BY seq
LIMIT {3};`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the archive stamp", why: "A strict 1..N chronology is ROW_NUMBER's dealing — rank functions would also run but the wall wants strict positions." },
      { answer: "ASC", kind: "keyword", label: "the clock direction", why: "First order ever is the earliest created_at — ascending time." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the wall size", why: "The wall hangs ten frames — LIMIT 10 trims the chronology." },
    ],
    distractors: ["LAG", "DESC", "5"],
    walkthrough:
      "The archive wall is a pure chronology: ROW_NUMBER over created_at ASC with the id ASC tiebreak, output presented in sequence order, LIMIT 10 for the wall. The DESC flip would stamp the NEWEST orders as seq 1 — the wall would hang backwards. LAG would need an argument and read one row back, not stamp positions.",
  },
  {
    id: "cs-2142",
    tier: "medium",
    topic: "t5",
    universe: "supplier",
    title: "Supplier depth league",
    brief:
      "From: Supplier audit. Re: the shelf-share table.\n\nCount products per supplier and rank suppliers from deepest catalog. Ties share a rank and the next skips — the audit's tie convention. Display ties alphabetically.",
    ask: "Rank suppliers by product count with gaps after ties.",
    template: `WITH t AS (
  SELECT s.name AS supplier, {1}(*) AS products
  FROM products p
  JOIN suppliers s ON s.id = p.supplier_id
  GROUP BY s.name
)
SELECT supplier, products, {2}() OVER (ORDER BY products {3}) AS rk
FROM t
ORDER BY rk, supplier;`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the depth counter", why: "Catalog depth is how many products each supplier provides — COUNT(*) per supplier." },
      { answer: "RANK", kind: "keyword", label: "the audit rank", why: "Ties share and the next skips — the audit's documented convention." },
      { answer: "DESC", kind: "keyword", label: "the depth direction", why: "Deepest catalog at rank 1 is count DESC." },
    ],
    distractors: ["SUM", "ROW_NUMBER", "ASC"],
    walkthrough:
      "The join names each product's supplier; the CTE folds one count per supplier; the window ranks the counts with the tie convention intact — no unique tiebreaker inside the window, so equal catalogs genuinely tie. ROW_NUMBER would deal unique numbers and hide the shared shelf. SUM of product ids would be nonsense — the fold must be COUNT.",
  },
  {
    id: "cs-2143",
    tier: "medium",
    topic: "t5",
    universe: "catalog",
    title: "Category demand bands",
    brief:
      "From: Warehouse catalog. Re: the demand bands.\n\nFold units sold per category and band the categories with dense ranks — the most-demanded category takes band 1, equal demand shares, and the ladder never skips.",
    ask: "Band categories by units sold, gaplessly.",
    template: `WITH u AS (
  SELECT p.category, {1}(oi.quantity) AS units
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  GROUP BY p.category
)
SELECT category, units, {2}() OVER (ORDER BY units {3}, category ASC) AS band
FROM u
ORDER BY band;`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the demand fold", why: "Units per category is SUM(quantity) after the join — the demand figure." },
      { answer: "DENSE_RANK", kind: "keyword", label: "the gapless band", why: "Bands share on ties and never skip — the chart's convention." },
      { answer: "DESC", kind: "keyword", label: "the demand direction", why: "Most-demanded category at band 1 is units DESC." },
    ],
    distractors: ["LAG", "NTILE", "ASC"],
    walkthrough:
      "SUM stages the demand figure per category; DENSE_RANK bands it gaplessly. The chart's rule is explicit — equal demand shares a band and the next continues without a hole — which is precisely the DENSE_RANK contract. COUNT with no argument would silently become a running row count and mimic the band here; the fold the memo wants is SUM of units.",
  },
  {
    id: "cs-2144",
    tier: "hard",
    topic: "t5",
    universe: "fraud",
    title: "Open invoice heavyweights",
    brief:
      "From: Fraud spot-check. Re: the exposure list.\n\nThe exposure list pins the five largest OPEN invoices. Filter to open first, rank by amount descending inside what remains, and print the top five with strict rungs.",
    ask: "Rank open invoices by amount, top five.",
    template: `SELECT number, amount_cents, {1}() OVER (ORDER BY amount_cents {2}, id ASC) AS rk
FROM invoices
WHERE status = '{3}'
ORDER BY rk
LIMIT 5;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the exposure stamp", why: "Strict rungs on the exposure list — ROW_NUMBER never shares a slot." },
      { answer: "DESC", kind: "keyword", label: "the size direction", why: "Biggest exposure at rung 1 is amount DESC." },
      { answer: "open", kind: "keyword", label: "the status gate", why: "Only OPEN invoices are exposure; paid and void invoices would pollute the list." },
    ],
    distractors: ["NTILE", "ASC", "paid"],
    walkthrough:
      "The WHERE gate narrows the book to open invoices before any ranking; the window then ranks exactly that exposure. DESC leads with the worst receivable; the id tiebreak keeps rungs stable; LIMIT 5 prints the list. Swapping the gate to 'paid' would rank the healthiest invoices as exposure — a quietly catastrophic report.",
  },
  {
    id: "cs-2145",
    tier: "medium",
    topic: "t5",
    universe: "month-close",
    title: "Ledger account standings",
    brief:
      "From: Controller. Re: the movement table.\n\nFold each ledger account's net movement (debits minus credits), then rank accounts from the most positive net. The table shows strict positions for every account.",
    ask: "Rank ledger accounts by net movement.",
    template: `WITH a AS (
  SELECT account, SUM(debit_cents) - {1}(credit_cents) AS net
  FROM ledger_entries
  GROUP BY account
)
SELECT account, net, ROW_NUMBER() OVER (ORDER BY net {2}, account ASC) AS rk
FROM a
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the movement fold", why: "Net movement is SUM(debits) - SUM(credits) per account — the same fold twice, subtracted." },
      { answer: "DESC", kind: "keyword", label: "the movement direction", why: "Most positive net at rank 1 is net DESC." },
      { answer: "rk", kind: "keyword", label: "the display sort", why: "The table reads in rank order — ORDER BY rk with the account tiebreak handled inside the window." },
    ],
    distractors: ["COUNT", "ASC", "net"],
    walkthrough:
      "The staging CTE folds debits and credits separately and subtracts — one net figure per account. The window ranks those nets from the healthiest inflow down. COUNT would tally entries rather than money, and sorting the display by the raw net instead of the rank would shuffle the table whenever ties or near-ties appear.",
  },
  {
    id: "cs-2146",
    tier: "medium",
    topic: "t5",
    universe: "fraud",
    title: "Bargain rungs per city",
    brief:
      "From: Fraud spot-check. Re: the small-basket probe.\n\nFor each city, the probe pins the single SMALLEST basket placed there. Rank baskets inside their city ascending and keep rung 1 — ties resolve to the smaller order id.",
    ask: "Pin each city's smallest basket.",
    template: `WITH r AS (
  SELECT c.city, o.id, o.total,
         {1}() OVER (PARTITION BY c.city ORDER BY o.total {2}, o.id ASC) AS rk
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
)
SELECT city, id, total
FROM r
WHERE rk = 1
ORDER BY city
LIMIT {3};`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the probe stamp", why: "One pinned basket per city needs one winning rung — argument-less chips like LAG would not even run." },
      { answer: "ASC", kind: "keyword", label: "the smallness direction", why: "Smallest basket at rung 1 is total ASC inside each city — the DESC flip would pin the biggest basket instead." },
      { answer: "8", kind: "keyword", noVerify: true, label: "the probe cut", why: "The probe prints the first eight cities — LIMIT 8 trims the pinned winners." },
    ],
    distractors: ["LAG", "DESC", "3"],
    walkthrough:
      "The partition gives each city its own competition; the ASC walk puts the smallest basket on rung 1; the id tiebreak keeps the pick reproducible. The DESC flip would pin each city's BIGGEST basket — a different report that happens to look identical in shape. Staging in the CTE is what allows the outer WHERE rk = 1 to pick winners.",
  },
  {
    id: "cs-2147",
    tier: "hard",
    topic: "t5",
    universe: "month-close",
    title: "Payment rails inside each method",
    brief:
      "From: Controller. Re: the rail audit.\n\nWithin each payment method, rank payments by amount descending — each rail's biggest payment takes rung 1 — and keep the top two rungs per rail for the audit.",
    ask: "Rank payments within their method, top two per rail.",
    template: `WITH r AS (
  SELECT method, id, amount_cents,
         {1}() OVER (PARTITION BY {2} ORDER BY amount_cents {3}, id ASC) AS rk
  FROM payments
)
SELECT method, id, amount_cents, rk
FROM r
WHERE rk <= 2
ORDER BY method, rk;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the audit stamp", why: "Two distinct rungs per rail — argument-less chips like NTILE would not even run without a constant." },
      { answer: "method", kind: "keyword", label: "the rail boundary", why: "PARTITION BY method gives card and wire their own ladders." },
      { answer: "DESC", kind: "keyword", label: "the size direction", why: "Each rail's biggest payment at rung 1 is amount DESC." },
    ],
    distractors: ["NTILE", "customer_id", "ASC"],
    walkthrough:
      "The partition splits the payment book by rail; the DESC walk ranks each rail's payments; the staged rung lets the outer query keep the top two per method. Repartitioning by customer would rank each person's payments — a different audit. The ASC flip would lead each rail with its smallest payment, exactly backwards for an exposure audit.",
  },
  {
    id: "cs-2148",
    tier: "medium",
    topic: "t5",
    universe: "inventory",
    title: "Supplier shelf rungs",
    brief:
      "From: Inventory count. Re: the supplier shelf map.\n\nWithin each supplier, rank products by stock ascending — each supplier's emptiest shelf takes rung 1. The map lets the replenishment team call suppliers in gap order.",
    ask: "Rank products by stock within their supplier.",
    template: `SELECT name, supplier_id, stock,
       ROW_NUMBER() OVER (PARTITION BY {1} ORDER BY stock {2}, name ASC) AS rung
FROM products
ORDER BY supplier_id, rung
LIMIT {3};`,
    slots: [
      { answer: "supplier_id", kind: "keyword", label: "the call boundary", why: "PARTITION BY supplier_id gives each supplier its own ladder — a column absent from the table would not run." },
      { answer: "ASC", kind: "keyword", label: "the emptiness direction", why: "Emptiest shelf at rung 1 is stock ASC — the call order for replenishment." },
      { answer: "8", kind: "keyword", noVerify: true, label: "the map cut", why: "The map prints the first eight rungs — LIMIT 8 trims the walk." },
    ],
    distractors: ["warehouse", "DESC", "16"],
    walkthrough:
      "The partition scopes each ladder to one supplier; stock ASC leads with the emptiest shelf; the name tiebreak keeps rungs stable between counts; LIMIT 8 trims the map. The DESC flip would rank the deepest shelves first — the team would call the suppliers who need them least.",
  },
  {
    id: "cs-2149",
    tier: "hard",
    topic: "t5",
    universe: "refund-audit",
    title: "The refund queue ladder",
    brief:
      "From: Refund audit. Re: the queue order.\n\nThe queue processes cancelled baskets smallest-first — quick wins clear fast. Rank cancelled baskets by total ascending inside the filtered set and print the first six with strict rungs.",
    ask: "Queue cancelled baskets smallest-first, six rows.",
    template: `SELECT id, total, {1}() OVER (ORDER BY total {2}, id ASC) AS rn
FROM orders
WHERE status = '{3}'
ORDER BY rn
LIMIT 6;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the queue stamp", why: "Queue positions are strict — ROW_NUMBER never shares a slot." },
      { answer: "ASC", kind: "keyword", label: "the queue direction", why: "Smallest claims first is total ASC — the quick-win queue order." },
      { answer: "cancelled", kind: "keyword", label: "the queue gate", why: "Only cancelled baskets enter the refund queue." },
    ],
    distractors: ["NTILE", "DESC", "pending"],
    walkthrough:
      "The gate trims the world to cancelled baskets; the ASC walk orders the queue smallest-first; the id tiebreak keeps the queue stable between runs; LIMIT 6 shows the next six claims. NTILE would need a constant argument and deal tiles — a triage, not a queue. The DESC flip would process the biggest losses first and starve the quick wins.",
  },
  {
    id: "cs-2150",
    tier: "medium",
    topic: "t5",
    universe: "pricing",
    title: "Category price floors, stamped",
    brief:
      "From: Pricing review. Re: the floor audit.\n\nWithin each category, rank products by price ascending — each category's cheapest product takes rung 1 — and pin the floor of every category for the price-sheet audit.",
    ask: "Pin each category's cheapest product via rungs.",
    template: `WITH r AS (
  SELECT category, name, price,
         {2}() OVER (PARTITION BY category ORDER BY price {1}, name ASC) AS rk
  FROM products
)
SELECT category, name, price
FROM r
WHERE rk = 1
ORDER BY category
LIMIT {3};`,
    slots: [
      { answer: "ASC", kind: "keyword", label: "the floor direction", why: "Cheapest at rung 1 is price ASC inside each category — the DESC flip would pin each category's ceiling instead." },
      { answer: "ROW_NUMBER", kind: "keyword", label: "the floor stamp", why: "One pinned floor per category needs one winning rung — argument-less chips like LAG would not even run." },
      { answer: "8", kind: "keyword", noVerify: true, label: "the audit cut", why: "The audit prints the first eight category floors — LIMIT 8 trims the pinned winners." },
    ],
    distractors: ["DESC", "LAG", "3"],
    walkthrough:
      "The partition gives each category its own ladder; the ASC walk puts its floor on rung 1; the alphabetical tiebreak makes the pinned floor reproducible; LIMIT 8 trims the audit page. The DESC flip would pin each category's CEILING instead — the price sheet would document premiums as floors. Staging plus WHERE rk = 1 is the standard pin-the-winner pattern.",
  },
];
