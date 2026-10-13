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
  ],

  dayInLife: [
    "**08:10 —** the day opens on the books, not the news. First query proves the ledger — **181080.00 debits against 181080.00 credits, delta 0**, or the morning is a page — then the rail census: **card 16 / 37364.00, wire 11 / 32248.00**, cross-footed to the cash book's 69612.00 debit fold. The break list classifies in the same pass: the void-but-settled **925.00**, the paid-status billing with no rail at **1756.00**. A proof that fails is the whole morning; nothing ships until it ties.",
    "**11:00 —** deep work: the fee-and-coverage read. Every billing classified by rail coverage — 21 exact (**65612.00**), 1 partial at 4000.00 of **6148.00**, 6 with no hit (**15217.00**) — and the fee memos that reversed after settlement isolated by pairing status with receipt presence. The instinct being trained: {emerald:coverage} is a join state, not a status string — the 4000.00-partial is open AND settled, and both facts belong on the card.",
    "**14:30 —** branch ops review: cost lines against plan — Rent at 14 entries / **16800.00** (the branch leases), Ads at 14 / **4570.00** (acquisition marketing), Travel and Tools trailing — and the household board by market, where the US basket runs **383.48** a booking against APAC's 313.66. The market lead wants the funnel with its denominator on the slide: {emerald:funded} over ALL booked events, never a filtered fairy tale.",
    "**17:30 —** EOD writeup: the census ships with definitions attached — what counts as settled, who stays in the base — and tomorrow's ask is queued for the data-quality board: split settlements landing as two rail hits on one billing, waiting on a `ROW_NUMBER` dedupe. *The read goes out; the denominators and the cents rule travel with it.*",
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
  ],

  topics: [
    {
      name: "Account-opening funnel",
      why: "BofA's consumer story is a funnel: application, opened, funded, active — and every stage leaks. Conversion reads are stage pivots with honest per-stage denominators, plus the anti-join for households that started and never funded.",
      slugs: ["funnel-step-conversion", "customer-who-visited-but-did-not-transact", "email-engagement-funnel"],
    },
    {
      name: "Card-vs-wire rail folds",
      why: "The rail census is a daily GROUP BY: settlements and dollars per rail, cross-footed to the cash book. Method-mix folds, threshold counts and per-day maxima are the muscle this census drills.",
      slugs: ["monthly-transactions-i", "number-of-rich-customers", "maximum-transaction-each-day"],
    },
    {
      name: "Overdraft & fee math",
      why: "Fee logic is band logic: which billing crossed which line, what the schedule charges, and how the exposure buckets by days past due. CEIL-style schedules, best-rule pricing and DPD buckets are exactly the drills.",
      slugs: ["calculate-parking-fees-and-duration", "calculate-product-final-price", "delinquency-buckets"],
    },
    {
      name: "Statement-state folds",
      why: "Billings live in states — paid, open, void — and consumer reads must count them separately without letting any state leak out of the denominator. Conditional aggregation over status is the daily fold.",
      slugs: ["immediate-food-delivery-ii", "immediate-food-delivery-i", "calculate-orders-within-each-interval"],
    },
    {
      name: "Household rollups & concentration",
      why: "A household is a tenure and a balance, not a row: lifetime folds per household, frequency leaders, and spend-band histograms decide where the card team spends its quarter.",
      slugs: ["customer-purchasing-behavior-analysis", "customer-placing-the-largest-number-of-orders", "spend-histogram"],
    },
    {
      name: "Card-portfolio boards",
      why: "Household boards and 'most recent three events' surfaces are window functions over folded groups. Ties are real — two households at two billings share a rung — so RANK versus ROW_NUMBER is a policy, not syntax.",
      slugs: ["rank-scores", "the-most-recent-three-orders", "second-most-recent-activity"],
    },
    {
      name: "Statement-cycle buckets",
      why: "Statement cycles run monthly and the monthly trend is the deck's spine: bookings, value and reversals per cycle key, plus the weekday cadence the branch network staffs against.",
      slugs: ["unique-orders-and-customers-per-month", "list-the-products-ordered-in-a-period", "sales-by-day-of-the-week"],
    },
    {
      name: "Break feeds & duplicate rails",
      why: "Rails double-hit and feeds re-log: duplicate-charge pairs, keep-latest dedupes and null audits are the data-quality drills this bank grades hardest — a bad rail row becomes a bad cash number.",
      slugs: ["duplicate-charge-pairs", "keep-latest-dedupe", "null-blank-audit"],
    },
    {
      name: "Running balances & accruals",
      why: "Balances walk: running sums over ledger motion, cumulative folds by segment, and elevator-style capacity sums are the accrual math behind every deposit-product read.",
      slugs: ["account-balance", "running-total-for-different-genders", "last-person-to-fit-in-the-elevator"],
    },
    {
      name: "NULL discipline at the teller line",
      why: "An unsettlement is a business state, not dirty data: COUNT(column) versus COUNT(*), NULL-safe filters and missing-information joins are the honesty drills — mishandled NULLs fabricate settled accounts.",
      slugs: ["find-customer-referee", "books-with-null-ratings", "employees-with-missing-information"],
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
  ],
};
