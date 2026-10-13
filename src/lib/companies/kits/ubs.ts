// UBS — kit 12 of the Banking & Capital Markets domain (Batch L, wave 7).
// Global wealth & investment banking, post-CS integration: two legal entities'
// books merging into one, which turns every close into a cross-entity
// reconciliation — coverage censuses, whale-concentration reviews and
// integration-era data audits where a status column is a claim and a rail hit
// is evidence. The storefront db maps on honestly: invoices are client fee
// billings (advisory mandates, billing cycles, fee memos — the receivables the
// wealth books carry), payments are settlement legs (method card / wire — the
// house debit rail and the interbank wire rail), ledger_entries is the
// double-entry book of record, expenses are opex lines, customers are client
// households across four booking centers (EU / US / APAC / LATAM standing in
// for Zurich, New York, Singapore, São Paulo), orders are booked fee events
// (REAL dollars — the one table where money is already dollars). Money in
// invoices/payments/expenses/ledger is INTEGER cents — the dollar read is
// always amount_cents / 100.0.
// Pool provenance: UBS has 0 tagged sql rows in the band (checked
// company-pools.md for ubs / UBS variants) — 0 tagged LC — theme-curated:
// every topic and problem slug is curated from the theme menu to UBS's known
// question families (cross-entity folds, coverage censuses, whale boards,
// rails, books of record, wealth KPIs), provenance stated per problem.
// Case figures: scripts/company-facts.md (probed 2026-10-12), case cells
// re-probed against db/custom.db (read-only) before authoring.

import type { CompanyKit } from "../types";

export const ubsKit: CompanyKit = {
  id: "ubs",
  domainId: "banking",
  name: "UBS",
  tagline: "Global wealth & investment banking, post-CS integration",
  accent: "text-red-200",

  brief: [
    "**UBS** is the world's largest wealth manager, and since absorbing Credit Suisse it runs as one bank with two integration-era truths: the client books merged, the data pipelines did not finish merging. An analyst here reconciles across legal entities for a living. On this training db the mapping is honest: `orders` are booked fee events (REAL dollars — the one table where money is already dollars), customers are client households assigned to four booking centers, and every fee a mandate generates — advisory cycle, product fee, billing memo — lands as a receivable. Probed scale: **103 booked fee events worth 34833.28**, the busiest household holding **24 events for 7262.35**, with the books reading EU 45 events / 15089.23, APAC 37 / 11605.45, US 19 / 7286.16, LATAM 2 / 852.44.",
    "The money tables are where UBS screens live, and they are integer cents — the dollar read is always `amount_cents / 100.0`. `invoices` carry the fee billings: 21 paid for 66443.00, 6 open at 19609.00, 1 void at 925.00. `payments` are the settlement legs that clear them on two rails — {emerald:card}, the house debit rail (16 legs for 37364.00), and {sky:wire}, the interbank rail (11 legs for 32248.00) — and five billings were settled on split plans, two legs each. `ledger_entries` is the book of record: **181080.00 debits against 181080.00 credits across 80 entries, delta 0**. *A number that can't be split by booking center and tie back to the books doesn't leave the desk.*",
    "The SQL screens are integration-audit screens. A warm-up per-center fold, then the two questions the integration program is famous for: the {emerald:coverage census} — 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 none (15217.00) — where membership is settlement evidence, not the status column, and the {rose:anomaly pair} — a void billing that still drew its **925.00** rail hit, and a paid-status billing at **1756.00** with no rail hit at all. Follow-ups probe the denominator ('open-status or no-leg — which six?') and the fan-out ('billing count or leg count — one billing can take two rail hits').",
    "Prep the way the screens run. Drill conditional folds and `FILTER (WHERE …)` censuses, strftime month buckets across the 2024-01 to 2025-02 window, the opex reads (Rent at 14 lines / **16800.00**, monthly opex peaking **3210.00** in 2024-08), and the settlement clock — billings average **28.4 days** to first settlement, fastest 13, slowest 84, against flat 30-day terms. Then practice the sentence that gets hired at a house that just merged two banks: *same mandate, different booking center — the definition travels, the entity split stays honest, and every census names its evidence.*",
  ],

  dayInLife: [
    "**07:45 —** the books proof before Zurich wakes up. First query proves the ledger — **181080.00 against 181080.00, delta 0** across 80 entries — then the rail census: card **16 legs / 37364.00**, wire **11 / 32248.00**, cross-footed to the cash book's 69612.00 debit fold. The break list pairs state with evidence: one void billing that still drew **925.00**, one paid-status billing with no rail hit at **1756.00**. The integration PMO reads the break list at 08:00 sharp; the books tie before it lands.",
    "**11:30 —** deep work: the coverage census, re-cut per booking center. Billings LEFT JOINed to their settlement legs, receipts folded per billing, then CASE arms classify — exact, partial, none — and the split-plan billings get named, not averaged: one took a **4000.00** leg against a 6148.00 balance and is still open. The instinct being trained: the census counts *billings* (`COUNT(DISTINCT i.id)`), never leg rows — *the plan is the billing's story; the leg is just today's entry.*",
    "**16:30 —** the risk-committee pack and the EOD writeup. The whale board ships: each center's biggest fee billings ranked within itself, EU's rung 1 being the **6148.00** open partial — the book's largest single billing is also its least settled. Every slide carries its definition — what counts as settled (a rail hit, not the word paid), which month key buckets the cohorts — and tomorrow's ask is queued for the data-quality board: the paid-unmoved **1756.00**, waiting on the source system's own explanation. *The committee doesn't argue with evidence; it argues with definitions — so the definitions go in writing.*",
  ],

  metrics: [
    { name: "Booked fee events by center", what: "Fee events with value per booking center — EU 45 / 15089.23, APAC 37 / 11605.45, US 19 / 7286.16, LATAM 2 / 852.44. The footprint view every integration read starts from." },
    { name: "Billing-state mix", what: "Fee billings by state — 21 paid / 66443.00, 6 open / 19609.00, 1 void / 925.00. The group total is believed only after the center split reproduces it." },
    { name: "Coverage census", what: "Billings by settlement coverage — 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 none (15217.00). Membership is evidence (folded rail hits vs billed), never the status column." },
    { name: "Rail mix", what: "Settlement legs per rail — card 16 / 37364.00 (house debit), wire 11 / 32248.00 (interbank). The pair cross-foots to the cash book's 69612.00 debit fold." },
    { name: "Books proof delta", what: "Total debits minus total credits across the ledger — 181080.00 against 181080.00, delta 0 across 80 entries. A nonzero delta pages the close, not a footnote." },
    { name: "Anomaly pair watch", what: "The two breaks every integration review opens with: void-but-drawn (925.00) and paid-with-no-rail (1756.00). State paired with evidence, quantified in dollars, routed — never deleted." },
    { name: "Client concentration", what: "Share of fee revenue from the top books — 63.5% of value from households whose lifetime spend crosses 3000.00, 71.2% from those above 2000.00. The whale board the risk committee reads." },
    { name: "Settlement lag", what: "Days from billing to first settlement on settled billings — 20 billings, 28.4 days average, fastest 13, slowest 84, against flat 30-day terms. The collections tempo, per center." },
  ],

  topics: [
    {
      name: "Cross-entity book folds",
      why: "Post-CS, every number is read twice: as the group total and as the center split that must reproduce it. Billings, value and households GROUP BY booking center, with group-versus-center benchmarks and per-entity ratio reads doing the tie-back check.",
      slugs: ["countries-you-can-safely-invest-in", "find-expensive-cities", "average-salary-of-departments"],
    },
    {
      name: "Coverage & partial settlements",
      why: "A billing can be open AND received — the 4000.00 leg against the 6148.00 balance is the case study every integration review cites. Coverage folds receipts per billing and compares to billed; the classification is computed, never stored.",
      slugs: ["bank-account-summary", "monthly-transactions-ii", "immediate-food-delivery-ii"],
    },
    {
      name: "Whale boards & concentration",
      why: "A wealth house manages concentration risk on purpose: top billings per center, share-of-book windows and percentile cuts are how the risk committee reads exposure — each booking center ranked within itself, never one global ladder.",
      slugs: ["portfolio-concentration-hhi", "department-top-three-salaries", "value-at-risk"],
    },
    {
      name: "Rails & settlement legs",
      why: "Settlement is leg-level: five billings ride two rails each, so leg counts and billing counts disagree by exactly the split plans. Velocity bursts per rail, duplicate-pair screens and rate rankings are the rails desk's daily reads.",
      slugs: ["transaction-velocity", "duplicate-charge-pairs", "circular-transfers"],
    },
    {
      name: "Anomaly screens",
      why: "The integration doubled the surfaces where state and evidence disagree: void-but-drawn, paid-unmoved, amount outliers. Sliding-window checks, z-score screens and percentile-ranked suspicion pair the status column with what actually moved.",
      slugs: ["suspicious-bank-account-transactions", "amount-anomaly-zscore", "top-percentile-fraud"],
    },
    {
      name: "Books of record & reconciliation",
      why: "The ledger ties or nothing ships: trial-balance folds (181080.00 against 181080.00, delta 0), ledger-versus-rail reconciliation and balance rollforwards are the proof drills behind every close call.",
      slugs: ["trial-balance-check", "gl-reconciliation", "balance-rollforward"],
    },
    {
      name: "Wealth-book KPIs",
      why: "The books read like portfolios: weights and shares per mandate, concentration indices, performance ratios computed over window frames — the math the investment review runs, expressed as SQL over the same fold discipline.",
      slugs: ["portfolio-weights", "sharpe-ratio", "time-weighted-return"],
    },
    {
      name: "Credit & counterparty watch",
      why: "Fee receivables age like credit exposures: days-past-terms buckets, utilization-style bands and weighted-loss folds are the language the collections desk borrows from credit risk — built on the same no-leg anti-join.",
      slugs: ["delinquency-buckets", "credit-utilization-bands", "expected-credit-loss"],
    },
    {
      name: "Household activity & cadence",
      why: "Advisors read households, not events: repeat-fee frequencies, loyal-household screens and short-window repeat detection decide who gets the call — and the 24-event household is exactly the record this drill finds.",
      slugs: ["customer-order-frequency", "find-loyal-customers", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Opex & cost lines",
      why: "Integration years are cost years: category folds over opex lines (Rent 14 lines / 16800.00), pacing against plan and month-bucketed spend (peaking 3210.00 in 2024-08) are the reads behind every synergy deck.",
      slugs: ["spend-histogram", "budget-pacing", "friday-purchase-iii"],
    },
  ],

  theory: [
    {
      id: "ubs-t1",
      q: "You join fee billings to their settlement legs and the per-center billing counts stop summing to the 28-billing book. What happened?",
      a: "Fan-out: five billings were settled on split plans — two legs each — so the join prints 33 rows and every COUNT(*) on that result counts rail hits, not billings. The fix is grain discipline: fold the legs per billing first (derived table or CTE), or protect the census with COUNT(DISTINCT i.id). At UBS this is the daily trap because the split plans are real client arrangements, not dirty data — the integration reporting rule is that the center split must reproduce the 28-billing book, and a fold at leg grain breaks that identity by exactly the five splits.",
      tag: "joins",
    },
    {
      id: "ubs-t2",
      q: "The risk committee wants each booking center's largest fee billings ranked within its own book. Build it.",
      a: "Windows with PARTITION BY: RANK() OVER (PARTITION BY center ORDER BY amount_cents DESC) gives every booking center its own rung 1, and ORDER BY center, rung on the outside makes the board read center by center. Without the partition you get one global ladder where one center owns the top ten and the other books' advisors read boards with no top of them. I keep the tie policy explicit — RANK shares rungs on ties, ROW_NUMBER doesn't — and pin a deterministic tiebreaker inside the window so the committee's rerun reproduces the board row for row.",
      tag: "windows",
    },
    {
      id: "ubs-t3",
      q: "Build the coverage census — exact, partial, no rail — so the integration review can argue with real numbers.",
      a: "Fold settlements per billing, then classify, then fold again per center: LEFT JOIN billings to legs, GROUP BY billing id, COALESCE the receipt sum to 0, and CASE arms — no leg is the none arm, SUM < billed is partial, equal is exact. The follow-ups are where candidates die: open status is not the no-leg book (19609.00 versus 15217.00 — the open 4000.00-partial has a leg and leaves the anti-join, while a paid-status 1756.00 has none and stays), and the legs join fans split billings, so the census counts DISTINCT billings. I quote the actuals — 21 exact / 65612.00, 1 partial, 6 none / 15217.00 — and insist the center split reproduce them before the pack ships.",
      tag: "aggregation",
    },
    {
      id: "ubs-t4",
      q: "A stakeholder says 'the uncollected book is the open book — both are six billings.' Where does that identity break?",
      a: "At membership, which the coincidental count hides. The open-status census carries 19609.00; the no-leg anti-join carries 15217.00 — the 4392.00 gap is two honest anomalies: an open billing with a 4000.00 partial settlement (evidence exists, so it leaves the watch) and a paid-status billing at 1756.00 with no rail hit (a claim without evidence, so it stays). The lesson: the anti-join's IS NULL on the right-side key defines 'never settled', and a status column is a claim about a state machine that integration just made twice as complicated. I name both lists per center before choosing which one the review works.",
      tag: "nulls",
    },
    {
      id: "ubs-t5",
      q: "Walk me through SQL's logical evaluation order and where it bites in a per-center fold.",
      a: "FROM and JOIN build rows, WHERE filters rows, GROUP BY folds them, HAVING filters groups, SELECT projects, ORDER BY and LIMIT run last. The bites: the 'centers with a live uncollected book' gate is HAVING, because the fold doesn't exist at WHERE time; a WHERE on center is a row predicate and belongs above the fold; SELECT aliases are usable in GROUP BY and ORDER BY in SQLite but not in WHERE. On the integration board I keep the center filter in WHERE, the small-book gate in HAVING, and I narrate the order out loud — interviewers here are checking whether pipeline order is a mental model, because cross-entity reporting is folds and gates landing in the right clause, every close.",
      tag: "pipeline",
    },
    {
      id: "ubs-t6",
      q: "One center's book looks expensive per billing versus the group average. Scalar subquery, window, or CTE for the benchmark?",
      a: "By how much definition the benchmark needs. A scalar subquery — WHERE billed > (SELECT AVG(amount_cents) FROM invoices) — is the smallest correct form for one group-wide line. AVG() OVER (PARTITION BY center) is the better shape when the review wants each billing beside its own center's mean, because the benchmark travels with the row. A CTE earns its keep when the benchmark gets a definition — 'group average over open-and-paid billings, void excluded' — because a named, commented fold is auditable across two merged legal entities and a nested one-liner isn't. Integration-era benchmarks always grow per-entity definitions here, so I stage the CTE earlier than fashion suggests.",
      tag: "subqueries",
    },
    {
      id: "ubs-t7",
      q: "The collections read needs billing-cohort months and days-past-terms. How do you handle dates in SQLite for both?",
      a: "Two tools. Cohort buckets with strftime('%Y-%m', issued_on) — a '2024-10' style key that GROUP BY folds cleanly across the 2024-01 to 2025-02 window and sorts correctly as text. Aging needs instant arithmetic: julianday(reference) - julianday(due_on) per billing, against flat 30-day terms — and the trap I name out loud: julianday over a missing or malformed date NULLs the row silently, so the watch's denominator drifts unless the NULL arm is handled on purpose. The settled billings' own clock runs 28.4 days average billing-to-settlement (fastest 13, slowest 84), which is why 'terms are flat 30' is a definition worth verifying — min and max terms both print 30 here.",
      tag: "dates",
    },
    {
      id: "ubs-t8",
      q: "A void billing still drew a 925.00 settlement, and a paid billing shows no rail hit at all. What's the break policy?",
      a: "Detect, quantify, route — per center, then as a group. Detect by pairing state with evidence: status = 'void' AND a settlement exists (the 925.00 break), status = 'paid' AND no settlement (the 1756.00 break) — a one-pass FILTER (WHERE …) census counts both arms on the same scan so every center's numbers come from one query. Quantify in dollars; route to the desk that owns the source system; never delete, never silently re-status. Then reconcile to the book of record — the ledger still proves 181080.00 against 181080.00, delta 0, because double-entry records what happened. The trial balance alone is never sufficient evidence of correctness — that sentence is the integration's control culture.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "ubs-mcq-1",
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
      id: "ubs-mcq-2",
      prompt: "The pack prints a billing as 614800.00. The billed amount is stored as amount_cents = 614800. What's the correct dollar read?",
      choices: [
        "amount_cents / 100.0, rounded once at the edge",
        "amount_cents / 100",
        "amount_cents, formatted with two decimals",
        "ROUND(amount_cents) / 1000",
      ],
      answer: 0,
      why: "Money is integer cents; divide by 100.0 (float) and round once — 614800 cents reads 6148.00. The /100 integer read truncates halves: a 222950-cent leg prints 2229 instead of 2229.50.",
      notes: [
        { choice: 1, why: "Integer division drops the remainder — every odd-cent leg silently loses its cents. On a book with split-plan legs like 222950, the truncation is visible and the pack is wrong." },
        { choice: 2, why: "Formatting doesn't divide — 614800 formatted is still six hundred fourteen thousand eight hundred dollars. The unit conversion has to happen in the math." },
      ],
      difficulty: "easy",
    },
    {
      id: "ubs-mcq-3",
      prompt: "The cohort card buckets fee billings by issue month ('2024-11', '2025-01', …). Which expression builds the key?",
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
        { choice: 3, why: "YEAR() isn't a SQLite function — the query errors. SQLite speaks strftime, not the T-SQL date-name shorthand." },
      ],
      difficulty: "easy",
    },
    {
      id: "ubs-mcq-4",
      prompt: "A billings-to-legs join for the per-center split returns 33 rows on a 28-billing book. The honest per-center billing count is:",
      choices: [
        "COUNT(*) per center — 33 is the book now",
        "COUNT(DISTINCT i.id) per center — five split-plan billings carry two legs each",
        "27 per center — the void billing vanished",
        "Whatever the join returns — counts never need protecting",
      ],
      answer: 1,
      why: "Five split-plan billings ride two legs each, so the join prints 33 rows at leg grain. COUNT(DISTINCT i.id) folds back to billing grain — the grain whose center split must reproduce the 28-billing book.",
      notes: [
        { choice: 0, why: "COUNT(*) counts rail hits — the split then exceeds the whole by exactly the five split plans, and nobody can explain why the parts outrun the book." },
        { choice: 2, why: "The void billing is still a billing on the book — it holds its place in the census whether or not a rail ever hit it. Dropping it conflates the billing book with the settlement feed." },
      ],
      difficulty: "medium",
    },
    {
      id: "ubs-mcq-5",
      prompt: "The board keeps only booking centers whose settled dollars exceed zero. Where does that gate go?",
      choices: [
        "WHERE settled_dollars > 0",
        "HAVING SUM(p.amount_cents) > 0",
        "LIMIT 1",
        "WHERE method IS NOT NULL",
      ],
      answer: 1,
      why: "The gate is on a fold, and folds exist only after GROUP BY — the gate is HAVING, written against the settlement fold itself. WHERE runs before any fold exists.",
      notes: [
        { choice: 0, why: "WHERE can't see SELECT aliases or folds — settled_dollars isn't born yet at row-filter time. It either errors or filters something else entirely." },
        { choice: 2, why: "LIMIT 1 keeps one row, not the qualifying rows — a gate and a cap are different sentences, and this one silently deletes four of the five centers." },
      ],
      difficulty: "medium",
    },
    {
      id: "ubs-mcq-6",
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
        { choice: 0, why: "The billing still says open while carrying 4000.00 of settlements — filtering on a status that doesn't exist returns an empty census and the partial never surfaces." },
        { choice: 2, why: "Hardcoding one amount finds one billing today and nothing next quarter. The definition is the comparison — every partial, present and future, falls out of SUM(receipts) < billed." },
      ],
      difficulty: "medium",
    },
    {
      id: "ubs-mcq-7",
      prompt: "The whale board must give every booking center its own top-billing rung 1. What makes that true?",
      choices: [
        "RANK() OVER (PARTITION BY center ORDER BY amount DESC)",
        "RANK() OVER (ORDER BY amount DESC)",
        "ORDER BY center, amount DESC",
        "GROUP BY center with MAX(amount)",
      ],
      answer: 0,
      why: "PARTITION BY restarts the ranking per booking center — each book gets its own rung 1 (EU's is the 6148.00 open partial). Without the partition, one global ladder swallows all five rungs into a single book.",
      notes: [
        { choice: 1, why: "No partition means one global ranking — rung 1 exists once in the whole bank and four centers' advisors read boards with no top of them." },
        { choice: 3, why: "GROUP BY collapses each center to one row — you get the maximum but lose the identity of which billing holds it, and the board needs the billing, not just the number." },
      ],
      difficulty: "medium",
    },
    {
      id: "ubs-mcq-8",
      prompt: "Which read isolates the void billing that still drew a 925.00 rail hit — per center?",
      choices: [
        "WHERE status = 'void', grouped by center",
        "Pair state with evidence: status='void' AND an EXISTS settlement leg, grouped by center",
        "WHERE method = 'void' on the settlement feed",
        "The no-leg anti-join, grouped by center",
      ],
      answer: 1,
      why: "The break is a PAIR — a void claim and a leg that exists. The paired read proves the rail hit should never have cleared and attributes it to the center whose book absorbed the 925.00; status alone shows the void but not the drawn leg.",
      notes: [
        { choice: 2, why: "'void' is a billing state, not a rail — the settlement feed carries card and wire only. The query errors and the break stays invisible in the pack." },
        { choice: 3, why: "The anti-join finds NEVER-settled billings — the opposite evidence. The void-but-drawn row HAS a leg, so the anti-join is structurally blind to it." },
      ],
      difficulty: "hard",
    },
    {
      id: "ubs-mcq-9",
      prompt: "Two sixes again: the open-status census reads 6 billings / 19609.00; the no-leg anti-join reads 6 billings / 15217.00. The 4392.00 gap is:",
      choices: [
        "Rounding drift between cents and dollars",
        "Membership: the open 4000.00-partial has a leg (out of the anti-join), and a paid-status 1756.00 has none (in it)",
        "The anti-join excludes void billings",
        "Nothing — same six billings, same dollars",
      ],
      answer: 1,
      why: "Same count, different sets — the anti-join keys on settlement evidence, not status. The swing is exactly the two honest anomalies in the book, and per center they sit differently, which is why the tie-back rule exists.",
      notes: [
        { choice: 3, why: "If the sets were identical the dollars would tie too — they don't. Equal counts with unequal dollars is the signature of different membership, not of agreement." },
        { choice: 0, why: "Both reads divide by 100.0 the same way. 'Rounding' is the excuse that stops the investigation one step before the actual finding." },
      ],
      difficulty: "hard",
    },
    {
      id: "ubs-mcq-10",
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
  ],

  cases: [
    {
      id: "cs-ubs-1",
      tier: "medium",
      topic: "j7",
      universe: "month-close",
      title: "The cross-rail settlement fold",
      brief:
        "UBS-flavored memo on the storefront db (payments = settlement legs, customers = client households, regions = booking centers): the integration close wants the settlement read per booking center and per rail — legs, distinct billings touched and settled dollars — so the center split can be cross-footed against the rail census before the pack ships. Probed facts: the two rails cleared 27 legs for 69612.00 — card 16 legs / 37364.00, wire 11 / 32248.00 — and the cash book's debit fold reads the same 69612.00. The rule: *legs are leg grain, billings are billing grain, and both columns must say which one they are.*",
      ask: "Return the fold: booking center, rail, settlement legs, distinct billings touched, settled dollars (2dp) — centers A-to-Z, biggest rail first within each.",
      template:
        "SELECT c.{1} AS booking_center,\n       p.{2} AS rail,\n       COUNT(*) AS settlement_legs,\n       COUNT(DISTINCT p.invoice_id) AS billings_touched,\n       ROUND(SUM(p.{3}) / {4}, 2) AS settled_dollars\nFROM payments p\nJOIN invoices i ON i.id = p.invoice_id\nJOIN customers c ON c.id = i.customer_id\nGROUP BY booking_center, rail\nORDER BY booking_center, settled_dollars {5};",
      slots: [
        {
          answer: "region",
          kind: "keyword",
          label: "the booking-center grouping key",
          why: "c.region is the booking center — the fold's grouping axis and the join's payload. Any other customer column groups the book at the wrong grain: a city where a center belongs, a name where a market belongs.",
        },
        {
          answer: "method",
          kind: "keyword",
          label: "the rail grouping key",
          why: "p.method is the rail — card and wire, the two settlement paths the census names. paid_on would re-fold the book per payment date and shred the two-rail census into a calendar.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the settled-money column",
          why: "Settled dollars are the legs' own amounts — SUM(p.amount_cents), integer cents. The billing's amount column doesn't exist on this table, and folding leg ids would sum primary keys with a straight face.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divisor",
          noVerify: true,
          why: "Money is integer cents; the dollar read is amount_cents / 100.0 — float division, rounded once. The integer 100 truncates every odd-cent leg: the 2361.50 wire leg prints 2361 and the cross-foot misses the cash book by half-dollars.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the within-center order",
          why: "DESC headlines each center's bigger rail — the pack reads exposure top-down. ASC opens every center on its smaller rail and the hour is spent reading upside-down books.",
        },
      ],
      distractors: ["city", "paid_on", "i.amount_cents", "100", "ASC"],
      walkthrough:
        "A cross-rail fold is a two-key GROUP BY with the unit conversion at the edge. The joins are grain-safe: each leg points at exactly one billing and one household, so no fan-out here — 27 legs in, 27 rows out, folded per center and rail into five rows. COUNT(*) is the leg census; COUNT(DISTINCT p.invoice_id) is the billing census, and the two disagree exactly where split plans live (a billing with two legs counts once); SUM(p.amount_cents)/100.0 — rounded once — is the dollars. The result cross-foots: EU card 8 legs / 19124.50 and wire 6 / 18136.50, APAC wire 5 / 14111.50 and card 3 / 6501.50, US card 5 / 11738.00 — 27 legs, 69612.00, tying the cash book's debit fold line for line, with the US book card-only (its wire rail prints nothing — absence, not zero, and no LATAM rows at all because that book holds no settled billings). The distractors fail honestly: a city or payment-date grouping key shreds the census into streets and days, folding the billing-side amount column errors (it isn't on the leg table), the integer 100 truncates odd-cent legs until the cross-foot misses, and ASC turns every center's rail order upside down. The habit being graded: name the grain in the column alias — legs are legs, billings are billings, and the pack says which.",
    },
    {
      id: "cs-ubs-2",
      tier: "hard",
      topic: "t5",
      universe: "fraud",
      title: "The whale board, per center",
      brief:
        "UBS-flavored memo on the storefront db (invoices = client fee billings, customers = households, regions = booking centers): the integration risk committee wants the concentration board — every fee billing ranked within its own booking center — to see where single-mandate exposure sits. Probed facts: the book's biggest billing is the **6148.00** open partial in the EU book; EU's next rungs are 5614.00, 5284.00, 4860.00 and 4723.00 — four of the five being split-plan billings — while the US book tops at **4937.00** and APAC at 4459.00. The committee reads rungs, not averages: *concentration hides inside means.*",
      ask: "Return the board: booking center, billing id, billed dollars (2dp), rung within center — centers A-to-Z, best rung first.",
      template:
        "SELECT c.{1} AS booking_center,\n       i.id AS billing_id,\n       ROUND(i.{2} / {3}, 2) AS billed,\n       RANK() OVER (PARTITION BY c.region ORDER BY i.amount_cents {4}) AS rung\nFROM invoices i\nJOIN customers c ON c.id = i.{5}\nORDER BY booking_center, rung;",
      slots: [
        {
          answer: "region",
          kind: "keyword",
          label: "the center label",
          why: "c.region names the booking center each rung belongs to. The city column would relabel the board with streets — real values, wrong grain, and the committee's center-by-center reading collapses.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the billed column",
          why: "Exposure is the billing's own amount — amount_cents, integer cents. The id column would rank billings by primary key and print the board's dollar column as row numbers divided by a hundred.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divisor",
          noVerify: true,
          why: "The dollar read is amount_cents / 100.0, rounded once — 614800 cents prints 6148.00. The wrong divisor moves the decimal: divide by 1000 and the committee reads a book a tenth its size.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the rung direction",
          why: "Rungs count exposure down — rung 1 is the biggest billing in the book. ASC hands rung 1 to the smallest billing in every center and the board ranks in exactly the wrong direction.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the join key",
          why: "Each billing points at its household's primary key — i.customer_id = c.id. Joining on region compares integers to text and matches nothing; joining on id pairs billings with whichever household shares their row number.",
        },
      ],
      distractors: ["city", "id", "1000", "ASC"],
      walkthrough:
        "A whale board is a ranking window that must restart per book. The join attaches each billing to its household (28 billings, no fan-out — one billing, one customer); the window ranks by amount_cents DESC inside PARTITION BY region, so every booking center owns a rung 1; ROUND(amount_cents/100.0, 2) converts once at the edge. Read the board and the integration story appears: EU's rung 1 is the **6148.00 open partial** — the book's largest single billing is also its least settled — and EU's rungs 2 through 5 (5614.00, 5284.00, 4860.00, 4723.00) are split-plan billings, the reason leg counts and billing counts disagree. The US book tops at **4937.00**, APAC at 4459.00, and the outer ORDER BY center, rung makes the board read center by center instead of one global ladder where EU owns the top five rungs outright. The distractors fail honestly: the city label re-titles every row at street grain, the id column ranks by primary key, the wrong divisor slides the decimal until the dollar column reads a book a tenth its size, and ASC crowns every center's smallest billing as its whale. The habit being graded: the partition is the entity boundary — a wealth house never ranks one center's whales against another's minnows.",
    },
  ],

  problems: [
    { slug: "settlement-fails-aging", why: "T+2 aging buckets over unsettled items: the no-leg watch (6 billings / 15217.00) aged against flat 30-day terms — the integration close's collections ladder in textbook shape." },
    { slug: "journal-gap-detection", why: "Sequence gaps in a journal: the ledger's 80 entries audited for missing post dates — the integration-era control that catches feeds that dropped a day." },
    { slug: "ar-aging-schedule", why: "AR aging by bucket: the fee book's open balances aged per booking center — the collections read the wealth service desks live in." },
    { slug: "delinquency-roll-rates", why: "State-to-state roll rates: how billings move open-to-partial-to-settled between months — the movement read behind the coverage census." },
    { slug: "wash-trade-detection", why: "Self-offsetting pair screens: split-plan legs that mirror each other across rails — the rails desk's screen for round-tripped value." },
    { slug: "max-drawdown", why: "Running-maximum arithmetic: the deepest peak-to-trough on a balance fold — exposure language the risk committee already speaks." },
    { slug: "beta-benchmark", why: "Series-versus-benchmark covariance: each center's fee curve against the group's — the relative-read drill behind per-entity benchmarking." },
    { slug: "split-adjusted-position", why: "Normalizing quantities across corporate actions: the split-plan billing read in miniature — one economic event, several recorded legs." },
    { slug: "realized-pnl-average-cost", why: "Layer-consumption math over a fill series: partial receipts consuming billed exposure — the 4000.00-of-6148.00 story at portfolio grain." },
    { slug: "dividend-income-calendar", why: "Income events on a calendar spine: recurring fee cycles per household — the advisory-billing cadence read." },
    { slug: "risk-based-pricing", why: "Band joins between exposure and price tables: fee schedules that step by band — the billing-cycle engine as a join problem." },
    { slug: "daily-balance-interest", why: "Interest over a date spine: day-weighted balance math on the cash book — where the 69612.00 fold earns its keep." },
    { slug: "fx-exposure-report", why: "Latest-rate joins normalizing currencies: the cross-entity read where Zurich and Singapore books must land in one reporting currency." },
    { slug: "prepayment-detection", why: "Early-settlement flags against a schedule: billings settled before day 30 of flat terms — the 13-day fastest settlement found mechanically." },
    { slug: "chargeback-rate-ranking", why: "Rate gates with HAVING and ranking: anomaly rates per center ranked for review — the anomaly census's companion board." },
    { slug: "second-most-recent-activity", why: "Argmax with rank: each household's second-latest fee event — the advisor's 'who lapsed last cycle' screen, windows drilled properly." },
  ],
};
