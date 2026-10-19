// BlaBlaCar — kit 13 of the Ride-hailing & Mobility domain (Batch L, wave 7).
// Long-distance carpooling: drivers publish intercity rides, riders book
// individual seats against that seat inventory, and the trip closes at
// check-in — a publish-to-book funnel where the no-show is the trust metric.
// Pool provenance: 0 tagged LC — theme-curated. Every problem and topic slug
// is drawn from the Theme menu in scripts/company-pools.md (sql rows), picked
// to mirror BlaBlaCar's known screen themes: publish-to-book funnels, seat
// pairing and capacity, check-in lead time, no-show CASE bands, corridor
// censuses, month spines, driver payout books in INTEGER cents.
// Case studies run on the storefront db (db/custom.db) with probed figures
// from scripts/company-facts.md (probed 2026-10-12), mapped honestly:
// orders = seat bookings, shipped_at = the check-in stamp (booking-to-check-in
// spans 2..4 days on the ledger — riders reserve seats days before travel
// day, so the multi-day window is booking lead time, not trip duration),
// customers = riders, suppliers = driver cohorts, products = comfort tiers
// (price = the tier fare ceiling; the 199.99 top is a ceiling and the premium
// band above it is empty by design), category = tier family, order_items =
// seat lines under each booking (251 lines on 103 bookings), region = city
// cluster, invoices/payments = the rider billing and driver payout books
// (INTEGER cents — divide by 100.0). Every case slot is mechanically
// verified against the live db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const blablacarKit: CompanyKit = {
  id: "blablacar",
  domainId: "mobility",
  name: "BlaBlaCar",
  tagline: "Long-distance carpooling: seats, bookings, check-ins",
  accent: "text-emerald-200",

  brief: [
    "**BlaBlaCar** is the long-distance carpooling marketplace: a driver publishes an intercity ride, riders book **individual seats** against that seat inventory, and the trip closes at check-in. The analytics unit is the booking, and on this kit's proxy ledger it reads 103 seat bookings worth **34,833.28** (average 338.19) across 16 riders, with 251 seat lines fanning underneath — 2.4 seat lines per booking, the load factor of a published ride. The status map is the publish-to-book funnel itself: 52 {emerald:checked in} (50.5%), 30 en route (29.1%), 14 still awaiting driver confirmation (13.6%), 7 {rose:no-shows} (6.8%).",
    "Two reads define the analyst job here. The {amber:corridor census}: ops reviews open with a single-scan fold per city cluster — bookings, checked-in, no-shows, fare volume in one GROUP BY (EU: 45 bookings, 24 checked-in, 3 no-shows, **15,089.23**) — because the same fold runs every morning across the corridor map. The {sky:check-in window}: 82 of 103 bookings carry a check-in stamp and booking-to-check-in averages **2.98 days** (range 2..4) — *booking lead time, riders reserving seats before travel day, not trip duration; frame it that way or the number lies*. The corridor ladder reads APAC 2.93 fastest, EU 2.94, US 3.07, LATAM 3.5.",
    "Interviews are funnel-first, lead-time-flavored, cents-precise. A screen opens with a warm-up join (attach seat lines to their booking), escalates into a conditional fold (`SUM(CASE WHEN …)` is the house idiom), then lands on a denominator test: checked-in ÷ ALL booked, awaiting and no-shows included, or the funnel flatters itself. Settlement rounds go through the payout books: 28 `invoices` against 27 `payments`, INTEGER cents read as `amount_cents / 100.0`, 6 unsettled claims worth 15,217.00, one of them — #28, 1,756.00 — *marked paid with zero settlement rows*, its mirror #11 void-but-paid at 925.00. Follow-ups are spoken aloud: 'is that per booking or per seat line?', 'does an awaiting booking sit in your denominator?'",
    "Preparation strategy: BlaBlaCar has **0 tagged LC** rows in this app's pool, so the kit is **theme-curated** — all 30 topic slugs and 16 problems are hand-picked from the theme menu to mirror carpool screens: publish-to-book funnels, seat pairing, check-in lead time, no-show bands, month spines, payout AR. Then run all six case studies on the live db: one rebuilds the {amber:booking-month no-show pivot} the trust review reads, the other rebuilds the {sky:payout coverage board} the settlement desk closes the month with, with four more rehearsing the same drills at other grains — the kit is built for spaced practice rather than one sitting... The bar to clear: name the grain, state the denominator, and gate the NULLs deliberately before you compute anything.",
    "Two more ledgers frame the economics. On the supply side, driver cohorts carry the seat book with a heavy top: **Nordic Gadgets AB at 32%** of billed value with Midwest Hardware Co at 26.7% behind it — more than half the corridor supply rides on two cohorts — while the tail splits thin (Shenzhen Electro 8.8%, Pacific Textiles 8.6%), which is why every cohort read ships with a {violet:share column} beside the revenue rank. Every listed cohort carries at least one booked seat — the {emerald:publish rate} is a proven 6 of 6, an anti-join zero verified rather than assumed. On the cost side the ops book runs 36 expense lines worth 25,416.00, of which {orange:Rent} alone is 14 lines and 16,800.00. And the fare catalog is barbell-shaped — 8 budget tiers averaging 32.06, 8 mid tiers averaging 111.5 up to the 199.99 ceiling — with a premium band at 200-plus that is *empty by design*: an empty band is a finding, and the honest census prints the hole instead of padding it.",
    "Prep roadmap for the deep cuts: sequence the work the way the screens stack. Week one, rebuild the {amber:two-grain census} — bookings AND distinct riders per cluster — then the {sky:settlement-speed} read, where the payout clock runs issue-to-FIRST-payment: 28.4 days on average, fastest 13, slowest 84, against uniform 30-day terms. Week two, the stack and the sweep: the ops-cost rollup with its {violet:TOTAL banner} computed by UNION ALL, and the never-settled anti-join where claim #28 sits *marked paid with zero settlement rows at 1,756.00*. Week three, the boards: the cohort leaderboard where three cohorts tie at 3 listings and the tie policy IS the answer, then the corridor ladder whose averages exist only for the 82 stamped bookings. Then rehearse the failure modes by name — NOT IN against a NULL-carrying set, a WHERE on the right table that silently converts a LEFT JOIN, frame peers that double a running sum — *because at this level the basics are assumed; the screen is hunting for the analyst who states populations before results*.",
  ],

  dayInLife: [
    "**08:15 —** The day opens on the seat board: overnight bookings versus check-ins — 82 of 103 stamped — and the first query is the one-pass corridor census, one scan per city cluster: bookings, checked-in, no-shows, fare volume in a single GROUP BY. The numbers must reconcile before the standup: checked-in arms sum to 52, awaiting to 14, no-shows to 7, and the seat-line fan-out (251 lines under 103 bookings) says whether yesterday's published rides actually sold. A drift here is the day's first fire, and the analyst who can write the census *and* the diff against yesterday's fold owns the incident.",
    "**11:00 —** Midday is lead-time deep-work. The ops lead wants the {sky:check-in window} by corridor — JULIANDAY lag over the 82 stamped bookings, awaiting bookings gated out with a stated NULL policy, APAC's 2.93 benchmarked against LATAM's 3.5 — and the trust lead wants the same fold as a no-show band: cancelled ÷ booked per cluster (3 of 45 in EU, 3 of 37 in APAC, 1 of 19 in US) with the denominators printed beside every share. A seat-inventory question lands mid-block: which corridors run published rides tight enough that seat lines per booking climbs — the join-fan-out read that turns 251 lines into a load factor rather than a bug report.",
    "**16:00 —** The afternoon is the payout cycle, and it ends the day. The settlement desk walks the books — 28 `invoices`, INTEGER cents read as dollars — then the coverage fold: 21 claims settled exactly ($65,612.00), 6 never-collected ($15,217.00), 1 partial at 4,000.00 of 6,148.00, with #28 — the 1,756.00 claim {rose:marked paid with zero settlement rows} — queued beside its mirror, #11, {rose:void-but-paid} at 925.00, and five split-settlement claims reconciling tranche by tranche. Driver-cohort share gets one query — the top cohort carries 32% of billed volume — and the writeup ships with census reconciliations printed, denominators named, *every funnel number legible at the grain it claims*.",
    "**21:30 —** The late window belongs to the boards that feed tomorrow's liquidity. The cohort supply board rebuilds for the marketplace review — **Nordic Gadgets AB 11,130.25 at 32%** of the 34,833.28 seat book, Midwest Hardware Co 9,294.93 at 26.7% behind it — and the ops cost stack folds the month's spend in one pass: 36 lines, 25,416.00, the {orange:TOTAL banner} appended by UNION ALL rather than typed by hand, so it ties to the arms or the stack doesn't ship. The last read is the publish ledger: six cohorts listed, six carrying booked seats, a {emerald:100% publish rate} re-proved nightly by the anti-join — because the night it returns a row is the night a cohort's rides went unsold. The handoff note follows the house shape: *population, denominator, cents rule — three lines at the top, numbers underneath*.",
  ],

  metrics: [
    { name: "Checked-in share", what: "Bookings with a check-in stamp ÷ ALL booked: 52 of 103 (50.5%). Awaiting and no-show bookings stay in the denominator — the publish-to-book funnel never gets to flatter itself." },
    { name: "Corridor census", what: "Per city cluster in one pass: EU 45 bookings / 24 checked-in / 3 no-shows / 15,089.23; APAC 37 / 21 / 3 / 11,605.45; US 19 / 5 / 1 / 7,286.16; LATAM 2 / 2 / 0 / 852.44." },
    { name: "Check-in lead time", what: "Booking-to-check-in over the 82 stamped bookings: 2.98-day average, range 2..4. Booking lead time on a carpool marketplace — seats reserved before travel day — not trip duration." },
    { name: "Corridor lag ladder", what: "Average lead time per cluster, stamped only: APAC 2.93 (29 bookings), EU 2.94 (36), US 3.07 (15), LATAM 3.5 (2). Fastest-first is how the ops review reads it." },
    { name: "No-show share", what: "Cancelled ÷ booked: 7 of 103 (6.8%). By cluster: EU 3, APAC 3, US 1, LATAM 0 — the trust metric, always quoted with its denominator." },
    { name: "Seat-line fan-out", what: "251 seat lines under 103 bookings — 2.4 lines per booking. The load-factor signal: fan-out up means published rides are filling; fan-out at 1 means the car is a taxi." },
    { name: "Fare ceiling map", what: "Comfort tiers top out at 199.99 and the premium band above 200 is empty by design: 8 mid tiers (avg 111.50), 8 budget (avg 32.06). Ceilings, not market prices — carpool economics cap fares." },
    { name: "Payout AR", what: "Claims with no settlement rows: 6 worth 15,217.00 — one (#28, 1,756.00) marked paid with zero settlements. The anti-join the payout desk runs at month close." },
    { name: "Two-grain rider census", what: "Bookings AND distinct riders per cluster in one pass: EU 45 bookings from 8 riders, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. The gap between the columns is rider intensity — the liquidity read every corridor review runs on." },
    { name: "Cohort publish rate", what: "Driver cohorts carrying at least one booked seat ÷ ALL listed cohorts: 6 of 6 (100%). The anti-join returns zero today — and gets re-run nightly, because the night it returns a row, a cohort's published rides went unsold." },
    { name: "Settlement speed", what: "Issue-to-FIRST-payment on settled claims: 20 averaging 28.4 days, fastest 13, slowest 84, against uniform 30-day terms. MIN(paid_on), never MAX — the five split-settlement claims would poison any last-payment average." },
    { name: "Ops cost base", what: "The expense book: 36 lines worth 25,416.00 — Rent 14 lines / 16,800.00, Ads 14 / 4,570.00, Travel 3 / 2,521.00, Tools 5 / 1,525.00. Read in INTEGER cents (amount_cents / 100.0); the month-close stack appends a TOTAL banner computed by the same fold." },
  ],

  topics: [
    {
      name: "Publish-to-book funnels",
      why: "Every corridor review opens with the funnel: bookings published, checked-in, en route, awaiting, no-show — counted per cluster without letting the seat-line fan-out double anything. BlaBlaCar drills which grain the query stands on before any aggregate runs, because a rate computed at seat-line grain prices a seat, not a booking.",
      slugs: ["percentage-of-users-attended-a-contest", "immediate-food-delivery-ii", "customer-placing-the-largest-number-of-orders", "average-selling-price"],
    },
    {
      name: "One-pass conditional folds",
      why: "The census runs every morning, so it runs in ONE scan: SUM(CASE WHEN …) arms per status with branch totals that reconcile back to COUNT(*). BlaBlaCar treats the fold as standing infrastructure — four scans cost four table reads where one conditional fold costs one, and one fold guarantees every arm describes the same 103 bookings.",
      slugs: ["active-businesses", "find-stores-with-inventory-imbalance", "find-books-with-polarized-opinions", "top-travellers", "number-of-times-a-driver-was-a-passenger", "capital-gain-loss", "reformat-department-table"],
    },
    {
      name: "Check-in windows & lead time",
      why: "The lead-time conversation is date arithmetic: JULIANDAY(check-in) - JULIANDAY(booking) over the 82 stamped bookings, grouped by corridor. BlaBlaCar drills the NULL gate (an unstamped booking has no lead time, not zero lead time) and the framing that keeps 2.98 days honest — lead time, not ride duration.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Seat inventory & capacity pairing",
      why: "Carpooling is capacity math: seats against bookings, adjacent seats for pairs, a car that fills or doesn't. Self-joins on contiguous availability and running-capacity windows are the screen's physical layer — the shapes behind 'can this published ride absorb tonight's demand?'",
      slugs: ["consecutive-available-seats", "last-person-to-fit-in-the-bus", "exchange-seats", "trips-and-users", "last-person-to-fit-in-the-elevator", "the-most-recent-three-orders", "find-the-start-and-end-number-of-continuous-ranges", "project-employees-i"],
    },
    {
      name: "No-show bands & CASE tiers",
      why: "Trust reporting is a CASE over behavior bands — checked-in, awaiting, no-show — and the arms carry contracts: the awaiting arm fires BEFORE any lag comparison, the ELSE is exhaustive by design, and the boundary booking lands where the spec says it lands.",
      slugs: ["the-category-of-each-member-in-the-store", "weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Corridor leaderboards",
      why: "Rank corridors or drivers by fare volume and ties are waiting — this ledger ties at 4, 3 and 2. BlaBlaCar drills the rank trio because 'do tied corridors share a rung?' is a policy the review defends, and LIMIT-OFFSET habits break silently on it.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Month spines & trend reads",
      why: "Service reviews run on the calendar: bookings per month on the 2024-01..2025-02 spine (14 buckets), the 1,193.86 July trough against the 3,731.97 January open. '%Y-%m' builds the spine, half-open windows cut quarters without losing the boundary night.",
      slugs: ["monthly-transactions-i", "hopper-company-queries-i", "unique-orders-and-customers-per-month", "sales-by-day-of-the-week"],
    },
    {
      name: "Rates with honest denominators",
      why: "Checked-in shares, no-show percentages, load factors — BlaBlaCar's ratios punish integer division and quiet denominator drift. The house habit: 100.0 before the division, the denominator's population decided BEFORE the ratio, rounding only at the very end.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "hopper-company-queries-ii"],
    },
    {
      name: "Manifest folds & GROUP_CONCAT",
      why: "A published ride's manifest is rows: which riders, which pickup points, in what order. GROUP_CONCAT folds the manifest into one cell per booking — the roster read the driver's app shows — and drills the separator/ordering discipline that keeps a folded string readable.",
      slugs: ["group-sold-products-by-the-date", "find-cities-in-each-state", "concatenate-the-name-and-the-profession", "find-the-team-size"],
    },
    {
      name: "Settlement & cents discipline",
      why: "Rider billing and driver payouts live in INTEGER cents: every dollar read is amount_cents / 100.0, and the missing .0 floors every odd-cent claim. The reconciliation culture is row-level: 6 unsettled claims (15,217.00), one void-but-paid (925.00), one paid with zero settlement rows (1,756.00).",
      slugs: ["bank-account-summary-ii", "customer-order-frequency", "generate-the-invoice"],
    },
    {
      name: "Two-grain corridor censuses",
      why: "Bookings AND riders per cluster is the opening read: EU carries 45 bookings from just 8 riders, the US 19 from 2 — and the gap between the columns is rider intensity, the liquidity read. COUNT(*) and COUNT(DISTINCT customer_id) count different things at different grains, and a census that conflates them reports the corridor as busier than its rider base.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "article-views-ii"],
    },
    {
      name: "Above-average fare screens",
      why: "Screens escalate into nested logic: which riders' average fare beats the platform's 338.19 line, which corridors clear the global mean. The shape is a fold staged inside a comparison — and the follow-up that separates candidates is what the screen returns when the inner fold is empty: a NULL from a scalar, an empty set from IN, or a silent zero if someone coalesced, each a different report.",
      slugs: ["orders-with-maximum-quantity-above-average", "find-expensive-cities", "market-analysis-i", "employee-bonus"],
    },
    {
      name: "Settlement speed & payout aging",
      why: "The payout clock runs issue-to-FIRST-payment over the settled book: 20 claims averaging 28.4 days, fastest 13, slowest 84, against uniform 30-day terms. Aging reads are julianday deltas against a reference date that is a policy choice — and MIN(paid_on), never MAX, or the five split-settlement claims poison the average with their second tranches.",
      slugs: ["ar-aging-schedule", "settlement-fails-aging", "users-that-actively-request-confirmation-messages", "customers-who-never-order", "game-play-analysis-iv", "maximum-transaction-each-day"],
    },
    {
      name: "Grand-total stacks & rail splits",
      why: "Month-close ships one result set: detail arms per category, a TOTAL banner appended by UNION ALL. The drill: UNION dedupes where ALL appends — a collapsed duplicate row breaks the tie-out — arms must match column for column, the banner is computed by the same fold that built the arms (25,416.00 on this book), and the ORDER BY at the stack's foot sorts the whole result, banner included.",
      slugs: ["monthly-transactions-ii", "count-apples-and-oranges", "odd-and-even-transactions", "second-highest-salary"],
    },
    {
      name: "Cohort concentration & share",
      why: "Cohort reads ship with a share column: Nordic Gadgets AB 11,130.25 is 32% of the 34,833.28 book, and the denominator stays the FULL book even when the board is floored at 3,049.07. Window shares compute over surviving rows; the honest version stages the total separately — the staging move this kit's hardest screens turn on.",
      slugs: ["portfolio-weights", "portfolio-concentration-hhi", "compute-the-rank-as-a-percentage", "product-sales-analysis-ii"],
    },
  ],

  theory: [
    {
      id: "blablacar-t1",
      q: "A booking has multiple seat lines under it — 251 lines on 103 bookings. What does COUNT(*) count after the join, and how do you keep the funnel honest?",
      a: "After the join, COUNT(*) counts SEAT LINES — the fan-out multiplies every booking by its line count, and a 'bookings' column that prints 251 is a seat census wearing the wrong name. The honest funnel names one row per what for every aggregate: COUNT(*) on the bookings table (or COUNT(DISTINCT booking_id) after the join) counts bookings; COUNT on the line side counts seat lines; and the ratio between them — 2.4 lines per booking — is itself the load-factor signal, the carpool shape expressed as a join, not noise to dedupe away. The trap that catches candidates is blending grains in one column: SUM of line fares divided by COUNT(*) of lines prices a seat, not a booking. Say the grain out loud per column, per query — at BlaBlaCar the fan-out IS the product, and the funnel is only truthful when every column announces what a row is.",
      tag: "joins",
    },
    {
      id: "blablacar-t2",
      q: "The morning census reports bookings, checked-in, awaiting, no-shows and fare volume per corridor. Why build it as one conditional fold instead of five separate scans — and what must the arms do at the end?",
      a: "One pass because the census is standing infrastructure: the same fold runs every morning over the same table, and five scans cost five table reads where one conditional fold costs one. The idiom: SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) for checked-in, sibling arms for awaiting and no-shows, SUM(total) for fare volume — every arm computed inside the same GROUP BY, so all of them describe the SAME population of bookings. The contract at the end: arms reconcile — checked-in (52) plus awaiting (14) plus no-shows (7) plus en-route (30) sums back to COUNT(*) (103) — because a census whose arms don't reassemble the base is a guess with formatting. FILTER (WHERE …) is the equivalent one-scan idiom; the discipline is identical: one fold, one population, reconciliation printed next to the numbers.",
      tag: "aggregation",
    },
    {
      id: "blablacar-t3",
      q: "The checked-in share is 52 of 103 bookings. Where does the status rule live in the query, and what does the number become if awaiting and no-show bookings are filtered out first?",
      a: "The status rule is a ROW-level fact used as the numerator, so it lives inside a conditional aggregate: SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) over ALL booked seats, divided by COUNT(*) from the same fold — 52 of 103, 50.5%. Filter to 'resolved' first and the denominator shrinks to 89; filter to delivered-only and it's 52 — real numbers, different metrics, wrong names. That's denominator drift, and in carpooling it's political: a share that quietly drops awaiting bookings makes the marketplace look like it never leaves a rider waiting, when the 14 awaiting bookings are exactly the supply-gap signal corridor teams need. The sibling trap is HAVING — it judges group aggregates after the fold, when the excluded bookings are already inside every corridor's total. The strong answer states the pipeline order and asks of every filter: fact about one row, or about a group?",
      tag: "aggregation",
    },
    {
      id: "blablacar-t4",
      q: "Rank corridors by fare volume and three corridors tie. RANK, DENSE_RANK or ROW_NUMBER for the ops board — and where does the tie-breaker belong?",
      a: "The rank trio is a business decision about shared rungs and gaps. RANK shares the rung and skips — after a tie at rank r the next distinct value lands at r+1·(tied rows), implying phantom corridors between the tie and the tail. DENSE_RANK shares rungs without gaps — the compact ladder an ops board wants, where tied corridors visibly read as peers. ROW_NUMBER splits ties arbitrarily — a silent judgment call decided by scan order rather than policy. On a ledger like this one ties are structural (order counts repeat at 4, 3 and 2), so the policy ships WITH the query: DENSE_RANK for peer ladders, or a named deterministic tie-breaker written into the window's ORDER BY — fare volume DESC, corridor name ASC — so the board is reproducible. The wrong answer is picking a function; the right answer is picking a policy and labeling it in the header.",
      tag: "windows",
    },
    {
      id: "blablacar-t5",
      q: "The no-show band classifies each booking by lead time — booked more than 3 days before check-in is 'early'. Where do the NULLs and the boundary row land, and how do you write the CASE so the bands reconcile?",
      a: "Three contracts, stated in arm order. First the no-stamp arm: WHEN check_in IS NULL THEN 'not checked in' must fire BEFORE any lead-time comparison — the comparison matters because check-in IS NULL makes the lag NULL, and NULL <= 3 is UNKNOWN, so an ungated booking falls through to ELSE and reads whatever the ELSE says, mislabeled by arithmetic that never ran. That single arm-order decision keeps the 14 awaiting bookings out of the wrong band. Second, the boundary: WHEN lead > 3 is inclusive by spec — a booking at exactly 3.0 days is on the wrong side of 'early', and flipping the comparison silently re-buckets every boundary row. Third, exhaustiveness: ELSE guarantees every stamped booking lands somewhere, and the bands must reconcile — checked-in plus awaiting plus no-shows sums back to COUNT(*) (52 + 14 + 7 + 30 = 103). A band table that doesn't reassemble the base is a guess with formatting.",
      tag: "windows",
    },
    {
      id: "blablacar-t6",
      q: "14 bookings are still awaiting confirmation with no check-in stamp. What is your NULL policy for the lead-time report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped bookings have a lead time, so the report measures the 82 stamped bookings of 103 and says so — the 14 awaiting and 7 no-shows have no lead time, not zero lead time. Then mechanics: AVG ignores NULLs, so AVG(lead) over ALL bookings returns the stamped-only average (2.98 days) with a silently shrunken population — a real number wearing the wrong name, unverifiable from the header. COUNT(stamp) counts the stamped subset; the gap between it and COUNT(*) IS the outstanding count, which is a feature — the awaiting queue is the supply-gap queue. What is never acceptable is IFNULL-ing the lead to zero to 'fix' the average: that folds 21 phantom zero-day bookings into the mean and publishes same-day check-ins for seats nobody confirmed. The gate lives in WHERE (check_in IS NOT NULL) with the population named in the header — a lead-time report whose WHERE clause is doing definitional work silently is exactly what a BlaBlaCar review hunts for.",
      tag: "nulls",
    },
    {
      id: "blablacar-t7",
      q: "The service review buckets bookings by booking month. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this ledger from 2024-01 to 2025-02; '%m' alone folds January 2024 into January 2025 and the demand curve becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and month-boundary nights are exactly when weekend-trip demand lands in a carpool funnel. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first delta is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month in a demand walk. Date discipline is corridor discipline: the spine, the window and the edge row are where service reports go wrong.",
      tag: "dates",
    },
    {
      id: "blablacar-t8",
      q: "The payout desk says a driver claim is marked paid but has no settlement rows behind it. Walk me through the reconciliation query you write first — and the cents rule you never break writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this book that returns 6 claims worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why the settlement rows are the ledger of record and the status column is a claim. Then the mirror check: a void claim WITH a settlement row (this book has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. Between them sit the 5 split-settlement claims where two tranches must SUM to the claim — COUNT alone can't verify a split. The cents rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 is integer division, it floors every odd-cent claim, and at driver-payout scale the driver audits line by line. When counts and sums disagree between the ops ledger and the payout run, the query that shows WHICH rows disagree is the deliverable.",
      tag: "quality",
    },
    {
      id: "blablacar-t9",
      q: "An analyst writes SELECT ROUND(SUM(total), 2) AS fare FROM orders WHERE fare > 2500 and gets an error. Walk me through the query pipeline and where that alias actually exists.",
      a: "The pipeline is FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — and the alias fare is born at SELECT, two stages after WHERE runs, so WHERE fare > 2500 references a name that doesn't exist yet. The gate is also aimed at the wrong stage: a threshold ON A FOLD is a group-level condition, which is what HAVING is for — WHERE judges raw rows before any fold exists, and SUM(total) in WHERE dies for the same reason. The repairs, in order of preference: move the gate to HAVING ROUND(SUM(total), 2) > 2500, or stage the fold in a derived table or CTE and filter the outer query — the shape that scales to fold-filter-fold pipelines, like a booking-month fold whose months then get judged on fare volume. ORDER BY can see the alias (SQLite is generous there; portable SQL shouldn't lean on it elsewhere). The sentence to say out loud: WHERE is a row-level gate over raw rows, HAVING is a group-level gate over folds, and aliases live downstream of both — a corridor fold that sorts on its rounded share column is using exactly this visibility.",
      tag: "pipeline",
    },
    {
      id: "blablacar-t10",
      q: "The close pack wants a running billed-fare column beside the monthly booking spine. What does the default window frame compute — and where do the two frame keywords diverge?",
      a: "With ORDER BY in the OVER clause, the default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — the running total you asked for, until the ordering column repeats. RANGE includes PEER rows: every row sharing the ORDER BY value joins the frame at once, so a running sum over a duplicated value jumps by the whole tie group. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW counts physical rows and makes ties irrelevant. On a month spine keyed by a unique '%Y-%m' string the two agree — 14 buckets, no peers — but order the same frame by fare volume or booking count and the ledger's structural ties (order counts repeat at 4, 3 and 2) make RANGE lurch. Every running column in this kit's reports ships with its frame stated in the header, because a number whose definition depends on which rows the frame admitted is a number nobody can re-derive. The interview sentence: 'RANGE by value, ROWS by position — I chose ROWS, and here is why.'",
      tag: "windows",
    },
    {
      id: "blablacar-t11",
      q: "A published ride's manifest folds into one cell — riders, pickup points, in order. What does GROUP_CONCAT actually promise, and when is folding the wrong call?",
      a: "GROUP_CONCAT(column) folds non-NULL values into one separator-joined string — comma by default, custom separator as the second argument. Three promises it does NOT make: order is unspecified unless the aggregate carries its own ORDER BY or the input is pre-sorted in a staged subquery — the same manifest can print two ways on two runs; NULLs are skipped silently, so the cell's arity is invisible — pair the fold with COUNT beside it, or the roster's headcount is a guess; and length is unbounded, so a 24-booking rider history can produce a cell no dashboard renders. The wrong-tool cases: when consumers need to filter or aggregate on the folded values (strings don't fold back cheaply), and when the fold hides a grain change — a booking row that now carries a list is no longer the row the funnel promised. In this kit the manifest fold is a display edge on the driver's app; the seat lines underneath stay rows, because the load factor — 251 lines under 103 bookings — is computed from rows, never from a string.",
      tag: "aggregation",
    },
    {
      id: "blablacar-t12",
      q: "A teammate probes for cohorts with zero payouts via NOT IN (SELECT cohort_id FROM payouts) and gets an empty list — but ops swears one cohort never settled. Walk through the mechanism.",
      a: "NOT IN is a set-membership test under three-valued logic, and one NULL poisons the whole set: cohort_id NOT IN (4, 9, NULL) expands to cohort_id != 4 AND cohort_id != 9 AND cohort_id != NULL, and the last comparison is UNKNOWN for every row — the WHERE passes nothing, and an empty report that looks like a clean bill of health is actually a data-quality incident in the inner query. This is distinct from the scalar-subquery empty case (one NULL comparison against one value) — NOT IN spreads the poison across the entire set. The repairs, in order of honesty: NOT EXISTS (correlated, NULL-immune, short-circuits per row), or LEFT JOIN + IS NULL, the anti-join this kit's publish-rate check runs nightly to prove 6 of 6 cohorts carry bookings — a verified zero that survives only because the probe is NULL-immune. And the finding under the bug: a NULL cohort_id in the payout rows is itself the story; the query rewrite is triage, the row is the incident.",
      tag: "nulls",
    },
    {
      id: "blablacar-t13",
      q: "Month-close ships the ops cost book as one result set — detail arms per category plus a TOTAL banner. Why UNION ALL and not UNION, and where do stacked reports break?",
      a: "UNION ALL appends; UNION dedupes — it runs a distinct over the combined rows, which costs a sort and can silently delete legitimate duplicates: two identical detail rows (same category, same line count, same spend) collapse into one, and a close that must reconcile to the raw ledger no longer adds up. The structural failure modes: every arm must project the same column count with compatible types or the stack won't parse — the banner arm pads with literals ('TOTAL' in the key column) to match shape; the TOTAL row is computed by the SAME fold as the arms — Rent 16,800.00 + Ads 4,570.00 + Travel 2,521.00 + Tools 1,525.00 = 25,416.00 — and if it doesn't tie, the stack printed fine and reasoned wrong; and ORDER BY at the stack's foot applies to the WHOLE result — an ORDER BY inside an arm is illegal, so the banner's position is a sort-key decision, not a declaration. Set ops stitch populations; they don't reconcile them — the tie-out query is separate and always runs.",
      tag: "set-ops",
    },
    {
      id: "blablacar-t14",
      q: "Which subquery shape for 'riders whose average fare beats the platform's 338.19 line' — scalar, IN, EXISTS, correlated, derived — and what does each cost or risk?",
      a: "Start at the grain: the comparison is per-rider average against a platform-wide constant, so the constant is a scalar subquery computed once — (SELECT AVG(total) FROM orders) — and the per-rider fold is a GROUP BY with HAVING AVG(total) > that scalar. IN/EXISTS answer membership ('has at least one booking above X'), not rate comparisons — reaching for them here answers a different question. Correlated subqueries re-run per outer row: correct for EXISTS probes, wasteful as a per-row fold when a derived table computes all rider averages once and joins back. Derived tables (or CTEs) are the workhorse when the inner side is itself an aggregation — stage the fold, then compare. And the follow-up that separates candidates: what does each shape return when the inner fold is empty? A scalar over zero rows is NULL — and fare > NULL is UNKNOWN, so the screen returns NOTHING rather than everyone; an IN over an empty set returns nothing too. On a 16-rider ledger the difference is invisible; at corridor scale it's a dashboard that silently blanks.",
      tag: "subqueries",
    },
    {
      id: "blablacar-t15",
      q: "A no-show cancellation credit posts exactly 30 days after the booking date. Build the posting date, the days-elapsed read and the aging band — without string surgery.",
      a: "DATE(created_at, '+30 days') builds the posting date as a real date — this book's terms are uniform (average, min and max all 30 days), so the modifier IS the schedule. Elapsed days are JULIANDAY(reference) - JULIANDAY(posting-or-issue date): positive means past due, and the reference date is a policy choice you state in the header — MAX(paid_on) for a close, CURRENT_DATE for a live list, never 'whenever the query ran' unlabeled. The aging band is a CASE over that delta — current, 1-30, 31-60, 60-plus — with an exhaustive ELSE, and the bands must count every open credit exactly once. The reconciliation twist this book earns its keep on: terms are uniform at 30 but settlement is not — 20 settled claims average 28.4 days, fastest 13, slowest 84 — so the aging bucket on the DUE date and the settlement-speed distribution are two different reports that superficially look like one. Name which one you wrote, or the cancellation-credit review reads a latency chart believing it's an aging schedule.",
      tag: "dates",
    },
    {
      id: "blablacar-t16",
      q: "Every census here must 'sum back'. What identity does a fare-band or coverage census satisfy, and which query proves it?",
      a: "The identities: class counts sum to the base (the four booking statuses 52 + 30 + 14 + 7 = 103), money arms sum to the book (28 claims, 86,977.00), paid arms sum to what actually landed (69,612.00 across 27 settlement rows). The proof query enumerates before it classifies — GROUP BY status first, so the arms name states that actually exist — then re-folds the census beside the raw totals and asserts the deltas are zero, the way the ledger proves itself at 181,080 debits against 181,080 credits. A census that doesn't sum back isn't a wrong number, it's an UNMAPPED ROW: some status value, some NULL amount, some settlement with no claim home fell outside the arms you named. The senior instinct is to ask 'what did my ELSE catch?' before anyone else does — in reconciliation the unnamed row is always the story, and on this ledger the unnamed rows have names: #11, void-but-paid at 925.00, and #28, marked paid with zero settlements at 1,756.00.",
      tag: "quality",
    },
    {
      id: "blablacar-t17",
      q: "Five claims on the payout book settle in two tranches. How do you pair settlement legs with a self-join — without pairing a row with itself or counting each pair twice?",
      a: "Join the settlement table to itself on the shared claim key — legs a and b where a.invoice_id = b.invoice_id — and canonicalize the pair in the join itself: a.id < b.id. The strict inequality kills both birds at once: a row can never pair with itself (id = id fails), and each unordered pair appears exactly once (the (a,b) with the smaller id is kept; its mirror fails the test). Using != admits both mirrors — every pair twice — and <= admits self-pairs, which reads as a duplicate where there is none. Then verify by SUM, not COUNT: the two legs of claims 1, 5, 12, 19 and 22 must sum to their claim amounts, and COUNT alone can't prove a split reconciles. The same discipline transfers to this kit's physical layer — adjacent-seat pairing for riders travelling together, each seat joined to the next seat — and the rule is identical: define the pair's canonical order in the join condition, not in a post-hoc DISTINCT, because the DISTINCT that cleans a doubled pair is also hiding the bug next quarter when the count changes.",
      tag: "joins",
    },
    {
      id: "blablacar-t18",
      q: "Growth wants fare quartiles across the 251 seat lines. How does NTILE split an indivisible population, and why is it not a rank?",
      a: "NTILE(4) assigns bucket numbers 1..4 to ordered rows, and when the count doesn't divide evenly the remainder goes to the EARLIER tiles: 251 = 4 x 62 + 3, so the tiles run 63, 63, 63, 62 — the first quartile is one row fatter, and boundary placement is arithmetic, not data. Two properties make it not-a-rank: NTILE ignores ties completely — two seat lines with the same fare can land on opposite sides of a tile boundary because filling is by row position, not value equality — and every tile is guaranteed populated regardless of clustering, unlike a CASE over value thresholds, which can return an empty band (this catalog's premium band at 200-plus is exactly such a hole). So the honest answer names the intent: tiles for distribution slicing where peers may legitimately split, RANK/DENSE_RANK when peers must share a rung, and an explicit value-threshold CASE when the business means fixed fare bands. NTILE is the function people reach for when they mean all three, and the review reads the difference in the boundary rows.",
      tag: "windows",
    },
    {
      id: "blablacar-t19",
      q: "Ops wants lines, spend, the Rent line count and the Ads spend from the expense book in ONE query. Compare FILTER (WHERE …) against SUM(CASE WHEN …) and against four grouped queries.",
      a: "FILTER (WHERE ...) is a conditional aggregate with readable syntax: COUNT(*) FILTER (WHERE category = 'Rent') counts inside the same scan that produces COUNT(*) — 36 lines total, 14 of them Rent, one pass, one timestamp. SUM(CASE WHEN category = 'Rent' THEN amount_cents ELSE 0 END) computes the same thing with more ceremony and a whole class of copy-paste bugs: forget the ELSE and NULLs propagate into the sum, mistype the arm and it's silently zero, and a reviewer must diff four CASE arms to audit one census. Four separate grouped queries are the real enemy, and not for speed: each is a separate population decision, and between two runs on a table that just took a posting the totals can drift — the classic month-close incident is two exports disagreeing by one line. One pass is one population, one truth. The phrasing that closes the interview: 'the census is one query because the census is one claim' — the arms are display choices, the single scan is the correctness claim, and this book's 25,416.00 only means something because every arm saw the same 36 lines.",
      tag: "aggregation",
    },
    {
      id: "blablacar-t20",
      q: "The cohort board filters to a 3,049.07 revenue floor — but shares must read against the FULL 34,833.28 book. Why does SUM(revenue) OVER () betray you here, and what staging fixes it?",
      a: "Because a window without a frame computes over the rows that SURVIVED the WHERE: floor the board at 3,049.07 and SUM(revenue) OVER () totals 31,853.13 — five cohorts, Pacific dropped — so every share reads against the filtered board and prints Nordic at 35% instead of 32%. The wrong number is plausible, which is what makes it dangerous. The fix is staging: fold the cohorts in a derived table, fold the FULL book in a separate unfiltered aggregate, and bring the two grains together — a CROSS JOIN of one totals row, or a scalar subquery in the SELECT — then divide outside: 100.0 * 11,130.25 / 34,833.28 = 32.0, rounded once at the display edge. The principle outranks the mechanics: the denominator's population is a definition, and definitions outrank convenience — if shares are of the full book, the total comes from the unfiltered fold, no matter how natural the window version looks. CTE versus inline derived table is house style; the staging itself is the correctness move.",
      tag: "subqueries",
    },
    {
      id: "blablacar-t21",
      q: "COUNT(*), COUNT(customer_id) and COUNT(DISTINCT customer_id) — three numbers on the same corridor fold. What does each count, and which pair is the two-grain census?",
      a: "COUNT(*) counts rows that survived — on the raw bookings table that's bookings (EU 45), but after the seat-line join it's lines (251 across the ledger), which is why grain naming comes first. COUNT(customer_id) counts non-NULL values of the column — on bookings with a NOT NULL foreign key it equals COUNT(*), and the two only diverge after an OUTER join leaves NULLs in the extended rows, which is exactly where people misread survival. COUNT(DISTINCT customer_id) folds repeats back to the population: EU's 45 bookings from 8 riders, APAC's 37 from 5 — the two-grain census, bookings AND riders in one row, whose gap is rider intensity. The same trio powers the supply reads: COUNT(DISTINCT product id) per cohort is its listing count, and a census that says 'listings' while counting lines is the catalog wearing the wrong name. The habit: every count in the SELECT announces what a row is — star for survivors, column for non-NULLs, DISTINCT for the population — and the corridor review can then defend every column in the grid.",
      tag: "aggregation",
    },
    {
      id: "blablacar-t22",
      q: "This ledger is 103 bookings — why would anyone talk about indexes? Which sargability habits do you practice here that survive corridor scale?",
      a: "Because habits, not hardware, carry across four orders of magnitude, and the interview is checking the instinct, not the plan. Sargability first: a predicate that wraps the indexed column in a function — SUBSTR(created_at, 1, 7) = '2024-01', JULIANDAY(shipped_at) - JULIANDAY(created_at) <= 3 — cannot use an index on that column, because the function must run per row; the rewrite is a half-open range on the raw column (created_at >= '2024-01-01' AND created_at < '2024-02-01'), which seeks and keeps the boundary night. Composite order second: an index on (customer_id, created_at) serves the rider-rollup seek; the reverse order doesn't, because the rollup filters on rider first. Covering third: a fold that needs only customer_id and total answers from the index alone. And the honesty clause the panel wants: at 103 rows a table scan beats any index dance, and saying so — 'I write sargable because the shape survives scale, not because this query needs it' — is the answer. The analyst who tunes this ledger before stating the denominator is optimizing the wrong thing.",
      tag: "performance",
    },
    {
      id: "blablacar-t23",
      q: "The ledger computes APAC's average lead at 2.931034… and the review prints 2.93. Where does rounding belong, and what breaks when it moves?",
      a: "Rounding belongs at the display edge, applied once, to a value already computed at full precision. Round inside the fold and the error compounds: a staged average rounded per stage, then re-averaged, drifts from the true mean in ways no one can audit — aggregate first, round the outer SELECT, once. The integer-division trap is the same lesson one stage earlier: 100.0 must sit before the division because integer / integer has already truncated — ROUND(6, 2) is still 6, the cents were lost before rounding was asked. And the comparison rule pairs with it: quote the printed precision in the review (2.93, 2.94, 3.07) but compare at raw precision — a corridor flagged at 'average > 2.93' flips depending on whether the predicate saw 2.931034 or the rounded cell. On this kit's money reads the same discipline prints as cents: amount_cents / 100.0, then ROUND(..., 2), then the string — three steps, in that order, and the walkthrough that names 'the number the review reads' and 'the number the predicate compared' as two different things is the one that ships.",
      tag: "quality",
    },
    {
      id: "blablacar-t24",
      q: "The never-settled sweep returns empty the moment someone adds WHERE p.method = 'card'. Why does a predicate on the right table kill a LEFT JOIN, and where does that predicate belong?",
      a: "Because WHERE judges rows AFTER the join has done its work: the LEFT JOIN extended each unmatched claim with NULLs precisely so it would survive, and then the WHERE predicate p.method = 'card' evaluates UNKNOWN against those NULLs and deletes them — the join silently degrades to an INNER JOIN, and the sweep loses exactly the 6 claims (15,217.00, including #28's paid-labeled 1,756.00) it exists to find. The repairs: move the predicate into the ON clause (ON p.invoice_id = i.id AND p.method = 'card'), which filters the MATCHES while preserving unmatched left rows; or pre-filter the right side in a derived table and LEFT JOIN to that. The general form is worth stating: a WHERE predicate on the right table of a LEFT JOIN converts it to an INNER unless the predicate is NULL-tolerant — and the bug ships silently whenever the unmatched population happens to be empty that day. On this book it isn't: the sweep is the anti-join, and the dunning list is what the settlement desk's morning starts with.",
      tag: "joins",
    },
  ],

  mcqs: [
    {
      id: "blablacar-mcq-1",
      prompt: "Bookings join to seat lines (251 lines under 103 bookings). What does COUNT(*) count in the joined query?",
      choices: ["103 — the join preserves booking grain", "251 — the fan-out multiplies bookings by their seat lines", "251 × 103 — a cross product", "It depends on the join direction only"],
      answer: 1,
      why: "After the join, COUNT(*) counts seat lines — one row per line. The 2.4× fan-out is the load factor of a published ride, and quoting it as a booking count is the grain error this domain drills first.",
      notes: [
        { choice: 0, why: "Only COUNT(DISTINCT booking_id) preserves booking grain after the join. COUNT(*) counts whatever rows survive — and survival is at seat-line grain." },
        { choice: 2, why: "A cross product needs CROSS JOIN — an ordinary equi-join on booking_id emits one row per matching seat line, 251 total." },
      ],
      difficulty: "easy",
    },
    {
      id: "blablacar-mcq-2",
      prompt: "Checked-in share: 52 checked-in, 30 en route, 14 awaiting, 7 no-shows, of 103 booked. Which denominator does the house definition use?",
      choices: ["Checked-in + no-shows only (52/59)", "All booked seats (52/103)", "En-route bookings only", "Distinct riders (52/16)"],
      answer: 1,
      why: "The house definition: checked-in ÷ ALL booked — 50.5%. Awaiting bookings are demand the system accepted; every alternative computes a real but differently-named metric.",
      notes: [
        { choice: 0, why: "That's the RESOLVED-booking share — 88.1%. Calling it 'the checked-in share' inflates 50.5% by silently deleting the awaiting queue — the exact flattery the funnel review exists to prevent." },
        { choice: 3, why: "52/16 is checked-in bookings per rider — an intensity ratio, not a rate. Rates divide populations of the same grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "blablacar-mcq-3",
      prompt: "A payout claim reads amount_cents = 92500. Which expression prints its dollar value?",
      choices: ["amount_cents / 100", "ROUND(amount_cents / 100.0, 2)", "amount_cents * 100", "ROUND(amount_cents, 2)"],
      answer: 1,
      why: "INTEGER cents ÷ 100.0 promotes to real arithmetic: 925.00 — the void-but-paid #11 on this book. The .0 is the entire fix; integer ÷ integer truncates and every odd-cent claim leaks its cents into the floor.",
      notes: [
        { choice: 0, why: "92500 / 100 is integer division = 925 — on round-dollar claims the bug hides; the first odd-cent payout exposes it. Promote before you divide." },
        { choice: 2, why: "Multiplying gives 92,500,000 — units inverted. Sanity-check magnitude: dollars are smaller than cents." },
      ],
      difficulty: "easy",
    },
    {
      id: "blablacar-mcq-4",
      prompt: "Inside GROUP BY city cluster, what does COUNT(*) FILTER (WHERE status = 'cancelled') compute?",
      choices: ["All bookings in the cluster, with cancelled ones flagged", "The no-show count per cluster — a conditional count in the same scan as COUNT(*)", "A separate query run per cluster", "The percentage of no-show bookings"],
      answer: 1,
      why: "FILTER (WHERE …) is a per-aggregate gate: within each cluster's group, only rows passing the predicate are counted — the one-scan census idiom, equivalent to SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), guaranteed to describe the same booking population.",
      notes: [
        { choice: 0, why: "The plain COUNT(*) next to it does that. FILTER narrows WHICH rows the aggregate sees — it never flags rows in the output." },
        { choice: 3, why: "A percentage needs the division: 100.0 * COUNT(*) FILTER (…) / COUNT(*). FILTER counts; it doesn't normalize." },
      ],
      difficulty: "medium",
    },
    {
      id: "blablacar-mcq-5",
      prompt: "The trust review keeps only booking months with at least 9 bookings. What does that gate do on this ledger?",
      choices: ["Keeps every month — all months have 9+", "Keeps 2024-02 and 2024-09, the only 9-booking months", "Keeps the six months with 8 or more", "Keeps the two biggest months only"],
      answer: 1,
      why: "GROUP BY month HAVING COUNT(*) >= 9 keeps exactly the two nine-booking months — 2024-02 and 2024-09 — and the boundary is live: 8 admits five more months, 10 empties the board.",
      notes: [
        { choice: 2, why: "Eight is a different floor: 2024-01, 2024-03, 2024-05, 2024-07 and 2024-10 all carry 8 bookings and would flood a review built at nine." },
        { choice: 3, why: "A top-N habit isn't a floor — LIMIT picks rows after ordering, while HAVING judges each month's own count against the bar." },
      ],
      difficulty: "medium",
    },
    {
      id: "blablacar-mcq-6",
      prompt: "The demand review buckets bookings by booking month. Which format key builds the spine correctly?",
      choices: ["STRFTIME('%m', created_at)", "STRFTIME('%Y-%m', created_at)", "STRFTIME('%Y', created_at)", "SUBSTR(created_at, 1, 4)"],
      answer: 1,
      why: "'%Y-%m' gives year plus zero-padded month — 14 buckets on this ledger, 2024-01 through 2025-02. It is the only key that keeps January 2024 and January 2025 apart while keeping months comparable.",
      notes: [
        { choice: 0, why: "'%m' folds every January into one bucket — the demand curve mixes two years and quietly becomes fiction." },
        { choice: 2, why: "'%Y' collapses to two buckets; a review that reads '2024: 96 bookings' has no monthly signal left in it." },
      ],
      difficulty: "medium",
    },
    {
      id: "blablacar-mcq-7",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to percentage-valued bookings", "It is cosmetic — moving it changes nothing"],
      answer: 1,
      why: "Without it, integer ÷ integer is integer division — every corridor's no-show share truncates toward 0 and the trust map reads flat. The 100.0 forces real division first; on this ledger it's the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (a/b)*100 truncates first, then scales — 0.068 became 0 at the fold. Order of operations is the metric." },
      ],
      difficulty: "medium",
    },
    {
      id: "blablacar-mcq-8",
      prompt: "An analyst joins bookings to seat lines, then computes 100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*) and reports the checked-in share. What's wrong?",
      choices: [
        "Nothing — the join is required to see status",
        "The denominator now counts SEAT LINES — the 2.4× fan-out deflates every corridor's share; compute at booking grain or use COUNT(DISTINCT booking_id) in the denominator",
        "CASE cannot be used after a join",
        "The 100.0 must come after the division",
      ],
      answer: 1,
      why: "The join is fine for line-level facts, but the rate's denominator is now seat-line grain — 251 rows under 103 bookings — so every booking-side count divides by ~2.4× too many rows and the share collapses. The numerator needs a booking-grain denominator: COUNT(DISTINCT o.id), or run the fold on the bookings table before joining lines.",
      notes: [
        { choice: 0, why: "status lives on the bookings table — the join adds nothing to this fold except fan-out. The bug is real and it's in the denominator." },
        { choice: 2, why: "CASE works anywhere an expression works. The failure isn't syntax — it's a rate computed across two grains at once." },
      ],
      difficulty: "hard",
    },
    {
      id: "blablacar-mcq-9",
      prompt: "Analyst A computes AVG(JULIANDAY(check_in) - JULIANDAY(created_at)) with NO gate and reports 2.98. Analyst B gates with WHERE check_in IS NOT NULL and reports 2.98. What explains the pair?",
      choices: [
        "A bug — the ungated average must be lower because 21 bookings contribute zero lead time",
        "Both print the same VALUE — AVG ignores NULLs, so the ungated fold silently measures the same 82 stamped bookings; the difference is that only B's population is stated",
        "The gate changed the average but rounding hid it",
        "One of them used DISTINCT",
      ],
      answer: 1,
      why: "AVG skips NULL rows entirely — the 21 stamp-less bookings contribute nothing to either fold, so both averages are the same 82-booking mean. The difference is honesty, not arithmetic: A's number has an implicit, unverifiable population; B's header says 'stamped bookings only'. The failure mode people expect (zero-folding) only happens if someone IFNULLs the lead to 0 first.",
      notes: [
        { choice: 0, why: "NULL is not zero — the ungated rows drop out of AVG rather than dragging it down. The zero-folding bug requires IFNULL(lead, 0), which is a different (and worse) query." },
        { choice: 2, why: "No rounding is involved — the two folds are row-for-row the same set. Rounding differences are a red herring here." },
      ],
      difficulty: "hard",
    },
    {
      id: "blablacar-mcq-10",
      prompt: "An early-booker CASE runs WHEN JULIANDAY(check_in) - JULIANDAY(created_at) > 3 THEN 'early' ELSE 'late' — no unstamped arm. Where do the 21 stamp-less bookings land?",
      choices: ["'early' — NULL compares as infinity", "'late' — lead is NULL, NULL > 3 is UNKNOWN, so the row falls to ELSE", "An error — CASE cannot evaluate NULL conditions", "They are skipped — CASE drops rows that fail all arms"],
      answer: 1,
      why: "The lead is NULL for unstamped bookings, NULL > 3 is UNKNOWN, the arm doesn't fire, and the exhaustive ELSE catches them as 'late' — bookings with no lead time at all re-bucketed as failures. That's why the no-stamp arm (check_in IS NULL THEN 'not checked in') fires FIRST in every lead-time band this team ships.",
      notes: [
        { choice: 0, why: "NULL never compares as infinity or zero — every comparison with NULL is UNKNOWN, never true. The illusion comes from IFNULL, which this CASE doesn't use." },
        { choice: 3, why: "CASE doesn't drop rows — a row failing every WHEN arm takes the ELSE. Dropping would need a WHERE, and then the band totals wouldn't reconcile to the base." },
      ],
      difficulty: "hard",
    },
    {
      id: "blablacar-mcq-11",
      prompt: "The corridor census runs COUNT(*) and COUNT(o.shipped_at) side by side over the bookings table. What does the pair print?",
      choices: ["103 and 103 — both count bookings", "82 and 103 — the stamped count first", "103 and 82 — COUNT(*) counts bookings, COUNT(shipped_at) counts check-in stamps", "82 and 82 — both skip unstamped rows"],
      answer: 2,
      why: "COUNT(*) counts every booking (103); COUNT(o.shipped_at) counts non-NULL stamps only (82). The 21-row gap IS the outstanding queue — awaiting plus no-shows — read straight off the two columns without a second query.",
      notes: [
        { choice: 0, why: "COUNT(*) never skips rows — it counts survivors, and all 103 bookings survived. The NULL-skipping column is the shipped_at count." },
        { choice: 1, why: "Reversed — the star counts everything (103), the column counts stamps (82). Order matters when the pair is a reconciliation: base first, stamped second." },
      ],
      difficulty: "easy",
    },
    {
      id: "blablacar-mcq-12",
      prompt: "A payout probe runs WHERE cohort_id NOT IN (SELECT cohort_id FROM settlement_rows) and returns zero rows, though one cohort clearly never settled. The likeliest cause?",
      choices: ["The outer table is empty", "A NULL cohort_id in the settlement rows — one NULL poisons the entire NOT IN set", "NOT IN requires a JOIN clause", "The cohort column is stored as text"],
      answer: 1,
      why: "NOT IN expands to a chain of != comparisons; against NULL each comparison is UNKNOWN, so the conjunction fails for every row. One NULL in the inner set silently empties the report — the NULL-immune repairs are NOT EXISTS or LEFT JOIN + IS NULL.",
      notes: [
        { choice: 2, why: "NOT IN is a predicate, not a join — it needs no join syntax. The empty result is three-valued logic, not missing SQL." },
        { choice: 3, why: "Text columns still compare — a type mismatch alone wouldn't produce a silent zero. The NULL mechanism is the one that returns NOTHING while parsing clean." },
      ],
      difficulty: "medium",
    },
    {
      id: "blablacar-mcq-13",
      prompt: "The close stack appends a TOTAL banner to per-category ops-cost rows. Why UNION ALL rather than UNION?",
      choices: ["UNION ALL is faster, and UNION's dedupe could merge two identical detail rows into one", "UNION cannot stack queries on the same table", "UNION ALL allows ORDER BY inside each arm", "UNION requires a TOTAL column in both arms"],
      answer: 0,
      why: "UNION runs a distinct over the combined rows — two identical detail rows (same category, lines, spend) would collapse and the stack would no longer tie to the raw ledger. UNION ALL appends verbatim; the banner ties because nothing was deduped away.",
      notes: [
        { choice: 2, why: "ORDER BY inside an arm is illegal in a compound SELECT — the sort at the stack's foot applies to the whole result, banner included." },
        { choice: 1, why: "Set ops constrain columns, not tables — same-table stacking is fine either way. The dedupe semantics are the difference that matters." },
      ],
      difficulty: "easy",
    },
    {
      id: "blablacar-mcq-14",
      prompt: "A running fare column: SUM(total) OVER (ORDER BY month). Two months tie on total. What does the default frame do at the second tied month?",
      choices: ["It sums only rows strictly before it", "It includes peer rows — both tied months enter the frame together and the running total jumps by the pair", "It errors on duplicate ORDER BY values", "It restarts the running sum at zero"],
      answer: 1,
      why: "With ORDER BY present the default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW, and RANGE includes peers: the tie group joins the frame at once. The explicit repair is ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW.",
      notes: [
        { choice: 0, why: "That's the ROWS frame — the default is RANGE, which is exactly the peer behavior being tested. Duplicate keys make the two frames diverge." },
        { choice: 2, why: "Ties are legal in windows — they create peers, not errors. The frame's membership changes silently, which is worse than an error." },
      ],
      difficulty: "medium",
    },
    {
      id: "blablacar-mcq-15",
      prompt: "NTILE(4) over the 251 seat lines ordered by fare. What are the tile sizes?",
      choices: ["62, 62, 62, 65", "63, 63, 63, 62", "62, 63, 63, 63", "Undefined — NTILE errors when the count isn't divisible"],
      answer: 1,
      why: "251 = 4 x 62 remainder 3, and NTILE gives the remainder to the EARLIER tiles: 63, 63, 63, 62. The first quartile is one row fatter, and boundary placement is arithmetic, not data.",
      notes: [
        { choice: 0, why: "That's the remainder-to-the-back intuition — natural, wrong. The spec pads the front tiles, so the first quartile and the median boundary shift." },
        { choice: 3, why: "NTILE never errors on indivisible counts — distributing the remainder IS its contract. The separate trap is that it ignores ties entirely." },
      ],
      difficulty: "medium",
    },
    {
      id: "blablacar-mcq-16",
      prompt: "SELECT ROUND(SUM(total),2) AS fare FROM orders WHERE fare > 2500 fails. What's the pipeline reason and the minimal repair?",
      choices: ["Aliases never work anywhere — repeat the whole expression in WHERE", "WHERE runs before SELECT, so the alias doesn't exist yet; a gate on the fold belongs in HAVING", "Aggregates cannot appear with aliases at all", "ROUND cannot wrap SUM"],
      answer: 1,
      why: "Pipeline: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. The alias is created at SELECT; at WHERE time neither the alias nor the fold exists — and a threshold on a fold is a group-level gate, which is what HAVING is for.",
      notes: [
        { choice: 0, why: "Aliases ARE visible in ORDER BY (and often GROUP BY/HAVING in SQLite) — 'never' overclaims. The real rule is stage visibility: WHERE is upstream of SELECT." },
        { choice: 2, why: "Aggregates and aliases coexist fine in SELECT and HAVING. The failure is timing, not combination." },
      ],
      difficulty: "hard",
    },
    {
      id: "blablacar-mcq-17",
      prompt: "A month-over-month walk computes revenue - LAG(revenue) OVER (ORDER BY month) on the 14-month spine. What prints on the first row?",
      choices: ["Zero — the walk anchors itself", "The row's own revenue — LAG defaults to it", "NULL — the first row has no prior month, and the delta is NULL by definition", "The average of all 14 months"],
      answer: 2,
      why: "LAG has no row before the first, so the delta is NULL — the walk's baseline. Report it as NULL or label it 'baseline'; COALESCE to 0 would print a flat month that never happened.",
      notes: [
        { choice: 1, why: "LAG takes a default third argument, but the default DEFAULT is NULL — a self-anchored walk would need LAG(revenue, 1, revenue), which is a different (and misleading) query." },
        { choice: 0, why: "Zero is the coalesce trap: a 0.00 delta reads as 'no movement in month one' instead of 'no prior month to compare against'." },
      ],
      difficulty: "easy",
    },
    {
      id: "blablacar-mcq-18",
      prompt: "Three driver cohorts tie at 3 listings, two sit at 2. DENSE_RANK vs RANK over listings DESC — what do the 2-listing cohorts get?",
      choices: ["Both functions print 2 and 3", "DENSE_RANK prints 2 and 2; RANK prints 4 and 4", "Both print 4 and 4", "DENSE_RANK prints 4 and 4; RANK prints 2 and 2"],
      answer: 1,
      why: "DENSE_RANK shares rungs without gaps: after the three-way tie at 1, the 2-listing cohorts share rung 2. RANK shares the rung but skips: the next rank after three tied rows is 4 — implying a phantom rung 3 that no cohort occupies.",
      notes: [
        { choice: 0, why: "RANK never compacts — the skip is its signature. Printing 2 and 3 would mean the tie was broken, which neither function does without a tie-break in the window's ORDER BY." },
        { choice: 2, why: "Reversed — the gap-skipping function is RANK. ROW_NUMBER is the one that splits ties entirely (4 and 5 by scan order)." },
      ],
      difficulty: "medium",
    },
    {
      id: "blablacar-mcq-19",
      prompt: "SELECT corridor, (SELECT MAX(rating) FROM supplier_pool WHERE region = 'ANTARCTICA') AS best — a region with no rows. What does the corridor row print for best?",
      choices: ["The row is dropped — subqueries filter", "0 — MAX of nothing is zero", "NULL — a scalar subquery over an empty set returns NULL, and the row survives", "An error — MAX requires rows"],
      answer: 2,
      why: "A scalar subquery over zero rows yields NULL — not an error, not zero — and the outer row survives with a NULL cell. The trap is downstream: best > 4 filters that row out (NULL comparison is UNKNOWN), so the emptiness propagates silently.",
      notes: [
        { choice: 1, why: "MAX over zero rows is NULL, never 0 — aggregates skip empty sets. A 0 would require COALESCE, which is a display decision, not an aggregate property." },
        { choice: 0, why: "Scalar subqueries never filter outer rows by existing — they inject a value per row. The filtering illusion comes from the WHERE comparison downstream." },
      ],
      difficulty: "medium",
    },
    {
      id: "blablacar-mcq-20",
      prompt: "GROUP_CONCAT(rider_name) folds each published ride's manifest into one cell. Which promise does it NOT make?",
      choices: ["Non-NULL values join with a comma by default", "The values appear in a deterministic order", "NULL values are skipped", "The result is one string per group"],
      answer: 1,
      why: "Order is unspecified unless the aggregate carries its own ORDER BY or the input rows are pre-sorted — the same manifest can print differently on two runs. Comma default, NULL-skipping, one string per group are all real.",
      notes: [
        { choice: 2, why: "NULL-skipping is real — and it makes the roster's headcount invisible, which is why the fold ships with COUNT beside it." },
        { choice: 0, why: "The comma default is true and overridable with a second argument. The missing guarantee is ordering." },
      ],
      difficulty: "easy",
    },
    {
      id: "blablacar-mcq-21",
      prompt: "The never-settled sweep (invoices LEFT JOIN payments, WHERE p.id IS NULL) gets WHERE p.method = 'card' added — and returns EMPTY. Why?",
      choices: ["No invoice was ever paid by card", "The WHERE predicate on the right table evaluates UNKNOWN against the NULL-extended rows, deleting every unmatched claim — the LEFT JOIN degrades to an INNER", "LEFT JOIN cannot combine with IS NULL", "The payments table is empty"],
      answer: 1,
      why: "The LEFT JOIN extended each of the 6 unmatched claims with NULLs so they'd survive; the new predicate tests p.method against those NULLs, gets UNKNOWN, and deletes them — silently converting the anti-join into an inner join. The predicate moves into the ON clause (or a pre-filtered derived table) to filter matches while preserving the unmatched.",
      notes: [
        { choice: 0, why: "The sweep's rows have NO payments at all — the method of a payment that doesn't exist is the point. The emptiness is the join-predicate mechanism, not the data." },
        { choice: 2, why: "LEFT JOIN + IS NULL is the canonical anti-join. The failure is the second predicate's placement, not the combination." },
      ],
      difficulty: "hard",
    },
    {
      id: "blablacar-mcq-22",
      prompt: "In the ops-cost stack (detail arm UNION ALL banner arm), where does ORDER BY belong?",
      choices: ["Inside each arm, so each sorts before stacking", "Only in the banner arm", "Once, at the end of the compound SELECT — it sorts the whole stacked result", "ORDER BY is illegal anywhere in a stack"],
      answer: 2,
      why: "A compound SELECT takes one ORDER BY at its foot, applying to the entire result — banner rows included. An ORDER BY inside an arm is a syntax error, so the banner's position (top with DESC, foot with ASC) is a sort-key decision.",
      notes: [
        { choice: 0, why: "Per-arm sorting is illegal — the arms are sets, not sequences. The stack's order is decided once, at the end." },
        { choice: 3, why: "Illegal inside arms, allowed (and usually required) at the foot — without it the stack prints in whatever order the engine chose." },
      ],
      difficulty: "medium",
    },
    {
      id: "blablacar-mcq-23",
      prompt: "A no-show cancellation credit posts exactly 30 days after booking. Which expression builds the posting date — and which flags a credit still unpaid as of a stated reference date?",
      choices: ["SUBSTR arithmetic on the date string; overdue if the substring sorts lower", "DATE(created_at, '+30 days'); unpaid if JULIANDAY(reference) - JULIANDAY(posting_date) > 0, reference named in the header", "STRFTIME('%d', created_at) + 30; overdue if it exceeds the month length", "created_at + 30; overdue if CURRENT_DATE > posting, reference unstated"],
      answer: 1,
      why: "DATE with a '+30 days' modifier is real date arithmetic — this book's terms are uniform (average, min and max all 30 days). The overdue test is a julianday delta against a reference date that is a POLICY choice — MAX(paid_on) for a close, CURRENT_DATE for a live list — and it gets named in the report header.",
      notes: [
        { choice: 2, why: "Day-of-month plus 30 is calendar illiteracy — January 40th. Date modifiers and julianday deltas are the toolkit; string day numbers are the trap." },
        { choice: 3, why: "issue + 30 works in some engines as integer math, but the unstated reference date is the buried bug: the same query prints different overdue lists depending on when it ran." },
      ],
      difficulty: "medium",
    },
    {
      id: "blablacar-mcq-24",
      prompt: "EU carries 45 bookings from 8 riders. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts booking rows (45); COUNT(DISTINCT customer_id) folds repeats back to riders (8). The gap — 5.6 bookings per rider — is the intensity read the corridor review actually runs on.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL foreign keys — 45 again, since every booking has a rider. Without DISTINCT both columns read 45 and the census loses the coverage story." },
        { choice: 3, why: "COUNT(DISTINCT region) counts clusters, not riders — a third grain nobody asked for. The census is bookings AND riders." },
      ],
      difficulty: "easy",
    },
    {
      id: "blablacar-mcq-25",
      prompt: "The cohort board filters WHERE revenue >= 3049.07 and computes shares as 100.0 * revenue / SUM(revenue) OVER (). What's wrong with the shares?",
      choices: ["Nothing — OVER () always spans the whole table", "The window computes over the SURVIVING rows only — shares read against the 31,853.13 filtered board, not the full 34,833.28 book, so every share is overstated", "Windows cannot appear in the same SELECT as WHERE", "The 100.0 must come after the division"],
      answer: 1,
      why: "Window functions evaluate after WHERE: SUM(revenue) OVER () totals the five survivors (31,853.13), not the six-cohort book (34,833.28). Nordic prints ~35% instead of 32% — a plausible, wrong share. The fix stages the full-book fold separately (a CROSS JOINed totals row or a scalar subquery).",
      notes: [
        { choice: 0, why: "OVER () spans the window's PARTITION — which is the filtered row set at that point in the pipeline. 'The whole table' is exactly the assumption being tested." },
        { choice: 3, why: "The multiplier's placement is fine — the denominator's population is the bug. Order of operations was an earlier lesson; this one is staging." },
      ],
      difficulty: "hard",
    },
    {
      id: "blablacar-mcq-26",
      prompt: "AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) walks the booking curve as a 2-point average. What does the FIRST month print?",
      choices: ["NULL — it has no preceding row", "Its own revenue — the frame clips to the rows that exist, so the '2-point average' is a 1-point average", "Zero", "The average of the whole spine"],
      answer: 1,
      why: "ROWS frames clip to available rows: on the first row the frame is just that row, so the smoothed column prints the raw value as if it were an average — the edge that goes unnoticed precisely because it prints a number, not a NULL. Label the edge row or widen the window.",
      notes: [
        { choice: 0, why: "NULL edges belong to LAG/LEAD, whose offset rows don't exist. Frame boundaries shrink instead — a value, not a NULL, which is why the edge goes unnoticed." },
        { choice: 3, why: "That's the default window with no frame clause. The explicit 1-PRECEDING frame is local by construction." },
      ],
      difficulty: "hard",
    },
    {
      id: "blablacar-mcq-27",
      prompt: "The stack's detail arm projects (category, lines, spend) and the banner arm projects ('TOTAL', spend). What happens?",
      choices: ["The banner pads with NULLs and the stack prints", "The engine aligns columns by name", "An error — UNION ALL arms must project the same number of columns", "The banner row is silently dropped"],
      answer: 2,
      why: "Compound SELECTs match arms positionally and by count: three columns against two is a parse error. The banner arm pads with literals to match shape — 'TOTAL' in the key column — before the stack will run.",
      notes: [
        { choice: 0, why: "No implicit padding exists — the mismatch fails loudly at parse time. Padding is the author's job, with literals." },
        { choice: 1, why: "Set ops ignore column names entirely — alignment is positional. Naming a column to 'match' changes nothing." },
      ],
      difficulty: "medium",
    },
    {
      id: "blablacar-mcq-28",
      prompt: "The booking spine's last bucket is 2025-02, and the ledger's final booking lands 2025-02-27. What's the trap in 'February demand is down from January'?",
      choices: ["None — the buckets are comparable", "The last bucket is a PARTIAL month (ends on the ledger's final day) — a flat comparison is a range-size artifact, not a trend", "February has fewer weekdays", "STRFTIME merges the two years"],
      answer: 1,
      why: "The edge bucket is short: 2025-02 ends on the ledger's last day, so its bookings sit in fewer days than January's full month. Label partial buckets, truncate trend comparisons to complete months, and never annualize from a partial period.",
      notes: [
        { choice: 2, why: "Weekday mix is noise, not the artifact — the range itself is shorter. Even a perfectly flat demand curve 'drops' when you cut its window." },
        { choice: 3, why: "'%Y-%m' keeps the years apart (14 buckets) — the key is fine. The trap is the edge bucket's SIZE, not its key." },
      ],
      difficulty: "medium",
    },
    {
      id: "blablacar-mcq-29",
      prompt: "Settlement speed on the payout book: 20 settled claims, five of which settle in two tranches. Which fold computes issue-to-FIRST-payment honestly?",
      choices: ["AVG(JULIANDAY(MAX(p.paid_on)) - JULIANDAY(i.issued_on)) per claim", "Fold MIN(p.paid_on) per claim first, then average the deltas — MAX or a bare per-row average lets split tranches poison the mean", "AVG over every payment row — more rows, more precision", "COUNT of payments per claim, scaled by the 30-day terms"],
      answer: 1,
      why: "Five claims settle in two tranches; a per-payment-row average counts the second tranche's date as another observation and drags the mean. Stage to one row per claim with MIN(paid_on) — the FIRST settlement — then average: 28.4 days, fastest 13, slowest 84.",
      notes: [
        { choice: 0, why: "An aggregate inside an aggregate is a parse error — and even unstaged, MAX would measure the LAST payment, the opposite of the clock the desk runs." },
        { choice: 2, why: "More rows here means double-counted claims, not precision — the five split claims contribute two observations each while settling one bill." },
      ],
      difficulty: "medium",
    },
    {
      id: "blablacar-mcq-30",
      prompt: "Load factor after the seat-line join: 251 lines under 103 bookings. Which expression prints it at booking grain?",
      choices: ["COUNT(*) — 251 is the load factor", "1.0 * COUNT(*) / COUNT(DISTINCT order_id) — lines over bookings, promoted to real division", "SUM(order_id) / COUNT(*)", "AVG(order_id) rounded to one decimal"],
      answer: 1,
      why: "The fan-out IS the signal — 251 lines over 103 distinct bookings = 2.4 lines per booking — but only with the numerator at line grain and the denominator folded back to bookings. The 1.0 forces real division; 251/103 as integers truncates to 2.",
      notes: [
        { choice: 0, why: "COUNT(*) after the join is the line count — the numerator, not the ratio. Quoting it as the load factor is the grain error wearing a metric's name." },
        { choice: 2, why: "Summing a key divided by a count is numerology — ids don't sum to anything. The denominator wants DISTINCT booking ids, and the numerator wants 1.0 promotion." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-blablacar-1",
      tier: "medium",
      topic: "s7",
      universe: "funnel",
      title: "The booking-month no-show pivot",
      brief:
        "BlaBlaCar-flavored brief on the storefront db: the trust review reads the publish-to-book funnel as a month pivot — bookings per booking month, with checked-in, awaiting and no-show arms folded in the same scan. Probed facts: the 2024-01..2025-02 spine holds 14 months; only two clear the nine-booking bar a month must pass to enter the trust review — 2024-02 (9 bookings, 4 checked-in, 1 awaiting, 0 no-shows, 3,609.64) and 2024-09 (9 bookings, 7 checked-in, 0 awaiting, 0 no-shows, 3,116.04); five months carry exactly 8 bookings and stay off the board. The month key must keep January 2024 and January 2025 apart, and every arm describes the same booking population.",
      ask: "Return every booking month that clears the nine-booking bar with its bookings, checked-in, awaiting and no-show counts — calendar order, earliest first.",
      template:
        "SELECT SUBSTR({1}, 1, {2}) AS booking_month,\n       COUNT(*) AS bookings,\n       SUM(CASE WHEN {3} THEN 1 ELSE 0 END) AS checked_in,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS awaiting,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS no_shows\nFROM orders o\nGROUP BY booking_month\nHAVING COUNT(*) >= {4}\nORDER BY booking_month ASC;",
      slots: [
        {
          answer: "o.created_at",
          kind: "keyword",
          label: "the booking-date spine",
          why: "Months bucket by when the seat was BOOKED: SUBSTR(o.created_at, 1, 7). Bucketing by shipped_at would pivot on the check-in month — a completion report wearing a funnel's name — and SUBSTR over o.id slices a primary key into garbage buckets.",
        },
        {
          answer: "7",
          kind: "number",
          noVerify: true,
          label: "the month-key width",
          why: "Seven characters is '%Y-%m': year plus zero-padded month, the key that keeps January 2024 and January 2025 apart. Width 4 collapses to year buckets ('2024', '2025') and width 10 slices into individual booking days — 400-plus buckets of noise.",
        },
        {
          answer: "o.status = 'delivered'",
          kind: "keyword",
          label: "the checked-in arm",
          why: "Checked-in means the exact status 'delivered'. status != 'cancelled' would sweep en-route and awaiting bookings into checked_in and the no-show dynamics this review exists to read would flatter every month.",
        },
        {
          answer: "9",
          kind: "number",
          label: "the trust-review bar",
          why: "Nine bookings in a month is the bar for entering the trust review: 2024-02 and 2024-09 are the only months that clear it, and the boundary is live — 8 admits the five 8-booking months and 10 empties the board entirely.",
        },
      ],
      distractors: ["o.shipped_at", "4", "o.status != 'cancelled'", "8", "10"],
      walkthrough:
        "A bar, a spine, three arms, one population. SUBSTR(created_at, 1, 7) builds the '%Y-%m' spine; GROUP BY booking_month folds the 103 bookings into 14 months; the CASE arms count inside the SAME fold — checked_in (status = 'delivered'), awaiting ('pending'), no_shows ('cancelled') — and HAVING COUNT(*) >= 9 keeps the two months that clear the trust bar: 2024-02 (9 bookings / 4 checked-in / 1 awaiting / 0 no-shows) then 2024-09 (9 / 7 / 0 / 0), calendar order, earliest first. The reconciliation the review demands: checked-in + awaiting + no-shows + en-route reassembles COUNT(*) per month. The distractors each break differently: o.shipped_at pivots on the check-in month — a completion report, not a funnel; width 4 collapses the spine to '2024'/'2025'; status != 'cancelled' inflates checked_in from 4 and 7 to 9 and 9 — every booking that isn't a no-show suddenly 'checked in'; 8 floods the board with the five 8-booking months; 10 empties it. The deeper habit: a funnel pivot is only honest when its arms share the fold and the bar is stated next to the gate — the moment an arm's population drifts, the reconciliation check is the only thing between the review and a plausible lie.",
    },
    {
      id: "cs-blablacar-2",
      tier: "hard",
      topic: "q5",
      universe: "month-close",
      title: "The payout coverage board",
      brief:
        "BlaBlaCar-flavored brief on the storefront db: the settlement desk closes the month by classifying every driver payout claim by its SETTLEMENT rows, not its status column. Probed facts: 28 claims (INTEGER cents) against 27 settlement rows; a per-claim fold shows 21 claims settled exactly ($65,612.00), 6 with no settlement rows at all ($15,217.00), and 1 partial — #25, paid 4,000.00 of 6,148.00. Two anomalies sit inside those classes: #11 is void-but-paid at 925.00 (its settlement row exists, so it lands in 'settled'), and #28 is marked paid with zero settlement rows at 1,756.00 (so it lands in 'unsettled') — the status column claims, the settlement rows are the ledger. Five claims (1, 5, 12, 19, 22) settle in two tranches that must SUM to the claim.",
      ask: "Return every coverage class with its claim count and dollar book — biggest book first.",
      template:
        "SELECT {1} AS coverage,\n       COUNT(*) AS claims,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS book\nFROM (\n  SELECT i.id, i.amount_cents, {2} AS paid_cents\n  FROM invoices i\n  LEFT JOIN payments p ON p.invoice_id = {3}\n  GROUP BY i.id\n)\nGROUP BY coverage\nORDER BY book DESC;",
      slots: [
        {
          answer: "CASE WHEN paid_cents IS NULL THEN 'unsettled' WHEN paid_cents < amount_cents THEN 'partial' ELSE 'settled' END",
          kind: "keyword",
          label: "the coverage classifier",
          why: "Coverage is a three-arm contract: no settlement rows is 'unsettled' (LEFT JOIN leaves paid_cents NULL), less than the claim is 'partial' (#25), equal-or-more is 'settled'. Grouping by i.status would classify by the CLAIM's mood instead of its money — #28 would read 'paid' and the desk would miss the 1,756.00 lie.",
        },
        {
          answer: "SUM(p.amount_cents)",
          kind: "keyword",
          label: "the settlement fold",
          why: "Split settlements make SUM the only honest fold: five claims pay in two tranches that must add up to the claim. COUNT(p.amount_cents) would count ROWS (2 for #1, not 4,860.00) and every split claim would misclassify as 'partial'.",
        },
        {
          answer: "i.id",
          kind: "keyword",
          label: "the claim-to-settlement key",
          why: "Settlement rows attach to claims via payments.invoice_id = invoices.id. Joining on p.id matches a settlement's own id against invoice ids — coincidental 1..27 collisions mis-join real claims and the coverage board counts money that never moved.",
        },
      ],
      distractors: ["i.status", "COUNT(p.amount_cents)", "p.id", "p.amount_cents"],
      walkthrough:
        "A derived fold, a classifier, a board. The inner query folds each claim's settlement rows to one paid_cents figure — SUM(p.amount_cents) over LEFT JOIN payments, NULL where no settlement exists — and the outer query classifies and books: 'settled' reads 21 claims / $65,612.00, 'unsettled' 6 / $15,217.00, 'partial' 1 / $6,148.00, biggest book first. The anomaly row-check the desk runs: #11 (void, 925.00, one settlement row) sits inside 'settled' and #28 (paid, 1,756.00, zero rows) sits inside 'unsettled' — the mirror pair that proves the status column is a claim, not a ledger. The distractors each break differently: i.status groups by the claim's mood — 'paid' 21, 'open' 6, 'void' 1 — and both anomalies hide inside their lies; COUNT(p.amount_cents) counts settlement ROWS, so the five split claims (1, 5, 12, 19, 22) collapse to 2 and flood 'partial'; p.id joins settlements to themselves and mis-joins real claims on coincidental ids; bare p.amount_cents picks one arbitrary tranche per claim, so every split claim reads 'partial' even when its tranches add up. The deeper habit: month-close coverage is a derived-table discipline — fold to one row per claim FIRST, classify SECOND, and let the settlement rows, not the status column, say who was paid.",
    },
    {
      id: "cs-blablacar-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The corridor liquidity leaderboard",
      brief:
        "The route-liquidity review ranks corridors by lifetime fare book before Friday's corridor council — which city clusters actually carry the platform's 34,833.28. Probed facts: EU books 45 bookings worth 15,089.23 (335.32 average fare), APAC 37 for 11,605.45 (313.66), US 19 for 7,286.16 (383.48) — and LATAM's pair of bookings (852.44 at a 426.22 average) is the outlier that proves fare quality and liquidity are different columns. The board prints a DENSE_RANK on fare volume, and only corridors clearing the 19-booking bar enter it: US is the boundary corridor that just clears.",
      ask: "Return every corridor above the liquidity bar with its bookings, fare book, average fare and liquidity rank — best rank first.",
      template:
        "SELECT c.region AS corridor,\n       COUNT(*) AS bookings,\n       {1} AS fare_book,\n       {2} AS avg_fare,\n       DENSE_RANK() OVER (ORDER BY {3} DESC) AS liquidity_rank\nFROM orders o\nJOIN customers c ON c.id = {4}\nGROUP BY c.region\nHAVING COUNT(*) >= {5}\nORDER BY liquidity_rank ASC;",
      slots: [
        {
          answer: "ROUND(SUM(o.total), 2)",
          kind: "keyword",
          label: "the fare-book fold",
          why: "The fare book is a SUM over booking totals folded to pennies: ROUND(SUM(o.total), 2) reads 15,089.23 for EU, not a floating tail. AVG(o.total) prices a seat (335.32) and COUNT(*) counts rides — neither is the money column the council funds corridors against.",
        },
        {
          answer: "ROUND(AVG(o.total), 2)",
          kind: "keyword",
          label: "the fare-quality column",
          why: "Average fare is AVG(o.total) rounded to cents: 335.32 on EU, 383.48 on US — the US charges more per ride yet carries a fifth of the book. A bare unrounded AVG prints floating tails and breaks the penny tie-out against the facts file.",
        },
        {
          answer: "SUM(o.total)",
          kind: "keyword",
          label: "the rank fold",
          why: "The rank orders the RAW SUM, not its rounded twin: DENSE_RANK() OVER (ORDER BY SUM(o.total) DESC). Ranking the rounded display column invites display-driven ties, and ranking the average would crown LATAM's 2 bookings (426.22) as the platform's top corridor.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the booking-to-rider key",
          why: "Bookings attach to corridors through riders: c.id = o.customer_id. Joining on o.id matches order ids against rider ids — coincidental collisions inside 1..16 mis-attribute bookings and corrupt every corridor's book.",
        },
        {
          answer: "19",
          kind: "number",
          label: "the liquidity bar",
          why: "Nineteen bookings is the bar: US (19) is the boundary corridor that clears it and LATAM (2) stays off the board. 20 would drop the US and ship a two-corridor board — the bar is live at the boundary, and that is the point of quoting it.",
        },
      ],
      distractors: ["AVG(o.total)", "o.shipped_at", "MAX(o.created_at)", "20", "426.22"],
      walkthrough:
        "A bar, a book, a rank. The corridor spine builds from the booking-to-rider join (c.id = o.customer_id), GROUP BY c.region folds the 103 bookings into four corridors, and HAVING COUNT(*) >= 19 keeps the three that clear the bar: EU — 45 bookings, 15,089.23 fare book, 335.32 average, rank 1; APAC — 37, 11,605.45, 313.66, rank 2; US — 19, 7,286.16, 383.48, rank 3. The read the council makes: the US charges the most per ride (383.48) yet carries roughly a fifth of the 34,833.28 book, while EU holds nearly half — liquidity and fare quality are different columns, and LATAM (852.44 on 2 bookings, 426.22 average) never enters because 2 is nowhere near 19. The distractors each break differently: AVG(o.total) as the fare book prices seats, not books — every corridor reads ~300-400 and the rank reorders around LATAM's 426.22; o.shipped_at sums check-in stamps (text) into a zero book with an all-ties rank; MAX(o.created_at) replaces money with each corridor's newest booking timestamp and ranks by recency; 20 drops the boundary US corridor and ships a two-row board; 426.22 as the bar empties it — a fare figure has no business in a booking-count gate. The deeper habit: a defensible rank keeps three expressions separate — the fold it ranks (SUM), the fold it displays (ROUND(SUM,2)) and the bar it gates (COUNT) — collapse them and the leaderboard defends nothing.",
    },
    {
      id: "cs-blablacar-4",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass corridor trust census",
      brief:
        "Trust & Safety opens every corridor review with the same census, and it runs in ONE scan: bookings, checked-in, no-shows and the no-show share per corridor, all folded from the same 103 bookings. Probed facts: APAC carries 37 bookings with 21 checked-in and 3 no-shows (8.1% — the platform's worst share), EU 45 with 24 and 3 (6.7%), US 19 with 5 and 1 (5.3%), LATAM 2 with 2 and 0 (0.0). The share's denominator is the corridor's WHOLE booking population — awaiting bookings included — or the number flatters.",
      ask: "Return every corridor with its bookings, checked-in, no-shows and no-show share — worst share first.",
      template:
        "SELECT c.region AS corridor,\n       COUNT(*) AS bookings,\n       COUNT(*) FILTER (WHERE {1}) AS checked_in,\n       COUNT(*) FILTER (WHERE {2}) AS no_shows,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE o.status = 'cancelled') / COUNT(*), {3}) AS no_show_pct\nFROM orders o\nJOIN customers c ON c.id = {4}\nGROUP BY c.region\nORDER BY {5};",
      slots: [
        {
          answer: "o.status = 'delivered'",
          kind: "keyword",
          label: "the checked-in arm",
          why: "Checked-in is the exact status 'delivered': 24 of EU's 45, 21 of APAC's 37. status != 'cancelled' would sweep awaiting bookings into checked-in and flatter every corridor; 'shipped' reads the en-route stage — a logistics census wearing a trust badge.",
        },
        {
          answer: "o.status = 'cancelled'",
          kind: "keyword",
          label: "the no-show arm",
          why: "No-show is 'cancelled': 3 in EU, 3 in APAC, 1 in US, 0 in LATAM. The arm must match the share's numerator exactly — one scan, one definition — or the census count disagrees with the percentage printed beside it.",
        },
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the share precision",
          why: "The share rounds to one decimal: 8.1 for APAC, 6.7 EU, 5.3 US — the precision the corridor deck prints. Precision 0 prints 8 and lets APAC and EU blur together; precision 3 prints 8.108 and pretends a confidence a 37-booking base cannot carry.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the booking-to-rider key",
          why: "Corridors come from riders: c.id = o.customer_id. Joining on anything else either mis-joins bookings to riders or explodes the fold into a cartesian fan-out where every arm counts a different population.",
        },
        {
          answer: "no_show_pct DESC, corridor ASC",
          kind: "keyword",
          label: "the worst-first sort",
          why: "The review reads worst first: no_show_pct DESC puts APAC's 8.1 on top, and corridor ASC is the deterministic tie-break so equal shares always print in the same order. Sorting by bookings puts EU's 45 first and buries the corridor the review exists to discuss.",
        },
      ],
      distractors: ["o.status = 'shipped'", "100.0", "c.region", "3", "bookings ASC"],
      walkthrough:
        "One scan, four arms, one population. GROUP BY c.region folds the 103 bookings into four corridors; inside the SAME fold, FILTER (WHERE …) counts checked-in ('delivered': EU 24, APAC 21, US 5, LATAM 2) and no-shows ('cancelled': 3, 3, 1, 0), and the share divides the no-show fold by COUNT(*) — the whole population, awaiting included — at one-decimal precision: APAC 8.1, EU 6.7, US 5.3, LATAM 0.0. Worst first: APAC tops the board despite carrying fewer bookings than EU — 3 no-shows on 37 hurts more than 3 on 45, which is exactly why the share column exists beside the counts. The distractors each break differently: 'shipped' as an arm counts the en-route stage (EU 12, US 10) — a dispatch census wearing a trust badge; 100.0 in the ROUND precision prints floating tails instead of 8.1; c.region in the precision or the join key either casts garbage to zero decimals or cartesian-fans the fold; 3 as precision prints 8.108 — false confidence on a 37-booking base; bookings ASC re-sorts the board LATAM-first and buries the worst corridor. The deeper habit: a trust census is one scan or it is four quietly different populations — the moment each arm re-joins or re-filters on its own, the reconciliation between the arms and COUNT(*) is gone, and the review quotes numbers that cannot be tied back to 103.",
    },
    {
      id: "cs-blablacar-5",
      tier: "hard",
      topic: "q6",
      universe: "month-close",
      title: "The busy-month capacity screen",
      brief:
        "Capacity planning closes the year by screening the months that beat the platform's own average month — the spine the staffing plan hangs on. Probed facts: the 14-month spine (2024-01..2025-02) carries 103 bookings, and the busy floor is 8. Six months clear it: 2024-01 (8 bookings, 3,731.97, 1 no-show), 2024-02 (9, 3,609.64, 0), 2024-03 (8, 2,617.08, 1), 2024-05 (8, 2,910.31, 0), 2024-07 (8, 1,193.86, 2 — the trough month that still cleared the floor), 2024-09 (9, 3,116.04, 0). The screen stages the average-month bar in a CTE so the board prints the bar beside every surviving row.",
      ask: "Return every booking month at or above the eight-booking floor with its bookings, fare book, no-shows and the average-month bar — calendar order.",
      template:
        "WITH month_spine AS (\n  SELECT {1} AS booking_month,\n         COUNT(*) AS bookings,\n         {2} AS fare_book,\n         SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS no_shows\n  FROM orders o\n  GROUP BY booking_month\n)\nSELECT booking_month, bookings, fare_book, no_shows,\n       (SELECT {3} FROM month_spine) AS liquidity_bar\nFROM month_spine\nWHERE bookings >= {4}\nORDER BY {5} ASC;",
      slots: [
        {
          answer: "SUBSTR(o.created_at, 1, 7)",
          kind: "keyword",
          label: "the month key",
          why: "Months bucket by BOOKING date at '%Y-%m' width: SUBSTR(o.created_at, 1, 7) keeps January 2024 and January 2025 apart. Bucketing by shipped_at pivots on the check-in month — a completion report wearing a funnel's name — and the staffing plan would staff the wrong weeks.",
        },
        {
          answer: "ROUND(SUM(o.total), 2)",
          kind: "keyword",
          label: "the fare-book fold",
          why: "Each month's fare book is ROUND(SUM(o.total), 2): 3,731.97 for the January open, 1,193.86 for the July trough. An unrounded SUM prints floating tails; AVG would print the ~338 average fare and lose the month's volume story entirely.",
        },
        {
          answer: "ROUND(AVG(bookings), 2)",
          kind: "keyword",
          label: "the bar fold",
          why: "The bar averages the monthly COUNTS, not booking totals: ROUND(AVG(bookings), 2) over the 14-month spine stages the bar beside every row. Averaging o.total would stage ~338.19 as the bar and no month could ever clear it — the screen would report an empty year.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the busy-month floor",
          why: "Eight is the integer floor the busy-month policy uses: six months carry 8 or 9 bookings. 7 would admit the five 7-booking months (2024-04, 08, 10, 12 and 2025-02) and the floor cracks; 9 keeps only the two peak months and the plan loses half its board.",
        },
        {
          answer: "booking_month",
          kind: "keyword",
          label: "the calendar sort",
          why: "The staffing plan reads calendar order: ORDER BY booking_month ASC puts the January open before the September peak. Sorting by fare_book puts the July trough first and the plan staffs the wrong months; sorting by no_shows crowns the no-show month.",
        },
      ],
      distractors: ["ROUND(AVG(o.total), 2)", "COUNT(*)", "o.total", "fare_book ASC", "no_shows DESC"],
      walkthrough:
        "A spine, a fold, a staged bar. The month_spine CTE folds the 103 bookings into 14 months — SUBSTR(created_at, 1, 7) as the key, COUNT(*) as bookings, ROUND(SUM(o.total), 2) as the book, a CASE arm for no-shows — and the outer query screens WHERE bookings >= 8 while the scalar (SELECT ROUND(AVG(bookings), 2) FROM month_spine) prints the bar (7.36) beside every surviving row: 2024-01 (8 / 3,731.97 / 1), 2024-02 (9 / 3,609.64 / 0), 2024-03 (8 / 2,617.08 / 1), 2024-05 (8 / 2,910.31 / 0), 2024-07 (8 / 1,193.86 / 2), 2024-09 (9 / 3,116.04 / 0), calendar order. The reconciliation the desk runs: every month on the board clears the 8-floor AND the computed bar — the integer policy and the arithmetic agree, which is what makes the screen defensible. The distractors each break differently: ROUND(AVG(o.total), 2) stages ~338.19 as the bar and no month survives; COUNT(*) as the bar fold prints 14 — every month fails its own floor; a bare o.total as the book fold picks one arbitrary booking per month and the 'book' stops being money; fare_book ASC sorts the July trough to the top; no_shows DESC crowns the 2-no-show July as the first month to study. The deeper habit: a screen that compares a group to its own average must stage the average in a CTE or scalar — computing it inline over the already-grouped spine aggregates the aggregate, and the bar dissolves into a single global number.",
    },
    {
      id: "cs-blablacar-6",
      tier: "medium",
      topic: "j4",
      universe: "supplier",
      title: "The driver-cohort payout board",
      brief:
        "The payout run ranks driver cohorts by the fare book their seats carried, and it must be zero-guarded: a cohort with listings but no booked seats yet has to print with a 0.00 book, not vanish from the board. Probed facts: Nordic Gadgets AB (rating 4.6) tops the board — 3 listings carrying an 11,130.25 book; Midwest Hardware Co (4.4) follows at 9,294.93 on 3 listings; Alpine Audio GmbH (4.8 — the best-rated cohort on the platform) is third at 4,765.63 on 2 listings. The desk ships a top-3 cut.",
      ask: "Return the top three driver cohorts by fare book with rating, listings, seats carried and fare book — biggest book first.",
      template:
        "SELECT s.name AS cohort,\n       s.rating AS rating,\n       COUNT(DISTINCT p.id) AS listings,\n       {1} AS seats_carried,\n       {2} AS fare_book\nFROM suppliers s\nLEFT JOIN products p ON p.supplier_id = {3}\nLEFT JOIN order_items oi ON oi.product_id = p.id\nGROUP BY s.id\nORDER BY fare_book DESC\nLIMIT {4};",
      slots: [
        {
          answer: "SUM(oi.quantity)",
          kind: "keyword",
          label: "the seats-carried fold",
          why: "Seats carried is the seat-line quantity fold: SUM(oi.quantity) over the cohort's booked seat lines. COUNT(*) would count manifest LINES, not seats — a 3-seat booking is one line with quantity 3, and the line-count understates every group booking.",
        },
        {
          answer: "ROUND(SUM(oi.unit_price * oi.quantity), 2)",
          kind: "keyword",
          label: "the fare-book fold",
          why: "The fare book prices every seat line at its fare: ROUND(SUM(oi.unit_price * oi.quantity), 2) — 11,130.25 for Nordic. SUM(oi.unit_price) alone prices ONE seat per line and understates every multi-seat booking on the book.",
        },
        {
          answer: "s.id",
          kind: "keyword",
          label: "the cohort-to-listing key",
          why: "Listings attach to cohorts via products.supplier_id = suppliers.id. Joining on p.id matches a listing's own id against cohort ids — coincidental collisions inside 1..6 mis-hang listings and the payout book pays the wrong cohort.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the top-3 cut",
          why: "Three is the board cut: Nordic, Midwest, Alpine — and the third slot is live, Alpine's 4,765.63 beating Andes Naturals' 3,613.25. LIMIT 2 would ship a board without the platform's best-rated cohort; LIMIT 4 dilutes the cut the desk asked for.",
        },
      ],
      distractors: ["SUM(oi.id)", "COUNT(*)", "p.id", "4", "s.rating"],
      walkthrough:
        "A guard, a fold, a cut. The board starts from suppliers and LEFT JOINs listings, then seat lines — the LEFT JOIN is the zero-guard: a cohort whose listings have never sold keeps its row with listings counted and a 0.00 book, where an INNER JOIN would silently delete the cohort from the payout run the month its first listing publishes. GROUP BY s.id folds each cohort to one row; SUM(oi.quantity) counts seats carried, ROUND(SUM(oi.unit_price * oi.quantity), 2) prices them, and the board cuts at LIMIT 3: Nordic Gadgets AB (4.6, 3 listings, 11,130.25), Midwest Hardware Co (4.4, 3, 9,294.93), Alpine Audio GmbH (4.8, 2, 4,765.63). The read ops makes: Alpine is the best-rated cohort on the platform and still third — rating and liquidity are different columns, and the board prints both so nobody conflates them. The distractors each break differently: SUM(oi.id) pays cohorts for their row ids, not seats; COUNT(*) counts seat LINES and understates every multi-seat booking; p.id as the join key mis-hangs listings on coincidental id collisions; 4 dilutes the cut with Andes' 3,613.25; s.rating as the book pays by stars — Alpine's 4.8 would top Nordic's 4.6 with a book a fraction of the size. The deeper habit: a payout board is a LEFT JOIN discipline — the guard is invisible on a good month and priceless the month a new cohort publishes its first listing with zero seats sold.",
    },
  ],

  problems: [
    { slug: "trips-and-users", why: "The canonical two-sided screen: ride status rates with excluded accounts handled in the join — carpooling's checked-in-share-by-corridor in textbook clothing." },
    { slug: "percentage-of-users-attended-a-contest", why: "Reach share across riders with the 100.0-before-division fix — the corridor-penetration percentage the service review quotes." },
    { slug: "immediate-food-delivery-ii", why: "A conditional-count ratio where the denominator is the whole test — checked-in ÷ ALL booked, awaiting included: 52 of 103, never 52 of 59." },
    { slug: "average-time-of-process-per-machine", why: "Per-entity latency folds — the check-in lead-time read (2.98-day average, 2..4 range) grouped by the corridor doing the work." },
    { slug: "last-person-to-fit-in-the-bus", why: "Running-capacity window: riders boarding until the vehicle fills — the seat-inventory shape that decides whether a published ride sells out." },
    { slug: "consecutive-available-seats", why: "Adjacent-seat detection — two riders travelling together book neighbouring seats, and the self-join on contiguity is the pairing query dispatch runs daily." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the vocabulary check before every corridor leaderboard, said out loud with the shared-rung policy." },
    { slug: "hopper-company-queries-i", why: "The monthly booking spine — month buckets over the 2024-01..2025-02 calendar, the trend read every service review hangs on." },
    { slug: "hopper-company-queries-ii", why: "Ride status rates with honest denominators — the ride-hailing rate drill this kit's ratio questions orbit." },
    { slug: "group-sold-products-by-the-date", why: "Manifest folding: per-day rows folded into one roster cell — the published-ride manifest read that shows who shares the car." },
    { slug: "customers-who-never-order", why: "The anti-join grammar itself — and the confidence to report a verified zero never-booked riders, which this ledger genuinely has." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one query with the 100.0-before-division fix — the honest-denominator drill BlaBlaCar's ratio questions orbit." },
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded share where unmatched rows count as zero — the NULL-policy and rounding habits in one deliverable." },
    { slug: "the-category-of-each-member-in-the-store", why: "CASE tier classification per rider — usage bands where the ELSE arm is exhaustive by design, the no-show band's grammar." },
    { slug: "product-sales-analysis-ii", why: "Tier-line folds: fare volume per comfort tier across all bookings — the ceiling-map read supply reviews quote from the same GROUP BY." },
    { slug: "top-travellers", why: "Payout folds per driver cohort — earnings summed across the seats they carried, ordered for the payout run." },
    { slug: "last-person-to-fit-in-the-elevator", why: "The running-capacity fill with the row-number twist: riders board in booking order until the car's seat cap is hit — the seat-fill drill that decides which published rides absorb tonight's demand." },
    { slug: "number-of-times-a-driver-was-a-passenger", why: "The two-sided identity read: cohort members who also book seats as riders — the driver-community metric, and a LEFT JOIN that must keep zero-ride drivers at zero instead of dropping them." },
    { slug: "sales-by-day-of-the-week", why: "The publish-cadence pivot: bookings and fare volume by weekday via strftime — drivers publish midweek, riders book the weekend, and the staffing plan reads the gap between the two." },
    { slug: "employee-bonus", why: "The cancellation-credit book: riders under the booking-count threshold get their credit and everyone else reads zero — the capped LEFT JOIN the credits campaign runs monthly." },
    { slug: "capital-gain-loss", why: "The credits P&L: credits issued on cancellations versus credits burned on rebookings, netted per rider in one pass — the ledger view the trust team quotes when credits leak." },
    { slug: "count-salary-categories", why: "Fare bands with the all-in row: budget, mid and premium seats counted into arms, then a TOTAL banner appended by UNION ALL — the month-close stack that must tie back to 103." },
    { slug: "second-highest-salary", why: "The runner-up fare ceiling: a scalar subquery over DISTINCT fares — the shape behind 'which tier is the platform's second ceiling' without a fragile LIMIT-OFFSET that breaks on ties." },
    { slug: "game-play-analysis-iv", why: "The rebooking fraction: the share of riders whose next booking lands the day after their first — dated through a subquery, rounded only at the very end." },
    { slug: "find-the-team-size", why: "Party size per booking: COUNT(*) OVER (PARTITION BY booking) keeps every seat line while showing the group it travels in — the window that survives the seat-line fan-out." },
    { slug: "the-most-recent-three-orders", why: "Each rider's three most recent bookings via ROW_NUMBER — the rider-app home-screen query, and the anti-LIMIT drill: top-N PER rider, not top-N overall." },
    { slug: "maximum-transaction-each-day", why: "The big-ticket watch: the largest booking per travel day with ties included — argmax by window so two equal records both print, never a GROUP BY that keeps one arbitrary row." },
    { slug: "find-the-start-and-end-number-of-continuous-ranges", why: "Consecutive travel-day runs: gaps-and-islands over the booking calendar — the liquidity read that shows which stretches ran without a dark day." },
    { slug: "reformat-department-table", why: "The month-close status pivot: checked-in, awaiting and no-show as COLUMNS per month — the trust census's same fold, rotated for the corridor deck." },
    { slug: "average-selling-price", why: "Weighted fare per comfort tier: SUM(fare × seats) ÷ SUM(seats) with the 1.0-before-division guard — the fare-per-seat read that prices tiers, never a naive AVG of unit fares." },
    { slug: "project-employees-i", why: "Average fare per corridor through the booking-to-rider join — the corridor pricing read that must survive the GROUP BY grain (per corridor, not per rider)." },
    { slug: "list-the-products-ordered-in-a-period", why: "Seat volume per comfort tier inside a month window with the date cast — the February read dispatch runs before staffing the month spine." },
  ],
};
