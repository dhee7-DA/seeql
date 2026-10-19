// Cabify — Wave-9 (Task 98), mobility domain, no tagged LC pool — theme-curated; facts from scripts/company-facts.md.
// Quality-first ride-hailing SQL: the storefront db read as a two-rail mobility
// sandbox — customers are riders (region = city-market buckets: EU is the
// Iberia/Europe core out of Madrid HQ, LATAM the São Paulo flagship, APAC/US
// corporate-travel pilot clusters), orders are trips (delivered =
// completed-and-charged 52, shipped = in-progress with shipped_at as the
// pickup-dispatch stamp 30, pending = requested-awaiting-driver 14, cancelled =
// rider/driver cancel 7), order_items are fare lines (quantity = units,
// unit_price = unit rate — the base/distance/time components), products are the
// service tiers (Lite, Easy, Executive and the sustainability bands, 16 tier
// SKUs), suppliers are the independent fleet partners/drivers (6), invoices are
// corporate Cabify Business billing statements, payments are charge legs on two
// rails (card = rider card charges, wire = corporate-account settlements), and
// money tables are INTEGER cents — the dollar read is amount_cents / 100.0.
// Pool provenance: company-pools.md carries NO Cabify section — fewer than 2
// tagged rows and none SQL-graded — so all 10 topic slug sets and all 32
// problems are theme-curated from the pools file's theme menu and say so. Case
// briefs quote probed figures from scripts/company-facts.md (probed
// 2026-10-12); every case slot is mechanically verified against db/custom.db
// by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const cabifyKit: CompanyKit = {
  id: "cabify",
  domainId: "mobility",
  name: "Cabify",
  tagline: "Quality-first ride-hailing: tiers, corporate travel, city ops",
  accent: "text-violet-300",

  brief: [
    "**Cabify** is the Spanish ride-hailing company that bet on quality over volume — founded in Madrid in 2011, running Spain and Latin America (the São Paulo flagship among them) with a tiered fleet: Lite for value, Easy taxi integration, Executive for the premium end, plus sustainability bands, and Cabify Business corporate accounts riding on top. The positioning shows up in the data: drivers onboard as independent fleet partners with quality ratings, ETAs and safety are board-level metrics, and the corporate book is billed on statements, not swipes. This kit maps the storefront db onto that world: 16 riders, 103 trips worth **34,833.28**, and 251 fare lines — quantity = units, `unit_price` = unit rate. The trip-fate map is fixed: delivered = {emerald:completed-and-charged} (52, 50.5%), shipped = in-progress (30, 29.1%), pending = requested-awaiting-driver (14), cancelled = {rose:rider/driver cancel} (7, 6.8%).",
    "The data org splits into city ops, marketplace/supply, and a corporate-account pod that owns Cabify Business, and they read the same trip spine at different grains. A trip books at created_at, and `shipped_at` is stamped when the pickup is dispatched — **82 of 103 trips** carry the stamp; on this db's coarse DAY clock the request-to-dispatch gap averages **2.98 days** with a 2–4 spread (production reads minutes — the sandbox clock is a teaching abstraction), and the regional reads run EU 2.94, APAC 2.93, US 3.07, LATAM 3.5. Money sits one layer down: invoices are the corporate billing statements and payments are the charge legs, both in INTEGER cents where the dollar read is `amount_cents / 100.0`. The two rails tell the corporate-vs-consumer story: card legs — rider charges — are 16 for 37,364.00, while {violet:wire} legs — corporate settlements — are 11 for 32,248.00.",
    "Interview screens are denominator-first and market-shaped. A typical loop opens with a **two-grain market census** — EU runs 45 trips from just 8 riders (5.6 per rider) while the US pilot runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'does an awaiting trip count in your completion base?'*), then into the rider-value ladder where the 24/17/14/13/5 rungs end in a **four-way tie at 4** and rank semantics become a policy decision. Late rounds walk the {sky:14-month trip spine} (2024-01 to 2025-02, opening month 3,731.97, July trough 1,193.86) with LAG deltas, or the fleet-partner quality bench where only 2 of 6 partners clear the 4.5 rating floor. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Cabify section — fewer than 2 tagged rows, none SQL-graded — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: trip-fate conditional counts, two-grain censuses, CASE tier bands, tie-heavy rider ladders, pickup-latency date math and the cents-safe corporate billing spine. Do the topics in order, then run the **six case studies** on the live storefront db: the {emerald:market trip-fate census} city ops opens every week with, the {violet:charge-rail reconciliation stack} finance closes each month with, a month-over-month fare pulse, an above-the-mean rider watchlist, a never-completed winback anti-join, and a market tier fold for the catalog pod — then re-run each from a blank editor a week later, because *the second pass is where recall actually forms*. The bar to clear: *state the definition and the denominator before you compute anything* — then make every trip-fate census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:40 —** The day starts with the trip-fate refresh. A city-ops analyst opens the market board before standup: did overnight requests land, does the one-pass fate census reconcile — 52 completed + 30 in-progress + 14 awaiting + 7 cancelled = **103 by construction**? A market whose arms don't foot is *the day's first incident*, not a rounding note. The {rose:cancellation} share goes out by market — APAC 8.1% worst against EU 6.7%, US 5.3%, LATAM clean at 0 — and if pickup-dispatch latency drifts off the **2.98-day** norm on the sandbox clock, the supply queue gets pulled before the ETA review ships.",
    "**11:30 —** Midday is the quality-and-mix read. The account pod wants the rider-value ladder with the four-way tie at 4 trips handled honestly — shared rungs, named policy; the supply team wants the fleet-partner bench re-cut, only **2 of 6 partners** above the 4.5 rating floor; a market lead wants trips beside riders (EU 45-from-8 versus US 19-from-2) and the tier mix underneath — how much of the book rides **Executive** versus Lite. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the ops-review argument*.",
    "**16:00 —** The afternoon tilts to money. The charge-rail stack refreshes first: 16 card legs worth 37,364.00, 11 {violet:wire} legs — the corporate settlements — worth 32,248.00, and the TOTAL row at **27 legs / 69,612.00** that must tie to the cash account's debit footing before billing sends a single reminder. The coverage split reads 21 exact, 1 partial (4,000 of 6,148 settled) and feeds the dunning draft — 6 corporate statements worth 15,217 have no settlement leg at all — while the anomaly list gets walked line by line: a void-but-charged statement (#11, 925.00) and a paid-status statement with zero legs (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Completed-trip rate", what: "Trips completed-and-charged ÷ ALL trips requested: 52 of 103 (50.5%). The denominator is the whole test — the 14 awaiting requests stay in the base because 'not yet matched' is exactly what the metric watches." },
    { name: "Cancellation share", what: "Cancelled trips ÷ requested, sliced by market: APAC 3 of 37 (8.1%) worst, EU 6.7%, US 5.3%, LATAM 0 of 2. The conditional-count ratio city ops reads first, denominator fixed before the ratio." },
    { name: "Pickup-dispatch latency", what: "created_at → shipped_at over stamped trips only: 82 of 103, averaging 2.98 days on the db's DAY clock (range 2–4); regional reads EU 2.94 / APAC 2.93 / US 3.07 / LATAM 3.5. The population statement ships with the number — awaiting trips have no stamp yet and must not dilute it." },
    { name: "Market fare mix (AOV)", what: "Average fare per market: EU 335.32, APAC 313.66, US 383.48, LATAM 426.22 against the 338.19 platform mean and a 25.47 to 1,088.44 spread. The spread IS the tiering story — Executive-heavy baskets pull the average up." },
    { name: "Fleet-partner quality bench", what: "Partners rated 4.5+: only 2 of 6 (Nordic 4.6, Alpine 4.8) against Pacific's 3.9. Quality-first positioning makes the bench depth a supply-strategy number, not a vanity stat." },
    { name: "Rider concentration", what: "Share of the fare book from riders spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). Alice Chen alone books 24 trips worth 7,262.35 — one corporate traveler moves a market's quarter." },
    { name: "Corporate billing book", what: "28 Cabify Business statements: 21 paid worth 66,443.00, 6 open worth 19,609.00, 1 void 925.00; coverage reads 21 exact / 1 partial / 6 never-collected worth 15,217. The AR anti-join the billing pod refreshes every close." },
    { name: "Charge-rail mix", what: "Card legs (rider charges) 16 for 37,364.00 versus wire legs (corporate settlements) 11 for 32,248.00 — footing to 27 legs / 69,612.00, the cash account's debit total. The consumer-versus-corporate read in one stacked query." },
  ],

  topics: [
    {
      name: "Trip-fate conditional counts",
      why: "Every Cabify ops screen opens with the fate census: requested, dispatched, completed-and-charged, cancelled. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-progress trip 'completed' — 30 versus 52 on this db.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest", "game-play-analysis-v", "ads-funnel", "customer-placing-the-largest-number-of-orders", "second-highest-salary"],
    },
    {
      name: "Two-grain market censuses",
      why: "Trips and riders are different grains of the same join, and every census here reports both: EU runs 45 trips from 8 riders while the US pilot runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "students-and-examinations", "new-users-daily-count"],
    },
    {
      name: "Tier banding with CASE",
      why: "Lite, Easy, Executive and the sustainability bands are CASE-classified — with fixed edges the fare card publishes and a price ladder (14.99 to 199.99) that splits into budget and mid bands, 8 SKUs each. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the revenue forecast.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories", "customers-who-bought-a-and-b-not-c", "ar-aging-schedule", "most-frequently-ordered-product-per-customer", "average-selling-price"],
    },
    {
      name: "Rider-value ladders",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — the trip ladder runs 24, 17, 14, 13, 5 and then three riders sit tied at 4 trips on this db. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer riders, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "the-most-recent-three-orders", "find-loyal-customers", "find-churn-risk-customers", "rolling-7d-actives"],
    },
    {
      name: "Pickup-latency date math",
      why: "Request-to-dispatch pairs two timestamps of the same trip, and the pairing is a date-math problem: julianday deltas over stamped trips only, the population stated before the average. Window and recency questions (latest dispatch per market, two requests within seven days) live in the same toolkit.",
      slugs: ["average-time-of-process-per-machine", "the-latest-login-in-2020", "users-with-two-purchases-within-seven-days", "median-time-to-convert", "sessionize-events", "confirmation-rate", "product-price-at-a-given-date", "duplicate-charge-pairs"],
    },
    {
      name: "Joining riders to trips",
      why: "Riders carry city and market; trips inherit them through joins, and the join type decides who survives. A trip without a rider is corruption; a rider without trips is dormant demand — on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "customers-who-never-order", "employee-bonus", "winback-recovery", "sellers-with-no-sales"],
    },
    {
      name: "Corporate billing & cents discipline",
      why: "Riding is not collecting — Cabify Business statements settle on their own calendar, and the finance tables (28 invoices, 27 payment legs, INTEGER cents) are where the trip world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "monthly-transactions-i"],
    },
    {
      name: "One-pass fate censuses",
      why: "The ops board gets completed, in-progress, awaiting and cancelled in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift apart.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "group-sold-products-by-the-date", "queries-quality-and-percentage", "trips-and-users", "top-travellers"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month trip spine (2024-01 to 2025-02) is the city review's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and opening month (3,731.97) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "list-the-products-ordered-in-a-period", "week-over-week-churn", "budget-pacing", "dau-wau-stickiness", "fix-product-name-format", "null-blank-audit"],
    },
    {
      name: "Nested folds & rider gates",
      why: "Screens escalate into staging: fold per-rider trip counts, then judge them against a computed platform mean (6.44 here — exactly four riders clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments", "repeat-purchase-rate", "cohort-repeat-revenue"],
    },
  ],

  theory: [
    {
      id: "cabify-t1",
      q: "Your market report joins riders to trips. When do you INNER and when do you LEFT — and what silently breaks if you filter a trip column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A fare report joins trips to riders: a trip with no rider row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A dormant-rider report must be LEFT from riders: the riders with no trips ARE the answer, arriving with NULL trip columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload rider row — the LEFT quietly became an INNER and the dormant cohort vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-trip riders, and proving that zero is itself the analyst's job: all 16 riders appear in the trip table somewhere, which is exactly what a quality-first marketplace with vetted onboarders should show — but the query that proves it must still be written, not assumed.",
      tag: "joins",
    },
    {
      id: "cabify-t2",
      q: "The rider-value ladder runs 24, 17, 14, 13, 5 trips — then THREE riders tie at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the tie at 4 consumes ranks 6 through 8, and the next distinct count (3 trips, two riders) lands on rank 9, implying two phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which rider's account manager gets credit. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer riders (RANK or DENSE_RANK), or an explicitly named tie-breaker like lifetime fare value (which would order Pedro's 1,686.17 above Keiko's 1,098.60 and Noah's 737.68 inside the tie), then id — and writing it in the query comment. On a quality-first marketplace the tie-breaker you name is a promise you make to the account pod.",
      tag: "windows",
    },
    {
      id: "cabify-t3",
      q: "The census shows 103 trips and 16 riders; EU shows 45 trips and 8 riders. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts trip rows after the join — one row per trip, so a rider with 24 trips contributes 24. COUNT(DISTINCT customer_id) folds those rows back to riders — EU's 45 trips collapse to 8 accounts. Neither is wrong: trips measure load and utilization, riders measure installed base and coverage. The ratio — 5.6 trips per rider in EU versus 9.5 in the US pilot on this db — is the intensity signal that decides whether a market is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for fare lines and COUNT(*) silently counts fare lines, not trips — 251 of them. On a tiered fleet there is a fourth grain waiting too: trips by tier need COUNT over the tier mapping, not a sum of unit rates. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "cabify-t4",
      q: "shipped_at is NULL until pickup is dispatched. What is your policy for the latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only dispatched trips have a latency, so the report measures request-to-dispatch for the 82 of 103 trips that carry the stamp — averaging 2.98 days on this db's DAY clock, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL trips returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 awaiting plus 7 cancelled rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents instant dispatches for requests no driver has taken. A quality-first marketplace lives on this number: the ETA promise is the brand, and a latency report whose WHERE clause is doing definitional work without saying so is exactly what a Cabify reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "cabify-t5",
      q: "The city review wants completed-trip fare per market for markets carrying at least ten trips. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-progress, awaiting and cancelled rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-trip floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a market line and an error, and between a threshold applied to trips versus to fare dollars. The strong answer places every filter by asking: is this a fact about one trip, or about a market? On this db the floor keeps EU's 45, APAC's 37 and the US pilot's 19 while LATAM's 2 trips drop — and whether the flagship bucket belongs in the deck at n=2 is a framing call you state, not hide.",
      tag: "pipeline",
    },
    {
      id: "cabify-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 trips always produce a mean (6.4375 trips per rider, 6.44 rounded — exactly four riders clear it). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each trip to ITS rider's average fare) re-runs per outer row and answers a different question at a different cost — useful for flagging a rider's Executive splurge against their own baseline, wasteful as a full-table scan. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "cabify-t7",
      q: "The trend board buckets trips by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's requests, and month-end is exactly when corporate travel books. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine the book opens at 3,731.97 and troughs at 1,193.86 in July, so the deltas around the trough are the story; a zeroed baseline would fake a flat first step. Date discipline is ops discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "cabify-t8",
      q: "Finance says a Cabify Business statement is 'paid' but the payments table has no legs for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment legs are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a payment leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 quietly eats the remainder on every odd-cent leg. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-collected, the charge-rail stack must foot to 27 legs and 69,612.00 against the cash account's debits, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "cabify-t9",
      q: "EXISTS or IN — how do you choose for the corporate anomaly sweep, and what does each do when the list or the key carries NULLs?",
      a: "IN materializes the subquery's values into a list and compares each outer row against it — x IN (…) is a three-valued comparison, so a single NULL in the list poisons NOT IN entirely and muddies IN. EXISTS asks 'does at least one matching row exist' per outer row, never builds a list, short-circuits at the first match, and treats NULL keys as simple non-matches. For the anomaly sweep — riders whose statements are void, statements whose status contradicts their legs — EXISTS is the safe default: the driving table's key is the one column most likely to arrive NULL on a staging cut. The performance folklore (IN faster for small lists, EXISTS for large) is engine-dependent; the correctness argument for EXISTS is not. Say the NULL behavior out loud and the follow-up is yours.",
      tag: "subqueries",
    },
    {
      id: "cabify-t10",
      q: "UNION versus UNION ALL in the charge-rail stack — why does the billing pod's standard insist on UNION ALL plus a written reason?",
      a: "UNION concatenates branches and then deduplicates whole rows; UNION ALL just concatenates. The dedup pass is a silent correctness risk: two branches that emit byte-identical rows — same rail, same counts, no distinguishing label — collapse into one, and a market or a rail disappears from the board with no error anywhere. The billing pod's rule is UNION ALL plus a comment stating WHY duplicates are impossible (each branch emits a distinct literal label), because the comment is the correctness argument a reviewer can check. UNION also costs a sort-for-distinct the stack does not need. The only time UNION earns its place is when the branches genuinely can produce identical rows and the dedup is the intent — which is a business statement, so write it down.",
      tag: "pipeline",
    },
    {
      id: "cabify-t11",
      q: "ROWS versus RANGE in a window frame — when does the difference actually change a number a stakeholder reads?",
      a: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — a cumulative total, not a moving window; the first surprise. The second: RANGE includes PEERS — rows tied on the ORDER BY key enter and leave the frame together — while ROWS counts physical rows. So a rolling statement value with ROWS BETWEEN 6 PRECEDING AND CURRENT ROW walks exactly seven rows even when three statements share an issue date, while the RANGE twin absorbs all tied statements at once. On a month spine ties are rare and the two agree; at statement or leg grain ties are guaranteed, and the frame choice changes the cell. Say 'ROWS is row-physics, RANGE is value-physics' and you have answered the question.",
      tag: "windows",
    },
    {
      id: "cabify-t12",
      q: "When do you stage a CTE instead of nesting a subquery — and what does a CTE buy beyond readability?",
      a: "A CTE names a fold and gives it one place to live: the monthly spine, the per-statement leg fold, the per-rider trip count — staged once, referenced twice, unit-testable in isolation by selecting from the CTE alone. A nested subquery buries the same logic where it can only be debugged by reading inside-out, and repeating it twice risks two subtly different copies of the definition. CTEs also let the outer query reference the staged grain multiple times — the month walk joins the spine to itself; the coverage grid folds per statement and then classifies — which nested subqueries make unreadable. The cost is negligible on this db; on huge engines materialization hints vary, which is worth one sentence in the answer. The rule: if the fold has a business name, it deserves a CTE with that name.",
      tag: "subqueries",
    },
    {
      id: "cabify-t13",
      q: "What does GROUP_CONCAT actually do, what does DISTINCT inside it change, and where does it shine in this kit's reporting?",
      a: "GROUP_CONCAT folds a group's values into one comma-joined cell — EU's completed book reads 'Electronics,Audio,Apparel,Wearables,Video,Accessories'. It concatenates EVERY input row, so a family with twelve fare lines prints twelve times unless you write GROUP_CONCAT(DISTINCT p.category). Two honest caveats: the order of elements is not guaranteed without an ORDER BY inside the aggregate (SQLite supports the extension), and the cell has a length cap you should not hit in a memo. It shines wherever a stakeholder wants the roster inside the row — a market's families, a renter's rotation card, a day's active listings — turning a second query into a second column. The failure mode to name: folding long lists for every row of a big result, which bloats the export for no reading value.",
      tag: "aggregation",
    },
    {
      id: "cabify-t14",
      q: "FILTER (WHERE …) versus SUM(CASE WHEN …) for the one-pass fate census — what does each buy, and which is the portable twin?",
      a: "COUNT(*) FILTER (WHERE status = 'cancelled') restricts which rows enter the aggregate — one scan, one row per market, every arm printed side by side: completed, dispatched, awaiting, cancelled, reconciling to 103 by construction. SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) computes the same count by arithmetic and runs on every engine, including older ones — it is the portable twin, and the pairing is the point: FILTER for the SQLite house style, SUM(CASE) when the query must survive a dialect move. Two details interviewers probe: FILTER returns 0 (never NULL) for empty arms, which is why buckets never vanish; and the two forms must use the SAME predicate — a drifted WHERE inside one arm is how a census stops footing. Four sequential queries are four chances to drift; one pass is the census's whole argument.",
      tag: "aggregation",
    },
    {
      id: "cabify-t15",
      q: "Why are half-open date intervals the house standard — and what exactly does BETWEEN drop?",
      a: "TEXT timestamps carry time, so BETWEEN '2024-03-01' AND '2024-03-31' compares against midnight on the 31st — every trip requested at 00:01 or later on the last day falls outside, and month-end is precisely when corporate travel books. The half-open form — created_at >= '2024-03-01' AND created_at < '2024-04-01' — keeps every instant of March with no boundary arithmetic and composes cleanly: next month's window starts where this one ends, so windows tile without gaps or overlaps. The interview version: 'BETWEEN is inclusive-inclusive; datetime windows want inclusive-exclusive.' The proof anyone can run: count March twice, once each way — the BETWEEN read is short by the last night's requests, deterministically.",
      tag: "dates",
    },
    {
      id: "cabify-t16",
      q: "You bucket by STRFTIME('%m', created_at) and the trend merges Januaries. Walk me through the format-string contract and the spine that actually reconciles.",
      a: "STRFTIME's format string is a contract: '%m' is the two-digit month, '%Y' the four-digit year — '%m' alone is lossy, so January 2024 and January 2025 share the '01' bucket and 14 months of data cram into 12 rows. The spine is STRFTIME('%Y-%m', created_at), which yields 14 distinct buckets from 2024-01 to 2025-02 on this db and sorts correctly as text — the zero-padded month is what makes '2024-1' style ad-hoc keys break. The reconciliation check is arithmetic: bucket count must match the calendar's month count over the span; the moment it does not, a format bug or a timezone drift exists. Same discipline for '%W' week keys (year-less, week-numbering quirks) and '%d/%H' day-hour cuts: state the bucket contract before the trend, and the trend cannot lie.",
      tag: "dates",
    },
    {
      id: "cabify-t17",
      q: "Money is stored as INTEGER cents. What is the full discipline for dollar reads — division, rounding, and where each happens?",
      a: "Three rules. Divide real: amount_cents / 100.0 — INTEGER/INTEGER is integer division and truncates the remainder, which is invisible on whole-dollar data and wrong on the first odd-cent leg. Round at the display edge: ROUND(…, 2) as the last step before the cell prints, never mid-pipeline — rounding a fold then summing the rounded parts drifts from the total. Aggregate in cents: SUM the integer column, convert once — (SUM(amount_cents) / 100.0), not SUM(amount_cents / 100.0) over millions of rows of float drift. The culture behind the rules: every money cell in this kit reconciles to another fold — the charge rails to the cash account, the coverage grid to the statement book — and reconciliation dies quietly the day one query divides differently than its twin. The .0 is two characters of insurance; the habit is the policy.",
      tag: "quality",
    },
    {
      id: "cabify-t18",
      q: "Dispatch telemetry double-fires on retries. How do you keep exactly one stamp per trip — and why is ROW_NUMBER the shape?",
      a: "Keep-latest dedupe: ROW_NUMBER() OVER (PARTITION BY trip_id ORDER BY stamped_at DESC, id DESC) numbers each trip's retries newest-first, and the outer filter keeps rn = 1 — one deterministic winner per trip. The two ORDER BY keys matter: stamped_at breaks ties by time, id breaks ties the clock cannot (same-second retries), and without a deterministic tie-break the 'winner' is whatever the engine scanned first — a support-ticket factory. COUNT-based dedupe or DISTINCT ON flavors either fail on ties or hide the policy. Then the census reconciles: 82 stamps across 103 trips, 14 awaiting and 7 cancelled with none — the dedupe is why the 82 is trusted. Interview version: name the partition key, name both tie-breakers, and say what rn > 1 rows are (retries — audit them before deleting anything).",
      tag: "windows",
    },
    {
      id: "cabify-t19",
      q: "A CASE band's arms must be exhaustive and ordered. What breaks when they are not — and what is the review checklist?",
      a: "CASE WHEN is first-match-wins: overlapping arms in the wrong order make later branches unreachable — total >= 200 before total >= 500 folds the whole long-haul band into 'week-plus' and the tier P&L flattens silently. Non-exhaustive arms without an ELSE return NULL for the misses — a band report with NULL rows is a hole in the revenue forecast, because those trips exist but belong to no bucket. The checklist: order arms narrow-to-wide (most specific predicate first); decide whether ELSE is a real bucket ('short') or a guard that should never fire; and reconcile — the band arms must foot to the total row count (25 + 40 + 38 = 103 on this db's fare bands). A CASE that does not foot is not a classification, it is a leak.",
      tag: "pipeline",
    },
    {
      id: "cabify-t20",
      q: "Anti-joins: LEFT JOIN … IS NULL versus NOT EXISTS versus NOT IN — when is each the right shape for 'riders with no completed trips'?",
      a: "LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered' … WHERE o.id IS NULL is the visual shape: the conditional match lives in ON, unmatched riders survive with NULL payloads, and the IS NULL filter keeps the empty side — COUNT(o.id), never COUNT(*), or the payload row counts as a match. NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered') is the same question with the correlation explicit and no NULL-payload subtleties — the safest default and the clearest to review. NOT IN (SELECT customer_id …) is the trap: one NULL customer_id in the subquery turns every comparison UNKNOWN and the result empties while looking valid — only safe with an explicit IS NOT NULL guard inside the subquery. On this db the never-completed cohort is exactly one rider (Liam O'Brien), which all three shapes find — the interview question is which shape survives the staging cut that introduces NULLs.",
      tag: "joins",
    },
    {
      id: "cabify-t21",
      q: "COALESCE is everywhere in this kit's billing reads. Give the policy: where it is right, where it is a lie, and how you decide per column.",
      a: "COALESCE is right when NULL means 'absent, display as zero': a statement with no settlement legs has paid_cents COALESCE'd to 0 so the coverage grid prints 0.00 — the bucket exists, the money does not. It is right for label fallbacks — corporate_name falling back to the rider name. It is a lie when NULL means 'not yet': coalescing an unstamped latency to 0 invents instant dispatches for trips no driver has taken, and coalescing a first-month LAG to 0 fakes a flat month where no baseline exists. The decision is per column, stated out loud: what does NULL mean here — absent, pending, or unknown? Absent takes a default, pending takes a NULL you report, unknown takes an audit. The reviewer's question is never 'did you COALESCE' but 'what did you decide NULL meant, and who signed off'.",
      tag: "nulls",
    },
    {
      id: "cabify-t22",
      q: "A correlated subquery compares each rider to their own market's mean. Why is it slow at scale, and what are the two decorrelations?",
      a: "A correlated subquery references the outer row — the market mean inside WHERE re-runs once per rider — so the cost is outer-rows × inner-scan. Two decorrelations: the derived-table form computes per-market means once in a CTE (GROUP BY region) and joins back on region, turning N scans into two folds; the window form, AVG(fare) OVER (PARTITION BY region), computes each partition's mean once and carries it on every row — the closest shape when the comparison must ride beside the row. On 16 riders the correlated form is instant and the clearest to read; on a million-trip production table it is the query that pages the on-call. The interview answer names the trade and the switch: correlated for clarity at small scale, join-to-CTE or window for the warehouse table — and states that all three return the same rows so the choice is cost, not correctness.",
      tag: "subqueries",
    },
    {
      id: "cabify-t23",
      q: "When is a self-join the right tool? Give the mobility-flavored examples you would reach for first.",
      a: "A self-join pairs rows of one table with other rows of the same table under an alias pair — the tool whenever the question is a relationship BETWEEN rows, not an attribute of one. The mobility staples: duplicate charge pairing (payments p1 JOIN payments p2 ON same invoice, p1.id < p2.id — the self-join with a strict inequality that keeps one representative per pair), consecutive-event pairing (each trip against its predecessor via the LAG window when you can, or a self-join on previous-id when the pipeline is not window-friendly), and same-city rider pairing for trust sampling (c1 JOIN c2 ON same region AND c1.id < c2.id — the < that halves the symmetric pairs). The discipline that gets graded: always break symmetry with an inequality or a role column, or every pair prints twice and the census doubles. If the pairing is 'previous row of mine', say why the window is preferred — one pass, no index gymnastics.",
      tag: "joins",
    },
    {
      id: "cabify-t24",
      q: "The LAG walk's first row is NULL. What are the honest ways to present it, and what does each fake alternative cost?",
      a: "The NULL is the definition: LAG(fare) on the spine's first row has no prior month, so no change exists — 2024-01's mom_pct is NULL because December 2023 is not in the data. Honest presentations: print the NULL and let the chart gap; label the row 'baseline' in the deck; or filter the first row out of a delta-only view after stating the population. The fakes and their costs: COALESCE to 0 fabricates a flat month — a zero percent change is a claim ('nothing moved') the data never made; substituting the platform average invents a plausible-looking movement; dropping the row silently shifts every later comparison one slot — the deltas still print but the spine's start has moved. The general rule the panel wants: a structural NULL (edge of the window) is information; a data NULL (missing value) is a decision; and the two must never be treated with the same COALESCE.",
      tag: "windows",
    },
  ],

  mcqs: [
    {
      id: "cabify-mcq-1",
      prompt: "A trip row's status reads 'shipped'. In this kit's Cabify stage map, what happened?",
      choices: ["In progress — pickup dispatched, stamped with shipped_at", "Completed-and-charged — the ride finished and the fare booked", "Requested-awaiting-driver — no dispatch yet", "Cancelled by rider or driver"],
      answer: 0,
      why: "The stage map is fixed: shipped = in-progress with the pickup-dispatch stamp — 30 of 103 trips. Only 'delivered' (52) means completed-and-charged.",
      notes: [
        { choice: 1, why: "Completed-and-charged is 'delivered' — 52 trips. Calling in-progress trips completed inflates the completion rate before a single fare is booked." },
        { choice: 2, why: "Awaiting-driver is 'pending' — 14 requests with no shipped_at yet. Pending is not in-progress; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "cabify-mcq-2",
      prompt: "Cancellation share by market: the db holds 7 cancelled trips of 103 requested. What is the denominator?",
      choices: ["Completed trips only (7/52 = 13.5%)", "All trips requested (7/103 = 6.8%)", "Dispatched trips only (7/82 = 8.5%)", "Distinct riders (7/16 = 43.8%)"],
      answer: 1,
      why: "The house definition: cancelled ÷ ALL trips requested — awaiting and completed stay in the denominator because the share measures friction on demand, and 6.8% is the honest read.",
      notes: [
        { choice: 0, why: "7/52 mixes stages — completed trips cannot cancel retroactively, and shrinking the base doubles the share on the slide." },
        { choice: 2, why: "7/82 is the dispatched-only base: it drops the 14 awaiting requests, exactly the rows most likely to cancel next — survivorship disguised as precision." },
      ],
      difficulty: "easy",
    },
    {
      id: "cabify-mcq-3",
      prompt: "EU carries 45 trips from 8 riders. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts trip rows (45); COUNT(DISTINCT customer_id) folds repeats back to riders (8). The gap between them — 5.6 trips per rider — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every trip has a rider. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts market buckets, not riders — a third grain nobody asked for. The census is trips AND accounts." },
      ],
      difficulty: "easy",
    },
    {
      id: "cabify-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to cancelled trips only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the cancellation share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the cancellation map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "cabify-mcq-5",
      prompt: "Keep only markets carrying at least 10 trips. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY market HAVING COUNT(*) >= 10", "WHERE trips >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A trip-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db EU (45), APAC (37) and the US pilot (19) clear the bar; LATAM's 2 trips drop out of the deck.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'trips' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "cabify-mcq-6",
      prompt: "The rider-value ladder runs 24, 17, 14, 13, 5 trips, then THREE riders tie at 4. Under RANK, what rank do the two 3-trip riders carry?",
      choices: ["9", "7", "8", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-trip riders share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "8 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "cabify-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency trips — same number, 82-trip population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The awaiting trips double-counted their request day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 trips.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "cabify-mcq-8",
      prompt: "A staging-table report uses rider_id NOT IN (SELECT customer_id FROM trips WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every trip carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "cabify-mcq-9",
      prompt: "A board stack puts the card rail under the wire rail in one layout, built with UNION. A reviewer says one market's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same market, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same market, same counts, no rail or branch label — collapse into one, and the board loses a market with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "cabify-mcq-10",
      prompt: "A dashboard walks corporate fare value statement by statement: SUM(amount) OVER (ORDER BY issued_on). Two statements share an issue date, and the cumulative 'jumps two statements at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on issued_on join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at statement grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "cabify-mcq-11",
      prompt: "An analyst joins trips to their fare lines (103 trips → 251 lines) and runs `SUM(o.total)` to get the fare book. The result is far above 34,833.28. Why?",
      choices: [
        "ROUND was omitted, so the sum accumulates floating-point error",
        "The join fans each trip out to one row per fare line, so the trip total repeats once per line and the SUM double-counts",
        "SUM ignores NULL totals, which inflates the average per trip",
        "The join deduplicated trips, so the SUM lost rows and fell — the inflation must come from somewhere else",
      ],
      answer: 1,
      why: "o.total lives at the trip grain; order_items lives at the fare-line grain. After the join, a trip with 3 lines contributes its total 3 times, so SUM(o.total) measures trip-total-per-line — a meaningless inflated number. Sum unit_price * quantity at the line grain, or keep the fold at the trip grain.",
      notes: [
        { choice: 0, why: "Floating-point noise is cents-scale, not multiples-of-total-scale. When a joined SUM inflates by the average fan-out (251/103 ≈ 2.4×), think fan-out first." },
        { choice: 3, why: "INNER joins never deduplicate — they multiply. The direction of the error (up, not down) is the tell that rows were repeated, not lost." },
      ],
      difficulty: "medium",
    },
    {
      id: "cabify-mcq-12",
      prompt: "The billing deck labels riders with `COALESCE(c.corporate_name, c.name)`. What prints for a rider whose corporate_name is NULL?",
      choices: [
        "NULL — the expression fails and the row drops",
        "An empty string",
        "The rider's personal name",
        "The literal string 'corporate_name'",
      ],
      answer: 2,
      why: "COALESCE walks its arguments left to right and returns the first non-NULL: no corporate name means the personal name prints. It is the standard display fallback for optional labels — and the polite way to keep every rider row on the deck.",
      notes: [
        { choice: 0, why: "Rows only drop when a WHERE filters them. COALESCE never removes rows — it substitutes values. Confusing the two is how dormant-rider cohorts vanish from reports." },
        { choice: 2, why: "COALESCE returns '' only if an argument IS '' — an empty string is not NULL. The rider's corporate_name is NULL here, so the fallback fires." },
      ],
      difficulty: "easy",
    },
    {
      id: "cabify-mcq-13",
      prompt: "A trend query buckets trips with `STRFTIME('%m', created_at)`. The 2024 and 2025 numbers merge into 14 months' worth of data crammed into 12 rows. What went wrong?",
      choices: [
        "STRFTIME cannot handle TEXT timestamps",
        "'%m' returns the month number only, so January 2024 and January 2025 share the '01' bucket — the spine needs '%Y-%m'",
        "The trips table stores dates in DD-MM order and must be CAST first",
        "'%m' is valid; the merge means the data has duplicates",
      ],
      answer: 1,
      why: "'%m' is the zero-padded month, with no year — every January folds together. The month spine is '%Y-%m', which yields 14 distinct buckets (2024-01 … 2025-02) on this db. Year-less buckets are the classic trend-fiction bug.",
      notes: [
        { choice: 1, why: "12 rows from 14 months is the arithmetic tell: two pairs of months merged. Any bucket count that stops matching the calendar is a format-string bug until proven otherwise." },
        { choice: 3, why: "The data is fine — the format is lossy. Duplicates would show as inflated counts, not merged buckets." },
      ],
      difficulty: "easy",
    },
    {
      id: "cabify-mcq-14",
      prompt: "A promo-window read uses `created_at BETWEEN '2024-03-01' AND '2024-03-31'`. Trips requested on the night of March 31 are missing. Why?",
      choices: [
        "BETWEEN is exclusive on both ends",
        "TEXT timestamps carry a time component, so '2024-03-31 21:14' sorts after '2024-03-31' and fails the upper bound — the window must be half-open: >= '2024-03-01' AND < '2024-04-01'",
        "March 31 rows were cancelled and filtered upstream",
        "The promo started in April; the read is correct",
      ],
      answer: 1,
      why: "BETWEEN on a datetime column compares the full timestamp: '2024-03-31 21:14' > '2024-03-31' (which is midnight), so the last night's requests fall outside. Half-open ranges — >= start AND < next-month-start — keep every instant of the window.",
      notes: [
        { choice: 0, why: "BETWEEN is INCLUSIVE on both ends — that is exactly the bug: it includes midnight March 31 but excludes 21:14 the same day. Exclusivity is not the failure; truncation at midnight is." },
        { choice: 2, why: "A plausible story, but the read loses rows deterministically at month-end regardless of status — and month-end is precisely when corporate travel books." },
      ],
      difficulty: "medium",
    },
    {
      id: "cabify-mcq-15",
      prompt: "The rider ladder runs 24, 17, 14, 13, 5 trips, then FOUR riders tie at 4. Under DENSE_RANK, what rank do the two 3-trip riders carry?",
      choices: ["10", "7", "6", "9"],
      answer: 1,
      why: "Ranks so far: 1..5 for the distinct counts, then the four-way tie shares rank 6. DENSE_RANK never skips: the next distinct count (3 trips) takes rank 7. RANK would stamp it 10 — the tie consumed ranks 6-9, gaps included.",
      notes: [
        { choice: 0, why: "10 is RANK's answer: 1, 2, 3, 4, 5, 6, 6, 6, 6, then 10. The published ladder here uses shared rungs without gaps, so DENSE_RANK it is." },
        { choice: 3, why: "9 is the LAST rank the tie block occupies under RANK, not what the next distinct count receives — and under DENSE_RANK the tie block ends at 6." },
      ],
      difficulty: "easy",
    },
    {
      id: "cabify-mcq-16",
      prompt: "A staging cut feeds `WHERE fare > (SELECT AVG(total) FROM orders WHERE region = 'LATAM')`. LATAM's staging slice contains only cancelled trips. What does the report return?",
      choices: [
        "An error — the subquery must return exactly one row",
        "Zero — no trips beat the mean of cancelled fares",
        "Nothing, silently: the inner fold over zero rows yields NULL, fare > NULL is UNKNOWN, and the report empties while looking valid",
        "Every row — an empty mean is treated as +infinity",
      ],
      answer: 2,
      why: "A scalar subquery over an empty set returns NULL, not an error and not zero. The comparison becomes UNKNOWN row by row, so the result is empty with no warning. Staging cuts — one market, one status, one month — are where this ships; the discipline is stating the inner population and its empty-case behavior out loud.",
      notes: [
        { choice: 1, why: "A confident zero is a different failure mode — that would require COALESCE(NULL, 0), which nobody wrote. The honest answer is the silent empty." },
        { choice: 3, why: "Nothing in SQL treats NULL as +infinity or -infinity. Every NULL comparison degrades to UNKNOWN, which the WHERE drops." },
      ],
      difficulty: "hard",
    },
    {
      id: "cabify-mcq-17",
      prompt: "The anomaly sweep needs riders from the corporate book whose statements are void. `WHERE rider_id IN (SELECT customer_id FROM invoices WHERE status = 'void')` — what is the NULL-safety difference versus EXISTS here?",
      choices: [
        "No difference — IN and EXISTS are always interchangeable",
        "IN builds the list and compares against it; with no NULL customer_id in play both work, but EXISTS stays NULL-safe even when the driving table's key is nullable, and it short-circuits at the first match",
        "IN is faster, so it is always the production choice regardless of NULLs",
        "EXISTS cannot take a subquery with a WHERE clause",
      ],
      answer: 1,
      why: "The danger case for IN is NULLs in the compared list — x NOT IN (… NULL …) silently empties a result, and the mirrored IN risks are the same three-valued logic. EXISTS asks 'does at least one row match' and never materializes a list, so it degrades gracefully and stops scanning on the first hit. On this db the keys are clean, which is exactly why the habit must be deliberate: the staging cut that introduces a NULL is tomorrow's incident.",
      notes: [
        { choice: 0, why: "They are interchangeable only when no NULLs are in play and the lists are small. The interviewer is fishing for the NULL story, not a syntax equivalence." },
        { choice: 2, why: "Performance varies by engine and list size; correctness never takes a back seat to a speed rule of thumb." },
      ],
      difficulty: "hard",
    },
    {
      id: "cabify-mcq-18",
      prompt: "The market tier fold runs `GROUP_CONCAT(p.category)` per market over the fare lines. EU prints 'Electronics,Audio,Audio,Apparel,…' with repeats. What is the fix?",
      choices: [
        "Wrap the whole expression in DISTINCT: SELECT DISTINCT GROUP_CONCAT(...)",
        "Put DISTINCT inside the aggregate: GROUP_CONCAT(DISTINCT p.category) — the fold then prints each family once",
        "Add a HAVING clause to remove duplicate rows",
        "GROUP_CONCAT cannot contain duplicates; the data must have them",
      ],
      answer: 1,
      why: "GROUP_CONCAT folds one cell per group and concatenates every input row — a market with 12 Audio lines contributes 'Audio' 12 times unless DISTINCT is inside the parentheses. DISTINCT is an aggregate-argument modifier, not an outer wrapper, and HAVING filters groups, not values inside a cell.",
      notes: [
        { choice: 0, why: "SELECT DISTINCT deduplicates whole output rows — the market row is already unique per group, so nothing changes. The dedup must happen inside the fold." },
        { choice: 3, why: "GROUP_CONCAT preserves duplicates by design — that is its default contract, and why the DISTINCT inside it is load-bearing." },
      ],
      difficulty: "medium",
    },
    {
      id: "cabify-mcq-19",
      prompt: "A one-pass census runs `COUNT(*) FILTER (WHERE status = 'cancelled')` per market. What does it print for the LATAM bucket, which has zero cancelled trips?",
      choices: ["NULL", "0", "The row is omitted from the result", "An error — FILTER cannot count zero matches"],
      answer: 1,
      why: "COUNT counts matches and returns 0 when none exist — FILTER (WHERE …) restricts which rows enter the aggregate, it does not drop the group. That 0-not-NULL contract is exactly why one-pass censuses reconcile by construction: every bucket prints, and the arms foot to the total.",
      notes: [
        { choice: 0, why: "COUNT never returns NULL — it returns 0 for an empty input. A NULL would come from an aggregate over no rows like MAX or SUM on zero rows, and even those return NULL only outside a group." },
        { choice: 2, why: "Groups come from GROUP BY, which builds a bucket for every present region — LATAM has 2 trips, so the row exists with zeros in the cancelled arm." },
      ],
      difficulty: "easy",
    },
    {
      id: "cabify-mcq-20",
      prompt: "The charge rails total 6,961,200 cents. A teammate writes `SUM(amount_cents) / 100` and gets exactly 69,612 — then argues the .0 in / 100.0 is unnecessary. What is the strongest rebuttal?",
      choices: [
        "They are right — the .0 is purely stylistic",
        "Integer division truncates the remainder: this month's legs happen to sum to a whole multiple of 100 cents, so the bug hides — the first odd-cent statement makes the dollar read silently wrong, which is why / 100.0 is a discipline, not a style",
        "The .0 converts the column to REAL permanently",
        "SQLite rounds integer division up, so / 100 overstates by a cent",
      ],
      answer: 1,
      why: "INTEGER / INTEGER in SQLite is integer division: 6,961,250 / 100 = 69,612, not 69,612.50. Today's totals are whole-dollar multiples, so the truncation is invisible — the trap is that the query is only wrong on data that has not arrived yet. The house rule is / 100.0 everywhere so no future dataset can flip the answer.",
      notes: [
        { choice: 0, why: "It works today, which is precisely why the habit is dangerous. A rule that survives only on clean data is not a rule." },
        { choice: 3, why: "Integer division truncates toward zero — it never rounds. The direction of the missing money is always downward." },
      ],
      difficulty: "hard",
    },
    {
      id: "cabify-mcq-21",
      prompt: "Which expression prints each market's completed-trip share as a clean percentage like 53.3?",
      choices: [
        "ROUND(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*), 1)",
        "ROUND(100 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*), 1)",
        "ROUND(100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*), 1)",
        "SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) * 100.0, rounded in the app",
      ],
      answer: 2,
      why: "SUM of 0/1 flags over COUNT is integer division, so the multiplier must be 100.0 — a REAL — placed BEFORE the division. Choice 1 truncates to 0 or 1, choice 2 truncates the ratio to 0 or 1 first and then scales, and choice 3 defers rounding past the damage.",
      notes: [
        { choice: 2, why: "Tempting — but (flags / COUNT) is already truncated to an integer before the *100 happens. Moving the multiplier after the division is the exact bug." },
        { choice: 3, why: "Formatting in the app hides the integer division from the SQL reviewer and ships the truncated value. Round where the arithmetic happens." },
      ],
      difficulty: "easy",
    },
    {
      id: "cabify-mcq-22",
      prompt: "`SELECT c.name FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id WHERE i.status = 'open'` — the pod wanted never-billed riders visible too. What happened?",
      choices: [
        "Nothing — LEFT JOIN keeps them with NULL statement rows",
        "The WHERE on the right table's column kills every NULL-payload row, silently downgrading the join to an INNER — the never-billed cohort vanished",
        "The query returns each rider once per open statement, inflating the count",
        "i.status = 'open' is case-sensitive and matches nothing",
      ],
      answer: 1,
      why: "A rider with no statements has i.status = NULL, and NULL = 'open' is UNKNOWN — the WHERE discards the row. The predicate must move into the ON clause (or the intent restated): status filters after a LEFT JOIN are the classic silent downgrade, and the cohort it deletes is usually the one the query was written to find.",
      notes: [
        { choice: 0, why: "They survive the JOIN but not the WHERE. The downgrade happens between the two clauses, which is why it never errors." },
        { choice: 2, why: "Fan-out is real (riders with 5 statements print 5 rows), but it is a separate defect — and the WHERE still removes all never-billed riders either way." },
      ],
      difficulty: "medium",
    },
    {
      id: "cabify-mcq-23",
      prompt: "orders has 103 rows; shipped_at is stamped on 82 of them. What does `SELECT COUNT(*), COUNT(shipped_at) FROM orders` return, and what is the gap?",
      choices: ["103, 82 — the gap is the 21 trips with no dispatch stamp yet", "82, 82 — both count stamped trips", "103, 103 — COUNT fills NULLs with zeros", "103, 21 — COUNT(shipped_at) counts NULLs"],
      answer: 0,
      why: "COUNT(*) counts rows (103); COUNT(column) skips NULLs (82). The 21-row gap IS the population story: 14 awaiting-dispatch plus 7 cancelled trips have no stamp — 'not yet' and 'never', not data corruption.",
      notes: [
        { choice: 1, why: "That would be true if every row had a stamp. The whole point of the pair is measuring the gap between the two counts." },
        { choice: 3, why: "COUNT never counts NULLs. To count them, subtract or SUM(CASE WHEN shipped_at IS NULL THEN 1 ELSE 0 END)." },
      ],
      difficulty: "easy",
    },
    {
      id: "cabify-mcq-24",
      prompt: "A corporate-billing walk computes a rolling value with `SUM(amount_cents) OVER (ORDER BY issued_on ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)`. A reviewer asks why not default RANGE. What is the sharpest answer?",
      choices: [
        "RANGE is slower than ROWS on big tables",
        "The default frame with ORDER BY is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — a cumulative total, not a 7-row window; and RANGE counts PEERS, so statements tied on issued_on enter or leave together. ROWS says exactly 'the previous 6 rows plus this one', which is what the walk promises",
        "ROWS rounds to integers; RANGE keeps decimals",
        "The two frames are synonyms when ORDER BY is present",
      ],
      answer: 1,
      why: "Two distinct traps in one: the DEFAULT frame is already unbounded (a running total, not a 7-row average), and RANGE treats ties as one row-group while ROWS walks physically. At statement grain, issue-date ties are guaranteed — the frame choice is the difference between the report the memo asked for and one that silently absorbs peers.",
      notes: [
        { choice: 0, why: "Performance is not the issue — semantics is. Both frames cost about the same; they answer different questions." },
        { choice: 3, why: "They differ exactly when ties exist — and ties are the norm at day/statement grain. 'Synonyms' is the answer that fails the follow-up." },
      ],
      difficulty: "hard",
    },
    {
      id: "cabify-mcq-25",
      prompt: "A fare-band CASE reads `WHEN total >= 200 THEN 'week-plus' WHEN total >= 500 THEN 'long-haul' ELSE 'short' END`. What is wrong?",
      choices: [
        "CASE cannot compare the same column twice",
        "The arms are out of order: a 750-total trip matches the FIRST arm and is banded 'week-plus' — CASE is first-match-wins, so the widest arm must come last",
        "The ELSE label must be quoted",
        "Nothing — the engine evaluates all arms and picks the most specific",
      ],
      answer: 1,
      why: "CASE WHEN stops at the first true arm: everything 200-and-above — including the whole long-haul band — is labeled 'week-plus', and 'long-haul' becomes unreachable. Bands must be written narrow-to-wide (>= 500 first), or the ladder silently flattens to two tiers.",
      notes: [
        { choice: 0, why: "Multiple comparisons of one column are normal — ordering is the contract. The engine never picks 'the most specific' arm; it picks the first true one." },
        { choice: 2, why: "The labels are already inside string literals via the THEN branches. Quoting is not the failure; arm order is." },
      ],
      difficulty: "medium",
    },
    {
      id: "cabify-mcq-26",
      prompt: "In the month-over-month pulse, January's mom_pct reads NULL. A teammate suggests `COALESCE(mom_pct, 0)` 'so the chart starts at zero'. What is the right call?",
      choices: [
        "Do it — a NULL gap breaks line charts",
        "No — the NULL IS the information: no prior row means no baseline. Zero would print a fake flat month; report NULL or label it 'baseline'",
        "Yes, but only for the first six months",
        "Replace it with the platform average instead",
      ],
      answer: 1,
      why: "LAG's first-row NULL is a definition, not a defect: there is no December 2023 in the spine, so no change exists. Coalescing to 0 fabricates a movement that did not happen — the exact sin the ops reviewer hunts. Charts can gap; the number cannot lie.",
      notes: [
        { choice: 0, why: "Charts render gaps fine, and the deck convention here is a labeled baseline row. The fix serves the tool at the cost of the truth." },
        { choice: 3, why: "Substituting the platform average invents a different fake number — worse than zero, because it looks plausible." },
      ],
      difficulty: "medium",
    },
    {
      id: "cabify-mcq-27",
      prompt: "Statements join to settlement legs (28 statements → 27 legs — some split). On the joined rows, what do `COUNT(*)` and `COUNT(DISTINCT i.customer_id)` measure?",
      choices: [
        "Both count statements",
        "COUNT(*) counts statement-leg rows (the join grain); COUNT(DISTINCT i.customer_id) folds back to distinct statement-owning riders",
        "COUNT(*) counts legs only; COUNT(DISTINCT …) errors on the join",
        "Both count riders, since the join is on customer_id",
      ],
      answer: 1,
      why: "After a join, COUNT(*) counts the FINEST grain present — statement-leg pairs, 27. COUNT(DISTINCT i.customer_id) folds duplicates back to people: the 11 riders who hold corporate statements. Naming the grain of each count is the habit the panel grades.",
      notes: [
        { choice: 0, why: "The join fan-out is exactly why they differ. Statements with two legs (ids 1, 5, 12, 19, 22) each contribute two rows." },
        { choice: 2, why: "COUNT(DISTINCT …) is a legal aggregate on any column — it deduplicates, it never errors. The error story is a distraction." },
      ],
      difficulty: "easy",
    },
    {
      id: "cabify-mcq-28",
      prompt: "Which query returns riders who have an in-progress ('shipped') trip but NEVER a completed one — the stalled-dispatch cohort?",
      choices: [
        "SELECT customer_id FROM orders WHERE status = 'shipped' UNION SELECT customer_id FROM orders WHERE status = 'delivered'",
        "SELECT customer_id FROM orders WHERE status = 'shipped' INTERSECT SELECT customer_id FROM orders WHERE status = 'delivered'",
        "SELECT customer_id FROM orders WHERE status = 'shipped' EXCEPT SELECT customer_id FROM orders WHERE status = 'delivered'",
        "SELECT customer_id FROM orders WHERE status = 'shipped' UNION ALL SELECT customer_id FROM orders WHERE status = 'delivered'",
      ],
      answer: 2,
      why: "EXCEPT keeps the left set minus the right — shipped-rider ids minus completed-rider ids — exactly the stalled cohort (on this db, one rider). UNION/UNION ALL return riders in either set (8 rows), and INTERSECT returns riders in both (7) — the opposite of 'never'.",
      notes: [
        { choice: 1, why: "INTERSECT answers 'dispatched AND completed' — the healthy repeat cohort. The business word 'never' maps to EXCEPT, not INTERSECT." },
        { choice: 0, why: "UNION dedups the union of both sets — the 'either' population. It cannot express a subtraction." },
      ],
      difficulty: "hard",
    },
    {
      id: "cabify-mcq-29",
      prompt: "`RANK() OVER (ORDER BY trips DESC)` ranks riders platform-wide. The pod wants each rider's rank INSIDE their market bucket. What is missing?",
      choices: [
        "Nothing — ORDER BY already groups them",
        "PARTITION BY region inside the OVER clause — without it the window is one partition covering the whole table, so EU's top rider can rank behind riders from every other market",
        "A GROUP BY region alongside the window",
        "ROW_NUMBER instead of RANK — partitions are only valid with ROW_NUMBER",
      ],
      answer: 1,
      why: "A window without PARTITION BY is a single global window. Adding PARTITION BY region restarts the ranking per market bucket — the per-market leaderboard the pod asked for. GROUP BY would collapse rows and destroy the per-rider grain; all three ranking functions accept partitions.",
      notes: [
        { choice: 2, why: "GROUP BY folds riders away — you cannot rank rows that no longer exist. Partitioning is the window-side answer." },
        { choice: 3, why: "RANK, DENSE_RANK and ROW_NUMBER all take PARTITION BY; the choice among them is the tie policy, not the partition mechanism." },
      ],
      difficulty: "hard",
    },
    {
      id: "cabify-mcq-30",
      prompt: "A tier mix read groups by product name and Lite splits into 'lite', 'Lite ' and 'LITE' — three buckets. What is the fix that does NOT break the join to fare lines?",
      choices: [
        "DELETE the duplicate tier rows before grouping",
        "Normalize in the query — GROUP BY UPPER(TRIM(p.name)) — and use the same expression anywhere the name is compared",
        "GROUP BY p.id instead; names are cosmetic",
        "Add DISTINCT to the SELECT",
      ],
      answer: 1,
      why: "UPPER(TRIM(…)) folds the three spellings into one bucket, and because tier ids are stable while spellings drift, the normalized expression must match everywhere the name is joined or grouped. Deleting rows destroys history; grouping by id fixes this report but not the next text comparison; DISTINCT does not touch grouping.",
      notes: [
        { choice: 2, why: "Grouping by id works for THIS query — but the join hygiene problem recurs in every name-based filter, and the interviewer wants the normalization habit, not a one-off dodge." },
        { choice: 3, why: "DISTINCT affects output rows, not the fold's buckets. The three spellings still group separately." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-cabify-1",
      tier: "easy",
      topic: "s6",
      universe: "funnel",
      title: "The market trip-fate census",
      brief:
        "Cabify-flavored brief on the storefront db: Monday's city-ops review opens with the trip-fate census — trips requested, completed-and-charged, cancelled, and the average fare — per market bucket, biggest market on top. The status map is fixed: 'delivered' = completed-and-charged, 'cancelled' = rider/driver cancel, and the four fate arms must reconcile to 103 by construction. Probed facts: EU runs 45 trips (24 completed, 3 cancelled, average fare 335.32), APAC 37 (21 completed, 3 cancelled, 313.66), the US pilot 19 (5 completed, 1 cancelled, 383.48), and the São Paulo flagship bucket 2 (2 completed, 0 cancelled, 426.22).",
      ask: "Return each market with trip count, completed trips, cancelled trips and average fare to 2 decimals, biggest market first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS trips,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS completed,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS cancelled,\n       ROUND(AVG(o.total), {3}) AS avg_fare\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY trips {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed literal",
          why: "Completed-and-charged trips carry status 'delivered' — 52 platform-wide, EU 24 of its 45. 'shipped' is the in-progress bucket (EU 12) and 'pending' the awaiting bucket (EU 6); either literal quietly swaps the census onto the wrong funnel stage.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the cancel literal",
          why: "Rider/driver cancels are status 'cancelled' — EU 3, APAC 3, US 1, LATAM 0 of the 7 total. 'shipped' here would print the in-progress counts (EU 12) and the ops floor would chase pickups as if they were cancellations.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the fare precision",
          why: "Fare averages report to 2 decimals so markets reconcile against the platform's 338.19: EU 335.32, APAC 313.66, US 383.48. ROUND(…, 1) prints 335.3 and the deck stops footing with every other fare read on the same page.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-market-first direction",
          why: "The review reads biggest market on top: EU 45, APAC 37, US 19, LATAM 2. ASC would open the meeting on the 2-trip flagship bucket — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["'shipped'", "'pending'", "1", "ASC", "AVG"],
      walkthrough:
        "One join, one fold, four columns at two grains. The join attaches every trip to its rider's market bucket, GROUP BY region folds them into four rows, and the CASE arms read the fate grid straight from the probed census: EU 45 trips / 24 completed / 3 cancelled / 335.32, APAC 37 / 21 / 3 / 313.66, US 19 / 5 / 1 / 383.48, LATAM 2 / 2 / 0 / 426.22. The arms reconcile upward by construction — 24+12+6+3 equals EU's 45, and the four markets foot to the 103 requested trips — which is the identity the review opens with. The distractors fail honestly: 'shipped' or 'pending' in either status slot swaps the arm onto the wrong funnel stage and the census stops reconciling; 1 in the precision slot truncates the fare average to 335.3 so the deck drifts off the 338.19 platform mean; ASC flips the board to LATAM-first; AVG in any slot is an aggregate misused where a value belongs and the engine rejects it. The two-grain read is the follow-up: EU's 45 trips come from 8 riders (5.6 per rider) while the US pilot's 19 come from 2 (9.5) — load versus coverage, one query, two business claims.",
    },
    {
      id: "cs-cabify-2",
      tier: "medium",
      topic: "x3",
      universe: "month-close",
      title: "The charge-rail reconciliation stack",
      brief:
        "Cabify-flavored brief on the storefront db: month-close wants the two charge rails stacked in ONE layout with a TOTAL footing row — card legs (rider charges) and wire legs (corporate Cabify Business settlements) — biggest first, grand row anchoring the top. The layout must tie to the cash account's debit footing before billing sends a single reminder. Probed facts: the card rail runs 16 legs worth 37,364.00, the wire rail 11 legs worth 32,248.00, footing to 27 legs and 69,612.00 — exactly the cash account's 69,612.00 in debits — and the ledger trial balance reads 181,080 against 181,080, delta zero.",
      ask: "Return one stacked layout: each charge rail with leg count and charged dollars to 2 decimals, plus a TOTAL footing row, biggest charged value first.",
      template:
        "WITH legs AS (\n  SELECT method, amount_cents / {1} AS dollars\n  FROM payments\n)\nSELECT method AS rail,\n       COUNT(*) AS legs,\n       ROUND(SUM(dollars), 2) AS charged\nFROM legs\nGROUP BY method\nUNION ALL\nSELECT {2},\n       COUNT(*),\n       ROUND(SUM(dollars), 2)\nFROM legs\nORDER BY charged {3};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divider",
          noVerify: true,
          why: "The house rule for the INTEGER-cents tables: the dollar read is amount_cents / 100.0, never the bare 100 — the missing .0 is the classic odd-cent leak that reconciliation hunts. On this sandbox the legs happen to be whole-euro multiples, so the divider is about discipline, not output.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the footing-row label",
          why: "The grand row must announce itself: 'TOTAL' marks the 27-leg footing no reader can mistake for a rail. 'card' or 'wire' would print a second rail row and the reviewer cannot tell the footing from the 16-leg card line; any other literal just mislabels the tie-out to the cash account.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "Biggest charged value first: the TOTAL footing (27 legs, 69,612.00) anchors the top, then card 16/37,364.00, then wire 11/32,248.00. ASC buries the footing at the bottom and reads smallest-rail-first — the reviewer's eye lands on wire and misses the tie-out.",
        },
      ],
      distractors: ["'card'", "'wire'", "10", "ASC", "AVG"],
      walkthrough:
        "Two stages: fold the legs to dollars once, then stack the layout. The CTE divides every payment leg's INTEGER cents by 100.0 — the dollar read — and the main branch groups by method: card reads 16 legs / 37,364.00, wire 11 legs / 32,248.00. The UNION ALL branch appends the TOTAL footing over ALL legs — 27 / 69,612.00 — and that cell is the close's tie-out: the cash account carries exactly 69,612.00 in debits across its 27 entries, and the ledger trial balance lands at 181,080 against 181,080, delta zero. ORDER BY charged DESC keeps the footing on top with the rails beneath, biggest first — card ahead of wire, which is the corporate-vs-consumer headline: just under half the charged value rides the corporate settlement rail. The distractors fail honestly: 'card' or 'wire' in the label slot prints a duplicate rail row and the footing disappears into the rails; 10 scales the fold by ten and every cell breaks against the cash account; ASC flips the stack so the footing lands last; AVG in the divider turns the CTE into a one-row aggregate and the rails collapse into nonsense. UNION ALL, not UNION — the branches are distinct by construction, and the comment saying so is the correctness argument.",
    },
    {
      id: "cs-cabify-3",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The month-over-month fare pulse",
      brief:
        "Cabify-flavored brief on the storefront db: the growth review opens with the monthly fare pulse — each month's trips and fare, the prior month's fare beside it, and the percentage change — so the narrative writes itself from the table. Probed facts: the 14-month trip spine runs 2024-01 to 2025-02; the book opens at 3,731.97 over 8 trips, eases -3.3% into February (3,609.64), then the March fade lands -27.5% (2,617.08) and the June drop -29.7% (2,047.43) — the two moves the deck quotes. LAG carries the prior month; the first month's change is honestly NULL — no baseline exists. The read is chronological and the deck shows the opening run only.",
      ask: "Return the first six months with trips, fare, the prior month's fare and the month-over-month percentage change, chronological order.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         COUNT(*) AS trips,\n         ROUND(SUM(total), 2) AS fare\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       trips,\n       fare,\n       {1}(fare) OVER (ORDER BY month) AS prev_fare,\n       ROUND(100.0 * (fare - LAG(fare) OVER (ORDER BY month))\n             / LAG(fare) OVER (ORDER BY month), 1) AS mom_pct\nFROM monthly\nORDER BY month {2}\nLIMIT {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month reader",
          why: "LAG(fare) walks the window backwards one row — February's prev_fare is January's 3,731.97. LEAD would read forward and hand February March's 2,617.08, silently re-labeling the future as history; SUM would pile a running total into prev_fare and every percentage becomes fiction.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A month-over-month pulse is chronological: ASC keeps 2024-01 on top so each row compares against the row above it. DESC presents the newest month first with its baseline below — the numbers survive, the story does not, and the NULL baseline row hides at the bottom.",
        },
        {
          answer: "6",
          kind: "number",
          label: "the opening-run cut",
          why: "LIMIT 6 returns the first six months — the run the deck opens with, ending on June's 6-trip month and the -29.7% fade. The figure 6 is also June's trip count sitting in the output, and the fade is the row the narrative quotes.",
        },
      ],
      distractors: ["LEAD", "DESC", "3", "SUM"],
      walkthrough:
        "Staged windows over the fare spine. The CTE folds 103 trips into 14 monthly buckets via the SUBSTR month key — COUNT for volume, ROUND(SUM(total), 2) for the fare book — and the outer query reads each month with its neighbor: LAG(fare) OVER (ORDER BY month) brings January's 3,731.97 into February's row, and the percentage divides the delta by that same LAG — 100.0 × (3,609.64 − 3,731.97) / 3,731.97 = -3.3% for the February ease, then the -27.5% March fade and the -29.7% June drop the deck quotes. The first month is NULL by design: no prior row, no baseline, no invented zero — a zeroed baseline would fake a flat first step. The two-step matters: window output is not visible to WHERE or to sibling expressions in the same SELECT, so the CTE stages the grain and the outer SELECT layers the windows. The distractors each break differently: LEAD reads the future (February's prev would be March's 2,617.08); SUM piles a running total into prev_fare and every delta divides by a cumulative number; DESC tells the story backwards; LIMIT 3 amputates the June fade. Every chip changes what the review would conclude.",
    },
    {
      id: "cs-cabify-4",
      tier: "hard",
      topic: "q2",
      universe: "growth",
      title: "The above-the-mean watchlist",
      brief:
        "Cabify-flavored brief on the storefront db: the corporate pod keeps a rider watchlist — accounts whose trip frequency beats the platform mean earn a named account manager. The bar is computed, not guessed: the mean is trips per distinct rider across the whole book. Probed facts: 103 trips across 16 riders put the platform mean at 6.4375 trips per rider; the watchlist it produces is exactly four riders — Alice Chen (EU, 24 trips, 7,262.35), Emma Wilson (US, 17, 6,640.56), Grace Kim (APAC, 14, 4,574.23) and Maya Patel (APAC, 13, 3,644.56) — 63.5% of the fare book lives inside this list, and the boundary matters: a >= gate adds nobody today but silently changes the definition the day a rider lands exactly on the mean.",
      ask: "Return each rider above the platform-mean trip count with market, trip count and fare book to 2 decimals, busiest rider first.",
      template:
        "SELECT c.name AS rider,\n       c.region AS market,\n       COUNT(*) AS trips,\n       ROUND(SUM(o.total), {3}) AS fare_book\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY {1}\nHAVING COUNT(*) {2} (SELECT COUNT(*) * 1.0 / COUNT(DISTINCT customer_id) FROM orders)\nORDER BY trips DESC;",
      slots: [
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the rider fold key",
          why: "GROUP BY o.customer_id folds 103 trips back to 16 riders — the watchlist's grain. Folding by o.status instead groups by trip fate (52/30/14/7), and the 'watchlist' becomes two fate rows whose keys never join back to a person.",
        },
        {
          answer: ">",
          kind: "keyword",
          label: "the strict above-mean gate",
          why: "The bar is ABOVE the mean: no rider sits exactly on 6.4375 today, so > and >= agree — but >= is the wrong contract: the day a rider lands on the mean they would enter the list uninvited. < flips the query to the twelve riders below the bar — the opposite cohort.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the book precision",
          why: "Money reports to 2 decimals — 7,262.35 is the cell the account pod reads. ROUND(…, 1) prints 7,262.4 and the watchlist stops reconciling with the 63.5%-concentration figure quoted beside it on the same slide.",
        },
      ],
      distractors: ["o.status", "<", "c.region", "MAX"],
      walkthrough:
        "A fold, a computed bar, a strict comparison. GROUP BY o.customer_id folds the 103-trip book into 16 riders, and the HAVING clause judges each rider's COUNT(*) against a scalar subquery that computes the bar from the same table: COUNT(*) * 1.0 / COUNT(DISTINCT customer_id) = 103/16 = 6.4375. The 1.0 is doing real-arithmetic work — COUNT(*) / COUNT(DISTINCT customer_id) is integer division and would truncate the bar to 6, waving the 7-trip boundary riders through. Four riders clear the strict gate: Alice 24, Emma 17, Grace 14, Maya 13 — and the fare book beside each shows why the list matters: 22,121.70 of the 34,833.28 book rides in these four accounts. The distractors each break differently: o.status re-grains the fold to trip fates and the list stops being people; c.region re-grains it to markets — four rows whose 'fare books' are region totals, a different census wearing the same columns; < selects the below-mean twelve — the anti-watchlist; MAX where the comparison operator belongs is a syntax error the engine refuses. The interview follow-up this query trains: state the bar's population (all 103 trips, all 16 riders) and its strictness before you trust the list.",
    },
    {
      id: "cs-cabify-5",
      tier: "easy",
      topic: "j5",
      universe: "funnel",
      title: "The never-completed cohort",
      brief:
        "Cabify-flavored brief on the storefront db: the winback pod wants the never-completed cohort — riders whose trip history holds zero completed-and-charged rides. Requested is not completed: a rider can show pending, in-progress and even cancelled trips and still never have finished one. Probed facts: the anti-join from the 16-rider base against status 'delivered' trips returns exactly ONE rider — Liam O'Brien (EU), whose single trip sits in-progress with the pickup-dispatch stamp but no completed ride. The mirror cohorts prove the definition is doing real work: three riders (Bruno Silva, Chloe Dubois, Farid Nasser) have never been dispatched at all, and every rider has at least one requested trip, so the never-trip anti-join is a confident zero.",
      ask: "Return each rider with zero completed-and-charged trips: name, market and their completed-trip count, alphabetical by name.",
      template:
        "SELECT c.name AS rider,\n       c.region AS market,\n       COUNT(o.id) AS completed_trips\nFROM customers c\n{1} JOIN orders o\n  ON o.customer_id = c.id\n AND o.status = {2}\nGROUP BY c.id, c.name, c.region\nHAVING COUNT(o.id) = {3}\nORDER BY c.name;",
      slots: [
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the rider-keeping join",
          why: "LEFT JOIN keeps all 16 riders and hands the never-completed ones a NULL trip payload that COUNT(o.id) = 0 catches. INNER JOIN deletes exactly those rows — the cohort the winback pod exists to call would silently vanish, and the report would read as a clean book.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed literal",
          why: "Completed-and-charged rides carry status 'delivered' — 52 of 103. The literal must live in the ON clause: filtering status in WHERE after the LEFT JOIN would kill the NULL-payload rows and turn the anti-join back into an inner join. 'shipped' here finds the never-dispatched instead (3 riders) — a different cohort with a different owner.",
        },
        {
          answer: "0",
          kind: "number",
          label: "the never-completed gate",
          why: "COUNT(o.id) = 0 keeps the riders whose conditional match found nothing — exactly Liam O'Brien, with the integer 0 printed in his completed_trips cell. A gate of 1 swings the query to riders with exactly one completion (Jamal, Olivia) — a loyalty question, not a winback one.",
        },
      ],
      distractors: ["INNER", "'shipped'", "1", "CROSS"],
      walkthrough:
        "An anti-join with a conditional match — the shape behind every 'who never did X' read. The LEFT JOIN pairs each of the 16 riders with their 'delivered' trips only, and the status literal sits in the ON clause so unmatched riders survive with a NULL payload instead of being filtered away. GROUP BY c.id folds each rider's conditional matches, COUNT(o.id) counts them — 12 for Alice, 0 for the never-completed — and HAVING COUNT(o.id) = 0 keeps the empty side: exactly one rider, Liam O'Brien (EU), whose lone trip is still in-progress. The report is small and that is the point: the winback pod calls one person, and the query proves it. The distractors each break differently: INNER (or CROSS, which SQLite runs with inner semantics) deletes the NULL-payload rows and the cohort vanishes into an empty report; 'shipped' in the ON clause finds the never-dispatched trio instead — Bruno, Chloe, Farid — a real cohort, but the supply team's, not the winback pod's; 1 as the gate flips to exactly-one-completion riders. COUNT(o.id), not COUNT(*): the star would count the NULL payload row as 1 and every gate breaks.",
    },
    {
      id: "cs-cabify-6",
      tier: "medium",
      topic: "x1",
      universe: "catalog",
      title: "The market tier fold",
      brief:
        "Cabify-flavored brief on the storefront db: the catalog pod maps which service tiers each market's completed book actually touches — the tier count as a number, the fleet families folded into one readable cell — so the tier-expansion memo can name markets by what they ride, not by trip volume alone. Probed facts: over completed ('delivered') trips the tier fold reads EU 15 tiers across 6 families, APAC 15 tiers across all 7 families, US 10 tiers across 6, LATAM 4 tiers across 3 (Audio, Electronics, Accessories only — the flagship bucket rides a narrow card). The gate in the query keeps markets folding 10 or more tiers, which holds exactly three markets and leaves LATAM's 4-tier bucket off the expansion shortlist.",
      ask: "Return each market folding 10 or more distinct tiers on completed trips with its tier count and the folded family list, widest card first.",
      template:
        "SELECT c.region AS market,\n       COUNT(DISTINCT p.id) AS tiers,\n       {1}(DISTINCT p.category) AS families\nFROM order_items oi\nJOIN orders o ON o.id = oi.order_id\nJOIN products p ON p.id = oi.product_id\nJOIN customers c ON c.id = o.customer_id\nWHERE o.status = {2}\nGROUP BY c.region\nHAVING COUNT(DISTINCT p.id) >= {3}\nORDER BY tiers {4};",
      slots: [
        {
          answer: "GROUP_CONCAT",
          kind: "keyword",
          label: "the family folder",
          why: "GROUP_CONCAT(DISTINCT p.category) folds each market's families into one comma-joined cell — 'Electronics,Audio,Apparel,Wearables,Video,Accessories' for EU. MAX would print a single alphabetically-last family and the memo would claim a market rides one family; SUM over text collapses to a meaningless 0.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed-trip literal",
          why: "The expansion memo reads the COMPLETED card: status 'delivered' keeps the 52 charged trips. 'shipped' reads the in-progress book instead — different tier spreads — and pending or cancelled legs would fold families no rider ever paid for into the shortlist.",
        },
        {
          answer: "10",
          kind: "number",
          label: "the wide-card gate",
          why: "The gate is 10 or more distinct tiers: it keeps EU (15), APAC (15) and the US pilot (exactly 10 — the boundary row the HAVING exists to arbitrate) and drops LATAM's 4-tier flagship bucket. A gate of 4 floods the shortlist with LATAM; 15 narrows it to the two tied leaders and loses the boundary story.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the widest-card-first direction",
          why: "Widest card first: EU and APAC tie at 15 tiers, the US lands at 10. ASC would open the memo on the narrowest surviving market — a correct query aimed at the wrong end of the expansion board.",
        },
      ],
      distractors: ["MAX", "'shipped'", "4", "ASC"],
      walkthrough:
        "Three tables deep, one fold, two shapes of the same answer. The chain runs completed trips through their fare lines back to the service tier and the rider's market bucket; WHERE pins the census to status 'delivered' before any folding. GROUP BY region folds each market's line rows two ways: COUNT(DISTINCT p.id) counts distinct tiers — EU 15, APAC 15, US 10, LATAM 4 — and GROUP_CONCAT(DISTINCT p.category) folds the same rows into a readable family list, the DISTINCT inside the fold guaranteeing each family prints once no matter how many lines rode it. HAVING COUNT(DISTINCT p.id) >= 10 performs the business cut and the boundary row is the story: the US pilot lands exactly on 10 and survives; LATAM's 4-tier bucket rides only Audio, Electronics and Accessories and misses the shortlist. The distractors each break differently: MAX in the fold prints one family per market and the memo misnames every card; 'shipped' re-aims the census at the in-progress book; 4 as the gate re-admits the narrow flagship bucket the memo explicitly excludes; ASC inverts the board. The read: tier breadth tracks the two-grain census — the US pilot runs 9.5 trips per rider on 10 tiers, the deepest card per rider in the network.",
    },
  ],

  problems: [
    { slug: "queries-quality-and-percentage", why: "Quality-first positioning is a weighted-average query: partner rating weighted by trip volume, not a flat mean. This problem drills the SUM(product)/SUM(weight) shape the partner-quality scorecard uses." },
    { slug: "confirmation-rate", why: "Rider-driver confirmations with a COALESCE guard for riders who never matched — the no-show and acceptance telemetry Cabify's ETA promise is built on." },
    { slug: "trips-and-users", why: "The canonical ride-hailing screen: cancellation share by city with exclusion rules attached. Cabify city ops asks exactly this, and the exclusions are where denominators die." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Which rider books the most trips — the argmax that routes an account into the corporate pod's hands. Ties at the top make it a policy question, not just a LIMIT." },
    { slug: "product-price-at-a-given-date", why: "Fare-card pricing is time-versioned: what did the Executive tier cost as of the corporate contract's start date? As-of pricing reads are this exact shape." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Every rider has a favorite tier — Lite commuter versus Executive traveler. Per-rider argmax over tier bookings is the mix read the account pod mines for upsell." },
    { slug: "sellers-with-no-sales", why: "Fleet partners with zero trips are a supply-coverage hole: signed but never matched. The anti-join shape proves (or finds) the dead weight in the partner bench." },
    { slug: "find-churn-risk-customers", why: "Winback starts with riders whose trip cadence lapsed — a last-activity anti-join against the recency cutoff. This problem is the churn-risk query in practice form." },
    { slug: "duplicate-charge-pairs", why: "Two charge legs on one trip is a reconciliation incident. Self-join window pairing over the payments table is how the payments QA pass finds them before the close." },
    { slug: "rolling-7d-actives", why: "Weekly active riders, rolling distinct — one rider's ten trips count once. The stickiness discipline behind the rider-app growth story." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU is the app-engagement ratio Cabify's product pod watches — a two-window distinct count where the denominator question is the entire interview." },
    { slug: "average-selling-price", why: "Fare per trip per tier over a window: ASP with the date-range filter and tier weighting done right — the pricing-team's weekly read." },
    { slug: "top-travellers", why: "Rider spend leaders folded from fare lines — the concentration list that decides which corporate accounts get named managers. 63.5% of the book lives in the top of this list." },
    { slug: "second-highest-salary", why: "The second-priciest tier after Executive — argmax edge cases where LIMIT/OFFSET breaks on ties and the window answer is the honest one." },
    { slug: "fix-product-name-format", why: "Tier-name hygiene before any join: 'lite', 'Lite ' and 'LITE' silently split one service tier into three and the mix read fragments with it." },
    { slug: "null-blank-audit", why: "The trip feed's NULL audit: requests missing pickup stamps are the 14 awaiting rows, not garbage — COUNT(col) versus COUNT(*) is how the audit separates 'not yet' from 'broken'." },
    { slug: "ar-aging-schedule", why: "Corporate statements age in buckets — current, 30, 60, 90-plus. The dunning calendar the billing pod runs at every close is this problem's CASE-band shape over issued_on." },
    { slug: "repeat-purchase-rate", why: "Share of riders with 2-plus completed trips out of ALL who requested — the repeat-engine share whose denominator (requested versus dispatched) is the whole interview." },
    { slug: "cohort-repeat-revenue", why: "Repeat-buyer revenue, Cabify edition: fold trips per rider, gate at 2-plus, then sum the fare book the gate keeps — 33683.09 of 34833.28 in this shape." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Riders who took Executive and the sustainability bands but never Lite — the attach-rate audit behind every tier-expansion memo." },
    { slug: "the-most-recent-three-orders", why: "Per-rider latest-3 trips via ROW_NUMBER with a deterministic tie-break — the 'recent activity' rail the account pod opens with." },
    { slug: "monthly-transactions-i", why: "Corporate fare per month over a floor — the month-bucketed conditional fold that flags which Cabify Business account crossed the review line." },
    { slug: "find-loyal-customers", why: "Riders whose trip cadence never lapses — the loyalty cut that decides which accounts get named managers instead of winback calls." },
    { slug: "median-time-to-convert", why: "Median request-to-dispatch, not mean — the latency read that resists the one outlier pickup and answers the ETA-promise question honestly." },
    { slug: "sessionize-events", why: "Trip requests split into booking sessions by inactivity gaps — the sessionization pass behind 'how many riders open the app per booking'." },
    { slug: "week-over-week-churn", why: "Week-over-week lapsed-rider accounting per market — the churn identity city ops reads beside the fare spine every Monday." },
    { slug: "new-users-daily-count", why: "First-trip riders per day — the acquisition curve the launch pod overlays on promo waves, keyed on each rider's MIN(created_at)." },
    { slug: "group-sold-products-by-the-date", why: "GROUP_CONCAT folds each day's active tiers into one cell — the ops board's day-by-day tier strip, built with the exact aggregate this problem drills." },
    { slug: "game-play-analysis-v", why: "Day-1 repeat: share of riders whose FIRST trip is followed by another within a window — the instant-habit metric Cabify's onboarding pod watches." },
    { slug: "budget-pacing", why: "Promo spend pacing against plan, month to date — the cumulative fold with the pace column that decides whether the launch wave throttles." },
    { slug: "ads-funnel", why: "Impression-to-request funnel shares in one pass — the acquisition funnel whose every denominator (served, clicked, requested) is asked out loud." },
    { slug: "winback-recovery", why: "Lapsed riders who came back after a winback contact — the recovery cohort the never-completed anti-join feeds, measured as a before/after fold." },
  ],
};
