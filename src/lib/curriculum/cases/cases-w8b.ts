// Case wave w8b — Module 5 toolkit capstone, second half (lesson 39), cs-1481…cs-1500.
// 20 cases: 6 easy / 6 medium / 8 hard, all topic "w8". The w8 spine is the
// full pipeline — slice (strftime/SUBSTR buckets) → fold (GROUP BY) → stage
// (CTE) → measure (windows: running totals, LAG, RANK, NTILE, paint-over-fold)
// — with printf/text tools mixed in and reconciliation-as-audit asserts on
// ops-calendar deliverables. Framings are deliberately distinct from w8a's
// first-half titles. Every figure traces to committed probe receipts:
// scripts/m5-facts-w8.out (this wave's shared probes; w8a consumed its own
// m5-facts-w8a.out half). Each case is mechanically audited against the live
// seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesW8b: CaseStudy[] = [
  {
    id: "cs-1481",
    tier: "easy",
    topic: "w8",
    universe: "refund-audit",
    title: "The aging queue's census head",
    brief:
      "From: CX ops manager. Re: the unshipped queue census.\n\nThe weekly refund-risk census walks the unshipped pile biggest-block-first: each status row shows its ticket count, its money pot, and the whole queue's pot painted on it so the two rows reconcile against one number. The draft lost its null test, its sort direction and its row cap. Rebuild the census.",
    ask: "One query: the unshipped status census, biggest block first, capped at the two status rows with the 7265.49 queue pot painted on both.",
    template:
      "SELECT status, COUNT(*) AS n, ROUND(SUM(total), 2) AS pot,\n       ROUND(SUM(SUM(total)) OVER (), 2) AS queue_pot\nFROM orders WHERE shipped_at IS {1}\nGROUP BY status ORDER BY n {2} LIMIT {3};",
    slots: [
      { answer: "NULL", kind: "keyword", label: "the unshipped test",
        why: "The census counts what has not shipped: shipped_at IS NULL selects the 21 stuck orders — probed split pending 14 (pot 6113) and cancelled 7 (pot 1152.49). NOT NULL swaps the pile for the shipped fleet's 52/30 blocks and the whole census reads the wrong side of the book." },
      { answer: "DESC", kind: "keyword", label: "the block order",
        why: "Biggest block first: ORDER BY n DESC puts pending's 14 on top of cancelled's 7 — probed head row. ASC hands the crown to the 7-row cancelled block, so the census leads with the smaller risk." },
      { answer: "2", kind: "keyword", label: "the census cap",
        why: "Exactly two status blocks are unshipped — probed 14 + 7 = 21 — so LIMIT 2 prints the full pile and nothing else. LIMIT 1 silently drops the cancelled row and the census stops reconciling: 6113 alone against the painted 7265.49." },
    ],
    distractors: ["NOT NULL", "ASC", "1"],
    walkthrough:
      "Slice and fold first: shipped_at IS NULL cuts the 103-order book down to the 21-order unshipped pile, and GROUP BY status folds it into two blocks — pending, 14 tickets, pot 6113.00; cancelled, 7 tickets, pot 1152.49. Then the window paints: SUM(SUM(total)) OVER () runs after the fold and stamps 7265.49 — the whole pile's pot — on every census row, which is the reconciliation: 6113.00 + 1152.49 must equal the painted figure or the census is lying. ORDER BY n DESC leads with the bigger block and LIMIT 2 keeps both, because a census that hides the cancelled 7 still paints 7265.49 on a single 6113.00 row — the mismatch IS the tell. Flip the null test and the query happily censors the shipped fleet instead: 52 and 30 ticket blocks, none of them stuck, and the refund-risk meeting reviews a clean queue that does not exist.",
  },
  {
    id: "cs-1482",
    tier: "easy",
    topic: "w8",
    universe: "month-close",
    title: "The books' ticket census",
    brief:
      "From: Controller. Re: the close binder's account page.\n\nThe close binder opens with a one-line census per ledger account: how many tickets each account booked, with the ledger's full 80-entry weight painted on the row so the binder self-reconciles. The cash account is the sample line. The draft lost its fold, its paints and its pins. Rebuild the cash census row.",
    ask: "One query: the cash account's census row — 27 tickets — with the 80-entry ledger painted on it.",
    template:
      "SELECT * FROM (SELECT account, COUNT(*) AS n,\n       SUM(COUNT(*)) OVER () AS entries\nFROM ledger_entries GROUP BY account)\nWHERE n = {1} AND entries = {2} AND account = {3};",
    slots: [
      { answer: "27", kind: "number", label: "the cash ticket count",
        why: "Probed ledger account census: cash booked 27 entries, the busiest account. 26 is accounts_receivable's count and 13 is sales_revenue's — pinned against the cash row they describe the wrong account and the row empties." },
      { answer: "80", kind: "number", label: "the painted ledger weight",
        why: "Probed: 27 + 26 + 14 + 13 = 80 entries in the ledger, and SUM(COUNT(*)) OVER () paints that whole weight on every census row — the binder's self-reconciliation. 13 is one account's slice of the fold, not the ledger's weight." },
      { answer: "'cash'", kind: "keyword", label: "the sample account",
        why: "Cash is the binder's sample line and the census's biggest block at 27 tickets. Pin 'accounts_receivable' and the count assert breaks — AR booked 26, one ticket short of the pin — so the row empties instead of printing a mislabelled census." },
    ],
    distractors: ["26", "13", "'accounts_receivable'"],
    walkthrough:
      "The fold comes first: GROUP BY account collapses the 80 ledger entries into four census rows — cash 27, accounts_receivable 26, operating_expenses 14, sales_revenue 13. Then the window paints: SUM(COUNT(*)) OVER () walks the folded rows and stamps 80, the ledger's full weight, onto each one, so any single account row carries both its own slice and the whole-book figure. The outer pins land on cash and assert both truths: 27 tickets of its own, 80 entries behind it. Pin 26 and you have described accounts_receivable — the row empties rather than mislabelling the binder. Pin 13 for the paint and you have confused one account's fold slice with the ledger's total; the painted figure exists precisely so a reviewer can add the four slices and check they rebuild it.",
  },
  {
    id: "cs-1483",
    tier: "easy",
    topic: "w8",
    universe: "pricing",
    title: "The billing ladder's January rung",
    brief:
      "From: Billing ops. Re: the invoiced-revenue ladder.\n\nThe pricing review opens on the billing ladder: one rung per invoice month, each carrying that month's billed dollars and the running climb behind it, and the sign-off row is the first 2025 rung. The draft lost its month key and both rung figures. Rebuild the January 2025 row.",
    ask: "One query: the 2025-01 billing rung with its month billed 11085 and the running ladder asserted at 78865.",
    template:
      "WITH m AS (SELECT strftime('%Y-%m', issued_on) AS mon,\n       SUM(amount_cents) / 100.0 AS billed FROM invoices GROUP BY mon),\nr AS (SELECT mon, billed, SUM(billed) OVER (ORDER BY mon) AS running FROM m)\nSELECT mon, ROUND(billed, 2) AS billed, ROUND(running, 2) AS running\nFROM r WHERE mon = {1} AND running = {2} AND billed = {3};",
    slots: [
      { answer: "'2025-01'", kind: "keyword", label: "the sign-off month",
        why: "January 2025 is the ladder's twelfth rung and the pricing review's sign-off row — probed billed 11085, running 78865. '2025-02' is the final rung: billed 8112, running 86977 — pinned against the 78865 assert the row contradicts itself and empties." },
      { answer: "78865", kind: "number", label: "the running ladder at the rung",
        why: "Probed: SUM(billed) OVER (ORDER BY mon) reads 78865 after twelve months of invoices. 86977 is the completed climb one rung later — pinned together with the January key the two asserts disagree and the row empties." },
      { answer: "11085", kind: "number", label: "the month's billed dollars",
        why: "Probed: 2025-01 billed 11085, the single biggest invoice month in the ladder. 8112 is February 2025's figure — pinned as January's own number it describes the wrong rung and the row empties." },
    ],
    distractors: ["'2025-02'", "86977", "8112"],
    walkthrough:
      "Slice, fold, stage, measure — the close pipeline in one ladder. strftime('%Y-%m', issued_on) slices 28 invoices into 13 month buckets; GROUP BY folds each to its billed dollars (February 2025 books 8112, January 2025 books 11085 — the ladder's heaviest rung); the stage hands the rungs to SUM(billed) OVER (ORDER BY mon), which climbs 7003 → 12012 → … → 78865 at January → 86977 at the February close. The pins assert the sign-off row three ways at once: the month key, its own 11085, and the 78865 climb behind it. Land on February and every figure shifts one rung — 8112 and 86977 — which is why the triple assert exists: a close signed off on the wrong rung fails all three checks, not just one.",
  },
  {
    id: "cs-1484",
    tier: "easy",
    topic: "w8",
    universe: "fraud",
    title: "The whale's zero-padded plate",
    brief:
      "From: Fraud desk. Re: the case-file cover sheet.\n\nThe case file for the store's biggest ticket needs a sortable plate: the order id zero-padded to four digits so it files correctly next to the case numbers, beside the ticket's dollar figure. The draft lost its format code and its sort. Rebuild the whale's plate row.",
    ask: "One query: the biggest order's row with its id printed as a four-digit plate 0074, its total 1088.44, and the 103-order book painted on the row.",
    template:
      "SELECT PRINTF({1}, id) AS plate, ROUND(total, 2) AS total,\n       COUNT(*) OVER () AS cases FROM orders ORDER BY total {2} LIMIT {3};",
    slots: [
      { answer: "'%04d'", kind: "keyword", label: "the plate format",
        why: "PRINTF('%04d', id) pads the 74 to 0074 — probed plate — so the case file sorts beside four-digit case numbers. '%d' prints a bare 74: same order, wrong plate, and the cover sheet no longer matches the filing convention." },
      { answer: "DESC", kind: "keyword", label: "the ticket sort",
        why: "The whale is the biggest ticket, so the walk sorts total DESC — probed: order 74's 1088.44 lands first. ASC hands the case file the cheapest order instead, and the plate prints for a ticket nobody flagged." },
      { answer: "1", kind: "keyword", label: "the case cap",
        why: "One whale, one plate: LIMIT 1 keeps the single head row — probed 0074 / 1088.44. LIMIT 2 drags the runner-up onto the cover sheet, and the case file opens on two suspects instead of one." },
    ],
    distractors: ["'%d'", "ASC", "2"],
    walkthrough:
      "Two tools, one row. The pick: ORDER BY total DESC walks the 103 tickets biggest-first and LIMIT 1 keeps the whale — order 74 at 1088.44, the store's largest ticket. The text half is the plate: PRINTF('%04d', id) renders the id as 0074, a fixed-width tag that files correctly in a case system built on four-digit numbers — '%d' would print 74 and sort it ahead of every 1xxx case. And the window paints the file's scope: COUNT(*) OVER () stamps the whole 103-order book onto the cover row, so the reviewer can see at a glance how many tickets the sweep covered. The audit is the plate itself: the cover sheet must show 0074, not 74, and 1088.44 beside it. Sort ASC and the same query produces a perfectly valid plate for the cheapest ticket in the store; nothing errors, which is exactly why the total figure and the plate belong on the same asserted row.",
  },
  {
    id: "cs-1485",
    tier: "easy",
    topic: "w8",
    universe: "inventory",
    title: "The thin shelf's second rung",
    brief:
      "From: Warehouse lead. Re: the thin-stock walk.\n\nThe restock sheet walks the thin shelf — every SKU at or under the 70-unit line — cheapest stock first, accumulating units as it goes, and the reviewer's spot-check is the second rung: the first shelf where the walk has actually picked up somebody else's units. The draft lost its accumulator, its thin-line threshold and the spot-check pins. Rebuild the walk's second rung.",
    ask: "One query: the thin-stock walk's second rung — Studio Desktop Mic with 45 units and the running total asserted at 85.",
    template:
      "WITH tail AS (SELECT name, stock,\n       {1}(stock) OVER (ORDER BY stock, id) AS running\nFROM products WHERE stock <= {2})\nSELECT name, stock, running FROM tail WHERE name = {3} AND running = {4};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the walk's accumulator",
        why: "The restock walk accumulates units: SUM(stock) OVER (ORDER BY stock, id) — probed second rung reads 40 + 45 = 85. AVG would paint the running mean 42.5, COUNT would paint a running tally of 2 SKUs, MIN would freeze at the shallowest shelf's 40 — none of those is a units-to-buy figure." },
      { answer: "70", kind: "keyword", label: "the thin-line threshold",
        why: "The thin shelf is stock 70 and below — probed walk: 40, 45, 60, 70 accumulating to 215. Threshold 39 cuts below the shallowest shelf and the walk opens on nothing; the pinned rung empties." },
      { answer: "'Studio Desktop Mic'", kind: "keyword", label: "the pinned rung's SKU",
        why: "The mic is the walk's second shelf at 45 units — probed rung: 85 accumulated, the watch's 40 plus the mic's own 45. The opening rung reads 40 under the Smart Watch's name; pinned against the mic's name it contradicts the walk." },
      { answer: "85", kind: "number", label: "the pinned rung",
        why: "Probed: the walk's second rung is 85 — the Smart Watch's 40 plus the mic's own 45. 40 is the opening rung (the Smart Watch alone); pinned against the mic's name it contradicts the walk." },
    ],
    distractors: ["AVG", "COUNT", "39", "35", "40"],
    walkthrough:
      "The WHERE stock <= 70 slice is the sheet's definition — four SKUs make the thin shelf, at 40, 45, 60 and 70 units. Then the walk: SUM(stock) OVER (ORDER BY stock, id) accumulates cheapest-shelf-first, so rung one carries only the Smart Watch's 40 and rung two — the Studio Desktop Mic at 45 — reads 85. The accumulator is the sheet's whole meaning: AVG would turn the buy-list into a running average (42.5 at the mic's rung), COUNT into a SKU tally, MIN into a frozen floor — each a plausible-looking column that says nothing about units to buy, and the 85 assert empties every one of them. Threshold 39 is the sneaky one — it looks like a stricter thin line, but it cuts below the shallowest shelf entirely, and a restock sheet that opens on nothing is worse than one that opens on the wrong row.",
  },
  {
    id: "cs-1486",
    tier: "easy",
    topic: "w8",
    universe: "catalog",
    title: "The label ruler's two ends",
    brief:
      "From: Catalog editor. Re: the label-template brief.\n\nThe label templates are sized off the catalog's two extremes: the shortest product name sets the small label, the longest sets the wide one, and the row carries the 16-SKU shelf painted on it so the print run reconciles against the catalog. The draft lost both measuring folds. Rebuild the ruler row.",
    ask: "One query: the catalog's label ruler — shortest name 13, longest name 23, with the 16-SKU shelf painted on the row.",
    template:
      "SELECT * FROM (SELECT {1}(LENGTH(name)) AS shortest,\n       {2}(LENGTH(name)) AS longest, COUNT(*) OVER () AS shelf\nFROM products)\nWHERE shortest = {3} AND longest = {4};",
    slots: [
      { answer: "MIN", kind: "keyword", label: "the small-label fold",
        why: "MIN(LENGTH(name)) finds the shortest label on the shelf — probed 13 characters ('4K Webcam Pro' and 'Smart Watch S' tie there). SUM or COUNT measure something else entirely: SUM returns 273 total characters, COUNT returns 16 names, and neither is a label length." },
      { answer: "MAX", kind: "keyword", label: "the wide-label fold",
        why: "MAX(LENGTH(name)) finds the longest label — probed 23, the Noise-Canceling Headset. MIN in this seat collapses both ends to 13 and the wide-label assert on 23 empties the row." },
      { answer: "13", kind: "number", label: "the short end",
        why: "Probed: the shortest name on the shelf is 13 characters. 22 is the near-miss — the Mechanical Keyboard and Bluetooth Speaker pair — and pinned as the short end it contradicts the 13 the fold actually returns." },
      { answer: "23", kind: "number", label: "the long end",
        why: "Probed: the longest name is 23 characters — the Noise-Canceling Headset, one clear of the 22 pair. 16 is the shelf count the window paints, not a name length; pinned as the long end the row empties." },
    ],
    distractors: ["SUM", "COUNT", "22", "16"],
    walkthrough:
      "One row, three measures. The two folds do the ruler's work: MIN(LENGTH(name)) sweeps the 16 names and returns 13, MAX returns 23 — the template brief's two extremes, a 10-character spread. The window paints the context: COUNT(*) OVER () stamps 16 on the row so the print run can reconcile its template count against the full shelf. Both folds run over the whole table in a single implicit group, which is why they can share a row with a window at all — the probed single-row pattern. The near-miss traps are all one step off: 22 is the pair just under the crown, 16 is the painted shelf, and swapping MIN/MAX collapses the ruler to one end. A label template built on the wrong end either clips the headset's name or ships forty percent too much paper for the webcam's.",
  },
  {
    id: "cs-1487",
    tier: "medium",
    topic: "w8",
    universe: "funnel",
    title: "The revenue wall's home row",
    brief:
      "From: GM. Re: the regional revenue wall.\n\nThe wall hangs one plaque per region — ticket count, revenue, share of the book, and the region's rank — and the home market's plaque is the sample for the offsite. The draft lost its rank direction and three plaque figures. Rebuild the US plaque row.",
    ask: "One query: the US plaque — 19 tickets, revenue 7286.16, share 20.9, rank 3 on the revenue wall.",
    template:
      "WITH f AS (SELECT c.region AS region, COUNT(*) AS n,\n       ROUND(SUM(o.total), 2) AS rev FROM orders o\nJOIN customers c ON c.id = o.customer_id GROUP BY c.region),\nx AS (SELECT region, n, rev,\n       ROUND(100.0 * rev / SUM(rev) OVER (), 1) AS pct,\n       RANK() OVER (ORDER BY rev {1}) AS rk FROM f)\nSELECT region, n, rev, pct, rk FROM x\nWHERE region = {2} AND rev = {3} AND pct = {4} AND rk = {5};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the rank direction",
        why: "The wall ranks biggest-revenue-first — probed order EU 15089.23, APAC 11605.45, US 7286.16, LATAM 852.44 — so the US hangs at rank 3. ASC flips the ladder and hands the US rank 2, a plaque that overstates the home market by one position." },
      { answer: "'US'", kind: "keyword", label: "the home plaque",
        why: "The US is the home market: probed 19 tickets and 7286.16 revenue, third on the wall behind EU and APAC. Pin 'APAC' and the revenue assert breaks — APAC carries 11605.45, not the pinned figure." },
      { answer: "7286.16", kind: "number", label: "the plaque revenue",
        why: "Probed: US revenue is 7286.16 across 19 tickets. 11605.45 is APAC's figure — pinned against the US key the plaque contradicts itself and empties." },
      { answer: "20.9", kind: "number", label: "the plaque share",
        why: "Probed: 100.0 * 7286.16 / the 34833.28 book paints the US at 20.9 percent. 33.3 is APAC's share — pinned here it describes the wrong wedge and the row empties." },
      { answer: "3", kind: "number", label: "the asserted rank",
        why: "Probed: the US hangs third on the DESC wall. 2 is exactly what ASC awards it — the rank cell is the audit that catches a flipped direction, since share and revenue barely move when the ladder turns." },
    ],
    distractors: ["ASC", "'APAC'", "11605.45", "2"],
    walkthrough:
      "Fold then measure, twice. The fold: 103 orders join to customers and GROUP BY region collapses them to four plaques — EU 45/15089.23, APAC 37/11605.45, US 19/7286.16, LATAM 2/852.44. Then two windows paint the rest of each plaque: SUM(rev) OVER () divides each region's revenue into the 34833.28 book for the share (US 20.9), and RANK() OVER (ORDER BY rev DESC) hangs them in order — EU 1, APAC 2, US 3, LATAM 4. The five-way assert is the point: share and revenue stay honest under either direction, so the rank cell is the only place a flipped ASC visibly lies — and it lies by exactly one position, the difference between third on the wall and second. Pin all five cells and the plaque cannot hang sideways.",
  },
  {
    id: "cs-1488",
    tier: "medium",
    topic: "w8",
    universe: "growth",
    title: "The intake staircase's spring step",
    brief:
      "From: Growth lead. Re: the activation staircase.\n\nThe deck's acquisition page builds a staircase from first orders: one step per intake month, each carrying that month's new buyers and the cumulative head-count behind it, and the spring step is the callout. The draft lost its slicer, its step key and both figures. Rebuild the 2024-03 step.",
    ask: "One query: the 2024-03 intake step with 3 new buyers and the staircase asserted at 10.",
    template:
      "WITH f AS (SELECT customer_id, MIN(created_at) AS first_order\nFROM orders GROUP BY customer_id),\nc AS (SELECT strftime({1}, first_order) AS cohort, COUNT(*) AS n FROM f GROUP BY cohort),\ns AS (SELECT cohort, n, SUM(n) OVER (ORDER BY cohort) AS cum FROM c)\nSELECT cohort, n, cum FROM s WHERE cohort = {2} AND n = {3} AND cum = {4};",
    slots: [
      { answer: "'%Y-%m'", kind: "keyword", label: "the intake slicer",
        why: "strftime('%Y-%m', first_order) buckets each buyer's first order into month steps — probed ladder 5, 2, 3, 3 for the 2024 spring. '%Y' merges every 2024 buyer into one giant step and the 2024-03 key matches nothing." },
      { answer: "'2024-03'", kind: "keyword", label: "the spring step",
        why: "March 2024 is the callout — probed step: 3 new buyers, staircase at 10. '2024-04' is the next step up: also 3 buyers but the staircase already reads 13, so the cum assert breaks." },
      { answer: "3", kind: "number", label: "the step's new buyers",
        why: "Probed: three buyers placed their first order in 2024-03. 5 is January's step — the biggest intake — and pinned against the March key it describes the wrong stair." },
      { answer: "10", kind: "number", label: "the staircase at the step",
        why: "Probed: SUM(n) OVER (ORDER BY cohort) reads 5 → 7 → 10 → 13, so March lands at 10. 13 is April's rung — one step too high; pinned together with the March key the row empties." },
    ],
    distractors: ["'%Y'", "'2024-04'", "5", "13"],
    walkthrough:
      "Two folds and a walk. First the derivation: GROUP BY customer_id with MIN(created_at) gives each of the 16 buyers their first-order date — the intake event. Second fold: strftime('%Y-%m', …) buckets those dates and GROUP BY cohort counts them — 5 buyers in 2024-01, then 2, 3, 3 through the spring, stragglers in August and November, one more in 2025-01. Then the staircase: SUM(n) OVER (ORDER BY cohort) accumulates the steps in calendar order, 5 → 7 → 10 → 13 → … → 16, so March's step carries 3 of its own and 10 behind it. The slicer is the quiet hero: '%Y' would flatten the whole spring into a single 13-buyer step and the staircase would lose four of its seven stairs. The March callout asserts both truths — its own 3 and the 10 behind it — because a growth page that prints the step without the staircase answers neither question.",
  },
  {
    id: "cs-1489",
    tier: "medium",
    topic: "w8",
    universe: "expense",
    title: "The burn sheet's August leap",
    brief:
      "From: Ops finance. Re: the month-over-month burn line.\n\nThe burn line walks the expense calendar month by month, and each row carries the leap from the month before — LAG pulled back onto the same row — so reviewers see the jumps without a second query. August's leap is the flag. The draft lost its slicer and all three pinned figures. Rebuild the August flag row.",
    ask: "One query: the 2024-08 burn row — spend 3210 with the month-over-month leap asserted at 1416.",
    template:
      "WITH e AS (SELECT strftime({1}, spent_on) AS mon,\n       SUM(amount_cents) / 100.0 AS spent FROM expenses GROUP BY mon),\nd AS (SELECT mon, ROUND(spent, 2) AS spend,\n       ROUND(spent - LAG(spent) OVER (ORDER BY mon), 2) AS delta FROM e)\nSELECT mon, spend, delta FROM d WHERE mon = {2} AND spend = {3} AND delta = {4};",
    slots: [
      { answer: "'%Y-%m'", kind: "keyword", label: "the burn slicer",
        why: "strftime('%Y-%m', spent_on) buckets the 36 expense receipts into the 14 calendar months the line walks — probed. '%Y-%d' slices by day-of-month, every bucket label misses the '2024-08' key, and the flag row never lands." },
      { answer: "'2024-08'", kind: "keyword", label: "the flagged month",
        why: "August 2024 is the spike — probed spend 3210, leap 1416, the calendar's biggest jump. '2024-09' is the month after: spend 1545 and a negative 1665 swing, the crash that proves August was real." },
      { answer: "3210", kind: "number", label: "the month's burn",
        why: "Probed: August 2024 burned 3210 — nearly double the 1794 of July. 1545 is September's figure; pinned as August's own burn it describes the recovery, not the spike." },
      { answer: "1416", kind: "number", label: "the asserted leap",
        why: "Probed: LAG over the month walk hands August the July figure 1794, and 3210 − 1794 = 1416 — the sheet's flag. −1665 is September's leap; the double assert (spend AND delta) pins the spike and not its hangover." },
    ],
    distractors: ["'%Y-%d'", "'2024-09'", "1545", "-1665"],
    walkthrough:
      "Slice, fold, then look backwards. The slice and fold turn 36 receipts into 14 monthly burns — 1794 in July, 3210 in August, 1545 in September. Then LAG(spent) OVER (ORDER BY mon) walks the line and hands each month its predecessor's figure, so the delta column is arithmetic on one row: August prints 3210 − 1794 = 1416, the calendar's biggest leap, and September prints 1545 − 3210 = −1665, the crash back to earth. The triple assert exists because a spike row needs all three truths: which month, how much, and how big the jump was. Slice by day instead of month and the walk explodes into daily buckets whose labels can never match the monthly key — a silent empty result that looks like a clean month. Pin September's numbers and you have flagged the recovery as the crime.",
  },
  {
    id: "cs-1490",
    tier: "medium",
    topic: "w8",
    universe: "fraud",
    title: "The fraud sweep's head jump",
    brief:
      "From: Risk desk. Re: the ticket-to-ticket sweep.\n\nThe sweep walks orders in ticket order and measures each order's jump from the one before it — anything over the 500-dollar tripwire lands on the watchlist — and the desk pins the watchlist's head case. The draft lost its walk key, its direction and the case pins. Rebuild the head case.",
    ask: "One query: the watchlist's rank-1 case — order 39 with total 845.92 and the 770.45 jump asserted.",
    template:
      "WITH w AS (SELECT id, total,\n       total - LAG(total) OVER (ORDER BY {1}) AS jump FROM orders),\nk AS (SELECT id, ROUND(total, 2) AS total, ROUND(jump, 2) AS jump,\n       RANK() OVER (ORDER BY jump {2}) AS rk FROM w WHERE jump > {3})\nSELECT id, total, jump, rk FROM k WHERE rk = {4} AND jump = {5} AND id = {6};",
    slots: [
      { answer: "id", kind: "keyword", label: "the walk key",
        why: "The sweep walks ticket order — ORDER BY id — so each jump is one order against its book-neighbour, probed: order 39 leaps 770.45 over order 38's 75.47. Walk by created_at and the neighbours reshuffle; the same order's leap reads differently and the 770.45 assert breaks." },
      { answer: "DESC", kind: "keyword", label: "the watch direction",
        why: "The head case is the biggest jump, so RANK sorts jump DESC — probed ladder 770.45, 712.51, 685.9. ASC crowns the biggest negative swing instead, a step down the desk has no interest in." },
      { answer: "500", kind: "keyword", label: "the tripwire",
        why: "Probed: jumps over 500 put exactly 7 cases on the watchlist. The tripwire is a filter constant, not a result figure — it shapes the list without appearing on it, and 852.44 (a jump nobody made) shows how a higher wire empties the sweep entirely." },
      { answer: "1", kind: "number", label: "the head rank",
        why: "Probed: order 39's 770.45 leap is the watchlist's rank 1. 2 belongs to order 74's 712.51 — pinned together with the 770.45 jump the two asserts contradict and the row empties." },
      { answer: "770.45", kind: "number", label: "the head jump",
        why: "Probed: 845.92 − 75.47 = 770.45, the sweep's biggest leap. 712.51 is the rank-2 jump (order 74) — the double assert on jump AND rank is what keeps the head case from being swapped for the runner-up." },
      { answer: "39", kind: "number", label: "the case id",
        why: "Probed: order 39 is the head case, 845.92 total. 74 is the runner-up's id — pinned against the 770.45 jump it fails, since order 74's leap is 712.51." },
    ],
    distractors: ["created_at", "status", "customer_id", "shipped_at"],
    walkthrough:
      "Stage, cut, rank, pin. Stage one walks the book in ticket order — ORDER BY id — and LAG(total) hands every order its neighbour's figure, so jump = total − prev is one subtraction per row. Stage two applies the desk's tripwire (jump > 500, probed: 7 survivors) and ranks what's left DESC: 770.45, 712.51, 685.9, 577.72, 566.86, 537.06, 534.3. The pins land on the head: rank 1, jump 770.45, id 39 — three cells that must all agree on the same order. Walk by created_at instead of id and the neighbour map changes under every row; the 770.45 figure was built by ticket adjacency, not chronology, and the assert catches it. Raise the wire to 852.44 and the list empties — probed zero cases — which is why the tripwire sits at the desk's 500 line. The triple pin matters because the runner-up (74, 712.51) is one assert away from stealing the cover of the file.",
  },
  {
    id: "cs-1491",
    tier: "medium",
    topic: "w8",
    universe: "month-close",
    title: "The flat rung on the close walk",
    brief:
      "From: Controller. Re: the close-day walk.\n\nThe close binder walks every ledger entry in date-then-id order and carries the running balance on each rung; the final day lands four rungs on 2025-02-28, and the binder's spot-check is the flat rung — where the walk reads zero mid-day. The draft lost its walk key and both pins. Rebuild the flat rung.",
    ask: "One query: the close-day walk's rung at entry 78 — balance asserted at 0 — with the walk keyed date-then-id.",
    template:
      "WITH r AS (SELECT entry_date, id,\n       ROUND({1}(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) / 100.0, 2) AS bal\nFROM ledger_entries)\nSELECT id, entry_date, bal FROM r WHERE id = {2} AND bal = {3};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the walk's accumulator",
        why: "A running balance accumulates net entries: SUM(debit_cents − credit_cents) OVER (ORDER BY entry_date, id) — probed tail: rung 77 reads 8112, rung 78 flattens to 0, rung 79 to 7076, rung 80 closes at 0. MAX would paint the biggest single swing seen so far (the probed MAX walk reads 11085 at rung 80), AVG a running mean, COUNT a tally of entries — none is a balance." },
      { answer: "78", kind: "number", label: "the flat rung's id",
        why: "Probed: entry 78 is the close-day rung where the walk flattens to 0 — one entry after 77's 8112. 79 is the next rung up at 7076; pinned together with the zero assert it contradicts the walk." },
      { answer: "0", kind: "number", label: "the flat balance",
        why: "Probed: the running balance at rung 78 reads 0.00 — entry 78 exactly cancels the climb to that point. 7076 is rung 79's figure; pinned as the flat rung's balance it describes the wrong entry." },
    ],
    distractors: ["MAX", "MIN", "COUNT", "79"],
    walkthrough:
      "The walk is the audit. SUM(debit_cents − credit_cents) OVER (ORDER BY entry_date, id) replays the ledger in booking order — date first, then id within the day — so every rung shows the books exactly as they stood after that entry. The final day stacks four rungs on 2025-02-28: 77 climbs to 8112, 78 flattens to 0, 79 climbs again to 7076, and 80 closes the books at 0.00, the balance the whole ledger reconciles to. The spot-check pins rung 78 precisely because a mid-day flat is the interesting one: the walk touched zero before the last entries posted. The accumulator is what makes the column a balance at all — MAX over the same walk paints the largest single swing to date (probed 11085 by rung 80), COUNT paints a receipt tally, AVG a running mean; each would fill the bal column with a plausible-looking number that is not the books, and the zero assert empties every one of them on the flat rung.",
  },
  {
    id: "cs-1492",
    tier: "hard",
    topic: "w8",
    universe: "supplier",
    title: "The four-way crown on the count board",
    brief:
      "From: Procurement. Re: the catalog-share board.\n\nThe board counts each supplier's SKUs and ranks the league — and this quarter's crown is a four-way tie the tieboard must name honestly: rank 1, held by four partners at once. Shenzhen Electro is the pinned sample. The draft lost its direction and the sample's pins. Rebuild Shenzhen's row.",
    ask: "One query: Shenzhen Electro's row on the SKU-count league — 3 SKUs at rank 1, shared four ways.",
    template:
      "SELECT * FROM (SELECT s.name AS name, COUNT(*) AS n,\n       RANK() OVER (ORDER BY COUNT(*) {1}) AS rk\nFROM products p JOIN suppliers s ON s.id = p.supplier_id\nGROUP BY s.id)\nWHERE name = {2} AND n = {3} AND rk = {4};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the league direction",
        why: "Deepest catalog first: ORDER BY COUNT(*) DESC — probed league: Midwest, Nordic, Pacific and Shenzhen all hold 3 SKUs at rank 1, Alpine and Andes 2 at rank 5. ASC drops the four-way crown to the tail and hands Shenzhen rank 3, a board that leads with the thinnest catalogs." },
      { answer: "'Shenzhen Electro'", kind: "keyword", label: "the pinned partner",
        why: "Shenzhen is the sample crown-holder — probed 3 SKUs, rank 1 shared. Pin 'Alpine Audio GmbH' and the count assert breaks: Alpine carries 2 SKUs, rank 5, a different row of the board entirely." },
      { answer: "3", kind: "number", label: "the SKU count",
        why: "Probed: Shenzhen stocks 3 SKUs, tied with Midwest, Nordic and Pacific at the top. 2 is the Alpine/Andes count — pinned against Shenzhen's name it contradicts the fold." },
      { answer: "1", kind: "number", label: "the shared rank",
        why: "Probed: RANK() gives all four 3-SKU partners rank 1 and pushes the 2-SKU pair to rank 5 — the gap is the tie's fingerprint. 5 is the pair's rank; pinned here it claims Shenzhen sits in the tail." },
    ],
    distractors: ["ASC", "'Alpine Audio GmbH'", "2", "5"],
    walkthrough:
      "Stage the league, then pin honestly. The fold: 16 products join to suppliers and GROUP BY s.id counts each partner's catalog — six rows, counts 3/3/3/3/2/2. The window: RANK() OVER (ORDER BY COUNT(*) DESC) ranks the fold, and because four partners tie at 3, all four take rank 1 while the tie pushes the 2-SKU pair clean to rank 5 — RANK's gap-keeping is the honest part, since no partner holds rank 2, 3 or 4 at all. The staged CTE matters: the rank must be computed over the whole six-row fold before the outer query pins Shenzhen, or the pin would filter first and the rank would read a one-row league. Pin ASC and the board still runs — it just crowns the two-SKU partners' league, where Shenzhen sits third. The board's honesty lives in the rk cell: 1, shared four ways, with 5 next — not a tidy 1-through-6 that would mean the ties were broken behind the partner's back.",
  },
  {
    id: "cs-1493",
    tier: "hard",
    topic: "w8",
    universe: "refund-audit",
    title: "The exposure ladder's summit row",
    brief:
      "From: AR lead. Re: the dunning summit.\n\nThe dunning packet ranks customers by exposed money — pending plus cancelled orders — and the summit row leads the packet; each row also carries the size of the exposure pool painted on it so the packet reconciles against the 7265.49 at risk. The draft lost its direction, its paint and the summit pins. Rebuild the summit row.",
    ask: "One query: Emma Wilson's summit row on the exposure ladder — 1615.29 exposed, rank 1, with the 8-customer pool painted on.",
    template:
      "WITH e AS (SELECT c.name AS name, ROUND(SUM(o.total), 2) AS exposure\nFROM orders o JOIN customers c ON c.id = o.customer_id\nWHERE o.status IN ('pending', 'cancelled') GROUP BY c.id),\np AS (SELECT name, exposure, RANK() OVER (ORDER BY exposure {1}) AS rk,\n       COUNT(*) OVER () AS pool FROM e)\nSELECT name, exposure, rk, pool FROM p\nWHERE name = {2} AND exposure = {3} AND rk = {4} AND pool = {5};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the ladder direction",
        why: "Biggest exposure first — probed ladder: Emma 1615.29, Chloe 1309.92, Alice 1283.65, Farid 1088.44 at the top. ASC walks the ladder from the bottom and hands Emma rank 8, a dunning packet that starts with the smallest risk." },
      { answer: "'Emma Wilson'", kind: "keyword", label: "the summit customer",
        why: "Emma leads the exposure ladder — probed 1615.29 across her pending and cancelled tickets. Pin 'Farid Nasser' and the exposure assert breaks: Farid carries 1088.44, rank 4, the packet's fourth row." },
      { answer: "1615.29", kind: "number", label: "the summit exposure",
        why: "Probed: Emma's pending-plus-cancelled total is 1615.29, the pool's biggest slice. 1088.44 is Farid's exposure — pinned as the summit figure it describes rank 4." },
      { answer: "1", kind: "number", label: "the summit rank",
        why: "Probed: Emma hangs at rank 1 on the DESC ladder. 8 is what ASC awards her — the rank cell is the audit that catches a flipped direction on a ladder where the money figures stay put." },
      { answer: "8", kind: "number", label: "the painted pool",
        why: "Probed: exactly 8 customers carry pending or cancelled money, and COUNT(*) OVER () paints that 8 on every ladder row — the packet's reach figure. 16 is the store's full roster; the dunning packet covers half of it." },
    ],
    distractors: ["ASC", "'Farid Nasser'", "1088.44", "16"],
    walkthrough:
      "Fold the exposure, then hang the ladder. The fold: pending and cancelled orders — the 21-ticket, 7265.49 pile — group to eight customers, Emma 1615.29 at the top, then Chloe 1309.92, Alice 1283.65, Farid 1088.44, down to Grace's 273.64. Two windows dress the ladder: RANK() OVER (ORDER BY exposure DESC) hangs the rungs, and COUNT(*) OVER () paints the pool's head-count — 8 customers — on every row, the packet's reach. The four-way pin is the summit's audit: name, money, rank and pool must all agree, and the rank cell is the only one that moves when the direction flips — Emma's 1615.29 reads the same on an ASC ladder, but her rung quietly becomes 8 of 8. That's the trap the packet is built to catch: a dunning list sorted from the bottom looks identical column-by-column except for the one cell that says who gets called first.",
  },
  {
    id: "cs-1494",
    tier: "hard",
    topic: "w8",
    universe: "funnel",
    title: "The calendar's four-tile split",
    brief:
      "From: Marketing ops. Re: the campaign calendar tiles.\n\nThe calendar deals its 14 revenue months into four chronological tiles — three months, three months, and the quarters that follow — and each tile reports its combined spend so media buys can be paced. Tile 1 is the pacing anchor. The draft lost its tile count, its dealing direction and both anchor figures. Rebuild tile 1's report row.",
    ask: "One query: calendar tile 1 — 4 months dealt in chronologically, combined spend 12427.60.",
    template:
      "WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon,\n       SUM(total) AS rev FROM orders GROUP BY mon),\nt AS (SELECT mon, rev, NTILE({1}) OVER (ORDER BY mon {2}) AS band FROM m),\nx AS (SELECT band, COUNT(*) AS n, ROUND(SUM(rev), 2) AS band_spend FROM t GROUP BY band)\nSELECT band, n, band_spend FROM x WHERE band = {3} AND band_spend = {4};",
    slots: [
      { answer: "4", kind: "keyword", label: "the tile count",
        why: "The calendar deals into four tiles — NTILE(4) over the 14 month buckets, probed deal 4/4/3/3. NTILE(3) deals 5/5/4 instead: tile 1 becomes five months with a different combined spend and the anchor assert breaks. NTILE(5) deals 3/3/3/3/2 — five tiles where the calendar has four." },
      { answer: "ASC", kind: "keyword", label: "the dealing direction",
        why: "Tiles are chronological — ORDER BY mon ASC deals 2024-01 onward into tile 1, probed anchor 12427.60. DESC deals from 2025-02 backwards and tile 1 becomes the freshest months at 7810.30 — a pacing plan anchored on the wrong end of the year." },
      { answer: "1", kind: "number", label: "the anchor tile",
        why: "Probed: tile 1 is the pacing anchor — four months, 12427.60. Tile 3's combined spend is 7740.51; pinned against band 1's key it describes the wrong third of the calendar." },
      { answer: "12427.6", kind: "number", label: "the anchor's combined spend",
        why: "Probed: the first four months carry 12427.60, the heaviest tile on the calendar. 8503.67 is tile 2's figure — the double assert (band AND spend) keeps the anchor row from being swapped for its neighbour." },
    ],
    distractors: ["3", "DESC", "8503.67", "5"],
    walkthrough:
      "Fold the calendar, deal it, sum the tiles. The fold: strftime buckets 103 orders into 14 monthly revenues. The deal: NTILE(4) OVER (ORDER BY mon ASC) walks the buckets chronologically and deals them 4/4/3/3 — the remainder months go to the front tiles, so tile 1 is exactly 2024-01 through 2024-04. The tile fold: GROUP BY band sums each tile's months — probed 12427.60, 8503.67, 7740.51, 6161.50 — and tile 1 is both the heaviest and the anchor. Direction is the whole business decision: DESC deals the newest months into tile 1 (7810.30, probed), which paces the media buy against the wrong end of the calendar. And the tile count is load-bearing — NTILE(3) deals 5/5/4, so tile 1 silently absorbs May, and the anchor's combined spend moves with it. The double assert pins the anchor's identity and its weight at once.",
  },
  {
    id: "cs-1495",
    tier: "medium",
    topic: "w8",
    universe: "pricing",
    title: "The open-ticket pool's sharpest slice",
    brief:
      "From: Pricing analyst. Re: the open-ticket share board.\n\nThe share board prints every open ticket's slice of the pending pool — each order's total against the pool painted by the window — and the board's crown is the sharpest slice, quoted to the penny. The draft lost its rounding width, its pool key and its sort. Rebuild the crown row.",
    ask: "One query: the pending pool's sharpest slice — order 74 at 17.81 percent, quoted to two decimals.",
    template:
      "SELECT id, ROUND(100.0 * total / SUM(total) OVER (), {1}) AS share\nFROM orders WHERE status = {2}\nORDER BY share {3} LIMIT {4};",
    slots: [
      { answer: "2", kind: "keyword", label: "the quote width",
        why: "The board quotes to the penny: ROUND(…, 2) — probed crown 17.81. One decimal rounds it to 17.8 and the cover figure no longer reconciles to the board's own two-decimal audit trail." },
      { answer: "'pending'", kind: "keyword", label: "the pool key",
        why: "The open pool is pending money — probed 14 tickets totalling 6113, so shares divide by 6113. 'cancelled' swaps in the 1152.49 pile: the top slice recomputes against a different denominator and no 17.81 exists there." },
      { answer: "DESC", kind: "keyword", label: "the crown direction",
        why: "The board crowns the sharpest slice, so shares sort DESC — probed: order 74's 1088.44 ticket tops the pool at 17.81 percent. ASC hands the crown to the smallest slice, the opposite of the board's headline." },
      { answer: "1", kind: "keyword", label: "the board cap",
        why: "One crown per board: LIMIT 1 keeps the head row — probed 74 / 17.81. LIMIT 3 prints three contenders and the pricing memo quotes a podium where it promised a winner." },
    ],
    distractors: ["1", "'cancelled'", "ASC", "3"],
    walkthrough:
      "Paint the pool, then measure each ticket against it. WHERE status = 'pending' cuts the book to the 14 open tickets worth 6113.00, and SUM(total) OVER () paints that pot onto every row — each ticket's share is 100.0 * total / the painted pot, all in one pass, no self-join. Order 74 carries the pool's biggest ticket (1088.44) and the board's crown: 17.81 percent at two decimals, probed. The rounding width is the audit trail: 17.8 at one decimal is the same slice quoted less precisely, and a pricing memo that quotes one width while its board stores another fails reconciliation on paper, not in the engine. Flip the direction and the crown goes to the slimmest slice — same engine, opposite headline — and widening the cap to 3 turns a winner into a podium. The penny-precise pin is what makes the memo checkable.",
  },
  {
    id: "cs-1496",
    tier: "hard",
    topic: "w8",
    universe: "inventory",
    title: "The waiting pile's roll call",
    brief:
      "From: Fulfillment lead. Re: the status roll call.\n\nThe morning roll call folds the order book by status and, for each block, counts how many tickets are still waiting on a ship date — with the whole 103-order fleet painted on every line so the sheet reconciles against the book. The pending block is the headline. The draft lost its waiting test and both pins. Rebuild the pending roll-call row.",
    ask: "One query: the pending roll-call row — 14 tickets, all 14 waiting, with the 103-order fleet painted on.",
    template:
      "WITH c AS (SELECT status, COUNT(*) AS n,\n       SUM(shipped_at IS {1}) AS waiting,\n       SUM(COUNT(*)) OVER () AS fleet FROM orders GROUP BY status)\nSELECT status, n, waiting, fleet FROM c\nWHERE status = {2} AND waiting = {3} AND fleet = {4};",
    slots: [
      { answer: "NULL", kind: "keyword", label: "the waiting test",
        why: "A ticket waits when it has no ship date: shipped_at IS NULL, summed per status — probed pending block: 14 of 14 waiting. NOT NULL counts the opposite — the shipped ones — and the pending row would claim zero waiting tickets on a block where every ticket waits." },
      { answer: "'pending'", kind: "keyword", label: "the headline block",
        why: "Pending is the roll call's headline — probed 14 tickets, every one waiting. Pin 'shipped' and the waiting assert breaks: the shipped block's 52 tickets have ship dates, so its waiting count reads 0." },
      { answer: "14", kind: "number", label: "the waiting count",
        why: "Probed: all 14 pending tickets lack a ship date, so the block's waiting count is 14 — the whole block, stuck. 52 is the shipped block's count; pinned here it describes the fleet's healthy majority." },
      { answer: "103", kind: "number", label: "the painted fleet",
        why: "Probed: SUM(COUNT(*)) OVER () paints 103 — the whole order book — on every roll-call line, so each block reconciles against the fleet. 52 is one block's slice of the fold, not the fleet." },
    ],
    distractors: ["NOT NULL", "'shipped'", "52", "0"],
    walkthrough:
      "Fold the book, paint the fleet, count the waiters. GROUP BY status folds 103 orders into four blocks — pending 14, shipped 52, delivered 30, cancelled 7. Inside the fold, SUM(shipped_at IS NULL) counts each block's waiters: pending's 14 tickets are all waiting, shipped's and delivered's are none, cancelled's 7 were never going to ship. Then SUM(COUNT(*)) OVER () paints 103 — the entire fleet — on every line, the sheet's reconciliation figure: the four n's must rebuild it. The waiting test is the sheet's soul: IS NULL counts the stuck, NOT NULL counts the moving, and on the pending row those are 14 versus 0 — a flip that turns the headline into 'nothing to do'. The double pin (waiting AND fleet) keeps the block's own truth and the book's truth on one line, which is the whole discipline of a roll call.",
  },
  {
    id: "cs-1497",
    tier: "hard",
    topic: "w8",
    universe: "expense",
    title: "The month-over-month leap counter",
    brief:
      "From: Finance ops. Re: the burn volatility check.\n\nThe volatility check rebuilds the monthly burn line, measures every month's leap against its predecessor, and counts how many months leapt past the 200-dollar materiality line. The count is the check's whole output. The draft lost its walk order, its materiality figure and its count pin. Rebuild the check.",
    ask: "One query: the count of months whose burn leapt by more than 200 dollars — asserted at 5.",
    template:
      "WITH e AS (SELECT strftime('%Y-%m', spent_on) AS mon,\n       SUM(amount_cents) / 100.0 AS spent FROM expenses GROUP BY mon),\nd AS (SELECT mon, ROUND(spent - LAG(spent) OVER (ORDER BY {1}), 2) AS delta FROM e),\nk AS (SELECT COUNT(*) AS n FROM d WHERE delta > {2})\nSELECT n FROM k WHERE n = {3};",
    slots: [
      { answer: "mon", kind: "keyword", label: "the walk order",
        why: "The leap is month-over-month, so LAG walks ORDER BY mon — probed delta line: −279, +477, −168, … +1416, −1665. Walk by spent instead and the months reshuffle by size; the deltas measure size-neighbours, not calendar neighbours, and the count reads 1, not 5." },
      { answer: "200", kind: "keyword", label: "the materiality line",
        why: "The check's materiality is 200 dollars — probed: exactly 5 months leap past it (477, 284, 1416, 314, 349). The line is a filter constant that shapes the count without appearing in it; 300 would drop two of those months and read 4." },
      { answer: "5", kind: "number", label: "the asserted count",
        why: "Probed: five months leap by more than 200 — the volatility check's whole output. 6 is what a 100-dollar line produces (the +115 November creep joins the list), and the pin is what separates material leaps from noise." },
    ],
    distractors: ["delta", "spent", "amount_cents", "spent_on"],
    walkthrough:
      "Three stages, one number. Stage one folds 36 receipts into 14 monthly burns. Stage two walks the calendar — LAG(spent) OVER (ORDER BY mon) — and measures every month's leap: +477 into March, +284 into July, the +1416 August spike, −1665 out of it, +314 into October, +349 into January 2025, and eleven smaller moves. Stage three applies the 200-dollar materiality line and counts: five months leap past it, probed. The walk order is the check's spine — LAG over ORDER BY mon measures calendar neighbours, while ordering by spent would silently redefine a 'leap' as the gap between a big month and the month most like it in size, which counts exactly one. And the materiality line is the difference between a volatility report and a diary: at 300 the check reads 4, at 100 it reads 6, and the pinned 5 says the desk's line is drawn at 200.",
  },
  {
    id: "cs-1498",
    tier: "hard",
    topic: "w8",
    universe: "growth",
    title: "The spend quartile's second shelf",
    brief:
      "From: Board prep. Re: the spend quartile deck.\n\nThe deck deals the 16 customers into four spend quartiles and reports each tile's head-count, combined spend and share of the book; the second shelf is the deck's consistency row — big enough to matter, small enough to check by hand. The draft lost its dealing direction and the shelf's pins. Rebuild tile 2's row.",
    ask: "One query: spend tile 2 — 4 customers, combined spend 6911.67, 19.8 percent of the book.",
    template:
      "WITH s AS (SELECT c.id AS cid, SUM(o.total) AS spend\nFROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id),\nt AS (SELECT spend, NTILE(4) OVER (ORDER BY spend {1}) AS band FROM s),\nx AS (SELECT band, COUNT(*) AS n, ROUND(SUM(spend), 2) AS tile_spend,\n       ROUND(100.0 * SUM(spend) / SUM(SUM(spend)) OVER (), 1) AS pct FROM t GROUP BY band)\nSELECT band, n, tile_spend, pct FROM x\nWHERE band = {2} AND tile_spend = {3} AND pct = {4};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the dealing direction",
        why: "Quartile 1 is the biggest spenders, so the deal walks spend DESC — probed tiles 22121.70 / 6911.67 / 3404.86 / 2395.05. ASC deals from the smallest spenders and tile 2 becomes a different four customers with a different combined spend; the 6911.67 assert breaks." },
      { answer: "2", kind: "number", label: "the shelf number",
        why: "Tile 2 is the deck's consistency shelf — probed 4 customers, 6911.67, 19.8 percent. Band 3 carries 3404.86 at 9.8 percent; pinned against band 2's key the row describes the wrong shelf." },
      { answer: "6911.67", kind: "number", label: "the shelf's combined spend",
        why: "Probed: the second quartile's four customers spent 6911.67 combined. 3404.86 is tile 3's figure — the double assert (band AND spend) keeps the shelf from being swapped for its neighbour." },
      { answer: "19.8", kind: "number", label: "the shelf's share",
        why: "Probed: 100.0 * 6911.67 over the 34833.28 book paints tile 2 at 19.8 percent. 9.8 is tile 3's share — pinned here the row contradicts its own spend figure." },
    ],
    distractors: ["ASC", "3", "3404.86", "9.8"],
    walkthrough:
      "Fold the customers, deal the quartiles, report the shelf. The fold: 103 orders group to 16 customer spends. The deal: NTILE(4) OVER (ORDER BY spend DESC) walks biggest-first and deals 4/4/4/4 — tile 1 the whales (22121.70 combined, 63.5 percent of the book), tile 2 the strong middle at 6911.67. The shelf fold: GROUP BY band produces the deck's four report rows, each with head-count, combined spend and a share painted by SUM(SUM(spend)) OVER () over the dealt tiles. Tile 2 is the consistency row by design: 19.8 percent is small enough to eyeball against tile 1's 63.5 and tile 3's 9.8, and the triple assert (band, spend, share) means the row can only be about the second shelf. Deal ASC and the labels survive — band 2 still exists — but it holds a different four customers, and the deck's by-hand check fails on the first addition.",
  },
  {
    id: "cs-1499",
    tier: "hard",
    topic: "w8",
    universe: "catalog",
    title: "The category wall's one-SKU tail",
    brief:
      "From: Merch lead. Re: the category value wall.\n\nThe wall folds the catalog by category, hangs each on shelf value with its share and rank painted on, and the merch review's cautionary tile is the tail: the one-SKU category propping up the wall's bottom rank. The draft lost its direction and three tail pins. Rebuild the Fitness tile.",
    ask: "One query: the Fitness tile — 1 SKU, shelf value 32, share 2.8, rank 7 of 7 on the value wall.",
    template:
      "WITH f AS (SELECT category, COUNT(*) AS n,\n       ROUND(SUM(price), 2) AS value FROM products GROUP BY category),\nw AS (SELECT category, n, value,\n       ROUND(100.0 * value / SUM(value) OVER (), 1) AS pct,\n       RANK() OVER (ORDER BY value {1}) AS rk FROM f)\nSELECT category, n, value, pct, rk FROM w\nWHERE category = {2} AND value = {3} AND pct = {4} AND rk = {5};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the wall direction",
        why: "The wall hangs biggest-value-first — probed order Audio 328.98, Wearables 278.99, …, Fitness 32 at rank 7. ASC flips the wall and crowns the one-SKU tail at rank 1, a cautionary tile promoted to the headline." },
      { answer: "'Fitness'", kind: "keyword", label: "the tail category",
        why: "Fitness is the wall's tail — probed one SKU (the Yoga Mat) worth 32. Pin 'Accessories' and the value assert breaks: Accessories carries 3 SKUs and 82.48, three rungs up the wall." },
      { answer: "32", kind: "number", label: "the tail's shelf value",
        why: "Probed: Fitness's single SKU prices at 32, the wall's smallest fold. 82.48 is Accessories' value — pinned against the Fitness key the tile contradicts its own category." },
      { answer: "2.8", kind: "number", label: "the tail's share",
        why: "Probed: 100.0 * 32 over the 1148.43 catalog paints Fitness at 2.8 percent. 7.2 is Accessories' share — the double assert (value AND pct) keeps the tail from borrowing a bigger tile's numbers." },
      { answer: "7", kind: "number", label: "the bottom rank",
        why: "Probed: Fitness hangs at rank 7 of 7 on the DESC wall. 1 is exactly what ASC awards it — the rank cell is the audit that catches a flipped wall, since a share that small is the tell, not the proof." },
    ],
    distractors: ["ASC", "'Accessories'", "82.48", "1"],
    walkthrough:
      "Fold the catalog, hang the wall, audit the tail. The fold: 16 SKUs group to seven categories — Audio 328.98 on three SKUs, Wearables 278.99 on two, down to Fitness's single Yoga Mat at 32. Two windows dress the wall: SUM(value) OVER () paints each category's share of the 1148.43 catalog (Fitness 2.8), and RANK() OVER (ORDER BY value DESC) hangs them — Fitness seventh of seven. The four-way pin is the tail's audit, and the rank cell is the one that bites: value, count and share read identically on a flipped wall, but ASC silently crowns the cautionary tile rank 1 — the merch review would open on its weakest shelf. The tail is the point of the tile: one SKU, 2.8 percent, no depth — the wall's honest bottom, pinned so nobody mistakes it for a growth category.",
  },
  {
    id: "cs-1500",
    tier: "hard",
    topic: "w8",
    universe: "supplier",
    title: "The two-board sweep's lone tenant",
    brief:
      "From: Procurement. Re: the dual-board sweep.\n\nThe quarter's supplier review hangs two boards — shelf value and stocked units — and the sweep looks for a partner holding rank 1 on both at once. Nordic's row is the claimed sweep; the units board must be walked cheapest-stock-first for the claim to hold. The draft lost its units direction and the claim pins. Rebuild Nordic's sweep row.",
    ask: "One query: Nordic Gadgets AB's row — value 418.98 with rank 1 on value and rank 1 on the ascending units board.",
    template:
      "WITH v AS (SELECT s.name AS name, ROUND(SUM(p.price), 2) AS value,\n       SUM(p.stock) AS units FROM products p\nJOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id),\nr AS (SELECT name, value, units, RANK() OVER (ORDER BY value DESC) AS vrk,\n       RANK() OVER (ORDER BY units {1}) AS srk FROM v)\nSELECT name, value, units, vrk, srk FROM r\nWHERE name = {2} AND value = {3} AND srk = {4};",
    slots: [
      { answer: "ASC", kind: "keyword", label: "the units direction",
        why: "The claim is leanest-stock-first: ORDER BY units ASC — probed: Nordic's 230 units are the fleet's smallest load, so srk reads 1. DESC flips the board and hands Nordic rank 6, the heaviest load — the sweep's claim dies on the direction chip alone." },
      { answer: "'Nordic Gadgets AB'", kind: "keyword", label: "the claimed tenant",
        why: "Nordic is the sweep's subject — probed 418.98 shelf value on 230 stocked units, rank 1 both boards. Pin 'Shenzhen Electro' and the value assert breaks: Shenzhen carries 92.99, rank 6 on value." },
      { answer: "418.98", kind: "number", label: "the value-board crown",
        why: "Probed: Nordic's three SKUs price to 418.98 — 36.5 percent of the catalog and rank 1 on the value board. 92.99 is Shenzhen's value; pinned against Nordic's name it contradicts the fold." },
      { answer: "1", kind: "number", label: "the asserted units rank",
        why: "Probed: on the ASC units board Nordic's 230 units are rank 1 — the sweep's second crown. 6 is Nordic's rank under DESC (biggest load first); the srk pin is what makes the two-board claim falsifiable." },
    ],
    distractors: ["DESC", "'Shenzhen Electro'", "92.99", "230"],
    walkthrough:
      "One fold, two boards, one claim. The fold: 16 products group to six suppliers, each with shelf value (SUM of prices) and stocked units (SUM of stock). Two windows hang the boards: RANK() OVER (ORDER BY value DESC) crowns Nordic at 418.98, and RANK() OVER (ORDER BY units ASC) — leanest load first — also crowns Nordic, whose 230 units are the fleet's smallest stockpile. The claim is the conjunction: rank 1 on value AND rank 1 on leanest units, one tenant holding both. The direction chip is the claim's hinge — flip the units board to DESC and Nordic's rank reads 6 of 6, heaviest load in the fleet, and the sweep silently dissolves while every other cell stays put. That's why the srk pin exists: a dual-board claim must print both ranks on the asserted row, or it is a value-board crown wearing a units-board costume.",
  },
];
