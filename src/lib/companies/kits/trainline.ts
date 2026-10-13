// Trainline — kit 14 of the Travel & Hospitality domain (Batch L, wave 7).
// Rail-ticketing angle: route popularity, advance-vs-walkup fare mixes,
// journey-state funnels, delay-repay refund ops. Pool provenance: Trainline
// has NO registry tags in this app's pools — 0 tagged LC — theme-curated:
// every topic and problem slug comes from scripts/company-pools.md's theme
// menu, mirroring the workflows Trainline screens are known to probe
// (corridor demand folds, fare-band CASE rolls, pace walks, settlement
// coverage, refund anti-joins). Case studies run on the storefront db with
// probed figures from scripts/company-facts.md — mapped honestly as
// orders=journey bookings, order_items=segments/fare lines, products=fare
// types, customers=travelers, suppliers=rail operators, shipped_at=travel
// completion stamp, region=market region.

import type { CompanyKit } from "../types";

export const trainlineKit: CompanyKit = {
  id: "trainline",
  domainId: "travel",
  name: "Trainline",
  tagline: "UK/EU rail ticketing: routes, fares, platforms",
  accent: "text-teal-200",

  brief: [
    "**Trainline** is the UK/EU rail ticketing platform — the app that prices one journey across operators, fares and departure platforms in a single search, and sells {emerald:Advance} against walk-up in the same basket. In this app's training db the mapping is honest: `orders` are journey bookings (a priced reservation across the network), order_items are the segments and fare lines, products are fare types, and shipped_at is the travel completion stamp. Probed scale: **103 bookings worth 34833.28** carrying 251 segments across 16 fare types and 6 rail operators — about 2.4 legs per booking, which is the multi-leg journey story in one ratio.",
    "The data org is network-shaped. The route team owns the corridor fold — demand per route family: the widest-riding corridor touches **54 of 103** bookings while the richest books **11744.01** on 46, and every deck prints both, because busiest and richest are different corridors. The ops team owns the journey-state funnel — {emerald:completed} 52, en-route 30, 14 awaiting travel, 7 {rose:refunded-out} — and the settlement desk moves operator money as integer cents across 28 invoices and 27 payment legs, where *every dollar read divides by 100.0 and the anomalies are named, not averaged away*.",
    "The SQL screens are live-db and grain-ruthless. You will be asked for a route-popularity read — legs, value and distinct bookings per corridor — and the trap is the fan-out: 251 segments fold through the join until `COUNT(*)` counts legs and calls them bookings. You will be asked for an advance-versus-walkup fare ladder and the trap is honesty: the fare ceiling sits at **199.99**, so a 200-plus premium band returns **zero rows** — say so, don't round the ceiling up. Anti-join drills on travelers and fare types return zero too: every traveler and every fare type has transacted on this db.",
    "Prep the way the screens run: conditional folds and `COUNT(DISTINCT …)` until a corridor census is one query with the denominator printed; joins plus aggregates until per-booking and per-operator reads survive the fan-out; window ranks for the league boards; julianday for the **2.98-day** average booking-to-travel lead; month buckets via `SUBSTR(created_at, 1, 7)` across 2024-01 to 2025-02. Then rehearse the two sentences the interviewer grades: *a segment is a leg, a booking is a PNR — and route popularity, fare mix and refund exposure are three different folds over the same rows*.",
  ],

  dayInLife: [
    "**07:40 —** Network board first: the overnight journey census — 103 booked, **82** stamped complete-or-en-route, 14 {amber:awaiting-travel}, 7 {rose:refunded-out} — with the pace curve beside it (9-booking peaks in 2024-02 and 2024-09). *The completion share prints next to its denominator or the trading lead sends it back.* The delay-repay queue opens with one flag: a {rose:void} operator bill that already carries a 925 settlement leg.",
    "**11:30 —** Deep work: the route-popularity board. Fold segments to corridor grain — `COUNT(DISTINCT oi.order_id)` per corridor — and the ladder lands widest-first at 54, 46, 40, 30, 23, 22, 13 bookings, with value beside it because the richest corridor (**11744.01** on 46) is not the widest. The fare-band ladder runs next: 8 budget fare types under 50, 8 standard between 50 and 200, and the 200-plus arm **empty by construction** — the deck says so out loud.",
    "**16:20 —** Stakeholder moment: the operator settlement read for the rail-partner call — card legs **16 payments worth 37364** against wire legs **11 worth 32248**, one partial book sitting 4000-paid of a 6148 bill, and one settled book with no payment leg at all (1756). *Small markets get flagged, not hidden:* the two-booking market's 426.22 average reads fat on a base of two. The EOD note ships with definitions attached — lead time as julianday on the **82** stamped journeys (2.98 days), refunds as status, not sentiment — and goes out with its denominators.",
  ],

  metrics: [
    { name: "Segments per booking", what: "Segment and fare lines over journey bookings — 251 over 103, about 2.4. The multi-leg proxy: how many legs the average reservation carries, folded without calling legs bookings." },
    { name: "Journey completion share", what: "Bookings with a travel completion stamp over all bookings — 82 of 103, 79.6%. The state-free read that keeps awaiting-travel and refunded-out in the denominator where they belong." },
    { name: "Booking-to-travel lead", what: "julianday(travel) minus julianday(booking) on the 82 stamped bookings — 2.98 days average, range 2 to 4. The advance-purchase window an upsell or a seat nudge actually has." },
    { name: "Refund share", what: "Cancelled bookings over all bookings — 6.8% network, 8.1% in the worst market against 5.3% in the best. Every Delay Repay forecast carries this haircut before claims are costed." },
    { name: "Average basket", what: "Mean booking total — 338.19 network, 383.48 in the richest market (19 bookings), 335.32 in the busiest (45). Fare-mix shifts show up here before they reach the margin calls." },
    { name: "Traveler concentration", what: "Share of demand from travelers above a lifetime threshold — 63.5% from the 3000-plus cohort. Even an app for everyone has commuters who carry the book." },
    { name: "Settlement coverage", what: "Operator bills classified exact, partial or none against their payment legs — 21 exact, 1 partial (4000 of 6148), 6 with no settlement at all (15217 cents). Partner ops reads this before the tie-out." },
    { name: "Fare ceiling", what: "The fare ladder tops out at 199.99 — the 200-plus premium band is empty by construction, 8 budget fare types under 50 against 8 standard between 50 and 200. Honesty about the ceiling is itself a screen." },
  ],

  topics: [
    {
      name: "Corridor demand folds",
      why: "Route popularity is a join-plus-aggregate fold at corridor grain: legs, value and DISTINCT bookings per route — one pass over 251 segments. The drills are per-route demand folds; the graded part is stating whether a number counts legs, fare types or bookings.",
      slugs: ["product-sales-analysis-ii", "sales-analysis-i", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "Fare-state CASE rolls",
      why: "Advance, off-peak, walk-up — every fare read is a CASE roll classifying rows or folded groups, then counting or bucketing them. Conditional-classification drills are the exact shape; the graded part is mutually exclusive arms in the right order.",
      slugs: ["calculate-special-bonus", "weather-type-in-each-country", "count-salary-categories"],
    },
    {
      name: "Month-over-month pace walks",
      why: "The trading pack reads momentum, not levels: bookings minus LAG(bookings) per month, first row NULL as data. LAG-flag and window-between drills are the exact machinery behind the pace walk and the gap-to-next-journey reads.",
      slugs: ["consecutive-transactions-with-increasing-amounts", "biggest-window-between-events", "find-consistently-improving-employees"],
    },
    {
      name: "Operator settlement ledgers",
      why: "Operator money moves as integer cents across 28 bills and 27 legs; coverage is every invoice LEFT JOIN its payments, classified exact, partial or none. LEFT JOIN folds with a zero arm are the drill — 6 books here settle nothing at all.",
      slugs: ["bank-account-summary", "combine-two-tables", "count-student-number-in-departments"],
    },
    {
      name: "Unsettled-book anti-joins",
      why: "The refund worklist is the anti-join: bills with no payment leg, partners with no moved demand. On this db the invoice-side worklist runs 6 books, while traveler- and fare-type anti-joins return zero — knowing when zero is the true answer is part of the drill.",
      slugs: ["sellers-with-no-sales", "customer-who-visited-but-did-not-transact", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Journey-state shares",
      why: "Completion and refund shares are ratios over stated denominators — 82 of 103, 7 of 103 — with the 100.0 before the slash. Ratio drills with the base printed beside them train the exact habit the trading pack grades.",
      slugs: ["number-of-rich-customers", "queries-quality-and-percentage", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Pace buckets by month",
      why: "Booking pace lives in 'YYYY-MM' buckets — 14 of them from 2024-01 (8 bookings, 3731.97) to 2025-02. Date-bucket folds that keep the whole window in the denominator are the pace-pack staples; bucketing the raw timestamp prints 103 rows of one.",
      slugs: ["monthly-transactions-i", "unique-orders-and-customers-per-month", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "League boards & rank ties",
      why: "Operator and corridor leagues are window ranks over folded aggregates — and the ties are real: three corridors hold three fare types each, three hold two. RANK with the skip, DENSE_RANK without, ROW_NUMBER arbitrary; the board states its tie policy.",
      slugs: ["rank-scores", "top-earners", "second-most-recent-activity"],
    },
    {
      name: "Fare-ladder tiles & histograms",
      why: "The fare ladder is read as distributions: budget under 50, standard 50 to 200, premium empty — then value histograms and bar-chart buckets per market. Histogram and bar-chart drills are how the fare-mix slide gets built honestly.",
      slugs: ["spend-histogram", "create-a-session-bar-chart", "ratings-histogram"],
    },
    {
      name: "Booking clocks & lead windows",
      why: "Booking-to-travel is julianday math over the 82 stamped journeys only — 2.98 days average, 2 to 4 — and the 21 unstamped rows must NULL out, not fabricate. Process-latency and date-offset drills are the clock's toolkit.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "users-that-actively-request-confirmation-messages"],
    },
  ],

  theory: [
    {
      id: "trainline-t1",
      q: "Your corridor read joins bookings to their segments and the booking count explodes. What happened and what's the fix?",
      a: "The join fanned out: 103 bookings carry 251 segments, so joining to segment rows multiplies bookings and COUNT(*) counts legs, not reservations. The fix is grain honesty — fold segments to booking level in a CTE and join up, or keep the fan-out and fold with COUNT(DISTINCT oi.order_id). I say the three counts out loud on any network read: segments (251), bookings (103), travelers (16 on this db) — and the one the slide claims must match the fold actually written. On a rail deck a leg and a PNR are different units; a route-popularity number built on the wrong grain isn't slightly off, it's a different metric wearing the right name.",
      tag: "joins",
    },
    {
      id: "trainline-t2",
      q: "The corridor league ranks fare types held, and three corridors tie at the top. How do you make the tie a decision instead of an accident?",
      a: "Pick the window function by its tie policy and state it: ROW_NUMBER breaks ties arbitrarily — the league looks precise and is actually ordered by rowid. RANK gives tied corridors the same rung and skips consumed slots — on this db the fare counts run 3,3,3,2,2,2,1 and RANK prints 1,1,1,4,4,4,7, honest about how many corridors sit above. DENSE_RANK numbers rungs consecutively (1,1,1,2,2,2,4) and hides how deep the tie was. On a league board I ship RANK with a deterministic tiebreaker (corridor id), and if the tie itself matters — corridors holding the same shelf of fare types — I surface the tie as a column, because 'tied' is a fact the route team will act on, not noise to hide behind an arbitrary integer.",
      tag: "windows",
    },
    {
      id: "trainline-t3",
      q: "Write the journey-state census in one query: booked, completed, en-route, awaiting travel, refunded-out, share. Where do candidates go wrong?",
      a: "One pass with conditional folds: COUNT(*) AS booked, COUNT(*) FILTER (WHERE status = 'delivered') AS completed, COUNT(*) FILTER (WHERE status = 'shipped') AS en_route, COUNT(*) FILTER (WHERE status = 'pending') AS awaiting_travel, COUNT(*) FILTER (WHERE status = 'cancelled') AS refunded_out — 103, 52, 30, 14, 7 on this db — and ROUND(100.0 * (completed + en_route) / COUNT(*), 1) prints 79.6. The classic failure is a WHERE clause: filtering refunded-out 'to keep it clean' shrinks the base to 96 and prints a share the network never earned; the second is integer division, where 100 * 82/103 truncates because the 100.0 entered after the slash. Every booking sits in exactly one state and all of them stay in the denominator — that is the whole definition.",
      tag: "aggregation",
    },
    {
      id: "trainline-t4",
      q: "shipped_at — the travel completion stamp — is NULL on 21 bookings. What does that NULL mean here, and how should queries treat it?",
      a: "On this mapping the NULL is a business state: travel hasn't completed — 14 bookings awaiting travel in the booking window and 7 refunded-out, 21 total. Treating it as dirty data is the cardinal error: filling it with today's date fabricates journeys, excluding those rows from a market read shrinks the denominator and flatters every share. The honest tools are state-based: COUNT(shipped_at) rides the NULL-blindness for the traveled numerator (82), shipped_at IS NULL splits the not-traveled arm into awaiting versus refunded by joining on status, and julianday lead math over NULL rows NULLs them — correct, because a booking that never traveled has no lead. NULL here is information; the queries should read it, not repair it.",
      tag: "nulls",
    },
    {
      id: "trainline-t5",
      q: "Where do WHERE and HAVING each belong in the fare-band ladder, and why does mixing them up matter?",
      a: "WHERE filters rows before the fold: market slices, date windows, 'bookings created this month'. HAVING filters groups after the fold: corridors riding at least 10 bookings, fare bands clearing a value floor. The pipeline order is FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY, and the two are not interchangeable — WHERE COUNT(*) fails because the fold doesn't exist yet, and pushing a row filter into HAVING folds data you then throw away. On the fare ladder the difference is visible: gate the thin corridors in HAVING so a 13-booking corridor can't top a board on sample size, and keep the market slice in WHERE so the fold only ever saw the rows that mattered.",
      tag: "pipeline",
    },
    {
      id: "trainline-t6",
      q: "Pricing wants corridors whose average basket beats the network average of 338.19. Subquery, window, or CTE?",
      a: "All three are honest; the definition's weight picks one. A scalar subquery — HAVING the corridor's AVG(total) > (SELECT AVG(total) FROM orders) — is the compact benchmark read: the network basket is 338.19, and at market grain the 383.48 market clears it while the busiest market's 335.32 doesn't. A windowed fold, AVG over the global partition, keeps every corridor in the result with its premium visible, which is what the deck wants. A CTE earns its place when 'basket value' needs a definition — fees netted, refunded-out bookings excluded — because a named two-stage fold survives review and a nested one-liner doesn't. What's not negotiable: the benchmark and the corridors must fold on the same grain, or the comparison is segments against bookings.",
      tag: "subqueries",
    },
    {
      id: "trainline-t7",
      q: "Two date reads every week: booking pace by month and the booking-to-travel lead by market. What machinery does each need?",
      a: "Pace is bucketing: SUBSTR(created_at, 1, 7) makes a '2024-01' month key that GROUP BY folds and sorts correctly — the 14-bucket trend from 2024-01 (8 bookings, 3731.97) through 2025-02 (7, 2390.53), with 9-booking peaks in 2024-02 and 2024-09. The lead is instant math: julianday(shipped_at) - julianday(created_at) on the 82 stamped bookings, averaged to 2.98 days with the 2-to-4 range quoted — and by market the latencies split 3.07, 2.94, 2.93, 3.5, small markets flagged. The traps I name out loud: bucketing the raw timestamp gives one row per booking; julianday over NULL completions NULLs those rows, which is the definition and not a bug; and the round happens once at the edge so the deck, the query and the audit all print the same number.",
      tag: "dates",
    },
    {
      id: "trainline-t8",
      q: "Finance found a void operator bill carrying a settlement leg, and one bill sits 4000-paid of 6148. How do you keep settlement anomalies from poisoning the partner read?",
      a: "Cross-examine states against evidence, and keep the cents discipline. Conditional counts that pair invoice status with payment rows surface the void-but-paid bill (925 on this db) and the paid-with-no-payments case (1756) before the tie-out; a coverage CASE — exact, partial when SUM(payments) < amount, none when no payment rows exist — classifies the 4000-of-6148 book honestly instead of letting one leg read as settled, and 5 of the 28 bills settle across two legs, so counting legs instead of summing amounts misstates coverage. And every dollar figure divides by 100.0, because invoices, payments, expenses and ledger rows are INTEGER cents. The habit being graded: row counts are claims, keys and evidence are truth, and a partner read shipped from a reconciled base is the only one worth defending.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "trainline-mcq-1",
      prompt: "Journey census. Which fragment counts COMPLETED journeys only — the 52?",
      choices: [
        "COUNT(*)",
        "COUNT(shipped_at)",
        "COUNT(*) FILTER (WHERE status = 'delivered')",
        "COUNT(DISTINCT status)",
      ],
      answer: 2,
      why: "The FILTER counts only rows in the completed state — 52. COUNT(*) is all 103 bookings, COUNT(shipped_at) is 82 (completion stamps ride on en-route journeys too), and COUNT(DISTINCT status) counts states, not journeys.",
      notes: [
        { choice: 1, why: "82 = 52 completed + 30 en-route — both carry the stamp. The completion stamp marks travel underway-or-done, not arrival; only the state filter isolates completed." },
        { choice: 0, why: "All 103 bookings — refunded-out and awaiting-travel included. The census would read every reservation as a completed journey." },
      ],
      difficulty: "easy",
    },
    {
      id: "trainline-mcq-2",
      prompt: "The booking-to-travel lead averages 2.98 days. What does AVG(julianday(shipped_at) - julianday(created_at)) do with the 21 bookings that carry no completion stamp?",
      choices: [
        "Counts them as 0-day leads",
        "NULLs their rows and averages over the 82 stamped bookings — 2.98, which is correct",
        "Crashes with a type error",
        "Defaults them to today's date via SQLite",
      ],
      answer: 1,
      why: "julianday(NULL) is NULL, the difference is NULL, and AVG skips NULLs — the average lands on the 82 bookings that actually traveled: 2.98 days, range 2 to 4. A booking that never ran has no lead; fabricating one would flatter the number.",
      notes: [
        { choice: 0, why: "Coalescing NULL leads to 0 invents same-day turnarounds for 14 awaiting and 7 refunded-out bookings — the lead collapses and the upsell window reads far shorter than it is." },
        { choice: 2, why: "No crash — NULLs flow through arithmetic silently. The trap is believing you must intervene; the NULL-blind aggregate already did the right thing." },
      ],
      difficulty: "easy",
    },
    {
      id: "trainline-mcq-3",
      prompt: "Booking pace by month for the trading pack. The GROUP BY key is:",
      choices: [
        "created_at (raw timestamp)",
        "SUBSTR(created_at, 1, 4)",
        "SUBSTR(created_at, 1, 7)",
        "shipped_at bucketed in the deck",
      ],
      answer: 2,
      why: "SUBSTR(created_at, 1, 7) builds the '2024-01' year-month key — 14 buckets from 2024-01 (8 bookings, 3731.97) to 2025-02 — that sorts correctly as text and folds the whole window. Pace is booked on the booking date, not the travel date.",
      notes: [
        { choice: 0, why: "The raw timestamp gives one group per booking — 103 rows of one. Pace needs a derived bucket key, not the raw instant." },
        { choice: 1, why: "A 4-char key collapses the window to two rows: 2024 and 2025. The seasonality story — 9-booking peaks in 2024-02 and 2024-09 — needs the month in the key." },
      ],
      difficulty: "easy",
    },
    {
      id: "trainline-mcq-4",
      prompt: "The fare-band ladder: the exec deck claims a premium band at 200 and above. What does the fare list actually return?",
      choices: [
        "8 fare types — the mid band",
        "2 — the 199.99 and 149.99 flagships",
        "16 — the whole fare list, rounded up",
        "0 — the fare ladder tops out at 199.99, so the premium band is empty by construction",
      ],
      answer: 3,
      why: "The fare ceiling is 199.99 — WHERE price >= 200 returns zero rows. The honest deck prints the empty band and says so; the ladder runs 8 budget fare types under 50 against 8 standard between 50 and 200.",
      notes: [
        { choice: 0, why: "That's the 50-to-200 standard band — 8 fare types, average 111.5. A different band wearing the premium name." },
        { choice: 1, why: "199.99 is BELOW 200. Rounding the ceiling into the band is a definition change — the gate is the gate, and the deck prints the threshold beside the count." },
      ],
      difficulty: "medium",
    },
    {
      id: "trainline-mcq-5",
      prompt: "Refund worklist: settlement books with NO payment leg. Which shape finds the 6 outstanding books (15217 cents = 152.17)?",
      choices: [
        "INNER JOIN invoices to payments and filter status",
        "invoices LEFT JOIN payments … WHERE payments.invoice_id IS NULL",
        "COUNT(*) FROM payments GROUP BY invoice_id",
        "WHERE invoices.amount > 0",
      ],
      answer: 1,
      why: "The anti-join shape: LEFT JOIN keeps every bill, and IS NULL on the payment key keeps only the unmatched — 6 books totaling 15217 cents of refund exposure. INNER JOIN hides the exact rows you're hunting.",
      notes: [
        { choice: 0, why: "An INNER JOIN to payments can only return bills that HAVE legs — the unpaid 6 vanish from the result before any filter runs." },
        { choice: 2, why: "Counting legs per bill describes the settled side only; bills with zero payment rows don't appear in a GROUP BY over payments at all." },
      ],
      difficulty: "medium",
    },
    {
      id: "trainline-mcq-6",
      prompt: "Refund share by market = refunded-out journeys over all bookings. Which expression prints 6.8 network-wide without integer truncation?",
      choices: [
        "100 * SUM(cancelled) / COUNT(*)",
        "SUM(cancelled) / COUNT(*) — multiply by 100 in the deck",
        "CAST(SUM(cancelled) / COUNT(*) AS REAL) * 100",
        "100.0 * SUM(cancelled) / COUNT(*)",
      ],
      answer: 3,
      why: "The 100.0 promotes the fold to real arithmetic BEFORE the division — 7 over 103 prints 6.8. Integer division happens first in every other option and truncates at the slash.",
      notes: [
        { choice: 0, why: "7/103 in integer arithmetic floors to 0; times 100 stays 0. The .0 must enter before the slash, not after." },
        { choice: 2, why: "The cast happens after the integer division has already floored. Real-promotion must precede the slash — the cast decorates a truncated number." },
      ],
      difficulty: "medium",
    },
    {
      id: "trainline-mcq-7",
      prompt: "The corridor league ranks fare types held: the counts run 3,3,3,2,2,2,1. What does RANK() OVER (ORDER BY fare_count DESC) print?",
      choices: [
        "1,2,3,4,5,6,7 — no shared rungs",
        "1,1,1,2,2,2,4 — consecutive rungs, no skip",
        "1,1,1,4,4,4,7 — ties share, next skips by tie size",
        "7,7,7,5,5,5,1 — ties take the last slot",
      ],
      answer: 2,
      why: "RANK ties share the rung and the next rank jumps past the whole tie block: three corridors tie at 1, the three 2s land at 1 + 3 = 4, and the single 1 lands at 4 + 3 = 7. ROW_NUMBER would print 1..7 arbitrarily; DENSE_RANK would print 1,1,1,2,2,2,4.",
      notes: [
        { choice: 1, why: "That's DENSE_RANK — consecutive rungs that hide how deep the tie was. Defensible convention; not what RANK does." },
        { choice: 0, why: "That's ROW_NUMBER — arbitrary distinct ranks inside each tie. The league would show one corridor 'ahead' for no reason at all." },
      ],
      difficulty: "medium",
    },
    {
      id: "trainline-mcq-8",
      prompt: "The pace walk: bookings - LAG(bookings) OVER (ORDER BY month). What does the 2024-01 row print, and what belongs in the deck?",
      choices: [
        "0 — the walk starts flat",
        "-8 — the walk wraps to the last month",
        "NULL — there is no previous month; the deck prints it as the walk's open, not as a zero",
        "The query errors on the first row",
      ],
      answer: 2,
      why: "LAG has no row before the first bucket — the difference is NULL, and the honest pack prints the walk's open as NULL. 2024-02 is the first real delta: +1 (9 versus 8), and the swings of ±2 land in 2024-07, 2024-09, 2024-06 and 2024-10.",
      notes: [
        { choice: 0, why: "Coalescing the open to 0 invents a flat start — the walk then reads 2024-01 as 'no change' instead of 'no reference', which misleads the momentum call." },
        { choice: 2, why: "No wrap and no error — LAG simply has nothing to look at. NULL-as-data is the correct read; the 13 real deltas follow." },
      ],
      difficulty: "hard",
    },
    {
      id: "trainline-mcq-9",
      prompt: "The open-refund exposure reads 19609 in the settlement ledger. The dollar figure the deck prints is:",
      choices: [
        "19609.00 — the ledger stores dollars",
        "1960.90 — divide by 10",
        "1.9609 — divide by 10000",
        "196.09 — ledger money is INTEGER cents, divide by 100.0",
      ],
      answer: 3,
      why: "Invoices, payments, expenses and ledger rows are INTEGER cents on this db — 19609 cents is 196.09 dollars after 19609 / 100.0. Orders.total and unit_price are the only dollar-valued columns.",
      notes: [
        { choice: 0, why: "That's the classic hundred-fold overstatement — printing cents as dollars. Every settlement slide sourced from invoices/payments needs the /100.0." },
        { choice: 1, why: "Dividing by 10 has no basis in the schema — the unit is cents, so the divisor is 100.0, and the ROUND happens once at the edge." },
      ],
      difficulty: "hard",
    },
    {
      id: "trainline-mcq-10",
      prompt: "The operator board joins rail operators → fare types → segments and ranks by COUNT(*). The top operator shows several times its true journey count. What happened?",
      choices: [
        "The operator really moved that many journeys — ship it",
        "COUNT(*) auto-deduplicates joined rows",
        "The join fanned out: COUNT(*) counts segment lines; fold with COUNT(DISTINCT oi.order_id) or stage per-booking first",
        "The rank should be SUM(o.id) instead",
      ],
      answer: 2,
      why: "On the three-table grain, COUNT(*) counts SEGMENTS — 251 lines over 103 bookings network-wide — not journeys. The board must fold back through the fan-out (COUNT(DISTINCT oi.order_id)) or stage segments-per-booking in a CTE before ranking.",
      notes: [
        { choice: 0, why: "That's how a long-route operator gets reported as a volume whale — two different operators. The partner team would reward the fattest itinerary mix, not the busiest platform." },
        { choice: 3, why: "SUM over an id column adds id VALUES — a number that grows with id assignment. Aggregating an id is always a smell, never a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-trainline-1",
      tier: "hard",
      topic: "t7",
      universe: "funnel",
      title: "The booking-pace walk",
      brief:
        "Trainline-flavored brief on the storefront db (orders = journey bookings, shipped_at = travel completion stamp): the weekly trading pack opens with the pace walk — bookings and booking value per calendar month, plus the month-over-month delta — so the trading lead sees momentum, not just levels. Probed on the db: 14 month buckets from 2024-01 (8 bookings, 3731.97) to 2025-02 (7, 2390.53); 2024-02 prints the first real delta, +1 (9 versus 8); the peaks sit at 9 bookings (2024-02 and 2024-09) and the biggest swings run ±2 — up in 2024-07 and 2024-09, down in 2024-06 and 2024-10. The walk's first row carries no previous month: its delta is NULL, and the pack prints that as the walk's open, not as a zero.",
      ask: "Return per booking month: bookings, booking value (2dp) and the delta versus the previous month — calendar order, first delta NULL.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(o.created_at, 1, {1}) AS month,\n         COUNT(*) AS bookings,\n         ROUND(SUM(o.total), {2}) AS value\n  FROM orders o\n  GROUP BY month\n)\nSELECT month,\n       bookings,\n       value,\n       bookings - {3}(bookings) OVER (ORDER BY month) AS delta\nFROM monthly\nORDER BY month {4};",
      slots: [
        {
          answer: "7",
          kind: "number",
          label: "the bucket width",
          noVerify: true,
          why: "SUBSTR(created_at, 1, 7) is the 'YYYY-MM' key — 14 buckets that sort correctly as text. A width of 4 collapses the window to two year-rows; a width of 1 buckets the whole network into a single '2'.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          noVerify: true,
          why: "Booking value prints to 2dp — 3731.97, 3609.64, 2390.53 — the shape every money cell in the trading pack carries. ROUND to 0 publishes 3732 and 3610, numbers no other slide shows.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the walk direction",
          why: "Momentum looks BACK one bucket: bookings - LAG(bookings) is this month versus last — 2024-02 prints +1. LEAD looks forward and flips every delta's sign into a backwards walk that ends on a NULL.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the calendar order",
          why: "The walk reads calendar-wise: 2024-01 first with its NULL open, 2025-02 last. DESC would read the year right-to-left and open the pack on the newest month.",
        },
      ],
      distractors: ["1", "0", "LEAD", "DESC"],
      walkthrough:
        "A staged walk where the CTE builds the pace and the window builds the momentum. SUBSTR(created_at, 1, 7) folds 103 bookings into 14 'YYYY-MM' buckets — 8 and 3731.97 open the window, 9 and 3609.64 follow; LAG(bookings) OVER (ORDER BY month) looks one bucket back, so bookings minus that is the delta: 2024-02 prints +1, and the ±2 swings land up in 2024-07 and 2024-09 and down in 2024-06 and 2024-10. The first row has no previous bucket — its delta is NULL by construction, and the honest pack prints the open rather than coalescing a fake 0. The distractors each bend the walk: a 1- or 0-wide SUBSTR key collapses 14 months into one bucket, ROUND to 0 or 1 republishes the money column at a precision no other slide carries, LEAD flips every delta into a backwards walk, and DESC reads the year right-to-left. Bucket on the booking date, walk forwards, keep the NULL open.",
    },
    {
      id: "cs-trainline-2",
      tier: "medium",
      topic: "s7",
      universe: "refund-audit",
      title: "The refund-exposure matrix",
      brief:
        "Trainline-flavored brief on the storefront db (orders = journey bookings, customers = travelers, region = market region): the delay-repay review wants the refund-exposure matrix — per market, the journey-state split (completed, en-route, awaiting-travel, refunded-out) plus the refund share — so the ops lead sees where cancellations and their Delay Repay claims cluster. Probed on the db: EU runs 45 bookings — 24 completed, 12 en-route, 6 awaiting, 3 refunded; APAC 37 — 21, 8, 5, 3; US 19 — 5, 10, 3, 1; the two-booking market is 2 completed and nothing else. Refund share by market: APAC 8.1% (worst), EU 6.7%, US 5.3%, the small market 0.0 — EU and APAC carry three refunds each, but APAC's share is worse on a smaller base.",
      ask: "Return per market: bookings, the four journey states and the refund share (1dp) — heaviest refund count first, bookings as the tiebreak.",
      template:
        "SELECT c.{1} AS market,\n       COUNT(*) AS bookings,\n       SUM(CASE WHEN o.status = '{2}' THEN 1 ELSE 0 END) AS completed,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS en_route,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS awaiting_travel,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS refund_out,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), {3}) AS cancel_pct\nFROM orders o\nJOIN customers c ON c.id = o.{4}\nGROUP BY market\nORDER BY refund_out {5}, bookings DESC;",
      slots: [
        {
          answer: "region",
          kind: "keyword",
          label: "the market key",
          why: "Markets are regions: c.region folds 103 bookings into four market rows. c.city would re-grain the matrix into sixteen cities — a station list wearing a market-board's name.",
        },
        {
          answer: "delivered",
          kind: "keyword",
          label: "the completed arm",
          why: "Completed journeys are status 'delivered' — 24, 21, 5, 2 per market. 'shipped' is the en-route state; re-pointing the arm there makes the completed column a copy of en_route and the matrix double-counts the mid-journey base.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          noVerify: true,
          why: "Refund share prints to 1dp — 6.7, 8.1, 5.3, 0.0 — matching every rate cell in the ops pack. ROUND to 0 flattens 8.1 into 8 and EU's 6.7 into 7, numbers no other slide carries.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the traveler key",
          why: "Bookings reach travelers through c.id = o.customer_id. Joining on o.id pairs booking ids with traveler ids by coincidence of numbering — four phantom 'markets' with counts that match nothing.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the exposure order",
          why: "The review reads heaviest exposure first: EU 3, APAC 3 (tie broken by 45 bookings over 37), US 1, small market 0. ASC would open on the empty row and frame the meeting backwards.",
        },
      ],
      distractors: ["city", "shipped", "id", "0", "ASC"],
      walkthrough:
        "A conditional pivot where the CASE arms are the columns. The join rides traveler → market; GROUP BY market folds 103 bookings into four rows; each SUM(CASE …) claims one journey state — EU's row reads 45, 24, 12, 6, 3 and APAC's 37, 21, 8, 5, 3 — and the share divides the refunded arm by the row's base with the 100.0 before the slash: 6.7, 8.1, 5.3, 0.0. APAC tops the share on a smaller base while EU tops the count — count and rate disagree, and the matrix shows both. The two-booking market has no refunds: its 0.0 is absence of refunds, not absence of risk. The distractors each break an arm: city re-grains four markets into sixteen cities, 'shipped' re-points the completed arm at en-route journeys, the bare id key pairs travelers with bookings by coincidence of id, ROUND to 0 flattens 8.1 into 8, and ASC reads the matrix lightest-exposure first. One pass, one CASE per state, denominators printed.",
    },
  ],

  problems: [
    { slug: "top-travellers", why: "Traveler boards from journey sums — the commuter whale list the CRM targets, folded without inflating legs into bookings." },
    { slug: "trips-and-users", why: "Cancellation rates per market with excluded accounts — the Delay Repay exposure read: refunded share per market, denominators stated." },
    { slug: "hopper-company-queries-ii", why: "Journey-funnel completion rates per period — the booked-to-traveled conversion the trading pack tracks week over week." },
    { slug: "employees-with-missing-information", why: "Rows whose counterparty details never filled in — the traveler-record gap read: bookings missing fare or market attributes before the board ships." },
    { slug: "confirmation-rate", why: "Per-user confirmation rates — the booking-confirmation read: which travelers' reservations confirm cleanly versus pend, per the funnel's awaiting-travel arm." },
    { slug: "the-most-recent-three-orders", why: "Most recent journeys per traveler — the last-trip read behind re-marketing and season-ticket nudges, ranked deterministically." },
    { slug: "find-churn-risk-customers", why: "Lapsed high-value travelers — the commuter winback list: lifetime spend folded first, recency gate second." },
    { slug: "average-selling-price", why: "Weighted average fare over units and periods — the realized fare per corridor, units-weighted the way pricing reads it against the 338.19 network basket." },
    { slug: "product-price-at-a-given-date", why: "Fare in force as of a date with fallbacks — the advance-versus-walkup price state: the rate a traveler saw when they compared." },
    { slug: "group-sold-products-by-the-date", why: "Fare types folded into a per-day list — the dispatch sheet: which corridors sold on a travel date, in one cell." },
    { slug: "same-day-sale", why: "Book-and-travel-same-day reads — the walk-up pattern: reservations whose lead collapses to zero against the 2.98-day norm." },
    { slug: "the-airport-with-the-most-flights", why: "Station traffic stacked from both directions — the platform-busyness fold: departures and arrivals UNION ALL'd into one board." },
    { slug: "last-person-to-fit-in-the-bus", why: "Capacity windows over ordered demand — the seat-availability read: how many confirmed bookings fit before the train fills." },
    { slug: "total-traveled-distance", why: "Conditional distance sums — the network-coverage read: legs traveled per market in one pass, states kept in the denominator." },
    { slug: "maximum-transaction-each-day", why: "Peak fare per day — the trading spike read: the single fattest booking each travel date, ties named honestly." },
    { slug: "fix-product-name-format", why: "Fare-name hygiene — the catalog cleanup: title-casing fare-type names so the advance-versus-walkup ladder groups cleanly." },
  ],
};
