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
// tagged rows and none SQL-graded — so all 10 topic slug sets and all 16
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
    "Interview screens are denominator-first and market-shaped. A typical loop opens with a **two-grain market census** — EU runs 45 trips from just 8 riders (5.6 per rider) while the US pilot runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'does an awaiting trip count in your completion base?'*), then into the rider-value ladder where the 24/17/14/13/5 rungs end in a **three-way tie at 4** and rank semantics become a policy decision. Late rounds walk the {sky:14-month trip spine} (2024-01 to 2025-02, opening month 3,731.97, July trough 1,193.86) with LAG deltas, or the fleet-partner quality bench where only 2 of 6 partners clear the 4.5 rating floor. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Cabify section — fewer than 2 tagged rows, none SQL-graded — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: trip-fate conditional counts, two-grain censuses, CASE tier bands, tie-heavy rider ladders, pickup-latency date math and the cents-safe corporate billing spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:market trip-fate census} city ops opens every week with, the other rebuilds the {violet:charge-rail reconciliation stack} finance closes each month with. The bar to clear: *state the definition and the denominator before you compute anything* — then make every trip-fate census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:40 —** The day starts with the trip-fate refresh. A city-ops analyst opens the market board before standup: did overnight requests land, does the one-pass fate census reconcile — 52 completed + 30 in-progress + 14 awaiting + 7 cancelled = **103 by construction**? A market whose arms don't foot is *the day's first incident*, not a rounding note. The {rose:cancellation} share goes out by market — APAC 8.1% worst against EU 6.7%, US 5.3%, LATAM clean at 0 — and if pickup-dispatch latency drifts off the **2.98-day** norm on the sandbox clock, the supply queue gets pulled before the ETA review ships.",
    "**11:30 —** Midday is the quality-and-mix read. The account pod wants the rider-value ladder with the three-way tie at 4 trips handled honestly — shared rungs, named policy; the supply team wants the fleet-partner bench re-cut, only **2 of 6 partners** above the 4.5 rating floor; a market lead wants trips beside riders (EU 45-from-8 versus US 19-from-2) and the tier mix underneath — how much of the book rides **Executive** versus Lite. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the ops-review argument*.",
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
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain market censuses",
      why: "Trips and riders are different grains of the same join, and every census here reports both: EU runs 45 trips from 8 riders while the US pilot runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "students-and-examinations"],
    },
    {
      name: "Tier banding with CASE",
      why: "Lite, Easy, Executive and the sustainability bands are CASE-classified — with fixed edges the fare card publishes and a price ladder (14.99 to 199.99) that splits into budget and mid bands, 8 SKUs each. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the revenue forecast.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Rider-value ladders",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — the trip ladder runs 24, 17, 14, 13, 5 and then three riders sit tied at 4 trips on this db. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer riders, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Pickup-latency date math",
      why: "Request-to-dispatch pairs two timestamps of the same trip, and the pairing is a date-math problem: julianday deltas over stamped trips only, the population stated before the average. Window and recency questions (latest dispatch per market, two requests within seven days) live in the same toolkit.",
      slugs: ["average-time-of-process-per-machine", "the-latest-login-in-2020", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Joining riders to trips",
      why: "Riders carry city and market; trips inherit them through joins, and the join type decides who survives. A trip without a rider is corruption; a rider without trips is dormant demand — on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "customers-who-never-order", "employee-bonus"],
    },
    {
      name: "Corporate billing & cents discipline",
      why: "Riding is not collecting — Cabify Business statements settle on their own calendar, and the finance tables (28 invoices, 27 payment legs, INTEGER cents) are where the trip world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
    {
      name: "One-pass fate censuses",
      why: "The ops board gets completed, in-progress, awaiting and cancelled in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift apart.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month trip spine (2024-01 to 2025-02) is the city review's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and opening month (3,731.97) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "Nested folds & rider gates",
      why: "Screens escalate into staging: fold per-rider trip counts, then judge them against a computed platform mean (6.44 here — exactly four riders clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
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
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the three-way tie consumes ranks 6 through 8, so the next distinct count lands on 9. Both 3-trip riders share rank 9.",
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
  ],
};
