// Case batch M2-L11a — topic l11 (Multi-table chains), ids cs-369…cs-385.
// Hop-by-hop chains: line items → bookings → accounts (→ catalog → vendors),
// hop conditions as slots, filters at any hop, grain pinned at 251.
// Every figure is audited against the live seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesM2L11a: CaseStudy[] = [
  {
    id: "cs-369",
    tier: "easy",
    topic: "l11",
    universe: "fraud",
    title: "The line that dwarfs its booking",
    brief:
      "From: Risk team, spot-check rotation. Re: outlier line items.\n\nThe rotation flags single lines that make up almost an entire booking, and this week the largest line on the ledger lands at 599.91. Before the reviewer opens the file I want the record itself: the line number, the booking it rode on, and the account holder behind that booking — straight from the registers, nothing retyped.",
    ask: "The line id, its booking id and the account holder's name for line 79 — one row.",
    template: `SELECT oi.id, o.id, c.name
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON {3} = {4}
WHERE oi.id = 79;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Each line item carries an order_id pointing at the booking ledger — that's the first hop. The line's own id would match line numbers against booking numbers and fabricate a hundred fake pairings.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The booking ledger numbers its rows in id, and the line's pointer lands there. Bookings have no order_id column of their own, so that guess kills the query before the reviewer sees a row.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Second hop: the booking points at the account register through customer_id. Matching booking numbers straight against account numbers would invent sixteen phantom pairs and put a stranger's name on the file.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The account register numbers its rows in id — where the booking's pointer lands. The register carries no customer_id of its own, so that spelling errors out before the spot-check packet exists.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "o.order_id", "c.name"],
    walkthrough:
      "Two hops, two pointers, one row. The line's order_id lands on the booking ledger's id; the booking's customer_id lands on the account register's id; then the filter pins line 79. What comes back: line 79, booking 31, Alice Chen. Context the reviewer should have: line 79 is 3 units at 199.97 — 599.91 of booking 31's 633.91 total, roughly 95% of the whole booking. So the flagged pattern is real: one bulk line carrying almost the entire ticket on the file's heaviest account. The chain is what makes the check trustworthy — skip a hop or guess a key and the name attached to the 599.91 could belong to anyone.",
  },
  {
    id: "cs-370",
    tier: "easy",
    topic: "l11",
    universe: "catalog",
    title: "The Smart Watch's booking trail",
    brief:
      "From: Catalog content manager. Re: premium item audit.\n\nThe Smart Watch S is the priciest item we stock, and merchandising wants to know everywhere it has appeared: every line it ever booked on, with the fulfillment state of each booking. Clean copy off the registers, please — the audit binds this to the item's catalog number, 13, not the display name.",
    ask: "Catalog id, line id and booking status for every line carrying catalog item 13.",
    template: `SELECT p.id AS item_id, oi.id AS line_id, o.status
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN products p ON oi.product_id = p.id
WHERE p.id = {3}
ORDER BY o.id;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "The trail runs through the line items: each carries an order_id pointing at the booking ledger. The line's own id against booking numbers would fabricate pairings and pollute the item's history.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The pointer lands on the ledger's id column. Bookings have no order_id of their own, so that guess errors before the audit binds a single page.",
      },
      {
        answer: "13",
        kind: "number",
        label: "the catalog item number",
        why: "The audit binds to item 13 — the Smart Watch S at 199.99 list. Item 14 is the Running Socks 3-pack, a different shelf entirely, and its trail would not overlap this one by a single line.",
      },
    ],
    distractors: ["oi.id", "o.customer_id", "14"],
    walkthrough:
      "The item's trail is a chain: lines point at bookings, lines point at the catalog, and the catalog number 13 pins the item. Eleven lines come back, riding bookings 3 through 99 — seven shipped, three delivered, one pending. That pending line is the finding: line 180 sits on booking 74, the biggest open booking on the file at 1,088.44, so the priciest item in the building is sitting unshipped on the largest open ticket. The audit note writes itself: item 13 is not a slow mover, it is a premium anchor with a live exposure on it — and every one of those eleven lines needed both hops to surface honestly.",
  },
  {
    id: "cs-371",
    tier: "easy",
    topic: "l11",
    universe: "month-close",
    title: "Inside the biggest open booking",
    brief:
      "From: Controller. Re: month-end close, open-items schedule.\n\nThe open-items schedule leads with booking 74 — the single largest booking still sitting in pending at 1,088.44. The auditors' first question is always what is actually inside it, so I want the line breakdown with the account holder's name attached: quantities as booked, off the registers, nothing estimated.",
    ask: "Booking id, line quantities and the account name behind booking 74.",
    template: `SELECT o.id, oi.quantity, c.name
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN customers c ON {1} = {2}
WHERE o.id = {3};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "The name lives on the account register, and the booking points there through customer_id — that's the hop. Matching booking numbers against account numbers would fabricate sixteen fake pairs and attach the wrong name to the schedule.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id, and the pointer lands there. The register has no customer_id column of its own, so that spelling errors before the schedule prints.",
      },
      {
        answer: "74",
        kind: "number",
        label: "the booking number",
        why: "The schedule leads with booking 74 — Farid Nasser's 1,088.44 pending ticket. Booking 75 is Grace Kim's open ticket worth a fraction of that, and the auditors would be auditing the wrong line.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "75"],
    walkthrough:
      "The booking ledger holds the ticket, the line ledger holds what's inside it, the account register holds the name — and the pointers chain them: lines ride bookings, bookings point at accounts. Booking 74 breaks into three lines with quantities 1, 3 and 3, all under Farid Nasser's name. The reconciliation the auditors love: 33.22 plus 583.02 plus 472.20 lands exactly on the 1,088.44 the schedule quotes. So the close's biggest open item is a three-line bulk order, fully explained, with a name on it — and the line-ledger view is what makes the schedule defensible instead of a bare number on a page.",
  },
  {
    id: "cs-372",
    tier: "easy",
    topic: "l11",
    universe: "refund-audit",
    title: "Booking 83, line by line",
    brief:
      "From: refunds@ — internal ticket #4419 wrap-up. Re: goodwill ledger backup.\n\nThe goodwill note for booking 83 has been countersigned and finance wants the backup attached: the actual lines that died with that booking, quantities included, so the ledger shows what we cancelled rather than a bare total. Keiko Sato's file, stored figures only.",
    ask: "Line id, booking status and quantity for every line on Keiko Sato's cancelled booking.",
    template: `SELECT oi.id, o.status, oi.quantity
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON {3} = {4}
WHERE c.name = 'Keiko Sato' AND o.status = 'cancelled';`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Lines attach to bookings through order_id — the first hop of the trail. The line's own id would match line numbers against booking numbers and fabricate a hundred phantom pairings.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The booking ledger numbers its rows in id, and the pointer lands there. There is no order_id on the booking itself — that guess breaks the query before the backup page fills.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Keiko's name lives on the account register, so the booking must point there through customer_id. Skipping the hop or guessing the key would attach someone else's cancelled lines to her goodwill note.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id — the pointer's landing column. The register carries no customer_id of its own, so that spelling errors out before the ledger backup exists.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "o.order_id", "oi.product_id"],
    walkthrough:
      "The goodwill backup needs the dead lines, not the headline: Keiko's account joined through customer_id, filtered to 'cancelled', with the line ledger supplying the detail. Four lines come back — quantities 2, 2, 2 and 1, all riding booking 83, the 397.99 cancellation already countersigned. Two facts for the ledger note. First, Keiko's whole file is four bookings totalling 1,098.60 across ten lines, so this one cancellation killed the largest ticket she ever placed. Second, her account is flagged inactive, which closes the last open question on a dormant file. The line-by-line view is what lets finance write 'four lines, nine units' instead of a number nobody can trace.",
  },
  {
    id: "cs-373",
    tier: "easy",
    topic: "l11",
    universe: "pricing",
    title: "What the headset actually books at",
    brief:
      "From: Pricing analyst. Re: realized-price check, audio shelf.\n\nList says the Noise-Canceling Headset sells at 149.99, but the number I have to defend in the review is what lines actually booked at. Pull every line the headset has ever ridden on — catalog id, fulfillment state, and the booked unit price, sorted so the dearest bookings lead. Catalog item 4.",
    ask: "Catalog id, booking status and unit price for every line of catalog item 4, priciest first.",
    template: `SELECT p.id, o.status, oi.unit_price
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN products p ON oi.product_id = p.id
WHERE p.id = {3}
ORDER BY oi.unit_price DESC;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Booked prices ride the line ledger, and each line points at its booking through order_id. The line's own id would pair line numbers with booking numbers and invent a history the headset never had.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger's rows are numbered in id — where the line pointer lands. Bookings have no order_id column, so that guess errors before a single price surfaces.",
      },
      {
        answer: "4",
        kind: "number",
        label: "the catalog item number",
        why: "The realized-price check binds to item 4 — the Noise-Canceling Headset at 149.99 list. Item 5 is the Studio Desktop Mic, and its prices would quietly stand in for the headset's in the review.",
      },
    ],
    distractors: ["oi.id", "o.customer_id", "5"],
    walkthrough:
      "Realized pricing is the line ledger, not the catalog: point each line at its booking through order_id, pin the catalog number 4, and sort by booked price. Twenty-four lines come back, booked between 142.63 and 157.40 around the 149.99 list — so the headset drifts on both sides of list, never wildly. The top of the book is 157.40, about five percent over list, and the floor is 142.63, five percent under. That's a defensible band for the review: the headset's realized pricing holds its anchor within a ten-dollar corridor across two dozen bookings. What the check also proves is that the list price alone tells you almost nothing — the lines are the record.",
  },
  {
    id: "cs-374",
    tier: "easy",
    topic: "l11",
    universe: "inventory",
    title: "The Cork card, shelf depth included",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: count pack, Cork account.\n\nCork's account — Liam O'Brien — holds exactly one booking, and the count pack wants its lines with current shelf depth beside each: what he took, and what sits on the shelf now, so the counter knows which bins to watch after the pick. Catalog names and on-hand figures as stored, please.",
    ask: "Product name, on-hand stock and booked quantity for every line behind the Cork account.",
    template: `SELECT p.name, p.stock, oi.quantity
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON {3} = {4}
JOIN products p ON oi.product_id = p.id
WHERE c.city = 'Cork';`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "The count starts at the line ledger, and each line points at its booking through order_id. The line's own id would match against booking numbers and invent a pick history that never happened.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The booking ledger numbers its rows in id, and the line's pointer lands there. There is no order_id on the booking itself — that spelling kills the query before the count card prints.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Cork is a city on the account register, so the booking must point there through customer_id. Guess the key and the card could show another city's picks against Cork's bins.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id — the pointer's landing column. The register has no customer_id of its own, so that guess errors before the pack is bound.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "o.order_id", "s.supplier_id"],
    walkthrough:
      "Four registers, one chain: lines point at bookings, bookings point at accounts, lines point at the catalog — and the city filter pins Cork. Four lines come back, all riding booking 20, Liam O'Brien's one and only booking: Smart Watch S, quantity 3 against 40 on hand; HDMI 2.1 Cable, 2 against 500; Bluetooth Speaker Mini, 1 against 210; Desk Mat Extended, 1 against 260. The bin to watch is obvious — the Smart Watch shelf is the thinnest in the building at 40, and Cork's pick alone lifted three units off it. The count pack now says exactly that, with names and depths, instead of a city name and a shrug.",
  },
  {
    id: "cs-375",
    tier: "medium",
    topic: "l11",
    universe: "funnel",
    title: "APAC's delivered ledger, line by line",
    brief:
      "From: Growth marketing lead. Re: reactivation list, APAC.\n\nThe reactivation wave targets accounts with proven completions, and APAC is first. I want the delivered ledger at line grain: account name, booking number, and the quantity each line moved, so the copy team can reference actual baskets instead of averages. Filters both ways — region on the account, completion on the booking.",
    ask: "Account name, booking id and quantity for every delivered line from APAC-region accounts.",
    template: `SELECT c.name, o.id, oi.quantity
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON {3} = {4}
WHERE c.region = 'APAC' AND o.status = {5}
ORDER BY o.id;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Quantities live on the line ledger, and each line points at its booking through order_id. The line's own id would fabricate a hundred fake pairings and salt the reactivation list with bookings that never carried these lines.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id, and the pointer lands there. Bookings have no order_id of their own — that guess errors before the list exists.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Region lives on the account register, so the booking points there through customer_id. Skip the hop and the list loses its region filter entirely — every account on the file would pour in.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id — the landing column for the booking's pointer. The register carries no customer_id of its own, so that spelling errors out.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the completed status",
        why: "Proven completions means the exact text 'delivered' — quoted, lowercase. 'shipped' would fill the list with tickets still in transit and the copy team would congratulate accounts whose orders haven't landed.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "'shipped'", "'EU'"],
    walkthrough:
      "Two filters, one chain: region pinned on the account side, 'delivered' on the booking side, joined through both pointers. Forty-nine lines come back across the region's 21 delivered bookings — booking 2 opens the list with Maya Patel moving quantities of 3 then 2, and Keiko Sato's booking 10 follows. So the reactivation wave has real material: 49 named baskets across five accounts, not a projected list. Worth saying in the room: the region's delivered base is heavy on Maya and Grace, so the copy should speak to repeat buyers, not newcomers. And every one of those 49 rows took both hops — lose the account hop and the list stops being APAC's at all.",
  },
  {
    id: "cs-376",
    tier: "medium",
    topic: "l11",
    universe: "supplier",
    title: "Midwest gear, account by account",
    brief:
      "From: Supply-chain lead. Re: QBR pack, vendor section.\n\nThe Midwest Hardware Co page of the QBR pack needs teeth: every line we've bought from them, with the account that took the gear and the quantity, so procurement can show the vendor exactly where their product lands. Full chain from the line ledger to the vendor file, exact vendor name as registered.",
    ask: "Account name, product name and quantity for every line sourced from Midwest Hardware Co.",
    template: `SELECT c.name, p.name, oi.quantity
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN products p ON {3} = {4}
JOIN suppliers s ON p.supplier_id = s.id
JOIN customers c ON o.customer_id = c.id
WHERE s.name = 'Midwest Hardware Co'
ORDER BY c.name, p.name;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "The account rides the booking, and the line points at its booking through order_id. The line's own id would fabricate pairings and attribute Midwest gear to bookings that never carried it.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id — the pointer's landing column. There is no order_id on the booking itself, so that guess errors before the QBR page fills.",
      },
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "The vendor is reached through the catalog: each line points at its product via product_id, and the product points at the vendor. The line's own id here would invent product pairings and scramble the vendor attribution.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The catalog numbers items in id, and the line's pointer lands there. Matching product numbers straight against vendor numbers would fabricate six fake pairs — the seed quirk that makes wrong-key joins look plausible.",
      },
    ],
    distractors: ["oi.id", "s.supplier_id", "p.price", "c.customer_id"],
    walkthrough:
      "The vendor section needs the full route: lines point at bookings for the account, and at the catalog for the product, and the catalog points at the vendor file. Filter to 'Midwest Hardware Co' and 56 lines come back — the deepest vendor footprint on the file by line count, all landing on three items: the Noise-Canceling Headset, the Laptop Stand, and the Yoga Mat. Reading the account column, the gear spreads across most of the register rather than pooling with one buyer, which is the volume argument procurement wanted. And the chain is non-negotiable: there is no road from bookings to vendors that skips the line and catalog hops, and any shortcut invents pairs instead of finding them.",
  },
  {
    id: "cs-377",
    tier: "medium",
    topic: "l11",
    universe: "expense",
    title: "The in-transit tickets that matter",
    brief:
      "From: Ops finance, spend review. Re: in-flight value check.\n\nBefore we book next month's estimates I want the in-transit slice that actually matters: shipped bookings above 700, with names attached. Anything under that line is noise for this exercise. Pull it off the line ledger so we can see how the tickets repeat at line grain — I want the repetition visible, not hidden.",
    ask: "Booking id, account name and total for every shipped booking above 700, biggest first.",
    template: `SELECT o.id, c.name, o.total
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON o.customer_id = c.id
WHERE o.status = {3} AND o.total > {4}
ORDER BY o.total DESC;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "The review starts at the line ledger, and each line points at its booking through order_id. The line's own id would match line numbers against booking numbers and manufacture tickets that don't exist.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id — the pointer's landing column. Bookings have no order_id of their own, so that guess errors before the in-flight list prints.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the in-transit status",
        why: "In-flight means the exact text 'shipped' — quoted and lowercase. 'delivered' would report tickets that already landed and double-count them as next month's pipeline.",
      },
      {
        answer: "700",
        kind: "number",
        noVerify: true,
        label: "the materiality line",
        why: "The review's materiality line is 700 — below that, in-transit tickets are noise for the estimates. A line at 600 would drag minor tickets into the memo; the threshold lives in the filter, never in the output.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "'delivered'", "600"],
    walkthrough:
      "Two filters on the booking side — 'shipped' and the 700 line — with the account name attached through customer_id, all reached from the line ledger. Eighteen rows come back but only five distinct tickets: Emma Wilson's 845.92 on booking 39, Grace Kim's 826.03 on 15, Emma again at 785.79 on 57, Alice Chen's 767.64 on 3, and Liam O'Brien's 705.39 on 20. The repetition is the lesson: each ticket surfaces once per line item, so five tickets read as eighteen rows. For the estimates memo that's fine — the totals are per booking and correct — but anyone summing this column blind would inflate in-flight value nearly four-fold. Five named tickets, one dominant account, and a grain trap worth flagging in the footnote.",
  },
  {
    id: "cs-378",
    tier: "medium",
    topic: "l11",
    universe: "growth",
    title: "Alice Chen's ledger, richest first",
    brief:
      "From: Chief of Staff. Re: board deck, top-account page.\n\nThe top-account page opens with Alice Chen and the deck wants her whole trail at line grain: every booking with its total and the quantity each line moved, richest booking first. If her spend concentrates in a few big tickets, the narrative writes itself — but I want it from the record, not the anecdote.",
    ask: "Booking id, total and line quantity for every line on Alice Chen's account, richest booking first.",
    template: `SELECT o.id, o.total, oi.quantity
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON {3} = {4}
WHERE c.name = {5}
ORDER BY o.total DESC;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Quantities live on the lines, and each line points at its booking through order_id. The line's own id would pair line numbers with booking numbers and fabricate bookings on her page.",
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
        why: "Alice's name lives on the account register, so the booking points there through customer_id. Skip the hop and the page becomes every account's trail — fifty lines becomes the whole file.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id — where the booking's pointer lands. The register has no customer_id of its own, so that guess errors before the deck page exists.",
      },
      {
        answer: "'Alice Chen'",
        kind: "keyword",
        label: "the account name",
        why: "The page is pinned to the exact registered text 'Alice Chen', quotes included. 'Emma Wilson' would build the top-account page out of the number-two spender and misstate the whole slide.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "'Emma Wilson'"],
    walkthrough:
      "The page is one account's trail at line grain: 'Alice Chen' pinned on the register, lines joined to their bookings, sorted by booking total descending. Fifty rows come back across her 24 bookings — the file's top spender at 7,262.35 lifetime. The head of the list tells the concentration story: booking 3 at 767.64 leads, booking 14 at 705.23 follows, and the rest trail off from there. So the narrative for the deck: Alice's spend is broad rather than spiked — her biggest ticket is under 800, and the volume comes from 24 bookings, not one whale. That's a healthier retention story than a single giant order, and the line-grain trail is what proves it.",
  },
  {
    id: "cs-379",
    tier: "medium",
    topic: "l11",
    universe: "fraud",
    title: "Bulk lines on dead tickets",
    brief:
      "From: Risk team, spot-check rotation. Re: pattern review, bulk quantities.\n\nThe rotation watches for bulk quantity lines riding tickets that later died, because three-of-a-kind on a cancelled booking is where well-meaning bulk buys and something stranger are hard to tell apart. Pull every quantity-3 line on a cancelled booking — line number, quantity, fulfillment state — and keep it to exactly that pattern.",
    ask: "Line id, quantity and status for every quantity-3 line riding a cancelled booking.",
    template: `SELECT oi.id, oi.quantity, o.status
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON o.customer_id = c.id
WHERE oi.quantity = {3} AND o.status = {4};`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "The pattern lives on lines but the status lives on bookings, and order_id is the hop between them. The line's own id would fabricate pairings and put dead-ticket status on lines that were never booked.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The pointer lands on the ledger's id column. Bookings have no order_id of their own, so that guess errors before the pattern review has a single row.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the bulk quantity",
        why: "The rotation's bulk line is quantity 3 — the maximum anywhere on the file. Quantity 2 is ordinary basket-filling and would bury the signal under four times as many rows.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the dead-ticket status",
        why: "Dead tickets are the exact text 'cancelled', quoted and lowercase. 'pending' would review live exposure instead of the death pattern the rotation is hunting.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "2", "'pending'"],
    walkthrough:
      "The pattern is two filters pinned at different hops: quantity 3 on the line side, 'cancelled' on the booking side, chained through order_id. Exactly two rows survive: line 7 on booking 7 and line 95 on booking 95 — and both bookings belong to Alice Chen, worth 152.52 and 206.19. Two findings, one name, both small. That's a clean stop for the rotation: bulk-on-dead is rare on this file, concentrated on the top spender's account, and every instance is under 250. The reviewer can sign it off with the two line numbers cited — which is only possible because the status filter rode the booking hop instead of being guessed at the line level.",
  },
  {
    id: "cs-380",
    tier: "medium",
    topic: "l11",
    universe: "catalog",
    title: "Accessories, shelf depth attached",
    brief:
      "From: Catalog content manager. Re: shelf audit, accessories.\n\nThe accessories shelf needs its sales trail with current shelf depth beside each line, so we can see whether the deep bins are actually the busy ones. Every line on the shelf: item name, on-hand figure, quantity moved. The shelf label must match the register exactly — this audit dies on near-misses.",
    ask: "Product name, on-hand stock and quantity for every line in the Accessories category.",
    template: `SELECT p.name, p.stock, oi.quantity
FROM order_items oi
JOIN products p ON {1} = {2}
JOIN orders o ON oi.order_id = o.id
WHERE p.category = {3}
ORDER BY p.stock, p.name;`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "The shelf is reached through the catalog: each line points at its product via product_id. The line's own id would invent product pairings and stock the audit with items that were never on this shelf.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The catalog numbers items in id, and the line's pointer lands there. Matching line numbers straight against item numbers would fabricate pairs — and the seed quirk on items 1 through 6 makes the mistake look almost right.",
      },
      {
        answer: "'Accessories'",
        kind: "keyword",
        label: "the shelf label",
        why: "The shelf is the exact text 'Accessories', case-sensitive. 'Audio' would audit headphones and mics, and 'Apparel' would audit socks and jerseys — neither is this shelf.",
      },
    ],
    distractors: ["oi.id", "'Audio'", "'Apparel'"],
    walkthrough:
      "The shelf audit chains the line ledger to the catalog, pins 'Accessories', and sorts by shelf depth. Sixty-two lines come back across the shelf's three items — the HDMI 2.1 Cable bin at 500 on hand, the Desk Mat at 260, the Laptop Stand at 180. So the pattern holds: the deepest bin is also the busiest shelf by line count, 62 lines against Audio's 51 — but the revenue story flips, because Accessories books 3,294.29 across all those lines while Audio books 11,744.01 on fewer. Cheap items in deep bins, moving constantly. That's the shelf's identity for the audit file, and it took both the catalog hop and the booking hop to see it.",
  },
  {
    id: "cs-381",
    tier: "hard",
    topic: "l11",
    universe: "month-close",
    title: "The delivered appendix, end to end",
    brief:
      "From: Controller. Re: month-end close, delivered appendix.\n\nThe close binder's delivered appendix lists every completed booking at line grain: account, item, quantity — the full trail from the line ledger through bookings and accounts to the catalog. Nothing summarized; the auditors want to trace any appendix row back to a physical line. Filters only where the binder says: completed work, nothing else.",
    ask: "Account name, product name and quantity for every line on a delivered booking.",
    template: `SELECT c.name, p.name, oi.quantity
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON {3} = {4}
JOIN products p ON {5} = {6}
WHERE o.status = 'delivered'
ORDER BY c.name, p.name;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "The appendix starts at the line ledger, and the booking status lives one hop away through order_id. The line's own id would fabricate a hundred pairings and the appendix would list work nobody booked.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id — the pointer's landing column. There is no order_id on the booking itself, so that guess kills the query before the appendix binds.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Account names live on the register, one hop from the booking through customer_id. Skip it and the appendix loses every name — or worse, invents sixteen phantom pairings per row.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id, and the booking's pointer lands there. The register has no customer_id of its own — that spelling errors before a single appendix row exists.",
      },
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Item names hang off the catalog, and lines point there through product_id. Guess the key and the appendix attributes quantities to items that were never bought.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The catalog numbers items in id — the pointer's landing column. Product numbers against item numbers fabricate pairs, and on items 1 through 6 the seed quirk makes the wrong key look right.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "o.order_id", "s.supplier_id"],
    walkthrough:
      "This is the full chain with nothing skipped: lines to bookings for the status, bookings to accounts for the name, lines to the catalog for the item — three hops, all four registers, one filter. The delivered appendix binds at 119 lines across the 52 completed bookings, sorted so any account's rows read together. That 119 is worth pausing on: 52 bookings became 119 appendix rows because the line ledger is the true grain — most bookings carry two or three lines. The binder's other schedules quote booking counts; this one quotes lines, and the auditors can trace every row to a physical line number. Four hops guessed instead of chained, and the appendix would have repeated the 251-line whole-file grain with completed-work numbers that reconcile to nothing.",
  },
  {
    id: "cs-382",
    tier: "hard",
    topic: "l11",
    universe: "refund-audit",
    title: "Keiko Sato's true line value",
    brief:
      "From: refunds@ — audit follow-up. Re: dormant account valuation.\n\nBefore the dormant-account write-off list is finalized, finance wants one number for Keiko Sato: her lifetime value computed off the actual lines — quantity times booked price, summed — not off booking totals. The file must show the honest line-grain figure next to her name, computed once, from the registers.",
    ask: "Keiko Sato's lifetime line value, summed from line quantities times booked unit prices.",
    template: `SELECT c.name, ROUND({5}, 2) AS line_value
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON {3} = {4}
WHERE c.name = {6}
GROUP BY c.name;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Her lines reach the booking ledger through order_id — the hop that carries the trail toward her name. The line's own id would fabricate pairings and salt her total with lines she never booked.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id, and the line's pointer lands there. Bookings have no order_id of their own, so that guess errors before the valuation exists.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Her name lives on the account register, reached from the booking through customer_id. Skip the hop and the valuation becomes every account's value at once.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id — the landing column for the booking's pointer. The register carries no customer_id of its own, so that spelling errors out.",
      },
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the honest line-grain sum",
        why: "Quantity times booked price, summed over her lines, is the true value of what she actually took. SUM(o.total) after the line hop photocopies each booking's total onto every one of its lines and prints 2,993.18 — nearly triple the truth.",
      },
      {
        answer: "'Keiko Sato'",
        kind: "keyword",
        label: "the account name",
        why: "The write-off list names the exact registered text 'Keiko Sato', quotes included. 'Maya Patel' would value a live Mumbai account at 3,644.56 and put a real customer on the dormant list.",
      },
    ],
    distractors: ["SUM(o.total)", "oi.id", "c.customer_id", "'Maya Patel'"],
    walkthrough:
      "The valuation is an honesty test disguised as a sum. Chain her name through customer_id, reach her lines through order_id, then let the sum run on quantity times booked price — the line ledger's own currency. One row comes back: Keiko Sato, 1,098.60, across ten lines on four bookings. The trap sits one keystroke away: sum the booking totals after the line hop and each booking's total is photocopied onto every one of its lines, printing 2,993.18 — nearly triple her real value, which would triple the write-off on a dormant account. Same registers, same filter, one wrong grain. The 1,098.60 is the number the write-off list can defend line by line.",
  },
  {
    id: "cs-383",
    tier: "hard",
    topic: "l11",
    universe: "pricing",
    title: "Who books the headset, dearest first",
    brief:
      "From: Head of Product. Re: pricing reset, premium audio.\n\nBefore we touch the headset's list price I want its buyer file: every account that has ever booked one, with the booking and the price actually paid, dearest line first. Nine names or ninety, the reset needs to know who is paying over list and how often. Catalog item 4, the Noise-Canceling Headset.",
    ask: "Account name, booking id and unit price for every line of catalog item 4, dearest booking first.",
    template: `SELECT c.name, o.id, oi.unit_price
FROM order_items oi
JOIN products p ON {1} = {2}
JOIN orders o ON {3} = {4}
JOIN customers c ON o.customer_id = c.id
WHERE p.id = {5}
ORDER BY oi.unit_price DESC;`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "The buyer file starts at the lines, and the catalog is reached through product_id. The line's own id would invent item pairings and put every product's buyers on the headset's page.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The catalog numbers items in id, and the line's pointer lands there. Product numbers against item numbers fabricate pairs — and on items 1 through 6 the seed quirk makes the wrong key look right.",
      },
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Booking numbers come one hop from the line through order_id. The line's own id would pair line numbers with booking numbers and invent bookings on the buyer file.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id — the pointer's landing column. There is no order_id on the booking itself, so that guess errors before the file prints.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the catalog item number",
        why: "The buyer file binds to item 4, the Noise-Canceling Headset — a filter literal that never prints in these columns. Item 5 is the Studio Desktop Mic, and its buyers would quietly stand in for the headset's.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "5"],
    walkthrough:
      "The buyer file is a three-hop assembly: lines point at the catalog to pin item 4, lines point at bookings for the numbers, bookings point at accounts for the names — then the sort puts the dearest line on top. Twenty-four rows come back across just nine accounts, and the top of the file is the story: Farid Nasser paid 157.40, Chloe Dubois 156.29, Grace Kim 155.18 — all over the 149.99 list — while the floor sits at 142.63. So nine accounts absorb the entire headset book, three of them paying a premium, none of them casual one-off buyers. For the reset that means the list price has room: the heaviest users already pay above it, and the file to prove it is exactly these twenty-four rows.",
  },
  {
    id: "cs-384",
    tier: "hard",
    topic: "l11",
    universe: "inventory",
    title: "Thin shelves on the delivered book",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: restock queue, completed work.\n\nThe restock queue wants the delivered book crossed with shelf depth: every line on a completed booking where the item now sits under 50 on hand, with the vendor attached so reorder calls go out the same morning. Full chain — lines, bookings, catalog, vendor file — and only items actually under the line count.",
    ask: "Vendor name, product name, stock and line id for every delivered line where the item's stock is under 50.",
    template: `SELECT s.name, p.name, p.stock, oi.id
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN products p ON {3} = {4}
JOIN suppliers s ON {5} = {6}
WHERE o.status = 'delivered' AND p.stock < 50
ORDER BY p.stock, p.name;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Delivery status lives on the booking, one hop from the line through order_id. The line's own id would fabricate pairings and put undelivered work on the restock queue.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id, and the line's pointer lands there. There is no order_id on the booking itself — that spelling breaks the queue before it prints.",
      },
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Stock lives on the catalog, reached through product_id. Guess the key and the queue fills with bins that were never picked — or misses the ones that were.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The catalog numbers items in id — the pointer's landing column. Product numbers against item numbers fabricate pairs, and the seed quirk on items 1 through 6 makes the wrong key look right.",
      },
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "The vendor file hangs off the catalog through supplier_id — that's the hop that names who to call. The vendor file's own columns can't reach back; there is no supplier_id on the vendor row itself.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The vendor file numbers its rows in id, and the catalog's pointer lands there. Matching vendor numbers against stock or ratings would invent pairs and put the wrong supplier on the reorder call.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "o.order_id", "p.stock", "s.stock"],
    walkthrough:
      "The restock queue is a four-register chain with two filters: 'delivered' on the booking side, stock under 50 on the catalog side, with the vendor file hung off the catalog for the phone call. Twelve lines survive: the Smart Watch S bin at 40 on hand contributes 3 delivered lines, and the Studio Desktop Mic bin at 45 contributes 9. Both reorder calls are EU calls — Nordic Gadgets AB for the watch, Alpine Audio GmbH for the mic — which the vendor column makes visible at a glance. The desk takeaway: the building's two thinnest bins are also actively shipping, and the mic bin is burning nine times faster than the watch bin. That ranking, with vendors attached, is exactly what the morning queue needs.",
  },
  {
    id: "cs-385",
    tier: "hard",
    topic: "l11",
    universe: "funnel",
    title: "The EU line value the deck quotes",
    brief:
      "From: Chief of Staff. Re: board deck, regional value slide.\n\nThe regional slide quotes one figure for Europe: the value of everything EU accounts have actually taken delivery of, computed at line grain — quantity times booked price, summed. One row, one number, region attached. If the figure on the slide can't be traced to the lines, the deck doesn't ship.",
    ask: "The total delivered line value for EU-region accounts, as a single figure with the region attached.",
    template: `SELECT c.region, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS line_value
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN customers c ON {3} = {4}
WHERE c.region = {5} AND o.status = {6}
GROUP BY c.region;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "The sum runs over lines, and the booking status lives one hop away through order_id. The line's own id would fabricate pairings and inflate the slide's figure with work nobody booked.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The ledger numbers bookings in id — the pointer's landing column. Bookings have no order_id of their own, so that guess errors before the slide has a number.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Region lives on the account register, reached from the booking through customer_id. Skip the hop and the slide sums the entire file — every region's value under Europe's label.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id, and the booking's pointer lands there. The register has no customer_id of its own, so that spelling errors out.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region value",
        why: "The slide's region is the exact text 'EU' — quoted, case-sensitive. 'APAC' would put 6,617.68 of delivered value under Europe's label, and the deck would misstate the base by the gap.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the completed status",
        why: "Taken delivery means the exact text 'delivered' — quoted and lowercase. 'shipped' would quote in-transit value as landed value and overstate the slide's proven base.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "'APAC'", "'shipped'"],
    walkthrough:
      "One figure, fully traceable: chain the lines to their bookings for the status, to their accounts for the region, then let the sum run on quantity times booked price and round to the penny. One row comes back: EU, 6,656.18 — the value of the region's 50 delivered lines. The slide's footnote almost writes itself, because the number is sensitive to both chips: pin 'APAC' instead and the figure reads 6,617.68, a 38.50 gap that quietly hands Europe's credit to Asia; loosen 'delivered' to 'shipped' and unlanded value masquerades as proven. The 6,656.18 survives challenge because every cent of it walks the chain — lines to bookings to accounts — with nothing guessed at any hop.",
  },
];
