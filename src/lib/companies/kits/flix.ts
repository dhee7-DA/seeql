// FlixBus — Wave-10 (Task 100), travel domain. No Flix section in company-pools.md
// (0 tagged rows) — all 10 topic slug sets and all 32 problems are theme-curated
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
    "Preparation strategy: the pools file carries **no Flix section**, so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes — departure funnels, two-grain market censuses, refund shares, fare-band CASE ladders, tie-heavy leaderboards, lead-time clocks and the cents-safe settlement spine. Do the topics in order, then run all six case studies on the live storefront db: the {emerald:traveled-book census} and the {amber:partner-operator manifest} the reviews open with, the {emerald:pace walk} and the {amber:fate map} the trend deck and standup read, and the {emerald:never-collected list} and {amber:one-pass fate census} the close is gated on. The bar to clear: state the population and the denominator before you compute anything — then make every fate census **reconcile to 103 by construction**.",
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
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "funnel-step-conversion", "second-day-verification", "immediate-food-delivery-ii", "report-contiguous-dates", "find-the-team-size"],
    },
    {
      name: "Two-grain market censuses",
      why: "Bookings and passengers are different grains of the same join, and every market census here reports both: EU runs 45 booked journeys from 8 passengers while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "total-traveled-distance", "rolling-7d-actives", "year-on-year-growth-rate"],
    },
    {
      name: "Joining passengers to bookings",
      why: "Passengers carry market and created_at; bookings inherit them through joins, and the join type decides who survives. A booking without a passenger is corruption; a passenger without bookings is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "top-travellers", "trips-and-users"],
    },
    {
      name: "Fare-band CASE ladders",
      why: "Dynamic pricing prints fare bands that move with demand, and the yield review CASE-classifies every seat line at fixed edges — below the 55 line, above it. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the yield forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "the-category-of-each-member-in-the-store", "average-selling-price", "net-revenue-retention"],
    },
    {
      name: "Booking lead-time clocks",
      why: "Lead time is julianday arithmetic over a stamp that only departed journeys carry, and the market cut (2.94 / 2.93 / 3.07 / 3.5) is a network-planning input, not a vanity metric. FlixBus drills date filtering here too — bookings made in a window, latest booking per passenger — because advance-purchase windows drive the yield curve.",
      slugs: ["average-time-of-process-per-machine", "list-the-products-ordered-in-a-period", "the-latest-login-in-2020", "median-time-to-convert", "second-day-confirmation", "confirmation-rate", "biggest-window-between-events", "keep-latest-dedupe"],
    },
    {
      name: "Yield leaderboards & tie policy",
      why: "The passenger ladder ranks riders by bookings and lifetime spend, and ties are guaranteed — four passengers sit at 4 bookings each on this db, behind the 24, 17, 14, 13, 5 rungs. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a loyalty policy, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "users-with-two-purchases-within-seven-days", "second-highest-salary"],
    },
    {
      name: "Frequency gates & HAVING floors",
      why: "Network planning only staffs markets that clear a frequency floor, and partner reviews only seat operators that clear a SKU-depth floor — both are group-level facts that live in HAVING. The trap is intuition about counts: on this db a ten-booking floor keeps EU (45), APAC (37) and US (19) and drops LATAM's 2, and no operator carries more than 3 route SKUs, so any floor above 3 empties the bench.",
      slugs: ["classes-more-than-5-students", "managers-with-at-least-5-direct-reports", "customer-placing-the-largest-number-of-orders", "calculate-orders-within-each-interval", "sales-by-day-of-the-week", "employees-earning-more-than-their-managers"],
    },
    {
      name: "Anti-joins on the settlement book",
      why: "Booked is not settled: the finance tables are where the network world meets money, and the 6 never-collected statements worth 15,217 ARE an anti-join. The LEFT JOIN + IS NULL shape (and its NOT EXISTS twin) shows up in most screens as the 'which partner do we call first' question — and the mirror anomaly (a void statement WITH a leg) is why the status column never gets trusted alone.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "employees-with-missing-information", "ar-aging-schedule", "game-play-analysis-iv", "customers-who-bought-a-and-b-not-c", "null-blank-audit"],
    },
    {
      name: "One-pass network censuses",
      why: "The ops board gets traveled, in-flight, held and refunded in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "hopper-company-queries-i", "the-number-of-passengers-in-each-bus-i", "the-number-of-passengers-in-each-bus-ii", "consecutive-available-seats", "queries-quality-and-percentage", "last-person-to-fit-in-the-bus", "not-boring-movies"],
    },
    {
      name: "Cents discipline & settlement coverage",
      why: "Settlement statements and legs carry INTEGER euro-cents, and every dollar read is amount_cents / 100.0 — the house rule partner-ops interns learn the hard way. The exact/partial/none coverage split (21 / 1 / 6) is one CASE away, and the monthly partner rollup is where per-statement folds with cents-safe arithmetic get practiced.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "duplicate-charge-pairs"],
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
    {
      id: "flix-t9",
      q: "The ops board wants each market's anchor journey — the single biggest booking per market, all markets in one result. Walk me through the window shape.",
      a: "Window over the rows, partitioned by market: RANK() OVER (PARTITION BY c.region ORDER BY o.total DESC) and keep rank = 1 — one anchor booking per market in a single pass, with the fare, the passenger and the rank all on the row. The two grading points: PARTITION BY is what restarts the ladder per market — without it the whole network competes and three of four markets get no rank 1; and ties inside a market need a named tiebreak (booking id) or the anchor flips between runs. The GROUP BY + MAX spelling prints the figure but loses WHICH booking earned it, and GROUP BY + LIMIT loses three of the four markets — argmax-per-group is the exact shape the partner bench and the corridor boards reuse, so I say the pattern out loud rather than just shipping the query.",
      tag: "windows",
    },
    {
      id: "flix-t10",
      q: "One query, four counts: 251, 498, 103 and 16 all come off the same join. Which is which, and how do you keep them honest in one result?",
      a: "They're four grains of the same rows. 251 is COUNT(*) after the join — fare/seat lines. 498 is SUM(quantity) — seats sold, because quantity is seats per line. 103 is COUNT(DISTINCT order_id) — the fold back to bookings. 16 is COUNT(DISTINCT customer_id) — passengers, the installed base. One query can print all four; the discipline is naming the grain in the column alias and saying out loud which the slide claims. The ratio pairs are the business: 498/251 = 2.0 seats per line, 251/103 = 2.44 lines per booking (the attach proxy), 103/16 = 6.4 bookings per passenger network-wide. The failure I watch for is the slide that prints 251 under a 'bookings' header — seat-km yield built on line grain is the canonical wrong-grain bug here, and the interviewer's follow-up is always 'which fold is that column?'",
      tag: "groupby",
    },
    {
      id: "flix-t11",
      q: "Lead time is stamped-only. Walk me through the market cut — EU 2.94, APAC 2.93, US 3.07, LATAM 3.5 — and the arithmetic behind it.",
      a: "Population first: only the 82 stamped bookings of 103 carry a lead; the 14 held have none yet and the 7 refunded never will — both stay excluded by definition, and the report title says 'stamped journeys only'. The arithmetic is julianday(shipped_at) - julianday(created_at) per booking, averaged per market after joining passengers for region — EU 2.94, APAC 2.93, US 3.07, LATAM 3.5. The read: US and LATAM book further ahead, so advance-purchase yield actions land there first; EU and APAC are close-in markets where fare bands move faster. The traps I name: TEXT subtraction (casts both stamps to leading integers and reads 0), julianday over unstamped rows NULLing them (correct — no departure, no lead), and rounding once at the edge so the query and the deck print the same 2.98 network average.",
      tag: "dates",
    },
    {
      id: "flix-t12",
      q: "Dynamic pricing prints fare bands that move daily, but the yield review classifies every seat line at fixed edges. Write the banding and defend its arms.",
      a: "One CASE with ordered floors and a terminal ELSE: WHEN unit_price >= 55 THEN 'premium' ELSE 'budget' END per line, optionally a third arm at the 200 mark — which is honestly empty on this db because the ceiling is 199.99, and saying THAT is part of the answer. The defense has three parts. Exhaustive: the ELSE guarantees all 251 lines land in an arm, so the arm seats reconcile to 498 — a hole in the CASE is a hole in the yield forecast. Ordered: CASE stops at the first true WHEN, so arms run top-down — 55-first would swallow every premium line and the premium arm reads zero forever. Stable labels: quoted text arms, because unquoted labels split one band into two groups and the mix prints three rows where pricing publishes two. The probed split at 55: 268 seats at a 31.01 average line fare below, 230 at 115.85 above — the two arms ARE the dynamic-pricing story.",
      tag: "case",
    },
    {
      id: "flix-t13",
      q: "The deck benchmarks each fare band's average against the network's average band. Where do candidates lose the thread?",
      a: "Benchmark grain. The 'network average band' is a fold of folds: per band, its average line fare, then the mean of those two numbers — a scalar that has to be staged in a subquery or CTE. The classic wrong version runs AVG(unit_price) OVER () on the raw lines — that's the average LINE fare weighted by line count, not the average of band averages, and with 133 budget lines against 118 premium lines the two differ. The second failure is benchmarking against the raw network average fare, 338.19 — that's booking grain compared against line grain, and no band will ever sensibly pass or fail. I stage the band fold in a CTE (band, lines, seats, avg_fare), then join back or window over it so every band stays in the output with its gap visible — the yield deck wants the spread, not just the pass/fail bit.",
      tag: "subqueries",
    },
    {
      id: "flix-t14",
      q: "Concentration: the board quotes the top operator at 32 percent of booked value and the top two at 58.7. How is that computed, and what makes it defensible?",
      a: "Fold per operator — SUM(quantity * unit_price) over the suppliers → products → order_items chain — then the share is each operator's value over the 34,833.28 book, computed with the nested-aggregate window: 100.0 * SUM(value) / SUM(SUM(value)) OVER (), one pass, no self-join. Defensible means three things. The dedupe happened first: the partner roster is deduplicated to the latest rating per operator before any concentration fold, or a double-logged partner splits its own share. The denominator is stated: 34,833.28, the whole booked book, not the settled subset. And the rounding is at the edge: 32.0 and 58.7 print from one ROUND, and the two shares are cross-checked to add up to the fold. The windowed version keeps every operator row visible with its gap — which is what the review debates, not just the top line.",
      tag: "windows",
    },
    {
      id: "flix-t15",
      q: "When do you stack market boards with UNION versus UNION ALL, and what's the review rule before either?",
      a: "UNION ALL by default — stacking is appending, and market branches can't legitimately dedupe. UNION applies an implicit DISTINCT across the whole stack, and the failure is silent: two branches folding to byte-identical rows — same bookings, same cents, no market label — collapse to one, the board loses a market, and the totals still foot so nothing catches it. The close packet version is sharper: the settled fold and the never-collected fold can print identical figures, and only the literal state column keeps them separable. The review rule: ship UNION only when the dedup it removes is provably impossible, with the argument in a comment beside the operator — otherwise the label column goes in and UNION ALL does the work. The panel wants that comment discipline named, because it's the difference between an operator and a coincidence.",
      tag: "sets",
    },
    {
      id: "flix-t16",
      q: "The one-pass fate census: traveled 52, in-flight 30, held 14, refunded 7 — reconciling to 103. How does FILTER (WHERE …) keep it one scan, and what do you check before shipping it?",
      a: "Conditional folds in one SELECT: COUNT(*) FILTER (WHERE status = 'delivered') as traveled, FILTER (WHERE status = 'shipped') as in_flight, FILTER (WHERE status = 'pending') as held, FILTER (WHERE status = 'cancelled') as refunded — one scan, four arms, and the arms partition the rows exactly, so 52 + 30 + 14 + 7 = 103 by construction. That identity IS the check: if an arm drifts, a status value is missing from the vocabulary or a WHERE leaked into a branch. The portable twin is SUM(CASE WHEN status = '…' THEN 1 ELSE 0 END) — same semantics, and I use it when the dialect review wants maximum portability. The mistake that fails screens: four sequential queries, which is four chances for the denominators to drift apart — and a census whose branches don't reconcile to COUNT(*) isn't a census, it's four unrelated numbers.",
      tag: "aggregation",
    },
    {
      id: "flix-t17",
      q: "HAVING versus WHERE on the network plan: status filtering, the ten-booking frequency floor, and the operator SKU gate — where does each live?",
      a: "By computability. WHERE runs before the fold and sees rows: status = 'delivered' discards in-flight, held and refunded bookings per row. HAVING runs after the fold and sees groups: HAVING COUNT(*) >= 10 keeps markets with real frequency (EU 45, APAC 37, US 19 — LATAM's 2 drops), and the operator bench's HAVING COUNT(DISTINCT p.id) >= 3 keeps deep catalogs. The two errors are symmetrical and both fail screens: WHERE COUNT(*) errors because groups don't exist yet, and HAVING status = 'delivered' errors or lies because statuses no longer exist per row once grouped. The subtle one I state: a row-filter workaround (filtering lines before the fold) silently re-folds the group the gate is judging — a 3-SKU catalog truncated to 2 gets dropped on evidence it never had. Filter rows with WHERE, judge groups with HAVING, and never let a workaround re-fold what the gate is measuring.",
      tag: "pipeline",
    },
    {
      id: "flix-t18",
      q: "The stamp-less rows: COUNT(shipped_at) reads 82 against COUNT(*)'s 103. What does the 21-row gap mean, and how do reports treat it?",
      a: "The gap is the not-departed book, split by status: 14 held ('not yet' — still in the booking window, lead time pending) and 7 refunded ('never' — demand that left the funnel). Reports treat it three ways. The funnel keeps them: stamp coverage is 82 over ALL 103, and dropping the 21 flatters the rate to a 92 the network never ran. The lead report excludes them by definition, stated in the title — no departure stamp, no lead to average, and AVG's NULL-blindness does that correctly if the population is named. The quality sweep counts them: the 14 held are the ticketing queue's worklist, and a held booking that ages past its departure window is an incident, not a rounding note. What never happens: IFNULL-ing the stamp to repair the average — that invents departures, and the 2.98-day network lead becomes indefensible in review.",
      tag: "nulls",
    },
    {
      id: "flix-t19",
      q: "How do you build the 14-month booking spine so zero months and the two Januarys both behave?",
      a: "STRFTIME('%Y-%m', created_at) is the bucket key — year plus zero-padded month, so 2024-01 and 2025-01 stay distinct and the keys sort chronologically as text. For completeness the fold alone isn't enough: GROUP BY only prints buckets that have rows, so a zero-booking month vanishes exactly when the trend story needs it. The fix is a calendar spine — a recursive CTE of month keys across the range — LEFT JOINed to the booking fold, with COALESCE mapping the NULL folds to 0 at the presentation edge. Real zeros, honestly built: the spine row exists, so a 0 is 'no bookings' and not 'no data'. The two traps I name: the join key must be the same normalized bucket on both sides, and the spine drives the left side — join bookings to calendar and the zero months drop out again. The same spine feeds the YoY walk and the rolling pace, so it's built once.",
      tag: "dates",
    },
    {
      id: "flix-t20",
      q: "Which journeys departed in the same hour? Walk me through the self-join and the guard that keeps it honest.",
      a: "Orders self-joined on the co-departure condition: FROM orders o1 JOIN orders o2 ON o1.id < o2.id AND SUBSTR(o1.shipped_at, 1, 13) = SUBSTR(o2.shipped_at, 1, 13) — the 13-character prefix is the hour bucket on these stamps. The strict inequality is the whole trick: = pairs every journey with itself, <> keeps both orderings so pair counts double, and < keeps exactly one of (A,B) and (B,A), which makes COUNT(*) a pair count you can defend. Add the dedupe caveat — a feed that double-logs journeys doubles the pairs too, so ROW_NUMBER over the natural key runs first — and the business read: co-departures flag the corridors where two bookings share a departure hour, which is the load-balancing signal network planning uses to debate frequency, and the same guard pattern generalizes to every 'paired events' screen in the loop.",
      tag: "joins",
    },
    {
      id: "flix-t21",
      q: "A partner upload hands you markets in three casings and a padded cell. What's your pre-fold hygiene and why is it a grain problem?",
      a: "GROUP BY folds on exact text, so 'EU', 'eu' and 'EU ' are three keys — the two-grain census prints three EU rows and every market metric downstream splits. The repair is TRIM(UPPER(region)) once, in the staging CTE: UPPER kills the casing split, TRIM kills the padding split, and one function alone leaves the other defect alive — LOWER('EU ') is still 'eu ', and NOCASE still folds 'EU ' apart. Then verify: COUNT(DISTINCT normalized) should read 4 markets, and I print the before/after counts in the PR note so the fix is auditable. Why it's a grain problem, not cosmetics: messy keys are duplicate groups wearing disguises — the fold can't tell a second market from a typo, and a market census that reads six markets where four exist overstates network breadth in every chart it feeds.",
      tag: "strings",
    },
    {
      id: "flix-t22",
      q: "The ops board wants a rolling 7-day load beside the monthly curve. How does the rolling frame differ from the running total, and where does it quietly break?",
      a: "The frame is the difference. Running total: SUM(quantity) OVER (ORDER BY day) with the default RANGE frame — cumulative since the start. Rolling 7-day: SUM(quantity) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) — six rows back plus current, strictly row-counted, always exactly 7 rows wide. I say ROWS out loud because RANGE is the default and includes peers: two bookings sharing a timestamp enter the window together and the '7-day' read silently widens — at booking grain ties are guaranteed, on a day spine they're rarer but real. The second break is gaps: a day with zero bookings must still be a spine row, or ROWS pulls in the 8th prior day and the window stretches without anyone noticing. First six rows are partial windows and I label them as such — a rolling window that pretends to be full from row one is the kind of detail this panel hunts.",
      tag: "windows",
    },
    {
      id: "flix-t23",
      q: "Finance asks for a settlement exception list, not a vibe. What does the query look like, and what's the money rule under it?",
      a: "Two folds, one pass, both directions of the join. Statements LEFT JOIN payments on invoice id, then: COUNT(*) FILTER (WHERE i.status = 'void' AND p.id IS NOT NULL) — void-but-settled, this db's #11 at 925.00; COUNT(*) FILTER (WHERE i.status = 'paid' AND p.id IS NULL) — paid-status with zero legs, #28 at 1,756.00, which also lands on the never-collected anti-join worth 15,217 across 6 statements. The two error modes are mirrors, which is why neither the status column nor the legs table is trusted alone. The money rule underneath: statements and legs carry INTEGER euro-cents, so every dollar read is amount_cents / 100.0 exactly once, at the presentation edge — the missing .0 eats cents on odd rows and mislabels thousands as units, and on this book the trial balance must still land 181,080 against 181,080, delta zero, or the close doesn't ship.",
      tag: "quality",
    },
    {
      id: "flix-t24",
      q: "The yield review wants bookings whose fare beats their own market's average — not the network's. How do you build that comparison?",
      a: "Correlate the benchmark on the market. Join bookings to passengers for region, then compare each booking to a correlated subquery that folds the average fare over ITS market: WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 JOIN customers c2 ON c2.id = o2.customer_id WHERE c2.region = c.region). The uncorrelated scalar — one AVG over the whole book, 338.19 — answers the easier network question and flattens exactly the differences the dynamic-pricing review exists to discuss. The two things I flag: the correlated version re-runs per outer row, so at this scale it's fine but the window spelling (AVG(total) OVER (PARTITION BY region) joined back) is the scalable form; and the empty-market case — a market with no rows returns a NULL benchmark, and total > NULL is UNKNOWN, so that market silently drops rather than erroring. Staging the market fold in a CTE and joining back makes the population explicit and reviewable, which is the form I ship.",
      tag: "subqueries",
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
    {
      id: "flix-mcq-11",
      prompt: "The market cut of booking-to-departure lead reads EU 2.94, APAC 2.93, US 3.07, LATAM 3.5. Which expression produces the per-journey lead?",
      choices: [
        "shipped_at - created_at",
        "julianday(created_at) - julianday(shipped_at)",
        "julianday(shipped_at) - julianday(created_at)",
        "CAST(shipped_at AS DATE) - CAST(created_at AS DATE)",
      ],
      answer: 2,
      why: "julianday turns both stamps into real day numbers; the difference is a fractional-day lead the network-planning cut averages per market. Stamped bookings only — the 14 held have no lead by definition.",
      notes: [
        { choice: 0, why: "TEXT minus TEXT casts both stamps to leading integers — '2024-01-05' minus '2024-01-02' is 2024 minus 2024 = 0. The lead reads flat zero everywhere." },
        { choice: 1, why: "Booking minus departure is the negative lead — every market reads -2.9-ish and the advance-purchase curve points backwards." },
      ],
      difficulty: "easy",
    },
    {
      id: "flix-mcq-12",
      prompt: "The booking book folds to 103 with COUNT(*). A teammate's COUNT(shipped_at) prints 82. Reconcile.",
      choices: [
        "21 bookings were deleted overnight",
        "COUNT(column) skips NULLs — the 14 held and 7 refunded bookings carry no stamp",
        "COUNT(DISTINCT) is implied by a column argument",
        "shipped_at is NULL on exactly 82 rows",
      ],
      answer: 1,
      why: "COUNT(column) counts non-NULL values only: 103 rows minus the 21 stamp-less rows (14 held + 7 refunded) = 82. The gap between COUNT(*) and COUNT(shipped_at) is itself a metric — the not-yet-and-never-departed share.",
      notes: [
        { choice: 3, why: "Backwards — the stamp is NULL on 21 rows and present on 82. Reading the NULL count as the stamped count is how held bookings get reported as departed." },
        { choice: 2, why: "DISTINCT is never implied — COUNT(shipped_at) counts stamped rows with repeats. The 82 comes purely from NULL-blindness." },
      ],
      difficulty: "easy",
    },
    {
      id: "flix-mcq-13",
      prompt: "The 14-month booking spine runs 2024-01 to 2025-02. Which STRFTIME key builds it without merging the two Januarys?",
      choices: ["\"%m\"", "\"%Y-%M\"", "\"%Y-%m\"", "\"%D\""],
      answer: 2,
      why: "%Y-%m renders '2024-01' … '2025-02' — 14 distinct, chronologically-sortable text keys. %m is bare month and collides the years; %M is minutes.",
      notes: [
        { choice: 0, why: "'01' appears in both 2024 and 2025 — the spine collapses to 12 buckets and January 2025 merges into January 2024, faking a demand spike." },
        { choice: 1, why: "%M is minutes — every journey lands in one bucket and the trend is a single bar. Lowercase %m is months; uppercase is minutes." },
      ],
      difficulty: "easy",
    },
    {
      id: "flix-mcq-14",
      prompt: "LAG(booked_value) OVER (ORDER BY month) is NULL on 2024-01, the spine's first row. The trend deck should:",
      choices: [
        "COALESCE it to 0 so no bar is missing",
        "report NULL as baseline — there is no prior month, and a fabricated 0 prints a fake -100 percent step",
        "filter the row out with WHERE prior IS NOT NULL",
        "switch to LEAD to avoid the NULL",
      ],
      answer: 1,
      why: "The NULL is the definition: the first month has no prior to lag. 0 is a real pace figure on this spine (July 2024 = 1,193.86), so a coalesced 0 is indistinguishable from a real flat month and the step column reads fiction.",
      notes: [
        { choice: 2, why: "Dropping the baseline row hides where the walk starts — the reader sees 13 deltas with no anchor. NULL-as-baseline is the honest presentation." },
        { choice: 3, why: "LEAD looks forward — the last row goes NULL instead of the first, and the metric silently becomes next-month's value, not this month's prior." },
      ],
      difficulty: "easy",
    },
    {
      id: "flix-mcq-15",
      prompt: "The AR page lists statements with NO settlement legs. Which shape returns the 6 never-collected statements (15,217) safely?",
      choices: [
        "statements INNER JOIN legs WHERE amount > 0",
        "statements LEFT JOIN legs WHERE legs.id IS NULL — or NOT EXISTS (SELECT 1 FROM legs …)",
        "statements RIGHT JOIN legs WHERE statements.id IS NULL",
        "WHERE statement_id NOT IN (SELECT statement_id FROM legs) unguarded",
      ],
      answer: 1,
      why: "The anti-join is LEFT JOIN + IS NULL (or its NOT EXISTS twin): keep statements whose join found no leg. On this db that's 6 statements worth 15,217 — including one marked 'paid' with zero legs, which is exactly why the status column is a claim and the legs table is the ledger.",
      notes: [
        { choice: 3, why: "NOT IN is the same idea with a trap: one NULL in the subquery turns every comparison UNKNOWN and the AR page silently empties. Unguarded NOT IN is how zero-row AR reports ship." },
        { choice: 0, why: "INNER JOIN drops exactly the rows the page exists to show — a statement with no legs never survives an inner join. The anti-join must be LEFT-shaped." },
      ],
      difficulty: "easy",
    },
    {
      id: "flix-mcq-16",
      prompt: "The close packet stacks the settled-statement fold on top of the never-collected fold. Which stack keeps both censuses auditable?",
      choices: [
        "UNION — the dedup protects against double-counting",
        "UNION ALL with a literal state column ('settled'/'never-collected') per branch",
        "INTERSECT — only reconcilable rows survive",
        "A self-JOIN of the two folds on amounts",
      ],
      answer: 1,
      why: "Two folds of the same statements can land on identical figures — same counts, same cents — and UNION would silently delete one branch. UNION ALL plus the state literal keeps both rows and makes the packet self-labeling.",
      notes: [
        { choice: 0, why: "UNION's implicit DISTINCT is the bug: a byte-identical settled row and never-collected row collapse, and the close loses a bucket while every total still foots." },
        { choice: 2, why: "The two folds are disjoint by definition — INTERSECT returns nothing, and an empty close packet reads as a database error, not a reconciliation." },
      ],
      difficulty: "easy",
    },
    {
      id: "flix-mcq-17",
      prompt: "The loyalty ladder tops out at 24, 17, 14, 13, 5 bookings — then FOUR passengers tie at 4. Top-6 must keep the tie visible. Which read?",
      choices: [
        "ORDER BY bookings DESC LIMIT 6",
        "ROW_NUMBER() OVER (ORDER BY bookings DESC) <= 6",
        "RANK() OVER (ORDER BY bookings DESC) <= 6 — the four tie at rank 6 and all four board",
        "DENSE_RANK() OVER (ORDER BY bookings DESC) <= 6",
      ],
      answer: 2,
      why: "RANK gives the tie one shared rung (6, 6, 6, 6) and every tied passenger appears — the ladder keeps its promise that rank 6 exists four times. LIMIT and ROW_NUMBER both cut arbitrarily inside the tie; DENSE_RANK here numbers the tie rung 6 too and happens to match, but the stated policy is RANK plus a named tiebreak.",
      notes: [
        { choice: 0, why: "LIMIT 6 keeps exactly six rows — one of the four tied passengers makes the ladder by scan order, three don't, and which one changes between runs." },
        { choice: 1, why: "ROW_NUMBER splits the tie into 6, 7, 8, 9 — a silent judgment about which three passengers missed the cut that the loyalty policy never authorized." },
      ],
      difficulty: "medium",
    },
    {
      id: "flix-mcq-18",
      prompt: "A partner feed double-logs booking events. Which fragment keeps one deterministic row per (booking, event) pair?",
      choices: [
        "SELECT DISTINCT booking_id, event_type",
        "ROW_NUMBER() OVER (PARTITION BY booking_id, event_type, event_time ORDER BY ingested_at DESC, id DESC) = 1",
        "GROUP BY booking_id HAVING COUNT(*) = 1",
        "WHERE ingested_at = MAX(ingested_at)",
      ],
      answer: 1,
      why: "ROW_NUMBER over the natural key with a stated tiebreak keeps exactly one row — latest ingestion, id as the final word when timestamps tie. The dedupe rule is reviewable, which matters when the number feeds the partner settlement.",
      notes: [
        { choice: 0, why: "DISTINCT collapses legitimate repeat events too — two boarding scans for one booking at different times are not duplicates, and DISTINCT can't tell." },
        { choice: 2, why: "HAVING COUNT(*) = 1 discards every key that HAS duplicates — the feed's real events vanish with the noise, the opposite of a dedupe." },
      ],
      difficulty: "medium",
    },
    {
      id: "flix-mcq-19",
      prompt: "Advance-purchase reads filter bookings created on 2024-03-31. Which predicate doesn't drop the last night's bookings?",
      choices: [
        "created_at BETWEEN '2024-03-31' AND '2024-04-01'",
        "created_at >= '2024-03-31' AND created_at < '2024-04-01'",
        "STRFTIME('%d', created_at) = '31'",
        "created_at LIKE '2024-03-31%'",
      ],
      answer: 1,
      why: "Half-open [day, next-day) covers 00:00:00 through 23:59:59.999 with no boundary call. BETWEEN is inclusive at both ends, so 2024-04-01 00:00:00 sneaks in — and month-end is exactly when advance-purchase bookings land.",
      notes: [
        { choice: 0, why: "BETWEEN includes April 1 midnight — one foreign booking in the March window, and the quarter cut is off by the exact rows the yield team argues about." },
        { choice: 3, why: "LIKE works until the stamp format changes or an index stops applying — a range predicate on the real column is the form that survives both." },
      ],
      difficulty: "medium",
    },
    {
      id: "flix-mcq-20",
      prompt: "The partner manifest folds each operator's route SKUs into one cell — 'Keyboard K1,Smart Watch S'. Which fold prints it without duplicates?",
      choices: [
        "CONCAT(p.name) GROUP BY operator",
        "GROUP_CONCAT(p.name) with no qualifier",
        "GROUP_CONCAT(DISTINCT p.name) over the joined catalog",
        "SUM(p.name) GROUP BY operator",
      ],
      answer: 2,
      why: "GROUP_CONCAT(DISTINCT p.name) folds the joined lines — 40-plus per operator — back to the 3 distinct SKUs the manifest cell promises. Without DISTINCT the cell carries one entry per fare line: Nordic's manifest becomes 43 comma-joined names.",
      notes: [
        { choice: 1, why: "The join fans every SKU out to its fare lines — 43 lines for Nordic's 3 SKUs — so the unqualified fold repeats each name dozens of times. DISTINCT is the dedupe." },
        { choice: 3, why: "SUM over text is a type error or a zero depending on casts — the manifest is a string fold, and GROUP_CONCAT is the only aggregate that builds one." },
      ],
      difficulty: "medium",
    },
    {
      id: "flix-mcq-21",
      prompt: "Yield wants bookings that carry at least one premium-band line. Which shape can't double-count the booking?",
      choices: [
        "INNER JOIN order_items then COUNT(*)",
        "WHERE id IN (SELECT order_id FROM order_items WHERE unit_price >= 55)",
        "CROSS JOIN to order_items",
        "LEFT JOIN order_items GROUP BY booking",
      ],
      answer: 1,
      why: "IN (SELECT …) is a semi-join: membership tested once per booking, no line fan-out in the output. The inner join keeps one row per matching LINE — a booking with three premium lines appears three times until a DISTINCT fold repairs it.",
      notes: [
        { choice: 0, why: "After the join, COUNT(*) counts lines. The cohort is right but the grain is wrong — the booking count needs DISTINCT or a semi-join spelling." },
        { choice: 2, why: "CROSS JOIN pairs every booking with every line — 103 × 251 rows and no filter. Nothing about the premium band is tested at all." },
      ],
      difficulty: "medium",
    },
    {
      id: "flix-mcq-22",
      prompt: "The two-grain census reports EU at 45 bookings from 8 passengers. What is 5.6, and how is it computed?",
      choices: [
        "Bookings per passenger — COUNT(*) / COUNT(DISTINCT customer_id), the market's intensity read",
        "Average fare — SUM(total) / COUNT(*)",
        "Seat load — SUM(quantity) / COUNT(*)",
        "Passengers per booking — the inverse ratio",
      ],
      answer: 0,
      why: "45 bookings over 8 distinct passengers = 5.6 bookings per passenger — the intensity figure that says whether a market's growth is broadening (more passengers) or concentrating (more bookings per head). The US runs 19 from 2 — 9.5 — and the spread between 5.6 and 9.5 IS the coverage story.",
      notes: [
        { choice: 1, why: "Average fare is 338.19 network-wide — a yield metric from the total column, not a ratio of the two count grains." },
        { choice: 3, why: "Inverting it (8/45 = 0.18) is the same fact pointed backwards — but the deck's convention is bookings per passenger, and inverted ratios read as decimals nobody can act on." },
      ],
      difficulty: "medium",
    },
    {
      id: "flix-mcq-23",
      prompt: "Each market's review wants ITS biggest booking by fare, all markets in one result. Which window does it?",
      choices: [
        "GROUP BY region, then LIMIT 1",
        "MAX(total) GROUP BY region",
        "RANK() OVER (PARTITION BY region ORDER BY total DESC) = 1 over the bookings",
        "ORDER BY total DESC and read regionally",
      ],
      answer: 2,
      why: "PARTITION BY region restarts the ranking inside each market — every market's biggest fare surfaces with rank 1 in one result set. The two-grain census analogue at row grain: one anchor booking per market, with the booking visible beside its rank.",
      notes: [
        { choice: 0, why: "LIMIT 1 returns one row for the whole network — the biggest fare period — and three markets get nothing. LIMIT doesn't restart per group; PARTITION BY does." },
        { choice: 1, why: "MAX prints the figure but not WHICH booking or passenger earned it — the review needs the row, and argmax needs rank-and-pick." },
      ],
      difficulty: "hard",
    },
    {
      id: "flix-mcq-24",
      prompt: "Co-travel: which bookings departed in the same hour? The self-join's guard that keeps each pair exactly once is:",
      choices: [
        "o1.created_at = o2.created_at",
        "o1.id <> o2.id",
        "o1.id < o2.id AND the hour keys match",
        "o1.id = o2.id",
      ],
      answer: 2,
      why: "The strict inequality keeps exactly one ordering of every genuine pair — (A,B) survives, (B,A) and (A,A) don't — so COUNT(*) is a defensible pair count. Equality self-matches every booking; <> keeps both orderings and doubles the count.",
      notes: [
        { choice: 1, why: "<> only removes the self-row — every pair still appears twice, and the co-departure count doubles while looking plausible." },
        { choice: 3, why: "= pairs every booking with itself — the 'co-travel' read reports all 103 bookings and the metric is meaningless from row one." },
      ],
      difficulty: "hard",
    },
    {
      id: "flix-mcq-25",
      prompt: "A partner upload writes the EU market as 'EU', 'eu' and 'EU ' — GROUP BY prints six markets. The pre-fold repair is:",
      choices: [
        "LOWER(region)",
        "UPPER(region)",
        "TRIM(UPPER(region)) — casing and padding are two defects",
        "region COLLATE NOCASE",
      ],
      answer: 2,
      why: "GROUP BY folds on exact text, so both defect classes must die before the fold: UPPER kills the casing split, TRIM kills the padding split — and only both together turn three spellings into one market key.",
      notes: [
        { choice: 0, why: "LOWER('EU ') is 'eu ' — the padded rows stay their own group and the market count stays inflated after the 'fix'." },
        { choice: 3, why: "NOCASE equalizes case only — 'EU' and 'EU ' still fold apart. Collation is not a trim." },
      ],
      difficulty: "hard",
    },
    {
      id: "flix-mcq-26",
      prompt: "The concentration slide: each partner's share of the 34,833.28 book, one pass, no self-join. Which expression?",
      choices: [
        "ROUND(100.0 * SUM(value) / SUM(SUM(value)) OVER (), 1) over the operator fold",
        "ROUND(100.0 * value / COUNT(*), 1)",
        "PERCENT_RANK() OVER (ORDER BY value)",
        "value / MAX(value) OVER ()",
      ],
      answer: 0,
      why: "The nested aggregate — SUM of the per-group SUM over the whole partition — folds the operator values into the grand total in the same pass, so each operator's share prints beside its value. That's how the 32-percent top-operator line is computed.",
      notes: [
        { choice: 1, why: "COUNT(*) counts operators (6), not euros — the 'share' divides by 6 and reconciles to nothing the book foots to." },
        { choice: 2, why: "PERCENT_RANK is a position statistic between the smallest and largest operator — it answers 'how far down the board' not 'how much of the book'." },
      ],
      difficulty: "hard",
    },
    {
      id: "flix-mcq-27",
      prompt: "Which bookings out-earn THEIR MARKET's average fare (not the network's 338.19)? The correct shape is:",
      choices: [
        "WHERE total > (SELECT AVG(total) FROM orders)",
        "WHERE total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) — wait, per MARKET: join customers and correlate on region",
        "HAVING total > AVG(total)",
        "WHERE total > 338.19",
      ],
      answer: 1,
      why: "The benchmark is the market's own fold, so the subquery must correlate on region — joining customers and comparing each booking to the average fare of ITS market. The uncorrelated scalar in choice 0 benchmarks against the whole network, which is a different (and easier) question.",
      notes: [
        { choice: 0, why: "That's the network benchmark — 338.19 for every row. It answers 'above network average', which flattens the market differences the dynamic-pricing review exists to discuss." },
        { choice: 2, why: "HAVING judges groups, not rows — total isn't a group property, and this errors or folds to nonsense. Row-versus-fold comparisons need a correlated subquery or a window." },
      ],
      difficulty: "hard",
    },
    {
      id: "flix-mcq-28",
      prompt: "The lead-time report prints NULL for the 14 held bookings. The presentation fix that doesn't lie:",
      choices: [
        "COALESCE(lead_days, 0) — held journeys read as same-day departures",
        "COALESCE(lead_text, 'not yet departed') at the report edge — the NULL stays NULL through every fold",
        "IFNULL(shipped_at, created_at) before the lead math",
        "Filter held bookings out of the query",
      ],
      answer: 1,
      why: "COALESCE belongs where a human reads, not where the math runs: the lead stays NULL through every aggregate (AVG ignores it correctly), and the report translates NULL to a label. Any default that could be mistaken for a real lead — 0, or the booking date — manufactures departures that never happened.",
      notes: [
        { choice: 0, why: "0 is a real lead on this network (same-day ticketing exists), so the faked zeros are indistinguishable from real ones and the 2.98 average corrupts silently." },
        { choice: 2, why: "Substituting created_at for shipped_at invents a zero-day departure for every held booking — the average drops, the queue looks healthy, and nothing flags it." },
      ],
      difficulty: "easy",
    },
    {
      id: "flix-mcq-29",
      prompt: "The ladder reads 24, 17, 14, 13, 5 bookings, then four passengers tied at 4. What does DENSE_RANK print for the tie and the next distinct count?",
      choices: [
        "6, 6, 6, 6 then 7 — shared rungs, no gaps",
        "6, 6, 6, 6 then 10 — shared rungs with gaps",
        "6, 7, 8, 9 then 10 — split rungs",
        "6, 6, 6, 6 then NULL — the tie consumes the sequence",
      ],
      answer: 0,
      why: "DENSE_RANK numbers rungs consecutively: the four-way tie shares rung 6 and the next distinct count is rung 7. RANK would print 6, 6, 6, 6 then 10 — the gap is the honest count of consumed slots; DENSE_RANK hides that depth.",
      notes: [
        { choice: 1, why: "That's RANK's output, not DENSE_RANK's — the gap after the tie (10) is exactly the semantics DENSE_RANK exists to remove." },
        { choice: 2, why: "Split rungs are ROW_NUMBER — a silent tiebreak the loyalty policy never chose. The trio differ only in tie policy; the panel wants the policy named." },
      ],
      difficulty: "medium",
    },
    {
      id: "flix-mcq-30",
      prompt: "The ops board wants a rolling 7-booking load window over bookings ordered by created_at. Which frame is exactly seven rows wide?",
      choices: [
        "RANGE BETWEEN 6 PRECEDING AND CURRENT ROW",
        "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW",
        "the default frame",
        "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
      ],
      answer: 1,
      why: "ROWS counts physical rows: six preceding plus current = exactly 7. RANGE compares values — tied timestamps pull peers in and the '7-row' window silently widens — and the default frame is the whole partition up to the current row.",
      notes: [
        { choice: 0, why: "RANGE with a numeric offset against timestamps is invalid or value-compared — on booking-grain ties it is wrong every time. Rolling windows on ordered events want ROWS." },
        { choice: 3, why: "That's the running total's frame — it grows from row 1 and never slides. A rolling window that only grows is a cumulative sum wearing a rolling name." },
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
    {
      id: "cs-flix-3",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The pace walk with steps",
      brief:
        "Network-planning memo on the storefront db: the trend deck reads the 14-month booking spine as a walk — each month's booked value beside the prior month's and the step between them — and the first row's step is NULL by definition, labeled baseline, never zero. Probed facts: the spine opens 2024-01 at 3,731.97; 2024-02 steps -122.33 to 3,609.64; the long slide runs through 2024-07's 1,193.86 trough (-853.57 into it); August rebounds +1,158.21 to 2,352.07; and the steepest drop of the walk is -1,326.87 into 2024-11's 1,648.8. The deck reads the walk chronologically, oldest first, so the steps read like a story and not a ranking. The walk is staged: fold months first, then LAG over the fold.",
      ask: "Return each month bucket with booked value to 2 decimals, the prior month's value, and the step (current minus prior) to 2 decimals, in chronological order.",
      template:
        "WITH monthly AS (\n  SELECT STRFTIME({1}, created_at) AS month_bucket,\n         SUM(total) AS booked_value\n  FROM orders\n  GROUP BY month_bucket\n)\nSELECT month_bucket,\n       ROUND(booked_value, {2}) AS booked_value,\n       LAG(ROUND(booked_value, 2)) OVER (ORDER BY {3}) AS prior_value,\n       ROUND(booked_value - LAG(ROUND(booked_value, 2)) OVER (ORDER BY month_bucket), 2) AS step\nFROM monthly\nORDER BY month_bucket;",
      slots: [
        {
          answer: "\"%Y-%m\"",
          kind: "keyword",
          label: "the month key format",
          why: "STRFTIME('%Y-%m', created_at) builds the 14-distinct-key chronological spine. '%m' alone merges the two Januarys — 24 bookings and two years fold into one bucket and the walk reads 12 steps of fiction. '%Y-%M' renders minutes: one bucket, no walk at all.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the value precision",
          why: "The walk reports to 2 decimals — 3,731.97 stepping -122.33 — because the steps are diffs of cent-precise folds and a 1-decimal walk compounds the rounding across 13 steps.",
        },
        {
          answer: "month_bucket",
          kind: "keyword",
          label: "the walk order",
          why: "LAG walks the spine in month order — that's what makes 'prior month' mean the calendar month before. Order the window by booked_value and the 'prior' is the richest month, the steps read nonsense, and the -1,326.87 November cliff disappears into noise.",
        },
      ],
      distractors: ["\"%m\"", "\"%Y-%M\"", "booked_value", "total"],
      walkthrough:
        "Two stages, one walk. The CTE folds 103 bookings into 14 month buckets; the outer query lays the walk — LAG(booked_value) OVER (ORDER BY month_bucket) carries the prior month onto each row, and the step is current minus prior, ROUNDed once at the edge. The walk tells the story the deck ships: the book opens 3,731.97, drifts down to the 1,193.86 July trough, rebounds +1,158.21 into August, and falls hardest -1,326.87 into November — with 2024-01's prior NULL by definition, the baseline the deck labels rather than fakes. The two-stage shape is the graded part: LAG over raw bookings walks booking-by-booking and prints 102 meaningless steps; LAG over the month fold walks the spine. The distractors fail honestly: '%m' merges the Januarys into a 12-bucket walk; '%Y-%M' buckets by minutes and the walk collapses to one row with a NULL prior; ordering the window by booked_value turns 'prior' into 'richest so far' and every step lies; total errors because the CTE never carries the raw column. Walk the fold, not the rows — that's the whole case.",
    },
    {
      id: "cs-flix-4",
      tier: "medium",
      topic: "s7",
      universe: "funnel",
      title: "The fate map by market",
      brief:
        "Ops-board memo on the storefront db: the standup opens with the journey-fate map pivoted per market — one row per market, four fate columns beside the booking count, every arm a conditional fold over the same rows so the four arms reconcile to the row count by construction. Probed facts: EU runs 45 bookings as 24 traveled + 12 in-flight + 6 held + 3 refunded; APAC 37 as 21 + 8 + 5 + 3; US 19 as 5 + 10 + 3 + 1; LATAM 2 as 2 traveled and nothing else. The reads the deck argues from: US is the in-flight-heavy market (10 of 19 ticketed-but-not-arrived), LATAM's book is fully traveled, and the refunded arm foots to the 7 the yield forecast hairs off. Biggest market first.",
      ask: "Return each market with its booking count and four fate columns — traveled, in-flight, held, refunded — each a conditional count over the same rows, biggest market first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS bookings,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS traveled,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS in_flight,\n       SUM(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) AS held,\n       SUM(CASE WHEN o.status = {4} THEN 1 ELSE 0 END) AS refunded\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY bookings DESC;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the traveled arm",
          why: "Traveled means status 'delivered' — 24/21/5/2 per market. 'traveled' matches nothing: the fate vocabulary is the status column's, and an arm that reads all zeros reconciles to nothing while looking like a clean census.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the in-flight arm",
          why: "In-flight is 'shipped' — the 30 ticketed-not-arrived bookings, 12 of them in EU. Swapping in 'departed' or 'ticketed' reads zero and the standup concludes the network has nothing in the air.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the held arm",
          why: "Held is 'pending' — the 14 not-yet-ticketed bookings the queue watches. 'held' is the business word, not the status value; a CASE on 'held' prints zeros and hides the queue entirely.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the refunded arm",
          why: "Refunded is 'cancelled' — the 7 bookings (3 APAC, 3 EU, 1 US) the refund share divides by. Misspelling the arm reconciles the census to 96 and the missing rows are exactly the refund haircut.",
        },
      ],
      distractors: ["'traveled'", "'held'", "'DEPARTED'", "'booked'"],
      walkthrough:
        "One join, one fold, four conditional arms that must reconcile to the row count. The join lands each booking in its market; the four SUM(CASE …) arms partition the status vocabulary over the same rows, so every market's arms must sum to its bookings cell — EU 24+12+6+3 = 45, APAC 21+8+5+3 = 37, US 5+10+3+1 = 19, LATAM 2+0+0+0 = 2 — and that reconciliation IS the census's proof. The reads fall out of the pivot: US carries the deepest in-flight share (10 of 19 — the ticketed-not-arrived market), LATAM's two bookings both traveled, and the refunded arm foots to the 7 the yield forecast carries. The distractors fail honestly: 'traveled', 'held', 'DEPARTED' and 'booked' are none of them status values — each zeroes its arm, the reconciliation breaks by exactly that arm's true count, and a census that foots to 96 of 103 flags itself as broken. Statuses are the ledger's vocabulary; the business words are labels, not keys.",
    },
    {
      id: "cs-flix-5",
      tier: "easy",
      topic: "j4",
      universe: "month-close",
      title: "The never-collected list",
      brief:
        "Partner-settlement memo on the storefront db: before any dunning goes out, the pod refreshes the never-collected list — settlement statements with ZERO payment legs — and walks it biggest euro value first. Probed facts: the anti-join returns exactly 6 statements worth 15,217.00 — INV-2025-024 at 4,937.00, INV-2025-026 at 3,562.00, INV-2025-027 at 2,794.00, INV-2025-028 at 1,756.00, INV-2024-021 at 1,295.00 and INV-2024-018 at 873.00. The list's headline anomaly: INV-2025-028 carries status 'paid' with zero legs — a status that lies, which is why the legs table is the ledger of record and the status column is a claim. The other five read 'open' and are the real chase list. Money is INTEGER euro-cents; the euro read is amount_cents / 100.0, once.",
      ask: "Return each settlement statement that has no payment legs: statement id, number, status, and euro value to 2 decimals, biggest euro value first.",
      template:
        "SELECT i.id AS statement_id,\n       i.number,\n       i.status,\n       ROUND(i.amount_cents / 100.0, 2) AS eur_value\nFROM invoices i\nLEFT JOIN payments p ON p.{1} = i.id\nWHERE p.id IS {2}\nORDER BY {3} DESC;",
      slots: [
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the settlement join key",
          why: "Legs hang off statements through p.invoice_id = i.id. p.id = i.id joins payment serials to statement ids — collisions pair unrelated rows, a few statements pick up phantom legs and drop OFF the never-collected list, which is the one direction this report cannot be wrong in.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the anti-join arm",
          why: "IS NULL keeps statements whose join found no leg — the anti-join. IS NOT NULL returns the collected book instead, and the dunning run goes out to partners who already paid while the 15,217 chase list stays hidden.",
        },
        {
          answer: "eur_value",
          kind: "keyword",
          label: "the chase order",
          why: "The pod works biggest-first: 4,937.00 down to 873.00. Ordering by id or number re-sequences the call list and buries the two biggest exposures mid-page — the dunning queue is a prioritization, not a roster.",
        },
      ],
      distractors: ["NOT NULL", "id", "customer_id", "status", "number"],
      walkthrough:
        "One LEFT JOIN, one NULL test, one prioritized list. The join attempts every statement's legs; WHERE p.id IS NULL keeps the statements that found none — the anti-join, 6 rows worth 15,217.00 — and ORDER BY eur_value DESC sequences the dunning run from 4,937.00 down to 873.00. The list is the close's exception page, and its sharpest row is INV-2025-028: status 'paid', zero legs, 1,756.00 — the mirror anomaly of #11 (void WITH a leg at 925.00, which this anti-join never surfaces). That's why the pod runs both directions: the status column is a claim, the legs are the ledger, and neither alone reconciles the book. The distractors fail honestly: IS NOT NULL flips the report to the collected book; p.id = i.id collides serials with statement ids and silently heals statements that are in fact uncollected; customer_id errors — payments carry no such column; and ordering by status or number re-sequences the call list away from the exposure ranking. The euro conversion happens exactly once — / 100.0 at the edge — or the chase list reads 1,521,700 and nobody duns anybody.",
    },
    {
      id: "cs-flix-6",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass fate census",
      brief:
        "Ops-board memo on the storefront db: the day's first query is the one-pass fate census — booked, traveled, departure-stamped, held, refunded, stamp coverage — all conditional folds over the same 103 rows, all reconciling by construction. Probed facts: 103 booked; 52 traveled (status delivered); 82 departure-stamped (shipped_at present — 52 traveled plus 30 in-flight); 14 held (pending); 7 refunded (cancelled); stamp coverage 79.6. The identity the board checks first: traveled + in-flight + held + refunded = 52 + 30 + 14 + 7 = 103, so any census whose arms don't sum to COUNT(*) is broken on arrival. Coverage is stamped over ALL bookings — the held rows stay in the denominator because 'not yet' is what the metric measures.",
      ask: "Return one census row: total bookings, traveled count, departure-stamped count, held count, refunded count, and stamp coverage to 1 decimal.",
      template:
        "SELECT COUNT(*) AS booked,\n       COUNT(*) FILTER (WHERE status = {1}) AS traveled,\n       COUNT(*) FILTER (WHERE shipped_at IS NOT NULL) AS departure_stamped,\n       COUNT(*) FILTER (WHERE status = {2}) AS held,\n       COUNT(*) FILTER (WHERE status = {3}) AS refunded,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE shipped_at IS NOT NULL) / COUNT(*), {4}) AS stamp_coverage\nFROM orders;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the traveled arm",
          why: "Traveled is status 'delivered' — 52 of 103. 'traveled' is the business word, not the status value: an arm built on it reads zero, and the census reconciles to 51 while claiming to be whole.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the held arm",
          why: "Held is 'pending' — the 14 bookings in the ticketing queue. They are 'not yet', never 'never': collapsing them into refunded (or into a NULL-stamp bucket with the refunded rows) is the classic mis-defined funnel this census exists to catch.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the refunded arm",
          why: "Refunded is 'cancelled' — 7 bookings that never boarded and never get a stamp. Drop the arm and the fate census covers 96 of 103; the missing 6.8 percent is exactly the haircut every yield forecast carries.",
        },
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the coverage precision",
          why: "The deck quotes one decimal — 79.6. The raw ratio is 82/103 = 79.6116…, so one decimal is a genuine rounding, not a truncation, and the census, the slide and the audit all print the same 79.6.",
        },
      ],
      distractors: ["'traveled'", "'held'", "'booked'", "2"],
      walkthrough:
        "One table, one scan, five conditional folds and an identity. The four status arms partition the vocabulary — delivered 52, pending 14, cancelled 7 — while the stamp fold rides shipped_at IS NOT NULL and reads 82, which is traveled 52 plus in-flight 30: two different denominators on one row, and the census says which is which. Coverage divides the stamp count by ALL 103 bookings with 100.0 entering before the slash — 79.6 — because the 14 held are the metric's subject, not its exception. The reconciliation is the ship gate: 52 + 30 + 14 + 7 = 103, so any arm that drifts flags a status value the CASE never named. The distractors fail honestly: 'traveled', 'held' and 'booked' are business words, not status values — each zeroes its arm and the identity breaks by exactly that arm's true count; and rounding to 2 prints 79.61, a cell no slide carries. One scan, one identity, one coverage figure — the census the whole kit's fate map hangs from.",
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
    { slug: "trips-and-users", why: "Trips folded against requesters with the cancelled share beside — the per-market demand-versus-refund read at practice scale, the partner-review opener." },
    { slug: "total-traveled-distance", why: "Distance folded per asset from leg records — the corridor-total read the network board runs beside load, drilled with SUM-over-joins discipline." },
    { slug: "the-number-of-passengers-in-each-bus-i", why: "Boarded passengers per departure — the per-leg census that, on a coach network, is the bookings-per-operator fold the partner bench ranks from." },
    { slug: "the-number-of-passengers-in-each-bus-ii", why: "The cumulative boarding variant — how many seats fill before each stop, the load-along-the-corridor window drill behind frequency debates." },
    { slug: "hopper-company-queries-i", why: "Cancelled-share census per driver maps one-to-one onto per-operator refund rates — the conditional fold the ops standup boards first." },
    { slug: "calculate-orders-within-each-interval", why: "Demand bucketed into time intervals — the booking-window CASE drill that decides when a corridor's frequency floor can be raised." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Repeat bookings inside a seven-day window — the re-book signal the loyalty pod hunts before the win-back campaign fires." },
    { slug: "second-day-confirmation", why: "Confirmations landing by day two — the ticketing-latency read that sizes the held queue before the departures board is trusted." },
    { slug: "second-day-verification", why: "Second-day verification rates — the D2 discipline the ticketing desk applies to journeys that leave the booking window without a stamp." },
    { slug: "ar-aging-schedule", why: "Receivables aged into buckets — the 15,217 never-collected chase list reads exactly as an aging schedule in euro-cents." },
    { slug: "duplicate-charge-pairs", why: "Duplicate payment legs paired by amount and day — the settlement-hygiene scan that catches double-settled partners before the close ties out." },
    { slug: "median-time-to-convert", why: "Median held-to-ticketed conversion time — the percentile read that sizes how long the 14 held journeys can sit before they threaten the departures board." },
    { slug: "average-selling-price", why: "Average selling price per fare class — the per-band yield fold (31.01 versus 115.85 on this ladder) the yield review reads beside seat load." },
    { slug: "rolling-7d-actives", why: "Rolling activity windows on the demand spine — the pace curve's smoothing read, and the frame-discipline drill the trend deck builds on." },
    { slug: "year-on-year-growth-rate", why: "YoY deltas on the month spine — the seasonality read the 14-bucket walk exists for, with the first row's NULL reported as baseline." },
    { slug: "consecutive-available-seats", why: "Consecutive seat availability — the seat-map logic drill, and on a coach network the group-booking question the yield engine prices directly." },
  ],
};
