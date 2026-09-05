// Case batch B4a — topic l4 (NULL handling), ids cs-072..cs-081.
// Every case hinges on the one NULL-bearing column in the seed db:
// orders.shipped_at, empty until the warehouse confirms dispatch.
// Figures are audited against scripts/facts/l4.json by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesB4a: CaseStudy[] = [
  {
    id: "cs-072",
    topic: "l4",
    universe: "fraud",
    title: "Orders nobody can vouch for",
    brief:
      "From: Risk team, spot-check rotation.\n\nA chargeback claim came in and step one is always the same: could the goods have left the building at all? Our ledger leaves the dispatch column empty until the warehouse confirms handover, so rows with no date there are the ones nobody can vouch for either way. Before the call with the processor I need the size of that pool — one number.",
    ask: "Count how many orders currently have no dispatch timestamp on file.",
    template: `SELECT {1}(*) AS unvouched
FROM orders
WHERE shipped_at {2} {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The ask is a headcount of rows, so the aggregate is COUNT. SUM would choke on the '*' and AVG would return a mean nobody requested.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the NULL operator",
        why: "NULL cannot be compared with =; the engine reads shipped_at = NULL as unknown-vs-unknown and matches nothing. IS is the operator that tests emptiness directly.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty marker",
        why: "shipped_at IS NULL finds every row waiting on a warehouse stamp. The tempting NOT NULL would select the opposite pile — the orders that did leave.",
      },
    ],
    distractors: ["SUM", "=", "NOT NULL", "0"],
    walkthrough:
      "The ask is a headcount of rows the warehouse never confirmed, so COUNT(*) over a WHERE shipped_at IS NULL filter. The operator pair is the whole lesson: NULL is not a value, so shipped_at = NULL evaluates to unknown on every row and returns an empty set — the classic silent zero. IS NULL is the only test that actually finds the blanks. The count lands at 21 orders nobody can vouch for. Cross-check worth knowing: that pool is exactly the 14 pending plus the 7 cancelled orders, because a dispatch stamp only ever lands on orders that truly left the building.",
  },
  {
    id: "cs-073",
    topic: "l4",
    universe: "inventory",
    title: "Stamps on the dispatch ledger",
    brief:
      "From: Warehouse ops manager. Re: dock audit prep.\n\nBefore the physical count I need to reconcile the order book against my conveyor logs. Every order row exists from the moment checkout fires, but the dispatch stamp only lands when my team scans a parcel out. Put both sides of that gap on one line: everything ever booked, and how many of those rows actually carry a scan stamp.",
    ask: "One row with the total number of orders and the number that have a dispatch timestamp filled in.",
    template: `SELECT {1} AS all_orders,
       {2} AS stamped
FROM {3};`,
    slots: [
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the every-row counter",
        why: "COUNT(*) counts every row regardless of contents — all 103 orders ever booked. The (*) matters: it means rows, not values in some column.",
      },
      {
        answer: "COUNT(shipped_at)",
        kind: "keyword",
        label: "the stamp counter",
        why: "COUNT over a column skips NULLs, so this is the honest stamp count: 82. Plain COUNT alone is not a complete call, and swapping the argument back to * would erase the lesson by returning 103 again.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Order rows and their dispatch stamps live in orders. products and order_items have no shipped_at column at all, so the query would fail outright.",
      },
    ],
    distractors: ["COUNT", "SUM(shipped_at)", "products", "order_items"],
    walkthrough:
      "Two counters, one table, no filter — the story is entirely the difference between the arguments. COUNT(*) counts rows: all 103 orders ever booked. COUNT(shipped_at) counts rows where the stamp exists: 82. Same function, 21 apart, and that gap of 21 is the dock audit's to-do list. The trap to respect: COUNT(col) skips NULLs silently, so it is the honest 'how many are really stamped' number while COUNT(*) is the honest 'how many exist' number. If those two ever agree, either every order shipped or something upstream is broken.",
  },
  {
    id: "cs-074",
    topic: "l4",
    universe: "funnel",
    title: "What actually left the funnel",
    brief:
      "From: Growth marketing lead. Re: funnel readout.\n\nI report 'dispatched' as the true bottom of the funnel — a checkout that never ships is a refund waiting to happen, not a conversion. The dashboard counts everything with a pulse, so I want the honest slice for once: orders that carry a dispatch confirmation, and the money riding on them, to the cent.",
    ask: "One row with the count of dispatched orders and their combined value, rounded to 2 decimals.",
    template: `SELECT COUNT(*) AS dispatched,
       ROUND({1}(total), {2}) AS dispatched_value
FROM {3}
WHERE shipped_at {4} {5};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the value aggregate",
        why: "The second cell is money on dispatched orders, so SUM adds their totals. COUNT would return 82 again and AVG would shrink it to a mean.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the rounding precision",
        noVerify: true,
        why: "ROUND's second argument is the number of decimals the slide needs — 2 for cents. 0 would publish 27,568 and look careless.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Dispatch stamps live on order rows; no other table in the schema carries shipped_at.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the NULL operator",
        why: "Even on the positive side you still test with IS: shipped_at IS NOT NULL. An = here collides with the NOT that follows and falls apart.",
      },
      {
        answer: "NOT NULL",
        kind: "keyword",
        label: "the presence test",
        why: "The presence test keeps rows that HAVE a stamp. IS NULL would select exactly the wrong 21 rows — the limbo pile instead of the dispatched book.",
      },
    ],
    distractors: ["AVG", "COUNT", "0", "=", "NULL"],
    walkthrough:
      "The funnel's honest bottom is 'dispatched', and the ledger encodes that as a non-empty shipped_at, so the predicate flips to IS NOT NULL — the mirror image of the limbo test. COUNT(*) sizes the slice: 82 orders. SUM(total) prices it: 27,567.79, which is 336.19 per dispatched order on average. I keep COUNT and SUM in one query so the two cells can never disagree about which rows they saw. Worth remembering for the readout: 21 booked orders are NOT in this number — anything still waiting on a warehouse stamp is excluded by the NOT NULL, deliberately.",
  },
  {
    id: "cs-075",
    topic: "l4",
    universe: "supplier",
    title: "Heavy orders still on the dock",
    brief:
      "From: Supply-chain lead. Re: carrier capacity review.\n\nFriday's carrier review decides where premium freight goes, and the only honest backlog is orders still missing a dispatch confirmation — those are physically mine to move. The upgrade fee only pays for itself on the big tickets, so count the heavy ones above 500 and tell me what the largest of them is worth.",
    ask: "Among orders with no dispatch date, count those worth more than 500 and show the biggest one's value.",
    template: `SELECT {1}(*) AS big_backlog,
       ROUND({2}(total), 2) AS biggest_ticket
FROM orders
WHERE shipped_at {3} {4} AND total > {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the queue counter",
        why: "How many heavy orders we hold is a row count: COUNT(*). SUM cannot take '*' and MAX cannot count — the first cell is purely a headcount.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the peak aggregate",
        why: "The biggest ticket in the filtered set is MAX(total). SUM would report the pile's combined value (well over 2,500) and MIN the smallest — neither is the peak.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the NULL operator",
        why: "The dock test is emptiness, and IS is the only operator that can express it; = reads as unknown against NULL and matches nothing at all.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty marker",
        why: "shipped_at IS NULL selects exactly the unconfirmed rows. NOT NULL would flip the query to the 82 dispatched orders and answer a different question entirely.",
      },
      {
        answer: "500",
        kind: "number",
        label: "the premium-freight bar",
        noVerify: true,
        why: "The brief's bar for premium freight: total > 500, strictly. An order worth exactly 500.00 would miss the cut, and a lower bar would sweep in small parcels the fee cannot justify.",
      },
    ],
    distractors: ["SUM", "MIN", "=", "NOT NULL", "300", "5000"],
    walkthrough:
      "Two deliverables, one filter set: no dispatch stamp, and worth more than 500. The emptiness test is IS NULL — I will not write = NULL, which matches nothing and would report an empty dock. COUNT(*) sizes the premium-freight queue: 5 orders. MAX(total) names the peak exposure: 1,088.44 — the single biggest open order in the whole book, sitting unshipped. Knowing there are only 5 heavy tickets, I would reserve the carrier upgrade for those and let the small ones ride the standard schedule; the threshold is doing real triage work here.",
  },
  {
    id: "cs-076",
    topic: "l4",
    universe: "expense",
    title: "The report that came back empty",
    brief:
      "From: Ops finance, spend control.\n\nA spend report landed on my desk this morning showing zero open order value, while the dock is visibly holding goods. I found the bug: whoever wrote it tested the empty dispatch column against nothing with a plain equals sign, and our database reads that as 'never true', so every blank row vanished from the report. Rebuild it properly — how many open orders are we carrying, and what are they worth together?",
    ask: "Count the orders with no dispatch date and sum their total value, rounded to 2 decimals.",
    template: `SELECT {1}(*) AS open_orders,
       ROUND({2}(total), {3}) AS open_value
FROM orders
WHERE shipped_at {4} {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the row counter",
        why: "The first cell is how many orders are open: COUNT(*). SUM cannot count rows and AVG would give a mean — the count and the value are two different questions.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the value aggregate",
        why: "Combined value is SUM(total). AVG would water it down to 345.98 per order and COUNT would report 21 again — the cells must not duplicate each other.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the rounding precision",
        noVerify: true,
        why: "Money rounds to cents: ROUND(..., 2). With 0 the cell would read 7,265 and the reconciliation would be off by pennies.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the NULL operator",
        why: "The fix for the broken report: emptiness is tested with IS. The equals sign is precisely what made the original report come back empty.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty marker",
        why: "The marker the original query was missing. shipped_at IS NULL is the only predicate the engine treats as 'this cell is blank'.",
      },
    ],
    distractors: ["AVG", "=", "NOT NULL", "0"],
    walkthrough:
      "This report earns its keep because the first version lied. The analyst wrote shipped_at = NULL, and in SQL that is 'unknown equals unknown' — true for no row — so the spreadsheet showed zero open orders and zero value while the dock held real goods. The fix is IS NULL, the only emptiness test the engine respects. Rebuilt correctly: 21 open orders worth 7,265.49 combined, an average of 345.98 each. Reconciliation note for the spend owner: that 7,265.49 is the value the month-close will hold out of shipped revenue until the warehouse stamps it.",
  },
  {
    id: "cs-077",
    topic: "l4",
    universe: "catalog",
    title: "Sizing the stuck pile before the walk",
    brief:
      "From: Catalog content manager. Re: dispatch calendar cleanup.\n\nThe fulfillment calendar I keep has gone stale: order rows have sat with an empty dispatch slot since winter and nobody has claimed them. Before I pull anyone off the floor for a physical walk, I want the scale of the pile — how many bookings are stuck without a stamp, and the biggest single value among them so we know the worst-case exposure we'd be chasing. One row, two numbers, then we decide stuck, lost, or cancelled.",
    ask: "One row: the count of orders with no dispatch date, plus the largest total among them, rounded to 2 decimals.",
    template: `SELECT {1}(*) AS stuck_rows,
       ROUND({2}(total), 2) AS biggest_stuck
FROM orders
WHERE shipped_at {3} {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the scale aggregate",
        why: "Scale means a headcount of stuck rows, so COUNT(*). SUM would add the totals into a money figure — a different question entirely — and the wrong aggregate in the second column would misstate the exposure.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the exposure aggregate",
        why: "Worst-case exposure is the single largest stuck total, so MAX. MIN would surface the smallest — trivial money — and AVG would blur the pile into a mean nobody walks the floor for.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the NULL operator",
        why: "Emptiness is tested with IS; = NULL evaluates to unknown for every row and the calendar would report a pile of nothing instead of twenty-one stuck orders.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty marker",
        why: "shipped_at IS NULL is the exact predicate for 'no dispatch stamp yet' — precisely the stale rows the walk is meant to clear.",
      },
    ],
    distractors: ["SUM", "MIN", "=", "NOT NULL", "0"],
    walkthrough:
      "Two aggregates, one filter, zero rows wasted: COUNT(*) sizes the pile, MAX(total) finds the worst case, and shipped_at IS NULL casts the population — the only correct emptiness test. Run it and the stuck pile is 21 orders, with the biggest single exposure at 1,088.44. That biggest row is order 74, a pending booking from early October — worth pulling the full record before the walk. Two cross-checks the walk team should carry: the 21 split into 14 pending and 7 cancelled (cancelled orders never get stamps), and finance already carries the same pile as 7,265.49 of limbo value — same rows, different lens. The = decoy is the classic silent failure: it returns a row of zeros and NULLs instead of erroring, which is exactly why stale calendars go unnoticed.",
  },
  {
    id: "cs-078",
    topic: "l4",
    universe: "month-close",
    title: "Sorting the limbo pile",
    brief:
      "From: Financial Controller. Re: pre-close hygiene.\n\nI already know 21 orders sit in the no-dispatch limbo; before I hold their value out of revenue I need the pile sorted. Some of it is pending and still worth chasing with the warehouse; some is cancelled and should never have been sitting there at all — dead rows polluting my close. Split the limbo pile by order status so I can see what's live and what's litter.",
    ask: "For orders with no dispatch date, show each status and how many orders carry it.",
    template: `SELECT status, {1}(*) AS n
FROM orders
WHERE shipped_at {2} {3}
{4} BY status
ORDER BY status;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the bucket counter",
        why: "Bucket sizes are row counts: COUNT(*). SUM or AVG on '*' won't parse, and the split is about how many orders, not how much money.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the NULL operator",
        why: "Even with a GROUP BY coming, the emptiness test stays IS — = NULL still matches nothing and would collapse the whole report to zero rows.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty marker",
        why: "Selects exactly the 21 unconfirmed rows to be bucketed. NOT NULL would bucket the 82 stamped orders instead and flatter the close.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "One output row per status needs GROUP BY status. HAVING cannot take a BY here, and a second WHERE would leave two filters and a broken statement.",
      },
    ],
    distractors: ["SUM", "AVG", "=", "NOT NULL", "HAVING", "WHERE"],
    walkthrough:
      "Same limbo pool as the close, now bucketed. GROUP BY status gives one row per status among the 21 no-stamp orders, and COUNT(*) sizes each bucket. The split lands: cancelled 7, pending 14. That's the hygiene story — 14 are live and worth chasing with the warehouse, but 7 are cancelled orders that should never have been sitting in the open pile; they are litter in the ledger until someone cleans them. No 'shipped' or 'delivered' rows can appear here at all, because a dispatch stamp only lands on orders that actually leave — the filter sees to that.",
  },
  {
    id: "cs-079",
    topic: "l4",
    universe: "growth",
    title: "Limbo by the month it was booked",
    brief:
      "From: Chief of Staff. Re: ops health slide.\n\nFor the board deck I want a small honest chart: not the orders we shipped, but the ones still waiting for a dispatch stamp, bucketed by the month they were booked. If the recent months carry most of the pile, that's an ops story; if the old months do, that's a data-hygiene story. Two columns — booking month and stuck-order count — oldest month first.",
    ask: "Count orders with no dispatch date per booking month (YYYY-MM), sorted oldest month first.",
    template: `SELECT strftime('%Y-%m', created_at) AS month,
       {1}(*) AS stuck
FROM orders
WHERE shipped_at {2} {3}
{4} BY month
ORDER BY month;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the monthly counter",
        why: "Per-month bucket sizes come from COUNT(*). MAX or SUM cannot take '*' and would error out before returning a single row.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the NULL operator",
        why: "The filter is still the emptiness test — IS NULL — because 'waiting for a stamp' is a blank, not a value you can compare against.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty marker",
        why: "The blank marker that defines 'stuck'. Swapping in NOT NULL would chart the shipped orders and tell the board the opposite story.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "GROUP BY month builds the buckets the chart needs. ORDER inside this slot would leave two ORDER BY clauses and a syntax error.",
      },
    ],
    distractors: ["SUM", "MAX", "=", "NOT NULL", "ORDER", "HAVING"],
    walkthrough:
      "Board slides need shape, not just totals, so I bucket the no-stamp orders by booking month and count each bucket, oldest first. The pattern that comes back: 2024-01 carries 3, then 1, 3, a spring gap, 2, 3, 2, 3, 1 — and the newest months 2025-01 and 2025-02 hold 2 and 1. Read: the pile is smeared across the whole year rather than stacked in one bad month, which makes it a data-hygiene story, not an ops surge. Caveat for the slide: January 2024's three are approaching a year unconfirmed; those need a ship-or-purge decision, not another chart.",
  },
  {
    id: "cs-080",
    topic: "l4",
    universe: "refund-audit",
    title: "Cancelled, never dispatched",
    brief:
      "From: refunds@ internal ticket #4477.\n\nRefund sprint planning. Several cancelled orders were flagged last cycle, but I only trust the ledger's empty dispatch marker, not anyone's memory: a cancelled order with no dispatch stamp provably never left, which makes the refund case clean-cut. Count those rows so I can book reviewer time — and so nobody pads the queue with orders that actually shipped.",
    ask: "Count orders that are cancelled and also have no dispatch date.",
    template: `SELECT {1}(*) AS clean_refunds
FROM orders
WHERE status = {2} AND shipped_at {3} {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the queue counter",
        why: "The deliverable is reviewer workload: a row count, COUNT(*). SUM cannot take '*' and the ask is not about money at all.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status literal",
        why: "Status is text, so the literal wears quotes: 'cancelled'. Bare cancelled would be read as a column name and fail; 'pending' would count the live 14 instead.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the NULL operator",
        why: "Never-dispatched is a blank test: IS. The '=' decoy is the classic trap — it returns an empty set and quietly undercounts the queue to zero.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty marker",
        why: "Completes shipped_at IS NULL. With 'delivered' in the status slot the query returns nothing at all — delivered orders always carry a stamp.",
      },
    ],
    distractors: ["'pending'", "'delivered'", "'shipped'", "SUM", "="],
    walkthrough:
      "Refund triage wants clean-cut cases: cancelled AND never dispatched. Two filters in WHERE joined by AND — the status literal needs its quotes, and the emptiness test is IS NULL, never = NULL, which would match nothing and report an empty queue. COUNT(*) comes back 7. That is the sprint load: seven refunds where the goods provably never left, so no warehouse negotiation is needed. For contrast, the 14 pending no-stamp orders are NOT refund cases — they are still fulfilment's problem until they ship or die.",
  },
  {
    id: "cs-081",
    topic: "l4",
    universe: "pricing",
    title: "Baseline of the dispatched book",
    brief:
      "From: Head of Product. Re: pricing review kickoff.\n\nBefore we touch price points I want the baseline honest: the average order value of orders that have actually been dispatched. Anything still waiting on a warehouse stamp is still exposed to a cancellation, so it does not belong in the baseline. One number, rounded to cents, computed only over orders that carry a dispatch confirmation.",
    ask: "The average total, rounded to 2 decimals, across orders that have a dispatch date.",
    template: `SELECT ROUND({1}(total), 2) AS avg_dispatched
FROM orders
WHERE shipped_at {2} {3};`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean aggregate",
        why: "Average ticket is AVG(total). SUM would dump 27,567.79 into a cell labelled 'average', and MAX would report only the single biggest order.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the NULL operator",
        why: "Presence is still tested with IS: shipped_at IS NOT NULL. The '=' decoy either errors or matches nothing — no baseline either way.",
      },
      {
        answer: "NOT NULL",
        kind: "keyword",
        label: "the presence test",
        why: "Keeps only rows WITH a stamp. IS NULL here would quietly recompute the baseline over the 21 limbo orders — 345.98, the wrong book.",
      },
    ],
    distractors: ["SUM", "MAX", "=", "0", "NULL"],
    walkthrough:
      "The baseline must only contain orders the warehouse confirmed, so the predicate is the presence test: shipped_at IS NOT NULL. AVG(total) over that set, rounded to cents, lands at 336.19 across 82 dispatched orders. I round only at the display edge — the average itself stays full precision until it hits the slide. The number I am deliberately NOT using: the no-stamp pool averages 345.98, slightly higher, which quietly says the biggest tickets are the ones still waiting on dispatch — worth remembering when we model what a price change does to open orders.",
  },
];
