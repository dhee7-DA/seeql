// Snowflake — kit 5 of the SaaS & Enterprise domain (Batch I).
// The warehouse as the product: credit burn per warehouse, query usage,
// storage-vs-compute spend and consumption-based revenue. Registry tags
// are thin — exactly 2 tagged sql rows (net-revenue-retention,
// late-arriving-restatement) — so the pool is mostly theme-curated: every
// problem mirrors a consumption-analytics workflow Snowflake screens are
// known to probe.
// Case studies run on the storefront db mapped as customers=tenant accounts,
// orders=billing periods, order_items=consumption lines, products=service
// families, monthly trend=the consumption calendar — probed figures from
// scripts/company-facts.md (no invented volumes).

import type { CompanyKit } from "../types";

export const snowflakeKit: CompanyKit = {
  id: "snowflake",
  domainId: "saas",
  name: "Snowflake",
  tagline: "The warehouse itself: usage and credit burn",
  accent: "text-indigo-300",

  brief: [
    "Snowflake is the cloud data platform whose revenue model is its own product demo: customers buy capacity credits and burn them per second of warehouse compute plus bytes of storage, so the company's usage telemetry IS its income statement. The analytics reality is consumption economics — {orange:credit burn} per warehouse, storage versus compute mix, and the concentration story every consumption business lives on. On this storefront db the mapping is honest: 16 tenant accounts generate 103 billing periods worth **34,833.28**, folded from 251 consumption lines across 7 service families; the calendar runs 2024-01 to 2025-02 with a 3,731.97 burn peak and a 1,193.86 trough, and **63.5%** of lifetime consumption sits with accounts whose spend crosses the 3,000 line — *the skew a consumption CFO watches instead of logins*.",
    "The data org models the platform from the inside. Usage analytics owns the burn fold: consumption lines joined to service families (compute, storage, transfer) and aggregated per billing period. Finance analytics owns the billing runs — 28 `invoices` against 27 `payments`, with an AR anti-join of 6 {rose:never-collected} runs — and the reconciliation culture is ledger-grade: the trial balance here closes at **181,080 debits against 181,080 credits**, and a query that can't reproduce that identity doesn't ship. Reliability analytics owns late data: restatements are a first-class event when your customers are billed on the same feeds your dashboards read.",
    "Interview style is economy-of-folds. A screen walks from a warm-up join to a per-family burn fold (credits, spend, one `GROUP BY`), then escalates into a **concentration ratio** where the denominator is the whole base, or a stack-and-reconcile read — per-family rows plus a `TOTAL` row that must sum back to the calendar. Follow-ups probe units and skew: 'is that spend compute or storage?', 'what share of the base is your top decile — and is that healthy?' Candidates who narrate the fold before the filter do well; Snowflake's data teams think in *GROUP BY economics, not dashboards*.",
    "Preparation strategy: the registry tags exactly two sql rows for Snowflake (`net-revenue-retention`, `late-arriving-restatement`) — both drilled in this kit's topics. The rest of the pool is theme-curated around its known screens: burn calendars, concentration ratios, spike-vs-baseline reads, stack reconciliations and late-data hygiene. Do the topics in order, then run the case studies on the live storefront db: the opening pair rebuilds the {orange:credit-burn} stack with its `TOTAL` row that finance reconciles every close and the out-burn-month screen that flags consumption spikes against the platform baseline.",
    "This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the asks Snowflake's data teams rehearse most: the credit-burn stack with its TOTAL-row reconciliation, the out-burn-month spike screen, the compute-versus-storage mix, the never-collected AR anti-join, the renewal-risk bench ranked with DENSE_RANK, and the per-account burn walk built on LAG. Run each on the live storefront database, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **thirty MCQs**, the theory bank and the **32-problem pool**, and treat the walkthroughs as the real content: they narrate what each wrong chip costs, which is exactly the muscle the 'what share of the base is your top decile?' follow-up tests.",
  ],

  dayInLife: [
    "**08:15 —** The morning starts on the burn calendar. A consumption analyst opens the monthly trend first: where does burn sit against the **3,731.97** January peak and the **1,193.86** July floor, and which service families moved — compute lines versus storage lines? The first query is the reconciliation stack: per-family credits and spend, plus the `TOTAL` row that must land on the calendar's 34,833.28. If the stack doesn't sum, the day's numbers are quarantined — a consumption business cannot publish a burn number that doesn't fold back to its own invoice base.",
    "**11:00 —** Midday is skew analysis. A revenue partner wants concentration re-cut (the **63.5%** share from 3,000-plus accounts, recomputed per region — EU's **15,089.23** leads, LATAM's **852.44** barely registers); a capacity planner wants the months that out-burned the platform baseline and by how much; finance wants the AR anti-join refreshed — the 6 never-collected billing runs — before the dunning cycle goes out. Each ask is a fold with a stated denominator, and the analyst ships the query with the definition attached because a concentration number without its base is a rumor with decimals.",
    "**14:30 —** The afternoon is the stakeholder loop. Weekly consumption reviews walk the calendar with SQL attached to every bar; the billing desk closes against the coverage census (21 exact, 1 partial at **4,000 of 6,148**, 6 never-collected); and the reliability hour reviews restatements — which period's burn changed after late-arriving rows landed, and did the re-cut calendar get republished before the customer saw a stale number. This is the hour the three grains meet their audiences: line, family, calendar, *each defended in front of the people who bill against it*.",
    "**17:45 —** End of day is the writeup that keeps the ledger honest. The burn stack ships with its reconciliation identity in the header — family rows sum to the `TOTAL`, the `TOTAL` lands on the calendar; the restatement log gets its watermark note for the feeds that moved; and tomorrow's dunning queue is staged with the anti-join already attached. The rhythm to internalize: Snowflake SQL exists to make consumption honest at three grains at once — line, family, calendar — and the analyst who can reconcile across all three in one sitting is the one finance calls first.",
  ],

  metrics: [
    { name: "Credit burn", what: "Compute consumed per warehouse per period, folded from usage lines. The headline consumption metric — on this db the per-period burn swings 1,193.86 to 3,731.97, and every trend claim starts at this fold." },
    { name: "Storage-vs-compute mix", what: "Spend share between storage families and compute families. The architecture read that decides pricing guidance — a CASE classification over the family column, folded in the same pass as the burn." },
    { name: "Consumption revenue", what: "Billed usage per period — 34,833.28 across the calendar here. The revenue line that IS usage: no seats to hide behind, so a soft month is visible the day it closes." },
    { name: "Spend concentration", what: "Share of base from accounts above a threshold: 63.5% from 3,000-plus accounts (71.2% from 2,000-plus). The skew metric a consumption business reports instead of a logo count." },
    { name: "Out-burn months", what: "Periods whose burn clears the platform baseline — the spike screen. A HAVING-against-scalar-subquery read; which months qualify is the first question in every capacity review." },
    { name: "Billing-run coverage", what: "Billing periods with a settled payment vs all — 21 of 28 exact, 1 partial (4,000 of 6,148), 6 never-collected. The AR anti-join finance refreshes every close." },
    { name: "Family fold depth", what: "Credits and spend per service family, with the TOTAL row reconciled to the calendar. The stack audit: a burn report whose family rows don't sum to the base doesn't ship." },
    { name: "Restatement exposure", what: "Share of reported burn that changed after late-arriving data landed. The reliability metric — the tagged problem drills the watermark discipline behind it." },
  ],

  topics: [
    {
      name: "Consumption censuses",
      why: "Every Snowflake review opens with a fold: billing periods, tenant accounts, credits — grouped and counted without letting the grain blur. COUNT(*) counts periods, COUNT(DISTINCT customer_id) counts accounts; the calendar's 103 periods come from just 16 accounts, and the census is where candidates prove they know which grain they're standing on.",
      slugs: ["product-sales-analysis-ii", "unique-orders-and-customers-per-month", "find-followers-count", "warehouse-manager", "sessionize-events"],
    },
    {
      name: "The burn calendar",
      why: "Consumption is calendar arithmetic: STRFTIME('%Y-%m') buckets over billing periods, then trend reads against the 3,731.97 peak and the 1,193.86 floor. Snowflake screens drill the month-bucket idiom because every burn chart in the business hangs on that spine — and a '%m'-without-year fold merges two years into one lie.",
      slugs: ["friday-purchase-iii", "monthly-transactions-i", "the-latest-login-in-2020", "budget-pacing"],
    },
    {
      name: "Storage-vs-compute joins",
      why: "Usage lines carry no family names — the storage-vs-compute split is a join to the service catalog plus a weighted fold (units × unit price). Snowflake drills the join-then-weigh pattern because average-selling-price questions are exactly how compute and storage economics get compared per unit.",
      slugs: ["combine-two-tables", "average-selling-price", "product-sales-analysis-i", "scd2-build"],
    },
    {
      name: "Concentration and skew",
      why: "63.5% of the base sits with accounts over 3,000 — skew is the business model, and screens make you compute it: top accounts, their share of the whole, the count behind the share. The denominator is the entire test; a concentration ratio over the wrong base is a number that flatters nobody honestly.",
      slugs: ["top-earners", "customer-placing-the-largest-number-of-orders", "percentage-of-users-attended-a-contest", "portfolio-concentration-hhi", "usage-tier-percentiles"],
    },
    {
      name: "Spikes against the baseline",
      why: "Capacity reviews ask: which months out-burned the platform average, which accounts exceeded their own baseline. Both are subquery shapes — a scalar bar in HAVING, a per-group bar in a correlated test — and Snowflake probes what each returns when the inner query comes back empty.",
      slugs: ["orders-with-maximum-quantity-above-average", "find-expensive-cities", "second-highest-salary", "find-bursty-behavior", "amount-anomaly-zscore"],
    },
    {
      name: "Period-over-period walks",
      why: "Burn trends are LAG walks: each month beside its predecessor, delta attached — the −1,326.87 slide into 2024-11 is the kind of move a capacity planner pages on. The tagged mrr-waterfall problem is the same grammar at revenue grain, and the self-join twin is where candidates fan out.",
      slugs: ["growth-accounting", "mrr-waterfall", "consecutive-numbers", "plan-migration-paths"],
    },
    {
      name: "Net revenue retention",
      why: "The registry-tagged NRR problem is Snowflake's north-star grammar: cohort last year's accounts, weigh this year's spend against it, and read expansion versus contraction from the ratio. On a consumption book NRR is literally the burn walk across a cohort boundary — the fold decides the story.",
      slugs: ["net-revenue-retention", "cohort-repeat-revenue", "repeat-purchase-rate", "vintage-default-curves"],
    },
    {
      name: "Idle-capacity anti-joins",
      why: "Provisioned-but-unburned resources are the waste read: services with no consumption, accounts with no billing activity. The honest anti-join discipline matters here — on this db every account has periods and every service family has lines, so a naive dead-capacity anti-join returns empty, and knowing that zero is a real answer is the maturity screens test.",
      slugs: ["sellers-with-no-sales", "find-churn-risk-customers", "dormant-reactivation", "prepayment-detection", "ar-aging-schedule"],
    },
    {
      name: "Stacks and one-pass censuses",
      why: "Finance wants the burn stack: per-family rows PLUS the TOTAL row, one query, summing back to the calendar. UNION ALL with a literal label is the idiom, and the reconciliation identity — family rows must sum to the total — is the audit that makes the stack trustworthy rather than decorative.",
      slugs: ["count-salary-categories", "active-businesses", "number-of-rich-customers", "credit-utilization-bands", "spend-histogram", "trial-balance-check"],
    },
    {
      name: "Late data and restatements",
      why: "The registry-tagged late-arriving-restatement problem is Snowflake's reliability grammar: a watermark per feed, late rows that force a republished period, and the discipline to restate instead of append. The kit's topics close here because a consumption business that can't restate honestly is billing on fiction.",
      slugs: ["late-arriving-restatement", "keep-latest-dedupe", "point-in-time-asof", "snapshot-delta-detect"],
    },
  ],

  theory: [
    {
      id: "snow-t1",
      q: "The burn stack must show per-family rows plus a TOTAL row that finance reconciles to the calendar. Sketch the query and explain why UNION ALL, not UNION.",
      a: "Two branches: the per-family fold — join consumption lines to the service catalog, GROUP BY family, sum credits and spend — and a second branch over the same lines with no GROUP BY, labeled with a 'TOTAL' literal, stacked underneath by UNION ALL. UNION would run a DISTINCT across the combined set: any family row that coincidentally matched the total's values (or another family's) would silently vanish, and a stack that loses a row is worse than no stack. The audit is the point: the family rows must sum to the TOTAL row, and the TOTAL must equal the calendar's 34,833.28 — that identity is what finance actually checks.",
      tag: "aggregation",
    },
    {
      id: "snow-t2",
      q: "Capacity wants the months whose burn cleared the platform baseline. Where does the average live in the query, and what does your version do if the baseline period is empty?",
      a: "The baseline is a scalar subquery — SELECT AVG(total) FROM billing_periods — sitting in HAVING, comparing each month's folded burn against the platform-wide bar. The empty-period case is the interview's real question: an aggregate scalar always returns one row, so an empty table yields NULL, and burn > NULL is UNKNOWN for every month — the report returns nothing, silently. Snowflake's rule is to decide the empty case before shipping: either guard the bar (COALESCE with a stated default) or let the empty report be loud. What's never acceptable is an AVG computed over the already-filtered months — the baseline must be computed on the full population or the spike screen defines itself.",
      tag: "subqueries",
    },
    {
      id: "snow-t3",
      q: "Storage spend and compute spend live in the same usage table with different family codes. How do you build the mix read so both sides fold the same rows?",
      a: "Join usage lines to the service catalog once, then classify in one pass — CASE WHEN family IN (compute codes) THEN 'compute' ELSE 'storage' END as the GROUP BY key, with SUM over the weighted amount as the measure. Both sides of the mix fold from the same population by construction, which is the property that makes the mix honest; the failure shape is two separate queries with two slightly different date filters, reporting a 'mix' that doesn't sum to any real total. The Snowflake-flavored close: the mix is a ratio of two folds over one population, so state the population once and let the CASE do the dividing.",
      tag: "joins",
    },
    {
      id: "snow-t4",
      q: "63.5% of lifetime spend sits with accounts above 3,000. Walk me through computing that share, and name the two ways candidates get it wrong.",
      a: "Fold lifetime spend per account, classify with the 3,000 threshold, then the share is SUM(spend of qualifying accounts) over SUM(spend of ALL accounts) — 22,121.70 over 34,833.28. Wrong way one: the denominator shrinks to the qualifying accounts, and the share reads 100% — a tautology, not a concentration metric. Wrong way two: the share is computed over account COUNTS (4 of 16 = 25%) when the business metric is spend share — a different number that answers a different question. The strong answer states both populations out loud, computes the numerator and denominator from the same fold, and reconciles: the non-qualifying 12 accounts must carry the remaining 36.5%.",
      tag: "ratios",
    },
    {
      id: "snow-t5",
      q: "The monthly burn trend needs a delta column. Why is LAG the right window, and what does the first month's row look like?",
      a: "Stage a derived table folding billing periods onto the '%Y-%m' spine, then LAG(burn) OVER (ORDER BY month) sets the previous month beside each row and the delta is one subtraction: November's 1,648.80 against October's 2,975.67 prints as −1,326.87, the largest move in this calendar. LAG keeps every row — a self-join needs an anti-condition for the first period and fans out on any duplicate bucket. The first month's delta is NULL because no predecessor exists, and that NULL should ship as NULL: a coalesced 0 is a fabricated baseline that some downstream tool will happily sum into a 'total movement' that means nothing.",
      tag: "windows",
    },
    {
      id: "snow-t6",
      q: "A late-arriving usage file re-reports last month's burn 8% higher. What has to happen in the reporting layer, and what does 'append-only discipline' get wrong here?",
      a: "The period is restated, not appended: the watermark for that feed moves, the affected bucket is recomputed from all rows up to the new watermark, and the republished calendar carries a restatement marker so downstream consumers know October's 2,975.67 changed after the fact. Append-only discipline would add a second October — the calendar would show two buckets for one month, or the dedupe would arbitrarily keep the first and silently under-report the 8%. Snowflake's rule: billing feeds get a watermark and a restate path, because your customers reconcile against the same numbers your dashboards publish — a silent stale number is an invoice dispute with extra steps.",
      tag: "data-quality",
    },
    {
      id: "snow-t7",
      q: "An account's burn shows as 0 for a month. Before you page anyone, what are the three explanations you check — in order?",
      a: "One: the account genuinely didn't consume — plausible in a consumption business, and the check is whether OTHER accounts show a normal distribution that month (a calendar-wide zero is a pipeline problem, a single zero is a usage fact). Two: the join dropped the month — a INNER join between periods and usage where one side is missing turns 'no rows' into 'no row', and the fix is a LEFT JOIN with an explicit zero-or-NULL policy. Three: the month was restated and you're reading a stale snapshot. The order matters because each explanation implies a different owner: capacity, query correctness, or pipeline freshness — and Snowflake interviews probe exactly this triage instinct.",
      tag: "nulls",
    },
    {
      id: "snow-t8",
      q: "The calendar's monthly buckets don't sum to the invoice total — off by exactly one month's burn. What query do you write first?",
      a: "A boundary audit: bucket by STRFTIME('%Y-%m') on both sides of the comparison and diff per bucket — month by month, count and sum, ordered by absolute difference. An off-by-exactly-one-month gap is almost never rounding; it's an interval edge, usually a BETWEEN whose upper bound is a midnight timestamp that excludes the last day's rows, or a filter computed before a late restatement landed. The diff query's job is to show WHICH bucket carries the whole gap, because a named bucket turns a reconciliation argument into a one-line fix — and on a billing feed, that one-line fix is the difference between a close that ships and a close that pages.",
      tag: "dates",
    },
    {
      id: "snow-t9",
      q: "EXCEPT and INTERSECT — which consumption questions do they answer more honestly than a join?",
      a: "Diff and overlap questions. 'Which accounts billed in January 2024 but NOT in January 2025?' is SELECT DISTINCT customer_id FROM (jan-2024 fold) EXCEPT SELECT … FROM (jan-2025 fold) — no join gymnastics, no fan-out, and the intent reads straight off the page: three accounts lapsed, and the churn watch is named. INTERSECT answers the mirror — accounts retained across both Januarys. Two discipline points: set operations deduplicate both inputs first, so EXCEPT silently collapses an internally duplicated feed — if duplicates are the anomaly, the LEFT JOIN … IS NULL anti-join over the full multiset is the honest tool; and both sides must share column count and types, bound by position. Set-level diffs across snapshots, anti-joins for row-level forensics — knowing which question you are answering is the skill.",
      tag: "set-ops",
    },
    {
      id: "snow-t10",
      q: "Finance asks for days-sales-outstanding. How do you compute it, and what makes the answer defensible?",
      a: "JULIANDAY arithmetic at the invoice-payment grain: julianday(p.paid_on) − julianday(i.issued_on) is the float for one payment — INV-2024-001 issued 2024-02-05, first paid 2024-02-20, a 15-day float — and AVG over the joined pairs is the portfolio's average DSO, about 29 days on this ledger. The defensibility is in the population: split-payment invoices contribute multiple floats (their second payment lands 29 days out), void invoices contribute none, and the six never-collected runs contribute NOTHING — which means a naive AVG measures only the money that came back. The senior move is pairing the average with its coverage denominator: 22 of 28 runs collected at 29 days average, 6 collected never. A DSO without its denominator is a compliment, not a metric.",
      tag: "dates",
    },
    {
      id: "snow-t11",
      q: "When do you stage a WITH (CTE) on a consumption query, and what does the staging buy that nesting doesn't?",
      a: "Three buys. Staging: the burn calendar needs two layers — the '%Y-%m' fold computes monthly burn, and the LAG walk plus its FILTER live outside it, because window output isn't visible to WHERE in the same SELECT; a CTE named monthly is the stage. Reuse: one account-grain fold feeds the concentration ratio, the renewal-risk rank and the burn walk in the same statement — write the fold once, not three times. Auditability: naming a CTE monthly or anchor_accounts forces the definition (which accounts, which filter) to sit where the controller reads it, and Snowflake's reconciliation culture is exactly that: a stack that can't be walked fold by fold doesn't ship. Filter early inside each CTE — staging is logical, not free.",
      tag: "ctes",
    },
    {
      id: "snow-t12",
      q: "Define net revenue retention for a consumption business — and say why the cohort boundary decides the answer.",
      a: "NRR is this year's spend from LAST year's cohort, divided by last year's spend from that same cohort. On a consumption book the definition is literal: cohort the accounts that billed in the trailing twelve months, weigh their burn this period against their burn then, and read the ratio — above 100% is expansion (accounts burning more), below is contraction or churn. The boundary is the whole test: cohort by the account set at period START, and new accounts that signed mid-period stay OUT of both numerator and denominator, or the ratio flatters itself with logos that never churned because they never existed. The fold decides the story — SUM over the cohorted ids, joined to both periods' burns, is one query; getting the boundary wrong is a different company.",
      tag: "metrics",
    },
    {
      id: "snow-t13",
      q: "Walk me through the logical evaluation order of a SELECT — and name the bug each stage explains on a burn query.",
      a: "FROM and JOIN assemble rows; WHERE filters them; GROUP BY folds them; HAVING filters the groups; SELECT computes output expressions including windows; ORDER BY sorts; LIMIT cuts. The burn-query bugs map one to one: a baseline average in WHERE (aggregates don't exist at row-filter time — it errors), the spike screen's month fold judged in WHERE instead of HAVING (same error, different clause), a filter on LAG() delta output in WHERE (windows run in SELECT — stage the walk in a CTE and filter outside), and the flip side that ORDER BY can use SELECT aliases because it runs after them. Half of all 'the baseline is wrong' incidents are correct pipeline order meeting a baseline computed on the wrong population — the order tells you WHERE a filter CAN live, and the population question tells you where it SHOULD.",
      tag: "pipeline",
    },
    {
      id: "snow-t14",
      q: "Billing lives in integer cents. Where do numeric bugs bite, and what does the reconciliation identity prove?",
      a: "Three bite points. Scale: amount_cents = 614800 is $6,148.00, and cents / 100 is integer division — 6148 flat; divide by 100.0 once at the presentation edge. Mid-pipeline rounding: ROUND inside the fold discards precision a later SUM still needed — this ledger's trial balance closes at 181,080 debits against 181,080 credits, delta zero, which is only checkable because nothing was rounded away en route. Float drift: SQLite REALs are IEEE doubles, so compare money with a tolerance or keep it in integer cents until the last step. The policy: aggregate in cents, convert once, round at the edge — and let the identity prove it. A burn stack whose family rows sum to the TOTAL to the penny is a stack the controller signs; one that's off by a rounded cent is a stack nobody trusts with an invoice.",
      tag: "numbers",
    },
    {
      id: "snow-t15",
      q: "What makes a predicate sargable, and which habits keep a warehouse-scale fold cheap?",
      a: "Sargable means the predicate compares the bare column to a value so an index can serve it. Wrapping the column — SUBSTR(created_at, 1, 7) = '2024-12' — forces a scan of every billing period; the sargable twin is the half-open range created_at >= '2024-12-01' AND created_at < '2025-01-01', same rows, index-usable. The habits that compound at consumption scale: filter early inside each CTE so later folds carry fewer rows; name columns instead of SELECT * so 251-line payloads you never read stop crossing the wire; probe with LIMIT before committing to the full census; and aggregate at the smallest table that answers the question rather than joining first and filtering after. These are not micro-optimizations — they are the difference between a capacity review that renders and one that times out while the room watches.",
      tag: "performance",
    },
    {
      id: "snow-t16",
      q: "How do LAG and LEAD power the burn walk — and where do candidates usually stumble?",
      a: "LAG(burn) OVER (ORDER BY month) puts the previous bucket beside the current one — November's delta is 1,648.80 minus October's 2,975.67, the −1,326.87 slide capacity pages on; LEAD reads forward. Both leave the boundary row NULL, and that NULL is honest: the first month has no baseline, so its delta is 'unknown', not zero. The stumbles: filtering the window output in WHERE (illegal — windows run in SELECT; stage a CTE), and forgetting PARTITION BY on a per-account walk, where one global window smears account A's January into account B's February — the per-account walk needs LAG(burn) OVER (PARTITION BY account ORDER BY month). The direction trap belongs here too: with ORDER BY month DESC, LAG returns the NEXT month chronologically — the walk silently reads the future.",
      tag: "windows",
    },
    {
      id: "snow-t17",
      q: "Why is spend SUM(quantity × unit_price) and not SUM(quantity) × SUM(unit_price) — and where does AVG(unit_price) mislead?",
      a: "Because spend is a weighted fold: each line's credits multiply its unit price per row, and SUM adds the products — 243 compute credits at mixed prices fold to 21,761.03. Aggregating first and multiplying after cross-multiplies two unrelated totals: SUM(quantity) × SUM(unit_price) scales with line count and means nothing. AVG(unit_price) misleads in the mirror direction: it averages price tags as if each line were equally important, so a family with one expensive line and a family with a thousand cheap ones look identical — per-credit economics is volume-weighted or it is fiction. The Snowflake-shaped statement: the join attaches the family key, the multiplication prices the burn, the fold aggregates — and the mix ratio is only honest because both sides fold the same 251 lines.",
      tag: "joins",
    },
    {
      id: "snow-t18",
      q: "The AR display must print 0 for never-collected runs while the analysis still counts them. How do you split display from analysis?",
      a: "COALESCE at the presentation edge, IS NULL in the analysis layer — never one doing the other's job. The LEFT JOIN hands the six never-collected runs a NULL payload; COALESCE(SUM(p.amount_cents), 0) prints 0.0 for the display so the dunning letter reads a number, not a blank. But the analysis flag — WHERE p.id IS NULL, or COUNT(p.id) = 0 — must read the raw NULL, because 'coalesced to zero' and 'never collected' are different facts: a run that genuinely paid zero after two attempts is not the same population as one with no payment rows. The failure shape is COALESCE leaking into the analytic layer: once NULLs become 0s, IS NULL finds nothing, the never-collected census silently empties, and the dunning cycle skips the six runs it exists to chase.",
      tag: "nulls",
    },
    {
      id: "snow-t19",
      q: "COUNT(*), COUNT(column), COUNT(DISTINCT column) — when does each give a different answer on the billing ledger?",
      a: "COUNT(*) counts rows, including every NULL — 28 billing runs, 103 periods, 251 consumption lines depending on the fold. COUNT(column) counts non-NULLs — it shrinks on sparse columns, and it does not count flags: COUNT(status = 'paid') counts the 1/0 comparison result, which is never NULL, so it returns every row. COUNT(DISTINCT column) folds repeats — COUNT(DISTINCT customer_id) turns 103 billing periods into 16 accounts, the census grain. The Snowflake-flavored trap is the coverage census: LEFT JOIN payments to invoices and COUNT(*) counts invoice-payment PAIRS (35 rows for 22 matched runs), while COUNT(DISTINCT i.id) stays at 28 — the two-grain discipline that keeps the coverage denominator honest. Saying which grain each form counts is the whole answer.",
      tag: "aggregation",
    },
    {
      id: "snow-t20",
      q: "Storage-versus-compute in one pass — how does the CASE classification keep the mix honest?",
      a: "Classify and fold in the same scan: CASE WHEN category IN ('Electronics','Audio','Video') THEN 'compute' ELSE 'storage' END as the GROUP BY key, SUM(quantity) and the weighted spend as the measures. Both sides of the mix fold from the same 251 consumption lines by construction — compute 243 credits / 21,761.03, storage 255 / 13,072.25 — so the two rows reconcile to the calendar's 34,833.28 and the 62.5% mix is a ratio of sibling folds, not two queries with drifting date filters. The traps live at the edges: a NULL category fails the IN test and falls into storage silently — an explicit 'unclassified' arm or an upstream data-quality flag is the deliberate move; and the ELSE arm is a definition, not a default — every line the WHEN misses lands somewhere, so decide where.",
      tag: "case-when",
    },
    {
      id: "snow-t21",
      q: "Accounts whose January burn beat their OWN trailing average — scalar subquery, correlated subquery, or window? Compare the three.",
      a: "Window: stage the account-month fold in a CTE, then AVG(burn) OVER (PARTITION BY account ORDER BY month) pins each account's own baseline beside every month of theirs — one pass, per-account bar, and the outer query compares against it. Correlated subquery: correct, re-evaluates the per-account average once per row — fine at 16 accounts, painful at 16,000. Scalar subquery: wrong population — (SELECT AVG(burn) FROM monthly) is ONE platform-wide number (~2,488 monthly), which flags every small account's peak and misses every anchor account's slide; 'beat the platform' and 'beat their own history' are different questions and only one of them is the capacity read. The Snowflake answer names the trade: window for one-pass per-group bars, correlated for clarity at small scale, scalar only when the platform bar IS the question.",
      tag: "subqueries",
    },
    {
      id: "snow-t22",
      q: "A feed retry double-loads consumption lines. What is the detection query, and what does the keep-newest fix look like?",
      a: "Detection: GROUP BY the natural key — order_id plus product_id for a consumption line — HAVING COUNT(*) > 1; the duplicate-keys count is the incident's size, reported upstream with a key sample. Fix: the window dedupe keeps the freshest ingest — ROW_NUMBER() OVER (PARTITION BY order_id, product_id ORDER BY ingested_at DESC) = 1 — partitioned on the BUSINESS key, tiebroken on an ingest timestamp, never on rowid hope. The rank-function trap is the senior detail: RANK and DENSE_RANK stamp every tied-newest row 1, so a true duplicate survives the rn = 1 filter twice and the dedupe fails silently; ROW_NUMBER numbers duplicates distinctly, which is why it is the only dedupe rank. On a consumption book this is restatement hygiene — the same keep-latest discipline that decides whether October's burn is the first report or the corrected one.",
      tag: "data-quality",
    },
    {
      id: "snow-t23",
      q: "The capacity map folds warehouse codes per region into one cell. How does GROUP_CONCAT work, and where does it bite?",
      a: "GROUP_CONCAT(code) with GROUP BY region folds many rows into one comma-separated cell — EU prints 'M-BER,M-PRG,M-LIS' from its three warehouses. It is the string sibling of SUM: same fold grammar, same GROUP BY discipline. The bites: order inside the cell follows scan order unless you order it explicitly — a map that shuffles between runs looks haunted; SUM on text coerces every code to 0 and prints a confident zero — SQLite doesn't error, which is the problem; and folding the GROUP BY key itself (GROUP_CONCAT(region) after GROUP BY region) folds one value into one cell — legal, useless. The honest uses are rosters and inventories: warehouse codes, service families per account, the tenant list behind a concentration number — the 'who' that makes a fold auditable.",
      tag: "strings",
    },
    {
      id: "snow-t24",
      q: "The CFO asks whether 63.5% concentration is healthy. What do you compute before answering?",
      a: "More than one number. Top-decile share (the 63.5% from four of sixteen accounts) is the headline, but the follow-ups are the answer: the count behind the share (4 accounts — one departure moves the book by double digits), the tiered view beneath it (2,000-plus accounts carry 71.2%, so the concentration deepens below the headline), and a dispersion index like HHI — sum of squared shares — which distinguishes 'four equal anchors' from 'one account and three rounding errors'. Then the context question that makes it advisory: is the trend rising? Concentration that compounds is a risk register entry; concentration that is stable is the business model. The interview shape: a share is a claim, the count is its exposure, the index is its shape, and the trend is its verdict — four folds, one honest answer.",
      tag: "metrics",
    },
  ],

  mcqs: [
    {
      id: "snow-mcq-1",
      prompt: "The consumption base folds to 498 credits across 251 usage lines. Which expression returns 498?",
      choices: [
        "COUNT(*)",
        "COUNT(credits)",
        "SUM(oi.quantity)",
        "AVG(oi.quantity) * 2",
      ],
      answer: 2,
      why: "SUM(quantity) folds consumption units — 498 credits. COUNT(*) counts usage lines (251), a different grain entirely: lines are events, credits are volume. Every burn metric starts by getting this distinction right.",
      notes: [
        { choice: 0, why: "251 is the line count — reporting it as burn halves the platform's consumption and the capacity plan with it." },
        { choice: 3, why: "AVG × 2 is a numerology answer that coincidentally lands near SUM only when the line count is exactly 2× the average — meaningless in general." },
      ],
      difficulty: "easy",
    },
    {
      id: "snow-mcq-2",
      prompt: "Which fold builds the 14-month burn calendar (2024-01 … 2025-02) from billing periods?",
      choices: [
        "GROUP BY created_at",
        "GROUP BY STRFTIME('%Y-%m', created_at)",
        "GROUP BY STRFTIME('%m', created_at)",
        "GROUP BY CAST(created_at AS DATE)",
      ],
      answer: 1,
      why: "'%Y-%m' prints the month spine finance reconciles against — 14 buckets here. The raw timestamp gives ~400 buckets, '%m' alone merges January 2024 with January 2025, and the full date is a scatter, not a calendar.",
      notes: [
        { choice: 2, why: "Month without year folds two years into twelve buckets — the calendar's 3,731.97 January peak would absorb every other January and the trend dies." },
        { choice: 3, why: "Daily buckets give a line per day — the 'monthly burn' chart becomes noise, and every reconciliation against invoices breaks at the grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "snow-mcq-3",
      prompt: "Lifetime spend is 34,833.28; accounts above the 3,000 line carry 22,121.70 of it. Which expression computes the 63.5% concentration share?",
      choices: [
        "100 * 4 / 16",
        "100.0 * SUM(CASE WHEN spend >= 3000 THEN spend ELSE 0 END) / SUM(spend)",
        "100.0 * SUM(CASE WHEN spend >= 3000 THEN 1 ELSE 0 END) / COUNT(*)",
        "SUM(spend) / SUM(CASE WHEN spend >= 3000 THEN spend ELSE 0 END)",
      ],
      answer: 1,
      why: "Spend share needs spend in numerator AND denominator, over the same fold: 22,121.70 / 34,833.28 = 63.5%. The 100.0 keeps the division real; the CASE keeps the population whole so the denominator never shrinks.",
      notes: [
        { choice: 0, why: "That's the account-count share (25%) — a true number that answers a different question. Concentration metrics are spend-weighted, not logo-counted." },
        { choice: 2, why: "That's the count share again, dressed as a CASE — 4/16. The interview follow-up 'is that spend share or logo share?' separates the candidates." },
      ],
      difficulty: "medium",
    },
    {
      id: "snow-mcq-4",
      prompt: "Months whose burn clears the platform average: where does the average belong?",
      choices: [
        "WHERE burn > AVG(total) — row filter",
        "HAVING burn > (SELECT AVG(total) FROM orders) — group filter against a scalar",
        "ORDER BY AVG(total) — ranked comparison",
        "GROUP BY AVG(total) — fold by the baseline",
      ],
      answer: 1,
      why: "The bar is itself an aggregate over the whole population, so it lives in a scalar subquery; HAVING is the clause that judges folded groups. WHERE can't see aggregates at all, and GROUP BY/ORDER BY an aggregate is a category error.",
      notes: [
        { choice: 0, why: "WHERE runs before the fold — AVG(total) there is both a syntax error and conceptually 'the average of one row'." },
        { choice: 3, why: "GROUP BY takes columns/expressions per row, not aggregates-as-keys. This one errors loudly — the least dangerous way to be wrong." },
      ],
      difficulty: "medium",
    },
    {
      id: "snow-mcq-5",
      prompt: "In the spike screen, a teammate swaps the baseline to `(SELECT MAX(total) FROM orders)` (1,088.44). What does the screen return?",
      choices: [
        "The same months — nothing changes",
        "All 14 months — every monthly burn (min 1,193.86) clears a per-order max of 1,088.44",
        "An error — MAX cannot appear in a scalar subquery",
        "Only the peak month",
      ],
      answer: 1,
      why: "The bar collapses from ~2,488 (monthly average) to 1,088.44 (the largest single order), and every monthly burn — even the 1,193.86 trough — clears it. The spike screen stops screening: a baseline defined at the wrong grain admits the whole calendar.",
      notes: [
        { choice: 0, why: "Grain change, result change: the bar moved from monthly-average to single-order scale. Any 'same months' answer missed that the baseline is now 2.4× lower." },
        { choice: 2, why: "MAX in a scalar subquery is perfectly legal — that's exactly why this bug is silent. Loud errors get fixed; quiet bar-drift ships." },
      ],
      difficulty: "medium",
    },
    {
      id: "snow-mcq-6",
      prompt: "The burn stack's family rows and its TOTAL row are stacked with UNION ALL. A reviewer suggests plain UNION 'to be safe'. What actually changes?",
      choices: [
        "Nothing — UNION ALL and UNION return identical stacks here",
        "UNION deduplicates the combined set — any family row identical to another (or to TOTAL) would silently drop, breaking the reconciliation identity",
        "UNION sorts the stack by the first column, changing the audit order only",
        "UNION errors — the branches have different column counts",
      ],
      answer: 1,
      why: "UNION applies DISTINCT across the whole combined set. Today the rows happen to differ, but the guarantee is gone: a future family whose fold exactly equals another's would silently vanish, and the family-sum-equals-TOTAL identity would break without any error.",
      notes: [
        { choice: 0, why: "Identical output today is not the same contract. The stack's value is the invariant it preserves under data changes — UNION removes that invariant." },
        { choice: 2, why: "Some engines sort UNION output, but the dedupe is the semantic change that matters — and it can delete data, not just reorder it." },
      ],
      difficulty: "medium",
    },
    {
      id: "snow-mcq-7",
      prompt: "You need cumulative burn across the calendar: each month plus every month before it. Which window gives correct month boundaries?",
      choices: [
        "SUM(burn) OVER (ORDER BY month) — default frame from the start through the current month",
        "SUM(burn) OVER () — the whole calendar on every row",
        "SUM(burn) OVER (ORDER BY month ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) — forward-running total",
        "SUM(burn) OVER (PARTITION BY month ORDER BY month) — one partition per month",
      ],
      answer: 0,
      why: "With an ORDER BY, the default frame is RANGE UNBOUNDED PRECEDING → CURRENT ROW: a true running total. Each month carries its full history — the cumulative curve the capacity deck screenshots.",
      notes: [
        { choice: 1, why: "No ORDER BY means the default frame is the whole partition — every row gets the grand total 34,833.28. A flat line, not a curve." },
        { choice: 2, why: "That frame runs BACKWARD from the end — every row shows the remaining burn after it. Interesting for 'runway left', wrong for 'burn to date'." },
      ],
      difficulty: "hard",
    },
    {
      id: "snow-mcq-8",
      prompt: "The dead-capacity anti-join (service families with no consumption lines) returns 0 rows on this db. What is the correct read?",
      choices: [
        "The query must be wrong — every catalog has idle services",
        "Zero is a real finding: every one of the 7 service families has consumption lines, so the anti-join is honestly empty — the waste analysis moves to a dimension where gaps can exist (billing periods without payments)",
        "It means all services are over-provisioned",
        "Anti-joins return 0 whenever both tables have equal row counts",
      ],
      answer: 1,
      why: "An empty anti-join is a coverage statement, not a bug: all 7 families have lines, so no family is fully idle. The maturity the screen tests is trusting a verified zero and relocating the waste question to a grain where unmatched rows exist — like the 6 billing periods with no payment.",
      notes: [
        { choice: 0, why: "Assuming every anti-join must find something is how false positives get manufactured. Verify the grain, then accept the zero." },
        { choice: 3, why: "Anti-join emptiness has nothing to do with row-count equality — it's about key coverage. 16 accounts and 103 periods also 'differ in count', and no account is idle." },
      ],
      difficulty: "hard",
    },
    {
      id: "snow-mcq-9",
      prompt: "Unit price lives on the consumption line, service family on the catalog. Which query correctly computes per-family spend?",
      choices: [
        "SELECT p.category, SUM(oi.unit_price) FROM usage oi GROUP BY p.category — family is 'obviously' carried along",
        "SELECT p.category, SUM(oi.quantity * oi.unit_price) FROM usage oi JOIN catalog p ON p.id = oi.service_id GROUP BY p.category",
        "SELECT category, AVG(unit_price) FROM usage GROUP BY category — averages are safer",
        "SELECT p.category, COUNT(oi.unit_price) FROM usage oi JOIN catalog p ON p.id = oi.service_id GROUP BY p.category",
      ],
      answer: 1,
      why: "Spend is volume × price folded per family — the join attaches the family key, the weighted SUM prices the burn. Choice 0 references a column that isn't in its FROM at all; choice 2 averages prices across volumes of different sizes; choice 3 counts lines, not dollars.",
      notes: [
        { choice: 0, why: "Beyond the missing join, SUM(unit_price) adds price tags across lines — 251 prices, not 251 lines' worth of spend. The number looks like money and isn't." },
        { choice: 2, why: "AVG erases volume: a family with one expensive line and a family with a thousand cheap ones would look identical. Burn economics is volume-weighted or it's fiction." },
      ],
      difficulty: "easy",
    },
    {
      id: "snow-mcq-10",
      prompt: "A late usage file adds rows for a closed month, raising its burn 8%. The reporting layer keeps the original number. Which failure mode is this?",
      choices: [
        "Integer division truncation",
        "Append-only ingestion without a restatement path — the watermark never moved, so the closed month was never recomputed",
        "A LEFT JOIN that should have been INNER",
        "UNION dedupe collapsing the late rows",
      ],
      answer: 1,
      why: "The tagged late-arriving-restatement problem is exactly this: a feed watermark that doesn't advance means late rows land in storage but the period fold never reruns — the published burn stays stale while the invoice base moves. The fix is a watermark + recompute path, not a bigger WHERE.",
      notes: [
        { choice: 0, why: "Truncation skews by fractions of a cent per row; an 8% gap is a missing recompute, not a rounding artifact." },
        { choice: 3, why: "UNION dedupe REMOVES duplicate rows — it can't cause a stale total; it can only shrink one. The stale-total signature points at the pipeline, not the stack." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-snow-1",
      tier: "hard",
      topic: "x3",
      universe: "month-close",
      title: "The credit-burn stack with the TOTAL row",
      brief:
        "Snowflake-flavored brief on the storefront db: the month-close deck ships the burn stack — every service family's credits and spend, one row each, with a TOTAL row underneath that finance reconciles against the calendar by hand. The controller's memo is explicit: 'if the family rows don't sum to TOTAL, the deck doesn't ship; and I want the stack in one query — two dashboards pasted together is how the identity got lost last quarter.' Probed facts: 251 consumption lines fold to 7 families — Accessories 121 credits / 3,294.29, Audio 97 / 11,744.01, Wearables 53 / 6,929.12, down to Fitness 27 / 863.91 — and the TOTAL must read 498 credits / 34,833.28, the calendar's whole base. The stack is ordered families-then-TOTAL, exactly as finance reads it.",
      ask: "Return each service family with credits and spend (2 decimals), then a labelled TOTAL row with the same columns underneath.",
      template:
        "SELECT p.category AS service_family,\n       {1}(oi.quantity) AS credits,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS spend\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.category\nUNION ALL\nSELECT {2} AS service_family,\n       SUM(oi.quantity) AS credits,\n       ROUND(SUM(oi.quantity * oi.unit_price), {3}) AS spend\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id;",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the credits fold",
          why: "SUM(quantity) folds consumption units per family — 121 for Accessories, 97 for Audio. COUNT would report line counts (events, not volume) and the stack would total 251 'credits' — a number that looks plausible and halves the platform.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-row label",
          why: "The literal 'TOTAL' is the reconciliation anchor finance scans for — and a plain-UNION rewrite would dedupe the stack, able to silently swallow a family row that ever matched another. The label also makes the last row un-sortable by accident into the family list.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the cent-precision cut",
          noVerify: true,
          why: "The TOTAL's spend prints to cents — 34,833.28 — because finance reconciles it against the calendar to the penny. Rounding the anchor to 1 decimal is how a stack that 'almost' sums stops being audited at all.",
        },
      ],
      distractors: ["COUNT", "AVG", "'GRAND'", "1"],
      walkthrough:
        "One fold, twice — that's the stack. The first branch joins 251 consumption lines to the catalog and folds per family: credits via SUM(quantity), spend via the weighted SUM(quantity × unit_price) to cents — Accessories 121/3,294.29, Audio 97/11,744.01, Fitness 27/863.91 at the bottom. The second branch folds the SAME lines with no GROUP BY — one row, 498 credits, 34,833.28 — labelled 'TOTAL', and UNION ALL stacks it underneath without deduping, which is the whole contract: the invariant that family rows sum to the total survives any future data. And it does sum: 3,294.29 + 1,984.93 + 11,744.01 + 4,818.61 + 863.91 + 5,198.41 + 6,929.12 = 34,833.28, the calendar's base to the penny. COUNT in the credits slot is the classic grain error — 251 lines masquerading as 498 credits is exactly the fold that makes a capacity plan look half-utilized. And note what the label buys: finance scans for 'TOTAL', not for the biggest number — a stack whose grand row reads 'GRAND' or nothing ships with an audit that starts with a question.",
    },
    {
      id: "cs-snow-2",
      tier: "medium",
      topic: "q2",
      universe: "growth",
      title: "Months that out-burned the baseline",
      brief:
        "Snowflake-flavored brief on the storefront db: the capacity review wants the spike screen — which months' consumption cleared the platform-wide baseline, ranked by burn. The planner's memo: 'the baseline is the average monthly burn across the WHOLE calendar — computed once, in the query, not eyeballed off a chart; and don't filter the population before computing it, or the screen defines itself.' Probed facts: the 14-month calendar runs from 2024-01's 3,731.97 peak through the 1,193.86 floor at 2024-07; six of the fourteen months clear the bar — 3,731.97, 3,609.64, 3,116.04, 2,975.67, 2,910.31 and 2,617.08 — and the screen must name all six, best first, without a hand-typed threshold that drifts when the calendar restates.",
      ask: "Return every month whose billed usage beats the platform-wide monthly average: month and burn (2 decimals), biggest burn first.",
      template:
        "SELECT STRFTIME('%Y-%m', o.created_at) AS month,\n       ROUND({1}(o.total), 2) AS burn\nFROM orders o\nGROUP BY month\nHAVING burn > (SELECT {2}(burn)\n               FROM (SELECT SUM(total) AS burn\n                     FROM orders\n                     GROUP BY STRFTIME('%Y-%m', created_at)))\nORDER BY burn {3};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the monthly burn fold",
          why: "SUM(o.total) prices each month's consumption — 3,731.97 for January. MAX would report the biggest single order inside the month (a different grain) and the screen would compare order-sized numbers against a monthly bar.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the platform baseline",
          why: "AVG(burn) over the monthly folds computes the bar from the whole calendar — no filter first, no self-definition. MAX would set the bar at the biggest monthly burn (3,731.97) and NOTHING would clear it: a spike screen that ships empty.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The capacity review reads spikes best-first: 3,731.97 on top, 2,617.08 at the bottom of the qualifying six. ASC would lead with the mildest over-burn month — a correct query that opens the meeting with the weakest finding.",
        },
      ],
      distractors: ["MAX", "COUNT", "MIN", "ASC"],
      walkthrough:
        "One bar, computed in the query, from the whole calendar. The inner fold buckets 103 billing periods onto the '%Y-%m' spine and prices each with SUM — 14 monthly burns — and the scalar subquery averages THOSE folds: the baseline is a monthly burn, not an order value, which is the grain distinction the whole screen hangs on. HAVING keeps the months that clear it: 2024-01 (3,731.97), 2024-02 (3,609.64), 2024-09 (3,116.04), 2024-10 (2,975.67), 2024-05 (2,910.31) and 2024-03 (2,617.08) — six of fourteen, best first after the DESC. The bar's aggregate is the interview's real test: MAX(burn) sets it at the calendar's peak and the screen ships EMPTY — the peak can never beat itself; COUNT(burn) sets it at 14 and all fourteen months clear it — the screen stops screening; MIN(burn) sets it at the 1,193.86 trough and lets thirteen months through. The honest bar sits in the middle, computed from the same fold it judges. And the definition note the planner cares about: the baseline is computed on placed consumption, cancelled months included, because a spike screen that filters its own population first always finds spikes.",
    },
  ],

  problems: [
    { slug: "net-revenue-retention", why: "One of Snowflake's two registry-tagged problems: cohort revenue this period over last, per account cohort — the NRR grammar this consumption business reports instead of seat counts." },
    { slug: "late-arriving-restatement", why: "The other tagged problem: watermark discipline and period restatement — how a closed month's burn legitimately changes when late usage lands." },
    { slug: "growth-accounting", why: "New / retained / churned classification via LAG — the account-movement walk underneath Snowflake's net revenue retention read." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Rows whose measure beats the global average — the spike-screen shape the kit's second case study rebuilds at month grain." },
    { slug: "count-salary-categories", why: "Classified buckets stacked with UNION ALL — the burn-stack grammar: family rows plus a labelled TOTAL that must reconcile." },
    { slug: "top-earners", why: "Top accounts by earned amount — the concentration leaderboard: 63.5% of this base sits with just four accounts." },
    { slug: "average-selling-price", why: "Volume-weighted price per unit over a join — the per-credit economics read that separates compute families from storage families." },
    { slug: "mrr-waterfall", why: "LAG-based movement classification — the burn-waterfall shape: which accounts added, shed or held consumption period over period." },
    { slug: "cohort-repeat-revenue", why: "Revenue by cohort with repeat behavior — the consumption-retention fold: do accounts that burn big in month one keep burning?" },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER dedupe keeping the freshest row — the ingestion-hygiene pattern behind restatement correctness." },
    { slug: "point-in-time-asof", why: "As-of joins against slowly changing dimensions — reading burn at the plan price that was true when the usage happened." },
    { slug: "sellers-with-no-sales", why: "Anti-join for inactive providers — the idle-capacity read, and the discipline of trusting a verified zero." },
    { slug: "unique-orders-and-customers-per-month", why: "Two-grain monthly census — periods AND accounts per month, the opening fold of every consumption review." },
    { slug: "dormant-reactivation", why: "NOT EXISTS for accounts gone quiet — the reactivation screen for accounts whose burn stopped." },
    { slug: "friday-purchase-iii", why: "Month-bucketed conditional aggregation — the burn calendar's first fold, on the '%Y-%m' spine." },
    { slug: "active-businesses", why: "One-pass conditional counting across multiple event types — the platform-activity census in a single scan, stack-ready." },
  ],
};
