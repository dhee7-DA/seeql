// Case batch J5 — Module 2 (joins) cases cs-501…cs-550.
// 50 cases: 17 easy / 16 medium / 17 hard. Topic spread j1×4, j2×7, j3×6,
// j4×6, j5×6, j6×6, j7×8, j8×7. Figures probed on the live seed db and
// mechanically audited by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesJ5: CaseStudy[] = [
  {
    id: "cs-501",
    tier: "easy",
    topic: "j1",
    universe: "supplier",
    title: "Nordic's catalog page",
    brief:
      "From: Procurement lead. Re: the vendor page, Nordic edition.\n\nThe vendor page for Nordic Gadgets AB: every product they place with us, price-ordered, richest last. Join the catalog to its maker, pin the vendor by name, sort by price ascending so the page reads as a ladder.",
    ask: "Nordic Gadgets AB's products with prices, cheapest first.",
    template: `SELECT p.name, p.price
FROM products p
JOIN suppliers s ON {1}
WHERE s.name = {2}
ORDER BY p.price {3};`,
    slots: [
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the join condition",
        why: "products.supplier_id → suppliers.id names the maker. s.id = p.id pairs supplier ids with product ids by coincidence.",
      },
      {
        answer: "'Nordic Gadgets AB'",
        kind: "keyword",
        label: "the vendor literal",
        why: "The vendor is pinned by exact name, quoted. A near-miss vendor silently builds someone else's page.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the ladder direction",
        why: "'Cheapest first' is ascending on price. DESC would open the page with the smart watch's 199.99.",
      },
    ],
    distractors: ["s.id = p.id", "'Shenzhen Electro'", "DESC"],
    walkthrough:
      "The vendor page as a ladder: Nordic's three products — Mechanical Keyboard K1 at 89.99, 4K Webcam Pro at 129.00, Smart Watch S at 199.99 — cheapest first. The pin-by-name keeps the page readable to humans; the ladder direction keeps it negotiable (open at the entry SKU, close at the flagship). The id-coincidence join would build the page from whichever products happen to share ids with vendors — six phantom rows wearing Nordic's header.",
  },
  {
    id: "cs-502",
    tier: "easy",
    topic: "j1",
    universe: "funnel",
    title: "Berlin's biggest baskets",
    brief:
      "From: Marketing lead. Re: the city spotlight, Berlin.\n\nThe city spotlight series opens in Berlin: the three biggest orders with their totals. Join orders to their buyers, pin the city, sort down, cap at three. Berlin's buyer is one person — the page should show her range.",
    ask: "Berlin's 3 biggest orders by total.",
    template: `SELECT o.id, o.total
FROM customers c
JOIN orders o ON {1}
WHERE c.city = {2}
ORDER BY o.total {3}
LIMIT 3;`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "'Berlin'",
        kind: "keyword",
        label: "the city literal",
        why: "Cities are stored as written: 'Berlin'. The lowercase 'berlin' matches nothing and the spotlight prints empty.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "'Biggest orders' is descending on total. ASC would spotlight the three smallest.",
      },
    ],
    distractors: ["o.id = c.id", "'Hamburg'", "ASC"],
    walkthrough:
      "The city spotlight: Berlin's orders through the real account thread, sorted down, capped at three. Run it and the page shows Alice Chen's three biggest baskets — Berlin's buyer is one person, so the city page is a customer page, exactly as the spotlight series' footnote says. The 'Hamburg' pin builds Noah Meyer's page under Berlin's header — a real query, a real city, the wrong one. City spotlights get their literal checked against the roster, every time.",
  },
  {
    id: "cs-503",
    tier: "easy",
    topic: "j1",
    universe: "expense",
    title: "Open exposure per owner",
    brief:
      "From: Spend analyst. Re: the open-paper rollup.\n\nThe open-paper rollup: per owner, the total of their OPEN invoices — joined from billing to accounts, bucketed per customer, biggest exposure first. Six owners expected.",
    ask: "Open-invoice money (Σ ÷ 100) per owner, biggest first.",
    template: `SELECT c.name, ROUND(SUM(i.amount_cents) / 100.0, 2) AS open_due
FROM customers c
JOIN invoices i ON {1}
WHERE i.status = {2}
GROUP BY c.id
ORDER BY open_due {3};`,
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
        why: "The rollup slices to 'open' paper — quoted text. 'paid' would roll up settled balances nobody chases.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest exposure leads the rollup: DESC.",
      },
    ],
    distractors: ["i.number = c.name", "'paid'", "ASC"],
    walkthrough:
      "The open-paper rollup: six owners, each holding one open invoice, sorted by exposure. Five of the six balances sit fully unpaid — the sixth (Alice's INV-2025-025) has partial cash behind it, which is exactly why the rollup runs on the LEDGER's status rather than the payments table. The name=text distractor zeroes the rollup; the 'paid' pin would show twenty-one settled rows under an open-paper header. Status lives on the invoice; the join brings the name.",
  },
  {
    id: "cs-504",
    tier: "hard",
    topic: "j1",
    universe: "fraud",
    title: "The flagged-and-pending overlap",
    brief:
      "From: Fraud spot-check desk. Re: the flag-pipeline overlap.\n\nThe desk's overlap check: orders that are BOTH on an inactive-flagged account AND still pending — money committed by accounts flagged dormant. Join with both pins. Expect exactly one row, and be able to say whose.",
    ask: "Orders from inactive customers (active = 0) at status 'pending': account and order id.",
    template: `SELECT c.name, o.id
FROM customers c
JOIN orders o ON {1}
WHERE c.active = {2} AND o.status = {3}
ORDER BY c.name;`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "0",
        kind: "number",
        label: "the inactive flag",
        why: "The flagged accounts carry active = 0. At 1 the check audits the fourteen healthy accounts instead.",
        noVerify: true,
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the in-flight literal",
        why: "The overlap targets in-flight money: 'pending', quoted. 'shipped' would audit dispatches to flagged accounts — a different question.",
      },
    ],
    distractors: ["o.id = c.id", "1", "'shipped'"],
    walkthrough:
      "The overlap check: two pins on a real join — inactive flag, pending status. Run it and exactly one row returns: Keiko Sato, the Nagoya account flagged inactive with an order still in flight. That single row is the desk's finding: either the flag is stale or the order shouldn't have been accepted — and the query proves which accounts to walk. The active=1 distractor audits ninety-seven healthy orders; the 'shipped' pin asks about completed dispatches, where the money question has already resolved itself.",
  },
  {
    id: "cs-505",
    tier: "easy",
    topic: "j2",
    universe: "catalog",
    title: "The keyboard's transacted prices",
    brief:
      "From: Catalog ops. Re: what the keyboard really sells for.\n\nThe catalog lists the Mechanical Keyboard K1 at 89.99 — the realized ladder tells the truth. Pull its lines' transacted unit prices, cheapest first, and compare against list on the page.",
    ask: "The Mechanical Keyboard K1's transacted unit prices, cheapest first.",
    template: `SELECT oi.quantity, oi.unit_price
FROM order_items oi
JOIN products p ON {1}
WHERE p.name = {2}
ORDER BY oi.unit_price {3};`,
    slots: [
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.product_id → products.id finds the keyboard's lines. p.id = oi.order_id pairs catalog ids with order numbers.",
      },
      {
        answer: "'Mechanical Keyboard K1'",
        kind: "keyword",
        label: "the product literal",
        why: "The exact catalog name, quoted. A near-miss silently builds a different product's ladder.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the ladder direction",
        why: "'Cheapest first' is ascending on the transacted price. DESC would lead with the premium transacts.",
      },
    ],
    distractors: ["p.id = oi.order_id", "'Smart Watch S'", "DESC"],
    walkthrough:
      "The realized ladder for one product: the keyboard's lines with their transacted prices, cheapest first — the page that shows whether the street pays 89.99 or something else. The quantity column rides along so the ladder shows size AND price per line. The order_id distractor would ladder whatever lines pair with the keyboard's catalog id by coincidence — a price list for products that were never sold together.",
  },
  {
    id: "cs-506",
    tier: "easy",
    topic: "j2",
    universe: "funnel",
    title: "The holders, counted",
    brief:
      "From: Marketing lead. Re: the pipeline-holder census.\n\nThe pipeline-holder census: customers holding at least one pending order, with counts. Real join, status pin, HAVING keeps the holders, biggest book first. Eight names expected.",
    ask: "Customers holding 1+ pending orders: name and count, biggest first.",
    template: `SELECT c.name, COUNT(o.id) AS pending
FROM customers c
JOIN orders o ON {1}
WHERE o.status = {2}
GROUP BY c.id
{3} COUNT(o.id) >= 1
ORDER BY pending {4}, c.name;`,
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
        why: "The census slices to 'pending' — quoted text. 'shipped' would census the dispatch book.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the holder gate",
        why: "COUNT(o.id) >= 1 filters a per-group count — HAVING after GROUP BY. WHERE errors on aggregates.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The heaviest holder leads: DESC then name for stable filing.",
      },
    ],
    distractors: ["o.id = c.id", "'shipped'", "WHERE", "ASC"],
    walkthrough:
      "The holder census: eight accounts hold the fourteen pending orders — Alice 3, Emma 3, Chloe 2, Maya 2, plus four singles, filed by count then name. The HAVING is technically redundant over an inner join (every returned group has ≥1 by construction) but it documents the intent: this census counts HOLDERS. The WHERE distractor can't run the gate at all; the 'shipped' pin would census thirty dispatches across a different set of names.",
  },
  {
    id: "cs-507",
    tier: "medium",
    topic: "j2",
    universe: "inventory",
    title: "The shelf column that lied",
    brief:
      "From: Inventory control. Re: the report that inflated the shelf.\n\nA teammate's category report summed product STOCK over the lines join — and the shelf numbers came back impossible. Reproduce it honestly: lines counted per category next to the inflated stock sum. The LINE column is honest; the SHELF column is the exhibit.",
    ask: "Per category: honest line count next to the (inflated) stock sum over the join.",
    template: `SELECT p.category, {1}(oi.id) AS lines, SUM(p.stock) AS inflated_shelf
FROM products p
JOIN order_items oi ON {2}
GROUP BY p.category
ORDER BY lines {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the honest counter",
        why: "Lines are rows: COUNT(oi.id) is true per category. SUM(oi.id) adds id numbers — bookkeeping in a work column.",
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
        why: "The busiest category leads: DESC on lines.",
      },
    ],
    distractors: ["SUM", "p.id = oi.order_id", "ASC"],
    walkthrough:
      "The inflation exhibit: the lines column reads true (Accessories' 62, Audio's 51…) while the shelf column sums each product's stock once PER SALE LINE — Accessories' real 940 units of shelf reporting as several times that. Same join, one honest column, one inflated column: the parent column (stock) repeats per child row (lines), and SUM believes every repetition. The fix isn't in this query — it's a subquery, next module — but the diagnosis starts here: never sum a parent column over a child join.",
  },
  {
    id: "cs-508",
    tier: "easy",
    topic: "j2",
    universe: "expense",
    title: "The wire timeline with amounts",
    brief:
      "From: Spend analyst. Re: the wire audit, dated.\n\nThe wire rail's timeline: each transfer's date and amount, joined to nothing but itself through the ledger — oldest first. The audit reconciles the rail date by date.",
    ask: "All wire payments: date and amount, oldest first.",
    template: `SELECT p.paid_on, p.amount_cents / 100.0 AS paid
FROM payments p
JOIN invoices i ON {1}
WHERE p.method = {2}
ORDER BY p.{3} {4};`,
    slots: [
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id ties cash to recognized paper. Matching p.invoice_id to i.number compares a number to text.",
      },
      {
        answer: "'wire'",
        kind: "keyword",
        label: "the rail literal",
        why: "The audited rail is 'wire' — quoted text. 'card' would timeline the sixteen-swipe rail instead.",
      },
      {
        answer: "paid_on",
        kind: "keyword",
        label: "the timeline column",
        why: "A timeline sorts by the payment date: p.paid_on. p.amount_cents would order by size — a leaderboard where a calendar belongs.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the timeline direction",
        why: "'Oldest first' is ascending on the date. DESC would start the reconciliation at the most recent transfer.",
      },
    ],
    distractors: ["p.invoice_id = i.number", "'card'", "amount_cents", "DESC"],
    walkthrough:
      "The wire timeline: eleven transfers, dated, oldest first — 32,248.00 reconciled in calendar order. The audit's discipline is the sort: date-and-amount in one row means every line of the reconciliation is checkable against the bank statement's own ordering. The amount_cents sort would shuffle the timeline into a size leaderboard; the DESC flip would start the audit at today and work backwards — both real orderings, neither the one the auditor asked for.",
  },
  {
    id: "cs-509",
    tier: "medium",
    topic: "j2",
    universe: "supplier",
    title: "The EU supplier board",
    brief:
      "From: Supplier audit. Re: the regional board, Europe edition.\n\nThe regional supply board for the EU: units sold through each EU supplier's products, biggest mover first. Chain lines→products→suppliers, pin the region. Two vendors expected.",
    ask: "Units sold through each EU supplier's products, biggest first.",
    template: `SELECT s.name, SUM(oi.quantity) AS units
FROM order_items oi
JOIN products p ON {1}
JOIN suppliers s ON {2}
WHERE s.{3} = {4}
GROUP BY s.id
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
        why: "products.supplier_id → suppliers.id attaches the vendor. s.region = p.category compares 'EU' to 'Electronics'.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the pin column",
        why: "The board pins the vendor's region: s.region = 'EU'. Suppliers have no city column — pinning one errors.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region literal",
        why: "Region codes are uppercase: 'EU'. The lowercase 'eu' matches nothing and the board prints empty.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest mover leads the board: DESC.",
      },
    ],
    distractors: ["p.id = oi.order_id", "s.region = p.category", "city", "'eu'", "ASC"],
    walkthrough:
      "The EU board: Nordic Gadgets' 82 units against Alpine Audio's 77 — a near-even regional split on very different shelves (Nordic's premium trio, Alpine's audio-and-desk pair). The pin column choice matters: region is the board's axis, and the city distractor errors because suppliers have no such column — the loud failure being the friendly one. Region boards, one per market, same query shape: only the literal moves.",
  },
  {
    id: "cs-510",
    tier: "hard",
    topic: "j2",
    universe: "month-close",
    title: "The holder ledger with lines",
    brief:
      "From: Financial Controller. Re: the close's pipeline ledger, two grains.\n\nThe pipeline ledger gains a line column: per holder, pending ORDER count and the joined LINE count behind them. The filter rides inside the ON, zero buckets excluded explicitly, biggest line load first. The lines should sum to 36.",
    ask: "Per holder: pending order count and joined line count, biggest line load first.",
    template: `SELECT c.name, COUNT(o.id) AS orders, COUNT(oi.id) AS lines
FROM customers c
LEFT JOIN orders o ON {1} AND o.status = {2}
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY c.id
{3} COUNT(o.id) >= 1
ORDER BY lines {4};`,
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
        why: "The ledger tracks 'pending' — quoted text inside the ON so the quiet accounts survive as NULL rows.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the holder gate",
        why: "COUNT(o.id) >= 1 excludes the zero buckets explicitly — the ledger can then claim eight-of-sixteen coverage.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The heaviest line load leads the ledger — the holder whose pending baskets carry the most pick-paths heads the close note.",
      },
    ],
    distractors: ["o.id = c.id", "'delivered'", "WHERE", "ASC"],
    walkthrough:
      "The two-grain pipeline ledger: eight holders, their pending order counts, and the 36 joined lines those orders carry — Alice's three orders alone bringing the deepest line load. Both LEFTs preserve: orders so the HAVING can exclude zeros explicitly, lines so an order with no lines would show at zero rather than vanish. The 'delivered' pin would ledger the dispatch book's lines — real work, wrong pipeline. The line total reconciling to 36 is the close's tie-out.",
  },
  {
    id: "cs-511",
    tier: "hard",
    topic: "j2",
    universe: "growth",
    title: "Basket depth per account",
    brief:
      "From: Head of Growth. Re: whose baskets run deep.\n\nThe basket-depth leaderboard: lines per DISTINCT order, per customer — the ×1.0 and the DISTINCT both guarding the division. Biggest depth first, top three. Alice's 50-over-24 is the number to beat.",
    ask: "Top 3 customers by lines per distinct order (2-decimal ratio).",
    template: `SELECT c.name, ROUND(COUNT(oi.id) * {1} / COUNT({2} o.id), 2) AS lines_per_order
FROM customers c
JOIN orders o ON {3}
JOIN order_items oi ON {4}
GROUP BY c.id
ORDER BY lines_per_order {5}
LIMIT {6};`,
    slots: [
      {
        answer: "1.0",
        kind: "number",
        label: "the float coercion",
        why: "Integer ÷ integer floors: 50 ÷ 24 would read 2. ×1.0 keeps 2.08 a ratio instead of a rounded guess.",
        noVerify: true,
      },
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the order dedup",
        why: "COUNT(DISTINCT o.id) counts Alice's 24 orders, not her 50 joined rows. ALL (the default) makes the ratio read 1 for everyone.",
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
        why: "The deepest baskets lead the leaderboard — the ratio page answers 'whose orders run deep' from the top down.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the leaderboard cap",
        why: "The leaderboard shows three: LIMIT 3. At 16 it lists every account.",
        noVerify: true,
      },
    ],
    distractors: ["1", "ALL", "o.id = c.id", "oi.id = o.id", "ASC", "16"],
    walkthrough:
      "The depth leaderboard: Emma Wilson 2.71 lines per order (46 over 17), Grace Kim 2.43, Alice Chen 2.08 (50 over 24) — the volume whale has the SHALLOWEST baskets of the three. Both guards earn their slots: drop the ×1.0 and every ratio floors to 2; drop the DISTINCT and numerator equals denominator and everyone reads 1.0. Depth and volume are different questions — this query answers the one the deck actually asks.",
  },
  {
    id: "cs-512",
    tier: "easy",
    topic: "j3",
    universe: "catalog",
    title: "The supplier-sorted shelf page",
    brief:
      "From: Catalog ops. Re: the vendor-grouped page.\n\nThe binder's vendor-grouped page: products ordered by maker, then by price within each maker, first six rows. Two hops to the maker, two-key sort, page cap. The page shows who sits next to whom on the shelf.",
    ask: "The first 6 products (by supplier name, then price) with category and maker.",
    template: `SELECT p.name, p.category, s.name
FROM products p
{1} suppliers s ON {2}
ORDER BY s.name, p.{3}
LIMIT 6;`,
    slots: [
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "The maker lives in suppliers; JOIN attaches it per product. UNION stacks result sets and can't sit in FROM.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the join condition",
        why: "products.supplier_id → suppliers.id names the maker. s.id = p.id pairs supplier ids with product ids.",
      },
      {
        answer: "price",
        kind: "keyword",
        label: "the within-maker sort",
        why: "Within each maker, products file by price: p.price. p.stock would file by shelf count instead.",
      },
    ],
    distractors: ["UNION", "s.id = p.id", "stock"],
    walkthrough:
      "The vendor-grouped page: makers alphabetical, price ladder within each, six rows to the page. Run it and the page opens on Andes Naturals' two products (band, speaker) priced in order — the shelf as the vendor sees it. The stock distractor files by shelf count: a warehouse view wearing a vendor page's header. Two-key sorts are how pages stay both grouped and readable; the second key is where the meaning hides.",
  },
  {
    id: "cs-513",
    tier: "easy",
    topic: "j3",
    universe: "funnel",
    title: "Region revenue with counts",
    brief:
      "From: Marketing lead. Re: the regional anchor chart, upgraded.\n\nThe anchor chart gains a count column: per customer region, order count AND revenue — the pair that stops a big total being mistaken for a big book. Biggest revenue first.",
    ask: "Per region: order count and revenue (Σ o.total, rounded), biggest revenue first.",
    template: `SELECT c.region, {1}(o.id) AS orders, ROUND(SUM(o.total), 2) AS revenue
FROM customers c
JOIN orders o ON {2}
GROUP BY c.region
ORDER BY revenue {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the book counter",
        why: "Order volume is a count: COUNT(o.id). SUM would add order ids — bookkeeping where a headcount belongs.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id fabricates a sixteen-row population.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The richest region leads: DESC on revenue.",
      },
    ],
    distractors: ["SUM", "o.id = c.id", "ASC"],
    walkthrough:
      "The upgraded anchor: EU 45 orders / 15,089.23, APAC 37 / 11,605.45, US 19 / 7,286.16, LATAM 2 / 852.44. The count column is the honesty device: LATAM's total looks small next to EU's, but 2 orders against 45 is the real story — a one-account market. The SUM-in-COUNT-slot would add order ids into a number that looks like volume and counts nothing.",
  },
  {
    id: "cs-514",
    tier: "easy",
    topic: "j3",
    universe: "inventory",
    title: "The desk mat's baskets, listed",
    brief:
      "From: Inventory control. Re: the hero product's basket list.\n\nThe hero product's basket list: every order containing the Desk Mat Extended, with the quantity on each line. Two hops from catalog to orders, pinned by name, basket-id order for the walk.",
    ask: "Every order containing the Desk Mat Extended, with line quantity, in order-id order.",
    template: `SELECT o.id, oi.quantity
FROM order_items oi
JOIN products p ON {1}
JOIN orders o ON {2}
WHERE p.name = {3}
ORDER BY o.id;`,
    slots: [
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the catalog hop",
        why: "order_items.product_id → products.id finds the desk mat's lines. p.id = oi.order_id pairs catalog ids with order numbers.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the order hop",
        why: "order_items.order_id → orders.id names the basket. oi.id = o.id pairs line numbers with order numbers.",
      },
      {
        answer: "'Desk Mat Extended'",
        kind: "keyword",
        label: "the hero literal",
        why: "The hero is pinned by its exact catalog name, quoted. A near-miss builds a different product's list.",
      },
    ],
    distractors: ["p.id = oi.order_id", "oi.id = o.id", "'Yoga Mat Eco 6mm'"],
    walkthrough:
      "The hero's basket list: 24 orders carry the Desk Mat Extended — one line each, quantities alongside, filed by order id for the shelf walk. Both hops real: catalog to find the lines, orders to name the baskets. The yoga-mat pin would list 27 lines across different baskets under this page's hero header — a true list for the wrong product. Hero-product lists get their literals checked against the catalog, every print run.",
  },
  {
    id: "cs-515",
    tier: "medium",
    topic: "j3",
    universe: "supplier",
    title: "The vendor work census",
    brief:
      "From: Supplier audit. Re: lines through each vendor, counted.\n\nThe vendor work census: order LINES that flow through each supplier's products — the two-hop chain counted per vendor, biggest flow first. Lines are transactions; pair this page with the units page to see both truths.",
    ask: "Line count per supplier through the chain, biggest first.",
    template: `SELECT s.name, {1}(oi.id) AS lines
FROM order_items oi
JOIN products p ON {2}
JOIN suppliers s ON {3}
GROUP BY s.id
ORDER BY lines {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the work counter",
        why: "Lines are transactions: COUNT(oi.id). SUM(oi.id) adds id numbers — bookkeeping in a work column.",
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the first join (line→product)",
        why: "order_items.product_id → products.id attaches the catalog. p.id = oi.order_id pairs products with order numbers.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the second join (product→supplier)",
        why: "products.supplier_id → suppliers.id attaches the vendor. s.region = p.category never matches.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest work flow leads the census — the vendor whose products ride the most order lines heads the page.",
      },
    ],
    distractors: ["SUM", "p.id = oi.order_id", "s.region = p.category", "ASC"],
    walkthrough:
      "The vendor work census: lines counted per vendor through two real hops — the transaction-grain companion to the units-grain board. The two rankings disagree by design: a vendor moving heavy few-line baskets ranks differently on boxes than on transactions. The region=category distractor zeroes the census silently ('EU' never equals 'Electronics'); the SUM-in-COUNT-slot prints id arithmetic as work. Both failures look like slow weeks.",
  },
  {
    id: "cs-516",
    tier: "hard",
    topic: "j3",
    universe: "month-close",
    title: "Pending money by city",
    brief:
      "From: Financial Controller. Re: the pipeline's city map.\n\nThe pipeline's city map: pending orders joined to their buyers' cities — count and exposure per city, biggest exposure first, top three. The map's total must reconcile to the 6,113.00 pipeline across fourteen orders.",
    ask: "Top 3 cities by pending exposure (Σ pending totals), with order counts.",
    template: `SELECT c.city, COUNT(o.id) AS pending, ROUND(SUM(o.total), 2) AS exposure
FROM customers c
JOIN orders o ON {1}
WHERE o.status = {2}
GROUP BY c.city
ORDER BY exposure {3}
LIMIT {4};`,
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
        why: "The map tracks 'pending' — quoted text. 'shipped' would map the dispatch book's geography.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest exposure leads the map: DESC.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the city cap",
        why: "The map carries three cities: LIMIT 3. At 16 it lists every city including the quiet ones.",
        noVerify: true,
      },
    ],
    distractors: ["o.id = c.id", "'shipped'", "ASC", "16"],
    walkthrough:
      "The pipeline's city map: pending orders bucketed by their buyers' cities — Berlin, Austin and Seoul leading by exposure, each city's page really being one customer's (the one-per-city rule again). The map's fourteen orders and 6,113.00 reconcile to the controller's pipeline number; the three-city cap keeps the binder page a summary. The 'shipped' pin would map 30 dispatched orders' geography under a pending header — real cities, wrong money.",
  },
  {
    id: "cs-517",
    tier: "hard",
    topic: "j3",
    universe: "fraud",
    title: "Cancellation value per account",
    brief:
      "From: Fraud spot-check desk. Re: the unwind ledger, per account.\n\nThe unwind ledger: total cancelled value per account — the four cancellation-holding customers with their sums, biggest first. Maya's single 397.99 against Alice's three small ones is the comparison the desk files.",
    ask: "Total cancelled value (Σ cancelled totals) per customer, biggest first.",
    template: `SELECT c.name, ROUND(SUM(o.total), 2) AS cancelled_value
FROM customers c
JOIN orders o ON {1}
WHERE o.status = {2}
GROUP BY c.id
ORDER BY cancelled_value {3};`,
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
        why: "The ledger slices to 'cancelled' — quoted text. 'pending' would ledger the live pipeline per account.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest unwind leads the ledger — Maya's single large cancellation is the comparison the desk files first.",
      },
    ],
    distractors: ["o.id = c.id", "'pending'", "ASC"],
    walkthrough:
      "The unwind ledger: four accounts, four sums — Alice Chen 494.82 across three cancellations, Maya Patel 397.99 on one, Emma Wilson 143.86, Farid Nasser 115.82 across two. The desk's read: Alice cancels often but small; Maya cancelled once, big. Frequency and magnitude are different risk signals, and the ledger carries both if you also keep the count column — which is exactly why this query exists as a template. The 'pending' pin would ledger live money as unwound.",
  },
  {
    id: "cs-518",
    tier: "easy",
    topic: "j4",
    universe: "refund-audit",
    title: "Payments per invoice, the full page",
    brief:
      "From: Refunds desk. Re: the full cash-profile page.\n\nThe full cash-profile page: every invoice with its payment count — zeros, ones and twos in one view, filed by count then number. The page's shape IS the receivables story: six at zero, seventeen at one, five at two.",
    ask: "Every invoice with its payment count, most payments first.",
    template: `SELECT i.number, COUNT(p.id) AS payments
FROM invoices i
{1} payments p ON {2}
GROUP BY i.id
ORDER BY payments {3}, i.number;`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "LEFT JOIN keeps the six unpaid invoices as zero-count rows — without them the page reads 22 invoices where 28 exist.",
      },
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id is the cash thread. Matching p.invoice_id to i.number compares a number to text.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The twos lead (the recovery list), then the ones, then the zeros: DESC then number.",
      },
    ],
    distractors: ["JOIN", "p.invoice_id = i.number", "ASC"],
    walkthrough:
      "The full cash profile: 28 invoices filed by payment count — five at 2 (the twice-paid recovery list), seventeen at 1 (healthy), six at 0 (the collections queue, one claiming 'paid'). The LEFT JOIN is what makes the zeros visible; INNER JOIN truncates the page to 22 rows and the six-hole story disappears. One page, three populations, all named — that's what a cash-profile page is for.",
  },
  {
    id: "cs-519",
    tier: "easy",
    topic: "j4",
    universe: "month-close",
    title: "Pending counts, zeros included",
    brief:
      "From: Financial Controller. Re: the pipeline census, unfiltered.\n\nThe pipeline census without the HAVING: every customer with their pending count — holders at 1-3, the quiet eight at zero, zeros first. The unfiltered view is what proves the eight were checked, not dropped.",
    ask: "Every customer with their pending order count, zeros first.",
    template: `SELECT c.name, COUNT(o.id) AS pending
FROM customers c
LEFT JOIN orders o ON {1} AND o.status = {2}
GROUP BY c.id
ORDER BY pending {3}, c.name;`,
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
        why: "The census tracks 'pending' — quoted text inside the ON so the quiet eight survive as NULL rows the count reads as zero.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "'Zeros first' is ascending — the census leads with the eight quiet accounts, proof they were checked.",
      },
    ],
    distractors: ["o.id = c.id", "'delivered'", "DESC"],
    walkthrough:
      "The unfiltered pipeline census: sixteen rows — the eight holders at 1-3 and the eight quiet accounts at 0, zeros leading the page. The count column reading zero is the census's whole point: those accounts were JOINED, matched, counted — and found empty. An INNER JOIN version would print eight rows and imply everyone else held nothing by omission; the zero rows replace implication with evidence. The 'delivered' pin would census the dispatch book's counts under a pipeline header.",
  },
  {
    id: "cs-520",
    tier: "medium",
    topic: "j4",
    universe: "expense",
    title: "Collected cash, by payer region",
    brief:
      "From: Spend analyst. Re: the cash map, payer edition.\n\nThe cash map: collected money (Σ payments ÷ 100) per PAYER region, with distinct paying accounts counted. Two joins — cash to paper to payer — both real. LATAM's absence is the map's hole by construction.",
    ask: "Per region: distinct paying accounts and collected cash (Σ ÷ 100), biggest first.",
    template: `SELECT c.region, COUNT(DISTINCT c.id) AS payers, ROUND(SUM(p.amount_cents) / 100.0, 2) AS collected
FROM payments p
JOIN invoices i ON {1}
JOIN customers c ON {2}
GROUP BY c.region
ORDER BY collected {3};`,
    slots: [
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the cash hop",
        why: "payments.invoice_id → invoices.id is the cash-to-paper thread. Matching p.invoice_id to i.number compares a number to text.",
      },
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the payer hop",
        why: "invoices.customer_id → customers.id names the payer — hop two. c.id = i.id pairs customer ids with invoice ids.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest cash pool leads the map — the treasury read starts at the region where the money actually moves.",
      },
    ],
    distractors: ["p.invoice_id = i.number", "c.id = i.id", "ASC"],
    walkthrough:
      "The payer-region cash map: EU's fourteen payments (37,261.00), APAC's eight (20,613.00), US's five (11,738.00) — 69,612.00 total, and LATAM absent because its only customer has never been invoiced, hence never paid. The DISTINCT keeps the payer count honest over any fan-out; the money column sums where the cash is. Two hops, both real, one deliberate hole — the map shows where cash moves AND where it can't.",
  },
  {
    id: "cs-521",
    tier: "easy",
    topic: "j4",
    universe: "funnel",
    title: "Unshipped counts, holder-gated",
    brief:
      "From: Marketing lead. Re: the delivery-promise holder list.\n\nThe delivery-promise holder list: customers holding at least one UNSHIPPED order, with counts — the anti... pro-join with the NULL filter inside the ON, zero buckets excluded, biggest backlog first.",
    ask: "Customers holding 1+ unshipped orders: name and count, biggest backlog first.",
    template: `SELECT c.name, COUNT(o.id) AS unshipped
FROM customers c
LEFT JOIN orders o ON {1} AND o.shipped_at IS {2}
GROUP BY c.id
{3} COUNT(o.id) >= 1
ORDER BY unshipped {4}, c.name;`,
    slots: [
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
        why: "'Unshipped' is shipped_at IS NULL — inside the ON so it filters the match, not the customer.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the holder gate",
        why: "COUNT(o.id) >= 1 drops the fully-dispatched zero buckets explicitly — the list can claim its denominator.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest backlog leads: DESC then name.",
      },
    ],
    distractors: ["o.id = c.id", "NOT", "WHERE", "ASC"],
    walkthrough:
      "The promise-holder list: the twenty-one unshipped orders distributed across their holders, biggest backlog first. The ON placement keeps the zero buckets alive long enough for the HAVING to exclude them on the record — the list can state 'holders only, N accounts checked'. The NOT distractor flips the filter to the 82 dispatched orders; WHERE in the gate slot errors on the aggregate. Backlogs get managed by holder, not by order — that's why the census groups at all.",
  },
  {
    id: "cs-522",
    tier: "medium",
    topic: "j4",
    universe: "refund-audit",
    title: "Unpaid counts per owner",
    brief:
      "From: Refunds desk. Re: the collections workload split.\n\nThe workload split: unpaid invoices counted per owner — the anti-payment join extended to the customer, alphabetical within ties. Six owners, one unpaid each on this book; the shape catches the day someone holds two.",
    ask: "Unpaid invoice count per owner, count ascending then name.",
    template: `SELECT c.name, COUNT(i.id) AS unpaid
FROM invoices i
LEFT JOIN payments p ON {1}
JOIN customers c ON i.customer_id = c.id
WHERE p.id IS {2}
GROUP BY c.id
ORDER BY unpaid {3}, c.name;`,
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
        why: "'Unpaid' is p.id IS NULL on the preserved rows. IS NOT NULL counts the twenty-one settled invoices per owner.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the workload sort",
        why: "'Lightest workload first' is ascending — the shape catches imbalance the day one owner holds several.",
      },
    ],
    distractors: ["p.invoice_id = i.number", "NOT", "c.city"],
    walkthrough:
      "The workload split: six owners, one unpaid invoice each — a perfectly balanced queue today. The count column exists for the day it isn't: the shape catches concentration (one owner holding three) the moment it develops. The mixed join types are the query's craft: LEFT toward payments (where the hole lives), INNER toward customers (every invoice has an owner). The NOT flip would split the twenty-one settled invoices per owner — a workload page for work already done.",
  },
  {
    id: "cs-523",
    tier: "hard",
    topic: "j4",
    universe: "month-close",
    title: "The pipeline's line ledger",
    brief:
      "From: Financial Controller. Re: pending orders with their line depth.\n\nThe pipeline's line ledger: each pending order with its buyer and LINE count — the full chain with the status pin, deepest basket first, top five. The ledger's lines must sum to the pipeline's 36.",
    ask: "The 5 pending orders with the most lines: order id, buyer, line count.",
    template: `SELECT o.id, c.name, COUNT(oi.id) AS lines
FROM customers c
JOIN orders o ON {1}
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = {2}
GROUP BY o.id
ORDER BY lines {3}, o.id
LIMIT {4};`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the buyer join",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the in-flight literal",
        why: "The ledger tracks the 'pending' slice — quoted text. 'cancelled' would ledger the unwind's baskets.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The deepest pending basket leads: DESC then order id for stable filing.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the ledger cap",
        why: "The ledger page carries five: LIMIT 5. At 14 it lists every pending order.",
        noVerify: true,
      },
    ],
    distractors: ["o.id = c.id", "'cancelled'", "ASC", "14"],
    walkthrough:
      "The pipeline's line ledger: the fourteen pending orders ranked by basket depth — the five deepest on the page, their 36 total lines reconciling to the close's number. The line grain rides the second hop; the status pin rides the order row because lines don't carry status. The 'cancelled' pin would ledger the unwind's baskets under a pipeline header — twelve real lines, wrong ledger. Pipeline pages and unwind pages share a shape and never a slice.",
  },
  {
    id: "cs-524",
    tier: "easy",
    topic: "j5",
    universe: "catalog",
    title: "Count the billed cities",
    brief:
      "From: Catalog ops. Re: the coverage map's positive space.\n\nThe coverage map's positive space: how many distinct CITIES hold at least one billed account? The ownership join, distinct city count. Eleven is the expected value — one per billed customer.",
    ask: "Count of distinct cities containing at least one billed customer.",
    template: `SELECT {1}({3} c.city) AS billed_cities
FROM customers c
JOIN invoices i ON {2};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the coverage counter",
        why: "A coverage count: COUNT(DISTINCT ...). SUM(DISTINCT c.city) would add city names — text summed into nonsense.",
      },
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real ownership thread: invoices.customer_id → customers.id. i.number = c.name compares codes to people.",
      },
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the city dedup",
        why: "Cities must count once despite the join's fan-out: DISTINCT collapses each customer's invoices. Without it the count reads 28 — invoices, not cities.",
      },
    ],
    distractors: ["SUM", "i.number = c.name", "ALL"],
    walkthrough:
      "The positive-space census: eleven distinct cities hold the eleven billed accounts — the one-customer-per-city rule making the count trivially exact. The DISTINCT is the page's spine: the join fans each customer out once per invoice (28 rows), and without the dedup the 'cities' count reads 28 — a map of paper, not places. The SUM-of-cities distractor fails loudly (text doesn't sum), which at least announces itself.",
  },
  {
    id: "cs-525",
    tier: "easy",
    topic: "j5",
    universe: "expense",
    title: "Count the cashed invoices",
    brief:
      "From: Spend analyst. Re: the coverage tile's numerator.\n\nThe coverage tile's numerator: how many invoices carry at least one payment? The inner join counts matched pairs — 27, over 28 invoices. The missing one is the KPI's whole story.",
    ask: "Count of invoices that have at least one payment.",
    template: `SELECT {1}(p.id) AS cashed
FROM invoices i
{3} payments p ON {2};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the numerator counter",
        why: "The numerator counts matched pairs: COUNT(p.id). SUM(p.id) adds payment ids — bookkeeping in a coverage tile.",
      },
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id is the cash thread. Matching p.invoice_id to i.number compares a number to text.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the matching join",
        why: "The numerator counts MATCHES — an inner join is the definition. UNION cannot appear in FROM.",
      },
    ],
    distractors: ["SUM", "p.invoice_id = i.number", "UNION"],
    walkthrough:
      "The coverage numerator: 27 invoices carry cash, out of 28 — the tile's 0.96 lives in that pair of numbers. The inner join IS the numerator's definition: it counts matches, and the six-unpaid gap is what it deliberately does NOT see (the denominator's LEFT JOIN edition sees it). The SUM-of-ids distractor prints a three-digit number where a count belongs — plausible on a dashboard, wrong by construction.",
  },
  {
    id: "cs-526",
    tier: "medium",
    topic: "j5",
    universe: "growth",
    title: "The billed books, biggest first",
    brief:
      "From: Head of Growth. Re: the billing leaderboard.\n\nThe billing leaderboard: customers ranked by total billed money — the ownership join, sums converted to units, top three. Alice's five invoices against everyone else's is the concentration story.",
    ask: "Top 3 customers by billed money (Σ invoice amounts ÷ 100).",
    template: `SELECT c.name, ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed
FROM customers c
JOIN invoices i ON {1}
GROUP BY c.id
ORDER BY billed {2}
LIMIT {3};`,
    slots: [
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
        why: "The biggest billed book leads the leaderboard — the concentration read starts at Alice's five-invoice total.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the podium cap",
        why: "The leaderboard shows three: LIMIT 3. At 11 it lists every billed account.",
        noVerify: true,
      },
    ],
    distractors: ["i.number = c.name", "ASC", "11"],
    walkthrough:
      "The billing leaderboard: Alice Chen 26,629.00, Emma Wilson 13,384.00, Maya Patel 11,542.00 — three books holding 51,555.00 of the 86,977.00 billed, nearly sixty percent in three names. The concentration read is the leaderboard's job; the ASC variant would open on Pedro's 873.00 and tell the opposite story. The name=text join distractor zeroes the page — a leaderboard of nothing that still ships if nobody probes.",
  },
  {
    id: "cs-527",
    tier: "medium",
    topic: "j5",
    universe: "fraud",
    title: "The quiet unbilled, counted",
    brief:
      "From: Fraud spot-check desk. Re: the double-gap census, cancelled edition.\n\nThe double-gap census, second edition: customers with no invoices AND no CANCELLED orders — quiet on billing, quiet on friction. Two preserved joins, two emptiness tests, one count. Four is the expected value.",
    ask: "Count of customers with zero invoices AND zero cancelled orders.",
    template: `SELECT {1}(*) AS quiet_dark
FROM customers c
LEFT JOIN invoices i ON i.customer_id = c.id
{2} orders o ON {3} AND o.status = {4}
WHERE i.id IS NULL AND o.id IS {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the census counter",
        why: "A census count: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the second hop's join",
        why: "Both hops preserve: INNER at the orders step kills the NULL-invoice rows before the WHERE can test them.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the second join's condition",
        why: "The real account thread for the friction check: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the friction literal",
        why: "'Quiet on friction' means no CANCELLED orders — quoted text inside the ON. 'pending' would census the pipeline edition instead.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the second emptiness column",
        why: "The invoice test is hardcoded; the friction test needs its own column: o.id IS NULL. Testing c.id — never NULL — finds zero rows.",
      },
    ],
    distractors: ["SUM", "INNER", "c.missing"],
    walkthrough:
      "The second-edition double-gap: four customers — Bruno Silva, Dmitri Volkov, Keiko Sato, Noah Meyer — hold no invoices AND no cancellations. Farid drops out of the pending edition's three because his two cancellations break the quiet. Every keyword defends the count: INNER at hop two deletes the finding, the 'pending' pin redefines the edition, and c.id in the emptiness test finds nobody. The census ties to its named list — that's what makes it fileable.",
  },
  {
    id: "cs-528",
    tier: "hard",
    topic: "j5",
    universe: "refund-audit",
    title: "The anomaly's five neighbors",
    brief:
      "From: Refunds desk. Re: the anomaly, excluded on purpose.\n\nThe collections list, refined: the unpaid invoices EXCLUDING the paid-status anomaly — status must not read 'paid'. The anti-join with the exclusion pin; five rows file out, all genuinely open.",
    ask: "Unpaid invoices whose status is NOT 'paid': numbers, in order.",
    template: `SELECT i.number
FROM invoices i
LEFT JOIN payments p ON {1}
WHERE p.id IS {2} AND i.status != {3}
ORDER BY i.number;`,
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
        why: "'Unpaid' is p.id IS NULL on the preserved rows. IS NOT NULL lists the twenty-one settled invoices.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the exclusion pin",
        why: "The anomaly reads 'paid' — the != excludes exactly it. Excluding 'open' would return the anomaly alone, inverting the list.",
      },
    ],
    distractors: ["p.invoice_id = i.number", "NOT", "'open'"],
    walkthrough:
      "The refined collections list: the anti-join isolates the six unpaid, and the != 'paid' pin excludes the anomaly on purpose — five genuinely-open invoices file out, leaving the anomaly to its own exhibit query. The discipline is deliberate exclusion: the anomaly isn't deleted, it's ROUTED — this list goes to collections, the exhibit goes to the controller. The 'open' pin inverts the query into the anomaly's solo page — one row, wrong audience.",
  },
  {
    id: "cs-529",
    tier: "hard",
    topic: "j5",
    universe: "expense",
    title: "The double-payment ledger",
    brief:
      "From: Spend analyst. Re: the recovery ledger.\n\nThe recovery ledger: invoices settled two or more times, with their TOTAL cash — the inner join (matches only), HAVING at two, biggest total first. Five invoices, 24,940.00 settled twice — the ledger the recovery calls work from.",
    ask: "Invoices with 2+ payments: number and total cash received (Σ ÷ 100), biggest first.",
    template: `SELECT i.number, ROUND(SUM(p.amount_cents) / 100.0, 2) AS total
FROM invoices i
JOIN payments p ON {1}
GROUP BY i.id
{2} COUNT(p.id) >= {3}
ORDER BY total {4};`,
    slots: [
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id is the cash thread. Matching p.invoice_id to i.number compares a number to text.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the doubles gate",
        why: "COUNT(p.id) >= 2 filters a per-group count — HAVING after GROUP BY. WHERE errors on aggregates.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the doubles floor",
        why: "The ledger starts at two payments. At 1 every matched invoice (22) qualifies and the ledger loses its point.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest double-settlement leads: DESC.",
      },
    ],
    distractors: ["p.invoice_id = i.number", "WHERE", "1", "ASC"],
    walkthrough:
      "The recovery ledger: five invoices at 2 payments each — INV-2024-001 (4,860.00), INV-2024-005 (5,284.00), INV-2024-012 (4,723.00), INV-2024-019 (5,614.00), INV-2024-022 (4,459.00) — 24,940.00 collected twice. The inner join is correct here BY DESIGN: the ledger counts invoices that HAVE payments; the LEFT edition would add twenty-three zero rows the gate then excludes — same result, longer story. The 1-floor distractor admits every matched invoice; the ledger becomes the whole book.",
  },
  {
    id: "cs-530",
    tier: "easy",
    topic: "j6",
    universe: "month-close",
    title: "The EU pair list, named",
    brief:
      "From: Financial Controller. Re: the pairing list, Europe edition.\n\nThe compliance pairing list, Europe: every distinct EU customer pair, both names, alphabetical by the first. The guarded self-join pinned to 'EU' — twenty-eight pairs on the page.",
    ask: "All same-region EU customer pairs (a.id < b.id), both names, alphabetical.",
    template: `SELECT a.name, b.name
FROM customers a
JOIN customers b ON {1} AND a.id {2} b.id
WHERE a.region = {3}
ORDER BY a.name;`,
    slots: [
      {
        answer: "a.region = b.region",
        kind: "keyword",
        label: "the pairing condition",
        why: "EU-mates share a region: region equality across the aliases. a.city = b.city pairs nobody — every city hosts one customer.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the guard operator",
        why: "a.id < b.id: each pair once, self-pairs impossible. <= would add the eight EU self-matches to the page.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region pin",
        why: "Region codes are uppercase: 'EU'. The lowercase 'eu' matches nothing and the compliance page prints empty.",
      },
    ],
    distractors: ["a.city = b.city", "<=", "'eu'"],
    walkthrough:
      "The EU pairing list: twenty-eight named pairs from Europe's eight customers — eight choose two, each pair printed once with both names, alphabetical by the first. The page is the compliance list the number alone can't be: '28 pairs' files as a statistic, 'Alice Chen & Chloe Dubois…' files as an audit artifact. The <= distractor adds eight self-pairs (a customer listed as their own team); the lowercase pin empties the page silently.",
  },
  {
    id: "cs-531",
    tier: "medium",
    topic: "j6",
    universe: "fraud",
    title: "Order pairs inside the EU",
    brief:
      "From: Fraud spot-check desk. Re: the regional pairing denominator.\n\nThe regional pairing denominator: order pairs whose buyers BOTH sit in the EU — the guarded order self-join extended one hop to the customers. 45 EU orders pair among themselves; the arithmetic should land on 990.",
    ask: "Count of order pairs (o1.id < o2.id) whose customers are both EU.",
    template: `SELECT {1}(*) AS pairs
FROM orders o1
JOIN orders o2 ON {2} AND o1.id < o2.id
JOIN customers c ON {3}
WHERE c.region = {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A pair total: COUNT(*). SUM(*) errors over the placeholder.",
      },
      {
        answer: "o1.customer_id = o2.customer_id",
        kind: "keyword",
        label: "the same-buyer condition",
        why: "Pairs form inside one buyer's book: customer equality across the order aliases. o1.id = o2.customer_id compares order numbers to customer ids.",
      },
      {
        answer: "o1.customer_id = c.id",
        kind: "keyword",
        label: "the buyer thread",
        why: "Both orders ride the real thread to the pinned customer: o1.customer_id → c.id. o1.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region pin",
        why: "Region codes are uppercase: 'EU'. The lowercase 'eu' pairs nothing and the denominator reads zero.",
      },
    ],
    distractors: ["SUM", "o1.id = o2.customer_id", "o1.id = c.id", "'eu'"],
    walkthrough:
      "The regional pairing denominator: the EU's 45 orders pair among themselves — C(45,2) = 45×44÷2 = 990. The two-condition shape is the case: same-buyer equality pairs the orders, the customer thread pins the region. Miss the second hop and the 'EU' filter has nothing to filter — the query counts the whole book's 624 under a regional label. Denominators that regionalize incorrectly are how false-positive rates get invented.",
  },
  {
    id: "cs-532",
    tier: "medium",
    topic: "j6",
    universe: "catalog",
    title: "The speaker's shelf-mate",
    brief:
      "From: Catalog ops. Re: the sibling pair, named.\n\nThe sibling census, named edition: which product shares the Bluetooth Speaker Mini's supplier? The guarded product self-join pinned by name — one pair expected, Andes' two-product bench being the smallest.",
    ask: "The product sharing the Bluetooth Speaker Mini's supplier (both names).",
    template: `SELECT p1.name, p2.name
FROM products p1
JOIN products p2 ON {1} AND p1.id {2} p2.id
WHERE p1.name = {3};`,
    slots: [
      {
        answer: "p1.supplier_id = p2.supplier_id",
        kind: "keyword",
        label: "the sibling condition",
        why: "Shelf-mates share a supplier: supplier equality across the aliases. p1.id = p2.supplier_id compares product ids to supplier ids.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the guard operator",
        why: "p1.id < p2.id: the pair once, self-pairs impossible. <= would add the speaker's self-match — the speaker 'paired' with itself.",
      },
      {
        answer: "'Bluetooth Speaker Mini'",
        kind: "keyword",
        label: "the product pin",
        why: "The census pins Andes' speaker by its exact catalog name, quoted. Pinning the yoga mat censuses Midwest's bench instead.",
      },
    ],
    distractors: ["p1.name = p2.name", "<=", "'Yoga Mat Eco 6mm'"],
    walkthrough:
      "The named sibling pair: Bluetooth Speaker Mini × Fitness Band X2 — Andes Naturals' entire two-product bench, paired once. The page exists because pairing CENSUSES hide the names: 14 sibling pairs book-wide is a statistic; this row is a merchandising decision (one vendor call covers both SKUs). The <= guard adds the speaker's self-match — a product 'paired' with itself on a real page. The yoga-mat pin returns a true pair from a different vendor's bench.",
  },
  {
    id: "cs-533",
    tier: "medium",
    topic: "j6",
    universe: "supplier",
    title: "The APAC vendor pair",
    brief:
      "From: Supplier audit. Re: the regional pair, named.\n\nThe regional pairing page, APAC edition: which two suppliers share the region? The guarded self-join pinned to 'APAC' — one pair expected, the region's whole bench being two vendors.",
    ask: "The two APAC suppliers that share the region (both names).",
    template: `SELECT s1.name, s2.name
FROM suppliers s1
JOIN suppliers s2 ON {1} AND s1.id {2} s2.id
WHERE s1.region = {3};`,
    slots: [
      {
        answer: "s1.region = s2.region",
        kind: "keyword",
        label: "the pairing condition",
        why: "Regional mates share the region: equality across the aliases. s1.id = s2.region compares a supplier id to a region code.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the guard operator",
        why: "s1.id < s2.id: the pair once, self-pairs impossible. <= would add both self-matches — three rows where one pair belongs.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the region pin",
        why: "Region codes are uppercase: 'APAC'. The lowercase 'apac' pairs nothing and the page prints empty.",
      },
    ],
    distractors: ["s1.id = s2.region", "<=", "'eu'"],
    walkthrough:
      "The APAC pair, named: Shenzhen Electro & Pacific Textiles — the region's entire bench, paired once on the page. The smallest pairing population is where guards are easiest to verify by hand: one region pin, two vendors, C(2,2) = 1. The <= guard adds both self-matches (vendors 'paired' with themselves); the lowercase 'eu' pin empties the page. Regional pair pages feed the co-negotiation plan — one call covering two vendors.",
  },
  {
    id: "cs-534",
    tier: "hard",
    topic: "j6",
    universe: "growth",
    title: "Pairing pools, by region",
    brief:
      "From: Head of Growth. Re: the pairing pools, ranked.\n\nThe pairing-pool ranking: same-region customer pairs bucketed per region — EU's density against everyone else's, biggest pool first. The guarded self-join grouped by the shared region; LATAM's absence is the punchline.",
    ask: "Same-region customer pair count per region, biggest pool first.",
    template: `SELECT a.region, {1}(*) AS pairs
FROM customers a
JOIN customers b ON {2} AND a.id {3} b.id
GROUP BY a.region
ORDER BY pairs {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the pool counter",
        why: "Pool sizes are pair counts: COUNT(*). SUM(*) errors over the placeholder.",
      },
      {
        answer: "a.region = b.region",
        kind: "keyword",
        label: "the pairing condition",
        why: "Pool-mates share a region: equality across the aliases. a.city = b.city pairs nobody — the pools would all read zero.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the guard operator",
        why: "a.id < b.id: each pair once, self-pairs impossible. <= would add sixteen self-matches spread across the pools.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest pool leads: DESC. ASC would open on US's single pair.",
      },
    ],
    distractors: ["SUM", "a.city = b.city", "<=", "ASC"],
    walkthrough:
      "The pairing pools: EU 28 (eight customers, dense), APAC 10 (five), US 1 (two), and LATAM absent — one customer can pair with nobody. The grouping turns the book-wide 39 into a regional story: Europe is the pairing market. The city-equality distractor builds three-zero pools under a region label — every bucket empty, the page reading as if no pairs exist anywhere. Pool pages are how clustering claims get checked before they get printed.",
  },
  {
    id: "cs-535",
    tier: "hard",
    topic: "j6",
    universe: "supplier",
    title: "Nordic's sibling pairs",
    brief:
      "From: Supplier audit. Re: the bench census, pinned to the vendor.\n\nThe sibling census pinned to Nordic Gadgets (supplier 1): how many pairs form within their three-product bench? The guarded product self-join pinned by supplier id — three pairs expected.",
    ask: "Count of same-supplier product pairs within supplier 1's bench.",
    template: `SELECT {1}(*) AS pairs
FROM products p1
JOIN products p2 ON {2} AND p1.id {3} p2.id
WHERE p1.supplier_id = {4};`,
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
        why: "Bench-mates share a supplier: equality across the aliases. p1.id = p2.id with the guard can never both hold.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the guard operator",
        why: "p1.id < p2.id: each pair once, self-pairs impossible. <= would add three self-matches — 6 instead of 3.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the vendor pin",
        why: "Nordic Gadgets AB is supplier 1. Pinning supplier 2 (Shenzhen) would census a different three-product bench.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "p1.id = p2.id", "<=", "5"],
    walkthrough:
      "The pinned bench census: Nordic's three products pair among themselves — C(3,2) = 3 (keyboard-webcam, keyboard-watch, webcam-watch). The pin moves the census: supplier 2's bench also reads 3 (Shenzhen's trio), supplier 5's reads 1 (Alpine's pair). The <= guard adds the three self-matches — products 'paired' with themselves on a count that should be pairs. Vendor-level pairing counts are how co-marketing budgets get split; the pin is the budget line.",
  },
  {
    id: "cs-536",
    tier: "easy",
    topic: "j7",
    universe: "expense",
    title: "Collected cash by ledger claim",
    brief:
      "From: Spend analyst. Re: the cash-vs-claim rollup.\n\nThe cash-vs-claim rollup: collected cash (Σ payments ÷ 100) bucketed by the INVOICE's status — what the ledger claims next to what actually arrived. The rollup's total must reconcile to 69,612.00.",
    ask: "Collected cash per invoice status (Σ payments ÷ 100), biggest first.",
    template: `SELECT i.status, ROUND({1}(p.amount_cents) / 100.0, 2) AS collected
FROM payments p
JOIN invoices i ON {2}
GROUP BY i.status
ORDER BY collected {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the cash aggregate",
        why: "Collected cash is money summed: SUM(p.amount_cents). COUNT would put a payment headcount where a currency belongs.",
      },
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id is the cash thread. Matching p.invoice_id to i.number compares a number to text.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest claim bucket leads the rollup — the ledger's largest claim sits next to the cash that actually arrived for it.",
      },
    ],
    distractors: ["COUNT", "p.invoice_id = i.number", "ASC"],
    walkthrough:
      "The cash-vs-claim rollup: three buckets, one per ledger claim, summing to the full 69,612.00 collected. The rollup's quiet power is the reconciliation: paid-paper cash plus open-paper cash plus void-paper cash equals the treasury number — any drift means a payment landed on an invoice whose status nobody updated (the paid-status anomaly's home turf). The COUNT distractor puts headcounts where currencies belong; the ASC variant opens on the smallest bucket.",
  },
  {
    id: "cs-537",
    tier: "easy",
    topic: "j7",
    universe: "pricing",
    title: "The cable's realized revenue",
    brief:
      "From: Pricing committee. Re: the traffic product's money.\n\nThe traffic product's money: realized revenue for the HDMI 2.1 Cable — Σ quantity × unit_price over its lines. The cheapest SKU's money page, next to its 38-unit volume.",
    ask: "Realized revenue (Σ quantity × unit_price) for the HDMI 2.1 Cable 2m.",
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
        why: "order_items.product_id → products.id finds the cable's lines. p.id = oi.order_id pairs catalog ids with order numbers.",
      },
      {
        answer: "'HDMI 2.1 Cable 2m'",
        kind: "keyword",
        label: "the product literal",
        why: "The exact catalog name, quoted. A near-miss silently builds a different product's money page.",
      },
    ],
    distractors: ["unit_price", "p.id = oi.order_id", "'Desk Mat Extended'"],
    walkthrough:
      "The traffic product's money page: 575.50 of realized revenue on 38 units — the cheapest SKU in the store earning real money on pure volume. The expression is the case's spine: unit_price alone would report roughly a third of that (one unit per line), and the pricing committee's debate would run on a number that never existed. The desk-mat pin would page 1,176.02 under the cable's header — true money, wrong SKU.",
  },
  {
    id: "cs-538",
    tier: "medium",
    topic: "j7",
    universe: "inventory",
    title: "The yoga mat's cover ratio",
    brief:
      "From: Inventory control. Re: the single-product cover check.\n\nThe cover check, pinned: the Yoga Mat Eco's shelf cover — stock 220 divided by its 27 sold units, as a 2-decimal ratio. The ×1.0 keeps the division float; the join brings the mat's sales alongside its shelf.",
    ask: "The Yoga Mat Eco's shelf cover ratio (stock ÷ units sold, 2 decimals).",
    template: `SELECT p.name, ROUND(p.stock * {1} / SUM(oi.quantity), 2) AS cover
FROM products p
JOIN order_items oi ON {2}
WHERE p.name = {3}
GROUP BY p.id;`,
    slots: [
      {
        answer: "1.0",
        kind: "number",
        label: "the float coercion",
        why: "220 ÷ 27 in integer arithmetic floors to 8. ×1.0 keeps 8.15 a ratio instead of a rounded guess.",
        noVerify: true,
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.product_id → products.id brings the mat's sales. p.id = oi.order_id pairs catalog ids with order numbers.",
      },
      {
        answer: "'Yoga Mat Eco 6mm'",
        kind: "keyword",
        label: "the product pin",
        why: "The check pins the mat by its exact catalog name, quoted. A near-miss computes a different shelf's cover.",
      },
    ],
    distractors: ["100.0", "p.id = oi.order_id", "'Desk Mat Extended'"],
    walkthrough:
      "The pinned cover check: 220 stock over 27 sold units — 8.15 weeks-equivalent of demand coverage on the shelf. The ×1.0 is quiet but decisive: integer division floors the ratio to 8, and reorder thresholds live in the decimals. The desk-mat pin computes 260 ÷ 47 = 5.53 under the mat's header — a true ratio for the wrong shelf, and exactly the kind of swap that flips a reorder decision. Pinned ratios get pinned literals.",
  },
  {
    id: "cs-539",
    tier: "medium",
    topic: "j7",
    universe: "pricing",
    title: "List vs realized, one line",
    brief:
      "From: Pricing committee. Re: the exhibit line.\n\nThe pricing exhibit: order 1's yoga mat line — transacted unit price next to catalog list. 31.02 against 32.00: the 98-cent gap is the street's answer to list, on one physical line.",
    ask: "Order 1's yoga mat line: transacted unit price and catalog list price.",
    template: `SELECT oi.unit_price, p.price
FROM order_items oi
JOIN products p ON {1}
WHERE oi.order_id = {2} AND p.name = {3};`,
    slots: [
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.product_id → products.id brings the list price to the line. p.id = oi.order_id pairs catalog ids with order numbers.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the exhibit order",
        why: "The exhibit is order 1 — its line-level price is the documented gap. Order 2's lines transact at their own prices.",
        noVerify: true,
      },
      {
        answer: "'Yoga Mat Eco 6mm'",
        kind: "keyword",
        label: "the exhibit product",
        why: "The exhibit pins the mat by its exact catalog name, quoted — order 1 carries four lines and only one is the mat's.",
      },
    ],
    distractors: ["p.id = oi.order_id", "2", "'HDMI 2.1 Cable 2m'"],
    walkthrough:
      "The exhibit line: 31.02 transacted against a 32.00 list — the 98-cent gap that scales across the book. Both pins make it THE line: order 1's four lines carry four products, and only the mat pin picks the pricing exhibit. The order_id distractor would join the catalog entry whose id equals the order number — a coincidence wearing an exhibit's name. Pricing exhibits are single lines, pinned twice.",
  },
  {
    id: "cs-540",
    tier: "medium",
    topic: "j7",
    universe: "supplier",
    title: "Andes' two money columns",
    brief:
      "From: Supplier audit. Re: the smallest vendor's money page.\n\nThe money page for Andes Naturals: units AND realized revenue per product through the chain, pinned by name. Two products, two units figures (30 and 21), two money figures — the negotiation slide in four numbers.",
    ask: "Units and realized revenue per product for Andes Naturals SA, biggest revenue first.",
    template: `SELECT p.name, SUM(oi.quantity) AS units, ROUND(SUM(oi.{1}), 2) AS revenue
FROM order_items oi
JOIN products p ON {2}
JOIN suppliers s ON {3}
WHERE s.name = {4}
GROUP BY p.id
ORDER BY revenue {5};`,
    slots: [
      {
        answer: "quantity * unit_price",
        kind: "keyword",
        label: "the money expression",
        why: "Realized revenue is quantity × unit_price, summed. unit_price alone prices every line at one unit.",
      },
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
        why: "products.supplier_id → suppliers.id attaches the vendor. s.region = p.category compares 'LATAM' to 'Fitness'.",
      },
      {
        answer: "'Andes Naturals SA'",
        kind: "keyword",
        label: "the vendor literal",
        why: "The vendor pinned by exact name, quoted. A wrong vendor silently builds someone else's money page.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest money product leads: DESC — the speaker's premium over the band's volume shows in the order.",
      },
    ],
    distractors: ["unit_price", "p.id = oi.order_id", "s.region = p.category", "'Alpine Audio GmbH'", "ASC"],
    walkthrough:
      "Andes' money page: the Fitness Band's 30 units beside the Speaker's 21, with realized revenue sorting the page — the speaker's premium price likely outranking the band's volume in money despite fewer boxes. The two columns are the slide: volume (units) and value (money) per product, both at the line grain through two real hops. The vendor literal moves the page vendor by vendor; the region=category join zeroes it silently.",
  },
  {
    id: "cs-541",
    tier: "hard",
    topic: "j7",
    universe: "growth",
    title: "The whale's basket depth",
    brief:
      "From: Head of Growth. Re: Alice's depth number, guarded.\n\nThe case study's depth number: Alice Chen's lines per distinct order — 50 lines over 24 orders, computed with both guards (×1.0 for the float, DISTINCT for the denominator). The study quotes 2.08; the query must prove it.",
    ask: "Alice Chen's lines-per-order ratio (COUNT lines × 1.0 ÷ COUNT DISTINCT orders).",
    template: `SELECT c.name, ROUND(COUNT(oi.id) * {1} / COUNT({2} o.id), 2) AS lines_per_order
FROM customers c
JOIN orders o ON {3}
JOIN order_items oi ON {4}
WHERE c.name = {5}
GROUP BY c.id;`,
    slots: [
      {
        answer: "1.0",
        kind: "number",
        label: "the float coercion",
        why: "50 ÷ 24 in integer arithmetic floors to 2. ×1.0 keeps 2.08 the ratio the study quotes.",
        noVerify: true,
      },
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the order dedup",
        why: "COUNT(DISTINCT o.id) counts her 24 orders, not her 50 joined rows — ALL makes the ratio read 1.0.",
      },
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
        why: "The line grain arrives via order_items.order_id → orders.id. oi.id = o.id corrupts both sides of the division.",
      },
      {
        answer: "'Alice Chen'",
        kind: "keyword",
        label: "the study pin",
        why: "The study pins Alice by name, quoted. Emma's name computes her 2.71 under this study's header.",
      },
    ],
    distractors: ["1", "ALL", "o.id = c.id", "oi.id = o.id", "'Emma Wilson'"],
    walkthrough:
      "The depth number, proven: 50 lines over 24 distinct orders — 2.08, the figure the Alice case study quotes. Both guards are the proof: the ×1.0 defeats integer division's floor, the DISTINCT defeats the fan-out's inflation (ALL would divide 50 by 50 and read 1.0 — depthless by arithmetic). The name pin scopes the study; Emma's name computes a true ratio for a different case study. Case-study numbers get re-proven by the query that claims them.",
  },
  {
    id: "cs-542",
    tier: "hard",
    topic: "j7",
    universe: "month-close",
    title: "The pending slice, two grains",
    brief:
      "From: Financial Controller. Re: the pipeline's fan-out check.\n\nThe pipeline's fan-out check: over the pending slice, the joined LINE count next to the order-total sum — the latter inflated by each order's line count. 36 lines; the inflated column should read roughly 2.6× the honest 6,113.00. Verify the ratio.",
    ask: "For pending orders: line count and Σ o.total over the joined rows (the inflated figure).",
    template: `SELECT o.status, {1}(oi.id) AS lines, ROUND(SUM(o.total), 2) AS inflated
FROM orders o
JOIN order_items oi ON {2}
WHERE o.status = {3}
GROUP BY o.status;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the honest counter",
        why: "Lines are rows: COUNT(oi.id). SUM(oi.id) adds id numbers — bookkeeping in a work column.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.order_id → orders.id creates the fan-out being measured. oi.id = o.id measures a coincidence instead.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the slice literal",
        why: "The check slices to 'pending' — quoted text. 'delivered' would check the landed book's inflation instead.",
      },
    ],
    distractors: ["SUM", "oi.id = o.id", "'delivered'"],
    walkthrough:
      "The pipeline's fan-out check: 36 joined lines, and the Σ(o.total) column reading roughly 2.6× the honest 6,113.00 — each pending order's total repeated once per line. The ratio (36 lines ÷ 14 orders) IS the inflation factor, slice-sized. The module's big lesson, scaled down: the money column is honest only when it lives on the line (quantity × unit_price); o.total over a child join always lies, and now by a measurable factor. The 'delivered' pin runs the same check on the landed book — same lesson, different slice.",
  },
  {
    id: "cs-543",
    tier: "hard",
    topic: "j7",
    universe: "refund-audit",
    title: "The unwind's product money",
    brief:
      "From: Refunds desk. Re: which products the cancellations unwound, in money.\n\nThe unwind's money mix: realized line money per product across cancelled orders — the twelve cancelled lines valued at the line grain, bucketed per product, biggest exposure first.",
    ask: "Realized line money per product across cancelled orders, biggest first.",
    template: `SELECT p.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS unwound
FROM orders o
JOIN order_items oi ON {1}
JOIN products p ON {2}
WHERE o.status = {3}
GROUP BY p.id
ORDER BY unwound {4};`,
    slots: [
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the line hop",
        why: "order_items.order_id → orders.id reaches the cancelled lines. oi.id = o.id keeps coincidence lines.",
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the product hop",
        why: "order_items.product_id → products.id names the thing unwound. p.id = oi.order_id pairs products with order numbers.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status literal",
        why: "The mix slices to 'cancelled' — quoted text. 'pending' would value the live pipeline's products.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest money exposure leads the mix — the product the cancellations cost most heads the review page.",
      },
    ],
    distractors: ["oi.id = o.id", "p.id = oi.order_id", "'pending'", "ASC"],
    walkthrough:
      "The unwind's money mix: the twelve cancelled lines valued at quantity × transacted price, bucketed per product — the page that says which catalog items the cancellations actually cost. The money expression lives on the line, so no fan-out inflates it; the o.total version would repeat each cancelled order's total per line. The count edition of this page (how often each product unwinds) pairs with it: frequency and magnitude, two queries, one review.",
  },
  {
    id: "cs-544",
    tier: "medium",
    topic: "j8",
    universe: "supplier",
    title: "USING between the vendors",
    brief:
      "From: Supplier audit. Re: the shorthand's vendor edition.\n\nThe USING tour's vendor stop: suppliers JOIN products USING(id) — both tables carry an id column, so the shorthand matches vendor 1 to product 1, six times over. Count it, then name the real link it buried.",
    ask: "Count rows from suppliers JOIN products USING (id).",
    template: `SELECT {1}(*) AS paired
FROM suppliers
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
        why: "suppliers and products share exactly one column name: id. USING(supplier_id) errors — products has no such column.",
      },
    ],
    distractors: ["SUM", "UNION", "supplier_id"],
    walkthrough:
      "The vendor stop on the USING tour: six id coincidences — vendor 1 meeting product 1, and so on — while the REAL link (products.supplier_id → suppliers.id) carries 16 rows this query never sees. The supplier_id distractor fails at parse time, the friendly outcome; the silent 6 is the dangerous one. Four tables toured across the module, four coincidences found: USING answers 'what do the names share', and the names here are bookkeeping.",
  },
  {
    id: "cs-545",
    tier: "medium",
    topic: "j8",
    universe: "month-close",
    title: "The unshipped exposure rollup",
    brief:
      "From: Financial Controller. Re: the limbo-money rollup.\n\nThe limbo-money rollup: unshipped order totals per holder — the NULL filter inside the ON, zero buckets excluded by HAVING, exposure sorted down. The rollup must reconcile to the 7,265.49 sitting in limbo.",
    ask: "Unshipped money (Σ unshipped totals) per holder, biggest first.",
    template: `SELECT c.name, ROUND(SUM(o.total), 2) AS limbo
FROM customers c
LEFT JOIN orders o ON {1} AND o.shipped_at IS {2}
GROUP BY c.id
{3} COUNT(o.id) >= 1
ORDER BY limbo {4};`,
    slots: [
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
        why: "'Limbo' is shipped_at IS NULL — inside the ON so it filters the match, not the customer.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the holder gate",
        why: "COUNT(o.id) >= 1 drops the fully-dispatched zero buckets explicitly — the rollup claims its denominator.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest limbo balance leads the rollup — the holder with the most stuck money is the first promise to chase.",
      },
    ],
    distractors: ["o.id = c.id", "NOT", "WHERE", "ASC"],
    walkthrough:
      "The limbo rollup: the twenty-one unshipped orders' 7,265.49 distributed across their holders, biggest balance first. The ON placement keeps the fully-dispatched zeros alive for the HAVING to exclude on the record; move the filter to WHERE and the zeros die before the gate — the rollup prints the same rows but loses the claim that everyone was checked. The NOT flip would roll up the 82 dispatched orders' money as 'limbo' — real totals, opposite meaning.",
  },
  {
    id: "cs-546",
    tier: "medium",
    topic: "j8",
    universe: "funnel",
    title: "RIGHT JOIN down the chain",
    brief:
      "From: Marketing lead. Re: the preservation survey, chain edition.\n\nThe preservation survey runs the chain backwards: order_items RIGHT JOIN orders on the real link — the ORDER side survives, every order present even if a line were missing. Count and compare with the inner join's 251.",
    ask: "Count rows from order_items RIGHT JOIN orders on the real link.",
    template: `SELECT {1}(*) AS rows_
FROM order_items oi
{2} JOIN orders o ON {3};`,
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
        why: "RIGHT JOIN preserves the orders — all 103, even a hypothetical line-less one. The inner join's 251 counts only matched lines.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real link: order_items.order_id → orders.id. oi.id = o.id pairs line numbers with order numbers.",
      },
    ],
    distractors: ["SUM", "UNION", "oi.missing"],
    walkthrough:
      "The chain's RIGHT edition: 103 rows — every order preserved, each carrying its lines, none missing any. Today it mirrors the inner join's population shape (every order has lines) but at the LINE grain the numbers differ: 103 preserved orders versus 251 joined lines. The survey's point: RIGHT here answers 'is every order in the join?' — a coverage question the 251-row inner join can't ask. The id-coincidence condition happens to read 103 too, which is exactly why survey conditions get pinned to the real key.",
  },
  {
    id: "cs-547",
    tier: "hard",
    topic: "j8",
    universe: "catalog",
    title: "The Cartesian money noise",
    brief:
      "From: Catalog ops. Re: the cross-join's money damage.\n\nThe footgun's money edition: orders CROSS JOIN products with no condition — 1,648 rows, and the summed catalog price across them reads 118,288.29. The decomposition (103 × 1,148.43) is the exhibit's proof.",
    ask: "One row: Cartesian row count and the summed product price across the cross join.",
    template: `SELECT {1}(*) AS cartesian, ROUND(SUM(products.price), 2) AS noise
FROM orders
{2} JOIN {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the row counter",
        why: "The census counts rows: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "CROSS",
        kind: "keyword",
        label: "the unconditional join",
        why: "CROSS JOIN pairs every order with every product — no ON, the full 103 × 16 grid.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the crossed table",
        why: "The noise sums the catalog across the grid: 16 prices × 103 orders. Crossing suppliers would explode 103 × 6 with their (absent) prices erroring instead.",
      },
    ],
    distractors: ["UNION", "WHERE", "ON"],
    walkthrough:
      "The money-damage exhibit: 1,648 rows of pure noise, and the summed price column reading 118,288.29 — 103 copies of the catalog's 1,148.43 total, once per order. Nobody spent that; the cross join multiplied the catalog by the order book. The decomposition (rows = 103 × 16, money = 103 × catalog-sum) is how the exhibit proves itself to a skeptical room. And the distractors here are syntax traps by design: drop any keyword of the join and SQLite refuses to run — the loud failure being infinitely friendlier than the silent 1,648.",
  },
  {
    id: "cs-548",
    tier: "hard",
    topic: "j8",
    universe: "fraud",
    title: "NATURAL with money attached",
    brief:
      "From: Fraud spot-check desk. Re: the implicit match's money damage.\n\nThe NATURAL tour's money edition: orders NATURAL JOIN order_items — 103 id coincidences — with the order totals summed across them. The count proves the coincidence; the money column shows what a coincidence costs when someone sums it.",
    ask: "One row: NATURAL-pair row count and Σ o.total across the coincidences.",
    template: `SELECT {1}(*) AS paired, ROUND(SUM(orders.total), 2) AS noise
FROM {3}
NATURAL JOIN {2};`,
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
        label: "the implicit partner",
        why: "orders and order_items share only the id name — 103 id coincidences. NATURAL invoices shares id AND customer_id: a different coincidence.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the base table",
        why: "The money column (o.total) pins the base table: orders. Starting at customers would sum nothing — no total column there.",
      },
    ],
    distractors: ["SUM", "customers", "UNION"],
    walkthrough:
      "The money edition of the NATURAL exhibit: 103 id coincidences, and the summed o.total across them printing a plausible-looking number nobody asked for — order totals attached to lines that merely share an id. The base-table slot matters more than usual: the money column only exists on orders, so the query's own SELECT names the table it meant. The customers distractor errors on the money column (no total there) — the loud failure again being the friendly one. Implicit matches plus aggregates is how fiction gets funded.",
  },
  {
    id: "cs-549",
    tier: "hard",
    topic: "j8",
    universe: "supplier",
    title: "The chain's work podium",
    brief:
      "From: Supplier audit. Re: the full chain, work-ranked.\n\nThe full chain, work-ranked: lines counted per supplier through the four-hop chain (lines→orders→customers... lines→products→suppliers), top three vendors. Every hop a real key; the podium is the audit's opening page.",
    ask: "Top 3 suppliers by line count through the full chain.",
    template: `SELECT s.name, COUNT(oi.id) AS lines
FROM order_items oi
JOIN orders o ON {1}
JOIN products p ON {2}
JOIN suppliers s ON {3}
GROUP BY s.id
ORDER BY lines {4}
LIMIT {5};`,
    slots: [
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "hop 1 (line→order)",
        why: "The parent link: order_items.order_id → orders.id. oi.id = o.id pairs line numbers with order numbers.",
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "hop 2 (line→product)",
        why: "The catalog hop: order_items.product_id → products.id. p.id = oi.order_id pairs products with order numbers.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "hop 3 (product→supplier)",
        why: "The vendor hop: products.supplier_id → suppliers.id. s.region = p.category compares 'US' to 'Audio'.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest work flow leads the podium: DESC.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the podium cap",
        why: "The podium carries three: LIMIT 3. At 6 it lists every vendor.",
        noVerify: true,
      },
    ],
    distractors: ["oi.id = o.id", "p.id = oi.order_id", "s.region = p.category", "ASC", "6"],
    walkthrough:
      "The chain's work podium: lines counted per vendor through three real hops — lines to orders (their baskets), lines to products (their SKUs), products to suppliers (their vendors) — top three on the audit's opening page. All hops many-to-one from the line's perspective, so the 251-row grain survives intact; the count is work, not inflation. The region=category hop would zero the podium silently; the id-coincidence hops would rank vendors on lines that never touched them.",
  },
  {
    id: "cs-550",
    tier: "hard",
    topic: "j8",
    universe: "funnel",
    title: "The closing header, with money",
    brief:
      "From: Marketing lead. Re: the module's final header row.\n\nThe module's final header: joined rows, DISTINCT orders, and the honest line money — 251, 103, 34,833.28 in one row. Every future join query in this module reconciles to it or explains itself.",
    ask: "One row: joined rows, COUNT(DISTINCT orders), and Σ quantity × unit_price.",
    template: `SELECT COUNT(*) AS joined, COUNT(DISTINCT o.id) AS orders, ROUND(SUM(oi.{1}), 2) AS honest
FROM customers c
JOIN orders o ON {2}
JOIN order_items oi ON {3};`,
    slots: [
      {
        answer: "quantity * unit_price",
        kind: "keyword",
        label: "the honest money expression",
        why: "Line money is quantity × unit_price, summed — the only money column that survives the fan-out untainted.",
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
        why: "The line grain arrives via order_items.order_id → orders.id. oi.id = o.id corrupts all three numbers.",
      },
    ],
    distractors: ["unit_price", "o.id = c.id", "oi.id = o.id"],
    walkthrough:
      "The closing header: 251 joined rows, 103 distinct orders, 34,833.28 of honest line money — the three numbers the module chased, in one row. The money expression is the finale's point: it lives ON the line, so the fan-out can't touch it; the o.total edition of this same header would read 103,244.55 and ship to the board. Both joins real, the count deduped, the money at its grain — the header every downstream query reconciles to, and the module's last word.",
  },
];

