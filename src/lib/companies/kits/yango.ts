// Yango — Wave-9 (Task 98), mobility domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Ride-hailing & super-app SQL: the storefront db read as a launch-city sandbox — customers are
// riders (region = the four city buckets of the launch playbook, carried as the db's EU/APAC/US/
// LATAM codes), orders are rides (delivered = completed-and-charged, shipped = on-trip with
// shipped_at as the dispatch stamp, pending = requested-awaiting-match, cancelled = aborted),
// order_items are ride fare lines (quantity = units, unit_price = the unit rate), products are
// service classes (Economy/Business/Delivery classes; stock = units of that class staged in the
// city), suppliers = driver-partner fleets, invoices/payments are the corporate & fleet billing
// books (INTEGER cents — divide by 100.0), expenses are city-launch opex, ledger_entries the GL.
// Pool provenance: company-pools.md carries NO Yango section — 0 tagged rows — so all 10 topic
// slug sets and all 32 problems are theme-curated from the pools file's Theme menu (sql rows
// only; no write/schema/finance-band rows) and say so. Case briefs quote probed figures from
// scripts/company-facts.md (probed 2026-10-12); every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const yangoKit: CompanyKit = {
  id: "yango",
  domainId: "mobility",
  name: "Yango",
  tagline: "New-city launch playbooks, driver-supply economics",
  accent: "text-red-300",

  brief: [
    "**Yango** is the international ride-hailing and super-app that took Yandex-built ride-hailing tech on the road — running rides, Yango Deli dark-store grocery, delivery and city logistics across the Middle East, Africa, Latin America and Central Asia. The operating reality that shapes every query here is the new-city launch: supply is seeded through driver-partner fleets before a single promo wave fires, riders arrive in bursts keyed to those waves, and the launch committee reads the same few censuses every week until the city is self-sustaining. This kit maps the storefront db onto that world: the 16 customers rows are riders in the four city buckets, the 103 orders are rides worth **34,833.28**, the 251 order_items rows are fare lines (quantity = units, unit_price = the unit rate), and the 6 suppliers are driver-partner fleets fielding 16 service classes. The status map is fixed: delivered = {emerald:completed-and-charged} (52, 50.5%), shipped = {sky:on-trip} with shipped_at as the dispatch stamp (30, 29.1%), pending = requested-awaiting-match (14), cancelled = {rose:aborted} (7, 6.8%).",
    "The data org splits into city-launch pods, supply analytics (the fleet-partner bench) and a small monetization-and-billing pod, and they all read the same ride spine at different grains. A ride books at created_at and `shipped_at` is stamped the moment it reaches a driver — **82 of 103 rides** carry the stamp, averaging **2.98 days** in a 2–4 day band, and the 14 pending rows have none yet (a population definition, not a cleanup job). Money sits one layer down: invoices and payments in INTEGER cents, where the dollar read is amount_cents / 100.0 — corporate accounts and fleet partners bill differently from cash riders. Concentration is the third story: **63.5%** of the fare book comes from riders whose lifetime spend crosses 3,000 (71.2% above 2,000) — in a launch city, one heavy corporate account moves the week.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain city census** — EU runs 45 rides from just 8 riders while the US runs 19 from 2 — then escalates into a rate where the interviewer asks the denominator question out loud (*'does an aborted ride count in your base?'*), then into the rider-frequency leaderboard where four riders sit tied at 4 rides and rank semantics become a decision about who gets the next promo wave. Late rounds walk the {sky:14-month ride spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Yango section — zero tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: dispatch funnels, two-grain city censuses, tie-heavy rider ladders, service-class CASE bands and the cents-safe billing spine. Do the topics in order, then run the six case studies on the live storefront db — the {amber:launch-opex census} the city-4 committee opens with, the {emerald:driver-supply bench} the supply pod screens every fleet partner against, the aborted-ride map, the month-over-month ride spine, the never-collected anti-join and the one-pass dispatch census. This kit is built for spaced practice rather than one sitting: run each case, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the dispatch health check. A launch-pod analyst opens the city dashboard before standup: did overnight ride requests land, does any ride show a dispatch stamp while status still reads pending, does the one-pass status census reconcile — 52 completed + 30 on-trip + 14 awaiting-match + 7 aborted = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If the request-to-dispatch window drifts off the **2.98-day** norm, the fleet-partner queue gets pulled before the supply sync — *a request waiting on a match is a rider the next app open may not keep*.",
    "**11:30 —** Midday is the supply read. The supply pod wants the fleet-partner bench re-cut against the **4.5 rating floor** — who earns the next vehicle-cohort allocation; city ops wants the two-grain census (EU 45 rides from 8 riders against the US's 19 from 2) beside the rider-frequency ladder, where the four riders tied at 4 rides need a named tie policy; and every surge, time and booking line is an `order_items` row, so *joining a ride total to that table fans the sum out* — the trap half of this town's queries die in. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the launch-committee argument*.",
    "**15:30 —** The afternoon tilts toward money. The collections refresh runs first — **21 exact, 1 partial** (4,000 of 6,148 settled) — before billing sends a single corporate reminder about the 6 never-collected invoices worth 15,217; then the anomaly list gets walked line by line: a void-but-settled invoice (#11, 925.00) and a paid-status invoice with zero settlement rows (#28, 1,756.00). The launch-opex census closes the loop — {rose:Rent 16,800} of the 25,416 ledger opex line, Ads 4,570 — before the city-4 budget memo goes out. The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Completed-ride rate", what: "Delivered ÷ ALL rides booked: 52 of 103 (50.5%), with 30 more on-trip (29.1%). The denominator keeps the 14 awaiting-match and 7 aborted rides — 'completed share of everything booked' is the whole interview." },
    { name: "Request-to-dispatch window", what: "created_at to the shipped_at dispatch stamp over stamped rides only: 82 of 103, averaging 2.98 days in a 2–4 day band. The supply-readiness input — if dispatch waits longer than the launch playbook allows, the fleet seed is thin." },
    { name: "Rider frequency ladder", what: "Top riders run 24, 17, 14, 13, 5 rides, then FOUR riders tie at 4. EU books 45 rides from 8 riders while the US books 19 from 2 — demand load beside rider coverage, the two-grain read every launch review opens with." },
    { name: "Aborted-ride share", what: "Cancelled ÷ booked: 7 of 103 (6.8%), sliced by city bucket — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The number that prices the match-fallback logic and sizes the driver-seed response." },
    { name: "Fare book", what: "Total booked fare value: 34,833.28 across 103 rides, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the account-tiering story — one 1,088.44 ride outweighs the smallest 42 combined." },
    { name: "Rider concentration", what: "Share of the fare book from riders spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). In launch economics this is the corporate-account watchlist — one lost logo moves a city's week." },
    { name: "Fare-line fan-out", what: "251 fare lines across 103 rides. Time, distance, surge and booking lines are new rows on existing rides, not new rides — every total joined against the fare-line table must respect the fan-out or it double-counts." },
    { name: "Corporate collections", what: "Billed versus collected: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-collected worth 15,217. Paid statements settle in 28.4 days on average (13 fastest, 84 slowest) — the AR anti-join the billing pod refreshes at every close." },
  ],

  topics: [
    {
      name: "Dispatch funnel counts",
      why: "Every Yango screen opens with the ride lifecycle: rides requested, dispatched to a driver (the shipped_at stamp), completed and charged. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an on-trip ride 'completed' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "funnel-step-conversion", "calculate-orders-within-each-interval", "median-time-to-convert"],
    },
    {
      name: "Two-grain city censuses",
      why: "Rides and riders are different grains of the same join, and every launch-city review reports both: EU runs 45 rides from 8 riders while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is demand load and which is rider coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "cohort-repeat-revenue", "find-bursty-behavior"],
    },
    {
      name: "Joining riders to fare lines",
      why: "Riders carry city bucket and signup date; rides inherit them through joins, and fare lines live one join deeper in order_items. A ride without a rider is corruption, a rider without rides is whitespace — and joining the fare-line table without care fans every total out, 251 lines against 103 rides.",
      slugs: ["combine-two-tables", "product-sales-analysis-ii", "sales-analysis-i"],
    },
    {
      name: "Rider-frequency ladders",
      why: "The frequency leaderboard is rank-window reporting where ties are guaranteed — four riders sit at 4 rides each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about who gets the next promo wave, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "customer-order-frequency", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Service-class CASE bands",
      why: "Economy, Business and Delivery classes are CASE-classified with fixed edges the rider app publishes, and launch budgets get cut along the same bands. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the class P&L, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Launch-calendar walks",
      why: "The 14-month ride spine (2024-01 to 2025-02) is the launch review's home turf: prior month beside current, delta rounded, trough (1,193.86 in July 2024) named out loud. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine", "new-users-daily-count", "median-time-to-convert", "find-bursty-behavior", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Launch-packet set algebra",
      why: "City-launch packets stack populations — completed rides under aborted, this launch wave beside last — and EXCEPT answers 'which riders requested but never got a dispatch'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order", "winback-recovery"],
    },
    {
      name: "Supply gates & nested folds",
      why: "Screens escalate into staging: fold per-rider ride counts or per-fleet fare books, then judge them against a computed bar — a scalar mean, a HAVING floor, a derived table. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments", "uber-first-transaction", "cohort-repeat-revenue", "channel-ltv-vs-cac"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets completed, on-trip, awaiting-match and aborted in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "budget-pacing"],
    },
    {
      name: "Corporate billing & cents discipline",
      why: "Completed is not collected — the billing tables (28 invoices, 27 payments, INTEGER cents) are where the ride world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "duplicate-charge-pairs", "transaction-velocity", "suspicious-bank-account-transactions", "chargeback-rate-ranking"],
    },
  ],

  theory: [
    {
      id: "yango-t1",
      q: "Your city report joins riders to rides. When do you INNER and when do you LEFT — and what silently breaks if you filter a ride column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A fare report joins rides to riders: a ride with no rider row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from riders: the riders with no rides ARE the answer, arriving with NULL ride columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload rider row — the LEFT quietly became an INNER and the never-dispatched cohort vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-riding riders — all 16 appear in the ride table somewhere — and proving that zero is itself the analyst's job, because on a launch-city staging cut it is exactly the row that would have flagged a dead promo code.",
      tag: "joins",
    },
    {
      id: "yango-t2",
      q: "Four riders tie at 4 rides on the frequency leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which rider's promo code renews. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer riders (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment, because a promo list that is order-dependent without saying so is a support ticket factory.",
      tag: "windows",
    },
    {
      id: "yango-t3",
      q: "The census shows 103 rides and 16 riders; EU shows 45 rides from 8 riders. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts ride rows after the join — one row per ride, so a rider with 24 rides contributes 24. COUNT(DISTINCT customer_id) folds those rows back to riders — EU's 45 rides collapse to 8 accounts. Neither is wrong: rides measure demand load and fleet utilization, riders measure installed base and coverage. The ratio — 5.6 rides per rider in EU versus 9.5 in the US on this db — is the intensity signal that decides whether the next promo wave broadens the base or deepens it. The trap that catches candidates is a third grain: join order_items for fare lines and COUNT(*) silently counts fare lines, not rides — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades, because a launch committee that thinks it is reading rides is actually reading surge lines.",
      tag: "aggregation",
    },
    {
      id: "yango-t4",
      q: "shipped_at is NULL until a ride reaches a driver. What is your policy for the request-to-dispatch report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only dispatched rides have a dispatch latency, so the report measures request-to-driver for the 82 of 103 rides that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL rides returns the dispatched-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the dispatched subset; the gap between it and COUNT(*) is exactly the 14 awaiting-match plus 7 aborted rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-second matches for requests that never reached a driver, and in a launch city the whole point of the metric is to catch exactly those. A report whose WHERE clause is doing definitional work without saying so is what the supply pod's reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "yango-t5",
      q: "The supply review wants completed fare per city bucket for buckets carrying at least ten rides. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards on-trip, awaiting-match and aborted rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-ride floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a launch-memo line and an error, and between a threshold applied to rides versus to fare dollars. The strong answer places every filter by asking: is this a fact about one ride, or about a city bucket? On this db a ten-ride floor keeps EU at 45, APAC at 37 and the US at 19 while LATAM's 2 drops out — the bucket list the committee sees IS the clause placement.",
      tag: "pipeline",
    },
    {
      id: "yango-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 rides always produce a mean — 338.19 on this db, the fare book's average against a 25.47-to-1,088.44 spread — and the rider cut the committee actually manages (lifetime spend above the 2,000 line, carrying 71.2% of fares) is a staged fold, not a naked scalar. On filtered staging tables — one bucket, one status, one launch month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides: a launch-week cut with only cancelled rides returns no mean, and the 'top accounts' panel goes quietly blank instead of loudly wrong. The correlated cousin (compare each ride to ITS rider's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "yango-t7",
      q: "The launch trend buckets rides by month on TEXT timestamps. How do you build the spine, cut a promo window without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the launch trend becomes fiction. The promo window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's requests, and promo-final midnight is exactly when ride requests spike. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month and hides the fact that the spine starts where it starts. Date discipline is launch discipline: the spine, the window and the edge row are where trend reports go wrong, and the July 2024 trough (1,193.86) only reads honestly on a spine built right.",
      tag: "dates",
    },
    {
      id: "yango-t8",
      q: "Finance says an invoice is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 invoices worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void invoice WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes; the five split-payment invoices (ids 1, 5, 12, 19, 22) settle in two legs each, so any per-invoice total must fold before it compares. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent line. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-collected, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the city close does not ship.",
      tag: "quality",
    },
    {
      id: "yango-t9",
      q: "EXCEPT or NOT EXISTS — which do you reach for when the collections memo asks for invoices with no settlement rows, and what does each give up?",
      a: "The LEFT JOIN anti-join is the house shape: invoices LEFT JOIN payments, keep WHERE p.id IS NULL — it returns the six never-collected invoices with their full payload, including the #28 anomaly whose status claims 'paid' over zero settlement rows. EXCEPT can express the same id set — SELECT id FROM invoices EXCEPT SELECT invoice_id FROM payments — and treats NULLs as comparable, but it only returns the columns you project, so a bare id list forces the caller to join back for status and cents. NOT EXISTS is the NULL-safe predicate twin of the anti-join, ideal inside larger queries where a join would fan rows out. The interview answer is not a favorite operator — it is naming what each shape returns and at what grain, then picking the one whose payload matches the memo.",
      tag: "setops",
    },
    {
      id: "yango-t10",
      q: "The ops board wants four status counts in one row. Walk me through FILTER (WHERE …) versus SUM(CASE WHEN …) — and when the portable twin wins.",
      a: "FILTER branches each aggregate independently in one scan: COUNT(*) FILTER (WHERE status = 'delivered') reads 52 beside its shipped, pending and cancelled siblings, and the four columns reconcile to 103 by construction — one scan, one census, no drift. SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) computes the identical number and runs on every engine in the fleet, which is why it stays the portable twin. FILTER wins on readability for pure counts and pairs naturally with COUNT/AVG/SUM in the same SELECT; CASE wins when the branch needs an expression — summing only completed rides' fares, not just counting them. The mistake the panel hunts for is four separate queries pasted into one board: four scans, four moments for a filter to drift, and an identity that holds by luck instead of construction.",
      tag: "filters",
    },
    {
      id: "yango-t11",
      q: "A fleet-partner card must show one fleet's service classes as a single cell. How do you fold rows into a string without making the output order-dependent?",
      a: "GROUP_CONCAT is the fold: GROUP_CONCAT(name) over the fleet's product rows returns 'Economy, Business, Delivery' with the comma as the default separator. The discipline is ordering inside the fold — GROUP_CONCAT(name ORDER BY name) or by a rate column — because without it the cell's order follows scan order and can flip between refreshes, which reads as a data change when nothing changed. State the separator explicitly when the card spec cares, watch cell length on wide fleets, and remember the fold happens after grouping, so one row per fleet is what the outer query sees. The alternative — one row per class on the card — is a product decision, not a SQL one, and saying that out loud scores.",
      tag: "strings",
    },
    {
      id: "yango-t12",
      q: "Your launch review query has grown to three folds and a rank. How do you stage it so the next analyst can read it?",
      a: "Name the stages with CTEs, in the order the memo thinks: WITH monthly AS (the month fold), THEN deltas AS (LAG over the folded months), then the outer SELECT that joins names and formats. Each CTE is one fold with one job, and the final query reads like the memo's sentence. The rules that keep it honest: never reference a stage before it is defined, test each stage by running it alone — the month fold should print 14 rows on this db before any LAG touches it — and keep formatting (ROUND, labels) at the edge, not buried in stage two. A derived table does the same job inline; the CTE's advantage is the name and the reuse — reference 'monthly' twice and the intent survives the code review. What does not survive review is a 40-line nested query whose stage two silently re-folds what stage one already folded.",
      tag: "cte",
    },
    {
      id: "yango-t13",
      q: "A correlated subquery finds rides above their own rider's average. When is that the right tool, and when do you pre-fold instead?",
      a: "The correlated shape — WHERE total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) — answers 'big for THIS rider' and re-runs the inner fold once per outer row: 103 executions on this db, fine here, painful on a city-scale table. The pre-fold alternative stages per-rider averages in a derived table or CTE, joins once, and compares at join grain — same answer, one fold, and the plan stays flat as the table grows. Reach for correlated when the inner fold is genuinely per-row and small, or when the predicate cannot be expressed as a join — top-1-per-group semantics. Reach for the pre-fold when the same fold is reused by several columns or the row count is real. The follow-up the panel wants: name the empty-inner behavior — a rider with one ride has an average equal to that ride, so they never beat their own average, which is the definition working, not a bug.",
      tag: "subqueries",
    },
    {
      id: "yango-t14",
      q: "You cut a promo cohort with WHERE created_at BETWEEN '2024-03-01' AND '2024-03-31' and the trend chart's last point looks thin. What happened and what is the standing fix?",
      a: "The upper bound '2024-03-31' is a date-only string, and any March 31 timestamp with a time component sorts after it — the last night's requests fall outside the window, and promo-final midnight is exactly when ride requests spike. The standing fix is half-open intervals: created_at >= '2024-03-01' AND created_at < '2024-04-01' — the boundary belongs to the next window, nobody is double-counted, nobody is lost. Between windows the two shapes must reconcile: sum the half-open monthly windows and you get the book's 34,833.28; sum the BETWEEN versions and the boundary nights leak. The same discipline governs month spines — STRFTIME('%Y-%m', created_at) with the year prefix, 14 buckets here — and any LAG built on top of them: a spine built on leaky windows produces deltas that look like demand shifts and are actually clock edges.",
      tag: "dates",
    },
    {
      id: "yango-t15",
      q: "The dispatch feed paginates with ORDER BY created_at DESC LIMIT 10 OFFSET 10, and the same ride shows on pages 1 and 2. Diagnose and fix.",
      a: "The order is not deterministic: two rows tied on created_at have no defined relative order between executions, so OFFSET pages slice a differently-shuffled deck each time and tied rows hop boundaries. The fix is a total order — ORDER BY created_at DESC, id DESC — where id is unique, making every page boundary stable across refreshes. Separately, if dispatch telemetry retries can produce two stamp rows for one ride, pagination is the wrong layer to fix that in: dedupe to one row per ride first (ROW_NUMBER over the ride id, keep the latest stamp), then paginate. The interview point is that pagination bugs are ordering bugs — 'increase the page size' hides the symptom and keeps the shuffle.",
      tag: "pipeline",
    },
    {
      id: "yango-t16",
      q: "A staging load delivered 'Delivered' and 'DELIVERED' beside the canonical 'delivered', and a fleet shows up twice as 'nordic gadgets ab' and 'Nordic Gadgets AB'. What is your normalization policy?",
      a: "Case drift splits populations: status = 'delivered' matches only the lowercase rows, so the one-pass census undercounts completed rides and the 103-identity fails; the mixed-case fleet name splits one partner's fare book in two and the bench read silently halves it. The policy is normalize-once-at-the-boundary: fold status literals with UPPER or an explicit CASE map into the closed four-value vocabulary, and canonicalize entity names before any join — LOWER(TRIM(name)) staged in a CTE, or a mapping table for the recurring offenders. Never normalize inside the comparison predicate query-by-query — that is how two reports disagree about the same rows. And keep the vocabulary closed: SELECT DISTINCT status after the load is the two-second check that the census will reconcile.",
      tag: "casing",
    },
    {
      id: "yango-t17",
      q: "Beyond LAG: when does a cumulative window need ROWS instead of RANGE, and what does the default frame actually do?",
      a: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on the sort key enter the running total together. On the month spine that is invisible: 14 distinct months, no ties. At ride grain it is a correctness issue — two rides requested in the same second make the cumulative fare jump by both rides at once, and SUM(total) OVER (ORDER BY created_at) hides the double step. The fix is saying the frame out loud: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks strictly one row at a time. The same choice governs moving averages — a 7-row moving frame with ties double-counts under RANGE. The rule the panel wants: frames are part of the metric's definition, so a cumulative report that does not state its frame is an underspecified report.",
      tag: "windows",
    },
    {
      id: "yango-t18",
      q: "Your city census prints 45, 37, 19, 2 by region — how do you audit the grain before the committee sees it, and where do GROUP BY mistakes hide?",
      a: "Grain audit first: say what one row IS — 'one row per city bucket' — then prove the fold key matches: GROUP BY region on the joined riders-and-rides table. Mistakes hide three places. A join that fans rows (fare lines joined in) silently changes what COUNT(*) counts — 251 lines, not 103 rides; a GROUP BY on a column missing from SELECT produces rows you cannot attribute; and grouping by a text column with drifted casing splits one group in two. The committee-facing check is the reconcile: the census must foot to 103 rides over 16 riders, EU 45-from-8, US 19-from-2, APAC 37, LATAM 2 — and if a fifth bucket or a phantom total appears, the fold key moved. 'One row per what?' is the whole question, asked before and after the query runs.",
      tag: "groupby",
    },
    {
      id: "yango-t19",
      q: "One spine, three numbers: rides, fare lines and units all live on the same tables. How do you report all three without mixing grains?",
      a: "Name the grains: rides are orders rows — 103; fare lines are order_items rows — 251; units are the SUM of quantity over those lines. Each is a legitimate census; the error is computing one under another's name. The safe pattern is stage-by-stage: fold rides directly from orders for the ride census, fold order_items separately for the line and unit counts, and only join when the question needs cross-grain columns — then count rides as COUNT(DISTINCT order_id), never COUNT(*). The standing trap: a report joins orders to order_items for line detail, and its 'ride count' column becomes 251 because nobody restated the grain after the fan-out. In review, every COUNT gets the question 'one row per what?' — if the answer changed after a join and the column name did not, the report lies.",
      tag: "aggregation",
    },
    {
      id: "yango-t20",
      q: "Money is stored in INTEGER cents. Where do you convert to dollars, and why does the placement of the /100.0 matter?",
      a: "Convert once, at the presentation edge: fold cents in the query — SUM(amount_cents) — and divide by 100.0 where the number is displayed or handed to another system. The .0 matters because cents are INTEGER: amount_cents / 100 in SQLite is integer division and eats the remainder, so odd-cent statements print short; 100.0 promotes the arithmetic to real before the division. Folding in dollars instead — converting per row and summing — accumulates floating-point drift across thousands of rows, which is how a trial balance that should read 181,080 against 181,080 lands a cent off at close. The policy the billing pod enforces: cents are the storage and computation format; dollars are a display format produced by exactly one division per figure, ROUNDed once, never re-rounded downstream.",
      tag: "quality",
    },
    {
      id: "yango-t21",
      q: "Two launch waves ran in the same city; the committee wants riders active in BOTH. Compare INTERSECT, a join, and IN — and pick with a reason.",
      a: "INTERSECT is the honest set read: SELECT customer_id FROM orders WHERE wave = 'w1' INTERSECT SELECT customer_id FROM orders WHERE wave = 'w2' — deduplicated on both sides, NULL-safe, and it reads as the sentence. A join on customer_id with DISTINCT returns the same ids but invites accidental fan-out if the join key is not unique on either side, and it drags join semantics into what is a set question. IN (SELECT …) works and is the natural shape inside a larger query, but nested INs grow unreadable and share NOT IN's NULL fragility when the question flips to exclusion. Pick INTERSECT for the standalone memo, IN when it composes into a bigger filter. The follow-up: the exclusion twin — riders in wave 1 but never wave 2 — is EXCEPT or NOT EXISTS, and the panel wants to hear you flip the operator deliberately, not reach for NOT IN on autopilot.",
      tag: "setops",
    },
    {
      id: "yango-t22",
      q: "The rider-count census and the driver-side bench read the same people table from two roles. When does a self-join earn its keep, and what does it break?",
      a: "A self-join earns its keep when one table carries two roles of the same entity — supply riding demand: the driver-partner who is also a rider, matched as m.driver_id = r.customer_id style pairs, or peers compared to peers (each fleet against the fleet above it in rating). It breaks grain first: a self-join multiplies rows before any aggregate, so every count downstream must be re-stated — COUNT(DISTINCT id) or the fold happens pre-join. It breaks readability second: both sides need aliases that carry the role, not t1/t2, or the query is unreviewable at close. The interview shape: state which side is 'left' in the relationship, whether unmatched rows on either side matter (that decides INNER versus two LEFT JOINs), and what one row of the output means — a pair, not a person.",
      tag: "joins",
    },
    {
      id: "yango-t23",
      q: "Your share metric divides completed rides by matched rides. How do you keep it from blowing up or lying when the denominator can be zero or NULL?",
      a: "Guard the denominator explicitly. The zero case: WHERE ... / NULLIF(denominator, 0) turns an empty bucket into a NULL share instead of a division error or a fake 100% — and a NULL share renders as a gap the dashboard flags, which is the honest outcome for a bucket with no matched rides. The NULL case: COUNT counts non-NULLs, so a denominator built from a nullable column shrinks silently — state the population (matched rides only, 82 of 103) or the share wears the wrong name. What is never acceptable is COALESCE-ing the share to 0 to make the chart quiet: zero says 'we matched everyone and none completed', NULL says 'no denominator here', and the difference decides whether the fleet seed moves. The panel's follow-up is the aggregate version — AVG of per-ride shares versus a ratio of sums — and the right answer is the ratio of sums, weighted by the real denominators.",
      tag: "nulls",
    },
    {
      id: "yango-t24",
      q: "The memo ships with three money figures on one slide, all from cents columns. What is your formatting and labeling contract so the numbers survive review?",
      a: "Four rules. One: convert at the edge — SUM(amount_cents) / 100.0, ROUNDed to 2, once per figure; no per-row conversions, no re-rounding downstream. Two: label the denominator in the figure's name — 'completed-ride fare book (delivered only, 52 of 103 rides)' — because an unlabeled 19,000 reads as the whole book. Three: reconcile on the slide — band totals foot to 34,833.28, the status census foots to 103, and any figure that cannot be footed gets a footnote, not silence. Four: state the population exclusions inline — 'aborted rides excluded', 'stamped rides only, 82' — so the number cannot be re-quoted with a different base. The style point the panel grades: the analyst who writes the denominator next to the number is the one whose slide survives the launch-committee argument unchanged.",
      tag: "pipeline",
    },
  ],

  mcqs: [
    {
      id: "yango-mcq-1",
      prompt: "A ride row's status reads 'shipped'. In this kit's Yango stage map, what happened?",
      choices: ["Completed and charged — the fare is earned", "On-trip with the dispatch stamp set — not yet completed", "Aborted before pickup", "Requested and awaiting a driver match"],
      answer: 1,
      why: "The stage map is fixed: shipped = on-trip with shipped_at as the dispatch stamp (30 of 103 rides, 29.1%). The fare is not earned until delivered.",
      notes: [
        { choice: 0, why: "Completed is 'delivered' — 52 rides. Calling the 30 on-trip rides completed inflates the completed-ride rate from 50.5% toward 79.6% before a single fare lands." },
        { choice: 3, why: "Awaiting-match is 'pending' — 14 rides with no dispatch stamp. Pending rides have no driver yet; shipped rides already do." },
      ],
      difficulty: "easy",
    },
    {
      id: "yango-mcq-2",
      prompt: "The dispatch rate is stamped rides ÷ which population? The db holds 82 stamped, 14 pending and 7 cancelled of 103 booked.",
      choices: ["Stamped + cancelled only (82/89 = 92.1%)", "All rides booked (82/103 = 79.6%)", "Delivered rides only (52/82)", "Distinct riders (82/16)"],
      answer: 1,
      why: "The house definition: dispatched ÷ ALL rides booked — the 14 awaiting-match stay in the denominator because 'not yet matched' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 pending inflates the rate to 92.1% by deleting the population still waiting for a driver — the rows the supply read exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is completion, shipped_at is dispatch. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "yango-mcq-3",
      prompt: "EU carries 45 rides from 8 riders. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts ride rows (45); COUNT(DISTINCT customer_id) folds repeats back to riders (8). The gap between them — 5.6 rides per rider — is the intensity read the launch committee actually wants.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every ride has a rider. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts city buckets, not riders — a third grain nobody asked for. The census is rides AND riders." },
      ],
      difficulty: "easy",
    },
    {
      id: "yango-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to aborted rides only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the aborted share truncates toward 0 and every bucket reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the aborted-ride map reads zero in every bucket." },
      ],
      difficulty: "medium",
    },
    {
      id: "yango-mcq-5",
      prompt: "Keep only city buckets carrying at least 10 rides. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY bucket HAVING COUNT(*) >= 10", "WHERE rides >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A ride-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db EU (45) and APAC (37) clear the bar; the US's 19 rides clears too, while LATAM's 2 does not.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'rides' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "yango-mcq-6",
      prompt: "The frequency ladder runs 24, 17, 14, 13, 5 rides, then FOUR riders tied at 4. Under RANK, what rank do the two 3-ride riders carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-ride riders share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The promo board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "yango-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The pending rides double-counted their request day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the dispatched-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 rides.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "yango-mcq-8",
      prompt: "A staging-table list uses rider_id NOT IN (SELECT customer_id FROM rides WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every ride carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "yango-mcq-9",
      prompt: "A launch packet stacks completed rides under aborted rides in one layout, built with UNION. A reviewer says one city bucket's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same bucket, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same bucket, same counts, no branch label — collapse into one, and the packet loses a city bucket with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "yango-mcq-10",
      prompt: "A dashboard walks the fare book ride by ride: SUM(total) OVER (ORDER BY created_at). Two rides share a request second, and the cumulative 'jumps two rides at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict ride-by-ride walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at ride grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "yango-mcq-11",
      prompt: "The launch pod wants riders who requested a ride in March 2024 but never once held a dispatch stamp: SELECT customer_id FROM orders WHERE created_at LIKE '2024-03%' EXCEPT SELECT customer_id FROM orders WHERE shipped_at IS NOT NULL. What comes back?",
      choices: ["Riders whose entire history carries no dispatch stamp, among March requesters", "Riders whose March rides were all aborted", "March requesters who DID dispatch at some point — INTERSECT semantics", "The count of March requests, deduplicated"],
      answer: 0,
      why: "EXCEPT removes every id appearing on the right side — any dispatched ride ever, not just March's. What survives is March requesters with no stamp in their whole history: the whitespace list, not a per-ride verdict.",
      notes: [
        { choice: 1, why: "Pairing each March ride against its own fate is per-row logic — a GROUP BY with a conditional count. EXCEPT compares populations, not rows." },
        { choice: 2, why: "That is INTERSECT — the riders who appear in both sets. The opposite of the ask." },
      ],
      difficulty: "medium",
    },
    {
      id: "yango-mcq-12",
      prompt: "The ops board needs completed, on-trip, awaiting-match and aborted in one pass over orders. Which column set does it in a single scan?",
      choices: ["COUNT(*) FILTER (WHERE status = 'delivered'), … repeated per status", "Four separate queries pasted into one spreadsheet", "COUNT(status = 'delivered')", "SUM(status) GROUP BY status"],
      answer: 0,
      why: "FILTER (WHERE …) branches each aggregate independently inside one scan — the one-pass census where 52 + 30 + 14 + 7 = 103 by construction. SUM(CASE WHEN …) is the portable twin.",
      notes: [
        { choice: 1, why: "Four sequential queries are four chances to drift — the census exists precisely so the identity holds by construction, not by copy-paste." },
        { choice: 2, why: "COUNT(expr) counts non-NULLs, and a 0/1 comparison result is never NULL — it counts every row, returning 103 in all four columns." },
      ],
      difficulty: "easy",
    },
    {
      id: "yango-mcq-13",
      prompt: "STRFTIME('%m', created_at) buckets the ride spine into 12 rows instead of 14. What got lost?",
      choices: ["Nothing — 12 is the correct bucket count", "The year: January 2024 and January 2025 merged into one '01' bucket", "Two months had no rides and were dropped", "The buckets are weeks, not months"],
      answer: 1,
      why: "'%m' keeps month only; '%Y-%m' keeps the year prefix and yields the true 14 buckets from 2024-01 to 2025-02. The merged January doubles its fares and the launch trend becomes fiction.",
      notes: [
        { choice: 2, why: "Every month in the window carries rides — the bug is label collision, not empty months. COUNT(DISTINCT STRFTIME('%Y-%m', created_at)) = 14 is the check." },
        { choice: 3, why: "'%m' is still a month token — the collision is with LAST year's same month, which is worse than a wrong grain because it looks plausible." },
      ],
      difficulty: "easy",
    },
    {
      id: "yango-mcq-14",
      prompt: "The fleet-partner card shows one fleet's service classes as 'Economy, Business, Delivery'. Which fold prints that from the products table?",
      choices: ["GROUP_CONCAT(name) over the fleet's classes", "CONCAT(name) with no GROUP BY", "SUM(name)", "JOIN name INTO one cell"],
      answer: 0,
      why: "GROUP_CONCAT folds many rows into one string cell with a comma as the default separator — ORDER BY inside keeps the class list stable across refreshes.",
      notes: [
        { choice: 1, why: "Without the aggregate fold there is nothing to concatenate — SQLite's CONCAT joins a fixed argument list, not a column's rows." },
        { choice: 2, why: "SUM is for numbers; on text SQLite coerces every row to 0 and prints 0. The classic wrong-tool tell." },
      ],
      difficulty: "easy",
    },
    {
      id: "yango-mcq-15",
      prompt: "SELECT id, total, total - (SELECT AVG(total) FROM orders) AS gap FROM orders — how many times does the inner AVG run?",
      choices: ["Once — the subquery is uncorrelated, so 338.19 computes once and every row reuses it", "Once per ride — 103 executions", "Once per city bucket", "Zero — SQLite rewrites it into a JOIN"],
      answer: 0,
      why: "Nothing inside the subquery references the outer row, so it is uncorrelated: one evaluation, and gap reads every ride against the 338.19 book average.",
      notes: [
        { choice: 1, why: "That is the CORRELATED shape — reference o.customer_id inside and the inner fold re-runs per row. Cost and meaning both change." },
        { choice: 2, why: "No group boundaries exist here — the subquery never sees the outer query, so it cannot re-run per bucket." },
      ],
      difficulty: "medium",
    },
    {
      id: "yango-mcq-16",
      prompt: "Find rides whose fare beats their OWN rider's lifetime average. Which shape is right?",
      choices: ["WHERE total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)", "WHERE total > (SELECT AVG(total) FROM orders)", "WHERE total > AVG(total)", "HAVING total > AVG(total)"],
      answer: 0,
      why: "The inner query references the outer row's customer_id — correlated, re-evaluated per ride, answering 'big for THIS rider'. That is a different population from 'big for the book'.",
      notes: [
        { choice: 1, why: "The uncorrelated version flags rides above the whole-book 338.19 — plausible output, wrong question." },
        { choice: 2, why: "An aggregate cannot sit naked in WHERE — it errors. Aggregates live in HAVING or inside a subquery." },
      ],
      difficulty: "medium",
    },
    {
      id: "yango-mcq-17",
      prompt: "The supply fold reads cleaner as WITH fleet AS (SELECT supplier_id, SUM(…) …) SELECT … — what does the CTE actually buy?",
      choices: ["A named staging step the outer query can join — same result as a derived table, easier to read and reference twice", "Guaranteed faster execution", "It caches the result for later sessions", "It replaces the need for GROUP BY"],
      answer: 0,
      why: "A CTE names an intermediate fold you can join once or twice without repeating the subquery. The win is legibility and reuse — the fleet bench reads as two named stages, not one nested maze.",
      notes: [
        { choice: 1, why: "Performance is an engine detail — SQLite may inline or materialize; correctness is identical either way." },
        { choice: 2, why: "A CTE lives for the duration of the statement only — nothing persists for later sessions." },
      ],
      difficulty: "easy",
    },
    {
      id: "yango-mcq-18",
      prompt: "The promo board asks for the top 5 riders by ride count: ORDER BY COUNT(*) DESC LIMIT 5. What lands in the fifth slot?",
      choices: ["The tie at 4 rides gets cut arbitrarily — which riders make the cut is engine luck, not policy", "All four tied riders always appear", "An error — LIMIT cannot follow an aggregate", "The query returns 8 rows to keep the ties"],
      answer: 0,
      why: "LIMIT slices rows after ordering with no tie awareness — the ladder above the tie is 24, 17, 14, 13, 5, so the cut lands above the tie here, but one rename of 'top 6' drops it into the 4-ride block and three of four tied riders make it on internal order. A promo list built this way is a coin flip.",
      notes: [
        { choice: 1, why: "LIMIT never expands to keep ties — that is RANK() plus a rank filter's behavior, a different query." },
        { choice: 2, why: "LIMIT follows aggregation fine; the problem is which rows win, not whether the clause parses." },
      ],
      difficulty: "medium",
    },
    {
      id: "yango-mcq-19",
      prompt: "Fare bands: CASE WHEN total >= 1000 THEN 'premium' WHEN total >= 250 THEN 'standard' END. What returns for the 25.47 ride, and what does that do to the band census?",
      choices: ["NULL — no arm matches and there is no ELSE, so the ride vanishes from every band total", "'economy' — the default arm catches it", "0 — SQLite coerces a failed CASE to zero", "An error — CASE requires ELSE"],
      answer: 0,
      why: "A CASE with no ELSE yields NULL on fall-through: the small fares drop out of the band P&L and the bands stop reconciling to the 34,833.28 book. Exhaustive arms are the class-census contract.",
      notes: [
        { choice: 1, why: "There is no default arm in SQL CASE — the ELSE clause must be written, or the fall-through is NULL." },
        { choice: 2, why: "CASE never coerces to 0 — the NULL flows into the group silently, which is exactly why the hole is dangerous." },
      ],
      difficulty: "medium",
    },
    {
      id: "yango-mcq-20",
      prompt: "LAG(total) OVER (PARTITION BY customer_id ORDER BY created_at) reads NULL on a rider's first ride. The analyst COALESCEs it to 0 to clean the report. What breaks?",
      choices: ["The first ride now reads as a jump from a zero prior ride — every rider's real first-ride movement becomes fiction", "Nothing — NULL arithmetic needs a default", "The partition collapses to one row", "LAG stops working after COALESCE"],
      answer: 0,
      why: "NULL here means 'baseline — no prior ride', not zero. Coalesced, the top rider's trend opens with a fake total-minus-zero spike on ride one, and the 16 rider baselines all lie the same way.",
      notes: [
        { choice: 1, why: "A default can be legitimate when the business says so — the mistake is making it silently in a cleanup step." },
        { choice: 2, why: "Partitions are untouched; the damage is interpretive, in the column's meaning." },
      ],
      difficulty: "hard",
    },
    {
      id: "yango-mcq-21",
      prompt: "Attach the grand fare total to every ride: SUM(total) OVER (). Later the analyst joins order_items in for a per-line report. What happens to the grand total?",
      choices: ["It fans out — the window now sums over the joined rows, so the 251 fare lines double-count every ride in the 'grand' figure", "It stays 34,833.28 — windows are join-proof", "It becomes NULL on line rows", "It halves"],
      answer: 0,
      why: "Window functions run over the row set in front of them — after the fan-out to 251 fare lines, SUM(total) OVER () double-counts rides exactly like any join-fan-out aggregate. Compute the grand total pre-join, in a CTE.",
      notes: [
        { choice: 1, why: "No construct is join-proof — the window sees whatever rows the FROM produces. Grain discipline is the analyst's job." },
        { choice: 2, why: "Nothing NULLs out — the inflated total repeats on every line row, which is worse: it looks authoritative." },
      ],
      difficulty: "hard",
    },
    {
      id: "yango-mcq-22",
      prompt: "The promo window is 'all of March': WHERE created_at BETWEEN '2024-03-01' AND '2024-03-31'. What is wrong?",
      choices: ["It drops March 31 after midnight — use created_at >= '2024-03-01' AND created_at < '2024-04-01'", "Nothing — BETWEEN is inclusive on both ends", "BETWEEN cannot compare TEXT dates", "It double-counts the first day"],
      answer: 0,
      why: "The upper bound '2024-03-31' excludes same-day later timestamps like '2024-03-31 21:40' — the last night's requests, exactly when promo ride requests spike. Half-open intervals keep the boundary.",
      notes: [
        { choice: 1, why: "BETWEEN IS inclusive of both endpoints — which is the bug: inclusivity of a date-only string cuts the date's own evening." },
        { choice: 2, why: "ISO-8601 TEXT dates compare correctly lexicographically — that is why the format is a contract." },
      ],
      difficulty: "easy",
    },
    {
      id: "yango-mcq-23",
      prompt: "WHERE s.name = 'nordic gadgets ab' returns nothing; the row is 'Nordic Gadgets AB'. Why, and what fixes it?",
      choices: ["= compares byte-for-byte — LIKE (case-insensitive for ASCII) or folding both sides with LOWER matches", "The row is on another server", "Names need quotes to be compared", "= is broken for TEXT; use MATCH"],
      answer: 0,
      why: "Equality is case-sensitive in SQLite; 'nordic gadgets ab' ≠ 'Nordic Gadgets AB'. Mixed-case fleet names split one partner's fare book in two — normalize once, then join on the canonical form.",
      notes: [
        { choice: 1, why: "It is one table, one row — the failure is the payload's casing against the literal, nothing environmental." },
        { choice: 2, why: "Quoting is syntax. 'Nordic Gadgets AB' quoted compares fine — the case is what fails." },
      ],
      difficulty: "hard",
    },
    {
      id: "yango-mcq-24",
      prompt: "Billing wants invoices settled only PARTIALLY: payments folded per invoice, kept where the fold is below the invoice amount. What shape returns exactly one invoice here?",
      choices: ["Fold payments per invoice_id in a derived table, join to invoices, keep the fold under i.amount_cents", "WHERE p.amount_cents < i.amount_cents on the raw join", "GROUP BY invoices HAVING COUNT(payments) = 1", "A self-join of invoices to invoices"],
      answer: 0,
      why: "Five invoices settle in two legs, so row-level comparisons misfire; folding payments to invoice grain first (invoice 25: 4,000 against 6,148) then comparing finds the one partial cleanly.",
      notes: [
        { choice: 1, why: "Row-level compare marks every leg of a split settlement 'partial' — five false hits beside the real one." },
        { choice: 2, why: "Leg count is not coverage: a two-leg FULL settlement also counts 2, and a single-leg underpayment counts 1." },
      ],
      difficulty: "medium",
    },
    {
      id: "yango-mcq-25",
      prompt: "SELECT DISTINCT status FROM orders returns how many rows, and why does the number matter to the census?",
      choices: ["4 — delivered, shipped, pending, cancelled; the closed vocabulary every census must reconcile to", "103 — one per ride", "3 — pending is not a real status", "It depends on ORDER BY"],
      answer: 0,
      why: "The status vocabulary is exactly four values. A census printing a fifth means staging contamination; one missing means the 103-identity fails — DISTINCT is the cheapest integrity check in the kit.",
      notes: [
        { choice: 1, why: "DISTINCT folds the 103 ride rows down to the vocabulary — that is the point of the check." },
        { choice: 2, why: "Pending IS the awaiting-match stage — 14 rides of it. Deleting it from the vocabulary deletes a funnel stage." },
      ],
      difficulty: "easy",
    },
    {
      id: "yango-mcq-26",
      prompt: "Dispatch telemetry retries, so a ride can carry two stamp rows. Page 2 of ORDER BY created_at DESC LIMIT 10 OFFSET 10 keeps duplicating one ride across pages. Fix?",
      choices: ["Make the sort deterministic — ORDER BY created_at DESC, id DESC — so page boundaries are stable", "Increase OFFSET", "Use DISTINCT", "Sort by status first"],
      answer: 0,
      why: "Ties on created_at leave row order undefined between executions; OFFSET pages then shuffle tied rows across page boundaries. A unique tie-breaker pins the order — and the retry rows themselves need a dedupe-before-count policy.",
      notes: [
        { choice: 1, why: "This is not a page-size problem — the boundary moves because the order is unstable, not because OFFSET miscounts." },
        { choice: 2, why: "DISTINCT on full rows does nothing about sort instability among tied rows." },
      ],
      difficulty: "hard",
    },
    {
      id: "yango-mcq-27",
      prompt: "The dispatch SLA reads in hours, not days. Which expression converts the request-to-dispatch window?",
      choices: ["(JULIANDAY(shipped_at) - JULIANDAY(created_at)) * 24", "JULIANDAY(shipped_at - created_at)", "STRFTIME('%H', shipped_at) - STRFTIME('%H', created_at)", "DATEDIFF('hour', created_at, shipped_at)"],
      answer: 0,
      why: "JULIANDAY returns fractional days, so the difference is a real number of days — ×24 gives hours. The 2.98-day average becomes ~71.5 hours on the stamped rides.",
      notes: [
        { choice: 1, why: "JULIANDAY takes one timestamp — subtracting two TEXT strings first is string arithmetic, not a date difference." },
        { choice: 2, why: "'%H' strips the date: a 2-day window reads as hour-of-day nonsense like 21 − 9." },
      ],
      difficulty: "medium",
    },
    {
      id: "yango-mcq-28",
      prompt: "Build the month-over-month fare delta. Why must the CTE fold months FIRST, with LAG applied to the folded rows?",
      choices: ["LAG over raw rides returns the previous RIDE — the CTE collapses 103 rides to 14 month rows so LAG sees month-to-month", "LAG cannot run inside a CTE", "The CTE only makes the query faster", "GROUP BY must always precede window functions syntactically"],
      answer: 0,
      why: "Window functions see the rows of their input set. On raw rides 'previous' means previous ride; staging months first changes what 'previous' means — 14 rows, previous month — which is the launch-trend question the committee asks.",
      notes: [
        { choice: 1, why: "LAG over CTE output is the standard pattern — that is exactly how the month spine is built." },
        { choice: 3, why: "No such syntax rule — the composition is semantic (change the rows, change 'previous'), not a parser constraint." },
      ],
      difficulty: "hard",
    },
    {
      id: "yango-mcq-29",
      prompt: "A staging load delivered 'Delivered' and 'DELIVERED' beside the canonical 'delivered'. What is the census impact and the fix?",
      choices: ["The status census splits one stage into three — fold with UPPER(status) or a CASE map before any count", "No impact — SQLite is case-insensitive everywhere", "The extra rows are dropped automatically", "Rename the column"],
      answer: 0,
      why: "status = 'delivered' matches only the lowercase rows, so the census undercounts completed rides and the 103-identity fails. Normalize at the boundary; keep the vocabulary closed.",
      notes: [
        { choice: 1, why: "Comparisons with = are case-sensitive — that is the entire problem; the database helps nowhere here." },
        { choice: 2, why: "Nothing drops rows automatically — the drifted values sit in their own groups, quietly." },
      ],
      difficulty: "easy",
    },
    {
      id: "yango-mcq-30",
      prompt: "Never-collected invoices: LEFT JOIN payments … WHERE p.id IS NULL, versus EXCEPT on invoice ids. What does EXCEPT lose here?",
      choices: ["The invoice columns — EXCEPT compares shaped rows from both sides, so bare ids answer 'which ids', not 'which invoices with status and cents'", "Nothing — the two are identical", "EXCEPT keeps the settled ones", "NULLs — EXCEPT cannot compare NULL"],
      answer: 0,
      why: "EXCEPT needs both SELECTs shaped identically and returns only the columns projected — ids alone, unless every column is padded on both sides. The LEFT JOIN anti-join keeps the full invoice row: status, cents, number.",
      notes: [
        { choice: 1, why: "Same six ids, different payload — and the billing memo needs the 15,217 fold, which bare ids cannot carry." },
        { choice: 3, why: "Set operations treat NULLs as equal to each other — not the loss here." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-yango-1",
      tier: "easy",
      topic: "s6",
      universe: "expense",
      title: "The launch-budget census",
      brief:
        "Yango-flavored brief on the storefront db: the city-4 launch committee meets Thursday and the launch lead wants the opex census in one pass — per spend category, entry count, dollar spend folded from the INTEGER-cents ledger, plus a big-ticket arm counting entries at or above 500.00 so the committee sees which categories are hub-scale leases versus recurring small tickets. Probed facts: the city ledger books 36 opex entries worth 25,416 (its operating_expenses line); the category fold reads Rent 14 entries / 16,800, Ads 14 / 4,570, Travel 3 / 2,521, Tools 5 / 1,525; August 2024 was the heaviest opex month at 3,210. The committee reads the biggest category first.",
      ask: "Return each category with its entry count, spend in dollars and big-ticket entry count, biggest spend first.",
      template:
        "SELECT category,\n       COUNT(*) AS entries,\n       ROUND(SUM(amount_cents) / {1}, 2) AS spend,\n       SUM(CASE WHEN amount_cents >= {2} THEN 1 ELSE 0 END) AS big_tickets\nFROM expenses\nGROUP BY {3}\nORDER BY spend {4};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Expenses are INTEGER cents, so the dollar read is SUM(amount_cents) / 100.0 — Rent prints 16,800.00. Dividing by 10.0 prints 168,000 (ten-fold), by 1000 prints 1,680 (a tenth), and a bare integer 100 truncates nothing here but trains the habit that leaks cents on odd-cent rows.",
        },
        {
          answer: "50000",
          kind: "number",
          noVerify: true,
          label: "the big-ticket threshold",
          why: "The committee's big-ticket line is 500.00, and amount_cents is in cents, so the arm is >= 50000 — and no entry sits exactly at 500.00, so the census is stable. 5000 (50.00) sweeps all 36 entries into the arm and 150000 (1,500.00) empties it to Travel's single line.",
        },
        {
          answer: "category",
          kind: "keyword",
          label: "the census grain",
          why: "The committee reads spend by category, so the fold key is category. GROUP BY spent_on re-cuts the same 36 entries into per-day rows (~36 of them) and the committee loses the category ladder; grouping by an aggregate alias errors outright.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The committee reads biggest category on top: Rent 16,800, Ads 4,570, Travel 2,521, Tools 1,525. ASC would open the meeting on Tools — a correct query aimed at the wrong end of the room.",
        },
      ],
      distractors: ["10.0", "1000", "5000", "150000", "spent_on", "ASC"],
      walkthrough:
        "One table, one fold, one CASE arm — the whole launch budget in a single scan. The fold keys on category: Rent folds 14 entries to 16,800.00 with all 14 big-ticket, Ads 14 entries to 4,570.00 with none, Travel 3 entries to 2,521.00 with one launch-trip line, Tools 5 entries to 1,525.00 with none — and the four spends foot to the ledger's 25,416 opex line, 36 entries in all. The cents divider is 100.0, not 100, because the ledger is INTEGER cents and the dollar read must stay real; the threshold is 50000 because 500.00 dollars is 50,000 cents, and no entry sits exactly on the line. The distractors each break differently: 10.0 inflates every spend ten-fold (Rent 168,000) and 1000 shrinks it ten-fold (Rent 1,680) — both now disagree with the ledger's 25,416; 5000 drops the big-ticket line to 50.00 so all 36 entries pass and the arm reads 14/14/3/5 (identical to entry counts — useless); 150000 raises it to 1,500.00 so only Travel's launch trip survives; spent_on re-cuts the census into per-day rows; ASC opens the meeting on Tools. The read: Rent is two-thirds of launch burn — 16,800 of 25,416 — which is the hub-lease conversation, not the promo one.",
    },
    {
      id: "cs-yango-2",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "The driver-supply bench",
      brief:
        "Yango-flavored brief on the storefront db: the regional supply pod screens its driver-partner fleets every quarter, and the bench rule is fixed — a fleet earns the next vehicle-cohort allocation only at a 4.5-plus rating, and the bench is read on completed fares, not booked ones. Probed facts: 6 fleets field 16 service classes; the rating floor keeps exactly 2 — Nordic Gadgets AB (4.6, 3 classes, avg class rate 139.66) and Alpine Audio GmbH (4.8, 2 classes, avg 72); Nordic's full-book fare runs 11,130.25 (32% of the platform) against Alpine's 4,765.63 (13.7%). The bench reads biggest completed-fare book first.",
      ask: "Return each bench fleet with its rating, completed-ride count and completed-ride fare book to 2 decimals, biggest first.",
      template:
        "SELECT s.name,\n       s.rating,\n       COUNT(DISTINCT o.id) AS rides,\n       ROUND(SUM(oi.unit_price * {1}), 2) AS fare_book\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.product_id = p.id\nJOIN orders o ON o.id = oi.order_id\nWHERE s.rating >= {2} AND o.status = {3}\nGROUP BY s.id\nORDER BY fare_book {4};",
      slots: [
        {
          answer: "oi.quantity",
          kind: "keyword",
          label: "the fare-line units",
          why: "Fare lines bill unit_price per unit, so the line fare is unit_price * oi.quantity — dropping to a bare 1 reads only SUM(unit_price) (2,270.96 / 1,462.40, understating both fleets) and p.price swaps in the catalog rate instead of the billed line rate.",
        },
        {
          answer: "4.5",
          kind: "number",
          noVerify: true,
          label: "the bench rating floor",
          why: "The bench rule is 4.5-plus, which keeps exactly two of six fleets: Nordic 4.6 and Alpine 4.8. A 4.0 floor widens the bench to five fleets (Midwest 4.4, Shenzhen 4.1, Andes 4.0 walk in) and 4.8 narrows it to Alpine alone.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed-fare literal",
          why: "The bench is read on completed fares: status 'delivered' keeps the 52 completed rides. 'shipped' reads the on-trip book instead (5,515.45 / 685.51) — fares that have not landed — and any other status either empties the bench or reads the wrong money.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bench-first direction",
          why: "The bench reads biggest fare book on top: Nordic 3,711.42 over Alpine 3,013.61. ASC flips the podium and the allocation conversation starts with the smaller fleet.",
        },
      ],
      distractors: ["1", "p.price", "4.8", "'shipped'", "ASC", "SUM"],
      walkthrough:
        "Four joins, one fold, two survivors. The chain runs riders' rides through their fare lines back to the service class and the fleet that fields it: suppliers → products (service classes) → order_items (fare lines) → orders (rides). WHERE keeps s.rating >= 4.5 — exactly Nordic and Alpine of the six fleets — and o.status = 'delivered', so only completed rides bill. The fold groups by fleet and sums the line fare, unit_price * oi.quantity, because fare lines bill per unit: Nordic reads 4.6 / 17 completed rides / 3,711.42, Alpine 4.8 / 17 / 3,013.61 — both fleets at 17 completed rides, so the allocation call comes down to fare book, not frequency. The distractors each break differently: 1 in the units slot drops the sum to bare rates (2,270.96 / 1,462.40 — the 'fare' no rider ever paid); p.price bills the catalog rate instead of the billed line rate; 4.8 in the floor slot shrinks the bench to Alpine alone and 4.0 would flood it; 'shipped' reads the on-trip book (5,515.45 / 685.51) — real money, wrong denominator, fares that have not landed; ASC flips the podium; SUM in any slot nests an aggregate where a column belongs and the engine refuses. The read: 32% of platform fare sits in one fleet — concentration, not just quality, is the supply story.",
    },
    {
      id: "cs-yango-3",
      tier: "easy",
      topic: "j1",
      universe: "funnel",
      title: "The aborted-ride map",
      brief:
        "Yango-flavored brief on the storefront db: the match-fallback review wants the aborted-ride map cut by city bucket — rides booked, rides aborted, and the aborted share with the denominator stated, for every bucket big enough to read (ten or more rides; tiny buckets are noise at launch scale). Probed facts: EU carries 45 rides with 3 aborted (6.7%), APAC 37 with 3 (8.1%), US 19 with 1 (5.3%), and LATAM's 2 rides with 0 aborted fall below the ten-ride floor and drop off the map. Region lives on the riders table, so the map joins orders to customers before the fold. The launch lead reads biggest bucket first.",
      ask: "Return each qualifying city bucket with its ride count, aborted-ride count and aborted share to 1 decimal, biggest ride count first.",
      template:
        "SELECT c.region AS city_bucket,\n       COUNT(*) AS rides,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS aborted,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS abort_share\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY {2}\nHAVING COUNT(*) >= {3}\nORDER BY {4} DESC;",
      slots: [
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the aborted-ride literal",
          why: "The stage map is fixed: cancelled = aborted (7 of 103 rides). 'shipped' counts the on-trip book instead — 30 rides wearing the wrong name — and any other literal zeroes the map while the query still runs.",
        },
        {
          answer: "c.region",
          kind: "keyword",
          label: "the bucket fold key",
          why: "The map folds by the rider's city bucket — c.region — because region lives on customers, not orders. GROUP BY o.status re-cuts the same rides into 52/30/14/7 by fate, a census of outcomes instead of geography.",
        },
        {
          answer: "10",
          kind: "number",
          noVerify: true,
          label: "the readability floor",
          why: "Ten or more rides keeps EU (45), APAC (37) and the US (19) and drops LATAM's 2-ride bucket. A floor of 50 keeps only EU; there is no floor value between 19 and 45 that changes the map again — the bucket list IS the clause.",
        },
        {
          answer: "rides",
          kind: "keyword",
          label: "the biggest-bucket-first sort",
          why: "The lead reads biggest bucket first: EU 45, APAC 37, US 19. Sorting by abort_share DESC re-aims the meeting at APAC's 8.1 — a different headline from the same rows.",
        },
      ],
      distractors: ["o.status", "c.city", "abort_share", "20"],
      walkthrough:
        "One join, one conditional fold, one floor. The join attaches each ride to its rider's city bucket — region lives on customers, so the map cannot be single-table — and the fold groups by c.region, keeping exactly the buckets with ten or more rides: EU 45, APAC 37, US 19, with LATAM's 2-ride bucket below the floor. The aborted arm counts status = 'cancelled' rides — 3, 3, 1 — and the share column multiplies by 100.0 BEFORE the division so integer truncation never flattens the map: 6.7, 8.1, 5.3 to one decimal, denominators of 45, 37, 19 stated in the same row. The distractors each break differently: o.status in the literal slot compares the status to itself so every ride counts as aborted (45/37/19 aborted — absurd on its face); c.city re-cuts the map into per-city rows (Berlin, Dubai…) that no launch bucket matches; abort_share in the literal slot errors on an alias referenced before it exists; 20 in the floor slot silently drops the US's 19-ride bucket and the map loses a third of its geography. The read: APAC aborts at 8.1% against the US's 5.3 — the match-fallback tuning conversation starts in APAC, not where the volume is.",
    },
    {
      id: "cs-yango-4",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The month-over-month ride spine",
      brief:
        "Yango-flavored brief on the storefront db: the launch review opens with the ride spine — fares folded by month, prior month beside current, delta rounded — so the committee sees the trend instead of fourteen disconnected totals. Probed facts: the spine runs 14 buckets from 2024-01 to 2025-02; the book opens at 3,731.97, troughs at 1,193.86 in July 2024, and the swings bracket it — November 2024 fell 1,326.87 from October while August recovered 1,158.21 off the July trough. The first row carries no prior month, so its delta is NULL by definition — baseline, never zero. The spine reads chronologically, first month on top.",
      ask: "Return each month with its fare total to 2 decimals, the prior month's total beside it, and the rounded month-over-month delta, chronological order.",
      template:
        "WITH monthly AS (\n  SELECT STRFTIME({1}, created_at) AS month,\n         ROUND(SUM(total), {3}) AS fares\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       fares,\n       LAG({2}) OVER (ORDER BY month) AS prev_fares,\n       ROUND(fares - LAG(fares) OVER (ORDER BY month), 2) AS delta\nFROM monthly\nORDER BY month;",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month-bucket format",
          why: "Year plus zero-padded month yields the true 14 buckets from 2024-01 to 2025-02. '%m' alone merges January 2024 with January 2025 — 12 buckets, doubled Januaries, and every delta on the spine is fiction.",
        },
        {
          answer: "fares",
          kind: "keyword",
          label: "the walked column",
          why: "LAG(fares) makes 'previous' mean the previous month's fare total. LAG(month) walks the labels instead — the 'prior fare' column fills with month strings and every delta goes NULL.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the fare precision",
          why: "Fares report to 2 decimals — 3,731.97 at the open — so the deltas reconcile to the cents the committee quotes. One decimal prints 3,732.0 and the July trough rounds off the very cents the finance annex carries.",
        },
      ],
      distractors: ["'%m'", "month", "1"],
      walkthrough:
        "Two stages: fold the spine, then walk it. The CTE groups 103 rides into month buckets — STRFTIME('%Y-%m', created_at), 14 rows from 2024-01 to 2025-02 — and folds each month's fares to 2 decimals; the outer query walks the folded rows with LAG(fares) OVER (ORDER BY month), so prev_fares is the previous MONTH, and the delta subtracts the two: February's -122.33 opens the walk, November's -1,326.87 is the deepest fall, August's +1,158.21 the sharpest recovery off the 1,193.86 July trough. The first row's prev and delta are NULL by definition — baseline, reported as NULL, never coalesced to zero, because zero would claim a flat opening month the data never had. The distractors each break differently: '%m' collapses the spine to 12 merged buckets and every delta becomes cross-year nonsense; month in the walked-column slot fills the 'prior fare' with month labels and the delta column goes NULL; 1 as the precision truncates the trough to 1,194 and the deltas stop reconciling with the quoted book. The read: the book is seasonal, not dying — every dip below 2,000 (July, November, January) recovers within two buckets, which is the launch-playbook rhythm the committee wants named.",
    },
    {
      id: "cs-yango-5",
      tier: "medium",
      topic: "j5",
      universe: "refund-audit",
      title: "The never-collected anti-join",
      brief:
        "Yango-flavored brief on the storefront db: before billing sends a single corporate reminder, the collections pod refreshes the anti-join — every invoice with NO settlement rows behind it, dollars to 2 decimals, biggest exposure first. Probed facts: the anti-join returns 6 invoices worth 15,217 — #24 tops the list at 4,937.00, #26 at 3,562.00, #27 at 2,794.00, #21 at 1,295.00, #18 at 873.00 — and the one the meeting is about: #28, printed 1,756.00, whose status column claims 'paid' over zero payment rows. Payment rows are the ledger of record; the status column is a claim. The list reads biggest exposure first.",
      ask: "Return each never-collected invoice with its id, number, status and billed amount in dollars to 2 decimals, biggest first.",
      template:
        "SELECT i.id,\n       i.number,\n       i.status,\n       ROUND(i.amount_cents / {1}, 2) AS billed\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.id\nWHERE {2}\nORDER BY {3} DESC;",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Invoices are INTEGER cents, so the dollar read is amount_cents / 100.0 — #28 prints 1,756.00. Divide by 100 (integer division) and odd-cent statements print short; divide by 10.0 and every exposure inflates ten-fold (4,937 becomes 49,370).",
        },
        {
          answer: "p.id IS NULL",
          kind: "keyword",
          label: "the anti-join predicate",
          why: "The LEFT JOIN hands never-settled invoices a row of NULLs — p.id IS NULL keeps exactly those six. Flipping to p.id IS NOT NULL returns the settled twenty-two instead, and i.id IS NULL keeps nothing: invoice ids are never NULL by construction.",
        },
        {
          answer: "billed",
          kind: "keyword",
          label: "the exposure sort",
          why: "Biggest exposure first: 4,937.00 on top, the 873.00 tail last. Ordering by i.status sorts by the claim — and the claim is exactly what this query exists to distrust — so 'paid' #28 floats to the top on a lie.",
        },
      ],
      distractors: ["10.0", "i.id IS NULL", "p.id IS NOT NULL", "i.status"],
      walkthrough:
        "One LEFT JOIN, one NULL predicate, one cents rule. The join walks invoices against their payments — five invoices settle in two legs, so the payments side fans — but the WHERE keeps only the rows where the join found nothing: p.id IS NULL, the six never-collected invoices. The fold is per-row (no GROUP BY needed; one row per invoice by construction) and the dollars come from amount_cents / 100.0, ROUNDed once: 4,937.00, 3,562.00, 2,794.00, 1,756.00, 1,295.00, 873.00 — footing to the 15,217 the memo quotes. The predicate is the whole query: flip it to IS NOT NULL and the settled twenty-two walk in; ask for i.id IS NULL and the list empties because an invoice's own id is never NULL. The distractors each break differently: 10.0 inflates every exposure ten-fold and the 15,217 footing dies; i.status in the sort trusts the claim column — 'paid' #28 tops the list on exactly the lie the audit exists to catch. The read: #28 is not a collections problem, it is a status-sync incident — payment rows say never settled, the status column says paid, and the reconciliation reflex is to trust the ledger of record and file the anomaly.",
    },
    {
      id: "cs-yango-6",
      tier: "easy",
      topic: "x2",
      universe: "month-close",
      title: "The one-pass dispatch census",
      brief:
        "Yango-flavored brief on the storefront db: the close gate is the one-pass census — completed, on-trip, awaiting-match and aborted counted in a single scan, plus the fare book folded beside them, because four sequential queries are four ways to drift and the identity must hold by construction. Probed facts: the single scan reads 103 rides total, 52 completed ('delivered'), 30 on-trip ('shipped'), 14 awaiting-match ('pending'), 7 aborted ('cancelled') — 52 + 30 + 14 + 7 = 103 — with the fare book at 34,833.28. The census arms use the db's closed status vocabulary; the launch committee reads the identity first and the money second.",
      ask: "Return one row with the ride count, the four status-arm counts, and the fare book to 2 decimals.",
      template:
        "SELECT COUNT(*) AS rides,\n       COUNT(*) FILTER (WHERE status = {1}) AS completed,\n       COUNT(*) FILTER (WHERE status = {2}) AS on_trip,\n       COUNT(*) FILTER (WHERE status = 'pending') AS awaiting_match,\n       COUNT(*) FILTER (WHERE status = 'cancelled') AS aborted,\n       ROUND(SUM(total), {3}) AS fare_book\nFROM orders;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed arm",
          why: "The stage map is fixed: delivered = completed-and-charged, 52 of 103. 'completed' is NOT this db's vocabulary — the arm counts zero and the identity 52 + 30 + 14 + 7 = 103 dies on the close gate.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the on-trip arm",
          why: "shipped = on-trip with the dispatch stamp set, 30 rides. 'on_trip' reads zero for the same reason — the map's vocabulary is closed, and the census is where a drifted staging feed gets caught.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the book precision",
          why: "The fare book reports to 2 decimals — 34,833.28 — so the census reconciles with the finance annex to the cent. One decimal prints 34,833.3 and the close memo quotes a book that no longer foots.",
        },
      ],
      distractors: ["'completed'", "'on_trip'", "1"],
      walkthrough:
        "One table, one scan, five arms. FILTER (WHERE …) branches each aggregate independently: the completed arm keeps status = 'delivered' (52), the on-trip arm keeps 'shipped' (30), awaiting-match and aborted ride on literals too (14 and 7), and COUNT(*) beside them totals 103 — so the identity 52 + 30 + 14 + 7 = 103 is true BY CONSTRUCTION, not by comparing four queries. SUM(total) folds the fare book into the same scan, 34,833.28 at 2 decimals. The portable twin is SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) — identical numbers, runs anywhere; the census exists in FILTER form because the board reads four named columns, not four result sets. The distractors each break differently: 'completed' and 'on_trip' are NOT this db's status vocabulary — both arms count zero and the census prints 0/0/14/7 with a straight face; 1 as the ROUND precision prints 34,833.3 and the book stops reconciling with the finance annex. The read: this query is the close gate — if the four arms ever fail to sum to COUNT(*), the day starts with an incident, not a rounding note.",
    },
  ],

  problems: [
    { slug: "trips-and-users", why: "The canonical ride-hailing screen: cancellation rates per city with banned users excluded. Yango's aborted-ride share (7 of 103, 6.8%) is exactly this query with the launch bucket swapped in." },
    { slug: "hopper-company-queries-ii", why: "Driver-side supply ratios — share of drivers below a ride floor. The fleet-partner bench reads are the same conditional-count-over-the-supply-table shape." },
    { slug: "average-selling-price", why: "Rate per service class over a time window — the fare-rate read. Yango prices Economy/Business/Delivery classes the same way this problem prices by product and period." },
    { slug: "top-travellers", why: "The rider fare ladder — join riders to their trips, fold, rank. Mirrors the frequency ladder that runs 24, 17, 14, 13, 5 on this db." },
    { slug: "confirmation-rate", why: "Confirmation share with unmatched rows still counted — COALESCE keeps zero-confirmation riders visible. The dispatch funnel treats the 14 awaiting-match rides exactly this way." },
    { slug: "immediate-food-delivery-ii", why: "Share of dispatches that beat the promised window, EXCEPT-shaped. Yango's promo SLA reads are this query: promised-window rides versus the rest." },
    { slug: "find-golden-hour-customers", why: "Riders whose activity clusters in surge windows — date math over request timestamps. Surge-hour concentration decides where the next driver seed goes." },
    { slug: "monthly-transactions-i", why: "Corporate spend per month over a floor — the corporate-account watchlist is a month-bucketed conditional fold over the billing spine." },
    { slug: "rolling-7d-actives", why: "Rolling active riders per launch city — the launch committee's week-over-week traction read, a rolling-window fold over ride timestamps." },
    { slug: "dau-wau-stickiness", why: "Daily-over-weekly activity — rider stickiness. A launch city is 'working' when the ratio stops sliding; this problem drills the two-window fold." },
    { slug: "count-salary-categories", why: "Zero-bucket stacks via UNION ALL — launch reporting must show categories with no spend, not drop them. The census that hides an empty arm hides a broken feed." },
    { slug: "active-users", why: "Consecutive-day activity — riders riding day after day. Habit formation is the launch KPI this problem drills with streak logic." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Each rider's favorite service class — the argmax shape behind the class-mix read. Promo waves target riders by their dominant class." },
    { slug: "number-of-times-a-driver-was-a-passenger", why: "Supply riding demand — a LEFT JOIN across the same table's two roles. Driver-partner economics means the same person can sit on both sides, and the census must keep both arms." },
    { slug: "fix-names-in-a-table", why: "Fleet-partner name hygiene before any join: 'nordic gadgets ab' versus 'Nordic Gadgets AB' silently splits one fleet's fare book in two." },
    { slug: "keep-latest-dedupe", why: "Dispatch telemetry arrives with retries — keep the latest dispatch stamp per ride with ROW_NUMBER. Dedupe-before-count is why the 82-stamp census reconciles." },
    { slug: "uber-first-transaction", why: "The activation read: each rider's FIRST ride via a first-event subquery. A launch city is won on the request-to-first-ride gap, and this problem drills the exact shape the activation census is built on." },
    { slug: "new-users-daily-count", why: "Daily first-ride counts — the promo-wave footprint. Riders arrive in bursts keyed to launch waves; this is the census the committee reads the morning after each wave fires." },
    { slug: "cohort-repeat-revenue", why: "Fare-book revenue split by rider vintage — the 63.5% concentration read at cohort grain. Fold the book by signup cohort and the corporate-heavy vintages fall out immediately." },
    { slug: "winback-recovery", why: "Riders gone quiet after a promo lull, and whether a wave brought them back — the EXCEPT/anti-join for dormancy plus the recovery census the launch pod reports weekly." },
    { slug: "funnel-step-conversion", why: "Request → dispatch → completion as a step funnel with denominators stated per stage — the 82-stamped, 52-completed spine expressed as conversion, not counts." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Two rides inside a week — the habit window the launch playbook prices promos against. Conditional window counts over ride timestamps, tie-safe." },
    { slug: "find-bursty-behavior", why: "Ride bursts around promo waves — variance-aware detection over the ride spine. A city bucket that spikes off-pattern is either a wave working or a feed misbehaving; this problem trains the reflex to tell them apart." },
    { slug: "median-time-to-convert", why: "Median request-to-activation lag — the 2.98-day dispatch norm read at rider grain. Medians resist the outlier corporate account that drags means, which is why the supply pod quotes them." },
    { slug: "calculate-orders-within-each-interval", why: "Rides banded by dispatch-latency interval — the SLA-bucket read the supply pod uses to size the match-fallback pool and set the driver-seed trigger." },
    { slug: "customer-order-frequency", why: "Riders banded by ride frequency — the ladder (24, 17, 14, 13, 5, then the four-way tie at 4) banded and counted, so the wave plan knows who to deepen versus broaden." },
    { slug: "duplicate-charge-pairs", why: "Self-join windows over the billing spine to surface double-charged legs — the corporate-account fraud screen billing runs before any statement goes out." },
    { slug: "transaction-velocity", why: "Payment-row velocity per account — the velocity screen against the 27 settlement rows before close. Sudden cadence shifts are how split-payment anomalies announce themselves." },
    { slug: "suspicious-bank-account-transactions", why: "Rule-based anomaly flags over the money tables — the same reflex this kit's close demands on void-but-settled #11 (925.00) and paid-over-zero #28 (1,756.00)." },
    { slug: "chargeback-rate-ranking", why: "Disputed-fare share ranked by account — the chargeback read that decides which corporate account gets a payment-hold conversation before the next billing cycle." },
    { slug: "budget-pacing", why: "Promo spend paced against budget with cumulative-to-plan windows — the wave-2 go/no-go input, folded from the same opex ledger the launch census reads." },
    { slug: "channel-ltv-vs-cac", why: "Rider lifetime value against acquisition cost per channel — the 3,000-plus concentration stat in economic clothing: fold per-rider fare books, compare against wave spend." },
  ],
};
