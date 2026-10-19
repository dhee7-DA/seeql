// Bank of America — kit 9 of the Banking & Capital Markets domain (Batch J, wave 6).
// Consumer banking at scale: accounts, cards, loans — the household read, where
// a billing can clear on the consumer debit rail or the ACH/wire rail and the
// fee lines are audited as hard as the balances. The storefront db maps on
// honestly: invoices are consumer billings (statement cycles, loan notices,
// fee memos — the receivables the consumer book carries), payments are the
// settlement rails (method card / wire — card is the debit-card rail, wire the
// ACH-and-corporate rail), ledger_entries is the double-entry book of record,
// expenses are branch-and-op cost lines, customers are account households
// across four footprint markets, orders are booked account/card events (REAL
// dollars — the one table where money is already dollars). Money in
// invoices/payments/expenses/ledger is INTEGER cents — the dollar read is
// always amount_cents / 100.0.
// Pool provenance: Bank of America has 0 tagged sql rows in the band (checked
// company-pools.md for bofa / Bank of America variants) — 0 tagged LC —
// theme-curated: every topic and problem slug is curated from the theme menu
// to BofA's known question families (funnel, rail folds, fee/band math,
// coverage classification, household boards), provenance stated per problem.
// Case figures: scripts/company-facts.md (probed 2026-10-12).

import type { CompanyKit } from "../types";

export const bofaKit: CompanyKit = {
  id: "bofa",
  domainId: "banking",
  name: "Bank of America",
  tagline: "Consumer banking at scale: accounts, cards, loans",
  accent: "text-red-500",

  brief: [
    "**Bank of America** is America's consumer bank at its most literal: tens of millions of households, a card in nearly every wallet, and a branch network that still carries the traffic the app can't. On this training db the mapping is honest: `orders` are booked account and card events (REAL dollars — the one table where money is already dollars), customers are account households across four footprint markets, and every billing the consumer book sends — statement cycle, loan notice, fee memo — lands as a receivable. Probed scale: **103 booked events worth 34833.28** across 251 line items and 16 households, with the busiest household carrying **24 events for 7262.35** and the spenders over the 3000 line holding 63.5% of all booked value.",
    "The money tables are the bank's spine. `invoices` are the billings the consumer book sends; `payments` are the settlements that clear them on two rails — card, the debit-card rail (16 hits for 37364.00), and wire, the ACH-and-corporate rail (11 for 32248.00); `ledger_entries` is the double-entry book where every settled dollar posts twice, stored as integer cents with the dollar read always cents / 100.0. The daily proof: **181080.00 debits against 181080.00 credits across 80 entries, delta 0**. The coverage census reads 21 billings settled exact, 1 partial (4000.00 against 6148.00) and 6 with no rail hit — the receivables watch carries **15217.00** against flat 30-day terms.",
    "The SQL screens are consumer-grade and volume-shaped. A warm-up rail fold (card versus wire, counts and dollars in one GROUP BY), then the two questions this bank is famous for: the {rose:overdraft-and-fee read} — which billings crossed which bands, which settled, which reversed — and the {sky:account-funnel read} — opened, funded, active, each stage with its own denominator. Traps are planted where the data is honest: a void billing that still drew a **925.00** settlement and a paid-status billing with no rail hit at **1756.00** are both in the book, and a status-only census walks straight past them.",
    "Prep the way the screens run. Drill conditional folds and one-pass censuses (`FILTER (WHERE …)`), cents discipline (`amount_cents / 100.0` — and the 100.0 enters BEFORE any ratio divides), window boards for the card portfolio, and month buckets via `SUBSTR(created_at, 1, 7)` across the 2024-01 to 2025-02 window. Then practice saying the definition out loud: *a settlement is not a billing, and a rail hit is not a household* — the interviewer grades the denominator and the grain before the syntax.",
    "The economics beneath the screens are concentration economics. The consumer book is four footprint markets and the household ladder is steep: {amber:flagship} households over the 5000 line are just 2 of 16 yet carry **13902.91** of the 34833.28 booked — 39.9% of value on 12.5% of the book — while the {emerald:core} twelve carry 12711.58 between them. Billing grain runs small: 28 billings averaging **31.06** (range 8.73 to 61.48), which is why the fee-band math and the coverage census matter more per row here than raw volume. The cycle spine says the book is accelerating — 13 statement cycles from 2024-02 to 2025-02, peaking at **110.85** billed in 2025-01 — so the reads that scale (funnels, rail folds, rank boards) are the ones this bank pays for.",
    "Roadmap, in the order the screens stack: week one, rail folds and one-pass censuses — `GROUP BY method` plus `FILTER (WHERE …)` until the card/wire split is reflex; week two, the coverage classification — LEFT JOIN, fold to billing grain, quote 21 exact / 1 partial / 6 no-rail from memory with the 15217.00 watch attached; week three, windows with honest ties — RANK boards where a four-way tie at 4 events opens a rank gap from 6 to 10, and the discipline to say *this LIMIT cuts mid-tie* out loud; week four, set ops and anti-joins — billed-not-settled as EXCEPT, never-settled as `IS NULL`, and the NOT IN-NULLs trap. *Every drill ends the same way: say the denominator before you show the number.*",
  ],

  dayInLife: [
    "**08:10 —** the day opens on the books, not the news. First query proves the ledger — **181080.00 debits against 181080.00 credits, delta 0**, or the morning is a page — then the rail census: **card 16 / 37364.00, wire 11 / 32248.00**, cross-footed to the cash book's 69612.00 debit fold. The break list classifies in the same pass: the void-but-settled **925.00**, the paid-status billing with no rail at **1756.00**. A proof that fails is the whole morning; nothing ships until it ties.",
    "**11:00 —** deep work: the fee-and-coverage read. Every billing classified by rail coverage — 21 exact (**65612.00**), 1 partial at 4000.00 of **6148.00**, 6 with no hit (**15217.00**) — and the fee memos that reversed after settlement isolated by pairing status with receipt presence. The instinct being trained: {emerald:coverage} is a join state, not a status string — the 4000.00-partial is open AND settled, and both facts belong on the card.",
    "**14:30 —** branch ops review: cost lines against plan — Rent at 14 entries / **16800.00** (the branch leases), Ads at 14 / **4570.00** (acquisition marketing), Travel and Tools trailing — and the household board by market, where the US basket runs **383.48** a booking against APAC's 313.66. The market lead wants the funnel with its denominator on the slide: {emerald:funded} over ALL booked events, never a filtered fairy tale.",
    "**17:30 —** EOD writeup: the census ships with definitions attached — what counts as settled, who stays in the base — and tomorrow's ask is queued for the data-quality board: split settlements landing as two rail hits on one billing, waiting on a `ROW_NUMBER` dedupe. *The read goes out; the denominators and the cents rule travel with it.*",
    "**21:15 —** the late pass, because the household board ships at 07:00. The activity rank comes back with a wrinkle worth losing sleep over: **Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13**, then a cliff to Chloe Dubois at 5 — and a {violet:four-way tie at 4 events} (Rossi, Sato, Alvarez, Meyer) that opens the rank gap from 6 to 10. RANK labels it honestly; a `LIMIT 10` cut drops Hiro Tanaka mid-tie at rank 10 while his count twin Farid Nasser stays — so the board footnote says exactly that, or the desk calls at 07:05 asking where one household went. Final re-proof of the ledger — **181080.00 against 181080.00, delta 0** — and the light goes off.",
  ],

  metrics: [
    { name: "Booked-event volume", what: "Account and card events booked with their dollar value — 103 events worth 34833.28 on the training book. The top-of-funnel number every household board hangs off." },
    { name: "Rail census", what: "Settlement count and value per rail — card 16 / 37364.00 (debit-card), wire 11 / 32248.00 (ACH/corporate). One fold, two rails; the pair cross-foots to the cash book's 69612.00 debit fold." },
    { name: "Books proof delta", what: "Total debits minus total credits across the ledger — 181080.00 against 181080.00, delta 0 across 80 entries. A nonzero delta is a page, not a footnote." },
    { name: "Coverage census", what: "Billings classified by settlement coverage — 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 with no rail hit. The partial is the interesting row: open AND settled." },
    { name: "Receivables watch", what: "Billings with no settlement row at all — 6 carrying 15217.00, aged against flat 30-day terms. The NPL list the consumer book works every morning." },
    { name: "Fee-break census", what: "Status-versus-receipt anomalies — 1 void billing that still drew 925.00, 1 paid-status billing with no rail hit at 1756.00. Both are process failures the books absorbed; both route to a desk." },
    { name: "Settlement lag", what: "Days from billing to first settlement on settled billings — 20 billings, 28.4 days average, fastest 13, slowest 84, against flat 30-day terms. The collections tempo read." },
    { name: "Household concentration", what: "Share of booked value from households over a lifetime line — 63.5% from the 3000-plus tier. Tells the card team how thin the deposit-and-spend base really is." },
    { name: "Cycle trend spine", what: "Billed dollars per statement cycle — 13 cycles from 2024-02 to 2025-02, peaking at 110.85 in 2025-01 (2 billings), with 2024-12 at 88.30 on 3. The trend line every monthly deck leads with." },
    { name: "Tier ladder census", what: "Households classified over the 3000/5000 lines — flagship 2 (13902.91), preferred 2 (8218.79), core 12 (12711.58). Two-fifths of booked value sits in the top two households." },
    { name: "Billing grain", what: "Size and spread of the consumer billing book — 28 billings averaging 31.06, spanning 8.73 to 61.48. Small-ticket, high-count: fee-band edges matter more per row than volume." },
    { name: "Activity board & ties", what: "Booking frequency per household — 24 / 17 / 14 / 13 at the top, then a four-way tie at 4 (Rossi, Sato, Alvarez, Meyer) that opens the RANK gap from 6 to 10. Tie policy is a published decision, not a default." },
  ],

  topics: [
    {
      name: "Account-opening funnel",
      why: "BofA's consumer story is a funnel: application, opened, funded, active — and every stage leaks. Conversion reads are stage pivots with honest per-stage denominators, plus the anti-join for households that started and never funded.",
      slugs: ["funnel-step-conversion", "customer-who-visited-but-did-not-transact", "email-engagement-funnel", "capital-gain-loss", "settlement-fails-aging"],
    },
    {
      name: "Card-vs-wire rail folds",
      why: "The rail census is a daily GROUP BY: settlements and dollars per rail, cross-footed to the cash book. Method-mix folds, threshold counts and per-day maxima are the muscle this census drills.",
      slugs: ["monthly-transactions-i", "number-of-rich-customers", "maximum-transaction-each-day", "customer-order-frequency"],
    },
    {
      name: "Overdraft & fee math",
      why: "Fee logic is band logic: which billing crossed which line, what the schedule charges, and how the exposure buckets by days past due. CEIL-style schedules, best-rule pricing and DPD buckets are exactly the drills.",
      slugs: ["calculate-parking-fees-and-duration", "calculate-product-final-price", "delinquency-buckets"],
    },
    {
      name: "Statement-state folds",
      why: "Billings live in states — paid, open, void — and consumer reads must count them separately without letting any state leak out of the denominator. Conditional aggregation over status is the daily fold.",
      slugs: ["immediate-food-delivery-ii", "immediate-food-delivery-i", "calculate-orders-within-each-interval", "daily-balance-interest"],
    },
    {
      name: "Household rollups & concentration",
      why: "A household is a tenure and a balance, not a row: lifetime folds per household, frequency leaders, and spend-band histograms decide where the card team spends its quarter.",
      slugs: ["customer-purchasing-behavior-analysis", "customer-placing-the-largest-number-of-orders", "spend-histogram", "bank-account-summary"],
    },
    {
      name: "Card-portfolio boards",
      why: "Household boards and 'most recent three events' surfaces are window functions over folded groups. Ties are real — two households at two billings share a rung — so RANK versus ROW_NUMBER is a policy, not syntax.",
      slugs: ["rank-scores", "the-most-recent-three-orders", "second-most-recent-activity", "monthly-transactions-ii", "chargeback-rate-ranking"],
    },
    {
      name: "Statement-cycle buckets",
      why: "Statement cycles run monthly and the monthly trend is the deck's spine: bookings, value and reversals per cycle key, plus the weekday cadence the branch network staffs against.",
      slugs: ["unique-orders-and-customers-per-month", "list-the-products-ordered-in-a-period", "sales-by-day-of-the-week", "top-percentile-fraud", "structuring-detection"],
    },
    {
      name: "Break feeds & duplicate rails",
      why: "Rails double-hit and feeds re-log: duplicate-charge pairs, keep-latest dedupes and null audits are the data-quality drills this bank grades hardest — a bad rail row becomes a bad cash number.",
      slugs: ["duplicate-charge-pairs", "keep-latest-dedupe", "null-blank-audit", "gl-reconciliation"],
    },
    {
      name: "Running balances & accruals",
      why: "Balances walk: running sums over ledger motion, cumulative folds by segment, and elevator-style capacity sums are the accrual math behind every deposit-product read.",
      slugs: ["account-balance", "running-total-for-different-genders", "last-person-to-fit-in-the-elevator", "trial-balance-check", "balance-rollforward"],
    },
    {
      name: "NULL discipline at the teller line",
      why: "An unsettlement is a business state, not dirty data: COUNT(column) versus COUNT(*), NULL-safe filters and missing-information joins are the honesty drills — mishandled NULLs fabricate settled accounts.",
      slugs: ["find-customer-referee", "books-with-null-ratings", "employees-with-missing-information"],
    },
    {
      name: "Benchmark & percentile screens",
      why: "Consumer reads constantly ask 'above the book's average' — which billing outsizes the 31.06 mean, which household outsaves the base. Scalar subqueries, per-group maxima and second-highest shapes are exactly those benchmark drills, and each one hides a denominator choice.",
      slugs: ["orders-with-maximum-quantity-above-average", "employees-earning-more-than-their-managers", "second-highest-salary", "suspicious-bank-account-transactions"],
    },
    {
      name: "Book-vs-book set ops",
      why: "Two honest books — billed and settled, applied and funded — get compared with INTERSECT, EXCEPT and stacked UNIONs. The receivables watch IS an EXCEPT away from the billing book; the drill is keeping grain identical before the operator fires.",
      slugs: ["customers-who-bought-a-and-b-not-c", "user-activity-for-the-past-30-days-i", "friendly-movies-streamed-last-month"],
    },
    {
      name: "Latency & calendar math",
      why: "Settlement lag, same-day rails and process duration are julianday arithmetic, not string slices. First-and-last per day, duration deltas and temperature-style sequence checks are the drills behind the 28.4-day settlement tempo.",
      slugs: ["average-time-of-process-per-machine", "first-and-last-call-on-the-same-day", "rising-temperature"],
    },
    {
      name: "Streak & burst detection",
      why: "The fraud and engagement desks both read motion: consecutive increasing amounts, two hits inside a week, bursty cadence. LAG/LEAD over ordered events turns a transaction feed into a behavior story — the muscle behind velocity monitoring.",
      slugs: ["consecutive-transactions-with-increasing-amounts", "users-with-two-purchases-within-seven-days", "find-bursty-behavior", "ar-aging-schedule", "transaction-velocity", "prepayment-detection"],
    },
    {
      name: "Fee ladders & CASE branches",
      why: "Tier ladders are CASE trees and branch order is policy: the first matching WHEN wins, so 5000 must be tested before 3000 or flagship households vanish into preferred. Salary-category, bonus-rule and senior/junior splits are the textbook drills.",
      slugs: ["count-salary-categories", "recyclable-and-low-fat-products", "the-number-of-seniors-and-juniors-to-join-the-company"],
    },
  ],

  theory: [
    {
      id: "bofa-t1",
      q: "The fee-memo review joins billings to their settlements and the billing count comes back 33 instead of 28. What happened, and how do you fix the read?",
      a: "The join fanned out: five billings were settled on the split-payment plan, so each carries two settlement rows — 28 billings joined to their rails print 33 rows, and COUNT(*) counts the join's grain, not the billing book. The fix is grain discipline: either fold settlements to billing level first (aggregate per billing in a derived table or CTE, then join up) or keep the fold billing-side with COUNT(DISTINCT i.id). On BofA screens this is the daily trap — the rail census counts hits, the coverage census counts billings, and a scorecard that confuses them reports 33 settled billings when only 26 billing relationships actually settled.",
      tag: "joins",
    },
    {
      id: "bofa-t2",
      q: "Two households both show two billings, and the card-portfolio board ranks them differently on reruns. Why, and which window function do you reach for?",
      a: "ROW_NUMBER breaks ties arbitrarily — by whatever physical order the plan lands on — so two households with identical frequency get different rungs and the board looks authoritative when it's coin-flipping. For a board where ties share a rung I use RANK (tied households share the rank and the next rank skips) or DENSE_RANK when the rungs must number consecutively; and I always ORDER BY a deterministic tiebreaker inside the window — lifetime value, then household id — so reruns are reproducible. On a consumer book the tie policy is a business decision: the retention desk emails 'everyone at rank 3', so RANK is the honest choice and the tiebreak column is the tiebreaker someone can defend.",
      tag: "windows",
    },
    {
      id: "bofa-t3",
      q: "How would you build the coverage census — exact, partial, no rail — so every number survives an interviewer's follow-up?",
      a: "The census is a per-billing fold, not a status read. LEFT JOIN billings to their settlements, GROUP BY the billing, then classify: no receipt row is the no-rail arm, SUM(receipts) < billed is the partial arm, else exact — then fold the classes themselves for the board. The follow-ups are where candidates die: why not filter status = 'open' for unpaid? Because the book's 6 open billings (19609.00) and its 6 no-rail billings (15217.00) are different sets — one open billing took a 4000.00 partial against 6148.00, and one paid-status billing has no rail at all. I quote the db's actuals — 21 exact / 65612.00, 1 partial, 6 none / 15217.00 — and say the definition out loud: coverage is a join state, not a status string.",
      tag: "aggregation",
    },
    {
      id: "bofa-t4",
      q: "A teammate says 'the unpaid book is the open book — both are six billings.' Where does that break?",
      a: "The counts coincide; the sets don't. The open-status census carries 19609.00; the no-rail anti-join carries 15217.00 — and the difference is exactly the two honest traps in this book: one open billing took a 4000.00 partial against 6148.00, so it HAS a settlement and drops out of the anti-join, while one paid-status billing (1756.00) has no settlement row and rides IN it. The general lesson: IS NULL on the LEFT JOIN's right-side key is the definition of 'never settled', and a status column is a claim, not evidence. On BofA screens I name both lists — open-not-necessarily-unpaid, unpaid-not-necessarily-open — before choosing which one the ask actually means.",
      tag: "nulls",
    },
    {
      id: "bofa-t5",
      q: "Walk me through SQL's logical evaluation order and where it bites in a rail-census query.",
      a: "FROM and JOIN build the rows, WHERE filters rows, GROUP BY folds them, HAVING filters groups, SELECT projects, ORDER BY and LIMIT run last. The bite: WHERE executes before any fold exists, so WHERE SUM(amount_cents) > 0 is an error or a silent misread — the gate on a fold is always HAVING. Conversely, aliases born in SELECT can't be referenced in WHERE but can be in ORDER BY in most engines, and in GROUP BY SQLite is lenient where other engines refuse. On the market board I keep the region filter (a row predicate) in WHERE and the small-book gate on billing counts in HAVING, and I say that split out loud — the interviewer is checking whether pipeline order is a mental model or a memorized list.",
      tag: "pipeline",
    },
    {
      id: "bofa-t6",
      q: "Fee-band review wants every billing larger than the book's average billing. Subquery, CTE, or window — and why?",
      a: "Three honest shapes. A scalar subquery — WHERE amount_cents > (SELECT AVG(amount_cents) FROM invoices) — is the smallest correct form for one benchmark. A windowed AVG() OVER () gives the same line while keeping every billing visible, which is better when the review also wants each billing's premium versus the mean. A CTE earns its keep when the benchmark gets a definition — 'average over open-and-paid billings only, void excluded' — because a named, commented fold beats a nested one-liner nobody dares to touch. I pick by how much definition the benchmark carries; on a fee book, benchmarks always grow definitions, so I lean CTE earlier than fashion suggests.",
      tag: "subqueries",
    },
    {
      id: "bofa-t7",
      q: "The deck wants billing volume by statement cycle and settlement lag per billing. How do you handle dates in SQLite for both?",
      a: "Two different date tools. Cycle volume buckets with SUBSTR(issued_on, 1, 7) — a '2024-10' style month key that GROUP BY folds cleanly across the 2024-01 to 2025-02 window. Lag needs arithmetic on instants: julianday(first settlement) - julianday(issued_on) gives fractional days per billing, averaged and rounded once at the edge — the book's settled billings run 28.4 days average against 13 fastest and 84 slowest, on flat 30-day terms. The traps I call out: julianday over a missing settlement NULLs the row (which is the definition — unsettleable billings have no lag), string months sort correctly but don't date-math, and rounding belongs in exactly one place so the deck and the query agree.",
      tag: "dates",
    },
    {
      id: "bofa-t8",
      q: "Controls found a void billing that still drew a settlement, and a paid billing with no rail hit. How do you keep breaks from becoming bad reads?",
      a: "Detect, quantify, route — and never trust one column alone. Detect by pairing state with evidence: status = 'void' AND a receipt row exists is the void-but-settled class (925.00 here); status = 'paid' AND no receipt is the paid-no-rail class (1756.00); a one-pass census counts both arms with FILTER (WHERE …) so nobody reruns five queries at close. Quantify in dollars, not adjectives — numbers route work. Route: flag and hand to the desk that owns the fix; never delete, never silently re-status. Then reconcile against the books of record — the ledger still proves 181080.00 against 181080.00 because double-entry records what HAPPENED, which is exactly why the trial balance alone is never sufficient evidence of correctness.",
      tag: "quality",
    },
    {
      id: "bofa-t9",
      q: "You need 'billings that have at least one settlement' without fanning the row count. EXISTS, IN, or JOIN — and what does each cost?",
      a: "EXISTS is the semi-join: WHERE EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id) — existence only, no fan-out, no dedupe tax, and it short-circuits on the first receipt. IN (SELECT invoice_id …) reads the same and returns the same rows here, but the subquery materializes the full key list and NULL semantics bite when the outer side can be NULL. A plain JOIN is the wrong tool for the question: 27 settlement rows against 28 billings fans five split-plan billings to two rows, and you're back to COUNT(DISTINCT). On this book the three agree on WHICH billings settled but disagree on grain — 21 relationships, 26 receipt rows, 33 join rows — so I say the grain I'm returning before I pick the shape.",
      tag: "subqueries",
    },
    {
      id: "bofa-t10",
      q: "The cash walk needs a running balance AND a three-event sliding total. What are window frames and how do you write both?",
      a: "The frame is the slice of the partition each row's window sees. SUM(amount_cents) OVER (ORDER BY paid_on ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) is the running balance — every row up to now. SUM(amount_cents) OVER (ORDER BY paid_on ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) is the three-event sliding total — the last two rows plus this one, so early rows show partial windows honestly instead of faking history. The RANGE default is the trap: RANGE ties are peers and share the same frame, so same-timestamp rail hits get summed together whether you meant it or not. On a settlement feed where two rails can clear the same instant, I write ROWS explicitly or my cash walk double-counts.",
      tag: "windows",
    },
    {
      id: "bofa-t11",
      q: "The activity board shows ranks 1-2-3-4-5-6-6-6-6-10. Explain that gap and why DENSE_RANK would be wrong for the collections copy.",
      a: "Four households tie at 4 events, so RANK gives them all 6 and skips to 10 for the next count — two households at 3 events share rank 10. That's the Olympic semantics: ties share the rung, positions behind them account for the bodies. DENSE_RANK would number 6,6,6,6 then 7 — consecutive rungs, no gap — which reads cleaner but misstates scarcity: 'rank 7' implies seven households ahead when twenty-two bookings sit in ten households. ROW_NUMBER would break the tie arbitrarily and publish a false order. And the cut matters: a LIMIT 10 board drops one of the rank-10 pair mid-tie, so the footnote says the cut, not just the count. I ship RANK plus a tiebreak column someone can defend.",
      tag: "windows",
    },
    {
      id: "bofa-t12",
      q: "Close wants the card stack on top of the wire stack with a grand total. UNION or UNION ALL — and what's the dedupe trap?",
      a: "UNION ALL, always, for censuses. UNION dedupes the combined set — two rails that happened to post identical (method, count, dollars) rows would collapse into one, silently shrinking the census, and the dedupe sort costs real time on production feeds. UNION ALL appends raw stacks. The one UNION use-case here is intentional: collapsing duplicate rail-hit rows when you're listing distinct billings across two feeds. For the grand total I don't even stack — a second GROUP BY fold or GROUPING SETS-style rollup keeps the arithmetic in one engine. The card's 16 / 37364.00 and wire's 11 / 32248.00 plus the total 27 / 69612.00 is a three-row census, and every row of it must survive a cross-foot.",
      tag: "setops",
    },
    {
      id: "bofa-t13",
      q: "How do you get 'billed but never settled' and 'settled without a billing' as one review? Talk set ops versus anti-joins.",
      a: "EXCEPT is the set-algebra answer: SELECT id FROM invoices EXCEPT SELECT invoice_id FROM payments gives billed-not-settled at billing grain — clean, symmetric, and readable by the auditor. The anti-join (LEFT JOIN … WHERE p.id IS NULL) returns the same membership but keeps the row, so I can carry amount_cents and status for the collections list — that's why the receivables sweep uses the anti-join and 15217.00 rides on it. The reverse direction (settled-but-void) needs the join-with-condition shape because I'm testing status AND receipt together, not set membership. Two honest caveats: EXCEPT dedupes, so split settlements don't distort it, and both directions assume the FK holds — a settlement pointing at no billing needs its own orphan sweep.",
      tag: "setops",
    },
    {
      id: "bofa-t14",
      q: "The tier census needs three stages: lifetime value per household, tier labels, then a fold with a floor. Why stage it in a CTE instead of one query?",
      a: "Because the grain changes twice, and one query hides that. Stage one folds orders to household grain (SUM(total) per customer_id); stage two labels each household with a CASE ladder — flagship over 5000, preferred over 3000, else core; stage three folds the labels and gates with HAVING. A CTE names each stage — WITH lifetime AS (…), tiered AS (…) — so the reviewer audits the ladder before the fold, and the 2-flagship / 2-preferred / 12-core census reads as evidence, not arithmetic. The one-query version works but buries the aggregation order, and the first person to 'simplify' it folds before labeling and gets 16 rows of household grain wearing tier costumes. Named stages survive handoffs; clever one-liners don't.",
      tag: "ctes",
    },
    {
      id: "bofa-t15",
      q: "For each billing, the review wants its largest single receipt next to the billed amount. Correlated subquery or window — and when does each break?",
      a: "Both are correct; they differ in what they tolerate. The correlated form — SELECT i.id, i.amount_cents, (SELECT MAX(p.amount_cents) FROM payments p WHERE p.invoice_id = i.id) — scales to any per-billing aggregate without joining, returns NULL honestly for the never-settled six, and never fans rows. The window form — MAX(p.amount_cents) OVER (PARTITION BY p.invoice_id) — needs the join first, so split-plan billings arrive as two rows wearing the same max, and I'd dedupe after. For 'largest receipt' specifically the correlated subquery wins on grain purity; for 'largest receipt AND its paid_on date' the window wins because MAX() alone can't carry sibling columns. On this book: 28 billings, 27 receipts, five splits — grain discipline decides, not fashion.",
      tag: "subqueries",
    },
    {
      id: "bofa-t16",
      q: "State your NULL policy for the consumer book — three rules you'd defend in a design review.",
      a: "One: NULL means 'not yet', never zero — an unsettled billing has no paid_on, and COALESCE(paid_on, issued_on) would fabricate a settlement date that reads as same-day. I COALESCE for display labels only, never for money math. Two: aggregates skip NULLs silently, so AVG over a column with unsettleable rows computes over a smaller base than the slide claims — I state the base, or I count both (COUNT(*) vs COUNT(paid_on)) so the gap is visible. Three: NULL fails every comparison — the no-rail sweep works because IS NULL is the test, and it breaks the day someone writes WHERE paid_on = NULL or NOT IN against a nullable key list. The book's honest traps — 1756.00 paid with no rail, 4000.00 partial — only survive reads that treat absence as evidence.",
      tag: "nulls",
    },
    {
      id: "bofa-t17",
      q: "Three date jobs: cycle keys, settlement lag, 'this week's billings'. Which SQLite tool for each, and what breaks if you swap them?",
      a: "Cycle keys: SUBSTR(issued_on, 1, 7) or STRFTIME('%Y-%m', issued_on) — same '2024-10' key, and it GROUP BYs and sorts correctly as text. Settlement lag: julianday(paid_on) - julianday(issued_on) — real date math, fractional days, NULL when the receipt is missing, which is the definition and not a bug. 'This week': date(issued_on, 'weekday 0', '-6 days') or strftime('%W') depending on whose week the business means — the definition conversation IS the query. The swap failures: julianday on a month key gives you a number nobody can GROUP BY meaningfully; SUBSTR on a lag gives you string subtraction; and DATE() truncated to day hides intra-day rail order that the cash walk depends on. Pick by whether the job is bucketing, measuring, or filtering.",
      tag: "dates",
    },
    {
      id: "bofa-t18",
      q: "The desk wants receipt-to-receipt gaps per billing to spot slow second halves of split plans. LAG or LEAD — and what's the frame?",
      a: "LAG, because the question points backward: paid_on minus LAG(paid_on) OVER (PARTITION BY invoice_id ORDER BY paid_on) gives the gap since the previous receipt, per billing, in one pass. LEAD computes the same gaps pointing forward — same numbers, anchored to the earlier row — so the choice is which row owns the number, and the deck should say. The first receipt per billing has no predecessor: LAG returns NULL, and that NULL is honest ('no gap yet'), not missing data. The frame is the partition: without PARTITION BY invoice_id the gap crosses billing boundaries and invents a 40-day lag between two unrelated households' settlements. Order matters equally — ORDER BY paid_on or the 'previous' row is whatever the plan handed you.",
      tag: "windows",
    },
    {
      id: "bofa-t19",
      q: "A tier ladder labels 7262.35 as 'preferred' when it should be flagship. Diagnose it.",
      a: "Branch order. CASE evaluates WHENs top-down and stops at the first match, so a ladder written WHEN value >= 3000 THEN 'preferred' WHEN value >= 5000 THEN 'flagship' tests the 3000 gate first — everything over 3000, flagship included, lands in preferred and the flagship tier reads empty. The fix is ordering: strictest band first (5000 before 3000), or use mutually exclusive ranges (BETWEEN 3000 AND 4999.99) so order stops mattering. I prefer ordered gates plus a comment, because BETWEEN ladders rot when someone adds a band and leaves a seam. The tell that it's order and not data: the flagship COUNT is zero while Alice Chen's 7262.35 obviously crosses the line — the ladder ate it.",
      tag: "case",
    },
    {
      id: "bofa-t20",
      q: "Where does HAVING belong in a consumer-bank read, and where does it get abused?",
      a: "HAVING exists for gates on folds: markets whose billings number at least five, tiers whose household count reaches the floor, cycles worth charting. The abuse is twofold. First, using it for row predicates — WHERE status = 'open' belongs before the fold; HAVING MAX(status = 'open') is a performance smell and a readability crime. Second, threshold drift: a gate at 2 versus 1 versus 3 can return identical results on a small book when no group sits between — on this book, no household has exactly one booking, so floors of 1 and 2 agree and the gate looks calibrated when it's untested. A threshold is only meaningful if you've probed its neighbors. State what the floor excludes, not just what it keeps.",
      tag: "pipeline",
    },
    {
      id: "bofa-t21",
      q: "The wire desk wants one manifest line per billing: every rail hit's method and amount, comma-separated. What's the tool and what are its sharp edges?",
      a: "GROUP_CONCAT: GROUP_CONCAT(p.method || ' ' || p.amount_cents/100.0, '; ') OVER a GROUP BY invoice_id folds each billing's receipts into one cell. Sharp edges: order is unspecified unless you ORDER BY inside the SQLite 3.44+ syntax — a manifest that shuffles between runs looks broken even when the dollars tie; the separator is easy to collide with real data, so pick something a rail name can't contain; and the result is TEXT, so any downstream sum needs a CAST and the cents rule re-applied. Split-plan billings show two entries per manifest — that's the feature: the manifest makes the five split plans visible without a self-join. I'd still ship the tabular fold beside it, because manifests audit badly.",
      tag: "aggregation",
    },
    {
      id: "bofa-t22",
      q: "This training book is 103 events — does performance instinct even matter here? What transfers to a production consumer feed?",
      a: "The habits transfer even when the latencies don't. Sargable filters: WHERE issued_on >= '2025-01-01' uses an index; WHERE SUBSTR(issued_on, 1, 7) = '2025-01' wraps the column in a function and scans — same rows, different plan. Fold early: aggregate settlements to billing grain in a CTE, then join — joining 28 billings to 27 receipts is free, joining millions of billings to their rails twice is not. Avoid DISTINCT as a fan-out bandage: COUNT(DISTINCT i.id) after a careless join fixes the number while keeping the wasted rows. And never tune before reading the plan — EXPLAIN QUERY PLAN on the no-rail sweep should show one scan plus a lookup, and if it shows a temp b-tree, the query shape is wrong, not the hardware. Small books let you see the plan; that's the training value.",
      tag: "performance",
    },
    {
      id: "bofa-t23",
      q: "The deck wants rails as columns — card_dollars, wire_dollars — one row per statement cycle. How do you pivot in SQLite?",
      a: "SQLite has no PIVOT, so you write it: SUM(CASE WHEN method = 'card' THEN amount_cents ELSE 0 END)/100.0 AS card_dollars, same for wire, GROUP BY the cycle key. The CASE folds each row into exactly one column — ELSE 0 matters, because ELSE NULL would make SUM skip and read as zero anyway, hiding rows you expected to count. Counts and dollars pivot side by side (COUNT with the same CASE), and the cross-foot check is built in: card + wire should equal the cycle's plain SUM. The failure mode is hard-coding rails someone forgot to enumerate — a third rail appears and silently vanishes from the pivot while the raw fold still shows it. That's why the rail census ships next to the pivot: one for humans, one for the truth.",
      tag: "pivots",
    },
    {
      id: "bofa-t24",
      q: "Your funded-rate and my funded-rate disagree by 8 points. Same query engine, same book. What's actually broken?",
      a: "Definitions, not math. Funded over ALL booked events (103) and funded over non-cancelled events (96) are both defensible, differ by the 7 cancellations, and produce exactly this fight — the denominator is the KPI. The fix is definitions-as-code: a metrics CTE with the filters named and commented (booked = every row; funded = non-cancelled with a settlement), the base counts shipped beside the rates, and the anomaly rows (void-but-settled 925.00, paid-no-rail 1756.00) classified in the same pass so nobody relitigates them at the meeting. Then the census owns the definition: 'funded' means what this query computes, versioned like code. Banks run on ratios whose numerators everyone shares and whose denominators nobody wrote down — writing it down is the job.",
      tag: "metrics",
    },
  ],

  mcqs: [
    {
      id: "bofa-mcq-1",
      prompt: "The close needs the rail census: settlements and dollars per rail. Which query returns card 16 / 37364.00 and wire 11 / 32248.00 in one pass?",
      choices: [
        "SELECT method, COUNT(*), ROUND(SUM(amount_cents)/100.0,2) FROM payments GROUP BY method",
        "SELECT method, COUNT(*), ROUND(SUM(amount_cents)/100.0,2) FROM payments WHERE method = 'card'",
        "SELECT method, SUM(*) FROM payments GROUP BY rails",
        "SELECT COUNT(*), SUM(amount_cents) FROM payments",
      ],
      answer: 0,
      why: "GROUP BY method folds the settlement feed per rail in one pass — card 16 / 37364.00, wire 11 / 32248.00, each cross-footing into the cash book's 69612.00 debit fold. One query, both rails, no WHERE filtering one of them away.",
      notes: [
        { choice: 1, why: "The WHERE keeps only card — the census loses the wire rail and the cross-foot silently breaks. A census that filters by rail isn't a census; run one fold per GROUP BY, not one query per rail." },
        { choice: 3, why: "No GROUP BY merges both rails into one row — 27 settlements for 69612.00 total. True, useless: the close signs per rail, and the method mix is the whole point." },
      ],
      difficulty: "easy",
    },
    {
      id: "bofa-mcq-2",
      prompt: "Card carries 16 of the 27 settlements. Which expression prints the card share as 59.3 rather than 59 — or worse, 0?",
      choices: [
        "100 * COUNT(*) FILTER (WHERE method='card') / COUNT(*)",
        "100.0 * COUNT(*) FILTER (WHERE method='card') / COUNT(*)",
        "CAST(COUNT(*) FILTER (WHERE method='card') / COUNT(*) AS REAL)",
        "COUNT(*) FILTER (WHERE method='card') / COUNT(*) * 100.0",
      ],
      answer: 1,
      why: "Multiplying by 100.0 first promotes the fold to real arithmetic BEFORE the division — 16/27 becomes 59.3. In SQLite, integer-then-integer division truncates at the division itself.",
      notes: [
        { choice: 0, why: "16/27 in integer arithmetic is 0; times 100 prints 0. The .0 must enter before the division — promoting after the fact promotes a zero." },
        { choice: 2, why: "The CAST wraps an already-truncated integer 0. Casting zero to REAL is still zero — the classic post-hoc promotion bug on ratio reads." },
      ],
      difficulty: "easy",
    },
    {
      id: "bofa-mcq-3",
      prompt: "The deck wants booked events bucketed by statement cycle (2024-01, 2024-02, …). Which expression builds that key?",
      choices: [
        "SUBSTR(created_at, 1, 7)",
        "SUBSTR(created_at, 1, 4)",
        "created_at % 100",
        "COUNT(created_at)",
      ],
      answer: 0,
      why: "SUBSTR(created_at, 1, 7) slices '2024-08-14 …' to '2024-08' — the month key the whole 2024-01 to 2025-02 trend is built on, and it sorts correctly as text.",
      notes: [
        { choice: 1, why: "Four characters is the year — every event in a year collapses into '2024'. The cycle cadence vanishes and the trend line flatlines." },
        { choice: 2, why: "Timestamps aren't numbers you can modulo — the expression coerces or errors, and neither produces a '2024-08' key. Month keys are string slices, not arithmetic." },
      ],
      difficulty: "easy",
    },
    {
      id: "bofa-mcq-4",
      prompt: "Coverage census: one billing was billed 6148.00 and drew a 4000.00 settlement. Which read classifies it partial — and not exact or open?",
      choices: [
        "WHERE status = 'partial'",
        "LEFT JOIN to settlements, then SUM(receipts) < billed per billing",
        "WHERE amount_cents < 614800",
        "GROUP BY status with COUNT(*)",
      ],
      answer: 1,
      why: "Coverage is a join state: fold the billing's settlement rows, compare the fold to the billed amount — 4000.00 against 6148.00 is partial. There is no 'partial' status in the book; the state lives across two tables.",
      notes: [
        { choice: 0, why: "That status doesn't exist — the billing still says open while carrying 4000.00 of receipts. Filtering on a state string that isn't there returns an empty census and the partial never surfaces." },
        { choice: 3, why: "COUNT(*) per status says nothing about amounts — the partial sits inside 'open'. The status fold reports 6 open billings; the coverage fold reports the 4000.00 against 6148.00 that matters." },
      ],
      difficulty: "medium",
    },
    {
      id: "bofa-mcq-5",
      prompt: "The market board should only show footprint markets whose billings number at least 5. Where does that gate go?",
      choices: [
        "WHERE COUNT(*) >= 5",
        "HAVING COUNT(*) >= 5",
        "LIMIT 5",
        "ORDER BY COUNT(*) >= 5",
      ],
      answer: 1,
      why: "The gate is on a fold, and folds don't exist until after GROUP BY — the gate is HAVING. WHERE runs before the fold and would either error or filter the wrong thing.",
      notes: [
        { choice: 0, why: "WHERE sees rows, not groups — COUNT(*) doesn't exist yet there. Most engines reject it outright; the ones that don't are lying about what they computed." },
        { choice: 2, why: "LIMIT 5 caps the OUTPUT at five markets — a different rule entirely. A small market could top the board on three billings while a 14-billing market is truncated away." },
      ],
      difficulty: "medium",
    },
    {
      id: "bofa-mcq-6",
      prompt: "A billing-to-settlement join for the coverage census returns 33 rows for 28 billings. The honest billing count in that query is:",
      choices: [
        "COUNT(*) — 33 is the billing count now",
        "COUNT(DISTINCT i.id) — the join fanned five split-settlement billings to two rows each",
        "28 — COUNT(*) auto-deduplicates billings",
        "27 — one billing is void and vanishes",
      ],
      answer: 1,
      why: "Five billings settled on the split plan carry two settlement rows each, so the join prints 33 rows at settlement grain. COUNT(DISTINCT i.id) folds back to the 28-billing book the census is about.",
      notes: [
        { choice: 0, why: "COUNT(*) counts the join's rows — settlement grain, not billing grain. Reporting 33 settled billings inflates the census by exactly the five split plans." },
        { choice: 2, why: "Nothing deduplicates itself. The 33-row grain is real evidence of the splits — you fold it deliberately with DISTINCT, you don't assume it away." },
      ],
      difficulty: "medium",
    },
    {
      id: "bofa-mcq-7",
      prompt: "Which read surfaces the void billing that still drew a 925.00 settlement?",
      choices: [
        "SELECT … FROM invoices WHERE status = 'void' — one row",
        "Pair state with evidence: status='void' AND an EXISTS settlement row",
        "SELECT … FROM payments WHERE method = 'void'",
        "Anti-join: invoices with NO settlement rows",
      ],
      answer: 1,
      why: "The anomaly is a PAIR: a void status and a receipt that exists. Status alone shows the void (true but incomplete — it hides the 925.00 hit); the paired read proves the settlement should never have cleared.",
      notes: [
        { choice: 2, why: "'void' is a billing status, not a rail — the payments table has no such method. The query errors, and the break stays invisible at close." },
        { choice: 3, why: "The anti-join finds NEVER-settled billings — the opposite evidence. The void-but-settled row HAS a settlement, so the anti-join is structurally blind to it." },
      ],
      difficulty: "medium",
    },
    {
      id: "bofa-mcq-8",
      prompt: "Close wants both break classes — void-but-settled dollars and paid-no-rail dollars — in ONE pass. Which shape delivers it?",
      choices: [
        "Two separate queries UNIONed together",
        "SUM(amount_cents) FILTER (WHERE status='void' AND receipt EXISTS) alongside SUM(amount_cents) FILTER (WHERE status='paid' AND receipt IS NULL) after a LEFT JOIN",
        "GROUP BY status and read two rows",
        "CASE WHEN status='void' THEN amount ELSE NULL END over the billing table alone",
      ],
      answer: 1,
      why: "FILTER (WHERE …) arms over one LEFT JOIN fold both classes in a single scan — 925.00 and 1756.00 side by side, with the join's IS NULL arm proving 'no rail' inside the same pass.",
      notes: [
        { choice: 0, why: "Two scans stapled together isn't a census — it's two queries wearing one result set. The arms must share the same join and the same row scope or the comparison isn't evidence." },
        { choice: 3, why: "The billing table alone can't see settlements — the 925.00 receipt lives in payments. Without the LEFT JOIN the void arm reads as 'void', and the paid-no-rail arm is unreachable." },
      ],
      difficulty: "hard",
    },
    {
      id: "bofa-mcq-9",
      prompt: "Two sixes: the open-status census counts 6 billings / 19609.00; the no-rail anti-join counts 6 billings / 15217.00. What explains the dollar gap?",
      choices: [
        "Rounding — the same six billings, measured in different units",
        "Different membership: the 4000.00-partial open billing has a receipt (out of the anti-join), while a 1756.00 paid-status billing has none (in it)",
        "The anti-join drops void billings; the status census keeps them",
        "A data error — both should read 19609.00",
      ],
      answer: 1,
      why: "Same count, different sets: the anti-join's 'no receipt row' test and the status column disagree in exactly two places — the open billing with a 4000.00 partial and the paid-status billing with no rail at 1756.00. That 4392.00 swing is the whole lesson: coverage is evidence, status is a claim.",
      notes: [
        { choice: 2, why: "Neither read filters void explicitly — the anti-join keys on receipt presence. Inventing a void filter explains a gap the data doesn't have." },
        { choice: 0, why: "'Different units' is a units bug's excuse — both queries divide by 100.0. The gap is membership, and the two honest anomalies in this book are its entire cause." },
      ],
      difficulty: "hard",
    },
    {
      id: "bofa-mcq-10",
      prompt: "The settlement-lag card averages billing-to-first-settlement over 'paid' billings. Which denominator is correct?",
      choices: [
        "All 21 paid billings",
        "All 27 settlement rows",
        "The 20 paid billings that actually carry a settlement — 28.4 days average",
        "All 28 billings on the book",
      ],
      answer: 2,
      why: "Lag needs both endpoints: 21 paid billings include one with NO settlement row (1756.00) — julianday over nothing NULLs it — so the real base is the 20 paid-with-receipt billings, averaging 28.4 days against flat 30-day terms.",
      notes: [
        { choice: 0, why: "The 21st paid billing has no receipt, so its lag is NULL — it silently drops out of AVG anyway. Claiming a 21-billing base misstates the denominator on the slide." },
        { choice: 1, why: "27 settlement rows is settlement grain — five split billings count twice and billings with no lag can't be in any lag base. Grain before average, every time." },
      ],
      difficulty: "hard",
    },
    {
      id: "bofa-mcq-11",
      prompt: "Close stacks the card fold on top of the wire fold: two rows, same columns. Which operator appends without dedupe risk?",
      choices: [
        "UNION",
        "UNION ALL",
        "INTERSECT",
        "JOIN ON 1=1",
      ],
      answer: 1,
      why: "UNION ALL appends the two stacks raw — card 16 / 37364.00 then wire 11 / 32248.00 — with no dedupe pass to collapse rows that merely look alike. For a census, every row is evidence.",
      notes: [
        { choice: 0, why: "UNION dedupes the combined set — two identical-looking rail rows would silently merge and the census shrinks. The dedupe also costs a sort you don't need." },
        { choice: 2, why: "INTERSECT returns rows present in BOTH stacks — card and wire share no method row, so the result is empty and the close ships a blank page." },
      ],
      difficulty: "easy",
    },
    {
      id: "bofa-mcq-12",
      prompt: "Two analysts build the same cycle key: SUBSTR(issued_on, 1, 7) and STRFTIME('%Y-%m', issued_on). On '2025-01-08', what does each return?",
      choices: [
        "'2025-01' and '2025-01' — equivalent here",
        "'2025-01' and '2025-1'",
        "'2025-01' and 202501 (numeric)",
        "'01' and '2025-01'",
      ],
      answer: 0,
      why: "Both slice ISO '2025-01-08' to the text key '2025-01' — same buckets, same text sort. Pick one for consistency, but neither lies about the month.",
      notes: [
        { choice: 1, why: "STRFTIME's %m is zero-padded — '01', not '1'. If it weren't, text sorts would interleave '2025-1' after '2025-10' and the trend would scramble." },
        { choice: 2, why: "Both are text functions returning TEXT. The moment one returns a number, '2025-1' sorts before '2024-10' and the deck's spine breaks." },
      ],
      difficulty: "easy",
    },
    {
      id: "bofa-mcq-13",
      prompt: "After invoices LEFT JOIN payments, which count still equals 28 — the billing book?",
      choices: [
        "COUNT(*)",
        "COUNT(p.id)",
        "COUNT(p.method)",
        "COUNT(DISTINCT p.id)",
      ],
      answer: 0,
      why: "COUNT(*) counts rows of the joined result — LEFT JOIN keeps all 28 billings, so 28. The others count receipt-side values and skip the no-rail billings.",
      notes: [
        { choice: 1, why: "COUNT(p.id) drops the six no-rail billings whose p.id is NULL — 22, not 28. That's the evidence count, not the book count." },
        { choice: 3, why: "DISTINCT p.id counts distinct receipts — 22 minus the split duplicates it collapses. Neither the book nor even the receipt count." },
      ],
      difficulty: "easy",
    },
    {
      id: "bofa-mcq-14",
      prompt: "Which query returns billing ids that were issued but have no settlement row — the receivables watch — using set algebra?",
      choices: [
        "SELECT id FROM invoices INTERSECT SELECT invoice_id FROM payments",
        "SELECT id FROM invoices EXCEPT SELECT invoice_id FROM payments",
        "SELECT id FROM invoices UNION SELECT invoice_id FROM payments",
        "SELECT invoice_id FROM payments EXCEPT SELECT id FROM invoices",
      ],
      answer: 1,
      why: "EXCEPT keeps the left set minus the right — billed ids with no receipt — the 6-billing / 15217.00 watch. Grain is id-on-id, so no fan-out distorts it.",
      notes: [
        { choice: 0, why: "INTERSECT returns billed AND settled — 22 ids. That's the covered book, the exact complement of what collections works." },
        { choice: 3, why: "Reversed EXCEPT finds settlement ids with no matching billing — the orphan direction. The FK holds here, so it returns nothing and hides the watch." },
      ],
      difficulty: "medium",
    },
    {
      id: "bofa-mcq-15",
      prompt: "The fee review wants billings larger than the book's average billing (31.06). Which WHERE clause is correct?",
      choices: [
        "WHERE amount_cents > 3106",
        "WHERE amount_cents > (SELECT AVG(amount_cents) FROM invoices)",
        "WHERE amount_cents > AVG(amount_cents)",
        "HAVING amount_cents > (SELECT AVG(amount_cents) FROM invoices)",
      ],
      answer: 1,
      why: "The benchmark is computed, not transcribed: a scalar subquery puts the live average — 3106.32 cents — into the row predicate, and the result tracks the book as it changes.",
      notes: [
        { choice: 0, why: "3106 is the truncated average — billings of 3106.5 cents sneak past. Hardcoding also rots the moment one billing posts; the subquery never does." },
        { choice: 2, why: "AVG in WHERE is an aggregate outside a fold — most engines reject it; the ones that accept it compute a nonsense per-row average." },
      ],
      difficulty: "medium",
    },
    {
      id: "bofa-mcq-16",
      prompt: "Split-plan billings drew two receipts. Which window shows each receipt's gap from its predecessor, per billing?",
      choices: [
        "paid_on - LAG(paid_on) OVER (ORDER BY paid_on)",
        "paid_on - LAG(paid_on) OVER (PARTITION BY invoice_id ORDER BY paid_on)",
        "LEAD(paid_on) OVER (PARTITION BY invoice_id) - paid_on, without ORDER BY",
        "julianday(paid_on) - julianday(issued_on)",
      ],
      answer: 1,
      why: "PARTITION BY invoice_id keeps the gap inside one billing; ORDER BY paid_on defines 'previous'. The first receipt's NULL gap is honest — no predecessor exists.",
      notes: [
        { choice: 0, why: "No partition: the gap crosses billing boundaries and invents lag between unrelated households. The single biggest LAG bug on joined feeds." },
        { choice: 3, why: "That's billing-to-settlement lag, not receipt-to-receipt — a different question. It also NULLs for the six never-settled billings regardless." },
      ],
      difficulty: "medium",
    },
    {
      id: "bofa-mcq-17",
      prompt: "The tier ladder labels Alice Chen's 7262.35 'preferred' instead of 'flagship'. The ladder reads: WHEN >= 3000 THEN 'preferred', WHEN >= 5000 THEN 'flagship', ELSE 'core'. What's wrong?",
      choices: [
        "The thresholds are wrong — 5000 should be 7000",
        "Branch order: CASE stops at the first WHEN, so 7262.35 matches >= 3000 first",
        "CASE can't compare decimals",
        "The ELSE catches it",
      ],
      answer: 1,
      why: "CASE evaluates top-down and stops at the first match — the 3000 gate eats everything over 3000, flagship included. Strictest band first: 5000 before 3000, and the ladder reads 2 / 2 / 12.",
      notes: [
        { choice: 0, why: "The thresholds match the published 3000/5000 policy. Moving to 7000 hides the bug by redefining the ladder — and Emma's 6640.56 would still mislabel." },
        { choice: 3, why: "The ELSE never fires for anything over 3000 — the first WHEN already claimed it. ELSE only catches what falls through every gate." },
      ],
      difficulty: "medium",
    },
    {
      id: "bofa-mcq-18",
      prompt: "The activity board runs RANK() OVER (ORDER BY COUNT(*) DESC) with LIMIT 10. Ranks run 1,2,3,4,5,6,6,6,6,10. What does the 10 mean — and what does the cut hide?",
      choices: [
        "Ten households are on the board",
        "Two households tie at 3 events and share rank 10 — and LIMIT 10 drops one of them mid-tie",
        "RANK skips numbers for performance",
        "A household has 10 events",
      ],
      answer: 1,
      why: "The four-way tie at 4 events occupies ranks 6-6-6-6, so the next count (3 events, two households) starts at 10 — and the LIMIT-10 cut keeps only one of the tied pair. The board needs a cut footnote.",
      notes: [
        { choice: 0, why: "Ten rows, but ranks don't count rows — the gap means positions 7-9 are unoccupied. Reading 10 as board size is the Olympic-semantics miss." },
        { choice: 2, why: "The skip is tie arithmetic: ties share a rung and bodies behind them count. It's deterministic math, not an implementation shortcut." },
      ],
      difficulty: "hard",
    },
    {
      id: "bofa-mcq-19",
      prompt: "Per billing, show the billed amount beside its largest single receipt. Which shape carries the MAX and never fans rows?",
      choices: [
        "invoices JOIN payments, MAX(p.amount_cents), GROUP BY i.id",
        "invoices LEFT JOIN payments, MAX(p.amount_cents) OVER (PARTITION BY i.id), no fold",
        "Scalar correlated subquery: (SELECT MAX(p.amount_cents) FROM payments p WHERE p.invoice_id = i.id)",
        "invoices CROSS JOIN payments with a filter",
      ],
      answer: 2,
      why: "The correlated subquery aggregates inside itself — one value per billing, NULL for the six never-settled, no fan-out, no fold to misstate. Grain stays at the billing book's 28.",
      notes: [
        { choice: 0, why: "The GROUP BY fold works but returns only billing ids that grouped — pair it carelessly with billing columns and the six no-rail rows vanish from the read." },
        { choice: 1, why: "The window keeps one row per receipt — split-plan billings print twice with the same max. You've moved the fan-out into the output." },
      ],
      difficulty: "hard",
    },
    {
      id: "bofa-mcq-20",
      prompt: "The cash walk needs each settlement plus the running total of the last three receipts in time order. Which frame does the sliding part?",
      choices: [
        "SUM(amount_cents) OVER (ORDER BY paid_on ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)",
        "SUM(amount_cents) OVER (ORDER BY paid_on RANGE BETWEEN 2 PRECEDING AND CURRENT ROW)",
        "SUM(amount_cents) OVER ()",
        "SUM(amount_cents) OVER (ORDER BY paid_on ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)",
      ],
      answer: 0,
      why: "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW is a row-count frame: this receipt plus the two before it, whatever their timestamps. Early rows show honest partial windows.",
      notes: [
        { choice: 1, why: "RANGE measures VALUE distance, not row count — '2 PRECEDING' means timestamps within 2 units, which on a same-day rail feed is a different window entirely." },
        { choice: 3, why: "That's the running total — every row since the start. Useful for the balance walk, but it's not the three-receipt slide the desk asked for." },
      ],
      difficulty: "hard",
    },
    {
      id: "bofa-mcq-21",
      prompt: "The billing-size card shows 31.06. The query computed AVG(amount_cents)/100.0 and wrapped the whole thing in ROUND twice — once inside, once outside. What's the risk?",
      choices: [
        "None — rounding is idempotent",
        "Double rounding can drift from the single-ROUND figure the audit and the deck expect",
        "The inner ROUND makes it an integer",
        "AVG rejects ROUND inside it",
      ],
      answer: 1,
      why: "31.0632 rounds to 31.06 in one pass — but an inner ROUND to 1dp gives 31.1 first, and the outer pass can't recover the lost cent. One rounding, one place — usually the edge — so every reader recomputes the same cell.",
      notes: [
        { choice: 0, why: "Rounding is idempotent only at the same precision. ROUND(ROUND(x,1),2) ≠ ROUND(x,2) for values like 31.0639 — the drift is real and auditors find it." },
        { choice: 2, why: "ROUND(x,2) keeps two decimals — it isn't an integer cast. The cents rule is /100.0 with ROUND(…,2), never a truncation." },
      ],
      difficulty: "easy",
    },
    {
      id: "bofa-mcq-22",
      prompt: "A display column should show the rail name, with '(no rail)' when a billing has no settlement. Which expression?",
      choices: [
        "p.method + '(no rail)'",
        "COALESCE(p.method, '(no rail)')",
        "IFNULL(method, 0)",
        "p.method IS '(no rail)'",
      ],
      answer: 1,
      why: "COALESCE returns the first non-NULL: the rail when one exists, the label when the LEFT JOIN left NULLs. It's display-only — the money math keeps the NULL.",
      notes: [
        { choice: 0, why: "+ is arithmetic on NULL — the whole expression NULLs, and the label never appears. String concat needs ||, and NULL still poisons it without COALESCE." },
        { choice: 2, why: "A zero isn't a rail — the display invents a settlement method that doesn't exist. Fallbacks must be same-type and same-meaning." },
      ],
      difficulty: "easy",
    },
    {
      id: "bofa-mcq-23",
      prompt: "The census ends ORDER BY 1, 3 DESC. What does that do?",
      choices: [
        "Orders by column values 1 and 3",
        "Orders by the first output column ascending, then the third descending",
        "A syntax error in SQLite",
        "Orders by row number",
      ],
      answer: 1,
      why: "Ordinals reference output positions — cycle ascending, then dollars descending. Legal, but the named-column form survives column reorders and reads at review.",
      notes: [
        { choice: 0, why: "Constants 1 and 3 as expressions would give every row the same key — SQLite reads bare integers in ORDER BY as ordinals, which is exactly the ambiguity to avoid." },
        { choice: 2, why: "SQLite accepts ordinals in ORDER BY. The portability and readability argument is why kits ban the style, not the grammar." },
      ],
      difficulty: "easy",
    },
    {
      id: "bofa-mcq-24",
      prompt: "One manifest cell per billing: its rail hits as 'card 2335; card 2870'. Which fold builds it?",
      choices: [
        "GROUP_CONCAT(p.method || ' ' || ROUND(p.amount_cents/100.0, 2), '; ')",
        "CONCAT(p.method, '; ')",
        "SUM(p.method)",
        "STRING_AGG(DISTINCT p.method)",
      ],
      answer: 0,
      why: "GROUP_CONCAT folds the per-billing receipt rows into one delimited cell, expression and all — method, space, dollars, semicolon between hits.",
      notes: [
        { choice: 1, why: "CONCAT joins strings but not rows — one value per row, no folding. The manifest needs the aggregate that walks the group." },
        { choice: 2, why: "SUM over text coerces methods to 0 and adds — the manifest becomes a number and every rail name is gone." },
      ],
      difficulty: "medium",
    },
    {
      id: "bofa-mcq-25",
      prompt: "Settlement lag averages 28.4 days. A teammate computes SUBSTR(paid_on, 1, 10) - SUBSTR(issued_on, 1, 10). What happens?",
      choices: [
        "Same 28.4 — string dates subtract fine",
        "SQLite coerces the date strings to numbers — garbage like -7993, not a lag",
        "NULL for every row",
        "28.4 but rounded wrong",
      ],
      answer: 1,
      why: "'2025-01-08' coerces to the number 2025 and the arithmetic invents a meaningless difference. Lag is julianday(paid_on) - julianday(issued_on) — real instants, real days.",
      notes: [
        { choice: 0, why: "String subtraction isn't date subtraction. The date() and julianday() functions exist precisely because ISO text is not a numeric timeline." },
        { choice: 2, why: "It doesn't NULL — the coercion succeeds and produces confidently wrong numbers. Silent garbage is worse than an error; it ships." },
      ],
      difficulty: "medium",
    },
    {
      id: "bofa-mcq-26",
      prompt: "Why does the collections sweep use LEFT JOIN … WHERE p.id IS NULL instead of WHERE i.id NOT IN (SELECT invoice_id FROM payments)?",
      choices: [
        "NOT IN is slower on 28 rows",
        "NOT IN with a NULL in the key list returns zero rows — and the column is nullable by schema",
        "They're always identical",
        "LEFT JOIN can't express anti-joins",
      ],
      answer: 1,
      why: "One NULL in the subquery's invoice_id and NOT IN returns nothing — the sweep dies silently. The LEFT JOIN + IS NULL shape is NULL-proof and carries the billing's columns for the list.",
      notes: [
        { choice: 0, why: "Speed isn't the issue at this scale — correctness is. The trap fires on data shape, not plan time, and it fires on production feeds too." },
        { choice: 3, why: "The LEFT JOIN anti-join IS the canonical shape — join, keep unmatched. The claim inverts the actual relationship." },
      ],
      difficulty: "medium",
    },
    {
      id: "bofa-mcq-27",
      prompt: "Segment the 16 households into four equal-value quartiles by lifetime booked value. Which window does it?",
      choices: [
        "NTILE(4) OVER (ORDER BY lifetime_value DESC)",
        "ROUND(lifetime_value / 4)",
        "RANK() OVER (ORDER BY lifetime_value) / 4",
        "QUARTILE(lifetime_value, 4)",
      ],
      answer: 0,
      why: "NTILE(4) deals the ordered rows into four buckets as evenly as the count allows — 4 households per quartile here. It's a tile, not an average.",
      notes: [
        { choice: 1, why: "Dividing dollars by 4 invents a threshold nobody asked for — Alice's 7262.35 becomes 1815.59 and means nothing. Tiles are row mechanics." },
        { choice: 3, why: "QUARTILE isn't a SQLite window function — the query errors. NTILE is the tool, and its bucket edges land between rows, not between values." },
      ],
      difficulty: "medium",
    },
    {
      id: "bofa-mcq-28",
      prompt: "Pivot the rail census: one row with card_dollars and wire_dollars. Which CASE shape is correct?",
      choices: [
        "SUM(CASE WHEN method='card' THEN amount_cents ELSE 0 END)/100.0 AS card_dollars, …wire…",
        "CASE WHEN method='card' THEN SUM(amount_cents) END",
        "SUM(amount_cents) WHERE method='card'",
        "CASE method WHEN 'card' THEN 'card_dollars'",
      ],
      answer: 0,
      why: "The CASE runs per row — each settlement folds into exactly one column, ELSE 0 keeps the other arm at zero, and SUM aggregates the whole book once. No GROUP BY needed for a one-row census.",
      notes: [
        { choice: 1, why: "SUM inside CASE aggregates before the branch — every row sees the same grand total and the CASE picks it for one rail only. Branch on the row value, fold after." },
        { choice: 2, why: "WHERE isn't legal inside an aggregate — it filters rows before the fold, killing the wire arm instead of zeroing it." },
      ],
      difficulty: "hard",
    },
    {
      id: "bofa-mcq-29",
      prompt: "Both filters return January-2025 billings. Which one can use an index on issued_on?",
      choices: [
        "WHERE SUBSTR(issued_on, 1, 7) = '2025-01'",
        "WHERE issued_on >= '2025-01-01' AND issued_on < '2025-02-01'",
        "WHERE strftime('%Y-%m', issued_on) = '2025-01'",
        "WHERE CAST(issued_on AS TEXT) LIKE '2025-01%'",
      ],
      answer: 1,
      why: "Only the range predicate leaves the column bare — sargable, index-seekable. The others wrap the column in a function and force a full scan.",
      notes: [
        { choice: 0, why: "SUBSTR(issued_on, …) computes per row — the index on issued_on is useless. Same rows, worse plan; the classic non-sargable rewrite trap." },
        { choice: 3, why: "LIKE with a leading wildcard plus CAST is a double scan guarantee. Formatting for display belongs in SELECT, never in the filter." },
      ],
      difficulty: "hard",
    },
    {
      id: "bofa-mcq-30",
      prompt: "Two analysts report a funded rate: one divides funded events by 103, the other by 96. The book shows 7 cancelled events. What's the real problem?",
      choices: [
        "One of them divided in the wrong order",
        "Different denominators — cancelled events included vs excluded. Both rates are 'right'; the definition isn't written down",
        "The 7 cancels are a data error to delete",
        "103 and 96 can't both be true",
      ],
      answer: 1,
      why: "Same numerator, different base: funded-over-booked (103) vs funded-over-kept (96). The fix is definitions-as-code — name the denominator, ship the base count beside the rate.",
      notes: [
        { choice: 0, why: "Integer-division order is a real bug class, but both rates here are decimals — the 8-point gap is membership, not arithmetic." },
        { choice: 2, why: "Cancellations are business events, not dirt. Deleting them changes the funnel every stakeholder has quoted — the definition fight comes first." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-bofa-1",
      tier: "medium",
      topic: "j7",
      universe: "month-close",
      title: "The rail census the close signs",
      brief:
        "BofA-flavored memo on the storefront db (payments = settlement rails, invoices = consumer billings): month-close signs on the rail census — every settlement folded per rail, counts and dollars, cross-footed to the books. The controller is explicit: 'the census must prove every rail hit maps to a live billing; a settlement pointing at nothing is a break.' Probed facts: card, the debit-card rail, carries **16 settlements for 37364.00**; wire, the ACH-and-corporate rail, carries **11 for 32248.00** — and the pair cross-foots to the cash book's 69612.00 debit fold, the tie the close signs against.",
      ask: "Return the rail census: rail, settlement count, distinct billings cleared, settled dollars (2dp), biggest dollars first.",
      template:
        "SELECT p.{1} AS rail,\n       {2}(*) AS settlements,\n       COUNT(DISTINCT p.invoice_id) AS billings_cleared,\n       ROUND({3}(p.amount_cents) / 100.0, 2) AS settled_dollars\nFROM payments p\nJOIN invoices i ON i.id = p.{4}\nGROUP BY p.method\nORDER BY settled_dollars DESC;",
      slots: [
        {
          answer: "method",
          kind: "keyword",
          label: "the rail column",
          why: "p.method is the rail — card versus wire, the census's grouping axis. Any other column labels the rows with whatever value happens to ride the grouped row: a paid_on date or an id where a rail name belongs.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the settlement counter",
          why: "COUNT(*) counts the rail's settlement rows — 16 and 11. SUM(*) and MIN(*) are syntax errors: only COUNT folds a star, and the census leads with a census, not a sum.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the dollar fold",
          why: "SUM(p.amount_cents) / 100.0 is settled dollars — 37364.00 on card. AVG would print 2335.25, the mean hit, and the cross-foot to the cash book's 69612.00 dies quietly.",
        },
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the rail-to-billing key",
          why: "The join runs on p.invoice_id = i.id: every settlement must map to a live billing or the inner join drops it — that IS the controller's control. Joining on a non-key column pairs settlements with unrelated billings or empties the census outright.",
        },
      ],
      distractors: ["MAX", "MIN", "AVG", "customer_id", "paid_on"],
      walkthrough:
        "A rail census is a GROUP BY fold wearing a control. FROM payments JOIN invoices ON i.id = p.invoice_id is the referential sweep — an inner join, so a settlement pointing at a billing that doesn't exist would silently drop from the census instead of faking the tie. GROUP BY p.method folds the feed per rail; COUNT(*) is the census (16 and 11), SUM(p.amount_cents) rounded once through / 100.0 is the dollars (37364.00 and 32248.00), and COUNT(DISTINCT p.invoice_id) proves each rail's hits land on distinct billings — the split-plan check. The distractors all break it honestly: MAX and MIN in the dollar fold print 2870.00-and-32248.00-style tails instead of sums, AVG prints a mean where the close needs a total, customer_id doesn't exist on the rail feed, and joining on paid_on pairs settlements with nothing. The habit being graded: the join IS the control, and the fold you sign is the fold that cross-foots — 37364.00 plus 32248.00 against the cash book's 69612.00.",
    },
    {
      id: "cs-bofa-2",
      tier: "hard",
      topic: "x2",
      universe: "fraud",
      title: "The one-pass break census",
      brief:
        "BofA-flavored memo on the storefront db (status = the billing's claim, payments = the evidence): controls flagged two break classes in the consumer book, and close wants both quantified in ONE pass — the void billing that still drew a settlement, and the paid-status billing with no rail hit anywhere. Probed facts: the book holds **28 billings**; the void-but-settled billing is **925.00**; the paid-no-rail billing is **1756.00**. The memo's rule: *state is a claim, evidence is a receipt row — count the pair, not the claim.*",
      ask: "Return one row: billings on the book, void-but-settled dollars (2dp), paid-no-rail billing count, paid-no-rail dollars (2dp).",
      template:
        "SELECT COUNT(DISTINCT i.id) AS billings,\n       ROUND(SUM(i.amount_cents) FILTER (WHERE i.{1} = 'void' AND p.id IS NOT NULL) / 100.0, 2) AS void_but_settled,\n       COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'paid' AND p.id IS {2}) AS paid_no_rail,\n       ROUND(SUM(i.amount_cents) FILTER (WHERE i.status = 'paid' AND p.id IS NULL) / 100.0, 2) AS paid_no_rail_dollars\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.{3};",
      slots: [
        {
          answer: "status",
          kind: "keyword",
          label: "the state column",
          why: "The break arms pair i.status with receipt presence — status is the claim being tested. Filtering on any other column tests nothing: an id never equals 'void', and the arm collapses to NULL.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the no-evidence arm",
          why: "p.id IS NULL after a LEFT JOIN is the definition of 'no receipt row at all'. IS NOT NULL flips the arm to billings WITH evidence — 20 of them — and the paid-no-rail census counts the honest book instead of the break.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the join key (billing side)",
          why: "The join runs ON p.invoice_id = i.id — the settlement's foreign key to the billing's primary key. i.invoice_id doesn't exist, and matching on number or status pairs text against integers and empties the join, killing every arm at once.",
        },
      ],
      distractors: ["SUM", "open", "NOT NULL", "invoice_id", "number"],
      walkthrough:
        "A break census is a LEFT JOIN with two FILTER arms — state on the left, evidence on the right, in one pass. FROM invoices LEFT JOIN payments attaches each billing's receipt rows, keeping billings with none (the 1756.00 paid-no-rail row survives the join with all-NULL payment columns). The void arm: status = 'void' AND p.id IS NOT NULL — the claim says void, the evidence says a receipt cleared — folding to 925.00. The paid arm: status = 'paid' AND p.id IS NULL — the claim says settled, the evidence says no rail — counting 1 billing and folding to 1756.00. COUNT(DISTINCT i.id) keeps the census at billing grain, because split settlements would otherwise fan the fold. The distractors fail loudly: 'open' in the void arm re-aims it at the partial-payer (6148.00, a different anomaly), NOT NULL flips the no-evidence arm to the 20 settled billings, SUM in place of a column errors, invoice_id isn't a billing column, and number pairs text against integers and empties the join. The habit being graded: never count a claim without its evidence — the pair is the finding.",
    },
    {
      id: "cs-bofa-3",
      tier: "easy",
      topic: "t4",
      universe: "month-close",
      title: "The cycle trend the deck leads with",
      brief:
        "BofA-flavored memo on the storefront db (invoices = consumer billings in INTEGER cents): the monthly review opens on the statement-cycle trend — billed dollars per cycle, biggest cycles first, top of the page only. The controller's rule: *the trend is the billing book, not the settlement book — receipts never touch this line*. Probed facts: the book runs 13 cycles from 2024-02 to 2025-02; the peak is **2025-01 at 110.85** across 2 billings, with 2024-12 next at **88.30** on 3 and 2024-11 at 82.97 on 2. Note the honest wrinkle: 2024-01 has no billings at all — the cycle spine starts a month after the event book does.",
      ask: "Return the top-3 cycle board: cycle key, billing count, billed dollars (2dp), biggest billed first.",
      template:
        "SELECT STRFTIME('%Y-%m', i.{1}) AS cycle,\n       COUNT(*) AS billings,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed_dollars\nFROM invoices i\nGROUP BY {2}\nORDER BY billed_dollars {3}\nLIMIT {4};",
      slots: [
        {
          answer: "issued_on",
          kind: "keyword",
          label: "the billing date column",
          why: "The cycle key comes from the billing's issue date — when the consumer book sent the statement. due_on would bucket by the 30-day payment deadline, a different calendar that shifts every cycle one month late.",
        },
        {
          answer: "cycle",
          kind: "keyword",
          label: "the cycle grouping key",
          why: "GROUP BY cycle folds the book into the 13 statement cycles — the alias the SELECT just named. status would fold by state instead: 21 paid / 6 open / 1 void, a census worth having but not the trend this page exists for.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-billed-first direction",
          why: "DESC puts 2025-01's 110.85 at the top of the page where the review opens. ASC surfaces 2024-07's 38.93 — the quietest cycle — and buries the acceleration story the deck is telling.",
        },
        {
          answer: "3",
          kind: "number",
          noVerify: true,
          label: "the board depth",
          why: "The review reads a top-3 board — peak cycle, runner-up, third. A deeper cut drags in the 81.12 and 72.70 cycles nobody charts, and the page stops being a headline.",
        },
      ],
      distractors: ["due_on", "status", "ASC", "5"],
      walkthrough:
        "A trend page is a fold wearing a headline. STRFTIME('%Y-%m', i.issued_on) stamps each billing with its cycle key — text that GROUP BYs cleanly and sorts correctly across the 2024-02 to 2025-02 spine — and SUM(amount_cents) / 100.0, rounded once, reads cents into dollars. The fold lands on 13 cycles; the peak is 2025-01 at 110.85 on just 2 billings (a 55.43 average per billing), 2024-12 carries 88.30 on 3, 2024-11 carries 82.97 on 2 — count and dollars disagree about which cycle was 'biggest', which is exactly why the board ships both columns. The distractors each break a different wall: due_on re-keys the trend to the payment calendar and the peak becomes a different cycle; status folds by state and 664.43 / 196.09 / 9.25 replace the trend entirely; ASC opens on the quietest cycle; LIMIT 5 pads the headline with cycles the review never charts. The habit being graded: the trend is the billing book — issued, not settled, and the denominator is every billing in the cycle.",
    },
    {
      id: "cs-bofa-4",
      tier: "medium",
      topic: "s6",
      universe: "growth",
      title: "The tier ladder the card team segments on",
      brief:
        "BofA-flavored memo on the storefront db (orders = booked account/card events in REAL dollars, customers = account households): the card team segments the household base on a published ladder — {amber:flagship} over the 5000 lifetime line, {emerald:preferred} over 3000, everyone else core — and wants the census behind it, gated so no tier below two households survives to the slide. Probed facts: the 103 booked events carry **34833.28** across 16 households; the ladder reads **2 flagship households for 13902.91**, 2 preferred for 8218.79, and 12 core for 12711.58 — 39.9% of booked value sits in the top two households alone. The memo's rule: *the strictest band is tested first, or the ladder eats its own flagship.*",
      ask: "Return the tier census: tier label, household count, booked dollars (2dp), biggest booked first, tiers under 2 households dropped.",
      template:
        "SELECT CASE\n         WHEN lifetime_value >= {1} THEN '{2}'\n         WHEN lifetime_value >= 3000 THEN '{3}'\n         ELSE 'core'\n       END AS tier,\n       COUNT(*) AS households,\n       ROUND(SUM(lifetime_value), 2) AS booked_dollars\nFROM (\n  SELECT customer_id, SUM(total) AS lifetime_value\n  FROM orders\n  GROUP BY customer_id\n) lifetime\nGROUP BY tier\nHAVING COUNT(*) >= {4}\nORDER BY booked_dollars {5};",
      slots: [
        {
          answer: "5000",
          kind: "number",
          noVerify: true,
          label: "the flagship threshold",
          why: "5000 is the published flagship line — Alice Chen's 7262.35 and Emma Wilson's 6640.56 cross it. At 4000 Grace Kim's 4574.23 jumps tiers and the census becomes a different policy nobody published.",
        },
        {
          answer: "flagship",
          kind: "keyword",
          label: "the top-tier label",
          why: "The first WHEN owns the strictest band — 2 households, 13902.91. Label it 'preferred' and flagship disappears as a tier: four households merge into preferred for 22121.70 and the concentration headline dies.",
        },
        {
          answer: "preferred",
          kind: "keyword",
          label: "the middle-tier label",
          why: "The second WHEN catches 3000-to-5000 households — Grace Kim 4574.23 and Maya Patel 3644.56, 2 households for 8218.79. Label it 'flagship' and the same four merge the other way; either mislabel erases the band the card team prices against.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the keep-viable-tiers floor",
          why: "The floor sits at 2 so flagship (2) and preferred (2) survive the gate while proving the gate works — core's 12 clears it trivially. At 3 both two-household tiers drop and the census reports only core; at 13 core drops too and the page goes blank.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-booked-first direction",
          why: "DESC reads flagship's 13902.91 first — the concentration story opens the page. ASC opens on preferred's 8218.79 and buries the two-household tier the memo exists to defend.",
        },
      ],
      distractors: ["4000", "core", "flagship", "13", "ASC"],
      walkthrough:
        "A tier census is two folds wearing a ladder. The derived table folds 103 events to household grain — 16 rows of lifetime value — and the CASE ladder labels each: 5000 first (strictest band first, or 7262.35 lands in preferred), then 3000, else core. The outer fold counts and sums per tier: 2 flagship / 13902.91, 2 preferred / 8218.79, 12 core / 12711.58 — and the HAVING floor at 2 is doing real work, because a tier with one household is a person, not a segment. The cross-foot matters: 13902.91 + 8218.79 + 12711.58 = 34833.28, the booked total, so no household fell between bands. The distractors each break a different wall: 4000 promotes Grace Kim and the census reports a 3-household flagship nobody priced; relabeling either WHEN merges tiers and the 39.9% headline becomes 63.5% of a different question; a floor of 3 erases both small tiers; a floor of 13 empties the page; ASC buries the concentration story. The habit being graded: branch order is policy, and the ladder's edges are where the card team's money lives.",
    },
    {
      id: "cs-bofa-5",
      tier: "hard",
      topic: "j5",
      universe: "refund-audit",
      title: "The no-rail receivables sweep",
      brief:
        "BofA-flavored memo on the storefront db (invoices = consumer billings, payments = settlement receipts): collections works the receivables watch every morning — billings with NO settlement row anywhere, listed biggest first, at or above the {rose:1000.00 watch line}. The desk's rule: *membership is receipt evidence, not the status string — the paid-status billing with no rail is on this list, and it stays until a receipt explains it*. Probed facts: the anti-join returns **6 billings carrying 15217.00**; above the line sit **5 of them** — billing 24 at 4937.00, 26 at 3562.00, 27 at 2794.00, the paid-status break at 1756.00, and 21 at 1295.00 — while billing 18 (873.00) waits below the line.",
      ask: "Return the sweep: billing id, status, billed dollars (2dp) — no settlement row, at or above the 1000.00 watch line, biggest first.",
      template:
        "SELECT i.id AS billing,\n       i.{1} AS state,\n       ROUND(i.amount_cents / 100.0, 2) AS billed_dollars\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.{2}\nWHERE p.id IS {3} AND i.amount_cents >= {4}\nORDER BY billed_dollars {5};",
      slots: [
        {
          answer: "status",
          kind: "keyword",
          label: "the claim column",
          why: "i.status is the billing's claim — and the sweep ships it so the break is visible: five rows say open, one says paid with no rail anywhere. i.id as state just echoes the billing id and hides the claim entirely.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the join key (billing side)",
          why: "The anti-join keys receipts to billings: p.invoice_id = i.id. Join on amount_cents and every billing with no amount-shaped receipt goes unmatched — the sweep returns 26 rows including settled billings, and the watch drowns in noise.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the no-evidence test",
          why: "p.id IS NULL after the LEFT JOIN is the definition of 'no receipt row at all'. IS NOT NULL flips the sweep to the 22 billings WITH evidence — the covered book, the exact complement of what collections works.",
        },
        {
          answer: "100000",
          kind: "number",
          noVerify: true,
          label: "the watch line (cents)",
          why: "100000 cents is the 1000.00 watch line — 5 of the 6 no-rail billings clear it; billing 18 at 87300 cents waits below. At 150000 the 1295.00 row drops too; at 50000 the line stops being a triage tool.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "DESC works the list oldest-debt-equivalent first: 4937.00 leads. ASC opens on 1295.00 and the biggest exposure — the 4937.00 open billing — is the last row the desk reads.",
        },
      ],
      distractors: ["id", "amount_cents", "NOT NULL", "ASC", "150000", "50000"],
      walkthrough:
        "The receivables sweep is an anti-join wearing a policy line. LEFT JOIN payments ON p.invoice_id = i.id attaches each billing's receipt rows and keeps billings with none — the six honest no-rail rows survive with all-NULL payment columns — and p.id IS NULL is the membership test. The WHERE adds the 100000-cent watch line (a triage policy, stated in cents like the book), leaving 5 of 6: 4937.00, 3562.00, 2794.00, the 1756.00 paid-status break, 1295.00. The status column is the memo's point: five claims say open, one says PAID — and evidence, not the claim, put it on the list. Cross-foot check: the full six sum to 15217.00, the receivables watch the morning read quotes. The distractors each break a wall: id as state prints billing numbers where claims belong; amount_cents as the join key matches receipts to look-alike amounts and swells the sweep to 26 rows; NOT NULL returns the 22-settled covered book; ASC buries the biggest exposure; 150000 and 50000 each re-triage the line the desk didn't ask to move. The habit being graded: absence is evidence, the anti-join is its query, and the threshold is cents because the book is cents.",
    },
    {
      id: "cs-bofa-6",
      tier: "medium",
      topic: "t5",
      universe: "funnel",
      title: "The activity board that ships at 07:00",
      brief:
        "BofA-flavored memo on the storefront db (orders = booked account/card events, customers = account households): the household activity board ranks every account by booking frequency, and the desk signs it daily — ties SHARE a rung and the gap behind a tie is printed, not smoothed. Probed facts: the top of the board runs **Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13**, then a cliff to 5 — and a {violet:four-way tie at 4 events} (Isabella Rossi, Keiko Sato, Pedro Alvarez, Noah Meyer) that occupies ranks 6-6-6-6 before the next pair lands at rank 10. The board reads the top ten rows, and the cut lands mid-tie: *one rank-10 household makes the page, its count twin does not — and the footnote says so*.",
      ask: "Return the board: household, event count, RANK by count (biggest first) — top ten rows, ties sharing rungs, name as the printed tiebreak.",
      template:
        "SELECT c.name AS household,\n       COUNT(*) AS events,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS activity_rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.name\nORDER BY activity_rank, household\nLIMIT {3};",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie-sharing rung",
          why: "RANK gives the four 4-event households the same rung — 6, 6, 6, 6 — and skips to 10. ROW_NUMBER would publish a false order among count-twins, and DENSE_RANK would hide the gap the desk reads as 'how far behind'.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the most-active-first order",
          why: "The window must order COUNT(*) DESC or rank 1 lands on the quietest household. ASC turns the board upside down: Liam O'Brien's 1-event account leads and Alice Chen's 24-event book is last.",
        },
        {
          answer: "10",
          kind: "number",
          label: "the board depth (verified: rank 10 is on it)",
          why: "LIMIT 10 ships ranks 1 through 5, the 6-6-6-6 tie, and ONE rank-10 row (Farid Nasser) — Hiro Tanaka, his count twin, falls off mid-tie. That asymmetry is the footnote: the cut counts rows, not rungs, and rank 10 is genuinely on the board as a printed cell.",
        },
      ],
      distractors: ["ROW_NUMBER", "DENSE_RANK", "ASC", "5"],
      walkthrough:
        "The activity board is a window function wearing a tie policy. GROUP BY c.name folds 103 events to 16 households; COUNT(*) is the frequency; RANK() OVER (ORDER BY COUNT(*) DESC) stamps the rungs — 1, 2, 3, 4 for the 24/17/14/13 leaders, then 6, 6, 6, 6 for the four-way tie at 4 events, and the next count starts at 10 because four bodies sat on rank 6. The outer ORDER BY activity_rank, household prints ties in name order (Isabella, Keiko, Pedro, Noah) so reruns are reproducible, and LIMIT 10 cuts after nine-plus-one rows: ranks 1-5, the whole 6-6-6-6 tie, and Farid Nasser's rank 10 — Hiro Tanaka's twin row is the one the cut drops, which is why the board footnote says the cut landed mid-tie. The distractors each break a wall: ROW_NUMBER hands the four-way tie arbitrary rungs 6-7-8-9 and invents an order nobody defended (Pedro Alvarez sits at rank 6; the printed set shifts); DENSE_RANK prints 7 where the gap belongs, telling the desk one household sits behind the tie when two do; ASC leads the board with 1-event accounts; LIMIT 5 slices the book before the tie. The habit being graded: ties are a published policy — RANK, a named tiebreak, and a footnote on the cut.",
    },
  ],

  problems: [
    { slug: "funnel-step-conversion", why: "The apply→open→fund stage pivot in FIRST_VALUE form — BofA's flagship funnel read, and this kit's account-opening muscle in textbook shape." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Started-but-never-funded, via LEFT JOIN + IS NULL: the demand-leak anti-join the acquisition desk runs weekly — with the warning that on this db every household transacted." },
    { slug: "email-engagement-funnel", why: "Offers→clicks→accounts with per-stage denominators: the cross-sell campaign read, where each stage's base is defined separately or the rates lie." },
    { slug: "monthly-transactions-i", why: "Billings filtered into a period and folded: the statement-cycle slice — a date-window read the close runs before any trend is quoted." },
    { slug: "number-of-rich-customers", why: "Distinct households over a balance line: the concentration screen — 63.5% of booked value sits above the 3000 line, and this is the drill that counts the names." },
    { slug: "maximum-transaction-each-day", why: "Peak settlement per day via a window fold: the rail-capacity read — the card feed's worst hour is a capacity conversation, not a curiosity." },
    { slug: "calculate-parking-fees-and-duration", why: "Tiered, duration-based fee schedules in SQL: the overdraft-band drill — the schedule's boundaries are exactly where the fee disputes live." },
    { slug: "calculate-product-final-price", why: "Best-rule pricing across overlapping discounts: the fee-waiver engine in miniature — which rule wins when two apply is a business decision the query must encode." },
    { slug: "delinquency-buckets", why: "DPD-style aging buckets: the receivables watch (6 billings / 15217.00) bucketed by days past flat 30-day terms — the NPL ladder in textbook form." },
    { slug: "immediate-food-delivery-ii", why: "Share of orders meeting a promise flag: the funded-over-booked analog — a conditional fold whose denominator is ALL events, not the convenient subset." },
    { slug: "immediate-food-delivery-i", why: "The same promise-share read at one grain: the warm-up for statement-state folds where 'promised vs actual' maps to billed vs settled." },
    { slug: "calculate-orders-within-each-interval", why: "CASE buckets over a numeric range in one pass: the settlement-lag buckets (13 / 28.4 / 84 days) printed as a single census." },
    { slug: "customer-purchasing-behavior-analysis", why: "Spend-tier classification over lifetime folds: the household-band read — which tier a household lands in decides the card offer, so the boundary operator matters." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Frequency leader per group: the most-active-household board — 24 events on the busiest book, and ties are handled by policy, not luck." },
    { slug: "spend-histogram", why: "Bucket the book by spend bands: the deposit-and-spend distribution the card team segments on — one CASE ladder, every household placed." },
    { slug: "rank-scores", why: "Score ladders where ties share rungs: RANK versus ROW_NUMBER as a tie policy — the card-portfolio board problem in textbook form." },
    { slug: "bank-account-summary", why: "Per-account money-in, money-out, ending balance in one fold: the deposit-account rollup the branch P&L opens with — three aggregates, one GROUP BY, every account placed." },
    { slug: "monthly-transactions-ii", why: "Spending history per account with a running cumulative column: the statement-view query — month keys plus window motion, exactly how a consumer statement reads." },
    { slug: "customer-order-frequency", why: "Households banded by booking frequency over a window: the engagement-tier read the card team segments on — count first, band second, denominator stated." },
    { slug: "ar-aging-schedule", why: "Receivables bucketed by days outstanding: the collections ladder for the 15217.00 no-rail book — current, 30-plus, 60-plus, and the buckets are definitions, not queries." },
    { slug: "trial-balance-check", why: "Debits equal credits or the page doesn't ship: the 181080.00-against-181080.00 delta-0 proof as a reusable query shape — the bank's first read every morning." },
    { slug: "gl-reconciliation", why: "Book of record versus feed, exception rows surfaced: the break hunt that pairs status claims with rail evidence — 925.00 void-but-settled is this drill's poster child." },
    { slug: "daily-balance-interest", why: "Interest accrued off daily balances: the end-of-day balance walk behind every deposit-product yield read — running sums with the frame written explicitly." },
    { slug: "capital-gain-loss", why: "Realized gain per disposal, proceeds against cost: the investment side of the household book — lots in, proceeds out, the math every BofA brokerage statement hides." },
    { slug: "suspicious-bank-account-transactions", why: "Pattern flags over account motion: the fraud desk's first-pass screen — thresholds, transfers-in-then-out shapes, and the discipline to flag, never to accuse." },
    { slug: "transaction-velocity", why: "Hits per account per window: the velocity monitor that trips when cadence breaks — a COUNT with a time gate, and the alert threshold is a business line." },
    { slug: "chargeback-rate-ranking", why: "Dispute rate ranked by segment: the card-loss read the rail census feeds — a ratio whose numerator and denominator are different populations, ranked with honest ties." },
    { slug: "top-percentile-fraud", why: "Score screens above a percentile line: which accounts sit in the alert band — NTILE and window ranks over risk scores, the fraud triage shape." },
    { slug: "settlement-fails-aging", why: "Fails aged by days outstanding, oldest first: the wire desk's break queue — julianday arithmetic plus a triage line, the same shape as the receivables sweep." },
    { slug: "structuring-detection", why: "Amounts clustered Just Under the reporting line: the AML structuring screen — band edges, counts per edge, and why the boundary operator is the whole query." },
    { slug: "balance-rollforward", why: "Beginning balance plus activity equals ending: the rollforward proof behind every reconciliation sign-off — three folds cross-footed, or the close reopens." },
    { slug: "prepayment-detection", why: "Payoffs landing ahead of schedule: the prepayment read on the loan book, cohort by cohort — early payoff is a revenue event the treasury desk prices." },
  ],
};
