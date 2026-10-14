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
// slug sets and all 16 problems are theme-curated from the pools file's Theme menu (sql rows
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
    "Preparation strategy: the pools file carries no Yango section — zero tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: dispatch funnels, two-grain city censuses, tie-heavy rider ladders, service-class CASE bands and the cents-safe billing spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {amber:launch-opex census} the city-4 committee opens with, the other rebuilds the {emerald:driver-supply bench} the supply pod screens every fleet partner against. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain city censuses",
      why: "Rides and riders are different grains of the same join, and every launch-city review reports both: EU runs 45 rides from 8 riders while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is demand load and which is rider coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining riders to fare lines",
      why: "Riders carry city bucket and signup date; rides inherit them through joins, and fare lines live one join deeper in order_items. A ride without a rider is corruption, a rider without rides is whitespace — and joining the fare-line table without care fans every total out, 251 lines against 103 rides.",
      slugs: ["combine-two-tables", "product-sales-analysis-ii", "sales-analysis-i"],
    },
    {
      name: "Rider-frequency ladders",
      why: "The frequency leaderboard is rank-window reporting where ties are guaranteed — four riders sit at 4 rides each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about who gets the next promo wave, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Service-class CASE bands",
      why: "Economy, Business and Delivery classes are CASE-classified with fixed edges the rider app publishes, and launch budgets get cut along the same bands. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the class P&L, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Launch-calendar walks",
      why: "The 14-month ride spine (2024-01 to 2025-02) is the launch review's home turf: prior month beside current, delta rounded, trough (1,193.86 in July 2024) named out loud. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine"],
    },
    {
      name: "Launch-packet set algebra",
      why: "City-launch packets stack populations — completed rides under aborted, this launch wave beside last — and EXCEPT answers 'which riders requested but never got a dispatch'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order"],
    },
    {
      name: "Supply gates & nested folds",
      why: "Screens escalate into staging: fold per-rider ride counts or per-fleet fare books, then judge them against a computed bar — a scalar mean, a HAVING floor, a derived table. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets completed, on-trip, awaiting-match and aborted in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Corporate billing & cents discipline",
      why: "Completed is not collected — the billing tables (28 invoices, 27 payments, INTEGER cents) are where the ride world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
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
  ],
};
