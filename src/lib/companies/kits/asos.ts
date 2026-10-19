// ASOS — Wave-9 (Task 98), ecom domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// Fashion-retail SQL: the storefront db read as an ASOS trading sandbox — customers are
// ASOS shoppers (region = market), orders are fashion orders (delivered = kept-and-settled,
// shipped = dispatched with shipped_at as the warehouse dispatch stamp, pending = in the
// pick-pack queue, cancelled = abandoned pre-dispatch), order_items are order lines
// (quantity = units, unit_price = line price — think size-curve rows), products are SKUs
// (own-brand + boutique), suppliers are brand/boutique partners, invoices are brand
// settlement statements, payments are settlement rails (card / Klarna-style split legs),
// expenses are warehouse opex, ledger_entries are the GL. The returns economy, size curves
// and drop cadence are the angles. Pool provenance: company-pools.md carries NO ASOS
// section — 0 tagged rows — so all 10 topic slug sets and all 16 problems are theme-curated
// from the pools file's theme menu (sql rows only, no w*/d*/f* rows) and say so. Case
// briefs quote probed figures from scripts/company-facts.md; every case slot is
// mechanically verified against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const asosKit: CompanyKit = {
  id: "asos",
  domainId: "ecom",
  name: "ASOS",
  tagline: "Fashion's returns economy, size curves and drop cadence",
  accent: "text-zinc-300",

  brief: [
    "**ASOS** is the UK-born global fashion retailer for twenty-somethings — own brands (ASOS DESIGN, Topshop) sitting beside thousands of boutique partners on **ASOS Marketplace**, an app-first funnel, a Premier delivery subscription, and a drop cadence that pushes new styles live every week. Fashion e-commerce has a signature data problem: orders placed and orders kept are different numbers, because sizing and fit drive returns at rates no other vertical sees. This kit maps the storefront db onto that world: 16 customers are shoppers (region = market), 103 orders are fashion orders worth **34,833.28**, and 251 order_items rows are order lines — quantity = units, unit_price = line price, the raw material of a size curve. The status map is fixed: delivered = {emerald:kept-and-settled} (52, 50.5%), shipped = dispatched (30, 29.1%, shipped_at as the warehouse dispatch stamp), pending = in the pick-pack queue (14), cancelled = {rose:abandoned pre-dispatch} (7, 6.8%).",
    "The data org splits into trading, customer/growth, a returns-and-fit pod, and finance ops — all reading the same spine at different grains. Trading lives on the order book: **34,833.28** across 103 orders, average 338.19 against a 25.47 to 1,088.44 spread, with concentration the board actually manages — **63.5%** of revenue from shoppers whose lifetime spend crosses 3,000 (71.2% above 2,000). The dispatch funnel is the ops heartbeat: 82 of 103 orders carry a `shipped_at` stamp, averaging **2.98 days** from order to warehouse dispatch with a 2–4 day spread; the 14 pending rows have no stamp yet — a population definition, not a cleanup job. Money sits one layer down: 28 invoices are brand settlement statements and 27 payments are settlement legs, all in INTEGER cents where the dollar read is `amount_cents / 100.0`.",
    "Interview screens are census-then-denominator. A loop opens with a **two-grain market census** — EU runs 45 orders from 8 shoppers (335.32 AOV) while the US runs 19 from 2 (383.48) — then escalates into a rate where the interviewer asks the denominator question out loud (*'does an abandoned order count in your base?'*), then into the units ladder where the size curve guarantees ties — three SKUs tied at 30 units — and rank semantics become a merchandising policy. Late rounds walk the {sky:14-month order spine} (2024-01 to 2025-02) with `LAG` deltas, or descend into the settlement layer where a paid-status statement with zero settlement legs (#28, 1,756.00) is waiting as the reconciliation trap. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no ASOS section — 0 tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: basket depth, return-share conditional counts, size-curve ranking with ties, drop-cadence month walks and the cents-safe settlement spine. Do the topics in order, then run all six case studies on the live storefront db: one rebuilds the {emerald:assortment weight census} trading reads every Monday, the other rebuilds the {rose:settlement coverage census} finance ops runs at every close, with four more rehearsing the same drills at other grains — the kit is built for spaced practice rather than one sitting... The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
    "Money is its own beat, and the settlement pod runs it on four tables — 28 statements, 27 legs, 36 expenses, 80 ledger entries, all INTEGER cents — where the read is reconciliation, not reporting: 21 statements settled in full (65,612), 1 partial (4,000 of 6,148), and **6 never-settled worth 15,217**, with the row-level rogues on top — #11 void-but-settled at 925.00 and #28 paid-status with zero legs at 1,756.00, *a status that lies*. Five statement cycles settle on both card and wire legs Klarna-style, so the pod pre-folds `payments` to statement grain before any join. The gate never moves: {emerald:181,080 debits} against 181,080 credits, delta zero — *or the close does not ship*.",
    "The senior rounds go deeper than the day-one screen, and this expansion tracks them: {sky:window frames} on the order spine — where tied `created_at` seconds make RANGE versus ROWS a correctness question — plus set-op stacks for the trading pack, anti-join idiom choice for the chase lists, fan-out discipline for anything touching settlement legs, and the weighted-versus-simple grain check (*the trusted bench's 139.66 average is a partner-row mean, not a lines-weighted read*). The attach economy gets its own definition: 54 of 103 orders carry an Accessories line, and the size-curve ladder guarantees ties — **three SKUs at 30 units** — so rank policy is merchandising law. Run the four appended cases on the live db — the size-curve ladder, the pre-dispatch loss list, the dispatch clock, the above-the-mean price ladder — and keep the day-one bar: state the population, state the denominator, reconcile by construction.",
  ],

  dayInLife: [
    "**08:30 —** The day starts with the trading dashboard, app-first. An analyst checks the overnight order drop before standup: did new styles land in the catalog feed, does the one-pass status census reconcile — 52 kept + 30 dispatched + 14 queued + 7 abandoned = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. Then the queue health read: dispatch latency versus the **2.98-day** norm — if pick-pack is drifting, the Premier promise is the next slide, and the 14 pending orders with no shipped_at stamp are *watched, not patched*.",
    "**11:30 —** Midday is the merchandising deep-dive. Trading wants the assortment weight census — which product lines carry units versus revenue, because the units leader (121 units on add-on lines) and the revenue leader (11,744.01) are *different lines by design*; the returns pod wants basket depth (251 lines over 103 orders, **2.4 lines per order**) re-cut by market; growth wants the repeat-frequency read where EU's 45-from-8 versus the US's 19-from-2 frames concentration. Each ask is a join, a conditional aggregate and one denominator decision. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the trading-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The settlement anti-join refreshes first — **6 never-settled statements worth 15,217** — before finance ops sends a single brand reminder; the coverage split reads **21 settled in full, 1 partial** (4,000 of 6,148) and feeds the dunning draft; and the anomaly list gets walked line by line: a void statement that was settled anyway (#11, 925.00) and a paid-status statement with zero settlement legs (#28, 1,756.00). Split-payment rails get their own eye — 5 statements pay in 2 legs, Klarna-style. The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
    "**17:45 —** The EOD writeup goes out the way every trading day closes. The recap ships against the drop calendar — July's **1,193.86 trough** carrying 2 of the 7 abandonments — and the size-curve ladder is staged for tomorrow's merch standup: 47, 46, 38, then the {rose:30-unit tie block} with the rank policy named beside it. The settlement chase list is finalized last — 6 never-settled statements worth 15,217, the paid-status lie #28 (1,756.00) flagged for finance ops by hand — and the definition log closes the deck: *kept rate over all 103, dispatch latency over its 82-row stamped base, attach over the 103-order denominator*. The last tab is always the ledger: **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Order book (GMV)", what: "Total fashion order value: 34,833.28 across 103 orders, average 338.19 against a 25.47 to 1,088.44 spread — a 42x range between the smallest basket and the largest. The spread IS the merchandising story." },
    { name: "Kept rate", what: "Delivered ÷ ALL orders placed: 52 of 103 (50.5%). Fashion's placed-versus-kept gap is the vertical's defining number, and the denominator — queued and abandoned included — is the whole interview." },
    { name: "Abandon share", what: "Cancelled-before-dispatch ÷ placed: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%. The pre-dispatch half of the returns economy that ops watches weekly." },
    { name: "Dispatch latency", what: "Order to warehouse dispatch (created_at → shipped_at) over stamped orders only: 82 of 103, 2.98-day average, range 2–4. The population definition ships with the number — queued orders have no cycle yet." },
    { name: "Basket depth", what: "Order lines ÷ orders: 251 lines over 103 orders (~2.4). The size-curve read — a fashion basket is units in two sizes of one dress, not two products, and this ratio is where that shows up first." },
    { name: "Shopper concentration", what: "Share of revenue from shoppers spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs the CRM pod and sizes the Premier funnel." },
    { name: "Assortment weight", what: "Units versus revenue per product line: the add-on line leads units (121) while the premium line leads revenue (11,744.01 over 97 units). Units leaders ≠ revenue leaders — the census trading reviews every Monday." },
    { name: "Settlement coverage", what: "Brand settlement statements versus legs: 21 settled in full (65,612), 1 partial (4,000 of 6,148), 6 never-settled worth 15,217. The AR anti-join finance ops refreshes every close." },
    { name: "Repeat ladder", what: "Orders per shopper: 24, 17, 14, 13, 5, then a four-way tie at 4 — and two shoppers with exactly one order. Frequency is the Premier funnel's intake read, and the tie block is a rank-policy decision, not a rounding note." },
    { name: "Settlement clock", what: "Issue to first payment over the settled book: 28.4-day average, 13 fastest, 84 slowest. The dunning calendar's tempo — statements that clear in two weeks versus three months get chased by different hands." },
    { name: "Supplier share", what: "Nordic Gadgets AB carries 32% of revenue (11,130.25), Midwest Hardware 26.7% (9,294.93) — two boutique partners over half the book. The number that sizes the partner-risk review." },
    { name: "Opex mix", what: "The warehouse cost side: Rent 16,800 across 14 lines, Ads 4,570 across 14, Travel 2,521 across 3, Tools 1,525 across 5. The spend column every close shows under the order book." },
  ],

  topics: [
    {
      name: "Basket depth & line economics",
      why: "A fashion order is not a product — it is a basket of size-curve lines, and every basket-depth question here is a two-grain count over order_items. ASOS screens open with lines-versus-orders: 251 lines over 103 orders, and the trap is COUNT(*) reading lines when the ask was orders.",
      slugs: ["product-sales-analysis-ii", "sales-analysis-i", "number-of-rich-customers", "basket-depth-aov", "most-frequently-ordered-product-per-customer", "group-sold-products-by-the-date", "products-worth-over-invoices"],
    },
    {
      name: "Returns, refusals & cancellation shares",
      why: "Fashion's returns economy starts pre-dispatch: 7 of 103 orders abandoned before the warehouse touches them, concentrated by market (APAC 8.1%, EU 6.7%). Every kept-rate and abandon-share screen here is a conditional count where the interviewer's first question is what the denominator holds.",
      slugs: ["immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "immediate-food-delivery-iii", "average-salary-of-departments", "count-student-number-in-departments"],
    },
    {
      name: "Repeat purchase & frequency",
      why: "App-first fashion lives on repeat rates: the top shopper books 24 of 103 orders while two shoppers booked exactly one. Frequency screens drill HAVING gates and per-shopper folds — the same shape as 'which shoppers ordered in consecutive months'.",
      slugs: ["repeat-purchase-rate", "customer-order-frequency", "confirmation-rate", "top-travellers", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Spend tiers & shopper segmentation",
      why: "Concentration is the board metric — 63.5% of revenue from 3,000-plus spenders — and tier bands are CASE-classified with fixed edges the CRM publishes. The arms must be exhaustive and ordered; a hole in the CASE is a hole in the segmentation, and a reordered WHEN quietly re-bands the base.",
      slugs: ["rfm-segmentation", "spend-histogram", "count-salary-categories", "cohort-repeat-revenue", "weather-type-in-each-country"],
    },
    {
      name: "Best-seller ladders & ranking",
      why: "Size curves guarantee ties: the units ladder runs 47, 46, 38, then a pair at 36 and three SKUs tied at 30. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow — which is a merchandising policy about peer SKUs, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "customer-placing-the-largest-number-of-orders", "duplicate-charge-pairs"],
    },
    {
      name: "Drop cadence & month walks",
      why: "Drops make the calendar the spine: 14 monthly buckets from 2024-01 to 2025-02, each carrying 6–9 orders, with the July trough at 1,193.86. Month walks (LAG deltas), period filters and half-open windows are how trading reads whether a drop landed.",
      slugs: ["unique-orders-and-customers-per-month", "list-the-products-ordered-in-a-period", "monthly-transactions-i", "maximum-transaction-each-day"],
    },
    {
      name: "Catalog-to-demand joins",
      why: "SKUs carry brand, category and price; demand inherits them through joins, and the join type decides who survives. A line without a SKU is corruption; a SKU without demand is dead stock — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["product-sales-analysis-i", "combine-two-tables", "employees-with-missing-information"],
    },
    {
      name: "NULL policy on dispatch",
      why: "shipped_at is NULL until the warehouse stamps it — 14 pending orders sit in pick-pack with no latency to average. ASOS screens check whether you treat that NULL as data to report, coalesce to zero for display, or exclude with a stated reason — deliberately, not by accident.",
      slugs: ["employee-bonus", "calculate-special-bonus", "books-with-null-ratings", "average-time-of-process-per-machine", "null-blank-audit"],
    },
    {
      name: "Ratios with honest denominators",
      why: "AOV per market (383.48 US versus 335.32 EU), kept rates, abandon shares — fashion ratios punish integer division and careless filters. The house habit: 100.0 before the division, the denominator's filter decided BEFORE the ratio, and rounding only at the very end.",
      slugs: ["queries-quality-and-percentage", "average-selling-price", "immediate-food-delivery-ii", "returns-rate-by-category", "user-activity-for-the-past-30-days-i", "product-sales-analysis-iii", "median-employee-salary"],
    },
    {
      name: "Settlement money in cents",
      why: "Kept is not settled — the finance tables (28 statements, 27 legs, INTEGER cents) are where the fashion world meets money. Every dollar read is amount_cents / 100.0, split-payment legs (5 statements pay in two) break naive SUM joins, and the exact/partial/never coverage split is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "trial-balance-check"],
    },
    {
      name: "Window frames & trailing GMV",
      why: "Running sums and moving averages smooth the 14-month spine, and the frame IS the metric: a trailing average and a cumulative walk answer different questions, and drop-night ties on created_at decide whether the frame walks ROWS or pulls peers with RANGE. The first rows of a trailing frame compute over short windows — charting them at full weight invents trend at the left edge.",
      slugs: ["find-cumulative-salary-of-an-employee", "rolling-average-steps", "restaurant-growth", "bank-account-summary", "last-person-to-fit-in-the-bus"],
    },
    {
      name: "Anti-join idiom lab",
      why: "The chase lists here are anti-joins — statements with no legs, shoppers with no kept basket — and there are three idioms with different NULL behavior: LEFT JOIN … IS NULL, NOT EXISTS, NOT IN. Picking one is a correctness statement, and proving a confident zero (never-ordered SKUs = 0 on this db) is part of the job.",
      slugs: ["sales-person", "customer-who-visited-but-did-not-transact", "find-churn-risk-customers", "customers-who-never-order", "sales-analysis-ii"],
    },
    {
      name: "Set-op stacks for the trading pack",
      why: "Board packets stack populations — kept beside dispatched, this drop beside last — and UNION's silent whole-row dedup is a correctness question, not a style one: two byte-identical branch rows collapse and a statement vanishes with no error anywhere. One ORDER BY, at the end, sorts the combined set.",
      slugs: ["movie-rating", "the-airport-with-the-most-flights", "league-statistics", "fix-product-name-format", "keep-latest-dedupe"],
    },
    {
      name: "Nested folds & platform means",
      why: "Screens escalate into staging: SKUs priced above the book mean (6 of 16 clear the 71.78 mean), orders beside their shopper's own average. Scalar, correlated and derived shapes each carry an empty-inner-query answer — NULL, not an error — you are expected to give unprompted.",
      slugs: ["second-highest-salary", "orders-with-maximum-quantity-above-average", "market-analysis-i", "product-price-at-a-given-date"],
    },
    {
      name: "One-pass funnel censuses",
      why: "The ops board wants kept, dispatched, queued and abandoned per market in ONE scan — four FILTER branches, or the portable SUM(CASE) twin, whose arms reconcile to 103 by construction. Four sequential queries are four chances to drift four populations.",
      slugs: ["create-a-session-bar-chart", "active-businesses", "user-activity-for-the-past-30-days-ii"],
    },
  ],

  theory: [
    {
      id: "asos-t1",
      q: "Your basket report joins order_items to orders and then to shoppers. When does the row grain change under you, and how do you keep the census honest?",
      a: "Say the grain out loud before you write anything. orders is one row per order — 103 here; order_items is one row per line — 251, because a fashion basket is two sizes of one dress plus the add-on. The moment order_items joins in, COUNT(*) silently reads LINES, not orders: a basket-depth report wants 251, an order-count census wants 103, and the difference is the entire question. The fixes are explicit: COUNT(DISTINCT order_id) folds lines back to orders, or pre-fold lines per order in a CTE and join the fold. Join type is the same discipline: a kept-rate joins orders to shoppers INNER — an order with no shopper is corruption; a whitespace report is LEFT from shoppers, and NULL-payload rows are the answer arriving. On this db the never-ordered anti-join returns a confident zero — every shopper appears in orders — and proving that zero beats assuming it. The reviewer's habit, and the one to copy: announce 'one row per what?' for every COUNT before the query runs, because the fan-out is where fashion reporting lies.",
      tag: "joins",
    },
    {
      id: "asos-t2",
      q: "The size curve ties: three SKUs sit at 30 units and two at 36 on the best-seller ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a merchandising policy about shared rungs, and the interviewer wants you to say that out loud. On this db the units ladder runs 47, 46, 38, 36, 36, 33, 31, then a three-way tie at 30. RANK gives tied units the same rank and skips — the 30s all read 8 and the next distinct count would land on 11, implying three phantom positions that do not exist on a shelf. DENSE_RANK shares rungs without gaps — 8, 8, 8 and the next is 9. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which SKU the merch screen features. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer SKUs (RANK or DENSE_RANK), or an explicitly named tie-breaker like units DESC, then revenue DESC, then SKU id — written in the query comment, because 'featured SKU' is a business decision the ladder should not make by accident. ASOS's size-curve reality makes this unavoidable: ties are not an edge case here, they are the shape of the data.",
      tag: "windows",
    },
    {
      id: "asos-t3",
      q: "The census says EU ran 45 orders from 8 shoppers; the US ran 19 from 2. Why two columns, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts order rows after the join — one row per order, so a shopper with 24 orders contributes 24. COUNT(DISTINCT customer_id) folds those rows back to shoppers — EU's 45 orders collapse to 8 buyers. Neither is wrong: orders measure load and drop response, shoppers measure installed base and reach. The ratio is the intensity signal — 5.6 orders per EU shopper versus 9.5 in the US on this db — and that is the read that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for the size curve and COUNT(*) silently counts lines — 251 of them — while the slide still says orders. Saying 'one row per what?' for every COUNT is the habit being graded, and pairing both grains in one row (45 beside 8, 19 beside 2) is exactly the census ASOS trading opens with, because a market that looks small on orders can look smaller on shoppers — or the reverse.",
      tag: "aggregation",
    },
    {
      id: "asos-t4",
      q: "shipped_at is NULL until the warehouse dispatches. What is your policy for the dispatch-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only dispatched orders have a latency, so the report measures order-to-dispatch for the 82 of 103 orders that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL orders returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 queued plus 7 abandoned orders, which is a feature, not a bug — that gap IS the pick-pack queue. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day dispatches for orders still in the queue. And the same policy carries into money: SUM over a statement with no settlement legs returns NULL, not zero, and printing NULL beside a labelled 'never settled' row is more honest than coalescing it to 0.00 pretending a settlement happened. A report whose WHERE clause does definitional work without saying so is exactly what an ASOS reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "asos-t5",
      q: "Trading wants kept revenue per market for markets carrying at least ten orders. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards dispatched, queued and abandoned rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-order floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. Pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a trading line and an error, and between a threshold applied to orders versus to pounds. One more trap lives in the SELECT: the abandon share is 100.0 * SUM(cancel-flag) / COUNT(*), and the 100.0 must sit BEFORE the division — over integers, 7/103 truncates to 0 and every market reads a flat 0% while the real shares are 8.1, 6.7, 5.3. The strong answer places every filter by asking: is this a fact about one order, or about a market?",
      tag: "pipeline",
    },
    {
      id: "asos-t6",
      q: "Which shoppers beat the platform's average basket value — and what does your subquery return when the inner fold comes back empty?",
      a: "Start with the shape: WHERE o.total > (SELECT AVG(total) FROM orders) is a scalar subquery, contractually 0-or-1 rows and 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 orders always produce a mean of 338.19, and the shoppers clearing it are the concentration story — 63.5% of revenue from the 3,000-plus cohort. On filtered staging tables — one market, one status, one drop month — the empty-inner-query bug ships regularly, and the above-average filter is where it hides. The correlated cousin (compare each order to ITS shopper's average) re-runs per outer row and answers a different question at a different cost. And when the filter list comes from a subquery via NOT IN, one NULL in the inner set poisons every comparison and empties the report — EXISTS or a NULL-guarded IN is the defensible form. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "asos-t7",
      q: "The drop-cadence report buckets orders by month on TEXT timestamps. How do you build the spine, cut a drop window without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The drop window: half-open intervals — created_at >= '2024-07-01' AND created_at < '2024-08-01' — because BETWEEN '2024-07-01' AND '2024-07-31' silently drops the last night's orders, and drop night is exactly when fashion orders land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The read itself: the book opens at 3,731.97, troughs at 1,193.86 in July — the month carrying 2 of the 7 abandonments — and the walk back up is what trading actually presents. Dispatch math is the same discipline in different clothes: julianday(shipped_at) - julianday(created_at) over the 82 stamped orders, 2.98 average, 2–4 band, and the 14 queued rows excluded by a stated rule, not by luck.",
      tag: "dates",
    },
    {
      id: "asos-t8",
      q: "Finance says a brand settlement statement is 'paid' but the payments table has no legs for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN a per-statement fold of settlement legs, keep the NULL side — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero legs: a status that lies, which is why payment legs are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a settlement leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The partial (#25: 4,000 of 6,148) needs the fold, not a naive join — five statements pay in two split legs Klarna-style, and joining legs before folding double-counts the billed side. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: coverage must read 21 settled in full / 1 partial / 6 never (15,217), and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "asos-t9",
      q: "Growth wants a 3-month trailing average of monthly GMV on the 14-month spine. Write the window — and tell me what the first two rows compute.",
      a: "The frame is the metric. SUM(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) over the monthly fold gives the trailing read — and the first two rows are honest about being short: January averages itself alone (3,731.97), February averages two months, and only March onward is a true three-month window. Candidates who chart those early rows at full weight ship a smoothing column that invents a trend at the left edge, which is how a flat spring becomes a fake recovery. Name the frame in the column name or the slide footer, because a trailing average and a cumulative sum answer different questions — momentum versus scale. And the tie question is live here: RANGE, the default when you ORDER BY, pulls peer rows into the frame together — harmless on a month spine, but at order grain on drop night, tied created_at seconds would double-count baskets into the walk. ROWS when you mean rows; say so out loud.",
      tag: "frames",
    },
    {
      id: "asos-t10",
      q: "The trading pack stacks 'kept orders' beside 'dispatched orders' with UNION, and a reviewer says a row vanished. Beyond dedup, what do you check on any set-op stack?",
      a: "Column contracts first: every branch emits the same number of columns, in the same order, with comparable types — SQLite rejects mismatched arity outright, and it will glue a TEXT to an INTEGER where affinity lets it, which is worse because the stack looks fine. Then NULL semantics: UNION, INTERSECT and EXCEPT treat NULLs as equal when comparing tuples — one of the few places NULL equals NULL — so two branches each carrying a NULL-market row fold together instead of staying apart. The stack takes exactly one ORDER BY, at the very end, sorting the combined set; a branch-level ORDER BY is an error here, not a hint. And label every branch with a literal source column — 'kept', 'dispatched' — so the reviewer can trace which population each row came from. The fashion-specific trap: the status map makes kept (52) and dispatched (30) mutually exclusive, so the branches cannot collide today — say WHY duplicates are impossible in a comment, and UNION ALL becomes the defensible default instead of a silent dedup you did not mean.",
      tag: "setops",
    },
    {
      id: "asos-t11",
      q: "Three idioms find 'statements with no settlement legs': LEFT JOIN … IS NULL, NOT EXISTS, NOT IN. Which do you reach for, and why does the choice survive review?",
      a: "LEFT JOIN … IS NULL is the audit-friendly shape — unmatched rows stay visible and count with the same fold as the rest of the report, which is why the AR chase uses it: 6 never-settled statements worth 15,217, one query, reconciling upward to the coverage census. NOT EXISTS is the NULL-proof one — half-join semantics, stops at the first match, and a NULL in the inner table cannot poison it because existence is evaluated row by row. NOT IN is the fragile one — the single NULL that empties the whole report is a trap worth knowing, and it is the reason this kit's dunning lists never ship on NOT IN. The habit the panel wants: name the idiom, name its NULL behavior, and say which one you would defend in review. On this clean core db all three agree; staging tables are where they diverge, and staging is where empty dunning lists ship from. Picking LEFT JOIN … IS NULL for the chase is not style — it is the choice that lets the output reconcile to the coverage census on the same slide.",
      tag: "exists",
    },
    {
      id: "asos-t12",
      q: "LATAM runs 2 orders and the churn map prints 0% for it. A colleague calls it the safest market. What is wrong with that sentence, and how does the SQL defend itself?",
      a: "Nothing is wrong with the number and everything is wrong with the claim — and the query can be made to police it. With zero cancelled of 2, 100.0 * SUM(cancel-flag) / COUNT(*) legitimately prints 0.0; the error is reading a two-order base as safety. The discipline that guards this: print the denominator beside every rate — LATAM's 2 next to the EU's 45 — and gate tiny segments in HAVING when the read is decision-grade, so a 2-row market cannot quietly masquerade as a trend. The related tool is NULLIF: NULLIF(COUNT(*), 0) turns an empty denominator into NULL so the rate reads NULL — 'no population, no rate' — instead of dividing by zero or printing a fake zero for a segment that does not exist. COALESCE is the display-layer twin and belongs only at the outermost SELECT, when the board genuinely wants blanks rendered as zeros — never buried inside the metric definition, where it hides the empty segment from the people who should be asking why it is empty.",
      tag: "nulls",
    },
    {
      id: "asos-t13",
      q: "Trading wants each drop day's SKUs folded into one cell for the recap email. Which aggregate, and what are its sharp edges?",
      a: "GROUP_CONCAT is the fold — GROUP_CONCAT(name, ', ') over order lines grouped by drop day turns one row per line into one cell per day, which is exactly a drop recap. The edges: order inside the fold is not guaranteed on this engine, so feed it an ordered subquery when the SKUs must read alphabetically and say so in the comment; the default separator is a bare comma with no space, so pass the separator explicitly; and the cell silently grows — a 54-order Accessories day produces a long cell, and downstream tools that assume short strings break in ways SQL never warns about. The deeper point is grain: a day-grain cell living inside a line-grain table, and a reviewer who re-joins it one-to-many fans their own query back out. On the catalog side the same fold is how you list the SKUs behind a market-day spike — name the grain in the column name, and never let the string become a join key.",
      tag: "concat",
    },
    {
      id: "asos-t14",
      q: "February 2025 reads 2,390.53 booked against January's 1,669.50 and everyone calls it a rebound. What is wrong with that sentence, and how do you compute the trend honestly?",
      a: "February is incomplete — the order spine runs to 2025-02-27, so the bucket is a partial month compared against full months, and the 'rebound' is mostly cutoff artifact. Honest trend work flags partial periods in the query or the title, or annualizes with an explicit, stated assumption — never silently. The mechanics underneath: timestamps are ISO TEXT, so lexicographic comparison does real date work — created_at >= '2025-02-01' AND created_at < '2025-03-01' is a correct half-open month window that also keeps the last night's orders, where BETWEEN '2025-02-01' AND '2025-02-28' silently drops them. Day-level deltas ride JULIANDAY, which returns the fractional days the 2.98-day dispatch average needs. The discipline is the one the funnel already teaches: every time bucket carries a population statement, and a clipped bucket says so on the slide — not in a footnote the trading director reads in March.",
      tag: "cutoff",
    },
    {
      id: "asos-t15",
      q: "You need each SKU's units sold, ranked, with the book-mean price beside it. Walk me through staging the query — and why one flat SELECT cannot do it.",
      a: "Because the pipeline runs once: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — a window function or a comparison against a fold needs the fold to already exist, and a flat SELECT has nowhere to put it. So stage it: a CTE folds order lines to one row per SKU — SUM(quantity), 251 lines down to 16 rows — and the outer query hangs RANK OVER (ORDER BY units DESC) and the mean-price comparison off that fold; the book mean is 71.78 and six SKUs clear it. The staging layer is where correctness lives: name the stage for what it holds, keep one fold per stage, and test the inner query alone before the outer one. SQLite inlines CTEs rather than materializing them, so a stage referenced twice re-computes twice — fine at sixteen SKUs, worth knowing at scale. The failure mode of skipping the stage is mixed grains: a units column beside a book-mean column that silently restarts per group, or a rank computed over the wrong population entirely.",
      tag: "staging",
    },
    {
      id: "asos-t16",
      q: "The ops board wants kept, dispatched, queued and abandoned per market in one scan. FILTER or SUM(CASE) — and what makes either version trustworthy?",
      a: "Both are one-pass conditional folds: COUNT(*) FILTER (WHERE status = 'shipped') and SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) produce identical numbers — FILTER reads like prose and is the modern shape; SUM(CASE) is the portable twin that folds non-count aggregates just as cleanly. What makes either trustworthy is the identity: kept + dispatched + queued + abandoned must equal COUNT(*), 103 on this db — EU 24 + 12 + 6 + 3 = 45, APAC 21 + 8 + 5 + 3 = 37 — by construction. If the branches drift from the total, a status is misspelled or an arm is missing, and the census catches it before the board meeting does. The habit it replaces is four sequential queries with four WHERE clauses: four chances to drift four populations. State the identity in the query comment; a census that reconciles is the cheapest data-quality gate the team owns, and it is the same gate the settlement coverage rollup runs on the money side.",
      tag: "census",
    },
    {
      id: "asos-t17",
      q: "A staging settlement feed lands with duplicate legs — same statement, same paid_on, same cents. How do you detect and remove duplicates without losing a legitimate split?",
      a: "Detection first: GROUP BY the full business key — invoice_id, paid_on, amount_cents — HAVING COUNT(*) > 1, and read the hits before deleting anything, because the definition of duplicate decides the answer. A true duplicate is identical on every column; a legitimate split shares a statement but differs on paid_on, rail or amount — this db has 5 statement cycles settling on both card and wire legs, and a naive dedupe on invoice_id would erase real money. Removal is a staging pattern: ROW_NUMBER() OVER (PARTITION BY the business key ORDER BY a deterministic tiebreaker) in a CTE, keep rn = 1 — and because window functions run after WHERE, the rn filter must live in an outer query, which is exactly the staging structure. The comment names the business key; six months from now that comment is the only thing standing between the feed and a silent dedupe of real settlement legs.",
      tag: "quality",
    },
    {
      id: "asos-t18",
      q: "Define sell-through for this book, then tell me which grain the query has to run at.",
      a: "Sell-through is units sold against units available: units sold ÷ (units sold + stock on hand), per SKU. The grain is the trap: it lives at the SKU grain — 16 rows — while its inputs live at different grains: sold units fold up from 251 order lines, stock sits on the products row. The Noise-Canceling Headset is the story: 46 sold against 60 on hand — a hot SKU one replenishment cycle from starving, because the shelf is nearly empty and the demand is real; compare the Desk Mat at 47 sold against 260 on hand, comfortable at a quarter sold. Blending to a platform number (498 sold against 2,845 on hand) is a valid executive roll-up but answers a different question, and averaging the per-SKU rates is neither. State the denominator — sold plus on-hand, not on-hand alone — because sell-through and stock-cover are different KPIs that share inputs. The fold is SUM, the grain is the SKU, and the definition goes on the slide.",
      tag: "kpi",
    },
    {
      id: "asos-t19",
      q: "The monthly report scans orders with WHERE SUBSTR(created_at, 1, 7) = '2024-07'. What do you say when someone calls it slow — and does it matter at this scale?",
      a: "The honest answer has two layers. The instinct layer: wrapping the column in a function — SUBSTR, UPPER, CAST — defeats any index on created_at, because the predicate is no longer a range the index can seek; the sargable rewrite is half-open — created_at >= '2024-07-01' AND created_at < '2024-08-01' — same bucket, seekable, and also the boundary-correct form. The scale layer: on 103 rows it is immeasurable, and saying so out loud is the senior move — spending a review cycle optimizing a full scan of a hundred rows is how teams learn to ignore performance advice. What carries at this scale is the habit: write the range form because it is also the correct boundary form (no last-night BETWEEN trap), keep predicates on bare columns so they stay sargable when the table grows, and reach for EXPLAIN when a report goes from instant to slow — not before. Performance discipline is proportionality plus the right default shape.",
      tag: "performance",
    },
    {
      id: "asos-t20",
      q: "You join settlement statements to legs and roll up the billed side — the total comes back inflated. Which statements doubled, and what is the fix?",
      a: "Fan-out, and the five split-rail cycles are the culprits: statements 1, 5, 12, 19 and 22 settle on BOTH card and wire legs (2 legs each), so the join duplicates each once per leg and SUM over the joined rows counts their billed side twice — 4,860, 5,284, 4,723, 5,614 and 4,459, an invented 24,940 on the billed rollup. The fix is sequencing, not cleverness: pre-aggregate the legs to statement grain first — invoice_id, SUM(amount_cents), leg count — then join that one-row-per-statement fold, and SUM the folded column. The check that catches it next time: run COUNT(*) on the join and compare against the left table's row count before trusting any SUM — 22 joined rows against 22 billed-with-legs statements means clean, 27 means five statements doubled. Fold-then-join is the default order for one-to-many money joins; join-then-fold is only safe once you have proven the many side is actually one.",
      tag: "fanout",
    },
    {
      id: "asos-t21",
      q: "For winback work, you want each shopper's gap to their NEXT order. Write it — and tell me what the last row means.",
      a: "LEAD(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id) hangs the next booking beside the current one, and the gap is JULIANDAY(next) - JULIANDAY(current) — per shopper, not per table, which is why PARTITION BY is non-negotiable: without it the 'next order' belongs to whichever shopper booked next across the whole table, and the gap column measures nothing. The last row of every partition carries a NULL next value — no further order — and that NULL is the honest state 'still open', the same baseline rule as the month spine's first LAG: never coalesce it to zero, because zero days means re-ordered the same day. Two habits finish the answer: order by created_at, id so tied timestamps resolve deterministically, and state the population — all 103 orders, every status — because a filtered version measures gaps only for survivors, which is survivorship bias wearing a window function.",
      tag: "lead",
    },
    {
      id: "asos-t22",
      q: "SKU names arrive from a boutique feed as 'asos design', 'ASOS Design' and ' ASOS DESIGN '. What is your hygiene pass before these labels join anything?",
      a: "Normalize at the read layer, once, in a CTE everyone reuses: TRIM the whitespace, UPPER or LOWER to one case, and only then join — because 'asos design' and 'ASOS Design' are one label wearing two strings, and an un-normalized join splits one SKU into two, splitting its demand history with it. The same pass covers month keys — SUBSTR(created_at, 1, 7) is a text slice, and '2024-1' would sort after '2024-02' if zero-padding ever slipped, which is why STRFTIME's '%Y-%m' is the key shape. CAST is the other edge: numeric-looking TEXT does not sort or compare like the number it looks like, so cast explicitly at the boundary and never rely on affinity to guess. The rule the panel wants: text hygiene is a correctness pass, not cosmetics — it runs before joins, it is named in the comment, and it never mutates the source.",
      tag: "text",
    },
    {
      id: "asos-t23",
      q: "The trusted-bench read prints partners' average listing price as 139.66 and 72; a colleague's 'weighted' version prints 133.55 and 62.59. Who is right?",
      a: "Both — they are measuring different grains, and the interview answer is naming the grain before defending the number. The 139.66/72 pair averages supplier rows: each partner's mean listing price, averaged across partners — Nordic's three listings count once. The 133.55/62.59 pair is lines-weighted: every order line pulls its unit_price in, so a component bought forty times weighs forty times more than one bought once — the honest shopper-side read if the question is 'what does the average basket pay', and the wrong one if the question is 'what does the average partner list'. The shapes: AVG(price) at supplier grain, SUM(quantity * unit_price) / SUM(quantity) at line grain. SQLite gives you AVG and makes you build the weighted mean yourself — which is exactly why the grain statement belongs in the query comment and on the slide, not in the follow-up question.",
      tag: "grain",
    },
    {
      id: "asos-t24",
      q: "Define attach rate for the Accessories family, then tell me the number and its denominator.",
      a: "Attach rate is the share of ORDERS that carry at least one line from the family — not the share of lines, and not revenue share. Denominator: all 103 orders placed, every status, because attach is about basket composition at the point of sale. Numerator: COUNT(DISTINCT order_id) over the lines joined to Accessories SKUs — 54 on this db, so attach reads 54 of 103, roughly 52.4%, and the DISTINCT is what stops a two-line Accessories basket from counting twice. The family nuance: Accessories is the attach family by design — 121 units on only 3 SKUs priced 14.99 to 42.50, basket filler priced to ride along — while Audio leads revenue with 11,744.01 on 97 units. Report attach beside attach VALUE and the story survives contact with merch: high attach on cheap units is a basket-depth win, not a revenue win. And say the status policy out loud — a cancelled order still proves the attach happened at checkout, which is why the denominator stays 103.",
      tag: "attach",
    },
  ],

  mcqs: [
    {
      id: "asos-mcq-1",
      prompt: "An order row's status reads 'delivered'. In this kit's ASOS stage map, what happened?",
      choices: ["Kept-and-settled — the order arrived and counted as kept", "Dispatched — with the warehouse, not yet delivered", "Abandoned pre-dispatch", "In the pick-pack queue"],
      answer: 0,
      why: "The stage map is fixed: delivered = kept-and-settled (52 of 103 orders, 50.5%). It is the only status where the order was actually kept.",
      notes: [
        { choice: 1, why: "Dispatched is 'shipped' — 30 orders in transit with shipped_at as the dispatch stamp. Calling them kept inflates the kept rate before a single parcel lands." },
        { choice: 2, why: "Abandoned pre-dispatch is 'cancelled' — 7 orders. Abandoned is a demand loss, not a kept order; mixing the two wrecks both rates." },
      ],
      difficulty: "easy",
    },
    {
      id: "asos-mcq-2",
      prompt: "Kept rate is delivered ÷ which population? The db holds 52 delivered, 30 shipped, 14 pending and 7 cancelled of 103 orders.",
      choices: ["Delivered + shipped only (52/82 = 63.4%)", "All orders placed (52/103 = 50.5%)", "Delivered + cancelled (52/59 = 88.1%)", "Distinct shoppers (52/16)"],
      answer: 1,
      why: "The house definition: kept ÷ ALL orders placed — queued and abandoned stay in the denominator because 'placed then not kept' is exactly what the metric measures. 50.5% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 21 un-dispatched orders inflates the rate to 63.4% by deleting the population still in the funnel — the rows the placed-versus-kept gap exists to watch." },
        { choice: 2, why: "52/59 cherry-picks a tidy denominator that no stakeholder recognizes. Denominators come from the funnel's definition, not from whichever subset looks flattering." },
      ],
      difficulty: "easy",
    },
    {
      id: "asos-mcq-3",
      prompt: "EU carries 45 orders from 8 shoppers. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts order rows (45); COUNT(DISTINCT customer_id) folds repeats back to shoppers (8). The gap between them — 5.6 orders per shopper — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every order has a shopper. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not shoppers — a third grain nobody asked for. The census is orders AND buyers." },
      ],
      difficulty: "easy",
    },
    {
      id: "asos-mcq-4",
      prompt: "A basket report joins orders to order_items and COUNT(*) reads 251, but the slide says 'orders'. What actually happened?",
      choices: ["The join duplicated 148 orders and must be deduplicated with DISTINCT on the SELECT list", "COUNT(*) now counts order LINES — 251 of them; count orders with COUNT(DISTINCT order_id) or pre-fold lines per order", "The db has 251 orders; the 103 figure was last quarter's", "SUM(total) was used instead of COUNT(*) somewhere upstream"],
      answer: 1,
      why: "The fan-out is the bug: 103 orders carry 251 lines (~2.4 per basket), and after the join COUNT(*) counts lines. Folding lines back — COUNT(DISTINCT order_id) — or staging a per-order fold in a CTE restores the order grain.",
      notes: [
        { choice: 0, why: "SELECT DISTINCT on whole rows hides the structure instead of naming it — the lines are real data, not duplicates, and DISTINCT is a bug mask, not a fix." },
        { choice: 2, why: "The facts are stable: 103 orders, 251 lines. The 251 is correct data counted at the wrong grain — a definition bug, not a freshness bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "asos-mcq-5",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to cancelled orders only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the abandon share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the abandon map reads zero everywhere while the real shares are 8.1 / 6.7 / 5.3." },
      ],
      difficulty: "medium",
    },
    {
      id: "asos-mcq-6",
      prompt: "Keep only SKUs carrying at least 25 units sold. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 25, before GROUP BY", "GROUP BY sku HAVING SUM(quantity) >= 25", "WHERE quantity >= 25 on the raw lines", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A units-sold floor is a group-level fact over folded demand: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the ladder above 25 units runs 47, 46, 38, 36, 36, 33, 31, 30, 30, 30, 28, 27 — the fold decides, not the raw line.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "WHERE quantity >= 25 filters individual LINES (a basket rarely has 25 units of one SKU), silently zeroing the whole result instead of ranking SKUs by folded demand." },
      ],
      difficulty: "medium",
    },
    {
      id: "asos-mcq-7",
      prompt: "The drop-cadence walk runs LAG(month_revenue) OVER (ORDER BY month) over 14 buckets, 2024-01 to 2025-02. What does the first row's delta read?",
      choices: ["0 — there is no prior month, so the delta is zero", "NULL — there is no prior month to fetch; the baseline, never a zero", "The January value mirrored — LAG wraps around", "An error — LAG refuses the first row of a partition"],
      answer: 1,
      why: "LAG fetches the previous row's value; on the spine's first row there is none, so the delta is NULL by definition. NULL is the honest baseline — coalescing it to 0 reads as 'January was flat versus December', which is a claim nobody made.",
      notes: [
        { choice: 0, why: "A zero delta means 'no movement versus a real prior month'. January's 3,731.97 opener has no comparison — printing 0 invents one and flattens the story." },
        { choice: 2, why: "LAG does not wrap. The default looks one row back and stops at the partition edge — and that edge is the whole point of the question." },
      ],
      difficulty: "medium",
    },
    {
      id: "asos-mcq-8",
      prompt: "A dunning list uses statement_id NOT IN (SELECT invoice_id FROM payments) and returns ZERO rows — but 6 statements have no legs. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL invoice_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the dunning list empties while looking valid. Policy: LEFT JOIN ... IS NULL or NOT EXISTS for anti-joins, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "The correct answer here is 6 statements worth 15,217 — a confident zero is a bug mask. Anti-joins that return zero on a db with known gaps get re-checked, not shipped." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "asos-mcq-9",
      prompt: "A board stack puts settled statements above never-settled statements in one layout, built with UNION. A reviewer says one statement's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same statement, same amounts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same statement id, same amounts, no branch label — collapse into one, and the board loses a statement with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated amount exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "asos-mcq-10",
      prompt: "A dashboard walks booked GMV order by order: SUM(total) OVER (ORDER BY created_at). Two orders share a created_at second, and the cumulative 'jumps two orders at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at order grain — drop night — they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "asos-mcq-11",
      prompt: "Dispatch latency averages 2.98 days. Which population does that average actually measure?",
      choices: ["All 103 orders placed", "The 82 orders carrying a shipped_at stamp", "The 52 delivered orders only", "The 30 shipped orders only"],
      answer: 1,
      why: "AVG over julianday deltas ignores rows where shipped_at is NULL, so the computable population is the 82 stamped orders — 2.98 days, range 2 to 4. The number is real; its population definition ships with it, or the reviewer ships it back.",
      notes: [
        { choice: 0, why: "All 103 includes the 21 rows with no stamp — AVG silently skips their NULLs, so the value is right but the claimed base is a lie the population column would expose." },
        { choice: 2, why: "Delivered-only cuts the stamped set from 82 to 52 and reports a different clock — delivered-versus-dispatched are different funnel stages with different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "asos-mcq-12",
      prompt: "Settlement statement #28 reads 175600 in amount_cents. What prints in the dollar column?",
      choices: ["175600 — cents are already dollars", "1756 — the /100 fold done in integer arithmetic", "1,756.00 — via amount_cents / 100.0", "17.56 — a ÷10,000 slip"],
      answer: 2,
      why: "Finance tables store INTEGER cents; the dollar read is amount_cents / 100.0 — the .0 forces real division and prints 1,756.00, the probed figure the dunning list quotes.",
      notes: [
        { choice: 1, why: "175600 / 100 in pure integer arithmetic is 1756 — it silently eats the cents on every odd-cent row; the missing .0 is the whole bug." },
        { choice: 0, why: "Skipping the fold inflates the read a hundredfold — the dunning letter would ask for 175,600 dollars on a 1,756.00 statement." },
      ],
      difficulty: "easy",
    },
    {
      id: "asos-mcq-13",
      prompt: "The pricing census bands SKUs budget (< 50) and mid (50–200). A reviewer asks for the premium band (>= 200) row. What does this db return?",
      choices: ["The priciest SKU alone", "An empty band — max price is 199.99, so zero SKUs qualify", "8 SKUs — the mid band spills over", "An error — CASE arms cannot be empty"],
      answer: 1,
      why: "The price ladder tops out at 199.99 (Smart Watch S), so the premium band is legitimately empty — printing it as zero with the threshold stated is the honest census, not a gap.",
      notes: [
        { choice: 0, why: "199.99 is mid-band by the published edge; a premium row would need 200 or more, and nothing on this book clears it." },
        { choice: 2, why: "8 SKUs is the mid band (average 111.50); spilling it into premium is a band-edge bug, not a census finding." },
      ],
      difficulty: "easy",
    },
    {
      id: "asos-mcq-14",
      prompt: "The pre-dispatch loss list LEFT JOINs shoppers to cancelled orders and counts with COUNT(o.id). Why COUNT(o.id) and not COUNT(*)?",
      choices: ["COUNT(*) is slower on joins", "COUNT(*) counts the LEFT JOIN's NULL-payload row too, so every shopper reads at least 1 abandoned basket", "COUNT(o.id) counts NULLs, COUNT(*) does not", "They are identical after GROUP BY"],
      answer: 1,
      why: "Clean shoppers arrive from the LEFT JOIN with a NULL payload row; COUNT(o.id) skips NULLs and reads 0 — the honest zero the census keeps — while COUNT(*) reads 1 and manufactures abandonment.",
      notes: [
        { choice: 2, why: "Backwards — COUNT(column) skips NULLs and COUNT(*) counts rows; the whole point of the idiom is that distinction." },
        { choice: 3, why: "Identical only on INNER joins. On a LEFT JOIN the NULL-payload rows are exactly the zeros the census exists to report." },
      ],
      difficulty: "easy",
    },
    {
      id: "asos-mcq-15",
      prompt: "The assortment census reports '3 SKUs' for Accessories. Which fold produces that number?",
      choices: ["COUNT(*) over the category's order lines", "COUNT(DISTINCT p.id) after the join to products", "SUM(quantity) over the category's lines", "COUNT(DISTINCT order_id) over the category's lines"],
      answer: 1,
      why: "3 is a catalog count — Accessories lists 3 SKUs (HDMI cable, Desk Mat, Laptop Stand) — and COUNT(DISTINCT p.id) folds dozens of order lines back to the listed book.",
      notes: [
        { choice: 0, why: "COUNT(*) reads lines — Accessories touches 54 orders across many more lines; that is demand, not catalog." },
        { choice: 2, why: "SUM(quantity) is the units crown — 121 — a different column of the same census with a different story." },
      ],
      difficulty: "easy",
    },
    {
      id: "asos-mcq-16",
      prompt: "The 2.98-day average dispatch latency — which expression computes one order's latency?",
      choices: ["created_at - shipped_at", "julianday(shipped_at) - julianday(created_at)", "shipped_at - created_at", "julianday(created_at) - julianday(shipped_at)"],
      answer: 1,
      why: "Timestamps are ISO TEXT; TEXT minus TEXT coerces to numbers and lands near zero. JULIANDAY converts each stamp to a fractional day count, and dispatch-minus-created is the positive clock — averaging 2.98 over the 82 stamped orders.",
      notes: [
        { choice: 3, why: "Right functions, wrong order — every latency prints negative and the 'average' reads -2.98, which nobody screenshots for the good news slide." },
        { choice: 0, why: "TEXT arithmetic coerces the stamps to their leading digits — 2024 minus 2024 is 0, a flat fake clock that looks plausible in a dashboard." },
      ],
      difficulty: "easy",
    },
    {
      id: "asos-mcq-17",
      prompt: "Trading cuts a drop window as BETWEEN '2024-07-01' AND '2024-07-31' on created_at. What is wrong?",
      choices: ["BETWEEN cannot filter timestamps", "It silently drops orders placed on the last night — the closed upper bound stops at July 31 00:00:00", "It includes August", "Timestamps need CAST before BETWEEN"],
      answer: 1,
      why: "created_at carries a time component, so BETWEEN's closed bound cuts off at the stroke of midnight on July 31 — and drop night is exactly when fashion orders land. The half-open form — >= '2024-07-01' AND < '2024-08-01' — keeps the last night.",
      notes: [
        { choice: 2, why: "The opposite: BETWEEN EXCLUDES August 1 — the bug is the missing last night, not extra days." },
        { choice: 0, why: "BETWEEN filters timestamps fine — the failure is boundary semantics, not syntax." },
      ],
      difficulty: "medium",
    },
    {
      id: "asos-mcq-18",
      prompt: "A month spine is keyed by STRFTIME('%m', created_at). What does the 2024-to-2025 trend read?",
      choices: ["Correct — %m is the month", "Broken — %m alone merges January 2024 with January 2025 into one '01' bucket", "Broken — %m returns day-of-week", "Correct but slow"],
      answer: 1,
      why: "The spine needs '%Y-%m' — year plus zero-padded month — for 14 distinct buckets from 2024-01 to 2025-02; '%m' alone folds both Januaries into '01' and the trend becomes fiction.",
      notes: [
        { choice: 2, why: "%m is zero-padded month; day-of-week is %w — but either way the missing year is the actual bug." },
        { choice: 0, why: "It runs and prints numbers — 12 buckets instead of 14 — which is exactly why this bug ships: nothing errors." },
      ],
      difficulty: "medium",
    },
    {
      id: "asos-mcq-19",
      prompt: "The churn map divides cancelled by orders per market, and one market could come up with no orders at all. What guards the read?",
      choices: ["NULLIF(COUNT(*), 0) so an empty market reads NULL, not a crash or a fake zero", "COALESCE(rate, 0) buried inside the metric definition", "SUM(cancel-flag) alone — the rate is decoration", "A DISTINCT on region"],
      answer: 0,
      why: "NULLIF turns a zero denominator into NULL — 'no population, no rate' — the honest state for a segment with no base; LATAM's real 0-of-2 still prints 0.0 with its 2-row base stated beside it.",
      notes: [
        { choice: 1, why: "COALESCE is display-layer: burying it inside the definition hides empty segments from the people who should be asking why they are empty." },
        { choice: 2, why: "A count without its base is not a rate — the denominator beside the numerator is the deliverable." },
      ],
      difficulty: "easy",
    },
    {
      id: "asos-mcq-20",
      prompt: "Which EXCEPT answers 'markets that shipped orders but never cancelled one'?",
      choices: ["SELECT region FROM orders WHERE status='shipped' EXCEPT SELECT region FROM orders WHERE status='cancelled'", "SELECT region FROM orders EXCEPT SELECT region FROM orders", "SELECT region FROM orders WHERE status='shipped' UNION SELECT region FROM orders WHERE status='cancelled'", "SELECT region FROM orders WHERE status='shipped' AND status='cancelled'"],
      answer: 0,
      why: "EXCEPT keeps left-set rows absent from the right set — shipped-markets minus cancelled-markets. On this db every shipping market also cancelled one (APAC 3, EU 3, US 1), so the honest result is empty — and proving that emptiness is the read.",
      notes: [
        { choice: 2, why: "UNION merges both sets — the union of shipped and cancelled markets, which is the opposite question." },
        { choice: 3, why: "status cannot equal two literals at once — the predicate is UNKNOWN on every row and the query returns nothing for the wrong reason." },
      ],
      difficulty: "medium",
    },
    {
      id: "asos-mcq-21",
      prompt: "On a one-market staging copy, the above-average filter WHERE total > (SELECT AVG(total) FROM orders) returns ZERO rows. First suspicion?",
      choices: ["No order beats the average — empty is plausible", "The inner fold came back empty — AVG of zero rows is NULL, total > NULL is UNKNOWN, and the report silently empties while looking valid", "AVG needs GROUP BY here", "The comparison needs DISTINCT"],
      answer: 1,
      why: "On a filtered or truncated staging table the inner SELECT can legitimately return no rows; its AVG is NULL, the comparison goes UNKNOWN for every row, and the confident zero reads as 'nothing above average' instead of the bug it is.",
      notes: [
        { choice: 0, why: "On the full book the mean is 338.19 and plenty of orders clear it; a confident zero on staging is a bug mask, not a finding." },
        { choice: 2, why: "AVG over the whole table is a scalar — GROUP BY would change the question to per-group means, which is a different report." },
      ],
      difficulty: "medium",
    },
    {
      id: "asos-mcq-22",
      prompt: "A settled-dollars report joins settlement statements to legs raw and SUMs. Five statements pay in 2 split legs. What happens?",
      choices: ["Nothing — SUM collapses the duplicates", "The statement side doubles on those five — SUM over the join counts each 2-leg statement's billed value once per leg", "Only the leg side inflates", "SQLite errors on the fan-out"],
      answer: 1,
      why: "The join emits one row per leg, so the five split-rail cycles (statements 1, 5, 12, 19, 22) contribute their billed side twice — an invented 24,940 on the rollup. Pre-fold the legs to statement grain, then join.",
      notes: [
        { choice: 0, why: "SUM has no dedup instinct — it adds every row it is handed; the fold is your job, not the engine's." },
        { choice: 2, why: "The leg side is the many side — it IS the raw truth; the billed side is what gets invented by the join." },
      ],
      difficulty: "medium",
    },
    {
      id: "asos-mcq-23",
      prompt: "A per-shopper ladder uses LEAD(created_at) OVER (ORDER BY created_at) with no PARTITION BY. What does the gap column measure?",
      choices: ["Each shopper's gap to their own next order", "The gap to the next order IN THE TABLE — any shopper's — so the column measures nothing about shoppers", "The platform's average gap", "An error — LEAD requires PARTITION BY"],
      answer: 1,
      why: "Without PARTITION BY the window is the whole result set: a shopper's 'next order' is whoever booked next platform-wide. The fix is PARTITION BY customer_id — per-shopper windows — with the last row of each partition NULL.",
      notes: [
        { choice: 0, why: "That needs PARTITION BY customer_id — the one clause this query is missing." },
        { choice: 3, why: "It runs happily and prints confident nonsense — the worst failure mode a window can have." },
      ],
      difficulty: "medium",
    },
    {
      id: "asos-mcq-24",
      prompt: "Growth tiles shoppers into quintiles by lifetime spend for the CRM tiers. Which window does it?",
      choices: ["NTILE(5) OVER (ORDER BY spend DESC)", "ROUND(spend / 5)", "TOP 5 PERCENT", "GROUP BY quintile"],
      answer: 0,
      why: "NTILE(5) buckets the ordered population into five equal-ish tiles — the RFM-style tiering the CRM publishes; the 63.5% concentration story lives in tile 1.",
      notes: [
        { choice: 1, why: "Dividing spend by 5 makes buckets of pounds, not buckets of shoppers — the tier sizes would be arbitrary." },
        { choice: 2, why: "TOP N is a row limit, not a population partition — and it is not SQLite anyway." },
      ],
      difficulty: "medium",
    },
    {
      id: "asos-mcq-25",
      prompt: "The coverage census CASE reads: WHEN paid IS NULL THEN 'never settled'. A colleague wraps the fold upstream as COALESCE(paid, 0). What happens to the 6 never-settled statements?",
      choices: ["They still read 'never settled' — COALESCE is invisible", "They fall into the 'partial' arm — 0 < billed — and the dunning list re-labels 6 statements worth 15,217 as partials", "They read 'settled'", "The query errors on the CASE"],
      answer: 1,
      why: "The NULL test IS the never-settled detector; coalescing the fold upstream feeds 0 where NULL used to be, 0 < billed is true, and six statements silently re-classify — the dunning list becomes a partials list and the 15,217 chase dies.",
      notes: [
        { choice: 0, why: "Invisible is the problem: the arm matches on NULL, and COALESCE removes exactly that NULL." },
        { choice: 2, why: "0 is not at or above billed — the settled arm needs the fold to reach it; the trap is the partial arm sitting in between." },
      ],
      difficulty: "hard",
    },
    {
      id: "asos-mcq-26",
      prompt: "One scan must produce kept, dispatched, queued and abandoned per market. Which branch shape belongs in the SELECT?",
      choices: ["Four WHERE clauses", "COUNT(*) FILTER (WHERE status = 'pending') — one per branch, arms reconciling to COUNT(*)", "Four separate queries UNIONed", "LIMIT 4 per market"],
      answer: 1,
      why: "FILTER (WHERE …) branches per aggregate inside one pass — the modern shape; SUM(CASE …) is the portable twin. The identity kept + dispatched + queued + abandoned = COUNT(*) is what makes the census trustworthy.",
      notes: [
        { choice: 0, why: "WHERE filters rows out of the whole scan — four of them are four different queries; the branches must live inside the aggregates." },
        { choice: 2, why: "UNION stacks rows, it does not build columns — the census needs one row per market." },
      ],
      difficulty: "medium",
    },
    {
      id: "asos-mcq-27",
      prompt: "An anti-join for never-ordered SKUs returns 0 rows, but the brief expected some. Walk the diagnosis.",
      choices: ["The anti-join is wrong — rewrite with NOT IN", "Prove the zero first: 16 SKUs listed and every one appears in order_items — the confident zero is the correct, probed answer; then check the join key and the idiom before shipping", "LEFT JOIN always returns zeros for unmatched rows — nothing to check", "Add a HAVING COUNT(*) > 0 to force rows"],
      answer: 1,
      why: "This db's never-ordered anti-join is genuinely empty — all 16 SKUs carry demand. The discipline: verify the zero against the census (16 listed, all sold), confirm the join key is product_id, and confirm the idiom (LEFT JOIN … IS NULL or NOT EXISTS) before declaring the brief wrong.",
      notes: [
        { choice: 0, why: "NOT IN over an unguarded column risks the NULL-poisoned empty — the opposite of a diagnosis." },
        { choice: 2, why: "LEFT JOIN returns NULL payloads for unmatched rows — whether the count is zero is exactly what you must prove, not assume." },
      ],
      difficulty: "hard",
    },
    {
      id: "asos-mcq-28",
      prompt: "Each order should sit beside ITS shopper's average basket value. Which shape is right — and what does it cost?",
      choices: ["A scalar subquery computed once for the platform", "A correlated subquery — (SELECT AVG(total) FROM orders o2 WHERE o2.customer_id = o.customer_id) — re-run per outer row; right answer, per-row cost", "A GROUP BY on orders alone", "A CROSS JOIN to the shopper fold"],
      answer: 1,
      why: "The comparison is per-shopper, so the inner fold must see the outer row — correlated — and it re-runs per order. At 103 orders that is cheap; the senior point is knowing the cost shape and staging the per-shopper fold in a CTE when the table grows.",
      notes: [
        { choice: 0, why: "A one-shot scalar compares every order to the PLATFORM mean (338.19) — a different question with a different answer." },
        { choice: 2, why: "GROUP BY collapses to one row per shopper — the per-order grain the ask demands is gone." },
      ],
      difficulty: "hard",
    },
    {
      id: "asos-mcq-29",
      prompt: "Two filters bucket March identically: WHERE SUBSTR(created_at,1,7)='2024-03' and the half-open range >= '2024-03-01' AND < '2024-04-01'. Why does the range form win?",
      choices: ["It is faster on this db — 103 rows feel it", "It is sargable (bare column, seekable) AND boundary-correct — no last-night loss — so it stays right as the table grows", "SUBSTR is not valid SQLite", "The range form only helps with an index on month"],
      answer: 1,
      why: "The wrapped predicate defeats any index on created_at, while the range seeks; and the half-open bound keeps March 31's late orders where BETWEEN loses them. At 103 rows the speed is immeasurable — the win is the habit plus the correctness.",
      notes: [
        { choice: 0, why: "On 103 rows both are instant — performance is the wrong reason here; the right default shape is the point." },
        { choice: 2, why: "SUBSTR is perfectly valid SQLite — the issue is indexability and boundary semantics, not validity." },
      ],
      difficulty: "hard",
    },
    {
      id: "asos-mcq-30",
      prompt: "The trusted bench (rating >= 4.5) prints average listing price 139.66; a lines-weighted version prints 133.55. Which belongs on the supplier-review slide?",
      choices: ["133.55 — weighted is always more honest", "139.66 — the slide's question is what the average partner lists, a supplier-grain mean; the lines-weighted 133.55 answers what the average basket pays", "Either — they are the same number rounded", "Neither — average price is meaningless"],
      answer: 1,
      why: "Same inputs, different grains: 139.66 averages partner rows (Nordic's three listings count once); 133.55 lets every order line pull its price — basket-side truth. The slide states its grain, and the number follows the question.",
      notes: [
        { choice: 0, why: "Weighted is not 'more honest' — it answers a different question; grain follows the ask." },
        { choice: 2, why: "They differ by real money — Nordic's premium listings weigh less per-line than per-row; the gap IS the grain lesson." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-asos-1",
      tier: "easy",
      topic: "j7",
      universe: "catalog",
      title: "The assortment weight census",
      brief:
        "ASOS-flavored brief on the storefront db: Monday's trading review opens with the assortment weight census — which product lines carry the SKU book. Trading is explicit that the read is two-grain: distinct SKUs listed per line, units sold per line, and line revenue to 2 decimals, because the units leader and the revenue leader are different lines by design. Probed facts: 16 SKUs across 7 product types; 251 order lines over 103 orders worth 34,833.28; the probed crowns read the premium audio line (Audio) at 3 SKUs / 97 units / 11,744.01 revenue and the add-on line (Accessories) at 3 SKUs / 121 units / 3,294.29 — more units, a quarter of the value. The review reads biggest revenue first.",
      ask: "Return each product type with its distinct SKU count, total units sold and revenue to 2 decimals, biggest revenue first.",
      template:
        "SELECT p.category AS product_type,\n       COUNT({1} p.id) AS skus_listed,\n       SUM(oi.quantity) AS units_sold,\n       ROUND(SUM(oi.quantity * oi.unit_price), {2}) AS revenue\nFROM order_items oi\nJOIN products p ON p.id = {3}\nGROUP BY p.category\nORDER BY revenue {4};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the SKU deduplicator",
          why: "COUNT(DISTINCT p.id) folds repeat lines back to SKUs: the add-on line reads 3, not its dozens of order lines. SUM(DISTINCT …) adds id codes together and MAX(DISTINCT …) reports the largest id — neither is a catalog census.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the revenue precision",
          why: "Revenue prints to 2 decimals — the premium line's 11,744.01. ROUND(…, 1) prints 11,744.0 and the crowns stop reconciling with the 34,833.28 book total trading quotes on the same slide.",
        },
        {
          answer: "oi.product_id",
          kind: "keyword",
          label: "the catalog join key",
          why: "The join keys demand to catalog: p.id = oi.product_id attaches each line's SKU. Joining on oi.id instead matches order-line ids against SKU ids — a coincidental partial overlap that mislabels demand and corrupts every crown.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-revenue-first direction",
          why: "The review reads biggest revenue on top: 11,744.01 down to 863.91. ASC would open the meeting on the smallest line — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", "1", "oi.id", "ASC"],
      walkthrough:
        "One join, one fold, three columns at two grains. The join attaches every order line to its SKU — 251 lines over 103 orders — and GROUP BY product type folds them into seven rows where COUNT(DISTINCT p.id) reads SKUs listed (3 / 2 / 2 / 3 / 3 / 2 / 1 — the 16-SKU book), SUM(oi.quantity) reads units (97 / 53 / 61 / 85 / 121 / 54 / 27), and ROUND(SUM(quantity * unit_price), 2) reads revenue (11,744.01 / 6,929.12 / 5,198.41 / 4,818.61 / 3,294.29 / 1,984.93 / 863.91) — the probed crowns verbatim, reconciling up to the 34,833.28 book. The two-grain read is the story: the add-on line leads units (121) but prints 3,294.29 — basket filler priced to attach — while the premium line turns 97 units into 11,744.01. The distractors fail honestly: SUM in the SKU slot adds id codes together and MAX reports the largest id — a census of nothing; 1 in the precision slot truncates to one decimal and drifts off the book total; oi.id in the join key matches line ids to SKU ids and mislabels demand; ASC opens the review on the smallest line. Assortment weight is a policy read: where the units live is not where the money lives.",
    },
    {
      id: "cs-asos-2",
      tier: "medium",
      topic: "s6",
      universe: "refund-audit",
      title: "The settlement coverage census",
      brief:
        "ASOS-flavored brief on the storefront db: finance ops runs the brand settlement census at every close — 28 settlement statements (invoices) checked against 27 settlement legs (payments), where 5 statements pay in 2 split legs Klarna-style. The probed coverage rollup reads: 21 statements settled in full (65,612 billed, 65,612 settled), 1 partial (6,148 billed, 4,000 settled — statement #25), and 6 never-settled worth 15,217. Two anomalies sit in the row-level list: #11 is void at 925.00 yet carries a settlement leg, and #28 is paid-status at 1,756.00 with zero legs — a status that lies. Money is INTEGER cents; the dollar read is amount_cents / 100.0. Never-settled statements must be labelled and counted, not silently dropped.",
      ask: "Classify each statement's coverage (never settled / partial / settled), then return per bucket the statement count, billed and settled totals to 2 decimals, biggest bucket first.",
      template:
        "WITH paid AS (\n  SELECT invoice_id, SUM(amount_cents) AS paid_cents\n  FROM payments\n  GROUP BY invoice_id\n)\nSELECT CASE\n         WHEN pay.paid_cents IS NULL THEN {1}\n         WHEN pay.paid_cents < {3} THEN 'partial'\n         ELSE 'settled'\n       END AS coverage,\n       COUNT(*) AS statements,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed,\n       ROUND(SUM(COALESCE(pay.paid_cents, {2})) / 100.0, 2) AS settled\nFROM invoices i\nLEFT JOIN paid pay ON pay.invoice_id = i.id\nGROUP BY coverage\nORDER BY statements {4};",
      slots: [
        {
          answer: "'never settled'",
          kind: "keyword",
          label: "the empty-ledger label",
          why: "Statements with no settlement legs arrive from the LEFT JOIN with a NULL fold — CASE labels them 'never settled' and they stay counted. 'Settled' there would merge the 6 never-collected statements (15,217) into the healthy bucket and the dunning list dies silently.",
        },
        {
          answer: "0",
          kind: "number",
          label: "the empty-fold fallback",
          why: "COALESCE(paid_cents, 0) makes the never-settled bucket's settled total print 0 instead of NULL — SUM over no legs is NULL, and the coverage rollup the close reconciles against prints 0 for that bucket.",
        },
        {
          answer: "i.amount_cents",
          kind: "keyword",
          label: "the billed-side comparison",
          why: "Partial means legs cover less than billed: pay.paid_cents < i.amount_cents. Comparing the fold to itself is always false and the partial bucket vanishes; comparing against the id mixes grains and mis-bands nearly every statement.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bucket-first direction",
          why: "The close reads the healthiest bucket first: settled 21, never settled 6, partial 1. ASC would lead the deck with the single partial statement — a correct census aimed at the wrong end of the review.",
        },
      ],
      distractors: ["100", "1", "NULL", "ASC"],
      walkthrough:
        "Two stages: fold the legs, then classify the statements. The CTE folds 27 legs into per-statement paid_cents — this pre-fold is what makes the 5 split-payment statements (2 legs each) sum once instead of double-counting the billed side — and the LEFT JOIN keeps all 28 statements, NULL fold included. The CASE reads the probed rollup exactly: 21 settled in full (billed 65,612, settled 65,612), 6 never-settled (15,217 billed, 0 settled — COALESCE prints the 0), and 1 partial (6,148 billed, 4,000 settled — statement #25), reconciling to the anomalies list where #11 is void-but-settled at 925.00 and #28 is paid-status with zero legs at 1,756.00, hidden inside the never-settled bucket. The /100.0 cents rule is why the cells match the probed dollars. The distractors each break differently: 100 in the fallback inflates the never-settled bucket's settled total to 600.00; 1 prints 0.06; NULL leaves the settled cell NULL where the rollup promises 0; 100, 1 or NULL dropped into the comparison slot mis-bands the partial — every fold clears 925, so the bucket vanishes and the partial hides inside settled; ASC leads the close with the 1-statement partial bucket. The census rule holds: every bucket counts, every label is a claim the legs must support.",
    },
    // Wave-3x expansion (Task 103): cs-asos-3..6. Families t5 / j4 / t3 / q2 — distinct from
    // the kit's j7 + s6 and from each other. Every figure verbatim from scripts/company-facts.md
    // or probe-verified read-only against db/custom.db (probe-derived cells: book-mean price
    // 71.78 with 6 of 16 SKUs above it; per-shopper abandon ledger Alice Chen 3 / Maya Patel 2 /
    // Emma Wilson 1 / Keiko Sato 1 with 12 clean shoppers; per-market stamped latency US 15 @
    // 3.07, EU 36 @ 2.94, APAC 29 @ 2.93, LATAM 2 @ 3.5).
    {
      id: "cs-asos-3",
      tier: "easy",
      topic: "t5",
      universe: "catalog",
      title: "The size-curve ladder",
      brief:
        "ASOS-flavored brief on the storefront db: the size-curve ladder is the merch standup's opener and the tie policy is the headline. Probed on the storefront db: 16 SKUs carry the sold book — 251 order lines over 103 orders worth 34,833.28 — and the units ladder runs 47, 46, 38, then a two-way tie at 36, then 33, 31, then a three-way tie at 30, with 28 and 27 right behind. The published policy is shared rungs with gaps — RANK semantics — and today's cut keeps every SKU carrying at least 27 units, so the 30-tie block has followers beneath it and the skip is visible. Read biggest units first; ties share their rung and the next distinct count skips.",
      ask: "Return each SKU with its units sold and shared-rung rank, keeping SKUs with at least 27 units, biggest units first with the tie policy applied.",
      template:
        "WITH sold AS (\n  SELECT p.id,\n         p.name AS sku,\n         p.category,\n         SUM(oi.quantity) AS units\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.id\n  HAVING SUM(oi.quantity) >= {1}\n)\nSELECT id,\n       sku,\n       category,\n       units,\n       {2}() OVER (ORDER BY units {3}) AS ladder_rank\nFROM sold\nORDER BY ladder_rank, units DESC;",
      slots: [
        {
          answer: "27",
          kind: "number",
          label: "the ladder floor",
          why: "The floor keeps the ladder a tie-policy read: 12 SKUs carry 27-plus units, so the three-way 30 tie has 28 and 27 right beneath it — the rows that make RANK's skip to 11 visible. A floor of 28 cuts them and the tie block goes terminal.",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the shared-rungs-then-skip ranker",
          why: "The published policy is shared rungs with gaps: the 30-tie consumes ranks 8 through 10 and 28 lands on 11. DENSE_RANK would hand 28 rank 9 — a different policy printed as a different number.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-units-first direction",
          why: "The ladder reads 47, 46, 38 from the top. ASC flips it and the standup opens on the 27-unit Yoga Mat — a correct query aimed at the wrong end of the review.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "NTILE", "ASC", "28", "23"],
      walkthrough:
        "Two stages: fold 251 order lines to one row per SKU, then hang the rank window off the fold. The CTE keeps the 12 SKUs carrying at least 27 units; RANK() OVER (ORDER BY units DESC) prints the published shared-rungs-then-skip policy: Desk Mat 47, Headset 46 and HDMI 38 on ranks 1 to 3, the two 36s (Wireless Mouse, Laptop Stand) sharing rank 4 with the next distinct count landing on 6, then 33 and 31 on 6 and 7, the three 30s (Studio Mic, Ring Light, Fitness Band) sharing rank 8 — and 28, 27 landing on 11, the skip made visible by the followers beneath the tie. The distractors each break the read: DENSE_RANK prints 9 after the tie block — shared rungs, no gaps, a different policy wearing the same column name; ROW_NUMBER splits the three 30s arbitrarily with no stated rule; NTILE() errors because the function demands an argument; ASC flips the ladder and opens the standup on the smallest kept SKU; a floor of 28 drops the 27-unit Yoga Mat and leaves the tie terminal; a floor of 23 drags the 23-unit Smart Watch in and dilutes the read. Ranks and units are two columns of one claim: what moves, and who shares the rung.",
    },
    {
      id: "cs-asos-4",
      tier: "medium",
      topic: "j4",
      universe: "funnel",
      title: "The pre-dispatch loss list",
      brief:
        "ASOS-flavored brief on the storefront db: the pre-dispatch loss list is the CRM pod's Monday read — baskets abandoned before the warehouse touches them. Probed on the storefront db: 7 of 103 orders cancelled (6.8%), and the per-shopper ledger reads Alice Chen 3, Maya Patel 2, Emma Wilson 1, Keiko Sato 1 — with 12 shoppers carrying none. Regional shares for context: APAC 8.1%, EU 6.7%, US 5.3%. The census keeps the zeros — a zero is the good news the CRM reads — so the join must be LEFT with the status filter riding in the ON clause, and the count must skip the NULL payloads. Biggest exposure first, shopper name as the tiebreak.",
      ask: "Return every shopper with their abandoned-basket count, zeros included, biggest count first with shopper name as the tiebreak.",
      template:
        "SELECT c.name AS shopper,\n       c.region AS market,\n       COUNT({1}) AS abandoned_baskets\nFROM customers c\n{2} JOIN orders o ON o.customer_id = c.id AND o.status = {3}\nGROUP BY c.id, c.name, c.region\nORDER BY abandoned_baskets {4}, shopper;",
      slots: [
        {
          answer: "o.id",
          kind: "keyword",
          label: "the payload-only counter",
          why: "COUNT(o.id) counts payload rows only, so clean shoppers read 0 — the honest zero the census keeps. COUNT(*) counts the LEFT JOIN's NULL-payload row and fabricates 1 abandonment for all 12 clean shoppers.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the keep-every-shopper join",
          why: "LEFT JOIN keeps all 16 shoppers and lets the unmatched arrive as NULL payloads — the zeros ARE the answer. INNER would drop the 12 clean shoppers before the SELECT ever runs.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the abandoned-status literal",
          why: "Abandoned pre-dispatch is status 'cancelled' — 7 of 103. 'shipped' counts dispatches and the loss list becomes a dispatch log; the literal is the definition, quoted or it is not a status.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure-first direction",
          why: "The chase reads Alice Chen's 3 first, then Maya's 2, then the two 1s — biggest exposure first. ASC buries the list under twelve zeros and the review opens on the good news.",
        },
      ],
      distractors: ["*", "c.id", "INNER", "CROSS", "'shipped'", "ASC"],
      walkthrough:
        "The census is the LEFT JOIN's honest output: every one of the 16 shoppers survives the join, and COUNT(o.id) counts only the payload rows that matched a cancelled order — Alice Chen reads 3, Maya Patel 2, Emma Wilson and Keiko Sato 1 each, and 12 shoppers read 0, the good news the census exists to show. The 7 abandoned baskets reconcile to the probed 7 of 103 (6.8%), and the regional shares — APAC 8.1%, EU 6.7%, US 5.3% — re-cut cleanly on top. The status filter lives in ON, not WHERE: moving it to WHERE would turn the LEFT into an INNER and silently delete every zero. The distractors each break it: COUNT(*) counts the NULL-payload row too, so every shopper reads at least 1 and the census manufactures abandonment; COUNT(c.id) counts the left side, which is never NULL — the same fabrication; INNER JOIN drops the 12 clean shoppers and ships a four-row 'census'; CROSS JOIN with an ON clause mis-parses or fan-outs the whole book; 'shipped' counts dispatches, not abandonments; ASC buries the loss list under twelve zeros. Zeros are data: the census keeps them, the chase list skips them.",
    },
    {
      id: "cs-asos-5",
      tier: "hard",
      topic: "t3",
      universe: "inventory",
      title: "The dispatch clock by market",
      brief:
        "ASOS-flavored brief on the storefront db: the dispatch clock is the ops heartbeat — order placed to warehouse dispatch, measured only where the shipped_at stamp exists. Probed on the storefront db: 82 of 103 orders carry the stamp, averaging 2.98 days with a 2–4 day spread; per market the probed reads are US 15 stamped at 3.07, EU 36 at 2.94, APAC 29 at 2.93, LATAM 2 at 3.5. Today's cut keeps markets carrying at least 15 stamped orders — LATAM's two stamped orders stay on the all-market census — and bands each market at the 3.00 SLA edge: at or under reads on_promise, over reads drifting. Slowest market first, so the drift opens the review.",
      ask: "Return each qualifying market with its stamped-order count, average dispatch latency to 2 decimals and clock class at the 3.00 edge, slowest first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS stamped_orders,\n       ROUND(AVG(JULIANDAY(o.shipped_at) - JULIANDAY(o.created_at)), 2) AS avg_days,\n       CASE WHEN AVG(JULIANDAY(o.shipped_at) - JULIANDAY(o.created_at)) <= {2} THEN 'on_promise' ELSE 'drifting' END AS clock_class\nFROM orders o\nJOIN customers c ON c.id = {4}\nWHERE o.{1} IS NOT NULL\nGROUP BY c.region\nHAVING COUNT(*) >= {3}\nORDER BY avg_days {5};",
      slots: [
        {
          answer: "shipped_at",
          kind: "keyword",
          label: "the stamp that defines the population",
          why: "The stamp defines the population: 82 of 103 orders carry shipped_at; the 14 queued and 7 abandoned have no clock to average. created_at IS NOT NULL is vacuously true — every order passes and the counts inflate to the full book.",
        },
        {
          answer: "3.0",
          kind: "number",
          noVerify: true,
          label: "the SLA band edge",
          why: "The SLA edge is 3.00 days: EU 2.94 and APAC 2.93 land on_promise, US 3.07 is the drift. Nudge the edge to 2.9 and EU drifts too; 3.5 flatters the US book back inside the promise.",
        },
        {
          answer: "15",
          kind: "number",
          label: "the market floor",
          why: "The floor is the US book: 15 stamped orders. It keeps EU 36, US 15, APAC 29 and leaves LATAM's two stamped orders on the all-market census — a 2-row market cannot pose as a trend.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the demand-to-market join key",
          why: "The join keys demand to market: c.id = o.customer_id attaches each order to its shopper's region. Joining on o.id mislabels every order; joining on a constant fans the whole book onto one market.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the slowest-first direction",
          why: "The ops review reads slowest-first: US 3.07 drifting on top. ASC would open on APAC 2.93 — the healthiest market — and the drift hides at the bottom of the page.",
        },
      ],
      distractors: ["created_at", "16", "2", "ASC", "pending", "'drifting'"],
      walkthrough:
        "One join, one stamp filter, one clock. WHERE shipped_at IS NOT NULL keeps the 82 stamped orders — the population the 2.98-day average actually measures — and the market fold prints the probed latencies: US 15 stamped at 3.07, EU 36 at 2.94, APAC 29 at 2.93, all to 2 decimals; the HAVING floor of 15 leaves LATAM's two stamped orders (3.5) on the all-market census, where a 2-row market cannot pose as a trend. The CASE band reads the 3.00 edge: EU and APAC land on_promise, US — 3.07 — is the drifting market the ops review opens on. The distractors each break it: filtering created_at stamps all 103 orders and the counts inflate to every order placed; 16 as the floor drops the entire US book (15 is under 16); 2 drags LATAM back in; 'drifting' in the edge slot compares a number to text, so every market reads on_promise; pending is not a column and errors in every slot it touches; ASC reads fastest-first and buries the drift. The clock rule holds: state the stamped population, then judge it against the edge the SLA publishes.",
    },
    {
      id: "cs-asos-6",
      tier: "medium",
      topic: "q2",
      universe: "pricing",
      title: "The above-the-mean price ladder",
      brief:
        "ASOS-flavored brief on the storefront db: the pricing review opens with the book-mean ladder — which SKUs clear what the catalog averages. Probed on the storefront db: the 16-SKU book averages 71.78, and 6 SKUs clear it — Smart Watch S 199.99, Noise-Canceling Headset 149.99, 4K Webcam Pro 129, Studio Desktop Mic 119, Mechanical Keyboard K1 89.99, Fitness Band X2 79 — with the mean printed beside every row so the gap is visible. Context: the premium band (200 and up) is empty, the ladder tops out at 199.99, and the below-mean half is 10 SKUs led by the 8-SKU mid band. Priciest first.",
      ask: "Return every SKU priced above the book mean with its price and the mean to 2 decimals beside it, priciest first.",
      template:
        "SELECT p.name AS sku,\n       p.category,\n       p.price,\n       ROUND((SELECT AVG(price) FROM products), {3}) AS book_mean\nFROM products p\nWHERE p.price {1} (SELECT {2}(price) FROM products)\nORDER BY p.price {4};",
      slots: [
        {
          answer: ">",
          kind: "keyword",
          label: "the above-the-mean comparison",
          why: "Above the mean is the ask: price > (SELECT AVG(price) …). '<' flips the report to the 10 below-mean SKUs — a correct query answering the opposite question. '>=' would pass here too, but only by luck: no SKU is priced exactly at the mean.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the book-mean fold",
          why: "The fold is the book mean: AVG(price) over all 16 SKUs reads 71.776875, printed as 71.78. MAX would compare against 149.99 — one survivor; SUM against 1,148.43 — none.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the mean's printed precision",
          why: "The mean prints to 2 decimals — 71.78 — so the slide reconciles with the probed figure. Precision 1 prints 71.8 and the gap-to-mean column stops matching the pricing deck.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the priciest-first direction",
          why: "The ladder reads priciest-first: 199.99 down to 79. ASC buries the premium story and opens on the cheapest above-mean SKU — the review's first impression aimed at the wrong end.",
        },
      ],
      distractors: ["<", "MAX", "SUM", "1", "ASC"],
      walkthrough:
        "Two scalar folds, one ladder. The WHERE's inner SELECT folds the 16-SKU book to its mean — 71.78 — and the comparison keeps the 6 SKUs that clear it: Smart Watch S 199.99, Noise-Canceling Headset 149.99, 4K Webcam Pro 129, Studio Desktop Mic 119, Mechanical Keyboard K1 89.99, Fitness Band X2 79 — priciest first. The SELECT's second scalar prints the mean beside every row so the gap is visible on the slide; ROUND(…, 2) keeps it reconciling with the probed 71.78. Context the brief carries: the premium band at 200-plus is empty — the ladder tops out at 199.99 — so 'above the mean' is the honest premium read this book can support. The distractors each break it: '<' flips the report to the 10 below-mean SKUs; MAX makes the fold 149.99 and only the Smart Watch clears it; SUM inflates the fold to 1,148.43 and the ladder empties; precision 1 prints 71.8 and the deck stops matching; ASC reads cheapest-first, which buries the story the review opened for. Scalar folds are contracts: say what the inner query returns, and what it returns when it returns nothing.",
    },
  ],

  problems: [
    { slug: "basket-depth-aov", why: "Basket depth and AOV in one pass is the ASOS trading opener — 251 lines over 103 orders is the size-curve read, and this problem drills the two-metric fold the Monday review ships." },
    { slug: "weeks-of-supply", why: "Size curves sell unevenly, so stock cover per SKU is a replenishment input: weeks of demand the on-hand units can serve is exactly this problem's fold." },
    { slug: "cohort-repeat-revenue", why: "Did the drop-month shoppers come back? Cohort revenue walks with LAG mirror how the CRM pod reads drop-cohort repeat value." },
    { slug: "returns-rate-by-category", why: "The returns economy, category by category — a LEFT JOIN rate with the denominator stated, the closest pool analogue to ASOS's fit-driven return shares." },
    { slug: "customers-who-never-order", why: "Registered-but-never-bought is the top-of-funnel leak fashion retail watches; on this db the anti-join returns a confident zero and proving it is the exercise." },
    { slug: "most-frequently-ordered-product-per-customer", why: "The size-curve argmax: which SKU a shopper reorders most. Argmax per customer with a tie policy is exactly how merch picks the featured size." },
    { slug: "fix-product-name-format", why: "Catalog hygiene before any join: 16 SKUs arriving title-case-broken means 'asos design' versus 'ASOS DESIGN' silently splits one label into two." },
    { slug: "group-sold-products-by-the-date", why: "Drop-day reporting folds a day's demand into one row per date — GROUP_CONCAT of the SKUs a drop moved is the trading recap's raw shape." },
    { slug: "weather-type-in-each-country", why: "Market-level CASE classification over a join — the same shape as banding markets by abandon share (8.1 / 6.7 / 5.3) with exhaustive, ordered arms." },
    { slug: "user-activity-for-the-past-30-days-i", why: "App-first funnels read demand in trailing windows: orders and buyers in the last 30 days, filter placement in WHERE versus HAVING decided before writing." },
    { slug: "products-worth-over-invoices", why: "Demand versus settlement: SKUs whose sold value outstrips the statements that cover them — the pool analogue of the brand settlement audit." },
    { slug: "find-churn-risk-customers", why: "Lapsed shoppers drive the winback budget: no order in N days is an anti-join plus date math over the 2024-01 to 2025-02 spine." },
    { slug: "average-salary-of-departments", why: "Category AOV versus platform AOV (383.48 US versus 335.32 EU against 338.19) — the compare-group-to-global fold this problem drills." },
    { slug: "find-stores-with-inventory-imbalance", why: "Size curves guarantee imbalance: SKUs heavy on some units and light on others are the case this problem teaches finding with conditional aggregates." },
    { slug: "active-businesses", why: "One-pass status censuses: kept, dispatched, queued, abandoned in a single scan whose branches must reconcile to 103. Four sequential queries drift; one pass cannot." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The frequency king — 24 of 103 orders from one shopper — is a HAVING/argmax read that decides where the CRM pod's attention goes." },
    // Wave-3x expansion (Task 103): 16 more problems. The pools file carries no ASOS tagged
    // rows, so theme-curated again — sql rows only, no w*/d*/f* rows, all distinct from the first 16.
    { slug: "product-sales-analysis-iii", why: "The per-SKU units-and-revenue fold at line grain — the size-curve census that splits 'which sizes move' from 'which sizes earn', drilled exactly the way the Monday merch review ships it." },
    { slug: "sales-analysis-ii", why: "Which shoppers bought a SKU versus which never touched it — the demand-survival join behind every drop debrief, with the join type deciding who survives." },
    { slug: "top-travellers", why: "The shopper revenue ladder — 7,262.35 at the top down to 444.80 — is a per-customer SUM fold ranked biggest-first, the concentration read the board actually manages." },
    { slug: "game-play-analysis-i", why: "First order per shopper via the per-customer MIN — when each shopper responded to a drop — is the argmax-per-group shape the CRM pods live in every week." },
    { slug: "immediate-food-delivery-ii", why: "The share of orders abandoned pre-dispatch per market — a conditional rate over a status filter with the denominator stated, the 6.8% fold drilled at practice scale." },
    { slug: "average-time-of-process-per-machine", why: "Per-entity latency from paired timestamps — created_at to shipped_at — is the 2.98-day dispatch clock drilled per group, stamp population stated." },
    { slug: "product-price-at-a-given-date", why: "Catalog price as-of a drop date — the as-of read when boutique prices restate and the merch retro needs the price that was live that night." },
    { slug: "maximum-transaction-each-day", why: "The peak basket per day — drop-night maxima against the 1,088.44 book ceiling — a grouped-max read with the join-back that names the SKU behind the spike." },
    { slug: "bank-account-summary", why: "Per-statement rollups of billed, settled and status — the dunning feed's exact shape, folded from one-to-many legs without inventing money." },
    { slug: "count-student-number-in-departments", why: "Markets counted with zeros kept — the LEFT JOIN census that reports the 12 clean shoppers as zeros instead of silently dropping them from the loss read." },
    { slug: "duplicate-charge-pairs", why: "Two-leg settlement cycles are this db's split rails — pairing rows on a shared key is how the payments audit finds the 5 statements that pay in two." },
    { slug: "null-blank-audit", why: "The catalog hygiene pass — NULL and blank checks over 16 SKUs before any join — because 'asos design' versus 'ASOS DESIGN' splits one label into two." },
    { slug: "keep-latest-dedupe", why: "When a restated catalog feed lands twice, keep-latest via ROW_NUMBER is the dedupe that protects the price ladder and the 71.78 book mean." },
    { slug: "median-employee-salary", why: "The median basket across 103 orders is the robust center the trading deck quotes beside the 338.19 mean — and a median forces window-or-CTE thinking." },
    { slug: "last-person-to-fit-in-the-bus", why: "Running-sum capacity gates — the pick-pack queue filling toward a cap — are the cumulative-frame shape behind the dispatch-latency SLA reads." },
    { slug: "users-with-two-purchases-within-seven-days", why: "The fast-repeat read — two baskets inside seven days — is date math plus a self-join over the order spine, the Premier-tribe signal this funnel chases." },
  ],
};
