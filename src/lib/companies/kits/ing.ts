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
  ],

  dayInLife: [
    "**08:30 —** the morning census before the standup. First query proves the ledger — **181080.00 against 181080.00, delta 0** across 80 entries — then the rail census: card **16 legs / 37364.00**, wire **11 / 32248.00**, cross-footed to the cash book's 69612.00 debit fold. The screening file pairs counts with edges: 13 card legs in the mid band, and the only sub-threshold leg in the whole book is the **925.00** drawn against the void billing. The compliance standup opens at 09:00 with those numbers already tied.",
    "**13:00 —** deep work: the no-leg watch, re-cut per book. The anti-join runs — billings LEFT JOINed to legs, `IS NULL` arm on the rail side — and lands at **6 billings / 15217.00**: four in the EU book (8524.00), one US at **4937.00**, one APAC at 1756.00. The subtlety the review always trips on: the open-status census also reads six, but it carries 19609.00 — one of its members took a 4000.00 partial and *has* a rail hit, while a paid-status billing at **1756.00** has none. *Membership is evidence; status is a claim.*",
    "**17:00 —** the scenario pack and the EOD writeup. The collections scenario ships with its denominator on the slide — settled billings average **28.4 days** to first payment (fastest 13, slowest 84) against flat 30-day terms — and every band edge is footnoted with its inclusivity. Tomorrow's ask is queued for the data-quality board: the void-but-drawn 925.00, waiting on the rail's own explanation. *In a bank that answers with queries, the writeup is a query plus its definitions — nothing more, and nothing less.*",
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
  ],
};
