// Case batch B4b — topic l4 (NULL handling), ids cs-082…cs-090.
// Authored against the seed db facts in scripts/facts/l4.json: 21 orders with
// no dispatch stamp worth 7,265.49, 82 confirmed-dispatched worth 27,567.79,
// and the = NULL trap that silently returns nothing.

import type { CaseStudy } from "./types";

export const casesB4b: CaseStudy[] = [
  {
    id: "cs-082",
    topic: "l4",
    universe: "fraud",
    title: "Big tickets with no dispatch confirmation",
    brief:
      "From: Risk team, spot-check rotation.\n\nOur sweep policy says any large order still lacking a dispatch confirmation gets pulled for manual review before the money moves. The warehouse leaves the dispatch stamp blank until goods physically leave the building, so a blank stamp means live, unverified exposure. Pull the review list — order number and value — for everything above 500.",
    ask: "Order id and total for every order with no dispatch date whose total is greater than 500.",
    template: `SELECT id, total
FROM orders
WHERE shipped_at {1} {2} AND total > {3};`,
    slots: [
      {
        answer: "IS",
        kind: "keyword",
        label: "the emptiness test",
        why: "Blank dispatch stamps are found with IS NULL. The tempting shipped_at = NULL looks symmetric but evaluates to unknown for every row and silently returns an empty list.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the blank marker",
        why: "NULL is what sits in shipped_at until the warehouse confirms dispatch — IS NULL selects exactly the rows still waiting for that stamp.",
      },
      {
        answer: "500",
        kind: "number",
        noVerify: true,
        label: "the value threshold",
        why: "The sweep policy pulls anything above 500 — strictly greater, so an order worth exactly 500.00 would stay off the review list.",
      },
    ],
    distractors: ["=", "NOT NULL", "IS NOT NULL", "300", "0"],
    walkthrough:
      "The ask is a review list, not a count: order number and value, filtered two ways. The first filter is the data-hygiene one — no dispatch confirmation — and the only correct emptiness test is IS NULL; write = NULL instead and the comparison comes back unknown for every row, the query 'succeeds', and you hand the risk team an empty list while 21 unconfirmed orders sit out there. The second filter is the policy bar, total > 500. Run it and five tickets qualify: order 1 at 576.54, order 5 at 725.34, order 43 at 945.21, order 74 at 1,088.44 and order 97 at 585.79. Worth flagging upstream: all five are still pending, so nothing has left the building and every one is reviewable before it ships.",
  },
  {
    id: "cs-083",
    topic: "l4",
    universe: "inventory",
    title: "Open picks with no dispatch stamp",
    brief:
      "From: Warehouse ops manager. Re: morning dispatch huddle.\n\nOn my board an order stays 'open' until dispatch is confirmed and the stamp lands. Before I allocate today's pickers I need the size of the backlog: how many orders are sitting there with no dispatch confirmation at all? One headcount is enough — the item-level detail comes later.",
    ask: "Count of orders that have no dispatch timestamp on file.",
    template: `SELECT {1}(*) AS awaiting_dispatch
FROM orders
WHERE shipped_at {2} {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the row-counting aggregate",
        why: "The deliverable is a headcount of orders, so COUNT(*) — SUM would try to add up the asterisk and fail, and AVG over rows means nothing.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the emptiness operator",
        why: "You cannot write shipped_at = NULL: that comparison is unknown for every row and returns nothing. Emptiness is tested with IS, which handles NULL directly.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the blank marker",
        why: "shipped_at IS NULL is the exact predicate for 'the warehouse has not confirmed dispatch yet' — precisely the backlog the ops manager wants counted.",
      },
    ],
    distractors: ["SUM", "AVG", "=", "NOT NULL", "IS NOT NULL"],
    walkthrough:
      "This is the smallest possible backlog question: one number. The state definition does the work — an order with no dispatch confirmation has an empty shipped_at, and IS NULL is the only predicate that finds it. The classic = NULL trap deserves a beat: it runs without error, returns zero rows, and the huddle would open with 'nothing in the queue' while the real backlog is 21 orders. And the flip side matters too — IS NOT NULL counts the orders that DID get a stamp (82 of them), the opposite set. Run the correct fill and the answer is 21. Cross-check worth knowing: those 21 are exactly the 14 pending plus the 7 cancelled orders, because a stamp only ever lands when goods actually leave.",
  },
  {
    id: "cs-084",
    topic: "l4",
    universe: "funnel",
    title: "Dispatch-confirmed share of all orders",
    brief:
      "From: Growth marketing lead. Re: funnel hygiene check.\n\nI report 'orders placed' every week, but a slice of those are still waiting for the warehouse to confirm dispatch — until the stamp lands I can't call them fulfilled. For the funnel review I want one row that shows both sides honestly: every order logged in the period, and next to it how many of those records already carry a dispatch timestamp.",
    ask: "One row showing the count of all orders and, next to it, the count of orders that have a dispatch timestamp.",
    template: `SELECT COUNT(*) AS all_orders,
       {1}(shipped_at) {2} dispatched
{3} orders;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the timestamp-counting aggregate",
        why: "COUNT(shipped_at) counts only the rows where the stamp exists — the blank rows are skipped. That contrast with COUNT(*), which counts every row, is the whole point of the two columns.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the column alias",
        why: "AS names the second column 'dispatched' so the report reads cleanly; without it the header would be the raw function text COUNT(shipped_at).",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "Both numbers come straight off the order ledger, so FROM orders — no second table is involved in this single read.",
      },
    ],
    distractors: ["SUM", "MAX", "MIN", "GROUP"],
    walkthrough:
      "Two counts, one row, zero filters — and the entire lesson hides in the argument. COUNT(*) counts rows, period: all 103 orders ever logged. COUNT(shipped_at) counts values: it skips the rows where shipped_at is blank, landing on 82. The 21-row gap between them is exactly the unconfirmed-dispatch backlog — about one order in five isn't fulfillment-ready yet. Swap the slotted aggregate for SUM or MIN and the 'count' stops being a count at all: you'd get a nonsensical number or a raw timestamp string where 82 belongs. This two-column pattern is my favourite data-quality check: when COUNT(col) drifts below COUNT(*), some records are missing the field the process is supposed to stamp.",
  },
  {
    id: "cs-085",
    topic: "l4",
    universe: "supplier",
    title: "Unconfirmed orders split by status",
    brief:
      "From: Supply-chain lead. Re: carrier commitment review.\n\nOur carriers bill against volume commitments, and I suspect part of what we count as 'in flight' is actually dead weight. Every order without a dispatch confirmation is either still pending or already cancelled — I need the split so I know how much of the backlog is genuinely moving versus quietly dead. Status name and a count per status, nothing else.",
    ask: "For orders with no dispatch date, show each status and how many orders sit in it.",
    template: `SELECT status, {1}(*) AS open_orders
FROM orders
WHERE shipped_at {2} {3}
{4} BY status
{5} BY status;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the per-bucket counter",
        why: "A headcount per status needs COUNT(*) — SUM(*) is not valid SQL and AVG over rows is meaningless. COUNT skips nothing here; the filter has already chosen the rows.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the emptiness operator",
        why: "The backlog is defined by a blank stamp, and blank is tested with IS NULL — writing = NULL evaluates to unknown for every row and the split would come back empty.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the unconfirmed marker",
        why: "shipped_at IS NULL marks the orders the warehouse has never confirmed as dispatched — the population the carrier review is about.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "One output row per status requires GROUP BY status — without it the 21 rows collapse into a single undifferentiated count.",
      },
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the sort clause",
        why: "ORDER BY status fixes the row order (cancelled first, then pending) so the report comes back the same way on every run.",
      },
    ],
    distractors: ["SUM", "AVG", "=", "NOT NULL", "WHERE", "DESC"],
    walkthrough:
      "Read the ask as 'count the limbo population, broken down by status'. The WHERE clause defines the population — no dispatch stamp, so IS NULL, never = NULL, which would match nothing and report an empty ledger. GROUP BY status then builds one bucket per status value and COUNT(*) sizes each. The split lands cleanly: cancelled 7, pending 14 — the 21 unconfirmed orders total. Two insights fall out. First, all 7 cancelled orders on file are unconfirmed, because a stamp only ever lands when goods leave — cancellations never ship. Second, the 14 pending orders are the genuinely moving backlog; the cancelled 7 should be excluded from any carrier volume commitment conversation.",
  },
  {
    id: "cs-086",
    topic: "l4",
    universe: "expense",
    title: "What the unconfirmed backlog is worth",
    brief:
      "From: Ops finance, spend owner. Re: working-capital snapshot.\n\nMoney committed to orders the warehouse has not confirmed as dispatched is still our exposure — we can't reconcile any of it against deliveries yet. Size the exposure two ways for my pack: the total value sitting in that unconfirmed state, and the typical (average) size of an order in it, both rounded so the deck stays tidy.",
    ask: "One row with the total value and the average order value across orders that have no dispatch date, both rounded to 2 decimals.",
    template: `SELECT ROUND({1}(total), 2) AS open_value,
       ROUND({2}(total), 2) AS avg_open
FROM orders
WHERE shipped_at {3} {4};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the total-value aggregate",
        why: "Total exposure means every total added together — SUM. COUNT would answer 21, a headcount, where finance expects a money figure.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the typical-size aggregate",
        why: "'Typical size' is the mean — AVG(total). MAX or MIN would report one extreme order, not the typical one, and distort the snapshot.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the emptiness test",
        why: "The unconfirmed state is a blank stamp, tested with IS NULL. Writing = NULL evaluates unknown everywhere and both money figures would come back empty.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the unconfirmed marker",
        why: "NULL marks the orders awaiting the warehouse dispatch confirmation — exactly the exposure the spend owner is sizing.",
      },
    ],
    distractors: ["COUNT", "MAX", "MIN", "=", "0"],
    walkthrough:
      "One filter, two aggregates. The filter is the accounting state: no dispatch confirmation, so shipped_at IS NULL — and if the = NULL trap slips in, the query runs 'fine' and reports the exposure as nothing, which is the most dangerous kind of wrong answer. Over the surviving rows, SUM(total) adds up the exposure: 7,265.49 across 21 orders. AVG(total) divides by those same 21 rows: 345.98 per order, which lands in a credible ticket range once you glance at the ledger. The decoys to refuse: COUNT would read as 21 — a headcount dressed up as money — and MAX would show 1,088.44, the single biggest ticket, not the typical one. For the working-capital story, both cells matter: the sum sizes the reserve, the average makes it feel real.",
  },
  {
    id: "cs-087",
    topic: "l4",
    universe: "catalog",
    title: "First five records missing dispatch stamps",
    brief:
      "From: Catalog content manager. Re: order-ledger records audit.\n\nI'm running a data-hygiene pass over the order ledger and want to eyeball the records whose dispatch stamp never landed — lowest record numbers first, five at a time so each audit pass stays reviewable. Send me the order id, the customer, the value and the order date for the first five of those records.",
    ask: "Order id, customer id, total and order date for the 5 lowest-numbered orders with no dispatch timestamp.",
    template: `SELECT id, customer_id, total, created_at
FROM orders
WHERE shipped_at {1} {2}
{3} BY id
{4} {5};`,
    slots: [
      {
        answer: "IS",
        kind: "keyword",
        label: "the emptiness test",
        why: "Records with a blank stamp are found with IS NULL — the tempting = NULL comparison is unknown for every row and would list nothing at all.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the missing-stamp marker",
        why: "NULL is the placeholder for 'warehouse never confirmed dispatch' — exactly the records the hygiene audit wants to eyeball.",
      },
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the record-ordering clause",
        why: "ORDER BY id lines the records up lowest-number-first, so 'first five' is deterministic instead of whatever order the storage engine fancies.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the row cap",
        why: "LIMIT trims the output to the first rows after sorting — it is what turns 'the whole backlog' into a reviewable first batch.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the audit batch size",
        why: "The audit reviews five records per pass — the cap the content manager asked for, no more and no fewer.",
      },
    ],
    distractors: ["=", "NOT NULL", "IS NOT NULL", "WHERE", "3"],
    walkthrough:
      "An audit list has three jobs: pick the right rows, order them, cap them. Picking means the blank stamps — IS NULL, because = NULL quietly matches nothing and would hand back an empty audit with no error to warn you. Ordering means ORDER BY id so 'first five' means something stable. Capping means LIMIT 5, applied after the sort, so you truly get the five lowest-numbered records. They come back as: order 1 (576.54, placed 2024-01-05), order 5 (725.34, 2024-01-02), order 7 (152.52, 2024-01-02), order 12 (148.28, 2024-02-07) and order 19 (317.49, 2024-03-05). Notice the stamp never landed on any of them even though some date back to January — that aging is exactly what the audit exists to catch.",
  },
  {
    id: "cs-088",
    topic: "l4",
    universe: "month-close",
    title: "Value confirmed out the door",
    brief:
      "From: Financial Controller. Re: January close, second pass.\n\nLast cycle I held back everything without a dispatch confirmation; this time I want the mirror number. Orders whose dispatch stamp is filled in are the ones the warehouse vouches for — that is the value I can safely treat as moved. Give me one figure: the total value across orders that do carry a dispatch timestamp.",
    ask: "Sum of totals across every order that has a dispatch timestamp on file.",
    template: `SELECT {1}(total) AS confirmed_value
FROM orders
WHERE shipped_at {2} {3} {4};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the money aggregate",
        why: "One money figure across many rows — SUM(total). COUNT would answer with a headcount (82) and AVG with a mean, neither of which is 'value confirmed'.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the comparison operator",
        why: "IS is what lets a predicate speak about NULL at all — combined with NOT it turns into the 'has a value' test the controller needs.",
      },
      {
        answer: "NOT",
        kind: "keyword",
        label: "the negation",
        why: "NOT flips the test: IS NOT NULL keeps the rows where the stamp exists — the exact mirror image of the limbo filter that held value back last cycle.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the stamp placeholder",
        why: "The whole split hinges on this placeholder: filled means dispatched and vouched for, blank means held. IS NOT NULL is the only correct 'is filled' test.",
      },
    ],
    distractors: ["AVG", "COUNT", "MAX", "MIN", "="],
    walkthrough:
      "This is the close's other side of the ledger. Last pass the question was what to hold back; this one asks what the warehouse actually vouches for — rows where the dispatch stamp is filled, which in SQL is IS NOT NULL. The NOT is doing real work: without it the filter selects the opposite set and the number quietly becomes the limbo figure instead. The aggregate is SUM for one money figure. It lands at 27,567.79 across 82 orders. The closure check that makes the controller sign: 27,567.79 confirmed plus 7,265.49 held back equals 34,833.28 — the full book. If those three numbers don't reconcile, a row got filtered twice or missed entirely.",
  },
  {
    id: "cs-089",
    topic: "l4",
    universe: "growth",
    title: "How old is the unconfirmed backlog",
    brief:
      "From: Chief of Staff. Re: ops slide for the board deck.\n\nBefore the board asks whether the dispatch backlog is aging or just normal churn, I want the answer on one slide. Take the orders that still have no dispatch confirmation, group them by the month they were placed, oldest month first, and count each month. If the old months carry real counts we have a stagnation story; if it's all recent months, it's just flow.",
    ask: "For orders with no dispatch timestamp, show the placement month and how many such orders were placed in it, oldest month first.",
    template: `SELECT strftime('%Y-%m', created_at) {1} month,
       COUNT(*) AS open_orders
FROM orders
WHERE shipped_at {2} {3}
{4} BY month
{5} BY month;`,
    slots: [
      {
        answer: "AS",
        kind: "keyword",
        label: "the month alias",
        why: "AS names the computed column 'month', which both the slide header and the GROUP BY that follows refer to — the query reads like its own documentation.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the backlog test",
        why: "The backlog is defined by emptiness: IS NULL. The = NULL spelling would silently match nothing and the slide would show no months at all.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the unconfirmed marker",
        why: "No dispatch stamp means the order is still unconfirmed — the population being aged month by month.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "One row per placement month requires GROUP BY month — without it the 21 orders collapse into one count and the aging shape disappears.",
      },
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the aging order",
        why: "ORDER BY month puts the oldest bucket first — the aging story depends on that direction, and DESC would hide it.",
      },
    ],
    distractors: ["COUNT", "=", "NOT NULL", "WHERE", "DESC"],
    walkthrough:
      "The aging question is a grouping question: bucket the unconfirmed orders by the month they were placed, count each bucket, oldest first. strftime slices created_at down to 'YYYY-MM', AS names it so GROUP BY month can refer to it, and the WHERE clause keeps only the rows with no dispatch stamp — IS NULL, because = NULL would return no buckets at all while looking perfectly valid. The shape that comes back spans ten months: 2024-01 has 3, 2024-02 has 1, 2024-03 has 3, 2024-06 has 2, 2024-07 has 3, 2024-10 has 2, 2024-11 has 3, 2024-12 has 1, 2025-01 has 2, 2025-02 has 1 — 21 in total. The board takeaway: 7 of the 21 have been unconfirmed since the first half of 2024, so part of this backlog is genuinely stuck, not just churn.",
  },
  {
    id: "cs-090",
    topic: "l4",
    universe: "refund-audit",
    title: "Cancelled and never dispatched",
    brief:
      "From: refunds@ internal ticket #4487.\n\nQuarter-end goodwill review, part two. We refund cancelled orders as a matter of policy, but the ones that also never left the building are the cleanest cases — no carrier claim, no partial-shipment argument, money simply comes back. Queue-size it for me: how many cancelled orders carry no dispatch confirmation at all?",
    ask: "Count the cancelled orders that have no dispatch timestamp on file.",
    template: `SELECT {1}(*) AS refund_queue
FROM orders
WHERE status = {2} AND shipped_at {3} {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the queue-size aggregate",
        why: "A queue size is a row count — COUNT(*). SUM or AVG would try to do arithmetic on rows and fail or produce a meaningless number.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status value",
        why: "The ticket targets cancelled orders, and status values wear quotes: 'cancelled'. Bare cancelled would be read as a column name and the query would error.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the emptiness test",
        why: "The never-dispatched condition is a blank stamp, tested with IS NULL. Writing = NULL matches nothing and would report a conveniently empty queue.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the never-shipped marker",
        why: "No dispatch stamp means the order never left the warehouse — precisely the clean-refund condition the ticket defines.",
      },
    ],
    distractors: ["'pending'", "'shipped'", "'delivered'", "=", "NOT NULL"],
    walkthrough:
      "Two conditions must both hold, so they join with AND: the order was cancelled, and it never got a dispatch stamp. The first is a plain value comparison — status = 'cancelled', quotes included or SQL reads it as a column. The second is the emptiness test, and here the = NULL trap would be expensive in the wrong direction: it matches nothing, reports an empty refund queue, and the goodwill cases quietly never get paid. Run it correctly and the answer is 7. The supporting fact that builds confidence: every single cancelled order on file lacks a stamp (7 cancelled, 0 stamped) — cancellations never ship, so the two conditions are perfectly aligned. The other 14 blank rows are pending, not refund cases, which is why the status filter matters.",
  },
];
