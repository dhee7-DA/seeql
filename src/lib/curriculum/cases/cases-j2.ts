// Case batch J2 — Module 2 (joins) cases cs-351…cs-400.
// 50 cases: 17 easy / 17 medium / 16 hard. Topic spread j1×4, j2×8, j3×6,
// j4×7, j5×6, j6×5, j7×8, j8×6. Figures probed against the live seed db
// (scripts/m2-case-facts.ts, m2-j1-probes.ts) and mechanically audited by
// scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesJ2: CaseStudy[] = [
  {
    id: "cs-351",
    tier: "easy",
    topic: "j1",
    universe: "catalog",
    title: "Maya's billing paper",
    brief:
      "From: Catalog ops. Re: audit sample, account pull.\n\nThe quarterly audit samples one account end to end. This quarter it's Maya Patel: pull every invoice number on her account with its status, ordered by invoice number so the binder page reads chronologically.",
    ask: "All invoice numbers and statuses belonging to Maya Patel, in number order.",
    template: `SELECT i.number, i.status
FROM {1} c JOIN invoices i ON i.customer_id = c.id
WHERE c.{2} = {3}
ORDER BY i.number;`,
    slots: [
      {
        answer: "customers",
        kind: "keyword",
        label: "the base table",
        why: "The sample targets a customer, so the chain starts at customers. 'orders' as the base would alias an order table as c — and orders has no name or email column to filter on.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the identity column",
        why: "The audit names a person, and people are keyed by name here: c.name = 'Maya Patel'. c.city would match a city, not a customer.",
      },
      {
        answer: "'Maya Patel'",
        kind: "keyword",
        label: "the account literal",
        why: "The account name is text — quotes required. Bare Maya Patel would be parsed as two column names and the query errors.",
      },
    ],
    distractors: ["orders", "city", "c.email"],
    walkthrough:
      "A two-table identity pull: start at customers, ride the foreign key invoices.customer_id = customers.id over to the billing side, pin the account with a quoted name literal. Run it and four invoice rows come back in number order — Maya's book, worth 11,542.00 across the set. The column choice matters more than it looks: filtering c.email with a person's name matches nothing, and matching on city would return whichever customer lives in a city coincidentally named like a person. The audit page reads clean because every row carries a real invoice number, not an id.",
  },
  {
    id: "cs-352",
    tier: "easy",
    topic: "j1",
    universe: "growth",
    title: "Inactive but ordering",
    brief:
      "From: Head of Growth. Re: the dormant-flag paradox.\n\nTwo accounts carry an inactive flag, yet the orders table tells a different story. Join orders to the flagged accounts and count their orders — I want names and counts, biggest book first, so we can decide whether the flags are stale.",
    ask: "Order counts for inactive customers only (active = 0), biggest book first.",
    template: `SELECT c.name, {1}(o.id) AS orders
FROM customers c
JOIN orders o ON {2}
WHERE c.active = {3}
GROUP BY c.id
ORDER BY orders DESC;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "Book size is a row count: COUNT(o.id). SUM would try to add order ids together — a meaningless number.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id would pair order 7 with customer 7 — a coincidence, not a book.",
      },
      {
        answer: "0",
        kind: "number",
        label: "the inactive flag",
        why: "The paradox accounts are the INACTIVE ones: active = 0. At 1 you'd count the fourteen healthy accounts instead.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "o.id = c.id", "1"],
    walkthrough:
      "The join follows the real foreign key, the flag filter pins the two dormant accounts, and COUNT(o.id) sizes their books. Run it and six orders belong to inactive customers — Dmitri Volkov's 2 and Keiko Sato's 4. That's the paradox on one page: the flag says dormant, the order book says otherwise. Keiko's four orders make her flag look plainly stale; Dmitri's two could be a genuine wind-down. Either way, flip the flags without this query and the growth team loses two accounts it didn't know it had.",
  },
  {
    id: "cs-353",
    tier: "easy",
    topic: "j1",
    universe: "month-close",
    title: "Who holds the open paper",
    brief:
      "From: Financial Controller. Re: open-invoice owner list.\n\nSix invoices sit at status 'open'. For the collections email I need the owner behind each one — email address next to invoice number, alphabetical by email so the mail-merge eats it directly.",
    ask: "Owner email and invoice number for every open invoice, alphabetical by email.",
    template: `SELECT c.email, i.number
FROM customers c {1} invoices i ON {2}
WHERE i.status = {3}
ORDER BY c.email;`,
    slots: [
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "Invoice numbers live in invoices, owner emails in customers — JOIN reunites them per row. UNION stacks result sets and can't sit in FROM.",
      },
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "invoices.customer_id → customers.id is the real ownership thread. Any other pairing attaches invoices to the wrong people.",
      },
      {
        answer: "'open'",
        kind: "keyword",
        label: "the status literal",
        why: "The collections list is the 'open' slice — quoted text. 'paid' would list twenty-one settled invoices nobody needs to chase.",
      },
    ],
    distractors: ["UNION", "WHERE", "'paid'"],
    walkthrough:
      "One join, one filter, one sort: customers joined to their invoices on the real key, the 'open' slice kept, sorted by email for the mail-merge. Run it and six rows come back — alice.chen@, bella.rossi@, chloe.dubois@, emma.wilson@, liam.obrien@, pedro.alv@ each holding one open invoice. The email column is the whole point of the join: the billing system knows the invoice, but only the customer table knows who to email. Six collections emails, ready to send — 19,609.00 of open paper across the six.",
  },
  {
    id: "cs-354",
    tier: "hard",
    topic: "j1",
    universe: "expense",
    title: "Open balances through the fee lens",
    brief:
      "From: Spend analyst. Re: late-fee accrual, EU only.\n\nFinance accrues a 2% late fee on open EU balances. For the accrual entry I need each open EU invoice's owner and its fee-inclusive amount — amount times 1.02, converted from cents, rounded to cents — biggest first. The accrual must reconcile to the penny.",
    ask: "Open invoices of EU customers: owner name and amount × 1.02 (in units, rounded), biggest first.",
    template: `SELECT c.name, ROUND(i.amount_cents * {1} / 100.0, 2) AS with_fee
FROM customers c
JOIN invoices i ON {2}
WHERE c.region = {3} AND i.status = 'open'
ORDER BY with_fee {4};`,
    slots: [
      {
        answer: "1.02",
        kind: "number",
        label: "the fee multiplier",
        why: "A 2% late fee means the balance plus its fee = 102% of the base — multiply by 1.02. 1.2 would accrue a 20% fee nobody approved.",
        noVerify: true,
      },
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real ownership thread: invoices.customer_id → customers.id. Matching c.id against i.number compares a number to text like 'INV-2025-025'.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region literal",
        why: "Region codes are stored uppercase: 'EU'. The lowercase 'eu' matches zero rows — a silent empty accrual.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The accrual memo leads with the biggest fee-inclusive balance: DESC.",
      },
    ],
    distractors: ["1.2", "c.id = i.number", "'eu'", "ASC"],
    walkthrough:
      "Per-row money arithmetic on a joined slice: the 1.02 multiplier applies to each invoice's cents, the /100.0 converts (the .0 keeps pennies float), ROUND tidies for the ledger. Run it and the EU open book accrues in three lines: Alice Chen 6,270.96, Liam O'Brien 3,633.24, Isabella Rossi 2,849.88 — 12,754.08 total, matching the region's open exposure grown by exactly 2%. The 'eu' distractor is the silent killer here: lowercase matches nothing, the query returns empty, and an accrual entry of zero would post without a single error message.",
  },
  {
    id: "cs-355",
    tier: "easy",
    topic: "j2",
    universe: "catalog",
    title: "Orders carrying the Desk Mat",
    brief:
      "From: Catalog ops. Re: hero-product reach.\n\nBefore we feature the Desk Mat Extended again, I want its reach: how many distinct orders contain at least one line of it? Not lines sold — distinct baskets. One number for the feature deck.",
    ask: "Count of distinct orders that include the Desk Mat Extended.",
    template: `SELECT {1}(DISTINCT oi.order_id) AS orders
FROM order_items oi
JOIN products p ON {2}
WHERE p.name = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "Reach is a count of distinct values: COUNT(DISTINCT ...). SUM would add the order ids together into one meaningless number.",
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.product_id → products.id is the catalog thread that finds the Desk Mat's lines. p.id = oi.order_id compares catalog ids to order numbers.",
      },
      {
        answer: "'Desk Mat Extended'",
        kind: "keyword",
        label: "the product literal",
        why: "The product is named, and names are text: quotes required. A bare Desk Mat Extended would be parsed as identifiers and error.",
      },
    ],
    distractors: ["SUM", "p.id = oi.order_id", "'Yoga Mat Eco 6mm'"],
    walkthrough:
      "The join finds the Desk Mat's lines; COUNT(DISTINCT oi.order_id) collapses them to baskets. The DISTINCT is doing real work — the desk mat sells multiple units on a line and could appear on several lines of one order, and 'reach' means baskets, not line events. Run it and the answer is 24 distinct orders carry the Desk Mat Extended — out of 103 orders book-wide, that's nearly a quarter of every basket. The wrong-key join (p.id = oi.order_id) wouldn't error, it would quietly answer a different question — which is exactly why reach numbers must be probed, not eyeballed.",
  },
  {
    id: "cs-356",
    tier: "easy",
    topic: "j2",
    universe: "funnel",
    title: "Fulfillment lines by status",
    brief:
      "From: Marketing lead. Re: ops health slide.\n\nOne slide, four bars: for each order status, how many order LINES sit behind it? Lines, not orders — a pending order with three products is three pending lines of work. Biggest bar on top.",
    ask: "Line count and unit count per order status, most lines first.",
    template: `SELECT o.status, {1}(oi.id) AS lines, SUM(oi.quantity) AS units
FROM orders o
JOIN order_items oi ON {2}
GROUP BY o.status
ORDER BY lines {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the line counter",
        why: "Lines are rows in order_items: COUNT(oi.id). SUM(oi.id) would add up id numbers — bookkeeping, not volume.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.order_id → orders.id is the real parent-child link. oi.id = o.id pairs line numbers with order numbers by coincidence.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "'Biggest bar on top' means descending on lines. ASC would open the slide with the cancelled backlog.",
      },
    ],
    distractors: ["SUM", "oi.id = o.id", "ASC"],
    walkthrough:
      "Lines ride their orders through the real foreign key, then GROUP BY status buckets the work: delivered 119 lines (233 units), shipped 84 (169), pending 36 (76), cancelled 12 (20). The two aggregates tell two different ops stories — lines count pick-paths, units count boxes — and here they agree on the ranking, delivered on top. Note what the join contributes: without it, orders alone could only count itself; the line grain is where the physical work lives. The cancelled 12 lines are reminder enough that a cancelled ORDER still leaves processed lines behind it.",
  },
  {
    id: "cs-357",
    tier: "easy",
    topic: "j2",
    universe: "inventory",
    title: "Baskets that want the headset",
    brief:
      "From: Inventory control. Re: accessory attach-rate check.\n\nThe Noise-Canceling Headset is our premium attach item. Quick check: how many distinct orders include it? Distinct baskets again — a three-unit line still counts as one basket.",
    ask: "Count of distinct orders containing the Noise-Canceling Headset.",
    template: `SELECT COUNT(DISTINCT {1}) AS baskets
FROM order_items oi
JOIN products p ON p.id = oi.product_id
WHERE p.{2} = {3};`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the basket key",
        why: "A basket IS an order: DISTINCT oi.order_id counts each order once. DISTINCT oi.id would count lines — more than one line per basket breaks the number.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the product column",
        why: "The brief names the product: p.name = '...'. p.category = the full product name matches nothing — categories are 'Audio', not headset names.",
      },
      {
        answer: "'Noise-Canceling Headset'",
        kind: "keyword",
        label: "the product literal",
        why: "Product names are text — quotes required. Bare words would parse as identifiers and the query dies.",
      },
    ],
    distractors: ["p.id", "category", "'Audio'"],
    walkthrough:
      "Same reach pattern as the desk-mat check, different hero: join lines to their products, pin the headset by name, count DISTINCT order ids. Run it and nine distinct baskets include the Noise-Canceling Headset — 46 units across those baskets, roughly five per basket when it does appear. That's a niche-but-deep attach profile: few baskets, heavy ones. The category distractor fails instructively: 'Audio' is the category, the headset's NAME is the literal — swap them and the filter compares 'Audio' against a product name and returns zero, quietly.",
  },
  {
    id: "cs-358",
    tier: "medium",
    topic: "j2",
    universe: "inventory",
    title: "Units by status",
    brief:
      "From: Inventory control. Re: cycle-count priorities.\n\nBefore the cycle count: how many physical UNITS sit behind each order status? Pending units are the ones that could still change, cancelled units the ones we already picked for nothing. Sort by units, heaviest bucket first.",
    ask: "Line count and total units per order status, heaviest unit count first.",
    template: `SELECT o.status, COUNT(oi.id) AS lines, SUM(oi.{1}) AS units
FROM orders o
JOIN order_items oi ON {2}
GROUP BY o.status
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "quantity",
        kind: "keyword",
        label: "the units column",
        why: "Physical units live in order_items.quantity. unit_price would sum to money where a box count belongs.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real parent-child link: order_items.order_id → orders.id. oi.id = o.id keeps only the 103 id-coincidence lines.",
      },
      {
        answer: "o.status",
        kind: "keyword",
        label: "the sort column",
        why: "'Heaviest bucket first' sorts by the units aggregate. Sorting by o.status would alphabetize: cancelled, delivered, pending, shipped — a phone-book where a leaderboard belongs.",
      },
    ],
    distractors: ["unit_price", "oi.id = o.id", "o.status"],
    walkthrough:
      "Units ride the real join into status buckets: delivered 233, shipped 169, pending 76, cancelled 20 — on line counts of 119, 84, 36 and 12. The sort column is the case's trap: both 'lines' and 'units' rank the buckets identically here, but a bare status column sorts alphabetically and looks like a broken sort rather than a wrong one. The count priorities fall out directly: the 76 pending units are the count-first bucket (still changeable), the 20 cancelled units the shrink-reconciliation bucket (picked, then unwound).",
  },
  {
    id: "cs-359",
    tier: "medium",
    topic: "j2",
    universe: "refund-audit",
    title: "Cancelled lines, named",
    brief:
      "From: Refunds desk. Re: the cancellation paper trail.\n\nEvery cancelled order still has lines that were picked, priced and unwound. Surface them: the twelve cancelled order lines with buyer name, quantity and product — capped at a dozen rows for the audit binder, ordered by order then line.",
    ask: "Cancelled orders' lines with buyer, quantity and product name — up to 12 rows, stable order.",
    template: `SELECT o.id, c.name, oi.quantity, p.name
FROM orders o
JOIN customers c ON {1}
JOIN order_items oi ON {2}
JOIN products p ON p.id = oi.product_id
WHERE o.status = {3}
ORDER BY o.id, oi.id
LIMIT {4};`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the buyer join",
        why: "The buyer rides the foreign key: orders.customer_id → customers.id. o.id = c.id would attach cancellations to whoever's id matches the order number.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the line join",
        why: "Lines attach through order_items.order_id → orders.id. oi.id = o.id keeps only id-coincidence lines and silently amputates the paper trail.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status literal",
        why: "The audit targets the cancelled slice — quoted text. 'pending' would audit the live pipeline instead of the unwind log.",
      },
      {
        answer: "12",
        kind: "number",
        label: "the binder cap",
        why: "The binder holds a dozen rows and the cancelled book has exactly 12 lines — the cap is an assertion. At 5 it truncates mid-story.",
        noVerify: true,
      },
    ],
    distractors: ["o.id = c.id", "oi.id = o.id", "'pending'", "5"],
    walkthrough:
      "Three real joins deep — buyer, lines, products — then the cancelled slice, ordered stably by order id then line id, capped at 12. Run it and exactly twelve rows come back: the full cancellation paper trail, quantities and products intact. The cap is deliberate: LIMIT 12 on a 12-line population is an assertion that the audit saw EVERYTHING — drop it to 5 and the binder silently hides seven lines. The status literal rides the order row, not the line: lines don't know they're cancelled, their order does.",
  },
  {
    id: "cs-360",
    tier: "medium",
    topic: "j2",
    universe: "pricing",
    title: "Money by payment method",
    brief:
      "From: Pricing committee. Re: payment-mix review.\n\nBefore we tune card-surcharge pricing: how does collected cash split by payment method? Sum payments joined properly to their invoices, per method, with a payment count next to it, biggest channel first.",
    ask: "Per payment method: total cash (Σ ÷ 100) and payment count, biggest channel first.",
    template: `SELECT p.method, ROUND(SUM(p.amount_cents) / 100.0, 2) AS cash, COUNT(*) AS payments
FROM payments p
JOIN invoices i ON {1}
GROUP BY p.{2}
ORDER BY cash {3};`,
    slots: [
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id is the cash-to-paper thread. Matching i.number to the id compares text to a number and matches nothing.",
      },
      {
        answer: "method",
        kind: "keyword",
        label: "the group key",
        why: "The channels are payment methods: GROUP BY p.method. Grouping by i.status would split cash by invoice state instead of channel.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "'Biggest channel first' is descending on cash. ASC would open the review with the smaller rail.",
      },
    ],
    distractors: ["p.invoice_id = i.number", "i.status", "ASC"],
    walkthrough:
      "Cash flows payment → invoice on the real key, then buckets by method with a count alongside the sum. Run it and the two rails split: card 37,364.00 over 16 payments, wire 32,248.00 over 11 — 69,612.00 together, the full collected book. The mix insight for the committee: card wins on count, wire wins on average size (2,932 vs 2,335 per payment) — big invoices go by wire, the tail goes by card. Any surcharge model has to price those two behaviors differently, which is why the count column sits next to the cash.",
  },
  {
    id: "cs-361",
    tier: "hard",
    topic: "j2",
    universe: "growth",
    title: "Two-grain money, side by side",
    brief:
      "From: Head of Growth. Re: the revenue number, settled.\n\nFinance and the growth team report different revenue figures and both refuse to blink. Settle it in one query: over the orders-to-lines join, show the order-total sum (what finance's naive query produces) next to the line-grain sum quantity × unit_price (what the lines actually sold for). Same rows, two truths.",
    ask: "One row: Σ o.total over joined rows vs Σ (quantity × unit_price) — the inflated and honest figures.",
    template: `SELECT ROUND({1}(o.total), 2) AS inflated, ROUND(SUM(oi.{2}), 2) AS honest
FROM orders o
{3} order_items oi ON {4};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the naive aggregate",
        why: "The inflated figure is the order total SUMMED over joined rows. COUNT would put a row count where a currency belongs.",
      },
      {
        answer: "quantity * unit_price",
        kind: "keyword",
        label: "the honest money expression",
        why: "Line money is quantity × unit_price, summed — each line's actual sale. unit_price alone prices every line at one unit.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "The fan-out — and therefore both numbers — only exists after order_items joins. UNION cannot appear in FROM.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.order_id → orders.id is the real link that multiplies each order by its line count. oi.id = o.id keeps 103 coincidence lines instead of 251 real ones.",
      },
    ],
    distractors: ["COUNT", "unit_price", "UNION", "oi.id = o.id"],
    walkthrough:
      "One join, two money figures, one reconciliation. Σ(o.total) over the joined rows reads 103,244.55 — every order's total repeated once per line — while Σ(quantity × unit_price) reads 34,833.28, the honest book. The ratio, ×2.96, is the inflation the two teams have been arguing about; row-wise it's 103 orders fanned to 251 lines, ×2.44. The query's pedagogy is the side-by-side: neither number is 'wrong' in isolation — they measure different grains — but only the line-grain expression survives contact with a revenue report. Never sum a parent column over a child join.",
  },
  {
    id: "cs-362",
    tier: "medium",
    topic: "j2",
    universe: "supplier",
    title: "Deep-bench suppliers only",
    brief:
      "From: Supplier audit. Re: catalog breadth gate.\n\nFor the preferred-supplier badge we require a deep bench: three or more products in our catalog. List the qualifying suppliers with their product counts, alphabetical within ties so the badge list is stable.",
    ask: "Suppliers carrying 3+ products: name and product count, count descending then name.",
    template: `SELECT s.name, {1}(p.id) AS products
FROM suppliers s
LEFT JOIN products p ON {2}
GROUP BY s.id
{3} COUNT(p.id) >= {4}
ORDER BY products {5}, s.name;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the breadth counter",
        why: "Catalog breadth is a product count: COUNT(p.id). SUM(p.id) would add id numbers — 21 for Nordic, not 3.",
      },
      {
        answer: "p.supplier_id = s.id",
        kind: "keyword",
        label: "the join condition",
        why: "products.supplier_id → suppliers.id is the real ownership thread. p.supplier_id = s.region compares numbers to text.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the group gate",
        why: "The three-product floor filters a COUNT per group — HAVING after GROUP BY. WHERE errors on aggregates.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the bench floor",
        why: "The badge requires 3+ products. At 2, Alpine and Andes squeak in and the badge loses its meaning.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Deepest bench first, ties alphabetical: DESC on the count then s.name.",
      },
    ],
    distractors: ["SUM", "p.supplier_id = s.region", "WHERE", "2"],
    walkthrough:
      "COUNT over the join gives each supplier its catalog depth; HAVING enforces the three-product badge floor; the two-key sort (count down, name across) keeps the list stable for the badge run. Run it and four suppliers qualify: Midwest Hardware Co, Nordic Gadgets AB, Pacific Textiles, Shenzhen Electro — three products each, separated alphabetically. Alpine and Andes miss at two. The LEFT JOIN is deliberate even though every supplier qualifies today: the day a supplier's products all delist, LEFT keeps their zero-count row visible and the badge list explains itself.",
  },
  {
    id: "cs-363",
    tier: "easy",
    topic: "j3",
    universe: "supplier",
    title: "Who buys the headset",
    brief:
      "From: Supplier audit. Re: headset buyer reach.\n\nProcurement wants to know how wide the Noise-Canceling Headset's buyer base really is: distinct customers who have EVER bought one, through the full account → order → line → product chain. One number for the negotiation deck.",
    ask: "Count of distinct customers who have bought the Noise-Canceling Headset.",
    template: `SELECT COUNT(DISTINCT o.customer_id) AS buyers
FROM customers c
JOIN orders o ON {1}
JOIN order_items oi ON {2}
JOIN products p ON p.id = oi.product_id
WHERE p.name = {3};`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the first join (customer→order)",
        why: "The account thread: orders.customer_id → customers.id. o.id = c.id would match order numbers to customer ids.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the second join (order→line)",
        why: "The line grain arrives via order_items.order_id → orders.id. oi.id = o.id keeps only coincidence lines.",
      },
      {
        answer: "'Noise-Canceling Headset'",
        kind: "keyword",
        label: "the product literal",
        why: "The headset is named — text, quoted. The bare words parse as identifiers and the chain dies at the WHERE.",
      },
    ],
    distractors: ["o.id = c.id", "oi.id = o.id", "'Desk Mat Extended'"],
    walkthrough:
      "Four tables in a chain, three hops, all on real foreign keys: customers → orders → lines → products, then the name filter pins the headset. COUNT(DISTINCT o.customer_id) collapses the fan-out — a customer who bought it five times counts once. Run it and the answer is nine distinct buyers. That's the negotiation number: 9 of 16 accounts have ever bought the headset, and the desk-mat comparison (24 baskets) shows how much wider the volume seller's reach is. Break any hop — especially the second, where the id coincidence lurks — and the count quietly reroutes through nonsense.",
  },
  {
    id: "cs-364",
    tier: "easy",
    topic: "j3",
    universe: "pricing",
    title: "HDMI volume",
    brief:
      "From: Pricing committee. Re: the cable question.\n\nThe HDMI 2.1 Cable is our traffic product and it's priced like an afterthought. Before the repricing debate: how many UNITS of it have actually moved? Join the lines to their product, pin the name, sum the quantity.",
    ask: "Total units sold of the HDMI 2.1 Cable 2m.",
    template: `SELECT p.name, {1}(oi.quantity) AS units
FROM order_items oi
JOIN products p ON {2}
WHERE p.name = {3}
GROUP BY p.id;`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the volume aggregate",
        why: "Units moved is quantity summed: SUM(oi.quantity). AVG would report the per-line average — a different (small) number.",
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.product_id → products.id names the thing sold. p.id = oi.order_id pairs catalog entries with order numbers.",
      },
      {
        answer: "'HDMI 2.1 Cable 2m'",
        kind: "keyword",
        label: "the product literal",
        why: "The exact catalog name, quoted. A near-miss like 'HDMI Cable' matches nothing — the name is the key.",
      },
    ],
    distractors: ["AVG", "MAX", "p.id = oi.order_id", "'Desk Mat Extended'"],
    walkthrough:
      "Lines joined to their product by the real key, the name pin selects the HDMI cable, SUM(quantity) totals the physical movement. Run it and 38 units come back — third in the catalog behind the Desk Mat's 47 and the Headset's 46, which is exactly the traffic story the repricing debate needs: the cheapest item in the store is also one of the three best movers, at 14.99. The AVG distractor would report roughly 1.3 — the per-line average quantity — a true number answering the wrong question, which is worse than an error.",
  },
  {
    id: "cs-365",
    tier: "medium",
    topic: "j3",
    universe: "catalog",
    title: "Category × region grid",
    brief:
      "From: Catalog ops. Re: the sourcing matrix.\n\nThe binder's matrix page: for each category-and-supplier-region pair, how many products? Sixteen products in the grid, ordered so the densest cells lead. This is the page the sourcing meeting argues over.",
    ask: "Product count per (category, supplier region) pair, densest cells first.",
    template: `SELECT p.category, s.region, {1}(*) AS products
FROM products p
JOIN suppliers s ON {2}
GROUP BY p.category, s.region
ORDER BY products {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the cell counter",
        why: "Each grid cell is a product count: COUNT(*). SUM(*) is invalid SQL over the placeholder.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the join condition",
        why: "products.supplier_id → suppliers.id attaches each product's region. s.id = p.id would pair the six suppliers with products 1–6 by coincidence.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Densest cells lead: DESC on the count. ASC would open on the lonely one-product cells.",
      },
    ],
    distractors: ["SUM", "s.id = p.id", "ASC"],
    walkthrough:
      "Two-column grouping over a two-table join: every product lands in exactly one (category, region) cell via its supplier's region, and COUNT(*) fills the grid. Run it and sixteen products spread across the matrix — Electronics concentrated in EU+APAC, Apparel entirely APAC (Pacific Textiles and Shenzhen Electro), Fitness a lone US cell (the yoga mat is Midwest Hardware's). The id-coincidence join would fabricate a six-product phantom grid anchored on nothing. Cell counts like these are how sourcing concentration gets spotted before it becomes dependency.",
  },
  {
    id: "cs-366",
    tier: "medium",
    topic: "j3",
    universe: "supplier",
    title: "Regional supply floor",
    brief:
      "From: Supplier audit. Re: capacity meeting pre-read.\n\nThe capacity meeting only cares about regions moving serious volume: supplier regions shipping at least 100 units through their products. Units summed over the line→product→supplier chain, floor enforced on the group sums, biggest first.",
    ask: "Supplier regions with 100+ units shipped (Σ quantity), biggest first.",
    template: `SELECT s.region, SUM(oi.quantity) AS units
FROM order_items oi
JOIN products p ON {1}
JOIN suppliers s ON {2}
GROUP BY s.region
{3} SUM(oi.quantity) >= {4}
ORDER BY units {5};`,
    slots: [
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the first join (line→product)",
        why: "order_items.product_id → products.id is the hop that eventually names the maker. p.id = oi.order_id pairs products with order numbers.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the second join (product→supplier)",
        why: "products.supplier_id → suppliers.id carries each product to its vendor's region. s.region = p.category compares 'EU' to 'Electronics' — never equal.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the group gate",
        why: "The 100-unit floor applies to a per-group SUM — HAVING after GROUP BY. WHERE cannot see aggregates.",
      },
      {
        answer: "100",
        kind: "number",
        label: "the unit floor",
        why: "The meeting's bar is 100 units. At 120, EU's 159 would still clear but the APAC/EU split changes the agenda.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Heaviest supplier region on top of the capacity pre-read: descending on units — the biggest shipper leads the agenda.",
      },
    ],
    distractors: ["10000", "s.region = p.category", "WHERE", "120", "ASC"],
    walkthrough:
      "The full sourcing chain — lines → products → suppliers — with units summed per region and HAVING applying the 100-unit floor to the group sums. Run it and three regions clear the bar: APAC 179, EU 159, US 109; LATAM's 51 units miss. The floor is a genuine lever: raise it to 120 and US drops out, shrinking the meeting to two markets. The s.region = p.category distractor is the text-equality trap — regions and categories never overlap, so it returns zero rows without a single error.",
  },
  {
    id: "cs-367",
    tier: "hard",
    topic: "j3",
    universe: "month-close",
    title: "Spend by city, three hops deep",
    brief:
      "From: Financial Controller. Re: close binder, spend geography.\n\nThe binder's spend map: line-grain spend (Σ quantity × unit_price) per customer city, through the account → order → line chain. Top three cities. Heads-up from last quarter's binder: on this book every city hosts exactly one customer, so the map is really a customer ranking wearing a city label — say so in the footnote.",
    ask: "Top 3 cities by line-grain spend (Σ quantity × unit_price), biggest first.",
    template: `SELECT c.city, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS spend
FROM customers c
JOIN orders o ON {1}
JOIN order_items oi ON {2}
GROUP BY c.city
ORDER BY spend {3}
LIMIT {4};`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the first join",
        why: "The account thread: orders.customer_id → customers.id. o.id = c.id would spend-rank an id-coincidence population.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the second join",
        why: "The line grain arrives via order_items.order_id → orders.id. oi.id = o.id keeps the 103 coincidence lines and corrupts every sum.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The binder opens with the heaviest spend: DESC.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the city cap",
        why: "The binder page carries three cities: LIMIT 3. A cap of 16 would list every city including one-order Cork.",
        noVerify: true,
      },
    ],
    distractors: ["o.id = c.id", "oi.id = o.id", "ASC", "16"],
    walkthrough:
      "Three real hops, line-grain money, city buckets — the full chain done honestly. Run it and Berlin leads at 7,262.35, Austin 6,640.56, Seoul 4,574.23 — and the footnote matters: one customer per city means Berlin IS Alice Chen (her 50 lines), Austin IS Emma Wilson. The line-grain expression keeps the money honest; summing o.total over the same joined rows would re-inflate every city by its own line count — the exact mistake the binder made last quarter. The LIMIT 3 is a display choice, not a filter — the full map has 16 one-customer rows.",
  },
  {
    id: "cs-368",
    tier: "hard",
    topic: "j3",
    universe: "funnel",
    title: "The unshipped exposure, named",
    brief:
      "From: Marketing lead. Re: delivery promise audit.\n\nTwenty-one orders have no shipped date — that's the delivery-promise gap. For the audit: each one with its buyer and total, biggest money first, top five. The buyers on this list are the ones our promise actually failed.",
    ask: "Top 5 unshipped orders (shipped_at IS NULL) with buyer and total, biggest total first.",
    template: `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON {1}
WHERE o.shipped_at IS {2}
ORDER BY o.total {3}
LIMIT {4};`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the buyer join",
        why: "The buyer rides orders.customer_id → customers.id. o.id = c.id would name whoever's id equals the order number.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'No shipped date' is shipped_at IS NULL — the only test that sees NULL. IS NOT would list the 82 dispatched orders instead.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The promise audit starts where the money is: biggest total first is DESC.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the audit cap",
        why: "The audit works the top five first: LIMIT 5. At 21 the list would include every straggler and diffuse the follow-up.",
        noVerify: true,
      },
    ],
    distractors: ["o.id = c.id", "NOT", "ASC", "21"],
    walkthrough:
      "The unshipped slice is a NULL test over a real join: shipped_at IS NULL keeps the 21 orders worth 7,265.49 in limbo, the buyer join names them, the sort and cap make the working list. Run it and the top five unshipped orders surface with names attached — the five accounts whose delivery promise is currently broken. The NOT distractor flips the audit to the 82 properly dispatched orders: a full page of good news where a work list should be. And '21' as the cap would return every unshipped order — defensible, but the ask said top five, and an audit that ignores its own scope teaches the wrong lesson.",
  },
  {
    id: "cs-369",
    tier: "easy",
    topic: "j4",
    universe: "refund-audit",
    title: "Invoices with their cash, holes kept",
    brief:
      "From: Refunds desk. Re: the cash-vs-paper view.\n\nEvery invoice next to whatever cash actually arrived against it — and the invoices with NO cash must appear too, showing NULL where a payment total would be. Group per invoice, smallest paid first. The NULLs at the top of that list are the collections queue.",
    ask: "Per invoice: number, status and total cash received (NULL when none), unpaid first.",
    template: `SELECT i.number, i.status, ROUND(SUM(p.amount_cents) / 100.0, 2) AS paid
FROM invoices i
{1} payments p ON {2}
GROUP BY i.id
ORDER BY paid {3};`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "Unpaid invoices must survive as NULL rows or they vanish from the view. A plain JOIN deletes exactly the rows the collections queue needs.",
      },
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id is the cash-to-paper thread. Matching p.invoice_id to i.number compares a number to text.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "Unpaid first means ascending on the cash sum — NULLs sort first ascending, putting the queue at the top of the page.",
      },
    ],
    distractors: ["JOIN", "p.invoice_id = i.number", "DESC"],
    walkthrough:
      "LEFT JOIN preserves all 28 invoices; SUM over each one's payments totals its cash — NULL for the untouched six, the doubled sums for the five twice-paid. Run it and the page opens on the collections queue: six NULL rows, five of them 'open' as expected and one reading 'paid' — the ledger-cash disagreement in plain sight. The matched rows below show the multi-paid invoices at 4,860.00, 5,284.00, 4,723.00, 5,614.00 and 4,459.00 — two payments each, summed honestly. Swap LEFT for INNER and the six rows at the top simply cease to exist; the queue goes from six items to invisible.",
  },
  {
    id: "cs-370",
    tier: "easy",
    topic: "j4",
    universe: "month-close",
    title: "Books with their raw cents",
    brief:
      "From: Financial Controller. Re: the raw ledger view.\n\nFor the reconciliation working paper: every customer with a count of their invoices and the RAW cent sum — no conversion, no rounding. The never-invoiced must appear with a zero count and a NULL sum; that NULL is the audit's favorite tell.",
    ask: "Per customer: invoice count and raw SUM of amount_cents, zeros first, then by name.",
    template: `SELECT c.name, COUNT(i.id) AS invoices, SUM(i.amount_cents) AS raw_cents
FROM customers c
{1} invoices i ON {2}
GROUP BY c.id
ORDER BY invoices {3}, c.name;`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "The never-invoiced must survive the join as NULL rows for their 0/NULL pair to appear. INNER JOIN deletes them.",
      },
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real ownership thread: invoices.customer_id → customers.id. Matching i.number against the customer name compares invoice codes to people.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "Zeros first is ascending on the invoice count — the audit's holes lead the page.",
      },
    ],
    distractors: ["JOIN", "i.customer_id = c.name", "DESC"],
    walkthrough:
      "The working-paper pattern: LEFT JOIN for preservation, COUNT for the hole check, SUM for the raw money — deliberately unconverted so the cents reconcile exactly against the ledger. Run it and sixteen customers appear; the five never-invoiced show 0 and NULL, and Alice Chen's row reads 5 invoices / 2,662,900 raw cents — 26,629.00 in display units. The NULL is doing the audit's work: a zero count with a NULL sum is unambiguous evidence of NO rows, distinct from a genuine 0.00 balance, which would come from an invoice worth nothing — and no such invoice exists.",
  },
  {
    id: "cs-371",
    tier: "medium",
    topic: "j4",
    universe: "inventory",
    title: "Suppliers and their shelf weight",
    brief:
      "From: Inventory control. Re: the shelf-weight view.\n\nFor the count-week brief: each supplier with the number of products they place on our shelves and the total unit stock behind them, heaviest shelf first. Every supplier must appear — even a hypothetical one with zero products.",
    ask: "Per supplier: product count and total stock units, heaviest first.",
    template: `SELECT s.name, COUNT(p.id) AS products, SUM(p.stock) AS units_on_shelf
FROM suppliers s
{1} products p ON {2}
GROUP BY s.id
ORDER BY units_on_shelf {3};`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "The brief says every supplier must appear — LEFT JOIN guarantees it. (Today all six have products, but the view is built for the day one doesn't.)",
      },
      {
        answer: "p.supplier_id = s.id",
        kind: "keyword",
        label: "the join condition",
        why: "products.supplier_id → suppliers.id is the real ownership thread. p.id = s.id would pair products 1–6 with suppliers 1–6 by coincidence.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Heaviest shelf first: DESC on the stock sum. ASC would lead with the leanest supplier.",
      },
    ],
    distractors: ["UNION", "p.id = s.id", "ASC"],
    walkthrough:
      "Shelf weight rolls up through the ownership join: SUM(p.stock) per supplier with COUNT as the breadth check. Run it and Shenzhen Electro tops the shelf at 850 units (mouse, ring light, socks — the volume goods), Pacific Textiles follows at 695, Midwest Hardware 460, Alpine Audio 305, Andes Naturals 305, Nordic Gadgets 230. The pattern worth saying out loud: the suppliers with the MOST products aren't the heaviest shelves — Nordic's premium trio is the lightest load in the building. Breadth and weight are different axes; the count column next to the sum keeps both visible.",
  },
  {
    id: "cs-372",
    tier: "medium",
    topic: "j4",
    universe: "funnel",
    title: "The unshipped coverage view",
    brief:
      "From: Marketing lead. Re: who's fully dispatched.\n\nA coverage view for the ops standup: every customer against their UNSHIPPED orders — with the filter inside the join, so customers with nothing unshipped appear once as a NULL row instead of vanishing. Sorted by customer name. The NULL rows are the 'clean' accounts; everyone else has work in flight.",
    ask: "Every customer against their unshipped orders (NULL row when fully dispatched), by name.",
    template: `SELECT c.name, o.created_at
FROM customers c
{1} orders o ON {2} AND o.shipped_at IS {3}
ORDER BY c.name;`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "Coverage for every customer requires LEFT JOIN. INNER JOIN returns only unshipped rows and the standup loses the clean-account signal.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id would pair orders 1–16 with customers 1–16 by coincidence.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness literal",
        why: "'Unshipped' is shipped_at IS NULL — inside the ON, it filters the MATCH, not the customer. IS NOT would build a dispatched-history view instead.",
      },
    ],
    distractors: ["JOIN", "o.id = c.id", "NOT"],
    walkthrough:
      "The ON-placement view: the unshipped test rides inside the join condition with AND, so the LEFT JOIN preserves every customer — 21 unshipped orders as real rows, 8 NULL rows for the fully-dispatched accounts, 29 rows total. Run it and the standup reads cleanly downward: named unshipped orders with their creation dates, then the eight clean names at the bottom of their alphabetical blocks. Move the NULL test to WHERE and the NULL rows fail it — eight customers silently deleted, and 'who's clean?' becomes unanswerable. The filter's POSITION, not its content, is what preserves the coverage.",
  },
  {
    id: "cs-373",
    tier: "medium",
    topic: "j4",
    universe: "expense",
    title: "Receivables per customer, zeros included",
    brief:
      "From: Spend analyst. Re: the zero-balance assertion.\n\nCompanion to the receivables map: isolate the customers whose invoice count is ZERO — with their counts and sums shown honestly (0 and NULL). The query's shape is the assertion; the named rows it returns are the gap.",
    ask: "Customers with zero invoices: name, count 0, sum NULL — the anti-join as a working query.",
    template: `SELECT c.name, {1}(i.id) AS invoices, ROUND({2}(i.amount_cents) / 100.0, 2) AS billed
FROM customers c
{3} invoices i ON {4}
GROUP BY c.id
HAVING COUNT(i.id) = 0
ORDER BY c.name;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the hole counter",
        why: "The zero test counts matched invoices per customer: COUNT(i.id) reads NULL as 0. SUM(i.id) would add up invoice ids.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the money aggregate",
        why: "The billed column sums invoice cents: SUM(i.amount_cents) → NULL on zero rows. COUNT(amount_cents) would print 0 where a currency belongs.",
      },
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "Zero-hunting needs the unmatched customers alive: LEFT JOIN keeps them as NULL rows for COUNT to read as 0. INNER JOIN empties the result.",
      },
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real thread: invoices.customer_id → customers.id. Comparing i.customer_id to c.name matches numbers to names — zero matches everywhere.",
      },
    ],
    distractors: ["SUM", "COUNT", "JOIN", "i.customer_id = c.name"],
    walkthrough:
      "The zero-bucket query with both aggregates showing: COUNT for the assertion (0), SUM for the money (NULL) — the pair that distinguishes 'no invoices' from 'invoices worth nothing'. Run it and five customers return: Bruno Silva, Dmitri Volkov, Farid Nasser, Keiko Sato, Noah Meyer — 0 invoices, NULL billed, each. Swap either aggregate and the row stops making sense; swap LEFT JOIN for INNER and the five rows don't exist to make sense of. The HAVING is hardcoded at zero because the assertion IS zero — the learner's job is the shape around it.",
  },
  {
    id: "cs-374",
    tier: "hard",
    topic: "j4",
    universe: "growth",
    title: "Region coverage with invoice money",
    brief:
      "From: Head of Growth. Re: the regional billing grid.\n\nThe grid needs every region with three honest numbers: customer count, invoices issued, and billed money. If a region's customer count exceeds its invoice count, someone in that region has never been billed — the grid must show it, not hide it. Biggest billed first.",
    ask: "Per region: customer count, invoice count and billed money (Σ ÷ 100), biggest billed first.",
    template: `SELECT c.region, COUNT(*) AS customers, COUNT({1}) AS invoiced, ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed
FROM customers c
{2} invoices i ON {3}
GROUP BY c.region
ORDER BY billed {4};`,
    slots: [
      {
        answer: "i.id",
        kind: "keyword",
        label: "the matched-row counter",
        why: "COUNT(i.id) counts only real invoice matches — NULL-filled non-customers read as zero. COUNT(*) would blur customers and invoices into one number.",
      },
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "The grid's divergence detection only works if never-invoiced customers survive: LEFT JOIN keeps them, INNER JOIN deletes the evidence.",
      },
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real thread: invoices.customer_id → customers.id. i.number = c.name compares invoice codes to people.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The grid leads with the biggest billed region: DESC.",
      },
    ],
    distractors: ["UNION", "o.region", "ASC"],
    walkthrough:
      "The divergence detector: COUNT(*) against COUNT(i.id) per region, riding a LEFT JOIN so the evidence survives the join step. Run it and EU reads 8 customers / 14 invoices / 47,933.00 (some customers hold several invoices), APAC 5 / 8 / 22,369.00, US 2 / 6 / 16,675.00 — and LATAM 1 / 0 / NULL: Bruno Silva, the region's only customer, never billed. That final row is the grid earning its keep — customers > invoiced, money NULL, gap exposed. Swap to INNER JOIN and LATAM's row vanishes: three regions where four exist, and the growth team pitches a market they've never billed.",
  },
  {
    id: "cs-375",
    tier: "hard",
    topic: "j4",
    universe: "refund-audit",
    title: "The paid-status anomaly hunt",
    brief:
      "From: Refunds desk. Re: ledger-vs-cash reconciliation.\n\nLast quarter an invoice marked 'paid' turned up with no cash behind it. Build the hunt as a standing query: invoices LEFT JOIN payments, keep only the zero-payment buckets, show number and status, ordered by number so the anomalies file in sequence. If the shape is right, the 'paid' one can't hide.",
    ask: "Invoices with zero payments: number and status, ordered by invoice number.",
    template: `SELECT i.number, i.status, COUNT(p.id) AS payments
FROM invoices i
{1} payments p ON {2}
GROUP BY i.id
{3} COUNT(p.id) = 0
ORDER BY {4};`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "Unpaid invoices exist only as NULL rows under LEFT JOIN. INNER JOIN deletes them and the hunt finds nothing — silently.",
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
        label: "the zero-bucket filter",
        why: "COUNT(p.id) = 0 filters per-group aggregates — HAVING after GROUP BY. WHERE errors on aggregates before grouping.",
      },
      {
        answer: "i.number",
        kind: "keyword",
        label: "the filing order",
        why: "Anomalies file by invoice number so the binder sequence matches the ledger — alphabetical numbers track ids here, which is exactly why the filing order must be pinned, not left to group order.",
      },
    ],
    distractors: ["JOIN", "WHERE", "c.name"],
    walkthrough:
      "The standing reconciliation query: LEFT JOIN preserves the cash-less invoices, HAVING COUNT(p.id) = 0 isolates them, and the number-order filing makes anomalies findable. Run it and six rows return — five 'open' invoices behaving exactly as a receivables list should, and one reading 'paid': the ledger says settled, the payments table says nothing arrived. That single row is why this query exists as a standing job — a quarterly manual check missed it; a nightly query can't. The INNER JOIN distractor wouldn't error, wouldn't warn — it would just return an empty grid and let the anomaly ride another quarter.",
  },
  {
    id: "cs-376",
    tier: "easy",
    topic: "j5",
    universe: "catalog",
    title: "The never-invoiced, by region",
    brief:
      "From: Catalog ops. Re: regional billing coverage.\n\nA regional rollup of the billing gap: for each customer region, how many accounts have never received an invoice? Group the anti-join by region, smallest gap first — the cleanest region leads the coverage story.",
    ask: "Count of never-invoiced customers per region, smallest gap first.",
    template: `SELECT c.region, COUNT(*) AS holes
FROM customers c
LEFT JOIN invoices i ON {1}
WHERE i.id IS {2}
GROUP BY c.region
ORDER BY {3}, c.region;`,
    slots: [
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real ownership thread: invoices.customer_id → customers.id. Matching i.number to the customer name compares invoice codes to people.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'Never invoiced' is i.id IS NULL — the anti-join signature. IS NOT NULL flips the query to the eleven BILLED customers.",
      },
      {
        answer: "holes",
        kind: "keyword",
        label: "the sort column",
        why: "'Smallest gap first' sorts by the computed count — the alias works in ORDER BY. Sorting by c.region alphabetizes the map instead.",
      },
    ],
    distractors: ["i.number = c.name", "NOT", "c.region"],
    walkthrough:
      "The anti-join rolls up: LEFT JOIN preserves the never-invoiced, IS NULL keeps them, and the region GROUP BY turns five names into a coverage map — EU 2, APAC 2, LATAM 1. The LATAM row is the sharpest finding: its ENTIRE market (one customer, Bruno Silva) is unbilled, so the region's gap rate is 100% even though its hole count is smallest. The c.region distractor alphabetizes instead of ranking — a real query producing a real table that answers a different question than the one asked. Coverage maps must sort by the metric, not the label.",
  },
  {
    id: "cs-377",
    tier: "easy",
    topic: "j5",
    universe: "expense",
    title: "Count the payment-less invoices",
    brief:
      "From: Spend analyst. Re: the collections queue size.\n\nOne number for the ops dashboard: how many invoices have no payment at all? The count must ride the preserved join — an inner join would count rows that matched and then didn't, which is nothing, and the dashboard would print a zero over a real queue.",
    ask: "Count of invoices with zero payments.",
    template: `SELECT {1}(*) AS unpaid
FROM invoices i
{2} payments p ON {3}
WHERE p.id IS {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A queue size is a count: COUNT(*). SUM(*) and AVG(*) are invalid over the '*' placeholder and error immediately.",
      },
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "Unpaid invoices survive only as NULL rows under LEFT JOIN — the population the WHERE then filters. INNER JOIN returns nothing to filter.",
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
        why: "'No payment' is p.id IS NULL. IS NOT NULL would count the 21 matched invoices — the complement of the queue.",
      },
    ],
    distractors: ["SUM", "AVG", "JOIN", "NOT"],
    walkthrough:
      "The anti-join count: preserve (LEFT JOIN), mark the unmatched (IS NULL), count what remains — six invoices in the collections queue, worth 15,217.00. Every part of the shape is load-bearing: INNER JOIN yields an empty intersection and a printed zero; IS NOT NULL yields the 21 paid invoices; SUM(*) doesn't parse at all. The number ties to the named list and the exposure figure — same population, three views. When a dashboard shows '0 collections needed', this is the query shape to check first, because a broken preserve is invisible: no error, just a confident wrong zero.",
  },
  {
    id: "cs-378",
    tier: "medium",
    topic: "j5",
    universe: "fraud",
    title: "Accounts with no cancelled history",
    brief:
      "From: Fraud spot-check desk. Re: the clean-record cohort.\n\nCancellations are friction events; accounts with NONE have a spotless order history. Count them per region: the status filter rides inside the join so spotless accounts survive as NULL rows for the emptiness test. Region rollup, alphabetical.",
    ask: "Count of customers with zero cancelled orders, per region, alphabetical by region.",
    template: `SELECT c.region, COUNT(*) AS spotless
FROM customers c
{1} orders o ON o.customer_id = c.id {2} o.status = {3}
WHERE o.id IS {4}
GROUP BY c.region
ORDER BY c.region;`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "Spotless accounts exist only as NULL rows under LEFT JOIN — with an inner join the anti-join finds nobody.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the ON-combinator",
        why: "AND keeps the status filter INSIDE the match, so never-cancelled customers survive as NULL rows. WHERE in that slot moves the filter out and deletes the cohort.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status literal",
        why: "The friction event is the 'cancelled' status — quoted text. 'delivered' would hunt accounts with no deliveries: nearly everyone.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'No cancelled order' is o.id IS NULL on the preserved rows. IS NOT NULL would count the four cancellation-holding accounts instead.",
      },
    ],
    distractors: ["JOIN", "WHERE", "'delivered'", "NOT"],
    walkthrough:
      "Anti-join with the filter parked in the ON clause: LEFT JOIN with AND status = 'cancelled' preserves everyone — the four accounts holding cancellations (Alice ×3, Farid ×2, Emma, Maya) as matched rows, everyone else NULL. IS NULL keeps the spotless cohort: twelve customers, rolling up to EU 7, APAC 3, US 1, LATAM 1. Move the status filter to WHERE and the NULL rows fail it before the emptiness test runs — zero rows, cohort gone. The desk reads the map as expected friction: a 12-of-16 spotless rate with the cancellations concentrated in the four biggest books.",
  },
  {
    id: "cs-379",
    tier: "easy",
    topic: "j5",
    universe: "growth",
    title: "Accounts we can't pitch",
    brief:
      "From: Head of Growth. Re: the outreach exclusion list.\n\nGrowth can't pitch an account we've never invoiced — no billing relationship, no legal contact path. Build the exclusion list: never-invoiced customers with name and city, region first then name so the list groups by territory.",
    ask: "Never-invoiced customers: name and city, ordered by region then name.",
    template: `SELECT c.name, c.city
FROM customers c
LEFT JOIN invoices i ON {1}
WHERE i.id IS {2}
ORDER BY {3}, c.name;`,
    slots: [
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real ownership thread: invoices.customer_id → customers.id. i.number = c.name compares invoice codes to people.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'Never invoiced' is i.id IS NULL. IS NOT NULL returns the eleven billed customers — the exact opposite of an exclusion list.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the territory sort",
        why: "'Groups by territory' sorts by region first. Sorting by c.city would cluster the list geographically instead of by sales territory.",
      },
    ],
    distractors: ["i.number = c.name", "NOT", "c.city"],
    walkthrough:
      "The exclusion list is the anti-join with a territory sort: five never-invoiced customers — Bruno Silva (São Paulo, LATAM), Dmitri Volkov (Tallinn, EU), Farid Nasser (Dubai, APAC), Keiko Sato (Nagoya, APAC), Noah Meyer (Hamburg, EU) — grouped region-first so each sales lead sees their own gaps together. The city column matters for the pitch team: these are real addresses, not dormant ids. Eleven billed customers sit on the other side of the NOT distractor — and the point of an exclusion list is that being sure about the five requires seeing exactly why the other eleven don't belong on it.",
  },
  {
    id: "cs-380",
    tier: "hard",
    topic: "j5",
    universe: "fraud",
    title: "The double-anti: unbilled and quiet",
    brief:
      "From: Fraud spot-check desk. Re: the deepest gap.\n\nThe highest-risk accounts have NO invoices AND no pending orders — nothing billed, nothing in flight, potentially fully dark. Chain two preserving joins (invoices, then pending-filtered orders) and keep only the rows where BOTH are empty. Three names expected.",
    ask: "Customers with zero invoices AND zero pending orders — the double anti-join, named.",
    template: `SELECT c.name
FROM customers c
LEFT JOIN invoices i ON i.customer_id = c.id
{1} orders o ON {2} {3} o.status = {4}
WHERE i.id IS NULL AND o.id IS NULL
ORDER BY c.name;`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the second hop's join type",
        why: "Both hops must preserve: harden this one to INNER JOIN and the NULL-invoice rows die at the orders step — the double-anti finds nobody.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the second join condition",
        why: "The real account thread for the pending check: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the ON-combinator",
        why: "AND parks the status filter inside the match so never-pending customers survive as NULL rows. WHERE in that slot deletes them before the emptiness test.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the in-flight status",
        why: "'Nothing in flight' means no PENDING orders — quoted text. 'shipped' would hunt accounts with no dispatch history: a different, larger cohort.",
      },
    ],
    distractors: ["INNER", "o.id = c.id", "WHERE", "'shipped'"],
    walkthrough:
      "Two anti-joins in one query: LEFT JOIN invoices (holes: the never-billed five) and LEFT JOIN orders filtered to 'pending' inside the ON (holes: the never-pending eight). The WHERE keeps rows that are NULL on BOTH — the intersection of the two gaps. Run it and three names surface: Bruno Silva, Dmitri Volkov, Noah Meyer — no invoices ever, no pending orders now. These are the accounts with no billing relationship AND nothing in flight: the dark cohort the desk watches. Harden the second hop to INNER JOIN and the result empties — preservation is per-hop, and one hard link deletes the entire finding.",
  },
  {
    id: "cs-381",
    tier: "hard",
    topic: "j5",
    universe: "refund-audit",
    title: "The gap, in three numbers",
    brief:
      "From: Refunds desk. Re: the working-capital one-liner.\n\nThe memo's opening line needs the gap quantified three ways: how many invoices carry no cash, what they total, and what the average stuck invoice is worth. One row, three aggregates, all over the preserved anti-join. The average is the number finance argues about — get it exact.",
    ask: "Count of unpaid invoices, their total exposure and their average (all in units, rounded).",
    template: `SELECT {1}(*) AS unpaid, ROUND(SUM(i.amount_cents) / 100.0, 2) AS exposure, ROUND({2}(i.amount_cents) / 100.0, 2) AS avg_due
FROM invoices i
{3} payments p ON p.invoice_id = i.id
WHERE p.id IS {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the queue counter",
        why: "The headcount of unpaid invoices: COUNT(*). SUM(*) is invalid SQL over the placeholder.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean-value aggregate",
        why: "The average stuck invoice is AVG(i.amount_cents). COUNT would put a row count where a currency belongs.",
      },
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "The unpaid set exists only as NULL rows under LEFT JOIN. INNER JOIN empties it and all three numbers go NULL or zero.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'No payment' is p.id IS NULL. IS NOT NULL measures the 21 PAID invoices — the complement.",
      },
    ],
    distractors: ["SUM", "COUNT", "JOIN", "NOT"],
    walkthrough:
      "Three aggregates over one preserved anti-join: COUNT(*) reads 6, SUM reads 1,521,700 cents → 15,217.00 exposure, AVG reads 253,616.67 cents → 2,536.17 per stuck invoice. The average is the argument-settler: six invoices averaging 2,536.17 means the queue isn't long-tail noise — it's a handful of serious balances (4,937.00 tops the list). Run the same three aggregates over an INNER JOIN and the row comes back 0 / NULL / NULL: technically a number, practically a memo that says nothing. The preserve-then-measure order is the whole discipline.",
  },
  {
    id: "cs-382",
    tier: "easy",
    topic: "j6",
    universe: "funnel",
    title: "EU teammates only",
    brief:
      "From: Marketing lead. Re: the EU clustering stat.\n\nNarrow the pairing stat to the region that matters for the pilot: how many distinct customer pairs sit inside the EU? Same guarded self-join as the book-wide version, pinned to 'EU'. One number for the pilot brief.",
    ask: "Count of distinct EU customer pairs (a.id < b.id, same region).",
    template: `SELECT {1}(*) AS pairs
FROM customers a
JOIN customers b ON {2} AND a.id < b.id
WHERE a.region = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A pair total: COUNT(*). SUM(*) errors — the placeholder isn't a column.",
      },
      {
        answer: "a.region = b.region",
        kind: "keyword",
        label: "the pairing condition",
        why: "Teammates share a region: a.region = b.region. a.city = b.city would pair nobody — every city hosts exactly one customer.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region pin",
        why: "The pilot targets 'EU' — uppercase, quoted. The lowercase 'eu' matches zero rows and the brief quietly loses its statistic.",
      },
    ],
    distractors: ["SUM", "a.city = b.city", "'eu'"],
    walkthrough:
      "The guarded self-join with a region pin: a.region = b.region pairs the aliases, a.id < b.id keeps each pair once, and WHERE a.region = 'EU' narrows the universe to Europe's eight customers. Run it and the pilot brief gets 28 — eight choose two, the densest pairing pool in the book (APAC's five customers give 10, US's two give 1). The 'eu' distractor is the classic case-sensitivity tax: region codes are stored uppercase, the lowercase literal matches nothing, and the query returns a confident, empty zero instead of an error.",
  },
  {
    id: "cs-383",
    tier: "medium",
    topic: "j6",
    universe: "fraud",
    title: "The unguarded pairing",
    brief:
      "From: Fraud spot-check desk. Re: why the raw count lies.\n\nSomeone ran the same-region pairing WITHOUT the id guard and got a number twice too big. Reproduce their query honestly: same-region customer rows joined with NO guard at all. Understanding why it over-counts is the lesson — the number itself is the exhibit.",
    ask: "Count of same-region customer pairs with NO id guard (the over-counting version).",
    template: `SELECT {1}(*) AS rows_
FROM customers a
{2} customers b ON {3};`,
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
        why: "The reproduction uses a plain inner self-join. UNION cannot appear in FROM; WHERE would need its own condition and breaks the syntax here.",
      },
      {
        answer: "a.region = b.region",
        kind: "keyword",
        label: "the unguarded pairing",
        why: "The exhibit pairs on region equality alone — no a.id < b.id guard, so every pair counts twice (Alice–Bruno and Bruno–Alice) plus every customer's self-match.",
      },
    ],
    distractors: ["SUM", "UNION", "a.city = b.city"],
    walkthrough:
      "The exhibit query, built exactly as the over-count happened: region equality, no guard. Run it and the count reads 94 — the honest 39 ordered pairs doubled to 78 (each pair counted in both alias orders) plus 16 self-matches (every customer pairs with itself because its region equals its own region). That decomposition IS the lesson: 39 × 2 + 16 = 94. The guard a.id < b.id fixes both problems at once — self-pairs are arithmetically impossible when a row can't be less than itself, and the strict direction keeps each pair in exactly one alias order. Same join, same data, one keyword of guard between a clean stat and a doubled one.",
  },
  {
    id: "cs-384",
    tier: "medium",
    topic: "j6",
    universe: "growth",
    title: "Emma's order twins",
    brief:
      "From: Head of Growth. Re: the Emma case study.\n\nThe second account deep-dive: how many distinct order pairs sit inside Emma Wilson's 17-order book? Same pairing shape as Alice's case study, pinned to her account id. The number slots next to Alice's 276 in the deck.",
    ask: "Count of same-customer order pairs (o1.id < o2.id) for customer 2 only.",
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
        why: "Strict less-than: each pair once, no self-pairs. <= would add her 17 self-matches — 153 instead of 136.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the pinned customer id",
        why: "Emma Wilson is customer 2 — the pin narrows the 624 book-wide pairs to her book. Customer 1 (Alice) would give her 276.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "<=", "1"],
    walkthrough:
      "Alice's pairing query re-pinned: customer 2, same guarded self-join. Emma's 17 orders pair among themselves — 17 choose 2, which is 17×16÷2 = 136. The deck's side-by-side now reads Alice 276 / Emma 136, and the ratio (roughly 2:1) tracks their order-count ratio (24:17) because pairs grow with the SQUARE of book size — 24 choose 2 vs 17 choose 2. That squaring is why pairing stats explode so fast: the growth from 17 to 24 orders (+41%) nearly doubles the pair count (+103%). The <= distractor inflates her number to 153 — seventeen fake 'twins' where every order pairs with itself.",
  },
  {
    id: "cs-385",
    tier: "hard",
    topic: "j6",
    universe: "catalog",
    title: "Same-product line pairs",
    brief:
      "From: Catalog ops. Re: the repeat-purchase baseline.\n\nHow often does the same product appear on two different lines across the whole book — the repeat-purchase pairing baseline? Self-join the lines on product, guard the ids, count. Big number expected; the decomposition is the insight.",
    ask: "Count of same-product line pairs (a.id < b.id) across all order lines.",
    template: `SELECT {1}(*) AS pairs
FROM order_items a
{2} order_items b ON {3} AND a.id {4} b.id;`,
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
        why: "Pair-matching is an inner self-join — rows survive only with a partner. A LEFT JOIN here equals the inner join anyway (every line matches itself), so only error tokens differ.",
      },
      {
        answer: "a.product_id = b.product_id",
        kind: "keyword",
        label: "the same-product condition",
        why: "Repeat purchase means the same catalog item across two lines: product_id equality across the aliases. a.order_id = b.product_id compares order numbers to product ids.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the guard operator",
        why: "a.id < b.id counts each pair once and makes self-pairs impossible. <= would add all 251 self-matches to the count.",
      },
    ],
    distractors: ["SUM", "UNION", "a.order_id = b.product_id", "<="],
    walkthrough:
      "Lines paired with lines on the same product, guarded: COUNT over a.product_id = b.product_id AND a.id < b.id. Run it and the baseline reads 1,983 — repeat-purchase pairings across the book. The decomposition tells the real story: 251 lines yield 31,375 possible pairs (251×250÷2), of which 1,983 — about 6% — are same-product. That's the cross-sell silhouette: most line pairs are DIFFERENT products, meaning baskets diversify rather than repeat. The <= distractor adds 251 self-pairs (every line paired with itself) — 2,234, a number that looks plausible and counts nothing.",
  },
  {
    id: "cs-386",
    tier: "medium",
    topic: "j6",
    universe: "month-close",
    title: "Bridges across regions",
    brief:
      "From: Financial Controller. Re: the cross-region exposure pair count.\n\nComplement to the same-region stat: how many customer pairs span DIFFERENT regions — the bridges, where currency and shipping rules differ? Guarded pairs, inequality on region, one number for the compliance memo.",
    ask: "Count of distinct customer pairs (a.id < b.id) in DIFFERENT regions.",
    template: `SELECT {1}(*) AS bridges
FROM customers a
JOIN customers b ON {2} AND a.region {3} b.region;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A pair total: COUNT(*). SUM(*) errors over the placeholder.",
      },
      {
        answer: "a.id < b.id",
        kind: "keyword",
        label: "the once-only guard",
        why: "The guard keeps each pair once: a.id < b.id. Without it every bridge counts twice; with = only self-pairs survive.",
      },
      {
        answer: "!=",
        kind: "keyword",
        label: "the bridging operator",
        why: "Bridges span different regions: a.region != b.region. a.region = b.region would count the 39 same-region pairs — the opposite set.",
      },
    ],
    distractors: ["SUM", "a.id = b.id", "="],
    walkthrough:
      "The complement query: same guarded self-join, but the region condition flips to inequality. Run it and the memo gets 81 bridges — and the arithmetic proves it: 16 customers pair C(16,2) = 120 ways, 39 of those are same-region, so 120 − 39 = 81 must span regions. Two independent queries agreeing is the audit's favorite sound. The '=' distractor returns 39 under this query's 'bridges' label — a true number for the wrong set, the exact confusion the compliance memo must never ship. Bridges matter because every one of those 81 pairs implies two currencies and two rulebooks.",
  },
  {
    id: "cs-387",
    tier: "easy",
    topic: "j7",
    universe: "inventory",
    title: "Supplier product counts",
    brief:
      "From: Inventory control. Re: the catalog ownership rollup.\n\nThe ownership rollup for the count binder: how many products does each supplier place in our catalog? Products joined to their makers, counted per supplier, ties alphabetical. Nothing filtered — all six suppliers belong on the page.",
    ask: "Product count per supplier, count descending then name.",
    template: `SELECT s.name, {1}(p.id) AS products
FROM suppliers s
JOIN products p ON {2}
GROUP BY s.id
ORDER BY products {3}, s.name;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the breadth counter",
        why: "Catalog breadth is a row count: COUNT(p.id). SUM(p.id) adds id numbers — 21 for Nordic, not 3.",
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
        why: "Deepest catalog first, ties alphabetical: DESC on the count then s.name.",
      },
    ],
    distractors: ["SUM", "p.id = s.id", "ASC"],
    walkthrough:
      "The ownership rollup: products ride the real foreign key to their makers, COUNT sizes each stable, the two-key sort keeps ties deterministic. Run it and four suppliers carry three products each (Midwest Hardware Co, Nordic Gadgets AB, Pacific Textiles, Shenzhen Electro) with Alpine Audio and Andes Naturals at two. Sixteen products, six suppliers, 3/3/3/3/2/2 — a remarkably even spread that the binder page makes visible at a glance. The SUM distractor is the classic id-arithmetic tell: Nordic's 1+7+13 = 21 'products' would make the binder page meaningless.",
  },
  {
    id: "cs-388",
    tier: "easy",
    topic: "j7",
    universe: "expense",
    title: "Collected cash by method",
    brief:
      "From: Spend analyst. Re: the treasury channel split.\n\nThe treasury view of collected cash: per payment method, total cash and payment count — payments joined to their invoices so the split covers only recognized paper. Biggest channel first. This is the expense-side twin of the pricing committee's mix review.",
    ask: "Per payment method: cash (Σ ÷ 100) and payment count, biggest channel first.",
    template: `SELECT p.method, ROUND(SUM(p.amount_cents) / 100.0, 2) AS cash, {1}(*) AS payments
FROM payments p
JOIN invoices i ON {2}
GROUP BY p.method
ORDER BY cash {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the payment counter",
        why: "The count column is a row count per channel: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id ties cash to recognized paper. p.invoice_id = i.number compares a number to text like 'INV-2024-001'.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest channel leads the treasury view: descending on cash — the heavier rail heads the page and the average-size story lands on line one.",
      },
    ],
    distractors: ["SUM", "p.invoice_id = i.number", "ASC"],
    walkthrough:
      "The channel split rides the real cash-to-paper join: card 37,364.00 across 16 payments, wire 32,248.00 across 11 — 69,612.00 total, the full collected book, now with two rails named. The expense-side read: wire handles fewer but heavier payments (average 2,932 vs card's 2,335), so the big-balance pipeline is thin and trackable while the card tail is broad. The i.number distractor would zero the whole view — text never equals a number — and a zero split on a dashboard reads as 'no cash collected' rather than 'broken join', which is why this query shape gets reviewed before it ships.",
  },
  {
    id: "cs-389",
    tier: "medium",
    topic: "j7",
    universe: "pricing",
    title: "Invoice money by region",
    brief:
      "From: Pricing committee. Re: where the paper sits.\n\nBefore the regional price test: how much BILLED paper does each region carry? Invoices joined to their owners, summed per region with a count next to it, biggest first. Note for the deck: a region missing from the result is a finding, not a bug.",
    ask: "Per region: invoice count and billed money (Σ ÷ 100), biggest billed first.",
    template: `SELECT c.region, COUNT(i.id) AS invoices, ROUND({4}(i.amount_cents) / 100.0, 2) AS billed
FROM customers c
{1} invoices i ON {2}
GROUP BY c.region
ORDER BY billed {3};`,
    slots: [
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the joining keyword",
        why: "The billed view only counts regions with paper — a plain inner join drops the never-invoiced. (Switch to LEFT JOIN and LATAM's zero row appears; both are defensible, but the deck asked for paper only.)",
      },
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
        why: "Biggest billed region first: DESC on the money.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the money aggregate",
        why: "Billed money is invoice cents summed: SUM(i.amount_cents). COUNT(i.id) in that slot would print a row count where a currency belongs.",
      },
    ],
    distractors: ["LEFT JOIN", "i.number = c.name", "ASC", "COUNT"],
    walkthrough:
      "The billed-paper rollup: invoices joined to owners on the real key, region buckets carrying a count and a sum. Run it and three regions hold all the paper: EU 14 invoices / 47,933.00, APAC 8 / 22,369.00, US 6 / 16,675.00 — 86,977.00 together, the full invoice book. LATAM's absence is the deck's footnote: its one customer has never been billed, so an inner join omits it — which is exactly the finding the note flags. The LEFT JOIN distractor isn't wrong, it's a different slide: one extra row showing LATAM at zero, useful for the coverage story the committee hears next.",
  },
  {
    id: "cs-390",
    tier: "medium",
    topic: "j7",
    universe: "growth",
    title: "Books with four-plus invoices",
    brief:
      "From: Head of Growth. Re: the multi-invoice cohort.\n\nThe retention story lives in the multi-invoice cohort: customers holding four or more invoices. Count invoices per customer, gate with HAVING, sort with names as the tiebreaker so the cohort list is stable across reruns.",
    ask: "Customers with 4+ invoices: name and count, count descending then name.",
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
        why: "The real ownership thread: invoices.customer_id → customers.id. i.number = c.name compares codes to people — zero matches.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the group gate",
        why: "The four-invoice floor filters a COUNT per customer — HAVING territory, after GROUP BY. WHERE errors on aggregates.",
      },
      {
        answer: "4",
        kind: "number",
        label: "the cohort floor",
        why: "The cohort starts at four invoices. At 3, Grace Kim and Isabella Rossi join the list and the retention story dilutes.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Deepest billing relationship first: DESC on the count, names across for stability.",
      },
    ],
    distractors: ["i.number = c.name", "WHERE", "3", "ASC"],
    walkthrough:
      "The cohort query: count invoices per customer on the real join, HAVING enforces the four-invoice floor, the two-key sort keeps the list rerun-stable. Run it and three customers qualify: Alice Chen at 5, then Maya Patel and Emma Wilson at 4 each — alphabetical within the tie. Six of the book's 28 invoices (21%) sit with this trio, which is the retention narrative in one list: repeat billing concentrates fast. The WHERE distractor errors on sight — aggregates don't exist before grouping — and the floor's sensitivity (3 admits two more names) shows why the cohort definition lives in version control, not in someone's memory.",
  },
  {
    id: "cs-391",
    tier: "easy",
    topic: "j7",
    universe: "catalog",
    title: "The movers, top three",
    brief:
      "From: Catalog ops. Re: the velocity podium.\n\nThe velocity podium for the ops wall: the three products moving the most UNITS, with their line counts next to them. Lines joined to products, units summed, biggest first, capped at three. Simple, honest, wall-worthy.",
    ask: "Top 3 products by units sold (Σ quantity), with line counts.",
    template: `SELECT p.name, COUNT(oi.id) AS lines, SUM(oi.quantity) AS units
FROM order_items oi
JOIN products p ON {1}
GROUP BY p.id
ORDER BY units {2}
LIMIT {3};`,
    slots: [
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.product_id → products.id names the thing sold. p.id = oi.order_id pairs catalog ids with order numbers.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The podium is the top: DESC on units. ASC would wall the three slowest movers.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the podium cap",
        why: "Three products on the wall: LIMIT 3. At 16 the wall lists the whole catalog and stops being a podium.",
        noVerify: true,
      },
    ],
    distractors: ["p.id = oi.order_id", "ASC", "16"],
    walkthrough:
      "Velocity is units summed over the real join: Desk Mat Extended 47, Noise-Canceling Headset 46, HDMI 2.1 Cable 38 — the wall's podium, with line counts alongside (24 lines for the desk mat, meaning one line per basket almost exactly). The relationship between lines and units is the quiet lesson: the headset hits 46 units on fewer, heavier lines; the HDMI gets there on many light ones. Same units, different shelf behavior. The wrong-key join would build the podium from id coincidences — a wall of nothing, hung with confidence.",
  },
  {
    id: "cs-392",
    tier: "hard",
    topic: "j7",
    universe: "supplier",
    title: "Supplier revenue, realized",
    brief:
      "From: Supplier audit. Re: the realized-revenue rollup.\n\nUnits tell half the story; realized revenue tells the other half. Roll up Σ(quantity × unit_price) per supplier through the line→product→supplier chain, and use the REALIZED line price — the transacted unit_price, not the catalog list. Biggest book on top. This is the negotiation deck's money page.",
    ask: "Per supplier: realized revenue (Σ quantity × unit_price), biggest first.",
    template: `SELECT s.name, ROUND(SUM(oi.quantity * oi.{1}), 2) AS revenue
FROM order_items oi
JOIN products p ON {2}
JOIN suppliers s ON {3}
GROUP BY s.id
ORDER BY revenue {4};`,
    slots: [
      {
        answer: "unit_price",
        kind: "keyword",
        label: "the realized price column",
        why: "Realized revenue uses the transacted price on each line: oi.unit_price. p.price is the catalog list — close but not the money that actually moved.",
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the first join (line→product)",
        why: "order_items.product_id → products.id attaches the catalog to each line. p.id = oi.order_id pairs products with order numbers.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the second join (product→supplier)",
        why: "products.supplier_id → suppliers.id rolls each product's revenue to its vendor. s.region = p.category never matches.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The money page opens with the biggest book: DESC.",
      },
    ],
    distractors: ["price", "p.id = oi.order_id", "s.region = p.category", "ASC"],
    walkthrough:
      "The full sourcing chain with the realized expression: quantity × oi.unit_price — the price each line actually transacted at — summed per supplier. The column choice is the case's spine: catalog price looks interchangeable but isn't (the yoga mat lists at 32.00 and transacts at 31.02; the cable at 14.99 both ways is the exception, not the rule), and mixing the two columns makes supplier revenue drift from the book's 34,833.28 in ways no reconciliation catches immediately. Run it alongside the units leaderboard (Midwest 109, Shenzhen 99…) and the two rankings disagree — volume and value lead different suppliers, which is precisely the negotiation insight.",
  },
  {
    id: "cs-393",
    tier: "hard",
    topic: "j7",
    universe: "month-close",
    title: "Lines vs orders, per region",
    brief:
      "From: Financial Controller. Re: the fan-out footnote, regionalized.\n\nThe close binder's fan-out footnote needs regional numbers: for each customer region, how many joined LINES and how many DISTINCT ORDERS? The gap between the two counts is the fan-out, and the footnote quotes it. Lines count descending, so the heaviest region leads.",
    ask: "Per region: joined line count and COUNT(DISTINCT order) — the fan-out pair.",
    template: `SELECT c.region, COUNT(oi.id) AS lines, COUNT({1} o.id) AS orders
FROM customers c
JOIN orders o ON {2}
JOIN order_items oi ON {3}
GROUP BY c.region
ORDER BY lines {4};`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the dedup keyword",
        why: "Over the joined rows each order repeats once per line — COUNT(DISTINCT o.id) collapses back to real orders. Without it the count IS the fan-out.",
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
        why: "The line grain arrives via order_items.order_id → orders.id. oi.id = o.id keeps only coincidence lines.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Heaviest region first, so the binder's fan-out footnote opens on the region where the order-to-line gap is widest: descending on the line count.",
      },
    ],
    distractors: ["ALL", "o.id = c.id", "oi.id = o.id", "ASC"],
    walkthrough:
      "The fan-out, quantified region by region: lines over the full chain read EU 105, APAC 88, US 53, LATAM 5, while COUNT(DISTINCT o.id) reads 45, 37, 19, 2 — the real order counts. The gaps (60, 51, 34, 3) are each region's fan-out: EU's 45 orders become 105 joined rows because its orders carry 2.3 lines on average. The footnote writes itself from these two columns. The ALL distractor demonstrates the lesson in reverse — ALL is the default, so COUNT(ALL o.id) = COUNT(o.id) = the line count, and the binder would print 105 orders in a region that has 45.",
  },
  {
    id: "cs-394",
    tier: "hard",
    topic: "j7",
    universe: "expense",
    title: "The whole book, three truths",
    brief:
      "From: Spend analyst. Re: the reconciliation header.\n\nThe reconciliation header needs the book's three truths in one row: joined line count, DISTINCT order count, and honest line-grain revenue — all over the orders-to-lines join. Any two teams quoting this row must agree to the cent; that's what makes it the header.",
    ask: "One row: joined line count, COUNT(DISTINCT orders), and Σ quantity × unit_price.",
    template: `SELECT COUNT(*) AS lines, COUNT({1} {2}) AS orders, ROUND(SUM({3}), 2) AS revenue
FROM orders o
JOIN order_items oi ON {4};`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the dedup keyword",
        why: "The 251 joined rows repeat every order once per line — DISTINCT collapses the count back to 103 real orders.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the order identity",
        why: "Orders are identified by o.id. DISTINCT oi.id would count 251 'orders' — one per line, the fan-out printed as a headcount.",
      },
      {
        answer: "quantity * unit_price",
        kind: "keyword",
        label: "the honest money expression",
        why: "Line revenue is quantity × unit_price, summed. unit_price alone prices every line at one unit and understates the book.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real parent-child link: order_items.order_id → orders.id. oi.id = o.id keeps 103 coincidence lines and breaks all three numbers.",
      },
    ],
    distractors: ["ALL", "oi.id", "unit_price", "oi.id = o.id"],
    walkthrough:
      "The header row: 251 lines, 103 distinct orders, 34,833.28 of honest line-grain revenue — the three numbers every downstream report must reconcile to. Each slot defends one truth: DISTINCT keeps the order count honest over the fan-out, o.id keeps it counting orders rather than lines, and the quantity × unit_price expression keeps revenue at the grain money actually moves. The oi.id distractor is the subtlest: DISTINCT oi.id = 251 is a real count of a real column — it just counts lines while wearing the orders label. Headers get copied; make every column in them self-defense.",
  },
  {
    id: "cs-395",
    tier: "medium",
    topic: "j8",
    universe: "month-close",
    title: "The USING shorthand",
    brief:
      "From: Financial Controller. Re: the shorthand that lied.\n\nSomeone's report joined customers to orders with USING(id) and got 16 rows. Reproduce it: the shorthand joins on the SINGLE shared column name — which here is the id coincidence, not the foreign key. Count the result and understand exactly what the shorthand matched.",
    ask: "Count rows from customers JOIN orders USING (id) — the coincidence matcher.",
    template: `SELECT {1}(*) AS paired
FROM customers
{3} orders USING ({2});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A row count: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the shared column name",
        why: "USING matches the named column — id, the one name both tables share. USING(customer_id) errors: orders has it, customers doesn't.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "USING rides on a plain JOIN: JOIN orders USING (id). UNION cannot appear in FROM — it stacks result sets.",
      },
    ],
    distractors: ["SUM", "customer_id", "UNION"],
    walkthrough:
      "USING(id) joins the two tables on their single shared column name — and both tables' id columns are just row numbers, so the shorthand matches customer 1 to order 1, customer 2 to order 2… sixteen coincidence rows. The real relationship (orders.customer_id = customers.id) yields 103. That's the shorthand's trap in one contrast: 16 vs 103, and nothing errors. USING is honest when the shared name IS the relationship — here the shared name is bookkeeping. The customer_id distractor fails at parse time (customers has no such column), which at least announces itself — the id variant lies silently.",
  },
  {
    id: "cs-396",
    tier: "medium",
    topic: "j8",
    universe: "inventory",
    title: "The NATURAL trap",
    brief:
      "From: Inventory control. Re: the join that returned nothing.\n\nA teammate's quick report joined customers to orders with NATURAL JOIN and got zero rows. Reproduce it and explain the zero. NATURAL joins on ALL shared column names — and what's shared here isn't what anyone meant.",
    ask: "Count rows from customers NATURAL JOIN orders — and understand the zero.",
    template: `SELECT {1}(*) AS surprise
FROM customers
{2} JOIN {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A row count: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "NATURAL",
        kind: "keyword",
        label: "the implicit matcher",
        why: "NATURAL JOIN matches on ALL shared column names with no ON clause — the database guesses the relationship, and here it guesses the id bookkeeping.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the second table",
        why: "The reproduction pairs customers with orders. NATURAL JOIN payments instead and the shared set shrinks to just id — sixteen pure coincidences, a very different surprise.",
      },
    ],
    distractors: ["SUM", "payments", "UNION"],
    walkthrough:
      "NATURAL JOIN implicitly matches on EVERY column name the two tables share — and customers and orders share more than you'd guess: id AND created_at. So a row survives only when the customer's id equals the order's id AND their timestamps are identical — customer 1 with order 1 at the same second. Nothing qualifies: the count is zero. The cousin queries prove the diagnosis: USING(id) — matching only the id name — returns 16 coincidence rows, and the real foreign key returns 103. One implicit match, three answers. That's the lesson: NATURAL lets the schema guess, the schema guessed two columns, and the audit trail died quietly. The payments distractor proves the point from the other side: its shared set with customers is ONLY id, so the same 'natural' idea suddenly reports sixteen matches — the guess changes with every table you name.",
  },
  {
    id: "cs-397",
    tier: "hard",
    topic: "j8",
    universe: "funnel",
    title: "The EU-in-ON coverage",
    brief:
      "From: Marketing lead. Re: the region coverage test.\n\nThe coverage test from the module's capstone: LEFT JOIN orders with the region filter INSIDE the ON — every customer survives, EU customers carrying their orders, everyone else NULL rows. Count the result. Then understand why the same filter in WHERE reads 45, not 53.",
    ask: "Count of LEFT JOIN rows where the region filter rides inside the ON clause.",
    template: `SELECT COUNT(*) AS rows_
FROM customers c
{1} orders o ON {2} {3} c.region = {4};`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "The test's whole point is preservation: LEFT JOIN keeps non-EU customers as NULL rows. INNER JOIN collapses to the 45 matched rows.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the ON-combinator",
        why: "AND attaches the region test to the MATCH — non-EU customers still get their NULL row. WHERE in that slot filters customers out entirely.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region literal",
        why: "Region codes are stored uppercase: 'EU'. The lowercase 'eu' matches nothing and the coverage test reads zero.",
      },
    ],
    distractors: ["JOIN", "o.id = c.id", "WHERE", "'eu'"],
    walkthrough:
      "The capstone's signature experiment: region filter inside the ON of a LEFT JOIN. The match condition becomes 'this order AND this customer is EU' — so EU customers show their 45 orders, and the eleven non-EU customers each contribute one NULL row: 45 + 8 = 53. Move the filter to WHERE and the NULL rows fail the region test before they can be counted: 45. Same filter, same data, eight rows of difference — and those eight rows ARE the coverage the test is measuring. The 'eu' distractor shows the other silent failure: zero rows, no error, a coverage report that justifies itself.",
  },
  {
    id: "cs-398",
    tier: "hard",
    topic: "j8",
    universe: "refund-audit",
    title: "The invoice-order mesh",
    brief:
      "From: Refunds desk. Re: the wrong-grain exhibit.\n\nThe exhibit query for the grain lecture: join invoices to orders on the shared customer (not the foreign key between them) and count what you get — then sum the order totals. The row count explodes because every customer's invoices pair with ALL their orders. Real numbers, wrong grain, memorable damage.",
    ask: "Count and Σ order totals for invoices joined to orders via shared customer_id.",
    template: `SELECT COUNT(*) AS mesh, ROUND({1}(o.total), 2) AS inflated
FROM invoices i
{2} orders o ON {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the money aggregate",
        why: "The exhibit sums order totals over the mesh: SUM(o.total). COUNT would put a row count where the inflated currency belongs.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "The mesh is an inner join on the shared customer. LEFT JOIN gives the same 314 rows here (every invoice's customer has orders) — only error tokens differ.",
      },
      {
        answer: "o.customer_id = i.customer_id",
        kind: "keyword",
        label: "the same-customer condition",
        why: "The mesh pairs every invoice with every order of the same customer: customer_id equality across the aliases. o.customer_id = i.id would pair customer ids with invoice ids — a smaller coincidence.",
      },
    ],
    distractors: ["COUNT", "UNION", "o.customer_id = i.id"],
    walkthrough:
      "The wrong-grain exhibit, built honestly: invoices paired with all orders sharing their customer — 5 invoices × 24 orders for Alice alone. Run it and the mesh counts 314 rows carrying 102,906.64 of 'revenue' — neither number means anything, and both LOOK authoritative. The real invoice total is 86,977.00 over 28 invoices; the mesh nearly triples the money by counting each order once per invoice. That's the lecture's punchline in one query: a join on the shared ENTITY (customer) instead of the relationship (invoice→payment, order→lines) doesn't error — it multiplies. Distinguish 'joins on the same key name' from 'joins on the same relationship'.",
  },
  {
    id: "cs-399",
    tier: "hard",
    topic: "j8",
    universe: "pricing",
    title: "The CROSS JOIN experiment",
    brief:
      "From: Pricing committee. Re: the join-type footgun.\n\nA analyst's exploratory query used CROSS JOIN — with an ON clause attached — and got sensible-looking numbers. Reproduce it: count the rows. The surprise isn't the count; it's that SQLite accepts the ON at all, and what that means for query review.",
    ask: "Count rows from orders CROSS JOIN customers with the foreign-key ON attached.",
    template: `SELECT {1}(*) AS matched
FROM orders o
{2} JOIN customers c ON {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A row count: COUNT(*). SUM(*) errors over the placeholder.",
      },
      {
        answer: "CROSS",
        kind: "keyword",
        label: "the join type under test",
        why: "The experiment pins CROSS JOIN with an ON attached — SQLite honors the condition, producing the same rows an inner join would.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the attached condition",
        why: "The ON is the real foreign key — which is exactly why the exploratory result looked sensible: it behaved like an inner join.",
      },
    ],
    distractors: ["SUM", "UNION", "o.id = c.id"],
    walkthrough:
      "The footgun, reproduced: CROSS JOIN with an ON clause. Portable SQL says CROSS JOIN takes NO condition — it's the Cartesian product. SQLite quietly honors the ON, so this query returns 103 — identical to an inner join — and the analyst ships it thinking 'CROSS JOIN' is just exotic spelling. The damage is portability: run the same query on a stricter engine and it's a syntax error, or worse, a genuine 10,609-row product (103 × 103). The lesson isn't 'don't use CROSS JOIN'; it's 'a CROSS JOIN with an ON is a query review finding' — the intent is ambiguous even when the result isn't. INNER JOIN says what you mean.",
  },
  {
    id: "cs-400",
    tier: "hard",
    topic: "j8",
    universe: "supplier",
    title: "Wrong-FK forensics",
    brief:
      "From: Supplier audit. Re: the sixteen-row mystery.\n\nA junior's dashboard joined customers to orders ON c.id = o.id and reported 16 rows. Reproduce the forensics: count the coincidence, then understand precisely why it isn't zero — and why the correct key gives 103. The difference between 'ran without error' and 'measured something' is the whole lesson.",
    ask: "Count rows from customers JOIN orders ON c.id = o.id — the id-coincidence join.",
    template: `SELECT {1}(*) AS coincidences
FROM customers c
{3} orders o ON {2};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A row count: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "c.id = o.id",
        kind: "keyword",
        label: "the coincidence condition",
        why: "The exhibit joins the two tables' own id columns — customer 1 to order 1, and so on for the first sixteen numbers. It runs clean and measures nothing.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "The forensics run a plain inner self-style join. UNION cannot appear in FROM; WHERE would need its own condition and breaks the syntax here.",
      },
    ],
    distractors: ["SUM", "o.customer_id = c.id", "UNION"],
    walkthrough:
      "The forensics: c.id = o.id matches the first sixteen orders to the sixteen customers by pure number coincidence — 16 rows, no errors, plausible-looking names attached to unrelated orders. The correct key (o.customer_id = c.id) returns 103 — and that contrast is the exhibit: the coincidence join doesn't fail loudly, it just measures a relationship that doesn't exist. Every customer id 1–16 has a matching order id (the book runs 1–103), which is why the count is exactly 16 and not zero. On a larger database the overlap would be partial and the bug would look like data loss. 'The query ran' has never meant 'the query measured'.",
  },
];



