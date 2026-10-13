// Stripe — kit 1 of the Fintech & Payments domain (Batch E).
// Payments infrastructure for the internet: charge lifecycles (authorize →
// capture → settle → refund/dispute), settlement-file reconciliation and a
// double-entry ledger where debits always equal credits. Pool provenance: the
// registry tags 8 Stripe SQL problems — ALL 8 land in this kit (topics +
// problems); the remaining slots are theme-curated fills from the SQL band
// (money folds, settlement clocks, duplicate scans), stated here per spec.
// Case studies run on the storefront db with probed figures from
// scripts/company-facts.md (probed 2026-10-12). The mapping is honest:
// invoices = charges, payments = settlements, ledger_entries = the ledger.
// Money columns are INTEGER cents; the facts file prints dollars — the read
// is amount_cents / 100.0.

import type { CompanyKit } from "../types";

export const stripeKit: CompanyKit = {
  id: "stripe",
  domainId: "fintech",
  name: "Stripe",
  tagline: "Payments infrastructure, charge by charge",
  accent: "text-indigo-400",

  brief: [
    "Stripe is the payments infrastructure of the internet — the API layer millions of businesses sit on to move money. The core object is the charge, and every charge has a lifecycle: authorized, captured, {emerald:settled}, then maybe refunded or disputed. Money movement IS the product, so the data is money movement: charges, settlement rows, and a double-entry ledger where every debit has a matching credit and the trial balance must read zero. On this app's storefront db the mapping is one-to-one: `invoices` are charges (28 of them), `payments` are settlements (27 rows covering 22 charges — five charges settle in two parts), and `ledger_entries` is the ledger (80 rows, debits $181,080 equal to credits $181,080). Money columns are INTEGER cents; every dollar read is `amount_cents / 100.0`.",
    "The data org splits into product analytics, risk, and the team this kit is really about: financial operations and reconciliation. Settlement files land daily and get reconciled against the ledger, and the real work lives in the **exception queue** — the db's verified anomalies are exactly Stripe's daily bread: a {rose:void}-but-settled charge (#11, $925.00), a paid charge with no settlement (#28, $1,756.00), five split-settlement charges (**#1, #5, #12, #19, #22**), and one {amber:partial} settlement ($4,000.00 of a $6,148.00 charge). An analyst here doesn't 'run reports'; they prove that two sides of a money movement agree, and when they don't, the diff query localizes the break in minutes.",
    "Interview style is correctness over cleverness, and the screens are famously definition-heavy. A typical hour opens with a fold over money (per-method settlement mix), moves to a join with a survival question (which charges never settled — and what does filtering the right table in WHERE do to your `LEFT JOIN`), escalates into a conditional aggregate where the **denominator** is the whole test, and often closes on an anomaly hunt: find the charges whose settlements don't rebuild the total. The graded habits are {violet:idempotency}, rounding (**100.0** before the division, ROUND once at the end), NULL policy stated out loud, and audit trails — a number that can't be re-derived from its query doesn't ship.",
    "Preparation: the registry tags 8 Stripe SQL problems and all 8 land in this kit's topics; the remaining slots are theme-curated from the SQL band — settlement clocks, ledger walks, duplicate scans, honest ratios — because that is what the screens probe. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the per-method settlement mix finance opens {amber:month-close} with (card **$37,364** over 16 events, wire **$32,248** over 11), the other rebuilds the {rose:exception census} reconciliation runs every morning — void-but-settled and paid-but-unsettled, counted and priced. Say the units and the denominator out loud before you compute anything; at Stripe the units are cents and the denominator is the interview.",
  ],

  dayInLife: [
    "**08:00 —** The day starts with the settlement file. First query of the morning is a reconciliation, not a dashboard: did last night's settlements land, do the row counts match the file header, does the dollar total agree with the ledger — and what's the method mix (on the sample db: card **16 settlements / $37,364**, wire **11 / $32,248**)? Then the exception queue: charges whose status and settlement history disagree. The two classes that matter — {rose:void-but-settled} and {sky:paid-but-unsettled} — are small (one each here) and enormous in consequence: money moved where the lifecycle says it shouldn't, or money the lifecycle promises that never moved. A mismatch is a page, not a shrug.",
    "**11:00 —** Midday is deep-dive work with definitions attached. A product team wants days-to-settle drift (**28.4-day average, 13-to-84 spread** — is the slow tail widening?); finance wants unsettled exposure priced (**$15,217 across 6 charges** — of placed charges, not settled ones, and the analyst says so); risk wants the {violet:split-tender scan} rerun to confirm every two-row charge rebuilds its total. Each ask is a join, a conditional aggregate, and one judgment call about status filters — and the query gets written twice: once to answer, once with the definition made explicit so the number survives the review argument.",
    "**15:00 —** The afternoon belongs to the ledger and the people who read it. The trial balance must read zero — **debits $181,080, credits $181,080, delta $0.00** — and the per-account nets (**cash $44,196**, **receivables $16,440**) feed the close checklist. This is the stakeholder hour: finance walks the nets line by line, and each one gets defended from the query, not the slide. Every branch of the census reconciles against a plain `COUNT(*)` before it leaves the building, because a number that only exists in a dashboard is a number nobody can audit.",
    "**17:30 —** EOD is the writeup. Every total ships with its SQL attached; every re-run is {emerald:idempotent}; every open question carries the query that would answer it tomorrow. The rhythm to internalize: at Stripe, correctness isn't a nice-to-have the interview rewards — it's the product constraint the whole day is built around, and the SQL is just where the discipline becomes visible.",
  ],

  metrics: [
    { name: "Authorization rate", what: "Approved authorizations ÷ attempted authorizations, per card network and region. The funnel's top gate — and the first place a decline-spike incident shows up before any money moves." },
    { name: "Capture rate", what: "Captured ÷ authorized. The auth-vs-capture gap is the first money leak in the lifecycle: authorized volume that never became chargeable, sliced by business and card brand." },
    { name: "Days to settle", what: "Charge issue → first settlement, in days. The kit's settlement-clock case rebuilds it: 20 paid charges averaging 28.4 days, fastest 13, slowest 84 — first settlement, never last, on split charges." },
    { name: "Settlement coverage", what: "Charges classified exact / partial / no settlement — 21 / 1 / 6 on the db. The coverage census is the reconciliation's opening read, and the classification is a CASE over a LEFT JOIN fold." },
    { name: "Unsettled exposure", what: "Dollar value of charges with no settlement row: $15,217 across 6 charges here. The AR number finance defends at close — computed over ALL charges, not the settled ones." },
    { name: "Dispute rate", what: "Disputed ÷ settled charges, watched inside the dispute window (terms run 30 days flat on the db). A ratio where the denominator is the whole test — the classic 100.0-before-division question." },
    { name: "Refund rate", what: "Refunded ÷ captured volume. The reverse-money-flow number: every refund is a settlement in the other direction, and the ledger has to prove it balances." },
    { name: "Ledger balance delta", what: "Total debits − total credits. Must read $0.00 ($181,080 = $181,080 here) — the one metric at Stripe that is allowed, and required, to be boring." },
  ],

  topics: [
    {
      name: "Folds over money movement",
      why: "Every headline here is a fold over a money column: settled dollars per method, charges per status, debits minus credits per account. The cents rule sharpens it — amounts are INTEGER cents, so SUM(amount_cents) / 100.0 is the dollar read and integer division is the standing trap. Stripe drills whether you can fold money without leaking it.",
      slugs: ["trial-balance-check", "products-worth-over-invoices", "number-of-rich-customers"],
    },
    {
      name: "Settlement coverage & the anti-join",
      why: "The unsettled census is the anti-join this business runs daily: charges with no settlement row — 6 of them worth $15,217 on the sample db. LEFT JOIN + IS NULL (or NOT EXISTS) is the shape, and the trap is filtering the right table in WHERE, which silently converts the LEFT JOIN to an INNER and deletes exactly the rows you were hunting.",
      slugs: ["customers-who-never-order", "bank-account-summary", "count-student-number-in-departments"],
    },
    {
      name: "Month buckets & status-aware counts",
      why: "Settlement calendars are month-bucketed: SUBSTR(paid_on, 1, 7) folds payouts into '2024-03'-style keys with a conditional count of exceptions riding in the same fold. Stripe probes whether the status rule and the total come from one scan — branches that must reconcile to COUNT(*) before the report ships.",
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "the-latest-login-in-2020"],
    },
    {
      name: "Ledger reconciliation & balance walks",
      why: "The ledger is double-entry: every debit has a credit, the trial balance must read zero ($181,080 = $181,080 here), and the per-account nets (cash $44,196, receivables $16,440) feed the close. Balance walks and delta queries are how you localize a break — one fold per side, then the difference, then the account that drifted.",
      slugs: ["gl-reconciliation", "last-person-to-fit-in-the-elevator", "total-traveled-distance"],
    },
    {
      name: "Duplicate & split detection with self-joins",
      why: "Five charges on the db settle as two rows — split settlements — and the same self-join that finds them finds duplicate charges. The craft is canonicalization: p1.id < p2.id keeps one pair per unordered match, while <> double-counts both orientations and bare equality fans out to every peer including itself.",
      slugs: ["duplicate-charge-pairs", "symmetric-pairs", "most-common-course-pairs"],
    },
    {
      name: "Velocity & burst detection",
      why: "Risk runs velocity rules in fixed time buckets: settlements per minute per account, bursts flagged before a human ever looks. Bucket-then-count is the shape, and the follow-up is always the edge case: what does an empty bucket return, and does your rule fire on it or silently pass it?",
      slugs: ["transaction-velocity", "count-the-number-of-experiments", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Movement waterfalls with LAG",
      why: "Reconciliation reads a balance as a walk: prior row, current row, movement classified. LAG and LEAD are the tools, and the tie-break discipline (ORDER BY paid_on, id) is what keeps the walk deterministic when two settlements share a timestamp — which split files produce routinely.",
      slugs: ["mrr-waterfall", "second-day-confirmation", "consecutive-transactions-with-increasing-amounts"],
    },
    {
      name: "Snapshot deltas & FULL OUTER reads",
      why: "Settlement files get compared against the ledger as two snapshots: keys that appear on one side only, values that changed between cuts. FULL OUTER JOIN — and its UNION-ALL-with-anti-join ancestors — is the diff, and the NULL side you keep IS the finding, not noise to filter away.",
      slugs: ["snapshot-delta-detect", "employees-with-missing-information", "the-airport-with-the-most-flights"],
    },
    {
      name: "Honest ratios & rounded shares",
      why: "Dispute rates, capture rates, coverage shares — every rate here is a conditional sum over a count, and both failure modes are graded: integer division (100 must be 100.0) and denominator drift (the WHERE that filters the numerator's population out of the denominator). Round once, at the end, at the display edge.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "card-launch-success"],
    },
    {
      name: "Set-op packets & CASE censuses",
      why: "Month-close ships packets: settled versus unsettled, card versus wire — same columns, labelled branches, stacked with UNION ALL. The CASE census is the one-pass sibling, exception classes out of a single scan, and both shapes must reconcile against a plain COUNT(*) before anyone reads them.",
      slugs: ["monthly-transactions-ii", "count-salary-categories", "spend-histogram"],
    },
  ],

  theory: [
    {
      id: "stripe-t1",
      q: "A charge is authorized, captured, settled, then maybe refunded or disputed. In a query reporting settled volume, where does each lifecycle rule live — and what breaks when a row-level rule lands in the wrong clause?",
      a: "Lifecycle states are row-level facts, so they belong in WHERE — 'settled volume' filters to settlement rows joined to captured charges before any aggregation touches them. Once folded, the states no longer exist per row: HAVING can only judge group aggregates like SUM or COUNT, not recover rows you already summed. The classic failure is summing over all settlements and trying to subtract the void-but-settled charge in HAVING — that $925 is already inside the total, and no post-aggregation clause can un-mix it. The strong answer recites the pipeline — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — and places every filter by asking: is this a fact about one row, or about a group? At Stripe that question is the job, because a lifecycle rule in the wrong clause doesn't error — it reconciles to nothing and ships anyway.",
      tag: "pipeline",
    },
    {
      id: "stripe-t2",
      q: "Settlements LEFT JOIN charges: when does an INNER JOIN give the identical answer, and when does it silently delete the anomaly you were hunting?",
      a: "When every settlement matches a charge — the foreign-key world this db lives in — INNER and LEFT return the same rows from the settlements side; the difference only appears on charges with NO settlement, and those rows are the product here. The unsettled census (6 charges, $15,217) exists only under LEFT JOIN: unmatched charges survive with NULL settlement columns and IS NULL is the detection. The silent killer is filtering the right table's column in WHERE — p.method = 'card' discards the NULL-payload rows (NULL = 'card' is UNKNOWN), collapsing the LEFT JOIN to an INNER and deleting exactly the exceptions the reconciliation exists to find. The fixes: move the predicate into ON, or filter a pre-aggregated fold first. 'LEFT JOIN is safer' is not the answer — join type is a decision about who survives, and you state it out loud.",
      tag: "joins",
    },
    {
      id: "stripe-t3",
      q: "27 settlement rows cover 22 charges because five charges settle in two parts. Narrate every count in that sentence — and how you'd report both grains in one query.",
      a: "COUNT(*) over payments reads 27 — settlement events, the rows the file shipped. COUNT(DISTINCT invoice_id) reads 22 — charges covered, the business object. COUNT(amount_cents) also reads 27 because the FK is never NULL — NULL-skipping is not folding. The two-grain report folds once and counts twice: per method, settlement events AND distinct charges side by side, because card's 16 events might be 16 charges or fewer, and the split rate is the gap between the columns. The habit the interviewer grades: before any COUNT, say 'one row per what?' — settlement event, charge, method bucket. At Stripe the distinction is money: a duplicate-counted settlement inflates settled volume; a deduplicated count hides operational load, and both numbers ship to different teams on purpose.",
      tag: "aggregation",
    },
    {
      id: "stripe-t4",
      q: "A voided charge carries a settlement; a paid charge has none. When you LEFT JOIN settlements to charges, what is your NULL policy — filter, coalesce, or report?",
      a: "The NULL means 'no settlement row exists', and that is data — the exception class itself — not missingness to clean. The policy: classify, don't discard. The coverage census keeps every charge and CASEs the join result into exact, partial and none (21 / 1 / 6 on this db), because those counts ARE the reconciliation. Equality never detects it — NULL fails every test including against itself — the arm is IS NULL. COALESCE belongs at the display edge only: a coalesced zero mid-pipeline launders a paid-but-unsettled charge into a clean-looking $0.00 somebody will act on. And if the ask truly wants settled-only, filter in WHERE and say the population changed — 'this report covers the 22 charges with settlements' — because 28 minus 22 is the story that filter just deleted. A report whose WHERE does definitional work silently is the artifact Stripe's reviewers hunt for.",
      tag: "nulls",
    },
    {
      id: "stripe-t5",
      q: "Each charge can settle in several rows. How do you pick the FIRST settlement per charge, and what breaks with the bare MAX-join-back when two rows share a timestamp?",
      a: "Two honest shapes. Aggregate-only: fold per charge with MIN(JULIANDAY(paid_on) - JULIANDAY(issued_on)) — that's the settlement clock, 20 paid charges averaging 28.4 days, fastest 13, slowest 84 on this db. Row-picking: ROW_NUMBER() OVER (PARTITION BY invoice_id ORDER BY paid_on, id) = 1, and the id is the part interviewers wait for — it makes 'first' deterministic when two settlements share a timestamp, which split settlement files produce routinely. The bare MAX(paid_on) join-back returns BOTH tied rows, and every downstream count silently doubles; 'it still returns rows' is not a defense. Choose by output: if you need other settlement columns, take the window; if you only need the timing, the aggregate fold is cheaper and stages cleanly in a CTE named for what it holds — first_settlement, not cte2.",
      tag: "windows",
    },
    {
      id: "stripe-t6",
      q: "WHERE amount_cents/100.0 > (SELECT AVG(amount_cents)/100.0 FROM payments WHERE method = 'ach') — this db has no 'ach' method. Walk me through what happens.",
      a: "A scalar subquery is contractually zero-or-one rows, one column. One row: its value joins the comparison. Zero rows: it yields NULL — not an error, not zero — and amount > NULL is UNKNOWN, so WHERE passes nothing: an above-average report that returns empty while looking perfectly healthy. That's the empty-inner-query bug, and it ships on filtered staging tables far more often than on full ones. The strong answer also names the other contract edge: two rows from a scalar subquery IS an error, so 'scalar' is a promise you verify with the fold's GROUP BY, not an assumption. The correlated cousin — above THIS method's own average, re-run per outer row — is a different question with a different cost. At Stripe the follow-up is always: what population did the inner fold cover, and what does the report do when that population is empty? Silence is not an answer the risk team accepts.",
      tag: "subqueries",
    },
    {
      id: "stripe-t7",
      q: "Payment terms run 30 days flat on this db, and days-to-settle averages 28.4 with a 13-to-84 spread. How do you compute the window, bucket the months, and where does BETWEEN break?",
      a: "Window: JULIANDAY(paid_on) - JULIANDAY(issued_on) gives fractional days — take MIN per charge first (first settlement, not every split row), average, then ROUND(..., 1) exactly once at the outermost fold; 28.4 is a single final round, not a per-row one. Buckets: STRFTIME('%Y-%m', paid_on) or SUBSTR(paid_on, 1, 7) — the SUBSTR shortcut is safe only while the column stays fixed-width ISO, a convention nothing in the column enforces, so say it before you lean on it. Windows: half-open intervals — paid_on >= '2024-03-01' AND < '2024-04-01' — never BETWEEN, which is inclusive both ends and drops everything after midnight on the last day, exactly when month-end settlements land. And the terms check itself is a query: due_on − issued_on = 30 for all 28 charges, verified not assumed — one 27-day outlier would be the finding, not the exception you skip.",
      tag: "dates",
    },
    {
      id: "stripe-t8",
      q: "The trial balance must read zero: debits $181,080, credits $181,080. How do you prove it in one query — and localize the break when it doesn't?",
      a: "One pass, two conditional sums: SELECT SUM(debit_cents), SUM(credit_cents), SUM(debit_cents) - SUM(credit_cents) AS delta FROM ledger_entries — dollars via /100.0, delta printed beside the totals. Zero is the only acceptable value; the query is the proof and a non-zero delta is the page. Localization is the same shape one level down: GROUP BY account and read per-account nets — cash $44,196, receivables $16,440, revenue −$86,052, opex $25,416 here — because a broken balance always shows up as an account whose debit/credit pairing drifted. The traps are self-inflicted: COUNT where you meant SUM, SUMming dollars over cents (a 100× error the eye never catches), or auditing only the grand total while an offsetting error hides across two accounts. The habit: reconcile the total, then reconcile the parts, and treat 'two accounts both moved by the same amount' as the anomaly it usually is.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "stripe-mcq-1",
      prompt: "A settlement of 243,057 cents is reported as ROUND(amount_cents / 100, 2). What lands in the report?",
      choices: [
        "2430.57 — integer division still returns the cents",
        "2430 — the .57 was truncated away before ROUND ran",
        "2430.00 — SQLite rounds to the nearest cent",
        "2430.57 — ROUND heals the truncation",
      ],
      answer: 1,
      why: "Division of two INTEGERs truncates BEFORE ROUND ever sees the value: 243057 / 100 = 2430, and ROUND(2430, 2) is still 2430. The house shape is amount_cents / 100.0 — real division first, ROUND last, exactly once.",
      notes: [
        { choice: 0, why: "Integer division never 'returns cents' — it discards the remainder entirely. 243057/100 is 2430, not 2430.57; the 57 cents vanished at the division." },
        { choice: 3, why: "ROUND runs after the damage: its input is already the truncated 2430. No function downstream of a truncation recovers the truncated remainder." },
      ],
      difficulty: "easy",
    },
    {
      id: "stripe-mcq-2",
      prompt: "28 invoices: 21 paid, 6 open, 1 void. SELECT status, COUNT(*) FROM invoices GROUP BY status returns how many rows?",
      choices: ["1", "3", "28", "27"],
      answer: 1,
      why: "GROUP BY folds to one row per distinct status — paid, open, void — so 3 rows whose counts sum to 28. The fold's output grain is the group, not the input row.",
      notes: [
        { choice: 2, why: "28 is the input row count. GROUP BY collapses it to groups; you'd only see 28 rows from a GROUP BY on a 28-distinct-value column." },
        { choice: 3, why: "27 is the settlement count — a different table entirely. This fold reads invoices only, and it folds to the 3 statuses present." },
      ],
      difficulty: "easy",
    },
    {
      id: "stripe-mcq-3",
      prompt: "The settlements table holds 27 rows covering 22 charges — five charges settle in two parts. Which expression counts CHARGES settled, not settlement rows?",
      choices: ["COUNT(*)", "COUNT(amount_cents)", "COUNT(DISTINCT invoice_id)", "SUM(invoice_id)"],
      answer: 2,
      why: "COUNT(*) and COUNT(amount_cents) both read 27 — one row per settlement, and the FK is never NULL. COUNT(DISTINCT invoice_id) folds the split rows back to 22 charges. Both grains are real; the report must name which one it prints.",
      notes: [
        { choice: 1, why: "COUNT(column) skips NULLs, not duplicates — with a NOT NULL FK it equals COUNT(*) at 27. DISTINCT is the fold; NULL-skipping isn't." },
        { choice: 3, why: "SUM adds primary keys — a meaningless number that changes when any charge gains a second settlement row. Keys are for joining, never for folding." },
      ],
      difficulty: "medium",
    },
    {
      id: "stripe-mcq-4",
      prompt: "Both WHERE i.status = 'open' and WHERE p.id IS NULL return 6 charges on this db — but the dollar totals differ ($19,609 vs $15,217). Why?",
      choices: [
        "Rounding: the IS NULL version divides by 100 twice",
        "'Open' and 'unsettled' are different populations — one charge is open AND partially settled, one paid charge has no settlement",
        "The IS NULL version double-counts split settlements",
        "They're the same population; the difference is a data bug",
      ],
      answer: 1,
      why: "Status lives on the charge; settlement presence lives in the join. Charge #25 is open with $4,000 already settled, and charge #28 is paid with no settlement at all — so the two 6-row sets are not the same 6 charges. Unsettled exposure is the IS NULL census; the open pipeline is a status report.",
      notes: [
        { choice: 3, why: "A coincidence of counts is the most dangerous agreement in reconciliation — verify the row SETS, not just the row count." },
        { choice: 2, why: "Split settlements fan rows out, they never disappear them — and the IS NULL census counts charges, so fan-out can't move its total." },
      ],
      difficulty: "medium",
    },
    {
      id: "stripe-mcq-5",
      prompt: "Dispute share per method: which expression is safe against integer division AND denominator drift?",
      choices: [
        "SUM(CASE WHEN disputed THEN 1 ELSE 0 END) / COUNT(*) * 100",
        "100.0 * SUM(CASE WHEN disputed THEN 1 ELSE 0 END) / COUNT(*)",
        "100 * COUNT(disputed) / COUNT(*)",
        "100.0 * SUM(CASE ...) / COUNT(*) over rows pre-filtered to settled in WHERE",
      ],
      answer: 1,
      why: "100.0 promotes to real arithmetic BEFORE the division, and COUNT(*) runs over the same unfiltered fold as the numerator — no drift. Filtering settled rows in WHERE first shrinks the denominator to the numerator's population and every share reads 100%.",
      notes: [
        { choice: 0, why: "The logic is right but the INTEGER 100 multiplies after an integer division that already truncated — any share under 1% collapses to 0." },
        { choice: 2, why: "COUNT(disputed) counts non-NULL rows of the column — essentially every settlement — so the 'share' reads ~100 for any input." },
      ],
      difficulty: "medium",
    },
    {
      id: "stripe-mcq-6",
      prompt: "Two charges tie at the largest settlement amount; the next amount is smaller. DENSE_RANK() OVER (ORDER BY amount_cents DESC) assigns the third charge rank…",
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
      id: "stripe-mcq-7",
      prompt: "WHERE charge_id NOT IN (SELECT charge_id FROM disputes) — disputes.charge_id is nullable in the staging copy. What can happen?",
      choices: [
        "It runs slower but stays correct",
        "One NULL in the subquery empties the entire result — every row fails the test",
        "NULL charge_ids are treated as unmatched and kept",
        "SQLite rewrites NOT IN as an anti-join automatically",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE — the comparison is UNKNOWN and NOT UNKNOWN is still UNKNOWN. One stray NULL silently returns zero rows. The NULL-proof shapes: NOT EXISTS, or LEFT JOIN … IS NULL.",
      notes: [
        { choice: 0, why: "The failure is correctness, not latency — an empty 'clean charges' report that looks like good news." },
        { choice: 2, why: "NULLs don't 'fail through' to kept rows — they poison the whole membership test for every row, kept or not." },
      ],
      difficulty: "hard",
    },
    {
      id: "stripe-mcq-8",
      prompt: "WHERE amount_cents/100.0 > (SELECT AVG(amount_cents)/100.0 FROM payments WHERE method = 'ach') — this db has no 'ach' method. What does the query return?",
      choices: [
        "Every settlement — the threshold reads 0",
        "No rows, silently — the empty scalar subquery yields NULL and every comparison against NULL is UNKNOWN",
        "An error: scalar subqueries must return exactly one row",
        "Only settlements with NULL amounts",
      ],
      answer: 1,
      why: "A scalar subquery is contractually 0-or-1 rows; zero rows evaluates to NULL, not an error and not 0. amount > NULL is UNKNOWN, so WHERE passes nothing — an above-average report that ships empty. The reflex: sanity-check the inner fold's population before trusting the outer filter.",
      notes: [
        { choice: 0, why: "NULL is not 0 — nothing compares TRUE against it; the report is empty, not unfiltered." },
        { choice: 2, why: "Zero rows is inside the scalar contract (0-or-1); only two or more rows would error." },
      ],
      difficulty: "hard",
    },
    {
      id: "stripe-mcq-9",
      prompt: "Five charges settle as two rows each. JOIN payments p2 ON p2.invoice_id = p1.invoice_id AND p1.id <> p2.id — how many pairs per split charge, and why is p1.id < p2.id the fix?",
      choices: [
        "1 pair; <> and < are equivalent here",
        "2 pairs — each unordered pair counted in both directions; < keeps one canonical orientation",
        "0 pairs — <> excludes everything",
        "4 pairs — <> also matches a row to itself",
      ],
      answer: 1,
      why: "<> matches both orderings of every pair, so each split charge yields 2 ordered pairs — pair counts and pair sums double. p1.id < p2.id keeps exactly one orientation per unordered pair (and can't match a row to itself), which is why duplicate-charge scans and split-tender censuses canonicalize with <.",
      notes: [
        { choice: 3, why: "A row can't match itself under <> (id <> id is false) — the doubling comes from orientation, not self-pairs." },
        { choice: 0, why: "They differ exactly when a pair exists — which is the only case the scan cares about." },
      ],
      difficulty: "hard",
    },
    {
      id: "stripe-mcq-10",
      prompt: "The settlement clock averages days-to-settle at 28.4 across 20 paid charges. Where should the ROUND happen?",
      choices: [
        "Per row: ROUND each charge's latency to 1 decimal, then AVG",
        "Once, at the end: ROUND(AVG(latency), 1)",
        "Twice — per row and again at the end, for safety",
        "Never; let the client render precision",
      ],
      answer: 1,
      why: "Rounding is a display decision — make it once, at the outermost fold. Per-row rounding perturbs the inputs before the average, and the aggregate drifts from the truth; the audited shape rounds exactly once, at the outer SELECT.",
      notes: [
        { choice: 0, why: "Rounded inputs average to a different value than ROUND(AVG(raw), 1) whenever any row's raw latency carries more precision than the display — systematic drift, not noise." },
        { choice: 3, why: "Shipping full float precision isn't honesty, it's noise — pick the precision deliberately and round exactly once." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-stripe-1",
      tier: "medium",
      topic: "j7",
      universe: "month-close",
      title: "Card versus wire: the settlement mix",
      brief:
        "Month-close memo from settlements ops: the per-method settlement mix goes into tonight's close packet, and finance reads it as two grains — settlement events and dollars. The file holds 27 settlements; probed figures: card 16 settlements totaling $37,364, wire 11 totaling $32,248. The columns are INTEGER cents, so the dollar read is amount_cents / 100.0 — integer division by 100 is the standing truncation trap. Both grains, one fold, biggest method first.",
      ask: "Return each settlement method with its settlement count and settled dollars (2 decimals), biggest dollars first.",
      template:
        "SELECT p.method,\n       {1}(*) AS settlements,\n       ROUND(SUM(p.amount_cents) / 100.0, 2) AS settled_usd\nFROM payments p\nJOIN invoices i ON i.id = {2}\nGROUP BY p.method\nORDER BY settled_usd {3};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the event counter",
          why: "COUNT(*) counts the settlement rows folded into each method — 16 card, 11 wire. SUM(*) and MAX(*) don't exist: only COUNT takes the star to count rows rather than fold values.",
        },
        {
          answer: "p.invoice_id",
          kind: "keyword",
          label: "the join key",
          why: "Each settlement attaches to its charge via the settlement's invoice_id. Swapping in i.id makes the ON condition compare the invoice to itself — every payment matches every invoice, the fold explodes to 756 rows (card reads 448 'settlements'), and the mix becomes fiction.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The close packet opens with the money leader: card $37,364 above wire $32,248. ASC is a correct query answering the opposite question — it opens the packet with the smaller method.",
        },
      ],
      distractors: ["SUM", "MAX", "i.id", "p.number", "ASC"],
      walkthrough:
        "One fold, two grains, one unit conversion. The join attaches each of the 27 settlement rows to its charge; GROUP BY method folds them into two buckets. Inside each bucket: COUNT(*) is the event grain — 16 card, 11 wire — and SUM(amount_cents) / 100.0 is the money grain — $37,364.00 and $32,248.00, the probed figures. The 100.0 is not decoration: the column stores INTEGER cents, and integer division by 100 silently truncates any odd-cent settlement before ROUND could save it. ORDER BY settled_usd DESC puts card on top. The distractors fail exactly where the craft lives: SUM or MAX in the counter slot is a syntax error — the star counts only with COUNT — i.id in the join key compares the invoice to itself and fans 27 rows into a 756-row cross product whose 'mix' is noise, p.number is no column on payments, and ASC hands the close packet the smaller method first. Settled volume by method, events and dollars, one scan — the query finance actually runs at close.",
    },
    {
      id: "cs-stripe-2",
      tier: "hard",
      topic: "s6",
      universe: "refund-audit",
      title: "The exception census: void-but-settled, paid-but-unsettled",
      brief:
        "Reconciliation memo, 9am: the lifecycle says a settled charge is a paid charge — the db disagrees in exactly two verified places. Charge #11 is VOID yet carries a $925.00 settlement, and charge #28 reads PAID with no settlement row at all ($1,756.00 exposed). The census must classify all 28 charges by settlement-versus-status agreement and price each class — amounts are INTEGER cents, /100.0 for dollars. Counts must reconcile to 28 or the net has a hole.",
      ask: "Classify every charge as void_but_settled, paid_unsettled or clean, with charge count and exposed dollars (2 decimals) per class, biggest count first.",
      template:
        "SELECT CASE\n         WHEN i.status = 'void' AND s.settled {1} THEN 'void_but_settled'\n         WHEN i.status = 'paid' AND s.settled IS NULL THEN 'paid_unsettled'\n         ELSE {2}\n       END AS exception_class,\n       {3}(*) AS charges,\n       ROUND(COALESCE(SUM(i.amount_cents), 0) / 100.0, 2) AS exposed_usd\nFROM invoices i\nLEFT JOIN (SELECT invoice_id, SUM(amount_cents) AS settled\n           FROM payments\n           GROUP BY invoice_id) s\n       ON s.invoice_id = i.id\nGROUP BY exception_class\nORDER BY charges DESC, exception_class;",
      slots: [
        {
          answer: "IS NOT NULL",
          kind: "keyword",
          label: "the settlement-presence test",
          why: "The void arm must fire only when a settlement EXISTS: s.settled IS NOT NULL. IS NULL would make the arm unreachable (it demands a void charge with no settlement — the opposite of #11), and the $925 exception silently lands in 'clean'.",
        },
        {
          answer: "'clean'",
          kind: "keyword",
          label: "the exhaustiveness arm",
          why: "Everything the two exception arms don't catch is, by definition, consistent — the ELSE names it 'clean'. Point ELSE at 'paid_unsettled' instead and 26 consistent charges merge into the exception class, inflating it to 27 while the real one hides in the noise.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the charge counter",
          why: "COUNT(*) counts the charges folded into each class — 26, 1, 1 — and the three counts must reconcile to 28. SUM(*) and MAX(*) aren't valid folds over a star: only COUNT takes it.",
        },
      ],
      distractors: ["IS NULL", "= NULL", "= 0", "SUM", "MAX", "'paid_unsettled'"],
      walkthrough:
        "A two-arm net over a pre-folded LEFT JOIN. The derived table settles each charge once — SUM per invoice — so the join never fans out and all 28 charges survive exactly once. The CASE routes: void AND settled IS NOT NULL → void_but_settled (charge #11, $925.00); paid AND settled IS NULL → paid_unsettled (charge #28, $1,756.00); everything else → clean (26 charges, $84,296.00 of consistent exposure as the query prices it). Rows: clean 26, paid_unsettled 1, void_but_settled 1 — reconciling to 28. The distractors are the real bug patterns: IS NULL in the first arm makes the void class unreachable, = NULL can never fire (NULL fails every equality, including against itself), = 0 never matches a genuine settlement amount, SUM or MAX can't take the star, and ELSE 'paid_unsettled' swallows the clean bucket — a census that screams about 27 exceptions while the two real ones hide inside the noise. The pre-folded derived table is the quiet hero: join payments raw and the five split charges appear twice, corrupting every count below. Two exceptions, both named, both priced — that's the 9am census.",
    },
  ],

  problems: [
    { slug: "number-of-rich-customers", why: "COUNT(DISTINCT) over a money threshold — the charges-above-a-floor census risk screens warm up with: how many accounts moved more than X, counted once no matter how many settlements they shipped." },
    { slug: "monthly-transactions-i", why: "Month-bucket totals with a status-conditional count alongside — the settlement calendar finance opens every close with, in graded form." },
    { slug: "monthly-transactions-ii", why: "UNION ALL month packets splitting one population from the rest — the settled-versus-unsettled report stitched, not joined." },
    { slug: "gl-reconciliation", why: "Ledger-delta reconciliation: two folds that must agree, and the delta query that localizes the row that broke the balance — the Stripe-tagged drill for this kit's ledger topics." },
    { slug: "duplicate-charge-pairs", why: "Self-join duplicate scan with a window over close timestamps — the same-card-same-minute pair finder risk runs nightly, canonicalized with <." },
    { slug: "transaction-velocity", why: "Burst detection in fixed time buckets — settlements-per-minute spikes are the velocity rule that fires before a human ever looks." },
    { slug: "mrr-waterfall", why: "LAG movement classification — every account's balance walked from prior row to current row, the reconciliation waterfall in interview clothing." },
    { slug: "snapshot-delta-detect", why: "FULL OUTER JOIN between two snapshots — new keys, vanished keys, changed values: the settlement-file-versus-ledger diff, taught as a join." },
    { slug: "trial-balance-check", why: "Debits-equal-credits in one conditional SUM — the ledger reflex this kit's case studies reward; the delta is the only metric allowed to be boring." },
    { slug: "customers-who-never-order", why: "The anti-join AR read — charges with no settlement row (6 of them, $15,217 on this db): LEFT JOIN + IS NULL is the unsettled census." },
    { slug: "maximum-transaction-each-day", why: "Argmax per day over settlement amounts — the largest payout in each settlement window, fold and window in one query." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one pass with the 100.0-before-division fix — the honest-denominator habit every settlement percentage here needs." },
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded share where unmatched rows count as zero — NULL policy and rounding discipline in one deliverable." },
    { slug: "count-salary-categories", why: "CASE tiers stacked with UNION ALL totals — coverage-class censuses whose branches must reconcile to COUNT(*)." },
    { slug: "second-highest-salary", why: "Threshold subqueries on money columns — 'above the platform-average settlement' is a scalar subquery with an empty-inner edge case." },
    { slug: "the-most-recent-three-orders", why: "Per-entity latest-3 rail via ROW_NUMBER with a deterministic tie-break — the recent-settlements widget, in graded form." },
  ],
};
