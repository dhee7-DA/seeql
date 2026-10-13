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
    "Preparation strategy: BlaBlaCar has **0 tagged LC** rows in this app's pool, so the kit is **theme-curated** — all 30 topic slugs and 16 problems are hand-picked from the theme menu to mirror carpool screens: publish-to-book funnels, seat pairing, check-in lead time, no-show bands, month spines, payout AR. Then run both case studies on the live db: one rebuilds the {amber:booking-month no-show pivot} the trust review reads, the other rebuilds the {sky:payout coverage board} the settlement desk closes the month with. The bar to clear: name the grain, state the denominator, and gate the NULLs deliberately before you compute anything.",
  ],

  dayInLife: [
    "**08:15 —** The day opens on the seat board: overnight bookings versus check-ins — 82 of 103 stamped — and the first query is the one-pass corridor census, one scan per city cluster: bookings, checked-in, no-shows, fare volume in a single GROUP BY. The numbers must reconcile before the standup: checked-in arms sum to 52, awaiting to 14, no-shows to 7, and the seat-line fan-out (251 lines under 103 bookings) says whether yesterday's published rides actually sold. A drift here is the day's first fire, and the analyst who can write the census *and* the diff against yesterday's fold owns the incident.",
    "**11:00 —** Midday is lead-time deep-work. The ops lead wants the {sky:check-in window} by corridor — JULIANDAY lag over the 82 stamped bookings, awaiting bookings gated out with a stated NULL policy, APAC's 2.93 benchmarked against LATAM's 3.5 — and the trust lead wants the same fold as a no-show band: cancelled ÷ booked per cluster (3 of 45 in EU, 3 of 37 in APAC, 1 of 19 in US) with the denominators printed beside every share. A seat-inventory question lands mid-block: which corridors run published rides tight enough that seat lines per booking climbs — the join-fan-out read that turns 251 lines into a load factor rather than a bug report.",
    "**16:00 —** The afternoon is the payout cycle, and it ends the day. The settlement desk walks the books — 28 `invoices`, INTEGER cents read as dollars — then the coverage fold: 21 claims settled exactly ($65,612.00), 6 never-collected ($15,217.00), 1 partial at 4,000.00 of 6,148.00, with #28 — the 1,756.00 claim {rose:marked paid with zero settlement rows} — queued beside its mirror, #11, {rose:void-but-paid} at 925.00, and five split-settlement claims reconciling tranche by tranche. Driver-cohort share gets one query — the top cohort carries 32% of billed volume — and the writeup ships with census reconciliations printed, denominators named, *every funnel number legible at the grain it claims*.",
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
  ],

  topics: [
    {
      name: "Publish-to-book funnels",
      why: "Every corridor review opens with the funnel: bookings published, checked-in, en route, awaiting, no-show — counted per cluster without letting the seat-line fan-out double anything. BlaBlaCar drills which grain the query stands on before any aggregate runs, because a rate computed at seat-line grain prices a seat, not a booking.",
      slugs: ["percentage-of-users-attended-a-contest", "immediate-food-delivery-ii", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "One-pass conditional folds",
      why: "The census runs every morning, so it runs in ONE scan: SUM(CASE WHEN …) arms per status with branch totals that reconcile back to COUNT(*). BlaBlaCar treats the fold as standing infrastructure — four scans cost four table reads where one conditional fold costs one, and one fold guarantees every arm describes the same 103 bookings.",
      slugs: ["active-businesses", "find-stores-with-inventory-imbalance", "find-books-with-polarized-opinions"],
    },
    {
      name: "Check-in windows & lead time",
      why: "The lead-time conversation is date arithmetic: JULIANDAY(check-in) - JULIANDAY(booking) over the 82 stamped bookings, grouped by corridor. BlaBlaCar drills the NULL gate (an unstamped booking has no lead time, not zero lead time) and the framing that keeps 2.98 days honest — lead time, not ride duration.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Seat inventory & capacity pairing",
      why: "Carpooling is capacity math: seats against bookings, adjacent seats for pairs, a car that fills or doesn't. Self-joins on contiguous availability and running-capacity windows are the screen's physical layer — the shapes behind 'can this published ride absorb tonight's demand?'",
      slugs: ["consecutive-available-seats", "last-person-to-fit-in-the-bus", "exchange-seats"],
    },
    {
      name: "No-show bands & CASE tiers",
      why: "Trust reporting is a CASE over behavior bands — checked-in, awaiting, no-show — and the arms carry contracts: the awaiting arm fires BEFORE any lag comparison, the ELSE is exhaustive by design, and the boundary booking lands where the spec says it lands.",
      slugs: ["the-category-of-each-member-in-the-store", "weather-type-in-each-country", "calculate-special-bonus"],
    },
    {
      name: "Corridor leaderboards",
      why: "Rank corridors or drivers by fare volume and ties are waiting — this ledger ties at 4, 3 and 2. BlaBlaCar drills the rank trio because 'do tied corridors share a rung?' is a policy the review defends, and LIMIT-OFFSET habits break silently on it.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Month spines & trend reads",
      why: "Service reviews run on the calendar: bookings per month on the 2024-01..2025-02 spine (14 buckets), the 1,193.86 July trough against the 3,731.97 January open. '%Y-%m' builds the spine, half-open windows cut quarters without losing the boundary night.",
      slugs: ["monthly-transactions-i", "hopper-company-queries-i", "unique-orders-and-customers-per-month"],
    },
    {
      name: "Rates with honest denominators",
      why: "Checked-in shares, no-show percentages, load factors — BlaBlaCar's ratios punish integer division and quiet denominator drift. The house habit: 100.0 before the division, the denominator's population decided BEFORE the ratio, rounding only at the very end.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "hopper-company-queries-ii"],
    },
    {
      name: "Manifest folds & GROUP_CONCAT",
      why: "A published ride's manifest is rows: which riders, which pickup points, in what order. GROUP_CONCAT folds the manifest into one cell per booking — the roster read the driver's app shows — and drills the separator/ordering discipline that keeps a folded string readable.",
      slugs: ["group-sold-products-by-the-date", "find-cities-in-each-state", "concatenate-the-name-and-the-profession"],
    },
    {
      name: "Settlement & cents discipline",
      why: "Rider billing and driver payouts live in INTEGER cents: every dollar read is amount_cents / 100.0, and the missing .0 floors every odd-cent claim. The reconciliation culture is row-level: 6 unsettled claims (15,217.00), one void-but-paid (925.00), one paid with zero settlement rows (1,756.00).",
      slugs: ["bank-account-summary-ii", "customer-order-frequency", "generate-the-invoice"],
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
  ],
};
