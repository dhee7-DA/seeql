// Wise — kit 7 of the Fintech & Payments domain (Batch F, wave-5 slot).
// Cross-border money movement priced at the mid-market rate: the product
// promise is fee transparency and speed, so the interview lens is transfer
// legs, completion clocks, corridor volumes and the cost side of the fee
// equation. Pool provenance: the registry tags 2 Wise SQL problems (the pool
// has no third Wise row) — both land in this kit (topics + problems); the
// remaining slots are theme-curated fills from the SQL band (SLA clocks,
// corridor folds, rate-as-of joins), stated here per spec. Case studies run on
// the storefront db with probed figures from scripts/company-facts.md (probed
// 2026-10-12). The mapping is honest: invoices = transfer legs (settlement
// batches), payments = transfer completions, expenses/ledger_entries =
// internal money movement. Money columns are INTEGER cents; the facts file
// prints dollars — the read is amount_cents / 100.0.
// 3x expansion (task 92-e-wise, append-only): brief 4→6 paras, dayInLife 4→5
// beats, metrics 8→12, topics 10→15, theory 8→24 (wise-t9..t24), mcqs 10→30
// (wise-mcq-11..30, difficulty 3/4/3 per fresh ten, coached notes on 2+
// tempting wrong choices each), cases 2→6 (cs-wise-3..6 on topics s6/j7/q5/t5 —
// all four families new vs the kit's existing t3/x3 pair), problems 16→32.
// The tagged Wise pool stays at 2 rows (fx-exposure-report, circular-transfers
// — already placed); every new topic/problem slug is a theme-curated sql row
// from scripts/company-pools.md. New cases re-verified against db/custom.db by
// scripts/case-audit.ts (number slots read verified result cells; distractors
// consequence-checked).

import type { CompanyKit } from "../types";

export const wiseKit: CompanyKit = {
  id: "wise",
  domainId: "fintech",
  name: "Wise",
  tagline: "Cross-border money movement, fee-transparent",
  accent: "text-lime-300",

  brief: [
    "Wise moves money across borders at the mid-market rate, and its whole brand is that the numbers are visible: the fee is quoted before the transfer, the clock is promised, the corridor volume is public. Data org follows the promise — pricing and fee-transparency analytics on one side, treasury and settlement operations on the other, and both live in the same spine. On this app's storefront db the mapping is one-to-one: `invoices` are transfer legs (28 of them — the settlement batches money clears against), `payments` are transfer completions (27 rows covering 22 legs — five legs complete in two parts), and `ledger_entries` is the multi-currency clearing ledger (80 rows, debits $181,080 equal to credits $181,080). Money columns are INTEGER cents; every dollar read is `amount_cents / 100.0`.",
    "The real work is the exception queue and the clock. The db's verified anomalies are exactly what a transfers-pod analyst meets daily: a {rose:void}-but-completed leg (#11, $925.00), a leg the book calls paid with no completion behind it (#28, $1,756.00), five split-completion legs (#1, #5, #12, #19, #22), and one {amber:partial} completion ($4,000.00 of a $6,148.00 leg). Coverage reads 21 exact / 1 partial / 6 none, with $15,217.00 outstanding. The clock reads **28.4 days** mandate-to-completion on average — fastest **13**, slowest **84** — computed on first completion only, because a split leg must not pay the SLA twice.",
    "Interview style rewards the transfer-pod reflexes: {sky:corridor folds} (the db's card rail plays the instant corridor with **16 completions / $37,364.00**, the wire rail plays the cross-border corridor with 11 / $32,248.00), completion-clock math (`JULIANDAY` deltas, half-open windows, ROUND once), and honest fee ratios where the denominator is the whole test. A typical hour opens with a corridor fold, escalates into coverage (which legs never completed — and what filtering the wrong table in WHERE does to your `LEFT JOIN`), then closes on a one-pass census or a rate question where cents discipline (**100.0** before the division) is graded, not assumed.",
    "Preparation: the registry tags 2 Wise SQL problems and both land in this kit's topics; the remaining slots are theme-curated from the SQL band — SLA clocks, rate-as-of joins, dormant-leg sweeps, stacked packets — because that is what the screens probe. Do the topics in order, then run all six case studies on the live storefront db — built for spaced practice rather than one sitting: one rebuilds the {violet:completion clock} the SLA board reads every Monday (20 paid legs averaging 28.4 days, 13-to-84 spread), another rebuilds the {emerald:corridor packet} the transparency page ships — every corridor with count, volume and average ticket, plus a labelled grand-total row (27 / $69,612.00). Say the units and the denominator out loud before you compute anything; in this business the fee quote IS the interview.",
    "The reconciliation cadence is the culture. The gold-set anomalies — the {rose:void}-but-completed leg (#11, $925.00), the paid-but-never-completed leg (#28, $1,756.00), the five split-completion legs (#1, #5, #12, #19, #22), the {amber:partial} at $4,000.00 of $6,148.00 — are not surprises; they are *fixtures*: pinned regression queries that must return exactly one row each, every close. The trial balance (**debits $181,080 = credits $181,080, delta $0.00**) gates every dashboard, and the rail-file cross-check (card **16 / $37,364.00** against wire **11 / $32,248.00**) gates every corridor report. New analysts inherit the fixtures before they inherit the dashboards — at Wise you earn dashboard rights by proving your queries reproduce the known breaks.",
    "The screens scale with level, and the axis is always the same: who owns the definition. Juniors get single-fold asks — a corridor fold, a month bucket, a cents-correct `SUM(amount_cents) / 100.0`. Mid-levels get the two-stage builds — the coverage census (21 exact / 1 partial / 6 none), the first-completion clock, a packet whose parts must reconcile to the whole. Seniors get the *definition fight*: outstanding over all legs or completed legs, first completion or last — and the expectation is that you state the denominator, ship the query, and hand over the fixture that proves it. Prep ends the same way every mock ends here: units said out loud, and *the customer can check this math* as the closing line.",
  ],

  dayInLife: [
    "**08:00 —** The day starts with the completion sweep, not a dashboard: did last night's completions land against legs, does the corridor mix agree with the rail file (on the sample db: instant corridor **16 completions / $37,364.00**, cross-border corridor 11 / $32,248.00), and does coverage still read **21 exact / 1 partial / 6 none**? Then the exception queue — {rose:void-but-completed} (#11, $925.00) and {sky:paid-but-uncompleted} (#28, $1,756.00) are one row each and enormous in consequence: money moved against a leg the lifecycle killed, or a leg the book promises that never completed. A mismatch is a page, not a shrug.",
    "**11:00 —** Midday is deep-dive work with definitions attached. The SLA board wants clock drift (**28.4-day average, 13-to-84 spread** — first completion only, split legs excluded from double-counting); finance wants outstanding exposure priced (**$15,217.00 across 6 legs** — of all legs, not completed ones, and the analyst says so); treasury wants the {violet:split-completion scan} rerun to confirm every two-part leg (#1, #5, #12, #19, #22) rebuilds its total. Each ask is a join, a conditional aggregate, and one judgment call about status filters — written twice: once to answer, once with the definition made explicit so the number survives the pricing review.",
    "**15:00 —** The afternoon belongs to the fee equation and the people who read it. The cost side folds per category — the db's internal money movement reads **Rent $16,800.00 (14 lines), Ads $4,570.00 (14), Travel $2,521.00 (3), Tools $1,525.00 (5)** — and effective cost per completed transfer is defended line by line against the volume the corridors carried. The clearing ledger closes the loop: trial balance **debits $181,080, credits $181,080, delta $0.00**, per-account nets (**cash $44,196**, **receivables $16,440**) reconciled from the query, not the slide, because a fee quote that can't be re-derived is a fee nobody trusts.",
    "**17:30 —** EOD is the writeup. The corridor packet ships with its grand-total row labelled and its parts reconciling to the whole; every total carries its SQL attached; every re-run is {emerald:idempotent}; every open question carries the query that would answer it tomorrow. The rhythm to internalize: at Wise, transparency isn't a marketing line the interview rewards — it's the product constraint (the customer can check your math), and the SQL is just where the honesty becomes visible.",
    "**21:40 —** The late rail file lands and the on-call analyst reruns the sweep — the same queries, byte for byte, because idempotency is the whole point: the corridor mix must still read **16 / $37,364.00 against 11 / $32,248.00**, the census still **21 / 1 / 6**, the trial balance still **$181,080 = $181,080**. Tonight the file is clean, so the writeup is two lines and the fixtures stay green; the night the void-but-completed pattern reappears, the page goes out with the query attached and the expected one-row answer printed beside it. *Nobody fixes a number by hand here — you fix the query, rerun the sweep, and let the fixtures say it's fixed.*",
  ],

  metrics: [
    { name: "Transfer volume", what: "Completed principal per corridor: $69,612.00 across 27 completions on the db — instant corridor 16 / $37,364.00, cross-border corridor 11 / $32,248.00. The headline every board deck opens with." },
    { name: "Completion clock", what: "Mandate → first completion, in days: 20 paid legs averaging 28.4, fastest 13, slowest 84. First completion only — a split leg pays the SLA once, not per part." },
    { name: "Fee transparency index", what: "Effective cost ÷ principal, quoted before the transfer moves. The cost side on the db folds to Rent $16,800.00, Ads $4,570.00, Travel $2,521.00, Tools $1,525.00 — internal money movement feeding the equation." },
    { name: "Completion coverage", what: "Legs classified exact / partial / no completion — 21 / 1 / 6 on the db. The census treasury opens with; the classification is a CASE over a pre-folded LEFT JOIN." },
    { name: "Outstanding balance", what: "Dollar value of legs with no completion row: $15,217.00 across 6 legs here. Computed over ALL legs, not completed ones — the denominator is the definition." },
    { name: "Split-completion rate", what: "Legs completing in two parts ÷ covered legs — 5 of 22 here (#1, #5, #12, #19, #22). A cost signal and the standing fan-out trap in every fold." },
    { name: "Corridor speed gap", what: "Completion-clock spread between corridors — the instant rail versus the cross-border rail. The db's wire corridor carries bigger tickets (avg $2,931.64 vs $2,335.25) and the gap is the product story." },
    { name: "Ledger balance delta", what: "Total debits − total credits across currencies. Must read $0.00 ($181,080 = $181,080 here) — the one metric allowed, and required, to be boring." },
    { name: "Split-vs-single mix", what: "Of the 22 covered legs, 5 complete in two parts (#1, #5, #12, #19, #22) and 17 in one. The ops-load signal behind every fan-out trap — each split leg is a row the folds must not double-count." },
    { name: "Terms-vs-clock gap", what: "Mandates carry 30-day terms flat (min 30, max 30 on the db), yet paid legs average 28.4 days with a slowest of 84. The gap between the promised window and the shipped clock is the SLA board's exception line." },
    { name: "Account nets", what: "The close's four numbers: cash $44,196, receivables $16,440, revenue −$86,052, opex $25,416. Per-account debit/credit nets that must reconcile to the $0.00 trial-balance delta before anything ships." },
    { name: "Exception density", what: "Flagged rows per leg in the gold-set: 1 void-but-completed + 1 paid-never-completed + 5 splits + 1 partial = 8 anomalies across 28 legs. The queue's size is the honesty metric — every row must be explainable, none must be cleaned away." },
  ],

  topics: [
    {
      name: "Folds over transfer volume",
      why: "Every headline is a fold over a money column: completed principal per corridor, legs per status, debits minus credits per account. The cents rule sharpens it — amounts are INTEGER cents, so SUM(amount_cents) / 100.0 is the dollar read and integer division is the standing truncation trap. Wise drills whether you can fold money without leaking it, because the customer can check the math.",
      slugs: ["number-of-rich-customers", "top-earners", "products-worth-over-invoices"],
    },
    {
      name: "Corridor volumes & method mix",
      why: "The product reports per corridor: instant rail 16 completions / $37,364.00, cross-border rail 11 / $32,248.00 on this db — count, volume and average ticket side by side. The craft is keeping event grain and leg grain out of the same column, and knowing the corridor packet is a stack of folds, not a join.",
      slugs: ["bank-account-summary-ii", "average-selling-price", "top-travellers"],
    },
    {
      name: "The completion clock (dates & SLAs)",
      why: "The SLA promise is a date computation: JULIANDAY(paid_on) - JULIANDAY(issued_on), MIN per leg first, ROUND once at the end — 28.4 days average, 13 fastest, 84 slowest here. Duration math with start/end timestamps is the core drill, and the clock breaks the moment split completions double-count.",
      slugs: ["average-time-of-process-per-machine", "rising-temperature", "the-latest-login-in-2020"],
    },
    {
      name: "Month buckets & completion calendars",
      why: "Completion calendars are month-bucketed: SUBSTR(paid_on, 1, 7) folds completions into '2024-03'-style keys with a conditional count of exceptions riding in the same fold. The pod probes whether the status rule and the total come from one scan — branches that must reconcile to COUNT(*) before the report ships.",
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "FX exposure & as-of rate joins",
      why: "Cross-border money is quoted against rates that move: normalizing a leg means joining the latest rate at-or-before its timestamp — the as-of join. Product-price-at-a-given-date and point-in-time SCD2 shapes are the drills, and the rule is absolute: no rate from after the transfer may touch the number.",
      slugs: ["fx-exposure-report", "product-price-at-a-given-date", "point-in-time-asof", "trips-and-users"],
    },
    {
      name: "Circular flows & mutual pairs",
      why: "Money sometimes comes back: two accounts moving funds to each other inside a window is a pattern the risk team reads as circulation. Mutual-pair detection — canonicalized with a < so each pair counts once — is the same craft as duplicate-completion scans, and the epoch window is the trap.",
      slugs: ["circular-transfers", "symmetric-pairs", "strong-friendship", "amount-anomaly-zscore", "structuring-detection", "transaction-velocity", "suspicious-bank-account-transactions", "chargeback-rate-ranking"],
    },
    {
      name: "Fee transparency: honest ratios",
      why: "Fee percentages, coverage shares, speed percentiles — every rate here is a conditional sum over a count, and both failure modes are graded: integer division (100 must be 100.0) and denominator drift (the WHERE that filters the numerator's population out of the denominator). A transparency company grades this hardest.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "card-launch-success"],
    },
    {
      name: "Dormancy & the anti-join",
      why: "Legs that never completed are the anti-join this business runs daily: 6 legs, $15,217.00 on the sample db. LEFT JOIN + IS NULL (or NOT EXISTS) is the shape, and the trap is filtering the right table in WHERE, which silently converts the LEFT JOIN to an INNER and deletes exactly the legs the sweep exists to find.",
      slugs: ["customers-who-never-order", "bank-account-summary", "dormant-reactivation"],
    },
    {
      name: "Split completions & duplicate scans",
      why: "Five legs on the db complete as two rows each — split completions — and the same self-join that finds them finds duplicate completions. The craft is canonicalization: p1.id < p2.id keeps one pair per unordered match, while <> double-counts both orientations and bare equality fans out to every peer including itself.",
      slugs: ["duplicate-charge-pairs", "consecutive-transactions-with-increasing-amounts", "maximum-transaction-each-day"],
    },
    {
      name: "The clearing ledger & balance walks",
      why: "The multi-currency ledger is double-entry: every debit has a credit, the trial balance must read zero ($181,080 = $181,080 here), and the per-account nets (cash $44,196, receivables $16,440) feed the close. Balance walks and rollforwards are how you localize a break — one fold per side, then the difference, then the account that drifted.",
      slugs: ["trial-balance-check", "balance-rollforward", "total-traveled-distance", "gl-reconciliation", "ar-aging-schedule", "settlement-fails-aging", "journal-gap-detection"],
    },
    {
      name: "Ranking & tiles on the book",
      why: "Fee bands and premium tiers are ranking questions: which completions sit in the top decile of ticket size, which corridors rank by share of the book, which tickets earn which band. ROW_NUMBER, RANK and DENSE_RANK differ exactly where the money ties, and a transparency company reports tiles that must tile the whole book — a rank gap is a coverage claim, so you pick the function deliberately and say which one you used.",
      slugs: ["rank-scores", "compute-the-rank-as-a-percentage", "top-percentile-fraud", "second-highest-salary", "account-balance", "second-most-recent-activity"],
    },
    {
      name: "Running totals & rolling completions",
      why: "Volume is never read per month in isolation — the board reads cumulative principal year-to-date and 7-day rolling completion counts, both window folds over ordered buckets. The craft is the frame: a running total that ties on a completion timestamp must be ROWS, not the default RANGE, or the drift hides inside duplicate order keys and disagrees with the rail file for exactly the rows a customer might audit.",
      slugs: ["running-total-for-different-genders", "restaurant-growth", "rolling-average-steps"],
    },
    {
      name: "NULL policy at the display edge",
      why: "Legs that never completed arrive as NULL payloads, and the pod's rule is classify mid-pipeline, coalesce at the edge: a COALESCE(SUM(...), 0) placed too early launders a missing completion into a clean zero somebody will act on. Carry-forward shapes — last known rate, last known status — are the same discipline in the other direction: never let a NULL masquerade as a value the book actually held.",
      slugs: ["books-with-null-ratings", "change-null-values-in-a-table-to-the-previous-value", "calculate-special-bonus", "keep-latest-dedupe", "null-blank-audit"],
    },
    {
      name: "One-pass censuses & CASE pivots",
      why: "The coverage census (21 exact / 1 partial / 6 none) is one scan, not three: conditional aggregation — CASE arms inside COUNT and SUM — must produce branches that reconcile to a plain COUNT(*) before the report ships. Pivot shapes extend it: status rows into columns, a grid the transparency page prints without a second pass, each branch carrying its own named definition.",
      slugs: ["create-a-session-bar-chart", "count-salary-categories", "sales-by-day-of-the-week", "league-statistics", "monthly-transactions-ii", "unique-orders-and-customers-per-month"],
    },
    {
      name: "Subquery shapes above the average",
      why: "The pricing questions are comparative: which corridors beat the book-average ticket, which legs price above their corridor's norm, what is the second-biggest completion on the book. Scalar, IN/EXISTS and derived shapes each carry a contract — zero-row scalars return NULL, two-row scalars error — and the pod grades whether you know which contract you signed before you compare anything.",
      slugs: ["orders-with-maximum-quantity-above-average", "nth-highest-salary", "customers-who-bought-all-products"],
    },
  ],

  theory: [
    {
      id: "wise-t1",
      q: "A transfer is quoted, funded, completed, then maybe reversed. In a query reporting completed volume, where does each lifecycle rule live — and what breaks when a row-level rule lands in the wrong clause?",
      a: "Lifecycle states are row-level facts, so they belong in WHERE — 'completed volume' filters to completion rows joined to funded legs before any aggregation touches them. Once folded, the states no longer exist per row: HAVING can only judge group aggregates like SUM or COUNT, not recover rows you already summed. The classic failure is summing over all completions and trying to subtract the void-but-completed leg in HAVING — that $925 on leg #11 is already inside the total, and no post-aggregation clause can un-mix it. The strong answer recites the pipeline — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — and places every filter by asking: is this a fact about one row, or about a group? At a transparency company that question is the job, because a lifecycle rule in the wrong clause doesn't error — it reconciles to nothing and ships to a customer who can check your math.",
      tag: "pipeline",
    },
    {
      id: "wise-t2",
      q: "Completions LEFT JOIN legs: when does an INNER JOIN give the identical answer, and when does it silently delete the anomaly you were hunting?",
      a: "When every completion matches a leg — the foreign-key world this db lives in — INNER and LEFT return the same rows from the completions side; the difference only appears on legs with NO completion, and those rows are the product here. The outstanding census (6 legs, $15,217.00) exists only under LEFT JOIN: unmatched legs survive with NULL completion columns and IS NULL is the detection. The silent killer is filtering the right table's column in WHERE — p.method = 'card' discards the NULL-payload rows (NULL = 'card' is UNKNOWN), collapsing the LEFT JOIN to an INNER and deleting exactly the legs the sweep exists to find. The fixes: move the predicate into ON, or filter a pre-aggregated fold first. 'LEFT JOIN is safer' is not the answer — join type is a decision about who survives, and on the transparency page you state who survives out loud.",
      tag: "joins",
    },
    {
      id: "wise-t3",
      q: "27 completion rows cover 22 legs because five legs complete in two parts. Narrate every count in that sentence — and how you'd report both grains in one query.",
      a: "COUNT(*) over payments reads 27 — completion events, the rows the rails shipped. COUNT(DISTINCT invoice_id) reads 22 — legs covered, the business object the customer tracks. COUNT(amount_cents) also reads 27 because the FK is never NULL — NULL-skipping is not folding. The two-grain report folds once and counts twice: per corridor, completion events AND distinct legs side by side, because the instant corridor's 16 events might be 16 legs or fewer, and the split rate is the gap between the columns. The habit the interviewer grades: before any COUNT, say 'one row per what?' — completion event, leg, corridor bucket. At Wise the distinction is the product: a duplicate-counted completion breaks the customer's tracker; a deduplicated count hides operational load, and both numbers ship to different teams on purpose.",
      tag: "aggregation",
    },
    {
      id: "wise-t4",
      q: "A voided leg carries a completion; a funded leg has none. When you LEFT JOIN completions to legs, what is your NULL policy — filter, coalesce, or report?",
      a: "The NULL means 'no completion row exists', and that is data — the exception class itself — not missingness to clean. The policy: classify, don't discard. The coverage census keeps every leg and CASEs the join result into exact, partial and none (21 / 1 / 6 on this db, with leg #25 the partial: $4,000.00 completed of $6,148.00), because those counts ARE the reconciliation. Equality never detects it — NULL fails every test including against itself — the arm is IS NULL. COALESCE belongs at the display edge only: a coalesced zero mid-pipeline launders a paid-but-uncompleted leg into a clean-looking $0.00 somebody will act on. And if the ask truly wants completed-only, filter in WHERE and say the population changed — 'this report covers the 22 legs with completions' — because 28 minus 22 is the story that filter just deleted. On a fee-transparency product, a report whose WHERE does definitional work silently is the artifact reviewers hunt for.",
      tag: "nulls",
    },
    {
      id: "wise-t5",
      q: "Each leg can complete in several rows. How do you pick the FIRST completion per leg, and what breaks with the bare MAX-join-back when two rows share a timestamp?",
      a: "Two honest shapes. Aggregate-only: fold per leg with MIN(JULIANDAY(paid_on) - JULIANDAY(issued_on)) — that's the completion clock, 20 paid legs averaging 28.4 days, fastest 13, slowest 84 on this db. Row-picking: ROW_NUMBER() OVER (PARTITION BY invoice_id ORDER BY paid_on, id) = 1, and the id is the part interviewers wait for — it makes 'first' deterministic when two completions share a timestamp, which split rail files produce routinely. The bare MAX(paid_on) join-back returns BOTH tied rows, and every downstream count silently doubles; 'it still returns rows' is not a defense. Choose by output: if you need other completion columns, take the window; if you only need the timing, the aggregate fold is cheaper and stages cleanly in a CTE named for what it holds — first_completion, not cte2.",
      tag: "windows",
    },
    {
      id: "wise-t6",
      q: "WHERE amount_cents/100.0 > (SELECT AVG(amount_cents)/100.0 FROM payments WHERE method = 'sepa-instant') — this db has no 'sepa-instant' corridor. Walk me through what happens.",
      a: "A scalar subquery is contractually zero-or-one rows, one column. One row: its value joins the comparison. Zero rows: it yields NULL — not an error, not zero — and amount > NULL is UNKNOWN, so WHERE passes nothing: an above-average report that returns empty while looking perfectly healthy. That's the empty-inner-query bug, and on a corridor business it ships constantly — a corridor that launched yesterday, a currency pair with no volume this month. The strong answer also names the other contract edge: two rows from a scalar subquery IS an error, so 'scalar' is a promise you verify with the fold's GROUP BY, not an assumption. At Wise the follow-up is always: what population did the inner fold cover, and what does the corridor report do when that population is empty? A transparency company does not accept silence as an answer.",
      tag: "subqueries",
    },
    {
      id: "wise-t7",
      q: "The completion clock averages 28.4 days with a 13-to-84 spread, and completions get reported by month. How do you compute the clock, bucket the months, and where does BETWEEN break?",
      a: "Clock: JULIANDAY(paid_on) - JULIANDAY(issued_on) gives fractional days — take MIN per leg first (first completion, not every split part), average, then ROUND(..., 1) exactly once at the outermost fold; 28.4 is a single final round, not a per-row one. Buckets: STRFTIME('%Y-%m', paid_on) or SUBSTR(paid_on, 1, 7) — the SUBSTR shortcut is safe only while the column stays fixed-width ISO, a convention nothing in the column enforces, so say it before you lean on it. Windows: half-open intervals — paid_on >= '2024-03-01' AND < '2024-04-01' — never BETWEEN, which is inclusive both ends and drops everything after midnight on the last day, exactly when month-end completion files land. And the SLA check itself is a query against the promise: the 84-day slowest leg is not an outlier to delete, it's the row the SLA report exists to surface.",
      tag: "dates",
    },
    {
      id: "wise-t8",
      q: "The clearing ledger must read zero: debits $181,080, credits $181,080. How do you prove it in one query — and localize the break when it doesn't?",
      a: "One pass, two conditional sums: SELECT SUM(debit_cents), SUM(credit_cents), SUM(debit_cents) - SUM(credit_cents) AS delta FROM ledger_entries — dollars via /100.0, delta printed beside the totals. Zero is the only acceptable value; the query is the proof and a non-zero delta is the page. Localization is the same shape one level down: GROUP BY account and read per-account nets — cash $44,196, receivables $16,440, revenue −$86,052, opex $25,416 here — because a broken balance always shows up as an account whose debit/credit pairing drifted. The traps are self-inflicted: COUNT where you meant SUM, SUMming dollars over cents (a 100× error the eye never catches), or auditing only the grand total while an offsetting error hides across two accounts. The habit: reconcile the total, then reconcile the parts — on a product whose customers can see the numbers, the ledger IS the brand.",
      tag: "quality",
    },
    {
      id: "wise-t9",
      q: "The board wants cumulative completed volume by month, and two completions share a timestamp. What changes when your running SUM uses the default frame versus ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW?",
      a: "The default frame with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE treats tied ORDER BY values as peers: both same-timestamp rows see each other's amounts, so the running total jumps by the tie's full sum at the first tied row and plateaus through the second — the printed walk contains a plateau no ledger walk should have. ROWS is physical: each row adds exactly its own amount, one row at a time, deterministic regardless of ties. On money movement the stakes are real — a running balance that plateaus on a tie doesn't just look odd, it disagrees with the rail file for exactly the rows a customer might audit. The strong answer names the default frame, says why ties break it, and reaches for ROWS with a deterministic ORDER BY (timestamp, then id) whenever the order key isn't unique — which, on completion files that batch at midnight, is most days.",
      tag: "windows",
    },
    {
      id: "wise-t10",
      q: "You have the rail file's list of completions and the clearing ledger's list. How do INTERSECT and EXCEPT turn two lists into a reconciliation, and what does each direction of EXCEPT mean?",
      a: "Set ops compare whole rows, so first make both sides the same shape — same columns, same grain, the leg key plus a canonical amount read. INTERSECT returns rows both systems agree on: the clean population, which should be the big one. EXCEPT rail-minus-ledger returns completions the rails shipped that the ledger never booked — the void-but-completed class, leg #11's $925.00 on this db; EXCEPT ledger-minus-rail returns ledger rows with no rail movement behind them — the paid-but-never-completed class, leg #28's $1,756.00. The two EXCEPT directions are the two error classes, and neither should come back empty without an explanation. Two habits separate the strong candidate: these operators all dedupe implicitly, so split completions collapse unless you stage a per-leg fold first — and an empty diff is a finding, not a comfort, because on this book it means the fixtures stopped matching reality, which is exactly what they exist to prevent.",
      tag: "setops",
    },
    {
      id: "wise-t11",
      q: "The coverage census needs exact, partial and never-completed counts — 21, 1 and 6 — in one query. How do you get all three in a single pass, and what proves the branches are exhaustive?",
      a: "Stage the classification, then fold it once. One row per leg — a LEFT JOIN to completions folded with GROUP BY i.id — carries a CASE that arms on COUNT(p.id) = 0 for never-completed, on SUM equality for exact, and falls through to partial; the outer fold counts each class. Exhaustiveness is provable, not assumed: the arms partition on row-presence first, then on an equality that is either true or not — there is no third state — and COUNT(*) over all legs (28) must equal 21 + 1 + 6 before the query ships. The failure mode the pod watches for is the N-scan rewrite: three separate queries with three separate WHERE clauses, each filter drifting on its own — the day someone edits one and not the others, the parts stop summing to the whole and the transparency page prints a census that cannot reconcile. One pass, one definition, branches that must sum to the total: that's the shape.",
      tag: "aggregation",
    },
    {
      id: "wise-t12",
      q: "Which completions are bigger than their corridor's average ticket? Walk me through the correlated-subquery shape, and when you'd replace it with a join to a derived table.",
      a: "The correlated shape: WHERE amount_cents > (SELECT AVG(amount_cents) FROM payments p2 WHERE p2.method = p1.method) — the inner fold re-runs per outer row, carrying the corridor in as a bound value. It reads exactly like the question, which is its virtue; its cost is re-evaluation, and its edge is the scalar contract — if the inner fold ever returns two rows (add a GROUP BY and it will), the query errors. The derived-table shape folds once — per-corridor averages staged, joined back on method — scales, and generalizes to asks correlation can't follow, like the top half of each corridor. On this book either works: two corridors, 27 rows, no optimizer will notice. The judgment the interview grades is stating the trade out loud: correlation for readability at small grain, staged folds for anything a report runs nightly. And the standing rule holds: say what the inner fold covers — an empty corridor yields a NULL average and a comparison that filters everything, silently.",
      tag: "subqueries",
    },
    {
      id: "wise-t13",
      q: "When does a query earn a CTE, and what's your staging and naming discipline inside one?",
      a: "A CTE earns its place when it holds a business object, not a query fragment: first_completion (one row per leg, the earliest paid_on), coverage (leg plus its class), corridor_folds (the packet's parts) — names the memo already uses, so the reviewer reads intent instead of reconstructing it. The discipline: one stage per concept, each stage's grain stated in its name, downstream stages joining or folding the staged rows rather than re-deriving them. The completion clock stages leg_clock once and the outer fold computes avg, min and max from it — never repeats the JULIANDAY arithmetic three times, never lets two slightly different definitions of 'first' drift apart inside one query. What CTEs are not: a performance badge (SQLite inlines them; recursive CTEs are a different animal) and not a place to hide an unfiltered fold — every stage still carries its WHERE on purpose. The habit that closes interviews: read the CTE names aloud and the query should narrate the memo — leg_clock → book averages, coverage → census, packet → TOTAL.",
      tag: "ctes",
    },
    {
      id: "wise-t14",
      q: "SUM skips NULLs, COUNT(*) doesn't, and AVG divides by its own count. Where does that trio bite in a transfers book?",
      a: "It bites where populations mix. SUM over the completion side of a LEFT JOIN ignores the NULL payloads of never-completed legs — $15,217.00 of legs contribute nothing, which is correct for arrived-money and fatal if the memo asked for principal: the honest principal fold lives on the legs table. COUNT(*) counts join rows including unmatched legs (28); COUNT(p.id) counts matched payloads only (22); printed side by side, that pair IS the coverage column the census ships. AVG is the trap with teeth: it divides by the non-NULL count, so averaging completion amounts over a LEFT JOIN quietly changes the denominator from 27 events to 22 — the average ticket moves, no error fires, just a number the corridor packet disagrees with. The policy I state before writing any aggregate: which rows should the denominator hold, and does this column's NULL mean zero or didn't-happen? Here it means didn't-happen, so NULLs stay NULL mid-pipeline and only the display edge decides.",
      tag: "nulls",
    },
    {
      id: "wise-t15",
      q: "How do you walk a balance or compare each completion to the previous one, and what does LAG give you on the first row?",
      a: "LAG(amount) OVER (PARTITION BY account ORDER BY paid_on, id) hands each row its predecessor, and the delta — amount minus LAG — is the movement line a reconciliation waterfall prints. Two disciplines make it trustworthy: the ORDER BY needs the id tiebreak, or same-timestamp rows hand each other the wrong predecessor; and the partition must be the business object — walking all 27 completions in date order mixes corridors and produces deltas nobody can reconcile. LEAD is the same tool looking forward, useful for 'did a leg get its second part, and how long after the first?'. The first row's LAG is NULL, and that NULL is correct: there is no previous movement, so the delta is NULL, not zero — a zero would invent a flat line where the walk begins. If the deck needs a number there, COALESCE at the display edge and say so; the walk itself keeps the NULL.",
      tag: "windows",
    },
    {
      id: "wise-t16",
      q: "Three coverage shares round to 75.0, 3.6 and 21.4 — they sum to 100.0 today. Why is that a coincidence, and how do you report shares that must sum cleanly?",
      a: "Each share is ROUND(100.0 * part / total, 1) computed independently, so each is the nearest tenth of its own truth: 21/28 is exactly 75.0, but 1/28 is 3.571… and 6/28 is 21.428…, and the rounded pieces happen to reassemble to 100.0. Change the book — 28 legs to 29 — and the same code prints pieces summing to 99.9, and the transparency page shows a census that lost a tenth of a leg. The honest options, in order of preference: print more precision and let the sum carry its own dust; designate a residual row — the largest share absorbs the rounding so the printed parts sum to the printed whole, stated in the footnote; or print the raw numerators (21 / 1 / 6 of 28) beside the shares so any reader can re-derive them. What you never do is round inputs before averaging or 'fix' a share by hand — the customer can re-run the query, and at this company, will.",
      tag: "quality",
    },
    {
      id: "wise-t17",
      q: "The reconciliation gold-set — void-but-completed #11, paid-never-completed #28, five splits, one partial — how would you turn it from tribal knowledge into tests that run on every close?",
      a: "Every anomaly becomes a query with an expected row count of one and an expected figure, and the close fails if any returns zero or two. #11's test: legs where status is void and a completion exists — exactly one row, $925.00, or the lifecycle is leaking again. #28's: legs the book calls paid with COUNT(completion) = 0 — exactly one, $1,756.00. The splits: GROUP BY leg HAVING COUNT(*) > 1 — exactly five legs; the partial: completions not summing to principal — exactly one, $4,000.00 of $6,148.00. Then the meta-test: the anomaly census must total eight rows, because the gold-set is closed — a ninth anomaly is a new fixture, not noise, and it ships with its own query before anyone emails about it. That's the data-quality culture in miniature: exceptions aren't cleaned, they're pinned — the queries are the regression suite, the figures are the assertions, and 'the close went green' means every pin held.",
      tag: "quality",
    },
    {
      id: "wise-t18",
      q: "Where does GROUP_CONCAT earn its place in a transfers book, and what are its sharp edges?",
      a: "It earns one place: manifests. The packet's per-corridor leg list — GROUP_CONCAT over the staged per-leg rows — prints 'card: #3, #7, #11, …' as one cell the close can eyeball against the rail file, and an exception queue that prints its leg ids in one cell gets triaged in seconds. The sharp edges are all ordering and size: concatenation order is unspecified unless you control it — stage the rows ordered, or use the ORDER BY inside the aggregate where the engine supports it, and say which you relied on; the separator is the second argument and commas inside ids will bite; and some engines truncate the cell by default — a manifest that fades to ellipsis at row forty lies by omission. So: GROUP_CONCAT for human-scannable evidence attached to a fold, never as the fold itself — the count and the SUM stay numeric columns, the string is the receipt, and the receipt must be orderable and complete or it doesn't ship.",
      tag: "aggregation",
    },
    {
      id: "wise-t19",
      q: "Three ways to write the never-completed sweep — NOT IN, NOT EXISTS, LEFT JOIN … IS NULL. Which do you ship, and why does the answer depend on the subquery's nullability?",
      a: "NOT EXISTS is the default I ship: correlated, stops at the first match, immune to the tri-valued trap — it asks 'any matching row at all?', never 'equal to what?'. NOT IN with a nullable column is the landmine: one NULL in the subquery and every row fails the test, the sweep returns zero legs, and '$15,217.00 of exposure' reads as a clean book — on any nullable staging copy, NOT IN is disqualified before performance is even discussed. LEFT JOIN … IS NULL is equally correct and the shape I reach for when the sweep also wants columns from the left side — unmatched rows survive with their payload, one pass, no second visit to the table. The audit-grade habit: name the inner column's nullability out loud, because the three shapes are semantically identical only when it's NOT NULL — and on a book where a staging load can carry a NULL leg id, 'identical today' is not the standard. 'Identical under every load' is.",
      tag: "joins",
    },
    {
      id: "wise-t20",
      q: "Completions by month with month-over-month deltas — what breaks when a month has zero completions, and how do you build the report so it doesn't?",
      a: "The break is the missing row: GROUP BY STRFTIME('%Y-%m', paid_on) only prints months that have completions, so a zero-completion month doesn't read zero — it vanishes, and LAG walks straight across the gap, computing a delta from two months that were never adjacent while the report presents them as consecutive. The fix is a spine: a month calendar (a recursive CTE over the date range, or a months dimension) LEFT JOINed to the completions fold, so every month exists and the quiet ones read 0; then LAG over the spined rows produces deltas that mean something. On this book all 14 months carry volume, but 'all months have data' is a data property, not a report property — the report must survive the month the rails go dark. The secondary trap rides along: STRFTIME and SUBSTR(paid_on, 1, 7) agree only while timestamps stay fixed-width ISO — state the convention, pick one, use it everywhere, spine included.",
      tag: "dates",
    },
    {
      id: "wise-t21",
      q: "Normalizing a leg needs the FX rate at-or-before its timestamp. Where do the classic bugs hide in that join?",
      a: "Four places. The boundary: 'at-or-before' is <= on the leg's time and >= on the rate's effective time, and the equality matters — a rate effective at exactly midnight must apply to the midnight transfer, so the predicate keeps its equalities instead of tidying them away. The ties: two rates effective at the same instant means two rows survive the as-of filter and the leg's value fans out — pick latest-wins explicitly (a ROW_NUMBER over effective time with an id tiebreak, or a pre-deduped rate table) and say so. The direction: joining 'the next rate after the leg' silently reprices history when someone backfills the rate table — an as-of join is a promise about the timeline, and a late-arriving row is a restatement you must be able to see. And the units: rates multiply principals carried in cents, so the 100.0 discipline applies after the multiply, once. The fixture I'd pin: reprice one known leg by hand and make the query match it — on a product whose pitch is 'the rate you see is the rate you get', that test is the brand.",
      tag: "joins",
    },
    {
      id: "wise-t22",
      q: "When is a CROSS JOIN the right tool in a money-movement book, and what does it cost?",
      a: "When the deliverable is a grid that must exist even where the data doesn't: corridor × month with every cell printed, zero-filled — two rails by fourteen months is 28 rows whether or not a rail went quiet, and the growth deck reads 0 as a real event only if the row exists. Build it as a spine: stage the month list and the corridor list, CROSS JOIN them into the full lattice, LEFT JOIN the folds onto it, COALESCE the misses to zero at the edge. The cost is why it's rare: the row count is the product of the sides, so a careless CROSS JOIN against the completions table is noise multiplied, and joining that downstream multiplies again — the fan-out every fold then has to survive. The discipline: CROSS JOIN only small, deliberate dimensions; never as a shortcut for a join condition you couldn't think of; and every aggregate downstream must re-fold on the grid's grain, not the data's. A grid that prints the quiet months is honesty; a Cartesian accident is noise with a filter missing.",
      tag: "joins",
    },
    {
      id: "wise-t23",
      q: "COUNT(*) FILTER (WHERE method = 'card') versus SUM(CASE WHEN method = 'card' THEN 1 ELSE 0 END) — same number, different story. Which do you write, and when?",
      a: "Same number — 16 card completions on this book — and I write the FILTER shape when the audience is the census: it says 'count these rows' without inventing a fake column, it can't forget the ELSE (there is no ELSE to forget), and five FILTERs in one SELECT read as the one-pass census the pod actually ships — per corridor, per status, per exception class, a single scan whose branches must sum to COUNT(*). The CASE shape I write when the branch computes a value rather than a membership: SUM(CASE WHEN partial THEN amount ELSE 0 END) is arithmetic, and the ELSE 0 is doing real work. The trap both share is the population: conditional aggregates ride on whatever FROM and WHERE already kept, so the six never-completed legs exist in the census only because the join was a LEFT — change it to INNER and every FILTER still runs, every branch still sums, and the census is quietly 22 legs instead of 28. The shape is the smaller half; the population is the whole answer.",
      tag: "aggregation",
    },
    {
      id: "wise-t24",
      q: "These money tables are tiny today — 28 legs, 27 completions. What performance instincts do you still bring, and which habits would you refuse to ship?",
      a: "The instincts that scale, shipped now: predicates on columns, not on functions of columns — WHERE paid_on >= '2024-03-01' AND paid_on < '2024-04-01' can use an index on paid_on, while STRFTIME('%Y-%m', paid_on) = '2024-03' cannot, and at ten million completion rows that difference is the report or the outage. Fold early, join late: stage the per-leg fold in a CTE and carry 22 rows onward, don't drag the fan-out through three more joins and hope the optimizer saves you. Index the FK — payments.invoice_id — because every sweep is a lookup on it. The habits I refuse: JULIANDAY arithmetic inside WHERE when a range predicate exists; DISTINCT sprayed over a fan-out the grain caused, which hides the doubling instead of removing it; and 'it's only 28 rows' as a design argument — the fixture db is 28 legs, the rail files are 28 million, and the query that's correct-but-unindexable ships the outage. Small data is where you build the habits the big data will audit.",
      tag: "performance",
    },
  ],

  mcqs: [
    {
      id: "wise-mcq-1",
      prompt: "A completion of 55,120 cents is reported as ROUND(amount_cents / 100, 2). What lands on the transparency page?",
      choices: [
        "551.20 — integer division keeps the cents",
        "551 — the .20 was truncated away before ROUND ran",
        "551.00 — SQLite rounds to the nearest cent",
        "551.20 — ROUND heals the truncation",
      ],
      answer: 1,
      why: "Division of two INTEGERs truncates BEFORE ROUND ever sees the value: 55120 / 100 = 551, and ROUND(551, 2) is still 551. The house shape is amount_cents / 100.0 — real division first, ROUND last, exactly once.",
      notes: [
        { choice: 0, why: "Integer division never 'keeps cents' — it discards the remainder entirely. 55120/100 is 551, not 551.20; the 20 cents vanished at the division." },
        { choice: 3, why: "ROUND runs after the damage: its input is already the truncated 551. No function downstream of a truncation recovers the truncated remainder." },
      ],
      difficulty: "easy",
    },
    {
      id: "wise-mcq-2",
      prompt: "27 completions across 2 corridors. SELECT method, COUNT(*) FROM payments GROUP BY method returns how many rows?",
      choices: ["1", "2", "27", "22"],
      answer: 1,
      why: "GROUP BY folds to one row per distinct corridor — 2 rows whose counts sum to 27. The fold's output grain is the group, not the input row.",
      notes: [
        { choice: 2, why: "27 is the input row count. GROUP BY collapses it to corridors; you'd only see 27 rows from a GROUP BY on a 27-distinct-value column." },
        { choice: 3, why: "22 is the number of distinct LEGS the completions cover — a different grain that needs COUNT(DISTINCT invoice_id), not a corridor fold." },
      ],
      difficulty: "easy",
    },
    {
      id: "wise-mcq-3",
      prompt: "The completions table holds 27 rows covering 22 legs — five legs complete in two parts. Which expression counts LEGS completed, not completion rows?",
      choices: ["COUNT(*)", "COUNT(amount_cents)", "COUNT(DISTINCT invoice_id)", "SUM(invoice_id)"],
      answer: 2,
      why: "COUNT(*) and COUNT(amount_cents) both read 27 — one row per completion, and the FK is never NULL. COUNT(DISTINCT invoice_id) folds the split rows back to 22 legs. Both grains are real; the transparency page must name which one it prints.",
      notes: [
        { choice: 1, why: "COUNT(column) skips NULLs, not duplicates — with a NOT NULL FK it equals COUNT(*) at 27. DISTINCT is the fold; NULL-skipping isn't." },
        { choice: 3, why: "SUM adds primary keys — a meaningless number that changes when any leg gains a second completion. Keys are for joining, never for folding." },
      ],
      difficulty: "medium",
    },
    {
      id: "wise-mcq-4",
      prompt: "The completion clock averages 28.4 days across 20 paid legs. Where should the ROUND happen?",
      choices: [
        "Per row: ROUND each leg's latency to 1 decimal, then AVG",
        "Once, at the end: ROUND(AVG(latency), 1)",
        "Twice — per row and again at the end, for safety",
        "Never; let the client render precision",
      ],
      answer: 1,
      why: "Rounding is a display decision — make it once, at the outermost fold. Per-row rounding perturbs the inputs before the average, and the aggregate drifts from the truth; the audited shape rounds exactly once, at the outer SELECT.",
      notes: [
        { choice: 0, why: "Rounded inputs average to a different value than ROUND(AVG(raw), 1) whenever any leg's raw latency carries more precision than the display — systematic drift, not noise." },
        { choice: 3, why: "Shipping full float precision isn't honesty, it's noise — pick the precision deliberately and round exactly once." },
      ],
      difficulty: "easy",
    },
    {
      id: "wise-mcq-5",
      prompt: "Legs can complete in parts; the SLA is measured to FIRST completion. Which expression returns the 13-day fastest leg on this db?",
      choices: [
        "AVG(JULIANDAY(p.paid_on) - JULIANDAY(i.issued_on))",
        "MIN(JULIANDAY(p.paid_on) - JULIANDAY(i.issued_on)) per leg, then MIN over legs",
        "MAX(JULIANDAY(p.paid_on) - JULIANDAY(i.issued_on)) per leg, then MIN over legs",
        "COUNT(JULIANDAY(p.paid_on) - JULIANDAY(i.issued_on))",
      ],
      answer: 1,
      why: "The clock is a min-of-mins: per-leg MIN finds each leg's first completion (split legs contribute their earliest part), then MIN over legs reads 13. Averaging or maxing per leg lets later parts poison the first-completion clock.",
      notes: [
        { choice: 0, why: "AVG over raw completion rows averages BOTH parts of every split leg — the clock reads a blend of first and second completions, and the SLA drifts." },
        { choice: 2, why: "MAX per leg picks each leg's LAST completion — the 'fastest leg' becomes the one whose slowest part was quickest, which is not the promise the customer sees." },
      ],
      difficulty: "medium",
    },
    {
      id: "wise-mcq-6",
      prompt: "WHERE amount_cents/100.0 > (SELECT AVG(amount_cents)/100.0 FROM payments WHERE method = 'sepa-instant') — no sepa-instant completions exist on this db. What does the query return?",
      choices: [
        "Every completion — the threshold reads 0",
        "No rows, silently — the empty scalar subquery yields NULL and every comparison against NULL is UNKNOWN",
        "An error: scalar subqueries must return exactly one row",
        "Only completions with NULL amounts",
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
      id: "wise-mcq-7",
      prompt: "WHERE leg_id NOT IN (SELECT leg_id FROM rate_staging) — rate_staging.leg_id is nullable in the copy pricing loaded. What can happen?",
      choices: [
        "It runs slower but stays correct",
        "One NULL in the subquery empties the entire result — every row fails the test",
        "NULL leg_ids are treated as unmatched and kept",
        "SQLite rewrites NOT IN as an anti-join automatically",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE — the comparison is UNKNOWN and NOT UNKNOWN is still UNKNOWN. One stray NULL silently returns zero rows. The NULL-proof shapes: NOT EXISTS, or LEFT JOIN … IS NULL.",
      notes: [
        { choice: 0, why: "The failure is correctness, not latency — an empty 'unquoted legs' report that looks like good news to the SLA board." },
        { choice: 2, why: "NULLs don't 'fail through' to kept rows — they poison the whole membership test for every row, kept or not." },
      ],
      difficulty: "hard",
    },
    {
      id: "wise-mcq-8",
      prompt: "The corridor packet stacks two corridor folds plus a TOTAL row. The three rows happen to be distinct, so UNION and UNION ALL return identical output today. Why is UNION still the wrong chip?",
      choices: [
        "UNION is slower and the packet is big",
        "UNION's dedupe is accidental — the day the TOTAL row collides with a corridor row, the packet silently loses a row; UNION ALL is the contract for stacks",
        "SQLite rejects UNION with aggregate branches",
        "They differ in column naming, not rows",
      ],
      answer: 1,
      why: "Stacks are stacked with UNION ALL by contract: each branch contributes its rows, no dedupe, on purpose. UNION works today only because no two rows collide — a correctness that depends on the data staying lucky is a bug on a delay. The transparency page ships UNION ALL or it ships a silent row loss.",
      notes: [
        { choice: 0, why: "Performance isn't the argument — dedupe changing the row set is. A packet whose row count can change when data collides is not a report, it's a lottery." },
        { choice: 2, why: "Compound SELECTs accept aggregate branches fine — both sides just need matching column counts and compatible types." },
      ],
      difficulty: "medium",
    },
    {
      id: "wise-mcq-9",
      prompt: "Two legs complete on the same timestamp; the leaderboard needs 'first completion per leg' deterministically. What makes the pick stable?",
      choices: [
        "ROW_NUMBER() OVER (PARTITION BY invoice_id ORDER BY paid_on) — the timestamp settles it",
        "ROW_NUMBER() OVER (PARTITION BY invoice_id ORDER BY paid_on, id) — the id breaks the tie deterministically",
        "MAX(paid_on) joined back to the legs table",
        "GROUP BY invoice_id with COUNT(*) — the leg with more rows wins",
      ],
      answer: 1,
      why: "When two rows share a timestamp, the ORDER BY needs a deterministic tiebreak — the row id — or SQLite is free to return either row, and the 'first completion' can flip between runs. The id tiebreak is what makes the pick reproducible, which is what split completion files demand.",
      notes: [
        { choice: 0, why: "Correct shape, incomplete contract: with a tied timestamp the window order is undefined between the two rows, so 'first' is whichever the engine feels like today." },
        { choice: 2, why: "MAX join-back returns BOTH tied rows, and every downstream count silently doubles — plus MAX reads the latest, not the first." },
      ],
      difficulty: "medium",
    },
    {
      id: "wise-mcq-10",
      prompt: "Completions in March 2024: WHERE paid_on BETWEEN '2024-03-01' AND '2024-03-31'. What does this window actually capture?",
      choices: [
        "All of March — BETWEEN is the month-bucket idiom",
        "All of March plus April 1 — the end bound is inclusive",
        "March minus completions after midnight on the 31st when paid_on carries a time component — '2024-03-31 14:20' fails the <= '2024-03-31' bound",
        "Nothing — BETWEEN cannot compare dates",
      ],
      answer: 2,
      why: "BETWEEN is inclusive on both ends, and a timestamped row like '2024-03-31 14:20' sorts after '2024-03-31' — so the month-end completions, exactly the ones the close needs, fall out. The safe shape is half-open: paid_on >= '2024-03-01' AND paid_on < '2024-04-01'.",
      notes: [
        { choice: 0, why: "The idiom only holds while paid_on is date-only. The column is a TEXT timestamp here, and the missing time part on the boundary string is the whole bug." },
        { choice: 1, why: "'2024-03-31' sorts before '2024-03-31 14:20' — April 1 was never in range; the loss is inside March 31 itself." },
      ],
      difficulty: "hard",
    },
    {
      id: "wise-mcq-11",
      prompt: "28 legs, 22 covered by completions. SELECT COUNT(*) FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id returns what?",
      choices: ["22", "27", "28", "49"],
      answer: 2,
      why: "LEFT JOIN keeps every leg; the six unmatched legs contribute one row each with NULL completion payload. COUNT(*) counts rows — NULLs included — so the fold reads 28, one per leg.",
      notes: [
        { choice: 0, why: "22 is the covered-leg count — that's COUNT(DISTINCT i.id), or what an INNER JOIN would leave. The LEFT JOIN's whole point is keeping the six unmatched legs the sweep exists to find." },
        { choice: 1, why: "27 is the completion-event count from the payments side. The join here is leg-grain: legs with no events still produce a row, so the count is 28, not 27." },
      ],
      difficulty: "easy",
    },
    {
      id: "wise-mcq-12",
      prompt: "Which expression computes the true average ticket from INTEGER-cent amounts?",
      choices: [
        "AVG(amount_cents / 100)",
        "AVG(amount_cents / 100) then ROUND(x, 2)",
        "AVG(amount_cents) / 100.0",
        "ROUND(AVG(amount_cents), 2)",
      ],
      answer: 2,
      why: "Fold in cents, convert once: AVG(amount_cents) / 100.0 divides real (the .0 forces float) after the fold. amount_cents / 100 is integer division — every row truncates before averaging — and rounding a cents-scale number never converts the unit.",
      notes: [
        { choice: 0, why: "Truncation per row: a 243,050-cent completion reads 2430 — the .50 vanished before the average ever saw it, and the result drifts below truth." },
        { choice: 3, why: "ROUND(AVG(amount_cents), 2) rounds a number that is still in CENTS — no /100 ever happened; the unit is wrong by 100× and the rounding is decoration." },
      ],
      difficulty: "easy",
    },
    {
      id: "wise-mcq-13",
      prompt: "SELECT GROUP_CONCAT(DISTINCT method) FROM payments — how many rows come back?",
      choices: ["27", "2", "1", "0"],
      answer: 2,
      why: "GROUP_CONCAT is a fold like SUM: the whole table collapses to one row carrying one string — 'card,wire'. The distinct methods ride inside the cell, not in the row set.",
      notes: [
        { choice: 0, why: "27 is the input row count — folds collapse it; only a GROUP BY would keep one row per method, and there is none here." },
        { choice: 1, why: "Two is the distinct-method count, but it's folded into a single string cell — the result is one row either way." },
      ],
      difficulty: "easy",
    },
    {
      id: "wise-mcq-14",
      prompt: "One-pass census: COUNT(*) FILTER (WHERE method = 'card') over the 27 completions reads what?",
      choices: ["27", "16", "11", "NULL"],
      answer: 1,
      why: "FILTER (WHERE) counts only the rows passing its predicate — the 16 card completions. The wire rows still exist in the scan; they just don't enter this branch. Five FILTERs in one SELECT is the corridor census in a single pass.",
      notes: [
        { choice: 0, why: "27 is the unfiltered COUNT(*) — the entire point of FILTER is the branch count inside the same scan." },
        { choice: 2, why: "11 is the wire corridor — right shape, wrong predicate; each branch follows its own WHERE." },
      ],
      difficulty: "medium",
    },
    {
      id: "wise-mcq-15",
      prompt: "Month-over-month completion deltas via LAG(COUNT(*)) OVER (ORDER BY month): what does the first month's delta read?",
      choices: ["0", "NULL", "The first month's own count", "An error — LAG needs a previous row"],
      answer: 1,
      why: "There is no previous month, so LAG yields NULL and the delta is NULL — correct, not broken: the walk starts there. Coalesce at the display edge if the deck needs a number, and say so.",
      notes: [
        { choice: 0, why: "A zero invents a flat start — NULL means 'no predecessor', which is a different fact from 'no movement', and a ledger walk treats them differently." },
        { choice: 3, why: "LAG on the first row of a partition is defined: it returns NULL. Only an empty window input would error, and that isn't this." },
      ],
      difficulty: "medium",
    },
    {
      id: "wise-mcq-16",
      prompt: "The never-completed sweep: why is NOT EXISTS preferred over NOT IN when the staging copy can carry NULL leg ids?",
      choices: [
        "NOT EXISTS is faster on small tables",
        "NOT EXISTS asks 'any matching row at all?', so a NULL in the inner column can't poison the whole test the way it does for NOT IN",
        "NOT EXISTS converts to an INNER JOIN automatically",
        "NOT IN is fine — SQLite rewrites both identically",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE; NOT EXISTS never compares against the NULL — it stops at the first matching row. Both find the same six legs only while the inner column stays NOT NULL; the sweep must survive a bad load.",
      notes: [
        { choice: 0, why: "Performance isn't the argument — the failure is correctness: one NULL and NOT IN returns zero legs, a clean-looking book with $15,217.00 of missing exposure." },
        { choice: 2, why: "The planner may choose whatever it likes; semantics are the contract, and NOT IN's semantics break under NULLs regardless of the plan." },
      ],
      difficulty: "medium",
    },
    {
      id: "wise-mcq-17",
      prompt: "Running SUM(amount_cents) OVER (ORDER BY paid_on): two completions share a timestamp. What does the default frame do at the tie?",
      choices: [
        "Each row adds its own amount — ties don't matter",
        "Both tied rows see each other's amounts (RANGE semantics): the running total jumps by the tie's sum at the first row and plateaus through the second",
        "The query errors on duplicate ORDER BY values",
        "The tie is broken alphabetically by method",
      ],
      answer: 1,
      why: "The default frame with ORDER BY is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — peers (ties) are included together. The printed walk jumps then plateaus; ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW adds one physical row at a time.",
      notes: [
        { choice: 0, why: "That's ROWS semantics, not the default — assuming it is exactly how the plateau ships into a ledger walk that must reconcile to the rail file." },
        { choice: 2, why: "Duplicate ORDER BY keys are legal; the engine just can't order between them — which is why the frame's peer treatment, not an error, is the behavior." },
      ],
      difficulty: "hard",
    },
    {
      id: "wise-mcq-18",
      prompt: "SELECT … FROM payments p1 WHERE amount_cents > (SELECT AVG(amount_cents) FROM payments p2 WHERE p2.method = p1.method GROUP BY p2.method) — what happens?",
      choices: [
        "Runs fine — the GROUP BY is redundant",
        "Errors: the GROUP BY makes the scalar subquery return one row per corridor, and a scalar slot accepts only one",
        "Returns every completion",
        "Returns NULL for every row",
      ],
      answer: 1,
      why: "The scalar contract is zero-or-one rows, one column. GROUP BY method makes the inner fold emit one row PER corridor — two corridors, two rows — and the comparison errors. Drop the GROUP BY: the correlated WHERE already scopes the fold to one corridor.",
      notes: [
        { choice: 0, why: "It errors on execution — the inner fold emits one row per corridor, and the scalar slot accepts one row total; the correlated WHERE made the GROUP BY redundant, and redundancy here is fatal." },
        { choice: 2, why: "No row passes trivially — the query never gets that far; the shape dies at the scalar contract, not at the comparison." },
      ],
      difficulty: "hard",
    },
    {
      id: "wise-mcq-19",
      prompt: "Flag paid legs with no completion behind them (#28, $1,756.00). Which arm catches it on a LEFT JOIN per-leg fold?",
      choices: [
        "COALESCE(SUM(p.amount_cents), 0) = 0",
        "SUM(p.amount_cents) IS NULL OR SUM(p.amount_cents) = 0",
        "p.paid_on IS NULL",
        "i.status = 'paid' AND SUM(p.amount_cents) IS NOT NULL",
      ],
      answer: 0,
      why: "With no completion rows, the payload columns are NULL and SUM reads NULL — the COALESCE reads it as a zero arrival and the equality arms the flag. Status can ride alongside ('paid' AND zero arrival = #28), but the money test is the detector.",
      notes: [
        { choice: 1, why: "SUM IS NULL works here, but the OR-0 half is the smell of a COALESCE placed too early — a real zero-arrival and a NULL arrival should print differently mid-pipeline." },
        { choice: 2, why: "p.paid_on doesn't exist on the leg row — completion columns only live on the payments side; the leg's own dates are issued_on and due_on." },
      ],
      difficulty: "medium",
    },
    {
      id: "wise-mcq-20",
      prompt: "Coverage shares on 28 legs: 21 exact, 1 partial, 6 none. Each share rounds to 1 decimal independently. What ships and why?",
      choices: [
        "75.0 / 3.6 / 21.4 — they sum to 100.0, so it's safe",
        "75.0 / 3.6 / 21.4 — and the sum hitting 100.0 is luck; the report carries the raw counts (21 / 1 / 6 of 28) so the parts stay re-derivable",
        "75 / 4 / 21 — round to integers and they sum exactly",
        "One decimal is too precise — print whole percents",
      ],
      answer: 1,
      why: "21/28 is exactly 75.0, but 1/28 = 3.571… and 6/28 = 21.428… — the tenths reassemble to 100.0 by coincidence of this book, not by construction. Change the leg count and the same code prints 99.9. The counts beside the shares are the honesty guarantee.",
      notes: [
        { choice: 0, why: "Summing to 100.0 today is the trap — a share report whose cleanliness depends on the data staying lucky is a bug on a delay." },
        { choice: 2, why: "Rounding harder doesn't make the sum robust — it makes it wrong faster; 75 + 4 + 21 = 100 only while the data cooperates." },
      ],
      difficulty: "hard",
    },
    {
      id: "wise-mcq-21",
      prompt: "The partial-completion share: 1 leg of 28, printed to 1 decimal. Which expression ships it correctly?",
      choices: [
        "100 * 1 / 28",
        "ROUND(100.0 * 1 / 28, 1)",
        "100 / 28",
        "ROUND(1 / 28, 1)",
      ],
      answer: 1,
      why: "The 100.0 forces real division before the fold; ROUND lands once at the display edge — 3.6. Every integer shape truncates first: 100 * 1 / 28 is 3, and the share prints as a rounding of 3.",
      notes: [
        { choice: 0, why: "Integer arithmetic end to end: 100 / 28 = 3 — the 0.571 of a leg never existed in the computation." },
        { choice: 3, why: "1 / 28 truncates to 0 first — the share reads 0.0 and the partial leg disappears from the fee page." },
      ],
      difficulty: "easy",
    },
    {
      id: "wise-mcq-22",
      prompt: "Why does COUNT(p.invoice_id) equal COUNT(*) on a plain payments fold?",
      choices: [
        "COUNT skips NULLs and invoice_id is never NULL — the FK is NOT NULL",
        "COUNT(*) is defined as COUNT(first column)",
        "SQLite optimizes both to the same plan, so they must agree",
        "They don't — COUNT(*) is always 1 higher",
      ],
      answer: 0,
      why: "The only difference between COUNT(col) and COUNT(*) is NULL-skipping; with a NOT NULL FK there are no NULLs to skip, so both read 27. The distinction matters the moment the column can be NULL — then COUNT(col) counts arrivals while COUNT(*) counts rows.",
      notes: [
        { choice: 1, why: "COUNT(*) counts rows, full stop — 'first column' isn't in the contract, and no column is more primary than another here." },
        { choice: 2, why: "The plans agree because the semantics agree here — causality runs that way; a nullable column would split them again." },
      ],
      difficulty: "easy",
    },
    {
      id: "wise-mcq-23",
      prompt: "The corridor packet sorts ORDER BY volume_usd DESC, method. Why the second key?",
      choices: [
        "It alphabetizes the whole report",
        "Volumes can tie; a deterministic secondary key fixes the print order between runs",
        "SQLite requires two keys in compound queries",
        "It speeds up the sort",
      ],
      answer: 1,
      why: "DESC alone leaves tied volumes unordered — the engine may print either order, and a packet that flips between runs is a reconciliation artifact nobody trusts. method is unique per fold, so the pair is a total order.",
      notes: [
        { choice: 0, why: "The secondary key only fires on ties — card and wire sort alphabetically within equal volumes, not overall." },
        { choice: 3, why: "It doesn't — the second key is negligible cost; its value is determinism, not speed." },
      ],
      difficulty: "easy",
    },
    {
      id: "wise-mcq-24",
      prompt: "SUBSTR(paid_on, 1, 7) and STRFTIME('%Y-%m', paid_on) both bucket months. What's the honest caveat?",
      choices: [
        "They're identical in every engine forever",
        "They agree only while paid_on stays fixed-width ISO text — a format drift breaks SUBSTR silently and STRFTIME loudly",
        "SUBSTR is faster, so production uses it exclusively",
        "STRFTIME can't handle date-only strings",
      ],
      answer: 1,
      why: "SUBSTR is a string slice: '2024-03' works because ISO timestamps are fixed-width — nothing in the column enforces that. STRFTIME parses the value, so it survives format wobble (and errors where SUBSTR would mis-bucket). Either is fine on this book; say which convention you're leaning on.",
      notes: [
        { choice: 0, why: "The whole bug class is 'a convention nothing enforces' — identical today is not a contract." },
        { choice: 2, why: "Speed on 27 rows is noise; the choice is about what happens when the format wobbles, and SUBSTR fails silently — the worst direction." },
      ],
      difficulty: "medium",
    },
    {
      id: "wise-mcq-25",
      prompt: "March completions on a table that will hold millions of rows: which WHERE keeps the index usable?",
      choices: [
        "WHERE STRFTIME('%Y-%m', paid_on) = '2024-03'",
        "WHERE SUBSTR(paid_on, 1, 7) = '2024-03'",
        "WHERE paid_on >= '2024-03-01' AND paid_on < '2024-04-01'",
        "WHERE JULIANDAY(paid_on) BETWEEN 19783 AND 19813",
      ],
      answer: 2,
      why: "The half-open range predicates the bare column — the index on paid_on does the work. Wrapping the column in a function (STRFTIME, SUBSTR, JULIANDAY) hides it from the index and forces a scan; invisible at 28 rows, the outage at 28 million.",
      notes: [
        { choice: 0, why: "Correct rows, wrong plan — the function on the column defeats the index no matter how canonical the format string." },
        { choice: 3, why: "JULIANDAY math also buries the column in a function — and the BETWEEN re-invites the inclusive-bound trap this kit drills." },
      ],
      difficulty: "medium",
    },
    {
      id: "wise-mcq-26",
      prompt: "Corridor × month grid, zero-filled: 2 rails, 14 months. What does the CROSS JOIN spine produce before the folds join on?",
      choices: ["27 rows", "28 rows — one per corridor-month cell whether or not data exists", "2 rows", "378 rows"],
      answer: 1,
      why: "The spine is the full lattice: 2 × 14 = 28 cells, every quiet month included, so the report can print 0 where the rails went dark. The completion folds LEFT JOIN onto the spine and COALESCE fills the misses at the edge.",
      notes: [
        { choice: 0, why: "27 is the completion-event count — the spine isn't the data, it's the grid the data lands on; the extra empty cells are the point." },
        { choice: 3, why: "That's the Cartesian scare number (events × months) — the spine crosses the two dimension lists, never the fact table." },
      ],
      difficulty: "medium",
    },
    {
      id: "wise-mcq-27",
      prompt: "Two completions tie for the biggest ticket in a corridor. How do ROW_NUMBER, RANK and DENSE_RANK disagree at the tie?",
      choices: [
        "They don't — all three print 1, 2 for the tie",
        "ROW_NUMBER prints 1 and 2 in arbitrary order; RANK prints 1, 1 then skips to 3; DENSE_RANK prints 1, 1 then 2",
        "RANK errors on ties; the others don't",
        "All three print 1, 1",
      ],
      answer: 1,
      why: "ROW_NUMBER never ties — it needs the id tiebreak to be deterministic. RANK keeps gaps (competition ranking); DENSE_RANK doesn't. A 'top-3 leaderboard' returns four rows under RANK with a tie and three under DENSE_RANK — the row count is part of the contract.",
      notes: [
        { choice: 0, why: "ROW_NUMBER always numbers uniquely — that's its job; assuming it ties is how a leaderboard silently drops a medal." },
        { choice: 2, why: "Nothing errors — ties are the ordinary case; the functions differ in how they number through them." },
      ],
      difficulty: "medium",
    },
    {
      id: "wise-mcq-28",
      prompt: "Reconciliation diff: SELECT id FROM invoices WHERE status = 'void' EXCEPT SELECT invoice_id FROM payments returns EMPTY. What did you just learn?",
      choices: [
        "The ledger and rails agree — ship it",
        "Nothing is void-but-completed… which contradicts the gold-set: void #11 carried a $925.00 completion, so an empty diff means the payments side lost the anomaly — the fixture failed, page someone",
        "EXCEPT dedupes, so the diff is unreliable",
        "The void leg has no id",
      ],
      answer: 1,
      why: "The gold-set pins void-but-completed to exactly one row. An empty EXCEPT on this book doesn't mean clean — it means the query that produced it no longer matches reality (wrong table, wrong filter, stale copy). An empty diff where a known anomaly lives is the alarm, not the all-clear.",
      notes: [
        { choice: 0, why: "'Agreement' is only meaningful against a population you can trust — here the empty diff disagrees with a pinned fact, which is exactly what fixtures are for." },
        { choice: 2, why: "Dedupe is irrelevant — leg ids are unique; the empty result is a population problem, not an operator problem." },
      ],
      difficulty: "hard",
    },
    {
      id: "wise-mcq-29",
      prompt: "SELECT month, SUM(SUM(completions)) OVER (ORDER BY month) — is folding an aggregate over an aggregate legal, and what does the first row print?",
      choices: [
        "Illegal — you can't nest aggregates in a window",
        "Legal: the GROUP BY folds months first, then the window runs over the folded rows — the first row prints the first month's own count",
        "Legal, but the first row prints the grand total",
        "Illegal without a CTE",
      ],
      answer: 1,
      why: "Windows evaluate after GROUP BY, so the window's input is one row per month and SUM(...) OVER (...) walks the monthly counts cumulatively — the first row equals the first month's own count, the walk starting at its true value. A CTE makes the same shape more readable, not more legal.",
      notes: [
        { choice: 0, why: "It parses and runs — the nesting is aggregate-over-window-input, and the input is already folded; that's the standard cumulative pattern." },
        { choice: 2, why: "The frame starts at UNBOUNDED PRECEDING — the first row has only itself in frame, so it prints its own month, not the whole book." },
      ],
      difficulty: "hard",
    },
    {
      id: "wise-mcq-30",
      prompt: "The split-completion rate is quoted as 22.7%. Which population is that — and why are 27 and 28 both wrong?",
      choices: [
        "5 ÷ 27 completion events — events are the natural denominator",
        "5 ÷ 22 covered legs — splits can only happen among legs that completed; 27 double-counts split parts, 28 adds six legs that never completed and cannot split",
        "5 ÷ 28 — all legs, always the safest denominator",
        "5 ÷ 5 — the splits themselves",
      ],
      answer: 1,
      why: "The rate measures 'of legs that completed, how many needed two parts' — the covered legs. 27 counts events (five legs contribute two rows each), inflating the denominator with the very phenomenon being measured; 28 includes never-completed legs that had no chance to split. Denominators are definitions: state the population, then the percent.",
      notes: [
        { choice: 0, why: "Event-denominated rates are how a split leg pays the metric twice — the same first-completion-only rule the SLA clock runs on." },
        { choice: 2, why: "'Safest' is the trap: 28 answers a different question — split rate among ALL legs, including the never-completed. Defensible if the memo asks THAT; silently wrong if it doesn't." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-wise-1",
      tier: "medium",
      topic: "t3",
      universe: "month-close",
      title: "The transfer clock: completion-speed SLA",
      brief:
        "Month-close memo from the transfers pod: the SLA board reads one number — days from transfer mandate (issued_on) to first completion (paid_on) — and this book's paid legs average 28.4 days, fastest 13, slowest 84, across 20 legs. First completion only: five legs complete in two parts and the clock must not pay the SLA twice. Dates parse via JULIANDAY, status gates the population to paid legs, and ROUND lands exactly once at the end.",
      ask: "Return the paid-leg count plus average, fastest and slowest mandate-to-completion days (1 decimal).",
      template:
        "WITH leg_clock AS (\n  SELECT i.id,\n         JULIANDAY(i.issued_on) AS issue_jd,\n         {1}(JULIANDAY(p.paid_on)) AS paid_jd\n  FROM invoices i\n  JOIN payments p ON p.invoice_id = {2}\n  WHERE i.status = {3}\n  GROUP BY i.id\n)\nSELECT COUNT(*) AS transfers,\n       ROUND(AVG(paid_jd - issue_jd), 1) AS avg_days,\n       ROUND(MIN(paid_jd - issue_jd), 1) AS fastest_days,\n       ROUND(MAX(paid_jd - issue_jd), 1) AS slowest_days\nFROM leg_clock;",
      slots: [
        {
          answer: "MIN",
          kind: "keyword",
          label: "the first-completion fold",
          why: "MIN(JULIANDAY(paid_on)) picks each leg's earliest completion — the SLA event. MAX reads the LAST part of every split leg and the clock drifts; SUM adds raw timestamps and produces calendar-scale garbage.",
        },
        {
          answer: "i.id",
          kind: "keyword",
          label: "the completion-to-leg key",
          why: "Completions attach to legs via p.invoice_id. p.id is the completion's own row id — the join degenerates to row-id collisions, mispairing legs and corrupting every clock the CTE produces.",
        },
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the paid-leg population gate",
          why: "The SLA population is paid legs: 21 on the book, of which 20 have completions (#28 has none and drops via the join). 'open' yields just the partial leg #25 — a 1-row clock that looks like a 1-leg business.",
        },
      ],
      distractors: ["MAX", "SUM", "p.id", "'open'"],
      walkthrough:
        "The completion clock is a two-stage build: stage the per-leg clock in a CTE, then fold it. Inside leg_clock, each leg contributes exactly one row — MIN(JULIANDAY(paid_on)) takes the FIRST completion, which is what kills the split-leg double-count (legs #1, #5, #12, #19, #22 complete twice; the clock reads their earliest part once). The join key p.invoice_id = i.id attaches completions to legs, WHERE i.status = 'paid' gates the population to 21 paid legs — and the join itself drops #28, the paid leg with no completion, leaving exactly 20. The outer fold reads the probed figures: average 28.4 days, fastest 13, slowest 84, each rounded exactly once at the display edge. The distractors fail where the craft lives: MAX turns the clock into latest-completion stats, SUM folds raw julianday timestamps into astronomical 'days', p.id mispairs completions to legs by row-id collision, and 'open' shrinks the population to the single partial leg #25. Twenty legs, one clock, first completion only — the SLA board's Monday number, rebuilt.",
    },
    {
      id: "cs-wise-2",
      tier: "hard",
      topic: "x3",
      universe: "growth",
      title: "The corridor packet: volumes with the grand total",
      brief:
        "Board-deck memo from pricing: the transparency page shows the corridor packet — every completion corridor with its transfer count, principal volume and average ticket — then a labelled grand-total row so the board can check the parts against the whole. The book: instant corridor 16 completions / $37,364.00 (avg ticket $2,335.25), cross-border corridor 11 / $32,248.00 (avg ticket $2,931.64), total 27 / $69,612.00. Cents convert via /100.0, and the packet is a stack of folds, not a join.",
      ask: "Stack the two corridor rows plus a 'TOTAL' grand row (count, volume, avg ticket), biggest volume first.",
      template:
        "SELECT method AS corridor,\n       COUNT(*) AS transfers,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS volume_usd,\n       ROUND(AVG(amount_cents) / 100.0, 2) AS avg_ticket\nFROM payments\nGROUP BY method\n{1}\nSELECT {2}, {3}(*), ROUND(SUM(amount_cents) / 100.0, 2),\n       ROUND(AVG(amount_cents) / 100.0, 2)\nFROM payments\nORDER BY volume_usd {4};",
      slots: [
        {
          answer: "UNION ALL",
          kind: "keyword",
          label: "the stack operator",
          why: "Packets stack branches with UNION ALL — each branch contributes its rows, no dedupe, by contract. INTERSECT would intersect the branch row sets (empty) and EXCEPT would keep only the corridor rows, dropping the TOTAL the board checks against.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-row label",
          why: "The third branch must be labelled 'TOTAL' or the board can't tell the whole from the parts — two corridor rows would print instead, and 27 / $69,612.00 would masquerade as a third corridor.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the event counter",
          why: "COUNT(*) counts the 27 completions folded into the total row. SUM(*) and MAX(*) don't exist: only COUNT takes the star to count rows rather than fold values.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first order",
          why: "The packet opens with the whole: TOTAL $69,612.00, then instant $37,364.00, then cross-border $32,248.00. ASC buries the check row at the bottom where nobody reconciles it.",
        },
      ],
      distractors: ["INTERSECT", "EXCEPT", "SUM", "'card'", "ASC"],
      walkthrough:
        "A packet is two folds and a label, stacked. Branch one folds the completions per corridor: instant rail 16 transfers / $37,364.00 / $2,335.25 average ticket, cross-border rail 11 / $32,248.00 / $2,931.64 — the corridor grain, one row per method. Branch two folds the whole table once and labels the row 'TOTAL': 27 / $69,612.00 / $2,578.22. UNION ALL stacks them — both branches carry the same four columns, so the compound is legal, and ALL is the contract because dedupe has no place in a report whose row count must equal branch counts. ORDER BY volume_usd DESC applies across the whole stack, putting the check row on top where the board reconciles parts to whole first. The dollars come from /100.0 on INTEGER cents — the packet's unit conversion, done once per fold. The distractors fail exactly where the craft lives: INTERSECT intersects the branch row sets (empty — the packet vanishes), EXCEPT drops the TOTAL branch, SUM can't take the star, 'card' double-labels the total as a corridor (two card rows, the board adds the wrong numbers), and ASC buries the check row. Two corridors, one whole, one label — the transparency page, in a single compound query.",
    },
    {
      id: "cs-wise-3",
      tier: "hard",
      topic: "s6",
      universe: "month-close",
      title: "The coverage census: exact, partial, never",
      brief:
        "Close-week memo from treasury: before the transparency page ships, every transfer leg in the book must be classified by what actually arrived behind it — **exact** (completions rebuild the principal to the cent), **partial** (some money, not all), **no completion** (nothing ever landed). The probed book reads 21 exact legs carrying $65,612.00, 6 never-completed legs carrying $15,217.00, and 1 partial — leg #25 at $4,000.00 of $6,148.00. The classification is a CASE over a staged per-leg fold, and the classes ARE the deliverable: the six are the exposure, the partial is the chase list, the twenty-one are the proof.",
      ask: "Return each coverage class with leg count and principal dollars (2 decimals), biggest leg count first.",
      template:
        "SELECT coverage,\n       {1}(*) AS legs,\n       ROUND(SUM(principal_cents) / 100.0, 2) AS principal_usd\nFROM (\n  SELECT i.id,\n         i.amount_cents AS principal_cents,\n         CASE\n           WHEN COUNT(p.id) = {2} THEN 'no completion'\n           WHEN SUM(p.amount_cents) = i.amount_cents THEN {3}\n           ELSE 'partial'\n         END AS coverage\n  FROM invoices i\n  {4} JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n)\nGROUP BY coverage\nORDER BY legs DESC;",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the class counter",
          why: "The derived table stages one row per leg, so COUNT(*) folds each coverage class to its leg count — 21 exact, 6 no completion, 1 partial, the probed census. SUM(*) and MAX(*) do not exist: only COUNT takes the star.",
        },
        {
          answer: "0",
          kind: "number",
          noVerify: true,
          label: "the zero-completion test",
          why: "A leg with no completion row keeps NULL payload columns under the LEFT JOIN, so COUNT(p.id) reads 0 — that zero is the arm that catches the 6 never-completed legs, $15,217.00 of exposure. COUNT(p.id) = 1 would instead sweep the 17 single-shot legs into the exception class.",
        },
        {
          answer: "'exact'",
          kind: "keyword",
          label: "the matched-arm label",
          why: "When SUM(p.amount_cents) rebuilds the principal to the cent, the leg is exact — 21 legs, $65,612.00, the proof row. The label must say what was tested; a 'paid' label would quote the book's status vocabulary while the arm actually tests money-moved-equals-principal.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the keep-every-leg join",
          why: "LEFT keeps all 28 legs, handing the 6 with no completion a NULL payload the CASE can classify. INNER deletes exactly those six, the 'no completion' row vanishes, and the census prints a clean book that was never clean.",
        },
      ],
      distractors: ["1", "'paid'", "INNER", "CROSS"],
      walkthrough:
        "The census is a two-stage build: stage one folds the join to leg grain and classifies, stage two folds the classes to the memo. Stage one LEFT JOINs completions to legs so every leg survives; per leg, COUNT(p.id) counts completion rows (0 for the six never-completed legs — the NULL-payload arm), and SUM(p.amount_cents) rebuilds arrived money (equality for the 21 exact legs including void-but-completed #11, whose $925.00 arrives against a killed leg — surfaced, not hidden; short for #25, the $4,000.00-of-$6,148.00 partial). Stage two groups by the classification: exact 21 / $65,612.00, no completion 6 / $15,217.00, partial 1 / $6,148.00, biggest class first. The distractors fail where the craft lives: a 1 in the zero-arm reclassifies the 17 single-shot legs as exceptions, INNER deletes the six-leg exposure row, CROSS keeps the ON filter so it collapses to the inner-join census, and a 'paid' label misquotes the test the arm performs. Counts and dollars reconcile to the probed book — the classes ARE the reconciliation.",
    },
    {
      id: "cs-wise-4",
      tier: "medium",
      topic: "j7",
      universe: "fraud",
      title: "The split-completion scan",
      brief:
        "Risk-spot-check memo: legs that complete in parts are normal rail behavior, but every split is a fan-out waiting to double-count a fold, and a leg rebuilding to more than its principal would be an incident. The pod's standing scan: group completion rows per leg, keep the ones with **2+ rows**, and print the rebuild. The probed gold-set: five legs — #1, #5, #12, #19, #22 — each completing as two rows totalling $4,860.00, $5,284.00, $4,723.00, $5,614.00 and $4,459.00; none overshoots its principal.",
      ask: "Return each split-completed leg with its status, part count and completed dollars (2 decimals), in leg order.",
      template:
        "SELECT i.id AS leg,\n       i.status,\n       {1}(*) AS parts,\n       ROUND(SUM(p.amount_cents) / 100.0, 2) AS completed_usd\nFROM invoices i\nJOIN payments p ON p.invoice_id = {2}\nGROUP BY i.id\nHAVING COUNT(*) >= {3}\nORDER BY leg;",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the parts counter",
          why: "COUNT(*) counts completion rows per leg — 2 for each split leg, the scan's trigger condition. SUM(*) is not valid SQL and MAX(*) folds to the largest row value: neither counts parts.",
        },
        {
          answer: "i.id",
          kind: "keyword",
          label: "the completion-to-leg key",
          why: "Completions attach to legs through p.invoice_id = i.id. p.id is the completion's own row id — the join would pair each completion to whatever leg shares its row number, and the rebuild prints money against the wrong legs.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the split threshold",
          why: "A split completion is 2+ rows on one leg; the probed scan returns exactly the five two-part legs (#1, #5, #12, #19, #22 — the parts column reads 2 on every row). The threshold 1 would return all 22 covered legs, 3 would return none.",
        },
      ],
      distractors: ["SUM", "p.id", "1", "3"],
      walkthrough:
        "A scan whose whole job is keeping the fold at the right grain. The join is legs to completions on p.invoice_id = i.id — 27 completion rows across 22 covered legs, because five legs complete twice. GROUP BY i.id pulls the grain back to one row per leg, COUNT(*) reads the part count, and HAVING COUNT(*) >= 2 keeps only the splits: legs #1, #5, #12, #19, #22, each printing parts = 2 and a rebuild that lands exactly on its principal — $4,860.00, $5,284.00, $4,723.00, $5,614.00, $4,459.00. That equality is the quiet risk finding: five splits, zero overshoots. The distractors break the grain or the gate: SUM cannot take the star and errors, p.id joins completions to legs by row-id collision, threshold 1 deletes the scan by keeping every covered leg, threshold 3 returns an empty scan on a book whose splits are all two-part. Five legs, two rows each, one rebuild each — the fan-out census the folds downstream depend on.",
    },
    {
      id: "cs-wise-5",
      tier: "hard",
      topic: "q5",
      universe: "pricing",
      title: "The ticket test: corridors vs the book average",
      brief:
        "Pricing-review memo: the fee curve is banded by ticket size, so the corridors must be read against the **book-average ticket** — $2,578.22 across all 27 completions. A corridor whose average ticket beats the book carries the big-transfer mix the premium bands price for; a corridor below it carries the small-ticket volume the flat fee protects. Stage the per-corridor folds in a derived table, then keep only the rows that beat the book: on the probed rails, the **cross-border corridor** averages $2,931.64 on 11 completions, while the instant corridor averages $2,335.25 on 16.",
      ask: "Return the corridor(s) whose average ticket beats the book average, with transfer count and average ticket (2 decimals).",
      template:
        "SELECT corridor,\n       transfers,\n       avg_ticket\nFROM (\n  SELECT {1} AS corridor,\n         COUNT(*) AS transfers,\n         ROUND({2}(amount_cents) / 100.0, 2) AS avg_ticket\n  FROM payments\n  GROUP BY method\n)\nWHERE {3} > (SELECT ROUND(AVG(amount_cents) / 100.0, 2) FROM payments)\nORDER BY avg_ticket DESC;",
      slots: [
        {
          answer: "method",
          kind: "keyword",
          label: "the corridor grain",
          why: "method is the corridor column — one fold per rail. paid_on would re-grain the fold per completion day, printing a row per day instead of a row per corridor and shredding the comparison the memo asks for.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the ticket fold",
          why: "Average ticket is AVG(amount_cents) / 100.0 — $2,335.25 instant, $2,931.64 cross-border. SUM would compare corridor totals ($37,364.00, $32,248.00) against an average — both pass, both wrong; MAX would compare each rail's biggest single completion.",
        },
        {
          answer: "avg_ticket",
          kind: "keyword",
          label: "the tested measure",
          why: "The WHERE tests the staged average against the book average. transfers would compare 16 and 11 against $2,578.22 — nothing passes and the review reads as 'no corridors', which is a grain error, not a finding.",
        },
      ],
      distractors: ["paid_on", "SUM", "MAX", "transfers"],
      walkthrough:
        "Two stages, one test, the book average as the yardstick. The derived table folds completions per corridor — COUNT(*) for volume, AVG(amount_cents)/100.0 for ticket: instant 16 / $2,335.25, cross-border 11 / $2,931.64. The scalar subquery folds the whole book once: $2,578.22 average across 27 completions. The outer WHERE keeps the rows that beat it — one row: cross-border, 11 transfers, $2,931.64. The cents discipline is the same everywhere: fold in cents, divide by 100.0 once per fold, ROUND once at the display. The distractors fail on grain or on fold: paid_on re-grains the inner fold to days, SUM tests corridor totals against an average (both pass — two rows instead of one), MAX tests each rail's biggest ticket (again two rows), and transfers compares counts to dollars — a units bug the fee-transparency review exists to catch. One corridor beats the book, and the number that says so is an average over an average — each folded once, each in cents until the last divide.",
    },
    {
      id: "cs-wise-6",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The ticket-size leaderboard",
      brief:
        "Growth-board memo: the deck's headline is the **ticket-size leaderboard** — the single biggest completion each corridor ever shipped, because 'instant rail moves small money fast' is only a defensible story if the big-ticket corridor is named beside it. Row-number the completions within each corridor, biggest first, keep the podium step. On the probed rails: the instant corridor's biggest completion is $4,015.00 (2024-07-01), the cross-border corridor's is $4,000.00 (2025-02-10 — the completion behind partial leg #25).",
      ask: "Return each corridor's biggest completion with its rank, completion date and amount (2 decimals).",
      template:
        "SELECT corridor,\n       rnk,\n       paid_on,\n       amount\nFROM (\n  SELECT method AS corridor,\n         paid_on,\n         ROUND(amount_cents / 100.0, 2) AS amount,\n         ROW_NUMBER() OVER (PARTITION BY {1} ORDER BY amount_cents {2}, id) AS rnk\n  FROM payments\n)\nWHERE rnk = {3};",
      slots: [
        {
          answer: "method",
          kind: "keyword",
          label: "the corridor partition",
          why: "PARTITION BY method restarts the numbering per corridor — one leaderboard per rail. paid_on would restart it per day (a winner per day, dozens of rows); amount_cents would restart it per amount, making nearly every row its own winner.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first window order",
          why: "amount_cents DESC puts each corridor's biggest completion at rank 1. ASC would crown the smallest completion per corridor — the leaderboard inverted, with the two tiniest tickets on the podium.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the podium step",
          why: "The deck wants the winner's row — rnk = 1, the rank column the window prints. rnk = 2 ships the silver medals: $3,076.00 and $3,896.00, real rows and the wrong rows.",
        },
      ],
      distractors: ["ASC", "2", "paid_on", "amount_cents"],
      walkthrough:
        "A leaderboard is a window, not a fold — folding with MAX would lose the date the story needs. The inner SELECT numbers every completion within its corridor: PARTITION BY method keeps the two rail leaderboards separate, ORDER BY amount_cents DESC, id puts the biggest first and breaks timestamp ties deterministically by row id, and ROW_NUMBER assigns 1..n per corridor. The outer filter keeps the podium step — rnk = 1 — which prints exactly two rows: instant corridor $4,015.00 on 2024-07-01, cross-border corridor $4,000.00 on 2025-02-10 (the completion behind the $6,148.00 partial leg #25 — worth a footnote in the deck, since 'biggest wire' and 'incomplete leg' are the same row here). The distractors fail on partition or direction: ASC crowns each rail's smallest ticket, a 2 in the partition orders by column position and crowns the earliest completion, paid_on partitions per day so every day gets a winner, and podium step 2 ships the runners-up. Two rails, two winners, dates attached — the headline row the growth deck ships.",
    },
  ],

  problems: [
    { slug: "fx-exposure-report", why: "Wise-tagged: normalize balances at the latest rate at-or-before each timestamp — the as-of rate join that keeps every cross-border number honest to the moment it was quoted." },
    { slug: "circular-transfers", why: "Wise-tagged: mutual transfer pairs inside an epoch window — the circulation pattern risk reads as round-tripping, canonicalized so each pair counts once." },
    { slug: "monthly-transactions-i", why: "Month-bucket totals with a status-conditional count alongside — the completion calendar the transfers pod opens every close with, in graded form." },
    { slug: "bank-account-summary-ii", why: "Account-level join-and-fold — the corridor book's per-entity read: balances, activity and status in one pass, the packet's building block." },
    { slug: "average-time-of-process-per-machine", why: "Start-to-end duration per entity — the completion clock drill: mandate-to-completion math where MIN per leg keeps split completions honest." },
    { slug: "customers-who-never-order", why: "The anti-join outstanding read — legs with no completion row (6 of them, $15,217.00 on this db): LEFT JOIN + IS NULL is the sweep, in drill form." },
    { slug: "trial-balance-check", why: "Debits-equal-credits in one conditional SUM — the clearing-ledger reflex this kit's ledger topics reward; the delta is the only metric allowed to be boring." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one pass with the 100.0-before-division fix — the honest-denominator habit every fee-transparency percentage here needs." },
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded share where unmatched rows count as zero — NULL policy and rounding discipline in one deliverable, the coverage-share shape." },
    { slug: "duplicate-charge-pairs", why: "Self-join duplicate scan over close timestamps — the same-completion-same-second pair finder risk runs nightly, canonicalized with < so split legs read once." },
    { slug: "product-price-at-a-given-date", why: "Latest-value-at-or-before-a-date — the FX-rate lookup drill: quote the transfer at the rate that was true when it moved, never after." },
    { slug: "maximum-transaction-each-day", why: "Argmax per day over completion amounts — the largest transfer in each corridor window, fold and window in one query." },
    { slug: "second-highest-salary", why: "Threshold subqueries on money columns — 'above the corridor-average ticket' is a scalar subquery with an empty-inner edge case new corridors produce weekly." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "LAG-flagged movement sequences — balance walks over consecutive completions, the reconciliation waterfall in transfer clothing." },
    { slug: "bank-account-summary", why: "LEFT JOIN with zero-filled coverage — per-leg completed versus not, where the NULL side is the finding and the fold must not collapse it." },
    { slug: "league-statistics", why: "Stacked home/away folds unioned into one table — the corridor packet shape: same columns, labelled branches, UNION ALL with the total checked against the parts." },
    { slug: "monthly-transactions-ii", why: "Month-bucket packets with a failed-activity split via UNION — the completion calendar's two-population stitch: completed months beside exception months, one stack, no self-join." },
    { slug: "gl-reconciliation", why: "General-ledger reconciliation at source-link grain — the clearing-ledger drill where every entry must tie to the movement that explains it: the close's audit trail in graded form." },
    { slug: "ar-aging-schedule", why: "AR aging buckets per entity — the outstanding six legs ($15,217.00) placed on a due-date ladder: how overdue is each never-completed mandate, bucket by bucket." },
    { slug: "settlement-fails-aging", why: "Settlement-fails aging — the never-completed sweep with an age column: legs that didn't settle, ranked by how long they've been failing, the ops queue's ordering principle." },
    { slug: "amount-anomaly-zscore", why: "Amount anomaly z-scores — the exception queue quantified: which completions sit far from their corridor's mean ticket, the statistical cousin of the void-but-paid hunt." },
    { slug: "structuring-detection", why: "Structuring detection — transfers sliced to duck thresholds is the cross-border risk classic: grouped patterns under a limit, the discipline a fee-banded book demands." },
    { slug: "transaction-velocity", why: "Transaction velocity bursts by window — corridor volume spikes read as load, not just mix: the instant rail's 16 completions against the wire rail's 11, timed." },
    { slug: "suspicious-bank-account-transactions", why: "Suspicious-transaction flags per account — the lifecycle-integrity scan in drill form: void-but-completed and paid-never-completed patterns, one flag query each." },
    { slug: "account-balance", why: "Running account balances from movements — the balance walk the ledger pod ships: per-account nets (cash $44,196, receivables $16,440) rebuilt line by line." },
    { slug: "journal-gap-detection", why: "Journal sequence-gap detection — the ledger's completeness check: every entry present, no missing id, the quiet fixture behind the $0.00 trial-balance delta." },
    { slug: "chargeback-rate-ranking", why: "Rate ranking with honest denominators — corridors ranked by failure share where the denominator is named before the percent: the fee-transparency reflex as a leaderboard." },
    { slug: "keep-latest-dedupe", why: "Keep-latest dedupe — first-completion-per-leg and latest-rate-per-currency in one drill: ROW_NUMBER over a deterministic tiebreak, exactly the pick the clock query ships." },
    { slug: "null-blank-audit", why: "NULL and blank audit — the data-quality sweep that keeps the census honest: which columns are quietly empty, and does 'empty' mean zero or didn't-happen." },
    { slug: "second-most-recent-activity", why: "Second-most-recent activity per entity — the runner-up drill: each leg's second completion (the split legs' later part), Nth-grade window logic over money rows." },
    { slug: "trips-and-users", why: "Cancellation rates with a twice-broken denominator — excluded accounts and unfilled requests: the honest-ratio gauntlet every fee percentage at Wise walks." },
    { slug: "unique-orders-and-customers-per-month", why: "Events and distinct entities per month — the 27-events-vs-22-legs distinction, month by month: two counts, one scan, both grains named." },
  ],
};
