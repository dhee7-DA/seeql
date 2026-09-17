// Joins-deck batch j4b — multi-table money chains, cs-284..cs-291. Where the
// earlier batches taught one join's contract (j1 INNER, j2 LEFT ghosts, j3
// anti-joins), this batch teaches the CHAIN: journeys through 3+ tables where
// depth itself creates the trap. Four behaviors get the slots: fan-out
// multiplication along the hops (a claim printing once per line, a ticket
// printing once per installment, a touch printing once per touch), mid-chain
// filters that silently re-cut the endpoint answer, grain protection by
// rolling the many side up before it meets the chain, and id-space collisions
// mid-chain that fabricate pairings instead of erroring. Every figure quoted
// in prose was probed live against a read-only copy of the seed db
// (scripts/probe-j8b*.ts) before being written down.

import type { CaseStudy } from "../types";

export const casesJ4b: CaseStudy[] = [
  {
    id: "cs-284",
    deck: 2,
    topic: "j4",
    universe: "cash",
    title: "The rail-by-region settlement matrix",
    brief:
      "From: Cash desk. Re: regional rail review.\n\nThe processor's quarterly splits our 77 settled payments — 24,216.51 — by rail, but never by rail AND buyer region together, and the deck wants the matrix. Build it: one row per region-and-method pair with the payment count and the settled sum. Remember the money lives on the payment rows; the ticket total must not leak into the sum, and the region lives two hops away at the buyer.",
    ask: "Per customer region and payment method: count of settled payment rows and their settled sum, two decimals.",
    template: `SELECT c.region, p.method, COUNT(*) AS payment_rows, ROUND(SUM({1}), 2) AS settled
FROM payments p
JOIN orders o ON o.id = p.order_id
JOIN customers c ON {2}
WHERE p.status = {3}
GROUP BY {4}
ORDER BY c.region, settled DESC;`,
    slots: [
      {
        answer: "p.amount",
        kind: "keyword",
        label: "the settled money",
        why: "Each settled installment's value lives on its payment row, so the sum reads SUM(p.amount) — one number per row, no repeats. SUM(o.total) prints the whole ticket once per payment row, so split-settled tickets get their total counted twice and the matrix drifts exactly where installments exist.",
      },
      {
        answer: "c.id = o.customer_id",
        kind: "keyword",
        label: "the buyer bridge",
        why: "The order carries the buyer's key, so the last hop pairs c.id = o.customer_id. c.id = o.id compares a customer counter to a ticket counter — two unrelated id spaces that overlap for the first sixteen rows — and fabricates a five-row matrix of pairings no ledger ever made.",
      },
      {
        answer: "'settled'",
        kind: "keyword",
        label: "the settlement state",
        why: "The matrix counts money that cleared, so the arm reads 'settled' — quoted, it's a value. 'pending' re-cuts the board to the 6 authorization cells the receivables desk is chasing, and 'failed' narrows it to the single 143.86 decline. Unquoted settled hunts for a column and errors.",
      },
      {
        answer: "c.region, p.method",
        kind: "keyword",
        label: "the matrix grain",
        why: "One row per region-and-rail pair means GROUP BY c.region, p.method — the chain's endpoint joined by a comma. Dropping to p.method alone flattens 11 cells to 3 and loses the region axis entirely; grouping by c.region alone keeps regions but buries the rail mix the processor asked about.",
      },
    ],
    distractors: ["o.total", "c.id = o.id", "'pending'", "'failed'", "p.method", "c.region"],
    walkthrough:
      "Eleven cells come back, and reading them is reading the chain: payments carry the money, orders carry the ticket, customers carry the region — p.order_id → o.id → o.customer_id → c.id. The biggest cell is APAC card: 22 settled payments, 7,299.24; US wallet runs 3 rows for 1,172.30; LATAM is two cells only (bank_transfer 752.96, card 99.48). Rail totals across the matrix reconcile to the desk's book: card 53 rows / 15,793.65, wallet 13 / 3,977.17, bank_transfer 11 / 4,445.69 — 24,216.51 all told. The fan-out check is the lesson: swap SUM(p.amount) for SUM(o.total) and four cells drift — EU card 6,064.69 → 6,273.67, EU wallet 1,666.77 → 1,747.84, US card 2,330.24 → 2,589.37, US wallet 1,172.30 → 1,537.83 — because the three split-settled tickets (order 33: 365.53 card + 259.13 wallet; order 81: 81.07 card + 83.10 wallet; order 100: two card rows 65.97 and 59.91) print their full ticket once per installment. Depth didn't change the join rules; it just gave the wrong column more places to repeat.",
  },
  {
    id: "cs-285",
    deck: 2,
    topic: "j4",
    universe: "refund-audit",
    title: "Where the damaged money sits",
    brief:
      "From: Refund audit. Re: damaged-goods exposure.\n\nThe damaged-reason book holds 14 claims worth 2,367.64 this year, and the audit's first question is geographic: which buyer regions does that money come from? Walk each claim back through its ticket to the buyer, keep only damaged claims, and total the claim amounts per region — the claim amount, not the ticket it came from, because several of these claims share a ticket with a second claim.",
    ask: "Per customer region: count of damaged refund claims and their refunded sum, biggest region first.",
    template: `SELECT c.region, COUNT(r.id) AS claims, ROUND(SUM({1}), 2) AS refunded
FROM refunds r
JOIN orders o ON {2}
JOIN customers c ON c.id = o.customer_id
WHERE r.reason = {3}
GROUP BY {4}
ORDER BY refunded DESC;`,
    slots: [
      {
        answer: "r.amount",
        kind: "keyword",
        label: "the claim money",
        why: "The audited figure is what we paid out per claim, so the sum reads SUM(r.amount). SUM(o.total) sums the tickets instead — every claim on a ticket prints that ticket's full price, so Bruno Silva's twice-claimed 752.96 order alone would add 752.96 twice and the regional ranking would flip on fabricated money.",
      },
      {
        answer: "o.id = r.order_id",
        kind: "keyword",
        label: "the ticket bridge",
        why: "Refunds point back at their ticket through r.order_id, so the pairing is o.id = r.order_id. o.id = r.id matches ticket numbers to claim row numbers — overlapping counters — and returns a fabricated geography where APAC holds 7 claims instead of 4, with nothing erroring on the way.",
      },
      {
        answer: "'damaged'",
        kind: "keyword",
        label: "the damaged arm",
        why: "The audit scopes to damaged goods, so the reason reads 'damaged' — quoted, it's a value. 'late_delivery' returns the 4 shipping-claim rows instead (APAC 2, EU 2) and 'wrong_item' the 3 picking errors — real corridors, none of them this audit. Unquoted damaged reads as a column and errors.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the region grain",
        why: "The question is regional, so the chain rolls up by c.region — the column that lives two hops past the claim. GROUP BY r.reason answers 'how much damaged money per reason' (one row: 2,367.64) and GROUP BY o.status answers it per ticket state (also one row — every damaged claim sits on a delivered ticket), neither of which is the audit's cut.",
      },
    ],
    distractors: ["o.total", "r.id", "o.id = r.id", "'late_delivery'", "'wrong_item'", "r.reason"],
    walkthrough:
      "Four regions come back: EU 6 claims / 874.63, APAC 4 / 787.97, LATAM 2 / 401.62, US 2 / 303.42 — the 14-claim damaged book, 2,367.64, cut by where the buyers sit. The chain is refunds → orders → customers, and the money column decides whether the answer is honest: LATAM's 401.62 is real claim money, but swap in SUM(o.total) and LATAM jumps to 1,505.92 and tops the board — that is Bruno Silva's 752.96 ticket printed twice, once per of his two damaged claims on it. Context for the file: the whole refund book is 25 claims / 3,579.65, and APAC leads it at 9 claims / 1,674.19 across all reasons, so damaged money leaning EU is a real mix shift, not a rounding story. One more chain fact worth a line: group the damaged book by ticket status and it collapses to a single 'delivered' row — nothing was ever claimed damaged on a ticket that hadn't completed its journey.",
  },
  {
    id: "cs-286",
    deck: 2,
    topic: "j4",
    universe: "logistics",
    title: "Freight and claims on one carrier board",
    brief:
      "From: Shipments desk. Re: Monday carrier review.\n\nThe carrier board has always shown freight, and the refund desk has always shown claim money; the review wants both on one board — per carrier, leg count, freight cost, claim count and refunded money. Mind the grain: a ticket that was refunded twice must not print its leg twice, so settle the refunds to one row per ticket before they meet the shipments, and keep carriers whose legs never attracted a claim on the board at all.",
    ask: "Per carrier: shipment legs, freight cost, refund claims and refunded money on those legs, busiest freight first.",
    template: `SELECT s.carrier, COUNT(s.id) AS legs, ROUND(SUM(s.cost), 2) AS freight,
       SUM({1}) AS claims, ROUND(SUM({2}), 2) AS refunded
FROM shipments s
JOIN orders o ON o.id = s.order_id
{3} JOIN (SELECT order_id, COUNT(*) AS claims, SUM(amount) AS refunded
          FROM refunds GROUP BY order_id) r ON {4} = o.id
GROUP BY s.carrier
ORDER BY freight DESC;`,
    slots: [
      {
        answer: "r.claims",
        kind: "keyword",
        label: "the claim count",
        why: "Claims were rolled up to one row per ticket, so the board tallies SUM(r.claims) — the per-ticket claim counts added back per carrier. SUM(r.refunded) in this slot would print claim MONEY in the count column, and SUM(o.total) or SUM(s.cost) would print ticket or freight values: three different lies, all clean-running.",
      },
      {
        answer: "r.refunded",
        kind: "keyword",
        label: "the refunded money",
        why: "The rollup carries each ticket's refunded total in r.refunded, so the board sums that. SUM(r.claims) would put claim counts where money belongs (FedEx reads 5 instead of 1,149.57), SUM(s.cost) would report freight as refunds, and SUM(o.total) would report the tickets' full value — none of them the 3,579.65 the refund desk actually paid out.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "Carriers whose legs never attracted a claim must still show freight, so the rollup joins with LEFT: claim-free legs keep their row with NULLs the SUMs skip. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — deletes every claim-free leg and the board's freight collapses to only the claimed tickets' legs.",
      },
      {
        answer: "r.order_id",
        kind: "keyword",
        label: "the rollup bridge",
        why: "The rollup is keyed by ticket, so it bridges on r.order_id = o.id. s.order_id = o.id is always true — it ignores the rollup side and cross-prints every leg against every claim-carrying ticket (DHL alone inflates to 638 legs) — and o.id = o.id does the same by construction. The bridge must name the rollup's key.",
      },
    ],
    distractors: ["r.refunded", "r.claims", "INNER", "CROSS", "s.order_id", "o.id"],
    walkthrough:
      "Four carriers, one board each: DHL 29 legs / 273.40 freight / 3 claims / 375.45; LocalPost 19 / 205.84 / 11 / 1,465.20; UPS 18 / 197.32 / 6 / 589.43; FedEx 16 / 151.75 / 5 / 1,149.57 — 82 legs, 828.31 of freight, all 25 claims / 3,579.65 attributed. The rollup is the board's spine: join refunds directly and the three twice-claimed tickets (order 6, Bruno Silva's two damaged claims; orders 55 and 86, Alice Chen's doubles) print their leg once per claim, inflating LocalPost freight 205.84 → 228.76 (+8.05 +14.87) and UPS 197.32 → 212.17 (+14.85) — freight that was never billed. Swap LEFT for INNER and LocalPost's legs collapse 19 → 9 (freight 95.14): the claim-free legs that make LocalPost cheap vanish from their own row. Desk notes: FedEx carries the heaviest claim money on the fewest claims, and no claim rides an in-transit or never-dispatched leg — all 25 sit on delivered tickets, so this board and the refund ledger reconcile ticket for ticket.",
  },
  {
    id: "cs-287",
    deck: 2,
    topic: "j4",
    universe: "funnel",
    title: "The account the channel ledger prints twice",
    brief:
      "From: Growth lead. Re: acquisition ledger hygiene.\n\nOur acquisition ledger has 15 touches over 14 accounts, and when I chain touches → accounts → tickets the row count comes back too fat — one account's tickets are printing more than once. Find the account whose ledger rows outnumber its real tickets, and show the damage: raw joined rows beside the distinct ticket count. If nobody is double-printed, say so; I suspect somebody is.",
    ask: "The acquired account whose touch-chain rows exceed its distinct ticket count, with raw rows and distinct tickets.",
    template: `SELECT c.name, COUNT(*) AS raw_rows, {1}(o.id) AS orders
FROM acquisitions a
JOIN customers c ON {2} = c.id
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id
HAVING COUNT(*) {3} COUNT(DISTINCT o.id)
ORDER BY raw_rows DESC;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the ticket counter",
        why: "Distinct tickets are counted with COUNT(o.id) — one per ticket no matter how many times the chain prints it. SUM(o.id) adds ticket numbers together (Alice's column reads 2,618) and MAX(o.id) reports her newest ticket number, 101: both run clean and both are nonsense as a ticket count.",
      },
      {
        answer: "a.customer_id",
        kind: "keyword",
        label: "the touch-side key",
        why: "Touches point at their account through a.customer_id, so the ledger joins a.customer_id = c.id. a.id = c.id pairs touch row numbers to account numbers — and because Alice's second touch is row 15, it silently re-homes to customer 15 and the double-print vanishes: zero rows, false clean bill. c.id = c.id matches everything and floods the join.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the double-print test",
        why: "A double-printed account has MORE joined rows than distinct tickets, so the test is COUNT(*) > COUNT(DISTINCT o.id). Flip it to = and you get the 13 healthy accounts — the exact complement — and < returns zero, since raw rows can never undercut distinct tickets. The operator is the whole audit.",
      },
    ],
    distractors: ["SUM", "MAX", "a.id", "c.id", "o.customer_id", "="],
    walkthrough:
      "One account comes back: Alice Chen, 48 raw ledger rows over 24 real tickets — because she holds two acquisition touches (social, 21.17, November 2023; retargeting, 6.00, February 2024) and every one of her 24 tickets joins to both. She is the reason the chained ledger prints 119 rows for 103 tickets: 8 tickets are invisible to it entirely (Noah Meyer's 4 / 737.68 and Pedro Alvarez's 4 / 1,686.17 have no touch row at all, so INNER deletes them) and Alice's 24 print twice, 103 − 8 + 24 = 119. The other 13 accounts print exactly 1:1 — HAVING COUNT(*) = COUNT(DISTINCT o.id) returns them as the clean complement, which is the control that proves the test isn't just flagging big spenders. Two structural notes for the deck: the collision chip a.id = c.id doesn't error, it quietly re-pairs Alice's retargeting touch to customer 15 and reports nobody double-printed — the most dangerous kind of clean — and a per-channel rollup would never catch this, because both of Alice's touches sit in different channels; only the account-level count sees 48 against 24.",
  },
  {
    id: "cs-288",
    deck: 2,
    topic: "j4",
    universe: "supplier",
    title: "Claims per maker through five tables",
    brief:
      "From: Vendor risk desk. Re: claim attribution by maker.\n\nRefund claims name tickets, not makers, so attributing claims to suppliers means walking claims → tickets → lines → products → makers — five tables, four joins. Count the distinct claims whose ticket carries each maker's goods, and beside it the raw joined-row count, because I want to see exactly how hard the line-level hop multiplies a claim before I put either number in the review. Biggest claim count first.",
    ask: "Per supplier: distinct refund claims on tickets carrying their products, plus the raw joined-row count, biggest first.",
    template: `SELECT s.name, {1}(DISTINCT r.id) AS claims, COUNT(r.id) AS joined_rows
FROM suppliers s
JOIN products p ON {2}
JOIN order_items oi ON {3}
JOIN orders o ON o.id = oi.order_id
JOIN refunds r ON {4}
GROUP BY s.id
ORDER BY claims DESC, s.name;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the claim counter",
        why: "Distinct claims need COUNT(DISTINCT r.id): one claim even when a maker's lines multiply it. SUM(DISTINCT r.id) adds claim id numbers (Shenzhen reads 157) and MAX(DISTINCT r.id) reports the biggest claim id on file (25) — both execute, both are meaningless as a count of claims.",
      },
      {
        answer: "p.supplier_id = s.id",
        kind: "keyword",
        label: "the maker bridge",
        why: "Products point at their maker through p.supplier_id, so the first hop pairs p.supplier_id = s.id. p.id = s.id matches product row numbers to supplier row numbers and leaves exactly six products on the chain — one per house, by coincidence of small ids — shrinking every maker's book to a sliver without an error.",
      },
      {
        answer: "oi.product_id = p.id",
        kind: "keyword",
        label: "the line bridge",
        why: "Order lines point at their product through oi.product_id, so the hop reads oi.product_id = p.id. oi.id = p.id matches line numbers to product numbers — 16 coincident pairs — and oi.product_id = s.id drags the supplier id into a product-keyed column, fabricating a different chain entirely (Alpine reads 6 claims instead of 10).",
      },
      {
        answer: "r.order_id = o.id",
        kind: "keyword",
        label: "the claim bridge",
        why: "Claims attach to tickets through r.order_id, so the last hop pairs r.order_id = o.id. r.id = o.id matches claim numbers to ticket numbers and returns a fabricated attribution table — Pacific Textiles reads 12 claims instead of 7 — while r.processed_by = o.id pairs claims by who signed them. Both run clean; both are fiction.",
      },
    ],
    distractors: ["SUM", "MAX", "p.id = s.id", "oi.id = p.id", "oi.product_id = s.id", "r.id = o.id"],
    walkthrough:
      "Six makers come back, and the two columns tell the whole chain story: Shenzhen Electro 13 distinct claims over 15 joined rows, Alpine Audio GmbH 10/13, Nordic Gadgets AB 8/9, Midwest Hardware Co 7/7, Pacific Textiles 7/10, Andes Naturals SA 3/3. The joined_rows column is the fan-out made visible: the raw chain prints 57 rows, but a claim on a ticket carrying several of one maker's lines repeats once per line — Pacific's 7 claims print 10 times, Alpine's 10 print 13 — which is why the review number is COUNT(DISTINCT r.id). Scale note for the deck: 48 supplier-claim attributions come from just 25 physical claims, because a claim on a mixed-supplier ticket attributes to every maker on it — attribution, not allocation. The id-space near-misses are the audit's silent killers: p.id = s.id leaves one product per house, oi.id = p.id keeps 16 lucky lines, and r.id = o.id invents Pacific a 12-claim quarter — every one a plausible-looking board with no error anywhere.",
  },
  {
    id: "cs-289",
    deck: 2,
    topic: "j4",
    universe: "pricing",
    title: "Charged versus list, the EU ledger",
    brief:
      "From: Pricing review. Re: regional discount map.\n\nEvery line we ship carries two prices — the unit price charged on the order line and the catalog list price on the product. For the EU buyers only, build the category ledger: lines sold, and revenue at the CHARGED price, so the review can see which categories net above or below list. The quantity multiplier belongs in the money expression, and the region cut has to ride its own hop — buyers live two joins past the lines.",
    ask: "Per product category, for EU customers: line count and revenue at the charged line price, two decimals, biggest first.",
    template: `SELECT p.category, COUNT(oi.id) AS lines, ROUND(SUM({1}), 2) AS charged
FROM order_items oi
JOIN products p ON {2}
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON {4} = o.customer_id
WHERE c.region = {3}
GROUP BY p.category
ORDER BY charged DESC;`,
    slots: [
      {
        answer: "oi.unit_price * oi.quantity",
        kind: "keyword",
        label: "the charged money",
        why: "Revenue at what we actually charged is SUM(oi.unit_price * oi.quantity) — line price times units, per line. SUM(oi.unit_price) forgets the quantity multiplier (Audio reads 2,616.50 instead of 5,102.40), and SUM(p.price * oi.quantity) prices the same lines at catalog list instead — a different ledger with different winners.",
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the catalog bridge",
        why: "Lines point at their catalog product through oi.product_id, so the hop pairs p.id = oi.product_id. p.id = oi.id compares product row numbers to line row numbers — 16 coincident pairs — and the EU ledger shrinks to four categories of fabricated slivers (Audio 427.92) with no error to flag it.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region arm",
        why: "The review is scoped to EU buyers, so the arm reads 'EU' — quoted, it's a value. 'APAC' returns the Asia-Pacific ledger instead (Audio 5,162.40, a different 88 lines), 'US' and 'LATAM' their own books; unquoted EU hunts for a column and errors. The arm rides on c.region, two hops past the lines, because region lives on the buyer.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the buyer key",
        why: "The buyer bridge pairs c.id = o.customer_id — the order's foreign key against the customer's primary key. o.id = c.id compares ticket numbers to buyer numbers, and since tickets run past buyers the ledger re-pairs onto whichever account shares the ticket's number, rebuilding the category book on fictional buyers.",
      },
    ],
    distractors: ["p.price * oi.quantity", "oi.unit_price", "o.total", "p.id = oi.id", "p.supplier_id = oi.product_id", "'APAC'"],
    walkthrough:
      "Seven EU categories come back, led by Audio: 22 lines / 5,102.40 charged, then Wearables 14 / 3,886.30, Video 14 / 2,260.79, Electronics 18 / 1,855.02, Accessories 24 / 1,108.03, Apparel 7 / 530.61, Fitness 6 / 346.08 — 105 lines, 15,089.23 charged against 15,067.96 at list, 21.27 under catalog in aggregate. The per-category spread is the review's meat: Audio charges ABOVE list (5,102.40 vs 5,090.66) while Wearables sells 19.56 under (3,886.30 vs 3,905.86) — swap the money expression to p.price * oi.quantity and those two flip places, which is exactly the mistake the map exists to catch. Chain notes: the region cut rides c.region two joins past the lines — filter on supplier region instead and you'd count a different Europe entirely; and the near-miss bridge p.supplier_id = oi.product_id runs clean but fabricates Accessories into a 4,909.00 category. For contrast, the US book prices UNDER list on the whole (7,286.16 vs 7,292.52) — the map is regional, not global.",
  },
  {
    id: "cs-290",
    deck: 2,
    topic: "j4",
    universe: "people-ops",
    title: "Late-delivery money by the signer, APAC lens",
    brief:
      "From: Support ops stand-up. Re: shipping-claim accountability.\n\nFour late-delivery claims worth 546.13 were signed this year, and the accountability question is per signer — but scoped to claims our APAC buyers filed, because that corridor is the one under review. The buyer's region does not sit on the claim or the rep; it sits on the buyer, two hops past the employee who signed. Walk the chain, keep the APAC claims, and total the signed money per rep.",
    ask: "Per employee who signed one: count of APAC late-delivery claims and their refunded sum, biggest money first.",
    template: `SELECT e.name, e.role, COUNT(r.id) AS claims, ROUND(SUM({1}), 2) AS refunded
FROM refunds r
JOIN employees e ON {2}
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
WHERE r.reason = {3} AND c.region = {4}
GROUP BY e.id
ORDER BY refunded DESC;`,
    slots: [
      {
        answer: "r.amount",
        kind: "keyword",
        label: "the claim money",
        why: "The money the desk paid per claim lives in r.amount, so the ledger sums that. SUM(o.total) prints the whole ticket per claim — Maya Patel's 339.43 claim on a 416.81 ticket becomes 416.81 — and SUM(r.id) prints claim row numbers where money belongs. Both run without complaint.",
      },
      {
        answer: "e.id = r.processed_by",
        kind: "keyword",
        label: "the signer bridge",
        why: "Claims name their signer through r.processed_by, so the bridge pairs e.id = r.processed_by. e.id = r.id matches employee row numbers to claim row numbers and renames claim 1's signer to Sofia Marin — a manager who signed nothing all year. e.manager_id = r.processed_by hunts for claims signed by a manager id and returns zero rows: reps, not managers, sign.",
      },
      {
        answer: "'late_delivery'",
        kind: "keyword",
        label: "the shipping-claim arm",
        why: "The corridor under review is late deliveries, so the reason reads 'late_delivery' — quoted, it's a value. 'damaged' swaps in the goods-harm book (Ravi 3 claims / 584.06 plus Marcus Hale's 203.91) and 'wrong_item' its picking cousin — real signers, wrong audit. Unquoted, the literal hunts for a column and errors.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the buyer-region arm",
        why: "The review scopes to APAC buyers, so the region arm reads 'APAC' — quoted, a value on customers, two hops from the rep. 'EU' keeps only Ingrid Larsen's 2 claims / 122.86 and loses Ravi entirely; 'US' and 'LATAM' come back empty. The arm's placement is the point: the region re-cuts the signer board from two hops away.",
      },
    ],
    distractors: ["o.total", "r.id", "e.id = r.id", "e.manager_id = r.processed_by", "'damaged'", "'EU'"],
    walkthrough:
      "Two signers come back: Ravi Menon (rep) 1 claim / 339.43 and Carla Dominguez (rep) 1 claim / 83.84 — the APAC slice of the 4-claim, 546.13 late-delivery book. The chain explains both lines: claim 1 is Maya Patel's order 2, signed 2024-01-22 by Ravi, an APAC rep under lead Aiko Yamada; claim 23 is Grace Kim's order 92, signed 2025-01-18 by Carla — a US-based rep under manager Petra Novak signing APAC paper, which is exactly the cross-region fact the stand-up wanted surfaced. The mid-chain arm is the lesson: c.region rides two hops past the employee the rows group by, and moving it to 'EU' re-cuts the board to Ingrid Larsen alone (2 claims / 122.86 — Alice Chen's 49.48 and Pedro Alvarez's 73.38), while 'US' and 'LATAM' return nothing. The collision chip e.id = r.id doesn't error — it hands claim 1 to Sofia Marin, employee row 1, and the accountability file quietly names someone who never signed a thing. Group by e.manager_id instead and the same money rolls up to Aiko 339.43 / Marcus 122.86 / Petra 83.84 — a different cut of the same chain.",
  },
  {
    id: "cs-291",
    deck: 2,
    topic: "j4",
    universe: "fraud",
    title: "Tickets the desk paid out twice",
    brief:
      "From: Fraud spot-check. Re: double-payout sweep.\n\nTwenty-two delivered tickets carry refund claims, and the sweep's flag is simple: any ticket with MORE THAN ONE claim on file has been paid out repeatedly, and each of those needs a name and a look. Walk claims back through tickets to buyers, group per ticket, keep the multi-claim ones, and put both the claim count and the money already out on the row. Sort by ticket so the file reads in ledger order.",
    ask: "Every order with more than one refund claim: ticket id, buyer, status, total, claim count and refunded sum, by ticket id.",
    template: `SELECT o.id, c.name, o.status, o.total, {4}(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = {1}
GROUP BY {2}
HAVING COUNT(r.id) > {3}
ORDER BY o.id;`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the buyer foreign key",
        why: "The ticket holds the buyer's key, so the bridge pairs c.id = o.customer_id. c.id = o.id matches buyer numbers to ticket numbers — and ticket 6 lands on customer 6, Farid Nasser, so Bruno Silva's double-payout file prints under the wrong name with no error. o.id = o.customer_id is the same collision read backwards.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the per-ticket grain",
        why: "A double payout is a property of one TICKET, so the chain groups by o.id. GROUP BY o.customer_id folds each buyer's tickets together — Alice's two flagged tickets merge into one 6-claim row and the file under-reports; GROUP BY r.id groups per claim, where a count can never exceed 1, and the sweep returns nothing at all.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the multi-claim threshold",
        noVerify: true,
        why: "More than one claim on a ticket is the flag, so the threshold reads COUNT(r.id) > 1 — a bare number, no quotes. Raising it to 2 empties the sweep (no ticket was ever refunded three times, which is itself worth a line in the file), and comparing against a column id like r.id or c.id turns the threshold into a per-row lottery.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the claim tally",
        why: "Claims per ticket are tallied with COUNT(r.id) — rows counted, not numbers added. SUM(r.id) adds the claim ids (Bruno's two claims read 5, Alice's read 21 and 39) and MAX(r.id) prints the biggest claim id on file, 25: both sweep half the ledger on garbage arithmetic.",
      },
    ],
    distractors: ["o.id", "c.id", "r.id", "SUM", "MAX", "2"],
    walkthrough:
      "Three tickets come back, all delivered: order 6, Bruno Silva, 752.96 ticket with 2 claims / 401.62 already out (324.90 and 76.72, both damaged, both signed by Marcus Hale); order 55, Alice Chen, 113.66 with 2 / 61.52 (49.48 late_delivery plus 12.04 damaged, Ingrid Larsen); order 86, Alice Chen again, 116.28 with 2 / 74.22 (58.39 damaged plus 15.83 wrong_item, Marcus Hale). Alice owns two of the three flags — refunds ran to 54% and 64% of those tickets' value. The controls prove the sweep works: 19 of the 22 claimed tickets carry exactly one claim, and raising the threshold to 2 returns nothing — no ticket was paid three times. The collision is the fraud risk in miniature: bridge customers with c.id = o.id and Bruno's file prints under Farid Nasser's name — one shared number between two unrelated id spaces, no error anywhere. Group per buyer instead of per ticket and the file re-shapes to five accounts with Grace Kim at 4 claims / 708.59 — a different report that answers a different question.",
  },
];
