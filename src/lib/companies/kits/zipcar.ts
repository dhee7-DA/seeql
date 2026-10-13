// Zipcar — Wave-8 (Task 96), mobility domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Round-trip car sharing SQL: the storefront db read as a fleet-and-members sandbox — customers are
// members, orders are reservations (delivered = completed round trip, shipped = underway with
// shipped_at as the fob-checkout stamp, pending = reserved and upcoming, cancelled = no-show),
// order_items are the billable lines on each reservation (quantity = billable hours, unit_price =
// the hourly rate), products = vehicle models (stock = cars of that model in the fleet), suppliers =
// fleet partners, and invoices/payments are the fleet-billing books (INTEGER cents — divide by
// 100.0). Pool provenance: company-pools.md carries NO Zipcar section — 0 tagged rows — so all 10
// topic slug sets and all 16 problems are theme-curated from the pools file's Theme menu (sql rows
// only; no write/schema/finance-band rows) and say so. Case briefs quote probed figures from
// scripts/company-facts.md (probed 2026-10-12); every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const zipcarKit: CompanyKit = {
  id: "zipcar",
  domainId: "mobility",
  name: "Zipcar",
  tagline: "Round-trip car sharing, reservation to key fob",
  accent: "text-blue-300",

  brief: [
    "**Zipcar** is the company that normalized *cars that live in your neighborhood, rented by the hour* — reserve online, unlock with the **Zipcard** at the pod, drive with fuel and insurance baked into the rate, and return to the same spot. The whole business is utilization per parking spot: a car earning nothing while parked is the loss, so every number the company manages is a conditional count over reservations. This kit maps the storefront db onto that world: the 16 customers rows are members, the 103 orders are reservations worth **34,833.28**, the 251 order_items rows are billable lines (quantity = hours, unit_price = the hourly rate), and the 16 products are vehicle models stocked from 6 fleet partners. The status map is fixed: delivered = {emerald:completed} (52, 50.5%), shipped = underway (30, 29.1%), pending = reserved and upcoming (14), cancelled = {rose:no-show} (7, 6.8%).",
    "The data org splits into city pods, fleet ops, monetization (the {violet:university and business plans}) and a small billing pod, and they all read the same reservation spine at different grains. A reservation books at created_at and `shipped_at` is stamped the moment a member fobs the car open — **82 of 103 reservations** carry the stamp, averaging **2.98 days** of booking-ahead with a 2–4 day spread, and the 14 pending rows have none yet (a population definition, not a cleanup job). Money sits one layer down: invoices and payments in INTEGER cents, where the dollar read is amount_cents / 100.0. Concentration is the third story: **63.5%** of the book comes from members whose lifetime spend crosses 3,000 (71.2% above 2,000) — one heavy member moves a pod's month.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain pod census** — EU runs 45 reservations from just 8 members while the US runs 19 from 2 — then escalates into a rate where the interviewer asks the denominator question out loud (*'does a no-show count in your base?'*), then into the utilization leaderboard where the ladder runs 24, 17, 14, 13, 5 and FOUR members sit tied at 4, so rank semantics become a business decision about who gets the win-back visit. Late rounds walk the {sky:14-month reservation spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Zipcar section — zero tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: reservation funnels, two-grain pod censuses, tie-heavy utilization ladders, plan-band CASE and the cents-safe billing spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:fleet-partner audit} fleet ops opens the quarter with, the other rebuilds the {sky:settlement coverage census} the billing pod closes every month with. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:30 —** The day starts with the reservation feed and the fob-stamp audit. A pod analyst opens the utilization dashboard before standup: did overnight bookings land, does any reservation show a checkout stamp while status still reads pending, does the one-pass status census reconcile — 52 completed + 30 underway + 14 reserved + 7 no-show = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If booking-ahead drifts off the **2.98-day** norm, the upcoming-reservation queue gets pulled before the fleet-repositioning sync — *a car in the wrong pod is a car earning nothing*.",
    "**11:30 —** Midday is the pod read. City ops wants the two-grain census — EU 45 reservations from 8 members against the US's 19 from 2 — beside the utilization leaderboard, where the four members tied at 4 reservations need a named tie policy; fleet ops wants the partner model census for the quarterly distribution review; and every fuel-card or extra-hour event is an `order_items` row, so *joining a reservation total to that table fans the sum out* — the trap half of this town's queries die in. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the ops-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The settlement coverage refreshes first — **21 exact, 1 partial** (4,000 of 6,148 settled) — before billing sends a single dunning notice for the **6 never-settled invoices worth 15,217**; then the anomaly list gets walked line by line: a void-but-settled invoice (#11, 925.00) and a paid-status invoice with zero settlement rows (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Pod utilization", what: "Reservations per member per pod: the ladder runs 24, 17, 14, 13, 5 and then four members tied at 4; EU books 45 reservations from 8 members while the US books 19 from 2. Load versus coverage, read every Monday — it decides which pods gain cars." },
    { name: "Booking-ahead window", what: "created_at to fob checkout over stamped reservations only: 82 of 103, averaging 2.98 days with a 2–4 day spread. The fleet-repositioning input — repositioning lead time has to beat the booking-ahead window or the car is not there." },
    { name: "Round-trip completion", what: "Delivered ÷ ALL reservations booked: 52 of 103 (50.5%), with 30 more underway (29.1%). The denominator includes the 14 upcoming and 7 no-shows — 'completed share of everything booked' is the whole interview." },
    { name: "No-show share", what: "Cancelled ÷ booked: 7 of 103 (6.8%), sliced by pod — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The number that prices the unused-reservation fee and sizes the reminder cadence." },
    { name: "Reservation book", what: "Total booked value: 34,833.28 across 103 reservations, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the fleet-tiering story — one 1,088.44 reservation outweighs the smallest 42 combined." },
    { name: "Member concentration", what: "Share of the book from members spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs the member-success pod and picks who gets the win-back call." },
    { name: "Billable lines per reservation", what: "251 order_items across 103 reservations. Extra hours and fuel-card events are new lines, not new reservations — the fan-out every total against this table must respect." },
    { name: "Settlement coverage", what: "Billed versus collected: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-settled worth 15,217. The AR anti-join the billing pod refreshes at every close." },
  ],

  topics: [
    {
      name: "Reservation-lifecycle counts",
      why: "Every Zipcar screen opens with the lifecycle: reservations booked, fob-checked-out (shipped_at stamped), completed as a round trip. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an underway reservation 'completed' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain pod censuses",
      why: "Reservations and members are different grains of the same join, and every census here reports both: EU runs 45 reservations from 8 members while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining members to reservations",
      why: "Members carry region and created_at; reservations inherit them through joins, and the join type decides who survives. A reservation without a member is corruption; a member without reservations is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "employee-bonus", "top-travellers"],
    },
    {
      name: "Utilization leaderboards",
      why: "The utilization ladder ranks members by reservations and ties are guaranteed — four members sit at 4 on this db, under a ladder of 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer members, not syntax.",
      slugs: ["rank-scores", "find-the-team-size", "top-earners"],
    },
    {
      name: "Plan tiering with CASE",
      why: "Members ride hourly or daily rate plans — casual, university, business — and the fleet splits into price bands with fixed edges. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "the-category-of-each-member-in-the-store", "calculate-special-bonus"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month reservation spine (2024-01 to 2025-02) is the demand review's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["growth-accounting", "biggest-window-between-events", "restaurant-growth"],
    },
    {
      name: "Set-algebra coverage stacks",
      why: "Ops boards stack populations — completed under no-show, this quarter beside last — and EXCEPT answers 'which billed members never settled'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "monthly-transactions-ii", "customers-who-never-order"],
    },
    {
      name: "Nested folds & member gates",
      why: "Screens escalate into staging: fold per-member reservation counts, then judge them against a computed platform average. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted — and the empty case is exactly what a filtered staging table produces.",
      slugs: ["managers-with-at-least-5-direct-reports", "market-analysis-i", "orders-with-maximum-quantity-above-average"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets completed, underway, reserved and no-show in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "calculate-orders-within-each-interval"],
    },
    {
      name: "Billing & cents discipline",
      why: "Billed is not settled — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the member world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "customer-order-frequency"],
    },
  ],

  theory: [
    {
      id: "zipcar-t1",
      q: "Your member report joins customers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a reservation column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins reservations to members: a reservation with no member row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from members: the members with no reservations ARE the answer, arriving with NULL reservation columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload member row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-reserving members, and proving that zero is itself the analyst's job: all 16 members appear in the reservation table somewhere.",
      tag: "joins",
    },
    {
      id: "zipcar-t2",
      q: "Four members tie at 4 reservations on the utilization leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose member gets the win-back visit first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer members (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "zipcar-t3",
      q: "The census shows 103 reservations and 16 members; EU shows 45 reservations and 8 members. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts reservation rows after the join — one row per reservation, so the busiest member contributes 24. COUNT(DISTINCT customer_id) folds those rows back to members — EU's 45 reservations collapse to 8 members. Neither is wrong: reservations measure load and drive demand for repositioning, members measure installed base and coverage. The ratio — 45 from 8 in EU versus 19 from 2 in the US on this db — is the intensity signal that says US demand concentrates in few heavy members while EU's is broad. The trap that catches candidates is a third grain: join order_items for billable lines and COUNT(*) silently counts lines, not reservations — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "zipcar-t4",
      q: "shipped_at is NULL until a member fobs the car open. What is your policy for the booking-ahead report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only checked-out reservations have a booking-ahead span, so the report measures created_at to fob-unlock for the 82 of 103 reservations that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL reservations returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the checked-out subset; the gap between it and COUNT(*) is exactly the 14 pending plus 7 no-show rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the span to zero to 'fix' the average — that invents same-day checkouts for cars that have not moved. A report whose WHERE clause is doing definitional work without saying so is exactly what a Zipcar reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "zipcar-t5",
      q: "The fleet review wants completed-reservation revenue per pod for pods carrying at least ten reservations. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards underway, reserved and no-show rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-reservation floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a fleet-allocation line and an error, and between a threshold applied to reservations versus to dollars. The strong answer places every filter by asking: is this a fact about one reservation, or about a pod?",
      tag: "pipeline",
    },
    {
      id: "zipcar-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 reservations always produce a mean (338.19 on this db). On filtered staging tables — one pod, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each reservation to ITS member's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "zipcar-t7",
      q: "The demand trend buckets reservations by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's reservations, and quarter-end is exactly when weekend demand lands. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The same julianday discipline powers the booking-ahead read: 2.98 days average over the 82 stamped reservations.",
      tag: "dates",
    },
    {
      id: "zipcar-t8",
      q: "Billing says an invoice is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 invoices worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void invoice WITH a settlement row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-settled, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "zipcar-mcq-1",
      prompt: "A reservation row's status reads 'shipped'. In this kit's Zipcar stage map, what happened?",
      choices: ["Completed — the round trip finished and the car is back in the pod", "Underway — fob-unlocked, out on the road, not yet returned", "No-show — cancelled without pickup", "Reserved and upcoming — checkout pending"],
      answer: 1,
      why: "The stage map is fixed: shipped = underway with shipped_at as the fob-checkout stamp — 30 of 103 reservations (29.1%). It is the only status where the car is physically out.",
      notes: [
        { choice: 0, why: "Completed is 'delivered' — 52 reservations. Calling underway trips completed inflates utilization before a single car comes home." },
        { choice: 3, why: "Reserved-and-upcoming is 'pending' — 14 reservations with no fob stamp yet. Pending is not a trip in progress; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "zipcar-mcq-2",
      prompt: "The 2.98-day average booking-ahead window is computed over which population? The db holds 103 reservations; 82 carry the fob-checkout stamp.",
      choices: ["All 103 reservations", "The 82 reservations with a checkout stamp", "The 52 completed round trips only", "The 96 non-cancelled reservations"],
      answer: 1,
      why: "The house definition: booking-ahead is measured over stamped reservations only — created_at to shipped_at averages 2.98 days (2–4 spread) across the 82, and the population ships in the report title.",
      notes: [
        { choice: 0, why: "AVG skips the NULL spans silently, so all-rows returns the same 2.98 — a real number wearing the wrong name. The 82-row population is the honesty, not the arithmetic." },
        { choice: 2, why: "Completed-only (52) is a different, unstated population — a different number wearing the right name. Define the population, then compute." },
      ],
      difficulty: "easy",
    },
    {
      id: "zipcar-mcq-3",
      prompt: "EU books 45 reservations from 8 members; the US books 19 from 2. What is the strongest correct reading of that pairing?",
      choices: ["US demand is concentrated in very few members; EU demand is broad across the pod", "US members pay higher hourly rates than EU members", "EU members cancel more often than US members", "The US pod needs more cars than the EU pod"],
      answer: 0,
      why: "The two-grain census says load (45 vs 19) and coverage (8 vs 2). The intensity read — 19-from-2 versus 45-from-8 — is concentration: the US book leans on two heavy members, EU's spreads across eight.",
      notes: [
        { choice: 2, why: "Backwards on the data: no-show shares run EU 6.7% versus US 5.3% — EU cancels slightly MORE, and neither number lives in this census." },
        { choice: 1, why: "Rates are a vehicle-model read, not a census output. Nothing in 45-from-8 versus 19-from-2 prices an hour." },
      ],
      difficulty: "easy",
    },
    {
      id: "zipcar-mcq-4",
      prompt: "A teammate joins reservations to order_items and writes SUM(o.total) to get booked value. The 251 billable lines sit across 103 reservations. What prints?",
      choices: ["Exactly 34,833.28 — the join is 1:1", "An inflated sum — every multi-line reservation's total counts once per billable line", "NULL, because order_items has no total column", "Only the single-line reservations' value"],
      answer: 1,
      why: "order_items is the many side: a reservation with three billable lines appears three rows after the join, so its total is summed three times. Aggregate the lines themselves, or fold at the reservation grain before summing.",
      notes: [
        { choice: 0, why: "251 lines across 103 reservations means fan-out is the norm, not the exception — the doubled sum is exactly what the fuel-card and extra-hour lines produce." },
        { choice: 2, why: "The join runs fine; the damage is silent inflation, not an error. Quiet wrongness is the failure mode worth fearing." },
      ],
      difficulty: "medium",
    },
    {
      id: "zipcar-mcq-5",
      prompt: "Keep only members whose LIFETIME booked value crosses 3,000 — the 63.5% concentration cohort. Where does the threshold live?",
      choices: ["WHERE SUM(total) >= 3000, before GROUP BY", "GROUP BY member HAVING SUM(total) >= 3000", "WHERE total >= 3000 on the raw reservations", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "Lifetime spend is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db exactly the heavy tail — the members behind 63.5% of the book — clears the 3,000 bar.",
      notes: [
        { choice: 0, why: "SUM(total) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "Silently empty: the largest single reservation is 1,088.44, so no raw row clears 3,000. A lifetime gate applied per reservation deletes everyone." },
      ],
      difficulty: "medium",
    },
    {
      id: "zipcar-mcq-6",
      prompt: "The demand spine buckets the 14 months from 2024-01 to 2025-02 on TEXT timestamps. Which key builds it correctly?",
      choices: ["STRFTIME('%m', created_at)", "STRFTIME('%Y-%m', created_at)", "STRFTIME('%Y', created_at)", "SUBSTR(created_at, 6, 2)"],
      answer: 1,
      why: "'%Y-%m' yields 2024-01 through 2025-02 — 14 distinct buckets in order. Year plus zero-padded month is the only key that keeps the spine monotonic across the year boundary.",
      notes: [
        { choice: 0, why: "'%m' merges January 2024 with January 2025 into one bucket — the spine collapses to 12 and the trend becomes fiction exactly at New Year." },
        { choice: 2, why: "'%Y' collapses everything to two buckets — a two-point 'trend' no one can steer a fleet with." },
      ],
      difficulty: "medium",
    },
    {
      id: "zipcar-mcq-7",
      prompt: "Folding settlements per invoice, what does SUM(p.amount_cents) return for invoice #28 — billed 1,756.00 with zero payment rows?",
      choices: ["0", "NULL", "1756", "The query errors"],
      answer: 1,
      why: "SUM over zero rows is NULL, not 0 — so NULL / 100.0 prints NULL and the coverage CASE needs the COALESCE(SUM(...), 0) guard (or an IS NULL arm) or the 'no payment' class silently vanishes into ELSE.",
      notes: [
        { choice: 0, why: "SUM ignores NULL values, not rows — with no rows there is nothing to sum and the result is NULL. The zero only appears once COALESCE wraps the fold." },
        { choice: 2, why: "1,756.00 is the billed cell from the invoices side; the payments side contributes nothing. Reading the fold's absence as the bill is the bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "zipcar-mcq-8",
      prompt: "A teammate reorders the coverage CASE to test WHEN SUM(p.amount_cents) >= amount_cents THEN 'exact' FIRST and drops the zero-guard. What happens to the six never-settled invoices (15,217)?",
      choices: ["Classified 'exact'", "Classified 'partial' via the ELSE arm", "The CASE returns NULL for them", "The query errors on the missing arm"],
      answer: 1,
      why: "SUM over no payment rows is NULL, and NULL >= billed is UNKNOWN — the arm never fires, so the six fall to ELSE and read 'partial'. The zero-guard (or IS NULL arm) must be evaluated first; the dunning list just got relabeled mid-flight.",
      notes: [
        { choice: 0, why: "'exact' requires a settlement that does not exist — the comparison is UNKNOWN, never true. Nothing upgrades a missing payment into a paid one." },
        { choice: 2, why: "The CASE never returns NULL here — ELSE catches everything the arms reject, which is precisely the bug: silent misclassification with no error anywhere." },
      ],
      difficulty: "hard",
    },
    {
      id: "zipcar-mcq-9",
      prompt: "Unsettled AR folds to 15,217 in INTEGER cents. A teammate writes SUM(amount_cents)/100 — no decimal. What prints?",
      choices: ["152.17", "152", "15217", "NULL"],
      answer: 1,
      why: "INTEGER cents divided by the INTEGER literal 100 is integer division: 15,217 / 100 = 152 — the .17 is gone, and 152 reconciles against nothing. The dollar read is amount_cents / 100.0; the .0 is the fix.",
      notes: [
        { choice: 0, why: "That is what /100.0 prints — real arithmetic preserving cents. The missing .0 is what demotes the whole expression to integer division." },
        { choice: 2, why: "That is the raw cents print with no divisor at all. Both wrong answers are real queries someone has shipped; only one is the integer-division trap." },
      ],
      difficulty: "hard",
    },
    {
      id: "zipcar-mcq-10",
      prompt: "November 2024 booked 1,648.80 against October's 2,975.67. Which expression prints the -1,326.87 step on the month spine?",
      choices: ["arr_booked - LAG(arr_booked) OVER (ORDER BY month)", "LAG(arr_booked) OVER (ORDER BY month) - arr_booked", "arr_booked - LEAD(arr_booked) OVER (ORDER BY month)", "SUM(arr_booked) OVER (ORDER BY month)"],
      answer: 0,
      why: "The step walk is current minus prior: 1,648.80 - 2,975.67 = -1,326.87, and LAG fetches the prior month row-locally. Sign convention is the whole question — a flipped sign turns the steepest drop into a phantom surge.",
      notes: [
        { choice: 1, why: "That prints +1,326.87 — the November collapse reads as a November gain. The walk's convention must be stated once and kept everywhere." },
        { choice: 2, why: "LEAD looks forward: every delta shifts one bucket up and the last row NULLs out — a different report wearing the same column name." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-zipcar-1",
      tier: "easy",
      topic: "j7",
      universe: "supplier",
      title: "The fleet-partner audit",
      brief:
        "Zipcar-flavored brief on the storefront db: fleet ops buys and leases vehicles from six fleet partners, and the quarterly audit asks which partners' models actually earn their parking spots — models stocked versus reservation revenue booked. Probed facts: the six partners carried the whole 34,833.28 reservation book; Nordic Gadgets AB leads at 11,130.25 (32% of the book) on 3 models at a 4.6 rating; Midwest Hardware Co follows at 9,294.93 (26.7%) on 3 models; Alpine Audio GmbH carries 4,765.63 (13.7%) on just 2 models at 4.8 — the trusted-bench partner; the tail runs Andes Naturals SA 3,613.25 (10.4%), Shenzhen Electro 3,049.07 (8.8%) and Pacific Textiles 2,980.15 (8.6%). The audit reads biggest fleet revenue first.",
      ask: "Return each fleet partner with its rating, stocked model count, reservations served and fleet revenue to 2 decimals, biggest revenue first.",
      template:
        "SELECT s.name AS partner,\n       s.rating AS rating,\n       COUNT({1} p.id) AS models,\n       COUNT(DISTINCT o.id) AS reservations,\n       ROUND(SUM(oi.quantity * oi.unit_price), {2}) AS fleet_revenue\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.product_id = p.id\nJOIN orders o ON o.id = oi.order_id\nGROUP BY s.name\nORDER BY fleet_revenue {3};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the model deduplicator",
          why: "COUNT(DISTINCT p.id) folds the partner's billable lines back to stocked models: Nordic reads 3, Alpine 2. SUM(DISTINCT …) adds the model id codes together and MAX(DISTINCT …) reports the largest id — neither is a fleet census.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the cents precision",
          why: "Fleet revenue reports to 2 decimals — Nordic's 11,130.25. ROUND(…, 1) prints 11,130.3 and the partner audit stops reconciling with the cents figures fleet ops quotes from the probed ledger.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The audit reads biggest fleet revenue on top: Nordic 11,130.25 down to Pacific 2,980.15. ASC would open the meeting on the tail partner — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", "1", "ASC", "0"],
      walkthrough:
        "Three joins, one fold, five columns at two grains. The chain runs reservations (orders) through their billable lines (order_items) to the vehicle model (products) and the model's fleet partner (suppliers); GROUP BY partner folds the 251 lines into six rows. COUNT(DISTINCT p.id) reads stocked models (Nordic 3, Alpine 2), COUNT(DISTINCT o.id) reads reservations served (38 Nordic, 45 Midwest, 34 Alpine, 25 Andes, 41 Shenzhen, 35 Pacific), and ROUND(SUM(oi.quantity * oi.unit_price), 2) reads fleet revenue: Nordic 11,130.25 (32% of the 34,833.28 book), Midwest 9,294.93 (26.7%), Alpine 4,765.63 (13.7%), Andes 3,613.25, Shenzhen 3,049.07, Pacific 2,980.15 — matching the probed partner ledger top to bottom. The distractors fail honestly: SUM or MAX inside COUNT nests an aggregate and errors; 1 in the precision slot prints 11,130.3 and the audit drifts off the cents figures; ASC opens the review on Pacific's 2,980.15 tail. The utilization read is the point: Midwest's fleet serves 45 reservations yet earns less than Nordic's 38 — rate mix, not raw trips, moves partner revenue.",
    },
    {
      id: "cs-zipcar-2",
      tier: "medium",
      topic: "s6",
      universe: "month-close",
      title: "The settlement coverage census",
      brief:
        "Zipcar-flavored brief on the storefront db: month-end close, and the billing pod must classify every invoice's settlement coverage before dunning notices go out. Probed facts: 28 invoices; 21 settled to the cent (65,612 billed); 1 partial — invoice #25, billed 6,148 against 4,000 settled; 6 with no settlement rows at all, worth 15,217. The probed anomaly list names the two mirrors: #11 is void but settled (925.00) and #28 is marked paid with ZERO settlement rows (1,756.00) — a status that lies. Both books carry INTEGER cents, so the dollar read is amount_cents / 100.0, and the census prints the no-payment block first-read by billed size with the partial block last.",
      ask: "Return each invoice with its status, billed and settled dollars to 2 decimals, and a coverage label (exact / no payment / partial), grouped by label then biggest billed first.",
      template:
        "SELECT i.id AS invoice,\n       i.status,\n       ROUND(i.amount_cents / 100.0, 2) AS billed,\n       ROUND(COALESCE(SUM(p.amount_cents), 0) / {1}, 2) AS settled,\n       CASE\n         WHEN COALESCE(SUM(p.amount_cents), 0) = {2} THEN {3}\n         WHEN SUM(p.amount_cents) >= i.amount_cents THEN 'exact'\n         ELSE 'partial'\n       END AS coverage\nFROM invoices i\n{4} JOIN payments p ON p.invoice_id = i.id\nGROUP BY i.id\nORDER BY coverage, billed {5};",
      slots: [
        {
          answer: "100.0",
          kind: "keyword",
          label: "the cents-to-dollars divisor",
          why: "Both books carry INTEGER cents, so the dollar read is amount_cents / 100.0. The integer divisor /100 truncates — a 1,756.00 print becomes 1,756 and odd-cent rows lose their cents silently.",
        },
        {
          answer: "0",
          kind: "number",
          label: "the never-settled marker",
          why: "COALESCE(SUM(p.amount_cents), 0) = 0 is the empty-ledger test that flags the 6 never-settled invoices (15,217). NULL in the comparison is never true, so those six would fall through to 'partial' — the dunning list, relabeled mid-flight.",
        },
        {
          answer: "'no payment'",
          kind: "keyword",
          label: "the empty-ledger label",
          why: "The coverage taxonomy is fixed: exact / no payment / partial — the labels the close's reconciliation and the probed coverage table use. Any other literal forks the vocabulary between this census and every report that joins to it.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the keep-every-invoice join",
          why: "The LEFT JOIN keeps all 28 invoices including the 6 with no settlement rows — they ARE the answer. INNER erases exactly those six rows, and the census reads 22 invoices of nothing but good news.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-anomaly-first direction",
          why: "Within each block the census reads biggest billed first — the no-payment block opens at #24's 4,937.00 and the dunning queue follows it. ASC buries the biggest exposure at the bottom of each block.",
        },
      ],
      distractors: ["NULL", "1.0", "'partial'", "INNER", "ASC"],
      walkthrough:
        "Two stages in one pass: fold settlements per invoice, then classify. The LEFT JOIN keeps all 28 invoices — INNER would delete the six the census exists to count — and COALESCE(SUM(p.amount_cents), 0) turns the empty fold into a real zero; the CASE then splits the book: = 0 reads 'no payment' (6 invoices, 15,217 summed), >= billed reads 'exact' (21, settled to the cent), ELSE 'partial' (1 — invoice #25, 6,148.00 billed against 4,000.00 settled), matching the probed coverage split 21 / 6 / 1. The divisor is /100.0 because both books carry INTEGER cents — the integer /100 is how a 1,756.00 print loses its cents. The anomalies surface exactly where the probed list puts them: the no-payment block leads with #24 at 4,937.00 down to #18 at 873.00 and carries the paid-status #28 (1,756.00, zero settlement rows) mid-block — payment rows are the ledger of record, the status column is a claim — while void-but-settled #11 (925.00) hides inside the exact block and never reaches an anti-join. The distractors each break differently: NULL in the zero-slot makes the guard never fire so all six fall to ELSE; 1.0 in the divisor inflates every dollar cell a hundredfold; INNER deletes the six; ASC re-sorts each block smallest-first and buries #24's 4,937.00.",
    },
  ],

  problems: [
    { slug: "trial-to-paid-funnel", why: "The reservation lifecycle is Zipcar's headline funnel: booked, fob-checked-out, completed round trip. This problem drills the conditional-count shape the funnel report runs every single week." },
    { slug: "rolling-7d-actives", why: "Fleet availability is watched as a rolling window — which members checked a car out in the trailing 7 days per pod. Rolling distinct counts over timestamps are exactly this drill." },
    { slug: "immediate-food-delivery-ii", why: "Reservations that completed versus those still out or no-showed — the completed share with the denominator stated. Same conditional-rate shape Zipcar ops reads daily." },
    { slug: "dau-wau-stickiness", why: "Members who drive weekly versus those who reserve once and lapse — stickiness is the utilization story per pod, and this problem is that ratio with honest denominators." },
    { slug: "employees-with-missing-information", why: "Member rosters arrive with plan fields missing — pairing two tables to surface who lacks a fuel-card or plan record is this exact NULL-aware pairing drill." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Members who drive weekdays AND weekends but never touch the business-plan window — conditional membership logic over reservation history, Zipcar's segment-definition screen." },
    { slug: "second-highest-salary", why: "The second-busiest member, without guessing LIMIT offsets — top-N reads where ties and edge ranks matter, exactly the leaderboard follow-up Zipcar panels ask." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Each member's most-reserved model — the argmax-over-groups shape fleet ops uses to right-size which models sit in which pod." },
    { slug: "find-users-with-valid-e-mails", why: "Member invites bounce on malformed emails before the first reservation ever books — roster hygiene via pattern filters is the data-quality warm-up here." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The member carrying the most reservations (24 on this db) — an argmax over a fold, the opening warm-up of every utilization screen." },
    { slug: "sellers-with-no-sales", why: "Fleet partners with no completed reservations in a window — the anti-join with a date filter that feeds the quarterly fleet-distribution review." },
    { slug: "last-person-to-fit-in-the-elevator", why: "Cars committed hour by hour against pod capacity — a running-sum window over billable hours, the shape of the utilization-per-parking-spot read." },
    { slug: "number-of-times-a-driver-was-a-passenger", why: "Members who hold a plan yet never once fob a car open — the both-directions LEFT JOIN that separates plan-holders from actual drivers." },
    { slug: "monthly-transactions-i", why: "The monthly reservation statement excluding no-shows — a month-bucket listing with a status filter, the billing pod's monthly staple." },
    { slug: "game-play-analysis-iv", why: "Did a new member fob a car within days of joining? First-event-after-signup logic over timestamps — the onboarding read the university plans live on." },
    { slug: "bank-account-summary-ii", why: "The billing pod's monthly rollup in INTEGER cents — cents-safe folds with the /100.0 rule, exact practice for the settlement true-up." },
  ],
};
