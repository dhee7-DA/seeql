// Case batch HB2 — hard wave B2, ids cs-291…cs-300. Completes the Module 1
// 100/100/100 program (hard 80 → 90; HA2's cs-270..279 finish the set).
// Universes rotate fraud / month-close / refund-audit / growth / funnel only
// (the parallel HA2 batch owns catalog/pricing/inventory/supplier/expense).
// Shapes: WHERE stacks with watch-lists, dispatch-gap months via
// COUNT(*) − COUNT(col) in HAVING, per-account cancellation rolls, DISTINCT
// market counts, same-day tie-breaks, duplicate-day detection, a fresh
// invoices cents→dollars reconciliation, a cancellation value band, an
// impossible-state empty sweep with a COALESCE ladder, and a dated board
// slide. Every figure probed live against the seed db; audited by
// scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesCHb2: CaseStudy[] = [
  {
    id: "cs-291",
    tier: "hard",
    topic: "l3",
    universe: "fraud",
    title: "The whale watch-list sweep",
    brief:
      "From: Risk team, watch-list program. Re: this cycle's manual review.\n\nAccounts 1 and 5 are the two heaviest booking books on file — 24 and 17 orders respectively — and both buy in reseller patterns, so everything they book gets a second look. Policy for the sweep: their tickets worth 400 or more that are NOT delivered go to the review queue, biggest first, capped at the four the team can clear this cycle.",
    ask: "Id, account, total and booking date of the four biggest watch-list tickets of 400 or more that are not delivered, biggest first.",
    template: `SELECT id, customer_id, total, created_at
FROM orders
WHERE customer_id {1} (1, 5)
  AND total >= {2}
  AND status {3} 'delivered'
ORDER BY total {4}
LIMIT {5};`,
    slots: [
      {
        answer: "IN",
        kind: "keyword",
        label: "the list match operator",
        why: "Two watched accounts means a membership test: customer_id IN (1, 5). Chaining OR per account works but grows with the list — IN states it in one predicate.",
      },
      {
        answer: "400",
        kind: "number",
        label: "the review threshold",
        why: "Policy draws the line at 400, and >= keeps tickets worth exactly 400 in scope — the sweep is '400 and up', not 'above 400'.",
        noVerify: true,
      },
      {
        answer: "!=",
        kind: "keyword",
        label: "the stage exclusion",
        why: "Delivered tickets are closed history, not review material, so the gate excludes them: status != 'delivered'. The queue keeps shipped and pending tickets that can still be intervened on.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Reviewers clear the biggest exposure first, so the sort is total DESC. Ascending would hand them the four smallest tickets and the big ones would wait another cycle.",
      },
      {
        answer: "4",
        kind: "number",
        label: "the cycle cap",
        why: "The program caps each cycle at four tickets — that is the team's real throughput. LIMIT applies after the sort, so the cap keeps exactly the four biggest.",
        noVerify: true,
      },
    ],
    distractors: ["NOT IN", "750", "=", "NOT", "ASC", "900"],
    walkthrough:
      "Three gates and a ranking: the sweep is a WHERE stack plus a sort plus a cap, evaluated in that order. The IN list pins the watch-list to accounts 1 and 5 in one predicate; the 400 threshold keeps the queue material; and status != 'delivered' removes closed history, leaving shipped and pending tickets where a hold can still matter. Eleven tickets clear all three gates, so the business limit does real work: ORDER BY total DESC lines up the exposure and LIMIT 4 keeps the front of that line — 845.92, 785.79, 767.64 and 725.34 (orders 39, 57, 3 and 5). Note the two pending tickets that made the cut: they are unshipped as well as big, which is exactly the combination the watch-list exists to catch early.",
  },
  {
    id: "cs-292",
    tier: "hard",
    topic: "l4",
    universe: "month-close",
    title: "Months the stamps fell behind",
    brief:
      "From: Financial Controller. Re: dispatch backlog before the close.\n\nA booking is only closable once the warehouse stamps its dispatch, and I want to know which months quietly accumulated orders that never got one. For every month, compare bookings against actual stamps and surface the months carrying three or more unstamped bookings — that is the cleanup list I hand to warehouse ops.",
    ask: "Each month with its booking count and stamp count, keeping only months where bookings exceed stamps by 3 or more, in calendar order.",
    template: `SELECT strftime('%Y-%m', created_at) AS month,
       COUNT(*) AS booked,
       COUNT({1}) AS stamped
FROM orders
GROUP BY month
{2} booked - stamped {3} {4}
ORDER BY month {5};`,
    slots: [
      {
        answer: "shipped_at",
        kind: "keyword",
        label: "the counted stamp column",
        why: "COUNT(shipped_at) skips NULLs, so it counts only real dispatch stamps. COUNT(id) or COUNT(total) would count every booking and the gap would read zero everywhere.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the group filter",
        why: "The gap is a comparison of two aggregates, so it can only be tested after grouping — that is HAVING's job. WHERE runs before buckets exist and cannot see COUNT at all.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the gap comparison",
        why: "The controller wants months carrying three or more unstamped bookings, so the gap test is booked - stamped >= 3 — exactly three qualifies for the cleanup list.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the gap size",
        why: "Three unstamped bookings is the materiality line: smaller slippage is normal churn, three or more means the month needs a named owner. The threshold shows up in the output cells themselves.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the calendar order",
        why: "Ops works the backlog oldest-first, so months print in calendar order. DESC would parade the newest gap months past the oldest work nobody has cleared yet.",
      },
    ],
    distractors: ["status", "total", "WHERE", ">", "<", "DESC"],
    walkthrough:
      "The NULL lesson wearing an accountant's hat: COUNT(*) counts rows, COUNT(shipped_at) counts only stamped ones, and the difference between them is exactly the number of bookings the warehouse never confirmed. Grouping by month turns that into a monthly slippage series — 14 months on the books. The filter has to be HAVING because the gap only exists after aggregation; and because both sides live in the SELECT as aliases, the gap reads like plain arithmetic: booked - stamped >= 3. Four months clear the bar: 2024-01 (8 booked, 5 stamped), 2024-03 (8/5), 2024-07 (8/5) and 2024-11 (6/3). Try slotting COUNT(id) into the stamp column and the gap collapses to zero — the whole report goes quiet, which is precisely the silent wrong answer this close check exists to prevent.",
  },
  {
    id: "cs-293",
    tier: "hard",
    topic: "l8",
    universe: "refund-audit",
    title: "The repeat-cancellation shortlist",
    brief:
      "From: Refund operations. Re: retention calls this week.\n\nOne cancellation is a product miss; two from the same account is a pattern, and patterns get a phone call. Pull the accounts with two or more cancellations on file, and put their total cancelled value next to the count so the team knows how much relationship is at stake before they dial. Biggest exposure first.",
    ask: "Each account with 2 or more cancelled orders, showing the account, its cancellation count and its total cancelled value rounded to 2 decimals, biggest exposure first.",
    template: `SELECT customer_id, {1}(*) AS cancelled_orders,
       ROUND(SUM(total), 2) AS exposure
FROM orders
WHERE status = {2}
GROUP BY customer_id
{3} COUNT(*) >= {4}
ORDER BY exposure {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the frequency aggregate",
        why: "The trigger is how many cancellations an account has, so COUNT(*) tallies rows per account. SUM(*) is not valid SQL and ROUND cannot aggregate.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status filter",
        why: "Only cancellations count toward the pattern, so WHERE status = 'cancelled' filters rows before grouping — with the quotes, because the bare word would be read as a column.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the group gate",
        why: "Two-or-more is a property of the group, not of any single row, so the test belongs in HAVING. WHERE has no access to COUNT and would fail the parse.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the repeat bar",
        why: "The policy bar is two cancellations — one is noise, two is a pattern. The 2 is verifiable in the output itself: account 13 lands exactly on it and stays on the list.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the exposure order",
        why: "The team dials the deepest exposure first, so ORDER BY exposure DESC puts the costliest relationship on top. Ascending would bury it under the small ones.",
      },
    ],
    distractors: ["SUM", "ROUND", "'pending'", "WHERE", "3", "ASC"],
    walkthrough:
      "This is the classic 'per-group metric, filtered on the metric' build, with a courtesy twist: the row filter and the group filter live on opposite sides of the GROUP BY. WHERE status = 'cancelled' shrinks 103 orders to the 7 cancellations first; GROUP BY customer_id folds them into per-account rolls; HAVING COUNT(*) >= 2 keeps only the patterns — the single-cancellation accounts (11, 5) drop away. Two accounts survive: account 1 with 3 cancellations worth 494.82 and account 13 with 2 worth 115.82, ordered by exposure for the call sheet. The threshold 2 is deliberately visible in the output — account 13 sits exactly on the bar, so swapping >= for > would silently shorten the call list, a good self-check that the operator is enforcing the stated policy and not a stricter one.",
  },
  {
    id: "cs-294",
    tier: "hard",
    topic: "l6",
    universe: "growth",
    title: "Markets the spring cohort opened",
    brief:
      "From: Growth lead. Re: spring cohort readout.\n\nThe spring cohort — everyone who signed up on or after April 1 and is still active — is our freshest acquisition story, and the board only needs one cell from it: how many distinct markets did it actually open? Count the distinct regions, nothing else, so the slide stays honest.",
    ask: "Count of distinct regions among customers who signed up on or after 2024-04-01 and are still active.",
    template: `SELECT {1}(DISTINCT {2}) AS launch_markets
FROM {3}
WHERE active = {4} AND created_at >= {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The deliverable is one number — how many markets — so COUNT wraps the distinct list. SUM would try to add region names together and error out on text.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the market column",
        why: "Markets are regions in this schema. Counting DISTINCT city instead would report 5 individual towns and overstate the market story the board is asking for.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the source table",
        why: "Signups and their active flags live in customers. orders has no region or active column, so the cohort question cannot even be asked of the transactions table.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the active flag",
        why: "active is stored as 1 for live accounts and 0 for churned ones. The readout counts the live cohort only — including the dormant spring signup would blur a story about customers we actually kept.",
        noVerify: true,
      },
      {
        answer: "'2024-04-01'",
        kind: "keyword",
        label: "the cohort start date",
        why: "The spring cohort begins April 1, so created_at >= '2024-04-01' — a quoted date literal, compared as on-or-after so the boundary signup itself stays in the cohort.",
      },
    ],
    distractors: ["SUM", "ROUND", "city", "orders", "0", "'2024-06-01'"],
    walkthrough:
      "COUNT(DISTINCT x) is the tool for 'how many different kinds of thing', and here the thing is a market, not a person: six customers signed up on or after April 1, five are still active, and the distinct region among those five collapses to just 2 — EU and APAC. The two filters must both sit in WHERE because they describe individual customers (active flag, signup date), not groups. The quiet trap is the grain of the counted column: DISTINCT city counts 5 towns for the same cohort, which flatters the number by confusing markets with cities. And the boundary matters — move the date to June 1 and the count drops to 1, because half the cohort signed in April and May. One cell, 2, with a definition the board can audit.",
  },
  {
    id: "cs-295",
    tier: "hard",
    topic: "l5",
    universe: "funnel",
    title: "The freshest five, same-day pair sorted",
    brief:
      "From: Lifecycle marketing. Re: the daily monitoring sheet.\n\nThe sheet leads with the five freshest bookings, newest first — that is the cohort today's touches go to. Two of the latest tickets landed on the same day (2025-02-12), and the sheet's house rule is that the earlier booking prints first within a day, so the sort needs a second key to settle that pair deterministically.",
    ask: "Id, status, total and booking date of the five newest orders, newest first, with same-day ties broken so the earlier booking prints first.",
    template: `SELECT id, status, total, created_at
FROM orders
ORDER BY {1} {2}, {3} {4}
LIMIT {5};`,
    slots: [
      {
        answer: "created_at",
        kind: "keyword",
        label: "the primary sort key",
        why: "Freshest first is a booking-date ranking, so created_at leads. Sorting by id would silently re-rank by when rows were inserted, not when the funnel event happened.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the primary direction",
        why: "Newest first means descending time. The default ASC would serve the five oldest bookings — the founding-era tickets nobody can act on anymore.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the tie-break key",
        why: "Two tickets share 2025-02-12, so the first key alone leaves their order undefined. id settles it deterministically — and the higher id is the later booking.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the tie-break direction",
        why: "House rule: within a day, the earlier booking prints first, and the earlier booking carries the lower id — so the second key ascends. DESC would flip the pair the wrong way.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the sheet size",
        why: "The monitoring sheet holds five rows per day, no more. LIMIT applies after the full two-key sort, so the cap trims the finished ranking, not a partial one.",
        noVerify: true,
      },
    ],
    distractors: ["total", "city", "OFFSET", "3", "6"],
    walkthrough:
      "Multi-key sorting is just prioritized tie-breaking: the first key groups the world into days in descending order, and the second key only speaks when the first one ties. Here that tie is real — orders 101 and 102 both landed on 2025-02-12 — and the second key, id ASC, prints 101 before 102 because the lower id is the earlier booking. That matters more than it looks: the same-day pair straddles positions four and five, so an unspecified tie would make the sheet's bottom row random from run to run. LIMIT 5 then cuts the finished ranking, handing back 97 (2025-02-27), 98 (02-25), 100 (02-19), then 101 and 102. One habit to steal: every 'newest first' list that could contain same-day rows deserves a declared second key, or its tail is nondeterministic.",
  },
  {
    id: "cs-296",
    tier: "hard",
    topic: "l8",
    universe: "fraud",
    title: "Same-day doubles on the fraud radar",
    brief:
      "From: Fraud ops analyst. Re: velocity sweep.\n\nCard-testing runs share a signature: several tickets booked on the very same day before any of them ships. Group the order book by the booking date itself and surface every day that logged two or more tickets, with the count beside each date. Heaviest days first, and inside the same weight keep dates chronological.",
    ask: "Each booking date with 2 or more orders, showing the date and the ticket count, heaviest days first and chronological within equal counts.",
    template: `SELECT created_at, {1}(*) AS tickets
FROM orders
GROUP BY {2}
{3} COUNT(*) > {4}
ORDER BY tickets {5}, created_at ASC;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tallying aggregate",
        why: "The radar reading is how many tickets hit a day, so COUNT(*) tallies rows per date. SUM(*) or ROUND(*) are not valid aggregates over a star.",
      },
      {
        answer: "created_at",
        kind: "keyword",
        label: "the bucketing key",
        why: "Grouping by the raw booking date buckets the book per day — exactly the velocity frame. Grouping by status or customer would count the wrong thing entirely.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the group filter",
        why: "Two-or-more is a fact about the day, not about any single ticket, so the test must run after grouping — HAVING. WHERE cannot see COUNT and fails to parse.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the velocity bar",
        why: "The sweep keeps days with more than one ticket, so COUNT(*) > 1 — a day with a single booking is normal traffic, not a signal. The bar sits just under the smallest flagged day.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the weight order",
        why: "Heaviest days lead the report, so tickets DESC. The trailing created_at ASC is hardcoded to keep equal-weight days chronological instead of arbitrary.",
      },
    ],
    distractors: ["ROUND", "status", "customer_id", "WHERE", "9", "ASC"],
    walkthrough:
      "Duplicate detection is GROUP BY on the thing that shouldn't repeat. Here the bucket is the raw created_at date — not a month, not a status — because the fraud signature is several tickets inside one day. The aggregation counts tickets per day, HAVING COUNT(*) > 1 discards the ordinary single-ticket days, and the sort puts the scary days on top: two days logged 3 tickets (2024-05-12 and 2024-10-13), then fifteen days with pairs, 17 flagged days in all. The secondary sort is hardcoded ASC so that same-weight days read chronologically — a report that scrambles equal-weight dates invites the reader to invent a pattern. Note what the GROUP BY choice protects: bucket by customer_id instead and you get repeat buyers, a different (and mostly innocent) population; the same aggregate over the wrong key is the classic velocity-sweep false positive.",
  },
  {
    id: "cs-297",
    tier: "hard",
    topic: "l7",
    universe: "month-close",
    title: "The close binder's collected cash",
    brief:
      "From: Financial Controller. Re: cash reconciliation page.\n\nThe invoices ledger stores everything in cents, and the binder reads in dollars, so the conversion happens in the query, not in the spreadsheet. For the settled side of the book: how many invoices carry status 'paid', and how much cash did they collect in total? Two cells, converted cleanly to 2 decimals.",
    ask: "Count of paid invoices and their total collected value converted from cents to dollars with 2 decimals.",
    template: `SELECT {1}(*) AS paid_count,
       ROUND({2}(amount_cents) / {3}, 2) AS collected
FROM {4}
WHERE status = {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the invoice tally",
        why: "The first cell is a headcount of settled invoices, so COUNT(*) counts the rows. SUM(*) is not valid SQL and ROUND cannot collapse rows to a number.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the cash aggregate",
        why: "Collected cash adds every settled invoice's cents together — SUM. AVG would report the average invoice and MAX only the single biggest, neither of which reconciles to the bank.",
      },
      {
        answer: "100.0",
        kind: "number",
        label: "the cents-to-dollars divisor",
        why: "The ledger stores cents, so dividing by 100.0 converts to dollars — and the .0 forces decimal math instead of integer division, which would truncate the cents away.",
        noVerify: true,
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "the source table",
        why: "Invoice status and amount_cents live in invoices. orders has no amount_cents column and payments has no status, so neither table can answer the settled-invoice question.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the settled status",
        why: "The reconciliation covers settled money only: status = 'paid', quoted as a text value. 'open' invoices are still receivable and 'void' ones never existed as cash.",
      },
    ],
    distractors: ["ROUND", "AVG", "MAX", "10", "orders", "'open'"],
    walkthrough:
      "Two headline aggregates, one filter, and a unit conversion — a small query that already behaves like a real reconciliation. WHERE status = 'paid' cuts the 28-invoice ledger to the 21 settled ones; COUNT(*) heads the count cell; SUM(amount_cents) adds 6,644,300 cents; and the division by 100.0 turns that into 66,443.00 dollars before ROUND tidies it to 2 decimals. The .0 in the divisor is the detail worth copying: dividing by bare 100 would send SQLite into integer arithmetic and silently shave the cents off every figure. The table choice is load-bearing too — payments also carries amount_cents but has no status column, and orders has status but no amount_cents, so only invoices can join 'paid' to 'cents' in one scan. Cross-check for the binder: the open book still holds 6 invoices worth 19,609.00, so collected plus receivable is the whole exposure.",
  },
  {
    id: "cs-298",
    tier: "hard",
    topic: "l3",
    universe: "refund-audit",
    title: "Cancellations from 100 upward",
    brief:
      "From: CX lead. Re: goodwill letters, February batch.\n\nHandwritten letters go to every customer whose order we cancelled at a value of 100 or more — below that line the email template handles it. Pull the qualifying cancellations with their booking dates, biggest first, so the signing stack is already in priority order when it reaches my desk.",
    ask: "Id, total and booking date of every cancelled order worth 100 or more, biggest total first.",
    template: `SELECT id, total, created_at
FROM orders
WHERE status = {1} {2} total >= {3}
ORDER BY {4} {5};`,
    slots: [
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status value",
        why: "The letter batch covers cancellations only, so status = 'cancelled' — a quoted text value. The bare word would be parsed as a column name and the query would fail.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the gate joiner",
        why: "A ticket must be cancelled AND worth 100 up — both conditions true simultaneously, so AND joins them. OR would flood the batch with every big order of any status.",
      },
      {
        answer: "100",
        kind: "number",
        label: "the letter threshold",
        why: "The policy line is 100, and >= keeps a ticket worth exactly 100 in the batch — 'from 100 upward' includes the boundary, which is where >= differs from >.",
        noVerify: true,
      },
      {
        answer: "total",
        kind: "keyword",
        label: "the priority sort key",
        why: "The signing stack is ordered by cheque size, so total leads the ORDER BY. Sorting by created_at would mix the priority order with the calendar.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the stack direction",
        why: "Biggest first, so DESC — the costliest apology gets signed while attention is fresh. ASC would start the stack at the 100.00-floor tickets nobody prioritizes.",
      },
    ],
    distractors: ["'pending'", "OR", "150", "created_at", "ASC", "'shipped'"],
    walkthrough:
      "Two row-level facts, one conjunction, one ranking — but each piece is doing audit-visible work. WHERE status = 'cancelled' keeps the 7 cancellations on file; total >= 100 keeps the five worth a letter (397.99, 206.19, 152.52, 143.86, 136.11) and quietly drops the two small ones at 90.35 and 25.47 that the email template owns. The AND is what makes that a conjunction: swap in OR and the batch explodes to every 100-plus order of any status — dozens of letters to customers whose orders were never cancelled. Finally ORDER BY total DESC pre-sorts the signing stack so the 397.99 apology is on top. The >= vs > edge is real here too: 'from 100 upward' is an inclusive policy, and a refund worth exactly 100.00 would have to land in the handwritten batch, not the template queue.",
  },
  {
    id: "cs-299",
    tier: "hard",
    topic: "l4",
    universe: "funnel",
    title: "The stage that must stay empty",
    brief:
      "From: Internal audit. Re: funnel integrity check.\n\nOne state in this funnel is impossible by design: an order cannot be delivered if it was never dispatched, and the dispatch stamp is the proof of dispatch. The integrity report runs this check every morning and it must print a clean zero — both a ticket count and a value — so the sheet needs the value cell to read 0, never blank, when the sweep finds nothing.",
    ask: "Count of delivered orders with no dispatch stamp plus their total value, where an empty sweep must still print 0 in the value cell.",
    template: `SELECT COUNT(*) AS impossible_tickets,
       {1}(SUM(total), {2}) AS impossible_value
FROM orders
WHERE status = {3} AND shipped_at {4} {5};`,
    slots: [
      {
        answer: "COALESCE",
        kind: "keyword",
        label: "the null-proof wrapper",
        why: "SUM over zero rows returns NULL, and NULL prints as a blank cell. COALESCE substitutes the fallback the moment its first argument is NULL — exactly what a report cell needs.",
      },
      {
        answer: "0",
        kind: "number",
        label: "the clean-zero fallback",
        why: "The audit sheet wants an explicit 0, not a blank, when nothing is found. With the sweep empty, SUM yields NULL and COALESCE prints the 0 that says 'checked, clean'.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the stage under test",
        why: "The impossible state pairs delivered status with a missing stamp. 'pending' and 'cancelled' legitimately have no stamps, so they would turn the integrity check into a backlog report instead.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the emptiness operator",
        why: "Missing stamps are tested with IS NULL. The everyday = reads NULL as 'unknown' and matches nothing silently — the classic false-clean reading of an integrity check.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty marker",
        why: "shipped_at IS NULL is the exact predicate for 'never dispatched'. Together with IS it forms one two-word operator — either half alone is a syntax error or a different test.",
      },
    ],
    distractors: ["ROUND", "NULLIF", "IS NOT", "NOT", "UPPER"],
    walkthrough:
      "This is the empty-set case, and the discipline is believing the zero. The predicate status = 'delivered' AND shipped_at IS NULL describes a state the pipeline makes impossible — every one of the 52 delivered orders carries a stamp — so the sweep matches no rows. COUNT(*) over an empty set is well-behaved and returns 0, but SUM(total) over an empty set returns NULL, which would print as a blank cell and read as 'not checked' to anyone auditing the sheet. COALESCE(SUM(total), 0) is the ladder that fixes the display: take the sum, and if it is NULL, print 0. The result is one deliberate row — 0 tickets, 0 value — which is the whole deliverable. Flip IS NULL to IS NOT NULL and the same query becomes useful in a different way (it would count the 52 properly-stamped deliveries), which is exactly why the two-word operator, not a vague inequality, has to be stated.",
  },
  {
    id: "cs-300",
    tier: "hard",
    topic: "l7",
    universe: "growth",
    title: "Q2 realized revenue for the board",
    brief:
      "From: Chief of Staff. Re: Q2 board slide, revenue cell.\n\nThe board slide separates realized from booked: realized means the order was actually delivered, inside the quarter April 1 through June 30. Give me the slide's three cells — how many orders realized, the revenue they carried, and the biggest single deal among them — all rounded so the slide prints clean.",
    ask: "Count of delivered orders booked between 2024-04-01 and 2024-06-30, their total revenue rounded to 2 decimals, and the biggest deal among them rounded to 2 decimals.",
    template: `SELECT {1}(*) AS realized_orders,
       ROUND({2}(total), 2) AS realized_revenue,
       ROUND(MAX(total), 2) AS biggest_deal
FROM orders
WHERE status = {3} AND created_at BETWEEN {4} AND {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the deal tally",
        why: "The first cell counts delivered orders in the window, so COUNT(*) tallies the rows. SUM(*) is not valid SQL and ROUND cannot count.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the revenue aggregate",
        why: "Realized revenue adds the totals of the qualifying orders — SUM. AVG would print the mean deal and MIN the smallest, neither of which belongs on the revenue line.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the realized filter",
        why: "Realized means delivered, so status = 'delivered' — quoted as a text value. 'pending' tickets are still booked-only, and 'shipped' ones are in transit, not yet realized.",
      },
      {
        answer: "'2024-04-01'",
        kind: "keyword",
        label: "the window start",
        why: "The quarter opens April 1, and BETWEEN is inclusive on both ends — so the boundary booking on April 1 itself counts toward Q2.",
      },
      {
        answer: "'2024-06-30'",
        kind: "keyword",
        label: "the window end",
        why: "The quarter closes June 30 at the end of day as far as this date-stamped book is concerned — the inclusive upper bound of the BETWEEN window.",
      },
    ],
    distractors: ["ROUND", "AVG", "'shipped'", "'pending'", "'2023-04-01'", "'2024-05-01'"],
    walkthrough:
      "One slice, three aggregates — and the definition of 'realized' is doing the analytical work. The WHERE stack keeps only delivered orders (status = 'delivered') whose booking date falls in the inclusive April 1 to June 30 window; that trims Q2's 21 bookings to the 9 that actually landed. On that slice, COUNT(*) gives 9 realized orders, SUM(total) gives 2318.63 of realized revenue, and the hardcoded MAX(total) isolates the biggest deal at 624.66 — all wrapped in ROUND so the slide prints exactly two decimals. The quiet contrast worth saying out loud: Q2 also booked 1204.52 in pending orders (including a 945.21 ticket) that the board slide deliberately excludes, because 'booked' and 'realized' answer different questions. BETWEEN makes both date literals load-bearing — start the window May 1 and the revenue cell drops to 1449.64, six orders' worth of quarter gone.",
  },
];
