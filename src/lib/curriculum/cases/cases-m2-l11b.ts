// Case batch M2-L11b — topic l11 (Multi-table chains), ids cs-386…cs-401.
// Hop-by-hop chains: line items → bookings → accounts (→ catalog → vendors),
// hop conditions as slots, filters at any hop, grain pinned at 251.
// Every figure is audited against the live seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesM2L11b: CaseStudy[] = [
  {
    id: "cs-386",
    tier: "easy",
    topic: "l11",
    universe: "supplier",
    title: "Nordic's ledger, priciest lines first",
    brief:
      "From: Supply-chain lead. Re: QBR pack, Nordic section.\n\nThe Nordic Gadgets AB page still quotes list prices, and I want it to quote reality instead: every line we've bought from them with the booked unit price and quantity, dearest first. If their premium gear books over list, the pack should say so on the record. Exact vendor name as registered, full route through the catalog.",
    ask: "Line id, product name, unit price and quantity for every line sourced from Nordic Gadgets AB, dearest first.",
    template: `SELECT oi.id, p.name, oi.unit_price, oi.quantity
FROM order_items oi
JOIN products p ON {1} = {2}
JOIN suppliers s ON p.supplier_id = s.id
WHERE s.name = {3}
ORDER BY oi.unit_price DESC;`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "The vendor is reached through the catalog: each line points at its product via product_id, and the product points at the vendor. The line's own id would invent product pairings and misattribute half the vendor's book.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The catalog numbers items in id, and the line's pointer lands there. Matching line numbers straight against item numbers fabricates pairs — and on items 1 through 6 the seed quirk makes the wrong key look almost right.",
      },
      {
        answer: "'Nordic Gadgets AB'",
        kind: "keyword",
        label: "the registered vendor name",
        why: "The vendor is registered as the exact text 'Nordic Gadgets AB', quotes included. 'Alpine Audio GmbH' would build the Nordic page out of Alpine's forty lines and the QBR section would misfile both vendors.",
      },
    ],
    distractors: ["oi.id", "s.supplier_id", "'Alpine Audio GmbH'"],
    walkthrough:
      "The vendor page needs the route lines → catalog → vendor file, pinned to Nordic's registered name, sorted by booked price. Forty-three lines come back — the file's biggest vendor by revenue at 11,130.25 — and the top of the page is the finding: the three dearest lines are all the Smart Watch S, booked at 209.68, 205.81 and 205.31, every one above the 199.99 list. So Nordic's premium anchor doesn't just hold its price, it books over list — and the pack can show the exact line numbers. Below the podium the basket spreads across the Keyboard, Webcam and Hub, but the headline writes itself: the EU's best-rated vendor is also the one whose flagship books above list.",
  },
  {
    id: "cs-387",
    tier: "easy",
    topic: "l11",
    universe: "expense",
    title: "The open book, line by line",
    brief:
      "From: Ops finance, spend review. Re: open-items register.\n\nThe spend review opens with the open-items register and this cycle I want it at line grain: every line still riding a pending booking, with the account name and the booking's total, biggest booking first. The small tickets stay on the register — this is the full open book, nothing trimmed.",
    ask: "Account name, booking id, total and line id for every line on a pending booking, biggest booking first.",
    template: `SELECT c.name, o.id, o.total, oi.id
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON o.customer_id = c.id
WHERE o.status = {3}
ORDER BY o.total DESC;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "The register starts at the line ledger, and each line points at its booking through order_id. The line's own id would pair line numbers with booking numbers and fabricate open items nobody owes.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id — the pointer's landing column. Bookings have no order_id of their own, so that guess errors before the register prints.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open status",
        why: "Open items means the exact text 'pending' — quoted, lowercase. 'shipped' would register tickets already in transit as open and the review would chase bookings that are resolving themselves.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "'shipped'"],
    walkthrough:
      "The open register is one status filter at the booking hop, reached from the line ledger, with names attached through the account pointer and the sort running on booking total. Thirty-six rows come back over the 14 pending bookings — and the repetition is instructive: Farid Nasser's 1,088.44 booking 74 surfaces three times, once per line, with Chloe Dubois's 945.21 on booking 43 repeating the same way behind it. So the register's true shape is fourteen tickets, not thirty-six, and its head is exactly the open-items schedule's lead. Reading down, the book spreads across eight accounts with Alice and Emma holding multiple tickets each. Line grain shows the load; booking totals keep the money honest — the register needs both.",
  },
  {
    id: "cs-388",
    tier: "easy",
    topic: "l11",
    universe: "growth",
    title: "Mumbai's ledger, in full",
    brief:
      "From: Chief of Staff. Re: board deck, city page.\n\nThe deck's city page carries Mumbai this cycle and I want the full trail behind it: every line the city's account has ever booked, with the booking number, total and quantity, in booking order. If Mumbai's whole number is one person, the page should say so honestly — from the registers, not the anecdote.",
    ask: "Booking id, total and line quantity for every line from accounts in the city of Mumbai, in booking order.",
    template: `SELECT o.id, o.total, oi.quantity
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON {3} = {4}
WHERE c.city = 'Mumbai'
ORDER BY o.id;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Quantities live on the lines, and each line points at its booking through order_id. The line's own id would fabricate pairings and salt Mumbai's page with bookings that never carried these lines.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id, and the pointer lands there. There is no order_id on the booking itself — that spelling breaks the page before it renders.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "The city lives on the account register, so the booking points there through customer_id. Skip the hop and Mumbai's page becomes every city's trail at once.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id — the landing column for the booking's pointer. The register has no customer_id of its own, so that guess errors before the deck page exists.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "o.order_id", "'Nagoya'"],
    walkthrough:
      "One city filter on the register, two hops to reach the line grain: bookings point at accounts, lines point at bookings. Thirty rows come back over thirteen bookings — every one of them Maya Patel, because Mumbai's register holds exactly one account. Her lifetime figure is 3,644.56 across those thirteen bookings, fourth-highest on the file, and the booking-order sort shows the cadence: steady small-to-mid tickets rather than one spike. So the city page tells the truth the deck needs: Mumbai is not a market, it is a power user — 30 lines, 13 bookings, one name. If she churns, the city's number goes to zero, and the trail in front of the board makes that visible before the budget does.",
  },
  {
    id: "cs-389",
    tier: "easy",
    topic: "l11",
    universe: "fraud",
    title: "Dormant accounts, live activity",
    brief:
      "From: Risk team, spot-check rotation. Re: dormant-account sweep.\n\nThe quarterly sweep pairs the register's dormant flags against actual activity: accounts flagged inactive should show no live trail, and any line that surfaces is worth a second look. Pull every line riding a booking from a flagged account — name, flag value, booking number and status — so the reviewer sees exactly what moved.",
    ask: "Account name, active flag, booking id and status for every line from accounts flagged inactive.",
    template: `SELECT c.name, c.active, o.id, o.status
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON {3} = {4}
WHERE c.active = {5}
ORDER BY c.name, o.id;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Activity lives at the line ledger, and each line points at its booking through order_id. The line's own id would fabricate pairings and flag activity that never happened on any booking.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id — the pointer's landing column. Bookings have no order_id of their own, so that guess errors before the sweep has a single row.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "The dormant flag lives on the account register, reached from the booking through customer_id. Skip the hop and the sweep reads the whole file as dormant — every account's trail under one flag.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id, and the booking's pointer lands there. The register has no customer_id of its own, so that spelling errors out.",
      },
      {
        answer: "0",
        kind: "number",
        label: "the dormant flag value",
        why: "Dormant is stored as the flag value 0 — active accounts carry 1. Sweep with 1 and the reviewer audits the fourteen live accounts instead of the two flagged ones.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "1"],
    walkthrough:
      "The sweep pins the flag at 0 on the register side and walks the chain to the line grain: bookings point at accounts, lines point at bookings. Fifteen rows come back, split across two names: Dmitri Volkov with 5 lines over 2 bookings, and Keiko Sato with 10 lines over 4. So dormant does not mean quiet — both flagged accounts hold full trails, and Keiko's includes the 397.99 cancellation the goodwill ledger already processed. That's the reviewer's packet: two names, fifteen lines, every booking status in view. The flag value is the pivot — sweep 1 by mistake and the report audits the living instead of the dormant, which is precisely the kind of quiet inversion a sweep exists to catch.",
  },
  {
    id: "cs-390",
    tier: "easy",
    topic: "l11",
    universe: "catalog",
    title: "The Fitness shelf's trail",
    brief:
      "From: Catalog content manager. Re: shelf audit, fitness.\n\nThe fitness shelf is the quietest in the building and the audit wants its complete trail before we decide whether it earns its place: every line the shelf has ever booked, with the quantity moved and the fulfillment state of each booking. The shelf label must match the register exactly — no near-misses.",
    ask: "Product name, quantity and booking status for every line in the Fitness category, in booking order.",
    template: `SELECT p.name, oi.quantity, o.status
FROM order_items oi
JOIN products p ON {1} = {2}
JOIN orders o ON {3} = {4}
WHERE p.category = 'Fitness'
ORDER BY o.id;`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "The shelf is reached through the catalog: each line points at its product via product_id. The line's own id would invent item pairings and stock the audit with gear from other shelves.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The catalog numbers items in id, and the line's pointer lands there. Matching line numbers against item numbers fabricates pairs — and the seed quirk on items 1 through 6 makes the mistake look plausible.",
      },
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Fulfillment state lives on the booking, one hop from the line through order_id. The line's own id would pair line numbers with booking numbers and put phantom statuses on the trail.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id — the pointer's landing column. There is no order_id on the booking itself, so that guess errors before the audit binds.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "'Apparel'"],
    walkthrough:
      "The shelf's trail is two hops from the line ledger — one to the catalog to pin 'Fitness', one to the bookings for the states — sorted in booking order. Thirteen lines come back, all of them the Yoga Mat Eco 6mm at 32 list: the shelf is a single item with a single trail. Thirteen lines is the smallest footprint on the file — Accessories moves 62, Audio 51 — and the shelf's lifetime value is 863.91 against Audio's 11,744.01. So the audit's question has an honest answer: fitness isn't a shelf, it's a SKU with a quiet, steady trail. Whether it earns its place is a merchandising call, but the trail behind that call is now complete, line by line, with nothing invented at any hop.",
  },
  {
    id: "cs-391",
    tier: "medium",
    topic: "l11",
    universe: "month-close",
    title: "How thick is each open booking",
    brief:
      "From: Controller. Re: month-end close, open-items density note.\n\nThe open-items schedule quotes fourteen pending tickets, and the auditors' follow-up is always the same: how much work is inside each one? I want a line count per open booking with the account name beside it, thickest first — so the note can say which tickets are single items and which are real baskets.",
    ask: "Booking id, account name and line count for every pending booking, thickest basket first.",
    template: `SELECT o.id, c.name, COUNT(*) AS lines
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON {3} = {4}
WHERE o.status = {5}
GROUP BY o.id, c.name
ORDER BY lines DESC, o.id;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "The count runs over lines grouped by their booking, and order_id is the hop that makes each line land on its ticket. The line's own id would fabricate pairings and count lines onto bookings that never carried them.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id — the pointer's landing column and the grouping key. There is no order_id on the booking itself, so that spelling breaks the note before it prints.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Names live on the account register, one hop from the booking through customer_id. Skip it and the density note loses every name — or invents sixteen phantom pairings per row.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id, and the booking's pointer lands there. The register has no customer_id of its own, so that guess errors out.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open status",
        why: "Open bookings are the exact text 'pending' — quoted, lowercase. 'shipped' would count in-transit baskets as open work and the density note would flatter the close's exposure.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "'shipped'"],
    walkthrough:
      "The density note is a count grouped per booking, reached from the line ledger through order_id, with names attached through the account pointer, filtered to 'pending'. Fourteen rows come back — one per open ticket — and the head of the list is a three-way tie at 4 lines: booking 1 under Pedro Alvarez, booking 19 under Alice Chen, booking 43 under Chloe Dubois. Farid Nasser's headline 1,088.44 ticket, booking 74, carries 3 lines — big money, modest basket. So the note's finding: the open book's thickness is ordinary — nothing rides a six-line basket — while its value concentrates in a few named tickets. Counts alone would have hidden that; the count needed the chain to books and accounts to become a note the auditors can use.",
  },
  {
    id: "cs-392",
    tier: "medium",
    topic: "l11",
    universe: "refund-audit",
    title: "The cancellation ledger, itemized",
    brief:
      "From: refunds@ — weekly queue review. Re: cancellation ledger rebuild.\n\nThe escalation thread keeps quoting seven cancelled bookings, but the goodwill ledger works at line grain, so I want the cancellations itemized: account name, item name, and the quantity each dead line carried, arranged so each account's dead lines read together. Stored figures only — the ledger gets countersigned against this.",
    ask: "Account name, product name and quantity for every line on a cancelled booking.",
    template: `SELECT c.name, p.name, oi.quantity
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON {3} = {4}
JOIN products p ON oi.product_id = p.id
WHERE o.status = {5}
ORDER BY c.name, p.name;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "The death status lives on the booking, one hop from the line through order_id. The line's own id would fabricate pairings and kill lines that are alive on the ledger.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id — the pointer's landing column. There is no order_id on the booking itself, so that spelling breaks the ledger before it binds.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Account names hang off the register, reached from the booking through customer_id. Guess the key and dead lines attach to the wrong names — exactly what a countersigned ledger cannot survive.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id, and the booking's pointer lands there. The register has no customer_id of its own, so that guess errors before the ledger exists.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the dead-ticket status",
        why: "The ledger counts the exact text 'cancelled' — quoted, lowercase. 'pending' would itemize live exposure as dead and the goodwill sign-off would write off tickets still in play.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "'pending'"],
    walkthrough:
      "The itemized ledger chains three hops: lines to bookings for the status, bookings to accounts for the names, lines to the catalog for the items — filtered to 'cancelled' and sorted by account. Twelve rows come back over the seven dead bookings, and the ledger's shape is the finding: Alice Chen carries 5 dead lines, Keiko Sato 4, Maya Patel 2, Emma Wilson 1. One account holds nearly half the cancellation trail — and Alice's dead lines ride three separate small tickets, not one big failure. That's a healthier story than 'seven dead bookings' suggests, and it is only visible at line grain with names and items attached. The ledger binds at twelve rows, each traceable to a physical line, each with a name that matches the register.",
  },
  {
    id: "cs-393",
    tier: "medium",
    topic: "l11",
    universe: "pricing",
    title: "The keyboard's real prices",
    brief:
      "From: Pricing analyst. Re: realized-price check, entry electronics.\n\nThe Mechanical Keyboard K1 anchors the entry shelf at 89.99 list, and I want the realized record behind it: every line it has ever booked on, with the booked unit price and the booking's fulfillment state, dearest first. If the entry anchor drifts, the whole shelf's ladder moves — so I want the drift on the record.",
    ask: "Line id, unit price and booking status for every line of the Mechanical Keyboard K1, dearest price first.",
    template: `SELECT oi.id, oi.unit_price, o.status
FROM order_items oi
JOIN products p ON {1} = {2}
JOIN orders o ON {3} = {4}
WHERE p.name = 'Mechanical Keyboard K1'
ORDER BY oi.unit_price DESC;`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "The item is pinned through the catalog, and lines point there via product_id. The line's own id would invent item pairings and put other shelves' prices on the keyboard's record.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The catalog numbers items in id, and the line's pointer lands there. Matching line numbers against item numbers fabricates pairs — and the seed quirk on items 1 through 6 makes the wrong key look right.",
      },
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Fulfillment state lives on the booking, one hop from the line through order_id. The line's own id would pair line numbers with booking numbers and fabricate states on the price record.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id — the pointer's landing column. There is no order_id on the booking itself, so that guess errors before the record prints.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "o.order_id", "'Wireless Mouse M3'"],
    walkthrough:
      "The realized record pins the keyboard by its registered name, walks lines to the catalog for the pin and to the bookings for the states, then sorts by booked price. Fifteen lines come back, booked between 87.46 and 94.13 around the 89.99 list — so the entry anchor drifts about five percent in both directions, with more lines above list than below. Two rows deserve the analyst's pen: the 94.13 line is the ceiling and it rides a pending booking, and line 122 at 90.35 sits on the one cancelled booking. So the shelf's ladder holds: the entry anchor is dependable to within a few dollars either way, and the record proving it is exactly these fifteen priced lines — reachable only through both hops.",
  },
  {
    id: "cs-394",
    tier: "medium",
    topic: "l11",
    universe: "inventory",
    title: "Thin shelves riding shipped tickets",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: restock watch, in-transit picks.\n\nThe restock watch cares about bins that are thin AND still shipping: every line on a shipped booking where the item sits at 60 on hand or fewer, with the on-hand figure and pick quantity beside each. Bins above 60 stay off the watch. The count pack binds this list, so stored figures only.",
    ask: "Product name, on-hand stock and quantity for every line on a shipped booking where the item's stock is at most 60.",
    template: `SELECT p.name, p.stock, oi.quantity
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN products p ON {3} = {4}
WHERE o.status = {5} AND p.stock <= 60
ORDER BY p.stock, p.name;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "The shipped status lives one hop from the line, through order_id. The line's own id would fabricate pairings and put unshipped picks on the restock watch.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id — the pointer's landing column. There is no order_id on the booking itself, so that spelling breaks the watch list before it binds.",
      },
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Stock lives on the catalog, reached through product_id. Guess the key and the watch fills with bins that were never picked — or misses the ones burning fastest.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The catalog numbers items in id, and the line's pointer lands there. Product numbers against item numbers fabricate pairs, and the seed quirk on items 1 through 6 makes the wrong key look right.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the in-transit status",
        why: "The watch rides in-transit work: the exact text 'shipped', quoted and lowercase. 'delivered' would watch completed picks instead of the ones still moving through the building.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "'delivered'"],
    walkthrough:
      "The watch is two filters at two different hops — 'shipped' on the booking side, stock at most 60 on the catalog side — chained through both pointers and sorted thinnest bin first. Sixteen lines come back over three bins: the Smart Watch S at 40 on hand has 7 lines riding shipped bookings, the Studio Desktop Mic at 45 has 2, and the Noise-Canceling Headset at exactly 60 has 7. So the watch list says what the count pack needs: the thinnest bin in the building is also the busiest in-transit mover, and the headset bin sits at the watch line with seven picks still in flight. Delivered work would have shown a different mix entirely — which is why the status hop carries the watch.",
  },
  {
    id: "cs-395",
    tier: "medium",
    topic: "l11",
    universe: "funnel",
    title: "Berlin's trail, newest first",
    brief:
      "From: Growth marketing lead. Re: win-back sequence, Berlin.\n\nThe Berlin win-back sequence fires against recent activity, so I need the city's full trail in reverse booking order: every line, with the account name, booking number, state and quantity, newest booking at the top. If the freshest activity is stale, the sequence waits — and I want that visible in the first row, not the last.",
    ask: "Account name, booking id, status and quantity for every line from Berlin accounts, newest booking first.",
    template: `SELECT c.name, o.id, o.status, oi.quantity
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON {3} = {4}
WHERE c.city = {5}
ORDER BY o.id {6};`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "The trail runs through the line ledger, and each line points at its booking through order_id. The line's own id would fabricate pairings and bury the sequence under bookings Berlin never placed.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id, and the pointer lands there. There is no order_id on the booking itself — that spelling breaks the sequence before it queues.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "The city lives on the account register, so the booking points there through customer_id. Skip the hop and the sequence fires against every city's trail at once.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id — the landing column for the booking's pointer. The register has no customer_id of its own, so that guess errors out.",
      },
      {
        answer: "'Berlin'",
        kind: "keyword",
        label: "the city value",
        why: "The sequence targets the exact text 'Berlin' — quoted, case-sensitive. 'Hamburg' would aim the win-back at Noah Meyer's eight lines and Berlin's account would hear nothing.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Newest first means descending booking order. ASC would queue the sequence against Berlin's oldest activity and the win-back would open with a booking from the file's earliest days.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "'Hamburg'", "ASC"],
    walkthrough:
      "The sequence pulls one city's trail at line grain, pinned to 'Berlin', sorted by booking number descending so the freshest activity leads. Fifty rows come back — all Alice Chen, because Berlin's register holds exactly one account — spanning her 24 bookings with 7,262.35 of lifetime spend. The direction is the whole design: the first row carries her highest booking number, so the sequence's opening signal is her most recent state, whatever it is. Run it ascending and the win-back fires against the file's oldest bookings, which is how stale lists get built. Fifty lines, one name, newest first — the sequence now targets a person's actual recency instead of a city's average.",
  },
  {
    id: "cs-396",
    tier: "hard",
    topic: "l11",
    universe: "supplier",
    title: "Nordic gear on EU accounts",
    brief:
      "From: Supply-chain lead. Re: QBR pack, regional sourcing matrix.\n\nThe sourcing matrix needs its premium cell: every line where Nordic Gadgets AB gear landed with an EU-region account — account, item, vendor — built through the full chain from the line ledger out to the vendor file. Both filters pinned exactly: the vendor's registered name and the region code. The matrix dies on near-misses.",
    ask: "Account name, product name and vendor name for every line of Nordic Gadgets AB gear booked by EU-region accounts.",
    template: `SELECT c.name, p.name, s.name
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON o.customer_id = c.id
JOIN products p ON {3} = {4}
JOIN suppliers s ON p.supplier_id = s.id
WHERE s.name = {5} AND c.region = {6}
ORDER BY c.name, p.name;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "The account rides the booking, and the line points at its booking through order_id. The line's own id would fabricate pairings and put Nordic gear on accounts that never took delivery.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id — the pointer's landing column. There is no order_id on the booking itself, so that spelling breaks the matrix before a cell fills.",
      },
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "The vendor hangs off the catalog, and the line reaches the catalog through product_id. Guess the key and the matrix attributes Nordic's gear by fabricated pairs.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The catalog numbers items in id, and the line's pointer lands there. Product numbers against item numbers fabricate pairs — and the seed quirk on items 1 through 6 makes the wrong key look right.",
      },
      {
        answer: "'Nordic Gadgets AB'",
        kind: "keyword",
        label: "the registered vendor name",
        why: "The matrix pins the exact registered text 'Nordic Gadgets AB', quotes included. 'APAC' in this seat matches no vendor at all and the cell comes back empty.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region code",
        why: "The region filter is the exact code 'EU' — quoted, case-sensitive. 'APAC' would fill the cell with Nordic's Asian accounts and mislabel the sourcing story the pack tells.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "s.supplier_id", "'APAC'"],
    walkthrough:
      "The matrix cell is the longest chain on the file: lines to bookings for the account, lines to the catalog, catalog to the vendor file — five registers, two pinned filters. Twenty-two lines survive: Nordic's EU deliveries, sorted so each account's cells read together. Set against Nordic's full book of 43 lines, that means just over half their gear stays in Europe — the rest crosses regions, which is exactly the concentration story the sourcing matrix exists to surface. And the chain teaches the path discipline: there is no direct road from lines to vendors that skips the catalog hop, and no road from lines to accounts that skips the booking hop. Skip either and the premium cell fills with fabricated pairs instead of twenty-two traceable lines.",
  },
  {
    id: "cs-397",
    tier: "hard",
    topic: "l11",
    universe: "expense",
    title: "Emma Wilson's honest total",
    brief:
      "From: Ops finance, spend review. Re: top-account valuation.\n\nThe spend review's valuation page carries Emma Wilson this cycle, and I want her lifetime value computed the defensible way: off the actual lines — quantity times booked price, summed — not off booking totals. One row, one number, her name attached. If the figure can't survive an audit of the lines, it doesn't go on the page.",
    ask: "Emma Wilson's lifetime line value, summed from line quantities times booked unit prices.",
    template: `SELECT c.name, ROUND({5}, 2) AS line_value
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON {3} = {4}
WHERE c.name = 'Emma Wilson'
GROUP BY c.name;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Her lines reach the booking ledger through order_id — the hop that carries the trail toward her name. The line's own id would fabricate pairings and salt her valuation with lines she never booked.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id — the pointer's landing column. Bookings have no order_id of their own, so that guess errors before the valuation exists.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Her name lives on the account register, reached from the booking through customer_id. Skip the hop and the page values every account on the file at once.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id, and the booking's pointer lands there. The register has no customer_id of its own, so that spelling errors out.",
      },
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the honest line-grain sum",
        why: "Quantity times booked price, summed over her lines, values what she actually took. SUM(o.total) after the line hop photocopies each booking's total onto every one of its lines and prints 21,369.77 — over triple the truth.",
      },
    ],
    distractors: ["SUM(o.total)", "oi.id", "c.customer_id"],
    walkthrough:
      "The valuation is the grain discipline test: chain her name through customer_id, reach her lines through order_id, then sum quantity times booked price and round to the penny. One row comes back: Emma Wilson, 6,640.56 — across 46 lines on 17 bookings, the file's number-two spender. The trap is one chip away and it is expensive: sum the booking totals after the line hop and each of her 17 totals is photocopied onto roughly three lines apiece, printing 21,369.77 — more than triple her real value, on a page that decides next cycle's spend attention. Same registers, same filter, wrong grain. The 6,640.56 is the number that survives the audit, because every cent of it is a physical line times a booked price.",
  },
  {
    id: "cs-398",
    tier: "hard",
    topic: "l11",
    universe: "growth",
    title: "The spend podium, line grain",
    brief:
      "From: Chief of Staff. Re: board deck, podium slide.\n\nThe podium slide needs the top three accounts by lifetime value, computed at line grain — quantity times booked price, summed — with names attached, biggest first. Exactly three steps on the podium: the fourth account is a sentence, not a step. If the slide's ranking can be flipped by a sort direction, the deck isn't ready.",
    ask: "The top 3 accounts by lifetime line value, with the value to the penny, biggest first.",
    template: `SELECT c.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS spend
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON {3} = {4}
GROUP BY c.name
ORDER BY spend {5}
LIMIT {6};`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "The sum runs over lines, and each line reaches its booking through order_id — the hop that carries the trail to the names. The line's own id would fabricate pairings and build the podium out of phantom lines.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id — the pointer's landing column. Bookings have no order_id of their own, so that guess errors before the podium exists.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Names live on the account register, one hop from the booking through customer_id. Skip it and the podium has no names — or sixteen fabricated pairings per row.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id, and the booking's pointer lands there. The register has no customer_id of its own, so that spelling errors out.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ranking direction",
        why: "Biggest first means descending spend. ASC would podium the file's smallest accounts — Olivia Brown's 444.80 on the top step — and invert the slide's entire story.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the podium size",
        why: "The slide holds exactly three steps, so the cut is 3 — a fourth step makes the sentence a competitor, and two steps lose the bronze. The count lives in the limit, never in the output.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "ASC", "5"],
    walkthrough:
      "The podium is the leaderboard built honestly: chain lines to bookings to accounts, group per account, sum quantity times booked price, sort descending, cut at three. The steps come back: Alice Chen 7,262.35, Emma Wilson 6,640.56, Grace Kim 4,574.23. The gap between gold and bronze is over 2,600 — a real podium, not a photo finish — and the fourth account sits far enough back that the slide's cut is clean. Run the sort ascending and the steps invert into the file's smallest spenders, which is why the direction chip is load-bearing. And the sum's grain is the slide's quiet defense: every figure is a physical line times a booked price, so when the board asks what's in the number, the answer is 251 lines' worth of arithmetic, fully traceable.",
  },
  {
    id: "cs-399",
    tier: "hard",
    topic: "l11",
    universe: "fraud",
    title: "Triple-quantity lines on the delivered book",
    brief:
      "From: Risk team, spot-check rotation. Re: pattern review, bulk on completed work.\n\nThe rotation's completed-work pass looks for the maximum basket — quantity 3 — riding bookings that actually delivered, with the account and item attached so each hit can be read in context. Full chain from the line ledger through bookings, accounts and catalog; exactly the bulk pattern, nothing broader.",
    ask: "Account name, product name and quantity for every quantity-3 line on a delivered booking.",
    template: `SELECT c.name, p.name, oi.quantity
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON {3} = {4}
JOIN products p ON {5} = {6}
WHERE oi.quantity = {7} AND o.status = 'delivered'
ORDER BY c.name, p.name;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "The delivered status lives on the booking, one hop from the line through order_id. The line's own id would fabricate pairings and flag bulk lines on bookings that were never placed.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id — the pointer's landing column. There is no order_id on the booking itself, so that guess errors before the pattern review has a row.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Account names hang off the register, reached from the booking through customer_id. Skip the hop and the hits lose their names — the review reads quantities with nobody behind them.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id, and the booking's pointer lands there. The register has no customer_id of its own, so that spelling errors out.",
      },
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Item names hang off the catalog, and lines point there through product_id. Guess the key and the hits attribute bulk baskets to items that were never bought.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The catalog numbers items in id — the pointer's landing column. Product numbers against item numbers fabricate pairs, and on items 1 through 6 the seed quirk makes the wrong key look right.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the bulk quantity",
        why: "The rotation's bulk pattern is quantity 3 — the file's maximum. Quantity 2 is ordinary basket-filling and would bury the review under more than twice as many hits.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "2"],
    walkthrough:
      "The pattern is one filter at the deepest hop — quantity 3 on the line side, 'delivered' pinned on the booking side — across the full four-register chain. Forty-one lines survive: the delivered book's bulk baskets, each with a name and an item. Reading the hits, the Noise-Canceling Headset and the Fitness Band X2 recur at the top of the basket, and no account dominates the list — bulk-on-delivered is spread behavior, not concentration. Contrast the dead-ticket pass: bulk riding cancelled bookings produced exactly two hits, both Alice Chen. So the rotation's finding is symmetrical and clean: bulk purchases that delivered are routine and widespread; bulk that died is rare and named. Forty-one traceable rows, every one of them honest through all four hops.",
  },
  {
    id: "cs-400",
    tier: "hard",
    topic: "l11",
    universe: "catalog",
    title: "The Smart Watch, end to end",
    brief:
      "From: Catalog content manager. Re: premium item dossier.\n\nThe Smart Watch S dossier needs its complete trail in one view: item, account, fulfillment state and quantity for every line it has ever ridden, in booking order. The audit binds to catalog number 13. If the dossier can't trace a line from the account register to the item, it doesn't bind.",
    ask: "Product name, account name, booking status and quantity for every line of catalog item 13, in booking order.",
    template: `SELECT p.name, c.name, o.status, oi.quantity
FROM order_items oi
JOIN orders o ON {1} = o.id
JOIN customers c ON {2} = {3}
JOIN products p ON {4} = {5}
WHERE p.id = {6}
ORDER BY o.id;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "The trail starts at the line ledger, and each line points at its booking through order_id. The line's own id would pair line numbers with booking numbers and fabricate the dossier's spine.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Account names live on the register, one hop from the booking through customer_id. Guess the key and the dossier attaches the watch's lines to strangers.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id, and the booking's pointer lands there. The register has no customer_id of its own, so that spelling errors before the dossier binds.",
      },
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "The item is reached through product_id from the line. The line's own id would invent item pairings and stock the dossier with gear that was never the watch.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The catalog numbers items in id — the pointer's landing column. Product numbers against item numbers fabricate pairs, and the seed quirk on items 1 through 6 makes the wrong key look right.",
      },
      {
        answer: "13",
        kind: "number",
        noVerify: true,
        label: "the catalog item number",
        why: "The dossier binds to item 13, the Smart Watch S — a filter literal that never prints in these columns. Item 14 is the Running Socks 3-pack, and its trail would not overlap the watch's by a single line.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "14"],
    walkthrough:
      "The dossier is the full chain in one sweep: lines to bookings for the spine, bookings to accounts for the names, lines to the catalog to pin item 13 — sorted in booking order so the trail reads chronologically. Eleven rows come back, riding bookings 3 through 99, and the state column tells the story: seven shipped, three delivered, one pending — and that pending line, quantity 3 on booking 74, sits on the biggest open booking on the file at 1,088.44. So the dossier's finding: the catalog's most expensive item has a live, unshipped, triple-quantity exposure on the close's largest open ticket. Eleven lines, four registers, every row traceable from register to shelf — that is what binds.",
  },
  {
    id: "cs-401",
    tier: "hard",
    topic: "l11",
    universe: "month-close",
    title: "The whole register in one sweep",
    brief:
      "From: Controller. Re: month-end close, line-ledger reconciliation.\n\nThe close's back page is the full line-ledger sweep: every line on the file with its booking number, account name, shelf category and quantity, in booking order — no filters, no summaries, nothing skipped. The auditors reconcile this page against the ledger totals, so the sweep must reproduce the file's true grain exactly.",
    ask: "Booking id, account name, category and quantity for every line on the file, in booking order.",
    template: `SELECT o.id, c.name, p.category, oi.quantity
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON {3} = {4}
JOIN products p ON {5} = {6}
ORDER BY o.id, oi.id;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "The sweep starts at the line ledger, and each line points at its booking through order_id. The line's own id would fabricate a hundred pairings and the back page would repeat lines onto wrong bookings.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id — the pointer's landing column. There is no order_id on the booking itself, so that spelling breaks the sweep before it reconciles.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Account names live on the register, one hop from the booking through customer_id. Skip the hop and the sweep loses every name — or invents sixteen phantom pairings per row.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id, and the booking's pointer lands there. The register has no customer_id of its own, so that guess errors out.",
      },
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Categories hang off the catalog, and lines point there through product_id. Guess the key and the sweep attributes quantities to shelves that were never picked.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The catalog numbers items in id — the pointer's landing column. Product numbers against item numbers fabricate pairs, and on items 1 through 6 the seed quirk makes the wrong key look right.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "s.supplier_id", "o.order_id"],
    walkthrough:
      "The back page is the grain pin: all four registers chained through both pointers, no filter, sorted by booking then line so the sweep reads like the ledger itself. Two hundred fifty-one rows come back — the file's true line grain, unfiltered, with booking 1 opening under Pedro Alvarez at four lines. This is the number every other schedule reconciles against: 103 bookings became 251 lines, the category column splits the sweep across all seven shelves, and the quantities sum to a ledger that closes at 34,833.28 when priced. Miss one hop and the page silently changes size — 103 if the line hop is lost, 251 mislabeled if the catalog hop is guessed — which is why the sweep, unglamorous as it looks, is the close's hardest single query and its most important page.",
  },
];
