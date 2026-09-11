// Case batch J3 — Module 2 (joins) cases cs-401…cs-450.
// 50 cases: 17 easy / 16 medium / 17 hard. Topic spread j1×4, j2×7, j3×7,
// j4×6, j5×6, j6×5, j7×8, j8×7. Figures probed on the live seed db and
// mechanically audited by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesJ3: CaseStudy[] = [
  {
    id: "cs-401",
    tier: "easy",
    topic: "j1",
    universe: "catalog",
    title: "Deep-stock catalog page",
    brief:
      "From: Catalog ops. Re: the deep-stock page.\n\nThe binder's deep-stock page lists products holding 200+ units, each with its maker's name — heaviest shelf first. Join the catalog to its makers so the page says who to call, not just what to count.",
    ask: "Products with 200+ units of stock: name, stock, supplier name — heaviest first.",
    template: `SELECT p.name, p.stock, s.name
FROM products p
JOIN suppliers s ON {1}
WHERE p.{2} >= {3}
ORDER BY p.stock DESC;`,
    slots: [
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the join condition",
        why: "products.supplier_id → suppliers.id names the maker. s.id = p.id pairs supplier ids with product ids by coincidence.",
      },
      {
        answer: "stock",
        kind: "keyword",
        label: "the depth column",
        why: "'200+ units' filters the stock count: p.stock >= 200. p.price >= 200 matches nothing — nothing lists above 200.",
      },
      {
        answer: "200",
        kind: "number",
        label: "the depth floor",
        why: "The page's floor is 200 units. At 300 the list shrinks to three products and loses the desk mat.",
        noVerify: true,
      },
    ],
    distractors: ["s.id = p.id", "price", "300"],
    walkthrough:
      "Two tables, one floor, one sort: the catalog joined to its makers on the real key, stock pinned at 200+, heaviest first. Run it and five products make the page: HDMI 2.1 Cable at 500, Running Socks at 400, Wireless Mouse at 300, Desk Mat Extended at 260, Yoga Mat Eco at 220 — and the maker column tells the restock story: Pacific Textiles and Shenzhen Electro own the deep shelves. The price distractor filters a currency where a count belongs — zero rows, no error, an empty binder page that looks like a quiet quarter.",
  },
  {
    id: "cs-402",
    tier: "easy",
    topic: "j1",
    universe: "growth",
    title: "The one-order accounts",
    brief:
      "From: Head of Growth. Re: the single-purchase cohort.\n\nThe re-engagement list starts here: customers whose entire book is ONE order. Join orders to accounts, bucket per customer, keep only the count-1 buckets, alphabetical. Two names expected — confirm it.",
    ask: "Customers with exactly one order: name and city, alphabetical.",
    template: `SELECT c.name, c.city
FROM customers c
JOIN orders o ON {1}
GROUP BY c.id
{2} COUNT(o.id) = {3}
ORDER BY c.name;`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "'Exactly one order' filters a COUNT per customer — HAVING after GROUP BY. WHERE errors on aggregates.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the single-order pin",
        why: "The cohort is count = 1, not >= 1 (that's everyone). At 2 the list becomes the two-order accounts instead.",
        noVerify: true,
      },
    ],
    distractors: ["o.id = c.id", "WHERE", "2"],
    walkthrough:
      "The single-purchase cohort in one shape: real join, group per account, HAVING pins the count at exactly 1. Run it and two names surface — Olivia Brown (London) and Liam O'Brien (Cork) — the book's only one-order accounts. The floor's sensitivity is the teaching point: at 2 the list swaps to Jamal, Dmitri and Bruno's two-order books, a completely different outreach list. WHERE can't run this filter at all — COUNT doesn't exist before grouping, and SQLite says so with 'misuse of aggregate'.",
  },
  {
    id: "cs-403",
    tier: "easy",
    topic: "j1",
    universe: "fraud",
    title: "Chloe's open paper",
    brief:
      "From: Fraud spot-check desk. Re: sample pull, one account.\n\nThe desk samples one account's open paper: Chloe Dubois. Pull her open invoice with its amount owed — account joined to billing on the real key, both pins in place. One row expected; more means the pins are wrong.",
    ask: "Chloe Dubois's open invoice: number and amount owed (in units).",
    template: `SELECT i.number, ROUND(i.amount_cents / 100.0, 2) AS owed
FROM customers c
JOIN invoices i ON {1}
WHERE c.name = {2} AND i.status = {3};`,
    slots: [
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real ownership thread: invoices.customer_id → customers.id. c.id = i.number compares a customer id to text like 'INV-2024-021'.",
      },
      {
        answer: "'Chloe Dubois'",
        kind: "keyword",
        label: "the account literal",
        why: "The sampled account, quoted — names are text. The bare words parse as identifiers and the query errors.",
      },
      {
        answer: "'open'",
        kind: "keyword",
        label: "the status literal",
        why: "The desk wants OPEN paper. 'paid' would return her settled invoices instead — a clean bill where a flag belongs.",
      },
    ],
    distractors: ["c.id = i.number", "'Maya Patel'", "'paid'"],
    walkthrough:
      "A single-account evidence pull: the real ownership join, the name pin, the status pin. Run it and exactly one row returns — INV-2024-021 owed 1,295.00, Chloe's one and only invoice, sitting open. The pins are what make it evidence: change the account and you sample Maya's four-invoice book; change the status and the 'open' flag disappears. Every row the desk files needs both pins or the sample isn't the sample.",
  },
  {
    id: "cs-404",
    tier: "hard",
    topic: "j1",
    universe: "month-close",
    title: "The early-pay discount grid",
    brief:
      "From: Financial Controller. Re: settlement discount accrual.\n\nEU paid invoices earn a 2% early-settlement discount in the accrual model. Build the grid: each EU paid invoice's owner and its discounted value — amount × 0.98, cents converted, rounded. Biggest discounted value first; the accrual reconciles to this grid.",
    ask: "EU invoices at status 'paid': owner and amount × 0.98 (units, rounded), biggest first.",
    template: `SELECT c.name, ROUND(i.amount_cents * {1} / 100.0, 2) AS discounted
FROM customers c
JOIN invoices i ON {2}
WHERE c.region = {3} AND i.status = {4}
ORDER BY discounted {5};`,
    slots: [
      {
        answer: "0.98",
        kind: "number",
        label: "the discount multiplier",
        why: "A 2% discount leaves 98% of the balance: multiply by 0.98. 1.02 would accrue an increase instead of a discount.",
        noVerify: true,
      },
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real ownership thread: invoices.customer_id → customers.id. c.id = i.id pairs customer ids with invoice ids by coincidence.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region literal",
        why: "Region codes are uppercase: 'EU'. The lowercase 'eu' matches nothing and the accrual grid posts empty.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the status literal",
        why: "The discount applies to settled paper: 'paid'. 'open' would discount the receivables instead of the settlements.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The accrual memo leads with the biggest discounted settlement: DESC.",
      },
    ],
    distractors: ["1.02", "c.id = i.id", "'eu'", "'open'", "ASC"],
    walkthrough:
      "Per-row money with a directional trap: 0.98 discounts, 1.02 marks up — swap them and the accrual grows instead of shrinks, in the exact proportion the auditor will flag. The slice is EU (uppercase, or nothing matches) at status 'paid', joined on the real ownership key. Run it and the grid lists Alice Chen's settled paper at the top, each value exactly 2% under its invoice, and the region's discount total is 2% of EU paid money. Five slots, five independent ways to be quietly wrong — that's why this accrual gets a second reviewer.",
  },
  {
    id: "cs-405",
    tier: "easy",
    topic: "j2",
    universe: "inventory",
    title: "Headset revenue",
    brief:
      "From: Inventory control. Re: the premium line's money.\n\nUnits tell one story for the headset; revenue tells the other. Sum the line money — quantity times the transacted unit price — for the Noise-Canceling Headset only. One number for the premium-mix memo.",
    ask: "Total line revenue (Σ quantity × unit_price) for the Noise-Canceling Headset.",
    template: `SELECT p.name, ROUND(SUM(oi.{1}), 2) AS revenue
FROM order_items oi
JOIN products p ON {2}
WHERE p.name = {3}
GROUP BY p.id;`,
    slots: [
      {
        answer: "quantity * unit_price",
        kind: "keyword",
        label: "the money expression",
        why: "Line money is quantity × unit_price — both columns multiplied per row. unit_price alone prices every line at one unit.",
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.product_id → products.id finds the headset's lines. p.id = oi.order_id compares catalog ids to order numbers.",
      },
      {
        answer: "'Noise-Canceling Headset'",
        kind: "keyword",
        label: "the product literal",
        why: "The exact catalog name, quoted. A near-miss name matches nothing — the literal IS the key.",
      },
    ],
    distractors: ["unit_price", "p.id = oi.order_id", "'Desk Mat Extended'"],
    walkthrough:
      "The money expression is the case: quantity × unit_price, summed over the headset's lines. Run it and the premium line shows 6,888.25 — by far the biggest product revenue in the book (the Desk Mat moves more units and lands at 1,176.02). The unit_price-only distractor would report roughly a third of that — the 'one unit per line' error the module keeps warning about, arriving as a plausible-looking number. Premium mix arguments deserve the multiplied expression.",
  },
  {
    id: "cs-406",
    tier: "easy",
    topic: "j2",
    universe: "expense",
    title: "The wired money",
    brief:
      "From: Spend analyst. Re: the wire rail audit.\n\nWire transfers are the big-balance rail. List them: each wire payment's invoice number and amount, joined through the ledger so every row names its paper. Ordered by payment date, oldest first, for the audit walk.",
    ask: "All wire payments with their invoice numbers and amounts, oldest payment first.",
    template: `SELECT i.number, p.amount_cents / 100.0 AS paid
FROM payments p
JOIN invoices i ON {1}
WHERE p.method = {2}
ORDER BY p.{3};`,
    slots: [
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id is the cash-to-paper thread. Matching p.invoice_id to i.number compares a number to text.",
      },
      {
        answer: "'wire'",
        kind: "keyword",
        label: "the method literal",
        why: "The rail is 'wire' — quoted text. 'card' would audit the eleven bigger-count rail instead of the eleven wire transfers.",
      },
      {
        answer: "paid_on",
        kind: "keyword",
        label: "the date column",
        why: "'Oldest first' sorts by the payment date: p.paid_on. p.amount_cents would order by money — a leaderboard where a timeline belongs.",
      },
    ],
    distractors: ["p.invoice_id = i.number", "'card'", "amount_cents"],
    walkthrough:
      "The rail audit: payments filtered to 'wire', joined to their invoices on the real key, sorted by paid_on so the walk follows the money chronologically. Run it and eleven wire rows surface — 32,248.00 in total, averaging 2,932 per transfer against the card rail's 2,335. The date column matters more than it looks: a money-sorted 'audit' skips around in time and hides sequences; the audit walk needs the calendar order the paid_on column provides.",
  },
  {
    id: "cs-407",
    tier: "medium",
    topic: "j2",
    universe: "funnel",
    title: "Orders and lines, side by side",
    brief:
      "From: Marketing lead. Re: the regional capacity pair.\n\nFor the capacity model: per customer region, how many real ORDERS and how many joined LINES? The gap between the two is the regional fan-out the model needs. Distinct order counts, biggest line load first.",
    ask: "Per region: COUNT(DISTINCT orders) and joined line count, biggest line load first.",
    template: `SELECT c.region, COUNT(DISTINCT o.id) AS orders, COUNT(oi.id) AS lines
FROM customers c
JOIN orders o ON {1}
JOIN order_items oi ON {2}
GROUP BY c.region
ORDER BY lines {3};`,
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
        why: "The line grain arrives via order_items.order_id → orders.id. oi.id = o.id keeps only the 103 coincidence lines.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The model opens with the heaviest line load: DESC on lines.",
      },
    ],
    distractors: ["o.id = c.id", "oi.id = o.id", "ASC"],
    walkthrough:
      "The capacity pair: COUNT(DISTINCT o.id) for real orders (45, 37, 19, 2 by region), COUNT(oi.id) for joined lines (105, 88, 53, 5). The gap per region — 60, 51, 34, 3 — is the fan-out the capacity model multiplies by pick-time. The DISTINCT is what keeps the order column honest over the joined rows; without it both columns would read the line count and the model would order 2.3× too many pick paths. Two joins, both real keys, two different grains in one row — that's the whole discipline.",
  },
  {
    id: "cs-408",
    tier: "medium",
    topic: "j2",
    universe: "catalog",
    title: "Categories on the shelf",
    brief:
      "From: Catalog ops. Re: the shelf-weight matrix.\n\nFor the count week: per category, how many products and how many total shelf units? Products joined to their categories through the supplier hop is unnecessary — the category lives on the product; but the binder wants supplier regions dropped in next quarter, so build it as the join it will become.",
    ask: "Per category: product count and total shelf units, heaviest shelf first.",
    template: `SELECT p.category, COUNT(*) AS products, SUM(p.stock) AS shelf
FROM products p
JOIN suppliers s ON {1}
GROUP BY {2}
ORDER BY shelf {3};`,
    slots: [
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the join condition",
        why: "The join rides the real key now so next quarter's region column drops in cleanly: products.supplier_id → suppliers.id. s.id = p.id pairs ids by coincidence.",
      },
      {
        answer: "p.category",
        kind: "keyword",
        label: "the group key",
        why: "The buckets are categories: GROUP BY p.category. Grouping by p.id would list sixteen one-product rows — a catalog, not a matrix.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Heaviest shelf first: DESC on the unit sum. ASC would open on Fitness's single-product shelf.",
      },
    ],
    distractors: ["s.id = p.id", "p.id", "ASC"],
    walkthrough:
      "The shelf matrix: categories bucket the catalog, COUNT sizes the breadth, SUM(p.stock) weighs the shelf. Run it and Accessories carries the building — 940 units across three products (the HDMI's 500 alone is over half) — followed by Apparel at 510 and Electronics at 505. The join exists for tomorrow: today the category lives on products, but the supplier hop is pre-built so the region column lands without a rewrite. Grouping by p.id instead would print the whole catalog back as sixteen rows and call it a matrix.",
  },
  {
    id: "cs-409",
    tier: "medium",
    topic: "j2",
    universe: "supplier",
    title: "Andes' two movers",
    brief:
      "From: Supplier audit. Re: the smallest vendor check.\n\nAndes Naturals is our smallest supplier by count. Before the contract review: how do its two products actually move? Sum units per product through the line→product→supplier chain, pinned to Andes by name, biggest mover first.",
    ask: "Units sold per product for Andes Naturals SA, biggest first.",
    template: `SELECT p.name, SUM(oi.quantity) AS units
FROM order_items oi
JOIN products p ON {1}
JOIN suppliers s ON {2}
WHERE s.name = {3}
GROUP BY p.id
ORDER BY units DESC;`,
    slots: [
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the first join (line→product)",
        why: "order_items.product_id → products.id names the thing sold. p.id = oi.order_id pairs catalog entries with order numbers.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the second join (product→supplier)",
        why: "products.supplier_id → suppliers.id attaches the vendor. s.region = p.category compares 'LATAM' to 'Fitness' — never equal.",
      },
      {
        answer: "'Andes Naturals SA'",
        kind: "keyword",
        label: "the vendor literal",
        why: "The vendor is pinned by its exact name, quoted. A near-miss or wrong vendor silently audits someone else's shelf.",
      },
    ],
    distractors: ["p.id = oi.order_id", "s.region = p.category", "'Alpine Audio GmbH'"],
    walkthrough:
      "The smallest vendor's motion picture: two real joins down to Andes' products, units summed per product, biggest first. Run it and the two movers separate cleanly — Fitness Band X2 at 30 units, Bluetooth Speaker Mini at 21 — 51 units total, exactly Andes' regional footprint. The vendor pin by name (not id) keeps the audit readable; the region=category distractor would zero the whole view without an error. Two products, 51 units, and the contract review now has a baseline to negotiate against.",
  },
  {
    id: "cs-410",
    tier: "hard",
    topic: "j2",
    universe: "refund-audit",
    title: "The twice-paid invoice",
    brief:
      "From: Refunds desk. Re: the double-payment exhibit.\n\nThe audit's first exhibit is INV-2024-001 — paid twice. Build the exhibit query: count its payments and total them, joined through the ledger and pinned by the invoice's human-readable number. Both numbers go in the findings memo.",
    ask: "Payment count and total for invoice INV-2024-001.",
    template: `SELECT {1}(p.id) AS payments, ROUND(SUM(p.amount_cents) / 100.0, 2) AS total
FROM payments p
JOIN invoices i ON {2}
WHERE i.number = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the payment counter",
        why: "The exhibit counts payments: COUNT(p.id). SUM(p.id) would add id numbers — bookkeeping, not a headcount.",
      },
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id is the cash thread. p.invoice_id = i.number compares a number to text like 'INV-2024-001'.",
      },
      {
        answer: "'INV-2024-001'",
        kind: "keyword",
        label: "the invoice literal",
        why: "The exhibit pins the invoice by its human number — quoted text, exact. A one-character slip pins a different invoice silently.",
      },
    ],
    distractors: ["SUM", "p.invoice_id = i.number", "'INV-2024-005'"],
    walkthrough:
      "The double-payment exhibit: COUNT reads 2 payments, SUM reads 4,860.00 — the invoice was settled twice, and both numbers go in the memo. Pinning by the human-readable number (not the id) keeps the exhibit verifiable by anyone holding the ledger page. The SUM-of-ids distractor would print a plausible-looking 3 and a nonsense total — the kind of error that survives review because nothing errors. One invoice, two payments, one recovery action.",
  },
  {
    id: "cs-411",
    tier: "hard",
    topic: "j2",
    universe: "month-close",
    title: "The per-invoice gap, isolated",
    brief:
      "From: Financial Controller. Re: the unpaid isolation query.\n\nThe close needs the unpaid invoices isolated with their BILLED amounts visible — number, billed, and the NULL where cash should be. LEFT JOIN preserves them; the HAVING on the NULL sum isolates them; the filing order matches the ledger. Six rows expected.",
    ask: "Invoices with no cash: number, billed amount, NULL paid — filed by invoice number.",
    template: `SELECT i.number, ROUND(i.amount_cents / 100.0, 2) AS billed, ROUND(SUM(p.amount_cents) / 100.0, 2) AS paid
FROM invoices i
{1} payments p ON {2}
GROUP BY i.id
{3} SUM(p.amount_cents) IS NULL
ORDER BY {4};`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "Unpaid invoices exist only as NULL rows under LEFT JOIN. INNER JOIN deletes them and the isolation finds nothing.",
      },
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id is the cash thread. Matching i.number to p.invoice_id compares text codes to numbers.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the NULL-sum filter",
        why: "SUM(p.amount_cents) IS NULL filters a per-group aggregate — HAVING after GROUP BY. WHERE errors on aggregates.",
      },
      {
        answer: "i.number",
        kind: "keyword",
        label: "the ledger filing order",
        why: "The close files by invoice number so the six rows reconcile against the ledger page in sequence — pinned, not left to group order.",
      },
    ],
    distractors: ["JOIN", "WHERE", "c.name"],
    walkthrough:
      "The isolation query with the billed column kept visible: LEFT JOIN preserves the cash-less six, HAVING SUM(...) IS NULL isolates them, and each row shows what SHOULD have arrived next to the NULL that didn't. Run it and six rows file by number — 15,217.00 of billed paper with NULL cash, five 'open' and one reading 'paid'. The billed column is the reconciliation hook: the close can tie the NULL rows to the ledger line by line. INNER JOIN doesn't argue — it just returns an empty grid while the close signs off on money that never arrived.",
  },
  {
    id: "cs-412",
    tier: "easy",
    topic: "j3",
    universe: "catalog",
    title: "Every line's maker",
    brief:
      "From: Catalog ops. Re: the maker column on the line page.\n\nThe line-level binder page gains a maker column: each order line's supplier name, via the two-hop chain line→product→supplier. First five lines in line-id order so the page anchors to the book's head.",
    ask: "The first 5 order lines (by line id) with their supplier names.",
    template: `SELECT oi.id, s.name
FROM order_items oi
JOIN products p ON {1}
JOIN suppliers s ON {2}
ORDER BY {3}
LIMIT 5;`,
    slots: [
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the first join (line→product)",
        why: "order_items.product_id → products.id is the catalog hop. p.id = oi.order_id compares catalog entries with order numbers.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the second join (product→supplier)",
        why: "products.supplier_id → suppliers.id names the maker. Skipping this hop leaves the supplier column impossible.",
      },
      {
        answer: "oi.id",
        kind: "keyword",
        label: "the anchor sort",
        why: "'Anchored to the book's head' sorts by line id. Sorting by s.name would alphabetize suppliers instead.",
      },
    ],
    distractors: ["oi.unit_price", "s.name", "p.category"],
    walkthrough:
      "Two hops, both real: line to product to supplier, anchored by line id, trimmed to five. Run it and the first five lines carry their makers — the two-hop chain that turns 'line 1' into a vendor name. The region=category distractor is the text-equality trap ('EU' never equals 'Electronics'), and the name-sort distractor reorders the page into a supplier directory instead of a book anchor. Both produce real tables; neither produces the page the binder asked for.",
  },
  {
    id: "cs-413",
    tier: "easy",
    topic: "j3",
    universe: "inventory",
    title: "Joins that don't fan out",
    brief:
      "From: Inventory control. Re: the row-count sanity drill.\n\nNot every join multiplies. Chain lines to products to suppliers — two MANY-TO-ONE hops — and count the rows. The claim to verify: the count stays 251, because each line matches exactly one product and each product exactly one supplier.",
    ask: "Count rows through the line→product→supplier chain (expect: no fan-out).",
    template: `SELECT {1}(*) AS rows_
FROM order_items oi
JOIN products p ON {2}
JOIN suppliers s ON {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the row counter",
        why: "A row count: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the first hop",
        why: "order_items.product_id → products.id: each line matches exactly ONE product. p.id = oi.order_id pairs products with order numbers.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the second hop",
        why: "products.supplier_id → suppliers.id: each product matches exactly ONE supplier. s.region = p.category never matches.",
      },
    ],
    distractors: ["SUM", "p.id = oi.order_id", "s.region = p.category"],
    walkthrough:
      "The no-fan-out drill: two hops, both many-to-one, and the row count survives intact at 251 — one row in, one row out, twice. That's the structural counterpoint to the orders→lines join (103 → 251): fan-out happens when ONE parent matches MANY children, never the reverse. The wrong-key hops wouldn't warn you — p.id = oi.order_id would quietly keep a coincidence subset and the 'sanity count' would certify a broken chain. Sanity checks must themselves ride the real keys.",
  },
  {
    id: "cs-414",
    tier: "easy",
    topic: "j3",
    universe: "funnel",
    title: "Region lines leaderboard",
    brief:
      "From: Marketing lead. Re: the line-volume ranking.\n\nThe regional line-volume ranking for the ops review: per customer region, count the joined lines through the full chain, biggest first. Four rows, one story about where the pick-path work concentrates.",
    ask: "Joined line count per customer region, biggest first.",
    template: `SELECT c.region, {1}(oi.id) AS lines
FROM customers c
JOIN orders o ON {2}
JOIN order_items oi ON {3}
GROUP BY c.region
ORDER BY lines {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the line counter",
        why: "Line volume is a row count: COUNT(oi.id). SUM would add line ids — bookkeeping where work belongs.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the first join",
        why: "The account thread: orders.customer_id → customers.id. o.id = c.id matches order numbers to customer ids.",
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
        why: "Biggest line load first: DESC. ASC would open the review with LATAM's five lines.",
      },
    ],
    distractors: ["SUM", "o.id = c.id", "oi.id = o.id", "ASC"],
    walkthrough:
      "The full chain to line grain, bucketed by region: EU 105 lines, APAC 88, US 53, LATAM 5 — the pick-path workload in four rows. The chain discipline is the review's quiet lesson: two hops, both real keys, and the count means physical work. Break either hop and the number reroutes through id coincidences — no error, just a leaderboard that ranks nonsense. LATAM's five lines beside EU's 105 is the capacity conversation in one glance.",
  },
  {
    id: "cs-415",
    tier: "easy",
    topic: "j3",
    universe: "month-close",
    title: "Billing paper by city",
    brief:
      "From: Financial Controller. Re: the binder's billing map.\n\nThe binder's billing geography: per city, invoice count and billed money, through the account join — top three cities by money. Reminder for the footnote: every city hosts exactly one customer on this book.",
    ask: "Top 3 cities by billed invoice money (Σ ÷ 100), with invoice counts.",
    template: `SELECT c.city, COUNT(i.id) AS invoices, ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed
FROM customers c
JOIN invoices i ON {1}
GROUP BY c.city
ORDER BY billed {2}
LIMIT {3};`,
    slots: [
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real ownership thread: invoices.customer_id → customers.id. i.number = c.name compares invoice codes to people.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The binder opens with the biggest billed city: DESC on money.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the city cap",
        why: "The binder page carries three cities: LIMIT 3. At 16 the page lists every city and stops being a summary.",
        noVerify: true,
      },
    ],
    distractors: ["i.number = c.name", "ASC", "16"],
    walkthrough:
      "The billing map: invoices joined to their owners on the real key, city buckets, money first. Run it and the podium is Berlin 26,629.00 (5 invoices — Alice's whole book), Austin 13,384.00 (4 — Emma), Mumbai 11,542.00 (4 — Maya). The footnote earns its line: one customer per city means the map is a customer ranking wearing city labels, and Berlin's crown is one person's billing relationship. The count column beside the money is the honest touch — big money on few invoices reads differently than big money spread thin.",
  },
  {
    id: "cs-416",
    tier: "medium",
    topic: "j3",
    universe: "fraud",
    title: "What gets unwound",
    brief:
      "From: Fraud spot-check desk. Re: the cancellation product mix.\n\nCancellations leave processed lines behind. For the shrink review: which PRODUCTS appear on cancelled order lines, and how often? Chain orders→lines→products, filter to the cancelled slice, bucket per product, biggest repeat first.",
    ask: "Line count per product across cancelled orders, biggest repeat first.",
    template: `SELECT p.name, COUNT(oi.id) AS lines
FROM orders o
JOIN order_items oi ON {1}
JOIN products p ON {2}
WHERE o.status = {3}
GROUP BY p.id
ORDER BY lines {4};`,
    slots: [
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the line join",
        why: "Lines attach through order_items.order_id → orders.id. oi.id = o.id keeps only id-coincidence lines.",
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the product join",
        why: "order_items.product_id → products.id names the thing unwound. p.id = oi.order_id pairs products with order numbers.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status literal",
        why: "The shrink review targets the cancelled slice — quoted text. 'pending' would review the live pipeline instead.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest repeat leads the review: DESC on the line count.",
      },
    ],
    distractors: ["oi.id = o.id", "p.id = oi.order_id", "'pending'", "ASC"],
    walkthrough:
      "The unwind mix: twelve cancelled lines (the whole cancellation paper trail) bucketed per product through two real joins. Run it and the review sees which catalog items ride cancelled orders — the repeat offenders lead. The teaching edge is the status filter's position: it rides the ORDER row because lines don't carry status; the join carries it down. Break either hop and the shrink review silently counts a different population — 'pending' would review work not yet done, and the id-coincidence joins would count lines that never existed together.",
  },
  {
    id: "cs-417",
    tier: "medium",
    topic: "j3",
    universe: "supplier",
    title: "Midwest's money mix",
    brief:
      "From: Supplier audit. Re: the biggest shipper's revenue mix.\n\nMidwest Hardware is our volume leader. For the negotiation deck: revenue (Σ quantity × unit_price) per product through the chain, pinned to Midwest by name, biggest book first. The money mix sits next to the units mix on the slide.",
    ask: "Realized revenue per product for Midwest Hardware Co, biggest first.",
    template: `SELECT p.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON {1}
JOIN suppliers s ON {2}
WHERE s.name = {3}
GROUP BY p.id
ORDER BY revenue {4};`,
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
        why: "products.supplier_id → suppliers.id attaches the vendor. s.region = p.category compares 'US' to 'Audio' — never equal.",
      },
      {
        answer: "'Midwest Hardware Co'",
        kind: "keyword",
        label: "the vendor literal",
        why: "The vendor pinned by exact name, quoted. A wrong vendor literal silently audits someone else's revenue.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest revenue book first — the negotiation slide opens on the headset's money, not the yoga mat's.",
      },
    ],
    distractors: ["p.id = oi.order_id", "s.region = p.category", "'Shenzhen Electro'", "ASC"],
    walkthrough:
      "The volume leader's money mix: two real joins down to Midwest's three products, realized money summed per product, biggest first. The headset line anchors the slide — 6,888.25 of the mix, the single biggest product revenue in the book — with the laptop stand and yoga mat underneath. The realized expression (transacted unit_price) keeps the slide reconcilable to the 34,833.28 book total; catalog list prices would drift it. Volume leader ≠ revenue leader per product, and this query is how the deck shows it.",
  },
  {
    id: "cs-418",
    tier: "hard",
    topic: "j3",
    universe: "growth",
    title: "The three-thousand-spend club",
    brief:
      "From: Head of Growth. Re: the VIP floor.\n\nThe VIP program needs its floor: customers whose line-grain spend reaches 3,000. Full chain to lines, spend = Σ quantity × unit_price, HAVING applies the floor to the sums, biggest book first. The floor number is policy — expect it to move.",
    ask: "Customers with 3,000+ line-grain spend (Σ quantity × unit_price), biggest first.",
    template: `SELECT c.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS spend
FROM customers c
JOIN orders o ON {1}
JOIN order_items oi ON {2}
GROUP BY c.id
{3} SUM(oi.quantity * oi.unit_price) >= {4}
ORDER BY spend {5};`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the first join",
        why: "The account thread: orders.customer_id → customers.id. o.id = c.id would spend-rank an id coincidence.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the second join",
        why: "The line grain arrives via order_items.order_id → orders.id. oi.id = o.id corrupts every sum.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the spend gate",
        why: "The 3,000 floor filters a per-group SUM — HAVING after GROUP BY. WHERE errors on aggregates.",
      },
      {
        answer: "3000",
        kind: "number",
        label: "the VIP floor",
        why: "The program's floor is 3,000. Dropping to 2,000 readmits the mid-tier books and dilutes the perk budget.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The club list opens with its biggest book: DESC.",
      },
    ],
    distractors: ["o.id = c.id", "oi.id = o.id", "WHERE", "2000", "ASC"],
    walkthrough:
      "The VIP floor as a query: line-grain spend per customer, HAVING at 3,000, sorted down. Run it and four books qualify — Alice 7,262.35, Emma 6,640.56, Grace 4,574.23, Maya 3,644.56 — with Chloe's 2,667.93 the near-miss that shows the floor biting. The floor is a policy lever: drop it to 2,000 and Chloe joins, changing the perk budget in one keystroke — which is why the number lives in the query where everyone can see it move. The WHERE distractor can't even run: aggregates don't exist before grouping.",
  },
  {
    id: "cs-419",
    tier: "easy",
    topic: "j4",
    universe: "expense",
    title: "The supplier stability view",
    brief:
      "From: Spend analyst. Re: the vendor list that can't lose rows.\n\nThe vendor view must survive a delisting: build it with the preserving join so a supplier with zero products would still appear — at zero — instead of vanishing from the page. Product count per supplier, ties alphabetical.",
    ask: "Product count per supplier (built to survive a zero-product supplier), ties alphabetical.",
    template: `SELECT s.name, COUNT(p.id) AS products
FROM suppliers s
{1} products p ON {2}
GROUP BY s.id
ORDER BY products {3}, s.name;`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "The view is built for the zero-product day: LEFT JOIN keeps every supplier row, filling NULLs that COUNT reads as 0. INNER JOIN deletes the row instead.",
      },
      {
        answer: "p.supplier_id = s.id",
        kind: "keyword",
        label: "the join condition",
        why: "products.supplier_id → suppliers.id is the ownership thread. p.id = s.id pairs products 1–6 with suppliers 1–6 by coincidence.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Deepest catalog first, ties alphabetical: DESC then name.",
      },
    ],
    distractors: ["UNION", "p.id = s.id", "ASC"],
    walkthrough:
      "The stability view: LEFT JOIN so the page can't lose a vendor, COUNT(p.id) reading NULL as zero, the two-key sort keeping ties deterministic. Run it and six suppliers appear — four at three products, Alpine and Andes at two. Today the LEFT is future-proofing (every supplier has products), but the shape is the point: a vendor page that deletes rows under pressure isn't a vendor page. The id-coincidence join would show a phantom six-product supplier and hide a real one — stability views get audited for exactly that.",
  },
  {
    id: "cs-420",
    tier: "easy",
    topic: "j4",
    universe: "month-close",
    title: "The twice-paid five",
    brief:
      "From: Financial Controller. Re: the duplicate-settlement census.\n\nFive invoices were settled twice — the census for the recovery memo. LEFT JOIN payments onto invoices, keep only the buckets where the payment count reaches two, file by count then number. Expect five rows.",
    ask: "Invoices with two or more payments: number and payment count.",
    template: `SELECT i.number, COUNT(p.id) AS payments
FROM invoices i
{1} payments p ON {2}
GROUP BY i.id
{3} COUNT(p.id) >= 2
ORDER BY payments, i.number;`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "The census rides a LEFT JOIN so unpaid invoices exist as zero-buckets the HAVING can then exclude — the contrast is the audit trail.",
      },
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id is the cash thread. Matching p.invoice_id to i.number compares a number to text.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the double-payment gate",
        why: "COUNT(p.id) >= 2 filters a per-group count — HAVING after GROUP BY. WHERE errors on aggregates.",
      },
    ],
    distractors: ["UNION", "p.invoice_id = i.number", "WHERE"],
    walkthrough:
      "The duplicate-settlement census: LEFT JOIN preserves all 28 invoices as buckets, HAVING keeps only the buckets holding two or more payments. Run it and five rows file out — INV-2024-001, INV-2024-005, INV-2024-012, INV-2024-019, INV-2024-022, each at 2 payments, 24,940.00 settled twice in total. The LEFT isn't decoration: it's what makes the census exhaustive — every invoice was considered, five qualified, twenty-three didn't. INNER JOIN would silently exclude the zero buckets and the memo could no longer claim a full sweep.",
  },
  {
    id: "cs-421",
    tier: "medium",
    topic: "j4",
    universe: "refund-audit",
    title: "The two-hop census",
    brief:
      "From: Refunds desk. Re: the chain census row.\n\nOne reconciliation row, three counts: rows in the full customer→invoice→payment chain, matched invoices, matched payments. The three numbers — 38, 33, 27 on a healthy book — ARE the reconciliation; any drift means a broken hop.",
    ask: "One row: chain row count, matched invoice count, matched payment count.",
    template: `SELECT COUNT(*) AS rows_, {1}(i.id) AS invoices, COUNT(p.id) AS payments
FROM customers c
{2} invoices i ON {3}
LEFT JOIN payments p ON p.invoice_id = i.id;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the matched-invoice counter",
        why: "COUNT(i.id) skips NULL-filled rows — the matched count. SUM(i.id) would add id numbers and print a meaningless census.",
      },
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the first hop's join",
        why: "The census needs the never-invoiced as NULL rows — they're why rows_ (38) exceeds invoices (33). INNER JOIN hides the five.",
      },
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the first hop's condition",
        why: "The real thread: invoices.customer_id → customers.id. i.number = c.name compares invoice codes to people.",
      },
    ],
    distractors: ["SUM", "JOIN", "i.number = c.name"],
    walkthrough:
      "The chain census in one row: 38 rows ride the preserved chain, 33 carry a real invoice, 27 carry a real payment. Each gap is a named population — 5 never invoiced, 6 more with paper but no cash. That triple is the desk's morning check: today it reads 38/33/27; the day any number moves, the drill says which hop broke. SUM-in-COUNT-slot would print plausible garbage (the sum of invoice ids), which is the census's own warning: reconciliation numbers must be counts of real matches, never arithmetic on keys.",
  },
  {
    id: "cs-422",
    tier: "medium",
    topic: "j4",
    universe: "funnel",
    title: "The unbilled five, in orders",
    brief:
      "From: Marketing lead. Re: are the unbilled accounts actually dead?\n\nThe five never-invoiced accounts look like gaps — but are they alive? Join the anti-join to their ORDER books: the five names with their order counts, quietest book first. If the books are active, the billing gap is a process failure, not dormancy.",
    ask: "The never-invoiced five with their order counts, quietest book first.",
    template: `SELECT c.name, COUNT(o.id) AS orders
FROM customers c
LEFT JOIN invoices i ON {1}
LEFT JOIN orders o ON o.customer_id = c.id
WHERE i.id IS {2}
GROUP BY c.id
ORDER BY orders {3};`,
    slots: [
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the billing join",
        why: "The anti-join rides the real ownership thread: invoices.customer_id → customers.id. i.number = c.name compares codes to people.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'Never invoiced' is i.id IS NULL. IS NOT NULL would flip the query to the eleven billed customers.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "'Quietest book first' is ascending on the order count — the dormancy suspects lead the page.",
      },
    ],
    distractors: ["i.number = c.name", "NOT", "DESC"],
    walkthrough:
      "The liveness check for the billing gap: the anti-join isolates the five, the second (preserving) join counts their orders. Run it and the books are alive — Keiko Sato 4, Noah Meyer 4, Farid Nasser 3, Bruno Silva 2, Dmitri Volkov 2. Fourteen orders across five accounts that have never received an invoice: that's not dormancy, that's a billing process hole. The NOT distractor would audit the eleven billed customers instead — a full page of process working correctly, telling the team nothing about the hole.",
  },
  {
    id: "cs-423",
    tier: "hard",
    topic: "j4",
    universe: "supplier",
    title: "Shelf value, gated",
    brief:
      "From: Supplier audit. Re: the working-capital floor.\n\nThe memo's vendor list keeps only suppliers whose shelf value clears 20,000 — price times stock summed over their products, the preserving join so a delisted vendor would show at NULL rather than vanish. Biggest value first; the floor is the policy lever.",
    ask: "Suppliers with 20,000+ shelf value (Σ price × stock), biggest first.",
    template: `SELECT s.name, ROUND(SUM(p.price * p.stock), 2) AS shelf_value
FROM suppliers s
{1} products p ON {2}
GROUP BY s.id
{3} SUM(p.price * p.stock) >= {4}
ORDER BY shelf_value {5};`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "The memo's vendor universe is all suppliers — LEFT JOIN keeps a future zero-product vendor visible as a NULL row the floor then excludes explicitly.",
      },
      {
        answer: "p.supplier_id = s.id",
        kind: "keyword",
        label: "the join condition",
        why: "products.supplier_id → suppliers.id is the ownership thread. p.supplier_id = s.region compares numbers to text like 'US'.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the value gate",
        why: "The 20,000 floor filters a per-group SUM — HAVING after GROUP BY. WHERE errors on aggregates.",
      },
      {
        answer: "20000",
        kind: "number",
        label: "the value floor",
        why: "The memo keeps vendors from 20,000 up. At 25,000 only Nordic survives and the list loses its comparison value.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The heaviest parked capital leads: DESC.",
      },
    ],
    distractors: ["UNION", "p.supplier_id = s.region", "WHERE", "25000", "ASC"],
    walkthrough:
      "The working-capital gate: shelf value = Σ(price × stock) per vendor, HAVING at 20,000, sorted down. Run it and four vendors clear the floor — Nordic 27,828.40, Shenzhen 23,748.50, Midwest 23,689.40, Andes 20,102.90 — with Pacific (18,810.00) and Alpine (11,852.40) below the line. Raise the floor to 25,000 and the memo shrinks to one name: a policy lever the committee can see move. The WHERE distractor can't filter sums at all; the region=text join can't even start.",
  },
  {
    id: "cs-424",
    tier: "hard",
    topic: "j4",
    universe: "month-close",
    title: "Pending exposure, the eight holders",
    brief:
      "From: Financial Controller. Re: the pipeline-holder view.\n\nThe close tracks pending exposure per account: pending orders attached with the filter INSIDE the join, zero buckets excluded by HAVING (the quiet accounts are tracked elsewhere), exposure sorted down. Eight accounts hold the pipeline.",
    ask: "Customers holding 1+ pending orders: name, count, and exposure (Σ pending totals), biggest first.",
    template: `SELECT c.name, COUNT(o.id) AS pending, ROUND(SUM(o.total), 2) AS exposure
FROM customers c
LEFT JOIN orders o ON {1} AND o.status = {2}
GROUP BY c.id
{3} COUNT(o.id) >= 1
ORDER BY exposure {4};`,
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
        label: "the status literal",
        why: "The pipeline is 'pending' — quoted text, and INSIDE the ON so the other customers survive as NULL rows the HAVING then excludes.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the holder gate",
        why: "COUNT(o.id) >= 1 drops the zero buckets explicitly — an inner join would drop them silently and lose the 'eight of sixteen' context.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest exposure leads the close note: DESC.",
      },
    ],
    distractors: ["o.id = c.id", "'delivered'", "WHERE", "ASC"],
    walkthrough:
      "The pipeline-holder view: the status filter rides inside the ON (coverage preserved), HAVING explicitly keeps only the holders, exposure sorted down. Run it and eight accounts hold the 14 pending orders — Alice 3, Emma 3, Chloe 2, Maya 2, plus four single-order holders — 6,113.00 of pipeline in named hands. The explicit HAVING is the audit trail: eight holders out of sixteen accounts, with the other eight excluded on purpose rather than by a join type nobody noticed. Move the filter to WHERE and the exclusion becomes silent — the close note loses its denominator.",
  },
  {
    id: "cs-425",
    tier: "easy",
    topic: "j5",
    universe: "catalog",
    title: "The EU billing gap",
    brief:
      "From: Catalog ops. Re: the regional gap, named.\n\nThe regional coverage review starts with Europe: which EU accounts have never been invoiced? The anti-join pinned to 'EU', names and cities out, alphabetical. Two rows expected.",
    ask: "Never-invoiced EU customers: name and city, alphabetical.",
    template: `SELECT c.name, c.city
FROM customers c
LEFT JOIN invoices i ON {1}
WHERE i.id IS {2} AND c.region = {3}
ORDER BY c.name;`,
    slots: [
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real ownership thread: invoices.customer_id → customers.id. Matching i.number to the customer name compares codes to people.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'Never invoiced' is i.id IS NULL. IS NOT NULL returns the billed six EU accounts instead.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region pin",
        why: "Region codes are uppercase: 'EU'. The lowercase 'eu' matches nothing and the review starts from a silent empty page.",
      },
    ],
    distractors: ["i.number = c.name", "NOT", "'eu'"],
    walkthrough:
      "The regional gap, named: the anti-join isolates never-invoiced accounts, the region pin narrows to Europe. Run it and two rows return — Dmitri Volkov (Tallinn) and Noah Meyer (Hamburg) — Europe's share of the five-account billing gap. Both are real addresses with real order books, which is what makes the gap actionable rather than statistical. The lowercase 'eu' is the classic silent failure: the query runs, returns nothing, and the coverage review opens with a clean sheet that isn't clean.",
  },
  {
    id: "cs-426",
    tier: "easy",
    topic: "j5",
    universe: "funnel",
    title: "The unpaid, by claim",
    brief:
      "From: Refunds desk. Re: the anomaly census.\n\nThe unpaid six, grouped by what the LEDGER claims: per invoice status, how many invoices carry no cash? The shape exposes the anomaly without naming it — a row where the claim says settled and the count says otherwise.",
    ask: "Count of zero-payment invoices per invoice status.",
    template: `SELECT i.status, {1}(*) AS unpaid
FROM invoices i
{2} payments p ON {3}
WHERE p.id IS {4}
GROUP BY i.status
ORDER BY unpaid {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the census counter",
        why: "A census is a count: COUNT(*). SUM(*) and AVG(*) are invalid over the placeholder.",
      },
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "Unpaid invoices exist only as NULL rows under LEFT JOIN — the population the WHERE then keeps.",
      },
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
        why: "'No payment' is p.id IS NULL. IS NOT NULL would census the 21 paid invoices instead.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "Smallest group first puts the anomaly's 1-row group on top — the census leads with the exception.",
      },
    ],
    distractors: ["SUM", "JOIN", "NOT", "DESC"],
    walkthrough:
      "The anomaly census: the anti-join isolates the six zero-payment invoices, then the status GROUP BY groups them by what the ledger claims. Run it and two rows return — five invoices claiming 'open' (business as usual) and one claiming 'paid' (the anomaly, alone in its row). The sort direction matters: ascending puts the 1-row anomaly group first, where a human reads it; descending buries the exception under the expected. INNER JOIN would census nothing and the anomaly would ride another quarter.",
  },
  {
    id: "cs-427",
    tier: "medium",
    topic: "j5",
    universe: "growth",
    title: "The pitchable-account census",
    brief:
      "From: Head of Growth. Re: who we CAN pitch.\n\nThe exclusion list's mirror: per region, how many accounts DO have a billing relationship? Inner join (only billed accounts count), distinct accounts per region, biggest first. The missing region is the story.",
    ask: "Count of DISTINCT billed accounts per region, biggest first.",
    template: `SELECT c.region, COUNT({1} c.id) AS billed_accounts
FROM customers c
JOIN invoices i ON {2}
GROUP BY c.region
ORDER BY billed_accounts {3};`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the account dedup",
        why: "A customer with five invoices must count once: DISTINCT collapses the join's fan-out. ALL (the default) would count invoice rows, not accounts.",
      },
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real ownership thread: invoices.customer_id → customers.id. i.number = c.name compares codes to people.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest pitchable base leads the map — the sales leads read Europe's six accounts first, not alphabetically.",
      },
    ],
    distractors: ["ALL", "i.number = c.name", "ASC"],
    walkthrough:
      "The mirror census: the inner join keeps only billed accounts, COUNT(DISTINCT c.id) collapses each one's invoices to a single account. Run it and the pitch map reads EU 6, APAC 3, US 2 — and LATAM is absent entirely: Bruno Silva, the region's whole market, has never been billed and therefore can't be pitched. The ALL distractor demonstrates the fan-out in reverse — EU would read 14 (invoices) instead of 6 (accounts), and the sales team would think Europe has fourteen contacts. Same rows, different grain, different plan.",
  },
  {
    id: "cs-428",
    tier: "hard",
    topic: "j5",
    universe: "fraud",
    title: "The dark-account count",
    brief:
      "From: Fraud spot-check desk. Re: the dashboard number.\n\nThe watchlist dashboard needs the dark-account count as ONE number: customers with no invoices AND no pending orders. Two preserving joins, both emptiness tests, count what survives both. Three is the expected value — the query must prove it every run.",
    ask: "Count of customers with zero invoices AND zero pending orders.",
    template: `SELECT {1}(*) AS dark
FROM customers c
LEFT JOIN invoices i ON i.customer_id = c.id
{2} orders o ON o.customer_id = c.id AND o.status = {3}
WHERE i.id IS {4} AND o.id IS NULL;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the census counter",
        why: "A dashboard count: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the second hop's join",
        why: "Both hops must preserve: INNER at the orders step kills the NULL-invoice rows before the WHERE can test them.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the in-flight literal",
        why: "'Dark' means no PENDING business — quoted text. 'shipped' would hunt accounts with no dispatch history: a bigger, different cohort.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the second emptiness column",
        why: "The invoice test is hardcoded (i.id IS NULL); the pending test needs its own column: o.id IS NULL. Testing c.id — never NULL — finds zero rows.",
      },
    ],
    distractors: ["SUM", "INNER", "'shipped'", "c.id"],
    walkthrough:
      "The dashboard number, built to be re-proven: two preserved joins (invoices, then pending-filtered orders), two emptiness tests, one count. Run it and the dashboard shows 3 — Bruno Silva, Dmitri Volkov, Noah Meyer, dark on both axes. Every keyword defends the number: INNER at hop two deletes the finding, 'shipped' redefines darkness, and c.id in the second test finds zero rows because customer ids are never NULL. The value ties to the named list — a dashboard count that can't name its three rows is a count nobody should trust.",
  },
  {
    id: "cs-429",
    tier: "hard",
    topic: "j5",
    universe: "refund-audit",
    title: "Exposure geography",
    brief:
      "From: Refunds desk. Re: where the stuck money lives.\n\nThe collections roadmap needs the unpaid exposure mapped: unpaid invoices joined to their owners' regions — count and money per region, biggest exposure first. The map has a hole by construction: a region with no invoices can't have stuck cash.",
    ask: "Per region: count and total of zero-payment invoices (Σ ÷ 100), biggest exposure first.",
    template: `SELECT c.region, COUNT(i.id) AS unpaid, ROUND(SUM(i.amount_cents) / 100.0, 2) AS exposure
FROM invoices i
JOIN customers c ON {1}
LEFT JOIN payments p ON p.invoice_id = i.id
WHERE p.id IS {2}
GROUP BY c.region
ORDER BY exposure {3};`,
    slots: [
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the owner join",
        why: "The real ownership thread: invoices.customer_id → customers.id. i.number = c.id pairs invoice codes with customer numbers.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'No payment' is p.id IS NULL on the preserved rows. IS NOT NULL would map the 21 PAID invoices — the opposite geography.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The roadmap starts where the stuck money is thickest: DESC on exposure.",
      },
    ],
    distractors: ["i.number = c.id", "NOT", "ASC"],
    walkthrough:
      "Exposure geography: the anti-payment slice (LEFT JOIN, IS NULL) joined onward to the owners' regions. Run it and three rows map the stuck money — EU leads with four invoices (Pedro's, Chloe's, Liam's and Isabella's paper) worth 8,524.00, then US with Emma's 4,937.00 and APAC with Hiro's 1,756.00. LATAM is absent by construction: no invoices, nothing to stick. The roadmap's first call writes itself from the top row — and the inner-join-to-customers is safe here because every invoice HAS an owner; the hole lives on the payments side, which is where the LEFT JOIN sits.",
  },
  {
    id: "cs-430",
    tier: "hard",
    topic: "j5",
    universe: "inventory",
    title: "The gap, bucketed honestly",
    brief:
      "From: Inventory control. Re: the reconciliation bucket choice.\n\nThe unpaid six need bucketing for the reconciliation review — but the GROUP BY choice is the case: bucket by the ledger's claim and the anomaly appears; bucket by anything else and it hides. Build it with the status bucket, both aggregates in the row.",
    ask: "Per invoice status: count and exposure of zero-payment invoices (Σ ÷ 100).",
    template: `SELECT i.{1}, COUNT(*) AS unpaid, ROUND(SUM(i.amount_cents) / 100.0, 2) AS exposure
FROM invoices i
LEFT JOIN payments p ON {2}
WHERE p.id IS {3}
GROUP BY i.status
ORDER BY exposure DESC;`,
    slots: [
      {
        answer: "status",
        kind: "keyword",
        label: "the claim bucket",
        why: "The ledger's claim is the audit axis: GROUP BY i.status puts the 'paid'-with-no-cash row in its own bucket. Grouping by customer would hide the anomaly among owner groups.",
      },
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
        why: "'No payment' is p.id IS NULL. IS NOT NULL buckets the 21 paid invoices — the complement of the gap.",
      },
    ],
    distractors: ["p.invoice_id = i.number", "i.customer_id", "NOT"],
    walkthrough:
      "The bucketed gap: the anti-payment slice grouped by the LEDGER'S OWN CLAIM. Run it and two buckets return — 'open' holding five invoices, and 'paid' holding one: an invoice the ledger calls settled with zero cash behind it, isolated in a row nobody can scroll past. The customer_id distractor would bucket by owner and the anomaly would sit quietly inside some region's numbers — real table, real rows, wrong axis. Reconciliation queries choose buckets the way auditors choose columns: by what makes the exception impossible to file away.",
  },
  {
    id: "cs-431",
    tier: "easy",
    topic: "j6",
    universe: "funnel",
    title: "Grace's internal pairs",
    brief:
      "From: Marketing lead. Re: the third account deep-dive.\n\nThe pairing study continues: how many distinct order pairs sit inside Grace Kim's 14-order book? Same guarded self-join, pinned to her account id. The deck's third number, next to Alice's 276 and Emma's 136.",
    ask: "Count of same-customer order pairs (o1.id < o2.id) for customer 7 only.",
    template: `SELECT {1}(*) AS pairs
FROM orders o1
JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id {2} o2.id
WHERE o1.customer_id = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number: COUNT(*). SUM(*) errors on the placeholder.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the guard operator",
        why: "Strict less-than: each pair once, no self-pairs. <= would add her 14 self-matches — 105 instead of 91.",
      },
      {
        answer: "7",
        kind: "number",
        label: "the pinned customer id",
        why: "Grace Kim is customer 7 — the pin narrows the 624 book-wide pairs to her footprint. Customer 13 (Maya) would give 78.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "<=", "13"],
    walkthrough:
      "The pairing study's third pin: customer 7, guarded self-join. Grace's 14 orders pair among themselves — 14 choose 2, which is 14×13÷2 = 91. The deck's series now shows the square-law in three points: Alice 276 (24 orders), Emma 136 (17), Grace 91 (14) — pairs grow with the SQUARE of book size, so modest order-count gaps produce huge pairing gaps. The <= distractor quietly adds fourteen self-matches; at the account level those fake twins are exactly the false positives the fraud desk complains about.",
  },
  {
    id: "cs-432",
    tier: "easy",
    topic: "j6",
    universe: "fraud",
    title: "The unguarded order pairing",
    brief:
      "From: Fraud spot-check desk. Re: the other raw count that lies.\n\nThe customer version lied by doubling; the ORDER version lies the same way. Reproduce it: same-customer order rows joined with NO id guard at all. Count the raw rows, then decompose the inflation — the arithmetic is the lesson.",
    ask: "Count of same-customer order pairs with NO id guard (the raw, over-counting version).",
    template: `SELECT {1}(*) AS rows_
FROM orders o1
{2} orders o2 ON {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A raw row count: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "The reproduction is a plain inner self-join. UNION cannot appear in FROM; a conditionless LEFT JOIN would behave differently but isn't what the exhibit ran.",
      },
      {
        answer: "o1.customer_id = o2.customer_id",
        kind: "keyword",
        label: "the unguarded pairing",
        why: "The exhibit pairs on customer equality alone — no guard, so every pair counts twice and every order pairs with itself.",
      },
    ],
    distractors: ["SUM", "UNION", "o1.id = o2.id"],
    walkthrough:
      "The order-side raw count: same-customer equality, no guard. Run it and the count reads 1,351 — the honest 624 pairs doubled (1,248) plus 103 self-matches (every order pairs with itself, since its customer equals its own customer). The decomposition is the lesson: 624 × 2 + 103 = 1,351. One guard — o1.id < o2.id — kills both problems at once. The o1.id = o2.id distractor is the wrong fix attempt: it keeps ONLY the 103 self-matches, measuring nothing anyone asked about.",
  },
  {
    id: "cs-433",
    tier: "medium",
    topic: "j6",
    universe: "growth",
    title: "Lines that share a basket",
    brief:
      "From: Head of Growth. Re: the multi-line basket census.\n\nHow many line PAIRS live inside the same basket? Self-join the lines on order, guard the ids, count. The number is the cross-sell denominator: every pair is a chance two products appeared together.",
    ask: "Count of same-order line pairs (a.id < b.id) across all baskets.",
    template: `SELECT {1}(*) AS pairs
FROM order_items a
{2} order_items b ON {3} AND a.id < b.id;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A pair total: COUNT(*). SUM(*) errors over the placeholder.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "Pair-matching is an inner self-join — every line matches itself, so LEFT and INNER agree here; only error tokens differ.",
      },
      {
        answer: "a.order_id = b.order_id",
        kind: "keyword",
        label: "the same-basket condition",
        why: "'Same basket' is order equality across the aliases: order_id = order_id. a.product_id = b.order_id compares catalog ids to order numbers.",
      },
    ],
    distractors: ["SUM", "UNION", "a.product_id = b.order_id"],
    walkthrough:
      "The cross-sell denominator: lines paired with lines of the same order, guarded. Run it and the census reads 242 pairs — and the derivation proves it: 23 four-line orders give 23×6, 25 three-line orders give 25×3, 29 two-line orders give 29×1 — 138 + 75 + 29 = 242. Each of those pairs is two products that shared a basket, the raw material of the affinity analysis. The product/order-id distractor is the grain error in its natural habitat: catalog ids compared against order numbers, a join that runs and means nothing.",
  },
  {
    id: "cs-434",
    tier: "hard",
    topic: "j6",
    universe: "month-close",
    title: "Same-city order pairing",
    brief:
      "From: Financial Controller. Re: the co-location exposure test.\n\nCompliance wants to know whether orders pair up across customers in the SAME city — the co-location exposure. Chain both orders to their customers, pair on city, count. Expect zero, and be ready to say exactly why the zero is correct.",
    ask: "Count of order pairs (o1.id < o2.id) whose customers share a city.",
    template: `SELECT {1}(*) AS same_city_pairs
FROM orders o1
JOIN orders o2 ON o1.id < o2.id
JOIN customers c1 ON {2}
JOIN customers c2 ON {3}
WHERE c1.{4} = c2.city;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A pair count: COUNT(*). SUM(*) errors over the placeholder.",
      },
      {
        answer: "o1.customer_id = c1.id",
        kind: "keyword",
        label: "the first buyer join",
        why: "Each order rides the real account thread to its customer: orders.customer_id → customers.id. o1.id = c1.id pairs order numbers with customer ids.",
      },
      {
        answer: "o2.customer_id = c2.id",
        kind: "keyword",
        label: "the second buyer join",
        why: "The second alias needs its OWN thread — o2.customer_id → c2.id. Reusing the first alias's condition would compare o2 to c1 and tangle the pairing.",
      },
      {
        answer: "city",
        kind: "keyword",
        label: "the co-location column",
        why: "'Same city' is city equality across the two customer aliases. c1.region = c2.city compares a region code to a city name — never equal.",
      },
    ],
    distractors: ["SUM", "o1.id = c1.id", "o2.id = c2.id", "region"],
    walkthrough:
      "The co-location test: four tables, two buyer threads, one city equality. Run it and the count is ZERO — and the zero is airtight: this book's sixteen customers live in sixteen different cities, so no two customers share a city, so no order pair can. The region distractor is the instructive near-miss: same-REGION order pairs number in the hundreds, so swapping the column flips a clean zero into a busy table without changing a single join. Column choice IS the question; the joins just carry it.",
  },
  {
    id: "cs-435",
    tier: "medium",
    topic: "j6",
    universe: "supplier",
    title: "Supplier region pairs",
    brief:
      "From: Supplier audit. Re: the smallest pairing population.\n\nThe pairing study reaches its smallest table: how many supplier pairs share a region? Guarded self-join over six suppliers — verify the count against the region roster by hand. Two pairs expected.",
    ask: "Count of same-region supplier pairs (s1.id < s2.id).",
    template: `SELECT {1}(*) AS pairs
FROM suppliers s1
JOIN suppliers s2 ON {2} AND s1.id {3} s2.id;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A pair total: COUNT(*). SUM(*) errors over the placeholder.",
      },
      {
        answer: "s1.region = s2.region",
        kind: "keyword",
        label: "the pairing condition",
        why: "Same-region means region equality across the aliases. s1.id = s2.region compares a supplier id to a region code.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the guard operator",
        why: "s1.id < s2.id: each pair once, self-pairs impossible. <= would add all six self-matches — 8 instead of 2.",
      },
    ],
    distractors: ["SUM", "<=", "s1.id = s2.region", "="],
    walkthrough:
      "The smallest pairing population: six suppliers, guarded self-join on region. Run it and the count is 2 — Nordic Gadgets & Alpine Audio share the EU, Shenzhen Electro & Pacific Textiles share the APAC, while Midwest (US) and Andes (LATAM) stand alone. Verify by hand from the roster: two regions hold two suppliers each, C(2,2) = 1 apiece. The <= distractor adds six self-matches (8); the '=' variant counts only self-matches (6) — both look like pairing counts and pair nothing. Small tables are where guards are easiest to verify by hand, which is exactly why this one gets verified.",
  },
  {
    id: "cs-436",
    tier: "easy",
    topic: "j7",
    universe: "expense",
    title: "The invoice book census",
    brief:
      "From: Spend analyst. Re: the receivables header row.\n\nThe receivables report's header: total invoice count and total billed money, over the account-to-invoice join. Two numbers, one row, reconciling to the ledger to the cent. The divisor keeps the pennies honest.",
    ask: "One row: invoice count and total billed money (Σ ÷ 100).",
    template: `SELECT COUNT(i.id) AS invoices, ROUND(SUM(i.amount_cents) / {1}, 2) AS billed
FROM customers c
{2} invoices i ON {3};`,
    slots: [
      {
        answer: "100.0",
        kind: "number",
        label: "the unit divisor",
        why: "Cents to units needs 100.0 — the decimal keeps the division float so the ROUND sees real pennies. An integer divisor floors them away.",
        noVerify: true,
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "The census runs over the ownership join. UNION cannot appear in FROM.",
      },
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real ownership thread: invoices.customer_id → customers.id. i.number = c.name compares codes to people.",
      },
    ],
    distractors: ["10.0", "UNION", "i.customer_id = c.name"],
    walkthrough:
      "The receivables header: 28 invoices, 86,977.00 billed — two numbers every downstream report must tie to. The divisor slot is quiet but load-bearing: 100.0 keeps the cents float so ROUND displays honestly; /100 (integer) would floor every balance's pennies and the header would drift from the ledger by accumulated rounding. The name=text distractor zeroes the header entirely — a report that opens with 0 invoices and 0.00 billed reads as an empty book, not a broken join.",
  },
  {
    id: "cs-437",
    tier: "easy",
    topic: "j7",
    universe: "funnel",
    title: "Delivered units",
    brief:
      "From: Marketing lead. Re: the fulfillment volume stat.\n\nThe fulfillment slide needs the delivered book's physical volume: total units across DELIVERED orders' lines. Real join, status pin, quantity summed. One number under the chart.",
    ask: "Total units (Σ quantity) across delivered orders' lines.",
    template: `SELECT {1}(oi.quantity) AS units
FROM orders o
JOIN order_items oi ON {2}
WHERE o.status = {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the volume aggregate",
        why: "Physical volume is quantity summed: SUM(oi.quantity). COUNT would count lines where boxes belong.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.order_id → orders.id reaches the line grain. oi.id = o.id keeps only id-coincidence lines.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the status literal",
        why: "The slide counts the delivered book — quoted text. 'pending' would chart the in-flight pipeline instead.",
      },
    ],
    distractors: ["COUNT", "oi.id = o.id", "'pending'"],
    walkthrough:
      "The delivered book's weight: 233 units across 119 lines (the two aggregates agree on the story). The status pin does the slicing — 'delivered' is what actually reached customers, distinct from the 76 pending units still in flight or the 20 cancelled units already unwound. The id-coincidence join would sum a coincidence subset's units and call it fulfillment — a plausible number on a slide that ships to the whole company. Volume stats get probed, not eyeballed.",
  },
  {
    id: "cs-438",
    tier: "medium",
    topic: "j7",
    universe: "inventory",
    title: "Basket depth by region",
    brief:
      "From: Inventory control. Re: the pick-path planning ratio.\n\nThe pick-path model needs lines-per-order per region: total joined lines divided by distinct orders, per customer region. The ×1.0 and the DISTINCT are both load-bearing — drop either and the ratio lies. Biggest ratio first.",
    ask: "Per region: lines per order (COUNT lines × 1.0 ÷ COUNT DISTINCT orders), biggest first.",
    template: `SELECT c.region, ROUND(COUNT(oi.id) * {1} / COUNT({2} o.id), 2) AS lines_per_order
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY c.region
ORDER BY {3} {4};`,
    slots: [
      {
        answer: "1.0",
        kind: "number",
        label: "the float coercion",
        why: "Integer ÷ integer floors in SQLite: 105/45 = 2. The ×1.0 forces float division so 2.33 stays 2.33.",
        noVerify: true,
      },
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the order dedup",
        why: "COUNT(DISTINCT o.id) collapses each order's repeated rows back to one. Without it the denominator equals the numerator and every ratio reads 1.",
      },
      {
        answer: "lines_per_order",
        kind: "keyword",
        label: "the sort column",
        why: "'Biggest ratio first' sorts by the computed alias. Sorting by c.region would alphabetize the map instead.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Deepest baskets lead: DESC on the ratio.",
      },
    ],
    distractors: ["1", "ALL", "c.region", "ASC"],
    walkthrough:
      "The ratio that needs both guards: lines ÷ DISTINCT orders per region — US 2.79 (53/19), LATAM 2.5 (5/2), APAC 2.38 (88/37), EU 2.33 (105/45). Both traps are in the query on purpose: drop the ×1.0 and integer division floors every ratio to 2 or 3; drop the DISTINCT and numerator equals denominator and every region reads 1.0. The US story is the surprise: fewest orders, deepest baskets — the pick-path model weights US stops heaviest per trip. Ratios compound small errors; both guards get their own slot.",
  },
  {
    id: "cs-439",
    tier: "medium",
    topic: "j7",
    universe: "catalog",
    title: "The category revenue podium",
    brief:
      "From: Catalog ops. Re: the money podium.\n\nThe category revenue podium for the merchandising wall: Σ(quantity × unit_price) per category, top three, realized money only. The wall's question is which categories EARN, not which ship.",
    ask: "Top 3 categories by realized revenue (Σ quantity × unit_price).",
    template: `SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON {1}
GROUP BY p.category
ORDER BY revenue {2}
LIMIT {3};`,
    slots: [
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
        why: "The podium is the top: DESC on revenue. ASC would wall the three quietest earners.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the podium cap",
        why: "Three categories on the wall: LIMIT 3. At 7 the wall lists every category and stops being a podium.",
        noVerify: true,
      },
    ],
    distractors: ["p.id = oi.order_id", "ASC", "7"],
    walkthrough:
      "The money podium: Audio 11,744.01, Wearables 6,929.12, Video 5,198.41 — the three earning categories, hung in order. Compare against the units wall (Accessories leads at 121 units) and the merchandising story splits in two: Accessories ships boxes, Audio banks money — 121 units of accessories earn less than a third of Audio's 97 units. The wrong-key join would hang a podium built from id coincidences; the ASC variant would wall Fitness's 863.91 as if it were a triumph.",
  },
  {
    id: "cs-440",
    tier: "medium",
    topic: "j7",
    universe: "pricing",
    title: "Average ticket by rail",
    brief:
      "From: Pricing committee. Re: the surcharge model inputs.\n\nThe card-surcharge model needs average payment size per method: AVG(amount) in units per payment method, biggest average first. The average is where the two rails' behavior separates.",
    ask: "Average payment amount (÷ 100) per method, biggest average first.",
    template: `SELECT p.method, ROUND({1}(p.amount_cents) / 100.0, 2) AS avg_payment
FROM payments p
JOIN invoices i ON {2}
GROUP BY p.method
ORDER BY avg_payment {3};`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean aggregate",
        why: "Average ticket is the mean: AVG(p.amount_cents). SUM would report the channel's whole book where a per-payment figure belongs.",
      },
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id ties cash to recognized paper. p.invoice_id = i.number compares a number to text.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The bigger-ticket rail leads: DESC on the average.",
      },
    ],
    distractors: ["SUM", "p.invoice_id = i.number", "ASC"],
    walkthrough:
      "The surcharge inputs: wire averages 2,931.64 per payment, card 2,335.25 — the wire rail carries the big balances. That 596-unit gap is the model's argument: surcharging the card tail barely touches the wire whales, and pricing them identically misreads both behaviors. The SUM distractor would report 32,248.00 and 37,364.00 — channel totals wearing an average's name, off by an order of magnitude in the direction that embarrasses. Aggregates are verbs; the model needs the right one.",
  },
  {
    id: "cs-441",
    tier: "hard",
    topic: "j7",
    universe: "growth",
    title: "The premium-basket leaderboard",
    brief:
      "From: Head of Growth. Re: who buys premium, line by line.\n\nThe premium-buyer list: customers ranked by AVERAGE line value — total line spend divided by line count, per customer. The chain to lines, the division guarded, top three. This is the quality-of-basket list, not the quantity one.",
    ask: "Top 3 customers by average line value (Σ line money ÷ line count).",
    template: `SELECT c.name, ROUND(SUM(oi.quantity * oi.unit_price) / COUNT(oi.id), 2) AS avg_line
FROM customers c
JOIN orders o ON {1}
JOIN order_items oi ON {2}
GROUP BY c.id
ORDER BY avg_line {3}
LIMIT {4};`,
    slots: [
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
        why: "The premium list opens with the richest average line: DESC.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the list cap",
        why: "The premium list carries three names: LIMIT 3. At 16 it lists everyone and stops being a premium cut.",
        noVerify: true,
      },
    ],
    distractors: ["o.id = c.id", "oi.id = o.id", "ASC", "16"],
    walkthrough:
      "The quality-of-basket list: line money divided by line count per customer — Alice at roughly 145.25 per line, Emma 144.36, Grace 134.54, the podium by PREMIUM rather than volume. Note what the ranking is not: the spend leaderboard's same three names, but the ordering now reflects basket quality, and the quantity whales (Alice's 50 lines) rank by richness, not bulk. The double join must be real on both hops or the division divides corrupted by coincidence — average line value computed over oi.id-coincidence lines is a number that survives review precisely because it looks reasonable.",
  },
  {
    id: "cs-442",
    tier: "hard",
    topic: "j7",
    universe: "month-close",
    title: "The moving-categories floor",
    brief:
      "From: Financial Controller. Re: the categories worth a line item.\n\nThe close's category schedule keeps only categories moving 50+ units — smaller ones roll up to 'other'. Units per category over the join, HAVING applies the floor, biggest first. Expect one category to roll up.",
    ask: "Categories with 50+ units shipped (Σ quantity), biggest first.",
    template: `SELECT p.category, SUM(oi.quantity) AS units
FROM order_items oi
JOIN products p ON {1}
GROUP BY p.category
{2} SUM(oi.quantity) >= {3}
ORDER BY units {4};`,
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
        label: "the schedule floor",
        why: "The 50-unit floor filters a per-group SUM — HAVING after GROUP BY. WHERE errors on aggregates.",
      },
      {
        answer: "50",
        kind: "number",
        label: "the schedule floor value",
        why: "The schedule's floor is 50 units. At 27, Fitness's single product squeaks in and the schedule loses its 'material categories only' claim.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Heaviest category leads the schedule: DESC.",
      },
    ],
    distractors: ["p.id = oi.order_id", "WHERE", "27", "ASC"],
    walkthrough:
      "The category schedule with its materiality floor: units per category, HAVING at 50, sorted down. Run it and six categories clear the bar — Accessories 121, Audio 97, Electronics 85, Video 61, Apparel 54, Wearables 53 — while Fitness rolls up at 27. The floor is doing the schedule's editorial work: one single-product category at 27 units is a line item nobody reads. The WHERE distractor can't touch sums; the 27 distractor would readmit Fitness and the 'material only' claim quietly dies.",
  },
  {
    id: "cs-443",
    tier: "hard",
    topic: "j7",
    universe: "refund-audit",
    title: "The biggest baskets, in money",
    brief:
      "From: Refunds desk. Re: the exposure podium.\n\nThe refund-exposure podium: the five orders worth the most at the LINE grain — Σ quantity × unit_price per order, biggest first. When a cancellation lands on one of these, the refund conversation writes itself.",
    ask: "Top 5 orders by line-grain basket value (Σ quantity × unit_price).",
    template: `SELECT o.id, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS basket
FROM orders o
JOIN order_items oi ON {1}
GROUP BY o.id
ORDER BY basket {2}
LIMIT {3};`,
    slots: [
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.order_id → orders.id reaches the line grain. oi.id = o.id keeps the 103 coincidence lines and ranks nonsense.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The podium is the biggest exposure: DESC on basket money.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the podium cap",
        why: "The exposure podium carries five orders: LIMIT 5. At 251 it lists the whole book.",
        noVerify: true,
      },
    ],
    distractors: ["oi.id = o.id", "ASC", "251"],
    walkthrough:
      "The exposure podium: baskets valued at the line grain, biggest five first — order 1 alone carries 576.54 (its four lines: three yoga mats, two HDMI cables, one desk mat, three headsets at their transacted prices). The line-grain expression is what makes the podium real: o.total would repeat per line and rank by basket SIZE, not value. The id-coincidence join would podium orders against lines that never belonged to them — a refund exposure list that summons the wrong customers. When the next cancellation lands, this is the list the desk checks first.",
  },
  {
    id: "cs-444",
    tier: "medium",
    topic: "j8",
    universe: "catalog",
    title: "USING, the second exhibit",
    brief:
      "From: Catalog ops. Re: the other shorthand result.\n\nThe USING family tour continues: orders JOIN products USING(id) — the two tables share exactly one column NAME, so the shorthand matches them 16 times by pure coincidence. Count it and say precisely what matched.",
    ask: "Count rows from orders JOIN products USING (id).",
    template: `SELECT {1}(*) AS paired
FROM orders
{2} products USING ({3});`,
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
        why: "USING rides a plain JOIN: JOIN products USING (id). UNION cannot appear in FROM.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the shared column name",
        why: "orders and products share exactly one column name: id. USING(id) matches order 1 to product 1, and so on — coincidence, not relationship.",
      },
    ],
    distractors: ["SUM", "UNION", "product_id"],
    walkthrough:
      "The second USING exhibit: orders and products share only the id name, so the shorthand pairs order 1 with product 1 through order 16 with product 16 — 16 coincidence rows. Contrast the real links: orders to their CUSTOMERS (103 real pairs) and lines to their products (251 real pairs). USING is honest only when the shared name IS the relationship; between these two tables the shared name is bookkeeping. The product_id distractor fails at parse time — orders has no such column — which at least announces itself, unlike the silent 16.",
  },
  {
    id: "cs-445",
    tier: "medium",
    topic: "j8",
    universe: "month-close",
    title: "The RIGHT JOIN survey",
    brief:
      "From: Financial Controller. Re: the newer join type.\n\nSQLite grew RIGHT and FULL joins recently, and the close's compatibility note needs the survey: orders RIGHT JOIN customers on the real key — count the rows. The number should look familiar; the point is which side survives.",
    ask: "Count rows from orders RIGHT JOIN customers on the real foreign key.",
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
        answer: "RIGHT",
        kind: "keyword",
        label: "the join type under test",
        why: "RIGHT JOIN preserves the RIGHT table (customers) instead of the left. Here every customer has orders, so the count mirrors the inner join — the type matters on the day someone doesn't.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
    ],
    distractors: ["SUM", "UNION", "o.id = c.id"],
    walkthrough:
      "The RIGHT JOIN survey: orders RIGHT JOIN customers on the real key reads 103 — identical to the inner join, because every customer currently has orders. That's the compatibility note's point: on today's data the join types agree; the day an account with no orders appears, RIGHT keeps its row and INNER drops it. The o.id = c.id distractor returns 16 — the coincidence census wearing a familiar shape — and ships in the compatibility note if nobody probes. New join types get surveyed with the REAL key or not at all.",
  },
  {
    id: "cs-446",
    tier: "medium",
    topic: "j8",
    universe: "fraud",
    title: "The cancelled-in-ON census",
    brief:
      "From: Fraud spot-check desk. Re: the placement census, cancelled edition.\n\nThe ON-placement census, third slice: LEFT JOIN orders with the CANCELLED filter inside the ON, count the rows. The number — 19 — decomposes into 7 real cancellations and 12 NULL rows for the never-cancelled. Verify both halves.",
    ask: "Count of LEFT JOIN rows with the cancelled filter riding inside the ON.",
    template: `SELECT {1}(*) AS rows_
FROM customers c
{2} orders o ON {3} AND o.status = {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A row count: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "The census counts preservation: LEFT JOIN gives never-cancelled customers their NULL row. INNER JOIN collapses to the 7 real cancellations.",
      },
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
        why: "The slice is cancellations — quoted text inside the ON. 'pending' would census the 22-row pending edition instead.",
      },
    ],
    distractors: ["SUM", "JOIN", "o.id = c.id", "'pending'"],
    walkthrough:
      "The cancelled edition of the placement census: the filter rides inside the ON, so the LEFT JOIN preserves every customer — 7 cancellation rows plus 12 NULL rows for the twelve never-cancelled accounts: 19. Move the filter to WHERE and the NULL rows fail it: 7, and the census loses its denominator. The decomposition is the lesson — 19 isn't '19 cancelled orders' (there are 7); it's 7 facts plus 12 signals of absence. Placement censuses count presence AND absence; that's what makes them coverage.",
  },
  {
    id: "cs-447",
    tier: "hard",
    topic: "j8",
    universe: "inventory",
    title: "The unshipped census, two ways",
    brief:
      "From: Inventory control. Re: the census pair.\n\nThe unshipped census in one row, two ways: LEFT JOIN with the NULL filter inside the ON gives 29 rows (21 real + 8 preserved); count BOTH the rows and the real unshipped orders. The pair — 29 and 21 — is the coverage statement.",
    ask: "One row: total LEFT JOIN rows and real unshipped orders (filter inside the ON).",
    template: `SELECT {1}(*) AS rows_, COUNT(o.id) AS unshipped
FROM customers c
{2} orders o ON {3} AND o.shipped_at IS {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the row counter",
        why: "COUNT(*) counts every preserved row — 29. SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "The 8 fully-dispatched customers exist only as NULL rows under LEFT JOIN. INNER JOIN returns 21/21 and the coverage signal disappears.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the unshipped literal",
        why: "'Unshipped' is shipped_at IS NULL — inside the ON so it filters the match, not the customer. IS NOT would build the dispatched census instead.",
      },
    ],
    distractors: ["SUM", "JOIN", "o.id = c.id", "NOT"],
    walkthrough:
      "The census pair: COUNT(*) reads 29 — 21 real unshipped orders plus 8 NULL rows for the fully-dispatched accounts — while COUNT(o.id) reads 21, skipping the NULLs. The 8-row gap IS the coverage statement: eight customers with nothing in flight, visible only because the filter rides inside the ON. INNER JOIN collapses both counts to 21 and the 'who's clean?' answer dies. Same query shape as the pending edition, different slice — the pattern is the transferable skill.",
  },
  {
    id: "cs-448",
    tier: "hard",
    topic: "j8",
    universe: "supplier",
    title: "The five-table chain, whole",
    brief:
      "From: Supplier audit. Re: the full-chain sanity count.\n\nThe module's longest chain, in one query: lines → orders → customers, plus lines → products → suppliers. Five tables, four hops, every hop a real foreign key. The claim to verify: the count stays 251 — the many-to-one hops add nothing.",
    ask: "Count rows through the full five-table chain (lines→orders→customers, lines→products→suppliers).",
    template: `SELECT COUNT(*) AS rows_
FROM order_items oi
JOIN orders o ON {1}
JOIN customers c ON {2}
JOIN products p ON {3}
JOIN suppliers s ON {4};`,
    slots: [
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "hop 1 (line→order)",
        why: "The one-to-many link that DOES fan out — from lines' perspective it's many-to-one: each line belongs to exactly one order. oi.id = o.id pairs line numbers with order numbers.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "hop 2 (order→customer)",
        why: "The account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "hop 3 (line→product)",
        why: "The catalog hop: order_items.product_id → products.id. p.id = oi.order_id pairs products with order numbers.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "hop 4 (product→supplier)",
        why: "The vendor hop: products.supplier_id → suppliers.id. s.region = p.category compares 'EU' to 'Electronics'.",
      },
    ],
    distractors: ["oi.id = o.id", "c.name", "p.id = oi.order_id", "s.region = p.category"],
    walkthrough:
      "The five-table chain, all four hops real: the count holds at 251. Read the direction and the sanity makes sense: from the LINE's perspective every hop is many-to-one (one order, one customer via its order, one product, one supplier), so nothing multiplies — the fan-out happened when orders joined DOWN to lines, not when lines join UP their parents. That's the module's structural finale: 251 rows can reach five tables of context without inflating, provided every hop is the real key. One swapped condition and the 'sanity count' certifies a chain that reroutes through coincidences.",
  },
  {
    id: "cs-449",
    tier: "hard",
    topic: "j8",
    universe: "refund-audit",
    title: "RIGHT JOIN the cash",
    brief:
      "From: Refunds desk. Re: the mirror-image preservation.\n\nThe desk's preservation drills all ran LEFT; run one RIGHT: payments RIGHT JOIN invoices on the real key, count the rows. The mirror matters — now the INVOICE side survives, unpaid invoices included. Compare with the inner join's 27.",
    ask: "Count rows from payments RIGHT JOIN invoices on the real cash thread.",
    template: `SELECT {1}(*) AS rows_
FROM payments p
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
        why: "RIGHT JOIN preserves the invoices — all 28, including the six with no cash. The inner join's 27 counts only matched pairs.",
      },
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real cash thread: payments.invoice_id → invoices.id. p.invoice_id = i.number compares a number to text.",
      },
    ],
    distractors: ["SUM", "UNION", "p.invoice_id = i.number"],
    walkthrough:
      "The mirror-image drill: RIGHT JOIN flips which side survives — now the 28 invoices all appear, the six unpaid as NULL rows the COUNT skips. 28 versus the inner join's 27: the one-row gap is the unpaid population, visible only because the preservation switched sides. The desk's drills have all been LEFT because invoices sat on the left; this query shows the SAME preservation available from the other direction — and why team conventions about 'which table goes first' matter less than knowing which side your join preserves. The text-number distractor zeroes the survey silently.",
  },
  {
    id: "cs-450",
    tier: "hard",
    topic: "j8",
    universe: "funnel",
    title: "NATURAL, the one-column edition",
    brief:
      "From: Marketing lead. Re: the other NATURAL surprise.\n\nThe NATURAL tour's second stop: orders NATURAL JOIN products. These two share exactly ONE column name — id — so the implicit match pairs order 1 with product 1, sixteen times over. Count it, then contrast the customers edition that returned zero.",
    ask: "Count rows from orders NATURAL JOIN products.",
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
        answer: "products",
        kind: "keyword",
        label: "the second table",
        why: "orders and products share exactly one column name — id — so NATURAL matches sixteen id coincidences. NATURAL customers instead and the shared set (id AND created_at) matches nothing.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the base table",
        why: "The tour starts at orders. Starting at customers and NATURAL-joining products shares id AND name — two columns, zero matches, a different silence.",
      },
    ],
    distractors: ["SUM", "customers", "UNION"],
    walkthrough:
      "The NATURAL tour's contrast case: orders and products share only {id}, so the implicit matcher pairs sixteen id coincidences — 16 rows of order 1 meeting product 1. Set it beside the customers edition (0, because customers and orders share {id, created_at} and timestamps never coincide) and the lesson crystallizes: NATURAL's answer is a function of the SCHEMA'S shared column names, not of any relationship you meant. Same keyword, two tables apart, 16 versus 0. Nobody writes NATURAL in production twice — but everyone reads someone else's once, and this is why.",
  },
];


