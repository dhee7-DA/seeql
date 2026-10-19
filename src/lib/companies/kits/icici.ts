// ICICI Bank — kit 14 of the Banking & Capital Markets domain (Batch L, wave 7).
// India's private bank: retail, cards, UPI-scale flows — where the retail book
// moves on two rails (the card retail rail and the interbank wire rail),
// branches carry their own cost lines, and settlement hygiene is an audit
// trail: a status column is a claim, a rail hit is evidence. The storefront db
// maps on honestly: invoices are client fee billings (statement cycles, card
// annual fees, loan notices — the receivables the branch books carry),
// payments are settlement legs (method card / wire), ledger_entries is the
// double-entry book of record (the branch audit trail), expenses are
// branch-and-ops opex lines, customers are clients across four circle books
// (EU / US / APAC / LATAM standing in for the circle network), orders are
// booked fee events (REAL dollars — the one table where money is already
// dollars), products are account and card products. Money in
// invoices/payments/expenses/ledger is INTEGER cents — the dollar read is
// always amount_cents / 100.0.
// Pool provenance: ICICI has 0 tagged sql rows in the band (checked
// company-pools.md for icici / ICICI variants) — 0 tagged LC — theme-curated:
// every topic and problem slug is curated from the theme menu to ICICI's known
// question families (circle-book folds, card-portfolio health, coverage
// censuses, rails, branch audit trails, settlement hygiene), provenance
// stated per problem.
// Case figures: scripts/company-facts.md (probed 2026-10-12), case cells
// re-probed against db/custom.db (read-only) before authoring.
// 3x expansion (Task 95, append-only): brief 4->6, dayInLife 3->4, metrics
// 8->12, topics 10->15, theory icici-t9..t24, mcqs icici-mcq-11..30, cases
// cs-icici-3..6 (topics s6 / t7 / q6 / j7 — all distinct from the kit's existing
// j5 + x3 and pairwise distinct), problems 16->32. Pool provenance unchanged:
// 0 tagged sql rows for icici — all new topics/problem slugs theme-curated from
// company-pools.md. New case figures re-probed against db/custom.db before
// authoring (per-circle state board, monthly opex walk, first-settlement clock,
// product-line revenue board).

import type { CompanyKit } from "../types";

export const iciciKit: CompanyKit = {
  id: "icici",
  domainId: "banking",
  name: "ICICI Bank",
  tagline: "India's private bank: retail, cards, UPI-scale flows",
  accent: "text-rose-300",

  brief: [
    "**ICICI Bank** is India's private bank — retail banking at India scale, where card portfolios, UPI-scale payment flows and a branch network's cost lines all land in one warehouse. On this training db the mapping is honest: `orders` are booked fee events (REAL dollars — the one table where money is already dollars), clients sit across four {sky:circle books}, and every fee the retail engine bills — statement cycle, card annual fee, loan notice — lands as a receivable. Probed scale: **103 booked fee events worth 34833.28**, the busiest household holding **24 events for 7262.35**, with the circles reading EU 45 events / 15089.23, APAC 37 / 11605.45, US 19 / 7286.16, LATAM 2 / 852.44.",
    "The money tables are where ICICI screens live, and they are integer cents — the dollar read is always `amount_cents / 100.0`. Invoices carry the fee billings: 21 paid for 66443.00, 6 open at 19609.00, 1 void at 925.00. Payments are the settlement legs that clear them on two rails — {emerald:card}, the retail card rail (16 legs for 37364.00), and {sky:wire}, the interbank rail (11 legs for 32248.00) — and five billings were settled on split plans that cross both rails. The ledger is the branch audit trail: **181080.00 debits against 181080.00 credits across 80 entries, delta 0**. *A circle number that can't tie back to the books is a rumor, not a read.*",
    "The SQL screens are settlement-hygiene screens. A warm-up per-circle fold, then the two questions the audit culture is famous for: the {emerald:coverage census} — 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 none (15217.00) — where membership is rail evidence, not the status column, and the {rose:anomaly pair} — a void billing that still drew its **925.00** rail hit, and a paid-status billing at **1756.00** with no rail hit at all. Follow-ups probe the denominator ('open-status or no-leg — which six?') and the fan-out ('leg count or billing count — one billing can take two rail hits').",
    "Prep the way the screens run. Drill conditional folds and `FILTER (WHERE …)` censuses, strftime month buckets across the 2024-01 to 2025-02 window, the branch cost reads (Rent at 14 lines / **16800.00**, monthly opex peaking **3210.00** in 2024-08), and the settlement clock — billings average **28.4 days** to first settlement, fastest 13, slowest 84, against flat 30-day terms. Then practice the sentence that gets hired at a house that clears UPI-scale flow: *same product, different circle — the definition travels, the evidence stays local, and every census names its denominator.*",
    "Depth two — the portfolio reads. The product-line board folds fee revenue by `products.category`: **Audio's 97 units for 11744.01** leads the book and Wearables' 53 units for 6929.12 follows, while Accessories touches the most fee events (**54**) on the smallest dollars (3294.29) — attach and value are different claims, and the cross-sell review exists to argue about the gap. The AOV spread sets the per-circle bar: **338.19** network-wide, with US at 383.48 and LATAM at 426.22 clearing it while EU (335.32) and APAC (313.66) sit under — and LATAM's beat rides a two-event book, the sample-size caveat every board memo carries. {rose:Concentration} closes the read: **63.5%** of booked value sits in households over 3000.00, 71.2% over the 2000.00 line.",
    "Depth three — the KPI definitions the desks drill before they drill SQL. A {sky:rail-level success rate} is cleared legs over attempted legs *per rail* — card 16 legs, wire 11 — never pooled, because the five split billings ride both rails and pooling hides the 27-into-22 squeeze. {violet:EMI amortization} is a recursive schedule: level payment, interest split off the declining balance, a zero-guard at payoff. The {amber:KYC-dropoff funnel} counts distinct clients per stage from a staged one-row-per-client CTE, and {emerald:delinquency buckets} age the no-leg book against a pinned reference date. *Definitions travel across circles; evidence stays local — that is the sentence this bank hires on.*",
  ],

  dayInLife: [
    "**08:15 —** the circle proof before the branch calls. First query proves the ledger — **181080.00 against 181080.00, delta 0** across 80 entries — then the rail census: card **16 legs / 37364.00**, wire 11 / 32248.00, cross-footed to the cash book's 69612.00 debit fold. The break list pairs state with evidence: one void billing that still drew **925.00**, one paid-status billing with no rail hit at **1756.00**. The branch heads dial in at 08:45; the books tie before they do.",
    "**11:30 —** deep work: the collections worklist, cut per circle. Billings `LEFT JOIN`ed to their settlement legs, the no-leg six isolated — **EU 4 / 8524.00, US 1 / 4937.00, APAC 1 / 1756.00** — with the APAC row being the paid-status billing whose trail shows no leg ever moved. LATAM's book prints nothing at all, and the instinct being trained is that {rose:absence is not zero} — a clean circle prints no row, and the worklist counts *billings*, never leg rows, because the five cross-rail splits would double-count exactly the billings worth arguing about.",
    "**16:45 —** circle review prep and the EOD writeup. The pack ships three reads with definitions attached: card-portfolio health against the rail census, the opex calendar (Rent at 14 lines / **16800.00**, the 3210.00 peak in 2024-08), and the settlement clock — **28.4 days** average against flat 30-day terms, fastest 13, slowest 84. Tomorrow's ask is queued for the audit-trail board: the paid-unmoved **1756.00**, waiting on the source system's own explanation. *The review doesn't argue with evidence; it argues with definitions — so the definitions go in writing.*",
    "**19:10 —** the EOD writeup and tomorrow's staging. The settlement-clock board ships: **20 settled billings averaging 28.4 days** against flat 30-day terms, fastest 13, slowest 84 — and the per-circle cut is queued as a staged CTE (first leg per billing, then the fold) so the split billings weight their circle once, not twice. The ledger proof re-runs one last time — **181080.00 against 181080.00, delta 0** — and the concentration read (63.5% of value in the 3000.00-plus households) goes into the risk pack. *Close the day the way the close runs: definitions in writing, evidence tied, tomorrow's query already staged.*",
  ],

  metrics: [
    { name: "Booked fee events by circle", what: "Fee events with value per circle book — EU 45 / 15089.23, APAC 37 / 11605.45, US 19 / 7286.16, LATAM 2 / 852.44. The footprint view every retail read starts from." },
    { name: "Billing-state mix", what: "Fee billings by state — 21 paid / 66443.00, 6 open / 19609.00, 1 void / 925.00. The circle total is believed only after the split reproduces it." },
    { name: "Coverage census", what: "Billings by settlement coverage — 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 none (15217.00). Membership is rail evidence (folded legs vs billed), never the status column." },
    { name: "Rail mix", what: "Settlement legs per rail — card 16 / 37364.00 (retail card rail), wire 11 / 32248.00 (interbank). 27 legs fold onto 22 billings: the five splits cross rails, so only the total shows the squeeze." },
    { name: "Books proof delta", what: "Total debits minus total credits across the ledger — 181080.00 against 181080.00, delta 0 across 80 entries. A nonzero delta pages the close, not a footnote." },
    { name: "Anomaly pair watch", what: "The two breaks every audit review opens with: void-but-drawn (925.00) and paid-with-no-leg (1756.00). State paired with rail evidence, quantified in dollars, routed — never deleted." },
    { name: "Branch cost lines", what: "Branch-and-ops spend by category and month — Rent 14 lines / 16800.00 (the branch leases), Ads 14 / 4570.00, monthly opex peaking 3210.00 in 2024-08, biggest single line 1680.00. The cost read behind every branch conversation." },
    { name: "Settlement lag", what: "Days from billing to first settlement on settled billings — 20 billings, 28.4 days average, fastest 13, slowest 84, against flat 30-day terms. The collections tempo, per circle." },
    { name: "Fee-event state mix", what: "Booked fee events by lifecycle state — 52 {emerald:settled} / 30 in-flight / 14 awaiting / 7 {rose:lost}, a **50.5%** settled share. The funnel view behind every onboarding read; US is the one circle where in-flight (10) outruns settled (5)." },
    { name: "Product-line fee revenue", what: "Fee revenue folded by `products.category` — Audio 97 units / 11744.01, Wearables 53 / 6929.12, Video 61 / 5198.41. Accessories touches the most fee events (54) on the smallest dollars (3294.29): attach and value are different KPIs, and the board ships both." },
    { name: "Circle fee-event AOV", what: "Average booked fee event per circle against the **338.19** network mean — US 383.48 and LATAM 426.22 clear it; EU 335.32 and APAC 313.66 sit under. LATAM's beat rides a two-event book; the caveat ships with the number, every time." },
    { name: "Household concentration", what: "Share of booked value from the top households — **63.5%** from those over 3000.00 lifetime, 71.2% over the 2000.00 line. The whale-dependency read the risk review quotes before any growth claim gets made." },
  ],

  topics: [
    {
      name: "Circle-book folds",
      why: "The circle number only exists if the network split reproduces it: billings, value and clients GROUP BY circle, with group-versus-circle benchmarks and per-circle ratio reads doing the tie-back check. This is the warm-up every ICICI screen opens with, and the denominators stay local on purpose.",
      slugs: ["countries-you-can-safely-invest-in", "find-expensive-cities", "average-salary-of-departments"],
    },
    {
      name: "Card-portfolio health",
      why: "The card rail is the retail engine: velocity bursts, duplicate-charge pair screens and chargeback-style rate rankings are how the cards desk watches 16 legs a close behave. Portfolio health is read at leg grain — a billing can ride both rails, so the rail view and the billing view are different truths that must both tie.",
      slugs: ["transaction-velocity", "duplicate-charge-pairs", "chargeback-rate-ranking", "circular-transfers", "investments-in-2016"],
    },
    {
      name: "UPI-scale flow cadence",
      why: "Retail flow breathes on paydays: weekday and month-end cadence reads, spend clustering and short-window repeat behavior decide when branches staff and when pushes fire. The drill is finding the rhythm in event timestamps — the same machinery that reads UPI bursts at scale.",
      slugs: ["users-with-two-purchases-within-seven-days", "friday-purchases-i", "friday-purchases-ii"],
    },
    {
      name: "Coverage & partial settlements",
      why: "A billing can be open AND received: the 4000.00 leg against the 6148.00 balance is the case study every circle review cites. Coverage folds legs per billing and compares to billed — the classification is computed from evidence, never stored as a status.",
      slugs: ["bank-account-summary", "monthly-transactions-ii", "immediate-food-delivery-ii", "settlement-fails-aging", "expected-credit-loss"],
    },
    {
      name: "Branch & opex cost lines",
      why: "Branches are the cost story: category folds over opex lines (Rent at 14 lines / 16800.00), pacing against plan and month-bucketed spend peaking 3210.00 in 2024-08 are the reads behind every branch-footprint conversation. Count-only reads flatten the story — 14 Rent lines and 14 Ads lines are wildly different dollars.",
      slugs: ["spend-histogram", "budget-pacing", "friday-purchase-iii", "growth-accounting"],
    },
    {
      name: "Anomaly & fraud screens",
      why: "Settlement hygiene pairs state with evidence: void-but-drawn, paid-unmoved, amount outliers. Sliding-window checks, z-score amount screens and percentile-ranked suspicion are the screens that catch the 925.00 break before the regulator's read does.",
      slugs: ["suspicious-bank-account-transactions", "amount-anomaly-zscore", "top-percentile-fraud", "journal-gap-detection", "rfm-segmentation", "symmetric-pairs"],
    },
    {
      name: "Branch audit trails & reconciliation",
      why: "The ledger ties or nothing ships: trial-balance folds (181080.00 against 181080.00, delta 0), ledger-versus-rail reconciliation and balance rollforwards are the proof drills behind every close call. The trail records what happened — including mistakes — so the trial balance alone is never proof of correctness.",
      slugs: ["trial-balance-check", "gl-reconciliation", "balance-rollforward", "daily-balance-interest", "week-over-week-churn"],
    },
    {
      name: "Collections & delinquency watch",
      why: "Fee receivables age like credit exposures: days-past-terms buckets, aging schedules and vintage default curves are the language the collections desk runs in — built on the no-leg anti-join (6 billings / 15217.00) and flat 30-day terms.",
      slugs: ["delinquency-buckets", "ar-aging-schedule", "vintage-default-curves", "credit-utilization-bands", "fx-exposure-report"],
    },
    {
      name: "Circle window boards",
      why: "Circles compete for the review's attention: top billings per circle, most-recent cycles per client and per-partition counts are the boards the monthly read ships — each circle ranked within itself, never one global ladder where EU owns every rung.",
      slugs: ["department-top-three-salaries", "the-most-recent-three-orders", "find-the-team-size", "structuring-detection", "second-most-recent-activity"],
    },
    {
      name: "Client activity & cadence",
      why: "Relationship managers read households, not events: repeat-fee frequencies, loyal-client screens and completion-rate reads decide who gets the call — and the 24-event household is exactly the record this drill finds first.",
      slugs: ["customer-order-frequency", "find-loyal-customers", "confirmation-rate", "risk-based-pricing"],
    },
    {
      name: "Window frames & running folds",
      why: "Balance rollforwards and collected-to-date columns are running folds, and the default frame (RANGE … CURRENT ROW) has opinions about ties: same-day legs move together. The cash book's {emerald:69612.00} debit fold is the proof surface — ROWS versus RANGE decides whether the trail reads leg by leg or day by day. Frame choice is a definition, not a style.",
      slugs: ["find-cumulative-salary-of-an-employee", "running-total-for-different-genders", "restaurant-growth", "delinquency-roll-rates", "loan-amortization-schedule", "split-adjusted-position", "account-balance", "rolling-7d-actives"],
    },
    {
      name: "Set ops & the audit stack",
      why: "The close pack stacks folds at two grains — per-rail census plus a TOTAL banner — and compares circle lists across states. UNION ALL appends without the dedupe sort; INTERSECT/EXCEPT answer set membership, with NULLs comparing equal (unlike NOT IN). The rail stack — card 16 / wire 11 / TOTAL 27 legs, **69612.00** — is the canonical drill.",
      slugs: ["count-salary-categories", "league-statistics", "movie-rating", "customers-who-bought-all-products"],
    },
    {
      name: "Staged CTE reads",
      why: "The settlement clock, the KYC funnel and the dedupe all need a first stage — fold legs per billing, one row per client, keep-latest per household — before the outer fold. CTEs name that stage so the review can audit it; nested one-liners hide the exact fold the numbers depend on. Staging earlier than fashion suggests is this bank's instinct.",
      slugs: ["market-analysis-i", "second-highest-salary", "managers-with-at-least-5-direct-reports", "portfolio-concentration-hhi", "keep-latest-dedupe"],
    },
    {
      name: "NULL policy & fallback arms",
      why: "A no-leg billing folds to NULL, not zero — and the watchlist (6 billings / **15217.00**) only exists if the LEFT JOIN's NULL arm is handled on purpose. COALESCE at the fold, COUNT(right key) beside COUNT(*), and a NOT IN list with one NULL emptying the whole read: the three habits that keep censuses honest here.",
      slugs: ["find-customer-referee", "books-with-null-ratings", "analyze-subscription-conversion", "wash-trade-detection", "null-blank-audit", "consecutive-transactions-with-increasing-amounts"],
    },
    {
      name: "Calendar math & weekday rails",
      why: "Retail flow breathes on weekdays and month-ends: %Y-%m buckets for cohorts, %w for the weekend-rails read, julianday diffs for the settlement clock (**28.4 days** against flat 30-day terms). The traps are knowable: %M is minutes, malformed dates NULL silently through date functions, and text comparison only works because the keys are ISO.",
      slugs: ["convert-date-format", "rising-temperature", "tasks-count-in-the-weekend", "find-the-missing-ids", "median-time-to-convert", "cohort-retention-matrix", "year-on-year-growth-rate"],
    },
  ],

  theory: [
    {
      id: "icici-t1",
      q: "You join fee billings to their settlement legs and the per-circle billing counts stop summing to the 28-billing book. What broke?",
      a: "Fan-out: five billings were settled on split plans — two legs each — so the join prints 33 rows and every COUNT(*) on that result counts rail hits, not billings. The fix is grain discipline: fold the legs per billing first (derived table or CTE), or protect the census with COUNT(DISTINCT i.id). The ICICI twist that catches even careful candidates: the splits cross rails — one card leg, one wire leg — so per-rail counts look perfectly clean (16 legs / 16 billings card, 11 / 11 wire) and only the total shows 22 billings under 27 legs. The circle tie-back rule exists exactly for this: the split must reproduce the whole, and a fold at leg grain breaks that identity by exactly the five cross-rail splits.",
      tag: "joins",
    },
    {
      id: "icici-t2",
      q: "The circle review wants each circle's biggest fee billings ranked within its own book. Build that board in one query.",
      a: "Windows with PARTITION BY: RANK() OVER (PARTITION BY circle ORDER BY amount_cents DESC) gives every circle book its own rung 1, and ORDER BY circle, rung on the outside makes the board read circle by circle. Without the partition you get one global ladder where EU owns the top five rungs outright (6148.00, 5614.00, 5284.00, 4860.00, 4723.00) and three circles' managers read boards with no top of them. I keep the tie policy explicit — RANK shares rungs on ties, ROW_NUMBER doesn't — and pin a deterministic tiebreaker inside the window so the branch head's rerun reproduces the board row for row. A retail bank never ranks one circle's whales against another's minnows.",
      tag: "windows",
    },
    {
      id: "icici-t3",
      q: "Build the coverage census — exact, partial, no rail — so the audit review can argue with real numbers.",
      a: "Fold settlement legs per billing, then classify, then fold again per circle: LEFT JOIN billings to legs, GROUP BY billing id, COALESCE the receipt sum to 0, and CASE arms — no leg is the none arm, SUM < billed is partial, equal is exact. The follow-ups are where candidates die: open status is not the no-leg book (19609.00 versus 15217.00 — the open 4000.00-partial has a leg and leaves the anti-join, while a paid-status 1756.00 has none and stays), and the legs join fans split billings, so the census counts DISTINCT billings. I quote the actuals — 21 exact / 65612.00, 1 partial, 6 none / 15217.00 — and insist the circle split reproduce them before the pack ships.",
      tag: "aggregation",
    },
    {
      id: "icici-t4",
      q: "A stakeholder says 'the uncollected book is the open book — both are six billings.' Where does that identity fail?",
      a: "At membership, which the coincidental count hides. The open-status census carries 19609.00; the no-leg anti-join carries 15217.00 — the 4392.00 gap is two honest anomalies: an open billing with a 4000.00 partial settlement (evidence exists, so it leaves the watch) and a paid-status billing at 1756.00 with no rail hit (a claim without evidence, so it stays). The lesson: the anti-join's IS NULL on the right-side key defines 'never settled', and a status column is a claim about a state machine the branch can't see. On a settlement-hygiene book I name both lists per circle before choosing which one the review works — and the two lists can diverge differently per circle, which is why the tie-back rule exists.",
      tag: "nulls",
    },
    {
      id: "icici-t5",
      q: "Walk me through SQL's logical evaluation order and where it bites in a per-circle fold.",
      a: "FROM and JOIN build rows, WHERE filters rows, GROUP BY folds them, HAVING filters groups, SELECT projects, ORDER BY and LIMIT run last. The bites: the 'circles with a live uncollected book' gate is HAVING, because the fold doesn't exist at WHERE time; a WHERE on circle is a row predicate and belongs above the fold; SELECT aliases are usable in GROUP BY and ORDER BY in SQLite but not in WHERE. On the retail board I keep the circle filter in WHERE, the small-book gate in HAVING, and I narrate the order out loud — interviewers here are checking whether pipeline order is a mental model, because branch reporting is folds and gates landing in the right clause, every close, across every circle.",
      tag: "pipeline",
    },
    {
      id: "icici-t6",
      q: "One circle's book looks expensive per billing versus the network average. Scalar subquery, window, or CTE for the benchmark?",
      a: "By how much definition the benchmark needs. A scalar subquery — WHERE billed > (SELECT AVG(amount_cents) FROM invoices) — is the smallest correct form for one network-wide line. AVG() OVER (PARTITION BY circle) is the better shape when the review wants each billing beside its own circle's mean, because the benchmark travels with the row. A CTE earns its keep when the benchmark gets a definition — 'network average over open-and-paid billings, void excluded' — because a named, commented fold is auditable across four circle books and a nested one-liner isn't. Retail benchmarks always grow per-circle definitions here, so I stage the CTE earlier than fashion suggests.",
      tag: "subqueries",
    },
    {
      id: "icici-t7",
      q: "The collections read needs billing-cohort months and days-past-terms. How do you handle dates in SQLite for both?",
      a: "Two tools. Cohort buckets with strftime('%Y-%m', issued_on) — a '2024-10' style key that GROUP BY folds cleanly across the 2024-01 to 2025-02 window and sorts correctly as text. Aging needs instant arithmetic: julianday(reference) - julianday(due_on) per billing, against flat 30-day terms — and the trap I name out loud: julianday over a missing or malformed date NULLs the row silently, so the watch's denominator drifts unless the NULL arm is handled on purpose. The settled billings' own clock runs 28.4 days average billing-to-settlement (fastest 13, slowest 84), which is why 'terms are flat 30' is a definition worth verifying — min and max terms both print 30 here, so any spread in the lag is behavior, not contract.",
      tag: "dates",
    },
    {
      id: "icici-t8",
      q: "A void billing still drew a 925.00 settlement, and a paid billing shows no rail hit at all. What's the break policy?",
      a: "Detect, quantify, route — per circle, then as a network. Detect by pairing state with evidence: status = 'void' AND a settlement leg exists (the 925.00 break), status = 'paid' AND no leg (the 1756.00 break) — a one-pass FILTER (WHERE …) census counts both arms on the same scan so every circle's numbers come from one query. Quantify in dollars; route to the desk that owns the source system; never delete, never silently re-status — the audit trail is the product. Then reconcile to the book of record — the ledger still proves 181080.00 against 181080.00, delta 0, because double-entry records what happened, breaks included. The trial balance alone is never sufficient evidence of correctness — that sentence is the audit culture here.",
      tag: "quality",
    },
    {
      id: "icici-t9",
      q: "The collections board wants collected-to-date beside every settlement leg, date-ordered. What does the default window frame do — and when do you override it?",
      a: "The default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW, and it is tie-aware: rows sharing the ORDER BY value — two legs paid the same day — enter the frame together, so the running sum jumps by the whole day. For a money-on-a-date column that is usually the right read: the cash book's day balance should include every same-day leg on its way to the **69612.00** fold. For a leg-by-leg audit trail I override with `ROWS UNBOUNDED PRECEDING`, which orders strictly by row and prints the intermediate step after each posting. The discipline is to name the frame in the review, because the same query ships two different trails — same endpoint, different stories on the way — and an unnamed frame is an undocumented definition.",
      tag: "frames",
    },
    {
      id: "icici-t10",
      q: "The close pack needs the rail census plus a TOTAL banner; another pack needs billings on one list but not the other. Which set tools, and what does each cost?",
      a: "UNION ALL appends — no dedupe pass, no surprise: the rail stack folds payments per method (card 16 legs / 37364.00, wire 11 / 32248.00) and the banner folds the whole feed (**TOTAL 27 legs / 69612.00**), both rows surviving because the label literal differs. UNION dedupes with a sort — wasted work here, and a hazard where legitimate duplicates exist. INTERSECT and EXCEPT answer membership, and their killer feature on this book is that NULLs compare equal inside set ops — so billings EXCEPT legs returns the never-settled six (15217.00) without the NOT IN NULL trap. Costs named, the choice follows the grain: append for stacks, difference for watchlists, and never a bare UNION where the rows are distinct by construction.",
      tag: "setops",
    },
    {
      id: "icici-t11",
      q: "A teammate rewrote the no-leg watchlist as WHERE i.id NOT IN (SELECT invoice_id FROM payments). What's the risk profile?",
      a: "One NULL in that subquery and the whole NOT IN returns zero rows — silently, no error, the worst failure mode an audit culture knows. Today `payments.invoice_id` is NOT NULL so it works, but a re-fed extract or an outer-joined fold reintroduces NULL and the **15217.00** watchlist empties into a false all-clear. I reach for the LEFT JOIN … IS NULL anti-join or NOT EXISTS — membership by evidence, immune to NULL drift — and I keep the watchlist per circle so absence is visible (LATAM's clean book prints no row at all). *The query that fails loud is annoying; the query that fails silent is a finding.* That asymmetry is why NOT IN against a fold is a code smell on this desk.",
      tag: "subqueries",
    },
    {
      id: "icici-t12",
      q: "Your coverage fold prints some uncollected balances as NULL and some as 0. What's the NULL policy on this book?",
      a: "They are two different facts. SUM over a fold with no rows is NULL — no settlement legs, the watchlist six; a fold that nets to nothing is genuinely 0. So the policy: `COALESCE(SUM(p.amount_cents), 0)` when the watchlist must sum to **15217.00**, and the raw NULL when zero-versus-absence is itself the signal the reviewer reads. Beside it: COUNT(p.id) counts legs while COUNT(*) counts join rows — on the fanned billings-to-legs join they differ by exactly the five splits. And rate reads guard their denominators with NULLIF, so a rail with no attempted legs prints NULL rather than a divide-by-zero. Classification stays computed — the book stores states, the query stores nothing.",
      tag: "nulls",
    },
    {
      id: "icici-t13",
      q: "A rail review wants weekday cadence, month cohorts and the settlement clock in one pack. Which date tools, which traps?",
      a: "Three tools. Cohorts: `strftime('%Y-%m', issued_on)` — the '2024-11' key that folds cleanly and sorts correctly as text across the 2024-01 to 2025-02 window. Weekdays: `strftime('%w', paid_on)` — 0 is Sunday, and the weekend-rails cadence keys on it. Clocks: julianday differences for the **28.4-day** average issue-to-first-settlement against flat 30-day terms (fastest 13, slowest 84). Traps named out loud: %M is minutes, not month; malformed or partial dates NULL silently through the date functions and drift the denominator; text date arithmetic coerces the leading year and collapses to garbage. And the terms clock itself is built with modifiers — `DATE(issued_on, '+30 day')` — which is the contract the behavioral lag is measured against.",
      tag: "dates",
    },
    {
      id: "icici-t14",
      q: "Define a rail-level settlement success rate that survives the audit review.",
      a: "Leg grain, per rail, evidence-based. Numerator: legs that cleared — a paid_on present and the full amount posted. Denominator: legs attempted on that rail, because card and wire are never pooled: the five split billings ride both rails, and a pooled rate hides the 27-into-22 squeeze entirely. The context line is the rail mix — card 16 legs / 37364.00, wire 11 / 32248.00 — and the billing-level coverage census (21 exact / 65612.00, 1 partial / 4000.00 of 6148.00, 6 none / 15217.00) is a *different* KPI at a different grain. The classic audit finding is a deck averaging the two, or computing a {sky:success} rate off the status column — re-asserting the claim the rail evidence exists to test.",
      tag: "kpi",
    },
    {
      id: "icici-t15",
      q: "The retail desk needs an EMI schedule from a disbursal row: level payment, interest split, declining balance. How does SQL do it?",
      a: "WITH RECURSIVE. The anchor is the disbursal row — month 0, balance, rate — and the recursive member computes interest = balance × monthly rate, principal = EMI − interest, next balance = balance − principal, guarded by WHERE balance > 0 so the schedule stops at payoff instead of running negative forever. The traps are numeric: integer division on the rate unless you multiply by 1.0, and the instinct that a window running-sum is *not* the same thing — the interest split depends on the prior balance, which makes the schedule genuinely recursive rather than cumulative. That is why {violet:EMI amortization} is the desk's favorite interview question: it separates people who reach for recursion on purpose from people who reach for it by fashion.",
      tag: "recursion",
    },
    {
      id: "icici-t16",
      q: "Build the KYC-dropoff funnel — applied, documents, verified, funded — so the stages can't double-count.",
      a: "Stage the funnel first: a CTE with one row per client and a flag per stage (EXISTS probes or MAX over CASE arms on the event feed), then fold per stage with COUNT(DISTINCT client_id) and compute conversion as stage n over stage 1, NULLIF on the denominator. The double-count comes from joining stage tables directly — a client with two document events fans every later stage. The one-row-per-client stage is the same move as folding settlement legs per billing before the coverage census: grain discipline is the reusable skill. And the read always names its denominator — {amber:clients at the top of the funnel}, not events — because a client stuck uploading documents twice is one blocked onboarding, not two.",
      tag: "funnel",
    },
    {
      id: "icici-t17",
      q: "Collections wants DPD buckets — current, 1-30, 31-60, 61-90, 90+. What makes the bucket read defensible?",
      a: "Three things. A pinned reference date — without one the buckets drift every run; MAX(paid_on) or a stated close date is the audit anchor. Days-past computed as julianday(reference) − julianday(due_on) and banded by an explicit CASE whose boundaries are written into the memo, not implied. And the denominator named: the no-leg book (**6 billings / 15217.00**) ages differently from the open-status book (19609.00) — the membership lesson again, now with buckets. Roll rates are the follow-up: state-to-state moves between cycle snapshots need LAG over the ordering key, and the 'cure' arm — a billing stepping back down a bucket — is the number the collections desk actually argues about, because cures and rolls are different stories wearing the same aging schedule.",
      tag: "risk",
    },
    {
      id: "icici-t18",
      q: "Why does WHERE AVG(x) > 10 error, why can't WHERE see your SELECT alias, and why does WHERE rung <= 3 fail on a ranked board?",
      a: "One answer: logical evaluation order. FROM and JOIN build rows, WHERE filters rows, GROUP BY folds them, HAVING filters folds, SELECT projects, window functions evaluate after HAVING, ORDER BY and LIMIT run last. So the aggregate doesn't exist at WHERE time (that is HAVING's job), the alias isn't projected yet (SQLite is lenient in GROUP BY and ORDER BY, not in WHERE), and the window output exists only after the fold — a 'top three per circle' board must stage the ranked set through a derived table or CTE and filter outside. On the branch boards I narrate the pipeline out loud: the interviewer here is checking whether the order is a mental model, because branch reporting is folds and gates landing in the right clause, every close.",
      tag: "pipeline",
    },
    {
      id: "icici-t19",
      q: "Two opex postings share a date and your running-total chart jumps twice as far on that row. Explain it and fix it.",
      a: "The default frame — RANGE UNBOUNDED PRECEDING TO CURRENT ROW — admits peer ties: rows equal on the ORDER BY key enter and leave the frame together, so a same-day pair moves the running sum by both postings at once. Sometimes that is the definition (a day balance should fold the whole day); sometimes it isn't (a posting-by-posting trail). The fix is an explicit frame — `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` — plus a deterministic tiebreak inside the window's ORDER BY (the entry id), so reruns reproduce the trail row for row. The audit instinct: a running column without a named frame is an undocumented definition, and undocumented definitions are exactly what the next review finds. Same numbers at the end, different evidence on the way.",
      tag: "windows",
    },
    {
      id: "icici-t20",
      q: "The first row of your MoM opex board prints NULL delta and a stakeholder calls it a bug. What's your response — and your options?",
      a: "LAG has no row before the first one, so NULL is the *correct* shape — the query proving the series starts where it says it starts — and I say that before offering fixes. Options, in order of honesty: leave the NULL and label it; `COALESCE(opex - LAG(opex) OVER (…), 0)` when the deck mandates a number; never invent a prior month. Then the sharper point: with a materiality gate upstream, LAG pairs each kept month against the prior *kept* month — 2024-03 reads against 2024-01 when 2024-02 dropped below the bar — which is a definition to state in the caption, not a bug to patch. And the window must ORDER BY the month key; ordering by value pairs months that were never adjacent on the calendar.",
      tag: "sequencing",
    },
    {
      id: "icici-t21",
      q: "One client, two KYC records, and the funnel double-counts. Fix it in SQL — properly.",
      a: "Keep-latest by window: `ROW_NUMBER() OVER (PARTITION BY client_id ORDER BY updated_at DESC, id DESC)`, keep rn = 1, and do it in a staged CTE — a window can't sit in WHERE because windows evaluate after it. RANK would keep both records on an updated_at tie and re-double the count; ROW_NUMBER with the id tiebreak is deterministic, so the branch head's rerun reproduces the census row for row. COUNT(DISTINCT client_id) is the cheap guard for spot checks, not the fix — a distinct count hides the stale record instead of correcting it. The KYC file, the client email file, the settlement splits: same shape everywhere — dedupe at the grain the census counts, then let the funnel fold cleanly.",
      tag: "dedupe",
    },
    {
      id: "icici-t22",
      q: "FILTER (WHERE …) versus SUM(CASE WHEN …) on a settlement census — when do you reach for each?",
      a: "Same one-pass idea, different ergonomics. FILTER reads like the census it is — `COUNT(*) FILTER (WHERE method = 'card')` beside the wire arm — and keeps one scan under one fold. SUM(CASE WHEN … THEN x ELSE 0 END) is the portable workhorse that carries value arms — the no-leg book as SUM(CASE WHEN p.id IS NULL THEN i.amount_cents ELSE 0 END) — and works in engines without FILTER. One subtlety I name: SUM over an empty filter set prints NULL, not 0 — on the rail census that NULL is the *absence* signal, and COALESCE turns it into a zero only when the pack needs a number. Two queries stapled by UNION where one census will do is the habit I coach against: one pass, one definition, one set of numbers that can't drift apart.",
      tag: "aggregation",
    },
    {
      id: "icici-t23",
      q: "The watchlist printed 6 rows in the deck and 0 in prod. Walk me through the join-family bugs that fail empty-but-wrong.",
      a: "The four horsemen. NOT IN over a list carrying one NULL — the whole predicate goes unknown and the **15217.00** watchlist evaporates. An INNER JOIN where the LEFT was meant — the no-leg six drop at the join, before any filter sees them. EXCEPT pointed the wrong way — billings EXCEPT legs is the watchlist, legs EXCEPT billings is a different question. And IS NULL tested on the left table's key (always populated) instead of the right table's key (the anti-join signal). The discipline that catches all four: build the anti-join as LEFT JOIN … WHERE right.key IS NULL, group per circle, and expect LATAM's absence — a clean book prints no row. The reviewer who knows what absence looks like catches an empty-but-wrong read on sight.",
      tag: "joins",
    },
    {
      id: "icici-t24",
      q: "This circle board runs in a blink on the training db. The branch db is sixteen million rows. What changes?",
      a: "Nothing about the definition — everything about the shape. Filter early: circle and date predicates in WHERE before the fold, not HAVING after it. Keep predicates sargable — `SUBSTR(created_at, 1, 7) = '2024-08'` defeats an index on created_at; a range predicate (`created_at >= '2024-08-01' AND created_at < '2024-09-01'`) keeps it usable. Index the join keys the censuses ride — payments.invoice_id, invoices.customer_id — and let staged CTEs project only the columns the next stage reads. COUNT(DISTINCT …) only where the fan-out demands it: honest on the billing census because of the splits, waste everywhere else. And measure with EXPLAIN QUERY PLAN before optimizing — the plan is evidence, and this bank believes evidence over instinct.",
      tag: "performance",
    },
  ],

  mcqs: [
    {
      id: "icici-mcq-1",
      prompt: "The morning proof needs the rail census: settlement legs and dollars per rail. Which query delivers it?",
      choices: [
        "SELECT method, COUNT(*), ROUND(SUM(amount_cents)/100.0,2) FROM payments GROUP BY method",
        "SELECT method, COUNT(amount_cents) FROM payments",
        "SELECT method, SUM(amount_cents) FROM invoices GROUP BY method",
        "SELECT rail, COUNT(*) FROM payments GROUP BY rail",
      ],
      answer: 0,
      why: "Legs live on payments; fold per rail with COUNT(*) for legs and SUM(amount_cents)/100.0 for dollars — card 16 / 37364.00, wire 11 / 32248.00, cross-footing to 69612.00.",
      notes: [
        { choice: 2, why: "Invoices have no method column — the query errors before it lies. Rails are a property of settlement legs, not of billings." },
        { choice: 3, why: "'rail' isn't the column name — the db calls it method. A wrong identifier errors, and the morning proof ships late rather than wrong." },
      ],
      difficulty: "easy",
    },
    {
      id: "icici-mcq-2",
      prompt: "A settlement leg is stored as amount_cents = 236150. What's the correct dollar read on the rail report?",
      choices: [
        "amount_cents / 100.0, rounded once at the edge",
        "amount_cents / 100",
        "amount_cents, formatted with two decimals",
        "ROUND(amount_cents) / 1000",
      ],
      answer: 0,
      why: "Money is integer cents; divide by 100.0 (float) and round once — 236150 cents reads 2361.50. The /100 integer read truncates the odd-cent legs this book actually carries.",
      notes: [
        { choice: 1, why: "Integer division drops the remainder — the 2361.50 leg prints 2361 and the cross-foot against the cash book's 69612.00 misses by the half-dollars." },
        { choice: 2, why: "Formatting doesn't divide — 236150 formatted is still two hundred thirty-six thousand one hundred fifty cents. The unit conversion has to happen in the math." },
      ],
      difficulty: "easy",
    },
    {
      id: "icici-mcq-3",
      prompt: "The collections cohort card buckets fee billings by issue month ('2024-11', '2025-01', …). Which expression builds the key?",
      choices: [
        "strftime('%Y-%m', issued_on)",
        "strftime('%M', issued_on)",
        "SUBSTR(issued_on, 9, 2)",
        "YEAR(issued_on)",
      ],
      answer: 0,
      why: "strftime('%Y-%m', issued_on) prints the '2024-11' month key the cohort card buckets on — and the keys sort correctly as text across the 2024-01 to 2025-02 window.",
      notes: [
        { choice: 1, why: "%M is MINUTES in SQLite, not month — every billing buckets by wallclock minute 00–59. The classic strftime trap, and the cohort card dissolves into forty buckets." },
        { choice: 2, why: "Characters 9–10 are the day of month — a 31-bucket calendar, not a monthly cohort. Month keys start at character 1 with length 7." },
      ],
      difficulty: "easy",
    },
    {
      id: "icici-mcq-4",
      prompt: "A billings-to-legs join for the per-circle split returns 33 rows on a 28-billing book. The honest per-circle billing count is:",
      choices: [
        "COUNT(*) per circle — 33 is the book now",
        "COUNT(DISTINCT i.id) per circle — five split-plan billings carry two legs each",
        "27 per circle — the void billing vanished",
        "Whatever the join returns — counts never need protecting",
      ],
      answer: 1,
      why: "Five split-plan billings ride two legs each, so the join prints 33 rows at leg grain. COUNT(DISTINCT i.id) folds back to billing grain — the grain whose circle split must reproduce the 28-billing book.",
      notes: [
        { choice: 0, why: "COUNT(*) counts rail hits — the split then exceeds the whole by exactly the five cross-rail splits, and nobody can explain why the parts outrun the book." },
        { choice: 2, why: "The void billing is still a billing on the book — it holds its place in the census whether or not a rail ever hit it. Dropping it conflates the billing book with the settlement feed." },
      ],
      difficulty: "medium",
    },
    {
      id: "icici-mcq-5",
      prompt: "The board keeps only circles whose uncollected book exceeds zero. Where does that gate go?",
      choices: [
        "WHERE uncollected > 0",
        "HAVING SUM(p.amount_cents) > 0",
        "LIMIT 1",
        "WHERE method IS NOT NULL",
      ],
      answer: 1,
      why: "The gate is on a fold, and folds exist only after GROUP BY — the gate is HAVING, written against the settlement fold itself. WHERE runs before any fold exists.",
      notes: [
        { choice: 0, why: "WHERE can't see SELECT aliases or folds — uncollected isn't born yet at row-filter time. It either errors or filters something else entirely." },
        { choice: 2, why: "LIMIT 1 keeps one row, not the qualifying rows — a gate and a cap are different sentences, and this one silently deletes three of the four circles." },
      ],
      difficulty: "medium",
    },
    {
      id: "icici-mcq-6",
      prompt: "One billing was billed 6148.00 and took a 4000.00 leg. Which read classifies it partial?",
      choices: [
        "WHERE status = 'partial'",
        "Fold legs per billing and compare: SUM(receipts) < billed",
        "WHERE amount_cents = 614800",
        "GROUP BY status and eyeball the open row",
      ],
      answer: 1,
      why: "Coverage is evidence across two tables: fold the billing's settlement legs, compare to billed — 4000.00 against 6148.00 is partial. No such status exists in the book; the state is computed, never stored.",
      notes: [
        { choice: 0, why: "The billing still says open while carrying 4000.00 of legs — filtering on a status that doesn't exist returns an empty census and the partial never surfaces." },
        { choice: 2, why: "Hardcoding one amount finds one billing today and nothing next quarter. The definition is the comparison — every partial, present and future, falls out of SUM(receipts) < billed." },
      ],
      difficulty: "medium",
    },
    {
      id: "icici-mcq-7",
      prompt: "The settlement clock reads 28.4 days average issue-to-first-settlement. Which expression computes each settled billing's lag?",
      choices: [
        "julianday(paid_on) - julianday(issued_on), averaged over billings with legs",
        "julianday(due_on) - julianday(issued_on), averaged over all billings",
        "paid_on - issued_on, averaged as text",
        "AVG(paid_on) over the payments feed",
      ],
      answer: 0,
      why: "Lag is behavior: the date the leg actually moved minus the date the billing was issued, over settled billings — 20 billings averaging 28.4, fastest 13, slowest 84. The terms clock (due minus issue) is a contract, flat 30, and would print exactly 30 every time.",
      notes: [
        { choice: 1, why: "Due minus issue is the terms definition, not the settlement clock — against this book it prints 30.0 flat and hides the 13-to-84 behavioral spread the review is asking about." },
        { choice: 2, why: "Text subtraction of 'YYYY-MM-DD' strings isn't date math — SQLite coerces the leading year and the lag collapses to near-zero. julianday is the instant arithmetic that survives." },
      ],
      difficulty: "medium",
    },
    {
      id: "icici-mcq-8",
      prompt: "Which read isolates the void billing that still drew a 925.00 rail hit — per circle?",
      choices: [
        "WHERE status = 'void', grouped by circle",
        "Pair state with evidence: status='void' AND an EXISTS settlement leg, grouped by circle",
        "WHERE method = 'void' on the settlement feed",
        "The no-leg anti-join, grouped by circle",
      ],
      answer: 1,
      why: "The break is a PAIR — a void claim and a leg that exists. The paired read proves the rail hit should never have cleared and attributes it to the circle whose book absorbed the 925.00; status alone shows the void but not the drawn leg.",
      notes: [
        { choice: 2, why: "'void' is a billing state, not a rail — the settlement feed carries card and wire only. The query errors and the break stays invisible in the pack." },
        { choice: 3, why: "The anti-join finds NEVER-settled billings — the opposite evidence. The void-but-drawn row HAS a leg, so the anti-join is structurally blind to it." },
      ],
      difficulty: "hard",
    },
    {
      id: "icici-mcq-9",
      prompt: "Two sixes again: the open-status census reads 6 billings / 19609.00; the no-leg anti-join reads 6 billings / 15217.00. The 4392.00 gap is:",
      choices: [
        "Rounding drift between cents and dollars",
        "Membership: the open 4000.00-partial has a leg (out of the anti-join), and a paid-status 1756.00 has none (in it)",
        "The anti-join excludes void billings",
        "Nothing — same six billings, same dollars",
      ],
      answer: 1,
      why: "Same count, different sets — the anti-join keys on rail evidence, not status. The swing is exactly the two honest anomalies in the book, and per circle they sit differently (the 1756.00 lands in APAC's worklist), which is why the tie-back rule exists.",
      notes: [
        { choice: 3, why: "If the sets were identical the dollars would tie too — they don't. Equal counts with unequal dollars is the signature of different membership, not of agreement." },
        { choice: 0, why: "Both reads divide by 100.0 the same way. 'Rounding' is the excuse that stops the investigation one step before the actual finding." },
      ],
      difficulty: "hard",
    },
    {
      id: "icici-mcq-10",
      prompt: "The ledger proves 181080.00 debits against 181080.00 credits, delta 0. What does that proof NOT establish?",
      choices: [
        "That every settlement leg posted to cash",
        "That billings were classified correctly — a void-but-drawn 925.00 still balances",
        "That the cash account's debit fold is 69612.00",
        "That the ledger has 80 entries",
      ],
      answer: 1,
      why: "Double-entry records what happened, including mistakes: the void-but-drawn 925.00 and the paid-unmoved 1756.00 both balance perfectly. The trial balance proves symmetry, never correctness of classification — that's what the anomaly census is for.",
      notes: [
        { choice: 0, why: "It does establish posting symmetry — the cash fold (69612.00 debits) ties to the rail census line for line. The gap is classification, not posting." },
        { choice: 2, why: "The cash account's 69612.00 debit fold is part of what ties. The proof's blind spot is whether each posting was RIGHT, not whether it happened." },
      ],
      difficulty: "hard",
    },
    {
      id: "icici-mcq-11",
      prompt: "The watchlist query uses WHERE i.id NOT IN (SELECT invoice_id FROM payments). A re-fed extract leaves one leg with invoice_id NULL. What does the review see?",
      choices: [
        "An empty watchlist — NOT IN over a list containing NULL returns no rows",
        "The usual six billings / 15217.00",
        "A type error on the NULL invoice_id",
        "Only the billing whose leg went NULL",
      ],
      answer: 0,
      why: "x NOT IN (…, NULL) can never be TRUE — the predicate goes unknown for every row, so the anti-join silently empties. The watchlist that should read 6 billings / 15217.00 prints nothing, and nobody gets an error to debug.",
      notes: [
        { choice: 1, why: "Six billings is what a correct anti-join returns — but NOT IN is not a correct anti-join once NULL enters the list. The number is right; the mechanism can't produce it." },
        { choice: 2, why: "NULL doesn't raise — it poisons the predicate. Silent empties are why this desk's screens grade NOT EXISTS and LEFT JOIN … IS NULL over NOT IN." },
      ],
      difficulty: "hard",
    },
    {
      id: "icici-mcq-12",
      prompt: "The branch pack folds each circle's client roster into one cell: 'Alice Chen, Bruno Silva, …'. Which expression is the honest fold?",
      choices: [
        "GROUP_CONCAT(DISTINCT c.name, ', ') inside the per-circle fold",
        "CONCAT(c.name, ', ') over the join",
        "STRING_AGG(c.name, ', ') — the dialect this db ships",
        "GROUP_CONCAT(c.name) over the billings-to-legs join, no DISTINCT",
      ],
      answer: 0,
      why: "GROUP_CONCAT is SQLite's fold-to-cell; the delimiter argument prints the roster readably, and DISTINCT guards the roster when the join fans — a client with two billings must appear once in a roster of clients.",
      notes: [
        { choice: 1, why: "CONCAT doesn't fold — it concatenates per row, printing one row per client instead of one cell per circle. The pack needs the fold." },
        { choice: 3, why: "Over a fanned join the roster repeats a client once per settlement leg — the same fan-out the billing census guards with COUNT(DISTINCT)." },
      ],
      difficulty: "medium",
    },
    {
      id: "icici-mcq-13",
      prompt: "The close pack stacks the per-rail census under a TOTAL banner. Why UNION ALL rather than UNION?",
      choices: [
        "The rows are distinct by construction — UNION's dedupe sort is wasted work",
        "UNION would dedupe the rail rows away",
        "UNION ALL is faster to type",
        "UNION can't stack SELECTs with different column counts",
      ],
      answer: 0,
      why: "The banner's literal ('TOTAL') and the rail labels guarantee distinct rows; UNION would pay for a dedupe pass that finds nothing — and on rail-scale books that sort is the cost you feel.",
      notes: [
        { choice: 1, why: "UNION dedupes only identical rows — card 37364.00 and the 69612.00 banner differ in every cell. Nothing is at risk of being deduped away." },
        { choice: 3, why: "Both SELECTs here carry the same four columns — the stacking rule is satisfied either way. The choice is about cost, not capability." },
      ],
      difficulty: "easy",
    },
    {
      id: "icici-mcq-14",
      prompt: "Collected-to-date runs by paid_on date, and two legs settled the same day. The default window frame counts…",
      choices: [
        "Both legs at once — RANGE … CURRENT ROW admits peer ties",
        "Only the earlier leg — frames are strictly row-ordered",
        "Only the later leg — frames lead by one row",
        "It errors — ties require an explicit ROWS frame",
      ],
      answer: 0,
      why: "The default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW: rows equal on the ORDER BY key enter the frame together, so the running sum jumps by the whole same-day group — right for a day balance, wrong for a leg-by-leg trail (that's ROWS).",
      notes: [
        { choice: 1, why: "ROWS does that; RANGE — the default — does not. The two frames disagree exactly on ties, which is why the frame gets named in the review." },
        { choice: 3, why: "Ties don't error — they silently change the definition. The silent ones are the ones a later audit finds." },
      ],
      difficulty: "hard",
    },
    {
      id: "icici-mcq-15",
      prompt: "Keep the latest KYC record per client before the funnel folds. Which pattern survives the audit?",
      choices: [
        "ROW_NUMBER() OVER (PARTITION BY client_id ORDER BY updated_at DESC, id DESC) staged in a CTE, kept where rn = 1",
        "RANK() … = 1 filtered directly in WHERE",
        "SELECT DISTINCT client_id — one row each, done",
        "MAX(updated_at) GROUP BY client_id, joined back",
      ],
      answer: 0,
      why: "ROW_NUMBER with the id tiebreak is deterministic; the CTE staging exists because windows evaluate after WHERE — the rn = 1 filter must run in an outer query.",
      notes: [
        { choice: 1, why: "RANK keeps both records on an updated_at tie — the double-count survives — and WHERE can't hold a window expression at all." },
        { choice: 2, why: "DISTINCT dedupes identical rows; two different KYC records are different rows. The census still counts the client twice." },
      ],
      difficulty: "medium",
    },
    {
      id: "icici-mcq-16",
      prompt: "The close needs 2024-08's branch cost lines with an index-friendly filter on spent_on. Which predicate keeps the index usable?",
      choices: [
        "spent_on >= '2024-08-01' AND spent_on < '2024-09-01'",
        "SUBSTR(spent_on, 1, 7) = '2024-08'",
        "strftime('%Y-%m', spent_on) = '2024-08'",
        "spent_on LIKE '2024-08%'",
      ],
      answer: 0,
      why: "A range predicate compares the raw column to constants, so the index on spent_on stays usable. Wrapping the column in a function — SUBSTR, strftime, a leading-wildcard LIKE — forces a scan of every cost line.",
      notes: [
        { choice: 1, why: "Same rows returned, different plan: the function wraps the indexed column and the index is ignored. The opex walk gets slower every month the ledger grows." },
        { choice: 3, why: "LIKE with a leading constant can sometimes use an index — but the contract is fragile and the range form says exactly what it means. Range is the form this desk writes." },
      ],
      difficulty: "medium",
    },
    {
      id: "icici-mcq-17",
      prompt: "A teammate computes settlement lag as paid_on - issued_on (plain text subtraction) and reports ~1 day everywhere. What happened?",
      choices: [
        "SQLite coerced the leading year out of each string — text arithmetic isn't date arithmetic",
        "The billings really do settle in about a day",
        "julianday would return the same ~1",
        "The lag needs ROUND(…, 2) to be right",
      ],
      answer: 0,
      why: "Subtracting 'YYYY-MM-DD' strings coerces their numeric prefix — year minus year — so '2025-01-20' - '2024-12-31' reads as 1. The clock needs julianday() on both sides: 20 settled billings average 28.4 days that way, fastest 13, slowest 84.",
      notes: [
        { choice: 2, why: "julianday is precisely the fix — instant arithmetic on calendar days. The one-day output is the string coercion, not the truth." },
        { choice: 3, why: "Rounding a wrong number keeps it wrong — two decimals of year-minus-year is still not a lag. The unit conversion is julianday's job." },
      ],
      difficulty: "medium",
    },
    {
      id: "icici-mcq-18",
      prompt: "In the coverage fold, the no-leg billings' uncollected balance should print as…",
      choices: [
        "0 via COALESCE(SUM(legs), 0) when the watchlist must sum — and the raw NULL when zero-vs-absence is the signal",
        "NULL always — zero is a lie on a watchlist",
        "0 automatically — SUM never returns NULL",
        "-1 as a sentinel the pack can filter on",
      ],
      answer: 0,
      why: "SUM over a fold with no rows is NULL — 'no legs' — while a fold netting to nothing is genuinely 0. The policy picks deliberately: the 15217.00 watchlist sums (COALESCE), the census keeps NULL as the absence signal.",
      notes: [
        { choice: 2, why: "SUM ignores NULL values but over an empty set returns NULL, not 0 — the no-leg six prove it every close." },
        { choice: 3, why: "Sentinels pollute every fold downstream — the watchlist would sum to 15216.99. NULL and COALESCE are the honest pair." },
      ],
      difficulty: "medium",
    },
    {
      id: "icici-mcq-19",
      prompt: "The pricing memo wants circles whose average fee event clears the network mean (338.19). Where does the scalar subquery go?",
      choices: [
        "HAVING AVG(o.total) > (SELECT AVG(total) FROM orders)",
        "WHERE AVG(o.total) > (SELECT AVG(total) FROM orders)",
        "In the SELECT list, filtered later by eye",
        "ORDER BY AVG(o.total) > (SELECT AVG(total) FROM orders)",
      ],
      answer: 0,
      why: "The comparison is against a fold, and folds exist only after GROUP BY — the gate is HAVING. The subquery prints the network bar once (338.19 over all 103 fee events) and the HAVING keeps US (383.48) and LATAM (426.22).",
      notes: [
        { choice: 1, why: "WHERE can't evaluate AVG(o.total) — the fold doesn't exist at row-filter time. It errors, loudly at least." },
        { choice: 2, why: "Printing the bar and eyeballing the cut is the manual version of HAVING — the screen grades the clause that does the work." },
      ],
      difficulty: "medium",
    },
    {
      id: "icici-mcq-20",
      prompt: "Set difference by evidence: (SELECT id FROM invoices) EXCEPT (SELECT invoice_id FROM payments) returns…",
      choices: [
        "The never-settled six — in-billings, not-in-legs, NULLs comparing equal",
        "The settled 22",
        "All 28 billings — EXCEPT can't span tables",
        "A type error — the column names don't match",
      ],
      answer: 0,
      why: "EXCEPT keeps left rows absent from the right set, and NULLs compare as equal inside set ops — so the six no-leg billings (15217.00) come back with no NOT IN trap in sight.",
      notes: [
        { choice: 1, why: "That's the other direction — legs EXCEPT billings answers a different question. The watchlist is billings minus legs, always." },
        { choice: 3, why: "Set ops align columns by position and compare values — the names never have to match. The audit grades the direction, not the labels." },
      ],
      difficulty: "hard",
    },
    {
      id: "icici-mcq-21",
      prompt: "Two billings tie for the biggest amount in one circle's book. How do RANK, DENSE_RANK and ROW_NUMBER print the next rung?",
      choices: [
        "RANK skips to 3, DENSE_RANK prints 2, ROW_NUMBER numbers the tie 1-2 arbitrarily",
        "All three print 2 — ties are ties",
        "RANK prints 2, DENSE_RANK skips to 3",
        "All three error on ties",
      ],
      answer: 0,
      why: "RANK shares the rung and gaps (1, 1, 3); DENSE_RANK shares without gaps (1, 1, 2); ROW_NUMBER breaks the tie by its ORDER BY — which is why deterministic tiebreakers (the id) ride along on boards the branch reruns.",
      notes: [
        { choice: 1, why: "That's DENSE_RANK's behavior only — RANK's gap is the point when the board must show that two billings jointly hold rung 1." },
        { choice: 2, why: "Backwards: RANK is the gapping one. The ladder's shape — who the tie excludes — is exactly what the review reads." },
      ],
      difficulty: "medium",
    },
    {
      id: "icici-mcq-22",
      prompt: "One pass over the settlement feed must print card legs and wire legs side by side. The census move is…",
      choices: [
        "COUNT(*) FILTER (WHERE method = 'card') and the wire arm — one scan, one fold",
        "Two queries, one per rail, stapled in the deck",
        "WHERE method = 'card' OR 'wire' with a single COUNT(*)",
        "GROUP BY method can't produce side-by-side columns",
      ],
      answer: 0,
      why: "FILTER (WHERE …) folds both arms in a single scan — the one-pass census the anomaly screens run (the void-but-drawn 925.00 and paid-unmoved 1756.00 were counted the same way).",
      notes: [
        { choice: 1, why: "Two scans print the same numbers today — and drift apart the moment someone edits one and not the other. One pass is one definition." },
        { choice: 2, why: "That WHERE compares method to the literal 'wire' as well — SQLite may accept it, but it doesn't mean what it says. The census needs arms, not ORs." },
      ],
      difficulty: "medium",
    },
    {
      id: "icici-mcq-23",
      prompt: "The board wants 'top three billings per circle' — but WHERE rn <= 3 on the ranked query errors. Why, and what's the fix?",
      choices: [
        "Windows evaluate after WHERE — stage the ranking in a CTE or derived table and filter in the outer query",
        "Use HAVING rn <= 3 on the same query",
        "Cast rn to an integer first",
        "ORDER BY rn and read the first rows per circle by eye",
      ],
      answer: 0,
      why: "The window output doesn't exist at row-filter time — the pipeline evaluates windows after WHERE. Staging the ranked set and filtering outside is the move, and it keeps the PARTITION BY per circle intact.",
      notes: [
        { choice: 1, why: "HAVING filters folds, not window outputs — the same evaluation-order problem one clause later. The rank still isn't born yet." },
        { choice: 3, why: "A global order mixes circles onto one ladder — EU's whales own every rung. The board's definition is per circle, so the filter must be too." },
      ],
      difficulty: "medium",
    },
    {
      id: "icici-mcq-24",
      prompt: "The weekend-rails read keys on strftime('%w', paid_on). Which value marks Sunday?",
      choices: ["'0'", "'1'", "'7'", "'Sun'"],
      answer: 0,
      why: "SQLite's %w runs 0 (Sunday) through 6 (Saturday) — a different convention from ISO weekday numbering, and exactly the kind of off-by-one that reshapes a weekend cadence read.",
      notes: [
        { choice: 1, why: "'1' is Monday in %w — the ISO reflex. One day off and the 'weekend surge' lands on Monday's ledger." },
        { choice: 2, why: "%w never prints 7 — the range is 0 through 6. Anything else is a different function's contract." },
      ],
      difficulty: "easy",
    },
    {
      id: "icici-mcq-25",
      prompt: "The MoM opex board's first row prints NULL in the delta column. The honest handling is…",
      choices: [
        "Leave it and label it — LAG with no prior row is NULL by design, proving where the series starts",
        "COALESCE it to zero in every case",
        "Drop the first row",
        "Backfill it with the series average",
      ],
      answer: 0,
      why: "NULL is the correct shape — the query has no prior month to pair. Zeroing it hides the series boundary; dropping the row hides it harder. COALESCE only when the deck mandates a number, and the caption says so.",
      notes: [
        { choice: 1, why: "A zero delta on the opening row reads as 'flat versus last month' — a claim about a month the query never saw." },
        { choice: 3, why: "The average is a fabricated prior. The audit culture's rule: a value with no evidence is a footnote, never a fill." },
      ],
      difficulty: "medium",
    },
    {
      id: "icici-mcq-26",
      prompt: "Which definition of 'rail-level settlement success rate' survives the audit review?",
      choices: [
        "Cleared legs over attempted legs, computed per rail — card and wire never pooled",
        "Settled dollars over billed dollars, both rails pooled",
        "Paid-status billings over all billings, pooled",
        "Legs over billings, computed per rail",
      ],
      answer: 0,
      why: "Leg grain, per rail, evidence-based: the five split billings ride both rails, so pooling hides the 27-legs-on-22-billings squeeze — and a status-based numerator re-asserts the claim the rail evidence exists to test (card 16 / 37364.00, wire 11 / 32248.00).",
      notes: [
        { choice: 1, why: "Dollars over billed is a coverage ratio, not a success rate — and pooling mixes rails with different attempt profiles. Different KPI, different meeting." },
        { choice: 3, why: "Legs over billings crosses grains — the ratio isn't a rate of anything. The 27-into-22 squeeze is the reason the grains must never mix." },
      ],
      difficulty: "hard",
    },
    {
      id: "icici-mcq-27",
      prompt: "The EMI schedule via WITH RECURSIVE: inside the recursive member, the next balance is computed as…",
      choices: [
        "balance - (EMI - balance * monthly_rate), guarded by WHERE balance > 0",
        "balance - EMI",
        "balance * monthly_rate",
        "EMI * remaining_months",
      ],
      answer: 0,
      why: "Interest accrues on the declining balance: interest = balance × rate, principal = EMI − interest, so each month's payment retires less principal early and more late. balance − EMI silently pretends the interest is free.",
      notes: [
        { choice: 1, why: "That schedule under-accrues interest from month one and never converges to the amortized total — the classic flat-interest bug the desk screens for." },
        { choice: 2, why: "That's the interest line, not a balance — and it never pays the loan off. Hence the WHERE balance > 0 guard." },
      ],
      difficulty: "hard",
    },
    {
      id: "icici-mcq-28",
      prompt: "The KYC-dropoff funnel's stage conversion is computed as…",
      choices: [
        "COUNT(DISTINCT client_id) at each stage, from a staged one-row-per-client CTE, stage n over stage 1",
        "Sum of client events per stage over total events",
        "The average of the stage counts",
        "The raw row count of each stage table",
      ],
      answer: 0,
      why: "Client grain, staged: folding the event feed first — one row per client, flags per stage — stops the fan-out that a client with two document uploads would otherwise push into the verified stage. Conversion is clients over clients, never events over events.",
      notes: [
        { choice: 1, why: "Event grain rewards a client for uploading twice — the verified stage inflates exactly where the process is failing." },
        { choice: 3, why: "Raw stage-table rows carry the same double-count plus whatever stale records the file still holds — the dedupe lesson applies before any funnel folds." },
      ],
      difficulty: "medium",
    },
    {
      id: "icici-mcq-29",
      prompt: "Terms are flat 30 days on this book. Which expression rebuilds each billing's contractual due date from issued_on?",
      choices: [
        "DATE(issued_on, '+30 day')",
        "due_on - 30",
        "julianday(issued_on) + 30",
        "strftime('%d', issued_on) + 30",
      ],
      answer: 0,
      why: "The date modifier adds calendar days and returns a date — and the book agrees: min and max terms both print 30, so any spread in the 28.4-day settlement clock is behavior, not contract.",
      notes: [
        { choice: 2, why: "julianday + 30 returns a float day-number, not a date string — arithmetic without the conversion back." },
        { choice: 3, why: "That adds 30 to the day-of-month number — a '2024-01-31' billing would become day 61 of a month that doesn't have one." },
      ],
      difficulty: "medium",
    },
    {
      id: "icici-mcq-30",
      prompt: "The DPD bucket read must reproduce next week. What pins it?",
      choices: [
        "A stated reference date — MAX(paid_on) or the close date — with buckets off julianday(ref) - julianday(due_on)",
        "CURRENT_DATE evaluated at query time",
        "The status column's own aging",
        "ORDER BY due_on — oldest first implies the buckets",
      ],
      answer: 0,
      why: "A pinned reference is the difference between an aging schedule and a moving target: the no-leg book (6 billings / 15217.00) must bucket against the same anchor every run, and the CASE boundaries get written into the memo.",
      notes: [
        { choice: 1, why: "CURRENT_DATE re-buckets everything each run — the 31-60 bucket drains by a day per week with no collection event behind it." },
        { choice: 2, why: "Status is the claim, not the clock — the paid-status 1756.00 has aged by evidence for cycles while claiming current." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-icici-1",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The collections worklist, per circle",
      brief:
        "ICICI-flavored memo on the storefront db (invoices = client fee billings, payments = settlement legs, customers = clients across four circle books): the circle collections review wants the no-leg worklist — every billing the rails never touched, cut per circle — so the branch desks work evidence, not status claims. Probed facts: the no-rail watch reads **6 billings / 15217.00**, landing as EU 4 / 8524.00, US 1 / 4937.00, APAC 1 / 1756.00 — and the APAC row is the paid-status billing whose audit trail shows no leg ever moved. LATAM's book is clean and must print nothing: *absence, not zero, and membership is rail evidence.*",
      ask: "Return the worklist: circle, no-leg billing count, collections book (2dp) — biggest book first.",
      template:
        "SELECT c.{1} AS circle,\n       COUNT(*) AS worklist_rows,\n       ROUND(SUM(i.{2}) / {3}, 2) AS collections_book\nFROM invoices i\nJOIN customers c ON c.id = i.{4}\nLEFT JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS NULL\nGROUP BY c.region\nORDER BY collections_book {5};",
      slots: [
        {
          answer: "region",
          kind: "keyword",
          label: "the circle label",
          why: "c.region is the circle book — the label the review reads and the GROUP BY's key. The city column would relabel rows at street grain under a region fold: real values, wrong geography for a circle review.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the billed-money column",
          why: "Collections dollars are the billings' own amounts — SUM(i.amount_cents), integer cents. Folding the id column sums primary keys: the probe prints a 0.92 'book' for EU, which is six row numbers divided by a hundred.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divisor",
          noVerify: true,
          why: "The dollar read is amount_cents / 100.0 — float division, rounded once. Divide by 1000 and every book prints a tenth its size (EU reads 852.40 instead of 8524.00); the integer-100 habit matters book-wide because the rails carry odd-cent legs like 2361.50 that truncate silently.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the circle join key",
          why: "Each billing points at its client's primary key — c.id = i.customer_id. Joining on the billing's own id pairs by row-number coincidence, and the unpaid six (ids 18–28) have no customer rows at that number, so the worklist empties to nothing.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the exposure order",
          why: "DESC headlines the biggest collections book — the desks work top-down from EU's 8524.00. ASC opens on APAC's 1756.00 row and buries the live exposure under the small books.",
        },
      ],
      distractors: ["city", "i.id", "1000", "ASC"],
      walkthrough:
        "A collections worklist is an anti-join with the evidence rule attached. The LEFT JOIN keeps every billing and hands unmatched billings NULL legs; WHERE p.id IS NULL keeps exactly the never-settled six — 15217.00 landing as EU 4 / 8524.00, US 1 / 4937.00, APAC 1 / 1756.00 — and the APAC row is the book's famous anomaly: status claims paid, the trail shows no leg, and it stays on the list because membership is evidence, not the status column. GROUP BY c.region folds per circle, SUM(i.amount_cents)/100.0 — rounded once — sizes each book, and LATAM prints no row at all: a clean book is an absence, not a zero line. The distractors fail honestly: 'city' relabels rows at street grain under a region fold, 'i.id' as the join key pairs by row-number coincidence and the six (ids 18–28) lose their customer rows — the worklist empties; as the money column it sums primary keys into a 0.92 'book'; 1000 prints every book a tenth its size; ASC buries EU under APAC. The habit being graded: the IS NULL arm IS the metric — the watch is defined by what never moved.",
    },
    {
      id: "cs-icici-2",
      tier: "hard",
      topic: "x3",
      universe: "refund-audit",
      title: "The rail audit stack",
      brief:
        "ICICI-flavored memo on the storefront db (payments = settlement legs, method card/wire = the two rails): the rails desk wants the settlement stack at close — legs, distinct billings touched and settled dollars per rail, plus a TOTAL banner row to cross-foot against the cash book before the pack ships. Probed facts: card cleared **16 legs / 37364.00**, wire **11 / 32248.00**, and the TOTAL row reads **27 legs / 69612.00** — tying the cash book's debit fold line for line. The squeeze: 27 legs fold onto only 22 billings, because five billings rode split plans that cross rails. *The banner must mean the whole feed, folded the same way as the rails beneath it.*",
      ask: "Return the stack: rail, settlement legs, billings touched, settled dollars (2dp) — plus a TOTAL banner row cross-footing the book, biggest dollars first.",
      template:
        "SELECT p.{1} AS rail,\n       COUNT(*) AS settlement_legs,\n       COUNT(DISTINCT p.invoice_id) AS billings_touched,\n       ROUND(SUM(p.{2}) / {3}, 2) AS dollars\nFROM payments p\nGROUP BY rail\n\nUNION ALL\n\nSELECT '{4}',\n       COUNT(*),\n       COUNT(DISTINCT invoice_id),\n       ROUND(SUM(amount_cents) / 100.0, 2)\nFROM payments\nORDER BY dollars {5};",
      slots: [
        {
          answer: "method",
          kind: "keyword",
          label: "the rail grouping key",
          why: "p.method is the rail — card and wire, the two settlement paths the census names. Grouping on paid_on re-folds the book per settlement date and on invoice_id per billing: the two-rail census shreds into a calendar or a billing list.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the settled-money column",
          why: "Settled dollars are the legs' own amounts — SUM(p.amount_cents), integer cents. SUM(p.id) sums primary keys and SUM(p.paid_on) sums date strings (the probe prints 323.87 — sixteen years divided by a hundred) — neither is money.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divisor",
          noVerify: true,
          why: "The dollar read is amount_cents / 100.0 — float division, rounded once. The rails carry odd-cent legs (2361.50 on card, 2229.50 on wire), so an integer-100 read truncates them until the cross-foot misses the cash book's 69612.00 by half-dollars.",
        },
        {
          answer: "TOTAL",
          kind: "keyword",
          label: "the banner literal",
          why: "The UNION ALL banner row must label itself TOTAL — the row the close cross-foots against the cash book. Any other literal plants a mystery line at total grain (a 'card' banner would sit beside the real card rail at 27 legs / 69612.00, and the stack lies by structure).",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the banner-first order",
          why: "ORDER BY dollars DESC puts the TOTAL banner on top with the rails beneath by size — banner, then card 37364.00, then wire 32248.00. ASC reads the stack upside-down: the rails first, the cross-foot buried at the bottom where nobody checks it.",
        },
      ],
      distractors: ["invoice_id", "paid_on", "1000", "ASC"],
      walkthrough:
        "A rail audit stack is two folds of the same feed at two grains, stacked by UNION ALL. The upper SELECT folds legs per method: card 16 legs / 16 billings / 37364.00, wire 11 / 11 / 32248.00 — per-rail billing counts look clean because the five split billings each ride one leg per rail; the lower SELECT folds the whole feed and labels itself TOTAL: 27 legs, 22 billings, 69612.00. The squeeze — five more legs than billings — is visible only at total grain, and it is the cross-rail split story the rails desk lives in. The cross-foot is the point: 37364.00 + 32248.00 = 69612.00, tying the cash book's debit fold line for line, with ROUND(.../100.0, 2) converting cents exactly once at the edge. UNION ALL, not UNION — the rows are distinct anyway and nothing needs deduping. The distractors fail honestly: 'invoice_id' or 'paid_on' in the rail slot shreds the census into 22 billing rows or a per-day calendar; the wrong divisor truncates the odd-cent legs (2361.50, 2229.50) until the cross-foot misses; a relabeled banner breaks the TOTAL contract; ASC buries the banner. The habit being graded: a grand-total row is a definition — same feed, same fold, said out loud.",
    },
    {
      id: "cs-icici-3",
      tier: "medium",
      topic: "s6",
      universe: "funnel",
      title: "The fee-event state board",
      brief:
        "ICICI-flavored memo on the storefront db (orders = booked fee events; status = where the event sits in the booking lifecycle): the onboarding review wants the {rose:dropoff board} — fee events cut per circle into settled, in-flight, awaiting and lost — for circles with a real book. Probed facts: the network reads **52 settled / 30 in-flight / 14 awaiting / 7 lost** (50.5% settled), and the circle cut lands EU 45 events (24 settled, 12 in flight, 6 awaiting, 3 lost), APAC 37 (21/8/5/3), US 19 (5/10/3/1) — the only circle where in-flight outruns settled. LATAM's 2-event book stays off the board: *a funnel with no volume is an anecdote, not a stage.*",
      ask: "Return the gated state board: circle, events, settled, in-flight, awaiting, lost — biggest book first.",
      template:
        "SELECT c.region AS circle,\n       COUNT(*) AS events,\n       SUM(CASE WHEN o.status = '{1}' THEN 1 ELSE 0 END) AS settled,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS in_flight,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS awaiting,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS lost\nFROM orders o\nJOIN customers c ON c.id = o.{2}\nGROUP BY c.{3}\nHAVING COUNT(*) >= {4}\nORDER BY events {5};",
      slots: [
        {
          answer: "delivered",
          kind: "keyword",
          label: "the settled-state literal",
          why: "'delivered' is the state the settled arm counts — the board's proof cell (EU 24, APAC 21, US 5). 'shipped' would quietly relabel the column into a second in-flight count and the settled story becomes a different claim.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the circle join key",
          why: "Fee events attach to circle books through c.id = o.customer_id. Joining on o.id pairs each event with whichever client shares its row number — most of the 103 events have no client at that number, and the fold collapses before the gate.",
        },
        {
          answer: "region",
          kind: "keyword",
          label: "the circle grain",
          why: "GROUP BY c.region folds 103 events into the four circle books the review reads. Grouping by city re-folds at street grain — 17 city keys, and only Berlin's 24-event household survives the gate.",
        },
        {
          answer: "19",
          kind: "number",
          label: "the volume gate",
          why: "HAVING COUNT(*) >= 19 keeps the three circles with a real funnel — EU 45, APAC 37, US 19 (the gate sits exactly on US's book) — and drops LATAM's 2-event anecdote. 19 is also a result cell: US's own event count.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book order",
          why: "ORDER BY events DESC leads the board with EU's 45 and buries nothing. ASC opens on US's 19 — the boundary circle — and reads the funnel smallest-first.",
        },
      ],
      distractors: ["shipped", "city", "id", "ASC", "2"],
      walkthrough:
        "A state board is a CASE pivot over one fold, with the gate on volume. The join attaches circle keys to 103 fee events; GROUP BY c.region folds them into four books; each SUM(CASE …) arm counts one lifecycle state — settled (delivered), in-flight (shipped), awaiting (pending), lost (cancelled). The board prints EU 45 / 24-12-6-3, APAC 37 / 21-8-5-3, US 19 / 5-10-3-1, and the gate at 19 drops LATAM's 2-event book — sitting exactly on US's count, which is why the gate reads as a volume bar and 19 doubles as a result cell. The reads the review argues about are visible in the arms: the network's 52/30/14/7 split (50.5% settled), and US the only circle where in-flight (10) outruns settled (5) — a pipeline shape, not a book-value shape. The distractors fail honestly: 'shipped' swaps the settled arm into a second in-flight column; 'city' re-folds at street grain until Berlin is the only survivor; 'id' as the join key empties the fold; 'ASC' inverts the lead; '2' re-admits the anecdote. Arms, key, grain, gate, order — five decisions, and each distractor breaks exactly one.",
    },
    {
      id: "cs-icici-4",
      tier: "medium",
      topic: "t7",
      universe: "expense",
      title: "The branch opex walk",
      brief:
        "ICICI-flavored memo on the storefront db (expenses = branch-and-ops opex lines, amount_cents integer cents): the facilities review wants the monthly opex walk at the 2024-08 close — opex lines, opex dollars, and each kept month's move against the prior KEPT month. Probed facts: monthly opex runs from **1719.00 in 2024-01** to 1650.00 in 2025-02 and peaks at **3210.00 in 2024-08**; the materiality gate at 1650.00 keeps nine months and drops the five thin books — 2024-02 (1440.00), 2024-05 (1480.00), 2024-06 (1510.00), 2024-09 (1545.00) and 2024-12 (1610.00). *A gap month is a break in the series, not a zero — the delta reads against the prior kept month, and the caption says so.*",
      ask: "Return the gated opex walk: month, opex lines, opex (2dp), MoM delta (2dp) — calendar order.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(spent_on, 1, 7) AS month,\n         COUNT(*) AS opex_lines,\n         ROUND(SUM(amount_cents) / {1}, 2) AS opex\n  FROM expenses\n  GROUP BY month\n  HAVING SUM(amount_cents) / 100.0 >= {2}\n)\nSELECT month,\n       opex_lines,\n       opex,\n       ROUND(opex - {3}(opex) OVER (ORDER BY month), 2) AS delta\nFROM monthly\nORDER BY month {4};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divisor",
          why: "Opex dollars are amount_cents / 100.0 — float division, rounded once at the edge. /1000 reads every month at a tenth its size (the 3210.00 peak becomes 321.00) and the walk stops tying to the branch ledgers.",
        },
        {
          answer: "1650",
          kind: "number",
          label: "the materiality gate",
          why: "The gate keeps nine months and drops the five thin books; 1650.00 (2025-02) sits exactly on the line and is a result cell of the walk itself. A lower gate re-admits 1610.00's December and the 'kept' series changes definition.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the look-back",
          why: "Each kept month's delta is opex minus the PRIOR KEPT month: LAG(opex) OVER (ORDER BY month) pairs 2024-03's 1917.00 against 2024-01's 1719.00 — the gap where 2024-02 dropped made visible, not smoothed. LEAD reads the series backwards.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the calendar direction",
          why: "The walk reads January to the close; ASC keeps the calendar. DESC opens on 2025-02 and hands the review a reversed series whose deltas read with the wrong signs.",
        },
      ],
      distractors: ["1000", "LEAD", "DESC", "AVG"],
      walkthrough:
        "An opex walk is three stages: bucket, gate, look back. SUBSTR(spent_on, 1, 7) buckets the branch cost lines into month keys; the gate — SUM(amount_cents)/100.0 >= 1650 — keeps the nine material books and drops 2024-02, 2024-05, 2024-06, 2024-09 and 2024-12; ROUND(SUM(amount_cents)/100.0, 2) converts cents exactly once, printing the walk's dollar spine from 1719.00 up to the **3210.00** peak in 2024-08. LAG(opex) OVER (ORDER BY month) then pairs each kept month with the prior KEPT month: 2024-03 books +198.00 against 2024-01 (the February gap is visible as a jump, not a zero), 2024-08 books +1416.00, 2024-10 books −1351.00 — the peak unwinding — and the opening month prints NULL, the shape that proves the series starts where it says. The distractors fail honestly: 1000 re-scales every dollar to a tenth its size and empties the gate; LEAD flips every delta's sign; DESC reverses the calendar; AVG turns the delta column into a running mean — a different KPI wearing the same header. Bucket, gate, look-back, direction: the walk is four decisions, and each distractor breaks exactly one.",
    },
    {
      id: "cs-icici-5",
      tier: "hard",
      topic: "q6",
      universe: "month-close",
      title: "The settlement clock, per circle",
      brief:
        "ICICI-flavored memo on the storefront db (invoices = client fee billings, payments = settlement legs): the collections review wants the settlement clock cut per circle — first-settlement lag per billing, circles with at least five settled billings, slowest book first — to set next quarter's terms talk. Probed facts: the book's clock is **20 settled billings averaging 28.4 days** issue-to-first-settlement, fastest 13, slowest 84, against flat 30-day terms. The staged read (first leg per billing, then the circle fold) prints US 5 settled / 36.6 days, APAC 7 / 27.3, EU 8 / 24.4 — *only the US book sits above the 28.4-day bar, and the split billings must weight their circle once, not twice.*",
      ask: "Return the circle clock: circle, settled billings, average days to first settlement (1dp) — slowest first, gated at five.",
      template:
        "WITH first_leg AS (\n  SELECT i.id,\n         i.customer_id,\n         i.issued_on,\n         MIN(p.{1}) AS first_settled\n  FROM invoices i\n  JOIN payments p ON p.invoice_id = i.id\n  WHERE i.status = '{2}'\n  GROUP BY i.id\n)\nSELECT c.{3} AS circle,\n       COUNT(*) AS settled_billings,\n       ROUND(AVG(julianday(first_settled) - julianday(issued_on)), 1) AS avg_days\nFROM first_leg\nJOIN customers c ON c.id = first_leg.customer_id\nGROUP BY circle\nHAVING COUNT(*) >= {4}\nORDER BY avg_days {5};",
      slots: [
        {
          answer: "paid_on",
          kind: "keyword",
          label: "the first-settlement timestamp",
          why: "MIN(paid_on) folds each billing's legs to its FIRST settlement — the splits (five billings ride two rails) weight their circle once. MIN(p.method) folds to a string no calendar can read and the lag column NULLs out.",
        },
        {
          answer: "paid",
          kind: "keyword",
          label: "the evidence filter",
          why: "status = 'paid' keeps the settled book the clock is defined on — 20 billings. 'void' admits the void-but-drawn 925.00 (a claim the trail contradicts) and 'open' admits the 4000.00-partial — both are settlement-hygiene findings, not tempo evidence.",
        },
        {
          answer: "region",
          kind: "keyword",
          label: "the circle key",
          why: "c.region is the circle book the review reads. The city column re-folds at street grain — the US book's five settled billings split across Austin (3) and Chicago (2) and neither city clears the gate.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the sample gate",
          why: "HAVING COUNT(*) >= 5 keeps the three circles whose settled book is a sample worth reading — US 5 (the gate sits on it), APAC 7, EU 8. 5 is also a result cell: the US book's own count. Seven drops US; eight leaves EU alone.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the slowest-first order",
          why: "ORDER BY avg_days DESC headlines the problem book — US 36.6 — which is the whole point of the pack. ASC opens on EU's 24.4 and buries the circle that is actually late.",
        },
      ],
      distractors: ["method", "open", "void", "city", "7", "ASC"],
      walkthrough:
        "A settlement clock is a staged read: fold legs per billing, then fold billings per circle. The CTE takes MIN(paid_on) per billing — first settlement, not every leg, so the five split billings weight their circle once — and the status filter pins the book to 'paid', which keeps the void-but-drawn 925.00 and the open 4000.00-partial out of a tempo read that isn't about them. The outer fold averages julianday(first_settled) - julianday(issued_on) per circle: US 5 billings at **36.6 days**, APAC 7 at 27.3, EU 8 at 24.4 — and against the book's **28.4-day** bar (fastest 13, slowest 84, terms flat 30), only the US book is slow. The gate at 5 sits exactly on the US count and is a result cell besides. The distractors fail honestly: 'method' folds the timestamp slot to a rail string and NULLs every lag; 'open' and 'void' admit the hygiene findings into the tempo book; 'city' shreds the circles at street grain; 7 and 8 cut the gate until the late circle is gone; ASC reads the pack fastest-first. Stage, filter, fold, gate, order — the clock is five decisions.",
    },
    {
      id: "cs-icici-6",
      tier: "medium",
      topic: "j7",
      universe: "growth",
      title: "The product-line revenue board",
      brief:
        "ICICI-flavored memo on the storefront db (products = account and card products, order_items = booked fee lines): the cross-sell review wants the product-line board — booked fee revenue, units and distinct fee events touched per product family, families carrying at least 53 units — to pick the next branch push. Probed facts: **Audio's 97 units book 11744.01** and lead the network; Wearables' 53 units book 6929.12, Video 61 / 5198.41, Electronics 85 / 4818.61, Accessories 121 / 3294.29, Apparel 54 / 1984.93 — and Accessories touches the most fee events (54) on the smallest dollars, the attach-versus-value split the review exists to argue. Fitness' 27-unit book stays off the board.",
      ask: "Return the gated product-line board: line, fee events touched, units, fee revenue (2dp) — biggest revenue first.",
      template:
        "SELECT p.{1} AS product_line,\n       COUNT(DISTINCT oi.order_id) AS events_touched,\n       SUM(oi.quantity) AS units,\n       ROUND(SUM(oi.quantity * oi.{2}), 2) AS fee_revenue\nFROM order_items oi\nJOIN products p ON p.id = oi.{3}\nGROUP BY p.category\nHAVING SUM(oi.quantity) >= {4}\nORDER BY fee_revenue {5};",
      slots: [
        {
          answer: "category",
          kind: "keyword",
          label: "the product-line column",
          why: "p.category is the product family the board reads — the fold's grain. The name column prints product labels under a family fold: real values, wrong grain, a board nobody can act on.",
        },
        {
          answer: "unit_price",
          kind: "keyword",
          label: "the booked-money column",
          why: "Fee revenue is units times the booked unit_price — the transaction's own price. The catalog's list price is a different column: booking at p.price re-prices the whole board (the network's 34833.28 becomes 34802.17) and the family ranking drifts.",
        },
        {
          answer: "product_id",
          kind: "keyword",
          label: "the product key",
          why: "Fee lines attach to products through p.id = oi.product_id. Joining on oi.id wires each line to whichever product shares its row number — the fold re-prices on coincidence and the gate keeps the wrong families.",
        },
        {
          answer: "53",
          kind: "number",
          label: "the units gate",
          why: "HAVING SUM(oi.quantity) >= 53 keeps the six families with a real book and drops Fitness' 27 units. 53 is also a result cell — Wearables' book sits exactly on the gate, which is why the bar reads as materiality.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-revenue order",
          why: "ORDER BY fee_revenue DESC leads with Audio's 11744.01 and reads the board as a revenue ladder. ASC opens on Apparel's 1984.93 and buries the line the push is actually about.",
        },
      ],
      distractors: ["name", "price", "id", "27", "ASC"],
      walkthrough:
        "A product-line board is a join-fold with a gate: fee lines join to products, GROUP BY p.category folds 251 lines into seven families, and three measures ride the same fold — COUNT(DISTINCT oi.order_id) for fee events touched (the anti-fan-out count: Accessories touches 54 events on 121 units), SUM(oi.quantity) for units, and SUM(oi.quantity * oi.unit_price) for booked revenue, rounded once at the edge. The gate at 53 units keeps six families and drops Fitness' 27; the ladder reads **Audio 11744.01**, Wearables 6929.12, Video 5198.41, Electronics 4818.61, Accessories 3294.29, Apparel 1984.93. The review's argument is already in the cells: Accessories leads attach (54 events) and trails value (3294.29) — the attach-versus-value split. The distractors fail honestly: 'name' prints product labels under a family fold; 'price' re-books the board at list prices (the network total drifts 34833.28 → 34802.17); 'id' as the join key re-prices on row-number coincidence; 27 re-admits Fitness; ASC inverts the ladder. Column, key, gate, order — the board is four decisions, and each distractor breaks exactly one.",
    },
  ],

  problems: [
    { slug: "settlement-fails-aging", why: "T+2-style aging buckets over unsettled items: the no-leg watch (6 billings / 15217.00) aged against flat 30-day terms — the circle collections ladder in textbook shape." },
    { slug: "journal-gap-detection", why: "Sequence gaps in a journal: the ledger's 80 entries audited for missing post dates — the branch-audit control that catches a feed that dropped a day." },
    { slug: "delinquency-roll-rates", why: "State-to-state roll rates: how billings move open-to-partial-to-settled between cycles — the movement read behind the coverage census." },
    { slug: "expected-credit-loss", why: "Weighted provision folds over exposure bands: probability-weighted dollars on the receivables book — the provision read behind the watch." },
    { slug: "loan-amortization-schedule", why: "EMI recursion over a payment spine: the retail loan schedule the branch desk rebuilds every disbursement — payments, interest split, balance walk." },
    { slug: "credit-utilization-bands", why: "Card utilization bands: the card-portfolio health read — utilization buckets the cards desk watches before limits move." },
    { slug: "structuring-detection", why: "Threshold-hugging HAVING guards: the rails desk's screen for value parked just under reporting lines — settlement hygiene at flow scale." },
    { slug: "circular-transfers", why: "Round-trip pair screens: value that leaves a household and returns — the wire-rail hygiene screen for round-tripped flow." },
    { slug: "wash-trade-detection", why: "Mirror-leg detection: split-plan legs that mirror each other across rails — the cross-rail screen the 27-into-22 squeeze teaches." },
    { slug: "prepayment-detection", why: "Early-settlement flags against a schedule: billings settled before day 30 of flat terms — the 13-day fastest settlement found mechanically." },
    { slug: "second-most-recent-activity", why: "Argmax with rank: each household's second-latest fee event — the relationship manager's lapsed-cycle screen, windows drilled properly." },
    { slug: "daily-balance-interest", why: "Day-weighted balance math on a date spine: interest over the cash book — where the 69612.00 fold earns its keep." },
    { slug: "fx-exposure-report", why: "Latest-rate joins normalizing currencies: the international circle's read, where branch books must land in one reporting currency." },
    { slug: "risk-based-pricing", why: "Band joins between exposure and price tables: card pricing that steps by band — the billing-cycle engine as a join problem." },
    { slug: "split-adjusted-position", why: "One economic event, several recorded legs: the split-plan billing read in miniature — normalize before you sum." },
    { slug: "portfolio-concentration-hhi", why: "Concentration indices over the book: the 63.5% of value the top households carry, computed the way the risk review quotes it." },
    { slug: "keep-latest-dedupe", why: "Keep-latest per client via ROW_NUMBER: one client, two KYC records, and the funnel double-counts — the dedupe pass that fixes the client file before any census folds. Curated fill." },
    { slug: "null-blank-audit", why: "NULL/blank sweep across the client file: the KYC-hygiene read that catches an empty email before the onboarding push does — a census of absence, not a join. Curated fill." },
    { slug: "account-balance", why: "Running balance over a transaction spine: the cash book's 44196.00 net fold walked day by day — the rollforward shape the branch proof re-runs every close. Curated fill." },
    { slug: "find-the-missing-ids", why: "WITH RECURSIVE over an id spine hunting gaps: the journal-completeness control — a ledger whose 80 entries must account for every posting date, or the feed dropped a day. Curated fill." },
    { slug: "median-time-to-convert", why: "Median emulation over a lag: the settlement clock's middle sibling — 28.4 days is the mean, 13 to 84 the spread, and the median is the number the collections desk plans around. Curated fill." },
    { slug: "rfm-segmentation", why: "NTILE tiers over recency, frequency, value: the client book cut into segments the relationship managers work — the 63.5%-concentration whale list, formalized. Curated fill." },
    { slug: "cohort-retention-matrix", why: "Cohort offset matrix: billing cohorts followed cycle by cycle — the vintage view of the fee book, where each month's cohort is its own panel. Curated fill." },
    { slug: "week-over-week-churn", why: "LAG over weekly client states: the activity read behind the lapsed-client screen — who stopped transacting this week that didn't last week. Curated fill." },
    { slug: "rolling-7d-actives", why: "Rolling distinct counts over a 7-day frame: the rail-activity read — flow this week against the trailing week, windows drilled with the frame named. Curated fill." },
    { slug: "year-on-year-growth-rate", why: "LAG prior-year folds: fee revenue this month versus the same month last year — the growth read the board deck quotes with the seasonality caveat attached. Curated fill." },
    { slug: "growth-accounting", why: "LAG state transitions: new, retained, walked — the client-state migration read that turns a status column into a flow, the same discipline the coverage census runs. Curated fill." },
    { slug: "investments-in-2016", why: "Same-value, same-day pair screens: mirror legs that deserve a second look — the duplicate-charge read at billing grain, the 27-into-22 squeeze made visible. Curated fill." },
    { slug: "symmetric-pairs", why: "EXISTS mirror-pair tests: value that left a household and came back through a paired rail — the round-trip screen's formal shape at wire-rail grain. Curated fill." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "LAG flags over ordered legs: escalating amounts, each hit bigger than the last — the escalation screen the rails desk runs before structuring becomes a finding. Curated fill." },
    { slug: "customers-who-bought-all-products", why: "Relational division: clients holding every product in a family — the cross-sell completeness read that names who the branch still has to call. Curated fill." },
    { slug: "restaurant-growth", why: "Trailing 7-day frame over a date spine: the flow average the branch staffs against — rolling windows where the frame is stated, never implied. Curated fill." },
  ],
};
