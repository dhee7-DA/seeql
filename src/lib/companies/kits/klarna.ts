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
  ],

  dayInLife: [
    "**08:00 —** The day starts on the credit dashboard, not the marketing one. First query is a health check on yesterday's collections: installments landed versus scheduled, the on-time share by rail (card installments pay late at **18.8%** against wire's **9.1%** on this book — the gap is the morning conversation), and whether the exception queue grew overnight. The queue is small and loud: a {rose:void} plan carrying a collected installment (#11, $925.00) and a paid plan with no installment behind it (#28, $1,756.00). Both are reconciliation pages, not curiosity items — *money moved where the lifecycle says it shouldn't, or is promised where nothing moved.*",
    "**11:00 —** Midday is exposure surgery. Risk wants the {violet:aging ladder} refreshed on the frozen reference date: 6 open plans, $19,609 total, bucketed by days outstanding — 3 plans inside 30 days carrying $12,504, then single plans at $4,937 (31–60), $1,295 (61–90) and $873 (90-plus). The follow-up questions are always the same shape: does the ladder reconcile back to the open-book total, and does the {amber:partial} plan (#25, $4,000.00 of $6,148.00) sit in the right rung? Each ask is a CASE ladder over a derived day-count, and the query gets written twice — once to answer, once with the reference date and bucket edges spelled out so the number survives review.",
    "**15:00 —** The afternoon is stakeholder cycles with SQL attached. Finance walks the ledger — **debits $181,080 against credits $181,080, delta $0.00** — and the per-account nets (cash $44,196, receivables $16,440) feed the close checklist. The collections lead wants the {rose:late} cohort cut by rail and by plan age; a product manager wants days-to-collect (average **28.4** against the 30-day terms, spread 13 to 84) defended from the query, not the slide. Every branch of every census reconciles against a plain `COUNT(*)` before it ships, because a delinquency number nobody can re-derive is a number nobody can act on.",
    "**17:30 —** EOD is the writeup. The aging ladder ships with its reference date in the comment; the split-installment plans (**#1, #5, #12, #19, #22**) ship with a first-installment definition (MIN per plan, never a per-row average); the exception log carries both mirror anomalies with their queries attached. The rhythm to internalize: Klarna SQL exists to prove that the schedule and the collections agree — *the plan is a promise, the installment is the evidence, and the gap between them is the entire job.*",
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
  ],
};
