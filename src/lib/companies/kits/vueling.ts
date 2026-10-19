// Vueling — wave-10 (Task 100), travel domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// Spain's low-cost carrier: Mediterranean hub-and-spoke from the Barcelona base, fare-family
// laddering and ancillary attach-rate economics. Distinct from ryanair's point-to-point framing:
// this kit reads the db as a hub-led attach business — the fare is thin, the ladder (Basic /
// Optima / Excellence-style families, seat, bag, boarding) is where margin lives. Pool
// provenance: company-pools.md carries NO Vueling section — 0 tagged rows — so all 10 topic
// slug sets and all 32 problems are theme-curated from the pools file's theme menu (sql rows
// only) and say so in brief P4. Case studies run on the storefront db with probed figures from
// scripts/company-facts.md, mapped honestly: customers = passengers (region = market buckets),
// orders = bookings (delivered = flown 52, shipped = ticketed-in-flight-future with shipped_at
// as the departure stamp 30, pending = held-not-ticketed 14, cancelled = refunded 7),
// order_items = fare+ancillary line records (seat, bag, boarding lines), products = fare
// families/ancillaries, suppliers = airport/handling partners, invoices = ticketing statements
// and payments = payment rails (finance tables store INTEGER euro-cents — every money read is
// amount_cents / 100.0; orders.total and order_items.unit_price are REAL dollars already),
// expenses = route opex, ledger_entries = GL.

import type { CompanyKit } from "../types";

export const vuelingKit: CompanyKit = {
  id: "vueling",
  domainId: "travel",
  name: "Vueling",
  tagline: "Barcelona's low-fare hub: attach rates and fare-family ladders",
  accent: "text-yellow-300",

  brief: [
    "**Vueling** is Spain's low-cost carrier — an IAG-group airline flying a Mediterranean hub-and-spoke network out of its Barcelona base, where the ticket is deliberately thin and the quarter is won on what attaches to it: seats, bags, boarding priority and the fare-family ladder a passenger climbs at booking. The analytics culture mirrors that: *load factor and ancillary attach rate are the two numbers the commercial team lives by*. In this app's training db the mapping is honest: `orders` are bookings (PNRs), order_items are the fare and ancillary lines each PNR carries, products are fare families and ancillary SKUs, customers are passengers with region as the market bucket. Probed scale: **103 bookings worth 34833.28** carrying **251 fare+ancillary lines** — 2.44 lines per booking, the attach story in one ratio.",
    "The data org is commercial-shaped. Revenue management owns load: **82 of 103** bookings carry the departure stamp (52 flown plus 30 ticketed-in-flight-future), 14 sit {amber:held-not-ticketed} in the booking window, and 7 are {rose:refunded} — 6.8% of demand that never boarded. Ancillary analytics owns attach: the widest family put **121 units** on just 54 of the 103 bookings, while the richest family carries 11744.01 of value on 46 — breadth and yield are different families, and the tension between them is the attach deck. Finance owns ticketing statements in INTEGER euro-cents across 28 invoices and 27 payment-rail legs, where the money read is `amount_cents / 100.0` or it lies by a hundredfold.",
    "The SQL screens are census-then-denominator. A loop opens with a one-pass ticketing-state census — booked, departed, held, refunded, share — and the trap is filtering the denominator: a WHERE that drops {rose:refunded} bookings before the fold prints a load factor the network never flew. It escalates into attach reads where the fold is the test — 251 lines join until `COUNT(*)` counts seat legs and calls them bookings — and into the fare ladder, a CASE banding of line rates where the premium arm is {sky:empty by construction} at the 199.99 ceiling. Anti-join drills return **zero rows** here (every passenger and every SKU has moved), and the interviewer grades one sentence: *the numerator is departures, the denominator is every booking — and lines, units and bookings are three different counts on the same rows*.",
    "Prep strategy: the pools file carries no Vueling section — zero tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's screen shapes: attach censuses, fare-family CASE ladders, ticketing-state funnels, two-grain market reads, partner-bench gates and cents-safe statement folds. Do the topics in order, then run all six case studies on the live storefront db: the {emerald:attach census} and the {sky:handling-partner bench} the reviews open with, the {emerald:booking-pace spine} and the {sky:fare-ladder split} revenue management reads monthly, and the {emerald:refund haircut} and {sky:settlement census} the close is gated on. The bar to clear: *state the definition and the denominator before you compute anything* — then make every state census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** Ticketing-state first: the overnight census — 103 bookings, 82 departed, 14 {amber:held-not-ticketed}, 7 {rose:refunded} — and the departed share beside it, 79.6, *with the denominator printed on the slide or the number means nothing*. The Barcelona hub desk has already pinged about tomorrow's departure curve, so the booking-to-departure lead (**2.98** days average, 2-to-4 spread) runs before the commercial standup. A booking that left the window without a stamp is the day's first incident, not a rounding note.",
    "**11:30 —** Deep work: the attach cut. The family fold — units, distinct bookings and value per fare family — puts the seat/bag-heavy family at **121 units across 54 bookings** while the fare-heavy one holds 11744.01 on 46, and the per-market read follows: EU 45 bookings worth 15089.23 from 8 passengers, APAC 37 from 5, US 19 from just 2. The instinct being trained: the fan-out is the trap, so the booking counter is COUNT(DISTINCT order_id) or the fold counts seat legs and calls them PNRs. *Breadth families fund volume; yield families fund the quarter — the deck needs both columns.*",
    "**15:30 —** The afternoon tilts toward partners and money. The handling-partner bench re-ranks — Nordic-style partners cleared by a 3-family listing floor, the highest-rated two-listing catalog dropped for depth — before base ops re-signs a single handling contract. Then statement hygiene: **6 uncollected ticketing statements worth 15217** read in euro-cents over 100.0, one {amber:partial} at 4000 of 6148, and the anomaly list walked line by line — a {rose:void} statement that moved 925 anyway, a paid-status statement carrying zero payment rows (1756). The note ships with definitions attached, or the close re-opens it tomorrow.",
  ],

  metrics: [
    { name: "Load factor", what: "Bookings with a departure stamp over all bookings — 82 of 103 on the db, 79.6%. The network's heartbeat: any read that filters refunded or held bookings out of the base first is a load factor that flatters the schedule." },
    { name: "Ancillary lines per booking", what: "Fare+ancillary lines over bookings — 251 over 103, 2.44. The attach proxy at network grain: every tenth of a line is seat/bag/boarding revenue the fare never earned." },
    { name: "Attach breadth vs yield", what: "Per family: units and distinct bookings beside value — 121 units on 54 bookings (the seat/bag engine) against 11744.01 on 46 (the fare-heavy cabin). Attach strategy reads the spread, not either column alone." },
    { name: "Booking-to-departure lead", what: "julianday(departure) minus julianday(booking) on stamped bookings — 2.98 days average, range 2 to 4. The window every seat upgrade and bag-attach offer is sized against, by market." },
    { name: "Held-not-ticketed share", what: "Bookings pending without a departure stamp over all bookings — 14 of 103 (13.6%). Unconverted demand sitting in the ticketing queue; it stays in every load denominator." },
    { name: "Refund share", what: "Refunded bookings over all bookings — 7 of 103 (6.8%), cut by market: APAC 8.1, EU 6.7, US 5.3. The haircut every yield forecast carries before seats are re-released." },
    { name: "Fare-ladder split", what: "Line volume below vs above the 55 rate line — 268 units at a 31.01 average against 230 at 115.85. The Basic-vs-Optima ladder in one fold; the premium tip is empty at the 199.99 ceiling." },
    { name: "Statement coverage", what: "Ticketing statements settled exact, partial or never — 21 exact, 1 partial (4000 of 6148), 6 never worth 15217. Money is INTEGER euro-cents; a skipped /100.0 turns a clean tie-out into a phantom break." },
  ],

  topics: [
    {
      name: "Ancillary attach censuses",
      why: "The attach team's Monday read is a family fold: units, distinct bookings and value per fare family, in one pass. SUM(quantity), COUNT(DISTINCT order_id) and SUM(quantity * unit_price) are three different folds over the same 251 lines — and the interviewer grades which one each column claims. The drill is two-grain honesty: 121 units across 54 bookings is a different sentence than 121 bookings.",
      slugs: ["product-sales-analysis-ii", "daily-leads-and-partners", "number-of-rich-customers", "average-selling-price", "keep-latest-dedupe", "immediate-food-delivery-ii", "customer-order-frequency"],
    },
    {
      name: "Fare-family ladder bands",
      why: "The ladder is a CASE ladder — Basic below the 55 line, Optima and above above it, premium empty at the 199.99 ceiling — and every booking line must land in exactly one arm. Ordered, exhaustive WHENs are the graded part: a hole in the CASE is a hole in the mix deck, and a reordered WHEN quietly re-bands the base.",
      slugs: ["calculate-orders-within-each-interval", "the-category-of-each-member-in-the-store", "spend-histogram", "weather-type-in-each-country", "monthly-transactions-ii", "calculate-parking-fees-and-duration", "exchange-seats"],
    },
    {
      name: "Ticketing-state funnels",
      why: "Booked to ticketed to departed to kept: each stage is a conditional count over status or the departure stamp, and the funnel's denominator is the whole interview. Held-not-ticketed (14) is 'not yet', refunded (7) is 'never' — collapsing either into the other is the classic mis-defined funnel this kit hunts.",
      slugs: ["funnel-step-conversion", "trial-to-paid-funnel", "percentage-of-users-attended-a-contest", "confirmation-rate", "second-day-confirmation", "second-day-verification", "find-churn-risk-customers", "customers-who-never-order"],
    },
    {
      name: "Two-grain market censuses",
      why: "The Barcelona-hub read reports bookings AND passengers per market: EU runs 45 bookings from 8 passengers while the US runs 19 from 2 — intensity 5.6 against 9.5. COUNT(*) beside COUNT(DISTINCT customer_id), and saying out loud which column is load and which is coverage, is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "students-and-examinations", "top-earners", "immediate-food-delivery-i", "flight-occupancy-and-waitlist-analysis", "product-sales-analysis-i", "sales-analysis-i", "combine-two-tables", "the-airport-with-the-most-flights"],
    },
    {
      name: "Route & partner value boards",
      why: "Handling partners and fare families both rank on folded value, and the boards are window ranks over GROUP BY folds — with the rank computed after any gate, not before. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung; on a partner board a shared rung is a negotiation fact, not syntax.",
      slugs: ["rank-scores", "compute-the-rank-as-a-percentage", "department-top-three-salaries", "trips-and-users", "total-traveled-distance", "second-highest-salary", "customer-placing-the-largest-number-of-orders", "biggest-window-between-events"],
    },
    {
      name: "Departure lead-time math",
      why: "The upsell window is julianday(departure) minus julianday(booking) on the 82 stamped bookings — 2.98 days, 2-to-4 spread. Timestamp-pair arithmetic with the population stated (stamped only; the 21 unstamped have no lead) is the exact drill, and duration-billed ancillaries use the same machinery.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "users-that-actively-request-confirmation-messages", "median-time-to-convert", "server-utilization-time"],
    },
    {
      name: "Mediterranean seasonality",
      why: "Hub-and-spoke demand breathes with the holiday calendar, and the commercial deck reads YoY deltas and rolling pace on the 14-bucket month spine (2024-01 to 2025-02). LAG prior-period walks, CASE season splits and RANGE-frame rolling averages are the staples — with the first row's NULL reported as baseline, never zero.",
      slugs: ["year-on-year-growth-rate", "seasonal-sales-analysis", "rolling-average-steps", "rolling-7d-actives"],
    },
    {
      name: "Statement cents discipline",
      why: "Ticketing statements and payment rails settle in INTEGER euro-cents across 28 invoices and 27 payments — the dollar read is amount_cents / 100.0, exactly once, at the presentation edge. The exact/partial/none coverage split (21 / 1 / 6) is one conditional fold away, and a skipped .0 is a hundredfold phantom break.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "trial-balance-check", "ar-aging-schedule", "duplicate-charge-pairs"],
    },
    {
      name: "Partner bench gates",
      why: "Base ops plans handling from partners that clear a listing-depth floor — and the gate lives in HAVING, after the fold, because breadth is a property of the group. Relational-division reads (which partners carry every family) and HAVING-floor benches are the drills; on this db every partner has moved, so the zero answer needs proving too.",
      slugs: ["customers-who-bought-all-products", "find-cities-in-each-state-ii", "sellers-with-no-sales", "the-number-of-passengers-in-each-bus-i", "hopper-company-queries-i"],
    },
    {
      name: "Co-attach pairing & seat logic",
      why: "Which families attach together, which seat rows sit consecutive, which bookings pair on the same day — co-attach reads are self-joins and EXISTS pairs with anti-symmetry guards. Seat-map logic (consecutive availability, seat swaps) is the load-adjacent drill this carrier is famous for asking.",
      slugs: ["symmetric-pairs", "find-product-recommendation-pairs", "consecutive-available-seats", "users-with-two-purchases-within-seven-days"],
    },
  ],

  theory: [
    {
      id: "vueling-t1",
      q: "Your attach-rate query joins bookings to their fare and ancillary lines and the passenger count explodes. What happened, and what's the fix?",
      a: "The join fanned out: 103 bookings carry 251 fare+ancillary lines, so joining to lines multiplies every booking row by its line count and COUNT(*) counts seat legs, not bookings or passengers. The fix is grain honesty. Either fold lines to booking level first in a CTE — SUM(quantity), SUM(quantity * unit_price) per order_id — then join up, or keep the fan-out and fold with COUNT(DISTINCT o.customer_id) when the claim is passengers. I say the four counts out loud on any attach read: lines (251), units (498), bookings (103), passengers (16) — and the one the slide claims must match the fold actually written. On this network the widest family logs 121 units across 54 bookings: units and bookings are different columns, and an attach rate built on the wrong grain isn't slightly off — it's a different metric wearing the right name.",
      tag: "joins",
    },
    {
      id: "vueling-t2",
      q: "The handling-partner board ranks bases by route value, and two partners tie. How do you make the tie a decision instead of an accident?",
      a: "Pick the window function by its tie policy and state it. ROW_NUMBER breaks ties arbitrarily — the board looks precise and is actually ordered by rowid. RANK gives tied partners the same rung and skips consumed slots (2, 2, then 4), which is honest about how many partners sit above. DENSE_RANK numbers rungs consecutively and hides the depth of the tie. On an ops board I ship RANK with a deterministic tiebreaker (partner id), and if the tie itself matters — two handling agents quoting the same folded rate — I surface the tie as a column, because 'tied' is a fact the contract desk will act on. One more thing the bench teaches: the rank is computed over the rows that survived the HAVING gate, so a listing-depth floor renumbers the ladder — the rank column and the gate must be read together or the board implies a bench that doesn't exist.",
      tag: "windows",
    },
    {
      id: "vueling-t3",
      q: "Write the ticketing-state census in one query: booked, departed, held, refunded, departed share. Where do candidates usually go wrong?",
      a: "One pass with conditional folds: COUNT(*) AS booked, COUNT(*) FILTER (WHERE shipped_at IS NOT NULL) AS departed, COUNT(*) FILTER (WHERE status = 'pending') AS held_not_ticketed, COUNT(*) FILTER (WHERE status = 'cancelled') AS refunded, and ROUND(100.0 * departed / COUNT(*), 1) — 103, 82, 14, 7, 79.6 on this db. Failure one is a WHERE clause: filtering refunded 'to keep it clean' shrinks the base to 96 and prints a load factor the network never flew. Failure two is integer division: 100 * 82/103 floors at the slash, and the .0 has to enter before the division. Failure three is the funnel drift — calling the 14 held bookings 'refunded' or the 30 in-flight 'flown'. The census must keep every booking in exactly one conditional bucket and all of them in the denominator; the four branches reconciling to 103 by construction IS the definition.",
      tag: "aggregation",
    },
    {
      id: "vueling-t4",
      q: "shipped_at is NULL on 21 bookings. What does that NULL mean on an airline db, and how should queries treat it?",
      a: "On this mapping the NULL is a business state: the departure stamp hasn't been applied — 14 bookings held-not-ticketed in the booking window and 7 refunded, 21 total. Treating it as dirty data is the cardinal error: filling it with a fabricated date invents departures that never happened, and excluding those rows from a load read shrinks the denominator from 103 to 82 and prints a flattering load factor. The honest tools are state-based: COUNT(shipped_at) rides the NULL-blindness for the departed numerator, shipped_at IS NULL splits the not-departed arm into held versus refunded by joining on status, and julianday lead-time math over unstamped rows NULLs them — which is correct, because a booking that hasn't departed has no lead time to average. NULL here is the ticketing queue talking; the queries should read it, not repair it.",
      tag: "nulls",
    },
    {
      id: "vueling-t5",
      q: "The partner bench keeps only partners listing three-plus families. Where does that condition belong, and why does mixing up WHERE and HAVING matter here?",
      a: "The listing floor is a property of the group, so it lives in HAVING: HAVING COUNT(DISTINCT p.id) >= 3 — evaluated after the fold, when breadth exists. WHERE filters rows before the fold: market slices, date windows, 'lines priced below the 55 mark'. The pipeline order is FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY, and the two are not interchangeable — WHERE COUNT(DISTINCT p.id) fails because the fold doesn't exist yet, and pushing the floor into a WHERE-shaped subquery fold silently re-folds. On the bench the difference is visible: the gate must see every partner's full fold before it judges breadth, otherwise you're ranking catalogs you already truncated. On this db the 3-family floor keeps four of six partners and drops the two-listing catalogs — including the highest-rated one — which is exactly the trade-off the review debates, and it only exists if the gate sits in HAVING.",
      tag: "pipeline",
    },
    {
      id: "vueling-t6",
      q: "Ancillary strategy wants families whose attach breadth beats the network's average family. Subquery, window, or CTE?",
      a: "All three are honest; the definition's weight picks one. A scalar subquery — HAVING COUNT(DISTINCT order_id) > (SELECT fold-of-mean FROM the same staged fold) — is the compact benchmark read, but the benchmark and the families must fold on the same grain or the comparison counts bookings against units. A windowed fold — AVG over the family fold with OVER () — keeps every family in the result with its gap versus the network visible, which is what the attach deck actually wants. A CTE earns its place when 'attach breadth' needs a definition — fare lines excluded, refunds netted, units versus bookings declared — because a named two-stage fold survives review and a nested one-liner doesn't. What's not negotiable: state which of the four counts (lines, units, bookings, passengers) the average averages. On a 251-line db the wrong-grain version runs in milliseconds and reads convincingly; that's what makes it dangerous.",
      tag: "subqueries",
    },
    {
      id: "vueling-t7",
      q: "Two date reads every week: booking pace by month and booking-to-departure lead by market. What machinery does each need?",
      a: "Pace is bucketing: SUBSTR(created_at, 1, 7) makes a '2024-01' month key that GROUP BY folds and sorts correctly — the 14-bucket spine from 2024-01 (8 bookings, 3731.97) through 2025-02 (7, 2390.53); strftime('%Y-%m', created_at) is the same key with more date math available. Lead time is instant math: julianday(shipped_at) - julianday(created_at) on the 82 stamped bookings, averaged to 2.98 days with the 2-to-4 range quoted, because the seat-upsell window is sized in days. The traps I name out loud: bucketing the raw timestamp gives one row per booking; julianday over unstamped rows NULLs them, which is the definition and not a bug; and half-open intervals — departure >= day AND < day+1 — never BETWEEN, which drops the last night. Round once at the edge so the deck, the query and the audit all print 2.98.",
      tag: "dates",
    },
    {
      id: "vueling-t8",
      q: "One OTA feed double-logs ancillary lines, and finance just found a void ticketing statement that moved money anyway. How do you keep both from poisoning the attach reads?",
      a: "Dedupe on a natural key, reconcile states against evidence. For the feed: ROW_NUMBER() OVER (PARTITION BY booking, sku, event_time ORDER BY ingested_at DESC, id DESC) and keep rn = 1 — with the tiebreak stated, because 'latest' needs a deterministic definition when timestamps tie. For statements: conditional folds that cross-examine status against payment rows surface the void-but-moved leg (925.00 on this db) and the paid-status statement with zero rows (1756.00) before the tie-out — the two error modes are mirrors, and neither shows up in the naive anti-join. The money rule underneath: statements and rails carry INTEGER euro-cents, so the dollar read is amount_cents / 100.0, once, at the edge — 15217 never 1521700. The habit being graded: row counts are claims, keys and evidence are truth, and an attach number shipped from a deduped, reconciled base is the only one worth defending in the commercial review.",
      tag: "quality",
    },
    {
      id: "vueling-t9",
      q: "Walk me through building the month-over-month booking pace walk with the delta column. What does LAG give you and where does it break?",
      a: "Stage the month fold in a CTE — STRFTIME('%Y-%m', created_at) as the key, COUNT(*) and SUM(total) per bucket — then LAG(bookings) OVER (ORDER BY month_key) carries the prior month onto each row, and the delta is current minus prior. On the 14-bucket spine that reads 8 → 9 → 8 … with 2024-01's prior reading NULL, and that NULL is the baseline, not a bug: the first month has no prior to lag. The breaks I name: ordering by a raw timestamp instead of the bucket key walks booking-by-booking, not month-by-month; and computing the delta as a ratio needs the NULL guard stated — a fabricated 0 prior invents a -100 percent print the deck can't defend. The interviewer wants the two-stage shape named: fold first, then window over the fold.",
      tag: "windows",
    },
    {
      id: "vueling-t10",
      q: "Every passenger and every SKU on this db has at least one booking. You're asked which passengers never booked. How do you write it and how do you defend the zero?",
      a: "The shape is the LEFT JOIN anti-join: passengers LEFT JOIN orders, keep rows WHERE o.id IS NULL — or NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = p.id), which is the spelling I ship because it can't fan out. On this db the honest answer is zero rows, and proving the zero is part of the deliverable: run the two counts separately — 16 passengers, and COUNT(DISTINCT customer_id) over orders = 16 — show every passenger id appears in the orders set, and state that the anti-join returning empty is the evidence, not a broken query. The failure mode I flag is the inner-join reflex: joining first, seeing 103 rows, and declaring coverage without ever testing the NULL arm. A zero that's proven survives review; a zero that's assumed doesn't.",
      tag: "joins",
    },
    {
      id: "vueling-t11",
      q: "The seat-upsell window is sized in days between booking and departure. What date machinery do you reach for, and what are the traps?",
      a: "julianday(shipped_at) - julianday(created_at) over the stamped bookings — it returns fractional days, so AVG prints 2.98 with the 2-to-4 spread quoted beside it. Trap one: the population must be stated — the 21 unstamped bookings have no lead, and julianday(NULL) NULLs them, which is the definition, not data loss; filtering them out first changes nothing, but averaging with a COALESCE'd fake date corrupts everything. Trap two: half-open intervals for any day-bucketing — departure >= day AND < day+1, never BETWEEN, which double-counts midnight. Trap three: rounding once at the presentation edge so the query, the deck and the audit all print 2.98. The same machinery sizes duration-billed ancillaries — bag storage, lounge — which is why this drill shows up in every loop here.",
      tag: "dates",
    },
    {
      id: "vueling-t12",
      q: "Write the fare-ladder banding: Basic below 55, Optima 55-plus, Excellence 150-plus. What makes a CASE ladder production-grade?",
      a: "Top-down ordered WHENs with a final ELSE: WHEN unit_price >= 150 THEN 'Excellence' WHEN unit_price >= 55 THEN 'Optima' ELSE 'Basic' END. Each arm is a floor, not a range, so no line can fall through two arms or between them. Production-grade means: exhaustive (the ELSE guarantees every one of the 251 lines lands somewhere — a NULL ELSE silently bands nothing and the mix doesn't foot to 251), evaluated in order (Optima-first swallows Excellence and the premium arm reads zero forever), and consistent typing (band labels quoted text, so GROUP BY folds 'Optima' and Optima into one bucket — unquoted arms create two groups wearing one name). The test I run: fold the banded output and reconcile the arm counts to the total — 133 + 118 on this db — before the deck ships.",
      tag: "case",
    },
    {
      id: "vueling-t13",
      q: "You fold the attach census and get 121, 54 and 3294.29 for one family. What are those three numbers, and which folds produced them?",
      a: "Units, bookings and value — three different folds over the same joined lines. 121 is SUM(quantity): seat-and-bag units, quantity summed. 54 is COUNT(DISTINCT order_id): the join fans 103 bookings into 251 lines, so only the DISTINCT count folds back to booking grain — plain COUNT(*) or COUNT(order_id) reads 121 there too, seat legs wearing a bookings header. 3294.29 is SUM(quantity * unit_price), the value fold. The discipline I state out loud: name the grain of every column when I write it — units, bookings, euros — and reconcile at the end: family units sum to 498, bookings sum to at most 103 (families overlap), value sums to 34833.28. A census whose columns can't say which fold built them is the one that gets rebuilt in the review.",
      tag: "groupby",
    },
    {
      id: "vueling-t14",
      q: "The deck benchmarks each family's bookings against the network average family. Where does that comparison go wrong most often?",
      a: "Grain of the benchmark. The network average family is a fold of folds: per family, COUNT(DISTINCT order_id), then AVG of those family counts — a scalar staged in a subquery or CTE. The classic wrong version averages order_items rows per family — that's lines per family, 251/7 ≈ 35.9 — and compares bookings against it, so nothing sensible ever passes or fails. The second failure is the window spelling: AVG(bookings) OVER () computed over the pre-fold rows averages bookings-per-line-row, not per family. I stage it: CTE family_fold with the DISTINCT booking count per family, then compare each row to the AVG over that CTE — with every family kept in the output and its gap visible, because the deck wants the spread, not just the pass/fail bit.",
      tag: "subqueries",
    },
    {
      id: "vueling-t15",
      q: "Each market's commercial review wants its own top ancillary family, all markets in one result. How do you build it?",
      a: "Window over the fold: group by market and family, fold SUM(quantity * unit_price) and COUNT(DISTINCT order_id), then RANK() OVER (PARTITION BY market ORDER BY SUM(quantity * unit_price) DESC) — rank 1 inside each partition is that market's anchor family, and the whole board is one result set: APAC's, EU's, US's side by side. The two things I get graded on: PARTITION BY is what restarts the ranking per market — without it the rank is network-wide and three of four markets get no rank 1; and ties need a stated tiebreak (family name) or two markets' boards flip between runs. For top-N per market the same shape extends — rank <= 2 for the anchor plus the challenger — which is the shape the quarterly attach review actually asks for.",
      tag: "windows",
    },
    {
      id: "vueling-t16",
      q: "When do you stack market boards with UNION versus UNION ALL, and what's the review rule you apply before either?",
      a: "UNION ALL by default — stacking is appending, and the branches are different markets that can't legitimately dedupe. UNION applies an implicit DISTINCT across the whole stack, and the failure is silent: two branches folding to byte-identical rows — same bookings, same value, no market label — collapse to one, the board loses a market, and the totals still foot so nothing catches it. The review rule: if I ship UNION at all, the diff it removes must be provably impossible, written in a comment beside the operator; otherwise the market label column goes in and UNION ALL does the work. The same rule governs the statement pack — a paid census and an uncollected census can fold to the same figures, and only the literal state column keeps them separable in the stack.",
      tag: "sets",
    },
    {
      id: "vueling-t17",
      q: "The attach census must reconcile: booked, departed, held, refunded — but you also need per-market load. How does FILTER (WHERE …) keep the census one-pass?",
      a: "Conditional folds inside one SELECT: after joining orders to customers for region, COUNT(*) FILTER (WHERE shipped_at IS NOT NULL) as departed, COUNT(*) FILTER (WHERE status = 'pending') as held, COUNT(*) FILTER (WHERE status = 'cancelled') as refunded, grouped by region — one scan, every state a column, each market's branches reconciling to its own COUNT(*): APAC 37, EU 45, US 19, LATAM 2. The alternative — one query per state, stacked — is four scans and a reconciliation risk for free. The graders watch two things: the denominators stay whole (no WHERE dropping refunded before the fold — that shrinks the base and flatters load), and the branches partition the rows exactly — a booking is departed, held or refunded, never two, and the sum says so by construction.",
      tag: "aggregation",
    },
    {
      id: "vueling-t18",
      q: "HAVING versus WHERE — the partner bench question. How do you decide where a condition lives, and what does the pipeline order imply?",
      a: "Ask when the condition becomes computable. WHERE runs before GROUP BY — it sees rows: market slices, date windows, lines priced under 55. HAVING runs after the fold — it sees groups: COUNT(DISTINCT p.id) >= 3 is a property no row carries. The pipeline order FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY is the decision tree, and the failure modes are symmetrical: WHERE COUNT(DISTINCT p.id) errors because the fold doesn't exist yet, while a WHERE-shaped workaround (filtering lines first) silently re-folds — a 3-family catalog truncated to 2 families gets judged and dropped on evidence the gate never saw. I also state the HAVING-share idiom: benchmarks against folded quantities (refund share > 6.8) belong in HAVING with the benchmark staged outside, or the market benchmarks against itself and nothing fails.",
      tag: "pipeline",
    },
    {
      id: "vueling-t19",
      q: "The load report shows '—' for unstamped departures. How do you present NULLs without lying about them?",
      a: "COALESCE at the presentation edge only, and never to fabricate facts. A departure stamp that doesn't exist stays NULL through every fold — julianday lead-time math over the 21 unstamped rows NULLs them, which is correct because they have no lead. But the report layer can translate: COALESCE(lead_days_text, '—') so the reader sees an honest dash instead of an empty cell they'll read as zero. The line I don't cross: COALESCE-ing a NULL stamp to a default date, or a NULL prior-month pace to 0 — both manufacture data, and the load factor or growth print downstream becomes indefensible. The rule I state: NULLs survive computation untouched, get labeled only where a human reads them, and any COALESCE default that could be mistaken for a real value is a bug, not a style choice.",
      tag: "nulls",
    },
    {
      id: "vueling-t20",
      q: "Revenue management wants the booking pace on a complete month spine — including months with zero bookings. How do you build that?",
      a: "The fold alone can't do it: GROUP BY only prints buckets that have rows, so a zero month vanishes exactly when the story matters. The fix is a spine — a derived calendar of every month key in range (a recursive CTE of dates, or a small calendar table) — LEFT JOINed to the booking fold on the month key. Zero months come back as rows with NULL folds, which COALESCE maps to 0 at the edge: real zeros, honestly built, distinguishable from missing data because the spine row exists. I flag the two traps: the join key must be the same normalized bucket on both sides ('2024-07' on both, or the join silently produces its own anti-join), and the left side is the spine — joining bookings to calendar instead inverts it and the zero months drop out again. The same spine drives the seasonal YoY walk, so it's built once and reused.",
      tag: "dates",
    },
    {
      id: "vueling-t21",
      q: "Which bookings bought two ancillaries within the same hour? Walk me through the self-join.",
      a: "Orders self-joined on the co-attach condition: FROM orders o1 JOIN orders o2 ON o1.id < o2.id AND o1.created_at = o2.created_at — or the hour-bucketed variant joining SUBSTR(o1.created_at,1,13) = SUBSTR(o2.created_at,1,13) for same-hour pairs. The strict inequality is the whole trick: = pairs every booking with itself, <> keeps both orderings so pair counts double, and < keeps exactly one of (A,B) and (B,A), which is what makes COUNT(*) a pair count you can defend. I add the dedupe caveat: if the feed double-logs lines, dedupe before the self-join or the pairs double too — ROW_NUMBER over the natural key, keep rn = 1. And I state the business read: same-instant multi-attach is the family-bundle signal the upsell engine hunts; scattered-in-time attach is a different campaign entirely.",
      tag: "joins",
    },
    {
      id: "vueling-t22",
      q: "An OTA market feed hands you regions in three casings and a stray trailing space. What's your pre-fold hygiene?",
      a: "Normalize before the fold, because GROUP BY folds on exact text: 'EU', 'eu' and 'EU ' are three keys and the two-grain census prints three EU rows. The repair is TRIM(UPPER(region)) — casing and padding are two defects, and fixing one leaves the other: LOWER alone keeps the padded rows, NOCASE equalizes case but still folds 'EU ' apart. I do it once, in the staging CTE, not sprinkled through every query — the normalized key is the join key everywhere downstream. Then I verify: COUNT(DISTINCT normalized) should be 4 markets, not 6, and I print the before/after distinct counts in the PR note. The habit being graded is that string hygiene is a grain problem — messy keys are duplicate groups wearing disguises, and the fold can't tell the difference.",
      tag: "strings",
    },
    {
      id: "vueling-t23",
      q: "The deck shows a 7-day rolling booking pace beside the monthly curve. How does the rolling frame differ from the running total?",
      a: "The frame definition is the difference. Running total: SUM(bookings) OVER (ORDER BY day) with the default RANGE frame — cumulative since the start. Rolling 7-day: SUM(bookings) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) — six rows back plus current, strictly row-counted, so the window is always exactly 7 rows wide and slides day by day. I say ROWS out loud because RANGE is the default and it includes peers — two bookings sharing a timestamp enter the window together and the 7-day read silently widens; and on a date spine a RANGE offset compares values, which is not the row math the deck means. The other trap: gaps — a day with zero bookings must still be a spine row, or ROWS pulls in the 8th prior day and the '7-day' window quietly stretches. Built right, it reconciles: the first six rows are partial windows and I label them as such.",
      tag: "windows",
    },
    {
      id: "vueling-t24",
      q: "Finance found a void statement that moved 925 anyway, and a paid statement with zero payment rows. How do you systematically cross-examine states against evidence?",
      a: "Conditional folds that compare the state column against the evidence table, both directions. Statements LEFT JOIN payments on the statement id, folded one pass: COUNT(*) FILTER (WHERE status = 'void' AND p.id IS NOT NULL) — void-but-moved, the 925.00 leg; COUNT(*) FILTER (WHERE status = 'paid' AND p.id IS NULL) — paid-status with no payment rows, the 1756.00 mirror. The two error modes are opposites, which is why the naive checks miss them: an anti-join on void catches one and not the other. Underneath sits the cents discipline — statements and rails are INTEGER euro-cents, so every money read is amount_cents / 100.0 exactly once at the edge, or the tie-out breaks by a hundredfold. The deliverable is the exception list with definitions attached: which state, which evidence, which figure — so the close either fixes the row or books the exception, and tomorrow's census starts clean.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "vueling-mcq-1",
      prompt: "One-pass load census. Which fragment counts bookings that actually departed — 82 of 103?",
      choices: [
        "COUNT(*) FILTER (WHERE status = 'delivered')",
        "COUNT(o.shipped_at)",
        "COUNT(*) FILTER (WHERE o.shipped_at IS NOT NULL)",
        "SUM(shipped_at)",
      ],
      answer: 2,
      why: "shipped_at is the departure stamp — NULL until the booking departs. The FILTER keeps the conditional census in one pass: 82 departed while COUNT(*) stays 103 in the same SELECT, so the branches reconcile to the book by construction.",
      notes: [
        { choice: 0, why: "'Delivered' counts one raw state (52 flown-and-kept) — but departed is delivered PLUS the ticketed-in-flight-future bucket, 82. Pick the state-free definition: shipped_at IS NOT NULL." },
        { choice: 1, why: "COUNT(o.shipped_at) happens to give 82 because it skips NULLs — but it reads as an accident to the reviewer. The FILTER form states the predicate, which is what the census is audited against." },
        { choice: 3, why: "SUM over a timestamp column adds date numbers — a meaningless figure. Conditional counting needs a boolean predicate inside FILTER or CASE, not arithmetic on dates." },
      ],
      difficulty: "easy",
    },
    {
      id: "vueling-mcq-2",
      prompt: "Refund share by market: 7 of 103 bookings refunded (APAC 3, EU 3, US 1). Which fold prints APAC's 8.1 honestly?",
      choices: [
        "100.0 * SUM(status = 'cancelled') / COUNT(*) grouped by market",
        "100.0 * SUM(status = 'cancelled') / SUM(status <> 'cancelled')",
        "COUNT(*) FILTER (WHERE status = 'cancelled' AND shipped_at IS NULL) / 103",
        "100.0 * COUNT(status) / COUNT(DISTINCT customer_id)",
      ],
      answer: 0,
      why: "Refund share is refunded bookings over ALL bookings in the market — placed, held, departed, refunded. SUM(status = 'cancelled') is the conditional count; COUNT(*) after the GROUP BY is the honest market denominator. APAC: 3 of 37 = 8.1.",
      notes: [
        { choice: 1, why: "Dividing cancelled by non-cancelled re-bases the denominator to 34 and prints 8.8 for APAC — a different metric (refund-to-kept ratio) wearing the refund-share name." },
        { choice: 3, why: "COUNT(status) counts bookings, but COUNT(DISTINCT customer_id) counts passengers — 19 US bookings from 2 passengers would print a nonsense share. Bookings over bookings, always." },
      ],
      difficulty: "easy",
    },
    {
      id: "vueling-mcq-3",
      prompt: "The attach proxy at network grain — 'ancillary lines per booking' — is computed as:",
      choices: [
        "SUM(quantity) over order_items / COUNT(*) over orders = 498/103 = 4.83",
        "COUNT(*) over order_items / COUNT(*) over orders = 251/103 = 2.44",
        "COUNT(DISTINCT product_id) / COUNT(DISTINCT order_id)",
        "AVG(order_items per order) computed on the customers join",
      ],
      answer: 1,
      why: "Lines per booking counts line records over bookings — 251/103 = 2.44 on this db. SUM(quantity) counts UNITS (498), which is a different attach proxy (units per booking), not lines.",
      notes: [
        { choice: 0, why: "That's the units-per-booking fold, not lines-per-booking — 4.83 double-counts every quantity-2 bag line. Both numbers are real; they answer different questions and the slide must say which." },
        { choice: 2, why: "Distinct SKUs over distinct bookings measures catalog breadth per booking — the fare-family menu, not the attach proxy the commercial deck quotes." },
      ],
      difficulty: "easy",
    },
    {
      id: "vueling-mcq-4",
      prompt: "The widest family logs 121 units. Which expression also reports '54 bookings touched' in the same row?",
      choices: [
        "COUNT(*) over the joined lines",
        "COUNT(oi.order_id) over the joined lines",
        "COUNT(DISTINCT oi.order_id) over the joined lines",
        "SUM(oi.order_id) over the joined lines",
      ],
      answer: 2,
      why: "The join fans 54 bookings out into 121 lines, so COUNT(*) and COUNT(oi.order_id) both read 121 — line grain. COUNT(DISTINCT oi.order_id) folds back to booking grain: 54 of the 103 bookings attach this family.",
      notes: [
        { choice: 0, why: "COUNT(*) after the join counts lines — 121 wearing the 'bookings' header. The classic fan-out bug the attach census exists to catch." },
        { choice: 3, why: "SUM(order_id) adds id codes together — a meaningless integer that grows with every line. Distinct-count is the fold; sums of keys are never counts." },
      ],
      difficulty: "medium",
    },
    {
      id: "vueling-mcq-5",
      prompt: "The fare ladder CASE bands every line: Basic below 55, Optima at 55-plus, Excellence at 150-plus. Which WHEN ordering is correct?",
      choices: [
        "Excellence first (>= 150), then Optima (>= 55), else Basic — top-down",
        "Basic first (< 55), then Optima (< 150), else Excellence — bottom-up",
        "Optima first (>= 55), then Excellence (>= 150), else Basic",
        "Any order — CASE arms are independent",
      ],
      answer: 0,
      why: "CASE evaluates WHENs in order and stops at the first hit, so range arms must run top-down: >= 150 catches Excellence, >= 55 catches Optima, else Basic. Top-down ordering makes each arm's condition a floor instead of a range you can get wrong.",
      notes: [
        { choice: 2, why: "Optima-first swallows every Excellence line: 160 hits >= 55 and stops, so the premium arm reads 0 and the ladder under-reports the top family forever." },
        { choice: 3, why: "Arms are ordered, not independent — a reordered WHEN silently re-bands the base, and the mix deck prints a ladder that matches nothing the pricing page publishes." },
      ],
      difficulty: "medium",
    },
    {
      id: "vueling-mcq-6",
      prompt: "Six ticketing statements have no payment rows, worth 15,217 in the money read. The column stores INTEGER euro-cents. Which read is right?",
      choices: [
        "SUM(i.amount_cents) AS unpaid — 15217 cents is the answer",
        "SUM(i.amount_cents) / 100 AS unpaid — integer division is fine at this scale",
        "SUM(i.amount_cents) / 100.0 AS unpaid — 15217.00, divided once at the edge",
        "ROUND(SUM(i.amount_cents), 2) AS unpaid — rounding fixes the unit",
      ],
      answer: 2,
      why: "The stored figure is 1,521,700 cents. amount_cents / 100.0 promotes to real arithmetic before the division and prints 15217.00 — the /100.0 happens exactly once, at the presentation edge.",
      notes: [
        { choice: 0, why: "That ships cents as euros — a hundredfold error that survives every cross-check that shares the mistake. The 15,217 the memo quotes is the /100.0 read." },
        { choice: 1, why: "Integer division drops the cents remainder on every odd-cent statement — small per row, systematic across the book. The .0 is not decoration; it's the promotion." },
        { choice: 3, why: "ROUND changes precision, never units — 1521700.00 cents is still a hundred times too big. The unit fix is the division, not the rounding." },
      ],
      difficulty: "medium",
    },
    {
      id: "vueling-mcq-7",
      prompt: "Base ops wants partners listing at least 3 fare families. The gate 'COUNT(DISTINCT p.id) >= 3' belongs in:",
      choices: [
        "WHERE — it filters which partner rows participate",
        "HAVING — it filters groups after the fold",
        "ON — it belongs in the join condition",
        "ORDER BY — as a sort key before LIMIT",
      ],
      answer: 1,
      why: "Listing depth is a property of the folded group, not of any row — it only exists after GROUP BY, so the gate is HAVING. On this db it keeps the four 3-family catalogs and drops the two two-listing ones, including the highest-rated partner.",
      notes: [
        { choice: 0, why: "WHERE can't see COUNT(DISTINCT p.id) — the fold hasn't run. A row-filter workaround (filtering lines first) silently re-folds and can turn a 3-family catalog into a 2-family one before judging it." },
        { choice: 2, why: "Putting the gate in ON corrupts the join itself — every line fails the condition and the bench reads zero partners, which ops will read as a supply crisis, not a query bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "vueling-mcq-8",
      prompt: "A partner board runs a 3-family HAVING gate, then RANK() OVER (ORDER BY route_value DESC). The two dropped partners sat at value ranks 3 and 4 of six. What ranks print after the gate?",
      choices: [
        "1, 2, 3, 4 — ranks are computed over the survivors",
        "1, 2, 5, 6 — ranks preserve the pre-gate ladder",
        "1, 2, 3, 3 — the dropped ranks leave gaps that collapse",
        "NULL for all four — ranks can't cross a HAVING boundary",
      ],
      answer: 0,
      why: "The window is evaluated after GROUP BY/HAVING, so RANK numbers the surviving rows 1 through 4: Nordic 11130.25, Midwest 9294.93, Shenzhen 3049.07, Pacific 2980.15. The pre-gate ranks are gone — the board shows the bench that exists.",
      notes: [
        { choice: 1, why: "That's how a join-back to a pre-gate ladder would look — implying two partners are 'above' survivors that outrank them. If ops wants pre-gate context, compute it as an explicit second column, not a phantom." },
        { choice: 2, why: "RANK leaves gaps after ties (2, 2, 4), not after dropped rows. Dropped rows never consumed a rank, so there is nothing to collapse — 1, 2, 3, 3 would require a tie the data doesn't have." },
      ],
      difficulty: "hard",
    },
    {
      id: "vueling-mcq-9",
      prompt: "A board stacks the EU market census and the APAC census with UNION. A reviewer says one row vanished. Diagnosis?",
      choices: [
        "UNION ALL is only a performance choice — results are identical",
        "The branches forgot the distinguishing market column, so two byte-identical rows collapsed — UNION dedups whole rows silently",
        "UNION truncates the stack to the first branch's row count",
        "UNION cannot stack two SELECTs over the same table",
      ],
      answer: 1,
      why: "UNION applies an implicit DISTINCT across the whole stack. Two branches emitting identical rows — same bookings count, same value, no market label — collapse to one, and the board loses a market with no error anywhere. The discipline: UNION ALL plus a comment stating why duplicates are impossible.",
      notes: [
        { choice: 0, why: "The dedup deletes rows — on stacks where two markets can fold to the same figures, UNION is the bug, not an optimization." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss and the totals still foot." },
      ],
      difficulty: "hard",
    },
    {
      id: "vueling-mcq-10",
      prompt: "A booking-value walk uses SUM(total) OVER (ORDER BY created_at). Two bookings share the same created_at second and the cumulative 'jumps two bookings at once'. What is happening?",
      choices: [
        "The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk",
        "Rounding accumulated on the tied rows and doubled the step",
        "LAG should be used instead of SUM for running totals",
        "The frame must extend to UNBOUNDED FOLLOWING to absorb ties",
      ],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. Say the frame out loud: ROWS walks strictly row by row.",
      notes: [
        { choice: 2, why: "LAG fetches the previous row's value — swapping it in changes the metric from a running sum to a step delta. Frame semantics, not function choice, caused the jump." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total 34833.28, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "vueling-mcq-11",
      prompt: "The booking-to-departure lead averages 2.98 days. Which expression computes it per stamped booking?",
      choices: [
        "shipped_at - created_at",
        "julianday(shipped_at) - julianday(created_at)",
        "julianday(created_at) - julianday(shipped_at)",
        "DATE(shipped_at, '-' || created_at)",
      ],
      answer: 1,
      why: "julianday converts both stamps to real day numbers, so the difference is a fractional-day lead — 2.98 across the 82 stamped bookings. The unstamped 21 NULL out, which is correct: no departure, no lead.",
      notes: [
        { choice: 0, why: "TEXT minus TEXT makes SQLite cast both sides to numbers — '2024-01-05' casts to 2024, so the answer is 0 for every row and 2.98 becomes 0.0. Date math needs julianday, not subtraction luck." },
        { choice: 2, why: "That's the negative of the lead — booking minus departure. AVG prints -2.98 and the upsell window the ladder team sizes from it flips sign wholesale." },
      ],
      difficulty: "easy",
    },
    {
      id: "vueling-mcq-12",
      prompt: "The pace deck buckets bookings by month on the 2024-01 to 2025-02 spine. Which STRFTIME format string is the month key?",
      choices: [
        "\"%Y-%m\"",
        "\"%Y-%M\"",
        "\"%m\"",
        "\"%D\"",
      ],
      answer: 0,
      why: "%Y-%m renders '2024-01' — a 14-distinct-key text bucket that GROUP BY folds and sorts chronologically. %M is minutes; %m is bare month, which collides 2024-01 with 2025-01.",
      notes: [
        { choice: 1, why: "%M is minutes (always '00' here) — every booking lands in one bucket and the pace curve flattens to a single bar." },
        { choice: 2, why: "%m gives '01', '02' … '12' — two Januaries from 2024 and 2025 fold together and the spine loses its year. Bucket keys must carry the year on a 14-month window." },
      ],
      difficulty: "easy",
    },
    {
      id: "vueling-mcq-13",
      prompt: "The census says 103 booked, but a teammate's COUNT(shipped_at) prints 82. What is the reconciliation?",
      choices: [
        "17 bookings were deleted overnight",
        "COUNT(column) skips NULLs — the 21 unstamped bookings (14 held, 7 refunded) don't count",
        "COUNT is an alias for DISTINCT here",
        "shipped_at is NULL on exactly 82 rows",
      ],
      answer: 1,
      why: "COUNT(*) counts rows; COUNT(column) counts non-NULL values. 103 rows minus 21 NULL stamps = 82 — which happens to equal the departed count, but it counts them by accident of the NULL, not by the departed definition.",
      notes: [
        { choice: 3, why: "Backwards: shipped_at is NULL on 21 rows and stamped on 82. Swapping the two is how a 'departed' column quietly starts measuring 'not departed'." },
        { choice: 2, why: "COUNT never dedupes — that's COUNT(DISTINCT …). The 82 comes from NULL-blindness, and the fix is knowing which definition you actually want: rows (103) or stamps (82)." },
      ],
      difficulty: "easy",
    },
    {
      id: "vueling-mcq-14",
      prompt: "Average booking value on the book of 103: which fold prints 338.19?",
      choices: [
        "ROUND(SUM(quantity * unit_price) / COUNT(*), 2) over the joined lines",
        "ROUND(AVG(total), 2) over orders",
        "ROUND(SUM(total) / COUNT(order_items.id), 2) over the join",
        "ROUND(AVG(unit_price), 2) over order_items",
      ],
      answer: 1,
      why: "Booking value lives at booking grain: AVG(total) over 103 orders = 34833.28/103 = 338.19. Any fold that joins lines first changes the denominator — 251 lines or 498 units — and prints a per-line or per-unit average wearing the booking label.",
      notes: [
        { choice: 0, why: "SUM over lines is still 34833.28, but COUNT(*) after the join is 251 — that's the per-line value 138.78, a real metric answering a different question." },
        { choice: 2, why: "Dividing the book by line count is line grain again — 138.78. The deck's 'average booking' must reconcile to the 103-PNR denominator or the yield column lies." },
      ],
      difficulty: "easy",
    },
    {
      id: "vueling-mcq-15",
      prompt: "A teammate writes 100 * 82 / 103 for the departed share and ships 79. The stored columns are INTEGER. What happened?",
      choices: [
        "SQLite overflowed past 79.6",
        "Integer division floors at the slash — 8200/103 = 79; write 100.0 * 82 / 103 and the .0 promotes every later step to real arithmetic",
        "100 * 82 must be parenthesized",
        "The share needs ROUND, not a float",
      ],
      answer: 1,
      why: "INTEGER / INTEGER is integer division in SQLite: 8200/103 floors to 79 before anyone rounds. 100.0 makes the first operand REAL, so the chain prints 79.6 — the .0 has to enter before the division, not after.",
      notes: [
        { choice: 3, why: "ROUND(79, 1) is still 79.0 — rounding can't recover the digits integer division already dropped. The fix is promotion at the slash." },
        { choice: 2, why: "Parentheses don't change the types — (100*82)/103 floors the same way. This is a type bug, not an order-of-operations bug." },
      ],
      difficulty: "easy",
    },
    {
      id: "vueling-mcq-16",
      prompt: "The pace deck wants the top-3 booking months, but 2024-02 and 2024-09 tie at 9 bookings and a third month must not be silently dropped. Which read is right?",
      choices: [
        "ORDER BY COUNT(*) DESC LIMIT 3",
        "RANK() OVER (ORDER BY COUNT(*) DESC) in a CTE, then WHERE rank <= 3 — ties share a rung and both 9-booking months board",
        "GROUP BY month, then LIMIT 3 in a subquery",
        "MAX(COUNT(*)) over the month fold",
      ],
      answer: 1,
      why: "LIMIT cuts arbitrarily inside a tie — one of the two 9-booking months vanishes with no error. RANK gives both the same rung (1, 1) and the windowed read keeps every month that earns rank ≤ 3, which is the definition the deck states.",
      notes: [
        { choice: 0, why: "LIMIT 3 keeps exactly three rows — with a tie at 9, which two of the three tie-winners survive depends on scan order. The deck would change between runs of the same query." },
        { choice: 3, why: "MAX folds to one scalar — the top count, 9 — and loses every month. Ranking needs a window function, not a bigger aggregate." },
      ],
      difficulty: "easy",
    },
    {
      id: "vueling-mcq-17",
      prompt: "The two-grain read wants each market's biggest fare family by attached value. Which window keeps all markets in one result?",
      choices: [
        "GROUP BY region, category then LIMIT 1",
        "RANK() OVER (PARTITION BY region ORDER BY SUM(value) DESC) over the folded rows, then rank = 1",
        "MAX(value) GROUP BY region",
        "ORDER BY region, value DESC, then read the first row per region client-side",
      ],
      answer: 1,
      why: "PARTITION BY region restarts the rank inside each market, so every market's own top family surfaces with rank 1 — APAC's Audio at 11744.01-adjacent value, EU's, US's — all in one result set. That's the per-group-argmax shape.",
      notes: [
        { choice: 0, why: "LIMIT 1 after a two-column GROUP BY returns one row total — the whole network's top family — not one per market. LIMIT doesn't restart per group; PARTITION BY does." },
        { choice: 2, why: "MAX prints the top value per market but not WHICH family earned it — the deck needs the name beside the number. Argmax needs the rank-and-pick shape." },
      ],
      difficulty: "medium",
    },
    {
      id: "vueling-mcq-18",
      prompt: "An OTA feed double-logs booking lines. Which fragment keeps one row per (booking, SKU, event) reliably?",
      choices: [
        "SELECT DISTINCT order_id, product_id",
        "ROW_NUMBER() OVER (PARTITION BY order_id, product_id, event_time ORDER BY ingested_at DESC, id DESC) = 1",
        "GROUP BY order_id HAVING COUNT(*) = 1",
        "WHERE ingested_at = MAX(ingested_at)",
      ],
      answer: 1,
      why: "ROW_NUMBER with a stated tiebreak keeps exactly one deterministic row per natural key — the latest ingestion, id as the final word when timestamps tie. The dedupe rule is reviewable; SELECT DISTINCT on ids alone would collapse genuinely different events.",
      notes: [
        { choice: 0, why: "DISTINCT collapses duplicate id-pairs but also merges legitimate repeat events — two seat lines for the same SKU on one booking at different times are not duplicates." },
        { choice: 2, why: "HAVING COUNT(*) = 1 throws away every key that HAS duplicates instead of keeping one copy — the feed's real rows vanish with the noise." },
      ],
      difficulty: "medium",
    },
    {
      id: "vueling-mcq-19",
      prompt: "Attach ops wants bookings that carry at least one bag line. Which shape is the semi-join?",
      choices: [
        "orders LEFT JOIN order_items WHERE product_id IS NULL",
        "WHERE order_id IN (SELECT order_id FROM order_items WHERE category = 'bag')",
        "INNER JOIN then COUNT(*) > 1",
        "CROSS JOIN orders to order_items",
      ],
      answer: 1,
      why: "IN (SELECT …) is the semi-join: each booking is tested once against the set of bag-line bookings, and no line fan-out can double-count the booking. The LEFT JOIN … IS NULL shape is the opposite beast — the anti-join — and answers 'never attached'.",
      notes: [
        { choice: 0, why: "That keeps bookings with NO matching line — the anti-join. Flip the question and the audience gets the wrong cohort: never-attached instead of attached." },
        { choice: 2, why: "After the join, COUNT(*) counts lines, not bookings — a booking with three bag lines triples in the intermediate set. EXISTS/IN tests membership; counting tests volume." },
      ],
      difficulty: "medium",
    },
    {
      id: "vueling-mcq-20",
      prompt: "The overnight-departure report filters bookings departing on 2024-07-15. Which predicate is the honest half-open window?",
      choices: [
        "shipped_at BETWEEN '2024-07-15' AND '2024-07-16'",
        "shipped_at >= '2024-07-15' AND shipped_at < '2024-07-16'",
        "DATE(shipped_at) = '2024-07-15' only for TEXT stamps",
        "shipped_at LIKE '2024-07-15%'",
      ],
      answer: 1,
      why: "Half-open [start, next-start) captures every timestamp on the day — 00:00 through 23:59:59.999 — with no boundary call. BETWEEN includes the next day's midnight instant, and LIKE/DATE tricks give up index use on a stamped column.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive both ends — a 2024-07-16 00:00:00 departure sneaks into the 15th's report. Half-open intervals are the fix the team standardizes on." },
        { choice: 3, why: "LIKE on an unindexed expression scans and silently depends on the stamp format never changing. Range predicates on the real column keep the plan honest." },
      ],
      difficulty: "medium",
    },
    {
      id: "vueling-mcq-21",
      prompt: "The partner review wants each handling partner's family menu as one cell — 'Audio, Wearables'. Which fold prints that?",
      choices: [
        "GROUP_CONCAT(DISTINCT category) over the joined catalog",
        "CONCAT(category) GROUP BY supplier",
        "SUM(category) GROUP BY supplier",
        "GROUP_CONCAT(category) ORDER BY category",
      ],
      answer: 0,
      why: "GROUP_CONCAT folds the group's values into one comma cell, and DISTINCT keeps a partner listing three families three times from printing 'Audio, Audio, Audio'. The cell is the catalog in reviewable text form.",
      notes: [
        { choice: 1, why: "CONCAT is a scalar string function with no group semantics — without GROUP_CONCAT the fold never happens and the query errors or prints one row per line." },
        { choice: 3, why: "GROUP_CONCAT has no built-in ORDER BY inside the aggregate — duplicates ride along and the cell is unordered. DISTINCT (and a subquery sort) is how the menu stays clean." },
      ],
      difficulty: "medium",
    },
    {
      id: "vueling-mcq-22",
      prompt: "Two analysts count seat lines separately from bag lines in one pass. Analyst A writes SUM(CASE WHEN … THEN quantity END); Analyst B writes SUM(quantity) FILTER (WHERE …). The results:",
      choices: [
        "differ — FILTER is syntax sugar for a different fold",
        "match — FILTER (WHERE …) and SUM(CASE WHEN … THEN x END) compute the same conditional aggregate",
        "differ — CASE drops rows, FILTER keeps them",
        "match only if the table is indexed",
      ],
      answer: 1,
      why: "Both fold quantity only where the predicate holds and return NULL-elsewhere semantics — FILTER is the standard spelling of the CASE-in-SUM idiom. The census uses either; what matters is that every branch rides the same row set.",
      notes: [
        { choice: 2, why: "Neither construct drops rows — both leave non-matching rows out of ONE aggregate while the query's WHERE still sees everything. Confusing row filters with conditional folds is the bug this kit hunts." },
        { choice: 3, why: "Plan shape is irrelevant — the two spellings are semantically identical on any table. Indexes change speed, never fold definitions." },
      ],
      difficulty: "medium",
    },
    {
      id: "vueling-mcq-23",
      prompt: "The pace curve wants a 7-booking rolling window over the month spine, months ordered by key. Which frame walks strictly month by month?",
      choices: [
        "RANGE BETWEEN 6 PRECEDING AND CURRENT ROW",
        "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW",
        "ROWS BETWEEN 7 PRECEDING AND 1 FOLLOWING",
        "the default frame is already 7 rows",
      ],
      answer: 1,
      why: "ROWS counts physical rows: 6 preceding plus current = exactly 7 months in the window, the rolling total the deck quotes. RANGE with a numeric offset isn't even valid over text month keys — and the default frame is the whole partition.",
      notes: [
        { choice: 0, why: "RANGE offsets compare VALUES, and on a text key like '2024-01' the comparison is meaningless or an error. Rolling windows on a spine want ROWS." },
        { choice: 2, why: "That's 9 rows wide (7 before, current, 1 after) and it reaches into the future — a rolling window that knows next month's bookings is a forecast wearing a total's name." },
      ],
      difficulty: "hard",
    },
    {
      id: "vueling-mcq-24",
      prompt: "Co-attach: which bookings bought two ancillaries on the same created_at second? The self-join pairs each booking with itself once. Which guard kills the self-pair?",
      choices: [
        "WHERE o1.created_at = o2.created_at",
        "WHERE o1.id < o2.id AND o1.created_at = o2.created_at",
        "WHERE o1.id <> o2.id",
        "WHERE o1.id = o2.id AND o1.created_at = o2.created_at",
      ],
      answer: 1,
      why: "The equality alone matches every booking to itself plus its partner; <> keeps both (A,B) and (B,A). The strict < keeps exactly one ordering of each genuine pair — the anti-symmetric guard that makes pair counts reconcilable.",
      notes: [
        { choice: 2, why: "<> removes only the identical self-row — every pair still appears twice, doubled in both the count and the co-attach deck. One-sided inequality is the fix." },
        { choice: 3, why: "= self-matches every booking to itself — the join reports all 103 bookings as 'pairs' with themselves and the co-attach rate reads 100 percent." },
      ],
      difficulty: "hard",
    },
    {
      id: "vueling-mcq-25",
      prompt: "LAG(total) OVER (ORDER BY created_at) for the month-over-month pace walk prints NULL on the first row. The deck must:",
      choices: [
        "COALESCE it to 0 so the chart has no gaps",
        "report it as baseline — the first month has no prior month, and a fabricated 0 invents a -100 percent growth print",
        "drop the first row with WHERE prior IS NOT NULL",
        "use LEAD instead",
      ],
      answer: 1,
      why: "LAG's NULL on the first row IS the information: there is no earlier bucket. Replacing it with 0 manufactures a fake 100 percent drop in the growth column; dropping the row hides the baseline from the reader entirely.",
      notes: [
        { choice: 0, why: "0 is a real pace figure on this deck — 1193.86 in July — so a COALESCE'd 0 baseline is indistinguishable from a real flat month and the growth column reads nonsense." },
        { choice: 2, why: "Filtering NULLs hides the baseline row, and the reader can't see where the walk started. NULL-as-baseline is the honest presentation." },
      ],
      difficulty: "hard",
    },
    {
      id: "vueling-mcq-26",
      prompt: "A feed writes the EU market as 'EU', 'eu', and 'EU ' (trailing space). GROUP BY prints six markets. What is the fix?",
      choices: [
        "GROUP BY LOWER(region) alone",
        "Normalize first: GROUP BY TRIM(UPPER(region)) — the three spellings are one market only after both repairs",
        "GROUP BY region COLLATE NOCASE",
        "DISTINCT region before the fold",
      ],
      answer: 1,
      why: "Casing and padding are two different defects: LOWER fixes 'EU'/'eu' but not 'EU ' with its trailing space, and NOCASE still treats padded text as distinct. TRIM plus UPPER normalizes both classes into one key — three spellings, one market.",
      notes: [
        { choice: 0, why: "LOWER('EU ') is still 'eu ' — the padded rows stay their own group. One function, one defect fixed; both classes need treatment." },
        { choice: 2, why: "NOCASE equalizes case only — 'EU' and 'EU ' still fold apart, and the market count stays inflated while every reader assumes it was fixed." },
      ],
      difficulty: "hard",
    },
    {
      id: "vueling-mcq-27",
      prompt: "The attach audit flags bookings whose line count beats the network's per-booking average (2.44). Which correlated read is correct at booking grain?",
      choices: [
        "WHERE COUNT(*) > 2.44 GROUP BY order_id",
        "WHERE (SELECT COUNT(*) FROM order_items l WHERE l.order_id = o.id) > 2.44",
        "HAVING SUM(quantity) > 2.44",
        "WHERE order_id IN (SELECT order_id FROM order_items GROUP BY order_id)",
      ],
      answer: 1,
      why: "The per-booking count exists only after folding that booking's lines — the correlated subquery computes COUNT(*) for exactly the booking being tested and compares at booking grain. COUNT in WHERE never runs (the fold doesn't exist row-wise), and SUM(quantity) compares units against a lines-per-booking benchmark.",
      notes: [
        { choice: 0, why: "WHERE evaluates before GROUP BY — COUNT(*) there is a syntax error or a constant, never the per-booking fold. Aggregate comparisons belong in HAVING or a staged subquery." },
        { choice: 2, why: "Units (SUM of quantity) and lines (COUNT of rows) are different counts on the same 251 rows — the kit's first lesson. 2.44 benchmarks lines per booking; units run 4.83." },
      ],
      difficulty: "hard",
    },
    {
      id: "vueling-mcq-28",
      prompt: "The close packs the paid-statement census and the uncollected census into one result. Which stack is right?",
      choices: [
        "UNION — the dedup keeps the pack clean",
        "UNION ALL with a literal state column per branch — both censuses append, and identical-looking rows stay separate",
        "INTERSECT — only reconciled rows survive",
        "JOIN on the state column",
      ],
      answer: 1,
      why: "The two censuses can fold to identical figures — same counts, same cents — and UNION would silently delete one of them. UNION ALL plus an explicit state literal ('paid'/'open') keeps both branches auditable; the statement's state column is the label that makes the stack safe.",
      notes: [
        { choice: 0, why: "UNION's implicit DISTINCT is the bug from mcq-9 again — two byte-identical census rows collapse and the close loses a bucket with no error anywhere." },
        { choice: 2, why: "INTERSECT keeps only rows present in BOTH censuses — paid and uncollected are disjoint by definition, so the result is empty and the close prints nothing." },
      ],
      difficulty: "easy",
    },
    {
      id: "vueling-mcq-29",
      prompt: "Growth wants markets whose refund share beats the network's 6.8. The benchmark fold must run against:",
      choices: [
        "the filtered market rows only — the benchmark is per market",
        "the whole book — the benchmark is one fold over all 103 bookings, so it's staged in a subquery or CTE, not computed inside the grouped rows",
        "the departed bookings only",
        "each market's own denominator",
      ],
      answer: 1,
      why: "A network benchmark is a single number folded over the whole book — 7/103 = 6.8 — so it must be computed once, outside the GROUP BY, and joined or compared per market. Folding it inside the groups makes each market benchmark against itself and nothing ever fails the gate.",
      notes: [
        { choice: 0, why: "Benchmarking a market against its own refund share makes the predicate a tautology — every market either ties itself or the comparison is meaningless." },
        { choice: 2, why: "The departed denominator is load factor's base, not refund share's. Refund share keeps every booking in the denominator — that's the definition the kit drills." },
      ],
      difficulty: "medium",
    },
    {
      id: "vueling-mcq-30",
      prompt: "The yield deck adds a share-of-book column: each family's value over 34833.28. Which window computes it without a self-join?",
      choices: [
        "ROUND(100.0 * SUM(value) / SUM(SUM(value)) OVER (), 1) over the family fold",
        "ROUND(100.0 * value / COUNT(*), 1)",
        "PERCENT_RANK() OVER (ORDER BY value)",
        "value / MAX(value) OVER ()",
      ],
      answer: 0,
      why: "SUM(SUM(value)) OVER () folds the already-folded family values into the grand total in one pass — each family's share of 34833.28 with no self-join. The nested aggregate is the standard one-pass percent-of-total shape.",
      notes: [
        { choice: 1, why: "COUNT(*) counts families (7), not euros — that divides by 7 and prints something shaped like a share but reconciling to nothing the book foots." },
        { choice: 2, why: "PERCENT_RANK is a rank statistic — each family's position between the smallest and largest value — not a revenue share. The numbers look similar on small sets and diverge everywhere else." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-vueling-1",
      tier: "easy",
      topic: "j2",
      universe: "funnel",
      title: "The attach census",
      brief:
        "Vueling-flavored brief on the storefront db: the ancillary team's Monday review opens with the attach census — for every fare family, attached units, distinct bookings touched and line value — and the deck is explicit that bookings are counted DISTINCT, because 251 fare+ancillary lines fan out from 103 bookings carrying 498 units worth 34,833.28. Probed facts: the seat/bag-heavy family attaches widest — 121 units across 54 bookings for 3294.29 — while the fare-heavy cabin carries 11744.01 on 46 bookings; Video logs 61 units on 30 bookings (5198.41); Fitness is the tail at 27 units on 13 (863.91). The review reads the biggest line value first.",
      ask: "Return each fare family with attached units, distinct bookings touched and line value to 2 decimals, biggest line value first.",
      template:
        "SELECT p.category AS family,\n       SUM(oi.{1}) AS attach_units,\n       COUNT({2} oi.order_id) AS attached_bookings,\n       ROUND(SUM(oi.quantity * oi.unit_price), {3}) AS attach_value\nFROM order_items oi\nJOIN products p ON p.id = oi.{4}\nGROUP BY p.category\nORDER BY attach_value {5};",
      slots: [
        {
          answer: "quantity",
          kind: "keyword",
          label: "the units fold",
          why: "Attach units are SUM(oi.quantity) — 121 for the seat/bag family, 498 across the book. SUM(unit_price) adds line prices instead of units and every family's breadth column collapses into a money-shaped number that matches nothing on the deck.",
        },
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the booking deduplicator",
          why: "COUNT(DISTINCT oi.order_id) folds repeat lines back to bookings: 54, not 121. Plain COUNT counts seat legs and calls them bookings — the exact fan-out bug the attach deck warns about; SUM(DISTINCT …) adds id codes together and MAX(DISTINCT …) reports the largest id.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the value precision",
          why: "Line value reports to 2 decimals — 11744.01 and 3294.29, matching the 34,833.28 book's cents precision. ROUND to 1 prints 11744.0 and the family rows stop reconciling with the book total the finance deck foots.",
        },
        {
          answer: "product_id",
          kind: "keyword",
          label: "the line-to-family key",
          why: "The line carries oi.product_id and the family lives on p.id — that equality is the attach join. Joining on oi.id matches line ids against product ids and pairs the census to whatever rows happen to collide, a different (and wrong) fold entirely.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-value-first direction",
          why: "The review reads the biggest line value on top: 11744.01, 6929.12, 5198.41, 4818.61, 3294.29, 1984.93, 863.91. ASC would open the meeting on the 863.91 tail family — a correct query aimed at the wrong end of the deck.",
        },
      ],
      distractors: ["id", "0", "1", "ASC", "MAX"],
      walkthrough:
        "One join, one fold, four columns at two grains. The join attaches every fare+ancillary line to its family, GROUP BY folds the seven arms, and the census reads: Audio 97 units on 46 bookings for 11744.01, Wearables 53/23/6929.12, Video 61/30/5198.41, Electronics 85/40/4818.61, Accessories 121/54/3294.29, Apparel 54/22/1984.93, Fitness 27/13/863.91 — the probed family cells, footed to the 498-unit, 34,833.28 book. The business read is the spread: the seat/bag family attaches widest (54 of 103 bookings — over half the network — at 121 units) while carrying barely a tenth of the book's value, and the fare-heavy cabin does the opposite; attach strategy funds breadth families and prices yield families, and only the two-grain fold shows both. The distractors fail honestly: id in the units slot sums line ids into noise and in the join slot pairs rows by id collision; 0 in the precision slot rounds the value to whole euros and every family row drifts off its cents-precise cell; 1 truncates 11744.01 to 11744.0 and the rows stop reconciling with the 34,833.28 book; ASC opens the deck on the tail; MAX swaps the units fold for a per-family maximum and every breadth cell shrinks to the biggest single line.",
    },
    {
      id: "cs-vueling-2",
      tier: "medium",
      topic: "j3",
      universe: "catalog",
      title: "The handling-partner bench",
      brief:
        "Vueling-flavored brief on the storefront db: base ops re-signs handling contracts only for partners whose catalog carries at least three fare families — listing depth is the bench gate, and the review reads the surviving ladder smallest-rank first. Probed facts: six airport/handling partners fold to 34,833.28 of route value; Nordic Gadgets AB (EU, 3 families) leads at 11130.25, Midwest Hardware Co (US, 3) holds 9294.93, Shenzhen Electro (APAC, 3) and Pacific Textiles (APAC, 3) sit at 3049.07 and 2980.15. Alpine Audio GmbH — the highest-rated partner at 4.8 — and Andes Naturals SA (4.0) list only 2 families each and miss the bench despite 4765.63 and 3613.25 of value.",
      ask: "Return each bench partner with base market, family count, route value to 2 decimals and value rank, rank 1 first.",
      template:
        "SELECT s.name AS partner,\n       s.region AS base_market,\n       COUNT(DISTINCT p.id) AS families_listed,\n       ROUND(SUM(oi.quantity * oi.unit_price), {1}) AS route_value,\n       RANK() OVER (ORDER BY SUM(oi.quantity * oi.unit_price) {2}) AS value_rank\nFROM suppliers s\nJOIN products p ON p.supplier_id = {3}\nJOIN order_items oi ON oi.product_id = p.id\nGROUP BY s.name, s.region\n{4} COUNT(DISTINCT p.id) >= {5}\nORDER BY value_rank {6};",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the value precision",
          why: "Route value reports to 2 decimals — 11130.25, 9294.93 — matching the supplier ledger's cents precision. ROUND to 1 prints 11130.3 and the bench stops reconciling with the 34,833.28 partner book the contract desk foots.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the rank direction",
          why: "Ranks run from the biggest value down: DESC makes rank 1 the 11130.25 partner. ASC flips the ladder — the 2980.15 partner takes rank 1 — and base ops re-signs the bench upside down.",
        },
        {
          answer: "s.id",
          kind: "keyword",
          label: "the catalog join key",
          why: "The catalog hangs off p.supplier_id = s.id. A bare id is ambiguous across the three tables and errors; p.supplier_id on both sides matches every row to every supplier and folds all six partners into one inflated value — a bench of nobody.",
        },
        {
          answer: "HAVING",
          kind: "keyword",
          label: "the bench gate clause",
          why: "Listing depth is a property of the folded group, so the 3-family floor is HAVING — evaluated after GROUP BY. WHERE cannot see COUNT(DISTINCT p.id) at all; dropping the clause entirely boards the two 2-family catalogs the review explicitly excluded.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the listing floor",
          why: "The bench floor is 3 families — and 3 is visible in the result itself, the families_listed cell of every survivor. Move it to 1 and all six partners board (ranks 1-6, the excluded pair returns); to 5 and the bench empties — no partner lists five families.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "rank-1-first direction",
          why: "The review reads rank 1 first, so the board sorts value_rank ascending. DESC opens the meeting on rank 4 — the 2980.15 partner — with the bench's anchor partner at the bottom of the page.",
        },
      ],
      distractors: ["WHERE", "DESC", "ASC", "1"],
      walkthrough:
        "A three-table chain, folded, gated, then ranked. The chain walks suppliers to their catalogs to the lines that touch them; GROUP BY folds each partner's route value; HAVING COUNT(DISTINCT p.id) >= 3 keeps the deep catalogs; and RANK() OVER (ORDER BY SUM(...) DESC) numbers the survivors — Nordic Gadgets AB, EU, 3 families, 11130.25, rank 1; Midwest Hardware Co, US, 3, 9294.93, rank 2; Shenzhen Electro, APAC, 3, 3049.07, rank 3; Pacific Textiles, APAC, 3, 2980.15, rank 4. The bench story is the two exclusions: Alpine Audio GmbH carries 4765.63 at a 4.8 rating — the highest-rated partner on the book — and still misses the bench on depth, because the gate folds breadth, not quality; Andes Naturals SA's 3613.25 goes with it. The survivors' four values foot to 26454.40 of the 34,833.28 partner book, so the gate concentrates 75.9 of partner value into four renewals. The distractors fail honestly: WHERE cannot follow GROUP BY and errors — and as a row filter it would judge depth on truncated folds anyway; DESC in the rank makes the smallest partner rank 1; ASC in the direction slot does the same in reverse; 1 in the precision slot rounds 11130.25 to 11130.3, in the join slot boards only the id-1 partner, and on the floor admits all six partners and renumbers the ladder 1 through 6. Rank after gate, gate after fold — that ordering is the whole case.",
    },
    {
      id: "cs-vueling-3",
      tier: "medium",
      topic: "l8",
      universe: "growth",
      title: "The booking-pace spine",
      brief:
        "Vueling-flavored brief on the storefront db: revenue management opens the growth review with the booking-pace spine — bookings and booked value per month bucket across the 2024-01 to 2025-02 window — but the deck only boards buckets carrying at least 7 bookings, because a 6-booking month reads as noise to the capacity committee. Probed facts: the fold runs 14 buckets; the floor keeps 11 of them. The 9-booking peaks are 2024-02 (3609.64) and 2024-09 (3116.04); the 8-booking months run 2024-01 (3731.97, the value peak), 2024-03 (2617.08), 2024-05 (2910.31) and 2024-07 (1193.86, the volume-but-thin-summer read); five 7-booking months trail, from 2024-04 (2468.91) to 2025-02 (2390.53). Dropped by the floor: 2024-06 (6 bookings, 2047.43), 2024-11 (6, 1648.8) and 2025-01 (6, 1669.5). The board sorts busiest month first.",
      ask: "Return each month bucket with booking count and booked value to 2 decimals, but only buckets carrying at least 7 bookings, busiest month first.",
      template:
        "SELECT STRFTIME({1}, created_at) AS month_bucket,\n       COUNT(*) AS bookings,\n       ROUND(SUM(total), {2}) AS booked_value\nFROM orders\nGROUP BY month_bucket\nHAVING COUNT(*) >= {3}\nORDER BY bookings DESC, month_bucket;",
      slots: [
        {
          answer: "\"%Y-%m\"",
          kind: "keyword",
          label: "the month key format",
          why: "STRFTIME('%Y-%m', created_at) builds the 14-distinct-bucket spine the deck plots. '%m' alone collides the two Januarys into one row and the YoY read dissolves; '%Y-%M' renders minutes — every booking lands in a single bucket and the pace curve is one bar.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the value precision",
          why: "Booked value reports to 2 decimals — 3731.97, 3609.64 — matching the REAL total column's cents. ROUND to 0 prints 3732 and the monthly rows stop footing to the 34833.28 book the finance review reconciles against.",
        },
        {
          answer: "7",
          kind: "number",
          label: "the noise floor",
          why: "The floor is 7 bookings, and 7 is visible in the result — five survivor rows carry a bookings cell of exactly 7. At 6 the three dropped months board and the deck grows to 14 rows; at 8 the five 7-booking months vanish and the spine reads busier than the network flew.",
        },
      ],
      distractors: ["\"%Y-%m-%d\"", "\"%m\"", "\"1\"", "\"0\""],
      walkthrough:
        "A single-table fold with the gate in the right clause. STRFTIME builds the month key, GROUP BY folds 103 bookings into 14 buckets, HAVING COUNT(*) >= 7 is the noise floor — a property of the group, so it lives after the fold — and ORDER BY bookings DESC, month_bucket breaks the ties deterministically: 2024-02 and 2024-09 share the 9-booking rung, the four 8s follow, the five 7s close. Eleven rows survive; the three 6-booking months (2024-06, 2024-11, 2025-01) are cut exactly as the capacity committee wants. The survivor values foot to 29133.99 of the 34833.28 book — the deck states the covered share rather than hiding the floor. The distractors fail honestly: '%Y-%m-%d' explodes the spine to 103 one-day buckets and the floor keeps 11 of those too, a different deck entirely; '%m' collides years into 12 buckets; '1' rounds every value to whole euros and '0' to integers — both break the cents tie-out; and any floor other than 7 redraws the bench instead of reading it.",
    },
    {
      id: "cs-vueling-4",
      tier: "medium",
      topic: "s6",
      universe: "pricing",
      title: "The fare-ladder split",
      brief:
        "Vueling-flavored brief on the storefront db: pricing reviews the ladder every close with one CASE banding of the 251 fare+ancillary lines — every line priced below the 55 mark is Basic arm, 55 and above is the premium arm — and the deck reads units, average rate and band value per arm. Probed facts at the 55 boundary: the Basic arm carries 133 lines / 268 units at a 31.01 average rate worth 8227.77; the premium arm carries 118 lines / 230 units at 115.85 worth 26605.51. Together they foot to the 251-line, 498-unit, 34833.28 book. The tension the deck exists to show: Basic holds 53 percent of the lines but 24 percent of the value — the premium arm is 76 percent of revenue on 47 percent of volume. The board sorts the biggest band value first.",
      ask: "Band every fare+ancillary line Basic (rate under 55) or premium (55 and above) and return each band with line count, units, average rate to 2 decimals and band value to 2 decimals, biggest band value first.",
      template:
        "SELECT CASE WHEN oi.unit_price >= {1} THEN {2} ELSE {3} END AS fare_band,\n       COUNT(*) AS lines,\n       SUM(oi.quantity) AS units,\n       ROUND(AVG(oi.unit_price), {4}) AS avg_rate,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS band_value\nFROM order_items oi\nGROUP BY fare_band\nORDER BY band_value DESC;",
      slots: [
        {
          answer: "55",
          kind: "number",
          noVerify: true,
          label: "the ladder boundary",
          why: "The 55 mark is the pricing page's Basic/Optima split. At 75 the boundary climbs into the premium arm and Basic swallows mid-ladder lines — 133 stops being the line count; at 1 every line is premium and the Basic arm vanishes. The number is the ladder.",
        },
        {
          answer: "'premium'",
          kind: "keyword",
          label: "the upper band label",
          why: "The 55-plus arm is the quoted label 'premium'. Unquoted or mismatched labels split one arm into two groups — 'premium' and Premium fold apart — and the mix deck prints three rows where the pricing page publishes two.",
        },
        {
          answer: "'basic'",
          kind: "keyword",
          label: "the lower band label",
          why: "Everything under 55 is the ELSE arm, 'basic'. The ELSE is what makes the ladder exhaustive — no line can fall out of the banding, and the two arm line counts must reconcile to 251 by construction.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the rate precision",
          why: "Average rate reports to 2 decimals — 31.01 and 115.85. Round to 1 and 115.85 prints 115.9, losing the cents the revenue-management tie-out checks; round to 0 and both arms' rates stop matching any published fare point.",
        },
      ],
      distractors: ["'Premium'", "'Basic'", "75", "1"],
      walkthrough:
        "One CASE, one fold, two arms that must foot to the book. The CASE bands every line by rate — 55 and above to 'premium', the ELSE catches everything under as 'basic', so the banding is exhaustive by construction — then GROUP BY folds each arm's lines, units and average rate, and ORDER BY band_value DESC puts the premium arm (26605.51) on top. The cells are the probed split: basic 133 lines / 268 units / 31.01, premium 118 / 230 / 115.85 — and the business read is the leverage: the cheap arm runs 53 percent of lines for 24 percent of value, the premium arm inverts both. The distractors fail honestly: 'Premium' and 'Basic' — capitalized — band correctly but label differently than the pricing page, so the deck's arms stop reconciling with the published ladder; 75 re-draws the boundary and both arms' counts shift; 1 pushes the boundary to the floor and every line lands premium, erasing the Basic arm; and 1 in the precision slot truncates 115.85 to 115.9. Band, fold, reconcile to 251 — that's the whole ladder read.",
    },
    {
      id: "cs-vueling-5",
      tier: "easy",
      topic: "j7",
      universe: "refund-audit",
      title: "The refund haircut by market",
      brief:
        "Vueling-flavored brief on the storefront db: the refund haircut is the yield forecast's first deduction — refunded bookings over every booking in the market, held and pending included in the denominator. Probed facts: APAC books 37 bookings and refunds 3 (8.1 percent), EU books 45 and refunds 3 (6.7), US books 19 and refunds 1 (5.3), LATAM books just 2 with none refunded (0.0). The network foots to 7 refunds on 103 bookings — 6.8 — and the deck reads markets biggest share first, every market in the table. The trap the audit watches for is the denominator: refunded over non-refunded re-bases the rate and flatters APAC to 8.8; refunded over distinct passengers mixes grains entirely.",
      ask: "Return each market with booking count, refunded bookings, and refund share to 1 decimal (refunded over ALL bookings in the market), keeping only markets with at least 2 bookings.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS bookings,\n       SUM(o.status = 'cancelled') AS refunded,\n       ROUND(100.0 * SUM(o.status = 'cancelled') / COUNT(*), {1}) AS refund_share\nFROM orders o\nJOIN customers c ON c.id = o.{2}\nGROUP BY c.region\nHAVING COUNT(*) >= {3};",
      slots: [
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          why: "The deck quotes one decimal — 8.1, 6.7, 5.3, 0.0 — and 1 is visible in the result itself, the US refunded cell. Round to 2 and APAC prints 8.11, a cell no slide carries; round to 0 and APAC and EU collapse toward 8 versus 7 and the market ranking the deck argues from loses its edge.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the market join key",
          why: "The market hangs off the passenger: c.id = o.customer_id is the join that lands each booking in its region. c.id = o.id pairs rows by id collision — booking 7 joins passenger 7 — and the census folds whoever collides, a market read of nothing.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the coverage floor",
          why: "The floor is 2 bookings, and 2 is visible in the result — LATAM's bookings cell. At 3 LATAM drops and the deck loses its only zero-share market; at 1 the floor is a no-op and the audit asks why the clause exists.",
        },
      ],
      distractors: ["'shipped'", "id", "3"],
      walkthrough:
        "A one-join fold with the definition carried in the denominator. The join lands every booking in its market through the passenger; SUM(o.status = 'cancelled') is the conditional refund count — SQLite booleans sum as 1/0; the share divides that count by COUNT(*), the whole market fold — booked, held, departed, refunded — with 100.0 entering before the slash so the division is real. Rows: APAC 37/3/8.1, EU 45/3/6.7, US 19/1/5.3, LATAM 2/0/0.0, and the HAVING floor at 2 keeps all four while proving the gate works — drop it to 1 and nothing changes, raise it to 3 and LATAM exits. The audit's sentence: the numerator is refunds, the denominator is every booking, and the 6.8 network figure is 7 over 103, not 7 over 96. The distractors fail honestly: 'shipped' counts departed bookings as refunds and every share explodes; id in the join key collides booking ids against passenger ids and folds a fiction; 3 re-draws the coverage floor instead of reading it.",
    },
    {
      id: "cs-vueling-6",
      tier: "easy",
      topic: "x2",
      universe: "month-close",
      title: "The settlement census",
      brief:
        "Vueling-flavored brief on the storefront db: the month-close opens with a one-pass census of the ticketing statements — how many settled, how many sit uncollected, how many were voided — plus the average statement size in euros, all from INTEGER euro-cents. Probed facts: 28 statements total; 21 settled (paid) worth 66443.00, 6 uncollected (open) worth 19609.00, 1 voided worth 925.00; the book foots to 86977.00 and the average statement reads 3106.32. The close's rule: every statement lands in exactly one state bucket, the states reconcile to 28 by construction, and the money read is amount_cents / 100.0 exactly once — a skipped .0 ships a 310632.14 average that the tie-out rejects on sight.",
      ask: "Return one census row: total statements, settled count, uncollected count, voided count, and the average statement value in euros to 2 decimals.",
      template:
        "SELECT COUNT(*) AS statements,\n       COUNT(*) FILTER (WHERE status = {1}) AS settled,\n       COUNT(*) FILTER (WHERE status = {2}) AS uncollected,\n       COUNT(*) FILTER (WHERE status = {3}) AS voided,\n       ROUND(AVG(amount_cents) / 100.0, {4}) AS avg_statement_eur\nFROM invoices;",
      slots: [
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the settled state",
          why: "Settled means status 'paid' — 21 of 28 statements. 'PAID' folds to zero on a case-sensitive comparison and the close reports a book that never settled; 'settled' matches nothing because the status vocabulary is the ledger's, not the report's.",
        },
        {
          answer: "'open'",
          kind: "keyword",
          label: "the uncollected state",
          why: "Uncollected is status 'open' — the 6 statements worth 19609.00 that carry the chase list. Calling it 'unpaid' or 'refunded' reads 0 and the close ships with an empty chase list while 19609.00 sits on the street.",
        },
        {
          answer: "'void'",
          kind: "keyword",
          label: "the voided state",
          why: "Voided is status 'void' — the single 925.00 statement that must not count as revenue OR as collectible. Dropping the arm makes the states reconcile to 27 of 28 and the missing row is exactly the exception the close exists to catch.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the euro precision",
          why: "The euro read reports to 2 decimals — 3106.32, the cents the tie-out checks. The division by 100.0 happens once, here; the ROUND is precision on top of the unit fix, never a substitute for it.",
        },
      ],
      distractors: ["'settled'", "'refunded'", "'PAID'", "1"],
      walkthrough:
        "One table, one pass, four conditional folds and a cents-safe average. The three FILTER arms partition the status vocabulary — paid, open, void — over the same 28 rows, so the arms must reconcile to COUNT(*) by construction: 21 + 6 + 1. The average converts units exactly once: AVG(amount_cents) folds in cents, the / 100.0 promotes to euros, ROUND(…, 2) trims to the tie-out precision — 3106.32. The close reads the census as a reconciliation: 21 settled against 66443.00 received, 6 open carrying the 19609.00 chase list, 1 void that must appear in neither — the 925.00 statement is the close's known exception, watched because void-but-moved legs are this db's documented failure mode. The distractors fail honestly: 'settled' is not in the status vocabulary and folds 0 into every state arm; 'refunded' likewise; 'PAID' fails the case-sensitive comparison and the settled arm reads 0 while the others stay honest — a census that reconciles to 7 of 28 and flags nothing; and 1 in the precision slot prints 3106.3, dropping the cent the finance tie-out matches against.",
    },
  ],

  problems: [
    { slug: "flight-occupancy-and-waitlist-analysis", why: "Load and waitlist state per departure is the hub's first read — booked, boarded, held. The conditional-status census this problem drills is exactly the ticketing-state fold the commercial standup opens with." },
    { slug: "immediate-food-delivery-ii", why: "Departures that left on the promised day versus late ones — the on-time share is a conditional rate over a timestamp comparison, the same shape as the hub's departure-promise tracking." },
    { slug: "product-sales-analysis-i", why: "Fare and ancillary lines beside their family attributes: units, price and product id at line grain — the first join every attach read makes before any fold to booking grain." },
    { slug: "sales-analysis-i", why: "Bookings folded per passenger beside the passenger's own attributes — the per-market load read the Barcelona desk opens reviews with, drilled at practice scale." },
    { slug: "combine-two-tables", why: "Passengers LEFT JOINed to bookings: the demand-coverage read. A booking without a passenger is corruption; a passenger without a booking is whitespace — choosing the join type is the business statement." },
    { slug: "second-highest-salary", why: "The second-ranked family or partner on a value board — and what happens when the top two tie. Ranking with tie semantics is a daily read on every commercial ladder here." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The heaviest bookers — the 24, 17, 14, 13 ladder — drive the attach deck's concentration slide. Argmax over a booking-count fold is the exact drill." },
    { slug: "biggest-window-between-events", why: "Dormancy between a passenger's own bookings flags the winback cohort before the fare ladder email goes out. LAG-gap math over booking timestamps." },
    { slug: "monthly-transactions-ii", why: "Refunded bookings split out per month on the 14-bucket spine — the monthly state board revenue management reads beside the pace curve. Conditional counts over status, one bucket per row." },
    { slug: "the-airport-with-the-most-flights", why: "Busiest node per network slice — airports for the network, fare families for the attach deck. The argmax-per-group shape this hub's route board is built on." },
    { slug: "calculate-parking-fees-and-duration", why: "Duration-billed ancillaries — bag storage, lounge, late handling — bill by span with CEIL-style rules. Timestamp-pair billing math is exactly this problem's shape." },
    { slug: "server-utilization-time", why: "Aircraft utilization reads span-versus-sum: total turn time folded from interval pairs, not from summed segments. The same discipline sizes the hub's fleet-rotation report." },
    { slug: "find-churn-risk-customers", why: "Passengers whose booking cadence is stretching are the winback cohort — the referral-adjacency scan maps directly onto the fare-ladder re-marketing list." },
    { slug: "customers-who-never-order", why: "The zero-demand anti-join: which passenger or SKU has never moved. On this db the answer is a proven zero — and proving it is part of the job the interviewer grades." },
    { slug: "exchange-seats", why: "Seat swaps are CASE logic over seat positions — the seat-map flip drill. Fare-family seat selection lives and dies on this kind of row-pair reasoning." },
    { slug: "customer-order-frequency", why: "Booking frequency per passenger over a window — the HAVING-gated repeat read that sizes the Optima-tier upgrade campaign every quarter." },
    { slug: "trips-and-users", why: "Trips folded against their requesters with the cancelled share carried beside — the per-market demand-versus-refund read this kit drills, at practice scale." },
    { slug: "total-traveled-distance", why: "Network distance folded per asset from leg records — the route-board total the Barcelona hub reads beside load, drilled with SUM-over-joins discipline." },
    { slug: "the-number-of-passengers-in-each-bus-i", why: "Boarded passengers per departure — the per-leg census that, on this kit's db, is the bookings-per-partner fold the handling bench is ranked from." },
    { slug: "hopper-company-queries-i", why: "Cancelled-share census per driver maps one-to-one onto per-partner refund rates — the conditional fold the ops review boards first." },
    { slug: "immediate-food-delivery-i", why: "Immediate versus scheduled share of demand — the same two-state booking-window split as held-not-ticketed versus ticketed, with the denominator kept whole." },
    { slug: "rolling-7d-actives", why: "Rolling activity windows on a demand spine — the booking-pace curve's smoothing read, and the frame-discipline drill the month-over-month deck builds on." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Repeat bookings inside a seven-day window — the co-attach and re-book signal the fare-ladder remarketing list is built from." },
    { slug: "second-day-confirmation", why: "Confirmations landing by day two — the ticketing-latency read that sizes the held-not-ticketed queue before the departure curve is trusted." },
    { slug: "second-day-verification", why: "Second-day verification rates — the same D2 discipline the ticketing desk applies to PNRs that leave the booking window without a stamp." },
    { slug: "confirmation-rate", why: "Confirmed over requested — the ticketing confirm rate in one conditional fold, the attach funnel's first conversion column." },
    { slug: "duplicate-charge-pairs", why: "Duplicate payment legs paired by amount and day — the settlement-hygiene scan that catches double-charged ancillaries before the close ties out." },
    { slug: "keep-latest-dedupe", why: "Keep the latest row per natural key — the OTA feed dedupe this kit's attach reads depend on, drilled until the tiebreak is second nature." },
    { slug: "ar-aging-schedule", why: "Receivables aged into buckets — the open-statement chase list (19609.00 on this db) reads exactly as an aging schedule in euro-cents." },
    { slug: "median-time-to-convert", why: "Median held-to-ticketed conversion time — the percentile read that sizes how long the 14 held bookings can sit before they threaten load." },
    { slug: "average-selling-price", why: "Average selling price per SKU — the per-family yield fold (31.01 versus 115.85 on this ladder) that pricing reads beside attach breadth." },
    { slug: "weather-type-in-each-country", why: "A CASE-branching join across countries — the banding-while-joining drill that keeps fare-ladder arms exhaustive when the fold rides on a join." },
  ],
};
