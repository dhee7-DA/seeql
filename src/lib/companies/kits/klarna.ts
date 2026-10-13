// Klarna — kit 9 of the Fintech & Payments domain (Batch L, wave 6).
// BNPL at checkout speed: the storefront db read as a pay-later book —
// invoices are payment plans (a financed checkout lands as one plan on
// uniform 30-day terms), payments are installment payments received (card
// installments vs bank-transfer/autodebit rails), orders/order_items are the
// financed checkouts and their lines, expenses/ledger are internal money
// movement in INTEGER cents. On-time vs late splits, credit-exposure aging
// and split-installment reconciliation.
// Pool provenance: 0 tagged LC rows for Klarna — the whole pool is
// theme-curated to known BNPL/credit-risk screen shapes and says so.
// Case briefs quote probed figures from scripts/company-facts.md (probed
// 2026-10-12); every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const klarnaKit: CompanyKit = {
  id: "klarna",
  domainId: "fintech",
  name: "Klarna",
  tagline: "BNPL: checkout, pay-later, credit risk",
  accent: "text-pink-400",

  brief: [
    "Klarna is the checkout layer that turned **pay-later** into a default payment method — a bank that underwrites a purchase in the ~200 milliseconds a checkout takes, then collects it over time. The analytics reality is a credit book wearing a payments interface: every financed purchase becomes a payment plan with a schedule, and the entire company lives or dies on the {emerald:on-time} versus {rose:late} split of the installments that follow. On this storefront db the mapping is honest: `invoices` are payment plans (28 of them, all cut on uniform 30-day terms), `payments` are installment payments received (27 rows across 22 plans — five plans collect in two installments), and money columns are INTEGER cents, so the dollar read is `amount_cents / 100.0`.",
    "The data org splits into credit risk, payments ops, and the reconciliation desk both depend on. Credit risk watches the ladder: **6 open plans worth $19,609** are the live exposure, and the aging read buckets them by days outstanding against a *frozen reference date* — because an aging report that moves with the clock can't be audited. Payments ops watches the rails: card installments run 16 payments totaling $37,364 against wire/autodebit's 11 totaling $32,248, and the rails behave differently when plans go bad. The reconciliation desk owns the exception queue — plan #11 is {rose:void} yet carries a $925.00 installment, plan #28 reads {emerald:paid} with no installment row at all ($1,756.00 promised, nothing collected), and plan #25 sits {amber:partial} at $4,000.00 collected of $6,148.00.",
    "Interview style is definition-first, because at a lender every number is a claim about money. A screen opens with a fold over installments (per-rail counts and dollars), moves to the two-grain question — 27 installment rows versus 22 plans, *do you know which one you're counting?* — escalates into an on-time/late split where the **denominator** is the whole test, and lands on aging: bucket the open book by days outstanding and make the buckets reconcile back to $19,609. The habits graded everywhere: `100.0` before the division, ROUND once at the end, NULL policy stated out loud, and a reference date that doesn't drift between runs.",
    "Preparation: the registry tags zero SQL problems for Klarna — this kit is **0 tagged LC, theme-curated**: all 30 topic slugs and 16 problems are chosen to mirror BNPL screens — conditional on-time counting, delinquency buckets, vintage curves, unpaid-exposure anti-joins and ledger walks. Then run both case studies on the live db: one rebuilds the per-rail {rose:late-share} split credit ops ships at month-close (card **18.8%** late against wire **9.1%**), the other rebuilds the {violet:exposure-aging ladder} risk reviews every Monday. Say the units, the denominator and the reference date before you compute anything — at a BNPL shop those three sentences ARE the interview.",
    "Follow the money and the org chart agrees: Klarna earns on financing income and interchange, so every margin point traces back to the {emerald:collected} versus {rose:outstanding} split. The db tells that story end to end: **$86,052 invoiced** across paid and open plans, $66,443 of it collected on the 21 paid plans, $19,609 still live in the 6 open ones — a collection-efficiency read anyone can re-derive in one fold. The rails split 16 card installments ($37,364) against 11 wire/autodebit ($32,248), and the five two-installment plans (#1, #5, #12, #19, #22) hide a symmetry worth proving rather than assuming: **each splits into two equal halves** — closers sum to the same $12,470.00 as openers, a `MIN = MAX` fold, not a claim. Underneath it all the ledger squares: `debits − credits = $0.00` on $181,080 a side, the only number in the building allowed to be boring.",
    "Preparation now runs in two passes. Pass one is the drill set: the five new topic families — window pick-one rows, scalar thresholds, `LAG` momentum, pairwise self-joins, {violet:TOTAL}-row packets — each maps to three graded problems; run them before touching prose. Pass two is the live-db gauntlet: four new case files walk the actual workflows — the split-plan closer pull (rank 2 under `paid_on` ordering), the {orange:big-ticket monitor} against a $2,578.22 scalar average, the month-over-month collections ladder (+$5,563 into 2024-03, −$3,762 into 2024-04), and the rail packet with its {sky:TOTAL} row (27 installments, $69,612.00). Interviewers at a BNPL shop trust candidates who *re-run the pack and get byte-identical output* — rehearse until your queries reproduce, not just return.",
  ],

  dayInLife: [
    "**08:00 —** The day starts on the credit dashboard, not the marketing one. First query is a health check on yesterday's collections: installments landed versus scheduled, the on-time share by rail (card installments pay late at **18.8%** against wire's **9.1%** on this book — the gap is the morning conversation), and whether the exception queue grew overnight. The queue is small and loud: a {rose:void} plan carrying a collected installment (#11, $925.00) and a paid plan with no installment behind it (#28, $1,756.00). Both are reconciliation pages, not curiosity items — *money moved where the lifecycle says it shouldn't, or is promised where nothing moved.*",
    "**11:00 —** Midday is exposure surgery. Risk wants the {violet:aging ladder} refreshed on the frozen reference date: 6 open plans, $19,609 total, bucketed by days outstanding — 3 plans inside 30 days carrying $12,504, then single plans at $4,937 (31–60), $1,295 (61–90) and $873 (90-plus). The follow-up questions are always the same shape: does the ladder reconcile back to the open-book total, and does the {amber:partial} plan (#25, $4,000.00 of $6,148.00) sit in the right rung? Each ask is a CASE ladder over a derived day-count, and the query gets written twice — once to answer, once with the reference date and bucket edges spelled out so the number survives review.",
    "**15:00 —** The afternoon is stakeholder cycles with SQL attached. Finance walks the ledger — **debits $181,080 against credits $181,080, delta $0.00** — and the per-account nets (cash $44,196, receivables $16,440) feed the close checklist. The collections lead wants the {rose:late} cohort cut by rail and by plan age; a product manager wants days-to-collect (average **28.4** against the 30-day terms, spread 13 to 84) defended from the query, not the slide. Every branch of every census reconciles against a plain `COUNT(*)` before it ships, because a delinquency number nobody can re-derive is a number nobody can act on.",
    "**17:30 —** EOD is the writeup. The aging ladder ships with its reference date in the comment; the split-installment plans (**#1, #5, #12, #19, #22**) ship with a first-installment definition (MIN per plan, never a per-row average); the exception log carries both mirror anomalies with their queries attached. The rhythm to internalize: Klarna SQL exists to prove that the schedule and the collections agree — *the plan is a promise, the installment is the evidence, and the gap between them is the entire job.*",
    "**21:00 —** The late beat belongs to the batch. Dunning runs after dark: the six open plans get their notices, the {rose:late} test re-runs book-wide (4 installments flagged: 3 card, 1 wire), and the exception queue gets one more look — *#11 and #28 are still its only two rows, which is the good news*. Then the replay check: the whole month-close pack re-executes against the frozen reference and must match the 17:30 run byte for byte — same ladder ($12,504 / $4,937 / $1,295 / $873), same rail split, same ledger delta. A report that drifts between runs is a bug in the report, not in the book. Lights out on one sentence: *collections reconcile or nobody ships.*",
  ],

  metrics: [
    { name: "On-time installment rate", what: "Installments paid on or before due_on ÷ all collected installments. The BNPL headline: the whole unit economics model assumes this number stays high, and it's a conditional count where the denominator argument never ends." },
    { name: "Days to collect", what: "Plan issue → first installment, in days: 20 paid plans average 28.4, fastest 13, slowest 84 — against uniform 30-day terms. First installment only; averaging every split row double-counts the slow plans." },
    { name: "Open exposure", what: "Open plans and their dollar value: 6 plans worth $19,609. The live credit book — computed over ALL plans by status, not just the ones with installments behind them." },
    { name: "Unpaid exposure", what: "Plans with no installment rows: 6 worth $15,217. Looks like the open count, isn't the same 6 — one open plan is partially collected and one paid plan has nothing behind it." },
    { name: "Delinquency aging mix", what: "Open exposure bucketed by days outstanding on a frozen reference date: 3 plans / $12,504 inside 30 days, then $4,937, $1,295 and $873 deeper in the ladder. The rung totals must reconcile to the open-book figure." },
    { name: "Rail late split", what: "Late-share by collection rail: card 3 of 16 installments late (18.8%) versus wire/autodebit 1 of 11 (9.1%). Card is both the volume rail and the risk rail — the split drives dunning strategy." },
    { name: "Coverage census", what: "Plans classified exact / partial / no collection: 21 / 1 / 6 on this book. The opening read of every reconciliation — and the CASE classification must sum back to 28." },
    { name: "Ledger balance delta", what: "Total debits − total credits: $0.00 ($181,080 = $181,080 here). The one metric allowed, and required, to be boring — a non-zero delta pages the close." },
    { name: "Split-plan share", what: "Plans collecting in two installments: 5 of the 22 collected plans — and each splits into two equal halves, closers summing to $12,470.00, the same as openers. The cadence signal behind every first-installment definition." },
    { name: "Collections momentum", what: "Month-over-month LAG delta on collected dollars: +$5,563 into 2024-03 ($7,993), −$3,762 into 2024-04 ($4,231), +$1,199 into 2025-02. The pulse check for the collections engine — computed over 13 activity months, 2024-02 through 2025-02." },
    { name: "Big-ticket share", what: "Installments clearing the book-average single collection ($2,578.22): 12 of 27 — wire 7, card 5 — carrying $38,468.00. Large-ticket concentration drives both the fraud review and the funding cost." },
    { name: "Collection-month coverage", what: "Months with at least one collection: 13, the book's entire life (first plans issued 2024-02). GROUP BY emits only keys that exist — a continuity read over a wider window needs a calendar spine, not hope." },
  ],

  topics: [
    {
      name: "Folds over installment money",
      why: "Every headline at a BNPL shop is a fold over a money column: collected dollars per rail, plans per status, exposure per bucket. Amounts are INTEGER cents, so SUM(amount_cents) / 100.0 is the dollar read and integer division is the standing trap. Klarna drills whether you can fold money without leaking it.",
      slugs: ["number-of-rich-customers", "products-worth-over-invoices", "sales-analysis-i"],
    },
    {
      name: "CASE classification & conditional sums",
      why: "On-time versus late, exact versus partial versus none — every status read here is a conditional sum over a row-level fact, and the branches must reconcile to COUNT(*). The arm ordering matters: a late test is paid_on > due_on, and every plan the arms don't catch lands in the ELSE by definition.",
      slugs: ["total-traveled-distance", "calculate-special-bonus", "weather-type-in-each-country"],
    },
    {
      name: "Delinquency buckets & aging pivots",
      why: "Credit risk reads the book as a ladder: days outstanding bucketed into rungs, counts and dollars per rung, rungs summing back to the book total. The craft is bucket edges that don't overlap and a reference date that stays frozen — a ladder recomputed on CURRENT_DATE can't be diffed against yesterday's.",
      slugs: ["delinquency-buckets", "ar-aging-schedule", "calculate-orders-within-each-interval"],
    },
    {
      name: "Installment clocks & date math",
      why: "The settlement clock is JULIANDAY math: issue to first installment (28.4 days average against 30-day terms, spread 13 to 84), late tests as paid_on > due_on. Klarna probes whether you take MIN per plan before averaging — averaging every split installment row quietly weights slow plans twice.",
      slugs: ["average-time-of-process-per-machine", "users-with-two-purchases-within-seven-days", "rising-temperature"],
    },
    {
      name: "Unpaid exposure: anti-joins & zero-fill LEFT JOINs",
      why: "The unpaid census is the anti-join this business runs daily: plans with no installment row — 6 of them worth $15,217 here. LEFT JOIN + IS NULL is the shape, and the trap is filtering the right table in WHERE, which converts the join to an INNER and deletes exactly the exposure you were hunting.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "bank-account-summary"],
    },
    {
      name: "Honest ratios & rounded shares",
      why: "Late shares, on-time rates, coverage percentages — every rate is a conditional sum over a count, and both failure modes get graded: INTEGER 100 truncating small shares to zero, and a WHERE that shrinks the denominator to the numerator's population. Multiply by 100.0 first, round once at the end.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "friend-requests-i-overall-acceptance-rate"],
    },
    {
      name: "Month buckets & status calendars",
      why: "Collections calendars are month-bucketed: SUBSTR(paid_on, 1, 7) folds installments into '2024-03'-style keys with a conditional late count riding in the same fold. Klarna probes whether the calendar and the status rule come from one scan — branches that must reconcile before the report ships.",
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "the-latest-login-in-2020"],
    },
    {
      name: "Vintage curves & roll rates",
      why: "Credit risk thinks in cohorts: plans issued in the same month tracked forward, delinquency rolling between buckets (current → 1-30 → 31-60 → worse). LAG between bucket months and per-vintage folds are the interview shapes — the same machinery the loss-forecast model consumes.",
      slugs: ["vintage-default-curves", "delinquency-roll-rates", "loan-amortization-schedule"],
    },
    {
      name: "Ledger walks & reconciliation",
      why: "The ledger is double-entry and the trial balance must read zero ($181,080 = $181,080 here); per-account nets (cash $44,196, receivables $16,440) feed the close. Balance walks and delta queries localize a break — one fold per side, then the difference, then the account that drifted.",
      slugs: ["gl-reconciliation", "balance-rollforward", "trial-balance-check"],
    },
    {
      name: "Set-op packets & coverage censuses",
      why: "Month-close ships packets: collected versus uncollected, card versus wire — same columns, labelled branches, stacked with UNION ALL. The CASE census is the one-pass sibling, coverage classes out of a single scan, and both must reconcile against a plain COUNT(*) before anyone reads them.",
      slugs: ["monthly-transactions-ii", "count-salary-categories", "team-scores-in-football-tournament"],
    },
    {
      name: "Window numbering & pick-one rows",
      why: "Split collections force a pick-one decision: rank the installments inside each plan and take exactly one row — rank 1 for openers, rank 2 for closers. ROW_NUMBER with an id tie-break is the deterministic tool; a bare MAX join-back returns both tied rows and doubles every downstream count. Klarna's closer pull (the five split plans) is this exact shape.",
      slugs: ["maximum-transaction-each-day", "uber-first-transaction", "the-most-recent-three-orders"],
    },
    {
      name: "Scalar subqueries vs the book average",
      why: "Threshold screens compare one row against a number computed from the whole book — a scalar subquery in WHERE. The contract is zero-or-one rows: zero yields NULL and a silently-empty report, two is a runtime error. The big-ticket monitor (12 of 27 installments clear the $2,578.22 average) lives or dies on that contract.",
      slugs: ["second-highest-salary", "game-play-analysis-iv", "investments-in-2016"],
    },
    {
      name: "LAG deltas & collections momentum",
      why: "Month-close reads the book as a motion picture: collected dollars per month, then the month-over-month delta via LAG. The traps are the first row (NULL, not zero — 2024-02 opens this book) and direction (LAG looks back, LEAD forward — a sign flip that rewrites the memo).",
      slugs: ["biggest-window-between-events", "second-day-confirmation", "consecutive-transactions-with-increasing-amounts"],
    },
    {
      name: "Pairwise self-joins & duplicate detection",
      why: "Ops audits the file for echoes: two installments, same amount, same rail, same day. The shape is a self-join with an asymmetric key (a.id < b.id) so each pair reports once, never mirrored. The same machinery counts co-occurring anomalies in the exception queue.",
      slugs: ["duplicate-charge-pairs", "circular-transfers", "most-common-course-pairs"],
    },
    {
      name: "UNION packets with a TOTAL row",
      why: "Month-close ships packets: one labelled branch per rail, then a 'TOTAL' row stacked underneath via UNION ALL. UNION's dedup pass is the trap — two rails that tie on counts and dollars would collapse to one row. Branch columns align by position, and the packet must reconcile to the plain fold.",
      slugs: ["friend-requests-ii-who-has-the-most-friends", "league-statistics", "count-apples-and-oranges"],
    },
  ],

  theory: [
    {
      id: "klarna-t1",
      q: "An installment is on-time if it lands on or before due_on. In a query reporting the late share by rail, where does that rule live — and what breaks if it lands in HAVING instead?",
      a: "The late test is a row-level fact — paid_on versus due_on on one installment row — so it belongs in WHERE (if you're pre-filtering) or inside the aggregate as CASE WHEN paid_on > due_on THEN 1 ELSE 0 END (if you're reporting both sides of the split). Once rows are folded by rail, the row-level comparison no longer exists: HAVING can only judge group aggregates like SUM or COUNT, not recover a per-row comparison you forgot to make. The classic failure is folding all installments per rail and trying to subtract 'the late ones' in HAVING — the late installments are already inside the total, and no post-aggregation clause can un-mix them. The strong answer recites the pipeline — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — and places every rule by asking: is this a fact about one installment, or about a rail? At Klarna that question is the credit policy itself: a rule in the wrong clause doesn't error, it just reports a book that never existed.",
      tag: "pipeline",
    },
    {
      id: "klarna-t2",
      q: "Installments LEFT JOIN plans: when does an INNER JOIN give the identical answer, and when does it silently delete the exposure you were hunting?",
      a: "When every installment matches a plan — the foreign-key world this book lives in — INNER and LEFT return the same rows from the installments side; the difference only appears on plans with NO installment, and those rows are the exposure. The unpaid census (6 plans, $15,217) exists only under LEFT JOIN: unmatched plans survive with NULL installment columns and IS NULL is the detection. The silent killer is filtering the right table's column in WHERE — p.method = 'card' discards the NULL-payload rows (NULL = 'card' is UNKNOWN), collapsing the LEFT JOIN to an INNER and deleting exactly the plans the dunning cycle exists to find. The fixes are mechanical: move the predicate into ON, or filter a pre-aggregated fold first. The honest phrasing is directional — join type is a decision about who survives, and at a lender the survivors ARE the credit story.",
      tag: "joins",
    },
    {
      id: "klarna-t3",
      q: "27 installment rows collect 22 plans because five plans collect in two parts. Narrate every count in that sentence — and how you'd report both grains in one query.",
      a: "COUNT(*) over payments reads 27 — installment events, the rows the file shipped. COUNT(DISTINCT invoice_id) reads 22 — plans collected, the business object. COUNT(amount_cents) also reads 27 because the FK is never NULL — NULL-skipping is not deduplication. The two-grain report folds once and counts twice: per rail, installment events AND distinct plans side by side, because card's 16 events might be 16 plans or fewer, and the split rate is the gap between the columns (five plans here: #1, #5, #12, #19, #22). The habit the interviewer grades: before any COUNT, say 'one row per what?' — installment event, plan, rail bucket. At Klarna the distinction is money: a double-counted installment inflates collections; a deduplicated count hides operational load, and both numbers ship to different teams on purpose.",
      tag: "aggregation",
    },
    {
      id: "klarna-t4",
      q: "A voided plan carries a collected installment; a paid plan has none. When you LEFT JOIN installments to plans, what is your NULL policy — filter, coalesce, or report?",
      a: "The NULL means 'no installment exists', and that is data — the exception class itself — not missingness to clean. The policy: classify, don't discard. The coverage census keeps every plan and CASEs the join result into exact, partial and none (21 / 1 / 6 on this book), because those counts ARE the reconciliation. Equality never detects it — NULL fails every test including against itself — the arm is IS NULL. COALESCE belongs at the display edge only: a coalesced zero mid-pipeline launders a paid-but-uncollected plan (#28, $1,756.00 promised) into a clean-looking $0.00 somebody will act on. And if the ask truly wants collected-only, filter in WHERE and say the population changed — 'this report covers the 22 plans with installments' — because 28 minus 22 is the story that filter just deleted. A report whose WHERE does definitional work silently is the artifact credit review hunts for.",
      tag: "nulls",
    },
    {
      id: "klarna-t5",
      q: "Each plan can collect in several installments. How do you pick the FIRST installment per plan, and what breaks with a bare MAX-join-back when two rows share a timestamp?",
      a: "Two honest shapes. Aggregate-only: fold per plan with MIN(JULIANDAY(paid_on) - JULIANDAY(issued_on)) — that's the days-to-collect clock, 20 paid plans averaging 28.4 days, fastest 13, slowest 84 on this book. Row-picking: ROW_NUMBER() OVER (PARTITION BY invoice_id ORDER BY paid_on, id) = 1, and the id is the part interviewers wait for — it makes 'first' deterministic when two installments share a timestamp, which split-collection files produce routinely. The bare MAX(paid_on) join-back returns BOTH tied rows, and every downstream count silently doubles. Choose by output: if you need other installment columns, take the window; if you only need the timing, the aggregate fold is cheaper and stages cleanly in a CTE named for what it holds — first_installment, not cte2. At Klarna the follow-up is always the denominator: 20 plans have installments, 21 are paid — say which population your clock covers before anyone else does.",
      tag: "windows",
    },
    {
      id: "klarna-t6",
      q: "WHERE amount_cents/100.0 > (SELECT AVG(amount_cents)/100.0 FROM payments WHERE method = 'swish') — this book has no 'swish' rail. Walk me through what happens.",
      a: "A scalar subquery is contractually zero-or-one rows, one column. One row: its value joins the comparison. Zero rows: it yields NULL — not an error, not zero — and amount > NULL is UNKNOWN, so WHERE passes nothing: an above-average-installment report that returns empty while looking perfectly healthy. That's the empty-inner-query bug, and it ships on filtered staging tables far more often than on full ones. The strong answer also names the other contract edge: two rows from a scalar subquery IS an error, so 'scalar' is a promise you verify with the inner fold's GROUP BY, not an assumption. The correlated cousin — above THIS plan's own average installment, re-run per outer row — is a different question with a different cost. At Klarna the follow-up is always: what population did the inner fold cover, and what does the report do when that population is empty? Silence is not an answer the risk team accepts.",
      tag: "subqueries",
    },
    {
      id: "klarna-t7",
      q: "Terms run 30 days flat, and the open book must be aged against a frozen reference date. How do you compute the ladder, and where does CURRENT_DATE break it?",
      a: "The day-count is CAST(JULIANDAY(ref) - JULIANDAY(issued_on) AS INTEGER) per open plan, with ref = (SELECT MAX(paid_on) FROM payments) — a date inside the data, so re-running the query next week reproduces today's ladder exactly. CURRENT_DATE makes the report a moving target: the 31-60 rung plan drifts toward 61-90 as the calendar turns, and nobody can diff Monday's ladder against Friday's. Bucket edges are half-open by convention — 0-30, 31-60, 61-90, 90-plus as CASE arms evaluated in order, so an overlap or a gap between arms silently refiles plans into the wrong rung; the audit is arithmetic: rung dollars ($12,504 + $4,937 + $1,295 + $873) must sum to the open-book total ($19,609). And the terms check itself is a query: due_on − issued_on = 30 for all 28 plans, verified not assumed — one 27-day outlier would be the finding, not the exception you skip.",
      tag: "dates",
    },
    {
      id: "klarna-t8",
      q: "The trial balance must read zero: debits $181,080, credits $181,080. How do you prove it in one query — and localize the break when it doesn't?",
      a: "One pass, two conditional sums: SELECT SUM(debit_cents), SUM(credit_cents), SUM(debit_cents) - SUM(credit_cents) AS delta FROM ledger_entries — dollars via /100.0, delta printed beside the totals. Zero is the only acceptable value; the query is the proof and a non-zero delta is the page. Localization is the same shape one level down: GROUP BY account and read per-account nets — cash $44,196, receivables $16,440, revenue −$86,052, opex $25,416 here — because a broken balance always shows up as an account whose debit/credit pairing drifted. The traps are self-inflicted: COUNT where you meant SUM, SUMming dollars over cents (a 100× error the eye never catches), or auditing only the grand total while an offsetting error hides across two accounts. At a BNPL shop this isn't month-close ceremony — the ledger is how you prove the collections you booked are the collections that landed, so reconcile the total, then reconcile the parts, every time.",
      tag: "quality",
    },
    {
      id: "klarna-t9",
      q: "You write SUM(usd) OVER (ORDER BY month) expecting each month's share of the book and get a number that keeps growing. What did the default frame do?",
      a: "The moment an ORDER BY appears inside OVER, the default frame becomes RANGE UNBOUNDED PRECEDING TO CURRENT ROW — a running total, not a whole-partition sum. Month by month the value accumulates the collections burn-down: $2,430, then $10,423, then $14,654 on this book. For a share-of-book denominator you want the empty OVER () — every row sees the full $69,612 — and for explicit control you name the frame: ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING, or a bounded window for rolling reads. One subtlety worth reciting: RANGE includes peer rows tied on the ORDER BY key, so a frame you think is row-by-row can quietly absorb ties. At Klarna the distinction is two different reports — the burn-down tells you how much book is left to collect; the share tells you how concentrated one installment is. Confusing them in the close pack is how a running total gets labelled a share and nobody notices until the denominator audit.",
      tag: "windows",
    },
    {
      id: "klarna-t10",
      q: "EXISTS versus IN for 'plans with at least one installment' — and why does the NOT IN cousin poison itself on NULL?",
      a: "EXISTS is a per-row existence test: for each plan, does even one matching installment row exist — it stops at the first match and never looks at values, so there is no list to poison. IN builds a value list from the subquery and compares membership; if that list contains a single NULL, x IN (...) can never be TRUE-or-FALSE for the missing case, and x NOT IN (...) becomes UNKNOWN for every row — the whole dunning census returns empty while looking healthy. The NULL-proof shapes are NOT EXISTS and LEFT JOIN … IS NULL, and the habit is choosing by semantics: EXISTS for semi-joins (does a match exist), IN for small static lists you control. At Klarna this is not style — the unpaid census and the exception queue are anti-joins by definition, and one stray NULL in a staging dispute table is exactly the kind of input a lender's ops data actually has.",
      tag: "subqueries",
    },
    {
      id: "klarna-t11",
      q: "The rail packet uses UNION ALL. A teammate switches it to UNION 'to be safe'. What actually changes?",
      a: "UNION adds a dedup pass: identical rows across branches collapse to one. On today's book the packet survives — card (16, $37,364), wire (11, $32,248) and TOTAL (27, $69,612) are mutually distinct — so the output looks identical and the change passes review. But the safety is fake: the day two branches tie on every column (two rails with the same count and dollars, or a TOTAL row that legitimately equals a branch's row) UNION silently deletes one, and the packet no longer reconciles to the plain fold. UNION also carries a sort cost for the dedup it does. UNION ALL is not laziness — it is a statement of intent: packets append, duplicates are meaningful, reconciliation happens by summing branches, not by trusting row uniqueness. At Klarna the reviewer's instinct ('dedup protects me') is exactly backwards: in a money packet, an unexpected dedup IS the data loss.",
      tag: "setops",
    },
    {
      id: "klarna-t12",
      q: "You stage the month fold in a CTE and consume it twice — once for the ladder, once for the delta. What are the scoping semantics, and what's the naming bar?",
      a: "WITH defines a named result set visible to every CTE declared AFTER it and to the main query — forward only, never backwards, and a CTE referencing itself needs the RECURSIVE keyword. SQLite inlines simple CTEs, so the two consumers re-scan the fold rather than materializing it once; that's a performance footnote, not a correctness one. The naming bar is the part interviewers grade: name the CTE for what it holds — monthly_collections, open_plans, first_installments — not cte1, cte_tmp, x. A staged fold with a real name reads like a sentence: the ladder consumes monthly_collections, the delta consumes monthly_collections, both agree because both read the same definition — one source of truth for the month grain. At Klarna the two-grain discipline (installment events versus plan grain) is exactly this pattern: stage the fold once, name it, and let every downstream report quote it instead of re-deriving its own version of the truth.",
      tag: "cte",
    },
    {
      id: "klarna-t13",
      q: "The calendar spine wants 14 months but collections ran 13 — the first plans were issued 2024-02. Why does GROUP BY never show the missing month, and how do you make it appear?",
      a: "GROUP BY emits one output row per key that EXISTS in the data — absent keys never materialize, so a month with zero collections is invisible to the fold, not shown as zero. 2024-01 is the proof on this book: the order window opens there, but no plan was issued and nothing was collected, so the month fold starts at 2024-02. To show the gap you build a calendar spine: derive the month list independently (a recursive CTE over dates, or a fold over the widest event table), LEFT JOIN the collections fold onto it, and COALESCE the missing dollars to 0.0 at the display edge — never mid-pipeline. The rule to recite: the spine defines the population; the fold fills it. At Klarna finance reads continuity — 'collections ran every month the book was live' — and that sentence is only provable if the spine exists explicitly; a fold that starts at 2024-02 cannot testify about 2024-01 at all.",
      tag: "dates",
    },
    {
      id: "klarna-t14",
      q: "LAG gives the first activity month a NULL delta. Where may that NULL become zero, and where must it stay NULL?",
      a: "The NULL means 'no prior month' — information about the book's edge, not missingness to repair. It may become zero exactly once: at the display edge, where the memo renders and a human needs a number. Mid-pipeline it must stay NULL, because every downstream consumer reads the distinction: AVG(delta_usd) over 13 months correctly skips the first row; replace NULL with 0 and the average understates momentum by a twelfth of the true figure. Streak detection breaks worse — a gaps-and-islands query treats NULL as 'no prior' and a 0 as 'flat month', so the first month joins an island it never belonged to and every streak length shifts. LAG(usd, 1, 0) is a legitimate display choice, but it is a choice that must be documented in the report footer, because 'grew $2,430 from nothing' and 'the book began at $2,430' are different claims. At Klarna the edge of the book is where new vintages are born — laundering that edge to zero is how first-month performance gets misread in the vintage deck.",
      tag: "nulls",
    },
    {
      id: "klarna-t15",
      q: "COUNT(*) FILTER (WHERE paid_on > due_on) — what is this clause, and when is it cleaner than the CASE sum?",
      a: "FILTER attaches a predicate to ONE aggregate: each aggregate carries its own WHERE without touching the row set. COUNT(*) FILTER (WHERE late) and COUNT(*) ride the same scan, same groups, no ELSE bookkeeping — it is the named-branch sibling of SUM(CASE WHEN … THEN 1 ELSE 0 END) and computes the same late counts (4 book-wide: 3 card, 1 wire). It is cleaner when you're counting branches — late versus on-time, exact versus partial — because the predicate sits next to the aggregate it belongs to instead of a CASE block three lines up. It does NOT replace CASE for dollar branches: SUM(amount_cents) FILTER (WHERE late) works, but the moment you need an ELSE-0 column (branch dollars for a pivot) the CASE form is the one that pivots into rungs. At Klarna the rails report reads beautifully as two FILTERs beside two plain folds — one scan, four named numbers, zero chance the late count's denominator drifts from the total's.",
      tag: "aggregation",
    },
    {
      id: "klarna-t16",
      q: "HAVING SUM(amount_cents)/100.0 > 35000 versus WHERE amount_cents > 3500000 — same intent, different clauses. Walk the difference.",
      a: "WHERE filters ROWS before the fold; HAVING filters GROUPS after it. WHERE amount_cents > 3500000 drops individual installments under $35,000 — the population of the fold changes, and every aggregate downstream is computed on the survivors. HAVING SUM(amount_cents)/100.0 > 35000 keeps every installment and then discards GROUPS whose folded dollars miss the bar: on this book card's $37,364 survives and wire's $32,248 is cut — one row out, zero input rows touched. WHERE cannot even see an aggregate; referencing SUM there is a hard error, which is the compiler telling you the pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is load-bearing. HAVING without GROUP BY is legal and gates the whole result as one group. At Klarna the distinction is population discipline: 'big rails only' is HAVING, 'big installments only' is WHERE, and a memo that confuses them reports a different book than the one it claims to audit.",
      tag: "quality",
    },
    {
      id: "klarna-t17",
      q: "WHERE SUBSTR(paid_on,1,7) = '2024-03' and WHERE paid_on >= '2024-03-01' AND paid_on < '2024-04-01' return the same rows. Which one ships, and why?",
      a: "The range form, every time — it is sargable. Wrapping the column in a function (SUBSTR, DATE, CAST) makes the predicate opaque to the index: the planner cannot use the paid_on index to seek March, so it scans every payment row and evaluates the function per row. The range predicate compares the bare column against constants, the index seeks directly into March, and the plan reads as SEARCH instead of SCAN. Same rows, different plan — result-identical is not plan-identical, and EXPLAIN QUERY PLAN is the referee you cite in review. The half-open edge matters too: >= '2024-03-01' AND < '2024-04-01' tiles the calendar without gaps; BETWEEN '2024-03-01' AND '2024-03-31' silently includes midnight-April-1 timestamps if the grain ever gains a time component. At Klarna the month fold runs on every close and the installment table only grows — the sargability habit is the difference between a close pack that scales and one that pages the on-call.",
      tag: "performance",
    },
    {
      id: "klarna-t18",
      q: "Self-join payments to itself to find same-amount same-day installment pairs. Why a.id < b.id and not a.id <> b.id?",
      a: "The pair test needs three conditions: equal amount, equal paid_on, and a key that canonicalizes which of the two rows speaks first. a.id <> b.id excludes self-pairs but keeps both orderings — every echo reports twice, (a,b) and (b,a), and the duplicate census double-counts exactly the anomaly it exists to measure. a.id < b.id keeps one row per unordered pair and kills the self-match in the same stroke; the strict inequality is the tie-break discipline from split-plan picking, applied to pairs. The remaining trap is fan-out: ON amount alone matches every same-amount row against every other — 27 installments sharing common prices can explode combinatorially — so every equality condition belongs in ON, never in WHERE-after-join where it would also convert an outer variant to an inner. At Klarna this query is the duplicate-installment audit: same cents, same day, different plan is a data-entry echo; the asymmetric join key is what makes the count trustworthy enough to open an investigation on.",
      tag: "joins",
    },
    {
      id: "klarna-t19",
      q: "Each installment's share of the book: amount_cents / SUM(amount_cents) OVER () — why OVER () and not GROUP BY method?",
      a: "The empty OVER () computes the whole-partition total and attaches it to EVERY row without collapsing them — all 27 installments keep their identity, each carrying the $69,612 denominator, so the share column is a per-row read. GROUP BY method folds the table to two rows and loses the installment grain entirely; you'd get rail shares (card 53.7%, wire 46.3%) but not installment shares, and no way to return both grains in one result. For the rail shares the window answer is PARTITION BY method inside OVER — the denominator becomes the rail's total ($37,364 or $32,248) while rows survive. And the arithmetic habit stands: 100.0 before the division, ROUND once at the end, or the shares truncate to integers and every small installment reads zero. At Klarna the two grains answer different questions — installment share feeds concentration risk (how much of the book rides on one large collection), rail share feeds the funding mix — and the window form is the only one that can serve both from one scan.",
      tag: "windows",
    },
    {
      id: "klarna-t20",
      q: "The big-ticket monitor: amount_cents > (SELECT AVG(amount_cents) FROM payments). Is the scalar re-evaluated per row, and what happens on an empty book?",
      a: "This one is uncorrelated — the inner fold references no outer column — so the planner evaluates it once and treats it as a constant: 257,822.22 cents. The correlated cousin (…WHERE method = p.method inside the subquery) re-runs per outer row and computes a per-rail average instead — a different threshold wearing the same syntax, which is why reviewers ask 'correlated or not?' before trusting the number. The empty-book edge is the dangerous one: AVG over zero rows yields NULL — not zero, not an error — and amount > NULL is UNKNOWN, so WHERE passes nothing and the big-ticket report ships empty and silent. On a staging copy with zero payments, 'empty report' is indistinguishable from 'no big tickets', which are opposite findings. The honest version states its population: the threshold is the average over the 27 collected installments, and if that population is empty the report should say so loudly, not render a blank. At Klarna a blank risk report is not neutral — it reads as good news, which is precisely when it isn't.",
      tag: "subqueries",
    },
    {
      id: "klarna-t21",
      q: "Reconciliation wants plan ids marked paid but absent from payments. Which set op, and which direction?",
      a: "EXCEPT — the set difference: distinct rows in the first result that do not appear in the second. Direction IS the answer: SELECT id FROM invoices WHERE status = 'paid' EXCEPT SELECT invoice_id FROM payments returns exactly #28 — the paid plan with $1,756.00 promised and no installment behind it, one of the two mirror anomalies on this book. Flip the operands and you get the inverse question (collected-but-not-paid ids — empty here, which is itself a finding). INTERSECT would answer 'ids in both' — the boring 21 — and UNION ALL would just stack the lists. The semantics worth reciting: EXCEPT dedups both sides before differencing, so it answers about SETS of ids, not row multiplicities — a plan with three installments contributes one id, same as one with none... no, same as one with one. That dedup is the feature for existence questions and the bug for counting questions. At Klarna the exception queue is built from exactly these directional differences — status says one thing, the installment evidence says another, and the query is the contradiction made executable.",
      tag: "setops",
    },
    {
      id: "klarna-t22",
      q: "Week buckets: STRFTIME('%W', paid_on) versus SUBSTR(paid_on,1,7) for months — what breaks at year boundaries, and how do you bucket weeks honestly?",
      a: "Month buckets from SUBSTR are pure prefix math — ISO dates pad months, so the 7-char prefix is a stable key that sorts correctly and never straddles a year boundary. Week buckets have no such luck: %W is the week-of-year, so '2024-52' is followed by '2025-00' — the key still sorts, but a partial week straddling New Year splits its rows across two keys, and any streak or run-length read across the seam is wrong. Honest week bucketing anchors each date to its week-start: DATE(paid_on, 'weekday 0', '-6 days') normalizes every date to the Sunday (or weekday 1 for Monday) that opens its week, producing a real date key weeks can't straddle; ISO-8601 week needs the %Y-%W pair at minimum and a stated convention at best. The rule: bucket keys must be (a) fixed-width, (b) sort-stable, (c) straddle-free — the month prefix gets all three free, weeks only get them from anchor-date arithmetic. At Klarna installment cadence is weekly-shaped (paydays), so the dunning team's week-over-week counts are exactly where a seam-split week would misstate collections momentum.",
      tag: "dates",
    },
    {
      id: "klarna-t23",
      q: "The close pack wants anomaly ids inline — 'void-but-paid: 11', 'split plans: 1,5,12,19,22'. How do you build that column, and what are the traps?",
      a: "GROUP_CONCAT(id) is the fold: it stitches the group's ids into one string with a comma default — the five split plans read '1,5,12,19,22' in a single cell beside their count. The traps are all edge behavior. Order: older SQLite gives no ordering guarantee inside the concat — versions before 3.44 lack GROUP_CONCAT(x ORDER BY …), so the deterministic forms are a sorted subquery feeding the fold or accepting the risk in review. Emptiness: a class with zero members aggregates to NULL, not '' — COALESCE at the display edge, or the close pack prints a literal 'NULL' where the queue should say 'none'. And type: the result is TEXT — an id list is a label for humans, never something to re-parse with string surgery in the next query; the joinable ids stay in their own column and the concat rides beside them. At Klarna the exception queue ships as evidence, not just counts — 'which plans' is the sentence risk actually reads, and a comma-joined id cell is the query-native way to testify.",
      tag: "quality",
    },
    {
      id: "klarna-t24",
      q: "Gaps and islands: flag each installment late, then find each plan's longest on-time streak. Sketch the query.",
      a: "Three stages, one CTE chain. Stage one: per installment within a plan (PARTITION BY invoice_id ORDER BY due_on), compute the late flag — paid_on > due_on — and LAG it: streak_start = 1 when the flag differs from the prior installment's flag (or the prior is NULL, the partition edge). Stage two: island_id = SUM(streak_start) OVER (PARTITION BY invoice_id ORDER BY due_on) — a running count of flag-changes draws a new island id every time the behavior flips, so consecutive rows sharing an island id are one run of same-kind payments. Stage three: fold per island — COUNT(*) and MIN/MAX dates — and take the longest on-time island per plan. The NULL policy from LAG's first row must be explicit: the first installment opens an island by definition, not by comparison. At Klarna this is dunning triage: a plan with a long on-time streak and one late installment is a different credit story from a plan that never paid on time once — same late count, opposite islands, and the run-length read is the only query that can tell them apart.",
      tag: "windows",
    },
  ],

  mcqs: [
    {
      id: "klarna-mcq-1",
      prompt: "An installment of 236,150 cents (real row: payment #13) is reported as ROUND(amount_cents / 100, 2). What lands in the report?",
      choices: [
        "2361.50 — integer division still returns the cents",
        "2361 — the .50 was truncated away before ROUND ran",
        "2361.00 — SQLite rounds to the nearest dollar",
        "2362 — SQLite rounds 236.15 up",
      ],
      answer: 1,
      why: "Division of two INTEGERs truncates BEFORE ROUND ever sees the value: 236150 / 100 = 2361, and ROUND(2361, 2) is still 2361. The house shape is amount_cents / 100.0 — real division first, ROUND last, exactly once.",
      notes: [
        { choice: 0, why: "Integer division never 'returns cents' — it discards the remainder entirely. 236150/100 is 2361; the 50 cents vanished at the division, and this payment is a real odd-cent row." },
        { choice: 3, why: "ROUND runs on the already-truncated 2361 — and ROUND(2361, 2) doesn't move it. No function downstream of a truncation recovers the truncated remainder." },
      ],
      difficulty: "easy",
    },
    {
      id: "klarna-mcq-2",
      prompt: "28 plans: 21 paid, 6 open, 1 void. SELECT status, COUNT(*) FROM invoices GROUP BY status returns how many rows?",
      choices: ["1", "3", "28", "27"],
      answer: 1,
      why: "GROUP BY folds to one row per distinct status — paid, open, void — so 3 rows whose counts sum to 28. The fold's output grain is the group, not the input row.",
      notes: [
        { choice: 2, why: "28 is the input row count. GROUP BY collapses it to groups; you'd only see 28 rows from a GROUP BY on a 28-distinct-value column." },
        { choice: 3, why: "27 is the installment count — a different table entirely. This fold reads plans only, and it folds to the 3 statuses present." },
      ],
      difficulty: "easy",
    },
    {
      id: "klarna-mcq-3",
      prompt: "27 installment rows collect 22 plans (five plans collect in two parts). Which expression counts PLANS collected, not installment rows?",
      choices: ["COUNT(*)", "COUNT(amount_cents)", "COUNT(DISTINCT invoice_id)", "SUM(invoice_id)"],
      answer: 2,
      why: "COUNT(*) and COUNT(amount_cents) both read 27 — one row per installment, and the FK is never NULL. COUNT(DISTINCT invoice_id) folds the split rows back to 22 plans. Both grains are real; the report must name which one it prints.",
      notes: [
        { choice: 1, why: "COUNT(column) skips NULLs, not duplicates — with a NOT NULL FK it equals COUNT(*) at 27. DISTINCT is the fold; NULL-skipping isn't." },
        { choice: 3, why: "SUM adds primary keys — a meaningless number that changes when any plan gains a second installment. Keys are for joining, never for folding." },
      ],
      difficulty: "easy",
    },
    {
      id: "klarna-mcq-4",
      prompt: "Open plans number 6 worth $19,609; plans with no installment also number 6, worth $15,217. Why do the dollar totals differ?",
      choices: [
        "Rounding: the anti-join version divides by 100 twice",
        "They're different populations — one open plan is partially collected and one paid plan has no installment",
        "The anti-join double-counts split installments",
        "Same population; the difference is a data bug",
      ],
      answer: 1,
      why: "Status lives on the plan; collection presence lives in the join. Plan #25 is open with $4,000 already collected, and plan #28 is paid with no installment at all — so the two 6-row sets are not the same 6 plans. Open exposure is the status report; unpaid exposure is the anti-join census.",
      notes: [
        { choice: 3, why: "A coincidence of counts is the most dangerous agreement in reconciliation — verify the row SETS, not just the row count." },
        { choice: 2, why: "Split installments fan rows out, they never disappear them — and the anti-join counts plans, so fan-out can't move its total." },
      ],
      difficulty: "medium",
    },
    {
      id: "klarna-mcq-5",
      prompt: "Late share per rail: which expression is safe against integer division AND denominator drift?",
      choices: [
        "SUM(CASE WHEN paid_on > due_on THEN 1 ELSE 0 END) / COUNT(*) * 100",
        "100.0 * SUM(CASE WHEN paid_on > due_on THEN 1 ELSE 0 END) / COUNT(*)",
        "100 * COUNT(paid_on > due_on) / COUNT(*)",
        "The same sum divided by COUNT(*) over rows pre-filtered to card in WHERE",
      ],
      answer: 1,
      why: "100.0 promotes to real arithmetic BEFORE the division, and COUNT(*) runs over the same unfiltered fold as the numerator — no drift. Filtering card rows first shrinks the denominator to one rail and every wire share vanishes instead of reading low.",
      notes: [
        { choice: 0, why: "The logic is right but the INTEGER 100 multiplies after an integer division that already truncated — any share under 1% collapses to 0." },
        { choice: 2, why: "COUNT(boolean-expression) counts non-NULL results, and the comparison returns 0 or 1, never NULL — so the 'share' reads ~100 for every rail." },
      ],
      difficulty: "medium",
    },
    {
      id: "klarna-mcq-6",
      prompt: "Plans LEFT JOIN installment folds: two plans tie at the largest single installment; the next is smaller. DENSE_RANK() OVER (ORDER BY amount DESC) gives the third plan rank…",
      choices: ["1", "2", "3", "4"],
      answer: 1,
      why: "DENSE_RANK: ties share rank 1 and the next distinct value takes 2 — compact, no gaps. RANK would jump to 3; ROW_NUMBER would deal 1, 2, 3 arbitrarily across the tie.",
      notes: [
        { choice: 2, why: "That's RANK: ties share 1 and the gap is kept — 'rank 3' implies a missing second place that doesn't exist." },
        { choice: 3, why: "Ranks reach 4 only with four distinct values. Two tied firsts plus one follower is three positions, densely numbered 1, 1, 2." },
      ],
      difficulty: "medium",
    },
    {
      id: "klarna-mcq-7",
      prompt: "Plans LEFT JOIN installments, then WHERE p.method = 'wire' to cut the report to one rail. What happens to the unpaid plans?",
      choices: [
        "Nothing — the join already kept them",
        "They vanish: NULL method fails the test, the LEFT JOIN collapses to an INNER, and the unpaid census reads empty",
        "They appear twice — once per installment row",
        "SQLite keeps them and fills method with 'wire'",
      ],
      answer: 1,
      why: "Unpaid plans carry NULL in every joined column; NULL = 'wire' is UNKNOWN, so WHERE discards them — exactly the rows the anti-join existed to find. Put the rail filter in ON, or filter a pre-aggregated fold instead.",
      notes: [
        { choice: 0, why: "The join kept them; the WHERE deleted them. Filter placement, not join type, decided the population — the classic silent INNER conversion." },
        { choice: 2, why: "Fan-out duplicates matched rows, it never resurrects unmatched ones. The unpaid plans' problem is disappearance, not duplication." },
      ],
      difficulty: "medium",
    },
    {
      id: "klarna-mcq-8",
      prompt: "WHERE plan_id NOT IN (SELECT invoice_id FROM disputes) — disputes.invoice_id is nullable in the staging copy. What can happen?",
      choices: [
        "It runs slower but stays correct",
        "One NULL in the subquery empties the entire result — every plan fails the test",
        "NULL invoice_ids are treated as unmatched and kept",
        "SQLite rewrites NOT IN as an anti-join automatically",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE — the comparison is UNKNOWN and NOT UNKNOWN is still UNKNOWN. One stray NULL silently returns zero rows. The NULL-proof shapes: NOT EXISTS, or LEFT JOIN … IS NULL.",
      notes: [
        { choice: 0, why: "The failure is correctness, not latency — an empty 'clean plans' report that looks like good news to the risk committee." },
        { choice: 2, why: "NOT IN has no 'treat as unmatched' mode. UNKNOWN poisons the whole list; only NOT EXISTS or the IS NULL anti-join is NULL-safe." },
      ],
      difficulty: "hard",
    },
    {
      id: "klarna-mcq-9",
      prompt: "Two analysts age the same 6 open plans and get different 31-60 bucket counts. What's the most likely cause?",
      choices: [
        "One used SUM, the other COUNT",
        "One aged against MAX(paid_on) frozen in the data, the other against CURRENT_DATE — the reference date moved between runs",
        "One divided by 100.0, the other by 100",
        "One used a LEFT JOIN, the other an INNER JOIN",
      ],
      answer: 1,
      why: "Days outstanding = reference − issued_on; a reference date that moves with the clock refiles boundary plans between rungs and makes the ladder unauditable. Freeze the reference inside the data — MAX(paid_on) here — and the ladder reproduces exactly.",
      notes: [
        { choice: 0, why: "SUM vs COUNT changes the units (dollars vs plans), not which plans land in a rung. Bucket membership is a date-arithmetic question." },
        { choice: 2, why: "The /100 forms scale every bucket identically — bucket COUNTS wouldn't move at all, and both dollar ladders would be proportionally off, not differently filed." },
      ],
      difficulty: "hard",
    },
    {
      id: "klarna-mcq-10",
      prompt: "Five plans collect in two installments. You need days-to-collect per plan (issue → FIRST installment). Which shape survives two installments sharing a timestamp?",
      choices: [
        "Join plans to MAX(paid_on) per plan",
        "MIN(JULIANDAY(paid_on) - JULIANDAY(issued_on)) per plan",
        "ROW_NUMBER() OVER (PARTITION BY invoice_id ORDER BY paid_on, id) = 1, then compute the delta",
        "AVG over all installment deltas per plan",
      ],
      answer: 2,
      why: "ROW_NUMBER with an ORDER BY paid_on, id tie-break picks exactly one row even when the two installments share a timestamp — deterministic and column-preserving. MIN(delta) is also valid for timing-only asks; the MAX join-back returns both tied rows and doubles every downstream count.",
      notes: [
        { choice: 0, why: "The bare MAX join-back returns BOTH rows when they tie on paid_on — fan-out that silently doubles every plan-level figure built on top." },
        { choice: 3, why: "AVG over split rows averages the first and second installment deltas — plan #19's clock becomes a blend, and slow second installments drag every average." },
      ],
      difficulty: "hard",
    },
    {
      id: "klarna-mcq-11",
      prompt: "A payment lands on '2024-03-05'. The month key is SUBSTR(paid_on, 1, 7). What does it return?",
      choices: ["2024-03", "2024-3", "03-2024", "2024-03-05"],
      answer: 0,
      why: "SUBSTR reads characters 1 through 7 of the ISO string — '2024-03'. Because ISO dates zero-pad months, the fixed-width prefix is a stable, sort-correct bucket key: every March payment folds into one group.",
      notes: [
        { choice: 1, why: "SQLite never strips padding — '2024-3' would be a different key from '2024-03', splitting March into two groups that both sort wrong against the 13 real months." },
        { choice: 3, why: "Without the length argument SUBSTR returns the rest of the string — the full date — and the 'month fold' becomes a per-day fold: 27 groups, none of them months." },
      ],
      difficulty: "easy",
    },
    {
      id: "klarna-mcq-12",
      prompt: "The month fold over payments returns 13 rows; the order book spans 2024-01 through 2025-02. Why doesn't 2024-01 appear?",
      choices: [
        "It appears with 0.00 — GROUP BY emits every month in range",
        "It's missing: no payments exist in 2024-01 (first plans issued 2024-02), and GROUP BY only emits keys that exist",
        "It appears as NULL",
        "The query errors on the empty month",
      ],
      answer: 1,
      why: "The book's first plans were issued 2024-02, so 2024-01 has zero collection rows — and absent keys never materialize from a GROUP BY. Showing the gap to finance requires a calendar spine LEFT JOIN, not a fold.",
      notes: [
        { choice: 0, why: "GROUP BY has no calendar. A zero row appears only if a spine table supplies the 2024-01 key — the fold itself cannot invent it." },
        { choice: 2, why: "NULL would require a row with a NULL month key to group. No rows, no group, no NULL — just absence." },
      ],
      difficulty: "easy",
    },
    {
      id: "klarna-mcq-13",
      prompt: "Each installment's share of the $69,612 book: amount_cents / SUM(amount_cents) OVER (). What does the empty OVER () compute?",
      choices: [
        "The whole-partition total — 6,961,200 cents — attached to every row without collapsing them",
        "A running total up to the current row",
        "Nothing — OVER () is a syntax error; ORDER BY is required",
        "The rail total, automatically",
      ],
      answer: 0,
      why: "Empty OVER () means the full partition is the frame: every one of the 27 rows keeps its identity and carries the same book-total denominator — the per-installment share read. GROUP BY method would collapse to two rows and lose the installment grain.",
      notes: [
        { choice: 1, why: "A running total appears when ORDER BY joins the OVER — the default frame becomes running. Empty OVER () has no order, so it's the whole partition." },
        { choice: 3, why: "Rail totals need PARTITION BY method inside OVER — the empty version knows nothing about rails." },
      ],
      difficulty: "medium",
    },
    {
      id: "klarna-mcq-14",
      prompt: "The rail packet uses UNION ALL: card (16, $37,364), wire (11, $32,248), TOTAL (27, $69,612). A reviewer switches it to UNION 'for safety'. What changes?",
      choices: [
        "Nothing — the three rows are distinct, so the output is identical today",
        "UNION dedups: identical rows across branches collapse — the day two branches tie, one silently disappears",
        "UNION sorts but keeps every row",
        "UNION rejects the TOTAL row as a duplicate",
      ],
      answer: 1,
      why: "UNION adds a sort-dedup pass. Today's three rows happen to be mutually distinct, so the packet looks unchanged — but the safety is illusory: two rails with tied counts and dollars (or a TOTAL equal to a branch) would merge, and the packet stops reconciling to the plain fold.",
      notes: [
        { choice: 0, why: "True today, by luck — which is exactly why the change passes review and ships. UNION ALL states the intent: append, never dedup money rows." },
        { choice: 2, why: "That's the dangerous half-truth: UNION does sort — and dedup. The dedup is the data-loss risk, not a display nicety." },
      ],
      difficulty: "medium",
    },
    {
      id: "klarna-mcq-15",
      prompt: "delta_usd = usd − LAG(usd) OVER (ORDER BY month). The first activity month (2024-02, $2,430) shows NULL. What does LAG(usd, 1, 0) do to that row?",
      choices: [
        "Nothing — the default only affects rows after the first",
        "The delta becomes 2430 − 0 = 2430: the whole month reads as growth from zero",
        "It errors — LAG takes one argument",
        "The delta becomes the LAST month's usd",
      ],
      answer: 1,
      why: "The third argument is the default when no prior row exists: 0 replaces 'no prior month', and the edge row reports +$2,430 of momentum the book never had. The NULL was information — the book's beginning — and the default launders it into a growth claim.",
      notes: [
        { choice: 0, why: "Backwards: the default applies exactly at the first row. Later rows have real priors and are untouched." },
        { choice: 2, why: "LAG(usd, offset, default) is standard — two optional arguments. The version trap is real but this call is legal." },
      ],
      difficulty: "medium",
    },
    {
      id: "klarna-mcq-16",
      prompt: "The month report ends ORDER BY 1. What does the 1 mean?",
      choices: [
        "Sort by row number, so output order equals input order",
        "Sort by the first SELECT column — the month key",
        "No-op: a literal constant orders nothing",
        "Sort by the id column",
      ],
      answer: 1,
      why: "A bare integer in ORDER BY is a positional reference to the SELECT list — 1 is month, 2 is usd. It works, but the house style spells the column name: positions break silently when someone reorders the SELECT.",
      notes: [
        { choice: 0, why: "Row-number ordering is ROW_NUMBER()'s job; ORDER BY 1 is a column reference, not a row index." },
        { choice: 2, why: "ORDER BY (1) with parentheses is the constant no-op. Bare 1 is positional — a real sort key that changes with the SELECT list." },
      ],
      difficulty: "easy",
    },
    {
      id: "klarna-mcq-17",
      prompt: "A threshold subquery is written as (SELECT method FROM payments) — all 27 rows — inside a scalar comparison. What happens at runtime?",
      choices: [
        "It returns the first method and the query succeeds",
        "Runtime error: the scalar subquery returned more than one row",
        "NULL — the comparison silently filters everything",
        "SQLite picks the alphabetically smallest method",
      ],
      answer: 1,
      why: "A scalar subquery is contractually zero-or-one rows. Feed it 27 and SQLite raises the error at execution — the loud failure. The silent failures are the other contract edge: zero rows yields NULL, and the report ships empty.",
      notes: [
        { choice: 0, why: "No 'first row' fudge exists for scalar context — unlike IN, which wants many rows. The contract breach is fatal, not forgiving." },
        { choice: 2, why: "NULL is the zero-rows outcome, not the many-rows outcome. Two different contract violations, two different symptoms." },
      ],
      difficulty: "hard",
    },
    {
      id: "klarna-mcq-18",
      prompt: "SUM(usd) OVER (ORDER BY month) runs over the 13-month fold. What does it produce?",
      choices: [
        "The grand total $69,612 repeated on every row",
        "A running total of collections, month by month — the default frame is RANGE UNBOUNDED PRECEDING to CURRENT ROW",
        "Each month's own total",
        "An error — aggregate windows require GROUP BY",
      ],
      answer: 1,
      why: "ORDER BY inside OVER activates the default frame: from the partition start through the current row — the collections burn-down. The grand-total-on-every-row shape is the EMPTY OVER (); the two differ by exactly the frame clause.",
      notes: [
        { choice: 0, why: "That's OVER () with no ORDER BY. Adding ORDER BY shrank the frame's right edge to the current row — the most common frame surprise in window SQL." },
        { choice: 2, why: "A plain SUM ... GROUP BY month gives per-month totals. The window version accumulates — it never resets." },
      ],
      difficulty: "hard",
    },
    {
      id: "klarna-mcq-19",
      prompt: "'Plans with at least one installment': WHERE EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id). Why is EXISTS the null-safe semi-join?",
      choices: [
        "It's always faster than IN",
        "It tests for a matching ROW per outer row — no value list is built, so no NULL can poison the result",
        "It converts NULLs to false automatically",
        "It's the only semi-join syntax SQLite allows",
      ],
      answer: 1,
      why: "EXISTS asks 'does even one matching row exist' and stops at the first match — values never enter the comparison, so there is nothing for a stray NULL to corrupt. 22 of 28 plans pass on this book; the 6 misses are the unpaid census.",
      notes: [
        { choice: 0, why: "Performance claims depend on the planner — modern SQLite treats both well. The reason to prefer EXISTS here is semantics under NULLs, not speed." },
        { choice: 2, why: "EXISTS doesn't transform NULLs — it never compares values at all. 'Automatic conversion' is the COALESCE-at-display-edge habit, not this clause." },
      ],
      difficulty: "medium",
    },
    {
      id: "klarna-mcq-20",
      prompt: "Self-join payments to itself for same-amount same-day installment pairs. Which ON clause reports each pair exactly once?",
      choices: [
        "a.amount_cents = b.amount_cents AND a.paid_on = b.paid_on",
        "… AND a.id <> b.id",
        "… AND a.id < b.id",
        "… AND a.method = b.method",
      ],
      answer: 2,
      why: "The strict inequality does double duty: it excludes self-pairs AND canonicalizes direction, so each unordered pair appears once — (a,b) survives, (b,a) doesn't. It's the same deterministic-tie-break discipline as picking first installments by paid_on, id.",
      notes: [
        { choice: 0, why: "With no id condition every row matches itself — 27 self-pairs of noise on top of any real echoes." },
        { choice: 1, why: "<> keeps both orderings: every echo counts twice, and the duplicate audit overstates the anomaly by exactly 2×." },
      ],
      difficulty: "hard",
    },
    {
      id: "klarna-mcq-21",
      prompt: "Over the 27 payment rows: COUNT(*) versus COUNT(DISTINCT method) read…",
      choices: ["27 and 2", "27 and 27", "2 and 27", "22 and 2"],
      answer: 0,
      why: "COUNT(*) counts installment events — 27; COUNT(DISTINCT method) folds to the distinct rails — card and wire, 2. Same scan, two grains, and the report should print both labels.",
      notes: [
        { choice: 1, why: "That would need COUNT(method) — which also reads 27 because method is NOT NULL. NULL-skipping is not deduplication." },
        { choice: 3, why: "22 is the distinct-plan grain (COUNT(DISTINCT invoice_id)) — a third number that doesn't belong in this particular fold." },
      ],
      difficulty: "easy",
    },
    {
      id: "klarna-mcq-22",
      prompt: "COUNT(*) FILTER (WHERE p.paid_on > i.due_on) appears beside a plain COUNT(*) in the rail report. What does FILTER do?",
      choices: [
        "Filters rows out of the result set",
        "Attaches the predicate to that one aggregate only — a late count riding the same scan as the total",
        "Replaces the WHERE clause",
        "Is not supported in SQLite",
      ],
      answer: 1,
      why: "FILTER scopes a WHERE to a single aggregate: COUNT(*) counts all installments in the group, the FILTER'd twin counts only late ones — 16 and 3 for card, 11 and 1 for wire, from one scan. It's the CASE sum's named-branch sibling.",
      notes: [
        { choice: 0, why: "Row-set filtering is WHERE's job — FILTER never removes rows from the output, only from that aggregate's input." },
        { choice: 3, why: "SQLite supports FILTER since 3.30. The portability caveat is real for old builds — know your runtime before shipping it to the close pack." },
      ],
      difficulty: "easy",
    },
    {
      id: "klarna-mcq-23",
      prompt: "Per-rail dollar gate: HAVING SUM(amount_cents)/100.0 > 35000. Which rails survive?",
      choices: [
        "Both — $37,364 and $32,248 clear it",
        "Card only — wire's $32,248 misses the bar",
        "Wire only",
        "Neither — HAVING cannot reference SUM",
      ],
      answer: 1,
      why: "HAVING judges folded groups: card's $37,364 passes, wire's $32,248 fails — one row survives. The gate is on the AGGREGATE, computed after GROUP BY; that's the clause's entire job.",
      notes: [
        { choice: 0, why: "That's WHERE-scale thinking: checking each value instead of the fold. The gate compares folded dollars, and wire folds under." },
        { choice: 3, why: "WHERE can't see aggregates — HAVING exists precisely to reference them. Wrong clause in the other direction." },
      ],
      difficulty: "medium",
    },
    {
      id: "klarna-mcq-24",
      prompt: "Two predicates fetch the same March rows: WHERE SUBSTR(paid_on,1,7) = '2024-03' versus WHERE paid_on >= '2024-03-01' AND paid_on < '2024-04-01'. Which ships, and why?",
      choices: [
        "SUBSTR — it's the house month-key shape",
        "The range — it's sargable: the index can seek, while the function-wrapped column forces a full scan",
        "Either — identical rows means identical plans",
        "The range — because BETWEEN reads faster",
      ],
      answer: 1,
      why: "Result-identical is not plan-identical. Wrapping paid_on in SUBSTR hides the column from the index — the planner scans and evaluates per row; the bare-column range seeks straight into March. EXPLAIN QUERY PLAN shows SEARCH versus SCAN.",
      notes: [
        { choice: 0, why: "SUBSTR is the right shape for GROUP BY keys, where it runs after the scan anyway. As a filter it's the anti-pattern — the key shape and the predicate shape are different jobs." },
        { choice: 2, why: "Same rows, different cost — and on a growing installments table, cost is a production concern, not a style note." },
      ],
      difficulty: "hard",
    },
    {
      id: "klarna-mcq-25",
      prompt: "The close pack wants the split-plan ids inline. GROUP_CONCAT(id) over the five split plans returns…",
      choices: ["'1,5,12,19,22'", "5", "'1 5 12 19 22'", "NULL"],
      answer: 0,
      why: "GROUP_CONCAT folds the group's ids into one comma-joined string — the default separator. It's the evidence cell beside COUNT(*) = 5: one query, the count AND the names.",
      notes: [
        { choice: 1, why: "That's COUNT(id). The concat exists precisely because '5' alone doesn't tell risk WHICH plans to pull." },
        { choice: 3, why: "NULL is the empty-group outcome — a non-empty class concats its members. Empty classes need COALESCE at the display edge." },
      ],
      difficulty: "medium",
    },
    {
      id: "klarna-mcq-26",
      prompt: "The collections memo shows delta_usd for 2024-02 as NULL (no prior month). Where may that NULL become 0?",
      choices: [
        "Mid-pipeline, so AVG(delta_usd) doesn't skip the first month",
        "At the display edge only — mid-pipeline zero mislabels 'the book began' as 'a flat month' and skews averages",
        "Nowhere — a NULL in the delta column is an error state",
        "In the LAG default argument, always, before anything else runs",
      ],
      answer: 1,
      why: "The NULL encodes 'no prior month exists' — true information about the book's edge. The memo may render 0.0; the pipeline may not, because AVG over the deltas would absorb a fake zero and every streak/island read would misfile the first month.",
      notes: [
        { choice: 0, why: "AVG skips NULLs correctly — 'fixing' that with a zero adds a below-average month that never happened and drags the average down." },
        { choice: 3, why: "LAG(usd, 1, 0) is a legitimate display choice — but it IS a display choice, and shipping it mid-pipeline is the bug, not the syntax." },
      ],
      difficulty: "easy",
    },
    {
      id: "klarna-mcq-27",
      prompt: "WITH monthly AS (…), laddered AS (SELECT …, LAG(usd) OVER (…) FROM monthly) — what are the CTE scoping rules?",
      choices: [
        "Later CTEs can reference earlier ones; never backwards",
        "Any CTE may reference any other, in any order",
        "CTEs cannot reference other CTEs — only tables",
        "A CTE can reference itself without any keyword",
      ],
      answer: 0,
      why: "WITH is forward-only: laddered sees monthly, monthly can't see laddered, and self-reference requires WITH RECURSIVE. The chain reads top-down — stage the fold, name it, build the delta on the named fold.",
      notes: [
        { choice: 1, why: "Backward references are exactly what RECURSIVE unlocks — and only with the keyword. Plain WITH is a strict DAG." },
        { choice: 2, why: "CTE-to-CTE reference is the entire point of staging: laddered consuming monthly is the pattern this kit's month-close pack runs on." },
      ],
      difficulty: "hard",
    },
    {
      id: "klarna-mcq-28",
      prompt: "Reconciliation: SELECT id FROM invoices WHERE status = 'paid' EXCEPT SELECT invoice_id FROM payments. What comes back?",
      choices: [
        "#28 — the paid plan with no installment behind it ($1,756.00 promised, nothing collected)",
        "All 21 paid plans",
        "The five split plans",
        "Empty — EXCEPT needs both sides to be identical queries",
      ],
      answer: 0,
      why: "EXCEPT is the directional difference — paid-status ids minus collected ids. 21 paid plans minus 22 ids with installments leaves exactly #28: status says paid, evidence says nothing moved. One row, one anomaly, one page to the reconciliation desk.",
      notes: [
        { choice: 1, why: "That's the left side alone. The EXCEPT is what subtracts the 22 plans that DO have installments, isolating the contradiction." },
        { choice: 2, why: "The split plans are paid AND collected — they're on both sides, so EXCEPT drops them. Only the paid-with-no-evidence plan survives." },
      ],
      difficulty: "medium",
    },
    {
      id: "klarna-mcq-29",
      prompt: "Which fold proves each of the five split plans collects in two equal installments?",
      choices: [
        "AVG(amount_cents) per plan equals the plan amount / 2",
        "Per plan: COUNT(*) = 2 AND MIN(amount_cents) = MAX(amount_cents)",
        "SUM(amount_cents) per plan equals the plan amount",
        "MAX(amount_cents) per plan",
      ],
      answer: 1,
      why: "The proof needs both conditions: the count gate (exactly two installments) and the spread test (min = max means the two are equal). Probed: #1, #5, #12, #19, #22 all pass — closers sum to $12,470.00, same as openers.",
      notes: [
        { choice: 0, why: "Circular: for ANY two rows the average is half their sum. The equality test needs MIN = MAX; the average proves nothing about equality." },
        { choice: 2, why: "True for every fully-collected plan, split or not — it proves coverage, not the equal-halves cadence." },
      ],
      difficulty: "medium",
    },
    {
      id: "klarna-mcq-30",
      prompt: "The big-ticket monitor runs on an empty staging copy of payments (0 rows). The scalar threshold (SELECT AVG(amount_cents) FROM payments) then…",
      choices: [
        "Evaluates to 0 — every installment would pass, if any existed",
        "Evaluates to NULL — every comparison is UNKNOWN, and the report ships empty and silent",
        "Errors — AVG over zero rows is illegal",
        "Falls back to averaging invoices.amount_cents",
      ],
      answer: 1,
      why: "AVG over an empty set is NULL — not zero, not an error. amount > NULL is UNKNOWN, WHERE passes nothing, and 'no big tickets' and 'no data' render identically: blank. On staging copies that's the bug — opposite findings wearing the same empty screen.",
      notes: [
        { choice: 0, why: "Zero needs COALESCE — and would be WRONG here: it would declare every installment big-ticket the moment one row exists below-average… the honest fix is surfacing the empty population, not defaulting the threshold." },
        { choice: 2, why: "Aggregates over empty sets are legal and return NULL (COUNT returns 0). The silence is the failure mode, not a crash." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-klarna-1",
      tier: "medium",
      topic: "j7",
      universe: "month-close",
      title: "Installment rails: the late-payment split",
      brief:
        "Month-close memo from collections ops: the per-rail late split goes into tonight's credit pack, and risk reads it at two grains — installment events and dollars. The book holds 27 installments across 22 plans; probed figures: card 16 installments totaling $37,364, wire 11 totaling $32,248, every plan cut on uniform 30-day terms. Late is a row-level test — paid_on > due_on — and amounts are INTEGER cents, so the dollar read is amount_cents / 100.0. One fold, the honest denominator, worst rail first.",
      ask: "Return each collection rail with its installment count, late-installment count and late share (1 decimal), worst share first.",
      template:
        "SELECT p.method,\n       COUNT(*) AS installments,\n       SUM(CASE WHEN p.paid_on > i.due_on THEN 1 ELSE 0 END) AS late_paid,\n       ROUND({1} * SUM(CASE WHEN p.paid_on > i.due_on THEN 1 ELSE 0 END) / COUNT(*), 1) AS late_pct\nFROM payments p\nJOIN invoices i ON i.id = {2}\nGROUP BY p.method\nORDER BY late_pct {3};",
      slots: [
        {
          answer: "100.0",
          kind: "keyword",
          label: "the percent multiplier",
          why: "100.0 is REAL, so the division runs in floating point before rounding: card reads 18.8%. The INTEGER 100 multiplies after an integer division that already truncated — 3/16 computes to 0 and every rail's late share collapses to 0.0.",
        },
        {
          answer: "p.invoice_id",
          kind: "keyword",
          label: "the join key",
          why: "Each installment attaches to its plan via the installment's invoice_id. Swapping in i.id makes the ON condition compare the plan to itself — every installment matches every plan, the fold explodes to 756 rows, and the late split becomes fiction.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-first direction",
          why: "The credit pack opens with the risky rail: card 18.8% above wire 9.1%. ASC is a correct query answering the opposite question — it leads with the healthier rail and buries the number risk acts on.",
        },
      ],
      distractors: ["SUM", "MAX", "i.id", "100", "ASC"],
      walkthrough:
        "One join, one fold, one percent. The join attaches each of the 27 installment rows to its plan; GROUP BY method folds them into two rails. Inside each rail: COUNT(*) is the event grain — 16 card, 11 wire — SUM(CASE WHEN paid_on > due_on …) is the late count — 3 card, 1 wire — and 100.0 × late / COUNT(*) is the share — card 18.8%, wire 9.1%. The 100.0 is not decoration: the numerator and COUNT are both INTEGER, so integer division would floor card's 3/16 to 0 before the percent could exist. The dollars behind the split are the probed rails — card $37,364, wire $32,248 — and four late installments out of 27 is the book's whole risk story in one row. The distractors fail exactly where the craft lives: SUM or MAX in the multiplier slot is a syntax error, i.id in the join key compares the plan to itself and fans 27 rows into a 756-row cross product whose 'split' is noise, INTEGER 100 truncates both shares to 0.0, and ASC hands the credit pack the healthy rail first. Late share by rail, denominator intact — the query collections ops actually runs at close.",
    },
    {
      id: "cs-klarna-2",
      tier: "hard",
      topic: "s7",
      universe: "month-close",
      title: "Exposure aging: the open-plan ladder",
      brief:
        "Credit-risk memo, Monday review: the open book is 6 plans worth $19,609 and the committee reads it as a ladder, not a total. Age each open plan by days outstanding since issue, against a reference date frozen inside the data — MAX(paid_on) — so re-runs reproduce today's ladder exactly. Ladder rungs: 0–30, 31–60, 61–90, 90-plus days, dollars per rung in INTEGER cents (/100.0). The audit rule the committee applies: the four rungs must reconcile back to $19,609 or the net has a hole.",
      ask: "Return one row: open-plan exposure in dollars (2 decimals) per aging rung — 0-30, 31-60, 61-90, 90+ days outstanding — summing to the open-book total.",
      template:
        "SELECT\n  {4}(CASE WHEN d <= 30 THEN amt ELSE 0 END) / 100.0 AS days_0_30_usd,\n  SUM(CASE WHEN d BETWEEN 31 AND 60 THEN amt ELSE 0 END) / 100.0 AS days_31_60_usd,\n  SUM(CASE WHEN d BETWEEN 61 AND 90 THEN amt ELSE 0 END) / 100.0 AS days_61_90_usd,\n  SUM(CASE WHEN d > {1} THEN amt ELSE 0 END) / 100.0 AS days_90_plus_usd\nFROM (SELECT CAST(JULIANDAY((SELECT MAX(paid_on) FROM payments))\n                     - JULIANDAY({2}) AS INTEGER) AS d,\n             {3} AS amt\n      FROM invoices\n      WHERE status = 'open');",
      slots: [
        {
          answer: "90",
          kind: "number",
          noVerify: true,
          label: "the deepest rung edge",
          why: "The 90-plus arm must catch everything the first three rungs missed: d > 90 is the complement of 0–30, 31–60 and 61–90. A 60 here double-files the 61–90 plan into two rungs; a 104 excludes the deepest plan entirely and the ladder no longer reconciles to $19,609.",
        },
        {
          answer: "issued_on",
          kind: "keyword",
          label: "the aging anchor date",
          why: "Exposure ages from the day the plan was issued. due_on measures days PAST DUE instead (a different ladder with 3 not-yet-due plans), and created_at isn't a column on plans at all — the query must fail loudly rather than age the book from a date that doesn't exist.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the exposure amount",
          why: "The rungs price the book in plan amounts, stored as INTEGER cents. Substituting id sums plan keys — $0.78 of 'exposure' — a number that reconciles with nothing; the cents column keeps rungs in the unit the /100.0 conversion expects.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the dollar fold",
          why: "Each rung prices exposure, so the CASE output folds with SUM: 3 plans totaling $12,504 in the 0–30 rung. COUNT would count plans (3, 1, 1, 1) — the event grain, not the money grain — and MAX or AVG price a rung by one plan instead of the rung's total.",
        },
      ],
      distractors: ["due_on", "id", "COUNT", "MAX", "AVG", "created_at"],
      walkthrough:
        "A CASE ladder over a pre-staged day-count. The derived table reduces each open plan to two columns — d, days outstanding since issue against the frozen reference (MAX(paid_on) = the newest collection in the book), and amt, the plan's INTEGER-cent amount. The outer SELECT pivots the 6 plans into 4 rungs: 0–30 holds 3 plans / $12,504.00, then single plans at $4,937.00 (31–60), $1,295.00 (61–90) and $873.00 (90-plus) — reconciling exactly to the $19,609.00 open book the brief quotes. The reference date is the quiet hero: frozen inside the data, Monday's ladder reproduces Friday's, which is the only way an aging report can be diffed. The distractors are the real bug patterns: due_on ages by days past due and refiles 4 of the 6 plans, created_at isn't a column on plans (loud failure — the good kind), id prices rungs in plan keys ($0.78 of exposure), COUNT prints the plan grain (3, 1, 1, 1) where the committee asked for dollars, and MAX or AVG collapse a multi-plan rung to one plan's price. Four rungs, one reconciliation, zero clock drift — that's the Monday ladder.",
    },
    {
      id: "cs-klarna-3",
      tier: "easy",
      topic: "t5",
      universe: "month-close",
      title: "Split-plan closers: the tail installment",
      brief:
        "Month-close evidence memo from collections ops: five plans on this book collect in two installments — #1, #5, #12, #19, #22 — and the close pack must show each plan's CLOSING installment, not its opener. Probed figures: the five closers are $2,430.00, $2,642.00, $2,361.50, $2,807.00 and $2,229.50 — $12,470.00 in total, each exactly equal to its plan's opener. Number the installments inside each plan by paid_on (earliest first, id as the tie-break), then keep rank 2 — it exists only where a plan collected twice. Amounts are INTEGER cents; the dollar read is amount_cents / 100.0.",
      ask: "Return each split plan's closing installment: plan id, paid_on and the dollar amount, ordered by plan id.",
      template:
        "SELECT invoice_id, paid_on, amount_cents / 100.0 AS usd\nFROM (SELECT ROW_NUMBER() OVER ({1} ORDER BY {2}, id) AS rn,\n             invoice_id, paid_on, amount_cents\n      FROM payments)\nWHERE rn = {3}\nORDER BY invoice_id;",
      slots: [
        {
          answer: "PARTITION BY invoice_id",
          kind: "keyword",
          label: "the per-plan restart",
          why: "PARTITION BY invoice_id restarts the count inside each plan, so rank 2 means 'the second collection of THIS plan'. Without it the window numbers all 27 installments in one global sequence and rank 2 belongs to exactly one arbitrary row — the pick-one discipline collapses.",
        },
        {
          answer: "paid_on",
          kind: "keyword",
          label: "the within-plan order",
          why: "Ordering earliest-first puts the closer at rank 2 of 2. paid_on DESC flips the sequence: rank 2 becomes the opener and the 'closing installment' column quietly fills with opening rows — same shape, opposite evidence. issued_on isn't a column on payments at all (it lives on plans): the loud failure.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the closer's rank",
          why: "Rank 2 exists only where a plan collected twice — the five split plans; single-installment plans end at rank 1. rn = 1 returns all 22 collected plans' openers instead. The constant is a row index, never a result cell, so the audit skips its value check.",
        },
      ],
      distractors: ["paid_on DESC", "ORDER BY invoice_id", "issued_on"],
      walkthrough:
        "Pick-one rows, the deterministic way. The derived table numbers every installment inside its plan — ROW_NUMBER, PARTITION BY invoice_id, ORDER BY paid_on with id as the tie-break — and the outer filter keeps rank 2, which only the five split plans possess: #1 closing 2024-02-20 at $2,430.00, #5 2024-04-22 at $2,642.00, #12 2024-08-25 at $2,361.50, #19 2024-11-25 at $2,807.00, #22 2025-01-13 at $2,229.50 — $12,470.00 of tail collections, each equal to its opener to the cent. The tie-break is not decoration: split-collection files produce same-day installments routinely, and id makes 'second' mean exactly one row. The distractors fail where the craft lives: paid_on DESC inverts the sequence so rank 2 becomes the opener — the evidence pack ships opening rows labelled as closers; ORDER BY invoice_id inside OVER is a syntax error (two ORDER BYs in one window); issued_on errors loudly because payments has no such column — the good kind of failure.",
    },
    {
      id: "cs-klarna-4",
      tier: "medium",
      topic: "q2",
      universe: "fraud",
      title: "Big-ticket monitor: above the book average",
      brief:
        "Fraud desk memo: funding cost and review load concentrate in large single installments, so the desk wants a per-rail census of big-ticket collections — every installment larger than the book-wide average single installment. Probed figures: 27 installments totaling $69,612, so the scalar threshold is $2,578.22 (257,822.22 cents); 12 installments clear it — wire 7 totaling $23,245.00, card 5 totaling $15,223.00. The threshold is a scalar subquery over the same table; amounts are INTEGER cents and the dollar read divides by 100.0 once, at the end.",
      ask: "Return each rail with its big-ticket installment count and their dollar total, biggest count first.",
      template:
        "SELECT p.method,\n       COUNT(*) AS big_installments,\n       SUM(p.amount_cents) / {1} AS big_usd\nFROM payments p\nWHERE p.amount_cents > (SELECT {2}(amount_cents) FROM payments)\nGROUP BY p.method\nORDER BY big_installments {3};",
      slots: [
        {
          answer: "100.0",
          kind: "keyword",
          label: "the dollar conversion",
          why: "100.0 keeps the fold in REAL arithmetic — the honest dollar read. 1000 denominates in thousands (2,324.50 reads like 2.3k). The bare INTEGER 100 happens to divide this book's big-ticket sums evenly — coincidence today, a truncation bug the day an odd-cent sum appears — so the house shape is 100.0 regardless.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the threshold fold",
          why: "AVG folds the whole book into the one-number threshold: 257,822.22 cents. MAX sets the bar at the largest installment — nothing clears it and the census ships empty; SUM exceeds every row; COUNT compares dollars against 27 and passes everything, reporting the entire book as big-ticket.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-count-first order",
          why: "DESC leads with wire's 7 — the rail carrying more big-ticket volume, which is the headline the desk reads first. ASC is a correct query answering the opposite question and buries the finding under the smaller count.",
        },
      ],
      distractors: ["MAX", "SUM", "COUNT", "1000", "ASC"],
      walkthrough:
        "One scalar, one fold, one order. The scalar subquery computes the book-wide average installment — 6,961,200 cents over 27 rows, $2,578.22 — exactly once, because it's uncorrelated; WHERE keeps the 12 installments that clear it, GROUP BY folds them per rail, and the report reads wire 7 / $23,245.00, card 5 / $15,223.00 — $38,468.00 of the book riding 12 collections. The census is a fraction of the book by count (12 of 27) but over half by dollars — that concentration is the fraud desk's whole point. The distractors are the real failure patterns: MAX thresholds at the largest installment and ships an empty report; SUM exceeds every row (also empty); COUNT compares cents to 27 and passes ALL 27 — the monitor reports the whole book as big-ticket, the opposite finding; 1000 rescales dollars into thousands; and ASC hands the desk the smaller rail first.",
    },
    {
      id: "cs-klarna-5",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "Collections momentum: the month-over-month ladder",
      brief:
        "Growth review memo: the collections engine reads as a motion picture — collected dollars per activity month, then the month-over-month delta. Probed figures: 13 activity months from 2024-02 to 2025-02, $69,612 collected across 27 installments; the biggest jump is +$5,563.00 into 2024-03 ($7,993.00), the deepest dip is −$3,762.00 into 2024-04 ($4,231.00), and the latest read is 2025-02 at $7,076.00 (+$1,199.00). The delta is a LAG over the month fold; months are SUBSTR(paid_on, 1, 7) keys; the first activity month has no prior, and its delta stays NULL — that NULL is information, not a defect.",
      ask: "Return each activity month with its collected dollars and the month-over-month delta, in month order.",
      template:
        "SELECT month, usd, usd - {1}(usd) OVER (ORDER BY month) AS delta_usd\nFROM (SELECT SUBSTR(paid_on, 1, 7) AS month, SUM(amount_cents) / {2} AS usd\n      FROM payments\n      GROUP BY month)\nORDER BY {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the backward window",
          why: "LAG looks one month back: delta = this month − previous, NULL at the book's edge. LEAD flips the sign on every row and moves the NULL to the end; SUM turns the delta into a running-total subtraction and the momentum column becomes a burn-down. The memo's sign convention is LAG's.",
        },
        {
          answer: "100.0",
          kind: "keyword",
          label: "the dollar conversion",
          why: "100.0 keeps the month fold REAL — $7,993.00 prints as dollars before the delta math runs. Anything else rescales the whole ladder (1000 denominates in thousands) and every delta inherits the wrong unit, silently.",
        },
        {
          answer: "month",
          kind: "keyword",
          label: "the time axis",
          why: "Month order is the ladder's spine: the reader walks 2024-02 → 2025-02 chronologically. Ordering by usd DESC re-ranks by size — a leaderboard, not a timeline; delta_usd sorts by momentum and hides which month produced it.",
        },
      ],
      distractors: ["LEAD", "SUM", "usd DESC", "delta_usd"],
      walkthrough:
        "Stage the fold, then look backward. The derived table folds 27 installments into 13 month keys — 2024-02 opens the book at $2,430.00, 2024-03 spikes to $7,993.00 (+$5,563.00), 2024-04 drops to $4,231.00 (−$3,762.00), and the ladder walks to 2025-02 at $7,076.00 (+$1,199.00) — the whole collections story in 13 rows. LAG(usd) OVER (ORDER BY month) is the momentum engine: each delta compares against the PRIOR month, and the first row's NULL is the book's edge — do not zero it mid-pipeline or the average delta absorbs a fake month. The distractors are the real traps: LEAD measures this month minus NEXT — every sign flips and the NULL relocates to the end, so the memo's headline (+$5,563 into March) becomes a different claim about February; SUM turns the delta into a running-total subtraction; usd DESC and delta_usd both sort validly and both destroy the time axis — a momentum report the reader can't walk through chronologically isn't a momentum report.",
    },
    {
      id: "cs-klarna-6",
      tier: "medium",
      topic: "x3",
      universe: "month-close",
      title: "Rail packet: collected dollars with a TOTAL row",
      brief:
        "Month-close packet memo: the close pack opens with a two-rail fold — card 16 installments / $37,364.00, wire 11 / $32,248.00 — and a TOTAL row stacked underneath: 27 installments, $69,612.00. The packet ships as labelled branches appended with UNION ALL; cents fold per branch and the division by 100.0 happens ONCE, in the outer select, so both branches share the conversion. The reconciliation rule the pack must satisfy: the three rows' counts and dollars must sum-fold back to the plain COUNT(*) and the $69,612.00 total, and the TOTAL row — the largest count — sorts last.",
      ask: "Return the packet: rail, installment count and collected dollars per branch, plus the TOTAL row, biggest count last.",
      template:
        "SELECT packet, plans, cents / {2} AS usd FROM (\n  SELECT method AS packet, COUNT(*) AS plans, SUM(amount_cents) AS cents\n  FROM payments\n  GROUP BY method\n  UNION ALL\n  SELECT {1} AS packet, COUNT(*) AS plans, SUM(amount_cents) AS cents\n  FROM payments\n)\nORDER BY plans {3};",
      slots: [
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the summary label",
          why: "The literal must be quoted: 'TOTAL' is a label cell in the packet's first column. Bare TOTAL parses as a column reference — no such column, loud error. A different quoted label runs but changes the cell the pack greps for — 'collected' is not 'TOTAL' to the reader or the audit.",
        },
        {
          answer: "100.0",
          kind: "keyword",
          label: "the single conversion point",
          why: "One conversion for the whole packet: the outer select divides folded cents by 100.0, so both rails and the TOTAL row share it. Per-branch conversions invite one branch drifting — and the packet's reconciliation rule is that TOTAL equals the rails to the cent.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the summary-last order",
          why: "DESC puts the TOTAL row (27 plans) at the bottom — the packet's closing line, under the rails it summarizes. ASC files the summary first, above the numbers it aggregates; the pack's readers expect totals last.",
        },
      ],
      distractors: ["TOTAL", "'collected'", "1000", "ASC", "SUM"],
      walkthrough:
        "Labelled branches, one conversion, summary last. Each UNION ALL branch folds the same table differently: the first groups by method into the two rails — card 16 / $37,364.00, wire 11 / $32,248.00 — the second skips GROUP BY and folds the whole table into the TOTAL row: 27 / $69,612.00. The outer select divides cents by 100.0 once, so all three rows convert through the same expression, and ORDER BY plans DESC closes the packet with the summary. UNION ALL is the intent statement: append, never dedup — a plain UNION would survive today (the rows are distinct) but silently delete a branch the day two rails tie. The distractors: bare TOTAL is a column reference and errors; 'collected' runs but relabels the row the pack greps for; 1000 rescales every dollar to thousands; ASC floats the summary above its own inputs; SUM without parentheses is a misuse error in every slot it can reach. Three rows, one fold, reconciled to the cent — the packet the close actually ships.",
    },
  ],

  problems: [
    { slug: "delinquency-buckets", why: "Days-past-due bucketing over a credit book — the aging ladder rungs risk reviews every Monday, in graded form: bucket edges that tile the timeline without gaps or overlaps." },
    { slug: "ar-aging-schedule", why: "The AR aging schedule as a pivot — counts and dollars per rung from one scan, with rung totals that must reconcile back to the open-book figure before the committee reads them." },
    { slug: "vintage-default-curves", why: "Cohort plans issued in the same month tracked forward — the vintage curve machinery that turns the on-time split into a loss forecast a chief credit officer will defend." },
    { slug: "delinquency-roll-rates", why: "LAG between delinquency buckets — how much of the 31–60 rung rolled to 61–90 this month. Roll rates are the earliest warning the ladder gives, and the query is a self-join on bucket keys." },
    { slug: "customers-who-never-order", why: "The anti-join exposure read — plans with no installment row (6 of them, $15,217 on this book): LEFT JOIN + IS NULL is the dunning list, and filter placement decides whether it exists." },
    { slug: "monthly-transactions-i", why: "Month-bucket collection totals with a status-conditional count alongside — the collections calendar finance opens every close with, in graded form." },
    { slug: "monthly-transactions-ii", why: "UNION ALL month packets splitting collected from uncollected — the month-close packet stitched from labelled branches whose counts must sum to the book." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one pass with the 100.0-before-division fix — the honest-denominator habit every late share and on-time rate in this kit needs." },
    { slug: "trial-balance-check", why: "Debits-equal-credits in one conditional SUM — the ledger reflex this kit's reconciliation topics reward; the delta is the only metric allowed to be boring." },
    { slug: "gl-reconciliation", why: "Ledger-delta reconciliation: two folds that must agree, and the delta query that localizes the plan that broke the balance — the exception queue in query form." },
    { slug: "balance-rollforward", why: "Opening balance + movements = closing balance, proved row by row — how collections ops walks the receivables account from one close to the next." },
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded share where unmatched plans count as zero — the coverage-share shape, with the NULL policy stated instead of leaked." },
    { slug: "count-salary-categories", why: "CASE tiers stacked with UNION ALL totals — coverage-class censuses (exact / partial / none) whose branches must reconcile to COUNT(*)." },
    { slug: "mrr-waterfall", why: "LAG movement classification — every plan's balance walked from prior state to current state, the reconciliation waterfall in interview clothing." },
    { slug: "number-of-rich-customers", why: "COUNT(DISTINCT) over a money threshold — the exposure-above-floor census: how many shoppers carry plans past a limit, counted once no matter how many installments." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Repeat-financing windows — a shopper financing again within days of the last plan is both the growth signal and the leverage risk; the window test is pure date arithmetic." },
    { slug: "maximum-transaction-each-day", why: "Largest installment per collection day — the pick-one-row audit ops runs against the daily collections file before it reconciles it into the close pack." },
    { slug: "uber-first-transaction", why: "First installment per plan — the first-collection definition (MIN or rn = 1, never a per-row average) that every days-to-collect figure in this kit stands on." },
    { slug: "the-most-recent-three-orders", why: "Top-N per group via ROW_NUMBER — the newest collections per rail, the same pick-one discipline the split-plan closer pull uses, with an N past one." },
    { slug: "second-highest-salary", why: "Second-largest single installment via scalar subquery — including the NULL outcome when no second exists, the exact contract the big-ticket monitor's threshold relies on." },
    { slug: "game-play-analysis-iv", why: "First-event cohort then a share over it — the fraction of plans whose FIRST installment lands on time, computed with the 100.0-before-division habit." },
    { slug: "investments-in-2016", why: "COUNT(DISTINCT) grouped over money — distinct payers per rail, the two-grain read (installment events versus distinct plans) in graded form." },
    { slug: "biggest-window-between-events", why: "Largest gap between consecutive events — the LAG gap that flags a plan stalling between installments, the dunning trigger in interview clothing." },
    { slug: "second-day-confirmation", why: "Consecutive-day event tests — the split-collection cadence check: did this plan's second installment land on schedule after the first?" },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "LAG flag chains — installment amounts escalating across a plan, the same consecutive-row machinery the on-time streak (gaps and islands) query needs." },
    { slug: "duplicate-charge-pairs", why: "Self-join for same-amount same-day pairs — the duplicate-installment audit, with the a.id < b.id key that keeps each echo counted once." },
    { slug: "circular-transfers", why: "Mutual pairs under a window — pairwise rail analysis (two plans echoing each other), the fraud desk's co-occurrence read in graded form." },
    { slug: "most-common-course-pairs", why: "Pair counting at scale — co-occurring anomaly classes in the exception queue, ranked; the pairwise self-join family's aggregate side." },
    { slug: "friend-requests-ii-who-has-the-most-friends", why: "UNION ALL accumulation into one accepted column — the packet-building reflex: labelled branches appended, then folded, reconciling to the plain count." },
    { slug: "league-statistics", why: "Home/away branches with CASE verdicts stacked via UNION — the collected/uncollected packet shape, per-branch flags that must sum back to the book." },
    { slug: "count-apples-and-oranges", why: "Per-entity sums across branches with a total row — the rail packet with its TOTAL closer, the exact month-close artifact cs-klarna-6 ships." },
    { slug: "dormant-reactivation", why: "NOT EXISTS dormancy screens — plans with no recent collection aging into dunning; the anti-join family's cadence-aware cousin." },
    { slug: "transaction-velocity", why: "Time-bucketed bursts — installment counts per day spiking above baseline; the velocity screen the fraud desk runs beside the big-ticket census." },
  ],
};
