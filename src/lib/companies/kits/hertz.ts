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
// 0 tagged rows — so all 10 topic slug sets and all 32 problems are theme-curated from the pools
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
    "Preparation strategy: the pools file carries no Hertz section — zero tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: counter-to-return funnels, two-grain counter censuses, tie-heavy Gold ladders, day-rate band CASE and the cents-safe billing spine. Do the topics in order, then run the six case studies on the live storefront db — the {emerald:fleet-class rotation census} fleet ops opens the quarter with, the {violet:Gold Plus Rewards ladder} the loyalty desk re-cuts every month, the settlement coverage ledger, the family workhorse scan, the never-settled anti-join and the fixed-cost stack. This kit is built for spaced practice rather than one sitting: run each case, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "bikes-last-time-used", "hopper-company-queries-i"],
    },
    {
      name: "Two-grain counter censuses",
      why: "Agreements and renters are different grains of the same join, and every market census here reports both: EU runs 45 agreements from 8 renters while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is counter load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "flight-occupancy-and-waitlist-analysis"],
    },
    {
      name: "Joining renters to agreements",
      why: "Renters carry region and created_at; agreements inherit them through joins, and the join type decides who survives. An agreement without a renter is corruption; a renter without agreements is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "employee-bonus", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "Fleet-class enrichment",
      why: "Class-level reporting means attaching fleet family and partner attributes to every agreement line — the products-to-order_items join where line quantity is rental days and unit_price is the locked day rate. Hertz's follow-up is always the fan-out: join lines in, and COUNT(*) silently stops counting agreements.",
      slugs: ["product-sales-analysis-ii", "product-sales-analysis-iii", "sales-analysis-i", "generate-the-invoice", "products-price-for-each-store"],
    },
    {
      name: "Utilization leaderboards",
      why: "Top-class-per-family, hardest-worked vehicle, Gold-tier renters — rotation reporting is leaderboard reporting. Hertz drills the rank trio because ties are guaranteed at counter scale — four renters sit at 4 agreements each on this db — and the LIMIT-1-OFFSET-1 habit breaks on them.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "repeat-purchase-rate", "rfm-segmentation", "year-on-year-growth-rate"],
    },
    {
      name: "Day-rate banding with CASE",
      why: "Fleet classes are CASE-banded — the shelf runs 14.99 shuttle to 199.99 flagship, split 8 mid classes averaging 111.50 against 8 at 32.06 — with fixed edges the rate card publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the revenue forecast, and a reordered WHEN quietly re-bands the fleet.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories", "calculate-product-final-price", "spend-histogram"],
    },
    {
      name: "Rotation month walks & LAG",
      why: "The 14-month agreement spine (2024-01 to 2025-02) is the revenue-management call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and the pre-festive lull named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine", "restaurant-growth", "cohort-retention-matrix"],
    },
    {
      name: "Coverage set algebra",
      why: "Close packets stack populations — settled beside never-settled, this quarter beside last — and EXCEPT answers 'which billed agreements never settled'. UNION dedups whole rows silently, which makes it a correctness question, not a style one; the counter's stack must add up or it does not ship.",
      slugs: ["team-scores-in-football-tournament", "monthly-transactions-ii", "the-airport-with-the-most-flights", "prepayment-detection"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets returned, on-rent, reserved and no-show in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift while the counter is calling.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "sales-by-day-of-the-week"],
    },
    {
      name: "Billing & cents discipline",
      why: "Returned is not settled — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the counter world meets money, fuel and late fees included. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "monthly-transactions-i", "ar-aging-schedule", "calculate-parking-fees-and-duration"],
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
    {
      id: "hertz-t9",
      q: "COUNT(*), COUNT(column), COUNT(DISTINCT column) — walk me through what each counts on the agreement spine, and where mixing them up shows in a Hertz report.",
      a: "COUNT(*) counts rows: 103 agreements, or 251 lines once order_items joins in. COUNT(column) skips NULLs — COUNT(shipped_at) reads 82, and the 21-row gap to COUNT(*) is exactly the reserved-plus-no-show population, which is a feature when named and a lie when not. COUNT(DISTINCT column) folds repeats: COUNT(DISTINCT customer_id) reads 16 renters, COUNT(DISTINCT order_id) reads 103 agreements after the line-level fan-out. The classic Hertz miss is the utilization report that joins agreement lines for rental days and keeps COUNT(*) — it silently reports 251 lines where the header says agreements. Say 'one row per what?' for every COUNT and the grain stays honest.",
      tag: "aggregation",
    },
    {
      id: "hertz-t10",
      q: "How do LAG and LEAD power the month-over-month rotation walk — and where do candidates usually stumble?",
      a: "LAG(column) OVER (ORDER BY month) puts the prior month's booked value beside the current one — the spine's 3,731.97 opener against each later month's delta; LEAD reads forward. Both leave the boundary row NULL, and that NULL is honest: the first month has no baseline, so its movement is 'unknown', not zero. The two classic stumbles: filtering the window result in WHERE, which fails because windows evaluate in the SELECT stage — stage the LAG in a CTE and filter outside; and forgetting PARTITION BY when the walk is per-market, where one global window smears one market's January into the next market's February.",
      tag: "windows",
    },
    {
      id: "hertz-t11",
      q: "UNION versus UNION ALL — when is the dedupe step correct business logic on a counter packet, and when is it a silent bug?",
      a: "UNION ALL is raw concatenation — cheap, order-preserving, the honest default when branches are logically disjoint: returned agreements stacked under no-shows, this month's settlements beside last month's. UNION adds a distinct pass, and that pass is a business decision: correct when combining overlapping sources where a duplicated row would double-count, and a silent bug when duplicates are the signal — a double-ingested agreement row vanishing into the dedupe is an audit finding, not a convenience. The counter-packet failure mode is two branches emitting byte-identical rows (same market, same counts, no branch label): UNION collapses them, a market disappears, and nothing announces the loss. Default to UNION ALL and reach for UNION only when you can say which duplicated rows you are paying to collapse.",
      tag: "set-ops",
    },
    {
      id: "hertz-t12",
      q: "EXCEPT and INTERSECT — which fleet questions do they answer more honestly than a join?",
      a: "Diff and overlap questions. 'Which classes are in the new rate card but not the old one?' is SELECT class FROM new EXCEPT SELECT class FROM old — no join gymnastics, no fan-out, and the intent reads straight off the page. INTERSECT answers the mirror: families present in both the Q1 and Q2 agreement logs. Two discipline points: set operations deduplicate both inputs first, so EXCEPT silently collapses an internally duplicated feed — if duplicates are the anomaly you are hunting, the row-honest tool is the LEFT JOIN … IS NULL anti-join; and both sides must share column shape. The billing pod's never-settled memo is the cautionary tale: EXCEPT on invoice ids answers 'which ids', but the memo needs status and cents, which only the anti-join's full payload carries.",
      tag: "set-ops",
    },
    {
      id: "hertz-t13",
      q: "Your close query has grown to three folds and a rank. How do you stage it so the next analyst can read it?",
      a: "Name the stages with CTEs, in the order the memo thinks: monthly AS (the month fold), deltas AS (LAG over the folded months), then the outer SELECT that joins names and formats. Each CTE is one fold with one job, and the final query reads like the memo's sentence. The rules: never reference a stage before it is defined, test each stage by running it alone — the month fold should print 14 rows on this db before any LAG touches it — and keep formatting (ROUND, labels) at the edge, not buried in stage two. A derived table does the same job inline; the CTE's advantage is the name and the reuse. What does not survive review is a 40-line nested query whose stage two silently re-folds what stage one already folded.",
      tag: "ctes",
    },
    {
      id: "hertz-t14",
      q: "Where do conditional aggregates — FILTER (WHERE …) and SUM(CASE …) — beat writing separate queries on the counter board?",
      a: "Anywhere one scan must produce many lenses. The close-gate census is the clean example: COUNT(*) FILTER (WHERE status = 'delivered') prints 52 beside its shipped, pending and cancelled siblings, and 52 + 30 + 14 + 7 = 103 by construction — one scan, one identity, no drift. SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) computes the identical number and runs on every engine, which is why it stays the portable twin. The shared denominator is the real prize: no-show share built from sibling CASE branches cannot drift against the total, because the branches partition the same rows. Four separate queries pasted into one board lose that shared grain — and the numbers stop adding up on exactly the slide everyone screenshots.",
      tag: "case-when",
    },
    {
      id: "hertz-t15",
      q: "Your share metric divides no-shows by booked agreements. How do you keep it from blowing up or lying when the denominator can be zero or NULL?",
      a: "Guard the denominator explicitly. The zero case: NULLIF(denominator, 0) turns an empty market into a NULL share instead of a fake 100% or an error — and NULL renders as a gap the dashboard flags, which is the honest outcome for a market with no bookings. The NULL case: COUNT counts non-NULLs, so a denominator built from a nullable column shrinks silently — state the population (checked-out agreements only, 82 of 103) or the share wears the wrong name. What is never acceptable is COALESCE-ing the share to 0 to quiet the chart: zero says 'we booked and none no-showed', NULL says 'no denominator here', and the difference decides whether the reminder cadence moves. The follow-up is AVG of per-row shares versus a ratio of sums — the ratio of sums, weighted by the real denominators, is the answer.",
      tag: "nulls",
    },
    {
      id: "hertz-t16",
      q: "Rental duration and late fees — how do you compute them when check-in timestamps drift, and where does the boundary policy matter?",
      a: "Duration is JULIANDAY(check_in) - JULIANDAY(check_out): fractional days, so a 2.5-day rental is real, and CEIL to whole billable days per the rate card — a rental returned an hour past day three bills day four, unless the grace-period CASE says otherwise. The boundary policy matters at both ends: half-open windows (picked_up >= '2024-03-01' AND picked_up < '2024-04-01') keep the last night's returns in March, where BETWEEN silently drops them, and the month spine STRFTIME('%Y-%m', …) needs the year prefix or Januaries merge. The professional tell is stating the rounding and boundary rules before writing the WHERE clause — late-fee disputes are almost never arithmetic bugs, they are boundary bugs someone promised wouldn't exist.",
      tag: "dates",
    },
    {
      id: "hertz-t17",
      q: "A fleet-family card must show one family's classes as a single cell. How do you fold rows into a string without making the output order-dependent?",
      a: "GROUP_CONCAT is the fold: GROUP_CONCAT(name) over the family's class rows returns the comma-joined list. The discipline is ordering inside the fold — GROUP_CONCAT(name ORDER BY name) or by day rate — because without it the cell's order follows scan order and can flip between refreshes, which reads as a rate-card change when nothing changed. State the separator explicitly when the card spec cares, watch cell length on wide families, and remember the fold happens after grouping, so one row per family is what the outer query sees. The alternative — one row per class on the card — is a product decision, not a SQL one, and saying that out loud scores.",
      tag: "strings",
    },
    {
      id: "hertz-t18",
      q: "A staging load delivered 'Delivered' and 'DELIVERED' beside the canonical 'delivered', and a partner shows up twice as 'nordic gadgets ab' and 'Nordic Gadgets AB'. What is your normalization policy?",
      a: "Case drift splits populations: status = 'delivered' matches only the lowercase rows, so the one-pass census undercounts returned agreements and the 103-identity fails; the mixed-case partner name splits one fleet's book in two and the utilization read silently halves it. The policy is normalize-once-at-the-boundary: fold status literals with UPPER or an explicit CASE map into the closed four-value vocabulary, and canonicalize entity names before any join — LOWER(TRIM(name)) staged in a CTE, or a mapping table for the recurring offenders. Never normalize inside the comparison predicate query-by-query — that is how two reports disagree about the same rows. And keep the vocabulary closed: SELECT DISTINCT status after the load is the two-second check that the census will reconcile.",
      tag: "casing",
    },
    {
      id: "hertz-t19",
      q: "Your market census prints 45, 37, 19, 2 by region — how do you audit the grain before the revenue review sees it, and where do GROUP BY mistakes hide?",
      a: "Grain audit first: say what one row IS — 'one row per pickup market' — then prove the fold key matches: GROUP BY region on the joined renters-and-agreements table. Mistakes hide three places. A join that fans rows (agreement lines joined in) silently changes what COUNT(*) counts — 251 lines, not 103 agreements; a GROUP BY on a column missing from SELECT produces rows you cannot attribute; and grouping by a text column with drifted casing splits one group in two. The committee-facing check is the reconcile: the census must foot to 103 agreements over 16 renters, EU 45-from-8, US 19-from-2, APAC 37, LATAM 2 — and if a fifth bucket or a phantom total appears, the fold key moved. 'One row per what?' is the whole question, asked before and after the query runs.",
      tag: "groupby",
    },
    {
      id: "hertz-t20",
      q: "A correlated subquery finds agreements above their own renter's average. When is that the right tool, and when do you pre-fold instead?",
      a: "The correlated shape — WHERE total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) — answers 'big for THIS renter' and re-runs the inner fold once per outer row: 103 executions on this db, fine here, painful on a chain-wide table. The pre-fold alternative stages per-renter averages in a derived table or CTE, joins once, and compares at join grain — same answer, one fold, and the plan stays flat as the table grows. Reach for correlated when the inner fold is genuinely per-row and small, or when the predicate cannot be expressed as a join — top-1-per-group semantics. Reach for the pre-fold when the same fold is reused by several columns or the row count is real. And name the empty-inner behavior unprompted: a renter with one agreement has an average equal to that agreement, so they never beat their own average — the definition working, not a bug.",
      tag: "subqueries",
    },
    {
      id: "hertz-t21",
      q: "What makes a predicate sargable, and which habits keep a fleet-warehouse query cheap?",
      a: "Sargable means the predicate can use an index: it compares the bare column to a value. Wrapping the column in a function — STRFTIME('%Y-%m', created_at) = '2024-03' — forces a scan of every agreement row; the sargable twin is the half-open range created_at >= '2024-03-01' AND created_at < '2024-04-01', same rows, index-usable. The habits that compound: filter early inside each CTE so later stages carry fewer rows; name columns instead of SELECT *; probe with LIMIT before committing to the full run; and aggregate on the smallest table that answers the question rather than joining first and filtering after. At fleet scale these are not micro-optimizations — they are the difference between the utilization dashboard rendering before the counter opens and timing out while the market waits.",
      tag: "performance",
    },
    {
      id: "hertz-t22",
      q: "In the revenue review you are asked for 'our no-show rate'. What do you pin down before writing SQL?",
      a: "The definition, in writing, before the FROM clause. Four decisions: the event (bookings made, or bookings that survived to check-out?), the numerator (status = 'cancelled' — 7 on this db), the denominator (all 103 booked, or checked-out only — the two definitions disagree by construction), and the time window (calendar month, trailing quarter, lifetime?). Then the discipline move: encode the definition as a named CTE — no_shows AS (SELECT region, SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) …) — so the SQL IS the definition and the reviewer can audit it instead of arguing with you. The analyst who says 'no-show means cancelled bookings over all bookings, cancelled included in the base, trailing quarter' owns the room; the one who vibes a number re-queries it twice.",
      tag: "metrics",
    },
    {
      id: "hertz-t23",
      q: "Why is an average of averages wrong, and what do you compute instead — say, for regional AOV?",
      a: "Because it weights every group equally regardless of size. On this book the regional AOVs are EU 335.32 (45 agreements), APAC 313.66 (37), US 383.48 (19) and LATAM 426.22 (2) — averaging those four numbers gives 364.67, which describes a counter that does not exist. The true all-agreements AOV is SUM(total)/COUNT(*) over the base rows: 338.19, where LATAM's two contracts barely register. The honest blends are re-aggregation from the base (sum the numerators, divide by the summed denominators) or a weighted average — SUM(aov * n)/SUM(n) — the same arithmetic one level up. The interview move is saying WHERE the weighting lives: an average of averages is only correct when every group has equal counts, and that is a claim you should have to defend, not assume.",
      tag: "aggregation",
    },
    {
      id: "hertz-t24",
      q: "Walk me through the logical evaluation order of a SELECT — and name the bug each stage explains.",
      a: "FROM and JOIN assemble rows; WHERE filters them; GROUP BY folds them; HAVING filters the groups; SELECT computes the output expressions including window functions; ORDER BY sorts; LIMIT cuts. Every classic screen bug is a stage violation: an alias from SELECT referenced in WHERE (it does not exist yet), an aggregate like COUNT(*) in WHERE (groups do not exist yet), a filter on RANK() or LAG() output in WHERE (windows run in SELECT — wrap the query), and the flip side that ORDER BY CAN use SELECT aliases because it runs after them. Half of all 'weird database behavior' complaints at the counter are correct pipeline order meeting wishful thinking. Saying the order out loud before writing is the cheapest debugging tool an analyst has, and it is exactly the narration the interviewer is listening for.",
      tag: "pipeline",
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
    {
      id: "hertz-mcq-11",
      prompt: "STRFTIME('%m', created_at) buckets the rotation trend into 12 rows instead of 14. What got lost?",
      choices: ["Nothing — 12 is the correct bucket count", "The year: January 2024 and January 2025 merged into one '01' bucket", "Two months had no agreements and were dropped", "The buckets are weeks, not months"],
      answer: 1,
      why: "'%m' keeps month only; '%Y-%m' keeps the year prefix and yields the true 14 buckets from 2024-01 to 2025-02. The merged January doubles its booked value and the rotation trend becomes fiction.",
      notes: [
        { choice: 0, why: "Every month in the window carries agreements — the bug is label collision, not empty months. COUNT(DISTINCT STRFTIME('%Y-%m', created_at)) = 14 is the check." },
        { choice: 2, why: "'%m' is still a month token — the collision is with LAST year's same month, which is worse than a wrong grain because it looks plausible." },
      ],
      difficulty: "easy",
    },
    {
      id: "hertz-mcq-12",
      prompt: "The quarter memo says 'Q1 only': WHERE created_at BETWEEN '2024-03-01' AND '2024-03-31'. What is wrong?",
      choices: ["It drops March 31 after midnight — use created_at >= '2024-03-01' AND created_at < '2024-04-01'", "Nothing — BETWEEN is inclusive on both ends", "BETWEEN cannot compare TEXT dates", "It double-counts the first day"],
      answer: 0,
      why: "The upper bound '2024-03-31' excludes same-day later timestamps like '2024-03-31 21:40' — the last night's check-outs and returns, exactly when holiday traffic lands. Half-open intervals keep the boundary and compose month to month.",
      notes: [
        { choice: 1, why: "BETWEEN IS inclusive of both endpoints — which is the bug: inclusivity of a date-only string cuts the date's own evening." },
        { choice: 2, why: "ISO-8601 TEXT dates compare correctly lexicographically — that is why the format is a contract." },
      ],
      difficulty: "easy",
    },
    {
      id: "hertz-mcq-13",
      prompt: "The ops board needs returned, on-rent, reserved and no-show in one pass over orders. Which column set does it in a single scan?",
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
      id: "hertz-mcq-14",
      prompt: "The fleet-family card shows one family's classes as 'Sedan, SUV, Premium SUV'. Which fold prints that from the products table?",
      choices: ["GROUP_CONCAT(name) over the family's class rows", "CONCAT(name) with no GROUP BY", "SUM(name)", "JOIN name INTO one cell"],
      answer: 0,
      why: "GROUP_CONCAT folds many rows into one string cell with a comma as the default separator — ORDER BY inside keeps the class list stable across refreshes.",
      notes: [
        { choice: 1, why: "Without the aggregate fold there is nothing to concatenate — SQLite's CONCAT joins a fixed argument list, not a column's rows." },
        { choice: 2, why: "SUM is for numbers; on text SQLite coerces every row to 0 and prints 0. The classic wrong-tool tell." },
      ],
      difficulty: "easy",
    },
    {
      id: "hertz-mcq-15",
      prompt: "Day-rate bands: CASE WHEN unit_price >= 150 THEN 'flagship' WHEN unit_price >= 60 THEN 'mid' END. What returns for the 14.99 shuttle class, and what does that do to the band census?",
      choices: ["NULL — no arm matches and there is no ELSE, so the class vanishes from every band total", "'economy' — the default arm catches it", "0 — SQLite coerces a failed CASE to zero", "An error — CASE requires ELSE"],
      answer: 0,
      why: "A CASE with no ELSE yields NULL on fall-through: the cheap classes drop out of the band P&L and the bands stop reconciling to the rate card's 8-mid / 8-value split. Exhaustive arms are the class-census contract.",
      notes: [
        { choice: 1, why: "There is no default arm in SQL CASE — the ELSE clause must be written, or the fall-through is NULL." },
        { choice: 2, why: "CASE never coerces to 0 — the NULL flows into the group silently, which is exactly why the hole is dangerous." },
      ],
      difficulty: "medium",
    },
    {
      id: "hertz-mcq-16",
      prompt: "A close packet stacks returned agreements under no-show agreements in one layout, built with UNION. A reviewer says one market's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same market, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same market, same counts, no branch label — collapse into one, and the packet loses a market with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "hertz-mcq-17",
      prompt: "A dashboard walks the book contract by contract: SUM(total) OVER (ORDER BY created_at). Two check-outs share a booking second, and the cumulative 'jumps two agreements at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict contract-by-contract walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at agreement grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "hertz-mcq-18",
      prompt: "LAG(total) OVER (PARTITION BY customer_id ORDER BY created_at) reads NULL on a renter's first agreement. The analyst COALESCEs it to 0 to clean the report. What breaks?",
      choices: ["The first agreement now reads as a jump from a zero prior contract — every renter's real first-booking movement becomes fiction", "Nothing — NULL arithmetic needs a default", "The partition collapses to one row", "LAG stops working after COALESCE"],
      answer: 0,
      why: "NULL here means 'baseline — no prior agreement', not zero. Coalesced, the top renter's trend opens with a fake total-minus-zero spike on agreement one, and all 16 renter baselines lie the same way.",
      notes: [
        { choice: 1, why: "A default can be legitimate when the business says so — the mistake is making it silently in a cleanup step." },
        { choice: 2, why: "Partitions are untouched; the damage is interpretive, in the column's meaning." },
      ],
      difficulty: "medium",
    },
    {
      id: "hertz-mcq-19",
      prompt: "Attach the grand book total to every agreement: SUM(total) OVER (). Later the analyst joins order_items in for a per-line report. What happens to the grand total?",
      choices: ["It fans out — the window now sums over the joined rows, so the 251 agreement lines double-count every contract in the 'grand' figure", "It stays 34,833.28 — windows are join-proof", "It becomes NULL on line rows", "It halves"],
      answer: 0,
      why: "Window functions run over the row set in front of them — after the fan-out to 251 lines, SUM(total) OVER () double-counts agreements exactly like any join-fan-out aggregate. Compute the grand total pre-join, in a CTE.",
      notes: [
        { choice: 1, why: "No construct is join-proof — the window sees whatever rows the FROM produces. Grain discipline is the analyst's job." },
        { choice: 2, why: "Nothing NULLs out — the inflated total repeats on every line row, which is worse: it looks authoritative." },
      ],
      difficulty: "hard",
    },
    {
      id: "hertz-mcq-20",
      prompt: "SELECT id, total, total - (SELECT AVG(total) FROM orders) AS gap FROM orders — how many times does the inner AVG run?",
      choices: ["Once — the subquery is uncorrelated, so 338.19 computes once and every row reuses it", "Once per agreement — 103 executions", "Once per market", "Zero — SQLite rewrites it into a JOIN"],
      answer: 0,
      why: "Nothing inside the subquery references the outer row, so it is uncorrelated: one evaluation, and gap reads every agreement against the 338.19 book average.",
      notes: [
        { choice: 1, why: "That is the CORRELATED shape — reference o.customer_id inside and the inner fold re-runs per row. Cost and meaning both change." },
        { choice: 2, why: "No group boundaries exist here — the subquery never sees the outer query, so it cannot re-run per market." },
      ],
      difficulty: "medium",
    },
    {
      id: "hertz-mcq-21",
      prompt: "Find agreements whose value beats their OWN renter's lifetime average. Which shape is right?",
      choices: ["WHERE total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)", "WHERE total > (SELECT AVG(total) FROM orders)", "WHERE total > AVG(total)", "HAVING total > AVG(total)"],
      answer: 0,
      why: "The inner query references the outer row's customer_id — correlated, re-evaluated per agreement, answering 'big for THIS renter'. That is a different population from 'big for the book'.",
      notes: [
        { choice: 1, why: "The uncorrelated version flags agreements above the whole-book 338.19 — plausible output, wrong question." },
        { choice: 2, why: "An aggregate cannot sit naked in WHERE — it errors. Aggregates live in HAVING or inside a subquery." },
      ],
      difficulty: "medium",
    },
    {
      id: "hertz-mcq-22",
      prompt: "The rotation read stages as WITH class_load AS (SELECT … SUM(…) …) SELECT … — what does the CTE actually buy?",
      choices: ["A named staging step the outer query can join — same result as a derived table, easier to read and reference twice", "Guaranteed faster execution", "It caches the result for later sessions", "It replaces the need for GROUP BY"],
      answer: 0,
      why: "A CTE names an intermediate fold you can join once or twice without repeating the subquery. The win is legibility and reuse — the family census reads as two named stages, not one nested maze.",
      notes: [
        { choice: 1, why: "Performance is an engine detail — SQLite may inline or materialize; correctness is identical either way." },
        { choice: 2, why: "A CTE lives for the duration of the statement only — nothing persists for later sessions." },
      ],
      difficulty: "easy",
    },
    {
      id: "hertz-mcq-23",
      prompt: "The loyalty desk asks for the top 5 renters by agreement count: ORDER BY COUNT(*) DESC LIMIT 5. What lands in the fifth slot?",
      choices: ["The tie at 4 agreements gets cut arbitrarily — which renters make the cut is engine luck, not policy", "All four tied renters always appear", "An error — LIMIT cannot follow an aggregate", "The query returns 8 rows to keep the ties"],
      answer: 0,
      why: "LIMIT slices rows after ordering with no tie awareness — the ladder above the tie is 24, 17, 14, 13, 5, so the cut lands above the tie here, but one rename of 'top 6' drops it into the 4-agreement block and three of four tied renters make it on internal order. An upgrade-certificate list built this way is a coin flip.",
      notes: [
        { choice: 1, why: "LIMIT never expands to keep ties — that is RANK() plus a rank filter's behavior, a different query." },
        { choice: 2, why: "LIMIT follows aggregation fine; the problem is which rows win, not whether the clause parses." },
      ],
      difficulty: "medium",
    },
    {
      id: "hertz-mcq-24",
      prompt: "Never-settled invoices: LEFT JOIN payments … WHERE p.id IS NULL, versus EXCEPT on invoice ids. What does EXCEPT lose here?",
      choices: ["The invoice columns — EXCEPT compares shaped rows from both sides, so bare ids answer 'which ids', not 'which invoices with status and cents'", "Nothing — the two are identical", "EXCEPT keeps the settled ones", "NULLs — EXCEPT cannot compare NULL"],
      answer: 0,
      why: "EXCEPT needs both SELECTs shaped identically and returns only the columns projected — ids alone, unless every column is padded on both sides. The LEFT JOIN anti-join keeps the full invoice row: status, cents, number.",
      notes: [
        { choice: 1, why: "Same six ids, different payload — and the dunning memo needs the 15,217 fold, which bare ids cannot carry." },
        { choice: 3, why: "Set operations treat NULLs as equal to each other — not the loss here." },
      ],
      difficulty: "hard",
    },
    {
      id: "hertz-mcq-25",
      prompt: "Check-out telemetry retries, so an agreement can carry two stamp rows. Page 2 of ORDER BY created_at DESC LIMIT 10 OFFSET 10 keeps duplicating one agreement across pages. Fix?",
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
      id: "hertz-mcq-26",
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
      id: "hertz-mcq-27",
      prompt: "SELECT DISTINCT status FROM orders returns how many rows, and why does the number matter to the counter census?",
      choices: ["4 — delivered, shipped, pending, cancelled; the closed vocabulary every census must reconcile to", "103 — one per agreement", "3 — pending is not a real status", "It depends on ORDER BY"],
      answer: 0,
      why: "The status vocabulary is exactly four values. A census printing a fifth means staging contamination; one missing means the 103-identity fails — DISTINCT is the cheapest integrity check in the kit.",
      notes: [
        { choice: 1, why: "DISTINCT folds the 103 agreement rows down to the vocabulary — that is the point of the check." },
        { choice: 2, why: "Pending IS the reserved stage — 14 agreements of it. Deleting it from the vocabulary deletes a funnel stage." },
      ],
      difficulty: "easy",
    },
    {
      id: "hertz-mcq-28",
      prompt: "The booking-ahead SLA reads in hours, not days. Which expression converts the booking-to-check-out window?",
      choices: ["(JULIANDAY(shipped_at) - JULIANDAY(created_at)) * 24", "JULIANDAY(shipped_at - created_at)", "STRFTIME('%H', shipped_at) - STRFTIME('%H', created_at)", "DATEDIFF('hour', created_at, shipped_at)"],
      answer: 0,
      why: "JULIANDAY returns fractional days, so the difference is a real number of days — ×24 gives hours. The 2.98-day average becomes ~71.5 hours on the checked-out agreements.",
      notes: [
        { choice: 1, why: "JULIANDAY takes one timestamp — subtracting two TEXT strings first is string arithmetic, not a date difference." },
        { choice: 2, why: "'%H' strips the date: a 2-day window reads as hour-of-day nonsense like 21 − 9." },
      ],
      difficulty: "medium",
    },
    {
      id: "hertz-mcq-29",
      prompt: "Regional AOVs print EU 335.32 (45 agreements), APAC 313.66 (37), US 383.48 (19), LATAM 426.22 (2). Averaging the four numbers gives 364.67 — but the true book AOV is 338.19. Why the gap?",
      choices: ["The average of averages weights LATAM's 2 agreements as heavily as EU's 45; the true figure re-divides SUM(total) by all 103", "Rounding drift accumulated across the four regions", "The true figure excludes cancelled agreements", "LATAM's AOV is an outlier and should be trimmed first"],
      answer: 0,
      why: "An average of averages weights every group equally regardless of size. Re-aggregate from the base — SUM(total)/COUNT(*) over 103 agreements — and LATAM's two contracts barely register: 338.19, not 364.67. The weighted blend SUM(aov * n)/SUM(n) lands on the same number.",
      notes: [
        { choice: 1, why: "The regions' AOVs are already rounded — but rounding is cents-level noise; the 26.48 gap is a weighting artifact, not precision loss." },
        { choice: 2, why: "Cancellation policy changes the population, not the weighting — with the same base both methods still disagree." },
      ],
      difficulty: "hard",
    },
    {
      id: "hertz-mcq-30",
      prompt: "Returned agreements per market for markets with at least ten agreements: WHERE status = 'delivered' and HAVING COUNT(*) >= 10. Why can't both filters live in the same clause?",
      choices: ["The status rule filters ROWS before grouping; the ten-agreement floor judges GROUPS after it — different stages of the pipeline", "They can — just write HAVING status = 'delivered' AND COUNT(*) >= 10", "The floor belongs in WHERE because it is a number", "Both belong in HAVING; WHERE is only for joins"],
      answer: 0,
      why: "WHERE runs before GROUP BY — it discards on-rent, reserved and no-show rows while statuses still exist per row. HAVING runs after the fold, when COUNT(*) exists and statuses do not. On this db the floor keeps EU (45), APAC (37) and the US (19); LATAM's 2 drops out.",
      notes: [
        { choice: 1, why: "HAVING status = 'delivered' references a column that no longer exists per group — the engine rejects it, and the rejection is the pipeline-order lesson." },
        { choice: 2, why: "A number that materializes only at the fold can never be a WHERE fact — there are no counts before groups form." },
      ],
      difficulty: "medium",
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
    {
      id: "cs-hertz-3",
      tier: "medium",
      topic: "s6",
      universe: "month-close",
      title: "The settlement coverage ledger",
      brief:
        "Hertz-flavored brief on the storefront db: before the dunning draft goes out, billing classifies every rental invoice by settlement coverage — 'exact' (settled in full), 'partial' (money in, short), 'no settlement' (nothing behind it). Probed on the storefront db: 28 invoices, of which 21 settle exact, 6 carry no settlement rows ($15,217 — including the paid-status anomaly #28 at $1,756.00) and 1 sits partial ($6,148 billed, $4,000 settled). Five invoices settle in two legs, so the settled fold must SUM before it compares. Amounts live in the db as INTEGER cents; this ledger prints dollars.",
      ask: "Return one row per invoice: number, status, billed dollars, settled dollars, and the coverage class.",
      template:
        "SELECT i.number,\n       i.status,\n       ROUND(i.amount_cents / {4}, 2) AS billed,\n       ROUND({1}(p.amount_cents) / 100.0, 2) AS settled,\n       CASE\n         WHEN COUNT(p.id) = 0 THEN 'no settlement'\n         WHEN SUM(p.amount_cents) = i.amount_cents THEN 'exact'\n         ELSE {2}\n       END AS coverage\nFROM invoices i\n{3} JOIN payments p ON p.invoice_id = i.id\nGROUP BY i.id, i.number, i.status, i.amount_cents\nORDER BY coverage, billed DESC;",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the settled fold",
          why: "SUM folds each invoice's settlement rows into settled cents — split settlements pay in two legs and must add up to the bill. COUNT would return a leg count (0, 1 or 2) wearing a dollars name and flip every split invoice to the wrong class.",
        },
        {
          answer: "'partial'",
          kind: "keyword",
          label: "the short-settlement label",
          why: "The ELSE branch is the bucket that catches money-in-but-short — invoice #25 at 4,000 of 6,148. Labeling it anything else (or 'exact') folds the one genuinely short invoice into a clean bucket and the close overstates settled AR.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the invoice-preserving join",
          why: "LEFT JOIN keeps all 28 invoices, handing the 6 with no settlements a NULL payload that COUNT(p.id) = 0 catches. INNER JOIN silently deletes those 6 rows — including anomaly #28, the paid invoice with no settlements that this ledger exists to expose.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Invoices are INTEGER cents, so the dollar read is amount_cents / 100.0 — #28 prints 1,756.00. Divide by 10.0 and every exposure inflates ten-fold; a bare integer 100 truncates odd-cent rows and the footing drifts by cents.",
        },
      ],
      distractors: ["COUNT", "INNER", "exact", "10.0"],
      walkthrough:
        "A classification pass at invoice grain. The LEFT JOIN keeps every invoice: 22 match settlement rows, 6 arrive with a NULL payload. GROUP BY i.id folds each invoice's settlements — including the five split-settlement invoices whose two legs must SUM to the billed cents — and the CASE reads like the policy: no settlement rows → 'no settlement' (6 invoices, $15,217, anomaly #28 among them); settlements equal the bill → 'exact' (21 invoices); anything else → 'partial' (exactly one: $6,148 billed, $4,000 settled). Swap SUM for COUNT and the settled column becomes a leg count that can never equal the bill, flipping split invoices to partial; INNER JOIN deletes the six no-settlement rows — the anomaly included; a different ELSE label quietly rebrands the short invoice; 10.0 in the cents slot prints $49,370 where $4,937 belongs. One query, three buckets, and the dunning draft can defend every row.",
    },
    {
      id: "cs-hertz-4",
      tier: "hard",
      topic: "t6",
      universe: "inventory",
      title: "The family workhorse scan",
      brief:
        "Hertz-flavored brief on the storefront db: revenue management tiers the fleet by workload WITHIN each fleet family — the workhorse tier is classes turning 30 or more rental days in the window, ranked inside their family so every family's hardest worker reads first. Probed on the storefront db: 16 classes across 7 families turn 498 rental days over 251 lines; the widest family turns 121 days across 3 classes (47 / 38 / 36), the money family's headset-class runs 46 days on a 60-unit pool, and the single-class tail family turns just 27 — below the tier line, off the scan. Ten classes make the cut; the scan reads family by family, rank 1 first.",
      ask: "Return each class turning 30+ rental days with its family, rental days, rotation pool, and its rank WITHIN the family, hardest-working first per family.",
      template:
        "WITH class_load AS (\n  SELECT p.category AS fleet_family,\n         p.name AS vehicle_class,\n         p.stock AS pool,\n         SUM(oi.quantity) AS rental_days\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.id\n)\nSELECT fleet_family,\n       vehicle_class,\n       rental_days,\n       pool,\n       RANK() OVER (PARTITION BY fleet_family ORDER BY rental_days {1}) AS family_rank\nFROM class_load\nWHERE rental_days >= {2}\nORDER BY fleet_family, family_rank {3};",
      slots: [
        {
          answer: "DESC",
          kind: "keyword",
          label: "the hardest-working-first direction",
          why: "The workhorse is the class turning the MOST days, so the window ranks rental_days descending inside each family — 47, 38, 36 in the widest family. ASC would crown each family's laziest class as rank 1, a correct query aimed at the wrong end of the lot.",
        },
        {
          answer: "30",
          kind: "number",
          label: "the workhorse floor",
          why: "Thirty or more rental days keeps exactly ten of the sixteen classes — the tier revenue management reads. Twenty sweeps all 16 classes in (the laziest class still turns 21), and 35 drops the tier to five, losing the 30/31-day boundary classes the memo quotes.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the rank-1-first presentation",
          why: "Within each family the rows must read rank 1, 2, 3 — hardest worker on top. DESC would print each family's tail classes first, and the review would open on the rotation slack instead of the workload.",
        },
      ],
      distractors: ["ASC", "20", "35", "SUM"],
      walkthrough:
        "Two stages: fold the fleet to classes, then rank within families. The CTE joins agreement lines to their classes and folds line quantity — rental days — per class: 16 rows from 498 days. The outer query keeps the workhorse tier with WHERE rental_days >= 30 (ten classes survive; the single-class family at 27 days falls off) and ranks with RANK() OVER (PARTITION BY fleet_family ORDER BY rental_days DESC) — the PARTITION BY is the whole point: each family's ladder starts at 1, so the widest family reads 47 / 38 / 36 as ranks 1-2-3, the money family's 46-day headset takes rank 1 on its 60-unit pool, and single-member families read a lonely rank 1. The distractors each break differently: ASC in the rank direction crowns the laziest class per family; 20 floods the scan with all 16 classes and 35 amputates it to five; ASC in the presentation slot prints every family's slack first; SUM anywhere in those slots is an aggregate where a column belongs and the engine refuses. The read: workload concentrates — ten classes carry the tier line, and two families own the top of every ladder they appear in.",
    },
    {
      id: "cs-hertz-5",
      tier: "easy",
      topic: "j5",
      universe: "refund-audit",
      title: "The never-settled anti-join",
      brief:
        "Hertz-flavored brief on the storefront db: before billing sends a single fuel-and-fees statement, the billing pod refreshes the anti-join — every invoice with NO settlement rows behind it, dollars to 2 decimals, biggest exposure first. Probed facts: the anti-join returns 6 invoices worth 15,217 — #24 tops the list at 4,937.00, #26 at 3,562.00, #27 at 2,794.00, #21 at 1,295.00, #18 at 873.00 — and the one the meeting is about: #28, printed 1,756.00, whose status column claims 'paid' over zero settlement rows. Payment rows are the ledger of record; the status column is a claim. The list reads biggest exposure first.",
      ask: "Return each never-settled invoice with its id, number, status, billed amount in dollars to 2 decimals, and its settlement-leg count.",
      template:
        "SELECT i.id,\n       i.number,\n       i.status,\n       ROUND(i.amount_cents / {1}, 2) AS billed,\n       COUNT(p.id) AS settlement_legs\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.id\nWHERE {2}\nGROUP BY i.id, i.number, i.status, i.amount_cents\nORDER BY {3} DESC;",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Invoices are INTEGER cents, so the dollar read is amount_cents / 100.0 — #28 prints 1,756.00. Divide by 10.0 and every exposure inflates ten-fold (4,937 becomes 49,370); a bare integer 100 truncates odd-cent rows.",
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
      distractors: ["10.0", "p.id IS NOT NULL", "i.id IS NULL", "i.status"],
      walkthrough:
        "One LEFT JOIN, one NULL predicate, one cents rule. The join walks invoices against their settlements — five invoices settle in two legs, so the payments side fans — and COUNT(p.id) counts legs honestly: zero for the six the memo is about. The WHERE keeps only the rows where the join found nothing: p.id IS NULL, the six never-settled invoices. The dollars come from amount_cents / 100.0, ROUNDed once: 4,937.00, 3,562.00, 2,794.00, 1,756.00, 1,295.00, 873.00 — footing to the 15,217 the memo quotes. The predicate is the whole query: flip it to IS NOT NULL and the settled twenty-two walk in; ask for i.id IS NULL and the list empties because an invoice's own id is never NULL. The distractors each break differently: 10.0 inflates every exposure ten-fold and the footing dies; i.status in the sort trusts the claim column — 'paid' #28 tops the list on exactly the lie the audit exists to catch. The read: #28 is not a collections problem, it is a status-sync incident — settlement rows say never settled, the status column says paid, and the reconciliation reflex is to trust the ledger of record and file the anomaly.",
    },
    {
      id: "cs-hertz-6",
      tier: "medium",
      topic: "x3",
      universe: "expense",
      title: "The fixed-cost stack",
      brief:
        "Spend-report brief, in-world: the ops partner wants the fixed-cost lines (lot leases under Rent, demand-gen under Ads) pulled out of the expense ledger with a grand TOTAL row underneath — one query, one stack, no spreadsheet math. Probed on the storefront db: 36 expenses totaling $25,416; Rent runs 14 entries for $16,800 and Ads 14 for $4,570, so the two fixed lines carry $21,370 of the $25,416 (84.0%) — the airport-concession and demand-gen conversation the revenue review opens with. Finance stores expenses as integer cents, and the TOTAL branch must scan the unfiltered ledger.",
      ask: "Return entries and dollars per fixed-cost category, plus a labelled TOTAL row for the whole ledger.",
      template:
        "SELECT category, COUNT(*) AS entries, ROUND(SUM(amount_cents) / 100.0, 2) AS spend\nFROM expenses\nWHERE category {1} ('Rent', 'Ads')\nGROUP BY category\n{2}\nSELECT 'TOTAL', {3}, ROUND(SUM(amount_cents) / 100.0, 2)\nFROM expenses\nORDER BY spend DESC;",
      slots: [
        {
          answer: "IN",
          kind: "keyword",
          label: "the fixed-cost filter",
          why: "IN ('Rent','Ads') keeps exactly the two fixed lines — 28 of the 36 entries. NOT IN would flip the report to Travel and Tools, the program spend the stakeholder explicitly excluded from this memo.",
        },
        {
          answer: "UNION ALL",
          kind: "keyword",
          label: "the stacker",
          why: "UNION ALL concatenates the TOTAL branch onto the category rows without a dedupe pass — the honest stack for a report where every row belongs. A bare UNION adds a distinct sort for nothing, and EXCEPT would return only the detail rows, dropping the TOTAL the ask requires.",
        },
        {
          answer: "36",
          kind: "number",
          label: "the all-in entry count",
          why: "The TOTAL row must count the whole ledger — 36 expense entries, not the filtered 28 — because its dollars column ($25,416) is the unfiltered grand total. Pinning the count keeps the row honest even if the detail filter upstream changes.",
        },
      ],
      distractors: ["NOT IN", "EXCEPT", "14", "MAX(amount_cents)"],
      walkthrough:
        "Two branches, one stack. The detail branch filters to the fixed-cost pair with IN and GROUP BY category folds 28 entries into two rows — Rent 14/$16,800 (lot and concession leases) and Ads 14/$4,570 (demand generation). The TOTAL branch re-scans the unfiltered expenses table: 36 entries and $25,416, so the report shows the fixed lines against the whole ledger ($21,370 fixed = 84.0% of fleet opex) without a second query. UNION ALL is the join between grains — no dedupe, and the outer ORDER BY spend DESC floats the TOTAL row ($25,416.00) to the top. NOT IN serves the program spend instead of the fixed costs; 14 in the TOTAL slot would undercount entries to a single category's worth; MAX(amount_cents) puts the largest single bill in the entries column; EXCEPT returns only the detail rows and quietly deletes the TOTAL. Every distractor breaks a different promise of the memo.",
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
    { slug: "repeat-purchase-rate", why: "The repeat-renter read: share of renters with 2+ agreements in a window — the compounding habit behind the Gold Plus ladder and the 63.5% concentration stat." },
    { slug: "rfm-segmentation", why: "Recency-frequency-monetary bands per renter — the tiering engine the loyalty desk wants when 'Gold' needs edges, not vibes: CASE bands over a folded book." },
    { slug: "cohort-retention-matrix", why: "Retention by first-rental cohort — which signup vintage comes back to the counter, read as a matrix rather than a headline. The demand-forecast input fleet ops never says out loud." },
    { slug: "restaurant-growth", why: "Rolling 7-day booked value — the same moving-frame muscle as the weekly utilization trend revenue management opens every Monday call with." },
    { slug: "year-on-year-growth-rate", why: "Class demand this year against last — the fleet-buying input. YoY at class grain exposes which families are earning their rotation pool and which are parking it." },
    { slug: "ar-aging-schedule", why: "Never-settled invoices bucketed by age — the dunning ladder billing walks before any fuel-and-fees statement goes out, straight off the 15,217 exposure." },
    { slug: "prepayment-detection", why: "Prepaid versus pay-at-counter — the cash-flow split that decides which reservations get a guarantee and which get a reminder, via set algebra over the payment rails." },
    { slug: "generate-the-invoice", why: "Fold agreement lines into one invoice per contract — the billing grain change (lines → invoice) that mirrors lines → agreements everywhere else in this kit." },
    { slug: "calculate-product-final-price", why: "Base day rate plus fees to a final line price — fuel, late fees and the surcharge CASE layered on without breaking the cents math." },
    { slug: "products-price-for-each-store", why: "Day rate per class per market — the rate-card read that feeds the banding CASE and the market-level revenue forecast." },
    { slug: "bikes-last-time-used", why: "Last check-out per unit — the 'when did this car last rotate' query that finds the dead weight sitting on the lot between rotations." },
    { slug: "flight-occupancy-and-waitlist-analysis", why: "Occupancy against a waitlist — utilization and unmet demand in one query, the exact pairing fleet ops reads when sizing the rotation pool." },
    { slug: "hopper-company-queries-i", why: "Supply-side availability: units available versus dropped demand — the fleet-partner question restated in this kit's pool vocabulary, with the denominator guarded." },
    { slug: "sales-by-day-of-the-week", why: "Agreement volume by weekday — the counter-staffing pivot; CASE columns in, ready-line rota out." },
    { slug: "spend-histogram", why: "Renter spend bands with every bin printed — the histogram discipline behind the 25.47-to-1,088.44 spread read, empty bands included." },
    { slug: "calculate-parking-fees-and-duration", why: "Duration banded and fee'd — rental days computed, rounded and charged per the rate card; the late-fee dispute query in miniature." },
  ],
};
