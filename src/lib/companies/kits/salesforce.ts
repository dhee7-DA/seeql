// Salesforce — kit 1 of the SaaS & Enterprise domain (Batch G).
// CRM pipeline SQL: the storefront db read as a pipeline sandbox — orders are
// opportunities (delivered = closed-won, cancelled = closed-lost, pending =
// open evaluation, shipped = contract out for signature), customers are
// accounts, order_items are seat/product lines on the deal. Rep leaderboards,
// forecast categories, ARR movement waterfalls and account concentration.
// Pool provenance: the registry tags only 3 sql rows for Salesforce
// (daily-leads-and-partners, deferred-revenue, mrr-waterfall) — those lead the
// topics and problem pool, the rest is theme-curated and says so. Case briefs
// quote probed figures from scripts/company-facts.md (probed 2026-10-12);
// every case slot is mechanically verified against db/custom.db by
// scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const salesforceKit: CompanyKit = {
  id: "salesforce",
  domainId: "saas",
  name: "Salesforce",
  tagline: "CRM pipelines and pipeline SQL",
  accent: "text-cyan-200",

  brief: [
    "Salesforce is the CRM category itself — Sales Cloud, Service Cloud and the pipeline vocabulary the entire SaaS industry borrowed: leads, opportunities, stages, forecast categories, {emerald:closed-won}. The analyst reality behind the brand is that every revenue number is a stage-aware conditional count. A deal is not 'revenue' until its stage says so; 'pipeline' is a population definition, not a mood; and the gap between deals entered and deals won is where the entire discipline of win-rate reporting lives. This kit maps that world honestly onto the storefront db: orders are opportunities (**52** delivered = closed-won, 7 cancelled = closed-lost, 14 pending = open evaluation, 30 shipped = contract out for signature), customers are accounts, and the **103-order** book is the quarter's pipeline.",
    "The data org thinks in objects and grains. Accounts (16 in this db) carry territory and health attributes; opportunities (103) carry stage, amount and two timestamps that matter — `created_at` when the deal entered, `shipped_at` when the contract went out for signature, NULL until it does. Line items (251) are the seat and product lines that turn a deal into {violet:ARR}, and the finance tables (28 invoices, 27 payments, all INTEGER cents) are where bookings meet billings. Territory rollups run EU / APAC / US / LATAM, and the concentration story is real: **63.5%** of lifetime value sits with accounts whose spend crosses 3,000, and the top account alone carries **24** of the 103 deals.",
    "Interview screens are definition-heavy and pipeline-fluent. A typical loop walks from a **territory census** (deals AND distinct accounts — two grains, one query) into a stage-aware rate (closed-won share with the denominator question asked out loud), then escalates into either a **rep leaderboard** with rank-semantics follow-ups or an ARR movement question: this month versus last, classified as new, {violet:expansion}, contraction, {rose:churn}. Follow-ups probe exactly what a pipeline review would: 'does a closed-lost deal count in your denominator?', 'is that per deal or per account?', 'what happens to the first month of a LAG walk?' Candidates who narrate the stage filter's placement before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the registry tags only 3 SQL problems for Salesforce (`daily-leads-and-partners`, `deferred-revenue`, `mrr-waterfall`) — they lead the pool, and the rest of the 46 topic slugs and 32 problems are theme-curated to known screen shapes: two-grain censuses, stage-aware conditional counts, leaderboard ranking, ARR waterfalls and deferred-revenue schedules. Then run the six case studies on the live db — the theater pipeline census sales ops opens Monday with, the ARR movement waterfall the forecast call defends, the account leaderboard with its tie policy, the monthly one-pass census, the collections shortfall ledger finance reads at close, and the whale-deal scan pricing opens with. The bar to clear: state the *stage definition* and the *denominator* before you compute anything — then re-run each case a week later from a blank editor, because the second pass is where recall actually forms.",
  ],

  dayInLife: [
    "**08:00 —** The day starts with the pipeline snapshot. A revenue-operations analyst opens the territory dashboard before the forecast call: did last night's deal registrations land, did any stage change without an owner, does the {emerald:closed-won} total reconcile with what finance billed? The first query is almost always a reconciliation — deal count by stage versus the snapshot, billed invoices versus won opportunities, `orders` against `invoices` at two grains — and the two numbers must agree or the forecast call starts with an incident. The analyst who can write that diff query — which territory is short, by how much, since when — is the one the AE org waits on.",
    "**10:30 —** Midday is deal-desk translation. A regional VP wants the territory census with closed-won and closed-lost side by side; finance wants billed {violet:ARR} by month with last month beside it and the net movement classified; a rep wants their leaderboard position with ties handled honestly. Each ask is a join, a conditional aggregate and one judgment call about stages: does 'commit' include contract-out (shipped) or only countersigned (delivered)? The analyst writes the query twice — *once to answer, once with the stage definition spelled out so the number survives the argument in the forecast call.*",
    "**14:00 —** The afternoon tilts toward movement and concentration. ARR waterfalls go out monthly: new, {violet:expansion}, contraction, {rose:churn} per territory, each movement a LAG over the month spine. Concentration reads decide where customer-success attention goes — when **63.5%** of value sits in a handful of accounts, one lost logo moves a quarter. This is the stakeholder hour: the weekly forecast call where every headline number ships with its SQL attached, and the room expects the definition alongside the number, every time.",
    "**17:30 —** End of day is the writeup that makes tomorrow's numbers trustworthy. The waterfall query gets saved with its stage definition in the comment; the standing rule gets enforced — a stage change without a timestamp is a **data-quality ticket, not a rounding note**; and tomorrow's territory shortfalls are already queued for the AE org. The best-prepared candidate knows this rhythm: Salesforce SQL exists to defend revenue numbers against *optimistic denominators*.",
  ],

  metrics: [
    { name: "Closed-won ARR", what: "Booked value of delivered deals — the number the forecast call defends. On this db it is the 52 delivered orders; everything else is pipeline or loss by definition." },
    { name: "Win rate", what: "Closed-won ÷ ALL deals entered. The denominator question is the interview: 52 of 103 entered (50.5%) is a different claim than 52 of 59 resolved — and both are real metrics with different names." },
    { name: "Pipeline coverage", what: "Open pipeline (pending + shipped) ÷ next quarter's target. The forward-looking ratio that decides whether the AE org hires or discount-hustles." },
    { name: "Average deal size", what: "ARR ÷ won deals — revenue per opportunity, not per account. On this db the mean deal totals 338.19 against a range of 25.47 to 1,088.44; the spread IS the segmentation story." },
    { name: "Sales-cycle days", what: "Days from deal creation to contract-out (created_at → shipped_at): 82 signed deals average 2.98 days, range 2–4. Short on this db; the point is the population definition — open deals have no cycle yet." },
    { name: "Account concentration", what: "Share of value from the top accounts: 63.5% of lifetime value sits with accounts above 3,000 in spend (71.2% above 2,000). One lost logo is a quarter — the read that drives CS staffing." },
    { name: "Net revenue retention", what: "This cohort's ARR this quarter ÷ the same cohort's ARR last quarter. Expansion lifts it, churn drags it; the repeat-deal curve (9 of 16 accounts at 2–4 deals, 4 at 10+) is its shape on this db." },
    { name: "Forecast accuracy", what: "Commit category actuals ÷ commit category calls, per rep. The meta-metric that keeps forecast categories honest — computed as a stage-aware ratio with the quarter window stated." },
  ],

  topics: [
    {
      name: "Pipeline census aggregation",
      why: "Every Salesforce review opens with a census: deals entered and accounts covered per territory, per month, per rep. It is GROUP BY work at two grains, and the trap is letting cancelled deals pollute a pipeline total — the stage rule rides on every fold.",
      slugs: ["daily-leads-and-partners", "list-the-products-ordered-in-a-period", "unique-orders-and-customers-per-month", "sales-by-day-of-the-week", "keep-latest-dedupe"],
    },
    {
      name: "Stage-aware counting & win rates",
      why: "Closed-won, closed-lost, open pipeline — every rate here is a conditional count over a stage flag, and the interviewer's first question is always 'what's in the denominator?'. SUM(CASE WHEN stage …) over ALL entered deals is the shape that survives scrutiny.",
      slugs: ["immediate-food-delivery-ii", "monthly-transactions-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Joining accounts to pipeline",
      why: "Deals inherit territory, industry and account health through joins to the account table, and the join type decides who survives: an opportunity with no account is corruption; an account with no pipeline is whitespace. Choosing INNER versus LEFT is a business statement.",
      slugs: ["combine-two-tables", "sales-analysis-i", "top-travellers", "department-highest-salary", "employees-whose-manager-left-the-company"],
    },
    {
      name: "Rep & territory leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four accounts sit at 4 deals each on this db, and two reps share every crowded rung. RANK, DENSE_RANK and ROW_NUMBER are a business decision about who shares a rung, not syntax trivia.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "second-highest-salary", "nth-highest-salary", "compute-the-rank-as-a-percentage", "find-the-team-size", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Forecast categories with CASE",
      why: "Forecast calls live on CASE-classified buckets: hot/warm/cold grading, commit versus best-case, deal-size bands. The arms must be exhaustive and ordered — a hole in the CASE is a hole in the forecast.",
      slugs: ["weather-type-in-each-country", "the-category-of-each-member-in-the-store", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "ARR movement waterfalls (LAG)",
      why: "The ARR walk — new, expansion, contraction, churn — is a LAG over a month spine, classified per movement. The first row returns NULL by definition and the classification logic must say so, or every quarter-one report starts with a phantom drop.",
      slugs: ["mrr-waterfall", "growth-accounting", "week-over-week-churn", "balance-rollforward", "find-cumulative-salary-of-an-employee", "customers-who-never-order"],
    },
    {
      name: "Retention cohorts & repeat deals",
      why: "NRR is a cohort statement: accounts that entered together, renewed how many times since. The repeat-deal distribution on this db (2 single-deal accounts, 9 at 2–4, 1 at 5, 4 embedded at 10+) is exactly the curve a retention review reads out loud.",
      slugs: ["cohort-retention-matrix", "repeat-purchase-rate", "game-play-analysis-iv", "customers-with-strictly-increasing-purchases"],
    },
    {
      name: "Concentration & account sizing",
      why: "When 63.5% of value sits with 3,000-plus accounts, concentration reads decide coverage models. Share-of-total windows, NTILE quintiles and spend tiers turn a deal table into a portfolio view — and the denominator is always total ARR.",
      slugs: ["portfolio-weights", "rfm-segmentation", "customer-purchasing-behavior-analysis", "average-salary-of-departments", "queries-quality-and-percentage"],
    },
    {
      name: "Subquery screens & quota gates",
      why: "Screens escalate into nested logic: deals above the company average, reps clearing a pipeline threshold, accounts covering every product line. Scalar, IN, EXISTS and HAVING-gated shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "customers-who-bought-all-products", "duplicate-emails"],
    },
    {
      name: "Deferred revenue schedules (WITH RECURSIVE)",
      why: "A multi-year contract is billed once and recognized monthly — the recognition schedule is a recursive spine spreading value across periods. It is the SaaS-flavored reason WITH RECURSIVE appears in revenue interviews, and the ledger must always balance to zero.",
      slugs: ["deferred-revenue", "find-the-missing-ids", "total-sales-amount-by-year", "ar-aging-schedule", "gl-reconciliation"],
    },
  ],

  theory: [
    {
      id: "sf-t1",
      q: "Your pipeline report joins accounts to opportunities. When do you INNER and when do you LEFT — and what silently breaks if you filter an opportunity column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins opportunities to accounts: a deal with no account row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from accounts: the accounts with no opportunities ARE the answer, arriving with NULL deal columns. The classic break: filter o.status = 'closed-won' in WHERE after a LEFT JOIN and every NULL-payload account row fails the comparison — the LEFT JOIN quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON, or filtering in an outer query. On this db the anti-join returns zero never-touched accounts, and proving a confident zero is itself the analyst's job.",
      tag: "joins",
    },
    {
      id: "sf-t2",
      q: "The territory census shows 103 deals and 16 accounts; EU shows 45 deals and 8 accounts. Why do the two columns disagree and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts deal rows after the join — one row per opportunity, so an account with 24 deals contributes 24. COUNT(DISTINCT customer_id) folds those rows back to accounts — EU's 45 deals collapse to 8 logos. Neither is wrong: deals measure pipeline load and AE capacity, accounts measure installed base and coverage. The ratio — 5.6 deals per account in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for seat lines and COUNT(*) silently counts line items, not deals. Saying 'one row per what?' for every COUNT is the habit the interviewer grades.",
      tag: "aggregation",
    },
    {
      id: "sf-t3",
      q: "The forecast call wants closed-won ARR per theater for theaters carrying at least ten deals. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The stage rule is a row-level fact — status = 'delivered' discards open and lost deals before any fold, in WHERE; putting it in HAVING is impossible because stages no longer exist once rows are grouped. The ten-deal floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to deals versus to dollars. The strong answer places every filter by asking: is this a fact about one deal, or about a theater?",
      tag: "pipeline",
    },
    {
      id: "sf-t4",
      q: "Two reps tie at the top of the deal leaderboard and four accounts tie at 4 deals each. RANK, DENSE_RANK or ROW_NUMBER for the board — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied deals the same rank and skips — 1, 2, 3, 4, 5, 5, 5, 5, 9 — so the next distinct count lands on 9, implying five missing reps who do not exist. DENSE_RANK shares rungs without gaps — the tie reads 5, 5, 5, 5 and the next distinct count is 6. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about people's bonuses. On this db the deal-count ladder is 24, 17, 14, 13, 5, then four accounts tied at 4 — a leaderboard that must either admit the shared rung or own the tie-breaker (created_at ASC, then account id) explicitly. The wrong answer is picking a function; the right answer is picking a policy and naming it.",
      tag: "windows",
    },
    {
      id: "sf-t5",
      q: "shipped_at is NULL until the contract goes out for signature. What is your policy for the sales-cycle report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only signed deals have a cycle, so the report measures latency of shipped deals and says so — 82 of the 103 deals on this db, averaging 2.98 days, range 2 to 4. Then mechanics: AVG ignores NULLs, so AVG over ALL deals returns the shipped-only average with a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the signed subset; the gap between it and COUNT(*) IS the open-pipeline count, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day signatures for deals still in legal. A report whose WHERE clause is doing definitional work without saying so is exactly what a Salesforce reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "sf-t6",
      q: "WHERE o.total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 deals always produce an average. On filtered staging tables — one theater, one stage, one quarter — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each deal to ITS account's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "sf-t7",
      q: "The ARR walk buckets deals by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's deals, and quarter-end is exactly when deals land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. Date discipline is ARR discipline: the spine, the window and the edge row are where waterfall reports go wrong.",
      tag: "dates",
    },
    {
      id: "sf-t8",
      q: "Finance says an invoice is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money-handling rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 invoices worth 15,217 cents, and one of them is marked 'paid' with zero settlement rows: a status that lies, which is why the payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void invoice with a payment row (this db has one, at 925 cents) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 47.23 print into 47 and quietly eats cents on every odd-cent row. Reconciliation culture here is simple: counts and sums must agree between systems, and when they do not, the query that shows WHICH rows disagree is the deliverable.",
      tag: "quality",
    },
    {
      id: "sf-t9",
      q: "Forecast calls live on CASE-classified buckets — commit, best-case, pipeline, closed. What makes a CASE expression safe to build a forecast on, and what does a hole in the arms cost?",
      a: "A forecast-grade CASE is exhaustive and ordered. Exhaustive: every row must land in an arm, which is what the ELSE clause guarantees — on this db an ELSE of 'other' would catch nothing only because delivered/shipped/pending/cancelled cover all 103 deals, and proving that is part of the query, not an assumption. Ordered: arms fire first-match-wins, so a deal that satisfies two conditions (a cancelled deal that was once shipped) gets the FIRST matching label, and the arm order is a business decision you state out loud. The hole's cost: any unhandled status silently falls into ELSE and gets counted in whatever bucket you defaulted — a forecast that is wrong by exactly the rows nobody thought about. The strong answer enumerates the DISTINCT statuses from the data, maps each to a forecast category, and lets the CASE be the written definition.",
      tag: "pipeline",
    },
    {
      id: "sf-t10",
      q: "How do you compute pipeline coverage, and why is the ratio's numerator a population definition before it is a number?",
      a: "Coverage = open pipeline ÷ next quarter's target, so the whole question is what counts as open. On this db the honest numerator is pending + shipped — 14 + 30 = 44 deals — because delivered is closed-won and cancelled is closed-lost; including either inflates the cushion. Value-weighted versus count-weighted is the second decision: SUM(total) over the 44 deals weights the coverage by deal size, COUNT weights it by activity, and the two tell different stories when one whale deal dominates. The denominator needs a stated window too — next quarter's target is a plan number, not a query result, so it arrives as a parameter, and the query should name it. Saying 'the numerator is 44 deals under this stage map, value-weighted at 18,109.72' is the difference between a metric and a mood.",
      tag: "aggregation",
    },
    {
      id: "sf-t11",
      q: "Account tiers — quartiles, quintiles, custom bands. When do you use NTILE and when do you hand-cut with CASE, and what does each choice claim?",
      a: "NTILE(4) OVER (ORDER BY tenancy_value DESC) is the choice when the tiers are DEFINED BY RANK: exactly one quarter of accounts per tile, computed from the data — on 16 accounts, four per quartile, with the 7,262.35 top account in tile 1. Hand-cut CASE bands (n >= 10 'embedded', n >= 5 'expanding', n >= 2 'engaged') are the choice when the tiers are DEFINED BY THE BUSINESS: fixed thresholds that survive new data and can be printed in a playbook. The claims differ: NTILE says 'these are our relative standings this quarter' — it reshuffles every time the data does; CASE says 'these are our named segments' — stable labels, but the buckets can come out lopsided (on this db the 2/9/1/4 renewal-count curve would make count-based NTILE quartiles meaningless at n=16). The interviewer wants you to name which definition the stakeholder actually asked for.",
      tag: "windows",
    },
    {
      id: "sf-t12",
      q: "Walk me through the three-table chain: deals → seat lines → products. Where does the grain change, and what does COUNT(*) mean at each stop?",
      a: "The chain is orders ⋈ order_items ⋈ products, and the grain is renegotiated at every hop. Start: one row per deal, 103 rows. After the first join: one row per line item — 251, because multi-line deals fan out — and COUNT(*) now counts lines, not deals. After the second join: still 251 (each line matches exactly one product), now enriched with product category and price — the fan-out does not deepen further because product_id is a single key. So 'deals per category' needs COUNT(DISTINCT o.id) while 'lines per category' is COUNT(*) — two legitimate numbers from the same query, and confusing them is how a seat-count read silently becomes a SKU-count read. The habits: state the grain after each join, and pre-aggregate when the output grain is coarser than the fact table.",
      tag: "joins",
    },
    {
      id: "sf-t13",
      q: "Trailing metrics — a 3-month rolling booked value, a moving average of deal size. How do window frames work, and where does ROWS versus RANGE decide the answer?",
      a: "The frame clause defines which rows the aggregate sees: SUM(billed) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) is a positional three-row window on the 14-month spine. ROWS counts physical rows; RANGE counts peers by value of the ORDER BY key. On this spine they agree — one row per month, unique keys — and the expert answer says so rather than picking a side on faith. They diverge when the ORDER BY key repeats: ordering deals by stage and taking RANGE BETWEEN 1 PRECEDING AND CURRENT ROW sweeps in every other deal of the same stage, while ROWS takes exactly one neighbor. For calendar-true windows on gappy data, RANGE with a date type (or an explicit date-spine join) is the honest frame; for dedupe-and-rank work, ROWS is the default. Name the frame in the metric's definition — 'rolling 3-month, rows-true' — the same way you name the denominator.",
      tag: "windows",
    },
    {
      id: "sf-t14",
      q: "The CRM sync double-registered deals. Walk me through detecting the duplicates and keeping exactly the freshest registration.",
      a: "Detect at the natural key: GROUP BY external_deal_id HAVING COUNT(*) > 1 — that's the audit list, and its row count is a number the sync owner has to explain. Keep with the window dedupe: ROW_NUMBER() OVER (PARTITION BY external_deal_id ORDER BY updated_at DESC, id DESC) stamps 1 on the freshest ingest per key, and rn = 1 is the surviving set. The ORDER BY needs a full tie-break down to a unique column, or 'freshest' is ambiguous between two rows with identical timestamps — and a non-deterministic dedupe reshuffles on every run, which breaks reconciliation. The anti-patterns to name: DISTINCT (keeps an arbitrary copy, can't carry all columns), and DELETE without a tie-breaker (can remove both copies). Detect with HAVING, keep with ROW_NUMBER, prove with a before/after count — that's the complete answer.",
      tag: "windows",
    },
    {
      id: "sf-t15",
      q: "NOT IN versus NOT EXISTS for the whitespace anti-join — what breaks NOT IN, and why do pipeline teams standardize on EXISTS?",
      a: "NOT IN is a membership test over a materialized list, and a single NULL in that list makes every row's test UNKNOWN — 'id not in (1, 2, NULL)' is never provably true — so the query returns nothing while looking valid. On pipeline data NULLs are a WHEN, not an IF: one import that NULLs a foreign key deletes the entire whitespace report silently. NOT EXISTS is a probe: it asks 'does even one matching row exist?', short-circuits on the first hit, and never trips on NULLs because the correlation is an equality join, not list membership. LEFT JOIN … IS NULL is the third shape and behaves like NOT EXISTS while showing the unmatched left rows inline. The standard: NOT EXISTS for anti-joins in shared queries, IN reserved for small, provably complete static lists — and the empty-result sanity check ('zero whitespace is a claim, prove it') runs either way.",
      tag: "subqueries",
    },
    {
      id: "sf-t16",
      q: "When is UNION the correct business logic and when is UNION ALL — give me the forecast-stack version of the answer.",
      a: "Default to UNION ALL and make UNION justify itself. The forecast stack — per-status counts UNION ALL a TOTAL row — is logically disjoint: the detail branch folds groups, the TOTAL branch re-scans, no row can appear twice, so a dedupe pass is pure waste and, worse, a silent repair of genuine double-counts. UNION is correct when the branches CAN overlap and the overlap should count once: the same account appearing in both a renewal list and an expansion list is one logo, and the distinct pass is the business rule. The discipline points: both branches need matching column counts and compatible types, names come from the first branch, and ORDER BY after a set operation applies to the whole stack — which is exactly how the TOTAL row floats to the top on cents. If you can't say which duplicated rows you're paying to collapse, you wanted UNION ALL.",
      tag: "set-ops",
    },
    {
      id: "sf-t17",
      q: "When does a forecast report earn a WITH clause, and what does a well-named CTE buy the next analyst?",
      a: "The moment the report holds more than one grain, CTEs stop being style. The ARR walk stages monthly (the 14-bucket spine), then layers LAG and the movement classification on top — two grains, one statement, and without the CTE you are nesting derived tables until the definition is unreadable. Three concrete buys: readability — a chain named monthly, repeat_buyers, top_territories reads like the business process, and each step is a checkpoint you can SELECT from while debugging; reuse — one CTE feeds several later references, so the open-pipeline definition (pending + shipped) is written once and quoted everywhere; auditability — naming a CTE open_pipeline forces the stage map to be stated where the reviewer can see it, which is how definitions survive the forecast call. The performance note: CTEs are logical staging, not guaranteed materialization, so filter early inside each step and keep every CTE at one stated grain.",
      tag: "ctes",
    },
    {
      id: "sf-t18",
      q: "Account names arrive from three CRM sources with different casing and padding: 'acme corp', ' ACME CORP ', 'Acme Corp'. How do you make them group together — and what do you refuse to do?",
      a: "Normalize before the fold: TRIM strips the padding, UPPER or LOWER collapses the casing, and the cleaned expression becomes the GROUP BY key — GROUP BY UPPER(TRIM(name)) folds the three spellings into one row. The refusal: never 'fix' the data in the report in a way the join keys don't share — if one query groups on UPPER(TRIM(name)) and the dashboard joins on raw name, the numbers split again along the same seam. The durable fix is a cleaned canonical column (or a mapped account table) built once, so every consumer groups on the same key; the report-level cleanup is the diagnostic that proves the need. And the trap to name: ' ACME CORP ' and 'ACME CORP' are different strings to every comparison — a whitespace difference is invisible in a screenshot and decisive in a GROUP BY.",
      tag: "casing",
    },
    {
      id: "sf-t19",
      q: "The territory dashboard's slowest query filters orders by status and buckets by month. What index do you propose, and how do you verify it actually helps?",
      a: "The filter is equality on status, the bucket is a range/derive on created_at — so the composite index (status, created_at) serves both: the engine seeks straight to the status='delivered' range and reads created_at in order for the month fold. Column order matters: equality predicates first, range/derivation last, because everything after a range column is no longer seekable. Then verify rather than believe: EXPLAIN QUERY PLAN before and after — the win is the plan walking an index (SEARCH … USING INDEX) instead of SCAN on the whole table — plus a wall-clock check on representative data. The caveats that make the answer senior: indexes cost writes, so a table hammered by pipeline updates doesn't get one index per dashboard; and SQLite gains nothing from an index whose leading column the query never filters on. Propose, measure, keep or drop — never ship an index on vibes.",
      tag: "indexes",
    },
    {
      id: "sf-t20",
      q: "Quarter-end reporting keeps losing the last night's deals. How do you cut windows on TEXT timestamps so nothing leaks and nothing doubles?",
      a: "Half-open intervals, always: created_at >= '2024-01-01' AND created_at < '2024-04-01' is the whole quarter — the upper bound is exclusive, so a deal stamped '2024-03-31T23:58:12' lands inside. BETWEEN '2024-01-01' AND '2024-03-31' is the bug: string comparison makes the upper bound midnight at the START of Mar 31, and quarter-end is precisely when deals land, so the loss is real and always biggest on the last night. The second discipline is the spine: STRFTIME('%Y-%m', created_at) buckets by year-month — 14 keys on this db — while '%m' alone merges both Januaries and both Februaries. And the edge rows get names: the first month of a LAG walk is the baseline (NULL, not zero), the last month is 'month-to-date' until the period closes. Windows that leak on the edges produce forecasts that are wrong exactly when it matters.",
      tag: "dates",
    },
    {
      id: "sf-t21",
      q: "A win-rate ratio divides by a count that can be zero — a theater with no resolved deals yet. What is your NULL-and-division policy for metrics that must print?",
      a: "Three moves. Guard the denominator: NULLIF(COUNT(resolved), 0) turns 'zero resolved' into NULL instead of a division-by-zero error, and the ratio becomes NULL — 'not yet computable', which is the truth. Label the NULL: COALESCE at the display edge only if the stakeholder has agreed what a blank means (a dash, an 'n/a' row) — printing 0 would claim every deal was lost, which is a different and false story. Keep the guard out of the math: guards live at the ratio, not scattered through the query, so the same COUNT feeds several ratios each with its own stated edge policy. The discipline the panel grades: a metric that prints 0 for 'no data yet' and a metric that prints NULL for 'no data yet' lead to opposite decisions in a forecast review — choose deliberately, and write the choice next to the query.",
      tag: "nulls",
    },
    {
      id: "sf-t22",
      q: "One pass over the pipeline: per theater, deals entered, deals won, deals lost, open pipeline, accounts covered. How do you write it so no column can drift from the others?",
      a: "Conditional aggregation in a single GROUP BY: COUNT(*) folds the entered deals, COUNT(*) FILTER (WHERE status = 'delivered') isolates won, the same shape isolates cancelled, and open is COUNT(*) FILTER (WHERE status IN ('pending','shipped')) — every arm scans the same joined rows, so the columns reconcile to the same 103 by construction. Accounts covered is the second grain in the same pass: COUNT(DISTINCT customer_id) folds repeats back to logos (EU's 45 deals become 8 accounts), and the deals-per-account intensity is the ratio of the two columns, computed after the fold. The alternative — four separate queries stapled in the chart tool — is four chances for populations to disagree, and the forecast call will find them. One pass, one WHERE, arms as FILTER or SUM-over-CASE, and the exhaustiveness check (won + lost + open = entered) written into the review.",
      tag: "aggregation",
    },
    {
      id: "sf-t23",
      q: "'Deals above their theater's average deal size' — compare the correlated-subquery version, the join-to-CTE version, and the window version. Which do you ship, and why?",
      a: "Correlated: WHERE total > (SELECT AVG(total) FROM orders o2 WHERE o2.region = o1.region) — correct, readable, and the inner fold re-runs per outer row, so cost scales with the table. Join-to-CTE: stage per-theater averages once (WITH theater_avg AS …), then join back on region — one pass over the fold, transparent, and the CTE's definition is auditable. Window: AVG(total) OVER (PARTITION BY region) stamps each theater's average onto every row, then an outer query (or the same statement's surrounding structure) compares — each partition computed once, no join needed. I ship the window or CTE form at warehouse scale and defend the correlated form only on small, one-off checks; what the panel actually grades is whether you know all three produce the same rows and can name the cost difference — and whether you state the population ('theater' = customer region here) before writing any of them.",
      tag: "subqueries",
    },
    {
      id: "sf-t24",
      q: "The ARR walk classifies each month as new, expansion, contraction, or churn. How does the query tell them apart, and what does the first row return?",
      a: "The walk is LAG plus a classification: prev = LAG(billed) OVER (ORDER BY month), delta = billed − prev, and a CASE turns the sign into the vocabulary — delta > 0 expansion, delta < 0 contraction, delta = 0 flat, and prev IS NULL 'baseline' — with the baseline arm FIRST, because NULL fails both sign comparisons and would otherwise fall into whatever ELSE catches it. Churn in this db's mapping is a deal event (cancelled), not a monthly arithmetic case, so the walk shows the movement and the churn ledger shows the deal — two queries, deliberately. The trap to name out loud: coalescing the first delta to 0 fabricates a flat month, and every downstream average of movements inherits the fiction. On this spine the walk opens at 3,731.97 with a NULL movement, sags to the 1,193.86 July trough and closes at 2,390.53 — and every one of those numbers carries its definition with it.",
      tag: "windows",
    },
  ],

  mcqs: [
    {
      id: "sf-mcq-1",
      prompt: "A deal's status column reads 'delivered'. In forecast-category language, what is it?",
      choices: ["Closed-won — countersigned and booked", "Commit — contract out for signature", "Closed-lost", "Open pipeline — still in evaluation"],
      answer: 0,
      why: "This kit's stage mapping is fixed: delivered = closed-won (52 of 103 deals), shipped = contract-out commit, pending = open evaluation, cancelled = closed-lost. 'Delivered' is the only status that has happened.",
      notes: [
        { choice: 1, why: "Contract-out is 'shipped' — the commit category, signed but not yet countersigned. Calling commit deals won is how forecast calls acquire fictional ARR." },
        { choice: 3, why: "Open pipeline is 'pending' — 14 deals still in evaluation. Won pipeline is a contradiction, and the stage column exists to prevent it." },
      ],
      difficulty: "easy",
    },
    {
      id: "sf-mcq-2",
      prompt: "Win rate is defined as closed-won ÷ which population? The db holds 52 delivered and 7 cancelled of 103 entered.",
      choices: ["Delivered + cancelled only (52/59 = 88.1%)", "All deals entered (52/103 = 50.5%)", "Shipped deals only", "Distinct accounts (52/16)"],
      answer: 1,
      why: "The house definition: closed-won ÷ ALL deals entered, open pipeline included in the denominator. 50.5% is the honest read; every other denominator computes a real but differently-named metric.",
      notes: [
        { choice: 0, why: "That's the RESOLVED-deal win rate — a legitimate separate metric, but calling it 'the win rate' inflates 50.5% to 88.1% by quietly deleting open pipeline. Name the denominator or the number is a claim, not a metric." },
        { choice: 3, why: "52/16 is won deals per account territory-wide — an intensity ratio, not a rate. Rates divide populations of the same grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "sf-mcq-3",
      prompt: "103 deals across 16 accounts; EU carries 45 deals from 8 accounts. Which column pair reports both grains?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts deal rows (45); COUNT(DISTINCT customer_id) folds repeats back to accounts (8). The gap between the columns — 5.6 deals per account — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every deal has an account. Without DISTINCT both columns read 45 and the census loses the coverage story." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not accounts — a third grain nobody asked for. The census is deals AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "sf-mcq-4",
      prompt: "EU carries 45 deals from 8 accounts. Deals per account, and which account-side number must never be the denominator?",
      choices: ["5.6 — and the deal count must never be the denominator", "0.18 — accounts per deal", "8.0 — deals per account", "37.5 — platform-wide average"],
      answer: 0,
      why: "45 ÷ 8 = 5.6 deals per account — the EU intensity read. Flipping it to 0.18 answers 'accounts per deal', a different question; 8.0 confuses the account count with the ratio.",
      notes: [
        { choice: 1, why: "8/45 = 0.18 is the reciprocal — real arithmetic, wrong metric. Saying the ratio's units out loud ('deals per account') catches it instantly." },
        { choice: 2, why: "8 is the number of accounts, not deals per account. Ratios need a numerator from one grain and a denominator from the other." },
      ],
      difficulty: "medium",
    },
    {
      id: "sf-mcq-5",
      prompt: "100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to percentage-valued deals", "It is cosmetic — moving it changes nothing"],
      answer: 1,
      why: "Without it, SUM/COUNT of two integers is integer division — every theater's win share truncates toward 0 and the whole map reads as flat. The 100.0 multiplier forces real division first; on this db it is the difference between 53.3 and a displayed 53.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step, and it happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates first, then scales — 0.53 became 0 at the fold. Order of operations is the metric." },
      ],
      difficulty: "medium",
    },
    {
      id: "sf-mcq-6",
      prompt: "Keep only theaters carrying at least 10 deals. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY theater HAVING COUNT(*) >= 10", "WHERE deals >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A deal-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. Six of the fourteen month-buckets and three of the four theaters clear comparable bars on this db.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline order teaching itself." },
        { choice: 2, why: "There is no 'deals' column on the raw table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "sf-mcq-7",
      prompt: "The deal-count ladder runs 24, 17, 14, 13, 5, then FOUR accounts tied at 4. Under DENSE_RANK, what rank does the next distinct count (3) carry?",
      choices: ["6", "9", "5", "7"],
      answer: 0,
      why: "DENSE_RANK shares rungs without gaps: 1, 2, 3, 4, 5, then the four-way tie at 5, and the next distinct value is 6. The 'dense' contract is no skipped integers, which is why tier ladders use it.",
      notes: [
        { choice: 1, why: "That's RANK: ties share and then SKIP — 5, 5, 5, 5, 9. The gap implies four phantom reps between rank 5 and 9 who do not exist." },
        { choice: 2, why: "Continuing at 5 would extend the tie to a value that isn't tied. Ranks describe the ordering of distinct values, not row positions." },
      ],
      difficulty: "hard",
    },
    {
      id: "sf-mcq-8",
      prompt: "WHERE o.total > (SELECT AVG(total) FROM orders WHERE status = 'delivered') runs against a staging table where the delivered filter matches nothing. What does the report return?",
      choices: ["An error — scalar subqueries must return a row", "Zero rows silently — the comparison passes nothing", "Every row — NULL comparisons default to true", "Only NULL-total rows"],
      answer: 1,
      why: "The empty inner fold yields NULL, total > NULL is UNKNOWN, and WHERE passes nothing — an above-average report that ships empty-looking-but-valid. On filtered staging tables this bug is routine, which is why the population of the inner fold is stated out loud.",
      notes: [
        { choice: 0, why: "SQLite tolerates the empty case as NULL rather than erroring — worse than a crash, because the report LOOKS fine. Stricter engines error; the portable answer is to check the inner fold." },
        { choice: 2, why: "No comparison against NULL ever defaults to true — UNKNOWN is discarded by WHERE in both directions. Nothing 'passes' a NULL comparison." },
      ],
      difficulty: "hard",
    },
    {
      id: "sf-mcq-9",
      prompt: "An ARR waterfall computes ROUND(billed - LAG(billed) OVER (ORDER BY month), 2). What is the first month's net_movement, and what is the honest way to present it?",
      choices: ["0 — the walk starts flat", "NULL — labeled 'baseline' or left blank, because no prior month exists", "The first month's billed value", "An error — LAG has no row to reach"],
      answer: 1,
      why: "LAG finds no prior row and returns NULL; billed - NULL is NULL. The first row of every waterfall is the baseline — reporting NULL (or an explicit 'baseline' label) is honest; the db's spine starts at 2024-01 with 3,731.97 and no delta.",
      notes: [
        { choice: 0, why: "Coalescing to 0 fabricates a flat month — the single most common waterfall lie. A zero movement is a measurement; a missing prior is an edge." },
        { choice: 2, why: "LAG returns NULL, not the current value — that would be the identity window. Pulling the first billed value into the delta doubles-counts the opening month." },
      ],
      difficulty: "hard",
    },
    {
      id: "sf-mcq-10",
      prompt: "An invoice row reads amount_cents = 4723. Which expression prints its dollar value?",
      choices: ["amount_cents / 100", "ROUND(amount_cents / 100.0, 2)", "amount_cents * 100", "ROUND(amount_cents, 2)"],
      answer: 1,
      why: "INTEGER cents ÷ 100.0 promotes to real arithmetic: 47.23. The .0 is the entire fix — integer ÷ integer truncates, and every odd-cent invoice leaks its cents into the floor.",
      notes: [
        { choice: 0, why: "4723 / 100 is integer division = 47. On round-dollar invoices the bug hides; the first odd-cent row exposes it. Promote before you divide." },
        { choice: 2, why: "Multiplying gives 472,300 — units inverted. Sanity-check magnitude: dollars are smaller than cents." },
      ],
      difficulty: "medium",
    },
    {
      id: "sf-mcq-11",
      prompt: "The forecast call asks for OPEN pipeline — deals still live. On this db: 52 delivered, 30 shipped, 14 pending, 7 cancelled. What is the open count, and which statuses compose it?",
      choices: ["44 — shipped plus pending (30 + 14)", "59 — everything except delivered", "96 — everything except cancelled", "82 — every deal with a shipped_at"],
      answer: 0,
      why: "Open pipeline is pending + shipped: 44 of the 103 entered (42.7%). Delivered is closed-won and cancelled is closed-lost — neither is 'open' by definition — and this 44 is the numerator of the pipeline-coverage ratio sales ops reads against next quarter's target.",
      notes: [
        { choice: 1, why: "59 is the RESOLVED-deal population (52 + 7) — the win-rate denominator, not pipeline. Reusing resolved counts for coverage overstates the forward book." },
        { choice: 3, why: "82 is the signed population (delivered + shipped share a shipped_at). Signed is not open — contract-out deals stay in pipeline until countersigned." },
      ],
      difficulty: "easy",
    },
    {
      id: "sf-mcq-12",
      prompt: "Sales ops wants the whitespace list: accounts with ZERO deals. Which shape returns it?",
      choices: [
        "customers INNER JOIN orders, grouped by account",
        "customers LEFT JOIN orders … WHERE orders.id IS NULL",
        "customers CROSS JOIN orders, filtered to the smallest totals",
        "customers RIGHT JOIN orders … WHERE customers.id IS NULL",
      ],
      answer: 1,
      why: "The anti-join keeps every account row and survives only where the deal side never matched. On this db it returns zero rows — all 16 accounts carry deals — and shipping a confident zero, with the query attached, is exactly the proof the ops lead wants before the territory plan is signed.",
      notes: [
        { choice: 0, why: "INNER JOIN deletes the very rows you asked for — an account with no deal never survives an inner join to deals. The join type is the population statement." },
        { choice: 3, why: "RIGHT JOIN orders preserves deal rows, not accounts; and customers.id is never NULL, so the filter discards everything. The LEFT side must be the population being audited." },
      ],
      difficulty: "easy",
    },
    {
      id: "sf-mcq-13",
      prompt: "The ARR spine buckets deals with `STRFTIME('%Y-%m', created_at)` over a log spanning 2024-01 to 2025-02. How many buckets does the spine hold, and what does '%m' alone produce?",
      choices: [
        "12 buckets; '%m' gives the same 12",
        "14 buckets; '%m' alone merges both Januaries and both Februaries into 12",
        "26 buckets; '%m' alone gives 26",
        "2 buckets; '%m' alone gives years",
      ],
      answer: 1,
      why: "The window holds 14 distinct year-month keys — twelve of 2024, two of 2025. '%m' drops the year, so 2024-01 and 2025-01 collapse into one bucket: the trend quietly loses a year, and the LAG walk starts comparing January against January.",
      notes: [
        { choice: 0, why: "12 is what '%m' produces — plausible only if you forgot the log crosses a year boundary. Month-of-year buckets can never carry a trend." },
        { choice: 2, why: "26 would be fortnights. The bucket count is the count of distinct printed keys — print them before you build the waterfall on top." },
      ],
      difficulty: "easy",
    },
    {
      id: "sf-mcq-14",
      prompt: "A forecast memo stacks per-status deal counts with a grand TOTAL row underneath — one branch folds GROUP BY status, the other re-scans the whole table. Which operator appends the TOTAL without a dedupe pass?",
      choices: ["UNION", "UNION ALL", "INTERSECT", "JOIN"],
      answer: 1,
      why: "UNION ALL concatenates the two branches row-for-row — the honest stack for a memo where every row belongs. UNION would add a distinct pass over the combined set: wasted work here, and a silent liar anywhere duplicated rows are the signal.",
      notes: [
        { choice: 0, why: "UNION happens to work only because status rows are unique — you pay for a dedupe you can't justify, and the habit collapses real duplicates the day branches overlap." },
        { choice: 2, why: "INTERSECT keeps rows present in BOTH branches — the status rows and the TOTAL row share nothing, so the memo prints zero rows." },
      ],
      difficulty: "easy",
    },
    {
      id: "sf-mcq-15",
      prompt: "`SELECT AVG(julianday(shipped_at) - julianday(created_at)) FROM orders` runs over all 103 deals; shipped_at is NULL for 21 of them. What does the report actually measure?",
      choices: [
        "The average cycle of all 103 deals, with open deals counted as 0 days",
        "The average cycle of the 82 shipped deals only — AVG silently skips the NULL rows",
        "An error — NULLs cannot enter arithmetic",
        "The average of the 21 open deals",
      ],
      answer: 1,
      why: "AVG ignores NULL inputs, so the fold runs over the 82 signed deals (2.98 days average on this db) while the query text claims the whole book. The number is right for the wrong population — add WHERE shipped_at IS NOT NULL so the definition ships with the metric.",
      notes: [
        { choice: 0, why: "AVG never treats NULL as zero — that would be COALESCE's doing, and it would fabricate same-day signatures for deals still in legal. Silent skipping is the actual behavior." },
        { choice: 3, why: "The 21 NULL-shipped deals contribute nothing — they're excluded, not averaged. The report's real population is the 82, whether or not the title admits it." },
      ],
      difficulty: "medium",
    },
    {
      id: "sf-mcq-16",
      prompt: "orders ⋈ order_items fans 103 deals out to 251 line items. What does COUNT(*) on the joined rows measure?",
      choices: [
        "Deals — joins preserve the left table's grain",
        "Line items — 251; the last join's grain is what COUNT(*) sees",
        "Units — 498; COUNT(*) sums quantities",
        "Accounts — 16",
      ],
      answer: 1,
      why: "After the fan-out, COUNT(*) counts rows at the finest grain in the result: line items (251). Units need SUM(quantity) — 498 on this db — and deals need COUNT(DISTINCT o.id). Saying 'one row per what?' after every join is the habit the panel is grading.",
      notes: [
        { choice: 0, why: "Joins multiply rather than preserve: one deal with 3 items contributes 3 rows. The left table's grain survives only until the next FROM line." },
        { choice: 2, why: "498 is SUM(quantity) — units, not rows. If your COUNT and your unit total agree, one of them is mislabeled." },
      ],
      difficulty: "easy",
    },
    {
      id: "sf-mcq-17",
      prompt: "Four accounts tie at 4 deals and the case-study shortlist takes exactly ONE of them. Which selection is defensible in the forecast review?",
      choices: [
        "ROW_NUMBER() OVER (ORDER BY deals DESC) = 1 — the engine picks fairly",
        "RANK() OVER (ORDER BY deals DESC) = 4 — ties share the rung",
        "ROW_NUMBER() OVER (ORDER BY deals DESC, created_at ASC, id ASC) = 1 — a stated, deterministic tie-breaker",
        "WHERE deals = 4 LIMIT 1 — SQL returns rows in a stable order by default",
      ],
      answer: 2,
      why: "A tie broken by an undocumented engine order is a coin flip wearing a metric's name. The defensible pick states the tie-breaker — earliest deal entry, then id — so the same query re-run next Monday picks the same account. Determinism is the deliverable, not the function choice.",
      notes: [
        { choice: 0, why: "Without a tie-breaker in the ORDER BY, ROW_NUMBER's choice among tied rows is arbitrary and can change between runs — a shortlist that reshuffles itself." },
        { choice: 1, why: "RANK keeps ALL FOUR tied accounts on the shared rung — the opposite of 'exactly one'. Tie-sharing functions rank; they cannot select." },
      ],
      difficulty: "medium",
    },
    {
      id: "sf-mcq-18",
      prompt: "Q1-2024 pipeline means deals entered from Jan 1 through the END of Mar 31, and the timestamps carry time-of-day. Which WHERE clause is safe?",
      choices: [
        "WHERE created_at BETWEEN '2024-01-01' AND '2024-03-31'",
        "WHERE created_at >= '2024-01-01' AND created_at < '2024-04-01'",
        "WHERE SUBSTR(created_at, 1, 2) = '2024'",
        "WHERE created_at LIKE '2024-0%'",
      ],
      answer: 1,
      why: "BETWEEN '2024-01-01' AND '2024-03-31' compares strings: '2024-03-31T14:22:00' sorts AFTER '2024-03-31', so every deal entered on the final day silently vanishes — and quarter-end is exactly when deals land. The half-open interval [Jan 1, Apr 1) keeps the whole last night.",
      notes: [
        { choice: 0, why: "The upper bound '2024-03-31' is midnight at the START of Mar 31 in string comparison. BETWEEN is only safe when the column is a pure date with no time part." },
        { choice: 3, why: "LIKE '2024-0%' catches January through September and loses October–December. Pattern filters on dates are a leaky substring game, not a window." },
      ],
      difficulty: "medium",
    },
    {
      id: "sf-mcq-19",
      prompt: "NTILE(4) OVER (ORDER BY tenancy_value DESC) runs over the 16 accounts to build spend quartiles. What does the top account get, and why?",
      choices: [
        "Tile 4 — NTILE numbers the heaviest spend first",
        "Tile 1 — NTILE assigns tiles 1..4 in the window's ORDER BY order",
        "Tile 2 — NTILE always leaves the first tile half-empty",
        "NULL — NTILE requires a PARTITION BY first",
      ],
      answer: 1,
      why: "NTILE(4) walks the rows in the window's ORDER BY sequence stamping tiles 1 through 4; with 16 accounts the quartiles come out exactly 4 rows each, and the biggest tenancy value (7,262.35) lands in tile 1 — the top-quartile coverage list CS staffs against.",
      notes: [
        { choice: 0, why: "Tile numbers follow the window order, not value intuition: with DESC ordering the big values arrive first and receive LOW tile numbers. Flip to ASC and the semantics flip with it." },
        { choice: 3, why: "PARTITION BY is optional — without it the whole row set is one partition, which is exactly what a company-wide quartile read wants." },
      ],
      difficulty: "medium",
    },
    {
      id: "sf-mcq-20",
      prompt: "A staging copy of the pipeline loses some customer_id values (a bad import NULLs them). Now `SELECT name FROM customers WHERE id NOT IN (SELECT customer_id FROM staging_orders)` returns — what?",
      choices: [
        "Every account with no staging deal — the anti-join works",
        "Zero rows — a NULL in the NOT IN list makes every comparison UNKNOWN",
        "Only the accounts whose id is NULL",
        "An error — NOT IN refuses NULL lists",
      ],
      answer: 1,
      why: "NOT IN is a membership test over the whole list, and one NULL poisons it: 'not equal to every listed value' can never be provably true when a list entry is NULL, so WHERE discards every row. NOT EXISTS — or LEFT JOIN … IS NULL — is the NULL-safe anti-join, which is why pipeline teams standardize on it.",
      notes: [
        { choice: 0, why: "That's the NOT EXISTS behavior you assumed. One NULL import row deletes the entire whitespace report, silently." },
        { choice: 3, why: "It fails worse than an error: the query runs and returns a clean-looking empty set. Silent emptiness is the most expensive failure mode in a forecast review." },
      ],
      difficulty: "hard",
    },
    {
      id: "sf-mcq-21",
      prompt: "The forecast board wants ONE row per theater with won / lost / open pipeline as columns. Which shape builds it in a single pass over orders ⋈ customers?",
      choices: [
        "Three separate GROUP BY queries stapled together in the chart tool",
        "SELECT region, SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS won, … GROUP BY region — one conditional-sum arm per column",
        "SELECT region, status, COUNT(*) … GROUP BY region, status — the board pivots it later",
        "SELECT region, COUNT(status = 'delivered'), COUNT(status = 'cancelled') … GROUP BY region",
      ],
      answer: 1,
      why: "Conditional aggregation — one SUM-over-CASE arm per column — folds all 103 deals once and emits the board's columns side by side: won 24/21/5/2, lost 3/3/1/0, open derivable by subtraction. One scan, one shared denominator, no stitch job whose populations can drift.",
      notes: [
        { choice: 0, why: "Three queries are three chances for the populations to disagree — the exact reconciliation tax the forecast call exists to eliminate." },
        { choice: 3, why: "COUNT(status = 'delivered') counts non-NULL comparison results — SQLite renders TRUE/FALSE as 1/0, both non-NULL — so every arm returns the theater's full deal count. The flag needs SUM or FILTER, not COUNT." },
      ],
      difficulty: "medium",
    },
    {
      id: "sf-mcq-22",
      prompt: "A trailing metric computes `SUM(billed) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)` on the 14-month spine. A colleague insists RANGE is 'more correct' for dates. On THIS spine, what is true?",
      choices: [
        "RANGE is required — ROWS breaks on any date column",
        "ROWS and RANGE agree here, because the month key is unique per row; they diverge only when the ORDER BY key has ties",
        "RANGE and ROWS are synonyms in SQLite — the engine ignores the choice",
        "Both fail — window frames cannot order on text months",
      ],
      answer: 1,
      why: "With a unique ORDER BY key — one row per month — '2 preceding ROWS' and '2 preceding values' span the same rows, so the trailing sums agree. They diverge on ties: order by a repeating key (deal counts, stages) and RANGE drags in every tied peer while ROWS stays positional. Naming WHEN they differ is the expert signal.",
      notes: [
        { choice: 0, why: "ROWS is fully legal on any orderable key; what it can't promise is value-distance when keys repeat. The constraint is ties, not dates." },
        { choice: 2, why: "They are distinct frame units and SQLite implements both. The synonym belief is exactly how a trailing metric drifts the day a key duplicates." },
      ],
      difficulty: "hard",
    },
    {
      id: "sf-mcq-23",
      prompt: "A CRM sync double-registered several deals — same external id, different updated_at. Which fragment keeps exactly the freshest row per deal id?",
      choices: [
        "GROUP BY external_id and keep the row with MAX(updated_at) — aggregation returns whole rows",
        "ROW_NUMBER() OVER (PARTITION BY external_id ORDER BY updated_at DESC) = 1",
        "SELECT DISTINCT external_id — distinct collapses duplicates by definition",
        "RANK() OVER (ORDER BY updated_at DESC) = 1 — the newest deal overall",
      ],
      answer: 1,
      why: "ROW_NUMBER numbers duplicates newest-first inside each external_id partition; rn = 1 is the freshest ingest and the filter drops the rest. It is deterministic (the ORDER BY names the tie-break), per-key (the PARTITION BY), and keeps whole rows — the three properties a dedupe needs.",
      notes: [
        { choice: 0, why: "Aggregates fold rows — MAX(updated_at) returns one timestamp per id, not the row that owns it; other selected columns then come from arbitrary rows of the group." },
        { choice: 2, why: "DISTINCT can't carry the other columns without collapsing them too — and it keeps an arbitrary copy, not the freshest. Dedupe needs a ranking, not a set operation." },
      ],
      difficulty: "hard",
    },
    {
      id: "sf-mcq-24",
      prompt: "'Deals worth more than THEIR theater's average deal.' Which rewrite scales, and what does each version cost?",
      choices: [
        "WHERE total > (SELECT AVG(total) FROM orders o2 WHERE o2.customer_id = o1.customer_id) — the correlated form, recomputed per deal",
        "Stamp AVG(total) OVER (PARTITION BY region) on every row, then compare in an outer query — each theater's average is computed once",
        "HAVING total > AVG(total) — HAVING compares each row to its group average directly",
        "A CROSS JOIN of every deal to every theater average — the engine optimizes it away",
      ],
      answer: 1,
      why: "The correlated subquery re-runs the average once per outer row — correct, but the cost grows with the table. The window form computes each partition's average once and stamps it on every row, so an outer query or CTE stage does the comparison. Same answer, different arithmetic bill — and on warehouse-sized tables the bill IS the interview question.",
      notes: [
        { choice: 0, why: "That's the expensive-but-correct original. Naming the per-row re-evaluation — and that small-data clarity is its one honest defense — is the nuance the follow-up wants." },
        { choice: 2, why: "HAVING judges groups, not rows-against-computed-columns: the window output isn't visible to HAVING in the same SELECT, so the shape errors or filters on nothing useful." },
      ],
      difficulty: "hard",
    },
    {
      id: "sf-mcq-25",
      prompt: "A 12,000-dollar contract is billed once and recognized 1,000 per month for 12 months. The revenue table holds ONE row. Which shape manufactures the 12-row recognition schedule?",
      choices: [
        "GROUP BY month — folding finds the periods that exist",
        "WITH RECURSIVE generating the 12-period spine, joined to the contract, allocating value per period",
        "A self-join of the revenue table to itself — 12 copies via join fan-out",
        "Twelve hand-written UNION branches, one per month",
      ],
      answer: 1,
      why: "Recognition periods that don't exist as rows must be GENERATED: a recursive CTE walks month 1 to month 12, the join spreads each contract across the spine, and the allocation nets the ledger to zero — 12,000 billed, 12,000 recognized, 0 deferred remaining. It is the SaaS-flavored reason WITH RECURSIVE shows up in revenue screens.",
      notes: [
        { choice: 0, why: "GROUP BY can only fold rows that exist — it cannot invent the eleven missing months. Absence is a spine problem, not a fold problem." },
        { choice: 2, why: "Fan-out repeats the full 12,000 on every copy — that's double-counting, not allocation. The schedule needs a counter, and joins don't count." },
      ],
      difficulty: "hard",
    },
    {
      id: "sf-mcq-26",
      prompt: "An ARR walk labels each month's movement as billed − LAG(billed) OVER (ORDER BY month). Which CASE arm keeps the first month honest?",
      choices: [
        "ELSE 'contraction' — NULL minus anything is negative",
        "WHEN LAG(billed) OVER (ORDER BY month) IS NULL THEN 'baseline' — placed before the sign arms",
        "WHEN movement = 0 THEN 'baseline' — the first month has no movement",
        "WHEN month = '2024-01' THEN 'baseline' — hardcode the spine's first key",
      ],
      answer: 1,
      why: "The first row's LAG is NULL, so the delta is NULL — and NULL fails both > 0 and < 0, falling into whatever ELSE catches it. An explicit IS NULL arm placed FIRST labels the baseline honestly; without it the board prints a phantom drop or phantom expansion on month one.",
      notes: [
        { choice: 0, why: "NULL comparisons are UNKNOWN, not negative — the row falls to ELSE and prints as contraction. The January 'churn' in every forecast deck starts exactly here." },
        { choice: 3, why: "Hardcoding the first key works until the spine grows a new first month — a definition that expires on the next data load is a bug on a schedule." },
      ],
      difficulty: "medium",
    },
    {
      id: "sf-mcq-27",
      prompt: "A new analyst writes `COUNT(*) FROM orders WHERE status = 'void'` expecting refund-case artifacts. What does the query return on this db?",
      choices: ["7 — the cancelled deals", "1 — the void invoice", "0 — 'void' belongs to the invoices vocabulary, not orders", "103 — the filter is ignored"],
      answer: 2,
      why: "Orders speak delivered / shipped / pending / cancelled; 'void' and 'paid' live on invoices. A cross-table vocabulary leak doesn't error — it reads 0 forever, which is why reconciliation checks start by enumerating the DISTINCT status values each table actually carries.",
      notes: [
        { choice: 1, why: "There IS one void invoice (92,500 cents — and it even carries a settlement row), but it is not an order, so the orders scan never sees it. Tables have dialects; filters must too." },
        { choice: 0, why: "Cancelled is the deal-side word for a dead deal — 7 of them. Borrowing the other table's word returns the empty set instead of the count you meant." },
      ],
      difficulty: "easy",
    },
    {
      id: "sf-mcq-28",
      prompt: "The pricing review quotes the second-biggest deal on the books. With deal sizes topped by 1,088.44, which read returns 945.21 — and survives a tie at the top?",
      choices: [
        "SELECT total FROM orders ORDER BY total DESC LIMIT 1 OFFSET 1",
        "SELECT MAX(total) FROM orders WHERE total < (SELECT MAX(total) FROM orders)",
        "SELECT MIN(total) FROM orders",
        "SELECT MAX(total) FROM orders WHERE total > (SELECT AVG(total) FROM orders)",
      ],
      answer: 1,
      why: "MAX-below-MAX returns the largest value strictly under the top: 945.21 — and if two deals tied at 1,088.44 it would return the next DISTINCT value, not a copy of the top. Position-based picks break on exactly that tie.",
      notes: [
        { choice: 0, why: "LIMIT/OFFSET splits tied top deals arbitrarily — with a tie at the top it returns one of the tied 1,088.44 rows. Position logic on value questions is the classic second-highest trap." },
        { choice: 3, why: "That returns the biggest above-average deal — the top itself, 1,088.44. 'Above average' and 'second biggest' are different claims." },
      ],
      difficulty: "easy",
    },
    {
      id: "sf-mcq-29",
      prompt: "For a deal-desk digest, each account's deal statuses fold into one cell. An account holds delivered, delivered, cancelled. What does GROUP_CONCAT(status) return for it?",
      choices: [
        "'delivered,delivered,cancelled' — one comma-joined string, in scan order",
        "3 — GROUP_CONCAT counts its inputs",
        "'delivered' — duplicates collapse like DISTINCT",
        "An error — aggregates cannot return text",
      ],
      answer: 0,
      why: "GROUP_CONCAT is a text fold: every non-NULL input is cast to text and joined with the separator (comma by default). Nothing dedupes and nothing counts — order follows the scan unless the query orders the inputs explicitly, so a digest that needs stable order states it.",
      notes: [
        { choice: 1, why: "That's COUNT's job. The tell between the two folds: COUNT ends a cell, GROUP_CONCAT builds one." },
        { choice: 2, why: "Collapse-to-distinct is DISTINCT's contract, not GROUP_CONCAT's — the fold reports what happened, repetition included, which is exactly what an audit wants." },
      ],
      difficulty: "medium",
    },
    {
      id: "sf-mcq-30",
      prompt: "'What is the average DEALS-PER-THEATER?' — an analyst writes `SELECT AVG(COUNT(*)) FROM orders GROUP BY region`. What happens, and what is the fix?",
      choices: [
        "It returns 103 — the outer AVG folds the groups back together",
        "Error: aggregates cannot nest in one SELECT — stage the per-theater counts in a derived table, then AVG them (25.75 on this db)",
        "It returns 25.75 — SQLite flattens nested aggregates correctly",
        "It returns 4 — the number of theaters",
      ],
      answer: 1,
      why: "COUNT folds 103 deals into four theater counts; AVG would need those counts as input rows, but they don't exist until GROUP BY has finished — one SELECT cannot aggregate an aggregate. The derived table stages the counts (EU 45, APAC 37, US 19, LATAM 2) and the outer AVG reads them: 103 ÷ 4 = 25.75.",
      notes: [
        { choice: 0, why: "The engine refuses nested aggregates precisely because the two folds want different grains — the error is the pipeline order teaching itself." },
        { choice: 2, why: "25.75 is the right number reached by an impossible query — a guess, not a result. The two-stage shape is the only honest route to an average of averages." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-sf-1",
      tier: "easy",
      topic: "j7",
      universe: "funnel",
      title: "The theater pipeline census",
      brief:
        "Salesforce-flavored brief on the storefront db: Monday's forecast call opens with the theater census — pipeline entered, closed-won, closed-lost — and sales ops is explicit about the stage map: delivered = closed-won, cancelled = closed-lost, pending and shipped stay open and must not leak into either column. Probed facts: 103 deals entered, split EU 45 / APAC 37 / US 19 / LATAM 2; closed-won 24 / 21 / 5 / 2; closed-lost 3 / 3 / 1 / 0. The call reads biggest won book first, and every column must fold from the same joined rows so no denominator can drift.",
      ask: "Return each theater with its deal count, closed-won count and closed-lost count, biggest won book first.",
      template:
        "SELECT c.region AS theater,\n       {1}(*) AS deals,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS closed_won,\n       SUM(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) AS closed_lost\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY closed_won {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the deal-row counter",
          why: "COUNT(*) folds the joined rows into per-theater deal counts — 45, 37, 19, 2. SUM(*) is not SQL and MAX(*) reports one deal, not the pipeline the AEs actually entered.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the won-stage literal",
          noVerify: true,
          why: "The closed-won arm counts only delivered deals — 24 / 21 / 5 / 2 by theater. Unquoted delivered would be read as a column and error; 'shipped' would swap in contract-out deals (12 / 8 / 10 / 0) and the forecast would book ARR that hasn't been countersigned.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the lost-stage literal",
          noVerify: true,
          why: "The closed-lost arm isolates cancelled deals — 3 / 3 / 1 / 0. 'pending' would report evaluation-stage deals (6 / 5 / 3 / 0) as losses, turning healthy pipeline into a loss report.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the won-first direction",
          why: "Biggest won book on top means descending: EU 24, APAC 21, US 5, LATAM 2. ASC would open the forecast call with LATAM's 2 deals — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", "'shipped'", "ASC"],
      walkthrough:
        "One join, one fold, three counters at the same grain. The join attaches every deal to its account's theater — all 103 survive — and GROUP BY region folds them into four rows where COUNT(*) reads the entered pipeline (45 / 37 / 19 / 2) and the two SUM-over-CASE arms read the resolutions: closed-won 24 / 21 / 5 / 2, closed-lost 3 / 3 / 1 / 0, all straight from the probed stage map. Because both conditional sums and the COUNT fold the same rows, no column can disagree about population — that is the audit sales ops asked for. The distractors fail honestly: SUM(*) and MAX(*) are syntax errors in the counter slot; 'shipped' in the won arm would book 12 / 8 / 10 / 0 — contract-out deals, not countersigned ones; 'pending' in the lost arm converts evaluation-stage pipeline into losses; and ASC flips the board so the call opens on LATAM. Stage literals are quoted for the same reason status vocabularies matter: 'void' and 'paid' belong to invoices, not deals, and a cross-table leak reads 0 forever.",
    },
    {
      id: "cs-sf-2",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The ARR movement waterfall",
      brief:
        "Salesforce-flavored brief on the storefront db: the growth board closes with the ARR walk — billed value per month, the prior month beside it, and the net movement between them — so the CFO can see expansion and contraction without opening a spreadsheet. Probed facts: the 14-month spine runs 2024-01 to 2025-02; the walk opens at 3,731.97, sags through June's 2,047.43 into the July trough of 1,193.86, and closes at 2,390.53 in 2025-02. The spine folds ALL placed deals — cancellations stay inside billed by definition. The first month's movement is the baseline: LAG finds no prior row, and the board expects NULL there, not a fabricated zero.",
      ask: "Return the monthly billed ARR with the prior month alongside and the net movement to 2 decimals, chronological from the spine's first row.",
      template:
        "WITH monthly AS (\n  SELECT STRFTIME({1}, o.created_at) AS month,\n         ROUND(SUM(o.total), 2) AS billed\n  FROM orders o\n  GROUP BY month\n)\nSELECT month,\n       billed,\n       {2}(billed) OVER (ORDER BY month) AS prev_billed,\n       ROUND(billed - LAG(billed) OVER (ORDER BY month), {3}) AS net_movement\nFROM monthly\nORDER BY month {4};",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month-bucket format",
          noVerify: true,
          why: "%Y-%m prints '2024-07' — the 14-bucket spine the board reads. '%m' alone would merge January 2024 with January 2025 into one bucket and the walk would lose a year of history.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the look-back window",
          why: "LAG(billed) reaches one row back along the month order — the prior month each movement is measured against. LEAD would look forward, turning the walk into next-month comparisons and flipping every movement's sign story.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          noVerify: true,
          why: "Money reports to 2 decimals: 3,731.97, not 3,732. ROUND(…, 0) would round every movement to whole dollars and the walk would stop reconciling with the billed cells.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A waterfall reads left to right in time: 2024-01 first, 2025-02 last. DESC would open the board with the newest month and read every movement backwards — expansion labelled as contraction.",
        },
      ],
      distractors: ["LEAD", "'%m'", "0", "DESC"],
      walkthrough:
        "Two stages: fold the spine, then walk it. The CTE folds 103 deals onto STRFTIME('%Y-%m') — 14 monthly buckets from 3,731.97 down to the 1,193.86 July floor and back to 2,390.53 — and the outer query keeps every row, adding LAG(billed) OVER (ORDER BY month) as the prior month and the rounded difference as net_movement. The first row's LAG is NULL by definition, so 2024-01's movement is NULL — the baseline, not a flat month; coalescing it to zero is the waterfall lie this board explicitly forbids. The distractors each break a different way: LEAD looks forward so prev_billed becomes next month's value and every movement reads inverted; '%m' collapses the spine to 12 month-of-year buckets, merging both Januaries and both Februaries; 0 in the precision slot rounds the money to whole dollars so the walk no longer reconciles with billed; DESC reverses time itself. Note the delta expression keeps its own fixed LAG — two windows, one definition, stated once and reused: that is how movement queries stay reviewable at 9am on a forecast Monday.",
    },
    {
      id: "cs-sf-3",
      tier: "medium",
      topic: "t5",
      universe: "funnel",
      title: "The account leaderboard",
      brief:
        "Salesforce-flavored brief on the storefront db: the AE org's Monday read is the account leaderboard — deals entered per account, ranked, with ties handled by policy instead of luck. Probed facts: the deal-count ladder runs 24 (Alice Chen), 17 (Emma Wilson), 14 (Grace Kim), 13 (Maya Patel), 5 (Chloe Dubois), then FOUR accounts tied at 4 (Isabella Rossi, Keiko Sato, Noah Meyer, Pedro Alvarez), two at 3 (Farid Nasser, Hiro Tanaka), three at 2 and two at 1. The threshold in the query keeps every account carrying at least 3 deals, so the four-way tie stays inside the board and the rank function's tie behavior is visible in the output.",
      ask: "Return each account with its deal count and a no-gap board rank, biggest books first, for accounts carrying at least 3 deals.",
      template:
        "SELECT c.name,\n       COUNT(*) AS deals,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS board_rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id, c.name\nHAVING COUNT(*) >= {3}\nORDER BY board_rank, c.name;",
      slots: [
        {
          answer: "DENSE_RANK",
          kind: "keyword",
          label: "the no-gap rank function",
          why: "DENSE_RANK shares rungs without gaps: 1, 2, 3, 4, 5, then the four-way tie at 6, then 7 — no phantom rungs between the tie and the next count. RANK would stamp the two 3-deal accounts rank 9, implying accounts that do not exist; ROW_NUMBER would split the four-way tie arbitrarily.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "Biggest book on top means the window orders descending: 24 deals is rank 1. ASC would crown the two 3-deal accounts (Farid Nasser, Hiro Tanaka) as the top of the board — a correct query aimed at the wrong end of the leaderboard.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the board floor",
          why: "The floor keeps 11 accounts — down to the two at 3 deals — so both the tie and the no-gap property stay visible; on this db the number 3 is itself a rung, with two accounts sitting exactly at it. The threshold judges a per-account aggregate, which is why it lives in HAVING, not WHERE.",
        },
      ],
      distractors: ["RANK", "ROW_NUMBER", "ASC", "4"],
      walkthrough:
        "A census with a policy. The join attaches every deal to its account — all 103 survive — and GROUP BY account folds them into 16 rows; HAVING COUNT(*) >= 3 keeps the eleven accounts from Alice Chen's 24 down to the two at 3. The window ranks the folded counts: DENSE_RANK gives 1 through 5 to the distinct counts (24, 17, 14, 13, 5), stamps the four-way tie at 4 with a shared 6, and lands the two 3-deal accounts on 7 — shared rungs, no gaps, no invented strata. That gap-free contract is the whole point: RANK would jump from the tie to 9, printing three rungs nobody occupies, and ROW_NUMBER would hand the tie's four members ranks 6 through 9 as if deal counts could break a tie — a silent judgment call about whose name leads the board. Flip the window to ASC and the quietest accounts lead the read. When the AE org says 'leaderboard', the rank function is a tie policy — DENSE_RANK is the one that doesn't invent ranks.",
    },
    {
      id: "cs-sf-4",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The monthly pipeline census",
      brief:
        "Salesforce-flavored brief on the storefront db: the forecast review's first page is the monthly pipeline census — deals entered per month with the resolutions broken out in the same pass, because a month that entered 9 deals and won 4 reads differently from one that entered 9 and lost 2. Probed facts on the first six months of the 14-month spine: 2024-01 enters 8 (won 2, lost 1), 2024-02 enters 9 (won 4, lost 0), 2024-03 enters 8 (won 4, lost 1), 2024-04 enters 7 (won 3, lost 0), 2024-05 enters 8 (won 4, lost 0), 2024-06 enters 6 (won 2, lost 0). The census is one scan of orders — no join needed at deal grain — and COUNT(*) FILTER keeps every arm on the same population.",
      ask: "Return month, deals entered, closed-won count and closed-lost count for the first six months of the spine, chronological.",
      template:
        "SELECT SUBSTR(created_at, 1, 7) AS month,\n       COUNT(*) AS deals,\n       COUNT(*) FILTER (WHERE status = {1}) AS closed_won,\n       COUNT(*) FILTER (WHERE status = {2}) AS closed_lost\nFROM orders\nGROUP BY month\nORDER BY month\nLIMIT {3};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the won-stage literal",
          noVerify: true,
          why: "The won arm counts only delivered deals — 2, 4, 4, 3, 4, 2 across the six months. Unquoted delivered reads as a column and errors; 'shipped' would swap in contract-out deals and the forecast would book ARR that has not been countersigned.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the lost-stage literal",
          noVerify: true,
          why: "The lost arm isolates cancelled deals — 1, 0, 1, 0, 0, 0. 'pending' would report evaluation-stage deals as losses, turning healthy pipeline into a loss report; 'void' is invoice vocabulary and reads 0 forever, quietly deflating the loss column.",
        },
        {
          answer: "6",
          kind: "number",
          label: "the opener cut",
          why: "LIMIT 6 returns the first six months — the run the review opens with, ending on June's 6-deal fade. The figure 6 is itself in the output: June's entered count. The census stays one scan, and every arm filters the same folded rows.",
        },
      ],
      distractors: ["'shipped'", "'pending'", "'void'", "12"],
      walkthrough:
        "One scan, three counters, one population. The SUBSTR month key folds 103 deals into 14 monthly buckets; COUNT(*) reads entered pipeline (8, 9, 8, 7, 8, 6 for the first six) and the two FILTER arms read the resolutions off the same rows: won 2/4/4/3/4/2, lost 1/0/1/0/0/0. Because every arm filters the same folded rows, won + lost + open reconciles to entered by construction — the audit the review runs before any month gets quoted. The distractors each break a different promise: 'shipped' in the won arm books contract-out deals as countersigned; 'pending' in the lost arm converts evaluation-stage pipeline into losses; 'void' is invoices' word for a dead bill, so the orders scan reads 0 in every month; LIMIT 12 spills the census past June into H2 and doubles the page the memo quotes. FILTER (WHERE …) is the one-pass idiom the census wants — per-aggregate row selection in a single scan, with the stage map spelled out in the literals.",
    },
    {
      id: "cs-sf-5",
      tier: "hard",
      topic: "j4",
      universe: "month-close",
      title: "The collections shortfall ledger",
      brief:
        "Month-end close brief, in-world: finance reads the collections ledger before the quarter closes — every invoice still short, with the shortfall priced. Probed on the storefront db: 28 renewal invoices totaling 8,697,700 cents; 21 settle exact, one sits partial (INV-2025-025: 614,800 billed, 400,000 paid — a 214,800-cent gap), and six carry no payment rows at all (led by INV-2025-024 at 493,700 cents, including one statused 'paid' with zero settlements — a status that lies). The ledger must keep those never-settled rows: a LEFT JOIN hands them a NULL payment payload, the shortfall expression prices the gap, and the escalation cut keeps every invoice short by at least the partial invoice's gap.",
      ask: "Return invoice number, status, billed cents, paid cents and shortfall cents for every invoice still short by at least 214,800 cents, biggest shortfall first.",
      template:
        "SELECT i.number,\n       i.status,\n       i.amount_cents AS billed_cents,\n       {1}(p.amount_cents) AS paid_cents,\n       i.amount_cents - COALESCE(SUM(p.amount_cents), 0) AS shortfall_cents\nFROM invoices i\n{2} JOIN payments p ON p.invoice_id = i.id\nGROUP BY i.id, i.number, i.status, i.amount_cents\nHAVING i.amount_cents - COALESCE(SUM(p.amount_cents), 0) >= {3}\nORDER BY shortfall_cents DESC;",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the settled-cents adder",
          why: "SUM folds each invoice's payment rows into settled cents — split-paid invoices pay in two rows and must add up. COUNT would print a row count (1 or 2) in a cents column and the ledger would misprice every split settlement in the book.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the invoice-preserving join",
          why: "LEFT JOIN keeps all 28 invoices and hands the six never-settled ones a NULL payload — the rows this ledger exists to expose. INNER JOIN deletes them, including the 'paid'-with-no-payments anomaly, and the close would overstate collected AR by exactly the money that isn't there.",
        },
        {
          answer: "214800",
          kind: "number",
          label: "the escalation cut",
          why: "The floor is the partial invoice's own gap — 214,800 cents — so the list opens with the never-settled books (493,700 / 356,200 / 279,400) and closes ON the one partial invoice. Any lower floor floods the ledger with smaller shortfalls; any higher one hides the partial.",
        },
      ],
      distractors: ["COUNT", "INNER", "493700", "100000"],
      walkthrough:
        "An anti-join with a price tag. The LEFT JOIN keeps all 28 invoices; 22 match settlement rows, 6 arrive with NULL payloads, and GROUP BY i.id folds each invoice's payments — including the five split-payment invoices whose two rows must SUM to the bill. The shortfall expression prices the gap: billed minus COALESCE(settled, 0), so never-settled rows read their full bill (493,700 for INV-2025-024 — the anomaly statused 'paid' among them) instead of dropping out. HAVING keeps shortfalls at or above 214,800: four rows, biggest first, closing on INV-2025-025, the book's one partial settlement. The distractors fail honestly: COUNT in the aggregate slot prints row counts as cents; INNER JOIN deletes the six rows the ledger is named for; a 493,700 floor keeps only the biggest book; a 100,000 floor floods the list with the 129,500 and 87,300 tails. Note paid_cents prints NULL for the never-settled rows — the honest 'nothing settled', not a coerced zero.",
    },
    {
      id: "cs-sf-6",
      tier: "medium",
      topic: "q2",
      universe: "pricing",
      title: "The whale-deal scan",
      brief:
        "Pricing-review brief, in-world: the pricing team opens with the shape of the deal-size distribution — where the mean sits and which deals clear it. Probed on the storefront db: the mean deal totals 338.19 across the 103 entered; only 42 deals (40.8%) sit above their own book's mean, and their average is 578.80 — the skew story. The five biggest deals run 1,088.44 (Farid Nasser — an account with only 3 deals), 945.21 (Chloe Dubois), 845.92 (Emma Wilson), 826.03 (Grace Kim) and 785.79 (Emma Wilson again). The scan joins each above-average deal to its account so the whale list carries names, biggest first.",
      ask: "Return the five biggest above-average deals with their sizes and account names, biggest first.",
      template:
        "SELECT ROUND(o.total, 2) AS deal_size,\n       c.name AS account\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.total {1} (SELECT {2}(total) FROM orders)\nORDER BY o.total {3}\nLIMIT {4};",
      slots: [
        {
          answer: ">",
          kind: "keyword",
          label: "the above-mean comparison",
          why: "Strictly greater: the ask is above the mean, and the comparison defines the population — 42 of 103 deals survive it. '<' would return the below-mean majority and the whale list becomes the small-change list; '>=' risks a boundary row the mean almost never produces.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the mean-setter in the scalar slot",
          why: "The scalar subquery folds all 103 deals into one number — the mean, 338.19 — and WHERE compares each deal to it. SUM would return 34,833.28, a total no deal exceeds, and the report ships empty; MAX would raise the bar to 1,088.44 and clear everyone, including the whales.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "Biggest first is the whale read: 1,088.44 on top. ASC would open the memo with the smallest above-average deal (355.07) — the entry point of the population, not its headline.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the memo cut",
          noVerify: true,
          why: "The memo quotes the top five — the run where the whale names live. Those five cleared deals average 898.28 against the book's 338.19 mean: the concentration claim the pricing review opens with.",
        },
      ],
      distractors: ["<", "SUM", "ASC", "3"],
      walkthrough:
        "One scalar, one comparison, one cut. The subquery folds the whole book into its mean — 338.19 across 103 deals — and the WHERE keeps the 42 deals strictly above it: 40.8%, the skew the review narrates, since a mean above the majority's deal size means the big books pull it. The join attaches account names so the list reads like a call sheet: 1,088.44 Farid Nasser — an account with just 3 deals carrying the single biggest line — then 945.21, 845.92, 826.03 and 785.79, with LIMIT 5 making the cut. The distractors each break a different promise: '<' serves the below-mean majority; SUM in the scalar slot posts a total nothing exceeds and the report ships empty-looking but valid; ASC leads with the 355.07 entry deal; LIMIT 3 amputates the two tails the memo quotes. The scalar subquery's contract rides along: zero rows in the inner fold yield NULL, and total > NULL passes nothing — on the full book that never happens, on a filtered staging copy it always can.",
    },
  ],

  problems: [
    { slug: "daily-leads-and-partners", why: "Two-grain daily census — deals AND distinct accounts in one GROUP BY. The registry-tagged opener and the exact muscle of this kit's first case study." },
    { slug: "mrr-waterfall", why: "The registry-tagged ARR movement waterfall: LAG-classified new/expansion/contraction/churn — the query the forecast call opens with, in graded form." },
    { slug: "deferred-revenue", why: "The registry-tagged recognition schedule: billed once, recognized across periods on a recursive spine — the SaaS accountant's favorite follow-up." },
    { slug: "immediate-food-delivery-ii", why: "A conditional-count ratio where the denominator is the whole test — the win-rate question in textbook clothing: 52 of 103 entered, not 52 of 59 resolved." },
    { slug: "percentage-of-users-attended-a-contest", why: "Territory adoption share — the percentage of accounts a campaign touched, with the 100.0-before-division fix this kit drills." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the vocabulary check before any rep leaderboard ships, said out loud with the 1,2,3,4,5,5,5,5,9 pattern." },
    { slug: "combine-two-tables", why: "Account enrichment LEFT JOIN — account attributes attached to every deal, NULL-safe for rows the pipeline hasn't touched." },
    { slug: "unique-orders-and-customers-per-month", why: "Monthly census at two grains: deals entered and accounts active per month — coverage and load in one query, the way pipeline reviews open." },
    { slug: "weather-type-in-each-country", why: "CASE-classified grading per territory — hot/warm/cold forecast categories computed in one pass with exhaustive arms." },
    { slug: "portfolio-weights", why: "Each account's share of total value — the concentration read behind the 63.5%-from-3,000-plus headline, computed as a window share." },
    { slug: "cohort-retention-matrix", why: "Renewal-cohort grid — repeat-deal counts folded by entry period. The retention curve this kit's cases quantize is exactly this shape." },
    { slug: "managers-with-at-least-5-direct-reports", why: "The quota gate: a HAVING-counts subquery — reps clearing a pipeline threshold before any leaderboard is allowed to print." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Top-account argmax by deal count — who renews most often (24 deals on this db), decided on a grouped count rather than a screenshot." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one query with rounding at the very end — win and loss shares that reconcile to the same denominator, the honest-denominator drill." },
    { slug: "growth-accounting", why: "New/expansion/churned classification via LAG — ARR movements as a query rather than a slide, the same walk this kit's waterfall case builds." },
    { slug: "customers-who-never-order", why: "The whitespace anti-join: accounts with zero pipeline. On this db the honest answer is 0 — and proving a confident zero is the analyst's job." },
    { slug: "ar-aging-schedule", why: "The AR aging read this kit's shortfall ledger generalizes — invoices bucketed by how long they've been short. Finance's favorite month-close artifact, and the natural follow-up to any collections query." },
    { slug: "gl-reconciliation", why: "Ledger-vs-ledger reconciliation by counts and sums — the billing-vs-settlement check that surfaces the paid-no-payments anomaly. Salesforce screens favor candidates who reconcile instead of assert." },
    { slug: "second-highest-salary", why: "The tie-proof second-biggest deal read: MAX-below-MAX survives duplicates that LIMIT/OFFSET breaks. The deal-size leaderboard's classic follow-up, asked exactly this way." },
    { slug: "department-highest-salary", why: "Argmax per territory — the top deal in each theater via rank-then-join-back. Tests whether you can rank inside groups without dropping ties silently." },
    { slug: "compute-the-rank-as-a-percentage", why: "Percentile ranks on the leaderboard — where an account's deal count sits as a share of the board. The concentration read in ranking clothing." },
    { slug: "find-the-team-size", why: "COUNT() OVER (PARTITION BY …) enrichment — attach each account's deal-family size to every deal without collapsing rows. The pod-load read the coverage model runs on." },
    { slug: "find-cumulative-salary-of-an-employee", why: "Running totals per group — cumulative booked value across the month spine. The ARR trajectory read with a frame clause attached." },
    { slug: "customers-with-strictly-increasing-purchases", why: "Expansion detection: accounts whose deal sizes rise renewal over renewal. The NRR story as a window test — exactly this kit's growth vocabulary." },
    { slug: "employees-whose-manager-left-the-company", why: "Orphaned-pipeline anti-join — deals whose owner left, the reassignment queue. A self-join/anti-join with a real AE-org story behind it." },
    { slug: "duplicate-emails", why: "Duplicate detection by GROUP BY + HAVING — the detect half of the double-registration story, before any dedupe runs." },
    { slug: "keep-latest-dedupe", why: "Keep the freshest registration per key: ROW_NUMBER newest-first, rn = 1 survives. The clean half of the CRM-sync dedupe this kit's theory drills." },
    { slug: "average-salary-of-departments", why: "Territory-average subqueries — accounts above THEIR theater's mean. The correlated-vs-CTE-vs-window comparison in concrete form." },
    { slug: "nth-highest-salary", why: "Nth-ranked deal sizes with the rank trio — the vocabulary check before any leaderboard ships, ties included." },
    { slug: "balance-rollforward", why: "Opening + movements = closing, per period — the ARR roll-forward the forecast call defends. A waterfall with a reconciliation identity bolted on." },
    { slug: "sales-by-day-of-the-week", why: "Deal registrations by weekday — the entry rhythm that staffs the SDR week. A pivot read at pipeline grain." },
    { slug: "count-salary-categories", why: "Deal-size band census with UNION ALL zero buckets — bands with no rows print 0, not vanish. The honest histogram this kit's CASE work assumes." },
  ],
};
