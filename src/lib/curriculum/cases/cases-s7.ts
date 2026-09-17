// Case batch S7 — Module 3 (set ops & CASE) cases cs-821…cs-860.
// 40 cases: 12 easy / 13 medium / 15 hard across topic s7 (CASE pivots —
// one-row SUM/CASE matrices, joined pivots, month/year grids, HAVING-gated
// pivots, zero columns, money pivots with ROUND).
// Every figure was probed against the live seed db (scripts/m3-facts-s67*.ts)
// and is mechanically re-verified by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesS7: CaseStudy[] = [
  {
    id: "cs-821",
    tier: "easy",
    topic: "s7",
    universe: "fraud",
    title: "The ops pivot, one row",
    brief:
      "From: Fraud analyst. Re: the desk monitor.\n\nThe desk monitor wants the in-flight picture without scrolling: shipped, pending and cancelled counts side by side in one row. A three-column pivot, nothing else.",
    ask: "Pivot shipped, pending and cancelled order counts into one row.",
    template: `SELECT COUNT(CASE WHEN status = {1} THEN 1 END) AS shipped,
       COUNT(CASE WHEN status = {2} THEN 1 END) AS pending,
       COUNT(CASE WHEN status = {3} THEN 1 END) AS cancelled
FROM orders;`,
    slots: [
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the shipped column",
        why: "30 orders are in transit — the first column of the monitor.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the pending column",
        why: "14 pending orders land in the middle column.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the cancelled column",
        why: "7 cancelled orders close the row on the right.",
      },
    ],
    distractors: ["'delivered'", "'refunded'", "'paid'"],
    walkthrough:
      "One row: shipped 30, pending 14, cancelled 7. Each COUNT(CASE WHEN … THEN 1 END) counts only the rows where the branch fires — non-matching rows produce NULL, and COUNT ignores NULLs. That is the count-flavored cousin of the SUM/ELSE-0 pivot: same numbers, different machinery. 'delivered' would repoint a column at the 52 delivered orders, and 'refunded' would print a silent zero for a status this table never carries.",
  },
  {
    id: "cs-822",
    tier: "easy",
    topic: "s7",
    universe: "month-close",
    title: "The billing state trio",
    brief:
      "From: Controller. Re: the AR dashboard tile.\n\nThe dashboard tile needs the invoice mix at a glance: paid, open and void counts in one row. Three conditional counts, no GROUP BY, no scrolling.",
    ask: "Pivot paid, open and void invoice counts into one row.",
    template: `SELECT COUNT(CASE WHEN status = {1} THEN 1 END) AS paid_n,
       COUNT(CASE WHEN status = {2} THEN 1 END) AS open_n,
       COUNT(CASE WHEN status = {3} THEN 1 END) AS void_n
FROM invoices;`,
    slots: [
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the paid column",
        why: "21 invoices are settled — the dominant column of the tile.",
      },
      {
        answer: "'open'",
        kind: "keyword",
        label: "the open column",
        why: "6 open invoices form the collection pipeline.",
      },
      {
        answer: "'void'",
        kind: "keyword",
        label: "the void column",
        why: "Exactly 1 void invoice — the tile's tail figure.",
      },
    ],
    distractors: ["'due'", "'shipped'", "'refunded'"],
    walkthrough:
      "One row: paid 21, open 6, void 1 — 28 invoices accounted for. The pivot reads left to right like a mini income statement: money in, money owed, money erased. 'due' is not a status this table uses, so that column would print 0 and the tile would quietly understate nothing — but a zero where a six belongs is how dashboards lose trust. Counts ignore NULL branch results, which is what makes the single-pass pivot possible.",
  },
  {
    id: "cs-823",
    tier: "easy",
    topic: "s7",
    universe: "growth",
    title: "The region grid, flattened",
    brief:
      "From: Growth lead. Re: the geo strip.\n\nThe geo strip flattens the customer base into one row: EU, APAC, US and LATAM counts side by side, ready to paste into the board chart.",
    ask: "Pivot customer counts for EU, APAC, US and LATAM into one row.",
    template: `SELECT COUNT(CASE WHEN region = {1} THEN 1 END) AS eu,
       COUNT(CASE WHEN region = {2} THEN 1 END) AS apac,
       COUNT(CASE WHEN region = {3} THEN 1 END) AS us,
       COUNT(CASE WHEN region = {4} THEN 1 END) AS latam
FROM customers;`,
    slots: [
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the EU column",
        why: "8 customers sit in the EU — the widest column of the strip.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the APAC column",
        why: "5 APAC customers fill the second column.",
      },
      {
        answer: "'US'",
        kind: "keyword",
        label: "the US column",
        why: "2 US customers — a small but high-value column.",
      },
      {
        answer: "'LATAM'",
        kind: "keyword",
        label: "the LATAM column",
        why: "1 LATAM customer closes the strip on the right.",
      },
    ],
    distractors: ["'EMEA'", "'BRAZIL'"],
    walkthrough:
      "One row: EU 8, APAC 5, US 2, LATAM 1 — 16 customers total. The four-column CASE pivot trades GROUP BY's tidy rows for a single paste-ready line; boards love it, analysts maintain it. 'EMEA' and 'BRAZIL' are not region values in this table — their columns would print zeros, and a zero-filled strip is the classic symptom of a region spelling mismatch between report and database.",
  },
  {
    id: "cs-824",
    tier: "easy",
    topic: "s7",
    universe: "fraud",
    title: "The rails count",
    brief:
      "From: Fraud analyst. Re: the payment mix line.\n\nThe mix line counts payments by rail: card, wire, and a total for the period. The total rides in the same row as a plain COUNT(*).",
    ask: "Pivot card and wire payment counts beside the total in one row.",
    template: `SELECT COUNT(CASE WHEN method = {1} THEN 1 END) AS card_n,
       COUNT(CASE WHEN method = {2} THEN 1 END) AS wire_n,
       COUNT(*) AS all_n
FROM {3};`,
    slots: [
      {
        answer: "'card'",
        kind: "keyword",
        label: "the card column",
        why: "16 payments ran over the card rail — the dominant column of the mix.",
      },
      {
        answer: "'wire'",
        kind: "keyword",
        label: "the wire column",
        why: "11 payments arrived by wire — the slower but heavier rail.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "the source table",
        why: "The rails live in payments; orders and invoices have no method column.",
      },
    ],
    distractors: ["'debit'", "'ach'", "invoices"],
    walkthrough:
      "One row: card 16, wire 11, all 27 — and 16 + 11 reconciles to the total, the built-in sanity check every pivot should carry. The plain COUNT(*) rides alongside the conditional counts, unfiltered. Point the query at invoices instead of payments and it dies outright — invoices carry no method column — which is the audit doing its job. 'debit' and 'ach' are rails this shop never used; their columns would print zeros.",
  },
  {
    id: "cs-825",
    tier: "easy",
    topic: "s7",
    universe: "catalog",
    title: "The price line pivot",
    brief:
      "From: Warehouse lead. Re: the shelf split.\n\nThe shelf split counts products under 100 dollars against products at 100 and up, one row, plus the ELSE arm as insurance.",
    ask: "Pivot product counts under 100 vs at 100+ in one row.",
    template: `SELECT SUM(CASE WHEN {1} THEN 1 {2} END) AS under100,
       SUM(CASE WHEN {3} THEN 1 ELSE 0 END) AS over100
FROM products;`,
    slots: [
      {
        answer: "price < 100",
        kind: "keyword",
        label: "the budget test",
        why: "12 products sit under 100 dollars — the wide side of the shelf.",
      },
      {
        answer: "ELSE 0",
        kind: "keyword",
        label: "the zero payout",
        why: "Non-matching rows pay 0 so the SUM stays a count of matches.",
      },
      {
        answer: "price >= 100",
        kind: "keyword",
        label: "the premium test",
        why: "4 products clear 100 — the headset, mic, webcam and watch.",
      },
    ],
    distractors: ["price < 40", "ELSE 1", "price >= 150"],
    walkthrough:
      "One row: under100 12, over100 4 — sixteen products split at the 100-dollar line. The two tests must be mirrors: price < 100 and price >= 100 leave no gaps and no overlaps. Tighten the budget test to 40 and the under100 column drops to 6 while over100 still says 4 — six products vanish from both columns. ELSE 1 would turn the SUM into a count of every row, printing 16 in the budget column and quietly wrecking the split.",
  },
  {
    id: "cs-826",
    tier: "easy",
    topic: "s7",
    universe: "inventory",
    title: "The roster pivot",
    brief:
      "From: Ops lead. Re: the CRM health tile.\n\nThe health tile flattens the roster: active customers against churned, one row, SUM-and-ELSE machinery this time instead of COUNT.",
    ask: "Pivot active vs churned customer counts into one row.",
    template: `SELECT SUM(CASE WHEN {1} THEN 1 ELSE 0 END) AS live_n,
       SUM(CASE WHEN {2} THEN 1 ELSE 0 END) AS gone_n
FROM {3};`,
    slots: [
      {
        answer: "active = 1",
        kind: "keyword",
        label: "the live test",
        why: "14 customers carry the active flag — the live column's full count.",
      },
      {
        answer: "active = 0",
        kind: "keyword",
        label: "the churned test",
        why: "2 customers have churned — the flag's only other value.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the source table",
        why: "The flag lives on customers; no other table carries account state.",
      },
    ],
    distractors: ["active > 1", "active < 0", "1"],
    walkthrough:
      "One row: live 14, gone 2 — and 14 + 2 reconciles to the 16-customer roster without a third column. The flag takes exactly two values, so the two tests partition the table with no gap: active > 1 and active < 0 both test values the column can never hold, and either one silently zeroes its column while the customers still exist. Point the query at the wrong table and it dies outright — there is no active flag anywhere else to misread.",
  },
  {
    id: "cs-827",
    tier: "easy",
    topic: "s7",
    universe: "expense",
    title: "The spend categories, flattened",
    brief:
      "From: Finance partner. Re: the expense strip.\n\nThe strip flattens the expense ledger into one row of counts: rent, ads and travel side by side, with tools as the un-pivoted remainder.",
    ask: "Pivot rent, ads and travel expense counts into one row.",
    template: `SELECT SUM(CASE WHEN category = {1} THEN 1 ELSE 0 END) AS rent_n,
       SUM(CASE WHEN category = {2} THEN 1 ELSE 0 END) AS ads_n,
       SUM(CASE WHEN category = {3} THEN 1 ELSE 0 END) AS travel_n
FROM expenses;`,
    slots: [
      {
        answer: "'Rent'",
        kind: "keyword",
        label: "the rent column",
        why: "14 rent filings — one a month since day one.",
      },
      {
        answer: "'Ads'",
        kind: "keyword",
        label: "the ads column",
        why: "14 ad filings match rent month for month.",
      },
      {
        answer: "'Travel'",
        kind: "keyword",
        label: "the travel column",
        why: "Only 3 travel filings — the team mostly spends at its desks.",
      },
    ],
    distractors: ["'Tools'", "'WiFi'", "'Salary'"],
    walkthrough:
      "One row: rent 14, ads 14, travel 3 — 31 of the 36 expenses pivoted, with the 5 Tools filings deliberately left out of the strip. Rent and ads tie at 14 because both bill monthly; that tie is the visual rhythm the strip exists to show. 'WiFi' and 'Salary' are not categories in this ledger — their columns would print zeros. The un-pivoted remainder is the pivot's fine print: one-row layouts always hide something.",
  },
  {
    id: "cs-828",
    tier: "easy",
    topic: "s7",
    universe: "fraud",
    title: "The dock pivot",
    brief:
      "From: Fraud analyst. Re: the dock tile.\n\nThe dock tile splits orders by shipment stamp: waiting (no shipped_at) against gone (stamped), one row. The NULL test is the load-bearing wall.",
    ask: "Pivot unshipped vs shipped order counts into one row.",
    template: `SELECT SUM(CASE WHEN {1} THEN 1 ELSE 0 END) AS waiting,
       SUM(CASE WHEN {2} THEN 1 {3} END) AS gone
FROM orders;`,
    slots: [
      {
        answer: "shipped_at IS NULL",
        kind: "keyword",
        label: "the waiting test",
        why: "21 orders carry no stamp — the dock's waiting pile.",
      },
      {
        answer: "shipped_at IS NOT NULL",
        kind: "keyword",
        label: "the gone test",
        why: "82 stamped orders have physically left the building.",
      },
      {
        answer: "ELSE 0",
        kind: "keyword",
        label: "the zero payout",
        why: "Each column's ELSE pays 0, keeping both SUMs honest counts.",
      },
    ],
    distractors: ["shipped_at = NULL", "shipped_at < '2020'", "ELSE 1"],
    walkthrough:
      "One row: waiting 21, gone 82 — 103 orders split by the stamp. The waiting pile decomposes into the 14 pending plus 7 cancelled orders, none ever shipped. The load-bearing test is IS NULL: shipped_at = NULL matches nothing, ever, and the waiting column would print 0 while 21 orders sat on the dock. The two tests must stay mirrors — IS NULL and IS NOT NULL — or orders appear in both columns or neither.",
  },
  {
    id: "cs-829",
    tier: "easy",
    topic: "s7",
    universe: "growth",
    title: "The ticket split, flattened",
    brief:
      "From: Growth lead. Re: the mix line.\n\nThe mix line splits the book at 100 dollars: small tickets against everything bigger, one row, labels in the column names rather than the data.",
    ask: "Pivot small vs big order counts at the 100-dollar line.",
    template: `SELECT SUM(CASE WHEN {1} THEN 1 ELSE 0 END) AS small,
       SUM(CASE WHEN {2} THEN 1 ELSE 0 END) AS big
FROM {3};`,
    slots: [
      {
        answer: "total < 100",
        kind: "keyword",
        label: "the small test",
        why: "15 orders sit under 100 dollars — the light side of the split.",
      },
      {
        answer: "total >= 100",
        kind: "keyword",
        label: "the big test",
        why: "The mirror test: 88 orders sit at or above the line.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Totals live on orders; order_items lines carry unit prices, not ticket totals.",
      },
    ],
    distractors: ["total < 40", "total >= 400", "order_items"],
    walkthrough:
      "One row: small 15, big 88 — the 100-dollar line puts 85% of orders on the big side. The design choice here is labels-in-columns: the pivot prints one row whose column names ARE the buckets, trading the banded GROUP BY layout for a flatter, chart-ready shape. Dropping the line to 40 moves 11 of the 15 small orders into limbo and the split stops reconciling; raising the big test to 400 cuts the big column to 34 while small still says 15 — 69 orders in neither column. Mirror tests keep every order in exactly one bucket.",
  },
  {
    id: "cs-830",
    tier: "easy",
    topic: "s7",
    universe: "supplier",
    title: "The standings pivot",
    brief:
      "From: Sourcing lead. Re: the vendor tile.\n\nThe vendor tile counts suppliers by standing: stars at 4.5 and up against the crew below, one row. Six vendors, two columns.",
    ask: "Pivot star vs crew supplier counts into one row.",
    template: `SELECT SUM(CASE WHEN {1} THEN 1 ELSE 0 END) AS stars,
       SUM(CASE WHEN rating < {3} THEN 1 ELSE 0 END) AS crew
FROM {2};`,
    slots: [
      {
        answer: "rating >= 4.5",
        kind: "keyword",
        label: "the star test",
        why: "Nordic Gadgets (4.6) and Alpine Audio (4.8) are the two stars.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "the source table",
        why: "Ratings live on suppliers; no other table carries vendor standings.",
      },
      {
        answer: "4.5",
        kind: "keyword",
        label: "the crew ceiling",
        why: "The mirror constant: everything below 4.5 is crew — four suppliers.",
      },
    ],
    distractors: ["rating >= 4.7", "'top'", "products"],
    walkthrough:
      "One row: stars 2, crew 4 — the vendor bench in a single line. The two columns mirror on the same constant: rating >= 4.5 and rating < 4.5 share the 4.5 line, so the pair cannot double-count or gap. Raise the star test to 4.7 without moving the crew ceiling and Nordic counts in neither column — the roster stops reconciling, which is exactly how one-sided edits get caught. Point the query at products and it dies: no rating column there.",
  },
  {
    id: "cs-831",
    tier: "easy",
    topic: "s7",
    universe: "funnel",
    title: "The won-and-rest line",
    brief:
      "From: Funnel analyst. Re: the money mix line.\n\nThe mix line puts delivered money beside everything else — shipped, pending, cancelled all lumped as the rest — in one row of exact dollars.",
    ask: "Pivot delivered money vs all-other money into one row.",
    template: `SELECT ROUND(SUM(CASE WHEN status = {1} THEN total {2} END), 2) AS won,
       ROUND(SUM(CASE WHEN {3} THEN total ELSE 0 END), 2) AS open_mix
FROM orders;`,
    slots: [
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the won test",
        why: "52 delivered orders hold 15,571.07 — the won column.",
      },
      {
        answer: "ELSE 0",
        kind: "keyword",
        label: "the zero payout",
        why: "The ELSE arm pays 0 so the SUM isolates delivered money.",
      },
      {
        answer: "status <> 'delivered'",
        kind: "keyword",
        label: "the rest test",
        why: "The mirror test: 51 undelivered orders hold 19,262.21.",
      },
    ],
    distractors: ["'shipped'", "ELSE 1", "status = 'delivered'"],
    walkthrough:
      "One row: won 15,571.07, open_mix 19,262.21 — and 15,571.07 + 19,262.21 reconciles to the 34,833.28 book total. The rest column lumps three very different statuses together, which is exactly why the label says mix: pending money (6,113.00) and cancelled money (1,152.49) ride with in-transit money (9,980.76). Swap the second test to status = 'delivered' and open_mix collapses to 0 — the complement vanishing is the classic broken-mirror symptom.",
  },
  {
    id: "cs-832",
    tier: "easy",
    topic: "s7",
    universe: "catalog",
    title: "The pick-line pivot",
    brief:
      "From: Warehouse lead. Re: the pick mix tile.\n\nThe pick tile counts one-unit lines against two-unit lines in one row. Quantities of 3+ exist — 89 of them — but this tile deliberately tracks only the two small shapes.",
    ask: "Pivot single vs pair line counts into one row.",
    template: `SELECT SUM(CASE WHEN {1} THEN 1 ELSE 0 END) AS singles,
       SUM(CASE WHEN {2} THEN 1 ELSE 0 END) AS pairs
FROM {3};`,
    slots: [
      {
        answer: "quantity = 1",
        kind: "keyword",
        label: "the single test",
        why: "93 lines pick exactly one unit — equality, not a range, by design.",
      },
      {
        answer: "quantity = 2",
        kind: "keyword",
        label: "the pair test",
        why: "69 lines pick exactly two — the tile's middle shape.",
      },
      {
        answer: "order_items",
        kind: "keyword",
        label: "the source table",
        why: "Quantities live on order_items; orders carry no quantity column.",
      },
    ],
    distractors: ["quantity >= 1", "quantity > 2", "orders"],
    walkthrough:
      "One row: singles 93, pairs 69 — with 89 bulk lines (quantity 3) intentionally outside the tile. The equality tests are surgical: quantity >= 1 would flood the singles column with all 251 lines, and quantity > 2 in the pair slot would empty it — the bulk pile exists either way, uncounted. The tile's fine print is what it omits: 93 + 69 = 162 against 251 total lines should make any reader ask where the other 89 went. Point the query at orders and it dies: no quantity column on the header table.",
  },
  {
    id: "cs-833",
    tier: "medium",
    topic: "s7",
    universe: "month-close",
    title: "December's billing row",
    brief:
      "From: Controller. Re: the month grid.\n\nThe close grid prints one row per billing month with paid and unpaid counts. December's row is the one the audit pulls: two settled, one still open.",
    ask: "Pivot December 2024 invoices into paid vs unpaid counts.",
    template: `SELECT substr(issued_on, 1, 7) AS m,
       SUM(CASE WHEN status = {1} THEN 1 ELSE 0 END) AS paid_n,
       SUM(CASE WHEN {2} THEN 1 ELSE 0 END) AS unpaid_n
FROM invoices
WHERE substr(issued_on, 1, 7) = {3}
GROUP BY m;`,
    slots: [
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the paid test",
        why: "Two December invoices settled — the month closed clean.",
      },
      {
        answer: "status <> 'paid'",
        kind: "keyword",
        label: "the unpaid test",
        why: "The mirror test: one December invoice still open.",
      },
      {
        answer: "'2024-12'",
        kind: "keyword",
        label: "the month filter",
        why: "substr trims issued_on to its year-month; December's slice holds 3 invoices.",
      },
    ],
    distractors: ["status = 'void'", "'2025-01'", "substr(issued_on, 1, 7)"],
    walkthrough:
      "One row: 2024-12 with paid_n 2 and unpaid_n 1 — December's three invoices in one line. The month filter does what GROUP BY alone cannot: it picks the slice before the pivot runs, so the row is a true per-month snapshot. Repoint the filter at 2025-01 and the row flips to 0 paid / 2 unpaid — the new year's bills, none settled yet. The unpaid test must stay the mirror of paid: pin it to 'void' and December's open invoice vanishes from the grid.",
  },
  {
    id: "cs-834",
    tier: "medium",
    topic: "s7",
    universe: "fraud",
    title: "September's rails, in dollars",
    brief:
      "From: Fraud analyst. Re: the rail money grid.\n\nThe money grid pivots card and wire dollars by month. September's row is the watch item: wire money ran more than double card money.",
    ask: "Pivot September 2024 card vs wire dollars into one row.",
    template: `SELECT substr(paid_on, 1, 7) AS m,
       ROUND(SUM(CASE WHEN method = {1} THEN amount_cents ELSE 0 END)/{2}, 2) AS card,
       ROUND(SUM(CASE WHEN method = {3} THEN amount_cents ELSE 0 END)/100.0, 2) AS wire
FROM payments
WHERE substr(paid_on, 1, 7) = '2024-09'
GROUP BY m;`,
    slots: [
      {
        answer: "'card'",
        kind: "keyword",
        label: "the card test",
        why: "September card money totals 2,547.00 across the month's card payments.",
      },
      {
        answer: "100.0",
        kind: "keyword",
        label: "the cents divisor",
        why: "Cents divided by 100.0 become dollars before the 2-decimal round.",
      },
      {
        answer: "'wire'",
        kind: "keyword",
        label: "the wire test",
        why: "September wire money hit 5,873.50 — more than double card.",
      },
    ],
    distractors: ["'debit'", "10.0", "'ach'"],
    walkthrough:
      "One row: 2024-09 with card 2,547.00 and wire 5,873.50. The wire spike is the anomaly the grid exists to surface — most months lean card, September leaned wire by 2.3x. The pivot runs inside a single filtered slice: the month filter gates the rows, then two conditional sums split them by rail. Dividing by 10.0 would print 25,470.00 of imaginary card money — unit slips are the number-one defect in money pivots. 'debit' and 'ach' are unused rails; their columns would print zeros.",
  },
  {
    id: "cs-835",
    tier: "medium",
    topic: "s7",
    universe: "growth",
    title: "The region fulfillment grid",
    brief:
      "From: Growth lead. Re: the geo grid.\n\nThe grid joins orders to customers and pivots fulfillment state per region: done (delivered or shipped) against waiting (pending). Four regions, one row each.",
    ask: "Pivot done vs pending order counts per region.",
    template: `SELECT c.region,
       SUM(CASE WHEN {1} THEN 1 ELSE 0 END) AS done,
       SUM(CASE WHEN {2} THEN 1 ELSE 0 END) AS waiting
FROM orders o JOIN customers c ON {3}
GROUP BY c.region
ORDER BY c.region;`,
    slots: [
      {
        answer: "o.status IN ('delivered', 'shipped')",
        kind: "keyword",
        label: "the done test",
        why: "Done means physically resolved: delivered (52) plus shipped (30) — 82 orders.",
      },
      {
        answer: "o.status = 'pending'",
        kind: "keyword",
        label: "the waiting test",
        why: "Pending orders wait per region: APAC 5, EU 6, US 3, LATAM 0.",
      },
      {
        answer: "c.id = o.customer_id",
        kind: "keyword",
        label: "the join key",
        why: "Regions live on customers; the join carries each order to its region.",
      },
    ],
    distractors: ["o.status = 'delivered'", "o.status = 'cancelled'", "c.id = o.id"],
    walkthrough:
      "Four rows: APAC 29/5, EU 36/6, LATAM 2/0, US 15/3 — done counts summing to 82, waiting to 14, and 82 + 14 + 7 cancelled = 103. The IN list is the pivot's contract: done deliberately includes in-transit shipments, so the grid measures fulfillment progress, not final delivery. Shrink it to delivered only and APAC drops from 29 to 21 — in-transit orders vanish from the done column while still occupying the pipeline. LATAM's zero in waiting is a real reading: its 2 orders both resolved.",
  },
  {
    id: "cs-836",
    tier: "medium",
    topic: "s7",
    universe: "supplier",
    title: "The sourcing grid",
    brief:
      "From: Sourcing lead. Re: the vendor map.\n\nThe vendor map pivots product counts per supplier region, with a stockout column for the count that matters most. This quarter every region's stockout column reads zero — and that is the headline.",
    ask: "Pivot product counts per supplier region with a stockout column.",
    template: `SELECT s.region, COUNT(p.id) AS products,
       SUM(CASE WHEN {1} THEN 1 ELSE 0 END) AS out_n
FROM products p JOIN suppliers s ON {2}
GROUP BY {3};`,
    slots: [
      {
        answer: "p.stock = 0",
        kind: "keyword",
        label: "the stockout test",
        why: "No product has hit zero stock — every region's out_n reads 0.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the join key",
        why: "The foreign key carries each product to its supplier's region.",
      },
      {
        answer: "s.region",
        kind: "keyword",
        label: "the group key",
        why: "Grouping by region makes four rows; grouping by supplier would make six.",
      },
    ],
    distractors: ["p.stock > 0", "s.id = p.id", "s.id"],
    walkthrough:
      "Four rows: APAC 6 products / 0 out, EU 5 / 0, LATAM 2 / 0, US 3 / 0 — sixteen products, zero stockouts. The zero column is the map's real content: the SUM(CASE…) pattern pays 1 per stockout, and sixteen healthy products pay nothing. Flip the test to stock > 0 and every region prints its product count in the stockout column — the map would scream a crisis it does not have. Joining on s.id = p.id matches primary keys across tables, a classic wrong-key join that scrambles the counts.",
  },
  {
    id: "cs-837",
    tier: "medium",
    topic: "s7",
    universe: "pricing",
    title: "The band survival grid",
    brief:
      "From: Pricing analyst. Re: the band health grid.\n\nThe grid bands orders small / mid / large, then pivots delivered against cancelled inside each band. The large band's zero in the cancelled column is the slide's feel-good stat.",
    ask: "Pivot delivered vs cancelled counts per order-size band.",
    template: `SELECT CASE WHEN {1} THEN 'small'
             WHEN total < 500 THEN 'mid'
             ELSE 'large' END AS band,
       SUM(CASE WHEN {2} THEN 1 ELSE 0 END) AS delivered,
       SUM(CASE WHEN {3} THEN 1 ELSE 0 END) AS cancelled
FROM orders
GROUP BY band
ORDER BY band;`,
    slots: [
      {
        answer: "total < 100",
        kind: "keyword",
        label: "the small cut",
        why: "First branch: 15 small orders start the grid's rows.",
      },
      {
        answer: "status = 'delivered'",
        kind: "keyword",
        label: "the delivered test",
        why: "Delivered counts per band: large 9, mid 35, small 8.",
      },
      {
        answer: "status = 'cancelled'",
        kind: "keyword",
        label: "the cancelled test",
        why: "Cancelled counts per band: large 0, mid 5, small 2 — big tickets never die.",
      },
    ],
    distractors: ["total < 150", "status = 'shipped'", "status = 'pending'"],
    walkthrough:
      "Three rows: large 9/0, mid 35/5, small 8/2. The large band's clean zero says no 500-plus order was ever cancelled — the shop's biggest commitments all survived. Banding first, pivoting second is the two-layer pattern: the outer CASE builds rows, the inner CASEs build columns, and GROUP BY binds them. Loosen the small cut to 150 and the bands rebalance under both columns at once — every threshold in a band grid moves two numbers, never one.",
  },
  {
    id: "cs-838",
    tier: "medium",
    topic: "s7",
    universe: "inventory",
    title: "The spend grid's first pages",
    brief:
      "From: Finance partner. Re: the monthly grid.\n\nThe grid prints rent and ad spend per month — the two constants of the ledger — starting from the first three months of the window.",
    ask: "Pivot monthly rent vs ads dollars, first 3 months.",
    template: `SELECT substr(spent_on, 1, 7) AS m,
       ROUND(SUM(CASE WHEN category = {1} THEN amount_cents ELSE 0 END)/100.0, 2) AS rent,
       ROUND(SUM(CASE WHEN category = {2} THEN amount_cents ELSE 0 END)/100.0, 2) AS ads
FROM expenses
GROUP BY m
ORDER BY m
LIMIT {3};`,
    slots: [
      {
        answer: "'Rent'",
        kind: "keyword",
        label: "the rent test",
        why: "Rent pays 1,200.00 every single month — the grid's flat line.",
      },
      {
        answer: "'Ads'",
        kind: "keyword",
        label: "the ads test",
        why: "Ads climb 220, 240, 265 across the first three months.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the page size",
        why: "LIMIT 3 after ORDER BY m pages the 14-month grid from its start.",
      },
    ],
    distractors: ["category = 'Tools'", "category = 'Travel'", "5"],
    walkthrough:
      "Three rows: 2024-01 rent 1,200.00 / ads 220.00, 2024-02 1,200.00 / 240.00, 2024-03 1,200.00 / 265.00. Rent's flat 1,200 is the ledger's metronome; ads' climb is the growth story — 220 to 265 in two months. The page size matters: LIMIT runs after both the grouping and the sort, so the grid opens at 2024-01 every time. Swap the rent test to 'Tools' and the flat line collapses to zeros — Tools bill irregularly, and the grid's rhythm dies.",
  },
  {
    id: "cs-839",
    tier: "medium",
    topic: "s7",
    universe: "funnel",
    title: "The lost-and-won line",
    brief:
      "From: Funnel analyst. Re: the outcome line.\n\nThe outcome line puts cancelled money beside resolved money — delivered plus shipped — in one row. The gap between the two numbers is the funnel's whole story.",
    ask: "Pivot cancelled money vs resolved (delivered + shipped) money.",
    template: `SELECT ROUND(SUM(CASE WHEN status = {1} THEN total ELSE 0 END), 2) AS lost,
       ROUND(SUM(CASE WHEN {2} THEN total {3} END), 2) AS won
FROM orders;`,
    slots: [
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the lost test",
        why: "7 cancelled orders hold 1,152.49 — the leak the line measures.",
      },
      {
        answer: "status IN ('delivered', 'shipped')",
        kind: "keyword",
        label: "the won test",
        why: "Resolved money: delivered 15,571.07 plus shipped 9,980.76.",
      },
      {
        answer: "ELSE 0",
        kind: "keyword",
        label: "the zero payout",
        why: "The ELSE arm pays 0, keeping each SUM a clean one-status total.",
      },
    ],
    distractors: ["status = 'pending'", "status = 'delivered'", "ELSE 1"],
    walkthrough:
      "One row: lost 1,152.49, won 25,551.83 — resolved money outweighs lost money 22 to 1. The IN list is doing real work: delivered alone would understate won by 9,980.76, because in-transit shipments are already won money by any commercial reading. Pending money (6,113.00) sits in neither column — it is neither lost nor resolved, and the line's two tests leave it exactly there. ELSE 1 would quietly add 103 phantom dollars to the won column.",
  },
  {
    id: "cs-840",
    tier: "medium",
    topic: "s7",
    universe: "catalog",
    title: "The shelf value split",
    brief:
      "From: Warehouse lead. Re: the inventory value tile.\n\nThe tile splits the catalog at 100 dollars with counts AND shelf value: twelve cheap products hold less value than four premium ones.",
    ask: "Pivot product count and value for under-100 vs 100+ bands.",
    template: `SELECT CASE WHEN {1} THEN {2}
             ELSE 'over' END AS band,
       COUNT(*) AS n, ROUND(SUM({3}), 2) AS value
FROM products
GROUP BY band;`,
    slots: [
      {
        answer: "price < 100",
        kind: "keyword",
        label: "the under test",
        why: "12 products under 100 dollars hold 550.45 of shelf value.",
      },
      {
        answer: "'under'",
        kind: "keyword",
        label: "the under label",
        why: "The printed band for the cheap shelf — twelve of sixteen products.",
      },
      {
        answer: "price",
        kind: "keyword",
        label: "the value column",
        why: "SUM(price) per band: the over side's 4 products hold 597.98.",
      },
    ],
    distractors: ["price < 40", "'low'", "stock"],
    walkthrough:
      "Two rows: under 12 products / 550.45, over 4 products / 597.98 — the premium side holds more value with a third of the stock. That inversion is the tile's point: value concentrates where units are few. Summing stock instead of price would report unit counts as if they were dollars — 597.98 becomes a meaningless integer pile. The ELSE arm needs no WHEN mirror here because the band is binary; the price < 100 test is the only line that matters.",
  },
  {
    id: "cs-841",
    tier: "medium",
    topic: "s7",
    universe: "month-close",
    title: "The trial balance, sorted",
    brief:
      "From: Controller. Re: the close packet.\n\nThe close packet prints each account's debit and credit dollars, biggest credit flow first. Revenue's 86,052 credit tops the page, and the zero columns tell their own stories.",
    ask: "Pivot per-account debit and credit dollars, ordered by credits descending.",
    template: `SELECT account,
       ROUND(SUM(CASE WHEN {1} THEN debit_cents ELSE 0 END)/100.0, 2) AS debits,
       ROUND(SUM(CASE WHEN credit_cents > 0 THEN {2} ELSE 0 END)/100.0, 2) AS credits
FROM ledger_entries
GROUP BY account
ORDER BY {3};`,
    slots: [
      {
        answer: "debit_cents > 0",
        kind: "keyword",
        label: "the debit test",
        why: "Debit entries carry positive cents; the test routes them down the debit column.",
      },
      {
        answer: "credit_cents",
        kind: "keyword",
        label: "the credit payout",
        why: "Credit entries pay their own cents into the credit column.",
      },
      {
        answer: "credits DESC",
        kind: "keyword",
        label: "the page order",
        why: "Revenue 86,052.00 leads, then AR 69,612.00, cash 25,416.00, opex 0.00.",
      },
    ],
    distractors: ["credit_cents > 0", "debit_cents < 0", "credits ASC"],
    walkthrough:
      "Four rows: sales_revenue 0.00 / 86,052.00, accounts_receivable 86,052.00 / 69,612.00, cash 69,612.00 / 25,416.00, operating_expenses 25,416.00 / 0.00. Read the zeros: revenue never debits, opex never credits — pure single-side accounts. The cross-assignments are the packet's hidden audit: one account's credits should equal the next account's debits as money moves revenue → AR → cash. Reversing the page order buries revenue at the bottom, and the controller reads the packet bottom-up.",
  },
  {
    id: "cs-842",
    tier: "medium",
    topic: "s7",
    universe: "fraud",
    title: "The AR money trio",
    brief:
      "From: Fraud analyst. Re: the exposure tile.\n\nThe exposure tile pivots invoice money by state: settled, outstanding, and the voided 925 that proves the ledger keeps its scars.",
    ask: "Pivot paid, open and void invoice dollars into one row.",
    template: `SELECT ROUND(SUM(CASE WHEN status = {1} THEN amount_cents ELSE 0 END)/100.0, 2) AS paid_money,
       ROUND(SUM(CASE WHEN status = {2} THEN amount_cents ELSE 0 END)/100.0, 2) AS open_money,
       ROUND(SUM(CASE WHEN status = {3} THEN amount_cents ELSE 0 END)/100.0, 2) AS void_money
FROM invoices;`,
    slots: [
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the paid test",
        why: "21 settled invoices hold 66,443.00 — the tile's big number.",
      },
      {
        answer: "'open'",
        kind: "keyword",
        label: "the open test",
        why: "6 open invoices hold 19,609.00 — live exposure.",
      },
      {
        answer: "'void'",
        kind: "keyword",
        label: "the void test",
        why: "1 void invoice holds 925.00 — kept visible on purpose.",
      },
    ],
    distractors: ["'due'", "'shipped'", "'refunded'"],
    walkthrough:
      "One row: paid 66,443.00, open 19,609.00, void 925.00 — 86,977.00 of invoiced money in three piles. The counts differ wildly from the money: open is 6 of 28 invoices but 23% of the dollars, the ratio the collections desk actually works from. 'due' would zero a column while the exposure stayed real — a tile that understates risk is worse than one that errors. The three tests partition the 28 invoices with no ELSE arm: an unknown status would fall out of all three columns and the row would stop reconciling to 86,977.00.",
  },
  {
    id: "cs-843",
    tier: "medium",
    topic: "s7",
    universe: "growth",
    title: "The churn money grid",
    brief:
      "From: Growth lead. Re: the retention grid.\n\nThe grid joins orders to customers and pivots spend by account state: live accounts against churned ones. Six orders from dead accounts — the grid sizes that leak.",
    ask: "Pivot order count and money for live vs churned customers.",
    template: `SELECT CASE WHEN {1} THEN {2}
             ELSE 'churned' END AS state,
       COUNT(*) AS n, ROUND(SUM(o.total), 2) AS money
FROM orders o JOIN customers c ON {3}
GROUP BY state;`,
    slots: [
      {
        answer: "c.active = 1",
        kind: "keyword",
        label: "the live test",
        why: "97 orders come from live accounts, worth 33,135.42.",
      },
      {
        answer: "'live'",
        kind: "keyword",
        label: "the live label",
        why: "The printed state for active accounts — 97 orders' worth.",
      },
      {
        answer: "c.id = o.customer_id",
        kind: "keyword",
        label: "the join key",
        why: "The foreign key carries each order to its customer's flag.",
      },
    ],
    distractors: ["c.active = 0", "'paid'", "c.id = o.id"],
    walkthrough:
      "Two rows: live 97 orders / 33,135.42, churned 6 / 1,697.86 — 103 orders, 34,833.28, reconciled. The churned row is small in orders but the grid keeps it visible: 1,697.86 of spend sits on accounts the business has already lost, and every future refund or dispute on those orders lands in no-man's-land. Joining on c.id = o.id matches a customer id to an order id — two unrelated id spaces — and scrambles the split. The flag test must stay c.active = 1; flipping it swaps the rows' populations.",
  },
  {
    id: "cs-844",
    tier: "medium",
    topic: "s7",
    universe: "supplier",
    title: "The star bench grid",
    brief:
      "From: Sourcing lead. Re: the vendor tile.\n\nThe tile joins products to suppliers and pivots by standing: stars (4.5+) against the crew. The stars carry 5 products including every premium one — the tile's quiet flex.",
    ask: "Pivot product counts for star vs crew suppliers.",
    template: `SELECT CASE WHEN {1} THEN {2}
             ELSE 'crew' END AS tier,
       COUNT(p.id) AS products
FROM suppliers s LEFT JOIN products p ON {3}
GROUP BY tier;`,
    slots: [
      {
        answer: "s.rating >= 4.5",
        kind: "keyword",
        label: "the star test",
        why: "Nordic (4.6) and Alpine (4.8) form the star tier: 5 products.",
      },
      {
        answer: "'star'",
        kind: "keyword",
        label: "the star label",
        why: "The printed tier for 4.5-plus vendors — five products' worth.",
      },
      {
        answer: "p.supplier_id = s.id",
        kind: "keyword",
        label: "the join key",
        why: "LEFT JOIN keeps all six suppliers; the key carries products to their tier.",
      },
    ],
    distractors: ["s.rating >= 4.7", "'top'", "p.supplier_id = p.id"],
    walkthrough:
      "Two rows: star 5 products, crew 11 — sixteen products split by vendor standing. The premium story hides inside the star row: all the pricey catalog (prices 100 and up) sources from star vendors, which is why the tile exists. Demoting the star line to 4.7 drops Nordic from the tier and its products fall to crew — the split moves even though no product moved. The LEFT JOIN matters: a supplier with no products would still print a row with count 0, keeping the bench visible.",
  },
  {
    id: "cs-845",
    tier: "medium",
    topic: "s7",
    universe: "expense",
    title: "The year-over-year grid",
    brief:
      "From: Finance partner. Re: the annual grid.\n\nThe grid pivots ad and rent dollars per year. 2024 runs the full window; 2025 has only two months — and the grid makes the comparison honest by grouping on the year prefix.",
    ask: "Pivot ads vs rent dollars per year.",
    template: `SELECT {3} AS yr,
       ROUND(SUM(CASE WHEN category = {1} THEN amount_cents ELSE 0 END)/100.0, 2) AS ads,
       ROUND(SUM(CASE WHEN category = {2} THEN amount_cents ELSE 0 END)/100.0, 2) AS rent
FROM expenses
GROUP BY yr
ORDER BY yr;`,
    slots: [
      {
        answer: "'Ads'",
        kind: "keyword",
        label: "the ads test",
        why: "2024 ads total 3,690.00; 2025's two months add 880.00.",
      },
      {
        answer: "'Rent'",
        kind: "keyword",
        label: "the rent test",
        why: "Rent: 14,400.00 across 2024's twelve filings, 2,400.00 in 2025.",
      },
      {
        answer: "substr(spent_on, 1, 4)",
        kind: "keyword",
        label: "the year key",
        why: "Trimming the date to its year prefix groups 36 filings into 2 rows.",
      },
    ],
    distractors: ["category = 'Tools'", "category = 'Travel'", "substr(spent_on, 1, 7)"],
    walkthrough:
      "Two rows: 2024 ads 3,690.00 / rent 14,400.00, 2025 ads 880.00 / rent 2,400.00. The grid's honesty lives in the group key: substr to 4 characters makes one row per year, and the uneven window (12 months vs 2) is visible in the numbers themselves rather than hidden by a chart. Group by 7 characters instead and the grid returns to 14 monthly rows — correct, but the annual comparison dies. Tools and travel never enter the grid: their money rides in the ELSE arms at zero.",
  },
  {
    id: "cs-846",
    tier: "hard",
    topic: "s7",
    universe: "growth",
    title: "The region money grid",
    brief:
      "From: Growth lead. Re: the board grid.\n\nThe board grid joins orders to customers and pivots money per region: delivered dollars against cancelled dollars. LATAM's zero in the lost column is the quiet headline.",
    ask: "Pivot delivered vs cancelled dollars per region.",
    template: `SELECT c.region,
       ROUND(SUM(CASE WHEN {1} THEN {2} ELSE 0 END), 2) AS won,
       ROUND(SUM(CASE WHEN o.status = 'cancelled' THEN o.total ELSE 0 END), 2) AS lost
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY {3};`,
    slots: [
      {
        answer: "o.status = 'delivered'",
        kind: "keyword",
        label: "the won test",
        why: "Delivered money per region: EU 6,656.18, APAC 6,617.68, US 1,444.77, LATAM 852.44.",
      },
      {
        answer: "o.total",
        kind: "keyword",
        label: "the won payout",
        why: "The THEN arm pays each delivered order's total into its region's won column.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the group key",
        why: "Grouping by region makes four rows that diff cleanly against last quarter.",
      },
    ],
    distractors: ["o.status = 'shipped'", "o.id", "c.region ASC"],
    walkthrough:
      "Four rows: APAC 6,617.68 / 513.81, EU 6,656.18 / 494.82, LATAM 852.44 / 0.00, US 1,444.77 / 143.86 — won columns summing to 15,571.07. The grid's money view inverts the count view: US is small in orders but the worst lost-money region per order, while LATAM has never cancelled anything. Paying o.id instead of o.total turns the money columns into id sums — big, precise, meaningless numbers. The lost column is hardcoded to cancelled so the two columns can never overlap.",
  },
  {
    id: "cs-847",
    tier: "hard",
    topic: "s7",
    universe: "fraud",
    title: "The waiting-room filter",
    brief:
      "From: Fraud analyst. Re: the triage grid.\n\nThe triage grid pivots pending against cancelled per region — but only for regions that actually have a queue. HAVING on the pivot column does what WHERE cannot: it filters after the aggregation.",
    ask: "Pivot pending vs cancelled counts per region, queue regions only.",
    template: `SELECT c.region,
       SUM(CASE WHEN {1} THEN 1 ELSE 0 END) AS waiting,
       SUM(CASE WHEN {3} THEN 1 ELSE 0 END) AS cancelled
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.region
{2}
ORDER BY waiting DESC;`,
    slots: [
      {
        answer: "o.status = 'pending'",
        kind: "keyword",
        label: "the waiting test",
        why: "Pending counts per region: EU 6, APAC 5, US 3 — and LATAM's zero gets filtered.",
      },
      {
        answer: "HAVING waiting > 0",
        kind: "keyword",
        label: "the queue gate",
        why: "HAVING reads the pivot column after aggregation — WHERE cannot see waiting.",
      },
      {
        answer: "o.status = 'cancelled'",
        kind: "keyword",
        label: "the cancelled test",
        why: "Cancelled counts ride along: EU 3, APAC 3, US 1.",
      },
    ],
    distractors: ["o.status = 'shipped'", "WHERE waiting > 0", "o.status = 'delivered'"],
    walkthrough:
      "Three rows: EU 6/3, APAC 5/3, US 3/1 — LATAM is gone, filtered out for having no queue. WHERE runs before grouping and cannot reference the waiting column; HAVING runs after the pivot exists, which is the only way to gate on a computed count. Writing WHERE waiting > 0 fails outright — the column does not exist yet at filter time. The grid's gate makes the desk's queue honest: zero-queue regions are noise for triage, even if their cancelled counts are not.",
  },
  {
    id: "cs-848",
    tier: "hard",
    topic: "s7",
    universe: "pricing",
    title: "The pick-band value grid",
    brief:
      "From: Pricing analyst. Re: the basket economics grid.\n\nThe grid bands order lines single / pair / bulk, then pivots count and line value per band. Bulk's 89 lines carry three times the value of singles — the economics of quantity, in one query.",
    ask: "Pivot count and line value per quantity band.",
    template: `SELECT CASE WHEN {1} THEN 'bulk'
             WHEN {2} THEN 'pair'
             ELSE 'single' END AS band,
       COUNT(*) AS n, ROUND(SUM({3}), 2) AS value
FROM order_items
GROUP BY band
ORDER BY band;`,
    slots: [
      {
        answer: "quantity >= 3",
        kind: "keyword",
        label: "the bulk cut",
        why: "Every quantity 3 line — 89 of them, the catalog's only bulk size.",
      },
      {
        answer: "quantity = 2",
        kind: "keyword",
        label: "the pair test",
        why: "Exactly-two lines: 69, the middle band of the pick floor.",
      },
      {
        answer: "quantity * unit_price",
        kind: "keyword",
        label: "the line value",
        why: "Line value is quantity times unit price: bulk 18,307.17, pair 9,667.82, single 6,858.29.",
      },
    ],
    distractors: ["quantity > 3", "quantity <= 2", "unit_price"],
    walkthrough:
      "Three rows: bulk 89 / 18,307.17, pair 69 / 9,667.82, single 93 / 6,858.29 — value sums to 34,833.28, the order book itself. The quantity ladder is exhaustive on this data: quantities only take 1, 2 and 3, so bulk's >= 3 and quantity > 3 differ by exactly those 89 lines — the flipped test empties the bulk band entirely. Multiplying matters: unit_price alone values bulk lines at a third of their true weight, and the grid's economics story dies.",
  },
  {
    id: "cs-849",
    tier: "hard",
    topic: "s7",
    universe: "inventory",
    title: "The rails grid's last pages",
    brief:
      "From: Finance partner. Re: the treasury grid.\n\nThe treasury grid pivots card and wire dollars per month, newest first, four rows to a page. November's zero in the wire column is the page's anomaly.",
    ask: "Pivot card vs wire dollars per month, newest 4 months.",
    template: `SELECT substr(paid_on, 1, 7) AS m,
       ROUND(SUM(CASE WHEN method = {1} THEN amount_cents ELSE 0 END)/100.0, 2) AS card,
       ROUND(SUM(CASE WHEN method = {2} THEN amount_cents ELSE 0 END)/100.0, 2) AS wire
FROM payments
GROUP BY m
ORDER BY m DESC
LIMIT {3};`,
    slots: [
      {
        answer: "'card'",
        kind: "keyword",
        label: "the card test",
        why: "Card dollars per month on the page: 3,076.00, 3,647.50, 2,683.00, 2,807.00.",
      },
      {
        answer: "'wire'",
        kind: "keyword",
        label: "the wire test",
        why: "Wire dollars per month: 4,000.00, 2,229.50, 2,807.00, 0.00.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the page size",
        why: "Four months to a page; DESC paging starts at 2025-02.",
      },
    ],
    distractors: ["method = 'debit'", "method = 'ach'", "2"],
    walkthrough:
      "Four rows, newest first: 2025-02 card 3,076.00 / wire 4,000.00, 2025-01 3,647.50 / 2,229.50, 2024-12 2,683.00 / 2,807.00, 2024-11 2,807.00 / 0.00. November's wire zero is real — no wire arrived that month — and the grid keeps it visible rather than averaging it away. DESC order plus LIMIT pages from the present backward, the direction treasury actually reads. 'debit' and 'ach' columns would print zeros for every month; a grid of zeros is a rail audit finding, not a treasury view.",
  },
  {
    id: "cs-850",
    tier: "hard",
    topic: "s7",
    universe: "month-close",
    title: "The billing year split",
    brief:
      "From: Controller. Re: the close binder.\n\nThe binder pivots invoice money per year: paid against due. 2024's due column is a rounding error; 2025's is five sixths of its billing — the binder's red flag.",
    ask: "Pivot paid vs due invoice dollars per year.",
    template: `SELECT substr(issued_on, 1, 4) AS yr, COUNT(*) AS n,
       ROUND(SUM(CASE WHEN status = {1} THEN {2} ELSE 0 END)/100.0, 2) AS paid_money,
       ROUND(SUM(CASE WHEN {3} THEN amount_cents ELSE 0 END)/100.0, 2) AS due_money
FROM invoices
GROUP BY yr
ORDER BY yr;`,
    slots: [
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the paid test",
        why: "Paid per year: 64,687.00 in 2024 against just 1,756.00 in 2025.",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "the paid payout",
        why: "Paid invoices pay their own cents into the paid column.",
      },
      {
        answer: "status <> 'paid'",
        kind: "keyword",
        label: "the due test",
        why: "The mirror test: 2024 due 3,093.00, 2025 due 17,441.00.",
      },
    ],
    distractors: ["status = 'void'", "invoice_id", "substr(issued_on, 1, 7)"],
    walkthrough:
      "Two rows: 2024 with 23 invoices / 64,687.00 paid / 3,093.00 due, 2025 with 5 / 1,756.00 / 17,441.00. The year split exposes the aging story: 2025's open money dwarfs its collections because the year is young and its bills uncollected. The mirror test keeps the columns exhaustive — paid plus due equals invoiced per year. Summing invoice_id instead of amount_cents produces id arithmetic that looks like money to no one; grouping by month instead of year reopens 28 rows the binder wanted closed.",
  },
  {
    id: "cs-851",
    tier: "hard",
    topic: "s7",
    universe: "catalog",
    title: "The premium category map",
    brief:
      "From: Warehouse lead. Re: the assortment map.\n\nThe map pivots under/over-100 counts per category, sorted so the premium-heavy categories lead. Audio's 2-over is the ceiling; five categories never break 100 dollars.",
    ask: "Pivot under/over-100 product counts per category, premium-heavy first.",
    template: `SELECT category,
       SUM(CASE WHEN {1} THEN 1 ELSE 0 END) AS under100,
       SUM(CASE WHEN {2} THEN 1 ELSE 0 END) AS over100
FROM products
GROUP BY category
ORDER BY {3};`,
    slots: [
      {
        answer: "price < 100",
        kind: "keyword",
        label: "the under test",
        why: "Under-100 counts: Electronics 3, Accessories 3, then the rest — 12 total.",
      },
      {
        answer: "price >= 100",
        kind: "keyword",
        label: "the over test",
        why: "Over-100 counts: Audio 2, Video 1, Wearables 1 — only 4 premium products.",
      },
      {
        answer: "over100 DESC, category",
        kind: "keyword",
        label: "the premium-first order",
        why: "Audio (2) leads, Video and Wearables (1 each) follow, then the zero rows alphabetically.",
      },
    ],
    distractors: ["price < 40", "price >= 150", "over100 ASC"],
    walkthrough:
      "Seven rows led by Audio 1/2, then Video 1/1, Wearables 1/1, and the zero-over categories: Electronics 3/0, Accessories 3/0, Apparel 2/0, Fitness 1/0. The composite sort — over100 DESC, then category — keeps ties stable so the map diffs cleanly between quarters. The two tests mirror at 100: no product sits exactly on the line, so all 16 land in one column. Sorting ASC buries the premium story at the bottom, and Apparel's premium zero — a category with no 100-dollar product at all — is the gap the map surfaces.",
  },
  {
    id: "cs-852",
    tier: "hard",
    topic: "s7",
    universe: "funnel",
    title: "The priority queue's lanes",
    brief:
      "From: Funnel analyst. Re: the collections board.\n\nThe board bands the pending queue into priority and standard lanes, four rows deep, with money per lane. All four rows land in priority — the board proves the queue's top is uniformly heavy.",
    ask: "Band pending orders by the 400 line with counts and money, top 4 rows.",
    template: `SELECT id, total,
       CASE WHEN {1} THEN {2}
       ELSE 'standard' END AS lane
FROM orders
WHERE status = 'pending'
ORDER BY CASE WHEN total >= 400 THEN 0 ELSE 1 END, total DESC
LIMIT {3};`,
    slots: [
      {
        answer: "total >= 400",
        kind: "keyword",
        label: "the priority test",
        why: "Five pendings clear 400 — the lane the desk works first.",
      },
      {
        answer: "'priority'",
        kind: "keyword",
        label: "the priority label",
        why: "The printed lane for 400-plus tickets — all four board rows.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the board depth",
        why: "Four rows: 1,088.44, 945.21, 725.34, 585.79 — all priority.",
      },
    ],
    distractors: ["total >= 700", "'rush'", "total < 400"],
    walkthrough:
      "Four rows: order 74 at 1,088.44, 43 at 945.21, 5 at 725.34, 97 at 585.79 — every one labeled priority. The tiered ORDER BY sorts pending money descending inside the priority band; the CASE in the SELECT prints the lane beside each row so the board reads without a legend. Raising the lane to 700 would push 585.79 and 576.54 into standard — the board would show the handoff the desk actually feels. This is CASE printing what another CASE sorts: one rule, two jobs.",
  },
  {
    id: "cs-853",
    tier: "hard",
    topic: "s7",
    universe: "fraud",
    title: "The stamp audit trio",
    brief:
      "From: Fraud analyst. Re: the dock reconciliation.\n\nThe reconciliation counts three things in one row: orders with no stamp, delivered orders with a stamp, and everything. The 21 - 14 - 7 = 0 closure is the audit's punchline.",
    ask: "Count unstamped, stamped-delivered and total orders in one row.",
    template: `SELECT COUNT(CASE WHEN {1} THEN 1 END) AS never,
       COUNT(CASE WHEN {2} THEN 1 END) AS delivered_gone,
       {3} AS all_orders
FROM orders;`,
    slots: [
      {
        answer: "shipped_at IS NULL",
        kind: "keyword",
        label: "the unstamped test",
        why: "21 orders carry no stamp — 14 pending plus 7 cancelled.",
      },
      {
        answer: "shipped_at IS NOT NULL AND status = 'delivered'",
        kind: "keyword",
        label: "the stamped-delivered test",
        why: "All 52 delivered orders carry a stamp — the AND never has to give one up.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the total counter",
        why: "COUNT(*) counts every row — 103 — unlike COUNT(column), which skips NULLs.",
      },
    ],
    distractors: ["shipped_at = NULL", "shipped_at IS NOT NULL", "SUM(*)"],
    walkthrough:
      "One row: never 21, delivered_gone 52, all_orders 103. The reconciliation closes: 21 unstamped decompose exactly into 14 pending plus 7 cancelled, and the 52 delivered all carry stamps — no delivered order ever lost its date. The compound AND test is the pivot's precision instrument: drop the shipped_at half and the count still reads 52 on this data, but the query would silently break the day a delivered order loses its stamp. shipped_at = NULL finds nothing, ever; SUM(*) is not SQL.",
  },
  {
    id: "cs-854",
    tier: "hard",
    topic: "s7",
    universe: "expense",
    title: "The spend ladder's money view",
    brief:
      "From: Finance partner. Re: the ladder's dollars.\n\nThe count ladder said major 15, minor 21. The money view flips the story: fifteen major filings carry more than double the minor spend. Same bands, different column.",
    ask: "Pivot count and dollars per major/minor expense band.",
    template: `SELECT CASE WHEN {1} THEN {2}
             ELSE 'minor' END AS band,
       COUNT(*) AS n, ROUND(SUM({3})/100.0, 2) AS money
FROM expenses
GROUP BY band;`,
    slots: [
      {
        answer: "amount_cents >= 100000",
        kind: "keyword",
        label: "the major cut",
        why: "The 1,000-dollar line splits 36 filings into 15 major and 21 minor.",
      },
      {
        answer: "'major'",
        kind: "keyword",
        label: "the major label",
        why: "The printed band for four-figure spend — fifteen filings strong.",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "the money column",
        why: "Major 18,480.00 against minor 6,936.00 — value hides in few filings.",
      },
    ],
    distractors: ["amount_cents >= 200000", "'big'", "vendor"],
    walkthrough:
      "Two rows: major 15 / 18,480.00, minor 21 / 6,936.00 — 25,416.00 total. The money column reframes the count ladder: minors outnumber majors 21 to 15 but carry barely a third of the dollars, so the ledger's weight sits in the rent-and-ads stack. Summing vendor would sum text — SQLite coerces it to 0.00 and the money column silently dies. Raising the cut to 2,000 dollars empties the major band entirely: the biggest single filing is 1,200.00 of rent.",
  },
  {
    id: "cs-855",
    tier: "hard",
    topic: "s7",
    universe: "supplier",
    title: "The vendor leaderboard",
    brief:
      "From: Sourcing lead. Re: the concentration check.\n\nThe check ranks suppliers by product count with a premium column beside it — and finds a four-way tie at the top. The tiebreak makes the page stable; the premium column makes it meaningful.",
    ask: "Rank suppliers by product count with a 100+ premium column, top 3.",
    template: `SELECT s.name, COUNT(p.id) AS products,
       SUM(CASE WHEN {1} THEN 1 ELSE 0 END) AS pricey
FROM suppliers s LEFT JOIN products p ON {2}
GROUP BY s.name
ORDER BY products DESC, s.name
LIMIT {3};`,
    slots: [
      {
        answer: "p.price >= 100",
        kind: "keyword",
        label: "the premium test",
        why: "Premium counts beside the leaders: Midwest 1, Nordic 2, Pacific 0.",
      },
      {
        answer: "p.supplier_id = s.id",
        kind: "keyword",
        label: "the join key",
        why: "LEFT JOIN keeps every vendor on the board even with zero products.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the board depth",
        why: "Three rows: Midwest Hardware 3/1, Nordic Gadgets 3/2, Pacific Textiles 3/0.",
      },
    ],
    distractors: ["p.price >= 250", "s.id", "5"],
    walkthrough:
      "Three rows: Midwest Hardware Co 3 products / 1 premium, Nordic Gadgets AB 3 / 2, Pacific Textiles 3 / 0 — a three-way tie broken alphabetically by name. The premium column is what makes the tie readable: Nordic's two 100-plus products outweigh Midwest's one, whatever the shared count says. LIMIT 5 would show the next tier — Shenzhen 3/0, then the two-product vendors. The composite ORDER BY is the tiebreak contract: counts first, names second, so the page never shuffles between runs.",
  },
  {
    id: "cs-856",
    tier: "hard",
    topic: "s7",
    universe: "month-close",
    title: "The open-bill gate",
    brief:
      "From: Controller. Re: the aging grid.\n\nThe aging grid pivots paid, open and void counts per month — then gates on open volume: only months carrying two or more open bills make the page. The 2025 rows fill it.",
    ask: "Pivot paid/open/void counts per month, months with 2+ open only.",
    template: `SELECT substr(issued_on, 1, 7) AS m,
       SUM(CASE WHEN status = {1} THEN 1 ELSE 0 END) AS paid_n,
       SUM(CASE WHEN status = {2} THEN 1 ELSE 0 END) AS open_n,
       SUM(CASE WHEN status = 'void' THEN 1 ELSE 0 END) AS void_n
FROM invoices
GROUP BY m
{3}
ORDER BY m;`,
    slots: [
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the paid column",
        why: "2025-01 paid 0, 2025-02 paid 1 — the new year barely collects.",
      },
      {
        answer: "'open'",
        kind: "keyword",
        label: "the open column",
        why: "Both gated months carry open_n 2 — the gate's threshold exactly.",
      },
      {
        answer: "HAVING open_n >= 2",
        kind: "keyword",
        label: "the aging gate",
        why: "Filters after the pivot: only 2025-01 and 2025-02 survive.",
      },
    ],
    distractors: ["status = 'due'", "status = 'void'", "WHERE open_n >= 2"],
    walkthrough:
      "Two rows: 2025-01 with 0/2/0, 2025-02 with 1/2/0 — the only months where open bills hit the gate. Every 2024 month fails it: their opens number zero or one, long since collected. HAVING on a pivot column is the pattern WHERE cannot express — open_n does not exist until the SUMs have run. Pin the open column to 'void' and the gate finds nothing: one void bill in the whole ledger, and no month ever carries two. The gate turns the grid from a history into a worklist.",
  },
  {
    id: "cs-857",
    tier: "hard",
    topic: "s7",
    universe: "pricing",
    title: "The queue band gate",
    brief:
      "From: Pricing analyst. Re: the band triage.\n\nThe triage bands orders small / mid / large, pivots pending against delivered per band — then gates on the pending column. The large band survives with five queued; the small band drops out entirely.",
    ask: "Pivot pending vs delivered counts per band, queued bands only.",
    template: `SELECT CASE WHEN {1} THEN 'small'
             WHEN total < 500 THEN 'mid'
             ELSE 'large' END AS band,
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
       SUM(CASE WHEN {2} THEN 1 ELSE 0 END) AS delivered
FROM orders
GROUP BY band
{3}
ORDER BY band;`,
    slots: [
      {
        answer: "total < 100",
        kind: "keyword",
        label: "the small cut",
        why: "The small band's zero pending is exactly why it drops off the page.",
      },
      {
        answer: "status = 'delivered'",
        kind: "keyword",
        label: "the delivered test",
        why: "Delivered per surviving band: large 9, mid 35.",
      },
      {
        answer: "HAVING pending > 0",
        kind: "keyword",
        label: "the queue gate",
        why: "Filters bands after aggregation — small (0 pending) vanishes.",
      },
    ],
    distractors: ["total < 150", "status = 'shipped'", "WHERE pending > 0"],
    walkthrough:
      "Two rows: large 5 pending / 9 delivered, mid 9 / 35 — the small band's 0-pending row is gated out. The gate inverts the usual risk reading: this page shows where work is queued, not where money is safe; small orders never queue because they ship immediately. HAVING reads the pending column the pivot just built; WHERE pending > 0 is a syntax error because WHERE runs before the column exists. Loosen the small cut to 150 and the bands re-form — mid shrinks, small grows — before the gate even fires.",
  },
  {
    id: "cs-858",
    tier: "hard",
    topic: "s7",
    universe: "inventory",
    title: "The balanced books page",
    brief:
      "From: Controller. Re: the balance proof.\n\nThe proof pivots monthly debit and credit dollars, newest first. Every page shows debits equal to credits — the equality that means the books close, month after month.",
    ask: "Pivot monthly debit vs credit dollars, newest 3 months.",
    template: `SELECT substr(entry_date, 1, 7) AS m,
       ROUND(SUM(CASE WHEN {1} THEN debit_cents ELSE 0 END)/100.0, 2) AS debits,
       ROUND(SUM(CASE WHEN {2} THEN credit_cents ELSE 0 END)/100.0, 2) AS credits
FROM ledger_entries
GROUP BY m
ORDER BY m DESC
LIMIT {3};`,
    slots: [
      {
        answer: "debit_cents > 0",
        kind: "keyword",
        label: "the debit test",
        why: "Debit dollars per month: 16,838.00, 18,921.00, 15,930.00 on the page.",
      },
      {
        answer: "credit_cents > 0",
        kind: "keyword",
        label: "the credit test",
        why: "Credit dollars match month for month — 16,838.00, 18,921.00, 15,930.00.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the page size",
        why: "Three months to a page, newest first: 2025-02, 2025-01, 2024-12.",
      },
    ],
    distractors: ["debit_cents < 0", "credit_cents < 0", "entry_date IS NULL"],
    walkthrough:
      "Three rows: 2025-02 debits 16,838.00 / credits 16,838.00, 2025-01 18,921.00 / 18,921.00, 2024-12 15,930.00 / 15,930.00. Debits equal credits in every month — double-entry's promise, verified per period by a pivot. The side tests are strict inequalities on purpose: entries carry cents on exactly one side, so > 0 routes each entry without overlap. Negative-cent tests route nothing and the page prints zeros — balanced books by being empty, the one reconciliation no controller wants to see.",
  },
  {
    id: "cs-859",
    tier: "hard",
    topic: "s7",
    universe: "month-close",
    title: "The two-account close",
    brief:
      "From: Controller. Re: the AR reconciliation.\n\nThe reconciliation isolates the money pipeline — cash and receivables — and pivots each account's two sides, biggest debit flow first. AR on top, cash beneath: money's journey, in two rows.",
    ask: "Pivot debit/credit dollars for cash and AR, biggest debits first.",
    template: `SELECT account,
       ROUND(SUM(CASE WHEN {3} THEN debit_cents ELSE 0 END)/100.0, 2) AS debits,
       ROUND(SUM(CASE WHEN credit_cents > 0 THEN {1} ELSE 0 END)/100.0, 2) AS credits
FROM ledger_entries
WHERE {2}
GROUP BY account
ORDER BY debits DESC;`,
    slots: [
      {
        answer: "credit_cents",
        kind: "keyword",
        label: "the credit payout",
        why: "Credits per account: AR 69,612.00, cash 25,416.00.",
      },
      {
        answer: "account IN ('cash', 'accounts_receivable')",
        kind: "keyword",
        label: "the account gate",
        why: "Two accounts make the pipeline: what customers owe and what they paid.",
      },
      {
        answer: "debit_cents > 0",
        kind: "keyword",
        label: "the debit test",
        why: "Debits per account: AR 86,052.00, cash 69,612.00 — the flow order's keys.",
      },
    ],
    distractors: ["credit_cents > 0", "account = 'cash'", "debits ASC"],
    walkthrough:
      "Two rows: accounts_receivable 86,052.00 / 69,612.00, cash 69,612.00 / 25,416.00. The reconciliation is the reading: AR's credits (money collected) equal cash's debits (money received) — 69,612.00 crossing accounts exactly. The IN gate keeps the pipeline tight; revenue and opex would muddy a page meant to trace one flow. Ordering ASC flips the page and hides theAR-first story; paying debit_cents into the credit column would print AR's debits twice and break the crossing.",
  },
  {
    id: "cs-860",
    tier: "hard",
    topic: "s7",
    universe: "expense",
    title: "June's fixed-and-variable row",
    brief:
      "From: Finance partner. Re: the cost-behavior tile.\n\nThe tile sorts June's spend by behavior: fixed (rent plus tools) against variable (ads plus travel). One month, one row — fixed costs the month 1,200.00 and variable costs it 310.00.",
    ask: "Pivot June 2024 spend into fixed vs variable dollars.",
    template: `SELECT substr(spent_on, 1, 7) AS m,
       ROUND(SUM(CASE WHEN {1} THEN amount_cents ELSE 0 END)/100.0, 2) AS fixed,
       ROUND(SUM(CASE WHEN {2} THEN amount_cents ELSE 0 END)/100.0, 2) AS variable
FROM expenses
WHERE substr(spent_on, 1, 7) = {3}
GROUP BY m;`,
    slots: [
      {
        answer: "category IN ('Rent', 'Tools')",
        kind: "keyword",
        label: "the fixed test",
        why: "June fixed spend: rent 1,200.00, no tools that month.",
      },
      {
        answer: "category IN ('Ads', 'Travel')",
        kind: "keyword",
        label: "the variable test",
        why: "June variable spend: 310.00 of ads, no travel.",
      },
      {
        answer: "'2024-06'",
        kind: "keyword",
        label: "the month gate",
        why: "June's slice: the tile pins one month instead of paging the year.",
      },
    ],
    distractors: ["category = 'Tools'", "category = 'Travel'", "'2025-01'"],
    walkthrough:
      "One row: 2024-06 fixed 1,200.00, variable 310.00. The IN lists encode cost behavior — rent is contractually fixed, tools ride with headcount, ads and travel flex with the calendar. June is a clean teaching month: no tools filing and no travel filing, so each column carries exactly one category's money. Shrink the fixed list to rent alone and June's row barely changes — that is the point of a clean month — but repoint the gate at 2025-01 and variable jumps to 430.00 with rent still flat at 1,200.00.",
  },
];
