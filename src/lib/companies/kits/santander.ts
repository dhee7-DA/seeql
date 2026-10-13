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
    "Where the economics sit, per book: the settled side of the ledger is where income becomes cash — 27 rail hits cover 22 distinct billings for 69612.00, and the market split of that settled book reads EU 10 billings / 37261.00, APAC 7 / 20613.00, US 5 / 11738.00 — parts that tie exactly to the cash book's debit fold. The balance-sheet shadows: accounts_receivable carries 86052.00 debited against 69612.00 settled — a net 16440.00 of live carrying exposure — while the cash account runs 27 entries, 69612.00 in, 25416.00 out, 44196.00 net. Concentration is the third lens: the average billing runs **3106.32** and 12 of 28 sit above it, which is why every market review opens with the big-ticket screen before the tail. The {amber:cost-to-serve} read sits underneath: {violet:Rent} at 1200.00 per entry across 14 entries dwarfs {orange:Ads} at 326.43 — only Rent (1200.00) and Travel (840.33) clear the 706.00 network average entry, a two-line outlier list the country packs lead with.",
    "Prep roadmap, in the order the screens ask: week one, folds and filters — conditional aggregation, `FILTER (WHERE …)` censuses, GROUP BY versus HAVING discipline, and the cents habit (fold `amount_cents` in integer space, divide by 100.0 once). Week two, the proofs — per-market tie-backs, rail cross-foots to 69612.00, trial-balance deltas of 0, and the dedupe: a `ROW_NUMBER` leg-numbering pass that turns 27 hits into 22 books. Week three, the deep cuts — scalar-subquery benchmarks against the 3106.32 mean, `LAG` roll-rates on month spines, anti-join membership tests, and UNION ALL tie-out rows that keep the TOTAL literal. Then rehearse out loud: the ledger proves what happened (181080.00 against 181080.00), a status column merely claims it, and *the candidate who pairs state with evidence gets the offer.*",
  ],

  dayInLife: [
    "**08:00 —** the group proof before the country calls. First query proves the ledger — **181080.00 debits against 181080.00 credits, delta 0** across 80 entries — then the rail census: **card 16 / 37364.00, wire 11 / 32248.00**, cross-footed to the cash book's 69612.00 debit fold. The break list pairs state with evidence: one void billing that still drew **925.00**, one paid-status billing with no rail hit at **1756.00**. The country heads dial in at 08:30; the books tie before they do.",
    "**10:30 —** deep work: the per-market book split. Every market folded with CASE arms — billings, {sky:open book}, settled count — where the EU book carries the open exposure and the void's **925.00**, and one market's open book prints a clean **0**. The instinct being trained: the group total is real only when the market split reproduces it — *sum the parts, then believe the whole.*",
    "**13:30 —** the NPL watch and branch ops, back to back. The no-receipt watch — **6 billings / 15217.00** — bucketed by issue month against flat 30-day terms, with the 4000.00-partial billing named as the one that's open AND received; then the cost lines: Rent at 14 entries / **16800.00** (the branch leases), Ads at 14 / 4570.00, opex peaking 3210.00 in 2024-08. The market lead wants the {emerald:coverage census} with its denominator on the slide — 21 exact / 1 partial / 6 none — not a status count wearing its clothes.",
    "**17:30 —** country review prep and the EOD writeup: every market slide ships with definitions attached — what counts as open, who stays in the watch, which month key buckets the cohorts — and tomorrow's ask is queued for the data-quality board: split settlements landing as two rail hits per billing, waiting on a `ROW_NUMBER` dedupe. *The read goes out in four languages; the denominators travel with all of them.*",
    "**21:00 —** the data-quality board, late and quiet: the split-plan dedupe is tonight's item. One `ROW_NUMBER` pass over the rails — `PARTITION BY invoice_id`, biggest amount first, `id` as the tiebreaker — turns 27 hits into 22 distinct billings, and the five split billings (1, 5, 12, 19, 22) surface with two *equal* legs each, which is why the tiebreaker is policy and not decoration. The board signs the aging reference-date rule too: the watch measures against the books' own last activity, `MAX(paid_on)`, not wallclock — the 84-day slowest settlement stays the number every desk quotes. *The late hour buys one thing: tomorrow's slides carry zero undefined terms.*",
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
    { name: "Split-plan census", what: "Rail hits versus distinct billings covered — 27 hits over 22 billings, with five billings (1, 5, 12, 19, 22) riding two equal legs each. The gap of 5 is the dedupe the ROW_NUMBER read exists for." },
    { name: "Cash book position", what: "The cash account's rollforward — 27 entries, 69612.00 debited (both rails land here), 25416.00 credited, 44196.00 net. The destination account every settlement read must reconcile into." },
    { name: "Receivables position", what: "accounts_receivable: 86052.00 debited (open plus paid billings), 69612.00 settled away, 16440.00 net carrying. The balance-sheet shadow of the open book, proofed at every close." },
    { name: "Big-ticket screen", what: "The average billing runs 3106.32 and 12 of 28 billings sit above it. The concentration read each market review opens with — count the tail before the tail counts against you." },
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
    {
      name: "Split-plan dedupe & row discipline",
      why: "The rails feed 27 hits but the book holds 22 distinct billings — five billings ride two equal legs each, and counts that ignore the gap fail the tie-back. ROW_NUMBER leg-numbering with an explicit tiebreaker, duplicate-pair self-joins and latest-row dedupes are the exact drills this cleanup needs.",
      slugs: ["duplicate-charge-pairs", "find-latest-salaries", "biggest-window-between-events"],
    },
    {
      name: "FX & cross-border books",
      why: "Four country books mean four currencies behind one group number: latest-rate joins, normalization folds and tail-risk reads are how the multi-market book gets priced into one currency before it ties back.",
      slugs: ["fx-exposure-report", "average-selling-price", "value-at-risk"],
    },
    {
      name: "Concentration & share-of-book",
      why: "The average billing runs 3106.32 and 12 of 28 sit above it — concentration is a first-class read. Share-of-partition windows, HHI folds and distinct big-ticket censuses are the tools the market reviews quote.",
      slugs: ["portfolio-weights", "portfolio-concentration-hhi", "number-of-rich-customers"],
    },
    {
      name: "Dormancy & reactivation screens",
      why: "Country books cull dormant accounts before provisioning: never-active anti-joins, last-activity argmax reads and reactivation windows decide which books stay staffed — and the empty-book rule (an absence is not a zero) gets drilled here.",
      slugs: ["dormant-reactivation", "maximum-transaction-each-day", "customers-who-never-order"],
    },
    {
      name: "Movement waterfalls & snapshots",
      why: "The group reads book movement, not book level: LAG waterfalls that classify every dollar as new, closed or rolled, CDC-style snapshot deltas and recursive revenue spreads are how a country book explains its month.",
      slugs: ["mrr-waterfall", "snapshot-delta-detect", "deferred-revenue"],
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
    {
      id: "santander-t9",
      q: "The cash rollforward needs a running total of settlements in paid_on order. How do you build it, and where do window frames bite?",
      a: "SUM(amount_cents) OVER (ORDER BY paid_on) — but the default frame is the trap. With ORDER BY present, SQLite's default frame is RANGE between UNBOUNDED PRECEDING and CURRENT ROW, which quietly includes PEER ROWS — every settlement sharing paid_on joins the running sum at once, so the total steps in day-grain lumps instead of row-grain. If the desk wants a strict row-by-row accumulation I say ROWS UNBOUNDED PRECEDING out loud. On this book it matters twice over: the cash account runs 27 entries and both rails land in it — card 37364.00 and wire 32248.00 accumulating toward the 69612.00 debit fold — and a frame that rounds peers together still ties the endpoint but misstates every interim balance the treasury desk reads. I always state the frame explicitly and name the endpoint the rollforward must hit.",
      tag: "windows",
    },
    {
      id: "santander-t10",
      q: "The state census appends a network TOTAL row under the paid/open/void rows. Why UNION ALL and never UNION?",
      a: "UNION dedupes the combined result; UNION ALL appends verbatim. A census is a stack of sets that must each survive byte-for-byte — 21 paid / 66443.00, 6 open / 19609.00, 1 void / 925.00, plus the 28 / 86977.00 tie-out row. With UNION, any two rows that happen to agree on every column collapse into one: two arms with identical counts and dollars, or a state row that mirrors the total on a tiny book, silently rewrites the census and the tie stops adding up. UNION also pays for a dedupe sort the read never asked for. The habit on a multi-market book: the TOTAL row is produced by the same fold over the same population — if the parts and the total don't stack to the same column list, the query is wrong before the numbers are.",
      tag: "set-ops",
    },
    {
      id: "santander-t11",
      q: "The big-ticket screen keeps billings above the network average. Scalar subquery, window, or CTE — and what does each print?",
      a: "The scalar shape is the definition: WHERE amount_cents > (SELECT AVG(amount_cents) FROM invoices) — the subquery folds all 28 billings once and 12 of 28 survive the cut against the 3106.32 mean. AVG() OVER (PARTITION BY region) answers the different question — each billing beside its OWN market's mean — which is what the country review actually wants, because the benchmark travels with the row and no join is needed. The correlated form recomputes a subquery per row and earns nothing here but scan count. My rule on this book: global benchmark, scalar; per-market benchmark, window; benchmark with a written definition the auditors will quote back, CTE — because on Santander screens the follow-up is always 'average of what, exactly?', and the answer must be one clause, not a shrug.",
      tag: "subqueries",
    },
    {
      id: "santander-t12",
      q: "A market's no-rail arm prints NULL where the review expects a clean 0.00. Walk me through the NULL aggregate mechanics.",
      a: "Three mechanics stack. SUM over zero rows returns NULL, not 0 — an empty arm is no value at all. COUNT(*) counts rows, COUNT(expr) counts non-NULL exprs — on the LEFT JOIN that builds the no-receipt watch, COUNT(p.invoice_id) counts the six matched billings only if I'm careful, because the six never-settled rows carry NULL there. And AVG ignores NULLs in both the numerator and the denominator, so a half-NULL arm averages the survivors, not the population. The fix is policy, not luck: COALESCE(SUM(...), 0) at the edge so the empty book prints a real 0.00 — the same rule as the per-market split where one market's open book must print 0, not an absence. On the coverage census — 21 exact / 1 partial / 6 none — the 'none' arm only exists because the LEFT JOIN kept the rows and the COALESCE kept the zeros.",
      tag: "nulls",
    },
    {
      id: "santander-t13",
      q: "Aging needs a reference date. Today(), the billing's due date, or something else — and what does the choice do to the watch?",
      a: "The watch measures against the books' own last activity: MAX(paid_on) over payments is the as-of date, because 'today' moves every rerun and makes two analysts' watches incomparable, while the book's last settlement is a fixed line in the data. Then julianday(reference) - julianday(due_on) per billing, against flat 30-day terms — min and max terms both print 30, so the terms are a definition, not a distribution. The tempo numbers come from the same clock: settled billings average 28.4 days from issue to first settlement, fastest 13, slowest 84 — and that 84-day outlier is the collection story the country desk quotes. The trap I name every time: julianday over a NULL or malformed date NULLs the whole row silently, so the watch's denominator drifts unless the NULL arm is handled on purpose.",
      tag: "dates",
    },
    {
      id: "santander-t14",
      q: "27 rail hits sit over 22 distinct billings. Design the dedupe that hands the review one row per billing.",
      a: "ROW_NUMBER with a stated policy: number the legs per billing — ROW_NUMBER() OVER (PARTITION BY invoice_id ORDER BY amount_cents DESC, id) — keep leg = 1, and the 27 hits fold to 22 books. The subtlety on this book is that the five split billings (1, 5, 12, 19, 22) carry two EQUAL legs each — 2430.00 and 2430.00 against the 4860.00 billing — so the amount sort ties and the id tiebreaker decides which rail survives. That's why the tiebreaker is policy, not decoration: change it and the dedupe hands back the wire legs instead of the card legs, same dollars, different book. SQLite has no QUALIFY, so the window pass stages in a derived table and the leg filter runs outside. And the audit question after any dedupe: the survivors' SUM must still cross-foot to 69612.00 — the fold that loses dollars in a dedupe didn't dedupe, it dropped.",
      tag: "dedupe",
    },
    {
      id: "santander-t15",
      q: "You want 'rails with a real book' and write HAVING COUNT(*) >= 12. What actually survives, and how do you choose gates?",
      a: "Card survives, wire dies — 16 movements against 11 — and the page silently stops cross-footing to 69612.00. The lesson: on thin data a HAVING gate is a row-deleter, and there is nothing between 11 and 16 to land on. I choose gates against the actual distribution, never by feel: run the fold, read the gap, then decide whether the gate is a definition ('both rails always show' — floor at 11) or a screen ('material books only' — floor at 12 and say so on the slide). Same discipline for the per-market settled split — counts run 10, 7, 5 — where a floor of 6 deletes the US book. On Santander screens the interviewer probes exactly this: a number in HAVING is a business decision, and the candidate who can't say which rows it kills is guessing, not gating.",
      tag: "having",
    },
    {
      id: "santander-t16",
      q: "The market split joins billings to settlements to customers and the counts stop tying. Diagnose the grain end to end.",
      a: "Two fan-outs, one absence. The settlements join fans first: 27 rail hits over 22 billings — five split billings carry two legs — so COUNT(*) counts legs, and the split must protect the count with COUNT(DISTINCT p.invoice_id) or fold settlements per billing before joining. The customers join fans nothing — each billing points at exactly one customer — so the market attribution is safe. And the absence: an INNER JOIN through settlements drops the market with no settled billings entirely, which prints as a missing row where the review expects a market line — if the read must show every country book, that's a LEFT JOIN from customers with COALESCE'd zeros. The tie-back test stays the same: the parts — EU 10 / 37261.00, APAC 7 / 20613.00, US 5 / 11738.00 — must sum to 22 / 69612.00, and every clause in the query is guilty until the split reproduces the whole.",
      tag: "fanout",
    },
    {
      id: "santander-t17",
      q: "Two census shapes: CASE arms as columns, or stacked segments with a TOTAL row. When is each the right read?",
      a: "CASE-as-columns when the arms share a grain and the read compares arms side by side — the per-market book split folds open, paid and void dollars into three columns of one row per market, with the ELSE arm pinning non-members to a real 0. FILTER (WHERE …) is the same idea in cleaner clothes — COUNT(*) FILTER (WHERE status = 'void' AND an EXISTS settlement) counts the void-but-settled break in the same scan as its paid arm. Stacked UNION ALL segments when the arms have different shapes or need a grand row — the state census plus a 28 / 86977.00 TOTAL is the close-pack read, and only UNION ALL keeps every segment verbatim. The mistake I coach against: mixing the shapes — a CASE pivot inside a UNION stack re-folds the same dollars twice, and on a book where the split must reproduce the whole, double-folding is how a slide starts lying.",
      tag: "case",
    },
    {
      id: "santander-t18",
      q: "This training db is 80 ledger entries; production is 80 million rows. What habits transfer when the fold sizes stop being toys?",
      a: "Filter early, fold once, index for the join you repeat. The 80-entry book forgives everything; the habits that transfer are the ones the small book makes visible. Filter early: the status arm — WHERE status = 'open' — belongs above the fold, so the 19609.00 book is folded from six rows, not scanned out of 28. Fold once: cents arithmetic in integer space, one /100.0 and one ROUND at the edge — per-row rounding is a drift habit that compounds at scale. Stage the fan-out: settlements folded per billing in a CTE before the market join, so the big join runs at billing grain, not rail grain. And name the access path: invoice_id on payments is the join key the dedupe partitions by — on production that's the index that turns 27 million hits into 22 million books in one pass. Small data is where you rehearse the discipline, not where you skip it.",
      tag: "performance",
    },
    {
      id: "santander-t19",
      q: "Define 'open book' for a new analyst on the Brazil desk. Why does the definition — not the number — travel?",
      a: "Two definitions compete and only one survives contact with the books. Status-open: the six billings whose state column says open — 19609.00. Evidence-open: the six billings with no settlement row at all — 15217.00. The counts coincide this month and the dollars don't, because the 4000.00-partial billing is open AND received (evidence exists, so it leaves the anti-join) and one paid-status billing at 1756.00 has no rail hit (a claim without evidence, so it stays). The definition travels because each country book runs its own states, its own rails, its own break list — but the group fold must key on evidence, or the four books' watches don't stack. My sentence for the new analyst: the status column is a claim, the settlement feed is a fact, and every KPI on this desk is defined over facts. Quote both sixes with their definitions attached, or the Brazil number and the Spain number aren't the same metric wearing different accents.",
      tag: "kpi",
    },
    {
      id: "santander-t20",
      q: "The country packs want opex movement — this month versus last — not opex level. How do you build the roll-rate read?",
      a: "LAG over a month spine. Fold spend per month — strftime('%Y-%m', spent_on), 36 entries landing 2-3 a month across 2024-01 to 2025-02, peaking at 3210.00 in 2024-08 — then LAG(total) OVER (ORDER BY month) beside each row, and the delta column is the movement read: August's 3210.00 against July's 1794.00 is +1416.00 of run-rate the branch conversation needs. Two mechanics to get right: the spine must be the fold's own months (a missing month shifts every LAG across a gap and prints a fake jump), and the first row's LAG is NULL — COALESCE it or the delta column opens with a hole. The same shape powers the delinquency roll-rates: bucket this month, bucket last month, LAG the buckets, and the migration matrix falls out. Level tells the board where the book is; movement tells the desk where it's going — this bank interviews for the second sentence.",
      tag: "lag",
    },
    {
      id: "santander-t21",
      q: "Three anti-join shapes: NOT IN, LEFT JOIN … IS NULL, NOT EXISTS. Which do you reach for on the no-receipt watch, and why?",
      a: "NOT EXISTS first, LEFT JOIN IS NULL second, NOT IN only when I can prove the subquery is NULL-free. The watch — billings with no settlement row, 6 carrying 15217.00 — is a membership test against the settlements feed, and NOT IN dies the moment the right side carries one NULL: NOT IN (SELECT invoice_id FROM payments) with a stray NULL row returns nothing at all, a watch that's silently empty, the worst failure mode a risk read can have. LEFT JOIN … IS NULL keeps the survivors visible in one scan and pairs naturally with the coverage census on the same join. NOT EXISTS states the intent — no row exists — and NULLs bounce off it. On a multi-market book the stakes compound: the anti-join is the definition of the NPL watch in four country books at once, and one NULL in one book empties the group's watch. Evidence queries get the shape whose failure mode is loud.",
      tag: "antijoin",
    },
    {
      id: "santander-t22",
      q: "Money lives as INTEGER cents in four tables and as REAL dollars in one. Where does the unit discipline break, and what's the rule?",
      a: "The rule: fold in integer cents, convert once at the edge — ROUND(SUM(amount_cents) / 100.0, 2) — never the reverse. The break happens at the joins and the mixes. A mixed-unit join — billing dollars against settlement cents, or orders.total REAL against invoice cents — compares a scale to its own hundredfold and matches nothing, the multi-currency bug wearing the same currency's name. Per-row rounding — ROUND(amount_cents/100.0, 2) before the fold — drifts: cents are exact, rounded dollars aren't, and a 22-billing settled book that cross-foots to 69612.00 on cents can miss by cent-dust after 22 premature roundings. And the one REAL table — orders.total, the booked events worth 34833.28 — needs no conversion, which is exactly why it's the table people forget to not convert. On a group book where the split must tie back to the whole, unit discipline isn't style; it's the difference between a delta of 0 and a meeting.",
      tag: "money",
    },
    {
      id: "santander-t23",
      q: "The void billing that drew 925.00 is still in the books, unedited. Defend the append-only policy to a country head who wants it 'cleaned'.",
      a: "Because the ledger's job is to prove what happened, not what should have. The 925.00 settlement cleared a void billing — a break — and the break is the finding: DELETE or UPDATE it and the journal sequence stops proving that nothing was edited out, the 181080.00 against 181080.00 delta becomes theater, and every reconciliation downstream inherits a book that lies quietly. The policy: detect by pairing state with evidence — status = 'void' AND a settlement exists — quantify in dollars, route to the desk that owns the fix, and let the correction be a new entry that reverses, never an edit. Then the proof stands: the ledger still ties, the journal sequence still shows the break arriving and the reversal leaving, and the trial balance — necessary, never sufficient — backs the story. A bank that edits its books has no books. The country head gets a cleaner watch; the group keeps a book it can defend.",
      tag: "quality",
    },
    {
      id: "santander-t24",
      q: "The cancel-share read is 6.7% EU, 8.1% APAC, 5.3% US — and LATAM prints 0%. Which of these numbers can you say out loud?",
      a: "The three with real denominators — EU 3 of 45, APAC 3 of 37, US 1 of 19 — and not the fourth: LATAM's 0% is 0 of 2, two booked events, a denominator too thin to carry a percentage. The discipline is 100.0 * SUM(CASE WHEN …) / COUNT(*) with the denominator printed beside every share, and NULLIF guarding the empty-book case — 0 events must print NULL or N/A, not 0%, because 0% claims evidence of absence where there's only absence of evidence. That's the multi-market rule: percentages inherit their denominators' credibility, and a group table that lets a two-row book wear the same 8.1%-style confidence as a 45-row book is manufacturing risk out of arithmetic. Small-denominator honesty is a named skill on this desk — the follow-up question is always 'how many events is that, and would you staff a decision on it?'",
      tag: "ratios",
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
    {
      id: "santander-mcq-11",
      prompt: "The rails desk counts 27 settlement rows. The dedupe read says how many DISTINCT billings those hits actually cover?",
      choices: [
        "22 — five split billings (1, 5, 12, 19, 22) carry two legs each",
        "27 — every hit is its own billing",
        "28 — all billings are settled",
        "5 — the split billings",
      ],
      answer: 0,
      why: "27 rail hits cover 22 distinct billings — the five split billings ride two equal legs each, so COUNT(DISTINCT invoice_id) reads 22 while COUNT(*) reads 27. The gap of 5 IS the split-plan census.",
      notes: [
        { choice: 1, why: "27 is the leg count — the join's row count, not the billing count. Reporting legs as books is how the settled split starts exceeding the billing book." },
        { choice: 2, why: "The billing book holds 28, but six billings have no rail hit and one is void — only 22 draw settlements. Coverage is evidence, never the book's size." },
      ],
      difficulty: "easy",
    },
    {
      id: "santander-mcq-12",
      prompt: "The payday-cycle read buckets booked events by weekday. Which expression builds the weekday key?",
      choices: [
        "strftime('%w', created_at)",
        "strftime('%W', created_at)",
        "strftime('%d', created_at)",
        "strftime('%j', created_at)",
      ],
      answer: 0,
      why: "%w prints the day-of-week digit (0-6) the payday cadence folds on. The retail rhythm — spend clustering around paydays — is a weekday story, and %w is the key that GROUP BY folds into seven buckets.",
      notes: [
        { choice: 1, why: "%W is week-of-year, 00-53 — 53 buckets of cadence noise. One character off and the payday read becomes a calendar collector." },
        { choice: 2, why: "%d is day-of-month — a 31-bucket ladder, not a weekday cycle. Payday clustering dissolves into dates nobody can read a rhythm from." },
      ],
      difficulty: "easy",
    },
    {
      id: "santander-mcq-13",
      prompt: "One table in this book stores money as REAL dollars already. Which column needs NO /100.0?",
      choices: [
        "orders.total",
        "invoices.amount_cents",
        "payments.amount_cents",
        "expenses.amount_cents",
      ],
      answer: 0,
      why: "orders.total is REAL dollars — the booked account/product events worth 34833.28. The finance tables (invoices, payments, expenses, ledger) are INTEGER cents; dividing total by 100 shrinks every event a hundredfold.",
      notes: [
        { choice: 1, why: "amount_cents is integer cents by design — the dollar read is always cents / 100.0. Skipping the division reads billings at one percent of their size." },
        { choice: 3, why: "Same cents rule for expenses — Rent's 16800.00 is 1680000 cents in the column. The unit convention is per-table, and 'cents' is right there in the name." },
      ],
      difficulty: "easy",
    },
    {
      id: "santander-mcq-14",
      prompt: "The close-pack census stacks paid/open/void rows plus a TOTAL row. Why must the stack be UNION ALL?",
      choices: [
        "UNION dedupes the combined result — two arms with identical values would collapse into one row and the census stops adding up",
        "UNION ALL is just faster — UNION would be equally correct",
        "UNION cannot combine two SELECTs over the same table",
        "There is no difference — the TOTAL row forces uniqueness anyway",
      ],
      answer: 0,
      why: "A census is a stack of sets that must survive verbatim — 21 paid / 66443.00, 6 open / 19609.00, 1 void / 925.00, plus the 28 / 86977.00 tie-out. UNION dedupes the whole result; any two coincidentally identical rows merge and the tie-back breaks silently.",
      notes: [
        { choice: 1, why: "Speed is real but secondary — the correctness point is that UNION's dedupe can DELETE a true row. A census that loses a row is wrong before it is slow." },
        { choice: 3, why: "The TOTAL row being unique doesn't protect the state rows — dedupe compares every row against every other. Protection is UNION ALL, not luck." },
      ],
      difficulty: "medium",
    },
    {
      id: "santander-mcq-15",
      prompt: "The big-ticket screen: WHERE amount_cents > (SELECT AVG(amount_cents) FROM invoices). How many billings survive?",
      choices: [
        "12 of 28 — against the 3106.32 average",
        "14 of 28 — exactly half, by construction",
        "21 of 28 — the paid book clears its own average",
        "6 of 28 — the open book",
      ],
      answer: 0,
      why: "The scalar subquery folds all 28 billings once — the 3106.32 mean — and 12 sit above it. The average includes open and void rows, which is exactly why the screen's denominator is 'all billings', not the convenient subset.",
      notes: [
        { choice: 1, why: "Nothing forces a mean to split its population in half — the distribution is skewed, and 12 is the probed count. 'Exactly half' is the intuition the query exists to correct." },
        { choice: 2, why: "21 is the paid count, not the above-average count — and the screen never filtered on status. Denominator drift: the average is over 28, so the survivors are counted from 28." },
      ],
      difficulty: "medium",
    },
    {
      id: "santander-mcq-16",
      prompt: "The rail fold runs HAVING COUNT(*) >= 12. What does the page show?",
      choices: [
        "card only — wire's 11 movements are deleted and the page stops cross-footing to 69612.00",
        "both rails — 12 is below both counts",
        "wire only — the smaller rail needs the floor",
        "an empty page — no rail reaches 12",
      ],
      answer: 0,
      why: "Card folds to 16 movements, wire to 11 — a floor of 12 is a silent wire-deleter. There is nothing between 11 and 16 to land on: the gate must be probed against the distribution, because a HAVING number is a business decision.",
      notes: [
        { choice: 1, why: "12 is above 11 — wire dies. 'Roughly half the average' instincts don't survive contact with the actual counts; run the fold first, then set the gate." },
        { choice: 3, why: "card's 16 clears the floor — the page is half-full, not empty. The dangerous failures are the quiet ones: a one-rail page still prints, just without its tie-back." },
      ],
      difficulty: "medium",
    },
    {
      id: "santander-mcq-17",
      prompt: "The dedupe must keep exactly one settlement leg per billing. Which window function guarantees exactly one survivor?",
      choices: [
        "ROW_NUMBER() OVER (PARTITION BY invoice_id ORDER BY amount_cents DESC, id)",
        "RANK() OVER (PARTITION BY invoice_id ORDER BY amount_cents DESC)",
        "DENSE_RANK() OVER (PARTITION BY invoice_id ORDER BY amount_cents DESC)",
        "GROUP BY invoice_id, method",
      ],
      answer: 0,
      why: "ROW_NUMBER numbers legs 1..n with no ties — leg = 1 keeps exactly one row. The five split billings carry two EQUAL legs, and the id tiebreaker decides which rail survives: policy, not decoration.",
      notes: [
        { choice: 1, why: "RANK shares rung 1 on ties — both equal legs rank 1 and the dedupe keeps two rows. On this book the ties are guaranteed: the splits' legs are equal by construction." },
        { choice: 3, why: "GROUP BY folds the legs but has no policy for WHICH leg's rail survives the fold — the method column becomes an arbitrary bare value. The dedupe needs a stated order, not a fold." },
      ],
      difficulty: "medium",
    },
    {
      id: "santander-mcq-18",
      prompt: "Which read computes the true settled total of 69612.00?",
      choices: [
        "ROUND(SUM(amount_cents) / 100.0, 2) — fold in integer cents, convert once at the edge",
        "SUM(ROUND(amount_cents / 100.0, 2)) — round each leg, then add",
        "ROUND(AVG(amount_cents) / 100.0, 2) * COUNT(*)",
        "CAST(SUM(amount_cents) AS INTEGER) — cents are integers already",
      ],
      answer: 0,
      why: "Cents are exact; folded once and converted at the edge, the total cross-foots — 37364.00 plus 32248.00 to 69612.00. Any per-row conversion rounds 27 times before the fold and drifts by cent-dust.",
      notes: [
        { choice: 1, why: "Per-leg rounding accumulates drift across 27 legs — the fold that 'should' tie to the cash book misses by rounding dust. Convert once, after the fold." },
        { choice: 2, why: "AVG times COUNT re-derives the total from a rounded mean — the rounding error is now multiplied. The total is a SUM; the average is a different metric wearing the same columns." },
      ],
      difficulty: "hard",
    },
    {
      id: "santander-mcq-19",
      prompt: "The NPL watch ages billings against a reference date. Which reference makes two analysts' watches comparable?",
      choices: [
        "MAX(paid_on) from payments — the book's own last activity",
        "DATE('now') — the wallclock at run time",
        "MAX(due_on) from invoices — the furthest terms date",
        "MIN(issued_on) from invoices — the book's birthday",
      ],
      answer: 0,
      why: "The as-of date is a line in the data, not the clock: MAX(paid_on) fixes the reference so the 84-day slowest settlement and every aging bucket reprint identically tomorrow. 'Now' moves every rerun and makes two watches incomparable.",
      notes: [
        { choice: 1, why: "DATE('now') re-ages the whole watch on every run — today's 30-day bucket is tomorrow's 31. A risk read whose denominator moves daily can't be quoted in a review." },
        { choice: 2, why: "MAX(due_on) is a future-leaning terms artifact, not an observation point. Aging measures days PAST a due date as seen from a fixed as-of — the due date is the ruler, not the vantage." },
      ],
      difficulty: "hard",
    },
    {
      id: "santander-mcq-20",
      prompt: "The country review wants every billing beside its OWN market's average, not the network's. Which shape delivers it?",
      choices: [
        "AVG(amount_cents) OVER (PARTITION BY region) — the benchmark travels with the row",
        "A scalar subquery: (SELECT AVG(amount_cents) FROM invoices) — join it on",
        "GROUP BY region — one row per market",
        "A correlated subquery on the billing's customer_id",
      ],
      answer: 0,
      why: "AVG() OVER (PARTITION BY region) computes each market's mean without collapsing rows — every billing keeps its identity and gains its own benchmark. The network scalar (3106.32) answers the different, global question.",
      notes: [
        { choice: 1, why: "The scalar folds ALL billings — that's the 3106.32 network mean, not the market mean. Wrong benchmark, right-looking query: the EU book gets judged against a number it never set." },
        { choice: 2, why: "GROUP BY collapses to one row per market — the per-billing comparison disappears. The review reads billings against their market's mean, so the rows must survive the fold." },
      ],
      difficulty: "hard",
    },
    {
      id: "santander-mcq-21",
      prompt: "The roll-rate read needs each billing's state THIS month beside LAST month's. Which window function looks backward?",
      choices: [
        "LAG(state) OVER (ORDER BY month)",
        "LEAD(state) OVER (ORDER BY month)",
        "ROW_NUMBER() OVER (ORDER BY month)",
        "NTILE(2) OVER (ORDER BY month)",
      ],
      answer: 0,
      why: "LAG fetches the previous row's value in the window's order — this month beside last month, the migration matrix's raw material. The first row's LAG is NULL, which the COALESCE policy handles.",
      notes: [
        { choice: 1, why: "LEAD looks forward — the same information with the frame flipped, but the column would be 'next month' and every delta would read backwards. Direction is part of the definition." },
        { choice: 2, why: "ROW_NUMBER numbers rows; it carries no prior value. The read needs the previous STATE, not the row's position in it." },
      ],
      difficulty: "easy",
    },
    {
      id: "santander-mcq-22",
      prompt: "WHERE can use a SELECT alias, GROUP BY can, ORDER BY can — one of these is wrong. Which?",
      choices: [
        "WHERE — aliases don't exist yet at row-filter time",
        "GROUP BY — aliases never work there",
        "ORDER BY — aliases never work there",
        "None — SQLite resolves aliases everywhere",
      ],
      answer: 0,
      why: "SQLite evaluates WHERE before SELECT, so the alias isn't born yet — filter on the underlying expression instead. GROUP BY and ORDER BY run after projection, where the alias resolves (SQLite extension, and it's load-bearing on these reads).",
      notes: [
        { choice: 3, why: "'Everywhere' is the trap sentence — WHERE is exactly where it fails, and on other engines GROUP BY aliases fail too. Know the engine's order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY." },
        { choice: 1, why: "GROUP BY alias works in SQLite — issued_month folds cleanly. The pipeline-order rule is WHERE-specific here, and the interviewer probes precisely that clause." },
      ],
      difficulty: "easy",
    },
    {
      id: "santander-mcq-23",
      prompt: "NOT IN (SELECT invoice_id FROM payments) returns NOTHING on a book where you know unmatched billings exist. First suspect?",
      choices: [
        "A NULL in the subquery's result — NOT IN with NULL never matches anything",
        "The join column's collation",
        "Integer overflow in the comparison",
        "NOT IN is read-only and cannot filter",
      ],
      answer: 0,
      why: "One NULL on the right side poisons every comparison: x NOT IN (1, 2, NULL) is never TRUE. The no-receipt watch must be built on NOT EXISTS or LEFT JOIN … IS NULL — shapes whose failure mode is loud, not silent emptiness.",
      notes: [
        { choice: 1, why: "Collation mismatches filter to fewer rows, not zero — and the anti-join compares integers here. The NULL poisoning is total: one bad row, empty watch." },
        { choice: 3, why: "NOT IN filters fine — that's its job. The danger isn't the operator, it's the NULL it can't argue with; that's why the evidence queries standardize on NOT EXISTS." },
      ],
      difficulty: "easy",
    },
    {
      id: "santander-mcq-24",
      prompt: "The no-rail census LEFT JOINs billings to settlements and counts per billing. Which count keeps the never-settled six in the census?",
      choices: [
        "COUNT(*) — unmatched rows survive the join and the count",
        "COUNT(p.invoice_id) — it counts settlement keys",
        "COUNT(DISTINCT p.method) — rails present per billing",
        "COUNT(p.amount_cents) — settled dollars per billing",
      ],
      answer: 0,
      why: "The six never-settled billings carry NULL on every payments column after the LEFT JOIN — COUNT(*) still sees the row, COUNT(p.anything) sees nothing. The 6 / 15217.00 watch exists because COUNT(*) kept the unmatched rows.",
      notes: [
        { choice: 1, why: "COUNT(p.invoice_id) skips NULLs — exactly the six rows the watch exists to find. The anti-join census and the coverage census need opposite counts on the same join." },
        { choice: 2, why: "DISTINCT method counts rails touched — 0 for the six, 1 or 2 for the rest. It's a different metric; using it for membership silently empties the watch." },
      ],
      difficulty: "medium",
    },
    {
      id: "santander-mcq-25",
      prompt: "One scan must count the void-but-settled break (925.00) AND the paid book (66443.00) together. Which shape does it?",
      choices: [
        "Conditional folds in one pass — SUM(CASE WHEN …) or COUNT(*) FILTER (WHERE …) over the state-and-evidence join",
        "Three separate queries pasted into one slide",
        "WHERE status = 'void' — the status column carries the break",
        "HAVING COUNT(*) > 0 — groups that exist are the breaks",
      ],
      answer: 0,
      why: "The break is a PAIR — void claim plus existing settlement — so the arm tests both, and the same scan folds the paid arm. One pass, every arm: the country packs' numbers all come from one query, provably on the same population.",
      notes: [
        { choice: 1, why: "Separate queries are separate populations and separate runs — the tie between the arms is now a promise, not a proof. The one-scan census is the group's tie-back discipline in query form." },
        { choice: 2, why: "status = 'void' finds the void billing but not the 925.00 evidence — the state column claims, the settlement feed proves. Without the EXISTS arm the break is a claim wearing a number." },
      ],
      difficulty: "medium",
    },
    {
      id: "santander-mcq-26",
      prompt: "The branch read wants CUMULATIVE opex by month — each month's running total, 3210.00 peak included. Which shape?",
      choices: [
        "SUM(total) OVER (ORDER BY month) — a running frame from the first month",
        "SUM(total) OVER () — one grand total on every row",
        "GROUP BY month — the monthly levels",
        "LAG(total) OVER (ORDER BY month) — the prior month beside each row",
      ],
      answer: 0,
      why: "OVER (ORDER BY month) defaults to a RANGE frame from UNBOUNDED PRECEDING to CURRENT ROW — the running accumulation the rollforward wants. The peak month's cumulative includes its 3210.00 spike.",
      notes: [
        { choice: 1, why: "The empty OVER () is a grand total, not a running one — every row would print 25416.00, the whole book's opex. Frame choice IS the metric." },
        { choice: 2, why: "GROUP BY month gives levels — 3210.00 for August, not August's place in the year's accumulation. The cumulative read needs the window; the level read needs the fold." },
      ],
      difficulty: "medium",
    },
    {
      id: "santander-mcq-27",
      prompt: "Share-of-partition: each rail's percent of 69612.00. Which expression survives SQLite's integer division?",
      choices: [
        "100.0 * SUM(amount_cents) / SUM(SUM(amount_cents)) OVER () — the 100.0 lands first",
        "100 * SUM(amount_cents) / SUM(SUM(amount_cents)) OVER ()",
        "SUM(amount_cents) / SUM(SUM(amount_cents)) OVER () — times 100 in the report",
        "ROUND(SUM(amount_cents) / 100.0, 2) — convert, then compare",
      ],
      answer: 0,
      why: "Cents are integers, and integer / integer truncates: 3736400 / 6961200 is 0. Multiplying by 100.0 first promotes to REAL and the share prints — card 53.7%, wire 46.3%. Placement of the 100.0 is the whole bug.",
      notes: [
        { choice: 1, why: "100 * int / int divides integers — every share truncates toward 0 and the board prints zeros. The classic SQLite percentage bug, and it passes every eyeball test that only checks the biggest row." },
        { choice: 3, why: "That's the cents-to-dollars conversion, not a share — it prints 37364.00 where 53.7 belongs. Two different idioms; the share needs a REAL promotion, not a unit conversion." },
      ],
      difficulty: "medium",
    },
    {
      id: "santander-mcq-28",
      prompt: "The duplicate-charge screen self-joins settlements to find two equal legs on one billing, same day. Which pair condition avoids self-pairs AND mirror double-counts?",
      choices: [
        "p1.id < p2.id — one canonical ordering per pair",
        "p1.id != p2.id — different rows only",
        "p1.id = p2.id — the exact same row",
        "No condition — the amount equality is enough",
      ],
      answer: 0,
      why: "p1.id < p2.id keeps one representative per unordered pair — the split legs of billing 1 (2430.00 and 2430.00) surface exactly once. != keeps both (a,b) and (b,a); = pairs a row with itself.",
      notes: [
        { choice: 1, why: "!= double-counts every pair — the mirror image (b,a) is still a pair. On five split billings the screen reports ten findings where five exist." },
        { choice: 3, why: "Amount equality alone pairs every row with itself first — 27 self-pairs before any real finding. The id ordering is what makes the pair set canonical." },
      ],
      difficulty: "hard",
    },
    {
      id: "santander-mcq-29",
      prompt: "The per-account trial balance: each ledger account's debits, credits and delta in one pass. Which shape?",
      choices: [
        "SUM(CASE WHEN side = 'debit' THEN amount_cents ELSE 0 END) and its credit twin, GROUP BY account",
        "SUM(amount_cents) GROUP BY account — the net is the proof",
        "Two queries — one per side — compared by eye",
        "WHERE side = 'debit' GROUP BY account — debit balances only",
      ],
      answer: 0,
      why: "The CASE arms fold both sides into one row per account — cash 69612.00 / 25416.00 / 44196.00 net — and the delta column is the proof. The network fold then checks 181080.00 against 181080.00.",
      notes: [
        { choice: 1, why: "The net alone can tie while both sides are wrong — 69612.00 could be a debit and a credit noise. The trial balance proves gross movements, not just the residual." },
        { choice: 2, why: "Two queries mean two scans and a human join — the delta column is computed by the analyst, not the engine. One-pass folds exist precisely so the proof is in the query." },
      ],
      difficulty: "hard",
    },
    {
      id: "santander-mcq-30",
      prompt: "WHERE amount_cents = (SELECT amount_cents FROM invoices WHERE status = 'open') — what happens, and why?",
      choices: [
        "It errors — the subquery returns six rows and a scalar slot takes exactly one",
        "It works — SQLite picks the first open billing",
        "It returns NULL comparisons — all rows filtered out, silently",
        "It works — the engine averages the six rows",
      ],
      answer: 0,
      why: "Six open billings mean six rows into a scalar context — 'subquery returned more than one row'. The fix states the aggregate: = (SELECT MAX(...) ...) or IN (SELECT ...). Scalar means one row, on this book and every book.",
      notes: [
        { choice: 1, why: "SQLite does not silently pick a row for scalar slots — it raises the multi-row error. Hoping for 'first row' is how undefined behavior enters a production read." },
        { choice: 2, why: "That's the NOT IN-with-NULL failure mode, a different bug with the same smell. Here the engine is loud on purpose: six candidate values is an ambiguity it refuses to resolve for you." },
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
    {
      id: "cs-santander-3",
      tier: "medium",
      topic: "j7",
      universe: "month-close",
      title: "The settled-book split: rail hits folded per market",
      brief:
        "Santander-flavored memo on the storefront db (payments = settlement rails, invoices = billings, customers = the four country books): the close pack needs the SETTLED side per market — how many distinct billings each country book actually settled and for how much, folded from the rails and tied back to the cash book. Probed facts: 27 rail hits cover **22 distinct billings for 69612.00**, split EU 10 billings / 37261.00, APAC 7 / 20613.00, US 5 / 11738.00. The market with no settled book prints an absence under the INNER JOIN — *the split must read as books, and the parts must sum to the whole before the page ships.*",
      ask: "Return the settled split: market, distinct settled billings, settled dollars (2dp) — biggest settled book first, keeping only markets with at least five settled billings.",
      template:
        "SELECT c.region AS market,\n       COUNT(DISTINCT p.invoice_id) AS settled_billings,\n       ROUND(SUM(p.{1}) / 100.0, 2) AS settled_usd\nFROM payments p\nJOIN invoices i ON i.id = p.invoice_id\nJOIN customers c ON c.{2} = i.customer_id\nGROUP BY c.region\nHAVING COUNT(DISTINCT p.invoice_id) >= {3}\nORDER BY settled_usd {4};",
      slots: [
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the settled-money column",
          why: "SUM(p.amount_cents) prices the rail fold — INTEGER cents summed exactly and converted once through /100.0. method is TEXT: SQLite coerces it to 0.0 inside SUM and every market's settled book prints free, a page of zeros that still 'runs'.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the customer-side join key",
          why: "c.id = i.customer_id attaches each settled billing to its country book — the primary key on the customer side. Any other customer column compares text or city names to an integer id, matches nothing, and the split ships empty.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the keep-material-books floor",
          why: "The floor parks at 5 — the US book's settled-billing count and a verified cell on this page — so all three active books survive. 6 deletes the US book (5 < 6) while EU and APAC still print, a two-market page that no longer ties to 22.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first order",
          why: "DESC headlines the biggest settled book — EU 37261.00 on top, the order the close pack reads. ASC opens on the US 11738.00 book: a correct fold pointed at the wrong end of the review.",
        },
      ],
      distractors: ["method", "status", "region", "6", "ASC"],
      walkthrough:
        "The settled split is a two-join, one-fold read with the grain protected twice. The rails join to billings on invoice_id (27 hits), billings to customers on customer_id (no fan-out — one customer per billing), and GROUP BY c.region folds per market. The count is COUNT(DISTINCT p.invoice_id) because the five split billings (1, 5, 12, 19, 22) carry two legs each — COUNT(*) would read 27 and the split would exceed the 22-billing book it claims to sum. The money fold is SUM(p.amount_cents)/100.0, rounded once. The result ties: EU 10 / 37261.00, APAC 7 / 20613.00, US 5 / 11738.00 — parts that sum to 22 / 69612.00, the cash book's debit fold. HAVING >= 5 is a keep-all guard parked at the smallest active book; the market with no settled book is absent (INNER JOIN), and the review reads the absence as a zero-book line. The distractors fail honestly: method in the money slot coerces TEXT to 0.0 and every book prints free; status has no column on either side of its slot and errors; region in the join key compares text to integers and empties the page; a floor of 6 deletes the US book and the parts stop reproducing 22; ASC buries the biggest book.",
    },
    {
      id: "cs-santander-4",
      tier: "hard",
      topic: "q2",
      universe: "expense",
      title: "Cost lines that outrun the average entry",
      brief:
        "Santander-flavored memo on the storefront db (expenses = branch-and-ops cost lines): the network review wants the cost lines whose AVERAGE ENTRY outruns the book's own mean entry — the branches' structural outliers, not the noisy months. Probed facts: 36 entries across four categories totaling 25416.00, so the network mean entry runs **706.00**; the category folds read Rent 14 entries / 16800.00 (1200.00 per entry), Travel 3 / 2521.00 (840.33), Ads 14 / 4570.00 (326.43), Tools 5 / 1525.00 (305.00). The definition is the point: the benchmark is the mean ENTRY — *a per-row average, not the category totals the slide would rather quote.*",
      ask: "Return the outlier lines: cost line, entry count, total spend (2dp) and average entry (2dp) — biggest total first, keeping lines with at least three entries whose average entry beats the network mean.",
      template:
        "SELECT e.category AS cost_line,\n       COUNT(*) AS entries,\n       ROUND(SUM(e.amount_cents) / 100.0, 2) AS spend_usd,\n       ROUND(AVG(e.amount_cents) / 100.0, 2) AS avg_entry_usd\nFROM expenses e\nGROUP BY e.{1}\nHAVING AVG(e.amount_cents) > (SELECT AVG({2}) FROM expenses)\n   AND COUNT(*) >= {3}\nORDER BY spend_usd {4};",
      slots: [
        {
          answer: "category",
          kind: "keyword",
          label: "the cost-line fold key",
          why: "GROUP BY e.category folds 36 entries into the four cost lines the review reads — Rent, Ads, Travel, Tools. id would fold to one group per entry, where no group can hold three entries and the outlier read dissolves into the row list it came from.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the benchmark's money column",
          why: "The scalar benchmark must average the same dollars it screens — AVG(amount_cents) over all 36 entries is the 706.00 mean entry. AVG(id) averages primary keys and the gate falls to 18.5, letting every category through; AVG of a text column returns 0.0 and the screen stops screening.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the thin-book floor",
          why: "The floor parks at 3 — Travel's entry count and a verified cell on this page — so both outlier lines survive with honest denominators. 4 deletes Travel (3 < 4) and leaves a one-line page where the two-line outlier story is the finding.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-total-first order",
          why: "DESC leads with Rent's 16800.00 — the structural line the branch conversation opens on. ASC leads with Travel's 2521.00, burying the lease book under the travel budget.",
        },
      ],
      distractors: ["region", "id", "4", "ASC"],
      walkthrough:
        "The outlier screen is a fold benchmarked against its own population. GROUP BY e.category folds the 36 entries to four lines; the scalar subquery folds the same table once — AVG(amount_cents) over everything, 706.00 per entry — and the HAVING keeps lines whose mean entry clears it: Rent at 1200.00 and Travel at 840.33, while Ads (326.43) and Tools (305.00) fall under despite Ads matching Rent's 14-entry count. That contrast is the read: entry count is not cost, the per-entry mean is. COUNT(*) >= 3 keeps both surviving lines above a thin-book floor — Travel's three entries stay, each carrying a real denominator. The result reads Rent 14 / 16800.00 / 1200.00, Travel 3 / 2521.00 / 840.33, biggest total first. The distractors fail honestly: region isn't a column on expenses and the query errors; id in the fold key makes every group a single row that can't clear a count floor; id in the benchmark drops the threshold to 18.5 and all four lines pass — a screen that screens nothing; a floor of 4 deletes Travel and the page loses its second line; ASC inverts the read.",
    },
    {
      id: "cs-santander-5",
      tier: "hard",
      topic: "t5",
      universe: "refund-audit",
      title: "One leg per billing: the split-plan dedupe",
      brief:
        "Santander-flavored memo on the storefront db (payments = settlement rails): the data-quality board's queued ask, built tonight — the split-plan dedupe. 27 rail hits sit over **22 distinct billings**, because five billings (1, 5, 12, 19, 22) were settled on split plans: two legs each, and the legs are EQUAL — billing 1 carries 2430.00 and 2430.00 against its 4860.00 book. The review wants one canonical leg per billing: biggest amount first, with `id` as the stated tiebreaker, so the card/wire attribution is policy and not row-order luck. Probed anchors: billing 25's leg is the **wire 4000.00** partial, billing 11's leg is the **card 925.00** void-settled break — both must survive the dedupe visibly.",
      ask: "Return the deduped book: billing id, rail and paid dollars (2dp) for exactly one leg per billing, biggest leg first with id breaking ties, ordered by billing id.",
      template:
        "SELECT billing_id, rail, paid_usd\nFROM (\n  SELECT p.invoice_id AS billing_id,\n         p.{1} AS rail,\n         ROUND(p.amount_cents / 100.0, 2) AS paid_usd,\n         ROW_NUMBER() OVER (PARTITION BY p.invoice_id ORDER BY p.{2} {3}, p.id) AS leg\n  FROM payments p\n)\nWHERE leg = {4}\nORDER BY billing_id;",
      slots: [
        {
          answer: "method",
          kind: "keyword",
          label: "the rail column",
          why: "p.method is the card/wire attribution the dedupe exists to make readable — card or wire per surviving leg. amount_cents here would print the money column twice and the rail column never, and id would print primary keys where rails belong.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the leg-ranking column",
          why: "Ranking legs by amount — biggest first — is the stated policy: a billing's largest settlement is its canonical leg. Ordering by id instead hands the split billings' LAST-inserted legs, a different card/wire book with identical dollars; ordering by paid_on re-picks legs by timing.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-leg-first direction",
          why: "DESC makes 'biggest amount first' true — the canonical leg is the larger settlement. ASC inverts the policy and, on the five equal-leg splits, silently swaps card legs for wire legs via the tiebreaker: same dollars, different book.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the keep-one-leg cut",
          why: "leg = 1 is the dedupe — exactly one row per billing, 22 rows from 27 hits, and the 1 prints in the leg column of every surviving row. leg = 2 keeps only the split billings' second legs: five rows where twenty-two books belong.",
        },
      ],
      distractors: ["status", "id", "2"],
      walkthrough:
        "The dedupe is a window pass staged in a derived table — SQLite has no QUALIFY, so ROW_NUMBER runs inside and the leg filter runs outside. PARTITION BY invoice_id numbers each billing's legs; ORDER BY amount_cents DESC with p.id as tiebreaker is the stated policy — and the tiebreaker is load-bearing, because all five split billings carry EQUAL legs (2430.00/2430.00 on billing 1), so the amount sort ties and id decides which rail survives. WHERE leg = 1 keeps one row per billing: 22 rows, the void's card 925.00 on billing 11 and the partial's wire 4000.00 on billing 25 both visible, and the survivors still cross-foot to 69612.00 — a dedupe that lost dollars would have dropped rows instead. The distractors fail honestly: status isn't a payments column and every slot it touches errors; id in the rail slot prints integers where card/wire belong; id in the ranking hands back the wire legs on the splits — a different book, same dollars, which is exactly why the tiebreaker is written policy; leg = 2 returns the five second legs, a fragment the board would read as the whole cleanup.",
    },
    {
      id: "cs-santander-6",
      tier: "easy",
      topic: "x3",
      universe: "month-close",
      title: "The rail census with its tie-out row",
      brief:
        "Santander-flavored memo on the storefront db (payments = settlement rails): the warm-up read of every close — the rail census, with the tie-out row that makes it a proof. Probed facts: card clears **16 movements for 37364.00**, wire clears **11 for 32248.00**, and the two rails together must cross-foot to the cash book's **69612.00** debit fold — which is what the appended TOTAL row states out loud. The read keeps both rails (the floor parks at the smaller rail's count) and leads with the tie-out so the reviewer sees the target before the parts: *the census isn't done until the parts and the total stack.*",
      ask: "Return the census: rail, movement count and settled dollars (2dp) per rail plus one TOTAL row over all settlements — biggest dollar figure first, keeping rails with at least eleven movements.",
      template:
        "SELECT p.method AS rail,\n       COUNT(*) AS movements,\n       ROUND(SUM(p.amount_cents) / 100.0, 2) AS rail_usd\nFROM payments p\nGROUP BY p.{1}\nHAVING COUNT(*) >= {2}\nUNION ALL\nSELECT '{3}', COUNT(*), ROUND(SUM(amount_cents) / 100.0, 2)\nFROM payments\nORDER BY rail_usd {4};",
      slots: [
        {
          answer: "method",
          kind: "keyword",
          label: "the rail fold key",
          why: "GROUP BY p.method folds 27 settlement rows into the two rails the desk watches. invoice_id would fold to one group per billing — 22 groups that all fail the floor and leave the census reading only its TOTAL row.",
        },
        {
          answer: "11",
          kind: "number",
          label: "the keep-both-rails floor",
          why: "The floor parks AT the smaller rail — wire's 11 movements, a verified cell on this page — so both rails survive and the census can cross-foot. 12 deletes wire while card still prints: a one-rail page that no longer adds to 69612.00.",
        },
        {
          answer: "TOTAL",
          kind: "keyword",
          label: "the tie-out row's label",
          why: "The literal labels the appended fold — 27 movements / 69612.00, the cash book's debit target. Any other label ships a mystery row, and on a proof page an unlabeled row is indistinguishable from a third rail.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the tie-out-first order",
          why: "DESC leads with the biggest dollar figure — the 69612.00 TOTAL on top, then card 37364.00, wire 32248.00. ASC hides the tie-out under its own parts, and the reviewer reads the proof last instead of first.",
        },
      ],
      distractors: ["12", "GRAND", "ASC", "vendor"],
      walkthrough:
        "The census is a fold, a floor, and a stack. The first arm folds payments by rail — card 16 / 37364.00, wire 11 / 32248.00 — with HAVING COUNT(*) >= 11 parked at the smaller rail: a keep-both guard, not a screen, because a one-rail page stops cross-footing. The second arm folds the same table with no GROUP BY and appends the literal 'TOTAL' — 27 / 69612.00, the number the cash book's debit fold must show. UNION ALL is mandatory: UNION would dedupe the combined set, and a proof page that can silently lose a row isn't a proof. ORDER BY rail_usd DESC caps the page with the tie-out first, then the parts. The distractors fail honestly: a floor of 12 deletes wire and the remaining parts can't reach the total they're stacked against; 'GRAND' ships an unlabeled mystery row where the proof's name belongs; ASC buries the tie-out under its own components; vendor isn't a payments column and the arms that reference it error out.",
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
    { slug: "duplicate-charge-pairs", why: "Self-join pair detection with a canonical ordering: the split-plan screen — two equal legs on one billing surface exactly once, the drill behind the 27-hits-over-22-books census." },
    { slug: "find-latest-salaries", why: "Dedupe to the latest row per entity via windows: the settlement-leg cleanup — one canonical rail hit per billing, the ROW_NUMBER policy the data-quality board signed." },
    { slug: "biggest-window-between-events", why: "LEAD-gap span reads over event streams: the settlement cadence — days between rail hits per billing, the collections-tempo read at row grain." },
    { slug: "fx-exposure-report", why: "Latest-rate join normalizing multi-currency books: the four-country-books problem — one group number that still ties back per market, priced honestly." },
    { slug: "average-selling-price", why: "Weighted-per-period value folds over joined quantities: the rate-weighted read — dollars divided by the base that earned them, never by a convenient row count." },
    { slug: "value-at-risk", why: "Percentile-rank tail reads: the big-ticket screen's statistical cousin — where the 12-of-28 concentration sits in the distribution, quoted with its denominator." },
    { slug: "portfolio-weights", why: "Share-of-partition window folds: each rail's and each market's percent of the 69612.00 book — the REAL-promotion arithmetic drilled until it is reflex." },
    { slug: "portfolio-concentration-hhi", why: "Concentration index folds over shares: how concentrated one country book's billings really are — the formal version of the big-ticket screen every review opens with." },
    { slug: "number-of-rich-customers", why: "COUNT DISTINCT over a threshold: the big-ticket census — how many books cleared the 3106.32 mean, the count that must survive the market split intact." },
    { slug: "dormant-reactivation", why: "NOT EXISTS dormancy screens: books with no recent rail activity — the empty-book rule (an absence is not a zero) drilled on the account grain." },
    { slug: "maximum-transaction-each-day", why: "Per-day argmax over grouped maxima: the daily settlement peak per rail — the operations read that decides when the wire desk staffs up." },
    { slug: "customers-who-never-order", why: "The classic anti-join: billings with no settlement ever — the no-receipt watch (6 / 15217.00) in its textbook form, with the NOT IN NULL trap waiting." },
    { slug: "mrr-waterfall", why: "LAG movement classification across periods: book movement, not book level — new, settled and rolled dollars per country book, the close pack's narrative engine." },
    { slug: "snapshot-delta-detect", why: "FULL OUTER JOIN between snapshots: this month's book versus last month's — additions, removals and edits named row by row, the data-quality board's favorite exhibit." },
    { slug: "deferred-revenue", why: "Recursive spine spreading billed dollars across periods: statement-cycle revenue recognized over the months it covers — the calendar math behind the billing book." },
    { slug: "monthly-transactions-i", why: "Date-filtered month folds with state arms: the billed-versus-refunded month read — one strftime key, conditional sums, the census the country packs open with." },
  ],
};
