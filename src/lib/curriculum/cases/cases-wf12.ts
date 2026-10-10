// Case batch WF12 — window functions deep-dive, t8 (Window capstone), cs-2376…cs-2400. NTILE, distributions, capstones.
import type { CaseStudy } from "./types";

export const casesWf12: CaseStudy[] = [
  {
    id: "cs-2376",
    tier: "medium",
    topic: "t8",
    universe: "pricing",
    title: "Three price tiers",
    brief:
      "From: Pricing review. Re: the tier sheet. Split the catalog into THREE price tiers by tile — the cheapest third in tile 1, the dearest in tile 3. NTILE deals by count, not by value thresholds.",
    ask: "Deal the catalog into three price tiles.",
    template: `SELECT name, price, {1}({2}) OVER (ORDER BY price ASC, name ASC) AS tier
FROM products
ORDER BY price ASC, name ASC
LIMIT 16 OFFSET {3};`,
    slots: [
      { answer: "NTILE", kind: "keyword", noVerify: true, label: "the tile dealer", why: "NTILE deals rows into equal-count buckets — the memo's proportional tiering." },
      { answer: "3", kind: "keyword", noVerify: true, label: "the tier count", why: "Three tiers means NTILE(3): 6/5/5 across sixteen products." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["RANK", "4", "5"],
    walkthrough:
      "NTILE(3) deals the sixteen products into three equal-count shelves — 6/5/5 — cheapest first. RANK would stamp positions 1..16, not buckets, and NTILE(4) would deal four shelves when the memo asked for three. Tile numbers are counts, not value thresholds.",
  },
  {
    id: "cs-2377",
    tier: "medium",
    topic: "t8",
    universe: "fraud",
    title: "Order quartiles",
    brief:
      "From: Fraud spot-check. Re: the basket spread. Split all orders into four buckets by total, cheapest bucket first, and show each order's tile. 103 orders deal into 26/26/26/25.",
    ask: "Deal orders into four total buckets.",
    template: `SELECT id, total, {1}({2}) OVER (ORDER BY total ASC, id ASC) AS tile
FROM orders
ORDER BY total ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "NTILE", kind: "keyword", noVerify: true, label: "the tile dealer", why: "Equal-count buckets are NTILE's deal — quartiles by count." },
      { answer: "4", kind: "keyword", noVerify: true, label: "the bucket count", why: "Four buckets is NTILE(4): 26/26/26/25 across the 103 baskets." },
      { answer: "40", kind: "keyword", noVerify: true, label: "the sheet cut", why: "LIMIT 40 reaches past row 27, where the three-tile and four-tile deals diverge." },
    ],
    distractors: ["RANK", "3", "20"],
    walkthrough:
      "NTILE(4) deals the 103 baskets into four equal-count quartiles — the spread the examiner reads. RANK would stamp a 1..N ladder instead of buckets, and NTILE(3) would deal terciles. The id tiebreak keeps the dealing deterministic at the bucket edges.",
  },
  {
    id: "cs-2378",
    tier: "hard",
    topic: "t8",
    universe: "pricing",
    title: "Tiers inside each category",
    brief:
      "From: Pricing review. Re: the aisle tiles. Within EACH category, deal products into two price tiles — the cheaper half in tile 1. The counter resets per aisle, so every category has its own halves.",
    ask: "Deal each category's products into two price tiles.",
    template: `SELECT name, category, price,
       {1}({2}) OVER (PARTITION BY category ORDER BY price ASC, name ASC) AS tile
FROM products
ORDER BY category, price ASC, name ASC
LIMIT {3};`,
    slots: [
      { answer: "NTILE", kind: "keyword", noVerify: true, label: "the tile dealer", why: "Equal-count halves are NTILE's deal, partitioned per aisle." },
      { answer: "2", kind: "keyword", noVerify: true, label: "the half count", why: "Two tiles is NTILE(2) — the cheaper half lands in tile 1." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the sheet cut", why: "The sheet prints twelve rows — LIMIT 12 trims the walked aisles." },
    ],
    distractors: ["RANK", "3", "6"],
    walkthrough:
      "NTILE(2) partitioned by category deals each aisle into its own halves — the counter resets at every aisle edge. RANK would run a 1..N ladder inside each aisle instead of buckets. Odd-sized aisles give the extra row to the earlier tile.",
  },
  {
    id: "cs-2379",
    tier: "hard",
    topic: "t8",
    universe: "fraud",
    title: "The top quarter of spenders",
    brief:
      "From: Fraud spot-check. Re: the whale list. Stage each customer's lifetime spend, deal them into four tiles by spend DESCENDING, and keep tile 4 — the top quarter by money. The tile is staged, then filtered.",
    ask: "List the top-quarter customers by lifetime spend.",
    template: `WITH s AS (
  SELECT c.name, SUM(o.total) AS spend
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  GROUP BY c.id, c.name
), t AS (
  SELECT name, spend, {1}({2}) OVER (ORDER BY spend DESC, name ASC) AS tile
  FROM s
)
SELECT name, ROUND(spend, 2) AS spend, tile
FROM t
WHERE tile = 4
ORDER BY spend DESC, name ASC
LIMIT {3};`,
    slots: [
      { answer: "NTILE", kind: "keyword", noVerify: true, label: "the tile dealer", why: "The whale list is the top tile of a four-way deal — NTILE(4)." },
      { answer: "4", kind: "keyword", noVerify: true, label: "the tile count", why: "Four tiles, ranked descending, puts the biggest spenders in tile 4." },
      { answer: "3", kind: "keyword", noVerify: true, label: "the list cut", why: "LIMIT 3 trims the whale list to its first three rows so the cut is provable." },
    ],
    distractors: ["RANK", "5", "1"],
    walkthrough:
      "Stage, deal, filter: the CTE folds one spend per customer, NTILE(4) deals them descending so tile 4 holds the top quarter, and the outer query keeps that tile. RANK would stamp a ladder — no buckets to filter. Filtering in the staging layer would be impossible; the tile exists only after the window.",
  },
  {
    id: "cs-2380",
    tier: "medium",
    topic: "t8",
    universe: "fraud",
    title: "Cumulative distribution of baskets",
    brief:
      "From: Fraud spot-check. Re: the distribution. For every order show CUME_DIST over the total-ascending walk — the fraction of baskets at or below this one, rounded to four decimals. The last row must read 1.0.",
    ask: "Show each basket's cumulative distribution.",
    template: `SELECT id, total,
       {1}({2}() OVER (ORDER BY total ASC, id ASC), 4) AS cum_dist
FROM orders
ORDER BY total ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "ROUND", kind: "keyword", noVerify: true, label: "the decimal dressing", why: "Distributions read cleanest at four decimals — ROUND dresses the fraction." },
      { answer: "CUME_DIST", kind: "keyword", noVerify: true, label: "the distribution chip", why: "CUME_DIST is the fraction of rows at or below the current one." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sheet prints twelve rows — LIMIT 12 trims the walked distribution." },
    ],
    distractors: ["PERCENT_RANK", "3"],
    walkthrough:
      "CUME_DIST answers 'what fraction of baskets cost at most this much' — it reaches 1.0 at the final row. PERCENT_RANK starts at exactly 0 and scales by rank, a different statistic the memo did not ask for. The dressing keeps the fractions readable.",
  },
  {
    id: "cs-2381",
    tier: "medium",
    topic: "t8",
    universe: "growth",
    title: "Percent rank of baskets",
    brief:
      "From: Growth lead. Re: the percentile ladder. For every order show PERCENT_RANK over the total-ascending walk — (rank minus one) over (rows minus one), rounded to four decimals. The first row must read 0.0.",
    ask: "Show each basket's percent rank.",
    template: `SELECT id, total,
       {1}({2}() OVER (ORDER BY total ASC, id ASC), 4) AS pr
FROM orders
ORDER BY total ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "ROUND", kind: "keyword", noVerify: true, label: "the decimal dressing", why: "Percent ranks read cleanest at four decimals — ROUND dresses the fraction." },
      { answer: "PERCENT_RANK", kind: "keyword", noVerify: true, label: "the ladder chip", why: "PERCENT_RANK is (rank-1)/(rows-1) — it starts at exactly 0." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sheet prints twelve rows — LIMIT 12 trims the walked ladder." },
    ],
    distractors: ["CUME_DIST", "3"],
    walkthrough:
      "PERCENT_RANK places each basket on the 0-to-1 ladder by rank; the cheapest basket reads exactly 0.0. CUME_DIST would start above zero and count peers — a cumulative share, not a rank fraction. The dressing keeps the ladder readable.",
  },
  {
    id: "cs-2382",
    tier: "medium",
    topic: "t8",
    universe: "pricing",
    title: "Two statistics, one shelf",
    brief:
      "From: Pricing review. Re: the paired columns. On every product show BOTH the CUME_DIST and the PERCENT_RANK of its price over the ascending walk — the two statistics agree only in the extremes, and the contrast is the lesson.",
    ask: "Show the distribution and the rank of every price.",
    template: `SELECT name, price,
       ROUND(CUME_DIST() OVER (ORDER BY price ASC, name ASC), 4) AS cd,
       {1}({2}() OVER (ORDER BY price ASC, name ASC), 4) AS pr
FROM products
ORDER BY price ASC, name ASC
LIMIT {3};`,
    slots: [
      { answer: "ROUND", kind: "keyword", noVerify: true, label: "the decimal dressing", why: "Both statistics read cleanest at four decimals — ROUND dresses them." },
      { answer: "PERCENT_RANK", kind: "keyword", noVerify: true, label: "the rank chip", why: "The second column is the rank fraction — starting at exactly 0." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the shelf cut", why: "The sheet prints twelve rows — LIMIT 12 trims the walked shelf." },
    ],
    distractors: ["CUME_DIST", "NTILE"],
    walkthrough:
      "Two windows over one walk: CUME_DIST counts peers cumulatively, PERCENT_RANK scales by rank — the first rows separate them (cd > 0 but pr = 0). NTILE would bucket instead of placing. The memo wants both columns so the reader can feel the difference.",
  },
  {
    id: "cs-2383",
    tier: "hard",
    topic: "t8",
    universe: "month-close",
    title: "Invoice deciles",
    brief:
      "From: Controller. Re: the AR spread. Split invoices into TEN amount tiles and show each bill's decile — the fine-grained spread of the receivable book. 28 invoices deal into tiles of 3 then 2.",
    ask: "Deal invoices into ten amount tiles.",
    template: `SELECT number, amount_cents, {1}({2}) OVER (ORDER BY amount_cents ASC, id ASC) AS decile
FROM invoices
ORDER BY amount_cents ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "NTILE", kind: "keyword", noVerify: true, label: "the tile dealer", why: "Ten equal-count buckets are NTILE's deal — deciles by count." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the bucket count", why: "Ten tiles is NTILE(10): tiles of 3 then 2 across 28 invoices." },
      { answer: "14", kind: "keyword", noVerify: true, label: "the book cut", why: "The sheet prints fourteen rows — LIMIT 14 trims the dealt book." },
    ],
    distractors: ["RANK", "4", "7"],
    walkthrough:
      "NTILE(10) deals the 28 bills into ten deciles — the fine spread of the receivable book. RANK would stamp a 1..N ladder, and NTILE(4) would deal quartiles when the memo asked for deciles. The id tiebreak keeps the dealing deterministic at the edges.",
  },
  {
    id: "cs-2384",
    tier: "hard",
    topic: "t8",
    universe: "growth",
    title: "The heavier half of spenders",
    brief:
      "From: Growth lead. Re: the upper half. Stage per-customer spend, compute CUME_DIST over the ascending walk, and keep the rows at or above 0.5 — the heavier half of the customer base, by money.",
    ask: "List the customers in the heavier half of spend.",
    template: `WITH s AS (
  SELECT c.name, SUM(o.total) AS spend
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  GROUP BY c.id, c.name
), d AS (
  SELECT name, spend, {1}({2}() OVER (ORDER BY spend ASC, name ASC)) AS cd
  FROM s
)
SELECT name, ROUND(spend, 2) AS spend, ROUND(cd, 4) AS cd
FROM d
WHERE cd >= 0.5
ORDER BY spend ASC, name ASC
LIMIT {3};`,
    slots: [
      { answer: "ROUND", kind: "keyword", noVerify: true, label: "the decimal dressing", why: "The final fraction reads cleanest at two decimals — ROUND dresses it." },
      { answer: "CUME_DIST", kind: "keyword", noVerify: true, label: "the distribution chip", why: "The half-way split is the cumulative distribution — rows at or above 0.5 are the heavier half." },
      { answer: "6", kind: "keyword", noVerify: true, label: "the list cut", why: "LIMIT 6 trims the heavier half to six of the eight qualifying names." },
    ],
    distractors: ["PERCENT_RANK", "NTILE", "3"],
    walkthrough:
      "The staged spends get their cumulative distribution; the filter keeps the rows at or past the halfway mark — the heavier half by money. PERCENT_RANK would start at 0 and never guarantee the halfway semantics; the WHERE cannot see a window directly, which is why the distribution is staged first.",
  },
  {
    id: "cs-2385",
    tier: "medium",
    topic: "t8",
    universe: "month-close",
    title: "Where this month stands",
    brief:
      "From: Controller. Re: the standing columns. Stage monthly revenue and show BOTH the percent rank and the cumulative distribution of each month's revenue — the month's standing on the 0-to-1 ladder and among its peers.",
    ask: "Show each month's percent rank and distribution.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue
  FROM orders
  GROUP BY month
)
SELECT month, ROUND(revenue, 2) AS revenue,
       {1}({2}() OVER (ORDER BY revenue ASC, month ASC), 4) AS pr,
       ROUND(CUME_DIST() OVER (ORDER BY revenue ASC, month ASC), 4) AS cd
FROM m
ORDER BY revenue ASC, month ASC
LIMIT {3};`,
    slots: [
      { answer: "ROUND", kind: "keyword", noVerify: true, label: "the decimal dressing", why: "Both statistics read cleanest at four decimals — ROUND dresses them." },
      { answer: "PERCENT_RANK", kind: "keyword", noVerify: true, label: "the rank chip", why: "The first column is the rank fraction over the ascending walk." },
      { answer: "14", kind: "keyword", noVerify: true, label: "the series cut", why: "LIMIT 14 keeps every month so both statistics complete." },
    ],
    distractors: ["CUME_DIST", "NTILE"],
    walkthrough:
      "Two windows over the staged months: PERCENT_RANK places each month on the rank ladder, CUME_DIST counts the peers at or below it. NTILE would bucket the months instead of placing them. The memo wants both so the reader sees where rank and distribution diverge.",
  },
  {
    id: "cs-2386",
    tier: "hard",
    topic: "t8",
    universe: "pricing",
    title: "Percent rank inside each aisle",
    brief:
      "From: Pricing review. Re: the aisle ladders. On every product show the PERCENT_RANK of its price WITHIN its category — each aisle's own 0-to-1 ladder. Solo products in a category read 0.0.",
    ask: "Show each product's price percent rank within its aisle.",
    template: `SELECT name, category, price,
       {1}({2}() OVER (PARTITION BY category ORDER BY price ASC, name ASC), 4) AS aisle_pr
FROM products
ORDER BY category, price ASC, name ASC
LIMIT {3};`,
    slots: [
      { answer: "ROUND", kind: "keyword", noVerify: true, label: "the decimal dressing", why: "Ladder fractions read cleanest at four decimals — ROUND dresses them." },
      { answer: "PERCENT_RANK", kind: "keyword", noVerify: true, label: "the ladder chip", why: "The within-aisle ladder is PERCENT_RANK partitioned by category." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the sheet cut", why: "The sheet prints twelve rows — LIMIT 12 trims the walked aisles." },
    ],
    distractors: ["CUME_DIST", "NTILE"],
    walkthrough:
      "The partition scopes each aisle's ladder; PERCENT_RANK places every product on it from 0 to 1 — a solo product in a one-item category reads 0.0 because (rank-1)/(rows-1) is zero over zero, defined as zero. CUME_DIST would count peers instead of ranking.",
  },
  {
    id: "cs-2387",
    tier: "medium",
    topic: "t8",
    universe: "inventory",
    title: "Demand distribution per line",
    brief:
      "From: Inventory count. Re: the line distribution. On every order line show the CUME_DIST of its line value over the whole book — where this sale sits among all lines, by money.",
    ask: "Show each line's distribution by line value.",
    template: `SELECT id, ROUND(quantity * unit_price, 2) AS line_value,
       ROUND({1}() OVER (ORDER BY quantity * unit_price ASC, id ASC), 4) AS cd
FROM order_items
ORDER BY quantity * unit_price ASC, id ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "CUME_DIST", kind: "keyword", noVerify: true, label: "the distribution chip", why: "The line's placement among all lines is the cumulative distribution over the value walk." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sheet prints twelve rows — LIMIT 12 trims the walked lines." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["PERCENT_RANK", "NTILE", "5"],
    walkthrough:
      "CUME_DIST places each line by the fraction of lines worth at most as much — the distribution the replenishment team reads. PERCENT_RANK would scale by rank instead of peers, a subtly different placement, and NTILE would bucket the book rather than locate a line within it.",
  },
  {
    id: "cs-2388",
    tier: "hard",
    topic: "t8",
    universe: "growth",
    title: "Volume tiles by month",
    brief:
      "From: Growth lead. Re: the calendar spread. Stage monthly order counts and deal the months into FOUR tiles by volume — the busy seasons in tile 4. The tiles are staged, then the top tile is kept.",
    ask: "Deal months into four volume tiles, keep the busiest.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS orders
  FROM orders
  GROUP BY month
), t AS (
  SELECT month, orders, {1}({2}) OVER (ORDER BY orders DESC, month ASC) AS tile
  FROM m
)
SELECT month, orders, tile
FROM t
WHERE tile = 4
ORDER BY orders DESC, month ASC
LIMIT {3};`,
    slots: [
      { answer: "NTILE", kind: "keyword", noVerify: true, label: "the tile dealer", why: "Four equal-count tiles are NTILE's deal, ranked descending so tile 4 is the busiest." },
      { answer: "4", kind: "keyword", noVerify: true, label: "the tile count", why: "Four tiles is NTILE(4): the fourteen months deal 4/4/3/3." },
      { answer: "2", kind: "keyword", noVerify: true, label: "the season cut", why: "LIMIT 2 trims the busiest tile display to two of its months so the cut is provable." },
    ],
    distractors: ["RANK", "2", "5"],
    walkthrough:
      "Stage, deal, keep: the CTE counts each month, NTILE(4) deals them descending so tile 4 collects the busiest quarter of the calendar, and the outer query keeps that tile. RANK would run a ladder with no buckets, and the count fold must be COUNT — months are counted, not summed.",
  },
  {
    id: "cs-2389",
    tier: "medium",
    topic: "t8",
    universe: "month-close",
    title: "The distribution of billed cents",
    brief:
      "From: Controller. Re: the AR placement. For every invoice show the CUME_DIST of its amount over the book — where this bill sits among all bills, by size.",
    ask: "Show each invoice's distribution by amount.",
    template: `SELECT number, amount_cents,
       ROUND({1}() OVER (ORDER BY amount_cents ASC, id ASC), 4) AS cd
FROM invoices
ORDER BY amount_cents ASC, id ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "CUME_DIST", kind: "keyword", noVerify: true, label: "the distribution chip", why: "The bill's placement among all bills is the cumulative distribution over the amount walk." },
      { answer: "14", kind: "keyword", noVerify: true, label: "the book cut", why: "The sheet prints fourteen rows — LIMIT 14 trims the walked book." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["PERCENT_RANK", "NTILE", "5"],
    walkthrough:
      "CUME_DIST places each bill by the fraction of bills at or below its size — the AR team reads it as 'this bill is bigger than X percent of the book'. PERCENT_RANK would scale by rank, and NTILE would deal buckets instead of locating a bill.",
  },
  {
    id: "cs-2390",
    tier: "hard",
    topic: "t8",
    universe: "fraud",
    title: "Payment-speed bands",
    brief:
      "From: Fraud spot-check. Re: the speed bands. Join payments to invoices, compute each payment's days-to-pay, then deal the payments into FOUR speed bands — the slowest payers land in band 4.",
    ask: "Deal payments into four speed bands.",
    template: `WITH t AS (
  SELECT p.id AS payment_id,
         CAST(julianday(p.paid_on) - julianday(i.issued_on) AS INTEGER) AS days
  FROM payments p
  JOIN invoices i ON i.id = p.invoice_id
)
SELECT payment_id, days, {1}({2}) OVER (ORDER BY days ASC, payment_id ASC) AS band
FROM t
ORDER BY days ASC, payment_id ASC
LIMIT {3};`,
    slots: [
      { answer: "NTILE", kind: "keyword", noVerify: true, label: "the band dealer", why: "Four equal-count bands are NTILE's deal over the ascending speed walk." },
      { answer: "4", kind: "keyword", noVerify: true, label: "the band count", why: "Four bands is NTILE(4) — band 4 holds the slowest payers." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sheet prints twelve rows — LIMIT 12 trims the walked payments." },
    ],
    distractors: ["RANK", "2", "6"],
    walkthrough:
      "The staged days-to-pay feed NTILE(4) over the ascending walk — fast payers collect in band 1, slow payers in band 4. RANK would stamp a ladder instead of bands. The julianday staging keeps the band deal honest: the window sees computed days, not raw dates.",
  },
  {
    id: "cs-2391",
    tier: "hard",
    topic: "t8",
    universe: "fraud",
    title: "Speed percentiles",
    brief:
      "From: Fraud spot-check. Re: the standing columns. For every payment show the PERCENT_RANK of its days-to-pay among all payments — how slow this payer is relative to the book, on the 0-to-1 ladder.",
    ask: "Show each payment's speed percent rank.",
    template: `WITH t AS (
  SELECT p.id AS payment_id,
         CAST(julianday(p.paid_on) - julianday(i.issued_on) AS INTEGER) AS days
  FROM payments p
  JOIN invoices i ON i.id = p.invoice_id
)
SELECT payment_id, days,
       {1}({2}() OVER (ORDER BY days ASC, payment_id ASC), 4) AS pr
FROM t
ORDER BY days ASC, payment_id ASC
LIMIT {3};`,
    slots: [
      { answer: "ROUND", kind: "keyword", noVerify: true, label: "the decimal dressing", why: "Ladder fractions read cleanest at four decimals — ROUND dresses them." },
      { answer: "PERCENT_RANK", kind: "keyword", noVerify: true, label: "the ladder chip", why: "The speed ladder is PERCENT_RANK over the ascending days walk." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sheet prints twelve rows — LIMIT 12 trims the walked payments." },
    ],
    distractors: ["CUME_DIST", "NTILE"],
    walkthrough:
      "The staged days feed PERCENT_RANK: the fastest payer reads 0.0, the slowest 1.0. CUME_DIST would count peers cumulatively — close, but the memo's statistic is the rank fraction, and NTILE would bucket instead of placing. The staging keeps julianday math out of the window.",
  },
  {
    id: "cs-2392",
    tier: "medium",
    topic: "t8",
    universe: "catalog",
    title: "Customer spend distribution",
    brief:
      "From: Warehouse catalog. Re: the money placement. Stage per-customer spend and show each account's CUME_DIST over the ascending walk — the customer's placement in the base's money distribution.",
    ask: "Show each customer's spend distribution.",
    template: `WITH s AS (
  SELECT c.name, SUM(o.total) AS spend
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  GROUP BY c.id, c.name
)
SELECT name, ROUND(spend, 2) AS spend,
       {1}({2}() OVER (ORDER BY spend ASC, name ASC), 4) AS cd
FROM s
ORDER BY spend ASC, name ASC
LIMIT {3};`,
    slots: [
      { answer: "ROUND", kind: "keyword", noVerify: true, label: "the decimal dressing", why: "Distributions read cleanest at four decimals — ROUND dresses the fraction." },
      { answer: "CUME_DIST", kind: "keyword", noVerify: true, label: "the distribution chip", why: "The customer's placement among all customers is the cumulative distribution." },
      { answer: "16", kind: "keyword", noVerify: true, label: "the roll cut", why: "LIMIT 16 keeps the whole roll so the distribution completes at 1.0." },
    ],
    distractors: ["PERCENT_RANK", "NTILE"],
    walkthrough:
      "The staged spends feed CUME_DIST: the biggest spender's distribution reads 1.0, the smallest sits just above zero. PERCENT_RANK would scale by rank — a different placement the memo did not ask for — and NTILE would deal the roll into buckets instead of locating each customer.",
  },
  {
    id: "cs-2393",
    tier: "hard",
    topic: "t8",
    universe: "catalog",
    title: "The revenue command board",
    brief:
      "From: Warehouse catalog. Re: the capstone sheet. Stage monthly revenue with its previous month borrowed, then compute the rank (from biggest), the cumulative climb, and the MoM growth percent — three windows, one sheet, filtered to the top five ranks.",
    ask: "Build the monthly revenue command board, top five ranks.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue
  FROM orders
  GROUP BY month
), d AS (
  SELECT month, revenue, {1}(revenue) OVER (ORDER BY month ASC) AS prev
  FROM m
), x AS (
  SELECT month, revenue, prev,
         RANK() OVER (ORDER BY revenue DESC, month ASC) AS rk,
         SUM(revenue) OVER (ORDER BY month ASC {2}) AS cum_revenue,
         ROUND(100.0 * (revenue - prev) / prev, 2) AS growth
  FROM d
)
SELECT month, ROUND(revenue, 2) AS revenue, rk, ROUND(cum_revenue, 2) AS cum_revenue, growth
FROM x
WHERE rk <= 5
ORDER BY month ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", noVerify: true, label: "the look-back chip", why: "Growth compares against the PREVIOUS month — LAG inside the staging layer." },
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the climb frame", why: "The cumulative climb needs the running frame through the current month." },
      { answer: "5", kind: "keyword", noVerify: true, label: "the board cut", why: "The board shows the top five ranks — LIMIT 5 trims the final sheet." },
    ],
    distractors: ["LEAD", "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "3"],
    walkthrough:
      "Three windows compose: LAG stages the previous month for the growth percent, RANK orders the months by money, and the running frame builds the cumulative climb — all filtered to the top five only after every window has run. LEAD would measure growth against the future; the whole-frame chip would freeze the climb at its total.",
  },
  {
    id: "cs-2394",
    tier: "hard",
    topic: "t8",
    universe: "fraud",
    title: "The AR chase list",
    brief:
      "From: Fraud spot-check. Re: the chase list. Among OPEN invoices, compute days past due against the FIXED reference date 2025-03-01, rank them worst-first with a strict ladder, and print the top ten.",
    ask: "Rank open invoices by days past due, top ten.",
    template: `WITH a AS (
  SELECT number, due_on,
         CAST(julianday('2025-03-01') - julianday(due_on) AS INTEGER) AS days_past_due
  FROM invoices
  WHERE status = '{2}'
), r AS (
  SELECT number, due_on, days_past_due,
         {1}() OVER (ORDER BY days_past_due DESC, number ASC) AS rn
  FROM a
  WHERE days_past_due > 0
)
SELECT number, due_on, days_past_due, rn
FROM r
WHERE rn <= 10
ORDER BY rn ASC
LIMIT {3};`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", noVerify: true, label: "the chase stamp", why: "The chase list is a strict 1..N ladder — ROW_NUMBER never shares a slot." },
      { answer: "open", kind: "keyword", noVerify: true, label: "the exposure gate", why: "WHERE open narrows the book to real receivables before any ranking." },
      { answer: "3", kind: "keyword", noVerify: true, label: "the list cut", why: "LIMIT 3 trims the chase list to its three worst offenders so the cut is provable." },
    ],
    distractors: ["NTILE", "paid", "2"],
    walkthrough:
      "Two stages: the aging CTE computes days past due against the fixed reference date, the ranked CTE stamps a strict ladder worst-first, and the outer query trims to ten. The gate runs before the window so the ladder only ever sees open receivables. ROW_NUMBER keeps the list strict — RANK would share a slot when two bills tie on age.",
  },
  {
    id: "cs-2395",
    tier: "medium",
    topic: "t8",
    universe: "month-close",
    title: "The aging ladder",
    brief:
      "From: Controller. Re: the aging buckets. Compute each OPEN invoice's days past due at 2025-03-01, then bucket them: current, 1-30, 31-60, 60+. The CASE does the bucketing over the staged days.",
    ask: "Bucket open invoices into aging bands.",
    template: `WITH a AS (
  SELECT number, amount_cents,
         CAST(julianday('2025-03-01') - julianday(due_on) AS INTEGER) AS days_past_due
  FROM invoices
  WHERE status = '{3}'
)
SELECT number, amount_cents,
       ROW_NUMBER() OVER (ORDER BY days_past_due DESC, number ASC) AS rn,
       CASE WHEN days_past_due <= {1} THEN 'current'
            WHEN days_past_due <= 30 THEN '1-30'
            WHEN days_past_due <= 60 THEN '31-60'
            ELSE '60+' END AS bucket
FROM a
ORDER BY bucket, amount_cents DESC, number ASC
LIMIT {2};`,
    slots: [
      { answer: "0", kind: "keyword", noVerify: true, label: "the current ceiling", why: "Current means not yet due — days at or below zero land in the first bucket; 30 would swallow the 1-30 band." },
      { answer: "6", kind: "keyword", noVerify: true, label: "the sheet cut", why: "Only six open invoices exist; LIMIT 6 keeps the whole bucketed sheet on one page." },
      { answer: "open", kind: "keyword", noVerify: true, label: "the exposure gate", why: "WHERE open narrows the book to real receivables; paid bills would pollute the buckets." },
    ],
    distractors: ["memo", "warehouse", "shipped"],
    walkthrough:
      "The aging CTE stages days past due against the fixed reference date and gates to open invoices; the CASE buckets them at the memo's thresholds — 0, 30, 60 — and the sheet orders buckets by severity then size. Raising the first ceiling would swallow the 1-30 band, and the bucket strings must match the memo exactly.",
  },
  {
    id: "cs-2396",
    tier: "hard",
    topic: "t8",
    universe: "fraud",
    title: "The three-way numbering proof",
    brief:
      "From: Fraud spot-check. Re: the numbering proof. Stage customer order counts, then print ALL three numberings over the tied counts: strict sequence, competition rank with gaps, and the dense band without gaps. The divergence IS the proof.",
    ask: "Print strict, competition, and dense numbers together.",
    template: `WITH t AS (
  SELECT customer_id, COUNT(*) AS n
  FROM orders
  GROUP BY customer_id
)
SELECT customer_id, n,
       ROW_NUMBER() OVER (ORDER BY n DESC, customer_id ASC) AS seq,
       {1}() OVER (ORDER BY n DESC, customer_id ASC) AS rk,
       {2}() OVER (ORDER BY n DESC, customer_id ASC) AS band
FROM t
ORDER BY rk, customer_id ASC
LIMIT {3};`,
    slots: [
      { answer: "RANK", kind: "keyword", noVerify: true, label: "the gap chip", why: "The competition column shares numbers on ties and skips — RANK's signature." },
      { answer: "DENSE_RANK", kind: "keyword", noVerify: true, label: "the dense chip", why: "The band column shares numbers without gaps — DENSE_RANK's contract." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the proof cut", why: "The proof prints twelve rows — LIMIT 12 covers the tie groups." },
    ],
    distractors: ["NTILE", "SUM", "6"],
    walkthrough:
      "One staged set, three windows: seq deals unique slots, rk shares and skips at ties, band shares and continues. Where the columns diverge, the counts tied — that divergence is the examiner's proof. NTILE would deal buckets, and SUM would need a column argument.",
  },
  {
    id: "cs-2397",
    tier: "medium",
    topic: "t8",
    universe: "growth",
    title: "The revenue dashboard row set",
    brief:
      "From: Growth lead. Re: the dashboard. Stage monthly revenue with the previous month borrowed, then show rank, running climb, and MoM growth — but only months ranked in the top FOUR. The filter comes after every window.",
    ask: "Build the revenue dashboard for the top four months.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue
  FROM orders
  GROUP BY month
), d AS (
  SELECT month, revenue, {1}(revenue) OVER (ORDER BY month ASC) AS prev
  FROM m
), x AS (
  SELECT month, revenue, prev,
         RANK() OVER (ORDER BY revenue DESC, month ASC) AS rk,
         ROUND(100.0 * (revenue - prev) / prev, 2) AS growth
  FROM d
)
SELECT month, ROUND(revenue, 2) AS revenue, rk, growth
FROM x
WHERE rk <= {2}
ORDER BY month ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", noVerify: true, label: "the look-back chip", why: "Growth borrows the PREVIOUS month — LAG in the staging layer." },
      { answer: "4", kind: "keyword", noVerify: true, label: "the board cut", why: "The dashboard shows the top four ranks — the WHERE keeps rk at or below 4." },
      { answer: "3", kind: "keyword", noVerify: true, label: "the display cut", why: "LIMIT 3 trims the display to three of the four podium months so the cut is provable." },
    ],
    distractors: ["LEAD", "2", "14"],
    walkthrough:
      "Two windows compose: LAG stages the previous month so the growth percent computes in the outer layer, RANK orders the months by money, and the filter keeps the podium. LEAD would measure against the future. The LIMIT trims the display after the rank filter has already chosen the months.",
  },
  {
    id: "cs-2398",
    tier: "medium",
    topic: "t8",
    universe: "fraud",
    title: "The exposure census",
    brief:
      "From: Fraud spot-check. Re: the exposure census. Count how many OPEN invoices sit past due at the fixed reference date 2025-03-01 — one number for the dashboard, folded from the aged and filtered rows.",
    ask: "Count open invoices past due at the reference date.",
    template: `WITH a AS (
  SELECT number,
         CAST(julianday('2025-03-01') - julianday(due_on) AS INTEGER) AS days_past_due
  FROM invoices
  WHERE status = '{3}'
)
SELECT {1}(*) AS chase_count, ROUND(AVG(days_past_due) OVER (), 2) AS avg_age
FROM a
WHERE days_past_due > {2};`,
    slots: [
      { answer: "COUNT", kind: "keyword", noVerify: true, label: "the census fold", why: "The dashboard wants a single figure — COUNT(*) folds the filtered rows." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the past-due floor", why: "Past due means strictly positive days — the filter keeps the aged receivables only." },
      { answer: "open", kind: "keyword", noVerify: true, label: "the exposure gate", why: "WHERE open narrows the book to real receivables; paid bills would pollute the census." },
    ],
    distractors: ["SUM", "30", "paid"],
    walkthrough:
      "The aging CTE computes days past due against the fixed date and gates to open invoices; the outer COUNT folds the survivors to one dashboard figure. SUM(*) would not run, and a floor of 1 would still be past due — but the memo's convention is strictly positive, so the floor is 0.",
  },
  {
    id: "cs-2399",
    tier: "medium",
    topic: "t8",
    universe: "growth",
    title: "The customer's first and last baskets",
    brief:
      "From: Growth lead. Re: the bracket sheet. On every order show the customer's FIRST basket total and their LAST basket total — two windows over one partition, the second needing the honest frame.",
    ask: "Show the customer's first and last basket totals.",
    template: `SELECT id, customer_id, total,
       FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS first_total,
       LAST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC {1}) AS last_total
FROM orders
ORDER BY customer_id, created_at ASC, id ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", kind: "keyword", noVerify: true, label: "the honest frame", why: "The last basket needs the whole-partition frame; the first comes free on the ascending walk." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the sheet cut", why: "The sheet prints twelve rows — LIMIT 12 trims the private timelines." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "6", "5"],
    walkthrough:
      "Two windows bracket each account's history: FIRST_VALUE grabs the opening basket from the top of the chronological walk, and LAST_VALUE finds the true closing basket only because its frame spans the partition. The truncated chip would mirror the current basket and collapse the bracket.",
  },
  {
    id: "cs-2400",
    tier: "hard",
    topic: "t8",
    universe: "month-close",
    title: "The close binder capstone",
    brief:
      "From: Controller. Re: the binder's final page. Stage monthly revenue; on every month show the rank (from biggest), the running climb, the benchmark month (FIRST_VALUE over the descending walk), and the MoM growth — every window the binder needs, on one page.",
    ask: "Build the close binder's final page.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue
  FROM orders
  GROUP BY month
), d AS (
  SELECT month, revenue, {1}(revenue) OVER (ORDER BY month ASC) AS prev
  FROM m
)
SELECT month, ROUND(revenue, 2) AS revenue,
       RANK() OVER (ORDER BY revenue DESC, month ASC) AS rk,
       SUM(revenue) OVER (ORDER BY month ASC {2}) AS cum_revenue,
       FIRST_VALUE(month) OVER (ORDER BY revenue DESC, month ASC) AS best_month,
       ROUND(100.0 * (revenue - prev) / prev, 2) AS growth
FROM d
ORDER BY month ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", noVerify: true, label: "the look-back chip", why: "Growth borrows the PREVIOUS month — LAG in the staging layer." },
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the climb frame", why: "The cumulative climb needs the running frame through the current month." },
      { answer: "14", kind: "keyword", noVerify: true, label: "the binder cut", why: "LIMIT 14 keeps every month so the page completes the year-and-a-bit." },
    ],
    distractors: ["LEAD", "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "8"],
    walkthrough:
      "Four windows compose on one page: LAG stages the previous month for growth, RANK orders the money, the running frame builds the climb, and FIRST_VALUE over the descending walk crowns the benchmark month. LEAD would forecast instead of retrospect, and the whole-frame chip would freeze the climb at its final total.",
  },
];
