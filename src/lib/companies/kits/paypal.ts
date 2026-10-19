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
    "Preparation: the registry tags **5 PayPal SQL problems** and all 5 land in this kit; the rest of the 30 topic slots and 11 of 16 problems are theme-curated from the SQL band — two-sided reads, wallet statements, event-gap windows — because that is the screen's shape. Work the topics in order, then run all six case studies on the live storefront db: the **payout clock** (days from charge to first settlement, paid charges only — **20 charges, 28.4-day average**), the {violet:split-tender scan} (pair the two payout rows, prove each pair rebuilds its charge exactly), plus the two-sided FULL OUTER diff, the z-score screen, the EXCEPT exception census and the per-method top-payouts rail. Thirty-two problems, thirty MCQs, twenty-four theory drills — built for spaced practice rather than one sitting. Say the units and the tie-break out loud; in this building the cents and the join order are the interview.",
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
      slugs: ["bank-account-summary-ii", "total-traveled-distance", "trial-balance-check", "balance-rollforward", "gl-reconciliation", "expected-credit-loss"],
    },
    {
      name: "Two-sided joins: who survives",
      why: "Every payment has a buyer side and a seller side, and each report decides which side survives the join. INNER shrinks to matched pairs; LEFT keeps the unmatched — which on this db is the whole unsettled census (6 charges, $15,217). The trap: filtering the right table in WHERE converts the LEFT JOIN to an INNER silently.",
      slugs: ["combine-two-tables", "employee-bonus", "customers-who-never-order", "ar-aging-schedule", "settlement-fails-aging"],
    },
    {
      name: "Month buckets & status-aware counts",
      why: "Payout calendars bucket by SUBSTR(paid_on, 1, 7) with a status-conditional count riding in the same fold. PayPal drills single-scan censuses — branches that must reconcile to COUNT(*) — because the wallet report ships daily, not quarterly, and a two-scan drift shows up as two truths.",
      slugs: ["monthly-transactions-i", "count-the-number-of-experiments", "the-latest-login-in-2020", "delinquency-buckets", "spend-histogram"],
    },
    {
      name: "Split tenders & self-joins",
      why: "Split funding is PayPal's signature: one charge, two payout rows — five such charges on this db. Finding them is a self-join with canonicalization (p1.id < p2.id keeps one pair; <> double-counts both orientations), and the audit is the WHERE: the pair must rebuild the charge total exactly.",
      slugs: ["duplicate-charge-pairs", "symmetric-pairs", "most-common-course-pairs", "keep-latest-dedupe"],
    },
    {
      name: "Anomaly baselines & outliers",
      why: "Risk doesn't chase absolute amounts; it chases distance from an account's own baseline — mean and sigma computed in a staged fold, then z-scores per row. The subquery shapes that build baselines (scalar, derived) and their empty-inner edge cases are the screen's favorite escalation.",
      slugs: ["amount-anomaly-zscore", "second-highest-salary", "station-median", "top-percentile-fraud", "structuring-detection", "suspicious-bank-account-transactions"],
    },
    {
      name: "UNION ALL packets for two-sided reports",
      why: "Buyer-side and seller-side views ship as stacked packets: same columns, labelled branches, UNION ALL — never UNION, whose dedupe would mask a definition bug by deleting the evidence. Position-matching discipline is the whole test; set ops bind columns by position, not by name.",
      slugs: ["monthly-transactions-ii", "team-scores-in-football-tournament", "count-salary-categories", "credit-utilization-bands"],
    },
    {
      name: "Latest-event windows per account",
      why: "Wallet pages render 'last activity' rails: latest payouts per account, peak payout per day, ties broken deterministically. ROW_NUMBER over a PARTITION with an id tie-break is the shape; the bare MAX-join-back doubles rows on timestamp ties, which split funding makes routine.",
      slugs: ["the-most-recent-three-orders", "maximum-transaction-each-day", "rank-scores", "find-third-transaction"],
    },
    {
      name: "LAG/LEAD event gaps",
      why: "Dispute spacing and payout gaps are window math: LEAD between consecutive events per account, gaps measured not assumed. The deterministic ORDER BY inside OVER is what makes the sequence legal evidence — a walk that reorders between runs is not a metric.",
      slugs: ["biggest-window-between-events", "second-day-confirmation", "consecutive-transactions-with-increasing-amounts", "second-day-verification"],
    },
    {
      name: "Honest ratios & NULL policy",
      why: "Dispute and refund shares die two ways: integer division (100 must be 100.0) and NULL drift (a coalesced zero mid-pipeline launders an exception into a clean-looking number). PayPal's bar: the denominator stated out loud, the NULL policy stated out loud, rounding once at the display edge.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "calculate-special-bonus", "chargeback-rate-ranking"],
    },
    {
      name: "Settlement-clock date math",
      why: "Payout terms run 30 days flat on this db (every due_on − issued_on = 30), and days-to-payout averages 28.4 with a 13-to-84 spread. JULIANDAY diffs, half-open month windows, and one final ROUND are the toolkit — BETWEEN on the last day loses the night, which is exactly when month-end payouts land.",
      slugs: ["users-with-two-purchases-within-seven-days", "leetflex-banned-accounts", "list-the-products-ordered-in-a-period", "uber-first-transaction", "point-in-time-asof"],
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
    {
      id: "paypal-t9",
      q: "SELECT method, COUNT(*), SUM(amount_cents)/100.0 FROM payouts GROUP BY method — why does every non-aggregated column belong in the GROUP BY, and what does SQLite's bare-column tolerance let people get away with?",
      a: "Once the fold runs, the output grain is the group: only the group keys and aggregates exist per row, so any other column has no single value to report — standard SQL demands every selected column be grouped or aggregated. SQLite tolerates bare columns by picking an arbitrary row's value from the group, a latent bug that passes every test until the group's rows disagree — then the wallet report flips depending on row order. The one honest use is the deliberate argmax idiom (a bare column ordered alongside a MAX), and even there you say out loud that you're leaning on engine behavior. At PayPal the rule is recited, not implied: every selected column is either a group key or inside an aggregate — on a two-sided network, an arbitrary row's value could be the buyer's or the seller's, and the report must never depend on which.",
      tag: "groupby",
    },
    {
      id: "paypal-t10",
      q: "UNION versus UNION ALL in the buyer-side/seller-side packet — when is the dedupe a bug, and when is it the feature?",
      a: "The packet's branches are disjoint by construction — buyer side, seller side — so UNION ALL is the honest shape: faster, row-faithful, and immune to coincidental collisions. UNION deduplicates the stacked output, so when two branches emit identical rows — the same count and dollars on both sides of the network, which two-sided data produces routinely — one silently disappears and the packet undercounts exactly the symmetry the business asked about. The feature case is real: the same logical row genuinely arriving twice through different branches is a definition bug, and the dedupe surfaces it as a missing row worth chasing. Set ops bind by position, not name, so each branch carries an explicit side label — and the stacked total is reconciled against COUNT(*) before it ships.",
      tag: "setops",
    },
    {
      id: "paypal-t11",
      q: "An analyst ships the funding mix and card reads 448 payout events against a file header of 27. What class of bug is that, and which two checks catch it before it ships?",
      a: "That's join fan-out — a cross product: 27 payouts matched to 28 charges with no ON clause is 756 rows, and card's 16 legs multiplied by 28 reads 448. The fold didn't fail; the join exploded and the fold reported the explosion. Check one: reconcile every output count to an independent header — the file says 27 legs across 2 methods, so any method count above 27 is impossible on its face. Check two: sanity-bound group counts against the input table — a method can't hold more events than the file shipped. The fix is the join predicate p.invoice_id = i.id, and the writeup names the failure mode so the next analyst recognizes the shape on sight.",
      tag: "quality",
    },
    {
      id: "paypal-t12",
      q: "ROW_NUMBER, RANK, DENSE_RANK — pick one for (a) the wallet's recent-activity rail and (b) the anomaly leaderboard where tied z-scores must both show. Defend each pick.",
      a: "For the rail, ROW_NUMBER with a deterministic ORDER BY paid_on, id — you need exactly N rows, one per position, and the id tie-break keeps re-runs stable when two payouts share a timestamp, which split funding makes routine. For the leaderboard, RANK or DENSE_RANK — tied z-scores must share a rank or risk reads a fabricated ordering as fact. The gap matters: RANK leaves holes after a tie (1, 1, 3), DENSE_RANK compacts (1, 1, 2), and the leaderboard's convention — 'two tie at 1, next is 2' — is DENSE_RANK. The habit being graded: the window choice encodes a policy about ties, and you state the policy, not just the function.",
      tag: "windows",
    },
    {
      id: "paypal-t13",
      q: "Why does the coverage census pre-fold payouts per charge before joining, instead of joining raw and grouping after?",
      a: "Fan-out. Joined raw, the five split-funding charges produce two rows each — 27 legs against 22 matched charges — so each split charge lands in two class rows and every count inflates by five; the census no longer reconciles to 28 and dies on its own sanity check. Pre-folding — SELECT invoice_id, SUM(amount_cents) FROM payouts GROUP BY invoice_id — collapses each charge to exactly one payout row, so the LEFT JOIN keeps all 28 charges one row each and the CASE classifies charges, not legs. It also makes the classification honest: the coverage test reads the folded SUM against the charge amount, a per-charge fact invisible at leg grain. Same aggregation either way — the join order decides whether the counts mean anything.",
      tag: "joins",
    },
    {
      id: "paypal-t14",
      q: "In the settlement-file-versus-wallet-ledger FULL OUTER diff, what is your NULL policy on the unmatched sides?",
      a: "The NULL side IS the finding — a file-only row is money that moved on the file without a ledger entry, a ledger-only row is an entry with no settlement behind it, and on a two-sided wallet both directions are page-worthy, so nothing gets filtered. The classification is IS NULL arms on each side's key: file_only, ledger_only, matched — a CASE census whose branches reconcile to the union's row count. COALESCE belongs at the display edge only, to render '—' for the missing side's amounts; mid-pipeline it launders an orphan into a zero that reconciles fictionally. And 'clean output' is only believable if you first prove the join keys were right — a diff with no orphans because the keys never matched is the most dangerous agreement in recon.",
      tag: "nulls",
    },
    {
      id: "paypal-t15",
      q: "Days-to-payout runs on JULIANDAY differences. Where do rounding and determinism live when five charges settle in two parts?",
      a: "The clock is defined per charge on the FIRST payout, so the fold is MIN(JULIANDAY(paid_on) - JULIANDAY(issued_on)) grouped by invoice — averaging legs directly weights split charges double and drifts off the 20-charge, 28.4-day file number. The average rounds exactly once, at the outermost SELECT: ROUND(AVG(...), 1) — per-row rounding perturbs every input before the aggregate. Determinism lives in the window variant: ROW_NUMBER() OVER (PARTITION BY invoice_id ORDER BY paid_on, id) = 1 picks first legs, and the id is what keeps 'first' stable when two legs share a timestamp. The fractional days from JULIANDAY stay fractional through the math — CAST or ROUND only at the display edge, stated in the writeup.",
      tag: "dates",
    },
    {
      id: "paypal-t16",
      q: "A join-fold reads 33 rows; the file header says 27 payouts and the charge count is 22. Recite the grains and which fold prints each.",
      a: "Legs: COUNT(*) on payouts reads 27 — one row per settlement event the file shipped. Charges: COUNT(DISTINCT invoice_id) reads 22 — the business object after five charges payout in two parts. The 33 is a fan-out artifact — 27 legs plus extra rows from a raw join — and it corresponds to no real grain at all, which is what makes it dangerous: it executes, it sums, it ships. The discipline is reciting 'one row per what?' before reading any number: events, charges, funding buckets — each is a legitimate grain with a different fold, and only counts that reconcile to a named grain leave the building. A number that can't be re-derived from a grain doesn't ship at PayPal.",
      tag: "aggregation",
    },
    {
      id: "paypal-t17",
      q: "Why can ORDER BY use the alias settled_usd but WHERE can't, and how do you filter on a folded alias mid-pipeline?",
      a: "SQL's logical processing order is FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — aliases are born in SELECT, so they exist from SELECT onward: ORDER BY (last) sees them, WHERE (first) cannot, and referencing one there is the error that teaches the pipeline. Mid-pipeline fold filtering is HAVING with the expression repeated — HAVING 100.0 * SUM(disputed) / COUNT(*) > 1 — or the staged shape: fold into a CTE or derived table named for what it holds, then filter the staged rows outside. The staged shape wins when the expression is long or reused, because the definition lives once and the filter reads like the business rule. What you never do is bury the filter client-side — the number that ships must carry its filter in the query.",
      tag: "pipeline",
    },
    {
      id: "paypal-t18",
      q: "Build the per-account payout baseline for the z-score screen — what runs per group, and what does the math do when an account has one payout?",
      a: "Stage the fold: a derived table or CTE computes AVG(amount_cents) and the population sigma per account, then the outer query joins back and scores each payout (x − mean) / sigma. The denominator question is the interview's favorite: population versus sample sigma changes the flag set, so say which you chose and why — population, for a complete ledger. The edge case is real money: an account with one payout has sigma 0, division by zero returns NULL in SQLite, and the most anomalous row in the table silently unflags; the guard is NULLIF(sigma, 0) with a stated policy for the NULL arm. The strong answer names the CTE account_baseline, because 'baseline' is a definition and definitions live in names — and on two methods the per-group cost is trivial, while at ten thousand accounts you reach for AVG(...) OVER (PARTITION BY account) computed once.",
      tag: "subqueries",
    },
    {
      id: "paypal-t19",
      q: "The 100× error: a report SUMs amount_cents into a dollar column. Where do the guards live?",
      a: "Three layers. The query: the cents-to-dollars conversion happens exactly once, at the display edge, written as /100.0 — and the cents vocabulary stays in the column names so the unit is visible at every read site. The review: every shipped figure states its units out loud — '$37,364.00, read as SUM(amount_cents)/100.0' — because a number whose derivation can't be recited doesn't ship. The test: reconcile one known row end-to-end — a payout of 401,500 cents prints $4,015.00 — so a 100× slip breaks the check loudly. The eye never catches a 100× error; the digits look plausible at any scale, which is why the guard is procedural, not visual.",
      tag: "quality",
    },
    {
      id: "paypal-t20",
      q: "Risk wants payouts per account per 15-minute bucket for the burst rule. Write the bucket expression and explain what an empty bucket means for the rule.",
      a: "Bucket on the epoch: (CAST(STRFTIME('%s', paid_on) AS INTEGER) / 900) * 900 gives a fixed 900-second grid that survives midnight and month edges; format it back with STRFTIME for the report. The fold is GROUP BY account, bucket with COUNT(*) and a HAVING threshold. The edge case is the empty bucket: GROUP BY can only bucket rows that exist, so a quiet window produces NO row — absence, not zero — and a rule that reads the output literally never fires on the quiet-then-burst pattern risk cares about. Zero-filling against a generated calendar grid via LEFT JOIN is the fix, and the analyst states which shape the rule consumes.",
      tag: "windows",
    },
    {
      id: "paypal-t21",
      q: "p1.id < p2.id — prove the split-tender scan returns each unordered pair exactly once and never a self-pair. What breaks with <=?",
      a: "Ids are unique, so they form a total order: for any two distinct ids exactly one orientation satisfies the strict inequality, which is why every unordered pair appears once — the smaller id first. A self-pair needs id < id, which is false by definition, so self-matches are structurally impossible, not filtered. Swap to <= and two things break at once: every row pairs with itself (id <= id is true), and each real pair appears in both orientations — the pair census doubles and fills with noise. The canonicalization is what makes the split-tender audit auditable: five charges, five pairs, and the count of pairs is a fact about the data, not about iteration order.",
      tag: "joins",
    },
    {
      id: "paypal-t22",
      q: "Risk wants the p95 of payout latency across the settled charges. NTILE, PERCENT_RANK, or LIMIT/OFFSET — which shape, and what are the small-n edge cases?",
      a: "With 20 settled charges, p95 is essentially the top row, so the tie behavior decides the shape. NTILE(20) OVER (ORDER BY latency DESC) marks each charge's position bucket — the top bucket is the tail, and ties at the boundary land deterministically only if the ORDER BY carries the id tie-break. PERCENT_RANK gives the continuous position 0..1 — filter WHERE percent_rank >= 0.95 — but tied latencies share the same percent rank, so the boundary either catches all ties or none. LIMIT/OFFSET assumes a strict order that ties violate silently. The honest answer names the n: p95 of 20 is one row, its stability depends on the tie-break, and a screen that can't say which tied row it picked doesn't ship to risk.",
      tag: "windows",
    },
    {
      id: "paypal-t23",
      q: "INTERSECT versus INNER JOIN on distinct keys — when do they agree and when do they diverge?",
      a: "They agree when both inputs are already distinct on the compared columns and you select exactly those columns — same key sets in, same survivors out. They diverge on duplicates first: INNER JOIN fans every match into the output, INTERSECT deduplicates to a set — 27 payout legs versus 22 charges is the difference on this db. They diverge on NULLs second: join equality never matches NULL, but INTERSECT treats NULL as a comparable member, so a NULL key survives INTERSECT and vanishes from the join. And they diverge on arity: INTERSECT requires identical column counts and positions. The file-versus-ledger key diff is INTERSECT/EXCEPT territory precisely because you want the set semantics, not the fan-out.",
      tag: "setops",
    },
    {
      id: "paypal-t24",
      q: "The EOD writeup claims every wallet report is re-runnable. What makes a payout report idempotent — and what db state silently breaks re-runs?",
      a: "Idempotent means same inputs, same output: a single read-only statement, no wall-clock functions, every threshold and as-of date pinned as literals or parameters — not computed from the environment. The silent breaker is anchoring to the data itself, the classic being MAX(paid_on): an exposure report 'as of the latest payout' drifts every time a new leg lands, so last night's 6 unsettled charges / $15,217.00 and this morning's disagree with no code change and no error. The fix is an explicit as-of anchor stated in the writeup — a fixed date literal or a documented, labeled convention the reader can reproduce. At PayPal the re-run is the audit: if the second run can move a number, the first number was never a fact.",
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
    {
      id: "paypal-mcq-11",
      prompt: "The two-sided packet stacks a buyer-side branch and a seller-side branch with UNION ALL. A teammate swaps in UNION. When does the packet lose rows?",
      choices: [
        "Never — UNION is just a slower UNION ALL",
        "Whenever the two branches output rows identical in every column",
        "Only when the branches select different column names",
        "When a branch returns more than one row",
      ],
      answer: 1,
      why: "UNION deduplicates the stacked result; UNION ALL keeps everything. Two branches that emit identical rows — same side label, same count, same dollars — collapse to one, and the packet silently loses a side. Set ops bind by position, so the label column is what keeps the sides tellable.",
      notes: [
        { choice: 0, why: "The dedupe is the semantic difference, not an optimization detail — coincidentally-identical rows are real in two-sided data, where buyer and seller metrics can tie." },
        { choice: 3, why: "Row counts per branch are irrelevant; UNION applies to the combined output. Two one-row branches can still collide." },
      ],
      difficulty: "easy",
    },
    {
      id: "paypal-mcq-12",
      prompt: "Dispute ops wants funding methods whose dispute rate clears 1%: `WHERE SUM(disputed)/COUNT(*) > 0.01` errors. The fix is…",
      choices: [
        "Move the condition into HAVING",
        "Wrap the ratio in COUNT",
        "Move it into ORDER BY",
        "Add it to GROUP BY",
      ],
      answer: 0,
      why: "The rate is a property of a group — it doesn't exist until after the fold, and WHERE runs before GROUP BY. Fold gates live in HAVING: HAVING 100.0 * SUM(...) / COUNT(*) > 1. The clause choice is the grain statement: 'one row per method, rate per event'.",
      notes: [
        { choice: 2, why: "ORDER BY sorts, it never filters — and an aggregate there is rejected in a plain sort anyway." },
        { choice: 3, why: "GROUP BY declares the grain; it takes column expressions, not aggregate predicates." },
      ],
      difficulty: "easy",
    },
    {
      id: "paypal-mcq-13",
      prompt: "Settlement file on one side, wallet ledger extract on the other. Which join returns matched rows AND the unmatched rows from BOTH sides?",
      choices: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
      answer: 3,
      why: "FULL OUTER JOIN keeps matched pairs plus orphans from each side — file-only and ledger-only. On a wallet the orphans are the whole finding: money that moved on one snapshot only. A LEFT half-diff reports one side's orphans as the complete story.",
      notes: [
        { choice: 1, why: "LEFT keeps only the left side's orphans — ledger-only rows vanish, and on a two-sided network the side you dropped is half the truth." },
        { choice: 0, why: "INNER keeps only matches — a diff that returns 'clean' by construction, the most dangerous agreement in reconciliation." },
      ],
      difficulty: "easy",
    },
    {
      id: "paypal-mcq-14",
      prompt: "`LEAD(paid_on) OVER (ORDER BY paid_on, id)` on an account's payout rows — what does the LAST row return?",
      choices: ["0", "NULL", "The row's own paid_on", "An error"],
      answer: 1,
      why: "LEAD has no next row at the partition's end, so it yields NULL — not zero, not the row itself. A gap metric that COALESCEs that NULL to 0 fabricates a zero-day gap; leaving it NULL is the honest print, and the policy should be stated either way.",
      notes: [
        { choice: 0, why: "Zero is a chosen value — LEAD returns NULL at the edge, and only an explicit COALESCE turns it into 0. The difference matters when 'no next event' should page someone." },
        { choice: 2, why: "LEAD never echoes the current row — that's just the column, and every gap would read 0." },
      ],
      difficulty: "easy",
    },
    {
      id: "paypal-mcq-15",
      prompt: "27 payout legs sum to $69,612 and cover 22 charges. Which fold answers 'average payout per CHARGE' honestly?",
      choices: [
        "AVG(amount_cents)/100.0 over the payouts table",
        "SUM(amount_cents)/100.0 / COUNT(DISTINCT invoice_id)",
        "AVG(amount_cents)/100.0 / COUNT(DISTINCT invoice_id)",
        "SUM(amount_cents)/100.0 / 27",
      ],
      answer: 1,
      why: "Per-charge dollars = total over distinct charges: 69,612/22 ≈ $3,164.18. AVG over rows is the per-LEG average ($2,578.22) — split charges contribute two rows each — and dividing that by 22 double-folds. Two grains, two honest numbers; name the denominator out loud.",
      notes: [
        { choice: 0, why: "That's the average leg — $2,578.22 — because AVG folds rows and split charges ship two. A per-charge number needs a charge-count denominator." },
        { choice: 3, why: "27 is the leg count — the per-leg read with extra steps; the denominator drifted from charges." },
      ],
      difficulty: "medium",
    },
    {
      id: "paypal-mcq-16",
      prompt: "Coverage census: you join payouts RAW to charges instead of the pre-folded per-charge SUM. Five charges payout in two rows. What does the census classify?",
      choices: [
        "Still 28 charges — join shape never affects counts",
        "33 classified rows — the five split charges land in two class rows each",
        "22 — the folds deduplicate automatically",
        "27 — one row per payout",
      ],
      answer: 1,
      why: "Raw payouts fan the join: 27 payout rows against 22 matched charges, plus 6 unmatched charges — 33 rows total, each split charge classified twice. The 'reconciles to 28' check fails loudly. The pre-folded derived table is what makes the census one-row-per-charge.",
      notes: [
        { choice: 0, why: "Join shape is exactly what moves counts — fan-out is the silent inflation this kit's exception hunts hang on." },
        { choice: 2, why: "Nothing deduplicates a join implicitly; DISTINCT would be a manual fold you didn't write." },
      ],
      difficulty: "medium",
    },
    {
      id: "paypal-mcq-17",
      prompt: "The per-account wallet nets read cash $44,196, receivables $16,440 — and sales_revenue NEGATIVE $86,052. What's the correct read of that negative net?",
      choices: [
        "A sign bug — revenue must never be negative",
        "Normal: revenue accounts carry credits exceeding debits, so a debit-minus-credit net reads negative by design",
        "A double-counted payout inflating credits",
        "Proof the wallet ledger is off",
      ],
      answer: 1,
      why: "net = debits − credits is an asset-side convention. Liability and revenue accounts legitimately sit credit-heavy, so the same formula reads negative there — the sign encodes the account's role, not an error. The only number allowed to alarm you is the trial-balance delta ($0.00 here).",
      notes: [
        { choice: 0, why: "Expecting every account to be positive applies the asset convention everywhere — 'fixing' that sign corrupts the accounting handoff." },
        { choice: 3, why: "The ledger balances: $181,080 = $181,080. Signed per-account nets are the normal state." },
      ],
      difficulty: "medium",
    },
    {
      id: "paypal-mcq-18",
      prompt: "A burst rule counts payouts per minute via `GROUP BY STRFTIME('%Y-%m-%d %H:%M', paid_on)`. On minutes with ZERO payouts, what does the rule see?",
      choices: ["A row with count 0", "Nothing — the minute doesn't exist in the output", "A row with NULL count", "An error"],
      answer: 1,
      why: "GROUP BY can only bucket rows that exist; an empty minute produces no group, so the output has a gap where the dashboard expected a zero. Absence is not zero — zero-filling needs a calendar grid joined on. 'Does the rule fire on quiet windows' starts exactly here.",
      notes: [
        { choice: 0, why: "Groups come from rows; zero rows make zero groups. COUNT never invents a bucket — that's why velocity dashboards silently skip dead minutes." },
        { choice: 2, why: "NULL would require a row with a NULL key — a missing minute isn't a NULL minute." },
      ],
      difficulty: "easy",
    },
    {
      id: "paypal-mcq-19",
      prompt: "The wallet trial balance delta reads $4,000 instead of $0.00. Which query localizes the break fastest?",
      choices: [
        "GROUP BY account with the per-account net, ordered by ABS(net) DESC — walk the nets against close expectations",
        "SELECT rows WHERE debit_cents = credit_cents",
        "HAVING SUM(debit_cents) = SUM(credit_cents) on the grand total",
        "SELECT DISTINCT memo FROM ledger_entries",
      ],
      answer: 0,
      why: "A balanced ledger means offsetting entries moved together; a break shows up as an account whose net drifted from what the close expects. Rank the nets by absolute size and walk them — the missing $4,000 hides in whichever account can't defend its net from the query.",
      notes: [
        { choice: 1, why: "Self-balancing rows are the healthy rows — this filter finds nothing and proves nothing." },
        { choice: 2, why: "The grand total is already known to be broken; filtering on it selects the symptom, not the cause." },
      ],
      difficulty: "medium",
    },
    {
      id: "paypal-mcq-20",
      prompt: "paid_on carries ISO timestamps ('2024-02-29T23:59:59'). Which month-window shape keeps the month-end payout?",
      choices: [
        "BETWEEN '2024-02-01' AND '2024-02-29'",
        "BETWEEN '2024-02-01' AND '2024-03-01'",
        "paid_on >= '2024-02-01' AND paid_on < '2024-03-01'",
        "STRFTIME('%Y', paid_on) = '2024'",
      ],
      answer: 2,
      why: "The half-open interval [first, next-first) includes every timestamp in the month regardless of time-of-day. BETWEEN's inclusive upper bound stops at the string '2024-02-29', and '2024-02-29T23:59:59' sorts after it — the month-end payout drops exactly when month-end volume lands.",
      notes: [
        { choice: 1, why: "Over-captured: '2024-03-01T00:00:00' and the rest of March's first day sneak in — the inclusive bound sweeps the next month." },
        { choice: 3, why: "That keeps the whole year — a 12× over-capture, and the month bucket the report was supposed to draw disappears." },
      ],
      difficulty: "medium",
    },
    {
      id: "paypal-mcq-21",
      prompt: "You need payouts whose amount sits more than 2 sigma above the platform baseline. sigma is 0 for the one-payout account. What does SQLite return for (x − mean) / 0?",
      choices: [
        "Infinity — the row flags",
        "NULL — division by zero yields NULL, and the row silently unflags",
        "0 — the row reads perfectly normal",
        "A runtime error",
      ],
      answer: 1,
      why: "SQLite maps division by zero to NULL, not an error and not infinity — so the account with one payout, statistically the most anomalous row possible, silently fails every z-score test. The guard is NULLIF(sigma, 0) with a stated policy for the NULL arm.",
      notes: [
        { choice: 0, why: "SQLite isn't IEEE-float here — integer/real division by zero is NULL by design, which is why the anomaly vanishes without a trace." },
        { choice: 2, why: "Zero would be a plausible-looking normal reading — exactly the laundering this kit's NULL policy exists to catch." },
      ],
      difficulty: "hard",
    },
    {
      id: "paypal-mcq-22",
      prompt: "`SUM(amount_cents) OVER (ORDER BY paid_on)` as a running total — two payouts share the same paid_on. What does the running column read on those rows?",
      choices: [
        "Distinct running values — window frames are always ROWS",
        "Identical values — the default frame is RANGE, so tied peers ride together",
        "NULL on the second of the tied rows",
        "Only the tie's own amount on each row",
      ],
      answer: 1,
      why: "The default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW, and RANGE includes peers — rows sharing the ORDER BY value. Both tied payouts see the same cumulative total including both amounts. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW is the fix when each row needs its own running value.",
      notes: [
        { choice: 0, why: "RANGE is the default precisely because people assume ROWS — identical values on ties are the tell you're on the wrong frame." },
        { choice: 3, why: "Each tied row sees the cumulative sum through the whole peer group — that's what 'peers included' means." },
      ],
      difficulty: "hard",
    },
    {
      id: "paypal-mcq-23",
      prompt: "`WHERE amount_cents/100.0 > (SELECT AVG(amount_cents)/100.0 FROM payouts GROUP BY method)` — what happens?",
      choices: [
        "Compares against card's average — the first group wins",
        "Errors: the scalar subquery returned more than one row",
        "Returns every payout — the threshold averages to the grand mean",
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
      id: "paypal-mcq-24",
      prompt: "The funding mix returns 756 rows and card reads 448 'payouts'. Diagnose before reading the SQL — what did the analyst write?",
      choices: [
        "Dropped the join condition — 27 payouts × 28 charges = 756, card's 16 legs × 28 = 448",
        "Added DISTINCT to the count",
        "Grouped by invoice_id instead of method",
        "Filtered charges to status = 'paid'",
      ],
      answer: 0,
      why: "756 = 27 × 28 — a cross product. Every payout matched every charge, so each method's leg count multiplied by 28 (card 16 → 448). The fix is the ON clause: p.invoice_id = i.id. Sanity-bounding counts against the file header (27 legs, 2 methods) catches this before it ships.",
      notes: [
        { choice: 2, why: "Grouping by invoice_id would give up to 28 rows, not 756 — fan-out requires a missing or wrong join condition, not the wrong GROUP BY." },
        { choice: 3, why: "A status filter shrinks rows; it can't manufacture 28× multiplication." },
      ],
      difficulty: "hard",
    },
    {
      id: "paypal-mcq-25",
      prompt: "Payout terms are 30 days flat. Which fold PROVES no charge breaks terms — rather than assuming it?",
      choices: [
        "MIN(JULIANDAY(due_on) - JULIANDAY(issued_on)) = 30 AND MAX(...) = 30",
        "AVG(JULIANDAY(due_on) - JULIANDAY(issued_on)) = 30",
        "SUM(JULIANDAY(due_on) - JULIANDAY(issued_on)) = 30",
        "COUNT(*) = 30",
      ],
      answer: 0,
      why: "MIN and MAX bracket the population — if both read 30, every charge is 30 (and on this db, all 28 are). AVG = 30 is compatible with a 29 and a 31 cancelling; a terms outlier is exactly what the check exists to catch. Verified, not assumed — one 27-day charge would be the finding.",
      notes: [
        { choice: 1, why: "Averages cancel outliers — the one shape guaranteed to hide the anomaly the check hunts." },
        { choice: 3, why: "COUNT(*) = 30 counts charges (the db has 28) — nothing about their terms." },
      ],
      difficulty: "easy",
    },
    {
      id: "paypal-mcq-26",
      prompt: "`ROUND(SUM(amount_cents)/100.0, 2)` returns 8420.5 for one month's payouts. What does the client display?",
      choices: ["8420.50", "8420.5", "8420", "84.205"],
      answer: 1,
      why: "ROUND caps precision at 2 decimals; it does not pad to them — 8420.5 prints as 8420.5. Two-decimal presentation is the renderer's job (printf/format at the display edge), one more place the pipeline keeps math and display separate.",
      notes: [
        { choice: 0, why: "Padding is formatting, not rounding — no SQL ROUND appends a trailing zero to a float." },
        { choice: 3, why: "That's the cents-to-dollars conversion run twice — a 100× slip, and exactly why the 100.0 lives in exactly one place." },
      ],
      difficulty: "easy",
    },
    {
      id: "paypal-mcq-27",
      prompt: "Every charge finally paid out. The unsettled census — `WHERE p.id IS NULL` with a GROUP BY — returns zero ROWS. Which shape still prints a clean '0 charges / $0.00' line?",
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
        { choice: 2, why: "INNER JOIN changes the population being audited — the census is defined on the unmatched set." },
      ],
      difficulty: "medium",
    },
    {
      id: "paypal-mcq-28",
      prompt: "Per-method share of payout dollars WITHOUT a subquery — which expression computes the denominator inside the same GROUP BY fold?",
      choices: [
        "SUM(amount_cents) OVER ()",
        "SUM(SUM(amount_cents)) OVER ()",
        "COUNT(*) OVER ()",
        "TOTAL(amount_cents)",
      ],
      answer: 1,
      why: "Window functions evaluate after GROUP BY, so the window's input is the per-group sums — SUM(SUM(amount_cents)) OVER () totals the group sums into the grand $69,612, and 100.0 * SUM(...) / that is the honest funding share. A bare column inside OVER () in a grouped query is the bare-column trap, not the group total.",
      notes: [
        { choice: 0, why: "In a grouped query, amount_cents inside the window isn't the group's sum — it's a bare column reading an arbitrary row; the share is fiction. Nest the SUM." },
        { choice: 2, why: "COUNT(*) OVER () counts groups (2 methods), not dollars — dividing dollars by 2 is not a share." },
      ],
      difficulty: "hard",
    },
    {
      id: "paypal-mcq-29",
      prompt: "Risk buckets payouts into fixed 15-minute windows for the burst rule. Which bucket expression survives midnight and month edges?",
      choices: [
        "STRFTIME('%Y-%m-%d %H', paid_on) — hourly is close enough",
        "(CAST(STRFTIME('%s', paid_on) AS INTEGER) / 900) * 900 — epoch seconds folded to the 900-second grid",
        "SUBSTR(paid_on, 1, 13) — hour plus a zero minute",
        "DAYOFWEEK(paid_on)",
      ],
      answer: 1,
      why: "Folding epoch seconds by the window size (900s = 15min) gives a fixed grid that crosses midnight and month boundaries without gaps or drift; CAST keeps the integer division deliberate. Time-string slicing breaks the moment windows don't align to the hour, and DAYOFWEEK is another engine's function.",
      notes: [
        { choice: 0, why: "Hourly buckets are a different rule — a 15-minute burst smears across two hour keys and the count halves on each side." },
        { choice: 2, why: "That buckets every event to :00 of its hour — one giant bucket per hour, and the burst threshold never fires correctly." },
      ],
      difficulty: "hard",
    },
    {
      id: "paypal-mcq-30",
      prompt: "The seller-side report must show, per charge, the payout gap to the NEXT payout row. Which window pair is the honest shape?",
      choices: [
        "LEAD(paid_on) OVER (...) minus paid_on, with the last row's NULL left as NULL",
        "LAG(paid_on) OVER (...) minus paid_on, COALESCEd to 0 at the edges",
        "MAX(paid_on) OVER () minus paid_on",
        "paid_on minus MIN(paid_on) OVER ()",
      ],
      answer: 0,
      why: "Gap to next is LEAD minus current, and the partition's last row has no next — its NULL IS the 'no further payout yet' state, not missingness to launder. LAG measures gap since previous (a different metric), and MAX/MIN-over-partition measure distance from the extremes, not from the adjacent event.",
      notes: [
        { choice: 1, why: "That's the gap since the previous payout — a backward metric wearing the forward one's name; COALESCE to 0 additionally fabricates a zero-day gap on the first row." },
        { choice: 2, why: "Distance from the partition's max is 'days since the last payout in the window' — useful, but not the adjacent-event gap the report asked for." },
      ],
      difficulty: "medium",
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
    {
      id: "cs-paypal-3",
      tier: "medium",
      topic: "x5",
      universe: "month-close",
      title: "The two-sided diff: charges against payout legs",
      brief:
        "Month-close memo: the wallet's daily contract is that every payout leg attaches to exactly one charge and every charge either has its money or is a known exception. The diff keeps BOTH sides: charges with no payout (probed: 6 of them — $15,217.00, the float finance defends) and payout legs with no charge (probed: zero — the FK guarantees it, and proving zero IS the audit). The raw FULL OUTER JOIN reads 33 rows: 27 matched legs over 22 charges plus the 6 orphan charges. The COALESCE key prints one charge id per row — real id on whichever side it lives — so the orphans are readable, not hidden in NULLs.",
      ask: "Return every row of the charge-versus-payout diff with a coalesced charge id, the charge's status, charge dollars and payout dollars (2 decimals), charge id ascending.",
      template:
        "SELECT {1}(i.id, p.invoice_id) AS charge_id,\n       i.status,\n       ROUND(i.amount_cents / 100.0, 2) AS charge_usd,\n       ROUND(p.amount_cents / 100.0, 2) AS paid_usd\nFROM invoices i\n{2} JOIN payments p ON p.invoice_id = i.id\nORDER BY charge_id {3}, p.id;",
      slots: [
        {
          answer: "COALESCE",
          kind: "keyword",
          label: "the both-sides key",
          why: "COALESCE(i.id, p.invoice_id) prints the charge id from whichever side survived the join — matched rows carry the real id, orphan charges keep theirs, and a payout with no charge would print its invoice_id with NULL status. INNER would drop the 6 orphans; a bare i.id NULLs the key on right-only rows, hiding them.",
        },
        {
          answer: "FULL OUTER",
          kind: "keyword",
          label: "the both-sides join",
          why: "The diff needs matched rows PLUS orphans from each side — 33 rows here. INNER shows only matches, a diff that reads 'clean' by construction; RIGHT keeps the payouts and drops the 6 charge-side orphans. (LEFT would coincide with the full outer on this book — no payout-only rows exist — which is why the memo's zero-payout-only claim needs the FULL OUTER run to prove it, not assume it.)",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the register direction",
          why: "The diff reads like a register: charges 1 through 28 ascending, exceptions at 11, 25, 28 easy to find. DESC is a valid query answering in the wrong order — an audit trail that starts at the end.",
        },
      ],
      distractors: ["CROSS", "INNER", "RIGHT", "i.id", "DESC"],
      walkthrough:
        "The two-sided diff, kept honest by what it refuses to drop. FULL OUTER JOIN on p.invoice_id = i.id keeps all 27 payout legs (each attached to its charge — the fan-out is real here, split charges appear twice, which is why the register reads 33 rows and not 28) plus the 6 orphan charges with NULL payout columns — and zero payout-only rows, which is not a vacuous fact: it proves the FK held and no money moved without a charge. COALESCE(i.id, p.invoice_id) makes every row readable: orphan charges keep their id (18, 20, 21, 24, 25, 26), their paid_usd reads NULL, and the exceptions surface at a glance — #11 void-but-paid, #25 partially paid, #28 paid-never-paid. The 100.0 is the usual cents read. The distractors break the contract precisely: RIGHT and INNER each drop one side's truth (and on this book LEFT would silently coincide with the full outer — no payout-only rows exist — which is exactly why the writeup proves the zero rather than trusting the join), CROSS can't take an ON clause, i.id in the key slot NULLs the identifier exactly on the rows the diff exists to show, and DESC scrambles the register. Thirty-three rows, two orphan classes, one provable zero — that's the close.",
    },
    {
      id: "cs-paypal-4",
      tier: "hard",
      topic: "q6",
      universe: "fraud",
      title: "The z-score screen: payouts against their own baseline",
      brief:
        "Risk memo: the platform doesn't chase absolute amounts — it chases distance from its own baseline. Probed baseline over all 27 payout legs: mean $2,578.22, population sigma $734.11 (computed over the complete set — the population/sample choice is stated, not implicit). This morning's screen runs the legs against mean + 1.5σ and returns three flags: $4,015.00 (z 1.96), $4,000.00 (z 1.94), $3,896.00 (z 1.79) — and nothing clears 2σ, a quiet tail worth saying out loud. The baseline stages in CTEs named for what they hold; the threshold is a stated constant, not a vibes filter.",
      ask: "Return each payout leg flagged above 1.5 sigma with its id, dollars (2 decimals) and z-score (2 decimals), biggest z first.",
      template:
        "WITH stats AS (\n  SELECT AVG(amount_cents) AS mean_c, COUNT(*) AS n FROM payments\n),\nspread AS (\n  SELECT s.mean_c,\n         {1}(SUM((p.amount_cents - s.mean_c) * (p.amount_cents - s.mean_c)) * 1.0 / s.n) AS sigma_c\n  FROM stats s\n  CROSS JOIN payments p\n  GROUP BY s.mean_c\n)\nSELECT p.id,\n       ROUND(p.amount_cents / 100.0, 2) AS payout_usd,\n       ROUND((p.amount_cents - {2}) / sigma_c, 2) AS z\nFROM payments p\nCROSS JOIN spread\nWHERE (p.amount_cents - mean_c) / sigma_c > {3}\nORDER BY z DESC;",
      slots: [
        {
          answer: "SQRT",
          kind: "keyword",
          label: "the sigma root",
          why: "Sigma is the SQUARE ROOT of the mean squared deviation — SQRT turns the variance into the same units as the payouts. ROUND returns the raw variance (in cents²) and every z-score collapses toward 0; COUNT inside an aggregate is a misuse error.",
        },
        {
          answer: "mean_c",
          kind: "keyword",
          label: "the baseline mean",
          why: "The z-score is distance from the staged baseline: (x − mean_c) / sigma_c. Swapping in sigma_c scores distance from the deviation itself — every leg reads ~2.5 and the screen flags all 27; AVG(amount_cents) inside this SELECT is a misuse-of-aggregate error.",
        },
        {
          answer: "1.5",
          kind: "number",
          noVerify: true,
          label: "the stated threshold",
          why: "The screen is defined at 1.5 sigma — 3 flags on this book. At 2 sigma the same screen returns zero rows (the tail is quiet — a finding worth stating), and at 1 sigma it widens to 5 flags; the threshold is a policy constant, printed in the memo, not a vibes filter.",
        },
      ],
      distractors: ["2", "1", "sigma_c", "AVG(amount_cents)", "COUNT", "ROUND"],
      walkthrough:
        "Two staged folds, one screen — the baseline is a definition, so it lives in named CTEs. stats folds the platform's 27 legs into mean and count; spread squares the deviations, divides by n (population sigma — stated, not implicit), and SQRTs the result: mean $2,578.22, sigma $734.11. The outer query CROSS JOINs every leg against that one-row baseline and scores (x − mean) / sigma; the WHERE keeps what clears the stated 1.5 — three legs: $4,015.00 at z 1.96, $4,000.00 at z 1.94, $3,896.00 at z 1.79, biggest first. The distractors are the screen's real failure modes: a 2-sigma threshold ships an empty report that reads 'all quiet' — true this morning, but only because the threshold says so; 1 sigma widens the net to 5 flags and drowns the desk; sigma_c in the mean slot scores distance-from-deviation and flags the entire book; AVG nested in the outer SELECT is an aggregate-misuse error; ROUND skips the square root and sigma lands in cents-squared, collapsing every z toward zero; COUNT can't wrap an aggregate. Three flags, one provable quiet tail, definitions in names — that's the z-score screen.",
    },
    {
      id: "cs-paypal-5",
      tier: "medium",
      topic: "s4",
      universe: "refund-audit",
      title: "The EXCEPT census: charges the payout ledger can't explain",
      brief:
        "Refund-ops memo: every charge is owed either its money or an explanation. The census is set arithmetic — the charge book (28 rows: id, status, dollars) EXCEPT the payout book's settled pairs (invoice_id, 'paid', dollars) — and whatever survives is exactly the charge population whose money story doesn't reconcile: 8 charges. Probed: 6 open charges ($19,609.00 across them, #25's dollars still at $6,148.00 because its payout leg paid $4,000.00 — a pair that doesn't match and rightly survives), 1 void (#11, $925.00 — the void-but-paid exception), and 1 paid (#28, $1,756.00 — paid with zero payout legs). The EXCEPT cancels a row only when ALL three columns agree, so the label column is doing real work.",
      ask: "Return every charge that does not exactly cancel against a settled payout pair, with its id, status and charge dollars (2 decimals), charge id ascending.",
      template:
        "SELECT id AS charge_id,\n       status,\n       ROUND(amount_cents / {1}, 2) AS charge_usd\nFROM invoices\nEXCEPT\nSELECT invoice_id,\n       {2},\n       ROUND(SUM(amount_cents) / 100.0, 2)\nFROM payments\nGROUP BY invoice_id\nORDER BY charge_id {3};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-dollars divider",
          why: "Charges are INTEGER cents, so the dollar read is amount_cents / 100.0 — and BOTH books must convert identically or the EXCEPT never cancels anything: a 1000 in this slot rescales the charge book and all 28 rows survive. (The bare integer 100 reads identically only because every charge total is a whole-dollar multiple — one odd cent and it truncates.)",
        },
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the settled-pair label",
          why: "The payout book labels each settled pair 'paid' so the EXCEPT cancels against real paid charges — same three columns, row leaves. 'settled' or 'open' labels nothing on the charge book side and all 28 rows survive; NULL labels break every cancellation differently (a 28-row census that 'finds' every charge broken).",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the register direction",
          why: "The census reads like a register — charges 11, 18, 20, 21, 24, 25, 26, 28 ascending, each with its own explanation. DESC is a valid query answering in the wrong order — an audit trail that starts at the end.",
        },
      ],
      distractors: ["DESC", "1000", "invoice_id"],
      walkthrough:
        "Set arithmetic as reconciliation: the census is the charge book minus the settled pairs, and the survivors ARE the exception queue. The payout book folds 27 legs into 22 settled pairs — (invoice_id, 'paid', paid dollars) — and the EXCEPT cancels a charge row only when id, status and dollars ALL agree. Twenty paid charges cancel exactly: their amounts rebuilt by their payout legs. Eight survive, and each survivor is a story the memo names: the 6 open charges (pipeline, including #25 whose $6,148.00 charge sits against a $4,000.00 partial — the mismatched dollars refuse to cancel, which is the census working, not failing), the void-but-paid #11 ($925.00 — status 'void' never matches the payout book's 'paid' label), and paid-never-paid #28 ($1,756.00 — no payout row to cancel against). The distractors weaponize the cancellation contract: a 1000 in the divider rescales the charge book so nothing cancels and the census screams about 28 exceptions; invoice_id duplicated into the label slot cancels nothing (numeric labels never equal status text); DESC scrambles the register. Eight survivors, each explainable, each owned — that's the EXCEPT census.",
    },
    {
      id: "cs-paypal-6",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The funding rail: top payouts per method",
      brief:
        "Growth memo: the wallet home page renders a per-method top-payouts rail — the three biggest payouts each funding source shipped this cycle. Probed: card's rail reads $4,015.00, $3,076.00, $2,807.00; wire's reads $4,000.00, $3,896.00, $3,512.00 — six rows total, and note the near-tie at the top: card's biggest ($4,015.00) beats wire's ($4,000.00) by $15.00, so the rail's ranking has to be deterministic, not vibes. The shape is ROW_NUMBER over a PARTITION BY method, ordered by amount with the id as tie-break, sliced at 3.",
      ask: "Return each funding method's top 3 payouts by amount with the method and payout dollars (2 decimals), method then biggest-first.",
      template:
        "SELECT method, payout_usd\nFROM (SELECT p.method,\n             {1}() OVER (PARTITION BY p.{2} ORDER BY p.amount_cents DESC, p.id) AS rn,\n             ROUND(p.amount_cents / 100.0, 2) AS payout_usd\n      FROM payments p)\nWHERE rn <= {3}\nORDER BY method, payout_usd DESC;",
      slots: [
        {
          answer: "ROW_NUMBER",
          kind: "keyword",
          label: "the position dealer",
          why: "ROW_NUMBER deals strict 1, 2, 3 per partition — exactly N rows per rail, no ties by construction because the id sits in the ORDER BY. LEAD and NTILE in this slot are arity errors (both demand arguments), and SUM() or any bare column is an aggregate/identifier error.",
        },
        {
          answer: "method",
          kind: "keyword",
          label: "the rail partition",
          why: "PARTITION BY p.method restarts the numbering per funding source — card's 1-2-3 and wire's 1-2-3 are independent rails. Partitioning by invoice_id instead produces 22 mini-rails and the WHERE keeps 22 rows — a per-charge rail wearing the funding rail's name.",
        },
        {
          answer: "3",
          kind: "number",
          noVerify: true,
          label: "the rail length",
          why: "The product spec is a three-deep rail: rn <= 3 keeps exactly 6 rows (3 per method). At 5 the rail doubles to 10 rows and the near-tie at the top drowns in filler; at 1 it collapses to the two heads and hides the $3,896.00 wire leg that makes the rail interesting.",
        },
      ],
      distractors: ["LEAD", "NTILE", "SUM", "invoice_id", "5", "DESC"],
      walkthrough:
        "A ranked rail, built in two passes the reader never sees. The derived table partitions 27 payout legs by funding method, orders each partition by amount DESC with the id as the deterministic tie-break, and ROW_NUMBER deals strict positions — 1 through 16 on card, 1 through 11 on wire. The outer slice keeps rn <= 3: card $4,015.00, $3,076.00, $2,807.00; wire $4,000.00, $3,896.00, $3,512.00 — six rows, ordered method then biggest-first. The id in the ORDER BY is not decoration: two same-amount legs would otherwise deal positions in engine-order luck, and a rail that reshuffles between renders is a bug report waiting to happen. The distractors break the shape precisely: LEAD and NTILE in the ranking slot are arity errors, SUM() is an aggregate error, invoice_id as the partition produces 22 mini-rails and a 22-row answer to a 6-row question, 5 doubles the rail to 10 rows, and DESC can't even parse in a ranking slot. Six rows, two rails, one $15.00 margin at the top — and the near-tie is exactly why the tie-break is named in the spec.",
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
    { slug: "chargeback-rate-ranking", why: "Rank funding methods by dispute share with the 100.0-before-division fix — the dispute league table dispute ops opens every review with." },
    { slug: "ar-aging-schedule", why: "Outstanding receivables bucketed by age — the float finance defends at close, charged with the /100.0 read and honest bands." },
    { slug: "settlement-fails-aging", why: "How long money has been promised without landing — the fail-aging view of charge #28 and friends, bucketed and owned." },
    { slug: "balance-rollforward", why: "Opening balance plus movements equals closing — the wallet-balance walk the per-account nets feed, in drill form." },
    { slug: "gl-reconciliation", why: "Two folds that must agree, then the delta query that localizes the row that broke — the wallet ledger's daily audit, taught as a join." },
    { slug: "keep-latest-dedupe", why: "One row per key, latest wins — the dedupe discipline split-funding files demand before any fold trusts the grain." },
    { slug: "uber-first-transaction", why: "First event per entity with a MIN fold — the opening leg of every payout clock and lifecycle story this kit tells." },
    { slug: "find-third-transaction", why: "The Nth row per entity via ROW_NUMBER — the same deterministic pick the first-payout clock is built on, one slot deeper." },
    { slug: "top-percentile-fraud", why: "Percentile gates over money movement — which legs sit in the tail, and the small-n tie discipline the answer names out loud." },
    { slug: "structuring-detection", why: "Amounts layered just under a threshold — the velocity rule variant risk runs against payout legs before a human looks." },
    { slug: "suspicious-bank-account-transactions", why: "Per-account anomaly census with conditional counts — the exception queue's nightly sweep, taught as a fold." },
    { slug: "credit-utilization-bands", why: "CASE bands over a money column with per-band counts — coverage-census shape applied to wallet exposure tiers." },
    { slug: "expected-credit-loss", why: "Probability-weighted money folds — the exposure math wallet accounting runs, graded with the same cents discipline." },
    { slug: "delinquency-buckets", why: "Aging bands over outstanding balances — the dunning ladder's spine, bucketed so every branch reconciles to the population." },
    { slug: "second-day-verification", why: "Confirm the second event lands inside its window — dispute-clock and payout-window verification in one drill." },
    { slug: "point-in-time-asof", why: "As-of anchoring — the idempotency habit that keeps 'unsettled as of today' from drifting under tomorrow's legs." },
  ],
};
