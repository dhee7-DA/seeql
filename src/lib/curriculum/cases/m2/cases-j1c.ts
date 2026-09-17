// Joins-deck batch j1c — INNER JOIN fundamentals (cs-218..cs-225).
// Same memo voice and audit discipline as the M2 exemplars: the slot battle is
// the FK thread (which column points at which table), join direction and the
// widening payoff, column qualification when both sides carry the same column
// name, and why INNER silently drops rows that never match. One and two-hop
// bridges only; every figure quoted in prose was probed live against the seed
// db before being written down.

import type { CaseStudy } from "../types";

export const casesJ1c: CaseStudy[] = [
  {
    id: "cs-218",
    deck: 2,
    topic: "j1",
    universe: "logistics",
    title: "The DHL freight bill",
    brief:
      "From: Logistics desk. Re: carrier invoice check.\n\nDHL's month-end invoice just landed and the line items need eyeballing before finance pays it. Pull every DHL shipment with its order ticket and the freight we were charged, heaviest freight first — and nothing below 12 a parcel, the account manager only disputes the expensive lanes.",
    ask: "Order id, order total and freight cost for every DHL shipment costing more than 12, heaviest freight first.",
    template: `SELECT o.id, o.total, s.cost
FROM shipments s
JOIN orders o ON o.id = {1}
WHERE s.carrier = {2} AND s.cost > {3}
ORDER BY {4} DESC;`,
    slots: [
      {
        answer: "s.order_id",
        kind: "keyword",
        label: "the shipment-side order key",
        why: "Shipments point back at the order they moved through the foreign key s.order_id, so the pairing is o.id = s.order_id. o.id = s.id would pair order #N with shipment #N — two unrelated counters that happen to share a number range — and silently fabricate the ticket on every line.",
      },
      {
        answer: "'DHL'",
        kind: "keyword",
        label: "the carrier filter",
        why: "The invoice is DHL's, so the carrier filter reads 'DHL' — quoted, because it's a value the carrier column holds, not a column itself. Without the quotes SQLite hunts for a column named DHL and the query dies.",
      },
      {
        answer: "12",
        kind: "number",
        label: "the freight floor",
        why: "The account manager only disputes lanes above 12 a parcel, so the threshold lands on s.cost > 12 — strictly greater, a parcel costing exactly 12.00 stays off the dispute list.",
        noVerify: true,
      },
      {
        answer: "s.cost",
        kind: "keyword",
        label: "the sort column",
        why: "The dispute list is ranked by freight, so ORDER BY s.cost. o.total would rank by ticket value instead — a 577 ticket with 4.33 freight would jump to the top of a list that exists to challenge freight charges.",
      },
    ],
    distractors: ["s.id", "o.customer_id", "'UPS'", "'LocalPost'", "o.total", "20"],
    walkthrough:
      "The join's job here is pure widening: shipments know carriers and freight but not what the parcels were worth, so s.order_id → o.id attaches each ticket to its leg. Run it and 8 rows come back — DHL ran 29 shipments this period and 8 of them cleared the 12 floor, led by order 30 (ticket 56.19) at 15.79 freight and order 62 at 15.15. Worth noting what didn't happen: nothing was dropped, because every one of the 82 shipments sits on a real order — the INNER match is complete, and the only rows removed are the ones the WHERE clause evicts. The classic first-join tell is in the ON clause: s.order_id, not s.id. Shipment ids and order ids both start at 1, so o.id = s.id executes without error and returns plausible-looking rows with the wrong tickets attached — the most dangerous kind of wrong.",
  },
  {
    id: "cs-219",
    deck: 2,
    topic: "j1",
    universe: "receivables",
    title: "Money that hasn't landed",
    brief:
      "From: Receivables. Re: the pending queue.\n\nEnd of week and the pending queue needs chasing before Monday's cash call. I want the stuck payments with the order ticket attached so the chasers can quote a real number per call — what the customer was billed, how they tried to pay, and how much is sitting in each pending settlement.",
    ask: "Order total, method and pending amount for every payment still in pending status, ordered by payment id.",
    template: `SELECT {1}, p.method, p.amount
FROM payments p
JOIN orders o ON {2} = p.order_id
WHERE p.status = {3}
ORDER BY p.id;`,
    slots: [
      {
        answer: "o.total",
        kind: "keyword",
        label: "the ticket value",
        why: "The billed amount lives on the order: o.total is the ticket the customer saw. o.status would print fulfillment text in a money column and p.id would print the payment's row number — neither is a number a chaser can quote on a call.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the order-side key",
        why: "The pairing is o.id = p.order_id: the order's primary key meets the payment's foreign key. p.id = p.order_id compares the payment's own row number against the order it belongs to — for the pending queue that comparison matches nothing, and the chase list comes back empty.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the status filter",
        why: "Only money that hasn't landed belongs on a chase list, so the filter reads 'pending' — quoted, it's a value. 'settled' would pull the 77 payments that already cleared and bury the queue in money that needs no chase.",
      },
    ],
    distractors: ["o.status", "p.id", "o.customer_id", "'failed'", "'settled'", "'shipped'"],
    walkthrough:
      "One hop, one direction: payments know the money, orders know the ticket, and p.order_id → o.id is the only thread between them. Run it and 13 pending payments come back worth 5,607.30 stuck in total — 8 tried card (3,921.72), 3 wallet (957.87), 2 bank_transfer (727.71) — with order 43 the biggest single chase at 945.21. The INNER join is doing quiet work here: of 91 payment rows only these 13 survive the status filter, and each one drags in exactly its order because the foreign key is complete. Flip the query to start from orders and the shape inverts — most orders have no pending payment at all, and INNER would erase them before the WHERE ever ran. That's the direction lesson: start from the table that owns the rows you're counting, join toward the table that holds the columns you're missing.",
  },
  {
    id: "cs-220",
    deck: 2,
    topic: "j1",
    universe: "growth",
    title: "The referral thank-you list",
    brief:
      "From: Growth lead. Re: referral thank-yous.\n\nWe're sending hand-written thank-you notes to everyone who arrived through a customer referral — those are our cheapest acquisitions and the referrers deserve a gesture. I need names and regions against each referral's acquisition spend so we can size the gesture per market. One warning: not everyone in the customer table was acquired, some walked in organically.",
    ask: "Customer name, region, channel and spend for every referral-channel acquisition, biggest spend first.",
    template: `SELECT c.name, c.region, a.channel, a.spend
FROM {1} c
JOIN acquisitions a ON {2} = a.customer_id
WHERE a.channel = {3}
ORDER BY a.spend DESC;`,
    slots: [
      {
        answer: "customers",
        kind: "keyword",
        label: "the starting table",
        why: "The memo asks for names, and names live on customers — acquisitions only carry spend and channel. Starting FROM customers and joining toward acquisitions is the widening direction; starting from acquisitions would leave the SELECT hunting for columns that table doesn't have.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the customer-side key",
        why: "The pairing is c.id = a.customer_id — the customer's primary key meets the acquisition's foreign key. a.id = a.customer_id would compare an acquisition's row number against its own customer reference and explode four referral rows into a cartesian mess of every customer crossed with every touch.",
      },
      {
        answer: "'referral'",
        kind: "keyword",
        label: "the channel filter",
        why: "The thank-you list is referral-only, so the filter reads 'referral' — quoted, it's a value of channel. 'social' would swap in the paid-social crowd instead: real customers, wrong campaign, wrong notes.",
      },
    ],
    distractors: ["employees", "orders", "a.id", "c.region", "'social'", "'email'"],
    walkthrough:
      "This is the case where INNER JOIN earns its name by deleting people. Run it and four names come back — Bruno Silva (35.81), Hiro Tanaka (28.77), Maya Patel (15.22), Emma Wilson (9.22) — 89.02 of referral spend across four markets. But start from customers and only 14 of the 16 make it through the join at all: Noah Meyer and Pedro Alvarez have no acquisition row because they walked in organically, and INNER drops them before the referral filter ever fires. The 15 acquisition touches cover 14 people — one customer was hit twice, the retargeting re-acquisition — so the join also fans a returning customer out to two rows. Neither behavior is a bug; it's the contract. INNER keeps the intersections, and if the growth team ever wants the organics on a campaign list, that's a different join coming later in the deck.",
  },
  {
    id: "cs-221",
    deck: 2,
    topic: "j1",
    universe: "people-ops",
    title: "Who clears the refund queue",
    brief:
      "From: Support org review. Re: refund workload.\n\nBoard question I can't answer from the org chart: who actually processes refunds? Pull the refund ledger with the agent's name and role attached, leads only — I want to see what a lead's queue looks like next to the reps'. Note the direction: start from the staff list, not the refunds, or the review reads the wrong way round.",
    ask: "Agent name, role, refund reason and amount for every refund processed by a lead, ordered by nothing in particular.",
    template: `SELECT {1}, {2}, r.reason, r.amount
FROM employees e
JOIN refunds r ON {3} = e.id
WHERE e.role = {4};`,
    slots: [
      {
        answer: "e.name",
        kind: "keyword",
        label: "the agent's name",
        why: "The review is about people, so the name comes from employees: e.name. r.processed_by is the foreign key that found them — printing it would show bare id numbers where the board wants a name, and r.id would show refund row numbers instead.",
      },
      {
        answer: "e.role",
        kind: "keyword",
        label: "the role column",
        why: "Role is a property of the staff member, so it lives on employees: e.role. r.reason describes the refund, not the person — slotting it here prints 'damaged' and 'wrong_item' in a column meant to say who held the queue.",
      },
      {
        answer: "r.processed_by",
        kind: "keyword",
        label: "the refund-side foreign key",
        why: "Refunds point at the agent who cleared them through r.processed_by, so the match is r.processed_by = e.id. r.id = e.id pairs refund #N with employee #N — refund ids run to 25 over a 10-person staff, so it fabricates a workload history that never happened.",
      },
      {
        answer: "'lead'",
        kind: "keyword",
        label: "the role filter",
        why: "The brief scopes to leads, so the filter reads 'lead' — quoted, it's a value of role. 'manager' is the instructive wrong chip: it returns nothing, because no manager processed a single refund this period.",
      },
    ],
    distractors: ["e.manager_id", "e.region", "r.id", "r.reason", "'rep'", "'manager'"],
    walkthrough:
      "Direction is the whole case: the memo says start from the staff list, and that's where INNER does its cutting. Ten employees walk in; only six come out holding refunds — Ingrid Larsen (7), Marcus Hale (7), Ravi Menon (5), Elena Petrova (3), Tomas Ruiz (2), Carla Dominguez (1). The four who vanish are the three managers and Aiko Yamada, none of whom processed a single refund this period, and INNER erases them without a whisper. With the lead filter applied, the board's answer is one name: Marcus Hale, 7 refunds totaling 1,128.33 — including both wrong-item cases over 150. The 'manager' chip returning an empty result is worth ten minutes of anyone's time: empty here doesn't mean broken, it means the intersection of managers and refund processing is genuinely vacant — exactly the workload fact the board asked about.",
  },
  {
    id: "cs-222",
    deck: 2,
    topic: "j1",
    universe: "catalog",
    title: "The Audio shelf's real prices",
    brief:
      "From: Pricing desk. Re: promo leakage on Audio.\n\nBefore we reprice the Audio shelf I need to see what the shelf actually sold for against the list prices. Every Audio order line, with the price the till charged next to the catalog price — the two live on different tables, so if the query blurs them the whole leakage analysis is worthless.",
    ask: "Product name, quantity, charged unit price and catalog price for every order line on an Audio product.",
    template: `SELECT p.name, oi.quantity, {1}, {2}
FROM order_items oi
JOIN products p ON {3} = oi.product_id
WHERE p.category = {4};`,
    slots: [
      {
        answer: "oi.unit_price",
        kind: "keyword",
        label: "the charged price",
        why: "What the customer actually paid per unit is stamped on the line at sale time: oi.unit_price. p.stock or oi.quantity would print inventory numbers where money belongs and quietly misprice every row of the leakage analysis.",
      },
      {
        answer: "p.price",
        kind: "keyword",
        label: "the catalog price",
        why: "The list price lives on the product master: p.price. It's the only table that knows what the shelf says the item costs — the line items table never heard of list prices, so p.stock or a second oi.column can't stand in for it.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the product-side key",
        why: "The pairing is p.id = oi.product_id — the product's primary key meets the line's foreign key. oi.id = oi.product_id compares a line's row number against the product it sold and matches three accidental coincidences out of fifty-one lines, silently corrupting the shelf.",
      },
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "the shelf filter",
        why: "The repricing targets Audio, so the filter reads 'Audio' — quoted, it's a category value. 'Wearables' executes fine and returns a completely different shelf, which is the dangerous kind of wrong: no error, just the wrong products.",
      },
    ],
    distractors: ["p.stock", "oi.quantity", "oi.id", "oi.order_id", "p.category", "'Wearables'"],
    walkthrough:
      "Two tables, two prices, one name collision waiting to happen: the charged price is oi.unit_price (stamped on each line at sale time) and the list price is p.price (owned by the product master). The join p.id = oi.product_id is what puts them side by side, and the pairing rule matters — oi.id looks temptingly similar and even executes, but it pairs line #N with product #N whenever the counters coincide. Run it and 51 Audio lines come back, and the headline is stark: not one of them rang at the list price. The Noise-Canceling Headset lists at 149.99 and sold anywhere from 142.63 to 157.40; the Studio Desktop Mic lists at 119 and drifted 113.94 to 124.30. Every Audio line settled off-catalog — that's not leakage on a few rows, that's the shelf's entire pricing behavior, and it's the number the repricing meeting needs.",
  },
  {
    id: "cs-223",
    deck: 2,
    topic: "j1",
    universe: "supplier",
    title: "Lines from the APAC belt",
    brief:
      "From: Supplier audit. Re: APAC dependency.\n\nProcurement wants to know how much of our order flow runs through the APAC belt — every order line traced back to the supplier that made the product, for APAC suppliers only. That's two foreign keys away from the line: line to product, product to supplier. Miss a hop and the audit counts air.",
    ask: "Product name, supplier name and quantity for every order line supplied by an APAC supplier.",
    template: `SELECT p.name, s.name, oi.quantity
FROM order_items oi
JOIN products p ON {1} = oi.product_id
{2} suppliers s ON s.id = {3}
WHERE s.region = {4};`,
    slots: [
      {
        answer: "p.id",
        kind: "keyword",
        label: "the product-side key",
        why: "The first hop pairs the line's foreign key with the product's primary key: p.id = oi.product_id. oi.id = oi.product_id compares a line's row number to the product it sold — it runs without error and returns a confidently wrong audit.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the second bridge",
        why: "Reaching suppliers needs a second plain JOIN on the same pattern. NATURAL JOIN refuses to take an ON clause and errors out; a bare INNER before the table name is a syntax error — SQLite accepts neither spelling in that slot.",
      },
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the product-side supplier key",
        why: "Products point at their maker through p.supplier_id, so the second hop is s.id = p.supplier_id. s.id = p.id would match supplier #N with product #N — six suppliers, sixteen products, and every coincidence it finds is a fabricated supply line.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the region filter",
        why: "The audit scopes to the APAC belt, so the filter reads 'APAC' — quoted, it's a value of region. 'EU' is the plausible wrong chip: it runs clean and returns the European lines, an entirely different dependency story.",
      },
    ],
    distractors: ["NATURAL JOIN", "INNER", "oi.id", "oi.order_id", "s.id", "'EU'"],
    walkthrough:
      "The two-hop bridge is the workhorse shape of analytical SQL: order_items → products → suppliers, one foreign key per hop, and each hop is the same contract — the child's FK meets the parent's primary key. Run it and 87 lines flow through the APAC belt: Shenzhen Electro (rated 4.1) and Pacific Textiles (3.9) between them feed a fifth of all order flow, and the EU substitution would show 83 lines for comparison. Nothing drops on either hop — every line names a real product and every product names a real supplier, so the INNER matches are complete and the only cutting is the WHERE. The trap to carry forward is p.supplier_id versus p.id: both are id-shaped columns on the same table, and s.id = p.id still executes, matching the 29 coincidences where a product number equals a supplier number. Plausible-looking output, fabricated supply chain.",
  },
  {
    id: "cs-224",
    deck: 2,
    topic: "j1",
    universe: "fraud",
    title: "APAC tickets worth a knock",
    brief:
      "From: Risk team. Re: regional spot-check.\n\nThis cycle's sweep covers the APAC book: any ticket above 300 gets a reviewer knock, biggest first. I need the order ids and totals with the buyer's name attached — the region is a customer attribute, not an order one, so the query has to go find it. Cap nothing; the list is what it is this month.",
    ask: "Order id, total and customer name for every APAC order above 300, biggest ticket first.",
    template: `SELECT o.id, o.total, c.name
FROM orders o
JOIN customers c ON {1} = o.customer_id
WHERE {2} = 'APAC' AND o.total > {3}
ORDER BY o.total {4};`,
    slots: [
      {
        answer: "c.id",
        kind: "keyword",
        label: "the customer-side key",
        why: "The pairing is c.id = o.customer_id — buyer's primary key meets order's foreign key. o.id = o.customer_id compares an order's row number against its own buyer reference; it executes and returns a short, confident, entirely wrong sweep list.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the region column",
        why: "Region describes the customer, so it lives on the wide side: c.region. Filtering o.status = 'APAC' looks structurally identical and runs clean — but an order status is never 'APAC', so the sweep returns an empty list and the risk cycle checks nobody.",
      },
      {
        answer: "300",
        kind: "number",
        label: "the knock threshold",
        why: "The sweep policy is tickets above 300, so the comparison is o.total > 300 — strictly greater, a 300.00 ticket waits for next cycle.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Reviewers work biggest-first, so ORDER BY o.total DESC. ASC would send them to the smallest qualifying ticket first — 303.26 before the 1,088.44 they actually exist to see.",
      },
    ],
    distractors: ["o.id", "c.city", "o.status", "ASC", "500", "150"],
    walkthrough:
      "The widening here is one hop: orders know money and ids, customers know who and where, and o.customer_id → c.id attaches the person. The region filter belongs on the customer side — it's an attribute of the buyer, and the classic wrong-side spelling o.status = 'APAC' fails silently rather than loudly, returning zero rows because statuses are delivered/shipped/pending/cancelled. Run it and 18 APAC tickets clear the 300 bar, led by order 74 — Farid Nasser, 1,088.44 — with Grace Kim's 826.03 behind it; tighten to 500 and only 4 tickets survive. One row will jump out at the review: order 83, Keiko Sato, 397.99 — the same figure as the biggest cancellation on file, because that's exactly the order it is. A 2-direction sweep on a live region: that's the list the knock schedule is built from.",
  },
  {
    id: "cs-225",
    deck: 2,
    topic: "j1",
    universe: "refund-audit",
    title: "Wrong-item refunds, buyers named",
    brief:
      "From: Refund audit. Re: wrong-item pattern.\n\nThree wrong-item refunds went out this period and QA wants the buyers named before we decide whether it's a picking problem or a listing problem. Refunds know money and reason but not people — the buyer's name is two foreign keys away: refund to order, order to customer. Build the bridge and attach the name.",
    ask: "Refund id, refund amount and customer name for every wrong-item refund.",
    template: `SELECT r.id, r.amount, {1}
FROM refunds r
JOIN orders o ON {2} = r.order_id
JOIN customers c ON {3} = o.customer_id
WHERE r.reason = {4};`,
    slots: [
      {
        answer: "c.name",
        kind: "keyword",
        label: "the buyer's name",
        why: "Names live on customers, which is why the second hop exists: c.name prints the buyer the audit needs. c.region or c.email would print real columns but not the one QA asked for — the deliverable is a person, not an address.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the order-side key, hop one",
        why: "The first hop is o.id = r.order_id — the order's primary key meets the refund's foreign key. o.customer_id = r.order_id compares the buyer reference against the ticket reference and matches nothing: two id spaces that never intersect.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the customer-side key, hop two",
        why: "The second hop is c.id = o.customer_id, completing the chain to the buyer. o.customer_id = o.customer_id is always true and would cross every matched refund with all sixteen customers — forty-eight rows where three belong.",
      },
      {
        answer: "'wrong_item'",
        kind: "keyword",
        label: "the reason filter",
        why: "QA scoped to wrong-item, so the filter reads 'wrong_item' — quoted, underscored, exactly as stored. 'damaged' is the plausible wrong chip: it runs clean and hands QA the biggest refund bucket, fourteen cases of a different problem.",
      },
    ],
    distractors: ["c.region", "c.email", "o.customer_id", "o.total", "r.id", "'damaged'"],
    walkthrough:
      "A two-hop bridge with a payoff column at the far end: refunds know money and reason, orders know who bought, customers know the name — r.order_id → o.id, then o.customer_id → c.id, and the SELECT reaches across both joins to c.name. Run it and three rows come back: refund 7, Chloe Dubois, 75.29 (order 34); refund 14, Grace Kim, 190.53 (order 68); refund 20, Alice Chen, 15.83 (order 86) — 281.65 of wrong-item money against a damaged bucket fourteen times the count. Both hops match completely — every refund sits on a real order of a real customer — so INNER drops nothing and the filter does all the cutting. The structural lesson is that a chain is just the one-hop contract repeated: at each hop, the child table's foreign key meets the parent's primary key, and any id-shaped near-miss that still executes is a bug wearing a result set.",
  },
];
