// Case batch M2-Cap2b — topic cap2 (Joins capstone), ids cs-584…cs-600.
// Module-final mix: first joins + lookups, wrong-key traps, multi-table chains,
// ghost buckets, anti-join hole lists, self-join pair ladders, join aggregates
// and fan-out discipline. Every figure is audited against the live seed db by
// scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesM2Cap2b: CaseStudy[] = [
  {
    id: "cs-584",
    tier: "easy",
    topic: "cap2",
    universe: "inventory",
    title: "The Andes stock card",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: vendor stock cards.\n\nThe count pack is adding vendor stock cards, and the LATAM vendor is first: every item we buy from them with its on-hand figure and the vendor named on the card. The crew needs to see, per shelf, who the replenishment call goes to.",
    ask: "Product name, stock and vendor name for every product sourced from Andes Naturals SA.",
    template: `SELECT p.name, p.stock, s.name
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE s.name = {3};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "The card names the vendor, and the catalog points at the vendor file through supplier_id. The product's own id would match product numbers against vendor numbers and fabricate pairs on a card that has to reconcile.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The vendor file numbers its rows in id — where the pointer lands. Vendors have no supplier_id column of their own, so guessing it breaks the query before a card prints.",
      },
      {
        answer: "'Andes Naturals SA'",
        kind: "keyword",
        label: "the registered vendor name",
        why: "The card quotes the registered text 'Andes Naturals SA', complete with suffix. A shortened 'Andes Naturals' matches nothing — the card run would skip the vendor's whole shelf in silence.",
      },
    ],
    distractors: ["s.supplier_id", "s.stock", "'Andes Naturals'", "'Alpine Audio GmbH'"],
    walkthrough:
      "The vendor card is a name filter on a reunion: supplier_id = s.id joins the catalog to the vendor file, and the exact registered name keeps the right vendor. Two rows come back: Bluetooth Speaker Mini at 210 on hand and Fitness Band X2 at 95, both Andes Naturals SA. So the LATAM card is two shelves deep, and the spread matters for the count: the speaker bin is one of the deeper audio shelves in the building while the band bin sits under 100, the threshold the desk treats as thin. Both shelves carry one vendor's name, so a shortfall on either is a single overseas call — the card's whole purpose. And the name is the trap worth noting for the crew: 'Andes Naturals' without the suffix matches nothing, and a missing card looks exactly like an empty shelf.",
  },
  {
    id: "cs-585",
    tier: "easy",
    topic: "cap2",
    universe: "funnel",
    title: "Hamburg's ledger, account attached",
    brief:
      "From: Growth marketing lead. Re: city-level account review.\n\nThe next campaign weights cities by booked value, and Hamburg keeps coming up in the room. Before budget moves I want the city's full ticket history with the account attached — numbers, amounts, fulfillment states, biggest first — so the spend conversation starts from the ledger instead of a feeling.",
    ask: "Ticket id, total, status and account for every Hamburg booking, biggest total first.",
    template: `SELECT o.id, o.total, o.status, {1}
FROM orders o
JOIN customers c ON {2} = {3}
WHERE c.city = {4}
ORDER BY {5} DESC;`,
    slots: [
      {
        answer: "c.name",
        kind: "keyword",
        label: "the account column",
        why: "The review wants to know whose money each ticket carries, and the account's name is the readable answer. The region column would print the same constant tag on every row and the review would lose the who entirely.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the ticket's account pointer",
        why: "Tickets reach the register only through the customer pointer on the ticket side. The ticket's own id against account numbers fabricates plausible-looking pairs — the file would open on a stranger's total wearing the city's name.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered by account id — the pointer's landing column. There is no customer_id on the register itself, so that guess errors before the review has rows.",
      },
      {
        answer: "'Hamburg'",
        kind: "keyword",
        label: "the city value",
        why: "The review is the quoted text 'Hamburg', exact and case-sensitive. Lower-case matches nobody and the ledger reads empty; a different city prints a different account's history with the same columns.",
      },
      {
        answer: "o.total",
        kind: "keyword",
        label: "the biggest-first sort",
        why: "The brief reads biggest first, so the sort key is the ticket amount. Sorting on fulfillment status shuffles the same tickets into shipped-then-delivered order and buries the 489.33 headline — the review would open on a minor ticket.",
      },
    ],
    distractors: ["c.region", "c.customer_id", "'hamburg'", "'Berlin'", "o.status"],
    walkthrough:
      "One filter on the account side of the reunion, then the account column and an amount sort: four rows come back — 489.33 shipped, 116.69 delivered, 75.47 delivered, 56.19 shipped — every one Noah Meyer, because Hamburg's file is a one-account city. Biggest first is the reading the budget room wants: the top ticket is nearly nine times the city's smallest, so the booked-value story is really one large in-transit order plus three small completed ones. Sort on fulfillment state instead and the same four rows open on the 56.19 ticket — the headline buried at position three. The owner-key discipline stays invisible when it works: point the join at ticket ids instead of account ids and the history collapses to a single 705.23 row that belongs to nobody's Hamburg review. That is what one swapped key costs on a quiet city — one plausible row, no error, wrong file.",
  },
  {
    id: "cs-586",
    tier: "easy",
    topic: "cap2",
    universe: "supplier",
    title: "Shenzhen's shelf, prices and scorecard",
    brief:
      "From: Supply-chain lead. Re: QBR pack, APAC vendor page.\n\nThe APAC page leads with Shenzhen Electro and I want their shelf as registered: every item we buy from them with list price, and their scorecard rating on the same row so the page argues volume and quality together. Exact registered name, no paraphrasing.",
    ask: "Product name, list price and vendor rating for every product sourced from Shenzhen Electro.",
    template: `SELECT p.name, p.price, s.rating
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE s.name = {3};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "The page pairs each item with its vendor's rating, and the catalog reaches the vendor file only through supplier_id. The product's own id against vendor numbers would invent pairs and misattribute the scorecard.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The vendor file numbers its rows in id — the pointer's landing column. Vendors carry no supplier_id of their own, so that spelling errors before the page fills.",
      },
      {
        answer: "'Shenzhen Electro'",
        kind: "keyword",
        label: "the registered vendor name",
        why: "The page quotes the registered text 'Shenzhen Electro' exactly. A padded 'Shenzhen Electro Ltd' matches nothing and the QBR page prints blank in front of the vendor.",
      },
    ],
    distractors: ["s.supplier_id", "s.stock", "'Shenzhen Electro Ltd'", "'Pacific Textiles'"],
    walkthrough:
      "The vendor page is a name slice on a reunion: supplier_id = s.id joins the registers, 'Shenzhen Electro' keeps their three items. The rows that land: Wireless Mouse M3 at 34.50, Ring Light 14-inch at 39.99, Running Socks 3-pack at 18.50 — every row carrying the vendor's 4.1 scorecard rating. So the Shenzhen story is the value tier of the catalog: three items, all under 40, one vendor, a mid-pack 4.1 rating. The price points matter for the QBR argument — this is the vendor behind the catalog's cheapest runs, not a premium line — and the rating sits beside each figure so quality and volume are read together, as the page intends. The truncated-name trap goes in the content notes: one missing word and the page prints empty.",
  },
  {
    id: "cs-587",
    tier: "easy",
    topic: "cap2",
    universe: "expense",
    title: "The four-figure club",
    brief:
      "From: Ops finance, spend review. Re: big-ticket annex.\n\nThe annex lists tickets above 900 — the review's working definition of big-ticket this cycle — with account names attached, biggest first. If the club has two members, the annex says two and the concentration conversation starts there.",
    ask: "Ticket id, account name and total for every booking above 900, biggest first.",
    template: `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE o.total > {3}
ORDER BY o.total {4};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the ticket's account pointer",
        why: "The annex names accounts, and tickets reach the register only through customer_id. The ticket's own id against account ids would fabricate phantom members and break the annex's arithmetic.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id — the pointer's landing column. There is no customer_id on the register itself, so that guess errors before the annex exists.",
      },
      {
        answer: "900",
        kind: "number",
        noVerify: true,
        label: "the big-ticket line",
        why: "The annex's bar is 900 — this cycle's own definition. Dropping it to 800 would admit two more tickets and quietly turn a two-member club into a four-member one.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest first is descending, so the annex opens on its headline ticket. Ascending would lead with the second-biggest line and let the four-figure ticket arrive as a footnote.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "800", "ASC"],
    walkthrough:
      "The annex is a bar and a rank on a reunion: totals above 900, ordered biggest-first, names attached through customer_id = c.id. Two tickets clear it: ticket 74, Farid Nasser, 1,088.44 — the ledger's single largest booking, still pending — and ticket 43, Chloe Dubois, 945.21. That's the whole club, and the shape is the argument: the four-figure ticket is nearly 150 ahead of the runner-up, it hasn't shipped, and it sits on a three-ticket Dubai account that depends on it for three-quarters of its lifetime value. Lower the bar to 800 and Emma Wilson's 845.92 and Grace Kim's 826.03 walk in, diluting exactly the concentration the annex exists to show. Two names, one exposure — the review gets it in two rows.",
  },
  {
    id: "cs-588",
    tier: "easy",
    topic: "cap2",
    universe: "growth",
    title: "Milan ranked by ticket size",
    brief:
      "From: Chief of Staff. Re: board deck, account spotlight.\n\nThe deck's Milan spotlight ranks the account's tickets by value, biggest first, with fulfillment state beside each. The narrative hangs on the shape of that list — whether the city's value is one anchor ticket or a steady ladder — so the ranking has to come off the record.",
    ask: "Ticket id, total and status for every booking from the city of Milan, biggest total first.",
    template: `SELECT o.id, o.total, o.status
FROM orders o
JOIN customers c ON {1} = {2}
WHERE c.city = {3}
ORDER BY o.total {4};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the ticket's account pointer",
        why: "The spotlight gathers one city's tickets, and tickets reach the register only through customer_id. The ticket's own id against account ids would invent sixteen fake pairs and corrupt the history.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id — the pointer's landing column. There is no customer_id on the register itself, so that guess errors before the spotlight has rows.",
      },
      {
        answer: "'Milan'",
        kind: "keyword",
        label: "the city value",
        why: "The spotlight is the quoted text 'Milan', exact and case-sensitive. 'Turin' is nobody on the file — the deck would spotlight a city with no history at all.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest first is descending — the spotlight opens on the anchor ticket. ASC would lead with a 32.01 line and let the 608.06 anchor arrive last, upside down.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'Turin'", "ASC"],
    walkthrough:
      "The spotlight is a city filter with a value rank: Milan, ordered biggest-first through customer_id = c.id. Four rows come back: ticket 98 at 608.06 shipped, ticket 78 at 295.66 delivered, ticket 29 at 49.92 delivered, ticket 49 at 32.01 shipped — Isabella Rossi's whole file, 985.65 in total. The shape writes the narrative: one anchor ticket at 608.06 carries about sixty percent of the city's value and it's still in transit, with a long tail of small completed lines behind it. So Milan is a one-anchor story, not a ladder — and the anchor's status column is the risk line in the deck. The direction flip is the quiet killer here: ascending opens the spotlight on 32.01 and the room forms its opinion on the tail before the anchor ever arrives.",
  },
  {
    id: "cs-589",
    tier: "medium",
    topic: "cap2",
    universe: "fraud",
    title: "Emma Wilson's live exposure",
    brief:
      "From: Risk team, spot-check rotation. Re: open-exposure list.\n\nThe rotation works the open-exposure list top to bottom and the file's second-biggest spender is next. I need the account's pending tickets only — numbers, amounts, states as stored. If the live exposure is three tickets and not one, the reviewer wants to see all three.",
    ask: "Ticket id, total and status for every pending booking on Emma Wilson's account.",
    template: `SELECT o.id, o.total, o.status
FROM orders o
JOIN customers c ON {1} = {2}
WHERE c.name = {3} AND o.status = {4};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the ticket's account pointer",
        why: "The review gathers one account's tickets, and customer_id is the pointer from each ticket to its account. The ticket's own id against account ids would invent a sixteen-ticket file that doesn't exist.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id — the pointer's landing column. The register has no customer_id of its own, so that spelling fails before the exposure count exists.",
      },
      {
        answer: "'Emma Wilson'",
        kind: "keyword",
        label: "the account name",
        why: "The rotation names the account — the exact quoted text 'Emma Wilson'. A near-miss like 'Emily Wilson' matches nobody and the packet would review an empty file.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the live-ticket status",
        why: "Live exposure means the quoted text 'pending' — lowercase and exact. 'shipped' would list tickets already in the air and double the rotation's staffing for risk that has left the building.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'Emily Wilson'", "'shipped'", "'delivered'"],
    walkthrough:
      "The exposure packet is two filters on a reunion: 'Emma Wilson' on the account side, 'pending' on the ticket side, joined through customer_id = c.id. Three rows come back: ticket 5 at 725.34, ticket 90 at 160.30, ticket 97 at 585.79 — a live exposure of 1,471.43, which is more pending value than any other account on the file. The context sharpens it: Emma's ledger totals 6,640.56 across 17 tickets, so over a fifth of the file's second-biggest book is unclosed right now, spread across three tickets rather than concentrated in one. That's the difference between staffing one follow-up and three, and it's only visible because the status filter rides on the account slice instead of a headline count.",
  },
  {
    id: "cs-590",
    tier: "medium",
    topic: "cap2",
    universe: "catalog",
    title: "Ticket 20, itemized",
    brief:
      "From: Catalog content manager. Re: starter-bundle scoping.\n\nThe bundle team wants to model on a real ticket, and the file's famous one-and-done order — ticket 20, the single booking on its account — is the candidate. I want the ticket itemized off the registers: what was on it, how many of each, at what line prices. Stored figures only.",
    ask: "Ticket id, product name, quantity and line price for every line on ticket 20.",
    template: `SELECT o.id, p.name, oi.quantity, oi.unit_price
FROM order_items oi
JOIN orders o ON {1} = o.id
JOIN products p ON oi.product_id = {2}
WHERE o.id = {3};`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's ticket pointer",
        why: "Lines travel on tickets through order_id — the first hop of the chain. The line's own id would match line numbers against ticket numbers and itemize a ticket that was never placed.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The second hop lands each line on its item: the line's product_id against the catalog's id. The catalog has no product_id column of its own — that guess errors before the itemization exists.",
      },
      {
        answer: "20",
        kind: "number",
        label: "the ticket number",
        why: "The candidate is ticket 20 — the one-and-done 705.39 order — and the number prints on every row of the itemization. Ticket 21 is a different account's cancelled 136.11 order with a completely different basket.",
      },
    ],
    distractors: ["oi.id", "p.product_id", "21", "oi.product_id"],
    walkthrough:
      "The itemization is a two-hop chain with a pin: lines to tickets on order_id, lines to items on product_id = p.id, pinned to ticket 20. Four lines come back: Smart Watch S at 3 for 196.62 each, HDMI 2.1 Cable 2m at 2 for 15.47, Bluetooth Speaker Mini at 1 for 60.11, Desk Mat Extended at 1 for 24.48. Add the lines and they land on 705.39 exactly — the ticket's ledger total, line by line. That's the bundle team's model, and it's a good one: a premium anchor with three cheap accessories attached, bought once by an account that never came back. Whether the bundle can do better is the team's problem; whether the basket reconciles to the ticket is now proven.",
  },
  {
    id: "cs-591",
    tier: "medium",
    topic: "cap2",
    universe: "month-close",
    title: "Revenue by fulfillment state",
    brief:
      "From: Controller. Re: month-end close, revenue support schedule.\n\nThe support schedule breaks booked value down by fulfillment state — what's completed, what's in transit, what's open, what died — with the totals as stored. The four lines have to reassemble the book's grand total to the cent, or the schedule doesn't leave my desk.",
    ask: "Each booking status with its total booked value, biggest value first.",
    template: `SELECT o.status, ROUND({4}, 2) AS revenue
FROM orders o
JOIN customers c ON {1} = {2}
GROUP BY {3}
ORDER BY revenue DESC;`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the ticket's account pointer",
        why: "The schedule rides the ticket-to-account reunion even though it groups by status — drop the reunion and the pairing key is gone. The ticket's own id against account ids would fabricate sixteen phantom accounts and corrupt every bucket.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id — the pointer's landing column. There is no customer_id on the register itself, so that guess errors before the schedule has a single line.",
      },
      {
        answer: "o.status",
        kind: "keyword",
        label: "the grouping column",
        why: "The buckets are fulfillment states, so the grouping is the ledger's status column. Grouping by region would produce four geographic buckets with entirely different totals and the schedule would reconcile to nothing.",
      },
      {
        answer: "SUM(o.total)",
        kind: "keyword",
        label: "the bucketed booked value",
        why: "Each bucket's value is the sum of its tickets' ledger totals. An average would report typical ticket size instead of bucket weight and every line of the schedule would misstate the book.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "c.region", "AVG(o.total)"],
    walkthrough:
      "The schedule is one grouping on a reunion: tickets joined to accounts on customer_id = c.id, summed by fulfillment state, ranked by value. Four lines come back: delivered 15,571.07, shipped 11,996.72, pending 6,113.00, cancelled 1,152.49 — and they reassemble to 34,833.28 exactly, the book's grand total, to the cent. The shape is the close's risk picture: not quite half the book has completed, another third is in transit, and the open pile is nearly five times the cancelled one — an unusually clean pipeline. The grouping column is where sloppy builds die: bucket by region and the schedule produces four geographic totals that reconcile to nothing anyone signs. Four states, four sums, one total — the schedule leaves the desk.",
  },
  {
    id: "cs-592",
    tier: "medium",
    topic: "cap2",
    universe: "refund-audit",
    title: "What was on the cancelled tickets",
    brief:
      "From: refunds@ — goodwill policy review. Re: basket composition.\n\nThe policy review wants to know what actually dies when a ticket is cancelled: the itemized contents of every killed ticket, product names and quantities, straight off the registers. If the queue is full of premium gear, the goodwill math changes; if it's cables and mats, it doesn't.",
    ask: "Ticket id, product name and quantity for every line on a cancelled booking.",
    template: `SELECT o.id, p.name, oi.quantity
FROM order_items oi
JOIN orders o ON {1} = o.id
JOIN products p ON oi.product_id = {2}
WHERE o.status = {3};`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's ticket pointer",
        why: "Lines attach to tickets through order_id — the hop that lets a status filter on the ticket reach the line. The line's own id would match line numbers against ticket numbers and invent a basket nobody cancelled.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The second hop lands each line on its item: the line's product_id against the catalog's id. There is no product_id column on the catalog itself — that guess errors and the review has no baskets.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the queue's status",
        why: "The queue is the quoted text 'cancelled', exact and lowercase. 'pending' would itemize the open pile instead of the dead one and the goodwill math would price tickets that can still ship.",
      },
    ],
    distractors: ["oi.id", "p.product_id", "o.id", "'pending'", "'shipped'"],
    walkthrough:
      "The basket review is a chain with a status filter at the ticket hop: lines to tickets on order_id, lines to items on product_id = p.id, kept to 'cancelled'. Twelve lines come back across the seven dead tickets — and the composition is the finding: Keiko Sato's 397.99 ticket held two Cycling Jerseys and two Laptop Stands, Alice Chen's killed tickets were mic-and-cable add-ons, and the small Mumbai cancellations were a keyboard and a desk mat. Premium gear dies with the big ticket; the small ones die with accessories. So the goodwill exposure scales with ticket size, exactly as the review hoped to prove — and the quantity column earns its slot, because two jerseys at risk reads very differently from two HDMI cables.",
  },
  {
    id: "cs-593",
    tier: "medium",
    topic: "cap2",
    universe: "pricing",
    title: "The revenue podium by shelf",
    brief:
      "From: Head of Product. Re: pricing reset, shelf ranking.\n\nThe reset's second slide ranks the shelves by earned line revenue — what each category has actually pulled in, at line grain, biggest first — and keeps the top three. If Audio runs away with it, the reset's weight follows; if the podium is tight, the story changes.",
    ask: "The 3 product categories with the highest lifetime line revenue, biggest first.",
    template: `SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON {1} = {2}
GROUP BY p.category
ORDER BY revenue {3}
LIMIT {4};`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Line revenue reaches its shelf through the line's product_id pointer to the catalog. The line's own id would match line numbers against item numbers and shred every shelf's total.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The pointer lands on the catalog's id column. The catalog has no product_id of its own — that guess errors before the ranking exists.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest first is descending — the podium opens on the strongest shelf. ASC would podium the three weakest shelves and the reset would weight its effort exactly backwards.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the podium size",
        why: "The slide carries exactly three shelves, so the cut is 3. Five is a table, two is a headline without a podium — and the reset's format has three slots.",
      },
    ],
    distractors: ["oi.id", "p.product_id", "ASC", "5"],
    walkthrough:
      "The podium is line-grain revenue grouped by shelf: lines joined to items on product_id = p.id, quantity times unit price summed per category, ranked descending, cut at three. The rows that land: Audio 11,744.01, Wearables 6,929.12, Video 5,198.41 — a third of the book's 34,833.28 sits on the audio shelf alone, and the podium drops steeply, with the floor shelf (Fitness, 863.91) nowhere in sight. The grain is the quiet hero of this build: quantity times unit price charges each line once, so the shelf totals are honest and reassemble the grand total exactly. Sum the tickets' own totals after this join and the same podium would inflate past recognition — the classic double-billing this reset refuses to print.",
  },
  {
    id: "cs-594",
    tier: "medium",
    topic: "cap2",
    universe: "inventory",
    title: "The fastest-moving catalog lines",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: pick-rate brief.\n\nThe Friday brief ranks the catalog by movement — total units actually purchased per item, not what's on the shelf — and carries the top three. The count plan gives those bins the tightest tolerance, so the ranking has to be the real three, off the purchase lines.",
    ask: "The 3 products with the most purchased units, with the unit counts, densest first.",
    template: `SELECT p.name, SUM(oi.quantity) AS units
FROM order_items oi
JOIN products p ON {1} = {2}
GROUP BY p.name
ORDER BY units DESC
LIMIT {3};`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Units move on purchase lines, and each line names its item through product_id. The line's own id would match line numbers against item numbers and crown whatever item shares numbers with busy lines.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The pointer lands on the catalog's id column. The catalog has no product_id column of its own — that guess errors before the ranking forms.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the brief's line count",
        why: "The brief carries exactly three bins, so the cut is 3. Five would put two tied mid-pack items on a list built for tight tolerances, and the count plan would spread its attention thin.",
      },
    ],
    distractors: ["oi.id", "p.product_id", "5", "2"],
    walkthrough:
      "The movement ranking is units summed per item: purchase lines joined to the catalog on product_id = p.id, quantities grouped by item, ranked descending, cut at three. The bins that land: Desk Mat Extended at 47 units, Noise-Canceling Headset at 46, HDMI 2.1 Cable 2m at 38. Two movers-per-sale patterns sit right there — the desk mat and the cable are cheap attach-rate items racking up volume one or two units at a time, while the headset moves one unit a sale at premium prices and still keeps pace. That mix is why the count plan gives all three tight tolerances for different reasons. The fourth place falls to a 36-unit tie, which is exactly the ambiguity the cut at three avoids printing.",
  },
  {
    id: "cs-595",
    tier: "hard",
    topic: "cap2",
    universe: "funnel",
    title: "Who wears the wearables in Europe",
    brief:
      "From: Growth marketing lead. Re: EU wearables pilot, seed list.\n\nThe wearables pilot seeds Europe first, and I want the raw purchase lines behind the claim: every wearable line an EU account has bought, with the buyer, the item and the quantity. The seed list is built from real purchases, not shelf guesses — if the list is fourteen lines, the pilot plans around fourteen.",
    ask: "Account name, product name and quantity for every wearable line bought by EU-region accounts.",
    template: `SELECT c.name, p.name, oi.quantity
FROM order_items oi
JOIN orders o ON {1} = o.id
JOIN customers c ON o.customer_id = {2}
JOIN products p ON oi.product_id = {3}
WHERE c.region = {4} AND p.category = {5}
ORDER BY c.name;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's ticket pointer",
        why: "Purchases live on lines, and lines reach tickets through order_id — the first hop of the four-file chain. The line's own id would match line numbers against ticket numbers and seed the pilot with phantom purchases.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The second hop lands each ticket on its account: the ticket's customer_id against the register's id. The register has no customer_id of its own, so that guess dies before the seed list exists.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The third hop carries each line to its item: the line's product_id against the catalog's id. There is no product_id column on the catalog itself — that spelling errors and the pilot has no list.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region value",
        why: "The pilot seeds Europe: the quoted text 'EU' on the account's region. 'US' would seed from Austin and Chicago and the pilot would launch on the wrong continent's purchases.",
      },
      {
        answer: "'Wearables'",
        kind: "keyword",
        label: "the shelf label",
        why: "The pilot is the quoted text 'Wearables', exact and case-sensitive. 'Fitness' would seed the pilot with yoga mats — a different shelf, a different customer, a wasted list.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "p.product_id", "'US'", "'Audio'"],
    walkthrough:
      "The seed list is the full four-file chain with two filters: lines to tickets, tickets to accounts, lines to items, kept to EU accounts and the Wearables shelf. Fourteen lines come back, and the concentration is the headline: Alice Chen owns seven of them, Noah Meyer four, and Chloe Dubois, Dmitri Volkov, Liam O'Brien and Olivia Brown one each. Split by item, it's a dead heat — seven Smart Watch S lines carrying 14 units against seven Fitness Band X2 lines carrying 14 units — so the pilot's two products are neck and neck inside Europe. The wrinkle worth flagging before launch: one of those watch buyers is Liam O'Brien, the one-and-done Cork account, and another is Dmitri Volkov, flagged inactive. Two of the fourteen seed lines belong to accounts that may never buy again — exactly what a shelf-level campaign plan would have missed.",
  },
  {
    id: "cs-596",
    tier: "hard",
    topic: "cap2",
    universe: "supplier",
    title: "Vendor revenue by region",
    brief:
      "From: Supply-chain lead. Re: QBR pack, regional sourcing picture.\n\nThe pack's closing page rolls vendor revenue up by the vendor's own region — where the money we spend on goods actually lands geographically. Region totals, biggest first, line grain as always. If Europe dominates the sourcing bill, the page says so with the figure.",
    ask: "Each vendor region with its total line revenue, biggest revenue first.",
    template: `SELECT s.region, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON {1} = {2}
JOIN suppliers s ON p.supplier_id = {3}
GROUP BY s.region
ORDER BY revenue DESC;`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Revenue accrues on lines, and each line names its item through product_id. The line's own id would match line numbers against item numbers and scatter the sourcing bill across the wrong items.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The pointer lands on the catalog's id column. The catalog has no product_id of its own — that guess errors before the regional picture exists.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The second hop lands each item on its vendor: the item's supplier_id against the vendor file's id. Vendors carry no supplier_id of their own, so that spelling breaks the chain.",
      },
    ],
    distractors: ["oi.id", "s.supplier_id", "s.stock", "p.price"],
    walkthrough:
      "The regional picture is the sourcing chain rolled to vendor regions: lines to items on product_id = p.id, items to vendors on p.supplier_id = s.id, summed by the vendor's region. Four rows come back: EU 15,895.88, US 9,294.93, APAC 6,029.22, LATAM 3,613.25 — and they reassemble the book's 34,833.28 exactly. The page's argument writes itself: Europe lands nearly half the sourcing bill on the strength of two vendors — Nordic Gadgets' 11,130.25 plus Alpine Audio's 4,765.63 — while the entire US total rides on a single vendor, Midwest Hardware at 9,294.93. One-vendor regions are concentration risk wearing a regional costume, and the QBR can now say which regions those are. Line grain keeps every figure honest; the four totals reconcile to the cent.",
  },
  {
    id: "cs-597",
    tier: "hard",
    topic: "cap2",
    universe: "expense",
    title: "The two-grain reconciliation",
    brief:
      "From: Ops finance, spend review. Re: the ledger-vs-lines dispute.\n\nThe dispute that will not die in the reviews: the paired ticket-lines report counts 251 rows, the ticket ledger counts 103 tickets, and someone is always surprised. I want all four figures on one row — raw lines, real tickets, the inflated total the pairing produces, and the honest line-charged total — so the meeting can see the whole machinery at once.",
    ask: "The raw paired-line count, the real ticket count, the inflated ledger total and the honest line total, side by side.",
    template: `SELECT {1} AS raw_lines, {2} AS real_tickets,
ROUND({3}, 2) AS inflated_total,
ROUND(SUM(oi.quantity * oi.unit_price), 2) AS honest_total
FROM order_items oi
JOIN orders o ON {4} = o.id;`,
    slots: [
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the raw paired-line count",
        why: "The raw count is every row the pairing produced — tickets repeated once per line. A column-targeted count would land on the same 251 here and teach nothing; the label exists to be compared against the ticket count beside it.",
      },
      {
        answer: "COUNT(DISTINCT o.id)",
        kind: "keyword",
        label: "the real ticket count",
        why: "Distinct ticket ids see through the repetition and count each ticket once — 103 where the raw pairing shows 251. Plain COUNT of the ticket column would count the copies and agree with the inflated row count.",
      },
      {
        answer: "SUM(o.total)",
        kind: "keyword",
        label: "the inflated ledger total",
        why: "Summing the ticket's own total over the pairing bills every ticket once per line — three lines, three billings. That double-billing is precisely the number the dispute keeps tripping over, reproduced on purpose.",
      },
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's ticket pointer",
        why: "The repetition comes from the join itself: lines attach to tickets through order_id. The line's own id would pair line numbers with ticket numbers and produce a pile whose figures reconcile to nothing.",
      },
    ],
    distractors: ["SUM(o.id)", "COUNT(DISTINCT o.customer_id)", "MIN(o.id)", "SUM(oi.quantity * oi.unit_price)", "AVG(o.total)"],
    walkthrough:
      "The reconciliation row lays the machinery bare: 251 raw paired lines, 103 real tickets, an inflated total of 103,244.55 against an honest line-charged total of 34,833.28. The inflated figure is the ticket ledger billed three times over — every multi-line ticket charges its full total once per line, which is why 34,833.28 of true value prints as 103,244.55, a factor of almost three. The honest column charges each line once — quantity times unit price — and lands on the ledger's own grand total to the cent. And the count pair explains it in one glance: 251 rows, 103 tickets, so the average ticket carries about 2.4 lines of repetition. Four figures, one row, no more dispute: the lines report was never wrong, it was answering a question about a different grain.",
  },
  {
    id: "cs-598",
    tier: "hard",
    topic: "cap2",
    universe: "growth",
    title: "The region-by-shelf revenue matrix",
    brief:
      "From: Chief of Staff. Re: board deck, the geography slide.\n\nThe geography slide wants the real matrix: region against shelf, line revenue in each cell, and only the cells above two thousand make the slide. If one region-shelf pair outsells whole regions, the deck should lead with it — but the cut has to be applied, not remembered.",
    ask: "Each region-shelf pair with line revenue above 2000, biggest revenue first.",
    template: `SELECT c.region, p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN orders o ON {1} = o.id
JOIN customers c ON o.customer_id = {2}
JOIN products p ON oi.product_id = {3}
GROUP BY c.region, p.category
HAVING SUM(oi.quantity * oi.unit_price) > {4}
ORDER BY revenue DESC;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's ticket pointer",
        why: "Revenue is earned on lines, and lines reach tickets through order_id — the first hop of the chain. The line's own id would match line numbers against ticket numbers and fabricate cells no region earned.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The second hop lands each ticket on its account: the ticket's customer_id against the register's id. The register carries no customer_id of its own, so that guess errors before the matrix forms.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The third hop carries each line to its shelf: the line's product_id against the catalog's id. There is no product_id column on the catalog itself — that spelling errors and the slide has no cells.",
      },
      {
        answer: "2000",
        kind: "number",
        noVerify: true,
        label: "the slide's cut line",
        why: "The slide carries cells above 2,000 — the deck's own bar. Dropping it to 1,000 would flood the slide with mid-pack cells and bury the two five-thousand-dollar leaders the story needs.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "p.product_id", "3000", "1000"],
    walkthrough:
      "The matrix is the four-file chain grouped twice: lines to tickets, tickets to accounts, lines to items, summed per region-and-shelf, cut at 2,000. Four cells survive: APAC Audio 5,162.40, EU Audio 5,102.40, EU Wearables 3,886.30, EU Video 2,260.79. The headline is a near-tie at the top — Dubai-to-Seoul audio outsells Europe's audio by 60 dollars — but the shape behind it is the real story: Europe places three of the four surviving cells while APAC's entire board presence is one audio cell, and the US lands nothing above the cut at all despite its 7,286.16 regional total. Wide but shallow versus narrow and tall — that's the geography slide, and the 2,000 bar is what keeps four cells from becoming a spreadsheet.",
  },
  {
    id: "cs-599",
    tier: "hard",
    topic: "cap2",
    universe: "fraud",
    title: "Open exposure by account",
    brief:
      "From: Risk team, spot-check rotation. Re: the pending board.\n\nThe rotation's pending board ranks accounts by open exposure — the line-charged value still sitting in pending — and carries the top five. If one account's open book dwarfs the rest, the reviewer starts there; if it's a tight pack, the rotation works it evenly. Either way, real figures.",
    ask: "The 5 accounts with the highest pending exposure at line grain, biggest first.",
    template: `SELECT c.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS exposure
FROM order_items oi
JOIN orders o ON {1} = o.id
JOIN customers c ON o.customer_id = {2}
WHERE o.status = {3}
GROUP BY c.name
ORDER BY exposure DESC
LIMIT {4};`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's ticket pointer",
        why: "Exposure is charged line by line, and lines reach tickets through order_id. The line's own id would match line numbers against ticket numbers and invent exposure nobody carries.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The second hop lands each ticket on its account: the ticket's customer_id against the register's id. The register has no customer_id of its own, so that guess errors before the board exists.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open status",
        why: "Open exposure means the quoted text 'pending' — exact and lowercase. 'shipped' would rank accounts for goods already on trucks and the rotation would chase risk that is actively resolving itself.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the board's depth",
        why: "The board carries exactly five names, so the cut is 5. Eight would reprint the whole pending population; three would hide the mid-pack accounts the rotation still has to schedule.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "'shipped'", "3", "8"],
    walkthrough:
      "The pending board is line-grain exposure ranked and cut: lines to tickets on order_id, tickets to accounts on customer_id = c.id, pending only, summed per account, top five. The board reads: Emma Wilson 1,471.43, Chloe Dubois 1,309.92, Farid Nasser 1,088.44, Alice Chen 788.83, Pedro Alvarez 576.54. The file's second-biggest spender tops the open-exposure board — a 1,471.43 open book spread over three tickets — while the single biggest pending ticket on the ledger, Farid's 1,088.44, sits third because it's his only open line. Eight accounts hold pending value in total, so the board's cut at five is a policy choice the rotation can defend: the bottom three hold under 900 between them. The reviewer starts in Austin, and the figures say so.",
  },
  {
    id: "cs-600",
    tier: "hard",
    topic: "cap2",
    universe: "catalog",
    title: "The product revenue podium, vendors attached",
    brief:
      "From: Catalog content manager. Re: sourcing page, the hero shelf.\n\nThe sourcing page closes on its hero podium: the three products that have earned the most line revenue, each with the vendor behind it on the same row. If one vendor owns the whole podium, the page's concentration note writes itself — but the podium has to be the true three, at line grain, vendors verified.",
    ask: "The 3 products with the highest lifetime line revenue, with their vendors, biggest first.",
    template: `SELECT s.name, p.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON {1} = {2}
JOIN suppliers s ON p.supplier_id = {3}
GROUP BY s.name, p.name
ORDER BY revenue DESC
LIMIT {4};`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Revenue accrues on lines, and each line names its item through product_id. The line's own id would match line numbers against item numbers and podium items nobody actually bought.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The pointer lands on the catalog's id column. The catalog has no product_id of its own — that guess errors before the podium exists.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The second hop lands each item on its vendor: the item's supplier_id against the vendor file's id. Vendors carry no supplier_id of their own, so that spelling breaks the chain.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the podium size",
        why: "The page carries exactly three heroes, so the cut is 3. Six is a leaderboard, two is a headline — and the sourcing page's format has three slots to fill.",
      },
    ],
    distractors: ["oi.id", "s.supplier_id", "s.stock", "5"],
    walkthrough:
      "The hero podium is the sourcing chain at line grain with a ranked cut: lines to items on product_id = p.id, items to vendors on p.supplier_id = s.id, revenue summed per product, top three. The rows that land: Noise-Canceling Headset 6,888.25 from Midwest Hardware Co, Smart Watch S 4,582.02 from Nordic Gadgets AB, 4K Webcam Pro 3,989.97 from Nordic Gadgets AB. Two of the three heroes come from one EU vendor — the concentration note writes itself — while the top hero, the headset, is the US vendor's single premium line, earned across 24 sales lines at mid-three-digit unit prices. The gap from podium to also-ran is steep: the next product down earns hundreds, not thousands, so the cut at three captures the real tier. Line grain keeps every figure reconcilable — the three heroes sum inside the book's 34,833.28, and the page can prove it.",
  },
];
