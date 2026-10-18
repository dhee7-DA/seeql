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
// Extended (R4-E): bank widened to 30 MCQs / 24 theory / 6 cases / 32 problems —
// cases 3-6 and problems 17-32 probed on the live storefront db (all figures
// cited in briefs are query-verified).

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
    "This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the asks Swiggy screens on most: the trough-month demand board, the one-pass zone census, the weekday demand leaderboard with ties respected, the partner GMV chain through the merchant grid, the status-payload fold for the pack audit, and the Instamart depth board that ranks stock cover within each category. Run each on the live storefront database, then re-run a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the theory bank below, and treat the walkthroughs as the real content: they narrate the failure each wrong chip causes, which is exactly the muscle the *'what population is that over?'* follow-up tests.",
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
    {
      id: "swiggy-t9",
      q: "Walk me through the two-grain census — deliveries AND diners per zone — and what each count decides for the city GM.",
      a: "Two counts, two grains, one fold after the delivery-to-diner join. COUNT(*) counts delivery rows — the physical load on the rider network: EU 45, APAC 37, US 19, LATAM 2 on this db. COUNT(DISTINCT customer_id) folds repeat demand back to audience size: 8, 5, 2, 1 — and the ratio between the columns is the intensity signal, EU running 5.6 orders per diner. The GM supplies riders off the first column and sizes acquisition off the second; collapsing either into the other is how a new-user frontier gets staffed like a repeat-heavy metro. The trap: join further to order_items and COUNT(*) counts 251 line items — say 'one row per what?' for every COUNT and the census stays honest.",
      tag: "aggregation",
    },
    {
      id: "swiggy-t10",
      q: "Merchant settlements fold invoices against payments. Where does the fold break when an invoice was settled in two parts — and what's the safe grain?",
      a: "The danger grain is the JOIN's: invoices LEFT JOIN payments multiplies each invoice by its payment count — five invoices on this db carry two payment rows each — and any SUM taken after the join at the wrong side doubles the invoice money. The safe fold is staged: GROUP BY the invoice first (fold payments per invoice into settled cents), then compare at invoice grain — or aggregate only the invoice-side columns with COUNT(DISTINCT i.id) and SUM(i.amount_cents) held at one row per invoice. Say the rule as a grain: 'money folds at invoice grain, payment rows fold first.' The split-settlement read — did the two parts sum to the bill — is a per-invoice question, never a row-level one.",
      tag: "joins",
    },
    {
      id: "swiggy-t11",
      q: "Build the settlement reconciliation that classifies coverage — exact, partial, none — and catches a void-but-paid invoice. What does each branch mean, and what must you NOT dedupe?",
      a: "LEFT JOIN keeps all 28 invoices, then a CASE on the relationship: COUNT(p.id) = 0 → 'none' (6 invoices, $15,217 including the paid-no-payments anomaly #28 at $1,756), SUM(p.amount_cents) = i.amount_cents → 'exact' (21 invoices), anything else → 'partial' (exactly one, $4,000 of $6,148). The cross-check that catches anomalies rides in the same fold: status = 'void' with payment rows (invoice #11, $925) and status = 'paid' with none. What you must NOT dedupe: split settlements — five invoices pay in two genuine parts, and collapsing rows before classification hides both the split and the shortfall it might carry. Classify coverage first, fold second, and the trial-balance eye (debits equal credits, delta 0) closes the pack.",
      tag: "quality",
    },
    {
      id: "swiggy-t12",
      q: "Where do NULLs survive each pipeline stage — and what does a NULL rider_id do to an INNER JOIN census?",
      a: "Stage by stage. ON: NULL keys never match — a delivery row with a NULL rider_id vanishes from an INNER JOIN to riders, silently shrinking the census. WHERE: NULL fails both = and !=, so 'not cancelled' needs OR status IS NULL. GROUP BY: NULLs are a legal key and fold into one group — 21 orders with NULL shipped_at become a single honest bucket on this db. DISTINCT: keeps one NULL. Aggregates: COUNT(*) keeps the row, COUNT(rider_id) skips it, AVG quietly narrows its population. The Swiggy policy sentence: in-flight orders have no delivery timestamp yet — exclude them from latency WITH that sentence, never by COALESCE, which launders missing riders and missing deliveries into fake zeros.",
      tag: "nulls",
    },
    {
      id: "swiggy-t13",
      q: "Rush-hour capacity is a running sum. Write the frame, and tell me when the default frame betrays the burst.",
      a: "SUM(demand_minutes) OVER (ORDER BY minute ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) — explicit ROWS, because the default frame is RANGE and RANGE includes ordering PEERS: minute-buckets tied at the same timestamp enter the total together, so the coverage line jumps in burst-sized steps exactly when a rain burst lands. ROWS is row-true — one row per step, deterministic, which is what a rider-supply plan needs. When the axis is calendar dates with gaps, neither frame is calendar-true; that's a date-spine join, not a frame tweak. The interview point is knowing the default exists and stating which frame the metric means before the plan ships on it.",
      tag: "windows",
    },
    {
      id: "swiggy-t14",
      q: "The promise team wants latency tiers — p50 and p90 — over completed deliveries. How do you build them without leaving SQL?",
      a: "Stage the per-delivery latency in a CTE — JULIANDAY(shipped_at) − JULIANDAY(created_at) over the 82 completed rows only — then tier it: NTILE(4) OVER (ORDER BY latency, id) cuts quartiles (tiles of 20/20/21/21 on this db), PERCENT_RANK gives the continuous 0-to-1 read, and p50/p90 fall out of the tier boundaries. The population sentence is part of the deliverable: 'latency distribution of completed deliveries — pending and cancelled have no latency and are out of scope.' And put a deterministic tie-breaker in the window ORDER BY, because NTILE must place tied latencies somewhere and the tier boundaries should not move between runs. Fold first, tier second — the window can't live in the same SELECT as the aggregate.",
      tag: "windows",
    },
    {
      id: "swiggy-t15",
      q: "'Merchants with at least one delivered order in February' — EXISTS, IN, or JOIN, and why does the answer change at scale?",
      a: "EXISTS is the scale answer: a semi-join that stops at the first matching row, never fans out, and is NULL-safe — a listing with a NULL merchant_id simply doesn't exist in the check. IN is fine for small static lists, but NOT IN against a set containing NULL can never be TRUE — one stray key empties the report silently. A JOIN is the wrong tool for membership: a merchant with 40 February orders multiplies the outer rows 40 times, and the DISTINCT you'd bolt on is a smell that says 'I joined to test existence.' State it as a population claim — EXISTS asks 'does a match exist', JOIN asks 'how many matches' — and the follow-up ('now count their orders') tells you when to switch deliberately.",
      tag: "subqueries",
    },
    {
      id: "swiggy-t16",
      q: "Build the weekday demand curve and the weekend split for rider-shift staffing. What are the STRFTIME('%w') traps?",
      a: "STRFTIME('%w', created_at) returns TEXT '0'–'6' with '0' as SUNDAY — trap one: the weekend test is IN ('0', '6'), and misreading '0' as Monday shifts the whole staffing plan a day. Trap two: type — IN (0, 6) with numerics matches nothing against text codes, so the weekend branch silently reads zero. Trap three: label the output — a bare '1' column ships misread; CASE the codes into day names in the same pass. On this db the split reads 24 weekend versus 79 weekday of 103 orders, with Monday ('1') the single biggest day at 20. The hour cousin '%H' behaves the same — TEXT, zero-padded, sortable as strings — and on a date-grain db every hour reads '00', which is itself the lesson: bucket grammar is only as honest as the event grain behind it.",
      tag: "dates",
    },
    {
      id: "swiggy-t17",
      q: "Instamart stock-versus-sold per SKU: where does the fan-out live, and what does the remaining tail decide?",
      a: "Stock lives on the product row; sold lives on order lines; the join is products to order_items and the fan-out is the danger — COUNT(*) counts lines, not units, so the fold is SUM(oi.quantity) grouped per SKU. Remaining = stock − SUM(quantity): Noise-Canceling Headset reads 60 stocked, 46 sold, 14 remaining — the reorder signal — while Bluetooth Speaker Mini reads 210 stocked, 21 sold, 189 remaining — the slow tail flagged for markdown or transfer. A negative remaining is oversold-against-shelf: a data incident, not a rounding quirk. And the hygiene footnote: every SKU on this db has sold at least once, so the never-moved set is honestly empty — the analyst who reports the empty set instead of inventing a tail is the one the Instamart review trusts.",
      tag: "joins",
    },
    {
      id: "swiggy-t18",
      q: "Take rate is commission ÷ GMV. Why is the average of per-order rates the wrong fold, and what is the right one?",
      a: "Because averaging ratios weights every order equally while money is what compounds: AVG(fee/total) counts a $4.99 snack as much as a $200 group cart, but SUM(commission) ÷ SUM(total) weights by the denominator — the blended rate finance actually banks. Whenever denominators vary, the two folds disagree, and delivery baskets vary a lot, so the gap is real, directional, and unauditable. The same law governs kept demand: cancellation share is conditional sums over the PLACED whole, never the average of per-zone shares — small zones would outweigh big ones and the city read would drift. Name the fold out loud — 'ratio of sums, weighted by the denominator' — and every rate on the board inherits the discipline.",
      tag: "aggregation",
    },
    {
      id: "swiggy-t19",
      q: "Why can't WHERE see a window function, and how do you stage 'each zone's two biggest months' correctly?",
      a: "Evaluation order: FROM, WHERE, GROUP BY, HAVING, SELECT — where the window layer paints — then ORDER BY. When WHERE runs, no window output exists, so WHERE rank <= 2 is a syntax error, not a style choice. The staging move: a CTE (or derived table) folds zone-months and computes RANK() OVER (PARTITION BY zone ORDER BY orders DESC); the outer query then filters rn <= 2. The same two-step carries LAG deltas, running sums, any window-shaped filter. It isn't ceremony — it's the grammar teaching that windows are a presentation-layer computation over an already-folded set, and the interviewer is listening for the CTE reflex, not the memorized pattern.",
      tag: "pipeline",
    },
    {
      id: "swiggy-t20",
      q: "The promo pack needs the demand curve zero-filled — quiet months must print 0, not vanish. Build it.",
      a: "Aggregation only reports buckets that exist, so build the buckets first: a month spine — a recursive CTE walking 2024-01 through 2025-02, or a dimension table — LEFT JOINed to the facts, then COALESCE(SUM(total), 0) over the payload. The network curve on this db happens to fill all 14 months, but break by zone and the holes appear: LATAM placed no 2025 orders, so a per-zone curve without a spine silently hides a whole quiet year. A missing row in a promo deck is a lie by omission — 'no data' at best, 'no demand' at worst, and only one is a decision. Spine, LEFT JOIN, COALESCE, plus the reconciliation check that spine rows minus fact rows equals the empty count.",
      tag: "dates",
    },
    {
      id: "swiggy-t21",
      q: "UNION, UNION ALL, EXCEPT, INTERSECT — give me the Swiggy read for each.",
      a: "UNION ALL stacks without dedupe — census branches and TOTAL rows, where every row belongs and a distinct pass is pure cost with a side of row-deletion risk. UNION dedupes — right when two overlapping feeds report the same order and you want one row per thing. EXCEPT is set difference and the drift read: the 12 months of 2024 EXCEPT the 2 months of 2025 answers 'which months have no 2025 presence' — on this db it returns twelve honest rows. INTERSECT is the overlap — months live in both years. All four fold at column-shape grain and treat NULLs as equal members, which makes them safer than NOT IN for presence logic. The ritual is reconciliation: stacked branches must add back to the placed whole.",
      tag: "setops",
    },
    {
      id: "swiggy-t22",
      q: "The scalar subquery's empty-inner contract — when does it bite in city reporting?",
      a: "The contract is 0-or-1 rows, 1 column; zero rows yield NULL, and every comparison against NULL is UNKNOWN — the report empties silently, no error, no warning. It bites when the inner fold's population can go empty: scope the network-AOV baseline (338.19 on this db) to a window or a zone with no demand, and HAVING AVG(total) > (SELECT …) passes nothing while the run log looks clean. Guards are explicit: keep the baseline unfiltered when the definition says 'network', or COALESCE((SELECT …), 0) with a documented fallback. The correlated cousin re-runs per outer row and answers a different question — 'each zone against the others' — at a different cost; knowing which one the business asked for is the whole answer.",
      tag: "subqueries",
    },
    {
      id: "swiggy-t23",
      q: "A leaderboard must be reproducible across refreshes. What determinism discipline do you apply before it ships?",
      a: "Total order first: every ORDER BY that feeds a ranking or a page boundary ends with a unique key — metric DESC, then id ASC — because ties otherwise resolve to the engine's sort mood and page two shuffles between refreshes. Then the tie policy as an owned decision: ROW_NUMBER when exactly N rows must appear, RANK or DENSE_RANK when tied entities should share a rung — the weekday board on this db has a three-way tie at 16 orders, and DENSE_RANK is what keeps them together at rank 3 instead of splitting them 3-4-5. Finally the audit trail: the query ships with the board so the next analyst re-runs the definition, not a memory. Determinism is what lets a number survive 'how do you know?'",
      tag: "quality",
    },
    {
      id: "swiggy-t24",
      q: "The commission schedule changed in March; the ask is February's take rate. How do you read history honestly?",
      a: "As-of joins with half-open validity intervals: JOIN schedules s ON s.merchant_id = o.merchant_id AND s.valid_from <= o.created_at AND (s.valid_to > o.created_at OR s.valid_to IS NULL) — start inclusive, end exclusive, so each order instant matches exactly one schedule and adjacent changes never double-match. Joining the 'current' row fabricates history: March's rate silently overwrites February's orders and the take-rate trend becomes fiction with a straight face. The trap is joining on the entity key alone — the key picks the row SET, the interval picks the MOMENT. And the population sentence rides on every as-of read: which schedule version, as of when, for which orders — in the metric name, not the Slack thread.",
      tag: "joins",
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
    {
      id: "swiggy-mcq-11",
      prompt: "The APAC zone census reads 37 deliveries and 5 distinct diners. Which pair of expressions produces both columns — and what does the gap mean for rider planning?",
      choices: [
        "COUNT(*) and COUNT(customer_id) — both always agree after a join",
        "COUNT(*) counts delivery rows (37); COUNT(DISTINCT customer_id) folds repeat demand back to people (5) — the gap is order intensity per diner",
        "COUNT(DISTINCT customer_id) reads 37 because DISTINCT runs after the join",
        "COUNT(*) reads 5 because GROUP BY zone dedupes diners",
      ],
      answer: 1,
      why: "COUNT(*) counts joined rows — one per delivery; COUNT(DISTINCT customer_id) collapses repeat demand to audience size. 37 deliveries from 5 diners is 7.4 orders per diner — a repeat-heavy metro that needs surge-capable rider posture, not new-user acquisition spend.",
      notes: [
        { choice: 2, why: "DISTINCT folds at the value level: a diner's seven orders collapse to one value — exactly why it reads 5, not 37." },
        { choice: 3, why: "GROUP BY folds zones, not diners. One row per zone, and COUNT(*) inside it counts that zone's delivery rows." },
      ],
      difficulty: "easy",
    },
    {
      id: "swiggy-mcq-12",
      prompt: "Weekday demand reads: Mon 20, Fri 18, Sun 16, Tue 16, Wed 16, Thu 9, Sat 8. What does DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) give the Thursday row?",
      choices: ["3", "4", "6", "7"],
      answer: 1,
      why: "DENSE_RANK shares rungs without gaps: 20 → rank 1, 18 → rank 2, the three-way tie at 16 all take rank 3, and Thursday's 9 is the fourth DISTINCT value — rank 4. RANK would say 6 (it skips the two tied positions), and reading ranks as row numbers says 7 — the tier count and the position count are different questions.",
      notes: [
        { choice: 0, why: "3 is the tied trio's rank — Thursday shares nothing with them at 9 orders. That's the DENSE_RANK answer for Sun/Tue/Wed, not for Thursday." },
        { choice: 2, why: "That's RANK: ties share 3, and the next distinct value skips to 6 — the two phantom positions make Thursday look worse than it is." },
      ],
      difficulty: "easy",
    },
    {
      id: "swiggy-mcq-13",
      prompt: "Invoices LEFT JOIN payments runs 28 invoices into 33 rows — 5 invoices settled in two parts. What happens to `SUM(i.amount_cents)` taken straight off the joined rows?",
      choices: [
        "Nothing — SUM is join-proof",
        "It over-counts by the 5 split invoices' amounts — the invoice side doubled with every extra payment row",
        "It drops the 5 split invoices entirely",
        "It converts the cents to dollars",
      ],
      answer: 1,
      why: "The join fans each split invoice into two rows, and SUM at the joined grain counts its amount twice — the billed total inflates by exactly the five split settlements. Fold payments per invoice first (GROUP BY the invoice), then take invoice-side sums at one row per invoice — money folds at invoice grain.",
      notes: [
        { choice: 0, why: "SUM is only join-proof at a grain the join didn't touch. The invoice side multiplied; its SUM multiplied with it." },
        { choice: 2, why: "LEFT JOIN never deletes — it duplicates. The over-count, not a loss, is the settlement pack's signature bug." },
      ],
      difficulty: "easy",
    },
    {
      id: "swiggy-mcq-14",
      prompt: "The coverage classifier runs over all 28 invoices: 21 settle exact, 6 have no payments. What lands in the CASE's ELSE branch, and how many rows?",
      choices: [
        "'exact' — the unclassified remainder defaults to settled",
        "'partial' — 1 row: the invoice with money in but short ($4,000 of $6,148)",
        "'partial' — 7 rows: every invoice without a full match",
        "NULL — ELSE without a WHEN yields NULL",
      ],
      answer: 1,
      why: "The two WHEN branches catch no-payments (COUNT(p.id) = 0) and exact settlement (SUM = billed); ELSE is the remainder — money in but short. On this db exactly one invoice sits there, which is why a partial count of 7 means the WHEN branches are written wrong, not that the data changed.",
      notes: [
        { choice: 0, why: "Defaulting the remainder to 'exact' launders shortfalls into clean settlements — the close overstates collected AR by the partial's unpaid $2,148." },
        { choice: 2, why: "The no-payment branch already caught 6; if they reach ELSE, COUNT(p.id) = 0 was written wrong (probably COUNT(*) — which counts the NULL-payload row itself)." },
      ],
      difficulty: "medium",
    },
    {
      id: "swiggy-mcq-15",
      prompt: "Finance suspects a void invoice carries a settlement. Which query finds 'void status WITH payment rows' across the pack?",
      choices: [
        "WHERE status = 'void' AND amount_cents > 0 — void invoices hold money",
        "WHERE status = 'void' AND EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id) — the anomaly is the PAIR, not the amount",
        "HAVING status = 'void' AND COUNT(payments) > 0 without GROUP BY",
        "WHERE payment_id IS NOT NULL — the join already dropped voids",
      ],
      answer: 1,
      why: "The anomaly is a relationship: a void invoice with at least one payment row (invoice #11, $925.00 on this db). EXISTS asks exactly that question — does a match exist — without fanning out or tripping on NULLs. Any query that starts by dropping void rows can never find the pair.",
      notes: [
        { choice: 0, why: "Every void invoice holds its billed amount — the status is the claim that's wrong, not the cents. The amount predicate matches all of them and finds nothing." },
        { choice: 3, why: "That's the trap: filter voids out first and the anomaly is deleted before it can be seen. Existence checks come BEFORE population filters." },
      ],
      difficulty: "medium",
    },
    {
      id: "swiggy-mcq-16",
      prompt: "Settlement days = JULIANDAY(paid_on) − JULIANDAY(issued_on). The pack claims '13 fastest, 84 slowest'. Which expression computes the per-invoice figure the ranking needs?",
      choices: [
        "ROUND(paid_on - issued_on) — text dates subtract cleanly",
        "CAST(JULIANDAY(paid_on) - JULIANDAY(issued_on) AS INTEGER) per invoice, aggregated after",
        "STRFTIME('%d', paid_on) - STRFTIME('%d', issued_on) — day-of-month diff",
        "AVG(paid_on, issued_on) — the midpoint is the settlement point",
      ],
      answer: 1,
      why: "JULIANDAY turns TEXT timestamps into fractional day numbers whose diff is real elapsed days; per-invoice, rounded once, aggregated after. Text subtraction is string math, STRFTIME('%d') diffs day-of-month (a 31-day gap reads 0), and AVG of two dates is a midpoint, not a duration.",
      notes: [
        { choice: 0, why: "Text subtraction would coerce '2025-03-01' - '2025-02-01' into a numeric parse of '2025' — a wrong number with a straight face." },
        { choice: 2, why: "Day-of-month diffs collapse month boundaries: Feb 1 to Mar 1 reads 0. Only the julianday (or Julian-date) axis measures elapsed time." },
      ],
      difficulty: "easy",
    },
    {
      id: "swiggy-mcq-17",
      prompt: "Dark-store stock-versus-sold joins products to order_items (one SKU on many lines). The Headset reads 60 stocked, 46 sold, 14 remaining. Which fold computes 'sold' correctly?",
      choices: [
        "COUNT(*) per product — lines equal units",
        "SUM(oi.quantity) per product — units live on the line, one row per unit sold",
        "SUM(p.stock) − COUNT(oi.id) — stock minus purchase lines",
        "AVG(oi.quantity) — the average line size is the sold count",
      ],
      answer: 1,
      why: "Quantity lives on each order line, so units sold is SUM(quantity) grouped per SKU — 46 for the Headset. COUNT(*) counts LINES (a line of 3 units counts 1), and the remaining figure would inflate; the reorder signal dies quietly.",
      notes: [
        { choice: 0, why: "Lines ≠ units whenever baskets hold multiples of one SKU. The Instamart read that confuses them orders stock twice for family-sized baskets." },
        { choice: 2, why: "Stock is on the product row (60) and subtracting line COUNTS from it mixes grains — 60 − lines is a number with no meaning." },
      ],
      difficulty: "medium",
    },
    {
      id: "swiggy-mcq-18",
      prompt: "Rider assignments can be missing — rider_id is NULL on unassigned orders. The ops pack prints 'assigned rider' and must not show gaps as names. Which expression prints 'Unassigned' instead?",
      choices: [
        "CAST(rider_id AS TEXT) — NULLs become the text 'NULL'",
        "COALESCE(rider_name, 'Unassigned') — the display-edge fallback for a missing value",
        "TRIM(rider_name) — trims the emptiness away",
        "rider_name OR 'Unassigned' — boolean fallback",
      ],
      answer: 1,
      why: "COALESCE returns the first non-NULL argument — the standard display-edge fallback for a legitimately missing value. The key word is display: COALESCE belongs at the OUTPUT edge, never inside the pipeline, where substituting 'Unassigned' for NULL would make unassigned orders join like assigned ones.",
      notes: [
        { choice: 0, why: "CAST(NULL AS TEXT) is still NULL — no cast produces the string 'NULL'. The fallback function is COALESCE (or IFNULL in SQLite)." },
        { choice: 3, why: "OR is a boolean operator — NULL OR 'Unassigned' doesn't concatenate; it evaluates to NULL or a boolean, never the fallback string." },
      ],
      difficulty: "easy",
    },
    {
      id: "swiggy-mcq-19",
      prompt: "A pipeline retry double-loaded some delivery events — identical rows twice. Which shape keeps ONE copy per event, deterministically?",
      choices: [
        "SELECT DISTINCT * — dedupes the whole table in place",
        "ROW_NUMBER() OVER (PARTITION BY event_key ORDER BY updated_at DESC) and keep rn = 1 — newest ingest wins, with a unique tie-breaker",
        "GROUP BY event_key — folding is deduping",
        "WHERE updated_at IS NOT NULL — retries carry NULL timestamps",
      ],
      answer: 1,
      why: "The window dedupe numbers duplicates newest-first per natural key and the keep-rn-1 filter retains exactly one — deterministic, and the ORDER BY (updated_at, then a unique id) makes the winner reproducible. DISTINCT * only works when rows are byte-identical and offers no policy for which copy survives.",
      notes: [
        { choice: 0, why: "DISTINCT * fails the moment the copies differ in one column (a retry timestamp) — and it never states WHICH row is the truth." },
        { choice: 2, why: "GROUP BY event_key collapses duplicates but picks survivor columns by engine mood — SQLite's bare-column rule, not a dedupe policy. Name the keep-newest rule explicitly." },
      ],
      difficulty: "medium",
    },
    {
      id: "swiggy-mcq-20",
      prompt: "`GROUP_CONCAT(DISTINCT status)` per zone prints EU 'pending,shipped,cancelled,delivered' but APAC 'delivered,shipped,pending,cancelled'. What do you tell the stakeholder who wants the strings sorted?",
      choices: [
        "Add ORDER BY inside GROUP_CONCAT — SQL guarantees per-zone alphabetical order",
        "GROUP_CONCAT(DISTINCT …) has no guaranteed order — the string proves which states EXIST per zone (set evidence), not their sequence; sort outside SQL or don't parse it",
        "The zones genuinely differ — APAC is missing a status",
        "CAST the statuses to INTEGER first — numeric sorting fixes the fold",
      ],
      answer: 1,
      why: "SQLite's GROUP_CONCAT concatenates in whatever order rows visit the fold; DISTINCT does not sort. EU and APAC hold the SAME four statuses in different walk orders — the column is set evidence, not sequence. Anything order-sensitive happens in the app layer, and the pack says so.",
      notes: [
        { choice: 0, why: "SQLite has no ORDER BY inside GROUP_CONCAT — and even where a dialect supports it, building logic on concat order is the smell under review." },
        { choice: 2, why: "Compare as sets: both zones show all four statuses. The difference is walk order, which carries zero business meaning." },
      ],
      difficulty: "hard",
    },
    {
      id: "swiggy-mcq-21",
      prompt: "`SELECT STRFTIME('%Y-%m', created_at) AS month, SUM(total), (SELECT AVG(total) FROM orders) AS network_aov FROM orders GROUP BY month` — every row's network_aov reads 338.19. Bug?",
      choices: [
        "Yes — the subquery should vary by month; scope it to the month",
        "No — it's UNCORRELATED: it folds the whole table once (34833.28 ÷ 103) and every month row reads the same baseline; a shared constant column is the point",
        "Yes — scalar subqueries can't live in SELECT; move it to HAVING",
        "No coincidence — it equals every monthly average by definition",
      ],
      answer: 1,
      why: "An uncorrelated scalar subquery executes once and every outer row prints the same scalar — that's the desired shape: each month's demand beside the network baseline, no join, no fan-out. It's only a bug if the ask was 'each month vs the OTHERS' average' — a correlated fold with a different cost profile.",
      notes: [
        { choice: 0, why: "Scoping the baseline per month destroys the network number the growth brief requested — a different metric wearing the same column name." },
        { choice: 2, why: "Scalar subqueries are standard in SELECT — that's where baseline columns live. HAVING filters groups; it doesn't display constants." },
      ],
      difficulty: "medium",
    },
    {
      id: "swiggy-mcq-22",
      prompt: "Which shape finds the months that carried demand in 2024 but have NO 2025 presence — and what does it return on this db?",
      choices: [
        "INTERSECT of the two years' month lists — overlap is drift",
        "SELECT month-2024 EXCEPT SELECT month-2025 — set difference; on this db it returns 12 rows, because every 2024 month ran and only January–February carried 2025 demand",
        "LEFT JOIN the two lists on month WHERE the 2025 side IS NULL — illegal across years",
        "GROUP BY month HAVING COUNT(*) = 0 — folds materialize absent groups",
      ],
      answer: 1,
      why: "EXCEPT is set difference: 2024's twelve month-keys minus 2025's two — twelve rows survive, the honest drift read. No joins, no NULL traps. The count itself is the finding: every 2024 month-key lacks a 2025 twin, because the 2025 log has only opened two months — the read is calendar-true where a '%m' fold would have merged the years and hidden the gap entirely.",
      notes: [
        { choice: 0, why: "INTERSECT answers the opposite question — months present in BOTH years (January and February here). Drift is difference, not overlap." },
        { choice: 3, why: "GROUP BY folds existing rows only — a month with no orders never forms a group. Absence needs set logic or an anti-join, never a fold." },
      ],
      difficulty: "hard",
    },
    {
      id: "swiggy-mcq-23",
      prompt: "NTILE(4) OVER (ORDER BY latency, id) tiers the 82 completed deliveries. How wide are the tiles, and why the id in the ORDER BY?",
      choices: [
        "Exactly 20 each — tiles are fixed-width",
        "21/21/20/20 — NTILE front-loads the remainder (82 = 4×20 + 2, so the first two tiles absorb it); the id tie-breaker keeps the boundaries reproducible between runs",
        "20/20/21/21 — the remainder goes to the last tiles",
        "Width depends on latency spread — wide spreads make wide tiles",
      ],
      answer: 1,
      why: "NTILE divides 82 rows into 4 tiles as evenly as possible and front-loads the remainder: 21, 21, 20, 20 on this db — probed. Tied latencies must still LAND somewhere; without a unique tie-breaker the boundary assignment isn't reproducible and the p50 boundary moves between refreshes. Tile width is a row-count property, never a spread property.",
      notes: [
        { choice: 0, why: "82 doesn't divide by 4 — the remainder lands somewhere, and NTILE puts it in the EARLY tiles. 'Exactly 20 each' miscounts the board's own arithmetic." },
        { choice: 2, why: "Back-loading the remainder is the intuition, not the spec — NTILE hands the extra rows to the first tiles. Check the engine, don't assume." },
      ],
      difficulty: "hard",
    },
    {
      id: "swiggy-mcq-24",
      prompt: "STRFTIME('%w', created_at) buckets the demand curve. Which test catches the weekend, and what does it read on this db?",
      choices: [
        "IN (0, 6) — numerics; the weekend reads 24 orders",
        "IN ('0', '6') — TEXT codes, Sunday-first; the weekend reads 24 of 103 orders (16 Sunday + 8 Saturday) against 79 weekday",
        "IN ('6', '7') — Monday-first numbering",
        "BETWEEN '1' AND '5' — the weekend is the complement",
      ],
      answer: 1,
      why: "'%w' returns TEXT '0'–'6' with '0' as SUNDAY, so the weekend test is IN ('0', '6') and it reads 24 orders — Sunday 16 plus Saturday 8 — against 79 weekday. The traps are type (IN (0,6) matches nothing against text) and convention ('0' is Sunday, not Monday — misread it and every rider shift plan drifts a day).",
      notes: [
        { choice: 0, why: "Type trap: '0' = 0 is a type mismatch in SQL, so the numeric list matches nothing and the branch reads zero — the silent empty that ships as 'no weekend demand'." },
        { choice: 3, why: "BETWEEN '1' AND '5' catches MONDAY-FRIDAY — the weekday base, not the weekend. The complement test must still be written as the complement." },
      ],
      difficulty: "easy",
    },
    {
      id: "swiggy-mcq-25",
      prompt: "Kept share: 52 of 103 placed orders delivered. Which expression prints 50.49 — and what does the alternative print?",
      choices: [
        "ROUND(100 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*), 2) — prints 50.49",
        "ROUND(100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*), 2) — prints 50.49; the 100-variant prints 50.0 by integer division",
        "ROUND(SUM(...) / COUNT(*), 2) * 100 — prints 50.49",
        "AVG(status = 'delivered') * 100 — prints 50.49",
      ],
      answer: 1,
      why: "In SQLite, 100 * int / int divides as integers: 100 * 52 = 5200, ÷ 103 → 50 — the .49 is truncated before ROUND ever sees it. The 100.0 divisor forces real division and the two-decimal read survives. The house habit: 100.0 before the division, ROUND only at the edge.",
      notes: [
        { choice: 0, why: "That's the trap version: the integer division already happened inside — 50.0 ships with two fake decimal places, and every zone share drifts down." },
        { choice: 2, why: "Rounding AFTER the division can't recover the truncated decimals — the damage is inside the fold. Multiply the float first or don't divide." },
      ],
      difficulty: "medium",
    },
    {
      id: "swiggy-mcq-26",
      prompt: "The zone-level demand curve must print LATAM's silent 2025 as a 0 row, not a missing row. Which build does it?",
      choices: [
        "GROUP BY zone, month — folds create every group",
        "A month spine (recursive CTE or dimension) LEFT JOINed to the facts, COALESCE(SUM(total), 0) — the spine guarantees the row, the join supplies the zeros",
        "COALESCE(SUM(total), 0) without a spine — the fallback fills the gaps",
        "HAVING SUM(total) IS NULL — keeps the empty months",
      ],
      answer: 1,
      why: "Aggregation only reports buckets that exist — LATAM placed no 2025 orders, so no group forms and nothing inside the fold can resurrect it. The spine supplies the row skeleton, the LEFT JOIN keeps it alive with NULL payload, and COALESCE prints the honest 0. Spine rows minus fact rows = the empty count, and the pack reconciles.",
      notes: [
        { choice: 0, why: "GROUP BY folds existing rows only — that's the bug being fixed, not the fix." },
        { choice: 2, why: "COALESCE acts on values in EXISTING rows; a missing group has no row to coalesce. The spine must exist BEFORE the fold." },
      ],
      difficulty: "medium",
    },
    {
      id: "swiggy-mcq-27",
      prompt: "Take rate: partner A charges 30% on 100 orders averaging $10; partner B charges 10% on 3 orders averaging $2000. AVG(per-order rate) vs SUM(fees) ÷ SUM(GMV) — which is the real blended rate, and why?",
      choices: [
        "AVG(per-order rate) — every order counts once",
        "SUM(fees) ÷ SUM(GMV) — the ratio of sums weights by money: A contributes $300 of $4600 GMV, B $600, so the blend is 19.6%, not 20%",
        "They always agree — rates are rates",
        "MAX(per-order rate) — the top partner sets the take",
      ],
      answer: 1,
      why: "Averaging ratios weights every ORDER equally; money compounds by SUM(fees) ÷ SUM(GMV). Here A's 30% sits on $1000 GMV ($300) and B's 10% on $6000 ($600): the blended take is 900 ÷ 7000 = 12.9% — nowhere near the 20% the average of rates reports. The marketplace banks the ratio of sums.",
      notes: [
        { choice: 0, why: "That's the average-of-ratios trap: partner B's three giant orders count as three votes, and the blended rate inflates toward whichever partner has small denominators." },
        { choice: 3, why: "MAX is one partner's rate, not a blend. Every rate on the board should carry its fold: 'ratio of sums, weighted by the denominator.'" },
      ],
      difficulty: "hard",
    },
    {
      id: "swiggy-mcq-28",
      prompt: "The settlement pack reports '27 payments across 8 merchants'. Which pair of expressions produces both numbers from the same fold — and why must they differ?",
      choices: [
        "COUNT(*) and COUNT(*) — they must agree",
        "COUNT(p.id) counts payment rows (27); COUNT(DISTINCT i.customer_id) folds repeat and split settlements back to distinct merchants (8) — the gap IS the multi-payment picture",
        "COUNT(*) and SUM(1) — identical by definition",
        "COUNT(p.id) and COUNT(i.id) — the join makes them differ",
      ],
      answer: 1,
      why: "After the invoice-payment join, COUNT(p.id) counts the 27 payment rows while COUNT(DISTINCT i.customer_id) folds them back to the 8 merchants who actually paid — 22 invoices behind those 27 rows, five of them split in two parts. Both numbers are true; each answers a different grain question, and the gap is exactly the split-settlement population finance wants named.",
      notes: [
        { choice: 0, why: "If they agreed, either the splits don't exist or one count is wrong. Two grains, two numbers, one reconciliation story." },
        { choice: 3, why: "COUNT(p.id) and COUNT(i.id) on MATCHED rows agree (both sides non-NULL) — the divergence needs DISTINCT, not two columns." },
      ],
      difficulty: "easy",
    },
    {
      id: "swiggy-mcq-29",
      prompt: "'Merchants with at least one delivered order in February' — the teammate JOINs merchants to February orders and counts. The report shows one merchant 40 times. Diagnosis and fix?",
      choices: [
        "The join is broken — switch to LEFT JOIN",
        "A JOIN answers 'how many matches' — it fanned out; membership wants a semi-join: EXISTS (SELECT 1 FROM orders o WHERE o.merchant_id = m.id AND …) which stops at the first match",
        "Add LIMIT 1 per merchant",
        "COUNT(DISTINCT *) fixes the fan-out",
      ],
      answer: 1,
      why: "JOIN multiplies: a merchant with 40 February deliveries contributes 40 rows, and the DISTINCT you'd bolt on is the smell that says 'I joined to test existence'. EXISTS is the semi-join — first match wins, no fan-out, NULL-safe — and it's the shape that stays honest at marketplace scale.",
      notes: [
        { choice: 0, why: "LEFT JOIN changes WHO survives, not HOW OFTEN they appear — the 40 rows stay 40 rows. Fan-out is an existence-vs-count question." },
        { choice: 2, why: "LIMIT caps the whole result set, not per-group. The per-merchant cap is a window job — or better, the semi-join that never fanned out at all." },
      ],
      difficulty: "hard",
    },
    {
      id: "swiggy-mcq-30",
      prompt: "The close ships when the ledger reconciles. `SELECT SUM(debit_cents), SUM(credit_cents) FROM ledger_entries` reads 18,108,000 / 18,108,000. What does delta 0 prove — and what does it NOT prove?",
      choices: [
        "Everything — balanced sums mean the books are correct",
        "Only that total debits equal total credits — the pack CLOSES; it does not prove each ENTRY or each ACCOUNT is right — a mis-posted pair (debit to cash, credit to revenue, wrong amounts offsetting elsewhere) still balances",
        "That every account's debits equal its credits — the SUM is per-account",
        "That payments match invoices — the ledger is the AR proof",
      ],
      answer: 1,
      why: "Delta 0 is the closure condition: the two-sided fold balances. It is necessary, not sufficient — offsetting errors cancel inside the SUM, so account-level breaks need the per-account GROUP BY (debit and credit folded per account, compared against expectations) and entry-level breaks need the trial listing. Balance proves arithmetic; it never proves postings.",
      notes: [
        { choice: 0, why: "That's the compliance trap: two wrong entries that offset still produce delta 0. Closure is the first gate, not the audit." },
        { choice: 2, why: "The bare SUM folds across ALL accounts — cash can carry a $5,000 break while another account offsets it. Per-account granularity is a separate query." },
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
    {
      id: "cs-swiggy-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The weekday demand leaderboard",
      brief:
        "Swiggy-flavored brief on the storefront db: the rider-shift plan needs the demand leaderboard by weekday — 'rank me the days, ties respected: three days sharing a rank must STAY together, not split 3-4-5 by engine mood, and any day carrying fewer than 9 orders gets no dedicated tier.' Definition fixed: weekday = STRFTIME('%w') TEXT codes with '0' as Sunday; rank = DENSE_RANK over the folded counts, busiest first; the threshold keeps the tiered days only. Probed on the db: Monday '1' leads at 20 orders, Friday '5' follows at 18, and Sunday '0', Tuesday '2', Wednesday '3' tie at 16 — Thursday '9' scrapes in at rank 4, and Saturday '8' falls below the cut.",
      ask: "Return weekday code, order count, and a no-gap demand rank for every weekday with at least 9 orders, busiest first.",
      template:
        "SELECT STRFTIME('%w', created_at) AS weekday,\n       COUNT(*) AS orders,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS demand_rank\nFROM orders\nGROUP BY weekday\nHAVING COUNT(*) >= {3}\nORDER BY demand_rank, weekday;",
      slots: [
        {
          answer: "DENSE_RANK",
          kind: "keyword",
          label: "the no-gap tier function",
          why: "DENSE_RANK gives Monday 1, Friday 2, and the tied trio at 16 a shared rank 3 — tiers without gaps. RANK would jump the next value to 6, printing phantom rungs no weekday occupies; ROW_NUMBER would split the tie 3-4-5 arbitrarily.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "Ranking demand means the biggest count is tier 1, so the window ORDER BY runs descending. ASC would crown Saturday's 8 as rank 1 — a correct query answering the opposite question, and the shift plan would staff the quietest day.",
        },
        {
          answer: "9",
          kind: "number",
          label: "the busy-tier threshold",
          why: "HAVING COUNT(*) >= 9 keeps six weekdays — the tied trio at 16, plus Thursday's 9 that scrapes in — and that survivor is what makes the rank function visible: after the tie, DENSE_RANK reads 4 where RANK reads 6. Saturday's 8 falls below the cut, and 9 appears in the result cells it filters on.",
        },
      ],
      distractors: ["ROW_NUMBER", "RANK", "ASC"],
      walkthrough:
        "A census, a threshold, and a tier that respects ties. STRFTIME('%w') folds 103 orders into seven weekday buckets — TEXT codes, Sunday '0' — and COUNT(*) is the demand counter: 20, 18, 16, 16, 16, 9, 8. HAVING — not WHERE — carries the threshold because the folded count only exists after the fold; >= 9 keeps six rows and drops Saturday. The window ranks the counts: DENSE_RANK packs the three-way tie at 16 into one shared rung — 1, 2, 3, 3, 3, then 4 for Thursday — which is the whole point: RANK would stamp 1, 2, 3, 3, 3 and jump to 6, printing phantom rungs no weekday occupies, and ROW_NUMBER would split the tie 3-4-5 as if rider demand could break a tie. The Thursday row is where the two rankers disagree — the survivor after a tie is what makes gaps visible. ORDER BY demand_rank, weekday breaks the TIED rows' display order deterministically (0, 2, 3) without breaking the tie itself. When the shift plan says 'tiered days', DENSE_RANK is the function that doesn't fabricate strata.",
    },
    {
      id: "cs-swiggy-4",
      tier: "easy",
      topic: "j3",
      universe: "supplier",
      title: "The partner GMV chain",
      brief:
        "Swiggy-flavored brief on the storefront db: the partner review walks the merchant grid — 'top three partners by GMV, with their delivered-order counts, so we know who carries the basket and who carries the frequency.' The chain is orders → order_items → products → suppliers (merchant partners), revenue lives at line-item grain as unit_price × quantity, and order counts must fold back with COUNT(DISTINCT o.id) or the fan-out lies. Probed on the db: Nordic Gadgets AB leads value at 11130.25 across 38 orders, Midwest Hardware Co is second at 9294.93 — with 45 orders, the most of anyone — and Alpine Audio GmbH third at 4765.63 across 34. Frequency leader and value leader are different partners; that's the story.",
      ask: "Return partner, distinct order count, and line-item GMV for the top three partners by GMV, biggest first.",
      template:
        "SELECT s.name AS partner,\n       COUNT(DISTINCT o.id) AS orders,\n       {1}(oi.unit_price * oi.quantity) AS gmv\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = {2}\nJOIN suppliers s ON {3} = p.supplier_id\nGROUP BY s.id\nORDER BY gmv {4}\nLIMIT {5};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the revenue adder",
          why: "GMV is SUM(unit_price × quantity) folded per partner — Nordic reads 11130.25. COUNT would print a row count wearing a money name, and the partner review would rank merchants by line volume instead of rupee value.",
        },
        {
          answer: "oi.product_id",
          kind: "keyword",
          label: "the catalog join key",
          why: "order_items attach to products on oi.product_id = p.id. o.id here would join items to orders AGAIN — the wrong key, a silently scrambled chain, and the GMV column becomes noise.",
        },
        {
          answer: "s.id",
          kind: "keyword",
          label: "the partner join key",
          why: "suppliers attach on s.id = p.supplier_id. p.supplier_id on both sides is a tautology — every supplier matches every product row, the fan-out explodes, and the GMV inflates into fiction.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The review wants the value leaders: DESC puts Nordic's 11130.25 on top. ASC would open on Pacific Textiles' 2980.15 — the quietest partner leading a review about the heaviest.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the leaderboard cut",
          noVerify: true,
          why: "LIMIT 3 keeps exactly the podium — Nordic 11130.25, Midwest 9294.93, Alpine 4765.63 — the top three the review asked for. Probed: together they carry 25190.81 of the 34833.28 total line-item GMV, 72.3% of the marketplace.",
        },
      ],
      distractors: ["COUNT", "o.id", "p.supplier_id", "ASC", "5"],
      walkthrough:
        "A four-table chain with a fold at every hop. The joins walk orders → order_items (line grain), → products (catalog), → suppliers (partner); the fold is SUM(unit_price × quantity) at line grain — 11130.25 for Nordic — while order volume folds back to order grain with COUNT(DISTINCT o.id), because the join fans every order into its line items and a bare COUNT(*) counts lines. The headline writes itself: Midwest leads frequency at 45 orders but Nordic leads value at 11130.25 — two argmaxes on one chain, both true, each at its own grain. ORDER BY gmv DESC + LIMIT 3 is the podium cut. The traps are the chain classics: COUNT in the money slot ranks by line count; o.id in the catalog slot re-joins the wrong pair; p.supplier_id = p.supplier_id is a tautology that explodes the fan-out; ASC crowns the quietest partner; LIMIT 5 dilutes a podium ask. Grain per fold, key per hop — that's the whole discipline.",
    },
    {
      id: "cs-swiggy-5",
      tier: "medium",
      topic: "x1",
      universe: "funnel",
      title: "The status payload fold",
      brief:
        "Swiggy-flavored brief on the storefront db: the pack audit wants each zone's status vocabulary as ONE cell — 'per zone, the distinct statuses that actually occurred, biggest load first — it's a payload for the app to render, not a census to parse.' Definition fixed: GROUP_CONCAT(DISTINCT status) folds the zone's distinct status values into a comma string; the audit only asserts which states EXIST per zone, never their sequence — SQLite's fold order is engine mood. Probed on the db: EU (45 orders), APAC (37) and US (19) each show all four statuses — pending, shipped, cancelled, delivered in varying walk order; LATAM (2 orders) shows only 'delivered', the clean-zone signal. One pass, one string per zone.",
      ask: "Return zone, order count, and the distinct-status payload per zone — biggest load first.",
      template:
        "SELECT c.region AS zone,\n       COUNT(*) AS orders,\n       {1}(DISTINCT o.status) AS states\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\n{2} COUNT(*) {3};",
      slots: [
        {
          answer: "GROUP_CONCAT",
          kind: "keyword",
          label: "the string folder",
          why: "GROUP_CONCAT folds the zone's distinct statuses into one payload cell — LATAM reads just 'delivered'. SUM on text yields 0, a number wearing a payload's name, and the audit loses every state it was meant to catch.",
        },
        {
          answer: "ORDER BY",
          kind: "keyword",
          label: "the read order",
          why: "ORDER BY COUNT(*) sorts the finished fold — biggest load first. A second GROUP BY is a syntax error here, and the two-fold confusion is exactly what the one-scan budget forbids.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The audit opens on the heaviest zone: DESC puts EU's 45 on top. ASC would lead with LATAM's two deliveries — a clean zone heading a pack about where states pile up.",
        },
      ],
      distractors: ["SUM", "GROUP BY", "ASC"],
      walkthrough:
        "One scan, one string per zone, one honesty rule. The join attaches all 103 orders to their zone; COUNT(*) holds the load (45, 37, 19, 2) while GROUP_CONCAT(DISTINCT o.status) folds each zone's distinct statuses into a single payload — EU, APAC and US render all four states in engine-mood order ('pending,shipped,cancelled,delivered' versus 'delivered,shipped,pending,cancelled' — same set, different walk), and LATAM reads 'delivered' alone, the clean-zone signal an analyst can state as set evidence. ORDER BY COUNT(*) DESC leads the pack with the heaviest zone. The rules the walkthrough enforces: the string proves which states EXIST, never their sequence — the app sorts, SQL folds; SUM over text is a zero wearing a payload's name; and the census stays one pass because the fold, the sort and the read happen over one GROUP BY. Set evidence, payload semantics, biggest first — that's the audit.",
    },
    {
      id: "cs-swiggy-6",
      tier: "hard",
      topic: "t6",
      universe: "inventory",
      title: "The Instamart depth board",
      brief:
        "Swiggy-flavored brief on the storefront db: the Instamart review needs the deepest-cover SKU per dark-store category — 'one row per category: the SKU with the most units remaining on shelf, ranked WITHIN its category so seven categories each crown one champion.' Definition fixed: stage the stock-versus-sold fold in a CTE (sold = SUM(oi.quantity) per SKU), remaining = stock − sold, then RANK() OVER (PARTITION BY category ORDER BY remaining DESC) — one partition per category, deepest first. Probed on the db: the seven champions are Fitness Band X2 (Wearables, 65 remaining), Ring Light 14\" (Video, 120), Bluetooth Speaker Mini (Audio, 189), Yoga Mat Eco 6mm (Fitness, 193), Wireless Mouse M3 (Electronics, 264), Running Socks 3-pack (Apparel, 367) and HDMI 2.1 Cable 2m (Accessories, 462) — the slowest-moving tail leads its category by a wide margin.",
      ask: "Return name, category, stock, sold, remaining, and the within-category depth rank for every SKU — champions first, thinnest cover first.",
      template:
        "WITH ps AS (\n  SELECT p.name, p.category, p.stock, {1}(oi.quantity) AS sold\n  FROM products p\n  JOIN order_items oi ON oi.product_id = p.id\n  GROUP BY p.id\n)\nSELECT name, category, stock, sold,\n       stock - sold AS remaining,\n       RANK() OVER ({2} BY category ORDER BY stock - sold DESC) AS depth_rank\nFROM ps\nORDER BY depth_rank, remaining\nLIMIT {3};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the units-sold fold",
          why: "Units live on the line, so sold = SUM(oi.quantity) per SKU — 46 for the Headset. COUNT would count LINES (a 3-unit basket counts once) and every remaining figure would inflate; the reorder signal dies quietly.",
        },
        {
          answer: "PARTITION",
          kind: "keyword",
          label: "the per-category boundary",
          why: "PARTITION BY category restarts the rank per category so seven champions emerge — one per shelf. ORDER BY alone ranks all 16 SKUs globally and six categories would never see their deepest SKU named.",
        },
        {
          answer: "7",
          kind: "number",
          label: "the champion cut",
          noVerify: true,
          why: "LIMIT 7 keeps exactly the rank-1 row of each of the seven categories — the champions. Probed: their remaining cover spans 65 (Fitness Band X2) to 462 (HDMI 2.1 Cable), and the spread IS the rebalancing story.",
        },
      ],
      distractors: ["COUNT", "ORDER", "4"],
      walkthrough:
        "Two stages: fold, then partition-rank. The CTE walks products → order_items and folds SUM(oi.quantity) per SKU — line grain folded to SKU grain, the Instamart stock-versus-sold fold; remaining = stock − sold computes at SKU grain (Bluetooth Speaker Mini: 210 − 21 = 189). The outer query ranks WITHIN each category — RANK() OVER (PARTITION BY category ORDER BY remaining DESC) — so Wearables crowns Fitness Band X2 at 65 while Accessories crowns HDMI 2.1 Cable at 462: seven partitions, seven champions, and the spread between them is the transfer list. ORDER BY depth_rank, remaining ASC surfaces the champions with the thinnest cover first — the morning fire list. COUNT in the fold would count lines, not units; ORDER in the window slot ranks globally and six categories lose their champion; LIMIT 4 keeps only a third of the shelf. Fold at SKU grain, rank at category grain, cut per ask — the two-stage discipline the board exists to teach.",
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
    { slug: "last-person-to-fit-in-the-bus", why: "Running-sum capacity at row grain: order the demand, accumulate the weight, cut at the limit — the rider-bag question verbatim, cumulative by construction." },
    { slug: "game-play-analysis-iii", why: "Cumulative totals per player with a running SUM window — Rush-hour coverage math: how much demand the online fleet has absorbed so far, row by row." },
    { slug: "the-latest-login-in-2020", why: "Argmax inside a bounded window — the most recent event per diner within a fixed year: the 'latest before cutoff' shape the month-close audits use." },
    { slug: "user-activity-for-the-past-30-days-i", why: "Windowed activity counts with a date spine — the 30-day rolling read the city packs open with, boundaries half-open by habit." },
    { slug: "list-the-products-ordered-in-a-period", why: "Period-bounded existence sets — SKUs that moved inside a window only: the Instamart freshness cut, half-open intervals drilled." },
    { slug: "queries-quality-and-percentage", why: "Two ratios in one query with rounding at the edge — the kept-share and cancellation-share math, 100.0 before the division." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the vocabulary check before the weekday leaderboard: say the 1,2,3,3,3 pattern out loud." },
    { slug: "department-top-three-salaries", why: "The hard screen closer: DENSE_RANK per group, join back for names — 'top three per zone' with the CTE staging reflex." },
    { slug: "second-highest-salary", why: "The famous tie trap: LIMIT/OFFSET breaks on duplicates — the metro leaderboard question where the second rung must survive ties." },
    { slug: "employee-bonus", why: "NULL as the answer: 'bonus under the threshold' must still include NULLs — the unassigned-rider and missing-settlement read in one drill." },
    { slug: "calculate-special-bonus", why: "COALESCE-guarded conditional values per row — the display-edge fallback discipline: guard the output, never the pipeline." },
    { slug: "combine-two-tables", why: "The LEFT JOIN warm-up: dimension data that must survive with NULL payloads — diners joined to orders where the order side can be missing." },
    { slug: "sellers-with-no-sales", why: "Zero-sales partners in a window — the merchant-hygiene anti-join; on this db the honest answer is an empty set, and reporting that IS the drill." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Visited-but-never-ordered via LEFT JOIN + IS NULL — the registered-diner audit: this db has zero such diners, and saying so cleanly is the test." },
    { slug: "number-of-rich-customers", why: "Conditional counting over a threshold — 'dinners above the basket line' per zone: HAVING-judged aggregates with the placed denominator intact." },
    { slug: "trial-balance-check", why: "Debits versus credits folded to delta 0 — the settlement pack's closure gate, and the lesson that balance proves arithmetic, not postings." },
  ],
};
