// Case batch WF3 — window functions deep-dive, t5 (RANK & friends),
// cs-2151…cs-2175.
import type { CaseStudy } from "./types";

export const casesWf3: CaseStudy[] = [
  {
    id: "cs-2151",
    tier: "easy",
    topic: "t5",
    universe: "growth",
    title: "Six newest baskets",
    brief:
      "From: Growth lead. Re: the fresh-orders rail.\n\nThe rail shows the six most recent delivered baskets, newest first, each stamped with a strict position. Stamp by date descending inside the delivered set and trim to six.",
    ask: "Stamp the six newest delivered baskets.",
    template: `SELECT id, created_at, {1}() OVER (ORDER BY created_at {2}, id ASC) AS rn
FROM orders
WHERE status = 'delivered'
ORDER BY rn
{3};`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the rail stamp", why: "Strict positions come from ROW_NUMBER — tile and offset functions would not run argument-less." },
      { answer: "DESC", kind: "keyword", label: "the freshness direction", why: "Newest first is created_at DESC — the rail leads with today's baskets." },
      { answer: "LIMIT 6", kind: "keyword", noVerify: true, label: "the rail cut", why: "The rail carries six frames — LIMIT 6 trims the delivered chronology." },
    ],
    distractors: ["NTILE", "ASC", "LIMIT 2"],
    walkthrough:
      "The status gate narrows the world to delivered baskets; the window stamps strict positions newest-first with the id tiebreak baked in; LIMIT 6 trims the rail. Flipping to ASC would serve the store's oldest deliveries as 'fresh' — the rail would be a museum. Argument-less function chips would not run at all.",
  },
  {
    id: "cs-2152",
    tier: "medium",
    topic: "t5",
    universe: "month-close",
    title: "Dense volume bands by month",
    brief:
      "From: Controller. Re: the volume bands.\n\nBand the fourteen months by order count with dense ranks — equal months share a band and the next band is the next integer, no holes. The window must rank by the count alone so real ties stay ties.",
    ask: "Band months by order count, gaplessly.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, {1}(*) AS n
  FROM orders
  GROUP BY month
)
SELECT month, n, {2}() OVER (ORDER BY n {3}) AS band
FROM m
ORDER BY band, month;`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the volume fold", why: "Band the months by how many orders each drew — COUNT(*) per month in the staging CTE." },
      { answer: "DENSE_RANK", kind: "keyword", label: "the gapless band", why: "Tied months share and the next continues without a hole — the DENSE_RANK contract the memo cites." },
      { answer: "DESC", kind: "keyword", label: "the band direction", why: "Busiest month in band 1 is count DESC — the ASC flip would band the quietest months first." },
    ],
    distractors: ["SUM", "RANK", "ASC"],
    walkthrough:
      "COUNT stages one volume figure per month; DENSE_RANK bands those figures gaplessly. The window orders by the count ALONE — adding a unique tiebreaker inside OVER would make every month unique and dissolve the very ties the bands exist to show. RANK would share the tied bands but then skip a number, printing a hole the memo explicitly forbids.",
  },
  {
    id: "cs-2153",
    tier: "medium",
    topic: "t5",
    universe: "fraud",
    title: "Two heaviest invoices per customer",
    brief:
      "From: Fraud spot-check. Re: the exposure pairs.\n\nFor each customer, pin their two largest invoices. Rank invoices inside their customer partition by amount descending, stage the rank, and keep rungs 1 and 2.",
    ask: "List each customer's two largest invoices.",
    template: `WITH r AS (
  SELECT customer_id, number, amount_cents,
         {1}() OVER (PARTITION BY {2} ORDER BY amount_cents {3}, id ASC) AS rk
  FROM invoices
)
SELECT customer_id, number, amount_cents, rk
FROM r
WHERE rk <= 2
ORDER BY customer_id, rk;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the pair stamp", why: "Two distinct slots per customer — argument-less chips like LAG would not even run." },
      { answer: "customer_id", kind: "keyword", label: "the account boundary", why: "PARTITION BY customer_id gives every customer their own ladder — the exposure is per account." },
      { answer: "DESC", kind: "keyword", label: "the size direction", why: "Largest invoice at rung 1 is amount DESC inside each customer." },
    ],
    distractors: ["LAG", "due_on", "ASC"],
    walkthrough:
      "The partition scopes each ladder to one customer; the DESC walk ranks their invoices; the staged rung lets the outer query keep the pair. Repartitioning by due date would group one-invoice-per-date and every rung would read 1 — a useless ladder. The ASC flip would surface each customer's SMALLEST invoices as their top exposure.",
  },
  {
    id: "cs-2154",
    tier: "hard",
    topic: "t5",
    universe: "month-close",
    title: "Latest payment per invoice",
    brief:
      "From: Controller. Re: the cash-application check.\n\nFor each invoice, pin the most recent payment applied to it. Rank payments inside their invoice partition by date descending (same-day: bigger payment id wins) and keep rung 1.",
    ask: "Pin the latest payment of every invoice.",
    template: `WITH r AS (
  SELECT invoice_id, id AS payment_id, paid_on,
         {1}() OVER (PARTITION BY invoice_id ORDER BY paid_on {2}, id DESC) AS rk
  FROM payments
)
SELECT invoice_id, payment_id, paid_on
FROM r
WHERE rk = 1
ORDER BY invoice_id
LIMIT {3};`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the check stamp", why: "One pinned payment per invoice needs one winning rung — argument-less chips like NTILE would not even run." },
      { answer: "DESC", kind: "keyword", label: "the recency direction", why: "Latest payment at rung 1 is paid_on DESC, and the id DESC tiebreak resolves same-day applications." },
      { answer: "6", kind: "keyword", noVerify: true, label: "the check cut", why: "The check prints the first six invoices — LIMIT 6 trims the pinned winners." },
    ],
    distractors: ["NTILE", "ASC", "3"],
    walkthrough:
      "The partition walks each invoice's payments separately; the DESC run puts the newest on rung 1; the id DESC tiebreak resolves same-day applications. The ASC flip would pin each invoice's FIRST payment — a different control that reads like a substitute but answers a different question. Staging plus WHERE rk = 1 is the pin-the-winner pattern.",
  },
  {
    id: "cs-2155",
    tier: "easy",
    topic: "t5",
    universe: "expense",
    title: "The ledger's first five entries",
    brief:
      "From: Spend report. Re: the opening page.\n\nThe audit binder opens with the ledger's first five entries in chronological order, each stamped with its sequence. Stamp by entry date ascending, same-day by smaller id, and print five.",
    ask: "Sequence the ledger's first five entries.",
    template: `SELECT id, entry_date, account, {1}() OVER (ORDER BY entry_date {2}, id ASC) AS seq
FROM ledger_entries
ORDER BY seq
{3};`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the binder stamp", why: "A strict 1..N chronology is ROW_NUMBER's dealing — tile functions would need a constant and deal groups instead." },
      { answer: "ASC", kind: "keyword", label: "the clock direction", why: "The opening page starts at the earliest entry — ascending time." },
      { answer: "LIMIT 5", kind: "keyword", noVerify: true, label: "the page cut", why: "The binder page shows five entries — LIMIT 5 trims the chronology." },
    ],
    distractors: ["NTILE", "DESC", "LIMIT 9"],
    walkthrough:
      "One window walks the ledger chronologically, stamping strict sequence numbers with the id tiebreak; LIMIT 5 cuts the opening page. The DESC flip would open the binder with the NEWEST entries — the audit would read the story backwards. NTILE would need a constant argument and deal the ledger into tiles, not pages.",
  },
  {
    id: "cs-2156",
    tier: "hard",
    topic: "t5",
    universe: "pricing",
    title: "Two best sellers per category",
    brief:
      "From: Pricing review. Re: the demand podiums.\n\nFold units sold per product, then within each category rank products by units descending and keep the top two. The podium pairs feed the merchandising grid.",
    ask: "List each category's two best-selling products.",
    template: `WITH u AS (
  SELECT p.category, p.name, SUM(oi.quantity) AS units
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  GROUP BY p.id, p.category, p.name
), r AS (
  SELECT category, name, units,
         {1}() OVER (PARTITION BY {2} ORDER BY units {3}, name ASC) AS rk
  FROM u
)
SELECT category, name, units, rk
FROM r
WHERE rk <= 2
ORDER BY category, rk;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the podium stamp", why: "Two distinct podium slots per category — offset chips like LAG would not run without an argument." },
      { answer: "category", kind: "keyword", label: "the grid boundary", why: "PARTITION BY category gives every aisle its own demand competition." },
      { answer: "DESC", kind: "keyword", label: "the demand direction", why: "Best seller at rung 1 is units DESC inside each category." },
    ],
    distractors: ["LAG", "supplier_id", "ASC"],
    walkthrough:
      "Two layers: the CTE folds one units figure per product, the window ranks those figures inside their category. Staging first is what makes the ranking honest — the window sees aggregated demand, not raw lines. The ASC flip would crown the slowest movers, and repartitioning by supplier would mix aisles into one supplier-wide competition.",
  },
  {
    id: "cs-2157",
    tier: "medium",
    topic: "t5",
    universe: "growth",
    title: "Gapless spend bands",
    brief:
      "From: Growth lead. Re: the spend bands.\n\nStage each customer's lifetime spend and band them with dense ranks from the biggest spender down. Equal spends share a band and the next continues without a hole — the chart's explicit rule.",
    ask: "Band customers by lifetime spend, gaplessly.",
    template: `WITH s AS (
  SELECT c.name, SUM(o.total) AS spend
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  GROUP BY c.id, c.name
)
SELECT name, spend, {1}() OVER (ORDER BY spend {2}, name ASC) AS band
FROM s
ORDER BY {3}, name;`,
    slots: [
      { answer: "DENSE_RANK", kind: "keyword", label: "the gapless band", why: "Bands share on ties and never skip — argument-less chips like LAG would not run; RANK would punch holes." },
      { answer: "DESC", kind: "keyword", label: "the spend direction", why: "Biggest spender in band 1 is spend DESC." },
      { answer: "band", kind: "keyword", label: "the display sort", why: "The chart reads band by band — ORDER BY band with the name settling equals inside each band." },
    ],
    distractors: ["LAG", "ASC", "spend"],
    walkthrough:
      "The staging CTE folds one spend figure per customer; DENSE_RANK bands those figures from richest to leanest with no gaps. Sorting the display by the raw spend instead of the band would interleave the bands and destroy the chart. The ASC flip would start the chart at the smallest spenders — technically valid, commercially useless.",
  },
  {
    id: "cs-2158",
    tier: "medium",
    topic: "t5",
    universe: "funnel",
    title: "Status funnel ranks",
    brief:
      "From: Marketing funnel. Re: the funnel labels.\n\nStage one row per order status with its count, then rank the statuses from widest funnel stage down. The labels show strict positions — every stage gets a unique number.",
    ask: "Rank funnel statuses by volume, strict positions.",
    template: `WITH s AS (
  SELECT status, {1}(*) AS n
  FROM orders
  GROUP BY status
)
SELECT status, n, {2}() OVER (ORDER BY n {3}) AS rk
FROM s
ORDER BY rk;`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the stage fold", why: "A stage's width is how many orders sit in it — COUNT(*) per status." },
      { answer: "ROW_NUMBER", kind: "keyword", label: "the label stamp", why: "Strict stage numbers — ROW_NUMBER deals them; argument-less chips would not run." },
      { answer: "DESC", kind: "keyword", label: "the funnel direction", why: "Widest stage at rank 1 is count DESC — the funnel narrows as the rank climbs." },
    ],
    distractors: ["SUM", "NTILE", "ASC"],
    walkthrough:
      "Stage then rank: the four statuses fold to counts, the window stamps strict positions widest-first. SUM(*) would not run — the fold needs a column or the * with COUNT. The ASC flip would label 'cancelled' as the widest stage and the funnel diagram would invert its story.",
  },
  {
    id: "cs-2159",
    tier: "medium",
    topic: "t5",
    universe: "pricing",
    title: "Supplier revenue ladder",
    brief:
      "From: Pricing review. Re: the sourcing ladder.\n\nJoin lines to products to suppliers, fold revenue per supplier, and stamp strict rungs from the biggest earner down. The ladder prints the top four for the quarterly review.",
    ask: "Rank suppliers by sold revenue, top four.",
    template: `WITH s AS (
  SELECT sup.name AS supplier, {1}(oi.quantity * oi.unit_price) AS revenue
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  JOIN suppliers sup ON sup.id = p.supplier_id
  GROUP BY sup.name
)
SELECT supplier, revenue, ROW_NUMBER() OVER (ORDER BY revenue {2}, supplier ASC) AS rn
FROM s
ORDER BY rn
{3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the revenue fold", why: "Supplier revenue is the sum of line values through the join — SUM in the staging CTE." },
      { answer: "DESC", kind: "keyword", label: "the earner direction", why: "Biggest earner at rung 1 is revenue DESC." },
      { answer: "LIMIT 4", kind: "keyword", noVerify: true, label: "the review cut", why: "The quarterly review reads four suppliers — LIMIT 4 trims the ladder." },
    ],
    distractors: ["COUNT", "ASC", "LIMIT 2"],
    walkthrough:
      "The two-hop join attaches supplier names to every line; the CTE folds one revenue figure per supplier; the window deals strict rungs biggest-first and LIMIT 4 trims to the review list. COUNT would rank suppliers by line counts — popularity, not money. The ASC flip would celebrate the smallest revenue source.",
  },
  {
    id: "cs-2160",
    tier: "medium",
    topic: "t5",
    universe: "expense",
    title: "Each category's heaviest charge",
    brief:
      "From: Spend report. Re: the category peaks.\n\nWithin each expense category, pin the single largest charge. Rank lines inside their category partition by amount descending and keep rung 1 — ties go to the smaller id.",
    ask: "Pin the biggest expense in every category.",
    template: `WITH r AS (
  SELECT category, vendor, amount_cents,
         {1}() OVER (PARTITION BY {2} ORDER BY amount_cents {3}, id ASC) AS rk
  FROM expenses
)
SELECT category, vendor, amount_cents
FROM r
WHERE rk = 1
ORDER BY category;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the peak stamp", why: "One pinned charge per category needs one winning rung — ROW_NUMBER keeps the competition strict." },
      { answer: "category", kind: "keyword", label: "the peak boundary", why: "PARTITION BY category gives every spend type its own ladder." },
      { answer: "DESC", kind: "keyword", label: "the weight direction", why: "Heaviest charge at rung 1 is amount DESC inside each category." },
    ],
    distractors: ["LAG", "warehouse", "ASC"],
    walkthrough:
      "The partition scopes each ladder to one spend type; the DESC walk puts its heaviest charge on rung 1; the id tiebreak keeps the pick reproducible. Repartitioning by vendor would pin each VENDOR's heaviest charge — a different report. The ASC flip would surface the smallest charges as the peaks.",
  },
  {
    id: "cs-2161",
    tier: "hard",
    topic: "t5",
    universe: "month-close",
    title: "The close binder's top months",
    brief:
      "From: Controller. Re: the binder shortlist.\n\nStage monthly revenue, stamp strict rungs from the biggest month down, and print the first four. The binder's shortlist re-runs every close, so the rungs must be computed, never typed.",
    ask: "Rank months by revenue, top four.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS rev
  FROM orders
  GROUP BY month
)
SELECT month, rev, {1}() OVER (ORDER BY rev {2}, month ASC) AS rn
FROM m
ORDER BY rn
{3};`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the binder stamp", why: "Strict rungs on the shortlist — offset chips like LAG would not run without an argument." },
      { answer: "DESC", kind: "keyword", label: "the revenue direction", why: "Biggest month at rung 1 is rev DESC — the ASC flip would shortlist the weakest months of the year." },
      { answer: "LIMIT 4", kind: "keyword", noVerify: true, label: "the shortlist cut", why: "The binder shortlists four months — LIMIT 4 trims the ranked ladder." },
    ],
    distractors: ["LAG", "ASC", "LIMIT 8"],
    walkthrough:
      "Stage then rank then trim: the CTE folds one revenue figure per month, the window deals strict rungs with the month tiebreak inside, LIMIT 4 prints the shortlist. The ASC flip would shortlist the weakest months — the close review would open on the problem children instead of the heroes. LAG would need an argument and read one row back, not stamp positions.",
  },
  {
    id: "cs-2162",
    tier: "medium",
    topic: "t5",
    universe: "catalog",
    title: "Alphabetical inside each region",
    brief:
      "From: Warehouse catalog. Re: the regional directories.\n\nWithin each region, number customers alphabetically — position 1 is the region's first name. The directories restart per region, and the printout shows the first eight rows.",
    ask: "Number customers alphabetically within their region.",
    template: `SELECT name, region,
       {1}() OVER (PARTITION BY {2} ORDER BY name {3}, id ASC) AS dir_no
FROM customers
ORDER BY region, dir_no
LIMIT 8;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the directory stamp", why: "Directory positions are strict — ROW_NUMBER never shares a slot." },
      { answer: "region", kind: "keyword", label: "the directory boundary", why: "PARTITION BY region restarts each directory at the region edge." },
      { answer: "ASC", kind: "keyword", label: "the alphabet direction", why: "A-to-Z inside each region is name ASC — the DESC flip would run every roll backwards." },
    ],
    distractors: ["NTILE", "city", "DESC"],
    walkthrough:
      "The partition scopes each directory to one region; name ASC orders the roll; the id tiebreak keeps positions deterministic; LIMIT 8 trims the printout. Repartitioning by city would produce city directories — finer pages than the memo wants. The DESC flip would run the roll from Z to A and every position would flip.",
  },
  {
    id: "cs-2163",
    tier: "medium",
    topic: "t5",
    universe: "fraud",
    title: "The biggest line items",
    brief:
      "From: Fraud spot-check. Re: the line-value watchlist.\n\nStamp every order line with its position in the line-value ladder (quantity times unit price), biggest first, and print the top eight. The watchlist reviews the heaviest single lines.",
    ask: "Rank order lines by line value, top eight.",
    template: `SELECT id, quantity * unit_price AS line_value,
       {1}() OVER (ORDER BY quantity * unit_price {2}, id ASC) AS rk
FROM order_items
ORDER BY rk
{3};`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the watchlist stamp", why: "Strict ladder positions — ROW_NUMBER deals them; tile functions would need a constant." },
      { answer: "DESC", kind: "keyword", label: "the weight direction", why: "Heaviest line at rung 1 is line value DESC." },
      { answer: "LIMIT 8", kind: "keyword", noVerify: true, label: "the watchlist cut", why: "The watchlist carries eight lines — LIMIT 8 trims the ladder." },
    ],
    distractors: ["NTILE", "ASC", "LIMIT 20"],
    walkthrough:
      "The window ranks the computed line values biggest-first with the id tiebreak; LIMIT 8 trims the watchlist. The ASC flip would surface the cheapest lines — a bargain hunt, not a fraud watch. NTILE would need a constant argument and deal the lines into proportional tiles instead of a ladder.",
  },
  {
    id: "cs-2164",
    tier: "hard",
    topic: "t5",
    universe: "month-close",
    title: "Each account's closing entry",
    brief:
      "From: Controller. Re: the account closers.\n\nFor each ledger account, pin its most recent entry — the closer of that account's story. Rank entries inside their account partition by date descending (same-day: bigger id) and keep rung 1.",
    ask: "Pin the newest entry of every ledger account.",
    template: `WITH r AS (
  SELECT account, id, entry_date,
         {1}() OVER (PARTITION BY {2} ORDER BY entry_date {3}, id DESC) AS rk
  FROM ledger_entries
)
SELECT account, id, entry_date
FROM r
WHERE rk = 1
ORDER BY account;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the closer stamp", why: "One pinned entry per account needs one winning rung — ROW_NUMBER keeps the competition strict." },
      { answer: "account", kind: "keyword", label: "the story boundary", why: "PARTITION BY account gives every ledger account its own timeline." },
      { answer: "DESC", kind: "keyword", label: "the recency direction", why: "Newest entry at rung 1 is entry_date DESC inside each account." },
    ],
    distractors: ["NTILE", "entry_date", "ASC"],
    walkthrough:
      "The partition gives each account its own timeline; the DESC run pins its newest entry; the id DESC tiebreak resolves same-day closers. Repartitioning by entry date would group one entry per date and every rung would read 1. The ASC flip would pin each account's OPENING entry — the story's first word, not its last.",
  },
  {
    id: "cs-2165",
    tier: "hard",
    topic: "t5",
    universe: "fraud",
    title: "The slowest payments",
    brief:
      "From: Fraud spot-check. Re: the days-to-pay ladder.\n\nJoin payments to their invoices, compute the days between issue and payment, and stamp strict rungs from the SLOWEST payment down. The ladder prints the top five for the collections call.",
    ask: "Rank payments by days-to-pay, slowest first, top five.",
    template: `WITH t AS (
  SELECT p.id, i.number,
         CAST(julianday(p.paid_on) - julianday(i.issued_on) AS INTEGER) AS days
  FROM payments p
  JOIN invoices i ON i.id = p.invoice_id
)
SELECT id, number, days, {1}() OVER (ORDER BY days {2}, id ASC) AS rk
FROM t
ORDER BY rk
{3};`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the ladder stamp", why: "Strict rungs on the collections ladder — tile chips would need a constant argument." },
      { answer: "DESC", kind: "keyword", label: "the slowness direction", why: "Slowest payment at rung 1 is days DESC — the ASC flip would thank the fastest payers instead." },
      { answer: "LIMIT 5", kind: "keyword", noVerify: true, label: "the call list cut", why: "The call list carries five payments — LIMIT 5 trims the ladder." },
    ],
    distractors: ["NTILE", "ASC", "LIMIT 9"],
    walkthrough:
      "The staged CTE computes each payment's days-to-pay with julianday math; the window ranks those days from slowest down; LIMIT 5 prints the call list. The ASC flip would rank the fastest payers as the slowest — the collections team would thank customers who need chasing. NTILE would need a constant and deal bands instead of a call order.",
  },
  {
    id: "cs-2166",
    tier: "medium",
    topic: "t5",
    universe: "growth",
    title: "City revenue standings",
    brief:
      "From: Growth lead. Re: the city standings.\n\nJoin orders to customers, fold revenue per city, and stamp strict rungs from the biggest earner down. The standings print every city, rungs never shared.",
    ask: "Rank cities by revenue, strict rungs.",
    template: `WITH r AS (
  SELECT c.city, {1}(o.total) AS revenue
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  GROUP BY c.city
)
SELECT city, revenue, {2}() OVER (ORDER BY revenue {3}, city ASC) AS rk
FROM r
ORDER BY rk;`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the revenue fold", why: "City revenue is the sum of order totals through the join — SUM in the staging CTE." },
      { answer: "ROW_NUMBER", kind: "keyword", label: "the standings stamp", why: "Strict rungs never shared — ROW_NUMBER's dealing; argument-less chips would not run." },
      { answer: "DESC", kind: "keyword", label: "the earner direction", why: "Biggest-earning city at rung 1 is revenue DESC." },
    ],
    distractors: ["LAG", "NTILE", "ASC"],
    walkthrough:
      "The join hands each order its city; the CTE folds one revenue figure per city; the window stamps strict rungs biggest-first. Argument-less chips like LAG and NTILE would not run without their arguments — and the ASC flip would rank the quietest market first.",
  },
  {
    id: "cs-2167",
    tier: "medium",
    topic: "t5",
    universe: "month-close",
    title: "Status value ranks",
    brief:
      "From: Controller. Re: the status value table.\n\nStage revenue per order status, then rank the statuses from most valuable down. The table shows competition ranks — ties would share and the next would skip, per the audit convention.",
    ask: "Rank statuses by revenue with competition ranks.",
    template: `WITH s AS (
  SELECT status, {1}(total) AS revenue
  FROM orders
  GROUP BY status
)
SELECT status, revenue, {2}() OVER (ORDER BY revenue {3}) AS rk
FROM s
ORDER BY rk;`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the value fold", why: "Status revenue is the sum of order totals — SUM in the staging layer." },
      { answer: "RANK", kind: "keyword", label: "the audit rank", why: "Competition ranks with gaps after ties — the audit convention; argument-less chips would not run." },
      { answer: "DESC", kind: "keyword", label: "the value direction", why: "Most valuable status at rank 1 is revenue DESC." },
    ],
    distractors: ["LAG", "NTILE", "ASC"],
    walkthrough:
      "The staging CTE folds one revenue figure per status; the window ranks them with the audit's tie convention. Argument-less function chips would not even run. The ASC flip would crown 'cancelled' as the most valuable status — the table would read like an obituary for the funnel.",
  },
  {
    id: "cs-2168",
    tier: "hard",
    topic: "t5",
    universe: "supplier",
    title: "Each supplier's bargain bin",
    brief:
      "From: Supplier audit. Re: the bargain pins.\n\nFor each supplier, pin their single CHEAPEST product. Rank products inside their supplier partition by price ascending and keep rung 1 — equal prices resolve alphabetically.",
    ask: "Pin each supplier's cheapest product.",
    template: `WITH r AS (
  SELECT s.name AS supplier, p.name AS product, p.price,
         {1}() OVER (PARTITION BY {2} ORDER BY p.price {3}, p.name ASC) AS rk
  FROM products p
  JOIN suppliers s ON s.id = p.supplier_id
)
SELECT supplier, product, price
FROM r
WHERE rk = 1
ORDER BY supplier;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the pin stamp", why: "One pinned bargain per supplier needs one winning rung — ROW_NUMBER keeps the competition strict." },
      { answer: "p.supplier_id", kind: "keyword", label: "the pin boundary", why: "PARTITION BY the supplier key gives every supplier its own price ladder." },
      { answer: "ASC", kind: "keyword", label: "the bargain direction", why: "Cheapest at rung 1 is price ASC inside each supplier." },
    ],
    distractors: ["LAG", "warehouse", "DESC"],
    walkthrough:
      "The join names each supplier; the partition scopes each ladder; the ASC walk pins the bargain; the name tiebreak keeps the pin reproducible. The DESC flip would pin each supplier's PREMIUM item — the sheet would document the opposite end of every shelf. A partition column absent from the joined tables would not run at all.",
  },
  {
    id: "cs-2169",
    tier: "easy",
    topic: "t5",
    universe: "inventory",
    title: "The deepest five shelves",
    brief:
      "From: Inventory count. Re: the depth shortlist.\n\nThe depth shortlist shows the five deepest shelves. Stamp every product with its position in the stock walk, biggest stock first, and print the first five.",
    ask: "Rank products by stock, deepest five.",
    template: `SELECT name, stock, {1}() OVER (ORDER BY stock {2}, name ASC) AS rk
FROM products
ORDER BY rk
{3};`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the shortlist stamp", why: "Strict positions — ROW_NUMBER deals them without sharing." },
      { answer: "DESC", kind: "keyword", label: "the depth direction", why: "Deepest shelf at rank 1 is stock DESC — the ASC flip would shortlist the emptiest shelves instead." },
      { answer: "LIMIT 5", kind: "keyword", noVerify: true, label: "the shortlist cut", why: "The shortlist carries five shelves — LIMIT 5 trims the walk." },
    ],
    distractors: ["LAG", "ASC", "LIMIT 10"],
    walkthrough:
      "One window, one competition: stock DESC with the alphabetical tiebreak inside, output re-sorted by rank, LIMIT 5 for the shortlist. The ASC flip would shortlist the emptiest shelves — a restock list wearing a depth report's name. LAG would need an argument and read one row back instead of stamping.",
  },
  {
    id: "cs-2170",
    tier: "hard",
    topic: "t5",
    universe: "growth",
    title: "Everyone's first basket",
    brief:
      "From: Growth lead. Re: the anniversary mailer.\n\nFor each customer, pin their EARLIEST order — the anniversary anchor. Rank orders inside their customer partition by date ascending (same-day: smaller id) and keep rung 1.",
    ask: "Pin each customer's first order.",
    template: `WITH r AS (
  SELECT customer_id, id, created_at,
         {1}() OVER (PARTITION BY customer_id ORDER BY created_at {2}, id ASC) AS rk
  FROM orders
)
SELECT customer_id, id, created_at
FROM r
WHERE rk = 1
ORDER BY customer_id
{3};`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the anchor stamp", why: "One anchored order per customer needs one winning rung — argument-less chips like LAG would not even run." },
      { answer: "ASC", kind: "keyword", label: "the clock direction", why: "Earliest order at rung 1 is created_at ASC, with the id ASC tiebreak resolving same-day anchors." },
      { answer: "LIMIT 6", kind: "keyword", noVerify: true, label: "the mailer batch", why: "The mailer processes six anchors per batch — LIMIT 6 trims the pinned winners." },
    ],
    distractors: ["NTILE", "DESC", "LIMIT 2"],
    walkthrough:
      "The partition gives every customer their own timeline; the ASC run pins the first order; the id ASC tiebreak resolves same-day anchors; LIMIT 6 batches the mailer. The DESC flip would anchor on the NEWEST order — the mailer would celebrate the wrong anniversary.",
  },
  {
    id: "cs-2171",
    tier: "medium",
    topic: "t5",
    universe: "expense",
    title: "Account debit standings",
    brief:
      "From: Spend report. Re: the debit table.\n\nFold total debits per ledger account, then stamp strict rungs from the heaviest debit account down. The table prints every account, rungs never shared.",
    ask: "Rank ledger accounts by total debits.",
    template: `WITH a AS (
  SELECT account, {1}(debit_cents) AS debits
  FROM ledger_entries
  GROUP BY account
)
SELECT account, debits, ROW_NUMBER() OVER (ORDER BY debits {2}, account ASC) AS rk
FROM a
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the debit fold", why: "An account's debit mass is SUM(debit_cents) — the money fold the table needs." },
      { answer: "DESC", kind: "keyword", label: "the debit direction", why: "Heaviest debit account at rung 1 is debits DESC." },
      { answer: "rk", kind: "keyword", label: "the display sort", why: "The table reads in rank order — ORDER BY rk keeps the standings tidy." },
    ],
    distractors: ["COUNT", "ASC", "net"],
    walkthrough:
      "The staging CTE folds one debit mass per account; the window stamps strict rungs from the heaviest down; the display sorts by rank. COUNT would tally entries instead of money — an account with many small debits would outrank one heavy hit. The ASC flip would crown the thinnest debit account, and 'net' is not a column here.",
  },
  {
    id: "cs-2172",
    tier: "medium",
    topic: "t5",
    universe: "fraud",
    title: "Each status's biggest basket",
    brief:
      "From: Fraud spot-check. Re: the status peaks.\n\nWithin each order status, pin the single biggest basket. Rank baskets inside their status partition by total descending and keep rung 1 — the peak of every funnel stage.",
    ask: "Pin the biggest basket of every status.",
    template: `WITH r AS (
  SELECT status, id, total,
         {1}() OVER (PARTITION BY {2} ORDER BY total {3}, id ASC) AS rk
  FROM orders
)
SELECT status, id, total
FROM r
WHERE rk = 1
ORDER BY status;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the peak stamp", why: "One pinned basket per status needs one winning rung — argument-less chips would not run." },
      { answer: "status", kind: "keyword", label: "the peak boundary", why: "PARTITION BY status gives every funnel stage its own competition." },
      { answer: "DESC", kind: "keyword", label: "the weight direction", why: "Biggest basket at rung 1 is total DESC inside each status." },
    ],
    distractors: ["LAG", "customer_id", "ASC"],
    walkthrough:
      "The partition scopes each competition to one funnel stage; the DESC walk pins its heaviest basket; the id tiebreak keeps the pick stable. Argument-less chips like LAG would not run, and repartitioning by customer would pin each PERSON'S biggest basket instead of each stage's.",
  },
  {
    id: "cs-2173",
    tier: "hard",
    topic: "t5",
    universe: "month-close",
    title: "Two biggest payments per month",
    brief:
      "From: Controller. Re: the monthly cash peaks.\n\nWithin each calendar month (of paid_on), rank payments by amount descending and keep the top two. The peaks feed the treasurer's month-end packet.",
    ask: "List each month's two biggest payments.",
    template: `WITH r AS (
  SELECT strftime('%Y-%m', paid_on) AS month, id, amount_cents,
         {1}() OVER (PARTITION BY {2} ORDER BY amount_cents {3}, id ASC) AS rk
  FROM payments
)
SELECT month, id, amount_cents, rk
FROM r
WHERE rk <= 2
ORDER BY month, rk;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the peak stamp", why: "Two distinct peak slots per month — argument-less chips would not run without a constant." },
      { answer: "strftime('%Y-%m', paid_on)", kind: "keyword", label: "the month boundary", why: "PARTITION BY the month expression gives every calendar month its own competition." },
      { answer: "DESC", kind: "keyword", label: "the size direction", why: "Biggest payment at rung 1 is amount DESC within each month." },
    ],
    distractors: ["LAG", "customer_id", "ASC"],
    walkthrough:
      "The partition key is the month expression itself — every calendar month becomes its own competition; the DESC walk ranks its payments; the staged rung lets the outer query keep the pair. A partition key absent from the table would not run. The ASC flip would surface each month's smallest payments as its peaks.",
  },
  {
    id: "cs-2174",
    tier: "medium",
    topic: "t5",
    universe: "pricing",
    title: "Premium pins per supplier",
    brief:
      "From: Pricing review. Re: the premium pins.\n\nFor each supplier, pin their single most expensive product. Rank products inside their supplier partition by price descending and keep rung 1 — the premium face of every shelf.",
    ask: "Pin each supplier's priciest product.",
    template: `WITH r AS (
  SELECT supplier_id, name, price,
         {1}() OVER (PARTITION BY supplier_id ORDER BY price {2}, name ASC) AS rk
  FROM products
)
SELECT supplier_id, name, price
FROM r
WHERE rk = 1
ORDER BY {3};`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the premium stamp", why: "One pinned product per supplier needs one winning rung — ROW_NUMBER keeps the competition strict." },
      { answer: "DESC", kind: "keyword", label: "the premium direction", why: "Priciest at rung 1 is price DESC inside each supplier." },
      { answer: "supplier_id", kind: "keyword", label: "the display sort", why: "The sheet reads supplier by supplier — ORDER BY supplier_id groups the pins; a competition RANK would share rung 1 on price ties and leave the pin ambiguous." },
    ],
    distractors: ["LAG", "ASC", "category"],
    walkthrough:
      "The partition scopes each ladder to one supplier; the DESC walk pins their premium face; the name tiebreak keeps the pin reproducible; the display sorts by supplier. The ASC flip would pin each supplier's bargain as their premium — the sheet would misprice every shelf. A competition RANK would share rung 1 if two products tied, leaving the pin ambiguous.",
  },
  {
    id: "cs-2175",
    tier: "hard",
    topic: "t5",
    universe: "funnel",
    title: "Two flagships per region, delivered only",
    brief:
      "From: Marketing funnel. Re: the regional flagships.\n\nAmong DELIVERED orders, rank baskets inside their region partition by total descending and keep the top two. The flagships anchor each region's poster — computed, never typed.",
    ask: "List each region's two biggest delivered baskets.",
    template: `WITH r AS (
  SELECT c.region, o.id, o.total,
         {1}() OVER (PARTITION BY c.region ORDER BY o.total {2}, o.id ASC) AS rk
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  WHERE o.status = 'delivered'
)
SELECT region, id, total, rk
FROM r
WHERE rk {3} 2
ORDER BY region, rk;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the flagship stamp", why: "Two distinct flagship slots per region — argument-less chips would not run without an argument." },
      { answer: "DESC", kind: "keyword", label: "the flagship direction", why: "Biggest delivered basket at rung 1 is total DESC inside each region." },
      { answer: "<=", kind: "keyword", label: "the pair cut", why: "Keeping rungs 1 and 2 is rk <= 2; a bare '=' would drop every runner-up from the posters." },
    ],
    distractors: ["LAG", "ASC", "<"],
    walkthrough:
      "The gate trims the world to delivered baskets before the window runs; the partition gives each region its own competition; the staged rung lets the outer query keep the pair. The <= is load-bearing — switching to = would fire every runner-up. Argument-less chips would not run, and the ASC flip would crown each region's smallest delivered basket as its flagship.",
  },
];
