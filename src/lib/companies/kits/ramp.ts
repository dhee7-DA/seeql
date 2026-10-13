// Ramp — kit 14 of the Fintech & Payments domain (Batch L, wave 7).
// Corporate cards and spend management: the storefront db read as a B2B
// spend book — orders are card transactions (delivered = reconciled with
// receipt, shipped = posted-awaiting-receipt, pending = awaiting approval,
// cancelled = declined), order_items are the receipt line items inside a
// transaction, customers are cardholders, suppliers are vendors, products
// are policy catalog lines (price = the per-swipe limit — max $199.99, the
// premium band >= $200 is empty), invoices are vendor invoices, payments
// are settlement legs on two rails (card = Ramp-card settlements, wire =
// bank/ACH payments, both INTEGER cents), expenses are the opex spend
// lines and ledger_entries are the GL. Vendor concentration, policy gates,
// savings detection and the AR ladder are the daily bread.
// Pool provenance: 0 tagged LC rows for Ramp — the whole pool is
// theme-curated to known spend-management and vendor-audit screen shapes
// and says so.
// Case briefs quote probed figures from scripts/company-facts.md (probed
// 2026-10-12); every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.
//
// EXPANDED (Batch 95, append-only 3x expansion): brief 4->6, dayInLife 3->4,
// metrics 8->12, topics 10->15, theory 8->24 (ramp-t9..t24), mcqs 10->30
// (ramp-mcq-11..30, 4 easy / 9 medium / 7 hard), cases 2->6 (cs-ramp-3..6,
// new topic families t7 + t5 + j7 + x3 — pairwise distinct and distinct from
// the original x2/q5), problems 16->32. The registry tags 0 Ramp SQL problems;
// every expansion slug (topics + problems) stays theme-curated from the SQL
// band per spec. New cases probed on db/custom.db before authoring — number
// slots verified as result cells, distractors consequence-checked; all figures
// still come from scripts/company-facts.md.

import type { CompanyKit } from "../types";

export const rampKit: CompanyKit = {
  id: "ramp",
  domainId: "fintech",
  name: "Ramp",
  tagline: "Corporate cards and spend management",
  accent: "text-amber-300",

  brief: [
    "Ramp is the corporate card and spend-management platform — every swipe policy-checked, every vendor invoice chased, every dollar of savings detected and claimed. The analytics reality is an audit engine wearing a growth badge: every transaction either reconciles, waits on a receipt, or declines, and the vendor book behind it is where the savings live. On this storefront db the mapping is honest: `orders` are card transactions (103 of them), order_items are the receipt line items inside a transaction (251 — about 2.4 lines each), customers are cardholders, and suppliers are the vendors the card spend lands on. Transaction outcomes mirror the status mix exactly: **52 reconciled** (50.5%), **30 posted-awaiting-receipt** (29.1%), **14 awaiting approval** (13.6%), **7 declined** (6.8%) — and shipped_at is the receipt timestamp, populated only for the 82 transactions that cleared.",
    "The data org splits into spend, vendor ops, and finance. Spend owns the policy layer: 16 catalog lines with per-swipe limits, the priciest capping at **$199.99** — the premium band (>= $200) is empty, and that emptiness is the policy story. Vendor ops owns the book: 28 vendor invoices worth $86,977.00 against 27 settlement legs, INTEGER cents end to end, with the standing contradictions — invoice #11 is {rose:void} yet carries a $925.00 settlement leg, #28 reads {emerald:paid} with nothing behind it ($1,756.00), and one invoice sits {amber:partial} at $4,000.00 of $6,148.00. Finance owns the rails: card settlements run 16 legs for **$37,364.00**, bank/ACH 11 for $32,248.00, and five invoices settle in two legs (1, 5, 12, 19, 22). Opex rides alongside: 36 spend lines worth $25,416.00, Rent 14 lines / $16,800.00 leading.",
    "Interview style is vendor-first, then the concentration. A screen opens with a conditional count (reconciled share — *of all transactions, or only the 82 with receipts?*), moves to the chain read (receipt lines → catalog → vendors, where one wrong join key pairs spend with the wrong vendor), escalates into per-vendor scorecards where {emerald:share-of-book} is a derived-table join away, and lands on the `FILTER (WHERE …)` census: total lines, biggest line, category splits in a single scan. The graded habits: state the denominator, resolve the grain before averaging, and never let a {rose:declined} swipe into a spend total.",
    "Preparation: the registry tags zero SQL problems for Ramp — this kit is **0 tagged LC, theme-curated**: all 30 topic slugs and 16 problems are chosen to mirror spend-management screens — vendor chains, policy CASE bands, out-of-policy anti-joins, opex censuses and LAG walks. Then run both case studies on the live db: one rebuilds the {emerald:opex census} finance closes the month with (36 lines / $25,416.00 / biggest line $1,680.00), the other rebuilds the {violet:vendor concentration board} the savings team pitches from ($11,130.25 / 32% leading). Say the denominator, the join chain and the grain out loud before you compute — at a spend-management company, the grain is the savings.",
    "The kit's second half goes deeper on the same spend book. The {violet:burn walk} stages a monthly fold over the opex table — *14 dense months, 2024-01 through 2025-02, no holes* — and rides a LAG delta down the spine: 2024-01 opens at $1,719.00 with an honestly NULL delta, and 2024-08 peaks at $3,210.00, just $14.16 over July's $1,794.00. The velocity ladder ranks cardholders by swipe count — 24, 17, 14, 13 at the top — then hits the tie band the rank functions fight over: **four cardholders share 4 swipes**, and RANK, ROW_NUMBER and DENSE_RANK print three different answers for it. The {sky:rail stack} reconciles the settlement book in one UNION ALL — card 16 legs / $37,364.00, wire 11 / $32,248.00, with a TOTAL row that must read 27 legs / **$69,612.00** — while the region scorecard splits the program: EU leads at $15,089.23 across 45 swipes, yet the smallest book, the US at $7,286.16, carries the biggest tickets at $383.48 average.",
    "Senior-round prep is rehearsal on the live db with denominators said out loud. Rebuild all four new cases end to end: does your burn walk open on 2024-01 with a **NULL delta**, or did you COALESCE the anchor into a fake zero? Does the velocity ladder still tie at rank 6 — and can you say which rank function you picked and why? Does the rail stack fold back — 16 + 11 = 27 legs, $37,364.00 + $32,248.00 = $69,612.00 — before the packet ships? The reflexes they grade are Ramp's own: cents stay INTEGER until one `/100.0` at the display edge, every census reconciles to `COUNT(*)`, every rate names its denominator (declines are 7 of **103 swipes**, not 7 of the 96 approved), and every anomaly carries a route — *a void invoice with a settlement leg is a risk page, a paid invoice with no legs is an engineering ticket, and routing them is part of the answer*.",
  ],

  dayInLife: [
    "**08:05 —** The day starts on the spend funnel. First query is the overnight read: transactions by outcome — 52 of 103 reconciled all-time, the {rose:declined} share watched hardest (6.8%, and every decline is a policy working or a card failing) — then the receipt chase: 30 transactions sitting posted-awaiting-receipt, oldest first. The morning artifact is a two-grain count: 251 receipt lines across 103 transactions, because one swipe splits across budget lines — *a census that can't say both grains out loud is the one that misprices a vendor during close*. A mismatch pages vendor ops, not a shrug.",
    "**11:30 —** Midday is opex surgery. The census query runs in one pass: 36 spend lines, **$25,416.00** total, 14 Rent lines isolated with FILTER, the single biggest line **$1,680.00** named — and the fold-back check rides along: Rent $16,800.00 plus Ads $4,570.00, Travel $2,521.00 and Tools $1,525.00 must sum back to the census or the pack doesn't ship. The vendor ladder walks beside it: 21 invoices settle exact ($65,612.00), 1 {amber:partial} at $4,000.00 of $6,148.00, 6 untouched ($15,217.00) — *the AR ladder is the vendor-ops heartbeat, and the anti-join that finds the untouched six is rehearsed until it's reflex*.",
    "**16:00 —** The afternoon is the savings pitch. The board ranks vendors by spend share: $11,130.25 — **32%** of the book — leads, the next vendor 26.7%, and the derived-table join that produces the share is the query the meeting exists to challenge. The {violet:burn walk} charts opex by month via SUBSTR — the 2024-08 peak of $3,210.00 gets its explanation line — and LAG deltas annotate the trend with the first month's NULL left honest. Every branch reconciles against a plain `COUNT(*)` before it ships — and the ledger gets the last word: debits **181,080** equal credits **181,080**, delta zero, the one number allowed to be boring.",
    "**17:40 —** EOD is the writeup and the hand-off. The {emerald:velocity ladder} gets re-run for the fraud desk — still 16 cardholders, still the four-way tie at 4 swipes sharing rank 6, *which is exactly why the desk reads ranks and not row numbers* — and the region scorecard ships to the weekly program review with EU's $15,089.23 on the first line. The {sky:rail stack} is the last reconciliation: card's 16 legs plus wire's 11 must read 27, $37,364.00 plus $32,248.00 must read **$69,612.00**, and the TOTAL row is the proof it did. Every number ships with its query attached, the burn walk's NULL anchor is left honest for tomorrow's 08:05 read, and the ledger still ties — debits **181,080**, credits **181,080**, delta zero, the one line allowed to be boring.",
  ],

  metrics: [
    { name: "Reconciliation share", what: "Reconciled transactions ÷ ALL transactions: 52 of 103 (50.5%), with 7 declined (6.8%) the only hard losses. The funnel headline — and the denominator argument ('of all, or only the 82 with receipts?') is the interview before the metric." },
    { name: "Receipt latency", what: "JULIANDAY(shipped_at) − JULIANDAY(created_at) over receipted transactions: 2.98 days average, tight 2-to-4 spread. The reconciliation clock — computed over the 82 receipts, never over NULL awaiting-approval timestamps." },
    { name: "Vendor concentration", what: "Share of card spend by vendor: $11,130.25 of $34,833.28 (32%) at the top, 26.7% next — the top two carry 58.7% of the book. The concentration read every savings pitch starts from." },
    { name: "Policy ceiling", what: "Max per-swipe limit on the catalog: $199.99 — the premium band (>= $200) is empty. The policy line that out-of-policy splits are measured against." },
    { name: "Opex census", what: "36 spend lines worth $25,416.00 — Rent 14 lines / $16,800.00, Ads 14 / $4,570.00, Travel 3 / $2,521.00, Tools 5 / $1,525.00; biggest single line $1,680.00; peak month 2024-08 at $3,210.00." },
    { name: "Vendor AR ladder", what: "Invoices classified exact / partial / no legs: 21 / 1 / 6. The $65,612.00 exact book settles clean; the ladder is how vendor ops proves it instead of asserting it." },
    { name: "Untouched AR exposure", what: "Invoices with zero settlement legs: 6 worth $15,217.00 — five open, plus #28 which reads paid with nothing behind it. The collections queue and the data-quality queue, in one anti-join." },
    { name: "Ledger balance delta", what: "Total debits − total credits: $0.00 (181,080 = 181,080 here). The GL's proof — the one metric allowed, and required, to be boring." },
    { name: "Burn walk delta", what: "LAG over the 14-month opex spine: 2024-08 peaks at $3,210.00, just $14.16 over July's $1,794.00; 2024-01 opens at $1,719.00 with an honestly NULL delta. The board's opening read — a COALESCEd zero at the anchor would fake a baseline." },
    { name: "Cardholder velocity", what: "Swipes per cardholder: 24 / 17 / 14 / 13 lead the book, and four cardholders tie at 4. The fraud desk's first screen — and the tie band where RANK, ROW_NUMBER and DENSE_RANK stop agreeing." },
    { name: "Rail stack reconciliation", what: "Per-rail settlement legs and dollars with a TOTAL row appended: card 16 / $37,364.00, wire 11 / $32,248.00, total 27 / $69,612.00. The stack must fold back on both grains or the close packet doesn't ship." },
    { name: "Regional program mix", what: "Card spend by cardholder region: EU $15,089.23 / 45 swipes / 8 cardholders leads, APAC $11,605.45, US $7,286.16 with the biggest tickets ($383.48 avg), LATAM $852.44 on a single cardholder. Volume-versus-ticket, in one fold." },
  ],

  topics: [
    {
      name: "Transaction folds & conditional counts",
      why: "Every spend read is a fold with a conditional count inside: transactions per day, declined per vendor, reconciled per cardholder. The denominator question rides on every one — COUNT(*) over all transactions versus the receipted subset is the difference between a reconciliation rate and a clearance rate.",
      slugs: ["number-of-rich-customers", "sales-analysis-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Vendor chain joins: lines → catalog → vendors",
      why: "Vendor analytics is a three-hop chain: receipt lines attach to transactions, catalog lines carry the vendor. One wrong join key pairs spend with the wrong vendor and every concentration number downstream inherits the fiction — the chain is where Ramp's screens test join discipline hardest.",
      slugs: ["sales-analysis-ii", "top-travellers", "bank-account-summary-ii"],
    },
    {
      name: "Spend ratios & policy gates",
      why: "Policy is ratio-shaped: reconciled share per vendor, decline rate per cardholder, lines over limit per category — every one a ratio whose denominator must be stated. The query shapes drill rate-by-group with worst groups surfaced and empty groups handled rather than dropped.",
      slugs: ["queries-quality-and-percentage", "ads-performance", "not-boring-movies"],
    },
    {
      name: "Out-of-policy anti-joins",
      why: "Savings detection starts as an anti-join: transactions with no receipt, vendors with no spend this quarter, invoices with no settlement leg. LEFT JOIN + IS NULL (or NOT EXISTS) is the shape, and the trap is filtering the joined table in WHERE — which converts the join and deletes exactly the savings you were hunting.",
      slugs: ["sales-person", "page-recommendations", "students-with-invalid-departments"],
    },
    {
      name: "NULL policy: missing receipts & blank legs",
      why: "Receipt timestamps are NULL until the chase closes, and invoice #28 is paid with no settlement leg at all. COUNT(column) versus COUNT(*) diverges exactly there, and AVG silently skips the pending queue — the policy is a stated decision, not a default.",
      slugs: ["invalid-tweets", "find-customer-referee", "employees-with-missing-information"],
    },
    {
      name: "Receipt clocks & interval logic",
      why: "The reconciliation clock is date arithmetic: JULIANDAY deltas per transaction, swipes overlapping approval windows, receipts lagging by days. The NULL receipt timestamp is the standing trap — awaiting approval is not slow, and averaging over it fabricates the SLA breach.",
      slugs: ["average-time-of-process-per-machine", "leetflex-banned-accounts", "users-that-actively-request-confirmation-messages"],
    },
    {
      name: "Budget calendars & burn buckets",
      why: "Spend runs on calendar buckets: transactions per month via SUBSTR, policy windows, invoices issued in a period. Half-open intervals and month keys are the mechanics, and the midnight boundary is where two 'identical' close reports disagree.",
      slugs: ["monthly-transactions-i", "budget-pacing", "friday-purchases-i"],
    },
    {
      name: "LAG/LEAD burn walks",
      why: "The burn walk is LAG-shaped: this month's opex minus last month's, the 2024-08 peak explained line by line. The first row's NULL delta is part of the story — no prior month, no delta — and hand-waving it to zero mislabels the baseline the finance review quotes.",
      slugs: ["consecutive-transactions-with-increasing-amounts", "week-over-week-churn", "mrr-waterfall"],
    },
    {
      name: "Policy CASE bands",
      why: "Policy tiers are CASE arms evaluated in order: under-limit, near-limit, over, declined. Arm ordering matters — a transaction the earlier arms don't catch lands in the ELSE by definition — and Ramp's screens test whether the ELSE is a contract or a leak.",
      slugs: ["type-of-triangle", "loan-types", "calculate-orders-within-each-interval"],
    },
    {
      name: "Scorecards & vendor argmax",
      why: "The savings review reads scorecards: most-used vendor per category, biggest line per month, top cardholder per budget. Argmax-over-group is the shape, and the deterministic tie-break (value, then name) is what keeps the scorecard stable between renders.",
      slugs: ["most-frequently-ordered-product-per-customer", "manager-of-the-largest-department", "top-five-artists"],
    },
    {
      name: "Window frames & running burn",
      why: "Running settled dollars and cumulative burn are how ops watches a cycle drain — SUM(...) OVER (ORDER BY ...) with a frame decision underneath. The default frame is RANGE, which folds ORDER BY peers together; on the month fold the keys are unique so RANGE and ROWS coincide, and knowing WHY they coincide — instead of assuming they always do — is the senior tell this topic drills.",
      slugs: ["account-balance", "find-cumulative-salary-of-an-employee", "rolling-average-steps"],
    },
    {
      name: "Set-op report stitching",
      why: "The close packet stacks per-rail rows and a grand total into one result — UNION ALL, never UNION, whose silent dedupe can make a genuine repeat vanish while the packet still reconciles. EXCEPT is the rail-versus-book diff in set form, and its direction IS the question: invoices-minus-legs is the untouched-AR sweep, legs-minus-invoices is the orphan check.",
      slugs: ["monthly-transactions-ii", "count-apples-and-oranges", "league-statistics"],
    },
    {
      name: "Latest-state & argmax reads",
      why: "'First receipt per transaction', 'biggest swipe per day', 'latest address per cardholder' — every one is an argmax with a tie policy, and the bare MAX-join-back returns BOTH tied rows and silently doubles every downstream count. The receipt chase and the per-day ticket leaderboard run on this exact decision, tie-break chosen and stated.",
      slugs: ["bikes-last-time-used", "the-most-recent-orders-for-each-product", "product-price-at-a-given-date"],
    },
    {
      name: "Calendar spines & budget pacing",
      why: "The opex spine is 14 dense months, but pacing walks need the months that have no rows yet — and GROUP BY cannot emit groups from nothing. WITH RECURSIVE month spines, LEFT-join zero-fills and an explicit NULL policy for deltas across zero months are how the pacing board stays honest past the edge of the data.",
      slugs: ["restaurant-growth", "find-the-missing-ids", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "CTE staging & the coverage ladder",
      why: "The AR ladder stages the per-invoice leg fold once and CASEs it three ways — exact 21 / partial 1 / none 6 — because the fold is computed once and read three times. Staging is how multi-arm reports stay one scan with one definition of 'settled', and how the reconcile-to-28 check gets a single place to live.",
      slugs: ["investments-in-2016", "department-highest-salary", "managers-with-at-least-5-direct-reports"],
    },
  ],

  theory: [
    {
      id: "ramp-t1",
      q: "A transaction counts as out-of-policy once it exceeds the catalog's per-swipe limit. In a query reporting out-of-policy share by vendor, where does that rule live — and what breaks when it lands in HAVING instead?",
      a: "The over-limit test is a row-level fact — the transaction's amount against the catalog line's limit on one row — so it belongs in WHERE (if out-of-policy rows are the population) or inside the aggregate as SUM(CASE WHEN … THEN 1 ELSE 0 END) (if the share compares flagged to all). Once folded by vendor, the row-level comparison no longer exists: HAVING can only judge group aggregates. The classic failure is folding all transactions per vendor and trying to subtract 'the compliant' in HAVING — they're already inside the total, and no post-aggregation clause can un-mix them. The strong answer recites the pipeline — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — and places every rule by asking: is this a fact about one swipe, or about a vendor? At Ramp that question is the product: a policy rule in the wrong clause doesn't error, it certifies spend that was never compliant.",
      tag: "pipeline",
    },
    {
      id: "ramp-t2",
      q: "Per-vendor spend needs receipt lines joined to catalog lines joined to vendors. Walk the chain — and name the failure mode when one join key is wrong.",
      a: "The chain: receipt lines (order_items) carry the transaction's foreign key and the catalog line's foreign key; catalog lines (products) carry the vendor's foreign key. Every ON must bind the right pair: oi.product_id = p.id, then p.supplier_id = s.id. The failure mode is silent mis-pairing — s.id = p.id joins vendors to catalog lines by coincidence of key values (catalog ids 1..16 against vendor ids 1..6), and the query returns plausible-looking spend attributed to the wrong vendor; nothing errors, and the concentration board ships wrong. Guards: verify cardinalities at each hop (251 lines, 16 catalog lines, 6 vendors, 103 transactions), spot-check one known vendor's spend by hand against the probed $11,130.25, and COUNT(DISTINCT) the transaction grain after the chain to confirm the fan-out didn't blur it. At Ramp the chain IS the savings claim — a concentration number with one wrong hop is worse than no number.",
      tag: "joins",
    },
    {
      id: "ramp-t3",
      q: "27 settlement legs land across 22 distinct vendor invoices. Narrate every count in that sentence — and how you'd report both grains in one query.",
      a: "COUNT(*) over settlement legs reads 27 — leg events, the rows the rail logged. COUNT(DISTINCT invoice_id) reads 22 — invoices served, the business object. COUNT(invoice_id) also reads 27 because the FK is never NULL — NULL-skipping is not deduplication. The gap is five invoices that settle in two legs (1, 5, 12, 19, 22), and folding naively inflates the money story: a leg-grain SUM reads $69,612.00 where the exact invoice book is $65,612.00 — the $4,000.00 difference is the partial #25's early payment, visible only after folding per invoice. The two-grain scorecard folds once and counts twice: per rail, legs AND distinct invoices side by side. The habit the interviewer grades: before any COUNT, say 'one row per what?' — leg event, invoice, rail bucket. Both numbers ship, to different audiences, on purpose.",
      tag: "aggregation",
    },
    {
      id: "ramp-t4",
      q: "shipped_at is NULL for every transaction still awaiting its receipt. Your latency query averages over all 103 transactions. What does that number mean — and what should it mean?",
      a: "As written it means nothing: JULIANDAY(NULL) is NULL, the difference is NULL for the 21 unreceipted transactions, and AVG silently skips NULLs — so the 'all-transaction' average is actually the receipted-only average wearing a lie in its name: computed over 82 rows while the report claims 103. The honest versions: average over receipted transactions and SAY so ('2.98 days across the 82 receipts'), or split the report — latency over receipts, the 14 awaiting-approval and 30 awaiting-receipt queues beside it — because a pending queue is a chase story, not a latency story. The general policy: NULL receipt means 'state unknown yet', not 'zero days' and not 'infinite'. COALESCE to zero launders the pending into instant; COALESCE to a sentinel poisons the average. At Ramp the NULL policy is the SLA — the interviewer wants it stated before the number, not defended after.",
      tag: "nulls",
    },
    {
      id: "ramp-t5",
      q: "Build the month-over-month opex burn walk. Where do LAG's edges bite — the first row, ties, and the ORDER BY?",
      a: "Stage the fold first — month buckets via SUBSTR(spent_on, 1, 7), SUM of the month's lines — then delta over it: burn - LAG(burn) OVER (ORDER BY month). The edges: the first month's LAG is NULL, so its delta is NULL — report it as NULL (no prior month, no delta), never COALESCE to zero, which manufactures a baseline out of nothing. The ORDER BY inside OVER is the entire meaning of 'previous': order by the month key, not by burn — ordering by the measure makes 'previous month' mean 'the next-lower spend', a different and quietly wrong series. A month key is unique by construction — say that, rather than assuming it. On this book the walk reads $1,719.00, $1,440.00, $1,917.00 … with the 2024-08 peak of $3,210.00 as the one month the review annotates — and the edges matter exactly because flat series make wrong ORDER BYs invisible until the quarter someone quotes the chart.",
      tag: "windows",
    },
    {
      id: "ramp-t6",
      q: "WHERE amount > (SELECT AVG(amount) FROM swipes WHERE department = 'ghost') — no swipes run in ghost. Walk me through what happens.",
      a: "A scalar subquery is contractually zero-or-one rows, one column. One row: its value joins the comparison. Zero rows: it yields NULL — not an error, not zero — and amount > NULL is UNKNOWN, so WHERE passes nothing: an above-average-swipe report that returns empty while looking perfectly healthy. That's the empty-inner-query bug, and it ships on filtered staging tables far more often than on full ones — 'it worked for the GTM department' is the bug report. The strong answer also names the other contract edge: two rows from a scalar subquery IS an error — on this book eight cardholders carry two or more vendor invoices, so a per-cardholder scalar status lookup explodes the moment it runs. The correlated cousin — above THIS vendor's own trailing average, re-run per outer row — is a different question with a different cost. At Ramp the follow-up is always: what population did the inner fold cover, and does empty mean 'nothing is above average' or 'nothing was measured'?",
      tag: "subqueries",
    },
    {
      id: "ramp-t7",
      q: "Receipt latency averages 2.98 days with a 2-to-4 spread. How do you compute it, bucket it, and where does BETWEEN break?",
      a: "Compute: JULIANDAY(shipped_at) - JULIANDAY(created_at) per receipted transaction, aggregate, then ROUND(..., 2) exactly once at the display edge — 2.98 is a single final round, not a per-row one. Restrict to shipped_at IS NOT NULL explicitly and say the population (82 receipts) — relying on AVG's NULL-skipping hides the restriction inside the function while the report claims all 103. Bucket by SUBSTR(created_at, 1, 7) for the monthly calendar, or CASE-band the latency itself for the chase SLA histogram. Windows: half-open intervals — created_at >= '2024-03-01' AND < '2024-04-01' — never BETWEEN, which is inclusive both ends and double-counts exactly the midnight boundary when month-end swipes land. And the spread matters more than the mean: a tight 2-to-4 spread is a healthy receipt culture; the same mean with a long tail is a broken chase queue — print fastest and slowest beside the average.",
      tag: "dates",
    },
    {
      id: "ramp-t8",
      q: "Your dashboard says card is 59.3% of settlement legs but 53.7% of settled value. The CFO asks which number is wrong. Answer it.",
      a: "Neither — they are different fractions wearing the same name. By legs: 16 card legs of 27 total, 59.3%. By value: $37,364.00 of the $69,612.00 settlement book, 53.7%. Card carries more, smaller tickets; wire carries fewer, bigger ones (11 legs, $32,248.00 — an average leg of $2,931.64 against card's $2,335.25). Both queries are correct SQL; they disagree because the denominators and the numerators disagree — count-share versus value-share. The fix is definitional: name the share in the column (legs_share, value_share), state the denominator in the title, and never average the two. Then verify by reconciliation: 16 + 11 = 27 legs and $37,364.00 + $32,248.00 = $69,612.00 must fold back before the board ships. At Ramp a share without its denominator isn't a metric — it's the savings narrative choosing its own evidence, and the reviewer knows it.",
      tag: "quality",
    },
    {
      id: "ramp-t9",
      q: "You add a running settled-dollars column over the settlement legs: SUM(amount_cents) OVER (ORDER BY paid_on). What frame is the engine actually using — and when do you override it?",
      a: "The default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE treats ORDER BY peers as one unit — every leg sharing the current row's paid_on joins the fold at once, so the running value jumps by the whole peer group and per-row narration is impossible. On the monthly burn fold the two frames coincide — month keys are unique by construction — and the senior answer is saying WHY they coincide instead of assuming they always do. Override with ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW when the metric is genuinely per-row — a running leg count, a per-row cumulative — and accept that peer order then needs a deterministic tiebreak (id) or the column itself is unstable. LAG is immune to all of this (it takes one row, not a frame), which is why the burn walk uses LAG while cash-style running balances use frames. At Ramp the tell is being able to say, out loud, which frame ran and what it did to same-timestamp legs — a running total that silently includes or excludes peers is a different number on the close packet.",
      tag: "frames",
    },
    {
      id: "ramp-t10",
      q: "The close packet needs per-rail rows and a grand total in one result, and vendor ops needs 'invoices the book has but no settlement leg touched'. Which set operators — and what does each one's dedupe behavior cost you?",
      a: "The packet is UNION ALL: per-rail folds stacked with a 'TOTAL' row appended. ALL is non-negotiable — UNION sorts and dedupes, so if two branches ever produced identical rows (two rails with the same count and total), one would vanish and the stack would still reconcile to 27 legs and $69,612.00, which is the worst way to lose a row. Vendor ops' question is EXCEPT: invoice ids EXCEPT leg invoice-ids is the untouched-AR anti-join in set form — 6 invoices, $15,217.00 — and direction is the entire question, because the reverse (legs EXCEPT invoices) answers 'orphan legs', empty here but the first thing a bad rail load produces. INTERSECT rarely appears in close work but is the natural 'in both feeds' check. The discipline: set operators compare columns positionally, so write the SELECT lists side by side and confirm the grains match — an invoice-id column against a leg-id column is how diffs return confident nonsense.",
      tag: "setops",
    },
    {
      id: "ramp-t11",
      q: "Three shapes find vendor invoices with no settlement leg: LEFT JOIN … IS NULL, NOT EXISTS, NOT IN. Which do you reach for at 9am, and what can go wrong with the other two?",
      a: "The untouched-AR sweep — 6 invoices, $15,217.00 — is the money anti-join, so correctness under dirty data wins: NOT EXISTS with a correlated probe is the default, because a NULL key in the subquery simply matches nothing and the outer row survives. LEFT JOIN + IS NULL is the sibling when you also want the unmatched rows' columns (per-status exposure split: five open invoices against #28), and it's what the coverage ladder stages. NOT IN is the one that pages you at midnight: one NULL invoice_id in the staging table makes x NOT IN (…NULL…) UNKNOWN for every row, the sweep returns zero rows, and 'no untouched invoices' ships as good news over $15,217.00 of exposure. If NOT IN must be used, guard the subquery with WHERE key IS NOT NULL — and say out loud that you did. The habit the interviewer grades is not reciting the trap; it's naming the population each shape keeps and choosing on purpose.",
      tag: "antijoin",
    },
    {
      id: "ramp-t12",
      q: "The coverage ladder folds settlement legs per invoice, then CASEs the fold into exact, partial and none. Why stage the fold in a CTE instead of writing it inline — and what are the house rules for staging?",
      a: "Because the fold is computed once and read three times: the none arm tests the fold IS NULL, the partial arm compares it below the invoice amount (#25, $4,000.00 of $6,148.00), the exact arm tests equality ($65,612.00 across 21 invoices). Inline, you'd repeat the LEFT-JOIN-and-SUM in every arm — three scans, three chances to drift — or discover that no engine aggregates an aggregate's input inside a CASE arm without staging. House rules: one fold per stage, named for what it holds (leg_fold, monthly, first_leg — never cte1), and the outer query thin enough to read as the business question. The same staging is why the burn walk folds opex monthly once and lets LAG walk the folded rows instead of windowing over raw expense lines. Staging is not ceremony; it's how a three-arm ladder stays one scan with one definition of 'settled' — and how the reconcile-to-28 check (21 + 1 + 6) has a single place to live.",
      tag: "staging",
    },
    {
      id: "ramp-t13",
      q: "Someone joins settlement legs to vendor invoices and SUMs invoice amounts, then reports the book grew to $111,917.00. Walk me through what actually happened — and the two honest fixes.",
      a: "The book is 28 invoices worth $86,977.00. The join is one-to-many — 27 legs, and five invoices (#1, #5, #12, #19, #22) draw two legs each — so each one-side invoice row repeats per matching leg, and SUM(i.amount_cents) counts the split invoices twice: $86,977.00 plus $24,940.00 of double-counted splits = $111,917.00. Nothing errored; the query is summing at the wrong grain. Fix one: aggregate the many-side first — fold legs per invoice_id in a derived table or CTE — then join the fold, one row per invoice, sums clean. Fix two: keep the join for row-level questions but aggregate only many-side columns, never one-side money. The tell that a fold is at risk: the row count changes across the join (28 invoices in, 27 rows out under an INNER join — the six untouched invoices vanish entirely) and the summed column belongs to the one side. At Ramp that bug doesn't crash — it publishes a book $24,940.00 heavier than it is, straight into the board memo.",
      tag: "fanout",
    },
    {
      id: "ramp-t14",
      q: "Money is INTEGER cents end to end. Where do /100.0, ROUND, and AVG belong in a money pipeline — and what does AVG(amount_cents / 100) silently produce?",
      a: "Cents stay INTEGER through every fold — SUM, MIN, MAX, GROUP BY all preserve them exactly — and the dollar conversion happens once, at the display edge: ROUND(SUM(amount_cents) / 100.0, 2). The 100.0 is load-bearing: /100 is integer division and truncates the remainder before ROUND can see it, which is how a 6.8% decline rate collapses to 6 and a $53.70 leg prints as $53. AVG(amount_cents / 100) compounds the damage — each row is truncated before averaging, so the mean runs over rounded-down dollars and carries a systematic downward bias; AVG(amount_cents) / 100.0 is the honest form — average in exact cents, convert once. And averages are the one place cents can't survive display: AVG of cents is inherently fractional, so convert immediately after the aggregate, never before it. The policy in one line: aggregate in cents, convert once, round once — and if a query does both (/100.0 mid-pipeline and ROUND at the end), assume the author didn't know which layer owns precision.",
      tag: "cents",
    },
    {
      id: "ramp-t15",
      q: "Your one-pass opex census prints NULL in a category-dollars column because that class has no rows. When is COALESCE the right fix — and when does it launder a real signal?",
      a: "COALESCE belongs at the display edge, when the consumer is a human or a CSV that can't hold NULL: COALESCE(SUM(amount_cents) FILTER (WHERE category = 'Software'), 0) prints $0.00 and the packet stays readable. Mid-pipeline it's a lie: a coalesced zero means 'we measured, it's zero', and 'no Software lines exist on this book' and 'Software spent zero' are different findings — the first might be a miskeyed category value. The related trap is division: x/0 in SQLite yields NULL, not an error, so a rate computed over an empty denominator doesn't crash — it disappears, and the dashboard renders a blank nobody investigates. NULLIF(denominator, 0) plus an explicit IS NULL branch in the report keeps 'nothing measured' visible as its own state. The interview shape: for every COALESCE you write, say what the NULL meant. 'Empty class, keep honest at the edge' passes; 'the fold was over the wrong population' means fix the fold, not the display.",
      tag: "coalesce",
    },
    {
      id: "ramp-t16",
      q: "The opex spine runs 14 dense months, 2024-01 through 2025-02. The pacing board wants the full fiscal year — months that have no spend rows yet. How do you print months that don't exist in the data?",
      a: "GROUP BY emits groups from rows — no rows, no group — so the fix is a calendar spine: generate the month range with WITH RECURSIVE (or a calendar table), LEFT JOIN the folded burn walk onto it by month key, and COALESCE the money columns to 0 at the display edge. Two discipline points. First, anchor the spine on a parameterized range, not on MIN/MAX of the data — a data-anchored spine changes shape when the data changes, and the pacing board silently re-bases. Second, decide the delta policy on spine rows: LAG across a zero month is a real comparison (0 versus prior — a real cliff worth annotating), while LAG across an absent month was no comparison at all — those are different sentences on the board. Spines also catch holes rather than fill them: spine LEFT JOINed the other way (months minus data) is the 'which month did spend go dark' query, and on a book this dense it's the only way a hole could ever surface.",
      tag: "spine",
    },
    {
      id: "ramp-t17",
      q: "The burn walk's first delta is NULL and someone proposes filtering that row out. Defend or reject — and where else does that edge NULL show up?",
      a: "Reject — the first-row NULL is the walk's anchor, not missing data. It says 'no prior month exists to compare against', which is true and load-bearing: filter it and the board's axis starts at 2024-02 with no indication a month was dropped, and anyone reconciling the walk against COUNT(*) of months sees 13 versus 14. The same NULL appears anywhere LAG/LEAD meets an edge: the last month's LEAD is NULL, and every PARTITION BY walk starts with one. The trap to name out loud: comparisons against that NULL are UNKNOWN, so a downstream WHERE delta < 0 silently excludes the anchor row as a side effect — if the filter isn't meant to be an edge policy, write delta IS NULL OR delta < 0, or say why the anchor shouldn't qualify. The policy in one sentence: keep edge NULLs in the result; if the display can't hold them, COALESCE at the edge with a sentinel the business reads deliberately — never silently, and never zero, which manufactures a baseline out of nothing.",
      tag: "lag",
    },
    {
      id: "ramp-t18",
      q: "The March report filters WHERE SUBSTR(spent_on, 1, 7) = '2024-03'. It returns the same rows as a range predicate — so why does the house style ban the function form?",
      a: "Because the plan is different even when the rows aren't. A predicate that wraps the column in a function can't seek: the engine computes SUBSTR for every row and scans the whole table, while spent_on >= '2024-03-01' AND spent_on < '2024-04-01' compares the bare column to constants and seeks straight to March. On 36 opex lines the scan is free; on a leg-sized or swipe-sized table it's the difference between milliseconds and a timeout, and the query that was 'fine in staging' becomes the incident. The habits: bucket by range, not by function; if a month key is genuinely needed, pre-compute it in staging where it can be indexed; and read EXPLAIN QUERY PLAN before calling a fold expensive — SCAN over a filtered column is the tell. Correctness-identical, plan-different is the whole story: the strong answer optimizes predicates, not just joins, and can say when the cheap form stops being cheap.",
      tag: "sargable",
    },
    {
      id: "ramp-t19",
      q: "Define Ramp's policy-violation rate and vendor concentration so a reviewer can't relitigate them. What makes each definition hold up?",
      a: "Both live or die by their denominators, stated in the same breath as the number. Policy-violation rate: declined swipes plus out-of-policy arms, over ALL swipes — 7 of 103 reads 6.8%; the 7-of-96 variant (declines over approved) is a different metric, a post-authorization failure rate, and quoting it as the violation rate is how a board relitigates a trend. Vendor concentration: the top vendor's share of total card spend — $11,130.25 of $34,833.28 reads 32.0%, the top two sum to 58.7% — share of the whole book, never of the slided subset, and summed across vendors, never averaged (shares of one denominator add). The habits that make definitions hold: the denominator appears in the column name and the title; the population left out is printed beside the number (the 21 unposted swipes stay in the denominator, and that's a stated choice); and any redefinition goes through metric review, not through a WHERE clause someone added on a Friday. At Ramp the metric isn't the number — it's the number, the denominator, and what the denominator excluded.",
      tag: "metrics",
    },
    {
      id: "ramp-t20",
      q: "'First receipt per transaction', 'biggest swipe per day', 'latest address per cardholder' — same shape, different traps. How do you write a reliable argmax, and what breaks with the MAX-join-back?",
      a: "The reliable shape stages the pick: ROW_NUMBER() OVER (PARTITION BY transaction ORDER BY shipped_at, id) = 1 — the id is what makes 'first' deterministic when two receipts share a timestamp, which chased batches produce routinely. The alternative when you only need the timing is the aggregate fold: MIN(JULIANDAY(shipped_at) - JULIANDAY(created_at)) per transaction — no tie problem, because MIN over equal timestamps is the same value, and it's exactly how the 2.98-day receipt latency stays stable. What breaks is the bare MAX-join-back: join the table to a per-key MAX fold and any key with a tie returns BOTH rows, so every downstream count and sum silently doubles — the fan-out bug wearing a window's clothes. And pick the tie-break column before you need it: id is fine, a sub-second timestamp is better, but 'whatever the plan does' is how two runs of the same query hand the crown to different rows. Determinism is chosen, then stated.",
      tag: "argmax",
    },
    {
      id: "ramp-t21",
      q: "The audit pack wants each split invoice's leg ids as one cell — '1, 3' for invoice #1. How do you build it, and what does GROUP_CONCAT not promise?",
      a: "GROUP_CONCAT(p.id, ', ') over a fold grouped by invoice is the tool, with two honest caveats. Order: without ORDER BY inside the aggregate (SQLite 3.44+) or an explicitly ordered subquery feeding it, the concatenated order is whatever the scan produced — reproducible only until the plan changes, which is not an audit property. Volume: a big group produces a cell of unbounded length; caps, truncation, and where truncation lands are all silent. So the house shape stages the per-invoice fold first (invoice, leg count), filters to the split invoices — COUNT(*) = 2, exactly five of them: #1, #5, #12, #19, #22 — and concatenates from the small, ordered set, with the column named for its order guarantee. For anything auditors will diff between runs, sort the ids and say so; for a human-readable hint cell, 'unordered' in the column name is the honest label. The register the pack diffs is five rows long — build it small, ordered, and stated.",
      tag: "concat",
    },
    {
      id: "ramp-t22",
      q: "Duplicate-charge detection: same cardholder, same vendor, same amount, same day. How do you write the self-join so each duplicate pair counts exactly once — and what do <> and a bare join cost you?",
      a: "Self-join the transaction book to itself ON cardholder, vendor chain, amount and day, then canonicalize with o1.id < o2.id: the smaller id always takes the left seat, so each unordered pair appears exactly once. The alternatives fail in the two directions that matter: o1.id <> o2.id matches both orientations, so every pair counts twice and the review queue doubles; dropping the id guard entirely matches every same-amount peer including the row against itself — a fan-out, not a pair. Two policy edges to state: the day boundary is a decision (same calendar day via SUBSTR, or within 24 hours via JULIANDAY — pick and say), and precision beats recall because every flagged pair costs an analyst hour. The upside of getting it right is the KPI itself: duplicate-charge rate is flagged pairs over legs, and a canonically-joined scan is the only version of that number a reviewer will sign.",
      tag: "dedupe",
    },
    {
      id: "ramp-t23",
      q: "A board deck shows statement volume by cycle, and one cycle includes the next cycle's first day. What class of bug is this, and how do you date-grain defensively?",
      a: "A boundary bug: the cycle was cut with BETWEEN '2024-03-01' AND '2024-03-31' — or worse, '2024-03-31 23:59:59', which still misses fractional seconds — instead of a key or a half-open range. The defensive kit: prefer keys over filters — SUBSTR(paid_on, 1, 7) or STRFTIME('%Y-%m', paid_on) partitions every row exactly once, so no row can land in two buckets; when a range is unavoidable, write it half-open (>= start AND < next start) and let the next window own its first instant; never hand-write a month's last day, because 28/30/31 is exactly the literal that's wrong twice a year. The deeper point for a card company: statement cycles aren't calendar months — they close on a schedule — so the cycle key comes from the cycle table joined on close dates, not from a string prefix that assumes the calendar. Any date literal in a boundary position is read as a bug until proven a convention.",
      tag: "grain",
    },
    {
      id: "ramp-t24",
      q: "It's close night. Transaction book, invoice ladder, rail stack, GL — four feeds. Order the checks, name the query shapes, and say what each check is allowed to find.",
      a: "Coarse to fine, each with a contract. First the policy census: one pass over transactions, classed reconciled / awaiting-receipt / awaiting-approval / declined via FILTER — 52 / 30 / 14 / 7, reconciling to 103 — this finds classification errors. Second the AR ladder: fold legs per invoice, CASE the fold into exact / partial / none — 21 / 1 / 6, $65,612.00 / $6,148.00 / $15,217.00 — with the contradictions in their own arms: #11 void-with-leg ($925.00) routes to risk, #28 paid-no-legs ($1,756.00) routes to engineering — this finds missing money movement. Third the rail stack: UNION ALL per rail — card 16 / $37,364.00, wire 11 / $32,248.00, TOTAL 27 / $69,612.00 — this finds rail drift the per-invoice view can't. Last the GL: debits 181,080 equal credits 181,080, delta zero, plus per-account nets (cash $44,196.00, receivables $16,440.00) — this finds bookkeeping breaks the operational views are blind to. Nothing is optional, because each query is blind to what the next one owns; the close isn't 'queries ran', it's 'every contract held'.",
      tag: "recon",
    },
  ],

  mcqs: [
    {
      id: "ramp-mcq-1",
      prompt: "Card settlements are $37,364.00 of the $69,612.00 book. A teammate computes the card value share as SUM(card_cents) / SUM(total_cents). What prints?",
      choices: ["53.7 — the share, correctly", "0.5366 — the raw ratio", "0 — INTEGER cents divided by INTEGER cents truncate to zero", "54 — SQLite rounds up"],
      answer: 2,
      why: "Two INTEGER columns divide with truncation: 37364 / 69612 = 0 before any rounding. The house shape is 100.0 * SUM(card_cents) / SUM(total_cents) — real promotion first, single ROUND last — which prints 53.7.",
      notes: [
        { choice: 0, why: "53.7 needs the 100.0 promotion; the bare integer division already truncated to 0 and nothing downstream recovers it." },
        { choice: 1, why: "0.5366 is what REAL arithmetic returns without the ×100 — a different display contract, and unreachable once the division truncates to 0." },
      ],
      difficulty: "easy",
    },
    {
      id: "ramp-mcq-2",
      prompt: "Which expression counts VENDORS touched (not receipt-line rows) from the receipt-lines table joined to the catalog?",
      choices: ["COUNT(*)", "COUNT(product_id)", "COUNT(DISTINCT supplier_id)", "SUM(supplier_id)"],
      answer: 2,
      why: "COUNT(*) and COUNT(product_id) both read 251 — one row per receipt line. COUNT(DISTINCT supplier_id) folds the lines back to the 6 vendors. Both grains are real; the census must name which one it prints.",
      notes: [
        { choice: 1, why: "COUNT(column) skips NULLs, not duplicates — with a NOT NULL FK it equals COUNT(*) at 251. DISTINCT is the fold; NULL-skipping isn't." },
        { choice: 3, why: "SUM adds foreign keys — a meaningless number that changes when any vendor rings once more. Keys are for joining, never for folding." },
      ],
      difficulty: "easy",
    },
    {
      id: "ramp-mcq-3",
      prompt: "The opex census reads 36 lines worth $25,416.00. Which pair names the $1,680.00 and the $3,210.00 correctly?",
      choices: [
        "$1,680.00 is the peak month; $3,210.00 is the biggest line",
        "$1,680.00 is the biggest single line; $3,210.00 is the peak month (2024-08)",
        "Both are monthly totals in different years",
        "Both are Rent aggregates — Rent is the whole book",
      ],
      answer: 1,
      why: "MAX over the line grain reads $1,680.00; the calendar fold by month reads $3,210.00 in 2024-08. Two grains, two aggregates — and a pack that swaps them misstates both the outlier and the season.",
      notes: [
        { choice: 0, why: "Exactly inverted — the month fold sums lines, so it exceeds any single line; the swap is the classic grain confusion." },
        { choice: 2, why: "The line grain has no month of its own in the number — conflating grains is the bug, not a coincidence of values." },
      ],
      difficulty: "easy",
    },
    {
      id: "ramp-mcq-4",
      prompt: "The receipt-latency metric: AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) over all 103 transactions, where 21 have NULL shipped_at. What actually computes?",
      choices: [
        "An average over 103 transactions, pending counting as zero days",
        "An average over the 82 receipted transactions — AVG skips NULLs — while the report claims 103",
        "A NULL result, because any NULL poisons AVG",
        "An error: JULIANDAY of NULL is invalid",
      ],
      answer: 1,
      why: "AVG ignores NULL rows, so the arithmetic runs over the 82 receipts — but the query's name says all transactions. The honest fix is explicit: WHERE shipped_at IS NOT NULL plus a population count beside the metric, so '2.98 days' and 'over 82 receipts' travel together.",
      notes: [
        { choice: 0, why: "AVG never converts NULL to zero — that's COALESCE. Zero-day pendings would drag the mean toward zero; skipping is what actually happens, silently." },
        { choice: 2, why: "NULL poisons row-level comparisons, not aggregates — SUM/AVG/COUNT(column) all skip NULLs by design. The danger is the skipped rows nobody counted." },
      ],
      difficulty: "medium",
    },
    {
      id: "ramp-mcq-5",
      prompt: "The policy ladder reads: WHEN limit >= 200 THEN 'premium' … ELSE 'standard'. What does the catalog's census print?",
      choices: [
        "2 premium / 14 standard — the band holds the top catalog lines",
        "0 premium / 16 standard — the premium band is empty; MAX(limit) is $199.99, so the ELSE swallows the book",
        "16 premium — every line qualifies at >= 200 cents",
        "A syntax error — the >= comparison needs a CAST",
      ],
      answer: 1,
      why: "The catalog's priciest line caps at $199.99, so no row satisfies the >= 200 arm: premium prints 0 and standard swallows all 16. At Ramp that emptiness is the finding — the arm documents a band the policy deliberately doesn't have.",
      notes: [
        { choice: 0, why: "Inventing premium rows is the overclaim the census exists to catch — 8 lines sit mid (50–200) and 8 budget (<50)." },
        { choice: 2, why: "Units: limits are dollars, not cents — 200 means $200.00, and no line crosses it. Unit drift is how bands silently invert." },
      ],
      difficulty: "medium",
    },
    {
      id: "ramp-mcq-6",
      prompt: "Invoices LEFT JOIN their settlement legs, then WHERE l.legs > 0 to drop empties. What happens to the six untouched invoices?",
      choices: [
        "Nothing — the join already kept them",
        "They vanish: the leg-count filter on the joined fold's columns deletes them, silently converting the join to an INNER",
        "They appear once with legs = 0",
        "SQLite keeps them and fills legs with '0'",
      ],
      answer: 1,
      why: "Filtering the LEFT-joined fold's columns in WHERE discards the NULL-payload rows — the untouched invoices — converting the anti-join into an inner join and emptying the collections queue. The fold belongs in a CTE; predicates on joined columns belong in ON or in the fold, not WHERE.",
      notes: [
        { choice: 0, why: "The join kept them, but a WHERE on right-side columns un-keeps them — filter placement, not join type, decided the population." },
        { choice: 2, why: "A WHERE can't manufacture zero rows — that's COALESCE territory, and only when NULL genuinely means zero rather than 'no legs landed'." },
      ],
      difficulty: "medium",
    },
    {
      id: "ramp-mcq-7",
      prompt: "Declines are 7 of 103 transactions. Which expression reports the decline rate correctly?",
      choices: [
        "100 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*)",
        "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*)",
        "100 * COUNT(status = 'cancelled') / COUNT(*)",
        "The same CASE share over rows pre-filtered to declined in WHERE",
      ],
      answer: 1,
      why: "100.0 promotes to real arithmetic BEFORE the division — 7/103 reads 6.8 — and COUNT(*) runs over the same unfiltered fold as the numerator, so no drift. The integer-first shape computes 7*100 = 700, 700/103 = 6 — a full point of rate silently destroyed.",
      notes: [
        { choice: 0, why: "INTEGER × INTEGER stays INTEGER: 700/103 truncates to 6, and the '6.8%' the funnel quotes never prints." },
        { choice: 2, why: "COUNT(boolean) counts non-NULL results, and the comparison returns 0 or 1, never NULL — the 'rate' reads ~100 for every group." },
      ],
      difficulty: "medium",
    },
    {
      id: "ramp-mcq-8",
      prompt: "A one-pass census prints 16 card legs / $37,364.00 and 11 wire legs / $32,248.00. What must be true before the board ships?",
      choices: [
        "The legs must fold back: 16 + 11 = 27 and $37,364.00 + $32,248.00 = $69,612.00 — otherwise a rail class is missing or duplicated",
        "The rails must be equal in both legs and value",
        "Nothing — the census is two independent aggregates",
        "The rails must be sorted alphabetically before shipping",
      ],
      answer: 0,
      why: "The one-scan identity is the audit: the FILTER arms partition the same 27 rows, so the pieces must sum back to the whole on both grains. A census whose rails sum to 28 legs or $70,000.00 has a join fan-out or an arm overlap, and the board would inherit it.",
      notes: [
        { choice: 1, why: "The rails are deliberately unequal (16/11 legs, $37,364.00/$32,248.00) — equality isn't the invariant; the fold-back is." },
        { choice: 2, why: "Independent-looking aggregates over the same table are exactly where a stray CASE arm double-counts — the reconciliation is the deliverable." },
      ],
      difficulty: "hard",
    },
    {
      id: "ramp-mcq-9",
      prompt: "'Vendors above average spend': one query averages $34,833.28 over 6 vendor folds (≈$5,805.55), another over 251 receipt lines (≈$138.78). Both SQL, both 'average'. What happened?",
      choices: [
        "One query is wrong — averages must always run on the line grain",
        "A grain collision: vendor-fold average versus line-grain average differ by ~42x, and the watchlist membership changes completely",
        "Rounding drift between two engines",
        "The line-grain average is NULL because lines carry no vendor",
      ],
      answer: 1,
      why: "Both averages are correct arithmetic over different grains — one row per vendor fold versus one row per receipt line. The vendor watchlist built on the line-grain threshold flags nearly every vendor; the fold-grain threshold flags two. State the grain, then the number.",
      notes: [
        { choice: 0, why: "Neither is wrong — they answer different questions. 'Above-average vendor' is undefined until the grain is named." },
        { choice: 2, why: "A 42x gap is not rounding — drift lives in the third decimal, not in orders of magnitude." },
      ],
      difficulty: "hard",
    },
    {
      id: "ramp-mcq-10",
      prompt: "WHERE created_at BETWEEN '2024-12-01' AND '2025-01-01' is meant to cut December's swipes. What's the flaw?",
      choices: [
        "None — BETWEEN is the idiomatic month filter",
        "BETWEEN is inclusive both ends: any 2025-01-01 midnight timestamp is counted in both December and its neighbor report",
        "BETWEEN only works on INTEGER columns",
        "SQLite rewrites BETWEEN to an equality and drops the range",
      ],
      answer: 1,
      why: "BETWEEN is closed on both ends, so a transaction stamped exactly 2025-01-01T00:00:00 satisfies the filter — and its January twin. The half-open shape — >= '2024-12-01' AND < '2025-01-01' — is the month filter that can't double-count a boundary.",
      notes: [
        { choice: 0, why: "The double-count is invisible until two monthly reports both claim the same midnight swipe — the reconciliation that catches it runs a month late." },
        { choice: 2, why: "BETWEEN works on any comparable type, dates included — the flaw is semantics, not type support." },
      ],
      difficulty: "hard",
    },
    {
      id: "ramp-mcq-11",
      prompt: "A running settled-dollars column: SUM(amount_cents) OVER (ORDER BY paid_on). Two settlement legs share the same paid_on. What does the default frame do?",
      choices: [
        "Skips the second leg — frames never fold peers",
        "Folds both legs at once — the default frame is RANGE, which treats ORDER BY peers as one unit",
        "Errors — peers make the frame ambiguous",
        "Switches to ROWS automatically and picks the faster leg",
      ],
      answer: 1,
      why: "The default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes every peer of the current ORDER BY value — the running value jumps by the whole peer group. On unique keys (the monthly burn fold) RANGE and ROWS coincide; on tied paid_ons they diverge, and the analyst who can't say which frame ran can't explain the jump.",
      notes: [
        { choice: 0, why: "RANGE never skips peers — it sweeps them in. ROWS is the frame that treats rows one at a time, and only an explicit override gets you that." },
        { choice: 2, why: "Peers are perfectly legal; the engine just folds them as one boundary unit. The ambiguity is in the narrative, not the execution." },
      ],
      difficulty: "medium",
    },
    {
      id: "ramp-mcq-12",
      prompt: "WHERE i.id NOT IN (SELECT invoice_id FROM staging_legs) — staging_legs.invoice_id is nullable in the copy vendor ops loaded. What can happen?",
      choices: [
        "Runs slower but stays correct",
        "One NULL in the subquery empties the entire result — every invoice fails the test",
        "NULL invoice_ids are treated as unmatched and kept",
        "SQLite rewrites NOT IN as an anti-join automatically",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE — the comparison is UNKNOWN and NOT UNKNOWN is still UNKNOWN. One stray NULL silently returns zero rows: the untouched-AR sweep (6 invoices, $15,217.00) ships as 'all clear'. The NULL-proof shapes: NOT EXISTS, or LEFT JOIN … IS NULL.",
      notes: [
        { choice: 0, why: "The failure is correctness, not latency — an empty sweep that reads as good news to the exception queue is the worst kind of wrong." },
        { choice: 2, why: "NULLs poison the whole membership test for every row; they don't fail through to kept rows." },
      ],
      difficulty: "hard",
    },
    {
      id: "ramp-mcq-13",
      prompt: "The rail stack uses UNION ALL. A teammate swaps in plain UNION. Card reads 16 legs / $37,364.00 and wire 11 / $32,248.00 — what changes?",
      choices: [
        "Nothing — the rows are distinct, so UNION keeps them all",
        "The TOTAL row gets re-labeled by UNION",
        "Nothing today — but if two rails ever post identical legs-and-dollars rows, UNION silently drops one while the packet still reconciles",
        "UNION doubles the TOTAL row",
      ],
      answer: 2,
      why: "UNION dedupes identical whole rows; today card / wire / TOTAL differ, so the output matches — but the guarantee is gone. A future rail posting the same count and total as another would vanish while 16 + 11 = 27 still folds back, which is the worst way to lose a row. UNION ALL is the contract: append, never dedupe.",
      notes: [
        { choice: 0, why: "True today, and exactly why the trap ships: the query is only as safe as the data happens to be this month." },
        { choice: 1, why: "UNION never relabels — it only removes duplicate rows. The danger is silent subtraction, not renaming." },
      ],
      difficulty: "medium",
    },
    {
      id: "ramp-mcq-14",
      prompt: "The velocity ladder: four cardholders tie at 4 swipes, right after a 5-swipe cardholder. RANK hands them all rank 6. What do ROW_NUMBER and DENSE_RANK print?",
      choices: [
        "Both print 6, 6, 6, 6 — all three functions agree on ties",
        "ROW_NUMBER 6, 7, 8, 9; DENSE_RANK 6, 6, 6, 6",
        "ROW_NUMBER 6, 6, 6, 6; DENSE_RANK 6, 7, 8, 9",
        "Both error — ties must be broken before ranking",
      ],
      answer: 1,
      why: "ROW_NUMBER invents a strict order the data doesn't contain; DENSE_RANK keeps the tie but continues at 7, flattening the gap to the next band; RANK tells the truth — tie at 6, next band at 10 — and the skip IS the band's width. Picking the function IS the metric definition.",
      notes: [
        { choice: 0, why: "That's DENSE_RANK alone; ROW_NUMBER never shares a value." },
        { choice: 3, why: "Ties are legal everywhere in SQLite windows — breaking them is a display choice, not a requirement." },
      ],
      difficulty: "medium",
    },
    {
      id: "ramp-mcq-15",
      prompt: "SELECT SUM(i.amount_cents) FROM invoices i JOIN payments p ON p.invoice_id = i.id reports $111,917.00. The invoice book is $86,977.00. What happened?",
      choices: [
        "Rounding drift across 27 legs",
        "Five invoices settle in two legs (#1, #5, #12, #19, #22) — the one-side rows repeat per match and get double-counted: +$24,940.00 of fiction",
        "The six untouched invoices ($15,217.00) leaked in",
        "Void invoice #11 ($925.00) was counted twice",
      ],
      answer: 1,
      why: "The join is one-to-many — 27 legs against 28 invoices, five with two legs each — so each split invoice's amount enters the SUM twice: $86,977.00 + $24,940.00 = $111,917.00. Nothing errored. Fix: fold the many side per invoice first, then join the fold — or aggregate only many-side columns.",
      notes: [
        { choice: 2, why: "Untouched invoices have no legs, so an INNER join drops them entirely — they can't inflate anything." },
        { choice: 3, why: "#11 has exactly one leg; single-leg invoices count once. The fiction is exactly the split set: $4,860.00 + $5,284.00 + $4,723.00 + $5,614.00 + $4,459.00." },
      ],
      difficulty: "hard",
    },
    {
      id: "ramp-mcq-16",
      prompt: "Which expression reports the average settlement leg correctly?",
      choices: [
        "AVG(amount_cents) / 100.0",
        "AVG(amount_cents / 100)",
        "AVG(amount_cents) — AVG divides by 100 internally",
        "ROUND(AVG(amount_cents), 2)",
      ],
      answer: 0,
      why: "Average in exact cents, convert once: AVG folds the INTEGER cents precisely, and the /100.0 division happens after the mean, on REAL. Option 2 truncates every row to whole dollars BEFORE averaging — a systematic downward bias; option 3 prints cents wearing a dollar label, 100x off; option 4 rounds the wrong quantity — cents rounded to two decimals are still cents.",
      notes: [
        { choice: 1, why: "Per-row integer division happens before the mean; no later step recovers the truncated cents. The .0 is load-bearing." },
        { choice: 2, why: "The classic unit drift — the eye reads $257,822 for what is $2,578.22 of legs." },
      ],
      difficulty: "medium",
    },
    {
      id: "ramp-mcq-17",
      prompt: "The opex census adds COUNT(*) FILTER (WHERE category = 'Software') and SUM(amount_cents) FILTER (WHERE category = 'Software') — no Software lines exist. What do the two columns return?",
      choices: [
        "Both return 0",
        "COUNT returns 0; SUM returns NULL",
        "COUNT returns NULL; SUM returns 0",
        "Both return NULL",
      ],
      answer: 1,
      why: "A count of nothing is zero; a sum of nothing is NULL — the fold refuses to invent a number. It's why money columns in one-pass censuses get COALESCE(SUM(...), 0) at the display edge while COUNT columns are left honest — and why a NULL dollar cell means 'empty class', not '$0.00 spent'.",
      notes: [
        { choice: 0, why: "Half right for the wrong reason: COUNT is 0, but SUM never fabricates 0 from an empty set." },
        { choice: 2, why: "Swapped: COUNT counts rows (none → 0); SUM folds values (none → NULL, the 'no data' signal)." },
      ],
      difficulty: "medium",
    },
    {
      id: "ramp-mcq-18",
      prompt: "GROUP_CONCAT(p.id, ', ') over legs per invoice feeds an audit diff. What does GROUP_CONCAT NOT promise?",
      choices: [
        "That the string is built from the group's rows",
        "That the order inside the string is stable across runs",
        "That it accepts a custom separator",
        "That it skips NULL ids",
      ],
      answer: 1,
      why: "Without ORDER BY inside the aggregate (SQLite 3.44+) or an explicitly ordered subquery feeding it, concatenation order is whatever the scan produced — reproducible only until the plan changes, which is not an audit property. For anything auditors diff between runs, sort the ids and say so; label hint cells 'unordered'.",
      notes: [
        { choice: 0, why: "That IS the contract: the group's rows folded into one cell." },
        { choice: 2, why: "The separator argument is standard — the order is the missing guarantee." },
      ],
      difficulty: "hard",
    },
    {
      id: "ramp-mcq-19",
      prompt: "A per-cardholder status lookup runs as a scalar subquery over a staging table where one cardholder has TWO rows. What happens?",
      choices: [
        "The first row wins",
        "NULL — the extra row is dropped",
        "An error — a scalar subquery is contractually zero-or-one rows",
        "Both rows average",
      ],
      answer: 2,
      why: "'Scalar' is a promise, not a hope: two rows from a scalar subquery is a hard error. The empty edge (zero rows → NULL → every comparison UNKNOWN) is the quiet failure; the two-row edge is the loud one — and it fires the moment staging dedupe slips. Verify the inner fold's GROUP BY; don't assume.",
      notes: [
        { choice: 0, why: "Nothing 'wins' — the engine refuses to pick one row from a contract that allows at most one." },
        { choice: 1, why: "Zero rows yields NULL; two rows never silently collapse to one." },
      ],
      difficulty: "medium",
    },
    {
      id: "ramp-mcq-20",
      prompt: "Partial-coverage share: 100.0 * SUM(partial legs) / COUNT(*) over a vendor whose leg count is 0. What does SQLite return?",
      choices: [
        "An error: division by zero",
        "0",
        "NULL — division by zero yields NULL, the rate silently disappears",
        "Infinity",
      ],
      answer: 2,
      why: "SQLite returns NULL for x/0 — no crash, no zero, just a vanished cell the dashboard renders as blank. The guard is NULLIF(denominator, 0) plus an explicit IS NULL branch in the report, so 'no legs measured' prints as its own state instead of disappearing. Rates over empty populations are a definition, not a default.",
      notes: [
        { choice: 0, why: "Other engines raise; SQLite's NULL is quieter and more dangerous." },
        { choice: 1, why: "Zero would claim 'measured, clean' — a different finding from 'nothing measured'." },
      ],
      difficulty: "medium",
    },
    {
      id: "ramp-mcq-21",
      prompt: "Declines are 7 of 103 swipes. A teammate reports a 'policy-violation rate of 7.3%'. Which denominator are they using, and which number does the policy board quote?",
      choices: [
        "7 of 96 approved swipes — but the board quotes 6.8%, declines over ALL 103 swipes",
        "7 of 103 — the board quotes 7.3%",
        "7 of 82 receipted — the receipt rate, not the violation rate",
        "7 of 14 pending — the approval queue",
      ],
      answer: 0,
      why: "7/96 = 7.3% is declines-over-approved — a real metric (post-authorization failure rate) but not the policy-violation rate, whose denominator is ALL swipes: 7/103 = 6.8%. Neither is arithmetic-wrong; they answer different questions, and the print that survives review names its denominator in the same breath as the number.",
      notes: [
        { choice: 1, why: "Inverted: 6.8 is the all-swipes read; 7.3 is the approved-only variant." },
        { choice: 2, why: "The 82 are the receipted population — a chase metric, not a policy one." },
      ],
      difficulty: "hard",
    },
    {
      id: "ramp-mcq-22",
      prompt: "Duplicate-charge scan: self-join swipes on cardholder + vendor + amount + day. Which join predicate reports each duplicate pair exactly once?",
      choices: [
        "o1.id <> o2.id",
        "o1.id < o2.id",
        "o1.id = o2.id AND o1.total = o2.total",
        "No predicate — the ON clause handles it",
      ],
      answer: 1,
      why: "< canonicalizes the unordered pair: the smaller id always takes the left seat, so {a, b} appears once. <> matches both orientations — every pair counts twice — and bare equality without the id guard matches every same-amount peer including the row itself. Canonicalization is the difference between a duplicate count and a duplicate fiction.",
      notes: [
        { choice: 0, why: "Symmetric: a,b and b,a both survive, doubling the review queue." },
        { choice: 2, why: "Equality with no ordering guard includes the row matching itself and every same-amount peer — a fan-out, not a pair." },
      ],
      difficulty: "hard",
    },
    {
      id: "ramp-mcq-23",
      prompt: "Vendor concentration: the top vendor holds 32% of card spend, the next 26.7%. What share do the top two carry together?",
      choices: [
        "29.35% — the average of the two shares",
        "58.7% — the shares add: 32 + 26.7",
        "32% — concentration is the max, not the sum",
        "26.7% — the trailing share",
      ],
      answer: 1,
      why: "Shares of the same whole add: $11,130.25 + $9,294.93 of the $34,833.28 book = $20,425.18, which is 58.7%. Averaging two shares of one denominator is a category error — the average would only mean something if the denominators differed.",
      notes: [
        { choice: 0, why: "Averaging shares of the SAME book has no meaning; the parts sum, they don't average." },
        { choice: 2, why: "Max is the single-vendor read; the concentration story is the cumulative share." },
      ],
      difficulty: "easy",
    },
    {
      id: "ramp-mcq-24",
      prompt: "'Statement balance' for a card cycle: which population is it?",
      choices: [
        "All 103 swipes — every attempt hits the statement",
        "The 82 posted swipes (52 reconciled + 30 awaiting receipt) — awaiting-approval and declined never posted",
        "The 52 reconciled only — unreceipted swipes aren't billable",
        "The 30 awaiting receipt — the open balance",
      ],
      answer: 1,
      why: "Posting is a lifecycle fact; reconciliation is a chase state — a swipe can be billable before its receipt lands. The statement balance counts posted transactions: 52 + 30 = 82; pending (14, awaiting approval) never posted, declined (7) never will. Mixing the chase queue into the balance is how finance fiction starts.",
      notes: [
        { choice: 0, why: "Attempts are not postings — 21 swipes (14 + 7) never posted." },
        { choice: 2, why: "That's the reconciled subset — it understates the balance by the 30 legitimately posted, unreceipted swipes." },
      ],
      difficulty: "medium",
    },
    {
      id: "ramp-mcq-25",
      prompt: "Invoice aging at a reference date: why anchor on MAX(paid_on) from payments instead of DATE('now')?",
      choices: [
        "MAX(paid_on) is later, inflating age safely",
        "DATE('now') makes the report non-reproducible — the numbers move every day the query runs; the latest observed activity date freezes the clock",
        "MAX(paid_on) handles timezones",
        "No reason — they're equivalent",
      ],
      answer: 1,
      why: "Aging must be reproducible: run today, re-run tomorrow, the open invoices must read the same age or the follow-up queries look broken. MAX(paid_on) — the latest activity the db has seen — is a frozen, data-anchored reference; DATE('now') re-prices every open invoice daily and quietly reshuffles the collections queue. Anchor on the data, state the anchor, print it beside the ages.",
      notes: [
        { choice: 0, why: "Later isn't the point; frozen and reproducible is." },
        { choice: 3, why: "Equivalent-looking, categorically different: one moves, one doesn't." },
      ],
      difficulty: "hard",
    },
    {
      id: "ramp-mcq-26",
      prompt: "The burn walk's delta uses LAG(burn) OVER (ORDER BY month). A teammate swaps in LEAD. What happens to the series?",
      choices: [
        "Identical — LAG and LEAD mirror each other",
        "Every delta flips: the +$14.16 the walk pinned on August's row reappears on July's row as −$14.16",
        "NULLs move to the last row only; values unchanged",
        "An error — you can't LEAD an aggregate",
      ],
      answer: 1,
      why: "LAG reads the prior row, so delta = current − prior; LEAD reads the next row, so delta = current − next — the same magnitudes with every sign flipped, and the 2024-08 peak narrates as a trough's recovery. Direction is the meaning of the walk; LEAD answers the opposite question.",
      notes: [
        { choice: 0, why: "Mirrored queries give mirrored numbers, not identical ones." },
        { choice: 2, why: "The edge NULL does move from the first row to the last — but every interior value flips too." },
      ],
      difficulty: "easy",
    },
    {
      id: "ramp-mcq-27",
      prompt: "SELECT SUBSTR(spent_on, 1, 7) AS month, SUM(amount_cents) FROM expenses GROUP BY month prints months in calendar order. Why is that NOT something to rely on?",
      choices: [
        "It is — GROUP BY guarantees sort order",
        "It happens to — GROUP BY makes no order promise; without ORDER BY, plan changes can reshuffle groups",
        "SQLite requires an index to sort GROUP BY",
        "ORDER BY inside the aggregate is required",
      ],
      answer: 1,
      why: "GROUP BY defines groups, not order; today's plan folds in key order and tomorrow's plan may not. Any walk the board reads — burn walk, velocity ladder, AR ladder — carries an explicit ORDER BY, because 'it printed sorted last time' is not a contract. Determinism is written, not inherited.",
      notes: [
        { choice: 0, why: "The observed order is an implementation detail; relying on it is how a report breaks between releases." },
        { choice: 2, why: "Indexes help plans, not semantics — the ORDER BY clause is the semantic promise." },
      ],
      difficulty: "easy",
    },
    {
      id: "ramp-mcq-28",
      prompt: "Vendor watchlist: 'vendors whose card spend tops $5,000'. Where does the $5,000 test live?",
      choices: [
        "WHERE SUM(spend) > 5000 — filter early",
        "HAVING SUM(spend) > 5000 — the test judges a fold, and folds don't exist until after GROUP BY",
        "ORDER BY, keeping the top row",
        "Either — SQLite treats them the same",
      ],
      answer: 1,
      why: "Per-vendor spend is an aggregate; aggregates don't exist row-by-row, so WHERE — which runs before GROUP BY — can't see them. WHERE filters rows; HAVING filters groups. The classic bug is moving the test to WHERE and getting an error or, worse, filtering out the rows the fold needs.",
      notes: [
        { choice: 0, why: "SUM in WHERE is a category error — the fold hasn't happened yet." },
        { choice: 3, why: "Same words, different pipeline stages; they are not interchangeable." },
      ],
      difficulty: "easy",
    },
    {
      id: "ramp-mcq-29",
      prompt: "'Biggest swipe per day': ROW_NUMBER() OVER (PARTITION BY day ORDER BY total). Two swipes tie at the day's max. What's wrong with just that?",
      choices: [
        "Nothing — ROW_NUMBER is deterministic",
        "The pick is plan-luck: without a tiebreak (total DESC, id), two runs can hand the day to different swipes",
        "It errors on ties",
        "It returns both tied rows",
      ],
      answer: 1,
      why: "ROW_NUMBER needs a total order to be a function; ORDER BY total alone leaves the tie to the planner, so the 'biggest swipe' can change between renders — the scorecard nobody trusts. Add the id: ORDER BY total DESC, id. Determinism is chosen, then stated.",
      notes: [
        { choice: 0, why: "Deterministic only once the ORDER BY is — the clause as written isn't." },
        { choice: 3, why: "That's the bare MAX-join-back — a different shape that silently doubles downstream counts." },
      ],
      difficulty: "medium",
    },
    {
      id: "ramp-mcq-30",
      prompt: "The ledger reads debits 181,080 = credits 181,080, delta zero. A reviewer still rejects the close. What check are they demanding?",
      choices: [
        "None — a global zero is the proof",
        "Per-account nets: cash $44,196.00, receivables $16,440.00, opex $25,416.00, revenue −$86,052.00 — two offsetting errors hide behind a global zero",
        "Re-counting the 80 entries",
        "Rounding the delta to 2 decimals",
      ],
      answer: 1,
      why: "The global trial balance proves symmetric bookkeeping, not correct bookkeeping: a debit posted to the wrong account and its credit balance each other perfectly. The per-account fold — GROUP BY account, SUM(debit) − SUM(credit) — is where a mispost shows up as an account whose net nobody can defend. Reconcile the total, then reconcile the parts; only both together are the close.",
      notes: [
        { choice: 0, why: "That's exactly the gap: a global zero is necessary, not sufficient." },
        { choice: 2, why: "The entry count says nothing about where the amounts landed." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-ramp-1",
      tier: "easy",
      topic: "x2",
      universe: "expense",
      title: "One-pass opex census: lines, total, Rent, biggest",
      brief:
        "Finance memo, at month-close: the opex census reads the whole spend ledger in a single scan — every line, every dollar, the Rent carve-out and the biggest single ticket side by side. Probed book: 36 spend lines worth $25,416.00; Rent runs 14 of the lines; the single biggest line is $1,680.00 (the 2024-08 month peaks at $3,210.00, but that's the calendar fold — this census stays on the line grain). One scan, four cells, and the pieces must fold back before the pack ships.",
      ask: "Return the one-pass census: total spend lines, total opex dollars, Rent line count, and the biggest single line in dollars.",
      template:
        "SELECT COUNT(*) AS spend_lines,\n       ROUND(SUM(e.{1}) / 100.0, 2) AS opex_usd,\n       COUNT(*) FILTER (WHERE e.{2} = {3}) AS rent_lines,\n       ROUND(MAX(e.amount_cents) / 100.0, 2) AS biggest_line_usd\nFROM expenses e;",
      slots: [
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the money column",
          why: "Opex lives in e.amount_cents, INTEGER cents promoted with /100.0. Substituting e.id sums the surrogate keys — 666 'dollars' of nonsense; substituting e.spent_on sums dates and reads 0.0, a census that looks healthy and isn't.",
        },
        {
          answer: "category",
          kind: "keyword",
          label: "the classification column",
          why: "The carve-out keys on e.category — Rent, Ads, Travel, Tools. Substituting e.id compares integers to the 'Rent' literal and reads 0; substituting e.spent_on compares dates to it and reads 0 — the Rent carve-out silently empties.",
        },
        {
          answer: "'Rent'",
          kind: "keyword",
          label: "the Rent literal",
          why: "The category value is the exact string 'Rent' — quoted and case-sensitive. 'rent' matches nothing (0 lines), 'Travel' counts the wrong class (3), and a bare Rent without quotes names a column that doesn't exist and errors.",
        },
      ],
      distractors: ["id", "spent_on", "'rent'", "'Travel'"],
      walkthrough:
        "One scan, four cells, no GROUP BY — the census that finance closes on. COUNT(*) reads 36 lines; SUM(e.amount_cents)/100.0 reads $25,416.00 — INTEGER cents promoted once, a single ROUND at the display edge; COUNT(*) FILTER (WHERE e.category = 'Rent') carves out 14 lines without a second pass; MAX(e.amount_cents)/100.0 names the biggest ticket at $1,680.00. The fold-back is the audit: Rent $16,800.00 + Ads $4,570.00 + Travel $2,521.00 + Tools $1,525.00 = $25,416.00, and 14 + 14 + 3 + 5 = 36 lines — the pieces must fold back or the census lies. Every distractor breaks one wall: e.id sums surrogate keys into nonsense, e.spent_on sums dates into 0.0, 'rent' empties the carve-out with a case slip, and 'Travel' repoints it at 3 lines. One pass, four honest cells, and the 2024-08 peak ($3,210.00) stays a calendar-fold story — this census never leaves the line grain.",
    },
    {
      id: "cs-ramp-2",
      tier: "hard",
      topic: "q5",
      universe: "supplier",
      title: "Vendor concentration board: share of card spend",
      brief:
        "Savings-team memo, before the vendor review: the concentration board ranks vendors by share of card spend, computed against the whole book — a derived table stages the total so no vendor's share is computed against its own fold. Probed book: $34,833.28 across 251 receipt lines and 6 vendors; $11,130.25 leads at 32%, the next vendor 26.7%, and the board keeps only vendors with double-digit share — the floor is a policy constant, not a data read.",
      ask: "Return each vendor with its spend dollars and share of the total book, keeping vendors at 10%+ share, biggest spend first.",
      template:
        "SELECT s.name AS vendor,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS spend_usd,\n       ROUND(100.0 * SUM(oi.quantity * oi.unit_price) / t.total, 1) AS share_pct\nFROM order_items oi\nJOIN products p ON p.id = oi.{1}\nJOIN suppliers s ON s.id = p.{2}\nCROSS JOIN (SELECT SUM(quantity * unit_price) AS total FROM order_items) t\nGROUP BY s.name\nHAVING share_pct >= {3}\nORDER BY spend_usd {4};",
      slots: [
        {
          answer: "product_id",
          kind: "keyword",
          label: "the line→catalog key",
          why: "Receipt lines bind to catalog lines on oi.product_id. Substituting oi.id joins on row-id coincidence — lines 1..16 pair with catalog lines 1..16 and the rest drop, so the board reads a book that mostly never spent. Substituting oi.quantity pairs catalog lines to quantities and misattributes every hop after.",
        },
        {
          answer: "supplier_id",
          kind: "keyword",
          label: "the catalog→vendor key",
          why: "Catalog lines carry the vendor on p.supplier_id. Substituting p.id joins vendors to catalog lines by key coincidence — ids 1..6 match ids 1..16 where they overlap and the board attributes spend to the wrong vendors with no error. Substituting p.category compares text to an integer id: zero matches, an empty board.",
        },
        {
          answer: "10",
          kind: "number",
          noVerify: true,
          label: "the concentration floor",
          why: "The board is a double-digit watchlist — the floor is policy, not data. Lowering it to 8.6 leaks every vendor onto the slide; raising it to 26.7 cuts the board to two. The floor is the meeting's edit, which is why the constant is stated in the memo.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-spend-first direction",
          why: "The review opens with the concentration leader: $11,130.25 at 32%. ASC is a correct query answering the opposite question — it leads with the smallest vendor on the board and buries the one the savings pitch is about.",
        },
      ],
      distractors: ["id", "quantity", "category", "ASC", "26.7"],
      walkthrough:
        "Stage the total, chain the hops, then rank and floor. The derived table t folds the whole book once: SUM(quantity × unit_price) over 251 receipt lines = $34,833.28 — the same total the orders table carries, which is the reconciliation. The chain binds lines to catalog (oi.product_id = p.id) and catalog to vendors (p.supplier_id = s.id): every other key fails differently — oi.id pairs by row coincidence and drops most of the book, p.id misattributes catalog lines to vendors wherever ids overlap, p.category compares text to integers and empties the board. Folded per vendor: $11,130.25, $9,294.93, $4,765.63, $3,613.25 … and the share is computed against the staged total — 100.0 × spend / 34,833.28 — reading 32.0, 26.7, 13.7, 10.4, 8.8, 8.6. HAVING share_pct >= 10 keeps the double-digit board: four vendors, led by 32%. ORDER BY spend_usd DESC; ASC inverts the pitch. Floor, chain, share — the board the savings team actually walks, and the 8.8/8.6 tail stays visible in the walkthrough even though the slide floors it.",
    },
    {
      id: "cs-ramp-3",
      tier: "medium",
      topic: "t7",
      universe: "expense",
      title: "The opex burn walk: month deltas with LAG",
      brief:
        "Finance memo, ahead of the monthly review: the burn walk is the board's opening chart — opex by month, this month against last, no smoothing. Stage a monthly fold over the expense lines and walk it with LAG. The spine is 14 dense months, 2024-01 through 2025-02; 2024-01 opens the walk at $1,719.00; 2024-08 peaks at $3,210.00, just $14.16 over July's $1,794.00; and the first month has no previous — the walk says so with a NULL, not a zero. Amounts are INTEGER cents; the dollar read is /100.0.",
      ask: "Return the 14-month burn walk: month, burn dollars (2 decimals), and the month-over-month delta (2 decimals), oldest first.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR({1}, 1, 7) AS month,\n         SUM(amount_cents) AS burn_cents\n  FROM expenses\n  GROUP BY month\n)\nSELECT month,\n       ROUND(burn_cents / 100.0, 2) AS burn_usd,\n       ROUND((burn_cents - {2}(burn_cents) OVER (ORDER BY month)) / 100.0, 2) AS delta_usd\nFROM monthly\nORDER BY month {3};",
      slots: [
        {
          answer: "spent_on",
          kind: "keyword",
          label: "the spend timestamp",
          why: "Opex buckets by when the line was spent — `spent_on`. Bucketing id folds by surrogate key (36 one-row 'months'), vendor folds by vendor name (four vendors, not fourteen months), and SUBSTR of amount_cents buckets by digit-prefix nonsense — none of them is a calendar.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the previous-row function",
          why: "LAG(burn_cents) reads the prior month's fold — the walk's engine. LEAD points forward: every delta flips sign and the 2024-08 peak's +$14.16 lands on July's row as −$14.16, narrating the year backwards.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the oldest-first order",
          why: "A walk starts at the spine's head — 2024-01, with its NULL anchor visible. DESC prints the same rows backwards: correct data, unreadable walk, and the peak lands on top where a trend chart would lie.",
        },
      ],
      distractors: ["id", "vendor", "amount_cents", "LEAD", "DESC"],
      walkthrough:
        "Stage the fold once, walk it once. The CTE buckets 36 spend lines into 14 months via SUBSTR(spent_on, 1, 7) and sums cents per month — 2024-01 reads $1,719.00, the quietest month is 2024-02 at $1,440.00, and 2024-08 peaks at $3,210.00, just $14.16 over July's $1,794.00. The outer query converts once — ROUND(burn_cents / 100.0, 2) — and LAG(burn_cents) OVER (ORDER BY month) carries the previous month's fold forward: 2024-02 reads −$2.79 against January, and 2025-01 reads +$3.49 against December's $1,610.00. The first row's delta is NULL — no prior month, no delta — and the walk ships it honest rather than COALESCEing a fake zero baseline into the board chart. The distractors fail where the craft lives: id buckets by surrogate key into 36 one-row 'months', vendor folds the walk into four vendor bands, amount_cents buckets by digit-prefix nonsense, LEAD flips every delta's sign so the peak reads as a recovery, and DESC reads the spine backwards into the NULL.",
    },
    {
      id: "cs-ramp-4",
      tier: "hard",
      topic: "t5",
      universe: "fraud",
      title: "The cardholder velocity ladder",
      brief:
        "Fraud-desk memo, before the weekly risk review: the velocity ladder ranks cardholders by swipe count — the rawest velocity signal the book has. The read: Alice Chen leads at 24 swipes, then 17, 14 and 13; the ladder's middle is where the rank functions fight — four cardholders share exactly 4 swipes, two share 3, three share 2. Print the full 16-cardholder ladder with a rank that shows the ties as ties, most swipes first, name order breaking deadlocks for display only.",
      ask: "Return the velocity ladder: cardholder, swipe count, and velocity rank for all 16 cardholders, ties sharing a rank, most swipes first.",
      template:
        "SELECT c.name AS cardholder,\n       COUNT(*) AS swipes,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS velocity_rank\nFROM orders o\nJOIN customers c ON c.id = o.{3}\nGROUP BY c.name\nORDER BY velocity_rank, cardholder\nLIMIT {4};",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie-honest rank",
          why: "Four cardholders tie at 4 swipes and RANK hands all of them rank 6, then jumps to 10 — the skip IS the band's width. ROW_NUMBER numbers them 6-7-8-9, an order the data doesn't contain; DENSE_RANK agrees inside the band but continues at 7, hiding the flatten.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the most-swipes-first direction",
          why: "The ladder reads heaviest first: 24, 17, 14, 13. ASC is a correct query answering the opposite question — it leads with the two 1-swipe cardholders and buries every band the fraud desk exists to read.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the swipe-to-cardholder key",
          why: "Swipes attach to cardholders via o.customer_id. o.id joins orders to customers by row-id coincidence — order 5 pairs with customer 5 — and every count and tie band on the ladder becomes fiction with no error raised.",
        },
        {
          answer: "16",
          kind: "number",
          noVerify: true,
          label: "the full ladder",
          why: "16 cardholders carry every swipe on the book (no cardholder has zero) and LIMIT 16 prints the whole ladder, 1-swipe cardholders last. It's the read size, not a computed figure — that's why it's flagged.",
        },
      ],
      distractors: ["ROW_NUMBER", "DENSE_RANK", "ASC", "id", "5"],
      walkthrough:
        "No staging — fold and rank in one pass, because the window runs over the fold's own output. GROUP BY c.name folds 103 swipes to 16 cardholders; RANK() OVER (ORDER BY COUNT(*) DESC) ranks the folds: 24, 17, 14, 13 take ranks 1-4, the 5-swipe cardholder takes 5, and then the band — four cardholders at 4 swipes all read rank 6; RANK's skip lands the 3-swipe pair at 10, the three 2-swipe cardholders at 12, and the 1-swipe pair at 15. The outer ORDER BY velocity_rank, cardholder keeps the ladder diffable run over run; the id tiebreak lives in the display sort, never in the window ORDER BY — add it there and every row becomes its own peer, silently degrading RANK into ROW_NUMBER. The distractors fail exactly at the band and the key: ROW_NUMBER invents 6-7-8-9 inside the tie, DENSE_RANK continues at 7 and hides the skip, ASC leads with the 1-swipe pair, o.id mispairs swipes to cardholders by row coincidence, and LIMIT 5 truncates the ladder one band above the four-way fight it exists to show.",
    },
    {
      id: "cs-ramp-5",
      tier: "medium",
      topic: "j7",
      universe: "growth",
      title: "The regional program scorecard",
      brief:
        "Program-review memo: the regional scorecard splits the card book by cardholder region — volume, cardholders, dollars, ticket size — one fold, four rows. Probed book: EU leads with 45 swipes across 8 cardholders for $15,089.23 (average ticket $335.32); APAC runs 37 swipes / 5 cardholders / $11,605.45 ($313.66); US is the volume laggard but the ticket leader — 19 swipes, 2 cardholders, $7,286.16 ($383.48); LATAM is a single cardholder's 2 swipes for $852.44 ($426.22). Biggest book first, and the cells must fold back to $34,833.28 across 103 swipes.",
      ask: "Return the regional scorecard: region, swipe count, distinct cardholders, spend dollars and average ticket (2 decimals), biggest spend first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS swipes,\n       COUNT(DISTINCT o.customer_id) AS cardholders,\n       ROUND({1}(o.total), 2) AS spend_usd,\n       ROUND({2}(o.total), 2) AS avg_usd\nFROM orders o\nJOIN customers c ON c.id = o.{3}\nGROUP BY c.region\nORDER BY spend_usd {4};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the book fold",
          why: "spend_usd is the regional fold of swipe totals: SUM. COUNT folds rows into 45 and 37 — a count wearing a dollar label — while MAX reads the biggest single swipe and MIN the smallest; none of them is the book.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the ticket average",
          why: "Average ticket is the mean over the region's swipes — $335.32 in EU, $383.48 in the US. SUM re-reads the book into the average column, MIN reads the smallest swipe in each region, and the volume-versus-ticket story silently inverts.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the swipe-to-cardholder key",
          why: "The join binds each swipe to its cardholder on o.customer_id. o.id pairs orders to customers by row-id coincidence — the regions reshuffle, EU reads a handful of swipes instead of 45, and nothing errors.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first order",
          why: "The review opens on the volume leader: EU's $15,089.23. ASC leads with LATAM's $852.44 — a correct query that buries the program's center of gravity under its smallest market.",
        },
      ],
      distractors: ["COUNT", "MAX", "MIN", "id", "ASC"],
      walkthrough:
        "One fold, four regions, five cells. COUNT(*) reads raw swipe volume — 45, 37, 19, 2, folding back to 103; COUNT(DISTINCT o.customer_id) reads cardholders — 8, 5, 2, 1 — because APAC's 37 swipes concentrate in 5 cardholders while EU's 45 spread across 8; SUM(o.total) is the book — $15,089.23, $11,605.45, $7,286.16, $852.44, summing to the probed $34,833.28; AVG(o.total) is the ticket — and the story lives in the gap: the US book is a fraction of EU's size but carries the biggest tickets at $383.48, while LATAM's $426.22 rides on a single cardholder's two swipes. The distractors break one wall each: COUNT in the book fold prints 45 wearing a dollar label, MAX or MIN swap the book for the biggest or smallest single swipe, o.id mispairs the join and reshuffles every region, and ASC buries the leader. Volume, concentration, dollars, tickets — four grains, one scan, and the fold-back to $34,833.28 is the audit.",
    },
    {
      id: "cs-ramp-6",
      tier: "easy",
      topic: "x3",
      universe: "month-close",
      title: "The rail stack: settlements with a total row",
      brief:
        "Close-night memo from finance ops: the settlement book goes into the packet as one stack — per-rail rows and a grand total, one query, no second pass. Probed book: card rails settle 16 legs for $37,364.00, bank/ACH wires settle 11 legs for $32,248.00; the whole book is 27 legs worth $69,612.00. The stack's TOTAL row is the reconciliation: if legs don't read 16 + 11 = 27, or dollars don't read $37,364.00 + $32,248.00 = $69,612.00, a rail class is missing or duplicated and the packet doesn't ship. Amounts are INTEGER cents; /100.0 for dollars.",
      ask: "Return the rail stack: per-rail leg counts and settled dollars (2 decimals), plus a TOTAL row over the whole book.",
      template:
        "SELECT {1} AS rail,\n       COUNT(*) AS legs,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS settled_usd\nFROM payments\nGROUP BY rail\nUNION ALL\nSELECT 'TOTAL',\n       COUNT(*),\n       ROUND({2}(amount_cents) / 100.0, 2)\nFROM payments\nORDER BY {3};",
      slots: [
        {
          answer: "method",
          kind: "keyword",
          label: "the rail column",
          why: "Rails partition on p.method — card and wire. Substituting invoice_id folds by invoice (22 per-invoice rows plus the TOTAL) and the 'stack' becomes the invoice book wearing a rail label; the money alias isn't a grouping column the GROUP BY can see at all.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the total row's money fold",
          why: "The TOTAL row folds the whole book: SUM(amount_cents) reads $69,612.00. MAX reads the single biggest leg, and the TOTAL row quietly reports one ticket instead of the book — a reconciliation that can't fail because it never checked anything.",
        },
        {
          answer: "rail",
          kind: "keyword",
          label: "the stack's order key",
          why: "ORDER BY rail anchors the stack — TOTAL first (ALL-CAPS sorts before lowercase in binary collation), then card, then wire — a shape the packet's readers know on sight. Ordering by legs or settled_usd re-sorts the stack by magnitude and moves the TOTAL row, breaking every eyeball that diffs the packet run over run.",
        },
      ],
      distractors: ["invoice_id", "MAX", "legs", "settled_usd"],
      walkthrough:
        "Two folds, one stack, one reconciliation. The first leg folds per rail: method partitions 27 legs into card (16 legs, $37,364.00) and wire (11, $32,248.00); UNION ALL appends the second fold — the whole book, labeled 'TOTAL': 27 legs, $69,612.00 — and UNION ALL is the contract, because plain UNION's dedupe would silently drop any two rails that ever post identical rows while the packet still reconciles. ORDER BY rail sets the shape the packet expects: 'TOTAL' sorts first under binary collation (ALL-CAPS before lowercase), then card, then wire — say it out loud, because it surprises everyone exactly once. The reconciliation is the deliverable: 16 + 11 = 27 legs and $37,364.00 + $32,248.00 = $69,612.00 must fold back on both grains, or a rail class is missing and the close is wrong. The distractors break it exactly there: invoice_id turns the stack into 22 per-invoice rows, MAX makes the TOTAL row report one biggest leg instead of the book, and ordering by legs or settled_usd re-sorts the stack by magnitude, moving the TOTAL row and breaking the run-over-run diff.",
    },
  ],

  problems: [
    { slug: "structuring-detection", why: "Swipes split under the per-swipe limit — the structuring pattern the policy engine flags, HAVING-guard and all." },
    { slug: "amount-anomaly-zscore", why: "Out-of-policy ticket sizes — z-scores against the vendor baseline, the anomaly board's quantitative core." },
    { slug: "ar-aging-schedule", why: "Vendor invoice aging — the T+30 ladder behind the $15,217.00 untouched exposure, bucketed by days outstanding." },
    { slug: "top-percentile-fraud", why: "PERCENT_RANK outlier swipes — the top-percentile read that decides which transactions the fraud desk opens first." },
    { slug: "customer-purchasing-behavior-analysis", why: "Spend tiers per cardholder — the behavior bands the policy engine tunes limits against." },
    { slug: "calculate-product-final-price", why: "Best-rule pricing logic — the same rule-evaluation shape Ramp applies when stacked policy discounts compete." },
    { slug: "rfm-segmentation", why: "Vendor segmentation — recency, frequency, monetary bands that decide which vendors get negotiated first." },
    { slug: "repeat-purchase-rate", why: "Repeat vendor spend — the consolidation read: which vendors earn volume discounts because the book keeps coming back." },
    { slug: "spend-histogram", why: "The per-swipe histogram — spend distribution bucketed, the shape that shows whether limits bite where the book actually spends." },
    { slug: "sellers-with-no-sales", why: "Vendors with no spend this quarter — the anti-join that finds dormant vendor relationships before renewal season does." },
    { slug: "deferred-revenue", why: "Prepaid vendor contracts — the recognition spine that splits an annual tooling invoice across the months it covers." },
    { slug: "ltv-cac-payback", why: "Unit economics in one query — Ramp's own savings-claimed-versus-CAC payback, the board metric behind the pitch." },
    { slug: "point-in-time-asof", why: "Vendor master as-of joins — spend attributed to the vendor record that existed on swipe day, not the one renamed since." },
    { slug: "employees-project-allocation", why: "Spend allocation across cost centers — the line-item split that decides which budget actually pays for a multi-line swipe." },
    { slug: "find-overbooked-employees", why: "Overlapping approval windows — two budget owners approving the same window is the control gap the audit chases." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Swipes above the category average — the subquery screen that surfaces out-of-band spend without a second pass." },
    { slug: "transaction-velocity", why: "Swipes per cardholder in fixed windows — the velocity screen behind the ladder: 24, 17, 14, 13 at the top, and the four-way tie at 4 is where rank discipline starts." },
    { slug: "duplicate-charge-pairs", why: "Same cardholder, same vendor, same amount, same day — the duplicate-charge pair scan, canonicalized with < so each pair counts once." },
    { slug: "trial-balance-check", why: "Debits minus credits in one conditional SUM — the GL's zero-delta reflex (181,080 = 181,080 here), drilled to reflex speed." },
    { slug: "gl-reconciliation", why: "Two folds that must agree and the delta query that localizes the break — how a mispost surfaces after the global zero passes." },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER keep-latest with a deterministic tiebreak — the staging-table dedupe that keeps scalar lookups from exploding on a two-row cardholder." },
    { slug: "journal-gap-detection", why: "Sequence-gap detection over the GL's 80 entries — a missing journal number is a finding, not noise." },
    { slug: "balance-rollforward", why: "Opening + movement = closing, per account — the close-checklist shape the per-account nets (cash $44,196.00, receivables $16,440.00) feed." },
    { slug: "delinquency-buckets", why: "Days-past-due CASE buckets against 30-day flat terms — the vendor-invoice aging ladder collections works from." },
    { slug: "settlement-fails-aging", why: "T+ aging on failed settlements — the day-count discipline the 84-day slowest settlement makes non-hypothetical." },
    { slug: "suspicious-bank-account-transactions", why: "Sliding-window scan over an account's transaction stream — burst rules in window-frame form, the frame-aware sibling of the velocity topic." },
    { slug: "late-arriving-restatement", why: "Watermark discipline when a rail file restates — why the census re-runs, what's allowed to move, and what the board must be told changed." },
    { slug: "second-highest-salary", why: "Threshold subqueries on money columns — 'above the vendor-average leg' is a scalar subquery with an empty-inner edge case the rails produce weekly." },
    { slug: "maximum-transaction-each-day", why: "Argmax per day over swipe amounts — the biggest ticket in each statement window, fold and window in one query." },
    { slug: "symmetric-pairs", why: "Pair canonicalization with < — the same orientation discipline the duplicate-charge scan needs so pairs count once, not twice." },
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded share where unmatched rows count as zero — the receipt-coverage share, with NULL policy and rounding in one deliverable." },
    { slug: "account-balance", why: "Running balances with explicit frames — the cumulative settled-dollars walk where ROWS-versus-RANGE decides whether same-day legs fold together." },
  ],
};
