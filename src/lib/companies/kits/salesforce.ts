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
    "Preparation strategy: the registry tags only 3 SQL problems for Salesforce (`daily-leads-and-partners`, `deferred-revenue`, `mrr-waterfall`) — they lead the pool, and the rest of the 30-topic slugs and 16 problems are theme-curated to known screen shapes: two-grain censuses, stage-aware conditional counts, leaderboard ranking, ARR waterfalls and deferred-revenue schedules. Then run both case studies on the live db: one rebuilds the theater pipeline census sales ops opens Monday with, the other rebuilds the monthly ARR movement waterfall the forecast call defends. The bar to clear: state the *stage definition* and the *denominator* before you compute anything.",
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
      slugs: ["daily-leads-and-partners", "list-the-products-ordered-in-a-period", "unique-orders-and-customers-per-month"],
    },
    {
      name: "Stage-aware counting & win rates",
      why: "Closed-won, closed-lost, open pipeline — every rate here is a conditional count over a stage flag, and the interviewer's first question is always 'what's in the denominator?'. SUM(CASE WHEN stage …) over ALL entered deals is the shape that survives scrutiny.",
      slugs: ["immediate-food-delivery-ii", "monthly-transactions-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Joining accounts to pipeline",
      why: "Deals inherit territory, industry and account health through joins to the account table, and the join type decides who survives: an opportunity with no account is corruption; an account with no pipeline is whitespace. Choosing INNER versus LEFT is a business statement.",
      slugs: ["combine-two-tables", "sales-analysis-i", "top-travellers"],
    },
    {
      name: "Rep & territory leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four accounts sit at 4 deals each on this db, and two reps share every crowded rung. RANK, DENSE_RANK and ROW_NUMBER are a business decision about who shares a rung, not syntax trivia.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Forecast categories with CASE",
      why: "Forecast calls live on CASE-classified buckets: hot/warm/cold grading, commit versus best-case, deal-size bands. The arms must be exhaustive and ordered — a hole in the CASE is a hole in the forecast.",
      slugs: ["weather-type-in-each-country", "the-category-of-each-member-in-the-store", "calculate-special-bonus"],
    },
    {
      name: "ARR movement waterfalls (LAG)",
      why: "The ARR walk — new, expansion, contraction, churn — is a LAG over a month spine, classified per movement. The first row returns NULL by definition and the classification logic must say so, or every quarter-one report starts with a phantom drop.",
      slugs: ["mrr-waterfall", "growth-accounting", "week-over-week-churn"],
    },
    {
      name: "Retention cohorts & repeat deals",
      why: "NRR is a cohort statement: accounts that entered together, renewed how many times since. The repeat-deal distribution on this db (2 single-deal accounts, 9 at 2–4, 1 at 5, 4 embedded at 10+) is exactly the curve a retention review reads out loud.",
      slugs: ["cohort-retention-matrix", "repeat-purchase-rate", "game-play-analysis-iv"],
    },
    {
      name: "Concentration & account sizing",
      why: "When 63.5% of value sits with 3,000-plus accounts, concentration reads decide coverage models. Share-of-total windows, NTILE quintiles and spend tiers turn a deal table into a portfolio view — and the denominator is always total ARR.",
      slugs: ["portfolio-weights", "rfm-segmentation", "customer-purchasing-behavior-analysis"],
    },
    {
      name: "Subquery screens & quota gates",
      why: "Screens escalate into nested logic: deals above the company average, reps clearing a pipeline threshold, accounts covering every product line. Scalar, IN, EXISTS and HAVING-gated shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "customers-who-bought-all-products"],
    },
    {
      name: "Deferred revenue schedules (WITH RECURSIVE)",
      why: "A multi-year contract is billed once and recognized monthly — the recognition schedule is a recursive spine spreading value across periods. It is the SaaS-flavored reason WITH RECURSIVE appears in revenue interviews, and the ledger must always balance to zero.",
      slugs: ["deferred-revenue", "find-the-missing-ids", "total-sales-amount-by-year"],
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
  ],
};
