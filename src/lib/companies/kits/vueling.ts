// Vueling — wave-10 (Task 100), travel domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// Spain's low-cost carrier: Mediterranean hub-and-spoke from the Barcelona base, fare-family
// laddering and ancillary attach-rate economics. Distinct from ryanair's point-to-point framing:
// this kit reads the db as a hub-led attach business — the fare is thin, the ladder (Basic /
// Optima / Excellence-style families, seat, bag, boarding) is where margin lives. Pool
// provenance: company-pools.md carries NO Vueling section — 0 tagged rows — so all 10 topic
// slug sets and all 16 problems are theme-curated from the pools file's theme menu (sql rows
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
    "Prep strategy: the pools file carries no Vueling section — zero tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's screen shapes: attach censuses, fare-family CASE ladders, ticketing-state funnels, two-grain market reads, partner-bench gates and cents-safe statement folds. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:attach census} the ancillary team opens Monday with, the other rebuilds the {sky:handling-partner bench} the base-ops review boards from. The bar to clear: *state the definition and the denominator before you compute anything* — then make every state census reconcile to 103 by construction.",
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
      slugs: ["product-sales-analysis-ii", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Fare-family ladder bands",
      why: "The ladder is a CASE ladder — Basic below the 55 line, Optima and above above it, premium empty at the 199.99 ceiling — and every booking line must land in exactly one arm. Ordered, exhaustive WHENs are the graded part: a hole in the CASE is a hole in the mix deck, and a reordered WHEN quietly re-bands the base.",
      slugs: ["calculate-orders-within-each-interval", "the-category-of-each-member-in-the-store", "spend-histogram"],
    },
    {
      name: "Ticketing-state funnels",
      why: "Booked to ticketed to departed to kept: each stage is a conditional count over status or the departure stamp, and the funnel's denominator is the whole interview. Held-not-ticketed (14) is 'not yet', refunded (7) is 'never' — collapsing either into the other is the classic mis-defined funnel this kit hunts.",
      slugs: ["funnel-step-conversion", "trial-to-paid-funnel", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain market censuses",
      why: "The Barcelona-hub read reports bookings AND passengers per market: EU runs 45 bookings from 8 passengers while the US runs 19 from 2 — intensity 5.6 against 9.5. COUNT(*) beside COUNT(DISTINCT customer_id), and saying out loud which column is load and which is coverage, is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "students-and-examinations", "top-earners"],
    },
    {
      name: "Route & partner value boards",
      why: "Handling partners and fare families both rank on folded value, and the boards are window ranks over GROUP BY folds — with the rank computed after any gate, not before. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung; on a partner board a shared rung is a negotiation fact, not syntax.",
      slugs: ["rank-scores", "compute-the-rank-as-a-percentage", "department-top-three-salaries"],
    },
    {
      name: "Departure lead-time math",
      why: "The upsell window is julianday(departure) minus julianday(booking) on the 82 stamped bookings — 2.98 days, 2-to-4 spread. Timestamp-pair arithmetic with the population stated (stamped only; the 21 unstamped have no lead) is the exact drill, and duration-billed ancillaries use the same machinery.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "users-that-actively-request-confirmation-messages"],
    },
    {
      name: "Mediterranean seasonality",
      why: "Hub-and-spoke demand breathes with the holiday calendar, and the commercial deck reads YoY deltas and rolling pace on the 14-bucket month spine (2024-01 to 2025-02). LAG prior-period walks, CASE season splits and RANGE-frame rolling averages are the staples — with the first row's NULL reported as baseline, never zero.",
      slugs: ["year-on-year-growth-rate", "seasonal-sales-analysis", "rolling-average-steps"],
    },
    {
      name: "Statement cents discipline",
      why: "Ticketing statements and payment rails settle in INTEGER euro-cents across 28 invoices and 27 payments — the dollar read is amount_cents / 100.0, exactly once, at the presentation edge. The exact/partial/none coverage split (21 / 1 / 6) is one conditional fold away, and a skipped .0 is a hundredfold phantom break.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "trial-balance-check"],
    },
    {
      name: "Partner bench gates",
      why: "Base ops plans handling from partners that clear a listing-depth floor — and the gate lives in HAVING, after the fold, because breadth is a property of the group. Relational-division reads (which partners carry every family) and HAVING-floor benches are the drills; on this db every partner has moved, so the zero answer needs proving too.",
      slugs: ["customers-who-bought-all-products", "find-cities-in-each-state-ii", "sellers-with-no-sales"],
    },
    {
      name: "Co-attach pairing & seat logic",
      why: "Which families attach together, which seat rows sit consecutive, which bookings pair on the same day — co-attach reads are self-joins and EXISTS pairs with anti-symmetry guards. Seat-map logic (consecutive availability, seat swaps) is the load-adjacent drill this carrier is famous for asking.",
      slugs: ["symmetric-pairs", "find-product-recommendation-pairs", "consecutive-available-seats"],
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
  ],
};
