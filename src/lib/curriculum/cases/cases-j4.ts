// Case batch J4 — Module 2 (joins) cases cs-451…cs-500.
// 50 cases: 16 easy / 17 medium / 17 hard. Topic spread j1×4, j2×7, j3×6,
// j4×7, j5×6, j6×5, j7×8, j8×7. Figures probed on the live seed db and
// mechanically audited by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesJ4: CaseStudy[] = [
  {
    id: "cs-451",
    tier: "easy",
    topic: "j1",
    universe: "supplier",
    title: "Cheap and well-made",
    brief:
      "From: Procurement lead. Re: the value shortlist.\n\nThe value shortlist: products priced at 50.00 or under whose supplier rates 4.0 or better. Join the catalog to its makers, apply both pins, cheapest thinking last — price order. Five rows expected.",
    ask: "Products ≤ 50.00 from suppliers rated ≥ 4.0: name, price, rating — cheapest first.",
    template: `SELECT p.name, p.price, s.rating
FROM products p
JOIN suppliers s ON {1}
WHERE p.price <= {2} AND s.rating >= {3}
ORDER BY p.price;`,
    slots: [
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the join condition",
        why: "products.supplier_id → suppliers.id brings the rating. s.id = p.id pairs supplier ids with product ids by coincidence.",
      },
      {
        answer: "50",
        kind: "number",
        label: "the price ceiling",
        why: "'50.00 or under' is price <= 50. At 500 the ceiling filters nothing and the shortlist loses its point.",
        noVerify: true,
      },
      {
        answer: "4",
        kind: "number",
        label: "the rating floor",
        why: "'4.0 or better' is rating >= 4 — Andes' 4.0 squeaks in, Pacific's 3.9 just misses. At 4.9 only Alpine survives.",
        noVerify: true,
      },
    ],
    distractors: ["s.id = p.id", "500", "4.9"],
    walkthrough:
      "The value shortlist: two pins on a real join. Run it and five products qualify — HDMI 14.99, Socks 18.50, Desk Mat 24.99, Yoga Mat 32.00, Ring Light 39.99 — each from a supplier rated 4.0 or better (Shenzhen ×2, Alpine, Midwest). The hub misses at 3.9 by a tenth — the floor doing its job. The 500 distractor isn't wrong arithmetic, it's no filter at all: a shortlist of sixteen rows that forgot to be short.",
  },
  {
    id: "cs-452",
    tier: "easy",
    topic: "j1",
    universe: "growth",
    title: "The US book, counted",
    brief:
      "From: Head of Growth. Re: the regional headline.\n\nThe deck's US headline needs its order count — joined to the region so the count is unmistakably the US book. One number, pinned region, quoted literal.",
    ask: "Count of orders belonging to US customers.",
    template: `SELECT {1}(o.id) AS us_orders
FROM orders o
JOIN customers c ON {2}
WHERE c.region = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A headline count: COUNT(o.id). SUM would add order ids — bookkeeping where a headcount belongs.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "'US'",
        kind: "keyword",
        label: "the region literal",
        why: "Region codes are stored uppercase: 'US'. The lowercase 'us' matches nothing and the headline prints zero.",
      },
    ],
    distractors: ["SUM", "o.id = c.id", "'LATAM'"],
    walkthrough:
      "The regional headline: real join, region pin, count. Run it and the US book reads 19 orders — Jamal Wright's 2 and Emma Wilson's 17, the whole two-customer market. The 'LATAM' distractor returns 2 under the US headline — a true number for the wrong region, the kind of swap that survives a slide review because both look plausible. Region literals are checked against the schema, not the ear.",
  },
  {
    id: "cs-453",
    tier: "medium",
    topic: "j1",
    universe: "expense",
    title: "The open-paper owners",
    brief:
      "From: Spend analyst. Re: who's holding open paper.\n\nThe collections email list starts here: owners of OPEN invoices, joined from billing to accounts, alphabetical. Six names expected — the list the mail-merge eats.",
    ask: "Owners of open invoices: name and invoice count, alphabetical.",
    template: `SELECT c.name, COUNT(i.id) AS open_invoices
FROM customers c
JOIN invoices i ON {1}
WHERE i.status = {2}
GROUP BY c.id
ORDER BY {3}, c.name;`,
    slots: [
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real ownership thread: invoices.customer_id → customers.id. i.number = c.name compares invoice codes to people.",
      },
      {
        answer: "'open'",
        kind: "keyword",
        label: "the status literal",
        why: "The list targets 'open' paper — quoted text. 'paid' would list settled accounts nobody needs to email.",
      },
      {
        answer: "c.name",
        kind: "keyword",
        label: "the mail-merge sort",
        why: "'Alphabetical' sorts by the owner's name. Sorting by i.number would order the list by invoice code instead.",
      },
    ],
    distractors: ["c.email", "c.region", "c.city"],
    walkthrough:
      "The mail-merge list: real ownership join, the 'open' pin, alphabetical by owner. Run it and six names surface — Alice Chen, Chloe Dubois, Emma Wilson, Isabella Rossi, Liam O'Brien, Pedro Alvarez — each holding one open invoice. The join exists because billing knows the paper but not the person: without the customer hop, the list is numbers without recipients. The i.status distractor sorts by claim instead of name — a real ordering that breaks the merge template.",
  },
  {
    id: "cs-454",
    tier: "hard",
    topic: "j1",
    universe: "pricing",
    title: "The list-vs-realized discount",
    brief:
      "From: Pricing committee. Re: how much the street pays under list.\n\nBefore the price book refresh: which products actually transact UNDER list, and by how much in total? Sum (list − realized) × quantity per product — list price from the catalog, realized from the line — keep only products with a positive gap, biggest giveaway first, top five.",
    ask: "Top 5 products by total discount given: Σ quantity × (list − realized), where the gap is positive.",
    template: `SELECT p.name, ROUND(SUM(oi.quantity * (p.{1} - oi.unit_price)), 2) AS discount_given
FROM order_items oi
JOIN products p ON {2}
GROUP BY p.id
{3} SUM(oi.quantity * (p.price - oi.unit_price)) > 0
ORDER BY discount_given {4}
LIMIT {5};`,
    slots: [
      {
        answer: "price",
        kind: "keyword",
        label: "the list column",
        why: "List price lives on the product: p.price. There is no p.unit_price — the transacted price belongs to the LINE.",
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.product_id → products.id pairs each line with its catalog entry. p.id = oi.order_id pairs products with order numbers.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the positive-gap gate",
        why: "The 'positive gap' test filters a per-group SUM — HAVING after GROUP BY. WHERE errors on aggregates.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The committee reviews the biggest giveaways first — the discount ledger opens on the product where list and street diverge most.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the review cap",
        why: "The committee reviews five: LIMIT 5. At 16 it reviews the whole catalog.",
        noVerify: true,
      },
    ],
    distractors: ["unit_price", "p.id = oi.order_id", "WHERE", "ASC", "16"],
    walkthrough:
      "The giveaway audit: per product, Σ quantity × (list − realized), positive gaps only, biggest first. The expression's two price columns come from different tables — list from products, realized from the line — which is exactly why the join must be the real key: swap either column's source and the 'discount' becomes arithmetic noise. Run it and the top of the list shows where the street consistently undercuts list (the yoga mat transacts at 31.02 against a 32.00 list; the headset's lines run under 149.99). HAVING keeps zero-gap products out of the review; WHERE can't even see the sum.",
  },
  {
    id: "cs-455",
    tier: "easy",
    topic: "j2",
    universe: "inventory",
    title: "Audio's line depth",
    brief:
      "From: Inventory control. Re: the premium category's shelf work.\n\nFor the cycle count: how many order LINES does each Audio product sit on? Lines joined to products, pinned to the 'Audio' category, deepest first. The total should read 51 — verify the split adds to it.",
    ask: "Line count per Audio product, deepest first.",
    template: `SELECT p.name, {1}(oi.id) AS lines
FROM order_items oi
JOIN products p ON {2}
WHERE p.category = {3}
GROUP BY p.id
ORDER BY lines {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the line counter",
        why: "Shelf work is lines: COUNT(oi.id). SUM would add line ids — ids aren't work.",
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.product_id → products.id attaches the category. p.id = oi.order_id pairs catalog ids with order numbers.",
      },
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "the category literal",
        why: "Categories are stored as written: 'Audio'. The lowercase 'audio' matches nothing and the page prints empty.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Deepest first: DESC. ASC would open on the quietest Audio product.",
      },
    ],
    distractors: ["SUM", "p.id = oi.order_id", "'audio'", "ASC"],
    walkthrough:
      "The premium category's work split: lines bucketed per Audio product through the real key. Run it and the three Audio products divide the category's 51 lines among the headset, mic and speaker — the split the cycle count walks. The 'audio' distractor is the case-sensitivity tax again: zero rows, empty page, no error. And the SUM-in-COUNT-slot would add line ids into a number that looks like work but counts nothing.",
  },
  {
    id: "cs-456",
    tier: "easy",
    topic: "j2",
    universe: "expense",
    title: "The card rail's first page",
    brief:
      "From: Spend analyst. Re: the card audit's opening page.\n\nThe card-rail audit opens with the five most recent card payments, each naming its invoice. Real join, method pin, date sort, page cap. The audit walk starts at the top.",
    ask: "The 5 most recent card payments with their invoice numbers.",
    template: `SELECT i.number, p.paid_on
FROM payments p
JOIN invoices i ON {1}
WHERE p.method = {2}
ORDER BY p.paid_on {3}
LIMIT {4};`,
    slots: [
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id names the paper. Matching p.invoice_id to i.number compares a number to text.",
      },
      {
        answer: "'card'",
        kind: "keyword",
        label: "the method literal",
        why: "The audited rail is 'card' — quoted text. 'wire' would audit the other 11 payments instead.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the recency sort",
        why: "'Most recent first' is descending on paid_on. ASC would open the audit with the oldest swipe.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the page cap",
        why: "The opening page carries five: LIMIT 5. At 16 the 'opening page' is the whole rail.",
        noVerify: true,
      },
    ],
    distractors: ["p.invoice_id = i.number", "'wire'", "ASC", "16"],
    walkthrough:
      "The audit's opening page: the card rail, date-sorted down, capped at five, every row naming its invoice through the real key. Run it and the walk starts on the five most recent card settlements. The method pin does the slicing — 16 card payments out of 27 — and the cap keeps the page a page. The i.number join distractor zeroes the page silently; the audit would open on nothing and someone would conclude the card rail is quiet.",
  },
  {
    id: "cs-457",
    tier: "medium",
    topic: "j2",
    universe: "month-close",
    title: "The three-plus billing club",
    brief:
      "From: Financial Controller. Re: the repeat-billing cohort.\n\nThe close's relationship note lists customers holding three or more invoices. Count per account, HAVING at three, deepest first with the alphabetical tiebreaker. Expect five names.",
    ask: "Customers with 3+ invoices: name and count, count descending then name.",
    template: `SELECT c.name, COUNT(i.id) AS invoices
FROM customers c
JOIN invoices i ON {1}
GROUP BY c.id
{2} COUNT(i.id) >= {3}
ORDER BY invoices {4}, c.name;`,
    slots: [
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real ownership thread: invoices.customer_id → customers.id. i.number = c.name compares codes to people.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the cohort gate",
        why: "The three-invoice floor filters a COUNT per account — HAVING after GROUP BY. WHERE errors on aggregates.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the cohort floor",
        why: "The club starts at three invoices. At 4 only Alice survives and the note loses its cohort.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Deepest relationship first, ties alphabetical: DESC then name.",
      },
    ],
    distractors: ["i.number = c.name", "WHERE", "4", "ASC"],
    walkthrough:
      "The repeat-billing club: count per account, HAVING at three, stable two-key sort. Run it and five names file out — Alice 5, Emma 4, Maya 4, Grace 3, Isabella 3 — the book's billed-and-billed-again core. The floor is the story's dial: at 4 the club shrinks to Alice alone; the note's tone changes with one digit. WHERE can't run the floor at all — the count doesn't exist before grouping.",
  },
  {
    id: "cs-458",
    tier: "medium",
    topic: "j2",
    universe: "funnel",
    title: "Alice's baskets, biggest first",
    brief:
      "From: Marketing lead. Re: the whale's basket profile.\n\nThe Alice case study needs her basket profile: line count per order across her 24-order book, biggest baskets first, top three. Her known four-line opener (order 1) should be in the running.",
    ask: "Alice Chen's 3 biggest orders by line count.",
    template: `SELECT o.id, COUNT(oi.id) AS lines
FROM customers c
JOIN orders o ON {1}
JOIN order_items oi ON {2}
WHERE c.name = {3}
GROUP BY o.id
ORDER BY lines {4}
LIMIT {5};`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the first join",
        why: "The account thread: orders.customer_id → customers.id. o.id = c.id would profile an id coincidence.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the second join",
        why: "The line grain arrives via order_items.order_id → orders.id. oi.id = o.id keeps coincidence lines.",
      },
      {
        answer: "'Alice Chen'",
        kind: "keyword",
        label: "the account literal",
        why: "The profile pins the account by name — quoted. A different name silently profiles someone else's baskets.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "'Biggest baskets first' is descending on lines.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the podium cap",
        why: "The profile shows three: LIMIT 3. At 24 it lists her whole book.",
        noVerify: true,
      },
    ],
    distractors: ["o.id = c.id", "oi.id = o.id", "'Emma Wilson'", "ASC", "24"],
    walkthrough:
      "The whale's basket profile: two real joins down to Alice's lines, bucketed per order, biggest first, capped at three. Run it and the profile shows her heaviest baskets — the four-line orders she's known for (order 1 among them) — out of 50 lines across 24 orders. The name pin matters more than the joins: swap it for Emma and the profile reads a different whale. Every case study gets its own literal; the query shape stays.",
  },
  {
    id: "cs-459",
    tier: "medium",
    topic: "j2",
    universe: "supplier",
    title: "The APAC product board",
    brief:
      "From: Supplier audit. Re: the region's product board.\n\nThe regional supply board for APAC: every product an APAC supplier places, with its total units sold, biggest mover first. Chain lines→products→suppliers, pin the region, six products expected.",
    ask: "Units sold per product from APAC suppliers, biggest first.",
    template: `SELECT p.name, SUM(oi.quantity) AS units
FROM order_items oi
JOIN products p ON {1}
JOIN suppliers s ON {2}
WHERE s.{3} = {4}
GROUP BY p.id
ORDER BY units {5};`,
    slots: [
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the first join (line→product)",
        why: "order_items.product_id → products.id names the thing sold. p.id = oi.order_id pairs products with order numbers.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the second join (product→supplier)",
        why: "products.supplier_id → suppliers.id attaches the vendor. s.region = p.category compares 'APAC' to 'Electronics'.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the pin column",
        why: "The board pins the vendor's region: s.region = 'APAC'. Pinning s.city matches nothing — suppliers have no city column.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the region literal",
        why: "Region codes are uppercase: 'APAC'. The lowercase 'apac' matches nothing and the board prints empty.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The board leads with its biggest mover — the HDMI cable's 38 units headline the regional supply story.",
      },
    ],
    distractors: ["p.id = oi.order_id", "s.region = p.category", "city", "'apac'", "ASC"],
    walkthrough:
      "The APAC board: two real joins, a region pin, units per product, biggest first. Run it and six products appear — the HDMI cable's 38 units leading the mouse's 36, ring light's 30, socks' 33 nearby — Shenzhen Electro and Pacific Textiles' joint shelf. The lowercase 'apac' is the silent empty board; the city distractor errors outright, which at least announces itself. Regional boards are how supply concentration gets managed before it becomes dependency.",
  },
  {
    id: "cs-460",
    tier: "hard",
    topic: "j2",
    universe: "catalog",
    title: "The five-thousand revenue floor",
    brief:
      "From: Catalog ops. Re: the earning-category schedule.\n\nThe catalog schedule keeps categories whose realized revenue clears 5,000 — Σ quantity × unit_price per category, HAVING at the floor, biggest first. The schedule's editorial claim: everything below the floor rolls up.",
    ask: "Categories with 5,000+ realized revenue (Σ quantity × unit_price), biggest first.",
    template: `SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON {1}
GROUP BY p.category
{2} SUM(oi.quantity * oi.unit_price) >= {3}
ORDER BY revenue {4};`,
    slots: [
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.product_id → products.id attaches the category. p.id = oi.order_id pairs catalog ids with order numbers.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the revenue gate",
        why: "The 5,000 floor filters a per-group SUM — HAVING after GROUP BY. WHERE errors on aggregates.",
      },
      {
        answer: "5000",
        kind: "number",
        label: "the schedule floor",
        why: "The schedule's floor is 5,000. At 6,000 Video's 5,198.41 drops out and the schedule loses a line.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest earner leads the schedule: DESC.",
      },
    ],
    distractors: ["p.id = oi.order_id", "WHERE", "6000", "ASC"],
    walkthrough:
      "The earning schedule: category revenue with a 5,000 floor. Run it and three categories clear it — Audio 11,744.01, Wearables 6,929.12, Video 5,198.41 — while Electronics (4,818.61) and the rest roll up. The floor is editorial: at 6,000 the schedule loses Video and reads as a two-line story. The WHERE distractor can't touch sums; the wrong-key join would schedule categories that never sold.",
  },
  {
    id: "cs-461",
    tier: "hard",
    topic: "j2",
    universe: "refund-audit",
    title: "Cancellation geography",
    brief:
      "From: Refunds desk. Re: where the cancellations live.\n\nThe goodwill budget maps by region: cancelled orders joined to their buyers' regions — count and exposure per region, biggest exposure first. Seven cancellations across three regions; LATAM's absence is itself the finding.",
    ask: "Per region: cancelled order count and exposure (Σ cancelled totals), biggest first.",
    template: `SELECT c.region, COUNT(o.id) AS cancelled, ROUND(SUM(o.total), 2) AS exposure
FROM customers c
JOIN orders o ON {1}
WHERE o.status = {2}
GROUP BY c.region
ORDER BY exposure {3};`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status literal",
        why: "The map targets the cancelled slice — quoted text. 'pending' would map the live pipeline's 6,113.00 instead.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The budget starts where the exposure is: DESC.",
      },
    ],
    distractors: ["o.id = c.id", "'pending'", "ASC"],
    walkthrough:
      "Cancellation geography: the seven cancellations bucketed by their buyers' regions. Run it and three rows map the exposure — APAC 513.81 (Farid's two small ones plus Maya's 397.99), EU 494.82 (Alice's three), US 143.86 (Emma's one) — and LATAM is absent: Bruno has never cancelled. The interesting read: EU has the most cancellation ORDERS but APAC carries the most money, because Maya's single big cancellation outscores Alice's three small ones. Counts and money disagree; the budget follows the money.",
  },
  {
    id: "cs-462",
    tier: "easy",
    topic: "j3",
    universe: "catalog",
    title: "Suppliers per category",
    brief:
      "From: Catalog ops. Re: the sourcing-breadth page.\n\nThe sourcing page: per category, how many DISTINCT suppliers place products in it? Two hops to the maker, distinct supplier counts, widest sourcing first. The page shows which categories depend on one vendor.",
    ask: "Count of DISTINCT suppliers per category, widest sourcing first.",
    template: `SELECT p.category, COUNT({1} s.id) AS suppliers
FROM products p
JOIN suppliers s ON {2}
GROUP BY p.category
ORDER BY suppliers {3};`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the supplier dedup",
        why: "Sourcing breadth counts VENDORS, not products: DISTINCT collapses each supplier's catalog to one entry. ALL would count products wearing a suppliers label.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the join condition",
        why: "products.supplier_id → suppliers.id names the maker. s.id = p.id pairs supplier ids with product ids.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Widest sourcing leads: DESC. ASC would open on the single-vendor dependency.",
      },
    ],
    distractors: ["s.missing", "s.id = p.id", "ASC"],
    walkthrough:
      "The sourcing-breadth page: DISTINCT supplier counts per category. Run it and Electronics, Audio and Accessories each source from three vendors, Video/Wearables/Apparel from two, and Fitness from ONE — the yoga mat is Midwest's alone, the page's dependency flag. The ALL distractor prints product counts (3, 3, 3…) under a suppliers heading — plausible, wrong grain, and exactly the mistake that hides single-vendor categories. Two hops, both real; the DISTINCT is the page's whole point.",
  },
  {
    id: "cs-463",
    tier: "easy",
    topic: "j3",
    universe: "funnel",
    title: "Buyers and boxes by region",
    brief:
      "From: Marketing lead. Re: the two-number regional split.\n\nThe regional split with both axes: distinct BUYERS and total UNITS per customer region. The chain runs to line grain; the buyer count stays deduped while the boxes sum. Biggest book first.",
    ask: "Per region: distinct buyer count and total units (Σ quantity), biggest units first.",
    template: `SELECT c.region, COUNT(DISTINCT c.id) AS buyers, SUM(oi.quantity) AS units
FROM customers c
JOIN orders o ON {1}
JOIN order_items oi ON {2}
GROUP BY c.region
ORDER BY units {3};`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the first join",
        why: "The account thread: orders.customer_id → customers.id. o.id = c.id fabricates a sixteen-row population.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the second join",
        why: "The line grain arrives via order_items.order_id → orders.id. oi.id = o.id keeps coincidence lines.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest box count leads: DESC on units.",
      },
    ],
    distractors: ["o.id = c.id", "oi.id = o.id", "ASC"],
    walkthrough:
      "The two-number split: EU 8 buyers moving 199 units, APAC 5 buyers moving 174, US 2 buyers moving 112, LATAM 1 buyer moving 13. The per-buyer intensity is the story the pair tells: US's two accounts average 56 units each — the densest books in the building — while EU's eight average 25. The DISTINCT keeps the buyer column honest over the fan-out; the units column sums where the boxes are. Two grains, one row, both real.",
  },
  {
    id: "cs-464",
    tier: "easy",
    topic: "j3",
    universe: "inventory",
    title: "Shelf value by category",
    brief:
      "From: Inventory control. Re: the capital-by-category page.\n\nThe capital page: shelf value (price × stock) summed per category, heaviest first. The join pre-builds next quarter's supplier-region column; today the buckets are categories.",
    ask: "Shelf value (Σ price × stock) per category, heaviest first.",
    template: `SELECT p.category, ROUND(SUM(p.price * p.stock), 2) AS shelf_value
FROM products p
JOIN suppliers s ON {1}
GROUP BY {2}
ORDER BY shelf_value {3};`,
    slots: [
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the join condition",
        why: "The real ownership join, pre-built for the region column: products.supplier_id → suppliers.id. s.id = p.id pairs ids by coincidence.",
      },
      {
        answer: "p.category",
        kind: "keyword",
        label: "the bucket key",
        why: "The page buckets by category: GROUP BY p.category. Grouping by p.id would list sixteen one-product rows.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Heaviest capital first: DESC. ASC would lead with Fitness's single mat.",
      },
    ],
    distractors: ["s.id = p.id", "p.id", "ASC"],
    walkthrough:
      "The capital page: shelf value rolls up per category — Audio 26,952.30 on top (the headset's and speaker's deep stock at premium prices), Electronics 25,313.80, Accessories 21,642.40, down to Fitness's 7,040.00. The join is deliberate over-engineering: the category lives on products, but next quarter's region column drops into this exact query. The id-coincidence join would value six phantom products and miss ten real ones — capital pages get audited for exactly that.",
  },
  {
    id: "cs-465",
    tier: "medium",
    topic: "j3",
    universe: "supplier",
    title: "The APAC bench check",
    brief:
      "From: Supplier audit. Re: the regional bench census.\n\nThe APAC bench census: product count per APAC supplier. Chain products to suppliers, pin the region, count per vendor. Both APAC vendors should read three — verify the region's whole bench at once.",
    ask: "Product count per APAC supplier, count descending then name.",
    template: `SELECT s.name, {1}(p.id) AS products
FROM suppliers s
JOIN products p ON {2}
WHERE s.region = {3}
GROUP BY s.id
ORDER BY products {4}, s.name;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the bench counter",
        why: "Bench depth is a product count: COUNT(p.id). SUM(p.id) would add id numbers — Shenzhen's 2+8+14 = 24 'products'.",
      },
      {
        answer: "p.supplier_id = s.id",
        kind: "keyword",
        label: "the join condition",
        why: "products.supplier_id → suppliers.id is the ownership thread. p.id = s.id pairs products 1–6 with suppliers 1–6.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the region literal",
        why: "Region codes are uppercase: 'APAC'. The lowercase 'apac' matches nothing and the census reads empty.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Deepest bench first, ties alphabetical: DESC then name.",
      },
    ],
    distractors: ["SUM", "p.id = s.id", "'apac'"],
    walkthrough:
      "The regional bench census: products counted per vendor, pinned to APAC. Run it and both vendors read three — Shenzhen Electro and Pacific Textiles, a perfectly even regional bench. The census's value is the pin: the same query with 'EU' audits Europe's bench (Nordic 3, Alpine 2) without rewriting anything. The SUM-in-COUNT-slot would print Shenzhen's id arithmetic as a product count — plausible-looking, entirely fictional.",
  },
  {
    id: "cs-466",
    tier: "hard",
    topic: "j3",
    universe: "month-close",
    title: "The status schedule, two grains",
    brief:
      "From: Financial Controller. Re: the close's two-grain status row.\n\nThe close's status schedule: per order status, the LINE count and the line-grain money — both over the orders-to-lines join. The pair shows where the work AND the money sit; the sort follows the money.",
    ask: "Per status: line count and line-grain money (Σ quantity × unit_price), by money.",
    template: `SELECT o.status, {1}(oi.id) AS lines, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS money
FROM orders o
JOIN order_items oi ON {2}
GROUP BY o.status
ORDER BY {3} {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the work counter",
        why: "Lines are work: COUNT(oi.id). SUM(oi.id) adds id numbers — bookkeeping in a work column.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.order_id → orders.id reaches the line grain. oi.id = o.id keeps the 103 coincidence lines.",
      },
      {
        answer: "money",
        kind: "keyword",
        label: "the schedule sort",
        why: "'By money' sorts on the computed alias — the schedule's editorial order. Sorting by o.status would alphabetize: cancelled first, always.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The schedule leads with the bucket that carries both the most work and the most money — descending on the money column.",
      },
    ],
    distractors: ["SUM", "oi.id = o.id", "o.status", "ASC"],
    walkthrough:
      "The two-grain schedule: four statuses, each carrying a line count and its line money — the delivered book's work and money, the pending book's, and the cancelled twelve lines' 500-ish unwind. Both grains ride the real join; sort by the money alias so the schedule leads with what the close cares about. The o.status distractor alphabetizes — a phone book where a schedule belongs. And the id-coincidence join would schedule money that never moved.",
  },
  {
    id: "cs-467",
    tier: "hard",
    topic: "j3",
    universe: "growth",
    title: "The region × category grid",
    brief:
      "From: Head of Growth. Re: the cross-tab for the strategy offsite.\n\nThe offsite's cross-tab: realized revenue per region-and-category cell — customers→orders→lines→products, four real hops, grouped on two keys, top five cells. The grid shows which regions buy which categories; the strategy conversation starts at the top cell.",
    ask: "Top 5 region-and-category cells by realized revenue (Σ quantity × unit_price).",
    template: `SELECT c.region, p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM customers c
JOIN orders o ON {1}
JOIN order_items oi ON {2}
JOIN products p ON p.id = oi.product_id
GROUP BY c.region, p.category
ORDER BY revenue {3}
LIMIT {4};`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the first join",
        why: "The account thread: orders.customer_id → customers.id. o.id = c.id fabricates a sixteen-row population.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the second join",
        why: "The line grain arrives via order_items.order_id → orders.id. oi.id = o.id corrupts every cell.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The grid opens on its biggest cell: DESC.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the alt cap",
        why: "The full grid runs 21 cells; the offsite deck shows five. A cap of 1 would show only the champion cell.",
        noVerify: true,
      },
    ],
    distractors: ["o.id = c.id", "oi.id = o.id", "ASC", "1"],
    walkthrough:
      "The strategy cross-tab: four real hops, two-key grouping, revenue per (region, category) cell, top five. Run it and the grid surfaces which regions carry which categories — the cells the offsite argues over, with the 34,833.28 book total as the sum of all cells. The ASC variant opens on the grid's smallest cell; the cap-of-1 shows only the champion and hides the spread. Every hop real or the cells reroute through coincidences — a cross-tab built on wrong keys looks exactly like insight.",
  },
  {
    id: "cs-468",
    tier: "easy",
    topic: "j4",
    universe: "refund-audit",
    title: "The paid book's payment counts",
    brief:
      "From: Refunds desk. Re: the settled paper's cash profile.\n\nThe settled book's cash profile: for every 'paid' invoice, how many payments settled it? LEFT JOIN preserves the structure, the status pin slices to paid, count per invoice, doubles first. The twos are the recovery list.",
    ask: "Payment count per 'paid' invoice, most payments first.",
    template: `SELECT i.number, COUNT(p.id) AS payments
FROM invoices i
{1} payments p ON {2}
WHERE i.status = {3}
GROUP BY i.id
ORDER BY payments {4}, i.number;`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "LEFT JOIN keeps the shape uniform — a paid invoice with no cash would appear at zero instead of vanishing.",
      },
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id is the cash thread. Matching p.invoice_id to i.number compares a number to text.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the status pin",
        why: "The profile slices to 'paid' paper — quoted text. 'open' would profile the receivables instead.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The doubles lead — they're the recovery list: DESC then number for stable filing.",
      },
    ],
    distractors: ["p.invoice_id = i.number", "'open'", "ASC"],
    walkthrough:
      "The settled book's cash profile: paid invoices with their payment counts, doubles first. Run it and the five twice-paid invoices (INV-2024-001, 005, 012, 019, 022) lead the page at 2 — the recovery list, 24,940.00 settled twice — with the seventeen singles filing behind. The LEFT JOIN is the page's future-proofing: the day a 'paid' invoice shows zero payments, it appears at the top instead of disappearing. And it already has — one of the six anomalies reads 'paid'.",
  },
  {
    id: "cs-469",
    tier: "easy",
    topic: "j4",
    universe: "month-close",
    title: "The eight quiet accounts, mapped",
    brief:
      "From: Financial Controller. Re: the quiet-account map.\n\nThe pipeline view's other half: the eight accounts with NO pending orders — names and regions, grouped by territory. The anti-join with the filter inside the ON; the NULL rows are the map.",
    ask: "Customers with zero pending orders: name and region, by region then name.",
    template: `SELECT c.name, c.region
FROM customers c
LEFT JOIN orders o ON {1} AND o.status = {2}
WHERE o.id IS {3}
ORDER BY {4}, c.name;`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the in-flight literal",
        why: "'Quiet' means no PENDING orders — quoted text inside the ON so the quiet survive as NULL rows.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'No pending' is o.id IS NULL on the preserved rows. IS NOT NULL returns the eight holders instead.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the territory sort",
        why: "'Grouped by territory' sorts by region first. Sorting by c.name would alphabetize across territories.",
      },
    ],
    distractors: ["o.id = c.id", "'cancelled'", "NOT", "c.city"],
    walkthrough:
      "The quiet map: the anti-pending join pinned inside the ON, NULL rows kept, territory-sorted. Run it and eight accounts appear — Bruno, Dmitri, Hiro, Isabella, Jamal, Liam, Noah, Olivia — spread EU 3, APAC 2, US 1, LATAM 1 (Bruno), one per line with their regions. The map's complement is the exposure view: eight quiet accounts against eight holders, sixteen accounted for. The 'cancelled' pin would map a different quiet — the twelve never-cancelled — real rows, wrong anti-join.",
  },
  {
    id: "cs-470",
    tier: "easy",
    topic: "j5",
    universe: "expense",
    title: "The settled claim with no cash",
    brief:
      "From: Spend analyst. Re: the anomaly, isolated.\n\nThe anomaly the census found, now isolated: the invoice whose ledger claims 'paid' while the payments table holds nothing. LEFT JOIN, IS NULL, and the status pin does the isolating. One row expected — the exhibit.",
    ask: "The invoice at status 'paid' with zero payments: number, status, due date.",
    template: `SELECT i.number, i.status, i.due_on
FROM invoices i
LEFT JOIN payments p ON {1}
WHERE p.id IS {2} AND i.status = {3};`,
    slots: [
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id is the cash thread. Matching p.invoice_id to i.number compares a number to text.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'No payment' is p.id IS NULL — the anti-join signature. IS NOT NULL returns the 21 matched invoices.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the claim pin",
        why: "The anomaly IS the claim: status 'paid' with no cash. Pinning 'open' would list five well-behaved receivables instead.",
      },
    ],
    distractors: ["p.invoice_id = i.number", "NOT", "'open'"],
    walkthrough:
      "The exhibit, isolated: the anti-payment join, then the claim pin that turns a hygiene list into a finding. Run it and exactly one row returns — an invoice the ledger marks 'paid', due on its date, with zero payments behind it. The two filters are the exhibit's logic: IS NULL says the cash never came; = 'paid' says the ledger says it did. Both true at once is the discrepancy — and it files itself. The 'open' pin would show five rows of normal business and bury the finding.",
  },
  {
    id: "cs-471",
    tier: "medium",
    topic: "j5",
    universe: "funnel",
    title: "Europe's unbilled count",
    brief:
      "From: Marketing lead. Re: the regional gap, as a number.\n\nThe coverage dashboard's EU tile: how many EU accounts have never been invoiced? The anti-join pinned to 'EU', counted. Two is the expected value — the tile re-proves it every load.",
    ask: "Count of never-invoiced EU customers.",
    template: `SELECT {1}(*) AS unbilled_eu
FROM customers c
LEFT JOIN invoices i ON {2}
WHERE i.id IS {3} AND c.region = {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tile counter",
        why: "A dashboard tile is a count: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real ownership thread: invoices.customer_id → customers.id. i.number = c.name compares codes to people.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'Never invoiced' is i.id IS NULL. IS NOT NULL counts the six billed EU accounts — the tile's complement.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region pin",
        why: "Region codes are uppercase: 'EU'. The lowercase 'eu' tiles a confident zero over a real gap.",
      },
    ],
    distractors: ["SUM", "i.number = c.name", "NOT", "'eu'"],
    walkthrough:
      "The EU tile: the anti-join, the region pin, the count — 2. Dmitri Volkov and Noah Meyer, Europe's whole unbilled share. The tile's discipline is that every keyword defends the number: the lowercase 'eu' tiles a zero over a real gap (the worst dashboard failure — silent, confident, wrong), and IS NOT NULL would tile 6, the billed complement, under the unbilled label. Dashboard numbers that re-prove themselves are the only ones worth automating.",
  },
  {
    id: "cs-472",
    tier: "medium",
    topic: "j4",
    universe: "supplier",
    title: "The vendor line census",
    brief:
      "From: Supplier audit. Re: lines through each vendor's shelf.\n\nThe vendor census counts ORDER LINES that flow through each supplier's products — the double LEFT chain supplier→products→lines, zeros preserved for a vendor whose goods never sell. Biggest flow first.",
    ask: "Order-line count per supplier through the two-hop chain, biggest first.",
    template: `SELECT s.name, COUNT(oi.id) AS lines
FROM suppliers s
{1} products p ON {2}
LEFT JOIN order_items oi ON oi.product_id = p.id
GROUP BY s.id
ORDER BY lines {3};`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the first hop's join",
        why: "The census keeps every vendor — a future zero-product supplier survives as a NULL row the counts read as zero. INNER JOIN deletes the row.",
      },
      {
        answer: "p.supplier_id = s.id",
        kind: "keyword",
        label: "the first hop's condition",
        why: "products.supplier_id → suppliers.id is the ownership thread. p.supplier_id = s.region compares numbers to text.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest vendor flow leads the census — the shelf whose products ride the most order lines heads the page.",
      },
    ],
    distractors: ["UNION", "p.supplier_id = s.region", "ASC"],
    walkthrough:
      "The vendor flow census: two preserved hops — suppliers keep their rows, lines flow through products — counted per vendor. Run it and the flows split unevenly: Midwest's shelf moves the most lines even though APAC's vendors ship more UNITS — lines count transactions, units count boxes, and the two rankings disagree by design. The second hop is hardcoded LEFT because the census's promise is per-vendor completeness; the first hop's slot is where that promise is defended. Swap it to INNER and the day a vendor delists, the census silently shrinks.",
  },
  {
    id: "cs-473",
    tier: "hard",
    topic: "j4",
    universe: "refund-audit",
    title: "The recovery list, with names",
    brief:
      "From: Refunds desk. Re: the collections call sheet.\n\nThe call sheet: every unpaid invoice with its owed amount AND its owner's name — the anti-payment join extended one hop to the customer. Biggest owed first; the first call writes itself from the top row.",
    ask: "The six unpaid invoices with owed amounts and owner names, biggest first.",
    template: `SELECT i.number, ROUND(i.amount_cents / 100.0, 2) AS owed, c.name
FROM invoices i
LEFT JOIN payments p ON {1}
JOIN customers c ON i.customer_id = c.id
WHERE p.id IS {2}
ORDER BY owed {3};`,
    slots: [
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the cash join",
        why: "payments.invoice_id → invoices.id is the anti-join's thread. Matching p.invoice_id to i.number compares a number to text.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'Unpaid' is p.id IS NULL on the preserved rows. IS NOT NULL would call the 21 settled accounts.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The call sheet starts at the biggest balance: DESC on owed.",
      },
    ],
    distractors: ["p.invoice_id = i.number", "NOT", "ASC"],
    walkthrough:
      "The call sheet: the anti-payment slice extended to the payer. Run it and six rows file by size — 4,937.00 (Emma Wilson) first, then 3,562.00 (Liam O'Brien), 2,794.00 (Isabella Rossi), 1,756.00 (Hiro Tanaka), 1,295.00 (Chloe Dubois), 873.00 (Pedro Alvarez) — 15,217.00 across six names. The mixed join types are deliberate: LEFT toward payments (the hole lives there), INNER toward customers (every invoice HAS an owner; nothing to preserve). Knowing which side needs preserving is the skill the sheet tests.",
  },
  {
    id: "cs-474",
    tier: "hard",
    topic: "j4",
    universe: "month-close",
    title: "The pending book with ids",
    brief:
      "From: Financial Controller. Re: the close's pipeline appendix.\n\nThe appendix lists the pipeline with row ids: every customer against their pending orders — filter inside the ON, NULL rows included, name-then-id order. Twenty-two rows: fourteen facts and eight signals of absence.",
    ask: "Every customer against their pending orders (NULL row when none), by name then order id.",
    template: `SELECT c.name, o.id, o.total
FROM customers c
LEFT JOIN orders o ON {1} AND o.status = {2}
ORDER BY c.name, o.{3};`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the in-flight literal",
        why: "The appendix tracks 'pending' — quoted text inside the ON so the never-pending survive as NULL rows.",
      },
      {
        answer: "total",
        kind: "keyword",
        label: "the secondary sort",
        why: "Within one customer, pending orders file by their total: o.total. Sorting by o.id would file by creation sequence instead.",
      },
    ],
    distractors: ["o.id = c.id", "'shipped'", "id"],
    walkthrough:
      "The pipeline appendix: the ON-placement view with the order id surfaced. Run it and 22 rows file out — 14 named pending orders with totals, 8 NULL rows marking the quiet accounts, all in name order. The NULL rows are the appendix's honest half: a close note that only lists holders implies everyone else holds nothing by accident of omission, whereas the explicit NULL rows show the eight were checked. The 'shipped' pin would append the 30-order dispatch history instead — real rows, wrong pipeline.",
  },
  {
    id: "cs-475",
    tier: "easy",
    topic: "j5",
    universe: "catalog",
    title: "The gap, city by city",
    brief:
      "From: Catalog ops. Re: the gap's geography, granular.\n\nThe billing gap mapped to cities: every never-invoiced account's city, one row each, no aggregation needed — the anti-join with the city column surfaced. Five cities, five gaps.",
    ask: "The never-invoiced customers' cities, one row per account.",
    template: `SELECT c.{1}, COUNT(*) AS holes
FROM customers c
LEFT JOIN invoices i ON {2}
WHERE i.id IS {3}
GROUP BY c.city;`,
    slots: [
      {
        answer: "city",
        kind: "keyword",
        label: "the geography column",
        why: "The map is city-grained: c.city, selected and grouped. c.email would 'map' the gap to inboxes — valid SQL, wrong geography.",
      },
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real ownership thread: invoices.customer_id → customers.id. i.number = c.name compares codes to people.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'Never invoiced' is i.id IS NULL. IS NOT NULL maps the eleven billed cities instead.",
      },
    ],
    distractors: ["email", "i.number = c.name", "NOT"],
    walkthrough:
      "The gap's geography at city grain: the anti-join surfaced with the city column, grouped so each hole gets its row. Run it and five cities appear — Hamburg, Nagoya, Dubai, São Paulo, Tallinn — each hosting exactly one unbilled account (the count column's 1s confirm the one-per-city rule). The email distractor is the lesson in absurdity: the query runs, groups by inbox, and 'maps' the gap to five email addresses. Columns carry meaning; the GROUP BY chooses the map's granularity.",
  },
  {
    id: "cs-476",
    tier: "easy",
    topic: "j5",
    universe: "month-close",
    title: "Count the quiet eight",
    brief:
      "From: Financial Controller. Re: the quiet-pipeline tile.\n\nThe close dashboard's quiet tile: customers with NO pending orders, counted. The anti-pending join with the filter inside the ON — the NULL rows the count reads. Eight is the expected value.",
    ask: "Count of customers with zero pending orders.",
    template: `SELECT {1}(*) AS quiet
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = {2}
WHERE o.id IS {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tile counter",
        why: "A tile is a count: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the in-flight literal",
        why: "'Quiet' means no PENDING orders — quoted text inside the ON. 'shipped' would count a different quiet entirely.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'No pending' is o.id IS NULL on the preserved rows. IS NOT NULL counts the eight holders instead.",
      },
    ],
    distractors: ["SUM", "'shipped'", "NOT"],
    walkthrough:
      "The quiet tile: the anti-pending count — 8, half the book. The filter's position inside the ON is what makes the count possible: the NULL rows survive the join specifically so the IS NULL test can find them. The 'shipped' pin would count accounts with no dispatch history — a bigger, different quiet — and IS NOT NULL would count the eight holders under the quiet label. Tiles that re-prove themselves: same shape as the billing-gap tile, different literal, different hole.",
  },
  {
    id: "cs-477",
    tier: "medium",
    topic: "j5",
    universe: "growth",
    title: "The spotless roster, by region",
    brief:
      "From: Head of Growth. Re: the clean-record map.\n\nThe clean-record map: customers with zero CANCELLED orders, bucketed per region. The status filter rides inside the join so the spotless survive; the region rollup turns twelve names into a friction map.",
    ask: "Count of zero-cancellation customers per region, biggest first.",
    template: `SELECT c.region, {1}(*) AS spotless
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = {2}
WHERE o.id IS {3}
GROUP BY c.region
ORDER BY spotless {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the map counter",
        why: "A friction map counts accounts: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the friction literal",
        why: "'Spotless' means no CANCELLED orders — quoted text inside the ON. 'delivered' would hunt accounts with no deliveries.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'No cancellation' is o.id IS NULL on the preserved rows. IS NOT NULL counts the four friction holders.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The cleanest region leads: DESC on the count.",
      },
    ],
    distractors: ["SUM", "'delivered'", "NOT", "ASC"],
    walkthrough:
      "The friction map: twelve spotless accounts rolled up — EU 7, APAC 3, US 1, LATAM 1. Read against the holder map (Alice, Emma, Farid, Maya) and the pattern shows: cancellations concentrate in the four biggest books, so the regions WITHOUT heavy books are spotless by arithmetic, not virtue. The filter-inside-ON placement is what keeps the twelve countable; WHERE would delete them before the rollup. The 'delivered' pin would map accounts with no deliveries — nearly everyone — a friction map of nothing.",
  },
  {
    id: "cs-478",
    tier: "medium",
    topic: "j5",
    universe: "fraud",
    title: "The spotless twelve, named",
    brief:
      "From: Fraud spot-check desk. Re: the clean-history list.\n\nThe desk's clean-history list: every customer with zero cancellations, named, alphabetical. The anti-cancelled join — filter inside the ON, NULL rows kept, names out. Twelve names expected.",
    ask: "Customers with zero cancelled orders: names, alphabetical.",
    template: `SELECT c.name
FROM customers c
LEFT JOIN orders o ON {1} AND o.status = {2}
WHERE o.id IS {3}
ORDER BY c.name;`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the friction literal",
        why: "'Clean history' means no CANCELLED orders — quoted text inside the ON. 'pending' would list the eight pipeline-quiet accounts instead.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'No cancellation' is o.id IS NULL on the preserved rows. IS NOT NULL names the four friction holders.",
      },
    ],
    distractors: ["o.id = c.id", "'pending'", "NOT"],
    walkthrough:
      "The clean-history list: the anti-cancelled join, names out, alphabetical. Run it and twelve names surface — everyone except Alice Chen, Emma Wilson, Farid Nasser and Maya Patel, whose cancellations exclude them. The list reads as the friction-free cohort the desk samples from; its complement (the four holders) is where the desk actually looks. The 'pending' pin would list a different twelve-adjacent set — the pipeline-quiet eight — real names, wrong cohort. Anti-joins are only as good as the literal that defines the hole.",
  },
  {
    id: "cs-479",
    tier: "hard",
    topic: "j5",
    universe: "supplier",
    title: "The unpaid, by due date",
    brief:
      "From: Supplier audit. Re: the aging view.\n\nThe receivables aging view: the unpaid six filed by DUE DATE, oldest obligation first. The anti-payment join, the date sort, numbers out. Aging is how collections prioritizes — the oldest due date is the oldest broken promise.",
    ask: "The six unpaid invoices with their due dates, oldest obligation first.",
    template: `SELECT i.number, i.due_on
FROM invoices i
LEFT JOIN payments p ON {1}
WHERE p.id IS {2}
ORDER BY i.{3};`,
    slots: [
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id is the cash thread. Matching p.invoice_id to i.number compares a number to text.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'Unpaid' is p.id IS NULL on the preserved rows. IS NOT NULL ages the 21 settled invoices instead.",
      },
      {
        answer: "due_on",
        kind: "keyword",
        label: "the aging column",
        why: "Aging sorts by the obligation date: i.due_on. Sorting by i.issued_on would age from the invoice date — a different (earlier) promise.",
      },
    ],
    distractors: ["p.invoice_id = i.number", "NOT", "i.status", "amount_cents"],
    walkthrough:
      "The aging view: the unpaid six filed by due date, oldest first — the order collections actually works. Run it and the six obligations line up by their promised dates, numbers and dates in one page. The issued_on distractor is the subtle aging error: invoices issue before they fall due, so issuing-date order shifts the queue by each invoice's terms — a real ordering that misses the promise. The amount_cents distractor sorts by size: a leaderboard where a calendar belongs.",
  },
  {
    id: "cs-480",
    tier: "hard",
    topic: "j5",
    universe: "expense",
    title: "The coverage ratio, guarded",
    brief:
      "From: Spend analyst. Re: the cash-coverage KPI.\n\nThe receivables KPI: what SHARE of invoices carries cash? Payments matched over invoices total, expressed as a ratio — the ×1.0 forcing float division, the ROUND trimming display digits. Expect 0.96, and know exactly which six points make up the gap.",
    ask: "Cash coverage ratio: matched payments ÷ total invoices, as a 2-decimal ratio.",
    template: `SELECT ROUND(COUNT(p.id) * {1} / COUNT(i.id), {2}) AS coverage
FROM invoices i
{3} payments p ON {4};`,
    slots: [
      {
        answer: "1.0",
        kind: "number",
        label: "the float coercion",
        why: "27 ÷ 28 in integer arithmetic floors to 0 — the KPI would print 0.00. ×1.0 forces the float division.",
        noVerify: true,
      },
      {
        answer: "2",
        kind: "number",
        label: "the display precision",
        why: "The KPI reports two decimals: 0.96. At 0 the ratio rounds to 1 and the gap disappears from the dashboard entirely.",
        noVerify: true,
      },
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "LEFT JOIN keeps the six unpaid invoices as NULL rows — COUNT(p.id) skips them, COUNT(i.id) doesn't. The GAP lives in that asymmetry.",
      },
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id is the cash thread. Matching p.invoice_id to i.number compares a number to text.",
      },
    ],
    distractors: ["100.0", "0", "JOIN", "p.invoice_id = i.number"],
    walkthrough:
      "The coverage KPI: 27 matched payments over 28 invoices = 0.96. Every slot defends a digit: the ×1.0 stops integer division from flooring the ratio to zero; the LEFT JOIN creates the numerator/denominator asymmetry the gap lives in (INNER would print 27/27 = 1.00 — a perfect score over a book with six unpaid invoices); the 0-precision distractor rounds the gap away entirely. KPIs are where small semantic errors get the most circulation — each guard gets its own slot.",
  },
  {
    id: "cs-481",
    tier: "easy",
    topic: "j6",
    universe: "month-close",
    title: "The inclusive city pairs",
    brief:
      "From: Financial Controller. Re: the self-match census.\n\nThe compliance drill asks for the INCLUSIVE pairing — same city, guards set to <=, self-matches included. On this book every customer is their own city-mate, so the census should read exactly the customer count. Verify it.",
    ask: "Count of same-city customer pairs with a.id <= b.id (self-matches included).",
    template: `SELECT {1}(*) AS rows_
FROM customers a
JOIN customers b ON {2} AND a.id {3} b.id;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A row count: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "a.city = b.city",
        kind: "keyword",
        label: "the pairing condition",
        why: "City equality across the aliases pairs co-located rows. a.region = b.region would count the 55 inclusive region pairs instead.",
      },
      {
        answer: "<=",
        kind: "keyword",
        label: "the inclusive guard",
        why: "<= keeps self-matches: every customer pairs with itself, so the census reads 16. The strict < would find zero — no two customers share a city.",
      },
    ],
    distractors: ["SUM", "a.region = b.region", "<", ">"],
    walkthrough:
      "The inclusive census: same-city pairs with <= — and because this book's sixteen customers live in sixteen different cities, the ONLY pairs are self-matches: 16 exactly. The drill's value is the guard arithmetic made visible: < gives 0 (no real co-located pairs exist), <= gives 16 (all self), = gives 16 (only self), > gives 0 (the mirror image). Four guards, three distinct answers, one schema fact underneath: city uniqueness. The region distractor returns 55 under this census's city label — a true number for the wrong column.",
  },
  {
    id: "cs-482",
    tier: "medium",
    topic: "j6",
    universe: "fraud",
    title: "The desk mat's twins",
    brief:
      "From: Fraud spot-check desk. Re: the repeat-purchase pin.\n\nThe pairing study pins one product: how many line pairs of the DESK MAT exist across the book? Same-product self-join, guarded, pinned by product id 11. The number feeds the repeat-purchase flag's baseline.",
    ask: "Count of same-product line pairs (a.id < b.id) for product 11 (Desk Mat Extended).",
    template: `SELECT {1}(*) AS pairs
FROM order_items a
JOIN order_items b ON a.product_id = b.product_id AND a.id {2} b.id
WHERE a.product_id = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A pair total: COUNT(*). SUM(*) errors over the placeholder.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the guard operator",
        why: "Strict less-than: each pair once, self-pairs impossible. <= would add the desk mat's 24 self-matches — 300 instead of 276.",
      },
      {
        answer: "11",
        kind: "number",
        label: "the pinned product id",
        why: "Desk Mat Extended is product 11. Product 1 (the keyboard) would pair its own three lines' worth instead.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "<=", "=", "1"],
    walkthrough:
      "The pinned pairing: the desk mat's 24 lines pair among themselves — 24 choose 2 = 276, coincidentally Alice's order-pair count, from a completely different table. The guard arithmetic is the audit: <= inflates to 300 (24 self-matches), = collapses to 24 (only self-matches). Pin by id 11 — the catalog's volume hero — and the baseline says: 276 same-product pairs exist for ONE product out of 1,983 book-wide, roughly a seventh of all repeat-purchase pairing concentrated in the desk mat alone.",
  },
  {
    id: "cs-483",
    tier: "medium",
    topic: "j6",
    universe: "catalog",
    title: "Sibling products, paired",
    brief:
      "From: Catalog ops. Re: the vendor-pairing census.\n\nHow many product pairs share a SUPPLIER — the sibling census that shows which vendors put multiple products on the same shelf? Products self-joined on supplier, guarded, counted. Verify against the 3/3/3/3/2/2 roster by hand.",
    ask: "Count of same-supplier product pairs (p1.id < p2.id).",
    template: `SELECT {1}(*) AS pairs
FROM products p1
JOIN products p2 ON {2} AND p1.id {3} p2.id;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A pair total: COUNT(*). SUM(*) errors over the placeholder.",
      },
      {
        answer: "p1.supplier_id = p2.supplier_id",
        kind: "keyword",
        label: "the sibling condition",
        why: "Siblings share a supplier: supplier equality across the aliases. p1.id = p2.supplier_id compares product ids to supplier ids.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the guard operator",
        why: "p1.id < p2.id: each pair once, self-pairs impossible. <= would add all 16 self-matches — 30 instead of 14.",
      },
    ],
    distractors: ["SUM", "p1.id = p2.supplier_id", "<=", "="],
    walkthrough:
      "The sibling census: products paired through shared suppliers, guarded. Run it and the count reads 14 — the roster arithmetic proves it: four suppliers with three products give C(3,2)×4 = 12 pairs, two suppliers with two give 1 apiece, 12 + 2 = 14. That's the co-merchandising map: fourteen product pairs where one vendor call covers both shelves. The <= distractor adds sixteen self-matches (a product is its own sibling?); the supplier-id-to-product-id variant pairs catalog entries with vendor rows — bookkeeping dressed as merchandising.",
  },
  {
    id: "cs-484",
    tier: "hard",
    topic: "j6",
    universe: "growth",
    title: "Order bridges across regions",
    brief:
      "From: Head of Growth. Re: the cross-region pairing census.\n\nThe compliance companion to the order-twins study: order pairs whose customers sit in DIFFERENT regions — the cross-border order pairing. Both orders ride their own buyer thread; the region condition flips to inequality. Big number, derivable by hand.",
    ask: "Count of order pairs (o1.id < o2.id) whose customers are in different regions.",
    template: `SELECT {1}(*) AS bridges
FROM orders o1
JOIN orders o2 ON o1.id < o2.id
JOIN customers c1 ON {2}
JOIN customers c2 ON {3}
WHERE c1.region {4} c2.region;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A pair total: COUNT(*). SUM(*) errors over the placeholder.",
      },
      {
        answer: "o1.customer_id = c1.id",
        kind: "keyword",
        label: "the first buyer thread",
        why: "Each order rides its own account thread: o1.customer_id → c1.id. o1.id = c1.id pairs order numbers with customer ids.",
      },
      {
        answer: "o2.customer_id = c2.id",
        kind: "keyword",
        label: "the second buyer thread",
        why: "The second alias needs its OWN thread: o2.customer_id → c2.id. Cross-wiring the threads tangles the pairing.",
      },
      {
        answer: "!=",
        kind: "keyword",
        label: "the bridging operator",
        why: "Bridges span different regions: region inequality. Region equality would count the 1,828 same-region order pairs instead.",
      },
    ],
    distractors: ["SUM", "o1.id = c1.id", "o2.id = c2.id", "="],
    walkthrough:
      "The cross-border census: both orders threaded to their buyers, region inequality as the bridge test. Run it and the count reads 3,425 — and the derivation proves it: 103 orders pair C(103,2) = 5,253 ways; same-region pairs sum to C(45,2)+C(37,2)+C(19,2)+C(2,2) = 990+666+171+1 = 1,828; the bridge count is the difference. Two independent routes to one number is the audit's favorite confirmation. The '=' distractor returns the 1,828 complement under this query's 'bridges' label — the exact swap that flips a compliance finding.",
  },
  {
    id: "cs-485",
    tier: "hard",
    topic: "j6",
    universe: "supplier",
    title: "The keyboard's siblings",
    brief:
      "From: Supplier audit. Re: the product-pair pin.\n\nThe sibling census pinned to one product: how many pairs does the Mechanical Keyboard K1 form with its shelf-mates from the same supplier? Nordic's bench is three products — the pin should return the pairs within it.",
    ask: "Count of same-supplier product pairs involving the Mechanical Keyboard K1.",
    template: `SELECT {1}(*) AS pairs
FROM products p1
JOIN products p2 ON {2} AND p1.id {3} p2.id
WHERE p1.name = {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A pair total: COUNT(*). SUM(*) errors over the placeholder.",
      },
      {
        answer: "p1.supplier_id = p2.supplier_id",
        kind: "keyword",
        label: "the sibling condition",
        why: "Shelf-mates share a supplier: supplier equality across the aliases. p1.id = p2.id with the guard can never both hold.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the guard operator",
        why: "p1.id < p2.id: each pair once, self-pairs impossible. <= would add the keyboard's self-match — 3 instead of 2.",
      },
      {
        answer: "'Mechanical Keyboard K1'",
        kind: "keyword",
        label: "the product pin",
        why: "The census pins Nordic's keyboard by its exact catalog name, quoted. Pinning the yoga mat would census Midwest's bench instead.",
      },
    ],
    distractors: ["SUM", "p1.id = p2.id", "<=", "'Yoga Mat Eco 6mm'"],
    walkthrough:
      "The pinned sibling census: the keyboard pairs with Nordic Gadgets' other two products — the webcam and the smart watch — 2 pairs, C(3,2) from a three-product bench. The pin and the guard are the case's teeth: swap the pin to the yoga mat and you census Midwest's bench (also 2 — but a different vendor's shelf); loosen the guard to <= and the keyboard pairs with itself. Small numbers, hand-verifiable — which is exactly why this census gets hand-verified.",
  },
  {
    id: "cs-486",
    tier: "easy",
    topic: "j7",
    universe: "catalog",
    title: "Category line census",
    brief:
      "From: Catalog ops. Re: the work-by-category page.\n\nThe work page: how many order LINES does each category carry? Lines joined to products, bucketed by category, busiest first. Seven rows — the pick-path workload by department.",
    ask: "Line count per category, busiest first.",
    template: `SELECT p.category, {1}(oi.id) AS lines
FROM order_items oi
JOIN products p ON {2}
GROUP BY p.category
ORDER BY lines {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the work counter",
        why: "Lines are work: COUNT(oi.id). SUM(oi.id) adds id numbers — bookkeeping in a work column.",
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.product_id → products.id attaches the category. p.id = oi.order_id pairs catalog ids with order numbers.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Busiest department first: DESC. ASC would open on Fitness's thirteen lines.",
      },
    ],
    distractors: ["SUM", "p.id = oi.order_id", "ASC"],
    walkthrough:
      "The work page: line counts per category — Accessories 62, Audio 51, Electronics 44, Video 32, Wearables 25, Apparel 24, Fitness 13. The workload ranking and the revenue ranking disagree (Audio earns most, Accessories works most) — the page's whole point is showing both truths side by side across queries. The id-coincidence join would census lines that never touched their categories; the ASC variant opens the meeting on the quietest department.",
  },
  {
    id: "cs-487",
    tier: "easy",
    topic: "j7",
    universe: "funnel",
    title: "Shipped units",
    brief:
      "From: Marketing lead. Re: the dispatch slide's number.\n\nThe dispatch slide: total units across SHIPPED orders' lines — the book's in-transit weight. Real join, status pin, quantity summed. One number under the map.",
    ask: "Total units (Σ quantity) across shipped orders' lines.",
    template: `SELECT {1}(oi.quantity) AS units
FROM orders o
JOIN order_items oi ON {2}
WHERE o.status = {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the volume aggregate",
        why: "Boxes are quantity summed: SUM(oi.quantity). COUNT would count lines where weight belongs.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.order_id → orders.id reaches the line grain. oi.id = o.id keeps coincidence lines.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the status literal",
        why: "The slide slices to 'shipped' — quoted text. 'delivered' would chart the landed book instead of the in-transit one.",
      },
    ],
    distractors: ["COUNT", "oi.id = o.id", "'delivered'"],
    walkthrough:
      "The in-transit weight: 169 units across 84 shipped lines — the book's middle state, between the 233 delivered and the 76 pending. The status literal does the slicing, and the three statuses together reconcile to the book's 498 total units. The 'delivered' distractor returns 233 under the shipped label — a true number for the wrong slice, off by 64 boxes on a slide that ships to the whole company. Status literals are checked against the schema enum, not the ear.",
  },
  {
    id: "cs-488",
    tier: "medium",
    topic: "j7",
    universe: "refund-audit",
    title: "The unwound money",
    brief:
      "From: Refunds desk. Re: what the cancellations were worth.\n\nThe unwind ledger: line money (Σ quantity × unit_price) across CANCELLED orders' lines — the refund exposure at the line grain. Real join, status pin, the money expression that never inflates.",
    ask: "Total line money (Σ quantity × unit_price) across cancelled orders' lines.",
    template: `SELECT ROUND(SUM(oi.{1}), 2) AS unwound
FROM orders o
JOIN order_items oi ON {2}
WHERE o.status = {3};`,
    slots: [
      {
        answer: "quantity * unit_price",
        kind: "keyword",
        label: "the money expression",
        why: "Line money is quantity × unit_price, summed. unit_price alone prices every line at one unit and understates the unwind.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.order_id → orders.id reaches the cancelled lines. oi.id = o.id keeps coincidence lines.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status literal",
        why: "The unwind targets the cancelled slice — quoted text. 'delivered' would value the landed book as unwound.",
      },
    ],
    distractors: ["unit_price", "oi.id = o.id", "'delivered'"],
    walkthrough:
      "The unwind ledger: the twelve cancelled lines valued at the line grain — quantity × the transacted unit price, summed once per line, no fan-out inflation because the money expression lives ON the line. Contrast the naive instinct: summing o.total over these joined rows would repeat each cancelled order's total per line and inflate the unwind. The 'delivered' distractor would book the whole landed catalog as refund exposure — a true expression over the wrong slice, at precisely the magnitude that triggers a meeting.",
  },
  {
    id: "cs-489",
    tier: "easy",
    topic: "j7",
    universe: "pricing",
    title: "List-price averages by category",
    brief:
      "From: Pricing committee. Re: the list-price ladder.\n\nThe committee's list-price ladder: average CATALOG price per category, richest average first. The catalog hop is pre-built for next quarter's region column; today the buckets are categories. Note for the deck: this is LIST, not what lines actually transact at.",
    ask: "Average catalog price per category, richest average first.",
    template: `SELECT p.category, ROUND({1}(p.price), 2) AS avg_list
FROM products p
JOIN suppliers s ON {2}
GROUP BY p.category
ORDER BY avg_list {3};`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean aggregate",
        why: "An average ladder needs the mean: AVG(p.price). SUM would report category totals where an average belongs.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the join condition",
        why: "The real ownership join, pre-built: products.supplier_id → suppliers.id. s.id = p.id pairs supplier ids with product ids.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Richest average first: DESC. ASC would open on Accessories' 27.49.",
      },
    ],
    distractors: ["SUM", "s.id = p.id", "ASC"],
    walkthrough:
      "The list-price ladder: Wearables averages 139.50 (the smart watch doing the lifting), Audio 109.66, Video 84.50, down to Accessories' 27.49. The deck's footnote matters: these are LIST averages — the realized ladder (what lines transacted at) reads differently, and the committee prices against realized. The SUM distractor would print category totals — 244.49 for Wearables wearing an average's name — off by the exact factor of products-per-category that nobody eyeballs.",
  },
  {
    id: "cs-490",
    tier: "medium",
    topic: "j7",
    universe: "supplier",
    title: "Units by vendor rating",
    brief:
      "From: Supplier audit. Re: does the rating predict the volume?\n\nThe audit's hypothesis test: total units shipped per supplier RATING — do highly-rated vendors actually move more boxes? Chain lines→products→suppliers, bucket by the vendor's rating, biggest flow first.",
    ask: "Total units (Σ quantity) per supplier rating, biggest flow first.",
    template: `SELECT s.rating, SUM(oi.quantity) AS units
FROM order_items oi
JOIN products p ON {1}
JOIN suppliers s ON {2}
GROUP BY s.rating
ORDER BY units {3};`,
    slots: [
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the first join (line→product)",
        why: "order_items.product_id → products.id names the thing sold. p.id = oi.order_id pairs products with order numbers.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the second join (product→supplier)",
        why: "products.supplier_id → suppliers.id attaches the vendor — and their rating. s.region = p.category never matches.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest flow leads the test — the rating bucket moving the most boxes heads the page, whatever the hypothesis hoped.",
      },
    ],
    distractors: ["p.id = oi.order_id", "s.region = p.category", "ASC"],
    walkthrough:
      "The rating-volume test: units bucketed by vendor rating — Midwest's 4.4 carries 109 units, Shenzhen's 4.1 carries 99, Nordic's 4.6 moves 82, Alpine's 4.8 (the best rating in the book) moves 77. The hypothesis dies politely: rating and volume barely correlate — the best-rated vendor is mid-table on boxes. The two real joins are what make the test fair; the region=category join would test whether 'APAC' equals 'Electronics' (it doesn't, silently). Hypotheses get probed, not assumed.",
  },
  {
    id: "cs-491",
    tier: "hard",
    topic: "j7",
    universe: "growth",
    title: "Spend per order, ranked",
    brief:
      "From: Head of Growth. Re: the per-order leaderboard.\n\nThe quality leaderboard, refined: customers ranked by SPEND PER ORDER — line money divided by DISTINCT orders, per customer. Alice's 24-order book vs Emma's 17: whose orders are individually worth more? Top three.",
    ask: "Top 3 customers by spend per order (Σ line money ÷ COUNT DISTINCT orders).",
    template: `SELECT c.name, ROUND(SUM(oi.quantity * oi.unit_price) / COUNT({1} o.id), 2) AS per_order
FROM customers c
JOIN orders o ON {2}
JOIN order_items oi ON {3}
GROUP BY c.id
ORDER BY per_order {4}
LIMIT {5};`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the order dedup",
        why: "The denominator must count ORDERS, not joined rows: DISTINCT collapses each order's lines. Without it Alice divides by 50 lines, not 24 orders.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the first join",
        why: "The account thread: orders.customer_id → customers.id. o.id = c.id would rank an id coincidence.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the second join",
        why: "The line grain arrives via order_items.order_id → orders.id. oi.id = o.id corrupts both sides of the division.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The richest per-order book leads — the leaderboard answers 'whose orders are individually worth more' from the top down.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the podium cap",
        why: "The leaderboard shows three: LIMIT 3. At 16 it lists everyone.",
        noVerify: true,
      },
    ],
    distractors: ["ALL", "o.id = c.id", "oi.id = o.id", "ASC", "16"],
    walkthrough:
      "The per-order leaderboard: Emma Wilson 390.62 per order, Grace Kim 326.73, Alice Chen 302.60 — and the ranking flips the volume story on its head. Alice's 7,262.35 total still leads, but spread over 24 orders it averages LESS per order than Emma's 17-order book. The DISTINCT in the denominator is the whole case: divide by joined rows and Alice reads 145.25 — her per-LINE value wearing a per-order label. Volume whales and quality books are different customers; the division decides which one the list finds.",
  },
  {
    id: "cs-492",
    tier: "hard",
    topic: "j7",
    universe: "month-close",
    title: "Cancellation lines, regionalized",
    brief:
      "From: Financial Controller. Re: the unwind's regional footprint.\n\nThe close's unwind footnote, regionalized: cancelled-order LINES per customer region — the full chain with the status pin, bucketed by region. The order counts are known (EU 3, APAC 3, US 1); the line counts are what the footnote adds.",
    ask: "Line count per customer region across cancelled orders, biggest first.",
    template: `SELECT c.region, COUNT(oi.id) AS lines
FROM customers c
JOIN orders o ON {1}
JOIN order_items oi ON {2}
WHERE o.status = {3}
GROUP BY c.region
ORDER BY lines {4};`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the first join",
        why: "The account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the second join",
        why: "The line grain arrives via order_items.order_id → orders.id. oi.id = o.id keeps coincidence lines.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status literal",
        why: "The footnote tracks the cancelled slice — quoted text. 'pending' would footnote the live pipeline.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest unwind footprint leads: DESC.",
      },
    ],
    distractors: ["o.id = c.id", "oi.id = o.id", "'pending'", "ASC"],
    walkthrough:
      "The unwind's regional footprint: the twelve cancelled lines bucketed by their buyers' regions through two real hops. The known order counts (EU 3 via Alice, APAC 3 via Farid and Maya, US 1 via Emma) gain their line dimension — how many pick-paths each region's cancellations actually unwound. The status literal rides the order row because lines don't carry status; the join carries it down. Break either hop and the footnote's twelve lines reroute through coincidences — a footnote that survives review because 12 looks like 12.",
  },
  {
    id: "cs-493",
    tier: "hard",
    topic: "j7",
    universe: "inventory",
    title: "The thinnest shelf covers",
    brief:
      "From: Inventory control. Re: the reorder-risk page.\n\nThe risk page: products ranked by shelf COVER — stock divided by units sold, thinnest cover first, top five. The ×1.0 keeps the ratio float; the join brings each product's sold units alongside its shelf.",
    ask: "Top 5 products by thinnest shelf cover (stock ÷ units sold), as a 2-decimal ratio.",
    template: `SELECT p.name, ROUND(p.stock * {1} / SUM(oi.{2}), 2) AS cover
FROM products p
JOIN order_items oi ON {3}
GROUP BY p.id
ORDER BY cover {4}
LIMIT {5};`,
    slots: [
      {
        answer: "1.0",
        kind: "number",
        label: "the float coercion",
        why: "Integer ÷ integer floors: 260 ÷ 47 would read 5. ×1.0 keeps 5.53 a ratio instead of a rounded guess.",
        noVerify: true,
      },
      {
        answer: "quantity",
        kind: "keyword",
        label: "the sold-units column",
        why: "Cover divides by what SOLD: SUM(oi.quantity). unit_price would divide shelf by money — units per currency, meaningless.",
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.product_id → products.id brings the sales history. p.id = oi.order_id pairs catalog ids with order numbers.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the risk sort",
        why: "'Thinnest cover first' is ascending on the ratio — the risk page leads with the shelf closest to empty relative to demand.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the risk page cap",
        why: "The risk page carries five: LIMIT 5. At 16 it lists the whole catalog.",
        noVerify: true,
      },
    ],
    distractors: ["100.0", "unit_price", "p.id = oi.order_id", "DESC", "16"],
    walkthrough:
      "The risk page: cover = stock ÷ sold units, thinnest first — the five shelves where demand has eaten deepest into stock relative to history. The ×1.0 is quiet but decisive: without it SQLite floors every ratio to an integer and 5.53 reads as 5 — the difference between 'reorder this week' and 'reorder eventually'. The unit_price distractor divides boxes by money and prints plausible nonsense; the DESC variant ranks the DEEPEST covers first — a risk page that leads with safety. Ratios direction-flip silently; the ASC is the page's meaning.",
  },
  {
    id: "cs-494",
    tier: "medium",
    topic: "j8",
    universe: "catalog",
    title: "USING on the chain",
    brief:
      "From: Catalog ops. Re: the shorthand's third result.\n\nThe USING tour's third stop: order_items JOIN orders USING(id) — both tables have an id column, so the shorthand matches line ids to order ids. The result should look familiar: 103, the coincidence census again. Count it and name what matched.",
    ask: "Count rows from order_items JOIN orders USING (id).",
    template: `SELECT {1}(*) AS paired
FROM order_items
{2} orders USING ({3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A row count: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "USING rides a plain JOIN: JOIN orders USING (id). UNION cannot appear in FROM.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the shared column name",
        why: "order_items and orders share id — line ids matched to order ids. USING(order_id) errors: orders has no such column.",
      },
    ],
    distractors: ["SUM", "UNION", "order_id"],
    walkthrough:
      "The USING tour's third stop: the shorthand matches the 103 lines whose id equals some order's id — the coincidence census in yet another costume. The real link is order_items.order_id → orders.id, worth 251 rows; the shared NAME is bookkeeping, worth 103. The order_id distractor fails at parse time (orders has no such column) — the parse error is the friendly outcome; the silent 103 is the dangerous one. Three tables toured, three coincidences found: the shorthand's answer is always 'what do the column NAMES share', never 'what does the business mean'.",
  },
  {
    id: "cs-495",
    tier: "medium",
    topic: "j8",
    universe: "inventory",
    title: "NATURAL on the chain",
    brief:
      "From: Inventory control. Re: the implicit match on the chain.\n\nThe NATURAL tour's third stop: orders NATURAL JOIN order_items. The two share exactly one column NAME — id — so the implicit match pairs order ids with line ids: the 103-row coincidence, again. Count it, then say which real link it buried.",
    ask: "Count rows from orders NATURAL JOIN order_items.",
    template: `SELECT {1}(*) AS paired
FROM {3} NATURAL JOIN {2};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A row count: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "order_items",
        kind: "keyword",
        label: "the second table",
        why: "orders and order_items share only the id name — 103 id coincidences. NATURAL invoices instead shares id AND customer_id, a different coincidence entirely.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the base table",
        why: "The chain stop starts at orders. Starting at customers and NATURAL-joining order_items shares id only — sixteen coincidences, a different census.",
      },
    ],
    distractors: ["SUM", "customers", "UNION"],
    walkthrough:
      "The NATURAL tour's chain stop: orders and order_items share only {id}, so the implicit matcher pairs the 103 id coincidences — while the REAL link (order_items.order_id → orders.id) carries 251 rows that this query never sees. The invoices distractor changes the shared set to {id, customer_id}: a different coincidence, a different count, same lesson. NATURAL's output is a pure function of column names; the business relationship never enters the calculation. The 103-vs-251 contrast IS the module's closing argument against implicit matching.",
  },
  {
    id: "cs-496",
    tier: "medium",
    topic: "j8",
    universe: "refund-audit",
    title: "RIGHT JOIN from the accounts",
    brief:
      "From: Refunds desk. Re: the mirror survey, second angle.\n\nThe preservation survey's second RIGHT angle: customers RIGHT JOIN invoices on the real key — the invoice side survives, all 28, the six unpaid included as NULL rows. Count and compare with the inner join's 28-plus-27 picture.",
    ask: "Count rows from customers RIGHT JOIN invoices on the real ownership key.",
    template: `SELECT {1}(*) AS rows_
FROM customers c
{2} JOIN invoices i ON {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A row count: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "RIGHT",
        kind: "keyword",
        label: "the preserving side",
        why: "RIGHT JOIN preserves the invoices — 28 rows, every invoice present. The customer side's five gaps (never-invoiced) simply don't appear.",
      },
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real ownership thread: invoices.customer_id → customers.id. i.number = c.name compares codes to people.",
      },
    ],
    distractors: ["SUM", "UNION", "i.missing"],
    walkthrough:
      "The second RIGHT angle: customers RIGHT JOIN invoices reads 28 — every invoice present, the 22 matched pairs plus the 6 unpaid surviving as NULL rows on the invoice side. Compare the LEFT edition (38: every customer preserved, 5 with no invoices at all) and the survey's picture completes: LEFT preserves accounts, RIGHT preserves paper, INNER preserves matches — 38, 28, 27 are the three populations, and knowing which number answers which question is the survey's whole point. The name=text distractor zeroes the survey silently.",
  },
  {
    id: "cs-497",
    tier: "medium",
    topic: "j8",
    universe: "catalog",
    title: "The Cartesian census",
    brief:
      "From: Catalog ops. Re: the no-condition join, quantified.\n\nThe module's last footgun, quantified: orders CROSS JOIN products with NO condition at all — every order paired with every product. The count should read 1,648, and the decomposition (103 × 16) is the point.",
    ask: "Count rows from orders CROSS JOIN products with no condition.",
    template: `SELECT {1}(*) AS cartesian
FROM orders
{2} JOIN {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A row count: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "CROSS",
        kind: "keyword",
        label: "the unconditional join",
        why: "CROSS JOIN is the Cartesian product by definition — no ON, every row meets every row. (SQLite would also accept a bare JOIN here; CROSS says what you mean.)",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the crossed table",
        why: "The census crosses orders with the catalog: 103 × 16. Crossing suppliers instead gives 103 × 6 — a different (smaller) explosion.",
      },
    ],
    distractors: ["UNION", "WHERE", "1"],
    walkthrough:
      "The Cartesian census: every order meets every product — 103 × 16 = 1,648 rows of pure noise. The decomposition is the lesson: a join with no condition multiplies row counts, which is why the forgotten ON is the classic production disaster (a million-row table crossed with another doesn't return — it fills the disk). The suppliers distractor explodes to 618 instead: same shape, different factor, still meaningless. CROSS JOIN has exactly two legitimate uses — deliberate enumeration and this census — and production queries use neither by accident.",
  },
  {
    id: "cs-498",
    tier: "hard",
    topic: "j8",
    universe: "month-close",
    title: "Pending exposure, holder-gated",
    brief:
      "From: Financial Controller. Re: the close's exposure rollup.\n\nThe exposure rollup: pending money per HOLDER — the pending filter inside the ON, zero buckets explicitly excluded by HAVING, money sorted down. The rollup's total must reconcile to the 6,113.00 pipeline; the eight rows are where it lives.",
    ask: "Pending money (Σ pending totals) per customer holding at least one, biggest first.",
    template: `SELECT c.name, ROUND(SUM(o.total), 2) AS pending_money
FROM customers c
LEFT JOIN orders o ON {1} AND o.status = {2}
GROUP BY c.id
{3} COUNT(o.id) >= 1
ORDER BY pending_money {4};`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the in-flight literal",
        why: "The rollup tracks 'pending' — quoted text inside the ON so the quiet accounts survive as NULL rows the HAVING excludes.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the holder gate",
        why: "COUNT(o.id) >= 1 drops the NULL buckets explicitly — INNER JOIN would drop them silently and the 'eight of sixteen' context would vanish.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest exposure leads the rollup: DESC.",
      },
    ],
    distractors: ["o.id = c.id", "'shipped'", "WHERE", "ASC"],
    walkthrough:
      "The exposure rollup: pending money per holder, eight rows, summing to the pipeline's 6,113.00. The explicit HAVING is the close's audit trail — holders kept on purpose, quiet accounts excluded visibly — and the ON placement is what makes the NULL buckets exist to be excluded. Move the status filter to WHERE and the zero buckets die before the HAVING: the rollup still prints eight rows but can no longer CLAIM eight-of-sixteen coverage. The 'shipped' pin would roll up the dispatch book — real money, wrong pipeline.",
  },
  {
    id: "cs-499",
    tier: "hard",
    topic: "j8",
    universe: "supplier",
    title: "The FULL OUTER survey",
    brief:
      "From: Supplier audit. Re: the join-type survey's last row.\n\nThe compatibility survey completes: orders FULL OUTER JOIN customers on the real key — both sides preserved. On today's book the count should read 103, identical to the inner join, and the note should say WHY nothing diverges.",
    ask: "Count rows from orders FULL OUTER JOIN customers on the real foreign key.",
    template: `SELECT {1}(*) AS rows_
FROM orders o
{2} JOIN customers c ON {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A row count: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "FULL",
        kind: "keyword",
        label: "the both-sides preservation",
        why: "FULL OUTER preserves BOTH tables — orders without customers AND customers without orders. Neither gap exists today, so the count mirrors the inner join.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
    ],
    distractors: ["SUM", "UNION", "o.missing"],
    walkthrough:
      "The survey's last row: FULL OUTER JOIN reads 103 — identical to INNER, and that's the finding. Both preservation gaps are empty on today's book (every order has a customer, every customer has orders), so all join types agree; the note's value is knowing they WOULDN'T the day an orphan order or a zero-order account appears. The o.id = c.id distractor reads 16 — the coincidence census completing the survey's danger tour. Compatibility notes are written on the day nothing diverges; that's what makes them useful later.",
  },
  {
    id: "cs-500",
    tier: "hard",
    topic: "j8",
    universe: "funnel",
    title: "The capstone census",
    brief:
      "From: Marketing lead. Re: the module's closing numbers.\n\nThe module's closing census, one row: joined rows, DISTINCT orders, DISTINCT customers — over the full chain. 251, 103, 16: the three numbers every join in this module has been chasing. Any future query that disagrees with this row has a broken hop.",
    ask: "One row: joined rows, COUNT(DISTINCT orders), COUNT(DISTINCT customers) over the full chain.",
    template: `SELECT COUNT(*) AS joined, COUNT({1} o.id) AS orders, COUNT(DISTINCT c.id) AS customers
FROM customers c
JOIN orders o ON {2}
JOIN order_items oi ON {3};`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the first dedup",
        why: "COUNT(DISTINCT o.id) collapses 251 joined rows back to 103 real orders — the fan-out, undone.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the first join",
        why: "The account thread: orders.customer_id → customers.id. o.id = c.id fabricates a sixteen-row population.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the second join",
        why: "The line grain arrives via order_items.order_id → orders.id. oi.id = o.id keeps coincidence lines.",
      },
    ],
    distractors: ["ALL", "o.id = c.id", "oi.id = o.id"],
    walkthrough:
      "The capstone census: 251 joined rows carrying 103 distinct orders from 16 distinct customers — the module's whole story in one row. The ALL distractor demonstrates the stakes one last time: COUNT(ALL o.id) reads 251 'orders', the fan-out wearing an orders label, and every downstream report that copies the query inherits the lie. Both joins ride the real keys; both counts dedupe their grain; the three numbers reconcile to the book's shape. When a future query disagrees with this row, the bug is in the hops — and now you know exactly where to look.",
  },
];


