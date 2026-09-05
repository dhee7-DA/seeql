// Batch B6a — lesson 6 (DISTINCT): deduped lists and counts of different things.
// Figures audited against the live seed db via scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesB6a: CaseStudy[] = [
  {
    id: "cs-116",
    topic: "l6",
    universe: "supplier",
    title: "Counting the vendors behind the catalog",
    brief:
      "From: Supply-chain lead. Re: vendor consolidation pre-read.\n\nBefore Friday's consolidation workshop I need the raw footprint: how many different suppliers does the catalog actually draw on? Procurement thinks it's a handful, but nobody has counted in over a year, and the last estimate double-counted partners that supply two product lines. One number for the deck header, please.",
    ask: "One number: how many different suppliers appear on the product catalog.",
    template: `SELECT COUNT({1} {2}) AS vendor_count
FROM {3};`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the dedup keyword",
        why: "Sixteen catalog rows repeat the same suppliers, so the count must dedupe first: COUNT(DISTINCT ...). Plain COUNT(ALL ...) skips the dedupe and answers 16 — one per product row, not 6 vendors.",
      },
      {
        answer: "supplier_id",
        kind: "keyword",
        label: "the supplier column",
        why: "Vendor identity lives in products.supplier_id. category would count shelves (7) and customer_id isn't on this table at all.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the source table",
        why: "The catalog stamps a supplier on every product row, so products is the source; order_items carries no supplier_id and customers is the shopper roster.",
      },
    ],
    distractors: ["ALL", "category", "customer_id", "order_items"],
    walkthrough:
      "Procurement asked 'how many vendors?' and the naive answer is 16 — one supplier stamp per product row. The catalog repeats the same partners across its rows, so the query has to dedupe inside the count: COUNT(DISTINCT supplier_id). That reads 16 rows and collapses them to 6 vendors — and since the supplier file also holds 6 accounts, every vendor on file is actually supplying something. Watch the ALL trap: COUNT(ALL supplier_id) skips the dedupe and reports 16, one per product. Six vendors for sixteen products is a consolidation story in itself — the workshop will be a small room.",
  },
  {
    id: "cs-117",
    topic: "l6",
    universe: "expense",
    title: "Products behind the premium ledger lines",
    brief:
      "From: Ops finance, spend owner. Re: pre-review ledger sweep.\n\nQuarterly spend review is coming and I'm sizing the negotiation shortlist. The purchase ledger stamps its own price on every line, and I only care about the premium slice — lines billed above 100. How many different products sit behind those premium lines? If it's a handful, we negotiate them as a block.",
    ask: "Count of different products with at least one ledger line priced over 100.",
    template: `SELECT {1}(DISTINCT {2}) AS premium_products
FROM order_items
WHERE {3} {4} {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tally aggregate",
        why: "The deliverable is a headcount of different products, so COUNT does the tallying. SUM would add the product ids together (29) and report a number no buyer can use.",
      },
      {
        answer: "product_id",
        kind: "keyword",
        label: "the product column",
        why: "Each ledger line names the product it billed, so product_id is the dedupe key. customer_id doesn't exist on order_items, and quantity would count batch sizes (just 1, 2, 3) instead of products.",
      },
      {
        answer: "unit_price",
        kind: "keyword",
        label: "the line price column",
        why: "The ledger prices each line in unit_price — there is no plain price column here. quantity > 100 matches nothing because lines move at most 3 units.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the strict comparison",
        why: "'Above 100' means strictly greater: unit_price > 100. Flipping to < answers the cheap half of the ledger — 12 different products — the opposite slice of the spend.",
      },
      {
        answer: "100",
        kind: "number",
        label: "the premium threshold",
        why: "The audit draws the premium bar at 100 per line. Dropping it to 50 widens the net to 9 different products and blurs the premium story the CFO asked for.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "quantity", "price", "<", "50"],
    walkthrough:
      "The brief says 'priced over 100' and 'different products' — two signals. First the slice: the ledger stamps its own price per line (unit_price, which drifts from the list price), so WHERE unit_price > 100 keeps the premium lines — 68 of the 251. Then the dedupe: those 68 lines belong to just 4 different products, so COUNT(DISTINCT product_id), not a row count. The four behind the premium lines are ids 4, 5, 7 and 13 — the headset, the desktop mic, the webcam and the smart watch. If the count had come back near 16 I'd suspect the bar was set too low; four SKUs is a negotiation shortlist, exactly what the spend review wants.",
  },
  {
    id: "cs-118",
    topic: "l6",
    universe: "catalog",
    title: "The shelf list for the navigation rebuild",
    brief:
      "From: Catalog content manager. Re: navigation rebuild.\n\nThe storefront navigation is being rebuilt and design needs the shelf list straight from the data, not from the old wiki page — last time the export shipped repeats and we looked sloppy in the review. Send every category we currently stock, one per row, A to Z. If the count disagrees with the wiki, the data wins.",
    ask: "The full list of product categories we stock, deduplicated, sorted A to Z.",
    template: `SELECT {1} category
FROM {2}
ORDER BY category {3};`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the dedup keyword",
        why: "Sixteen product rows share seven category values, so a bare list would ship repeats all over again. DISTINCT collapses the repeats so each shelf appears exactly once.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the source table",
        why: "Shelf names live on the products catalog rows; order_items is the sales ledger and carries no category field at all.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "A to Z for a navigation menu is ascending — SQLite's default, but spelling ASC keeps the intent explicit. DESC would hand design a reversed menu starting at Wearables.",
      },
    ],
    distractors: ["ALL", "order_items", "DESC"],
    walkthrough:
      "Design needs a clean shelf list, and the honest list comes from the data, not the wiki. The trap is repetition: sixteen product rows share only seven category values, so a plain column list would ship duplicates for the second time this year. DISTINCT collapses them; ORDER BY category ASC alphabetizes for the menu build. The seven that come back: Accessories, Apparel, Audio, Electronics, Fitness, Video, Wearables. Count them against the old wiki page — if the wiki shows eight, someone invented a shelf. Worth noting: ASC is the default direction, but writing it out makes the intent explicit for whoever edits this query next.",
  },
  {
    id: "cs-119",
    topic: "l6",
    universe: "month-close",
    title: "How many months the order ledger spans",
    brief:
      "From: Financial Controller. Re: February close file.\n\nThe auditors flagged last year that we presented a partial period as a full year, so this time I want the ledger's true span on record. Count the different calendar months that actually have orders booked — from the first booking to the last. One number for the close file, no commentary.",
    ask: "One number: how many different calendar months have orders in the ledger.",
    template: `SELECT {1}(DISTINCT strftime({2}, created_at)) AS ledger_months
FROM {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tally aggregate",
        why: "Counting distinct month buckets is still a count, so COUNT wraps the expression. SUM would try to add date strings together and land on 0.",
      },
      {
        answer: "'%Y-%m'",
        kind: "keyword",
        label: "the month format",
        why: "The '%Y-%m' pattern renders each timestamp as year-month (2024-07), so all orders in a month share one bucket. '%Y' alone buckets by year and would report just 2.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Bookings live on orders. Running the same expression over customers would span that roster's 9 signup months, not the order ledger's 14.",
      },
    ],
    distractors: ["SUM", "'%Y'", "customers"],
    walkthrough:
      "The auditors want the ledger's true span in calendar months. created_at is a full timestamp, so I bucket it with strftime('%Y-%m') — that renders 2024-07-19 as 2024-07, letting every order in a month share one value — then COUNT(DISTINCT ...) over those buckets. The answer is 14: the ledger runs 2024-01 through 2025-02, a full year plus the first two months of this one. Getting the format string wrong is the classic slip — '%Y' alone buckets by year and reports 2, understating the span by a factor of seven. The close file gets 14, no commentary, as requested.",
  },
  {
    id: "cs-120",
    topic: "l6",
    universe: "growth",
    title: "The EU city map, deduplicated",
    brief:
      "From: Chief of Staff. Re: EU expansion memo.\n\nI'm drafting the expansion memo and slide 2 needs the honest map: every city in the EU region where a customer actually lives, alphabetized, each city once — the last draft double-counted a market and the CEO noticed in the room. This list feeds the footprint visual, so clean rows only.",
    ask: "Alphabetized list of EU-region cities where customers live, without repeats.",
    template: `SELECT {1} city
FROM {2}
WHERE {3} = {4}
ORDER BY city;`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the dedup keyword",
        why: "Customers pile up in the same cities, so the list must be deduped to one row per market. DISTINCT guarantees that; leaving it out risks a repeat slipping onto the CEO slide.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the source table",
        why: "Cities attach to customer records, so customers is the only source; the suppliers file keeps no city field at all.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the region filter",
        why: "The EU slice is picked by the region field. Filtering on name instead would match nobody — name = 'EU' fits no customer.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region value",
        why: "Region codes are text, so the value wears quotes: 'EU'. Swapping in 'US' shrinks the map to Austin and Chicago — the wrong continent.",
      },
    ],
    distractors: ["suppliers", "'US'", "name", "active"],
    walkthrough:
      "The memo needs the EU footprint, city-level, deduplicated. So: DISTINCT city, gated by WHERE region = 'EU', alphabetized for the slide. Eight cities come back — Berlin, Cork, Hamburg, London, Lyon, Madrid, Milan, Tallinn — one per EU market we hold. Worth knowing for the caveat slide: the full roster spans 16 cities, and the US slice is just Austin and Chicago, so 'EU-heavy' is the honest adjective. The tempting mistake is filtering on city itself — city = 'EU' matches nobody and returns an empty map, which would be an embarrassing slide 2.",
  },
  {
    id: "cs-121",
    topic: "l6",
    universe: "refund-audit",
    title: "Accounts behind the cancelled orders",
    brief:
      "From: refunds@ internal ticket #5187.\n\nRefund cohort review, quarter-end. Finance wants a headcount of the customer accounts behind our cancelled orders — accounts, not events; the repeat cases get a different treatment path than one-offs. Give me the deduped number so we can staff the goodwill review properly.",
    ask: "How many different customer accounts have at least one cancelled order.",
    template: `SELECT {1}(DISTINCT {2}) AS flagged_accounts
FROM {3}
WHERE status = {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tally aggregate",
        why: "A headcount of accounts, not of events — COUNT tallies distinct ids. SUM would add the four account numbers together (30) and report gibberish.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the account column",
        why: "The dedupe key is who placed the order — customer_id. Counting order ids would count events again, and product_id isn't on the orders table.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Cancellation status is stamped on order rows; the suppliers file has no status field, so the filter would fall apart there.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status value",
        why: "The refund queue maps to cancelled orders, quoted as text since it's a value. 'delivered' counts 15 accounts that never needed goodwill; 'pending' counts 8 still in flight.",
      },
    ],
    distractors: ["SUM", "product_id", "'delivered'", "'pending'", "suppliers"],
    walkthrough:
      "Finance asked for accounts, not events, and the ledger makes that distinction real: 7 orders were cancelled, but they came from only 4 different accounts. So the query dedupes inside the count — COUNT(DISTINCT customer_id) WHERE status = 'cancelled'. The concentration is the story: four accounts triggered more than half of all cancellations, and those are the repeat cases that get the special treatment path. For contrast, the same count over delivered orders is 15 and over pending is 8 — big pools, no concentration. One caveat for the review: cancellations are the refund queue's proxy here; the goodwill ledger itself lives outside this database.",
  },
  {
    id: "cs-122",
    topic: "l6",
    universe: "pricing",
    title: "Shelves that already carry premium prices",
    brief:
      "From: Head of Product. Re: premium shelf review.\n\nWe're repositioning the catalog and I want to know where premium perception already exists. List the shelves that carry at least one item billed above 100 — shelf names only, no repeats, one row per shelf. Anything that can't crack that bar stays out of the deck.",
    ask: "List of categories carrying at least one product priced over 100, no repeats.",
    template: `SELECT {1} {2}
FROM products
WHERE {3} > {4};`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the dedup keyword",
        why: "Audio owns two premium items but is one shelf — DISTINCT folds the repeats so the deck lists 3 shelves, not 4 product rows.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "the shelf column",
        why: "Shelves are categories; name would list the four individual premium products instead of the shelf rollup the deck needs.",
      },
      {
        answer: "price",
        kind: "keyword",
        label: "the price column",
        why: "The premium bar sits on price. stock > 100 answers a warehouse question (6 shelves) and says nothing about pricing.",
      },
      {
        answer: "100",
        kind: "number",
        label: "the premium threshold",
        why: "Premium starts above 100. Lowering the bar to 50 pulls in Apparel and Electronics and grows the list to 5 shelves — a diluted story.",
        noVerify: true,
      },
    ],
    distractors: ["ALL", "name", "id", "50"],
    walkthrough:
      "The premium story needs shelves, not products. Two moves: filter to items above 100, then fold to unique shelf names. Four products clear the bar — the headset, the desktop mic, the webcam, the smart watch — but they sit on just 3 shelves: Audio, Video and Wearables. DISTINCT does that folding; without it the deck would list Audio twice and look careless. The near-miss to respect: filtering on stock instead of price answers a different meeting entirely — six shelves hold over 100 units, right-shaped numbers, wrong question. Three shelves is a thin premium story; the repositioning has work to do.",
  },
  {
    id: "cs-123",
    topic: "l6",
    universe: "fraud",
    title: "Sizing the over-500 review queue",
    brief:
      "From: Risk team, spot-check rotation.\n\nHigh-value sweep, monthly. Policy: orders over 500 go to manual review, and we size the reviewer pool by how many different accounts are involved — one account with five big tickets needs one review, not five. Give me the deduped account headcount for the over-500 queue so staffing is right.",
    ask: "Count of different accounts with at least one order totaling over 500.",
    template: `SELECT {1}(DISTINCT customer_id) AS review_accounts
FROM {2}
WHERE total > {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tally aggregate",
        why: "One review per account, so count distinct customer ids. SUM would add the ten account numbers together (74) — a figure no reviewer pool can be sized from.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Order totals live on the orders rows; the customers roster has no total field, so the 500 bar would fail to compile there.",
      },
      {
        answer: "500",
        kind: "number",
        label: "the sweep threshold",
        why: "The policy pulls the over-500 tickets. Relaxing to 300 sweeps all 16 accounts — double the reviewer hours for marginal risk.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "customers", "300"],
    walkthrough:
      "Review capacity is per-account, so the sweep is sized by distinct customers, not order count. Filter to the big tickets — total > 500 — then dedupe the buyers: COUNT(DISTINCT customer_id). Ten accounts come back, out of the 16 who order at all; the other six stay under the bar all period. Loosen to 300 and the queue swallows everyone — all 16 accounts — which would double reviewer hours for marginal risk. Summing the account numbers instead of counting them (74) is the classic aggregate slip: a number that looks official and means nothing. Ten accounts fits the standing review panel; no temp staffing this cycle.",
  },
  {
    id: "cs-124",
    topic: "l6",
    universe: "inventory",
    title: "Batch sizes on the pick line",
    brief:
      "From: Warehouse ops manager. Re: pick-line re-slot.\n\nThe pick line gets re-slotted this month and I need the range of batch sizes that actually move — every different line quantity on the ledger, counted once each, no matter how many lines repeat it. If the range is tight we standardize the bins in one afternoon. Single number for the ops standup.",
    ask: "One number: how many different order-line quantities appear in the ledger.",
    template: `SELECT {1}({2} quantity) AS batch_sizes
FROM {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tally aggregate",
        why: "The ask is how many different sizes exist — a count. SUM would add the sizes together (1+2+3 = 6) and inflate the answer.",
      },
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the dedup keyword",
        why: "251 ledger lines repeat the same quantities; DISTINCT inside COUNT compresses them to the real range. COUNT(ALL quantity) would answer 251 — one per line.",
      },
      {
        answer: "order_items",
        kind: "keyword",
        label: "the source table",
        why: "Line quantities live on the order_items ledger; products carries shelf stock but no per-line quantity to count.",
      },
    ],
    distractors: ["SUM", "ALL", "products"],
    walkthrough:
      "Re-slotting the pick line starts with the range of batch sizes that actually move. The ledger logs a quantity on every one of its 251 lines, and they repeat constantly — so the query counts distinct quantities, not rows: COUNT(DISTINCT quantity). Three sizes come back: 1, 2 and 3. That's the whole range — no bulk lines of 5 or 10 anywhere on file, which settles the bin debate. The lazy COUNT(ALL quantity) would report 251 and send someone shopping for 251 bin types. Standardize on three bins this week, per the standup ask.",
  },
  {
    id: "cs-125",
    topic: "l6",
    universe: "funnel",
    title: "Markets we've actually acquired in",
    brief:
      "From: Growth marketing lead. Re: board market-split slide.\n\nBoard prep: I'm showing which markets we've actually acquired customers in, pulled straight from the customer file. Each region once — last quarter the deck listed the same market four times and we took questions about it for a week. Raw list, and I expect four or fewer rows.",
    ask: "The list of regions our customers live in, each region appearing once.",
    template: `{1} {2} region
FROM {3};`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "Reading a list out of one table starts with SELECT. FROM can't open a statement — FROM DISTINCT region is a syntax error before anything runs.",
      },
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the dedup keyword",
        why: "Every EU customer repeats the region value; DISTINCT trims 16 rows to the 4 real markets. ALL keeps all 16 and resurrects last quarter's embarrassment.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the source table",
        why: "Regions describe customer records; products has no region field, so the market list can't come from the catalog.",
      },
    ],
    distractors: ["FROM", "city", "products", "ALL"],
    walkthrough:
      "For the market-split slide I want the regions exactly as the data holds them, each once. Sixteen customer rows repeat four region values, so DISTINCT region trims the read to what matters: EU, LATAM, US, APAC — four markets, in the order the ledger first met them. Without the dedupe keyword the slide would carry sixteen rows, same region four times over, and the board would ask why Europe quadrupled. Four rows, as predicted — and note what's absent: no 'other' bucket, every customer maps cleanly to one of the four. That's the whole list; the pie chart can trust it.",
  },
  {
    id: "cs-126",
    topic: "l6",
    universe: "supplier",
    title: "The APAC vendor day agenda",
    brief:
      "From: Supply-chain lead. Re: APAC vendor day agenda.\n\nVendor day prep for the APAC leg. I need the vendor names based in that region, straight from the supplier file, alphabetized for the printed agenda — the template breaks if the same company appears twice. Two or three names I expect; scorecards and terms go in the appendix, not the agenda.",
    ask: "Alphabetized names of suppliers based in the APAC region, no duplicates.",
    template: `SELECT {1} {2}
FROM suppliers
WHERE {3} = {4}
ORDER BY name;`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the dedup keyword",
        why: "The printed agenda breaks on repeats, so each vendor appears once: DISTINCT. COUNT isn't a list-maker — COUNT name doesn't even parse as a column list.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the vendor column",
        why: "The agenda wants company names; rating would print scorecards (3.9, 4.1) where the companies should be.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the region filter",
        why: "APAC residency is the region field's job; the suppliers file keeps no city column, so a city filter can't exist here.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the region value",
        why: "Region codes are quoted text: 'APAC'. Swapping in 'EU' would put Alpine Audio and Nordic Gadgets on the APAC agenda — wrong hemisphere.",
      },
    ],
    distractors: ["COUNT", "rating", "city", "'EU'"],
    walkthrough:
      "Vendor day needs the APAC names, straight from the supplier file, alphabetized, no repeats. Filter region = 'APAC', pick the name field, dedupe, sort. Two rows come back: Pacific Textiles, then Shenzhen Electro — a two-name agenda, as suspected. The near-miss worth flagging: swap the filter to 'EU' and you'd be flying Alpine Audio and Nordic Gadgets to an APAC agenda — right format, wrong continent. Ratings were tempting to include, but the agenda wants names only; the scorecards (3.9 and 4.1) stay in the appendix. Short meeting.",
  },
  {
    id: "cs-127",
    topic: "l6",
    universe: "expense",
    title: "Months the CFO will ask about",
    brief:
      "From: Ops finance, spend owner. Re: big-ticket timeline.\n\nFor the CFO's spend timeline I need the heavy months and nothing else: every month in which at least a single order reached 500, listed once, oldest first. Light months stay off the chart entirely — I only want the months she'll ask about, with the gaps visible.",
    ask: "The months containing at least one order of 500 or more, oldest first, each once.",
    template: `{1} DISTINCT strftime('%Y-%m', created_at) AS month
FROM {4}
WHERE total {2} {3}
ORDER BY month;`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "A fresh read of the ledger opens with SELECT; FROM can't lead a statement — the parser stops before any row is touched.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the threshold operator",
        why: "'Reached 500' includes the exact-500 lines: >=. Flipping to < keeps only the light months — 14 of them — the opposite of the brief.",
      },
      {
        answer: "500",
        kind: "number",
        label: "the heavy-order bar",
        why: "The CFO's bar is a single order of 500. Lowering it to 300 lights up all 14 months and buries the two quiet months she needs to see.",
        noVerify: true,
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Order totals live on orders; the customers roster has no total to compare the bar against.",
      },
    ],
    distractors: ["FROM", "<", "300", "customers"],
    walkthrough:
      "The CFO chart wants heavy-spend months only, each once, oldest first. created_at is a timestamp, so strftime('%Y-%m') renders each order into its month bucket, DISTINCT keeps each bucket once, and the WHERE keeps months that carried at least one order of 500 or more. Twelve months qualify, 2024-01 through 2025-02 — and the two absences are the story: July and November 2024 never saw a single 500-plus order. Loosen the bar to 300 and all 14 months light up, which is exactly the clutter the brief banned. Twelve points on the timeline, two gaps to explain — that's the deliverable.",
  },
  {
    id: "cs-128",
    topic: "l6",
    universe: "catalog",
    title: "Who's holding the thin stock",
    brief:
      "From: Catalog content manager. Re: thin-stock shelf audit.\n\nMerchandising needs one number before they'll fund a replenishment sprint: how many different shelves currently hold any product under 100 units. A shelf with three thin items still counts once — I care how many shelves are affected, not how many products. If it clears four, the sprint is on.",
    ask: "One number: how many different categories hold any product with stock under 100.",
    template: `SELECT {1}(DISTINCT category) AS low_shelves
FROM {2}
WHERE {3} < {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tally aggregate",
        why: "Shelves affected, counted once each — that's COUNT(DISTINCT ...). SUM over category text returns 0; it can't count shelves.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the source table",
        why: "Stock lives on product rows; order_items has no stock field, so the thin-stock bar would fail there.",
      },
      {
        answer: "stock",
        kind: "keyword",
        label: "the stock column",
        why: "The thin-stock bar reads the stock field. price < 100 answers a pricing question (7 shelves) and restocks nothing.",
      },
      {
        answer: "100",
        kind: "number",
        label: "the thin-stock bar",
        why: "Thin means under 100 units. Tightening to 50 leaves only Audio and Wearables — 2 shelves — and understates the replenishment need.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "order_items", "price", "50"],
    walkthrough:
      "Merchandising wants one number: how many shelves hold thin stock. Filter products to stock under 100, then count the categories those rows belong to — once each, even when a shelf contributes several low items. Four shelves come back: Electronics, Audio, Video and Wearables. The Audio shelf alone has two thin items, but it counts once — that's the dedupe doing its job. Tighten the bar to 50 and only Audio and Wearables survive, understating the mess; read price instead of stock and you've answered a pricing question (7 shelves) while the shelves stay empty. Four shelves clears our bar — the sprint is on.",
  },
];
