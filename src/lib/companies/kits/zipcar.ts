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
    "Preparation strategy: the pools file carries no Zipcar section — zero tagged rows — so the kit curates **thirty-two problems** from the SQL band to this kit's known screen shapes: reservation funnels, two-grain pod censuses, tie-heavy utilization ladders, plan-band CASE and the cents-safe billing spine — laid out for spaced practice rather than one sitting: a topic a day, revisited until the denominators are reflexes. Then run all six case studies on the live storefront db, each rebuilt with probed figures and audited the way a close reconciliation would be: the {emerald:fleet-partner audit} fleet ops opens the quarter with, the {sky:settlement coverage census} the billing pod closes every month with, the one-pass fleet census fleet ops reads in a single scan, the utilization ladder with its named tie policy, the 3,000-plus member cohort behind the 63.5% concentration read, and the booking-ahead calendar that decides when repositioned cars land. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "analyze-subscription-conversion", "sessionize-events"],
    },
    {
      name: "Two-grain pod censuses",
      why: "Reservations and members are different grains of the same join, and every census here reports both: EU runs 45 reservations from 8 members while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "user-activity-for-the-past-30-days-i", "immediate-food-delivery-ii", "monthly-transactions-i"],
    },
    {
      name: "Joining members to reservations",
      why: "Members carry region and created_at; reservations inherit them through joins, and the join type decides who survives. A reservation without a member is corruption; a member without reservations is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "employee-bonus", "top-travellers", "find-churn-risk-customers", "customers-who-bought-a-and-b-not-c", "sellers-with-no-sales", "number-of-times-a-driver-was-a-passenger", "game-play-analysis-iv"],
    },
    {
      name: "Utilization leaderboards",
      why: "The utilization ladder ranks members by reservations and ties are guaranteed — four members sit at 4 on this db, under a ladder of 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer members, not syntax.",
      slugs: ["rank-scores", "find-the-team-size", "top-earners", "flight-occupancy-and-waitlist-analysis", "second-highest-salary", "most-frequently-ordered-product-per-customer", "customer-placing-the-largest-number-of-orders", "last-person-to-fit-in-the-elevator"],
    },
    {
      name: "Plan tiering with CASE",
      why: "Members ride hourly or daily rate plans — casual, university, business — and the fleet splits into price bands with fixed edges. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "the-category-of-each-member-in-the-store", "calculate-special-bonus", "plan-migration-paths", "the-number-of-users-that-are-eligible-for-discount", "calculate-parking-fees-and-duration"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month reservation spine (2024-01 to 2025-02) is the demand review's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["growth-accounting", "biggest-window-between-events", "restaurant-growth", "cohort-retention-matrix", "mrr-waterfall", "deferred-revenue", "employees-with-missing-information", "find-users-with-valid-e-mails"],
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
      slugs: ["active-businesses", "create-a-session-bar-chart", "calculate-orders-within-each-interval", "find-zombie-sessions", "rolling-7d-actives", "dau-wau-stickiness"],
    },
    {
      name: "Billing & cents discipline",
      why: "Billed is not settled — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the member world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "customer-order-frequency", "ar-aging-schedule", "generate-the-invoice", "prepayment-detection", "net-revenue-retention"],
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
    {
      id: "zipcar-t9",
      q: "The ops board wants completed, underway, reserved and no-show in ONE pass. Walk me through both shapes — FILTER (WHERE …) and SUM(CASE …) — and when you reach for each.",
      a: "FILTER (WHERE …) attaches its own predicate per aggregate, so one scan emits 52, 30, 14 and 7 beside the 103 total — the one-pass census that reconciles by construction, four chances to drift collapsed into zero. SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) is the portable twin: same numbers, works on engines without FILTER, and doubles as a value fold when the board wants completed BOOK (SUM(CASE … THEN total ELSE 0 END)) rather than counts. I write FILTER when the audience is internal and the engine is known; I write SUM(CASE) when the query might travel to another dialect. What I never do is four sequential queries — four scans are four snapshots and a reconciliation argument waiting to happen.",
      tag: "aggregation",
    },
    {
      id: "zipcar-t10",
      q: "Reservations join to vehicle models and models join to the fleet partner. Where does that three-table chain fan out, and how do you keep the partner census honest?",
      a: "The fan-out lives at the billable-line grain: one reservation carries several order_items rows — extra hours and fuel-card events are new lines, not new reservations — so after reservations → models → partners the same reservation appears once per line, and every COUNT(*) counts lines, not reservations — 251 against 103. The honest census pins the grain per column: COUNT(DISTINCT o.id) for reservations served, SUM(oi.quantity) for billable hours — a line-grain fact that is SUPPOSED to fan out — and ROUND(SUM(oi.quantity * oi.unit_price), 2) for fleet revenue, which also lives happily at line grain. The trap is mixing grains in one column without saying so: COUNT(*) wearing a reservations name is how a partner audit reads 2.4× busier overnight. One row per what — asked of every column before the query ships.",
      tag: "joins",
    },
    {
      id: "zipcar-t11",
      q: "Give me each member's LATEST fob-checked-out reservation — full row, not just the stamp. Why is MAX-plus-join the fragile version?",
      a: "The window version stages ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY shipped_at DESC) and keeps rn = 1: one full row per member, 16 rows on this db, each the newest reservation its member fobbed open — with the tie policy explicit (shipped_at DESC, then id, if two stamps ever collide on the same second). MAX-plus-join finds the latest timestamp per member but not the row around it, so you join back on reservation id AND the max stamp — a second join condition that silently breaks the day two reservations share a stamp. The window keeps the payload attached by construction. That panel is the recency read member-success runs before the win-back visit: a member whose latest stamp is three weeks stale is a conversation, not a campaign.",
      tag: "windows",
    },
    {
      id: "zipcar-t12",
      q: "EXISTS or IN for the never-no-showed member list — and what does NULL do to the IN version?",
      a: "IN materializes the subquery into a list and compares every outer row against it; x NOT IN (…) is UNKNOWN the moment one NULL enters the list, so the whole result silently empties while looking valid. EXISTS is a per-row probe — the engine checks whether even one matching row exists and stops — so NULLs in the probed columns are just 'no match', never poison. For the good-standing list I write NOT EXISTS with the correlation spelled out (t.customer_id = m.id AND t.status = 'cancelled'); on the clean core db the two agree, and on the staging tables where NULLs actually live, only one of them still returns rows. The rule: IN for value membership over NULL-free columns, EXISTS for existence over anything a member can leave blank in the app.",
      tag: "subqueries",
    },
    {
      id: "zipcar-t13",
      q: "When does a query need a CTE rather than an inline derived table? Give me the Zipcar example you actually hit.",
      a: "Whenever the staged grain gets referenced more than once or needs a name the review can read. The concentration read is the honest example: a CTE folds 103 reservations into a per-member lifetime book, and the outer query filters it against the 3,000 floor AND computes each member's share of the whole — two references to one fold. Inline, that is a derived table pasted twice or a nest three parentheses deep; as a CTE it reads like the memo — member_book, then the share column, then the floor. CTEs also carry the definition: the analyst who inherits the query reads the name and knows the population without re-deriving it. The cost is nil at this db's scale; the readability is the point, and review here grades readability as a correctness feature.",
      tag: "ctes",
    },
    {
      id: "zipcar-t14",
      q: "'Billed but never settled' — EXCEPT or LEFT JOIN + IS NULL? Same cohort, different machinery. When do you reach for each?",
      a: "EXCEPT reads like the business sentence — billed-member set minus settled-member set — and dedupes to distinct members automatically: on this db exactly 3 members hold only invoices with zero payment rows behind them. LEFT JOIN + IS NULL does the same job while carrying extra columns along, which is what you want when the deliverable is a dunning LIST with details, not a bare id set. The costs differ: EXCEPT sorts both sets to dedupe; the anti-join probes per row and scales past it on indexed keys. The trap both share: cohort membership is per-whole-entity, so the single-table shortcut (WHERE i.status = 'open') lies — a member with one paid and one open invoice qualifies on the open row, and invoice #28 — marked paid with zero settlement rows — hides from a status filter entirely. Cohort questions are set questions; row filters answer row questions.",
      tag: "set-ops",
    },
    {
      id: "zipcar-t15",
      q: "Where do you allow COALESCE on the billing board, and where does it lie?",
      a: "Allowed, and required, on empty folds: SUM over an invoice with no payment rows is NULL, so COALESCE(SUM(p.amount_cents), 0) turns the six never-settled invoices (15,217) into real zeros the dunning board can read — the population stays and the arithmetic works. It lies in two places. Booking-ahead: IFNULL(julianday(shipped_at) - julianday(created_at), 0) invents same-day fob-unlocks for the 14 pending reservations and drags the 2.98-day average toward fiction — the honest version filters to stamped rows and says so in the title. Status: COALESCE on the status column papers over the claim-versus-ledger gap that produced invoice #28 — marked paid, zero settlement rows. COALESCE is for arithmetic on empty sets, never for populations and never for claims.",
      tag: "nulls",
    },
    {
      id: "zipcar-t16",
      q: "Booking-ahead in fractional days on TEXT timestamps, and the hour-of-day demand curve — how do julianday and STRFTIME split that work?",
      a: "julianday converts a stamp like '2024-07-15 10:22:00' to a day number with the time-of-day riding as the fraction, so differences are true elapsed days and AVG over them is meaningful — 2.98 days across the 82 stamped reservations, spread 2 to 4, with the 14 pending rows excluded by an explicit WHERE shipped_at IS NOT NULL, not silently by AVG's NULL-skipping. Hour-of-day is the opposite job — bucketing, not subtracting — so STRFTIME('%H', shipped_at) carves the two-digit hour and GROUP BY it builds the demand curve the fleet-repositioning sync reads. Window cuts stay half-open either way: created_at >= '2024-07-01' AND created_at < '2024-07-08' keeps every reservation through 23:59:59 on the 7th, where BETWEEN drops the last night the moment a time component exists.",
      tag: "dates",
    },
    {
      id: "zipcar-t17",
      q: "A member appears twice in the roster — 'Maya.Patel@MAIL.com' and 'maya.patel@mail.com'. Walk me through the dedupe you write before any census.",
      a: "First measure the damage: GROUP BY LOWER(TRIM(email)) HAVING COUNT(*) > 1 names the collided keys — on this db the roster is clean, and proving that is part of the job. Then the policy: the canonical key is LOWER(TRIM(email)) written INTO the pipeline, not re-derived per query — one definition, everywhere. The census still folds on customer id (the surrogate key stays the truth; the email is only the match key), and the duplicate rows get a merge ticket rather than a DELETE — two ids each carrying reservations means a silent id merge fans or drops bookings. What I refuse is deduping at read time in fifteen dashboards: fifteen definitions of 'the same member' is how the member count becomes a matter of taste.",
      tag: "quality",
    },
    {
      id: "zipcar-t18",
      q: "251 billable lines across 103 reservations. Why does every total against the line table need a grain check before it ships?",
      a: "Because the line table is the many side twice over: extra hours and fuel-card events are new lines on the same reservation, so joining reservations to lines fans 103 out to 251 and every aggregate silently changes population. SUM(oi.quantity * oi.unit_price) is line-grain by design — billable hours times the hourly rate — and reconciles upward to the 34,833.28 reservation book. But COUNT(*) after that join counts lines (251), AVG(oi.quantity) averages hours per LINE and tilts toward long reservations, and a 'reservations served' column needs COUNT(DISTINCT o.id) to fold back. The check is one question per column — one row per what — and the answer ships beside the number: 251 lines, 103 reservations, 2.4 lines per reservation. A total that cannot state its grain is a rumor with a decimal point.",
      tag: "aggregation",
    },
    {
      id: "zipcar-t19",
      q: "The billing books carry INTEGER cents. What breaks with /100 instead of /100.0, and where has that actually cost money?",
      a: "INTEGER divided by INTEGER is integer division: 493,700 cents / 100 prints 4,937, not 4,937.00 — fine on whole dollars, fatal on odd cents: every odd-cent line truncates down, one cent at a time, until the trial balance stops reconciling at exactly the odd cents. The house rule is amount_cents / 100.0 — the .0 forces real arithmetic — and ROUND(…, 2) for the print. The ledger's own anomalies make the point: void-but-settled #11 at 925.00 and paid-status-with-no-rows #28 at 1,756.00 both print as whole dollars today, so a /100 read LOOKS fine until a 1,756.25 invoice ships and prints 1,756. The close's defense is mechanical: reconcile the cents column, not the dollars column.",
      tag: "numbers",
    },
    {
      id: "zipcar-t20",
      q: "Each pod's share of the reservation book, in one pass beside the pod sums — how?",
      a: "The percent-of-total idiom: ROUND(100.0 * SUM(o.total) / SUM(SUM(o.total)) OVER (), 1) — the inner SUM is the group aggregate, the outer SUM over () re-aggregates every group's sum into the grand total and stamps it on each row, so the division is pod-over-book inside one scan. On this db the full-book shares read EU 43.3% (15,089.23), APAC 33.3% (11,605.45), US 20.9% (7,286.16), LATAM 2.4% (852.44) — the pod-allocation map in one pass. The 100.0 multiplier sits before the division or every share truncates to zero. The alternative — a separate grand-total query joined back — is two scans and a join you do not need, and it is the same idiom behind the 63.5% member-concentration read.",
      tag: "windows",
    },
    {
      id: "zipcar-t21",
      q: "GROUP BY m.id or GROUP BY m.name — does it matter when two members could share a name?",
      a: "GROUP BY m.id folds on the surrogate key — one row per member even when two members share a name. GROUP BY m.name merges them into one row and their books add together: a fictional member with a doubled book and a utilization nobody can act on. On this db all 16 member names are distinct, so the two fold keys agree today — and the GROUP BY name query is a landmine for the day the roster doubles. The habit: fold on the id, display the name, and let the join carry it — SELECT c.name … GROUP BY o.customer_id. The interviewer's version of the question is 'what happens when the name is not unique', and the honest answer is 'nothing, because I never grouped on it'.",
      tag: "groupby",
    },
    {
      id: "zipcar-t22",
      q: "Neighborhood names arrive as 'São Paulo', 'SAO PAULO' and 'sao paulo' from three apps. What is your normalization key for the pod census?",
      a: "One canonical form written in the pipeline: TRIM plus UPPER (or LOWER) at ingest, so every reader downstream folds the same key — the census is GROUP BY normalized_pod, never raw pod. Diacritics are the trap: 'São' and 'SAO' differ beyond case, so if all three spellings must collide, the key needs a transliteration step — a small mapping table beats clever string surgery because it is auditable and reversible. What I refuse is normalizing in fifteen dashboards independently, which is how one team's pod count reads 6 and another's 4. The hygiene check rides along: GROUP BY the normalized key HAVING COUNT(DISTINCT raw_spelling) > 1 names every collision the pipeline missed.",
      tag: "strings",
    },
    {
      id: "zipcar-t23",
      q: "The morning dashboard filters pod and status on a reservations table heading to millions of rows. What index do you propose, and what does EXPLAIN tell you before and after?",
      a: "A composite index on (region, status) — both predicates are equalities and the column order follows the query, so the engine seeks straight to the completed slice instead of scanning every reservation. Before: EXPLAIN QUERY PLAN prints SCAN (a full table read whose cost grows with every booking). After: SEARCH … USING INDEX — the plan literally changes shape, which is the artifact I bring to the schema review, not a hunch. Two caveats I say out loud: the index costs write amplification on a booking-heavy table, so it earns its keep only when the read runs this often, and the filter must stay sargable — wrapping the indexed column in SUBSTR or CAST disables the seek and puts you back on SCAN.",
      tag: "performance",
    },
    {
      id: "zipcar-t24",
      q: "The CEO reads '50.5% round-trip completion' on the slide. Defend that denominator in one sentence — and name the two wrong ones you refuse.",
      a: "The sentence: completed round trips divided by ALL reservations booked — 52 of 103 — because the metric's job is to say what share of everything members reserved actually came back, and the 14 upcoming and 7 no-show rows are part of that everything. Wrong denominator one: resolved reservations (52 ÷ 95 = 54.7%) — it deletes the open book and reads rosier for no operational reason. Wrong denominator two: fob-checked-out reservations (52 ÷ 82 = 63.4%) — that is a completion-of-started rate, a different metric with a real use, but wearing this one's name on this slide. Every rate here ships with its population in the title; a number without its denominator is a rumor with a percent sign.",
      tag: "metrics",
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
    {
      id: "zipcar-mcq-11",
      prompt: "The ops board wants all four stage counts — completed, underway, reserved, no-show — from ONE scan of the reservations table. Which expression reads the completed column?",
      choices: [
        "COUNT(*) FILTER (WHERE status = 'delivered')",
        "COUNT(status = 'delivered')",
        "COUNT(*) WHERE status = 'delivered'",
        "SUM(status) FILTER (WHERE 'delivered')",
      ],
      answer: 0,
      why: "FILTER (WHERE …) attaches a per-aggregate predicate, so one pass emits 52, 30, 14 and 7 side by side — the census that reconciles to 103 by construction. The other shapes either count everything or don't parse.",
      notes: [
        { choice: 1, why: "COUNT(status = 'delivered') counts non-NULL values of the boolean — and a boolean is 0 or 1, never NULL — so all 103 rows count. The predicate belongs inside FILTER's WHERE, not in the value expression." },
        { choice: 2, why: "There is no per-aggregate WHERE — that clause filters rows before grouping, which would delete the other three stages and make the one-pass census impossible." },
      ],
      difficulty: "easy",
    },
    {
      id: "zipcar-mcq-12",
      prompt: "The pod review wants each region's member names folded into one readable cell per pod. Which aggregate builds it?",
      choices: [
        "GROUP_CONCAT(c.name)",
        "CONCAT(c.name)",
        "SUM(c.name)",
        "GROUP_CONCAT(DISTINCT c.region)",
      ],
      answer: 0,
      why: "GROUP_CONCAT folds a group's values into one comma-separated cell — 16 members collapse into 4 pod rows with a readable roster per pod. It is the one aggregate in the pool that returns text, which is why board packets love it.",
      notes: [
        { choice: 1, why: "CONCAT joins its arguments row by row — no group fold — so you get 16 rows of single names, not one cell per pod." },
        { choice: 2, why: "SUM is numeric-only and errors on text. The fold you want is concatenation, not addition — and folding the region over itself would just print the pod name in every cell." },
      ],
      difficulty: "easy",
    },
    {
      id: "zipcar-mcq-13",
      prompt: "Growth wants members who reserved in 2024 but never in 2025 — the lapsed cohort. On this db that list is exactly 7 members. Which query returns it?",
      choices: [
        "SELECT customer_id FROM orders WHERE created_at LIKE '2024%' EXCEPT SELECT customer_id FROM orders WHERE created_at LIKE '2025%'",
        "… INTERSECT SELECT customer_id FROM orders WHERE created_at LIKE '2025%'",
        "… UNION SELECT customer_id FROM orders WHERE created_at LIKE '2025%'",
        "SELECT customer_id FROM orders WHERE created_at LIKE '2024%' AND created_at NOT LIKE '2025%'",
      ],
      answer: 0,
      why: "EXCEPT keeps set-A rows absent from set B — 2024 reservers minus 2025 reservers — and on this db the answer is 7 members. The set algebra matches the business sentence: A but not B, evaluated per whole member.",
      notes: [
        { choice: 3, why: "Both LIKE tests sit on the SAME row, and a row cannot be from two years — the AND is never true and the query returns zero. Set algebra works on memberships across rows; row filters can't see across them." },
        { choice: 1, why: "INTERSECT answers the opposite cohort — members active in both years — which is most of the 15 members who reserved in 2024." },
      ],
      difficulty: "medium",
    },
    {
      id: "zipcar-mcq-14",
      prompt: "The dunning board LEFT JOINs payments to invoices; the 6 never-settled invoices show a NULL settled-dollars cell. The stakeholder wants 0.00. Which is the honest fix?",
      choices: [
        "COALESCE(SUM(p.amount_cents), 0) / 100.0",
        "Filter them out: WHERE settled IS NOT NULL",
        "Update the invoice status to 'settled' so the join matches",
        "CAST(NULL AS REAL) after the join",
      ],
      answer: 0,
      why: "SUM over no payment rows is NULL, so the COALESCE guard turns the empty fold into a real zero before the cents divide — the dunning rows stay visible with a 0.00. Population preserved, arithmetic working.",
      notes: [
        { choice: 1, why: "Deleting the six rows hides exactly the population the billing pod exists to chase — 15,217 of exposure vanishes from the board and the close looks clean." },
        { choice: 2, why: "The status column is a claim, not the ledger of record — rewriting statuses to make a join match is precisely how a paid-with-no-payments anomaly like #28 gets born." },
      ],
      difficulty: "easy",
    },
    {
      id: "zipcar-mcq-15",
      prompt: "The Q4 memo cuts October through New Year's Eve — every reservation from Oct 1 through the last night of December. Which WHERE keeps the full quarter?",
      choices: [
        "created_at >= '2024-10-01' AND created_at < '2025-01-01'",
        "created_at BETWEEN '2024-10-01' AND '2024-12-31'",
        "YEAR(created_at) = 2024 AND MONTH(created_at) IN (10, 11, 12)",
        "SUBSTR(created_at, 6, 2) IN ('10', '11', '12')",
      ],
      answer: 0,
      why: "Half-open intervals are the house rule: the exclusive upper bound '2025-01-01' swallows every timestamp on Dec 31 including 23:59:59, which BETWEEN '…-12-31' drops the moment a time-of-day rides on the date — and quarter-end is exactly when holiday demand lands.",
      notes: [
        { choice: 2, why: "YEAR() and MONTH() are MySQL habits — SQLite has neither, so the query fails outright; the portables are STRFTIME and SUBSTR." },
        { choice: 3, why: "SUBSTR(created_at, 6, 2) does isolate the month digits — but pairs with no year guard, so October 2025 sneaks into a Q4-2024 cut the moment the log crosses a year." },
      ],
      difficulty: "medium",
    },
    {
      id: "zipcar-mcq-16",
      prompt: "Fleet repositioning wants the fob-checkout demand curve by HOUR of day. Which expression buckets the checkout stamps into hours?",
      choices: [
        "STRFTIME('%H', shipped_at)",
        "STRFTIME('%Y-%H', shipped_at)",
        "julianday(shipped_at) % 24",
        "SUBSTR(shipped_at, 12, 2) — with julianday as a fallback",
      ],
      answer: 0,
      why: "STRFTIME('%H', …) carves the two-digit hour ('08' to '23') straight off the TEXT stamp — 24 ordered buckets for the demand curve. It is a bucketing job, not a subtraction job, so julianday stays out of it.",
      notes: [
        { choice: 1, why: "'%Y-%H' prefixes the year to each hour — 24 buckets per year, and the demand curve fragments into per-year shards nobody asked for." },
        { choice: 2, why: "julianday returns a fractional day NUMBER — modulo 24 of it is not an hour of day. The format string is the tool for calendar parts." },
      ],
      difficulty: "medium",
    },
    {
      id: "zipcar-mcq-17",
      prompt: "A teammate computes 'average reservation length' as AVG(oi.quantity) over order_items joined to reservations — 251 billable lines across 103 reservations. What does the figure actually average?",
      choices: [
        "Billable lines, not reservations — a reservation with six extra-hour lines contributes six rows, so multi-line reservations dominate and the figure is not a per-reservation average",
        "Reservations — the join is 1:1 so the mean is honest",
        "Revenue — quantity carries the hourly rate",
        "Nothing — the query errors on the join",
      ],
      answer: 0,
      why: "Extra hours and fuel-card events are new lines on the same reservation, so the join fans 103 reservations out to 251 rows and AVG weights every line equally — the per-reservation read needs a GROUP BY reservation first, or the line count printed beside it. Grain before average, every time.",
      notes: [
        { choice: 1, why: "251 across 103 is a 2.4× fan-out — the one-to-one assumption is exactly what the billable-line table exists to break." },
        { choice: 2, why: "unit_price carries the hourly rate; quantity is billable hours. Neither rescues an average taken at the wrong grain." },
      ],
      difficulty: "medium",
    },
    {
      id: "zipcar-mcq-18",
      prompt: "The anomaly screen flags reservations priced above THEIR MEMBER's average reservation value. Which shape is correct?",
      choices: [
        "WHERE o.total > (SELECT AVG(t.total) FROM orders t WHERE t.customer_id = o.customer_id)",
        "WHERE o.total > (SELECT AVG(total) FROM orders)",
        "GROUP BY customer_id HAVING o.total > AVG(total)",
        "WHERE o.total > AVG(o.total) OVER ()",
      ],
      answer: 0,
      why: "The comparison is per-member, so the subquery must be correlated — the inner WHERE re-runs per outer row and returns THAT member's mean. The uncorrelated version compares every reservation to the book-wide mean (338.19) — a different screen that flags the 42 above-average reservations, not per-member outliers.",
      notes: [
        { choice: 2, why: "HAVING judges groups, not rows — once grouped by member there is no single o.total to compare, and the engine rejects the reference." },
        { choice: 3, why: "AVG(total) OVER () is the book-wide mean stamped on every row — the same wrong population as choice 1, wearing window syntax." },
      ],
      difficulty: "hard",
    },
    {
      id: "zipcar-mcq-19",
      prompt: "Rank members by reservation count, then keep ranks 1–3. Why does `WHERE utilization_rank <= 3` fail inside the same SELECT that computes the rank?",
      choices: [
        "Window output is computed after WHERE — stage the ranking in a CTE (or derived table) and filter in the outer query",
        "Rank columns need an outer ORDER BY before they can be filtered",
        "WHERE cannot compare numbers to column aliases",
        "It doesn't fail — the filter just runs before the rank and returns everything",
      ],
      answer: 0,
      why: "The logical pipeline evaluates WHERE before the SELECT list, so the window's rank does not exist yet at filter time. The staging move — rank inside a CTE, filter outside — is the standard two-step, and it is why the kit's leaderboard cases carry a WITH.",
      notes: [
        { choice: 3, why: "It fails outright — 'misuse of window function' or an unknown-column error depending on the engine. Never a silent everything." },
        { choice: 2, why: "WHERE happily compares to aliases in engines that allow it — the failure here is ordering, not type. The alias exists only after the SELECT list is evaluated." },
      ],
      difficulty: "medium",
    },
    {
      id: "zipcar-mcq-20",
      prompt: "The pod-allocation read: each region's share of the 34,833.28 book, computed in one pass beside the regional sums. Which expression divides each region's booked value by the whole book?",
      choices: [
        "ROUND(100.0 * SUM(o.total) / SUM(SUM(o.total)) OVER (), 1)",
        "ROUND(100.0 * SUM(o.total) / COUNT(*), 1)",
        "ROUND(100.0 * SUM(o.total) / AVG(SUM(o.total)), 1)",
        "ROUND(100.0 * SUM(o.total) / MAX(SUM(o.total)) OVER (), 1)",
      ],
      answer: 0,
      why: "SUM(SUM(o.total)) OVER () nests the group sum inside a window over all groups — the grand total rides on every row, so the division is pod over book. EU reads 43.3%, APAC 33.3%, US 20.9%, LATAM 2.4% in one pass, and the 100.0 sits before the division to force real arithmetic.",
      notes: [
        { choice: 1, why: "Dividing dollars by COUNT(*) divides by reservations — a per-reservation dollar figure, not a share. EU would print a made-up 349.5 and the allocation memo would quote it." },
        { choice: 3, why: "Dividing by the MAX region's total makes the biggest pod read 100% and everyone else a fraction OF THE LEADER — a dominance ratio wearing a share's name." },
      ],
      difficulty: "hard",
    },
    {
      id: "zipcar-mcq-21",
      prompt: "The good-standing list needs members with NO no-show reservations. Which shape is NULL-safe by construction?",
      choices: [
        "WHERE NOT EXISTS (SELECT 1 FROM orders t WHERE t.customer_id = m.id AND t.status = 'cancelled')",
        "WHERE m.id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled')",
        "WHERE m.id NOT IN (SELECT COALESCE(customer_id, 0) FROM orders WHERE status = 'cancelled')",
        "LEFT JOIN no-show rows, then WHERE t.customer_id IS NULL — with the LEFT written as INNER by accident",
      ],
      answer: 0,
      why: "NOT EXISTS is a per-row probe — it never materializes the subquery into a list, so a NULL customer_id anywhere cannot poison the comparison the way NOT IN does, where one NULL makes every row UNKNOWN and the good-standing list silently empties.",
      notes: [
        { choice: 2, why: "The COALESCE guard does repair NOT IN — but it is a patch you must remember to write on every staging table. EXISTS is correct without ceremony, which is why the house style prefers it for existence tests." },
        { choice: 3, why: "An INNER anti-join is a contradiction — the join deletes the very rows the IS NULL test is looking for, and the list empties while the query compiles clean." },
      ],
      difficulty: "medium",
    },
    {
      id: "zipcar-mcq-22",
      prompt: "An intern's first query: SELECT DISTINCT region FROM customers. What comes back, and why is it not a pod census?",
      choices: [
        "Four rows — the distinct region values, with no counts, no book, no members attached",
        "Sixteen rows — one per member",
        "One row — the single busiest pod",
        "An error — DISTINCT needs an aggregate",
      ],
      answer: 0,
      why: "DISTINCT dedupes the projection: EU, APAC, US, LATAM, one row each, nothing else. It is the vocabulary move before the census — the census adds COUNT(*) and COUNT(DISTINCT customer_id) beside the distinct values.",
      notes: [
        { choice: 1, why: "That is SELECT region without DISTINCT. The dedupe is the entire job here." },
        { choice: 2, why: "The busiest pod needs GROUP BY region ORDER BY COUNT(*) DESC LIMIT 1 — a fold, not a projection." },
      ],
      difficulty: "easy",
    },
    {
      id: "zipcar-mcq-23",
      prompt: "'Top three members by reservations.' The utilization ladder runs 24, 17, 14, 13, 5, then FOUR members tied at 4. Which cut is defensible when the read ships to the member-success review?",
      choices: [
        "RANK() OVER (ORDER BY COUNT(*) DESC) and keep rank <= 3 — ties share a rung, so the boundary is a named policy, not a row count",
        "ORDER BY COUNT(*) DESC LIMIT 3",
        "LIMIT 3 with a code comment saying ties were ignored",
        "FETCH FIRST 3 ROWS WITH TIES",
      ],
      answer: 0,
      why: "Today the third/fourth boundary is clean (14 vs 13), so LIMIT 3 happens to work — but the ladder's tie structure is a guarantee, not an accident, and the day a tie straddles the cut, LIMIT splits it silently — deciding whose win-back visit happens by accident. RANK with an explicit threshold is a policy the next analyst inherits.",
      notes: [
        { choice: 3, why: "FETCH FIRST … WITH TIES is standard SQL that SQLite never implemented — it errors here. And the four-way tie at 4 sits nowhere near rank 3 today; the policy is about the ladder's shape, not this week's data." },
        { choice: 2, why: "A comment documents the flaw, it doesn't fix it. The review's question is who is top-three, and a tie at the boundary means the question itself needs the rank policy to answer." },
      ],
      difficulty: "hard",
    },
    {
      id: "zipcar-mcq-24",
      prompt: "The billing books carry INTEGER cents — a dunning invoice reads 493700. Which expression prints 4,937.00 dollars?",
      choices: [
        "ROUND(amount_cents / 100.0, 2)",
        "amount_cents / 100",
        "ROUND(amount_cents, 2)",
        "amount_cents — the column is already dollars",
      ],
      answer: 0,
      why: "The .0 divisor forces real division — 493700 / 100.0 = 4937.0 — and ROUND(…, 2) fixes the print. INTEGER / INTEGER is integer division, and the missing .0 is how cents quietly vanish on every odd-cent line.",
      notes: [
        { choice: 2, why: "ROUND(493700, 2) rounds the CENTS value to two decimals — a no-op. The unit conversion has to happen before the rounding." },
        { choice: 3, why: "The column name says cents and the dunning letter says dollars — shipping raw cents is how a 4,937.00 notice becomes 493,700.00 on the member's statement." },
      ],
      difficulty: "easy",
    },
    {
      id: "zipcar-mcq-25",
      prompt: "Cars emit fob events — unlock, lock, fuel-card swipe — many per reservation. The telemetry pipeline wants the LATEST event per car, full row. Which shape?",
      choices: [
        "ROW_NUMBER() OVER (PARTITION BY car_id ORDER BY event_at DESC), keep rn = 1",
        "SELECT car_id, MAX(event_at) FROM fob_events GROUP BY car_id",
        "ORDER BY event_at DESC LIMIT 1",
        "FIRST_VALUE(event_at) OVER (PARTITION BY car_id ORDER BY event_at)",
      ],
      answer: 0,
      why: "ROW_NUMBER numbers events newest-first within each car, and rn = 1 keeps exactly the latest full row per car. MAX-plus-GROUP BY returns the latest timestamp but not the row around it — and the pipeline needs the event payload, not just its stamp.",
      notes: [
        { choice: 2, why: "One global row — the newest event in the whole table. The per-car PARTITION is the entire requirement." },
        { choice: 3, why: "FIRST_VALUE yields a column, not rows — you still need the ROW_NUMBER-and-filter to reduce to one row per car." },
      ],
      difficulty: "medium",
    },
    {
      id: "zipcar-mcq-26",
      prompt: "The carpool-match feature pairs members who live in the same pod. The members table carries id, name and region. Which join shape lists each pair once?",
      choices: [
        "Self-join with ordered ids: JOIN customers b ON b.region = a.region AND a.id < b.id — 39 pairs on this db, each exactly once",
        "JOIN customers b ON b.region = a.region — every pair twice, plus every member paired with themselves",
        "UNION the members with themselves, then GROUP BY region",
        "CROSS JOIN customers and filter DISTINCT pairs",
      ],
      answer: 0,
      why: "The self-join binds the members table to itself under two aliases; the a.id < b.id predicate both forbids self-pairs and kills the mirrored duplicate — (1,3) survives, (3,1) and (1,1) never form. On this db the pod rosters produce 39 unordered pairs.",
      notes: [
        { choice: 1, why: "Without the ordering predicate, each pair appears twice (a-b and b-a) and every member matches themselves — 78 rows where 39 are real, and the match feed double-notifies every member." },
        { choice: 2, why: "UNION stacks rows and destroys the pairing — after the fold there is no member-member edge left to group." },
      ],
      difficulty: "hard",
    },
    {
      id: "zipcar-mcq-27",
      prompt: "Demand wants a 3-month rolling average of booked value on the month spine. Which window is correct?",
      choices: [
        "AVG(booked) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)",
        "AVG(booked) OVER (ORDER BY month RANGE BETWEEN 2 PRECEDING AND CURRENT ROW)",
        "AVG(booked) OVER () — the full-table average beside each month",
        "AVG(booked) OVER (PARTITION BY month)",
      ],
      answer: 0,
      why: "ROWS counts physical rows — the current month plus the two before it, a true trailing window. RANGE on a TEXT month key compares month STRINGS against arithmetic offsets, which is meaningless here; on this spine ROWS is the honest frame.",
      notes: [
        { choice: 2, why: "That is the overall mean printed on every row — no rolling anything, and every month's 'average' is identical." },
        { choice: 3, why: "PARTITION BY month puts each month in its own partition of one row — every rolling average becomes the month's own value. The partition is the enemy of the rolling read." },
      ],
      difficulty: "hard",
    },
    {
      id: "zipcar-mcq-28",
      prompt: "Member emails arrive as 'Maya.Patel@MAIL.com' from one app and 'maya.patel@mail.com' from another. The dedupe key needs one canonical form. Which expression builds it?",
      choices: [
        "LOWER(TRIM(email))",
        "UPPER(email) — and LOWER at read time",
        "INITCAP(email)",
        "REPLACE(email, ' ', '')",
      ],
      answer: 0,
      why: "LOWER normalizes case and TRIM kills the stray spaces that ride in from mobile inputs — together they make both spellings collide into one key, so the census counts members, not spellings.",
      notes: [
        { choice: 1, why: "UPPER is equally canonical — the failure is promising a second conversion 'at read time', which is how two canonical forms get born. Pick ONE and write it into the pipeline." },
        { choice: 2, why: "INITCAP capitalizes initials and keeps 'Maya.Patel' and 'maya.patel' distinct — the dedupe key must erase differences, not decorate them." },
      ],
      difficulty: "easy",
    },
    {
      id: "zipcar-mcq-29",
      prompt: "One row, two numbers: the whole reservation book AND the no-show book (34,833.28 total; the 7 no-shows carry 1,152.49 of it). Which SELECT delivers both in a single pass?",
      choices: [
        "SELECT SUM(total) AS booked, SUM(CASE WHEN status = 'cancelled' THEN total ELSE 0 END) AS no_show_book FROM orders",
        "SELECT SUM(total), SUM(total) FROM orders WHERE status = 'cancelled'",
        "SELECT SUM(total) AS booked, COUNT(status = 'cancelled') AS no_show_book FROM orders",
        "Two separate queries — one row per SELECT is impossible",
      ],
      answer: 0,
      why: "The CASE arm routes each row's total into either the no-show bucket or a zero, so both SUMs scan the same 103 rows in one pass — booked keeps every stage, no_show_book keeps only cancelled value.",
      notes: [
        { choice: 1, why: "The WHERE deletes 96 rows before either SUM runs — both columns now read the no-show book, and the total is gone." },
        { choice: 2, why: "COUNT of a boolean counts every non-NULL boolean — 103 again. The conditional needs the CASE (or FILTER) to route values, not count them." },
      ],
      difficulty: "easy",
    },
    {
      id: "zipcar-mcq-30",
      prompt: "The reservations table (pod denormalized onto it) is heading to millions of rows, and the morning dashboard always filters WHERE region = 'EU' AND status = 'delivered'. Which index serves it best?",
      choices: [
        "A composite index on (region, status) — both equality predicates, left to right",
        "An index on created_at — the dashboard sorts by it",
        "An index on total — the board sums it",
        "No index — below a million rows full scans are always faster",
      ],
      answer: 0,
      why: "Both filters are equality predicates on columns named in every morning query, so a composite (region, status) lets the engine seek straight to the matching slice. EXPLAIN QUERY PLAN tells the story — SEARCH … USING INDEX after, SCAN before — and that artifact is what you bring to the schema review.",
      notes: [
        { choice: 2, why: "An index on an aggregated column does nothing for a filter that never mentions it — the engine still reads every row to find EU completed reservations." },
        { choice: 3, why: "The crossover is workload-dependent, not a row-count law — a dashboard that runs every morning on a growing table is exactly when the composite index starts paying rent." },
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
    {
      id: "cs-zipcar-3",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass fleet census",
      brief:
        "Zipcar-flavored brief on the storefront db: fleet ops reads the reservation funnel per vehicle class in ONE scan — reservations drawing on the class, completed round trips, no-shows, and billable hours drawn. Probed facts: the seven classes split the funnel as Accessories 54 reservations / 25 completed / 3 no-shows / 121 hours, Audio 46 / 22 / 3 / 97, Electronics 40 / 19 / 3 / 85, Video 30 / 17 / 0 / 61, Wearables 23 / 8 / 0 / 53, Apparel 22 / 12 / 1 / 54, Fitness 13 / 4 / 2 / 27. A reservation that draws on two classes counts once in each — 228 class-touches over 103 reservations — which is why the census says 'drawing on the class', never 'owned by the class'. The board reads busiest class first.",
      ask: "Return each vehicle class with its reservation count, completed count, no-show count and billable hours, busiest class first.",
      template:
        "SELECT p.category AS vehicle_class,\n       COUNT(DISTINCT o.id) AS reservations,\n       COUNT(DISTINCT o.id) FILTER ({1} o.status = {2}) AS completed,\n       COUNT(DISTINCT o.id) FILTER (WHERE o.status = {3}) AS no_shows,\n       ROUND(SUM(oi.quantity), 1) AS hours\nFROM products p\nJOIN order_items oi ON oi.product_id = p.id\nJOIN orders o ON o.id = oi.order_id\nGROUP BY p.{4}\nORDER BY reservations {5};",
      slots: [
        {
          answer: "WHERE",
          kind: "keyword",
          label: "the FILTER clause keyword",
          why: "FILTER's grammar demands WHERE — FILTER (WHERE o.status = 'delivered') attaches the predicate to this aggregate alone. ON or nothing leaves a syntax error where a census column should be.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed literal",
          why: "Completed round trips are status 'delivered' — 52 platform-wide, 25 of them drawing on the busiest class. 'completed' is not a status value in this ledger: the column fills with zeros and the funnel's payoff stage vanishes.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the no-show literal",
          why: "No-shows are status 'cancelled' — 7 platform-wide, 3 of them drawing on each of the top three classes. 'no-show' is the business word, not the ledger's status value, and the wrong literal zeroes the trust column.",
        },
        {
          answer: "category",
          kind: "keyword",
          label: "the class fold key",
          why: "The class fold is p.category — 7 rows. GROUP BY p.name would print 16 single-model rows and the board loses its class shape while every number stays technically true.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "The census reads busiest class on top: Accessories 54 down to Fitness 13. ASC opens the meeting on the quietest class — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["ON", "'shipped'", "'pending'", "name", "ASC"],
      walkthrough:
        "Three joins, one scan, four census columns at two grains. The chain runs reservations through their billable lines to the vehicle model and its class; GROUP BY category folds the 251 lines into 7 class rows. COUNT(DISTINCT o.id) is the reservation counter — DISTINCT because a reservation whose lines touch two classes must count once per class, not once per line — and the two FILTER branches carve completed (delivered) and no-shows (cancelled) out of the same scan, so the funnel reconciles: 25 + 22 + 19 + 17 + 8 + 12 + 4 = 107 completions over 228 class-touches, matching the 52 completed reservations that drew on 1.4 classes on average. The hours column is the line-grain fact that is SUPPOSED to fan out: 121 + 97 + 85 + 61 + 53 + 54 + 27 = 498 billable hours. The distractors each break differently: ON fails FILTER's grammar outright; 'shipped' and 'pending' are real statuses but fill the wrong stage — underway (30) and reserved (14) readings that quietly mislabel the funnel; name as the fold key splinters 7 class rows into 16 model rows; ASC opens the board on Fitness's 13 reservations. Video and Wearables are the read-out-loud: zero no-shows — the classes whose pods need the reminder-cadence review least.",
    },
    {
      id: "cs-zipcar-4",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The utilization ladder",
      brief:
        "Zipcar-flavored brief on the storefront db: member-success opens every review with the utilization ladder — reservations and booked value per member, ranked with the tie policy named. Probed facts: the ladder runs 24, 17, 14, 13, 5, then FOUR members tied at 4 (Pedro Alvarez 1,686.17, Keiko Sato 1,098.60, Isabella Rossi 985.65, Noah Meyer 737.68), two at 3, three at 2 and two at 1; the top of the ladder is Alice Chen at 24 reservations / 7,262.35 booked. The floor in the query keeps members with at least 2 reservations, which drops the two 1-reservation members (444.80, 705.39) and keeps the tie block visible. RANK semantics: the tie consumes ranks 6 through 9 and the two 3-reservation members land on rank 10.",
      ask: "Return each member with at least 2 reservations: name, reservation count, booked value and utilization rank, best rank first with ties sharing a rung and the biggest book breaking them in the display.",
      template:
        "SELECT c.name AS member,\n       COUNT(*) AS reservations,\n       ROUND(SUM(o.total), 2) AS booked,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS utilization_rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id\nHAVING COUNT(*) >= {3}\nORDER BY utilization_rank, booked DESC;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the shared-rung rank function",
          why: "RANK gives the four-way tie the same rank and skips after — the two 3-reservation members land on rank 10, which is the published policy's honesty about five phantom positions. DENSE_RANK shares rungs without gaps (rank 7 next) and ROW_NUMBER splits peer members arbitrarily, deciding win-back order by accident.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "Rank 1 must be the busiest member, so the window ORDER BY runs descending: 24, 17, 14, 13, 5, then the tie at 4. ASC crowns the two 1-reservation members (before the floor cuts them) — a correct query answering the opposite question.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the ladder floor",
          why: "HAVING COUNT(*) >= 2 keeps the 14 members with at least two reservations — the tie block stays visible and the two single-reservation members (444.80, 705.39) drop off a ladder that is about repeat utilization. The floor judges a per-member aggregate, which is why it lives in HAVING, not WHERE.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "3"],
      walkthrough:
        "A fold, a floor, and a rank with a policy. The join attaches every reservation to its member; GROUP BY c.id folds 103 reservations into 16 members — folding on the id, displaying the name, so two members sharing a name can never merge. HAVING COUNT(*) >= 2 drops the two 1-reservation members (a group-level fact in the group-filter clause), and the window ranks what survives: 1 Alice (24), 2 Emma (17), 3 Grace (14), 4 Maya (13), 5 Chloe (5), then 6, 6, 6, 6 across the four-way tie at 4 — Pedro's 1,686.17 book breaking the display order, not the rank. RANK's gap semantics show in the tail: the two 3-reservation members share rank 10, gaps included, exactly the phantom-position honesty the published policy owns. The distractors each break differently: DENSE_RANK renumbers the tail to 7 and the policy silently changes; ROW_NUMBER splits the peer tie 6-7-8-9 and picks win-back order by accident; ASC crowns the quietest members; 3 as the floor drops the three 2-reservation members and the tie block's neighborhood. The display tie-breaker (booked DESC) sorts peers for reading but never changes a rank — the distinction between presentation and policy is the whole interview.",
    },
    {
      id: "cs-zipcar-5",
      tier: "hard",
      topic: "q6",
      universe: "growth",
      title: "The 3,000-plus cohort",
      brief:
        "Zipcar-flavored brief on the storefront db: member-success's concentration read isolates the heavy tail — members whose lifetime booked value crosses 3,000 — and prices their share of the book. Probed facts: exactly 4 of 16 members clear the bar — Alice Chen 7,262.35 (20.85% of the book), Emma Wilson 6,640.56 (19.06%), Grace Kim 4,574.23 (13.13%), Maya Patel 3,644.56 (10.46%) — carrying 22,121.70 together: the 63.5% concentration number the staffing memo quotes. The share denominator is the whole 34,833.28 book over all 103 reservations, and the cohort reads biggest lifetime first.",
      ask: "Return each 3,000-plus member with lifetime booked value and share of the whole book to 2 decimals, biggest lifetime first.",
      template:
        "WITH member_book AS (\n  SELECT c.name AS member,\n         ROUND(SUM(o.total), 2) AS lifetime\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id\n)\nSELECT member,\n       lifetime,\n       ROUND(100.0 * lifetime / (SELECT SUM(total) FROM orders), {1}) AS book_share\nFROM member_book\nWHERE lifetime >= {2}\nORDER BY lifetime {3};",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the share precision",
          why: "Shares print to 2 decimals — 20.85 / 19.06 / 13.13 / 10.46 — matching the concentration memo. ROUND(…, 1) prints 20.8 and the cohort read stops reconciling with the 63.5% headline, which sums the 2-decimal cells.",
        },
        {
          answer: "3000",
          kind: "number",
          noVerify: true,
          label: "the concentration floor",
          why: "The cohort definition IS the threshold — lifetime >= 3000 keeps exactly 4 members and their 22,121.70 (63.5%). Move it to 1000 and eight members qualify, diluting the heavy tail the memo is about; drop it to 0 and the read is the whole roster.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-member-first direction",
          why: "The cohort reads biggest lifetime on top: Alice 7,262.35 down to Maya 3,644.56. ASC opens the review on the smallest heavy member — a correct query aimed at the wrong end of the memo.",
        },
      ],
      distractors: ["1000", "ASC", "0", "1"],
      walkthrough:
        "A staged fold, a scalar denominator, and a named threshold. The CTE folds 103 reservations into 16 per-member lifetime books — the fold keyed on c.id so names can never merge — and the outer query keeps only the 3,000-plus rows: Alice 7,262.35, Emma 6,640.56, Grace 4,574.23, Maya 3,644.56, summing to 22,121.70, the 63.5% the memo quotes. The share divides each lifetime by (SELECT SUM(total) FROM orders) — the scalar subquery returns the whole 34,833.28 book as one row, the only row a scalar is allowed to return, and the 100.0-before-division keeps the shares real. The threshold is the definition: at 3,000 the cohort is 4 members and the story is concentration; at 1,000 it is 8 members and the story dissolves into 'half the roster'; the floor is quoted in the memo because the population IS the metric. The distractors each break differently: 1000 dilutes the cohort to 8 members, 0 floods it with all 16; 1 in the precision slot prints 20.8 and the cells stop summing to 63.5; ASC reads the heavy tail bottom-up. Two no-verify slots in one case is the tell that thresholds and precisions are definitions, not discoveries — the db verifies the cohort members, the memo verifies the numbers.",
    },
    {
      id: "cs-zipcar-6",
      tier: "easy",
      topic: "t4",
      universe: "inventory",
      title: "The booking-ahead calendar",
      brief:
        "Zipcar-flavored brief on the storefront db: fleet ops reads booking-ahead by month — how far members reserve ahead of the fob-checkout — because repositioning lead time must beat the booking-ahead window or the car is not there. Probed facts: 82 of 103 reservations carry the fob stamp (the 14 pending and 7 no-show rows have no clock and are excluded by policy, not silently); monthly leads run from 2.40 days (Jul 2024) to 3.71 (Aug 2024) against the 2.98 platform norm — 2024-01 5 stamped at 3.00, 2024-06 the shortest stamped month at 4, 2024-09 the busiest at 9 stamped averaging 2.89, 2025-01 at 2.50. Each month's row carries its booked count beside the stamped count so the stamp-less rows stay visible.",
      ask: "Return each month with its reservation count, stamped count and average booking-ahead days to 2 decimals, months in order.",
      template:
        "SELECT SUBSTR(created_at, 1, {1}) AS month,\n       COUNT(*) AS booked,\n       COUNT(shipped_at) AS stamped,\n       ROUND(AVG(julianday(shipped_at) - julianday(created_at)), {2}) AS lead_days\nFROM orders\nWHERE shipped_at {3}\nGROUP BY month\nORDER BY month;",
      slots: [
        {
          answer: "7",
          kind: "number",
          label: "the month-key width",
          why: "SUBSTR(created_at, 1, 7) carves 'YYYY-MM' — 14 ordered buckets from 2024-01 to 2025-02. Width 6 yields '024-01': same count, wrong labels, and every join to a '%Y-%m' spine misses.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the lead precision",
          why: "Leads print to 2 decimals — 3.00 / 3.25 / 2.80 / 3.14 — matching the probed monthly read the repositioning sync quotes. ROUND(…, 1) prints 3.1 and the calendar stops reconciling with the 2.98 platform norm.",
        },
        {
          answer: "IS NOT NULL",
          kind: "keyword",
          label: "the stamped-rows policy",
          why: "The clock exists only for stamped reservations, so WHERE shipped_at IS NOT NULL is the population definition, printed in the query — not AVG's silent NULL-skipping. IS NULL would serve the 21 stamp-less rows (14 pending, 7 no-show), which have no clock at all.",
        },
      ],
      distractors: ["6", "1", "IS NULL", "DESC"],
      walkthrough:
        "One table, one clock, one stated population. The month key is SUBSTR(created_at, 1, 7) — year plus zero-padded month, 14 buckets in order across the year boundary. The WHERE clause is the honesty: shipped_at IS NOT NULL is a stated policy, because the 14 pending and 7 no-show rows have no clock and must not dilute the average — and the booked column (COUNT(*)) beside stamped (COUNT(shipped_at)) keeps the gap visible month by month: 5/5 in January, 8/8 in February, 3/3 in the thinnest month, 9/9 in September's peak. The lead itself is julianday arithmetic — fractional days, so 2.40 in July and 3.71 in August are true elapsed-day averages against the 2.98 norm. The distractors each break differently: 6 shifts every label to '024-01' and orphans the spine; 1 collapses the calendar to a single bucket ('2'); IS NULL flips the query to the stamp-less rows, where AVG runs over an empty clock and every lead prints NULL; DESC reads the calendar backwards. The booked-beside-stamped pairing is the read-out-loud: when the two counts diverge, the unstamped population is growing — the repositioning queue's early-warning light.",
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
    { slug: "user-activity-for-the-past-30-days-i", why: "The 30-day reservation window per pod — Zipcar reads utilization inside rolling windows, and the boundary logic is the whole query." },
    { slug: "find-churn-risk-customers", why: "Members whose last reservation is drifting past their usual gap go on the win-back visit list before the next weekend — the dormant-cohort anti-join member-success runs weekly." },
    { slug: "cohort-retention-matrix", why: "Member cohorts by first-reservation month, retained by repeat bookings — the retention matrix the growth board opens with, one row per cohort, one column per month since." },
    { slug: "net-revenue-retention", why: "Member-book revenue retained and expanded period over period — the number that decides whether growth is new members or heavier members, and Zipcar's is a concentration story by construction." },
    { slug: "analyze-subscription-conversion", why: "Reserved-to-completed conversion as a funnel — the conditional-rate drill behind the round-trip completion metric the CEO quotes." },
    { slug: "plan-migration-paths", why: "Members switching casual to university to business plans — the plan-transition fold monetization reads quarterly, one hop per member, one row per path." },
    { slug: "the-number-of-users-that-are-eligible-for-discount", why: "University-plan eligibility from usage patterns — a conditional count over behavior thresholds, exactly how monetization prices the discount window." },
    { slug: "calculate-parking-fees-and-duration", why: "Fees banded by duration blocks — the CASE-band drill behind pod parking charges and the extra-hour pricing the fleet team reviews." },
    { slug: "find-zombie-sessions", why: "Reservations fobbed open that never closed — the never-returned session read fleet ops runs daily, because a car out with no return event is a recovery call waiting." },
    { slug: "sessionize-events", why: "Fob events stitched into reservation sessions — gaps-become-boundaries logic over timestamps, the telemetry pipeline's core transform." },
    { slug: "ar-aging-schedule", why: "Unsettled invoices bucketed by age — the dunning calendar the billing pod prints at every close, 6 never-settled invoices deep on this ledger." },
    { slug: "generate-the-invoice", why: "Assembling one billable statement per reservation from line items — the fold-and-format shape behind Zipcar's monthly member statement." },
    { slug: "prepayment-detection", why: "Payments that land before the invoice exists — deposits and prepaids that must pair forward, the mirror of the settlement anti-join." },
    { slug: "deferred-revenue", why: "Prepaid membership recognized month by month — the accrual walk finance runs on the membership book, one month per column." },
    { slug: "mrr-waterfall", why: "Monthly membership revenue walked new, expanded, contracted, churned — the four-way classification that explains why the book moved, not just that it moved." },
    { slug: "flight-occupancy-and-waitlist-analysis", why: "Capacity against demand with a waitlist beside it — the utilization-per-parking-spot read that decides which pods gain cars and which shed them." },
  ],
};
