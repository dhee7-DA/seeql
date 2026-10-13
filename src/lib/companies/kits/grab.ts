// Grab — kit 5 of the Ride-hailing & Mobility domain (Batch C).
// Southeast Asia's everyday super-app: rides, GrabFood, GrabMart and the
// GrabPay wallet, tiered-city operations and cross-sell as the growth
// engine. No registry tags — the pool is theme-curated: every problem
// mirrors a workflow Grab's growth, city and payments teams are known to
// probe (scripts/company-pools.md theme menu). Case studies run on the
// storefront db — mapped honestly as orders=bookings across verticals,
// customers=riders, suppliers=fleet/vehicle partners, shipped_at=completion
// stamp, payments=settlement rails behind the wallet — with probed figures
// (scripts/company-facts.md).

import type { CompanyKit } from "../types";

export const grabKit: CompanyKit = {
  id: "grab",
  domainId: "mobility",
  name: "Grab",
  tagline: "Southeast Asia's everyday super-app",
  accent: "text-teal-400",

  brief: [
    "Grab is **Southeast Asia's everyday super-app** — rides, GrabFood, GrabMart and the GrabPay wallet stacked on one rider account, run from Singapore across markets where a metro capital and a secondary city can behave like different businesses. The growth thesis is cross-sell: a rider who takes a ride this month is worth dramatically more once food and mart share the wallet, so the flagship reads are all overlap reads — {pink:whales}, repeat behavior, multi-vertical adoption. Demand is heterogeneous by design: cash and wallet coexist, tiered cities mean one pricing language per market, and monsoon evenings rewrite the demand curve hourly. Bookings and completed trips are different numbers: on this kit's storefront db **103 bookings** split 52 completed / 30 underway / 14 awaiting match / 7 cancelled, with riders concentrated enough that the top spenders carry most of the value — **63.5% of revenue** comes from riders whose lifetime spend crosses the whale bar.",
    "The data org mirrors the super-app: vertical teams (mobility, food, mart) share one rider identity, and the interesting analytics happens at the seams — who converted from rides to food, which basket contents predict the next order, where wallet adoption lags. A payments-adjacent team owns settlement reconciliation: every transaction must land as {emerald:exact}, {amber:partial} or {rose:none}, and a 'paid' label that has no money behind it is an incident, not a curiosity. The finance tables carry one house rule: money is stored as INTEGER cents, so the dollar read is `amount_cents / 100.0` — the missing .0 is how a wallet ledger quietly leaks. City pods read tier-specific dashboards; the central growth team reads cohorts — every acquisition month is folded forward, and **month-1 retention** is the number the CEO quotes.",
    "Interview style is growth-fluent and grain-obsessed. A typical screen walks from a warm-up aggregation (top riders by lifetime fares) into a **fan-out trap** (baskets, line items, cross-vertical joins), then escalates into either a window question (cohort retention with `PARTITION BY` and month offsets) or a rate whose denominator is the whole test. Follow-ups are definition probes: 'per booking or per rider?', 'first order in the window or first order ever?', 'what does a `NULL` completion stamp mean in your denominator?'. Candidates who state the grain before writing consistently outperform — in a super-app, every count has at least **three defensible grains** and one of them is wrong for the question.",
    "Preparation strategy: Grab has no tagged pool in this app's registry, so the kit curates **sixteen problems** from the SQL band that mirror its known screen themes — whale and concentration reads, basket cross-sell, funnel completion shares, cohort retention windows, `NULL`-safe wallet folds, and settlement reconciliation. Do the topics in order, then run both case studies on the live storefront database: one rebuilds the **whale ledger** growth opens the quarterly review with, the other rebuilds the settlement-rail fold finance closes the week with.",
  ],

  dayInLife: [
    "**08:30 —** The day starts with the wallet, not the map. A growth analyst opens the overnight board: bookings by vertical, completions, and the settlement fold that landed overnight — how much cleared on each rail, and did any transaction fall into '{rose:none}' or '{amber:partial}'? The first query is a reconciliation: branches against totals, settlement rows against booking counts. On this db that's the **52/30/14/7** status fold against 103 placed, and the card-versus-transfer settlement mix — **16 settlements / 37364** versus 11 / 32248. A mismatch here is the day's first fire, and the analyst who can write the coverage query — exact, partial, none, per transaction — is the one everyone waits on.",
    "**11:30 —** Midday is cross-sell work. The food team wants basket depth per city tier; the mart team wants which ride-heavy riders have never opened GrabMart (the **anti-join** of the super-app); growth wants the {pink:whale ledger} refreshed — riders whose lifetime fares cross the top cohort bar, with region attached, because the quarterly review opens with that table and the **63.5%** concentration number beside it. Each ask is a join, a conditional aggregate and one grain decision — riders, bookings or baskets — and the strong analyst writes the query twice: once to answer, once with the definition printed in the column name so the number survives the review argument.",
    "**15:00 —** The afternoon is stakeholder cycles. The weekly business review is definition-first: every headline — {sky:completion share}, {emerald:repeat rate}, wallet adoption — ships with its SQL attached, because a number without its query is a rumor and this deck goes up to people who read SQL. Then cohort prep: acquisition months folded forward, **month-1 and month-2 retention** per market tier, the retention curve that decides where the next incentive budget lands.",
    "**18:30 —** The last hour is handoff to the night shift in the later timezone: freshness status per feed, the fires closed, and tomorrow morning's two numbers — {emerald:completions} and settlement coverage — written down so the next analyst inherits queries, not mysteries. The closing note keeps *the super-app rule*: every count states its grain — riders, bookings or baskets — before anyone reads the number.",
  ],

  metrics: [
    { name: "GMV", what: "Gross bookings value across rides, food and mart — the headline the super-app manages by vertical; 34833.28 on the sample db, and every version of it is a status-aware fold." },
    { name: "Take rate", what: "Platform net revenue ÷ GMV, per vertical. The monetization lens — numerator and denominator live in different tables, so grain discipline is the entire test." },
    { name: "MTU", what: "Monthly transacting users — distinct riders with 1+ completed booking in the month. The audience count; COUNT(DISTINCT) discipline decides whether it's people or bookings." },
    { name: "Cross-sell ratio", what: "Share of riders active in 2+ verticals in a window. The super-app thesis in one number — and an overlap count that punishes every fan-out mistake." },
    { name: "Completion rate", what: "Completed ÷ placed bookings. 52 of 103 on the sample db; the denominator question (placed vs matched) is the screen's favorite follow-up." },
    { name: "Cashless share", what: "Wallet-and-card settlements ÷ all settlements. The GrabPay migration story — the settlement-rail fold is this kit's second case study." },
    { name: "Repeat rate", what: "Share of riders with 2+ bookings — 14 of 16 on the sample db. The retention headline, and a HAVING-gated count in interview form." },
    { name: "Cohort retention", what: "Month-1 repeat behavior of each acquisition cohort, folded forward with windows. The number that decides where the next incentive budget lands." },
  ],

  topics: [
    {
      name: "Whale reads & concentration",
      why: "The quarterly review opens with the whale ledger: riders whose lifetime fares cross the top cohort bar, ranked biggest-first — 63.5% of revenue sits with 3000-plus spenders on this db. The screens test the full chain: GROUP BY rider, HAVING gate, ORDER BY the folded total, and the discipline to say the denominator out loud.",
      slugs: ["customer-placing-the-largest-number-of-orders", "number-of-rich-customers", "top-earners"],
    },
    {
      name: "Repeat behavior & loyalty",
      why: "GrabUnlimited and the incentive budget hang on repeat behavior: share of riders with 2+ bookings, order-frequency cohorts, loyal-customer islands. These are HAVING gates over per-rider folds, and the classic bug is folding the count after a fan-out join has multiplied bookings into line items.",
      slugs: ["repeat-purchase-rate", "customer-order-frequency", "find-loyal-customers"],
    },
    {
      name: "Cross-sell baskets",
      why: "The super-app's growth engine is the basket: which verticals co-occur, which items predict the next order, basket depth per market. Pair and co-occurrence reads are self-joins at two grains with canonicalization (a < b) so every pair counts once — exactly where cross-vertical fan-out punishes the careless.",
      slugs: ["customers-who-bought-a-and-b-not-c", "find-product-recommendation-pairs", "basket-depth-aov"],
    },
    {
      name: "Wallet & settlement folds",
      why: "GrabPay's ledger discipline is a SQL discipline: settlements per rail, credits and debits per account, cents folded with /100.0. The screens test whether your money folds balance — per-account nets, month buckets on the settlement calendar, and parity checks between bookings and money.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-i", "odd-and-even-transactions"],
    },
    {
      name: "Funnel & completion shares",
      why: "Every vertical reports a completion share and every deck reads one: completed ÷ placed, with the denominator question (placed or matched?) decided BEFORE the ratio. Conditional counts and 100.0-before-division are the daily muscles; integer-division truncation is the bug that makes small markets read as zero.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "funnel-step-conversion"],
    },
    {
      name: "City-tier CASE banding",
      why: "One app, many market tiers: metro, secondary, frontier — each with its own incentive ladder. CASE banding over spend and frequency is how riders and cities get tiered, and the screens check exhaustiveness: a boundary at exactly the threshold, an ELSE that catches everything, and no silent NULL tier.",
      slugs: ["customer-purchasing-behavior-analysis", "calculate-orders-within-each-interval", "spend-histogram"],
    },
    {
      name: "Ranking the verticals",
      why: "Peak transaction days per market, latest booking per rider, price at the moment of order — Grab reporting is leaderboard and as-of reporting. ROW_NUMBER and RANK with deterministic tie-breaks are drilled because market peaks tie constantly and the LIMIT-1 habit breaks on exactly those ties.",
      slugs: ["maximum-transaction-each-day", "the-most-recent-orders-for-each-product", "product-price-at-a-given-date"],
    },
    {
      name: "Cohorts & retention",
      why: "The CEO quotes month-1 retention, so the screens do too: acquisition-month cohorts folded forward, week-1 new-rider counts, the day-4 activity check. Windows over staged folds — PARTITION BY cohort, offsets by month index — are the shape, and the offset arithmetic on date strings is where candidates leak.",
      slugs: ["cohort-retention-matrix", "new-users-daily-count", "game-play-analysis-iv"],
    },
    {
      name: "NULL policy on partial captures",
      why: "A wallet capture can be missing, a completion stamp NULL until drop-off, a forward-fill needed when a feed retries half-empty. Grab screens check whether you treat NULL as a bucket to report, a zero to display, or a data-quality escalation — deliberately, with the policy stated, not by accident.",
      slugs: ["books-with-null-ratings", "null-blank-audit", "change-null-values-in-a-table-to-the-previous-value"],
    },
    {
      name: "Calendar reads across markets",
      why: "Weekend surges, monsoon seasonality, festival calendars — demand reads are date reads: weekday filters via strftime, month-over-month season CASEs, and the discipline of half-open intervals so the last night of a promo never falls out of the bucket.",
      slugs: ["friday-purchases-i", "seasonal-sales-analysis", "tasks-count-in-the-weekend"],
    },
  ],

  theory: [
    {
      id: "grab-t1",
      q: "The quarterly deck claims 'our top riders carry most of the value.' How do you turn that sentence into a defensible number — and what are the two denominators people confuse?",
      a: "You compute concentration with the denominator printed. The honest fold: per-rider lifetime fares, then the share of TOTAL revenue carried by riders above the whale bar — on this db 63.5% of revenue comes from riders whose lifetime spend crosses 3000, and 71.2% from those above 2000. The two denominators people confuse: share of REVENUE (the value-weighted read the deck wants) versus share of RIDERS (the audience read that makes the number sound dramatic — 'top riders' as a tiny fraction of 16 is marketing, not analytics). The mechanics: fold once per rider with SUM, compute the platform total in the same fold or a CTE, and divide with 100.0 promotion — integer division truncates the share and the deck prints fiction. The Grab twist: concentration is fine, dependency is not — the same query should also say what happens to GMV if the top rider churns, because that's the sentence the board actually asks.",
      tag: "aggregation",
    },
    {
      id: "grab-t2",
      q: "You're counting cross-sell pairs — riders who used rides AND food, items that co-occur in baskets. Where does the fan-out bite, and how do you count pairs honestly?",
      a: "Two places. The fan-out: joining bookings to line items multiplies rows — one food order with three items becomes three rows — so COUNT(*) counts touchpoints, not relationships, and every downstream 'pair count' inherits the inflation. The symmetry: a naive self-join returns every pair twice (A-with-B and B-with-A) plus self-pairs (A-with-A). The honest shape: stage the fold first — one row per booking (or per rider-vertical) — then self-join that staged result with a canonical key a.id < b.id, which halves the symmetric pairs and kills self-pairs in one predicate. COUNT(DISTINCT rider_id) per vertical before the overlap fold keeps the audience grain. The habit being graded: at a super-app every co-occurrence number has a fan-out and a symmetry tax — say both out loud before the join, because a doubled cross-sell ratio is not a rounding note, it's the growth team buying the wrong incentive.",
      tag: "joins",
    },
    {
      id: "grab-t3",
      q: "Build month-1 retention by acquisition cohort. Where do the windows go, and what does the offset arithmetic look like on TEXT dates?",
      a: "Stage it, then window it. Stage one: fold each rider to their first booking month (MIN over the month bucket) — that's the cohort key. Stage two: fold activity per rider per month, join back to the cohort key, and compute the offset — for ISO text dates, the month index as (STRFTIME('%Y', m) - STRFTIME('%Y', first)) * 12 + STRFTIME('%m', m) - STRFTIME('%m', first), integer arithmetic that survives year boundaries. The window layer: PARTITION BY cohort ORDER BY month_offset, with retention as actives in month 1 ÷ cohort size — the denominator frozen at month 0, not the shrinking survivor base. The classic bugs: integer division flattening the curve to zero, and recomputing the cohort size inside each month's row so retention looks flat because the denominator shrank with the numerator. The CEO quotes month-1 — make sure the number behind the quote is the one where only the numerator moves.",
      tag: "windows",
    },
    {
      id: "grab-t4",
      q: "A wallet capture has no completion timestamp and a booking shows NULL until drop-off. What's your NULL policy across filters, joins and aggregates — and where does it bend?",
      a: "Three behaviors, then a policy. Filters: NULL fails both x = value and x != value — UNKNOWN — so WHERE completed_at < deadline silently drops in-flight bookings, which is the definition sometimes and a leak other times. Joins: NULL keys never match — a capture with a NULL transaction reference vanishes from INNER joins, which is exactly how a settlement quietly loses money. Aggregates: COUNT(*) keeps the row (103 bookings), COUNT(completion_stamp) counts non-NULLs (82) — the 21-row gap IS the in-flight picture; AVG ignores NULLs, so averages over all rows and completed rows are different metrics. The policy: NULL-until-dropoff means 'not yet' — report it as its own bucket, never coalesce it into zero inside the pipeline; a mid-pipeline COALESCE launders an unknown into a fake zero that someone will act on. Bend the policy only at the display edge, and say so — '—' versus 0.0 is a stakeholder conversation, not a SQL default.",
      tag: "nulls",
    },
    {
      id: "grab-t5",
      q: "Your city-tier read filters riders by lifetime spend and then tiers the survivors. Which clause holds each filter, and what breaks when they swap?",
      a: "Logical order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. The spend gate on individual bookings is a row fact — WHERE lifetime is impossible (lifetime spend doesn't exist per row), so the shape is a staged fold: per-rider SUM first, then the tier CASE on the folded value. The gate on GROUPS — 'tiers whose rider count exceeds 50' — is HAVING, after the fold. Swap them and two things break mechanically: WHERE cannot see aggregates or SELECT aliases (the error is immediate), and a HAVING doing row-filtering work wastes the fold and changes the population silently. The super-app trap is the staged version: tier assignment on per-rider folds, then a SECOND fold over tiers — two grains, two layers, one job each, CTE names carrying the definitions (rider_fares, tier_walls). At Grab the tier ladder is a pricing decision; a filter in the wrong clause doesn't just misrun, it re-prices a market.",
      tag: "pipeline",
    },
    {
      id: "grab-t6",
      q: "Growth wants riders whose FIRST booking landed in the promo window. Sketch the query — and say what happens if the inner fold comes back empty.",
      a: "Two honest shapes. Correlated: WHERE EXISTS (SELECT 1 FROM bookings earlier WHERE earlier.rider_id = r.id AND earlier.created_at < promo_start) negated — 'no booking before the window' defines first-booking-in-window without assuming the minimum is global. Subquery shape: WHERE r.first_booking >= promo_start with first_booking folded in a derived table or CTE — MIN(created_at) per rider, then the window comparison. What the interviewer probes: if the inner fold is empty — a rider with no bookings, a filtered staging table — the scalar version yields NULL, every comparison is UNKNOWN, and the cohort silently returns nothing while looking correct. The correlated version fails loud-ish (empty result) but costs a re-scan per row. The super-app reason this matters: first-booking-in-window IS the acquisition cohort definition — get the edge wrong and month-1 retention, the number the CEO quotes, is measuring a different population than the deck claims.",
      tag: "subqueries",
    },
    {
      id: "grab-t7",
      q: "Bookings arrive as TEXT timestamps across markets. How do you build the month spine, diff in days, and window a promo — without losing the last night?",
      a: "Three tools, three disciplines. Buckets: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on fixed-width ISO — builds the 14-month spine; the SUBSTR shortcut breaks the day one feed ships a non-padded date, so the format convention is stated, not assumed. Diffs: JULIANDAY(completion) - JULIANDAY(created_at) in fractional days, rounded once at the END — this db's 2.98-day average is exactly that shape, an outstation-style window, not a city ride. Promo windows: half-open — created_at >= '2025-02-01' AND < '2025-03-01' — never BETWEEN on the last day, which drops the promo's final evening, historically the biggest one. The market twist: one super-app, several timezones, and a text column that declares none of them — a month bucket computed without a timezone convention is a different month in Jakarta and Manila. State the convention, then query it — never the reverse.",
      tag: "dates",
    },
    {
      id: "grab-t8",
      q: "Settlement reconciliation: one transaction shows paid with no settlement rows, five paid across two rows, one open with a partial capture. How do you classify all of them in one pass?",
      a: "LEFT JOIN transactions to settlements, fold per transaction, and CASE the coverage: no settlement rows (COUNT = 0) → 'none'; matched amount equals billed amount → 'exact'; matched amount exists but falls short → 'partial'. On this db that's 21 exact, 6 with nothing, and 1 partial — 4000 captured against a 6148 bill — and the paid-with-no-settlement row (status says paid, money says nothing) plus the five split settlements are the anomalies the classification exists to surface. The policy layer: 'none' goes to collections with the amount attached; 'partial' goes to payments ops with the shortfall; split settlements are folded only for display — ROW_NUMBER with a deterministic tie-break if the view needs one row — never for the reconciliation itself, because folding two genuine part-payments hides the shortfall you exist to find. The graded habit: coverage is a classification computed from BOTH tables, never a status column read at face value — at a wallet company, that distinction is the difference between a dashboard and an audit.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "grab-mcq-1",
      prompt: "The whale ledger needs riders with 13 or more lifetime bookings. Which clause holds that gate?",
      choices: [
        "WHERE COUNT(*) >= 13 — filter early",
        "HAVING COUNT(*) >= 13 — after the per-rider fold",
        "LIMIT 13 — cap the output",
        "TOP 13 — select the biggest riders",
      ],
      answer: 1,
      why: "Bookings-per-rider exists only after GROUP BY folds the rows, and group-level predicates live in HAVING: four riders clear the 13 bar on this db (24, 17, 14 and 13 bookings). WHERE cannot see aggregates at all.",
      notes: [
        { choice: 0, why: "WHERE runs before folding — an aggregate there is a hard error, and pre-filtering rows instead would silently change who can reach 13." },
        { choice: 2, why: "LIMIT caps output rows after sorting — 13 is a per-rider count threshold, not a row count. The cap would keep an arbitrary 13 riders." },
      ],
      difficulty: "easy",
    },
    {
      id: "grab-mcq-2",
      prompt: "16 riders; 14 have 2+ bookings. Which expression prints the repeat rate correctly?",
      choices: [
        "14 * 100 / 16",
        "100.0 * SUM(CASE WHEN bookings >= 2 THEN 1 ELSE 0 END) / COUNT(*)",
        "AVG(bookings) * 100",
        "100.0 * 16 / 14",
      ],
      answer: 1,
      why: "The conditional sum counts repeat riders inside the same fold that COUNT(*) counts all riders — 14/16 = 87.5 — and 100.0 forces real division before truncation. Both guards in one expression.",
      notes: [
        { choice: 0, why: "INTEGER literals force integer division: 1400/16 = 87 — close here, but any rate under 1% truncates to 0. The habit, not the coincidence, is the point." },
        { choice: 2, why: "AVG(bookings) is the average NUMBER of bookings (about 7.6), not the share of repeat riders — a different metric wearing the same units." },
      ],
      difficulty: "easy",
    },
    {
      id: "grab-mcq-3",
      prompt: "bookings ⋈ order_items fans 103 bookings into 251 line items. On the joined result, which count still measures BOOKINGS?",
      choices: [
        "COUNT(*)",
        "COUNT(product_id)",
        "COUNT(DISTINCT order_id)",
        "COUNT(order_id)",
      ],
      answer: 2,
      why: "After the fan-out, only COUNT(DISTINCT order_id) folds line items back to bookings. COUNT(*) and COUNT(order_id) both count 251 rows — the FK is never NULL — and COUNT(product_id) counts items too.",
      notes: [
        { choice: 1, why: "COUNT(product_id) counts line items — 251. The product FK is NOT NULL, so it equals COUNT(*) and folds nothing." },
        { choice: 3, why: "COUNT(order_id) skips only NULLs. With a NOT NULL FK it's 251 again. DISTINCT is the fold — NULL-skipping never was." },
      ],
      difficulty: "medium",
    },
    {
      id: "grab-mcq-4",
      prompt: "Tier riders by lifetime fares: metro-tier (>= 3000), secondary-tier (>= 1000), frontier (below). Which CASE is exhaustive?",
      choices: [
        "CASE WHEN fares >= 3000 THEN 'metro' WHEN fares >= 1000 THEN 'secondary' END",
        "CASE WHEN fares >= 3000 THEN 'metro' ELSE 'secondary' END",
        "CASE WHEN fares >= 3000 THEN 'metro' WHEN fares >= 1000 THEN 'secondary' ELSE 'frontier' END",
        "CASE WHEN fares > 3000 THEN 'metro' WHEN fares > 1000 THEN 'secondary' ELSE 'frontier' END",
      ],
      answer: 2,
      why: "Cascading WHENs from the top boundary down with a catch-all ELSE leave no hole: 3000-and-above is metro, 1000-to-2999 secondary, everything below frontier. On this db that tiers the whale book (63.5% of revenue sits in the metro band) with no rider unclassified.",
      notes: [
        { choice: 0, why: "A rider under 1000 matches no arm and falls out NULL — the silent third tier that makes every tier total refuse to reconcile with the rider count." },
        { choice: 1, why: "The ELSE swallows the frontier band into 'secondary' — riders below 1000 get the wrong incentive ladder, and no error ever fires." },
      ],
      difficulty: "medium",
    },
    {
      id: "grab-mcq-5",
      prompt: "Bookings carry a completion stamp that is NULL until drop-off. Which pair of counts is the daily 103-versus-82 read?",
      choices: [
        "COUNT(*) versus COUNT(completion_stamp)",
        "COUNT(DISTINCT id) versus COUNT(*)",
        "COUNT(completion_stamp) versus COUNT(status)",
        "SUM(id) versus COUNT(*)",
      ],
      answer: 0,
      why: "COUNT(*) counts every booking (103); COUNT(completion_stamp) counts non-NULL stamps only (82). The 21-row gap IS the in-flight picture — demand placed versus demand finished.",
      notes: [
        { choice: 1, why: "COUNT(DISTINCT id) equals COUNT(*) — ids are unique. Neither expression ever looks at the stamp." },
        { choice: 2, why: "COUNT(status) skips only NULL statuses; status is NOT NULL, so it equals 103. The comparison measures nothing about completion." },
      ],
      difficulty: "medium",
    },
    {
      id: "grab-mcq-6",
      prompt: "A market placed 37 bookings; 3 cancelled. Which expression computes the completion share with no denominator drift?",
      choices: [
        "Filter cancelled rows in WHERE, then 100.0 * COUNT(*) / COUNT(*)",
        "100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*) over ALL placed rows",
        "100 * COUNT(status = 'delivered') / 37",
        "100.0 * COUNT(*) / SUM(status = 'cancelled')",
      ],
      answer: 1,
      why: "Numerator and denominator fold from the same rows: the conditional sum counts completed bookings (21 of 37 in that region), COUNT(*) keeps all 37 placements — cancelled included — and 100.0 prevents integer truncation. Filter first and the denominator shrinks to the numerator's population: the share reads 100% forever.",
      notes: [
        { choice: 0, why: "That's division by itself — denominator drift, the classic COD-era bug: the query returns 100.0 for every market and the review applauds a perfect funnel." },
        { choice: 2, why: "INTEGER 100 truncates the division — and COUNT of a boolean expression is a SQLite-ism that counts non-NULL, i.e. every row, i.e. 100% again." },
      ],
      difficulty: "medium",
    },
    {
      id: "grab-mcq-7",
      prompt: "Cohort table: riders fold to their first-booking month. Which expression computes the month OFFSET that survives a year boundary?",
      choices: [
        "STRFTIME('%m', m) - STRFTIME('%m', first)",
        "(STRFTIME('%Y', m) - STRFTIME('%Y', first)) * 12 + (STRFTIME('%m', m) - STRFTIME('%m', first))",
        "JULIANDAY(m) - JULIANDAY(first)",
        "m - first",
      ],
      answer: 1,
      why: "Months are a base-12 clock: years become ×12, months add the remainder — March 2025 versus November 2024 is 4, not -8. The bare month subtraction goes negative every January; julianday diffs return DAYS, not month indices.",
      notes: [
        { choice: 2, why: "JULIANDAY gives a day count — great for latency, wrong for a cohort matrix whose columns are month offsets. Divide by 30 and watch leap months drift the grid." },
        { choice: 0, why: "'2025-03' minus '2024-11' as month numbers is 3-11 = -8 — the retention matrix silently folds backwards for every year-boundary cohort." },
      ],
      difficulty: "hard",
    },
    {
      id: "grab-mcq-8",
      prompt: "Counting verticals-pairs per rider (rides-with-food, rides-with-mart, …) via self-join. Which predicate counts each pair exactly once?",
      choices: [
        "a.vertical != b.vertical",
        "a.vertical < b.vertical",
        "a.vertical <> b.vertical AND a.rider_id = b.rider_id",
        "No predicate — COUNT(*) already handles it",
      ],
      answer: 1,
      why: "The strict inequality canonicalizes the pair: food<rides survives, rides<food is discarded, self-pairs fail the test outright. != keeps both orientations — every pair counts twice — and without the rider match you're pairing across riders entirely.",
      notes: [
        { choice: 0, why: "Half-right: it kills self-pairs but keeps both orderings — the cross-sell ratio doubles, and doubled growth numbers are how incentive budgets get misspent." },
        { choice: 3, why: "The raw self-join returns N² rows per rider — every vertical paired with itself included. COUNT(*) then reports the square of the truth." },
      ],
      difficulty: "hard",
    },
    {
      id: "grab-mcq-9",
      prompt: "Classify every bill as exact / partial / none in one pass: bills LEFT JOIN captures, then CASE on the folded capture total. Which arm catches the partial capture of 4000 against a 6148 bill?",
      choices: [
        "WHEN COUNT(c.id) > 0 THEN 'exact'",
        "WHEN COALESCE(SUM(c.amount), 0) >= 6148 THEN 'exact' ELSE 'partial'",
        "WHEN SUM(c.amount) IS NOT NULL AND SUM(c.amount) < 6148 THEN 'partial'",
        "WHEN MAX(c.amount) < 6148 THEN 'partial'",
      ],
      answer: 2,
      why: "The partial arm needs BOTH facts: captures exist (the SUM is not NULL) and they fall short of the billed amount — 4000 < 6148. COUNT > 0 calls it exact; a hard-coded 6148 bills only one transaction and misclassifies every other bill in the table.",
      notes: [
        { choice: 0, why: "Counting rows ignores amounts — the 4000-for-6148 bill classifies as 'exact' and the shortfall never reaches payments ops. Coverage is money, not rows." },
        { choice: 3, why: "MAX is the biggest single capture, not the folded total — two captures of 3000 each read as one 3000 capture and the bill flips to 'partial' wrongly." },
      ],
      difficulty: "hard",
    },
    {
      id: "grab-mcq-10",
      prompt: "Which expression buckets TEXT timestamps into the '%Y-%m' month spine?",
      choices: [
        "SUBSTR(created_at, 6, 2)",
        "STRFTIME('%Y-%m', created_at)",
        "DATE(created_at, 'start of month')",
        "STRFTIME('%m', created_at)",
      ],
      answer: 1,
      why: "STRFTIME('%Y-%m', …) prints '2025-02' — the 14-bucket spine every monthly fold here hangs on. The %m-only variant merges Feb-2024 with Feb-2025; SUBSTR(6,2) is the month fragment alone.",
      notes: [
        { choice: 2, why: "DATE(created_at, 'start of month') returns a full date '2025-02-01' — a valid bucket key, but the spine's label format and every join against '%Y-%m' keys breaks." },
        { choice: 3, why: "%m alone drops the year — fourteen months collapse into twelve and two Februaries fold into one bucket, doubling one month's total silently." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-grab-1",
      tier: "medium",
      topic: "j7",
      universe: "growth",
      title: "The whale ledger",
      brief:
        "Grab-flavored brief on the storefront db: the quarterly review opens with the whale ledger — riders whose lifetime fares cross the top-cohort bar, region attached, ranked biggest-first — because the growth story is concentration: 63.5% of revenue comes from riders whose lifetime spend crosses the 3000 bar. Probed facts: exactly four riders carry 13-or-more bookings, and their fares run 7262.35 (24 bookings), 6640.56 (17), 4574.23 (14) and 3644.56 (13). The fold covers ALL placed bookings — cancelled bookings stay in lifetime fares by definition, since the ledger measures what was billed, not what completed. The bar itself is policy: 13 trips, the boundary the growth lead fixed for the top cohort.",
      ask: "Return riders with 13+ bookings: name, region, booking count, and lifetime fares — biggest fares first.",
      template:
        "SELECT c.name,\n       c.region,\n       {1}(*) AS trips,\n       ROUND({2}(o.total), 2) AS fares\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id, c.name, c.region\nHAVING COUNT(*) >= {3}\nORDER BY fares {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the booking counter",
          why: "COUNT(*) counts each rider's booking rows — 24, 17, 14, 13. SUM(*) doesn't exist, and MAX(*) would report one booking, not the trip depth the cohort bar measures.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the lifetime-fares fold",
          why: "SUM(o.total) prices each rider's lifetime book — 7262.35 for the top whale. COUNT(o.total) would print the row count as fares and the ledger would read 24.00.",
        },
        {
          answer: "13",
          kind: "number",
          label: "the top-cohort bar",
          noVerify: true,
          why: "The bar is policy: 13 trips defines the top cohort — exactly the four riders the review opens with. A lower bar drags the 5-booking mid-tier into a whale list nobody budgets against.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first order",
          why: "The ledger reads 7262.35 down to 3644.56. ASC would open the quarterly review with the smallest whale — a correct query that buries the headline.",
        },
      ],
      distractors: ["SUM", "COUNT", "ASC", "5"],
      walkthrough:
        "A concentration read where the gate is policy and the fold is money. The join attaches each booking to its rider, GROUP BY folds per rider — COUNT(*) for trip depth, SUM(o.total) for lifetime fares — and HAVING COUNT(*) >= 13 keeps exactly the top cohort: Alice Chen EU 24 / 7262.35, Emma Wilson US 17 / 6640.56, Grace Kim APAC 14 / 4574.23, Maya Patel APAC 13 / 3644.56. ORDER BY fares DESC is the read order the review expects. The definitional points the interviewer probes: the fold covers ALL placed bookings (cancelled stay in lifetime fares — the ledger is billed, not completed), and the 13-trip bar is the growth lead's policy, visible as a literal so the next analyst can re-tune it deliberately. SUM in the counter slot errors; COUNT in the fares slot prints row counts as money; the 5-bar quietly redefines 'whale' to include a rider at a sixth of the top fare; and ASC flips the deck's opening line.",
    },
    {
      id: "cs-grab-2",
      tier: "easy",
      topic: "l7",
      universe: "month-close",
      title: "The settlement-rail fold",
      brief:
        "Grab-flavored brief on the storefront db: the wallet team closes the week with the settlement fold — how many settlements cleared on each rail and how much moved, biggest rail first. The sample carries two rails: card and direct bank transfer (in production, GrabPay wallet top-ups ride the same rails). Probed facts: 27 settlements in total — card 16 settlements / 37364, transfer 11 / 32248 — and the amounts read integer cents folded to dollars by the /100.0 house rule. The fold is over ALL settlement rows; failed or reversed captures are a different feed and out of scope by definition, which the readout says out loud.",
      ask: "Return each settlement rail with count and settled dollars, biggest rail first.",
      template:
        "SELECT p.method,\n       {1}(*) AS settlements,\n       ROUND({2}(p.amount_cents) / 100.0, 2) AS settled_dollars\nFROM payments p\nGROUP BY p.method\nORDER BY settled_dollars {3};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the rail's settlement counter",
          why: "COUNT(*) folds settlement rows per rail — 16 card, 11 transfer. SUM(*) isn't SQL, and MAX(*) would report one settlement, not the rail's volume.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the settled-amount fold",
          why: "SUM(amount_cents)/100.0 prices the rail — 37364 vs 32248. AVG would print the mean settlement size as the rail's total and the fold would understate both rails by an order of magnitude.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-rail-first order",
          why: "The readout leads with the dominant rail: card 37364 above transfer 32248. ASC would open with the smaller rail — harmless-looking, but the weekly read expects the headline first.",
        },
      ],
      distractors: ["AVG", "MAX", "ASC"],
      walkthrough:
        "A two-bucket money fold with the reconciliation built in. GROUP BY method folds 27 settlement rows into card (16 / 37364) and transfer (11 / 32248), the cents divided by 100.0 so odd-cent captures print honest dollars; 37364 + 32248 = 69612, which reconciles against the ledger's cash-side total — the cross-check the wallet team runs before the number ships. ORDER BY settled_dollars DESC leads with the dominant rail. The scope note is part of the query's meaning: ALL settlement rows fold in, and 'no failed captures in scope' is the sentence that keeps this fold comparable week over week. AVG in the amount slot turns the rail's total into its average ticket — a different metric that happens to share units; MAX reports the single biggest capture as the rail's volume; and ASC inverts the read so the smaller rail leads. The grain discipline the fold teaches: one row per rail, two aggregates, and both computed from the same rows so count and value can never disagree about population.",
    },
  ],

  problems: [
    { slug: "customer-placing-the-largest-number-of-orders", why: "The volume-whale read: who books most, decided on a grouped count — the rider-side opener of the whale ledger." },
    { slug: "repeat-purchase-rate", why: "Share of riders with 2+ bookings — the GrabUnlimited retention headline, computed with an honest same-fold denominator." },
    { slug: "basket-depth-aov", why: "Basket depth and order value in one fold — the GrabFood/GramMart basket health read per city tier." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "The cross-sell gate: riders in two verticals but not the third — the super-app overlap read in graded form." },
    { slug: "find-product-recommendation-pairs", why: "Canonicalized co-occurrence pairs — items that ride together in baskets, counted once via the a < b trick this kit drills." },
    { slug: "bank-account-summary-ii", why: "Credit/debit folds per account — the GrabPay wallet statement: money in, money out, net per rider, cents handled honestly." },
    { slug: "immediate-food-delivery-i", why: "Immediate-fulfilment share — bookings whose promised window matched the delivery date, the GrabFood SLA read." },
    { slug: "immediate-food-delivery-ii", why: "The completion-share rate: conditional count ratio where the denominator is the whole test — Grab's funnel question in textbook form." },
    { slug: "funnel-step-conversion", why: "Step-to-step conversion rates — the acquisition funnel growth reads weekly, denominators printed beside each rate." },
    { slug: "cohort-retention-matrix", why: "Cohort-by-offset retention grid — the month-1 retention matrix the CEO quotes, built with windows over staged folds." },
    { slug: "new-users-daily-count", why: "First-event counting per day — new riders per day via the first-booking definition, the cohort matrix's input fold." },
    { slug: "maximum-transaction-each-day", why: "Peak transaction per day via window — the argmax-over-ties drill for market peak reads, tie-break included." },
    { slug: "spend-histogram", why: "Banded spend distributions — fare and basket histograms that become the city-tier CASE ladders in this kit's topics." },
    { slug: "friday-purchases-i", why: "Weekday-filtered demand — the weekend-surge read via strftime, the calendar topic's core muscle." },
    { slug: "seasonal-sales-analysis", why: "Season CASEs on month buckets — monsoon and festival seasonality, the demand-curve read tiered cities run every quarter." },
    { slug: "game-play-analysis-iv", why: "First-event subquery plus join — riders whose FIRST booking landed in the promo window: the acquisition-cohort definition, computed not asserted." },
  ],
};
