// Barclays — kit 8 of the Banking & Capital Markets domain (Batch H).
// UK/US universal banking and investment banking: retail accounts, corporate
// lending and the audit trail that ties every number back to the books of
// record. The storefront db maps on honestly: invoices are facility drawdown
// notices and account billings (the receivables the bank carries), payments
// are the settlement rails (method card / wire — card is the retail
// debit-card rail, wire the corporate and institutional rail),
// ledger_entries is the double-entry books of record — the audit trail
// everything samples — and expenses are op-cost lines. Customers are account
// holders (retail plus corporate); orders are booked account activity (REAL
// dollars — the one table where money is already dollars). Money in
// invoices/payments/expenses/ledger is INTEGER cents — the dollar read is
// always amount_cents / 100.0.
// Pool provenance: Barclays has 0 tagged sql rows in the band (checked
// company-pools.md for barclays / Barclays variants) — the whole pool and
// every topic slug is theme-curated from company-pools.md to Barclays's known
// question families, provenance stated per problem below. Case figures:
// scripts/company-facts.md (probed 2026-10-12).

// 3x EXPANSION (append-only — every original entry kept byte-identical):
// brief 4->6, dayInLife 4->5, metrics 8->12, topics 10->15, theory 8->24
// (barclays-t9..t24), mcqs 10->30 (barclays-mcq-11..30), cases 2->6
// (cs-barc-3..6; topic families j7/s6/q2/x3 — all distinct from the kit's
// original j5/l8 pair), problems 16->32. New slugs theme-curated from
// company-pools.md (Barclays remains 0-tagged); case figures re-probed
// against db/custom.db: rails fold card 16/37364.00 vs wire 11/32248.00
// (27 hits over 22 distinct billings — the 5 splits straddle, one card leg
// plus one wire leg each), status matrix clean 25/64687.00 + void-settled
// #11 925.00 (card) + paid-unmoved #28 0.00/1756.00 + open-partial #25
// 4000.00/6148.00 (wire), outlier book 12 billings above the 3106.32 mean
// carrying 54430.00 = 62.6% of 86977.00, op-cost stack Rent 16800.00 /
// Ads 4570.00 / Travel 2521.00 / Tools 1525.00 + TOTAL 36/25416.00 tying
// to the operating_expenses ledger fold, calendar 27 movements on 26
// distinct days (2025-02-10 doubles: a card hit plus the partial's wire
// leg), 13 month buckets 2024-02..2025-02.

import type { CompanyKit } from "../types";

export const barclaysKit: CompanyKit = {
  id: "barclays",
  domainId: "banking",
  name: "Barclays",
  tagline: "UK/US banking and investment banking",
  accent: "text-emerald-200",

  brief: [
    "Barclays is the UK/US universal bank — a retail bank with millions of current accounts on one side, a corporate and investment bank moving institutional money on the other, and one set of books of record underneath both. The universal model means the SQL covers the whole span: a debit-card rail posting a retail account and a wire clearing a corporate facility are the same fold on different rails. On this book: 16 account holders whose activity concentrates hard — the top tier carries **63.5%** of value — with 103 booked account events worth **34833.28**, the largest single relationship at 24 events for **7262.35**. The cultural rule the audit, controls and technology function enforces: *every number walks back to the books, and the books prove — or the number does not ship.*",
    "The data org sits on the books of record. Every facility drawdown notice and account billing lands as a receivable; every settlement clears it on a rail — card, the retail debit-card rail (16 hits for **37364.00**), and wire, the corporate rail (11 for **32248.00**) — and every settled dollar posts twice into the double-entry ledger, debit and credit, stored as integer cents with the dollar read always `cents / 100.0`. The daily proof is the audit's anchor: **181080.00 debits against 181080.00 credits across 80 ledger entries, delta 0**. The coverage census reads 21 billings settled exact, 1 partial (4000.00 against 6148.00), 6 with no rail hit — and the unpaid book, **6 billings carrying 15217.00**, is the watchlist the close signs against flat 30-day terms.",
    "Interview style is audit-minded and sequence-aware. Screens open with a books fold — counts and values per account — then escalate into the questions this bank is known for: an anti-join that builds the unpaid watchlist, a `HAVING` screen that samples the audit trail by activity, a CASE ladder that classifies coverage with the boundary documented for the controls committee. Follow-ups are about populations and sequence: 'does that total include the partial?', 'is every journal id present, in order, with no gaps?'. Candidates who state the denominator, the grain and the boundary before writing SQL do well; *in an audit culture, a query that cannot explain who it excluded is a finding, not a report.*",
    "Preparation strategy: Barclays has **0 tagged problems** in this app's band — the pool is theme-curated to its known question families: books folds, unpaid-book anti-joins, journal-sequence gap detection, coverage CASE ladders, aging schedules and cents-precision proofs (provenance stated per problem). Do the topics in order, then run all six case studies on the live storefront database: one rebuilds the {rose:unpaid-book worklist} the close signs against, the other rebuilds the {emerald:audit-trail screen} the controls committee samples by, with four more rehearsing the same drills at other grains — the kit is built for spaced practice rather than one sitting...",
    "The spine reads expand past the fold. The rails stack — **card 16 movements / 37364.00** against wire 11 / 32248.00 — cross-foots to the 27 hits and 69612.00 the cash book carries, and the straddle count is the tell: rail-side hits (27) exceed distinct billings covered (22) by exactly the five splits, because each split books one card leg and one wire leg — `COUNT(DISTINCT invoice_id)` per rail equals movements per rail only while no billing doubles up on ONE rail. The status matrix sharpens the anomalies into four classes: clean 25 billings carrying 64687.00 settled, {rose:void-settled} #11 at 925.00 on card, {rose:paid-unmoved} #28 at 0.00 against 1756.00 booked, {amber:open-partial} #25 at 4000.00 of 6148.00 on wire — four classes, 28 billings, 69612.00, or the matrix does not ship.",
    "The deeper rounds test definitions, not recall. The {violet:outlier book} flags the 12 billings booked above the **3106.32** book-wide mean — 54430.00, **62.6%** of the 86977.00 booked — and asks what the bar's subquery returns when the fold behind it comes back empty. The op-cost stack folds `expenses` into Rent 16800.00 / Ads 4570.00 / Travel 2521.00 / Tools 1525.00 plus a TOTAL row at 25416.00 that must tie to the operating_expenses ledger book exactly. And the settlement calendar reads 27 movements onto 26 distinct days — 2025-02-10 carried both a card hit and the partial's wire leg. Prep now runs six case studies on the live db: the two originals, the rail audit fold, the status matrix, the outlier book and the op-cost stack — every figure a verified result cell, every population statement part of the answer.",
  ],

  dayInLife: [
    "**08:00 —** the day opens on the books, not the news. The overnight rails posted — card for retail, wire for corporate — and the first queries prove the books before anything else runs: total debits still equal total credits on the ledger fold (**181080.00 against 181080.00 across 80 entries, delta 0**, or page someone), then the rail census — **16 and 37364.00** on card, **11 and 32248.00** on wire — reconciles against the billings they clear. The break list classifies itself in the same pass: the void-but-settled 925.00, the paid-status billing with no rail at 1756.00. A proof that fails is the whole morning; nothing else ships until it ties.",
    "**11:00 —** midday is the {rose:unpaid-book walk}, the deep-work block. The watchlist query refreshes: billings with no rail hit — **6 books, 15217.00** — joined back to status so the desk can split five genuinely open billings from the one paid-status break that status alone would hide. Each row carries its booked amount, its coverage class and its age against the **30-day** terms line, because corporate lending chases the wire book and retail ops chase the card book, and the owner column comes from the rail — or the absence of one.",
    "**14:00 —** then the corporate screens take their hour. The audit-trail sample rebuilds — accounts folded to entry counts, judged against the activity floor in `HAVING` (cash **27** entries, receivables **26**, the credit-only revenue book at 13 dropping below the line) — and the facility coverage ladder reruns: 21 exact, 1 partial at 4000.00 of 6148.00, 6 none. The journal-sequence gap check runs beside it, because a missing id in the books of record is a {rose:finding}, not a footnote. Every screen ships with its population statement attached — the audit committee reads the WHERE before it reads the number.",
    "**16:30 —** the afternoon closes with stakeholders: the close pack assembles (per-account nets — cash **44196.00**, operating costs **25416.00**, receivables **16440.00** against the revenue credit of -86052.00), the aging schedule goes to the lending committee with the **84-day** tail annotated, and the EOD writeup routes the day's breaks to the desks that own them. There are rituals: every number carries its query, every CASE boundary carries its justification, every excluded population is named in the pack. The best-prepared candidate knows the rhythm: prove the books, walk the unpaid book, sample the trail, sign the pack — in that order, every day.",
    "**20:30 —** quarter-end spine night, and the order of proofs never changes. The trial balance first — **181080.00 debits against 181080.00 credits, delta 0** across 80 entries — then the rails stack: card 16 / 37364.00, wire 11 / 32248.00, appended TOTAL 27 / 69612.00, cross-footed against the cash book. The status matrix reruns with the quarter's additions: 25 clean, and the three standing exceptions — {rose:void-settled} 925.00, {rose:paid-unmoved} 1756.00, {amber:open-partial} 4000.00 of 6148.00 — must still name their owners before the pack signs. The last pass is sequence and straddle: journal ids 1 through 80 present with no gaps, the five splits each proving one card leg against one wire leg, the op-cost fold tying 25416.00 to the ledger. *The close ships on proofs, not on the calendar* — the candidate who can run this hour from memory has already passed the screen.",
  ],

  metrics: [
    { name: "Books proof delta", what: "Total debits minus total credits across the ledger — 181080.00 against 181080.00 here, delta 0 across 80 entries. The daily anchor: a nonzero delta is a page, not a footnote." },
    { name: "Rail census", what: "Settlement count and value per rail — card 16 / 37364.00 (retail), wire 11 / 32248.00 (corporate). One fold, two rails, and the pair cross-foots to the cash ledger's 69612.00 debits." },
    { name: "Unpaid-book exposure", what: "Billings with no settlement row — count and value (6 / 15217.00 here), split by status so the paid-no-rail break never hides inside the open book. The close signs against this watchlist." },
    { name: "Coverage census", what: "Billings classified exact / partial / none — 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 none. The classification the controls committee reviews and every exception owner routes by." },
    { name: "Account activity counts", what: "Ledger entries folded per account — cash 27, receivables 26, operating costs 14, revenue 13. The audit-trail sample screens on exactly these counts; thin trails are findings, thick trails are coverage." },
    { name: "Days-to-settle", what: "Billing-to-settlement latency on the settled book — 28.4 days average, 13 fastest, 84 slowest against flat 30-day terms. The 84-day tail is what the lending committee sees annotated." },
       { name: "Relationship concentration", what: "Share of book value held by the largest account holders — the top tier carries 63.5% here. The universal-bank instinct that turns a GROUP BY into a relationship-limit discussion." },
    { name: "Split-settlement share", what: "Settled billings that cleared across two rails — 5 of the settled book. Each pair must reconcile to its booked amount before the pack assembles; the share sizes the manual tie-out queue." },
    { name: "Straddle count", what: "Rail-side settlement hits minus distinct billings covered — 27 hits over 22 billings here, the gap of 5 exactly the split count: every split books one card leg and one wire leg. The check that a split never doubles up on ONE rail; per-rail COUNT(DISTINCT invoice_id) equals movements per rail until one does." },
    { name: "Outlier-book share", what: "Value booked above the book-wide mean billing (3106.32 here) as a share of the whole — 12 billings carrying 54430.00, 62.6% of 86977.00. The credit desk's concentration read; the mean moves on every restatement, so the bar is a subquery, never a literal." },
    { name: "Op-cost mix", what: "Expense lines folded per category against the operating_expenses ledger book — Rent 16800.00 (66.1%), Ads 4570.00, Travel 2521.00, Tools 1525.00, TOTAL 25416.00 across 36 lines. The stack must tie to the ledger's 25416.00 debit fold or the cost page does not ship." },
    { name: "Settlement calendar density", what: "Movements against distinct settlement days — 27 over 26 here, the one double-day (2025-02-10) carrying both a card hit and the partial's wire leg. Density is the cadence read behind the close calendar: 13 month buckets, 2024-02 to 2025-02." },
  ],

  topics: [
    {
      name: "Books folds at the account grain",
      why: "Every audit starts by folding the ledger: entries, debits, credits and net per account, cross-footed to the global proof. The trap is baked into the books — a credit-only revenue book folds to 0.00 on the debit side — and the interviewer listens for whether your CASE arms keep the sides pure before any net is believed.",
      slugs: ["trial-balance-check", "bank-account-summary-ii", "balance-rollforward", "gl-reconciliation", "expected-credit-loss"],
    },
    {
      name: "Retail-account LEFT JOINs",
      why: "A retail account reads as the account LEFT JOINed to its activity: accounts with no activity this cycle must survive the fold with NULLs, not vanish. Screens drill the two-table fold until the survival rule is reflex — INNER for posted value, LEFT when the untouched accounts ARE the story.",
      slugs: ["bank-account-summary", "combine-two-tables", "employee-bonus"],
    },
    {
      name: "The unpaid-book anti-join",
      why: "The unpaid watchlist — 6 billings, 15217.00 — is a LEFT JOIN plus an IS NULL on the join key, the most-quoted shape in the building. Screens escalate it: NOT EXISTS twins, WHERE-placement traps that silently convert the anti-join back to an inner fold and delete the very book the close signs against.",
      slugs: ["customers-who-never-order", "number-of-accounts-that-did-not-stream", "ad-free-sessions"],
    },
    {
      name: "Facility coverage CASE ladders",
      why: "Coverage is a definition, not a vibe: exact when the folded rail value equals the booking, partial when it does not, none when no rail ever hit. That ladder is a CASE over a LEFT join folded per billing — exhaustive arms, documented boundaries — and the census it produces (21 / 1 / 6) is a controls artifact.",
      slugs: ["loan-types", "count-salary-categories", "evaluate-boolean-expression"],
    },
    {
      name: "Audit-trail HAVING screens",
      why: "The controls committee samples books of record by activity: accounts folded to entry counts, judged against an activity floor in HAVING. The grammar is HAVING because the floor is a group property, and the interviewer checks whether your boundary operator and your population statement survive an audit read.",
      slugs: ["customer-order-frequency", "activity-participants", "calculate-the-influence-of-each-salesperson"],
    },
    {
      name: "Drawdown and settlement date math",
      why: "Aging schedules, drawdown windows and the flat 30-day terms line make date arithmetic a daily tool. The recurring traps are all here: BETWEEN dropping the last night of a window, STRFTIME buckets that merge years, and an aging read whose population quietly excludes the rows it is naming.",
      slugs: ["settlement-fails-aging", "rising-temperature", "friday-purchases-i"],
    },
    {
      name: "Journal sequence and gap detection",
      why: "The books of record are an ordered journal, and a missing id is a finding. Screens drill sequence reads — gaps in id runs, islands of consecutive postings, first-vs-latest entries per book — because auditability lives in the sequence, not just the totals.",
      slugs: ["journal-gap-detection", "find-the-missing-ids", "consecutive-numbers"],
    },
    {
      name: "Cents precision and odd-cent discipline",
      why: "Money in the finance tables is INTEGER cents — the dollar read is cents / 100.0 and every precision bug in the building is a variant of forgetting that. Odd-cent billings are the unit tests: an integer division that survives round numbers leaks half-dollars the moment the book gets real.",
      slugs: ["odd-and-even-transactions", "ar-aging-schedule", "monthly-transactions-i"],
    },
    {
      name: "Officer and book rank windows",
      why: "Relationship ladders, top-book lists and aging ranks are leaderboard questions with an audit accent. The rank trio decides who shares a rung and what the next rung is called — and ties in money amounts are common enough that LIMIT-with-OFFSET instincts break publicly.",
      slugs: ["rank-scores", "group-employees-of-the-same-salary", "second-most-recent-activity"],
    },
    {
      name: "Counts that survive review",
      why: "An audit number is a count that can explain itself: COUNT(*) versus COUNT(col), the gap that IS the unpaid population, NULL arms that keep excluded rows visible. Screens check whether your counts state their population before the reviewer does.",
      slugs: ["books-with-null-ratings", "find-customer-referee", "calculate-special-bonus"],
    },
    {
      name: "Set ops over the two rails",
      why: "The rails stack is a UNION ALL — card fold, wire fold, then the same fold appended as a TOTAL row; two grains, one page. UNION's dedupe looks safer and is a silent row-deleter the day two stack rows agree, and INTERSECT/EXCEPT do the population diffs (paid versus moved) that build the anomaly queue. Drill the grammar until the ALL is reflex.",
      slugs: ["monthly-transactions-ii", "count-apples-and-oranges", "league-statistics"],
    },
    {
      name: "Subquery shapes on the book",
      why: "The outlier book — 12 billings above the 3106.32 mean — is a scalar-subquery bar, and the interviewer wants the empty-inner contract said out loud: a scalar shape returns 0-or-1 rows, 0 rows reads NULL, and every comparison against NULL is UNKNOWN, so the queue silently empties on a filtered staging table. IN-lists and EXISTS twins carry their own failure modes; each shape answers a different population question.",
      slugs: ["second-highest-salary", "department-highest-salary", "orders-with-maximum-quantity-above-average"],
    },
    {
      name: "LAG and LEAD on the settlement journal",
      why: "First settlement per billing, third movement in the journal, consecutive-day streaks — the sequence reads are LAG/LEAD territory, and the first row's NULL is data, not an error. The books interleave accounts (cash ids run 2..79 while receivables run 5..80), so span arithmetic like MAX(id) - MIN(id) proves nothing per book — the partition does the work the range can't.",
      slugs: ["uber-first-transaction", "find-third-transaction", "customers-with-maximum-number-of-transactions-on-consecutive-days", "structuring-detection", "account-balance", "consecutive-transactions-with-increasing-amounts", "find-the-start-and-end-number-of-continuous-ranges"],
    },
    {
      name: "Month buckets on the close calendar",
      why: "The settlement calendar runs 13 months, 2024-02 to 2025-02, and the bucket key is TEXT that sorts as a calendar only because it is year-first: '2025-02'. '%m' alone merges the two Februaries into one 3-movement bucket and the close trend lies. Half-open date windows and weekday folds (27 movements over 26 distinct days) complete the calendar kit.",
      slugs: ["unique-orders-and-customers-per-month", "total-sales-amount-by-year", "sales-by-day-of-the-week", "delinquency-buckets"],
    },
    {
      name: "Fan-out and leg-grain folds",
      why: "Booked events carry instrument legs — 251 legs against 103 events — and joining the legs table into an event fold multiplies every SUM by the legs-per-event ratio before anyone notices. The drills: fold at leg grain when the question is leg-shaped, DISTINCT the event count when it is not, and prove the grain with COUNT(*) beside COUNT(DISTINCT) on every money column the pack prints.",
      slugs: ["product-sales-analysis-iii", "customers-who-bought-all-products", "list-the-products-ordered-in-a-period"],
    },
  ],

  theory: [
    {
      id: "barclays-t1",
      q: "A billing can settle across two rails, and some billings never settle at all. For the end-of-day coverage report, which join do you pick — and what happens to each population either way?",
      a: "Decide from the survival rule the report implies. The settled-value report is an INNER fold from rails to billings: it runs at settlement grain, 27 rows here, with the five split billings appearing twice — so the fold that follows must aggregate per billing before the number means 'settled value'. The coverage report is LEFT from billings: the 6 billings with no rail row are the unpaid book — 15217.00 — and they survive only if no right-table predicate leaks into WHERE, because WHERE p.amount_cents > 0 quietly converts the LEFT JOIN into an INNER and the watchlist vanishes. The proof this discipline matters is in the anomalies: a void billing settled 925.00 anyway, and a paid-status one has no rail hit at all — status and settlement presence are different facts, and only the join decision decides which fact your report can even see. Say the survival rule out loud before the join type; the join is the consequence, not the choice.",
      tag: "joins",
    },
    {
      id: "barclays-t2",
      q: "The books hold 80 ledger entries across four accounts. Fold them per account — and narrate every COUNT and SUM in the fold the audit committee reads.",
      a: "Every aggregate gets its grain said out loud. COUNT(*) per account counts journal entries — cash 27, receivables 26, operating costs 14, revenue 13 — the activity counts the audit-trail sample screens on. SUM(debit_cents) and SUM(credit_cents) price each side: 69612.00 and 25416.00 on cash, 86052.00 and 69612.00 on receivables, 25416.00 and 0.00 on operating costs, 0.00 and 86052.00 on revenue — and the net is their difference, never a re-derivation from a different grain. The cross-foot is the proof: 69612.00 + 25416.00 + 86052.00 + 0.00 = 181080.00 on the debit side, the same on credits, delta 0. The audit-flavored trap is the count that lies: a bare-column SELECT beside GROUP BY picks an arbitrary row and survives to production; a COUNT(col) versus COUNT(*) gap is the excluded population, and in an audit culture that gap is either named or it is a finding. The strong candidate answers 'one row per WHAT?' for every fold before computing any of them.",
      tag: "aggregation",
    },
    {
      id: "barclays-t3",
      q: "Build the running balance through an account's journal — every entry beside the balance it leaves behind. What does the window actually compute, and what do you state about the frame?",
      a: "The fold is SUM(debit_cents - credit_cents) as a running total, and the frame is the entire answer. SUM(…) OVER (ORDER BY entry_seq) defaults to RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — which includes every PEER sharing the current ordering value. On a unique key that is harmless; order two entries on the same timestamp and the running balance jumps by both at once, and the walk lies by one entry for the rest of the journal. The defensible shape is ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW over a deterministic order — entry sequence, or entry_date with id as the tie-break — so each row carries exactly the postings before it. The prior-balance column is LAG(running) beside it, not a second scan. At Barclays the habit being graded is saying the frame out loud: 'running total' without a frame means 'running total including peers', and on the books of record — where an auditor re-derives every intermediate balance — a walk that double-counts one timestamp is a finding, not a cosmetic artifact.",
      tag: "windows",
    },
    {
      id: "barclays-t4",
      q: "The unpaid book is a NULL problem wearing a finance costume. What is your NULL policy for the receivables report?",
      a: "Three behaviors, then a policy. Filters: NULL fails both x = value and x != value — the comparison is UNKNOWN — so WHERE settled_amount < booked_amount silently drops the rows with no settlement, which are precisely the rows the receivables report exists to name. Joins: NULL keys never match, which is why the anti-join that builds the watchlist tests the join key IS NULL — 6 billings, 15217.00. Aggregates: SUM and COUNT(col) skip NULLs while COUNT(*) keeps the row, so the gap between the two counts IS the unpaid population. The policy: define the population first, then choose where NULL lives. The watchlist keeps unmatched rows visible with NULL settlement columns — the honest print; the display layer may COALESCE to 0.00 at the edge, with the note that zero-means-no-rail-hit here. What is never acceptable is a mid-pipeline COALESCE that launders 'no settlement' into 'settled zero' — the paid-status billing with no rail hit (1756.00 booked) is exactly the break that habit produces, and in an audit culture it would ship as a clean close before anyone noticed the book was never actually collected.",
      tag: "nulls",
    },
    {
      id: "barclays-t5",
      q: "Where does the 'only settled rows' filter live, and where does the 'only accounts with fourteen-plus journal entries' filter live? Same instinct, different clauses — explain.",
      a: "The first is a row-level fact: settled-ness is a property of one settlement row, so it lives in WHERE and discards rows before the fold touches them. The second is a group-level fact: 'fourteen or more entries' is a property of a folded account, so it lives in HAVING, which runs after GROUP BY and can see COUNT. The clauses cannot swap: WHERE COUNT(*) >= 14 fails to compile — aggregates do not exist pre-fold — and a row predicate in HAVING wastes the fold by filtering populations that were already discarded. The pipeline order is the whole answer: FROM builds the rows, WHERE filters them, GROUP BY folds them, HAVING judges the groups, SELECT projects, ORDER BY displays. The Barclays twist is audit sampling: the activity floor — 14 here keeps cash (27), receivables (26) and operating costs, and drops the 13-entry credit-only revenue book — is a documented, version-controlled constant, argued about before it runs. A screen that asks this is really asking whether you know WHEN each fact becomes true in the engine, because that is when it can be defended.",
      tag: "pipeline",
    },
    {
      id: "barclays-t6",
      q: "Flag billings whose booked value beats their account holder's average booking. Scalar or correlated subquery — and what happens when the inner fold comes back empty?",
      a: "The two shapes answer different questions, and the cost profiles differ with them. The scalar shape — booked > (SELECT AVG(amount) FROM billings) — computes the book-wide average once and compares every row to it; it is 'above the book average'. The correlated shape — booked > (SELECT AVG(amount) FROM billings b2 WHERE b2.account_id = b.account_id) — re-runs per outer row and answers 'above this holder's own line', which is the relationship question the corporate desk actually wants: a 444.80 drawdown is routine for a 7262.35-lifetime relationship and an outlier for a single-event account. The trap both share: a scalar subquery is contractually 0-or-1 rows, and 0 rows yields NULL, not an error — every comparison against NULL is UNKNOWN, so the flag report silently returns nothing on a filtered staging table where the account fold is empty. Name the inner population per row, state the empty case, and pick the shape from the question's population, not from habit.",
      tag: "subqueries",
    },
    {
      id: "barclays-t7",
      q: "Rails arrive on TEXT timestamps and the terms line is flat 30 days. Bucket settlements by month, measure days-to-settle, and keep the calendar whole while you do it.",
      a: "Three tools, three caveats. Buckets: STRFTIME('%Y-%m', paid_on) — or SUBSTR(paid_on, 1, 7) on fixed-width ISO text — gives '2025-02', the year-first key that sorts as a calendar; '%m' alone merges Februaries across years and silently re-folds the close. Diffs: JULIANDAY(paid_on) - JULIANDAY(issued_on) returns fractional days — this book's settled latency is a 28.4-day average with a 13-day floor and an 84-day tail against flat 30-day terms, and the ROUND happens once, at the END, not per row. Windows: half-open intervals — issued_on >= '2025-02-01' AND < '2025-03-01' — never BETWEEN on the last day, which drops the final evening's settlements and with them the month-end burst. The deeper caveat is population: only settled billings HAVE a days-to-settle, so the NULL filter is definitional work and gets said out loud — 'this measures the settled book; the 6 unpaid are out of scope by construction, and they are the aging schedule's population instead.' State the convention, then query it — never the reverse.",
      tag: "dates",
    },
    {
      id: "barclays-t8",
      q: "A void billing settled 925.00 anyway, and a paid-status one has no settlement at all. Walk me through your break-handling policy — and tell me what the audit trail says about both.",
      a: "Breaks are data, not noise, and the policy has four moves. Detect: classify every billing by the pair (status, settlement presence) — void-but-settled and paid-no-rail are the two labeled failure modes, and both are CASE arms over a LEFT join. Quantify: one billing at 925.00 settled against a void booking; one at 1756.00 booked with no rail hit — numbers route work, adjectives do not. Reconcile: the ledger still proves — 181080.00 debits against 181080.00 credits, delta 0 — because double-entry records what HAPPENED, and the break is a process failure the books absorbed, which is exactly why the trial balance alone is never sufficient evidence of correctness. Route: flag and hand to the desk that owns the fix; never delete, never silently re-status — and the journal sequence proves nothing was edited out: every id present, no gaps. The coverage census then reconciles end to end — 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 none (15217.00) — and the per-account nets cross-foot to the global proof. A candidate who can narrate that loop — detect, quantify, reconcile, route — is describing the job, not answering a question.",
      tag: "quality",
    },
    {
      id: "barclays-t9",
      q: "The rails stack ships one page: card fold, wire fold, TOTAL row. Why UNION ALL and never UNION — and what does UNION cost you the day it bites?",
      a: "Because the stack is two grains said out loud, and dedupe is a silent row-deleter. The card branch folds 16 movements to 37364.00, the wire branch 11 to 32248.00, and the appended ungrouped branch folds the whole book to 27 and 69612.00 — three rows that must all print even if two of them ever agree. UNION compares whole result rows and collapses exact duplicates: the day both rails post an identical census row — a symmetric book, a mirrored promotion, a coincidence of counts — one rail vanishes from the page and the stack stops summing to 69612.00 with no error anywhere. UNION ALL appends without looking, which is the contract a stack needs. The TOTAL label is part of the same discipline: it is a literal cell downstream consumers match exactly, so it ships in its contract case. And when the job is population diffing rather than stacking — paid versus moved, covered versus uncovered — that is EXCEPT and INTERSECT territory, not UNION. Say which tool for which job: ALL to stack grains, EXCEPT/INTERSECT to diff populations, plain UNION almost never.",
      tag: "setops",
    },
    {
      id: "barclays-t10",
      q: "27 settlement rows cover 22 distinct billings, yet per rail the movement count and the distinct-billing count both read 16 and 11. Reconcile that — and tell me what would break the equality.",
      a: "The two facts are the straddle story told at two grains. Globally, 27 rail hits cover 22 distinct billings because five billings (1, 5, 12, 19, 22) settled in two legs each — 27 rows minus 5 double-covered billings is 22. Per rail, though, each split books exactly ONE card leg and ONE wire leg, so no billing ever carries two rows on the same rail — and COUNT(DISTINCT invoice_id) per rail equals COUNT(*) per rail: 16 and 11, on the nose. The arithmetic that proves the straddle: the sum of the per-rail distinct counts (27) exceeds the global distinct (22) by exactly 5 — the billings that count on BOTH rails. What breaks the equality: any billing settling twice on ONE rail — a duplicated leg, a re-posting — drops that rail's distinct below its movement count, and the coverage census must then fold per billing before it classifies, or the split misfiles. That is why the morning fold prints COUNT(*) beside COUNT(DISTINCT invoice_id) on every rail line: the pair is the grain proof, and a gap between them is the finding.",
      tag: "aggregation",
    },
    {
      id: "barclays-t11",
      q: "You flag billings booked above the book-wide mean. The bar is a scalar subquery — walk me through what it returns per row, and what happens on a staging table where the fold comes back empty.",
      a: "The bar computes once and compares everywhere: (SELECT AVG(amount_cents) FROM invoices) folds the whole book — 86977.00 across 28 billings — into one value, 3106.32, and the WHERE judges every row against it; 12 rows clear the bar carrying 54430.00, 62.6% of the book. The page prints the same fold beside every row as book_avg, because an outlier page that hides its own threshold is unauditable. Now the empty case, which is where the shape earns its keep: a scalar subquery is contractually 0-or-1 rows, and AVG over zero rows returns NULL — not an error, not zero. Every comparison against NULL is UNKNOWN, so booked > NULL filters everything out and the outlier queue ships silently EMPTY on a staging table whose fold found nothing — exactly the filtered population where you most need the queue to be loud. The defensible move: stage the bar from the full book (never the filtered population), or compute it in a CTE and assert it is not NULL before the flag query runs. And never hardcode 3106.32 — the mean moves on every restatement, and a literal is a stale number wearing a query's clothes.",
      tag: "subqueries",
    },
    {
      id: "barclays-t12",
      q: "The status matrix prints settled 0.00 on the paid-unmoved row. Where did that zero come from — and when is a zero in a money column a lie?",
      a: "From an empty-set aggregate, wrapped at the fold's edge. The derived fold LEFT JOINs payments to invoices and computes COALESCE(SUM(p.amount_cents), 0) per billing: for the paid-status billing with no rail rows, SUM sees no rows at all and returns NULL — SUM over the empty set is NULL, never 0 — and the COALESCE reads it as 0.00. That zero is honest here because the class label rides beside it: paid-unmoved means 'status claims settled, no rail ever hit', so 0.00 settled is the finding, displayed. The lie is the mid-pipeline COALESCE that launders 'no data' into 'zero activity' without the label: a void billing's missing settlement and a genuinely settled-zero would print identically, and the coverage census would reconcile while telling you nothing. The policy: keep NULLs through the pipeline — NULL is the honest print for 'no rows' — wrap the aggregate at the fold where the population is defined, and let the classification column carry the semantics. A bare 0.00 without its class is a number that cannot explain itself; in this building that is not a display choice, it is a finding.",
      tag: "nulls",
    },
    {
      id: "barclays-t13",
      q: "Someone joins the activity-legs table into an event-value fold and the money doubles. What happened, how do you prove it in one query, and where should the fold have happened?",
      a: "Fan-out, and the money did not double — it multiplied by the legs-per-event ratio. This book runs 251 activity legs against 103 booked events; join legs into an event fold and each event's value contributes once per leg before SUM ever sees it, so SUM(total) drifts above the true 34833.28 by exactly the fan-out factor. The one-query proof: COUNT(*) beside COUNT(DISTINCT event id) on the joined fold — the pair reads legs against events, and the gap IS the ratio. The structural fix: fold at the grain the question is asked at. Event value is an event-grain question — fold the legs to event grain in a derived table first, or keep the join out entirely; leg mix is a leg-grain question — fold the legs table alone. What you never do is SUM a parent-side money column after joining a child table. The tell that catches it in review: the fold's total must reconcile to a number someone can name — 34833.28 here — and any join-driven drift above it is fan-out until proven otherwise. Prove the grain with counts before you defend the money; the counts are one line and the money argument is a paragraph.",
      tag: "joins",
    },
    {
      id: "barclays-t14",
      q: "First settlement per billing, and the consecutive-day read on the settlement calendar. Which window, what does the first row's NULL mean, and what does the interleave do to id-range arithmetic?",
      a: "LAG with a partition, and the NULL on row one is the answer, not a bug. LAG(paid_on) OVER (PARTITION BY invoice_id ORDER BY paid_on, id) hands each movement its predecessor within its own billing; the billing's FIRST row has no predecessor and reads NULL — that NULL IS the first-settlement flag, so the read is WHERE lag IS NULL, and this book yields exactly 22 first legs for its 22 covered billings. Backfilling that NULL with an issue date or a sentinel manufactures data; filtering it is the query. Calendar density is the same shape without the partition: LAG over day-ordered movements shows 27 movements landing on 26 distinct days — one double-day, 2025-02-10, which carried a card hit and the partial's 4000.00 wire leg. And the interleave kills range arithmetic: journal ids mix accounts (cash spans 2..79, receivables 5..80, operating costs 1..75, revenue 6..78), so MAX(id) - MIN(id) per account spans the whole book and proves nothing about any single book's sequence. Sequence questions on this schema are window questions — partition, order, and read the edges as data.",
      tag: "windows",
    },
    {
      id: "barclays-t15",
      q: "Build the paid-versus-moved population diff. INTERSECT, EXCEPT, NOT IN, anti-join — which do you reach for and what does each do with NULLs?",
      a: "Choose by NULL semantics first, then by whether you need keys or whole rows. EXCEPT returns ids in the first set that are not in the second — status-paid minus rail-covered — and set ops compare tuples with NULL-equality: a NULL id matches a NULL id, so the diff never breaks on a missing key. NOT IN is the poison: one NULL on the inner list makes every membership comparison UNKNOWN, and NOT UNKNOWN is still UNKNOWN, so the entire diff ships empty while looking healthy — the most expensive NULL in the building. The LEFT JOIN + IS NULL anti-join is the NULL-proof classic (it builds the unpaid watchlist — 6 billings, 15217.00 — because the join key IS NULL test is the miss), and it generalizes to row values, not just keys. INTERSECT gives the overlap: the 21 billings that are both status-paid and rail-covered, the settled-clean population. The discipline the interviewer listens for: EXCEPT when you want set semantics on keys, the anti-join when you want the misses with their columns attached, NOT IN only when the inner list is provably NOT NULL — and say that proof out loud, because 'it has never been NULL' is not a proof, it is a forecast.",
      tag: "setops",
    },
    {
      id: "barclays-t16",
      q: "Bucket the settlement calendar by month. Where do teams usually get the key wrong, and what does the wrong key do to this book specifically?",
      a: "The key is SUBSTR(paid_on, 1, 7) or STRFTIME('%Y-%m', paid_on) — year-first, fixed-width, sorts as a calendar because ISO text sorts lexicographically and chronologically at once. The classic wrong key is '%m': this book spans 2024-02 to 2025-02, so '%m' merges the two Februaries into one bucket reading 3 movements and 9506.00 — the close trend invents a February spike, erases a year of shape, and thirteen real months collapse to twelve keys that lie. The year-only key is worse: SUBSTR(paid_on, 1, 4) merges everything into two buckets and the monthly cadence is gone entirely. Secondary traps: ordering by a pretty label instead of the key, and BETWEEN month-end bounds that drop the last evening's settlements — the half-open window [first, next-first) is the only shape that survives timestamps, and the month-end burst is exactly that evening. Last, the key is an interface: downstream consumers match the exact '2025-02' string, so changing its format breaks every consumer that never agreed to the change. Bucket keys are contract cells; pick them once, document them, and never let a dashboard invent its own.",
      tag: "dates",
    },
    {
      id: "barclays-t17",
      q: "You inherit the morning proof checklist. Name the four proofs, what each catches, and the one thing none of them catches.",
      a: "Four proofs, each catching a different disease. One: the trial balance — 181080.00 debits against 181080.00 credits across 80 entries, delta 0 — catches unbalanced postings; a single-sided journal breaks it instantly. Two: the rails cross-foot — card 16 / 37364.00 plus wire 11 / 32248.00 against the cash book's 69612.00 debit fold — catches movements lost or doubled between rail and ledger. Three: the coverage census — 21 exact, 1 partial (4000.00 of 6148.00), 6 none, reconciling to 28 billings — catches settlement state disagreeing with status, the class of break that produced the void-but-settled 925.00 and the paid-but-unmoved 1756.00. Four: the journal sequence — ids 1 through 80 present, no gaps — catches edits and deletions, because the books of record are an ordered journal and a missing id is a finding. What none of them catches: a wrong-but-balanced posting. A debit misclassified into the wrong account folds cleanly, the trial balance still proves, every cross-foot still ties — and only a definition review (is this really an operating cost?) catches it. That is why the audit samples content, not just arithmetic; the proofs are necessary, never sufficient.",
      tag: "quality",
    },
    {
      id: "barclays-t18",
      q: "The audit trail grows tenfold. Which query habits age worst on this schema, and which instincts scale?",
      a: "Sargability first: wrapping the filtered column in a function — STRFTIME('%Y', paid_on) = '2024' — forces a full scan of the journal, while the range shape paid_on >= '2024-01-01' AND paid_on < '2025-01-01' is the same predicate in indexable form. The habit that ages worst is inventing keys in the SELECT and filtering on them; compute bucket keys at ingest, filter on stored columns. Second: SELECT * on the books — the fold needs four columns, the star drags six wide ones across every row, and every downstream consumer re-folds what could have been folded once. Third: correlated re-computation where a CTE computes once — the book-wide mean is one fold over 28 rows, not 28 folds of one row. What scales: fold-at-grain discipline (folded sets stay small no matter how the journal grows), covering indexes on the fold keys, and population statements that let the next engineer reuse the query without re-deriving it. And the honest caveat, said out loud: at 80 entries the engine forgives everything — the reason to build the discipline HERE is that the muscle memory is what survives at 80 million, and the interviewer is checking whether your discipline is internalized or accidental.",
      tag: "performance",
    },
    {
      id: "barclays-t19",
      q: "Walk the engine's execution order against the status matrix query — derived fold, CASE, GROUP BY, HAVING, ORDER BY — and say why each clause sits where it sits.",
      a: "The pipeline explains the layout clause by clause. FROM builds the join grain: invoices LEFT JOIN payments is 33 rows — 27 movement rows plus 6 NULL payloads for the unmoved billings. The derived table's GROUP BY i.id folds to 28 billings, and COALESCE(SUM(p.amount_cents), 0) runs at that fold so unmoved reads 0, not NULL — the fold is where the population is defined, so the zero-policy lives there. The outer SELECT's CASE evaluates per folded row and names four classes; it must sit above the fold because its arms compare paid_cents, which does not exist until the fold computes it. GROUP BY matrix_class then folds 28 rows to 4 classes — grouping on what the CASE named, because the matrix IS the class fold. HAVING COUNT(*) >= 1 judges the folded groups: a keep-every-class guard, a no-op today, a silent row-deleter the day a class thins out — and it cannot live in WHERE, because class counts do not exist pre-fold. ORDER BY billings DESC, settled_usd DESC is display, last, with the second key breaking the three singleton ties deterministically. SQLite tolerates GROUP BY on the alias; the portable habit is grouping on the named expression — but never on status, which re-grains the matrix back to open/paid/void and dissolves the anomaly classes the page exists to show.",
      tag: "pipeline",
    },
    {
      id: "barclays-t20",
      q: "The close pack prints two sixes: the open book at 19609.00 and the unpaid watchlist at 15217.00 — both '6 billings'. Defend the difference to a CFO who thinks one is a typo.",
      a: "Different populations, same count by coincidence — and the overlap is the fastest way to show it. The open book is STATUS-driven: six billings marked open — five with no rail hit, plus #25, the partial (4000.00 of 6148.00), which has a rail hit and therefore is NOT unpaid; it is a shortfall ticket on the aging schedule. The unpaid watchlist is SETTLEMENT-driven: six billings with no rail row — the same five, plus #28, the paid-status billing with 1756.00 booked and nothing settled, the status-versus-settlement break. Five billings sit in both; the sixth differs on each side, which is why the totals differ — 19609.00 against 15217.00 — and why neither number is wrong. The CFO lesson generalizes: a KPI is its denominator, and '6' is not a number until the population statement rides with it. Print the definitions in the pack header, print the overlap (5 billings, the part both numbers agree on), and the typo question never comes back. A candidate who can run this defense from memory has understood that reconciliation is not making numbers match — it is making definitions explicit enough that mismatches explain themselves.",
      tag: "kpi",
    },
    {
      id: "barclays-t21",
      q: "Rails, statuses and invoice numbers arrive as TEXT. Where does text handling bite on this book?",
      a: "Three places, each with its own discipline. Keys: method and status are contract cells — 'card' and 'Card' are different populations, and a GROUP BY that mixes them splits the rail census into rows that each under-count; normalization belongs at ingest, never mid-fold, because a fold re-grains on every distinct string. Slicing: SUBSTR(paid_on, 1, 7) works because ISO timestamps are fixed-width — the day the format grows a timezone suffix, the slice drags garbage into the key, buckets split, and the month trend shatters; parse at the edge into a stored key column instead. Comparison: invoice numbers are TEXT ('INV-0042'), and 'INV-10' sorts before 'INV-9' alphabetically — ordering by a text number is lexical, not numeric, and CAST fixes the sort while losing the leading-zero convention the format exists for. The general rule the interviewer wants: text keys are interfaces. Compare in the native type, normalize once at the boundary, document the format, and never sort a number that is wearing a string — the close pack's consumers match exact cell values, and a case flip is a broken contract that compiles.",
      tag: "text",
    },
    {
      id: "barclays-t22",
      q: "Prove no billing ever settled twice on the SAME rail. Self-join shape — and what does your proof NOT prove?",
      a: "The self-join pairs a billing's movements against each other: FROM payments a JOIN payments b ON a.invoice_id = b.invoice_id AND a.id < b.id — the a.id < b.id kills the self-pair and the mirror pair, so each unordered pair prints once. GROUP BY a.invoice_id HAVING COUNT(*) >= 2 lists the splits: 1, 5, 12, 19, 22, two legs apiece. The proof-completing arm is COUNT(DISTINCT method) = 2 in the HAVING: five rows means every split straddles — one card leg, one wire leg — and no billing on this book doubles up on a single rail; that is the straddle fact the rail audit fold leans on. What it does NOT prove: a billing settled twice on the same DAY across rails — the method test passes, and catching that needs a second arm on the date. Nor does it prove anything about near-duplicates: an exact-match join is blind to a re-posting 0.01 off, a re-posting a day later, or a leg booked to a different billing — pair proofs are equality proofs, and the day the anomaly is a range rather than a match, the queue needs a different query. Say the boundary of your proof before the reviewer finds it; in an audit culture an unqualified 'proven' is itself a finding.",
      tag: "joins",
    },
    {
      id: "barclays-t23",
      q: "The morning census folds five counts in one scan. Compare FILTER (WHERE), SUM(CASE), and five separate queries — which ships and why?",
      a: "One scan, whichever syntax, and the arms must reconcile — that is the non-negotiable. FILTER (WHERE) is the modern shape — COUNT(*) FILTER (WHERE status = 'delivered') — one pass, named arms, readable; SUM(CASE WHEN ... THEN 1 ELSE 0 END) is the portable twin and folds identically. Five separate queries are five scans and, worse, five populations that can drift: someone edits one WHERE and not the others, the census stops reconciling to the whole, and nothing errors — the arms just quietly stop summing to COUNT(*). The reconciliation is the review's first check: 52 + 30 + 14 + 7 = 103 events on the funnel census, 25 + 1 + 1 + 1 = 28 billings on the status matrix — arms that do not sum to the fold are hiding a bucket, and the bucket is usually the anomaly class the page exists to surface. One scan is not a performance vanity here; it is the guarantee that every arm folded the SAME population, which is the only thing that makes the arm totals comparable. Ship FILTER where the engine allows it, SUM(CASE) where portability rules, separate queries never — and print the reconciliation row beside the arms so the reviewer checks one line, not five.",
      tag: "aggregation",
    },
    {
      id: "barclays-t24",
      q: "Two rounding styles on the close pack: ROUND at the end versus ROUND per row. Why does the house standard say once, at the edge — and what breaks otherwise?",
      a: "Rounding is a lossy fold, and folding a fold compounds the loss. On a cents column, per-row ROUND(amount_cents / 100.0, 2) is harmless — cents divide to exact pennies — but the habit generalizes badly: ROUND before an aggregate on any derived rate truncates every row before the fold sees it, and the total drifts below the sum of its own printed parts. The close pack then fails the reconciliation the committee actually runs — the lines no longer add to the total — by an odd cent nobody can attribute, and odd-cent findings are the expensive kind because the arithmetic LOOKS right everywhere. The contract: keep full precision through the pipeline — INTEGER cents in, real division, unrounded aggregates — and ROUND exactly once at the display edge, per printed cell. 28.4 days-to-settle, 3106.32 mean booking, 62.6% outlier share: each rounded once, each re-derivable from the raw fold to the penny. The test the reviewer runs is re-derivation, and a number that cannot be re-derived from the books is not a number — it is a rendering. Round at the edge, document the decimals per cell, and never let a mid-pipeline ROUND make a decision the display layer was supposed to make.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "barclays-mcq-1",
      prompt: "A billing row stores amount_cents = 1521700. Which SELECT prints the booked value the way the close pack shows it — 15217.00?",
      choices: [
        "SELECT amount_cents / 100 AS amount",
        "SELECT amount_cents / 100.0 AS amount",
        "SELECT ROUND(amount_cents) AS amount",
        "SELECT amount_cents * 100.0 AS amount",
      ],
      answer: 1,
      why: "Finance money here is INTEGER cents; the dollar read is amount_cents / 100.0. The .0 promotes the division to real arithmetic — 1521700 / 100.0 prints 15217.0 — while integer 100 truncates odd-cent rows toward zero and leaks half-dollars out of the pack.",
      notes: [
        { choice: 0, why: "1521700 happens to divide evenly, which is exactly why this bug survives review — the next billing at 92550 cents prints 925 instead of 925.50. The unit test that catches it uses an odd-cents row." },
        { choice: 2, why: "ROUND(amount_cents) rounds cents to cents: 1521700. No unit conversion happened at all." },
        { choice: 3, why: "That multiplies to 152,170,000 — cents read as tenths of cents. The direction of the conversion is the whole discipline." },
      ],
      difficulty: "easy",
    },
    {
      id: "barclays-mcq-2",
      prompt: "The unpaid watchlist is billings LEFT JOIN settlements, keeping the misses. Which WHERE returns all 6 unpaid billings (15217.00) and nothing else?",
      choices: [
        "WHERE p.invoice_id IS NULL",
        "WHERE p.invoice_id = NULL",
        "WHERE COUNT(p.invoice_id) = 0",
        "WHERE p.id IS NOT NULL",
      ],
      answer: 0,
      why: "LEFT JOIN hands unmatched billings NULL settlement columns; the canonical miss test is the join key IS NULL — 6 rows, 15217.00. The predicate reads 'no settlement row exists', which is the definition of unpaid.",
      notes: [
        { choice: 1, why: "= NULL is never TRUE — the comparison is UNKNOWN and the watchlist ships empty. NULL is tested with IS, never with =." },
        { choice: 2, why: "COUNT is an aggregate; it cannot run in WHERE at all — wrong clause, wrong layer. Row-level WHERE runs before any fold exists." },
        { choice: 3, why: "IS NOT NULL returns the opposite book: the 22 billings that DID settle. An inverted anti-join looks identical in the editor and opposite in the audit." },
      ],
      difficulty: "medium",
    },
    {
      id: "barclays-mcq-3",
      prompt: "The audit-trail screen folds the ledger per account and keeps accounts with COUNT(*) >= 14. Cash has 27 entries, receivables 26, operating costs 14, revenue 13. What ships — and from which clause?",
      choices: [
        "3 accounts; HAVING — the floor judges folded groups",
        "3 accounts; WHERE — the floor filters entries",
        "4 accounts; HAVING — revenue is a book too",
        "2 accounts; LIMIT — the screen shows the top two",
      ],
      answer: 0,
      why: "'Fourteen-plus entries' is a property of each folded account, so the floor lives in HAVING — and exactly three accounts clear it: 27, 26, 14. The revenue book at 13 entries drops off by the same rule that keeps the others on.",
      notes: [
        { choice: 1, why: "WHERE runs before GROUP BY exists — COUNT(*) is not computable there; the query fails to compile, and if it did not, it would filter entries, not accounts." },
        { choice: 2, why: "13 >= 14 is FALSE. 'Revenue is a book too' is a definition argument — but under the stated floor, the screen has three rows." },
        { choice: 3, why: "LIMIT truncates a result; it does not define a sampling floor. A screen that depends on row order to enforce the floor is a screen that lies after the next insert." },
      ],
      difficulty: "hard",
    },
    {
      id: "barclays-mcq-4",
      prompt: "Billing #1 books 4860.00 and settled across two rails of 2430.00 each. Why does the coverage CASE need SUM(p.amount_cents) = i.amount_cents rather than p.amount_cents = i.amount_cents?",
      choices: [
        "The row-level test compares one rail against the whole booking — neither rail equals 4860.00, so a clean split misfiles as partial",
        "p.amount_cents is NULL for split settlements",
        "The SUM overflows the INTEGER range on split books",
        "They are interchangeable; the engine picks one",
      ],
      answer: 0,
      why: "Coverage is a per-billing definition, but settlement rows arrive per rail: the fold must aggregate the rails (SUM) before comparing to the booked amount. The row-level comparison tests 2430.00 against 4860.00 and files a clean split as partial — and a misfiled partial is a finding the controls committee did not need.",
      notes: [
        { choice: 1, why: "Matched rails carry real amounts — 243000 cents each here. NULLs appear on the no-settlement side of a LEFT JOIN, not on settled rails." },
        { choice: 2, why: "The whole ledger folds to 18108000 cents, nowhere near the 64-bit INTEGER ceiling. Overflow is not a live failure mode at these magnitudes." },
      ],
      difficulty: "medium",
    },
    {
      id: "barclays-mcq-5",
      prompt: "The journal sequence check reads entry ids in order. Which read flags a GAP in the ids — the missing-journal finding?",
      choices: [
        "LAG(id) OVER (ORDER BY id) and compare each id to the prior + 1",
        "LEAD(id) OVER (ORDER BY id) — gaps point forward",
        "COUNT(*) versus COUNT(DISTINCT id)",
        "MAX(id) - MIN(id)",
      ],
      answer: 0,
      why: "LAG hands each row its predecessor in id order; id - LAG(id) > 1 is precisely 'a journal id is missing'. LEAD works too but the comparison direction flips; the count and range reads cannot localize WHERE the gap is.",
      notes: [
        { choice: 1, why: "LEAD is the forward twin — it also detects gaps, but the delta reads negative and the 'previous id' label lies. The flag survives only if the comparison is rewritten to match." },
        { choice: 2, why: "COUNT(*) vs COUNT(DISTINCT id) catches duplicate ids, not missing ones — a different finding with a different owner." },
        { choice: 3, why: "MAX - MIN reports the span, not the holes: ids 1..10 with 5 missing still spans 9. It proves a gap COULD exist, never where." },
      ],
      difficulty: "hard",
    },
    {
      id: "barclays-mcq-6",
      prompt: "Wire settled 32248.00 of the 69612.00 total. Which expression prints the wire share as 46.3?",
      choices: [
        "100.0 * SUM(wire_cents) / SUM(all_cents)",
        "100 * SUM(wire_cents) / SUM(all_cents)",
        "SUM(wire_cents) / SUM(all_cents) * 100",
        "ROUND(SUM(wire_cents) / SUM(all_cents), 3)",
      ],
      answer: 0,
      why: "The 100.0 multiplier forces real arithmetic at the first operation: 100.0 × 32248.0 ÷ 69612.0 = 46.3. Every other option performs an integer division somewhere upstream and truncates before the result can be real.",
      notes: [
        { choice: 1, why: "Integer 100: 3224800 / 69612 = 46 in integer math — the share prints 46 and the committee argues over four-tenths of a point that never existed." },
        { choice: 2, why: "32248 / 69612 in integer math is 0 — the share prints 0.0. Truncation does not care that you multiply later." },
        { choice: 3, why: "The inner division is integer 0; ROUND(0, 3) is still 0. Rounding belongs at the END, after the arithmetic is real." },
      ],
      difficulty: "medium",
    },
    {
      id: "barclays-mcq-7",
      prompt: "The restricted-account screen runs `WHERE holder_id NOT IN (SELECT id from frozen)`. One frozen row carries id = NULL. What ships?",
      choices: [
        "The full book minus NULL holders",
        "An empty result — silently",
        "Only the NULL-holder rows",
        "A type error",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE: the comparison against NULL is UNKNOWN, and NOT UNKNOWN is still UNKNOWN. One NULL empties the entire screen while the query looks healthy — the most expensive NULL in an audit trail. NOT EXISTS or LEFT JOIN + IS NULL is the NULL-proof shape.",
      notes: [
        { choice: 0, why: "NOT IN does not skip NULLs — it poisons the whole membership test. The result is not reduced, it is gone." },
        { choice: 2, why: "NULL holders fail every membership test too. Nothing survives, not even them." },
      ],
      difficulty: "hard",
    },
    {
      id: "barclays-mcq-8",
      prompt: "The settlement calendar runs on TEXT timestamps including '2025-02-28 18:40:11'. Which WHERE returns every February settlement?",
      choices: [
        "WHERE paid_on BETWEEN '2025-02-01' AND '2025-02-28'",
        "WHERE paid_on >= '2025-02-01' AND paid_on < '2025-03-01'",
        "WHERE paid_on >= '2025-02-01' AND paid_on <= '2025-02-28'",
        "WHERE STRFTIME('%m', paid_on) = '2'",
      ],
      answer: 1,
      why: "The half-open interval [Feb 1, Mar 1) admits every February timestamp — '2025-02-28 18:40:11' < '2025-03-01' is TRUE. The month does not end at midnight on the 28th; it ends at March 1, and the month-end settlement burst is exactly that evening.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive both ends: everything after midnight on Feb 28 falls outside the '2025-02-28' bound and vanishes — precisely the burst the close cares about." },
        { choice: 2, why: "Same wall, different syntax: <= '2025-02-28' still drops the evening of the 28th." },
        { choice: 3, why: "STRFTIME('%m') returns '02', not '2' — the comparison is never TRUE and the calendar ships empty. And a bare month key would merge Februaries across years." },
      ],
      difficulty: "hard",
    },
    {
      id: "barclays-mcq-9",
      prompt: "28 booked billings, 27 settlement rows, every settlement on a booked billing, 5 billings carrying 2 settlements each. How many rows does the INNER JOIN return?",
      choices: [
        "27 — one row per settlement",
        "28 — one row per billing",
        "33 — one row per matched or orphaned billing",
        "55 — both tables added",
      ],
      answer: 0,
      why: "The join runs at settlement grain: each of the 27 settlement rows matches exactly one billing, so 27 rows return and the 5 split billings appear twice. Billings without settlements vanish from an INNER fold entirely.",
      notes: [
        { choice: 1, why: "28 is the billing count — reachable from the bare table or as COUNT(DISTINCT i.id) over a LEFT JOIN. The join alone folds nothing back to billing grain." },
        { choice: 2, why: "33 is the LEFT JOIN row count: 27 matched rows plus 6 billings with no settlement (5 open, plus the paid-status one with no rail hit). INNER drops those 6." },
        { choice: 3, why: "55 adds the tables — no SQL fold adds row counts across a join. Row counts multiply by cardinality, they never sum." },
      ],
      difficulty: "easy",
    },
    {
      id: "barclays-mcq-10",
      prompt: "The balance walk shows each journal entry beside the balance BEFORE it. Which window hands each row its predecessor?",
      choices: [
        "LAG(...) OVER (ORDER BY entry_seq)",
        "LEAD(...) OVER (ORDER BY entry_seq)",
        "ROW_NUMBER() OVER (ORDER BY entry_seq)",
        "NTILE(2) OVER (ORDER BY entry_seq)",
      ],
      answer: 0,
      why: "LAG reaches one row BACK in the window's order — the prior balance walks beside the current entry. LEAD points forward; ROW_NUMBER only numbers; NTILE buckets.",
      notes: [
        { choice: 1, why: "LEAD is the forward read — next entry, not previous. A swapped window walks the journal backwards while the column label still says 'prior', and the delta column flips sign." },
        { choice: 2, why: "ROW_NUMBER assigns positions; it never carries a value from another row. You would still need a self-join on the computed number to fetch the prior balance." },
      ],
      difficulty: "easy",
    },
    {
      id: "barclays-mcq-11",
      prompt: "The rails stack appends the same fold ungrouped: card 16 movements / 37364.00, wire 11 / 32248.00, then the TOTAL row. What does TOTAL print?",
      choices: [
        "27 movements / 69612.00",
        "27 movements / 37364.00",
        "2 movements / 69612.00",
        "22 movements / 69612.00",
      ],
      answer: 0,
      why: "The ungrouped branch folds every settlement row at once: COUNT(*) reads 27 and SUM reads 69612.00 — the cross-foot the cash book proves (16 + 11 movements, 37364.00 + 32248.00).",
      notes: [
        { choice: 1, why: "27 is the right count, but re-printing card's 37364.00 as the total is the bug: the TOTAL branch has no GROUP BY, so the fold covers the whole book, not one rail." },
        { choice: 2, why: "2 would count rails, not movements — the TOTAL branch aggregates rows, and there are 27 of them." },
        { choice: 3, why: "22 is the distinct-billing count (the straddle arithmetic), not the movement count — two grains, and the TOTAL prints the movement grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "barclays-mcq-12",
      prompt: "27 settlement rows hit the book and five billings settled in two legs each. What does COUNT(DISTINCT invoice_id) read over all payments?",
      choices: ["27", "22", "5", "33"],
      answer: 1,
      why: "Five billings carry two rows each, so distinct billings = 27 - 5 = 22 — the straddle arithmetic that makes rail-side hits (27) exceed covered billings (22) by exactly the split count.",
      notes: [
        { choice: 0, why: "27 is the row count — COUNT(*) grain. DISTINCT is the entire point of this fold." },
        { choice: 2, why: "5 is the split count itself, not what remains after de-duplicating their second legs." },
        { choice: 3, why: "33 is a LEFT JOIN row count (27 matched + 6 unmoved billings) — a population that never entered this fold." },
      ],
      difficulty: "easy",
    },
    {
      id: "barclays-mcq-13",
      prompt: "The op-cost stack folds expenses per category, then appends the ungrouped TOTAL branch. Which line tops the fold, and what does TOTAL print?",
      choices: [
        "Rent 14 / 16800.00; TOTAL 36 / 25416.00",
        "Ads 14 / 4570.00; TOTAL 36 / 25416.00",
        "Rent 14 / 16800.00; TOTAL 14 / 16800.00",
        "Travel 3 / 2521.00; TOTAL 25416.00 / 25416.00",
      ],
      answer: 0,
      why: "Rent folds 14 lines to 16800.00 — 66.1% of the cost book — and the appended branch folds ALL 36 lines ungrouped: 36 / 25416.00, tying exactly to the operating_expenses ledger book.",
      notes: [
        { choice: 1, why: "Ads is the second line at 4570.00 — the fold is dollar-ranked and Rent's 16800.00 leads it." },
        { choice: 2, why: "14 / 16800.00 re-prints Rent's own fold as the total — the TOTAL branch is ungrouped, so it sees all 36 lines, not one category's." },
        { choice: 3, why: "The stack prints a count and a sum; 25416.00 / 25416.00 is a made-up shape, and the count cell is 36." },
      ],
      difficulty: "easy",
    },
    {
      id: "barclays-mcq-14",
      prompt: "The outlier queue flags billings above the book-wide mean (3106.32 today). Which WHERE is still defensible the day the book restates?",
      choices: [
        "WHERE amount_cents > 310632",
        "WHERE amount_cents > (SELECT AVG(amount_cents) FROM invoices)",
        "WHERE amount_cents > AVG(amount_cents)",
        "WHERE AVG(amount_cents) > amount_cents",
      ],
      answer: 1,
      why: "The mean moves on every restatement, so the bar is a scalar subquery that recomputes it from the book. The literal matches today and silently drifts tomorrow — a stale number wearing a query's clothes.",
      notes: [
        { choice: 0, why: "310632 cents is today's mean exactly, and today the boundary is clean (no billing between 3105 and 3107 dollars) — but the literal ages on the first new billing and nothing errors when it does." },
        { choice: 2, why: "AVG is an aggregate; it cannot run in WHERE — the engine refuses the query because the fold does not exist at filter time." },
        { choice: 3, why: "Reversed comparison AND a bare aggregate — two errors stacked; even compiled, it would flag the BELOW-mean rows, the opposite queue." },
      ],
      difficulty: "medium",
    },
    {
      id: "barclays-mcq-15",
      prompt: "The status matrix folds 28 billings into four classes via CASE. Which GROUP BY produces the matrix page?",
      choices: ["GROUP BY matrix_class", "GROUP BY status", "GROUP BY paid_cents", "GROUP BY i.id"],
      answer: 0,
      why: "The matrix IS the class fold: GROUP BY the CASE's alias (SQLite honors it) collapses 28 folded billings to 4 classes that reconcile — 25 + 1 + 1 + 1 = 28.",
      notes: [
        { choice: 1, why: "GROUP BY status re-grains the page to open/paid/void — 3 rows of 6/21/1 — and every anomaly class the memo asked for dissolves." },
        { choice: 2, why: "paid_cents is nearly unique per billing — the fold explodes back toward 28 rows and the census becomes a list." },
        { choice: 3, why: "i.id does not exist in the outer scope (the derived table is aliased f) — and folding per billing is the inner fold's job, already done." },
      ],
      difficulty: "medium",
    },
    {
      id: "barclays-mcq-16",
      prompt: "The rail audit fold parks its HAVING floor at 11 — the wire movement count (card folds to 16). What does a floor of 12 do, and what does 10 do?",
      choices: [
        "12 drops wire from the page; 10 keeps both rails",
        "12 keeps both rails; 10 drops wire",
        "12 drops card; 10 drops both",
        "Both floors keep both rails",
      ],
      answer: 0,
      why: "The floor judges folded groups: card 16 >= 12 stays, wire 11 >= 12 falls off — silently, while card still prints. A floor parked AT the smaller group (11) is the keep-both guard; 10 is a no-op below it.",
      notes: [
        { choice: 1, why: "Backwards — 12 sits above wire's 11, so wire is the row that dies; 10 is below both groups and deletes nothing." },
        { choice: 2, why: "Card has 16 movements; no floor at 12 comes near it. The floor only ever threatens the smaller group first." },
        { choice: 3, why: "11 >= 12 is FALSE — the floor is a group judgment, and wire fails it while card passes." },
      ],
      difficulty: "medium",
    },
    {
      id: "barclays-mcq-17",
      prompt: "The matrix's paid-unmoved row prints settled 0.00, not NULL. Which expression produced the honest zero?",
      choices: [
        "COALESCE(SUM(p.amount_cents), 0)",
        "SUM(COALESCE(p.amount_cents, 0))",
        "SUM(p.amount_cents)",
        "IFNULL(SUM(p.amount_cents), 'none')",
      ],
      answer: 0,
      why: "SUM over no settlement rows returns NULL, and the COALESCE sits OUTSIDE the aggregate at the fold's edge — the unmoved billing reads 0.00, honest because the class label 'paid-unmoved' carries the meaning beside it.",
      notes: [
        { choice: 1, why: "COALESCE inside SUM is a no-op on this fold — SUM skips NULLs anyway. It changes nothing, which makes it decoration, not policy." },
        { choice: 2, why: "Bare SUM prints NULL — a blank cell where the close pack expects a number, and the reviewer reads it as a broken query, not a finding." },
        { choice: 3, why: "'none' is a string in a money column — type drift every downstream consumer of the pack chokes on. Zero or NULL, never prose." },
      ],
      difficulty: "medium",
    },
    {
      id: "barclays-mcq-18",
      prompt: "LAG(paid_on) OVER (PARTITION BY invoice_id ORDER BY paid_on) runs over the settlement journal. The first movement of every billing reads NULL. What is that NULL?",
      choices: [
        "A data error — backfill it with the billing's issue date",
        "The first-settlement flag — filter IS NULL to find each billing's first leg",
        "A frame artifact — switch to ROWS and it disappears",
        "Proof the partition is wrong — drop PARTITION BY",
      ],
      answer: 1,
      why: "LAG has no predecessor on a partition's first row, and that NULL IS the signal: WHERE lag IS NULL returns each billing's first settlement — 22 covered billings, 22 first legs, the sequence read the desk ships.",
      notes: [
        { choice: 0, why: "Backfilling fabricates a settlement that never happened — the void-but-settled class of lie, manufactured by hand." },
        { choice: 2, why: "The frame governs which peers aggregate into sums; LAG is a row-to-row read and its first-row NULL is definitional in every frame." },
        { choice: 3, why: "Dropping PARTITION BY makes LAG read ACROSS billings — the 'previous settlement' becomes some other billing's, and only the journal's very first row keeps the flag." },
      ],
      difficulty: "hard",
    },
    {
      id: "barclays-mcq-19",
      prompt: "The rails stack mandates UNION ALL. The day card and wire both fold to identical census rows, what does plain UNION do?",
      choices: [
        "Same page — UNION is the safer choice",
        "Deletes one rail row silently",
        "Errors on the duplicate row",
        "Prints the duplicate twice",
      ],
      answer: 1,
      why: "UNION dedupes whole result rows: two identical (rail, movements, dollars) rows collapse to one, the stack stops summing to 27 / 69612.00, and nothing errors — the page just quietly loses a rail. ALL is mandated because both grains must print even when they agree.",
      notes: [
        { choice: 0, why: "'Safer' is the trap — UNION's dedupe is a row-deleter wearing a safety badge. On today's book (16/37364.00 vs 11/32248.00) it happens to pass, which is exactly how it ships." },
        { choice: 2, why: "Duplicates are the one thing UNION never errors on — dedupe IS its job; the failure mode is silence." },
        { choice: 3, why: "That is UNION ALL's behavior — append without looking. Plain UNION collapses the pair to one row." },
      ],
      difficulty: "hard",
    },
    {
      id: "barclays-mcq-20",
      prompt: "The outlier page prints book_avg 3106.32. Which expression is the house shape, and what do the others print?",
      choices: [
        "ROUND(AVG(amount_cents) / 100.0, 2) — prints 3106.32",
        "ROUND(AVG(amount_cents) / 100.0, 0) — prints 3106",
        "AVG(ROUND(amount_cents / 100.0, 2)) — prints 3106.3214…",
        "ROUND(AVG(amount_cents), 2) / 100 — prints 31.0632",
      ],
      answer: 0,
      why: "Full precision through the fold (86977.00 across 28 billings), one ROUND at the display edge: 3106.32. Rounding is a display contract — applied once, per printed cell, re-derivable from the raw fold.",
      notes: [
        { choice: 1, why: "3106 is a different page than the one the pack defines — the committee argues over the 32 cents that vanished from the printed bar." },
        { choice: 2, why: "Rounding per row then averaging is a fold of a fold — harmless here because cents divide exactly, and the day it doesn't, the total drifts below its parts." },
        { choice: 3, why: "Rounds in CENTS then divides — the decimal lands two places off and the bar prints 31.06, wrong by a factor the eye forgives." },
      ],
      difficulty: "hard",
    },
    {
      id: "barclays-mcq-21",
      prompt: "27 settlement movements land on 26 distinct paid_on days. What does the gap of one mean?",
      choices: [
        "A movement is missing from the journal",
        "One day carried two movements — 2025-02-10, a card hit and the partial's wire leg",
        "The calendar has a timezone bug",
        "COUNT(DISTINCT) skipped a NULL",
      ],
      answer: 1,
      why: "COUNT(*) = 27 rows, COUNT(DISTINCT paid_on) = 26 keys — the gap IS the double-booking: 2025-02-10 hosted a 3076.00 card hit beside the 4000.00 wire leg of the partial (#25).",
      notes: [
        { choice: 0, why: "Nothing is missing — the two counts measure different things: rows versus distinct keys. The gap is the finding, not a loss." },
        { choice: 2, why: "The timestamps are clean fixed-width ISO text; the arithmetic is exact and no conversion is involved." },
        { choice: 3, why: "paid_on is NOT NULL on every settlement row — the NULL-skip is real engine behavior but has nothing to do with this gap." },
      ],
      difficulty: "easy",
    },
    {
      id: "barclays-mcq-22",
      prompt: "The op-cost stack's grand row is labeled by a literal. Which literal — and why does case matter?",
      choices: [
        "'TOTAL' — the exact-case contract every consumer matches",
        "'total' — lowercase reads better on the page",
        "'Total' — title case is the house standard",
        "'ALL' — it means every category",
      ],
      answer: 0,
      why: "Labels are contract cells, like statuses: downstream filters match 'TOTAL' exactly, and any other spelling passes the eye while breaking every string match. The stack's grammar expects the literal too.",
      notes: [
        { choice: 1, why: "Looks identical to a human, and the consumer matching 'TOTAL' now finds nothing — the most expensive kind of cosmetic edit." },
        { choice: 2, why: "Same failure, different spelling — case is part of the contract, not a style choice." },
        { choice: 3, why: "'ALL' is a different label entirely; both the consumers and the audit grammar expect TOTAL." },
      ],
      difficulty: "easy",
    },
    {
      id: "barclays-mcq-23",
      prompt: "The split list reads 1, 5, 12, 19, 22 — two legs each. Which HAVING arm proves no billing settled twice on the SAME rail?",
      choices: [
        "HAVING COUNT(*) >= 2 AND COUNT(DISTINCT method) = 2",
        "HAVING COUNT(*) >= 2",
        "HAVING COUNT(DISTINCT method) >= 1",
        "HAVING MAX(amount_cents) > MIN(amount_cents)",
      ],
      answer: 0,
      why: "Two legs riding two DISTINCT methods means the split straddles card and wire — five such billings and the 'never twice on one rail' claim is proven for the whole book, one scan.",
      notes: [
        { choice: 1, why: "Finds the splits but not their rail shape — a same-rail double would pass this arm and the proof would be false while looking complete." },
        { choice: 2, why: "Every settled billing passes — the arm proves nothing about pairing at all." },
        { choice: 3, why: "Unequal legs is the partial's shape, not the straddle's — and the five splits here have equal legs anyway." },
      ],
      difficulty: "easy",
    },
    {
      id: "barclays-mcq-24",
      prompt: "An event-value fold joins the legs table (251 legs over 103 events) and the money inflates. Which pair of numbers proves fan-out in one query?",
      choices: [
        "COUNT(*) beside COUNT(DISTINCT event id) on the joined fold",
        "MIN beside MAX of the money column",
        "COUNT(*) before and after the join, in two queries",
        "AVG beside SUM of the money column",
      ],
      answer: 0,
      why: "On the joined fold COUNT(*) reads legs (251) while COUNT(DISTINCT o.id) reads events (103) — the gap IS the fan-out ratio, the same ratio that inflated SUM(total) above 34833.28.",
      notes: [
        { choice: 1, why: "Min/max show spread, not duplication — a fan-out can leave both extremes untouched while the total drifts." },
        { choice: 2, why: "Two queries get edited separately and drift; the one-scan pair is the proof that survives review." },
        { choice: 3, why: "AVG moves for many reasons — without the count pair the inflation has no fingerprint." },
      ],
      difficulty: "medium",
    },
    {
      id: "barclays-mcq-25",
      prompt: "The settlement calendar spans 2024-02 to 2025-02. Which bucket key merges the two Februaries, and what does the merged bucket read?",
      choices: [
        "STRFTIME('%m', paid_on) — 3 movements / 9506.00",
        "STRFTIME('%Y-%m', paid_on) — 3 movements / 9506.00",
        "STRFTIME('%m', paid_on) — 1 movement / 2430.00",
        "SUBSTR(paid_on, 1, 4) — 3 movements / 9506.00",
      ],
      answer: 0,
      why: "'%m' is month-only: '02' collects 2024-02's single 2430.00 movement and 2025-02's two (7076.00) into one bucket — 3 movements, 9506.00 — inventing a February spike while erasing a year of trend.",
      notes: [
        { choice: 1, why: "Year-first '%Y-%m' is the CORRECT key — 2024-02 and 2025-02 stay separate buckets (1 / 2430.00 and 2 / 7076.00), and the numbers quoted are the merged lie." },
        { choice: 2, why: "1 / 2430.00 is 2024-02 alone — what the correct key prints for that month, not the merged bucket." },
        { choice: 3, why: "SUBSTR(…, 1, 4) is the YEAR key — both Februaries merge with every other same-year month; 13 buckets collapse to 2 and the monthly cadence is gone." },
      ],
      difficulty: "medium",
    },
    {
      id: "barclays-mcq-26",
      prompt: "The op-cost stack orders by cost_usd DESC. Why does TOTAL land on top, and what does ASC do?",
      choices: [
        "25416.00 is the largest cell on the page, so DESC leads with it; ASC buries the total at the foot",
        "UNION ALL sorts literal labels first; ASC reverses that",
        "TOTAL sorts first alphabetically; ASC is identical",
        "LIMIT 5 forces TOTAL to the top either way",
      ],
      answer: 0,
      why: "The grand fold (25416.00) outranks every category line — Rent's 16800.00 is the largest single line — so DESC reads TOTAL, Rent, Ads, Travel, Tools; ASC prints the same five rows foot-first with the total last.",
      notes: [
        { choice: 1, why: "UNION ALL guarantees no dedupe, not an order — ordering is entirely ORDER BY's job." },
        { choice: 2, why: "Alphabetical reads Ads, Rent, TOTAL, Tools, Travel — the uppercase literal lands MID-stack in BINARY order, not first." },
        { choice: 3, why: "LIMIT caps rows, never orders them — the cap is 5 and all five rows survive it." },
      ],
      difficulty: "medium",
    },
    {
      id: "barclays-mcq-27",
      prompt: "The outlier page orders by booked DESC, i.id. What does the i.id tiebreak buy?",
      choices: [
        "Deterministic order if two billings ever book the same value — auditors re-run queries",
        "Faster sorting on the id index",
        "It dedupes the 12 rows",
        "It promotes open billings above paid ones",
      ],
      answer: 0,
      why: "Equal booked values order arbitrarily without a second key; the id tiebreak makes the page byte-stable across re-runs — the property an audit copy-and-paste depends on. Today's 12 rows have distinct values, so the tiebreak is dormant insurance.",
      notes: [
        { choice: 1, why: "The id key is cheap, but the REASON is determinism, not speed — a sort key is a correctness decision." },
        { choice: 2, why: "Ordering dedupes nothing — DISTINCT is a different clause entirely." },
        { choice: 3, why: "Status is not in the ORDER BY at all; the tiebreak only fires on equal booked values." },
      ],
      difficulty: "medium",
    },
    {
      id: "barclays-mcq-28",
      prompt: "Build the paid-versus-moved population diff. Which tool treats NULLs as EQUAL — and why does that settle the choice?",
      choices: [
        "EXCEPT — set ops compare tuples with NULL-equality, so a missing key never breaks the diff",
        "NOT IN — it skips NULLs by design",
        "LEFT JOIN + IS NULL — only joins handle NULLs at all",
        "INTERSECT — it inverts NULL comparisons",
      ],
      answer: 0,
      why: "EXCEPT (status-paid ids EXCEPT rail-covered ids) runs on set semantics where NULL = NULL inside the comparison, so the diff is safe on messy keys. NOT IN with one NULL on the inner list makes every comparison UNKNOWN and ships an empty screen.",
      notes: [
        { choice: 1, why: "NOT IN does not skip NULLs — it is the poison. One NULL id on the paid list and the diff returns nothing while looking healthy." },
        { choice: 2, why: "The anti-join is the NULL-proof classic and builds the unpaid watchlist (6 / 15217.00) — but the tool that makes NULLs EQUAL is set-op semantics, and the question asked for exactly that." },
        { choice: 3, why: "INTERSECT finds the overlap — the 21 billings both paid and covered — not the difference." },
      ],
      difficulty: "hard",
    },
    {
      id: "barclays-mcq-29",
      prompt: "The one-scan status matrix must reconcile: its arms print 25, 1, 1, 1 billings. Which invariant does the reviewer check first — and what breaks it?",
      choices: [
        "Arms sum to the fold's COUNT(*): 25 + 1 + 1 + 1 = 28 — an ELSE-less CASE or a hidden WHERE breaks it",
        "Each arm prints a distinct dollar value",
        "The classes sort alphabetically",
        "COUNT(*) equals SUM(paid_cents)",
      ],
      answer: 0,
      why: "A census is exhaustive or it is wrong: the four arms must fold the same 28 rows the fold counted, which only holds when the CASE is exhaustive (the ELSE catches the residual class) and no arm silently re-filters the population.",
      notes: [
        { choice: 1, why: "Dollar values distinguish classes but reconcile nothing — clean's 64687.00 and void-settled's 925.00 are different magnitudes by design." },
        { choice: 2, why: "Sort order is display; the invariant is arithmetic." },
        { choice: 3, why: "Count vs sum is a units error — 28 rows never equals 69612.00 dollars; the real check is class counts against the fold's COUNT(*)." },
      ],
      difficulty: "hard",
    },
    {
      id: "barclays-mcq-30",
      prompt: "The close pack prints '6 billings' twice: the open book at 19609.00 and the unpaid watchlist at 15217.00. What distinguishes the two populations?",
      choices: [
        "Both are settlement-driven; the totals differ by rounding",
        "Open is status-driven: 5 never-settled plus the #25 partial; unpaid is settlement-driven: the same 5 plus the #28 paid-status break — overlap 5",
        "Open counts #28; unpaid counts #25",
        "The unpaid list excludes open billings entirely",
      ],
      answer: 1,
      why: "Two definitions, coincidentally both 6: the open book is status-open (5 with no rail plus #25, whose 4000.00 partial keeps it OFF the unpaid list), the unpaid watchlist is no-rail (the same 5 plus #28, paid-status with 1756.00 booked and nothing settled). #25 is a shortfall ticket; #28 is the break.",
      notes: [
        { choice: 0, why: "No rounding involved — cents are exact. The difference is definitional, and the pack prints both definitions in the header for exactly this question." },
        { choice: 2, why: "Backwards — #28 has no rail (unpaid only); #25 has a rail hit (open book only, because partial is not unpaid)." },
        { choice: 3, why: "Five open billings ARE on the unpaid list — the populations overlap on 5 of 6; only the sixth differs on each side." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-barc-1",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The unpaid-book worklist",
      brief:
        "Barclays-flavored memo on the storefront db: the close does not sign until the {rose:unpaid book} is walked — billings with no settlement row, quantified and owned. Probed facts: the anti-join returns **6 billings carrying 15217.00**; five are genuinely open, and one — **#28** — carries PAID status with zero settlement rows (1756.00 booked), the status-versus-settlement break the audit trail exists to catch. Contrast: the open book reads 6 / 19609.00, but #25's partial cover (4000.00 against 6148.00) keeps it OFF this worklist — a partial is a shortfall ticket, not an unpaid. The desk works biggest booked value first, and the paid-status break is the row the review will ask about.",
      ask: "Return the unpaid book: billing id, status and booked value in dollars (2 decimals), biggest booked first — the LEFT-join miss test included.",
      template:
        "SELECT i.id,\n       i.status,\n       ROUND(i.amount_cents / {1}, 2) AS booked\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.{2}\nWHERE p.{3} IS NULL\nORDER BY booked {4};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-dollars divisor",
          why: "Billing money is stored as INTEGER cents, so the dollar read is amount_cents / 100.0. The .0 forces real division — integer 100 would truncate odd-cent billings toward zero and leak half-dollars onto the worklist.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the billing-side join key",
          why: "p.invoice_id = i.id is the reconciliation join: each rail hit attaches to its booked billing and the misses keep NULL rail columns. Joining on the TEXT number column matches nothing and the worklist goes to 28 rows — every billing 'unpaid', which is how a control degrades into noise.",
        },
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the miss test column",
          why: "WHERE p.invoice_id IS NULL is the canonical anti-join: NULL appears exactly when no settlement row matched. Swapping in a comparison operator (= NULL) is never TRUE and the unpaid book ships empty — the silent failure the review fears.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The desk works the largest exposure first — the biggest unpaid book sits on top. ASC buries the big book at the bottom of the queue and the close signs against a worklist nobody read in order.",
        },
      ],
      distractors: ["= NULL", "ASC", "number", "10.0"],
      walkthrough:
        "The unpaid book is the anti-join, and every clause is a control. The LEFT JOIN attaches each of the 27 settlement rows to its booked billing and leaves the 6 no-rail billings with NULL settlement columns; WHERE p.invoice_id IS NULL keeps exactly the misses — 6 rows totalling 15217.00, which the close pack prints as the unpaid exposure. Read the status column before the walk: five rows are open, and one — #28 — is PAID with no rail hit, 1756.00 booked; that row is the break, and it is ON this list precisely because settlement presence, not status, defines unpaid. The partial on #25 (4000.00 of 6148.00) is deliberately absent: it has a settlement row, so the anti-join misses it, and shortfall tickets run on a different queue. The cents rule holds in the display column: integer cents in, /100.0 with the .0, ROUND once, biggest first. Swap the miss test for '= NULL' and the worklist ships empty — an audit finding that looks like a clean book, which is the single most expensive failure mode in this building.",
    },
    {
      id: "cs-barc-2",
      tier: "easy",
      topic: "l8",
      universe: "month-close",
      title: "The audit-trail activity screen",
      brief:
        "Barclays-flavored memo on the storefront db: the {emerald:controls committee} samples the books of record by activity — every ledger account folded to its journal-entry count, screened against the activity floor, biggest trail first. Probed facts: the ledger holds 80 entries across four accounts — cash **27** entries (69612.00 debit-side fold), accounts_receivable **26** (86052.00), operating_expenses **14** (25416.00), sales_revenue **13** (0.00 — a credit-only book). The activity floor for this sample is **14 entries**: trails at or above it are sampled, thinner trails are findings. The floor value itself is verifiable — it is exactly the operating-costs count on the folded trail.",
      ask: "Return the sampled accounts: account, journal-entry count and debit-side fold in dollars (2 decimals), biggest trail first — screened at the activity floor.",
      template:
        "SELECT {1},\n       COUNT(*) AS entries,\n       ROUND(SUM(debit_cents) / 100.0, 2) AS debits\nFROM ledger_entries\nGROUP BY account\nHAVING COUNT(*) >= {2}\nORDER BY entries {3};",
      slots: [
        {
          answer: "account",
          kind: "keyword",
          label: "the fold axis",
          why: "GROUP BY account folds the journal to one row per book — cash, receivables, operating costs, revenue. Folding on a money column would shred the books into per-value rows and the sample would screen nothing.",
        },
        {
          answer: "14",
          kind: "number",
          label: "the activity floor",
          why: "The sample keeps accounts with 14 or more journal entries — and 14 is verifiably on the trail: the operating-costs book folds to exactly 14 entries. 15 would drop it; 13 would drag the credit-only revenue book in as a false positive.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-trail-first direction",
          why: "The committee reads thickest trails first: cash 27 entries on top. ASC opens the sample with the thinnest book — a correct fold pointed at the wrong end of the review.",
        },
      ],
      distractors: ["15", "13", "debit_cents", "ASC"],
      walkthrough:
        "The screen is a fold, a floor and an order — one table, no join, and the audit value is in what the floor excludes. GROUP BY account collapses 80 journal entries to four books; COUNT(*) prices each trail — cash 27, receivables 26, operating costs 14, revenue 13 — and SUM(debit_cents)/100.0 prices the debit side: 69612.00, 86052.00, 25416.00, and 0.00 for the credit-only revenue book. HAVING COUNT(*) >= 14 is the sampling floor, and it is a group-level judgment — COUNT does not exist before the fold, so the floor cannot live in WHERE. The floor's arithmetic is the review's first question: 14 keeps three books and drops revenue at 13, which is correct — a credit-only book with 0.00 on the debit side is sampled by a different control, not this one. Lower the floor to 13 and the sample ships a false positive; raise it to 15 and operating costs fall off the trail the committee reads. ORDER BY entries DESC reads the sample thickest-first, because activity is what the trail is sampled FOR. Note what this single-table shape cannot do: it cannot join the trails to the rail census or the unpaid book — those are separate screens, each with its own population statement, because in an audit culture a number that explains what it excluded is the only number that ships.",
    },
    {
      id: "cs-barc-3",
      tier: "medium",
      topic: "j7",
      universe: "month-close",
      title: "The rail audit fold: movements and dollars per rail",
      brief:
        "Barclays-flavored memo on the storefront db: before the close pack assembles, the rail census gets its audit fold — every settlement movement attributed to its rail, folded with the billing count it actually covered. Probed facts: **card 16 movements covering 16 distinct billings for 37364.00**; wire 11 covering 11 for 32248.00 — and the equality is not a coincidence: the five split billings (1, 5, 12, 19, 22) each ride ONE card leg and ONE wire leg, so no billing ever doubles up on a single rail. Globally the 27 rail hits cover 22 distinct billings; the {rose:straddle gap of 5} is the split count. The void-settled 925.00 rode card; the partial's 4000.00 rode wire — the rail column routes the anomaly follow-ups. The fold's floor parks at the smaller rail so both survive the page.",
      ask: "Return the rail audit fold: rail, movement count, distinct billings covered and settled dollars (2 decimals), biggest rail first, both rails kept.",
      template:
        "SELECT p.method AS rail,\n       COUNT(*) AS movements,\n       COUNT(DISTINCT p.invoice_id) AS billings,\n       ROUND(SUM(p.{1}) / 100.0, 2) AS settled_usd\nFROM payments p\nJOIN invoices i ON i.{2} = p.invoice_id\nGROUP BY p.method\nHAVING COUNT(*) >= {3}\nORDER BY settled_usd {4};",
      slots: [
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the settled-money column",
          why: "SUM(p.amount_cents) prices the rail — INTEGER cents folded once and read through /100.0. method is TEXT: SQLite coerces it to 0.0 inside SUM and both rails print free; summing keys instead of money folds primary-key noise into the pack.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the billing-side join key",
          why: "i.id = p.invoice_id is the reconciliation join: each rail hit attaches to its booked billing. i.invoice_id does not exist on invoices (the miss test would error), and joining i.status to a numeric id matches nothing — an empty fold that looks like a clean book.",
        },
        {
          answer: "11",
          kind: "number",
          label: "the keep-both-rails floor",
          why: "The floor parks AT the smaller rail — wire folds to 11 movements, a verified cell on this page — so both rails survive. 12 silently deletes wire while card still prints, and a one-rail page stops cross-footing to 69612.00.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-rail-first direction",
          why: "The desk reads the bigger book first: card 37364.00 on top, wire 32248.00 under it. ASC opens the page with the smaller rail — a correct fold pointed at the wrong end of the review.",
        },
      ],
      distractors: ["method", "status", "12", "ASC"],
      walkthrough:
        "The rail audit fold is join, fold, floor, order — and every clause carries a control. The INNER JOIN attaches each of the 27 settlement rows to its booked billing (every hit lands on a real billing, so INNER and LEFT agree here — and the analyst says why). GROUP BY p.method folds to two rails: card 16 movements / 16 distinct billings / 37364.00, wire 11 / 11 / 32248.00. The equality of counts and distincts is the straddle fact: the five splits (1, 5, 12, 19, 22) each book one card leg and one wire leg, so no billing doubles up on ONE rail — while globally 27 hits cover 22 billings, the gap of 5 being the splits that count on BOTH rails. SUM(p.amount_cents) / 100.0 prices the fold in dollars, rounded once. HAVING COUNT(*) >= 11 parks the floor at the smaller rail — a keep-both guard, a silent row-deleter the day either rail thins. ORDER BY settled_usd DESC leads with card. The distractors fail exactly where the craft lives: method in the money column is TEXT coerced to 0.0 and both rails print free; method in the floor turns the HAVING into a text comparison and the page ships empty; status in the join key matches text to integers and ships an empty fold; a floor of 12 deletes wire and the page stops reconciling to 69612.00; ASC inverts the read.",
    },
    {
      id: "cs-barc-4",
      tier: "medium",
      topic: "s6",
      universe: "refund-audit",
      title: "The settlement-status matrix: four classes, one scan",
      brief:
        "Audit memo on the storefront db: the coverage census (21 exact / 1 partial / 6 none) answers 'did the rail cover the booking'; the status matrix answers the sharper question — 'where do status and settlement DISAGREE'. One derived fold per billing (LEFT JOIN, COALESCE'd paid fold), one CASE, four classes: **clean 25 billings carrying 64687.00 settled**, {rose:void-settled} 1 at 925.00 (the void that moved money), {rose:paid-unmoved} 1 at 0.00 against 1756.00 booked, {amber:open-partial} 1 at 4000.00 of 6148.00. The reconciliation is the proof: 25 + 1 + 1 + 1 = 28 billings and 64687.00 + 925.00 + 0.00 + 4000.00 = 69612.00 — every movement the rails carried, classified in one pass. The floor keeps every class that exists on the page.",
      ask: "Return the matrix: class label, billing count and settled dollars (2 decimals), biggest class first, ties broken by settled dollars.",
      template:
        "SELECT CASE\n         WHEN f.status = {1} AND f.paid_cents > 0 THEN 'void-settled'\n         WHEN f.status = 'paid' AND f.paid_cents = 0 THEN {2}\n         WHEN f.status = 'open' AND f.paid_cents > 0 THEN {3}\n         ELSE {4}\n       END AS matrix_class,\n       COUNT(*) AS billings,\n       ROUND(SUM(f.paid_cents) / 100.0, 2) AS settled_usd\nFROM (\n  SELECT i.id, i.status, i.amount_cents,\n         COALESCE(SUM(p.amount_cents), 0) AS paid_cents\n  FROM invoices i\n  LEFT JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n) f\nGROUP BY {5}\nHAVING COUNT(*) >= {6}\nORDER BY billings DESC, settled_usd DESC;",
      slots: [
        {
          answer: "'void'",
          kind: "keyword",
          label: "the dead-status arm",
          why: "Void means dead: ANY settled cash against a void billing is the finding (#11, 925.00 on card). 'open' in this arm would misfile #25's partial as the anomaly and let the real break print clean.",
        },
        {
          answer: "'paid-unmoved'",
          kind: "keyword",
          label: "the status-vs-settlement label",
          why: "The paid-status billing with zero rail rows (#28, 1756.00 booked) is the class the close exists to catch — status says settled, the spine says nothing. The label names the disagreement, not the status.",
        },
        {
          answer: "'open-partial'",
          kind: "keyword",
          label: "the shortfall class",
          why: "An open billing with SOME cash is a shortfall ticket (#25, 4000.00 of 6148.00) — aging-schedule work, not unpaid-book work, because it HAS a rail hit.",
        },
        {
          answer: "'clean'",
          kind: "keyword",
          label: "the residual class",
          why: "ELSE must be the exhaustive residual: 20 paid-exact billings plus the 5 open-no-rail ones = 25 rows carrying 64687.00. A re-test instead of ELSE risks rows no arm catches — silently dropped from a census that must sum to 28.",
        },
        {
          answer: "matrix_class",
          kind: "keyword",
          label: "the class fold key",
          why: "GROUP BY the CASE's alias folds 28 billings to 4 classes (SQLite honors the alias). GROUP BY status re-grains to open/paid/void and dissolves the anomaly classes; GROUP BY f.id explodes the page back to one row per billing.",
        },
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the keep-every-class floor",
          why: "HAVING COUNT(*) >= 1 keeps every class that exists — a no-op today (each class has at least one row), a silent row-deleter the day a class thins out. A threshold constant, not a result cell.",
        },
      ],
      distractors: ["'open'", "'paid'", "'partial'", "status", "ASC", "2"],
      walkthrough:
        "The matrix is a fold, a CASE and a census in one pass. The derived table LEFT JOINs payments to invoices — 27 movement rows plus 6 NULL payloads — folds once per billing (GROUP BY i.id) and COALESCEs the paid fold so unmoved reads 0, not NULL: 28 rows carrying status, face and cash. The CASE names four classes: status void with cash over zero -> void-settled (#11, 925.00, card); status paid with zero cash -> paid-unmoved (#28, 1756.00 booked, nothing moved); status open with some cash -> open-partial (#25, 4000.00 of 6148.00, wire); ELSE clean — the 20 paid-exact billings and the 5 open-no-rail ones, 25 rows, 64687.00. GROUP BY matrix_class folds to four rows, and the reconciliation is the review's first read: 25 + 1 + 1 + 1 = 28 billings, 64687.00 + 925.00 + 0.00 + 4000.00 = 69612.00 — every rail dollar classified, none twice. HAVING COUNT(*) >= 1 is the keep-every-class guard; ORDER BY billings DESC, settled_usd DESC leads with clean and breaks the three singletons by cash. The distractors fail where the craft lives: 'open' in the void arm misfiles the partial while the void-settled break prints clean; 'paid' floods void-settled with the 20 healthy paid billings; 'partial' in the void arm matches no status and #11 hides in clean; status as the fold key re-grains the page to open/paid/void; ASC reverses the read; and a floor of 2 deletes the three singleton classes — the anomalies — leaving a clean book that is lying by omission.",
    },
    {
      id: "cs-barc-5",
      tier: "hard",
      topic: "q2",
      universe: "fraud",
      title: "The outlier book: billings above the book-wide mean",
      brief:
        "Fraud-spot-check memo on the storefront db: the credit desk does not read all 28 billings — it reads the {violet:outlier book}, the rows booked above the book-wide mean. Probed facts: the mean booking is **3106.32** (86977.00 across 28 billings); **12 billings clear the bar, carrying 54430.00 — 62.6%** of the whole book. The bar is a scalar subquery, not a literal: the mean moves on every restatement, and the page prints it beside every row (book_avg) so the reader sees the line each booking is judged against. The queue reads biggest-first — 6148.00 (the open partial) down to 3420.00 — and the boundary is clean today: no billing sits between 3105 and 3107 dollars, so the flag is not riding a knife edge.",
      ask: "Return the outlier book: billing id, status, booked value and the book-wide mean (2 decimals), biggest booking first.",
      template:
        "SELECT i.id,\n       i.status,\n       ROUND(i.amount_cents / {1}, 2) AS booked,\n       ROUND((SELECT {2}(amount_cents) FROM invoices), 2) AS book_avg\nFROM invoices i\nWHERE i.amount_cents > (SELECT AVG(amount_cents) FROM invoices)\nORDER BY booked {3}, i.id;",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-dollars divisor",
          why: "Billing money is INTEGER cents; the dollar read is amount_cents / 100.0 with the .0 forcing real division. Integer 10 or 100 truncates — and 10 is ten times wrong, printing 61480.00 where the book says 6148.00.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the bar's fold",
          why: "The bar is the book-wide MEAN — 86977.00 over 28 billings. SUM in the slot would print 86977.00 as the 'average' and every row clears it; MIN prints 925.00 and all but the smallest billing clears a bar that low.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The desk works the largest exposure first — 6148.00 on top, 3420.00 at the tail. ASC reads the smallest outlier first and the concentration story arrives backwards.",
        },
      ],
      distractors: ["10.0", "SUM", "MIN", "ASC"],
      walkthrough:
        "The outlier book is one bar said three ways. The WHERE carries the definition: amount_cents > (SELECT AVG(amount_cents) FROM invoices) — the scalar subquery folds the whole book once, 310632.142857… cents, and each of the 28 rows is judged against it; 12 clear the bar. The SELECT prints the same fold as book_avg beside every row (3106.32 at two decimals) so the page shows the line, not just the survivors — 54430.00 of 86977.00, a 62.6% concentration the credit desk reads as dependency. Booked value is INTEGER cents: /100.0 with the .0, ROUND once at the edge. ORDER BY booked DESC, i.id reads biggest-first and stays byte-stable if two billings ever tie. The distractors fail exactly where the craft lives: 10.0 as the divisor prints cents-as-dimes — same rows, wrong money, the unit error the eye forgives; SUM in the bar folds 86977.00 into book_avg and the 'average' column lies by an order of magnitude; MIN prints 925.00 and 27 of 28 billings clear a bar that low — an outlier queue with no outliers in it; ASC flips the queue so the desk reads the 3420.00 tail before the 6148.00 head. And the empty-case contract rides with the answer: stage the bar from a fold that can come back empty and AVG returns NULL — every comparison UNKNOWN, the queue silently empty — which is why the bar folds the full book, never a filtered staging table.",
    },
    {
      id: "cs-barc-6",
      tier: "hard",
      topic: "x3",
      universe: "expense",
      title: "The op-cost stack: four lines and the grand total",
      brief:
        "Spend-report memo on the storefront db: the close pack's cost page is a stack — four op-cost lines folded per category, then the same fold appended ungrouped as the {emerald:TOTAL} row. Probed facts: Rent **14 lines / 16800.00**, Ads 14 / 4570.00, Travel 3 / 2521.00, Tools 5 / 1525.00; TOTAL **36 / 25416.00** — which must tie to the operating_expenses ledger book exactly (25416.00 debits), because the expense table IS the source of that book's entries. Dollar-ordered DESC puts the total on top: 25416.00 is the largest cell on the page. One quirk to narrate for the committee: each vendor maps to exactly one category (Atlas Property GmbH is all 14 Rent lines), so a vendor fold ties out 1:1 — but the page's contract is category, and the labels are what downstream consumers match.",
      ask: "Return the stack: category, line count and cost (2 decimals) per op-cost line, plus the TOTAL row, dollar-ordered biggest first, capped at 5 rows.",
      template:
        "SELECT category,\n       COUNT(*) AS lines,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS cost_usd\nFROM expenses\nGROUP BY {1}\nUNION ALL\nSELECT {2},\n       COUNT(*),\n       ROUND(SUM(amount_cents) / 100.0, 2)\nFROM expenses\nORDER BY {3} {4}\nLIMIT {5};",
      slots: [
        {
          answer: "category",
          kind: "keyword",
          label: "the line fold axis",
          why: "GROUP BY category folds 36 expense lines to the four op-cost classes the pack prints. GROUP BY spent_on shreds the page into one row per spending day — 30-plus lines that no longer read as a cost stack — and a vendor fold re-labels every row even though each vendor maps to one category.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-row label",
          why: "The appended row is the grand total and 'TOTAL' is its contract label, matched exactly by every downstream consumer. A lowercase variant looks identical to a human and breaks every string match — labels are contract cells, like statuses.",
        },
        {
          answer: "cost_usd",
          kind: "keyword",
          label: "the stack's order key",
          why: "The dollar column is the read: biggest cost first, and the TOTAL row's 25416.00 — the largest cell on the page — lands on top. lines as the key ties Ads and Rent at 14 and reads the page by row count instead of exposure.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the total-first direction",
          why: "DESC with the dollar key leads the page with the grand total (25416.00 outranks Rent's 16800.00), then the four lines biggest-first. ASC buries the total at the foot and opens the pack with Tools, the smallest line.",
        },
        {
          answer: "5",
          kind: "number",
          noVerify: true,
          label: "the row cap",
          why: "Five rows exist — four lines plus the total — so LIMIT 5 caps the page at its exact height. 4 deletes the Tools row and the stack stops summing to 25416.00. The cap is a constant, not a result cell — it ships noVerify.",
        },
      ],
      distractors: ["spent_on", "'total'", "lines", "ASC", "4"],
      walkthrough:
        "The grand-total stack is one fold said twice. The first SELECT folds expenses by category: Rent 14 / 16800.00, Ads 14 / 4570.00, Travel 3 / 2521.00, Tools 5 / 1525.00. UNION ALL appends the same fold without the GROUP BY — COUNT(*) reads 36, SUM reads 25416.00 — labeled 'TOTAL' so the page reads as a stack. The reconciliation is mandatory and mechanical: 14 + 14 + 3 + 5 = 36 lines, 16800.00 + 4570.00 + 2521.00 + 1525.00 = 25416.00, and the ledger's operating_expenses book folds to the same 25416.00 debits — three proofs, one number. ORDER BY cost_usd DESC leads the page with the total (25416.00 outranks Rent's 16800.00), then Rent, Ads, Travel, Tools — biggest cost first, total anchoring the top. LIMIT 5 caps the page at its exact height. The distractors fail where the craft lives: spent_on as the fold key shreds the page into one row per spending day; 'total' in lowercase passes the eye and fails every consumer matching 'TOTAL'; lines as the order key ties Ads and Rent at 14 and reads exposure by row count; ASC buries the total at the foot; and LIMIT 4 deletes the Tools row — a stack that no longer sums to 25416.00. UNION instead of UNION ALL would pass today and silently delete a row the day two folds agree — which is why the stack mandates ALL.",
    },
  ],

  problems: [
    { slug: "trial-balance-check", why: "The audit anchor in one query: conditional SUMs of debits and credits that must reconcile to zero — 181080.00 both sides here — the proof every other number inherits from." },
    { slug: "bank-account-summary-ii", why: "Credit/debit folds per account — the double-entry read: money in, money out, net per book, cents read honestly." },
    { slug: "gl-reconciliation", why: "Ledger-versus-subledger reconciliation — the billings-versus-rails proof, which is the close's whole morning and the audit's first control." },
    { slug: "journal-gap-detection", why: "Gap detection over an ordered journal — the sequence check that proves nothing was edited out of the books of record." },
    { slug: "balance-rollforward", why: "Opening balance plus movements equals closing balance — the walk identity that makes an account's journal auditable end to end." },
    { slug: "ar-aging-schedule", why: "The AR aging schedule itself: amount by age bucket — the same CASE-classified coverage the close ships, in graded form." },
    { slug: "customers-who-never-order", why: "The anti-join watchlist in textbook form — billings with no rail hit are this query with the table names swapped." },
    { slug: "settlement-fails-aging", why: "Aging buckets over unsettled items — the unpaid-book watchlist read against its 30-day terms line, oldest tail first." },
    { slug: "loan-types", why: "CASE classification over facility rows — the coverage ladder's vocabulary drill, boundaries documented for the controls read." },
    { slug: "delinquency-buckets", why: "DPD-style CASE buckets — the aging ladder with a boundary someone will argue about; exactly-90-days discipline in graded form." },
    { slug: "expected-credit-loss", why: "Weighted provision math — ECL-style stage weighting over exposure, the corporate-lending fold this bank's credit teams live in." },
    { slug: "structuring-detection", why: "The HAVING wall over small-ticket counts — threshold judged after the fold, the audit-screen grammar in its purest form." },
    { slug: "account-balance", why: "Running totals per account — the balance walk: every entry beside the position it leaves behind, frame discipline included." },
    { slug: "count-salary-categories", why: "CASE tiers stacked with UNION ALL totals — the coverage census shape (exact / partial / none) where branch totals must reconcile to the whole." },
    { slug: "books-with-null-ratings", why: "COUNT(col) versus COUNT(*) — the gap that IS the excluded population, the count discipline every audit number here must pass." },
    { slug: "duplicate-charge-pairs", why: "Self-join pair detection over settlement rows — the duplicate-rail screen that keeps one posting from clearing a billing twice." },
    { slug: "monthly-transactions-ii", why: "UNION ALL month stacks over the money spine — the rails-stack shape the close page ships: month folds appended with a TOTAL row, two grains on one page." },
    { slug: "orders-with-maximum-quantity-above-average", why: "The above-average leg screen — the outlier book's graded twin: rows judged against a fold the outer query can't see, the bar recomputed on every restatement." },
    { slug: "second-highest-salary", why: "The runner-up read — second-biggest booking without LIMIT fragility: what the second value IS when the top value ties, drilled on a fold that could be any book." },
    { slug: "department-highest-salary", why: "Argmax per book — the biggest booking per region or relationship: a fold for the winners and a join back for the names, the two-stage shape the desk ships weekly." },
    { slug: "uber-first-transaction", why: "First settlement per billing — LAG's first-row NULL as the flag: 22 billings, 22 first legs, and the partition does what MAX(id) - MIN(id) never could on an interleaved journal." },
    { slug: "find-third-transaction", why: "Nth-event reads on the journal — the third movement per billing: row numbers inside partitions, the audit trail's replay drill." },
    { slug: "unique-orders-and-customers-per-month", why: "Two grains per month bucket — movements and distinct billings by settlement month: the close calendar's paired counts, keys year-first." },
    { slug: "total-sales-amount-by-year", why: "The year fold of the settlement calendar — 2024 against 2025 to date: the bucket key's year-first discipline, proven by the merged-February trap." },
    { slug: "sales-by-day-of-the-week", why: "Weekday settlement density — 27 movements over 26 distinct days with one double-day: the cadence read behind the close calendar, folded by day-of-week." },
    { slug: "product-sales-analysis-iii", why: "Leg-grain folds over activity — 251 legs against 103 events: fold at leg grain when the question is leg-shaped, and prove the grain with COUNT(DISTINCT) beside COUNT(*)." },
    { slug: "customers-who-bought-all-products", why: "All-arms population proofs — relational division: which relationships touched every facility type, the exhaustive-cover read the controls committee borrows for sampling." },
    { slug: "list-the-products-ordered-in-a-period", why: "Period-scoped activity — instruments moved inside a window: the half-open date bounds that keep the month-end burst, drilled on the legs table." },
    { slug: "count-apples-and-oranges", why: "Conditional counts in one scan — the two-rail census shape: card and wire folded side by side, arms that must reconcile to the whole." },
    { slug: "league-statistics", why: "Multi-arm census with grand reconciliation — class counts, shares and the TOTAL row: the status matrix's graded sibling, exhaustive ELSE included." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "Journal sequence reads — LAG comparisons over ordered movements: when each leg must beat its predecessor, the streak discipline on the settlement journal." },
    { slug: "find-the-start-and-end-number-of-continuous-ranges", why: "Islands in the sequence — runs of consecutive journal ids collapsed to ranges: the gap hunt's sibling, and the shape that proves coverage 1..80 in one scan." },
  ],
};
