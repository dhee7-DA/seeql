// Zoom — kit 3 of the SaaS & Enterprise domain (Batch I).
// Meetings, minutes and usage cohorts: billed tenant-months, participant
// funnels, plan-tier overages and a consumption calendar that CFOs read
// month by month. Registry tags are thin — exactly 1 tagged sql row
// (trial-to-paid-funnel) — so the pool is mostly theme-curated: every
// problem mirrors a usage-analytics workflow Zoom screens are known to probe.
// Case studies run on the storefront db mapped as customers=tenants,
// orders=subscription periods, order_items=usage lines, with probed
// figures from scripts/company-facts.md (no invented volumes).

import type { CompanyKit } from "../types";

export const zoomKit: CompanyKit = {
  id: "zoom",
  domainId: "saas",
  name: "Zoom",
  tagline: "Meetings, minutes and usage cohorts",
  accent: "text-sky-300",

  brief: [
    "Zoom is the meetings platform that became workplace infrastructure — video-first communications spanning Meetings, Webinars, Phone, Rooms and Chat, sold per host seat with usage metered underneath every plan. The business reality that shapes its data work is {amber:consumption}: a seat that stops hosting meetings is a renewal risk long before the renewal date, so the analytics org watches **billed tenant-months** the way a utility watches meter reads. On this storefront db that maps cleanly — 16 tenants carrying 103 billed tenant-months at an average **338.19** per month, with 251 usage lines underneath and a status mix that behaves like the usage ledger it is: 52 months delivered clean (50.5%), 30 in flight (29.1%), 14 staged pending (13.6%), 7 {rose:churned} before the month closed (6.8%).",
    "The data org is product-analytics shaped. Usage telemetry teams model host activity and participant funnels; monetization teams own plan-tier ladders and the overage lines that appear when a Pro host outgrows the cap; customer-success analytics runs usage cohorts — who hosted last month versus the month before — because {emerald:net usage retention} is the earliest {rose:churn} signal Zoom has. The consumption calendar is a first-class artifact: monthly billed usage runs from a **3,731.97** peak in 2024-01 down to a **1,193.86** floor in 2024-07, and every quarterly business review with an enterprise tenant is built on that spine.",
    "Interview style is funnel-then-denominator. A screen walks from a warm-up join to a **two-grain census** (meeting-months AND tenants per region — the EU region carries **45** billed months from just **8** tenants), then escalates into a conditional-count rate or a month-over-month window where the definition is the test. Follow-ups probe out loud: 'does a {rose:churned} month count in your denominator?', 'is that adoption rate per tenant or per host?' Candidates who state the grain before writing SQL do well — *the interviewers are listening for the denominator habit.*",
    "Preparation strategy: the registry tags exactly one sql row for Zoom (`trial-to-paid-funnel`), so this kit fills the rest of its pool by theme — usage censuses, conditional counting, cohort walks, plan-tier logic — each problem mapped onto a billed-tenant-month workflow. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the **plan-tier census** its monetization team ships at pricing reviews, the other rebuilds the **month-over-month consumption walk** its finance org closes every calendar with.",
  ],

  dayInLife: [
    "**08:30 —** The morning starts on the consumption calendar. A usage analyst opens the monthly trend first: did billed tenant-months land, is the curve tracking the 2024-01 peak of **3,731.97** or sliding toward the **1,193.86** July floor, and which regions are carrying the load — EU's 45 billed months versus LATAM's 2? The first query of the day is almost always a reconciliation: tenant-months counted, revenue summed, statuses split — 52 delivered, 30 shipped, 14 pending, 7 cancelled — because a month that fails to reconcile is *a billing fire, not a rounding note*.",
    "**11:00 —** Midday is cohort surgery. A customer-success manager wants the tenants whose usage dropped month-over-month — the `LAG` walk that flags churn before the renewal call; a monetization partner wants the plan-tier ladder re-cut (how much of the 34,833.28 lifetime base sits above the 3,000 enterprise line — **63.5%**, and the pricing team defends that boundary quarterly); a growth analyst wants trial tenants who never converted their first month into a second. Each ask is a join, a conditional aggregate and an argument about denominators — and the analyst writes the query with the definition attached so the number survives the QBR.",
    "**15:00 —** The afternoon tilts toward stakeholder cycles. Weekly usage reviews walk the participant funnel — tenants active, hosts hosting, meetings held — with every headline number carrying its SQL; overage reports go to finance with the tier boundary stated in the query, not in a footnote; and the renewal desk gets a one-and-done list (**2 of 16** tenants billed exactly once) with the caveat that *a census is not a forecast*. This is where usage numbers meet their audiences: one definition, read the same way by product, finance and the account team.",
    "**17:30 —** End of day is the writeup that keeps tomorrow's numbers defensible. The cohort-surgery queries get saved with their denominators in the comment; the one-and-done census ships with its caveat attached; and tomorrow's QBR spine is staged from **the consumption calendar**, peak and floor already annotated. The rhythm to internalize: Zoom SQL exists to prove that usage numbers are defined the same way in *the dashboard, the invoice and the board deck*.",
  ],

  metrics: [
    { name: "Billed consumption", what: "Usage revenue folded per tenant-month — the utility read. On this db the consumption calendar swings from 3,731.97 (2024-01) to 1,193.86 (2024-07); computing it is a month-bucket GROUP BY with the status rule stated." },
    { name: "Participant funnel completion", what: "Tenants active → hosts hosting → meetings held → minutes metered. The engagement stack Zoom watches weekly; each step is a DISTINCT count at a different grain, and the drop between steps is the product story." },
    { name: "Trial-to-paid conversion", what: "Share of trial tenant-months that become a billed second month. The tagged problem in this kit drills exactly this conditional count — denominator is all trials, not the converted." },
    { name: "Plan-tier overage rate", what: "Usage above the plan cap ÷ included usage, per tier. The monetization line that prices the next tier up — a conditional SUM where placing the tier filter in the wrong clause changes the invoice." },
    { name: "Net usage retention", what: "This month's active tenants who were active last month, net of new and churned. The earliest churn signal Zoom has — a LAG walk over the consumption calendar, not a snapshot." },
    { name: "Host concentration", what: "Share of billed consumption from tenants above a spend line: 63.5% of the 34,833.28 base sits with tenants whose lifetime crosses 3,000. A ratio whose denominator must be the whole base." },
    { name: "Kept-month rate", what: "Delivered tenant-months ÷ all billed months — 52 of 103 (50.5%) on this db. Zoom's version of 'orders placed vs orders kept': cancelled months (6.8%) are demand that never metered." },
    { name: "Region consumption mix", what: "Billed months and tenants per region — EU 45 months from 8 tenants, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. The two-grain census that separates load from audience." },
  ],

  topics: [
    {
      name: "Tenant-month censuses",
      why: "Every Zoom review opens with a two-grain census: billed tenant-months AND tenants per region or tier. COUNT(*) counts months; COUNT(DISTINCT customer_id) counts tenants — EU's 45 months collapse to 8 tenants, and the gap between the columns is the intensity signal. Screens probe whether you can fold 103 months into both grains without letting them blur.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "article-views-i"],
    },
    {
      name: "Trial-to-paid and funnel counts",
      why: "The trial funnel is Zoom's tagged workflow: trials started, trials converted, conversion share. Every branch is a conditional count — SUM over a 1/0 flag or COUNT FILTER — and the interviewer checks whether your denominator is all trials or just the ones that converted.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Conditional counting on the status ledger",
      why: "The 103 tenant-months split 52 delivered / 30 shipped / 14 pending / 7 cancelled, and nearly every reported number is one branch of that ledger. Zoom screens drill conditional aggregation until it is reflexive — because a kept-month rate computed over the wrong population is not a small error, it is a different business.",
      slugs: ["monthly-transactions-i", "number-of-rich-customers", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Usage cohorts and repeat behavior",
      why: "A tenant's second billed month is the whole retention story. The repeat distribution here runs 2 one-and-done tenants, a 4-tenant bench at 4 months, and a heavy tail at 24/17/14/13 — screens ask you to fold that distribution, then split it by region or cohort start, without fanning the join.",
      slugs: ["repeat-purchase-rate", "game-play-analysis-i", "cohort-retention-matrix"],
    },
    {
      name: "Join enrichment across tenants and usage",
      why: "Usage lines carry no tenant name — enrichment means joining tenant attributes onto 251 usage rows and knowing what survives. Zoom's follow-up is always about unmatched rows: does a usage line with no plan mapping appear in the report, silently or not?",
      slugs: ["combine-two-tables", "replace-employee-id-with-unique-identifier", "employees-with-missing-information"],
    },
    {
      name: "Ranking windows for host leaderboards",
      why: "Top hosts per region, second-billed month per tenant, newest active cohorts — usage reporting is leaderboard reporting. Zoom drills the rank trio because ties are routine when tenants share plan caps, and the LIMIT-1-OFFSET-1 habit breaks on them.",
      slugs: ["rank-scores", "the-most-recent-three-orders", "second-highest-salary"],
    },
    {
      name: "NULL policy on staged and unbilled months",
      why: "A pending tenant-month has no close date, a trial host has no plan, an overage line can be NULL until metered. Zoom screens check whether you treat NULL as data to report, coalesce to zero for display, or exclude with a stated reason — deliberately, never by accident.",
      slugs: ["employee-bonus", "calculate-special-bonus", "find-customer-referee"],
    },
    {
      name: "Rates with honest denominators",
      why: "Overage shares, adoption percentages, kept-month rates — Zoom's ratios punish integer division and filter drift. The house habit: 100.0 before the division, the denominator's filter decided before the ratio, rounding only at the end. The 6.8% cancellation share is only honest if all 103 months stay in the denominator.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "average-selling-price"],
    },
    {
      name: "Time intelligence on the billing calendar",
      why: "Usage analytics is calendar arithmetic: latest billed month per tenant, activity in the 30 days after signup, months inside a contract window. Zoom probes half-open intervals — BETWEEN on a month boundary loses the last day of the period, and the missing month reads as churn that isn't there.",
      slugs: ["the-latest-login-in-2020", "list-the-products-ordered-in-a-period", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "The consumption walk (month buckets + MoM)",
      why: "The consumption calendar is Zoom's spine: STRFTIME('%Y-%m') buckets, then a LAG walk for month-over-month deltas — the 2024-11 drop of 1,326.87 against October's 2,975.67 is the kind of number a review zooms into (pun intended). The kit's second case study rebuilds exactly this walk.",
      slugs: ["friday-purchase-iii", "growth-accounting", "consecutive-transactions-with-increasing-amounts"],
    },
  ],

  theory: [
    {
      id: "zoom-t1",
      q: "We report 'EU: 45 billed months, 8 tenants.' Why do those two counts need different expressions, and what breaks if you compute both with COUNT(*)?",
      a: "They measure different grains off the same fold. COUNT(*) counts rows after the join — every billed tenant-month, repeats included — so EU reads 45. COUNT(DISTINCT o.customer_id) folds repeat months back to people, so EU reads 8. Compute both with COUNT(*) and the census silently becomes one number printed twice: 45 and 45, and the intensity signal — 5.6 months per EU tenant versus 9.5 in the US — disappears. That gap between load and audience is the whole point of the two-grain census; every cohort claim Zoom makes about 'tenants' has to survive this fold.",
      tag: "aggregation",
    },
    {
      id: "zoom-t2",
      q: "A trial-conversion report must exclude churned months from the numerator. Where does that filter live, and why can't you fix it later in HAVING?",
      a: "The churn rule is a row-level fact, so it lives in WHERE: status filtering discards the 7 cancelled months before any aggregation touches the rest. Once rows are folded into a group, HAVING can only judge group-level aggregates — COUNT, SUM, AVG — it cannot reach back and un-mix cancelled months already summed into a total. The classic Zoom failure is summing delivered usage over all rows and trying to subtract churn in HAVING: the churn is already inside every group. The strong answer narrates the pipeline — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — and asks of every filter: is this a fact about one row, or about a group?",
      tag: "filtering",
    },
    {
      id: "zoom-t3",
      q: "Walk me through building a month-over-month consumption walk. Why is LAG the right tool, and what does the first row return?",
      a: "Stage it: a derived table folds orders into monthly buckets with STRFTIME('%Y-%m'), then LAG(burn) OVER (ORDER BY month) pulls the previous bucket alongside each row, and the delta is burn minus that pull. The first month has no previous month, so LAG returns NULL — and that NULL is correct, not a bug to coalesce away; a report that prints 0 there is claiming a baseline that doesn't exist. On this calendar the walk exposes the story: a −1,326.87 drop into 2024-11 and a +1,158.21 recovery into 2024-08. A self-join can compute the same deltas, but it fans out and needs an anti-condition for the first month; LAG keeps every row and states the intent in one window clause.",
      tag: "windows",
    },
    {
      id: "zoom-t4",
      q: "Your join between tenants and usage lines returned 600 rows for 251 usage lines. What happened, and how do you diagnose it before the meeting starts?",
      a: "Fan-out: the join key isn't unique on at least one side, so each usage line matched multiple tenant rows and the census multiplied. Diagnose by counting both ways — rows before the join, rows after — and by running COUNT(DISTINCT usage_id) on the joined set: if the distinct count is 251 but the row count is 600, the join is the multiplier. The fix is grain discipline: aggregate to one row per key on the many side before joining, or join on the true key. Every Zoom census that feeds a QBR runs this check, because a fanned join doesn't error — it inflates billed usage quietly, and an inflated usage number in front of a customer is a credibility incident.",
      tag: "joins",
    },
    {
      id: "zoom-t5",
      q: "We want the plan-tier ladder: enterprise, business, starter, with tenant counts and revenue. Where does the tier logic live and what does GROUP BY see?",
      a: "The tier is a row-level classification — a CASE expression over lifetime spend: >= 3000 enterprise, >= 1000 business, else starter. It lives in the SELECT as an aliased expression, and GROUP BY folds on that alias, so the CASE is evaluated per tenant before any bucket exists. Two boundaries mean two literals, and both are definitions: move the 3,000 line and the enterprise tier stops being the cohort that carries 63.5% of the 34,833.28 base — same query, different business. The failure mode is filtering tiers in WHERE after grouping (syntax error: the column isn't there yet) or in HAVING (logic error: it judges folded groups). Strong candidates state the boundary as a contract, not a convenience.",
      tag: "aggregation",
    },
    {
      id: "zoom-t6",
      q: "When is a scalar subquery the right shape for a usage report — and what does your query do if the inner query returns no rows?",
      a: "A scalar subquery earns its keep when the comparison bar is itself computed: months whose billed usage beats the platform-wide monthly average, tenants above the median lifetime spend. The inner query returns exactly one value, the outer filters against it, and the shape reads like the question. The empty-inner case is the interview's real target: an aggregate scalar subquery always returns one row (possibly NULL), so burn > NULL is UNKNOWN and the report returns nothing — silently. Zoom's rule: decide the empty case before shipping. If the inner query can return more than one row, the scalar shape errors at runtime, which is the failure you want — loud beats silent in a billing context.",
      tag: "subqueries",
    },
    {
      id: "zoom-t7",
      q: "A pending tenant-month has no close date. Do you coalesce it, filter it, or report it — and how do you decide?",
      a: "Decide by the question's denominator. If the report is kept-month rate, pending months stay in the denominator but out of the numerator — filtering them from the table would inflate the rate, so they're excluded from the numerator's filter, not from the population. If the report is a delivery pipeline view, pending IS the signal — 14 of 103 months — and coalescing its NULL close date to 'now' fabricates a false closure. COALESCE is for display defaults, not for analytic populations. The Zoom-flavored answer names all three options, picks per the ask, and states the choice in the query comment so the next analyst doesn't re-litigate it at the renewal meeting.",
      tag: "nulls",
    },
    {
      id: "zoom-t8",
      q: "Finance says your monthly usage total doesn't match the invoice run. Take me through the reconciliation query you write first.",
      a: "Split the population and diff the grains: month-bucket both sides, then compare three identities — row counts (billed tenant-months on each side), revenue sums (per month, to 2 decimals), and status mix (delivered 52, shipped 30, pending 14, cancelled 7 — if one side excludes a status the other includes, the gap is explained). The first query is a full outer-style comparison per month: sum, count, and the difference column, ordered by absolute difference descending. Nine times out of ten it's a definition drift — one side filters cancelled months, the other doesn't — and the reconciliation query's job is to make that drift visible as a number with a name, not a hunch in a meeting.",
      tag: "data-quality",
    },
  ],

  mcqs: [
    {
      id: "zoom-mcq-1",
      prompt: "The EU region shows 45 billed tenant-months from 8 tenants. What does `COUNT(DISTINCT o.customer_id)` return that `COUNT(*)` does not?",
      choices: [
        "The EU revenue total",
        "The unique tenant count — repeat months folded back to people",
        "The average months per tenant",
        "Both return 45; DISTINCT does nothing after a join",
      ],
      answer: 1,
      why: "COUNT(*) counts the joined rows (45 tenant-months); COUNT(DISTINCT customer_id) folds repeats to people (8). The gap — 5.6 months per tenant — is the usage-intensity signal the two-grain census exists to expose.",
      notes: [
        { choice: 2, why: "That ratio is 45.0/8 — a different expression. DISTINCT counts people; it never divides." },
        { choice: 3, why: "DISTINCT changes everything after a fan-out join: five months from one tenant add 5 to COUNT(*) and 1 to COUNT(DISTINCT …)." },
      ],
      difficulty: "easy",
    },
    {
      id: "zoom-mcq-2",
      prompt: "Which expression counts the 7 churned months out of 103 billed tenant-months correctly?",
      choices: [
        "COUNT(status = 'cancelled')",
        "SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)",
        "COUNT(status)",
        "SUM(status)",
      ],
      answer: 1,
      why: "The CASE flag turns status into a 1/0 per row and SUM adds the 1s — 7 — while COUNT(*) over the same rows holds the 103 denominator. Same fold, same population, honest share.",
      notes: [
        { choice: 0, why: "COUNT counts non-NULL values, and status = 'cancelled' is never NULL — it's 0 or 1 — so this counts all 103 rows, not the churned ones." },
        { choice: 2, why: "COUNT(status) counts non-NULL statuses — essentially every billed month. That's the denominator, not the numerator." },
      ],
      difficulty: "easy",
    },
    {
      id: "zoom-mcq-3",
      prompt: "7 of 103 tenant-months churned. Which expression returns the true 6.8% cancellation share?",
      choices: [
        "100 * SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) / COUNT(*)",
        "100.0 * SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) / COUNT(*)",
        "SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) / COUNT(*) * 100.0",
        "100.0 * 7 / 100",
      ],
      answer: 1,
      why: "The 100.0 multiplier promotes the division to floating point before any truncation: 7/103 = 6.8%. Both guards — same-fold denominator, float promotion — in one line.",
      notes: [
        { choice: 0, why: "INTEGER 100 first means SQLite divides integers: 7*100/103 truncates toward zero — shares under 1% would print 0, and 6.8 rounds the wrong way." },
        { choice: 2, why: "Same integers, same trap, just reordered: the division happens on INTEGER 7 / INTEGER 103 before the multiply ever sees it." },
      ],
      difficulty: "medium",
    },
    {
      id: "zoom-mcq-4",
      prompt: "`SELECT t.name FROM tenants t LEFT JOIN usage u ON u.tenant_id = t.id WHERE u.plan = 'enterprise'` — what silently happened?",
      choices: [
        "Nothing — LEFT JOIN keeps every tenant",
        "The WHERE turned it into an INNER JOIN for every tenant without enterprise usage",
        "It now returns only trial tenants",
        "Each tenant appears once per usage line — duplicates are the bug",
      ],
      answer: 1,
      why: "Filtering the right table's column in WHERE kills the NULL-payload rows (NULL = 'enterprise' is UNKNOWN → discarded), collapsing the LEFT JOIN to an INNER. Any tenant without enterprise usage vanishes — and the query still looks correct.",
      notes: [
        { choice: 0, why: "Unmatched tenants carry u.plan = NULL, which fails the equality test. LEFT-ness survives only in the ON clause." },
        { choice: 3, why: "Fan-out duplication is real for multi-line tenants — but that's a separate defect. The silent downgrade removes rows; it doesn't duplicate them." },
      ],
      difficulty: "medium",
    },
    {
      id: "zoom-mcq-5",
      prompt: "In a month-over-month consumption walk, what does `LAG(burn) OVER (ORDER BY month)` return for the first month, and what should the report do with it?",
      choices: [
        "0 — the baseline month has no growth",
        "NULL — no previous month exists; the walk starts there, uncoalesced",
        "The first month's own value — LAG wraps around",
        "It errors — LAG needs a PARTITION BY",
      ],
      answer: 1,
      why: "LAG pulls the previous row's value; the first row has none, so it returns NULL. That NULL is the honest baseline boundary — a 2024-01 delta computed against nothing. Coalescing it to 0 fabricates a comparison the data never made.",
      notes: [
        { choice: 0, why: "0 is a claim that January's delta was flat — a number invented by the COALESCE, not the data. Finance would annualize it." },
        { choice: 2, why: "Windows don't wrap. LAG on the first row is NULL regardless of frame; only an explicit default argument (LAG(x, 1, 0)) would substitute a value." },
      ],
      difficulty: "medium",
    },
    {
      id: "zoom-mcq-6",
      prompt: "You classified tenant-months into plan tiers with CASE in the SELECT, aliased `plan_tier`. Where can you filter to enterprise-only?",
      choices: [
        "WHERE plan_tier = 'enterprise' — aliases are visible everywhere",
        "HAVING plan_tier = 'enterprise' — group-level filter",
        "Neither directly — wrap the classified query in an outer query (or repeat the CASE) and filter in the outer WHERE",
        "ORDER BY only — SQLite forbids filtering on CASE output",
      ],
      answer: 2,
      why: "SELECT aliases are evaluated after WHERE (and logically after HAVING), so neither clause sees `plan_tier` reliably. The robust pattern is a derived table or CTE that classifies first, then an outer WHERE — the same staged shape the plan-tier case study uses.",
      notes: [
        { choice: 0, why: "The pipeline order is FROM → WHERE → GROUP BY → HAVING → SELECT. WHERE runs before the alias exists; some engines forgive it, none guarantee it." },
        { choice: 1, why: "HAVING filters folded groups — but plan_tier is a row-level classification, not an aggregate. It only lines up by accident when the CASE is also the GROUP BY key." },
      ],
      difficulty: "medium",
    },
    {
      id: "zoom-mcq-7",
      prompt: "You want cumulative billed usage across the consumption calendar: each month plus all months before it. Which window does this with correct month boundaries?",
      choices: [
        "SUM(burn) OVER (ORDER BY month) — default frame orders the running total",
        "SUM(burn) OVER () — the whole calendar at once",
        "SUM(burn) OVER (ORDER BY month ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) — two-month windows",
        "AVG(burn) OVER (ORDER BY month) — the average IS the cumulative view",
      ],
      answer: 0,
      why: "SUM OVER an ordered key with the default frame (RANGE UNBOUNDED PRECEDING → CURRENT ROW) is the running total: each month carries its full history. It turns the 14-month calendar into a cumulative burn curve — the chart finance actually screenshots.",
      notes: [
        { choice: 1, why: "No ORDER BY means the frame is the whole partition — every row gets the grand total 34,833.28, not a running curve." },
        { choice: 2, why: "That's a two-month rolling window, not a cumulative one — 2024-07 would carry only June and July, erasing the prior half-year." },
      ],
      difficulty: "hard",
    },
    {
      id: "zoom-mcq-8",
      prompt: "Months whose billed usage beats the platform-wide monthly average — the inner scalar subquery returns NULL because the period table was empty that run. What does the outer report return?",
      choices: [
        "All months — anything beats NULL",
        "No months — burn > NULL is UNKNOWN, and UNKNOWN is filtered out",
        "An error — scalar subqueries cannot return NULL",
        "Only the first month",
      ],
      answer: 1,
      why: "Every comparison against NULL evaluates to UNKNOWN, and WHERE/HAVING keep only TRUE rows. An empty inner query doesn't error — it silently empties the report, which is why Zoom's rule is to decide the empty case before shipping the bar.",
      notes: [
        { choice: 0, why: "That's the classic three-valued-logic inversion: NULL is not 'the smallest value', it's UNKNOWN — and UNKNOWN never survives a filter." },
        { choice: 2, why: "Aggregate scalar subqueries always return exactly one row (possibly NULL). Zero rows would error on a non-aggregated scalar; NULL does not." },
      ],
      difficulty: "hard",
    },
    {
      id: "zoom-mcq-9",
      prompt: "Which expression buckets the 103 tenant-months into the 14-month calendar spine finance expects?",
      choices: [
        "SUBSTR(created_at, 1, 4) AS month",
        "STRFTIME('%Y-%m', created_at) AS month",
        "STRFTIME('%m', created_at) AS month",
        "DATE(created_at) AS month",
      ],
      answer: 1,
      why: "'%Y-%m' prints '2024-07' — one bucket per calendar month across both years. SUBSTR(created_at,1,7) is the equivalent idiom; the four-digit year alone folds to 2 buckets and '%m' alone merges July 2024 with July 2025.",
      notes: [
        { choice: 2, why: "Month without year re-folds 14 months into 12 and merges two Januaries — a calendar that double-counts every annual cycle." },
        { choice: 3, why: "Full dates give 400+ buckets — the calendar spine disappears entirely and the 'trend' becomes a scatter plot." },
      ],
      difficulty: "easy",
    },
    {
      id: "zoom-mcq-10",
      prompt: "A billing packet stacks delivered-month rows on top of a churned-month summary with UNION. Rows come back missing. What bit you?",
      choices: [
        "UNION ALL is required for numeric columns",
        "UNION deduplicates across the whole stack — two identical rows from different branches collapse into one",
        "UNION sorts away duplicates only in the second branch",
        "UNION requires the same column aliases, else it errors loudly",
      ],
      answer: 1,
      why: "UNION applies DISTINCT across the combined set: if a delivered branch and a churned branch happen to emit identical tuples, one silently disappears. UNION ALL keeps both — billing stacks always want ALL, and the reconciliation count (branch sums = stack total) is the audit.",
      notes: [
        { choice: 0, why: "Both set operators handle numeric columns identically; the choice is about duplicate elimination, not types." },
        { choice: 3, why: "Aliases don't need to match — column POSITION binds the stack. That's actually the other classic bug: misaligned positions union a revenue into a count column without any error." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-zoom-1",
      tier: "easy",
      topic: "s6",
      universe: "pricing",
      title: "The plan-tier census",
      brief:
        "Zoom-flavored brief on the storefront db: the pricing review opens with the plan-tier ladder — but the boundary is a contract, not a convenience. Monetization's memo is explicit: 'enterprise starts at 3,000 lifetime, business at 1,000, everything under is starter — and I want tenants AND revenue per tier, because tier count without tier revenue is a headcount vanity metric.' Probed facts: 16 tenants carry 34,833.28 lifetime, and 63.5% of it — 22,121.70 — sits with the four tenants above the 3,000 line (7,262.35, 6,640.56, 4,574.23, 3,644.56). The ladder must classify every tenant exactly once: the WHEN order is the definition, and no tenant may fall through.",
      ask: "Return each plan tier with its tenant count and lifetime revenue (2 decimals), biggest revenue first.",
      template:
        "SELECT CASE WHEN lifetime >= {1} THEN 'enterprise'\n            WHEN lifetime >= {2} THEN 'business'\n            ELSE 'starter' END AS plan_tier,\n       {3}(*) AS tenants,\n       ROUND({4}(lifetime), 2) AS revenue\nFROM (SELECT customer_id, SUM(total) AS lifetime\n      FROM orders\n      GROUP BY customer_id)\nGROUP BY plan_tier\nORDER BY revenue {5};",
      slots: [
        {
          answer: "3000",
          kind: "number",
          label: "the enterprise line",
          noVerify: true,
          why: "The 3,000 boundary is the definition the pricing team defends: exactly four tenants clear it and they carry 63.5% of the base. A 5,000 line would strand the 4,574.23 and 3,644.56 tenants in business and shrink the enterprise story mid-review.",
        },
        {
          answer: "1000",
          kind: "number",
          label: "the business floor",
          noVerify: true,
          why: "Business starts at 1,000 — the second WHEN catches everyone the first missed but stays above the floor. Note the order: CASE stops at the first true arm, so 3000 must be tested before 1000, or every enterprise tenant gets reclassified as business.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the tenant counter",
          why: "COUNT(*) counts the tenants folded into each tier — 4, 4, 8. SUM(*) isn't SQL, and MAX(*) would report one tenant per tier, not the ladder depth monetization manages.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the tier's revenue fold",
          why: "SUM(lifetime) adds each tier's tenants into 22,121.70 / 6,911.67 / 5,799.91 — and the three cells must reconcile to the 34,833.28 base. AVG would report a per-tenant average as if it were the tier's revenue.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The review opens with the tier that pays: enterprise 22,121.70 on top. ASC would lead with starter — a correct query that opens the pricing deck with the cheapest cohort.",
        },
      ],
      distractors: ["AVG", "MAX", "ASC", "5000"],
      walkthrough:
        "A CASE ladder with the boundary as the deliverable. The derived table folds 103 billed tenant-months to one lifetime row per tenant — 16 rows — then the CASE classifies each: the first WHEN (>= 3000) catches Alice Chen's 7,262.35, Emma Wilson's 6,640.56, Grace Kim's 4,574.23 and Maya Patel's 3,644.56 — 4 enterprise tenants carrying 22,121.70, exactly the 63.5% concentration the concentration probe reports. The second WHEN (>= 1,000) catches the next four, and ELSE sweeps the remaining 8 into starter — exhaustiveness is why the ladder needs no NULL arm. COUNT(*) and SUM(lifetime) fold the same rows per tier, so headcount and revenue can never disagree about population. Swap 3000 for 5000 and the enterprise tier halves to two tenants — the same query re-cutting the company's headline cohort. The reconciliation check is free: 22,121.70 + 6,911.67 + 5,799.91 = 34,833.28, the calendar's full base.",
    },
    {
      id: "cs-zoom-2",
      tier: "medium",
      topic: "t7",
      universe: "month-close",
      title: "The consumption walk",
      brief:
        "Zoom-flavored brief on the storefront db: the month-close deck closes with the consumption walk — the 14-month calendar with each month's billed usage and its month-over-month delta, oldest first, because customer-success reads it as a churn tripwire. The memo is explicit: 'the delta column is the product — I need to see the 2024-11 slide and the August recovery in one pass, not two queries I eyeball-join.' Probed facts: the calendar runs from 2024-01's 3,731.97 peak to 2025-02's 2,390.53, with the floor at 2024-07 (1,193.86); October 2024 closed at 2,975.67 and November at 1,648.80 — a single-month drop finance wants printed, not described. The first month has no previous month and must show that honestly.",
      ask: "Return every month with its billed usage and the month-over-month delta (2 decimals), oldest month first.",
      template:
        "SELECT month,\n       ROUND(burn, 2) AS burn,\n       ROUND(burn - {1}(burn) OVER (ORDER BY month), {3}) AS mom_delta\nFROM (SELECT {2}('%Y-%m', o.created_at) AS month,\n             SUM(o.total) AS burn\n      FROM orders o\n      GROUP BY month)\nORDER BY month {4};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the previous-month pull",
          why: "LAG(burn) OVER (ORDER BY month) sets the previous bucket beside each row so the delta is a subtraction. LEAD would pull the NEXT month — every delta flips sign and the 2024-11 slide reads as a November recovery. The window keeps all 14 rows; a self-join would drop the first month or fan out.",
        },
        {
          answer: "STRFTIME",
          kind: "keyword",
          label: "the month-bucket builder",
          why: "STRFTIME('%Y-%m', created_at) prints the '2024-11' spine finance expects. '%Y' would collapse the walk into two year-long buckets and erase every month-over-month delta — a valid query that no longer contains a month.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the cent-precision cut",
          noVerify: true,
          why: "Deltas print to 2 decimals: −1,326.87 exactly as finance reads it. At 1 decimal the walk rounds the very numbers the deck argues about; unrounded floats print 14-digit tails into the board memo.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the oldest-first direction",
          why: "The walk reads forward in time: 2024-01 first, 2025-02 last — deltas roll down the page in the order customer-success narrates them. DESC would open the walk with the newest month and a delta whose 'previous' hasn't been seen yet.",
        },
      ],
      distractors: ["LEAD", "'%Y'", "DESC", "1"],
      walkthrough:
        "Two stages, one walk. The derived table folds 103 tenant-months onto the '%Y-%m' spine — 14 buckets from 3,731.97 down to the 1,193.86 floor and back to 2,390.53. Then LAG(burn) OVER (ORDER BY month) walks the spine: February reads 3,609.64 minus 3,731.97 = −122.33, August reads 2,352.07 minus 1,193.86 = +1,158.21, and the tripwire row is 2024-11: 1,648.80 against October's 2,975.67 — a −1,326.87 slide, the largest single-month drop in the walk. The first month's delta is NULL because LAG has no row before 2024-01 — report it, don't coalesce it: a fabricated 0 baseline is a claim the data never made. LEAD in the pull slot mirrors every sign and turns the November crash into a phantom recovery — the exact misread that gets a renewal call scheduled a month late. And the delta column reconciles by construction: sum the burns, step through the deltas, and you land back on the same total.",
    },
  ],

  problems: [
    { slug: "trial-to-paid-funnel", why: "Zoom's one registry-tagged problem, and its core funnel: trial tenant-months versus converted ones — conditional counts where the denominator is every trial, the exact shape of the kit's conversion reads." },
    { slug: "daily-leads-and-partners", why: "The two-grain census — months AND tenants in one GROUP BY. Zoom opens every business review with this fold: 45 billed months in EU, 8 tenants behind them." },
    { slug: "repeat-purchase-rate", why: "Share of tenants with 2+ billed months. The repeat distribution here (2 one-and-done tenants, a heavy 24/17/14/13 tail) is the usage-cohort story customer-success tells at renewal." },
    { slug: "number-of-rich-customers", why: "Counting tenants above a spend threshold — the plan-tier census warm-up. Four tenants clear the 3,000 enterprise line and carry 63.5% of the base." },
    { slug: "game-play-analysis-i", why: "First-event per actor — the first billed month per tenant. Zoom's onboarding question: how long from signup to the first metered month." },
    { slug: "the-latest-login-in-2020", why: "Latest activity within a window — the freshest billed month per tenant. Staleness is Zoom's churn tripwire, and this drills the date-filter idiom behind it." },
    { slug: "growth-accounting", why: "New / retained / resurrected / churned via LAG status transitions — the exact grammar of Zoom's net usage retention walk." },
    { slug: "employee-bonus", why: "LEFT JOIN with a NULL-dependent bonus — the pattern behind overage lines that only bill when usage crosses the cap." },
    { slug: "rank-scores", why: "Ordered ranks over scores — the host leaderboard shape. Zoom ties are routine (shared plan caps), so the rank trio matters here." },
    { slug: "combine-two-tables", why: "Enrich one table from another without losing rows — usage lines joined to plan attributes, the daily Zoom enrichment join." },
    { slug: "queries-quality-and-percentage", why: "A ratio with a quality threshold and a percentage column — the overage-rate pattern, integer-division trap included." },
    { slug: "monthly-transactions-i", why: "Month-bucketed conditional counts inside a date window — the consumption calendar's first fold, on the '%Y-%m' spine." },
    { slug: "confirmation-rate", why: "A share computed per actor over joined events — adoption-rate mechanics for the participant funnel." },
    { slug: "calculate-special-bonus", why: "CASE-driven conditional values per row — tier classification and overage flags in one pass, the plan-ladder muscle." },
    { slug: "cohort-retention-matrix", why: "Cohorts by start month, retained by offset — the usage-cohort matrix Zoom's CS org lives in." },
    { slug: "percentage-of-users-attended-a-contest", why: "Participation share of a registered base — the meeting-attendance rate, denominator = all registrants, not all attendees." },
  ],
};
