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
    "Preparation: the registry tags 8 Stripe SQL problems and all 8 land in this kit's topics; the remaining slots are theme-curated from the SQL band — settlement clocks, ledger walks, duplicate scans, honest ratios — because that is what the screens probe. Do the topics in order, then run all six case studies on the live storefront db: the per-method settlement mix finance opens {amber:month-close} with (card **$37,364** over 16 events, wire **$32,248** over 11), the {rose:exception census} reconciliation runs every morning — void-but-settled and paid-but-unsettled, counted and priced — plus the settlement calendar, the high-value leg census, the unsettled-exposure standup and the opex movement walk. Thirty-two problems, thirty MCQs, twenty-four theory drills — built for spaced practice rather than one sitting. Say the units and the denominator out loud before you compute anything; at Stripe the units are cents and the denominator is the interview.",
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
      slugs: ["trial-balance-check", "products-worth-over-invoices", "number-of-rich-customers", "fx-exposure-report", "uber-first-transaction"],
    },
    {
      name: "Settlement coverage & the anti-join",
      why: "The unsettled census is the anti-join this business runs daily: charges with no settlement row — 6 of them worth $15,217 on the sample db. LEFT JOIN + IS NULL (or NOT EXISTS) is the shape, and the trap is filtering the right table in WHERE, which silently converts the LEFT JOIN to an INNER and deletes exactly the rows you were hunting.",
      slugs: ["customers-who-never-order", "bank-account-summary", "count-student-number-in-departments", "ar-aging-schedule", "settlement-fails-aging"],
    },
    {
      name: "Month buckets & status-aware counts",
      why: "Settlement calendars are month-bucketed: SUBSTR(paid_on, 1, 7) folds payouts into '2024-03'-style keys with a conditional count of exceptions riding in the same fold. Stripe probes whether the status rule and the total come from one scan — branches that must reconcile to COUNT(*) before the report ships.",
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "the-latest-login-in-2020", "deferred-revenue", "prepayment-detection", "maximum-transaction-each-day", "second-highest-salary", "the-most-recent-three-orders"],
    },
    {
      name: "Ledger reconciliation & balance walks",
      why: "The ledger is double-entry: every debit has a credit, the trial balance must read zero ($181,080 = $181,080 here), and the per-account nets (cash $44,196, receivables $16,440) feed the close. Balance walks and delta queries are how you localize a break — one fold per side, then the difference, then the account that drifted.",
      slugs: ["gl-reconciliation", "last-person-to-fit-in-the-elevator", "total-traveled-distance", "balance-rollforward", "journal-gap-detection"],
    },
    {
      name: "Duplicate & split detection with self-joins",
      why: "Five charges on the db settle as two rows — split settlements — and the same self-join that finds them finds duplicate charges. The craft is canonicalization: p1.id < p2.id keeps one pair per unordered match, while <> double-counts both orientations and bare equality fans out to every peer including itself.",
      slugs: ["duplicate-charge-pairs", "symmetric-pairs", "most-common-course-pairs", "keep-latest-dedupe"],
    },
    {
      name: "Velocity & burst detection",
      why: "Risk runs velocity rules in fixed time buckets: settlements per minute per account, bursts flagged before a human ever looks. Bucket-then-count is the shape, and the follow-up is always the edge case: what does an empty bucket return, and does your rule fire on it or silently pass it?",
      slugs: ["transaction-velocity", "count-the-number-of-experiments", "users-with-two-purchases-within-seven-days", "structuring-detection", "suspicious-bank-account-transactions", "top-percentile-fraud", "amount-anomaly-zscore"],
    },
    {
      name: "Movement waterfalls with LAG",
      why: "Reconciliation reads a balance as a walk: prior row, current row, movement classified. LAG and LEAD are the tools, and the tie-break discipline (ORDER BY paid_on, id) is what keeps the walk deterministic when two settlements share a timestamp — which split files produce routinely.",
      slugs: ["mrr-waterfall", "second-day-confirmation", "consecutive-transactions-with-increasing-amounts", "find-third-transaction"],
    },
    {
      name: "Snapshot deltas & FULL OUTER reads",
      why: "Settlement files get compared against the ledger as two snapshots: keys that appear on one side only, values that changed between cuts. FULL OUTER JOIN — and its UNION-ALL-with-anti-join ancestors — is the diff, and the NULL side you keep IS the finding, not noise to filter away.",
      slugs: ["snapshot-delta-detect", "employees-with-missing-information", "the-airport-with-the-most-flights"],
    },
    {
      name: "Honest ratios & rounded shares",
      why: "Dispute rates, capture rates, coverage shares — every rate here is a conditional sum over a count, and both failure modes are graded: integer division (100 must be 100.0) and denominator drift (the WHERE that filters the numerator's population out of the denominator). Round once, at the end, at the display edge.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "card-launch-success", "chargeback-rate-ranking"],
    },
    {
      name: "Set-op packets & CASE censuses",
      why: "Month-close ships packets: settled versus unsettled, card versus wire — same columns, labelled branches, stacked with UNION ALL. The CASE census is the one-pass sibling, exception classes out of a single scan, and both shapes must reconcile against a plain COUNT(*) before anyone reads them.",
      slugs: ["monthly-transactions-ii", "count-salary-categories", "spend-histogram", "credit-utilization-bands"],
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
    {
      id: "stripe-t9",
      q: "SELECT method, COUNT(*), SUM(amount_cents)/100.0 FROM payments GROUP BY method — why does every non-aggregated column belong in the GROUP BY, and what does SQLite's bare-column tolerance let people get away with?",
      a: "Once the fold runs, the output grain is the group: only the group keys and aggregates exist per row, so any other column has no single value to report — standard SQL demands every selected column be grouped or aggregated. SQLite tolerates bare columns by picking an arbitrary row's value from the group, which is a latent bug that passes every test until the group's rows disagree — then the report flips depending on row order. The honest use is the deliberate argmax idiom (bare column ordered alongside a MAX), and even there you say out loud that you're leaning on engine behavior. At Stripe the rule is simple: every selected column is either a group key or inside an aggregate, and anything else gets challenged in review.",
      tag: "groupby",
    },
    {
      id: "stripe-t10",
      q: "UNION versus UNION ALL in the month-close packet — when is the dedupe a bug, and when is it the feature?",
      a: "The packet's branches are disjoint by construction — settled versus unsettled, card versus wire — so UNION ALL is the honest shape: faster, row-faithful, and immune to coincidental collisions. UNION deduplicates the stacked output, so when two branches emit identical rows — two exception classes tying on count and dollars, two months with the same totals — one silently disappears and the census undercounts exactly where it matters. The feature case is real too: when the same logical row genuinely arrives twice through different branches, the dedupe IS the correction. The strong answer states which contract the packet needs before writing the keyword, and reconciles the stacked count against COUNT(*) either way.",
      tag: "setops",
    },
    {
      id: "stripe-t11",
      q: "An analyst ships the settlement mix and card reads 448 events against a file header of 27. What class of bug is that, and which two checks catch it before it ships?",
      a: "That's join fan-out — a cross product: 27 payments matched to 28 invoices with no ON clause is 756 rows, and card's 16 legs multiplied by 28 reads 448. The count didn't fold wrong; the join exploded and the fold reported the explosion. Check one: reconcile every output count to an independent header — the file says 27 legs, 2 methods, so any method count above 27 is impossible on its face. Check two: sanity-bound group counts against the input table — a method can't hold more events than the file shipped. The fix is the join predicate p.invoice_id = i.id, and the writeup names the failure mode so the next analyst recognizes the shape at a glance.",
      tag: "quality",
    },
    {
      id: "stripe-t12",
      q: "ROW_NUMBER, RANK, DENSE_RANK — pick one for (a) the recent-settlements widget and (b) the largest-settlements board where ties must both show. Defend each pick.",
      a: "For the widget, ROW_NUMBER with a deterministic ORDER BY paid_on, id — you need exactly N rows, one per position, and the id tie-break keeps re-runs stable when two legs share a timestamp. For the board, RANK or DENSE_RANK — tied settlements must share a rank or finance reads a fabricated ordering as fact. The gap matters: RANK leaves holes after a tie (1, 1, 3), DENSE_RANK compacts (1, 1, 2), and the board's convention — 'two tie at 1, next is 2' — is DENSE_RANK. The habit being graded: the window choice encodes a policy about ties, and you state the policy, not just the function.",
      tag: "windows",
    },
    {
      id: "stripe-t13",
      q: "Why does the coverage census pre-fold payments per invoice before joining, instead of joining raw and grouping after?",
      a: "Fan-out. Joined raw, the five split charges produce two rows each — 27 legs against 22 matched charges — so each split charge lands in two class rows and every count inflates by five; the census no longer reconciles to 28 and the reconciliation dies on its own sanity check. Pre-folding — SELECT invoice_id, SUM(amount_cents) FROM payments GROUP BY invoice_id — collapses each charge to exactly one settlement row, so the LEFT JOIN keeps all 28 invoices one row each and the CASE classifies charges, not legs. It also makes the classification honest: the coverage test reads the folded SUM against the invoice amount, which is a per-charge fact you cannot see at leg grain. Same aggregation either way — the join order decides whether the counts mean anything.",
      tag: "joins",
    },
    {
      id: "stripe-t14",
      q: "In the settlement-file-versus-ledger FULL OUTER diff, what is your NULL policy on the unmatched sides?",
      a: "The NULL side IS the finding — a file-only row is money that settled without a ledger entry, a ledger-only row is an entry with no settlement behind it, and both are page-worthy, so nothing gets filtered. The classification is IS NULL arms on each side's key: file_only, ledger_only, matched — a CASE census whose branches reconcile to the union's row count. COALESCE belongs at the display edge only, to render '—' instead of NULL for the missing side's amounts; mid-pipeline it launders an orphan into a zero that reconciles fictionally. And 'clean output' is only believable if you first prove the join keys were right — a diff that returns no orphans because the keys never matched is the most dangerous agreement in recon.",
      tag: "nulls",
    },
    {
      id: "stripe-t15",
      q: "Days-to-settle runs on JULIANDAY differences. Where do rounding and determinism live when five charges settle in two parts?",
      a: "The clock is defined per charge on the FIRST settlement, so the fold is MIN(JULIANDAY(paid_on) - JULIANDAY(issued_on)) grouped by invoice — averaging legs directly weights split charges double and drifts off the 20-charge, 28.4-day file number. The average rounds exactly once, at the outermost SELECT: ROUND(AVG(...), 1) — per-row rounding perturbs every input before the aggregate. Determinism lives in the window variant: ROW_NUMBER() OVER (PARTITION BY invoice_id ORDER BY paid_on, id) = 1 picks first legs, and the id is what keeps 'first' stable when two legs share a timestamp, which split settlement files produce routinely. And the fractional days from JULIANDAY stay fractional through the math — CAST or ROUND only at the display edge, named in the writeup.",
      tag: "dates",
    },
    {
      id: "stripe-t16",
      q: "A join-fold reads 33 rows; the file header says 27 settlements and the charge count is 22. Recite the grains and which fold prints each.",
      a: "Legs: COUNT(*) on payments reads 27 — one row per settlement the file shipped. Charges: COUNT(DISTINCT invoice_id) reads 22 — the business object after five charges settle in two parts. The 33 is a fan-out artifact — 27 legs plus extra rows from a raw join — and it corresponds to no real grain at all, which is what makes it dangerous: it executes, it sums, it ships. The discipline is reciting 'one row per what?' before reading any number: events, charges, method buckets — each is a legitimate grain with a different fold, and only counts that reconcile to a named grain leave the building. A number that can't be re-derived from a grain doesn't ship at Stripe.",
      tag: "aggregation",
    },
    {
      id: "stripe-t17",
      q: "Why can ORDER BY use the alias settled_usd but WHERE can't, and how do you filter on a folded alias mid-pipeline?",
      a: "SQL's logical processing order is FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — aliases are born in SELECT, so they exist from SELECT onward: ORDER BY (last) sees them, WHERE (first) cannot, and referencing one there is the error that teaches the pipeline. Mid-pipeline fold filtering is HAVING with the expression repeated — HAVING SUM(amount_cents)/100.0 > 5000 — or the staged shape: fold into a CTE or derived table named for what it holds, then filter the staged rows outside. The staged shape wins when the expression is long or reused, because the alias lives once and the filter reads like the business rule. What you never do is bury the filter in a client-side step — the number that ships must carry its filter in the query.",
      tag: "pipeline",
    },
    {
      id: "stripe-t18",
      q: "Rewrite 'settlements above their method's average' with a correlated subquery — what runs per outer row, and what's the cost shape?",
      a: "The inner fold carries the correlation: SELECT * FROM payments p1 WHERE amount_cents > (SELECT AVG(amount_cents) FROM payments p2 WHERE p2.method = p1.method) — for every outer row, SQLite re-runs the inner average restricted to that row's method. Cost shape: one aggregate execution per outer row, so on two methods it's trivial and on ten thousand merchants you reach for the window — AVG(amount_cents) OVER (PARTITION BY method) computed once and joined back logically. The scalar contract still applies: the correlated inner fold returns exactly one row per outer row because the correlation keys are unique per method. And the empty-inner edge case persists — a method with zero rows averages to NULL and silently filters itself out, so the census reconciles against the method list either way.",
      tag: "subqueries",
    },
    {
      id: "stripe-t19",
      q: "The 100× error: a report SUMs amount_cents into a dollar column. Where do the guards live?",
      a: "Three layers. The query: the cents-to-dollars conversion happens exactly once, at the display edge, written as /100.0 — and the cents vocabulary stays in the column names so the unit is visible at every read site. The review: every shipped figure states its units out loud — '$37,364.00, read as SUM(amount_cents)/100.0' — because a number whose derivation can't be recited doesn't ship. The test: reconcile one known row end-to-end — 243,057 cents prints $2,430.57 — so a 100× slip breaks the check loudly. The eye never catches a 100× error; the digits look plausible at any scale, which is why the guard is procedural, not visual.",
      tag: "quality",
    },
    {
      id: "stripe-t20",
      q: "Risk wants settlements per account per 15-minute bucket. Write the bucket expression and explain what an empty bucket means for the rule.",
      a: "Bucket on the epoch: (CAST(STRFTIME('%s', paid_on) AS INTEGER) / 900) * 900 gives a fixed 15-minute grid that survives midnight and month edges, formatted back with STRFTIME for the report; minute grain is STRFTIME('%Y-%m-%d %H:%M', paid_on). The fold is GROUP BY account, bucket with COUNT(*) and a HAVING threshold for the burst rule. The edge case is the empty bucket: GROUP BY can only bucket rows that exist, so a quiet window produces NO row — absence, not zero — and a rule that reads the output literally never fires on the quiet-then-burst pattern risk cares about. Zero-filling against a generated calendar grid via LEFT JOIN is the fix, and the analyst states which shape the rule consumes.",
      tag: "windows",
    },
    {
      id: "stripe-t21",
      q: "p1.id < p2.id — prove it returns each unordered pair exactly once and never a self-pair. What breaks with <=?",
      a: "Ids are unique, so they form a total order: for any two distinct ids exactly one orientation satisfies the strict inequality, which is why every unordered pair appears once — the smaller id first. A self-pair needs id < id, which is false by definition, so self-matches are structurally impossible, not filtered. Swap to <= and two things break at once: every row pairs with itself (id <= id is true), and each real pair appears in both orientations — the pair census doubles and fills with noise. The canonicalization is what makes duplicate scans and split-tender censuses auditable: the count of pairs is a fact about the data, not about iteration order.",
      tag: "joins",
    },
    {
      id: "stripe-t22",
      q: "Risk wants the p95 of days-to-settle across the settled charges. NTILE, PERCENT_RANK, or LIMIT/OFFSET — which shape, and what are the small-n edge cases?",
      a: "With 20 settled charges, p95 is essentially the top row, so the tie behavior decides the shape. NTILE(20) OVER (ORDER BY latency DESC) marks each charge's position bucket — the top bucket is the tail, and ties at the boundary land deterministically only if the ORDER BY carries the id tie-break. PERCENT_RANK gives the continuous position 0..1 — filter WHERE percent_rank >= 0.95 — but tied latencies share the same percent rank, so the boundary either catches all ties or none. LIMIT/OFFSET assumes a strict order that ties violate silently. The honest answer names the n: p95 of 20 is one row, its stability depends on the tie-break, and a census that can't say which tied row it picked doesn't ship to risk.",
      tag: "windows",
    },
    {
      id: "stripe-t23",
      q: "INTERSECT versus INNER JOIN on distinct keys — when do they agree and when do they diverge?",
      a: "They agree when both inputs are already distinct on the compared columns and you select exactly those columns — same key sets in, same survivors out. They diverge on duplicates first: INNER JOIN fans every match into the output, INTERSECT deduplicates to a set — 27 legs versus 22 charges is the difference on this db. They diverge on NULLs second: join equality never matches NULL, but INTERSECT treats NULL as a comparable member, so a NULL key survives INTERSECT and vanishes from the join. And they diverge on arity: INTERSECT requires identical column counts and positions. The settlement-file-versus-ledger key diff is INTERSECT/EXCEPT territory precisely because you want the set semantics, not the fan-out.",
      tag: "setops",
    },
    {
      id: "stripe-t24",
      q: "The EOD writeup claims every report is re-runnable. What makes a settlement report idempotent — and what db state silently breaks re-runs?",
      a: "Idempotent means same inputs, same output: a single read-only statement, no wall-clock functions, every threshold and as-of date pinned as literals or parameters — not computed from the environment. The silent breaker is anchoring to the data itself, the classic being MAX(paid_on): an aging report 'as of the latest settlement' drifts every time a new leg lands, so last night's 6 unsettled charges / $15,217.00 and this morning's disagree with no code change and no error. The fix is an explicit as-of anchor stated in the writeup — either a fixed date literal or a documented, labeled convention the reader can reproduce. At Stripe the re-run is the audit: if the second run can move a number, the first number was never a fact.",
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
    {
      id: "stripe-mcq-11",
      prompt: "The settlement calendar buckets legs with `SUBSTR(paid_on, 1, 7)`. For a leg paid on '2024-03-15', what bucket key comes back?",
      choices: ["'2024-03'", "'2024-3'", "'03'", "'2024'"],
      answer: 0,
      why: "SUBSTR is 1-based and slices 7 characters of the fixed-width ISO date — '2024-03', zero padding included. The padded month is the whole reason the SUBSTR shortcut groups and sorts cleanly; an unpadded month read would scramble the calendar order.",
      notes: [
        { choice: 1, why: "SQLite never trims the zero — SUBSTR is a pure character slice, and '2024-3' is not a slice of '2024-03-15' under any offset." },
        { choice: 2, why: "'03' would need SUBSTR(paid_on, 6, 2) — starting mid-string. From position 1 with length 7 the year and dash ride along." },
      ],
      difficulty: "easy",
    },
    {
      id: "stripe-mcq-12",
      prompt: "Month-close stacks two branches — settled and unsettled — with UNION ALL. A teammate swaps in UNION. When does the packet's row count shrink?",
      choices: [
        "Never — UNION is just a slower UNION ALL",
        "Whenever the two branches output rows identical in every column",
        "Only when the SELECT lists have different column names",
        "When a branch returns more than one row",
      ],
      answer: 1,
      why: "UNION deduplicates the stacked result; UNION ALL keeps everything. Two branches that emit identical rows — same class label, same count, same dollars — collapse to one, and the census silently loses a class. The packet needs UNION ALL precisely because coincidentally-identical rows are real.",
      notes: [
        { choice: 0, why: "The dedupe is the semantic difference, not an optimization detail — identical rows vanish and the exception census undercounts exactly when two classes tie." },
        { choice: 3, why: "Row counts per branch are irrelevant; UNION applies to the combined output. Two one-row branches can still collide with each other." },
      ],
      difficulty: "easy",
    },
    {
      id: "stripe-mcq-13",
      prompt: "Finance wants the methods whose settled dollars clear $5,000: `WHERE SUM(amount_cents)/100.0 > 5000` errors on this fold. What's the fix?",
      choices: [
        "Move the condition into HAVING",
        "Wrap the SUM in COUNT",
        "Move the condition into ORDER BY",
        "Add the condition to GROUP BY",
      ],
      answer: 0,
      why: "SUM is an aggregate — it doesn't exist until after the fold, and WHERE runs before GROUP BY. Fold filters live in HAVING: HAVING SUM(amount_cents)/100.0 > 5000. The pipeline order is the diagnosis, not syntax trivia.",
      notes: [
        { choice: 2, why: "ORDER BY runs last and sorts — it never filters, and an aggregate there would be rejected in a plain sort anyway." },
        { choice: 3, why: "GROUP BY declares the fold's grain; it takes column expressions, not aggregate predicates." },
      ],
      difficulty: "easy",
    },
    {
      id: "stripe-mcq-14",
      prompt: "Settlement file on one side, ledger extract on the other. Which join returns the matched rows AND the unmatched rows from BOTH sides?",
      choices: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
      answer: 3,
      why: "FULL OUTER JOIN keeps matched rows plus the orphans on each side — file-only and ledger-only. The NULL side you keep IS the diff: 'appeared on one snapshot only' is the finding, and both orphan classes must survive for the diff to be complete.",
      notes: [
        { choice: 1, why: "LEFT keeps only the left side's orphans; ledger-only rows vanish — half the diff, reported as the whole." },
        { choice: 0, why: "INNER keeps only matches — a diff query that returns 'no discrepancies' by construction, the most dangerous agreement in reconciliation." },
      ],
      difficulty: "easy",
    },
    {
      id: "stripe-mcq-15",
      prompt: "Five charges settle in two parts. Which expression reports the settlement clock — days from issue to FIRST settlement, averaged over charges?",
      choices: [
        "AVG(JULIANDAY(p.paid_on) - JULIANDAY(i.issued_on)) over the raw payments-invoices join",
        "AVG of MIN(JULIANDAY(p.paid_on) - JULIANDAY(i.issued_on)) folded per invoice, then averaged over charges",
        "MAX(JULIANDAY(p.paid_on) - JULIANDAY(i.issued_on)) folded per invoice",
        "COUNT(DISTINCT invoice_id) divided by 100.0",
      ],
      answer: 1,
      why: "The raw join averages 27 legs — two-leg charges get double weight and the number drifts from the file's 20-charge, 28.4-day clock. MIN per charge takes the first leg; the outer AVG folds charges, not legs. Fold twice and name both grains.",
      notes: [
        { choice: 0, why: "27 rows, not 22 charges — split charges count twice and the average reads legs. It executes fine and reconciles to nothing." },
        { choice: 2, why: "MAX takes the LAST settlement per charge — the slow-tail read, a different metric. The clock is defined on first settlement." },
      ],
      difficulty: "medium",
    },
    {
      id: "stripe-mcq-16",
      prompt: "One scan must report, per method: total legs AND legs at or above $2,500. Which shape keeps both counts from a single pass?",
      choices: [
        "Two queries stacked with UNION",
        "COUNT(*) and SUM(CASE WHEN amount_cents >= 250000 THEN 1 ELSE 0 END) in the same GROUP BY",
        "COUNT(*) alongside a WHERE amount_cents >= 250000 clause",
        "LIMIT 2 on the folded count",
      ],
      answer: 1,
      why: "A conditional SUM inside the same fold is the one-pass census — 16/11 total legs and 6/7 big legs from one scan, each column reconciling to the same input rows. WHERE alongside an aggregate isn't a thing, and stacking two queries doubles the reads and the drift risk.",
      notes: [
        { choice: 0, why: "UNION stacks rows, it doesn't widen them — you'd get two differently-shaped result sets, not side-by-side grains." },
        { choice: 2, why: "A WHERE filters rows before the fold — the 'total legs' column would shrink to the threshold population and read identical to the big-leg count." },
      ],
      difficulty: "medium",
    },
    {
      id: "stripe-mcq-17",
      prompt: "The per-account ledger nets read cash $44,196, receivables $16,440 — and sales_revenue NEGATIVE $86,052. What's the correct read of that negative net?",
      choices: [
        "A sign bug — revenue must never be negative",
        "Normal: revenue accounts carry credits exceeding debits, so a debit-minus-credit net reads negative by design",
        "A double-counted settlement inflating credits",
        "Proof the trial balance is off",
      ],
      answer: 1,
      why: "net = debits − credits is an asset-side convention. Liability and revenue accounts legitimately sit credit-heavy, so the same formula reads negative there — the sign encodes the account's role, not an error. The only number allowed to alarm you is the trial-balance delta.",
      notes: [
        { choice: 0, why: "Expecting every account to be positive applies the asset convention everywhere — the reviewer who 'fixes' that sign corrupts the close packet." },
        { choice: 3, why: "The trial balance is the grand totals: $181,080 = $181,080, delta $0.00. Signed per-account nets are the normal state." },
      ],
      difficulty: "medium",
    },
    {
      id: "stripe-mcq-18",
      prompt: "A velocity rule counts settlements per minute via `GROUP BY STRFTIME('%Y-%m-%d %H:%M', paid_on)`. On minutes with ZERO settlements, what does the rule see?",
      choices: ["A row with count 0", "Nothing — the minute doesn't exist in the output", "A row with NULL count", "An error"],
      answer: 1,
      why: "GROUP BY can only bucket rows that exist; an empty minute produces no group, so the output has a gap where the dashboard expected a zero. Absence is not zero — zero-filling needs a calendar grid joined on. The follow-up 'does your rule fire on quiet windows' starts exactly here.",
      notes: [
        { choice: 0, why: "Groups come from rows; zero rows make zero groups. COUNT never invents a bucket — that's why velocity dashboards silently skip dead minutes." },
        { choice: 2, why: "NULL would require a row with a NULL key — a missing minute isn't a NULL minute." },
      ],
      difficulty: "medium",
    },
    {
      id: "stripe-mcq-19",
      prompt: "`LAG(debit_cents - credit_cents) OVER (ORDER BY entry_date, id)` on the ledger's very first row returns…",
      choices: ["0", "NULL", "The row's own value", "An error"],
      answer: 1,
      why: "LAG has no prior row at the partition's edge, so it yields NULL — not zero. A movement classification that COALESCEs that NULL to 0 is making a policy decision that must be stated out loud; left alone, the NULL propagates and the first row's movement reads NULL downstream.",
      notes: [
        { choice: 0, why: "Zero is a value someone chose — LAG returns NULL, and only an explicit COALESCE turns it into 0. The distinction matters when 'no prior row' should page someone." },
        { choice: 2, why: "LAG never echoes the current row — that's just the column itself, and it would make every movement read 0." },
      ],
      difficulty: "easy",
    },
    {
      id: "stripe-mcq-20",
      prompt: "The trial balance delta reads $4,000 instead of $0.00. Which query localizes the break fastest?",
      choices: [
        "GROUP BY account with the per-account net, ordered by ABS(net) DESC — walk the nets against close expectations",
        "SELECT rows WHERE debit_cents = credit_cents",
        "HAVING SUM(debit_cents) = SUM(credit_cents) on the grand total",
        "SELECT DISTINCT memo FROM ledger_entries",
      ],
      answer: 0,
      why: "A balanced ledger means offsetting entries moved together; a break shows up as an account whose net drifted from what the close expects. Rank the nets by absolute size and walk them line by line — the missing $4,000 hides in whichever account can't defend its net from the query.",
      notes: [
        { choice: 1, why: "Self-balancing rows are the healthy rows — this filter finds nothing and proves nothing." },
        { choice: 2, why: "The grand total is already known to be broken; filtering on it selects the symptom you already have, not the cause." },
      ],
      difficulty: "medium",
    },
    {
      id: "stripe-mcq-21",
      prompt: "Coverage census: you join payments RAW to invoices instead of the pre-folded per-invoice SUM. Five charges settle in two rows. What does the census classify?",
      choices: [
        "Still 28 charges — join shape never affects counts",
        "33 classified rows — the five split charges land in two class rows each",
        "22 — the folds deduplicate automatically",
        "27 — one row per payment",
      ],
      answer: 1,
      why: "Raw payments fan the join: 27 payment rows against 22 matched charges produce 32 matched rows plus 6 unmatched charges — 38 invoice rows total, with each split charge classified twice. The 'reconciles to 28' check fails loudly. The pre-folded derived table is what makes the census one-row-per-charge.",
      notes: [
        { choice: 0, why: "Join shape is exactly what moves counts — fan-out is the classic silent inflation this kit's exception hunts hang on." },
        { choice: 2, why: "Nothing deduplicates a join implicitly; DISTINCT would be a manual fold you didn't write." },
      ],
      difficulty: "hard",
    },
    {
      id: "stripe-mcq-22",
      prompt: "`SUM(amount_cents) OVER (ORDER BY paid_on)` as a running total — two settlements share the same paid_on. What does the running column read on those rows?",
      choices: [
        "Distinct running values — window frames are always ROWS",
        "Identical values — the default frame is RANGE, so tied peers ride together",
        "NULL on the second of the tied rows",
        "Only the tie's own amount on each row",
      ],
      answer: 1,
      why: "The default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW, and RANGE includes peers — rows sharing the ORDER BY value. Both tied rows see the same cumulative total including both amounts. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW is the fix when each row needs its own running value.",
      notes: [
        { choice: 0, why: "RANGE is the default precisely because people assume ROWS — identical values on ties are the tell you're on the wrong frame." },
        { choice: 3, why: "Each tied row sees the cumulative sum through the whole peer group, not just itself — that's what 'peers included' means." },
      ],
      difficulty: "hard",
    },
    {
      id: "stripe-mcq-23",
      prompt: "`WHERE amount_cents/100.0 > (SELECT AVG(amount_cents)/100.0 FROM payments GROUP BY method)` — what happens?",
      choices: [
        "Compares against card's average — the first group wins",
        "Errors: the scalar subquery returned more than one row",
        "Returns every settlement — the threshold averages to the grand mean",
        "Silently returns no rows",
      ],
      answer: 1,
      why: "A scalar subquery is contractually 0-or-1 rows; GROUP BY method yields two averages (card, wire) and two rows violate the scalar contract — this one errors loudly, the easier sibling of the empty-subquery bug that fails silently. Per-method comparison needs the correlated shape; the grand mean needs no GROUP BY.",
      notes: [
        { choice: 0, why: "No 'first group' rule exists — multi-row scalars are an error, not an order-dependent pick." },
        { choice: 3, why: "The empty case is the silent one; the two-row case fails loudly. Knowing which failure mode you're in IS the question." },
      ],
      difficulty: "hard",
    },
    {
      id: "stripe-mcq-24",
      prompt: "The settlement mix returns 756 rows and card reads 448 'settlements'. Diagnose before reading the SQL — what did the analyst write?",
      choices: [
        "Dropped the join condition — 27 payments × 28 invoices = 756, card's 16 legs × 28 = 448",
        "Added DISTINCT to the count",
        "Grouped by invoice_id instead of method",
        "Filtered invoices to status = 'paid'",
      ],
      answer: 0,
      why: "756 = 27 × 28 — a cross product. Every payment matched every invoice, so each method's leg count multiplied by 28 (card 16 → 448). The fix is the ON clause: p.invoice_id = i.id. Sanity-bounding counts against the file header (27 legs, 2 methods) catches this before it ships.",
      notes: [
        { choice: 2, why: "Grouping by invoice_id would give up to 28 rows, not 756 — fan-out requires a missing or wrong join condition, not the wrong GROUP BY." },
        { choice: 3, why: "A status filter shrinks rows; it can't manufacture 28× multiplication." },
      ],
      difficulty: "hard",
    },
    {
      id: "stripe-mcq-25",
      prompt: "Payment terms are 30 days flat. Which fold PROVES no invoice breaks terms — rather than assuming it?",
      choices: [
        "MIN(JULIANDAY(due_on) - JULIANDAY(issued_on)) = 30 AND MAX(...) = 30",
        "AVG(JULIANDAY(due_on) - JULIANDAY(issued_on)) = 30",
        "SUM(JULIANDAY(due_on) - JULIANDAY(issued_on)) = 30",
        "COUNT(*) = 30",
      ],
      answer: 0,
      why: "MIN and MAX bracket the population — if both read 30, every invoice is 30 (and on this db, all 28 are). AVG = 30 is compatible with a 29 and a 31 cancelling; a terms outlier is exactly what the check exists to catch. Verified, not assumed — one 27-day row would be the finding.",
      notes: [
        { choice: 1, why: "Averages cancel outliers — the one shape guaranteed to hide the anomaly the check hunts." },
        { choice: 3, why: "COUNT(*) = 30 counts invoices (the db has 28) — nothing about their terms." },
      ],
      difficulty: "easy",
    },
    {
      id: "stripe-mcq-26",
      prompt: "`ROUND(SUM(amount_cents)/100.0, 2)` returns 6254.5 for one month's settlements. What does the client display?",
      choices: ["6254.50", "6254.5", "6254", "62.545"],
      answer: 1,
      why: "ROUND caps precision at 2 decimals; it does not pad to them — 6254.5 prints as 6254.5. Two-decimal presentation is the renderer's job (printf/format at the display edge), one more place the pipeline keeps math and display separate.",
      notes: [
        { choice: 0, why: "Padding is formatting, not rounding — no SQL ROUND appends a trailing zero to a float." },
        { choice: 3, why: "That's the cents-to-dollars conversion run twice — a 100× slip, and exactly why the 100.0 lives in exactly one place." },
      ],
      difficulty: "easy",
    },
    {
      id: "stripe-mcq-27",
      prompt: "27 settlement rows sum to $69,612 and cover 22 charges. Which fold answers 'average settled dollars PER CHARGE' honestly?",
      choices: [
        "AVG(amount_cents)/100.0 over the payments table",
        "SUM(amount_cents)/100.0 / COUNT(DISTINCT invoice_id)",
        "AVG(amount_cents)/100.0 / COUNT(DISTINCT invoice_id)",
        "SUM(amount_cents)/100.0 / 27",
      ],
      answer: 1,
      why: "Per-charge dollars = total settled over distinct charges: 69,612/22 ≈ $3,164.18. AVG over rows is the per-LEG average ($2,578.22) — the leg grain hiding inside an average; dividing that by 22 double-folds. Name the denominator out loud: 27 legs, 22 charges — two grains, two different honest numbers.",
      notes: [
        { choice: 0, why: "That's the average leg, $2,578.22 — AVG folds rows, and split charges contribute two rows each. A per-charge number needs a charge-count denominator." },
        { choice: 3, why: "27 is the leg count — that's the per-leg read with extra steps; the denominator drifts from charges." },
      ],
      difficulty: "medium",
    },
    {
      id: "stripe-mcq-28",
      prompt: "paid_on carries ISO timestamps ('2024-02-29T23:59:59'). Which month-window shape keeps the month-end leg?",
      choices: [
        "BETWEEN '2024-02-01' AND '2024-02-29'",
        "BETWEEN '2024-02-01' AND '2024-03-01'",
        "paid_on >= '2024-02-01' AND paid_on < '2024-03-01'",
        "STRFTIME('%Y', paid_on) = '2024'",
      ],
      answer: 2,
      why: "The half-open interval [first, next-first) includes every timestamp in the month regardless of time-of-day. BETWEEN's inclusive upper bound stops at the string '2024-02-29', and '2024-02-29T23:59:59' sorts after it — the month-end leg drops exactly when month-close volume lands.",
      notes: [
        { choice: 1, why: "Now you've over-captured: '2024-03-01T00:00:00' and everything after it in March sneaks in — the inclusive upper bound sweeps the next month's first day." },
        { choice: 3, why: "That keeps the whole year — a 12× over-capture, and the month bucket the report was supposed to draw disappears." },
      ],
      difficulty: "hard",
    },
    {
      id: "stripe-mcq-29",
      prompt: "Every charge finally settled. The unsettled census — `WHERE p.id IS NULL` with a GROUP BY — returns zero ROWS. Which shape still prints a clean '0 charges / $0.00' line?",
      choices: [
        "Add COALESCE around the columns — the row reappears",
        "Drop the GROUP BY and fold the filtered set directly: an aggregate over zero rows returns one row of NULLs to coalesce",
        "Use INNER JOIN instead",
        "Add ORDER BY to force a row",
      ],
      answer: 1,
      why: "An aggregate query with NO GROUP BY always returns exactly one row — even over zero rows — with COUNT at 0 and SUM at NULL, so SELECT COUNT(*), COALESCE(SUM(amount_cents),0) prints 0 / 0.00. COALESCE on the grouped census can't help: with zero groups there are no rows to coalesce.",
      notes: [
        { choice: 0, why: "COALESCE runs per row — with GROUP BY and zero groups there are no rows to run it on. The GROUP BY is what deleted the row." },
        { choice: 2, why: "INNER JOIN changes the population being audited — the census is defined on the unmatched set, not the matched one." },
      ],
      difficulty: "medium",
    },
    {
      id: "stripe-mcq-30",
      prompt: "Per-method share of settled dollars WITHOUT a subquery — which expression computes the denominator inside the same GROUP BY fold?",
      choices: [
        "SUM(amount_cents) OVER ()",
        "SUM(SUM(amount_cents)) OVER ()",
        "COUNT(*) OVER ()",
        "TOTAL(amount_cents)",
      ],
      answer: 1,
      why: "Window functions evaluate after GROUP BY, so the window's input is the per-group sums — SUM(SUM(amount_cents)) OVER () totals the group sums into the grand $69,612, and 100.0 * SUM(...) / that is the honest share. A bare column inside OVER () in a grouped query is the bare-column trap, not the group total.",
      notes: [
        { choice: 0, why: "In a grouped query, amount_cents inside the window isn't the group's sum — it's a bare column reading an arbitrary row; the share is fiction. Nest the SUM." },
        { choice: 2, why: "COUNT(*) OVER () counts groups (2 methods), not dollars — dividing dollars by 2 is not a share." },
      ],
      difficulty: "hard",
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
    {
      id: "cs-stripe-3",
      tier: "medium",
      topic: "t4",
      universe: "month-close",
      title: "The settlement calendar",
      brief:
        "Month-close memo from settlements ops: the payout calendar page goes into tonight's packet — settled volume bucketed by the month each leg landed. Probed figures: 13 buckets spanning 2024-02 (1 leg, $2,430.00) through 2025-02 (2 legs, $7,076.00); the biggest bucket is 2024-09 at $8,420.50; and 2025-01 is the split month — 3 legs covering only 2 charges ($5,877.00), a split settlement straddling the bucket edge. The calendar prints three grains per bucket — legs, charges, dollars — and amounts are INTEGER cents, so the dollar read is amount_cents / 100.0.",
      ask: "Return each settlement month (YYYY-MM) with its leg count, distinct charges covered, and settled dollars (2 decimals), in calendar order.",
      template:
        "SELECT STRFTIME({1}, p.paid_on) AS settle_month,\n       COUNT(*) AS legs,\n       COUNT({2} p.invoice_id) AS charges,\n       ROUND(SUM(p.amount_cents) / 100.0, 2) AS settled_usd\nFROM payments p\nGROUP BY settle_month\nORDER BY settle_month {3};",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the ISO bucket format",
          why: "STRFTIME('%Y-%m', paid_on) is the zero-padded YYYY-MM key the calendar sorts on. '%m-%Y' inverts the field order — the bucket still folds to 13 rows but sorts as '02-2024 < 01-2025' garbage — and '%Y' collapses 13 months into 2 years, destroying the calendar the packet promises.",
        },
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the charge-grain counter",
          why: "COUNT(DISTINCT p.invoice_id) folds legs back to charges: 2025-01 reads 3 legs but 2 charges — the split the memo flags. Plain COUNT prints the leg grain under a charges name, and the reader prices a month at 3 customers when 2 were billed.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the calendar direction",
          why: "Calendar order is oldest first — the packet walks the year forward and lands on the current bucket. DESC is a valid query answering the opposite question: it opens the close packet with 2025-02 and buries the 13-month trend.",
        },
      ],
      distractors: ["'%m-%Y'", "'%Y'", "invoice_id", "DESC"],
      walkthrough:
        "Three grains, one fold, one bucket expression. STRFTIME('%Y-%m', paid_on) turns 27 settlement legs into 13 zero-padded month keys — 2024-02 through 2025-02 — and GROUP BY folds each bucket once. Inside every bucket: COUNT(*) is the event grain (1 in 2024-02, 3 in the split month), COUNT(DISTINCT invoice_id) is the charge grain (2 in 2025-01 — the memo's flag), and SUM(amount_cents)/100.0 is the money grain ($8,420.50 tops 2024-09). The 100.0 is not decoration: INTEGER cents divided by INTEGER 100 truncates odd cents before ROUND could save them. ORDER BY settle_month ASC walks the calendar forward. The distractors fail exactly where the craft lives: '%m-%Y' keeps 13 rows but scrambles every sort after it, '%Y' merges the calendar into 2 annual buckets, invoice_id inside COUNT({2} ...) is a syntax error, and DESC opens the packet at the end of the story. Legs, charges, dollars — one scan, the page finance actually reads at close.",
    },
    {
      id: "cs-stripe-4",
      tier: "medium",
      topic: "x2",
      universe: "fraud",
      title: "The high-value leg census",
      brief:
        "Fraud spot-check memo from the risk desk: velocity rules flag rails, not just accounts — this morning's ask is a one-pass census of settlement legs at or above $2,500 (250,000 cents) per method. Probed figures: card carries 16 legs of which 6 are big legs totaling $17,770.00; wire carries 11 legs of which 7 are big — $23,245.00. Wire is big-leg-heavy (7 of 11) and that ratio, not the raw count, is what the memo leads with. The census must come from ONE scan — separate threshold queries drift apart by afternoon, and the two counts must reconcile to the same 27 legs.",
      ask: "Return each settlement method with total legs, legs at or above $2,500, and those legs' settled dollars (2 decimals), biggest big-leg dollars first.",
      template:
        "SELECT p.method,\n       COUNT(*) AS legs,\n       COUNT(*) FILTER ({1}) AS big_legs,\n       ROUND(SUM(p.amount_cents) FILTER (WHERE p.amount_cents >= 250000) / 100.0, 2) AS big_usd\nFROM payments p\nGROUP BY p.{2}\nORDER BY big_usd {3};",
      slots: [
        {
          answer: "WHERE p.amount_cents >= 250000",
          kind: "keyword",
          label: "the threshold filter",
          why: "FILTER (WHERE ...) is the one-pass census clause: the big_legs column counts only legs clearing 250,000 cents while COUNT(*) keeps the full fold — 6 of 16 card, 7 of 11 wire. Dropping WHERE inside FILTER is a syntax error; the threshold lives in the filter or nowhere.",
        },
        {
          answer: "method",
          kind: "keyword",
          label: "the rail grain",
          why: "GROUP BY p.method folds 27 legs into the two rails the memo reads. Grouping by invoice_id instead produces 22 rows — a per-charge census wearing the memo's name — and the card/wire comparison the risk desk asked for dissolves.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the risk-first direction",
          why: "The memo opens with the heavier rail: wire $23,245.00 above card $17,770.00. ASC is a correct query answering the opposite question — it leads with card and the rail skew the memo flags reads backwards.",
        },
      ],
      distractors: ["WHERE p.method = 'card'", "WHERE amount_cents >= 25000", "WHERE p.amount_cents IS NULL", "invoice_id", "ASC"],
      walkthrough:
        "One scan, two populations, one clause doing the split. FILTER (WHERE p.amount_cents >= 250000) counts only the high-value legs inside each fold while COUNT(*) keeps every leg — card 16 total / 6 big, wire 11 / 7 — and the second FILTER prices the same big population at $17,770.00 and $23,245.00. Both census columns reconcile to the same 27 input legs because nothing was filtered out of the query — only into columns. The threshold is a cents literal: 250,000 cents = $2,500.00, and the 100.0 stays in exactly one place per money column. The distractors are the real bug patterns: filtering the big-leg column to card-only rigs the census toward one rail, $250 (25,000 cents) makes every leg big and the 'census' reads 16/16, IS NULL counts nothing because amounts are NOT NULL, invoice_id re-grains the fold to 22 rows and dissolves the rail comparison, and ASC hands the memo the lighter rail first. Legs, big legs, big dollars — one scan, the ratio is the finding: wire carries 7 of 11 legs over the line.",
    },
    {
      id: "cs-stripe-5",
      tier: "easy",
      topic: "j5",
      universe: "month-close",
      title: "The unsettled exposure standup",
      brief:
        "9am standup memo: unsettled exposure is charges with no settlement row — the anti-join this team runs every morning. Probed figures: 6 charges are unsettled for $15,217.00 total, and the status fold is the story: 5 OPEN charges worth $13,461.00 (real pipeline, payments expected) plus 1 PAID charge worth $1,756.00 (charge #28 — the paid lie, money promised that never moved). The two classes get different owners, so the exposure must be priced per status, biggest bucket first. Amounts are INTEGER cents — /100.0 for dollars.",
      ask: "Return each status of unsettled charges with its charge count and exposed dollars (2 decimals), biggest exposure first.",
      template:
        "SELECT i.status,\n       COUNT(*) AS charges,\n       ROUND(SUM(i.amount_cents) / {3}, 2) AS exposed_usd\nFROM invoices i\nLEFT JOIN payments p ON {1}\nWHERE p.id {2}\nGROUP BY i.status\nORDER BY exposed_usd DESC;",
      slots: [
        {
          answer: "p.invoice_id = i.id",
          kind: "keyword",
          label: "the attachment predicate",
          why: "Each settlement attaches to its charge via p.invoice_id = i.id. p.invoice_id = p.id compares a payment to itself — no row matches, all 28 charges look unsettled and exposure reads $86,612.00 of fiction. i.id = i.id matches every payment to every invoice, the IS NULL arm finds nothing, and the standup opens to an empty room.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the orphan detector",
          why: "Unmatched charges survive the LEFT JOIN with NULL payment columns, and IS NULL is the only test that detects them — equality with NULL fails even against itself. IS NOT NULL flips the query into the settled census, and = NULL or = 0 silently return zero rows.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-dollars divider",
          why: "Charges are INTEGER cents, so the dollar read is SUM(i.amount_cents) / 100.0 exactly once at the display edge. The bare integer 100 happens to read identically on this book only because every status total is a whole-euro multiple — one odd-cent charge and the truncation starts eating cents; 1000 rescales the whole memo to thousandths.",
        },
      ],
      distractors: ["p.invoice_id = p.id", "i.id = i.id", "IS NOT NULL", "= NULL", "1000"],
      walkthrough:
        "The anti-join, priced by status — the query this team runs before coffee. LEFT JOIN keeps all 28 charges; the 22 that carry settlements match on p.invoice_id = i.id, and the 6 that don't survive with NULL payment columns. WHERE p.id IS NULL keeps exactly those orphans — 6 charges, $15,217.00 — and GROUP BY status splits them into the two classes the standup assigns: open 5 / $13,461.00 (pipeline ops owns it) and paid 1 / $1,756.00 (charge #28, and that one pages finance). The distractors are the classic anti-join killers: p.invoice_id = p.id matches nothing and declares all $86,612.00 unsettled, i.id = i.id is a cross product whose IS NULL arm finds nothing, IS NOT NULL reports the settled world under the unsettled memo's name, = NULL never fires because NULL fails every equality, and a 1000 in the divider rescales the whole memo to thousandths of a dollar. Six charges, two owners, one query — that's the 9am standup.",
    },
    {
      id: "cs-stripe-6",
      tier: "medium",
      topic: "t7",
      universe: "expense",
      title: "The opex movement walk",
      brief:
        "Expense review memo: the operating_expenses ledger account walks month by month — 14 debits from 2024-01 ($1,719.00) to 2025-02 ($1,650.00). The reader wants the movement column, not just the levels: each month's spend priced against the prior month (first row reads NULL — no prior). Probed figures: the spike is 2024-08 at $3,210.00, a +$1,665.00 jump over July's $1,794.00; the deepest cut is 2024-08's own predecessor move −$1,416.00 into July. The ledger stores INTEGER cents, so every dollar read is /100.0 — and the walk must be deterministic: entry_date, then id, always.",
      ask: "Return each opex entry's date, its debit in dollars (2 decimals), and its month-over-month movement in dollars (2 decimals), walking the ledger in entry order.",
      template:
        "SELECT l.entry_date,\n       ROUND(l.debit_cents / 100.0, 2) AS opex_usd,\n       ROUND((l.debit_cents - {1}(l.debit_cents) OVER (ORDER BY l.entry_date, l.id)) / 100.0, 2) AS movement_usd,\n       ROUND({2}(l.debit_cents) OVER () / 100.0, 2) AS spike_usd\nFROM ledger_entries l\nWHERE l.account = {3}\nORDER BY l.entry_date, l.id;",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-row reference",
          why: "LAG(l.debit_cents) OVER (...) reads the previous month's debit in entry order — movement is current minus prior. LEAD points the other way and negates every movement; SUM(...) OVER (...) returns the running total and the 'movement' column reads like nonsense that still sums.",
        },
        {
          answer: "MAX",
          kind: "keyword",
          label: "the spike locator",
          why: "MAX(l.debit_cents) OVER () prices the walk's spike: $3,210.00 in 2024-08, printed beside every row so the eye lands on the month the movement column confirms. MIN returns the quietest month ($1,440.00) under the spike's name, SUM returns the whole book, and COUNT returns a row count scaled into dollars.",
        },
        {
          answer: "'operating_expenses'",
          kind: "keyword",
          label: "the account filter",
          why: "The walk is the opex account only: WHERE l.account = 'operating_expenses' keeps the 14 monthly debits. Unquoted operating_expenses is treated as a column name and the query errors; 'cash' walks the treasury account under the expense memo's name.",
        },
      ],
      distractors: ["LEAD", "SUM", "MIN", "'cash'", "operating_expenses"],
      walkthrough:
        "A balance walk over one account, priced month over month. The filter keeps the 14 operating_expenses rows — one debit per month, 2024-01 through 2025-02 — and LAG(l.debit_cents) OVER (ORDER BY l.entry_date, l.id) plants the prior month's debit beside each row; current minus prior is the movement, divided by 100.0 with everything else. The first row's movement is NULL because there is no prior — the memo says so, and NULL is the honest print, not a coalesced zero pretending January had a predecessor. The id in the ORDER BY is the determinism guarantee: two entries sharing a month-end date would otherwise walk in file-order luck. The distractors are the walk's real hazards: LEAD flips every movement's sign, SUM turns the movement column into a running total, MIN prices the spike at the quietest month's $1,440.00, the unquoted account name errors as a missing column, and 'cash' walks the treasury under this memo's name. Fourteen debits, thirteen movements, one spike — that's the expense review.",
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
    { slug: "chargeback-rate-ranking", why: "Rank rails by dispute share with the 100.0-before-division fix — the dispute-rate league table the risk review opens with, ties included." },
    { slug: "ar-aging-schedule", why: "Buckets of outstanding receivables by age band — the unsettled-exposure aging finance defends at close, charged with the /100.0 read." },
    { slug: "settlement-fails-aging", why: "How long has money been promised without landing — the fail-aging view of charge #28 and friends, bucketed and priced." },
    { slug: "balance-rollforward", why: "Opening balance plus movements equals closing — the cash walk the ledger's per-account nets feed, in drill form." },
    { slug: "journal-gap-detection", why: "Finding the missing entry in a sequence — the ledger's debits-equal-credits guarantee, audited one gap at a time." },
    { slug: "structuring-detection", why: "Amounts layered just under a threshold — the velocity rule variant risk runs against settlement legs before a human looks." },
    { slug: "suspicious-bank-account-transactions", why: "Per-account anomaly census with conditional counts — the exception queue's nightly sweep, taught as a fold." },
    { slug: "top-percentile-fraud", why: "Percentile gates over money movement — which legs sit in the tail, and the small-n tie discipline the answer names out loud." },
    { slug: "amount-anomaly-zscore", why: "Z-scores over settlement amounts — the statistical leg of the anomaly hunt, seeded by the same legs the velocity rules flag." },
    { slug: "credit-utilization-bands", why: "CASE bands over a money column with per-band counts — coverage-census shape applied to exposure tiers." },
    { slug: "deferred-revenue", why: "Money received against obligations not yet earned — the status-aware recognition fold this kit's paid-vs-settled lens sharpens." },
    { slug: "prepayment-detection", why: "Settlements landing before their terms window closes — the early-leg scan that reads paid_on against issued_on and due_on." },
    { slug: "fx-exposure-report", why: "Folds over money split by a dimension the report can't control — the currency-mix read every settlement total here assumes away." },
    { slug: "find-third-transaction", why: "The Nth row per entity via ROW_NUMBER — the same deterministic pick the first-settlement clock is built on, one slot deeper." },
    { slug: "uber-first-transaction", why: "First event per entity with a MIN fold — the opening leg of every settlement clock and lifecycle story this kit tells." },
    { slug: "keep-latest-dedupe", why: "One row per key, latest wins — the dedupe discipline split-settlement files demand before any fold trusts the grain." },
  ],
};
