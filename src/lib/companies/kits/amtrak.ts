// Amtrak — Wave-9 (Task 98), travel domain. No Amtrak section in company-pools.md
// (0 tagged rows) — all 10 topic slug sets and all 16 problems are theme-curated
// from the pools file's SQL rows (no w*/d*/f* rows); provenance stated here and in
// brief P4. Facts from scripts/company-facts.md (probed 2026-10-12); every case
// figure probe-verified against db/custom.db (readonly copy, deleted after).
// db mapping (operator-side, rail-honest): customers = Guest Rewards riders (region
// = corridor/market: EU = Northeast Corridor, APAC = state-supported corridors,
// US = long-distance overnight network, LATAM = specialty lane), orders = booked
// journeys/reservations (delivered = completed-and-settled 52, shipped = in-progress
// with shipped_at as the departure stamp 30, pending = booked-awaiting-departure 14,
// cancelled = cancelled reservation 7), order_items = reservation component lines
// (fares, upgrades, ancillaries: quantity = units, unit_price = unit fare), products
// = travel classes & passes (Coach/Business/Sleeper/Acela First; db category codes
// stand for fare families), suppliers = host railroads & station concession
// partners, invoices = settlement/host-charge statements, payments = settlement
// legs (card vs wire rails), expenses = corridor opex, ledger_entries = GL.
// Money: orders.total/unit_price REAL dollars; finance tables INTEGER cents
// (/100.0). Scale: 16 riders, 6 partners, 16 classes, 103 journeys, 251 lines,
// 28 statements, 27 legs, 36 opex entries, 80 GL entries.

import type { CompanyKit } from "../types";

export const amtrakKit: CompanyKit = {
  id: "amtrak",
  domainId: "travel",
  name: "Amtrak",
  tagline: "America's operator: corridor yield, overnight sleepers, on-time performance",
  accent: "text-zinc-400",

  brief: [
    "**Amtrak** is America's national rail operator — the company that runs **Acela** and Northeast Regional over the Northeast Corridor, threads overnight sleeper routes across the country, and publishes on-time performance its host railroads co-author. The operator reality shapes the data: Amtrak sells reserved seats over tracks it mostly does not own, so every punctuality and yield number is read at the mercy of a host-railroad handoff. This kit maps the storefront db onto that world: the 16 customers rows are {sky:Guest Rewards} riders, the 103 orders are booked journeys worth **34,833.28**, and the 251 order_items rows are reservation component lines — fares, upgrades, ancillaries. The fate map is fixed: delivered = completed-and-settled (52, 50.5%), shipped = in-progress with shipped_at as the departure stamp (30, 29.1%), pending = booked-awaiting-departure (14), cancelled = {rose:cancelled reservations} (7, 6.8%).",
    "The data org splits into {emerald:corridor ops}, revenue management and a small settlement-accounting pod, and all three read the same reservation spine at different grains. A journey books at created_at; shipped_at is stamped when it departs — **82 of 103 journeys** carry the stamp, averaging **2.98 days** of booking lead with a 2–4 day spread, and the 14 awaiting rows have none yet (a population definition, not a cleanup job). Corridor lead times diverge honestly: EU 2.94, APAC 2.93, US 3.07, LATAM 3.5 days over stamped journeys only. Money sits one layer down: settlement statements, legs, opex and the GL in INTEGER cents, so the dollar read is `amount_cents / 100.0` — *the missing .0 is how a reconciliation fires*.",
    "Interview screens are census-then-denominator. A typical loop opens with the **two-grain corridor census** — the NEC reads 45 booked journeys from 8 riders while the US long-distance book reads 19 from 2 — then escalates into a rate where the interviewer asks the denominator out loud (*'do cancelled reservations count in your base?'*), then into the rider ladder where four riders sit tied at 4 journeys and rank semantics become a loyalty-policy decision. Late rounds walk the {sky:14-month booking spine} (2024-01 to 2025-02) with LAG deltas and probe the first row's NULL. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Amtrak section, so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes — departure funnels, two-grain corridor censuses, {rose:cancellation shares}, tie-heavy rider ladders, lead-time clocks and the cents-safe settlement spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:corridor departure census} corridor ops opens with, the other rebuilds the {amber:opex close stack} the comptroller signs. The bar to clear: *state the population and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the reservation-book refresh. A corridor analyst opens the dashboard before standup: did overnight bookings land, did any in-progress journey get its `shipped_at` stamp without a matching completed leg, does the one-pass fate census reconcile — 52 completed + 30 in-progress + 14 awaiting + 7 cancelled = **103 by construction**? A branch that fails the identity is *the day's first incident*, not a rounding note. If booking lead drifts off the **2.98-day** norm, the advance-purchase queue gets pulled before revenue management's weekly yield read ships.",
    "**11:30 —** Midday is the corridor deep-dive. Revenue management wants the two-grain census re-cut — NEC 45 journeys from 8 riders against the US sleeper book's 19 from 2 — with {rose:cancellation shares} beside it (APAC 8.1%, EU 6.7%, US 5.3%); the loyalty pod wants the rider ladder's {sky:four-way tie} at 4 journeys handled honestly — shared rungs, named policy; a state-corridor partner wants lead time in days, not adjectives. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the yield-review argument*.",
    "**15:30 —** The afternoon tilts toward the close. The AR anti-join refreshes first — **6 never-collected statements worth 15,217** — before any dunning goes out; the coverage split reads 21 exact, 1 partial (4,000 of 6,148 settled) and feeds the receivables draft; the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero settlement legs (#28, 1,756.00). Then the opex fold: four corridor lines footing to **25,416** — {emerald:tied to the GL}, or the close does not ship. The day ends the way every close does: the trial balance must read **181,080 against 181,080**, delta zero, and tomorrow's departures board inherits queries, not mysteries.",
  ],

  metrics: [
    { name: "Completed-journey rate", what: "Delivered (completed-and-settled) journeys ÷ ALL journeys booked: 52 of 103 (50.5%). The operator's kept-rate — a status-filtered conditional count whose denominator is the whole interview." },
    { name: "Departure-stamp coverage", what: "Journeys with shipped_at stamped ÷ all booked: 82 of 103 (79.6%). The 14 awaiting rows are 'not yet', never a silent zero — and the 7 cancelled never had a stamp to give." },
    { name: "Booking lead time", what: "created_at → shipped_at over departed journeys only: 2.98-day average, 2–4 spread. The corridor cut — EU 2.94, APAC 2.93, US 3.07, LATAM 3.5 — decides where advance-purchase yield actions land." },
    { name: "Cancellation share", what: "Cancelled reservations ÷ booked, by corridor: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The fate map ops reads weekly; the denominator (all booked) is the metric." },
    { name: "Journey book value", what: "Total booked value: 34,833.28 across 103 journeys, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the class story — one 1,088.44 sleeper booking outweighs the smallest 42 combined." },
    { name: "Rider concentration", what: "Share of the book from riders whose lifetime spend crosses 3,000: 63.5% (71.2% above 2,000). One lost Guest Rewards logo moves a corridor's quarter." },
    { name: "Component-line depth", what: "Reservation component lines ÷ journeys: 251 across 103 bookings. Upgrades and ancillaries show up here first — a new line item, not a new journey." },
    { name: "Settlement coverage", what: "Statements versus collected legs: 21 exact, 1 partial (4,000 of 6,148 settled), 6 never-collected worth 15,217. The AR anti-join the settlement pod refreshes every close." },
  ],

  topics: [
    {
      name: "The departure funnel",
      why: "Every Amtrak screen opens with the reservation book: journeys booked, departure-stamped, completed-and-settled, cancelled. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-progress journey 'completed' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain corridor censuses",
      why: "Journeys and riders are different grains of the same join, and every corridor census here reports both: the NEC runs 45 booked journeys from 8 riders while the US long-distance book runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining riders to journeys",
      why: "Riders carry corridor and created_at; journeys inherit them through joins, and the join type decides who survives. A journey without a rider is corruption; a rider without journeys is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "Class mix & CASE banding",
      why: "Coach, Business, Sleeper, Acela First — the class ladder is CASE-classified at every yield review, with fixed edges the fare page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the load forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "type-of-triangle"],
    },
    {
      name: "Booking lead-time clocks",
      why: "Lead time is julianday arithmetic over a stamp that only departed journeys carry, and the corridor cut (2.94 / 2.93 / 3.07 / 3.5) is an operational planning input, not a vanity metric. Amtrak drills date filtering here too — journeys booked in a window, latest booking per rider — because advance-purchase windows drive the yield curve.",
      slugs: ["average-time-of-process-per-machine", "list-the-products-ordered-in-a-period", "the-latest-login-in-2020"],
    },
    {
      name: "Rider leaderboards",
      why: "The Guest Rewards ladder ranks riders by journeys and lifetime spend, and ties are guaranteed — four riders sit at 4 journeys each on this db, behind the 24, 17, 14, 13, 5 rungs. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a loyalty policy, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Anti-joins on the settlement book",
      why: "Booked is not settled: the finance tables are where the operator world meets money, and the 6 never-collected statements worth 15,217 ARE an anti-join. The LEFT JOIN + IS NULL shape (and its NOT EXISTS twin) shows up in most screens as the 'who do we dunning-call first' question — and the mirror anomaly (a void statement WITH a leg) is why the status column never gets trusted alone.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "employees-with-missing-information"],
    },
    {
      name: "One-pass censuses",
      why: "The ops board gets completed, in-progress, awaiting and cancelled in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Cents discipline & coverage",
      why: "Settlement statements and legs carry INTEGER cents, and every dollar read is amount_cents / 100.0 — the house rule interns learn the hard way. The exact/partial/none coverage split (21 / 1 / 6) is one CASE away, and the monthly rollup is where per-month folds with cents-safe arithmetic get practiced.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
    {
      name: "Windows over the corridor spine",
      why: "Corridor reporting keeps every row while adding context: each rider beside their ladder position, each journey beside the load around it. Window COUNT and gap reads — the biggest spacing between a rider's touches, the running math behind capacity walks — are the shapes Amtrak uses to find the repeat-riding habit and the dormant rider.",
      slugs: ["biggest-window-between-events", "find-the-team-size", "last-person-to-fit-in-the-bus"],
    },
  ],

  theory: [
    {
      id: "amtrak-t1",
      q: "Your corridor report joins riders to journeys. When do you INNER and when do you LEFT — and what silently breaks if you filter a journey column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins journeys to riders: a journey with no rider row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A coverage report must be LEFT from riders: riders with no journeys would BE the answer, arriving with NULL journey columns — on this db the anti-join returns a confident zero, and proving the zero is part of the job: all 16 Guest Rewards riders appear in the reservation book somewhere. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. The same discipline runs the settlement fold: statements LEFT JOIN legs, keep the NULL side, and the 6 never-collected statements worth 15,217 ARE the AR page — plus the mirror trap, a void statement WITH a leg (#11, 925), which the anti-join will never surface.",
      tag: "joins",
    },
    {
      id: "amtrak-t2",
      q: "Four riders tie at 4 journeys on the Guest Rewards ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. On this db the ladder runs 24, 17, 14, 13, 5 journeys — then FOUR riders tied at 4. RANK gives the tie the same rung and then skips: the tie consumes ranks 6 through 9 and the next distinct count (3 journeys) lands on 10, implying four phantom rungs that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits the tie arbitrarily, a silent judgment about whose rider-success pod gets the headcount. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer riders, or an explicitly named tie-breaker like created_at then id — and writing it into the query comment. On a corridor leaderboard ties are the norm, not the edge case.",
      tag: "windows",
    },
    {
      id: "amtrak-t3",
      q: "The census shows 103 booked journeys and 16 riders; the NEC shows 45 journeys and 8 riders. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts journey rows after the join — one row per booked journey, so the rider with 24 journeys contributes 24. COUNT(DISTINCT customer_id) folds repeats back to riders — the NEC's 45 journeys collapse to 8 logos. Neither is wrong: journeys measure load and corridor momentum; riders measure installed base and coverage. The ratio — 5.6 journeys per rider on the NEC versus 9.5 in the US long-distance book — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join the 251 reservation component lines for upgrades and ancillaries and COUNT(*) silently counts lines, not journeys. Saying 'one row per what?' for every COUNT is the habit the panel grades — at an operator, load, coverage and component depth are three different numbers wearing one report.",
      tag: "aggregation",
    },
    {
      id: "amtrak-t4",
      q: "shipped_at is NULL until a journey departs. What is your policy for the booking-lead report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only departed journeys carry a stamp, so the report measures booking-to-departure for the 82 of 103 journeys that carry shipped_at — averaging 2.98 days with a 2–4 spread — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL journeys returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 booked-awaiting-departure plus 7 cancelled reservations, which is a feature, not a bug. What is never acceptable is IFNULL-ing the lead to zero to 'fix' the average — that invents same-day departures for journeys that have not left. The corridor cut (EU 2.94, APAC 2.93, US 3.07, LATAM 3.5) is computed over stamped journeys only, and the population definition ships with the number — a report whose WHERE clause does definitional work without saying so is exactly what an Amtrak reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "amtrak-t5",
      q: "The corridor review wants completed-journey value per corridor for corridors carrying at least ten booked journeys. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-progress, awaiting and cancelled rows before any fold, so it lives in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-journey floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. On this db the floor keeps the NEC (45), the state corridors (37) and the long-distance book (19), and drops LATAM's 2. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a corridor load line and an error, and between a floor applied to journeys versus to dollars. The strong answer places every filter by asking: is this a fact about one reservation, or about a corridor?",
      tag: "pipeline",
    },
    {
      id: "amtrak-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full book that is theoretical: 103 journeys always produce a mean fare (338.19), and the journeys above it are the premium-cabin story. On filtered staging — one corridor, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each journey to ITS corridor's average) re-runs per outer row and answers a different question at a different cost — and at an operator that question is the real one: a 400 fare is unremarkable on the sleeper network and an outlier on a state corridor. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "amtrak-t7",
      q: "The booking trend buckets journeys by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the seasonality story becomes fiction. The window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and month-end is exactly when advance reservations land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The walk tells the yield story: the book opens at 3,731.97, troughs at 1,193.86 in July 2024, jumps +1,158.21 into August, then takes the steepest drop, −1,326.87, into November. Date discipline is revenue-management discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "amtrak-t8",
      q: "Finance says a settlement statement is 'paid' but the legs table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN settlement legs, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero legs: a status that lies, which is why settlement rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 quietly eats cents on every odd-cent row and mislabels thousands as units. Coverage must read 21 exact / 1 partial (4,000 of 6,148 settled) / 6 never-collected, the opex fold must tie to the GL's operating_expenses account at 25,416, and the trial balance must land 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "amtrak-mcq-1",
      prompt: "A reservation row's status reads 'delivered'. In this kit's journey-fate map, what happened?",
      choices: ["The journey completed and settled — it counts as kept", "The journey is in progress, departure stamped", "Booked and awaiting departure", "A cancelled reservation"],
      answer: 0,
      why: "The fate map is fixed: delivered = completed-and-settled — 52 of 103 journeys (50.5%). It is the only status where the journey has actually run and the fare has settled.",
      notes: [
        { choice: 1, why: "In-progress is 'shipped' — 30 journeys with a departure stamp that have not completed. Calling them completed inflates the kept rate before a single trip finishes." },
        { choice: 2, why: "Booked-awaiting-departure is 'pending' — 14 journeys with no shipped_at yet. Pending is not kept and not lost; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "amtrak-mcq-2",
      prompt: "Departure-stamp coverage is stamped journeys ÷ which population? The db holds 82 stamped, 14 awaiting, 7 cancelled of 103 booked.",
      choices: ["Stamped + cancelled only (82/89 = 92.1%)", "All journeys booked (82/103 = 79.6%)", "Completed journeys only (52/82)", "Distinct riders (82/16)"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL journeys booked — the 14 awaiting rows stay in the denominator because 'not yet departed' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 awaiting inflates the rate to 92.1% by deleting the population still ahead of departure — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — completed is fate, shipped_at is the departure stamp. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "amtrak-mcq-3",
      prompt: "The NEC carries 45 booked journeys from 8 riders. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts journey rows (45); COUNT(DISTINCT customer_id) folds repeats back to riders (8). The gap between them — 5.6 journeys per rider — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every journey has a rider. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts corridors, not riders — a third grain nobody asked for. The census is journeys AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "amtrak-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to cancelled reservations only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the cancellation share truncates toward 0 and every corridor reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the cancellation map reads zero everywhere, including APAC's 8.1%." },
      ],
      difficulty: "medium",
    },
    {
      id: "amtrak-mcq-5",
      prompt: "Keep only corridors carrying at least 10 booked journeys. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY corridor HAVING COUNT(*) >= 10", "WHERE journeys >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A journey-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the floor keeps EU (45), APAC (37) and US (19), and drops LATAM's 2.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'journeys' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "amtrak-mcq-6",
      prompt: "The rider ladder runs 24, 17, 14, 13, 5 journeys, then FOUR riders tied at 4. Under RANK, what rank do the two 3-journey riders carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-journey riders share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The ladder's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "amtrak-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-lead rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The awaiting journeys double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 journeys.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "amtrak-mcq-8",
      prompt: "A staging-table exclusion uses rider_id NOT IN (SELECT customer_id FROM journeys WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every journey carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty exclusion reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "amtrak-mcq-9",
      prompt: "A close packet stacks never-settled statements under settled statements in one layout, built with UNION. A reviewer says one statement's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same statement, same amounts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same statement id, same amounts, no branch label — collapse into one, and the close packet loses a statement with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "amtrak-mcq-10",
      prompt: "A dashboard walks booked value journey by journey: SUM(total) OVER (ORDER BY created_at). Two journeys share a booking timestamp, and the cumulative 'jumps two journeys at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so journeys tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at journey grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-amtrak-1",
      tier: "easy",
      topic: "j7",
      universe: "funnel",
      title: "The corridor departure census",
      brief:
        "Corridor ops memo on the storefront db: Monday's corridor review opens with the departure census — booked journeys that have actually departed, distinct riders covered, and the average booking-to-departure lead — and revenue management is explicit that the lead average runs over departed journeys only, with the population stated on the slide. Probed facts: 103 booked journeys worth 34,833.28; 82 carry the departure stamp (shipped_at), averaging 2.98 days of lead with a 2-4 day spread; the corridor split reads EU 36 departed from 8 riders at 2.94 days, APAC 29 from 5 at 2.93, US 15 from 2 at 3.07, LATAM 2 from 1 at 3.5. The review reads biggest journey count first.",
      ask: "Return each corridor with its departed-journey count, distinct rider count and average booking lead to 2 decimals, biggest journey count first.",
      template:
        "SELECT c.region AS corridor,\n       COUNT(*) AS journeys,\n       COUNT({1} o.customer_id) AS riders,\n       ROUND(AVG(julianday(o.{2}) - julianday(o.created_at)), {3}) AS avg_lead_days\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.shipped_at IS {4} NULL\nGROUP BY c.region\nORDER BY journeys {5};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the rider deduplicator",
          why: "COUNT(DISTINCT o.customer_id) folds repeat journeys back to riders: the NEC reads 8, not 36. SUM(DISTINCT …) adds id codes together and MAX(DISTINCT …) reports the largest id — neither is a census.",
        },
        {
          answer: "shipped_at",
          kind: "keyword",
          label: "the departure stamp",
          why: "Lead time is booking to DEPARTURE: julianday(o.shipped_at) - julianday(o.created_at). Using created_at on both sides zeroes every lead — a day minus itself — and the corridor clock reads 0.0 while looking valid.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the lead precision",
          why: "Lead reports to 2 decimals — the NEC's 2.94. ROUND(…, 1) prints 2.9 and the corridor map stops reconciling with the 2.98-day platform average revenue management quotes on the same slide.",
        },
        {
          answer: "NOT",
          kind: "keyword",
          label: "the departure guard",
          why: "shipped_at IS NOT NULL keeps only the 82 departed journeys — the 14 awaiting have no stamp yet and no lead to average. Dropping NOT flips the filter to IS NULL and the census suddenly reads the 21 never-departed rows.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review reads biggest journey count on top: EU 36, APAC 29, US 15, LATAM 2. ASC would open the meeting on LATAM's 2 — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", "1", "ASC", "NULL", "created_at"],
      walkthrough:
        "One join, one fold, four columns at two grains. The join attaches every journey to its rider's corridor — the WHERE keeps only the 82 departed journeys — and GROUP BY region folds them into four rows where COUNT(*) reads departures (EU 36, APAC 29, US 15, LATAM 2), COUNT(DISTINCT o.customer_id) reads rider coverage (8 / 5 / 2 / 1), and ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) reads lead days (2.94 / 2.93 / 3.07 / 3.5) — straight from the probed census, reconciling upward to the 2.98-day platform average over the stated 82-row population. The 14 awaiting and 7 cancelled reservations never enter: no stamp, no departure, no lead. The distractors fail honestly: SUM in the rider slot adds customer ids together and MAX reports the largest id — a census of nothing; created_at in the stamp slot subtracts a day from itself and every corridor reads 0.0; 1 in the precision slot truncates to one decimal so the map drifts off the 2.98 average; dropping NOT flips the filter to IS NULL and the census counts the 21 never-departed rows; ASC opens the review on LATAM's 2. The two-grain pairing is the read: EU's 36-from-8 (4.5 departures per rider) versus the US's 15-from-2 (7.5) says the long-distance book concentrates while the corridor broadens — one query, two business claims.",
    },
    {
      id: "cs-amtrak-2",
      tier: "medium",
      topic: "x3",
      universe: "expense",
      title: "The corridor opex close stack",
      brief:
        "Comptroller memo on the storefront db: month-close ships when the corridor opex fold ties to the GL, and the close packet wants the opex stack in one query — per-line spend, entry counts, and a grand-total row that must reconcile to the ledger. Probed facts: 36 opex entries across four lines — Rent (track and facility leases) 14 entries / 16,800, Ads (marketing and Guest Rewards promos) 14 / 4,570, Travel (crew deadhead) 3 / 2,521, Tools (engineering tooling) 5 / 1,525 — footing to 25,416, which is exactly the operating_expenses account's debit balance in the ledger. Figures are the dollar read of the settlement book's INTEGER cents (amount_cents / 100.0). The packet reads biggest spend first with the TOTAL row last.",
      ask: "Return each opex line with spend in dollars and entry count, plus one TOTAL row footing the book, biggest spend first and TOTAL last.",
      template:
        "WITH opex AS (\n  SELECT {1} AS line,\n         SUM({2}) / 100.0 AS spend,\n         COUNT(*) AS entries\n  FROM expenses\n  GROUP BY line\n)\nSELECT line, spend, entries, 0 AS stack_order FROM opex\nUNION ALL\nSELECT {3}, SUM(amount_cents) / 100.0, COUNT(*), 1 FROM expenses\nORDER BY stack_order, spend {4};",
      slots: [
        {
          answer: "category",
          kind: "keyword",
          label: "the opex fold key",
          why: "The packet folds by opex line: GROUP BY category via the line alias — Rent, Ads, Travel, Tools. Folding by spent_on or id re-buckets the book into 37 near-singleton rows and the GL tie evaporates.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the cents measure",
          why: "Spend is SUM(amount_cents) / 100.0 — the INTEGER-cents dollar read. Summing id codes instead prices Ads at 2.65; summing the spent_on date strings prices it at 283.38 — both look like money, neither is.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-row label",
          why: "The second arm folds the whole table again under 'TOTAL' (36 entries / 25,416) so UNION ALL appends exactly one grand row. A label the close packet does not recognize — 'GRAND TOTAL' — breaks every downstream reference to the packet.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-spend-first direction",
          why: "The packet reads Rent 16,800, Ads 4,570, Travel 2,521, Tools 1,525 with the TOTAL row held last by the stack_order guard. ASC flips the packet to smallest-spend-first — a correct fold presented backwards.",
        },
      ],
      distractors: ["spent_on", "id", "COUNT", "ASC", "line", "'GRAND TOTAL'"],
      walkthrough:
        "Two stages: fold the book, then stack the total. The CTE groups the 36 opex entries by line and folds SUM(amount_cents) / 100.0 — the INTEGER-cents dollar read — beside COUNT(*): Rent 14 entries / 16,800, Ads 14 / 4,570, Travel 3 / 2,521, Tools 5 / 1,525. The second arm folds the whole table again under the 'TOTAL' label (36 / 25,416) and UNION ALL appends it; the stack_order guard column (0 for lines, 1 for the grand row) sinks the total below the fold while spend DESC orders the lines big-to-small. The tie is the whole point: 25,416 equals the ledger's operating_expenses debit balance, and the ledger's trial balance lands 181,080 debits against 181,080 credits — delta zero, or the close does not ship. The distractors fail honestly: spent_on in the fold key re-buckets by spend date into 37 near-singleton rows, and id does the same by entry id; id in the measure sums id codes (Ads reads 2.65) and spent_on sums date strings (Ads reads 283.38) — both fake money; COUNT in the measure errors on nested aggregates; 'GRAND TOTAL' relabels the grand row so the close packet's references miss; ASC flips the packet to smallest-first. One query, one packet, one tie to the GL.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-ii", why: "Per-class fare revenue: SUM over reservation component lines grouped by travel class is exactly the class-yield fold revenue management opens every corridor review with." },
    { slug: "immediate-food-delivery-ii", why: "Journeys ticketed within a week of departure versus far-ahead bookings — a conditional share over a timestamp comparison, the same shape as the corridor booking-lead read." },
    { slug: "employee-bonus", why: "Riders LEFT JOINed to journey spend: a rider with no journeys is whitespace, a journey with no rider is corruption — choosing the join type is the business statement." },
    { slug: "confirmation-rate", why: "Completion share per rider with COALESCE — Guest Rewards riders who never completed a journey must still appear, at zero, not vanish from the loyalty report." },
    { slug: "queries-quality-and-percentage", why: "Fare yield with a CASE percentage — the same 100.0-before-division discipline the cancellation map (APAC 8.1%, EU 6.7%) is built on." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-journey rider — finding the account with the most booked journeys is the opening line of the concentration story (63.5% of the book from 3,000-plus riders)." },
    { slug: "managers-with-at-least-5-direct-reports", why: "Corridor HAVING gates: which corridors carry at least ten booked journeys — the group-level floor that separates load lines from noise." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Component lines above the platform-average unit count — a two-stage fold (compute the mean, then filter against it), exactly the ancillary-attach screen." },
    { slug: "game-play-analysis-iv", why: "First departure stamp per rider, then the next touch — first-journey-to-return logic is how the loyalty pod measures the repeat-riding habit." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Class-migration reads: riders who rode Coach AND Business but never Sleeper — conditional aggregation over the class ladder, the upsell cohort." },
    { slug: "sales-by-day-of-the-week", why: "Weekday-versus-weekend departure load pivoted across the week — corridor capacity planning's favorite strftime/CASE drill." },
    { slug: "second-highest-salary", why: "The second-priciest fare product without LIMIT-1-OFFSET-1 — the tie-safe subquery shape the fare ladder (max 199.99 against an 8-deep mid band) demands." },
    { slug: "not-boring-movies", why: "Filtered, ordered departure boards — parity and length filters with ORDER BY, the small drill that keeps public listings honest." },
    { slug: "report-contiguous-dates", why: "Consecutive service days on a corridor spine — gaps-and-islands logic is how ops strings together daily service patterns before a disruption review." },
    { slug: "top-travellers", why: "Lifetime value per rider, joined and ordered — the Guest Rewards leaderboard is this query with a loyalty overlay and a tie policy." },
    { slug: "sales-analysis-iii", why: "Journeys completed inside a window — the date-filtered fold the corridor review ships every week, filtered before the fold and denominator stated." },
  ],
};
