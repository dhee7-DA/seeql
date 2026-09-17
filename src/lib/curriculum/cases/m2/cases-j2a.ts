// Joins-deck batch j2a — LEFT JOIN semantics, cs-227..cs-234.
// The slot battle is preservation: keep-the-left-side, NULL-filled right arms,
// COUNT(right.id) versus COUNT(*) ghost rows, and WHERE-vs-ON placement of
// right-table filters (in WHERE they delete preserved rows; in ON they only
// filter the arm). Anti-joins here are spelled LEFT JOIN + IS NULL, not NOT
// EXISTS. Every figure quoted in prose was probed live against a read-only
// copy of the seed db (scripts/probe-j2a*.ts) before being written down.

import type { CaseStudy } from "../types";

export const casesJ2a: CaseStudy[] = [
  {
    id: "cs-227",
    deck: 2,
    topic: "j2",
    universe: "receivables",
    title: "Tickets the ledger never billed",
    brief:
      "From: Receivables, month-start reconciliation. Re: unbilled tickets.\n\nThe processor's settlement file and our orders table don't line up: a chunk of tickets have never had a single payment row written against them. I need the full unbilled list — order, buyer, value, status — biggest tickets first, so we can decide what to chase and what to write off before the close. Orders with no payment history must appear; don't let the join quietly eat them.",
    ask: "Order id, customer name, total and status for orders with no payment row at all, biggest total first.",
    template: `SELECT o.id, c.name, o.total, o.status
FROM orders o
JOIN customers c ON c.id = o.customer_id
{1} JOIN payments p ON {2} = o.id
WHERE {3} IS {4}
ORDER BY o.total DESC;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The brief needs orders that have no payment, so orders must be the preserved side: LEFT JOIN keeps all 103 tickets. INNER JOIN pairs only matched rows, the 15 unbilled orders vanish, and the result isn't a shorter list — it's an empty one.",
      },
      {
        answer: "p.order_id",
        kind: "keyword",
        label: "the payment-side foreign key",
        why: "Payments point back at orders through p.order_id, so the pairing is p.order_id = o.id. p.id = o.id compares two unrelated row counters — both id spaces run 1..91 — so it fabricates pairings and the unbilled list comes back twelve wrong rows instead of an error.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the ghost test",
        why: "A preserved order with no payment carries NULL in every payment column, so p.id IS NULL is the mark of an unbilled ticket. o.id IS NULL or c.id IS NULL can never be true — those columns are never empty — and the list would come back with nothing.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty-marker keyword",
        why: "NULL is the value a LEFT JOIN paints into the missing arm, so the test reads IS NULL. IS NOT NULL flips the query to the 88 orders that did get a payment row — the exact opposite list — and the write-off review would reconcile nothing.",
      },
    ],
    distractors: ["o.id", "o.customer_id", "INNER", "CROSS", "NOT NULL"],
    walkthrough:
      "Fifteen orders — 4,865.61 in tickets — have never had a payment row written against them, and every one is a pending (9) or cancelled (6) ticket: the ledger only writes payment rows once money is actually attempted. The list is led by order 74, Farid Nasser, 1,088.44, then order 5, Emma Wilson, 725.34, and order 1, Pedro Alvarez, 576.54. Alice Chen alone owns five unbilled tickets worth 1,071.62; Maya Patel three worth 422.74. Mechanically this is an anti-join spelled with a LEFT JOIN: all 103 orders are preserved, the 88 that paid carry payment ids, the 15 ghosts carry NULL, and WHERE p.id IS NULL keeps exactly the ghosts — an INNER JOIN returns nothing at all. Watch the near-miss: p.id = o.id looks like a join rule because both counters run 1..91, but it fabricates pairings and the list comes back twelve wrong rows. For scale: 91 payment rows on file, 77 settled for 24,216.51 — the unbilled pile is real money the cash desk never saw.",
  },
  {
    id: "cs-228",
    deck: 2,
    topic: "j2",
    universe: "logistics",
    title: "No delivery scan on file",
    brief:
      "From: Logistics desk, delivery assurance. Re: 'where is my order' calls.\n\nSupport keeps taking calls for tickets we can't actually prove arrived: no delivery timestamp on file, and some of them never even left the building. Pull every order we cannot confirm delivered — never-dispatched and in-transit together — with status and carrier beside each, so the team knows which calls are carrier chases and which are ours to answer.",
    ask: "Order id, status, carrier and freight cost for orders with no delivery timestamp, biggest ticket first.",
    template: `SELECT o.id, o.status, s.carrier, s.cost
FROM orders o
{1} JOIN shipments s ON {2} = o.id
{3} s.delivered_at {4} NULL
ORDER BY o.total DESC;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "Orders that never shipped have no shipment row at all, so the join must preserve them: LEFT JOIN keeps every order and paints the missing parcel NULL. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — keeps only the 23 matched in-transit rows and the 21 never-dispatched tickets disappear.",
      },
      {
        answer: "s.order_id",
        kind: "keyword",
        label: "the shipment-side foreign key",
        why: "Shipments point back at orders through s.order_id, so the pairing is s.order_id = o.id. o.id = o.id matches every order to every parcel — thousands of fabricated rows — and s.id = o.id pairs an order with whichever parcel happens to share its row number.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the scan test's placement",
        why: "The test must run after the join as a WHERE: it keeps matched parcels that are still in transit AND ghost rows whose whole arm is NULL — one test, both kinds of gap. Placed in the ON as an AND it becomes an arm filter instead: nothing fails it, all 103 orders return, and the chase list is meaningless.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the empty-timestamp test",
        why: "An undelivered parcel shows an empty timestamp, and the only correct test for empty is IS NULL. = NULL compares against the placeholder instead of testing for it and matches nothing; NOT belongs to IS NOT NULL, which returns the 59 confirmed deliveries instead.",
      },
    ],
    distractors: ["INNER", "CROSS", "AND", "o.id", "s.id", "NOT"],
    walkthrough:
      "Forty-four orders have no delivery scan: 14 pending and 7 cancelled that never got a shipment row at all, plus 23 shipped parcels still in the air. The top of the list is uncomfortable — order 74 (1,088.44) and order 43 (945.21) were never dispatched — then the in-transit exposure starts: LocalPost 8.62 on order 39, DHL 12.11 on order 15, DHL 10.33 on order 57. The WHERE test is the subtle part of this query: delivered_at IS NULL keeps matched parcels with an empty timestamp AND never-shipped orders whose entire shipment arm is NULL, because the ghost rows pass any IS NULL test on the right table. Swap WHERE for AND and the predicate turns into an arm filter — nothing gets deleted, all 103 orders come back with blanks where the truth used to be. IS NOT NULL flips to the 59 confirmed deliveries; = NULL matches nothing. Desk context: 82 shipments on file, 23 in transit, 21 orders never dispatched.",
  },
  {
    id: "cs-229",
    deck: 2,
    topic: "j2",
    universe: "people-ops",
    title: "The refund leaderboard, zeros included",
    brief:
      "From: Support org, quarterly workload review. Re: claim authority.\n\nThe refund ledger is the fairest measure of who actually carries claim work, and a leaderboard that only shows people with claims hides the staffers who never touch one. Build the full per-employee tally — every name on the roster, zeros included, biggest workload first — so the authority conversation starts from the whole team, not just the six who signed something.",
    ask: "Employee name, role and refund count for every employee, zeros included, biggest count first.",
    template: `SELECT e.name, e.role, {1}(r.id) AS refunds_processed
FROM employees e
{2} JOIN refunds r ON {3} = e.id
GROUP BY e.id
ORDER BY refunds_processed {4}, e.name;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the per-person tally",
        why: "The deliverable is a count of refund rows per person, so COUNT(r.id) tallies each processor's claims and prints an honest 0 for the untouched. SUM(r.id) adds id numbers — 89 for Marcus Hale, meaningless — and prints NULL for the zeros; AVG averages row ids into fractions.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "Four of the ten staffers processed no refunds and the brief wants their zeros on the board. LEFT JOIN keeps every employee and paints the missing refund side NULL; INNER deletes exactly those four rows — the leaderboard would hide its most useful fact.",
      },
      {
        answer: "r.processed_by",
        kind: "keyword",
        label: "the refund-side foreign key",
        why: "Refunds record their processor in r.processed_by, so the match rule is r.processed_by = e.id. e.id = e.id pairs every refund with every employee so every tally reads 25, and r.order_id hunts for staff whose badge number equals an order number.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the leaderboard direction",
        why: "A leaderboard reads biggest workload first: DESC. ASC would open on Carla Dominguez's single claim and bury the two sevens at the bottom — the same rows, sorted so the bottleneck reads last.",
      },
    ],
    distractors: ["SUM", "INNER", "CROSS", "r.order_id", "e.id", "ASC"],
    walkthrough:
      "Ten rows, and the shape is the story: Ingrid Larsen and Marcus Hale tie at seven claims, Ravi Menon five, Elena Petrova three, Tomas Ruiz two, Carla Dominguez one — then four zeros: Aiko Yamada, the second lead, and all three managers. The zeros survive because the LEFT JOIN preserves every employee and COUNT(r.id) prints an honest 0 where the refund arm is NULL. Two traps sit right next to the right answer: COUNT(*) would print 1 for each of the four — every ghost row still exists — and SUM(r.id) prints NULL for the zeros and id arithmetic (89 for Marcus Hale) for everyone else. INNER JOIN deletes the four zero rows outright, and the leaderboard then hides its sharpest fact: nobody above rep level except Marcus Hale has ever signed a claim. Money check: Marcus's seven claims are worth 1,128.33 while Ingrid's seven are just 679.58 — count and value diverge, and both belong on the slide.",
  },
  {
    id: "cs-230",
    deck: 2,
    topic: "j2",
    universe: "cash",
    title: "Delivered tickets with nothing settled",
    brief:
      "From: Cash desk, write-off review. Re: settlement gap in the delivered book.\n\nFinance will not sign the delivered book until we show that every delivered ticket actually settled, and the tie-out keeps failing on a handful of rows. Rebuild the query that surfaces delivered orders with no settled payment anywhere on the ledger — order, buyer, ticket value and the payment state that did or didn't come across — so the write-off memo has its exhibit A.",
    ask: "Order id, customer name, total and payment status for delivered orders with no settled payment, biggest first.",
    template: `SELECT o.id, c.name, o.total, p.status
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN payments p ON p.order_id = o.id {1} p.status = {2}
WHERE o.status = {3} AND {4} IS NULL
ORDER BY o.total DESC;`,
    slots: [
      {
        answer: "AND",
        kind: "keyword",
        label: "the arm filter's placement",
        why: "The settlement test belongs inside the ON as an arm filter: it decides which payments may pair with the order and lets non-settled arms fall through to NULL. Move it to WHERE and the query demands p.status = 'settled' AND p.id IS NULL at once — a contradiction that returns zero rows and buries the write-off.",
      },
      {
        answer: "'settled'",
        kind: "keyword",
        label: "the settlement filter",
        why: "Only money that actually cleared counts, so the arm filter reads 'settled' — quoted, it's a value. 'pending' asks for delivered tickets with no pending payment and returns fifty rows of perfectly healthy orders.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the fulfillment filter",
        why: "The write-off review covers the delivered book, so the status filter reads 'delivered' — quoted, it's a value. 'shipped' re-aims the query at six in-transit tickets that simply haven't settled yet, and 'pending' returns the whole open pile.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the ghost test",
        why: "An order whose settled arm never matched carries NULL across the whole payments side, so p.id IS NULL marks the write-off candidates. o.id, c.id and o.total are never NULL on a real order — those spellings return nothing at all.",
      },
    ],
    distractors: ["WHERE", "'pending'", "'failed'", "'shipped'", "o.id"],
    walkthrough:
      "Two rows come back and both are embarrassing: order 52, Grace Kim, 238.38, and order 10, Keiko Sato, 175.68 — 414.06 of delivered product with nothing settled, each carrying only a pending payment (bank_transfer and wallet respectively). The trick is the arm filter: AND p.status = 'settled' inside the ON means a pending payment fails the arm, falls through, and the order survives with a NULL payments side for WHERE p.id IS NULL to catch — the WHERE-vs-ON lesson in one predicate. Move the test to WHERE and the query demands p.status = 'settled' AND p.id IS NULL simultaneously: zero rows, and the write-off memo dies quietly. Context that makes these two final: 15 orders have no payment row at all, but every one is pending or cancelled, and the ledger's only failed payment (143.86 on order 82) sits on a cancelled ticket. The delivered book's settlement gap is exactly 414.06.",
  },
  {
    id: "cs-231",
    deck: 2,
    topic: "j2",
    universe: "growth",
    title: "Email's buyer list, blanks and all",
    brief:
      "From: Growth lead. Re: email channel retro.\n\nI present the email-channel retro Thursday and I need the honest version: for every customer on the books, did email ever buy them? The blanks are the story — mostly it didn't. The list must keep all sixteen rows with the spend and acquisition date where email did land; a list that drops the blanks would overstate the channel to anyone skimming it in the board pack.",
    ask: "Customer name, email-channel spend and acquisition date for every customer, alphabetical; blanks where email never bought them.",
    template: `SELECT c.name, {1}, a.acquired_at
FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id {2} a.channel = {3}
ORDER BY c.name;`,
    slots: [
      {
        answer: "a.spend",
        kind: "keyword",
        label: "the touch's cost",
        why: "What the touch cost lives on the acquisition row: a.spend. a.id prints the touch's row number where a euro figure belongs, and c.city prints a town — both real columns, both wrong currency for a channel retro.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the channel filter's placement",
        why: "The channel test belongs inside the ON as an arm filter: it picks which acquisition may pair with each customer and leaves everyone else visibly blank. Move it to WHERE and the preserved rows die — fourteen customers vanish and the retro reads as if email only ever bought two people.",
      },
      {
        answer: "'email'",
        kind: "keyword",
        label: "the channel filter",
        why: "The retro is about the email channel, so the filter reads 'email' — quoted, it's a value. 'referral' or 'search' are real channels but different retros, and an unquoted email would be read as a column name and error.",
      },
    ],
    distractors: ["WHERE", "OR", "'referral'", "'search'", "a.id", "c.city"],
    walkthrough:
      "Sixteen rows — every customer on the books — and exactly two carry an email touch: Isabella Rossi at 41.4 (acquired 2024-03-01) and Liam O'Brien at 40.53 (2024-04-21). The other fourteen print blanks, and the blanks are the slide: email has bought almost nobody. The AND in the ON is what makes this list honest — it filters which acquisition may pair with each customer and leaves everyone else visibly empty, blanks intact for the board to see. Move the predicate to WHERE and fourteen rows die: the retro would show two buyers and accidentally argue email works. OR in the ON fans out to 45 rows of nonsense pairings where every customer claims every email touch. Channel context for the deck: referral 4 touches, social 3, affiliate 3, search 2, email 2, retargeting 1 — email is the smallest paid channel on file, and this query is how you prove it without deleting the evidence.",
  },
  {
    id: "cs-232",
    deck: 2,
    topic: "j2",
    universe: "month-close",
    title: "Delivered tickets with no claim attached",
    brief:
      "From: Financial Controller. Re: close checklist item 9.\n\nBefore the delivered book is archived I want its clean side documented: delivered tickets that never attracted a refund claim, biggest first. These are the tickets finance can point to when the refund rate gets questioned at the audit. Pull order, buyer and ticket value for every delivered order with zero claims on file — and make sure tickets that were simply never refunded aren't dropped by the join.",
    ask: "Order id, customer name and total for delivered orders with zero refund claims, biggest total first.",
    template: `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN refunds r ON {1} = o.id
WHERE o.status = {2}
GROUP BY o.id
{3} COUNT({4}) = 0
ORDER BY o.total DESC;`,
    slots: [
      {
        answer: "r.order_id",
        kind: "keyword",
        label: "the refund-side foreign key",
        why: "Refunds point back at orders through r.order_id, so the pairing is r.order_id = o.id. r.id = o.id compares two unrelated counters — refunds 1..25 against orders 1..103 — and c.id = o.id pairs an order with whichever buyer shares its number; both fabricate match sets that silently reshape the clean list.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the fulfillment filter",
        why: "The close covers the delivered book, so the status filter reads 'delivered' — quoted, it's a value. 'shipped' aims the same query at thirty in-transit tickets that mostly carry no refunds either — a different, misleadingly clean list.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the group filter",
        why: "Zero refunds is a property of the whole ticket group, not of any single row, so the test belongs in HAVING. WHERE runs before groups exist and cannot see COUNT(r.id) — it errors with a misuse of aggregate.",
      },
      {
        answer: "r.id",
        kind: "keyword",
        label: "the honest ghost count",
        why: "The ghost rows a LEFT JOIN paints in carry no refund id, so COUNT(r.id) is the honest tally and prints 0 for clean tickets. COUNT(*) counts those ghosts as one each, no group passes the = 0 test, and the clean list comes back empty.",
      },
    ],
    distractors: ["e.id", "o.customer_id", "c.id", "'shipped'", "WHERE", "o.id"],
    walkthrough:
      "Thirty of the 52 delivered tickets — 9,686.86 of value — have never attracted a refund claim, and the clean list opens with Alice Chen's 705.23 (order 14), Pedro Alvarez's 668.45 (order 71) and Chloe Dubois's 659.7 (order 67). Even order 33, Emma Wilson's 624.66 split-payment ticket, sits on the clean side. The mechanics are the zeros-list shape: the LEFT JOIN preserves all 52 delivered tickets, ghost rows carry NULL where a refund id would be, and HAVING COUNT(r.id) = 0 keeps the groups the arm never filled. HAVING is not optional — zero is a group property and WHERE can't see aggregates. And the count must be COUNT(r.id): COUNT(*) counts each ghost as one, so no group passes the zero test and the clean list returns empty. Note what this query does not do: it filters the left table (o.status) in WHERE, which is safe — the placement rule only bites on right-table columns. The other 22 delivered orders carry at least one claim between them.",
  },
  {
    id: "cs-233",
    deck: 2,
    topic: "j2",
    universe: "funnel",
    title: "Spend on buyers who have since churned",
    brief:
      "From: Growth lead. Re: paid spend audit.\n\nI want every paid acquisition touch on one ledger with the buyer's name beside it — and where the buyer has since gone inactive, I want the name left blank, not the row deleted. The blank is the point: that is spend we paid for a customer who isn't here anymore. Channel, spend and name, in touch order, so the wasted placements are impossible to miss.",
    ask: "Acquisition id, channel, spend and buyer name for every paid touch, in acquisition order; blank names where the buyer has churned.",
    template: `SELECT a.id, a.channel, a.spend, c.name
FROM acquisitions a
{1} JOIN customers c ON a.customer_id = c.id {2} {3} = 1
ORDER BY a.id;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The brief wants every touch on the ledger, including the ones whose buyer has churned, so acquisitions must be the preserved side: LEFT JOIN keeps all 15 rows. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — deletes the two churned-buyer rows and the waste becomes invisible.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the churn filter's placement",
        why: "The active test belongs inside the ON as an arm filter: it decides whether the buyer side may pair and lets churned buyers fall through to a blank name. Move it to WHERE and the two blank rows are deleted outright — thirteen touches remain and nobody asks where the other two went.",
      },
      {
        answer: "c.active",
        kind: "keyword",
        label: "the churn attribute",
        why: "Churned is a customer attribute: c.active = 1 pairs only live buyers. a.spend = 1 matches no touch at all — every name comes back blank — and a.id = 1 pairs by row number, lighting up one touch regardless of whose it is.",
      },
    ],
    distractors: ["INNER", "CROSS", "WHERE", "a.spend", "a.id", "c.id"],
    walkthrough:
      "Fifteen touches come back, thirteen with names and two with blanks: touch 4, an 11.17 social buy, and touch 11, a 33.46 affiliate buy — Dmitri Volkov and Keiko Sato, both flagged inactive on the customer file. That is 44.63 of paid spend on buyers who are no longer here, and Keiko's touch is the priciest affiliate placement on the whole ledger. The LEFT JOIN is load-bearing: it keeps all fifteen touches and lets the churned buyers' arms fall through to NULL, which prints as exactly the blank the memo asked for. WHERE c.active = 1 — or an INNER JOIN, which lands on the same thirteen rows — deletes the two blanks instead, and the waste becomes structurally invisible: nobody's report is wrong, the rows just aren't there. Alice Chen appears twice, a 21.17 social touch and a 6.0 retargeting touch — two rows, one live buyer, both kept.",
  },
  {
    id: "cs-234",
    deck: 2,
    topic: "j2",
    universe: "catalog",
    title: "Products the cancellation wave missed",
    brief:
      "From: Catalog desk, cancellation post-mortem. Re: restocking signals.\n\nThe cancellation wave is behind us and I want to know which products it actually hit. Per product, count the order lines that died with a cancelled ticket — and keep the products that never appeared on one at zero, because a product the cancellations never touched is a restocking signal, not an absence. Most lines lost first, so the damage reads top down.",
    ask: "Product name and cancelled-line count for every product, zeros included, most lines lost first.",
    template: `SELECT p.name, {1}(o.id) AS cancelled_lines
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
{2} JOIN orders o ON o.id = oi.order_id AND o.status = {3}
GROUP BY p.id
ORDER BY cancelled_lines {4}, p.name;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the per-product tally",
        why: "The post-mortem counts lost lines per product, so COUNT(o.id) tallies the cancelled-order arms and prints an honest 0 for the untouched. SUM(o.id) adds order numbers — 50 for the keyboard — and prints NULL for the zeros; AVG averages row ids into meaningless fractions.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the second join's preservation",
        why: "Seven of the sixteen products never lost a line to a cancellation and the review needs their zeros. The second join must stay LEFT: INNER — or CROSS with an ON, which SQLite runs as an inner join — deletes the seven clean products and the never-cancelled shelf disappears.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the arm filter",
        why: "The review counts lines lost to cancellations, so the arm filter reads 'cancelled' — quoted, it's a value. 'delivered' would count healthy sales lines instead, three to eleven per product, and hand the desk a bestseller list where a post-mortem belongs.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the damage direction",
        why: "Most-lost-first is descending: DESC. ASC would open on the seven zero products and bury the three two-line losses at the bottom — the same rows, sorted so the post-mortem's headline reads last.",
      },
    ],
    distractors: ["SUM", "INNER", "CROSS", "'delivered'", "ASC"],
    walkthrough:
      "Twelve order lines died with cancelled tickets, spread across nine products: Studio Desktop Mic, USB-C Hub 7-in-1 and Yoga Mat Eco 6mm lost two lines each; Cycling Jersey Pro, Desk Mat Extended, HDMI 2.1 Cable, Laptop Stand, Mechanical Keyboard K1 and Noise-Canceling Headset lost one each. The other seven — 4K Webcam Pro, Bluetooth Speaker Mini, Fitness Band X2, Ring Light 14\", Running Socks 3-pack, Smart Watch S and Wireless Mouse M3 — never appeared on a cancelled ticket, and their zeros are the restocking signal. Both joins must preserve: the LEFT JOIN to orders, arm-filtered to 'cancelled', lets healthy lines fail the arm and count as nothing, and COUNT(o.id) prints the honest 0. Make the second join INNER and the seven clean products vanish — nine rows, and the post-mortem reads as if everything sells into cancellations. Swap the arm to 'delivered' and you get a bestseller list (three to eleven lines each) instead of a post-mortem.",
  },
];
