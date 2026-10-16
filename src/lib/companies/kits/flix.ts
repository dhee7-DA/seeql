// FlixBus — Wave-10 (Task 100), travel domain. No Flix section in company-pools.md
// (0 tagged rows) — all 10 topic slug sets and all 16 problems are theme-curated
// from the pools file's theme menu (sql rows only, no w*/d*/f* rows); provenance
// stated here and in brief P4. Facts from scripts/company-facts.md (probed
// 2026-10-12, incl. the wave-8+9 probe-derived canonical cells); every case figure
// probe-verified against a readonly COPY of db/custom.db (deleted after).
// db mapping (asset-light partner-operator network, ground-travel house convention
// per amtrak/trainline): customers = passengers (region = market buckets), orders =
// bookings (delivered = traveled 52, shipped = ticketed-in-flight-future with
// shipped_at as the departure stamp 30, pending = held 14, cancelled = refunded 7),
// order_items = seat/fare line records (quantity = seats, unit_price = fare per
// seat), products = fare classes & route SKUs (db category codes = route families),
// suppliers = partner-operator companies (Flix owns no coaches — partners run them),
// invoices = settlement statements, payments = payment rails (card 16/37,364.00 vs
// wire 11/32,248.00), expenses = network opex, ledger_entries = GL. Money: finance
// tables INTEGER euro-cents (read = amount_cents / 100.0); orders.total and
// order_items.unit_price are REAL dollars. Scale: 16 passengers, 6 partner
// operators, 16 fare classes, 103 bookings, 251 seat lines, 28 statements, 27
// legs, 36 opex entries, 80 GL entries. Angle kept DISTINCT from amtrak (national
// rail operator) and trainline (ticketing aggregator): the asset-light
// partner-operator network, seat-km yield economics, dynamic fare bands and
// green-mobility framing.

import type { CompanyKit } from "../types";

export const flixKit: CompanyKit = {
  id: "flix",
  domainId: "travel",
  name: "FlixBus",
  tagline: "Green intercity coach network: partner fleets, seat-km yield, dynamic fares",
  accent: "text-green-300",

  brief: [
    "**FlixBus** is the green intercity coach network — the company that turned the long-distance bus from a last resort into the default budget ride across Europe and North America, threading thousands of destinations through one app and one green livery. The operating model is the story every analyst here learns first: Flix is {emerald:asset-light} — it owns almost no coaches, and partner bus companies run the routes to Flix's standard, so every network number here is read through the partner bench, not an owned fleet. This kit maps the storefront db onto that world: the 16 customers rows are passengers, the 103 orders are booked journeys worth **34,833.28**, and the **251 order_items rows** are seat/fare lines — quantity = seats, unit_price = the fare the yield engine printed. The fate map is fixed: delivered = traveled (52, 50.5%), shipped = ticketed-in-flight with shipped_at as the departure stamp (30, 29.1%), pending = held (14), cancelled = {rose:refunded} (7, 6.8%).",
    "The data org splits into network planning, yield & pricing and a small partner-settlement pod, and all three read the same booking spine at different grains. A booking is created at created_at; shipped_at is stamped when the journey departs — **82 of 103 bookings** carry the stamp, averaging **2.98 days** of booking-to-departure lead with a 2–4 day spread, and the 14 held rows have none yet (a population definition, not a cleanup job). Market leads diverge honestly over stamped journeys only: **EU 2.94, APAC 2.93, US 3.07, LATAM 3.5** days. Money sits one layer down: settlement statements, legs, opex and the GL in INTEGER euro-cents, so the dollar read is `amount_cents / 100.0` — *the missing .0 is how a partner reconciliation fires*.",
    "Interview screens are census-then-denominator. A typical loop opens with the **two-grain market census** — EU runs **45 bookings from 8 passengers** while the US runs 19 from 2 — then escalates into a rate where the interviewer asks the denominator out loud (*'do refunded bookings count in your base?'*), then into the {sky:seat-line fan-out} where joining fare lines silently turns **103 bookings into 251 rows**, and yield-per-seat must be units-weighted, not a plain AVG. Late rounds walk the 14-month booking spine (2024-01 to 2025-02) with LAG deltas and probe the first row's NULL. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries **no Flix section**, so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes — departure funnels, two-grain market censuses, refund shares, fare-band CASE ladders, tie-heavy leaderboards, lead-time clocks and the cents-safe settlement spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:traveled-book census} network planning opens Monday with, the other rebuilds the {amber:partner-operator manifest} the fleet desk reads before the quarterly partner review. The bar to clear: state the population and the denominator before you compute anything — then make every fate census **reconcile to 103 by construction**.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the network board refresh. A planning analyst opens the dashboard before standup: did overnight bookings land, did any ticketed journey get its `shipped_at` stamp without a matching departure, does the one-pass fate census reconcile — 52 traveled + 30 in-flight + 14 held + 7 refunded = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If booking lead drifts off the **2.98-day** norm, the advance-purchase queue gets pulled before yield management's weekly fare-banding read ships.",
    "**11:30 —** Midday is the yield deep-dive. Pricing wants the fare-band ladder re-cut — **268 seats at a 31.01 average line fare** below the 55 line against 230 at 115.85 above, the dynamic-pricing story in two numbers; network planning wants the two-grain census beside the {rose:refund shares} (APAC 8.1%, EU 6.7%, US 5.3%); the fleet desk wants the partner bench re-cut — the top operator carries **32% of booked value**, the top two 58.7% of the six-operator bench. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the yield-review argument*.",
    "**15:30 —** The afternoon tilts toward the partner close. The AR anti-join refreshes first — **6 never-collected settlement statements worth 15,217** — before any partner dunning goes out; the coverage split reads 21 exact, 1 partial (4,000 of 6,148 settled) and feeds the receivables draft; the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero legs (#28, 1,756.00). Then the opex fold: four network lines footing to **25,416** — {emerald:tied to the GL}, or the close does not ship. The day ends the way every close does: the trial balance must read **181,080 against 181,080**, delta zero, and tomorrow's departures board inherits queries, not mysteries.",
  ],

  metrics: [
    { name: "Traveled rate", what: "Delivered (traveled-and-settled) bookings ÷ ALL bookings: 52 of 103 (50.5%). The network's kept-rate — a status-filtered conditional count whose denominator is the whole interview." },
    { name: "Departure-stamp coverage", what: "Bookings with shipped_at stamped ÷ all booked: 82 of 103 (79.6%). The 14 held rows are 'not yet', never a silent zero — and the 7 refunded never had a stamp to give." },
    { name: "Booking-to-departure lead", what: "created_at → shipped_at over departed journeys only: 2.98-day average, 2–4 spread. The market cut — EU 2.94, APAC 2.93, US 3.07, LATAM 3.5 — decides where advance-purchase yield actions land." },
    { name: "Refund share", what: "Refunded bookings ÷ booked, by market: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The fate map ops reads weekly; the denominator (all booked) is the metric." },
    { name: "Fare book", what: "Total booked value: 34,833.28 across 103 bookings, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the fare-band story — one 1,088.44 booking outweighs the smallest 42 combined." },
    { name: "Seat load & line depth", what: "498 seats sold across 251 seat/fare lines — 2.44 lines per booking. Seat load is the capacity the network actually sells; fare lines are where upgrades and ancillaries show up first, as new lines, not new bookings." },
    { name: "Dynamic fare mix", what: "268 seats at a 31.01 average line fare below the 55 line vs 230 seats at 115.85 above. The two arms ARE the dynamic-pricing read — and the 200-plus premium arm is honestly empty at the 199.99 ceiling." },
    { name: "Settlement coverage", what: "Statements versus collected legs: 21 exact, 1 partial (4,000 of 6,148 settled), 6 never-collected worth 15,217. The AR anti-join the partner-settlement pod refreshes every close." },
  ],

  topics: [
    {
      name: "The booking funnel",
      why: "Every FlixBus screen opens with the booking book: journeys booked, departure-stamped, traveled-and-settled, refunded. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling a ticketed-in-flight booking 'traveled' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain market censuses",
      why: "Bookings and passengers are different grains of the same join, and every market census here reports both: EU runs 45 booked journeys from 8 passengers while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining passengers to bookings",
      why: "Passengers carry market and created_at; bookings inherit them through joins, and the join type decides who survives. A booking without a passenger is corruption; a passenger without bookings is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "top-travellers"],
    },
    {
      name: "Fare-band CASE ladders",
      why: "Dynamic pricing prints fare bands that move with demand, and the yield review CASE-classifies every seat line at fixed edges — below the 55 line, above it. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the yield forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Booking lead-time clocks",
      why: "Lead time is julianday arithmetic over a stamp that only departed journeys carry, and the market cut (2.94 / 2.93 / 3.07 / 3.5) is a network-planning input, not a vanity metric. FlixBus drills date filtering here too — bookings made in a window, latest booking per passenger — because advance-purchase windows drive the yield curve.",
      slugs: ["average-time-of-process-per-machine", "list-the-products-ordered-in-a-period", "the-latest-login-in-2020"],
    },
    {
      name: "Yield leaderboards & tie policy",
      why: "The passenger ladder ranks riders by bookings and lifetime spend, and ties are guaranteed — four passengers sit at 4 bookings each on this db, behind the 24, 17, 14, 13, 5 rungs. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a loyalty policy, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Frequency gates & HAVING floors",
      why: "Network planning only staffs markets that clear a frequency floor, and partner reviews only seat operators that clear a SKU-depth floor — both are group-level facts that live in HAVING. The trap is intuition about counts: on this db a ten-booking floor keeps EU (45), APAC (37) and US (19) and drops LATAM's 2, and no operator carries more than 3 route SKUs, so any floor above 3 empties the bench.",
      slugs: ["classes-more-than-5-students", "managers-with-at-least-5-direct-reports", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Anti-joins on the settlement book",
      why: "Booked is not settled: the finance tables are where the network world meets money, and the 6 never-collected statements worth 15,217 ARE an anti-join. The LEFT JOIN + IS NULL shape (and its NOT EXISTS twin) shows up in most screens as the 'which partner do we call first' question — and the mirror anomaly (a void statement WITH a leg) is why the status column never gets trusted alone.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "employees-with-missing-information"],
    },
    {
      name: "One-pass network censuses",
      why: "The ops board gets traveled, in-flight, held and refunded in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Cents discipline & settlement coverage",
      why: "Settlement statements and legs carry INTEGER euro-cents, and every dollar read is amount_cents / 100.0 — the house rule partner-ops interns learn the hard way. The exact/partial/none coverage split (21 / 1 / 6) is one CASE away, and the monthly partner rollup is where per-statement folds with cents-safe arithmetic get practiced.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "flix-t1",
      q: "Your network report joins passengers to bookings. When do you INNER and when do you LEFT — and what silently breaks if you filter a booking column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins bookings to passengers: a booking with no passenger row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A coverage report must be LEFT from passengers: passengers with no bookings would BE the answer, arriving with NULL booking columns — on this db the anti-join returns a confident zero, and proving the zero is part of the job: all 16 passengers appear in the booking book somewhere. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. The same discipline runs the settlement fold: statements LEFT JOIN legs, keep the NULL side, and the 6 never-collected statements worth 15,217 ARE the AR page — plus the mirror trap, a void statement WITH a leg (#11, 925), which the anti-join will never surface.",
      tag: "joins",
    },
    {
      id: "flix-t2",
      q: "Four passengers tie at 4 bookings on the loyalty ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. On this db the ladder runs 24, 17, 14, 13, 5 bookings — then FOUR passengers tied at 4. RANK gives the tie the same rung and then skips: the tie consumes ranks 6 through 9 and the next distinct count (3 bookings) lands on 10, implying four phantom rungs that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits the tie arbitrarily, a silent judgment about whose account gets the next retention offer. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer passengers, or an explicitly named tie-breaker like created_at then id — and writing it into the query comment. On a coach network where the top four passengers carry a fifth of the book, tie policy is retention policy.",
      tag: "windows",
    },
    {
      id: "flix-t3",
      q: "The census shows 103 bookings and 251 seat/fare lines; EU shows 45 bookings and 8 passengers. Why do these counts disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts rows after the join — at booking-passenger grain that is 103 bookings, but join the seat/fare lines and the same COUNT(*) silently reads 251 fare lines. COUNT(DISTINCT customer_id) folds repeats back to passengers — EU's 45 bookings collapse to 8 logos. Neither is wrong: bookings measure load and network momentum, passengers measure installed base, fare lines measure what the yield engine actually sold. The ratio — 5.6 bookings per passenger in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The seat-km discipline layers on top: revenue per seat must be units-weighted, SUM(quantity * unit_price) / SUM(quantity), because a plain AVG(unit_price) averages LINES and lets a hundred cheap singles outweigh ten expensive groups. Saying 'one row per what?' for every COUNT and 'weighted by what?' for every average is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "flix-t4",
      q: "shipped_at is NULL until a journey departs. What is your policy for the booking-lead report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only departed journeys carry a stamp, so the report measures booking-to-departure for the 82 of 103 bookings that carry shipped_at — averaging 2.98 days with a 2–4 spread — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL bookings returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 held plus 7 refunded rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the lead to zero to 'fix' the average — that invents same-day departures for journeys that have not left. The market cut (EU 2.94, APAC 2.93, US 3.07, LATAM 3.5) is computed over stamped journeys only, and the population definition ships with the number — a report whose WHERE clause does definitional work without saying so is exactly what a FlixBus reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "flix-t5",
      q: "The network review wants traveled-booking value per market for markets carrying at least ten bookings. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, held and refunded rows before any fold, so it lives in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-booking floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. On this db the floor keeps EU (45), APAC (37) and US (19), and drops LATAM's 2 — which is a statement about staffing, not about the market being empty. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a market load line and an error, and between a floor applied to bookings versus to dollars. The strong answer places every filter by asking: is this a fact about one booking, or about a market?",
      tag: "pipeline",
    },
    {
      id: "flix-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full book that is theoretical: 103 bookings always produce a mean fare (338.19), and the bookings above it are the premium-band story. On filtered staging — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each booking to ITS market's average fare) re-runs per outer row and answers a different question at a different cost — and at a dynamic-pricing shop that question is the real one: a 400 fare is unremarkable above the 55 fare line and an outlier below it. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "flix-t7",
      q: "The booking trend buckets journeys by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the seasonality story becomes fiction. The window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and month-end is exactly when advance-purchase bookings land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The walk tells the yield story: the book opens at 3,731.97, troughs at 1,193.86 in July 2024, jumps +1,158.21 into August, then takes the steepest drop, -1,326.87, into November. Date discipline is yield discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "flix-t8",
      q: "Partner ops says a settlement statement is 'paid' but the legs table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN settlement legs, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero legs: a status that lies, which is why settlement rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: statements and legs carry INTEGER euro-cents, so every dollar read is amount_cents / 100.0 — the missing .0 quietly eats cents on every odd-cent row and mislabels thousands as units. Coverage must read 21 exact / 1 partial (4,000 of 6,148 settled) / 6 never-collected, the opex fold must tie to the GL's operating_expenses account at 25,416, and the trial balance must land 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "flix-mcq-1",
      prompt: "A booking row's status reads 'delivered'. In this kit's journey-fate map, what happened?",
      choices: ["The journey traveled and settled — it counts as kept", "The journey is ticketed, departure stamped, still in flight", "Booked and held awaiting departure", "A refunded booking"],
      answer: 0,
      why: "The fate map is fixed: delivered = traveled-and-settled — 52 of 103 bookings (50.5%). It is the only status where the journey has actually run and the fare has settled.",
      notes: [
        { choice: 1, why: "Ticketed-in-flight is 'shipped' — 30 bookings with a departure stamp that have not completed. Calling them traveled inflates the kept rate before a single coach arrives." },
        { choice: 2, why: "Held is 'pending' — 14 bookings with no shipped_at yet. Held is not kept and not lost; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "flix-mcq-2",
      prompt: "Departure-stamp coverage is stamped bookings ÷ which population? The db holds 82 stamped, 14 held, 7 refunded of 103 booked.",
      choices: ["Stamped + refunded only (82/89 = 92.1%)", "All bookings placed (82/103 = 79.6%)", "Traveled bookings only (52/82)", "Distinct passengers (82/16)"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL bookings placed — the 14 held rows stay in the denominator because 'not yet departed' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 held inflates the rate to 92.1% by deleting the population still ahead of departure — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — traveled is fate, shipped_at is the departure stamp. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "flix-mcq-3",
      prompt: "EU carries 45 booked journeys from 8 passengers. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts booking rows (45); COUNT(DISTINCT customer_id) folds repeats back to passengers (8). The gap between them — 5.6 bookings per passenger — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every booking has a passenger. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not passengers — a third grain nobody asked for. The census is bookings AND passengers." },
      ],
      difficulty: "easy",
    },
    {
      id: "flix-mcq-4",
      prompt: "A seat-load report joins orders to order_items and prints COUNT(*) = 251. Network planning expected 103. What happened?",
      choices: ["The join fanned out — 251 is fare-line rows; fold with COUNT(DISTINCT oi.order_id) to get back to 103 bookings", "Orders were double-imported and the table has duplicate ids", "COUNT(*) skips NULL rows and inflated the count", "251 is correct — the network ran 251 bookings last period"],
      answer: 0,
      why: "Joining the 251 seat/fare lines multiplies each booking by its lines — the 2.44-line average depth means COUNT(*) reads 251 while COUNT(DISTINCT oi.order_id) reads 103. Both numbers are real; only one is bookings.",
      notes: [
        { choice: 1, why: "No duplicates — the db carries 103 booking rows and 251 line rows by design. The mismatch is grain, not corruption, and the fix is a distinct fold." },
        { choice: 2, why: "COUNT(*) counts every row; COUNT(column) skips NULLs. Neither skips rows you expected — the fan-out added rows rather than dropping them." },
      ],
      difficulty: "medium",
    },
    {
      id: "flix-mcq-5",
      prompt: "Yield per seat on a fare ladder: which expression is the units-weighted read the yield team actually means?",
      choices: ["AVG(unit_price) over the fare lines", "SUM(quantity * unit_price) / SUM(quantity)", "SUM(unit_price) / COUNT(*)", "AVG(total) over bookings"],
      answer: 1,
      why: "Yield per seat divides booked revenue by seats sold: SUM(quantity * unit_price) / SUM(quantity) weights each fare by the seats on its line. AVG(unit_price) answers 'average line fare' — a different metric that lets one-seat lines drown group fares.",
      notes: [
        { choice: 0, why: "AVG(unit_price) is line-weighted, not seat-weighted — the canonical band read (31.01 vs 115.85) is exactly this line-fare average, which is why it is labeled 'average line fare' and never 'yield per seat'." },
        { choice: 2, why: "SUM of prices over line count has no business meaning — it neither weights by seats nor averages correctly across lines of different size." },
      ],
      difficulty: "medium",
    },
    {
      id: "flix-mcq-6",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to refunded bookings only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the refund share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the refund map reads zero everywhere, including APAC's 8.1%." },
      ],
      difficulty: "medium",
    },
    {
      id: "flix-mcq-7",
      prompt: "Keep only markets carrying at least 10 booked journeys. Where does the threshold live, and which markets survive on this db?",
      choices: ["WHERE COUNT(*) >= 10 — EU, APAC and US survive", "GROUP BY market HAVING COUNT(*) >= 10 — EU 45, APAC 37 and US 19 survive; LATAM's 2 drops", "WHERE bookings >= 10 on the raw table — all four survive", "HAVING before GROUP BY, wherever it fits — LATAM survives"],
      answer: 1,
      why: "A booking-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the floor keeps EU (45), APAC (37) and US (19), and drops LATAM's 2.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'bookings' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "flix-mcq-8",
      prompt: "A staging-table exclusion uses passenger_id NOT IN (SELECT customer_id FROM bookings WHERE status = 'refunded') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every booking carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty exclusion reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "flix-mcq-9",
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
      id: "flix-mcq-10",
      prompt: "A dashboard walks booked seat load booking by booking: SUM(quantity) OVER (ORDER BY created_at). Two bookings share a booking timestamp, and the cumulative 'jumps two bookings at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so bookings tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at booking grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-flix-1",
      tier: "easy",
      topic: "j1",
      universe: "funnel",
      title: "The traveled-book census",
      brief:
        "Network-planning memo on the storefront db: Monday's review opens with the traveled book by market — bookings that actually ran (status 'delivered'), distinct passengers covered, and the fare book those journeys carried — and planning is explicit that the traveled arm is status-filtered, with the 30 ticketed-in-flight bookings and the 14 held staying out by definition. Probed facts: 103 bookings worth 34,833.28; the traveled arm reads EU 24 traveled from 7 passengers with a 6,656.18 fare book, APAC 21 from 5 at 6,617.68, US 5 from 2 at 1,444.77, LATAM 2 from 1 at 852.44. The review reads biggest fare book first.",
      ask: "Return each market with its traveled-booking count, distinct passenger count and fare book to 2 decimals, biggest fare book first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS traveled_bookings,\n       COUNT({1} o.customer_id) AS passengers,\n       ROUND(SUM(o.total), {2}) AS fare_book\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.status = {3}\nGROUP BY c.region\nORDER BY fare_book {4};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the passenger deduplicator",
          why: "COUNT(DISTINCT o.customer_id) folds repeat bookings back to passengers: EU reads 7, not 24. SUM(DISTINCT …) adds id codes together and MAX(DISTINCT …) reports the largest id — neither is a census.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the fare-book precision",
          why: "Fare books report to 2 decimals — EU's 6,656.18. ROUND(…, 1) prints 6,656.2 and the market map stops reconciling with the 34,833.28 book finance quotes on the same slide.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the traveled literal",
          why: "Traveled bookings are status 'delivered' — 52 on the db, and this fold reads their 24/21/5/2 market split. 'shipped' would count the 30 ticketed-in-flight bookings instead and the census reads a different funnel.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review reads biggest fare book on top: EU 6,656.18, APAC 6,617.68, US 1,444.77, LATAM 852.44 — and EU's lead over APAC is only 38.50, so the order IS the story. ASC would open the meeting on LATAM's 852.44.",
        },
      ],
      distractors: ["SUM", "MAX", "1", "ASC", "NULL"],
      walkthrough:
        "One join, one fold, three columns at two grains. The join attaches every booking to its passenger's market — the WHERE keeps only the 52 traveled bookings — and GROUP BY region folds them into four rows where COUNT(*) reads traveled bookings (24 / 21 / 5 / 2), COUNT(DISTINCT o.customer_id) reads passenger coverage (7 / 5 / 2 / 1), and ROUND(SUM(o.total), 2) reads the fare book (6,656.18 / 6,617.68 / 1,444.77 / 852.44) — straight from the probed census, and the traveled arms reconcile upward to the 52-booked fate census. The 30 ticketed-in-flight bookings (11,996.72 if you fold them — EU 12, US 10, APAC 8) and the 14 held never enter: wrong funnel stage, and the slide says so. The distractors fail honestly: SUM in the passenger slot adds customer ids together and MAX reports the largest id — a census of nothing; 1 in the precision slot truncates to one decimal so every market drifts off the 2-decimal book; 'shipped' in the literal slot rebuilds the census around the in-flight book; NULL in the literal slot empties the status comparison and the census vanishes; ASC opens the review on LATAM. The two-grain pairing is the read: EU's 24-from-7 (3.4 bookings per passenger) against APAC's 21-from-5 (4.2) says APAC's traveled book concentrates while EU's broadens — and EU tops the value column by just 38.50, so the biggest-book crown is contested in a way the whole-network census (45 vs 37 bookings) never shows.",
    },
    {
      id: "cs-flix-2",
      tier: "medium",
      topic: "x1",
      universe: "supplier",
      title: "The partner-operator manifest",
      brief:
        "Fleet-desk memo on the storefront db: Flix sells the seat, partners own the coach — so the quarterly partner review opens with the operator manifest, one row per partner operator, its route SKUs folded into a single manifest cell, plus SKU depth, seats sold and booked value. The review gates at 3-plus route SKUs: operators below the floor are bench conversations, not board rows. Probed facts: the gated bench reads Nordic Gadgets AB 'Mechanical Keyboard K1,Smart Watch S,4K Webcam Pro' at 3 SKUs / 82 seats / 11,130.25, Midwest Hardware Co 'Yoga Mat Eco 6mm,Noise-Canceling Headset,Laptop Stand Aluminum' at 3 / 109 / 9,294.93, Shenzhen Electro 'Ring Light 14\",Wireless Mouse M3,Running Socks 3-pack' at 3 / 99 / 3,049.07, Pacific Textiles 'HDMI 2.1 Cable 2m,USB-C Hub 7-in-1,Cycling Jersey Pro' at 3 / 80 / 2,980.15 — footing to 26,454.40, 75.9% of the 34,833.28 book. Alpine Audio GmbH (4,765.63) and Andes Naturals SA (3,613.25) carry 2 route SKUs each and drop on the floor. The manifest reads biggest booked value first.",
      ask: "Return each partner operator with 3-plus route SKUs, its manifest cell, SKU depth, seats sold and booked value to 2 decimals, biggest booked value first.",
      template:
        "WITH operator_book AS (\n  SELECT s.name AS operator,\n         GROUP_CONCAT({1} p.name) AS route_manifest,\n         COUNT(DISTINCT p.id) AS route_skus,\n         SUM(oi.quantity) AS seats_sold,\n         ROUND(SUM(oi.quantity * oi.unit_price), 2) AS booked_value\n  FROM suppliers s\n  JOIN products p ON p.supplier_id = s.id\n  JOIN order_items oi ON oi.product_id = p.id\n  GROUP BY s.name\n  HAVING COUNT(DISTINCT p.id) >= {2}\n)\nSELECT operator, route_manifest, route_skus, seats_sold, booked_value\nFROM operator_book\nORDER BY booked_value {3};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the manifest deduplicator",
          why: "GROUP_CONCAT(DISTINCT p.name) folds each operator's SKUs into a 3-name manifest — Nordic reads 'Mechanical Keyboard K1,Smart Watch S,4K Webcam Pro'. Dropping DISTINCT concatenates one entry per fare LINE — 43 repeated names for Nordic's 3 SKUs — and the manifest cell becomes unreadable.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the SKU-depth floor",
          why: "The review gates at 3 route SKUs, and 3 is visible in the result — all four bench rows carry route_skus 3. A floor of 4 or 5 empties the bench entirely: no operator on this db lists more than 3, so the empty result is a ceiling fact, not a bug.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The manifest reads Nordic 11,130.25, Midwest 9,294.93, Shenzhen 3,049.07, Pacific 2,980.15. ASC would open the partner review on the smallest bench row — a correct fold presented backwards.",
        },
      ],
      distractors: ["ALL", "COUNT", "4", "ASC", "5"],
      walkthrough:
        "Three tables, one fold, one visible fan-out. The chain suppliers → products → order_items fans every operator out to its fare lines — 43 for Nordic, 56 for Midwest, 47 for Shenzhen, 40 for Pacific — so the manifest MUST dedup: GROUP_CONCAT(DISTINCT p.name) folds the line-grain noise back to 3 route SKUs per operator, while COUNT(DISTINCT p.id) reads the depth (3) the HAVING gate judges and SUM(oi.quantity) reads seats (82 / 109 / 99 / 80). The gate keeps the four 3-SKU operators and drops Alpine (4,765.63) and Andes (3,613.25) on 2 — and the survivors foot to 26,454.40, 75.9% of the 34,833.28 book, which is the concentration line the review opens with: four partners carry three-quarters of network value. Push the floor to 4 and the bench returns EMPTY — the ceiling is 3, and an empty bench above the floor is a population definition, not a query bug. The distractors fail honestly: ALL in the manifest slot re-expands to line grain (Nordic's cell becomes 43 comma-joined names); COUNT nests an aggregate inside GROUP_CONCAT and errors; 4 and 5 both empty the bench through the floor; ASC flips the manifest to smallest-book-first. One query, one manifest, one concentration read — the asset-light story in a single cell.",
    },
  ],

  problems: [
    { slug: "immediate-food-delivery-ii", why: "Bookings ticketed within a week of departure versus far-ahead purchases — a conditional share over a timestamp comparison, the same shape as the advance-purchase lead read that drives FlixBus's yield curve." },
    { slug: "confirmation-rate", why: "Passengers LEFT JOINed to bookings with COALESCE — a passenger who never traveled must still appear on the loyalty report at zero, not vanish from the bench." },
    { slug: "queries-quality-and-percentage", why: "Fare quality with a CASE percentage — the same 100.0-before-division discipline the refund map (APAC 8.1%, EU 6.7%) is built on." },
    { slug: "game-play-analysis-iv", why: "First departure stamp per passenger, then the next touch — first-journey-to-return logic is how the loyalty pod measures the repeat-traveler habit on the network." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Route-family migration reads: passengers who rode the budget band AND the mid band but never the premium — conditional aggregation over the fare ladder, the upsell cohort." },
    { slug: "sales-by-day-of-the-week", why: "Friday-versus-Sunday departure load pivoted across the week — network capacity planning's favorite strftime/CASE drill, and weekend skew is exactly where partner frequency gets negotiated." },
    { slug: "second-highest-salary", why: "The second-priciest fare class without LIMIT-1-OFFSET-1 — the tie-safe subquery shape the fare ladder (max 199.99 against an 8-deep mid band) demands." },
    { slug: "report-contiguous-dates", why: "Consecutive service days on a market spine — gaps-and-islands logic is how network planning strings together daily departures before a frequency change ships." },
    { slug: "biggest-window-between-events", why: "Dormancy detection: the largest gap between a passenger's bookings flags the win-back cohort before the season starts. Window math over booking timestamps." },
    { slug: "employees-earning-more-than-their-managers", why: "Benchmark comparison at row grain — which bookings out-earn their market's average fare is the above-average screen, and the dynamic-pricing version compares each fare to ITS band, not the network." },
    { slug: "find-the-team-size", why: "Seat lines beside the load around them — a per-booking seat count attached to every line is the window shape behind the seat-load (498 seats) read." },
    { slug: "last-person-to-fit-in-the-bus", why: "Coach capacity as a running sum — the last passenger to fit in the bus is literally this network's overbooking question, drilled as a window over ordered seats." },
    { slug: "not-boring-movies", why: "Filtered, ordered departure boards — parity and length filters with ORDER BY, the small drill that keeps public timetable listings honest." },
    { slug: "net-revenue-retention", why: "Cohort revenue walks with LAG — the metric the network board actually manages, since seat expansion on existing corridors IS the growth story." },
    { slug: "keep-latest-dedupe", why: "Partner-roster hygiene: the operator bench deduplicates to the latest rating per partner before any concentration fold (32% top operator, 58.7% top two) is quoted." },
    { slug: "null-blank-audit", why: "Data-quality sweep before the close — stamp-less shipped_at rows and blank market codes are exactly the NULL-policy audit the settlement pod runs every month." },
  ],
};
