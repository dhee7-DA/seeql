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
// 10 topic slug sets and all 32 problems are theme-curated from the pools file's theme menu (sql rows
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
    "Preparation strategy: the pools file carries no SIXT section — zero tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: check-out funnels, two-grain station censuses, tie-heavy loyalty ladders, day-rate CASE bands, pool-vs-days utilization boards and the cents-safe claims spine. This expanded kit is built for spaced practice rather than one sitting: run the **six case studies** on the live storefront db, then re-run each a week later from a blank editor — *the second pass is where recall actually forms*. They cover the asks the counter-adjacent desks rehearse most: the {orange:class-turnover census} fleet ops opens the quarter with, the {violet:unsettled damage register} claims billing closes every month with, the day-rate band census revenue management prices the fleet from, the rotation month spine behind the trend deck, the settlement registers stack the close packet ships on, and the {sky:One-ladder board} the loyalty desk mails certificates from. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "hopper-company-queries-ii", "bikes-last-time-used", "funnel-step-conversion", "confirmation-rate", "second-day-confirmation"],
    },
    {
      name: "Two-grain station censuses",
      why: "Contracts and renters are different grains of the same join, and every market census here reports both: EU runs 45 contracts from 8 renters while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is station load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "article-views-ii", "number-of-rich-customers", "daily-leads-and-partners", "classes-more-than-5-students", "queries-quality-and-percentage", "average-selling-price", "list-the-products-ordered-in-a-period", "find-stores-with-inventory-imbalance", "immediate-food-delivery-ii"],
    },
    {
      name: "Joining renters to contracts",
      why: "Renters carry region and created_at; contracts inherit them through joins, and the join type decides who survives. A contract without a renter is corruption; a renter without contracts is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "employees-with-missing-information", "customers-who-never-order", "count-student-number-in-departments", "customer-who-visited-but-did-not-transact", "dormant-reactivation", "keep-latest-dedupe", "null-blank-audit", "customers-who-bought-a-and-b-not-c"],
    },
    {
      name: "Fleet-class enrichment & the line fan-out",
      why: "Class-level reporting means attaching fleet family, day rate and pool size to every contract line — the products-to-order_items join where line quantity is rental days and unit_price is the locked per-day rate. SIXT's follow-up is always the fan-out: join lines in, and COUNT(*) silently stops counting contracts.",
      slugs: ["product-sales-analysis-ii", "product-sales-analysis-iii", "sales-analysis-i", "trips-and-users", "total-traveled-distance"],
    },
    {
      name: "Turnover leaderboards & tie policy",
      why: "Top-class-per-family, hardest-worked vehicle, One-tier renters — rotation reporting is leaderboard reporting. SIXT drills the rank trio because ties are guaranteed at station scale — four renters sit at 4 contracts each on this db — and the LIMIT-1-OFFSET-1 habit breaks on them.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "find-top-performing-driver", "compute-the-rank-as-a-percentage", "customer-placing-the-largest-number-of-orders", "most-frequently-ordered-product-per-customer", "the-most-recent-three-orders"],
    },
    {
      name: "Day-rate banding with CASE",
      why: "Fleet classes are CASE-banded — the rate card runs 14.99 shuttle to 199.99 flagship, split 8 mid classes averaging 111.50 against 8 value classes at 32.06 — with fixed edges the counter publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the revenue forecast, and a reordered WHEN quietly re-bands the fleet.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories", "calculate-parking-fees-and-duration"],
    },
    {
      name: "Pool-vs-days utilization bands",
      why: "Utilization reporting buckets classes by workload — rental days turned against pool units — and the bucket edges are a CASE or a range fold away. The premium class at 46 days on 60 pool units and the 500-unit pool turning just 38 live in different bands, and which band a class lands in decides next quarter's order.",
      slugs: ["calculate-orders-within-each-interval", "spend-histogram", "sales-by-day-of-the-week", "credit-utilization-bands"],
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
      slugs: ["bank-account-summary-ii", "monthly-transactions-i", "ar-aging-schedule", "delinquency-buckets", "monthly-transactions-ii", "deferred-revenue", "gl-reconciliation", "weeks-of-supply", "duplicate-charge-pairs"],
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
    {
      id: "sixt-t9",
      q: "The close packet stacks the settled register (21 statements) over the never-settled register (6) plus one grand-total row. UNION or UNION ALL — and when does the choice become a correctness question?",
      a: "UNION ALL appends every row from both SELECTs, so the packet's identity — 21 settled + 6 never-settled = 27 statements — reconciles by construction. UNION dedups whole rows silently, which sounds harmless until a bug puts one statement into both registers and the dedup hides it: the packet still foots to 27 while a claim has vanished from one layer. The discipline at SIXT is to stack registers with UNION ALL and let the reconciliation identity catch duplicates loudly, because silent dedup is silent data loss in a claims close. The stacked SELECTs must still project the same column shape and order — UNION ALL forgives a swapped column no more than UNION does.",
      tag: "sets",
    },
    {
      id: "sixt-t10",
      q: "Markets that booked contracts this quarter but settled no damage statements — how does EXCEPT express that diff, and what must both sides share?",
      a: "EXCEPT keeps rows from the left SELECT that never appear in the right: booked-markets MINUS settled-markets. Both sides must project the same column count with compatible types, or the engine errors before the diff runs — and both sides dedup, so a duplicated market row disappears before the comparison. On this db the booked side holds four markets (EU 45 contracts, APAC 37, US 19, LATAM 2) and every one of them has settlement traffic, so the diff returns empty — an empty diff is a finding, not a failure: it proves every active market moves money. INTERSECT answers the mirror question (markets present in both), and when duplicates matter the raw UNION ALL stack stays the audit-friendly form precisely because it refuses to dedup.",
      tag: "sets",
    },
    {
      id: "sixt-t11",
      q: "The counter's 'recent contracts' rail keeps the newest contract per renter. Why ROW_NUMBER and not RANK — and what makes the tie-break a policy?",
      a: "ROW_NUMBER assigns 1, 2, 3… inside each PARTITION BY customer_id regardless of ties, so rn = 1 is exactly one contract per renter — the rail's contract. RANK hands tied shipped_at values the same rank and returns several rank-1 rows, duplicating the rail; COUNT(*) OVER (PARTITION BY …) answers a different question entirely (how many contracts the renter has). The tie-break — ORDER BY shipped_at DESC, then id DESC — must be named and deterministic, because two contracts stamped the same day must resolve identically on every run, not by rowid luck. That policy belongs in the query comment: the renter who sees the wrong contract in the rail does not care which tie the engine happened to win.",
      tag: "windows",
    },
    {
      id: "sixt-t12",
      q: "Each month's share of the 34,833.28 contract book, with every month row kept — how does the window grand total do that in one pass?",
      a: "SUM(booked) OVER () computes the grand total across the whole partition without collapsing rows, so each month divides its own value by 34,833.28 and stays a row. The bare SUM(booked) requires GROUP BY and collapses to one row per group — month and share cannot coexist without a window, a CTE cross join, or a hardcoded literal that silently lies the day February posts. Frame semantics are the trap: OVER (ORDER BY month) turns the sum into a running total (RANGE between unbounded preceding and current row) — the cumulative spine, not the grand total. Saying which of the two you want out loud is the interview's whole point, because both are one keyword apart and only one reconciles to the book.",
      tag: "windows",
    },
    {
      id: "sixt-t13",
      q: "LAG drives the rotation month walk. What is the first row of the LAG, and when do you reach for LEAD instead?",
      a: "LAG(booked) OVER (ORDER BY month) pairs each month with its predecessor; the first row has no predecessor and returns NULL — the baseline, reported as NULL or labelled 'baseline', never coalesced to zero, which would read as a flat month. LEAD reads the other direction and is the natural shape for fill-forward views like next month's planned pool. Movement columns are current minus prior, rounded at the display edge; on this spine the deepest drop is -1,326.87 into November 2024 and the sharpest jump +1,158.21 into August. A NULL first movement is information — the alternative is inventing a January delta against a month that does not exist.",
      tag: "windows",
    },
    {
      id: "sixt-t14",
      q: "Booking-ahead is measured created_at → shipped_at on TEXT stamps. Why julianday, and what does the 2–4 day range say that the 2.98 mean hides?",
      a: "julianday converts each TEXT stamp to a fractional day number so subtraction is honest arithmetic; plain TEXT minus TEXT coerces both sides to the same leading integer and returns zero for every row. The 2.98-day mean over the 82 stamped contracts is the headline, but the 2–4 range is the operational read — nobody books same-day and nobody waits five days, so the ready line is planned against a tight window. AVG silently skips the 21 NULL-stamp rows, which is why the population statement (checked-out contracts only) ships with the number. Mixing the 14 reserved rows in does not error; it quietly redefines the metric — and the ready line gets staffed off the wrong population.",
      tag: "dates",
    },
    {
      id: "sixt-t15",
      q: "The staffing curve buckets check-outs by weekday. What does SQLite's %w hand you, and how does the mix read on this book?",
      a: "STRFTIME('%w', created_at) returns 0 = Sunday through 6 = Saturday as TEXT — Sunday is '0', not '7', and '%d' is day-of-month, not weekday. On this book Monday opens at 20 check-outs with Sunday at 16, while Thursday (9) and Saturday (8) run light — the counter-staffing curve follows that shape. The buckets arrive as strings, so ORDER BY d sorts '0' through '6' — which happens to be weekday order for %w, a coincidence worth a comment because it breaks the moment the format changes. Weekend-versus-weekday splits are one CASE away from this bucket, and both no-show-heavy months sitting in July and November is a calendar check, not an assumption.",
      tag: "dates",
    },
    {
      id: "sixt-t16",
      q: "CASE WHEN evaluates arms in order. How do you keep the day-rate bands exhaustive — and what does a reordered arm do to the fleet?",
      a: "First matching WHEN wins, so arms are written narrowest-first with every gap closed by an explicit ELSE. The rate card splits at the 55 line — 8 mid classes averaging 111.50 against 8 value classes at 32.06 — and a class priced exactly 55.00 must band mid, which the >= 55 arm guarantees only while it precedes any value arm. A hole in the arms sends classes to ELSE (or NULL) and the revenue forecast silently loses a band; a reordered WHEN quietly re-bands the fleet without erroring. Band edges are published constants: state them in the query comment and make the ELSE arm unreachable in tests — the forecast is only as honest as the arm order.",
      tag: "casing",
    },
    {
      id: "sixt-t17",
      q: "SUM(CASE WHEN …) versus FILTER (WHERE …): which is portable, and when does each win?",
      a: "SUM(CASE WHEN condition THEN 1 ELSE 0 END) is the portable census — every engine from the warehouse to the counter terminal reads it, and the ELSE 0 keeps the fold total-safe. FILTER (WHERE …) branches each aggregate over its own population, keeps the scan one-pass and the output one row — 52 returned / 30 on-rent / 14 reserved / 7 no-show reconciling to 103 by construction — but it is the newer, less universal syntax. At 103 contracts either works; the discipline is choosing one per report and saying why, because four sequential queries are four chances to drift while the counter is calling. The CASE twin also bands values (rate tiers, day-count gates), which FILTER cannot do on its own — that is when the portability argument settles it.",
      tag: "casing",
    },
    {
      id: "sixt-t18",
      q: "The class feed ships names in mixed case with stray padding. What is the canonicalization sequence before any join, and what breaks without it?",
      a: "TRIM clears the padding, UPPER (or LOWER) collapses the case drift, and the result — not the raw name — becomes the join key: ' noise-canceling headset ' and 'Noise-Canceling Headset' must land on one canonical string. REPLACE handles embedded defects (double spaces, legacy separators) when TRIM cannot reach them. The sequence lives in a CTE once and every downstream join reuses it, because two teams canonicalizing differently re-split the fleet into phantom classes and the class-turnover bench double-counts. String keys are the cheapest place a report lies: the join returns zero rows and reads as an empty cohort instead of a case mismatch — the analyst who checks the canonical form first finds it in one query.",
      tag: "strings",
    },
    {
      id: "sixt-t19",
      q: "When is IN the right existence test, and when does EXISTS beat it?",
      a: "IN materializes the subquery's list and compares every outer row against it — fine when the column is NOT NULL-guarded and the list is small, like product ids in a contract-line existence check. EXISTS short-circuits on the first match and is three-valued-logic safe: it never silently empties the way NOT IN does when one stray NULL enters the list. The semi-join shape (EXISTS with the correlation in WHERE) also reads as intent — 'renters with at least one delivered contract' — without needing DISTINCT, and the engine can stop at the first hit. The interview rule: existence tests are EXISTS by default; IN is a deliberate choice you can defend with the column's nullability.",
      tag: "subqueries",
    },
    {
      id: "sixt-t20",
      q: "A correlated subquery compares each contract to its renter's own average. What does it answer that the fleet-average query cannot — and what does it cost?",
      a: "WHERE total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) answers 'is this contract big for THIS renter' — the corporate-account read, where a 900.00 contract is routine for the renter carrying 24 contracts and an outlier for a two-rental account. The fleet-average version (338.19) mixes every population into one threshold and answers a different question. Cost: the inner fold re-runs per outer row — trivial at 103 contracts, a real conversation at warehouse scale, where the same shape becomes a window over PARTITION BY customer_id. The strong answer names the population for each comparison and knows which question the slide promised.",
      tag: "subqueries",
    },
    {
      id: "sixt-t21",
      q: "Claims wants near-duplicate damage statements paired: same renter, same cents. How does the self-join avoid pairing a row with itself and avoid double-counting?",
      a: "Join invoices to themselves on the business key (customer_id, amount_cents) and add i1.id < i2.id: the strict inequality kills the self-pair and admits each unordered pair exactly once. i1.id <> i2.id admits both (a,b) and (b,a) — the fraud list doubles and the reminder fires twice; i1.id = i2.id pairs every row with itself; no id predicate at all pairs everything with everything. Because the pairing is symmetric by construction, one direction IS the dedupe policy, and it belongs in the query comment. This is the screen claims runs before reminders go out — the same shape later powers 'renters who rented the same class twice' follow-ups.",
      tag: "joins",
    },
    {
      id: "sixt-t22",
      q: "When is CROSS JOIN the honest choice rather than a mistake — and what is the classic accident it prevents or causes?",
      a: "CROSS JOIN is the deliberate Cartesian product: 16 bookable classes against 6 fleet partners is 96 scenario rows, and writing CROSS JOIN says the fan-out is intended, not accidental. Its legitimate job is making every partner×class cell exist so later LEFT JOINs can prove which cells are empty — the rate-grid model needs the zeros to be rows. The classic accident is the implicit cross (comma join with the ON condition drifted into WHERE) that explodes a quick count into millions of rows; the classic repair is turning the cross into an inner equi-join by moving a predicate into ON. At fleet scale the difference between 96 intended rows and an unintended product is the difference between a grid and an outage.",
      tag: "joins",
    },
    {
      id: "sixt-t23",
      q: "The coverage CASE splits statements into exact, partial and none. What makes the classification trustworthy when a status column also claims 'paid'?",
      a: "The CASE keys off settlement legs and cents, never the status column: legs = 0 is none (paid pinned at 0.00 via COALESCE), paid = billed is exact, else partial — 21 / 1 / 6 on this book. The status lie (#28 marked paid with zero legs) rides in the none bucket because payment rows are the ledger of record and statuses are claims; the void-but-settled #11 rides in exact the same way, from the mirror side. The identities that ship with the grid: 28 statements, 86,977.00 billed, buckets footing to both. Every anomaly gets a row on the exception list, never a silent correction — the close ships on reconciliation, not vibes.",
      tag: "quality",
    },
    {
      id: "sixt-t24",
      q: "The loyalty ladder groups 103 contracts by renter. What would you index — and what does EXPLAIN QUERY PLAN tell you at this scale?",
      a: "A composite index on (customer_id, created_at) lets GROUP BY customer_id walk pre-sorted groups and lets the per-renter latest-contract rail skip its sort entirely. At 103 rows the planner will likely table-scan anyway, and that is correct — reading 103 rows is cheaper than maintaining an index; the interview answer is knowing the crossover, not worshiping indexes. EXPLAIN QUERY PLAN is how you check: 'SCAN orders' versus 'SEARCH orders USING INDEX' names the strategy in one line. The habit matters when the same query shape moves to the warehouse — the index that made the ladder instant is the one whose write-cost nobody budgeted on a table the counter updates all day.",
      tag: "indexes",
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
    {
      id: "sixt-mcq-11",
      prompt: "A whitespace report LEFT JOINs renters to contracts, then adds WHERE o.status = 'delivered' 'to keep the read clean'. What does the reviewer say?",
      choices: ["The never-rented cohort survives with NULL contract columns", "The WHERE kills the NULL-payload rows — the LEFT quietly became an INNER and the cohort vanished while the query still runs", "The query errors on comparing NULL status", "The cohort appears with zero-value totals"],
      answer: 1,
      why: "A WHERE predicate on the right table's columns discards every unmatched left row — NULL status is not 'delivered' — so the LEFT silently degrades to an INNER. The fix is moving the predicate into the ON clause or an outer query. The join type is a business decision about who survives; a stray WHERE is how it gets made for you.",
      notes: [
        { choice: 0, why: "That is the promise of the LEFT JOIN — but the WHERE breaks it before delivery. The cohort's survival is exactly what the reviewer is checking." },
        { choice: 2, why: "No error anywhere: NULL = 'delivered' evaluates to UNKNOWN, which is just filtered. Silent deletion is the failure mode, not a crash." },
      ],
      difficulty: "easy",
    },
    {
      id: "sixt-mcq-12",
      prompt: "Prove no renter is dormant: every renter appears in the contract table. Which query shape returns the never-rented cohort — empty on this db, and the emptiness is the proof?",
      choices: ["LEFT JOIN orders o ON o.customer_id = r.id WHERE o.id IS NULL", "WHERE r.id NOT IN (SELECT customer_id FROM orders)", "INNER JOIN orders o ON o.customer_id = r.id HAVING COUNT(o.id) = 0", "CROSS JOIN orders o ON r.id IS NULL"],
      answer: 0,
      why: "The LEFT JOIN + IS NULL anti-join keeps every renter and marks the matched ones for deletion — the survivors are exactly the never-rented, and on this db that is a confident zero. Proving the zero is part of the job: the same shape on a staging table is what catches silent corruption.",
      notes: [
        { choice: 1, why: "NOT IN works on the clean core db, but one stray NULL customer_id makes every comparison UNKNOWN and the report silently empties — the zero you ship is then a bug wearing the proof's clothes." },
        { choice: 2, why: "An INNER JOIN can only return renters WITH contracts — the missing rows are deleted before any aggregate sees them. The shape cannot answer its own question." },
      ],
      difficulty: "easy",
    },
    {
      id: "sixt-mcq-13",
      prompt: "Attach fleet family and pool size to every contract line. Which join, and what does COUNT(*) read after it?",
      choices: ["JOIN products p ON p.id = oi.product_id — and COUNT(*) now reads lines (251), not contracts", "JOIN products p ON p.id = oi.product_id — COUNT(*) still reads contracts (103)", "JOIN customers c ON c.id = o.customer_id — COUNT(*) reads classes (16)", "No join needed — the class family is already on the line"],
      answer: 0,
      why: "The products-to-order_items join is the enrichment: category is the fleet family, stock the pool units, price the day rate. But joining the line grain in makes COUNT(*) count 251 lines — the fan-out. Contracts need COUNT(DISTINCT order_id) after the join.",
      notes: [
        { choice: 1, why: "Joining a child table always fans the count out — 103 contracts become 251 lines the moment order_items is joined. COUNT(*) never stays put across a fan-out." },
        { choice: 3, why: "The line carries only product_id, quantity and unit_price — family and pool live on the products row. The enrichment join is the whole point of the query." },
      ],
      difficulty: "easy",
    },
    {
      id: "sixt-mcq-14",
      prompt: "The rotation trend buckets contracts with STRFTIME('%m', created_at). What does the reviewer catch immediately?",
      choices: ["Nothing — zero-padded months sort correctly", "January 2024 and January 2025 merge into one bucket — the 14-month spine collapses to 12 and the trend becomes fiction", "The buckets arrive as numbers and sort out of order", "Contracts without dates produce NULL buckets and error the GROUP BY"],
      answer: 1,
      why: "'%m' alone drops the year: 2024-01 and 2025-01 both bucket as '01'. The spine must be STRFTIME('%Y-%m', created_at) — 14 honest buckets from 2024-01 to 2025-02. The trend is only as good as its bucket key.",
      notes: [
        { choice: 0, why: "Sorting was never the issue — merging is. A 12-bucket trend quietly averages two Januaries and the July trough moves." },
        { choice: 2, why: "STRFTIME returns TEXT, and '%m' TEXT sorts fine. The defect is information loss, not ordering." },
      ],
      difficulty: "easy",
    },
    {
      id: "sixt-mcq-15",
      prompt: "The ops board wants returned / on-rent / reserved / no-show counts in ONE scan that reconciles to 103. Which form is the portable twin every engine — warehouse to counter terminal — reads?",
      choices: ["FILTER (WHERE status = 'delivered') branching each aggregate", "SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) per branch", "Four sequential COUNT queries pasted side by side", "COUNT(status) with GROUP BY status in a subquery"],
      answer: 1,
      why: "SUM(CASE …) is the portable one-pass census — the ELSE 0 keeps it total-safe and every engine reads it. FILTER (WHERE …) is the newer, less universal twin that branches each aggregate over its own population; four sequential queries are four chances to drift while the counter is calling.",
      notes: [
        { choice: 0, why: "FILTER is genuinely one-pass and keeps the output one row — it is the discipline pick on SQLite. The catch is portability: it is the newer syntax, and the question asked for the engine-proof twin." },
        { choice: 2, why: "Four separate queries reconcile to 103 only if you check by hand afterward — each is a chance for a drifted filter. One scan, one reconciliation." },
      ],
      difficulty: "easy",
    },
    {
      id: "sixt-mcq-16",
      prompt: "The close packet stacks the 21 settled statements over the 6 never-settled plus one grand-total row. Why UNION ALL and not UNION?",
      choices: ["UNION ALL is faster on 28 rows", "The packet's identity — 21 + 6 = 27, plus the total — reconciles by construction; UNION's silent dedup could hide a statement that leaked into both registers", "UNION cannot stack three SELECTs", "UNION ALL sorts the registers before stacking"],
      answer: 1,
      why: "UNION ALL appends every row, so duplicates surface loudly in the reconciliation instead of vanishing. UNION dedups whole rows silently — in a claims close, silent dedup is silent data loss. Same column shape and order on both sides is still mandatory either way.",
      notes: [
        { choice: 0, why: "Speed is real but not the point — the discipline is auditability. A dedup that hides a cross-register duplicate defeats the packet's whole identity check." },
        { choice: 2, why: "UNION stacks any number of SELECTs. The restriction that matters is column shape, not count." },
      ],
      difficulty: "easy",
    },
    {
      id: "sixt-mcq-17",
      prompt: "The counter-staffing curve buckets check-outs by STRFTIME('%w', created_at) and orders by that bucket. Which weekday's row lands first?",
      choices: ["Monday — it is the biggest day at 20 check-outs", "Sunday — %w returns 0 for Sunday as TEXT, so '0' sorts first", "Saturday — '6' is the smallest digit", "The query errors — %w returns numbers and TEXT ordering fails"],
      answer: 1,
      why: "%w is 0 = Sunday through 6 = Saturday, returned as TEXT — so ORDER BY d walks '0' through '6', which happens to be weekday order. Volume never enters it: Monday's 20 check-outs sit second. The Sunday-'0' convention is worth a comment because it breaks the moment the format string changes.",
      notes: [
        { choice: 0, why: "Confusing sort order with volume — the classic. Monday is the busiest day but '1' sorts after '0'. The curve reads Sunday-first regardless." },
        { choice: 2, why: "Saturday is '6' — the LAST bucket, not the first. Reading the digit as a sort key backwards flips the whole curve." },
      ],
      difficulty: "easy",
    },
    {
      id: "sixt-mcq-18",
      prompt: "The rate card bands classes at the 55 line: WHEN price >= 55 THEN 'mid' ELSE 'value'. A class prices exactly 55.00. Where does it land — and what decided it?",
      choices: ["Value — ELSE catches anything not matched", "Mid — the >= 55 arm matches first; the arm order is the published policy", "NULL — CASE never matches on equality", "It errors — two arms claim the row"],
      answer: 1,
      why: "CASE evaluates arms in order and first match wins: 55.00 satisfies >= 55, so it bands mid. The edges are published constants — the 8 mid classes average 111.50 against 8 value classes at 32.06 — and a hole or a reordered WHEN silently re-bands the fleet without erroring.",
      notes: [
        { choice: 0, why: "ELSE is the fallback, not the boundary — 55.00 matched the >= arm before ELSE was ever consulted." },
        { choice: 2, why: "CASE returns NULL only when no arm matches and no ELSE exists. Here the >= arm matches explicitly — the boundary is mid by construction." },
      ],
      difficulty: "medium",
    },
    {
      id: "sixt-mcq-19",
      prompt: "The Q1 cut reads WHERE created_at BETWEEN '2024-01-01' AND '2024-03-31' on TEXT datetime stamps. What does the reviewer flag?",
      choices: ["Nothing — BETWEEN is inclusive and the bounds are right", "The format needs T separators for TEXT comparison", "The last night's check-outs — '2024-03-31 18:42:00' sorts after '2024-03-31' — fall outside; the honest cut is >= '2024-01-01' AND < '2024-04-01'", "BETWEEN errors on TEXT columns; use DATE()"],
      answer: 2,
      why: "created_at carries a time component, so '2024-03-31 18:42:00' > '2024-03-31' as strings — the BETWEEN silently drops the quarter's final evening. Half-open intervals [start, next-start) never lose the boundary night. Holiday-week returns land exactly there, which is why it is a correctness call, not a style one.",
      notes: [
        { choice: 0, why: "Inclusive BETWEEN is true — inclusive of '2024-03-31' the DATE, exclusive of everything stamped on that date WITH a time. The loss is invisible until you count the last night." },
        { choice: 3, why: "TEXT datetimes compare lexicographically just fine — that is the whole trick. The bug is the boundary, not the type." },
      ],
      difficulty: "medium",
    },
    {
      id: "sixt-mcq-20",
      prompt: "The counter's 'recent contracts' rail uses RANK() OVER (PARTITION BY customer_id ORDER BY shipped_at DESC) = 1. Two renters have two contracts sharing a check-out day. What ships?",
      choices: ["Nothing — RANK deduplicates ties", "Two rank-1 rows per tied renter — the rail duplicates; ROW_NUMBER with a named tie-break is the rail's actual contract", "The query errors on the tied ordering", "RANK skips rank 2 and the rail loses rows"],
      answer: 1,
      why: "RANK hands tied shipped_at values the same rank — several rank-1 rows, so the rail shows both contracts. The rail's promise is exactly one contract per renter, which is ROW_NUMBER's shape, and the tie-break (shipped_at DESC, then id DESC) must be a named, deterministic policy in the query comment.",
      notes: [
        { choice: 0, why: "RANK shares rungs, it never dedups. Same rank means multiple rows — the rail doubles exactly on the collision it should have broken." },
        { choice: 3, why: "Rank skipping is real (1, 1, 3…) but harmless here — rn = 1 rows are what survive, and there are now two of them." },
      ],
      difficulty: "medium",
    },
    {
      id: "sixt-mcq-21",
      prompt: "Claims pairs near-duplicate damage statements — same renter, same cents — before reminders go out. Which predicate pairs each statement exactly once?",
      choices: ["i1.id <> i2.id", "i1.id < i2.id", "i1.id = i2.id", "No id predicate — the business key alone suffices"],
      answer: 1,
      why: "The strict inequality kills the self-pair AND admits each unordered pair once — one direction IS the dedupe policy. <> admits both (a,b) and (b,a) so the fraud list doubles and reminders fire twice; = pairs every row with itself; no predicate pairs everything with everything.",
      notes: [
        { choice: 0, why: "The symmetric twin bug: <> keeps both orderings of every pair, so the pairing count doubles and the exception list stops being a list." },
        { choice: 3, why: "Without an id predicate every statement pairs with itself first — the 'duplicate' you detect is every row in the table." },
      ],
      difficulty: "medium",
    },
    {
      id: "sixt-mcq-22",
      prompt: "Existence test: renters carrying at least one delivered contract. Why does the house style default to EXISTS over IN here?",
      choices: ["EXISTS materializes a smaller intermediate list", "EXISTS short-circuits on the first match and is three-valued-logic safe — it never silently empties the way NOT IN does on a stray NULL", "IN is deprecated in modern SQL", "EXISTS is always faster at 103 rows"],
      answer: 1,
      why: "The semi-join shape reads as intent — 'renters with at least one delivered contract' — without needing DISTINCT, stops at the first hit, and never crosses the NULL trap. IN is a deliberate choice you can defend with the column's nullability; on staging tables you usually cannot.",
      notes: [
        { choice: 0, why: "EXISTS actually materializes nothing — that is the point. Short-circuit per outer row is the mechanism, not a smaller list." },
        { choice: 2, why: "IN is not deprecated — it is fine on NULL-guarded columns with small lists. The default is a policy about failure modes, not fashion." },
      ],
      difficulty: "medium",
    },
    {
      id: "sixt-mcq-23",
      prompt: "Each month's share of the 34,833.28 contract book, with every month row kept. Which form computes it in one pass?",
      choices: ["GROUP BY month — the share column cannot coexist with the rows", "SUM(SUM(total)) OVER () as the denominator beside each month's SUM(total)", "AVG(total) OVER (ORDER BY month) as the denominator", "COUNT(*) OVER () divided by month"],
      answer: 1,
      why: "SUM(booked) OVER () computes the grand total across the partition without collapsing rows — each month divides by 34,833.28 and stays a row. The bare GROUP BY collapses to one row per month; OVER (ORDER BY month) would silently turn the denominator into a running total.",
      notes: [
        { choice: 2, why: "ORDER BY in the window changes the frame — that is the cumulative spine, not the grand total. One keyword apart, completely different reconciliation." },
        { choice: 3, why: "COUNT(*) OVER () is 14 — dividing by a row count, not a value. The share of the book needs the book's total, not the spine's length." },
      ],
      difficulty: "medium",
    },
    {
      id: "sixt-mcq-24",
      prompt: "LAG(booked) OVER (ORDER BY month) drives the rotation walk. The first row's movement reads NULL. Why not COALESCE it to 0?",
      choices: ["Zero IS the honest baseline for January 2024", "NULL means no predecessor exists — a zero would read as a flat month and the walk's first movement becomes fiction", "COALESCE errors inside window expressions", "NULL breaks the ORDER BY and the walk mis-sorts"],
      answer: 1,
      why: "The first row has no prior month — the NULL is the baseline, and it is information. Coalescing to zero invents a delta against a month that does not exist, and the reviewer reads a flat opening instead of an unmeasured one. Report NULL, or label the row 'baseline'.",
      notes: [
        { choice: 0, why: "A zero delta claims the book was flat into January — a factual claim about a month that is not in the data. The honest value is 'not applicable'." },
        { choice: 2, why: "COALESCE is legal inside windows — the objection is semantic, not syntactic. That is what makes the bug dangerous: it ships." },
      ],
      difficulty: "medium",
    },
    {
      id: "sixt-mcq-25",
      prompt: "Utilization bands bucket classes by days-per-pool-unit: WHEN days*1.0/stock >= 0.5 THEN 'hot' WHEN >= 0.2 THEN 'warm' ELSE 'cold'. Why must the hot arm come first?",
      choices: ["CASE arms evaluate in parallel — order is irrelevant", "First matching WHEN wins — a cold-first order bands every class cold and the reorder plan cancels itself", "SQLite evaluates the ELSE arm first", "The bands must be alphabetical to reconcile"],
      answer: 1,
      why: "CASE is sequential: 0.55 satisfies >= 0.2 too, so if the warm arm ran first the hot classes would band warm and nothing would ever be hot. Wide arms must follow narrow ones — and the same logic is why a hole in the arms sends classes to ELSE and the forecast silently loses a band.",
      notes: [
        { choice: 2, why: "ELSE is by definition last — it is the fallback when no WHEN matched. The risk is arm order among the WHENs." },
        { choice: 3, why: "Nothing reconciles alphabetically — bands reconcile by the count of classes landing in each, which is exactly what arm order controls." },
      ],
      difficulty: "hard",
    },
    {
      id: "sixt-mcq-26",
      prompt: "The rate-grid model needs every partner × class cell to exist — 6 partners × 16 classes = 96 rows — so later LEFT JOINs can prove which cells are empty. Which build is the honest one?",
      choices: ["A comma join with the ON condition drifted into WHERE — same rows, cheaper to write", "An explicit CROSS JOIN — the fan-out is intended, and the keyword says so", "An INNER JOIN on an always-true predicate", "UNION ALL of the partners and the classes"],
      answer: 1,
      why: "CROSS JOIN is the deliberate Cartesian product: writing it documents that 96 rows are the design, not an accident. The classic catastrophe it guards against is the implicit cross — a comma join whose real join condition slipped into WHERE — which explodes a quick count into millions of rows at fleet scale.",
      notes: [
        { choice: 0, why: "Same rows today, unfixable tomorrow: the next editor who adds a real condition to that WHERE builds the accidental product. Intent should be a keyword, not a comment." },
        { choice: 2, why: "An INNER JOIN needs an ON to be meaningful — 'always true' is a CROSS JOIN in disguise with the intent hidden. Write the thing you mean." },
      ],
      difficulty: "hard",
    },
    {
      id: "sixt-mcq-27",
      prompt: "Booked-markets EXCEPT settled-markets returns EMPTY on this db. The analyst calls it a failure. What is the correct read?",
      choices: ["Correct — an EXCEPT should always return rows", "The empty diff is the finding: all four booked markets (EU 45, APAC 37, US 19, LATAM 2) also have settlement traffic, and the diff just proved it", "Empty means the SQL errored silently", "Empty means the markets deduped away on both sides"],
      answer: 1,
      why: "EXCEPT keeps left rows that never appear on the right — an empty result says every booked market moves money, which is exactly what the treasury check wanted to confirm. An empty diff is a finding, not a failure; INTERSECT answers the mirror question.",
      notes: [
        { choice: 2, why: "A failing EXCEPT errors loudly — both sides' column shapes must match or the engine refuses. Empty-and-valid is a semantic result." },
        { choice: 3, why: "EXCEPT dedups each side before comparing, but here each market appears once anyway. The emptiness is set semantics: nothing is left-only." },
      ],
      difficulty: "hard",
    },
    {
      id: "sixt-mcq-28",
      prompt: "WHERE total > (SELECT AVG(total) FROM orders WHERE status = 'cancelled') runs on a staging copy, returns zero rows, and looks valid. What do you check first?",
      choices: ["ROUND precision on the average", "Whether the inner fold is empty — a scalar subquery on zero rows returns NULL, total > NULL is UNKNOWN, and the whole report evaporates", "Whether AVG needs an index on total", "Whether the comparison needs HAVING instead of WHERE"],
      answer: 1,
      why: "Cancelled contracts are only 7 rows, and a thinner staging slice can hold none — the scalar subquery is contractually 0-or-1 rows, and the 0 case returns NULL, not an error. The comparison goes UNKNOWN for every row and the report ships empty. State the inner fold's population and its empty-case behavior unprompted.",
      notes: [
        { choice: 0, why: "Rounding happens after a value exists. The bug here is that no value exists at all — NULL, not a badly rounded number." },
        { choice: 3, why: "HAVING judges groups; this is a row-level comparison. No clause placement rescues an UNKNOWN comparison." },
      ],
      difficulty: "hard",
    },
    {
      id: "sixt-mcq-29",
      prompt: "The corporate-account read: which contracts sit above THEIR renter's own average spend, not the fleet's 338.19? Which shape answers it — and at what cost?",
      choices: ["A window AVG() OVER (PARTITION BY customer_id) — or the correlated cousin that re-runs the inner fold per outer row", "One scalar subquery of the fleet average beside a WHERE", "GROUP BY customer_id HAVING total > AVG(total)", "A CROSS JOIN to a per-renter averages table"],
      answer: 0,
      why: "The comparison population is per-renter, so the threshold must be too: AVG(total) OVER (PARTITION BY customer_id) keeps every row and compares in place; the correlated subquery answers the same thing by re-running per outer row — trivial at 103 contracts, a real conversation at warehouse scale. A 900.00 contract is routine for the 24-contract renter and an outlier for a two-rental account.",
      notes: [
        { choice: 1, why: "That answers 'above the fleet average' — a different slide. Mixing populations into one threshold is exactly the misread the panel fishes for." },
        { choice: 2, why: "Inside HAVING, total is not a per-row column anymore — groups have formed, and the row-level comparison is gone. Pipeline-order error." },
      ],
      difficulty: "hard",
    },
    {
      id: "sixt-mcq-30",
      prompt: "The loyalty ladder groups 103 contracts by renter and sorts by recency. What do you index — and what will EXPLAIN QUERY PLAN likely say at this scale?",
      choices: ["An index on (total) — and the plan will read 'SEARCH orders USING INDEX'", "A composite (customer_id, created_at) — though at 103 rows the planner may still SCAN, and that is correct", "No index can ever help a GROUP BY", "An index on status — 'SEARCH orders USING INDEX status'"],
      answer: 1,
      why: "The composite index lets GROUP BY customer_id walk pre-sorted groups and lets the per-renter latest-contract rail skip its sort. At 103 rows the planner will likely table-scan anyway — reading 103 rows is cheaper than maintaining an index on a table the counter updates all day. Knowing the crossover, not worshiping indexes, is the answer.",
      notes: [
        { choice: 0, why: "total never appears in a GROUP BY or sort here — an index on it serves nothing this query does, and the plan will still read SCAN." },
        { choice: 3, why: "status is a low-cardinality filter — an index on it rarely pays, and the ladder's fold and sort keys are customer_id and created_at." },
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
    {
      id: "cs-sixt-3",
      tier: "easy",
      topic: "s6",
      universe: "pricing",
      title: "The day-rate band census",
      brief:
        "SIXT-flavored brief on the storefront db: revenue management opens the rate review with the published band census — every bookable car class CASE-banded at the 55.00 line the counter publishes, value below it and mid at or above it. Probed facts: the fleet prices from a 14.99 floor to a 199.99 ceiling across 16 classes, splitting exactly 8 / 8 at the 55 line — the mid band averages 111.50 a day against 32.06 for value, with a 59.99 floor and 199.99 ceiling on mid and a 14.99-to-49.00 span on value. No class prices exactly 55.00, so the boundary arm is proven by construction. The census reads the expensive band first.",
      ask: "Return each day-rate band — value or mid — with its class count, average day rate, floor rate and ceiling rate, expensive band first.",
      template:
        "SELECT CASE WHEN price {1} 55.00 THEN 'mid' ELSE 'value' END AS band,\n       COUNT(*) AS classes,\n       ROUND(AVG(price), {2}) AS avg_day_rate,\n       MIN(price) AS floor_rate,\n       MAX(price) AS ceiling_rate\nFROM products\nGROUP BY band\nORDER BY avg_day_rate {3};",
      slots: [
        {
          answer: ">=",
          kind: "keyword",
          label: "the boundary arm",
          why: ">= 55.00 puts the boundary class in mid by policy — first matching WHEN wins, and the arm order is the published rate card. A bare > would drop any future 55.00 class into value silently, and < or = re-bands the whole fleet without erroring.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the rate precision",
          why: "Rates report to 2 decimals — 32.06 is the value band's average, and ROUND(…, 1) prints 32.1 while 0 prints 32: the fold stops footing to the rate card revenue management quotes. Precision lives at the display edge, one place, consistently.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the expensive-first direction",
          why: "The review reads mid on top: 111.50 against 32.06 is the whole yield story, and the ceiling cells (199.99 over 49.00) sit beside it. ASC opens the meeting on the shuttle end of the fleet and buries the flagship band the slide is about.",
        },
      ],
      distractors: ["<", "=", "ASC", "1", "0"],
      walkthrough:
        "One table, one CASE, the published rate card as a query. The CASE bands every class at the 55.00 line — >= 55 is mid by arm-order policy, everything else value — and the fold reads each band's census: 8 classes averaging 111.50 with a 59.99-to-199.99 span for mid, 8 classes averaging 32.06 spanning 14.99 to 49.00 for value. The boundary is proven, not assumed: no class prices exactly 55.00, so the >= arm's edge case never fires on this db — but the policy still lives in the query, because the day a 55.00 class lands on the rate card it must band mid without a rewrite. The ROUND edge keeps 32.06 honest to the cent. The distractors fail honestly: < and = re-band the fleet (a = arm would band all 16 classes value, since nothing prices exactly 55.00); 1 or 0 in the precision slot eats the cents off 32.06; ASC flips the read onto the value band and the yield story runs backwards.",
    },
    {
      id: "cs-sixt-4",
      tier: "medium",
      topic: "t4",
      universe: "month-close",
      title: "The rotation month spine",
      brief:
        "SIXT-flavored brief on the storefront db: revenue management's month-close deck opens on the contract spine — every month of the 14-month book (2024-01 to 2025-02) bucketed by its check-in stamp, contracts counted and booked value summed. Probed facts: the spine folds 103 contracts and 34,833.28; the gate at 8 or more contracts keeps exactly six months — 2024-01 (8 / 3,731.97), 2024-02 (9 / 3,609.64), 2024-03 (8 / 2,617.08), 2024-05 (8 / 2,910.31), 2024-07 (8 / 1,193.86), 2024-09 (9 / 3,116.04) — the two 9-contract peaks opening and the 1,193.86 July trough riding inside the kept set. The spine reads chronologically, oldest first.",
      ask: "Return each month carrying 8 or more contracts with its contract count and booked value to 2 decimals, chronological order.",
      template:
        "WITH spine AS (\n  SELECT STRFTIME('{1}', created_at) AS month,\n         COUNT(*) AS contracts,\n         ROUND(SUM(total), 2) AS booked\n  FROM orders\n  GROUP BY month\n)\nSELECT month, contracts, booked\nFROM spine\nWHERE contracts >= {2}\nORDER BY month {3};",
      slots: [
        {
          answer: "%Y-%m",
          kind: "keyword",
          label: "the spine bucket key",
          why: "Year plus zero-padded month is the bucket key that keeps 2024-01 and 2025-01 apart — '%m' alone merges them and the 14-month spine collapses to 12, while '%Y' collapses it to 2. The trend is only as honest as its bucket string.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the busy-month gate",
          why: "The gate at 8 keeps exactly six months, the two 9-contract peaks (Jan and Sep 2024) riding with four 8s — and the July trough (1,193.86) stays visible inside the kept set, which is the point. A gate of 7 floods the read to eleven months and the peaks stop being peaks.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A month spine reads oldest first — 2024-01 on top, each row's context the row above it. DESC presents the newest month first and the deck's seasonality story (build to the January peak, trough in July) runs backwards while every number stays technically correct.",
        },
      ],
      distractors: ["%m", "%Y", "6", "7", "DESC"],
      walkthrough:
        "Stage the spine, then filter it. The CTE buckets 103 contracts by STRFTIME('%Y-%m', created_at) — 14 honest months from 2024-01 to 2025-02 — folding COUNT(*) into contracts and SUM(total) into booked value; the outer query gates at 8 contracts and keeps the six busy months, oldest first: 3,731.97, 3,609.64, 2,617.08, 2,910.31, 1,193.86, 3,116.04. The gate is doing narrative work: 8-or-more is 'peak season' by this deck's definition, and the kept set deliberately contains the July trough so nobody mistakes a busy-by-count month for a busy-by-money month — July turns 8 contracts for just 1,193.86. The two-stage shape matters: window and filter hygiene aside, filtering the folded grain must happen after the fold, which the CTE makes structural instead of a HAVING-vs-WHERE trap. The distractors fail honestly: '%m' merges the two Januaries and the spine becomes 12 buckets of fiction; '%Y' collapses to a 2-row spine; 6 and 7 move the gate and redefine peak season mid-deck; DESC tells the story newest-first and the trough reads like a recovery.",
    },
    {
      id: "cs-sixt-5",
      tier: "medium",
      topic: "x3",
      universe: "refund-audit",
      title: "The settlement registers stack",
      brief:
        "SIXT-flavored brief on the storefront db: the claims close packet stacks registers — the exact-settlement register (statements whose legs cover the bill in full) over the partial register, then one labelled grand-total row, all in one query. Probed facts: 28 statements worth 86,977.00 billed; 21 settle exact for 65,612.00 (the void-but-settled #11 at 925.00 among them — legs are the ledger, statuses are claims); 1 sits partial (#25, 4,000.00 of 6,148.00); the 6 never-settled (15,217.00) correctly appear in no register but ride inside the total. The packet reads biggest billed first, TOTAL riding on top.",
      ask: "Stack the exact register, the partial register and a labelled TOTAL row — statement count and billed euros to 2 decimals each — biggest billed first.",
      template:
        "WITH legs AS (\n  SELECT i.id, i.amount_cents AS billed_cents,\n         COUNT(p.id) AS leg_count,\n         COALESCE(SUM(p.amount_cents), 0) AS paid_cents\n  FROM invoices i\n  {1} JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n)\nSELECT '{2}' AS register, COUNT(*) AS statements, ROUND(SUM(billed_cents) / 100.0, 2) AS billed\nFROM legs\nWHERE leg_count > 0 AND paid_cents = billed_cents\nUNION ALL\nSELECT 'partial', COUNT(*), ROUND(SUM(billed_cents) / 100.0, 2)\nFROM legs\nWHERE paid_cents > 0 AND paid_cents < billed_cents\nUNION ALL\nSELECT '{3}', COUNT(*), ROUND(SUM(billed_cents) / 100.0, 2)\nFROM legs\nORDER BY billed {4};",
      slots: [
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the statement-keeping join",
          why: "LEFT JOIN keeps all 28 statements in the CTE — the 6 zero-leg ones arrive with a NULL payload that COALESCE pins at 0, so the registers classify honestly and the TOTAL foots to 86,977.00. INNER deletes those 6 and the TOTAL silently reads 22 statements; CROSS folds to the same inner semantics on SQLite.",
        },
        {
          answer: "exact",
          kind: "keyword",
          label: "the covered-register label",
          why: "The first branch labels the register whose legs cover the bill in full — 21 statements, 65,612.00, void-but-settled #11 included because legs are the ledger of record. A vague label like 'settled' rebrands the register and the packet's identity stops matching the coverage census (21 / 1 / 6).",
        },
        {
          answer: "TOTAL",
          kind: "keyword",
          label: "the grand-total row label",
          why: "The third branch scans the unfiltered CTE and must be labelled TOTAL — 28 statements, 86,977.00, the whole book. Any other label and the packet's reconciliation line (registers + never-settled = TOTAL) stops reading as an identity, which is the only reason the stack is audit-friendly.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-billed-first direction",
          why: "The packet reads TOTAL 86,977.00 on top, then exact 65,612.00, then partial 6,148.00 — biggest exposure first at every grain. ASC floats the single partial statement to the top of the close and buries the settled book the meeting exists to ratify.",
        },
      ],
      distractors: ["INNER", "CROSS", "settled", "GRAND", "ASC"],
      walkthrough:
        "Stage the legs, stack the registers, keep the identity. The CTE LEFT JOINs all 28 statements to their settlement legs — COUNT(p.id) reads leg count, COALESCE(SUM(p.amount_cents), 0) pins zero-leg statements at 0 so the exact arm (leg_count > 0 AND paid = billed) can never swallow them — then UNION ALL stacks three grains: exact 21 / 65,612.00, partial 1 / 6,148.00, TOTAL 28 / 86,977.00, ordered biggest-billed first. The stack is honest because UNION ALL refuses to dedup: the packet's identity — 21 + 1 + 6 (never-settled, in no register but in the total) = 28 — reconciles by construction, and a statement leaking into two registers would double-count loudly instead of vanishing. The coverage census it must reconcile to: 21 exact / 1 partial / 6 none. The distractors fail honestly: INNER (and CROSS, which SQLite folds to inner semantics) deletes the six zero-leg statements and the TOTAL undercounts to 22 / 71,829.00; 'settled' rebrands the exact register and the census stops matching; 'GRAND' relabels the reconciliation row; ASC inverts the packet and opens the close on the 6,148.00 partial.",
    },
    {
      id: "cs-sixt-6",
      tier: "hard",
      topic: "t5",
      universe: "growth",
      title: "The One-ladder board",
      brief:
        "SIXT-flavored brief on the storefront db: the loyalty desk rebuilds the One ladder — every renter carrying 4 or more contracts, ranked by contract count with ties sharing rungs, because the upgrade certificate honors peer cohorts. Probed facts: the gate keeps 9 of 16 renters — the ladder runs 24 (EU), 17 (US), 14 (APAC), 13 (APAC), 5 (EU), then the four-way tie at 4 contracts (renters 16, 14, 11, 9 — three EU, one APAC) all sharing rank 6. RANK semantics are the published policy: shared rungs, gaps after ties, and no arbitrary split of renters with identical records. The board reads the ladder top-down.",
      ask: "Return each renter carrying 4 or more contracts with their market, contract count and ladder rank, ties sharing rungs, best rank first.",
      template:
        "SELECT c.id AS renter_id,\n       c.region AS market,\n       COUNT(o.id) AS contracts,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS ladder_rank\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nHAVING COUNT(*) >= {3}\nORDER BY ladder_rank, contracts DESC;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the shared-rung function",
          why: "RANK gives the four-way tie at 4 contracts the same rank (6) and would skip to 10 afterward — shared rungs, published gaps, the loyalty desk's named policy. ROW_NUMBER splits the tie arbitrarily and hands the upgrade certificate to whichever renter the engine happened to read first; SUM piles a running total into the rank column.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the best-count-first direction",
          why: "Rank 1 must be the 24-contract renter, so the window sorts the count descending. ASC crowns the four 4-contract renters rank 1 and pushes the top of the One ladder to rank 6 — a correct query answering the opposite question, and the certificate mail-merge would believe it.",
        },
        {
          answer: "4",
          kind: "number",
          label: "the ladder gate",
          why: "The gate at 4 keeps 9 renters and puts the four-way tie on the board — ties visible is the reason the desk runs RANK at all. A gate of 5 amputates the tie block and the shared-rung semantics never fire; 3 floods the board to 11 renters and dilutes the cohort the certificate targets.",
        },
      ],
      distractors: ["ROW_NUMBER", "SUM", "ASC", "3", "5"],
      walkthrough:
        "Fold contracts per renter, then rank the fold. The join attaches contracts to renters, GROUP BY c.id folds to one row per renter, HAVING COUNT(*) >= 4 keeps the nine-contract cohort, and RANK() OVER (ORDER BY COUNT(*) DESC) stamps the ladder: 24, 17, 14, 13, 5, then 6, 6, 6, 6 — the four renters at 4 contracts sharing rank 6 because identical records must read identical rungs. The board reads 1 through 6 top-down, EU holding four of the nine rungs. This is policy encoded as a window function: the loyalty desk publishes shared rungs with gaps (rank 7 does not exist this quarter), and the gate is chosen to keep the tie visible — a threshold that amputates the tie would hide the very semantics being graded. The distractors fail honestly: ROW_NUMBER splits the four-way tie 6-7-8-9 and arbitrarily picks a certificate winner; SUM turns the rank column into a running total (24, 41, 55…); ASC crowns the 4-contract cohort; 3 and 5 move the gate and change which cohort the certificate mails to.",
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
    { slug: "bikes-last-time-used", why: "Last-known return per vehicle in the fleet — the station's ready-line feed, decided by a MAX-over-group with NULL handling for units never checked out." },
    { slug: "funnel-step-conversion", why: "Stage-to-stage conversion across the rental lifecycle — booked to checked-out to returned, each step's denominator named, the funnel shape every SIXT screen opens with." },
    { slug: "confirmation-rate", why: "Rounded confirmation share where unmatched rows count as zero — the check-out-stamp read with the NULL policy and the 100.0-division habit in one deliverable." },
    { slug: "second-day-confirmation", why: "Bookings confirmed same-day versus next-day via a date-diff conditional rate — the booking-ahead window's fastest slice, a favorite counter-ops follow-up." },
    { slug: "daily-leads-and-partners", why: "Two grains per day — events beside distinct partners — the same COUNT(*) versus COUNT(DISTINCT) split as the station census, drilled at a daily grain." },
    { slug: "classes-more-than-5-students", why: "GROUP BY with a HAVING count floor — the class-coverage read: which fleet families the counter actually books, gated by activity, not by rate." },
    { slug: "find-top-performing-driver", why: "Top performer per cohort with ties owned — the hardest-worked class read at single-vehicle grain, where the LIMIT-1 habit breaks on ties." },
    { slug: "compute-the-rank-as-a-percentage", why: "Rank expressed as a percentile of the ladder — where a renter sits on the One ladder as a share, the loyalty desk's cohort-cutting question." },
    { slug: "count-student-number-in-departments", why: "LEFT JOIN counts that must show zeros for empty groups — stations with a fleet class but no rentals this month, whitespace made visible instead of deleted." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Reserved-but-never-checked-out via anti-join — the no-show and dormant-reservation cohort, the population the check-out funnel exists to watch." },
    { slug: "dormant-reactivation", why: "Renters whose latest activity falls behind a recency line — the win-back list, built on a per-group MAX date and a half-open comparison." },
    { slug: "calculate-parking-fees-and-duration", why: "Duration folded into CEIL-billed blocks with boundary rules — exactly how rental days and late-fee claims turn a return stamp into a billed line." },
    { slug: "credit-utilization-bands", why: "Ratio computed then CASE-banded — days-per-pool-unit utilization bands, the reorder trigger read, where arm order decides which classes go hot." },
    { slug: "delinquency-buckets", why: "Unsettled statements bucketed by age — the claims dunning ladder, where the cents-safe anti-join feeds an aging CASE the close ships on." },
    { slug: "monthly-transactions-ii", why: "Categorize monthly activity by debits, credits or both — the settlement-rail read: which statements moved money this month, one CASE at a time." },
    { slug: "deferred-revenue", why: "Money billed but not yet earned — prepaid bookings sitting in the GL before check-out, the accrual discipline behind the 34,833.28 book." },
  ],
};
