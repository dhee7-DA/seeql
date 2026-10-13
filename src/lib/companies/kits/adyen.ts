// Adyen — kit 6 of the Fintech & Payments domain (Batch F, wave-5 slot).
// The enterprise gateway: one single stack from authorization to settlement to
// payout, so the interview lens is the same money movement seen from the rail
// side — authorization attempts, the settlement batches they land in, per-route
// fees, and a clearing ledger that must read zero. Pool provenance: the registry
// tags 4 Adyen SQL problems — ALL 4 land in this kit (topics + problems);
// the remaining slots are theme-curated fills from the SQL band (route folds,
// attempt coverage, batch censuses), stated here per spec. Case studies run on
// the storefront db with probed figures from scripts/company-facts.md (probed
// 2026-10-12). The mapping is honest: invoices = settlement batches, payments =
// authorization attempts, expenses/ledger_entries = internal money movement.
// Money columns are INTEGER cents; the facts file prints dollars — the read is
// amount_cents / 100.0.
//
// EXPANDED (Batch 92-E, append-only 3x expansion): brief 4->6, dayInLife 4->5,
// metrics 8->12, topics 10->15, theory 8->24 (adyen-t9..t24), mcqs 10->30
// (adyen-mcq-11..30, 3 easy / 4 medium / 3 hard per fresh 10), cases 2->6
// (cs-adyen-3..6, new topic families t7 + s6 + q5 + t5 — pairwise distinct and
// distinct from the original x2/j5), problems 16->32. The registry tags 4 Adyen
// SQL problems and all 4 were already consumed; every expansion slug (topics +
// problems) is theme-curated from the SQL band per spec, scripted-verified
// legal/unique/collision-free. New cases probed on db/custom.db before
// authoring — number slots verified as result cells, distractors
// consequence-checked; all figures still come from scripts/company-facts.md.

import type { CompanyKit } from "../types";

export const adyenKit: CompanyKit = {
  id: "adyen",
  domainId: "fintech",
  name: "Adyen",
  tagline: "Single-stack payments for global enterprises",
  accent: "text-green-300",

  brief: [
    "Adyen is the single-stack payments platform enterprise merchants route their volume through — one platform owns authorization, {emerald:settlement} and payout instead of stitching a gateway, an acquirer and a processor together. That architecture is why its data is one continuous money movement: authorization attempts land in settlement batches, batches clear against the ledger, and the ledger has to prove debits equal credits. On this app's storefront db the mapping is one-to-one: `invoices` are settlement batches (28 of them), `payments` are authorization attempts (27 rows covering 22 batches — five batches draw two attempts), and `ledger_entries` is the clearing ledger (80 rows, debits $181,080 equal to credits $181,080). Money columns are INTEGER cents; every dollar read is `amount_cents / 100.0`.",
    "The data org splits into product analytics, risk, and the team this kit is really about: settlement operations. The daily bread is the {rose:exception queue} — the db's verified anomalies are exactly what a gateway ops analyst meets before coffee: a {rose:void}-but-attempted batch (#11, $925.00), a paid batch with no attempt behind it (#28, $1,756.00), five split-attempt batches (**#1, #5, #12, #19, #22**), and one {amber:partial} attempt ($4,000.00 of a $6,148.00 batch). Coverage is the standing read: **21 exact, 1 partial, 6 with no attempt** — and unattempted exposure prices at $15,217.00. An analyst here doesn't 'run reports'; they prove every attempt reconciles to a batch, and when it doesn't, the diff query names the batch in minutes.",
    "Interview style is correctness over cleverness, with a distinctly gateway flavor: the screens love the {violet:single-pass census} — one scan, every class counted via `FILTER (WHERE …)`, counts forced to reconcile — and the per-route fold (card rail vs wire rail attempts) where the denominator is the whole test. A typical hour opens with a fold over money, escalates into attempt coverage (which batches never drew an attempt — and what filtering the wrong table in WHERE does to your `LEFT JOIN`), then closes on a latency or ledger question where rounding discipline (**100.0** before the division, ROUND once at the end) is graded, not assumed.",
    "Preparation: the registry tags 4 Adyen SQL problems and all 4 land in this kit's topics; the remaining slots are theme-curated from the SQL band — attempt-velocity buckets, ledger walks, duplicate-attempt scans, honest ratios — because that is what the screens probe. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {violet:one-pass batch census} settlement ops ships in every close packet (21 settled / $66,443.00, 6 open / $19,609.00, 1 void / $925.00 — reconciling to 28), the other rebuilds the 9am {rose:exposure sweep} — batches with no attempt behind them, 6 worth $15,217.00, split by status. Say the units and the denominator out loud before you compute anything; at a gateway, cents and coverage ARE the interview.",
    "The kit's second half goes deeper, not wider, on the same money movement. The {violet:issuance walk} stages a monthly fold over batch issuance — 13 months from 2024-02 through 2025-02, peaking at **$11,085.00 in 2025-01** — and rides a `LAG` delta down the spine, first row honestly NULL. The coverage census grows a fourth class: the {rose:paid-no-attempt} contradiction (#28, booked paid with zero attempts behind it) gets its own CASE arm instead of hiding inside the generic class. The split register folds attempts per batch and gates at exactly 2 — batches #1, #5, #12, #19, #22, all five reconciling to the penny. And the settlement-clock leaderboard ranks the 20 paid-with-attempt batches fastest-first — fastest 13 days, slowest 84 — straight into a 25-day tie band where 7 batches share one rank and RANK, ROW_NUMBER and DENSE_RANK finally disagree.",
    "Senior-round prep is rehearsal on the live db plus denominators said out loud. Rebuild all four new cases end to end: does your walk read **−$2,973.00** for 2025-02, or did you flip the subtraction? Do the census's four classes still reconcile to 28 batches and $86,977.00? Did the register gate at exactly 2 — the same query as 'at least 2' on this data, and the wrong habit? Can you say which rank function you picked, and why the 25-day band agrees? The reflexes they grade are the gateway's: cents stay INTEGER until one `/100.0` at the display edge, every census reconciles to `COUNT(*)`, every rate names its denominator (unattempted is 6 of 28 batches, not 6 of 22 attempted ones), and every anomaly carries a route — {rose:paid-no-attempt} goes to engineering, the {amber:open} unattempted go to collections.",
  ],

  dayInLife: [
    "**08:00 —** The day starts with the attempt-coverage sweep, not a dashboard: did last night's authorization attempts land in batches, does the per-route mix agree with the rail file (on the sample db: card **16 attempts / $37,364.00**, wire 11 / $32,248.00), and does the coverage census still read **21 exact / 1 partial / 6 none**? Then the exception queue — {rose:void-but-attempted} (#11, $925.00) and {sky:paid-but-unattempted} (#28, $1,756.00) are one row each and enormous in consequence: an attempt moved against a batch the lifecycle killed, or a batch the book calls paid that no attempt ever touched. A mismatch is a page, not a shrug.",
    "**11:00 —** Midday is deep-dive work with definitions attached. A merchant-facing team wants days-to-settle drift (**28.4-day average, 13-to-84 spread**, first attempt only — split batches must not double-count the clock); finance wants unattempted exposure priced (**$15,217.00 across 6 batches** — of all batches, not attempted ones, and the analyst says so); risk wants the {violet:split-attempt scan} rerun to confirm every two-attempt batch (#1, #5, #12, #19, #22) rebuilds its total. Each ask is a join, a conditional aggregate, and one judgment call about status filters — written twice: once to answer, once with the definition made explicit so the number survives review.",
    "**15:00 —** The afternoon belongs to the clearing ledger and the people who read it. The trial balance must read zero — **debits $181,080, credits $181,080, delta $0.00** — and the per-account nets (**cash $44,196**, **receivables $16,440**) feed the close checklist. This is the stakeholder hour: finance walks the nets line by line and each one gets defended from the query, not the slide. Per-route fee lines get the same treatment — the cost side of the house (platform, acquisition, tooling spend) is folded per category and reconciled against a plain `COUNT(*)` before it leaves the building.",
    "**17:30 —** EOD is the writeup. The census ships as one query with every branch reconciled to 28 batches; every total carries its SQL attached; every re-run is {emerald:idempotent}; every open question carries the query that would answer it tomorrow. The rhythm to internalize: at a gateway, correctness isn't a nice-to-have the interview rewards — it's the product constraint (money routed wrong is money lost), and the SQL is just where the discipline becomes visible.",
    "**21:15 —** The night-shift wire file drops — 11 attempts, **$32,248.00**, the numbers tomorrow's 8am sweep will check the rail against. Before sign-off: re-run the coverage census (still 21 exact / 5 open-unattempted / 1 partial / 1 paid-no-attempt, reconciling to 28), push batch #28 to the engineering queue with the query attached, leave the open-unattempted five — *$13,461.00 of promised money* — on the collections board, and hand the close runner a ledger that still ties, **debits $181,080, credits $181,080, delta $0.00**. The shift log's last line is the one this kit keeps teaching: *numbers that reconcile are the deliverable*; the SQL is just how they got that way.",
  ],

  metrics: [
    { name: "Authorization rate", what: "Approved attempts ÷ attempted attempts, per rail and merchant segment. The funnel's top gate at a gateway — the first place a decline-spike incident shows up before any batch is touched." },
    { name: "Attempt-to-settlement coverage", what: "Batches classified exact / partial / no attempt — 21 / 1 / 6 on the db. The coverage census is settlement ops' opening read, and the classification is a CASE over a pre-folded LEFT JOIN." },
    { name: "Unattempted exposure", what: "Dollar value of batches with no attempt row: $15,217.00 across 6 batches here. The number finance defends at close — computed over ALL batches, not the attempted ones." },
    { name: "Days to settle", what: "Batch issue → first attempt, in days. 20 paid batches averaging 28.4 days, fastest 13, slowest 84 on the db — first attempt, never last, on split batches." },
    { name: "Split-attempt rate", what: "Batches drawing two attempts ÷ covered batches — 5 of 22 here (#1, #5, #12, #19, #22). Both a cost signal (double processing) and the standing fan-out trap in every fold." },
    { name: "Per-route cost ratio", what: "Processing cost lines ÷ attempted volume, per rail. The gateway's pricing story (interchange++-style) lives here; the db's expense fold (Rent $16,800, Ads $4,570, Travel $2,521, Tools $1,525) is the internal-money-movement stand-in." },
    { name: "Void-leak count", what: "Attempts attached to voided batches — exactly 1 here (#11, $925.00). Small, verified, and the class of finding that ends a release: money moved where the lifecycle says it shouldn't." },
    { name: "Ledger balance delta", what: "Total debits − total credits. Must read $0.00 ($181,080 = $181,080 here) — the one metric allowed, and required, to be boring." },
    { name: "Issuance walk (MoM delta)", what: "LAG over the 13-month issuance spine (2024-02 through 2025-02) of batch count and dollars — 2025-01 peaks at $11,085.00, 2025-02 gives back $2,973.00. The board's opening read; the first row's delta is honestly NULL, not zero." },
    { name: "Lifecycle contradiction count", what: "Batches whose status and attempt history disagree: #11 void-but-attempted ($925.00) and #28 paid-but-unattempted ($1,756.00). Two rows, two routes — the void-but-attempted goes to risk, the paid-but-unattempted to engineering." },
    { name: "Settlement clock extremes", what: "Fastest and slowest first-attempt days on the 20 settled-with-attempt batches: 13 days to 84, averaging 28.4. The 25-day tie band — 7 batches sharing one rank — is where RANK, ROW_NUMBER and DENSE_RANK stop agreeing." },
    { name: "Rail mix", what: "Attempt count and dollars per route: card 16 attempts / $37,364.00, wire 11 / $32,248.00 — 59/41 by events, 54/46 by dollars. Two grains in one fold, and the split-attempt rate is the gap between them." },
  ],

  topics: [
    {
      name: "Folds over money movement",
      why: "Every headline at a gateway is a fold over a money column: attempted dollars per rail, batches per status, debits minus credits per account. The cents rule sharpens it — amounts are INTEGER cents, so SUM(amount_cents) / 100.0 is the dollar read and integer division is the standing truncation trap. Adyen drills whether you can fold money without leaking it.",
      slugs: ["number-of-rich-customers", "top-earners", "products-worth-over-invoices"],
    },
    {
      name: "Route mix & per-route fees",
      why: "The gateway prices and reports per route: card rail 16 attempts / $37,364.00, wire rail 11 / $32,248.00 on this db — and every fee number is a fold grouped by route with a rate riding on top. The craft is keeping counts and dollars from different grains out of the same column.",
      slugs: ["chargeback-rate-ranking", "bank-account-summary-ii", "average-selling-price"],
    },
    {
      name: "Attempt coverage & the anti-join",
      why: "The unattempted census is the anti-join this business runs at 9am: batches with no attempt row — 6 of them worth $15,217.00 on the sample db. LEFT JOIN + IS NULL (or NOT EXISTS) is the shape, and the trap is filtering the right table in WHERE, which silently converts the LEFT JOIN to an INNER and deletes exactly the rows the sweep exists to find.",
      slugs: ["customers-who-never-order", "bank-account-summary", "count-student-number-in-departments"],
    },
    {
      name: "Attempt velocity & burst rules",
      why: "Risk runs velocity rules in fixed time buckets: attempts per minute per merchant, bursts flagged before a human looks. Bucket-then-count is the shape, and the follow-up is always the edge case: what does an empty bucket return, and does your rule fire on it or silently pass it?",
      slugs: ["transaction-velocity", "count-the-number-of-experiments", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Ledger reconciliation & balance walks",
      why: "The clearing ledger is double-entry: every debit has a credit, the trial balance must read zero ($181,080 = $181,080 here), and the per-account nets (cash $44,196, receivables $16,440) feed the close. Balance walks and delta queries are how you localize a break — one fold per side, then the difference, then the account that drifted.",
      slugs: ["gl-reconciliation", "trial-balance-check", "total-traveled-distance"],
    },
    {
      name: "Snapshot deltas & FULL OUTER reads",
      why: "Rail files get compared against the batch book as two snapshots: batches on one side only, attempts that moved after the cut, totals that drifted. FULL OUTER JOIN — and its UNION-ALL-with-anti-join ancestors — is the diff, and the NULL side you keep IS the finding, not noise to filter away.",
      slugs: ["snapshot-delta-detect", "employees-with-missing-information", "the-airport-with-the-most-flights"],
    },
    {
      name: "Duplicate & split attempt scans",
      why: "Five batches on the db draw two attempts each — split attempts — and the same self-join that finds them finds duplicate attempts. The craft is canonicalization: p1.id < p2.id keeps one pair per unordered match, while <> double-counts both orientations and bare equality fans out to every peer including itself.",
      slugs: ["duplicate-charge-pairs", "symmetric-pairs", "most-common-course-pairs"],
    },
    {
      name: "Month buckets & settlement calendars",
      why: "Settlement calendars are month-bucketed: SUBSTR(paid_on, 1, 7) folds attempts into '2024-03'-style keys with a conditional count of exceptions riding in the same fold. The gateway probes whether the status rule and the total come from one scan — branches that must reconcile before the report ships.",
      slugs: ["monthly-transactions-i", "the-latest-login-in-2020", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "Honest ratios & rounded shares",
      why: "Authorization rates, coverage shares, dispute rates — every rate here is a conditional sum over a count, and both failure modes are graded: integer division (100 must be 100.0) and denominator drift (the WHERE that filters the numerator's population out of the denominator). Round once, at the end, at the display edge.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "card-launch-success"],
    },
    {
      name: "One-pass censuses: FILTER & CASE",
      why: "The close packet wants the whole batch book in one row — one scan, one column per class, `FILTER (WHERE …)` doing the branching. The CASE census is the row-per-class sibling, and both shapes must reconcile to COUNT(*) (28 batches here) before anyone reads them. COUNT on an empty class returns 0; SUM returns NULL — know which your packet needs.",
      slugs: ["count-salary-categories", "odd-and-even-transactions", "spend-histogram"],
    },
    {
      name: "Window frames & running balances",
      why: "Running attempted-dollars and cumulative settlement positions are how ops watches a day drain — and the default window frame (RANGE) silently folds ORDER BY peers together, which matters the moment split attempts share a paid_on. ROWS-versus-RANGE, deterministic tiebreaks, and 'which running total did you mean' are the interview surface here.",
      slugs: ["account-balance", "find-cumulative-salary-of-an-employee", "rolling-average-steps"],
    },
    {
      name: "Calendar spines & trailing windows",
      why: "Months with zero issuance vanish from GROUP BY walks — the book's first batch is 2024-02, and 2024-01 simply doesn't exist as a group — so MoM deltas across a hole read as fake cliffs. WITH RECURSIVE month spines, LEFT-joined zero-fills and 7-day trailing frames are how the walk stays honest across the calendar.",
      slugs: ["restaurant-growth", "find-the-missing-ids", "friday-purchases-i"],
    },
    {
      name: "Set-op report stitching",
      why: "The close packet stitches per-route rows and a grand-total row into one result — UNION ALL, never UNION, whose silent dedupe can make a genuine repeat vanish while the packet still reconciles. EXCEPT is the rail-vs-book diff in set form, and its direction IS the question.",
      slugs: ["monthly-transactions-ii", "count-apples-and-oranges", "league-statistics"],
    },
    {
      name: "Latest-state & argmax reads",
      why: "'First attempt per batch', 'largest attempt per day', 'latest address per merchant' — every one is an argmax with a tie policy, and the bare MAX-join-back returns BOTH tied rows and silently doubles every downstream count. The settlement clock (first attempt, 28.4-day average) is this exact decision.",
      slugs: ["bikes-last-time-used", "the-most-recent-orders-for-each-product", "product-price-at-a-given-date"],
    },
    {
      name: "CTE staging & deep subqueries",
      why: "The coverage census stages the LEFT-JOIN fold once and CASEs it four ways — staging is how multi-arm reports stay one scan with one definition of 'attempted'. Nested folds (per-batch attempted, then per-class counts) are the house shape, and naming stages for what they hold is graded, not cosmetic.",
      slugs: ["investments-in-2016", "department-highest-salary", "managers-with-at-least-5-direct-reports"],
    },
  ],

  theory: [
    {
      id: "adyen-t1",
      q: "An attempt is authorized, captured, settled, then maybe refunded or disputed. In a query reporting settled volume, where does each lifecycle rule live — and what breaks when a row-level rule lands in the wrong clause?",
      a: "Lifecycle states are row-level facts, so they belong in WHERE — 'settled volume' filters to attempt rows joined to captured batches before any aggregation touches them. Once folded, the states no longer exist per row: HAVING can only judge group aggregates like SUM or COUNT, not recover rows you already summed. The classic failure is summing over all attempts and trying to subtract the void-but-attempted batch in HAVING — that $925 on batch #11 is already inside the total, and no post-aggregation clause can un-mix it. The strong answer recites the pipeline — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — and places every filter by asking: is this a fact about one row, or about a group? At a gateway that question is the job, because a lifecycle rule in the wrong clause doesn't error — it reconciles to nothing and ships anyway.",
      tag: "pipeline",
    },
    {
      id: "adyen-t2",
      q: "Attempts LEFT JOIN batches: when does an INNER JOIN give the identical answer, and when does it silently delete the anomaly you were hunting?",
      a: "When every attempt matches a batch — the foreign-key world this db lives in — INNER and LEFT return the same rows from the attempts side; the difference only appears on batches with NO attempt, and those rows are the product here. The unattempted census (6 batches, $15,217.00) exists only under LEFT JOIN: unmatched batches survive with NULL attempt columns and IS NULL is the detection. The silent killer is filtering the right table's column in WHERE — p.method = 'card' discards the NULL-payload rows (NULL = 'card' is UNKNOWN), collapsing the LEFT JOIN to an INNER and deleting exactly the exceptions the sweep exists to find. The fixes: move the predicate into ON, or filter a pre-aggregated fold first. 'LEFT JOIN is safer' is not the answer — join type is a decision about who survives, and at a gateway you state who survives out loud.",
      tag: "joins",
    },
    {
      id: "adyen-t3",
      q: "27 attempt rows cover 22 batches because five batches draw two attempts. Narrate every count in that sentence — and how you'd report both grains in one query.",
      a: "COUNT(*) over payments reads 27 — attempt events, the rows the rail shipped. COUNT(DISTINCT invoice_id) reads 22 — batches covered, the business object. COUNT(amount_cents) also reads 27 because the FK is never NULL — NULL-skipping is not folding. The two-grain report folds once and counts twice: per route, attempt events AND distinct batches side by side, because card's 16 events might be 16 batches or fewer, and the split rate is the gap between the columns. The habit the interviewer grades: before any COUNT, say 'one row per what?' — attempt event, batch, rail bucket. At Adyen the distinction is money: a duplicate-counted attempt inflates processed volume; a deduplicated count hides operational load, and both numbers ship to different teams on purpose.",
      tag: "aggregation",
    },
    {
      id: "adyen-t4",
      q: "A voided batch carries an attempt; a paid batch has none. When you LEFT JOIN attempts to batches, what is your NULL policy — filter, coalesce, or report?",
      a: "The NULL means 'no attempt row exists', and that is data — the exception class itself — not missingness to clean. The policy: classify, don't discard. The coverage census keeps every batch and CASEs the join result into exact, partial and none (21 / 1 / 6 on this db, with #25 the partial: $4,000.00 attempted of $6,148.00), because those counts ARE the reconciliation. Equality never detects it — NULL fails every test including against itself — the arm is IS NULL. COALESCE belongs at the display edge only: a coalesced zero mid-pipeline launders a paid-but-unattempted batch into a clean-looking $0.00 somebody will act on. And if the ask truly wants attempted-only, filter in WHERE and say the population changed — 'this report covers the 22 batches with attempts' — because 28 minus 22 is the story that filter just deleted. A report whose WHERE does definitional work silently is the artifact a gateway's reviewers hunt for.",
      tag: "nulls",
    },
    {
      id: "adyen-t5",
      q: "Each batch can draw several attempts. How do you pick the FIRST attempt per batch, and what breaks with the bare MAX-join-back when two rows share a timestamp?",
      a: "Two honest shapes. Aggregate-only: fold per batch with MIN(JULIANDAY(paid_on) - JULIANDAY(issued_on)) — that's the settlement clock, 20 paid batches averaging 28.4 days, fastest 13, slowest 84 on this db. Row-picking: ROW_NUMBER() OVER (PARTITION BY invoice_id ORDER BY paid_on, id) = 1, and the id is the part interviewers wait for — it makes 'first' deterministic when two attempts share a timestamp, which split rail files produce routinely. The bare MAX(paid_on) join-back returns BOTH tied rows, and every downstream count silently doubles; 'it still returns rows' is not a defense. Choose by output: if you need other attempt columns, take the window; if you only need the timing, the aggregate fold is cheaper and stages cleanly in a CTE named for what it holds — first_attempt, not cte2.",
      tag: "windows",
    },
    {
      id: "adyen-t6",
      q: "WHERE amount_cents/100.0 > (SELECT AVG(amount_cents)/100.0 FROM payments WHERE method = 'sepa') — this db has no 'sepa' rail. Walk me through what happens.",
      a: "A scalar subquery is contractually zero-or-one rows, one column. One row: its value joins the comparison. Zero rows: it yields NULL — not an error, not zero — and amount > NULL is UNKNOWN, so WHERE passes nothing: an above-average report that returns empty while looking perfectly healthy. That's the empty-inner-query bug, and it ships on filtered staging tables far more often than on full ones — a rail that launched yesterday, a merchant segment with no volume this month. The strong answer also names the other contract edge: two rows from a scalar subquery IS an error, so 'scalar' is a promise you verify with the fold's GROUP BY, not an assumption. At a gateway the follow-up is always: what population did the inner fold cover, and what does the route report do when that population is empty? Silence is not an answer the risk team accepts.",
      tag: "subqueries",
    },
    {
      id: "adyen-t7",
      q: "Payment terms run 30 days flat on this db, and days-to-settle averages 28.4 with a 13-to-84 spread. How do you compute the window, bucket the months, and where does BETWEEN break?",
      a: "Window: JULIANDAY(paid_on) - JULIANDAY(issued_on) gives fractional days — take MIN per batch first (first attempt, not every split row), average, then ROUND(..., 1) exactly once at the outermost fold; 28.4 is a single final round, not a per-row one. Buckets: STRFTIME('%Y-%m', paid_on) or SUBSTR(paid_on, 1, 7) — the SUBSTR shortcut is safe only while the column stays fixed-width ISO, a convention nothing in the column enforces, so say it before you lean on it. Windows: half-open intervals — paid_on >= '2024-03-01' AND < '2024-04-01' — never BETWEEN, which is inclusive both ends and drops everything after midnight on the last day, exactly when month-end settlement files land. And the terms check itself is a query: due_on − issued_on = 30 for all 28 batches, verified not assumed — one 27-day outlier would be the finding, not the exception you skip.",
      tag: "dates",
    },
    {
      id: "adyen-t8",
      q: "The clearing ledger must read zero: debits $181,080, credits $181,080. How do you prove it in one query — and localize the break when it doesn't?",
      a: "One pass, two conditional sums: SELECT SUM(debit_cents), SUM(credit_cents), SUM(debit_cents) - SUM(credit_cents) AS delta FROM ledger_entries — dollars via /100.0, delta printed beside the totals. Zero is the only acceptable value; the query is the proof and a non-zero delta is the page. Localization is the same shape one level down: GROUP BY account and read per-account nets — cash $44,196, receivables $16,440, revenue −$86,052, opex $25,416 here — because a broken balance always shows up as an account whose debit/credit pairing drifted. The traps are self-inflicted: COUNT where you meant SUM, SUMming dollars over cents (a 100× error the eye never catches), or auditing only the grand total while an offsetting error hides across two accounts. The habit: reconcile the total, then reconcile the parts, and treat 'two accounts both moved by the same amount' as the anomaly it usually is.",
      tag: "quality",
    },
    {
      id: "adyen-t9",
      q: "You add a running attempted-dollars column: SUM(amount_cents) OVER (ORDER BY paid_on). Split attempts share paid_on seconds. What frame is the engine actually using, and when do you override it?",
      a: "The default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE treats ORDER BY peers as one unit — every attempt sharing the current row's paid_on joins the fold at once. On attempt streams that's usually what you want (same-instant attempts are one event economically), but it means the running value jumps by the whole peer group and row-by-row narration is impossible. Override with ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW when the metric is genuinely per-row — running attempt count, per-row cumulative fee — and accept that peer order then needs a deterministic tiebreak (id) or the column itself is unstable. The senior tell is saying which one you chose and why: at a gateway, a running total that silently includes or excludes peers isn't a frame detail, it's a different number on the close packet.",
      tag: "frames",
    },
    {
      id: "adyen-t10",
      q: "The close packet needs per-route rows and a grand total in one result, and risk needs 'batches the book has but no attempt touched'. Which set operators, and what does each one's dedupe behavior cost you?",
      a: "The packet is UNION ALL: per-route folds stacked with a 'TOTAL' row appended. ALL is non-negotiable — UNION sorts and dedupes, so if two branches ever produced identical rows (two routes with the same count and total), one would vanish and the packet would still reconcile, which is the worst way to lose a row. Risk's question is EXCEPT: batch ids EXCEPT attempt batch-ids is the 6-batch, $15,217.00 anti-join in set form — and direction is the entire question, because the reverse (attempts EXCEPT batches) answers 'orphan attempts', empty here but not after a bad rail load. INTERSECT rarely appears in close work but is the natural 'in both feeds' check. The discipline: set ops compare columns positionally, so write the SELECT lists side by side and confirm the grains match — a batch-id column against an attempt-id column is how diffs return confident nonsense.",
      tag: "setops",
    },
    {
      id: "adyen-t11",
      q: "Three shapes find batches with no attempt: LEFT JOIN … IS NULL, NOT EXISTS, NOT IN. Which do you reach for at 9am, and what can go wrong with the other two?",
      a: "The sweep is the money anti-join — 6 batches, $15,217.00 — so correctness under dirty data wins: NOT EXISTS with a correlated probe is the default, because a NULL key in the subquery simply matches nothing and the outer row survives. LEFT JOIN + IS NULL is the sibling when you also want columns from the fold (per-status exposure split), and it's what the census actually stages. NOT IN is the one that pages you at midnight: one NULL invoice_id in the attempt staging table makes x NOT IN (…NULL…) UNKNOWN for every row, the sweep returns zero rows, and 'no unattempted batches' ships as good news. If NOT IN must be used, guard the subquery with WHERE key IS NOT NULL — and say out loud that you did. The habit the interviewer grades is not memorizing the trap; it's naming the population each shape keeps and choosing on purpose.",
      tag: "antijoin",
    },
    {
      id: "adyen-t12",
      q: "The coverage census CASEs each batch four ways after folding attempts per batch. Why stage the fold in a CTE instead of writing it inline, and what are the house rules for staging?",
      a: "Because the fold is computed once and read four times: attempted_cents IS NULL, IS NULL AND status = 'paid', equality with amount_cents, and the ELSE. Inline, you'd either repeat the LEFT-JOIN-and-SUM in every arm (four scans, four chances to drift) or discover that no engine aggregates an aggregate's input inside a CASE arm without staging. The house rules: one fold per stage, named for what it holds (folded, first_attempt, monthly — never cte1), and the outer query stays thin enough to read as the business question. The same staging is why the issuance walk computes monthly totals once and lets LAG walk the folded rows instead of windowing over raw batches. Staging is not ceremony; it's how a four-arm census remains one scan with one definition of 'attempted' — and how the reconcile-to-28 check has a single place to live.",
      tag: "staging",
    },
    {
      id: "adyen-t13",
      q: "Someone joins payments to invoices and SUMs batch amounts, then reports the book grew to $96,700.00. Walk me through what actually happened and the two honest fixes.",
      a: "The book is 28 batches worth $86,977.00. The join is one-to-many — 27 attempts, five batches (#1, #5, #12, #19, #22) drawing two — so the one-side row repeats per match and SUM(i.amount_cents) counts the split batches twice: $71,760.00 of attempted book plus $24,940.00 of double-counted splits = $96,700.00. Nothing errored; the query is summing at the wrong grain. Fix one: aggregate the many-side first (fold attempts per invoice_id in a derived table or CTE), then join the fold — one row per batch, sums clean. Fix two: keep the join for row-level questions but aggregate only many-side columns, never one-side money. The tell that a fold is at risk: the row count changes across the join (28 rows in, 27 out here) and the summed column belongs to the one side. At a gateway that bug doesn't crash — it publishes a book $9,723.00 heavier than it is.",
      tag: "fanout",
    },
    {
      id: "adyen-t14",
      q: "Amounts are INTEGER cents. Where do /100.0, ROUND, and AVG belong in a money pipeline — and what does AVG(amount_cents / 100) silently produce?",
      a: "Cents stay INTEGER through every fold — SUM, MIN, MAX, GROUP BY all preserve them exactly — and the dollar conversion happens once, at the display edge: ROUND(SUM(amount_cents) / 100.0, 2). The 100.0 is load-bearing: /100 is integer division and truncates the remainder before ROUND can see it. AVG(amount_cents / 100) compounds the damage — each row is truncated before averaging, so the mean is computed over rounded-down dollars; AVG(amount_cents) / 100.0 is the honest form (averaging in exact cents, converting once). And averages are the one place cents can't survive the display: AVG of cents is inherently fractional, so convert immediately after the aggregate, not before it. The policy in one line: aggregate in cents, convert once, round once — and if a query does both (/100.0 mid-pipeline and ROUND at the end), assume the author didn't know which layer owns precision.",
      tag: "cents",
    },
    {
      id: "adyen-t15",
      q: "Your one-pass census prints NULL in the sepa-dollars column because the rail has no sepa rows. When is COALESCE the right fix — and when does it launder a real signal?",
      a: "COALESCE belongs at the display edge, when the consumer is a human or a CSV that can't hold NULL: COALESCE(SUM(amount_cents) FILTER (WHERE method = 'sepa'), 0) prints $0.00 and the packet stays readable. Mid-pipeline it's a lie: a coalesced zero means 'we measured, it's zero', and 'no sepa rail exists' and 'sepa did zero volume' are different findings — the first might be a config bug. The related trap is x/0: division by zero in SQLite yields NULL, not an error, so a rate computed over an empty denominator doesn't crash, it disappears; NULLIF(denominator, 0) plus an explicit IS NULL check in the report keeps the distinction visible. The interview shape: for every COALESCE you write, say what the NULL meant. If the answer is 'nothing to measure', keep the NULL until the edge; if it's 'the fold is over the wrong population', fix the fold.",
      tag: "coalesce",
    },
    {
      id: "adyen-t16",
      q: "The issuance walk's earliest month is 2024-02 because that's when the book starts. Finance wants January on the axis anyway. How do you print months that have no rows?",
      a: "GROUP BY emits groups from rows — no rows, no group — so the fix is a calendar spine: generate the month range with WITH RECURSIVE (or keep a calendar table), LEFT JOIN the folded walk onto it by month key, and COALESCE the count and dollar columns to 0 at the display edge. Two discipline points. First, anchor the spine on a parameterized range, not on MIN/MAX of the data — the moment the data changes, a data-anchored spine changes shape and the report re-bases itself silently. Second, decide the NULL policy for the delta column on spine rows: LAG across a zero month is a real comparison (0 versus prior), while LAG across an absent month was no comparison at all — those are different sentences on the board. Spines also catch holes rather than fill them: a LEFT JOIN in the other direction (spine minus data) is the 'which month did the rail go dark' query.",
      tag: "spine",
    },
    {
      id: "adyen-t17",
      q: "In the issuance walk, the delta column's first row is NULL and someone proposes filtering it out. Defend or reject — and where else does that NULL show up?",
      a: "Reject — the first-row NULL is the walk's anchor, not missing data. It says 'no prior month exists to compare against', which is true and load-bearing: filter it and the board's axis starts at the second month with no indication a month was dropped, and anyone reconciling the walk against COUNT(*) of months sees 12 versus 13. The same NULL appears anywhere LAG/LEAD meets an edge: the slowest batch's LEAD (next-slower) is NULL, the first row of every PARTITION BY walk is NULL. The policy is one sentence: keep edge NULLs in the result, and if the display can't hold them, COALESCE at the edge with a sentinel the business reads deliberately — never silently. The trap to name out loud: comparisons against that NULL are UNKNOWN, so a downstream WHERE delta < 0 excludes the anchor row as a side effect. If the filter isn't meant to be an edge policy, write delta IS NULL OR delta < 0 — or say why the anchor shouldn't qualify.",
      tag: "lag",
    },
    {
      id: "adyen-t18",
      q: "The March batch report filters WHERE STRFTIME('%Y-%m', issued_on) = '2024-03'. Same rows come back as the range predicate — so why does the house style ban the function form?",
      a: "Because the plan is different even when the rows aren't. A predicate that wraps the indexed column in a function can't seek: the engine computes STRFTIME for every row and scans the whole table, while issued_on >= '2024-03-01' AND issued_on < '2024-04-01' compares the bare column to constants and seeks the index straight to March. On 28 batches the scan is free; on a rail-sized attempt table it's the difference between milliseconds and a timeout, and the query that was 'fine in staging' becomes the incident. The habits: bucket by range, not by function; if a month key is genuinely needed, pre-compute it in staging where it can be indexed; and read EXPLAIN QUERY PLAN before calling a fold expensive — SCAN over a filtered column is the tell. Correctness-identical, plan-different is the whole story: the strong answer optimizes predicates, not just joins.",
      tag: "sargable",
    },
    {
      id: "adyen-t19",
      q: "Two analysts report 'coverage': one says 78.6%, the other says 100%. Both are looking at the same db. What happened, and which print survives review?",
      a: "They chose different denominators. 78.6% is 22 of 28 — batches with at least one attempt over all batches, the reconciliation number, because the 6 unattempted ($15,217.00) are the finding. 100% is 22 of 22 — attempted batches over attempted batches, a tautology that hides exactly the population the sweep exists to find. Neither is arithmetic-wrong; one is definitionally useless, and that's the fight every gateway metric review has. The surviving print names the denominator in the same breath as the number: 'attempt coverage 22/28 batches; unattempted 6 worth $15,217.00 — 5 open ($13,461.00) and 1 paid-but-unattempted (#28, $1,756.00)'. The same discipline for the split rate (5 of 22 covered, not 5 of 28) and days-to-settle (20 first-attempt batches, not 21 paid — #28 has no attempt to time). At Adyen the metric isn't the number; it's the number, the denominator, and the population left out — printed together.",
      tag: "metrics",
    },
    {
      id: "adyen-t20",
      q: "'First attempt per batch', 'largest attempt per day', 'latest address per merchant' — same shape, different traps. How do you write a reliable argmax, and what breaks with the MAX-join-back?",
      a: "The reliable shape stages the pick: ROW_NUMBER() OVER (PARTITION BY invoice_id ORDER BY paid_on, id) = 1 — the id is what makes 'first' deterministic when two attempts share a timestamp, which split rail files produce. The alternative when you only need the timing is the aggregate fold: MIN(JULIANDAY(paid_on) - JULIANDAY(issued_on)) per batch — no tie problem, because MIN over equal timestamps is the same value. What breaks is the bare MAX-join-back: join the table to a per-key MAX(paid_on) fold and any key with a tie returns BOTH rows, so every downstream count and sum silently doubles — the fan-out bug wearing a window's clothes. And pick the tie-break column before you need it: id is fine, paid_on-with-milliseconds is better, but 'whatever the plan does' is how two runs of the same query disagree. The 28.4-day settlement clock is this exact decision, made well: 20 first attempts, each picked once, deterministically.",
      tag: "argmax",
    },
    {
      id: "adyen-t21",
      q: "The audit pack wants each split batch's attempt ids as one cell: '1, 3' for batch #1. How do you build it — and what does GROUP_CONCAT not promise?",
      a: "GROUP_CONCAT(p.id, ', ') over a fold grouped by batch is the tool, with two honest caveats. Order: without ORDER BY inside the aggregate (SQLite 3.44+) or an explicitly ordered subquery feeding it, the concatenated order is whatever the scan produced — reproducible only until the plan changes, which is not an audit property. Volume: a rail-sized group can produce a cell thousands of characters long; caps, truncation, and where truncation lands are all silent. So the house shape stages the per-batch fold first (batch, attempt count), filters to the split batches (COUNT(*) = 2 — five of them: #1, #5, #12, #19, #22), and concatenates from the small, ordered set, with the column named for its order guarantee. For anything auditors will diff between runs, sort the ids and say so; for a human-readable hint cell, 'unordered' in the column name is the honest label.",
      tag: "concat",
    },
    {
      id: "adyen-t22",
      q: "EXCEPT and INTERSECT dedupe; UNION dedupes; UNION ALL doesn't. NULLs sit somewhere surprising in all of it. Walk the semantics a reconciliation depends on.",
      a: "Set operators treat rows as whole-row values: two rows are 'the same' when every column compares equal — and in set context NULL equals NULL, which ordinary = never allows. So EXCEPT correctly excludes a NULL row it has seen on both sides, while WHERE col NOT IN (1, NULL) poison-tells you nothing: same NULL, opposite behavior, depending on whether the comparison is set-membership or scalar. Dedupe semantics matter for reconciliation: EXCEPT and INTERSECT fold duplicate rows to one before comparing, so 'the rail sent this batch twice' is invisible to a plain EXCEPT diff — the count-preserving check needs GROUP BY … HAVING COUNT(*) > 1 per feed, or a diff over folds that carry the count as a column. And UNION's dedupe is a correctness hazard in close packets (a vanished duplicate row still reconciles), which is why the house default is UNION ALL plus an explicit dedupe check where duplicates are the anomaly. Say which semantics your diff assumes; 'the rows matched' isn't a reconciliation statement until you've said what 'same' meant.",
      tag: "semantics",
    },
    {
      id: "adyen-t23",
      q: "A board deck shows settlement volume by month, and one month's numbers include the next month's first day. What class of bug is this, and how do you date-grain defensively?",
      a: "A boundary bug: the month was built from a filter like BETWEEN '2024-03-01' AND '2024-03-31' (or '2024-03-31 23:59:59', which misses fractional seconds) instead of a generated key or a half-open range. The defensive kit: prefer keys over filters — SUBSTR(paid_on, 1, 7) or STRFTIME('%Y-%m', paid_on) partitions every row exactly once, so no row can land in two buckets; when a range is unavoidable, write it half-open (>= start AND < next start) and let the next window own its first instant; and never hand-write a month's last day — 28/30/31 is exactly the literal that's wrong twice a year. The related trap is granularity drift: %Y-%m and %Y aggregates both 'work' and answer different questions, and week anchoring (%W versus %w numbering Sunday 0) shifts every weekday analysis if assumed wrong. The review tell: any date literal in a boundary position is read as a bug until proven a convention.",
      tag: "grain",
    },
    {
      id: "adyen-t24",
      q: "It's close night. Rail file, batch book, clearing ledger — three feeds. Order the checks, name the query shapes, and say what each check is allowed to find.",
      a: "The order is coarse-to-fine, and each check has a contract. First the census: one pass, every batch classed exact / partial / none / contradiction (21 exact, 1 partial, 5 open-unattempted plus #28 caught by its own paid-no-attempt arm, and void-but-attempted #11 watched in its own query), reconciling to COUNT(*) = 28 — this finds classification errors. Second the anti-join sweep: batches with no attempt (LEFT JOIN … IS NULL), split by status because open-unattempted ($13,461.00) routes to collections and paid-but-unattempted (#28, $1,756.00) routes to engineering — this finds missing money movement. Third the per-batch fold: attempted total versus batch amount, equality per batch (the partial #25, $4,000.00 of $6,148.00, is the only mismatch) — this finds value drift. Last the ledger delta: SUM(debits) − SUM(credits) = 0 ($181,080 = $181,080) plus per-account nets — this finds bookkeeping breaks the batch view can't see. Nothing is optional, because each query is blind to what the next one owns; the close isn't 'queries ran', it's 'every contract held'.",
      tag: "recon",
    },
  ],

  mcqs: [
    {
      id: "adyen-mcq-1",
      prompt: "An attempt of 91,873 cents is reported as ROUND(amount_cents / 100, 2). What lands in the settlement report?",
      choices: [
        "918.73 — integer division keeps the cents",
        "918 — the .73 was truncated away before ROUND ran",
        "918.00 — SQLite rounds to the nearest cent",
        "918.73 — ROUND heals the truncation",
      ],
      answer: 1,
      why: "Division of two INTEGERs truncates BEFORE ROUND ever sees the value: 91873 / 100 = 918, and ROUND(918, 2) is still 918. The house shape is amount_cents / 100.0 — real division first, ROUND last, exactly once.",
      notes: [
        { choice: 0, why: "Integer division never 'keeps cents' — it discards the remainder entirely. 91873/100 is 918, not 918.73; the 73 cents vanished at the division." },
        { choice: 3, why: "ROUND runs after the damage: its input is already the truncated 918. No function downstream of a truncation recovers the truncated remainder." },
      ],
      difficulty: "easy",
    },
    {
      id: "adyen-mcq-2",
      prompt: "28 batches: 21 paid, 6 open, 1 void. SELECT status, COUNT(*) FROM invoices GROUP BY status returns how many rows?",
      choices: ["1", "3", "28", "27"],
      answer: 1,
      why: "GROUP BY folds to one row per distinct status — paid, open, void — so 3 rows whose counts sum to 28. The fold's output grain is the group, not the input row.",
      notes: [
        { choice: 2, why: "28 is the input row count. GROUP BY collapses it to groups; you'd only see 28 rows from a GROUP BY on a 28-distinct-value column." },
        { choice: 3, why: "27 is the attempt count — a different table entirely. This fold reads the batch book only, and it folds to the 3 statuses present." },
      ],
      difficulty: "easy",
    },
    {
      id: "adyen-mcq-3",
      prompt: "The attempts table holds 27 rows covering 22 batches — five batches draw two attempts. Which expression counts BATCHES attempted, not attempt rows?",
      choices: ["COUNT(*)", "COUNT(amount_cents)", "COUNT(DISTINCT invoice_id)", "SUM(invoice_id)"],
      answer: 2,
      why: "COUNT(*) and COUNT(amount_cents) both read 27 — one row per attempt, and the FK is never NULL. COUNT(DISTINCT invoice_id) folds the split rows back to 22 batches. Both grains are real; the report must name which one it prints.",
      notes: [
        { choice: 1, why: "COUNT(column) skips NULLs, not duplicates — with a NOT NULL FK it equals COUNT(*) at 27. DISTINCT is the fold; NULL-skipping isn't." },
        { choice: 3, why: "SUM adds primary keys — a meaningless number that changes when any batch gains a second attempt. Keys are for joining, never for folding." },
      ],
      difficulty: "medium",
    },
    {
      id: "adyen-mcq-4",
      prompt: "Batch #11 is VOID yet carries a $925.00 attempt. The per-route attempted-volume fold must exclude it. Where does the exclusion live?",
      choices: [
        "In HAVING: HAVING SUM(i.status <> 'void') > 0",
        "In WHERE, before the fold: join attempts only to batches whose status isn't void",
        "In ORDER BY, pushing voided routes to the bottom",
        "Nowhere — SUM ignores voided batches automatically",
      ],
      answer: 1,
      why: "Batch status is a row-level fact, so the exclusion is a WHERE-predicate (or ON-condition) applied before GROUP BY. Once the fold has summed, HAVING can only judge group aggregates — it cannot un-mix the $925 already inside card's total.",
      notes: [
        { choice: 0, why: "That HAVING filters whole route groups by a per-group aggregate, not the offending row — and the $925 is already inside the SUM it tests. Post-aggregation clauses can't un-mix a fold." },
        { choice: 3, why: "SUM ignores NULLs, not voided statuses. The attempt row is fully non-NULL, so it folds in like any other until a row-level filter removes it." },
      ],
      difficulty: "medium",
    },
    {
      id: "adyen-mcq-5",
      prompt: "The close census adds COUNT(*) FILTER (WHERE method='sepa') and SUM(amount_cents) FILTER (WHERE method='sepa') over attempts — no 'sepa' rows exist. What do the two columns return?",
      choices: [
        "Both return 0",
        "COUNT returns 0; SUM returns NULL",
        "COUNT returns NULL; SUM returns 0",
        "Both return NULL",
      ],
      answer: 1,
      why: "COUNT over an empty class is 0 — a count of nothing is zero. SUM over an empty class is NULL — there is nothing to sum, and the fold refuses to invent a number. It's why money columns in one-pass censuses get COALESCE(SUM(...) , 0) at the display edge, while COUNT columns are left honest.",
      notes: [
        { choice: 0, why: "Half right for the wrong reason — COUNT is 0, but SUM never fabricates 0 from an empty set; it returns NULL and the census prints a blank dollar cell." },
        { choice: 2, why: "Swapped: NULL-skipping and empty-set folding differ. COUNT counts rows (none → 0); SUM folds values (none → NULL, the 'no data' signal)." },
      ],
      difficulty: "medium",
    },
    {
      id: "adyen-mcq-6",
      prompt: "Dispute share per route: which expression is safe against integer division AND denominator drift?",
      choices: [
        "SUM(CASE WHEN disputed THEN 1 ELSE 0 END) / COUNT(*) * 100",
        "100.0 * SUM(CASE WHEN disputed THEN 1 ELSE 0 END) / COUNT(*)",
        "100 * COUNT(disputed) / COUNT(*)",
        "100.0 * SUM(CASE ...) / COUNT(*) over rows pre-filtered to attempted in WHERE",
      ],
      answer: 1,
      why: "100.0 promotes to real arithmetic BEFORE the division, and COUNT(*) runs over the same unfiltered fold as the numerator — no drift. Filtering attempted rows in WHERE first shrinks the denominator to the numerator's population and every share reads 100%.",
      notes: [
        { choice: 0, why: "The logic is right but the INTEGER 100 multiplies after an integer division that already truncated — any share under 1% collapses to 0." },
        { choice: 2, why: "COUNT(disputed) counts non-NULL rows of the column — essentially every attempt — so the 'share' reads ~100 for any input." },
      ],
      difficulty: "medium",
    },
    {
      id: "adyen-mcq-7",
      prompt: "WHERE batch_id NOT IN (SELECT batch_id FROM staging_attempts) — staging_attempts.batch_id is nullable in the copy risk loaded. What can happen?",
      choices: [
        "It runs slower but stays correct",
        "One NULL in the subquery empties the entire result — every row fails the test",
        "NULL batch_ids are treated as unmatched and kept",
        "SQLite rewrites NOT IN as an anti-join automatically",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE — the comparison is UNKNOWN and NOT UNKNOWN is still UNKNOWN. One stray NULL silently returns zero rows. The NULL-proof shapes: NOT EXISTS, or LEFT JOIN … IS NULL.",
      notes: [
        { choice: 0, why: "The failure is correctness, not latency — an empty 'clean batches' report that looks like good news to the exception queue." },
        { choice: 2, why: "NULLs don't 'fail through' to kept rows — they poison the whole membership test for every row, kept or not." },
      ],
      difficulty: "hard",
    },
    {
      id: "adyen-mcq-8",
      prompt: "WHERE amount_cents/100.0 > (SELECT AVG(amount_cents)/100.0 FROM payments WHERE method = 'sepa') — no sepa attempts exist on this db. What does the query return?",
      choices: [
        "Every attempt — the threshold reads 0",
        "No rows, silently — the empty scalar subquery yields NULL and every comparison against NULL is UNKNOWN",
        "An error: scalar subqueries must return exactly one row",
        "Only attempts with NULL amounts",
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
      id: "adyen-mcq-9",
      prompt: "Five batches draw two attempts each. JOIN payments p2 ON p2.invoice_id = p1.invoice_id AND p1.id <> p2.id — how many pairs per split batch, and why is p1.id < p2.id the fix?",
      choices: [
        "1 pair; <> and < are equivalent here",
        "2 pairs — each unordered pair counted in both directions; < keeps one canonical orientation",
        "0 pairs — <> excludes everything",
        "4 pairs — <> also matches a row to itself",
      ],
      answer: 1,
      why: "<> matches both orderings of every pair, so each split batch yields 2 ordered pairs — pair counts and pair sums double. p1.id < p2.id keeps exactly one orientation per unordered pair (and can't match a row to itself), which is why duplicate-attempt scans and split-tender censuses canonicalize with <.",
      notes: [
        { choice: 3, why: "A row can't match itself under <> (id <> id is false) — the doubling comes from orientation, not self-pairs." },
        { choice: 0, why: "They differ exactly when a pair exists — which is the only case the scan cares about." },
      ],
      difficulty: "hard",
    },
    {
      id: "adyen-mcq-10",
      prompt: "The settlement clock averages days-to-settle at 28.4 across 20 paid batches. Where should the ROUND happen?",
      choices: [
        "Per row: ROUND each batch's latency to 1 decimal, then AVG",
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
      id: "adyen-mcq-11",
      prompt: "The issuance walk runs issued_cents - LAG(issued_cents) OVER (ORDER BY month) down the 13-month spine. What does the delta column read for the spine's first month, 2024-02?",
      choices: [
        "0 — the walk seeds the first delta at zero",
        "NULL — there is no previous row",
        "7,003.00 — the month's own issued total",
        "An error — LAG refuses the first row",
      ],
      answer: 1,
      why: "LAG reads the previous row in the partition; at the spine's first month there is none, so the expression evaluates to NULL. That NULL is the walk's honest anchor — the outer query keeps the row and the report shows the gap.",
      notes: [
        { choice: 0, why: "Zero isn't neutral here — it asserts 'flat versus last month', a claim the data can't back. COALESCE-ing the anchor to 0 mid-pipeline launders a missing comparison into a fake one." },
        { choice: 2, why: "$7,003.00 is 2024-02's issued total, not a delta. A delta needs two rows; the first row has one." },
      ],
      difficulty: "easy",
    },
    {
      id: "adyen-mcq-12",
      prompt: "The coverage census CASEs each folded batch. Batch #28 arrives with status 'paid' and no attempt rows (attempted_cents IS NULL). Which arm must fire first to class it 'paid-no-attempt'?",
      choices: [
        "WHEN attempted_cents IS NULL THEN 'no-attempt'",
        "WHEN attempted_cents = amount_cents THEN 'exact'",
        "WHEN attempted_cents IS NULL AND status = 'paid' THEN 'paid-no-attempt'",
        "ELSE 'partial'",
      ],
      answer: 2,
      why: "CASE evaluates arms top-down, so the contradiction arm — IS NULL and status = 'paid' — has to sit above the bare IS NULL arm, or #28 falls into the generic class and the anomaly the close packet exists to surface disappears into a count of five.",
      notes: [
        { choice: 0, why: "Placed first, this arm swallows #28: the bare IS NULL test can't see status, so the paid-but-unattempted batch passes as ordinary and the census prints 6 no-attempt instead of 5 plus the contradiction." },
        { choice: 3, why: "ELSE is the arm of last resort — it catches everything earlier arms missed. Routing #28 to 'partial' misfiles a lifecycle contradiction as a value shortfall." },
      ],
      difficulty: "easy",
    },
    {
      id: "adyen-mcq-13",
      prompt: "A dashboard shows average ship-side latency as CAST(2.98 AS INTEGER). What reaches the screen?",
      choices: [
        "2.98 — CAST preserves decimals",
        "3 — CAST rounds to nearest",
        "2 — CAST truncates toward zero",
        "NULL — CAST can't take floats",
      ],
      answer: 2,
      why: "CAST to INTEGER truncates the fractional part — 2.98 becomes 2, silently shaving almost a full day off the average. ROUND(x, digits) is the display-edge tool; CAST is a type change that happens to destroy the fraction.",
      notes: [
        { choice: 1, why: "That's ROUND(2.98, 0)'s behavior. CAST never rounds — it chops. Confusing the two drifts every latency statistic downward." },
        { choice: 0, why: "INTEGER has no fractional part by definition; the .98 is discarded at the cast, not displayed." },
      ],
      difficulty: "easy",
    },
    {
      id: "adyen-mcq-14",
      prompt: "An analyst folds the book by joining payments to invoices and running SUM(i.amount_cents) / 100.0. The book folds to $86,977.00 on its own. What does the join fold print?",
      choices: [
        "$86,977.00 — joins never change sums",
        "$71,760.00 — unattempted batches drop out",
        "$96,700.00 — the five split batches are counted twice",
        "$15,217.00 — only exposure survives",
      ],
      answer: 2,
      why: "The join is 27 attempt rows, not 28 batches: the 22 attempted batches contribute their amounts once, and the 5 split batches (#1, #5, #12, #19, #22 — $24,940.00 combined) contribute twice. $71,760.00 + $24,940.00 = $96,700.00. Fold each table to its own grain before joining money.",
      notes: [
        { choice: 0, why: "Fan-out is the classic join-sum bug: one-to-many joins repeat the one-side row once per match, and a sum over the repeated column is inflated by exactly the split volume." },
        { choice: 1, why: "$71,760.00 is the attempted-only fold — what you get filtering the batch book to ids present in payments, before any join. Right number, wrong query." },
      ],
      difficulty: "medium",
    },
    {
      id: "adyen-mcq-15",
      prompt: "The walk shows 2024-02 issued $7,003.00 and 2024-03 issued $5,009.00. What does issued_cents - LAG(issued_cents) read for 2024-03?",
      choices: [
        "-1,994.00 — current minus previous",
        "1,994.00 — the walk prints absolute change",
        "-4,006.00 — previous minus current",
        "NULL — negative deltas are suppressed",
      ],
      answer: 0,
      why: "LAG(issued_cents) is the previous row's value, $7,003.00; subtracting it from March's $5,009.00 gives −$1,994.00. The subtraction order is 'current minus previous' — flip it and every decline masquerades as growth.",
      notes: [
        { choice: 1, why: "There's no ABS here — the walk's whole point is signed movement. A '+' where the month declined is how a fold hides a contraction." },
        { choice: 2, why: "That's LAG(issued_cents) - issued_cents: the reversed expression. Same data, opposite sign, opposite story on the board." },
      ],
      difficulty: "medium",
    },
    {
      id: "adyen-mcq-16",
      prompt: "Risk's copy of staging_attempts has a nullable invoice_id. Which anti-join shape still answers 'batches with no attempt' correctly?",
      choices: [
        "WHERE id NOT IN (SELECT invoice_id FROM staging_attempts)",
        "WHERE NOT EXISTS (SELECT 1 FROM staging_attempts s WHERE s.invoice_id = i.id)",
        "WHERE id IN (SELECT invoice_id FROM staging_attempts WHERE invoice_id IS NULL)",
        "Both anti-join shapes are equivalent on any data",
      ],
      answer: 1,
      why: "NOT EXISTS is a per-row probe: it asks 'is there any matching row?' and a NULL key simply matches nothing, so the outer row survives. NOT IN compares against the whole list, and one NULL makes every comparison UNKNOWN — the entire result silently empties.",
      notes: [
        { choice: 0, why: "This is the NULL-poisoning shape: x NOT IN (1, 2, NULL) can never be TRUE. The sweep returns zero rows and reads as an all-clear on $15,217.00 of exposure." },
        { choice: 3, why: "They agree only while the subquery's key is NOT NULL. 'Equivalent on any data' is the assumption that turns a staging-table backfill into an empty sweep." },
      ],
      difficulty: "medium",
    },
    {
      id: "adyen-mcq-17",
      prompt: "The monthly walk GROUPs batch issuance by SUBSTR(issued_on, 1, 7). The book's first batch is issued 2024-02. What does the walk show for 2024-01, and what's the fix if the board wants the month printed?",
      choices: [
        "It prints 0 batches — GROUP BY zero-fills missing months",
        "It prints NULL totals for 2024-01",
        "2024-01 never appears; a WITH RECURSIVE month spine LEFT-joined to the fold prints it as 0",
        "The query errors — the month key must exist in the data",
      ],
      answer: 2,
      why: "GROUP BY only emits groups that exist in the data — a month with no rows produces no group, so 2024-01 is absent, not zero. The fix is a calendar spine: generate the month range with WITH RECURSIVE, LEFT JOIN the fold onto it, and COALESCE the counts to 0 at the display edge.",
      notes: [
        { choice: 0, why: "Aggregation invents no groups — that's the whole trap. A missing month looks identical to an unread chart line, and MoM deltas computed across the hole read as fake cliffs." },
        { choice: 1, why: "NULL totals would require a row to aggregate. Nothing exists for 2024-01 — no row, no group, no NULL, just absence." },
      ],
      difficulty: "medium",
    },
    {
      id: "adyen-mcq-18",
      prompt: "The settlement-clock leaderboard orders 20 paid batches by first-attempt days. Seven batches tie at 25 days. What does RANK() OVER (ORDER BY days) print for the tie band, and what follows it?",
      choices: [
        "7, 7, 7, 7, 7, 7, 7, then 8",
        "7, 8, 9, 10, 11, 12, 13, then 14",
        "8, 8, 8, 8, 8, 8, 8, then 14",
        "7, 7, 7, 7, 7, 7, 7, then 14",
      ],
      answer: 3,
      why: "RANK gives every peer the first rank of the band — seven 25-day batches all read 7 — and skips ahead by the number of peers: the next value is 7 + 7 = 14. That gap is RANK's signature; DENSE_RANK would continue at 8.",
      notes: [
        { choice: 0, why: "That's DENSE_RANK: ties share a rank but the sequence never skips. The two functions agree inside the band and diverge exactly after it." },
        { choice: 1, why: "That's ROW_NUMBER: one integer per row, ties broken arbitrarily. Deterministic, yes — but it reports a strict order the data doesn't contain." },
      ],
      difficulty: "hard",
    },
    {
      id: "adyen-mcq-19",
      prompt: "The audit trail folds each split batch's attempt ids with GROUP_CONCAT(p.id). What does the output guarantee?",
      choices: [
        "Ascending ids — aggregation sorts keys",
        "Insertion order — rowid order is preserved",
        "Nothing — the order of concatenated values is undefined without ORDER BY inside the aggregate",
        "Alphabetical — ids become text first",
      ],
      answer: 2,
      why: "GROUP_CONCAT folds in whatever order the scan visits rows; without ORDER BY inside the aggregate (SQLite 3.44+) or a pre-ordered subquery, the string is reproducible only by accident. For an audit artifact, order the fold or say in the column name that it's unordered.",
      notes: [
        { choice: 0, why: "There's no implicit sort in aggregation. The day the plan flips — a new index, a bigger table — the same query prints the ids in a different order and every downstream string-compare breaks." },
        { choice: 1, why: "rowid visit order is a plan artifact, not a contract. Basing an audit trail on it is betting reconciliation on the query planner's mood." },
      ],
      difficulty: "hard",
    },
    {
      id: "adyen-mcq-20",
      prompt: "March's settlement report needs batches issued in 2024-03. Which WHERE keeps an issued_on index usable?",
      choices: [
        "WHERE STRFTIME('%Y-%m', issued_on) = '2024-03'",
        "WHERE issued_on >= '2024-03-01' AND issued_on < '2024-04-01'",
        "WHERE SUBSTR(issued_on, 1, 7) = '2024-03'",
        "All three are index-equivalent",
      ],
      answer: 1,
      why: "A predicate is sargable when the engine can seek the index directly. The half-open range compares the bare column to constants — index seek. Wrapping the column in a function (STRFTIME, SUBSTR) forces a per-row computation and a full scan: correct rows, worse plan, and on a rail-sized attempt table that's the difference between a dashboard and a coffee break.",
      notes: [
        { choice: 0, why: "The month-key idiom is readable and returns identical rows — that's what makes it dangerous. It's the plan that changes: function-on-column is unseekable." },
        { choice: 2, why: "SUBSTR is the same trap in a cheaper costume. Both shapes scan every issued_on value; only the range predicate lets the index do the filtering." },
      ],
      difficulty: "hard",
    },
    {
      id: "adyen-mcq-21",
      prompt: "The split register folds attempts per batch and gates WHERE attempts = 2. The db has 27 attempts over 22 covered batches. How many rows come back?",
      choices: [
        "27 — one per attempt",
        "22 — one per covered batch",
        "5 — one per split batch",
        "17 — one per single-attempt batch",
      ],
      answer: 2,
      why: "The gate keeps exactly the batches whose fold reads 2 attempts: #1, #5, #12, #19, #22 — five rows, one per split batch, each reconciling to the penny against its batch amount.",
      notes: [
        { choice: 1, why: "22 is the covered-batch count — what the register prints with the gate removed. The gate IS the anomaly filter; dropping it prints the whole attempted book." },
        { choice: 3, why: "17 is the complement, not the answer — attempts = 1. Useful as the 'normal' population to compare against, wrong as the register." },
      ],
      difficulty: "easy",
    },
    {
      id: "adyen-mcq-22",
      prompt: "Batch #11 is void with one attempt of $925.00. In the one-pass census, what does SUM(amount_cents) FILTER (WHERE status = 'void') read?",
      choices: [
        "925.00 — the void class isn't empty",
        "0.00 — voided batches don't fold",
        "NULL — SUM over a filtered-out class",
        "$19,609.00 — the whole open book",
      ],
      answer: 0,
      why: "The FILTER keeps batch #11's row, and SUM over one row of $92,500 cents reads $925.00. Empty-class behavior — NULL for SUM, 0 for COUNT — only applies when no row survives the filter; here one does.",
      notes: [
        { choice: 1, why: "Zero would be the COALESCE'd display of an empty class. This class has a row — the whole point of #11 is that voided money still moved." },
        { choice: 2, why: "NULL is the empty-set answer. Confusing 'no rows matched' with 'one void row matched' is how a real $925.00 leak gets reported as a blank cell." },
      ],
      difficulty: "easy",
    },
    {
      id: "adyen-mcq-23",
      prompt: "The rail-vs-book diff runs: SELECT id FROM invoices EXCEPT SELECT invoice_id FROM payments. What comes back?",
      choices: [
        "The attempted batches",
        "The 6 unattempted batches, $15,217.00 of exposure",
        "Both sides — EXCEPT is symmetric",
        "An error — the two sides have different column names",
      ],
      answer: 1,
      why: "EXCEPT keeps rows of the left query with no match in the right: batch ids that never drew an attempt — the 6-batch, $15,217.00 anti-join in set-operator form. Flip the operands and you get the (empty) reverse: attempts pointing at no batch.",
      notes: [
        { choice: 0, why: "That's the wrong direction — the right side minus the left. Direction IS the question in every set-op diff; say which side is supposed to contain the other out loud." },
        { choice: 2, why: "EXCEPT is deliberately asymmetric. The symmetric diff needs a FULL OUTER JOIN with NULL-side detection — a different tool for a different memo." },
      ],
      difficulty: "medium",
    },
    {
      id: "adyen-mcq-24",
      prompt: "A close filter reads WHERE issued_on BETWEEN '2024-03-01' AND '2024-03-31'. Why does the house style rewrite it as >= '2024-03-01' AND < '2024-04-01'?",
      choices: [
        "Style only — the two are always identical",
        "BETWEEN is inclusive at both ends, so boundary timestamps land in two windows once files carry a time component",
        "BETWEEN can't compare text dates",
        "The rewrite makes the query sargable; BETWEEN never is",
      ],
      answer: 1,
      why: "BETWEEN is closed on both ends. On date-only columns it works; the day a rail file ships timestamps with a time component, '2024-04-01 00:00:00' falls inside the March window AND the April one — the boundary row double-counts. Half-open [start, end) windows tile the calendar with no seams, which is what close packets need.",
      notes: [
        { choice: 0, why: "Identical only while every timestamp is midnight-truncated. The rewrite is cheap insurance against a data shape you don't control." },
        { choice: 3, why: "Sargability comes from comparing the bare column to constants — BETWEEN does that too. The rewrite buys seamlessness, not a better plan." },
      ],
      difficulty: "medium",
    },
    {
      id: "adyen-mcq-25",
      prompt: "Batch #1 draws attempts on 2024-02-20 (card, 15 days after issue) and 2024-03-05 (wire, 29 days). The settlement clock averages 28.4 days on first attempts. Which fold computes #1's contribution?",
      choices: [
        "AVG(JULIANDAY(paid_on) - JULIANDAY(issued_on)) — averages both attempts",
        "MIN(JULIANDAY(paid_on) - JULIANDAY(issued_on)) — first attempt only",
        "MAX(...) — the batch isn't settled until the last attempt",
        "SUM(...) — the clock accumulates",
      ],
      answer: 1,
      why: "The clock is 'batch issued → first attempt', so #1 contributes 15.0 days. AVG reads 22.0 and MAX reads 29.0 — both measure the split, not the settlement, and feeding either into the 28.4-day average quietly changes the metric's definition.",
      notes: [
        { choice: 0, why: "Averaging across the split invents a batch that settled halfway between its attempts. The 28.4-day figure is defined over first attempts — change the fold and you've changed the KPI without saying so." },
        { choice: 2, why: "MAX answers a different question (how long until the batch finished drawing attempts). Useful elsewhere; wrong inside this clock." },
      ],
      difficulty: "medium",
    },
    {
      id: "adyen-mcq-26",
      prompt: "The close packet stitches one row per route plus a grand-total row labeled 'TOTAL' — card $37,364.00, wire $32,248.00, TOTAL $69,612.00. Which operator appends the total, and why?",
      choices: [
        "UNION — it also dedupes the packet",
        "UNION ALL — appends every row; UNION would silently dedupe a genuine repeat",
        "INTERSECT — totals must intersect the detail",
        "JOIN — totals join onto the detail rows",
      ],
      answer: 1,
      why: "UNION ALL is pure concatenation: the total row always appears, and if two branches ever produced identical rows you'd SEE the duplicate and fix it. UNION sorts and dedupes first — a duplicated detail row would vanish from the packet and the reconciliation would still tie, hiding the bug.",
      notes: [
        { choice: 0, why: "Dedupe-as-a-feature is backwards in reconciliation: $37,364 + $32,248 = $69,612 must be provable row by row. Silent dedupe is a place for numbers to disappear." },
        { choice: 2, why: "INTERSECT returns rows present in both branches — the opposite of appending. The packet would print whatever the detail and total happened to share." },
      ],
      difficulty: "medium",
    },
    {
      id: "adyen-mcq-27",
      prompt: "In the coverage census, someone swaps the exact arm to attempted_cents < amount_cents. The correct census prints 4 classes (21 exact / 5 no-attempt / 1 partial / 1 paid-no-attempt). What does the broken one print?",
      choices: [
        "The same 4 classes — the arm order absorbs it",
        "3 classes: 5 no-attempt / 1 paid-no-attempt / 22 'partial'",
        "4 classes with exact = 0",
        "An error — CASE arms can't use comparisons",
      ],
      answer: 1,
      why: "'<' inverts the test: the 21 fully-attempted batches fail it and fall through to ELSE 'partial', which now holds 22 batches; 'exact' never appears. Three classes, wrong dollars everywhere — and the reconcile-to-28 check still passes (5 + 1 + 22 = 28), which is exactly why class definitions get reviewed, not just totals.",
      notes: [
        { choice: 2, why: "A zero-row 'exact' class doesn't print at all — GROUP BY emits only groups with members. That's why the failure shows as a missing row, not a zero." },
        { choice: 0, why: "Arm order can't absorb a flipped predicate. The census still folds 28 batches; the labels and dollars are what break." },
      ],
      difficulty: "hard",
    },
    {
      id: "adyen-mcq-28",
      prompt: "Per-batch share of attempted dollars: SUM(amount_cents) / SUM(amount_cents) OVER () over the attempted-batch fold. What does the OVER () denominator read?",
      choices: [
        "$86,977.00 — the whole book",
        "$71,760.00 — the fold's own population",
        "$96,700.00 — the fan-out join",
        "$15,217.00 — unattempted exposure",
      ],
      answer: 1,
      why: "A partition-less window folds over the query's FROM after WHERE — the 22 attempted batches totaling $71,760.00. The unattempted $15,217.00 was filtered out before the window ran, so shares sum to 100% over the attempted population by construction.",
      notes: [
        { choice: 0, why: "The window sees the filtered set, not the table. Printing 'share of book' over this denominator mislabels every row — the honest fix is staging the book-wide total in a CTE and joining it in." },
        { choice: 2, why: "$96,700.00 is the join fan-out number — what you get summing batch amounts over attempt rows. A denominator that big is the split-batch double-count wearing a crown." },
      ],
      difficulty: "hard",
    },
    {
      id: "adyen-mcq-29",
      prompt: "Risk wants weekend attempt counts and reaches for STRFTIME('%w', paid_on). Which values are the weekend?",
      choices: [
        "1 and 7 — ISO weekday numbering",
        "0 and 6 — Sunday and Saturday",
        "6 and 7 — Saturday and Sunday in %W",
        "5 and 6 — Friday and Saturday",
      ],
      answer: 1,
      why: "%w numbers Sunday 0 through Saturday 6, so the weekend is 0 and 6. The ISO convention (Monday 1 through Sunday 7) is a different modifier — mixing them shifts the rule by a day and the flags point at Thursdays.",
      notes: [
        { choice: 0, why: "That's ISODOW's numbering, not %w's. One off-by-one in a weekday set and the 'weekend spike' analysis silently studies Monday and Sunday." },
        { choice: 2, why: "%W is the week-of-year number, not a weekday. Reaching for it here returns two-digit week numbers compared against a weekday set — a rule that never fires." },
      ],
      difficulty: "easy",
    },
    {
      id: "adyen-mcq-30",
      prompt: "A teammate's 'top 5 slowest batches' query ends LIMIT 5 with no ORDER BY. What does it return?",
      choices: [
        "The 5 slowest — LIMIT implies ordering by the metric",
        "The first 5 rows in the plan's scan order — an arbitrary, plan-dependent sample",
        "An error — LIMIT requires ORDER BY",
        "All 20 rows — LIMIT is advisory without a sort",
      ],
      answer: 1,
      why: "LIMIT caps the row count after whatever order the plan produced; with no ORDER BY that's scan order, not ranking. The 'slowest 5' can be any 5 batches — and will change when an index or plan changes. Rank deliberately: ORDER BY days DESC, then LIMIT, with a tie-break key so re-runs agree.",
      notes: [
        { choice: 0, why: "LIMIT is a cap, never a sort. The query runs fine and returns plausible-looking rows — the most dangerous failure mode a leaderboard has." },
        { choice: 2, why: "SQL doesn't require ORDER BY for LIMIT; the engine happily truncates an unordered stream. Silent, not an error." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-adyen-1",
      tier: "medium",
      topic: "x2",
      universe: "month-close",
      title: "The single-pass batch census",
      brief:
        "Month-close memo from settlement ops: the batch book goes into tonight's close packet as ONE row — a single-pass census, not four separate reports. The book holds 28 settlement batches: 21 settled worth $66,443.00, 6 open worth $19,609.00, 1 void worth $925.00. The columns are INTEGER cents — the dollar read is amount_cents / 100.0 — and the three class counts must reconcile to 28 or the census has a hole.",
      ask: "Return one row: total batches, per-class counts (settled, open, voided) via FILTER, and settled + open dollars at 2 decimals.",
      template:
        "SELECT {1}(*) AS batches,\n       COUNT(*) FILTER (WHERE status = {2}) AS settled,\n       COUNT(*) FILTER (WHERE status = {3}) AS open_batches,\n       COUNT(*) FILTER (WHERE status = {4}) AS voided,\n       ROUND(SUM(amount_cents) FILTER (WHERE status = 'paid') / 100.0, 2) AS settled_usd,\n       ROUND(SUM(amount_cents) FILTER (WHERE status = 'open') / 100.0, 2) AS open_usd\nFROM invoices;",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the row counter",
          why: "COUNT(*) counts the batch rows folded into the single scan — 28. SUM(*) and MAX(*) don't exist: only COUNT takes the star to count rows rather than fold values.",
        },
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the settled-class literal",
          why: "The settled arm fires on status = 'paid' — 21 batches worth $66,443.00. 'settled' looks right but is no status in this book: the class would read 0 and the census would scream about a hole it doesn't have.",
        },
        {
          answer: "'open'",
          kind: "keyword",
          label: "the open-class literal",
          why: "Open is the not-yet-settled pipeline — 6 batches worth $19,609.00. Point this arm at 'void' instead and the void class double-prints while the open pipeline vanishes from the packet.",
        },
        {
          answer: "'void'",
          kind: "keyword",
          label: "the voided-class literal",
          why: "The void arm catches the one dead batch ($925.00). Point it at 'pending' instead and the class reads 0 — suspiciously clean — while the real void row hides inside no bucket at all.",
        },
      ],
      distractors: ["SUM", "MAX", "'settled'", "'pending'"],
      walkthrough:
        "One scan, every class, one row — the FILTER census is how a gateway ships a close packet without four round-trips. COUNT(*) reads the book at 28 batches; the three FILTER arms split it: status = 'paid' → 21 settled ($66,443.00 via the /100.0 cents read), status = 'open' → 6 open ($19,609.00), status = 'void' → 1 voided ($925.00). The reconciliation is the proof: 21 + 6 + 1 = 28, or the packet doesn't ship. The distractors fail exactly where the craft lives: SUM or MAX in the counter slot is a syntax error — the star counts only with COUNT — 'settled' is no status in this book (the class reads 0 and hides a real 21), and 'pending' zeroes the void class while the $925.00 exception lands in no bucket. Note the asymmetry the senior analysts know: COUNT of an empty class returns 0, SUM of an empty class returns NULL — that's why the dollar columns are folded on non-empty classes and the counts are left honest. One row, four literals, one reconcile-to-28 check: the census ops actually runs.",
    },
    {
      id: "cs-adyen-2",
      tier: "hard",
      topic: "j5",
      universe: "refund-audit",
      title: "The exposure sweep: batches with no attempts",
      brief:
        "Reconciliation memo, 9am: every attempt lands in a batch, but the reverse isn't true. The sweep finds 6 batches with NO payment attempt at all, worth $15,217.00 of promised money — and they are not one class: 5 are open batches still in the pipeline ($13,461.00), and 1 is batch #28, which the book marks PAID at $1,756.00 with zero attempts behind it. The sweep must split those two classes, biggest dollars first; amounts are INTEGER cents, /100.0 for dollars.",
      ask: "Return per-status batch counts and exposed dollars (2 decimals) for batches with no attempt, biggest dollars first.",
      template:
        "SELECT i.status,\n       COUNT(*) AS batches,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS exposed_usd\nFROM invoices i\n{1} JOIN payments p\n       ON p.{2} = i.id\nWHERE p.id {3} NULL\nGROUP BY i.status\nORDER BY exposed_usd {4};",
      slots: [
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the survival-preserving join",
          why: "Unmatched batches must survive the join with NULL attempt columns — that IS the sweep. INNER collapses them: 0 rows, a sweep that reports 'all clear' while $15,217.00 sits unattempted.",
        },
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the attempt-to-batch key",
          why: "Attempts attach to batches via p.invoice_id. p.id is the attempt's own row id — the ON test degenerates to row-id collisions, mispairing the sweep instead of finding the unattempted.",
        },
        {
          answer: "IS",
          kind: "keyword",
          label: "the no-attempt detector",
          why: "p.id IS NULL is the only TRUE test for the unmatched side — NULL fails every equality, so '= NULL' returns nothing and 'IS NOT NULL' flips the sweep to the 22 covered batches.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure-first order",
          why: "Ops works the money leader first: open $13,461.00 above paid-but-unattempted $1,756.00. ASC is a correct query answering the opposite question — it hands ops the smallest class first.",
        },
      ],
      distractors: ["INNER", "id", "IS NOT", "ASC"],
      walkthrough:
        "The 9am sweep is an anti-join wearing a business hat. LEFT JOIN keeps all 28 batches; the 22 with attempts match, the 6 without survive with NULL attempt columns, and WHERE p.id IS NULL keeps exactly the unmatched side. GROUP BY status splits the classes: open → 5 batches / $13,461.00, paid → 1 batch / $1,756.00 — that's #28, the paid-but-unattempted anomaly — summing to the probed 6 / $15,217.00. The split matters because the classes route differently: open batches go to the collections pipeline, a paid batch with no attempt goes to engineering. Watch the near-miss the sweep exists to catch: open-but-attempted batch #25 ($4,000.00 of $6,148.00 attempted) is NOT here — it has an attempt, so it fails the IS NULL test; 'open' and 'unattempted' are different populations that happen to share a vibe. The distractors fail exactly where the craft lives: INNER deletes the unmatched side (0 rows — an all-clear on $15,217.00 of exposure), p.id as the join key mispairs row ids, IS NOT NULL flips the sweep to the 22 covered batches, and ASC hands ops the $1,756.00 class first. LEFT, key, IS NULL, DESC — the sweep, in four decisions.",
    },
    {
      id: "cs-adyen-3",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The issuance walk",
      brief:
        "Board memo, growth review: the batch book issues in waves and the deck wants the walk, not the waterfall. Stage a monthly fold over batch issuance — 13 months, 2024-02 through 2025-02 — and walk it with LAG: per month, batches issued, dollars issued, and the previous month's dollars alongside. The peak is 2025-01 at $11,085.00 across 2 batches; the first month has no previous, and the walk says so honestly.",
      ask: "Return the 13-month issuance walk: month, batches, issued dollars (2 decimals), and the prior month's issued dollars via LAG, oldest first.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR({1}, 1, 7) AS month,\n         COUNT(*) AS batches,\n         SUM(amount_cents) AS issued_cents\n  FROM invoices\n  GROUP BY month\n)\nSELECT month,\n       batches,\n       ROUND(issued_cents / 100.0, 2) AS issued_usd,\n       ROUND({2}(issued_cents) OVER (ORDER BY month) / 100.0, 2) AS prev_usd\nFROM monthly\nORDER BY month {3}\nLIMIT {4};",
      slots: [
        {
          answer: "issued_on",
          kind: "keyword",
          label: "the issuance timestamp",
          why: "Issuance buckets by when the batch was issued — `issued_on`. Bucketing `due_on` instead walks the terms calendar (issued + 30 days), shifting most batches into the next month and answering a question nobody asked.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the previous-row function",
          why: "LAG(issued_cents) reads the prior month's fold — the walk's engine. LEAD points forward: the 'previous' column would carry next month's dollars and every delta narrates the wrong direction.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the oldest-first order",
          why: "A walk starts at the spine's head: 2024-02 first, NULL anchor visible. DESC prints the same rows backwards — correct data, unreadable walk, and the peak lands on top where a trend chart would lie.",
        },
        {
          answer: "13",
          kind: "number",
          noVerify: true,
          label: "the full spine",
          why: "13 issuance months exist (2024-02 through 2025-02) and LIMIT 13 prints the whole spine. It never appears as a result cell — it's the read size, not a figure the query computes.",
        },
      ],
      distractors: ["due_on", "LEAD", "DESC", "12", "5"],
      walkthrough:
        "Two stages, one definition. The CTE folds the book once: SUBSTR(issued_on, 1, 7) buckets 28 batches into 13 months; COUNT reads 1–3 batches per month (the quietest is 2024-04 at a single $5,284.00 batch; 2024-10, 2024-12 and 2025-02 peak at 3). The outer query converts once — ROUND(issued_cents / 100.0, 2) — and lets LAG(issued_cents) OVER (ORDER BY month) carry the previous month forward: 2024-03 reads $7,003.00 where 2024-02 reads NULL, 2025-01 reads $8,830.00, and the biggest swing prints where you'd look for it — 2025-01 issued $11,085.00, then 2025-02 gave back $2,973.00. The first row's NULL is the honest anchor, not a hole (filter it and the board silently loses a month). The distractors fail where the craft lives: due_on re-buckets onto the terms calendar, LEAD walks the future first, DESC reads the spine backwards, and 12 or 5 truncate the walk mid-story. Stage, fold once, walk the fold — never window over raw batches.",
    },
    {
      id: "cs-adyen-4",
      tier: "hard",
      topic: "s6",
      universe: "month-close",
      title: "The coverage census, four classes",
      brief:
        "Close-night memo from settlement ops: the coverage census grows a fourth class this quarter. Fold attempts per batch (LEFT JOIN, one row per batch), then CASE the fold: fully attempted = exact; never attempted = no-attempt; attempted below book = partial; and the new contradiction arm — attempted_cents IS NULL but the book says paid — is 'paid-no-attempt', because batch #28 ($1,756.00) is booked paid with zero attempts behind it and must not hide inside the generic class. The four class counts must reconcile to 28.",
      ask: "Return one row per coverage class — class name, batch count, and book dollars at 2 decimals — biggest classes first.",
      template:
        "WITH folded AS (\n  SELECT i.id, i.status, i.amount_cents,\n         SUM(p.amount_cents) AS attempted_cents\n  FROM invoices i\n  LEFT JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n)\nSELECT CASE\n         WHEN attempted_cents IS NULL AND status = {1} THEN 'paid-no-attempt'\n         WHEN attempted_cents IS NULL THEN 'no-attempt'\n         WHEN attempted_cents {3} amount_cents THEN 'exact'\n         ELSE {2}\n       END AS coverage,\n       COUNT(*) AS batches,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS book_usd\nFROM folded\nGROUP BY coverage\nORDER BY batches {4};",
      slots: [
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the contradiction arm's status",
          why: "The contradiction is specifically a PAID batch with no attempt: status = 'paid' scopes the arm to #28. 'open' or 'void' here makes the arm unfireable — the paid-but-unattempted batch collapses into the generic no-attempt class and the census loses its loudest finding.",
        },
        {
          answer: "'partial'",
          kind: "keyword",
          label: "the mismatch class",
          why: "ELSE catches the one batch attempted below its book value — #25, $4,000.00 of $6,148.00. Pointing ELSE at 'exact' merges the 21 clean batches with the shortfall and the partial pipeline disappears from the packet.",
        },
        {
          answer: "=",
          kind: "keyword",
          label: "the coverage equality",
          why: "Exact means attempted equals booked: `=`. '<' inverts the test — the 21 clean batches fall through to ELSE 'partial' (22 of them) and 'exact' never prints at all.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-class-first order",
          why: "Ops reads the majority class first: exact's 21 batches lead, the two one-batch anomalies trail. ASC hands the reader the exceptions first and buries the population the census certifies.",
        },
      ],
      distractors: ["'open'", "'void'", "'exact'", "<>", "ASC"],
      walkthrough:
        "Stage the fold, branch the story. The CTE LEFT JOINs attempts to batches and folds per batch — SUM over an attempt-less batch yields NULL, which is the signal, so don't COALESCE it mid-pipeline. The CASE reads top-down: attempted_cents IS NULL AND status = 'paid' catches #28 (the contradiction: booked paid, zero attempts, $1,756.00); the bare IS NULL arm catches the 5 genuinely unattempted open batches ($13,461.00); attempted_cents = amount_cents certifies 21 exact ($65,612.00); and ELSE files the single partial — #25, $4,000.00 attempted of $6,148.00 booked. Four classes, 21 + 5 + 1 + 1 = 28, dollars summing to the $86,977.00 book: the census reconciles or it doesn't ship. Two subtleties worth saying in review: #11 (void-but-attempted, $925.00) files under exact here — its attempt equals its book value — because coverage equality and lifecycle legality are different questions; and the arm order is load-bearing, since the bare IS NULL arm would swallow #28 if it ran first. The distractors break exactly those joints: 'open' or 'void' in the contradiction arm make it unfireable, 'exact' in ELSE merges the 21 clean with the shortfall, '<' flips the equality so 22 batches read partial and 'exact' vanishes, ASC buries the majority class.",
    },
    {
      id: "cs-adyen-5",
      tier: "medium",
      topic: "q5",
      universe: "fraud",
      title: "The split-attempt register",
      brief:
        "Risk memo: five batches on the book draw two authorization attempts each — the split-attempt pattern (double processing cost, and the standing fan-out trap in every fold). Build the register: fold attempts per batch in a derived table, join back to the batch book, and keep only folds reading exactly 2. On this db the register lands on batches #1, #5, #12, #19, #22 — all paid, all reconciling to the penny. Amounts are INTEGER cents: /100.0 for dollars.",
      ask: "Return the split-attempt register: batch id, attempt count, batch number, status, booked and attempted dollars (2 decimals), in batch-id order.",
      template:
        "SELECT s.invoice_id,\n       s.attempts,\n       i.number,\n       i.status,\n       ROUND(i.amount_cents / 100.0, 2) AS batch_usd,\n       ROUND(s.attempted_cents / 100.0, 2) AS attempted_usd\nFROM (SELECT invoice_id, {1}(*) AS attempts, SUM(amount_cents) AS attempted_cents\n      FROM payments\n      GROUP BY invoice_id) s\nJOIN invoices i ON i.id = s.invoice_id\nWHERE s.attempts = {2}\nORDER BY s.invoice_id {3};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the attempt counter",
          why: "The fold counts attempt rows per batch: COUNT(*). SUM(invoice_id) adds primary keys — a number that changes when any batch gains an attempt — and MAX(invoice_id) returns the id itself, so the gate below reads a key, not a count.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the split gate",
          why: "Exactly 2 attempts is the split signature on this book: 5 of the 22 covered batches qualify, and the cell reads 2 on every register row. The gate is the anomaly filter — drop it and the register prints all 22 covered batches.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the register order",
          why: "The register reads in batch-id order so it can be diffed against the known five (#1, #5, #12, #19, #22) run over run. DESC would print the same rows in reverse — a different document every night.",
        },
      ],
      distractors: ["SUM", "MAX", "1", "3", "DESC"],
      walkthrough:
        "One derived fold, one join, one gate. The derived table folds 27 attempts to 22 covered batches — invoice_id, COUNT(*) as attempts, SUM(amount_cents) as attempted cents — and the join back to invoices books each fold against its batch. WHERE attempts = 2 keeps the five splits: #1 ($4,860.00 booked, $4,860.00 attempted), #5 ($5,284.00), #12 ($4,723.00), #19 ($5,614.00), #22 ($4,459.00) — every row reconciling to the penny, which is the point: a split batch that DIDN'T reconcile would be the page. Say the boundary out loud: 'exactly 2' and 'at least 2' are the same query on this data (no batch draws three) and wrong the day one does. The near-misses that must not appear: #25 is open-partial — one attempt, $4,000.00 of $6,148.00 — a value anomaly, not a split; and #11 is void-but-attempted, a lifecycle anomaly that would surface here only if it drew a second attempt. The distractors fail at the fold and the gate: SUM or MAX turn the counter into key arithmetic, 1 prints the 17 single-attempt batches, 3 prints nothing (an empty register on a book that ships splits is a broken gate, not an all-clear), and DESC breaks the run-over-run diff.",
    },
    {
      id: "cs-adyen-6",
      tier: "easy",
      topic: "t5",
      universe: "month-close",
      title: "The settlement-clock leaderboard",
      brief:
        "Ops wants the settlement clock on the wall: every paid batch ranked by how fast its first attempt landed. Stage the clock — MIN over JULIANDAY(paid_on) minus JULIANDAY(issued_on) per batch (first attempt, never every split row) — then rank fastest-first. The spread is 13 to 84 days across 20 batches, and the middle of the ladder is a 25-day tie band where seven batches share one rank. Pick the rank function that says so.",
      ask: "Return the 20-batch leaderboard: batch number, settle days (1 decimal), and rank, fastest first, ties sharing a rank.",
      template:
        "WITH staged AS (\n  SELECT i.id, i.number,\n         MIN(JULIANDAY(p.paid_on) - JULIANDAY(i.issued_on)) AS days\n  FROM invoices i\n  JOIN payments p ON p.invoice_id = i.id\n  WHERE i.status = {1}\n  GROUP BY i.id\n)\nSELECT number AS batch_number,\n       ROUND(days, 1) AS settle_days,\n       {2}() OVER (ORDER BY days) AS rank_no\nFROM staged\nORDER BY rank_no, number\nLIMIT {3};",
      slots: [
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the settled population",
          why: "The clock times paid batches only — 20 of the 21 paid (#28 has no attempt to time). 'open' stages one batch (#25, the partial) and 'void' stages #11; both read as leaderboards of the wrong population.",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie-aware rank",
          why: "Seven batches tie at 25 days and RANK gives them all rank 7 — the truth. ROW_NUMBER numbers them 7 through 13, an order the data doesn't contain; DENSE_RANK agrees inside the band but continues at 8, hiding the band's width.",
        },
        {
          answer: "20",
          kind: "number",
          noVerify: true,
          label: "the full ladder",
          why: "20 paid-with-attempt batches exist and LIMIT 20 prints the whole ladder, slowest (#INV-2024-017, 84 days) last. It's the read size, not a computed figure — that's why it's flagged.",
        },
      ],
      distractors: ["'void'", "'open'", "ROW_NUMBER", "DENSE_RANK", "14"],
      walkthrough:
        "Stage the clock, then rank the staged rows. The CTE joins batches to attempts and folds MIN(JULIANDAY(paid_on) − JULIANDAY(issued_on)) per batch — first attempt only, so split batches (#1, #5, #12, #19, #22) contribute one clock each, not two. WHERE status = 'paid' stages exactly 20 batches; the outer query rounds once and ranks over ORDER BY days: INV-2024-005 leads at 13.0 days, INV-2024-001 follows at 15.0, and the ladder's middle is the tie band — seven batches at 25.0 sharing rank 7, then the four 26-day batches at rank 14 (RANK skips by band width), then 40.0, 55.0 and the 84.0 tail. The window ORDER BY is days alone: add the id tiebreak THERE and every row becomes its own peer, the tie dissolves, and RANK silently degrades into ROW_NUMBER — the tiebreak belongs in the display sort (rank_no, number), not the ranking. The distractors fail at the population and the band: 'open' or 'void' stage one-batch leaderboards, ROW_NUMBER invents a strict order inside the 25-day band, DENSE_RANK flattens the skip at 14, and 14 cuts the ladder mid-band.",
    },
  ],

  problems: [
    { slug: "transaction-velocity", why: "Adyen-tagged: burst detection in fixed time buckets — attempts-per-minute spikes per merchant are the velocity rule that fires before a human ever looks at the exception queue." },
    { slug: "gl-reconciliation", why: "Adyen-tagged: two folds that must agree, and the delta query that localizes the row that broke the clearing ledger — the reconciliation reflex this kit's ledger topics drill." },
    { slug: "chargeback-rate-ranking", why: "Adyen-tagged: rate-per-entity with a HAVING gate — the dispute-rate board risk ranks per merchant, where the denominator is the whole test." },
    { slug: "snapshot-delta-detect", why: "Adyen-tagged: FULL OUTER diff between rail file and batch book — batches on one side only, attempts past the cut: the nightly snapshot compare, taught as a join." },
    { slug: "number-of-rich-customers", why: "COUNT(DISTINCT) over a money threshold — the merchants-above-a-volume-floor census risk screens warm up with, counted once no matter how many attempts they shipped." },
    { slug: "monthly-transactions-i", why: "Month-bucket totals with a status-conditional count alongside — the settlement calendar settlement ops opens every close with, in graded form." },
    { slug: "customers-who-never-order", why: "The anti-join exposure read — batches with no attempt row (6 of them, $15,217.00 on this db): LEFT JOIN + IS NULL is the sweep, in drill form." },
    { slug: "bank-account-summary", why: "LEFT JOIN with zero-filled coverage — per-batch attempted versus not, where the NULL side is the finding and the fold must not collapse it." },
    { slug: "trial-balance-check", why: "Debits-equal-credits in one conditional SUM — the clearing-ledger reflex this kit's case studies reward; the delta is the only metric allowed to be boring." },
    { slug: "duplicate-charge-pairs", why: "Self-join duplicate scan over close timestamps — the same-attempt-same-second pair finder risk runs nightly, canonicalized with < so pairs count once." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one pass with the 100.0-before-division fix — the honest-denominator habit every authorization percentage here needs." },
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded share where unmatched rows count as zero — NULL policy and rounding discipline in one deliverable, the coverage-share shape." },
    { slug: "second-highest-salary", why: "Threshold subqueries on money columns — 'above the platform-average attempt' is a scalar subquery with an empty-inner edge case the rails produce weekly." },
    { slug: "maximum-transaction-each-day", why: "Argmax per day over attempt amounts — the largest authorization in each settlement window, fold and window in one query." },
    { slug: "count-salary-categories", why: "CASE tiers stacked with UNION ALL totals — coverage-class censuses whose branches must reconcile to COUNT(*) before the packet ships." },
    { slug: "symmetric-pairs", why: "Pair canonicalization with < — the same orientation discipline the split-attempt scan needs so five split batches read five, not ten." },
    { slug: "ar-aging-schedule", why: "The 6 open batches ($19,609.00) bucketed by age against 30-day flat terms — the AR schedule finance reads at close, in drill form." },
    { slug: "settlement-fails-aging", why: "T+2 aging on settlement fails — the day-count discipline the 84-day slowest batch (INV-2024-017) makes non-hypothetical." },
    { slug: "expected-credit-loss", why: "Weighted provision over exposure bands — the unattempted $15,217.00 is the balance this math prices, taught on a sandbox." },
    { slug: "delinquency-buckets", why: "DPD-style CASE buckets — days-past-due against the 30-day terms wall, the same CASE shape the four-class coverage census uses." },
    { slug: "amount-anomaly-zscore", why: "Attempt amounts against baseline sigma — the statistical cousin of the $925.00 void-but-attempted catch in the exception queue." },
    { slug: "structuring-detection", why: "HAVING guards under thresholds — risk's velocity wall, where the gate is the query and the gate must fire on the right grain." },
    { slug: "suspicious-bank-account-transactions", why: "Sliding-window scan over an account's attempt stream — burst rules in window-frame form, the frame-aware sibling of the velocity topic." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "LAG flags on consecutive rows — the attempt-sequence pattern risk reads as escalation, drilled on a transaction stream." },
    { slug: "mrr-waterfall", why: "LAG movement classification — the same movement grammar the issuance walk's delta column speaks, classified instead of printed." },
    { slug: "deferred-revenue", why: "Recursive revenue spread over service windows — terms are 30 days flat here; the schedule math generalizes past that." },
    { slug: "fx-exposure-report", why: "Latest-rate join per currency rail — the as-of discipline multi-currency settlement runs on nightly, with the tie-breaks the argmax topic drills." },
    { slug: "daily-balance-interest", why: "Date-spine accrual over the cash account's $44,196.00 net — balance walks with interest attached, spine discipline included." },
    { slug: "journal-gap-detection", why: "Gap detection in a journal sequence — the ledger's 80 entries must be dense; a missing sequence number is a finding, not noise." },
    { slug: "balance-rollforward", why: "Opening + movement = closing, per account — the close-checklist shape the per-account nets (cash, receivables) feed." },
    { slug: "late-arriving-restatement", why: "Watermark discipline when a rail file restates — why the census re-runs, what's allowed to move, and what the board must be told changed." },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER dedupe on re-sent rail rows — the tie-broken keep-latest every attempt stream needs before any fold trusts it." },
  ],
};
