// PayPal — kit 2 of the Fintech & Payments domain (Batch E).
// Two-sided wallets at global scale: a buyer and a seller sit on opposite
// sides of every payment, funding can split across sources (balance plus
// card backup), and disputes run on a 30-day clock. Pool provenance: the
// registry tags 5 PayPal SQL problems — ALL 5 land in this kit (topics +
// problems); the remaining slots are theme-curated fills from the SQL band
// (wallet folds, two-sided reads, dispute-window date math, split-tender
// self-joins), stated here per spec.
// Case studies run on the storefront db with probed figures from
// scripts/company-facts.md (probed 2026-10-12). The mapping is honest:
// invoices = charges, payments = settlements/payouts, ledger_entries = the
// wallet ledger. Money columns are INTEGER cents; the facts file prints
// dollars — the read is amount_cents / 100.0.

import type { CompanyKit } from "../types";

export const paypalKit: CompanyKit = {
  id: "paypal",
  domainId: "fintech",
  name: "PayPal",
  tagline: "Two-sided wallets at global scale",
  accent: "text-cyan-400",

  brief: [
    "PayPal is the two-sided wallet network: hundreds of millions of accounts with a buyer and a seller on opposite sides of every payment, funding drawn from balance, card or bank — and sometimes split across two sources at once. Money sits in wallets, which means the ledger is the product: a wallet balance is a query result, not a stored opinion. On this app's storefront db the mapping is honest — `invoices` are charges (28), `payments` are settlements or payouts (27 rows covering 22 charges; five charges settle as two rows, the split-funding signature), and `ledger_entries` is the wallet ledger (80 rows; debits $181,080 equal credits $181,080). Money columns are **INTEGER cents**; every dollar read is `amount_cents / 100.0`.",
    "The data org runs on three engines: risk (velocity rules, anomaly baselines, z-scores against an account's own history), dispute operations (chargebacks on a clock — payment terms here run 30 days flat), and wallet accounting, whose daily bread is the reconciliation the db's verified anomalies mirror: five split-payout charges (**#1, #5, #12, #19, #22** — $4,860, $5,284, $4,723, $5,614, $4,459), one {amber:partial} payout ($4,000.00 of a $6,148.00 charge), a {rose:void}-but-payout charge (#11, $925.00) and a paid charge with {orange:no payout} (#28, $1,756.00). Days-to-payout averages 28.4 with a 13-to-84 spread; unsettled exposure sits at **$15,217 across 6 charges**.",
    "Interview style is correctness-first and two-sided. Screens open with a wallet fold (credit/debit per account, cents handled), move to a survival question — which side of the join survives, and are the orphans bugs or the business — then escalate into {violet:split-tender self-joins} (pairs that must rebuild the charge total), z-score anomaly baselines built in staged folds, and ratio questions where integer division and **denominator drift** are the graded failures. The house habits transfer anywhere: NULL policy stated out loud, the `100.0` that makes division real, ROUND once at the end, and every multi-branch census reconciled against a plain `COUNT(*)`.",
    "Preparation: the registry tags **5 PayPal SQL problems** and all 5 land in this kit; the rest of the 30 topic slots and 11 of 16 problems are theme-curated from the SQL band — two-sided reads, wallet statements, event-gap windows — because that is the screen's shape. Work the topics in order, then run both case studies on the live storefront db: one rebuilds the **payout clock** (days from charge to first settlement, paid charges only — **20 charges, 28.4-day average**), the other rebuilds the {violet:split-tender scan} (pair the two payout rows, prove each pair rebuilds its charge exactly). Say the units and the tie-break out loud; in this building the cents and the join order are the interview.",
  ],

  dayInLife: [
    "**08:15 —** The morning opens on two queues in parallel: the settlement file and the dispute queue. First query is always the same reconciliation — do last night's payout rows agree with the charges they claim (method mix on the sample db: card **16 payouts / $37,364**, wire **11 / $32,248**), and what fell into the exception classes overnight ({rose:void}-but-payout, paid-but-unpaid, {amber:partial})? A wallet network lives or dies on trust, and trust is a reconciliation delta: $0.00, every morning, or a page.",
    "**11:00 —** Midday is two-sided translation. A seller-experience team wants payout lag by region (**28.4 days average, 13-to-84 spread** — is the slow tail a funding-source problem?); a buyer team wants refund windows inside the **30-day dispute clock**; risk wants the {violet:split-tender scan} rerun with the day's new payouts — pair every two-row charge, prove the halves rebuild the total. Each ask is a join with a survival rule (which side's orphans are the answer?), a conditional aggregate with a stated denominator, and a tie-break — because two payout rows that share a timestamp are the norm here, not the edge case.",
    "**15:00 —** The afternoon closes the wallet ledger. Trial balance first — **debits $181,080, credits $181,080, delta $0.00** — then the per-account nets (**cash $44,196**, **receivables $16,440**) that feed the accounting handoff. Every number ships with its query attached and its units printed (INTEGER cents, `/100.0` at the edge); every re-run is idempotent.",
    "**17:30 —** EOD writeup, and the rhythm to internalize: at PayPal the money moves both directions all day, so every query is asked twice — *once per side* — and the analyst who states which side they're on is the one whose numbers survive review. Every multi-branch census still reconciles against `COUNT(*)` before it ships; the writeup freezes the day's definitions so tomorrow's run compares like against like.",
  ],

  metrics: [
    { name: "Payment success rate", what: "Approved payments ÷ attempted payments, per funding source and region. The two-sided funnel's top gate — a funding-source-specific drop is the first incident this team sees." },
    { name: "Split-tender share", what: "Charges settled as two or more payout rows ÷ covered charges — 5 of 22 on the db. The split-funding signature, found with a canonicalized self-join and proven by pairs that rebuild the charge total." },
    { name: "Days to payout", what: "Charge → first settlement, in days: 20 paid charges averaging 28.4, fastest 13, slowest 84 here. First settlement, never last — the seller's cash-flow clock." },
    { name: "Dispute rate", what: "Disputed ÷ settled charges, watched inside the 30-day terms window. A ratio where the denominator is the whole test and integer division is the classic leak." },
    { name: "Refund rate", what: "Refunded ÷ captured volume. Reverse money flow: every refund is a payout in the other direction, and both sides of the wallet ledger must agree it balances." },
    { name: "Unsettled balance", what: "Dollar value of charges with no payout row: $15,217 across 6 charges — measured over ALL charges, not the paid-out ones. The float finance defends at close." },
    { name: "Funding mix", what: "Payout volume by funding source: card $37,364 over 16 events versus wire $32,248 over 11 on the db. The mix that decides where risk rules and reserve policies tighten." },
    { name: "Wallet ledger delta", what: "Total debits − total credits across ledger_entries. Must read $0.00 ($181,080 both sides here) — the wallet's whole promise in one number." },
  ],

  topics: [
    {
      name: "Wallet folds on integer cents",
      why: "A wallet is a fold: money in, money out, net per account — all on INTEGER cents where /100.0 is the dollar read and integer division is the standing leak. PayPal screens open here because a fold that sums keys or truncates cents is worse than no fold at all.",
      slugs: ["bank-account-summary-ii", "total-traveled-distance", "trial-balance-check"],
    },
    {
      name: "Two-sided joins: who survives",
      why: "Every payment has a buyer side and a seller side, and each report decides which side survives the join. INNER shrinks to matched pairs; LEFT keeps the unmatched — which on this db is the whole unsettled census (6 charges, $15,217). The trap: filtering the right table in WHERE converts the LEFT JOIN to an INNER silently.",
      slugs: ["combine-two-tables", "employee-bonus", "customers-who-never-order"],
    },
    {
      name: "Month buckets & status-aware counts",
      why: "Payout calendars bucket by SUBSTR(paid_on, 1, 7) with a status-conditional count riding in the same fold. PayPal drills single-scan censuses — branches that must reconcile to COUNT(*) — because the wallet report ships daily, not quarterly, and a two-scan drift shows up as two truths.",
      slugs: ["monthly-transactions-i", "count-the-number-of-experiments", "the-latest-login-in-2020"],
    },
    {
      name: "Split tenders & self-joins",
      why: "Split funding is PayPal's signature: one charge, two payout rows — five such charges on this db. Finding them is a self-join with canonicalization (p1.id < p2.id keeps one pair; <> double-counts both orientations), and the audit is the WHERE: the pair must rebuild the charge total exactly.",
      slugs: ["duplicate-charge-pairs", "symmetric-pairs", "most-common-course-pairs"],
    },
    {
      name: "Anomaly baselines & outliers",
      why: "Risk doesn't chase absolute amounts; it chases distance from an account's own baseline — mean and sigma computed in a staged fold, then z-scores per row. The subquery shapes that build baselines (scalar, derived) and their empty-inner edge cases are the screen's favorite escalation.",
      slugs: ["amount-anomaly-zscore", "second-highest-salary", "station-median"],
    },
    {
      name: "UNION ALL packets for two-sided reports",
      why: "Buyer-side and seller-side views ship as stacked packets: same columns, labelled branches, UNION ALL — never UNION, whose dedupe would mask a definition bug by deleting the evidence. Position-matching discipline is the whole test; set ops bind columns by position, not by name.",
      slugs: ["monthly-transactions-ii", "team-scores-in-football-tournament", "count-salary-categories"],
    },
    {
      name: "Latest-event windows per account",
      why: "Wallet pages render 'last activity' rails: latest payouts per account, peak payout per day, ties broken deterministically. ROW_NUMBER over a PARTITION with an id tie-break is the shape; the bare MAX-join-back doubles rows on timestamp ties, which split funding makes routine.",
      slugs: ["the-most-recent-three-orders", "maximum-transaction-each-day", "rank-scores"],
    },
    {
      name: "LAG/LEAD event gaps",
      why: "Dispute spacing and payout gaps are window math: LEAD between consecutive events per account, gaps measured not assumed. The deterministic ORDER BY inside OVER is what makes the sequence legal evidence — a walk that reorders between runs is not a metric.",
      slugs: ["biggest-window-between-events", "second-day-confirmation", "consecutive-transactions-with-increasing-amounts"],
    },
    {
      name: "Honest ratios & NULL policy",
      why: "Dispute and refund shares die two ways: integer division (100 must be 100.0) and NULL drift (a coalesced zero mid-pipeline launders an exception into a clean-looking number). PayPal's bar: the denominator stated out loud, the NULL policy stated out loud, rounding once at the display edge.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "calculate-special-bonus"],
    },
    {
      name: "Settlement-clock date math",
      why: "Payout terms run 30 days flat on this db (every due_on − issued_on = 30), and days-to-payout averages 28.4 with a 13-to-84 spread. JULIANDAY diffs, half-open month windows, and one final ROUND are the toolkit — BETWEEN on the last day loses the night, which is exactly when month-end payouts land.",
      slugs: ["users-with-two-purchases-within-seven-days", "leetflex-banned-accounts", "list-the-products-ordered-in-a-period"],
    },
  ],

  theory: [
    {
      id: "paypal-t1",
      q: "Every payment is a debit on one side and a credit on the other. Walk me through folding a wallet ledger so the math proves itself.",
      a: "The fold is per account, two conditional sums: SUM(debit_cents) and SUM(credit_cents), net as the difference, dollars as /100.0 at the edge — and then the self-check: the global trial balance must read zero, $181,080 = $181,080 on this db. A wallet ledger that doesn't balance isn't a reporting problem, it's a data problem, and the delta query is how you prove it in one pass. The habits being graded: fold money with SUM and rows with COUNT (never SUM of keys), convert cents exactly once, and print the delta beside the totals so the reader doesn't have to trust you. At PayPal the ledger IS the product — a wallet balance is a query result, not a stored opinion — so the fold's correctness is the feature. The two-sided twist: buyer-side and seller-side folds must agree with each other too, not just internally, and when they don't, the diff query localizes which side moved.",
      tag: "aggregation",
    },
    {
      id: "paypal-t2",
      q: "Buyer activity and seller activity live on opposite sides of every payment. When do you INNER JOIN and when LEFT — and what silently changes under a WHERE clause?",
      a: "Decide from the survival rule the question implies. 'Payouts per charge' is INNER — a payout without a charge is corruption worth flagging, not a row to keep quietly. 'Charges and their payouts, including charges still waiting' is LEFT from charges — the unmatched charges ARE the answer, arriving with NULL payout columns, and on this db that's the unsettled census: 6 charges, $15,217. The silent change: filter the right table's column in WHERE and the NULL-payload rows fail the test — LEFT collapses to INNER and the exceptions vanish while the row count looks plausible (6 open charges is not 6 unsettled charges: $19,609 versus $15,217 here). Predicates on the right side go in ON, or you accept inner semantics deliberately and say so. The two-sided discipline is stating, per join, which side can have orphans — and whether the orphans are bugs or the business.",
      tag: "joins",
    },
    {
      id: "paypal-t3",
      q: "A charge with no payout row shows payout_date as NULL. Filter it, coalesce it, or report it — and where does each choice go wrong?",
      a: "Report it — the NULL is the float, the outstanding balance, the thing finance defends. The classification query keeps every charge and CASEs the join result: exact, partial, none (21 / 1 / 6 on this db). Filtering is sometimes right — payout velocity genuinely measures paid charges — but then say the population: 'the 22 charges with payouts', because 28 minus 22 is the story that filter just deleted. Coalescing is display-only: COALESCE(days_waiting, 'not yet paid') at the edge is honest; COALESCE mid-pipeline turns a paid-but-never-paid charge into a zero-day payout that reads as a perfectly healthy wallet. Detection is IS NULL — never = NULL, which fails against itself. The senior move is refusing to let the three choices blur: filter with a stated population, coalesce with a stated display rule, and ship the exception counts beside whatever you kept.",
      tag: "nulls",
    },
    {
      id: "paypal-t4",
      q: "You need funding methods whose dispute rate clears 1%. WHERE or HAVING — and what does the clause choice say about the metric's grain?",
      a: "HAVING — the rate is a property of a group, and groups don't exist until after folding. WHERE runs before aggregation, when no rate exists yet; the per-row facts (disputed flag, method) are all it can see. The honest shape computes both sides in one fold — 100.0 * SUM(disputed_flag) / COUNT(*) AS dispute_pct, then HAVING dispute_pct > 1 — numerator and denominator from the same population, so the gate can't drift. The trap the follow-up hunts: a candidate filters settled rows in WHERE to 'clean the data', the denominator shrinks to the numerator's world, every surviving method's rate inflates, and the gate fires on an artifact. Related discipline: the alias is born in SELECT, so portable SQL repeats the expression in HAVING rather than trusting dialect-specific alias resolution. Say the grain first — 'one row per funding method, rate per settlement event' — and the clause picks itself.",
      tag: "pipeline",
    },
    {
      id: "paypal-t5",
      q: "First payout per charge, when two payout rows can share a timestamp. What breaks with the MAX-join-back, and what's the complete fix?",
      a: "Bare MAX(paid_on) joined back returns BOTH tied rows — the 'first payout' set has two rows for that charge, and every downstream count doubles; on split-funding charges with same-day halves, ties are the norm, not the edge case. The complete fix is ROW_NUMBER() OVER (PARTITION BY invoice_id ORDER BY paid_on, id) = 1 — the id is the deterministic tie-break that makes 'first' reproducible instead of engine-arbitrary. If you only need the timing, skip row-picking entirely: MIN(JULIANDAY(paid_on) - JULIANDAY(issued_on)) folded per charge gives the payout clock — 20 paid charges, 28.4-day average, 13-to-84 spread on this db. Choose by output: other payout columns means window; timing alone means aggregate. Either way, say the tie rule out loud — 'first by paid_on, then lowest id wins' — because a first-payout metric whose tie rule changes between runs is not a metric, it's a random number generator with a dashboard.",
      tag: "windows",
    },
    {
      id: "paypal-t6",
      q: "You're flagging payouts whose z-score against the account's own baseline clears 3. How do you build the baseline — and what does the math do when an account has one payout?",
      a: "Two stages, two grains: a derived fold computes mean and sigma per account — AVG(amount_cents), and the population formula SUM((x − mean)²) / COUNT — then the outer query joins back and computes (x − mean) / sigma. The denominator question is the interview's favorite: population sigma versus sample sigma changes the flag set, so say which you chose and why (population, for a complete ledger). The edge case is real money: an account with one payout has sigma 0 — division by zero, which SQLite returns as NULL, silently unflagging the most anomalous row in the table; the guard is NULLIF(sigma, 0) with a stated policy for the NULL. And the empty-inner case still applies: a filtered baseline with no rows yields a NULL scalar, and every z-score against NULL is UNKNOWN — an anomaly report that ships empty while looking healthy. The strong answer stages the fold in a named CTE — account_baseline — because 'baseline' is a definition, and definitions live in names, not in vibes.",
      tag: "subqueries",
    },
    {
      id: "paypal-t7",
      q: "Dispute windows run on a clock: terms are 30 days flat on this db, days-to-payout averages 28.4. How do you compute windows, bucket months, and where does BETWEEN betray you?",
      a: "Windows are JULIANDAY diffs: due_on − issued_on = 30 for every charge here — verify it with a MIN/MAX fold rather than trusting the docs, because one 27-day outlier would be the finding. Days-to-payout is MIN(paid) − issued per charge, averaged, then ROUND(..., 1) once at the end: 28.4 with a 13-to-84 spread. Month buckets: STRFTIME('%Y-%m', paid_on) or SUBSTR(paid_on, 1, 7) — the SUBSTR shortcut survives only while the column stays fixed-width ISO, a convention nothing in the column enforces. And BETWEEN is inclusive both ends: paid_on BETWEEN '2024-03-01' AND '2024-03-31' silently drops every timestamp after midnight on the 31st — precisely when month-end payouts land. Half-open intervals — >= month start, < next month start — are the correct shape. State the timezone convention and the boundary rule before the query, because a dispute filed at 23:59 on day 30 is either inside or outside the window, and 'depends on the WHERE clause' is not an answer the ops team accepts.",
      tag: "dates",
    },
    {
      id: "paypal-t8",
      q: "Split funding means one charge can settle as two rows. How do you prove every split rebuilds its charge total — and localize the one that doesn't?",
      a: "The self-join scan: payments p1 JOIN payments p2 ON p2.invoice_id = p1.invoice_id AND p1.id < p2.id — the < canonicalizes, keeping one pair per unordered match where <> would count both orientations and double every sum. Then the audit predicate does the real work: WHERE p1.amount_cents + p2.amount_cents = i.amount_cents, charging the pair against the charge — on this db five pairs pass, each rebuilding its total exactly ($4,860.00, $5,284.00, $4,723.00, $5,614.00, $4,459.00). The rows that fail the WHERE ARE the localization: the partial $4,000.00-of-$6,148.00 charge never pairs into balance and shows up as the charge that vanished from the rebuilt set, not as an error. The deeper discipline: the clean query and the exception query must share the same join shape or the two reports aren't comparable; every fold runs on cents with /100.0 at the edge; and the pair count is stated before it's run — five charges, five pairs, or the scan explains the difference. 'Rebuild the total or surface the gap' is the whole reconciliation contract in one WHERE clause.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "paypal-mcq-1",
      prompt: "The payouts table has 27 rows, every amount_cents populated. Which expression counts PAYOUTS?",
      choices: ["SUM(amount_cents)", "COUNT(amount_cents)", "AVG(amount_cents)", "MAX(amount_cents)"],
      answer: 1,
      why: "COUNT(column) counts non-NULL values — 27 here, one per payout row. SUM, AVG and MAX fold the money column into dollars, not rows.",
      notes: [
        { choice: 0, why: "SUM returns total money moved ($69,612 on this db) — a dollar figure, not a count of events." },
        { choice: 2, why: "AVG is the mean payout in dollars — again a money metric, not a row count." },
      ],
      difficulty: "easy",
    },
    {
      id: "paypal-mcq-2",
      prompt: "Which expression buckets payouts by month on a TEXT timestamp like '2024-03-11'?",
      choices: ["SUBSTR(paid_on, 1, 7)", "SUBSTR(paid_on, 5, 2)", "MONTH(paid_on)", "LEFT(paid_on, 4)"],
      answer: 0,
      why: "SUBSTR(paid_on, 1, 7) slices the ISO string to '2024-03' — safe because the column is fixed-width ISO (a convention to state, not assume). STRFTIME('%Y-%m', paid_on) is the dialect-explicit twin.",
      notes: [
        { choice: 2, why: "MONTH() is other engines' syntax — SQLite has no MONTH function; the query errors instead of bucketing." },
        { choice: 3, why: "Four characters is the year '2024' — twelve months collapse into one bucket and the calendar disappears." },
      ],
      difficulty: "easy",
    },
    {
      id: "paypal-mcq-3",
      prompt: "27 payout rows cover 22 charges — five charges payout in two parts. Which pair of counts reports both grains honestly?",
      choices: [
        "COUNT(*) and COUNT(*)",
        "COUNT(*) and COUNT(DISTINCT invoice_id)",
        "SUM(id) and COUNT(*)",
        "COUNT(DISTINCT amount_cents) and COUNT(*)",
      ],
      answer: 1,
      why: "COUNT(*) = 27 payout events; COUNT(DISTINCT invoice_id) = 22 charges. Split payouts make the grains diverge, and a wallet report that prints one number where the business asked for the other is how double-counts ship.",
      notes: [
        { choice: 2, why: "SUM(id) adds primary keys — a number that changes when any charge gains a second payout row. Keys are for joining, never for folding." },
        { choice: 3, why: "DISTINCT amounts collapse two different charges that happen to payout equal sums — a coincidence, not a grain." },
      ],
      difficulty: "medium",
    },
    {
      id: "paypal-mcq-4",
      prompt: "FROM charges LEFT JOIN payouts … WHERE p.id IS NULL returns 6 charges, $15,217. A teammate rewrites it as WHERE i.status = 'open' — also 6 rows, but $19,609. What happened?",
      choices: [
        "Float rounding on the SUM",
        "The rewrite swapped populations: 'open' includes a partially-paid charge and misses a paid-but-never-paid one",
        "The LEFT JOIN duplicated rows",
        "Both queries are wrong; only INNER JOIN is valid here",
      ],
      answer: 1,
      why: "Status is an attribute of the charge; payout presence is a fact about the join. Charge #25 is open with $4,000 already paid; charge #28 is paid with zero payout rows. Same row count, different sets — verify row SETS, not row counts.",
      notes: [
        { choice: 0, why: "Nothing here is float math — both totals are exact integer-cent sums; the difference is which charges each filter keeps." },
        { choice: 2, why: "LEFT JOIN fans out on splits, it never duplicates unmatched charges — and both queries count charges, so fan-out can't explain $4,392." },
      ],
      difficulty: "medium",
    },
    {
      id: "paypal-mcq-5",
      prompt: "Wallet-share of payouts per funding method: which expression survives integer division AND keeps the denominator honest?",
      choices: [
        "SUM(CASE WHEN wallet THEN 1 ELSE 0 END) / COUNT(*) * 100",
        "100.0 * SUM(CASE WHEN wallet THEN 1 ELSE 0 END) / COUNT(*)",
        "100 * COUNT(wallet) / COUNT(*)",
        "100.0 * SUM(CASE ...) over rows pre-filtered to wallet in WHERE",
      ],
      answer: 1,
      why: "100.0 forces real division before truncation, and COUNT(*) over the same unfiltered fold is the denominator the numerator was built from. Filtering wallet rows in WHERE first is denominator drift: the 'share' divides by a population that excludes the event.",
      notes: [
        { choice: 0, why: "Same drift-free denominator — but the INTEGER 100 multiplies AFTER an integer division that already truncated; any share under 1% reads 0." },
        { choice: 2, why: "COUNT(wallet) counts non-NULLs of the column — nearly every row; the 'share' reads ~100 for any input." },
      ],
      difficulty: "medium",
    },
    {
      id: "paypal-mcq-6",
      prompt: "Anomaly scores tie between two accounts; the next score is lower. Which rank keeps the tie compact with no gaps?",
      choices: ["ROW_NUMBER", "RANK", "DENSE_RANK", "NTILE(4)"],
      answer: 2,
      why: "DENSE_RANK: tied scores share a rank and the next distinct score follows with no gap — 1, 1, 2. RANK keeps the gap (1, 1, 3); ROW_NUMBER deals arbitrary 1, 2, 3 across the tie, erasing it.",
      notes: [
        { choice: 1, why: "RANK is honest about the tie but inserts a gap — a flag list that skips 'rank 2' reads like a missing account." },
        { choice: 3, why: "NTILE buckets rows into quartiles — it partitions, it doesn't rank ties." },
      ],
      difficulty: "medium",
    },
    {
      id: "paypal-mcq-7",
      prompt: "WHERE account_id NOT IN (SELECT account_id FROM holds) — holds.account_id is nullable in the staging copy. The safe rewrites are…",
      choices: [
        "NOT EXISTS, or LEFT JOIN … WHERE h.account_id IS NULL",
        "IN (SELECT …) with a HAVING gate",
        "LEFT JOIN with WHERE p.amount > 0",
        "CROSS JOIN then filter",
      ],
      answer: 0,
      why: "One NULL in the NOT IN list makes every comparison UNKNOWN — the whole result empties, silently. NOT EXISTS and the LEFT JOIN + IS NULL anti-join are NULL-proof: unmatched rows survive as the answer.",
      notes: [
        { choice: 1, why: "IN flips the poison into a different shape, and HAVING gates groups, not membership — neither fixes the NULL." },
        { choice: 2, why: "Filtering the right table's column in WHERE converts the LEFT JOIN to an INNER — the opposite of an anti-join." },
      ],
      difficulty: "hard",
    },
    {
      id: "paypal-mcq-8",
      prompt: "WHERE amount_cents/100.0 > (SELECT AVG(amount_cents)/100.0 FROM payouts WHERE method = 'crypto') — no 'crypto' payouts exist on this db. Result?",
      choices: [
        "Every payout — the threshold reads 0",
        "No rows, silently — the empty scalar subquery yields NULL and amount > NULL is UNKNOWN",
        "A runtime error",
        "Only NULL-amount rows",
      ],
      answer: 1,
      why: "Scalar subqueries are 0-or-1 rows; zero rows evaluate to NULL — not 0, not an error. Every comparison against NULL is UNKNOWN, so WHERE passes nothing: an above-average report that ships empty. Check the inner fold's population first.",
      notes: [
        { choice: 0, why: "NULL is not a zero threshold — nothing compares TRUE against it; the report is empty, not unfiltered." },
        { choice: 2, why: "Zero rows is inside the scalar contract (0-or-1); two or more rows would be the error case." },
      ],
      difficulty: "hard",
    },
    {
      id: "paypal-mcq-9",
      prompt: "Five charges payout as two rows each. Which join condition guarantees exactly 5 unordered pairs — not 10, not 25?",
      choices: [
        "p1.id <> p2.id",
        "p1.id < p2.id",
        "p1.invoice_id = p2.invoice_id alone",
        "p1.id = p2.id",
      ],
      answer: 1,
      why: "< yields both orientations (10 pairs); bare charge equality pairs every row with every peer including itself (25 with self-pairs); = matches nothing but itself. p1.id < p2.id keeps one canonical orientation per unordered pair and excludes self-pairs in one stroke — the split-tender scan's canonicalization.",
      notes: [
        { choice: 2, why: "Charge equality alone is the fan-out: 2×2 per split charge = 4 pairs each, 20 total — pair sums double-count." },
        { choice: 0, why: "Close — but <> counts each pair twice; pair counts and pair-sum reports both double." },
      ],
      difficulty: "hard",
    },
    {
      id: "paypal-mcq-10",
      prompt: "Days-to-payout averages 28.4 across settled charges. The correct ROUND placement is…",
      choices: [
        "ROUND each row's latency, then AVG",
        "ROUND(AVG(latency), 1) once, at the end",
        "ROUND twice for safety",
        "ROUND inside the WHERE clause",
      ],
      answer: 1,
      why: "Rounding is display, applied once at the outermost fold. Per-row rounding perturbs the inputs before the average — ROUND(AVG(raw), 1) and AVG(ROUND(raw, 1)) are different numbers, and only the first is the honest 28.4.",
      notes: [
        { choice: 0, why: "Perturbed inputs average to a drifted value — the drift is small per row but systematic." },
        { choice: 3, why: "WHERE runs before aggregates exist — there's nothing to round yet; the query errors." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-paypal-1",
      tier: "medium",
      topic: "t3",
      universe: "month-close",
      title: "The payout clock: days to first settlement",
      brief:
        "Wallet-ops memo: sellers ask one question — when does the money move? Probed on the paid charges: 20 of the 21 paid charges carry settlement rows (the 21st, #28, is the paid-but-never-paid exception — that's the other census, not this one), and days from issue to FIRST settlement average 28.4, fastest 13, slowest 84. The clock is JULIANDAY(paid_on) − JULIANDAY(issued_on) per charge, first payout row only, rounded once at the end.",
      ask: "Return one row: settled charge count, average days to first settlement (1 decimal), fastest and slowest, over paid charges only.",
      template:
        "SELECT COUNT(*) AS settled_charges,\n       ROUND(AVG(first_days), {1}) AS avg_days_to_settle,\n       MIN(first_days) AS fastest,\n       MAX(first_days) AS slowest\nFROM (SELECT i.id,\n             {2}(JULIANDAY(p.paid_on) - JULIANDAY(i.issued_on)) AS first_days\n      FROM invoices i\n      JOIN payments p ON p.invoice_id = i.id\n      WHERE i.status = {3}\n      GROUP BY i.id);",
      slots: [
        {
          answer: "1",
          kind: "number",
          label: "the single-round precision",
          noVerify: true,
          why: "Rounding is display, applied once: ROUND(AVG(first_days), 1) prints 28.4. Two decimals prints 28.45 — a different number wearing the same name — and zero decimals flattens the clock to 28 whole days.",
        },
        {
          answer: "MIN",
          kind: "keyword",
          label: "the first-settlement fold",
          why: "Split charges settle in two rows; the clock starts at the FIRST. MIN keeps the earliest per charge. MAX measures the last payout — a 31.6-day average, a slower story — and AVG would average a charge's own rows before averaging charges, a grain nobody asked for.",
        },
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the paid-only filter",
          why: "The clock is defined over paid charges: status = 'paid'. 'void' narrows to the one void-but-settled charge and 'open' to the partially settled one — both execute and return a one-row clock over the wrong population.",
        },
      ],
      distractors: ["2", "0", "MAX", "AVG", "'void'", "'open'"],
      walkthrough:
        "Two folds, two grains — the derived table first, the report second. Inner fold: join settlements to charges, filter status = 'paid', then GROUP BY charge with MIN over the JULIANDAY delta — 20 charges survive, because paid charge #28 has no settlement row and drops out of the join, which is exactly why the count reads 20 and not 21. Outer fold: COUNT 20, AVG 28.4 rounded once, MIN 13, MAX 84 — the probed payout clock. The distractors each break a different layer: MAX in the inner fold flips 'first settlement' to 'last' and the average drifts to 31.6; AVG inside a charge averages its own split rows — a charge-internal mean before the real average; 'void' or 'open' shrink the population to a single charge with plausible-looking numbers; and rounding at 2 decimals prints 28.45, which is 'more precise' and less true — finance agreed on 1 decimal. Days to first money movement, per paid charge, one honest round — that's the payout clock.",
    },
    {
      id: "cs-paypal-2",
      tier: "hard",
      topic: "j6",
      universe: "fraud",
      title: "The split-tender scan: pairs that rebuild the charge",
      brief:
        "Risk memo: split funding is a feature — one charge, two payout rows — until a pair doesn't rebuild the charge total. Probed row-level: five charges settle as two rows each (#1, #5, #12, #19, #22) and their totals are $4,860.00, $5,284.00, $4,723.00, $5,614.00 and $4,459.00. The scan pairs the rows per charge (canonical p1.id < p2.id — one pair, not two orientations), sums each pair in dollars (/100.0 — the columns are INTEGER cents), and keeps only pairs that exactly rebuild the charge.",
      ask: "Return each split-charge pair with pair dollars and the charge's own total (2 decimals), charge id ascending — pairs that rebuild exactly.",
      template:
        "SELECT p1.invoice_id,\n       ROUND((p1.amount_cents + p2.amount_cents) / 100.0, 2) AS pair_usd,\n       ROUND(i.amount_cents / 100.0, 2) AS charge_usd\nFROM payments p1\nJOIN payments p2\n  ON p2.invoice_id = p1.invoice_id AND p1.id < {1}\nJOIN invoices i ON i.id = p1.invoice_id\nWHERE (p1.amount_cents + p2.amount_cents) = {2}\nORDER BY p1.invoice_id {3};",
      slots: [
        {
          answer: "p2.id",
          kind: "keyword",
          label: "the canonical pairing key",
          why: "p1.id < p2.id keeps ONE orientation per unordered pair and can't match a row to itself. p1.id < p1.id matches nothing; p1.id < p2.invoice_id compares a row id to a charge id — a different, wrong pairing that yields zero scan rows here.",
        },
        {
          answer: "i.amount_cents",
          kind: "keyword",
          label: "the rebuild predicate",
          why: "The pair must sum to the CHARGE's total, read from invoices. Against p1.amount_cents or p2.amount_cents the predicate is unsatisfiable — a pair can't equal its own half — and the scan returns zero rows, silently declaring every split clean.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the charge-id order",
          why: "The scan reads like a register: charges 1, 5, 12, 19, 22 ascending. DESC is a correct query answering in the wrong order — an audit trail that starts at the end.",
        },
      ],
      distractors: ["p1.id", "p2.invoice_id", "p1.amount_cents", "p2.amount_cents", "DESC"],
      walkthrough:
        "The reconciliation contract in one WHERE clause. The self-join pairs payout rows within a charge — p1.id < p2.id yields exactly one pair per split charge (five pairs; <> would yield ten, both orientations, doubling every sum). Adding both halves gives the pair total, /100.0 converts INTEGER cents to dollars, and the WHERE demands the pair equal the charge's own amount_cents — all five pass: 4,860.00, 5,284.00, 4,723.00, 5,614.00, 4,459.00, each beside its charge_usd twin. That twin column is the audit trail: pair_usd = charge_usd on every row is the proof, and a future break shows up as the charge that vanishes from this result — like the partial $4,000.00-of-$6,148.00 charge, whose single payout can't pair and correctly never appears. The distractors break the contract precisely: p1.id < p1.id pairs nothing, a half swapped in for the charge total makes the predicate impossible — a silent all-clean verdict — and DESC shuffles the register. Five pairs, five rebuilds, zero gaps — until the day there's a gap, and this query is how you'll know.",
    },
  ],

  problems: [
    { slug: "bank-account-summary-ii", why: "Credit/debit folds per account — the wallet statement: money in, money out, net per holder, cents handled honestly. The PayPal-tagged drill for this kit's fold topics." },
    { slug: "monthly-transactions-i", why: "Month-bucket totals with a status count alongside — the payout calendar both sides of the network read, in graded form." },
    { slug: "monthly-transactions-ii", why: "UNION ALL packets splitting one population from the rest — funded-versus-unfunded months, stitched not joined." },
    { slug: "duplicate-charge-pairs", why: "Self-join over close timestamps — same-account-same-minute tender pairs: the duplicate-funding scan risk runs nightly, canonicalized with <." },
    { slug: "amount-anomaly-zscore", why: "Z-score against a baseline sigma — flagging payouts that sit absurdly far from the account's own normal, computed not eyeballed." },
    { slug: "trial-balance-check", why: "Debits-equal-credits in one conditional SUM — the wallet ledger must balance or nothing else you computed matters." },
    { slug: "combine-two-tables", why: "Attach profile attributes to account rows and keep the unmatched — the two-sided read where missing rows are the finding." },
    { slug: "customers-who-never-order", why: "Accounts with no movement — the dormant-wallet anti-join; on this db the unsettled census (6 charges, $15,217) is the same shape." },
    { slug: "maximum-transaction-each-day", why: "Argmax per day over payout amounts — the peak payout in each settlement window, fold plus window in one query." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one pass with the 100.0-before-division fix — dispute and refund shares die by integer division otherwise." },
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded share where unmatched rows count as zero — the NULL-policy and rounding habits PayPal screens grade." },
    { slug: "second-highest-salary", why: "Threshold subqueries on money columns — 'payouts above the platform average' is a scalar subquery with an empty-inner edge case." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the 1,1,3 vocabulary check before any anomaly leaderboard ships." },
    { slug: "the-most-recent-three-orders", why: "Per-account latest-3 via ROW_NUMBER with a deterministic tie-break — the recent-activity rail on every wallet page." },
    { slug: "biggest-window-between-events", why: "LEAD-computed gaps between consecutive events — settlement-to-dispute spacing, measured not assumed." },
    { slug: "spend-histogram", why: "Amount-band buckets over money — payout-size distributions the funding team watches, CASE bands in graded form." },
  ],
};
