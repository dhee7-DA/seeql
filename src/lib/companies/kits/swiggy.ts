// Swiggy — kit 2 of the Food & Quick-commerce domain (Batch F).
// India's food-delivery giant plus Instamart quick-commerce: metro demand
// curves with real seasonality, rider-supply balancing through monsoon
// bursts, dark-store stock reads, and merchant settlement cycles on
// integer-cent money.
// Pool provenance: Swiggy carries 0 tagged rows in company-pools.md — the
// pool is FULLY theme-curated from the SQL band (16 problems, 30 topic
// slugs), every one mirroring a workflow Swiggy screens are known to probe
// (kept-demand ratios, month buckets, capacity running sums, settlement
// folds). Say it with us: curated, not tagged.
// Cases run on the storefront db (scripts/company-facts.md, probed 2026-10-12):
// orders = deliveries, shipped_at = delivery timestamp, region = delivery
// zone (mumbai/seoul/berlin stand-ins for metro grids), invoices/payments =
// merchant settlements in integer cents.

import type { CompanyKit } from "../types";

export const swiggyKit: CompanyKit = {
  id: "swiggy",
  domainId: "food",
  name: "Swiggy",
  tagline: "Food delivery and Instamart quick-commerce",
  accent: "text-orange-500",

  brief: [
    "Swiggy is India's food-delivery incumbent and, through **Instamart**, one of the country's two quick-commerce heavyweights: restaurant meals in metro grids on one side, **10-minute grocery from dark stores** on the other. The operating texture is hyperlocal and monsoon-shaped — demand arrives in bursts that rain and cricket schedules amplify, rider supply is managed zone by zone, and the Instamart promise is measured in minutes against dark-store pick times. Every analyst here learns the same first lesson twice, once per business: *'orders placed' and 'orders delivered' are different populations*, and 'orders delivered in 10 minutes' is a third one still.",
    "The data org runs on city and zone grids. Growth teams read the **monthly demand curve** — where the trough sits, which months carry the cancellations; supply teams balance rider hours against order minutes per zone through the {orange:dinner Rush}; Instamart teams own dark-store fill rates and stock-versus-sold freshness; finance reconciles merchant settlements in **integer cents** on 30-day terms. The culture is SQL-first: a city review opens with a query, the monthly business review ships every headline with its SQL attached, and a mis-defined denominator is treated as an incident.",
    "Interviews screen for the **two-grain census** (deliveries AND diners per zone), month-bucket seasonality with honest aggregates, conditional counting for **kept demand**, and the settlement-side money math: invoices held in cents, partial payments detected with LEFT JOINs, split settlements folded only after coverage is classified. Expect the rank trio with tie rules for city and SKU leaderboards, and expect to say which population every filter leaves — *in-flight orders have no delivery timestamp yet*, and the interviewer wants that sentence unprompted.",
    "To prep: drill `STRFTIME` month buckets until '%Y-%m' versus '%m' is a reflex, `julianday` diffs between order and delivery timestamps, running sums for capacity, and one-pass FILTER censuses under a query budget. Practice narrating **grain, filter, denominator, sort** before writing — and rehearse the reconciliation habit: branch totals must add back to the placed whole, because *a census that doesn't reconcile is a rumor with columns*.",
  ],

  dayInLife: [
    "**08:15 —** The day opens on the demand curve, not the order count. The analyst's first query buckets the last 14 days by month and zone: are we holding the trend line, did the weekend surge clear the rider plan, which zones show {amber:pending} orders piling up — those are the zones where rider supply thinned and the promise is at risk. The reconciliation comes first: **placed must equal delivered plus shipped plus pending plus cancelled**, and a zone whose branches don't add up is the day's first fire — usually a double-loaded event or a filter that drifted.",
    "**12:40 —** The lunch peak fires: the morning's worst zone is stacking orders faster than riders can hold, and the zone lead wants a split, not a hunch. The analyst splits the zone by status in one pass — {emerald:completed}, {amber:awaiting}, {rose:lost} — then joins to the merchant grid to see whether the bottleneck is kitchen-side or rider-side. The reconciliation identity stays open in a second window the whole time, because *branch totals must add back to the placed whole*. Mitigation ships before the crest; the RCA lands in the writeup.",
    "**14:50 —** Deep work: the dinner Rush missed plan, and the ask is weather or trend. The analyst diffs month over month with `LAG` to separate a rain burst from a demand shift, and Instamart asks the twin question per dark store — fill rate and stock-versus-sold on the SKUs that moved, with the never-moved tail named as hygiene. Each query gets written twice — *once to answer, once with the denominator printed in the metric name*.",
    "**17:15 —** Stakeholder cycles. The monthly business review prep is a definition audit: the demand curve's month bucket stated ('%Y-%m', not '%m' — merged years are fiction), the cancellation share's placed-denominator linked, the settlement reconciliation's coverage classes spelled out — **exact, partial, none** — with the void-but-paid row flagged for finance. City GMs get their zone packs, rider-ops gets the capacity running sums, and the last hour is handoff: *the two numbers tomorrow must reconcile*, written down so the next shift inherits queries, not mysteries.",
  ],

  metrics: [
    { name: "Delivered-in-promise share", what: "Deliveries inside the promise window ÷ DELIVERED orders. The Instamart flavor is the 10-minute share; the restaurant flavor is the zone promise. In-flight orders have no latency yet — say so before averaging." },
    { name: "Monthly demand curve", what: "Deliveries and value folded per month — the seasonality spine of every city review. On the training db the curve runs 2024-01 (8 orders, 3731.97) down to a 2024-07 trough (1193.86) and back." },
    { name: "Cancellation share", what: "Cancelled orders ÷ PLACED orders, per zone and month. Placed is the honest denominator: filtering cancelled rows first makes every zone read 0% or 100%." },
    { name: "Rider supply-demand ratio", what: "Rider online-minutes ÷ order-minutes per zone per hour. The balancing metric behind surge pay — a two-sided fold where either side alone is half a story." },
    { name: "AOV per zone", what: "Delivery value ÷ orders. The network basket reads 338.19 on this db; zones and months that beat it are the premium-demand story the growth team chases." },
    { name: "Dark-store fill rate", what: "Demand served from shelf ÷ demand placed, per dark store. The Instamart health read that decides whether a 10-minute miss was a stocking miss or a rider miss." },
    { name: "Merchant settlement days", what: "Days from invoice issue to settlement — 28.4 average, 13 fastest, 84 slowest on the training db. The partner-trust metric that sits on integer-cent money and split payments." },
    { name: "Take rate", what: "Commission plus fees ÷ delivered GMV, per merchant partner. The marketplace's real revenue lens — two sides at different grains, so the join discipline IS the test." },
  ],

  topics: [
    {
      name: "The two-grain zone census",
      why: "'Deliveries AND diners per zone' opens every city review — and the trap is counting both at one grain. COUNT(*) counts delivery rows; COUNT(DISTINCT customer_id) folds repeat demand back to people; the gap between them is the intensity signal that separates a heavy-repeat metro from a new-user frontier.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "article-views-ii"],
    },
    {
      name: "Kept demand & cancellation math",
      why: "The most-watched ratio in the business is kept ÷ placed, and it is a conditional count before it is a percentage: SUM(CASE WHEN status = 'cancelled' …) over the same rows COUNT(*) divides. Monsoon bursts make cancellations a first-class fact of demand, not noise — and the denominator-drift bug (filtering cancelled rows before the fold) is the classic they screen for.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "monthly-transactions-i"],
    },
    {
      name: "Rider supply & capacity running sums",
      why: "Batch economics is capacity math: how many orders fit a rider's bag before it's full, how many minutes of demand does the online fleet cover. Cumulative windows answer it — and the Swiggy twist is that Rush-hour capacity is always cumulative, never point-in-time.",
      slugs: ["last-person-to-fit-in-the-bus", "game-play-analysis-iii", "last-person-to-fit-in-the-elevator"],
    },
    {
      name: "Month buckets & demand seasonality",
      why: "The monthly business review lives on STRFTIME('%Y-%m') folds — and dies on '%m', which merges January 2024 into January 2025 and turns the trend into fiction. Screens drill bucket grammar, date-window filters and half-open intervals on TEXT timestamps.",
      slugs: ["the-latest-login-in-2020", "user-activity-for-the-past-30-days-i", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "Rates with honest denominators",
      why: "Kept rates, cancellation shares, confirmation rates — Swiggy's ratios punish integer division and careless filters. The house habit: 100.0 before the division, the denominator's population decided before the ratio, ROUND only at the very end.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "City & SKU leaderboards",
      why: "Top zones by kept demand, top merchants by delivered volume, worst months by cancellations — logistics reporting is leaderboard reporting, and ties are everywhere when many zones share metrics. ROW_NUMBER, RANK and DENSE_RANK differ exactly at ties, and the tie policy is a business decision someone must own.",
      slugs: ["rank-scores", "department-top-three-salaries", "second-highest-salary"],
    },
    {
      name: "NULL policy on in-flight orders",
      why: "A delivery has a NULL shipped_at until it completes, a rider can be unassigned, a bonus can be absent. Screens check whether you treat NULL as data to report, coalesce to zero for display, or exclude with a stated reason — deliberately, not by accident.",
      slugs: ["employee-bonus", "calculate-special-bonus", "combine-two-tables"],
    },
    {
      name: "Anti-joins for network hygiene",
      why: "Diners who registered but never ordered, merchant listings that never moved, zones with zero coverage — network hygiene is a LEFT JOIN + IS NULL read (or its NOT EXISTS twin). The db's own truth check matters here: this storefront has zero never-ordered diners, so the honest analyst reports the empty set instead of inventing demand.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "customer-who-visited-but-did-not-transact"],
    },
    {
      name: "Dark-store stock & imbalance reads",
      why: "Instamart runs on forward-stocked dark stores, so the daily read is stock versus sold per SKU and imbalance across stores: which pools are lopsided before the dinner Rush. The drills are one-pass conditional censuses where branch totals must reconcile to COUNT(*).",
      slugs: ["find-stores-with-inventory-imbalance", "active-businesses", "number-of-rich-customers"],
    },
    {
      name: "Merchant settlement cycles",
      why: "Partner money moves on 30-day terms and lands in integer cents: invoices, payments, partial and split settlements. The screens drill cents-to-dollars discipline, coverage classification (exact / partial / none) and the reconciliation eye that catches a void-but-paid invoice before finance does.",
      slugs: ["bank-account-summary-ii", "trial-balance-check", "account-balance"],
    },
  ],

  theory: [
    {
      id: "swiggy-t1",
      q: "The city review needs 'deliveries AND diners per zone' side by side. Why do the two counts disagree, and what does each number mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts rows after the join — one row per delivery, so a diner with five orders contributes five. COUNT(DISTINCT customer_id) folds those five rows back to one person. Neither is wrong: deliveries measures load on the rider network, diners measures audience size, and the ratio between them is the intensity signal the city GM actually manages — a zone of heavy-repeat diners needs different rider supply than a new-user frontier. The trap that catches candidates is a third count: after joining orders to order_items, COUNT(*) silently counts line items instead of orders. Saying 'one row per what?' out loud for every COUNT in the query is the habit the interviewer is listening for.",
      tag: "aggregation",
    },
    {
      id: "swiggy-t2",
      q: "Instamart asks for stock-versus-sold per SKU and imbalance across dark stores. How do you build it, and where does the fan-out live?",
      a: "Stock lives on the product row; sold lives on order lines — so the join is products to order_items, and the fan-out is the whole danger: one SKU appearing on many lines means COUNT(*) counts lines, not SKUs. The shape: SUM(quantity) per product for units sold, stock from the product row, remaining = stock − sold — this db's headline is Desk Mat Extended at 260 stocked versus 47 sold, against the Noise-Canceling Headset at 60 stocked, 46 sold, 14 remaining. The Instamart question is the remaining tail: which SKUs cross the freshness threshold and need markdown or transfer. Imbalance across stores needs the store grain added — GROUP BY store, product — and at that point the one-row-per-what question is worth saying out loud, because a join that forgets it reports imbalance that isn't there.",
      tag: "joins",
    },
    {
      id: "swiggy-t3",
      q: "The demand curve needs month-over-month movement: where did the trough come from and how steep is the recovery? Which window tools do you reach for?",
      a: "LAG over a month-bucketed fold: bucket with STRFTIME('%Y-%m', created_at), fold deliveries and value per month, then LAG(value) OVER (ORDER BY month) puts last month beside this one so the delta is one subtraction — this db's curve runs 3731.97 in January, 3609.64 in February, down to the 1193.86 July trough, and LAG is what turns that list into a story about slope, not levels. The two traps: folding with '%m' instead of '%Y-%m' merges years and fabricates seasonality, and running the window before the fold mixes grains — stage the monthly fold in a derived table or CTE, then run the window over it. For capacity the twin tool is a running SUM with an explicit ROWS frame, because Rush-hour coverage is cumulative and the default RANGE frame lets timestamp ties ride together, stepping your trend line in peer-sized jumps.",
      tag: "windows",
    },
    {
      id: "swiggy-t4",
      q: "shipped_at is NULL until delivery. What is your NULL policy for the latency report — filter, coalesce, or report?",
      a: "Three behaviors, then a policy. Filters: NULL fails both x = value and x != value, so WHERE shipped_at < deadline silently drops in-flight orders. Aggregates: AVG and COUNT(col) ignore NULLs while COUNT(*) keeps the row — the gap between COUNT(*) and COUNT(shipped_at) IS the in-flight picture, 103 versus 82 on this db. Policy: define the population first — only completed deliveries HAVE latency, so filtering NULL shipped_at is correct, and then say it: 'average latency of completed deliveries — 2.98 days on this db; pending and cancelled are out of scope because they have no latency yet.' COALESCE belongs at the display edge only: coalescing NULL latency to 0 inside the pipeline launders in-flight orders into 'perfect deliveries', which is exactly the fake number a city review would act on. Guard, don't decorate.",
      tag: "nulls",
    },
    {
      id: "swiggy-t5",
      q: "You need the trough months — demand value under 2000 — with their cancelled counts. Why does the threshold live in HAVING and not WHERE, and what does the alias rule have to do with it?",
      a: "Because the threshold judges a FOLD: SUM(total) per month does not exist until GROUP BY has formed the groups, and WHERE runs before folding — a row-predicate there can only see individual order rows. HAVING runs after the fold and judges group aggregates: SUM(total) < 2000 keeps exactly the thin months — 2024-07 at 1193.86, 2024-11 at 1648.8, 2025-01 at 1669.5 on this db — while WHERE would filter rows and silently change every month's total. The alias rule rides along: an alias like demand_value is born in SELECT and is unsafe in WHERE (SQLite resolves it in HAVING and ORDER BY, but the portable habit is the underlying expression). The deeper discipline: a WHERE filter on total would be a DIFFERENT metric — 'deliveries under 2000 each' — so say the grain first, and the clause chooses itself.",
      tag: "pipeline",
    },
    {
      id: "swiggy-t6",
      q: "Growth wants the golden-hour cohort: diners whose SECOND order landed within days of their first. How do you compute 'first' and 'second' honestly, and what breaks when the inner query is empty?",
      a: "Two honest shapes. The subquery: find each diner's first order — MIN(created_at) grouped by customer, or ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at, id) = 1 with the id tie-break for same-moment orders — then keep diners whose next order falls inside the window. The window shape stages all orders per diner chronologically, LAGs the previous order beside each one, and diffs; the second order is simply the second row. What breaks on empty: an IN subquery with no rows makes the cohort vanish silently, a scalar comparison against an empty fold yields NULL and fails every row, and a NOT IN against a set containing NULL empties everything. This cohort drives push timing for the Burst windows, so the population sentence matters: 'diners with at least two orders, measured second-minus-first' — not 'all diners, averaged', which is a different metric wearing the same name.",
      tag: "subqueries",
    },
    {
      id: "swiggy-t7",
      q: "Walk me through bucketing TEXT timestamps into months, diffing latency in days, and slicing a Rush window — and where each approach quietly lies.",
      a: "Buckets: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on fixed-width ISO text — gives '2024-07'. The lie is '%m': month alone merges January 2024 into January 2025 and the 'trend' becomes fiction; the SUBSTR shortcut dies the day the format drifts off ISO. Diffs: JULIANDAY(shipped_at) − JULIANDAY(created_at) is fractional days — this db's 2.98 average is exactly that, rounded once at the end; on production minute-grain events the same shape reads a fraction of a day, and the unit belongs to the inputs, not the function. Windows: half-open intervals — created_at >= '2025-02-01' AND < '2025-03-01' — because BETWEEN on the boundary string drops the last night's deliveries, which is precisely when the Rush peaks. And every date fold carries the population caveat: shipped_at is NULL until completion, so state which orders the window is measuring before it measures them.",
      tag: "dates",
    },
    {
      id: "swiggy-t8",
      q: "Finance flags the settlement pack: one invoice is void but has a payment against it, another is paid with zero payment rows. How do you build the reconciliation that catches both — and what does integer-cents discipline add?",
      a: "Coverage classification first: invoices LEFT JOIN grouped payments, then a CASE on the relationship — no payment rows, paid less than amount (partial), paid equal (exact), and the cross-check that catches the anomalies: status = 'void' with payment rows, or status = 'paid' with none. On this db that query surfaces the void-but-paid invoice #11 at 925.00 and the paid-no-payments #28 at 1756.00, plus five split-settlement invoices and one partial (4000 of 6148) — verified row-level facts, not folklore. Split settlements must NOT be deduped blindly: two genuine part-payments folded into one hide a shortfall, so classify coverage before any collapse. The cents discipline rides on every step: these tables hold INTEGER cents, so every dollar read is amount / 100.0 — divide by integer 100 and the truncation quietly eats the paise, and a trial-balance eye (debits equal credits, delta 0) closes the pack.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "swiggy-mcq-1",
      prompt: "Which expression turns the TEXT timestamp '2024-07-19 21:03:44' into the month bucket '2024-07' for the demand curve?",
      choices: [
        "STRFTIME('%m', created_at)",
        "STRFTIME('%Y-%m', created_at)",
        "SUBSTR(created_at, 6, 2)",
        "DATE(created_at, 'month')",
      ],
      answer: 1,
      why: "%Y-%m prints year plus zero-padded month — '2024-07'. On ISO text, SUBSTR(created_at, 1, 7) is the equivalent; this db's monthly folds are built exactly this way.",
      notes: [
        { choice: 0, why: "'%m' alone gives '07' — the year is gone, and July 2024 merges with July 2025 into one bucket. The demand curve becomes fiction the moment two years share the chart." },
        { choice: 2, why: "That grabs '07' from position 6 — month without year, same merge bug, plus a broken promise the day the timestamp format drifts off fixed-width ISO." },
      ],
      difficulty: "easy",
    },
    {
      id: "swiggy-mcq-2",
      prompt: "The one-pass zone census reads EU: placed 45, completed 24, awaiting 6, lost 3. What accounts for the remaining 12 deliveries?",
      choices: [
        "A census bug — the branches should reconcile to zero",
        "In-transit deliveries (status 'shipped') — a fourth status the census must name or the pack doesn't reconcile",
        "Duplicated rows from the diner join — dedupe with DISTINCT",
        "Cancelled orders counted twice",
      ],
      answer: 1,
      why: "Delivered 24 + pending 6 + cancelled 3 = 33; the 12 in the middle are shipped-and-moving deliveries. A census that names only three branches of a four-status world reads as a reconciliation failure — name the fourth branch or print the remainder deliberately.",
      notes: [
        { choice: 0, why: "The branches DO reconcile — against a four-status world, not a three-status one. The gap is information, not error: 12 deliveries are between kitchen and doorstep." },
        { choice: 2, why: "DISTINCT would collapse legitimate rows and still leave the 12 unexplained. Duplicates double counts; they don't hide a whole status class." },
      ],
      difficulty: "easy",
    },
    {
      id: "swiggy-mcq-3",
      prompt: "Invoices hold money as INTEGER cents — the 6 open invoices sum to 19609. Which expression shows the AR total in dollars?",
      choices: [
        "SUM(amount) / 100",
        "SUM(amount) / 100.0",
        "SUM(amount) * 100",
        "ROUND(SUM(amount))",
      ],
      answer: 1,
      why: "19609 cents is 196.09 dollars, and only the 100.0 divisor forces real division: SUM/100.0 = 196.09. Integer 100 truncates to 196 and quietly eats the paise — the classic cents-math bug on settlement tables.",
      notes: [
        { choice: 0, why: "Integer division truncates: 19609/100 = 196 in SQLite integer math. Across thousands of settlement rows, the missing fraction is a real reconciliation hole." },
        { choice: 2, why: "Multiplying by 100 turns cents into a millionths-of-dollars integer — 1960900. The direction of conversion matters as much as the type." },
      ],
      difficulty: "easy",
    },
    {
      id: "swiggy-mcq-4",
      prompt: "The trough-month board folds deliveries per month and keeps months with total demand value under 2000. Where does 'SUM(total) < 2000' live, and why?",
      choices: [
        "WHERE — filters belong in WHERE",
        "HAVING — the threshold judges a folded SUM, which only exists after GROUP BY",
        "ORDER BY — the filter is really a sort",
        "ON — it's a join condition between months",
      ],
      answer: 1,
      why: "WHERE runs before folding and can only see individual order rows; SUM(total) per month exists after GROUP BY, and HAVING judges group aggregates. A WHERE SUM filter is a syntax error — the pipeline order teaching you the clause.",
      notes: [
        { choice: 0, why: "A WHERE on total would be a DIFFERENT metric — 'deliveries under 2000 each' — filtering rows and silently changing every month's total. The grain says HAVING." },
        { choice: 3, why: "Months aren't joined to anything here — the fold is single-table. The threshold is a group-predicate, and group-predicates live in HAVING." },
      ],
      difficulty: "medium",
    },
    {
      id: "swiggy-mcq-5",
      prompt: "AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) over ALL 103 orders reads 2.98. What population does that average actually cover?",
      choices: [
        "All 103 orders — NULLs count as zero latency",
        "The 82 completed deliveries — AVG ignores NULLs, so the 21 in-flight-plus-cancelled orders silently vanish",
        "Only the 52 delivered orders — shipped orders are excluded",
        "It returns NULL — one NULL input poisons the whole aggregate",
      ],
      answer: 1,
      why: "AVG skips NULL inputs: the average runs over the 82 orders with delivery timestamps. That can be exactly right — in-flight orders have no latency yet — but the population must be stated, or the report reads as if it covered everyone.",
      notes: [
        { choice: 0, why: "Aggregates never treat NULL as zero — that's the COALESCE bug, which launders in-flight orders into 'perfect deliveries' instead of excluding them." },
        { choice: 2, why: "Nothing in the query excludes 'shipped' — all 82 non-NULL timestamps (52 delivered + 30 shipped) are in. The population is defined by non-NULL-ness, not by status." },
      ],
      difficulty: "medium",
    },
    {
      id: "swiggy-mcq-6",
      prompt: "Find merchant partners whose listings never delivered — an anti-join. partner_id is a nullable FK. Which shape survives a stray NULL?",
      choices: [
        "WHERE partner_id NOT IN (SELECT id FROM partners)",
        "LEFT JOIN partners … WHERE p.id IS NULL, or NOT EXISTS (SELECT 1 FROM partners p WHERE p.id = l.partner_id)",
        "INNER JOIN and filter for missing matches",
        "GROUP BY partner_id HAVING COUNT(*) = 0",
      ],
      answer: 1,
      why: "NOT IN against a set containing NULL can never be TRUE — one stray NULL empties the whole report. LEFT JOIN + IS NULL and NOT EXISTS are the NULL-proof anti-joins; on this db the honest answer is that zero partners never delivered, and the NULL-proof shape is what lets you SAY that with confidence.",
      notes: [
        { choice: 0, why: "This is the classic silent-empty bug: the query runs, returns zero rows, and the hygiene report ships looking clean while the logic collapsed on UNKNOWN." },
        { choice: 2, why: "An INNER JOIN deletes the unmatched rows — the exact rows the anti-join exists to find. The join type must keep the orphans alive so IS NULL can catch them." },
      ],
      difficulty: "medium",
    },
    {
      id: "swiggy-mcq-7",
      prompt: "The city pack wants per-zone columns: completed, awaiting, lost — in ONE pass over deliveries. Which shape builds it?",
      choices: [
        "Three separate queries stitched in the app",
        "COUNT(*) FILTER (WHERE status = …) per branch — or the SUM(CASE WHEN …) twin",
        "GROUP_CONCAT(status) and split in the app",
        "A self-join of orders to orders on zone",
      ],
      answer: 1,
      why: "Conditional aggregation folds all branches in one scan: COUNT(*) FILTER (WHERE …) or SUM(CASE WHEN …) over the same GROUP BY — one pass, and the branches must reconcile to COUNT(*) of placed. Query-budget discipline is the interview point.",
      notes: [
        { choice: 0, why: "Three scans triple the cost and invite three different WHERE drifts — the branch totals stop being comparable. One fold, one scan, reconciling branches." },
        { choice: 2, why: "GROUP_CONCAT builds a comma-string of statuses — a payload, not a census. Counting in SQL beats parsing strings in the app, every review." },
      ],
      difficulty: "medium",
    },
    {
      id: "swiggy-mcq-8",
      prompt: "A teammate folds the demand curve with STRFTIME('%m', created_at) and reports a 'steady' 14-month trend. What actually happened?",
      choices: [
        "Nothing — '%m' is the standard month bucket",
        "Months across years merged — January 2024 and January 2025 folded into one '01' bucket, so the 'trend' compares a merged month to a merged month",
        "The timestamps were parsed in the wrong timezone",
        "NULL months were dropped by the GROUP BY",
      ],
      answer: 1,
      why: "'%m' buckets by month number alone; 2024-01 (8 orders, 3731.97) and 2025-01 (6, 1669.5) fold into a single '01' row — the curve loses a year of seasonality and invents stability. The bucket is '%Y-%m' or SUBSTR(created_at, 1, 7).",
      notes: [
        { choice: 0, why: "The bucket runs without error — that's the trap. The output has 12-ish rows instead of 14 and every merged row is a plausible-looking lie." },
        { choice: 3, why: "GROUP BY keeps NULLs as their own group rather than dropping them. The damage here is year-merging, which is invisible precisely because the query succeeds." },
      ],
      difficulty: "hard",
    },
    {
      id: "swiggy-mcq-9",
      prompt: "Rider capacity: SUM(orders) OVER (ORDER BY minute) over a per-minute fold. Two minutes tie at the same timestamp. What does the running total at the FIRST tied row include?",
      choices: [
        "Just that row — running totals walk row by row",
        "All rows tied at that timestamp — the default frame is RANGE, so peers ride together",
        "The whole day — unordered windows are global",
        "Nothing — windows refuse duplicate ORDER BY keys",
      ],
      answer: 1,
      why: "The default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes ordering PEERS — the running total jumps by the whole tie group. For row-by-row capacity math you must write ROWS BETWEEN … CURRENT ROW explicitly.",
      notes: [
        { choice: 0, why: "That's the ROWS frame nobody wrote. The default RANGE silently turns timestamp ties into peer groups — exactly where burst demand clusters." },
        { choice: 3, why: "Tied ORDER BY keys are legal; they're what makes RANGE and ROWS diverge. The failure isn't an error — it's a capacity line that steps in burst-sized jumps." },
      ],
      difficulty: "hard",
    },
    {
      id: "swiggy-mcq-10",
      prompt: "Flag diners whose SECOND order landed within 7 days of their first. Which shape is right?",
      choices: [
        "WHERE COUNT(*) >= 2 directly on orders",
        "Stage per-diner orders chronologically, LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id), diff in julianday days, keep rows with diff <= 7",
        "WHERE created_at > MIN(created_at) + 7 on the same table",
        "GROUP BY customer_id with AVG(created_at) < 7",
      ],
      answer: 1,
      why: "LAG puts each order's predecessor beside it at the same grain; the julianday diff flags the gap and the filter keeps the within-window rows — with the id tie-break making 'order' deterministic when timestamps collide. One grain, one window, one honest cohort.",
      notes: [
        { choice: 0, why: "COUNT(*) doesn't exist at WHERE time — no groups have formed. The engine rejects it, which is the grammar teaching you the pipeline order." },
        { choice: 2, why: "MIN(created_at) is an aggregate — unavailable in WHERE (and an alias there errors too). Even as HAVING it would compare every order to +7 days, not 'the second one'." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-swiggy-1",
      tier: "medium",
      topic: "t4",
      universe: "month-close",
      title: "The trough-month demand board",
      brief:
        "Swiggy-flavored brief on the storefront db: the month-close pack for the city GM needs the demand curve's weak months isolated — 'the months where demand value dipped under 2000, with their delivery counts and cancellations, because that's where the rider plan and the promo calendar need surgery.' Definitions are fixed: month = STRFTIME('%Y-%m') on the order timestamp (never '%m' — merged years are fiction), demand value = SUM(total) folded per month, and the lost column counts cancelled orders inside the same fold so the shares stay honest. Probed facts: the db runs 2024-01 through 2025-02; the thin months are 2024-07 (8 deliveries, 1193.86, 2 cancelled), 2024-11 (6, 1648.8, 2) and 2025-01 (6, 1669.5, 1) — three months carrying 5 of the db's 7 cancellations.",
      ask: "Return the trough months — demand value under 2000 — with deliveries, demand_value and lost orders, thinnest month first.",
      template:
        "SELECT STRFTIME({1}, created_at) AS month,\n       COUNT(*) AS deliveries,\n       ROUND(SUM(total), 2) AS demand_value,\n       SUM(CASE WHEN status = {2} THEN 1 ELSE 0 END) AS lost\nFROM orders\nGROUP BY month\nHAVING SUM(total) < {3}\nORDER BY demand_value;",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month bucket",
          why: "'%Y-%m' buckets year-plus-month — '2024-07'. '%m' alone merges January 2024 into January 2025 and the seasonality becomes fiction; '%Y' collapses everything into two rows.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the lost-demand status",
          why: "The lost column counts status = 'cancelled' inside the fold. Swap in 'pending' and the board reports 1/1/1 instead of 2/2/1 — in-flight demand mislabeled as lost.",
        },
        {
          answer: "2000",
          kind: "number",
          label: "the trough threshold",
          noVerify: true,
          why: "The GM set the trough line at 2000: it keeps exactly the three thin months. 1000 would keep only 2024-07 and hide the November and January dips the promo calendar needs.",
        },
      ],
      distractors: ["'%m'", "'%Y'", "'pending'", "1000"],
      walkthrough:
        "A seasonality board is a bucket, a fold, and a threshold at the right grain. STRFTIME('%Y-%m', created_at) buckets 103 orders into 14 clean months; the fold counts deliveries, sums value at two decimals, and counts cancellations inside the same GROUP BY so every column shares one population. HAVING — not WHERE — carries the threshold, because SUM(total) per month only exists after the fold: under 2000 keeps 2024-07 (1193.86, 8 deliveries, 2 lost), 2024-11 (1648.8, 6, 2) and 2025-01 (1669.5, 6, 1), and ORDER BY demand_value opens the pack on the thinnest month. The bucket traps are the Swiggy classics: '%m' merges 2024-01 into 2025-01 and the curve lies by omission; '%Y' collapses everything into two rows. 'pending' mislabels in-flight as lost — 1/1/1 instead of 2/2/1 — and a 1000 threshold hides two of the three months the GM asked to see. Three thin months, 5 of 7 cancellations: the seasonality story is one query long.",
    },
    {
      id: "cs-swiggy-2",
      tier: "hard",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass zone census",
      brief:
        "Swiggy-flavored brief on the storefront db: the dinner Rush post-mortem needs the full status census per delivery zone — completed, awaiting, lost — and the ops lead is explicit: 'one scan. The zone review has a query budget, and three sequential queries with three WHERE drifts is how the numbers stop reconciling.' Definition fixed: one row per zone, COUNT(*) FILTER per status branch, every branch drawn from the same folded population so the branches plus in-transit must add back to placed. Probed facts: 103 deliveries across four zones — EU 45 placed (24 delivered, 12 shipped, 6 pending, 3 cancelled), APAC 37 (21/8/5/3), US 19 (5/10/3/1), LATAM 2 (2/0/0/0). The gap between the three printed branches and placed IS the in-transit column — read it, don't hide it.",
      ask: "Return each zone's status census in one pass: placed, completed, awaiting, lost — biggest load first.",
      template:
        "SELECT c.region AS zone,\n       COUNT(*) AS placed,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS completed,\n       COUNT(*) FILTER (WHERE o.status = {2}) AS awaiting,\n       COUNT(*) FILTER (WHERE o.status = {3}) AS lost\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY placed {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed branch",
          why: "Completed means status = 'delivered' — EU 24, APAC 21, US 5, LATAM 2. 'shipped' would report in-transit demand as finished and overstate the promise kept by 12 in EU alone.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the awaiting branch",
          why: "Awaiting rider assignment is status = 'pending' — 6, 5, 3, 0 per zone. 'delivered' here would double-count the completed branch and break the reconcile-to-placed check.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the lost branch",
          why: "Lost demand is status = 'cancelled' — 3, 3, 1, 0. 'void' belongs to the invoice table, not orders: the branch would read zeros and hide every real cancellation.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-load order",
          why: "The Rush review reads biggest network load first: EU 45, APAC 37, US 19, LATAM 2. ASC would open the post-mortem on LATAM's two deliveries instead of the zone that matters.",
        },
      ],
      distractors: ["'shipped'", "'void'", "ASC"],
      walkthrough:
        "One scan, four zones, branches that reconcile. The join attaches all 103 orders to their diner's zone; COUNT(*) holds the placed load (45/37/19/2) while three COUNT(*) FILTER branches fold statuses inside the same GROUP BY — delivered (24/21/5/2), pending (6/5/3/0), cancelled (3/3/1/0) — and the silence between branches and placed is the in-transit column: 12 in EU, 8 in APAC, 10 in US, 0 in LATAM. That gap is the census honesty check: branches plus shipped must equal placed, and a pack that can't show it is guessing. The distractors map to real report bugs: 'shipped' in the completed branch promotes in-transit to done — EU reads 36 instead of 24; 'void' (an invoice status) zeroes a branch and hides 7 real cancellations; ASC opens the post-mortem on LATAM's two deliveries. One pass, one population, reconciling branches — the query-budget habit the ops lead demanded, and the reason this census survives the review.",
    },
  ],

  problems: [
    { slug: "immediate-food-delivery-ii", why: "The kept-share rate over first-order demand: a conditional percentage where the denominator is the whole test — Swiggy's cancellation-rate question in textbook form." },
    { slug: "immediate-food-delivery-i", why: "The first pass at placed-versus-kept demand: read the delivery-moment preference before any percentage lands — the warm-up half of the kept-rate drill." },
    { slug: "monthly-transactions-i", why: "Month buckets with a cancelled-count alongside — the demand-curve fold the monthly business review opens with, '%Y-%m' grammar drilled." },
    { slug: "trips-and-users", why: "Cancelled rate by city with exclusion windows — the monsoon-day story: which demand counts in the denominator, which doesn't, at its most brutal." },
    { slug: "confirmation-rate", why: "Confirmation share with NULL-tolerant rounding — the delivered-as-promised rate, computed honestly over the population that actually has a delivery." },
    { slug: "find-golden-hour-customers", why: "Diners whose repeat order lands inside the golden window — the Burst-hour retention read that drives push timing in the metros." },
    { slug: "last-person-to-fit-in-the-elevator", why: "Running-sum capacity — how many orders fit a rider's bag before it's full; the batch-economics drill, cumulative by construction." },
    { slug: "sales-by-day-of-the-week", why: "The weekend-surge pivot — Friday-to-Sunday demand versus the weekday base, the rider-shift staffing input computed as a column per day." },
    { slug: "unique-orders-and-customers-per-month", why: "The two-grain monthly census: orders AND distinct diners per month, each count at its own grain — the month-close pack's opening table." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share math with 100.0 before the division — participation rates for the Swiggy One cohort, rounded once at the end." },
    { slug: "find-stores-with-inventory-imbalance", why: "Dark-store imbalance — which forward-stock pools are lopsided before the dinner Rush; stock-versus-sold read at store grain." },
    { slug: "active-businesses", why: "One-pass conditional flags per store — the query-budget census: how many activity types did this dark store fire, in a single scan." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The demand argmax — which diner places the most orders; the buyer-side twin of the city leaderboard, decided on a grouped count." },
    { slug: "bank-account-summary-ii", why: "Merchant settlement folds per partner — money in, money out, net per store, integer cents handled honestly with the 100.0 divisor." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Each diner's repeat favorite — argmax with a deterministic tie-break, the personalization input for the home feed." },
    { slug: "the-most-recent-orders-for-each-product", why: "Most recent order per SKU — Instamart freshness reading: when did this item last move off the dark-store shelf." },
  ],
};
