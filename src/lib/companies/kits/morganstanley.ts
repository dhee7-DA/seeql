// Morgan Stanley — kit 10 of the Banking & Capital Markets domain (Batch J, wave 6).
// Wealth management and institutional markets: the advisor-book read, where
// the same firm bills client households for advisory relationships, carries
// the fee receivable, and settles on retail or institutional rails. The
// storefront db maps on honestly: invoices are client fee billings (advisory
// and management-fee invoices — the receivables the wealth book carries),
// payments are the fee receipts on two rails (method card / wire — card is
// the retail brokerage debit rail, wire the institutional wire rail),
// ledger_entries is the double-entry book of record, expenses are platform
// and branch cost lines, customers are client households across four booking
// markets, orders are booked flows (REAL dollars — the one table where money
// is already dollars). Money in invoices/payments/expenses/ledger is INTEGER
// cents — the dollar read is always amount_cents / 100.0.
// Pool provenance: Morgan Stanley has 0 tagged sql rows in the band (checked
// company-pools.md for morganstanley / Morgan Stanley variants) — 0 tagged LC
// — theme-curated: every topic and problem slug is curated from the theme
// menu to MS's known question families (book rollups, fee schedules, as-of
// reads, concentration, risk dispersion), provenance stated per problem.
// Case figures: scripts/company-facts.md (probed 2026-10-12).

import type { CompanyKit } from "../types";

export const morganstanleyKit: CompanyKit = {
  id: "morganstanley",
  domainId: "banking",
  name: "Morgan Stanley",
  tagline: "Wealth management and institutional markets",
  accent: "text-slate-400",

  brief: [
    "**Morgan Stanley** is the wealth machine: an advisor force that bills client households for relationships, an institutional arm that moves institutional flows, and a platform that has to prove both, daily. On this training db the mapping is honest: `orders` are booked flows (REAL dollars — the one table where money is already dollars), customers are client households across four booking markets, and every fee the wealth book bills — advisory, management, planning — lands as a receivable. Probed scale: **103 booked flows worth 34833.28**, and the busiest household alone carries **24 flows for 7262.35** — with spenders over the 3000 line holding 63.5% of all booked value. *A book this concentrated is read one household at a time, and the SQL is how it's read.*",
    "The money tables are the desk's spine. `invoices` are the client fee billings — 28 on the book, of which 21 settled exact for 66443.00, 6 sit open at 19609.00, and 1 went void at 925.00. `payments` are the fee receipts on two rails — card, the retail brokerage debit rail (16 receipts for 37364.00), and wire, the institutional rail (11 for 32248.00) — and `ledger_entries` is the double-entry book where every settled dollar posts twice, integer cents, dollar read always cents / 100.0. The daily proof: **181080.00 debits against 181080.00 credits across 80 entries, delta 0** — and the fee-receivable watch carries **6 billings / 15217.00** against flat 30-day terms.",
    "The SQL screens are book-rollup screens. A warm-up fold (fee billings per household, receipts per rail), then the two questions this firm is famous for: the {sky:advisor-book board} — households ranked by billing frequency within booking market, lifetime billed beside, ties shared on purpose — and the {rose:fee-receivable watch} — a LEFT-join anti-join where the interesting rows are the billings with no receipt at all, plus the pair-read that catches a void billing which still drew its **925.00**. Follow-ups probe the denominator ('booked flows or billed fees?') and the tie policy ('who shares rung 3, and says who?').",
    "Prep the way the screens run. Drill per-household folds and the window grammar that ranks them (`PARTITION BY` the market, ties shared on purpose), as-of reads for the fee schedule in force at billing time, month buckets via `SUBSTR(issued_on, 1, 7)` across the 2024-01 to 2025-02 window, and settlement-lag math — the book's settled billings average **28.4 days** to first receipt against fastest 13 and slowest 84. Then practice the sentence that gets hired: *the book is billed, the book is received, and those are two different numbers until the rail proves otherwise.*",
    "**The economics under the book.** Morgan Stanley's wealth engine bills relationships, not transactions, and the db's four booking markets carry it: EU leads with 45 booked flows for 15089.23, APAC follows at 37 / 11605.45, US runs 19 / 7286.16, LATAM trails at 2 / 852.44. The cost base reads like a branch network — {orange:Rent} at 14 entries / 16800.00 dwarfs Ads (14 / 4570.00), Travel (3 / 2521.00) and Tools (5 / 1525.00) — so platform scale, not headcount heroics, is what the expense fold proves. The book's shape is the risk story: spenders over the 3000 line hold **63.5%** of booked value, the busiest household runs **24 flows / 7262.35**, and every fee billed waits out flat 30-day terms before the 28.4-day average settlement actually lands. *Margin at this firm is a timing question as much as a volume one.*",
    "**Prep the way the screens layer.** Week one: folds — per-household billing folds, per-rail receipt folds, the coverage census (21 exact / 65612.00, 1 partial, 6 none / 15217.00) until `GROUP BY` + `HAVING` is reflex. Week two: windows — `PARTITION BY` market boards, {violet:RANK-with-ties} as a signed policy, LAG walks over the probed 2024-02 to 2025-02 billing months. Week three: as-of joins and anti-joins — the schedule in force at billing time, the 6-billing watch, the void-but-received **925.00**. Week four: say it out loud — the ledger's **181080.00 against 181080.00, delta 0** proof closes interviews — *claims bill, receipts settle, and the books prove both.*",
  ],

  dayInLife: [
    "**08:00 —** the books before the markets. First query proves the ledger — **181080.00 debits against 181080.00 credits, delta 0** across 80 entries — then the receipt census: **card 16 / 37364.00, wire 11 / 32248.00**, cross-footed to the cash book's 69612.00 debit fold. The break list pairs state with evidence: a void billing that drew **925.00**, a paid-status billing with no receipt at **1756.00**. Advisors call at 08:15; the books have to be provable before they do.",
    "**10:30 —** deep work: the advisor-book board. Households folded to lifetime billed, ranked by billing frequency {emerald:within booking market} — a `PARTITION BY region` board where two households at two billings share rung 3 by design, and the tiebreak column is the one the advisor will defend. Beside it, the concentration read: the 3000-plus tier holding **63.5%** of booked value. The instinct being trained: rank the relationships, not the noise.",
    "**13:30 —** the collections sit-down: the fee-receivable watch — **6 billings / 15217.00** — aged against flat 30-day terms (min 30, max 30; the terms are a definition, not a distribution), with settlement lag beside it: 20 settled billings, **28.4 days** average, fastest 13, slowest 84. The watch's awkward member gets named out loud: a paid-status billing with no receipt row is in the list, and the void-but-received **925.00** is not — *membership is evidence, not status.*",
    "**16:30 —** stakeholder cycle: the platform review — cost lines against plan, Rent at 14 entries / **16800.00**, Ads at 14 / **4570.00** — then the EOD writeup, where every board ships with its definitions attached: what counts as billed, who stays in the base, which rung ties share. Tomorrow's ask is queued: an as-of join so the fee schedule in force at billing time, not today's, prices the dispute. *The read goes out; the denominators travel with it.*",
    "**21:40 —** the night proof. The day's posts are in and the ledger gets re-proved before the batch window closes: **181080.00 debits against 181080.00 credits, delta 0** across 80 entries, receipt census still 27 rows — card 16 / 37364.00, wire 11 / 32248.00 — and the cash book's 69612.00 debit fold still cross-foots to the penny. Then the surveillance sweep queues tomorrow's work: a `HAVING`-guarded scan for billings whose receipt pattern reads wrong, the 4000.00-of-6148.00 partial flagged for the morning advisor call, *and the watch list already sitting in the collections lead's inbox before the markets open.*",
  ],

  metrics: [
    { name: "Billed fee book", what: "Client fee billings and their state mix — 28 on the book, 21 settled exact for 66443.00. The top line every advisor conversation starts from." },
    { name: "Fee-receivable watch", what: "Billings with no receipt row at all — 6 carrying 15217.00, aged against flat 30-day terms. The list the collections sit-down works, membership by evidence not status." },
    { name: "Billing-state mix", what: "Open 6 / 19609.00, paid 21 / 66443.00, void 1 / 925.00. States are claims; the mix is read beside the receipt census before anyone believes either." },
    { name: "Rail mix", what: "Fee receipts per rail — card 16 / 37364.00 (retail debit), wire 11 / 32248.00 (institutional). The pair cross-foots to the cash book's 69612.00 debit fold." },
    { name: "Books proof delta", what: "Total debits minus total credits across the ledger — 181080.00 against 181080.00, delta 0 across 80 entries. A nonzero delta pages someone." },
    { name: "Coverage census", what: "Billings by settlement coverage — 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 none (15217.00). The partial is the interesting row: open AND received." },
    { name: "Settlement lag", what: "Days from billing to first receipt on settled billings — 20 billings, 28.4 days average, fastest 13, slowest 84. The tempo read behind every collections promise." },
    { name: "Book concentration", what: "Share of booked value from households over a lifetime line — 63.5% from the 3000-plus tier, top household 24 flows for 7262.35. Tells the desk how thin the book's base is." },
    { name: "Split-receipt census", what: "27 receipt rows over 22 receiving billings — five split-plan billings (refs 1, 5, 12, 19, 22) carry two receipt rows each. The fan-out that makes a naive COUNT(*) print 33 settled billings on a 28-billing book." },
    { name: "Void-but-received exposure", what: "One void billing drew a receipt: 925.00 against a cancelled claim. Detected only by pairing state with evidence — the status column alone hides the hit." },
    { name: "Paid-claim gap", what: "Billing 28 sits in paid status with zero receipt rows — 1756.00 of claim without evidence. The paid-status census overstates the collected book by exactly this." },
    { name: "Rail-to-cash cross-foot", what: "Card 37364.00 + wire 32248.00 = 69612.00, tying to the cash account's debit fold (net 44196.00). When the rails stop footinging to cash, the desk stops guessing and starts paging." },
  ],

  topics: [
    {
      name: "Household book rollups",
      why: "The advisor book IS a rollup: lifetime billed per household, receipts beside each name, and a LEFT JOIN that keeps households honest when a billing has no receipt. Bonus-style left joins and top-by-value boards are the core drills.",
      slugs: ["employee-bonus", "top-travellers", "bank-account-summary-ii", "combine-two-tables", "sales-person"],
    },
    {
      name: "Fee-billing states",
      why: "Billings live in states — paid, open, void — and the desk counts them separately without letting any state leak out of the denominator. CASE classification and HAVING-gated frequency folds are the daily shape.",
      slugs: ["weather-type-in-each-country", "customer-order-frequency", "immediate-food-delivery-iii", "managers-with-at-least-5-direct-reports"],
    },
    {
      name: "Book concentration & shares",
      why: "A wealth book is read as weights: each household's share of billed value, the concentration index, and how much sits above a lifetime line — 63.5% over 3000 here. Share-of-partition windows are the exact muscle.",
      slugs: ["portfolio-weights", "portfolio-concentration-hhi", "percentage-of-users-attended-a-contest", "find-the-team-size"],
    },
    {
      name: "AUM-movement windows",
      why: "Flows and balances are read through windows: peak activity per day, second-largest relationships, top earners by value — ranking and argmax boards the desk reviews every morning.",
      slugs: ["maximum-transaction-each-day", "second-highest-salary", "top-earners", "rank-scores", "project-employees-iii", "department-highest-salary"],
    },
    {
      name: "Fee schedules & tiers",
      why: "Advisory fees are tiered, and the tier a household lands in decides the invoice: CASE ladders over folded value, spend-band classification, and risk-based band joins where the boundary operator is the dispute.",
      slugs: ["the-category-of-each-member-in-the-store", "customer-purchasing-behavior-analysis", "risk-based-pricing", "customers-who-never-order", "count-salary-categories"],
    },
    {
      name: "As-of & point-in-time reads",
      why: "Fee disputes are settled with the schedule that WAS in force at billing time, not today's — as-of price logic, point-in-time joins and latest-rate lookups are exactly how the desk proves it.",
      slugs: ["product-price-at-a-given-date", "point-in-time-asof", "fx-exposure-report", "confirmation-rate", "the-latest-login-in-2020"],
    },
    {
      name: "Net flows & running cash",
      why: "Money moves daily and the book is a walk: running balances, movement waterfalls (new, redeemed, net) and year-on-year growth rates over the flow calendar are the accumulation-read drills.",
      slugs: ["daily-balance-interest", "mrr-waterfall", "year-on-year-growth-rate"],
    },
    {
      name: "Fee-collection hygiene",
      why: "The receivable is worked, not assumed: AR aging schedules, ledger-versus-receipt reconciliation and settlement-fails aging are the collection drills — 6 billings / 15217.00 is the watch this kit keeps returning to.",
      slugs: ["ar-aging-schedule", "gl-reconciliation", "settlement-fails-aging"],
    },
    {
      name: "Risk & dispersion reads",
      why: "Institutional markets asks the dispersion questions: value-at-risk cuts, Sharpe-style ratios over return series, beta versus benchmark — portfolio-statistics SQL the wealth platform surfaces next to every board.",
      slugs: ["value-at-risk", "sharpe-ratio", "beta-benchmark"],
    },
    {
      name: "Audit trails & NULL policy",
      why: "The books of record are evidence: journal-gap detection (no missing entries, ever), balance rollforwards and snapshot-delta reads keep the ledger provable — and NULL handling decides what 'no receipt' honestly means.",
      slugs: ["journal-gap-detection", "balance-rollforward", "snapshot-delta-detect"],
    },
    {
      name: "Settlement rails & latency",
      why: "Two rails, two tempos: card is the retail debit rail (16 receipts / 37364.00), wire the institutional rail (11 / 32248.00), and settlement lag runs 13 to 84 days around a 28.4-day average. Date-math drills — day-over-day joins, two-events-in-a-window, golden-hour buckets — are exactly the latency muscle.",
      slugs: ["rising-temperature", "users-with-two-purchases-within-seven-days", "find-golden-hour-customers", "restaurant-growth"],
    },
    {
      name: "Split receipts & duplicate evidence",
      why: "Five split-plan billings fan 27 receipt rows over 22 receiving relationships — the join grain that makes counts lie. Duplicate-pair drills (same-billing receipt pairs, repeated claims, symmetric matches) train the eye that catches double counting before the deck ships it.",
      slugs: ["duplicate-charge-pairs", "duplicate-emails", "symmetric-pairs", "monthly-transactions-i"],
    },
    {
      name: "Household tiers & percentiles",
      why: "Fee schedules segment the book: which quartile a household's lifetime billed lands in decides the invoice and the call order. NTILE buckets, PERCENT_RANK ladders and spend histograms are the segmentation drills the platform review quotes.",
      slugs: ["rfm-segmentation", "usage-tier-percentiles", "spend-histogram", "average-salary-of-departments", "nth-highest-salary"],
    },
    {
      name: "Surveillance & anomaly screens",
      why: "Institutional markets runs surveillance next to every board: amount z-scores over receipt series, HAVING-guarded structuring screens, pair-window wash checks. The desk's question is always the same — which rows pattern wrong, and by how much in dollars.",
      slugs: ["amount-anomaly-zscore", "structuring-detection", "wash-trade-detection", "capital-gain-loss"],
    },
    {
      name: "Credit & provision reads",
      why: "The wealth book has a credit side: expected-credit-loss weighted provisions, delinquency bucket pivots and vintage default curves are how lending-adjacent balances are provisioned — the same evidence-over-status discipline the receivable watch teaches.",
      slugs: ["expected-credit-loss", "delinquency-buckets", "vintage-default-curves"],
    },
  ],

  theory: [
    {
      id: "ms-t1",
      q: "The advisor asks for billed fees per household, and your join of billings to receipts returns 33 rows for a 28-billing book. What's the grain problem and the fix?",
      a: "The join changed grain: five billings settled on the split plan carry two receipt rows each, so billings joined to receipts print 33 rows and every fold on that result counts receipts, not billings. The fix is to declare the grain first — per household, per billing — and fold accordingly: either aggregate receipts to billing level in a derived table before joining up, or protect the count with COUNT(DISTINCT i.id). On Morgan Stanley screens this is the opening trap: the advisor wants relationship-level truth, and a fold at receipt grain quietly reports 33 settled billings where only 26 billing relationships ever received a dollar.",
      tag: "joins",
    },
    {
      id: "ms-t2",
      q: "Two households in the same market both show two billings. Build the book board so the tie is visible and defensible — which window function, and why?",
      a: "RANK with an explicit ORDER BY: tied frequencies share a rung and the next rank skips, so the board shows two households at rung 3 and the next at rung 5 — the tie is visible, which is the point. ROW_NUMBER would hand one of them rung 3 by plan order and look authoritative while being arbitrary; DENSE_RANK numbers rungs consecutively when the desk wants 'third-highest frequency tier' instead of 'third place'. I PARTITION BY booking market so each market's board is independent, and the tiebreak inside the window is lifetime billed — a column someone can defend on a call. On this book the tie policy is a business decision: the advisor emails 'everyone at rung 3', so RANK it is.",
      tag: "windows",
    },
    {
      id: "ms-t3",
      q: "How would you compute the coverage census — exact, partial, no receipt — so it survives the collections sit-down?",
      a: "As a per-billing fold, not a status read. LEFT JOIN billings to receipts, GROUP BY the billing, classify: no receipt row is the no-rail arm, SUM(receipts) < billed is the partial arm, else exact — then fold the classes for the board. The follow-ups are where candidates die: why isn't 'open' the unpaid book? Because open carries 19609.00 over 6 billings while the no-receipt watch carries 15217.00 over 6 — one open billing took a 4000.00 partial against 6148.00, and one paid-status billing has no receipt at all. I quote the actuals — 21 exact / 65612.00, 1 partial, 6 none / 15217.00 — and say the definition: coverage is evidence across two tables, never a status string.",
      tag: "aggregation",
    },
    {
      id: "ms-t4",
      q: "A junior says the fee-receivable watch is just 'status = open'. Both count six — where does that break?",
      a: "At membership. The open-status census carries 19609.00; the no-receipt anti-join carries 15217.00 — and the 4392.00 gap is exactly two honest anomalies: the open billing with a 4000.00 partial receipt (it HAS evidence, so it drops out of the watch) and the paid-status billing at 1756.00 with no receipt row (it HAS a claim, so it rides in). The lesson generalizes: IS NULL on the LEFT JOIN's right-side key is the definition of 'never received', and a status column is a claim about the world, not the world. I name both lists out loud — open-not-necessarily-unreceived, unreceived-not-necessarily-open — before choosing which one the ask means.",
      tag: "nulls",
    },
    {
      id: "ms-t5",
      q: "Walk me through SQL's logical evaluation order and where it bites on a book-rollup query.",
      a: "FROM and JOIN build rows, WHERE filters rows, GROUP BY folds them, HAVING filters groups, SELECT projects (windows compute here, after HAVING), ORDER BY and LIMIT run last. The bites: the household-count gate is HAVING because the fold doesn't exist at WHERE time; window functions see post-HAVING rows, so a HAVING gate changes both the ranks and any COUNT(*) OVER () book-size column; and SELECT-born aliases are usable in ORDER BY but not WHERE. On the book board I keep the market filter in WHERE, the minimum-billings gate in HAVING, and I say the split out loud — the interviewer is checking whether pipeline order is a mental model or a recited list.",
      tag: "pipeline",
    },
    {
      id: "ms-t6",
      q: "Fee review wants every billing larger than the book's average billing. Scalar subquery, window, or CTE — and how do you choose?",
      a: "By how much definition the benchmark carries. A scalar subquery — WHERE amount_cents > (SELECT AVG(amount_cents) FROM invoices) — is the smallest correct form for a single book-wide line. AVG() OVER () prints the same benchmark while keeping every billing visible, which is better when the review also wants each billing's premium versus the mean. A CTE earns its keep the moment the benchmark gets a definition — 'average over open-and-paid billings, void excluded, per booking market' — because a named, commented fold is auditable and a nested one-liner isn't. Wealth benchmarks always grow definitions mid-review, so I stage the CTE earlier here than fashion suggests.",
      tag: "subqueries",
    },
    {
      id: "ms-t7",
      q: "The desk wants billing volume by month and settlement lag per billing. How do you handle dates in SQLite for both?",
      a: "Two tools. Monthly volume buckets with SUBSTR(issued_on, 1, 7) — a '2025-01' style key that GROUP BY folds cleanly across the 2024-01 to 2025-02 window and sorts correctly as text. Lag needs instant arithmetic: julianday(first receipt) - julianday(issued_on) per billing, folded once and rounded at the edge — the book's settled billings run 28.4 days average, fastest 13, slowest 84, against terms that are flat 30. The traps I name: julianday over a missing receipt NULLs the lag (that's the definition — the no-receipt watch has no lag, not a zero one), and a '30-day terms' claim is a definition check — min and max terms both print 30 here, which is why the lag spread of 13 to 84 is a behavior story, not a terms story.",
      tag: "dates",
    },
    {
      id: "ms-t8",
      q: "Controls flagged a void billing that still received 925.00 and a paid billing with no receipt. What's your policy for breaks like these?",
      a: "Detect, quantify, route — evidence over claims, always. Detect by pairing state with receipt presence: void AND a receipt exists (925.00), paid AND no receipt (1756.00) — a one-pass census with FILTER (WHERE …) counts both arms on the same join so nobody reruns five queries at close. Quantify in dollars; adjectives don't route work. Route to the desk that owns the fix; never delete, never silently re-status. Then reconcile to the books of record — the ledger still proves 181080.00 against 181080.00, delta 0, because double-entry records what happened, and the journal sequence proves nothing was edited out. That's exactly why the trial balance alone is never sufficient evidence of correctness.",
      tag: "quality",
    },
    {
      id: "ms-t9",
      q: "The platform review wants a rolling three-month receipt census. How do window frames change the answer, and which frame do you ship?",
      a: "Explicitly. The moment a window has an ORDER BY, SQL applies a default frame — RANGE UNBOUNDED PRECEDING TO CURRENT ROW — which for our receipt rails means 'every receipt from the start of time up to my peer group', a running total, not a three-month window. To get the rolling census the review asked for I write the frame out loud: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW over month-bucketed receipt folds, cross-footing card and wire to the 69612.00 the cash book expects. The distinction bites on ties: RANGE includes peer rows with equal ORDER BY values, ROWS counts physical rows, and on a book where several billings share a month bucket that difference changes the census. I name the frame in the walkthrough so the next analyst doesn't inherit a running sum that looks like a rolling one.",
      tag: "frames",
    },
    {
      id: "ms-t10",
      q: "For the month-over-month billing walk, why LAG instead of a self-join on the previous month?",
      a: "Because the walk is one fold, not two. LAG(SUM(amount_cents)) OVER (ORDER BY month) computes the previous month inside the same pass over the monthly CTE — one scan, one sort, and the first row honestly prints NULL because it has no prior. A self-join of the monthly fold to itself on month = month - 1 doubles the scan, needs calendar arithmetic to build the join key (and 'previous month' is a definition, not an increment, across year boundaries), and still drops the first month via the inner join or fakes it with a LEFT JOIN plus COALESCE — a zero that invents a base month. On this book the walk runs 13 billing months, 2024-02 through 2025-02, peaking at 11085.00 in 2025-01 (+2255.00 MoM) before falling 2973.00 into February. NULL at the head of that walk is the definition; a self-join makes you argue it into existence.",
      tag: "windows",
    },
    {
      id: "ms-t11",
      q: "You stack a card-rail report and a wire-rail report with UNION. The row count drops. What happened?",
      a: "UNION deduplicates; UNION ALL appends. The rail stack's arms are folded per billing month — if card and wire ever print the same month with the same dollar fold, UNION silently collapses them into one row and the desk's receipts stop footinging to the 69612.00 cash fold. UNION ALL is the honest append: every arm's rows survive, arm labels included, and the total cross-foots. I reach for bare UNION only when the requirement literally says 'distinct rows across both arms' — and even then I say out loud what dedupe means here: identical month-plus-dollars rows are usually different receipts that happen to agree, not duplicates to be cleaned. Set semantics are a claim about the world; on a book of record I default to bag semantics and dedupe on purpose, never by accident.",
      tag: "setops",
    },
    {
      id: "ms-t12",
      q: "The close deck wants a receipt table with a grand-total row. How do you build it, and why not GROUP BY with a NULL key?",
      a: "As a UNION ALL stack: per-rail folds from payments grouped by method — card 37364.00, wire 32248.00 — plus a literal 'TOTAL' arm that folds across all methods for 69612.00. SQLite has no GROUP BY ROLLUP, so the stack is the native shape, and the literal label is what keeps the total row from being mistaken for a rail. The NULL-key trick (GROUP BY method then UNION a NULL-method fold) technically works but prints a row whose membership nobody can defend at close: is NULL a rail, a bucket for unmapped receipts, or the total? The discipline is the same one the ledger uses — every printed line names itself. When the deck's total has to tie to the cash book's 69612.00 debit fold, the label IS the audit trail.",
      tag: "setops",
    },
    {
      id: "ms-t13",
      q: "The growth review wants each household's lifetime billed beside the book's average billing. Correlated subquery or derived table — and what's the performance story?",
      a: "Derived, always, when the benchmark is book-wide. (SELECT AVG(amount_cents) FROM invoices) is a constant over the 28-billing book — 3106.32 probed — so it should be computed once and inlined, not re-evaluated per household row. A correlated subquery referencing the outer household re-runs the average semantics per row; on this book it happens to return the same constant (the correlation isn't actually used), but the plan carries the re-evaluation shape, and the moment someone edits the inner query to 'average per market' it silently becomes a different benchmark per row. On an 11-household fold nobody notices; on a book-sized fold the pattern pages the DBA. Eight households clear the 3106.32 line here — the derived shape keeps the benchmark a single, auditable number in the walkthrough.",
      tag: "subqueries",
    },
    {
      id: "ms-t14",
      q: "A colleague's NOT IN check for 'households with no billings' returns zero rows — but they expected some. What's the first thing you check?",
      a: "NULLs in the subquery's select list. NOT IN over a list containing NULL is structurally broken: x NOT IN (1, 2, NULL) can never be true, because the comparison is x <> 1 AND x <> 2 AND x <> NULL, and unknown poisons the AND — the whole predicate goes unknown and the row drops. The book's own anti-joins all dodge this by keying on non-nullable ids (payments.invoice_id), which is why the fee-receivable watch works as LEFT JOIN + IS NULL. My order of preference: NOT EXISTS first (NULL-safe by construction, reads as the business question), the LEFT JOIN anti-join second (it gives you the right-side columns for free), NOT IN last and only over columns declared NOT NULL. The zero-rows result wasn't wrong SQL — it was an unprovable predicate.",
      tag: "subqueries",
    },
    {
      id: "ms-t15",
      q: "A junior's settlement report prints received amounts like 40 instead of 4000.00. What SQL habit produced that?",
      a: "Integer division. Money in this book lives in invoices/payments/ledger as INTEGER cents — the dollar read is always amount_cents / 100.0, and dropping the '.0' makes SQLite divide integers: 400000 / 100 happens to print 4000 (clean), but any odd-cent fold truncates — the book's average billing 310632 cents / 100 prints 3106, silently losing the .32 on every row. The habit that scales: keep cents until the edge, convert once with a real (100.0), ROUND at the presentation boundary, and never mix — a fold that divides by 100 in a CTE and again outside has quartered the book. The 4000.00-of-6148.00 partial is the desk's favorite proof: print it as 40-of-61 and the collections meeting argues about a different receivable than the one that exists.",
      tag: "types",
    },
    {
      id: "ms-t16",
      q: "Your book board groups by the alias 'month' and works in SQLite. Why might that be a problem anyway?",
      a: "Because alias resolution in GROUP BY is a dialect feature, not a guarantee. SQLite resolves output aliases in GROUP BY and HAVING (so GROUP BY month after SELECT SUBSTR(issued_on, 1, 7) AS month folds monthly), but the SQL standard — and several engines — only promises input columns there, and ORDER BY is where aliases are universally safe. The portable form spells the expression in GROUP BY and keeps the alias for display; the readable form notes the dialect in a comment. The related SQLite generosity I refuse to lean on: bare columns in an aggregate query. GROUP BY i.status while selecting i.number compiles fine and picks an arbitrary row's number — the billing-state fold (paid 21 / 66443.00, open 6 / 19609.00, void 1 / 925.00) is real, but the name beside it is noise. Fold on keys you can defend.",
      tag: "aggregation",
    },
    {
      id: "ms-t17",
      q: "On the billing-to-receipt LEFT JOIN, three counts disagree: 28, 27, 22. Say what each one is and which the desk may quote.",
      a: "All three are true; they measure different things. COUNT(*) over the join is 28 rows — every billing survives the LEFT JOIN, no-receipt ones included. COUNT(p.id) is 27 — the receipt rows that actually matched, five split-plan billings contributing a second row each. COUNT(DISTINCT i.id) is 22 — the billings that ever received a dollar: 21 exact plus the 4000.00-of-6148.00 partial. The desk may quote any of them IF the label travels: 28 billings on the book, 27 receipt rows across two rails, 22 relationships with receipt evidence. What's never allowed is the unlabeled fold — 'the settled count' — because that's where 33 (the join's row count) or 21 (status-paid) sneaks in as a denominator. Grain is a citation, not a detail.",
      tag: "aggregation",
    },
    {
      id: "ms-t18",
      q: "Close night, five minutes: management wants the count of void billings that drew receipts AND paid billings with none. How do you deliver both in one query?",
      a: "One pass with FILTER (WHERE …), which counts conditional arms on the same join without rerunning anything: COUNT(*) FILTER (WHERE i.status = 'void' AND p.id IS NOT NULL) catches the void-but-received 925.00; COUNT(*) FILTER (WHERE i.status = 'paid' AND p.id IS NULL) catches the paid-claim gap at 1756.00. One join, one fold, two honest arms — versus five ad-hoc queries at close that each rebuild the join and drift. The FILTER discipline also documents itself: the arm's predicate IS the definition of the break, so the numbers route themselves — 925.00 to the ops queue that reverses the receipt, 1756.00 to the collections lead who either finds the receipt or re-states the status. And the ledger still proves 181080.00 against 181080.00 while both anomalies sit open — double-entry records what happened; reconciliation is what decides whether it should have.",
      tag: "quality",
    },
    {
      id: "ms-t19",
      q: "The fee-schedule team wants households cut into quartiles by lifetime billed. NTILE, PERCENT_RANK or CASE bands — pick and defend.",
      a: "NTILE(4) OVER (ORDER BY lifetime_billed) when the requirement is 'four equal-count groups' — it guarantees bucket sizes regardless of dollar gaps, which is what an advisor-coverage model wants. PERCENT_RANK when the requirement is 'where does this household sit in the book' — it prints 0..1 against lifetime billed and survives odd book sizes, but it's a position, not an assignment. CASE bands when the schedule itself defines the boundaries — fee tiers are contractual dollar lines, not statistical cuts, and a band that moves with the book's shape would re-tier a household without anyone signing it. The concentration read ties it together: the 3000-plus tier holds 63.5% of booked value, so equal-count quartiles and dollar bands disagree violently at the top — and which one you ship is a business decision, not a SQL one.",
      tag: "windows",
    },
    {
      id: "ms-t20",
      q: "In the receipt census, why does the no-receipt arm print NULL until you wrap the SUM — and is 0.00 even honest there?",
      a: "SUM(p.amount_cents) over a billing with no matched receipt rows aggregates the empty set, and SQL's aggregate-over-empty is NULL, not zero — so the census prints NULL until you wrap it: COALESCE(SUM(p.amount_cents), 0). Whether 0.00 is honest is the second half: for 'received' it is — the household genuinely received nothing, and 0.00 keeps the column numeric so downstream folds don't NULL-poison. For anything derived from receipt rows — an average receipt size, a settlement lag — zero would be a lie; the no-receipt watch has no lag, not a zero-day lag. So the policy I state in every walkthrough: COALESCE sums and counts that mean 'none happened'; leave NULL standing on measures that mean 'cannot be computed', and let the report show the gap. The 6-billing / 15217.00 watch is that gap, printed on purpose.",
      tag: "nulls",
    },
    {
      id: "ms-t21",
      q: "A fee dispute says the household was billed under yesterday's schedule. How do you build the as-of join that proves or kills the claim?",
      a: "Point-in-time logic: for each billing, pick the schedule row whose effective_from is the greatest one not after the billing's issue date — a correlated (SELECT MAX(effective_from) FROM fee_schedule s WHERE s.effective_from <= i.issued_on AND s.tier = c.tier) keyed into a join, or ROW_NUMBER() OVER (PARTITION BY household ORDER BY effective_from DESC) = 1 over the pre-filtered candidate set. The bugs that lose disputes: joining on 'latest schedule overall' (today's, not billing-day's — exactly the claim the household is disputing), forgetting the tier/partition key so another household's schedule leaks in, and tie-breaking equal effective_from rows by anything but a documented rule. The desk's sentence: the schedule in force at billing time is a fact about that day; every other version is an opinion. Same discipline the product-price-at-a-given-date drill teaches.",
      tag: "dates",
    },
    {
      id: "ms-t22",
      q: "The advisor-book board is 'fine on 28 billings' — how do you argue index design before the book is 28 million rows?",
      a: "By naming the access paths the boards share. Every census in this kit joins payments to invoices on invoice_id and customers on id — the anti-join's LEFT JOIN probe and the coverage fold both look up payments by invoice_id, so an index on payments(invoice_id) turns the watch's build from a full scan per billing into a seek; a covering index on payments(invoice_id, amount_cents, method) lets the rail folds (card 37364.00 / wire 32248.00) come out of the index without touching the table. EXPLAIN QUERY PLAN is the habit: look for SCAN versus SEARCH on the inner side of the join, and remember the anti-join pays the index toll too — 'billings with no receipt' is only cheap if receipts are seekable. The instinct to sell: indexes are how a definition stays cheap as the book grows; correctness is how it stays true. Both are design decisions made before close night.",
      tag: "performance",
    },
    {
      id: "ms-t23",
      q: "The board ranks within market, but the print order is wrong — advisors see another market's rung 1 first. Window ORDER BY versus outer ORDER BY: who wins?",
      a: "They're two different sentences. The window's ORDER BY (inside OVER) only decides how rank numbers are assigned within each PARTITION — it never sorts the output. The outer ORDER BY decides what prints first; if it's absent, row order is whatever the plan produced, which looks authoritative and isn't. The board that ships: RANK() OVER (PARTITION BY region ORDER BY COUNT(*) DESC) AS book_rank, then an outer ORDER BY region, book_rank — so every market opens on its own rung 1 and the tie policy (shared rungs, the next rank skipping) reads top-down per market. The trap worth naming: adding DESC inside the window while forgetting the outer clause 'fixes' the numbers and leaves the print order arbitrary — the board is numerically honest and visually scrambled, which is worse, because nobody re-checks a board that looks sorted.",
      tag: "windows",
    },
    {
      id: "ms-t24",
      q: "Two boards both print '6 billings outstanding' — the open-status census and the no-receipt watch. How do you keep the org from quoting them interchangeably?",
      a: "By making the denominator a named, owned artifact. The open census is a status claim: 6 billings / 19609.00 that the billing system calls open. The watch is an evidence read: 6 billings / 15217.00 with no receipt row in payments — same count, different sets, 4392.00 apart, because one open billing took a 4000.00 partial (evidence: out of the watch) and one paid-status billing has no receipt (claim only: in the watch). The governance that works: every board ships with a one-line definition — membership rule, base table, grain, timestamp — and the KPI owner signs it; decks that drop the definition get bounced at review, not footnoted. That's the interview sentence this kit drills: open is a claim, unreceived is evidence, and the gap between them is exactly two anomalies — 925.00 received on a void, 1756.00 claimed without a receipt.",
      tag: "kpi",
    },
  ],

  mcqs: [
    {
      id: "ms-mcq-1",
      prompt: "The collections sit-down needs billings with NO receipt row at all. Which query finds them?",
      choices: [
        "SELECT … FROM invoices WHERE status = 'open'",
        "SELECT … FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL",
        "SELECT … FROM invoices i JOIN payments p ON p.invoice_id = i.id WHERE p.amount_cents IS NULL",
        "SELECT … FROM invoices WHERE amount_cents > 0",
      ],
      answer: 1,
      why: "The anti-join is definitional: LEFT JOIN keeps billings without receipts (all payment columns NULL), and p.id IS NULL keeps exactly those — the 6-billing / 15217.00 watch.",
      notes: [
        { choice: 0, why: "Close but wrong membership: open carries 19609.00 while the no-receipt watch carries 15217.00 — the 4000.00-partial open billing has a receipt, and a paid-status billing with none rides in the watch instead." },
        { choice: 2, why: "An INNER JOIN drops the very rows you're hunting — billings with no receipt match nothing and vanish before the WHERE ever sees them." },
      ],
      difficulty: "easy",
    },
    {
      id: "ms-mcq-2",
      prompt: "The deck needs billings bucketed by billing month ('2024-10', '2024-12', …). Which expression builds the key?",
      choices: [
        "SUBSTR(issued_on, 1, 7)",
        "SUBSTR(issued_on, 1, 10)",
        "issued_on / 100",
        "STRFTIME(issued_on)",
      ],
      answer: 0,
      why: "SUBSTR(issued_on, 1, 7) slices '2024-10-14 …' to '2024-10' — the month key the 2024-01 to 2025-02 window is bucketed on, and it sorts correctly as text.",
      notes: [
        { choice: 1, why: "Ten characters is the full date — every billing becomes its own bucket and the monthly rollup dissolves into 28 rows of one." },
        { choice: 3, why: "STRFTIME needs a format string as its first argument; called bare it returns NULL and every billing lands in one NULL bucket." },
      ],
      difficulty: "easy",
    },
    {
      id: "ms-mcq-3",
      prompt: "The book board must read biggest billed first within each market. Which clause orders the board correctly?",
      choices: [
        "ORDER BY lifetime_billed",
        "ORDER BY lifetime_billed DESC",
        "ORDER BY market ASC",
        "SORT BY lifetime_billed DESC",
      ],
      answer: 1,
      why: "DESC puts the largest fold first — the board reads top-down by value. The default ORDER BY is ASC, which would headline the smallest household and invert the entire review.",
      notes: [
        { choice: 0, why: "Ascending by default — the board would open on the smallest book. Direction is part of the definition; leaving it to the default is how the smallest name tops the deck." },
        { choice: 2, why: "Ordering by market groups the rows alphabetically but says nothing about value — within each market the order is arbitrary. 'SORT BY' isn't SQL at all." },
      ],
      difficulty: "easy",
    },
    {
      id: "ms-mcq-4",
      prompt: "A billing-to-receipt join for the book rollup returns 33 rows on a 28-billing book. The honest count of billings settled is:",
      choices: [
        "COUNT(*) = 33 — that's the settled count now",
        "COUNT(DISTINCT i.id) — five split-plan billings carry two receipt rows each",
        "27 — receipts, not billings",
        "28 — the join never changes row counts",
      ],
      answer: 1,
      why: "Split-plan billings carry two receipt rows, so the join prints 33 rows at receipt grain. COUNT(DISTINCT i.id) folds back to billing grain — the grain the advisor conversation actually runs on.",
      notes: [
        { choice: 0, why: "COUNT(*) counts the join's rows — receipt grain. Reporting 33 settled billings inflates the book by exactly the five split plans and misstates every coverage ratio downstream." },
        { choice: 3, why: "Joins absolutely change row counts — that's the fan-out. Grain is decided by the join, and the fix is a deliberate DISTINCT, not an assumption." },
      ],
      difficulty: "medium",
    },
    {
      id: "ms-mcq-5",
      prompt: "The board should keep only households whose lifetime billed crosses 5000.00. Where does that gate live?",
      choices: [
        "WHERE lifetime_billed >= 5000",
        "HAVING SUM(amount_cents) / 100.0 >= 5000",
        "LIMIT 5000",
        "ORDER BY lifetime_billed >= 5000",
      ],
      answer: 1,
      why: "The gate is on a fold, and folds exist only after GROUP BY — the gate is HAVING, written against the fold itself. WHERE runs before any fold exists.",
      notes: [
        { choice: 0, why: "WHERE can't see SELECT aliases or folds — the column doesn't exist yet at filter time. Most engines reject it; the ones that tolerate it are computing something else." },
        { choice: 2, why: "LIMIT caps output rows, not values — 5000 rows of everything is not 'households over 5000 dollars'. The gate and the cap are different sentences entirely." },
      ],
      difficulty: "medium",
    },
    {
      id: "ms-mcq-6",
      prompt: "The book board ranks households within each booking market. What does PARTITION BY region change versus no partition?",
      choices: [
        "Nothing — ORDER BY already sorts by market",
        "Each market's households rank 1..n independently, instead of one global ladder across all four",
        "It deduplicates households per market",
        "It converts the query into a GROUP BY",
      ],
      answer: 1,
      why: "PARTITION BY restarts the rank per market — every market gets its own rung 1. Without it, one global ORDER BY ranks all 11 billing-carrying households 1..11 and the per-market boards the advisors read disappear.",
      notes: [
        { choice: 0, why: "Sorting by market orders rows; partitioning renumbers ranks per market. A globally-ranked board shows rung 1 exactly once — one market's advisor reads a board with no top of it." },
        { choice: 2, why: "Windows never deduplicate — every billing-carrying household keeps its row. The partition changes the numbering, not the membership." },
      ],
      difficulty: "medium",
    },
    {
      id: "ms-mcq-7",
      prompt: "Settlement lag: days from billing to first receipt, averaged over 'paid' billings. The correct base is:",
      choices: [
        "All 21 paid billings",
        "All 27 receipt rows",
        "The 20 paid billings that carry a receipt — 28.4 days average",
        "All 28 billings on the book",
      ],
      answer: 2,
      why: "Lag needs both endpoints: one paid billing (1756.00) has no receipt, so its julianday diff is NULL and AVG skips it — the honest base is 20 paid-with-receipt billings, averaging 28.4 days against flat 30-day terms.",
      notes: [
        { choice: 0, why: "The 21st paid billing has no receipt — its lag is NULL and drops out of AVG silently. Quoting a 21-billing base on the slide misstates the denominator the number was computed over." },
        { choice: 1, why: "Receipt rows are the wrong grain — five split billings count twice. An average over rows, not relationships, is quietly weighted by payment behavior." },
      ],
      difficulty: "medium",
    },
    {
      id: "ms-mcq-8",
      prompt: "The watch has 6 billings / 15217.00; the open-status census has 6 billings / 19609.00. What explains the 4392.00 gap?",
      choices: [
        "A units error — one of them forgot to divide by 100",
        "Different membership: the open 4000.00-partial billing has a receipt (out of the watch), and a paid-status 1756.00 billing has none (in it)",
        "The watch excludes void billings; the census includes them",
        "Nothing — both lists are the same six billings",
      ],
      answer: 1,
      why: "Same count, different sets. The anti-join keys on receipt presence, not status — so the open billing with a 4000.00 partial against 6148.00 drops out, and the paid-status billing at 1756.00 rides in. Membership is evidence, not a status string.",
      notes: [
        { choice: 3, why: "The counts coinciding is the trap, not the proof — if the sets were identical the dollars would tie too. They don't, and the two anomalies in this book are the entire gap." },
        { choice: 2, why: "Neither read filters void explicitly — the anti-join never mentions status. Inventing a void filter explains a gap the data doesn't have." },
      ],
      difficulty: "hard",
    },
    {
      id: "ms-mcq-9",
      prompt: "Two EU households each show two billings. RANK and ROW_NUMBER over (frequency DESC, value DESC) return:",
      choices: [
        "Identical boards — ties always render the same",
        "RANK: 3, 3, then 5 — ROW_NUMBER: 3, 4, then 5",
        "RANK: 3, 4 — ROW_NUMBER: 3, 3",
        "RANK: 4, 4, then 5 — ROW_NUMBER: 3, 5",
      ],
      answer: 1,
      why: "RANK gives tied rows the same rung and skips — 3, 3, then 5. ROW_NUMBER breaks the tie arbitrarily — 3, 4 — and hands the rung to whichever row the plan read first. Same data, different boards; only one is defensible on an advisor call.",
      notes: [
        { choice: 0, why: "Ties are exactly where the two diverge — 'always the same' is the assumption that ships a randomly-tied board to the desk that emails 'everyone at rung 3'." },
        { choice: 2, why: "That's DENSE_RANK's shape (consecutive rungs, ties share) mislabeled twice — neither function prints 3, 4 for a tie. Knowing which policy you're looking at is the whole point." },
      ],
      difficulty: "hard",
    },
    {
      id: "ms-mcq-10",
      prompt: "Which read proves the void billing that still received 925.00?",
      choices: [
        "SELECT … FROM invoices WHERE status = 'void'",
        "Pair state with evidence: status='void' AND an EXISTS receipt row",
        "SELECT … FROM payments WHERE method = 'void'",
        "Anti-join: billings with NO receipt rows",
      ],
      answer: 1,
      why: "The break is a PAIR — a void claim and a receipt that exists. Status alone shows the void but hides the 925.00 hit; the paired read is the evidence that a settlement cleared against a cancelled billing.",
      notes: [
        { choice: 2, why: "'void' is a billing state, not a rail — payments carry card and wire only. The query errors, and the break stays invisible through close." },
        { choice: 3, why: "The anti-join finds NEVER-received billings — the opposite evidence. The void-but-received row HAS a receipt, so the anti-join is structurally blind to it." },
      ],
      difficulty: "hard",
    },
    {
      id: "ms-mcq-11",
      prompt: "The receipt census counts receipt rows per billing over a billings-LEFT-JOIN-payments fold. What does COUNT(p.id) print for a no-receipt billing?",
      choices: [
        "1 — every billing gets a row",
        "0 — no receipt row matched, so the count of matched ids is zero",
        "NULL — the count can't evaluate",
        "27 — the census folds at book level",
      ],
      answer: 1,
      why: "COUNT(col) counts non-NULL values of the joined column. With no matching receipt row, p.id is NULL on every row of that billing's group — the count is 0, which is exactly the census the desk wants beside the 15217.00 watch.",
      notes: [
        { choice: 0, why: "That's COUNT(*) — it counts the billing row the LEFT JOIN kept, printing 1 for billings with zero receipts and quietly inflating every census that trusts it." },
        { choice: 2, why: "Aggregates over empty sets return NULL for SUM, but COUNT always returns a number — 0. 'NULL count' confuses the two behaviors and breaks the coverage fold downstream." },
      ],
      difficulty: "easy",
    },
    {
      id: "ms-mcq-12",
      prompt: "In the same census, why wrap the receipts fold as ROUND(COALESCE(SUM(p.amount_cents), 0) / 100.0, 2)?",
      choices: [
        "COALESCE converts cents to dollars",
        "SUM over a billing with no receipt rows returns NULL; COALESCE prints the honest 0.00 instead",
        "COALESCE deduplicates split-plan receipt rows",
        "ROUND requires a non-NULL first argument or it errors",
      ],
      answer: 1,
      why: "SUM over an empty group is NULL, not zero. COALESCE(…, 0) keeps the received column numeric — 0.00 for the 6-billing watch — so downstream folds don't NULL-poison, and cents still convert at the edge with / 100.0.",
      notes: [
        { choice: 0, why: "Division by 100.0 converts; COALESCE only substitutes a fallback. Crediting COALESCE with unit conversion is how integer-cents discipline quietly erodes." },
        { choice: 2, why: "Split-plan billings carry two receipt rows and COALESCE never dedupes — the 5 split billings (refs 1, 5, 12, 19, 22) still sum both receipts, which is exactly what 'received' means." },
      ],
      difficulty: "easy",
    },
    {
      id: "ms-mcq-13",
      prompt: "The close deck stacks a card-rail fold and a wire-rail fold, plus a TOTAL arm. Which set operator is correct?",
      choices: [
        "UNION — duplicates across rails must be cleaned",
        "UNION ALL — every arm's rows survive, so the stack still foots to 69612.00",
        "INTERSECT — only rails present in both arms should print",
        "EXCEPT — wire rows already counted in card drop out",
      ],
      answer: 1,
      why: "UNION ALL appends without deduplicating: card 37364.00 + wire 32248.00 + TOTAL 69612.00 all survive. Bare UNION collapses any two arms that print identical rows — a silent row loss the cash cross-foot would catch only at close.",
      notes: [
        { choice: 0, why: "Rail arms with the same month-and-dollars are different receipts that happen to agree, not duplicates — UNION deletes real rows and the deck's total stops footinging to the cash book's fold." },
        { choice: 2, why: "INTERSECT keeps rows present in BOTH arms — the opposite of a stack. On rails that rarely agree to the penny, it prints an empty report with a straight face." },
      ],
      difficulty: "easy",
    },
    {
      id: "ms-mcq-14",
      prompt: "The platform review wants a ROLLING three-month receipt census over month-bucketed rows. Which window specification delivers it?",
      choices: [
        "SUM(receipts) OVER (ORDER BY month) — the default is rolling",
        "SUM(receipts) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)",
        "SUM(receipts) OVER (PARTITION BY month)",
        "SUM(receipts) OVER ()",
      ],
      answer: 1,
      why: "The default frame with an ORDER BY is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — a running total since the first bucket, not a three-month window. The explicit ROWS frame is the only spec that prints the rolling census the review asked for.",
      notes: [
        { choice: 0, why: "'Default' here means running-total-from-the-beginning — a census that grows every month and looks plausible right up until someone checks month 12 against the cash fold." },
        { choice: 2, why: "PARTITION BY month gives every month its own partition, so each row's window is just itself — the census dissolves into the raw monthly folds." },
      ],
      difficulty: "medium",
    },
    {
      id: "ms-mcq-15",
      prompt: "The billing-trend walk starts at 2024-02 — the first billing month. What does its mom_delta print, and why?",
      choices: [
        "0.00 — no change from the prior month",
        "NULL — LAG has no prior row, and that IS the definition",
        "The month's own billed amount — LAG wraps to itself",
        "-11085.00 — the walk treats the first month as a drop from peak",
      ],
      answer: 1,
      why: "LAG(cents) OVER (ORDER BY month) is NULL on the first row — there is no previous month to subtract. AVG skips that NULL rather than treating it as zero, which is why the walk's average delta is computed over 12 deltas, not 13.",
      notes: [
        { choice: 0, why: "COALESCE-ing the first delta to 0.00 invents a base month — the walk then claims stability at the exact point where the book's history starts, and the deck's first row is fiction." },
        { choice: 2, why: "LAG never wraps. That value would mean 'the book grew by itself', and every downstream MoM chart inherits the impossible base." },
      ],
      difficulty: "medium",
    },
    {
      id: "ms-mcq-16",
      prompt: "A junior writes SUM(amount_cents) / 100 for dollars and the average billing prints 3106 instead of 3106.32. The bug:",
      choices: [
        "ROUND was missing — wrap the whole fold in ROUND(x)",
        "Integer division: / 100 on integers truncates; the dollar read is / 100.0",
        "AVG was applied after the division instead of before",
        "The cents column needs CAST to TEXT first",
      ],
      answer: 1,
      why: "Both operands are integers, so SQLite divides in integer arithmetic and floors: 310632 cents / 100 = 3106. The kit's rule — money is integer cents, the dollar read is ALWAYS amount_cents / 100.0, ROUND at the presentation edge — exists because of exactly this bug.",
      notes: [
        { choice: 0, why: "ROUND can't recover the digits integer division already destroyed — the .32 is gone before ROUND ever sees the value. The fix is the real divisor, not cosmetic rounding." },
        { choice: 2, why: "Order isn't the issue: AVG(amount_cents)/100 and AVG(amount_cents/100) both truncate when the division is integer arithmetic. The divisor's type decides." },
      ],
      difficulty: "medium",
    },
    {
      id: "ms-mcq-17",
      prompt: "Each household's lifetime billed must sit beside the book's AVERAGE BILLING (a single constant, 3106.32). Which shape computes the benchmark once?",
      choices: [
        "A correlated subquery referencing the outer household inside the average",
        "A scalar subquery: (SELECT AVG(amount_cents) / 100.0 FROM invoices) — constant over the book",
        "AVG(lifetime_billed) over the household fold — same thing, cheaper",
        "A CROSS JOIN to the invoices table, averaged per row",
      ],
      answer: 1,
      why: "The benchmark is book-wide, so it's a constant: one scalar subquery, computed once, comparable against every household's fold in HAVING. The average BILLING (3106.32) is not the average household — conflating them is the denominator error the review probes first.",
      notes: [
        { choice: 0, why: "The correlation isn't used — but the shape now re-evaluates per row and invites an 'average per market' edit that silently becomes a different benchmark per row. Derived or scalar, once." },
        { choice: 2, why: "AVG over household folds averages HOUSEHOLDS (7907.00 over 11), not billings (3106.32 over 28) — a different number that changes which households clear the bar. The review asked for the billing benchmark." },
      ],
      difficulty: "medium",
    },
    {
      id: "ms-mcq-18",
      prompt: "A colleague's 'households with no billings' check uses NOT IN (SELECT customer_id FROM invoices) and returns nothing. First suspect?",
      choices: [
        "The outer query has no GROUP BY",
        "A NULL in the subquery's select list poisons NOT IN — the predicate can never be true",
        "NOT IN needs DISTINCT to work",
        "The customers table is empty",
      ],
      answer: 1,
      why: "x NOT IN (1, 2, NULL) is x <> 1 AND x <> 2 AND x <> NULL — the unknown comparison poisons the AND, every row goes unknown, and the result is zero rows. NULL-safe forms: NOT EXISTS, or the LEFT JOIN anti-join this kit's watch is built on.",
      notes: [
        { choice: 1, why: "Right family, wrong fix — DISTINCT changes multiplicity, not NULL semantics. The watch works because it keys on p.invoice_id and tests IS NULL after a LEFT JOIN, never because of IN." },
        { choice: 2, why: "GROUP BY has nothing to do with NOT IN evaluation. Diagnosing NULL semantics is the muscle; reaching for clause shuffles is how the bug survives review." },
      ],
      difficulty: "hard",
    },
    {
      id: "ms-mcq-19",
      prompt: "The fee-schedule team wants four equal-COUNT household groups by lifetime billed. Which window assigns them?",
      choices: [
        "NTILE(4) OVER (ORDER BY lifetime_billed)",
        "NTILE(lifetime_billed) OVER (ORDER BY 4)",
        "WIDTH_BUCKET(lifetime_billed, 0, 30000, 4)",
        "ROUND(4.0 * lifetime_billed / SUM(lifetime_billed) OVER ())",
      ],
      answer: 0,
      why: "NTILE(n) OVER (ORDER BY …) divides the rows into n equal-count buckets by the ordering — the definition of 'four equal-count groups'. Equal-count is a book-shape claim; dollar bands are a different requirement the CASE ladder handles.",
      notes: [
        { choice: 1, why: "NTILE takes a constant bucket count; handed a dollar column it errors. And ORDER BY 4 orders by the constant 4 — every row ties, so the buckets are assigned arbitrarily." },
        { choice: 3, why: "That's a share of the book, not a bucket assignment — it prints 0.19, not 'tier 2', and the fee schedule can't invoice a proportion." },
      ],
      difficulty: "hard",
    },
    {
      id: "ms-mcq-20",
      prompt: "A fee dispute needs the schedule IN FORCE on the billing's issue date. Which read proves it?",
      choices: [
        "Join the household to today's latest schedule row",
        "Pick the schedule row with MAX(effective_from) among those <= the billing's issued_on",
        "Average every schedule row touching the household",
        "Filter schedules to those issued in the same month",
      ],
      answer: 1,
      why: "As-of logic: the greatest effective_from not after the billing's issue date is the schedule in force THAT day — a correlated MAX or a ROW_NUMBER() = 1 over the pre-filtered candidates. Joining today's latest schedule proves the disputant's point for them.",
      notes: [
        { choice: 0, why: "That's the exact bug the dispute alleges — pricing a past billing on today's schedule. Point-in-time truth beats current-state convenience every time the desk is audited." },
        { choice: 2, why: "Averaging schedules invents a rate nobody signed. Disputes are settled by the row that was in force, not by interpolation across the ones that weren't." },
      ],
      difficulty: "hard",
    },
    {
      id: "ms-mcq-21",
      prompt: "The growth board takes 'the top four above-average relationships'. The HAVING already filtered the fold. What finishes the query?",
      choices: [
        "LIMIT 4 — after ORDER BY lifetime_billed DESC, or the four rows are arbitrary",
        "TOP 4 — SQL Server syntax works everywhere",
        "WHERE ROWNUM <= 4 — applied before the fold",
        "HAVING RANK() <= 4 — windows run after HAVING anyway",
      ],
      answer: 0,
      why: "LIMIT caps the printed rows after ordering: ORDER BY lifetime_billed DESC LIMIT 4 is deterministic. Without the ORDER BY, LIMIT 4 hands the board whichever four rows the plan produced first — on an advisor deck, that's four random relationships.",
      notes: [
        { choice: 1, why: "TOP is dialect, not SQL — SQLite errors. And even where it parses, the ordering clause carries the determinism, not the cap keyword." },
        { choice: 3, why: "Window functions compute after HAVING, but you can't filter on them in the same SELECT — RANK needs a derived table or CTE before any rank filter applies." },
      ],
      difficulty: "easy",
    },
    {
      id: "ms-mcq-22",
      prompt: "The partial-payment read keeps billings whose receipts sum UNDER the billed amount. Where does SUM(p.amount_cents) < i.amount_cents live?",
      choices: [
        "WHERE — it's just a comparison",
        "HAVING — the comparison reads a fold, which exists only after GROUP BY",
        "ORDER BY — comparisons sort the shortfalls",
        "ON — the join condition itself",
      ],
      answer: 1,
      why: "The predicate references an aggregate over the join, so it gates GROUPS: HAVING. The 4000.00-of-6148.00 partial survives it; the 21 exact billings (receipts = billed) fail the strict < and drop — which is the read's definition working.",
      notes: [
        { choice: 0, why: "WHERE runs before rows are folded — the SUM doesn't exist yet. Most engines reject it outright; the ones that tolerate it are computing something else entirely." },
        { choice: 3, why: "Putting the comparison in ON changes which receipts JOIN, not which billings print — the fold then runs on a crippled join and the 'partial' label is meaningless." },
      ],
      difficulty: "easy",
    },
    {
      id: "ms-mcq-23",
      prompt: "Which pair of expressions both build the billing-month key '2025-01' from a '2025-01-14 …' date?",
      choices: [
        "SUBSTR(issued_on, 1, 7) and STRFTIME('%Y-%m', issued_on)",
        "SUBSTR(issued_on, 1, 7) and STRFTIME(issued_on, '%Y-%m')",
        "SUBSTR(issued_on, 0, 7) and STRFTIME('%Y-%m', issued_on)",
        "SUBSTR(issued_on, 1, 7) and DATE(issued_on, 'month')",
      ],
      answer: 0,
      why: "SUBSTR slices characters 1-7 ('YYYY-MM'); STRFTIME with the format FIRST prints the same key. Both sort correctly as text, which is why the 2024-02 to 2025-02 walk buckets cleanly either way.",
      notes: [
        { choice: 1, why: "STRFTIME's arguments are swapped — the format string comes first. Called with the date first it returns NULL, and every billing lands in one NULL bucket." },
        { choice: 2, why: "SUBSTR is 1-indexed: position 0 grabs seven characters ending at '5-01-1' — a mangled key that sorts wrong and splits months. Off-by-one on the bucket key poisons the whole walk." },
      ],
      difficulty: "easy",
    },
    {
      id: "ms-mcq-24",
      prompt: "A board ranks households within market via RANK() OVER (PARTITION BY region ORDER BY COUNT(*) DESC), but prints scrambled. The fix:",
      choices: [
        "Move the ORDER BY outside the OVER",
        "Add an outer ORDER BY region, book_rank — the window's ORDER BY never sorts the output",
        "Replace RANK with ROW_NUMBER — it prints in order",
        "Add DESC inside the OVER and remove the partition",
      ],
      answer: 1,
      why: "The window's ORDER BY assigns rank numbers; the outer ORDER BY decides what prints first. They're independent sentences — the board needs both, and the outer clause is what every market's rung 1 lands on top.",
      notes: [
        { choice: 0, why: "There IS no 'outside the OVER' version of the window's order — removing it breaks the ranks. The missing piece is a second, outer ORDER BY, not a relocation." },
        { choice: 2, why: "ROW_NUMBER changes the tie policy, not the print order — ties stop sharing rungs AND the rows stay scrambled. Two regressions for the price of one edit." },
      ],
      difficulty: "medium",
    },
    {
      id: "ms-mcq-25",
      prompt: "Find the five split-plan billings by pairing their two receipt rows. Which self-join is correct?",
      choices: [
        "p1.invoice_id = p2.invoice_id",
        "p1.invoice_id = p2.invoice_id AND p1.id < p2.id",
        "p1.invoice_id = p2.invoice_id AND p1.id <> p2.id",
        "p1.id = p2.id",
      ],
      answer: 1,
      why: "Pair on shared billing, then canonicalize with p1.id < p2.id: each split billing prints exactly one pair row. The five splits (refs 1, 5, 12, 19, 22) surface cleanly instead of as mirrored duplicates.",
      notes: [
        { choice: 0, why: "Equality alone matches every row to itself first — each split prints its self-pair plus the mirror pair (a→b and b→a). The count triples and the 'pairs' read is unquotable." },
        { choice: 2, why: "<> kills self-pairs but keeps both orientations — a→b AND b→a both print. The audit asks for each pair once; canonical ordering is the discipline." },
      ],
      difficulty: "medium",
    },
    {
      id: "ms-mcq-26",
      prompt: "In the coverage census, the CASE checks 'received IS NULL' FIRST. What happens if the partial test comes first instead?",
      choices: [
        "Nothing — CASE arms are independent",
        "The 6 no-receipt billings mislabel as 'exact': received < amount_cents is NULL-true for them, so they fall to ELSE",
        "The query errors — NULL can't be compared",
        "The partial row prints twice",
      ],
      answer: 1,
      why: "CASE evaluates arms in order. For no-receipt billings, received is NULL, so received < amount_cents is unknown — not true — and the row skips to ELSE, labeled 'exact'. The watch (6 / 15217.00) would vanish into the exact class (now 27 / 80829.00) — the exact misclassification the arm order exists to prevent.",
      notes: [
        { choice: 0, why: "Arms are sequential, not independent — order IS semantics when NULL comparisons are involved. The IS NULL arm first is load-bearing." },
        { choice: 2, why: "NULL comparisons don't error, they return unknown — which is precisely why the misclassification is silent. Silent is worse than loud in a census." },
      ],
      difficulty: "medium",
    },
    {
      id: "ms-mcq-27",
      prompt: "GROUP BY month works in SQLite after SELECT SUBSTR(issued_on, 1, 7) AS month. Why does the desk still spell the expression in GROUP BY on shared code?",
      choices: [
        "SQLite silently rewrites aliases anyway — spelling it is faster",
        "Alias-in-GROUP-BY is a dialect courtesy, not a guarantee — spelling the expression is portable and self-documenting",
        "Aliases are only legal in ORDER BY everywhere",
        "The expression is shorter than the alias",
      ],
      answer: 1,
      why: "SQLite resolves output aliases in GROUP BY, but the standard only promises input columns there — port across engines and the alias may stop resolving. Spelling SUBSTR(issued_on, 1, 7) costs nothing and tells the reader the fold key without a scroll up.",
      notes: [
        { choice: 0, why: "'It works here' is how dialect creep ships. The walk's month buckets must survive the next engine migration — the expression, not the alias, is the contract." },
        { choice: 2, why: "Aliases ARE universally legal in ORDER BY — that's the clause where they're safe. Overgeneralizing that rule to GROUP BY is the bug, not the rule itself." },
      ],
      difficulty: "medium",
    },
    {
      id: "ms-mcq-28",
      prompt: "Billings LEFT-JOINed to receipts print 33 rows (5 split billings carry 2 receipt rows). What does SUM(i.amount_cents) / 100.0 over that join print?",
      choices: [
        "86977.00 — the book's honest billed total",
        "86052.00 — the ledger's posted revenue fold",
        "111917.00 — the 24940.00 of split billings counted twice",
        "65612.00 — the exact-coverage total",
      ],
      answer: 2,
      why: "The join's grain is receipt rows: the five split billings (4860.00 + 5284.00 + 4723.00 + 5614.00 + 4459.00 = 24940.00) contribute a second billed row each, so the fold prints 86977.00 + 24940.00 = 111917.00. Pre-aggregate receipts to billing grain before joining, or the billed total lies by exactly the split amount.",
      notes: [
        { choice: 0, why: "That's SUM over the 28-billing base — true only before the join. The fan-out is the whole point: joins decide grain, and the fold follows the join." },
        { choice: 1, why: "86052.00 is the ledger's revenue fold — which excludes the 925.00 void. Quoting a third number from a fourth grain is how close meetings start arguing about which book is 'the' book." },
      ],
      difficulty: "hard",
    },
    {
      id: "ms-mcq-29",
      prompt: "How many billings on this book have EVER received a dollar?",
      choices: [
        "27 — one per receipt row",
        "28 — the whole book eventually settles",
        "22 — 21 exact-coverage billings plus the 4000.00-of-6148.00 partial",
        "21 — the paid-status count",
      ],
      answer: 2,
      why: "COUNT(DISTINCT i.id) over the join: 21 exact billings plus the open partial that took a 4000.00 receipt = 22 relationships with receipt evidence. The 33-row join, 27 receipt rows, and 22 distinct billings are three different counts — this is the only one that answers 'ever received'.",
      notes: [
        { choice: 0, why: "27 is receipt ROWS — five split billings contribute two each, so rows overcount relationships by exactly five." },
        { choice: 3, why: "21 is status-paid, but one paid billing (1756.00) has no receipt while one VOID billing received its 925.00 — status claims and receipt evidence disagree in both directions." },
      ],
      difficulty: "hard",
    },
    {
      id: "ms-mcq-30",
      prompt: "Close night, one query: count the void billings that drew a receipt AND the paid billings with none. Which shape returns both arms in one pass?",
      choices: [
        "Two queries UNIONed on the billing id",
        "COUNT(*) FILTER (WHERE status='void' AND p.id IS NOT NULL) and COUNT(*) FILTER (WHERE status='paid' AND p.id IS NULL) over one LEFT JOIN",
        "GROUP BY status and read the two counts off the fold",
        "A CASE pivot over payments only",
      ],
      answer: 1,
      why: "FILTER (WHERE …) counts conditional arms on the same join: the void-but-received arm catches 925.00, the paid-no-receipt arm catches 1756.00. One join, one pass, both breaks — and each arm's predicate IS the definition, so the counts route themselves.",
      notes: [
        { choice: 0, why: "UNION of two queries rebuilds the join twice and invites drift — close night's five ad-hoc queries are exactly how the two arms stop agreeing on the definition." },
        { choice: 2, why: "GROUP BY status folds every billing into its claim state — it can never test receipt presence against status, which is the entire question. The break lives in the PAIR, not the status." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-ms-1",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The household book board",
      brief:
        "Morgan Stanley-flavored memo on the storefront db (invoices = client fee billings, customers = client households): the growth review wants the advisor-book board — every billing-carrying household ranked by billing frequency within its booking market, lifetime billed beside each name. The desk is explicit about the tie: 'frequencies tie all the time on a wealth book — the board shows the tie, and the tie policy is a decision someone signs.' Probed facts: the book holds **28 billings**; the busiest household carries **24** booked flows for **7262.35**; the 3000-plus tier holds **63.5%** of booked value. Markets rank independently — a household is rung 1 of its market, not of the planet.",
      ask: "Return the board: household, market, billing count, lifetime billed (2dp), book rank — ties sharing rungs, most billings first.",
      template:
        "SELECT c.name,\n       c.region AS market,\n       COUNT(*) AS billings,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS lifetime_billed,\n       {1}() OVER (PARTITION BY c.{2} ORDER BY COUNT(*) {3}) AS book_rank\nFROM invoices i\nJOIN customers c ON c.id = i.{4}\nGROUP BY i.customer_id\nORDER BY market, book_rank;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie-sharing rank",
          why: "RANK gives tied frequencies the same rung and skips the next — two households at two billings both show rung 3. ROW_NUMBER would hand the rung to one of them by plan order and the board would look authoritative while being arbitrary.",
        },
        {
          answer: "region",
          kind: "keyword",
          label: "the market partition",
          why: "PARTITION BY c.region restarts the rank per booking market — every market gets its own rung 1. Partition by name or id and each household becomes its own board, all reading rank 1.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the frequency order",
          why: "DESC ranks most-billing households first within each market — the board reads top-down by relationship activity. ASC inverts it and hands rung 1 to the quietest book on the desk.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the household key",
          why: "The join runs on c.id = i.customer_id: every billing attaches to its billing household. Joining on row id pairs billings with whichever household shares the number — a different book entirely.",
        },
      ],
      distractors: ["ROW_NUMBER", "DENSE_RANK", "ASC", "id", "name"],
      walkthrough:
        "A book board is a fold, a partition, and a tie policy — in that order. The join attaches each of the 28 billings to its household; GROUP BY i.customer_id folds per household (COUNT(*) as billing frequency, SUM(amount_cents)/100.0 as lifetime billed riding beside); PARTITION BY c.region makes each market's board independent; RANK() OVER (ORDER BY COUNT(*) DESC) numbers them with ties sharing rungs — the desk's stated policy, and frequency ties are real on this book: two EU households sit at two billings and two more at one, so rungs 3 and 5 are each shared. Lifetime billed is deliberately NOT in the window's ORDER BY — the tie is the board's point, and the value column is context, not a silent tiebreaker that would fake uniqueness. The distractors all break it honestly: ROW_NUMBER breaks the tie arbitrarily (3, 4, 5 — a different board the desk didn't ask for), DENSE_RANK renumbers rungs consecutively (a tier ladder, not a placement), ASC inverts the frequency order, partitioning by name or id makes every household its own rung-1 board, and the wrong join key pairs billings with strangers. The habit being graded: ties are a policy decision, the partition is the board's boundary, and the rank function you pick is the tie policy you ship.",
    },
    {
      id: "cs-ms-2",
      tier: "easy",
      topic: "j5",
      universe: "month-close",
      title: "The fee-receivable watchlist",
      brief:
        "Morgan Stanley-flavored memo on the storefront db (receipts = fee receipts, billings = fee billings): the collections sit-down opens on the fee-receivable watchlist — every billing with NO receipt row at all, biggest first, so the desk works the biggest exposures first. Probed facts: the watch carries **6 billings / 15217.00** against flat 30-day terms (min 30, max 30 — terms are a definition here, not a distribution). One member is awkward on purpose: a **1756.00** paid-status billing with no receipt anywhere rides the list, which is exactly why membership is evidence, not the status column.",
      ask: "Return the watchlist: billing reference, status, billed dollars (2dp) — biggest exposure first.",
      template:
        "SELECT i.{1} AS billing_ref,\n       i.status AS state,\n       ROUND(i.amount_cents / 100.0, 2) AS billed\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.{2}\nWHERE p.id IS NULL\nORDER BY billed {3};",
      slots: [
        {
          answer: "number",
          kind: "keyword",
          label: "the billing reference",
          why: "i.number is the human-facing billing reference the desk works from. An id prints a number nobody can act on, and status duplicates the state column beside it.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the join key (billing side)",
          why: "The anti-join keys on p.invoice_id = i.id — a receipt points at its billing's primary key. Joining on anything else pairs receipts with strangers or empties the join, and the IS NULL test stops meaning 'never received'.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the exposure order",
          why: "DESC headlines the biggest exposure — the desk works top-down. ASC opens on the smallest and the meeting burns its hour on the wrong rows.",
        },
      ],
      distractors: ["id", "status", "customer_id", "ASC"],
      walkthrough:
        "A watchlist is an anti-join with an opinion about order. FROM invoices LEFT JOIN payments ON p.invoice_id = i.id keeps every billing and attaches whatever receipts exist; WHERE p.id IS NULL keeps exactly the billings where no receipt matched — the definition of never-received, 6 billings carrying 15217.00. The LEFT JOIN is load-bearing: an inner join would drop the very rows the meeting is about, because billings without receipts match nothing. ORDER BY billed DESC is the working order — biggest exposure first. The result's membership is the lesson: a paid-status billing at 1756.00 sits on the list because status is a claim and the receipt census is evidence, while an open billing with a 4000.00 partial against 6148.00 stays off because it has evidence. The distractors fail honestly: joining on id pairs receipts to same-numbered billings and silently shrinks the watch, customer_id isn't a payments column, status duplicates the state column, and ASC turns the desk's hour into a bottom-up crawl. The habit being graded: the IS NULL arm IS the definition, and the order is part of the deliverable.",
    },
    {
      id: "cs-ms-3",
      tier: "hard",
      topic: "t7",
      universe: "month-close",
      title: "The billing-trend walk",
      brief:
        "Morgan Stanley-flavored memo on the storefront db (invoices = client fee billings): the platform review wants the billing-trend walk — monthly billed dollars with the month-over-month delta beside each bucket, so the close can defend the peaks before the CFO finds them. Probed facts: the book bills across **13 monthly buckets, 2024-02 through 2025-02**; the walk peaks at **11085.00 in 2025-01 (+2255.00 MoM)** and drops **-2973.00** into February. The first bucket's delta prints **NULL** — no prior month exists, and the desk reads that NULL as the definition, never as a zero. The walk is one fold with a LAG inside it; every number in the delta column must trace to the bucket beside it.",
      ask: "Return the walk: month, billed (2dp), prev_billed (2dp), mom_delta (2dp) — chronological, first bucket's delta NULL.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR({1}, 1, 7) AS month,\n         SUM(amount_cents) AS cents\n  FROM invoices\n  GROUP BY month\n),\nlagged AS (\n  SELECT month, cents,\n         {2}(cents) OVER ({3} month) AS prev_cents\n  FROM monthly\n)\nSELECT month,\n       ROUND(cents / 100.0, 2) AS billed,\n       ROUND(prev_cents / 100.0, 2) AS prev_billed,\n       ROUND((cents - prev_cents) / 100.0, 2) AS mom_delta\nFROM lagged\nORDER BY {4};",
      slots: [
        {
          answer: "issued_on",
          kind: "keyword",
          label: "the billing date column",
          why: "The walk buckets by when the fee was ISSUED — invoices.issued_on. Bucket by anything else (due_on is the payment window, not the billing event) and the calendar the CFO defends is a different book.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the previous-bucket anchor",
          why: "LAG(cents) carries the prior month's fold into the current row — one pass, no self-join. LEAD points the wrong way (the delta would describe the FUTURE month), and ROW_NUMBER takes no argument at all.",
        },
        {
          answer: "ORDER BY",
          kind: "keyword",
          label: "the walk's chronology inside OVER",
          why: "LAG needs to know which row is 'previous' — OVER (ORDER BY month) defines it. PARTITION BY month would isolate every month into its own partition, making every prev_cents NULL and every delta NULL with it.",
        },
        {
          answer: "month",
          kind: "keyword",
          label: "the print order",
          why: "The walk reads chronologically: ORDER BY month. Order by cents and the walk scrambles into a value leaderboard — the trend, the thing the review is defending, stops existing as a shape.",
        },
      ],
      distractors: ["LEAD", "ROW_NUMBER", "PARTITION BY", "paid_on", "cents"],
      walkthrough:
        "A trend walk is a fold, a chronology, and a NULL policy — in that order. The monthly CTE buckets 28 billings into 13 months by SUBSTR(issued_on, 1, 7); the lagged CTE carries LAG(cents) OVER (ORDER BY month) so each row holds its predecessor; the outer SELECT converts cents at the /100.0 edge and prints billed, prev_billed, mom_delta. The numbers to quote: the walk opens 2024-02 at 7003.00 with a NULL delta (no prior month — the definition, not a zero), peaks 2025-01 at 11085.00 (+2255.00 MoM), and gives back -2973.00 into 2025-02. The distractors all break it honestly: LEAD points the window the other way so every delta describes the future; ROW_NUMBER(cents) is an argument-count error — ranking functions take no fold; PARTITION BY month strands every month alone, NULLing the entire delta column; paid_on isn't an invoices column (it lives on payments); and ordering the print by cents turns the walk into a leaderboard. The habit being graded: the anchor clause inside OVER is the definition of 'previous', and the NULL head row is the walk's proof it isn't faked.",
    },
    {
      id: "cs-ms-4",
      tier: "easy",
      topic: "j4",
      universe: "fraud",
      title: "The split-plan receipt census",
      brief:
        "Morgan Stanley-flavored memo on the storefront db (payments = fee receipts, invoices = fee billings): the fraud spot-check opens on the receipt census — every billing beside its receipt evidence, no-receipt rows KEPT in the print, because the census is where double-counting and phantom claims show up first. Probed facts: **28 billings** carry **27 receipt rows**; **five split-plan billings (refs 1, 5, 12, 19, 22) carry two receipt rows each** — 4860.00, 5284.00, 4723.00, 5614.00, 4459.00; the partial **INV-2025-025** prints received 4000.00 against billed 6148.00; six billings keep their row with zero receipts. The void-but-received **925.00** shows up honestly in this census: state void, receipt_rows 1 — evidence, printed.",
      ask: "Return the census: billing ref, state, receipt rows, received (2dp), billed (2dp) — biggest receipts first.",
      template:
        "SELECT i.number AS billing_ref,\n       i.status AS state,\n       COUNT(p.id) AS receipt_rows,\n       ROUND(COALESCE({1}(p.amount_cents), 0) / 100.0, 2) AS received,\n       ROUND(i.amount_cents / 100.0, 2) AS billed\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.{2}\nGROUP BY i.{3}\nORDER BY received {4};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the receipts fold",
          why: "Received means dollars — SUM(p.amount_cents) per billing. COUNT would print row tallies as dollars, MAX would print only the biggest receipt and hide the 4000.00+1615.00-style splits that are the census's whole point.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the join key (billing side)",
          why: "A receipt points at its billing's primary key: p.invoice_id = i.id. Join on anything else and receipts attach to strangers — or, on a text key like number, to nothing at all, and every census number collapses to zero.",
        },
        {
          answer: "number",
          kind: "keyword",
          label: "the census grain",
          why: "GROUP BY i.number is one row per billing — the grain the desk reads refs from. Group by i.status and 28 billings fold into 3 claim states, erasing the per-billing evidence the spot-check exists to print.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the review order",
          why: "DESC headlines the biggest receipts — the fraud sweep works top-down. ASC opens on the 0.00 no-receipt rows and burns the review's first minutes on the emptiest evidence.",
        },
      ],
      distractors: ["COUNT", "MAX", "amount_cents", "status", "method", "ASC"],
      walkthrough:
        "A census is a LEFT JOIN that refuses to drop the empty rows. FROM invoices LEFT JOIN payments ON p.invoice_id = i.id keeps all 28 billings and attaches their receipts; GROUP BY i.number folds one row per billing; COUNT(p.id) reads 0, 1, or 2 — and the 2s are exactly the five split-plan billings (refs 1, 5, 12, 19, 22), the fan-out that makes naive joins double-count; COALESCE(SUM(p.amount_cents), 0) prints 0.00 for the six no-receipt billings instead of a NULL that downstream folds would choke on. The money rows to name: the partial INV-2025-025 prints received 4000.00 against billed 6148.00 — open AND partially received, evidence in two tables; the void-but-received 925.00 prints state void, receipt_rows 1 — the fraud read that no status-only report can produce. The distractors fail honestly: COUNT as the dollar fold prints tallies where dollars belong, MAX hides all but the biggest receipt, amount_cents in the join or the grain pairs receipts with numbers or folds by amount, status re-folds the census into three claims, method isn't an invoices column, and ASC reverses the review order. The habit being graded: keep the empty rows on purpose, count evidence at the grain you print.",
    },
    {
      id: "cs-ms-5",
      tier: "medium",
      topic: "s6",
      universe: "refund-audit",
      title: "The coverage census",
      brief:
        "Morgan Stanley-flavored memo on the storefront db (billings = fee billings, receipts = fee receipts): the refund-adjacent audit wants the coverage census — every billing classified by what its receipts actually prove: **exact** (receipts equal billed), **partial** (receipts under billed), **no receipt** (nothing ever matched). Probed facts: **21 exact / 65612.00**, **1 partial — 4000.00 of 6148.00**, **6 no receipt / 15217.00**. The census is evidence across two tables, never a status string: the open-status census (6 / 19609.00) and this no-receipt class (6 / 15217.00) share a count and not a single member, because one open billing took a partial and one paid-status billing has no receipt at all.",
      ask: "Return the census: coverage class, billings, billed (2dp) — biggest class first.",
      template:
        "WITH per_billing AS (\n  SELECT i.id,\n         i.status,\n         i.amount_cents,\n         SUM(p.amount_cents) AS received\n  FROM invoices i\n  LEFT JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n)\nSELECT CASE\n         WHEN received IS NULL THEN {1}\n         WHEN received < amount_cents THEN {2}\n         ELSE {3}\n       END AS coverage,\n       COUNT(*) AS billings,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS billed\nFROM per_billing\nGROUP BY {4}\nORDER BY billed DESC;",
      slots: [
        {
          answer: "'no receipt'",
          kind: "keyword",
          label: "the empty-evidence arm",
          why: "received IS NULL is the LEFT JOIN's signature for 'no receipt row ever matched' — the 6-billing / 15217.00 watch. This arm MUST come first: for these rows, received < amount_cents is NULL-unknown and would fall through to ELSE, mislabeling the watch as exact.",
        },
        {
          answer: "'partial'",
          kind: "keyword",
          label: "the under-received arm",
          why: "received < amount_cents catches the billing whose receipts started but didn't finish — the single 4000.00-of-6148.00 row. This is the census's interesting member: open AND received, invisible to any status-only read.",
        },
        {
          answer: "'exact'",
          kind: "keyword",
          label: "the settled arm",
          why: "ELSE covers receipts equal to billed — the 21 exact billings / 65612.00 (including the void-but-received 925.00, whose evidence is real even though its claim is cancelled). ELSE is the honest default because NULL comparisons never land here by accident.",
        },
        {
          answer: "coverage",
          kind: "keyword",
          label: "the class fold",
          why: "GROUP BY coverage folds the CASE's output into three classes. Group by received and every distinct receipt value becomes its own class — 20 rows of singleton buckets that the audit can't quote; group by status and the census counts claims, not evidence.",
        },
      ],
      distractors: ["'paid'", "'open'", "received", "status"],
      walkthrough:
        "A census is a fold at the right grain, then a CASE whose arm order IS the definition. Stage one: the per_billing CTE folds receipts to billing grain — LEFT JOIN keeps all 28 billings, SUM(p.amount_cents) is NULL exactly where no receipt matched, and GROUP BY i.id keeps the fold honest at one row per billing (the 27 receipt rows over 22 receiving billings collapse correctly, splits included). Stage two: the CASE reads evidence — received IS NULL is 'no receipt' and MUST be first, because received < amount_cents is unknown for those rows and would silently drop them into ELSE; received < amount_cents is 'partial' (the lone 4000.00-of-6148.00); ELSE is 'exact' (21 billings / 65612.00). Fold by coverage and the census prints 21 / 65612.00, 6 / 15217.00, 1 / 6148.00. The distractors mislabel with claim states ('paid', 'open' — statuses, not evidence), or break the fold (received as a class key scatters the census into singleton value buckets; status re-folds by claim and the audit is counting assertions again). The habit being graded: arm order encodes NULL semantics, and the class you print is only as honest as the grain you folded.",
    },
    {
      id: "cs-ms-6",
      tier: "hard",
      topic: "q2",
      universe: "growth",
      title: "The above-average book",
      brief:
        "Morgan Stanley-flavored memo on the storefront db (invoices = client fee billings, customers = client households): the growth review wants the households whose lifetime billed beats the book's AVERAGE BILLING — not the average household, a denominator trap the review probes deliberately. Probed facts: 28 billings worth **86977.00**, average billing **3106.32**; **eight households** clear that line; the board takes the **top four** — Alice Chen (EU, 5 billings, 26629.00), Emma Wilson (US, 4, 13384.00), Maya Patel (APAC, 4, 11542.00), Grace Kim (APAC, 3, 9071.00). The benchmark lives in a scalar subquery so it is computed once, printed nowhere twice, and argued by nobody.",
      ask: "Return the board: household, market, billings, lifetime_billed (2dp) — the top four above-average relationships, biggest first.",
      template:
        "SELECT c.name AS household,\n       c.region AS market,\n       COUNT(*) AS billings,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS lifetime_billed\nFROM invoices i\nJOIN customers c ON c.{1} = i.customer_id\nGROUP BY i.{2}\nHAVING SUM(i.amount_cents) / 100.0 >\n       (SELECT {3}(amount_cents) / 100.0 FROM invoices)\nORDER BY lifetime_billed {4}\nLIMIT {5};",
      slots: [
        {
          answer: "id",
          kind: "keyword",
          label: "the household key",
          why: "The join runs c.id = i.customer_id: every billing attaches to its billing household. Join on c.name or c.region and the equality compares text to an integer id — no match, no board, and the empty deck looks like a quiet book.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the relationship grain",
          why: "GROUP BY i.customer_id folds one row per household — the relationship grain the advisor conversation runs on. Fold by i.status and the board counts claim states; fold by i.amount_cents and every distinct billing becomes its own 'household'.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the benchmark function",
          why: "The review said average billing: AVG(amount_cents) / 100.0 = 3106.32. SUM would raise the bar to 86977.00 and clear nobody; the average HOUSEHOLD (7907.00) is a different benchmark that cuts the board differently — the denominator is the ask.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the board order",
          why: "DESC prints the biggest relationship first — Alice Chen at 26629.00 tops the deck. ASC opens the board on the smallest above-average household and the growth review reads it upside down.",
        },
        {
          answer: "4",
          kind: "number",
          label: "the board cap",
          why: "The review takes the top four above-average relationships — LIMIT 4 after the ORDER BY, so the cap is deterministic. Eight households clear the 3106.32 line; the cap decides how many the deck carries.",
        },
      ],
      distractors: ["region", "name", "SUM", "due_on", "ASC", "3"],
      walkthrough:
        "An above-average board is a fold, a benchmark computed once, and a cap that means something. The join attaches each of the 28 billings to its household (c.id = i.customer_id); GROUP BY i.customer_id folds per relationship — COUNT(*) as billings, SUM(amount_cents)/100.0 as lifetime billed; the scalar subquery (SELECT AVG(amount_cents) / 100.0 FROM invoices) computes the book benchmark exactly once — 3106.32 over 28 billings worth 86977.00 — and HAVING keeps the eight households whose lifetime billed clears it; ORDER BY lifetime_billed DESC then LIMIT 4 prints the top four: Alice Chen 26629.00, Emma Wilson 13384.00, Maya Patel 11542.00, Grace Kim 9071.00. The traps are all in the distractors: c.region or c.name compares text to an id and empties the board; SUM as the benchmark raises the bar to 86977.00 — a bar nobody clears — and the deck reads as churn; grouping on i.due_on re-folds the book by payment window, a different relationship model entirely; ASC inverts the board; LIMIT 3 truncates Grace Kim and the review argues over a household that exists but isn't printed. The habit being graded: the benchmark is a named constant with a stated grain, and every denominator on the board — average billing, not average household — is the ask.",
    },
  ],

  problems: [
    { slug: "employee-bonus", why: "LEFT JOIN a bonus onto the base and keep the NULLs: the advisor-book rollup shape — households with no receipt row are the watch, and this drill keeps them visible." },
    { slug: "top-travellers", why: "Fold value per relationship and rank the top of the book: the lifetime-billed board the advisor conversation actually runs on." },
    { slug: "bank-account-summary-ii", why: "Balance-and-count summary per account: the household snapshot card — billed, received, outstanding in one fold, exactly the desk's weekly read." },
    { slug: "weather-type-in-each-country", why: "CASE classification per group: the billing-state ladder — which market prints which state mix, one conditional fold at a time." },
    { slug: "customer-order-frequency", why: "HAVING-gated frequency per relationship: which households bill often enough to matter — the book board's gate in textbook form." },
    { slug: "immediate-food-delivery-iii", why: "Monthly promised-versus-actual shares: the settled-versus-billed cadence by month — a conditional fold whose denominator is ALL billings." },
    { slug: "portfolio-weights", why: "Each position's share of the book via window sums: the household-weight read — 63.5% over the 3000 line is this drill's business question." },
    { slug: "portfolio-concentration-hhi", why: "Concentration index over folded value: how thin the wealth book's base really is, computed the way the risk committee quotes it." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share of distinct relationships per group: the market-penetration fold — distinct households over the book, percentage arithmetic done honestly." },
    { slug: "maximum-transaction-each-day", why: "Peak activity per day via a window fold: the flows-desk morning read — the day's biggest movement, every day, one query." },
    { slug: "second-highest-salary", why: "Second-largest value under NULL traps: the second-biggest relationship read — the classic NULL-when-no-second case the desk actually hits." },
    { slug: "top-earners", why: "Top earners by value with tie handling: the fee-contributor board — RANK versus ROW_NUMBER as a tie policy, drilled on a leaderboard." },
    { slug: "the-category-of-each-member-in-the-store", why: "Tier classification over folded spend: the fee-tier ladder — which band a household lands in decides the invoice, so the boundary operator is the dispute." },
    { slug: "customer-purchasing-behavior-analysis", why: "Spend-tier bands over lifetime value: the household-band read the fee schedule prices against — tiers are definitions someone owns." },
    { slug: "risk-based-pricing", why: "Band join between value and schedule ranges: risk-based fee assignment in SQL — the boundary join where tier disputes are settled." },
    { slug: "product-price-at-a-given-date", why: "The price that WAS live at event time, not today's: as-of logic is exactly how fee-schedule disputes are proved at the desk." },
    { slug: "combine-two-tables", why: "LEFT JOIN the household card onto the base and keep the NULLs: billings with no receipt still owe the desk a row — the LEFT JOIN reflex behind every census this kit runs." },
    { slug: "customers-who-never-order", why: "The anti-join that proves a negative: households with zero billings — this book carries none, and the drill is proving that with evidence instead of assuming it." },
    { slug: "sales-person", why: "Counts that must survive NULLs across a join: sales with zero orders maps to advisors with zero split-plan billings — the census shape the fraud spot-check reads weekly." },
    { slug: "rank-scores", why: "RANK over folded scores with shared rungs: the book board's tie policy, drilled on a leaderboard where ties are visible and the next rank skips." },
    { slug: "find-the-team-size", why: "COUNT(*) OVER (PARTITION BY …): the market book-size column that rides beside every household row — each relationship labeled with the size of the book it competes in." },
    { slug: "project-employees-iii", why: "Windows over joins without losing the outer row: receipt evidence beside each billing, window-style — the census and the rank in one pass." },
    { slug: "confirmation-rate", why: "COALESCE-guarded rates across a LEFT JOIN: the receipt-rate read where a missing receipt must print as zero evidence, not vanish from the denominator." },
    { slug: "average-salary-of-departments", why: "Group fold versus global benchmark: the household-versus-book-average compare — exactly the scalar-subquery shape the above-average board runs on." },
    { slug: "managers-with-at-least-5-direct-reports", why: "HAVING against a subquery benchmark: the minimum-scale gate the advisor-team boards carry — folds that clear a line computed from the same book." },
    { slug: "department-highest-salary", why: "Argmax per group via subquery or window: the biggest billing per booking market, ties and all — the desk's top-of-market read in textbook form." },
    { slug: "count-salary-categories", why: "CASE/UNION ALL buckets including the empty ones: the coverage census shaped so no class silently disappears — zero-bucket discipline the close deck lives by." },
    { slug: "monthly-transactions-i", why: "Month buckets with SUBSTR keys and state filters: the billing-calendar fold behind the trend walk — 13 buckets, states preserved, denominators stated." },
    { slug: "the-latest-login-in-2020", why: "SUBSTR-based period filters with type care: the 'billings issued in window' screens the month-close runs — string keys sliced honestly." },
    { slug: "capital-gain-loss", why: "CASE WHEN money math over per-position folds: realized-versus-billed arithmetic the wealth book runs daily, cents handled as cents until the edge." },
    { slug: "nth-highest-salary", why: "OFFSET into a sorted fold: the second-largest billing read — NULL when the rung doesn't exist, exactly like the desk's second-biggest relationship question." },
    { slug: "restaurant-growth", why: "7-day ROWS frames over dated receipts: the rolling receipt census the platform review reads every Monday — the frame written out loud, not defaulted." },
  ],
};
