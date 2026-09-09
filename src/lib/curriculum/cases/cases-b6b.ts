// Batch B6b — topic l6 (DISTINCT): deduped lists and counts of unique values.
// Authored against scripts/facts/l6.json figures; audited by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesB6b: CaseStudy[] = [
  {
    id: "cs-129",
    tier: "medium",
    topic: "l6",
    universe: "month-close",
    title: "Months in the closing binder",
    brief:
      "From: Financial Controller. Re: Q1 close prep.\n\nBefore I bind the closing documentation I want the exact window our order ledger actually covers — every month in which at least one order was booked, without repeats, oldest first. The raw export repeats the booking month on every order line, so hand me the clean span, not the raw dump.",
    ask: "List each different booking month (YYYY-MM) that has at least one order, sorted oldest to newest.",
    template: `SELECT {1} strftime('{2}', created_at) {3} month
FROM orders
{4} BY month;`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the dedupe keyword",
        why: "DISTINCT collapses the order rows into one row per unique month — exactly the without-repeats span the controller asked for. Without it (or with ALL) the list repeats every month once per order and the binder span looks inflated.",
      },
      {
        answer: "%Y-%m",
        kind: "keyword",
        label: "the month format",
        why: "The binder labels months as YYYY-MM, so the format string is %Y-%m. The tempting %Y alone would merge everything into just two rows (2024, 2025), and %m would blur the two years together.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the column rename",
        why: "AS names the computed value month so the binder column reads cleanly; without it the header would be the raw strftime(...) expression text, which nobody wants in a signed document.",
      },
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the sort clause",
        why: "A closing binder reads chronologically, so ORDER BY month runs 2024-01 first and 2025-02 last. HAVING or GROUP here would try to filter or bucket rows and break the statement outright.",
      },
    ],
    distractors: ["ALL", "%Y", "%m", "%d"],
    walkthrough:
      "The controller wants the ledger's true span, and the raw table repeats the booking month on every one of the 103 orders — so grabbing created_at bare would hand her a 103-line list instead of a calendar. DISTINCT is the dedupe here, and because the deliverable is a span rather than a headcount, it stays a plain DISTINCT list rather than a count of unique values. strftime('%Y-%m', created_at) trims each timestamp down to its month label, and ORDER BY month lines the binder up chronologically. The result is 14 rows: 2024-01 through 2024-12, then 2025-01 and 2025-02 — fourteen consecutive months of bookings from January 2024 to February 2025. Worth noting in the binder: the window is contiguous, so no month needs an explanatory footnote for going dark.",
  },
  {
    id: "cs-130",
    tier: "medium",
    topic: "l6",
    universe: "growth",
    title: "Cities on the board map",
    brief:
      "From: Chief of Staff. Re: board deck, market slide.\n\nDesign is drawing a pin map of where our customers actually live, and the caption needs one number: how many different cities we're in. The customer export repeats cities all over the place, so count unique cities only — one pin per city, not per customer.",
    ask: "How many different cities do our customers live in?",
    template: `SELECT {1}(DISTINCT {2}) {3} cities
FROM customers;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting wrapper",
        why: "The deliverable is one number — how many — so COUNT wraps the unique list. SUM or AVG would attempt arithmetic on city names, and MAX would return the last city alphabetically instead of a tally.",
      },
      {
        answer: "city",
        kind: "keyword",
        label: "the city column",
        why: "Cities live in customers.city. The tempting neighbor region would count regional markets instead of cities, and the headline would quietly shrink from 16 to 4 — a very different map.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the caption alias",
        why: "AS renames the tally to cities so the slide caption exports with a readable header instead of the raw COUNT(DISTINCT city) expression text.",
      },
    ],
    distractors: ["SUM", "MAX", "AVG", "region"],
    walkthrough:
      "This is the classic 'how many different X' shape: a count of unique values. COUNT(DISTINCT city) does both jobs in one breath — it first collapses the customer list to unique cities, then tallies them, landing on 16. Plain COUNT(city) would also have said 16 here, but only by luck: this dataset happens to place every customer in a different city, so row count and unique count coincide — on any other dataset the missing DISTINCT would overcount, which is exactly why the habit matters. The result cell reads 16, and the map gets sixteen pins: Austin, Berlin, Chicago and the rest, from São Paulo up to Tallinn. One caveat for the deck: this is customers on file, not live accounts — Tallinn and Nagoya are the two inactive ones, so the pin map is a footprint, not an active-base map.",
  },
  {
    id: "cs-131",
    tier: "medium",
    topic: "l6",
    universe: "refund-audit",
    title: "States an order can be stuck in",
    brief:
      "From: refunds@ internal ticket #5187.\n\nWe're rebuilding the support triage doc, and step one is the canonical set of order states our system can report — agents keep guessing at free-text statuses and routing refunds wrong. Pull the states straight from the order ledger, without repeats, alphabetized so the doc reads cleanly.",
    ask: "List each different order status, alphabetized, no repeats.",
    template: `SELECT {1} {2}
FROM {3}
ORDER BY status;`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the dedupe keyword",
        why: "All 103 orders carry a status, so a bare list would print the same four values over and over; DISTINCT boils the repeats down to one row per unique state — the vocabulary the doc needs.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the status column",
        why: "The triage doc is about order states, and that lives in orders.status. The tempting customer_id would produce a list of buyer ids instead — sixteen rows about people and none about states.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Statuses are stamped on orders. The products table has no status column at all, so that substitution errors before returning a single row — a loud failure, but still a failure.",
      },
    ],
    distractors: ["ALL", "HAVING", "customer_id", "products", "'delivered'"],
    walkthrough:
      "Support wants the vocabulary, not the volume — so this is a DISTINCT list, not a count. The orders table stamps a status on all 103 rows but only ever uses four values; DISTINCT squeezes those repeats into the canonical set and ORDER BY status alphabetizes it for the doc. The result comes back as four rows: cancelled, delivered, pending, shipped. Two habits worth keeping: alphabetizing a reference list makes drift visible the moment someone reviews it, and pulling the list from the live table — rather than typing it from memory — means the triage doc can never disagree with the data. If a fifth state ever appears, this same query surfaces it the instant the first order is booked into it.",
  },
  {
    id: "cs-132",
    tier: "medium",
    topic: "l6",
    universe: "pricing",
    title: "Shelves carrying premium price tags",
    brief:
      "From: Head of Product. Re: premium repositioning.\n\nWe're building the premium story on shelves that already carry three-digit price tags. Before the workshop I need the size of that footprint: across everything priced above 100, how many different categories are actually represented? One number for the kickoff slide, please.",
    ask: "How many different categories have at least one product priced above 100?",
    template: `SELECT {1}(DISTINCT {2}) {3} premium_shelves
FROM {4}
WHERE price > {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting wrapper",
        why: "The ask is 'how many categories' — one number — so COUNT wraps the deduped category list. SUM or AVG would attempt arithmetic on category names and come back with zero or nothing.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "the category column",
        why: "The unit is the shelf, and shelves are products.category. The decoy name would count individual premium products (there are 4) instead of the shelves they sit on — 4 products, but only 3 different categories.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the slide alias",
        why: "AS labels the tally premium_shelves so the slide cell exports with a human header; without it the spreadsheet shows the raw COUNT(DISTINCT category) expression text.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the source table",
        why: "Price tags and categories sit side by side in products. Any transaction table would lack one of those two columns and the statement would fail before producing the number.",
      },
      {
        answer: "100",
        kind: "number",
        label: "the premium threshold",
        why: "Premium is defined as priced above 100 — strictly greater, so an item at exactly 100.00 misses the cut. Dropping to 50 sweeps in mid-shelf goods and inflates the answer to 5 shelves.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "AVG", "name", "id", "150", "50"],
    walkthrough:
      "The brief asks how many different shelves carry a three-digit tag — a count of unique categories, so COUNT(DISTINCT category) is the whole trick, with WHERE price > 100 shrinking the population first. Order of operations is the quiet lesson: the filter runs before the dedupe, so only premium items vote on which shelves count. The answer is 3 — Audio, Video and Wearables. The near-miss is worth naming in the workshop: four individual products clear the bar (the headset, the desktop mic, the webcam, the smart watch), but the headset and mic share the Audio shelf, so product count and shelf count genuinely diverge — and that divergence is precisely the job DISTINCT does. Raise the bar to 150 and only Wearables survives, which is a different slide entirely.",
  },
  {
    id: "cs-133",
    tier: "medium",
    topic: "l6",
    universe: "fraud",
    title: "Accounts behind the big tickets",
    brief:
      "From: Risk team, spot-check rotation.\n\nBefore we pull full records for the manual-review queue, the lead wants a sense of breadth: of the orders over 500, how many different accounts are actually behind them? A handful of repeat buyers placing the big tickets is a very different conversation from dozens of one-off accounts.",
    ask: "How many different customers placed orders with a total greater than 500?",
    template: `SELECT {1}(DISTINCT {2}) AS accounts
FROM {3}
WHERE total > {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting wrapper",
        why: "'How many different accounts' is a tally of unique ids — COUNT(DISTINCT …). SUM would add the id numbers together and return a figure that looks numeric and means nothing.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the account column",
        why: "The unit of interest is the account, referenced by orders.customer_id. The decoy id counts individual orders instead — 25 orders clear the 500 bar but only 10 accounts placed them, so the swap would overstate breadth two-and-a-half times.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Order totals live on orders. order_items holds per-line pieces with no total column at all, so the WHERE clause would have nothing to compare against and the query would fail.",
      },
      {
        answer: "500",
        kind: "number",
        label: "the review threshold",
        why: "This cycle's review bar is 'over 500' — strictly greater, so a ticket at exactly 500.00 stays out. Loosening to 300 widens the sweep to 16 accounts and buries the reviewers in borderline tickets.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "AVG", "id", "total", "300"],
    walkthrough:
      "Two nets in sequence: WHERE total > 500 keeps only the big tickets, then COUNT(DISTINCT customer_id) collapses those orders to unique buyers so a repeat customer counts once, not per order. The result is 10 — ten different accounts sit behind the big-ticket queue. The distinction doing the work here is breadth versus volume: 25 orders clear the bar, but they come from those 10 accounts, and the decoy id column would have reported the 25 and doubled the apparent spread. For the rotation that concentration is useful news — ten records to pull, and if the same names keep recurring across cycles, the spot-check turns into a watchlist. Swap the threshold to 300 and the account count jumps to 16, which is exactly why the bar belongs to policy, not to the query author.",
  },
  {
    id: "cs-134",
    tier: "medium",
    topic: "l6",
    universe: "inventory",
    title: "Who stocks the Audio aisle",
    brief:
      "From: Warehouse ops manager. Re: cycle count, Audio aisle.\n\nCycle count week starts with the Audio aisle because it's our highest-value shelf. Before the team walks the floor I need the partner list for that aisle alone: which supplier ids stand behind Audio products, without repeats, so receiving knows exactly who to call on any discrepancy they find.",
    ask: "List the different supplier ids behind Audio-category products, sorted smallest to largest.",
    template: `SELECT {1} {2}
FROM products
WHERE {3} = {4}
ORDER BY supplier_id;`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the dedupe keyword",
        why: "The deliverable is a partner list, not a product list — if a supplier stocked two items in this aisle, a bare column would name them twice. DISTINCT guarantees one row per supplier no matter how many SKUs they feed.",
      },
      {
        answer: "supplier_id",
        kind: "keyword",
        label: "the partner column",
        why: "Products are stamped with supplier_id, which is the call-list key. The decoys stock and price would list shelf counts or tag values — plausible-looking numbers that name no partner at all.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "the aisle filter",
        why: "The aisle is defined by category, the shelf a product sits on. Filtering on stock = 'Audio' matches nothing — stock holds counts, not names — and would empty the list entirely.",
      },
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "the aisle value",
        why: "The aisle is named Audio, and as a value it wears quotes: category = 'Audio'. The bare word would be read as a column reference and the statement would fail on the spot.",
      },
    ],
    distractors: ["stock", "price", "'Electronics'", "'Video'", "HAVING"],
    walkthrough:
      "A filtered distinct list, in that order: WHERE category = 'Audio' first isolates the aisle's products — the noise-canceling headset, the studio desktop mic, the bluetooth speaker mini — then DISTINCT supplier_id flattens their supplier stamps into unique partners and ORDER BY lines them up for the call sheet. The result is three rows: supplier ids 4, 5 and 6 — Midwest Hardware Co, Alpine Audio GmbH and Andes Naturals SA. For receiving that's a tidy picture: the aisle is single-sourced per product but triple-sourced overall, so a discrepancy on any one SKU only ever triggers one supplier call. And notice the quoted value doing the scoping — swap 'Audio' for 'Electronics' and the same query hands you a different aisle's partners, which is why the aisle name belongs in quotes as data.",
  },
  {
    id: "cs-135",
    tier: "medium",
    topic: "l6",
    universe: "funnel",
    title: "Catalog breadth that actually sold",
    brief:
      "From: Growth marketing lead. Re: activation deep-dive.\n\nI keep seeing '16 products' in the deck, but stocking a catalog isn't selling one. For the activation slide I need the sell-through number: how many different products have actually appeared on an order line? If every SKU has moved at least once, breadth is a solved problem; any gap becomes a merchandising action item.",
    ask: "How many different products have appeared on at least one order line?",
    template: `SELECT {1}(DISTINCT product_id) {2} sold_products
FROM {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting wrapper",
        why: "The ask is a single sell-through number, so COUNT wraps the unique product list. SUM would add the product ids together (1+2+…+16 = 136) and report a value that looks plausible and means nothing.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the slide alias",
        why: "AS renames the tally to sold_products for the slide; without it the column header exports as the raw COUNT(DISTINCT product_id) expression text.",
      },
      {
        answer: "order_items",
        kind: "keyword",
        label: "the proof-of-sale table",
        why: "A product 'has sold' when it appears on an order line, and lines live in order_items. The products table would count stock-on-file — also 16, but for the opposite reason — and orders carries no product_id at all.",
      },
    ],
    distractors: ["SUM", "MIN", "AVG", "customers", "orders"],
    walkthrough:
      "Activation thinking treats the catalog as a funnel stage of its own: of everything we stock, how many different SKUs have ever appeared on an order line. order_items is the proof-of-sale table — one row per line sold — so COUNT(DISTINCT product_id) collapses those lines to unique products and tallies them: 16. Every single product in the catalog has sold at least once, so sell-through breadth is 16 of 16 and the merchandising gap the lead feared doesn't exist. The nuance worth saying out loud: the same number falls out of the products table, but that's stock on file, not sales — proof of purchase only lives in order_items. And this is where COUNT(DISTINCT) earns its keep over a plain count of rows: many lines, few products, and only the deduped version reports the truth.",
  },
];
