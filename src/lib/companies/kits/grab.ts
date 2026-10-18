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
    "Preparation strategy: Grab has no tagged pool in this app's registry, so the kit curates **thirty-two problems** from the SQL band that mirror its known screen themes — whale and concentration reads, basket cross-sell, funnel completion shares, cohort retention windows, `NULL`-safe wallet folds, and settlement reconciliation — arranged for spaced practice rather than one sitting: a theme a day, revisited until the grain sentence comes before the FROM clause. Then run all six case studies on the live storefront database: the whale ledger and the settlement-rail fold, plus the status pivot by market, the completion-stamp spine, the above-average basket read and the cardless-rider anti-join — each rebuilt with probed figures, each a number the CEO could quote.",
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
      slugs: ["customer-placing-the-largest-number-of-orders", "number-of-rich-customers", "top-earners", "classes-more-than-5-students", "find-followers-count"],
    },
    {
      name: "Repeat behavior & loyalty",
      why: "GrabUnlimited and the incentive budget hang on repeat behavior: share of riders with 2+ bookings, order-frequency cohorts, loyal-customer islands. These are HAVING gates over per-rider folds, and the classic bug is folding the count after a fan-out join has multiplied bookings into line items.",
      slugs: ["repeat-purchase-rate", "customer-order-frequency", "find-loyal-customers", "article-views-ii", "challenges", "consecutive-available-seats"],
    },
    {
      name: "Cross-sell baskets",
      why: "The super-app's growth engine is the basket: which verticals co-occur, which items predict the next order, basket depth per market. Pair and co-occurrence reads are self-joins at two grains with canonicalization (a < b) so every pair counts once — exactly where cross-vertical fan-out punishes the careless.",
      slugs: ["customers-who-bought-a-and-b-not-c", "find-product-recommendation-pairs", "basket-depth-aov", "actors-and-directors-who-cooperated-at-least-three-times", "all-the-matches-of-the-league"],
    },
    {
      name: "Wallet & settlement folds",
      why: "GrabPay's ledger discipline is a SQL discipline: settlements per rail, credits and debits per account, cents folded with /100.0. The screens test whether your money folds balance — per-account nets, month buckets on the settlement calendar, and parity checks between bookings and money.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-i", "odd-and-even-transactions", "capital-gain-loss", "biggest-single-number"],
    },
    {
      name: "Funnel & completion shares",
      why: "Every vertical reports a completion share and every deck reads one: completed ÷ placed, with the denominator question (placed or matched?) decided BEFORE the ratio. Conditional counts and 100.0-before-division are the daily muscles; integer-division truncation is the bug that makes small markets read as zero.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "funnel-step-conversion", "article-views-i"],
    },
    {
      name: "City-tier CASE banding",
      why: "One app, many market tiers: metro, secondary, frontier — each with its own incentive ladder. CASE banding over spend and frequency is how riders and cities get tiered, and the screens check exhaustiveness: a boundary at exactly the threshold, an ELSE that catches everything, and no silent NULL tier.",
      slugs: ["customer-purchasing-behavior-analysis", "calculate-orders-within-each-interval", "spend-histogram", "big-countries", "countries-you-can-safely-invest-in"],
    },
    {
      name: "Ranking the verticals",
      why: "Peak transaction days per market, latest booking per rider, price at the moment of order — Grab reporting is leaderboard and as-of reporting. ROW_NUMBER and RANK with deterministic tie-breaks are drilled because market peaks tie constantly and the LIMIT-1 habit breaks on exactly those ties.",
      slugs: ["maximum-transaction-each-day", "the-most-recent-orders-for-each-product", "product-price-at-a-given-date", "project-employees-i", "nth-highest-salary"],
    },
    {
      name: "Cohorts & retention",
      why: "The CEO quotes month-1 retention, so the screens do too: acquisition-month cohorts folded forward, week-1 new-rider counts, the day-4 activity check. Windows over staged folds — PARTITION BY cohort, offsets by month index — are the shape, and the offset arithmetic on date strings is where candidates leak.",
      slugs: ["cohort-retention-matrix", "new-users-daily-count", "game-play-analysis-iv", "game-play-analysis-i"],
    },
    {
      name: "NULL policy on partial captures",
      why: "A wallet capture can be missing, a completion stamp NULL until drop-off, a forward-fill needed when a feed retries half-empty. Grab screens check whether you treat NULL as a bucket to report, a zero to display, or a data-quality escalation — deliberately, with the policy stated, not by accident.",
      slugs: ["books-with-null-ratings", "null-blank-audit", "change-null-values-in-a-table-to-the-previous-value", "invalid-tweets"],
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
    {
      id: "grab-t9",
      q: "Define MTU — monthly transacting users — and defend the count against the three grains a super-app could report.",
      a: "MTU is distinct RIDERS with at least one completed booking in the calendar month — COUNT(DISTINCT customer_id) over the month fold, 16 on this db. The three defensible grains and why only one is right: bookings placed (an operations number — a rider with five orders counts five times), bookings completed (closer, but still not people), and distinct people (the audience every monetization model consumes). The traps are mechanical: a fan-out join to line items before the DISTINCT inflates nothing — DISTINCT still folds back — but drop the DISTINCT and COUNT(customer_id) counts touchpoints; and counting across verticals without the completed filter turns 'transacting' into 'trying'. The Grab framing: MTU feeds the cross-sell denominator — the share of MTUs who touched two-plus verticals — so a loose MTU definition silently rewrites the growth thesis. Print the definition in the metric's alias: mtu_distinct_riders_completed.",
      tag: "aggregation",
    },
    {
      id: "grab-t10",
      q: "Cashless share: wallet-and-card settlements over all settlements. Where do the numerator and denominator come from, and what makes the ratio defensible in a payments review?",
      a: "Both from the SAME fold, over the SAME rows: the settlement table grouped by rail, the numerator a conditional sum or FILTER count over card-and-wallet rows, the denominator COUNT(*) over every settled row — 16 card of 27 on this db, 59.3%. The defensibility checklist: the population is settlements, not bookings — a booking with no settlement row yet is out of scope by definition and the readout says so; failed or reversed captures are a different feed, excluded with the exclusion printed; and the division carries 100.0 so small markets don't truncate to zero. The failure that ends the review: computing the numerator from one table and the denominator from another with different WHERE windows — the ratio then pairs unlike populations and no reconciliation catches it, because both numbers are individually true. Cashless share is the GrabPay migration headline; its SQL has to survive being re-run by the person whose bonus depends on it.",
      tag: "aggregation",
    },
    {
      id: "grab-t11",
      q: "Which riders have never opened GrabMart? Sketch the query and explain why INNER JOIN and HAVING can't get there.",
      a: "The anti-join: LEFT JOIN mart_orders m ON m.rider_id = r.id, keep the rows WHERE m.rider_id IS NULL — every rider survives the join, and the ones with no mart match are exactly the unopened-whale list the mart team retargets. INNER JOIN is structurally incapable: it keeps only matched riders, which is the complement of the question. HAVING COUNT(m.order_id) = 0 almost works but dies on a technicality — a rider with zero mart orders folds to zero ROWS after the join, so the group never exists to be filtered; HAVING gates groups that survived, not populations that vanished. The discipline that makes it interview-grade: say what survives BEFORE writing the join — riders (all 16), matched or not — and note that the IS NULL test must target a column from the RIGHT table that's non-NULL when a match exists, usually the key. The super-app stakes: this list IS the cross-sell pipeline, and it's the one population an INNER-join dashboard can never show.",
      tag: "joins",
    },
    {
      id: "grab-t12",
      q: "The panel needs each booking's fare BESIDE its region's total GMV and the booking's share of it. Fold or window — and why?",
      a: "Window, because the deliverable keeps every row. SUM(total) OVER (PARTITION BY region) computes each region's GMV and attaches it to every booking in that region — 103 rows out, each carrying its region total and the ratio total/GMV beside it. The fold equivalent needs two layers: GROUP BY region for the totals, then a join back to bookings — two scans, a join, and a grain decision to defend. The window does it in one pass with no grain ambiguity, because PARTITION BY region IS the grain statement. The traps: an empty ORDER BY inside OVER is fine here (aggregate windows don't order), but mixing the windowed share into a WHERE won't work — window results are computed after WHERE, so filter on the share needs the staged-layer treatment; and ROUND the share at the display edge, once, because 0.934562 in a deck reads as false precision. The Grab habit: whale panels show each rider's fare beside region GMV so concentration is visible per row — the 63.5% headline and its evidence in one scan.",
      tag: "windows",
    },
    {
      id: "grab-t13",
      q: "Repeat cadence: how many days between each rider's consecutive orders? Which window, and what are the edge rows?",
      a: "LAG over time-ordered, rider-partitioned bookings: LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id) puts each order's predecessor beside it, and JULIANDAY(created_at) - JULIANDAY(prev) gives the gap in days — round once at the end for the average cadence. The edge rows are the FIRST order of each rider's history: the LAG comes back NULL, and that NULL is meaningful — 'no predecessor yet', not zero days — so cadence averages use AVG over the non-NULL gaps, which AVG already handles by skipping NULLs. The ordering must be deterministic (created_at, then id) or same-timestamp orders produce arbitrary gaps; and the window is per-rider by construction — PARTITION BY is what stops rider A's order from becoming rider B's predecessor. The Grab use: month-1 retention diagnostics — riders whose cadence stretches past the repurchase window get the nudge budget. The graded sentence: 'the NULL first-order row is the cohort entry, and I exclude it from cadence, not from the cohort.'",
      tag: "windows",
    },
    {
      id: "grab-t14",
      q: "Your cohort-retention query is getting copied into three decks and drifting. How do you structure it so there's one definition and three consumers?",
      a: "Stage the definition once in a CTE and make every consumer read from it. The shape: WITH first_orders AS (per-rider MIN month — the cohort key), monthly_activity AS (rider-month folds with the offset arithmetic), cohort_matrix AS (the join back, actives by cohort by offset) — then the deck queries SELECT from cohort_matrix, and 'month-1 retention' exists in exactly one place. The anti-pattern is three hand-rolled queries with three subtly different cohort definitions — one used first-order month, one used first-COMPLETED month, one used signup month — and the decks disagree in the meeting. Name the CTEs for the definitions they carry, version them when the definition changes (first_orders_v2), and keep the offset arithmetic (the ×12 year-bridge) inside the CTE so nobody re-derives it with a different formula. The payments-grade rule: a number that appears in three decks with one query behind it is a metric; with three queries behind it, it's three metrics wearing one name — and the CEO quotes the wrong one.",
      tag: "subqueries",
    },
    {
      id: "grab-t15",
      q: "Tier riders by lifetime fares, then report rider counts per tier. Why does this need two folds, and what does the staged version guarantee?",
      a: "Because lifetime fares exist at rider grain and tier counts exist at tier grain — one query folds one grain cleanly. Layer one: GROUP BY customer with SUM(total) AS lifetime — one row per rider, all 16. Layer two: the staged set becomes input, and a CASE bands lifetime into metro/secondary/frontier, then GROUP BY the band folds AGAIN for counts and average lifetime per tier. One-layer alternatives all leak: banding per BOOKING and summing counts conflates bookings with riders; CASE over SUM inside the rider fold can print counts only with a second GROUP BY on the CASE expression, and any stray per-row column becomes an engine-dependent wild value. The staged version guarantees two reconciliations: layer one's row count equals the rider population (16), and layer two's tier counts sum back to 16 — the chain that proves nobody fell into a NULL band. That's the whole architecture of the tier ladder: two grains, two layers, named stages, and the counts reconcile before the deck ships.",
      tag: "groupby",
    },
    {
      id: "grab-t16",
      q: "The ops deck wants completed, underway, awaiting and cancelled as COLUMNS per region — one row per market. How do you build the pivot, and why not four queries?",
      a: "Conditional aggregation is the pivot: SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS completed — one arm per status, all in the same SELECT, GROUP BY region folding one row per market. One scan, one pass, and the columns reconcile by construction: the four arms sum to COUNT(*) per region — EU 24+12+6+3 = 45 — the internal audit the deck checks before printing. Four separate queries produce four result sets someone pivots by hand in a spreadsheet, which is where the definitions drift: one query filtered completed differently, and the rows no longer sum. The mechanical edges: every arm needs the ELSE 0 so empty markets print 0 instead of NULL; the status literals are the platform's vocabulary, not adjectives — 'delivered' is a value, 'complete' is a typo that silently sums to zero; and the fold is at booking grain with the region attached by join BEFORE the CASE, or the fan-out debate starts. Pivots are just CASE arms with discipline.",
      tag: "groupby",
    },
    {
      id: "grab-t17",
      q: "The wallet ledger: credits and debits per account, in cents. How do you produce the statement, and where does the balance go wrong?",
      a: "Fold per account with the sign in the data, not the query: SUM(CASE WHEN type = 'credit' THEN amount_cents WHEN type = 'debit' THEN -amount_cents ELSE 0 END) AS net_cents — one pass, one row per account, credits minus debits in integer cents, converted to dollars once at the edge with /100.0. The running statement adds the window: SUM over the account partition ordered by posted time with an explicit ROWS frame gives the balance-after-each-transaction column a statement reader expects. Where it goes wrong: integer division per row (a 4355-cent top-up reading 43 dollars forever), sign logic in the WHERE instead of the CASE (filtering debits out and calling the remainder a balance), and NULL amount rows coalesced to zero mid-pipeline so a missing amount becomes a silent non-event. The Grab discipline: the ledger's closing balance must equal the fold of its entries to the cent — the same reconciliation the cost stack ships with — because a wallet that doesn't reconcile isn't a product, it's an incident.",
      tag: "aggregation",
    },
    {
      id: "grab-t18",
      q: "A capture row exists with amount NULL, and another bill shows status 'paid' with zero settlement rows. What's your reporting policy for each?",
      a: "Two different NULLs, two different treatments. The NULL amount on an existing capture row is 'bad data' — the row exists but its money is unknown — so it escalates to the feed owner and the reconciliation reports it as its own bucket, never as zero: coalescing it to 0 launders an unknown into a settled fact and the ledger balances against nothing. The paid-status-with-no-settlement-rows bill is 'none' coverage — a CLAIM of money with no evidence — and the classification query exists precisely to surface it: LEFT JOIN bills to captures, COUNT the matched rows, and the zero-count bucket goes to collections with the billed amount attached. The shared discipline: NULL is a population to REPORT, not a value to replace — report 'unknown amount' and 'no captures' as named buckets, decide the treatment per bucket with the business, and never let a COALESCE inside the pipeline make the decision silently. At a wallet company the difference between 'we don't know' and 'zero' is the difference between a query ticket and a fraud review.",
      tag: "nulls",
    },
    {
      id: "grab-t19",
      q: "Monsoon seasonality: demand reads by month and weekday across markets. How do you build the calendar spine, and where does it break?",
      a: "The spine is STRFTIME('%Y-%m', created_at) for months and STRFTIME('%w', created_at) for weekday — 0 through 6, Sunday first, a fact half of every analyst's CASE forgets. Seasonality rides the spine: CASE WHEN month IN ('11','12','01','02') THEN 'monsoon' — the monsoon windows differ by market, so the CASE carries the market's calendar, not a global one, and the season definition prints next to the query. The breaks are the classics: TEXT timestamps declare no timezone, so 'November' in Jakarta and Manila starts at different hours — state the convention before the bucket; weekday arithmetic on '%w' needs the mapping table or a comment; and BETWEEN on the season's last day drops the final evening, which in monsoon season is the surge peak. The tiered-city twist: fold per market tier, never globally — one super-app's average hides two opposite demand curves. The calendar read is a definition read: monsoon is whatever the ops calendar says it is, and the query says it too.",
      tag: "dates",
    },
    {
      id: "grab-t20",
      q: "Five bills were settled across two capture rows each. Do you fold them for the reconciliation? Defend the call.",
      a: "Fold them for the COVERAGE read, never for the reconciliation's evidence. The coverage classification — exact, partial, none per bill — needs the TOTAL captured against each bill, so SUM over the bill's capture rows is correct: two captures of 3074 against a 6148 bill classify 'exact' only when folded. But the reconciliation's detail keeps both rows: folding at display grain is fine, folding before the anomaly check hides the shape — split settlements are a behavior payments ops tracks, because the second capture is where timeouts and retries live. If a view needs one row per bill, ROW_NUMBER() OVER (PARTITION BY bill ORDER BY captured_at DESC, id DESC) picks a representative deterministically — for display, with the split count beside it. What's forbidden is folding captures into one row and then calling it 'the settlement record': the shortfall you exist to find lives in the gap between billed and captured, and both parts of that gap must remain inspectable. Fold for totals, keep the rows for truth.",
      tag: "quality",
    },
    {
      id: "grab-t21",
      q: "The board asks: what happens to GMV if our top rider churns? How do you answer with SQL, honestly?",
      a: "Quantify the dependency, don't dramatize it. The read: per-rider lifetime fares folded, ordered descending, then the top rider's share — SUM over the one rider divided by the platform total with 100.0 — and the same for the top-N cohort. On this db the four 13-plus riders already carry 63.5% of revenue, so the honest answer is a curve: top-1 share, top-4 share, and the revenue-weighted read beside the audience-weighted one (four riders is a quarter of 16 — the concentration is real, not marketing). Then the scenario layer the board actually wants: recompute total GMV excluding the top rider — one WHERE customer_id != (the argmax) — and print the delta. The honesty rules: state whether lifetime fares include cancelled bookings (they do — billed, not completed), and label the scenario a STATIC what-if (no replacement demand, no basket effects) because the board will otherwise read it as a forecast. The SQL is three folds; the credibility is in the printed definitions.",
      tag: "aggregation",
    },
    {
      id: "grab-t22",
      q: "City tiers: metro at 3000 lifetime fares, secondary at 1000, frontier below. What makes the CASE banding review-proof?",
      a: "Cascading order, a catch-all ELSE, and boundaries printed as literals. The arms read top-down: WHEN fares >= 3000 THEN 'metro', WHEN fares >= 1000 THEN 'secondary', ELSE 'frontier' — a rider at exactly 3000 lands metro by the first arm, and the ELSE guarantees the frontier band absorbs everything below 1000, so no rider falls into a NULL tier that would make tier counts refuse to sum to 16. The review-proof extras: the thresholds appear as literals in the query (they're the pricing team's policy, and the reviewer re-tunes them deliberately); the banding runs on the STAGED per-rider fold, never per booking; and a NULL-fare rider would fail every comparison — arms with >= never match NULL — so the fold either coalesces NULLs to 0 at the staging edge with the choice printed, or reports an 'unbanded' bucket. The classic failure is the gap version: WHEN fares > 3000 … WHEN fares > 1000 … with no ELSE — boundary riders and everyone below go NULL, and the tier totals go quiet. Tiers are policy; the query is where the policy gets audited.",
      tag: "groupby",
    },
    {
      id: "grab-t23",
      q: "Cross-sell exclusion: riders who used rides but NOT food. NOT EXISTS or NOT IN — and what silently breaks the other one?",
      a: "NOT EXISTS, always, for the negated shape. NOT EXISTS (SELECT 1 FROM food_orders f WHERE f.rider_id = r.id) is NULL-immune by construction: the correlation IS the match test, and a NULL rider_id in the inner table simply never matches — the rider stays in the exclusion list, correctly. NOT IN (SELECT rider_id FROM food_orders) has the famous failure: one NULL in the inner fold and the outer comparison becomes UNKNOWN for every row — the entire exclusion list returns EMPTY, silently, on a query that looks fine. The positive direction is safer: IN and EXISTS are interchangeable semijoins, choose by readability. The Grab stakes are concrete: the ride-but-not-food list IS the food team's retargeting audience — a NULL-poisoned NOT IN doesn't crash the campaign, it ships an empty audience file that nobody notices until the conversion rate divides by zero. The rule the screens grade: negated membership gets NOT EXISTS or LEFT JOIN … IS NULL; 'it worked on the sample' is not a defense when the inner table gains its first NULL.",
      tag: "subqueries",
    },
    {
      id: "grab-t24",
      q: "Manila's feed lands two hours after Singapore's. The morning board reads both as 'yesterday'. What's the freshness discipline across markets?",
      a: "Every read carries its cutoff, and cutoffs are compared, never merged silently. The mechanics: MAX(created_at) per feed per market — the freshness census — printed on the board next to every number, so 'yesterday' means 'through 23:00 SGT' for Singapore and 'through 21:00 SGT' for Manila until the late feed lands. The policy layer: each panel declares whether it restates (the number moves when the late feed arrives — the deck says 'restated') or freezes (the number closes at cutoff — the deck says 'as of'), and the choice is made once per metric, in writing. The super-app twist is the JOIN across feeds: a cross-vertical read joins rides and food tables with different lag profiles, and the honest fold restricts BOTH to the earlier cutoff — otherwise the food number benefits from two more hours of arrivals and the comparison flatters whichever feed is fresher. The TEXT-timestamp caveat rides on top: no timezone declared means the convention is the query's job to state. A board without cutoffs isn't a board — it's a collage.",
      tag: "etl",
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
    {
      id: "grab-mcq-11",
      prompt: "The growth panel prints each rider's verticals as ONE cell — 'rides, food, mart'. Which fold builds it?",
      choices: [
        "SUM(vertical) GROUP BY rider",
        "GROUP_CONCAT(DISTINCT vertical) with GROUP BY rider",
        "CONCAT(vertical) without grouping",
        "COUNT(DISTINCT vertical) cast to text",
      ],
      answer: 1,
      why: "GROUP_CONCAT folds a rider's many rows into one delimited string cell, and DISTINCT keeps repeat bookings from printing 'rides, rides, food'. CONCAT without grouping concatenates per ROW — one value — and SUM of text is type nonsense.",
      notes: [
        { choice: 0, why: "Verticals are text; SUM produces either an error or a zero. Even over numeric flags it returns a total, never the list of names." },
        { choice: 3, why: "That prints the NUMBER of verticals (3), not WHICH ones — the retargeting team can't email the integer 3." },
      ],
      difficulty: "easy",
    },
    {
      id: "grab-mcq-12",
      prompt: "Which riders have NEVER placed a GrabMart order? The mart team wants the retargeting list. Which query returns it?",
      choices: [
        "INNER JOIN mart_orders — matched riders are the pipeline",
        "LEFT JOIN mart_orders … WHERE mart_orders.rider_id IS NULL",
        "HAVING COUNT(mart_order_id) = 0 after the join",
        "WHERE mart_orders.rider_id != rider_id",
      ],
      answer: 1,
      why: "The LEFT JOIN … IS NULL anti-join keeps every rider and filters to the ones whose mart columns all came back NULL — exactly the never-ordered population. INNER keeps the complement; HAVING can't see riders whose fold produced zero rows.",
      notes: [
        { choice: 0, why: "INNER JOIN returns riders WITH mart orders — the opposite list. The never-ordered population is the one INNER JOIN cannot produce." },
        { choice: 2, why: "A rider with no mart rows folds to no GROUP at all — zero-row groups don't exist to be HAVING'd. The list ships empty forever." },
      ],
      difficulty: "easy",
    },
    {
      id: "grab-mcq-13",
      prompt: "The fraud desk needs the single biggest wallet capture with its full row — amount, rail, timestamp. Which shape?",
      choices: [
        "MAX(amount_cents) by itself",
        "ORDER BY amount_cents DESC LIMIT 1",
        "TOP 1 *",
        "COUNT(*) ORDER BY amount_cents",
      ],
      answer: 1,
      why: "ORDER BY … LIMIT 1 returns the whole row — amount AND rail AND timestamp — which is what an investigation needs. MAX(amount_cents) alone proves the number exists but orphans it from the evidence.",
      notes: [
        { choice: 0, why: "The amount without its rail and timestamp is a number, not a lead. Fraud reviews live on the surrounding row." },
        { choice: 2, why: "TOP is T-SQL syntax — SQLite parses neither it nor the habit. Portability aside, it adds nothing ORDER BY … LIMIT 1 doesn't." },
      ],
      difficulty: "easy",
    },
    {
      id: "grab-mcq-14",
      prompt: "Tier riders by LIFETIME fares: metro (>= 3000), secondary (>= 1000), frontier below. Where must the banding run?",
      choices: [
        "In WHERE, before the fold — filter early",
        "On the staged per-rider fold — band the SUM(total) result, then fold tiers",
        "Per booking, since bookings carry the fares",
        "In HAVING, since tiers are groups",
      ],
      answer: 1,
      why: "Lifetime fares exist only at rider grain, so the banding runs on the staged fold: GROUP BY rider with SUM(total) first, then CASE over the folded value, then the tier fold. Banding per booking counts bookings, not riders — the metro tier would fill with repeat bookers.",
      notes: [
        { choice: 0, why: "WHERE can't see the fold at all — and even row-level spend filters change who reaches 3000 lifetime, silently re-tiering the market." },
        { choice: 3, why: "HAVING gates folded groups; the tier banding isn't a gate, it's a classification of the fold's output. Two layers, two jobs." },
      ],
      difficulty: "easy",
    },
    {
      id: "grab-mcq-15",
      prompt: "The 9.9 promo cohort = riders whose FIRST booking landed in March. Which window predicate keeps March's final midnight orders?",
      choices: [
        "BETWEEN '2025-03-01' AND '2025-03-31'",
        "created_at >= '2025-03-01' AND created_at < '2025-04-01'",
        "SUBSTR(created_at, 6, 2) = '03'",
        "STRFTIME('%m', created_at) = '03'",
      ],
      answer: 1,
      why: "The half-open interval [Mar 1, Apr 1) is the only shape that keeps March 31's evenings — historically the promo's biggest night — because BETWEEN '2025-03-31' cuts off at midnight of the 31st. The %m variants merge March 2024 with March 2025 into one bucket.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive of the endpoint string — '2025-03-31 21:14' sorts after '2025-03-31' and falls out. The cohort loses its best evening and month-1 retention measures a smaller population." },
        { choice: 3, why: "Month-only spine, year-less filter: every March since signup qualifies. The cohort doubles and the retention curve flattens." },
      ],
      difficulty: "easy",
    },
    {
      id: "grab-mcq-16",
      prompt: "MTU: distinct riders with 1+ completed booking this month. The bookings ⋈ line_items join fans 103 bookings into 251 rows. Which expression still counts PEOPLE?",
      choices: [
        "COUNT(*)",
        "COUNT(customer_id)",
        "COUNT(DISTINCT customer_id)",
        "SUM(customer_id)",
      ],
      answer: 2,
      why: "After the fan-out, only DISTINCT folds touchpoints back to people: a rider with five orders and twenty line items counts once. COUNT(customer_id) counts 251 — the FK is never NULL — and SUM adds ids together, which is arithmetic without a question.",
      notes: [
        { choice: 1, why: "COUNT of a NOT NULL FK equals COUNT(*) — 251 touchpoints. The audience metric just quintupled for active riders." },
        { choice: 3, why: "SUM(customer_id) adds internal ids — a number that changes if ids are reassigned. Metrics shouldn't depend on surrogate key values." },
      ],
      difficulty: "easy",
    },
    {
      id: "grab-mcq-17",
      prompt: "Repeat cadence: days between each rider's consecutive orders. Which window expression produces the per-order gap?",
      choices: [
        "JULIANDAY(created_at) - MIN(created_at) OVER ()",
        "JULIANDAY(created_at) - LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id)",
        "DATEDIFF(created_at, LAG(created_at))",
        "AVG(created_at) OVER (PARTITION BY customer_id)",
      ],
      answer: 1,
      why: "LAG fetches each order's predecessor within the rider partition, ordered deterministically — the diff is the gap. MIN OVER () measures distance from the rider's FIRST order, a different (monotonic) metric, and DATEDIFF isn't SQLite.",
      notes: [
        { choice: 0, why: "That's 'days since first order' — cumulative, never negative, and blind to gaps between consecutive orders. Useful elsewhere; wrong here." },
        { choice: 3, why: "AVG of timestamps is a meaningless midpoint date. Cadence needs the predecessor, which is LAG's entire job." },
      ],
      difficulty: "medium",
    },
    {
      id: "grab-mcq-18",
      prompt: "The month-close stack unions four branches; the third branch projects (amount, category) while its siblings project (category, amount). What happens?",
      choices: [
        "SQLite matches columns by name and aligns them",
        "The stack succeeds with columns swapped in that branch — text in the money column, money in the category column",
        "The query always errors on column-count mismatch",
        "UNION ALL sorts each branch to a canonical order first",
      ],
      answer: 1,
      why: "Set ops align by POSITION: same count, and values land wherever position puts them — the misaligned branch still 'runs' and prints garbage into otherwise-valid columns. The count must match; the names are ignored entirely.",
      notes: [
        { choice: 0, why: "Name-matching is a JOIN concept. UNION ALL never reads branch aliases — that's why the discipline is copy-the-SELECT-list-verbatim." },
        { choice: 2, why: "Column-COUNT mismatch errors; column-ORDER mismatch does not. The silent one is the dangerous one, and it's the order." },
      ],
      difficulty: "medium",
    },
    {
      id: "grab-mcq-19",
      prompt: "Flag baskets above the platform average basket. Which query is the benchmark done right?",
      choices: [
        "WHERE basket > (SELECT AVG(basket) FROM baskets)",
        "WHERE basket > AVG(basket)",
        "HAVING basket > (SELECT AVG(basket) FROM baskets)",
        "WHERE basket > MAX(basket) / 2",
      ],
      answer: 0,
      why: "The scalar subquery computes the platform average once and every row compares against it — the benchmark is a fixed number, so the comparison is stable. AVG(basket) bare in WHERE references an aggregate that doesn't exist at row scope, and HAVING is for post-fold group predicates.",
      notes: [
        { choice: 1, why: "Aggregates in WHERE fail to parse — the engine says 'misuse of aggregate' and stops. The fix is computing the average in its own scope first." },
        { choice: 3, why: "Half the max is not the average — one 400 whale basket drags the bar to 200 and flags half the catalog. Benchmarks are means (or medians), never max-derivations." },
      ],
      difficulty: "medium",
    },
    {
      id: "grab-mcq-20",
      prompt: "Each booking row must carry its REGION's total GMV beside the fare. Which expression computes it?",
      choices: [
        "SUM(o.total) GROUP BY region",
        "SUM(o.total) OVER (PARTITION BY region)",
        "MAX(o.total) OVER (ORDER BY region)",
        "COUNT(o.total) OVER (PARTITION BY region)",
      ],
      answer: 1,
      why: "The windowed SUM with PARTITION BY region attaches each region's folded total to every booking row in that region — the fold's answer beside the row-level detail, one scan. The bare GROUP BY collapses to one row per region and loses the bookings.",
      notes: [
        { choice: 0, why: "Right value, wrong shape: 4 rows instead of 103, and the per-booking context the panel renders is gone." },
        { choice: 2, why: "MAX is the biggest single fare, not the region total — and ORDER BY region without PARTITION creates one running island, not per-region totals." },
      ],
      difficulty: "medium",
    },
    {
      id: "grab-mcq-21",
      prompt: "The ops deck wants one row per city with completed / underway / awaiting / cancelled as named COLUMNS. Why is conditional aggregation the right build?",
      choices: [
        "It runs four scans in parallel",
        "All four arms fold the same rows in one pass, and the arms sum to COUNT(*) per city — reconciliation is built in",
        "CASE makes the query faster than GROUP BY status",
        "It avoids joins entirely",
      ],
      answer: 1,
      why: "Each SUM(CASE …) arm counts its own status over the SAME city fold — one row per city, four named columns, and the arms summing to the placed total (EU 24+12+6+3 = 45) is the audit the deck runs before printing. GROUP BY status gives a COLUMN of rows that someone pivots by hand.",
      notes: [
        { choice: 2, why: "CASE is clarity, not speed — the win is the single pass and the reconciling columns, not CPU." },
        { choice: 3, why: "The city name still comes from a join to the rider table; conditional aggregation changes the SHAPE of the fold, not the need for the join." },
      ],
      difficulty: "medium",
    },
    {
      id: "grab-mcq-22",
      prompt: "A wallet capture with no amount should display '—', while the ledger's arithmetic treats it as unknown. Where does COALESCE belong?",
      choices: [
        "COALESCE(amount, 0) inside the fold, so totals stay clean",
        "COALESCE(amount, '—') at the display layer only",
        "COALESCE everywhere — defense in depth",
        "No COALESCE: replace the NULL in the table",
      ],
      answer: 1,
      why: "The display edge is where NULL becomes a glyph; the pipeline keeps it NULL so 'unknown amount' stays distinguishable from 'zero amount' in every fold, filter and reconciliation downstream. Coalescing in the fold turns an unknown into a settled fact the ledger will balance against.",
      notes: [
        { choice: 0, why: "That's the laundering move: the capture now sums as zero, the bill reads short by exactly the unknown, and payments ops chases money that was never measured." },
        { choice: 3, why: "Rewriting the table destroys the evidence that the amount was ever missing. Guard at read time; fix at the source." },
      ],
      difficulty: "medium",
    },
    {
      id: "grab-mcq-23",
      prompt: "City ops wants riders banded into five equal-sized tiers by monthly bookings — bands 1 through 5. Which function is purpose-built?",
      choices: [
        "ROW_NUMBER() OVER (ORDER BY bookings)",
        "NTILE(5) OVER (ORDER BY bookings)",
        "MOD(bookings, 5)",
        "ROUND(bookings * 5.0 / MAX(bookings))",
      ],
      answer: 1,
      why: "NTILE(5) distributes the folded rows into five as-equal-as-possible buckets — the definition of quintiles, tie-tolerant and boundary-safe. ROW_NUMBER makes 16 distinct rungs (a leaderboard, not bands), MOD is remainder arithmetic, and the max-scaled ratio breaks on ties and outlier whales.",
      notes: [
        { choice: 0, why: "Every rider gets a unique ordinal — two riders with identical booking counts land in different bands, which the tier ladder never intends." },
        { choice: 3, why: "One whale at 24 bookings compresses everyone else into band 1 — the ratio inherits the outlier the bands were meant to smooth over." },
      ],
      difficulty: "hard",
    },
    {
      id: "grab-mcq-24",
      prompt: "A rolling 7-day GMV curve over per-day folds must step once per DAY, not per peer group. Which frame?",
      choices: [
        "OVER (ORDER BY day) — default behavior is fine",
        "OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)",
        "OVER (PARTITION BY day ORDER BY day)",
        "OVER (ORDER BY day RANGE BETWEEN 7 PRECEDING AND CURRENT ROW)",
      ],
      answer: 1,
      why: "ROWS counts physical rows — exactly seven day-folds — regardless of ties in the ordering value. The default RANGE frame admits every peer sharing the day, so a per-vertical stack makes GMV jump by whole peer groups; RANGE with numeric offsets compares values, not positions.",
      notes: [
        { choice: 0, why: "The default is RANGE UNBOUNDED PRECEDING — a cumulative curve from day one. The 'rolling' panel plots history, not the window." },
        { choice: 2, why: "PARTITION BY day isolates each day — the running sum resets daily and the curve is flat by construction." },
      ],
      difficulty: "hard",
    },
    {
      id: "grab-mcq-25",
      prompt: "The cross-sell exclusion query — riders with rides but NOT food — uses NOT IN and returns ZERO rows. The food table has one NULL rider_id. What happened?",
      choices: [
        "The join key is wrong",
        "NOT IN with a NULL in the inner list makes every comparison UNKNOWN — the whole result silently empties",
        "The outer table is empty",
        "NOT IN requires an index",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE: either x matches a value (FALSE) or the NULL comparison yields UNKNOWN — so every row fails the filter. The fix is NOT EXISTS or LEFT JOIN … IS NULL, which are NULL-immune by construction.",
      notes: [
        { choice: 0, why: "The join isn't the problem — there IS no join; NOT IN is a membership test. The NULL in the LIST is the poison." },
        { choice: 2, why: "The outer table has the riders — the retargeting audience — and the empty result hides them. Silent emptiness is why this trap ends interviews." },
      ],
      difficulty: "hard",
    },
    {
      id: "grab-mcq-26",
      prompt: "Cross-sell sequencing: food orders placed within 7 days AFTER a ride, per rider. Which shape finds them?",
      choices: [
        "A self-join on rider_id with a.date <= b.date and the gap bounded — canonicalized so each pair counts once",
        "COUNT(*) over the fan-out join",
        "GROUP BY rider HAVING COUNT(*) > 1",
        "WHERE service = 'food' AND rider is active",
      ],
      answer: 0,
      why: "The time-bounded self-join pairs each food order with earlier rides of the same rider — a < b ordering (or LAG) gives direction, the gap predicate gives 'within 7 days', and canonicalization stops double-counting. COUNT over the fan-out counts touchpoints; HAVING > 1 proves reuse but not sequence.",
      notes: [
        { choice: 1, why: "The fan-out counts every ride-order pair as rows — with no time direction, a food order 'before' its ride pairs just as happily. Cross-sell is an ordering story." },
        { choice: 2, why: "Multi-use riders include ride-then-ride and food-then-food. The conversion flag would fire on populations that never converted." },
      ],
      difficulty: "hard",
    },
    {
      id: "grab-mcq-27",
      prompt: "A bill settled in two captures appears twice in the settlement view. Which pick keeps ONE row per bill, reproducibly?",
      choices: [
        "SELECT DISTINCT bill_id FROM settlements",
        "GROUP BY bill_id with MAX(amount)",
        "ROW_NUMBER() OVER (PARTITION BY bill_id ORDER BY captured_at DESC, id DESC) = 1",
        "LIMIT 1 per bill",
      ],
      answer: 2,
      why: "ROW_NUMBER with a deterministic tie-break picks one representative row per bill — same input, same survivor, every refresh. DISTINCT collapses only fully-identical rows; MAX collapses the amount but orphans its row; LIMIT applies once to the whole result, not per group.",
      notes: [
        { choice: 0, why: "Two captures differing in timestamp or id both survive DISTINCT — the bill still prints twice and the reconciliation still double-counts." },
        { choice: 3, why: "LIMIT is global. 'Per group' limits need a ranking window — that's the whole reason keep-latest exists." },
      ],
      difficulty: "hard",
    },
    {
      id: "grab-mcq-28",
      prompt: "Which query finds riders EVERY booking of which was wallet-paid — no cash, ever?",
      choices: [
        "INNER JOIN wallet_payments — paid riders only",
        "WHERE NOT EXISTS (any non-wallet payment for that rider)",
        "HAVING MIN(method) = 'wallet'",
        "WHERE COUNT(method = 'wallet') = COUNT(*)",
      ],
      answer: 1,
      why: "The double-negative — no row EXISTS that violates the rule — is how 'every' is expressed in SQL: the anti-join over the violating population. MIN(method) tests alphabetical order, not payment mix, and COUNT of a boolean is a SQLite-ism that counts non-NULLs.",
      notes: [
        { choice: 0, why: "INNER returns riders with AT LEAST ONE wallet payment — one wallet ride and ten cash rides qualify. 'Every' needs the absence proof." },
        { choice: 3, why: "Aggregates can't live in WHERE at all — and even in HAVING, COUNT(method = 'wallet') counts every non-NULL result, i.e. everything." },
      ],
      difficulty: "hard",
    },
    {
      id: "grab-mcq-29",
      prompt: "Cumulative GMV by month steps in whole peer groups because two months' folds share a label. Diagnosis?",
      choices: [
        "The engine dropped rows",
        "The default RANGE frame includes peers — same-label rows join the running total together",
        "SUM can't be windowed over aggregates",
        "Float rounding at the 100.0 conversion",
      ],
      answer: 1,
      why: "OVER (ORDER BY month) without a declared frame defaults to RANGE, which admits every row sharing the ordering value — per-vertical stacks with duplicate month labels step together. Declare ROWS BETWEEN … PRECEDING AND CURRENT ROW and each row moves the total individually.",
      notes: [
        { choice: 0, why: "Nothing is dropped — too much arrives per step. Peer-group jumps are the RANGE fingerprint." },
        { choice: 2, why: "SUM windows over any numeric expression, including folded values — the stage-then-window shape is standard. The bug is the frame, not the function." },
      ],
      difficulty: "hard",
    },
    {
      id: "grab-mcq-30",
      prompt: "'Latest capture per bill' via a MAX(captured_at) join returns TWO rows for one bill — two captures share the timestamp. Fix?",
      choices: [
        "Add DISTINCT to the query",
        "Switch to ROW_NUMBER() OVER (PARTITION BY bill ORDER BY captured_at DESC, id DESC) = 1",
        "Use MAX(id) instead of MAX(captured_at)",
        "Accept both rows — ties are information",
      ],
      answer: 1,
      why: "The MAX-join matches EVERY row sharing the maximum — the bill's history doubles and the coverage fold double-counts. ROW_NUMBER with the id tie-break keeps exactly one deterministically, so the report regenerates identically.",
      notes: [
        { choice: 0, why: "DISTINCT only collapses fully-identical rows — two captures differing in amount or id both survive. The disease outlives the treatment." },
        { choice: 2, why: "MAX(id) picks the newest INSERT, which may not be the latest capture — backfills and retries break the equivalence. Rank on the business time, tie-break on the id." },
      ],
      difficulty: "hard",
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
    {
      id: "cs-grab-3",
      tier: "medium",
      topic: "s7",
      universe: "funnel",
      title: "The status pivot by market",
      brief:
        "Grab-flavored brief on the storefront db: the weekly business review reads one row per market with the funnel as named columns — completed, underway, awaiting, cancelled — because tiered markets are compared side by side, never as a stacked list. Probed facts: EU 24 completed / 12 underway / 6 awaiting / 3 cancelled (45 placed), APAC 21 / 8 / 5 / 3 (37), US 5 / 10 / 3 / 1 (19), LATAM 2 / 0 / 0 / 0 (2) — and the four arms sum to the placed total per market, the reconciliation the deck runs before printing. US is the outlier the review discusses: 5 completions against 10 underway, a completion share of 26.3% against EU's 53.3%. The pivot is conditional aggregation — one scan, one row per market — with the status literals as platform vocabulary: delivered, shipped, pending, cancelled.",
      ask: "Return one row per market region with completed, underway, awaiting and cancelled counts as columns — biggest completed count first.",
      template:
        "SELECT c.region,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS completed,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS underway,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS awaiting,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled\nFROM orders o\nJOIN customers c ON c.id = o.{2}\nGROUP BY c.region\nORDER BY completed {3};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed arm's literal",
          why: "'delivered' is the platform's completion value — a literal, not an adjective. A 'complete' typo compiles fine and sums to zero, and the column reads 0 completed for every market, which is exactly the silent failure the deck's reconciliation catches.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the market-attach join key",
          why: "The region rides on the rider, so the join attaches customers by customer_id BEFORE the CASE arms fold — otherwise the pivot folds bookings with no market and the four arms sum to nothing reconcileable.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-completed-first order",
          why: "The review leads with the market that completes most — EU 24, APAC 21, US 5, LATAM 2 — and reads the outliers downward. ASC opens on LATAM's two completions, a market of one rider, and the discussion starts at the wrong altitude.",
        },
      ],
      distractors: ["'shipped'", "region", "ASC"],
      walkthrough:
        "A pivot is four CASE arms with discipline. The join attaches each booking to its rider's market first — the join key is customer_id, the only FK between the tables — then GROUP BY region folds one row per market and the four conditional SUMs count statuses inside the same fold: EU 24/12/6/3, APAC 21/8/5/3, US 5/10/3/1, LATAM 2/0/0/0. The built-in audit: each row's arms sum to the placed total — 45, 37, 19, 2 — so a market whose arms don't reconcile has a definition bug, not a demand shock. ORDER BY completed DESC leads with EU and surfaces the review's story: US completes 5 of 19 placed while EU completes 24 of 45. The traps are all silent ones: a misspelled literal sums to zero without erroring; joining on a non-key dumps the fan-out into the fold; and ASC buries the headline under a two-booking market. One scan, four arms, one reconciliation — the pivot shape every super-app deck is built from.",
    },
    {
      id: "cs-grab-4",
      tier: "easy",
      topic: "t3",
      universe: "month-close",
      title: "The completion-stamp spine",
      brief:
        "Grab-flavored brief on the storefront db: the month-close pack reads the recent spine — each of the last five months with bookings placed and the average completion latency in days — because the CEO quotes month-over-month volume and the latency trend decides where delivery incentives land. Probed facts: 2024-10 carried 7 bookings averaging 2.60 days to completion, 2024-11 6 at 3.00, 2024-12 7 at 3.17, 2025-01 6 at 2.50, 2025-02 7 at 2.83 — 33 bookings, and only completed trips carry a completion stamp, so the average folds over non-NULL stamps only, which the readout says out loud. The spine is STRFTIME '%Y-%m' on TEXT timestamps, the latency is JULIANDAY arithmetic rounded once at the end, and the half-open filter (created_at >= '2024-10-01') is what keeps the window honest.",
      ask: "Return each of the last five months: month label, bookings placed, average days from booking to completion stamp — chronological order.",
      template:
        "SELECT STRFTIME('{1}', created_at) AS month,\n       COUNT(*) AS bookings,\n       ROUND(AVG({2}(shipped_at) - JULIANDAY(created_at)), 2) AS avg_days\nFROM orders\nWHERE created_at >= '2024-10-01'\nGROUP BY month\nORDER BY month {3};",
      slots: [
        {
          answer: "%Y-%m",
          kind: "keyword",
          label: "the month spine format",
          why: "'%Y-%m' prints '2024-10' — the year-carrying bucket the month-close pack joins against. '%m' alone labels October 2024 and October 2025 identically, and the pack's spine quietly loses its years.",
        },
        {
          answer: "JULIANDAY",
          kind: "keyword",
          label: "the stamp-to-days converter",
          why: "JULIANDAY turns the TEXT completion stamp into a fractional day number, so shipped_at minus created_at is days — 2.60 to 3.17 across the five months. AVG(created_at) diffing raw text would subtract strings and produce a number that isn't time.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological order",
          why: "The pack reads October through February — a trend, not a list. DESC opens on the newest month and the month-over-month story reads backwards to the CEO.",
        },
      ],
      distractors: ["created_at", "%m", "DESC"],
      walkthrough:
        "A date-spine fold with the NULL policy priced in. STRFTIME builds the '%Y-%m' buckets, the half-open WHERE keeps everything from October 1 onward, and the fold carries two aggregates: COUNT(*) for placements — the stamp-less in-flight bookings still count as demand — and AVG over JULIANDAY(shipped_at) - JULIANDAY(created_at) for completion latency, where AVG's NULL-skipping IS the policy: only completed trips have stamps, so the average is over completed trips by construction and the readout prints that scope. The figures: 2024-10 7 bookings at 2.60 days, 2024-11 6 at 3.00, 2024-12 7 at 3.17, 2025-01 6 at 2.50, 2025-02 7 at 2.83 — December's dip is the holiday-load story the deck tells. Swap the format to '%m' and the year collapses out of the spine; diff raw text in the latency slot and the 'days' column is string arithmetic fiction; DESC reads the trend backwards. The month spine, the day math, the direction — three date disciplines in one pass.",
    },
    {
      id: "cs-grab-5",
      tier: "medium",
      topic: "q2",
      universe: "catalog",
      title: "Above the basket average",
      brief:
        "Grab-flavored brief on the storefront db: the catalog team flags listings priced above the platform average before repricing — the premium candidates whose price elasticity the pricing pod models first. Probed facts: the average catalog price is 71.78 across 16 listings, and exactly 6 clear the bar — Smart Watch S at 199.99, Noise-Canceling Headset at 149.99, 4K Webcam Pro at 129, Studio Desktop Mic at 119, Mechanical Keyboard K1 at 89.99, Fitness Band X2 at 79 — 37.5% of the catalog carrying the premium read. The benchmark is a scalar subquery computing the average ONCE, so every row compares against the same fixed number; the read is biggest-price-first because the repricing conversation starts at the top. The inner fold can never be empty on the full catalog — but the interviewer asks anyway, because a filtered staging table with no rows would yield NULL and an empty flag list that looks like perfect pricing.",
      ask: "Return listings priced above the platform average: name, category, price — biggest price first.",
      template:
        "SELECT name, category, price\nFROM products\nWHERE {1} > (SELECT {2}(price) FROM products)\nORDER BY price {3};",
      slots: [
        {
          answer: "price",
          kind: "keyword",
          label: "the compared column",
          why: "The comparison is listing price against the average price — the same measure on both sides. Comparing stock against a price-average mixes units and flags whatever inventory happens to exceed 71.78 units.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the benchmark fold",
          why: "AVG(price) is the platform average — 71.78 — computed once inside the subquery. SUM would benchmark against 1148.48 and flag nothing; MAX would benchmark against the most expensive listing and flag nothing, ever.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-price-first order",
          why: "Repricing starts at 199.99 and works down — the top of the read is the conversation. ASC buries the premium candidates under the flag list's tail.",
        },
      ],
      distractors: ["SUM", "MAX", "stock"],
      walkthrough:
        "A scalar-subquery benchmark with the empty-inner edge as the follow-up. The inner SELECT folds AVG(price) once — 71.78 across all 16 listings — and the outer WHERE keeps the 6 listings above it, read biggest-first: 199.99, 149.99, 129, 119, 89.99, 79. The benchmark's virtue is stability: one fold, one number, every row compared against the same target — the correlated cousin (average per category) is a different, slower question that the pricing pod asks later. The failure modes are the lesson: SUM in the benchmark slot compares prices against the catalog's TOTAL and flags nothing; MAX flags nothing by construction — nothing exceeds the maximum; and swapping the compared column to stock mixes inventory counts against a money average, producing a flag list with no business meaning. And the empty-inner edge: on a filtered staging table with zero rows, AVG yields NULL, every comparison is UNKNOWN, and the flag list silently empties — no error, just a pricing team that thinks the catalog is perfectly priced. Benchmarks compute once, compare honestly, and say what happens when the benchmark vanishes.",
    },
    {
      id: "cs-grab-6",
      tier: "hard",
      topic: "j5",
      universe: "growth",
      title: "The cardless frontier",
      brief:
        "Grab-flavored brief on the storefront db: the GrabPay migration review reads the cardless frontier — riders with invoices on the books but ZERO card settlements, because every one of them is a wallet-adoption target with proven demand. Probed facts: 9 of the platform's riders are cardless — Grace Kim (APAC), Isabella Rossi (EU) and Maya Patel (APAC) carry 2 invoices each; Alice Chen, Chloe Dubois, Emma Wilson, Hiro Tanaka, Liam O'Brien and Pedro Alvarez carry 1 each. The platform holds 28 invoices; 16 card settlements against 11 wire settlements cover the rest. The shape is a two-join anti-join: riders join to their invoices (INNER — no invoice means no payment history to convert), invoices LEFT JOIN card payments (the card filter lives IN the join predicate), and the IS NULL test keeps only the invoices no card ever touched. Grouping per rider and counting their invoices ranks the frontier by proven demand.",
      ask: "Return riders with invoices but zero card settlements: name, region, invoice count — most invoices first.",
      template:
        "SELECT c.name,\n       c.region,\n       {1}(DISTINCT i.id) AS invoices\nFROM customers c\nJOIN invoices i ON i.customer_id = c.id\nLEFT JOIN payments p ON p.invoice_id = i.id AND p.method = {2}\nWHERE p.id IS {3}\nGROUP BY c.id, c.name, c.region\nORDER BY invoices {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the invoice counter",
          why: "COUNT(DISTINCT i.id) counts each cardless rider's invoices — 2, 2, 2, then six riders at 1 — the proven-demand rank the migration team targets first. SUM(DISTINCT i.id) would add invoice ids and print a number that looks like money but isn't.",
        },
        {
          answer: "'card'",
          kind: "keyword",
          label: "the rail in the join predicate",
          why: "The card filter lives INSIDE the LEFT JOIN's ON clause, so invoices with no card match still survive with NULL payment columns — exactly the rows the IS NULL test keeps. Put the rail filter in WHERE instead and the LEFT JOIN degrades to INNER, the cardless rows are discarded, and the frontier list ships empty.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the unmatched-survivor test",
          why: "p.id IS NULL is the anti-join signature: keep invoices whose LEFT JOIN found no card settlement. IS NOT NULL inverts the read to riders WITH card coverage — the complement, the already-converted list.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the proven-demand-first order",
          why: "The three 2-invoice riders lead because demand history is the targeting priority. ASC opens on the 1-invoice tail and the migration budget lands on the smallest proven audiences first.",
        },
      ],
      distractors: ["SUM", "'wire'", "NOT NULL", "ASC"],
      walkthrough:
        "An anti-join where the filter's placement decides whether the population exists at all. Riders join to invoices — INNER, because a rider with no invoice has no payment history to convert — then invoices LEFT JOIN payments with the card filter INSIDE the ON clause: an invoice with card matches keeps them, an invoice without survives with NULL payment columns. WHERE p.id IS NULL keeps the survivors-without-matches, GROUP BY folds per rider, and COUNT(DISTINCT i.id) ranks the frontier: Grace Kim, Isabella Rossi and Maya Patel at 2 invoices, six more riders at 1 — nine wallets to win, ranked by proven demand. The case's whole lesson is the WHERE-vs-ON placement: move the card filter to WHERE and the LEFT JOIN collapses to INNER — unmatched invoices are discarded precisely where the NULL test would have caught them, and the cardless frontier returns zero rows forever, looking like a completed migration. SUM in the counter slot invents money from ids; 'wire' re-aims the query at the wrong rail; NOT NULL returns the converted list; ASC targets the tail first. Two joins, one NULL test, and the migration map survives a refresh.",
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
    { slug: "game-play-analysis-i", why: "First event paired with later activity — the cohort-input fold that feeds the month-1 retention matrix." },
    { slug: "article-views-i", why: "Distinct audience per entity — the MTU discipline (people, not touchpoints) in its purest graded form." },
    { slug: "article-views-ii", why: "Audience members with more than one view — the repeat-behavior read that powers the GrabUnlimited headline." },
    { slug: "big-countries", why: "OR-gated thresholds over area and population — the market-tier gate shape, two conditions one fold." },
    { slug: "biggest-single-number", why: "The biggest value that stands alone — the fraud desk's argmax with a duplicate guard built in." },
    { slug: "actors-and-directors-who-cooperated-at-least-three-times", why: "Pairs co-occurring 3+ times — the basket-pair read at its densest, canonicalized and counted once." },
    { slug: "all-the-matches-of-the-league", why: "Every pairing in a league — vertical co-occurrence fixtures, the self-join at pair grain." },
    { slug: "challenges", why: "Per-rider counts joined back with zero buckets kept — the cross-sell census where non-users still print." },
    { slug: "countries-you-can-safely-invest-in", why: "Three-table conditional CASE — the market-risk read tiered cities run before incentive budgets move." },
    { slug: "project-employees-i", why: "Per-group fold joined to its attributes — vertical leaderboards with the market name attached." },
    { slug: "nth-highest-salary", why: "Nth-value offsets — the second-biggest basket, the third rail by volume: offset reads without LIMIT habits." },
    { slug: "invalid-tweets", why: "Length validation on text — feed hygiene for the content surfaces, caught before it reaches a deck." },
    { slug: "consecutive-available-seats", why: "Consecutive-run detection — surge-capacity windows where adjacency, not totals, is the answer." },
    { slug: "classes-more-than-5-students", why: "HAVING count floor over a join — cohort floors: markets too small to read still excluded on purpose." },
    { slug: "capital-gain-loss", why: "Money in versus out per asset — the wallet-ledger read where realized gains are the net of two folds." },
    { slug: "find-followers-count", why: "Audience count per entity — the referral-network census: reach per rider, one fold, no fan-out." },
  ],
};
