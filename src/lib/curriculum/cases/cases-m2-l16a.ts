// Case batch M2-L16a — topic l16 (Fan-out & grain), ids cs-534…cs-550.
// SUM/AVG inflation stories: honest line-grain revenue (quantity x unit price,
// charged once per line) against the pairing's printed total (every booking's
// full total repeating once per line), the 103,244.55 trap, per-slice inflation
// ledgers and the AVG band-aid. Every figure is audited against the live seed
// db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesM2L16a: CaseStudy[] = [
  {
    id: "cs-534",
    tier: "easy",
    topic: "l16",
    universe: "inventory",
    title: "What the watch bin really earned",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: the watch bin's year-end card.\n\nThe count pack gives every premium bin a lifetime earnings line, and the Smart Watch card still shows a figure nobody can trace. I want what the item has actually pulled in, charged sale line by sale line at the price each line really sold at, so the card quotes earned money instead of paperwork.",
    ask: "The lifetime charged revenue for the Smart Watch S, summed across its sale lines.",
    template: `SELECT p.name, ROUND({1}, 2) AS revenue
FROM order_items oi
JOIN orders o ON {2}
JOIN products p ON oi.product_id = p.id
WHERE p.name = {3};`,
    slots: [
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the line charge",
        why: "Each sale line earns quantity times the price it actually sold at, and charging that once per line is what makes the figure reconcilable. Sum the bookings' own totals here instead and every booking bills its full amount once per line riding it — the bin's card would print money that was never charged.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the line-to-booking thread",
        why: "Lines point at their booking through order_id, and the booking ledger numbers itself in id — that thread is what carries each line's fulfillment state along. Line numbers matched against booking numbers pair up barely a hundred of the 251 lines and strand the rest.",
      },
      {
        answer: "'Smart Watch S'",
        kind: "keyword",
        label: "the registered item name",
        why: "The catalog registers the bin as the exact text 'Smart Watch S', quotes included. A truncated 'Smart Watch' matches nothing, and the count card would print an empty row on the one premium bin the pack cares about.",
      },
    ],
    distractors: ["SUM(o.total)", "oi.id = o.id", "'Smart Watch'"],
    walkthrough:
      "The bin's card is one item, charged honestly: lines joined to bookings on order_id, quantity times unit price summed once per line. The figure that comes back is 4,582.02 across 11 sale lines and 23 units — and that number reconciles: it is a slice of the book's honest 34,833.28. The trap this build refuses is the pairing's printed total: sum the bookings' own totals after the join and the same slice reads 7,309.91, because every booking that rides a watch line bills its full amount again for each other line it carries. Across the whole ledger that mistake turns 34,833.28 into 103,244.55 — nearly triple the truth. The card now quotes earned money, and if anyone quotes 7,309.91 in the count meeting, the mechanism has a name.",
  },
  {
    id: "cs-535",
    tier: "easy",
    topic: "l16",
    universe: "funnel",
    title: "The APAC number the seed budget can trust",
    brief:
      "From: Growth marketing lead. Re: regional seed budgets.\n\nWe are sizing the next APAC campaign off what the region has actually spent with us, and the last deck quoted a number that fell apart the moment finance re-added it. I want the region's lifetime spend charged the honest way — every sale line priced at what it actually sold for and added once — so the budget conversation starts from money that reconciles.",
    ask: "APAC accounts' lifetime charged spend at line grain, as one figure.",
    template: `SELECT ROUND({1}, 2) AS spend
FROM order_items oi
JOIN orders o ON {2}
JOIN customers c ON o.customer_id = c.id
WHERE c.region = {3};`,
    slots: [
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the line charge",
        why: "Spend is earned line by line: quantity times the price each line sold at, added once. The bookings' own totals in this slot would bill every booking once per line riding it and hand the budget a number nearly three times the truth.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the line-to-booking thread",
        why: "Each line's booking is found through order_id landing on the ledger's id — that is the thread that lets the region filter reach the lines. Pairing line numbers with booking numbers directly would keep barely a hundred lines and quietly drop the rest of the region.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the region value",
        why: "The campaign is scoped to the quoted text 'APAC', exact and case-sensitive. 'EU' would size the seed budget off a different continent's spend, and the deck's regional math would not survive the first finance check.",
      },
    ],
    distractors: ["SUM(o.total)", "'EU'", "oi.id = o.id"],
    walkthrough:
      "The seed number is a region filter with an honest charge: 'APAC' on the account side, lines joined to bookings on order_id, quantity times unit price summed once per line. The figure that comes back is 11,605.45 — APAC's true lifetime spend, the file's second region behind the EU's 15,089.23. The version that fell apart last quarter was the pairing's printed total: sum the bookings' totals after the join and the region reads 32,444.20, nearly triple, because multi-line bookings bill once per line. Run that same mistake across the whole book and 34,833.28 prints as 103,244.55. The budget can now cite 11,605.45 and defend it line by line — which is exactly what a seed conversation needs when finance is in the room.",
  },
  {
    id: "cs-536",
    tier: "easy",
    topic: "l16",
    universe: "supplier",
    title: "The Andes page, billed at line grain",
    brief:
      "From: Supply-chain lead. Re: QBR pack, vendor pages.\n\nThe Andes Naturals page needs its lifetime billed figure, and the last draft quoted a number that changed twice in one meeting depending on who added it up. Bill them the way purchasing actually buys: each sale line at quantity times the price it sold at, added once, so the page's figure ties to the line files exactly.",
    ask: "Andes Naturals SA's lifetime billed revenue at line grain, as one figure.",
    template: `SELECT s.name, ROUND({1}, 2) AS billed
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN suppliers s ON {2}
WHERE s.name = {3}
GROUP BY s.name;`,
    slots: [
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the line charge",
        why: "Vendors are paid for goods, and goods move line by line: quantity times the selling price, charged once. Summing anything else here either ignores the quantities or inherits the booking-repetition problem, and the QBR page would quote a figure that unties from the line files.",
      },
      {
        answer: "p.supplier_id = s.id",
        kind: "keyword",
        label: "the catalog-to-vendor thread",
        why: "Every catalog item points at its vendor through supplier_id, landing on the vendor file's id. Matching item numbers against vendor numbers instead would keep only the six items whose numbers happen to coincide with vendor numbers — the Speaker but not the Fitness Band — and bill Andes for a fragment of their shelf.",
      },
      {
        answer: "'Andes Naturals SA'",
        kind: "keyword",
        label: "the registered vendor name",
        why: "The vendor file registers the name as the exact text 'Andes Naturals SA', quotes included. A truncated 'Andes Naturals' matches nothing and the QBR page prints blank — the meeting would proceed with no LATAM vendor figure at all.",
      },
    ],
    distractors: ["SUM(oi.quantity)", "p.id = s.id", "'Andes Naturals'"],
    walkthrough:
      "The vendor bill is a sourcing chain charged honestly: lines to catalog on product_id, catalog to vendor file on supplier_id, Andes Naturals SA filtered by its registered name, quantity times unit price summed once per line. The page bills Andes 3,613.25 across 25 sale lines and 51 units — their true footprint with us. Two traps worth naming in the meeting. The item-number coincidence join, p.id = s.id, would keep only the Bluetooth Speaker's lines and bill Andes 1,266.15 — a third of their real page, because the coincidence only aligns catalog items one through six. And the pairing trap: route the chain through the booking ledger and sum the bookings' own totals, and Andes prints 9,688.99 — billed once per line they ride, nearly triple the truth. The QBR page now shows 3,613.25 and can defend every cent of it.",
  },
  {
    id: "cs-537",
    tier: "easy",
    topic: "l16",
    universe: "expense",
    title: "The accessories line, charged once",
    brief:
      "From: Finance ops, spend review. Re: category trims.\n\nBefore we trim the accessories budget I want what that shelf has actually cost us, charged the way the money moved: every sale line at quantity times its selling price, counted once. The figure I was handed last cycle moved depending on who added it up, and a trim decision cannot rest on a number like that.",
    ask: "Lifetime charged spend on the Accessories category, as one figure.",
    template: `SELECT p.category, ROUND({1}, 2) AS spend
FROM order_items oi
JOIN products p ON {2}
WHERE p.category = {3}
GROUP BY p.category;`,
    slots: [
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the line charge",
        why: "The shelf costs what its lines sold for: quantity times unit price, charged once per line. Summing the raw unit prices ignores how many units moved, and summing booking totals after a line join bills every booking once per line — either way the trim memo quotes a number the receipts cannot support.",
      },
      {
        answer: "oi.product_id = p.id",
        kind: "keyword",
        label: "the line-to-catalog thread",
        why: "Each sale line points at its catalog item through product_id, landing on the catalog's id — that is the thread that carries the shelf label onto every line. Line numbers matched against item numbers would keep barely a hundred lines and file the rest under no category at all.",
      },
      {
        answer: "'Accessories'",
        kind: "keyword",
        label: "the shelf label",
        why: "The shelf is the quoted text 'Accessories', exact and case-sensitive. 'Electronics' would run the trim analysis on a different shelf — one that spends more, so the memo would cut the wrong budget line.",
      },
    ],
    distractors: ["SUM(oi.quantity)", "SUM(oi.unit_price)", "'Electronics'"],
    walkthrough:
      "The trim analysis is a shelf filter charged honestly: lines joined to the catalog on product_id, the 'Accessories' shelf isolated, quantity times unit price summed once per line. The shelf has cost 3,294.29 across 62 sale lines and 121 units — the file's busiest shelf by line count, which is exactly why the trim conversation needs honest arithmetic. The two near-miss figures show why. Sum the raw unit prices and the shelf reads 1,698.34 — prices added, quantities ignored, nearly half the truth. Sum booking totals after the line join and the shelf inflates to 20,983.64, because every multi-line booking bills once per line. Across the whole book that same mistake turns 34,833.28 into 103,244.55. The memo now carries 3,294.29, and both wrong versions have explanations attached.",
  },
  {
    id: "cs-538",
    tier: "easy",
    topic: "l16",
    universe: "growth",
    title: "The regional bill for the growth slide",
    brief:
      "From: Chief of Staff. Re: board deck, regional slide.\n\nThe regional slide carries one lifetime figure per region, and the deck has been burned before by totals that do not tie when finance checks them. I want each region's spend charged at line grain — what the goods actually sold for, line by line — so every bar on the slide reassembles into the book's grand total to the cent.",
    ask: "Lifetime charged revenue for every region, biggest first.",
    template: `SELECT c.region, ROUND({1}, 2) AS revenue
FROM order_items oi
JOIN orders o ON {2}
JOIN customers c ON o.customer_id = c.id
GROUP BY {3}
ORDER BY revenue DESC;`,
    slots: [
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the line charge",
        why: "The slide's bars must reassemble into the book's grand total, and only the line charge does that: quantity times unit price, once per line. The bookings' own totals after the line join would repeat every multi-line booking and push the four bars past 100,000 against a 34,833.28 book.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the line-to-booking thread",
        why: "Lines reach their booking through order_id landing on the ledger's id, and the booking carries the account that carries the region. Pairing line numbers with booking numbers would keep barely a hundred of the 251 lines and file the rest into no region at all.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the grouping column",
        why: "The slide is regional, and region lives on the account register — grouping there produces the four bars the deck expects. Grouping by city would shred the slide into sixteen one-account metros and bury the continental story the board asked for.",
      },
    ],
    distractors: ["SUM(o.total)", "c.city", "oi.id = o.id"],
    walkthrough:
      "The slide is a regional rollup at honest grain: lines joined to bookings on order_id, bookings to accounts on customer_id, quantity times unit price summed once per line, grouped by region. Four bars come back: EU 15,089.23, APAC 11,605.45, US 7,286.16, LATAM 852.44 — and they reassemble to 34,833.28 exactly, the book's grand total, which is the slide's whole defense. The pairing's printed version would show 43,978.74, 32,444.20, 23,710.29 and 3,111.32 — over 103,000 against a 34,833.28 book — because every multi-line booking bills once per line. Same four regions, same accounts, money that was never charged. Grouping by city instead would hand the deck sixteen one-account metros and hide the fact that one Berlin account carries most of the EU bar. Four bars, one total, no dispute left for the board pack.",
  },
  {
    id: "cs-539",
    tier: "medium",
    topic: "l16",
    universe: "fraud",
    title: "Two totals on the Berlin file",
    brief:
      "From: Risk team, spot-check rotation. Re: the Berlin file.\n\nThe Berlin account's paperwork shows a lifetime figure that cannot be right — it is close to triple what her receipts could possibly total. I want both figures on one row, side by side: what the pair-up prints when a booking's full total repeats once per line riding it, and what the account has actually been charged, line by line.",
    ask: "Alice Chen's charged revenue and the pairing's printed total, side by side on one row.",
    template: `SELECT c.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS charged,
ROUND({1}, 2) AS printed
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN customers c ON {2} = {3}
WHERE c.name = {4}
GROUP BY c.name;`,
    slots: [
      {
        answer: "SUM(o.total)",
        kind: "keyword",
        label: "the pairing's printed total",
        why: "The printed column has to reproduce the defect, and the defect is booking totals repeating once per line: sum o.total after the line join and Alice's 24 bookings bill once for each of the 50 lines riding them. The honest line charge in this slot would print the true figure and hide the discrepancy the rotation is chasing.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Bookings reach their account through customer_id — that pointer is what gathers Alice's 50 lines onto her row. The booking's own id here would match booking numbers against account numbers and file a handful of stray lines under her name.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id, and the pointer must land there. The register has no customer_id of its own, so that spelling breaks the query before either total exists.",
      },
      {
        answer: "'Alice Chen'",
        kind: "keyword",
        label: "the account name",
        why: "The rotation names the file — the exact quoted text 'Alice Chen'. 'Emma Wilson' would audit a different account entirely and put Austin's numbers on a Berlin row.",
      },
    ],
    distractors: ["SUM(oi.quantity * oi.unit_price)", "AVG(o.total)", "'Emma Wilson'", "c.customer_id"],
    walkthrough:
      "The dispute row puts both grains on one line: the account register reached through customer_id = c.id, the honest charge from quantity times unit price per line, and the printed total from summing booking totals after the join. Alice Chen's row reads charged 7,262.35 against printed 18,784.19 — the paperwork claims two and a half times what her receipts support. The mechanism is mechanical, not criminal: her 24 bookings carry 50 lines, and a booking with three lines bills its full total three times in the pairing. The same lens explains the file's worst offender — Emma Wilson prints 21,369.77 against a charged 6,640.56 — and the whole book, where the printed 103,244.55 is 2.96 times the honest 34,833.28. The rotation can now sign the file off as a grain defect with the two figures to prove it.",
  },
  {
    id: "cs-540",
    tier: "easy",
    topic: "l16",
    universe: "catalog",
    title: "The cable's card, units and charged money",
    brief:
      "From: Catalog content manager. Re: hero-item cards.\n\nThe HDMI cable is about to headline the catalog refresh, and its card needs two honest numbers on one row: total units moved and total money charged, both computed off the sale lines themselves. If the card's arithmetic cannot be traced line by line, merchandising will not sign the refresh.",
    ask: "Units moved and charged revenue for the HDMI 2.1 Cable 2m, on one row.",
    template: `SELECT p.name, {1} AS units, ROUND({2}, 2) AS revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
WHERE p.name = {3}
GROUP BY p.name;`,
    slots: [
      {
        answer: "SUM(oi.quantity)",
        kind: "keyword",
        label: "the units column",
        why: "Units moved means every line's quantity added up — 2-meter cables ship in bundles, and the card's unit count has to include them. Summing unit prices into this column would print dollars where units belong, and the card would claim the cable moved 288 units instead of 38.",
      },
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the line charge",
        why: "Charged revenue is quantity times the price each line sold at, added once per line — the only sum that ties to the receipts. The booking ledger is not even wired into this build, so its totals cannot leak in; the risk is a sum that forgets the quantities.",
      },
      {
        answer: "'HDMI 2.1 Cable 2m'",
        kind: "keyword",
        label: "the registered item name",
        why: "The catalog registers the item as the exact text 'HDMI 2.1 Cable 2m', quotes included. A truncated 'HDMI 2.1 Cable' matches nothing and the hero card prints empty on refresh day.",
      },
    ],
    distractors: ["SUM(oi.unit_price)", "SUM(o.total)", "'HDMI 2.1 Cable'"],
    walkthrough:
      "The hero card is one item measured twice: lines joined to the catalog on product_id, quantities summed for the units column, quantity times unit price summed for the money column. The card reads 38 units and 575.50 charged across 19 sale lines — the file's cheapest item, priced at 14.99, quietly moving the most units per line in the building. The near-miss figure is instructive: sum the raw unit prices and the card prints 288.04, dollars sitting in the units column and money missing the quantities entirely. And the booking ledger is deliberately absent from this build — there is no booking join to inflate through, so the classic 103,244.55 mistake is not even available. The card's two figures trace line by line, which is the only standard merchandising signs.",
  },
  {
    id: "cs-541",
    tier: "medium",
    topic: "l16",
    universe: "month-close",
    title: "The per-state doubling, reproduced for the close",
    brief:
      "From: Controller. Re: month-end close, the auditors' question.\n\nThe auditors asked what happens to the state-by-state view if a booking's full total repeats once per line riding it, and they want the damage printed, not described. Reproduce the inflated per-state figures off the paired lines — every booking billed once per line — so the close binder can show exactly where the doubling lands.",
    ask: "Each fulfillment state's inflated total when bookings are billed once per line, biggest first.",
    template: `SELECT o.status, ROUND({1}, 2) AS printed
FROM order_items oi
JOIN orders o ON {2}
GROUP BY {3}
ORDER BY printed DESC;`,
    slots: [
      {
        answer: "SUM(o.total)",
        kind: "keyword",
        label: "the inflated booking total",
        why: "The reproduction has to bill every booking once per line, and summing the ledger's own totals after the line join does exactly that. The honest line charge in this slot would print the true per-state figures and leave the auditors' question unanswered.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the line-to-booking thread",
        why: "The repetition lives in the join: each line pulls its booking's full total through order_id landing on the ledger's id. Pairing line numbers with booking numbers instead would keep barely a hundred lines and reproduce a different, smaller defect than the one the binder documents.",
      },
      {
        answer: "o.status",
        kind: "keyword",
        label: "the state grouping",
        why: "The auditors asked per state, and state lives on the booking ledger — grouping there yields the four rows the binder expects. Grouping by the total itself would shred the reproduction into one row per booking and bury the per-state story.",
      },
    ],
    distractors: ["SUM(oi.quantity * oi.unit_price)", "AVG(o.total)", "o.id = oi.id", "o.total"],
    walkthrough:
      "The reproduction is deliberate: lines joined to bookings on order_id, the bookings' own totals summed per state, so every multi-line booking bills once per line. The binder's four rows: delivered 43,218.20, shipped 39,346.52, pending 17,991.07, cancelled 2,688.76 — together 103,244.55 against a book that truly holds 34,833.28, a 2.96-times blow-up. Next to the honest line-grain figures — 15,571.07, 11,996.72, 6,113.00 and 1,152.49, which reconcile exactly — the damage splits tellingly: delivered books the biggest dollar inflation because 119 lines ride its 52 bookings, while shipped suffers the worst factor, nearly 3.3 times, on 84 lines riding 30 bookings. The line charge is the control that proves the point: charged once per line, each state's figure is exact, and the four honest sums reassemble the grand total to the cent.",
  },
  {
    id: "cs-542",
    tier: "medium",
    topic: "l16",
    universe: "refund-audit",
    title: "What the goodwill queue really cost",
    brief:
      "From: refunds@ — weekly queue review. Re: the goodwill ledger.\n\nThe goodwill ledger needs the cancellation queue's cost broken out by account, charged per sale line, because two of last quarter's numbers moved when the pair-up was rerun. Charge every cancelled line once at what it sold for and break it out by account, so the sign-off quotes figures that survive being checked twice.",
    ask: "Charged cancellation spend per account across the cancelled queue, biggest first.",
    template: `SELECT c.name, ROUND({1}, 2) AS charged
FROM order_items oi
JOIN orders o ON {2}
JOIN customers c ON o.customer_id = c.id
WHERE o.status = {3}
GROUP BY {4}
ORDER BY charged DESC;`,
    slots: [
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the line charge",
        why: "Goodwill cost is what the cancelled goods actually sold for, line by line, charged once. Summing the bookings' totals after the line join would pad the very accounts the ledger is trying to settle fairly and make the sign-off numbers move on every rerun.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the line-to-booking thread",
        why: "Cancellation is a booking state, and each line reaches its booking through order_id landing on the ledger's id. Line numbers matched against booking numbers would keep barely a hundred lines and silently drop cancelled lines out of the goodwill ledger.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the queue's status",
        why: "The queue is defined by the exact quoted text 'cancelled', lowercase. A capitalized 'Cancelled' matches nothing and the ledger reports a queue that cost nothing — the sign-off would clear goodwill money that was actually spent.",
      },
      {
        answer: "c.name",
        kind: "keyword",
        label: "the grouping column",
        why: "The sign-off is per account, and names live on the account register — grouping there gives one row per account. Grouping by region would roll the queue into three continental blobs and hide which account the goodwill money actually leaves.",
      },
    ],
    distractors: ["SUM(o.total)", "'Cancelled'", "c.region", "oi.id = o.id"],
    walkthrough:
      "The goodwill ledger is the cancelled slice charged honestly: lines joined to bookings on order_id, the 'cancelled' state filtered, quantity times unit price summed once per line, grouped by account. Four accounts owe the queue: Alice Chen 494.82 across her three cancellations at 206.19, 152.52 and 136.11, Keiko Sato 397.99, Emma Wilson 143.86, Maya Patel 115.82 — 12 cancelled lines on 7 bookings, reassembling to the queue's true 1,152.49. The pairing's printed version is the reason the numbers moved last quarter: it pads Alice to 837.12 and Keiko to 1,591.96, while Emma's and Maya's rows stay honest because their cancelled bookings happen to be single-line. That asymmetry is the tell — any ledger whose inflation lands unevenly by account is summing the wrong grain. The sign-off now carries 1,152.49, stable under reruns.",
  },
  {
    id: "cs-543",
    tier: "medium",
    topic: "l16",
    universe: "pricing",
    title: "The desk mat's inflated pairing",
    brief:
      "From: Pricing analyst. Re: repricing the Desk Mat.\n\nThe desk mat's internal report claims the item has pulled in several times what its price sheet could possibly support, and the discrepancy traces to how the sale lines were paired with bookings. Reproduce the inflated figure exactly — every booking that rides a desk-mat line billed once per line — so the repricing memo can quote the wrong number and name the mechanism.",
    ask: "The inflated pairing total printed for the Desk Mat Extended, as one figure.",
    template: `SELECT p.name, ROUND({1}, 2) AS printed
FROM order_items oi
JOIN orders o ON {2}
JOIN products p ON oi.product_id = p.id
WHERE p.name = {3}
GROUP BY p.name;`,
    slots: [
      {
        answer: "SUM(o.total)",
        kind: "keyword",
        label: "the inflated booking total",
        why: "Reproducing the defect means summing the ledger's own totals after the line join, so every booking that rides a desk-mat line bills its full amount again for its other lines. The honest line charge would print 1,176.02 and erase the discrepancy the memo exists to explain.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the line-to-booking thread",
        why: "The inflation is manufactured by the join itself: each line pulls its booking's full total through order_id landing on the ledger's id. Pairing line numbers with booking numbers would keep barely a hundred lines and reproduce a fragment, not the report's figure.",
      },
      {
        answer: "'Desk Mat Extended'",
        kind: "keyword",
        label: "the registered item name",
        why: "The catalog registers the item as the exact text 'Desk Mat Extended', quotes included. A truncated 'Desk Mat' matches nothing, and the memo would quote a discrepancy on an item the registers have never heard of.",
      },
    ],
    distractors: ["SUM(oi.quantity * oi.unit_price)", "oi.id = o.id", "'Desk Mat'", "AVG(o.total)"],
    walkthrough:
      "The reproduction is surgical: lines joined to bookings on order_id, the Desk Mat Extended filtered, booking totals summed after the join. The figure that comes back is 7,922.34 — against an item that has honestly earned 1,176.02 across 24 sale lines at a 24.99 shelf price. That is a 6.7-times blow-up, the worst on the catalog, and the mechanism is the mat's role in the basket: all 24 of its lines ride 24 distinct bookings, and the mat is the add-on — every one of those bookings carries other, pricier lines whose totals get billed again on the mat's behalf. Run the same defect across the whole book and 34,833.28 prints as 103,244.55. The repricing memo can now quote 7,922.34, name it as a pairing artifact, and anchor the discussion on the honest 1,176.02 that the price sheet actually supports.",
  },
  {
    id: "cs-544",
    tier: "medium",
    topic: "l16",
    universe: "inventory",
    title: "Deep bins, honestly billed",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: the deep-bin earnings annex.\n\nThe annex lists every bin holding more than 150 units alongside what the goods have actually earned, charged per sale line, so the count team can see which deep bins are also heavy earners. Deep bins get counted twice a year, and this annex decides which ones earn the second visit.",
    ask: "Charged revenue for every product holding more than 150 units, biggest first.",
    template: `SELECT p.name, ROUND({1}, 2) AS charged
FROM order_items oi
JOIN orders o ON {2}
JOIN products p ON oi.product_id = p.id
WHERE p.stock > {3}
GROUP BY p.name
ORDER BY charged DESC;`,
    slots: [
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the line charge",
        why: "The annex ranks bins by earned money, and only the line charge — quantity times unit price, once per line — ranks them honestly. Summing booking totals after the line join would let multi-line bookings pad whichever bins ride the fullest baskets and scramble the second-visit list.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the line-to-booking thread",
        why: "Each sale line reaches its booking through order_id landing on the ledger's id, which is what lets the fulfillment picture attach to the lines. Line numbers matched against booking numbers would keep barely a hundred lines and understate nearly every bin in the annex.",
      },
      {
        answer: "150",
        kind: "number",
        noVerify: true,
        label: "the deep-bin bar",
        why: "The annex's definition of deep is more than 150 units — the count desk's own bar. The Ring Light sits at exactly 150 and stays off the list; drop the bar to 100 and three more bins crowd in, doubling the annex's workload for no extra insight.",
      },
    ],
    distractors: ["SUM(o.total)", "oi.id = o.id", "100"],
    walkthrough:
      "The annex is a stock bar with an honest charge: the 'more than 150 units' bins, lines joined to bookings on order_id, quantity times unit price summed once per line, ranked biggest first. Seven bins qualify: Laptop Stand Aluminum 1,542.77, Bluetooth Speaker Mini 1,266.15, Wireless Mouse 1,239.85, Desk Mat 1,176.02, Yoga Mat 863.91, Running Socks 600.78, HDMI Cable 575.50. The boundary is doing real work — the Ring Light at exactly 150 stays off, and the HDMI bin shows the annex's point in miniature: 500 units deep, the fullest shelf in the building, yet the smallest earner on the list at 575.50. Depth and demand are different axes. The pairing's printed totals would have padded the Laptop Stand to 6,825.10 and reshuffled the whole ranking, which is why the annex charges per line: the second-visit list has to be about the goods, not the baskets they ride in.",
  },
  {
    id: "cs-545",
    tier: "hard",
    topic: "l16",
    universe: "funnel",
    title: "Landed money by region, charged per line",
    brief:
      "From: Growth marketing lead. Re: the converted-revenue slide.\n\nThe funnel's closing slide claims money actually landed, broken out by region, and last quarter's version quietly re-ranked the regions because the totals came off a pairing that repeats bookings. I want delivered revenue charged per sale line by region — and I want to know which region the sloppy version would have crowned.",
    ask: "Delivered revenue by region at line grain, biggest first.",
    template: `SELECT c.region, ROUND({1}, 2) AS landed
FROM order_items oi
JOIN orders o ON {2}
JOIN customers c ON o.customer_id = c.id
WHERE o.status = {3}
GROUP BY {4}
ORDER BY landed DESC;`,
    slots: [
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the line charge",
        why: "Landed money is what the delivered goods actually sold for, charged once per line — the only sum that keeps the regions ranked by real money. Booking totals after the line join repeat every multi-line delivery and re-rank the slide on inflation, which is precisely the defect last quarter's version shipped with.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the line-to-booking thread",
        why: "Delivered is a booking state, and each line reaches its booking through order_id landing on the ledger's id. Line numbers matched against booking numbers would keep barely a hundred lines and file the rest into no region — the slide would undercount every continent.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the landed status",
        why: "Money actually landed means the exact quoted text 'delivered', lowercase. 'shipped' would count in-flight bookings as landed and the slide would claim revenue the region has not even received yet.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the grouping column",
        why: "The slide is regional, and region lives on the account register — grouping there produces the four continental bars. Grouping by city would shred the slide into one-account metros and bury the regional story the deck needs.",
      },
    ],
    distractors: ["SUM(o.total)", "'shipped'", "c.city", "o.id = oi.id"],
    walkthrough:
      "The converted slide is a status filter with an honest charge: 'delivered' only, lines joined to bookings on order_id, bookings to accounts on customer_id, quantity times unit price summed once per line, grouped by region. Four bars: EU 6,656.18, APAC 6,617.68, US 1,444.77, LATAM 852.44 — together the delivered book's 15,571.07, reconciling to the cent. And here is the answer to the question the brief asked: the pairing's printed version reads APAC 17,611.17 over EU 17,312.12 — the sloppy build would have crowned APAC on the closing slide. The honest line charge keeps Europe on top by 38.50, a lead thin enough that only correct grain protects it. LATAM is the control: Bruno Silva's two bookings are single-line, so both versions print 852.44 — the inflation only bites where baskets carry multiple lines, which is exactly why it hides from spot checks.",
  },
  {
    id: "cs-546",
    tier: "hard",
    topic: "l16",
    universe: "supplier",
    title: "The vendor bill, printed and charged",
    brief:
      "From: Supply-chain lead. Re: QBR pack, the vendor reconciliation page.\n\nThe pack's closing page settles a standing dispute: the vendor totals the registers print do not match what purchasing says it paid. Put both figures on one row per vendor — what the pairing prints when bookings repeat once per line, and the charged truth at line grain — ranked by the printed figure so the worst padding leads the page.",
    ask: "Per vendor: charged line revenue and the pairing's printed total, ranked by the printed figure.",
    template: `SELECT s.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS charged,
ROUND({1}, 2) AS printed
FROM order_items oi
JOIN orders o ON {2}
JOIN products p ON oi.product_id = p.id
JOIN suppliers s ON {3}
GROUP BY s.name
ORDER BY printed DESC;`,
    slots: [
      {
        answer: "SUM(o.total)",
        kind: "keyword",
        label: "the pairing's printed total",
        why: "The printed column exists to reproduce the registers' defect: booking totals repeating once per line. The honest line charge in this slot would print the same figures as the charged column, the two columns would agree, and the dispute the page exists to settle would vanish from the record.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the line-to-booking thread",
        why: "The repetition is manufactured in this join: each line pulls its booking's full total through order_id landing on the ledger's id. Line numbers matched against booking numbers would keep barely a hundred lines and print a distortion the vendors' real paperwork cannot reproduce.",
      },
      {
        answer: "p.supplier_id = s.id",
        kind: "keyword",
        label: "the catalog-to-vendor thread",
        why: "Goods reach their vendor through the catalog's supplier_id landing on the vendor file's id. Vendors carry no supplier_id of their own, so that spelling errors out — and item numbers matched against vendor numbers would keep only six items and misbill every vendor on the page.",
      },
    ],
    distractors: ["SUM(oi.quantity * oi.unit_price)", "AVG(o.total)", "s.supplier_id", "oi.id = o.id"],
    walkthrough:
      "The reconciliation page is the full sourcing chain with both grains on one row: lines to bookings on order_id, lines to catalog on product_id, catalog to vendor file on supplier_id, charged per line and printed per booking. Ranked by the printed figure, the page leads with Midwest Hardware Co at 25,712.57 — but the charged column says 9,294.93, and the charged truth crowns Nordic Gadgets instead at 11,130.25 against its printed 22,287.88. Shenzhen Electro shows the worst padding: 16,505.18 printed on 3,049.07 charged, better than five times, because its cheap add-on items ride big baskets. Both columns reassemble cleanly — 103,244.55 printed, 34,833.28 charged — which is the page's whole argument: same 251 lines, same six vendors, two different questions. The QBR now leads with the padding, names the mechanism, and settles the purchasing dispute on 34,833.28.",
  },
  {
    id: "cs-547",
    tier: "hard",
    topic: "l16",
    universe: "expense",
    title: "The spend report's inflated podium",
    brief:
      "From: Finance ops, spend review. Re: the spend report the meeting saw.\n\nThe spend report ranked accounts by lifetime booked value, and the numbers were padded — every booking that rides several lines billed its full total once per line. Reproduce the padded per-account ranking exactly as the report printed it, so the review can walk the room from the padded podium down to what each account was actually charged.",
    ask: "Every account's pairing-inflated total, ranked biggest first, as the report printed it.",
    template: `SELECT c.name, ROUND({1}, 2) AS printed
FROM order_items oi
JOIN orders o ON {2}
JOIN customers c ON o.customer_id = c.id
GROUP BY {3}
ORDER BY printed DESC;`,
    slots: [
      {
        answer: "SUM(o.total)",
        kind: "keyword",
        label: "the inflated booking total",
        why: "Reproducing the report means repeating its defect: booking totals summed after the line join, so each booking bills once per line it rides. The honest line charge in this slot would print the charged leaderboard instead and make the padding impossible to demonstrate.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the line-to-booking thread",
        why: "The padding enters through the join: every line pulls its booking's full total via order_id landing on the ledger's id. Line numbers matched against booking numbers would keep barely a hundred lines and print a ranking nobody's report ever showed.",
      },
      {
        answer: "c.name",
        kind: "keyword",
        label: "the grouping column",
        why: "The report is per account, and names live on the account register — grouping there gives the sixteen rows the review expects. Grouping by region would collapse the podium to four continental rows and hide which account the padding actually pads.",
      },
    ],
    distractors: ["SUM(oi.quantity * oi.unit_price)", "AVG(o.total)", "c.region", "o.id = oi.id"],
    walkthrough:
      "The reproduction is the report's own recipe: lines joined to bookings on order_id, bookings to accounts on customer_id, booking totals summed per account, ranked descending. The padded podium: Emma Wilson 21,369.77, Alice Chen 18,784.19, Grace Kim 13,531.03, Maya Patel 9,772.09, Chloe Dubois 8,758.16 — sixteen rows summing to 103,244.55 against the book's true 34,833.28. Now the charged lens, which the review walks next: Alice actually leads at 7,262.35, Emma's charged truth is 6,640.56 — the printed version nearly triples her — and Grace prints 13,531.03 on 4,574.23 charged. The podium itself is an artifact: accounts with many multi-line bookings climb it, so the ranking flatters exactly the spending pattern that repeats most. The review can now show both orders side by side and land on the honest figure every account's receipts support.",
  },
  {
    id: "cs-548",
    tier: "hard",
    topic: "l16",
    universe: "growth",
    title: "The metro slide, printed and charged",
    brief:
      "From: Chief of Staff. Re: board deck, the metro appendix.\n\nThe appendix carries both lifetime figures per metro, and the two versions disagree about which city leads. Put them on one row per city — the charged truth at line grain, and the pairing's printed total where bookings repeat once per line — so the deck can show the room exactly how far the paperwork drifts from the money.",
    ask: "Per city: charged revenue and the pairing's printed total, ranked by the printed figure.",
    template: `SELECT c.city, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS charged,
ROUND({1}, 2) AS printed
FROM order_items oi
JOIN orders o ON {2}
JOIN customers c ON o.customer_id = c.id
GROUP BY {3}
ORDER BY printed DESC;`,
    slots: [
      {
        answer: "SUM(o.total)",
        kind: "keyword",
        label: "the pairing's printed total",
        why: "The printed column reproduces the paperwork's defect: booking totals repeating once per line. The honest line charge in this slot would make both columns identical and the deck would lose the very contrast the appendix exists to show.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the line-to-booking thread",
        why: "Each line reaches its booking through order_id landing on the ledger's id — that thread is what lets the drift between the two columns exist at all. Line numbers matched against booking numbers would keep barely a hundred lines and print a distortion no metro's paperwork shows.",
      },
      {
        answer: "c.city",
        kind: "keyword",
        label: "the grouping column",
        why: "The appendix is per metro, and city lives on the account register — grouping there gives one row per city, each currently backed by a single account. Grouping by region would collapse sixteen metros into four continental rows and erase the city-level comparison the deck promises.",
      },
    ],
    distractors: ["SUM(oi.quantity * oi.unit_price)", "AVG(o.total)", "c.region", "o.id = oi.id"],
    walkthrough:
      "The appendix is the city rollup with both grains: lines to bookings on order_id, bookings to accounts on customer_id, charged per line and printed per booking, sixteen rows ranked by the printed figure. The printed version crowns Austin at 21,369.77 — but Austin's charged truth is 6,640.56, because Emma Wilson's 17 bookings carry 46 lines and bill themselves over and over. Berlin prints 18,784.19 while charging the most at 7,262.35, and Seoul prints 13,531.03 on 4,574.23 charged. At the honest end, Sao Paulo's 3,111.32 printed sits on 852.44 charged — the smallest gap in the file, because Bruno Silva's two bookings are single-line and have nothing to repeat. That spread is the appendix's argument in miniature: the paperwork's ranking is a function of basket size, not spending. The charged column reassembles to 34,833.28; the printed one burns 103,244.55.",
  },
  {
    id: "cs-549",
    tier: "hard",
    topic: "l16",
    universe: "fraud",
    title: "The average that prints too heavy",
    brief:
      "From: Risk team, spot-check rotation. Re: the monitoring dashboard.\n\nThe dashboard prints an average exposure per fulfillment state, and the numbers it shows cannot be defended — the pending average alone exceeds anything on the open-ticket list. Reproduce what the dashboard prints: bookings paired with their lines and averaged per state, so the rotation can quote the defect before we demand the fix.",
    ask: "Each state's printed average booking total off the paired lines, heaviest first.",
    template: `SELECT o.status, ROUND(AVG({1}), 2) AS printed_avg
FROM order_items oi
JOIN orders o ON {2}
GROUP BY {3}
ORDER BY printed_avg DESC;`,
    slots: [
      {
        answer: "o.total",
        kind: "keyword",
        label: "the averaged booking total",
        why: "The dashboard's defect is averaging booking totals across the paired rows, where every multi-line booking contributes its full total once per line it rides. Averaging the line ids here would print a meaningless booking-number average, and the rotation would be quoting a defect that does not exist.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the line-to-booking thread",
        why: "The overweight comes from the pairing: each line drags its booking's full total into the average via order_id landing on the ledger's id. Line numbers matched against booking numbers would keep barely a hundred lines and average a fragment no dashboard ever printed.",
      },
      {
        answer: "o.status",
        kind: "keyword",
        label: "the state grouping",
        why: "The dashboard breaks exposure out per state, and state lives on the booking ledger — grouping there gives the four rows the rotation expects. Grouping by the account pointer would collapse the view to one row per account and hide which state's average is inflated worst.",
      },
    ],
    distractors: ["o.id", "oi.unit_price", "o.customer_id", "o.id = oi.id"],
    walkthrough:
      "The reproduction mirrors the dashboard: lines joined to bookings on order_id, booking totals averaged per state. Pending prints 499.75 — the heaviest state on the board — then shipped 468.41, delivered 363.18, cancelled 224.06. The true averages say otherwise: the average pending booking is 436.64, shipped 399.89, delivered 299.44, cancelled 164.64, because each state's bookings repeat once per line — pending's 14 bookings ride 36 lines. The dashboard's overweight is worst exactly where baskets are richest, which is why the open states look scarier than they are. At book level the same lens: 411.33 printed against a true average booking of 338.19. The tempting band-aid — averaging only the distinct booking totals — prints 338.19 today, but only because all 103 booking totals happen to be distinct; the day two bookings tie, it silently misaverages. The rotation quotes the defect and the mechanism, not just the number.",
  },
  {
    id: "cs-550",
    tier: "hard",
    topic: "l16",
    universe: "catalog",
    title: "The two-thousand bar, charged per line",
    brief:
      "From: Catalog content manager. Re: the shelf-review cut.\n\nThe refresh keeps only items that have earned their slot — charged revenue above two thousand — and the last cut let a paperwork artifact through because the totals came off a pairing that repeats bookings. Charged money only: each line at what it actually sold for, grouped per item, with the bar applied to the honest figure.",
    ask: "Items whose charged revenue exceeds 2000, biggest first.",
    template: `SELECT p.name, ROUND({1}, 2) AS charged
FROM order_items oi
JOIN orders o ON {2}
JOIN products p ON oi.product_id = p.id
GROUP BY {3}
HAVING SUM(oi.quantity * oi.unit_price) > {4}
ORDER BY charged DESC;`,
    slots: [
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the line charge",
        why: "The bar has to bite on honest money, so both the column and the filter must charge quantity times unit price once per line. Booking totals in the column would let pairing padding carry weak items over a bar they never earned — exactly how the artifact got into the last cut.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the line-to-booking thread",
        why: "Each sale line reaches its booking through order_id landing on the ledger's id, which is what keeps every line in the rollup with its fulfillment context intact. Line numbers matched against booking numbers would keep barely a hundred lines and drop real earners out of the cut entirely.",
      },
      {
        answer: "p.name",
        kind: "keyword",
        label: "the grouping column",
        why: "The cut is per item, and names live on the catalog — grouping there gives one honest row per item before the bar bites. Grouping by shelf instead would test whole categories against the bar and file six individual earn decisions under five category rows.",
      },
      {
        answer: "2000",
        kind: "number",
        noVerify: true,
        label: "the earn bar",
        why: "The refresh's bar is 2,000 in charged revenue — merchandising's own line. Raise it to 3,000 and the Mechanical Keyboard and Fitness Band drop off a cut they earned; lower it and the annex stops being a cut at all.",
      },
    ],
    distractors: ["SUM(o.total)", "oi.id = o.id", "p.category", "3000"],
    walkthrough:
      "The cut is an honest charge with a bar: lines joined to bookings on order_id, lines to catalog on product_id, grouped per item, the 2,000 bar applied inside the filter on the same honest sum. Six items clear it: Noise-Canceling Headset 6,888.25, Smart Watch S 4,582.02, 4K Webcam Pro 3,989.97, Studio Desktop Mic 3,589.61, Mechanical Keyboard K1 2,558.26, Fitness Band X2 2,347.10. The artifact the last cut admitted was the Desk Mat — its pairing total of 7,922.34 would have made it the second-biggest earner in the building on an item that has honestly charged 1,176.02, a 6.7-times puff from booking totals repeating per line. The bar placement matters too: at 3,000 the Keyboard and the Band fall off, so the annex's size is a policy choice, not an accident. Six items, honest money, and a named artifact for the cut that got it wrong.",
  },
];
