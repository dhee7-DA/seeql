// Batch EA — easy wave A, cases cs-201…cs-229 (Module 1 deck expansion 200 → 300).
// 29 easy-tier cases: one clause family each (single predicate, one aggregate,
// plain sort, plain DISTINCT, or pure projection). Universes follow the
// canonical cycle (month-close → fraud, cs-201 = month-close), topics fill the
// easy quota (l2×6, l3×6, l4×3, l5×4, l6×4, l7×5, l1×1). Every figure was
// probed read-only against the seed db before authoring.

import type { CaseStudy } from "./types";

export const casesCEa: CaseStudy[] = [
  {
    id: "cs-201",
    tier: "easy",
    topic: "l2",
    universe: "month-close",
    title: "The 2.9% processor fee column",
    brief:
      "From: Financial Controller. Re: April close prep.\n\nBefore I sign the close packet I want the processor's take visible order by order, not buried in one gateway lump. Our card processor charges 2.9% per booking, so add a fee column next to each order's total, rounded to cents so the binder adds up cleanly.",
    ask: "Every order's id and total, plus processor_fee = 2.9% of the total, rounded to 2 decimals.",
    template: `SELECT id, total,
       ROUND(total * {1}, 2) {2} processor_fee
FROM {3};`,
    slots: [
      {
        answer: "0.029",
        kind: "number",
        noVerify: true,
        label: "the fee multiplier",
        why: "A 2.9% fee is 0.029 of the total — multiply, don't add. The tempting 0.29 would charge twenty-nine percent and overstate the processor's take by a factor of ten.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the column alias",
        why: "AS names the computed column processor_fee so the binder's fee line has a readable header instead of the raw expression text.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the ledger table",
        why: "Booking totals live on orders. order_items has no total column and products has no total column, so either fill would fail before printing a cent.",
      },
    ],
    distractors: ["0.29", "2.9", "IS", "order_items", "products"],
    walkthrough:
      "The fee is per-order money, so the math goes in the SELECT list where every row gets its own value: ROUND(total * 0.029, 2). The decimal is the whole trick — 2.9% written as a multiplier is 0.029, and one misplaced zero silently multiplies the bill by ten. AS gives the column the header the binder expects. Run it and the ledger reads order 1 at 576.54 with a 16.72 fee, order 2 at 416.81 with 12.09, down to order 74 at 1,088.44 costing 31.56. Across the book the fees track the totals exactly, which is the point: the controller can now tie the gateway statement to the ledger line by line.",
  },
  {
    id: "cs-202",
    tier: "easy",
    topic: "l3",
    universe: "refund-audit",
    title: "One account's cancelled tickets",
    brief:
      "From: refunds@ internal ticket #4533.\n\nAlice Chen has been on the phone all week and the ticket log shows she isn't imagining it. Pull every order on her account that ended up cancelled — id, value, and the date she placed it, so the timeline in the reply matches the ledger exactly.",
    ask: "List order id, total and created_at for customer 1's cancelled orders.",
    template: `SELECT id, total, {1}
FROM orders
WHERE {2} = 1 AND status = {3};`,
    slots: [
      {
        answer: "created_at",
        kind: "keyword",
        label: "the booking-date column",
        why: "The timeline needs the booking date, which is created_at. The tempting shipped_at is empty on cancelled orders — cancelled tickets never left the building.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the account pin",
        why: "Alice is customer 1 in the CRM, so the account test is customer_id = 1. The tempting id = 1 would pin order 1 — a row id, not an account.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status value",
        why: "Cancelled is a status value, so it wears quotes: status = 'cancelled'. Unquoted, SQL reads it as a column name and the query dies.",
      },
    ],
    distractors: ["id", "'pending'", "shipped_at", "OR"],
    walkthrough:
      "Two facts pin the rows: whose orders (customer_id = 1, the account — not id = 1, which is a single order row) and which outcome (status = 'cancelled', quoted because it's a value). The AND keeps both tests on every row. Three cancelled tickets come back: order 7 at 152.52 booked 2024-01-02, order 21 at 136.11 booked 2024-03-18, and order 95 at 206.19 booked 2025-01-05 — 494.82 of churn on one account, spread across thirteen months. That timeline shape matters for the reply: the earliest cancellation is over a year old, so 'we just broke it' is off the table before the agent even dials.",
  },
  {
    id: "cs-203",
    tier: "easy",
    topic: "l2",
    universe: "pricing",
    title: "Unit cost at 60 percent of list",
    brief:
      "From: Head of Product. Re: margin review.\n\nOur buying team estimates landed unit cost at 60% of list price, and the margin deck needs that estimate per SKU next to how deep the shelf runs. Keep the stock count visible beside the cost figure so reviewers can see exposure and estimate in one row, rounded to cents.",
    ask: "Each product's name and stock, plus unit_cost = 60% of price, rounded to 2 decimals.",
    template: `SELECT name, {1}, ROUND(price * {2}, 2) AS unit_cost
FROM {3};`,
    slots: [
      {
        answer: "stock",
        kind: "keyword",
        label: "the depth column",
        why: "The brief asks for shelf depth beside the cost, and depth is the stock column. quantity doesn't exist on products — it lives on order_items purchase lines.",
      },
      {
        answer: "0.6",
        kind: "number",
        noVerify: true,
        label: "the cost ratio",
        why: "60% of list is price times 0.6. The tempting 6 would make a 34.50 mouse cost 207, and 0.06 would understate every cost a hundredfold.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the catalog table",
        why: "List prices and shelf depth both live on products. order_items has neither price nor stock, so the fill would fail on the very first column.",
      },
    ],
    distractors: ["quantity", "0.06", "6", "order_items", "supplier_id"],
    walkthrough:
      "Cost here is an estimate, and estimates belong next to the thing they price: name, stock, then ROUND(price * 0.6, 2) so every row carries its own cost. The ratio is the trap — 60% of something is 0.6 times it, not 6 and not 0.06; off by one decimal and the whole margin story is fiction. The numbers land cleanly: the Mechanical Keyboard K1 lists at 89.99 so it costs an estimated 53.99, the Wireless Mouse M3 at 34.50 costs 20.7, the USB-C Hub 49 becomes 29.4, and the priciest SKU, the Smart Watch S at 199.99, lands at 119.99. Sixteen rows, one per SKU, ready for the margin column the deck adds next.",
  },
  {
    id: "cs-204",
    tier: "easy",
    topic: "l3",
    universe: "inventory",
    title: "A-items for the cycle count",
    brief:
      "From: Warehouse ops manager. Re: cycle count rotation.\n\nCount policy: anything with 400 or more units on the shelf is an A-item and gets counted every cycle, no exceptions. Print the A-item list with exact stock figures so the counters can sign against the numbers — and yes, 400 exactly counts, the policy says or more.",
    ask: "List the name and stock of every product holding 400 or more units.",
    template: `SELECT name, stock
FROM products
{1} stock {2} {3};`,
    slots: [
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "Picking the A-items out of the 16-SKU catalog is row-level filtering, so the test sits in WHERE. Without it the sheet lists every shelf, B- and C-items included.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the comparison operator",
        why: "'400 or more' is the inclusive bar: >= keeps a shelf sitting exactly on 400. The strict > would quietly drop a policy-qualifying SKU from the count sheet.",
      },
      {
        answer: "400",
        kind: "number",
        label: "the A-item bar",
        why: "The policy fixes the bar at 400, and the printed sheet should show it — Running Socks sits exactly on 400 and must make the list.",
      },
    ],
    distractors: ["<", ">", "500", "BETWEEN"],
    walkthrough:
      "The policy sentence decomposes cleanly: filter rows, test the stock column, keep 400 and above. The operator is where easy cases bite — 'or more' means >=, and the database even grades you on it: Running Socks 3-pack sits exactly on 400, so strict > would erase a qualifying SKU from the count sheet and the counter would never walk that bin. Two A-items come back: HDMI 2.1 Cable 2m at 500 units and Running Socks 3-pack at exactly 400. The nearest miss is the Wireless Mouse M3 at 300 — a hundred units short, so it stays on the B-list this cycle. Two rows, both signed, policy applied to the letter.",
  },
  {
    id: "cs-205",
    tier: "easy",
    topic: "l5",
    universe: "funnel",
    title: "The newest signup on the board",
    brief:
      "From: Growth marketing lead. Re: weekly funnel readout.\n\nThe slide ends on a human note: the most recent account to join, name and city on screen with the join date. One account, not a leaderboard — the newest one only. Sort so the top of the list is the latest join, then cut everything after the first row.",
    ask: "The name, city and created_at of the single most recently joined customer.",
    template: `SELECT name, city, created_at
FROM customers
{1} BY created_at {2}
{3} {4};`,
    slots: [
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the sort clause",
        why: "Ranking rows by join date is sorting, so ORDER BY. GROUP BY would collapse the sixteen accounts into date buckets and lose the people entirely.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Newest first means descending: the latest date lands on top. The default ASC would crown the oldest signup, Alice from 2023, as the newcomer.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the row cap",
        why: "LIMIT 1 trims everything after the first row — and it runs after the sort, so the row you keep is genuinely the newest one.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the cap size",
        why: "The slide wants one account only, so the cap is 1. The tempting 2 would leak the runner-up onto a slide built for a single name.",
      },
    ],
    distractors: ["WHERE", "ASC", "OFFSET", "2"],
    walkthrough:
      "Newest-only is a two-move query: sort by join date with the newest on top, then cut to one row. DESC is the direction that puts 2024 above 2023 — ASC would flip the board and crown the founding account as the newest. Because LIMIT applies after sorting, LIMIT 1 keeps exactly the row you ranked first. The result: Pedro Alvarez, Madrid, joined 2024-07-03 — the funnel's latest conversion, three weeks after Olivia Brown (2024-06-11) who would have taken the slide under ASC. One name, one city, one date: the slide closes on a person, not a table.",
  },
  {
    id: "cs-206",
    tier: "easy",
    topic: "l2",
    universe: "supplier",
    title: "Vendor cards for the portal import",
    brief:
      "From: Supply-chain lead. Re: vendor portal migration.\n\nThe new portal is picky about headers: supplier names must arrive labelled vendor and ratings labelled score, while the region rides through untouched. Same six rows, same values — only the two headers change, or the import bounces the file.",
    ask: "Every supplier's name (as vendor), rating (as score) and region, with exactly those headers.",
    template: `SELECT name {1} vendor,
       {2} AS score,
       region
FROM {3};`,
    slots: [
      {
        answer: "AS",
        kind: "keyword",
        label: "the rename keyword",
        why: "AS is what turns name into vendor — the header the portal demands. Skip it and the column arrives labelled name, which the import rejects.",
      },
      {
        answer: "rating",
        kind: "keyword",
        label: "the score column",
        why: "The portal's score is the suppliers table' rating column — same numbers, new label. region is a different field entirely and would ship geography where scores belong.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "the source table",
        why: "Vendor names and ratings live on suppliers. products has no rating column, so pointing the query there fails before the first row.",
      },
    ],
    distractors: ["IS", "WHERE", "region", "products"],
    walkthrough:
      "Aliases change labels, never data — and this import is pure relabelling. name AS vendor satisfies the portal's first header, rating AS score the second, while region rides through because the portal reads it as-is. One statement, six rows: Nordic Gadgets AB arrives as a vendor scored 4.6 in region EU, Shenzhen Electro 4.1 APAC, Pacific Textiles 3.9 APAC, Midwest Hardware Co 4.4 US, Alpine Audio GmbH 4.8 EU, Andes Naturals SA 4.0 LATAM. The habit to keep: rename in the query, not in the spreadsheet afterwards — a template that bounces on header names should never rely on someone remembering to fix them by hand after every export.",
  },
  {
    id: "cs-207",
    tier: "easy",
    topic: "l3",
    universe: "expense",
    title: "Settled money on the card ledger",
    brief:
      "From: Ops finance, spend control.\n\nThe card statement only covers money that actually moved: orders shipped or delivered. Pending and cancelled rows are still in limbo and must stay off the reconciliation. Pull the settled rows with their ids and values so the statement can be tied out line by line.",
    ask: "List id, total and status for every order whose status is shipped or delivered.",
    template: `SELECT id, total, status
FROM orders
WHERE status {1} ({2}, {3});`,
    slots: [
      {
        answer: "IN",
        kind: "keyword",
        label: "the list operator",
        why: "Two acceptable values on one column is exactly what IN is for. Chaining them with = is a syntax error, and BETWEEN is for numeric ranges, not value lists.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the first settled status",
        why: "Shipped orders have left the building, so they count as settled — quoted, because status values are text. Unshipped pending rows must stay off the statement.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the second settled status",
        why: "Delivered is the fully-settled end state, also quoted. Swap in 'pending' and fourteen unsettled orders sneak onto a reconciliation they don't belong on.",
      },
    ],
    distractors: ["BETWEEN", "=", "'pending'", "NOT"],
    walkthrough:
      "One column, two acceptable values: that's the IN pattern — status IN ('shipped', 'delivered') — and both values wear quotes because statuses are text, not column names. The parentheses are part of the form; BETWEEN looks temptingly similar but needs AND with numeric bounds, and it would error outright here. The ledger splits exactly as finance expects: 82 settled orders — the 30 shipped plus the 52 delivered — starting with order 2 at 416.81 delivered and order 3 at 767.64 shipped. The 14 pending and 7 cancelled rows stay off the sheet, which is the entire point: reconcile money that moved, not money still arguing.",
  },
  {
    id: "cs-208",
    tier: "easy",
    topic: "l2",
    universe: "growth",
    title: "The board map's account roster",
    brief:
      "From: Chief of Staff. Re: geography slide for the board.\n\nThe dashboard vendor wants the account feed pre-labelled: names arrive as account_name, regions as market, and join dates as joined_on. Values untouched, all sixteen accounts, exactly those headers — the map pins break otherwise.",
    ask: "Every customer's name (as account_name), region (as market) and created_at (as joined_on).",
    template: `SELECT {1} AS account_name,
       {2} AS market,
       created_at AS joined_on
FROM {3};`,
    slots: [
      {
        answer: "name",
        kind: "keyword",
        label: "the account column",
        why: "The account label comes from the customers table' name column. email would ship contact addresses where company names belong on the map.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the market column",
        why: "Markets are the four-letter regions (EU, US, APAC, LATAM) — that's what the map groups by. city would pin accounts to sixteen towns and break the regional rollup.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the source table",
        why: "Account names and join dates live on customers. orders has no name column at all, so the fill fails before the map gets a single pin.",
      },
    ],
    distractors: ["email", "city", "orders", "id"],
    walkthrough:
      "Three renames, zero filtering: this is a labelled export of the whole CRM. The columns are chosen for the map's grouping logic — name identifies the pin, region rolls accounts into the four markets the board reads (EU, US, APAC, LATAM), created_at becomes the joined_on date the cohort view sorts on. City is the tempting wrong turn: sixteen unique towns would render sixteen pins instead of four market clusters. Sixteen rows come back, Alice Chen of EU first, Pedro Alvarez of EU last, every header exactly as the vendor's template demands. Renaming in the query keeps the feed stable no matter how many times the slide gets refreshed.",
  },
  {
    id: "cs-209",
    tier: "easy",
    topic: "l3",
    universe: "fraud",
    title: "The four-figure order",
    brief:
      "From: Risk team, spot-check rotation.\n\nPolicy: any single order at four figures or more gets eyes on it before capture. The threshold is 1000 and it's strict — the order must exceed it, not meet it. Send the booking with its value and current state so the reviewer can pull the full record.",
    ask: "List the id, total and status of every order whose total is greater than 1000.",
    template: `SELECT id, {1}, status
FROM orders
WHERE total {2} {3};`,
    slots: [
      {
        answer: "total",
        kind: "keyword",
        label: "the value column",
        why: "The money figure being tested is orders.total. customer_id would rank accounts, not booking values, and the policy is about single-ticket size.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the comparison operator",
        why: "'Must exceed 1000' is strictly greater: >. The policy order at 1,088.44 clears it either way, but >= would silently rewrite the rule for a future 1,000.00 ticket.",
      },
      {
        answer: "1000",
        kind: "number",
        noVerify: true,
        label: "the review threshold",
        why: "The policy line is 1000 — the review bar, not the biggest ticket on file. Using 1088 would tune the rule to today's data instead of the policy.",
      },
    ],
    distractors: ["customer_id", "<", "500", "="],
    walkthrough:
      "A threshold read with one job: keep the rows above the line. total is the column under test, > the operator ('exceed', not 'meet'), 1000 the bar straight from policy. The result is a single row — order 74, 1,088.44, still pending. That last field is the finding: the only four-figure booking on the books hasn't even shipped, which is exactly the profile the spot-check exists for. Lower the bar to 500 and the queue explodes to 25 orders; the policy number, not the data, decides the workload. One row, flagged, before capture.",
  },
  {
    id: "cs-210",
    tier: "easy",
    topic: "l2",
    universe: "catalog",
    title: "The pick list for the count floor",
    brief:
      "From: Catalog content manager. Re: count-floor printing.\n\nThe handheld scanners want a lean pick list: row id, product name, and the shelf category — nothing else, because every extra column slows the scan gun down. All sixteen SKUs, no filtering, just those three fields in that order.",
    ask: "Every product's id, name and category — exactly those three columns.",
    template: `SELECT {1}, {2}, category
FROM {3};`,
    slots: [
      {
        answer: "id",
        kind: "keyword",
        label: "the row-id column",
        why: "The scanner keys on the product's id — stable, unique, printed on the shelf tag. supplier_id would identify the vendor, not the SKU on the bin.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the product-name column",
        why: "Counters verify by eye against the printed name, so name rides second. stock would put counts on a sheet meant to collect them.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the source table",
        why: "The catalog of SKUs lives in products. order_items is purchase-line history with no category column, so the fill would fail outright.",
      },
    ],
    distractors: ["stock", "price", "supplier_id", "order_items"],
    walkthrough:
      "Projection discipline: three columns, three reasons. id because the scanner keys on it, name because a human verifies the bin, category because the count sheet groups shelves — and nothing else, because every extra column is another thing to render on a gun-sized screen. FROM products pulls all sixteen SKUs unfiltered, Mechanical Keyboard K1 of Electronics at row 1 down to Yoga Mat Eco 6mm of Fitness at row 16. The tempting stock chip is the conceptual trap: the count sheet exists to collect stock numbers, so pre-printing them would defeat the count. Lean list, full catalog, nothing to slow the floor down.",
  },
  {
    id: "cs-211",
    tier: "easy",
    topic: "l4",
    universe: "month-close",
    title: "Dispatch blanks, filled for print",
    brief:
      "From: Financial Controller. Re: close binder formatting.\n\nThe binder prints the dispatch ledger, but empty cells look like errors to the audit partner. Where shipped_at has no date yet, print the words 'not shipped' instead, so every blank is visibly a state, not a data loss. Leave real dates exactly as they are.",
    ask: "Every order's id and status, with a dispatch column showing shipped_at or 'not shipped' when empty.",
    template: `SELECT {1}, status,
       COALESCE({2}, {3}) AS dispatch
FROM orders;`,
    slots: [
      {
        answer: "id",
        kind: "keyword",
        label: "the row identifier",
        why: "The binder indexes everything by order id, so id leads the projection. orders has no name column — the tempting chip would fail the fill.",
      },
      {
        answer: "shipped_at",
        kind: "keyword",
        label: "the dispatch column",
        why: "The dispatch date is shipped_at — the one column on orders that can be empty. created_at is never blank, so coalescing it would print dates everywhere and hide the gap entirely.",
      },
      {
        answer: "'not shipped'",
        kind: "keyword",
        label: "the blank filler",
        why: "COALESCE returns its first non-NULL argument, so the quoted text fills exactly the empty rows. 'pending' would relabel real states, and NULL would keep the blanks the binder hates.",
      },
    ],
    distractors: ["customer_id", "created_at", "total", "'pending'", "NULL"],
    walkthrough:
      "COALESCE is the display fix for NULLs: walk the arguments left to right and return the first one that isn't empty. COALESCE(shipped_at, 'not shipped') therefore prints the real date whenever one exists and the quoted words exactly on the 21 rows still missing a stamp. The trap is passing NULL as the fallback — that hands the emptiness straight through and the binder looks broken again. Scanning the output: order 1, pending, prints 'not shipped'; order 2, delivered, prints 2024-01-18; order 3, shipped, prints 2024-01-26. One hundred three rows, no blank cells, and the 21 'not shipped' lines are the close's open-items list by construction.",
  },
  {
    id: "cs-212",
    tier: "easy",
    topic: "l6",
    universe: "refund-audit",
    title: "The credit queue's four accounts",
    brief:
      "From: refunds@ internal ticket #4561.\n\nSeven cancelled orders are queued for goodwill credits, but we charge accounts, not orders — some customers cancelled more than once. Give me the deduplicated account list behind those seven tickets so CRM can attach the credits to the right people.",
    ask: "The distinct customer_id values behind the cancelled orders.",
    template: `SELECT DISTINCT {1}
FROM {2}
WHERE {3} = 'cancelled';`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the account column",
        why: "Credits attach to accounts, and customer_id is the account reference on orders. id would dedupe order rows — seven of them — not the people behind them.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the ticket table",
        why: "Cancellation status lives on the orders ledger. customers has no status column at all, so that fill errors before deduping anything.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the state column",
        why: "The queue is defined by status = 'cancelled'. Filtering on id or total would compare numbers to text and empty the list completely.",
      },
    ],
    distractors: ["id", "total", "customers", "order_items"],
    walkthrough:
      "The ask is 'who', not 'how many rows' — that's DISTINCT's whole job: collapse the seven cancelled order rows into the unique accounts behind them. The filter runs first, THEN the dedupe, which is why the status predicate belongs in WHERE. Seven cancellations collapse to four accounts: 1, 13, 5 and 11 — Alice Chen, Maya Patel, Emma Wilson and Keiko Sato. The collapse itself is the insight: Alice appears three times in the raw queue, so a third of the ticket volume is one account's frustration. Without DISTINCT the CRM would open three credit cases against the same person, and that's how goodwill budgets die.",
  },
  {
    id: "cs-213",
    tier: "easy",
    topic: "l2",
    universe: "pricing",
    title: "The all-in price tag",
    brief:
      "From: Head of Product. Re: landing-page price test.\n\nThe new landing page quotes one number per product: list price plus our flat 4.99 handling, rounded to cents. Finance insists the rounding go through the standard money function, not floating-point hope. Show list and all-in side by side.",
    ask: "Each product's name and price, plus all_in_price = price + 4.99 rounded to 2 decimals.",
    template: `SELECT name, price, {1}(price + 4.99, 2) {2} all_in_price
FROM {3};`,
    slots: [
      {
        answer: "ROUND",
        kind: "keyword",
        label: "the rounding function",
        why: "Money gets rounded by the ROUND function with 2 decimals. SUM, AVG or COUNT are aggregates over many rows — pointing one at a single price is a syntax error.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the rename keyword",
        why: "AS labels the computed column all_in_price — the header the landing-page template maps on. Without it the header is the raw expression text.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the catalog table",
        why: "List prices live on products. order_items has per-line purchase prices but no price column, so the fill would fail on the first row.",
      },
    ],
    distractors: ["SUM", "AVG", "IS", "order_items"],
    walkthrough:
      "Flat-fee math is per-row, so the expression sits in the SELECT list: price + 4.99, wrapped in ROUND(..., 2) the way finance demands for money. The function choice is the lesson — ROUND shapes a value, while SUM/AVG/COUNT collapse columns, and putting an aggregate where a scalar belongs breaks the statement. AS names the result so the page template finds its header. The tags print cleanly: the 89.99 keyboard lands at 94.98 all-in, the 34.50 mouse at 39.49, the 49.00 hub at 53.99, the 149.99 headset at 154.98. Sixteen rows, list and all-in side by side, exactly what a price test needs to judge the fee's effect.",
  },
  {
    id: "cs-214",
    tier: "easy",
    topic: "l5",
    universe: "inventory",
    title: "The stock ladder, thinnest first",
    brief:
      "From: Warehouse ops manager. Re: replenishment walkthrough.\n\nWalk the floor in risk order: the shallowest shelf first, deepest last, every SKU on the ladder. No cutting, no filtering — the team wants the full sixteen-row ladder so nothing gets skipped between replenishment stops.",
    ask: "Every product's name and stock, sorted from lowest stock to highest.",
    template: `SELECT name, {1}
FROM products
{2} BY stock {3};`,
    slots: [
      {
        answer: "stock",
        kind: "keyword",
        label: "the depth column",
        why: "Risk order is shelf depth, and depth is the stock column. price would ladder the walk by cost, which says nothing about running out.",
      },
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the sort clause",
        why: "Laying rows out in a defined sequence is ORDER BY's job. WHERE filters rows out — the brief demands all sixteen, none dropped.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "Thinnest first is ascending: smallest stock on top. DESC would start the walk at the fullest shelf and defeat the risk-first plan.",
      },
    ],
    distractors: ["DESC", "WHERE", "LIMIT", "BY"],
    walkthrough:
      "A full ladder in risk order is one clause: ORDER BY stock ASC, no LIMIT to chop rows off the bottom, no WHERE to drop shelves from the walk. ASC is the direction that matters — ascending puts 40 above 500, and this walk lives or dies on starting at the shallow shelf. The ladder reads Smart Watch S at 40, Studio Desktop Mic at 45, Noise-Canceling Headset at 60, 4K Webcam Pro at 70, and sixteen rows later bottoms out at the HDMI 2.1 Cable's 500-unit wall. Because stock values are all distinct here, the order is unambiguous — every replenishment stop is exactly one shelf, thinnest to deepest, nothing skipped.",
  },
  {
    id: "cs-215",
    tier: "easy",
    topic: "l6",
    universe: "funnel",
    title: "SKUs that have actually moved",
    brief:
      "From: Growth marketing lead. Re: catalog coverage slide.\n\nThe slide claims every catalog line sells. Before it ships, prove the honest version: collapse the 251 purchase lines down to the distinct products that appear in them at least once. The count of unique SKUs is the coverage number.",
    ask: "The distinct product_id values appearing in the order lines.",
    template: `SELECT {1} {2}
FROM {3};`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the dedupe keyword",
        why: "DISTINCT collapses repeated values to one row each. ALL is the default opposite — it keeps every one of the 251 lines and the coverage claim drowns.",
      },
      {
        answer: "product_id",
        kind: "keyword",
        label: "the SKU reference",
        why: "Products are referenced by product_id on the purchase lines. quantity would dedupe to just the three pack sizes, which counts nothing that sold.",
      },
      {
        answer: "order_items",
        kind: "keyword",
        label: "the purchase-line table",
        why: "What actually sold is recorded line by line in order_items. customers has no product_id column at all, so that fill errors immediately.",
      },
    ],
    distractors: ["ALL", "quantity", "order_id", "customers"],
    walkthrough:
      "Coverage questions are dedupe questions: how many different things appear, not how many times they appear. DISTINCT product_id over order_items collapses 251 purchase lines into the unique SKUs behind them — and the answer is 16, every product in the catalog moved at least one unit. The slide's claim survives, but now it's earned rather than asserted. The instructive near-misses: DISTINCT order_id would return 103 (every order has lines), and DISTINCT quantity would return just 1, 2, 3 — pack sizes, not products. One keyword separates '251 sales events' from '16 products sold', and that distinction is the entire slide.",
  },
  {
    id: "cs-216",
    tier: "easy",
    topic: "l3",
    universe: "supplier",
    title: "The EU visit list",
    brief:
      "From: Supply-chain lead. Re: Q3 supplier roadshow.\n\nThe European leg of the roadshow is being scheduled first and I need the vendor list for it: every supplier based in the EU, names next to regions so the travel booker can sanity-check. Exact match on the region code, please — 'EU', nothing fuzzy.",
    ask: "List the name and region of every supplier whose region is EU.",
    template: `SELECT name, region
FROM suppliers
{1} region {2} {3};`,
    slots: [
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "Narrowing six vendors to the European ones is row-level filtering, so the test lives in WHERE. ORDER BY would sort all six and visit every region anyway.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the equality operator",
        why: "An exact region code match is equality: region = 'EU'. The strict > would compare text alphabetically and hand you LATAM and US by accident.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region code",
        why: "EU is a text value, so it wears quotes: 'EU'. Unquoted it reads as a column name and the query fails; 'US' or 'APAC' would book the wrong continent.",
      },
    ],
    distractors: [">", "!=", "'US'", "'APAC'"],
    walkthrough:
      "Text equality with the quotes on: region = 'EU' keeps only the rows whose region code is exactly the two-letter value — and the quotes are the whole lesson, since unquoted EU would be parsed as a column and the statement dies. Two vendors qualify: Nordic Gadgets AB and Alpine Audio GmbH, both region EU. The near-misses prove the filter bit: 'APAC' would have booked Shenzhen Electro and Pacific Textiles, 'US' just Midwest Hardware, and a sloppy > would have alphabetically swept in LATAM and US while missing Europe entirely. Two names, one region, roadshow leg one booked.",
  },
  {
    id: "cs-217",
    tier: "easy",
    topic: "l6",
    universe: "expense",
    title: "Accounts on the month's statement",
    brief:
      "From: Ops finance, spend control.\n\nThe card program review opens with one question: how many distinct accounts actually ran spend this period? Not how many bookings — how many unique accounts appear on the ledger at all. One number for the title slide of the review.",
    ask: "Count the distinct customer_id values appearing across all orders.",
    template: `SELECT {1}(DISTINCT {2}) AS accounts
FROM {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The deliverable is a headcount of unique values, so COUNT wraps the DISTINCT. SUM would add the account numbers together and produce a meaningless 136.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the account column",
        why: "Accounts are referenced by customer_id on each order row. product_id doesn't exist on orders at all, so that chip fails the fill.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the ledger table",
        why: "The spend ledger is the orders table. customers has no customer_id column — it IS the account list, not the record of who spent.",
      },
    ],
    distractors: ["SUM", "AVG", "customers", "product_id"],
    walkthrough:
      "COUNT(DISTINCT col) is two ideas in one function call: DISTINCT first collapses the column to unique values, then COUNT sizes what's left. That nesting order is the entire lesson — COUNT(*) would report 103 bookings, SUM(DISTINCT customer_id) would add account numbers into a meaningless 136, and only the wrapped form answers 'how many accounts'. The ledger answers 16: every account on the customer list has run at least one order this period, so coverage is complete and the review can open with 'no dormant spend accounts'. One number, one row, exactly what a title slide needs.",
  },
  {
    id: "cs-218",
    tier: "easy",
    topic: "l6",
    universe: "growth",
    title: "The account map's city list",
    brief:
      "From: Chief of Staff. Re: growth board map.\n\nThe map vendor renders one pin per city, so the feed must be unique cities in alphabetical order — duplicates break the pin renderer, and the unsorted export breaks the legend. All sixteen accounts collapse down to their cities for this one.",
    ask: "The distinct city values from customers, sorted alphabetically.",
    template: `SELECT {1} city
FROM {2}
{3} city;`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the dedupe keyword",
        why: "Sixteen accounts share no cities here, but the renderer demands the deduped form — DISTINCT is what guarantees one row per city no matter how the CRM grows.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the account table",
        why: "Account cities live on customers. suppliers has no city column at all, so that fill errors before producing a single pin.",
      },
      {
        answer: "ORDER BY",
        kind: "keyword",
        label: "the sort clause",
        why: "The legend must read alphabetically, so ORDER BY city sorts the deduped list. LIMIT would chop cities off the map and WHERE would need a condition it wasn't given.",
      },
    ],
    distractors: ["WHERE", "ASC", "suppliers", "name"],
    walkthrough:
      "Two clauses, one job each: DISTINCT produces the unique city set, ORDER BY city lines it up alphabetically for the legend. The order of operations is implicit but real — dedupe happens, then the surviving rows sort, so the alphabetization is over unique cities, never raw rows. The map gets sixteen pins: Austin, Berlin, Chicago, Cork, Dubai, Hamburg, London, Lyon, Madrid, Milan, Mumbai, Nagoya, Osaka, Seoul, São Paulo and Tallinn — one per city, A to T. Today each city holds exactly one account, so the dedupe looks trivial; the clause is insurance for the day Berlin signs its second customer and the renderer would otherwise double-pin.",
  },
  {
    id: "cs-219",
    tier: "easy",
    topic: "l4",
    universe: "fraud",
    title: "Stamps the warehouse did apply",
    brief:
      "From: Risk team, spot-check rotation.\n\nFor the evidence file we need the positive case, not the gap: how many bookings carry a warehouse dispatch stamp? A filled shipped_at is a timestamp someone scanned, which makes the order provable. Count only the stamped rows.",
    ask: "Count the orders that have a dispatch timestamp on file.",
    template: `SELECT {1}(*)
FROM orders
WHERE shipped_at IS {2} {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The deliverable is a headcount of rows, so COUNT(*). SUM would try to add up the asterisk and fail; the ask is how many, not how much.",
      },
      {
        answer: "NOT",
        kind: "keyword",
        label: "the negation word",
        why: "'Has a stamp' is the negated emptiness test: IS NOT NULL. Dropping NOT counts the opposite pile — the 21 rows still missing a stamp.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty marker",
        why: "NULL is the marker for no value, and only IS (not =) can test for it: shipped_at IS NOT NULL keeps every row a stamp exists for.",
      },
    ],
    distractors: ["SUM", "AVG", "=", "LIKE"],
    walkthrough:
      "The positive test is the negated one: a stamped row is shipped_at IS NOT NULL, because NULL means 'no value' and can't be reached with equals — shipped_at = NULL is unknown for every row and matches nothing. COUNT(*) then sizes the survivors. The number for the evidence file: 82 of the 103 bookings carry a scan stamp. Flip the NOT and you get 21, the unprovable pile — the exact complement, and a useful sanity check: 82 plus 21 is 103, so the two tests partition the ledger perfectly. Evidence first: the 82 are the orders the process can vouch for.",
  },
  {
    id: "cs-220",
    tier: "easy",
    topic: "l3",
    universe: "catalog",
    title: "Pro anywhere in the name",
    brief:
      "From: Catalog content manager. Re: 'Pro' tier landing strip.\n\nMarketing is building a 'Pro gear' strip and wants every catalog item with Pro anywhere in its product name — beginning, middle or end. Pattern match, not exact match, and the strip renders name beside category.",
    ask: "List the name and category of every product whose name contains 'Pro'.",
    template: `SELECT name, {1}
FROM products
WHERE name {2} {3};`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the shelf column",
        why: "The strip labels each item with its shelf, so category rides second. price would put money on a strip that's organized by product line, not cost.",
      },
      {
        answer: "LIKE",
        kind: "keyword",
        label: "the pattern operator",
        why: "Matching part of a text field is LIKE's job. Plain = compares whole values and would find nothing, because no product is named just 'Pro'.",
      },
      {
        answer: "'%Pro%'",
        kind: "keyword",
        label: "the pattern",
        why: "Percent signs are LIKE wildcards: %Pro% matches Pro anywhere in the name. '%Pro' would demand it at the end only and miss the webcam.",
      },
    ],
    distractors: ["price", "=", "IN", "'Webcam'"],
    walkthrough:
      "Substring search decomposes into the operator and the pattern: LIKE does the matching, and '%Pro%' is the pattern — the percent signs mean 'anything here', so Pro counts whether it opens the name or hides inside it. Plain equality is the classic miss: name = 'Pro' matches no product at all. Two items make the strip: 4K Webcam Pro from the Video shelf and Cycling Jersey Pro from Apparel. Worth knowing for the writeup: SQLite's LIKE ignores case for ASCII letters, so '%pro%' finds the same pair — the pattern's wildcards, not its casing, do the work. Two SKUs, one strip, pattern proven.",
  },
  {
    id: "cs-221",
    tier: "easy",
    topic: "l7",
    universe: "month-close",
    title: "The close deck's average cell",
    brief:
      "From: Financial Controller. Re: close deck, slide 2.\n\nSlide 2 carries a single figure this cycle: the average order value across the whole book, every status included, rounded to cents so the cell doesn't trail floating-point noise. One cell, one number, no filters — the raw mean of the period.",
    ask: "The average of total across all orders, rounded to 2 decimals.",
    template: `SELECT ROUND({1}(total), 2) {2} avg_ticket
FROM {3};`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean aggregate",
        why: "An average is AVG's definition: sum divided by count over the rows. MAX would report the single biggest ticket, and SUM the grand total — neither is a mean.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the rename keyword",
        why: "AS names the cell avg_ticket so the deck's field mapping finds it. Without the alias the header is the whole ROUND expression.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the ledger table",
        why: "Booking totals live on orders.total. order_items has no total column — its per-line prices would need multiplying by quantity first.",
      },
    ],
    distractors: ["SUM", "MAX", "MIN", "COUNT", "order_items"],
    walkthrough:
      "One aggregate, one decision: the mean is AVG(total), full stop. The distractors each answer a different question — SUM gives the book's 34,833.28 grand total, MAX the single 1,088.44 ticket, COUNT the 103 bookings — and the slide wants none of those. No WHERE clause: the controller said every status, so the mean sweeps all 103 rows, cancelled and pending included, which is why the figure reads lower than the delivered-only average. ROUND(..., 2) lands the cell at 338.19 exactly, no trailing noise. One row, one cell, slide 2 done — and the same query re-run next month keeps the definition honest.",
  },
  {
    id: "cs-222",
    tier: "easy",
    topic: "l4",
    universe: "refund-audit",
    title: "Refund cases without a dispatch stamp",
    brief:
      "From: refunds@ internal ticket #4580.\n\nA refund is clean-cut only when the goods provably never left: status cancelled AND no dispatch stamp on file. Both conditions, every row, ids and values for the queue. If anything shipped, it's a return claim, not a refund, and it comes off this list.",
    ask: "List id and total for orders that are cancelled and have no shipped_at on file.",
    template: `SELECT id, total, {1}
FROM orders
WHERE status = 'cancelled' AND shipped_at {2} {3};`,
    slots: [
      {
        answer: "status",
        kind: "keyword",
        label: "the state column",
        why: "The queue sheet shows the state beside the value so reviewers see why each row qualifies. created_at would print booking dates nobody asked for.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the null operator",
        why: "Emptiness is tested with IS: shipped_at IS NULL. The equals sign reads NULL as 'unknown' and matches nothing, silently emptying the refund queue.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty marker",
        why: "NULL is the ledger's way of saying no dispatch ever happened — the exact proof a refund case needs. IS NOT NULL would select the opposite, impossible pile.",
      },
    ],
    distractors: ["created_at", "=", "IS NOT", "OR"],
    walkthrough:
      "Two conditions define a clean refund: the order is cancelled, and no dispatch stamp exists. The first is a plain equality on status; the second is the NULL lesson — shipped_at IS NULL, because = NULL evaluates to unknown and returns nothing. AND requires both, so the queue is the intersection, not the union. Seven rows qualify: order 7 at 152.52, order 21 at 136.11, order 50 at 90.35, order 51 at 25.47, order 82 at 143.86, order 83 at 397.99 and order 95 at 206.19 — 1,152.49 of cancellation value, all provably never shipped. The proof structure is the point: every row on this list can be refunded without a warehouse argument.",
  },
  {
    id: "cs-223",
    tier: "easy",
    topic: "l7",
    universe: "pricing",
    title: "Line rates, floor to ceiling",
    brief:
      "From: Head of Product. Re: pricing review baseline.\n\nBefore we touch list prices I want the range the checkout actually charged: the cheapest per-unit rate on any purchase line and the dearest, side by side in one row. Purchase lines, not the catalog — what customers really paid is the baseline that matters.",
    ask: "One row with the minimum and maximum unit_price across all order lines.",
    template: `SELECT {1}(unit_price) AS floor_rate,
       {2}(unit_price) AS ceiling_rate
FROM {3};`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor aggregate",
        why: "The cheapest rate charged is MIN over the line prices. AVG would blur the range into one mean and answer a question nobody asked.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling aggregate",
        why: "The dearest rate is MAX over the same column — MIN and MAX are the range, one family. A second MIN would print the floor twice and drop the ceiling.",
      },
      {
        answer: "order_items",
        kind: "keyword",
        label: "the line table",
        why: "What was actually charged per unit lives on order_items.unit_price. products has no such column — its list price is the tag, not the transaction.",
      },
    ],
    distractors: ["AVG", "SUM", "COUNT", "products"],
    walkthrough:
      "A range is one family of aggregates: MIN finds the floor, MAX the ceiling, both over the same column, delivered as one comparable row. The column choice is the subtlety — unit_price on order_items is what the checkout actually charged per unit, while the products catalog only holds today's list tag. The baseline lands at 14.28 on the floor and 209.68 on the ceiling: a fourteen-fold spread between the cheapest line rate and the dearest. That spread is the review's opening fact — the checkout has already priced everything from accessory territory into premium territory, so the question isn't whether the range exists but whether each shelf sits where it should.",
  },
  {
    id: "cs-224",
    tier: "easy",
    topic: "l7",
    universe: "inventory",
    title: "Units on the Electronics wall",
    brief:
      "From: Warehouse ops manager. Re: cycle count, Electronics wall.\n\nThe count team starts on the Electronics wall and wants one carrying number: total units across that shelf's SKUs, summed from the catalog. Three SKUs sit there — I need the combined depth, not a per-SKU breakdown, before the team walks over.",
    ask: "The sum of stock across products in the Electronics category.",
    template: `SELECT {1}(stock) AS units
FROM {2}
WHERE {3} = 'Electronics';`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the total aggregate",
        why: "Combined depth means every qualifying shelf count added together: SUM. COUNT would answer how many SKUs (3), not how many units.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the catalog table",
        why: "Shelf depth lives in products.stock. order_items has no stock column at all — it records what sold, not what sits on the shelf.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "the shelf column",
        why: "The wall is defined by category = 'Electronics'. Filtering on name would compare product names to the word Electronics and count nothing.",
      },
    ],
    distractors: ["COUNT", "AVG", "MAX", "MIN", "order_items"],
    walkthrough:
      "One aggregate over a filtered slice: WHERE pins the three Electronics SKUs, then SUM(stock) adds their shelf counts into one carrying number. The choice between aggregates is the lesson — COUNT would say 3 (three SKUs), AVG would say roughly 168 per SKU, MAX the single deepest bin at 300 — but the team walks with units, so SUM is the only right call. The wall carries 505 units: 120 keyboards plus 300 mice plus 85 hubs. One number on the count sheet, three bins behind it, and the runners-up tell the spread: deepest bin 300, shallowest 85. Team walks over knowing the wall's total weight.",
  },
  {
    id: "cs-225",
    tier: "easy",
    topic: "l5",
    universe: "funnel",
    title: "Where the funnel opened",
    brief:
      "From: Growth marketing lead. Re: funnel anniversary deck.\n\nThe deck opens on the origin story: the first three orders ever booked, ids and dates, oldest at the top. Sort ascending on booking date and stop at three — the funnel's opening week, nothing more.",
    ask: "The id and created_at of the three earliest orders, oldest first.",
    template: `SELECT id, created_at
FROM orders
ORDER BY created_at {1}
{2} {3};`,
    slots: [
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "Oldest first is ascending: the earliest date on top. DESC would open the deck on last month's orders and ruin the origin story.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the row cap",
        why: "LIMIT trims the result after sorting, so the three rows kept are genuinely the three earliest — the cap applies to the sorted list, not a random slice.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the cap size",
        why: "The slide is built for three bookings — the opening week's shape. A cap of 1 would flatten the story to a single date.",
      },
    ],
    distractors: ["DESC", "OFFSET", "1", "BY"],
    walkthrough:
      "The origin story is an ascending sort plus a cap: ORDER BY created_at ASC puts January 2024 on top, LIMIT 3 stops the list before the funnel gets going. Direction first, cut second — swap to DESC and the deck opens on 2025 instead of 2024, the exact opposite of the brief. The three rows: order 6 booked 2024-01-01, then orders 5 and 7 both on 2024-01-02 — day one and day two of the ledger, ids 6, 5, 7. Three rows, three dates, all within 24 hours of each other: the funnel didn't open slowly, it opened on a weekend, and that's the slide.",
  },
  {
    id: "cs-226",
    tier: "easy",
    topic: "l7",
    universe: "supplier",
    title: "The bench's mean score",
    brief:
      "From: Supply-chain lead. Re: annual vendor scorecard.\n\nThe scorecard's summary line is one number: the average rating across the whole vendor bench, all six suppliers, no filters. Print it to two decimals so the scorecard footer matches the dashboard format exactly.",
    ask: "The average rating across all suppliers, rounded to 2 decimals.",
    template: `SELECT {1}(rating) {2} avg_rating
FROM {3};`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean aggregate",
        why: "A mean score is AVG's job: ratings added, divided by count. MAX would crown the best vendor's score as the bench average and flatter the whole bench.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the rename keyword",
        why: "AS labels the output avg_rating — the footer field the scorecard template maps on. Without it the header is the raw expression.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "the bench table",
        why: "Vendor ratings live on suppliers.rating. products has no rating column at all, so that fill fails before averaging anything.",
      },
    ],
    distractors: ["SUM", "MAX", "MIN", "COUNT", "products"],
    walkthrough:
      "The summary line is a textbook mean: AVG(rating) over the unfiltered bench — no WHERE, because the scorecard grades every vendor, not just the good ones. The alias labels the footer field, and the unrounded mean is exactly 4.3. The distractors map to wrong answers the scorecard has seen before: MAX prints 4.8 (Alpine's score, not the bench's), MIN 3.9, COUNT 6, SUM 25.8 — each one a number that looks plausible in a footer and means something else. Six suppliers, ratings from 3.9 to 4.8, averaging 4.3: a solid bench with a real spread, which is the sentence the scorecard's summary line exists to support.",
  },
  {
    id: "cs-227",
    tier: "easy",
    topic: "l5",
    universe: "expense",
    title: "Batch two, smallest tickets first",
    brief:
      "From: Ops finance, spend control.\n\nThe small-ticket audit works in batches of five, smallest order values first. Batch one is done; pull batch two — the next five smallest after those. Same sort, skip the first five rows, hand me ids and values.",
    ask: "The id and total of orders ranked 6th to 10th smallest by total.",
    template: `SELECT id, total
FROM orders
ORDER BY total {1}
LIMIT 5 {2} {3};`,
    slots: [
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "Smallest first is ascending — the batch order the audit works in. DESC would serve the five biggest tickets as 'small' and fail the audit instantly.",
      },
      {
        answer: "OFFSET",
        kind: "keyword",
        label: "the skip clause",
        why: "OFFSET 5 discards the first five sorted rows — batch one — before LIMIT 5 hands over the next five. Without the skip you'd re-audit batch one.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the skip count",
        why: "Batch one took five rows, so the skip is exactly 5. Skipping 10 would jump past batch two entirely and audit batch three by mistake.",
      },
    ],
    distractors: ["DESC", "LIMIT", "10", "BY"],
    walkthrough:
      "Pagination is sort, skip, take — in that order. ORDER BY total ASC lines the ledger up smallest first, OFFSET 5 discards batch one, LIMIT 5 takes the next five: rows six through ten of the ranking. The two numbers mean different things — the first 5 is the page size, the second 5 is how many pages went before this one. Batch two reads: order 93 at 45.36, order 9 at 46.67, order 29 at 49.92, order 30 at 56.19, order 41 at 67.25. Batch one ended at 44.48 (order 59), so the handoff is seamless — the audit walks the whole small-ticket tail five rows at a time without repeating or skipping a single order.",
  },
  {
    id: "cs-228",
    tier: "easy",
    topic: "l1",
    universe: "growth",
    title: "The dormant account's record",
    brief:
      "From: Chief of Staff. Re: churn-risk appendix.\n\nThe appendix carries a full record card for account 11 — one of the flagged dormant accounts. Pull that row's name, city and region from the CRM so the card matches the system of record exactly. One row, three fields, keyed by the account's id.",
    ask: "The name, city and region of the customer whose id is 11.",
    template: `SELECT name, city, {1}
FROM {2}
WHERE id = {3};`,
    slots: [
      {
        answer: "region",
        kind: "keyword",
        label: "the market field",
        why: "The card tracks which market the dormant account sits in, and region carries EU/US/APAC/LATAM. id is the lookup key itself, not a field to print twice.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the CRM table",
        why: "Account records live in customers, keyed by id. orders has no name or region column — it's the transaction ledger, not the CRM.",
      },
      {
        answer: "11",
        kind: "number",
        noVerify: true,
        label: "the account key",
        why: "The flagged account is id 11 — the primary key pinned with equality. The tempting 12 would pull a different account's card entirely.",
      },
    ],
    distractors: ["email", "city", "orders", "12"],
    walkthrough:
      "A record card is a key lookup: name the table (customers, the CRM), pin its primary key (id = 11), project the three fields the card prints. The id is the whole addressing scheme — primary keys are unique, so exactly one row comes back, and there's no need to sort or filter further. Account 11 is Keiko Sato, Nagoya, APAC — dormant, sitting in the APAC market, which is the note the churn review cares about. The classic slip is keying on 12 and shipping Liam O'Brien's card under Keiko's tab; the second is pulling from orders, which has transactions but no account fields. One row, three fields, system of record quoted exactly.",
  },
  {
    id: "cs-229",
    tier: "easy",
    topic: "l7",
    universe: "fraud",
    title: "The biggest ticket still uncaptured",
    brief:
      "From: Risk team, spot-check rotation.\n\nPayment capture holds on pending orders, so the exposure question is: what's the largest pending ticket on the books right now? One number, the biggest total among orders still in pending status — that's the ceiling on what could still bounce.",
    ask: "The maximum total across orders whose status is pending.",
    template: `SELECT {1}(total) {2} biggest_pending
FROM orders
WHERE status = {3};`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling aggregate",
        why: "The largest single ticket is MAX over the totals. SUM would report the whole pending pipeline's worth, not the biggest bite any one bounce could take.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the rename keyword",
        why: "AS names the cell biggest_pending so the risk dashboard maps the figure. Without it the header is the raw aggregate expression.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the status value",
        why: "Pending is a status value, so it wears quotes: status = 'pending'. Unquoted it reads as a column name; 'shipped' would measure tickets that already left.",
      },
    ],
    distractors: ["SUM", "AVG", "MIN", "'shipped'", "IS"],
    walkthrough:
      "Exposure ceilings are MAX over a filtered slice: WHERE status = 'pending' keeps the fourteen uncaptured tickets, MAX(total) reports the largest. The aggregate is where the risk story lives — SUM would give the 6,113 pipeline total, MIN the smallest 148.28 ticket, and neither says what one bounce could cost. The figure: 1,088.44, and it's order 74, the same booking that tops the whole ledger — the single largest order on the books is still sitting uncaptured. Run the same query against 'shipped' and the ceiling drops to 845.92, which is the number the risk team stops worrying about. One cell: the bounce scenario, priced.",
  },
];
