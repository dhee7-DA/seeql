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
    "Preparation strategy: the registry tags four problems for Revolut (`monthly-transactions-i`, `fx-exposure-report`, `circular-transfers`, `dormant-reactivation`) — start there, because they map one-to-one onto the month-bucket, FX-normalize, mutual-pair and dormancy screens. The rest of the pool is theme-curated toward the neobank's known reads: plan-tier CASE logic, honest-denominator rates, one-pass censuses, running balances — built for spaced practice rather than one sitting. Then run the six case studies on the live storefront db, in the order the neobank reads itself: the **billing-book rollup** the business-banking close signs, the **coverage audit** that hunts money which does not match its mandate, the **quiet-since-cutoff sweep** the winback team acts on, the **close packet with the grand-total row** finance stacks and reconciles, the **month-over-month spend spine** the growth memo is built on, and the **decline map as a pivot** the risk deck compares markets with.",
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
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "user-activity-for-the-past-30-days-i", "growth-accounting", "mrr-waterfall", "net-revenue-retention"],
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
      slugs: ["dormant-reactivation", "customers-who-never-order", "find-churn-risk-customers", "week-over-week-churn", "winback-recovery"],
    },
    {
      name: "Coverage & partial settlements",
      why: "Money received against money billed is the reconciliation heart: exact, partial or nothing, per mandate. The LEFT JOIN is mandatory — the mandates with no payment rows are the exposure — and the fan-out from multi-payment mandates is the trap that silently inflates every count.",
      slugs: ["employee-bonus", "bank-account-summary-ii", "combine-two-tables"],
    },
    {
      name: "Plan-tier CASE logic",
      why: "Standard through Ultra is a CASE classification before it is anything else: tier bands, migration labels, A/B arms. Revolut screens exhaustive CASE arms and the pivot — tiers as columns, accounts as rows — because the growth deck reads tier×market grids, not raw event logs.",
      slugs: ["count-salary-categories", "the-category-of-each-member-in-the-store", "loan-types", "analyze-subscription-conversion", "trial-to-paid-funnel", "rfm-segmentation"],
    },
    {
      name: "Spend leaderboards & ranking windows",
      why: "Top senders per market, second-highest single transfer, most recent three transactions per account — leaderboard SQL with ties everywhere. The rank trio with a deterministic tie-break is the tested reflex, because LIMIT-1-OFFSET-1 breaks exactly when two amounts tie.",
      slugs: ["rank-scores", "department-top-three-salaries", "the-most-recent-three-orders", "spend-histogram"],
    },
    {
      name: "Honest denominators for adoption rates",
      why: "Attach rates, success rates, instant shares — every neobank ratio is a drift risk. The house habit: 100.0 before the division, the denominator's population decided in the same fold as the numerator, and rounding only at the very end.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "percentage-of-users-attended-a-contest", "funnel-step-conversion", "median-time-to-convert"],
    },
    {
      name: "One-pass censuses",
      why: "Growth reviews are query-budgeted: the status census, the market census and the tier census each get one scan. Conditional aggregation — COUNT FILTER (WHERE …), SUM(CASE …) — builds the whole picture in a single pass with branch totals that must reconcile to COUNT(*).",
      slugs: ["active-businesses", "number-of-rich-customers", "find-stores-with-inventory-imbalance", "dau-wau-stickiness", "rolling-7d-actives", "new-users-daily-count"],
    },
    {
      name: "Running balances & windows",
      why: "The account spine is a running total: deposits and withdrawals folded chronologically, interest accrued on daily balances, the trailing-7-day activity window. Window frames — ROWS versus the RANGE default — are the difference between the balance the ledger shows and the balance the dashboard shows.",
      slugs: ["account-balance", "last-person-to-fit-in-the-elevator", "restaurant-growth", "users-with-two-purchases-within-seven-days"],
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
    {
      id: "revolut-t9",
      q: "The dormancy sweep — accounts with no transaction since the cutoff. Compare NOT EXISTS, NOT IN and LEFT JOIN … IS NULL: which spelling can silently return zero rows, and why?",
      a: "NOT IN is the silent failure. x NOT IN (subquery) is never TRUE when the subquery returns even one NULL — the comparison is UNKNOWN and the whole sweep reports an empty dormancy list while never-funded accounts sit unpicked in the table. NOT EXISTS is NULL-safe: it asks whether even one qualifying transaction exists, and NULL keys never qualify, so the quiet accounts survive. LEFT JOIN with the activity predicate in the ON clause plus IS NULL is the equivalent spelling — but move that date predicate into WHERE and the join collapses to INNER, deleting exactly the rows the sweep exists to name. House rule: anti-joins are NOT EXISTS or LEFT JOIN/IS NULL, never NOT IN over a nullable key, and the follow-up is always what your denominator did with never-active accounts.",
      tag: "joins",
    },
    {
      id: "revolut-t10",
      q: "The daily health row: accounts, funded, transacted, failed attempts — all side by side, branches reconciling to the total. How do you build it in one scan, and what does the reconciliation property buy you?",
      a: "COUNT(*) FILTER (WHERE …) branches beside a bare COUNT(*) — or the portable SUM(CASE WHEN … THEN 1 ELSE 0 END) twin — fold every branch from the same rows the total counts, so branch sums equal COUNT(*) by construction. The property is the product: when a branch stops summing to the total, a status or state value has entered the stream that no branch anticipated, and the census reports the anomaly without being asked. Separate queries lose the guarantee — nothing ties four independent scans to one population — and GROUP BY status answers with rows when the ask was columns. At Revolut this row is the morning's first query: activation, success and failure read from one fold, each branch carrying its own population.",
      tag: "aggregation",
    },
    {
      id: "revolut-t11",
      q: "A coverage rate divides by the number of mandates in scope, and one slice has zero mandates. What does SQLite return for x/0, and what is the deliberate spelling?",
      a: "SQLite returns NULL for division by zero — no error, no zero; the rate column carries NULL and downstream consumers quietly drop the row. The silence is the hazard: an empty population and a broken join are indistinguishable in the output. The deliberate spelling is SUM(covered) / NULLIF(COUNT(*), 0), which states 'empty scope is a NULL the report will label' instead of letting the engine decide. And never patch it with COALESCE(..., 0) reflexively — a 0% coverage rate printed for a slice with no mandates reads as a collections emergency when the truth is nobody billed. Name the empty population; that is the whole fix.",
      tag: "nulls",
    },
    {
      id: "revolut-t12",
      q: "The running balance spine folds deposits and withdrawals chronologically. Where do ROWS and RANGE frames disagree, and which does the ledger's balance want?",
      a: "The default frame is RANGE, which admits PEERS — rows tied on the ORDER BY value — so two same-timestamp movements are folded as one step and the balance jumps by their sum. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks physical rows, giving each movement its own intermediate balance in whatever order the engine broke the tie. Neither is wrong until unstated: the ledger wants a deterministic walk, so the discipline is ROWS plus a tie-break in ORDER BY (timestamp, then entry id) whenever same-moment rows exist. The interview tail: a dashboard balance and a ledger balance that disagree by one same-second transfer is exactly this frame choice made by accident.",
      tag: "windows",
    },
    {
      id: "revolut-t13",
      q: "Each market's share of total card spend must print on every row of the growth deck's spend table. Compare the window spelling against the scalar subquery and the cross join.",
      a: "The window spelling: spend / SUM(spend) OVER () — after GROUP BY market, the empty OVER () fold computes the grand total once and pairs it with every row; one scan, and the denominator is visible on each row, which makes the share auditable. The scalar subquery computes the same total but re-reads the table per row, and on a filtered slice its inner fold can be empty — a NULL denominator that silently returns no rows. The cross join to an aggregated copy materializes the same pairing the window gets free. House default is the window, and the follow-up the interviewer wants: on this db the split is EU $9,553.02 of $14,850.96 settled spend — a share whose population you can point at, not a number that fell off a chart.",
      tag: "windows",
    },
    {
      id: "revolut-t14",
      q: "'Transactions AND distinct accounts per market' — why is that two grains in one fold, and what does the gap between the counts signal?",
      a: "COUNT(*) counts transactions — rows; COUNT(DISTINCT customer_id) counts accounts — instruments that showed up. Both live in one SELECT over the same GROUP BY and the same WHERE, so the pair is honest by construction, and the gap is intensity: a market with 37 transactions from 5 accounts is a power-user story; 37 from 30 is breadth. The classic distortion is filtering one count and not the other — a settled-only filter on transactions while the account count stays unfiltered makes the ratio fiction. The interview phrasing that lands: 'one scan, two grains, same population — and the gap between them is the growth signal the deck ships.'",
      tag: "groupby",
    },
    {
      id: "revolut-t15",
      q: "Account references arrive as TEXT — '99', '100', '1000' — and the leaderboard must order them numerically. What breaks and what fixes it?",
      a: "TEXT comparison is lexicographic: '1000' sorts before '99' because '1' < '9', so the bare ORDER BY mislabels the leaderboard the moment reference widths vary — and MIN/MAX on the same column return the alphabetically extreme, not the numeric extreme. The fix is an explicit numeric read at the one point that needs it: ORDER BY CAST(ref AS INTEGER). The reason the column is TEXT is usually leading zeros — '0412' is an identifier, not a quantity — so the house habit is CAST for ordering and arithmetic, TEXT for identity. The bug is beloved in interviews because it is silent: the query runs, the order looks plausible, and only the reader who knows the data notices '1000' sitting above '99'.",
      tag: "text",
    },
    {
      id: "revolut-t16",
      q: "You bucket card transactions by month with STRFTIME and the chart comes back with sixty buckets. What happened, and how do you catch it before it ships?",
      a: "The format string was '%M' — minutes, not months. STRFTIME's vocabulary: %m is the two-digit month, %Y the four-digit year, %M minutes-zero-padded, %S seconds; the monthly spine is '%Y-%m'. The bug is perfectly silent — the query runs, buckets are consistent, and only the labels ('00' through '59') betray it, usually after the deck ships. The catch is cheap: any new bucket query gets a MIN/MAX of its own bucket column as a sanity gate — a month spine returns '2024-01' to '2025-02', a minute spine returns '00' to '59', and the check is one line. Habit over cleverness: pin the house bucket string, gate every new calendar with its own extremes.",
      tag: "dates",
    },
    {
      id: "revolut-t17",
      q: "The coverage CASE classifies exact, partial and no-payment but omits ELSE. A mandate with a new status arrives. What does the arm hold, and what does it do to the class counts?",
      a: "A CASE with no ELSE yields NULL on unmatched rows — not zero, not an error. The class counts then lie by omission: COUNT(coverage) skips NULLs, so exact + partial + no-payment stops summing to COUNT(*), and the reconciliation check — the one property a coverage census must have — fires. The tempting fixes are worse: ELSE 'other' buries the new state in a bucket nobody reads, and an implicit zero misreads 'unclassified' as 'known zero exposure'. The house pattern is exhaustive-by-construction: an explicit arm that surfaces the unexpected, plus the branch-sum check on every census row. At a neobank, new states enter the stream constantly — a product launch, a new decline reason — and the code must meet them loudly.",
      tag: "case",
    },
    {
      id: "revolut-t18",
      q: "The report needs the mean basket of SETTLED card transactions AND the full attempt count on the same row. How do you fold both without shrinking a population?",
      a: "AVG(CASE WHEN status IN ('delivered','shipped') THEN total END): the CASE yields NULL on non-settled rows and AVG skips NULLs, so the mean runs over settled baskets while COUNT(*) on the same fold counts every attempt — 103 on this db, 82 of them settled. The WHERE version computes the right mean but shrinks the row's population, so the attempt count printed beside it is no longer the attempt count of the market. This is the conditional-aggregate family's contract: one scan, several populations, each fold carrying its own inside the aggregate. Say the populations out loud — 'mean over settled, count over attempts' — because a growth number whose population drifted is not a typo; it is a decision made on fiction.",
      tag: "aggregation",
    },
    {
      id: "revolut-t19",
      q: "A multi-currency account normalizes each transaction at the latest FX rate as of the transaction moment. What does the as-of join look like, and where does the naive version break?",
      a: "The correlated shape: (SELECT rate FROM fx WHERE quoted_at <= t.created_at ORDER BY quoted_at DESC LIMIT 1) — the newest quote at or before each transaction, one row, per event. The naive version — the newest rate in the table, full stop — prices January transactions at today's quote, and the balance is wrong in a way that only shows when someone converts back at a rate that did not exist when the money moved. The window alternative is a LAG-style as-of over the merged event-and-quote timeline, and the batch alternative is joining to a pre-folded latest-rate-per-day derived table when per-event correlation is too slow. The contract the interviewer grades: 'at or before, newest first, exactly one row' — and what happens when no quote predates the transaction (NULL, which means unpriceable, not zero).",
      tag: "subqueries",
    },
    {
      id: "revolut-t20",
      q: "The close stitches the paid book and the open book into one packet and appends a grand-total row. What does UNION ALL demand of the branches, and where do column names come from?",
      a: "Set operations stack by position, not name: every branch needs the same column count with per-position compatible types, and the packet's names come from the FIRST SELECT only. The grand-total row is a final branch with a literal label ('TOTAL') in the grouping column — without the label, the total row is indistinguishable from a group and the close reads one mandate richer. UNION ALL, never UNION: the books are disjoint by construction, and UNION's implicit DISTINCT would silently delete the evidence if a filter bug ever made them overlap — the packet would still balance, which is exactly the problem. The classic failure is swapping two same-typed columns in one branch: the stack runs, totals tie, and the report is transposed until a human reads a row.",
      tag: "setops",
    },
    {
      id: "revolut-t21",
      q: "Instant P2P is a graph: A sent B and B sent A inside a window is a mutual pair. How do you find the pairs without double-counting, and what is the canonicalization habit?",
      a: "A self-join with symmetric conditions: p1.sender = p2.recipient AND p1.recipient = p2.sender AND p1.id < p2.id — the strict inequality is the canonicalization. It kills self-pairs, keeps exactly one row per unordered pair (no A/B plus B/A mirror), and names both transfers so risk can inspect the exchange. Without it the pair count doubles and, worse, ring-detection work built on the same join inherits the inflation. The window-bound version carries the predicate in the join's date logic — each direction inside the window — and the deterministic tie-break (timestamp, then id) keeps 'first' and 'second' transfer meaningful when two transfers share a moment. At Revolut the same machinery powers friend suggestions and ring-detection, which is why the canonicalization is graded, not glanced at.",
      tag: "joins",
    },
    {
      id: "revolut-t22",
      q: "You want markets whose spend DROPPED month over month. Why can't the LAG comparison live in WHERE, and what is the shape that works?",
      a: "Window functions evaluate after WHERE, GROUP BY and HAVING — they are SELECT-stage machinery — so WHERE spend < LAG(spend) is a hard error, not a style note. The working shape stages the window in a CTE or derived table: fold monthly spend per market, compute LAG(spend) OVER (PARTITION BY region ORDER BY month) as prev_spend, then filter the OUTER query on spend < prev_spend. The same rule bans windows in GROUP BY and HAVING; the one place a window meets a predicate directly is QUALITY — and SQLite does not implement it, so the CTE is the house shape. The interview tail: the first row of every partition has a NULL prev_spend, comparisons against NULL are UNKNOWN, and new markets silently escape the drop list — which is correct, because a market's first month has no previous month to drop from.",
      tag: "windows",
    },
    {
      id: "revolut-t23",
      q: "GROUP_CONCAT folds each market's payment methods into one cell for the audit pack. Why is the cell's order untrustworthy, and how do you make it deterministic?",
      a: "The aggregate folds rows in scan order — whatever sequence the query plan walked — and no outer ORDER BY reaches inside a cell: it orders rows, never characters within one. There is no alphabetical default, so the same query can print 'card,wire' today and 'wire,card' after an index or plan change; in an audit pack, two runs differing by order read as tampering. The deterministic pattern sorts before folding: a derived table or CTE that orders the values, then the fold — or ORDER BY inside the aggregate call on modern SQLite. The habit generalizes: any aggregate that composes a string (GROUP_CONCAT, string_agg) inherits the plan's order unless the query imposes one, and the audit pack is the last place anyone wants a nondeterministic cell.",
      tag: "data-quality",
    },
    {
      id: "revolut-t24",
      q: "Which months carried card activity but zero settled spend? Where does that predicate live, and what does the zero actually mean?",
      a: "It is a group property — 'the month's fold produced zero settled value' — so the gate is HAVING after GROUP BY month: HAVING SUM(CASE WHEN settled THEN total ELSE 0 END) = 0. WHERE runs pre-aggregation: the SUM does not exist there, and a row-level settled filter would delete the attempts entirely, changing the denominator the month is judged by. The nuance the interviewer waits for: a zero-settled month with nonzero attempts is a decline problem; a zero month with zero attempts is a pipeline or launch gap — same HAVING result, opposite incidents, and the branch counts (attempts vs settled) are what tell them apart. The gate finds the month; the census inside the row explains it.",
      tag: "filtering",
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
    {
      id: "revolut-mcq-11",
      prompt: "The market audit pack wants one row per market with its distinct transaction outcomes folded into a single comma-separated cell. Which SELECT does that?",
      choices: [
        "SELECT region, GROUP_CONCAT(DISTINCT status) FROM tx GROUP BY region",
        "SELECT region, GROUP_CONCAT(status) FROM tx GROUP BY region",
        "SELECT region, COUNT(status) FROM tx GROUP BY region",
        "SELECT region, status FROM tx GROUP BY region",
      ],
      answer: 0,
      why: "DISTINCT folds the repeated per-transaction statuses into the set — 'cancelled,delivered,pending,shipped' — while the plain form repeats one value per transaction row. Fold and dedupe are two jobs in one function.",
      notes: [
        { choice: 1, why: "Legal SQL, wrong cell: a market's 37 transactions would print 37 values instead of the four distinct outcomes the audit reads." },
        { choice: 3, why: "A bare status column under GROUP BY keeps one arbitrary status per market — a silent sample of one." },
      ],
      difficulty: "easy",
    },
    {
      id: "revolut-mcq-12",
      prompt: "The dormancy sweep: funded accounts with no transaction since '2025-01-01'. transfers.account_id is nullable. Why NOT EXISTS, never NOT IN?",
      choices: [
        "NOT IN is slower on indexed columns",
        "One NULL in the subquery's key column makes NOT IN return nothing at all",
        "NOT EXISTS cannot reference the outer query",
        "NOT IN requires a JOIN keyword",
      ],
      answer: 1,
      why: "x NOT IN (…NULL…) is never TRUE — the NULL comparison is UNKNOWN and the sweep silently reports zero dormant accounts. NOT EXISTS asks 'does even one qualifying transaction exist', which NULL keys never satisfy, so the quiet accounts survive.",
      notes: [
        { choice: 0, why: "The failure is correctness, not cost — an empty dormancy list that returns fast is still an empty dormancy list." },
        { choice: 2, why: "Correlating against the outer query is exactly what NOT EXISTS does; it is the whole design." },
      ],
      difficulty: "medium",
    },
    {
      id: "revolut-mcq-13",
      prompt: "A coverage rate for a market slice divides by COUNT(*) of mandates — but that slice has zero mandates. What does SQLite return?",
      choices: [
        "A runtime error — the query aborts",
        "NULL — the row silently carries a NULL rate",
        "0 — an empty population reads as zero coverage",
        "Infinity — SQL follows IEEE float semantics",
      ],
      answer: 1,
      why: "Division by zero yields NULL in SQLite — no error, no zero; the slice just carries a NULL rate and drops out of strict consumers. The deliberate spelling is SUM(covered) / NULLIF(COUNT(*), 0), which names the empty population on purpose.",
      notes: [
        { choice: 2, why: "0% coverage for a slice with no mandates reads as a collections emergency; the truth is nobody billed — NULL and a label, not zero." },
        { choice: 3, why: "Integer and float division by zero both return NULL here; nothing raises IEEE infinity." },
      ],
      difficulty: "medium",
    },
    {
      id: "revolut-mcq-14",
      prompt: "A coverage CASE classifies exact / partial / no payment but omits ELSE. A mandate with a brand-new status arrives. What does the classification column hold, and what happens to the class counts?",
      choices: [
        "An error — CASE arms must be exhaustive",
        "0 — unmatched arms default to zero",
        "NULL — and COUNT of that column skips the row while COUNT(*) still counts it",
        "The empty string — counted by COUNT, invisible to SUM",
      ],
      answer: 2,
      why: "CASE without ELSE yields NULL for the unmatched row. COUNT(coverage) skips NULLs, so exact + partial + no-payment stops summing to COUNT(*) — the census's built-in reconciliation check fires, which is its whole job.",
      notes: [
        { choice: 1, why: "Zero requires ELSE 0 written out — the default is NULL, and the difference is the entire bug." },
        { choice: 3, why: "The empty string is not the default, and COUNT would happily count it — hiding the drift the NULL exposes." },
      ],
      difficulty: "hard",
    },
    {
      id: "revolut-mcq-15",
      prompt: "The growth deck reads one row per market with settled, in-flight and failed as COLUMNS. Which shape prints that census?",
      choices: [
        "GROUP BY status — one row per status",
        "SUM(CASE WHEN status = … THEN 1 ELSE 0 END) branches inside one GROUP BY market",
        "SELECT DISTINCT market ORDER BY status",
        "A self-join of the markets table to itself",
      ],
      answer: 1,
      why: "Conditional SUM branches turn each status into a column while GROUP BY market holds the row grain — the pivot is aggregation-shaped, not display-shaped.",
      notes: [
        { choice: 0, why: "That is the transpose: rows the reader must rotate mentally. The ask was columns." },
        { choice: 2, why: "DISTINCT and ORDER BY never aggregate — a shuffled market list arrives, no counts." },
      ],
      difficulty: "easy",
    },
    {
      id: "revolut-mcq-16",
      prompt: "Each market's share of total settled spend must print on every row of the spend table, computed in one pass. Which is the share column?",
      choices: [
        "A scalar subquery computing the grand total for every row",
        "spend / SUM(spend) OVER () — the window folds the grand total alongside each row",
        "A CROSS JOIN to an aggregated copy of the transactions table",
        "MAX(spend) compared against each row's spend",
      ],
      answer: 1,
      why: "SUM() OVER () computes the total once and pairs it with every row — one pass, denominator visible per row, share auditable. The scalar subquery re-reads the table per row and can silently go NULL on filtered slices.",
      notes: [
        { choice: 2, why: "Correct but heavyweight — it materializes what the window computes for free, at growth-deck query budgets that matter." },
        { choice: 3, why: "That is 'share of the biggest market', not share of the network — a different denominator wearing the same word." },
      ],
      difficulty: "hard",
    },
    {
      id: "revolut-mcq-17",
      prompt: "The plan-migration read uses LAG(tier) OVER (PARTITION BY account_id ORDER BY month). What does the previous-tier column hold for each account's FIRST month?",
      choices: [
        "'Standard' — every journey starts at the bottom tier",
        "NULL — there is no previous row in the partition",
        "0",
        "A syntax error — LAG refuses the first row of a partition",
      ],
      answer: 1,
      why: "LAG reads the previous row of the same partition; at the partition's first row there is none, so it yields NULL. The migration label treats it deliberately: CASE WHEN prev IS NULL THEN 'new' — a real segment, not a defect.",
      notes: [
        { choice: 0, why: "Assuming Standard invents migrations the account never made — the grid would report downgrades from tiers nobody held." },
        { choice: 2, why: "NULL is not zero; only COALESCE folds it, and then 'new account' and 'unknown history' look identical." },
      ],
      difficulty: "easy",
    },
    {
      id: "revolut-mcq-18",
      prompt: "The spend calendar buckets TEXT timestamps like '2025-01-31 23:59:59' by month. Which expression produces '2025-01'?",
      choices: [
        "STRFTIME('%Y-%m', created_at)",
        "STRFTIME('%M-%Y', created_at)",
        "STRFTIME('%M', created_at)",
        "SUBSTR(created_at, 12, 2)",
      ],
      answer: 0,
      why: "%Y-%m is the month spine; %M is MINUTES — the typo returns sixty buckets ('00' through '59') and the chart ships silently wrong.",
      notes: [
        { choice: 3, why: "Positions 12–13 are the hour digits — a bucket per hour of day, wrong by design." },
        { choice: 1, why: "Minute-then-year: consistent, reproducible, meaningless as a growth calendar." },
      ],
      difficulty: "easy",
    },
    {
      id: "revolut-mcq-19",
      prompt: "Two P2P transfers — A sent B, B sent A — must report as ONE mutual pair. Which self-join condition finds each pair exactly once?",
      choices: [
        "p1.sender = p2.sender AND p1.recipient = p2.recipient",
        "p1.sender = p2.recipient AND p1.recipient = p2.sender AND p1.id < p2.id",
        "p1.sender = p2.recipient AND p1.recipient = p2.sender",
        "p1.id <> p2.id",
      ],
      answer: 1,
      why: "The symmetric conditions define mutuality; the strict id inequality is the canonicalization — one row per unordered pair, no A/B plus B/A mirror, no self-pairs.",
      notes: [
        { choice: 2, why: "Symmetric alone reports every pair twice — the ring-detection machinery built on this join would inherit double counts." },
        { choice: 3, why: "Inequality on ids alone pairs everything with everything — a cross product with extra steps." },
      ],
      difficulty: "medium",
    },
    {
      id: "revolut-mcq-20",
      prompt: "Account references are TEXT: '99', '100', '1000'. The leaderboard must order them by numeric value. Which ORDER BY does that?",
      choices: [
        "ORDER BY ref",
        "ORDER BY CAST(ref AS INTEGER)",
        "ORDER BY UPPER(ref)",
        "ORDER BY LENGTH(ref)",
      ],
      answer: 1,
      why: "TEXT comparison is lexicographic — '1000' < '99' — so the bare sort mislabels the leaderboard as soon as widths vary. CAST forces a numeric read at the one point that needs it.",
      notes: [
        { choice: 2, why: "UPPER is a no-op on digits and keeps the lexicographic bug with extra cost." },
        { choice: 3, why: "Length ordering fixes the three-row sample and fails any real mix." },
      ],
      difficulty: "hard",
    },
    {
      id: "revolut-mcq-21",
      prompt: "The growth memo wants EXACTLY five top senders per market, ties broken alphabetically by name. Which produces it?",
      choices: [
        "RANK() OVER (ORDER BY spend DESC) <= 5",
        "DENSE_RANK() OVER (ORDER BY spend DESC) <= 5",
        "ROW_NUMBER() OVER (ORDER BY spend DESC, name ASC) <= 5",
        "ORDER BY spend DESC LIMIT 5",
      ],
      answer: 2,
      why: "Exactly-N with a stated tie-break is ROW_NUMBER over a composite order. RANK/DENSE_RANK admit everyone tied at the boundary — six rows, on purpose — and bare LIMIT breaks ties arbitrarily.",
      notes: [
        { choice: 0, why: "RANK keeps the tie and the gap: two senders at rank 5 both survive and the memo prints six names." },
        { choice: 3, why: "LIMIT takes whatever the plan emits first among ties — a leaderboard that can change between runs." },
      ],
      difficulty: "hard",
    },
    {
      id: "revolut-mcq-22",
      prompt: "The running balance must restart at zero for each account — one customer's fold must never absorb another's deposit. What draws the boundary?",
      choices: [
        "ORDER BY created_at inside OVER()",
        "PARTITION BY account_id inside OVER()",
        "GROUP BY account_id outside the window",
        "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW",
      ],
      answer: 1,
      why: "PARTITION BY splits the sequence per account, resetting the fold at each account's first row. ORDER BY only sequences within the partition; GROUP BY would collapse the movements the running balance needs.",
      notes: [
        { choice: 3, why: "A frame narrows which rows feed the fold — it never decides which rows belong to the same account." },
        { choice: 2, why: "GROUP BY yields one row per account: nothing left to run across." },
      ],
      difficulty: "medium",
    },
    {
      id: "revolut-mcq-23",
      prompt: "The opening read: transactions AND distinct accounts per market, one pass. Which SELECT carries both grains honestly?",
      choices: [
        "COUNT(*) AS transactions, COUNT(DISTINCT customer_id) AS accounts",
        "COUNT(*) twice, labeled differently",
        "COUNT(customer_id) AS transactions, SUM(customer_id) AS accounts",
        "COUNT(DISTINCT *) AS accounts",
      ],
      answer: 0,
      why: "COUNT(*) counts transactions; COUNT(DISTINCT customer_id) counts accounts; the gap is intensity — one power user transacting nightly versus thirty accounts trying once. Two grains, same population, one scan.",
      notes: [
        { choice: 2, why: "COUNT(customer_id) skips NULLs only — it is not a distinct count; SUM of ids is a number with no meaning." },
        { choice: 3, why: "COUNT(DISTINCT *) is not a thing — DISTINCT applies to an expression, and the star is not one." },
      ],
      difficulty: "easy",
    },
    {
      id: "revolut-mcq-24",
      prompt: "Market codes look like 'GB-LDN-0412' and the query must match the GB family only. Which WHERE is both correct and index-friendly?",
      choices: [
        "WHERE market_code LIKE '%GB%'",
        "WHERE market_code LIKE 'GB%'",
        "WHERE market_code = 'GB'",
        "WHERE SUBSTR(market_code, 4) = 'GB'",
      ],
      answer: 1,
      why: "An anchored prefix keeps the sargable shape the index walks; '%GB%' scans every row and matches GB anywhere in the code; equality drops every suffixed market.",
      notes: [
        { choice: 0, why: "The leading wildcard is the quiet full scan behind every mysteriously slow growth dashboard." },
        { choice: 3, why: "Plausible on this format, but it wraps the column in a function — the index is now decorative." },
      ],
      difficulty: "easy",
    },
    {
      id: "revolut-mcq-25",
      prompt: "The drop list: markets whose settled spend fell month over month. The fold computes LAG(spend) OVER (…) — where can the comparison 'spend < prev_spend' live?",
      choices: [
        "In the same SELECT's WHERE clause, right after the window",
        "In a CTE or derived table that stages the window, filtered by the OUTER query",
        "In HAVING, since it compares aggregates",
        "Anywhere — SQLite reorders clauses freely",
      ],
      answer: 1,
      why: "Window functions evaluate after WHERE, GROUP BY and HAVING — they are SELECT-stage machinery — so the comparison must be staged in a CTE and filtered outside. The outer query then also decides what a NULL prev_spend (first month) means.",
      notes: [
        { choice: 2, why: "HAVING compares group aggregates that exist post-fold — a window value is neither of those things." },
        { choice: 0, why: "Hard error, not a style note: the window has not been computed when WHERE runs." },
      ],
      difficulty: "hard",
    },
    {
      id: "revolut-mcq-26",
      prompt: "The monthly fold is built; the ask is 'which months had card activity but zero settled spend?' Where does that predicate live?",
      choices: [
        "WHERE SUM(settled_flag) = 0",
        "HAVING SUM(CASE WHEN settled THEN total ELSE 0 END) = 0",
        "HAVING COUNT(*) = 0",
        "WHERE settled = 0",
      ],
      answer: 1,
      why: "'Zero settled spend in the month' is a property of the group, so the gate is HAVING after GROUP BY. WHERE runs pre-fold — the SUM does not exist there — and a row-level filter deletes the attempts, changing the denominator.",
      notes: [
        { choice: 2, why: "Months with zero transactions never exist in the table — COUNT(*) = 0 can never fire; the gate hunts zero SETTLED among existing activity." },
        { choice: 3, why: "That filters unsettled attempts out of the fold — the months still print, with drifted denominators." },
      ],
      difficulty: "medium",
    },
    {
      id: "revolut-mcq-27",
      prompt: "The report needs the mean basket of SETTLED transactions AND the full attempt count on the same row. Which computes the mean without shrinking the row's population?",
      choices: [
        "AVG(total) with WHERE status IN ('delivered','shipped')",
        "AVG(CASE WHEN status IN ('delivered','shipped') THEN total END)",
        "SUM(total) / COUNT(total)",
        "MAX(total) - MIN(total)",
      ],
      answer: 1,
      why: "The CASE yields NULL on non-settled rows and AVG skips NULLs — the mean runs over settled baskets (82 of 103 attempts here) while COUNT(*) keeps the full attempt count. One scan, two populations, each stated.",
      notes: [
        { choice: 0, why: "Right mean, wrong row: the WHERE shrinks the fold, so the printed attempt count is no longer the market's." },
        { choice: 2, why: "SUM/COUNT(total) is the mean over non-NULL totals — same population by luck, zero intent stated." },
      ],
      difficulty: "medium",
    },
    {
      id: "revolut-mcq-28",
      prompt: "The close stitches the paid book and the open book with UNION ALL. What must align between branches, and where do the column names come from?",
      choices: [
        "Names must match; column order is free",
        "Column count and position; names come from the first SELECT",
        "Nothing — UNION ALL reorders columns to align",
        "Types are coerced per row; names come from the last SELECT",
      ],
      answer: 1,
      why: "Set operations stack by position, not name: same column count, per-position type compatibility, and the first branch names the packet — the second branch's aliases are ignored.",
      notes: [
        { choice: 0, why: "Name-matching is the classic bug: swap two same-typed columns in one branch and the stack still runs, silently transposed." },
        { choice: 2, why: "UNION ALL does zero alignment work — it concatenates rows exactly as the branches emit them." },
      ],
      difficulty: "easy",
    },
    {
      id: "revolut-mcq-29",
      prompt: "A multi-currency balance normalizes each transaction at the latest FX rate as of the transaction moment. Which subquery shape grabs the right rate?",
      choices: [
        "(SELECT rate FROM fx ORDER BY quoted_at DESC LIMIT 1) — the newest rate in the table",
        "(SELECT rate FROM fx WHERE quoted_at <= t.created_at ORDER BY quoted_at DESC LIMIT 1) — newest at or before each transaction",
        "The first rate of the month — rates are monthly by contract",
        "AVG(rate) across the transaction's calendar day",
      ],
      answer: 1,
      why: "The as-of contract: at-or-before, newest first, exactly one row. The newest-in-table rate prices January transactions at today's quote — a balance that only betrays itself when someone converts back at a rate that did not exist when the money moved.",
      notes: [
        { choice: 2, why: "Some products contract monthly rates — but then the bucket is explicit in the schema, not a coincidence of when you queried." },
        { choice: 3, why: "A day-average is a different contract and a different balance — defensible, but only if the ledger says so." },
      ],
      difficulty: "medium",
    },
    {
      id: "revolut-mcq-30",
      prompt: "The audit pack folds each market's payment methods into one cell with GROUP_CONCAT. Why does the house style sort before folding instead of trusting the cell?",
      choices: [
        "GROUP_CONCAT returns a BLOB that must be sorted afterwards",
        "The aggregate folds rows in scan order — the cell's order is whatever the plan walked, run to run",
        "GROUP_CONCAT sorts alphabetically by default",
        "An outer ORDER BY reorders the characters inside each cell",
      ],
      answer: 1,
      why: "No outer ORDER BY reaches inside a cell and there is no alphabetical default: the fold consumes rows in plan order, which index changes and rewrites can alter. Sort in a derived table (or ORDER BY inside the aggregate on modern SQLite), then fold — a deterministic cell.",
      notes: [
        { choice: 2, why: "If only — the absence of that default is exactly why two runs of the same query can disagree." },
        { choice: 3, why: "ORDER BY orders rows, never the characters within one; the cell leaves the query exactly as the fold left it." },
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
    {
      id: "cs-revolut-3",
      tier: "medium",
      topic: "j5",
      universe: "growth",
      title: "The quiet-since-cutoff sweep",
      brief:
        "Revolut growth brief on the storefront db: the dormancy sweep is the churn-precursor read — accounts (customers = account holders, region = market) with NO transaction since the cutoff, found by anti-join, because 'no rows matched' is the entire answer. The mapping: customers = accounts, orders = card/payment transactions, created_at = transaction time; the cutoff is '2025-01-01' and the activity predicate MUST live in the ON clause — a WHERE would collapse the LEFT JOIN to INNER and delete exactly the quiet accounts. Probed facts: 7 of 16 accounts are quiet since the cutoff — EU 4, APAC 1, US 1, LATAM 1. These are the winback list; the reactivation team ranks them by prior spend the moment the sweep lands.",
      ask: "Return each market's count of accounts with no transaction since the cutoff, biggest list first.",
      template:
        "SELECT c.region,\n       {1}(c.id) AS quiet_accounts\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id AND o.created_at {2} '2025-01-01'\nWHERE o.id IS {3}\nGROUP BY c.region\nORDER BY quiet_accounts {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the quiet-account counter",
          why: "COUNT(c.id) counts surviving accounts per market after the anti-join — EU 4, then the single quiet accounts — the probe's exact distribution. SUM would add up account ids: a number with no meaning in any sweep.",
        },
        {
          answer: ">=",
          kind: "keyword",
          label: "the cutoff direction",
          why: "Activity AT or after the cutoff counts as alive, so the join keeps only pre-2025 matches as candidates for quiet. '<' would invert the logic — flagging accounts whose only activity is old as the survivors and the recently active as quiet.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the no-match predicate",
          why: "Unmatched accounts carry NULL order columns — IS NULL keeps exactly the accounts with no transaction since the cutoff: 7 accounts, the winback list. IS NOT NULL would return the ACTIVE population: 9 accounts, zero winbacks, sweep inverted.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-list-first direction",
          why: "The reactivation call starts where the churn is: EU's 4 quiet accounts. ASC would lead with a one-account market — a correct sweep that opens the meeting with its smallest finding.",
        },
      ],
      distractors: ["SUM", "<", "IS NOT NULL", "ASC"],
      walkthrough:
        "The anti-join is the metric: dormancy is defined by the ABSENCE of matching rows, so the query's whole job is keeping what failed to match. The LEFT JOIN carries the activity predicate in the ON clause — every account survives the join, matched or not — and WHERE o.id IS NULL keeps only the unmatched: 7 of 16 accounts quiet since the cutoff, EU 4 / APAC 1 / US 1 / LATAM 1. Move the date filter to WHERE and the NULL-payload rows fail the predicate, the LEFT JOIN silently becomes INNER, and the sweep returns the one thing it must never return: an empty dormancy list while churn sits unpicked. IS NOT NULL inverts the sweep into the active population — 9 accounts, a retention report wearing a churn query's name. '<' in the cutoff slot flips which activity counts as alive, so the sweep flags the recently transacted and clears the truly quiet: the winback team calls the wrong seven people. COUNT(c.id) counts accounts (COUNT(o.id) would count zero everywhere — the unmatched side is all NULLs), and the market fold turns the list into a call plan. The habit being graded: say out loud which side each predicate touches — ON-clause rules decide who matches; WHERE rules decide who survives.",
    },
    {
      id: "cs-revolut-4",
      tier: "medium",
      topic: "x3",
      universe: "month-close",
      title: "The close packet with the grand-total row",
      brief:
        "Revolut Business close brief on the storefront db: finance signs the close only when the packet prints both books AND the total — the paid book, the open book, and a labelled grand-total row beneath them, stitched by UNION ALL. The mapping: invoices = the billing book (mandates), amount_cents = INTEGER cents, status paid/open = the books in scope; void is out of scope by definition (voided money is not chased — though the known anomaly is voided #11 receiving its 925 cents anyway). Probed facts: paid book 21 mandates / $66,443.00; open book 6 mandates / $19,609.00; the packet total must read 27 mandates / $86,052.00. The TOTAL row is the reconciliation line: its mandate count must equal 21 + 6, or the packet's own branches disagree.",
      ask: "Return the paid and open books (status, mandate count, dollars at 2 decimals) plus a labelled TOTAL row, stacked in one result.",
      template:
        "SELECT status,\n       {1}(*) AS mandates,\n       ROUND({2}(amount_cents) / 100.0, 2) AS dollars\nFROM invoices\nWHERE status {3} ('paid', 'open')\nGROUP BY status\nUNION ALL\nSELECT 'TOTAL', COUNT(*), ROUND(SUM(amount_cents) / 100.0, 2)\nFROM invoices\nWHERE status IN ('paid', 'open');",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the mandate counter",
          why: "COUNT(*) counts mandates per book — 21 paid, 6 open — and the TOTAL branch's COUNT(*) must equal their sum: 27, the packet's own reconciliation. SUM(*) does not exist and MAX(*) is a syntax error: only COUNT takes the star.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the book-value fold",
          why: "SUM(amount_cents) / 100.0 folds each book's dollars — 66443.00 paid, 19609.00 open, 86052.00 total. COUNT would divide row counts by 100 and print 0.21/0.06/0.27: cents-shaped noise no close would sign.",
        },
        {
          answer: "IN",
          kind: "keyword",
          label: "the in-scope filter",
          why: "IN ('paid', 'open') scopes the packet to the two chased books. NOT IN would print the void book alone — 1 mandate, $925.00 — a close packet with no books in it and one piece of evidence the voided mandate received money anyway.",
        },
      ],
      distractors: ["SUM", "MAX", "AVG", "NOT IN"],
      walkthrough:
        "The grand-total stack: two grouped books and one ungrouped total, stacked by position. The first branch folds each book at its own grain — COUNT(*) counts mandates, SUM(amount_cents)/100.0 folds dollars — and the second branch runs the same folds with no GROUP BY, so it returns one row labelled 'TOTAL': 27 mandates, $86,052.00. The reconciliation is structural: 21 + 6 = 27 and 66443.00 + 19609.00 = 86052.00 — if the TOTAL row ever disagrees with the sum of its branches, the branches' scopes drifted, and the packet says so before finance does. UNION ALL is the only stitch: the books are disjoint by construction, and UNION's implicit DISTINCT would silently delete a duplicate row caused by exactly the kind of filter bug this packet exists to catch. NOT IN in the scope slot prints the void book alone — 1 mandate, $925.00, the voided mandate that received money anyway: real evidence, but evidence the void book is out of scope by definition. MAX and AVG in the value slot are the plausible-looking wrongs: largest single mandate and mean mandate respectively — both honest SQL answering a question the close never asked. The habit being graded: a stack is only a packet when every branch folds the same population, and the total row proves it.",
    },
    {
      id: "cs-revolut-5",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The month-over-month spend spine",
      brief:
        "Revolut growth brief on the storefront db: the monthly growth review reads settled card spend per market WITH last month's value on the same row — the LAG spine — because the memo's real column is the delta, not the level. The mapping: orders = card/payment transactions, delivered + shipped = settled, customers.region = market, total = spend value. Probed facts (settled spend): EU's spine runs $1,337.52 (2024-02) → $954.32 (2024-12) → $490.16 (2025-01) → $1,365.52 (2025-02) — a January dip worth −$464.16 against December and a February recovery of +$875.36; APAC dips $723.96 → $233.95 into January. The window is the deliverable: one pass, previous month beside every row, and the first month of each market reads NULL on purpose.",
      ask: "Return each market's monthly settled spend with the previous month's spend beside it, ordered by market then month.",
      template:
        "SELECT region, month,\n       ROUND(spend, 2) AS settled_usd,\n       ROUND({1}(spend) OVER (PARTITION BY {2} ORDER BY month), 2) AS prev_month_usd\nFROM (SELECT c.region, STRFTIME('%Y-%m', o.created_at) AS month, SUM(o.total) AS spend\n      FROM orders o\n      JOIN customers c ON c.id = o.customer_id\n      WHERE o.status {3}\n      GROUP BY c.region, month);",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the previous-month window",
          why: "LAG(spend) reads the prior row of the same market's sequence — EU's January row carries December's 954.32, the delta's raw material. LEAD would point the wrong way: every row would carry NEXT month's spend and every 'drop' would be a mirror-image lie.",
        },
        {
          answer: "region",
          kind: "keyword",
          label: "the market wall",
          why: "PARTITION BY region keeps one market's history from bleeding into another's — APAC's first month must read NULL, not EU's December. Partitioning by month instead makes the 'previous row' a different market's same month.",
        },
        {
          answer: "IN ('delivered', 'shipped')",
          kind: "keyword",
          label: "the settled population",
          why: "Spend is SETTLED value — delivered + shipped — or the spine counts failed attempts as spend and every dip reads deeper than it was. \"= 'delivered'\" would silently drop the shipped leg from the growth line.",
        },
      ],
      distractors: ["LEAD", "month", "= 'delivered'", "SUM"],
      walkthrough:
        "The LAG spine: fold the month, then look one row back inside the market's wall. The derived table does the fold — STRFTIME('%Y-%m') buckets the TEXT timestamps, SUM(o.total) folds spend, the status predicate keeps the population settled-only — and the window does the look-back: LAG(spend) OVER (PARTITION BY region ORDER BY month) pairs every month with its predecessor, so EU reads 490.16 beside 954.32 in January (a −464.16 dip) and 1365.52 beside 490.16 in February (a +875.36 recovery). PARTITION BY is what makes 'previous' mean previous market-month: partition by month instead and the previous row is another market's same month — a delta nobody can act on. LEAD points the window the wrong way and mirrors every conclusion; SUM in the window slot accumulates a running total, a different deliverable wearing the same column name. The first row of each market reads NULL — that is the window being honest about missing history, and the memo treats it as 'no comparison available', not zero. The habit being graded: a growth delta is a window read staged in a fold — and the population the fold carried (settled only) is what every delta on the page inherits.",
    },
    {
      id: "cs-revolut-6",
      tier: "easy",
      topic: "s7",
      universe: "fraud",
      title: "The decline map as a pivot",
      brief:
        "Revolut risk brief on the storefront db: the transaction success review reads one row per market with settled, in-flight and failed as COLUMNS — the pivot — because the risk deck compares failure shapes across markets, not lists of statuses. The mapping: orders = card/payment transactions, delivered + shipped = settled, pending = in flight, cancelled = failed, customers.region = market. Probed facts: EU 36 settled / 6 in-flight / 3 failed of 45 attempts; APAC 29 / 5 / 3 of 37; US 15 / 3 / 1 of 19; LATAM 2 / 0 / 0 of 2 — 7 failures across 103 attempts, the 6.8% headline the success-rate dashboard prints. The branch-sum property is the point: settled + in-flight + failed must equal attempts in every row, or a status has entered the stream unclassified.",
      ask: "Return one row per market: settled, in-flight, failed counts and total attempts, biggest market first.",
      template:
        "SELECT c.region,\n       {1}(CASE WHEN o.status IN ('delivered', 'shipped') THEN 1 ELSE 0 END) AS settled,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS in_flight,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS failed,\n       COUNT(*) AS attempts\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY attempts {3};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the settled-branch fold",
          why: "SUM over the 1/0 settled flag adds approvals per market — 36, 29, 15, 2 — while COUNT(*) beside it holds all attempts. COUNT would count every 0 flag too and every market would read 100% settled.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the failed literal",
          why: "'cancelled' is the failed family in the standing mapping — 3 EU, 3 APAC, 1 US. 'delivered' would print 24 EU failures (the delivered leg's own count) and the deck would report a collapse that never happened.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-market-first direction",
          why: "Attempts DESC reads EU (45) → APAC (37) → US (19) → LATAM (2) — the deck's standing order. ASC would open with LATAM's two attempts: a correct pivot that leads with its smallest market.",
        },
      ],
      distractors: ["COUNT", "MAX", "'delivered'", "ASC"],
      walkthrough:
        "The pivot is aggregation with a layout: three conditional SUM branches turn statuses into columns while GROUP BY region holds the row grain the risk deck reads. Each branch folds its own family from the same rows — settled (delivered + shipped) 36/29/15/2, in-flight 6/5/3/0, failed ('cancelled') 3/3/1/0 — and the branch-sum property is the census's quiet engine: 36 + 6 + 3 = 45 in every row, so a new status entering the stream announces itself as a row whose branches no longer add up. COUNT in the fold slot is the classic kill: COUNT sees the ELSE 0 rows as non-NULL and prints the attempt count as the settled count — every market 100% settled, the dashboard's favorite lie. 'delivered' in the failed literal is the subtle one: it counts the delivered leg as failures — 24 EU 'failures' — a correct-looking pivot reporting an inverted world. The join is enrichment only (region onto transactions, many-to-one, no fan-out), so every aggregate stays at attempt grain. The habit being graded: a pivot's columns are populations — each one named, each one folded from the same rows, all of them reconciling to the COUNT(*) that stands beside them.",
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
    { slug: "analyze-subscription-conversion", why: "Conversion through the plan ladder — the Standard→paid migration read, each step's rate carrying its own enrolled population." },
    { slug: "trial-to-paid-funnel", why: "Funnel-stage conversion with honest stage denominators — the activation funnel whose every ratio answers 'out of whom?'" },
    { slug: "mrr-waterfall", why: "New, expansion, contraction, churn as one bridge — the plan-revenue walk the growth review opens with, folded month by month." },
    { slug: "net-revenue-retention", why: "Revenue kept plus expansion over the base — the subscription metric that turns a neobank's plan ladder into one number." },
    { slug: "growth-accounting", why: "QuickRatio-style growth decomposition — new vs resurrected vs churned accounts, the ledger-flavored growth fold." },
    { slug: "week-over-week-churn", why: "Churn as a weekly rate with the base named — the dormancy precursor at the cadence the growth team actually reads." },
    { slug: "winback-recovery", why: "Resurrected accounts after a quiet window — the other half of the dormancy sweep: who came back, and what pulled them." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU engagement ratio — the super-app stickiness read whose numerator and denominator must fold from the same rows." },
    { slug: "rolling-7d-actives", why: "Rolling window actives — the trailing-7-day activity spine the engagement dashboards hang on, window frames and all." },
    { slug: "new-users-daily-count", why: "First-event census per day — activation volume day by day, the top of the funnel in one GROUP BY." },
    { slug: "funnel-step-conversion", why: "Step-to-step conversion with stage-honest denominators — the activation funnel drill behind every 'funded share' ask." },
    { slug: "median-time-to-convert", why: "Median latency to the converting event — time-to-funded-account, where the median survives the outliers that wreck the mean." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Second-event-within-window via self-join — the repeat-activity read that defines an engaged account, window logic included." },
    { slug: "rfm-segmentation", why: "Recency-frequency-monetary banding in CASE arms — the account segmentation the winback campaigns are actually targeted with." },
    { slug: "spend-histogram", why: "Spend binned into bands with zero-filled bins — the card-spend distribution read whose empty bands still print." },
    { slug: "symmetric-pairs", why: "Canonical mutual pairs via the strict-inequality self-join — the P2P graph drill where one missed canonicalization doubles every pair." },
  ],
};
