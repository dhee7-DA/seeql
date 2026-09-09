// Case batch B8a — topic l8 (GROUP BY & HAVING), ids cs-167…cs-181.
// Bucketing scenarios: one dimension per case, per-group aggregates, HAVING
// filters on the aggregate, ORDER BY as supporting cast. Figures audited
// against the live seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesB8a: CaseStudy[] = [
  {
    id: "cs-167",
    tier: "hard",
    topic: "l8",
    universe: "funnel",
    title: "Busiest months for campaign timing",
    brief:
      "From: Growth marketing lead. Re: always-on campaign calendar.\n\nI'm planning next year's always-on spend and I want it anchored in our own order history, not gut feel. Slice the order book into calendar months and tell me which months cleared eight orders — those are the windows where premium placements pay for themselves. Month label plus order count, please.",
    ask: "Each calendar month with 8 or more orders, showing the month and its order count.",
    template: `SELECT strftime({1}, created_at) AS month, {2}(*) AS n
FROM orders
GROUP BY month
{3} COUNT(*) >= {4}
ORDER BY month;`,
    slots: [
      {
        answer: "'%Y-%m'",
        kind: "keyword",
        label: "the month format",
        why: "strftime needs a format token: '%Y-%m' turns each timestamp into a Year-Month bucket like 2024-09. '%Y' alone would collapse everything into whole years and erase the monthly view the calendar needs.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the row counter",
        why: "The deliverable is how many orders landed in each month, so COUNT(*) tallies rows per bucket. SUM or AVG need a numeric column and would answer a completely different question.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The eight-order bar applies to a per-month count, which only exists after grouping. WHERE runs before buckets exist and can't judge an aggregate — filtering groups is exactly what HAVING is for.",
      },
      {
        answer: "8",
        kind: "number",
        label: "the monthly bar",
        why: "The brief sets the bar at eight orders — >= 8 keeps the months that hit it and everything quieter falls away.",
      },
    ],
    distractors: ["WHERE", "SUM", "'%Y'", "10"],
    walkthrough:
      "The ask is 'which months were busy', so the bucket is the calendar month — strftime('%Y-%m', created_at) renders each order's timestamp as a Year-Month label — and the metric is a per-bucket row count. The bar then judges the bucket, not any single order, so it lands in HAVING; a WHERE there errors out because aggregates can't be evaluated before groups exist. Six months clear the bar: 2024-01 with 8, 2024-02 with 9, 2024-03 with 8, 2024-05 with 8, 2024-07 with 8 and 2024-09 with 9 — never a ten-order month, so the '10' chip empties the calendar entirely. Watch the '%Y' decoy too: it silently re-buckets the whole history into two giant years (90 and 13 orders) and the monthly seasonality is gone.",
  },
  {
    id: "cs-168",
    tier: "hard",
    topic: "l8",
    universe: "supplier",
    title: "Suppliers carrying a full shelf",
    brief:
      "From: Supply-chain lead. Re: Q3 supplier scorecard.\n\nBefore the quarterly business reviews I want the dependency picture: which partners actually field a broad range for us. A partner with a full shelf of at least three SKUs gets a different conversation than one propping up two items. Supplier number plus SKU count for everyone who clears the bar.",
    ask: "Each supplier with 3 or more products, showing the supplier id and its SKU count.",
    template: `SELECT supplier_id, {1}(*) AS sku_count
FROM products
{2} BY supplier_id
{3} COUNT(*) >= {4}
ORDER BY supplier_id;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the SKU counter",
        why: "Range means number of products, so COUNT(*) per supplier bucket. SUM would add prices together and AVG would produce a mean nobody asked for.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "One output row per supplier requires GROUP BY supplier_id — it partitions the 16 products into six partner buckets so the count computes per partner.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the group filter",
        why: "The three-SKU bar judges a bucket total, and buckets don't exist when WHERE runs — aggregates in WHERE are a hard error. HAVING is the only clause that can filter on them.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the range bar",
        why: "The scorecard defines a full shelf as three or more SKUs — >= 3 keeps exactly those partners.",
      },
    ],
    distractors: ["WHERE", "ORDER", "SUM", "AVG", "2"],
    walkthrough:
      "Range per partner is a counting question, so the query is COUNT(*) with GROUP BY supplier_id, and the bar on the count goes in HAVING — putting it in WHERE dies with 'misuse of aggregate' because no buckets exist yet at filter time. Four suppliers clear the bar: suppliers 1, 2, 3 and 4, each carrying exactly 3 SKUs; suppliers 5 and 6 carry only 2 each and fall out. The '2' chip is the tempting near-miss — it widens the list to all six partners and the dependency story evaporates. And note what the ORDER chip would do: sort the rows, sure, but answer nothing — every partner stays on the list, unfiltered.",
  },
  {
    id: "cs-169",
    tier: "hard",
    topic: "l8",
    universe: "expense",
    title: "Accounts that keep reordering",
    brief:
      "From: Ops finance, spend review.\n\nWe're deciding which accounts justify a contract renegotiation this quarter, and frequency is the signal that matters: an account that has placed at least ten separate orders has earned a look. Account number plus order count, heaviest first, so the reviewer reads the biggest relationships before lunch.",
    ask: "Each account with 10 or more orders, showing the customer id and order count, biggest first.",
    template: `SELECT customer_id, {1}(*) AS order_count
FROM orders
{2} BY customer_id
{3} COUNT(*) >= {4}
ORDER BY order_count {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the order counter",
        why: "Frequency means rows per account, so COUNT(*) tallies each bucket. SUM(total) would add money instead of counting orders and AVG would dilute both.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "Per-account numbers require GROUP BY customer_id — it folds 103 orders into one bucket per account so the count is per relationship, not per transaction.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The ten-order bar is a condition on a bucket total. WHERE filters rows before grouping and cannot see counts — HAVING is the clause that judges buckets after they form.",
      },
      {
        answer: "10",
        kind: "number",
        label: "the frequency bar",
        why: "The review targets accounts with ten or more orders — the threshold lives in the comparison, and it never appears as a data figure in the output.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Heaviest first means descending: the 24-order account leads. ASC would bury the biggest relationship at the bottom — the exact opposite of the brief.",
      },
    ],
    distractors: ["SUM", "AVG", "WHERE", "ORDER", "ASC", "5"],
    walkthrough:
      "Frequency per account decomposes cleanly: bucket the orders by customer_id, count rows per bucket, keep buckets at ten or more, sort descending. The HAVING/WHERE split is the whole lesson here — the count only exists after grouping, so the bar must sit in HAVING; WHERE would reject it before any bucket forms. Four accounts survive: customer 1 with 24 orders, customer 5 with 17, customer 7 with 14 and customer 13 with 13. The '5' chip is the seductive one — it drags in customer 3's 5-order account and the renegotiation list suddenly includes a casual buyer. And ASC quietly inverts the reading order, putting the smallest relationship first.",
  },
  {
    id: "cs-170",
    tier: "hard",
    topic: "l8",
    universe: "catalog",
    title: "Shelves with depth and a cheap hook",
    brief:
      "From: Catalog content manager. Re: landing-page shelf rules.\n\nA shelf earns a landing-page block only if it has real depth — three or more products — and every block needs a 'starting at' price, which is the cheapest item on the shelf. Give me the qualifying shelves with their SKU count and floor price, cheapest hook first so the page leads with the friendliest number.",
    ask: "Each category with 3 or more products, showing its SKU count and cheapest price, cheapest entry first.",
    template: `SELECT category, {1}(*) AS sku_count, MIN(price) AS floor_price
FROM products
{2} BY category
{3} COUNT(*) >= {4}
ORDER BY floor_price {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the SKU counter",
        why: "Depth is a row count per shelf, so COUNT(*). The MIN(price) column beside it is already fixed — substituting another aggregate here breaks the tally syntax outright.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "Per-shelf numbers require GROUP BY category — it gathers the 16 products into shelf buckets so count and floor price compute per shelf.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the depth filter",
        why: "The three-SKU rule judges a bucket total that only exists after grouping; WHERE can't evaluate a COUNT and errors. Filtering groups is HAVING's whole job.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the depth bar",
        why: "A shelf needs three or more products to earn the block — the surviving buckets all show a count of 3.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "Cheapest hook first means ascending floor price — 14.99 leads the page. DESC would put the most expensive entry point on top, the opposite of the rule.",
      },
    ],
    distractors: ["MAX", "MIN", "WHERE", "ORDER", "2", "DESC"],
    walkthrough:
      "Two metrics per bucket, one filter on a bucket: COUNT(*) for depth, MIN(price) for the entry price, HAVING for the three-SKU rule. Note the filter is on the count, not the price — 'cheap shelf' is not the requirement, 'deep shelf' is. Three shelves qualify and sort cheapest-hook-first: Accessories with 3 SKUs at 14.99, Electronics with 3 at 34.5, Audio with 3 at 59.99. The '2' chip is the classic near-miss: it lets every two-product shelf onto the page and the block fills with thin categories. WHERE dies immediately — you can't judge a COUNT before the buckets exist — and DESC flips the page so the priciest hook leads.",
  },
  {
    id: "cs-171",
    tier: "hard",
    topic: "l8",
    universe: "month-close",
    title: "Booked value by fulfillment status",
    brief:
      "From: Financial Controller. Re: close review, revenue quality.\n\nBefore I sign the revenue number I want it sliced by fulfillment status — delivered, shipped, pending, cancelled each carry different risk. Show me the value per bucket but keep only the material ones: anything under 6000 goes to a footnote, not the deck. Status plus value, biggest first.",
    ask: "Each order status with total value of 6000 or more, showing the status and its revenue, biggest first.",
    template: `SELECT status, ROUND({1}(total), 2) AS revenue
FROM orders
{2} BY status
{3} SUM(total) >= {4}
ORDER BY revenue DESC;`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the value aggregate",
        why: "Value per bucket means the totals added up — SUM(total) inside the rounding. COUNT would put row counts where money belongs and MAX would show only the single biggest order.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "One row per fulfillment status requires GROUP BY status — it partitions the 103 orders into four buckets so the sum computes per bucket.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the materiality filter",
        why: "The 6000 bar judges a bucket sum that only exists after grouping — WHERE cannot evaluate SUM(total) and fails outright. Filtering groups is precisely what HAVING exists for.",
      },
      {
        answer: "6000",
        kind: "number",
        label: "the materiality bar",
        why: "The controller's line for deck-worthy buckets — a threshold figure that steers the comparison and never appears in the result cells themselves.",
        noVerify: true,
      },
    ],
    distractors: ["COUNT", "AVG", "MAX", "WHERE", "ORDER", "7000"],
    walkthrough:
      "Revenue quality per bucket: GROUP BY status builds the four fulfillment buckets, SUM(total) values each, and HAVING keeps only buckets worth 6000 or more — WHERE would die trying to judge a SUM before any bucket exists. Three buckets survive: delivered at 15,571.07, shipped at 11,996.72 and pending at 6,113.00; cancelled misses at 1,152.49 and lands in the footnote exactly as intended. The '7000' chip quietly redefines materiality and pushes pending out of the deck. And the COUNT decoy is nastier than it looks — the query still runs, but the deck suddenly claims delivered is worth '52'.",
  },
  {
    id: "cs-172",
    tier: "hard",
    topic: "l8",
    universe: "growth",
    title: "Regions with an active base",
    brief:
      "From: Chief of Staff. Re: board deck, go-to-market map.\n\nThe regional slide should only show markets where we actually have a living book: at least four currently active accounts. Dormant logos don't count as presence. Region plus active-account count for the regions that clear the bar — and be careful to count only active rows before any bucketing happens.",
    ask: "Each region with 4 or more active customers, showing the region and its active-account count.",
    template: `SELECT region, COUNT(*) AS active_accounts
FROM customers
{1} active = 1
{2} BY region
{3} COUNT(*) >= 4;`,
    slots: [
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row filter",
        why: "active = 1 is a fact about each individual customer row, so it filters rows before grouping — that's WHERE's job. Dormant accounts must be excluded before buckets form, not after.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "Per-region counts require GROUP BY region — it folds the surviving customers into regional buckets so the count computes per market.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The four-account bar judges a bucket total, and buckets only exist after grouping — judging COUNT in WHERE is an error. HAVING is the clause that filters groups.",
      },
    ],
    distractors: ["ORDER", "SUM", "AVG", "LIMIT"],
    walkthrough:
      "This is the case where both filters appear, and the split is the entire lesson: 'active = 1' describes a single customer row, so it goes in WHERE and runs first; 'at least four' describes a bucket, so it goes in HAVING and runs after grouping. WHERE keeps the 14 active customers and drops the 2 dormant ones; the buckets then come out APAC with 4 and EU with 7 — US with 2 and LATAM with 1 miss the bar and stay off the slide. Swap the filter clauses and the query errors either way: WHERE can't see a COUNT, and HAVING can't see row-level flags before grouping. The ORDER chip merely sorts — every region, filtered or not, would still land on the slide.",
  },
  {
    id: "cs-173",
    tier: "hard",
    topic: "l8",
    universe: "refund-audit",
    title: "Small status queues for manual review",
    brief:
      "From: refunds@ internal ticket #4633.\n\nStaffing plan for the review pod. Policy: any status queue small enough — fewer than 20 open orders — gets cleared manually this week; bigger queues go to the automated flow. Tell me which statuses qualify and how big each queue is, biggest queue first so the pod starts where the work is.",
    ask: "Each order status with fewer than 20 orders, showing the status and its queue size, biggest first.",
    template: `SELECT status, {1}(*) AS n
FROM orders
{2} BY status
{3} COUNT(*) < {4}
ORDER BY n {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the queue counter",
        why: "Queue size is rows per status, so COUNT(*). SUM or AVG would need a numeric column and measure the wrong thing entirely.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "One queue per status requires GROUP BY status — it gathers all 103 orders into four status buckets so each can be sized.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The under-20 rule judges a bucket count that only exists after grouping — WHERE would reject the aggregate and error out. Filtering buckets is HAVING's role.",
      },
      {
        answer: "20",
        kind: "number",
        label: "the queue cap",
        why: "The ticket sets the manual-review ceiling at twenty — a policy threshold that never appears as a figure in the result itself.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest queue first means descending — the pod starts where the work is. ASC would serve the tiniest queue first and stall the day.",
      },
    ],
    distractors: ["SUM", "AVG", "WHERE", "ORDER", "ASC", "10"],
    walkthrough:
      "Sizing the queues is COUNT(*) per status bucket, and the '< 20' rule judges the bucket, so it lives in HAVING — WHERE can't evaluate a COUNT before buckets exist. Two queues qualify, biggest first: pending with 14 and cancelled with 7; delivered (52) and shipped (30) are far over the cap and route to automation. The '10' chip halves the cap and leaves only the cancelled queue — the pod plan loses half its week. ASC is the quiet sabotage: it sorts smallest-first, so the pod burns its best hours on a 7-order queue while the 14-order one waits.",
  },
  {
    id: "cs-174",
    tier: "hard",
    topic: "l8",
    universe: "pricing",
    title: "Shelves with a sub-20 entry point",
    brief:
      "From: Head of Product. Re: pricing review, entry-story shelves.\n\nThe 'easy way in' campaign needs shelves where the door is genuinely open — a cheapest item under 20. Those shelves get the entry-level creative; everything else keeps its standard treatment. Category name plus that cheapest price, so the campaign copy can quote the real number.",
    ask: "Each category whose cheapest product costs less than 20, showing the category and its entry price.",
    template: `SELECT category, ROUND({1}(price), 2) AS entry_price
FROM products
{2} BY category
{3} MIN(price) < {4}
ORDER BY entry_price;`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor aggregate",
        why: "The entry price is the cheapest item per shelf, so MIN(price). AVG would quote the shelf average as the door price and MAX would advertise the most expensive item as the way in.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "One entry price per shelf requires GROUP BY category — it partitions the catalog into shelf buckets so MIN computes per shelf.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the group filter",
        why: "The under-20 rule judges a per-shelf MIN, an aggregate that doesn't exist until after grouping — WHERE can't evaluate it and errors. Filtering buckets is what HAVING is for.",
      },
      {
        answer: "20",
        kind: "number",
        label: "the door-price cap",
        why: "The campaign defines an open door as a cheapest item below 20 — the comparison threshold, not a figure that shows up in the output cells.",
        noVerify: true,
      },
    ],
    distractors: ["AVG", "MAX", "COUNT", "WHERE", "40"],
    walkthrough:
      "Per-shelf floor, filtered on the floor: GROUP BY category builds the shelves, MIN(price) reads each shelf's cheapest item, HAVING keeps shelves under 20. Two shelves make the campaign: Accessories at 14.99 and Apparel at 18.5 — Fitness just misses at 32 and keeps standard treatment. The '40' chip is the dangerous one: it pulls Fitness in and the creative promises an open door onto a 32-yen mat. The AVG decoy still executes, which is what makes it nasty — it would report shelf averages like 27.49 as 'entry prices' and quietly misquote every ad.",
  },
  {
    id: "cs-175",
    tier: "hard",
    topic: "l8",
    universe: "fraud",
    title: "Status buckets hiding jumbo tickets",
    brief:
      "From: Risk team, spot-check rotation.\n\nMonthly sweep, new angle: instead of chasing single orders, tell me which fulfillment stages are carrying jumbo exposure — any stage whose single largest order tops 800 gets eyeballed this cycle. Status plus that biggest ticket, so the reviewers know the size of what they're opening.",
    ask: "Each order status whose largest single order exceeds 800, showing the status and that biggest total.",
    template: `SELECT status, ROUND({1}(total), 2) AS biggest_ticket
FROM orders
{2} BY status
{3} MAX(total) > {4}
ORDER BY biggest_ticket DESC;`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling aggregate",
        why: "The exposure is the single largest order per bucket, so MAX(total). MIN would report the smallest order as the risk and AVG would blur the jumbo ticket into the mean.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "One ceiling per fulfillment stage requires GROUP BY status — it partitions the orders into four buckets so MAX computes per stage.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the exposure filter",
        why: "The over-800 rule judges a per-bucket MAX, which only exists after grouping — WHERE cannot evaluate it and fails. Filtering buckets is HAVING's job.",
      },
      {
        answer: "800",
        kind: "number",
        label: "the jumbo bar",
        why: "The sweep defines jumbo as a biggest ticket above 800 — a threshold that shapes which buckets survive and never appears as a result cell.",
        noVerify: true,
      },
    ],
    distractors: ["MIN", "AVG", "SUM", "WHERE", "900"],
    walkthrough:
      "Exposure per bucket is MAX(total) after GROUP BY status, and the 800 bar judges that per-bucket ceiling, so it sits in HAVING — WHERE would die trying to evaluate MAX before any bucket forms. Two stages carry jumbo exposure: pending with 1088.44 and shipped with 845.92; delivered tops out at 752.96 and cancelled at 397.99, both under the bar. The '900' chip quietly narrows the sweep to pending alone and shipped's 845.92 ticket escapes review. The MIN decoy runs fine, which is the trap — it would hand the reviewers each stage's smallest order, the exact opposite of exposure.",
  },
  {
    id: "cs-176",
    tier: "hard",
    topic: "l8",
    universe: "inventory",
    title: "Heavy shelves for the cycle count",
    brief:
      "From: Warehouse ops manager. Re: quarterly cycle count.\n\nThe count crew can't walk every aisle, so we prioritize by weight: any category holding more than 400 units on shelf gets counted this cycle, the rest roll to next quarter. Category plus its total units on hand, so the crew lead knows the size of each stop.",
    ask: "Each category holding more than 400 units in stock, showing the category and its total units.",
    template: `SELECT category, {1}(stock) AS units_on_hand
FROM products
{2} BY category
{3} SUM(stock) > {4};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the units aggregate",
        why: "Units on hand per shelf means every stock figure added together — SUM(stock). COUNT would tally products, not units, and MAX would report only the fullest single bin.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "One total per shelf requires GROUP BY category — it gathers the catalog into shelf buckets so stock adds up per shelf rather than across the whole warehouse.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the weight filter",
        why: "The over-400 rule judges a bucket sum that only exists after grouping — WHERE can't evaluate SUM(stock) and errors. Filtering groups is exactly what HAVING does.",
      },
      {
        answer: "400",
        kind: "number",
        label: "the weight bar",
        why: "The cycle-count policy draws the line at 400 units — a threshold figure that decides which shelves get walked and never appears in the result cells.",
        noVerify: true,
      },
    ],
    distractors: ["COUNT", "AVG", "MAX", "WHERE", "300"],
    walkthrough:
      "Weight per shelf is SUM(stock) after GROUP BY category, and the 400-unit bar judges the bucket sum, so it belongs in HAVING — WHERE would reject the aggregate outright. Three shelves clear the bar: Accessories with 940 units, Apparel with 510 and Electronics with 505; Audio misses by a whisker at 315, so the '300' chip is the costly one — it adds Audio's aisle to the walk and the crew loses an afternoon. The COUNT decoy still executes but reports SKU counts (3s and 2s) as 'units on hand', which would make the heaviest shelf in the building look nearly empty.",
  },
  {
    id: "cs-177",
    tier: "hard",
    topic: "l8",
    universe: "funnel",
    title: "Three-thousand months for the retro",
    brief:
      "From: Growth marketing lead. Re: year-in-review retro.\n\nFor the annual retro I need the standout months: any calendar month whose booked revenue topped 3000. Add the order count next to revenue so we can see whether the big months came from volume or from basket size. Month, count, revenue — biggest revenue first.",
    ask: "Each calendar month with revenue above 3000, showing the month, order count and revenue, biggest revenue first.",
    template: `SELECT strftime('%Y-%m', created_at) AS month, {1}(*) AS orders, ROUND(SUM(total), 2) AS revenue
FROM orders
{2} BY month
{3} SUM(total) > {4}
ORDER BY revenue {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the volume counter",
        why: "The context column is orders per month, so COUNT(*). The revenue column next to it is already a fixed SUM — swapping another aggregate here breaks the tally outright.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "Per-month figures require GROUP BY month — it folds the order history into calendar buckets so count and revenue compute per month.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the revenue filter",
        why: "The 3000 bar judges a per-bucket SUM that only exists after grouping — WHERE cannot evaluate SUM(total) and errors. Filtering buckets is HAVING's purpose.",
      },
      {
        answer: "3000",
        kind: "number",
        label: "the standout bar",
        why: "The retro defines standout as revenue above 3000 — the comparison threshold that decides which months make the slide, never a figure in the output itself.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest revenue first means descending — the hero month leads the slide. ASC would open with the weakest of the three and bury the story.",
      },
    ],
    distractors: ["AVG", "MAX", "WHERE", "2000", "ASC"],
    walkthrough:
      "Two metrics per bucket, one bucket-level filter: GROUP BY month builds the calendar, COUNT(*) gives volume, SUM(total) gives revenue, and the 3000 bar sits in HAVING because it judges a bucket sum WHERE can't see. Three months make the slide, biggest first: 2024-01 with 8 orders and 3731.97, 2024-02 with 9 and 3609.64, 2024-09 with 9 and 3116.04. Note what the pair of columns reveals — 2024-01 wins on basket size, not volume, since February matched its nine orders for less money. The '2000' chip floods the slide with ten months and kills the 'standout' framing, and ASC opens with the smallest of the three.",
  },
  {
    id: "cs-178",
    tier: "hard",
    topic: "l8",
    universe: "supplier",
    title: "Who fields multiple premium SKUs",
    brief:
      "From: Supply-chain lead. Re: premium sourcing review.\n\nWe're consolidating premium supply — a partner only matters to this program if they can field at least two SKUs priced over 50. Everyone else is a single-item relationship and stays out of the consolidation talks. Supplier number plus how many of their products clear the 50 line.",
    ask: "Each supplier with 2 or more products priced over 50, showing the supplier id and that count.",
    template: `SELECT supplier_id, {1}(*) AS premium_skus
FROM products
{2} price > {3}
{4} BY supplier_id
{5} COUNT(*) >= 2;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the premium counter",
        why: "The deliverable is how many premium products each partner carries, so COUNT(*) over the surviving rows. SUM or AVG would try to compute on the '*' and fail.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the price gate",
        why: "price > 50 is a fact about each individual product row, so it filters rows before any bucketing — that's WHERE's job. Dropping it counts cheap SKUs as premium.",
      },
      {
        answer: "50",
        kind: "number",
        label: "the premium line",
        why: "The program defines premium as priced over 50 — the row-level gate's threshold, which never appears as a figure in the output cells.",
        noVerify: true,
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "Per-partner counts require GROUP BY supplier_id — it buckets the premium rows so each partner's tally is its own.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the partner filter",
        why: "The two-SKU bar judges a bucket count that only exists after grouping — WHERE would reject the aggregate with an error. Filtering buckets is HAVING's role.",
      },
    ],
    distractors: ["SUM", "ORDER", "40", "100", "AVG"],
    walkthrough:
      "This one runs both filters in the right order: WHERE price > 50 first drops every non-premium row (ten of the sixteen), then GROUP BY supplier_id buckets what's left, then HAVING keeps partners with two or more premium SKUs. Two suppliers make the program: supplier 1 with 3 premium SKUs and supplier 6 with 2 — supplier 5's single 119 mic, supplier 4's 149.99 headset and supplier 3's 65 jersey are real premium items but one-item relationships. The '40' chip is the sneaky one: it lets mid-shelf items through the gate and suddenly four partners 'qualify'. And '100' narrows the gate so hard only supplier 1 survives, with a smaller count of 2.",
  },
  {
    id: "cs-179",
    tier: "hard",
    topic: "l8",
    universe: "expense",
    title: "Accounts over 1500 in spend",
    brief:
      "From: Ops finance, spend review.\n\nThe Q3 vendor-style review needs the heavyweight accounts: anyone whose cumulative spend crosses 1500 goes on the relationship review calendar. Order count rides along because frequency explains the number. Account, order count, total spend — nothing below the line, please.",
    ask: "Each account whose total spend reaches 1500, showing the customer id, order count and spend.",
    template: `SELECT customer_id, {1}(*) AS order_count, ROUND({2}(total), 2) AS spend
FROM orders
{3} BY customer_id
{4} SUM(total) >= {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the frequency counter",
        why: "The context column is orders per account, so COUNT(*). SUM would try to add up the '*' and error; the spend column beside it is already fixed.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the spend aggregate",
        why: "Cumulative spend means every total added per account — SUM(total) inside the rounding. AVG would report the mean order as the account's spend and misstate every relationship.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "Per-account figures require GROUP BY customer_id — it folds 103 orders into one bucket per account so count and spend compute per relationship.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the spend filter",
        why: "The 1500 line judges a bucket sum that only exists after grouping — WHERE cannot evaluate SUM(total) and fails. Filtering buckets is HAVING's job.",
      },
      {
        answer: "1500",
        kind: "number",
        label: "the spend line",
        why: "The review calendar starts at 1500 in cumulative spend — a threshold that steers which buckets survive and never appears in the result cells.",
        noVerify: true,
      },
    ],
    distractors: ["AVG", "MAX", "WHERE", "ORDER", "2000", "2500"],
    walkthrough:
      "Spend per account: GROUP BY customer_id builds the buckets, SUM(total) values them, COUNT(*) explains them, and the 1500 line sits in HAVING because it judges a bucket sum. Six accounts cross the line: customer 1 at 7262.35 across 24 orders, customer 5 at 6640.56 across 17, customer 7 at 4574.23 across 14, customer 13 at 3644.56 across 13, customer 3 at 2667.93 across just 5, and customer 16 at 1686.17 across 4. That last pair is the interesting read — low frequency, fat baskets. The '2000' chip drops customer 16 from the calendar and '2500' drops 16 and 3, so the threshold chips quietly shrink the review list. The AVG decoy still runs but reports per-order means as 'spend'.",
  },
  {
    id: "cs-180",
    tier: "hard",
    topic: "l8",
    universe: "catalog",
    title: "Shelves whose ceiling passes 120",
    brief:
      "From: Catalog content manager. Re: premium signage refresh.\n\nThe premium-endpage only features shelves that can carry it: any shelf holding at least one item over 120 gets signage, and the sign quotes that priciest item. Category plus the ceiling price, most impressive first, so the page leads with the flagship.",
    ask: "Each category whose most expensive product costs more than 120, showing the category and that ceiling price, biggest first.",
    template: `SELECT category, ROUND({1}(price), 2) AS ceiling
FROM products
{2} BY category
{3} MAX(price) > {4}
ORDER BY ceiling DESC;`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling aggregate",
        why: "The sign quotes the priciest item per shelf, so MAX(price). MIN would quote the cheapest as the flagship and AVG would water the ceiling into a mean.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "One ceiling per shelf requires GROUP BY category — it partitions the catalog into shelf buckets so MAX computes per shelf.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the signage filter",
        why: "The over-120 rule judges a per-shelf MAX, an aggregate that doesn't exist until after grouping — WHERE can't evaluate it and errors. Filtering buckets is what HAVING is for.",
      },
      {
        answer: "120",
        kind: "number",
        label: "the signage bar",
        why: "The endpage requires a flagship over 120 — the threshold that decides which shelves qualify and never appears as a result cell.",
        noVerify: true,
      },
    ],
    distractors: ["MIN", "AVG", "SUM", "WHERE", "150"],
    walkthrough:
      "Ceiling per shelf, filtered on the ceiling: GROUP BY category builds the shelves, MAX(price) reads each shelf's priciest item, HAVING keeps shelves over 120. Three shelves earn signage, flagship first: Wearables at 199.99, Audio at 149.99 and Video at 129 — Video's 4K Webcam just clears the bar, which is exactly the kind of edge the '150' chip would erase, leaving Wearables alone on the endpage. The MIN decoy still executes, which is what makes it dangerous: it would report 59.99 as Wearables' 'ceiling' and quote the cheapest item as the flagship.",
  },
  {
    id: "cs-181",
    tier: "hard",
    topic: "l8",
    universe: "month-close",
    title: "Average ticket by fulfillment status",
    brief:
      "From: Financial Controller. Re: close addendum, basket quality.\n\nOne more cut for the close file: the average order value per fulfillment stage, but only for stages with real volume — at least 14 orders — so a thin bucket can't set the narrative. Stage, order count, average ticket, busiest stage first.",
    ask: "Each order status with 14 or more orders, showing the status, its order count and average ticket, busiest first.",
    template: `SELECT status, {1}(*) AS order_count, ROUND({2}(total), 2) AS avg_ticket
FROM orders
{3} BY status
{4} COUNT(*) >= {5}
ORDER BY order_count DESC;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the volume counter",
        why: "Stage volume is rows per bucket, so COUNT(*). The average column beside it is a fixed ROUND(AVG(...)) — putting SUM here breaks the tally syntax outright.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean aggregate",
        why: "Average ticket is the mean of the totals per bucket — AVG(total) inside the rounding. SUM would report the stage's whole revenue as an 'average' and inflate every cell.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "Per-stage figures require GROUP BY status — it partitions the 103 orders into four buckets so count and mean compute per stage.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the volume filter",
        why: "The 14-order bar judges a bucket count that only exists after grouping — WHERE would reject the aggregate and error. Filtering buckets is HAVING's job.",
      },
      {
        answer: "14",
        kind: "number",
        label: "the volume bar",
        why: "The controller demands at least 14 orders for a stage to count — and the surviving buckets literally show that figure among their counts.",
      },
    ],
    distractors: ["SUM", "MIN", "WHERE", "ORDER", "7"],
    walkthrough:
      "Two aggregates per bucket with the filter on volume: GROUP BY status builds the four stages, COUNT(*) sizes them, AVG(total) prices the average ticket, and the 14-order bar sits in HAVING because it judges a bucket, not a row. Three stages qualify, busiest first: delivered with 52 orders averaging 299.44, shipped with 30 averaging 399.89, pending with 14 averaging 436.64 — cancelled misses the bar at 7 and stays out of the narrative. Worth flagging to the controller: pending, the least certain money, carries the heaviest average ticket. The '7' chip re-admits cancelled and dilutes the story; the SUM decoy still runs but labels stage revenue as an 'average ticket'.",
  },
];
