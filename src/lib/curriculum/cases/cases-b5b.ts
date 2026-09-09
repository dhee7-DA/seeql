// Case files batch B5b — topic l5 (ORDER BY & LIMIT), ids cs-106…cs-115.
// Sort-and-trim lesson: top-N / bottom-N asks, direction discipline (ASC vs
// DESC), row caps (LIMIT), skip-and-take paging (OFFSET), multi-key ordering.
// Every figure audited against the live seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesB5b: CaseStudy[] = [
  {
    id: "cs-106",
    tier: "medium",
    topic: "l5",
    universe: "supplier",
    title: "Suppliers on the improvement list",
    brief:
      "From: Supply-chain lead. Re: Q1 supplier scorecards.\n\nWe only have room for two structured improvement reviews this quarter, and the slots go to the partners with the weakest scores — worst score first, so the meeting invite order matches the urgency. Pull the two lowest-rated suppliers with their ratings; I'll build both agendas from your list.",
    ask: "Supplier name and rating for the 2 lowest-rated suppliers, worst rating first.",
    template: `SELECT name, rating
FROM suppliers
{1} BY rating {2}
{3} {4};`,
    slots: [
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the ranking clause",
        why: "Ranking suppliers by score is ordering, so ORDER BY. GROUP would crush the table into score buckets and lose the supplier names you were asked for.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the score direction",
        why: "Worst first means the smallest rating sits on top — ascending. DESC would fetch the two best-rated partners (Alpine Audio at 4.8) and book remediation slots with suppliers who need no help.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the row cap",
        why: "Two review slots exist this quarter, so LIMIT 2 trims the sorted list to exactly two rows. OFFSET would skip rows instead of capping them — the wrong tool for a fixed headcount.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the review headcount",
        why: "Capacity, not data: two improvement reviews fit the quarter, so the cap is 2. It never appears in the result itself — it only decides how many rows survive the cut.",
        noVerify: true,
      },
    ],
    distractors: ["DESC", "OFFSET", "TOP", "5"],
    walkthrough:
      "'Two review slots, weakest scores first' reads as: order by rating ascending, then cap at two. Ascending is the direction people fumble here — every other ranking ask this month wanted biggest first, but a bottom-N ask needs ASC; DESC would hand me Alpine Audio GmbH at 4.8 and Nordic Gadgets AB at 4.6, our two best partners, for remediation meetings. So: ORDER BY rating ASC, then LIMIT 2 makes the cut after the sort. The rows that come back: Pacific Textiles at 3.9 and Andes Naturals SA at 4 — the two partners below the pack (next worst, Shenzhen Electro, sits at 4.1 and just misses the cut). Ratings are distinct down the whole table, so the two-seat cut is unambiguous. Agenda one: Pacific Textiles' defect rate; agenda two: Andes' delivery slippage.",
  },
  {
    id: "cs-107",
    tier: "medium",
    topic: "l5",
    universe: "expense",
    title: "Page two of the spend ledger",
    brief:
      "From: Ops finance, spend owner. Re: February spend reconciliation.\n\nWe reconcile the ticket ledger in pages of five, biggest tickets first, and page one is signed off. Send page two — the next five tickets by value after the ones already reconciled — with id, value and status so I can match each against its receipt. I'll sign those five and we page onward tomorrow.",
    ask: "Order id, total and status for spend ranks 6 through 10, biggest first — page two of five-ticket pages.",
    template: `SELECT id, total, status
FROM orders
{1} BY total {2}
LIMIT 5 {3} {4};`,
    slots: [
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the ranking clause",
        why: "Spend ranks only exist once the rows are ordered by total, so ORDER BY. GROUP would collapse orders into value buckets — a different shape than the per-ticket ledger page the sign-off needs.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the value direction",
        why: "Biggest first is descending. ASC would flip the ledger and page two would become the five smallest tickets — orders 51, 72, 49 — nowhere near what page one skipped.",
      },
      {
        answer: "OFFSET",
        kind: "keyword",
        label: "the page skip",
        why: "Page one consumed the first five rows, so OFFSET 5 discards them after the sort and hands back ranks 6–10. Without the skip you'd re-reconcile page one.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the page size",
        why: "The offset mirrors the page size: five tickets were signed off, so five get skipped. It's ledger arithmetic — a paging constant, not a figure stored in any order row.",
        noVerify: true,
      },
    ],
    distractors: ["ASC", "TOP", "10"],
    walkthrough:
      "Paging is a two-step trick: the sort decides the order of the whole ledger, then OFFSET 5 throws away the five rows page one already consumed and LIMIT 5 (already in the template) takes the next five. Both run after the sort, so 'skip the signed-off tickets' is literal, not approximate. The rows that land: order 3 at 767.64, order 6 at 752.96, order 5 at 725.34, order 20 at 705.39, order 14 at 705.23 — spend ranks 6 through 10, straight after page one's closer at 785.79. Worth flagging to myself before signing: the page is a status mix, and order 5 is still pending, so its receipt chase may come up empty. Also note how tight the tail is — 705.39 versus 705.23, two different tickets one decimal apart; the sort direction is the only thing keeping them in rank order.",
  },
  {
    id: "cs-108",
    tier: "medium",
    topic: "l5",
    universe: "catalog",
    title: "The back of the catalog proof",
    brief:
      "From: Catalog content manager. Re: print proof, back cover.\n\nThe print vendor needs the tail of the catalog for the back-cover proof: the last three listings exactly as they fall at the end of the alphabet, Z toward A, with list prices. This mirrors the front-cover proof we pulled from the other end last month. Send those three names and prices and I'll lay out the spread.",
    ask: "Product name and price for the last 3 catalog listings alphabetically, Z to A.",
    template: `SELECT name, price
FROM products
ORDER BY {1} {2}
LIMIT {3};`,
    slots: [
      {
        answer: "name",
        kind: "keyword",
        label: "the sort column",
        why: "Alphabetical position comes from the name column — ORDER BY name. Sorting by price or stock would silently deliver a different trio, and the proof wouldn't match the printed sequence.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the alphabet direction",
        why: "The back of the proof means Z toward A, which is name DESC. ASC returns the front of the catalog — 4K Webcam Pro, Bluetooth Speaker Mini, Cycling Jersey Pro — the exact opposite end of the spread.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the proof cap",
        why: "The back-cover spread holds three listings, so the cap is 3. It's a layout constraint from the print spec, not a number that shows up in any product row.",
        noVerify: true,
      },
    ],
    distractors: ["ASC", "price", "stock", "5"],
    walkthrough:
      "The ask is 'last three alphabetically', and the clean way to grab a tail is to sort the whole column in reverse and stand at the top of it: ORDER BY name DESC, then LIMIT 3. The rows that come back: Yoga Mat Eco 6mm at 32, Wireless Mouse M3 at 34.5, USB-C Hub 7-in-1 at 49 — the true tail of the alphabet, since every name starts with an uppercase letter and binary ordering puts digits like the '4' in 4K Webcam Pro ahead of all of them. That's the trap the direction hides: run ASC and the back cover would open with 4K Webcam Pro, Bluetooth Speaker Mini and Cycling Jersey Pro — the front of the catalog printed on the wrong cover. Names are all distinct, so the three-row cut is clean from either end of the alphabet.",
  },
  {
    id: "cs-109",
    tier: "medium",
    topic: "l5",
    universe: "month-close",
    title: "The three oldest open tickets",
    brief:
      "From: Financial Controller. Re: aging review, February close.\n\nBefore I sign the revenue number I want eyes on the aging tail: the three longest-open bookings still sitting in pending — old money that hasn't moved in weeks. Give me their ids, totals and booking dates, oldest booking first. Anything that can't be confirmed or cleared by Friday comes off the signed number, so the order matters as much as the rows.",
    ask: "Order id, total and created date for the 3 oldest pending orders, oldest first.",
    template: `SELECT id, total, created_at
FROM orders
WHERE status = {1}
ORDER BY created_at {2}
{3} {4};`,
    slots: [
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open status",
        why: "Still-open money is the quoted status 'pending'. 'Shipped' would audit parcels already on trucks — the opposite of an aging open-ticket list.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the aging direction",
        why: "Oldest first is ascending dates. DESC would open with the newest booking in the book — the one order that needs no chasing — and the aging tail would stay invisible.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the review cap",
        why: "The review samples three tickets, so LIMIT 3 trims the sorted pending list to its aging head. OFFSET with no LIMIT in front is a syntax error, not a window.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the aging sample size",
        why: "The memo fixes the aging sample at three bookings — a review-policy number, not a figure stored in any order row.",
        noVerify: true,
      },
    ],
    distractors: ["'shipped'", "DESC", "OFFSET", "5", "total"],
    walkthrough:
      "Aging wants ascending dates: the pending book sorted by created_at ASC, capped at three. The rows that come back: order 5 at 725.34, booked 2024-01-02; order 1 at 576.54, booked 2024-01-05; order 12 at 148.28, booked 2024-02-07. Order 5 is the escalation — booked over a year ago and still pending, which at close is no longer aging but fossilized; the three rows together carry 1,450.16 of open money. Context for the memo: the pending book holds 14 tickets, so this is the head of a longer tail if the Friday deadline slips. The DESC trap runs the review backwards — it would surface the freshest bookings, the ones that need nothing. And bare pending without quotes reads as a column name: the query never leaves the gate.",
  },
  {
    id: "cs-110",
    tier: "medium",
    topic: "l5",
    universe: "growth",
    title: "The rollout sheet, region by region",
    brief:
      "From: Chief of Staff. Re: regional rollout sequencing.\n\nThe board wants the rollout sheet grouped region by region — APAC pilots first this cycle — and inside each region the accounts should run A to Z so the sheet reads like a directory. Show the first eight rows of that ordering with each account's active flag so we can see who's still live. Eight rows is what fits on the one-pager.",
    ask: "Account name, region and active flag for the first 8 rows when customers run region by region, A to Z within each region.",
    template: `SELECT name, region, active
FROM customers
ORDER BY {1} {2}, {3} ASC
LIMIT {4};`,
    slots: [
      {
        answer: "region",
        kind: "keyword",
        label: "the primary sort key",
        why: "Region-by-region grouping starts with ORDER BY region — the first key sets the blocks. city would scramble the regions together and the sheet would read city-shuffled instead of block-by-block.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the region direction",
        why: "APAC pilots first means the alphabet's front region block leads the sheet, so region ASC. DESC would open with US accounts and bury the APAC pilot list at the bottom of the page.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the tie-break key",
        why: "Inside each region the directory runs A to Z, so name is the second key. One key isn't enough once several accounts share a region — the second key sorts within the first.",
      },
      {
        answer: "8",
        kind: "number",
        label: "the one-pager cap",
        why: "The one-pager fits eight rows, so LIMIT 8. It's slide real estate — a layout constant from the board pack, not a figure from the customer table.",
        noVerify: true,
      },
    ],
    distractors: ["DESC", "city", "price", "5"],
    walkthrough:
      "Multi-key sorting is the whole game here: the first key builds the blocks (region ASC puts APAC, EU, LATAM, US in that order), and the second key orders inside each block (name ASC). The rows that come back: Farid Nasser, Grace Kim, Hiro Tanaka, Keiko Sato, Maya Patel — all APAC — then Alice Chen, Chloe Dubois and Dmitri Volkov opening the EU block. That's the eight-row page, and it cuts mid-region on purpose: Isabella Rossi is row nine. Two flags for the board: Keiko Sato and Dmitri Volkov carry active = 0, so the pilot list needs a liveness check before invites go out, and swapping the first key to city would keep things alphabetical-ish while destroying the regional grouping the board asked for. The cap is what forces the priority conversation — eight seats, five of them already APAC.",
  },
  {
    id: "cs-111",
    tier: "medium",
    topic: "l5",
    universe: "refund-audit",
    title: "Everything past the escalation bar",
    brief:
      "From: refunds@ internal ticket #4487.\n\nPolicy change from the committee for this quarter-end goodwill audit: no capped call batch this cycle. Every order at or above the 500 escalation bar gets assessed, biggest first, however many that turns out to be. Pull the full escalation list with each order's status so agents can see whether a ticket is still active before dialing — a cancelled ticket gets a different script than a live one.",
    ask: "Order id, total and status for every order totalling 500 or more, biggest first.",
    template: `SELECT id, total, {1}
FROM orders
WHERE total {2} {3}
ORDER BY total {4};`,
    slots: [
      {
        answer: "status",
        kind: "keyword",
        label: "the liveness column",
        why: "Agents check whether a ticket is still active before dialing, so the list carries status. Without it — just id and total — every call starts with a second lookup.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the bar operator",
        why: "'500 or more' is >= — a ticket at exactly 500.00 still escalates. > would quietly drop boundary tickets from the queue the committee ordered.",
      },
      {
        answer: "500",
        kind: "number",
        label: "the escalation bar",
        why: "The bar is 500 — a policy line from the committee ticket, not a figure stored in any order row.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the priority direction",
        why: "Biggest first, per the ticket. ASC would open the audit with the smallest qualifying ticket — the least material call of the day.",
      },
    ],
    distractors: ["created_at", "<", "1000", "ASC", "ROUND"],
    walkthrough:
      "No LIMIT this cycle — the committee dropped the cap, so the query is a filtered sort with the tail left on: WHERE total >= 500, ORDER BY total DESC, and the status column along for liveness. Run it and 25 tickets clear the bar. The top of the list: order 74 at 1,088.44, order 43 at 945.21, order 39 at 845.92; the tail ends at order 16, 507.24, still comfortably past the bar. Five of the twenty-five are still pending — 3,921.32 of live exposure — and they get dialed before anything shipped or delivered. Two traps for the huddle: the operator is >= because a ticket at exactly 500.00 must not fall off the queue — strict > would drop it — and a 1000 bar would cut the queue to a single call, which is not what 'everyone past the bar' means. ASC runs the audit backwards, smallest first.",
  },
  {
    id: "cs-112",
    tier: "hard",
    topic: "l5",
    universe: "pricing",
    title: "The mid-shelf repricing band",
    brief:
      "From: Head of Product. Re: spring repricing wave.\n\nThe committee already cleared the top three shelves, so the spring wave starts below them: the next five products by list price, priciest of the band first. That mid-band is where our margin story lives this quarter. Send name and price for those five so the deck can anchor on the band's opening and closing numbers.",
    ask: "Product name and price for the 5 products at price ranks 4 through 8, priciest of the band first.",
    template: `SELECT name, price
FROM products
ORDER BY {1} {2}
{3} {4} {5} {6};`,
    slots: [
      {
        answer: "price",
        kind: "keyword",
        label: "the sort column",
        why: "Price ranks come from ORDER BY price. name would sort alphabetically and hand the committee an arbitrary band that has nothing to do with price position.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the price direction",
        why: "Priciest first is DESC — the band descends from 119 toward 59.99. ASC would build the band from the bargain shelves, and the committee would re-review products they already cleared.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the band size",
        why: "The wave covers five products, so LIMIT 5 takes the first five rows that survive the skip. OFFSET alone can't cap the band — it only discards.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the band width",
        why: "Five SKUs per repricing wave is the committee's cadence, so LIMIT 5. Cadence, not catalog data — no product row carries a 5.",
        noVerify: true,
      },
      {
        answer: "OFFSET",
        kind: "keyword",
        label: "the skip clause",
        why: "The top three are already cleared, so OFFSET 3 discards them after the sort. LIMIT without the skip would re-serve shelves one to three.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the cleared count",
        why: "Exactly three shelves are signed off, so OFFSET 3. It's meeting history — a count from the last wave's minutes, not a figure that appears in the result.",
        noVerify: true,
      },
    ],
    distractors: ["ASC", "TOP", "79", "149.99"],
    walkthrough:
      "Skip-and-take composes: ORDER BY price DESC ranks all sixteen products, OFFSET 3 throws away the cleared top three (199.99, 149.99, 129), and LIMIT 5 takes exactly the next five. The rows that come back: Studio Desktop Mic at 119, Mechanical Keyboard K1 at 89.99, Fitness Band X2 at 79, Cycling Jersey Pro at 65, Bluetooth Speaker Mini at 59.99 — the mid-band opens at 119 and closes at 59.99, with USB-C Hub at 49 missing the cut by a tenner. The two constants do different jobs and the deck should quote both: the 3 is history (already cleared), the 5 is cadence (this wave's width). Direction matters double here — ASC with the same skip would start the band at 14.99 and work upward, which is the bargain-bin meeting, not this one.",
  },
  {
    id: "cs-113",
    tier: "medium",
    topic: "l5",
    universe: "fraud",
    title: "Card-testing sweep: the tiniest tickets",
    brief:
      "From: Risk team, spot-check rotation.\n\nCard-testing fraud shows up as a cluster of implausibly small orders, so this month's sweep runs the opposite direction from our usual big-ticket review: the three smallest orders on the ledger, tiniest first. Send order ids with totals so we can match them against the BIN list. The big-ticket rotation already covers the top end; don't duplicate it.",
    ask: "Order id and total for the 3 smallest orders on file, smallest first.",
    template: `SELECT id, total
FROM orders
ORDER BY {1} {2}
{3} {4};`,
    slots: [
      {
        answer: "total",
        kind: "keyword",
        label: "the sort column",
        why: "Ticket size lives in total, so ORDER BY total. created_at would rank by booking date and sample the oldest orders — a different sweep entirely.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the size direction",
        why: "Smallest first is ascending. DESC is the big-ticket rotation's direction — it would re-serve orders 74, 43 and 39, which the other reviewers already hold.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the row cap",
        why: "The sweep reviews three tickets, so LIMIT 3 trims after the sort. OFFSET would skip the very rows — the tiniest ones — the sweep exists to find.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the sweep cap",
        why: "Three tickets per sweep is the rotation's policy, so the cap is 3 — reviewer capacity, not a ledger figure.",
        noVerify: true,
      },
    ],
    distractors: ["DESC", "created_at", "25.47", "5"],
    walkthrough:
      "Bottom-N is where direction discipline pays: ORDER BY total ASC puts the smallest ticket on top, LIMIT 3 cuts there. The rows that come back: order 51 at 25.47, order 72 at 30.24, order 49 at 32.01 — an 87.72 cluster of micro-tickets, exactly the size card-testing runs at. Two analyst notes: the smallest total itself, 25.47, is a result figure — it belongs in the output, never in the cap slot; and DESC here wouldn't be wrong SQL so much as the wrong investigation, re-listing the three biggest tickets the big-ticket rotation already cleared (74 at 1,088.44 tops that list). Totals are unique across the whole ledger, so the three-row cut is unambiguous and the BIN match can proceed on exactly these three.",
  },
  {
    id: "cs-114",
    tier: "medium",
    topic: "l5",
    universe: "inventory",
    title: "The count sheet's opening lines",
    brief:
      "From: Warehouse ops manager. Re: cycle count, week 9.\n\nOur count sheets run alphabetically — the crew starts at the top of the catalog and works down, so the first page is always the same handful of lines. I want those opening lines printed with current units on hand, so the crew can flag anything that looks off before they start counting. Print the first four products A to Z, name and units, exactly as the sheet will read.",
    ask: "Product name and stock for the first 4 products in alphabetical order.",
    template: `SELECT name, stock
FROM products
ORDER BY name {1}
{2} {3};`,
    slots: [
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sheet direction",
        why: "A sheet that runs A to Z is ascending order, so ASC. DESC would start the count at the end of the alphabet — the crew would begin at the catalog's last line instead of its first.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the page cut",
        why: "The opening page holds four lines, so LIMIT 4 trims the alphabetical catalog to its head. OFFSET would skip the first lines — the very ones the crew starts with.",
      },
      {
        answer: "4",
        kind: "number",
        label: "the page length",
        why: "The opening page is four lines — a print-layout constant from the count schedule, not a figure stored in the catalog.",
        noVerify: true,
      },
    ],
    distractors: ["DESC", "OFFSET", "stock", "5", "GROUP"],
    walkthrough:
      "The sheet's first page, as printed: ORDER BY name ASC, LIMIT 4. The rows that come back: 4K Webcam Pro at 70 units, Bluetooth Speaker Mini at 210, Cycling Jersey Pro at 110, Desk Mat Extended at 260. The quiet lesson sits in the first row: binary ordering puts the digit 4 of '4K Webcam Pro' ahead of every letter, so the 'alphabetical' sheet opens with a number — the same quirk that decides which product leads the catalog from either end. Direction is the whole trap here: DESC would start the crew at the catalog's tail, printing the sheet's back cover as its front page. Units on this page run 70 to 260 — nothing dangerously thin at the top of the sheet today; the thin shelves sit further down the alphabet.",
  },
  {
    id: "cs-115",
    tier: "medium",
    topic: "l5",
    universe: "funnel",
    title: "The entry-price shelf for the landing page",
    brief:
      "From: Growth marketing, acquisition. Re: landing page refresh.\n\nThe new landing page leads with a cheap-entry shelf and every item on it must be genuinely buyable — nothing that would dead-end at checkout. Pull the five cheapest items we actually hold in stock, cheapest at the top, with price and units so paid social can quote live numbers. If the shelf reads tempting but unbuyable, the click budget burns.",
    ask: "Product name, price and stock for the 5 cheapest in-stock items, cheapest first.",
    template: `SELECT name, price, stock
FROM products
WHERE stock > 0
ORDER BY {1} {2}
LIMIT {3};`,
    slots: [
      {
        answer: "price",
        kind: "keyword",
        label: "the sort column",
        why: "Cheapest-first is a price ordering — ORDER BY price. stock would rank by units on the shelf and the 'cheap' shelf would fill by warehouse volume, not by price.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the price direction",
        why: "Cheapest at the top is ASC. DESC builds a luxury shelf — Smart Watch S at 199.99 first — exactly the audience the landing page isn't buying.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the shelf cap",
        why: "The landing page holds five tiles, so LIMIT 5. It's a layout constant from the design spec, not a number in any product row.",
        noVerify: true,
      },
    ],
    distractors: ["DESC", "stock", "name", "500"],
    walkthrough:
      "The WHERE guard runs before the sort — stock > 0 keeps only buyable items — then ORDER BY price ASC stacks the cheapest on top and LIMIT 5 fills the page. The rows that come back: HDMI 2.1 Cable 2m at 14.99 (500 on hand), Running Socks 3-pack at 18.5 (400), Desk Mat Extended at 24.99 (260), Yoga Mat Eco 6mm at 32 (220), Wireless Mouse M3 at 34.5 (300). The guard costs nothing today — nothing in the catalog sits at zero — but it keeps the shelf honest the day a SKU sells out mid-campaign. Two traps worth coaching: direction (DESC would open the shelf at 199.99 and bid our click budget against luxury shoppers) and sort column (stock as the key would still return five rows — just the five fullest bins, not the cheap ones). The shelf closes at 34.5; that's the ceiling our ad copy can promise.",
  },
];
