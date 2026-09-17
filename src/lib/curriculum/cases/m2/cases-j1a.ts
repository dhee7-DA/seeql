// Joins-deck batch j1a — INNER JOIN fundamentals, cs-202..cs-209.
// Same memo voice and audit discipline as the M2 exemplars: 1-2 joins per
// query, the slot battle is the FK thread (whose column points where),
// match rules on the ON clause, column qualification when both tables share
// a name, and why INNER quietly drops rows that don't match. Every figure
// quoted in prose was probed live against a read-only copy of the seed db
// (scripts/probe-j1a.ts) before being written down.

import type { CaseStudy } from "../types";

export const casesJ1a: CaseStudy[] = [
  {
    id: "cs-202",
    deck: 2,
    topic: "j1",
    universe: "cash",
    title: "Wallet settlements, tied to tickets",
    brief:
      "From: Cash desk, settlement run.\n\nWallet clearings keep landing on the processor's file without an order ticket beside them, and finance wants proof they belong to real orders. Pull every settled wallet payment with its installment amount and the buyer's name attached, biggest amount first, so each wallet clearing can be tied back to the order it paid for.",
    ask: "Payment id, amount, method and customer name for every settled wallet payment, biggest amount first.",
    template: `SELECT p.id, {1}, p.method, c.name
FROM payments p
{2} orders o ON o.id = p.order_id
JOIN customers c ON c.id = o.customer_id
WHERE p.method = {3} AND {4} = 'settled'
ORDER BY p.amount DESC;`,
    slots: [
      {
        answer: "p.amount",
        kind: "keyword",
        label: "the wallet installment",
        why: "The money the processor cleared lives on the payment row: p.amount. o.total is the order's whole ticket — for payment 29 it would print 624.66 instead of the 259.13 actually received, which is exactly the mismatch the reconciliation is trying to avoid.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the bridge to orders",
        why: "Payments carry money but no ticket, so the query bridges to orders with a plain JOIN and lets ON pair each payment with the one order it references. Bare INNER or NATURAL JOIN don't spell a working bridge here — the JOIN keyword itself is required.",
      },
      {
        answer: "'wallet'",
        kind: "keyword",
        label: "the method filter",
        why: "The desk asked for wallet clearings specifically, so the method filter reads 'wallet' — quoted, because it's a value not a column. 'card' would return a completely different pile of settlements, and an unquoted wallet would be read as a column name and error.",
      },
      {
        answer: "p.status",
        kind: "keyword",
        label: "the settlement filter",
        why: "Settled is a payment state, so the column is p.status — o.status describes fulfillment and can never hold 'settled', so that spelling silently returns nothing. The filter keeps the 13 wallet rows that actually cleared and drops the 3 still pending.",
      },
    ],
    distractors: ["o.total", "NATURAL JOIN", "INNER", "'card'", "o.status", "p.method"],
    walkthrough:
      "Thirteen wallet settlements came back, totaling 3,977.17, led by payment 35 at 845.92 for Emma Wilson. The query needs two hops because payments know money but not people: p.order_id → o.id lands on the ticket, o.customer_id → c.id lands on the buyer. The column battle is the whole lesson — p.amount prints what the wallet actually paid, while o.total prints the ticket total, and the two are not the same thing: payment 29 cleared 259.13 against Emma Wilson's 624.66 order, and payment 72 cleared 83.1 against a 164.17 ticket. Of the 16 wallet payments on file, 13 settled and 3 are still pending — the 'settled' filter is what keeps the ledger honest. Method mix for context: card 62, bank_transfer 13, wallet 16.",
  },
  {
    id: "cs-203",
    deck: 2,
    topic: "j1",
    universe: "receivables",
    title: "The collections chase list",
    brief:
      "From: Receivables, month-start dunning run.\n\nCollections wants the chase list for the big open tickets: every order still sitting in pending with a value of at least 400, with the buyer's name and email so the dunning mail merge has somewhere to go. Sort it biggest exposure first — the team works the list top down and stops when the morning is gone.",
    ask: "Order id, customer name, email and total for pending orders worth 400 or more, biggest total first.",
    template: `SELECT o.id, c.name, {1}, o.total
FROM orders o
JOIN customers c ON {2} = o.customer_id
WHERE o.status = {3} AND o.total >= {4}
ORDER BY o.total {5};`,
    slots: [
      {
        answer: "c.email",
        kind: "keyword",
        label: "the contact for the merge",
        why: "The dunning mail merge needs an address, and addresses live on the customer side: c.email. o.created_at would print the order date instead, and c.city a town — both real columns, both useless for sending an email.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the customer-side key",
        why: "The foreign key thread runs orders → customers: o.customer_id points at c.id, so the match rule is c.id = o.customer_id. Matching o.id = o.customer_id compares an order's own number to its buyer's number — two unrelated counters that happen to share a table.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open-status filter",
        why: "The chase list targets orders still awaiting payment, and that state is spelled 'pending' — quoted, because it's a value. 'shipped' would pull fulfilled tickets into the dunning run, which is precisely the embarrassment collections avoids.",
      },
      {
        answer: "400",
        kind: "number",
        label: "the exposure floor",
        why: "The brief sets the bar at 400: o.total >= 400 keeps the five biggest open tickets and leaves the small ones to the standard reminder cycle. 300 would widen the list to eight orders and bury the real exposure.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest exposure first is descending: DESC. The default ASC would hand the team the smallest ticket — 576.54 — at the top and the 1,088.44-scale problem at the bottom, the exact opposite of how the list is worked.",
      },
    ],
    distractors: ["c.city", "o.created_at", "'shipped'", "300", "ASC"],
    walkthrough:
      "Five tickets make the chase list: order 74, Farid Nasser, 1,088.44; order 43, Chloe Dubois, 945.21; order 5, Emma Wilson, 725.34; order 97, Emma Wilson again, 585.79; order 1, Pedro Alvarez, 576.54. One join does it: orders already carry the buyer's key in o.customer_id, and c.id = o.customer_id is the match rule that widens each order row into a customer contact. Watch the direction of the thread — the FK lives on orders, the PK on customers, so the ON clause reads c.id = o.customer_id, never o.id = o.customer_id. Scale for the desk: 14 orders are pending in total, 8 of them clear a 300 bar, and these five hold the bulk of the open value. Emma Wilson appearing twice is not a bug — two separate pending tickets, two separate dunning mails.",
  },
  {
    id: "cs-204",
    deck: 2,
    topic: "j1",
    universe: "logistics",
    title: "DHL parcels still in the air",
    brief:
      "From: Logistics desk, carrier scorecard.\n\nDHL's SLA review is Friday and I need our open exposure with them: every DHL parcel that has left the building but shows no delivery timestamp yet. Attach the order number and buyer so support can pre-notify, and lead with the priciest shipments — that's the exposure the account manager will ask about first.",
    ask: "Shipment id, order id, customer name and cost for DHL shipments with no delivery timestamp, priciest first.",
    template: `SELECT {1}, o.id AS order_id, c.name, s.cost
FROM shipments s
JOIN orders o ON {2} = o.id
JOIN customers c ON c.id = o.customer_id
WHERE s.carrier = {3} AND s.delivered_at IS {4}
ORDER BY s.cost DESC;`,
    slots: [
      {
        answer: "s.id",
        kind: "keyword",
        label: "the parcel reference",
        why: "The carrier scorecard tracks parcels, so each line is keyed by the shipment's own id: s.id. o.id would print the order number twice — the AS order_id column already carries it — and o.customer_id would print a buyer number where a tracking reference belongs.",
      },
      {
        answer: "s.order_id",
        kind: "keyword",
        label: "the shipment-side foreign key",
        why: "Shipments point back at orders through s.order_id, so the pairing is s.order_id = o.id. o.customer_id would try to match a customer number against an order number — two unrelated counters — and quietly pair almost nothing.",
      },
      {
        answer: "'DHL'",
        kind: "keyword",
        label: "the carrier filter",
        why: "The review is DHL-specific, so the filter reads 'DHL' — quoted, because it's a value. The unquoted UPS spelling would be parsed as a column, fail with no such column, and the unquoted habit is exactly what the chips test.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the in-transit marker",
        why: "A parcel with no delivery timestamp is still in the air, and the only correct test for an empty timestamp is IS NULL. NOT NULL flips the query to the 18 DHL parcels that did land — the opposite list — and = NULL matches nothing at all.",
      },
    ],
    distractors: ["o.total", "o.customer_id", "'UPS'", "UPS", "NOT NULL", "o.status"],
    walkthrough:
      "Eleven DHL parcels are still in transit, costing between 5.32 and 15.79 — 102.93 of shipping exposure with no delivery scan. The chain is the standard two-hop bridge: s.order_id → o.id lands on the ticket, o.customer_id → c.id lands on the buyer, and the result reads like a handover list: shipment 23 at 15.79 for order 30, Noah Meyer, down to shipment 42 at 5.32 for order 54, Maya Patel. The state test is the teaching point: delivered_at IS NULL means 'no delivery scan yet' — IS, not =, because NULL is not a value you can compare with equals. Context for the scorecard: DHL runs 29 shipments total (18 delivered, 11 open), and in-transit counts across carriers are DHL 11, FedEx 6, LocalPost 4, UPS 2 — DHL is both our busiest and our most exposed carrier.",
  },
  {
    id: "cs-205",
    deck: 2,
    topic: "j1",
    universe: "people-ops",
    title: "Who actually signs the refunds",
    brief:
      "From: Support org, authority matrix review.\n\nPolicy says refunds are signed off at lead level, but the ledger tells the real story. Pull every refund row with the processor's name attached, filtered to the lead tier, in processing order — I want to know exactly who exercised lead authority this year, on which claims, and at what amounts.",
    ask: "Refund id, reason, amount and the employee who processed it, for refunds processed by leads, in refund-date order.",
    template: `SELECT r.id, r.reason, {1}, e.name AS processed_by
FROM refunds r
JOIN employees e ON {2} = e.id
WHERE {3} = 'lead'
ORDER BY {4};`,
    slots: [
      {
        answer: "r.amount",
        kind: "keyword",
        label: "the refunded money",
        why: "The authority review cares how much moved, and the refunded value lives on the refund row: r.amount. e.hired_at or e.manager_id are real employee columns but print HR facts where money belongs.",
      },
      {
        answer: "r.processed_by",
        kind: "keyword",
        label: "the refund-side foreign key",
        why: "Refunds record who handled them in r.processed_by, so the match rule is r.processed_by = e.id. Matching e.id = e.id would pair every refund with every employee at once — a fan-out — and r.order_id would hunt for employees whose staff number equals an order number.",
      },
      {
        answer: "e.role",
        kind: "keyword",
        label: "the authority filter",
        why: "Lead authority is a property of the employee, so the filter lands on e.role = 'lead'. r.reason holds claim categories like 'damaged' and can never equal 'lead', and e.region holds EU/APAC/US/LATAM — filtering either returns an empty ledger.",
      },
      {
        answer: "r.refunded_at",
        kind: "keyword",
        label: "the processing timeline",
        why: "The review wants the story in the order it happened, so the sort is r.refunded_at. e.hired_at would sort by when the staffer joined — meaningless for a payment timeline — and e.id would silently reshuffle the audit trail by staff number.",
      },
    ],
    distractors: ["e.id", "r.order_id", "e.region", "e.manager_id", "e.hired_at"],
    walkthrough:
      "Seven refunds carry lead authority, and every single one was processed by Marcus Hale — 1,128.33 in total, from a 324.9 damaged claim on order 6 in January down to a 15.83 wrong_item claim in December. Aiko Yamada, the other lead, processed none. The join is one hop: r.processed_by → e.id attaches the human to each refund, and e.role = 'lead' keeps only the lead tier. The rest of the ledger for contrast: reps processed 18 refunds worth 2,451.32, managers processed none. So the authority matrix is real but narrow — one lead shoulders every lead-level sign-off, which is either a training gap or a bottleneck, depending on who you ask.",
  },
  {
    id: "cs-206",
    deck: 2,
    topic: "j1",
    universe: "supplier",
    title: "Vendors earning the premium shelf",
    brief:
      "From: Supplier audit, premium shelf review.\n\nWe're deciding which vendors earn premium shelf space next quarter. Show the products we buy from suppliers rated 4.4 or better that also list at 60 or more, with the supplier name and rating beside each — the buying committee wants proof that the quality score and the price tag travel together before they commit shelf space.",
    ask: "Product name, category, price, supplier name and rating for products from suppliers rated 4.4+ and priced at 60+, priciest first.",
    template: `SELECT p.name, p.category, {1}, s.name AS supplier, s.rating
FROM products p
JOIN suppliers s ON {2} = s.id
WHERE s.rating >= {3} AND p.price >= {4}
ORDER BY p.price DESC;`,
    slots: [
      {
        answer: "p.price",
        kind: "keyword",
        label: "the list price",
        why: "The shelf decision weighs what we charge, so the price column is p.price. s.rating would print a quality score where a price belongs, and p.stock prints shelf counts — both real columns, both wrong currency for this list.",
      },
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the product-side foreign key",
        why: "Products record their vendor in p.supplier_id, so the match rule is p.supplier_id = s.id. Matching p.id = s.id pairs products to whichever supplier happens to share their product number — three of the sixteen would even line up, which makes the mistake genuinely hard to spot.",
      },
      {
        answer: "4.4",
        kind: "number",
        label: "the quality bar",
        why: "The committee's bar is a rating of 4.4, so the filter reads s.rating >= 4.4 — it keeps Nordic Gadgets at 4.6, Midwest Hardware at 4.4 and Alpine Audio at 4.8. Raising it to 4.8 keeps only Alpine, gutting the list to a single product.",
      },
      {
        answer: "60",
        kind: "number",
        label: "the price floor",
        why: "Premium shelf means premium ticket: p.price >= 60 drops the cheap ends of even the good suppliers' catalogs. At 100 the list shrinks to four rows and the 89.99 keyboard falls out, changing the story the committee sees.",
        noVerify: true,
      },
    ],
    distractors: ["p.stock", "p.id", "4.8", "4.0", "100"],
    walkthrough:
      "Five products clear both bars: Smart Watch S at 199.99 (Nordic Gadgets AB, 4.6), Noise-Canceling Headset at 149.99 (Midwest Hardware Co, 4.4), 4K Webcam Pro at 129 (Nordic), Studio Desktop Mic at 119 (Alpine Audio GmbH, 4.8) and Mechanical Keyboard K1 at 89.99 (Nordic). One join carries it: p.supplier_id → s.id attaches the vendor and its rating to every product. Ratings on file run 4.6, 4.1, 3.9, 4.4, 4.8 and 4.0 across six suppliers — nobody scores a 5, so the 4.4 bar is the practical ceiling short of Alpine alone. Note the near-miss trap: product ids and supplier ids overlap as number ranges, and for products 1, 4 and 5 the id-based match even lands on the right supplier — which is exactly why p.id = s.id survives casual testing and fails the audit.",
  },
  {
    id: "cs-207",
    deck: 2,
    topic: "j1",
    universe: "month-close",
    title: "Premium lines in the delivered book",
    brief:
      "From: Financial Controller. Re: close checklist item 7.\n\nBefore the delivered book gets archived I want its premium lines itemized: every line on a delivered order where the charged unit price reached 100, with the product name next to it. Order it by order id then product name so each ticket's lines sit together and the reviewers can trace every figure back to its source order.",
    ask: "Order id, product name, quantity and unit price for delivered-order lines priced at 100 or more, ordered by order id then product name.",
    template: `SELECT o.id, p.name, oi.quantity, oi.unit_price
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN products p ON {1} = p.id
WHERE o.status = {2} AND oi.unit_price >= {3}
ORDER BY o.id, {4};`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line-side foreign key",
        why: "Order lines point at the catalog through oi.product_id, so the match rule is oi.product_id = p.id. Matching oi.id = p.id pairs each line with whichever product shares its line number — a different, wrong catalog entry per row — and p.id = p.id matches everything to everything.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the fulfillment filter",
        why: "The archive covers the delivered book only, so the status filter reads 'delivered' — quoted, because it's a value. 'shipped' would pull a different 30 orders still in transit into an already-closed period, and an unquoted delivered reads as a column and errors.",
      },
      {
        answer: "100",
        kind: "number",
        label: "the premium line bar",
        why: "The controller defines premium lines as charged unit prices of 100 or more: oi.unit_price >= 100. At 120 the list thins from 31 lines to 25, and the 113-119 tier of mic lines drops out of the archive review.",
        noVerify: true,
      },
      {
        answer: "p.name",
        kind: "keyword",
        label: "the within-ticket sort",
        why: "Lines from the same ticket must sit together and read alphabetically, so the second sort key is p.name. Sorting by p.price or oi.quantity scrambles the product order within each ticket without adding anything the reviewer can trace.",
      },
    ],
    distractors: ["p.price", "oi.id", "p.id", "'shipped'", "120", "oi.quantity"],
    walkthrough:
      "Thirty-one lines across the 52 delivered orders clear the 100 bar, worth 7,976.62 in charged value, topped by the Smart Watch S at 204.19 — sold twice on order 33, the same ticket that famously paid in two installments. This query is the full two-join chain: oi.order_id → o.id attaches the ticket and its status, oi.product_id → p.id attaches the catalog name. The close-relevant discovery: oi.unit_price and the catalog price p.price disagree on every single delivered line — the ledger stores what was actually charged per line, not the list price, so any reconciliation that swaps the two columns drifts without an error. Delivered is 52 of 103 orders; the rest are 30 shipped, 14 pending and 7 cancelled.",
  },
  {
    id: "cs-208",
    deck: 2,
    topic: "j1",
    universe: "refund-audit",
    title: "Damage claims the auditor will pull",
    brief:
      "From: Refund audit, quarterly file.\n\nDamage claims are our costliest refund reason and the first thing finance pulls. Rebuild the damaged-goods list — claims of 50 or more — with each buyer's name and the order ticket beside the payout, biggest claim first, so the auditor can match every refund to the order it came off without chasing us for context.",
    ask: "Refund id, claim amount, order total and customer name for damaged-item refunds of 50 or more, biggest claim first.",
    template: `SELECT r.id, {1}, o.total AS order_total, c.name
FROM refunds r
JOIN orders o ON r.order_id = o.id
JOIN customers c ON {2} = c.id
WHERE r.reason = {3} AND r.amount >= {4}
ORDER BY r.amount DESC;`,
    slots: [
      {
        answer: "r.amount",
        kind: "keyword",
        label: "the claim paid out",
        why: "The claim's value lives on the refund row: r.amount. o.total is the whole ticket behind it — printing 444.8 where 365.98 was paid overstates the payout and the auditor's tie-out fails on row one.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the order-side bridge key",
        why: "The second hop walks the order to its buyer, so the match rule is o.customer_id = c.id. Matching o.id = c.id compares an order number to a customer number — two unrelated counters — and would join only the handful of rows where the numbers collide.",
      },
      {
        answer: "'damaged'",
        kind: "keyword",
        label: "the claim-reason filter",
        why: "The audit targets damage claims, so the filter reads 'damaged' — quoted, because it's a value. 'late_delivery' is the plausible wrong chip: a real reason, but a different file — three claims that belong to the logistics review, not this one.",
      },
      {
        answer: "50",
        kind: "number",
        label: "the materiality floor",
        why: "The brief sets materiality at 50: r.amount >= 50 keeps the 11 claims finance actually questions and leaves the small goodwill refunds out of the file. At 30 the list widens to twelve rows and the auditor asks why trivialities are in it.",
        noVerify: true,
      },
    ],
    distractors: ["o.total", "o.id", "c.id", "'late_delivery'", "100", "30"],
    walkthrough:
      "Eleven damage claims clear the 50 bar: 365.98 for Olivia Brown off a 444.8 ticket, 364.14 for Dmitri Volkov off 435.09, then Bruno Silva's 324.9 — claimed against a 752.96 order he damaged twice, once for 324.9 and once for 76.72. Two hops carry the query: r.order_id → o.id lands on the ticket, o.customer_id → c.id lands on the buyer. The column battle matters on both ends — r.amount is the payout, o.total is the ticket behind it, and no claim on file ever equals or exceeds its order total, so the two numbers never swap invisibly. Context: 14 damaged claims totaling 2,367.64 make damage our biggest refund reason, ahead of late_delivery at 546.13, changed_mind at 384.23 and wrong_item at 281.65.",
  },
  {
    id: "cs-209",
    deck: 2,
    topic: "j1",
    universe: "funnel",
    title: "Priced-in buyers for the board",
    brief:
      "From: Growth lead. Re: paid channel review.\n\nBefore I defend the acquisition budget I want the expensive touches named: every paid acquisition that cost at least 25, with the channel, the spend and the customer it bought. Cheapest-first tells the board nothing — sort it so the priciest touches lead and I can say for each whether the buyer it purchased is still worth the outlay.",
    ask: "Channel, spend, customer name and city for acquisitions that cost 25 or more, priciest first.",
    template: `SELECT a.channel, {1}, c.name, c.city
FROM acquisitions a
{2} customers c ON a.customer_id = c.id
WHERE a.spend >= {3}
ORDER BY a.spend {4};`,
    slots: [
      {
        answer: "a.spend",
        kind: "keyword",
        label: "the acquisition cost",
        why: "What the touch cost lives on the acquisition row: a.spend. a.id would print the touch's row number where a euro figure belongs, and c.name — already selected — would duplicate the buyer column instead of pricing it.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the bridge to buyers",
        why: "Acquisition rows carry a customer key but not a person, so the query bridges with a plain JOIN and lets ON pair each touch with the buyer it purchased. NATURAL JOIN can't take an ON clause here, and a bare INNER isn't a join until the word JOIN follows it.",
      },
      {
        answer: "25",
        kind: "number",
        label: "the spend floor",
        why: "The review targets touches that cost at least 25: a.spend >= 25 keeps the seven real outlays and drops the long tail of cheap touches. At 40 only three survive and the referral story disappears from the list entirely.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the spend sort direction",
        why: "Priciest first is descending: DESC. ASC would open the board deck with the 28.77 referral instead of the 41.4 email touch — the same rows in the order that makes the budget look worst.",
      },
    ],
    distractors: ["a.id", "NATURAL JOIN", "INNER", "ASC", "40", "35"],
    walkthrough:
      "Seven touches cost 25 or more, led by email at 41.4 for Isabella Rossi in Milan, search at 41.22 for Farid Nasser in Dubai, and email again at 40.53 for Liam O'Brien in Cork — email placing twice in the top three is the slide the budget defense turns on. Then referral 35.81 (Bruno Silva, São Paulo), social 33.71 (Jamal Wright, Chicago), affiliate 33.46 (Keiko Sato, Nagoya) and referral 28.77 (Hiro Tanaka, Osaka). One join does it: a.customer_id → c.id attaches the person to the paid touch. Context: 15 acquisition rows on file, the cheapest a 6.00 retargeting touch, and the spend floor at 25 is what separates the seven debatable outlays from the cheap tail. Referral earning two of the seven is the counterpoint to anyone reading the email numbers as a verdict.",
  },
];
