// ING — kit 13 of the Banking & Capital Markets domain (Batch L, wave 7).
// Dutch retail bank with a data-first culture: the orange direct bank that
// runs on scenario reporting, AML-style screening counts and monthly account
// fee cycles, where an analyst's default answer is a query and the default
// query is a census. The storefront db maps on honestly: invoices are account
// and product fee billings (monthly cycle fees, product notices — the
// receivables the retail book carries), payments are settlement legs (method
// card / wire — the debit-card rail and the SEPA-style interbank rail),
// ledger_entries is the double-entry book of record, expenses are ops cost
// lines, customers are account households across four books (EU / US / APAC /
// LATAM standing in for the footprint), orders are booked transaction batches
// (REAL dollars — the one table where money is already dollars). Money in
// invoices/payments/expenses/ledger is INTEGER cents — the dollar read is
// always amount_cents / 100.0.
// Pool provenance: ING has 0 tagged sql rows in the band (checked
// company-pools.md for ing / ING variants) — 0 tagged LC — theme-curated:
// every topic and problem slug is curated from the theme menu to ING's known
// question families (household folds, screening bands, anti-join watches,
// scenario spines, books of record), provenance stated per problem.
// Case figures: scripts/company-facts.md (probed 2026-10-12), case cells
// re-probed against db/custom.db (read-only) before authoring.

import type { CompanyKit } from "../types";

export const ingKit: CompanyKit = {
  id: "ing",
  domainId: "banking",
  name: "ING",
  tagline: "Dutch retail bank with a data-first culture",
  accent: "text-orange-400",

  brief: [
    "**ING** is the Dutch direct bank that decided decades ago to be a data company with a banking license — *the orange code* runs on self-serve accounts, and its analysts are expected to answer stakeholder questions with a query, not a meeting. On this training db the mapping is honest: `orders` are booked transaction batches (REAL dollars — the one table where money is already dollars), customers are account households across four books, and every cycle fee a household's account generates — maintenance, product notice, billing memo — lands as a receivable. Probed scale: **103 booked batches worth 34833.28** at a **338.19** average, the busiest household holding **24 batches for 7262.35**, books reading EU 45 / 15089.23, APAC 37 / 11605.45, US 19 / 7286.16, LATAM 2 / 852.44.",
    "The money tables are integer cents — the dollar read is always `amount_cents / 100.0`. `invoices` carry the cycle billings: 21 paid for 66443.00, 6 open at 19609.00, 1 void at 925.00. `payments` clear them on two rails — {emerald:card}, the debit rail (16 legs for 37364.00), and {sky:wire}, the SEPA-style interbank rail (11 legs for 32248.00) — with five billings settled on split plans, two legs each. `ledger_entries` is the book of record: **181080.00 debits against 181080.00 credits across 80 entries, delta 0**. The house rule follows from the data-first culture: *if the fold doesn't reproduce the whole, the fold is the bug — not the data.*",
    "The SQL screens are census screens. A warm-up household fold, then the two questions the Amsterdam floor is known for: the {rose:screening bands} — settlement legs bucketed under, between and over threshold lines per rail, the AML-style count where the mid-band mass (13 card legs between 1000.00 and 3000.00) is the population the compliance desk watches — and the {rose:no-leg watch} — the uncollected book found by anti-join (**6 billings / 15217.00**), where membership is a missing rail hit, not the word open. Follow-ups probe denominators ('uncollected versus open — why do both read six?') and boundaries ('BETWEEN is inclusive — which legs sit on the line?').",
    "Prep the way the screens run. Drill conditional folds and `CASE` band ladders, anti-joins with the `IS NULL` arm stated out loud, strftime month buckets across the 2024-01 to 2025-02 window, and the ops cost reads (Rent at 14 lines / **16800.00**, monthly spend peaking **3210.00** in 2024-08). Then practice the sentence that lands in a data-first bank: *same household, different scenario — the definition is written down, the denominator is named, and the band edges are inclusive until proven otherwise.*",
    "The deeper screens run windows, set ops and staged folds. The {violet:cash walk} proof folds `debit_cents - credit_cents` over the cash book's 27 entries in post-date order — it bottoms at −3159.00 in February 2024 before receipts catch up and closes at **44196.00** — and the follow-up is always the frame: order by `entry_date` alone and the 13 two-leg month-ends step together. Set ops stack boards: {pink:UNION} dedups whole rows, so two household boards (7262.35 / 6640.56 / 4574.23 against 1088.44 / 945.21 / 845.92) ship six rows only for as long as no pair collides. And the {rose:velocity census} walks LAG down each rail — card legs measured against card history, wire against wire — where the first leg's NULL gap is *baseline, not a zero*.",
    "Prep at full depth now runs **fifteen topics, twenty-four theory drills, thirty MCQs and six audited cases**. The two originals rebuild the screening census and the no-leg watch; the four additions walk the tight-cadence velocity screen (LAG gaps per rail against the seven-day line), the closing cash walk (a window fold staged through a CTE, judged against the **44196.00** net), the {amber:one-pass cost census} (FILTER arms cross-footing to 25416.00) and the stacked household boards (two LIMIT-ed folds joined by UNION). The bar to clear is the house's own: *name the population, write the frame, prove the fold* — then make every stacked total reconcile against a COUNT(*).",
  ],

  dayInLife: [
    "**08:30 —** the morning census before the standup. First query proves the ledger — **181080.00 against 181080.00, delta 0** across 80 entries — then the rail census: card **16 legs / 37364.00**, wire **11 / 32248.00**, cross-footed to the cash book's 69612.00 debit fold. The screening file pairs counts with edges: 13 card legs in the mid band, and the only sub-threshold leg in the whole book is the **925.00** drawn against the void billing. The compliance standup opens at 09:00 with those numbers already tied.",
    "**13:00 —** deep work: the no-leg watch, re-cut per book. The anti-join runs — billings LEFT JOINed to legs, `IS NULL` arm on the rail side — and lands at **6 billings / 15217.00**: four in the EU book (8524.00), one US at **4937.00**, one APAC at 1756.00. The subtlety the review always trips on: the open-status census also reads six, but it carries 19609.00 — one of its members took a 4000.00 partial and *has* a rail hit, while a paid-status billing at **1756.00** has none. *Membership is evidence; status is a claim.*",
    "**17:00 —** the scenario pack and the EOD writeup. The collections scenario ships with its denominator on the slide — settled billings average **28.4 days** to first payment (fastest 13, slowest 84) against flat 30-day terms — and every band edge is footnoted with its inclusivity. Tomorrow's ask is queued for the data-quality board: the void-but-drawn 925.00, waiting on the rail's own explanation. *In a bank that answers with queries, the writeup is a query plus its definitions — nothing more, and nothing less.*",
    "**19:40 —** the velocity triage before sign-off. The {rose:tight-cadence census} re-runs — three card legs inside the seven-day line (gaps 7, 5 and 4), wire clean at thirteen — and the five-day hit gets its annotation: *it chased the void billing's 925.00*, so the alert routes to the anomaly file, not to a household call. Then the close's last proof: the cash walk bottoms at −3159.00 in February 2024 and closes at **44196.00** after the **7076.00** month-end receipt, tying the ledger's 69612.00-against-25416.00 fold line for line. The writeup ships as the query plus its definitions — *in a data-first bank, that is the whole deliverable.*",
  ],

  metrics: [
    { name: "Booked batches by book", what: "Transaction batches with value per book — EU 45 / 15089.23, APAC 37 / 11605.45, US 19 / 7286.16, LATAM 2 / 852.44. The footprint view every scenario read starts from." },
    { name: "Billing-state mix", what: "Cycle billings by state — 21 paid / 66443.00, 6 open / 19609.00, 1 void / 925.00. The fold is believed only after the book split reproduces it." },
    { name: "Screening bands", what: "Settlement legs bucketed per rail under/between/over the threshold lines — the card mid band holds 13 legs (1000.00–3000.00), wire 7; the only sub-threshold leg in the book is the 925.00 void-but-drawn hit. The AML-style census compliance reads weekly." },
    { name: "No-leg watch", what: "Billings with no settlement row at all — 6 carrying 15217.00, bucketed by issue month against flat 30-day terms. Membership is evidence (a missing rail hit), not the status column." },
    { name: "Rail mix", what: "Settlement legs per rail — card 16 / 37364.00 (debit rail), wire 11 / 32248.00 (SEPA-style). The pair cross-foots to the cash book's 69612.00 debit fold." },
    { name: "Books proof delta", what: "Total debits minus total credits across the ledger — 181080.00 against 181080.00, delta 0 across 80 entries. A nonzero delta pages the close, not a footnote." },
    { name: "Ops cost lines", what: "Cost spend by category and month — Rent 14 lines / 16800.00, Ads 14 / 4570.00, monthly ops peaking 3210.00 in 2024-08. The cost read behind every efficiency scenario." },
    { name: "Collection tempo", what: "Days from billing to first settlement on settled billings — 20 billings, 28.4 days average, fastest 13, slowest 84, against flat 30-day terms. The scenario engine's collections assumption, verified." },
    { name: "Closing cash walk", what: "Running debit-minus-credit fold across the cash book's 27 entries, walked in post-date order with the id tiebreak: bottoms at −3159.00 in 2024-02, closes at 44196.00 after the 7076.00 month-end receipt. The proof behind the 69612.00-against-25416.00 book." },
    { name: "Tight-cadence watch", what: "Settlement legs landing within 7 days of the same rail's previous leg — the fraud-velocity census. This book reads 3 card hits (gaps 7, 5, 4) and a clean wire rail whose minimum gap is 13 days; each rail's first leg is baseline (NULL), never a burst." },
    { name: "Quiet-tail census", what: "The velocity KPI's mirror: legs arriving after 30-day lulls or longer — card 5, wire 6, 11 legs in all. A rail's health reads as a pair — bursts and lulls — never either alone." },
    { name: "Coverage census", what: "One-pass FILTER (WHERE …) read of settlement coverage: 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 no-leg (15217.00) — summing to the 28-billing book by construction. The fold ops runs before any dunning ships." },
  ],

  topics: [
    {
      name: "Household & account folds",
      why: "Retail banking reads households, not rows: billings, batches and balances GROUP BY book, with LEFT JOIN shapes that keep empty accounts visible — the fold the tie-back rule is built on.",
      slugs: ["bank-account-summary-ii", "combine-two-tables", "find-the-team-size"],
    },
    {
      name: "Screening bands & thresholds",
      why: "The compliance census is a CASE ladder: legs bucketed under, between and over the lines per rail. Band edges are definitions — BETWEEN is inclusive, and a leg sitting on the line moves bands and counts.",
      slugs: ["structuring-detection", "suspicious-bank-account-transactions", "spend-histogram"],
    },
    {
      name: "Settlement rails",
      why: "Two rails, 27 legs, one cross-foot: card 16 / 37364.00 against wire 11 / 32248.00. Velocity bursts, duplicate-pair screens and rate rankings are how the payments desk watches the rails behave.",
      slugs: ["transaction-velocity", "duplicate-charge-pairs", "chargeback-rate-ranking"],
    },
    {
      name: "State pivots & CASE ladders",
      why: "Scenario reporting is conditional folding: state counts and dollars per book computed in one pass with CASE arms — the shape every monthly pack opens with.",
      slugs: ["reformat-department-table", "count-salary-categories", "weather-type-in-each-country"],
    },
    {
      name: "Anti-joins & the uncollected book",
      why: "The watch is a missing rail hit, not a status word: LEFT JOIN with the IS NULL arm finds the 6 billings / 15217.00 that no settlement ever touched — and the open-status census is not the same set.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "find-churn-risk-customers"],
    },
    {
      name: "Month spines & scenario reads",
      why: "Scenarios live on calendar spines: strftime month buckets across 2024-01 to 2025-02, dated folds and period filters are how the scenario team slices the book — one '%Y-%m' key at a time.",
      slugs: ["friday-purchase-iii", "monthly-transactions-i", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "NULL policy & data hygiene",
      why: "Data-first means NULL-first: a missing rail hit is information, an empty fold prints NULL not zero, and the audits that catch blanks before stakeholders do are the floor's daily hygiene.",
      slugs: ["null-blank-audit", "find-customer-referee", "employees-with-missing-information"],
    },
    {
      name: "Running balances",
      why: "Accounts are running stories: balance walks over ordered events, running totals and cumulative windows are the drills behind every account-level read the service desks quote.",
      slugs: ["account-balance", "running-total-for-different-genders", "last-person-to-fit-in-the-elevator"],
    },
    {
      name: "Payment cadence",
      why: "Retail money breathes on paydays: weekday and month-end cadence reads, repeat-payment frequencies and short-window repeat screens decide when the bank staffs and nudges.",
      slugs: ["customer-order-frequency", "friday-purchases-i", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Credit watch basics",
      why: "The uncollected book ages like credit: days-past-terms buckets, utilization-style bands and vintage curves are the language the collections scenario borrows from credit risk.",
      slugs: ["delinquency-buckets", "credit-utilization-bands", "vintage-default-curves"],
    },
    {
      name: "Settlement-date math & cadence",
      why: "Days-to-settle is the scenario engine's collections assumption: julianday arithmetic from issue to first payment (28.4 days average against flat 30-day terms), weekday lags and burst lines on the rails. Date math here is a KPI definition, not a syntax drill — the population (settled, evidenced) travels with every number.",
      slugs: ["users-that-actively-request-confirmation-messages", "biggest-window-between-events", "second-day-confirmation"],
    },
    {
      name: "Fraud velocity & ramping screens",
      why: "Velocity is a per-rail gap census: LAG down each rail's timeline, a published burst line, and the quiet-tail mirror for lulls. Ramping screens — amounts climbing leg over leg — and rolling windows are how the desk watches behavior instead of single tickets.",
      slugs: ["rolling-7d-actives", "consecutive-transactions-with-increasing-amounts", "find-golden-hour-customers"],
    },
    {
      name: "Dormancy & the reactivation watch",
      why: "Dormancy is recency evidence: no rail hit inside the policy window, found by NOT EXISTS rather than a status word — the same grammar as the no-leg watch pointed at accounts. The watch pairs with reactivation: households just inside the line are the winback list.",
      slugs: ["find-zombie-sessions", "week-over-week-churn", "winback-recovery"],
    },
    {
      name: "Set ops & stacked boards",
      why: "Board packs stack populations: two leaderboards in one report, a census with its TOTAL row, states side by side. The traps are silent — UNION dedups whole rows, arms must align column-for-column, and the compound's ORDER BY belongs at the end.",
      slugs: ["monthly-transactions-ii", "count-apples-and-oranges", "customers-who-bought-a-and-b-not-c"],
    },
    {
      name: "Subquery shapes & staged scenarios",
      why: "Scenario reporting escalates into staging: fold first, judge against a computed benchmark second. Scalar, IN, EXISTS and derived-table shapes each carry a population definition — and the staged CTE is the house preference because the definition becomes reviewable.",
      slugs: ["second-highest-salary", "investments-in-2016", "department-highest-salary"],
    },
  ],

  theory: [
    {
      id: "ing-t1",
      q: "The household fold joins billings to settlement legs and the billing counts per book stop adding up. What broke?",
      a: "Fan-out: five billings settled on split plans carry two leg rows each, so the join prints 33 rows and COUNT(*) counts rail hits, not billings. The fix is grain discipline — fold legs per billing first, or protect the census with COUNT(DISTINCT i.id). At ING this is a culture point as much as a technical one: the data-first house believes the fold that reproduces the 28-billing book, and a fold at leg grain breaks the identity by exactly the five split plans. I say the grain out loud before I write the join — billing grain for the census, leg grain for the rails read, and the alias says which.",
      tag: "joins",
    },
    {
      id: "ing-t2",
      q: "Build the screening census — legs bucketed by amount band, per rail — so compliance can watch the mid-band mass.",
      a: "One pass over the settlement feed with CASE arms per band: SUM(CASE WHEN amount_cents < line THEN 1 ELSE 0 END) for the under-band, a BETWEEN-style arm for the mid band, an over-arm with an ELSE 0 — then GROUP BY method so card and wire read side by side. The traps I name: the ELSE arm must be 0, because ELSE NULL makes SUM ignore the row and the count silently shrinks; the edges are inclusive decisions (BETWEEN closes both ends), and the 925.00 leg — the only sub-threshold hit in the book — belongs to the void-but-drawn billing, so the census pairs with the anomaly file before anyone calls the small band clean.",
      tag: "aggregation",
    },
    {
      id: "ing-t3",
      q: "The collections review wants each book's biggest exposures ranked within the book. How do you build that board?",
      a: "Windows with PARTITION BY book: RANK() OVER (PARTITION BY region ORDER BY amount_cents DESC) restarts the ladder per book, and the outer ORDER BY book, rung makes it read book by book. Without the partition you get one global ladder — the EU book would own the top rungs and the other books' owners would read boards with no top. I keep the tie policy explicit (RANK shares rungs, ROW_NUMBER doesn't), pin a deterministic tiebreaker inside the window, and quote the actuals while I build: the EU book's rung 1 is the 6148.00 open partial, which is exactly the kind of fact a scenario pack should say out loud.",
      tag: "windows",
    },
    {
      id: "ing-t4",
      q: "Both the open-status census and the no-leg watch read six billings — but the dollars differ: 19609.00 versus 15217.00. Explain.",
      a: "Same count, different sets — membership is the whole story. The open census keys on the status column; the watch keys on evidence (no settlement row at all). The 4392.00 gap is two honest anomalies: an open billing that took a 4000.00 partial against its 6148.00 balance (evidence exists, so it leaves the watch) and a paid-status billing at 1756.00 with no rail hit (a claim without evidence, so it stays). In a data-first bank this is the standard demo that a status column is a claim about a state machine, not a fact — I name both lists per book before choosing which one the review works, because per book the two lists can diverge differently.",
      tag: "nulls",
    },
    {
      id: "ing-t5",
      q: "Where does the 'books with a live uncollected balance' gate go — WHERE or HAVING — and why does the other one fail?",
      a: "HAVING, because the gate is on a fold and folds exist only after GROUP BY. WHERE runs before aggregation: an alias like uncollected_dollars isn't born yet, so the predicate either errors or filters rows on something else entirely. I narrate the pipeline — FROM and JOIN build rows, WHERE filters rows, GROUP BY folds, HAVING filters groups, SELECT projects, ORDER BY runs last — because in this house the pipeline order is a shared language: the scenario packs are folds and gates, and a gate in the wrong clause is the difference between 'books with exposure' and 'no rows' dressed as a report.",
      tag: "pipeline",
    },
    {
      id: "ing-t6",
      q: "One book's average billing looks high versus the whole. Scalar subquery, window, or CTE for the benchmark?",
      a: "By how much definition the benchmark needs. A scalar subquery — WHERE billed > (SELECT AVG(amount_cents) FROM invoices) — is the smallest correct form for one group-wide line. AVG() OVER (PARTITION BY book) is the better shape when the scenario wants each billing beside its own book's mean, because the benchmark travels with the row. A CTE earns its keep when the benchmark gets a definition — 'book average over open-and-paid billings, void excluded' — because a named fold is reviewable by the scenario board and a nested one-liner isn't. Scenario reporting is definition-heavy by nature, so I stage the CTE earlier than fashion suggests and let the definition live in one place.",
      tag: "subqueries",
    },
    {
      id: "ing-t7",
      q: "The scenario pack needs issue-month cohorts and days-past-terms. How do you do dates in SQLite for both?",
      a: "Two tools. Cohort buckets with strftime('%Y-%m', issued_on) — a '2024-10' style key that GROUP BY folds cleanly across the 2024-01 to 2025-02 window and sorts correctly as text; the %M trap is real (minutes, not months) and it dissolves a cohort card into forty buckets. Aging needs instant arithmetic: julianday(reference) - julianday(due_on) per billing against flat 30-day terms — and the silent failure I always flag: julianday over a NULL or malformed date NULLs the row, the subtraction propagates it, and the watch's denominator drifts. The settled book's own clock runs 28.4 days average (fastest 13, slowest 84), which is exactly why the scenario's collections assumption needs the terms distribution verified — min and max both print 30 here.",
      tag: "dates",
    },
    {
      id: "ing-t8",
      q: "A void billing drew a 925.00 settlement and a paid billing has no rail hit. Walk me through the break policy.",
      a: "Detect, quantify, route — per book, then as a group. Detect by pairing state with evidence: status = 'void' AND a settlement exists (the 925.00 break), status = 'paid' AND no settlement (the 1756.00 break) — a one-pass FILTER (WHERE …) census counts both arms on the same scan. Quantify in dollars; route to the team that owns the rail feed; never delete, never silently re-status. Then reconcile to the book of record: the ledger still proves 181080.00 against 181080.00, delta 0, because double-entry records what happened — including mistakes. The trial balance proves symmetry, never correctness; in a data-first bank the census and its definitions are the control, and the writeup ships as a query anyone can rerun.",
      tag: "quality",
    },
    {
      id: "ing-t9",
      q: "The monthly cash walk jumps two entries at one month-end. Is that a frame bug or a windfall?",
      a: "Frame bug, and it has a precise name: the default frame with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes peers — rows tied on the ORDER BY key enter the cumulative together. The cash book has 13 month-end dates carrying two entries each, so ordering by entry_date alone makes every pair double-step mid-pair. Two honest fixes, and I name which I used: add the id tiebreak to the window's ORDER BY (entry_date, id — no peers exist), or write the frame explicitly — ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks strictly row by row. The third variant is no ORDER BY at all: the frame becomes the whole partition and the 'running total' is the 44196.00 grand total repeated on every row. At ING the proof is the last row: the walk must land on the book's net — a walk that skips is a walk nobody ships.",
      tag: "frames",
    },
    {
      id: "ing-t10",
      q: "Define days-to-settle so compliance can automate it. Which dates, which population, and where does the void-but-drawn leg go?",
      a: "Issue date to first settlement leg, computed with julianday subtraction, over the settled-and-evidenced population only — 20 billings here, averaging 28.4 days (fastest 13, slowest 84) against flat 30-day terms, which makes the terms comparison one subtraction per row. The exclusions are the definition: the six no-leg billings never settled and cannot dilute a tempo average; the void-but-drawn 925.00 leg settled a billing that does not exist, so it belongs to the anomaly file, not the KPI — route it out and say so in the footnote. Denominators travel with the number: 28 billings is the book, 22 have legs, 21 are exactly covered — 'days to settle' is the 20, and the population is the difference between a metric and a vibe. Split plans ride their FIRST leg — the second leg is a plan, not a second settlement event.",
      tag: "dates",
    },
    {
      id: "ing-t11",
      q: "Define a velocity burst so the fraud desk can automate it. What makes the definition defensible?",
      a: "A burst is a settlement leg whose gap to the SAME RAIL'S previous leg falls under the published line — seven days here. Three decisions make it defensible. Partition per rail: card legs measure card history, wire measures wire — cross-rail pairing invents bursts out of a household using both rails. Baseline policy: each rail's first leg has no previous, so its gap is NULL — *baseline, not a zero* — and coalescing to 0 would flag every rail's opener as a same-day burst. Edge policy: the line is inclusive (<=), same convention as the band edges. On this book the census reads 3 card bursts (gaps 7, 5, 4) and a clean wire rail whose minimum gap is 13 — and the watch ships with its mirror, the quiet-tail census (5 card and 6 wire legs after 30-day lulls), because velocity health is a pair of tails, never one.",
      tag: "kpi",
    },
    {
      id: "ing-t12",
      q: "Two household boards stacked with UNION printed six rows yesterday and five today. What happened?",
      a: "UNION dedups whole rows — two identical (name, value) pairs collapse to one. The boards fold different aggregates (SUM of booked batches versus MAX single batch), so a collision means the VALUES moved: some household's total landed exactly on another's largest ticket, and the stack quietly ate a row. The book boards read 7262.35 / 6640.56 / 4574.23 against the single-batch 1088.44 / 945.21 / 845.92 — Emma Wilson appears on both with different values, which is why UNION keeps six today — but the operator choice is the actual lesson: UNION ALL is the append that cannot lose a row, UNION is a set merge with dedup semantics, EXCEPT is a directional difference, INTERSECT is an overlap test. I choose by the question the board answers, and I reconcile the stack — count the rows, re-sum the values — before it ships.",
      tag: "setops",
    },
    {
      id: "ing-t13",
      q: "What makes an account dormant — and why is the status column the wrong place to look?",
      a: "Dormancy is recency evidence: no settlement leg dated inside the policy window — say twelve months — found by a NOT EXISTS anti-join over the activity feed, exactly the grammar of the no-leg watch pointed at accounts. The status column is a claim someone updates when they remember; the missing rail hit is a fact the query re-derives every run. Two policy edges to state out loud: a NULL last-activity is not dormancy — a never-active account is an onboarding problem for a different team — and the window line is a definition that ships in the footnote, inclusive or strict by convention. The watch pairs with reactivation: households whose last hit sits just inside the line are the winback list, and week-over-week inactivity deltas tell you when to work it. In a data-first bank the dormant flag is a query, not a field someone maintains.",
      tag: "dormancy",
    },
    {
      id: "ing-t14",
      q: "Why does WHERE review_share > 0.1 fail while ORDER BY review_share works on the same query?",
      a: "Clause timing. SELECT aliases are born in the projection stage; WHERE runs before projection, so the alias does not exist yet — the predicate errors or, worse, matches some real column by accident. ORDER BY runs after projection, which is why it sees aliases. SQLite is looser than the standard — it tolerates aliases in GROUP BY — but that is an extension, not a portability promise, and I do not build on it. The fix I reach for is staging: compute the ratio in a CTE or derived table, then filter the staged column — in this house that is not just safe, it is preferred, because the ratio's definition becomes a named, reviewable fold instead of an expression repeated in two clauses. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is the shared language here; a gate in the wrong clause is the bug the review catches first.",
      tag: "pipeline",
    },
    {
      id: "ing-t15",
      q: "Build a trailing four-leg velocity read per rail. Why is ROWS in the frame non-negotiable?",
      a: "SUM(amount_cents) OVER (PARTITION BY method ORDER BY paid_on, id ROWS BETWEEN 3 PRECEDING AND CURRENT ROW) — and the ROWS keyword is the whole answer. With RANGE (the default), rows tied on the ORDER BY key are peers and enter the window together, so two same-day legs double-count into one step; ROWS walks strictly row by row. Edge rows read short windows honestly — leg two sums only two legs — so the ship ships window_n beside window_value and the denominator travels with the number. The frame IS the metric: UNBOUNDED PRECEDING..CURRENT gives the running total, 3 PRECEDING gives the trailing read, and swapping one for the other silently redefines the KPI while the query still runs. At ING the velocity census pairs the trailing window with the LAG gap read — one watches mass, the other watches cadence — and both write their frames explicitly.",
      tag: "frames",
    },
    {
      id: "ing-t16",
      q: "Each billing beside its book's average: correlated scalar subquery or window — and when is the correlated form actually right?",
      a: "By population, not by fashion. When the benchmark is the book's whole average — same population for every row — AVG(amount_cents) OVER (PARTITION BY book) is the better shape: one scan, the benchmark rides on every row, no per-row re-execution. The correlated scalar subquery re-runs per row — fine at 28 billings, dead at millions — but it earns its keep when the benchmark's population DEPENDS on the row in ways a window cannot express: the average of billings issued strictly before this one, the vintage read that only counts prior history. That prior-only population is exactly the credit-risk instinct — vintage curves are built on it — and no window frame gives it to you cleanly. I say the population out loud either way: 'this row's benchmark is the book' or 'this row's benchmark is its own past' — the sentence decides the shape, and the shape decides the cost.",
      tag: "subqueries",
    },
    {
      id: "ing-t17",
      q: "SUM reads 66443.00 but AVG divided by the row count disagrees. Walk me through the NULL arithmetic.",
      a: "The aggregates disagree because they count different things. SUM and AVG ignore NULLs; COUNT(*) does not — it counts rows. So AVG(amount) equals SUM(amount) divided by COUNT(amount), the non-null count, not COUNT(*), and any row with a NULL amount shifts the average silently. On the join-heavy reads the NULL payload rides in from the LEFT JOIN arm — the no-leg six carry NULL leg columns — and a CASE arm written ELSE NULL instead of ELSE 0 shrinks exactly the arms someone later divides by. My policy: fold raw with SUM (NULL-ignoring is a feature there), compute the two counts explicitly, divide deliberately with the 1.0 promoter, and ROUND last — once. COALESCE is an edge-of-the-query display tool, never something inside the fold: a coerced zero is a lie the reconciliation cannot detect, while a NULL at least pages somebody.",
      tag: "nulls",
    },
    {
      id: "ing-t18",
      q: "Why does this house insist money stays INTEGER until one division at the edge?",
      a: "Because integers reconcile and floats drift. Cents are exact — the ledger proves 181080.00 against 181080.00, delta 0, and that identity is only provable at integer grain; REALs accumulate binary representation error, and 0.1 is not representable at all. The discipline: keep every fold — SUM, AVG, window walks — in amount_cents, then divide by 100.0 exactly once at the edge and ROUND after the division, not before. The classic bugs are all division bugs: integer division (amount_cents / 100) floors silently — 92450 reads 924 and fifty cents vanish per row; rounding before dividing bakes the error into the fold; dividing twice slides the decimal three places. The one-promoter rule — / 100.0, not / 100 — is the cheapest data-quality control in the building, and the review quotes it like a fact of nature.",
      tag: "money",
    },
    {
      id: "ing-t19",
      q: "Find duplicate settlement legs: same rail, same day, same amount, different billing. Sketch the shape.",
      a: "A self-join with a canonical pair key: payments p1 JOIN payments p2 ON p1.method = p2.method AND p1.paid_on = p2.paid_on AND p1.amount_cents = p2.amount_cents AND p1.id < p2.id — and the strict less-than is the load-bearing decision. It canonicalizes the pair (each pair prints once) and excludes self-pairs in the same stroke; >= would print every pair twice plus every leg paired with itself, and the census would triple-count its own evidence. The discriminator matters too: a legitimate split plan puts two legs on one billing — the screen demands a DIFFERENT invoice_id to call something a duplicate, not a plan. On this book the screen returns zero pairs, and proving a confident zero is the deliverable — the pair screen is the duplicate-charge grammar the payments desk borrows from the card world, and its power is that absence prints as an empty set nobody can argue with.",
      tag: "selfjoin",
    },
    {
      id: "ing-t20",
      q: "Cycle notices arrive twice. Keep the latest — ROW_NUMBER, DISTINCT, or GROUP BY?",
      a: "ROW_NUMBER, with the tiebreak said out loud: ROW_NUMBER() OVER (PARTITION BY billing_key ORDER BY updated_at DESC, id DESC) = 1 keeps exactly one survivor per key, and the id breaks the tie two notices stamped the same second would otherwise leave to chance — flip the plan and the survivor flips, which is how two analysts ship two different 'latest' rows from the same table. DISTINCT dedups only whole identical rows, and the two notices differ by a timestamp column, so it keeps both and calls it clean. GROUP BY key with MAX(updated_at) returns the latest timestamp but not the latest ROW — the rest of the row is whatever the engine picks, which is not a policy. Dedupe is a grain decision, not a keyword: choose the key, choose the survivor with an ordering, name the tiebreak — then the query is reproducible, which in this house is the definition of done.",
      tag: "dedupe",
    },
    {
      id: "ing-t21",
      q: "The month-spine query scans the whole table even though created_at is indexed. Diagnose.",
      a: "Someone wrapped the column: WHERE strftime('%Y-%m', created_at) = '2024-10' puts a function between the index and the predicate, so the index on created_at is unusable — the plan degrades to a full scan (non-sargable, in the jargon). The fix is a half-open range that keeps the column bare: created_at >= '2024-10-01' AND created_at < '2024-11-01' — the index seeks straight to the bucket, and the half-open upper bound survives timestamps where BETWEEN '2024-12-31' would silently drop year-end rows with a time component. The discipline splits by clause: functions in WHERE and JOIN kill index use; the same strftime in SELECT — building the month key for GROUP BY — costs nothing. At 103 rows this is milliseconds; the interview point is the instinct at a hundred million, where the same mistake is an incident.",
      tag: "perf",
    },
    {
      id: "ing-t22",
      q: "Two screening feeds list the same household as 'de Bruyn' and ' de bruyn '. What is the SQL matching policy?",
      a: "Normalize both sides, then compare exactly: UPPER(TRIM(a.name)) = UPPER(TRIM(b.name)) — case and whitespace are presentation noise, and equality only means something after both feeds agree on form. The month-key twin of the rule: SUBSTR(issued_on, 1, 7) and strftime('%Y-%m', issued_on) agree — pick one per query so keys join to keys, and never let half the pipeline use one. What I refuse is fuzzy pretending to be exact: LIKE '%de%' matches every household containing those letters, and false positives in a screening workflow are expensive in exactly the direction regulators ask about — flagged-and-wrong is worse than missed-and-documentable. The deeper policy: normalization belongs in the query until the pipeline owns it, and the disagreement between feeds is a data-quality ticket filed the same day — the analyst ships the read and files the ticket, in that order.",
      tag: "text",
    },
    {
      id: "ing-t23",
      q: "The stacked report errors: 'SELECTs to the left and right of UNION do not have the same number of result columns.' What is the discipline?",
      a: "Set ops compare columns positionally — count first, then type family — so the arms must line up column for column, and I write them with that alignment visible: same number of expressions, compatible types, in the same order. Only the first arm's aliases name the output; ORDER BY on a compound references the first arm's names and sits at the very end — per-arm ORDER BY does not survive into the compound, and per-arm LIMIT needs each arm staged as its own subquery, which is exactly the two-boards shape. UNION dedups whole rows, UNION ALL appends without looking, EXCEPT is directional — paid EXCEPT with-legs is a different question from its mirror. And the reconciliation habit closes it: the stacked counts must re-sum to the unfolded total — 21 exact plus 1 partial plus 6 none equals 28 billings — because a stack that cannot be re-derived from its arms is a stack nobody should paste into a deck.",
      tag: "stacking",
    },
    {
      id: "ing-t24",
      q: "You own the monthly scenario pack end to end. Sketch the query architecture you ship.",
      a: "Stage, don't nest — one CTE per population, each with a definition I can say in one sentence. CTE one, the state census: 28 billings folded paid / open / void. CTE two, the watches: the no-leg anti-join (6 / 15217.00) and the anomaly arms — void-but-drawn 925.00, paid-with-no-legs 1756.00. CTE three, the proofs: the cash walk closing at 44196.00 and the trial balance at delta 0. The pack joins definitions, not numbers — every headline carries its denominator (28 versus 22 versus 21) and its edge policy (inclusive bands, NULL baseline, split-plan grain). The writeup IS the query: rerunnable, commented with the definitions, reconciling by construction — 21 plus 1 plus 6 equals 28, or the fold is the bug, not the data. That is the ING bar: a stakeholder should be able to rerun the pack and get the same numbers, and know exactly which sentence of the definition each number came from.",
      tag: "method",
    },
  ],

  mcqs: [
    {
      id: "ing-mcq-1",
      prompt: "The household census needs billings per book — but the join to settlement legs inflates it. Which count is honest at billing grain?",
      choices: [
        "COUNT(*) over the billings-legs join",
        "COUNT(DISTINCT i.id) over the join — five split-plan billings ride two legs each",
        "COUNT(p.id) — legs are billings once deduped by eye",
        "COUNT over invoices only, then add the legs count",
      ],
      answer: 1,
      why: "The join prints 33 rows on a 28-billing book (five split plans double their rows). COUNT(DISTINCT i.id) folds back to billing grain — the grain whose book split must reproduce the whole.",
      notes: [
        { choice: 0, why: "COUNT(*) counts rail hits — the split exceeds the whole by exactly the split plans and nobody can say why. Grain discipline is the whole point of the census." },
        { choice: 2, why: "COUNT(p.id) counts legs (27), and 'deduping by eye' isn't a query. The mechanism has to be in the SQL or it isn't reproducible." },
      ],
      difficulty: "easy",
    },
    {
      id: "ing-mcq-2",
      prompt: "The cohort spine buckets billings by issue month. Which expression builds the '2024-11'-style key?",
      choices: [
        "strftime('%Y-%m', issued_on)",
        "strftime('%M', issued_on)",
        "SUBSTR(issued_on, 6, 2)",
        "MONTH(issued_on)",
      ],
      answer: 0,
      why: "strftime('%Y-%m', issued_on) prints the month key the spine buckets on — and the keys sort correctly as text across the 2024-01 to 2025-02 window.",
      notes: [
        { choice: 1, why: "%M is MINUTES in SQLite — every billing buckets by wallclock minute. The classic trap, and the spine becomes forty slivers." },
        { choice: 2, why: "Characters 6–7 are the month NUMBER alone — '11' for November — losing the year, so 2024-11 and any 2025-11 would collide into one bucket." },
      ],
      difficulty: "easy",
    },
    {
      id: "ing-mcq-3",
      prompt: "The rail census must headline the bigger rail's dollars first. Which clause does it?",
      choices: [
        "ORDER BY rail_dollars DESC",
        "ORDER BY rail_dollars",
        "ORDER BY method",
        "SORT BY rail_dollars DESC",
      ],
      answer: 0,
      why: "DESC headlines the card rail (37364.00) above wire (32248.00) — the pack reads exposure top-down. The default is ascending, which would open on the smaller rail.",
      notes: [
        { choice: 1, why: "Ascending by default — the smaller rail tops the slide. Direction is part of the definition, not styling." },
        { choice: 3, why: "SORT BY isn't SQL — the statement errors. The keyword is ORDER BY; interviewers hear the difference instantly." },
      ],
      difficulty: "easy",
    },
    {
      id: "ing-mcq-4",
      prompt: "Compliance wants legs bucketed under/between/over 1000.00 and 3000.00 per rail. What does the CASE ladder's ELSE arm have to be?",
      choices: [
        "NULL — unbucketed rows shouldn't count",
        "0 — every row lands in exactly one band, counted or not",
        "1 — every row is suspicious by default",
        "The band name as a string",
      ],
      answer: 1,
      why: "The bands are counted with SUM(CASE WHEN … THEN 1 ELSE 0 END) — the ELSE 0 keeps non-matching rows out of THIS band's count while keeping the row in the others. The mid band then reads 13 card legs / 7 wire legs, honestly.",
      notes: [
        { choice: 0, why: "ELSE NULL makes SUM ignore the row — harmless inside one arm, fatal when the same pattern is reused for a count: the count silently shrinks and the band census stops summing to the leg total." },
        { choice: 2, why: "An ELSE 1 plants every row into every band — 27 legs in each, and the census reads as pure noise. The THEN arm is the membership test; the ELSE is its negation." },
      ],
      difficulty: "medium",
    },
    {
      id: "ing-mcq-5",
      prompt: "The band edges are 1000.00 and 3000.00. A leg lands at exactly 3000.00. With BETWEEN 100000 AND 300000 on the mid band, where does it count?",
      choices: [
        "Mid band — BETWEEN is inclusive on both ends",
        "Large band — BETWEEN excludes the upper edge",
        "Both bands — the row duplicates",
        "Neither — edge values are dropped",
      ],
      answer: 0,
      why: "BETWEEN closes both ends, so an on-the-line leg counts in the mid band and must be excluded from the over-band with a strict >. Band edges are definitions — and this book has no leg exactly on the line today, which is exactly why the definition must be written down before one shows up.",
      notes: [
        { choice: 1, why: "BETWEEN is inclusive: >= lower AND <= upper. Excluding the top edge is the behavior of a strict <, and mixing the two without noticing is how bands double-count or drop legs." },
        { choice: 2, why: "A row evaluates once per arm — with inclusive-then-strict edges it lands in exactly one band. Duplication is a bug of overlapping ranges, not of BETWEEN itself." },
      ],
      difficulty: "medium",
    },
    {
      id: "ing-mcq-6",
      prompt: "The no-leg watch runs as billings LEFT JOIN legs WHERE p.id IS NULL. What lands in the watch?",
      choices: [
        "The 6 open billings — status is what the watch means",
        "The 6 billings with no settlement row — including one paid-status billing at 1756.00",
        "The void billing — it never settled",
        "Every billing — the join fanned out",
      ],
      answer: 1,
      why: "The watch's membership is evidence: no rail hit at all. That's 4 EU billings (8524.00), the US 4937.00 and the APAC 1756.00 — 6 billings / 15217.00, and one of them says paid. Status is a claim; the missing leg is the fact.",
      notes: [
        { choice: 0, why: "The open census carries 19609.00, not 15217.00 — the open 4000.00-partial HAS a leg and stays out of the watch. Same count, different set." },
        { choice: 2, why: "The void billing drew its 925.00 — it HAS a leg, so the anti-join is structurally blind to it. The watch is 'never settled', not 'cancelled'." },
      ],
      difficulty: "medium",
    },
    {
      id: "ing-mcq-7",
      prompt: "The scenario keeps only books whose uncollected dollars exceed zero. Where does that gate live?",
      choices: [
        "WHERE uncollected_dollars > 0",
        "HAVING SUM(i.amount_cents) > 0",
        "LIMIT 3",
        "WHERE p.id IS NOT NULL",
      ],
      answer: 1,
      why: "The gate is on a fold — folds exist only after GROUP BY, so the gate is HAVING written against the conditional fold. WHERE runs before any fold exists.",
      notes: [
        { choice: 0, why: "WHERE can't see SELECT aliases or folds — uncollected_dollars isn't born at row-filter time. It errors or filters the wrong thing." },
        { choice: 3, why: "That flips the watch: IS NOT NULL keeps the billings WITH legs — the settled book — and deletes the very population the scenario watches." },
      ],
      difficulty: "medium",
    },
    {
      id: "ing-mcq-8",
      prompt: "An analyst writes LEFT JOIN payments p ON p.invoice_id = i.customer_id. The query runs and returns rows. What's the assessment?",
      choices: [
        "Fine — any integer key joins",
        "Silently wrong: billings pair with whichever billing-id equals their customer id — a wrong-match set, not an error",
        "Fails loudly — wrong keys always error",
        "Fine — LEFT JOIN forgives all keys",
      ],
      answer: 1,
      why: "Both sides are integers, so SQLite happily matches payment rows whose invoice_id equals some billing's customer_id — a garbage correlation that runs clean. Wrong-key joins fail by returning plausible nonsense, which is why the join key is quoted in every review here.",
      notes: [
        { choice: 2, why: "Type-compatible wrong keys never error — the db can't know your intent. The only guard is the review habit of reading the join line first." },
        { choice: 3, why: "LEFT JOIN changes which side may be empty, not which pairs are correct. Forgiveness of NULLs is not forgiveness of wrong keys." },
      ],
      difficulty: "hard",
    },
    {
      id: "ing-mcq-9",
      prompt: "The pack quotes a settlement rate. Which denominator is honest for 'share of billings fully settled'?",
      choices: [
        "21 settled of the 22 billings that have any leg",
        "21 exact of all 28 billings — the book, including the 6 with no leg",
        "21 of 27 — one per leg",
        "16 of 27 — card legs only",
      ],
      answer: 1,
      why: "The book is 28 billings; the exact-coverage census is 21. Denominators that quietly drop the no-leg six (22) or count legs (27) turn a 75% coverage into a flattering 95% — the definition, including who's excluded, ships on the slide.",
      notes: [
        { choice: 0, why: "22 is 'billings with evidence' — the no-leg six vanish from their own coverage metric. That's the denominator trap the review is designed to catch." },
        { choice: 2, why: "27 is the leg count — split-plan billings count twice. Rates are computed at billing grain or they aren't rates." },
      ],
      difficulty: "hard",
    },
    {
      id: "ing-mcq-10",
      prompt: "The mid-band census uses ELSE 0 everywhere except one arm written ELSE NULL. What does that arm's count do?",
      choices: [
        "Counts correctly — NULL and 0 are the same in SUM",
        "Counts only its matching rows — SUM skips NULLs, so the arm still reads right, but the habit breaks the moment the arm is reused as a numerator over a denominator",
        "Returns zero always",
        "Errors — CASE must return numbers",
      ],
      answer: 1,
      why: "SUM ignores NULLs, so THIS count survives — that's the trap: the bug is latent, not visible. The band census stops summing to the leg total the day someone divides by the arm or adds a percentage, and in a data-first bank the definition has to be uniform: every arm ELSE 0.",
      notes: [
        { choice: 0, why: "NULL and 0 are different values — SUM treats them differently on reuse (averages, ratios, denominators). 'Same in SUM' is today's accident, not tomorrow's guarantee." },
        { choice: 2, why: "SUM over an arm with NULL ELSE still sums its THEN 1s — it doesn't zero out. The danger is the silent divergence from the ELSE 0 convention, not an instant zero." },
      ],
      difficulty: "hard",
    },
    {
      id: "ing-mcq-11",
      prompt: "The rail census prices the card rail. Which fold prints 37364.00 honestly from integer cents?",
      choices: [
        "ROUND(p.amount_cents / 100, 0) summed per leg",
        "ROUND(SUM(p.amount_cents) / 100.0, 2) — fold in cents, divide once at the edge",
        "SUM(p.amount_cents) / 100 — integer arithmetic, no rounding needed",
        "AVG(p.amount_cents) * COUNT(*) / 100.0",
      ],
      answer: 1,
      why: "The book folds in its native unit — SUM over cents, one division by 100.0 at the edge, one ROUND. The card rail reads 37364.00 exactly, and every cross-foot against the cash book starts from that discipline: fold first, convert once.",
      notes: [
        { choice: 0, why: "Dividing by the integer 100 is integer division — every leg truncates to whole dollars before the ROUND, and 37364.00 collapses by up to 99 cents per leg. The wrong divisor is silent because the query still runs." },
        { choice: 3, why: "AVG × COUNT equals the SUM only while no NULLs ride along, and it round-trips through a mean nobody can audit. The census has to be one readable fold, not an identity that holds by accident." },
      ],
      difficulty: "easy",
    },
    {
      id: "ing-mcq-12",
      prompt: "Settlement-date math: the pack quotes 28.4 days average issue-to-pay across the 20 paid billings with legs. Which expression measures one billing's days?",
      choices: [
        "paid_on − issued_on",
        "JULIANDAY(paid_on) − JULIANDAY(issued_on)",
        "strftime('%d', paid_on) − strftime('%d', issued_on)",
        "DATEDIFF(day, issued_on, paid_on)",
      ],
      answer: 1,
      why: "JULIANDAY converts each date to a float day count, so the subtraction is calendar-true across month boundaries — the fastest settle ran 13 days, the slowest 84, and only a true day-difference survives the fold to 28.4.",
      notes: [
        { choice: 0, why: "The − operator on 'YYYY-MM-DD' text coerces to numbers — '2024-11-05' becomes 2024 — so the difference prints years, not days. It runs clean and produces garbage, the worst combination in a settlement review." },
        { choice: 3, why: "DATEDIFF is another dialect — SQLite has no such function and the statement errors. Date math here is julianday, date(), or strftime; nothing else ships in the pack." },
      ],
      difficulty: "easy",
    },
    {
      id: "ing-mcq-13",
      prompt: "The pack stacks two boards with UNION — the void-but-drawn watch (the 925.00 leg) and the over-band census. Which contract holds?",
      choices: [
        "Each arm carries its own ORDER BY so the stack sorts itself",
        "Both arms select the same column count with compatible types; one ORDER BY after the last arm governs the whole stack",
        "The arms need identical column names or the union errors",
        "UNION stacks rows without checking columns at all",
      ],
      answer: 1,
      why: "A compound SELECT is one statement: the arms line up column-for-column, and ORDER BY is written once, after the last arm — it sorts the stack, not an arm. Column names come from the first arm; the second's names are irrelevant.",
      notes: [
        { choice: 0, why: "ORDER BY inside an arm is a syntax error in a compound select — the sort belongs to the stack. Every review reads the last line of a UNION first for exactly this reason." },
        { choice: 2, why: "SQLite takes names from the first arm and never compares names across arms — only column count and type affinity matter. The names-must-match rule is folklore here, and citing it in review costs credibility." },
      ],
      difficulty: "easy",
    },
    {
      id: "ing-mcq-14",
      prompt: "The scenario keeps only legs whose rank within their billing is 1 — but WHERE rn = 1 errors. Where does the filter live?",
      choices: [
        "WHERE rn = 1 works if the alias is quoted",
        "HAVING rn = 1, since the rank is a fold",
        "Wrap the windowed SELECT in a CTE or derived table, then filter rn = 1 in the next stage",
        "Move rn = 1 into the window's ORDER BY",
      ],
      answer: 2,
      why: "Windows evaluate after WHERE — the rn column does not exist yet when WHERE runs, in any clause position. The pipeline fix is a named stage: compute rn in a CTE, filter in the next SELECT. That is scenario-pack architecture, not a workaround.",
      notes: [
        { choice: 1, why: "HAVING is the post-GROUP BY gate for aggregates; a window is neither grouped nor folded, and SQLite rejects window expressions in HAVING all the same. The stage after the window is another SELECT, not a different filter clause." },
        { choice: 3, why: "The window's ORDER BY defines how rn is computed, not which rows survive — a predicate there is a syntax error, and even conceptually the filter must run after the window stage completes." },
      ],
      difficulty: "medium",
    },
    {
      id: "ing-mcq-15",
      prompt: "The cash walk replays the 44196.00 closing balance over the 80-entry ledger ordered by posted_at — and on a double-entry book, entries can share a post date. Which frame walks entry by entry?",
      choices: [
        "SUM(debits − credits) OVER (ORDER BY posted_at) — the default frame is fine",
        "SUM(...) OVER (ORDER BY posted_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)",
        "SUM(...) OVER (ORDER BY posted_at RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)",
        "SUM(...) OVER () — every row gets the closing balance",
      ],
      answer: 1,
      why: "The default frame is RANGE, and RANGE treats ORDER BY peers as one position — same-date entries move the running balance by their combined amount in one stair-step. ROWS counts physical rows, so the walk advances entry by entry and every intermediate balance is attributable. The close lands on 44196.00 either way; the path is what the reconciliation reads.",
      notes: [
        { choice: 0, why: "Default RANGE makes peers move together — the walk shows a stair-step, not a ledger replay. When the frame matters, write it out; 'whatever the default is' is not a definition a bank can audit." },
        { choice: 3, why: "No ORDER BY means one partition-wide frame — all 80 rows see 44196.00 and no row shows its own running position. That is the closing balance printed 80 times, not a walk." },
      ],
      difficulty: "hard",
    },
    {
      id: "ing-mcq-16",
      prompt: "The month-close slices November billings. Which predicate can actually use an index on issued_on?",
      choices: [
        "WHERE strftime('%Y-%m', issued_on) = '2024-11'",
        "WHERE issued_on >= '2024-11-01' AND issued_on < '2024-12-01'",
        "WHERE SUBSTR(issued_on, 1, 7) = '2024-11'",
        "WHERE issued_on LIKE '%-11-%'",
      ],
      answer: 1,
      why: "An index seek needs the bare column against constants — a half-open range does that, is NULL-safe, and is boundary-true. Wrapping the column in strftime or SUBSTR forces a per-row function call: the planner scans, and the close slows as the billing book grows.",
      notes: [
        { choice: 0, why: "strftime on the column makes the predicate non-sargable — the function runs per row, index or not. Compute the range bounds once and compare the column directly; the seek then does the slicing." },
        { choice: 3, why: "LIKE with a leading wildcard can never seek — and the pattern '%-11-%' isn't even month-true, matching November of any year at any position. Both a performance bug and a correctness one." },
      ],
      difficulty: "medium",
    },
    {
      id: "ing-mcq-17",
      prompt: "KYC funnel, event-grain log: each screening event carries household_id and stage (1 docs, 2 verify, 3 active), and re-screens log extra rows. The census is 16 households. Which fold counts households that REACHED stage 3?",
      choices: [
        "COUNT(*) WHERE stage = 3",
        "COUNT(DISTINCT CASE WHEN stage = 3 THEN household_id END)",
        "SUM(CASE WHEN stage = 3 THEN 1 ELSE 0 END) / 3",
        "COUNT(household_id) WHERE stage >= 3",
      ],
      answer: 1,
      why: "The funnel counts households, not events — a re-screened household logs stage 3 twice, and only DISTINCT folds the event stream back to census grain. The conditional CASE inside the fold keeps all three stages in one pass, so the drop-off from stage to stage is one query, not three.",
      notes: [
        { choice: 0, why: "COUNT(*) is event grain — double-screened households double-count and the funnel can print more than 16, a drop-off mathematically impossible on its face. Grain first, then the fold." },
        { choice: 2, why: "Dividing an event count by 3 is numerology — stages do not fire in fixed multiples. The funnel's arithmetic has to be derivable from its definition, not reverse-engineered to fit the slide." },
      ],
      difficulty: "medium",
    },
    {
      id: "ing-mcq-18",
      prompt: "Debit-vs-credit rail mix: what share of the 27 settlement legs rode the card rail (16 legs)?",
      choices: [
        "SELECT 16 / 27 * 100",
        "SELECT 100.0 * 16 / 27",
        "SELECT ROUND(16 / 27) * 100",
        "SELECT 16 / 27.0 * 100 / 100",
      ],
      answer: 1,
      why: "16/27 in integer arithmetic is 0 — the whole share dies before the multiplication. Multiplying by 100.0 FIRST flips the pipeline to float, and the rail mix reads 59.3%. Order of operations is the definition of the rate.",
      notes: [
        { choice: 0, why: "Integer division truncates: 16/27 = 0, times 100 is still 0. The slide prints 0% and the mix review opens on a lie that syntax-checks perfectly." },
        { choice: 3, why: "It lands near 0.593 — but the unit is wrong twice, and the trailing /100 is a fudge factor invented to fit a known answer. A rate is one clean expression or it is not a rate." },
      ],
      difficulty: "medium",
    },
    {
      id: "ing-mcq-19",
      prompt: "The anomaly cell lists the five split-plan billing ids in one string. Which GROUP_CONCAT is deterministic?",
      choices: [
        "GROUP_CONCAT(i.id)",
        "GROUP_CONCAT(i.id ORDER BY i.id)",
        "GROUP_CONCAT(DISTINCT i.id) — DISTINCT sorts the values",
        "GROUP_CONCAT(i.id, ', ') with an outer ORDER BY i.id",
      ],
      answer: 1,
      why: "GROUP_CONCAT has no guaranteed order — the concatenated string comes out in whatever order rows visit the aggregate, which can change with the plan. SQLite (3.44+) accepts ORDER BY inside the aggregate: 1,5,12,19,22 on every rerun. In a data-first bank, a cell that reorders itself between reruns fails the rerunnable bar.",
      notes: [
        { choice: 2, why: "DISTINCT dedupes; it does not sort. Even where an implementation happens to emit sorted, that is an accident to be documented away, not a contract to hang an anomaly cell on." },
        { choice: 3, why: "The outer ORDER BY sorts output ROWS, not the values inside one cell — each group's string is still assembled in visit order. The sort belongs inside the aggregate call." },
      ],
      difficulty: "hard",
    },
    {
      id: "ing-mcq-20",
      prompt: "Keep-latest: each split-plan billing has two legs; the pack wants each billing's latest leg only. Which build is correct?",
      choices: [
        "JOIN (SELECT invoice_id, MAX(paid_on) AS mp FROM payments GROUP BY invoice_id) m ON m.invoice_id = i.id",
        "ROW_NUMBER() OVER (PARTITION BY invoice_id ORDER BY paid_on DESC, id DESC) = 1 — a total order, so exactly one row per billing even on date ties",
        "WHERE p.paid_on = (SELECT MAX(p2.paid_on) FROM payments p2 WHERE p2.invoice_id = i.id) — the correlated form guarantees one row",
        "ORDER BY paid_on DESC LIMIT 1 per billing — the newest leg only",
      ],
      answer: 1,
      why: "MAX(paid_on) is not a total order: two legs of a split plan can share a date, and every MAX-based build then returns BOTH rows — the dedupe re-fans exactly where it was built to fold. ROW_NUMBER with an id tiebreak makes the order total: one row per billing, provably, on any data. The correlated form has the same tie hole; it is just slower getting there.",
      notes: [
        { choice: 0, why: "The derived GROUP BY computes once per billing — that part is right — but the join on MAX alone duplicates on ties. Derived-vs-correlated is a cost question; the tiebreak is the correctness one." },
        { choice: 2, why: "The correlated form re-runs per outer row and still returns both tied legs — 'correlated guarantees one row' is the trap. Any MAX build needs a second key; only the window form has a slot for one." },
      ],
      difficulty: "hard",
    },
    {
      id: "ing-mcq-21",
      prompt: "The paid-billing census LEFT JOINs settlement legs and folds them — for the paid 1756.00 billing with no legs, the fold prints NULL. The slide policy says absence of legs prints as 0.00 so the anomaly is visible. Which expression implements it?",
      choices: [
        "SUM(p.amount_cents) — NULL is the honest print",
        "COALESCE(SUM(p.amount_cents), 0) / 100.0",
        "NULLIF(SUM(p.amount_cents), 0) / 100.0",
        "AVG(p.amount_cents) / 100.0",
      ],
      answer: 1,
      why: "COALESCE around the FOLD, not the rows: the group's fold is NULL (no non-NULL input at all), and the policy supplies 0 — which is exactly what makes the paid-no-legs billing read as 1756.00 billed / 0.00 drawn on the slide instead of an empty cell.",
      notes: [
        { choice: 2, why: "NULLIF(x, 0) maps 0 to NULL — the guard runs backwards here: it erases the very 0.00 the policy asked for. NULLIF removes a value; COALESCE supplies one. Know which direction the policy needs." },
        { choice: 0, why: "NULL is honest but unread: every downstream fold silently skips it, and 'paid with no drawn dollars' looks like a missing row rather than a zero. The print is the policy — that is why it is written down." },
      ],
      difficulty: "easy",
    },
    {
      id: "ing-mcq-22",
      prompt: "The household leaderboard is ranked by lifetime spend with RANK(). Two households tie for rank 2 — what rank does the next household print?",
      choices: [
        "3 — ranks are consecutive",
        "4 — RANK leaves a gap the size of the tie",
        "2 — the tie extends until someone beats both",
        "The query errors on ties",
      ],
      answer: 1,
      why: "RANK counts peers as one position and then jumps: 1, 2, 2, 4. The gap IS the information — it says two households sit ahead. DENSE_RANK is the no-gap sibling (1, 2, 2, 3), and choosing between them is a definition: a top-N with ties has to say which.",
      notes: [
        { choice: 0, why: "That is DENSE_RANK's contract, not RANK's. Shipping the wrong one silently changes who makes the top-3 — the tie policy belongs in the footnote." },
        { choice: 2, why: "Ranks do not extend on later ties — the next distinct value takes its positional rank, gap included. ROW_NUMBER would have printed 1,2,3,4 arbitrarily; RANK at least admits the tie." },
      ],
      difficulty: "easy",
    },
    {
      id: "ing-mcq-23",
      prompt: "Terms are a flat 30 days — avg, min and max terms all read 30. Which expression stamps each billing's due date?",
      choices: [
        "DATE(issued_on, '+30 days')",
        "issued_on + 30",
        "DATE(issued_on) + INTERVAL 30 DAY",
        "DATE(issued_on, 30)",
      ],
      answer: 0,
      why: "SQLite's date arithmetic is modifier strings: DATE(issued_on, '+30 days') returns a date. With uniform terms one modifier reproduces the aging ladder for every billing in the book.",
      notes: [
        { choice: 1, why: "Adding 30 to 'YYYY-MM-DD' text coerces the date to its leading number (2024) and prints something like 2054. It runs — which is the problem: silent garbage in a due-date column poisons every aging bucket under it." },
        { choice: 3, why: "The second argument is a modifier string; a bare 30 is not a valid modifier, and the function returns NULL. The due column goes quietly NULL and the drop-off shows up three queries later." },
      ],
      difficulty: "easy",
    },
    {
      id: "ing-mcq-24",
      prompt: "The pack's 28.4-day settle average covers the 20 paid billings with legs — five of them split plans with two legs each. Which fold reproduces it?",
      choices: [
        "AVG over every settlement leg of the paid billings — legs are the settlements",
        "Per billing, MIN(JULIANDAY(paid_on)) minus the issue day, then AVG over billings — settle means FIRST settlement, at billing grain",
        "Per billing, MAX(paid_on) minus the issue day — final settlement is the true settle",
        "AVG over all paid-status billings, including the one with no legs",
      ],
      answer: 1,
      why: "The metric is defined at billing grain: issue to FIRST settlement — MIN over the billing's legs, then AVG over the 20 billings, reading 28.4 with a 13-day fastest and an 84-day slowest. Folding at leg grain lets the split plans' second legs into the average and redefines the metric without saying so.",
      notes: [
        { choice: 0, why: "The leg count is not the billing count — split plans contribute two rows each, so the denominator changes definition silently. This fan-out is not a join bug; it is a grain bug in the metric itself." },
        { choice: 2, why: "MAX dates full settlement of the split plan — a stricter, different metric. Defensible on another slide, but it is not the 28.4 the pack quotes, and quoting one number while folding another is how packs stop reconciling." },
      ],
      difficulty: "medium",
    },
    {
      id: "ing-mcq-25",
      prompt: "Dormancy policy: a household is dormant if its last settlement leg predates the cutoff — or if it never had one. The last-leg fold is NULL for never-leg'd households. Which WHERE implements the policy?",
      choices: [
        "WHERE last_leg < :cutoff",
        "WHERE last_leg IS NULL OR last_leg < :cutoff",
        "WHERE COALESCE(last_leg, :cutoff) < :cutoff",
        "HAVING MAX(paid_on) < :cutoff on the legs join",
      ],
      answer: 1,
      why: "NULL compared to anything is unknown, and unknown is filtered — the bare predicate silently drops every never-leg'd household from the dormant census. The policy is a two-arm definition: no evidence is the stalemest stale, and the OR arm says so on the face of the query.",
      notes: [
        { choice: 2, why: "COALESCE(last_leg, :cutoff) folds never-leg'd households TO the cutoff, and cutoff < cutoff is false — the guard drops exactly the rows it was meant to save. Substitute a far-past sentinel and it works; as written it is inverted." },
        { choice: 3, why: "An inner join to legs already deleted the never-leg'd households before HAVING runs — the policy loses its NULL arm at the join, not at the filter. Pipeline order decides what a clause can even see." },
      ],
      difficulty: "medium",
    },
    {
      id: "ing-mcq-26",
      prompt: "A scenario slices one book that returns zero legs and computes card_dollars / leg_dollars as the rail mix. In SQLite, what does that slice print?",
      choices: [
        "An error — division by zero aborts the query",
        "0 — SQLite clamps zero divides",
        "NULL — x/0 yields NULL, so the cell is empty unless the policy wraps it",
        "Infinity — IEEE float semantics",
      ],
      answer: 2,
      why: "SQLite returns NULL for division by zero — no error, no zero, no infinity. The mix cell prints empty, and the slide's 0.0% has to come from a written policy: COALESCE around the rate, or a CASE that names the no-leg case. Unwrapped, the NULL then silently vanishes from any further fold of the column.",
      notes: [
        { choice: 0, why: "That is other engines' behavior, and the reason ported habits mislead here. SQLite's NULL-on-zero is lenient in the dangerous direction: nothing crashes, so nothing gets noticed." },
        { choice: 1, why: "NULL is not 0 — a zero would flow into averages and sums as a real value and understate the mix. The whole point of a NULL policy is that absence and zero are different numbers." },
      ],
      difficulty: "medium",
    },
    {
      id: "ing-mcq-27",
      prompt: "The rail census folds card legs, wire legs and both rails' dollars in ONE pass over the 27 legs. Which clause does SQLite support for conditional aggregates?",
      choices: [
        "COUNT(*) FILTER (WHERE method = 'card')",
        "COUNT(*) WHERE method = 'card'",
        "COUNTIF(method = 'card')",
        "FILTER (WHERE method = 'card') COUNT(*)",
      ],
      answer: 0,
      why: "FILTER is the standard conditional-aggregate clause, supported in SQLite since 3.30: COUNT(*) FILTER (WHERE method = 'card') reads 16 against wire's 11 with no CASE plumbing, and each aggregate carries its own predicate — one pass, four folds, no ELSE-policy debate.",
      notes: [
        { choice: 1, why: "WHERE is a clause position, not an aggregate argument — this is a syntax error. The conditional fold needs FILTER or CASE inside the aggregate; there is no third spelling." },
        { choice: 2, why: "COUNTIF belongs to other dialects and to spreadsheets. Ported spellings are how a pack dies in review — the dialect here is SQLite, and its clause is FILTER." },
      ],
      difficulty: "medium",
    },
    {
      id: "ing-mcq-28",
      prompt: "Fraud velocity: flag a household whose THIRD card leg lands within 7 days of the first. Legs are ordered by JULIANDAY(paid_on). Which frame counts a trailing 7 DAYS?",
      choices: [
        "COUNT(*) OVER (PARTITION BY household_id ORDER BY JULIANDAY(paid_on) RANGE BETWEEN 6 PRECEDING AND CURRENT ROW)",
        "COUNT(*) OVER (PARTITION BY household_id ORDER BY JULIANDAY(paid_on) ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)",
        "COUNT(*) OVER (PARTITION BY household_id ORDER BY paid_on RANGE BETWEEN 6 PRECEDING AND CURRENT ROW)",
        "COUNT(*) OVER (PARTITION BY household_id) compared against LAG(paid_on)",
      ],
      answer: 0,
      why: "RANGE offsets are value offsets: ordering by the julian day count makes '6 PRECEDING' mean six days, and RANGE includes same-day peers — legs on the boundary day count. The frame is a rolling 7-day window per household, which is exactly the velocity definition.",
      notes: [
        { choice: 1, why: "ROWS 6 PRECEDING counts six ROWS, not six days — a household with monthly legs gets a frame spanning half a year, and a burst day counts as one step. The unit is the whole bug." },
        { choice: 2, why: "paid_on is ISO text; RANGE with an offset is defined over numeric ORDER BY expressions and is rejected at prepare time on text. Convert to julian days first, then the offset has units." },
      ],
      difficulty: "hard",
    },
    {
      id: "ing-mcq-29",
      prompt: "The pack stacks two arms — 'paid billings' and 'the no-leg watch' — and one billing (the 1756.00 one) is in BOTH: paid status, zero legs. With UNION, what prints?",
      choices: [
        "Both rows — UNION preserves each arm's membership",
        "One row — UNION deduplicates the identical (id, status, amount) row the two arms share",
        "An error — a billing cannot be in two arms",
        "Only the overlap — UNION prints rows present in both arms",
      ],
      answer: 1,
      why: "UNION applies a whole-row DISTINCT across the stack: the anomaly's row is byte-identical in both arms, so the stack prints it once and the pack's double-membership story — paid AND never drawn — quietly loses its second appearance. UNION ALL keeps both; the dedupe operator is a definition, and here the definition deletes the anomaly.",
      notes: [
        { choice: 0, why: "That is UNION ALL's contract. Plain UNION dedupes across arms, not just within them — the collapse is silent because both rows are still 'there', just folded into one." },
        { choice: 3, why: "That is INTERSECT's contract. Choosing the wrong operator does not just change a count — it changes which population survives, and all three read as plausible on a slide." },
      ],
      difficulty: "hard",
    },
    {
      id: "ing-mcq-30",
      prompt: "The no-leg watch gains a rail slice — only card legs should count. Someone adds AND p.method = 'card' to the WHERE of the LEFT JOIN ... WHERE p.id IS NULL watch. What happens?",
      choices: [
        "The watch narrows to card-only no-leg billings",
        "The watch empties — a predicate on the right table in WHERE turns the LEFT JOIN into an inner join, and IS NULL rows cannot survive it",
        "The watch keeps all six — WHERE runs before the join",
        "The watch errors — method is NULL on unmatched rows",
      ],
      answer: 1,
      why: "The watch's rows have p.* entirely NULL; WHERE p.method = 'card' is unknown on every one of them, so the filter deletes exactly the population the watch exists to hold — the six no-leg billings vanish. A right-side predicate belongs in the ON clause — ON p.invoice_id = i.id AND p.method = 'card' — where it shapes the match without killing the unmatched.",
      notes: [
        { choice: 0, why: "That is the intent, and it is exactly what does not happen. The narrowing the author wanted is the ON-clause form; in WHERE the predicate filters the joined result, by which point the no-leg rows are NULL-everything." },
        { choice: 2, why: "WHERE runs after the join, not before — the pipeline is FROM, JOIN ... ON, WHERE, GROUP BY. The ordering is precisely what makes the trap possible." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-ing-1",
      tier: "medium",
      topic: "s6",
      universe: "fraud",
      title: "The screening-band census",
      brief:
        "ING-flavored memo on the storefront db (payments = settlement legs, method card/wire = debit and SEPA-style rails): compliance wants the screening census — settlement legs bucketed by amount band, per rail — so the mid-band mass and the over-line legs are counted in one pass. Probed facts: the rails cleared 27 legs — card 16 / 37364.00, wire 11 / 32248.00; under the 1000.00 line sits exactly one leg in the whole book — the **925.00** hit against the void billing — the 1000.00–3000.00 mid band holds **13 card legs and 7 wire legs**, and over 3000.00 ride 2 card and 4 wire legs. *Band edges are definitions: they ship in the footnote.*",
      ask: "Return the census: rail, band, legs, band dollars (2dp) — card first, biggest band first within each rail.",
      template:
        "SELECT p.{1} AS rail,\n       CASE WHEN p.amount_cents < 100000 THEN 'small'\n            WHEN p.amount_cents < {2} THEN 'mid'\n            ELSE 'large' END AS band,\n       COUNT(*) AS legs,\n       ROUND(SUM(p.amount_cents) / {3}, 2) AS band_dollars\nFROM payments p\nGROUP BY rail, band\nORDER BY rail, band_dollars {4};",
      slots: [
        {
          answer: "method",
          kind: "keyword",
          label: "the rail key",
          why: "p.method is the rail — card and wire, the two populations compliance reads side by side. invoice_id would shred the census into one row per billing and every band would collapse to a singleton.",
        },
        {
          answer: "300000",
          kind: "number",
          label: "the upper threshold (cents)",
          noVerify: true,
          why: "3000.00 in integer cents is 300000 — the ladder's second rung, written in the money's native unit. The ladder reads top-down — under 1000.00, then under 3000.00, else large — so one threshold per rung and arm order is the definition. A 250000 edge re-bands five card legs and the census argues with the deck.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divisor",
          noVerify: true,
          why: "Money is integer cents; the dollar read is amount_cents / 100.0, rounded once. The wrong divisor slides the decimal — 37364.00 becomes 37.36 and the cross-foot against the cash book dies on contact.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the band order",
          why: "DESC headlines each rail's heaviest band — the census reads exposure-first. ASC opens on the thin bands and the compliance story starts at its footnote.",
        },
      ],
      distractors: ["invoice_id", "250000", "1000", "ASC"],
      walkthrough:
        "A screening census is a CASE label ladder over the settlement feed, folded per rail and band in one pass. The ladder reads top-down — under 1000.00 is 'small', then under 3000.00 is 'mid', else 'large' — and arm order is the definition: swap the first two rungs and every leg re-bands. GROUP BY rail, band gives each rail's bands their rows, COUNT(*) is the leg census, and SUM(amount_cents)/100.0 — rounded once — prices each band. The read: card mid is the mass — **13 legs / 29348.00** of the rail's 37364.00 — while card large holds just 2 legs (4015.00 and 3076.00) for 7091.00, and the small band's single leg is the **925.00** drawn against the void billing; wire splits 7 mid / 17420.00 against 4 large / 14828.00, and its small band prints NO row at all — zero legs is absence, not a zero row, which is why the census is read beside the leg totals (16 and 11), not instead of them. The distractors fail honestly: invoice_id as the rail key shreds the census to singletons, a 250000 edge re-bands five card legs into 'small', the wrong divisor turns band dollars into thousandths, and ASC buries each rail's heavy band under its thin one. The habit being graded: a band ladder is its arm order — write the rungs top-down, in the money's native cents.",
    },
    {
      id: "cs-ing-2",
      tier: "easy",
      topic: "j5",
      universe: "month-close",
      title: "The no-leg watch",
      brief:
        "ING-flavored memo on the storefront db (invoices = cycle billings, payments = settlement legs, customers = households, regions = books): the collections scenario opens on the no-leg watch — billings with no settlement row at all, per book — because in scenario reporting the population is defined by evidence, not by the status word. Probed facts: the watch holds **6 billings / 15217.00** — EU 4 / 8524.00, US 1 / 4937.00, APAC 1 / 1756.00 — while the open-status census also reads six but carries 19609.00: the difference is the 4000.00-partial billing (open, but it HAS a rail hit) and the paid-status 1756.00 (paid, but it has none). *The IS NULL arm is the definition.*",
      ask: "Return the watch: book, uncollected billings, uncollected dollars (2dp) — biggest book first.",
      template:
        "SELECT c.{1} AS book,\n       COUNT(*) AS uncollected,\n       ROUND(SUM(i.{2}) / 100.0, 2) AS uncollected_dollars\nFROM invoices i\nJOIN customers c ON c.id = i.customer_id\nLEFT JOIN payments p ON p.invoice_id = i.{3}\nWHERE p.id IS {4}\nGROUP BY book\nORDER BY uncollected_dollars {5};",
      slots: [
        {
          answer: "region",
          kind: "keyword",
          label: "the book key",
          why: "c.region is the book — the scenario's grouping axis. The city column groups the watch at street grain and the book-level scenario reads four EU rows where it needs one.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the uncollected-money column",
          why: "Uncollected dollars are the billings' own amounts — integer cents folded once at the edge. The legs' amount column is NULL for every watch member by construction, and the fold would print NULL where dollars belong.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the anti-join key",
          why: "Each leg points at its billing's primary key — p.invoice_id = i.id. customer_id pairs billings with whichever billing-id equals their customer id: a wrong-match set that runs clean and watch-lists the wrong book.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the IS NULL arm",
          why: "The watch is defined by absence — no settlement row matched, so the leg side is NULL. NOT NULL flips the query into the settled book and the scenario watches the wrong six entirely.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the exposure order",
          why: "DESC headlines the EU book's 8524.00 — the review works top-down. ASC opens on the single-billing books and the scenario starts its story at the footnote.",
        },
      ],
      distractors: ["city", "0", "customer_id", "NOT NULL", "ASC"],
      walkthrough:
        "The no-leg watch is a textbook anti-join wearing a scenario hat. The LEFT JOIN keeps every billing — 28 rows even where no leg matched — and the WHERE p.id IS NULL arm keeps only the rows where the rail side stayed empty: no settlement row at all. GROUP BY book folds them to three rows; SUM(amount_cents)/100.0, rounded once, prices the watch: EU **4 / 8524.00**, US 1 / 4937.00, APAC 1 / 1756.00 — 6 / 15217.00, tying the receivables anti-join line for line. The teaching moment is the membership: the open-status census also counts six, but its 19609.00 includes the 4000.00-partial billing that HAS a leg and excludes nothing — while the watch carries the paid-status **1756.00** that has no rail hit at all. Evidence over status, every close. The distractors fail honestly: city re-groups the watch at street grain, the IS 0 arm matches nothing and returns a clean empty watch — a report with no rows where six belong — the customer_id key pairs billings with wrong matches and watch-lists a different set, NOT NULL flips the query to the settled book, and ASC buries the exposure under the singletons. The habit being graded: the IS NULL arm is the definition — say it, don't just type it.",
    },
    {
      id: "cs-ing-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The exposure ladder",
      brief:
        "ING-flavored memo on the storefront db (customers = account households, orders = booked transaction batches in real dollars): the growth deck's exposure slide needs the ladder — households ranked by booked transaction value, top five only, region book attached. Probed facts: the book carries **103 batches / 34833.28**; Alice Chen leads at **24 batches / 7262.35** (EU), Emma Wilson 17 / 6640.56 (US), Grace Kim 14 / 4574.23 and Maya Patel 13 / 3644.56 (both APAC), and Chloe Dubois 5 / 2667.93 closes the five — households over 3000.00 lifetime hold **63.5%** of all booked value. *The rung order is the definition: heaviest book takes rank 1.*",
      ask: "Return the ladder: household, book, batches, booked dollars (2dp), exposure rank — rank 1 first, top five rows only.",
      template:
        "SELECT c.{1} AS household,\n       c.region AS book,\n       COUNT(o.id) AS txns,\n       ROUND(SUM(o.total), 2) AS booked_dollars,\n       {2}() OVER (ORDER BY SUM(o.total) {3}) AS exposure_rank\nFROM orders o\nJOIN customers c ON o.{4} = c.id\nGROUP BY household\nORDER BY exposure_rank, booked_dollars DESC\nLIMIT {5}",
      slots: [
        {
          answer: "name",
          kind: "keyword",
          label: "the household key",
          why: "c.name is the household key the deck ranks by — one row per account household. city would key the ladder by street: the same sixteen buckets in this book, but the deck reads addresses and the exposure story loses its subject.",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the rank function",
          why: "RANK is the exposure ladder — the heaviest book takes 1 and genuine ties would share a rung. SUM or MIN in this slot leave the function with no argument and the build errors; DENSE_RANK would only read the same here because no two households tie.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the rank order",
          why: "DESC points the window at the heaviest book first — rank 1 is the household carrying the most booked value. ASC crowns the thinnest household and the deck's headline becomes Chloe's 2667.93.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the join key",
          why: "o.customer_id = c.id is ownership — each batch points at the household that booked it. o.id = c.id joins on row keys: a wrong-match book that still runs and ranks a fabricated exposure ladder.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the top-five cut",
          why: "The deck's top-five cut — Alice Chen through Chloe Dubois, the rung where booked value falls from 2667.93 to Pedro Alvarez's 1686.17 on four batches. The cut is a definition: it ships in the slide's footnote, not in the query's discretion.",
        },
      ],
      distractors: ["city", "SUM", "MIN", "id", "3"],
      walkthrough:
        "The exposure ladder is a fold plus a rank: join batches to households on ownership, GROUP BY the household alias, price each book with ROUND(SUM(o.total), 2), then let RANK() OVER (ORDER BY SUM(o.total) DESC) number the rungs — 1 through 16, no ties because no two households share a lifetime total. The top five read **Alice Chen 24 / 7262.35**, Emma Wilson 17 / 6640.56, Grace Kim 14 / 4574.23, Maya Patel 13 / 3644.56, **Chloe Dubois 5 / 2667.93** — and the five-cut is where the deck stops, because rung six is Pedro Alvarez at 1686.17 on four batches. The distractors fail honestly: city keys the ladder by street instead of household; SUM and MIN in the rank slot are zero-argument aggregates and the build errors; id joins batches to households by row key — the query runs and ranks a fabricated book; the 3 cut keeps Alice, Emma and Grace and drops Maya and Chloe, so the 63.5% concentration story loses its tail. The habit being graded: rank the fold, don't re-fold it — and say the cut out loud.",
    },
    {
      id: "cs-ing-4",
      tier: "easy",
      topic: "x2",
      universe: "month-close",
      title: "The one-pass close census",
      brief:
        "ING-flavored memo on the storefront db (ledger_entries = the double-entry book of record — 80 postings across four accounts, money in integer cents, the dollar read always / 100.0): the close opens with a one-pass census — per account, entries, debit dollars, credit dollars, and how many postings actually hit the credit side. Probed facts: cash runs **27 entries / 69612.00 debit / 25416.00 credit** (net 44196.00), accounts_receivable 26 / 86052.00 / 69612.00, operating_expenses 14 / 25416.00 / 0.00, sales_revenue 13 / 0.00 / 86052.00 — and the trial balance proves **181080.00 against 181080.00, delta 0**. *One scan, four rows, zero deltas: that is the whole close.*",
      ask: "Return the census: account, entries, debit dollars (2dp), credit dollars (2dp), credit-side postings — busiest account first.",
      template:
        "SELECT {1} AS account,\n       COUNT(*) AS entries,\n       ROUND(SUM({2}) / 100.0, 2) AS debit_dollars,\n       ROUND(SUM({3}) / 100.0, 2) AS credit_dollars,\n       COUNT(*) FILTER (WHERE credit_cents > 0) AS credit_legs\nFROM ledger_entries\nGROUP BY account\nORDER BY {4} DESC, account",
      slots: [
        {
          answer: "account",
          kind: "keyword",
          label: "the book axis",
          why: "account is the book's only grouping axis — four accounts, four rows, the grain the trial balance is proved at. Any other column here re-keys the census at posting grain and the close loses its fold.",
        },
        {
          answer: "debit_cents",
          kind: "keyword",
          label: "the debit column",
          why: "The debit side folds from debit_cents, the book's own column — / 100.0 turns integer cents into the 69612.00-style dollars the trial balance quotes. amount_cents does not exist on this table: the rebuild errors on contact.",
        },
        {
          answer: "credit_cents",
          kind: "keyword",
          label: "the credit column",
          why: "The credit side folds from credit_cents — sales_revenue's 86052.00 lives there and nowhere else. Swapping the sides prints cash's 25416.00 of credits as its debits and the census argues with the book.",
        },
        {
          answer: "entries",
          kind: "keyword",
          label: "the volume order",
          why: "entries — the per-account posting count — heads the census because volume is the close's first read: cash 27, AR 26, operating_expenses 14, sales_revenue 13. Ordering by a dollar column hides the thin account the reviewer wants to see first.",
        },
      ],
      distractors: ["amount_cents", "id", "entry_date", "ASC"],
      walkthrough:
        "The close census is one scan of the 80-posting book: GROUP BY account folds it to four rows, COUNT(*) sizes each account, and FILTER (WHERE credit_cents > 0) counts the postings that actually moved the credit side — cash 14, AR 13, sales_revenue 13, operating_expenses 0, which is how the reviewer sees that opex only ever eats. The dollars: cash **69612.00 / 25416.00**, AR **86052.00 / 69612.00**, operating_expenses **25416.00 / 0.00**, sales_revenue **0.00 / 86052.00** — cross-foot to 181080.00 on both sides, delta 0, the trial balance holds. The distractors fail honestly: amount_cents is not a column on the book and the rebuild errors; id folds posting keys, so debit dollars become a sum of row numbers that matches nothing; entry_date makes SUM cast text to 0.00 and every account prints zeros; ASC flips the census so 13-posting sales_revenue heads it instead of 27-posting cash. The habit being graded: one pass, both sides, and a fold the trial balance can prove.",
    },
    {
      id: "cs-ing-5",
      tier: "hard",
      topic: "q6",
      universe: "expense",
      title: "The over-average ops watch",
      brief:
        "ING-flavored memo on the storefront db (expenses = ops cost lines, amount_cents in integer cents): the quarterly ops review opens on the over-average watch — months whose cost lines run above the whole-book monthly average, staged through a CTE so the fold and the bar come from the same scan. Probed facts: **36 lines / 25416.00** across 14 months (the ledger's operating_expenses account carries the same 25416.00 net); Rent anchors at 14 lines / 16800.00 and Ads at 14 / 4570.00; **2024-08 spiked to 3210.00**, and five months clear the bar — 2024-11 at 1974.00, 2025-01 at 1959.00, 2024-03 at 1917.00, 2024-10 at 1859.00. *The bar is the book's own average — no external budget lands in this query.*",
      ask: "Return the watch: month, ops dollars (2dp) — heaviest month first, only months over the book's own monthly average.",
      template:
        "WITH monthly AS (\n  SELECT {1}({2}, 1, 7) AS month,\n         ROUND(SUM(amount_cents) / {3}, 2) AS ops_dollars\n  FROM expenses\n  GROUP BY month\n)\nSELECT month, ops_dollars\nFROM {4}\nWHERE ops_dollars > (SELECT AVG(ops_dollars) FROM monthly)\nORDER BY ops_dollars {5}",
      slots: [
        {
          answer: "SUBSTR",
          kind: "keyword",
          label: "the month slicer",
          why: "SUBSTR(spent_on, 1, 7) slices 'YYYY-MM' out of the booking stamp — the month bucket every ING cycle report is cut on. UPPER or INSTR in this slot are the wrong signature and the build errors.",
        },
        {
          answer: "spent_on",
          kind: "keyword",
          label: "the booking stamp",
          why: "spent_on is the date the cost line hit the book — the stamp the month bucket slices. amount_cents or category here buckets dollars or cost types and the watch stops being a calendar.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divisor",
          why: "Money is integer cents; the dollar read is SUM(amount_cents) / 100.0, rounded once at the edge. The wrong divisor slides the decimal — 3210.00 becomes 3.21 — and the watch compares tenths of months.",
        },
        {
          answer: "monthly",
          kind: "keyword",
          label: "the staged fold",
          why: "The outer scan reads the CTE, not the raw table — monthly already carries the fold and is what the average subquery re-reads. FROM expenses here hits 36 raw lines with no ops_dollars to compare and the build errors.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the exposure order",
          why: "The watch reads exposure-first: 3210.00 on top, the thin months at the foot. ASC opens the review at 1859.00 and the spike lands in the footnote.",
        },
      ],
      distractors: ["UPPER", "INSTR", "category", "1000.0", "expenses", "ASC"],
      walkthrough:
        "Stage the fold, then screen it. The CTE slices spent_on to 'YYYY-MM', folds each month's cents with ROUND(SUM(amount_cents) / 100.0, 2), and lands 14 rows totalling 25416.00; the outer scan keeps only rows above the average its own subquery re-derives from the same CTE — five months survive: **2024-08 3210.00**, 2024-11 1974.00, 2025-01 1959.00, 2024-03 1917.00, 2024-10 1859.00, heaviest first. The bar is the book's own — 25416.00 spread across the 14 months the expense table spans — so the watch moves when the book moves, and no budget line is consulted. The distractors fail honestly: UPPER and INSTR are the wrong function signatures and the build errors; category buckets the lines by cost type and the watch stops being a calendar; 1000.0 divides every month down to a tenth of its dollars; expenses in the outer FROM hits raw lines with no ops_dollars column and errors; ASC opens the review at its thinnest month. The habit being graded: stage the fold once, screen it against itself, and never let the bar come from outside the scan.",
    },
    {
      id: "cs-ing-6",
      tier: "hard",
      topic: "t7",
      universe: "fraud",
      title: "The rail-sequence screen",
      brief:
        "ING-flavored memo on the storefront db (payments = settlement legs, method card/wire = the debit rail and the SEPA-style interbank rail, amount_cents in integer cents): monitoring wants the rail-sequence screen — every leg annotated with its rail's leg count and the previous leg on the same rail in booked order, so bursts and lone spikes read in context. Probed facts: the feed carries **27 legs — card 16 / 37364.00, wire 11 / 32248.00**; the card rail opens at 2430.00 (2024-02-20), spikes at **4015.00**, and carries the lone **925.00** hit against the void billing (2024-08-20); wire's heaviest leg is the **4000.00** partial. *Sequence is the signal: a leg is only suspicious next to its neighbors.*",
      ask: "Return the screen: rail, leg dollars (2dp), rail leg count, previous leg on the rail — card legs first, booked order within each rail.",
      template:
        "WITH legs AS (\n  SELECT method AS rail,\n         {1} AS booked_on,\n         ROUND(amount_cents / {2}, 2) AS leg_dollars\n  FROM payments\n)\nSELECT rail,\n       leg_dollars,\n       COUNT(*) OVER (PARTITION BY rail) AS rail_legs,\n       LAG(leg_dollars) OVER (PARTITION BY {3} ORDER BY {4}) AS prev_leg\nFROM legs\nORDER BY rail, booked_on",
      slots: [
        {
          answer: "paid_on",
          kind: "keyword",
          label: "the settlement stamp",
          why: "paid_on is the settlement stamp the sequence runs on — booked_on is just its staged alias. paid_at does not exist on this feed and the build errors; sequencing on anything else scrambles the neighbors the screen exists to show.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divisor",
          why: "Integer cents in, dollars out: amount_cents / 100.0, rounded once. The wrong divisor prints 243.00 where the feed says 2430.00 and the screen argues with the book of record.",
        },
        {
          answer: "rail",
          kind: "keyword",
          label: "the sequence partition",
          why: "PARTITION BY rail keeps each sequence inside its own rail — card legs compare to card legs. leg_dollars here partitions by amount: every distinct value becomes its own sequence and prev_leg goes NULL almost everywhere.",
        },
        {
          answer: "booked_on",
          kind: "keyword",
          label: "the window order",
          why: "The window orders by the staged booking stamp — booked_on, the alias the CTE hands it. rail_legs is a window alias, not a staged column, and errors; sequencing by a name the CTE never staged is how screens silently lie.",
        },
      ],
      distractors: ["paid_at", "1000.0", "leg_dollars", "rail_legs", "method"],
      walkthrough:
        "Stage the feed once, then read it twice. The CTE renames the rails, stamps each leg with paid_on, and prices it — / 100.0, rounded once; the outer scan keeps every leg (27 rows) and hangs two windows off it: COUNT(*) OVER (PARTITION BY rail) prints the rail census beside every leg — **16 on card, 11 on wire** — and LAG(leg_dollars) over rail + booked_on pairs each leg with its predecessor on the same rail. The card sequence opens 2430.00 → 2143.00 → 1589.00, spikes to **4015.00**, and the **925.00** hit against the void billing sits mid-sequence where a lone small leg belongs; wire's heaviest leg is the **4000.00** partial. The distractors fail honestly: paid_at is not a column on this feed and the build errors; 1000.0 prints tenths of every leg; leg_dollars in the partition slot shatters the sequence into per-amount islands with prev_leg NULL; rail_legs and method are names the CTE never staged, so the window build errors. The habit being graded: stage the aliases once, then make every window speak the same staged language.",
    },
  ],

  problems: [
    { slug: "expected-credit-loss", why: "Weighted provision folds over exposure bands: the ECL read behind the collections scenario — probability-weighted dollars over the 15217.00 watch." },
    { slug: "ar-aging-schedule", why: "AR aging by bucket: the no-leg watch aged against flat 30-day terms — the scenario pack's collections ladder." },
    { slug: "loan-amortization-schedule", why: "Recursive schedule math: installment-style cycle billing walked forward — the recurring-fee engine at household grain." },
    { slug: "delinquency-roll-rates", why: "State-to-state roll rates: how billings move open-to-partial-to-settled between closes — the movement read behind the coverage story." },
    { slug: "daily-balance-interest", why: "Interest over a date spine: day-weighted balance math on the cash book — where the 69612.00 fold earns its keep." },
    { slug: "gl-reconciliation", why: "Ledger-versus-feed reconciliation with deltas: the book of record (181080.00 / delta 0) proved against the rail feed, line for line." },
    { slug: "trial-balance-check", why: "Debits-equal-credits proof: the 181080.00-against-181080.00 fold — the morning census's first query, drilled on any schema." },
    { slug: "balance-rollforward", why: "Opening-plus-movements-equals-closing: the balance walk the scenario packs open with, one period at a time." },
    { slug: "journal-gap-detection", why: "Sequence gaps in a journal: the 80-entry ledger audited for missing post dates — the hygiene check that catches dropped feed days." },
    { slug: "settlement-fails-aging", why: "T+2 aging over unsettled items: the watch bucketed by days outstanding — the collections desk's daily ladder." },
    { slug: "amount-anomaly-zscore", why: "Z-score screens over a baseline: legs flagged against the book's own sigma — the screening census's statistical sibling." },
    { slug: "top-percentile-fraud", why: "Percentile-ranked suspicion: the over-band legs (2 card / 4 wire) ranked for review — PERCENT_RANK drilled on a feed." },
    { slug: "circular-transfers", why: "Mutual-pair screens with epoch windows: round-tripped value across the rails — the payments desk's pair screen." },
    { slug: "fx-exposure-report", why: "Latest-rate joins normalizing currencies: the multi-book read where every scenario must land in one reporting currency." },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER dedupe with a tiebreak: duplicate cycle notices collapsed to the latest — the feed hygiene behind every census." },
    { slug: "movie-rating", why: "Two boards stacked with UNION: 'most recent' and 'most active' side by side — the pack's paired-leaderboard shape, set ops drilled." },
    { slug: "transaction-velocity", why: "Velocity bursts over the settlement feed: legs per rolling window, the ones that bunch flagged — the fraud-monitoring read that turns the 27-leg book into a signal." },
    { slug: "duplicate-charge-pairs", why: "Same-amount leg pairs inside a tight window: duplicated settlements on the card rail — the pair screen the band census feeds its suspects to." },
    { slug: "dormant-reactivation", why: "Households going quiet and what it costs to win them back: the dormancy watch every retail book runs between closes." },
    { slug: "bank-account-summary-ii", why: "Per-account credits, debits and a risk flag in one fold — the balance-correctness drill behind the cash book's 44196.00 net." },
    { slug: "confirmation-rate", why: "Confirmed share per sender with COALESCE covering the unconfirmed — the KYC funnel's core ratio, where the denominator is everyone." },
    { slug: "funnel-step-conversion", why: "Opened, verified, funded: FIRST_VALUE funnel steps over onboarding events — the KYC drop-off read compliance owns end to end." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Onboarded but never transacted: the anti-join that lists households with a file and zero rail legs — the dormancy watch's front door." },
    { slug: "monthly-transactions-i", why: "Monthly leg census with CASE banding per rail: the cycle-close read over the feed — 16 card / 11 wire, counted the same way every close." },
    { slug: "monthly-transactions-ii", why: "Month rows stacked against the whole-book row with UNION ALL: the rail-mix pack's grain switch, detail and total in one result." },
    { slug: "count-salary-categories", why: "Band counts with UNION ALL keeping the empty buckets honest — the screening census that must print a zero where no wire leg cleared, not a missing row." },
    { slug: "active-users", why: "Consecutive-day streaks from raw activity: the read that defines who the bank still counts as an active household." },
    { slug: "second-most-recent-activity", why: "Second-most-recent contact per household, ranked with ties handled: the dormancy watch's ladder, where 'almost quiet' is a list." },
    { slug: "biggest-window-between-events", why: "LEAD-sized silences between rail touches: the biggest gap per household — the dormancy clock made literal." },
    { slug: "null-blank-audit", why: "Conditional folds over NULL and blank fields: the data-quality sweep the book of record takes before every close, zeros kept visible." },
    { slug: "rolling-7d-actives", why: "Rolling distinct counts on a date spine: the engagement-velocity hybrid the monitoring desk reads weekly, self-join and all." },
    { slug: "countries-you-can-safely-invest-in", why: "Country risk from insurance ratios with duplicate policies deduped: the AML-style geography screen a retail book runs before it grows." },
  ],
};
