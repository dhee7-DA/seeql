// Santander — kit 11 of the Banking & Capital Markets domain (Batch J, wave 6).
// Global retail bank: UK, Brazil, Spain — the multi-market read, where every
// country book runs its own statement cycles, its own NPL watch and its own
// branch cost lines, and the group only believes numbers that split by market.
// The storefront db maps on honestly: invoices are per-market billings
// (statement cycles and loan notices — the receivables the country books
// carry), payments are the settlement rails (method card / wire — card is the
// retail debit rail, wire the interbank/SEPA-SPI rail), ledger_entries is the
// double-entry book of record, expenses are branch-and-ops cost lines,
// customers are customers across four country books (EU / US / APAC / LATAM
// standing in for the market footprint), orders are booked account/product
// events (REAL dollars — the one table where money is already dollars). Money
// in invoices/payments/expenses/ledger is INTEGER cents — the dollar read is
// always amount_cents / 100.0.
// Pool provenance: Santander has 0 tagged sql rows in the band (checked
// company-pools.md for santander / Santander variants) — 0 tagged LC —
// theme-curated: every topic and problem slug is curated from the theme menu
// to Santander's known question families (per-market folds, NPL buckets,
// branch ops, rails, books of record), provenance stated per problem.
// Case figures: scripts/company-facts.md (probed 2026-10-12).

import type { CompanyKit } from "../types";

export const santanderKit: CompanyKit = {
  id: "santander",
  domainId: "banking",
  name: "Santander",
  tagline: "Global retail bank: UK, Brazil, Spain",
  accent: "text-orange-300",

  brief: [
    "**Santander** is retail banking multiplied by geographies: the same current account, card and loan machinery run as country books — UK, Brazil, Spain and the rest of the footprint — with each market carrying its own statement cycles, its own NPL watch and its own branch cost lines. On this training db the mapping is honest: `orders` are booked account and product events (REAL dollars — the one table where money is already dollars), customers sit across four country books, and every billing a market sends — statement cycle, loan notice, fee memo — lands as a receivable. Probed scale: **103 booked events worth 34833.28**, with the EU book at **45 events / 15089.23**, APAC at 37 / 11605.45, the US at 19 / 7286.16 — and the busiest customer holding **24 events for 7262.35**.",
    "The money tables split by market and prove as one. `invoices` carry the billings — 21 paid exact for 66443.00, 6 open at 19609.00, 1 void at 925.00; `payments` clear them on two rails — card, the retail debit rail (16 settlements for 37364.00), and wire, the interbank/SEPA-SPI rail (11 for 32248.00); `ledger_entries` is the double-entry book where every settled dollar posts twice, integer cents, dollar read always cents / 100.0. The daily proof: **181080.00 debits against 181080.00 credits across 80 entries, delta 0**. The group rule follows: *a number that can't be split by market and tie back to the books is a rumor, not a read.*",
    "The SQL screens are multi-market screens. A warm-up per-market fold (billings, states, rails GROUP BY market), then the two questions this bank is famous for: the {sky:per-market book split} — open book, settled count and the {rose:void-but-settled 925.00} isolated per country via CASE arms — and the {rose:NPL watch} — the no-rail anti-join (**6 billings / 15217.00**) bucketed by issue month against flat 30-day terms. Follow-ups probe the denominator ('open-status or no-receipt — which six?') and the fan-out ('billing count or receipt count — one billing can take two rail hits').",
    "Prep the way the screens run. Drill conditional folds and `FILTER (WHERE …)` censuses, strftime month buckets across the 2024-01 to 2025-02 window, the branch-cost reads (Rent at 14 entries / **16800.00**, Ads at 14 / 4570.00, monthly opex peaking at **3210.00** in 2024-08), and aging math — settled billings average **28.4 days** to first settlement against fastest 13 and slowest 84. Then practice the sentence that gets hired: *same product, different country book — the definition travels, the denominator stays local.*",
  ],

  dayInLife: [
    "**08:00 —** the group proof before the country calls. First query proves the ledger — **181080.00 debits against 181080.00 credits, delta 0** across 80 entries — then the rail census: **card 16 / 37364.00, wire 11 / 32248.00**, cross-footed to the cash book's 69612.00 debit fold. The break list pairs state with evidence: one void billing that still drew **925.00**, one paid-status billing with no rail hit at **1756.00**. The country heads dial in at 08:30; the books tie before they do.",
    "**10:30 —** deep work: the per-market book split. Every market folded with CASE arms — billings, {sky:open book}, settled count — where the EU book carries the open exposure and the void's **925.00**, and one market's open book prints a clean **0**. The instinct being trained: the group total is real only when the market split reproduces it — *sum the parts, then believe the whole.*",
    "**13:30 —** the NPL watch and branch ops, back to back. The no-receipt watch — **6 billings / 15217.00** — bucketed by issue month against flat 30-day terms, with the 4000.00-partial billing named as the one that's open AND received; then the cost lines: Rent at 14 entries / **16800.00** (the branch leases), Ads at 14 / 4570.00, opex peaking 3210.00 in 2024-08. The market lead wants the {emerald:coverage census} with its denominator on the slide — 21 exact / 1 partial / 6 none — not a status count wearing its clothes.",
    "**17:30 —** country review prep and the EOD writeup: every market slide ships with definitions attached — what counts as open, who stays in the watch, which month key buckets the cohorts — and tomorrow's ask is queued for the data-quality board: split settlements landing as two rail hits per billing, waiting on a `ROW_NUMBER` dedupe. *The read goes out in four languages; the denominators travel with all of them.*",
  ],

  metrics: [
    { name: "Booked events by market", what: "Account and product events with value per country book — EU 45 / 15089.23, APAC 37 / 11605.45, US 19 / 7286.16, LATAM 2 / 852.44. The footprint view every group read starts from." },
    { name: "Billing-state mix", what: "Per-market billings by state — network: 21 paid exact / 66443.00, 6 open / 19609.00, 1 void / 925.00. The group total is believed only after the market split reproduces it." },
    { name: "NPL watch", what: "Billings with no settlement row at all — 6 carrying 15217.00, bucketed by issue month against flat 30-day terms. Membership is evidence (no rail hit), not the status column." },
    { name: "Coverage census", what: "Billings by settlement coverage — 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 none. The partial is the row the country reviews argue about: open AND received." },
    { name: "Rail mix", what: "Settlements per rail — card 16 / 37364.00 (retail debit), wire 11 / 32248.00 (interbank/SEPA-SPI). The pair cross-foots to the cash book's 69612.00 debit fold." },
    { name: "Books proof delta", what: "Total debits minus total credits across the ledger — 181080.00 against 181080.00, delta 0 across 80 entries. A nonzero delta pages the close, not a footnote." },
    { name: "Branch cost lines", what: "Branch-and-ops spend by category and month — Rent 14 entries / 16800.00 (branch leases), Ads 14 / 4570.00, monthly opex peaking 3210.00 in 2024-08. The cost read behind every branch conversation." },
    { name: "Settlement lag", what: "Days from billing to first settlement on settled billings — 20 billings, 28.4 days average, fastest 13, slowest 84, against flat 30-day terms. The collections tempo, per market." },
  ],

  topics: [
    {
      name: "Per-market portfolio folds",
      why: "The group number only exists if the market split reproduces it: billings, value and customers GROUP BY market, with group-versus-market benchmarks and per-country ratio reads doing the reality check.",
      slugs: ["countries-you-can-safely-invest-in", "find-expensive-cities", "confirmation-rate"],
    },
    {
      name: "NPL watch & delinquency buckets",
      why: "Retail credit lives on the watch: unpaid billings aged by days past terms, delinquency buckets, vintage default curves and expected-credit-loss weighted folds are exactly the language the country risk reviews run in.",
      slugs: ["delinquency-buckets", "vintage-default-curves", "expected-credit-loss"],
    },
    {
      name: "Billing coverage & partial pays",
      why: "A billing can be open AND received: coverage classification folds receipts per billing and compares to the billed amount — the 4000.00-partial against 6148.00 is the case study every market review cites.",
      slugs: ["bank-account-summary", "immediate-food-delivery-ii", "monthly-transactions-ii"],
    },
    {
      name: "Branch ops & cost lines",
      why: "Branches are the cost story: category folds over cost lines, pacing against plan, and month-bucketed opex (peaking 3210.00 in 2024-08) are the reads the network review is built on.",
      slugs: ["spend-histogram", "budget-pacing", "friday-purchase-iii"],
    },
    {
      name: "Payday cycles & seasonality",
      why: "Retail banking breathes on payday: weekday and month-end cadence reads, spend clustering around paydays and short-window repeat behavior decide when branches staff and campaigns fire.",
      slugs: ["friday-purchases-i", "friday-purchases-ii", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Per-market window boards",
      why: "Country books compete: top-3 billings per market, most-recent cycles per customer and per-partition counts are the boards the monthly country review reads — each market ranked within itself.",
      slugs: ["department-top-three-salaries", "the-most-recent-three-orders", "find-the-team-size"],
    },
    {
      name: "Rails & settlement ops",
      why: "Settlement is operational: velocity bursts per rail, structuring-style HAVING guards and chargeback-style rate rankings are how the rails desk watches card and wire behave — 16 and 11 hits a close, every close.",
      slugs: ["transaction-velocity", "structuring-detection", "chargeback-rate-ranking"],
    },
    {
      name: "Anomaly & fraud screens",
      why: "Country books feed one fraud surface: sliding-window transaction checks, z-score amount anomalies and percentile-ranked suspicion are the screens that pair state with evidence before a read ships.",
      slugs: ["suspicious-bank-account-transactions", "amount-anomaly-zscore", "top-percentile-fraud"],
    },
    {
      name: "Books of record & reconciliation",
      why: "The group ties or nothing ships: trial-balance folds (181080.00 against 181080.00, delta 0), ledger-versus-receipt reconciliation and balance rollforwards are the proof drills behind every country call.",
      slugs: ["trial-balance-check", "gl-reconciliation", "balance-rollforward"],
    },
    {
      name: "Recovery & collections math",
      why: "The watch is worked, not just watched: AR aging schedules, delinquency roll-rates and amortization-schedule recursion are the collections-read drills — where a billing sits this month versus last decides the quarter.",
      slugs: ["ar-aging-schedule", "delinquency-roll-rates", "loan-amortization-schedule"],
    },
  ],

  theory: [
    {
      id: "sant-t1",
      q: "The per-market fold joins billings to their settlements and the market counts stop adding up to the billing book. What broke?",
      a: "Fan-out: five billings settled on the split plan carry two settlement rows each, so billings joined to rails print 33 rows and every COUNT(*) on that result counts rail hits, not billings — the market split no longer sums to the 28-billing book. The fix is grain discipline: fold settlements per billing first (derived table or CTE), or protect the count with COUNT(DISTINCT i.id). On Santander screens this is the daily trap — the group rule is that the market split must reproduce the whole, and a fold at rail grain breaks that identity by exactly the split plans.",
      tag: "joins",
    },
    {
      id: "sant-t2",
      q: "The country review wants a board per market — each market's biggest exposures ranked within itself. How do you build that in one query?",
      a: "Window functions with PARTITION BY market: fold per customer or billing, then RANK() OVER (PARTITION BY market ORDER BY value DESC) so every country book gets its own rung 1, and ORDER BY market, rank on the outside so the board reads market by market. Without the partition you get one global ladder where three markets share a single top-ten and two countries' advisors read boards with no top of them. I keep the tie policy explicit — RANK shares rungs on ties, ROW_NUMBER doesn't — and always ORDER BY a deterministic tiebreaker inside the window so the board is reproducible when the country head reruns it.",
      tag: "windows",
    },
    {
      id: "sant-t3",
      q: "Build the coverage census — exact, partial, no rail — per market, so the country reviews can argue with real numbers.",
      a: "As a per-billing classification, folded per market: LEFT JOIN billings to settlements, fold receipts per billing, classify with CASE — no receipt row is the no-rail arm, SUM(receipts) < billed is the partial arm, else exact — then GROUP BY market for the split. The follow-ups are where candidates die: open status is not the no-rail book (19609.00 versus 15217.00 — one open billing took a 4000.00 partial against 6148.00, and one paid-status billing has no rail at all), and the rails join fans split billings, so the census counts DISTINCT billings. I quote the network actuals — 21 exact / 65612.00, 1 partial, 6 none / 15217.00 — and insist the market split reproduces them before the slide ships.",
      tag: "aggregation",
    },
    {
      id: "sant-t4",
      q: "A market report says 'the NPL watch is the open book — both are six billings.' Where does that identity fail?",
      a: "At membership, which the coincidental count hides. The open-status census carries 19609.00; the no-rail anti-join carries 15217.00 — the 4392.00 gap is two honest anomalies: an open billing with a 4000.00 partial settlement (evidence exists, so it leaves the anti-join) and a paid-status billing at 1756.00 with no settlement row (a claim without evidence, so it stays). The lesson for a multi-market book: the anti-join's IS NULL on the right-side key is the definition of 'never settled', and a status column is a claim. I name both lists before choosing — and per market, the two lists can diverge differently, which is exactly why the group insists the split ties back.",
      tag: "nulls",
    },
    {
      id: "sant-t5",
      q: "Walk me through SQL's logical evaluation order and where it bites in a per-market fold.",
      a: "FROM and JOIN build rows, WHERE filters rows, GROUP BY folds them, HAVING filters groups, SELECT projects, ORDER BY and LIMIT run last. The bites: the 'markets with a live open book' gate is HAVING, because the fold doesn't exist at WHERE time; a WHERE on market is a row predicate and belongs above the fold; and SELECT aliases are usable in GROUP BY and ORDER BY in SQLite but not in WHERE. On the market board I keep the country filter in WHERE, the small-book gate on billing counts in HAVING, and I narrate the split — interviewers here are checking whether pipeline order is a mental model, because the group's whole reporting culture depends on folds and gates landing in the right clause.",
      tag: "pipeline",
    },
    {
      id: "sant-t6",
      q: "One market's book looks expensive per billing versus the network average. Scalar subquery, window, or CTE for the benchmark?",
      a: "By how much definition the benchmark needs. A scalar subquery — WHERE billed > (SELECT AVG(amount_cents) FROM invoices) — is the smallest correct form for one network-wide line. AVG() OVER (PARTITION BY market) is the better shape when the review wants each billing beside its own market's mean, because the benchmark travels with the row. A CTE earns its keep when the benchmark gets a definition — 'network average over open-and-paid billings, void excluded' — because a named, commented fold is auditable across four country books and a nested one-liner isn't. Multi-market benchmarks always grow per-market definitions here, so I stage the CTE earlier than fashion suggests.",
      tag: "subqueries",
    },
    {
      id: "sant-t7",
      q: "The NPL watch needs cohort months and days-past-due. How do you handle dates in SQLite for both?",
      a: "Two tools. Cohort buckets with strftime('%Y-%m', issued_on) — a '2024-10' style key that GROUP BY folds cleanly across the 2024-01 to 2025-02 window and sorts correctly as text. Aging needs instant arithmetic: julianday(reference) - julianday(due_on) per billing, against flat 30-day terms — and the trap I always name: julianday over a missing or malformed date NULLs the row silently, so the watch's denominator drifts unless the NULL arm is handled on purpose. The settled billings' own clock runs 28.4 days average billing-to-settlement (fastest 13, slowest 84), which is why the terms being flat 30 is a definition worth checking — min and max terms both print 30 here.",
      tag: "dates",
    },
    {
      id: "sant-t8",
      q: "A void billing in one market still drew a 925.00 settlement, and another market shows a paid billing with no rail hit. What's the group's break policy?",
      a: "Detect, quantify, route — per market, then as a group. Detect by pairing state with evidence: status = 'void' AND a settlement exists (the 925.00 break), status = 'paid' AND no settlement (the 1756.00 break) — a one-pass FILTER (WHERE …) census counts both arms on the same join so every country's numbers come from one scan. Quantify in dollars; route to the desk that owns the fix; never delete, never silently re-status. Then reconcile to the books of record — the ledger still proves 181080.00 against 181080.00, delta 0, because double-entry records what happened, and the journal sequence proves nothing was edited out. The trial balance alone is never sufficient evidence of correctness — that sentence is the group's control culture.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "sant-mcq-1",
      prompt: "The country review needs billings and dollars per market in one pass. Which query shape delivers the split?",
      choices: [
        "SELECT c.region, COUNT(*), ROUND(SUM(i.amount_cents)/100.0,2) FROM invoices i JOIN customers c ON i.customer_id = c.id GROUP BY c.region",
        "SELECT c.region, COUNT(*) FROM customers c GROUP BY c.region",
        "SELECT COUNT(*), SUM(amount_cents) FROM invoices",
        "SELECT region FROM invoices GROUP BY country",
      ],
      answer: 0,
      why: "Join billings to their country book, fold per market: the split that must reproduce the network total — 28 billings across the books — before anyone believes the whole.",
      notes: [
        { choice: 1, why: "That counts CUSTOMERS per market, not billings — 16 people, not 28 billings. The grain is wrong before the fold even runs." },
        { choice: 3, why: "'country' isn't a column on the billing table — the query errors. The market key lives on the customer side and arrives via the join." },
      ],
      difficulty: "easy",
    },
    {
      id: "sant-mcq-2",
      prompt: "The NPL cohort card buckets open billings by issue month ('2024-10', '2025-01', …). Which expression builds the key?",
      choices: [
        "strftime('%Y-%m', issued_on)",
        "strftime('%M', issued_on)",
        "SUBSTR(issued_on, 9, 2)",
        "DATE(issued_on)",
      ],
      answer: 0,
      why: "strftime('%Y-%m', issued_on) prints the '2024-10' month key the cohort card buckets on — and the keys sort correctly as text.",
      notes: [
        { choice: 1, why: "%M is MINUTES in SQLite, not month — every billing buckets by wallclock minute 00–59. The classic strftime trap, and the cohort card dissolves." },
        { choice: 2, why: "Characters 9–10 are the day of month — a 31-bucket calendar, not a monthly cohort. Month keys start at character 1 with length 7." },
      ],
      difficulty: "easy",
    },
    {
      id: "sant-mcq-3",
      prompt: "The market board must headline the biggest open book first. Which clause does it?",
      choices: [
        "ORDER BY open_book DESC",
        "ORDER BY open_book",
        "ORDER BY open_book LIMIT 1",
        "GROUP BY open_book DESC",
      ],
      answer: 0,
      why: "DESC headlines the largest fold — the board reads top-down by exposure. The default is ascending, which would open the review on the market with a clean 0.00 open book.",
      notes: [
        { choice: 1, why: "Ascending by default — the smallest book tops the slide. Direction is part of the definition, not a styling choice." },
        { choice: 3, why: "GROUP BY folds rows into groups; it takes columns, not directions, and can't order anything. The clause belongs to a different sentence entirely." },
      ],
      difficulty: "easy",
    },
    {
      id: "sant-mcq-4",
      prompt: "A billing-to-settlement join for the market split returns 33 rows on a 28-billing book. The per-market billing counts are:",
      choices: [
        "COUNT(*) per market — 33 is the book now",
        "COUNT(DISTINCT i.id) per market — five split-plan billings carry two rail hits each",
        "27 per market — the void billing vanished",
        "Whatever the join returns — counts never need protecting",
      ],
      answer: 1,
      why: "Split settlements double the rows for five billings, so the join prints 33 at rail grain. COUNT(DISTINCT i.id) folds back to billing grain — the grain whose market split must reproduce the 28-billing book.",
      notes: [
        { choice: 0, why: "COUNT(*) counts rail hits — the market split then fails the group's tie-back rule by exactly the split plans, and nobody can say why the parts exceed the whole." },
        { choice: 2, why: "The void billing is still a billing on the book — it holds a place in the census whether or not a rail ever hit it. Dropping it conflates the billing book with the settlement feed." },
      ],
      difficulty: "medium",
    },
    {
      id: "sant-mcq-5",
      prompt: "Two sixes: the open-status census reads 6 billings / 19609.00; the no-rail anti-join reads 6 billings / 15217.00. The gap is:",
      choices: [
        "Rounding drift between cents and dollars",
        "Membership: the open 4000.00-partial billing has a settlement (out of the anti-join), and a paid-status 1756.00 billing has none (in it)",
        "The anti-join excludes void billings",
        "Nothing — same six billings, same dollars",
      ],
      answer: 1,
      why: "Same count, different sets — the anti-join keys on settlement evidence, not status. The 4392.00 swing is exactly the two honest anomalies in the book, and per market they sit differently, which is why the group tie-back rule exists.",
      notes: [
        { choice: 3, why: "If the sets were identical the dollars would tie too — they don't. Equal counts with unequal dollars is the signature of different membership, not of agreement." },
        { choice: 0, why: "Both reads divide by 100.0 the same way. 'Rounding' is the excuse that stops the investigation one step before the actual finding." },
      ],
      difficulty: "medium",
    },
    {
      id: "sant-mcq-6",
      prompt: "The board keeps only markets whose open book exceeds zero. Where does that gate go?",
      choices: [
        "WHERE open_book > 0",
        "HAVING SUM(CASE WHEN status='open' THEN amount_cents ELSE 0 END) > 0",
        "LIMIT 0",
        "WHERE market IS NOT NULL",
      ],
      answer: 1,
      why: "The gate is on a fold, and folds exist only after GROUP BY — the gate is HAVING, written against the conditional fold itself. WHERE runs before any fold exists.",
      notes: [
        { choice: 0, why: "WHERE can't see SELECT aliases or folds — open_book isn't born yet at row-filter time. It either errors or filters something else entirely." },
        { choice: 2, why: "LIMIT 0 returns nothing — a clean report of no markets. The gate and the cap are different sentences; only one of them keeps the markets with exposure." },
      ],
      difficulty: "medium",
    },
    {
      id: "sant-mcq-7",
      prompt: "Branch cost lines: Rent logs 14 entries for 16800.00 and Ads logs 14 entries for 4570.00. What separates the two lines on the report?",
      choices: [
        "COUNT — Rent has more entries",
        "SUM — same entry count, wildly different dollars",
        "Nothing — equal counts mean equal costs",
        "AVG of entry dates",
      ],
      answer: 1,
      why: "The category fold needs SUM(amount_cents)/100.0 beside COUNT(*) — 14 entries each, 16800.00 versus 4570.00. A count-only report flattens the cost story to noise.",
      notes: [
        { choice: 0, why: "Counts tie at 14 — count alone can't separate the lines, and reporting counts as costs is how a branch-lease bill and an ad campaign look identical on a slide." },
        { choice: 3, why: "Averaging dates tells you when, not how much. The cost read is a money fold; the timing is a separate question with a separate query." },
      ],
      difficulty: "medium",
    },
    {
      id: "sant-mcq-8",
      prompt: "Coverage census: one billing was billed 6148.00 and took a 4000.00 settlement. Which read classifies it partial?",
      choices: [
        "WHERE status = 'partial'",
        "Fold receipts per billing and compare: SUM(receipts) < billed",
        "WHERE amount_cents = 614800",
        "GROUP BY status and eyeball the open row",
      ],
      answer: 1,
      why: "Coverage is evidence across two tables: fold the billing's settlement rows, compare to the billed amount — 4000.00 against 6148.00 is partial. No such status exists in the book; the state is computed, never stored.",
      notes: [
        { choice: 0, why: "The billing still says open while carrying 4000.00 of settlements — filtering on a status that doesn't exist returns an empty census and the partial never surfaces." },
        { choice: 2, why: "Hardcoding one amount finds one billing today and nothing next quarter. The definition is the comparison — every partial, present and future, falls out of SUM(receipts) < billed." },
      ],
      difficulty: "hard",
    },
    {
      id: "sant-mcq-9",
      prompt: "Which read isolates the void billing that still drew a 925.00 settlement — per market?",
      choices: [
        "WHERE status = 'void', grouped by market",
        "Pair state with evidence: status='void' AND an EXISTS settlement row, grouped by market",
        "WHERE method = 'void' on the settlement feed",
        "The no-rail anti-join, grouped by market",
      ],
      answer: 1,
      why: "The break is a PAIR — a void claim and a settlement that exists. The paired read proves the rail hit should never have cleared and attributes it to the market whose book absorbed it; status alone shows the void but not the 925.00.",
      notes: [
        { choice: 2, why: "'void' is a billing state, not a rail — the settlement feed carries card and wire only. The query errors and the break stays invisible in the country pack." },
        { choice: 3, why: "The anti-join finds NEVER-settled billings — the opposite evidence. The void-but-settled row HAS a settlement, so the anti-join is structurally blind to it." },
      ],
      difficulty: "hard",
    },
    {
      id: "sant-mcq-10",
      prompt: "The aging read computes days past due as julianday(today) - julianday(due_on) over the watch. What silently shrinks the denominator?",
      choices: [
        "Integer division truncating days",
        "julianday over a NULL or malformed date NULLs the whole row, dropping it from COUNT/AVG",
        "DESC ordering hiding the oldest rows",
        "Nothing — julianday never returns NULL",
      ],
      answer: 1,
      why: "julianday of anything NULL or unparseable returns NULL, and the subtraction propagates it — the row survives the join but vanishes from every fold. The watch's denominator drifts unless the NULL arm is handled on purpose.",
      notes: [
        { choice: 0, why: "Days aren't truncated here — julianday diffs are REAL, and CAST would round, not drop rows. The shrinkage is NULL propagation, not rounding." },
        { choice: 3, why: "julianday(NULL) is NULL by definition — and one malformed date string does the same. 'Never returns NULL' is exactly the assumption that quietly loses a billing from the watch." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-sant-1",
      tier: "medium",
      topic: "s6",
      universe: "growth",
      title: "The per-market book split",
      brief:
        "Santander-flavored memo on the storefront db (invoices = per-market billings, customers = the four country books): the group review wants the market split of the billing book — billings, open book and settled count per market — so the country heads see their own numbers and the group sees them add up. Probed facts: the network book reads 21 paid exact for **66443.00**, 6 open at **19609.00**, 1 void at **925.00** — and the void is the void-but-settled billing that still drew its **925.00** rail hit. The group rule: *the split must reproduce the whole, and a market with a clean open book must print a 0, not an absence.*",
      ask: "Return the split: market, billings, open-book dollars (2dp), settled billing count — biggest open book first.",
      template:
        "SELECT c.{1} AS market,\n       COUNT(*) AS billings,\n       ROUND(SUM(CASE WHEN i.status = '{2}' THEN i.amount_cents ELSE {3} END) / 100.0, 2) AS open_book,\n       SUM(CASE WHEN i.status = 'paid' THEN 1 ELSE 0 END) AS settled_count\nFROM invoices i\nJOIN customers c ON i.customer_id = c.{4}\nGROUP BY c.region\nORDER BY open_book {5};",
      slots: [
        {
          answer: "region",
          kind: "keyword",
          label: "the market column",
          why: "c.region is the country book — the split's grouping axis, and the GROUP BY's key. Any other customer column labels the grouped rows with whatever value happens to ride them: a name or a city where a market belongs.",
        },
        {
          answer: "open",
          kind: "keyword",
          label: "the open-book arm",
          why: "The open book is status = 'open' folded in dollars — the arm the review argues about. 'paid' would fold the settled dollars into a column named open_book, and 'void' would print the 925.00 break as if it were live exposure.",
        },
        {
          answer: "0",
          kind: "number",
          label: "the ELSE arm",
          why: "Non-open billings contribute exactly 0 cents to the open-book fold — the market with no live exposure prints a clean 0.00. Any other constant plants fake exposure in every market's book.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the market join key",
          why: "The join runs on i.customer_id = c.id — each billing points at its customer's primary key. Matching on region, city or name compares integers to text, matches nothing, and empties the split.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the exposure order",
          why: "DESC headlines the market with the biggest open book — the review works top-down. ASC opens on the clean book and the hour is spent on a 0.00 row.",
        },
      ],
      distractors: ["paid", "1", "i.amount_cents", "customer_id", "ASC"],
      walkthrough:
        "A market split is conditional folding with the group's tie-back rule attached. The join attaches each billing to its country book (no settlements involved — one billing, one customer, no fan-out); GROUP BY c.region folds per market; the CASE arms do the split: the open arm sums billed dollars only for open billings with an ELSE 0 that keeps every other billing out of the exposure number, and the settled arm counts paid billings with an ELSE 0 that keeps the count a count. ROUND(.../100.0, 2) converts the cents fold once, at the edge. The result reads as books: the EU book carries the open exposure (and the void's 925.00 rides its fold), one market prints a clean 0.00, and the network total of 19609.00 is the sum of the parts — the tie-back the group rule demands. The distractors fail honestly: 'paid' or 'void' in the open arm fold the wrong state into the exposure, an ELSE of 1 plants a cent of fake exposure per non-open billing, an ELSE of the amount column itself folds every billing into the open book, and a text ELSE coerces silently to zero — the same clean book wearing a different arm; the text-vs-int join keys empty the split; and ASC buries the live exposure under a clean book. The habit being graded: the ELSE arm is a definition — a market's clean book must print 0, not nothing.",
    },
    {
      id: "cs-sant-2",
      tier: "easy",
      topic: "t4",
      universe: "month-close",
      title: "The NPL cohort card",
      brief:
        "Santander-flavored memo on the storefront db (invoices = per-market billings): the NPL review opens on the cohort card — the open book bucketed by issue month, so each country desk sees which statement cycles its live exposure came from. Probed facts: the open book holds **6 billings / 19609.00** against flat 30-day terms (min 30, max 30 — the terms are a definition, not a distribution); the no-receipt watch it feeds is **6 / 15217.00**, and the difference between those two sixes is the 4000.00-partial billing the card exists to keep visible.",
      ask: "Return the cohort card: issue month, billing count, open-book dollars (2dp) — oldest cohort first.",
      template:
        "SELECT {1}('{2}', i.{3}) AS issued_month,\n       COUNT(*) AS billings,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS npl_book\nFROM invoices i\nWHERE i.status = '{4}'\nGROUP BY issued_month\nORDER BY issued_month;",
      slots: [
        {
          answer: "strftime",
          kind: "keyword",
          label: "the bucket function",
          why: "strftime turns the issue date into a bucket key. date() with a format string in its first argument returns NULL for every row, and substr on a date slices characters — neither builds a month key.",
        },
        {
          answer: "%Y-%m",
          kind: "keyword",
          label: "the month format",
          why: "'%Y-%m' prints the '2024-10' month key the cohort card reads. '%Y' collapses to years, and '%M' — SQLite's minutes — buckets by wallclock minute: the classic strftime trap.",
        },
        {
          answer: "issued_on",
          kind: "keyword",
          label: "the cohort date",
          why: "Cohorts are defined by when the billing was ISSUED — the exposure's birthday. Bucketing on due_on shifts every cohort a month down the terms window and mislabels where the exposure came from.",
        },
        {
          answer: "open",
          kind: "keyword",
          label: "the live-exposure filter",
          why: "The cohort card watches the open book — status = 'open', 6 billings / 19609.00. 'paid' would bucket the settled book and 'void' would bucket the one cancelled billing that still drew its 925.00.",
        },
      ],
      distractors: ["date", "substr", "%Y", "%M", "due_on", "paid"],
      walkthrough:
        "A cohort card is a filtered month-bucket fold. WHERE status = 'open' is the population definition — the live exposure the NPL process works, not the settled book and not the void. strftime('%Y-%m', issued_on) builds the cohort key; GROUP BY the alias folds per month; COUNT(*) is the billing census and SUM(amount_cents)/100.0 — rounded once — is each cohort's book. The buckets sort correctly as text, oldest first. The card's value is the story the buckets tell: exposure concentrated in the recent cycles, with the 2025 cohorts carrying the biggest books — and one of those billings is the 4000.00-partial that separates this card's 19609.00 from the no-receipt watch's 15217.00. The distractors fail honestly: date() and substr() in the function slot NULL or slice the key into garbage buckets, '%Y' flattens the calendar to two rows, '%M' buckets by minutes — every billing its own cohort, 'due_on' shifts the cohorts down the 30-day terms window and mislabels the exposure's origin, and 'paid' replaces the live book with the settled one. The habit being graded: the WHERE clause IS the metric, the format string IS the bucket, and the cohort date is a definition — issued, not due.",
    },
  ],

  problems: [
    { slug: "countries-you-can-safely-invest-in", why: "Per-country ratio reads with a gate: the market-screen fold — which country books clear the quality line, computed the way the group review quotes it." },
    { slug: "find-expensive-cities", why: "Group-versus-global average comparison: the market-versus-network benchmark — which country book prices above the whole, the split's sanity check in textbook form." },
    { slug: "confirmation-rate", why: "Rates over grouped relationships with NULL-safe averaging: the per-market completion read — denominators that stay honest when some groups have no denominator at all." },
    { slug: "delinquency-buckets", why: "DPD-style aging buckets: the NPL watch (6 billings / 15217.00) bucketed by days past flat 30-day terms — the country risk ladder in textbook shape." },
    { slug: "vintage-default-curves", why: "Cohort curves over origination periods: which issue-month cohorts sour — exactly this kit's NPL cohort card, drilled on a different schema." },
    { slug: "expected-credit-loss", why: "Weighted provision folds over exposure bands: the ECL read behind the watch — probability-weighted dollars, one CASE-multiply-sum at a time." },
    { slug: "bank-account-summary", why: "LEFT JOIN balance summary keeping empty accounts: the market rollup shape — books with no activity stay visible, which is the group's tie-back rule in miniature." },
    { slug: "immediate-food-delivery-ii", why: "Share of orders meeting a promise flag: the settled-over-billed analog — a conditional fold whose denominator is ALL billings, not the convenient subset." },
    { slug: "monthly-transactions-ii", why: "State pairs stacked in one report: cancelled-and-rejected style splits — the billing-state census the country packs open with, UNION ALL discipline included." },
    { slug: "spend-histogram", why: "Bucket the book by amount bands: the exposure distribution per market — one CASE ladder, every billing placed, no band unaccounted for." },
    { slug: "budget-pacing", why: "Pacing breach detection over running spend: the branch-cost alarm — Rent at 14 entries / 16800.00 pacing against plan, flagged the moment the run-rate crosses." },
    { slug: "friday-purchase-iii", why: "Month-bucketed activity folds: the opex calendar — branch spend by month, peaking 3210.00 in 2024-08, one strftime key at a time." },
    { slug: "friday-purchases-i", why: "Weekday-filtered folds: the payday-cycle read — retail banking breathes on paydays, and this is the drill that finds the breath." },
    { slug: "friday-purchases-ii", why: "Share of partition via windows: the weekday share of monthly volume — per-market cadence reads that survive the group's tie-back rule." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Two events inside a sliding window: the rapid-repeat detection — a customer touching the book twice in a week is a velocity story the rails desk watches." },
    { slug: "department-top-three-salaries", why: "Top-3 per group via windows: the per-market exposure board — each country book's biggest billings ranked within itself, PARTITION BY drilled properly." },
  ],
};
