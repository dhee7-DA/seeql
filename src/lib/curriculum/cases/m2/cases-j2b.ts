// Joins-deck batch j2b — LEFT JOIN semantics, cs-235..cs-242.
// Batch 2 of the LEFT JOIN block. The slot battle stays on preservation:
// arm filters that keep ghosts alive versus WHERE filters that delete them,
// COUNT(right.id) ghost honesty against COUNT(*)/SUM, anti-join IS NULL
// spelling, id-space collisions that fabricate pairings, and owning-table
// column choice. Every figure quoted in prose was probed live against a
// read-only copy of the seed db (scripts/probe-j2b*.ts) before being written.

import type { CaseStudy } from "../types";

export const casesJ2b: CaseStudy[] = [
  {
    id: "cs-235",
    deck: 2,
    topic: "j2",
    universe: "receivables",
    title: "The open-ticket chase board",
    brief:
      "From: Receivables lead. Re: collections stand-up board.\n\nThe collections stand-up needs the open-ticket board rebuilt per account: for every customer on the books, how many pending tickets are they carrying right now? The zeros matter as much as the threes — an account with no open ticket is either fully clean or brand new, and both belong on the board. Keep all sixteen customers on the list; a join that drops the zero accounts makes the book look busier than it is.",
    ask: "Customer name and open pending-ticket count for every customer, zeros included, biggest count first.",
    template: `SELECT c.name, {1}(o.id) AS open_tickets
FROM customers c
{2} JOIN orders o ON o.customer_id = c.id {3} o.status = {4}
GROUP BY c.id
ORDER BY open_tickets DESC, c.name;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the per-account tally",
        why: "The board counts tickets per account, so COUNT(o.id) tallies each customer's pending-order arms and prints an honest 0 for the clean accounts. SUM(o.id) adds order row numbers — Alice's three open tickets would print 140 — and prints NULL where a zero belongs.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "Eight of the sixteen customers carry no pending ticket, and the brief wants their zeros. LEFT JOIN keeps every customer and paints the missing order side NULL; INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — deletes exactly those eight and the board lies by omission.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the status filter's placement",
        why: "The status test must ride inside the ON as an arm filter: it marks which orders may pair with each customer and leaves clean accounts visibly at zero. Move it to WHERE and the eight zero rows die — the board shrinks to the eight chasing targets and the clean accounts vanish.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open-ticket state",
        why: "Open means pending, quoted — it's a value. 'delivered' counts closed tickets instead (Alice would show twelve) and 'cancelled' counts dead ones — Emma drops from three to one and Chloe from two to zero, a different board with the same shape.",
      },
    ],
    distractors: ["SUM", "INNER", "CROSS", "WHERE", "'delivered'", "'cancelled'"],
    walkthrough:
      "Sixteen rows — every account — and the board reads: Alice Chen 3, Emma Wilson 3, Chloe Dubois 2, Maya Patel 2, then one each for Farid Nasser, Grace Kim, Keiko Sato and Pedro Alvarez, and eight clean zeros: Bruno Silva, Dmitri Volkov, Hiro Tanaka, Isabella Rossi, Jamal Wright, Liam O'Brien, Noah Meyer, Olivia Brown. The pending book is 14 tickets worth 6,113.00, led by order 74 (Farid Nasser, 1,088.44) and order 43 (Chloe Dubois, 945.21); Emma's three open tickets total 1,471.43, the largest single exposure on the board. The zeros are the LEFT JOIN's doing: all sixteen customers are preserved, the eight with open tickets carry order rows, the eight without carry NULL where o.id would be, and COUNT(o.id) prints an honest 0 — COUNT(*) would print 1 for every clean account, one ghost apiece, and SUM would print NULL. The AND keeps the status test in the arm; parked in WHERE it deletes the eight zeros and the board shows only accounts we already knew about.",
  },
  {
    id: "cs-236",
    deck: 2,
    topic: "j2",
    universe: "supplier",
    title: "Who builds the premium shelf",
    brief:
      "From: Category manager. Re: premium-tier sourcing review.\n\nLeadership wants to know which of our six suppliers actually build premium stock, defined as anything catalogued at 100 or more. Put every supplier on one list with their premium count — including the ones at zero, because a full catalog with no premium line is a sourcing conversation of its own. Don't let the query quietly drop the suppliers that fail the bar.",
    ask: "Supplier name and premium-item count (catalog price 100 or more) for all six suppliers, zeros included, biggest count first.",
    template: `SELECT s.name, {1}(p.id) AS premium_items
FROM suppliers s
{2} JOIN products p ON p.supplier_id = s.id {3} p.price >= {4}
GROUP BY s.id
ORDER BY premium_items DESC, s.name;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the per-supplier tally",
        why: "The review counts premium lines per supplier, so COUNT(p.id) tallies the arms that cleared the bar and prints an honest 0 for the rest. SUM(p.id) adds product row numbers into meaningless totals and prints NULL where a zero belongs.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "Three of the six suppliers stock nothing at or above the bar, and the review needs their zeros on the record. LEFT JOIN keeps all six suppliers; INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — deletes the three zeros and the shelf reads as if premium stock splits three ways.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the price bar's placement",
        why: "The bar belongs inside the ON as an arm filter: it decides which products may pair with their maker and lets under-bar catalog lines fall through to NULL. Move it to WHERE and the zero suppliers are deleted outright — the list drops from six rows to three and the sourcing conversation loses its evidence.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the premium bar",
        why: "Premium is a policy threshold, not a column value, so it never appears in the output cells — the audit can't verify it and none is needed. The bar picks the story: at 50 the board counts eight lines, at 150 only the 199.99 flagship survives, at 200 nothing does.",
      },
    ],
    distractors: ["SUM", "INNER", "WHERE", "50", "150", "200"],
    walkthrough:
      "Six rows, and the shape is the story: Nordic Gadgets AB builds two premium items — Smart Watch S at 199.99 and 4K Webcam Pro at 129 — Midwest Hardware Co one (Noise-Canceling Headset, 149.99) and Alpine Audio GmbH one (Studio Desktop Mic, 119), while Shenzhen Electro, Pacific Textiles and Andes Naturals print zeros across their 3-, 3- and 2-item catalogs. Four premium lines in a sixteen-product catalog, catalog prices running 14.99 to 199.99. The zeros survive because the LEFT JOIN preserves all six suppliers and the price bar rides in the ON as an arm filter: products under 100 fail the arm and fall through to NULL, and COUNT(p.id) prints the honest 0 — COUNT(*) would count every ghost arm as one and no supplier would read zero. Drag the bar into WHERE and the three zero suppliers are deleted; the premium shelf would look like a three-way race instead of four products from three makers. Thresholds move the argument: bar 50 counts eight lines board-wide, bar 150 leaves only Nordic's 199.99 Smart Watch S.",
  },
  {
    id: "cs-237",
    deck: 2,
    topic: "j2",
    universe: "people-ops",
    title: "Clean hands on damaged goods",
    brief:
      "From: Support org. Re: damaged-claims rotation.\n\nDamaged-goods claims are the heaviest reason code on the ledger — fourteen of our twenty-five refunds — and I'm building next quarter's rotation. First I need the clean-hands list: every staffer who has never processed a single damaged claim. They're the fresh pairs of hands the rotation needs. The list must keep both kinds of zero: people who signed other claims but never a damaged one, and people who have never signed anything.",
    ask: "Name and role of every employee with zero damaged-goods refunds processed, alphabetical.",
    template: `SELECT e.name, e.role
FROM employees e
{1} JOIN refunds r ON r.processed_by = e.id AND r.reason = {2}
WHERE {3} IS {4}
ORDER BY e.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The roster must survive whole: LEFT JOIN keeps all ten staffers and lets the arm decide who pairs. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — returns the complement: the five heavies who carry every damaged claim, and the clean hands the rotation needs are gone.",
      },
      {
        answer: "'damaged'",
        kind: "keyword",
        label: "the reason code",
        why: "The rotation is about damage, so the arm reads 'damaged' — quoted, it's a value. 'wrong_item' returns eight clean names (only Ingrid Larsen and Marcus Hale have ever signed one) and 'late_delivery' returns seven — real lists, but for a different rotation.",
      },
      {
        answer: "r.id",
        kind: "keyword",
        label: "the ghost test",
        why: "A staffer the arm never filled carries NULL across the whole refund side, so r.id IS NULL marks the clean hands. e.id IS NULL can never be true — the employee side is preserved and populated — and that spelling returns nothing at all.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty-marker keyword",
        why: "NULL is what a LEFT JOIN paints into an unfilled arm, so the test reads IS NULL. IS NOT NULL flips the query to the fourteen matched damaged-claim rows — the exact opposite list — and the rotation would be built from the people who are already loaded.",
      },
    ],
    distractors: ["INNER", "CROSS", "'wrong_item'", "'late_delivery'", "e.id", "NOT NULL"],
    walkthrough:
      "Five names come back: Aiko Yamada (the second lead), Carla Dominguez, and all three managers — Daniel Okoye, Petra Novak and Sofia Marin. The other five staffers carry every damaged claim on file: Marcus Hale 4, Ravi Menon 4, Ingrid Larsen 3, Elena Petrova 2, Tomas Ruiz 1 — fourteen claims, 2,367.64 of the refund ledger. This is an anti-join wearing a rotation hat: the LEFT JOIN preserves all ten staffers, the arm admits only damaged refunds, and WHERE r.id IS NULL keeps exactly the people the arm never filled. The AND is load-bearing — the reason test lives in the ON, so a rep's late_delivery or changed_mind claim fails the arm without deleting the person. Reason context for the plan: damaged 14 claims / 2,367.64, changed_mind 4 / 384.23, late_delivery 4 / 546.13, wrong_item 3 / 281.65 — and only Ingrid and Marcus have ever signed a wrong_item claim, which is why 'wrong_item' in the arm returns eight names instead of these five.",
  },
  {
    id: "cs-238",
    deck: 2,
    topic: "j2",
    universe: "pricing",
    title: "Under the premium bar",
    brief:
      "From: Pricing analyst. Re: premium attach-rate gap.\n\nThe premium push defines a premium line as any sold line priced at 100 or more — charged price, not catalog. I want the other side of that story: tickets that never carried one. Order, buyer and ticket value, biggest first. These are the baskets the attach campaign missed, and I need to be sure they weren't dropped by the join just because every order has lines.",
    ask: "Order id, customer name and total for orders with no line priced 100 or more, biggest total first.",
    template: `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
{1} JOIN order_items oi ON oi.order_id = o.id AND oi.unit_price >= {2}
{3} {4} IS NULL
ORDER BY o.total DESC;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "Every order has lines, but only some have premium lines: LEFT JOIN keeps all 103 orders and lets non-premium arms fall to NULL. INNER — or CROSS with an ON, which SQLite runs as an inner join — keeps only the premium side, 68 line rows, and the missed baskets vanish without a trace.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the charged-price bar",
        why: "The bar is the campaign's definition, not a value in the output, so there is nothing in the result cells to verify against. It decides the size of the gap: at 60 only 24 tickets qualify as clean, at 150 the list grows to 82 — the bar is the argument.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the ghost test's placement",
        why: "The test must run after the join as a WHERE: it keeps orders whose whole premium arm came back NULL. AND would fold it into the ON as an arm filter — an arm can never match a NULL id, so all 103 orders return with blanks and the list reads as if nobody anywhere bought premium.",
      },
      {
        answer: "oi.id",
        kind: "keyword",
        label: "the ghost test's column",
        why: "The marker has to live on the order_items side: oi.id IS NULL means no premium line paired. o.id IS NULL can never be true — the order side is preserved and populated — and that spelling returns an empty list where forty-six rows belong.",
      },
    ],
    distractors: ["INNER", "AND", "60", "150", "200", "o.id"],
    walkthrough:
      "Forty-six tickets — 7,588.71 of baskets — never carried a premium line: order 16, Emma Wilson, 507.24; order 24, Maya Patel, 419.37; order 60, Jamal Wright, 403.72; order 73, Keiko Sato, 375.93; order 36, Pedro Alvarez, 355.07 lead the list. Charged unit prices run 14.28 to 209.68 across 251 lines; 68 of those lines sit at or above 100, spread over 57 orders — the other 46 orders are this list. The query is the premium-bar anti-join: the arm (oi.order_id = o.id AND oi.unit_price >= 100) pairs an order only with its own premium lines, everything else falls through to NULL, and WHERE oi.id IS NULL keeps the ghosts. The placement battle is real here: AND in the ON turns the ghost test into an arm filter nothing can satisfy — all 103 orders return, blanks included, which reads as 'nobody bought premium anywhere'. And the bar itself moves the list: drop it to 60 and only 24 tickets qualify, raise it to 150 and 82 do.",
  },
  {
    id: "cs-239",
    deck: 2,
    topic: "j2",
    universe: "funnel",
    title: "The two marketing never bought",
    brief:
      "From: Growth lead. Re: paid-acquisition coverage audit.\n\nBefore the funnel review I want the denominator honest: which customers have never appeared on the acquisitions ledger at all — no touch, no channel, nothing? Everyone else was bought by somebody. I expect a short list; if it comes back longer, our touch log is missing rows, and if it comes back shorter, the join is eating people. Name and city, alphabetical.",
    ask: "Customer name and city for customers with no acquisition touch on file, alphabetical.",
    template: `SELECT c.name, c.city
FROM customers c
{1} JOIN acquisitions a ON a.customer_id = c.id
WHERE {2} {3} {4}
ORDER BY c.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The gaps only exist if customers are preserved: LEFT JOIN keeps all sixteen and lets untouched accounts carry a NULL acquisition side. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — returns the fourteen bought customers: the complement of the audit, not a shorter version of it.",
      },
      {
        answer: "a.id",
        kind: "keyword",
        label: "the ghost test",
        why: "A touch that doesn't exist leaves the whole acquisition side NULL, and a.id is the cleanest marker of that. c.id IS NULL can never be true — the customer side is preserved and populated — and c.city IS NULL fails for the same reason, returning nothing where two names belong.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the empty-test keyword",
        why: "Testing for the empty marker is spelled IS: a.id IS NULL. NOT alone breaks the statement — 'a.id NOT NULL' doesn't parse — and the negative form that does parse belongs in the next slot, where it flips the list to the fourteen bought customers.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty marker",
        why: "NULL is the placeholder the LEFT JOIN paints into unfilled arms, so the anti-join reads IS NULL. IS NOT NULL returns the fourteen customers marketing did buy — the list the funnel deck already has — instead of the two it doesn't.",
      },
    ],
    distractors: ["INNER", "CROSS", "c.id", "c.city", "NOT NULL"],
    walkthrough:
      "Two rows: Noah Meyer, Hamburg, and Pedro Alvarez, Madrid — the only customers the acquisitions ledger never touched. The other fourteen were all bought: referral 4 touches, social 3, affiliate 3, search 2, email 2, retargeting 1 — fifteen touches over fourteen people, because Alice Chen was bought twice (a 21.17 social touch and a 6.00 retargeting one). The mechanics are the plainest anti-join in the deck: LEFT JOIN preserves all sixteen customers, the fourteen with touches carry acquisition ids, the two without carry NULL across the whole arm, and WHERE a.id IS NULL keeps exactly those ghosts. Flip to IS NOT NULL and you get the fourteen bought customers instead. And the pairing rule is load-bearing: a.id = c.id looks plausible because both counters overlap, but it quietly pairs touch 14 — Olivia Brown's 11.68 affiliate buy — with customer 14, Noah Meyer, so the gap list comes back as Pedro alone and Noah's gap is hidden by a fabricated pairing.",
  },
  {
    id: "cs-240",
    deck: 2,
    topic: "j2",
    universe: "cash",
    title: "Pending money through the card lens",
    brief:
      "From: Cash desk. Re: card-processor mismatch follow-up.\n\nThe card processor flagged four pending authorizations they can't match to settled money, and I want the full pending book through the card lens to answer them: every pending ticket, showing the card attempt where one exists and an honest blank where none does. All fourteen pending tickets stay on the list — blanks included — or the reconciliation reads cleaner than the truth.",
    ask: "Order id, customer name, payment method and amount for every pending order, card attempts shown, blanks where no card payment exists, in order id order.",
    template: `SELECT o.id, c.name, p.method, p.amount
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN payments p ON p.order_id = o.id {1} p.method = {2}
{3} o.status = {4}
ORDER BY o.id;`,
    slots: [
      {
        answer: "AND",
        kind: "keyword",
        label: "the arm filter's glue",
        why: "The arm needs AND: a payment may pair with an order only when it belongs to that order AND is a card attempt. OR would pair every pending order with every card payment on the ledger — hundreds of fabricated rows where four honest card attempts belong.",
      },
      {
        answer: "'card'",
        kind: "keyword",
        label: "the lens",
        why: "The processor asked about card money, so the arm reads 'card' — quoted, it's a value. 'wallet' lights up a single row (order 12's 148.28 wallet attempt) and 'bank_transfer' lights up none — every pending bank_transfer shows blank, which answers a question nobody asked.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the status filter's placement",
        why: "o.status is a left-table column, so its filter runs after the join as a WHERE. Write OR instead and the arm swallows the predicate — the pair matches whenever the order is pending, every payment joins to every pending ticket, and fourteen rows drown in a thousand fabricated ones.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open-book state",
        why: "The reconciliation covers the open book, quoted: 'pending'. 'shipped' re-aims the lens at thirty in-transit tickets, 'delivered' at the closed book (fifty-three card-paired rows — one delivered order paid in two card installments), 'cancelled' at seven dead tickets.",
      },
    ],
    distractors: ["OR", "'wallet'", "'bank_transfer'", "'shipped'", "'delivered'"],
    walkthrough:
      "Fourteen rows, one per pending ticket — the whole open book, 6,113.00 — and four of them carry a card attempt: order 43, Chloe Dubois, 945.21; order 97, Emma Wilson, 585.79; order 25, Chloe Dubois, 364.71; order 79, Alice Chen, 212.03 — 2,107.74 of pending card money, the processor's four unmatched authorizations. The other ten print blanks: nine have no payment row at all, and order 12 (Maya Patel, 148.28) attempted wallet, which fails the card arm and shows blank on this lens. The arm filter AND p.method = 'card' decides which payment may pair; the blanks are the LEFT JOIN's honest output, not missing data. Placement matters twice: the status filter belongs in WHERE because o.status is the order table's column — and the wrong glue is worse than the wrong place, since OR in the arm pairs every pending order with every payment on the ledger. Ledger context: 13 pending payment rows exist (5,607.30) — the five riding on pending tickets are these; the other eight sit on tickets that already shipped or were delivered.",
  },
  {
    id: "cs-241",
    deck: 2,
    topic: "j2",
    universe: "refund-audit",
    title: "Claims without a rep's signature",
    brief:
      "From: Refund audit. Re: authority-matrix spot check.\n\nPolicy says claims are rep-signed; leads step in only as backup. For the audit I want the full 25-claim ledger with the signer's name beside each — and where the signer wasn't a rep, I want a blank, not a deletion. The blanks are exactly what the audit hunts: claims processed outside the standard authority. In claim order, please.",
    ask: "Claim id, amount, reason and signer name for every refund, names only where a rep signed, in claim id order.",
    template: `SELECT r.id, r.amount, r.reason, e.name
FROM refunds r
{1} JOIN employees e ON e.id = {2} {3} e.role = {4}
ORDER BY r.id;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "All 25 claims stay on the ledger; the seven lead-signed ones show blank names. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — keeps only the eighteen rep-signed rows and deletes exactly the claims the audit is hunting for.",
      },
      {
        answer: "r.processed_by",
        kind: "keyword",
        label: "the signer's foreign key",
        why: "Claims record their signer in r.processed_by, so the pairing is e.id = r.processed_by. r.order_id hunts for employees whose badge number equals an order number — two fabricated pairings — and r.id pairs claim 6 with whoever wears badge 6, renaming Ingrid Larsen's claim to Elena Petrova.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the role filter's placement",
        why: "The role test rides in the ON as an arm filter: it decides which signers may show their name and lets non-rep signers fall to blank. Move it to WHERE and the seven lead-signed claims are deleted outright — eighteen rows, blanks gone, and the authority gap disappears from the record.",
      },
      {
        answer: "'rep'",
        kind: "keyword",
        label: "the authority level",
        why: "Standard authority is the rep desk, quoted: 'rep'. 'lead' shows only the backup signer's seven claims named — all Marcus Hale's — and 'manager' shows no names at all, because no manager has ever signed a claim.",
      },
    ],
    distractors: ["INNER", "WHERE", "'lead'", "'manager'", "r.order_id", "r.id"],
    walkthrough:
      "Twenty-five claims, eighteen names, seven blanks — and every blank is Marcus Hale. The five reps sign everything else: Ingrid Larsen 7 claims (679.58), Ravi Menon 5 (955.09), Elena Petrova 3, Tomas Ruiz 2, Carla Dominguez 1; the three managers signed nothing, ever. The blanks exist because the role test rides in the arm: e.role = 'rep' decides which employees may pair with their claims, and Marcus's seven — 1,128.33 in all, led by the 324.90 damaged claim r2 — fail it and print NULL. That is the audit's exhibit: lead-signed backup activity, visible only if the join preserves it. INNER JOIN deletes the seven rows and the gap vanishes; the arm flipped to 'manager' blanks all twenty-five names, and 'lead' lights up exactly Marcus's seven. The pairing rule is load-bearing too: e.id = r.order_id fabricates two pairings out of badge-number coincidence, and e.id = r.id renames claim 6 from Ingrid Larsen to Elena Petrova — wrong names that no error message flags.",
  },
  {
    id: "cs-242",
    deck: 2,
    topic: "j2",
    universe: "catalog",
    title: "Sourcing below the rating bar",
    brief:
      "From: Catalog desk. Re: supplier quality bar.\n\nSourcing set a 4.5 rating bar for the next catalog cycle. Before we renegotiate I want the under-bar shelf: every product whose maker is rated below 4.5. On the printout the supplier column must stay blank where the bar fails — the blank is the flag the buyer scans for — so don't fill it in and don't let the join drop the products. Product name first, alphabetical.",
    ask: "Product name with supplier name and rating for products whose supplier is rated below 4.5, blank supplier where the bar fails, alphabetical.",
    template: `SELECT p.name, s.name AS supplier, s.rating
FROM products p
LEFT JOIN suppliers s ON s.id = {1} AND {2} >= {3}
{4} s.id IS NULL
ORDER BY p.name;`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the maker's foreign key",
        why: "Products point at their maker through p.supplier_id, so the pairing is s.id = p.supplier_id. s.id = p.id compares two unrelated counters — both start at 1 — and flags fourteen rows instead of eleven, including products whose makers actually cleared the bar.",
      },
      {
        answer: "s.rating",
        kind: "keyword",
        label: "the measured attribute",
        why: "The bar measures the supplier's quality, which lives on the supplier row: s.rating >= 4.5. p.price >= 4.5 would test the product's own price — every catalog price clears 4.5 (cheapest 14.99), nothing fails the arm, and the flag list comes back empty.",
      },
      {
        answer: "4.5",
        kind: "number",
        noVerify: true,
        label: "sourcing's bar",
        why: "The bar is policy, not data, so it never appears in the output cells to verify. It sets the size of the shelf: at 4.0 only the three Pacific Textiles items (3.9) are flagged; at 4.8 fourteen products are — the number is the argument.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the ghost test's placement",
        why: "The flag test runs after the join: WHERE s.id IS NULL keeps products whose supplier arm never filled. AND would fold it into the arm — an arm demanding s.id IS NULL can never match, all sixteen products come back flagged, and the under-bar shelf drowns in false positives.",
      },
    ],
    distractors: ["p.price", "p.id", "4.0", "4.4", "4.8", "AND"],
    walkthrough:
      "Eleven products come back flagged, and the supplier column is blank on every one: Midwest Hardware Co (rated 4.4) accounts for three of them, Shenzhen Electro (4.1) three, Andes Naturals (4.0) two and Pacific Textiles (3.9) three. Only Alpine Audio GmbH (4.8, two products) and Nordic Gadgets AB (4.6, three) clear the bar. The rating bar rides in the ON as an arm filter, so an under-bar supplier fails the arm and the product survives with a NULL supplier side for WHERE s.id IS NULL to catch — the blank is the flag. Every product has a supplier on file, so these gaps come from the bar, not from absent rows. Two near-misses to institutionalize: s.id = p.id pairs products and suppliers by row-number coincidence and flags fourteen rows — the eleven real gaps plus three products from Nordic and Alpine whose makers cleared the bar — and p.price >= 4.5 measures the wrong table's column, failing nothing (cheapest catalog price 14.99) and flagging nobody.",
  },
];
