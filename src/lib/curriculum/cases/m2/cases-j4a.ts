// Joins-deck batch j4a — multi-table chains, cs-276..cs-283. Batches j1/j2/j3
// taught the pair, the ghost and the gap; this batch teaches the CHAIN: three
// to five tables deep, where depth itself creates the trap. A buyer's basket
// fans out twice before a supplier name appears; a mid-chain state filter
// reshapes the far endpoint; attribution flows processor→claim→ticket→buyer;
// channel money drifts because a double-touched account counts twice. The
// id spaces collide at every hop (o.id/c.id, oi.id/o.id, oi.id/p.id,
// s.id/o.id, r.id/e.id, p.id/o.id), so the ON rule — not the join keyword —
// carries the lesson. Every figure quoted in prose was probed live against a
// read-only copy of the seed db (scripts/probe-j8a*.ts) before being written.

import type { CaseStudy } from "../types";

export const casesJ4a: CaseStudy[] = [
  {
    id: "cs-276",
    deck: 2,
    topic: "j4",
    universe: "supplier",
    title: "The bench behind one basket",
    brief:
      "From: Vendor management. Re: QBR prep, Emma Wilson.\n\nEmma Wilson is the biggest single account on the books — seventeen tickets, 6,640.56 — and her QBR deck needs the supply side of that: which makers actually sit behind her basket? Her tickets fan out into lines and the lines point at products before a supplier name ever appears, so this walks four joins deep. Board per maker: name, region, and how many of her order lines each one fills.",
    ask: "Each supplier behind Emma Wilson's basket with her line count per maker, alphabetical.",
    template: `SELECT s.name, s.region, COUNT(*) AS lines
FROM customers c
JOIN orders o ON {1} = c.id
JOIN order_items oi ON {2} = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON {3} = p.supplier_id
WHERE c.name = {4}
GROUP BY s.id
ORDER BY s.name;`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the ticket-to-buyer link",
        why: "Orders point back at their buyer through o.customer_id, so the first hop reads o.customer_id = c.id. o.id = c.id compares an order's row number against a customer's row number — two unrelated counters that overlap by coincidence — and pairs Emma with whichever tickets happen to share her id.",
      },
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line-to-ticket link",
        why: "Order lines reference their ticket through oi.order_id, so the second hop is oi.order_id = o.id. oi.id = o.id pairs each line with whatever ticket shares its row number — no error, just fabricated journeys — and o.id = o.id matches every line to every one of her tickets, seventeen times over.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the maker-side key",
        why: "The supplier side of the pairing is s.id, reached through the product's foreign key: s.id = p.supplier_id. p.id = p.supplier_id compares a product's row number with its maker's — the two id spaces overlap for the low-numbered rows — and oi.id = p.supplier_id pairs lines with makers by row-number accident.",
      },
      {
        answer: "'Emma Wilson'",
        kind: "keyword",
        label: "the account filter",
        why: "The basket belongs to a named account, so the filter reads c.name = 'Emma Wilson' — quoted, it's a value. 'Alice Chen' runs the same chain through a different basket (Alice buys 50 lines, not 46, in a different mix), and the unquoted Emma Wilson hunts for two columns named Emma and Wilson and errors.",
      },
    ],
    distractors: ["o.id", "oi.id", "p.id", "c.id", "'Alice Chen'", "Emma Wilson"],
    walkthrough:
      "Six makers sit behind Emma's basket, and the fan-out is the story: 17 tickets fan into 46 order lines, and those 46 lines collapse onto just six suppliers — Shenzhen Electro leads her shelf with 14 lines across 12 tickets, Nordic Gadgets AB fills 10, Pacific Textiles 8, Midwest Hardware Co 6, and Alpine Audio GmbH and Andes Naturals SA 4 apiece. The chain earns its depth: customers → orders → order_items → products → suppliers is four joins, and each hop is a different id space — customer ids, ticket ids, line ids, product ids, maker ids all count from 1, so a typo like oi.id = o.id still runs and 'finds' 17 pairings that never happened. The row count tells you when the chain is honest: 46 lines in, six groups out, and no maker repeated. For the QBR: Emma touches every vendor on the desk — her spend is broad, not deep — and Shenzhen's 14 lines make them the account's quiet anchor.",
  },
  {
    id: "cs-277",
    deck: 2,
    topic: "j4",
    universe: "growth",
    title: "Tickets, not lines, from the maker side",
    brief:
      "From: Growth lead. Re: regional demand board.\n\nThe EU slide needs the maker view of demand, and the board defined the unit carefully: TICKETS. One EU ticket carrying three Nordic lines is one ticket, not three. Walk the chain the way goods flow — supplier → products → lines → tickets → buyers — and count each maker's distinct EU tickets. All six vendors sell into Europe; the spread between them is the slide.",
    ask: "Distinct EU-customer ticket count per supplier, alphabetical by supplier.",
    template: `SELECT s.name, COUNT(DISTINCT {1}) AS eu_tickets
FROM suppliers s
JOIN products p ON {2} = s.id
JOIN order_items oi ON {3} = p.id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = {4}
WHERE c.region = 'EU'
GROUP BY s.id
ORDER BY s.name;`,
    slots: [
      {
        answer: "o.id",
        kind: "keyword",
        label: "the ticket counter",
        why: "The board counts tickets, and ticket identity lives on orders: COUNT(DISTINCT o.id) collapses the many-lines-per-ticket fan-out back to one row per EU ticket. COUNT(DISTINCT oi.id) counts lines — Midwest's 24 lines are only 20 tickets — COUNT(DISTINCT o.status) counts states, four at most, and COUNT(DISTINCT s.id) is 1 inside every supplier group.",
      },
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the product-to-maker link",
        why: "Products point at their maker through p.supplier_id, so the first hop reads p.supplier_id = s.id. p.id = s.id compares a product's row number against a supplier's — they overlap on the low ids, so half the catalog silently pairs with the wrong vendor or drops out entirely.",
      },
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line-to-product link",
        why: "Order lines reference the product they sold through oi.product_id, so the hop is oi.product_id = p.id. oi.id = p.id pairs lines with products by shared row number — fabricated matches — and p.id = p.id is always true, waving every line in the store through to every product and inflating every count.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the ticket-to-buyer link",
        why: "The region lives on the buyer, so the last hop is o.customer_id = c.id. o.id = c.id pairs tickets with buyers by row-number coincidence, and c.id = c.id is always true — every ticket pairs with every customer, and the EU filter then runs against a crowd that never bought anything.",
      },
    ],
    distractors: ["oi.id", "p.id", "s.id", "c.id", "o.status", "r.order_id"],
    walkthrough:
      "EU demand by maker, in tickets: Midwest Hardware Co 20, Nordic Gadgets AB 18, Pacific Textiles 16, Shenzhen Electro 14, Andes Naturals SA 13, Alpine Audio GmbH 12 — every vendor on the desk sells into Europe. The COUNT(DISTINCT o.id) is the load-bearing part: the chain fans supplier→products→lines→tickets, so Midwest's 20 tickets arrive carrying 24 lines and Alpine's 12 carry 13; count lines and the board overstates ticket demand by exactly the multi-line tickets. Eight EU accounts generate all of it — Alice Chen alone sits under 50 of the 105 EU lines. Direction note: this query starts at the dimension and walks demand forward, the reverse of the basket queries that start at the buyer — same five tables, opposite current. Swap the arm and the board moves: 'US' gives 5/5/5/10/7/14 (Shenzhen dominates the two-account US region), 'APAC' 16/7/20/9/12/11, and 'LATAM' returns just three makers with one or two tickets each — Alpine, Nordic, Shenzhen — the region so thin its entire demand is five lines.",
  },
  {
    id: "cs-278",
    deck: 2,
    topic: "j4",
    universe: "people-ops",
    title: "Whose money Ingrid signed",
    brief:
      "From: Support org. Re: processor attribution audit.\n\nIngrid Larsen signed seven refund claims last quarter, and the attribution audit wants the buyer side of her book: which customers' money did she actually return, and how many claims did each of them cost her? The walk runs employee → refunds → tickets → buyers — three joins — and every hop crosses a different id space, so the ON rule is the whole audit.",
    ask: "Each customer with a refund claim signed by Ingrid Larsen, with her claim count per buyer, alphabetical.",
    template: `SELECT c.name, c.region, COUNT(r.id) AS claims_signed
FROM employees e
JOIN refunds r ON {1} = e.id
JOIN orders o ON {2} = o.id
JOIN customers c ON c.id = {3}
WHERE {4} = 'Ingrid Larsen'
GROUP BY c.id
ORDER BY c.name;`,
    slots: [
      {
        answer: "r.processed_by",
        kind: "keyword",
        label: "the claim-to-signer link",
        why: "Refunds record who signed them in r.processed_by, so the arm is r.processed_by = e.id. r.id = e.id pairs claim 1 with employee 1, claim 2 with employee 2 — the id spaces collide for the first ten rows and the audit reads whoever's row numbers line up. e.id = e.id matches every claim to every signer.",
      },
      {
        answer: "r.order_id",
        kind: "keyword",
        label: "the claim-to-ticket link",
        why: "A claim points at the ticket it refunds through r.order_id, so the hop is r.order_id = o.id. r.id = o.id pairs claim 6 with ticket 6 by row-number accident — a different ticket, a different buyer, no error raised — and o.id = o.id waves every claim through to every ticket on file.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the ticket-to-buyer link",
        why: "Tickets carry their buyer in o.customer_id, so the last hop is c.id = o.customer_id. o.id = c.id would attribute Ingrid's claims to whichever customers share ticket numbers, and e.id = c.id attributes them to staff row numbers — the buyers column fills with the org chart instead of the customer base.",
      },
      {
        answer: "e.name",
        kind: "keyword",
        label: "the signer filter",
        why: "The audit scopes one signer, so the filter reads e.name = 'Ingrid Larsen' — quoted, it's a value. e.role = 'Ingrid Larsen' matches no role and empties the audit; c.name = 'Ingrid Larsen' hunts for a customer named Ingrid and finds none — the filter has to land on the employees table, where the name lives.",
      },
    ],
    distractors: ["r.id", "o.id", "e.id", "e.role", "c.name", "o.total"],
    walkthrough:
      "Six buyers make up Ingrid's book: Alice Chen drew two claims (both on order 55 — a 49.48 late-delivery and a 12.04 damage), while Chloe Dubois (75.29, the mispick), Dmitri Volkov (364.14, her biggest), Isabella Rossi (42.48), Noah Meyer (62.77) and Pedro Alvarez (73.38) drew one apiece — seven claims, 679.58 in all, and the COUNT(r.id) per buyer is what separates Alice's two-claim ticket from the six singles. The chain is attribution flowing backwards: employee → the claims she signed → the tickets those claims refund → the buyers who own the tickets. Every one of Ingrid's six buyers sits in the EU region, which is no accident — she's the EU desk's rep, and her book mirrors her patch. The near-misses the audit has to rule out: r.id = e.id 'succeeds' for the first ten claim/staff pairs and invents a completely different roster; r.order_id = e.id pairs her with claim-amount tickets by accident; only r.processed_by carries the actual signature.",
  },
  {
    id: "cs-279",
    deck: 2,
    topic: "j4",
    universe: "cash",
    title: "Channel cash that won't tie out",
    brief:
      "From: Cash desk. Re: marketing attribution tie-out.\n\nGrowth attributes settled cash to its acquisition channel, and when their query runs the channels sum to more than the processor's 24,216.51 — but the desk needs the rebuild on record before anyone re-derives it. Walk acquisition touch → buyer → ticket → payment and sum settled money per channel exactly as their spec says: acquisitions → customers → orders → payments.",
    ask: "Settled payment cash per acquisition channel, alphabetical by channel.",
    template: `SELECT a.channel, ROUND(SUM({1}), 2) AS settled_cash
FROM acquisitions a
JOIN customers c ON {2} = a.customer_id
JOIN orders o ON {3} = c.id
JOIN payments p ON {4} = o.id
WHERE p.status = 'settled'
GROUP BY a.channel
ORDER BY a.channel;`,
    slots: [
      {
        answer: "p.amount",
        kind: "keyword",
        label: "the settled money",
        why: "Cash lives one value per payment row, so the sum reads SUM(p.amount). SUM(o.total) re-sums the whole ticket once per payment row — a split-payment order's total counts twice — and SUM(a.spend) sums the ad spend that bought the account, a few euros against hundreds of cash.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the touch-to-buyer link",
        why: "Acquisition touches point at the account they bought through a.customer_id, so the pairing is c.id = a.customer_id. a.id = c.id compares the touch's row number with the customer's — they happen to collide on several rows, quietly re-attributing accounts — and a.customer_id = a.customer_id matches every touch to every buyer.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the ticket-to-buyer link",
        why: "Orders carry their buyer in o.customer_id, so the hop is o.customer_id = c.id. o.id = c.id pairs tickets with buyers by shared row number, a.id = c.id re-uses the acquisition key against the customer table, and both still execute — the cash just lands in the wrong channels.",
      },
      {
        answer: "p.order_id",
        kind: "keyword",
        label: "the payment-to-ticket link",
        why: "Payments point at the ticket they settle through p.order_id, so the hop is p.order_id = o.id. p.id = o.id pairs payment 1 with ticket 1 by row number — the two id spaces overlap across 91 and 103 rows — and o.id = o.id joins every payment to every ticket, multiplying the book.",
      },
    ],
    distractors: ["o.total", "a.spend", "p.id", "a.id", "o.id", "a.customer_id"],
    walkthrough:
      "The rebuilt board: referral 8,682.90, social 5,905.12, affiliate 4,882.94, retargeting 4,660.26, search 1,728.54, email 1,659.03 — 27,518.79 against the processor's 24,216.51, and the drift is structural, not a bug. Two forces cancel in part. Alice Chen carries TWO acquisition touches (social plus a 6.00 retargeting retry), so the chain reaches her settled cash twice: +4,660.26. And two organic accounts — Noah Meyer (248.35) and Pedro Alvarez (1,109.63) — have no acquisition row at all, so the INNER joins through acquisitions silently drop their settled money: −1,357.98. Net: +3,302.28. The chain itself is honest — each ON is the real foreign key — which is exactly the lesson: a correct-looking chain inherits every shape anomaly of the tables it walks, double-touches included. Swap the money column to o.total and referral alone jumps to 9,307.56 because split-payment tickets repeat per installment. The desk's note for growth: attribute accounts, not cash, or dedupe the double-touched first.",
  },
  {
    id: "cs-280",
    deck: 2,
    topic: "j4",
    universe: "fraud",
    title: "Three mispicks, seven shelves",
    brief:
      "From: Fraud spot-check. Re: wrong_item pattern.\n\nThree wrong_item claims are on file — 281.65 across orders 34, 68 and 86 — and before we blame a picker shift I want each claim traced to the actual products sitting on those tickets. The walk is refunds → orders → lines → products, and it crosses three id spaces that all start counting at 1, so a lazy ON will still run and name products that were never claimed.",
    ask: "Each order line behind a wrong_item refund: claim id, ticket, product name and quantity, ordered by claim then line.",
    template: `SELECT r.id AS claim, o.id AS ticket, p.name AS product, oi.quantity
FROM refunds r
JOIN orders o ON o.id = {1}
JOIN order_items oi ON {2} = o.id
JOIN products p ON p.id = {3}
WHERE r.reason = {4}
ORDER BY r.id, oi.id;`,
    slots: [
      {
        answer: "r.order_id",
        kind: "keyword",
        label: "the claim-to-ticket link",
        why: "A claim names the ticket it refunds in r.order_id, so the join is o.id = r.order_id. r.id = o.id pairs claim 7 with ticket 7 by row-number accident — a different order, different shelf — and o.id = o.id matches every claim to every ticket on file, turning three claims into the whole refund book.",
      },
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line-to-ticket link",
        why: "Order lines live on their ticket through oi.order_id, so the hop is oi.order_id = o.id. oi.id = o.id pairs line 34 with ticket 34 — the id spaces overlap across 251 lines and 103 tickets — and names products from tickets nobody refunded. r.order_id = o.id looks similar but leaves oi unfiltered, cross-joining every line to every claim.",
      },
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line-to-product link",
        why: "The shelf entry is reached through oi.product_id = p.id. p.id = oi.id compares product row numbers with line row numbers — they overlap on the low ids and land empty or wrong here — and p.id = p.id is always true, pairing each claim with all sixteen products instead of the ones on its ticket.",
      },
      {
        answer: "'wrong_item'",
        kind: "keyword",
        label: "the reason code",
        why: "The pattern under audit is mispicks, so the arm reads r.reason = 'wrong_item' — quoted, it's a value. 'damaged' traces 34 lines and 'late_delivery' 10 — real claims, different investigations — and the unquoted wrong_item hunts for a column named wrong_item and errors before the audit starts.",
      },
    ],
    distractors: ["r.id", "oi.id", "p.id", "'damaged'", "'late_delivery'", "wrong_item"],
    walkthrough:
      "Seven order lines sit behind the three mispick claims: claim 7 (order 34, Chloe Dubois, 75.29) covers Laptop Stand Aluminum and a quantity-2 Ring Light 14\"; claim 14 (order 68, Grace Kim, 190.53) covers four lines — Studio Desktop Mic ×2, Noise-Canceling Headset ×2, Bluetooth Speaker Mini, Running Socks ×3; claim 20 (order 86, Alice Chen, 15.83) is a quantity-3 Ring Light again. So the pattern has a shape: Ring Light 14\" appears on two different mispick tickets, five units in all — the item to pull from the pick face, not the pickers. The chain crossed three id spaces to get here, and each has a lazy twin that still executes: r.id = o.id pairs 8 claims with tickets by row number, oi.id = o.id pairs exactly 3 fabricated lines — it would name a Headset and Running Socks as the mispicks on orders that were never refunded — and p.id = oi.id lands empty. Three claims → 7 lines is the honest fan-out; every collision pretends the chain is shorter than it is.",
  },
  {
    id: "cs-281",
    deck: 2,
    topic: "j4",
    universe: "month-close",
    title: "The cancellation shelf, archived",
    brief:
      "From: Financial Controller. Re: close checklist, cancellation archive.\n\nThe cancelled book archives this quarter at seven tickets and 1,152.49, and the close binder wants the lines themselves: every cancelled order line with its product and maker attached. The cancelled state lives on the ticket, so start at the fact table and walk outward — orders → lines → products → suppliers — three joins, and the mid-chain filter is what shapes the far endpoint.",
    ask: "Every line on a cancelled order with ticket, product, supplier and quantity, ordered by ticket then line.",
    template: `SELECT o.id AS ticket, p.name AS product, s.name AS supplier, oi.quantity
FROM orders o
JOIN order_items oi ON {1} = o.id
JOIN products p ON p.id = {2}
JOIN suppliers s ON {3} = p.supplier_id
WHERE o.status = {4}
ORDER BY o.id, oi.id;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line-to-ticket link",
        why: "Lines attach to their ticket through oi.order_id, so the hop is oi.order_id = o.id. oi.id = o.id pairs line 7 with ticket 7 by row number — 251 line ids and 103 ticket ids overlap — and files products under cancelled tickets that never contained them, with no error to flag it.",
      },
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line-to-product link",
        why: "Each line names its product through oi.product_id, so the hop reads p.id = oi.product_id. p.id = oi.id compares product row numbers with line row numbers — overlapping id spaces that fabricate shelf entries — and p.id = p.id matches every line to every product, tripling the archive with stock that was never ordered.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the maker-side key",
        why: "The maker is reached through the product's foreign key: s.id = p.supplier_id. p.id = p.supplier_id pairs products with the supplier that shares their row number — six coincidental matches — and oi.product_id = p.supplier_id skips the product table entirely, pairing makers with line numbers.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the dead-ticket state",
        why: "The archive is the cancellation wave, so the mid-chain filter reads o.status = 'cancelled' — quoted, it's a value. 'pending' archives 36 lines of live demand, 'delivered' 119 and 'shipped' 84 — all real flows, none of them dead — and the state has to sit on the ticket, three tables before the maker's name appears.",
      },
    ],
    distractors: ["oi.id", "p.id", "o.total", "'pending'", "'delivered'", "'shipped'"],
    walkthrough:
      "Twelve lines make the archive: order 7 (USB-C Hub ×3), order 21 (HDMI Cable, Studio Desktop Mic), order 50 (Mechanical Keyboard K1), order 51 (Desk Mat Extended), order 82 (Noise-Canceling Headset — 143.86, the wave's single biggest line), order 83 (four lines: Cycling Jersey ×2, Laptop Stand ×2, Yoga Mat ×2, Studio Desktop Mic), and order 95 (USB-C Hub ×3, Yoga Mat ×2). By maker: Midwest Hardware Co and Pacific Textiles 4 lines apiece, Alpine Audio GmbH 3, Nordic Gadgets AB 1 — and the two houses absent from this shelf, Andes Naturals SA and Shenzhen Electro, are exactly the clean-vendor list the cancellation anti-join produced two batches ago; same data, walked forward instead of tested backwards. The mid-chain filter is the shaper: o.status sits on the ticket, the chain's first table, and changing the literal re-scopes the entire far endpoint — 'pending' would archive 36 lines of live demand. Collision note for the binder: oi.id = o.id still runs and files seven fabricated lines under cancelled tickets; s.id = p.id reduces the archive to six row-number coincidences.",
  },
  {
    id: "cs-282",
    deck: 2,
    topic: "j4",
    universe: "funnel",
    title: "What the referral four buy",
    brief:
      "From: Lifecycle marketing. Re: referral scale-up case.\n\nReferral spent 89.02 across four touches this year — Bruno Silva, Emma Wilson, Hiro Tanaka, Maya Patel — and the scale-up case needs their actual baskets: what did the referral four put on order lines? Walk touch → buyer → ticket → line → product, five tables, and count each product's lines across the cohort. The board sorts by volume so the argument leads.",
    ask: "Line count per product across the referral cohort's orders, highest volume first.",
    template: `SELECT p.name, COUNT(*) AS lines
FROM acquisitions a
JOIN customers c ON {1} = a.customer_id
JOIN orders o ON {2} = c.id
JOIN order_items oi ON {3} = o.id
JOIN products p ON p.id = oi.product_id
WHERE a.channel = {4}
GROUP BY p.id
ORDER BY COUNT(*) DESC, p.name;`,
    slots: [
      {
        answer: "c.id",
        kind: "keyword",
        label: "the touch-to-buyer link",
        why: "Acquisition touches point at the account they bought through a.customer_id, so the pairing is c.id = a.customer_id. c.name = a.customer_id compares a name against a number and pairs nothing, and o.customer_id = a.customer_id is out of scope here — the orders table hasn't been joined yet.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the ticket-to-buyer link",
        why: "Tickets carry their buyer in o.customer_id, so the hop is o.customer_id = c.id. o.id = c.id pairs tickets with buyers by shared row number — ten coincidental collisions — and a.id = c.id never mentions orders at all, so every ticket in the store pairs with every touch and the board counts the whole book four times over.",
      },
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line-to-ticket link",
        why: "Lines live on their ticket through oi.order_id, so the hop is oi.order_id = o.id. oi.id = o.id pairs line 35 with ticket 35 by row-number accident — 251 lines, 103 tickets, real overlap — and o.id = o.id matches every line on file to every cohort ticket, flooding the board with unreferral demand.",
      },
      {
        answer: "'referral'",
        kind: "keyword",
        label: "the channel arm",
        why: "The cohort is referral-bought, so the arm reads a.channel = 'referral' — quoted, it's a value. 'affiliate' ranks a different four-account basket with Studio Desktop Mic on top, 'social' and 'email' run their own smaller boards, and unquoted referral hunts for a column named referral and errors.",
      },
    ],
    distractors: ["'affiliate'", "'social'", "'email'", "referral", "o.id", "oi.id"],
    walkthrough:
      "The referral four's board, by volume: Wireless Mouse M3 11 lines, Desk Mat Extended 9, Noise-Canceling Headset 8, then 4K Webcam Pro, HDMI 2.1 Cable and Laptop Stand Aluminum at 7 — and the kicker is the coverage: sixteen products on the board means the referral cohort has bought EVERY product in the catalog at least once, with USB-C Hub 7-in-1 (a single line) the only thin spot. The fan-out explains the breadth: four touches → four buyers → 35 tickets → 89 order lines, and Emma Wilson alone contributes 46 of those lines — the channel's story is really one whale plus three regulars. The near-miss worth filing: the referral touch ids (2, 5, 8, 13) coincide exactly with Bruno's, Emma's, Hiro's and Maya's customer ids, so the lazy pairing a.id = c.id reproduces this exact board — right here, by pure luck — while silently mis-attributing every other channel. That's why the chip isn't in the bank and why the rule is the foreign key, never the row number. For the deck: 89.02 of spend covering the full catalog is the scale-up argument, with the whale risk attached.",
  },
  {
    id: "cs-283",
    deck: 2,
    topic: "j4",
    universe: "receivables",
    title: "Money pending, goods gone",
    brief:
      "From: Receivables lead. Re: the dispatch-and-pray list.\n\nThirteen pending payment authorizations worth 5,607.30 sit on the ledger, and some of those orders have already left the building — goods on a truck, money still uncollected. Build the chase list: every pending payment row whose ticket has a shipment leg, with amount, ticket and carrier. The chain is payments → orders → shipments, two joins, and both hops have an id space that collides with its neighbour.",
    ask: "Pending payments on orders that already have a shipment: payment id, amount, ticket and carrier, by payment id.",
    template: `SELECT p.id, p.amount, o.id AS ticket, s.carrier
FROM payments p
JOIN orders o ON o.id = {1}
JOIN shipments s ON {2} = o.id
WHERE p.status = {3}
ORDER BY p.id;`,
    slots: [
      {
        answer: "p.order_id",
        kind: "keyword",
        label: "the payment-to-ticket link",
        why: "Payments reference the ticket they settle through p.order_id, so the hop is o.id = p.order_id. p.id = o.id pairs payment 1 with ticket 1 by row number — 91 payments and 103 tickets overlap heavily — and files real money against tickets that never saw it. o.id = o.id joins every payment to every ticket.",
      },
      {
        answer: "s.order_id",
        kind: "keyword",
        label: "the leg-to-ticket link",
        why: "A shipment leg references its ticket through s.order_id, so the hop is s.order_id = o.id. s.id = o.id pairs shipment 10 with ticket 10 by shared row number — 82 legs over 103 tickets — and prints the WRONG CARRIER against a real ticket, the most dangerous kind of wrong: plausible, sourced, and fabricated.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open-authorization state",
        why: "The chase is open money, so the arm reads p.status = 'pending' — quoted, it's a value. 'settled' lists the 77 rows that already cleared (24,216.51), 'failed' lists nothing here — the one failed attempt sits on a cancelled order that never shipped — and unquoted pending hunts for a column and errors.",
      },
    ],
    distractors: ["p.id", "s.id", "o.id", "'settled'", "'failed'", "pending"],
    walkthrough:
      "Eight pending rows ride on dispatched tickets — 3,351.28 of open money with goods already moving: payment 7 (175.68, ticket 10, DHL), payment 13 (507.24, ticket 16, FedEx), payment 26 (633.91, ticket 31, FedEx), payment 43 (32.01, ticket 49, DHL), payment 44 (238.38, ticket 52, UPS), payment 79 (684.53, ticket 89, LocalPost), payment 83 (590.20, ticket 96, DHL) and payment 86 (489.33, ticket 99, FedEx). The other five pending rows — 2,256.02 — sit on never-dispatched tickets, where the money can wait with the goods. Depth note: the unfiltered payments → orders → shipments chain returns 85 rows, not 82 — the three split-payment orders contribute their ticket's single shipment once per payment row, so the chain fans 88 payment rows onto 82 legs. And the collision is a live risk, not a hypothetical: s.id = o.id keeps eight of these rows but renames their carriers and tickets — payment 7 would chase ticket 10 onto LocalPost when the truth is DHL. Chase the eight; the carriers' names come from s.order_id, not s.id.",
  },
];
