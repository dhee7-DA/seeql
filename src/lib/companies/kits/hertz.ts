// Hertz — Wave-9 (Task 98), mobility domain, 0 tagged rows — theme-curated; facts from scripts/company-facts.md.
// Car-rental network SQL: the storefront db read as a counter-to-return sandbox — customers are
// renters (region = pickup market), orders are rental agreements (delivered = returned-and-settled,
// shipped = on-rent with shipped_at as the check-out stamp, pending = reserved-awaiting pickup,
// cancelled = no-show/cancelled booking), order_items are agreement lines (quantity = rental days,
// unit_price = the daily rate locked on the line), products = vehicle classes (category = the fleet
// family the class rolls up to, stock = units in the rotation pool), suppliers = fleet/leasing
// partners, invoices = rental invoices (fuel and late fees included), payments = charge rails
// (card vs corporate billing), expenses = fleet opex, ledger_entries = the GL (INTEGER cents — the
// dollar read is amount_cents / 100.0). Pool provenance: company-pools.md carries NO Hertz section —
// 0 tagged rows — so all 10 topic slug sets and all 16 problems are theme-curated from the pools
// file's Theme menu (sql rows only; no write/schema/finance-band rows) and say so. Case briefs quote
// probed figures from scripts/company-facts.md (probed 2026-10-12); every case slot is mechanically
// verified against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const hertzKit: CompanyKit = {
  id: "hertz",
  domainId: "mobility",
  name: "Hertz",
  tagline: "Fleet rotation from counter to return",
  accent: "text-teal-300",

  brief: [
    "**Hertz** is the car-rental network that turned the airport counter into a logistics system — a fleet of vehicle classes rotating across markets, rented by the day, settled at the return lane. The whole business is utilization per unit: a car sitting on the lot between rotations is depreciation with a parking spot, so every number the company manages is a conditional count over rental agreements. This kit maps the storefront db onto that world: the 16 customers rows are renters (region = pickup market), the 103 orders are rental agreements worth **34,833.28**, and the 251 order_items rows are agreement lines — quantity = rental days, unit_price = the daily rate each line locked. The 16 products are bookable vehicle classes (price = day rate, stock = the rotation pool), rolling up to seven fleet families, supplied by 6 fleet/leasing partners. The status map is fixed: delivered = {emerald:returned-and-settled} (52, 50.5%), shipped = {sky:on-rent} (30, 29.1%), pending = reserved-awaiting-pickup (14), cancelled = {rose:no-show} (7, 6.8%).",
    "The data org splits into fleet ops, revenue management (the day-rate and {amber:utilization} desk), a counter-ops pod and a small billing team, and they read the same agreement spine at different grains. An agreement books at created_at, and `shipped_at` is stamped the day the renter actually drives out — **82 of 103 agreements** carry the stamp, averaging **2.98 days** of booking-ahead with a 2–4 day spread, while the 14 reserved rows have none yet (a population definition, not a cleanup job). Money sits one layer down: rental invoices (fuel and late fees included) and payments in INTEGER cents, where the dollar read is `amount_cents / 100.0`. Concentration is the third story: **63.5%** of the book comes from renters whose lifetime spend crosses 3,000 (71.2% above 2,000) — one Gold-plus renter moves a market's month.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain market census** — EU runs 45 agreements from just 8 renters (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator question out loud (*'does a no-show count in your base?'*), then into the Gold Plus ladder where FOUR renters sit tied at 4 agreements and rank semantics become a business decision about who gets the upgrade certificate. Late rounds walk the {sky:14-month agreement spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL, or open the class census where the widest family turns **121 rental days over 54 agreements** and the fan-out is the test. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Hertz section — zero tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: counter-to-return funnels, two-grain counter censuses, tie-heavy Gold ladders, day-rate band CASE and the cents-safe billing spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:fleet-class rotation census} fleet ops opens the quarter with, the other rebuilds the {violet:Gold Plus Rewards ladder} the loyalty desk re-cuts every month. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:20 —** The day starts with the fleet feed and the check-out audit. A fleet-ops analyst opens the utilization dashboard before the counter staffs up: did overnight reservations land, does any agreement show a check-out stamp while status still reads pending, does the one-pass status census reconcile — 52 returned-and-settled + 30 on-rent + 14 reserved + 7 no-show = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If booking-ahead drifts off the **2.98-day** norm — APAC runs fastest at 2.93, LATAM slowest at 3.5 — the ready-line queue gets re-cut before revenue management's morning read ships, *because a car on the ready line is the only car earning nothing at all*.",
    "**11:30 —** Midday is the rotation read. Revenue management wants the fleet-class census — the widest family turning **121 rental days over 54 agreements**, the money family booking 11,744.01 — beside the tight-rotation watch, where the premium class has burned down to 14 units of pool; loyalty wants the Gold Plus ladder re-cut with the four renters tied at 4 agreements handled honestly — *shared rungs, named policy*; a regional lead wants agreements per renter beside renter counts (EU 45-from-8 versus US 19-from-2). Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the revenue-review argument*.",
    "**15:45 —** The afternoon tilts toward the counter money. The settlement anti-join refreshes first — **6 never-settled invoices worth 15,217** — before billing sends a single fuel-and-fees statement; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-charged invoice (#11, 925.00) and a paid-status invoice with zero settlement rows behind it (#28, 1,756.00). The day ends the way every close does: the GL trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Check-out rate", what: "Agreements with a check-out stamp ÷ ALL agreements booked: 82 of 103 (79.6%). The top-of-funnel number fleet ops reads every Monday — the 14 reserved rows are 'not yet', never a silent zero." },
    { name: "Booking-ahead window", what: "created_at to counter check-out (created_at → shipped_at) over checked-out agreements only: 2.98-day average, range 2–4. The population definition ships with the number — reserved agreements have no clock and must not dilute it." },
    { name: "Returned-and-settled share", what: "Delivered ÷ ALL agreements booked: 52 of 103 (50.5%), with 30 more on-rent (29.1%). 'Returned' is a status-filtered conditional count, and the denominator — reserved and no-show included — is the whole interview." },
    { name: "No-show share", what: "Cancelled ÷ booked: 7 of 103 (6.8%), sliced by pickup market — APAC 8.1%, EU 6.7%, US 5.3%. The number that prices the no-show fee and sizes the reminder cadence." },
    { name: "Agreement book", what: "Total booked value: 34,833.28 across 103 agreements, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the fleet-tiering story — one 1,088.44 agreement outweighs the smallest 42 combined." },
    { name: "Class utilization", what: "Rental days turned per class against its rotation pool: the hardest-worked class turns 47 days on a 260-unit pool, while the premium class turns 46 against 60 and has 14 left — the tightest rotation on the ledger and the replanning trigger." },
    { name: "Renter concentration", what: "Share of the book from renters spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The top renter runs 24 agreements and 7,262.35 — the Gold Plus cohort that staffs the loyalty desk." },
    { name: "Counter collections", what: "Billed versus settled: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-settled worth 15,217. The AR anti-join the billing pod refreshes at every close before a fuel-and-fees statement goes out." },
  ],

  topics: [
    {
      name: "Counter-to-return lifecycle counts",
      why: "Every Hertz screen opens with the lifecycle: agreements booked, checked out (shipped_at stamped), returned-and-settled. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an on-rent agreement 'returned' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain counter censuses",
      why: "Agreements and renters are different grains of the same join, and every market census here reports both: EU runs 45 agreements from 8 renters while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is counter load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining renters to agreements",
      why: "Renters carry region and created_at; agreements inherit them through joins, and the join type decides who survives. An agreement without a renter is corruption; a renter without agreements is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "employee-bonus", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "Fleet-class enrichment",
      why: "Class-level reporting means attaching fleet family and partner attributes to every agreement line — the products-to-order_items join where line quantity is rental days and unit_price is the locked day rate. Hertz's follow-up is always the fan-out: join lines in, and COUNT(*) silently stops counting agreements.",
      slugs: ["product-sales-analysis-ii", "product-sales-analysis-iii", "sales-analysis-i"],
    },
    {
      name: "Utilization leaderboards",
      why: "Top-class-per-family, hardest-worked vehicle, Gold-tier renters — rotation reporting is leaderboard reporting. Hertz drills the rank trio because ties are guaranteed at counter scale — four renters sit at 4 agreements each on this db — and the LIMIT-1-OFFSET-1 habit breaks on them.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Day-rate banding with CASE",
      why: "Fleet classes are CASE-banded — the shelf runs 14.99 shuttle to 199.99 flagship, split 8 mid classes averaging 111.50 against 8 at 32.06 — with fixed edges the rate card publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the revenue forecast, and a reordered WHEN quietly re-bands the fleet.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Rotation month walks & LAG",
      why: "The 14-month agreement spine (2024-01 to 2025-02) is the revenue-management call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and the pre-festive lull named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine"],
    },
    {
      name: "Coverage set algebra",
      why: "Close packets stack populations — settled beside never-settled, this quarter beside last — and EXCEPT answers 'which billed agreements never settled'. UNION dedups whole rows silently, which makes it a correctness question, not a style one; the counter's stack must add up or it does not ship.",
      slugs: ["team-scores-in-football-tournament", "monthly-transactions-ii", "the-airport-with-the-most-flights"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets returned, on-rent, reserved and no-show in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift while the counter is calling.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Billing & cents discipline",
      why: "Returned is not settled — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the counter world meets money, fuel and late fees included. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "monthly-transactions-i"],
    },
  ],

  theory: [
    {
      id: "hertz-t1",
      q: "Your rotation report joins renters to agreements. When do you INNER and when do you LEFT — and what silently breaks if you filter a status in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins agreements to renters: an agreement with no renter row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from renters: the renters with no agreements ARE the answer, arriving with NULL agreement columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload renter row — the LEFT quietly became an INNER and the never-rented cohort vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-renting renters — all 16 renters appear in the agreement table somewhere — and proving that zero is itself the analyst's job, because the same query on a staging table ships an empty cohort that looks like a victory.",
      tag: "joins",
    },
    {
      id: "hertz-t2",
      q: "Four renters tie at 4 agreements on the Gold Plus ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder above the tie runs 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose loyalty account gets the upgrade certificate. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer renters (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment. Loyalty desks live on these rungs: the policy IS the benefit.",
      tag: "windows",
    },
    {
      id: "hertz-t3",
      q: "The census shows 103 agreements and 16 renters; EU shows 45 agreements and 8 renters. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts agreement rows after the join — one row per agreement, so a renter with 24 agreements contributes 24. COUNT(DISTINCT customer_id) folds those rows back to renters — EU's 45 agreements collapse to 8 renters. Neither is wrong: agreements measure counter load and fleet demand, renters measure installed base and coverage. The ratio — 5.6 agreements per renter in EU versus 9.5 in the US on this db — is the intensity signal that decides where the ready line grows. The trap that catches candidates is a third grain: join order_items for agreement lines and COUNT(*) silently counts lines, not agreements — 251 of them, and the rental-day sum runs ahead of both. Saying 'one row per what?' for every COUNT is the habit the panel grades, because the utilization story changes with each grain.",
      tag: "aggregation",
    },
    {
      id: "hertz-t4",
      q: "shipped_at is NULL until the renter drives out. What is your policy for the booking-ahead report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only checked-out agreements have a lead time, so the report measures booking-to-check-out for the 82 of 103 agreements that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL agreements returns the checked-out-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the checked-out subset; the gap between it and COUNT(*) is exactly the 14 reserved plus 7 no-show rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the lead time to zero to 'fix' the average — that invents same-day check-outs for reservations that have not started. A report whose WHERE clause is doing definitional work without saying so is exactly what a Hertz reviewer hunts for, because the ready line is planned off that number.",
      tag: "nulls",
    },
    {
      id: "hertz-t5",
      q: "The loyalty review wants renters carrying at least five agreements. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards on-rent, reserved and no-show rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The five-agreement floor is a group-level fact — HAVING COUNT(*) >= 5 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a Gold list and an error, and between a threshold applied to agreements versus to dollars. The strong answer places every filter by asking: is this a fact about one agreement, or about a renter? On this db the floor keeps exactly five renters — 24, 17, 14, 13 and 5 agreements — and the four renters at 4 fall one short, which is the retention conversation the loyalty desk wanted.",
      tag: "pipeline",
    },
    {
      id: "hertz-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 agreements always produce a mean (338.19 on this book). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides: cut the spine to a thin month and the whole report evaporates. The correlated cousin (compare each agreement to ITS renter's own average) re-runs per outer row and answers a different question at a different cost — 'is this agreement big for THIS renter' rather than for the fleet. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "hertz-t7",
      q: "The rotation trend buckets agreements by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's check-outs, and holiday-week returns land exactly there. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The calendar has a shape worth knowing too: the book opens at 3,731.97, troughs at 1,193.86 in July 2024, and both cancellation-heavy months (2 each) sit in July and November — date discipline is how that story stays honest.",
      tag: "dates",
    },
    {
      id: "hertz-t8",
      q: "Billing says an invoice is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 invoices worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void invoice WITH a settlement row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes; a partial (#25, 4,000 of 6,148) needs the coverage CASE, not a binary paid flag. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial / 6 never-collected, and the GL trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "hertz-mcq-1",
      prompt: "An agreement row's status reads 'shipped'. In this kit's Hertz stage map, what happened?",
      choices: ["Returned-and-settled — the rental closed", "On-rent — checked out, not yet returned", "No-show — the booking lapsed", "Reserved — awaiting counter pickup"],
      answer: 1,
      why: "The stage map is fixed: shipped = on-rent with shipped_at as the check-out stamp (30 of 103 agreements, 29.1%). It is the only status where the car is actually earning its day rate.",
      notes: [
        { choice: 0, why: "Returned-and-settled is 'delivered' — 52 agreements. Calling on-rent rows returned inflates the settled share before a single car comes back." },
        { choice: 2, why: "No-show is 'cancelled' — 7 agreements. A no-show never had a check-out stamp; 'shipped' rows are literally on the road." },
      ],
      difficulty: "easy",
    },
    {
      id: "hertz-mcq-2",
      prompt: "Check-out rate is shipped_at IS NOT NULL ÷ which population? The db holds 82 checked out, 14 reserved and 7 no-show of 103 booked.",
      choices: ["Checked out + no-show only (82/89 = 92.1%)", "All agreements booked (82/103 = 79.6%)", "Returned agreements only (52/82)", "Distinct renters (82/16)"],
      answer: 1,
      why: "The house definition: checked out ÷ ALL agreements booked — reserved rows stay in the denominator because 'not yet checked out' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 reserved inflates the rate to 92.1% by deleting the population still in the booking window — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is return-and-settle, shipped_at is check-out. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "hertz-mcq-3",
      prompt: "EU carries 45 agreements from 8 renters. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts agreement rows (45); COUNT(DISTINCT customer_id) folds repeats back to renters (8). The gap between them — 5.6 agreements per renter — is the counter-intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every agreement has a renter. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not renters — a third grain nobody asked for. The census is agreements AND renters." },
      ],
      difficulty: "easy",
    },
    {
      id: "hertz-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to no-show agreements only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the no-show share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between APAC's 8.1 and a displayed 8 — or a 0.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.081 to 0 first, then scales — the no-show map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "hertz-mcq-5",
      prompt: "Keep only renters carrying at least 5 agreements. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 5, before GROUP BY", "GROUP BY renter HAVING COUNT(*) >= 5", "WHERE agreements >= 5 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "An agreement-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the floor keeps exactly five renters — 24, 17, 14, 13 and 5 agreements.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'agreements' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "hertz-mcq-6",
      prompt: "The Gold ladder runs 24, 17, 14, 13, 5 agreements, then FOUR renters tied at 4. Under RANK, what rank do the two 3-agreement renters carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-agreement renters share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The loyalty desk's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "hertz-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-lead rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The reserved agreements double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the checked-out-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 agreements.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "hertz-mcq-8",
      prompt: "A staging-table no-show list uses renter_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every agreement carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "hertz-mcq-9",
      prompt: "order_items fans 103 agreements into 251 lines (498 rental days). On orders ⋈ order_items, which pair counts AGREEMENTS?",
      choices: ["COUNT(*) and COUNT(DISTINCT order_id)", "COUNT(*) and SUM(quantity)", "COUNT(DISTINCT product_id) and COUNT(*)", "SUM(quantity) and COUNT(DISTINCT product_id)"],
      answer: 0,
      why: "After the fan-out, only COUNT(DISTINCT order_id) folds lines back to agreements — COUNT(*) counts 251 rows. SUM(quantity) counts rental days (498), a third grain entirely.",
      notes: [
        { choice: 1, why: "SUM(quantity) is the utilization number, not the agreement count — the fan-out trap: after joining order_items, COUNT(*) stops counting agreements too." },
        { choice: 2, why: "COUNT(DISTINCT product_id) counts distinct vehicle classes touched — class coverage, not agreement volume. Both columns answer questions nobody asked." },
      ],
      difficulty: "hard",
    },
    {
      id: "hertz-mcq-10",
      prompt: "A fuel-and-fees invoice row holds 175600 cents (the #28 statement, 1,756.00 dollars). Which expression prints its dollar value?",
      choices: ["amount_cents / 100", "ROUND(amount_cents / 100.0, 2)", "amount_cents * 100", "ROUND(amount_cents, 2)"],
      answer: 1,
      why: "Dividing by 100.0 promotes to real arithmetic: 1,756.00 dollars. The .0 is the whole fix — 175600 / 100 in integer math truncates, silently eating cents on every odd-cent statement in the billing book.",
      notes: [
        { choice: 0, why: "Integer ÷ integer in SQLite is integer division: 175600/100 = 1756. On whole-dollar amounts the leak hides; the first odd-cent statement exposes it. Promote before you divide." },
        { choice: 2, why: "Multiplying turns cents into 17,560,000 — units inverted. Sanity-check the magnitude: dollars are smaller than cents." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-hertz-1",
      tier: "easy",
      topic: "j7",
      universe: "catalog",
      title: "The fleet-class rotation census",
      brief:
        "Hertz-flavored brief on the storefront db: fleet ops opens the rotation review with the class census — per fleet family, how many classes rotate in it, how many rental days it turned, how many distinct agreements touched it, and the day-rate revenue it produced. Probed facts: the 103-agreement book is 34,833.28 folded from 251 lines (quantity = rental days, unit_price = the locked daily rate); the widest family turns 121 rental days over 54 agreements, the money family books 11,744.01 over 97 days and 46 agreements, and the single-class tail sits at 27 days over 13 agreements for 863.91. Every family's day count, agreement count and revenue reconcile to the probed tables; the review reads biggest rental-day load first.",
      ask: "Return each fleet family with its class count, rental days, agreement count and day-rate revenue to 2 decimals, biggest rental-day load first.",
      template:
        "SELECT p.category AS fleet_family,\n       COUNT(DISTINCT p.id) AS classes,\n       {1}(oi.quantity) AS rental_days,\n       COUNT({2} oi.order_id) AS agreements,\n       ROUND(SUM(oi.quantity * oi.unit_price), {3}) AS counter_revenue\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.category\nORDER BY {4} DESC;",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the rental-day fold",
          why: "SUM(oi.quantity) adds rental days per family — 121 at the widest. AVG would report the average line's days (a rate, not a load), and COUNT would report line counts: three different grains wearing one column name.",
        },
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the agreement deduplicator",
          why: "COUNT(DISTINCT oi.order_id) folds repeat lines back to agreements: the widest family reads 54, not its line count. An agreement touching two classes must count once per family — the census says touched, not lines.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the revenue precision",
          why: "Revenue reports to 2 decimals — 11,744.01 at the money family. ROUND(…, 1) prints 11,744.0 and the class ledger stops reconciling with the 34,833.28 book revenue management quotes on the same slide.",
        },
        {
          answer: "rental_days",
          kind: "keyword",
          label: "the rotation-sort column",
          why: "The review reads biggest rental-day load first: 121, 97, 85, 61, 54, 53, 27. Sorting by fleet_family would open the meeting on an alphabetical accident, and by classes on a three-way tie at 3.",
        },
      ],
      distractors: ["AVG", "MAX", "COUNT", "ASC", "1"],
      walkthrough:
        "One join, one fold, four columns at three grains. The join attaches every agreement line to its class's fleet family — GROUP BY category folds the 251 lines into seven rows where SUM(oi.quantity) reads rental days (121 / 97 / 85 / 61 / 54 / 53 / 27), COUNT(DISTINCT oi.order_id) reads agreements touched (54 / 46 / 40 / 30 / 22 / 23 / 13), and ROUND(SUM(oi.quantity * oi.unit_price), 2) reads day-rate revenue (3,294.29 / 11,744.01 / 4,818.61 / 5,198.41 / 1,984.93 / 6,929.12 / 863.91) — reconciling upward to the 34,833.28 book. The two-grain pairing is the utilization read: the widest family turns 121 days over 54 agreements while the money family books 11,744.01 — where the fleet works, and where it earns. The distractors fail honestly: AVG in the day fold reports the average line (a rate, not a load); MAX reports one line's days; COUNT in the day slot counts lines, not days; AVG or MAX inside the COUNT slot is a nested aggregate that errors outright; 1 as the precision prints 11,744.0 and drifts off the quoted book; ASC or 1 in the sort slot re-aims the board at the 27-day tail or an alphabetical accident.",
    },
    {
      id: "cs-hertz-2",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The Gold Plus Rewards ladder",
      brief:
        "Hertz-flavored brief on the storefront db: the loyalty desk re-cuts the Gold Plus Rewards ladder monthly — renters with five or more agreements in the window, ranked by lifetime booked value, one row per renter. Probed facts: the 16-renter base folds to a ladder of 24, 17, 14, 13 and 5 agreements above the floor, worth 7,262.35 / 6,640.56 / 4,574.23 / 3,644.56 / 2,667.93 — the top renter alone runs 24 agreements out of EU. FOUR renters sit at 4 agreements, one rental short of the floor, and 63.5% of the book sits with the 3,000-plus spenders — a different cut, and the ladder must say which definition it is printing. The ladder reads best value first, ranks shared where spends tie, first row on top.",
      ask: "Return each qualifying renter with name, market, agreement count, lifetime spend to 2 decimals and a RANK by spend, best first.",
      template:
        "WITH lifetime AS (\n  SELECT o.{1} AS renter_id,\n         COUNT(*) AS agreements,\n         ROUND(SUM(o.total), {2}) AS spend\n  FROM orders o\n  GROUP BY renter_id\n  HAVING agreements >= {3}\n)\nSELECT c.name AS member,\n       c.region AS market,\n       lifetime.agreements,\n       lifetime.spend,\n       RANK() OVER (ORDER BY lifetime.spend {4}) AS gold_rank\nFROM lifetime\nJOIN customers c ON c.id = lifetime.renter_id\nORDER BY gold_rank;",
      slots: [
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the renter fold key",
          why: "The fold key is o.customer_id — one row per renter. Folding by status instead groups 52/30/14/7 by fate, and those status values never join to customers.id, so the ladder empties while every number stays technically true.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the spend precision",
          why: "Spend reports to 2 decimals — 7,262.35 at the top. ROUND(…, 1) prints 7,262.4 and the ladder stops reconciling with the 63.5%-concentration cut the loyalty desk quotes beside it.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the Gold floor",
          why: "Five or more agreements is the published floor: it keeps exactly five renters (24, 17, 14, 13, 5) and leaves the four 4-agreement renters one rental short. A floor of 1 floods the ladder to all 16 renters and the Gold list loses its meaning.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the best-value direction",
          why: "RANK over spend DESC reads 1..5 best-first: 7,262.35 on top. ASC would crown the 2,667.93 renter as gold_rank 1 — a correct query aimed at the wrong end of the ladder.",
        },
      ],
      distractors: ["status", "region", "1", "0", "ASC"],
      walkthrough:
        "Two stages: fold the book to renters, then rank it. The CTE groups 103 agreements by customer_id and HAVING agreements >= 5 keeps exactly five renters — 24, 17, 14, 13 and 5 agreements — while the four renters tied at 4 fall one short, which is the retention conversation the loyalty desk wanted. The outer query joins back for name and market and ranks by spend DESC: Alice Chen (EU, 24, 7,262.35), Emma Wilson (US, 17, 6,640.56), Grace Kim (APAC, 14, 4,574.23), Maya Patel (APAC, 13, 3,644.56), Chloe Dubois (EU, 5, 2,667.93) — ranks 1 through 5, no ties among spends, so RANK and DENSE_RANK agree here. Chloe is the honest footnote: she clears the agreement floor but sits below the 3,000 spend line behind the 63.5% concentration stat — two definitions, both true, one slide. The distractors each break differently: folding by status builds groups of 52/30/14/7 whose status values never join to customers.id, so the ladder returns zero rows; region is not an orders column and errors outright; 1 as the floor floods the ladder to all 16 renters; 0 does the same and 1 in the precision slot prints 7,262.4; ASC flips the ladder so the smallest book wears rank 1.",
    },
  ],

  problems: [
    { slug: "immediate-food-delivery-ii", why: "The returned-and-settled share: a conditional count ratio where the denominator is the whole test — Hertz's settled-versus-booked question in textbook form." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The volume-argmax read: which renter holds the most agreements — the top of the Gold Plus ladder, decided on a grouped count with ties owned, not hidden." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Each renter's most-rented vehicle class — the per-renter argmax that drives the upgrade certificate and the fleet-mix forecast." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one query with the 100.0-before-division fix — the honest-denominator drill behind every no-show and check-out share here." },
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded share where unmatched rows count as zero — the no-show-share shape sliced by renter, with the zero-fill decision made deliberately." },
    { slug: "average-selling-price", why: "Window-weighted pricing by period — the day-rate read where weighting by rental days versus by lines changes the answer, a favorite revenue-management follow-up." },
    { slug: "trips-and-users", why: "Cancellation rates by market with restricted accounts excluded — the no-show map's mobility-classic cousin, denominator exclusions stated out loud." },
    { slug: "list-the-products-ordered-in-a-period", why: "Classes rented in a window with day-floor gates — half-open date logic plus HAVING, the seasonal rotation query shape." },
    { slug: "the-most-recent-three-orders", why: "Per-renter latest-3 via window — the 'recent agreements' rail at the counter: ROW_NUMBER with a PARTITION and a deterministic tie-break." },
    { slug: "keep-latest-dedupe", why: "Latest agreement per renter with ties broken deterministically — check-out stamps collide, and the dedupe rule must be a named policy." },
    { slug: "duplicate-charge-pairs", why: "Counter double-charge pairs via self-join window — the fuel-and-fees fraud screen billing runs before statements go out." },
    { slug: "null-blank-audit", why: "Agreement hygiene: NULL check-out stamps and blank markets counted by column — the data-quality census before any utilization read is trusted." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Renters who took the SUV family and the EV family but never the premium class — conditional aggregation over fleet-mix behavior." },
    { slug: "gl-reconciliation", why: "Ledger reconciliation with a delta column — the close reflex this kit's GL rewards: debits against credits, delta zero or the close does not ship." },
    { slug: "total-traveled-distance", why: "Conditional SUM over a flag — returned-versus-no-show day splits, the same CASE-SUM muscle as the status census." },
    { slug: "customers-who-never-order", why: "The whitespace anti-join: renters with zero agreements. On this ledger the query returns a confident zero — and proving that zero is the hygiene check itself." },
  ],
};
