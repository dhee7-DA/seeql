// Case batch J6 — Module 2 (joins) cases cs-551…cs-600. Final batch.
// 50 cases: 16 easy / 17 medium / 17 hard. Topic spread j1×4, j2×7, j3×6,
// j4×6, j5×6, j6×5, j7×8, j8×8. Figures probed on the live seed db and
// mechanically audited by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesJ6: CaseStudy[] = [
  {
    id: "cs-551",
    tier: "easy",
    topic: "j1",
    universe: "supplier",
    title: "Alpine's catalog page",
    brief:
      "From: Procurement lead. Re: the vendor page, Alpine edition.\n\nThe vendor page for Alpine Audio GmbH: both products with their stock, deepest shelf first. Join the catalog to its maker, pin by name. Two rows, one call.",
    ask: "Alpine Audio GmbH's products with stock, deepest shelf first.",
    template: `SELECT p.name, p.stock
FROM products p
JOIN suppliers s ON {1}
WHERE s.name = {2}
ORDER BY p.stock {3};`,
    slots: [
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the join condition",
        why: "products.supplier_id → suppliers.id names the maker. s.id = p.id pairs supplier ids with product ids by coincidence.",
      },
      {
        answer: "'Alpine Audio GmbH'",
        kind: "keyword",
        label: "the vendor literal",
        why: "The vendor is pinned by exact name, quoted. A near-miss silently builds a different vendor's page.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Deepest shelf first: DESC on stock. ASC would open on the quieter of the two shelves.",
      },
    ],
    distractors: ["s.id = p.id", "'Andes Naturals SA'", "ASC"],
    walkthrough:
      "Alpine's page: Desk Mat Extended at 260 units, Studio Desktop Mic at 45 — two products, one vendor call. The pin-by-name keeps the page verifiable against the roster; the id-coincidence join would list whichever products share ids with supplier ids — a phantom page. Vendor pages are the procurement team's unit of work: one literal, one join, one call.",
  },
  {
    id: "cs-552",
    tier: "easy",
    topic: "j1",
    universe: "growth",
    title: "Seoul's book, counted",
    brief:
      "From: Head of Growth. Re: the city spotlight, Seoul.\n\nThe city spotlight's Seoul edition: how many orders does the city hold? Join orders to their buyers, pin the city. Fourteen expected — Grace Kim's whole book.",
    ask: "Count of orders belonging to Seoul's customer.",
    template: `SELECT {1}(o.id) AS seoul_orders
FROM customers c
JOIN orders o ON {2}
WHERE c.city = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A spotlight count: COUNT(o.id). SUM would add order ids — bookkeeping where a headcount belongs.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "'Seoul'",
        kind: "keyword",
        label: "the city literal",
        why: "Cities are stored as written: 'Seoul'. The lowercase 'seoul' matches nothing and the spotlight prints zero.",
      },
    ],
    distractors: ["SUM", "o.id = c.id", "'seoul'"],
    walkthrough:
      "Seoul's spotlight: fourteen orders, all Grace Kim's — the city's entire book in one number. The lowercase 'seoul' distractor is the silent failure the series keeps flagging: zero orders on a page that should read fourteen, no error to catch it. City spotlights run one per market; the literal is the only thing that changes between them, which is exactly why it gets checked.",
  },
  {
    id: "cs-553",
    tier: "easy",
    topic: "j1",
    universe: "expense",
    title: "The open-paper owners, emailed",
    brief:
      "From: Spend analyst. Re: the collections merge, with counts.\n\nThe collections merge input: open-invoice owners with email addresses and their open-invoice counts, alphabetical by email so the merge template eats it directly. Six rows expected.",
    ask: "Open-invoice owners: email and count, alphabetical by email.",
    template: `SELECT c.email, {1}(i.id) AS open_invoices
FROM customers c
JOIN invoices i ON {2}
WHERE i.status = {3}
GROUP BY c.id
ORDER BY c.email;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the count column",
        why: "The merge template carries a count: COUNT(i.id). SUM(i.id) would add invoice ids — bookkeeping in a count column.",
      },
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real ownership thread: invoices.customer_id → customers.id. i.number = c.email compares invoice codes to inboxes.",
      },
      {
        answer: "'open'",
        kind: "keyword",
        label: "the status literal",
        why: "The merge targets 'open' paper — quoted text. 'paid' would merge settlement notices to the wrong six people.",
      },
    ],
    distractors: ["SUM", "i.number = c.email", "'paid'"],
    walkthrough:
      "The merge input: six owners, one open invoice each, keyed by email — alice.chen@, bella.rossi@, chloe.dubois@, emma.wilson@, liam.obrien@, pedro.alv@ — ready for the template. The email column makes the join's purpose concrete: billing knows the paper, only the customer table knows the inbox. The i.number-to-email distractor compares invoice codes to inboxes — zero matches, an empty merge, six invoices nobody chases this week.",
  },
  {
    id: "cs-554",
    tier: "hard",
    topic: "j1",
    universe: "fraud",
    title: "The dormant-flag ledger",
    brief:
      "From: Fraud spot-check desk. Re: the flagged accounts' full books.\n\nThe desk's dormant ledger: every order belonging to an inactive-flagged account — buyer, order id, status — filed by buyer then order. Six orders across two flags; the ledger shows what 'dormant' actually looks like.",
    ask: "All orders of inactive customers: buyer, order id and status, by buyer then order.",
    template: `SELECT c.name, o.id, o.status
FROM customers c
JOIN orders o ON {1}
WHERE c.active = {2}
ORDER BY c.name, o.{3};`,
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
        why: "The flagged accounts carry active = 0. At 1 the ledger lists ninety-seven healthy orders under a dormant header.",
        noVerify: true,
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the within-buyer sort",
        why: "Within each buyer, orders file by id: o.id. o.status would group by claim instead of filing chronologically by creation.",
      },
    ],
    distractors: ["o.id = c.id", "1", "status"],
    walkthrough:
      "The dormant ledger: six orders under two flags — Dmitri Volkov's 2 and Keiko Sato's 4, filed buyer-then-order. The statuses tell the real story: Keiko's book includes live pipeline, which is why the flag reads as stale. The active=1 distractor would list nearly the whole book under a dormant header — the exact inversion that erodes trust in flag reports. Flag audits file per account, in creation order, so the pattern is walkable.",
  },
  {
    id: "cs-555",
    tier: "easy",
    topic: "j2",
    universe: "inventory",
    title: "The headset's transacted ladder",
    brief:
      "From: Inventory control. Re: the premium line's price ladder.\n\nThe premium line's realized ladder: every transacted unit price for the Noise-Canceling Headset, cheapest first. The catalog says 149.99 — the ladder says what the street actually paid.",
    ask: "All transacted unit prices for the Noise-Canceling Headset, cheapest first.",
    template: `SELECT oi.unit_price, oi.quantity
FROM order_items oi
JOIN products p ON {1}
WHERE p.name = {2}
ORDER BY oi.unit_price {3};`,
    slots: [
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.product_id → products.id finds the headset's lines. p.id = oi.order_id pairs catalog ids with order numbers.",
      },
      {
        answer: "'Noise-Canceling Headset'",
        kind: "keyword",
        label: "the product literal",
        why: "The exact catalog name, quoted. A near-miss ladders a different product's transacts.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the ladder direction",
        why: "'Cheapest first' is ascending on the transacted price. DESC would lead with the premium transacts.",
      },
    ],
    distractors: ["p.id = oi.order_id", "'Studio Desktop Mic'", "DESC"],
    walkthrough:
      "The headset's realized ladder: the transacted prices across its 46-unit book, cheapest first, quantities alongside. The ladder's story sits in the comparison — list 149.99 versus what the lines actually paid — and the quantity column shows whether discounts ride big baskets. The mic pin would ladder a different premium product's transacts; the order_id join would ladder coincidences. Premium pricing debates run on ladders like this one.",
  },
  {
    id: "cs-556",
    tier: "easy",
    topic: "j2",
    universe: "funnel",
    title: "The delivered book, by buyer",
    brief:
      "From: Marketing lead. Re: the landed-book census.\n\nThe landed-book census: customers holding at least one DELIVERED order, with counts — the status pin outside the ON (an inner join does the slicing), biggest book first. Every account qualifies on this book.",
    ask: "Customers with delivered orders: name and count, biggest first.",
    template: `SELECT c.name, {1}(o.id) AS delivered
FROM customers c
JOIN orders o ON {2}
WHERE o.status = {3}
GROUP BY c.id
ORDER BY delivered {4}, c.name;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the book counter",
        why: "Delivered volume is a count: COUNT(o.id). SUM would add order ids — bookkeeping where a headcount belongs.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the landed literal",
        why: "The census slices to 'delivered' — quoted text. 'cancelled' would census the unwind's books instead.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest landed book leads: DESC then name.",
      },
    ],
    distractors: ["SUM", "o.id = c.id", "'cancelled'", "ASC"],
    walkthrough:
      "The landed census: all sixteen customers hold at least one delivered order — Alice's 24-order book leading the page down to the single-delivery accounts. The inner join does the slicing here because there's nothing to preserve: every account HAS landed paper, so the zero-bucket question doesn't arise (compare the pending edition, where it does). The 'cancelled' pin would census friction under a landed header — four names where sixteen belong.",
  },
  {
    id: "cs-557",
    tier: "medium",
    topic: "j2",
    universe: "pricing",
    title: "The card rail's average ladder",
    brief:
      "From: Pricing committee. Re: the card rail, by invoice size.\n\nThe card rail's average ladder: per invoice status, the average CARD payment in units. The rail's behavior by claim — the surcharge model's third input, after the method split and the size gap.",
    ask: "Average card payment (÷ 100) per invoice status, richest average first.",
    template: `SELECT i.status, ROUND({1}(p.amount_cents) / 100.0, 2) AS avg_card
FROM payments p
JOIN invoices i ON {2}
WHERE p.method = {3}
GROUP BY i.status
ORDER BY avg_card {4};`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean aggregate",
        why: "An average ladder needs the mean: AVG(p.amount_cents). SUM would report the rail's whole book per claim.",
      },
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id ties cash to recognized paper. Matching p.invoice_id to i.number compares a number to text.",
      },
      {
        answer: "'card'",
        kind: "keyword",
        label: "the rail literal",
        why: "The audited rail is 'card' — quoted text. 'wire' would ladder the other rail's averages.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The richest average leads the ladder — the claim bucket with the biggest card tickets heads the model's input page.",
      },
    ],
    distractors: ["SUM", "p.invoice_id = i.number", "'wire'", "ASC"],
    walkthrough:
      "The card rail's claim ladder: average card payment bucketed by what the invoice claims — the model's read on whether card swipes skew toward settled or open paper. The AVG is the input the model consumes; the SUM distractor would print the rail's channel totals per claim wearing an average's name. The 'wire' pin ladders the other rail — a real ladder for the wrong input file.",
  },
  {
    id: "cs-558",
    tier: "medium",
    topic: "j2",
    universe: "supplier",
    title: "Shenzhen's money mix",
    brief:
      "From: Supplier audit. Re: the APAC leader's money page.\n\nThe money page for Shenzhen Electro: realized revenue per product through the chain, pinned by name, biggest book first. The mouse's volume against the ring light's and socks' — the negotiation slide's money column.",
    ask: "Realized revenue per product for Shenzhen Electro, biggest first.",
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
        why: "products.supplier_id → suppliers.id attaches the vendor. s.region = p.category compares 'APAC' to 'Electronics'.",
      },
      {
        answer: "'Shenzhen Electro'",
        kind: "keyword",
        label: "the vendor literal",
        why: "The vendor pinned by exact name, quoted. A near-miss builds a different vendor's money page.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest money product leads the page — the negotiation slide opens on the SKU that earns the most, not the one that ships the most.",
      },
    ],
    distractors: ["p.id = oi.order_id", "s.region = p.category", "'Pacific Textiles'", "ASC"],
    walkthrough:
      "Shenzhen's money page: the three products' realized revenue sorted down — the volume story (99 units, second-most in the book) meeting its money column. The realized expression keeps the page reconcilable to the 34,833.28 book; list prices would drift it product by product. The Pacific pin would page a different APAC vendor's mix under Shenzhen's header — true revenue, wrong negotiation.",
  },
  {
    id: "cs-559",
    tier: "medium",
    topic: "j2",
    universe: "month-close",
    title: "The delivered census, city edition",
    brief:
      "From: Financial Controller. Re: the landed book's city map.\n\nThe landed book's city map: delivered orders joined to their buyers' cities, counted per city, biggest first, top three. The one-customer-per-city rule makes the map a buyer ranking — the footnote says so.",
    ask: "Top 3 cities by delivered order count.",
    template: `SELECT c.city, {1}(o.id) AS delivered
FROM customers c
JOIN orders o ON {2}
WHERE o.status = {3}
GROUP BY c.city
ORDER BY delivered {4}
LIMIT {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the landed counter",
        why: "Delivered volume is a count: COUNT(o.id). SUM(o.id) would add order ids — bookkeeping in a count column.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the landed literal",
        why: "The map slices to 'delivered' — quoted text. 'pending' would map the pipeline's geography instead.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest landed book leads the map — the city whose buyer landed the most orders heads the fulfillment page.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the city cap",
        why: "The map carries three cities: LIMIT 3. At 16 it lists every city.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "o.id = c.id", "'pending'", "ASC", "16"],
    walkthrough:
      "The landed city map: Berlin, Austin and Seoul leading the delivered counts — Alice's, Emma's and Grace's landed books wearing city labels. The delivered slice (52 of 103 orders) is the map's population; the pending edition maps a different 14. The 'pending' pin under this header would map money-in-limbo as landed — the exact swap that makes fulfillment dashboards lie. City maps get their slice checked against the header, every print.",
  },
  {
    id: "cs-560",
    tier: "medium",
    topic: "j2",
    universe: "inventory",
    title: "The cancelled baskets, listed",
    brief:
      "From: Inventory control. Re: the unwind's basket list.\n\nThe unwind's basket list: each cancelled order with its buyer, through the real join — filed by buyer then order. Seven rows: the whole cancellation paper trail, named.",
    ask: "All cancelled orders with their buyers, by buyer then order id.",
    template: `SELECT c.name, o.id
FROM customers c
JOIN orders o ON {1}
WHERE o.status = {2}
ORDER BY c.name, o.{3};`,
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
        why: "The list slices to 'cancelled' — quoted text. 'pending' would list the pipeline's fourteen under an unwind header.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the within-buyer sort",
        why: "Within each buyer, orders file by id — creation order, so the desk walks each account's cancellations chronologically.",
      },
    ],
    distractors: ["o.id = c.id", "'pending'", "total"],
    walkthrough:
      "The unwind's basket list: seven cancelled orders across four buyers — Alice ×3, Farid ×2, Emma, Maya — filed per buyer in creation order. The list is the shrink review's walk sheet: each row is a basket that was picked, priced and unwound. The 'pending' pin would list the pipeline under an unwind header; the total-sort would order by size where the desk asked for chronology. Walk sheets sort by time; leaderboards sort by size.",
  },
  {
    id: "cs-561",
    tier: "hard",
    topic: "j2",
    universe: "growth",
    title: "The whale's delivered ladder",
    brief:
      "From: Head of Growth. Re: Alice's landed book, ranked.\n\nThe case study's landed ladder: Alice's DELIVERED orders with totals, biggest first, top three. Her 24-order book slices by status; the ladder shows what her landed money actually looks like per basket.",
    ask: "Alice Chen's 3 biggest delivered orders by total.",
    template: `SELECT o.id, o.total
FROM customers c
JOIN orders o ON {1}
WHERE c.name = {2} AND o.status = {3}
ORDER BY o.total {4}
LIMIT {5};`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "'Alice Chen'",
        kind: "keyword",
        label: "the account literal",
        why: "The study pins Alice by name, quoted. Emma's name ladders a different whale under this study's header.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the landed slice",
        why: "The ladder slices to 'delivered' — quoted text. 'pending' would ladder her in-flight baskets instead.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "'Biggest delivered first' is descending on total.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the ladder cap",
        why: "The ladder shows three: LIMIT 3. At 24 it lists her whole book.",
        noVerify: true,
      },
    ],
    distractors: ["o.id = c.id", "'Emma Wilson'", "'pending'", "ASC", "24"],
    walkthrough:
      "The whale's landed ladder: Alice's delivered orders ranked by total, top three — the study's money page, sliced from her 24-order book. Two pins make it THE ladder: the name scopes the account, the status scopes the slice; drop either and the ladder mixes populations (her pending baskets, or Emma's book). The 24-cap distractor defeats the ladder's purpose — a leaderboard that lists everyone isn't one. Case-study ladders get both pins, every edition.",
  },
  {
    id: "cs-562",
    tier: "hard",
    topic: "j2",
    universe: "catalog",
    title: "The category × maker grid",
    brief:
      "From: Catalog ops. Re: the sourcing cross-tab, cell by cell.\n\nThe sourcing cross-tab: product counts per (category, supplier) cell — every maker's bench by department, densest cells first, top six. Nordic's three departments lead or the grid lies.",
    ask: "Top 6 (category, supplier) cells by product count.",
    template: `SELECT p.category, s.name, {1}(*) AS products
FROM products p
JOIN suppliers s ON {2}
GROUP BY p.category, s.id
ORDER BY products {3}
LIMIT {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the cell counter",
        why: "Each cell is a product count: COUNT(*). SUM(*) is invalid over the placeholder.",
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
        why: "The densest cells lead the grid — the vendor with the deepest bench in one department heads the sourcing page.",
      },
      {
        answer: "6",
        kind: "number",
        label: "the grid cap",
        why: "The cross-tab page carries six cells: LIMIT 6. The full grid runs 16 (one per product).",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "s.id = p.id", "16"],
    walkthrough:
      "The sourcing cross-tab: (category, maker) cells counted and ranked — Nordic's keyboard-webcam-watch trio spanning Electronics and Video, Midwest's headset-stand-yoga across three departments. The two-key grouping is the page's craft: one key per axis, counts in the cells, densest first. The 16-cap distractor lists every product as its own cell — a catalog wearing a cross-tab's header. Sourcing grids are how multi-department vendors get spotted for co-negotiation.",
  },
  {
    id: "cs-563",
    tier: "medium",
    topic: "j3",
    universe: "funnel",
    title: "The three-hop buyer census",
    brief:
      "From: Marketing lead. Re: the reach number, done honestly.\n\nThe reach number: DISTINCT customers with at least one DELIVERED order — the chain run to lines and back up to accounts, deduped. Sixteen is the expected value; the DISTINCT is what makes it a buyer count.",
    ask: "Count of DISTINCT customers with at least one delivered order.",
    template: `SELECT {1}(DISTINCT c.id) AS reach
FROM customers c
JOIN orders o ON {2}
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the reach counter",
        why: "Reach is a buyer count: COUNT(DISTINCT c.id). SUM would add customer ids — bookkeeping in a reach metric.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the first join",
        why: "The account thread: orders.customer_id → customers.id. o.id = c.id fabricates a sixteen-row population.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the landed slice",
        why: "Reach means LANDED: 'delivered', quoted. 'pending' would measure in-flight reach instead.",
      },
    ],
    distractors: ["SUM", "o.id = c.id", "'pending'"],
    walkthrough:
      "The reach number: sixteen distinct customers have landed at least one order — the whole book, reached. The chain runs down to lines (so reach means 'delivered something', not just 'ordered'), then dedupes back up to people: a customer with fifty delivered lines counts once. The 'pending' pin would report in-flight reach under a landed header — same shape, different truth. Reach metrics that skip the DISTINCT report lines as people.",
  },
  {
    id: "cs-564",
    tier: "medium",
    topic: "j3",
    universe: "inventory",
    title: "The HDMI basket list",
    brief:
      "From: Inventory control. Re: the traffic product's basket list.\n\nThe traffic product's basket list: every order carrying the HDMI 2.1 Cable, with quantities — two hops, pinned by name, basket order. Thirty-eight units across the page; count the baskets as you walk.",
    ask: "Every order containing the HDMI 2.1 Cable 2m, with line quantity, in order-id order.",
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
        why: "order_items.product_id → products.id finds the cable's lines. p.id = oi.order_id pairs catalog ids with order numbers.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the order hop",
        why: "order_items.order_id → orders.id names the basket. oi.id = o.id pairs line numbers with order numbers.",
      },
      {
        answer: "'HDMI 2.1 Cable 2m'",
        kind: "keyword",
        label: "the product literal",
        why: "The exact catalog name, quoted. A near-miss lists a different product's baskets under this header.",
      },
    ],
    distractors: ["p.id = oi.order_id", "oi.id = o.id", "'Desk Mat Extended'"],
    walkthrough:
      "The cable's basket list: every HDMI-carrying order in id order, quantities beside — the walk sheet for the book's busiest accessory. Both hops real: catalog to find the lines, orders to name the baskets; the desk-mat pin would walk a different hero's 24 baskets under this header. Traffic-product lists get reprinted every cycle — the shape never changes, only the literal.",
  },
  {
    id: "cs-565",
    tier: "easy",
    topic: "j3",
    universe: "supplier",
    title: "The maker's units page",
    brief:
      "From: Supplier audit. Re: Alpine's units, product by product.\n\nAlpine's units page: SUM(quantity) per product through the chain, pinned to Alpine by name. The mic and the desk mat's volumes side by side — the page that pairs with the vendor work census.",
    ask: "Units sold per product for Alpine Audio GmbH, biggest first.",
    template: `SELECT p.name, SUM(oi.quantity) AS units
FROM order_items oi
JOIN products p ON {1}
JOIN suppliers s ON {2}
WHERE s.name = {3}
GROUP BY p.id
ORDER BY units {4};`,
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
        why: "products.supplier_id → suppliers.id attaches the vendor. s.region = p.category compares 'EU' to 'Audio'.",
      },
      {
        answer: "'Alpine Audio GmbH'",
        kind: "keyword",
        label: "the vendor literal",
        why: "The vendor pinned by exact name, quoted. A near-miss audits a different bench.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest mover leads the page — the vendor's volume split opens on its hardest-working product.",
      },
    ],
    distractors: ["p.id = oi.order_id", "s.region = p.category", "'Nordic Gadgets AB'", "ASC"],
    walkthrough:
      "Alpine's units page: the desk mat's 47 units against the mic's 30 — 77 total, the region board's Alpine line decomposed. The units grain pairs with the lines census: a vendor can move many boxes on few transactions or few boxes on many — Alpine's page shows which. The Nordic pin would page 82 units under Alpine's header — a true board row for the wrong vendor. Vendor pages get their literals from the roster, every audit.",
  },
  {
    id: "cs-566",
    tier: "hard",
    topic: "j3",
    universe: "month-close",
    title: "The exposure grid, region × status",
    brief:
      "From: Financial Controller. Re: the close's exposure cross-tab.\n\nThe exposure cross-tab: order money per (region, status) cell — four regions by four statuses, biggest cells first, top six. The grid's pending column must reconcile to the 6,113.00 pipeline; the cancelled column to the unwind.",
    ask: "Top 6 (region, status) cells by order money (Σ o.total, rounded).",
    template: `SELECT c.region, o.status, ROUND(SUM(o.total), 2) AS exposure
FROM customers c
JOIN orders o ON {1}
GROUP BY c.region, o.status
ORDER BY exposure {2}
LIMIT {3};`,
    slots: [
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
        why: "The biggest cells lead the cross-tab — the close's exposure page opens on the region-status cell carrying the most money.",
      },
      {
        answer: "6",
        kind: "number",
        label: "the grid cap",
        why: "The close's page carries six cells: LIMIT 6. The full grid runs up to sixteen (some region-status cells are empty).",
        noVerify: true,
      },
    ],
    distractors: ["o.id = c.id", "ASC", "16"],
    walkthrough:
      "The exposure cross-tab: region-by-status money cells ranked — the delivered book's EU and APAC cells leading, the pending column's cells reconciling to the 6,113.00 pipeline, the cancelled column to the unwind's 1,252.49. One query, two axes, every close number in its cell. The id-coincidence join would fill the grid from sixteen fabricated pairs; the ASC variant opens on the smallest cell and buries the headline. Cross-tabs are the close's Swiss Army knife — this one earns its page.",
  },
  {
    id: "cs-567",
    tier: "hard",
    topic: "j3",
    universe: "fraud",
    title: "The unwind's regional money",
    brief:
      "From: Fraud spot-check desk. Re: the shrink map, money grain.\n\nThe shrink map at the money grain: cancelled order totals per region — three rows (LATAM absent, again), biggest exposure first. The map pairs with the count edition: EU leads counts, but the money ranking is the budget's input.",
    ask: "Cancelled money (Σ cancelled totals) per region, biggest first.",
    template: `SELECT c.region, ROUND(SUM(o.total), 2) AS exposure
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
        why: "The shrink map slices to 'cancelled' — quoted text. 'delivered' would map the landed book as shrink.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest exposure leads the shrink map — the budget conversation starts at the region carrying the most cancelled money.",
      },
    ],
    distractors: ["o.id = c.id", "'delivered'", "ASC"],
    walkthrough:
      "The shrink map, money grain: APAC 513.81, EU 494.82, US 143.86 — and LATAM's absence again by construction (Bruno has never cancelled). The money ranking disagrees with the count ranking (EU has more cancellation ORDERS), which is the map's whole lesson: budgets follow money, and money needs its own query. The 'delivered' pin would map 34,000-odd of landed book as shrink — a true sum for a catastrophic mislabel.",
  },
  {
    id: "cs-568",
    tier: "easy",
    topic: "j4",
    universe: "expense",
    title: "The twice-paid, with money",
    brief:
      "From: Spend analyst. Re: the recovery page's money column.\n\nThe recovery page's money column: the twice-paid invoices with their TOTAL collected cash — the inner join counting matches, HAVING at two, biggest total first. Five rows, 24,940.00 — the page the recovery team works from.",
    ask: "Invoices with 2+ payments: number and total cash (Σ ÷ 100), biggest first.",
    template: `SELECT i.number, ROUND(SUM(p.amount_cents) / 100.0, 2) AS total
FROM invoices i
JOIN payments p ON {1}
GROUP BY i.id
{2} COUNT(p.id) >= 2
ORDER BY total {3};`,
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
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest double-settlement leads: DESC.",
      },
    ],
    distractors: ["SUM", "WHERE", "p.missing"],
    walkthrough:
      "The recovery page's money column: the five doubles with their totals — INV-2024-019 at 5,614.00 leading, the page summing to 24,940.00 collected twice. The inner join counts matches by definition; the HAVING keeps the doubles and files the page by size. The WHERE distractor can't see the count; the ASC variant opens on the smallest recovery — a page that starts at the bottom and calls it the top.",
  },
  {
    id: "cs-569",
    tier: "easy",
    topic: "j4",
    universe: "refund-audit",
    title: "The unpaid six, with owners",
    brief:
      "From: Refunds desk. Re: the collections page, final form.\n\nThe collections page, final form: the six unpaid invoices with owner emails — the anti-payment join extended to the inbox. Alphabetical by email; the merge is ready when the page is.",
    ask: "The six unpaid invoices with owner emails, alphabetical by email.",
    template: `SELECT i.number, c.email
FROM invoices i
LEFT JOIN payments p ON {1}
JOIN customers c ON i.customer_id = c.id
WHERE p.id IS {2}
ORDER BY {3};`,
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
        why: "'Unpaid' is p.id IS NULL on the preserved rows. IS NOT NULL emails the twenty-one settled accounts.",
      },
      {
        answer: "c.email",
        kind: "keyword",
        label: "the merge sort",
        why: "The merge keys on the inbox: alphabetical by c.email. Sorting by i.due_on would age the page where the merge template expects names-by-inbox.",
      },
    ],
    distractors: ["p.invoice_id = i.number", "NOT", "ASC"],
    walkthrough:
      "The collections page, final form: six invoice numbers beside six inboxes, alphabetical — the merge runs the moment the page renders. The mixed join types carry the craft: LEFT toward payments (where the hole lives), INNER toward customers (where the inbox lives). The NOT flip would email twenty-one settlement confirmations as collections — a real page, a catastrophic send.",
  },
  {
    id: "cs-570",
    tier: "easy",
    topic: "j4",
    universe: "month-close",
    title: "The quiet eight, with emails",
    brief:
      "From: Financial Controller. Re: the quiet list, contactable.\n\nThe quiet list, contactable: the eight accounts with NO pending orders, with their emails — the anti-pending join extended to the inbox. The no-pipeline cohort, ready for the check-in campaign.",
    ask: "Customers with zero pending orders: name and email, alphabetical by name.",
    template: `SELECT c.name, c.email
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
        answer: "'pending'",
        kind: "keyword",
        label: "the in-flight literal",
        why: "'Quiet' means no PENDING orders — quoted text inside the ON so the quiet survive as NULL rows.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'No pending' is o.id IS NULL on the preserved rows. IS NOT NULL lists the eight holders instead.",
      },
    ],
    distractors: ["o.id = c.id", "'shipped'", "NOT"],
    walkthrough:
      "The quiet list, contactable: eight names beside eight inboxes — Bruno, Dmitri, Hiro, Isabella, Jamal, Liam, Noah, Olivia — the check-in campaign's recipients. The filter-inside-ON placement is what keeps the eight countable and contactable; a WHERE-placed filter deletes them before the page renders. The 'shipped' pin would list accounts with no dispatch history — a bigger quiet under this campaign's header.",
  },
  {
    id: "cs-571",
    tier: "medium",
    topic: "j4",
    universe: "funnel",
    title: "Dispatch counts per buyer",
    brief:
      "From: Marketing lead. Re: the dispatch census, holder-gated.\n\nThe dispatch census: customers holding at least one SHIPPED order, with counts — the status pin in the WHERE (an inner join slices), biggest dispatch book first. The in-transit half of the fulfillment story.",
    ask: "Customers with shipped orders: name and count, biggest first.",
    template: `SELECT c.name, {1}(o.id) AS shipped
FROM customers c
JOIN orders o ON {2}
WHERE o.status = {3}
GROUP BY c.id
ORDER BY shipped {4}, c.name;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the dispatch counter",
        why: "Dispatch volume is a count: COUNT(o.id). SUM would add order ids — bookkeeping in a dispatch column.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the in-transit literal",
        why: "The census slices to 'shipped' — quoted text. 'delivered' would census the landed book; 'pending' the pipeline.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest dispatch book leads: DESC then name.",
      },
    ],
    distractors: ["SUM", "o.id = c.id", "'delivered'", "ASC"],
    walkthrough:
      "The dispatch census: thirty shipped orders across their holders, biggest book first — the in-transit half of the fulfillment story between the landed census (52) and the pipeline census (14). The three censuses share one shape and differ only in the literal — which is why the literal gets its own slot: 'delivered' under this header would census the landed book as in-transit, off by twenty-two orders on a page the ops team plans trucks from.",
  },
  {
    id: "cs-572",
    tier: "medium",
    topic: "j4",
    universe: "supplier",
    title: "The vendor shelf page, preserved",
    brief:
      "From: Supplier audit. Re: the shelf page that can't lose a vendor.\n\nThe shelf page, preserved: every vendor with their total shelf value — the LEFT join so a delisted vendor shows at NULL rather than vanishing, biggest value first. The capital memo's vendor universe, complete.",
    ask: "Total shelf value (Σ price × stock) per supplier, biggest first.",
    template: `SELECT s.name, ROUND(SUM(p.price * p.stock), 2) AS shelf_value
FROM suppliers s
{1} products p ON {2}
GROUP BY s.id
ORDER BY shelf_value {3};`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "The memo's vendor universe is all suppliers — LEFT JOIN keeps a future zero-product vendor visible as a NULL row.",
      },
      {
        answer: "p.supplier_id = s.id",
        kind: "keyword",
        label: "the join condition",
        why: "products.supplier_id → suppliers.id is the ownership thread. p.supplier_id = s.region compares numbers to text.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The heaviest parked capital leads: DESC.",
      },
    ],
    distractors: ["UNION", "p.supplier_id = s.region", "ASC"],
    walkthrough:
      "The preserved shelf page: six vendors, Nordic's 27,828.40 leading down to Alpine's 11,852.40 — the capital memo's complete vendor universe. The LEFT is the page's promise: no vendor disappears because their products did; the NULL row IS the finding. The region=text join can't even start; the ASC variant leads the memo with the leanest shelf. Capital pages preserve first, rank second.",
  },
  {
    id: "cs-573",
    tier: "hard",
    topic: "j4",
    universe: "refund-audit",
    title: "The aging view, with claims",
    brief:
      "From: Refunds desk. Re: the aging page, claims attached.\n\nThe aging page, claims attached: the six unpaid invoices with due dates AND ledger status, filed by due date. Five 'open' claims and one 'paid' — the page where the anomaly ages alongside honest receivables.",
    ask: "The six unpaid invoices: number, due date and status, oldest obligation first.",
    template: `SELECT i.number, i.due_on, i.status
FROM invoices i
LEFT JOIN payments p ON {1}
WHERE p.id IS {2}
ORDER BY i.{3};`,
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
        why: "'Unpaid' is p.id IS NULL on the preserved rows. IS NOT NULL ages the twenty-one settled invoices.",
      },
      {
        answer: "due_on",
        kind: "keyword",
        label: "the aging column",
        why: "Aging sorts by the obligation date: i.due_on. Sorting by i.status would group by claim instead of filing by promise.",
      },
    ],
    distractors: ["p.invoice_id = i.number", "NOT", "status"],
    walkthrough:
      "The aging page with claims: six obligations filed by due date, each carrying its ledger status — five honest 'open' rows and the one 'paid' claim aging alongside them. The status column is the page's audit hook: the anomaly can't hide in an aging view that shows what the ledger claims next to what the cash table holds. The status-sort distractor files by claim instead of promise — the anomaly groups first, but the aging order the collections team works by disappears.",
  },
  {
    id: "cs-574",
    tier: "hard",
    topic: "j4",
    universe: "month-close",
    title: "The exposure ledger with lines",
    brief:
      "From: Financial Controller. Re: the pipeline ledger, money column added.\n\nThe pipeline ledger, complete: per holder, pending order count, joined line count AND exposure money — the filter inside the ON, zeros excluded explicitly, biggest money first. Three grains, eight rows, one reconciliation.",
    ask: "Per holder: pending orders, joined lines, and exposure money, biggest money first.",
    template: `SELECT c.name, COUNT(o.id) AS orders, COUNT(oi.id) AS lines, ROUND(SUM(o.total), 2) AS exposure
FROM customers c
LEFT JOIN orders o ON {1} AND o.status = {2}
LEFT JOIN order_items oi ON oi.order_id = o.id
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
        label: "the in-flight literal",
        why: "The ledger tracks 'pending' — quoted text inside the ON so the quiet accounts survive as NULL rows the gate excludes.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the holder gate",
        why: "COUNT(o.id) >= 1 drops the zero buckets explicitly — the ledger's eight rows claim their denominator.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest exposure leads the complete ledger — the holder owing the most in-flight money heads the close's page.",
      },
    ],
    distractors: ["o.id = c.id", "'delivered'", "WHERE", "ASC"],
    walkthrough:
      "The complete pipeline ledger: eight holders carrying counts, lines and money — three grains over two preserved joins, summing to the 6,113.00 the close signs. The money column rides the order row (honest per order); the line column rides the second LEFT (zero-safe); the HAVING excludes the quiet eight on the record. The 'delivered' pin would ledger the dispatch book under a pipeline header — three honest columns, wrong slice. This is the module's ledger pattern at full size.",
  },
  {
    id: "cs-575",
    tier: "easy",
    topic: "j5",
    universe: "catalog",
    title: "Unbilled by region, tile edition",
    brief:
      "From: Catalog ops. Re: the coverage tiles, all four.\n\nThe coverage tiles, all four regions: never-invoiced accounts per region, buckets the dashboard renders directly. EU 2, APAC 2, LATAM 1 — and US absent, fully billed. The absent tile is the good news tile.",
    ask: "Count of never-invoiced customers per region, alphabetical by region.",
    template: `SELECT c.region, {1}(*) AS unbilled
FROM customers c
LEFT JOIN invoices i ON {2}
WHERE i.id IS {3}
GROUP BY c.region
ORDER BY c.region;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tile counter",
        why: "Tiles are counts: COUNT(*). SUM(*) is invalid over the placeholder.",
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
        why: "'Never invoiced' is i.id IS NULL. IS NOT NULL tiles the billed eleven per region — the complement set.",
      },
    ],
    distractors: ["SUM", "i.number = c.name", "NOT"],
    walkthrough:
      "The tile set: EU 2 (Dmitri, Noah), APAC 2 (Farid, Keiko), LATAM 1 (Bruno — the region's whole market), and US absent because Jamal and Emma are both billed. Three tiles render, one stays empty, and the empty tile is the good news. The anti-join feeds all four tiles from one query; the IS NULL test is what keeps the buckets honest. Regional coverage at a glance — holes and clean markets in the same grid.",
  },
  {
    id: "cs-576",
    tier: "easy",
    topic: "j5",
    universe: "expense",
    title: "The unpaid census by claim, filed",
    brief:
      "From: Spend analyst. Re: the anomaly census, filed by claim.\n\nThe anomaly census, filed: zero-payment invoices bucketed by the ledger's claim, ascending so the smallest bucket — the anomaly's — leads the page. One row claiming 'paid' with no cash is the finding.",
    ask: "Count of zero-payment invoices per status, smallest bucket first.",
    template: `SELECT i.status, {1}(*) AS unpaid
FROM invoices i
LEFT JOIN payments p ON {2}
WHERE p.id IS {3}
GROUP BY i.status
ORDER BY unpaid {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the census counter",
        why: "A census is a count: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the cash join",
        why: "payments.invoice_id → invoices.id is the cash thread. Matching p.invoice_id to i.number compares a number to text.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'No payment' is p.id IS NULL on the preserved rows. IS NOT NULL censuses the twenty-one settled invoices.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the exception-first sort",
        why: "Smallest bucket first: the anomaly's 1-row group leads, where a human reads it. DESC would bury it under the five.",
      },
    ],
    distractors: ["SUM", "JOIN", "NOT", "DESC"],
    walkthrough:
      "The filed census: 'open' holding five unpaid invoices, 'paid' holding one — the smallest bucket leading the page by design. The sort direction IS the audit's attention management: ascending puts the exception on line one; descending files it under the expected. The INNER JOIN variant censuses nothing — six invoices, zero buckets, no finding. Anomaly hunts sort small-first; that's the whole craft.",
  },
  {
    id: "cs-577",
    tier: "easy",
    topic: "j5",
    universe: "growth",
    title: "The billed-cities ladder",
    brief:
      "From: Head of Growth. Re: the coverage ladder, city grain.\n\nThe coverage ladder, city grain: billed money per city through the ownership join — top three. Berlin's 26,629.00 crowns the ladder; the footnote reminds the deck that every city is one customer.",
    ask: "Top 3 cities by billed money (Σ invoice amounts ÷ 100).",
    template: `SELECT c.city, ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed
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
        why: "The real ownership thread: invoices.customer_id → customers.id. i.number = c.name compares codes to people.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The richest billed city crowns the ladder: DESC.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the ladder cap",
        why: "The ladder shows three: LIMIT 3. At 11 it lists every billed city.",
        noVerify: true,
      },
    ],
    distractors: ["i.number = c.name", "ASC", "11"],
    walkthrough:
      "The coverage ladder: Berlin 26,629.00, Austin 13,384.00, Mumbai 11,542.00 — Alice's, Emma's and Maya's billing relationships wearing city labels. The ladder's money column sums per city through the real ownership join; the one-per-city footnote is what stops the deck reading the map as a market story. The name=text distractor zeroes the ladder; the ASC variant crowns Pedro's 873.00 — a coverage page that leads with its thinnest coverage.",
  },
  {
    id: "cs-578",
    tier: "medium",
    topic: "j5",
    universe: "fraud",
    title: "The dark cohort, named",
    brief:
      "From: Fraud spot-check desk. Re: the double-gap list, named edition.\n\nThe double-gap list, named: the customers with no invoices AND no pending orders — both preserving joins, both emptiness tests, names out, alphabetical. Three names; the desk watches each.",
    ask: "Customers with zero invoices AND zero pending orders: names, alphabetical.",
    template: `SELECT c.name
FROM customers c
LEFT JOIN invoices i ON i.customer_id = c.id
{1} orders o ON {2} AND o.status = {3}
WHERE i.id IS {4} AND o.id IS NULL
ORDER BY c.name;`,
    slots: [
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
        why: "The real account thread for the pipeline check: orders.customer_id → customers.id. o.id = c.id pairs order numbers with customer ids.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the in-flight literal",
        why: "'Dark' means no PENDING business — quoted text inside the ON. 'shipped' would hunt no-dispatch accounts: a bigger, different cohort.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'No pending' is o.id IS NULL on the preserved rows (the invoice test is hardcoded). IS NOT NULL lists the holders.",
      },
    ],
    distractors: ["INNER", "o.id = c.id", "'shipped'", "NOT"],
    walkthrough:
      "The dark cohort, named: Bruno Silva, Dmitri Volkov, Noah Meyer — no invoices ever, no pending orders now. The named edition pairs with the count tile: the dashboard proves the three every run, this page names them for the watch file. INNER at hop two deletes the finding before the WHERE sees it; the 'shipped' pin redefines darkness to no-dispatch — a bigger cohort under the same header. Watch files need names; counts alone don't watch back.",
  },
  {
    id: "cs-579",
    tier: "medium",
    topic: "j5",
    universe: "supplier",
    title: "The unpaid, exposure-ordered",
    brief:
      "From: Supplier audit. Re: the collections page, money-ordered.\n\nThe collections page, money-ordered: the six unpaid invoices with owners and owed amounts, biggest balance first. Emma's 4,937.00 leads; the page's total is the 15,217.00 the memo quotes.",
    ask: "The six unpaid invoices: number, owner and owed amount, biggest first.",
    template: `SELECT i.number, c.name, ROUND(i.amount_cents / 100.0, 2) AS owed
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
        why: "'Unpaid' is p.id IS NULL on the preserved rows. IS NOT NULL orders the twenty-one settled invoices by size.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest balance leads: DESC on owed.",
      },
    ],
    distractors: ["p.invoice_id = i.number", "NOT", "ASC"],
    walkthrough:
      "The collections page, money-ordered: 4,937.00 (Emma), 3,562.00 (Liam), 2,794.00 (Isabella), 1,756.00 (Hiro), 1,295.00 (Chloe), 873.00 (Pedro) — 15,217.00 across six names, biggest first. The page's three columns answer the three call questions: which invoice, whose inbox, how much. The NOT flip would order the twenty-one settled invoices by size — a collections page for money already collected. Mixed join types, deliberate: LEFT to the hole, INNER to the name.",
  },
  {
    id: "cs-580",
    tier: "hard",
    topic: "j5",
    universe: "inventory",
    title: "The coverage tile, both halves",
    brief:
      "From: Inventory control. Re: the KPI tile, numerator and denominator in one row.\n\nThe KPI tile, both halves in one row: matched payment count over total invoice count — the LEFT join creating the asymmetry the ratio lives in. 27 over 28; the six-point gap has six named reasons.",
    ask: "One row: matched payment count and total invoice count.",
    template: `SELECT {1}(p.id) AS matched, COUNT(i.id) AS invoices
FROM invoices i
{2} payments p ON {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the numerator counter",
        why: "COUNT(p.id) skips the NULL-filled unpaid rows — the matched count. SUM(p.id) adds payment ids.",
      },
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the asymmetric join",
        why: "LEFT JOIN is what makes the two counts differ: 27 matched over 28 total. INNER collapses both to 27 and the gap disappears.",
      },
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id is the cash thread. Matching p.invoice_id to i.number compares a number to text.",
      },
    ],
    distractors: ["SUM", "JOIN", "p.invoice_id = i.number"],
    walkthrough:
      "The tile's both halves: 27 matched payments over 28 invoices — the numerator and denominator of the 0.96 coverage KPI, computed in one query. The LEFT JOIN is the asymmetry's engine: it keeps the six unpaid as NULL rows that COUNT(p.id) skips and COUNT(i.id) doesn't. Swap to INNER and both counts read 27 — a perfect score over a book with six unpaid invoices. Duplicate-answer discipline note: the two COUNT chips come from the same bank entry once, placed twice — the shape the rebuild surface is built for.",
  },
  {
    id: "cs-581",
    tier: "easy",
    topic: "j6",
    universe: "fraud",
    title: "The APAC pairing pool, named",
    brief:
      "From: Fraud spot-check desk. Re: the pairing pool, named edition.\n\nThe pairing pool, named: every APAC customer pair, both names, alphabetical by the first. Ten pairs from five customers — the pool page behind the regional denominator.",
    ask: "All same-region APAC customer pairs (a.id < b.id), both names, alphabetical.",
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
        why: "Pool-mates share a region: equality across the aliases. a.city = b.city pairs nobody on this book.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the guard operator",
        why: "a.id < b.id: each pair once, self-pairs impossible. <= would add the five APAC self-matches.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the region pin",
        why: "Region codes are uppercase: 'APAC'. The lowercase 'apac' pairs nothing and the page prints empty.",
      },
    ],
    distractors: ["a.city = b.city", "<=", "'apac'"],
    walkthrough:
      "The APAC pool, named: ten pairs from Grace, Hiro, Keiko, Farid and Maya — five choose two, each printed once with both names. The named edition is what the denominator can't be: '10 pairs' files as arithmetic; the names file as the watch list. The <= guard adds five self-pairs (customers listed as their own teammates); the lowercase pin empties the page. Regional pools, named and guarded — the pairing study's working format.",
  },
  {
    id: "cs-582",
    tier: "medium",
    topic: "j6",
    universe: "catalog",
    title: "The watch's shelf-mates",
    brief:
      "From: Catalog ops. Re: the premium sibling pair, named.\n\nThe premium sibling pair: which products share the Smart Watch S's supplier? Nordic's three-product bench forms three pairs — the watch appears in two of them. The page lists the watch's partners.",
    ask: "The products pairing with the Smart Watch S under the same supplier (both names).",
    template: `SELECT p1.name, p2.name
FROM products p1
JOIN products p2 ON {1} AND p1.id {2} p2.id
WHERE p1.name = {3};`,
    slots: [
      {
        answer: "p1.supplier_id = p2.supplier_id",
        kind: "keyword",
        label: "the sibling condition",
        why: "Shelf-mates share a supplier: equality across the aliases. p1.supplier_id = p2.id compares supplier ids to product ids.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the guard operator",
        why: "p1.id < p2.id: each pair once, self-pairs impossible. <= would add the watch's self-match to the page.",
      },
      {
        answer: "'Smart Watch S'",
        kind: "keyword",
        label: "the product pin",
        why: "The census pins Nordic's watch by its exact catalog name, quoted. Pinning the keyboard censuses the same bench from the other pin.",
      },
    ],
    distractors: ["<=", "p1.missing", "p2.missing"],
    walkthrough:
      "The watch's sibling page: two pairs — Smart Watch × Mechanical Keyboard, Smart Watch × 4K Webcam — Nordic's premium bench seen from the watch's pin. Pin the keyboard instead and the same bench yields a different pair set (keyboard-webcam, keyboard-watch): sibling pages are pin-relative, which is why the pin gets its own slot. The <= guard adds the watch 'paired' with itself; the supplier-to-product-id variant compares vendor rows to catalog rows.",
  },
  {
    id: "cs-583",
    tier: "easy",
    topic: "j6",
    universe: "supplier",
    title: "The EU vendor pair",
    brief:
      "From: Supplier audit. Re: the regional pair, Europe edition.\n\nThe regional pairing page, Europe: which two suppliers share the EU? Nordic Gadgets and Alpine Audio — the co-negotiation pair the page exists to name.",
    ask: "The two EU suppliers that share the region (both names).",
    template: `SELECT s1.name, s2.name
FROM suppliers s1
JOIN suppliers s2 ON {1} AND s1.id {2} s2.id
WHERE s1.region = {3};`,
    slots: [
      {
        answer: "s1.region = s2.region",
        kind: "keyword",
        label: "the pairing condition",
        why: "Regional mates share the region: equality across the aliases. s1.name = s2.name would pair a vendor with itself — blocked by the guard, zero rows.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the guard operator",
        why: "s1.id < s2.id: the pair once, self-pairs impossible. <= would add both EU self-matches — three rows where one pair belongs.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region pin",
        why: "Region codes are uppercase: 'EU'. The lowercase 'eu' pairs nothing and the page prints empty.",
      },
    ],
    distractors: ["s1.name = s2.name", "<=", "'eu'"],
    walkthrough:
      "The EU pair, named: Nordic Gadgets AB & Alpine Audio GmbH — the region's entire bench, one pair, one co-negotiation call. The smallest pairing populations are the easiest to verify by hand: two EU vendors, C(2,2) = 1. The self-name distractor pairs a vendor with itself — blocked by the strict guard, zero rows, a page that at least fails honestly. Regional pair pages are small; that's what makes them trustworthy.",
  },
  {
    id: "cs-584",
    tier: "medium",
    topic: "j6",
    universe: "month-close",
    title: "The pairing pools, per supplier bench",
    brief:
      "From: Supplier audit. Re: sibling pools, per vendor.\n\nThe sibling-pool ranking: same-supplier product pairs bucketed per vendor — three-vendor benches pairing three ways, two-product benches once. Six rows, fourteen pairs total; verify the sum by hand.",
    ask: "Same-supplier product pair count per supplier, biggest pool first.",
    template: `SELECT p1.name, {1}(*) AS pairs
FROM products p1
JOIN products p2 ON {2} AND p1.id {3} p2.id
GROUP BY p1.supplier_id
ORDER BY pairs {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the pool counter",
        why: "Pool sizes are pair counts: COUNT(*). SUM(*) errors over the placeholder.",
      },
      {
        answer: "p1.supplier_id = p2.supplier_id",
        kind: "keyword",
        label: "the sibling condition",
        why: "Bench-mates share a supplier: equality across the aliases. p1.supplier_id = p2.id compares vendor ids to catalog ids.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the guard operator",
        why: "p1.id < p2.id: each pair once, self-pairs impossible. <= would add sixteen self-matches across the pools.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest pool leads the ranking — the vendor bench generating the most sibling pairs heads the co-merchandising page.",
      },
    ],
    distractors: ["SUM", "p1.supplier_id = p2.id", "<=", "ASC"],
    walkthrough:
      "The sibling pools: Nordic, Shenzhen, Pacific and Midwest each pooling 3 pairs (three-product benches), Alpine and Andes 1 apiece (two-product benches) — fourteen pairs, hand-verifiable: C(3,2)×4 + C(2,2)×2. The grouping turns the book-wide census into a vendor page: which benches generate co-merchandising opportunities. The <= guard smears sixteen self-matches across the pools; the supplier-to-product-id variant pairs vendor rows with catalog rows — bookkeeping dressed as merchandising.",
  },
  {
    id: "cs-585",
    tier: "medium",
    topic: "j6",
    universe: "funnel",
    title: "The pairing triangle, city edition",
    brief:
      "From: Marketing lead. Re: the city-pool page that proves a negative.\n\nThe city-pool page: same-city customer pairs bucketed per city — expect every pool to read zero, and the empty page to be the finding. Sixteen cities, one customer each: no pool can form.",
    ask: "Same-city customer pair count per city (expect: every pool zero).",
    template: `SELECT a.city, {1}(*) AS pairs
FROM customers a
JOIN customers b ON {2} AND a.id {3} b.id
GROUP BY a.city
ORDER BY pairs {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the pool counter",
        why: "Pool sizes are pair counts: COUNT(*). SUM(*) errors over the placeholder.",
      },
      {
        answer: "a.city = b.city",
        kind: "keyword",
        label: "the pairing condition",
        why: "City-mates share a city: equality across the aliases. a.region = b.region would build the REGION pools (28/10/1) under a city label.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the guard operator",
        why: "a.id < b.id: each pair once, self-pairs impossible. <= would fill every pool with one self-match — sixteen fake pairs.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest pool would lead — and on this book, none exists: the page's emptiness is uniform, the finding complete.",
      },
    ],
    distractors: ["SUM", "a.region = b.region", "<="],
    walkthrough:
      "The city pools: sixteen rows, every pool zero — the page that proves the negative. The one-customer-per-city schema fact means city pools cannot form; the guarded join confirms it in data rather than assertion. The region distractor is the trap the page exists to catch: same query, region column, and the pools fill (28/10/1) under a city header — a clustering claim manufactured by a column swap. Negative results need the same rigor as positive ones; this page is the rigor.",
  },
  {
    id: "cs-586",
    tier: "easy",
    topic: "j7",
    universe: "inventory",
    title: "Stock by supplier, summed",
    brief:
      "From: Inventory control. Re: the shelf-weight ladder.\n\nThe shelf-weight ladder: total stock units per supplier through the ownership join — heaviest shelf first. Shenzhen's 850 tops the page; the ladder shows whose shelves hold the building.",
    ask: "Total stock units per supplier, heaviest shelf first.",
    template: `SELECT s.name, {1}(p.stock) AS shelf
FROM suppliers s
JOIN products p ON {2}
GROUP BY s.id
ORDER BY shelf {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the shelf aggregate",
        why: "Shelf weight is stock summed: SUM(p.stock). COUNT would count products where boxes belong.",
      },
      {
        answer: "p.supplier_id = s.id",
        kind: "keyword",
        label: "the join condition",
        why: "products.supplier_id → suppliers.id attaches the vendor. p.id = s.id pairs product ids with supplier ids.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The heaviest shelf leads: DESC. ASC would open on Nordic's 230-unit premium shelf.",
      },
    ],
    distractors: ["COUNT", "p.id = s.id", "ASC"],
    walkthrough:
      "The shelf-weight ladder: Shenzhen 850, Pacific 695, Midwest 460, Alpine 305, Andes 305, Nordic 230 — the building's boxes by vendor. The SUM-vs-COUNT contrast is the page's spine: Nordic places three products (count) but the lightest shelf (sum) — breadth and weight disagree, and both metrics exist because they answer different questions. The id-coincidence join would weigh six phantom products; the ASC variant opens the count meeting on the leanest vendor.",
  },
  {
    id: "cs-587",
    tier: "easy",
    topic: "j7",
    universe: "funnel",
    title: "Pending units, the pipeline's weight",
    brief:
      "From: Marketing lead. Re: the pipeline's box count.\n\nThe pipeline's box count: total units across PENDING orders' lines — the in-flight weight between the landed 233 and the unwound 20. Real join, status pin, quantity summed.",
    ask: "Total units (Σ quantity) across pending orders' lines.",
    template: `SELECT {1}(oi.quantity) AS units
FROM orders o
JOIN order_items oi ON {2}
WHERE o.status = {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the weight aggregate",
        why: "Boxes are quantity summed: SUM(oi.quantity). COUNT would count lines where weight belongs.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.order_id → orders.id reaches the line grain. oi.id = o.id keeps coincidence lines.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the in-flight literal",
        why: "The weight slices to 'pending' — quoted text. 'shipped' would weigh the in-transit book instead.",
      },
    ],
    distractors: ["COUNT", "oi.id = o.id", "'shipped'"],
    walkthrough:
      "The pipeline's weight: 76 units across 36 lines — the in-flight slice between the delivered book's 233 and the cancelled 20. The three slices reconcile to the book's 498 total units, which is the slide's tie-out. The 'shipped' pin weighs 169 units under a pending header — a true weight for the wrong slice, off by 93 boxes on a capacity plan. Status literals get checked against the enum, every deck.",
  },
  {
    id: "cs-588",
    tier: "medium",
    topic: "j7",
    universe: "catalog",
    title: "Units per maker, product-split",
    brief:
      "From: Catalog ops. Re: Nordic's box page, split by product.\n\nNordic's box page: units sold per product through the chain, pinned to Nordic by name, biggest first. The keyboard's 28, the webcam's 31, the watch's 23 — the vendor's volume, split.",
    ask: "Units sold per product for Nordic Gadgets AB, biggest first.",
    template: `SELECT p.name, SUM(oi.quantity) AS units
FROM order_items oi
JOIN products p ON {1}
JOIN suppliers s ON {2}
WHERE s.name = {3}
GROUP BY p.id
ORDER BY units {4};`,
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
        why: "products.supplier_id → suppliers.id attaches the vendor. s.region = p.category compares 'EU' to 'Video'.",
      },
      {
        answer: "'Nordic Gadgets AB'",
        kind: "keyword",
        label: "the vendor literal",
        why: "The vendor pinned by exact name, quoted. A near-miss splits a different vendor's volume.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest mover leads the split — the product shipping the most of the vendor's boxes heads the volume page.",
      },
    ],
    distractors: ["p.id = oi.order_id", "s.region = p.category", "'Alpine Audio GmbH'", "ASC"],
    walkthrough:
      "Nordic's box page: webcam 31, keyboard 28, watch 23 — 82 units, the EU board's line decomposed. The split matters for the vendor conversation: the webcam quietly outsells the flagship keyboard, a fact the vendor-total page hides. The region=category join zeroes the page silently; the Alpine pin pages 77 units under Nordic's header. Vendor splits are how 'our EU supplier' becomes three specific products on three specific shelves.",
  },
  {
    id: "cs-589",
    tier: "medium",
    topic: "j7",
    universe: "pricing",
    title: "Realized vs list, cable edition",
    brief:
      "From: Pricing committee. Re: the cable's two prices.\n\nThe cable's two prices: transacted unit price beside catalog list, for every HDMI line — the 14.99 list against what the street pays. The ladder's gaps are the price book's honesty check.",
    ask: "Every HDMI line's transacted unit price beside its catalog list price.",
    template: `SELECT oi.unit_price, p.price
FROM order_items oi
JOIN products p ON {1}
WHERE p.name = {2}
ORDER BY oi.unit_price {3};`,
    slots: [
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.product_id → products.id brings list to the line. p.id = oi.order_id pairs catalog ids with order numbers.",
      },
      {
        answer: "'HDMI 2.1 Cable 2m'",
        kind: "keyword",
        label: "the product literal",
        why: "The exact catalog name, quoted. A near-miss ladders a different product's two prices.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the ladder direction",
        why: "'Cheapest first' is ascending on the transacted price. DESC would lead with the premium transacts.",
      },
    ],
    distractors: ["p.id = oi.order_id", "'Yoga Mat Eco 6mm'", "DESC"],
    walkthrough:
      "The cable's two-price ladder: every line's transacted unit price beside the 14.99 list, cheapest first. Where the columns match, the price book holds; where they gap, the street negotiated — and the ladder shows exactly which lines. The yoga-mat pin would ladder 31.02-versus-32.00 rows under the cable's header — a true exhibit for the wrong product. Two-price ladders are the pricing committee's X-ray; the join brings both columns to one row.",
  },
  {
    id: "cs-590",
    tier: "medium",
    topic: "j7",
    universe: "expense",
    title: "The wire rail's payment counts",
    brief:
      "From: Spend analyst. Re: the wire rail, by claim.\n\nThe wire rail by claim: payment COUNT per invoice status for wire transfers only — the rail's transaction rhythm by ledger claim. The COUNT is the point: rails are compared on traffic, not just tonnage.",
    ask: "Payment count per invoice status for wire transfers, biggest first.",
    template: `SELECT i.status, {1}(p.id) AS transfers
FROM payments p
JOIN invoices i ON {2}
WHERE p.method = {3}
GROUP BY i.status
ORDER BY transfers {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the traffic counter",
        why: "Rail traffic is a count: COUNT(p.id). SUM would add payment ids — bookkeeping in a traffic column.",
      },
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
        why: "The audited rail is 'wire' — quoted text. 'card' would count the sixteen-swipe rail under a wire header.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The busiest claim bucket leads the rhythm page — the ledger claim generating the most wire transfers heads the audit.",
      },
    ],
    distractors: ["SUM", "p.invoice_id = i.number", "'card'", "ASC"],
    walkthrough:
      "The wire rail's rhythm: transfer counts bucketed by the invoice's claim — the traffic view that pairs with the money view (32,248.00) to describe the rail completely. The COUNT is the case's spine: rails get compared on traffic as much as tonnage, and the SUM distractor prints tonnage wearing a traffic label. The 'card' pin counts sixteen swipes under a wire header — true traffic, wrong rail.",
  },
  {
    id: "cs-591",
    tier: "hard",
    topic: "j7",
    universe: "growth",
    title: "Emma's depth number, proven",
    brief:
      "From: Head of Growth. Re: Emma's depth, for the deck's second slide.\n\nThe deck's second depth number: Emma Wilson's lines per distinct order — 46 over 17, both guards in place. The slide quotes 2.71; the query re-proves it every run.",
    ask: "Emma Wilson's lines-per-order ratio (COUNT lines × 1.0 ÷ COUNT DISTINCT orders).",
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
        why: "46 ÷ 17 in integer arithmetic floors to 2. ×1.0 keeps 2.71 the ratio the slide quotes.",
        noVerify: true,
      },
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the order dedup",
        why: "COUNT(DISTINCT o.id) counts her 17 orders, not 46 joined rows — ALL reads the ratio as 1.0.",
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
        answer: "'Emma Wilson'",
        kind: "keyword",
        label: "the slide pin",
        why: "The slide pins Emma by name, quoted. Alice's name computes 2.08 under this slide's header.",
      },
    ],
    distractors: ["1", "ALL", "o.id = c.id", "oi.id = o.id", "'Alice Chen'"],
    walkthrough:
      "Emma's depth, proven: 46 lines over 17 distinct orders — 2.71, the deck's second data point in the depth series (Emma 2.71, Grace 2.43, Alice 2.08). Both guards earn their keep: the ×1.0 defeats the integer floor, the DISTINCT defeats the fan-out — drop either and the slide's number changes silently. The name pin scopes the proof; Alice's name re-proves a different slide. Depth numbers are quoted in decks and proven in queries — this is the proven side.",
  },
  {
    id: "cs-592",
    tier: "hard",
    topic: "j7",
    universe: "month-close",
    title: "The close's per-region header",
    brief:
      "From: Financial Controller. Re: the regional header row, all grains.\n\nThe regional header row: per customer region, joined lines, DISTINCT orders, and honest line money — the capstone census regionalized. The four rows reconcile to 251, 103 and 34,833.28; every future regional query answers to them.",
    ask: "Per region: joined lines, DISTINCT orders, and Σ quantity × unit_price.",
    template: `SELECT c.region, COUNT(oi.id) AS lines, COUNT(DISTINCT o.id) AS orders, ROUND(SUM(oi.{1}), 2) AS revenue
FROM customers c
JOIN orders o ON {2}
JOIN order_items oi ON {3}
GROUP BY c.region
ORDER BY revenue {4};`,
    slots: [
      {
        answer: "quantity * unit_price",
        kind: "keyword",
        label: "the honest money expression",
        why: "Regional revenue is line money: quantity × unit_price, summed. o.total over the join would inflate each region by its own line count.",
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
        why: "The line grain arrives via order_items.order_id → orders.id. oi.id = o.id corrupts every column.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The richest region leads the header: DESC.",
      },
    ],
    distractors: ["unit_price", "o.id = c.id", "oi.id = o.id", "ASC"],
    walkthrough:
      "The regional header: EU 105 lines / 45 orders / regional line money, APAC 88 / 37 / …, down to LATAM's 5 / 2 — three grains per region, reconciling book-wide to 251, 103 and 34,833.28. The money expression is the header's spine: o.total over the join would inflate every region by its own line count, and the inflated regional numbers would ship to the board wearing honest aliases. The unit_price-only variant prices every line at one unit — a third of the book. Headers get copied; this one defends itself.",
  },
  {
    id: "cs-593",
    tier: "hard",
    topic: "j7",
    universe: "refund-audit",
    title: "The recovery ledger, filed",
    brief:
      "From: Refunds desk. Re: the recovery ledger, filed by size then count.\n\nThe recovery ledger, filed: the invoices settled two or more times with their payment counts and total cash — biggest cash first. Five rows, 24,940.00 settled twice; the ledger the recovery calls work from.",
    ask: "Invoices with 2+ payments: number, count and total cash (Σ ÷ 100), biggest total first.",
    template: `SELECT i.number, COUNT(p.id) AS payments, ROUND(SUM(p.amount_cents) / 100.0, 2) AS total
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
        why: "The biggest double-settlement leads the filed ledger — the recovery call starts at the invoice holding the most duplicated cash.",
      },
    ],
    distractors: ["SUM", "WHERE", "p.missing"],
    walkthrough:
      "The filed recovery ledger: five invoices at two payments each — INV-2024-001 (4,860.00), INV-2024-005 (5,284.00), INV-2024-012 (4,723.00), INV-2024-019 (5,614.00), INV-2024-022 (4,459.00) — 24,940.00 collected twice, filed by size. The count column rides beside the money so the ledger shows HOW doubled as well as how much; the HAVING floor keeps singles out. The WHERE distractor can't see the count at all; the p.missing chip errors loudly — both friendlier than a ledger that quietly lists every matched invoice.",
  },
  {
    id: "cs-594",
    tier: "medium",
    topic: "j8",
    universe: "catalog",
    title: "USING with money attached",
    brief:
      "From: Catalog ops. Re: the shorthand's money damage.\n\nThe USING tour's money edition: orders JOIN products USING(id) — sixteen id coincidences — with the product prices summed across them. The count proves the coincidence; the money column shows the fiction a SUM would fund.",
    ask: "One row: USING-pair row count and Σ product price across the coincidences.",
    template: `SELECT {1}(*) AS paired, ROUND(SUM(products.price), 2) AS noise
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
        why: "orders and products share exactly one column name: id. USING(product_id) errors — orders has no such column.",
      },
    ],
    distractors: ["SUM", "UNION", "product_id"],
    walkthrough:
      "The money edition of the USING exhibit: sixteen id coincidences, and the summed product price across them — sixteen catalog entries summed once per matching order, a number funded entirely by bookkeeping. The count column proves the coincidence; the money column prices it. The product_id distractor fails at parse time (orders has no such column) — the parse error being the friendly outcome. Shorthands plus aggregates is how coincidences get budget lines.",
  },
  {
    id: "cs-595",
    tier: "hard",
    topic: "j8",
    universe: "inventory",
    title: "NATURAL with the shelf summed",
    brief:
      "From: Inventory control. Re: the implicit match's shelf damage.\n\nThe NATURAL tour's shelf edition: orders NATURAL JOIN products — sixteen id coincidences — with product stock summed across them. 16 rows of order-meets-product, and a shelf number that doubles as fiction.",
    ask: "One row: NATURAL-pair row count and Σ product stock across the coincidences.",
    template: `SELECT {1}(*) AS paired, ROUND(SUM(products.stock), 2) AS noise
FROM orders
        {3} JOIN {2};`,
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
        label: "the implicit partner",
        why: "orders and products share only the id name — sixteen coincidences. NATURAL order_items shares id too: a different (103-row) coincidence.",
      },
      {
        answer: "NATURAL",
        kind: "keyword",
        label: "the implicit matcher",
        why: "NATURAL joins on every shared column name with no ON clause. CROSS would pair every order with every product — 1,648 rows of explosion instead of 16 of coincidence.",
      },
    ],
    distractors: ["SUM", "order_items", "CROSS"],
    walkthrough:
      "The shelf edition of the NATURAL exhibit: sixteen id coincidences, and the summed stock across them — 103's worth of shelf fiction attached to sixteen order-meets-product accidents. The base table is pinned by the money column (orders.total exists, products.total doesn't — wait, it's the stock column that names products); the partner slot is where the implicit guess lives. The order_items distractor changes the shared set and the count — same lesson, different coincidence. Implicit matching plus SUM is the module's last warning shot.",
  },
  {
    id: "cs-596",
    tier: "hard",
    topic: "j8",
    universe: "refund-audit",
    title: "RIGHT JOIN with money kept",
    brief:
      "From: Refunds desk. Re: the mirror survey, money edition.\n\nThe mirror survey's money edition: payments RIGHT JOIN invoices — all 28 invoices present, six with NULL cash — and the invoice money summed across them. The sum reads the full 86,977.00 BECAUSE the right side preserved; an inner join would read only 27 rows' worth.",
    ask: "One row: RIGHT-join row count and Σ invoice money across all preserved invoices.",
    template: `SELECT {1}(*) AS rows_, ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed
FROM payments p
{2} JOIN invoices i ON {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the row counter",
        why: "A row count: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "RIGHT",
        kind: "keyword",
        label: "the preserving side",
        why: "RIGHT JOIN preserves all 28 invoices — the six unpaid included as NULL rows the SUM skips. INNER would sum only the 22 matched invoices' paper.",
      },
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id is the cash thread. Matching p.invoice_id to i.number compares a number to text.",
      },
    ],
    distractors: ["SUM", "UNION", "p.missing"],
    walkthrough:
      "The mirror survey's money edition: 28 rows, 86,977.00 summed — the FULL invoice book, preserved by the RIGHT join and summed honestly because the money column lives on the preserved side. Compare the inner join's edition: 27 rows... no — 22 matched INVOICES (27 payments over 22 invoices), summing only their paper. The preservation choice changes the money column's population — the survey's final lesson. The p.missing distractor errors loudly; the text-number variant zeroes the page silently.",
  },
  {
    id: "cs-597",
    tier: "hard",
    topic: "j8",
    universe: "supplier",
    title: "The chain's regional header",
    brief:
      "From: Supplier audit. Re: the sourcing header row, regionalized.\n\nThe sourcing header: supplier-region line counts and realized money — the four-hop chain grouped by the vendor's region. APAC's 87 lines against EU's 83: the units story and the money story side by side, per region.",
    ask: "Per supplier region: joined line count and realized revenue (Σ quantity × unit_price).",
    template: `SELECT s.region, COUNT(oi.id) AS lines, ROUND(SUM(oi.{1}), 2) AS revenue
FROM order_items oi
JOIN orders o ON {2}
JOIN products p ON {3}
JOIN suppliers s ON {4}
GROUP BY s.region
ORDER BY revenue {5};`,
    slots: [
      {
        answer: "quantity * unit_price",
        kind: "keyword",
        label: "the honest money expression",
        why: "Realized revenue is quantity × unit_price, summed at the line grain. unit_price alone prices every line at one unit.",
      },
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
        why: "The vendor hop: products.supplier_id → suppliers.id. s.region = p.category compares 'EU' to 'Electronics'.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The biggest revenue region leads the header: DESC.",
      },
    ],
    distractors: ["unit_price", "oi.id = o.id", "p.id = oi.order_id", "s.region = p.category", "ASC"],
    walkthrough:
      "The sourcing header: four regions, lines and realized money per region — EU 83 lines carrying 15,895.88, APAC 87 lines carrying 6,029.22 — the units-versus-value story in its regional form. All hops many-to-one from the line's perspective, so the 251-row grain holds; the money expression lives on the line, so no inflation touches it. The region=category hop zeroes the header silently; the unit_price-only variant reports a third of the book. The module's chain discipline, one last time, with money on the line.",
  },
  {
    id: "cs-598",
    tier: "hard",
    topic: "j8",
    universe: "month-close",
    title: "The FULL OUTER, with the money checked",
    brief:
      "From: Financial Controller. Re: the survey's money edition.\n\nThe survey's money edition: orders FULL OUTER JOIN customers — both sides preserved — with the order money summed across the rows. 103 rows, 34,833.28: identical to the inner join, and the note explains why that's the finding.",
    ask: "One row: FULL-join row count and Σ order money across the preserved rows.",
    template: `SELECT {1}(*) AS rows_, ROUND(SUM(o.total), 2) AS money
FROM orders o
{2} JOIN customers c ON {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the row counter",
        why: "A row count: COUNT(*). SUM(*) is invalid over the placeholder.",
      },
      {
        answer: "FULL",
        kind: "keyword",
        label: "the both-sides preservation",
        why: "FULL OUTER preserves both tables — neither gap exists today, so rows and money mirror the inner join exactly.",
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
      "The survey's money edition: 103 rows, 34,833.28 — the FULL OUTER join's money matching the inner join's to the cent, because both preservation gaps are empty on today's book. The note's value: the day a zero-order account appears, the FULL join's money stays honest while the inner join's silently shrinks. The o.missing distractor errors loudly; the o.id = c.id coincidence would read 16 rows and a fiction sum — the danger tour's last stop. Join-type surveys are money surveys too.",
  },
  {
    id: "cs-599",
    tier: "hard",
    topic: "j8",
    universe: "funnel",
    title: "The capstone header, regionalized",
    brief:
      "From: Marketing lead. Re: the module's last regional header.\n\nThe module's last regional header: per customer region, joined lines, DISTINCT orders, DISTINCT buyers — the census at full regional grain. The four rows reconcile to 251, 103 and 16; any future query that disagrees has a broken hop.",
    ask: "Per region: joined lines, DISTINCT orders, and DISTINCT buyers.",
    template: `SELECT c.region, COUNT(oi.id) AS lines, COUNT({1} o.id) AS orders, COUNT(DISTINCT c.id) AS buyers
FROM customers c
JOIN orders o ON {2}
JOIN order_items oi ON {3}
GROUP BY c.region
ORDER BY lines {4};`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the order dedup",
        why: "COUNT(DISTINCT o.id) collapses each region's joined rows back to real orders — the fan-out, undone per region.",
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
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The heaviest line load leads the header: DESC.",
      },
    ],
    distractors: ["ALL", "o.id = c.id", "oi.id = o.id", "ASC"],
    walkthrough:
      "The last regional header: EU 105 lines / 45 orders / 8 buyers, APAC 88 / 37 / 5, US 53 / 19 / 2, LATAM 5 / 2 / 1 — the census at full grain, reconciling to 251, 103 and 16. The ALL distractor makes the orders column read the line count per region — the fan-out wearing an orders label one final time. Both hops real, both counts deduped, four regions accounted. The module ends where it began: with the discipline of naming exactly what each number counts.",
  },
  {
    id: "cs-600",
    tier: "hard",
    topic: "j8",
    universe: "supplier",
    title: "The module's final reconciliation",
    brief:
      "From: Supplier audit. Re: the closing reconciliation, all grains.\n\nThe closing reconciliation: joined rows, DISTINCT orders, DISTINCT buyers, AND the honest line money — 251, 103, 16, 34,833.28 in one row. Every join query in Module 2 answers to this header; the four numbers are its signature.",
    ask: "One row: joined rows, DISTINCT orders, DISTINCT buyers, and Σ quantity × unit_price.",
    template: `SELECT COUNT(*) AS joined, COUNT(DISTINCT o.id) AS orders, COUNT(DISTINCT c.id) AS buyers, ROUND(SUM(oi.{1}), 2) AS honest
FROM customers c
JOIN orders o ON {2}
JOIN order_items oi ON {3};`,
    slots: [
      {
        answer: "quantity * unit_price",
        kind: "keyword",
        label: "the honest money expression",
        why: "Line money is quantity × unit_price, summed — the only money column the fan-out cannot inflate.",
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
        why: "The line grain arrives via order_items.order_id → orders.id. oi.id = o.id corrupts all four numbers.",
      },
    ],
    distractors: ["unit_price", "o.id = c.id", "oi.id = o.id"],
    walkthrough:
      "The closing reconciliation: 251 joined rows, 103 distinct orders, 16 distinct buyers, 34,833.28 of honest line money — Module 2's four signature numbers in one row. Every query in the module has been a variation on this header: the joins define the population, the dedups define the grains, the money expression defines the truth. The unit_price-only variant prices every line at one unit; the id-coincidence joins reroute the population through bookkeeping. Rebuild this header from memory and the module is yours.",
  },
];
