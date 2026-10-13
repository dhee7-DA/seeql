// Revolut — kit 4 of the Fintech & Payments domain (Batch D).
// The neobank: multi-currency accounts, card spend, instant P2P, crypto and
// wealth products, and the Standard→Ultra plan ladder — growth loops with
// dormancy risk on one side and money-movement reconciliation on the other.
// Pool provenance: 4 tagged sql rows in scripts/company-pools.md
// (monthly-transactions-i, fx-exposure-report, circular-transfers,
// dormant-reactivation) + theme-curated fills from the theme menu — every
// problem mirrors a workflow Revolut's growth, risk and Revolut Business
// teams are known to probe.
// Case studies run on the storefront db, mapped honestly as
// customers = account holders (region = market), orders = card/payment
// transactions (status = outcome: delivered+shipped = settled, cancelled =
// failed, pending = in flight), invoices = the billing book (Revolut
// Business mandates), payments = inbound money movement (INTEGER CENTS —
// divide by 100.0), ledger_entries = the double-entry core — with probed
// figures from scripts/company-facts.md only.

import type { CompanyKit } from "../types";

export const revolutKit: CompanyKit = {
  id: "revolut",
  domainId: "fintech",
  name: "Revolut",
  tagline: "Neobanking: accounts, cards, crypto",
  accent: "text-violet-400",

  brief: [
    "Revolut is the global neobank built on one promise: *money should move the way a message does*. Tens of millions of customers hold multi-currency accounts, spend on cards across **150+ markets**, send instant P2P transfers, and stack wealth products — crypto, stocks, commodities — on top of plan tiers that run {violet:Standard through Ultra}. The business is a growth loop with a money-movement spine: activation and funded-account share drive the top of the funnel, card spend and plan subscriptions drive the revenue line, and underneath everything sits a **double-entry ledger** where every transfer, settlement and fee must reconcile to the cent. The analyst's daily tension is exactly that pairing: growth SQL that moves fast, ledger SQL that cannot be wrong.",
    "The data org mirrors the product surface. Growth analytics owns activation funnels and plan-migration reads; risk owns transaction success rates, decline ladders and dormancy; Revolut Business owns the billing book — mandates issued, money received, partial settlements chased. The schema habits are bank-grade: money lands as **INTEGER cents** (a 66443-cent paid book prints as 664.43 dollars only after the `/100.0`), and the books carry the kinds of anomalies that make reconciliation a craft — a {rose:voided} mandate that still received money, a paid mandate with no payment rows at all, and a mandate {amber:settled in installments} that never finished.",
    "Interview style is growth-quantitative with a reconciliation spine. A typical screen walks from a warm-up join to a rate with an honest denominator (funded share, instant-P2P share, success rate), then escalates into either a graph-flavored read (mutual P2P pairs, circular transfer patterns) or a coverage classification ({emerald:exact} / {amber:partial} / {rose:no money} — the anti-join and CASE machinery). Follow-ups probe grain out loud: 'is that per account or per transaction?', *'what happens to an account that never transacted — is it in your denominator?'*. Candidates who narrate the **fan-out risk** before writing the join consistently outperform.",
    "Preparation strategy: the registry tags four problems for Revolut (`monthly-transactions-i`, `fx-exposure-report`, `circular-transfers`, `dormant-reactivation`) — start there, because they map one-to-one onto the month-bucket, FX-normalize, mutual-pair and dormancy screens. The rest of the pool is theme-curated toward the neobank's known reads: plan-tier CASE logic, honest-denominator rates, one-pass censuses, running balances. Then run both case studies on the live storefront db: one rebuilds the **billing-book rollup** its business-banking close runs, the other rebuilds the coverage audit that hunts money which does not match its mandate.",
  ],

  dayInLife: [
    "**08:00 —** The day starts with the money-movement health check: did last night's settlement files land, does inbound transfer value match the billing book, are transaction success rates inside band per market? The first query is almost always a two-sided reconciliation — mandates versus payments, ledger debits versus credits (**181,080 against 181,080, delta zero**) before anyone touches a dashboard. A mismatch here is the day's first fire, and the analyst who can write the diff — which side is short, by how many cents, on which mandate — is the one the operations channel waits on. All money math runs in integer cents; the dollar read happens once, at display, with an explicit `/100.0`.",
    "**11:00 —** Midday splits between growth and risk. A plan-migration read: which tier did accounts move to and from this month, and what did the upgrade cohort spend before versus after — `LAG` windows over account-month spines. A dormancy sweep: accounts whose last transaction crosses the quiet window, ranked by prior spend — a `NOT EXISTS` shape whose 'no rows matched' is the entire answer. A success-rate drop in one market: {rose:decline codes} folded per attempt with the denominator untouched, because a filtered denominator is how a real outage hides behind a healthy-looking rate.",
    "**15:00 —** The afternoon is stakeholder translation. Finance wants the billing close: {emerald:paid}, {sky:open} and {rose:void} books with dollar totals, plus the {amber:partial-settlement} chase list. Product wants instant-P2P share by market — a rate whose numerator and denominator must fold from the same rows. Risk wants the coverage audit: mandates where money ≠ mandate — the one partial, the exposures, and proof the rest reconcile exactly.",
    "**17:30 —** EOD writeup, and every number ships with its SQL attached, because a neobank's defense in any regulator conversation is the query, *not the slide*. The day closes the way it opened: two sides of a money movement, proven equal — or the diff filed for tomorrow's first query.",
  ],

  metrics: [
    { name: "Funded-account share", what: "Accounts holding money ÷ registered accounts. The activation KPI the whole funnel hangs on — and a denominator question (registered includes never-funded) in interview form." },
    { name: "Card spend volume", what: "Settled card value per market per month. The revenue engine's headline — a month-bucketed conditional sum that must exclude failed attempts to stay honest." },
    { name: "Instant P2P share", what: "Instant transfers ÷ all P2P. The product promise measured — a same-fold rate where numerator and denominator live in one GROUP BY or not at all." },
    { name: "Paid-plan mix", what: "Share of active accounts on Plus/Premium/Metal/Ultra. The subscription line — a CASE classification plus a share whose base is active accounts, not signups." },
    { name: "Dormancy rate", what: "Accounts with no transaction in the quiet window ÷ active accounts. The churn-precursor metric — an anti-join whose empty-match semantics ARE the metric." },
    { name: "Wealth attach rate", what: "Share of funded accounts holding any crypto/stocks/commodity position. The cross-sell KPI that turns a bank into a super-app." },
    { name: "Transaction success rate", what: "Settled ÷ attempted card transactions, split by decline reason. The risk team's first dashboard — 6.8% of this db's attempts failed, and the ladder behind that number is the interview." },
    { name: "Billing coverage", what: "Mandate money received ÷ mandate billed — exact, partial or nothing. The Revolut Business close metric this kit's cases rebuild: 21 exact, 6 with nothing, 1 partial ($40.00 of $61.48)." },
  ],

  topics: [
    {
      name: "Money in motion, month by month",
      why: "Every growth review opens on the monthly spine: transactions, value and failures per month, per market. The fold is a GROUP BY over a date bucket with a status rule attached — and the screen checks whether failed attempts pollute your spend total or your count stays population-honest.",
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "FX & latest-rate joins",
      why: "A multi-currency account is a join against a rate table that moves: normalize every balance to one currency using the latest rate as of the transaction moment. Revolut drills the as-of join — grab the most recent rate at or before each event, not the newest rate in the table.",
      slugs: ["fx-exposure-report", "average-selling-price", "product-price-at-a-given-date"],
    },
    {
      name: "P2P graphs & mutual pairs",
      why: "Instant P2P is a graph: A sent B and B sent A within a window is a mutual pair — a self-join with symmetric conditions and a canonicalization habit (least/greatest ordering) so pairs don't double-count. Revolut screens this shape because the same machinery powers both social features and ring-detection risk work.",
      slugs: ["circular-transfers", "symmetric-pairs", "number-of-calls-between-two-persons"],
    },
    {
      name: "Dormancy & reactivation",
      why: "The quiet account is the churn precursor, and 'quiet' is an anti-join: accounts with NO transaction since the cutoff. Revolut drills NOT EXISTS and LEFT JOIN IS NULL as two spellings of the same survival question — and the follow-up is always what your denominator did with never-active accounts.",
      slugs: ["dormant-reactivation", "customers-who-never-order", "find-churn-risk-customers"],
    },
    {
      name: "Coverage & partial settlements",
      why: "Money received against money billed is the reconciliation heart: exact, partial or nothing, per mandate. The LEFT JOIN is mandatory — the mandates with no payment rows are the exposure — and the fan-out from multi-payment mandates is the trap that silently inflates every count.",
      slugs: ["employee-bonus", "bank-account-summary-ii", "combine-two-tables"],
    },
    {
      name: "Plan-tier CASE logic",
      why: "Standard through Ultra is a CASE classification before it is anything else: tier bands, migration labels, A/B arms. Revolut screens exhaustive CASE arms and the pivot — tiers as columns, accounts as rows — because the growth deck reads tier×market grids, not raw event logs.",
      slugs: ["count-salary-categories", "the-category-of-each-member-in-the-store", "loan-types"],
    },
    {
      name: "Spend leaderboards & ranking windows",
      why: "Top senders per market, second-highest single transfer, most recent three transactions per account — leaderboard SQL with ties everywhere. The rank trio with a deterministic tie-break is the tested reflex, because LIMIT-1-OFFSET-1 breaks exactly when two amounts tie.",
      slugs: ["rank-scores", "department-top-three-salaries", "the-most-recent-three-orders"],
    },
    {
      name: "Honest denominators for adoption rates",
      why: "Attach rates, success rates, instant shares — every neobank ratio is a drift risk. The house habit: 100.0 before the division, the denominator's population decided in the same fold as the numerator, and rounding only at the very end.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "One-pass censuses",
      why: "Growth reviews are query-budgeted: the status census, the market census and the tier census each get one scan. Conditional aggregation — COUNT FILTER (WHERE …), SUM(CASE …) — builds the whole picture in a single pass with branch totals that must reconcile to COUNT(*).",
      slugs: ["active-businesses", "number-of-rich-customers", "find-stores-with-inventory-imbalance"],
    },
    {
      name: "Running balances & windows",
      why: "The account spine is a running total: deposits and withdrawals folded chronologically, interest accrued on daily balances, the trailing-7-day activity window. Window frames — ROWS versus the RANGE default — are the difference between the balance the ledger shows and the balance the dashboard shows.",
      slugs: ["account-balance", "last-person-to-fit-in-the-elevator", "restaurant-growth"],
    },
  ],

  theory: [
    {
      id: "revolut-t1",
      q: "The billing book LEFT JOINs inbound transfers. Where does the filter live if you only want mandates from this quarter — and what happens to mandates with no money?",
      a: "Quarter is a property of the MANDATE, so it filters the left table in WHERE and unmatched mandates still survive with NULL payment columns — that survival is the entire point, because a mandate with no money is the exposure the report exists to show. The trap is a right-side filter in WHERE (amount > 0, method = 'card', quarter on the payment date): any such predicate kills the NULL-payload rows, silently converting the LEFT JOIN to an INNER and deleting exactly the mandates you were asked to chase. Right-side rules belong in the ON clause; left-side rules belong in WHERE; and the strong candidate says out loud which side each predicate touches before writing it. At Revolut this is not style — the partial-payment chase list is literally the set of rows a careless WHERE deletes.",
      tag: "joins",
    },
    {
      id: "revolut-t2",
      q: "Five mandates carry two payments each. On invoices LEFT JOIN payments, why do COUNT(*) and SUM(i.amount) both lie, and what is the honest fold?",
      a: "The join fans each split-settled mandate into two rows, so COUNT(*) counts join rows — the paid book reads 26 when it holds 21 mandates — and SUM over the left table's amount double-counts every split mandate's billed value. The honest fold counts the left grain explicitly: COUNT(DISTINCT i.id) folds the fan-out back to mandates. If you must sum the left side at this grain, pre-aggregate the right side first (payments grouped by mandate in a derived table or CTE) so the join is one-to-one and every aggregate is safe. The general law the interviewer wants stated: join first, then aggregate, is a grain decision — know what one row means after your join, or every COUNT and SUM downstream inherits the confusion.",
      tag: "aggregation",
    },
    {
      id: "revolut-t3",
      q: "Build the plan-migration read: for each account-month, the tier it held and the tier it moved from. What window machinery does this need?",
      a: "LAG over a per-account chronological spine: LAG(tier) OVER (PARTITION BY account_id ORDER BY month) returns the previous month's tier on the same row, and the migration label is CASE WHEN prev IS NULL THEN 'new' WHEN prev = tier THEN 'same' ELSE prev || '→' || tier END. PARTITION BY is what keeps one account's history from bleeding into another's — omit it and LAG reads across account boundaries, pairing one customer's upgrade with a stranger's downgrade. The order key must be deterministic (month, then a tie-breaker), because two events in one month make 'previous' ambiguous and the engine will pick silently. At Revolut the migration grid this produces — upgrade, downgrade, reactivation, churn — is the growth team's monthly heartbeat, and the whole read is one window plus one CASE.",
      tag: "windows",
    },
    {
      id: "revolut-t4",
      q: "An account's last_transaction_at is NULL. What are the possible meanings, and what is your policy in a dormancy report?",
      a: "Three meanings: never active (registered, never funded — an activation failure), data gap (the event pipeline lost the trail — an incident), or genuinely no recent activity in the window you care about. SQL cannot distinguish them from the column, so the policy is to classify deliberately: COALESCE(last_transaction_at, created_at) treats never-active as 'quiet since signup' — a real segment, arguably the most actionable one — while a bare WHERE last_transaction_at < cutoff silently drops the never-active accounts from the dormancy report entirely. The strong answer names the choice: either the report says 'dormant among once-active accounts' or it coalesces and says 'quiet since signup included'. What it must not do is let NULL semantics make the decision by accident — at a neobank the never-funded segment is a growth target, not a rounding error.",
      tag: "nulls",
    },
    {
      id: "revolut-t5",
      q: "You want markets whose average transaction exceeds 100 — and separately, transactions over 100. Same predicate, different clause. Explain.",
      a: "The predicate 'value > 100' on a row is WHERE material — it runs before aggregation and discards rows. The predicate 'average value > 100' on a group is HAVING material — it runs after GROUP BY and discards groups. Confusing them fails two ways: WHERE AVG(value) > 100 is a hard error (no groups exist yet), and putting the row filter in HAVING works only by accident while hiding the intent. The pipeline order is the answer's backbone: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — row facts filter early, group results gate late. The Revolut framing: 'high-value transactions per market' and 'high-value markets' are different products of the same data, and the clause placement is the only thing telling them apart — which is exactly why interviewers watch where the predicate lands.",
      tag: "filtering",
    },
    {
      id: "revolut-t6",
      q: "Your coverage query joins each mandate to a per-mandate payment total. Why does the derived table earn its keep, and what breaks without it?",
      a: "Without the pre-aggregation, the join fans out — a mandate with three payments appears three times, and any SUM over the left side triple-counts its billed amount. The derived table (SELECT mandate_id, SUM(amount) FROM payments GROUP BY mandate_id) collapses the money side to one row per mandate first, making the join one-to-one: now the coverage CASE compares one total to one mandate and the outer aggregation is trustworthy. The classification itself is exhaustive by construction — NULL total means no money, equality means exact, anything else is partial — and each arm is a business state someone chases. The follow-up the interviewer wants answered: what does the LEFT JOIN to the derived table do for mandates with no payments at all? It keeps them with NULL totals — which is precisely the arm the exposure report reads. Join type plus pre-aggregation plus exhaustive CASE: the coverage census in one breath.",
      tag: "subqueries",
    },
    {
      id: "revolut-t7",
      q: "Transaction timestamps arrive as TEXT. How do you build the monthly spend calendar, and where does the calendar lie if you're careless?",
      a: "STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on fixed-width ISO text — builds the month spine every growth deck hangs on; bucket, then fold spend with the status rule inside the aggregate (settled only), never as a post-hoc subtraction. The calendar lies three ways: half-open intervals — created_at >= '2025-01-01' AND < '2025-02-01' — are mandatory because BETWEEN on the last day drops the final night's burst; a changed timestamp width quietly breaks the SUBSTR shortcut and mis-buckets everything after it; and TEXT dates sort lexicographically, which is correct ONLY while the format stays ISO — one '1/2/2025' in the feed and the spine reorders itself. State the convention, bucket defensively, round at the end — the spend calendar is the most-shipped query in the building and the most taken for granted.",
      tag: "dates",
    },
    {
      id: "revolut-t8",
      q: "The books contain a voided mandate that received money and a paid mandate with no payments. What does your data-quality pass check before any growth metric ships?",
      a: "Three checks, in order. Units: money columns are integer cents — amount_cents / 100.0 with the .0, or every odd-cent row truncates and the error propagates into every rate downstream. Ledger proof: debits equal credits (181080 against 181080, delta 0 here) — run it first because every metric inherits the ledger's integrity. Label-versus-reality: status is a claim, the money-movement table is evidence — the void-but-paid mandate and the paid-with-no-payments mandate are exactly the rows where the label lies, and any rate computed over status alone absorbs the lie silently. The strong candidate treats these as one scan: units normalized, delta zeroed, labels cross-checked against movement — then, and only then, activation funnels and plan mixes. Data quality is not a phase; it is the query you run before the queries.",
      tag: "data-quality",
    },
  ],

  mcqs: [
    {
      id: "revolut-mcq-1",
      prompt: "invoices LEFT JOIN payments: 28 mandates, 5 with two payments each. What does COUNT(*) return that COUNT(DISTINCT i.id) does not?",
      choices: [
        "The number of mandates (28)",
        "The number of join rows — split-settled mandates counted twice (33)",
        "The number of payments (27)",
        "The number of unmatched mandates (6)",
      ],
      answer: 1,
      why: "The fan-out duplicates each split mandate's row: COUNT(*) counts 33 join rows while COUNT(DISTINCT i.id) folds back to the 28 mandates. On the paid book specifically: 26 join rows vs 21 mandates.",
      notes: [
        { choice: 0, why: "28 is the DISTINCT count. COUNT(*) cannot see the fold — it counts whatever the join produced, duplicates included." },
        { choice: 2, why: "27 is COUNT(p.id) — the money side. The two counts disagree (33 vs 27) precisely because unmatched mandates contribute a row with no payment." },
      ],
      difficulty: "medium",
    },
    {
      id: "revolut-mcq-2",
      prompt: "Mandate #25 is billed 6148 cents; transfers received total 4000 cents. Which CASE arm classifies it, and what does the NULL arm catch?",
      choices: [
        "exact — because some money arrived",
        "partial — money received but not equal to billed; the NULL arm catches mandates with no payment rows at all",
        "partial; the NULL arm catches voided mandates",
        "no payment — because 4000 < 6148",
      ],
      answer: 1,
      why: "The exhaustive classification is: total IS NULL → 'no payment' (the LEFT JOIN's unmatched payloads), total = billed → 'exact', else → 'partial'. #25 lands in partial: $40.00 of $61.48 — the chase list's first entry.",
      notes: [
        { choice: 0, why: "exact requires equality. 'Some money arrived' is the definition of partial — the arm exists precisely because most real mismatches aren't zero." },
        { choice: 2, why: "Status labels are claims, not evidence — the classification runs on money movement. Voided mandates classify by their payments like anyone else." },
      ],
      difficulty: "medium",
    },
    {
      id: "revolut-mcq-3",
      prompt: "In `COUNT({?} i.id)` inside the fanned-out join, what does the ALL keyword produce?",
      choices: [
        "The same as DISTINCT — ALL is the default modifier",
        "The same as a bare COUNT(i.id) — join-row counts, split mandates counted twice",
        "A syntax error — ALL is not valid inside COUNT",
        "The count of distinct payment rows",
      ],
      answer: 1,
      why: "COUNT(ALL x) is the explicit spelling of COUNT(x): it counts non-NULL values with duplicates intact — 26 on the paid book where DISTINCT says 21. The fan-out survives; the fold doesn't happen.",
      notes: [
        { choice: 0, why: "ALL is indeed the default — which is exactly the trap: it's the opposite of DISTINCT, and writing it explicitly doesn't change what the default was already doing." },
        { choice: 2, why: "ALL is perfectly valid SQL. The error would be assuming it dedupes — dedupe is DISTINCT's whole job." },
      ],
      difficulty: "medium",
    },
    {
      id: "revolut-mcq-4",
      prompt: "The paid book totals 66443 cents over 21 mandates. Which SELECT prints the correct dollar figure?",
      choices: [
        "SELECT SUM(amount_cents) / 100 FROM invoices WHERE status = 'paid'",
        "SELECT SUM(amount_cents) / 100.0 FROM invoices WHERE status = 'paid'",
        "SELECT SUM(amount_cents / 100) FROM invoices WHERE status = 'paid'",
        "SELECT AVG(amount_cents) FROM invoices WHERE status = 'paid'",
      ],
      answer: 1,
      why: "Fold in cents, convert once with a REAL divisor: 66443 / 100.0 = 664.43. INTEGER division by 100 truncates to 664; per-row integer division corrupts every odd-cent mandate before the fold.",
      notes: [
        { choice: 0, why: "INTEGER / INTEGER is integer division: 664. The missing .0 is the most expensive typo in fintech SQL." },
        { choice: 3, why: "AVG answers a different question — the per-mandate mean (3163.95 cents), not the book total. Units and question both drift." },
      ],
      difficulty: "easy",
    },
    {
      id: "revolut-mcq-5",
      prompt: "Which WHERE captures every January 2025 transaction on a TEXT timestamp column, including '2025-01-31 23:59:59'?",
      choices: [
        "WHERE created_at BETWEEN '2025-01-01' AND '2025-01-31'",
        "WHERE created_at >= '2025-01-01' AND created_at < '2025-02-01'",
        "WHERE STRFTIME('%Y', created_at) = '2025'",
        "WHERE created_at LIKE '%2025-01%'",
      ],
      answer: 1,
      why: "The half-open interval [Jan 1, Feb 1) admits every timestamp in the month. Month-end bursts are real money: BETWEEN silently drops everything after midnight on the 31st.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive both ends — '2025-01-31 23:59:59' > '2025-01-31' (midnight), so it fails the upper bound. The last night of the month vanishes." },
        { choice: 2, why: "That's the year, not the month — it captures all of 2025. Bucket functions belong in GROUP BY, not as substitute filters." },
      ],
      difficulty: "easy",
    },
    {
      id: "revolut-mcq-6",
      prompt: "Which query finds dormant accounts — funded accounts with NO transaction since '2025-01-01'?",
      choices: [
        "SELECT id FROM accounts WHERE last_txn > '2025-01-01'",
        "SELECT a.id FROM accounts a LEFT JOIN tx t ON t.account_id = a.id AND t.created_at >= '2025-01-01' WHERE t.id IS NULL",
        "SELECT id FROM accounts WHERE last_txn IS NULL",
        "SELECT a.id FROM accounts a INNER JOIN tx t ON t.account_id = a.id WHERE t.created_at < '2025-01-01'",
      ],
      answer: 1,
      why: "Dormancy is an anti-join: LEFT JOIN with the activity predicate in ON (so unmatched survivors keep NULLs), then WHERE t.id IS NULL keeps exactly the accounts with no qualifying transaction. NOT EXISTS is the equivalent spelling.",
      notes: [
        { choice: 0, why: "That's the ACTIVE accounts — and NULL last_txn fails the comparison, so never-active accounts vanish too. Double inversion." },
        { choice: 2, why: "NULL last_txn means never active, not dormant-since-January — and a funded account with an old activity stamp has a non-NULL date that this misses entirely." },
      ],
      difficulty: "hard",
    },
    {
      id: "revolut-mcq-7",
      prompt: "In the plan-migration read, what does LAG(tier) OVER (ORDER BY month) — no PARTITION BY — actually compute?",
      choices: [
        "The same as with PARTITION BY — ordering alone scopes the window",
        "The previous row's tier across the WHOLE table — one account's history bleeds into the next account's",
        "An error — LAG requires PARTITION BY",
        "The first tier the account ever held",
      ],
      answer: 1,
      why: "Without PARTITION BY the window is the entire result set: the 'previous tier' of each account's first month is some OTHER account's last tier. Migrations across account boundaries are noise the grid would ship as signal.",
      notes: [
        { choice: 0, why: "ORDER BY sequences rows; only PARTITION BY groups the sequence per account. Omitting it is the classic window leak." },
        { choice: 2, why: "LAG runs happily without a partition — that's what makes the bug silent. It returns values, just from the wrong scope." },
      ],
      difficulty: "hard",
    },
    {
      id: "revolut-mcq-8",
      prompt: "One scan must return attempts, failures, pending and settled counts together. Which shape does it?",
      choices: [
        "Four separate queries with four WHERE clauses",
        "COUNT(*) FILTER (WHERE status = …) branches alongside a bare COUNT(*)",
        "GROUP BY status, then add the counts by hand",
        "SUM over one CASE with a single arm",
      ],
      answer: 1,
      why: "FILTER (WHERE …) counts each branch in one pass — attempted 103, failed 7, pending 14, settled 82 — with branch totals that reconcile to the bare COUNT(*). One scan, self-checking.",
      notes: [
        { choice: 0, why: "Four scans answer the question but abandon the reconciliation property: nothing guarantees the branches sum to the whole when they come from different passes." },
        { choice: 2, why: "GROUP BY status produces four ROWS, not one — the deliverable was a single census row whose columns cross-check." },
      ],
      difficulty: "easy",
    },
    {
      id: "revolut-mcq-9",
      prompt: "`SELECT market, SUM(CASE WHEN settled THEN 1 ELSE 0 END) / COUNT(*) AS rate FROM tx GROUP BY market` — every market reads 0. Why?",
      choices: [
        "The CASE never fires on this data",
        "Integer division: the INTEGER numerator divided by the INTEGER denominator truncates before any share survives",
        "GROUP BY collapses the markets",
        "SUM cannot live inside a CASE",
      ],
      answer: 1,
      why: "SUM(flag) and COUNT(*) are both INTEGER; INTEGER / INTEGER truncates toward zero, so any share under 100% prints 0. The fix is 100.0 * SUM(...) / COUNT(*) — real division, and the share arrives at a readable scale.",
      notes: [
        { choice: 0, why: "The CASE fires — SUM returns the right numerator. The division is where the number dies, silently, on every row." },
        { choice: 2, why: "GROUP BY did its job — the markets are there. The rate column is the casualty: same groups, wrong arithmetic." },
      ],
      difficulty: "medium",
    },
    {
      id: "revolut-mcq-10",
      prompt: "The close stitches the settled packet and the outstanding packet into one report. A definition bug later makes the packets overlap. What does UNION do that UNION ALL does not?",
      choices: [
        "UNION errors on overlap — safer",
        "UNION silently deletes the duplicated rows — the report still balances and the bug stays invisible",
        "UNION ALL errors on overlap",
        "No difference — both keep duplicates",
      ],
      answer: 1,
      why: "UNION applies an implicit DISTINCT across the stack: overlap rows collapse, totals still tie out, and the evidence is gone. The house rule is UNION ALL for disjoint-by-construction packets — dedupe is an unrequested mutation of a reconciliation artifact.",
      notes: [
        { choice: 0, why: "No error — that's the danger. UNION happily dedupes; only column-count mismatches raise errors." },
        { choice: 2, why: "UNION ALL is the one that keeps everything — overlap rows appear twice, which is exactly the anomaly the close would want to see." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-revolut-1",
      tier: "medium",
      topic: "j4",
      universe: "month-close",
      title: "The billing-book shortfall rollup",
      brief:
        "Revolut Business close brief on the storefront db: the billing book (invoices) LEFT JOINs inbound money movement (payments) and rolls up by book status — paid, open, void — because finance signs the close only when every book is counted at its own grain. Probed facts: 28 mandates — 21 paid totalling 66443 cents ($664.43), 6 open totalling 19609 cents ($196.09), 1 void for 925 cents ($9.25) — against 27 payments in the ledger. The known anomalies: five mandates carry two payments each, one voided mandate (#11) still received its 925 cents, one paid mandate (#28) has no payment rows at all, and one open mandate (#25) is partially settled at 4000 of 6148 cents. The fan-out is the test: count mandates, not join rows.",
      ask: "Return each book status with mandate count (DISTINCT) and settlement-row count, biggest book first.",
      template:
        "SELECT i.status,\n       COUNT({1} i.id) AS mandates,\n       {2}(p.id) AS settlements\nFROM invoices i\n{3} JOIN payments p ON p.invoice_id = i.id\nGROUP BY i.status\nORDER BY mandates {4};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the mandate fold",
          why: "Five mandates carry two payments each, so the join fans them out: COUNT(DISTINCT i.id) folds the fan-out back to the probed counts — 21 paid, 6 open, 1 void. The bare COUNT would read 26 for the paid book and 33 overall.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the settlement-row counter",
          why: "COUNT(p.id) counts non-NULL payment rows per book — 25 settle the paid book, 1 lands on still-open #25, 1 on voided #11. SUM would add up primary keys: a number with no meaning in any close.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the exposure-keeping join",
          why: "LEFT keeps every mandate, including the 6 with no payment rows — the shortfall the close exists to name. INNER would delete the unpaid six and the open book would shrink from 6 mandates to 1 (only #25 has a payment).",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The close reads the paid book first — 21, then 6, then 1. ASC would open with the void row: a correct query leading with the smallest book in the ledger.",
        },
      ],
      distractors: ["ALL", "INNER", "ASC", "SUM"],
      walkthrough:
        "A rollup where the join's grain is the entire test. The LEFT JOIN keeps all 28 mandates; the five two-payment mandates fan out, and that fan-out is the trap this close is built to catch: COUNT(DISTINCT i.id) counts mandates (21 paid, 6 open, 1 void — the probed distribution), while a bare COUNT would count join rows and print 26/6/1 — 33 rows for a 28-row book. The settlement column counts the money side: 25 of the ledger's 27 payments settle the paid book; the other two land on still-open #25 (the 4000-of-6148 partial) and voided #11 (paid after void — the anomaly). INNER would erase the unpaid six, shrinking the open book to a single mandate and hiding the shortfall the close exists to chase. ORDER BY mandates DESC reads paid → open → void, biggest book first. The habit being graded: after any join, say what one row means — here, one join row is a mandate-payment pair, and neither business question (how many mandates, how many payments) is answered by counting that hybrid.",
    },
    {
      id: "cs-revolut-2",
      tier: "hard",
      topic: "q5",
      universe: "fraud",
      title: "The coverage audit: money vs mandate",
      brief:
        "Revolut risk audit on the storefront db: every mandate must reconcile against the money that actually arrived, and the audit sorts the book into three coverage classes — exact (money = mandate), partial (some money, not all), no payment (nothing arrived). Pre-aggregate the money side per mandate, then classify. Probed facts: 21 exact mandates totalling 65612 cents ($656.12), 6 with no payment totalling 15217 cents ($152.17), 1 partial — mandate #25 at 4000 of 6148 cents ($40.00 of $61.48). The classes ARE the deliverable: the partial is the chase list, the no-payment six are the exposure, and the exact twenty-one are the proof the machine works. Note the known wrinkle the classification must be allowed to surface: voided #11 received its 925 cents — label versus movement is exactly what this audit exists to compare.",
      ask: "Return each coverage class with mandate count and billed dollars (2 decimals), biggest billed book first.",
      template:
        "SELECT CASE\n         WHEN t.total_paid IS NULL THEN 'no payment'\n         WHEN t.total_paid = i.amount_cents THEN 'exact'\n         ELSE 'partial'\n       END AS coverage,\n       {1}(*) AS mandates,\n       ROUND({2}(i.amount_cents) / 100.0, 2) AS billed\nFROM invoices i\nLEFT JOIN ({3} invoice_id, SUM(amount_cents) AS total_paid\n           FROM payments GROUP BY invoice_id) t\n  ON t.invoice_id = i.id\nGROUP BY coverage\nORDER BY billed {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the mandate counter",
          why: "COUNT(*) over the classified rows counts mandates per class — 21 exact, 6 no payment, 1 partial, the probe's exact distribution. SUM(*) does not exist and MAX(*) is a syntax error: only COUNT takes the star.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the billed-value fold",
          why: "SUM over the left table's cents folds each class's billed book — 65612, 15217, 6148 — then /100.0 prints dollars. COUNT would divide a row count by 100 and print 0.21/0.06/0.01: cents-shaped noise.",
        },
        {
          answer: "SELECT",
          kind: "keyword",
          label: "the derived-table opener",
          why: "The money side must be pre-folded to one row per mandate before the join — SELECT invoice_id, SUM(amount_cents) … GROUP BY invoice_id is that fold. Any non-SELECT token there is a syntax error and the audit never runs.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "Billed DESC reads exact ($656.12) → no payment ($152.17) → partial ($61.48): proof first, exposure second, chase list last. ASC would open the audit with the single partial mandate — the smallest book in the building.",
        },
      ],
      distractors: ["MAX", "COUNT", "ASC", "AVG"],
      walkthrough:
        "The coverage census: pre-aggregate, join one-to-one, classify exhaustively. The derived table folds 27 payments to one total per mandate; the LEFT JOIN keeps all 28 mandates — the six with no payment arrive with NULL totals, which is exactly what the CASE's first arm exists to catch. Classification is exhaustive by construction: NULL → 'no payment' (6 mandates, $152.17 of exposure), equality → 'exact' (21 mandates, $656.12 — including voided #11 whose 925 cents arrived: label vs movement, surfaced not hidden), everything else → 'partial' (mandate #25, $40.00 of $61.48 — the chase list). GROUP BY the classification folds counts and billed value per class; /100.0 converts cents to dollars exactly once, at the end. MAX in the value slot prints each class's largest single mandate instead of the book total, and ASC inverts the read order — both plausible-looking, both wrong for the memo. The habit being graded: the join is one-to-one ONLY because the money side was pre-aggregated — skip that fold and the fan-out silently double-counts every split-settled mandate in the exact book.",
    },
  ],

  problems: [
    { slug: "monthly-transactions-i", why: "Tagged for Revolut. Month-bucket spend with a failure count alongside — the spend calendar whose settled-only rule keeps the growth line honest." },
    { slug: "fx-exposure-report", why: "Tagged for Revolut. Normalize balances at the latest rate as of each moment — the multi-currency account's defining join, as-of discipline included." },
    { slug: "circular-transfers", why: "Tagged for Revolut. Mutual transfer pairs with a canonical ordering — the P2P graph read that doubles as ring-detection risk work." },
    { slug: "dormant-reactivation", why: "Tagged for Revolut. NOT EXISTS over the activity window — the dormancy sweep whose empty-match semantics ARE the churn signal." },
    { slug: "bank-account-summary-ii", why: "Money-in/money-out per account with the net folded honestly — the account statement every Revolut customer sees, in query form." },
    { slug: "number-of-rich-customers", why: "The funded-and-funded-well census: COUNT DISTINCT over a balance threshold — activation depth in one aggregate." },
    { slug: "confirmation-rate", why: "Per-entity success rate with LEFT JOIN keeping zero-event rows — the transaction success rate where unmatched accounts count as zero, not as missing." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one query with the 100.0-before-division fix — the honest-denominator reflex behind every attach-rate read." },
    { slug: "monthly-transactions-ii", why: "Failed-versus-rest month packets via UNION — the two-population stitch the growth deck uses to show failure share without a self-join." },
    { slug: "count-salary-categories", why: "CASE tiers plus UNION ALL totals — the plan-mix census (Standard through Ultra) whose grand row must reconcile to COUNT(*)." },
    { slug: "credit-utilization-bands", why: "Latest-row banding per entity — the credit-limit read: each account's most recent utilization, banded, no double-counting." },
    { slug: "delinquency-buckets", why: "DPD bucketing — the collections spine. How many accounts sit 1-30, 31-60, 61-90 days past due: CASE arms that must be exhaustive." },
    { slug: "cohort-retention-matrix", why: "Cohort × month retention grid — the activation-locomotive chart: do accounts funded in month N still transact in month N+2." },
    { slug: "trial-balance-check", why: "Debits-equal-credits in one conditional SUM — the ledger proof (181080 vs 181080 here) that gates every close before a dashboard ships." },
    { slug: "plan-migration-paths", why: "LAG transitions per entity — the plan-migration grid: Standard→Premium upgrades and the downgrades the revenue team watches first." },
    { slug: "daily-balance-interest", why: "Interest accrued off a daily balance spine — the savings-product read where a missing day silently underpays every customer." },
  ],
};
