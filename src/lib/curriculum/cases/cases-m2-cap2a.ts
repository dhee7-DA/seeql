// Case batch M2-Cap2a — topic cap2 (Joins capstone), ids cs-567…cs-583.
// Module-final mix: first joins + lookups, wrong-key traps, multi-table chains,
// ghost buckets, anti-join hole lists, self-join pair ladders, join aggregates
// and fan-out discipline. Every figure is audited against the live seed db by
// scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesM2Cap2a: CaseStudy[] = [
  {
    id: "cs-567",
    tier: "easy",
    topic: "cap2",
    universe: "expense",
    title: "Madrid's four tickets, states attached",
    brief:
      "From: Ops finance, spend review. Re: regional account profile.\n\nThe spend review profiles one mid-size account per region this cycle, and Madrid's is up first. I want the account's full ticket history off the ledger — ticket number, amount, and where each sits in fulfillment — so the profile quotes stored figures instead of someone's recollection.",
    ask: "Ticket id, total and status for every booking on Pedro Alvarez's account.",
    template: `SELECT o.id, o.total, o.status
FROM orders o
JOIN customers c ON {1} = {2}
WHERE c.name = {3};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the ticket's account pointer",
        why: "The profile gathers one account's tickets, and customer_id is the pointer from each ticket to the account register. The ticket's own id would match ticket numbers against account numbers and fabricate sixteen fake pairs.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id — the pointer's landing column. The register has no customer_id of its own, so that spelling errors out before the profile has a single row.",
      },
      {
        answer: "'Pedro Alvarez'",
        kind: "keyword",
        label: "the account name",
        why: "The profile names the account — the exact quoted text 'Pedro Alvarez'. A near-miss like 'Pedro Alvarado' matches nobody and the review would profile an empty file.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'Pedro Alvarado'", "c.city"],
    walkthrough:
      "An account profile is a name filter on a reunion: Pedro Alvarez's tickets, pulled through customer_id = c.id. Four rows come back: ticket 1 at 576.54 still pending, ticket 36 at 355.07 shipped, and two completed lines — ticket 62 at 86.11 and ticket 71 at 668.45. Add them up and Madrid's account holds 1,686.17 of lifetime spend, exactly matching the leaderboard. The shape worth flagging in the review: Pedro's largest ticket is also his oldest-numbered one and it has never shipped, so a fifth of his value is live exposure rather than history. A mid-size account, four tickets, one stuck at the top — that's the whole profile, and every figure on it traces to the record.",
  },
  {
    id: "cs-568",
    tier: "easy",
    topic: "cap2",
    universe: "growth",
    title: "Osaka's booking history, ticket by ticket",
    brief:
      "From: Chief of Staff. Re: board deck, city spotlight appendix.\n\nThe appendix gives one line per notable city, and Osaka needs its booking history quoted exactly — ticket numbers, amounts, fulfillment states. If the city's story is three tickets and not thirty, the appendix should say three and let the deck argue from there.",
    ask: "Ticket id, total and status for every booking from the city of Osaka, in ticket order.",
    template: `SELECT o.id, o.total, o.status
FROM orders o
JOIN customers c ON {1} = {2}
WHERE c.city = {3}
ORDER BY o.id;`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the ticket's account pointer",
        why: "City lives on the account register, so each ticket reaches it only through customer_id. Matching ticket ids against account ids would invent sixteen phantom pairs and poison the city's history.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id — where the pointer lands. There is no customer_id on the register itself, so that guess breaks the query before the appendix has rows.",
      },
      {
        answer: "'Osaka'",
        kind: "keyword",
        label: "the city value",
        why: "The spotlight is the quoted text 'Osaka', exact and case-sensitive. 'Kyoto' is nobody on the file — the appendix line would print empty and the deck would quote a city that never ordered.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'Kyoto'", "c.region"],
    walkthrough:
      "A city history is one filter on the account side of a reunion: c.city = 'Osaka', joined through customer_id = c.id, ordered by ticket number. Three rows come back — ticket 22 at 450.12 delivered, ticket 26 at 263.91 shipped, ticket 102 at 115.06 delivered. That's Osaka's entire book: 829.09 across three tickets, all attached to Hiro Tanaka, the city's only account. Two of the three have already completed, which is a decent track record for the deck, and the one in-flight ticket is mid-sized. The appendix can now say something precise: Osaka is a single-account city with a short, healthy history — not a growth market, a customer. That distinction is exactly what a city-level rollup would have buried.",
  },
  {
    id: "cs-569",
    tier: "easy",
    topic: "cap2",
    universe: "fraud",
    title: "The cancellation queue, named",
    brief:
      "From: Risk team, spot-check rotation. Re: quarterly pattern scan.\n\nThe rotation opens each quarter with the cancellation queue — every killed ticket with the account behind it named, amounts as stored. Patterns live in the names, not the counts: if one account keeps appearing, that's the file we pull first.",
    ask: "Ticket id, account name and total for every cancelled booking.",
    template: `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE o.status = {3};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the ticket's account pointer",
        why: "The scan needs the person behind each killed ticket, and customer_id is the only thread from the ledger to the register. The ticket's own id against account ids would fabricate matches and invent cancellers.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id — the pointer's landing column. The register carries no customer_id of its own, so that spelling fails before the queue prints.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the queue's status",
        why: "The queue is defined by the exact text 'cancelled', quoted and lowercase. 'Cancelled' capitalized matches nothing — text matching doesn't forgive case — and the scan would report an empty quarter.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'Cancelled'", "'pending'"],
    walkthrough:
      "The pattern scan is a status slice on a reunion: 'cancelled' tickets, names attached through customer_id = c.id. Seven rows come back, and the names do the talking: Keiko Sato's 397.99 leads, then Alice Chen three times at 206.19, 152.52 and 136.11, Emma Wilson's 143.86, and Maya Patel twice at 90.35 and 25.47. So the quarter's cancellations concentrate in three accounts — one Nagoya ticket that dwarfs the rest, one Berlin account with a repeat pattern, one Mumbai account dithering in small amounts. That's the pull-first list the rotation wanted, and it only exists because the register rides along on every row: counts alone would have shown a flat seven and hidden Alice entirely.",
  },
  {
    id: "cs-570",
    tier: "easy",
    topic: "cap2",
    universe: "pricing",
    title: "The Video shelf, vendor-attached",
    brief:
      "From: Head of Product. Re: pricing review, shelf provenance.\n\nBefore the Video section of the review opens I want its shelf with the vendor behind each item: product name, vendor name, list price. If both video items ride on one vendor, the review hears a concentration risk; if they split, it hears redundancy. Either way it hears it from the record.",
    ask: "Product name, vendor name and list price for every product in the Video category.",
    template: `SELECT p.name, s.name, p.price
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE p.category = {3};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Provenance comes from the catalog's supplier_id pointer to the vendor file. The product's own id would try to match product numbers against vendor numbers and fabricate six fake pairs.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The vendor file numbers its rows in id, and the pointer must land there. Vendors have no supplier_id column of their own, so guessing it breaks the query before the shelf lists.",
      },
      {
        answer: "'Video'",
        kind: "keyword",
        label: "the shelf label",
        why: "The section is the quoted text 'Video', matched exactly. 'video' in lowercase matches nothing and the review would open on an empty shelf.",
      },
    ],
    distractors: ["s.supplier_id", "s.stock", "'Audio'", "'video'"],
    walkthrough:
      "Shelf provenance is a reunion plus one filter: supplier_id = s.id joins catalog to vendor file, category 'Video' keeps the section honest. Two rows come back: 4K Webcam Pro at 129 from Nordic Gadgets AB, and Ring Light 14-inch at 39.99 from Shenzhen Electro. So the Video story is redundancy, not concentration — two vendors in two regions, a 90-dollar spread between a premium anchor and an entry line. The anchor detail matters for the review: Nordic holds the catalog's single most expensive item at 199.99 on another shelf, so the webcam extends an existing premium relationship rather than betting on a new one. That's the sentence the section opens with, and both rows on it are vendor-verified.",
  },
  {
    id: "cs-571",
    tier: "easy",
    topic: "cap2",
    universe: "month-close",
    title: "Bookings with no shipment date",
    brief:
      "From: Controller. Re: month-end close, unshipped schedule.\n\nThe close binder's unshipped schedule needs every booking that has no shipment date on file — the whole live pile, pending and otherwise, with account names attached. Nothing computed, nothing estimated: if the ledger shows no shipment, the booking belongs on this schedule.",
    ask: "Ticket id, account name and total for every booking whose shipped_at is empty.",
    template: `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE o.shipped_at {3} NULL;`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the ticket's account pointer",
        why: "The schedule names accounts, and tickets reach the register only through customer_id. The ticket's own id against account ids would fabricate sixteen fake lines on a schedule that has to reconcile.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id — the pointer's landing column. There is no customer_id on the register itself, so that guess errors before the schedule exists.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the empty-date test",
        why: "An empty date is tested with IS NULL — equality never finds it, because nothing equals empty. Writing = NULL matches zero rows and the close binder would report a clean sheet while twenty-one tickets sit unshipped.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "IS NOT", "= NULL"],
    walkthrough:
      "The unshipped schedule is an emptiness test on a reunion: shipped_at IS NULL, names attached through customer_id = c.id. Twenty-one rows come back — every ticket still waiting for a truck, which reconciles exactly to the fourteen pending plus the seven cancelled tickets on the ledger. That's the schedule's whole story in one count: a fifth of the book has no shipment date, and the pile splits into tickets that will ship and tickets that never will. The classic trap sits in the test itself: writing = NULL would have returned nothing, because empty doesn't equal anything, not even itself. IS is the only honest question to ask an empty field, and the close binder now carries all twenty-one names.",
  },
  {
    id: "cs-572",
    tier: "easy",
    topic: "cap2",
    universe: "refund-audit",
    title: "The dormant Tallinn file",
    brief:
      "From: refunds@ — quarterly hygiene sweep. Re: closed accounts with history.\n\nThe sweep lists closed accounts that still carry booking history, and Tallinn is on it. Pull the file's full ticket record — numbers, amounts, states as stored — so hygiene can confirm nothing on a closed account is still moving before the quarter closes.",
    ask: "Ticket id, total and status for every booking on Dmitri Volkov's account.",
    template: `SELECT o.id, o.total, o.status
FROM orders o
JOIN customers c ON {1} = {2}
WHERE c.name = {3};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the ticket's account pointer",
        why: "The sweep gathers one account's history, and customer_id is the pointer from each ticket to its account. The ticket's own id against account ids would invent a sixteen-ticket file that belongs to nobody.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id — where the pointer lands. The register has no customer_id of its own, so that spelling fails before the sweep starts.",
      },
      {
        answer: "'Dmitri Volkov'",
        kind: "keyword",
        label: "the account name",
        why: "The sweep names the account — the exact quoted text 'Dmitri Volkov'. A shortened 'Dmitri Volkof' matches nobody and hygiene would wave through a file it never examined.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'Dmitri Volkof'", "'Keiko Sato'"],
    walkthrough:
      "The dormant-file check is a name slice on a reunion: Dmitri Volkov's tickets through customer_id = c.id. Two rows come back — ticket 80 at 435.09 delivered and ticket 81 at 164.17 delivered — a 599.26 lifetime total, and both tickets completed before the account was flagged inactive. That's the clean answer hygiene wants: nothing on the Tallinn file is moving, no open tickets, no stragglers. The near-miss trap is worth a line in the sweep notes: 'Dmitri Volkof' matches zero accounts, and a zero-row result looks identical to a clean file — the one failure mode a hygiene sweep can't catch from its own output. Exact names, exactly as registered, or the sweep proves nothing.",
  },
  {
    id: "cs-573",
    tier: "medium",
    topic: "cap2",
    universe: "pricing",
    title: "Who buys the Running Socks",
    brief:
      "From: Head of Product. Re: pricing review, accessory attach rate.\n\nThe Running Socks line is our cheapest add-on and I want its buyer list — the distinct accounts that have actually purchased it, not how many times. If the sock is riding on a handful of repeat accounts instead of broad attach, the review should know before we reprice it.",
    ask: "The distinct account names that have bought catalog item 14, with the item number on each row.",
    template: `SELECT DISTINCT c.name, oi.product_id
FROM order_items oi
JOIN orders o ON {1} = o.id
JOIN customers c ON o.customer_id = {2}
WHERE oi.product_id = {3}
ORDER BY c.name;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's ticket pointer",
        why: "Line items travel on tickets through order_id — that's the first hop of the chain. The line's own id would match line numbers against ticket numbers and fabricate a buyer list from thin air.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The second hop lands the ticket on its account: the ticket's customer_id against the register's id. The register has no customer_id of its own, so that guess errors before the list forms.",
      },
      {
        answer: "14",
        kind: "number",
        label: "the catalog item number",
        why: "The Running Socks 3-pack is item 14 on the catalog — the number shows on every row of the answer. Item 24 doesn't exist and item 7 is the 4K Webcam, a different buyer set at a different price point entirely.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "c.region", "24", "7"],
    walkthrough:
      "The buyer list is a two-hop chain with a dedupe: lines to tickets on order_id, tickets to accounts on customer_id = c.id, filtered to item 14, DISTINCT to collapse repeat purchases. Eight accounts come back — Alice Chen, Dmitri Volkov, Emma Wilson, Grace Kim, Hiro Tanaka, Jamal Wright, Maya Patel, Noah Meyer — across 14 purchase lines, so the sock attaches broadly rather than riding one whale. Two findings for the review. First, breadth: half the customer base has bought the cheapest item, which is exactly what an attach-rate story wants. Second, a wrinkle: Dmitri Volkov's name is on the list, and his account is flagged inactive — the entry-level item reached even a dormant account. That's the kind of detail a bare sales count would never surface.",
  },
  {
    id: "cs-574",
    tier: "medium",
    topic: "cap2",
    universe: "inventory",
    title: "Vendors above five thousand in line revenue",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: vendor concentration brief.\n\nBefore the count schedule is signed off I want the vendor side of the story: which vendors' goods have run up more than five thousand in lifetime line revenue through our shelves. Those relationships are too deep to count casually, and the brief should say so with figures.",
    ask: "Vendor name and line revenue for every supplier whose sold line revenue exceeds 5000.",
    template: `SELECT s.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON {1} = {2}
JOIN suppliers s ON {3} = {4}
GROUP BY s.name
HAVING SUM(oi.quantity * oi.unit_price) > {5}
ORDER BY revenue DESC;`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Revenue is earned line by line, and each line points at its catalog item through product_id. The line's own id would match line numbers against item numbers and misattribute every sale.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The pointer lands on the catalog's id column. There is no product_id on the catalog itself — that guess errors out and the brief has no figures at all.",
      },
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "The second hop carries each item to its vendor through supplier_id. The line's own id here would pair line numbers with item numbers and corrupt the revenue before it's grouped.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The vendor file numbers its rows in id — the pointer's landing column. Vendors carry no supplier_id of their own, so that spelling breaks the query outright.",
      },
      {
        answer: "5000",
        kind: "number",
        noVerify: true,
        label: "the concentration bar",
        why: "The brief defines deep relationships as above 5,000 in line revenue — the desk's own bar. Lowering it to 4,000 would pull a third vendor into a story about two, and the concentration claim dissolves.",
      },
    ],
    distractors: ["oi.id", "s.supplier_id", "s.stock", "9500", "4000"],
    walkthrough:
      "Vendor concentration is a three-file chain with a bar on it: lines to catalog on product_id = p.id, catalog to vendor file on p.supplier_id = s.id, revenue summed per vendor and filtered at 5,000. Two vendors clear it: Nordic Gadgets AB at 11,130.25 and Midwest Hardware Co at 9,294.93. Together they carry roughly two-thirds of the building's 34,833.28 in lifetime line revenue — that's the concentration sentence. The next vendor down, Alpine Audio GmbH at 4,765.63, misses the bar by a rounding-error margin, which is exactly why the bar lives in the filter and not in the narrative: move it to 4,000 and a two-vendor story quietly becomes a three-vendor story. The count schedule can now say which bins are too deep to count casually, with both figures attached.",
  },
  {
    id: "cs-575",
    tier: "medium",
    topic: "cap2",
    universe: "funnel",
    title: "Same-region account pairs for co-marketing",
    brief:
      "From: Growth marketing lead. Re: co-marketing pilot, pairing list.\n\nThe pilot pairs nearby accounts for joint campaigns, and pairing by region is the cheapest proxy we have. I want the pair counts per region so budget follows density — and if a region turns out to be a lone account, the pilot should know it has nothing to pair there.",
    ask: "Each region with its count of same-region account pairs, densest region first.",
    template: `SELECT a.region, COUNT(*) AS pairs
FROM customers a
JOIN customers b ON {1} = {2} AND a.id {3} b.id
GROUP BY a.region
ORDER BY pairs DESC;`,
    slots: [
      {
        answer: "a.region",
        kind: "keyword",
        label: "the first account's region",
        why: "Pairing means matching each account against the others on shared region — the left copy's region column. City would pair only exact-city matches, and no two accounts on this file share a city, so the pilot would get zero pairs everywhere.",
      },
      {
        answer: "b.region",
        kind: "keyword",
        label: "the second account's region",
        why: "The right copy of the register supplies the other side of the handshake. Pointing both sides at the same copy's columns compares an account against itself and the pairing collapses.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the mirror killer",
        why: "The less-than guard keeps each pair once, in one direction. Without it every pairing shows up twice — and worse, an equality test would pair every account with itself, since any region trivially matches its own.",
      },
    ],
    distractors: ["a.city", "b.city", "<>", "="],
    walkthrough:
      "The pairing list is the register shaken hands with itself: same region on both sides, a.id < b.id so each pair survives exactly once, then a count per region. Three rows come back: EU with 28 pairs, APAC with 10, US with 1 — and LATAM nowhere, because Bruno Silva is the region's only account and has nobody to pair with. The ladder behind those numbers is the part worth telling: loosen the guard to not-equals and every mirror pair returns, doubling the count to 78; drop the filter entirely and self-pairs flood in, 94 rows of accounts shaking hands with themselves. Only the strict less-than gives the pilot's true 39 partnerships. Budget follows the density — Berlin's eight EU accounts dominate — and the lone-American problem is now on the record.",
  },
  {
    id: "cs-576",
    tier: "medium",
    topic: "cap2",
    universe: "supplier",
    title: "Shelves that double up: same-category pairs",
    brief:
      "From: Supply-chain lead. Re: QBR pack, vendor breadth page.\n\nThe QBR's breadth page asks a simple question of the catalog: which items sit two-deep on the same shelf, item against item. If whole shelves are single-sourced, the page says so — single-sourced shelves are the negotiation risk, and I want the count before the meeting.",
    ask: "Every pair of distinct catalog items that share a category, one row per pair.",
    template: `SELECT a.name, b.name
FROM products a
JOIN products b ON {1} = {2} AND a.id {3} b.id;`,
    slots: [
      {
        answer: "a.category",
        kind: "keyword",
        label: "the first item's shelf",
        why: "Pairing means matching the catalog against itself on shared category — the left copy's shelf column. Matching on id would compare item numbers and produce nothing, since no two items share a number.",
      },
      {
        answer: "b.category",
        kind: "keyword",
        label: "the second item's shelf",
        why: "The right copy of the catalog supplies the other side of the shelf comparison. Comparing a category to an id or a price matches text against numbers and the page prints empty.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the mirror killer",
        why: "Less-than keeps each pair once, one direction only. Swap it for equality and every item pairs with itself; drop to not-equals and the same twelve pairs come back doubled, twenty-four rows of mirrors.",
      },
    ],
    distractors: ["a.id", "b.id", "<>", "="],
    walkthrough:
      "The breadth page is the catalog folded on itself: same category on both copies, a.id < b.id so each pair appears once, twelve rows come back. The shelf breakdown is the finding: Electronics pairs three ways, Audio three, Accessories three, then Wearables, Video and Apparel one each — and Fitness nowhere, because the Yoga Mat is that shelf's only item. So the negotiation risk sits on the Fitness shelf: single-sourced with no backup item, while Electronics runs three-deep with redundancy. The guard deserves its slot on the page: equality would have paired every item with itself, and not-equals would have printed all twelve pairs twice. Twelve honest pairs, one naked shelf — that's the breadth story the QBR opens with.",
  },
  {
    id: "cs-577",
    tier: "medium",
    topic: "cap2",
    universe: "expense",
    title: "The spend leaderboard, top five",
    brief:
      "From: Ops finance, spend review. Re: headline concentration table.\n\nThe review opens on the leaderboard: the five accounts carrying the most lifetime booked value, biggest first, figures as stored. If the top five hold most of the book, the concentration argument writes itself — but it has to be the true five, off the ledger, not the five we remember.",
    ask: "The 5 accounts with the highest lifetime booked totals, biggest first, with the amounts.",
    template: `SELECT c.name, ROUND({3}, 2) AS spend
FROM orders o
JOIN customers c ON {1} = {2}
GROUP BY c.name
ORDER BY spend {4}
LIMIT {5};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the ticket's account pointer",
        why: "Spend attaches to accounts through customer_id — the thread that reunites every ticket with its owner. The ticket's own id would match ticket numbers against account numbers and invent sixteen phantom accounts.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id — the pointer's landing column. There is no customer_id on the register itself, so that guess errors before the leaderboard exists.",
      },
      {
        answer: "SUM(o.total)",
        kind: "keyword",
        label: "the lifetime booked total",
        why: "The leaderboard ranks booked value, so the ledger's own totals are summed per account. An average would rank by ticket size instead of volume and put one-big-ticket accounts over steady heavy spenders.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest first is descending — the table opens on the headline spender. Ascending would lead the review with the smallest account and bury the concentration story under the floor.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the table's row count",
        why: "The headline table carries exactly five names, so the cut is 5. Three is a podium without depth; ten is a ledger reprint, and the review's format has five slots.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "AVG(o.total)", "ASC", "3"],
    walkthrough:
      "The leaderboard is a per-account total with a ranked cut: tickets reunited with accounts on customer_id = c.id, the ledger's totals summed per account, ordered descending, sliced at five. The five that land: Alice Chen 7,262.35, Emma Wilson 6,640.56, Grace Kim 4,574.23, Maya Patel 3,644.56, Chloe Dubois 2,667.93. Together that's 24,789.63 of the book's 34,833.28 — roughly seven dollars in every ten sit with five accounts, which is the concentration argument in one line. The quiet trap in this build is the wrong aggregate: ranking by average ticket would crown single-big-order accounts over steady volume and reshuffle the entire table. Booked value means the sum, and the sum says Berlin and Austin own this file.",
  },
  {
    id: "cs-578",
    tier: "hard",
    topic: "cap2",
    universe: "growth",
    title: "Where Europe's units actually go",
    brief:
      "From: Chief of Staff. Re: board deck, regional unit mix.\n\nThe regional slide claims Europe is an audio story, and nobody has checked. I want Europe's purchased units broken out by shelf, every shelf, counts as stored — if the units say something else, the slide gets rewritten before the board sees it.",
    ask: "Each product category with the total units EU-region accounts have purchased, densest first.",
    template: `SELECT p.category, SUM(oi.quantity) AS units
FROM order_items oi
JOIN orders o ON {1} = o.id
JOIN customers c ON o.customer_id = {2}
JOIN products p ON oi.product_id = {3}
WHERE c.region = {4}
GROUP BY p.category
ORDER BY units DESC, p.category;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's ticket pointer",
        why: "Units are bought on lines, and lines reach tickets through order_id — the first hop of the four-file chain. The line's own id would match line numbers against ticket numbers and scramble every hop after it.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The second hop lands each ticket on its account: the ticket's customer_id against the register's id. The register carries no customer_id of its own, so that guess dies before the mix exists.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The third hop carries each line to its item: the line's product_id against the catalog's id. There is no product_id column on the catalog itself — that spelling errors and the slide has no units.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region value",
        why: "The slide is the Europe story: the quoted text 'EU' on the account's region. 'US' would build the mix from Austin and Chicago and the board would hear the wrong continent's units.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "p.product_id", "'US'", "'APAC'"],
    walkthrough:
      "The unit mix is the full four-file chain: lines to tickets, tickets to accounts, lines to items, filtered to 'EU' and counted by shelf. Seven rows come back, and the slide's claim dies on contact: Accessories 43 units and Audio 43 sit in a dead heat at the top — the tie broken alphabetically here — with Electronics 31, Wearables 28, Video 27, Apparel 16 and Fitness 11 behind. So Europe is an accessories-and-audio story, not an audio story, and the desk-mat-and-cable volume nobody talks about matches the premium shelf unit for unit. Two files feed every number: the line items carry the quantities, the register carries the region, and the four-hop chain is what keeps them honest. The board slide gets the real mix, ties and all.",
  },
  {
    id: "cs-579",
    tier: "hard",
    topic: "cap2",
    universe: "fraud",
    title: "The desk split on never-shipped files",
    brief:
      "From: Risk team, spot-check rotation. Re: dormant-exposure sweep, desk routing.\n\nThe sweep's first pass named six accounts that have paid us and never received a parcel. Before the rotation books the pulls, the lead wants the workload split: how many of those dead-weight accounts sit on each regional desk, busiest desk first, so the follow-ups can be assigned in one pass. If a region carries no exposure at all, the sweep should say so by silence.",
    ask: "Count of never-shipped accounts per regional desk, busiest desk first — regions with no exposure simply absent.",
    template: `SELECT c.region, {1} AS hole_accounts
FROM customers c
{2} JOIN orders o ON o.customer_id = c.id AND o.status = {3}
WHERE o.id IS {4}
GROUP BY {5}
ORDER BY hole_accounts DESC, c.region;`,
    slots: [
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the hole counter",
        why: "Every ghost row is one account-with-no-shipment, so the raw row count per desk is the exposure figure. Counting the ticket column instead would read empty ids on the ghosts and print a confident zero per desk — the sweep would file a clean bill where three desks owe follow-ups.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The census must keep every account row, matched or not, so the ghosts survive to be counted. An inner join discards exactly the rows the sweep is hunting and the census comes back empty; a right join keeps tickets and drops the account side instead.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the in-transit status",
        why: "The hole is the absence of a shipped ticket specifically, and the status test lives inside the ON so unmatched accounts survive as ghosts. 'delivered' or 'pending' would census a different absence, and a case slip like 'Shipped' matches nothing at all, turning every account into a hole.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the ghost test",
        why: "An account with no shipped booking leaves every ticket column empty, so testing the ticket id for emptiness is the hole's signature. The negated test keeps the matched rows instead and the census counts ordinary shipments, not holes.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the desk column",
        why: "The workload is routed by region, so groups must form on the account's region. Grouping on a ticket column collapses everything onto the ghosts' blank tickets and prints one nonsense row; grouping on city re-cuts the same holes into six single-file desks no lead can assign.",
      },
    ],
    distractors: ["COUNT(o.id)", "INNER", "RIGHT", "'delivered'", "'pending'", "NOT NULL"],
    walkthrough:
      "The census prints three desks and the silence of a fourth. Europe leads with three holes — Chloe Dubois, Dmitri Volkov and Olivia Brown — APAC carries two in Farid Nasser and Keiko Sato, and LATAM's whole workload is Bruno Silva. The US never appears: both US accounts have shipped history, so no ghost rows survive the emptiness test and no group forms — the silence is itself the reading, no desk rotation needed in the Americas. Cross-check the counts against the name list from the first pass and they reconcile: three plus two plus one is the same six accounts, holding seventeen tickets between them. The two failure modes both look like diligence. An inner join prints an empty census and files a clean sweep; counting the ticket column on the ghosts prints a confident zero per desk. Neither number is a finding — the ghosts are, and only the preserving join keeps them on the books.",
  },
  {
    id: "cs-580",
    tier: "hard",
    topic: "cap2",
    universe: "catalog",
    title: "Two counts, one shipping truth",
    brief:
      "From: Catalog content manager. Re: sourcing page integrity check.\n\nThe sourcing page quotes two shipment figures that keep disagreeing in meetings, and I want the disagreement measured once, side by side: the raw paired-row count versus the count of tickets that actually exist behind them. Both numbers off the same register pairing, no retyping — the gap between them is the story.",
    ask: "The raw paired-row count and the real shipped-ticket count for accounts paired with their shipped bookings, side by side in one row.",
    template: `SELECT {1} AS raw_rows, {2} AS real_shipments
FROM customers c
{3} JOIN orders o ON o.customer_id = c.id AND o.status = {4};`,
    slots: [
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the raw row count",
        why: "The raw count must include ghost rows — accounts paired with nothing — so it counts every row the pairing produced. A column-targeted count would skip the ghosts and the raw figure would quietly equal the real one, hiding the gap.",
      },
      {
        answer: "COUNT(o.id)",
        kind: "keyword",
        label: "the real ticket count",
        why: "Counting the ticket-side id skips ghost rows automatically, because empty ids aren't counted — that's what makes it the honest figure. Counting the account-side id would count the ghosts too and the two columns would agree, erasing the finding.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The gap only exists if unmatched accounts survive as ghost rows — that's LEFT JOIN. An inner join discards them, both counts collapse to 30, and the page would print two identical numbers with no story.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the in-transit status",
        why: "The disagreement is about shipments, so the ON filters 'shipped' — inside the ON, so ghost rows survive. 'delivered' would measure a different pairing with a different gap entirely.",
      },
    ],
    distractors: ["JOIN", "'delivered'", "SUM(o.id)", "RIGHT", "MIN(o.id)"],
    walkthrough:
      "The integrity check puts both counts on one row: LEFT JOIN accounts to their shipped bookings with the status inside the ON, then COUNT(*) against COUNT(o.id). The row that comes back: 36 raw paired rows, 30 real tickets. The six-row gap is the ghost population — six accounts (Bruno Silva, Chloe Dubois, Dmitri Volkov, Farid Nasser, Keiko Sato, Olivia Brown) each contributing one empty pairing. That's the whole meeting in two numbers: the raw count overstates shipments by exactly the number of accounts with nothing in transit, and the column-targeted count is the one that tells the truth. Flip the join to inner and both columns print 30 — the gap, and the finding, evaporate. Two counts, honestly labeled, are how the page stays credible.",
  },
  {
    id: "cs-581",
    tier: "hard",
    topic: "cap2",
    universe: "month-close",
    title: "The pending total that will not reconcile",
    brief:
      "From: Controller. Re: month-end close, receivables reconciliation.\n\nThe pending receivable on the draft close will not tie to the ledger no matter how the desk re-adds it, and I want the inflated figure reproduced exactly, off the ticket lines rather than the tickets. Once we can print the wrong number on purpose, we can explain to the auditors precisely how the doubling happens.",
    ask: "The inflated pending total produced when tickets are repeated once per line item, for status pending.",
    template: `SELECT ROUND({1}, 2) AS booked_total
FROM order_items oi
JOIN orders o ON {2} = {3}
WHERE o.status = {4};`,
    slots: [
      {
        answer: "SUM(o.total)",
        kind: "keyword",
        label: "the inflated ticket total",
        why: "Summing the ticket's own total after the line-item join bills every ticket once per line — a ticket with three lines gets its total counted three times. That double-billing is the exact machinery the reconciliation needs to demonstrate.",
      },
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's ticket pointer",
        why: "Lines attach to tickets through order_id — that's the join that repeats each ticket. The line's own id would match line numbers against ticket numbers and produce a different, unrelated pile.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the ticket's own number",
        why: "The pointer lands on the ticket ledger's id column. Tickets carry no order_id of their own, so that spelling errors before the inflated figure exists.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open status",
        why: "The reconciliation targets the pending book — the quoted text 'pending'. 'shipped' would reproduce the same doubling on a different slice and the auditor memo would explain the wrong number.",
      },
    ],
    distractors: ["SUM(oi.quantity * oi.unit_price)", "AVG(o.total)", "oi.id", "o.order_id", "'shipped'"],
    walkthrough:
      "The reproduction is deliberate: join line items to tickets on oi.order_id = o.id, keep 'pending', and sum the ticket's own total — every pending ticket bills once per line, so multi-line tickets count two and three times. The figure that comes back is 17,991.07, against a true pending book of 6,113.00: the line-item join has nearly tripled the receivable. That's the demonstration the auditors need, and it scales — run the same mistake across the whole ledger and 34,833.28 becomes 103,244.55. The honest alternative sits in the same columns: summing quantity times unit price charges each line once and lands exactly on 6,113.00. The close memo now shows both figures and names the mechanism — repetition, not fraud, just a total pulled from the wrong grain.",
  },
  {
    id: "cs-582",
    tier: "hard",
    topic: "cap2",
    universe: "refund-audit",
    title: "The account with no completed booking",
    brief:
      "From: refunds@ — goodwill review. Re: completion-gap list.\n\nGoodwill policy assumes every account has at least one completed booking to anchor the relationship, and I want the exception list: accounts with zero delivered tickets, cities attached. If the list is one name, the policy holds with one caveat; if it's longer, the policy needs a rewrite.",
    ask: "Every account that has never had a delivered booking, with its city.",
    template: `SELECT c.name, c.city
FROM customers c
{1} JOIN orders o ON o.customer_id = c.id AND o.status = {2}
WHERE o.id {3} NULL;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The exception list lives among unmatched rows, so every account must survive the pairing — LEFT JOIN. An inner join throws away exactly the rows the list is made of, and the review would see a policy with no exceptions.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the completed status",
        why: "The gap is about completions, so the ON tests 'delivered' — inside the ON, so accounts without one survive as ghosts. 'shipped' would hunt a different absence and list a different set of names.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the hole test",
        why: "An account with no delivered ticket keeps the pairing with every ticket column empty — o.id IS NULL is the signature. IS NOT would return the complement: every account that does have a completion.",
      },
    ],
    distractors: ["INNER", "RIGHT", "'shipped'", "IS NOT"],
    walkthrough:
      "The completion-gap list is a hole-finder aimed at 'delivered': LEFT JOIN with the status inside the ON, ghosts kept, o.id IS NULL to keep only the holes. One row comes back: Liam O'Brien, Cork. That's the whole exception list — a policy that holds for fifteen of sixteen accounts and breaks on exactly one. The Cork file explains it: Liam's entire history is ticket 20, a 705.39 ticket that shipped and never completed, so the account has given us real money and nothing delivered to show for it. Flip the join to inner and the list empties — the one exception vanishes and the policy looks airtight when it isn't. The goodwill review gets its caveat with a name and a city attached, which is precisely what a one-row exception list is for.",
  },
  {
    id: "cs-583",
    tier: "hard",
    topic: "cap2",
    universe: "pricing",
    title: "Who owns the Electronics shelf",
    brief:
      "From: Head of Product. Re: pricing reset, electronics sourcing split.\n\nThe Electronics section gets repriced next, and the opening question is provenance: how the shelf's earned revenue splits across the vendors behind it, per vendor, biggest first. If one vendor owns the shelf, the reset negotiates with a partner; if it splits, it negotiates with a market.",
    ask: "Vendor name and line revenue for every supplier behind Electronics products, biggest revenue first.",
    template: `SELECT s.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON {1} = {2}
JOIN suppliers s ON p.supplier_id = {3}
WHERE p.category = {4}
GROUP BY s.name
ORDER BY revenue DESC;`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Revenue accrues on lines, and each line names its item through product_id. The line's own id would match line numbers against item numbers and attribute every Electronics sale to the wrong vendor.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The pointer lands on the catalog's id column. The catalog has no product_id column of its own — that guess errors before the split exists.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The second hop lands each item on its vendor: the item's supplier_id against the vendor file's id. Vendors carry no supplier_id of their own, so that spelling breaks the chain.",
      },
      {
        answer: "'Electronics'",
        kind: "keyword",
        label: "the shelf label",
        why: "The section is the quoted text 'Electronics', exact and case-sensitive. 'Audio' would rebuild the split from headsets and mics and the reset would negotiate the wrong shelf.",
      },
    ],
    distractors: ["oi.id", "s.supplier_id", "s.rating", "'Audio'", "'Video'"],
    walkthrough:
      "The sourcing split is the full chain at line grain: lines to items on product_id = p.id, items to vendors on p.supplier_id = s.id, filtered to 'Electronics', summed per vendor. Three rows come back: Nordic Gadgets AB 2,558.26, Shenzhen Electro 1,239.85, Pacific Textiles 1,020.50 — and they reassemble the shelf's 4,818.61 exactly, so nothing leaks. Nordic owns about half the shelf, but the real shape is a three-vendor market with a 1,500-dollar spread from top to bottom: no single-source risk, no negotiation with a partner, three quotes on every conversation. That's the difference between repricing a relationship and repricing a shelf, and the reset now opens with the split it actually faces.",
  },
];
