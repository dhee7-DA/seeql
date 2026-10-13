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
  ],

  dayInLife: [
    "**08:05 —** The day starts on the spend funnel. First query is the overnight read: transactions by outcome — 52 of 103 reconciled all-time, the {rose:declined} share watched hardest (6.8%, and every decline is a policy working or a card failing) — then the receipt chase: 30 transactions sitting posted-awaiting-receipt, oldest first. The morning artifact is a two-grain count: 251 receipt lines across 103 transactions, because one swipe splits across budget lines — *a census that can't say both grains out loud is the one that misprices a vendor during close*. A mismatch pages vendor ops, not a shrug.",
    "**11:30 —** Midday is opex surgery. The census query runs in one pass: 36 spend lines, **$25,416.00** total, 14 Rent lines isolated with FILTER, the single biggest line **$1,680.00** named — and the fold-back check rides along: Rent $16,800.00 plus Ads $4,570.00, Travel $2,521.00 and Tools $1,525.00 must sum back to the census or the pack doesn't ship. The vendor ladder walks beside it: 21 invoices settle exact ($65,612.00), 1 {amber:partial} at $4,000.00 of $6,148.00, 6 untouched ($15,217.00) — *the AR ladder is the vendor-ops heartbeat, and the anti-join that finds the untouched six is rehearsed until it's reflex*.",
    "**16:00 —** The afternoon is the savings pitch. The board ranks vendors by spend share: $11,130.25 — **32%** of the book — leads, the next vendor 26.7%, and the derived-table join that produces the share is the query the meeting exists to challenge. The {violet:burn walk} charts opex by month via SUBSTR — the 2024-08 peak of $3,210.00 gets its explanation line — and LAG deltas annotate the trend with the first month's NULL left honest. Every branch reconciles against a plain `COUNT(*)` before it ships — and the ledger gets the last word: debits **181,080** equal credits **181,080**, delta zero, the one number allowed to be boring.",
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
  ],
};
