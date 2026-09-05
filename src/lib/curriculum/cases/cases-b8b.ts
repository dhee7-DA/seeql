// Case files cs-182..cs-195 — topic l8 (GROUP BY & HAVING).
// Bucketing lesson: GROUP BY a dimension, per-bucket aggregates, HAVING as the
// bucket filter (the WHERE-vs-HAVING teach), ORDER BY on aggregates as support.
// All figures audited against the live seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesB8b: CaseStudy[] = [
  {
    id: "cs-182",
    topic: "l8",
    universe: "growth",
    title: "Stages that carry the volume",
    brief:
      "From: Chief of Staff. Re: board deck, ops slide.\n\nThe deck needs a pipeline-health line and I refuse to put four stages on the slide when two of them are rounding errors. Show me only the fulfillment stages that carry real volume — more than 20 orders each — so the narrative stays on the buckets that matter. Stage name and order count, please.",
    ask: "Each fulfillment stage with more than 20 orders, showing the stage and its order count.",
    template: `SELECT status, {1}(*) AS orders
FROM orders
{2} BY status
{3} COUNT(*) > {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The deliverable is how many orders sit in each stage, so COUNT(*) tallies rows per bucket — SUM would try to add up the '*' argument and fail outright.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "One row per stage requires GROUP BY status — it partitions the 103 orders into stage buckets so the count computes per bucket instead of one grand total.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The 20-order bar applies to a per-bucket count, and aggregates can't live in WHERE — WHERE runs before buckets exist, so filtering groups is HAVING's job.",
      },
      {
        answer: "20",
        kind: "number",
        label: "the volume bar",
        why: "The brief says more than 20, so the comparison is strict: a stage carrying exactly 20 orders would miss the cut.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "AVG", "ORDER", "WHERE", "30"],
    walkthrough:
      "The ask reads as 'per-stage headcount, big stages only' — a GROUP BY with a HAVING on the count. GROUP BY status builds one bucket per stage; COUNT(*) sizes each; HAVING keeps only the buckets over the bar. The bar lives in HAVING, not WHERE, because WHERE fires before any bucket exists and cannot see counts. Two stages survive: delivered with 52 orders and shipped with 30 — together 82 of the 103 orders on file. Pending (14) and cancelled (7) are the rounding errors we're hiding from the board. Watch the ORDER decoy: it would list all four stages, sorted but unfiltered — volume question unanswered.",
  },
  {
    id: "cs-183",
    topic: "l8",
    universe: "refund-audit",
    title: "Small buckets the team can clear by hand",
    brief:
      "From: refunds@ internal ticket #4517.\n\nQuarter-end goodwill sweep. Before we schedule reviewers I want the exposure picture: the value sitting in each fulfillment bucket, and specifically which buckets are small enough — under 2,000 — for one person to clear manually in a day. Stage name plus its value, rounded.",
    ask: "Each fulfillment stage whose total order value is under 2000, showing the stage and that value rounded to 2 decimals.",
    template: `SELECT status, ROUND({1}(total), 2) AS value_at_risk
FROM orders
GROUP BY status
{2} SUM(total) < {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the value aggregate",
        why: "The brief asks for value per bucket, so SUM adds the order totals inside each stage — COUNT would report how many orders, not how much money.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The under-2000 test applies to a per-bucket sum, and WHERE cannot see aggregates — it filters rows before buckets exist, so the bucket filter must be HAVING.",
      },
      {
        answer: "2000",
        kind: "number",
        label: "the manual-clear bar",
        why: "The ticket defines manually-clearable as under 2000 — strictly less, so a bucket worth exactly 2000.00 would go to the reviewer pool instead.",
        noVerify: true,
      },
    ],
    distractors: ["COUNT", "AVG", "WHERE", "'pending'", "1000"],
    walkthrough:
      "This one is 'value per bucket, small buckets only'. SUM(total) inside each stage bucket measures exposure; the under-2000 cut is a condition on that sum, so it belongs in HAVING — put it in WHERE and SQLite refuses: aggregates don't exist at row-filter time. Exactly one bucket survives: cancelled, worth 1152.49 across its 7 orders. Delivered (15,571.07), shipped (11,996.72) and pending (6,113) all clear the bar and stay with the normal queue. Net: the goodwill sweep is a one-person, one-day job. Watch the COUNT decoy — it would report order counts (7, 14, 30, 52) and every stage would look 'small' next to a 2000 money bar.",
  },
  {
    id: "cs-184",
    topic: "l8",
    universe: "pricing",
    title: "Budget shelves for the entry-tier line",
    brief:
      "From: Head of Product. Re: entry-tier range planning.\n\nWe're building a sub-50 entry tier and I want to know which shelves already live in that world. For each category, tell me how many products it carries and its average price — but only the shelves whose average is genuinely below 50; a shelf averaging 57 isn't an entry-tier story no matter how you spin it.",
    ask: "Per category, the product count and average price (2 decimals), keeping only categories whose average price is under 50.",
    template: `SELECT category, {1}(*) AS items, ROUND({2}(price), 2) AS avg_price
FROM products
{3} BY category
{4} AVG(price) < {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the sku tally",
        why: "The first column is how many SKUs the shelf carries — COUNT(*) tallies rows per bucket; SUM or MAX would report sums and ceilings, not how many products sit there.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean-price aggregate",
        why: "Average price per shelf is AVG(price) inside the rounding — SUM would add the prices together and wildly overstate every shelf.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "Per-shelf numbers require GROUP BY category — it buckets the 16 products so both aggregates compute per shelf.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The under-50 test is on the average, an aggregate — WHERE runs before buckets exist and can't see averages, so the filter is HAVING's job.",
      },
      {
        answer: "50",
        kind: "number",
        label: "the entry-tier ceiling",
        why: "Strictly under 50: a shelf averaging exactly 50.00 would be excluded from the entry tier.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "MAX", "ORDER", "WHERE", "100"],
    walkthrough:
      "Two metrics per bucket and a filter on one of them. GROUP BY category builds the shelves; COUNT(*) sizes them, AVG(price) prices them; HAVING keeps only shelves whose average is under 50. Three survive: Accessories (3 items, average 27.49), Apparel (2, 41.75) and Fitness (1, 32). Electronics misses at 57.83 — close, but the brief said genuinely below 50. The SUM decoy is seductive here because the query already shows a per-shelf aggregate: swap AVG for SUM and the same three shelves return with nonsense numbers (82.48, 83.5, 32) — sums dressed up as averages. And the 100 decoy would wave Electronics and Video into a tier they don't belong in.",
  },
  {
    id: "cs-185",
    topic: "l8",
    universe: "fraud",
    title: "Accounts ordering like resellers",
    brief:
      "From: Risk team, spot-check rotation.\n\nConcentration flag from the anomalies dashboard: a handful of accounts order far more often than any retail pattern explains — classic reseller behavior. Pull the accounts with 5 or more orders, biggest first, with their order counts, so review can pull the full records on the heavy end first.",
    ask: "Each account with at least 5 orders, showing customer id and order count, sorted by count descending.",
    template: `SELECT customer_id, COUNT(*) AS orders
FROM orders
GROUP BY customer_id
{1} COUNT(*) >= {2}
{3} BY orders {4};`,
    slots: [
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The 5-order floor tests a per-account count — an aggregate — so it lives in HAVING; WHERE would reject the query because aggregates don't exist at row-filter time.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the frequency floor",
        why: "At least 5 means COUNT(*) >= 5 — inclusive, so an account with exactly 5 orders makes the list (and one does, sitting exactly on the bar in the results).",
      },
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the ranking clause",
        why: "Biggest first is sorting, so ORDER BY orders — HAVING only filters buckets; it never sequences them.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Descending puts the heaviest accounts on top; the default ASC would surface the lightest suspect first — the opposite of triage.",
      },
    ],
    distractors: ["WHERE", "ASC", "LIMIT", "3"],
    walkthrough:
      "Per-account frequency with a floor and a ranking: GROUP BY customer_id makes one bucket per account, COUNT(*) sizes it, HAVING keeps buckets at or above 5, ORDER BY orders DESC ranks the survivors. Five accounts clear the bar: account 1 with 24 orders, then 17, 14, 13, and account 3 exactly on the bar at 5. That top account is 24 of 103 orders — nearly a quarter of all activity — which is exactly the reseller shape the dashboard flagged. Watch the LIMIT decoy: trimming to a fixed number of rows is not the same as filtering buckets — the policy is a frequency floor, not a top-N cut.",
  },
  {
    id: "cs-186",
    topic: "l8",
    universe: "inventory",
    title: "Shelves running thin before the count",
    brief:
      "From: Warehouse ops manager. Re: cycle count staging.\n\nPhysical count starts Monday and I stage shelves thinnest first. Give me the picture per shelf: how many SKUs sit on it and total units on hand — then keep only the shelves holding fewer than 250 units total. Those are the ones I walk with the counter personally; the fat shelves can be spot-checked.",
    ask: "Per category, SKU count and total stock units, keeping only categories with fewer than 250 units on hand, thinnest first.",
    template: `SELECT category, {1}(*) AS skus, {2}(stock) AS units_on_hand
FROM products
{3} BY category
{4} SUM(stock) < {5}
{6} BY units_on_hand;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the sku tally",
        why: "SKU count per shelf is COUNT(*) — a row tally per bucket. The units column needs SUM; this one needs counting, and MAX or AVG would report the wrong kind of number.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the stock aggregate",
        why: "Total units on hand adds stock across the shelf's products — SUM(stock). COUNT would count products (2 or 3), not units (135+), and the 250 bar is on units.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "Per-shelf numbers need GROUP BY category — without buckets, SUM(stock) would collapse the whole warehouse into one grand total.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The under-250 test applies to a per-shelf sum — an aggregate — so it goes in HAVING; WHERE cannot see bucket totals.",
      },
      {
        answer: "250",
        kind: "number",
        label: "the staging threshold",
        why: "The staging rule is fewer than 250 units — strictly less, so a shelf holding exactly 250 would not be staged first.",
        noVerify: true,
      },
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the sequencing clause",
        why: "Thinnest first is sorting the surviving buckets by their unit total — ORDER BY units_on_hand; HAVING filters but never sequences.",
      },
    ],
    distractors: ["MAX", "AVG", "WHERE", "LIMIT", "ASC", "320"],
    walkthrough:
      "This is the full bucketing stack: bucket, two aggregates, filter on an aggregate, sort on an aggregate. GROUP BY category builds shelves; COUNT(*) tallies SKUs and SUM(stock) adds units; HAVING keeps shelves under 250 units; ORDER BY units_on_hand stages them thinnest first. Three shelves qualify: Wearables with 135 units across 2 SKUs, then Video and Fitness tied at 220 — Video on 2 SKUs, Fitness on 1. Everything else holds 315 or more. The 320 decoy is worth a beat: raise the bar to 320 and Audio (315 units) sneaks in, changing who gets walked Monday — the threshold is the whole answer here.",
  },
  {
    id: "cs-187",
    topic: "l8",
    universe: "funnel",
    title: "Months that hit the campaign bar",
    brief:
      "From: Growth marketing lead. Re: campaign retro.\n\nBefore I write the retro I want the demand shape: which calendar months actually carried campaign-grade volume. For each month bucket, count the orders and keep only the months that hit at least 8 — anything under that is baseline noise, not a campaign effect. Month label plus order count, oldest first.",
    ask: "Per month (YYYY-MM), the order count, keeping only months with at least 8 orders, oldest first.",
    template: `SELECT strftime({1}, created_at) AS month, COUNT(*) AS orders
FROM orders
GROUP BY month
{2} COUNT(*) >= {3}
ORDER BY month;`,
    slots: [
      {
        answer: "'%Y-%m'",
        kind: "keyword",
        label: "the month slicer",
        why: "The deliverable is month buckets, so the format string must extract year and month — '%Y-%m'. '%Y' alone would collapse whole years into one bucket; '%d' would bucket by day-of-month.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The 8-order bar tests a per-month count — an aggregate — so it lives in HAVING; WHERE runs before buckets exist and can't see counts.",
      },
      {
        answer: "8",
        kind: "number",
        label: "the campaign bar",
        why: "At least 8 is inclusive (>= 8), so a month with exactly 8 orders counts as campaign-grade — and several months sit exactly on that bar in the results.",
      },
    ],
    distractors: ["'%Y'", "'%d'", "WHERE", "ORDER", "10"],
    walkthrough:
      "The trick here is making the bucket: created_at is a full timestamp, so strftime('%Y-%m', created_at) slices it into year-month labels — that chip is the bucket definition, not decoration. GROUP BY month assembles the buckets, HAVING keeps the ones with at least 8 orders. Six months clear the bar: 2024-01 (8), 2024-02 (9), 2024-03 (8), 2024-05 (8), 2024-07 (8) and 2024-09 (9). Note how many sit exactly on 8 — with an exclusive > those months would vanish, so the inclusive >= matters. One caveat for the retro: busy months aren't automatically big months — July hit the volume bar but posted the lowest monthly revenue on file (1,193.86).",
  },
  {
    id: "cs-188",
    topic: "l8",
    universe: "supplier",
    title: "Suppliers carrying real catalog weight",
    brief:
      "From: Supply-chain lead. Re: dual-sourcing review.\n\nProcurement wants to consolidate vendors, so I need to know who actually carries weight in the catalog. For each supplier, count the products they supply and keep only the ones with 3 or more SKUs — anyone below that is a niche line we can dual-source casually. Supplier id plus product count, heaviest line first.",
    ask: "Each supplier with at least 3 products in the catalog, showing supplier id and product count, biggest count first.",
    template: `SELECT supplier_id, COUNT(*) AS lines
FROM products
{1} BY supplier_id
{2} COUNT(*) >= {3}
ORDER BY lines {4}, supplier_id;`,
    slots: [
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "One bucket per supplier requires GROUP BY supplier_id — it partitions the 16 products across the 6 vendors so counts compute per vendor.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The 3-SKU floor tests a per-supplier count — an aggregate — so HAVING; WHERE filters rows before buckets exist and cannot see counts.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the sourcing floor",
        why: "At least 3 is inclusive: suppliers sitting exactly on 3 make the list — and every surviving supplier does, which is why the 3s fill the result.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Heaviest first means descending on the count, with supplier id as the tiebreaker so the read stays stable.",
      },
    ],
    distractors: ["WHERE", "ORDER", "2", "SUM", "LIMIT"],
    walkthrough:
      "A sourcing-weight question is a per-supplier count with a floor. GROUP BY supplier_id builds six buckets; COUNT(*) sizes each; HAVING keeps the ones at 3 or more; ORDER BY lines DESC with supplier_id as tiebreaker stacks them heaviest first. Four suppliers qualify — ids 1 through 4, each carrying exactly 3 SKUs. Suppliers 5 and 6 hold 2 each and drop out; those are the niche lines procurement can treat casually. The 2 decoy is the one to respect: drop the floor to 2 and every supplier qualifies, which makes the review list useless — the threshold is the entire deliverable.",
  },
  {
    id: "cs-189",
    topic: "l8",
    universe: "expense",
    title: "Parcels with four-line packing loads",
    brief:
      "From: Ops finance, spend review.\n\nFulfillment cost per parcel jumps once packing goes past three lines — extra picks, extra check time. Before I re-price the handling fee I need the population: which order parcels actually contain exactly 4 line items. Parcel id plus its line count, so I can sample a few for time studies.",
    ask: "Each order parcel with exactly 4 line items, showing the order id and its line count.",
    template: `SELECT order_id, {1}(*) AS lines
FROM order_items
{2} BY order_id
{3} COUNT(*) = {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the line tally",
        why: "Line count per parcel is COUNT(*) — a tally of rows in each bucket; SUM(quantity) would add units ordered, which is a different metric entirely.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "Per-parcel anything requires GROUP BY order_id — the order_items table is line-level, so bucketing by order is what assembles parcels.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The exactly-4 test applies to a per-parcel count — an aggregate — so it belongs in HAVING; WHERE would error out on the aggregate.",
      },
      {
        answer: "4",
        kind: "number",
        label: "the cost-tier size",
        why: "Exactly 4 means equality, not a floor: a parcel with 5 lines would belong to a different cost tier. The 4s in the results are the surviving counts themselves.",
      },
    ],
    distractors: ["SUM", "AVG", "MAX", "WHERE", "5"],
    walkthrough:
      "This one buckets a detail table: order_items is line-level, so GROUP BY order_id is what assembles parcels, and COUNT(*) counts each parcel's lines. The filter is exact — HAVING COUNT(*) = 4 — because the handling-fee tier changes at four lines, not at four-or-more. Twenty-three parcels come back, each reading exactly 4 in the result — orders 1, 6, 11, 15, 16 and 17 among them. Watch the SUM decoy: SUM(*) doesn't even parse, but the tempting mental swap is SUM(quantity), which would count units in the box — a completely different cost driver from picks and check time.",
  },
  {
    id: "cs-190",
    topic: "l8",
    universe: "catalog",
    title: "Shelves where even the floor reads premium",
    brief:
      "From: Catalog content manager. Re: badge placement for the curated tag.\n\nWe're placing the 'curated' badge on shelves and it only fits where the whole shelf reads premium — not just the hero SKU. Rule: the cheapest product on the shelf must still price above 30. Show me each shelf's floor price and keep the shelves that clear the bar, best floor first.",
    ask: "Each category's minimum price, keeping only categories whose cheapest product costs more than 30, highest floor first.",
    template: `SELECT category, {1}(price) AS floor_price
FROM products
{2} BY category
{3} MIN(price) > {4}
ORDER BY floor_price DESC;`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor aggregate",
        why: "The floor of a shelf is MIN(price) — the cheapest SKU on it. MAX would report the ceiling and flatter every shelf; AVG would blur floor and ceiling together.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "Per-shelf floors require GROUP BY category — MIN(price) without buckets returns one cheapest product for the entire catalog.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The above-30 test applies to the per-shelf minimum — an aggregate — so it lives in HAVING; WHERE can't see bucket-level results.",
      },
      {
        answer: "30",
        kind: "number",
        label: "the badge floor",
        why: "The badge rule is strictly above 30, so a shelf whose cheapest SKU is exactly 30.00 would miss the tag.",
        noVerify: true,
      },
    ],
    distractors: ["MAX", "AVG", "ORDER", "WHERE", "40"],
    walkthrough:
      "The badge rule is about the weakest item on each shelf, which makes this a MIN question wearing a premium costume. GROUP BY category builds the shelves, MIN(price) finds each floor, HAVING keeps floors above 30, and ORDER BY floor_price DESC ranks the best foundations first. Five shelves clear the bar: Wearables (floor 79), Audio (59.99), Video (39.99), Electronics (34.5) and Fitness (32). Accessories (14.99) and Apparel (18.5) fail on a single cheap SKU each — exactly the knockoff risk the badge avoids. The 40 decoy shows how sharp the bar is: at 40, Electronics and Fitness drop out and only two shelves remain.",
  },
  {
    id: "cs-191",
    topic: "l8",
    universe: "month-close",
    title: "Monthly revenue buckets for the close deck",
    brief:
      "From: Financial Controller. Re: revenue trend slide.\n\nThe close deck's trend slide shows revenue per month, but I refuse to chart months that are just noise — anything under 2,000 gets a footnote instead of a bar. Bucket the orders by month, total each bucket, and show me only the months that carry at least 2,000, in calendar order.",
    ask: "Per month (YYYY-MM), total order value rounded to 2 decimals, keeping only months with at least 2000, calendar order.",
    template: `SELECT strftime({1}, created_at) AS month,
       ROUND({2}(total), 2) AS revenue
FROM orders
{3} BY month
{4} SUM(total) >= {5}
ORDER BY month;`,
    slots: [
      {
        answer: "'%Y-%m'",
        kind: "keyword",
        label: "the month slicer",
        why: "Month buckets come from slicing the timestamp — strftime('%Y-%m', created_at). The '%Y' decoy would merge the whole dataset into two year-buckets and wreck the trend slide.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the revenue aggregate",
        why: "Revenue per month is the sum of order totals in that bucket — AVG would report a mean ticket, not the revenue line the deck needs.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "Per-month totals require GROUP BY month — without it SUM(total) collapses all 14 months into one number.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The 2000 floor tests a per-month sum — an aggregate — so it goes in HAVING; WHERE filters rows before buckets exist.",
      },
      {
        answer: "2000",
        kind: "number",
        label: "the charting floor",
        why: "At least 2000 is inclusive: a month totaling exactly 2000.00 earns a bar, not a footnote.",
        noVerify: true,
      },
    ],
    distractors: ["COUNT", "AVG", "WHERE", "'%Y'", "1000"],
    walkthrough:
      "Same bucketing trick the funnel team uses, but the metric is money: strftime('%Y-%m') builds the month label, SUM(total) totals each bucket, HAVING keeps months at or above 2000. Eleven of the 14 months make the chart; the three footnotes are July 2024 (1,193.86), November 2024 (1,648.80) and January 2025 (1,669.50). The strongest bar is January 2024 at 3,731.97, with February close behind at 3,609.64. Worth saying out loud in the close: the >= matters — a month at exactly 2,000.00 would stay on the chart. And the '%Y' decoy would quietly turn fourteen months into two giant year-bars — a completely different slide.",
  },
  {
    id: "cs-192",
    topic: "l8",
    universe: "growth",
    title: "Regions with a real member base",
    brief:
      "From: Chief of Staff. Re: international expansion memo.\n\nThe expansion memo needs an honest picture of where members actually are, not where we wish they were. Bucket customers by region, count each bucket, and keep only regions with at least 5 members — those are the ones with a real base to localize for. Region name plus member count.",
    ask: "Each region with at least 5 customers, showing the region and its member count.",
    template: `SELECT region, COUNT(*) AS members
FROM customers
{1} BY {2}
{3} COUNT(*) >= {4};`,
    slots: [
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "Counting per region requires GROUP BY — it buckets the 16 customers so COUNT computes one total per region instead of a single 16.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the bucket key",
        why: "The bucket key is region — the expansion memo thinks in markets. GROUP BY city would shatter the base into 16 one-customer buckets; region is the granularity the memo needs.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The 5-member floor tests a per-region count — an aggregate — so it lives in HAVING; WHERE cannot see bucket totals.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the localization floor",
        why: "At least 5 is inclusive — a region with exactly 5 members qualifies, and one does in the results.",
      },
    ],
    distractors: ["city", "active", "'EU'", "WHERE", "10"],
    walkthrough:
      "A market-sizing question: GROUP BY region makes four buckets, COUNT(*) sizes them, HAVING keeps the ones with a real base. Two regions survive: EU with 8 members and APAC with 5 — exactly on the bar, which is why the inclusive >= matters. US (2) and LATAM (1) are not markets yet; they go in the watch paragraph, not the localization budget. The city decoy is the subtle one: it's a real column, and grouping by it executes — then every bucket holds one customer and the floor keeps nothing. Bucket-key choice is part of the answer, not a detail.",
  },
  {
    id: "cs-193",
    topic: "l8",
    universe: "refund-audit",
    title: "Stages where the average ticket clears 300",
    brief:
      "From: refunds@ internal ticket #4538.\n\nWe staff goodwill reviewers by stage, budgeted per ticket handled. The cheap stages can absorb goodwill inline; the expensive ones need the dedicated queue. Show each stage's order count and its average ticket to 2 decimals — and keep only the stages where the average is genuinely above 300.",
    ask: "Per fulfillment stage, the order count and average ticket value (2 decimals), keeping only stages averaging above 300.",
    template: `SELECT status, {2}(*) AS n, ROUND({1}(total), 2) AS avg_ticket
FROM orders
{3} BY status
{4} AVG(total) > 300
ORDER BY avg_ticket {5};`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the ticket aggregate",
        why: "The deliverable is an average ticket, so AVG(total) inside the rounding — SUM would report the stage's whole value and COUNT its order volume.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the ticket tally",
        why: "Reviewer budget scales with tickets handled, so the count column is COUNT(*); the average column already carries the money math.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "Per-stage numbers require GROUP BY status — it buckets the orders so both aggregates compute per stage.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The above-300 test applies to the per-stage average — an aggregate — so it goes in HAVING; WHERE would reject aggregates outright.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Most expensive stage first is descending on the average — that's the queue that needs staffing attention at the top of the list.",
      },
    ],
    distractors: ["SUM", "MAX", "ORDER", "WHERE", "ASC"],
    walkthrough:
      "Two aggregates per bucket and a filter on one of them: GROUP BY status builds the stages, COUNT(*) counts tickets, AVG(total) prices them, HAVING keeps averages above 300, ORDER BY avg_ticket DESC puts the expensive queue on top. Two stages qualify: pending, averaging 436.64 across 14 orders, and shipped at 399.89 across 30. Delivered misses by 56 cents — 299.44 — which stings, but the brief said genuinely above 300, and HAVING compares the true unrounded average before the display rounding ever happens. Cancelled averages 164.64 and stays inline. The SUM decoy passes the same two stages but swaps in bucket totals (11,996.72 and 6,113) — stage totals dressed up as tickets.",
  },
  {
    id: "cs-194",
    topic: "l8",
    universe: "pricing",
    title: "Shelves that can anchor the premium tier",
    brief:
      "From: Head of Product. Re: premium tier anchor.\n\nThe premium tier needs anchor shelves — categories where the ceiling is genuinely high, not shelves that merely average well. For each category show me its most expensive product, and keep only the shelves whose ceiling reaches 149.99 or more, highest ceiling first.",
    ask: "Each category's maximum price, keeping only categories whose priciest product is 149.99 or more, highest ceiling first.",
    template: `SELECT category, {1}(price) AS ceiling_price
FROM products
{2} BY category
{3} MAX(price) >= {4}
ORDER BY ceiling_price DESC;`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling aggregate",
        why: "An anchor shelf is defined by its ceiling — MAX(price) finds the priciest SKU per shelf; MIN would report the floor and AVG the middle, neither of which anchors a tier.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "Per-shelf ceilings require GROUP BY category — without buckets MAX(price) returns one price for the whole catalog.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The 149.99 bar tests a per-shelf maximum — an aggregate — so it lives in HAVING; WHERE runs before buckets exist.",
      },
      {
        answer: "149.99",
        kind: "number",
        label: "the anchor threshold",
        why: "At least means inclusive: a shelf whose ceiling is exactly 149.99 anchors the tier — and one does, which is why the figure shows up in the results.",
      },
    ],
    distractors: ["MIN", "AVG", "ORDER", "WHERE", "129", "199.99"],
    walkthrough:
      "Where the premium-by-average question looks at means, anchors are about ceilings: GROUP BY category builds the shelves, MAX(price) finds each top SKU, HAVING keeps ceilings at 149.99 or above. Two shelves anchor the tier: Wearables at 199.99 and Audio at exactly 149.99 — the inclusive >= is what keeps Audio on the list. Video misses at 129, Electronics at 89.99, and the rest never threaten the bar. The 129 decoy matters commercially: drop the bar to 129 and Video sneaks in as a third anchor, diluting the tier on its very first slide.",
  },
  {
    id: "cs-195",
    topic: "l8",
    universe: "fraud",
    title: "Booked value piled in a few accounts",
    brief:
      "From: Risk team, concentration review.\n\nSame anomaly family as the frequency sweep, but on money this time: booked value piling up in a handful of accounts is our exposure if one of them turns out to be synthetic. Total each account's order value and keep the accounts holding 4,000 or more, biggest exposure first, so review starts at the top of the pile.",
    ask: "Each account whose total booked value is at least 4000, showing customer id and that value rounded to 2 decimals, biggest first.",
    template: `SELECT customer_id, ROUND({1}(total), 2) AS booked
FROM orders
GROUP BY {2}
{3} SUM(total) >= {4}
ORDER BY booked {5};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the exposure aggregate",
        why: "Exposure is money, so SUM(total) adds each account's orders — COUNT would rank by frequency, which is the other fraud sweep, not this one.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the bucket key",
        why: "The bucket key is the account: GROUP BY customer_id assembles each customer's orders into one bucket. Grouping by anything else measures a different pile entirely.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The 4000 floor tests a per-account sum — an aggregate — so HAVING; WHERE cannot see bucket totals and would reject the query.",
      },
      {
        answer: "4000",
        kind: "number",
        label: "the exposure floor",
        why: "At least 4,000 is inclusive — an account worth exactly 4,000.00 belongs on the exposure list.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest exposure first is descending on booked value — the review queue should start at the top of the pile.",
      },
    ],
    distractors: ["COUNT", "AVG", "ORDER", "WHERE", "ASC", "6000"],
    walkthrough:
      "Money-weighted concentration: GROUP BY customer_id makes one bucket per account, SUM(total) totals each, HAVING keeps buckets at 4,000 or more, ORDER BY booked DESC stacks the pile. Three accounts survive: account 1 at 7,262.35 across 24 orders, account 5 at 6,640.56, account 7 at 4,574.23 — together 18,477.14, more than half of all booked value (34,833.28). Account 13 misses at 3,644.56; it goes on the watchlist, not the review queue. The 6000 decoy is the concentration test in miniature: raise the floor and only accounts 1 and 5 survive — which accounts you escalate depends entirely on where the bar sits.",
  },
];
