// SIXT — Wave-10 (Task 100), mobility domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// Premium car-rental SQL: the storefront db read as a station-to-return fleet sandbox — customers are
// renters (region = pickup market), orders are rental contracts (delivered = returned-and-closed 52,
// shipped = out with the vehicle with shipped_at as the check-out stamp 30, pending = reserved-awaiting
// pickup 14, cancelled = no-show/cancelled 7), order_items = contract line records (quantity = rental
// days, unit_price = the per-day rate locked on the line), products = fleet SKUs (bookable car classes:
// category = the fleet family the class rolls up to, price = day rate, stock = pool units at the
// stations), suppliers = fleet/leasing partners, invoices = rental billing statements (damage, fuel and
// late-fee claims included), payments = payment rails (card = counter/app charge, wire = corporate
// billing), expenses = branch/station opex, ledger_entries = the GL. Finance tables store INTEGER
// cents — the dollar read is amount_cents / 100.0; orders.total and order_items.unit_price are REAL
// dollars already. Pool provenance: company-pools.md carries NO SIXT section — 0 tagged rows — so all
// 10 topic slug sets and all 16 problems are theme-curated from the pools file's theme menu (sql rows
// only; no write/schema/finance-band rows) and say so. Case briefs quote probed figures from
// scripts/company-facts.md (including the wave-8+9 canonical cells); every case slot is mechanically
// verified against db/custom.db by scripts/case-audit.ts. Accent text-orange-300: grepped across all
// 20 mobility siblings (uber..hertz) — no orange held anywhere in the domain, and it is on-brand SIXT.

import type { CompanyKit } from "../types";

export const sixtKit: CompanyKit = {
  id: "sixt",
  domainId: "mobility",
  name: "SIXT",
  tagline: "Premium car rental: fleet turnover, station P&L, the orange counter",
  accent: "text-orange-300",

  brief: [
    "**SIXT** is the premium car-rental network that turned the rental counter into a fleet-turnover machine — bookable car classes rotating across stations, rented by the day, billed back at the return lane with damage, fuel and late-fee claims on top. The whole business is utilization per unit: a class sitting unrented on the ready line is depreciation with a parking spot, so every number the company manages is a conditional count over rental contracts. This kit maps the storefront db onto that world: the 16 customers rows are renters (region = pickup market), the 103 orders are rental contracts worth **34,833.28**, and the 251 order_items rows are contract lines — quantity = rental days, unit_price = the per-day rate each line locked (498 rental days across the book). The 16 products are bookable car classes (price = day rate, stock = pool units), rolling up to seven fleet families, supplied by 6 fleet/leasing partners. The status map is fixed: delivered = {emerald:returned-and-closed} (52, 50.5%), shipped = {sky:on-rent} with shipped_at as the check-out stamp (30, 29.1%), pending = reserved-awaiting-pickup (14), cancelled = {rose:no-show} (7, 6.8%).",
    "The data org splits into fleet ops, revenue management (the day-rate and {amber:utilization} desk), a station-ops pod and a small claims-billing team, and they read the same contract spine at different grains. A contract books at created_at, and `shipped_at` is stamped the day the renter actually drives out — **82 of 103 contracts** carry the stamp, averaging **2.98 days** of booking-ahead with a 2–4 day spread, while the 14 reserved rows have none yet (a population definition, not a cleanup job). Money sits one layer down: claim-and-extras statements and settlement rails in INTEGER cents, where the dollar read is `amount_cents / 100.0`. Concentration is the third story: 63.5% of the book comes from renters whose lifetime spend crosses 3,000 (71.2% above 2,000) — in a premium fleet, one corporate account moves a station's month.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain station census** — EU runs 45 contracts from just 8 renters (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator question out loud (*'does a no-show count in your base?'*), then into the loyalty ladder where FOUR renters sit tied at 4 contracts and rank semantics become a decision about who gets the upgrade certificate. Late rounds walk the {sky:14-month contract spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL, or open the class-turnover bench where the hardest-worked class turns **47 rental days on a 260-unit pool** while the premium class turns 46 against 60 with 14 left. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no SIXT section — zero tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: check-out funnels, two-grain station censuses, tie-heavy loyalty ladders, day-rate CASE bands, pool-vs-days utilization boards and the cents-safe claims spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {orange:class-turnover census} fleet ops opens the quarter with, the other rebuilds the {violet:unsettled damage register} claims billing closes every month with. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the fleet feed and the check-out audit. A fleet-ops analyst opens the utilization dashboard before the stations staff up: did overnight reservations land, does any contract show a check-out stamp while status still reads pending, does the one-pass status census reconcile — 52 returned-and-closed + 30 on-rent + 14 reserved + 7 no-show = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If booking-ahead drifts off the **2.98-day** norm — APAC runs fastest at 2.93, LATAM slowest at 3.5 — the ready-line queue gets re-cut before revenue management's morning read ships, *because a car on the ready line is the only car earning nothing at all*.",
    "**11:30 —** Midday is the turnover read. Fleet ops wants the class-turnover bench re-cut — who clears the 30-rental-day gate against their pool, with the hardest-worked class at **47 days on 260 pool units** and the premium class down to 14 idle; revenue management wants the day-rate bands split — 8 mid classes averaging 111.50 against 8 value classes at 32.06, and nothing above the 199.99 rate ceiling; loyalty wants the One-ladder re-cut with the four renters tied at 4 contracts handled honestly — *shared rungs, named policy*. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the revenue-review argument*.",
    "**15:30 —** The afternoon tilts toward claims money. The settlement anti-join refreshes first — **6 never-settled statements worth 15,217** — before billing sends a single damage-and-fuels reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero settlement rows behind it (#28, 1,756.00). Station economics close the loop — Rent 16,800 of the 25,416 opex line, Ads 4,570 — before the branch P&L goes out. The day ends the way every close does: the GL trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Check-out rate", what: "Contracts with a check-out stamp ÷ ALL contracts booked: 82 of 103 (79.6%). The top-of-funnel number fleet ops reads every Monday — the 14 reserved rows are 'not yet', never a silent zero." },
    { name: "Booking-ahead window", what: "created_at to check-out (created_at → shipped_at) over checked-out contracts only: 2.98-day average, range 2–4. The population definition ships with the number — reserved contracts have no clock and must not dilute it." },
    { name: "Returned-and-closed share", what: "Delivered ÷ ALL contracts booked: 52 of 103 (50.5%), with 30 more on-rent (29.1%). 'Returned' is a status-filtered conditional count, and the denominator — reserved and no-show included — is the whole interview." },
    { name: "No-show share", what: "Cancelled ÷ booked: 7 of 103 (6.8%), sliced by pickup market — APAC 8.1%, EU 6.7%, US 5.3%. The number that prices the no-show fee and sizes the reminder cadence." },
    { name: "Contract book", what: "Total booked value: 34,833.28 across 103 contracts, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the fleet-tiering story — one 1,088.44 contract outweighs the smallest 42 combined." },
    { name: "Class turnover", what: "Rental days turned per class against its station pool: the hardest-worked class turns 47 days on a 260-unit pool, while the premium class turns 46 against 60 and has 14 left — the tightest rotation on the ledger and the replanning trigger." },
    { name: "Renter concentration", what: "Share of the book from renters spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The top renter runs 24 contracts and 7,262.35 — the corporate cohort that staffs the loyalty desk." },
    { name: "Claims collections", what: "Billed versus settled: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-settled worth 15,217. The claims anti-join the billing pod refreshes at every close before a damage-and-fuels reminder goes out." },
  ],

  topics: [
    {
      name: "Check-out-to-return lifecycle counts",
      why: "Every SIXT screen opens with the lifecycle: contracts booked, checked out (shipped_at stamped), returned-and-closed. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an on-rent contract 'returned' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "hopper-company-queries-ii"],
    },
    {
      name: "Two-grain station censuses",
      why: "Contracts and renters are different grains of the same join, and every market census here reports both: EU runs 45 contracts from 8 renters while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is station load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "article-views-ii", "number-of-rich-customers"],
    },
    {
      name: "Joining renters to contracts",
      why: "Renters carry region and created_at; contracts inherit them through joins, and the join type decides who survives. A contract without a renter is corruption; a renter without contracts is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "employees-with-missing-information", "customers-who-never-order"],
    },
    {
      name: "Fleet-class enrichment & the line fan-out",
      why: "Class-level reporting means attaching fleet family, day rate and pool size to every contract line — the products-to-order_items join where line quantity is rental days and unit_price is the locked per-day rate. SIXT's follow-up is always the fan-out: join lines in, and COUNT(*) silently stops counting contracts.",
      slugs: ["product-sales-analysis-ii", "product-sales-analysis-iii", "sales-analysis-i"],
    },
    {
      name: "Turnover leaderboards & tie policy",
      why: "Top-class-per-family, hardest-worked vehicle, One-tier renters — rotation reporting is leaderboard reporting. SIXT drills the rank trio because ties are guaranteed at station scale — four renters sit at 4 contracts each on this db — and the LIMIT-1-OFFSET-1 habit breaks on them.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Day-rate banding with CASE",
      why: "Fleet classes are CASE-banded — the rate card runs 14.99 shuttle to 199.99 flagship, split 8 mid classes averaging 111.50 against 8 value classes at 32.06 — with fixed edges the counter publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the revenue forecast, and a reordered WHEN quietly re-bands the fleet.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Pool-vs-days utilization bands",
      why: "Utilization reporting buckets classes by workload — rental days turned against pool units — and the bucket edges are a CASE or a range fold away. The premium class at 46 days on 60 pool units and the 500-unit pool turning just 38 live in different bands, and which band a class lands in decides next quarter's order.",
      slugs: ["calculate-orders-within-each-interval", "spend-histogram", "sales-by-day-of-the-week"],
    },
    {
      name: "Rotation month walks & LAG",
      why: "The 14-month contract spine (2024-01 to 2025-02) is the revenue-management call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and the pre-festive lull named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["biggest-window-between-events", "average-time-of-process-per-machine", "game-play-analysis-iii"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets returned, on-rent, reserved and no-show in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift while the counter is calling.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Claims & cents discipline",
      why: "Returned is not settled — the finance tables (28 statements, 27 settlement rows, INTEGER cents) are where the rental world meets money, damage and fuel fees included. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-i", "ar-aging-schedule"],
    },
  ],

  theory: [
    {
      id: "sixt-t1",
      q: "Your rotation report joins renters to contracts. When do you INNER and when do you LEFT — and what silently breaks if you filter a status in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins contracts to renters: a contract with no renter row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from renters: the renters with no contracts ARE the answer, arriving with NULL contract columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload renter row — the LEFT quietly became an INNER and the never-rented cohort vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-renting renters — all 16 renters appear in the contract table somewhere — and proving that zero is itself the analyst's job, because the same query on a staging table ships an empty cohort that looks like a victory. At station scale the wrong join type is not a style choice: it deletes exactly the rows the station plan was going to be written about.",
      tag: "joins",
    },
    {
      id: "sixt-t2",
      q: "Four renters tie at 4 contracts on the One loyalty ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder above the tie runs 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose loyalty account gets the upgrade certificate. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer renters (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment. Loyalty desks live on these rungs: the policy IS the benefit, and two renters with the same record must never read different rungs because the query guessed.",
      tag: "windows",
    },
    {
      id: "sixt-t3",
      q: "The census shows 103 contracts and 16 renters; EU shows 45 contracts and 8 renters. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts contract rows after the join — one row per contract, so a renter with 24 contracts contributes 24. COUNT(DISTINCT customer_id) folds those rows back to renters — EU's 45 contracts collapse to 8 renters. Neither is wrong: contracts measure station load and fleet demand, renters measure installed base and coverage. The ratio — 5.6 contracts per renter in EU versus 9.5 in the US on this db — is the intensity signal that decides where the ready line grows. The trap that catches candidates is a third grain: join order_items for contract lines and COUNT(*) silently counts lines, not contracts — 251 of them — and SUM(quantity) is a fourth grain, the 498 rental days the fleet actually turned. Saying 'one row per what?' for every COUNT is the habit the panel grades, because the utilization story changes with each grain and only one of them is the number the slide promised.",
      tag: "aggregation",
    },
    {
      id: "sixt-t4",
      q: "shipped_at is NULL until the renter drives out. What is your policy for the booking-ahead report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only checked-out contracts have a lead time, so the report measures booking-to-check-out for the 82 of 103 contracts that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL contracts returns the checked-out-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the checked-out subset; the gap between it and COUNT(*) is exactly the 14 reserved plus 7 no-show rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the lead time to zero to 'fix' the average — that invents same-day check-outs for reservations that have not started, and the ready line gets staffed off a fiction. A report whose WHERE clause is doing definitional work without saying so is exactly what a SIXT reviewer hunts for, because station staffing and the replenishment order both key off that number.",
      tag: "nulls",
    },
    {
      id: "sixt-t5",
      q: "The loyalty review wants renters carrying at least five contracts. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards on-rent, reserved and no-show rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The five-contract floor is a group-level fact — HAVING COUNT(*) >= 5 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a One-tier list and an error, and between a threshold applied to contracts versus to dollars. The strong answer places every filter by asking: is this a fact about one contract, or about a renter? On this db the floor keeps exactly five renters — 24, 17, 14, 13 and 5 contracts — and the four renters at 4 fall one rental short, which is precisely the retention conversation the loyalty desk wanted to have this month.",
      tag: "pipeline",
    },
    {
      id: "sixt-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 contracts always produce a mean (338.19 on this book). On filtered staging tables — one station, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides: cut the spine to a thin month and the whole report evaporates. The correlated cousin (compare each contract to ITS renter's own average) re-runs per outer row and answers a different question at a different cost — 'is this contract big for THIS renter' rather than for the fleet — which is the corporate-account question, not the fleet-mix one. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "sixt-t7",
      q: "The rotation trend buckets contracts by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's check-outs, and holiday-week returns land exactly there. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The calendar has a shape worth knowing too: the book opens at 3,731.97, troughs at 1,193.86 in July 2024, and both no-show-heavy months (2 each) sit in July and November — date discipline is how that story stays honest instead of becoming a rounding footnote.",
      tag: "dates",
    },
    {
      id: "sixt-t8",
      q: "Billing says a damage statement is 'paid' but the settlement rails have no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN settlement rows, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a settlement row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes; a partial (#25, 4,000 of 6,148) needs the coverage CASE, not a binary paid flag. The money rule: statements and settlements carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial / 6 never-collected, and the GL trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "sixt-mcq-1",
      prompt: "A contract row's status reads 'shipped'. In this kit's SIXT stage map, what happened?",
      choices: ["Returned-and-closed — the rental ended", "On-rent — checked out, not yet returned", "No-show — the booking lapsed", "Reserved — awaiting counter pickup"],
      answer: 1,
      why: "The stage map is fixed: shipped = on-rent with shipped_at as the check-out stamp (30 of 103 contracts, 29.1%). It is the only status where the car is actually earning its day rate.",
      notes: [
        { choice: 0, why: "Returned-and-closed is 'delivered' — 52 contracts. Calling on-rent rows returned inflates the closed share before a single car comes back." },
        { choice: 2, why: "No-show is 'cancelled' — 7 contracts. A no-show never had a check-out stamp; 'shipped' rows are literally on the road." },
      ],
      difficulty: "easy",
    },
    {
      id: "sixt-mcq-2",
      prompt: "Check-out rate is shipped_at IS NOT NULL ÷ which population? The db holds 82 checked out, 14 reserved and 7 no-show of 103 booked.",
      choices: ["Checked out + no-show only (82/89 = 92.1%)", "All contracts booked (82/103 = 79.6%)", "Returned contracts only (52/82)", "Distinct renters (82/16)"],
      answer: 1,
      why: "The house definition: checked out ÷ ALL contracts booked — reserved rows stay in the denominator because 'not yet checked out' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 reserved inflates the rate to 92.1% by deleting the population still in the booking window — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is return-and-close, shipped_at is check-out. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "sixt-mcq-3",
      prompt: "EU carries 45 contracts from 8 renters. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts contract rows (45); COUNT(DISTINCT customer_id) folds repeats back to renters (8). The gap between them — 5.6 contracts per renter — is the station-intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every contract has a renter. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not renters — a third grain nobody asked for. The census is contracts AND renters." },
      ],
      difficulty: "easy",
    },
    {
      id: "sixt-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to no-show contracts only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the no-show share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between APAC's 8.1 and a displayed 8 — or a 0.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.081 to 0 first, then scales — the no-show map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "sixt-mcq-5",
      prompt: "Keep only renters carrying at least 5 contracts. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 5, before GROUP BY", "GROUP BY renter HAVING COUNT(*) >= 5", "WHERE contracts >= 5 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A contract-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the floor keeps exactly five renters — 24, 17, 14, 13 and 5 contracts.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'contracts' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "sixt-mcq-6",
      prompt: "The One ladder runs 24, 17, 14, 13, 5 contracts, then FOUR renters tied at 4. Under RANK, what rank do the two 3-contract renters carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-contract renters share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The loyalty desk's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "sixt-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-lead rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The reserved contracts double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the checked-out-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 contracts.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "sixt-mcq-8",
      prompt: "order_items fans 103 contracts into 251 lines (498 rental days). On orders ⋈ order_items, which pair counts CONTRACTS?",
      choices: ["COUNT(*) and COUNT(DISTINCT order_id)", "COUNT(*) and SUM(quantity)", "COUNT(DISTINCT product_id) and COUNT(*)", "SUM(quantity) and COUNT(DISTINCT product_id)"],
      answer: 0,
      why: "After the fan-out, only COUNT(DISTINCT order_id) folds lines back to contracts — COUNT(*) counts 251 rows. SUM(quantity) counts rental days (498), a third grain entirely.",
      notes: [
        { choice: 1, why: "SUM(quantity) is the turnover number, not the contract count — the fan-out trap: after joining order_items, COUNT(*) stops counting contracts too." },
        { choice: 2, why: "COUNT(DISTINCT product_id) counts distinct car classes touched — class coverage, not contract volume. Both columns answer questions nobody asked." },
      ],
      difficulty: "hard",
    },
    {
      id: "sixt-mcq-9",
      prompt: "A staging-table no-show list uses renter_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every contract carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "sixt-mcq-10",
      prompt: "A damage-and-fuels statement row holds 175600 cents (the #28 statement, 1,756.00 dollars). Which expression prints its dollar value?",
      choices: ["amount_cents / 100", "ROUND(amount_cents / 100.0, 2)", "amount_cents * 100", "ROUND(amount_cents, 2)"],
      answer: 1,
      why: "Dividing by 100.0 promotes to real arithmetic: 1,756.00 dollars. The .0 is the whole fix — 175600 / 100 in integer math truncates, silently eating cents on every odd-cent statement in the claims book.",
      notes: [
        { choice: 0, why: "Integer ÷ integer in SQLite is integer division: 175600/100 = 1756. On whole-dollar amounts the leak hides; the first odd-cent statement exposes it. Promote before you divide." },
        { choice: 2, why: "Multiplying turns cents into 17,560,000 — units inverted. Sanity-check the magnitude: dollars are smaller than cents." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-sixt-1",
      tier: "easy",
      topic: "j7",
      universe: "inventory",
      title: "The class-turnover census",
      brief:
        "SIXT-flavored brief on the storefront db: fleet ops opens the turnover review with the hard-work bench — per car class, how many pool units sit at the stations, how many rental days it turned, how many distinct contracts touched it, and the day-rate revenue it produced — gated at 30 or more rental days. Probed facts: the 103-contract book is 34,833.28 folded from 251 lines (quantity = rental days, unit_price = the locked per-day rate) turning 498 rental days in total; the hardest-worked class turns 47 days on a 260-unit pool, the premium class turns 46 against 60 with just 14 left. Every class's day count, pool and revenue reconcile to the probed tables; the review reads biggest rental-day load first.",
      ask: "Return each class turning 30 or more rental days with its pool size, rental days, distinct contract count and day-rate revenue to 2 decimals, biggest rental-day load first.",
      template:
        "SELECT p.name AS vehicle_class,\n       p.category AS fleet_family,\n       p.stock AS pool_units,\n       {1}(oi.quantity) AS rental_days,\n       COUNT({2} oi.order_id) AS contracts,\n       ROUND(SUM(oi.quantity * oi.unit_price), {3}) AS day_rate_revenue\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.id\nHAVING SUM(oi.quantity) >= {4}\nORDER BY rental_days {5}, pool_units DESC;",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the rental-day fold",
          why: "SUM(oi.quantity) adds rental days per class — 47 at the hardest-worked. AVG would report the average line's days (a rate, not a load), and COUNT would report line counts: three different grains wearing one column name.",
        },
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the contract deduplicator",
          why: "COUNT(DISTINCT oi.order_id) folds repeat lines back to contracts: the day-count leader reads 24 contracts, not its line count. A contract touching two classes must count once per class — the census says touched, not lines.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the revenue precision",
          noVerify: true,
          why: "Revenue reports to 2 decimals so the class ledger reconciles with the 34,833.28 book revenue management quotes on the same slide. ROUND(…, 1) or 0 truncates the cents away and the fold stops footing to the probed cells.",
        },
        {
          answer: "30",
          kind: "number",
          label: "the hard-work gate",
          why: "The bench is classes turning 30 or more rental days — it keeps exactly ten classes, the three 30-day classes landing on the line by construction. A gate of 1 floods the bench with all 16 classes and the turnover read loses its edge.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the turnover-sort direction",
          why: "The review reads biggest rental-day load first: 47, 46, 38, 36, 36, 33, 31, 30, 30, 30. ASC would open the meeting on the 30-day tail, and the pool_units tiebreak only orders the dead heats, never the board.",
        },
      ],
      distractors: ["AVG", "COUNT", "SUM", "MIN", "ASC", "0"],
      walkthrough:
        "One join, one fold, three grains in five columns. The join attaches every contract line to its class — GROUP BY class folds the 251 lines into rows where SUM(oi.quantity) reads rental days, COUNT(DISTINCT oi.order_id) reads contracts touched, and ROUND(SUM(oi.quantity * oi.unit_price), 2) reads day-rate revenue; the HAVING gate at 30 days keeps the ten-class bench. The board reads: 47 days on the 260-unit pool over 24 contracts for 1,176.02; the premium-burning class at 46 days over 24 contracts for 6,888.25; then 38, 36, 36, 33, 31 and the three 30s — 357 of the book's 498 turned days sitting in ten classes. The utilization story is the pairing: the day-count leader books 1,176.02 while the 46-day class books 6,888.25 — where the fleet works is not where it earns. The distractors fail honestly: AVG in the day fold prints an average line (a rate, not a load); COUNT and MIN count or minimize instead of summing, re-ranking the bench on line grain; SUM in the COUNT slot is a nested aggregate that errors; ASC flips the board onto the 30-day tail; 0 as the gate floods the bench to all 16 classes and drops the 30-day line classes off the read.",
    },
    {
      id: "cs-sixt-2",
      tier: "medium",
      topic: "j4",
      universe: "refund-audit",
      title: "The unsettled damage register",
      brief:
        "SIXT-flavored brief on the storefront db: month-end claims close, and billing needs the register of statements carrying zero settlement legs before a single damage-and-fuels reminder goes out. Probed facts: the register is 6 statements worth 15,217.00 — the open cohort is 5 statements / 13,461.00 (4,937.00, 3,562.00, 2,794.00, 1,295.00, 873.00) and the sixth is #28, 1,756.00, booked 'paid' with zero settlement rows behind it: the status lie. Statements WITH legs stay out — the partial (#25, 4,000.00 of 6,148.00) and the void-but-settled #11 (925.00) both carry rows and belong on the anomaly list, not the register. The register reads biggest billed first.",
      ask: "Return every statement carrying zero settlement legs with its id, status, billed amount in dollars to 2 decimals and its settlement-leg count, biggest billed first.",
      template:
        "SELECT i.id AS statement_id,\n       i.status AS statement_status,\n       ROUND(i.amount_cents / {1}, 2) AS billed,\n       COUNT(p.id) AS settlement_legs\nFROM invoices i\n{2} JOIN payments p ON p.invoice_id = i.id\nGROUP BY i.id\nHAVING COUNT(p.id) = {3}\nORDER BY billed {4};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divider",
          noVerify: true,
          why: "Statements store INTEGER cents, so the dollar read is amount_cents / 100.0 — the .0 promotes real division before any truncation and keeps 4,937.00 printing with its cents. The register is a money report; the rule is non-negotiable.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the register-keeping join",
          why: "LEFT JOIN keeps every statement row even when no settlement leg matches — the zero-leg population IS the register. INNER JOIN deletes exactly those rows and hands billing an empty register while the dunning queue starves.",
        },
        {
          answer: "0",
          kind: "number",
          label: "the zero-leg gate",
          why: "COUNT(p.id) = 0 keeps the never-settled: six statements, every settlement_legs cell reading 0. A gate of 1 swings the register to the 22 statements that DID settle, and the dunning draft mails reminders to people who already paid.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-billed-first direction",
          why: "Billing works the register biggest-first: 4,937.00 down to 873.00. ASC would put the smallest exposure on top and the 4,937.00 open statement — the one worth a phone call today — at the bottom of the page.",
        },
      ],
      distractors: ["INNER", "CROSS", "1000", "10", "1", "ASC"],
      walkthrough:
        "One LEFT JOIN, one gate, the whole register. The LEFT JOIN pairs each statement with its settlement legs and keeps unmatched statement rows alive; GROUP BY statement folds the legs to a count; HAVING COUNT(p.id) = 0 keeps only the never-settled six — #24 at 4,937.00, #26 at 3,562.00, #27 at 2,794.00, #28 at 1,756.00, #21 at 1,295.00, #18 at 873.00 — footing to 15,217.00, the AR line billing quotes at every close. The register splits 5 open statements (13,461.00) against the one paid-status lie #28, which rides along at 1,756.00 because settlement rows, not statuses, are the ledger of record. Statements with legs correctly stay out: the partial #25 (4,000.00 of 6,148.00) and the void-but-settled #11 (925.00) each carry a leg and belong on the anomaly list instead. The distractors each break differently: INNER JOIN deletes the zero-leg rows and empties the register; CROSS JOIN cannot take the ON clause and errors; 1000 or 10 in the cents divider rescales every dollar read; 1 as the gate flips the register to the 22 settled statements; ASC re-aims the dunning queue at the smallest exposure first.",
    },
  ],

  problems: [
    { slug: "customer-placing-the-largest-number-of-orders", why: "The volume-argmax read: which renter holds the most contracts — the top of the One ladder at 24 on this db, decided on a grouped count with ties owned, not hidden." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Each renter's most-rented car class — the per-renter argmax that drives the upgrade certificate and next quarter's fleet-mix order." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one query with the 100.0-before-division fix — the honest-denominator drill behind every no-show and check-out share here." },
    { slug: "trips-and-users", why: "Cancellation rates by market with restricted accounts excluded — the no-show map's mobility-classic cousin, denominator exclusions stated out loud." },
    { slug: "average-selling-price", why: "Window-weighted pricing by period — the day-rate read where weighting by rental days versus by lines changes the answer, a favorite revenue-management follow-up." },
    { slug: "the-most-recent-three-orders", why: "Per-renter latest-3 via window — the 'recent contracts' rail at the counter: ROW_NUMBER with a PARTITION and a deterministic tie-break." },
    { slug: "keep-latest-dedupe", why: "Latest contract per renter with ties broken deterministically — check-out stamps collide, and the dedupe rule must be a named policy." },
    { slug: "duplicate-charge-pairs", why: "Duplicate damage-charge pairs via self-join window — the fraud screen claims billing runs before statements go out." },
    { slug: "null-blank-audit", why: "Contract hygiene: NULL check-out stamps and blank markets counted by column — the data-quality census before any utilization read is trusted." },
    { slug: "gl-reconciliation", why: "Ledger reconciliation with a delta column — the close reflex this kit's GL rewards: debits against credits, delta zero or the close does not ship." },
    { slug: "total-traveled-distance", why: "Conditional SUM over a flag — returned-versus-no-show day splits, the same CASE-SUM muscle as the status census." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Renters who took the SUV family and the EV family but never the premium class — conditional aggregation over fleet-mix behavior." },
    { slug: "list-the-products-ordered-in-a-period", why: "Classes rented in a window with day-floor gates — half-open date logic plus HAVING, the seasonal rotation query shape." },
    { slug: "find-stores-with-inventory-imbalance", why: "Pool imbalance across stations and partners — the fleet-distribution read that flags a class drowning in stock while its sibling starves." },
    { slug: "weeks-of-supply", why: "Pool cover: rental days turned against remaining pool units — the replenishment math that decides whether the premium class gets reordered or re-based." },
    { slug: "immediate-food-delivery-ii", why: "Contracts checked out within the promised booking window versus late ones — the promptness share is a conditional rate over a timestamp comparison." },
  ],
};
