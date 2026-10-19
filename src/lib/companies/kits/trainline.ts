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
// 3x expansion (Task 95, append-only): brief 4->6, dayInLife 3->4, metrics 8->12,
// topics 10->15, theory t9..t24, mcqs 11..30, cases cs-trainline-3..6 (topics j7/x2/
// t5/t3 — families distinct from the kit's t7 + s7), problems 16->32. All slugs are
// theme-menu sql rows from scripts/company-pools.md; all case figures verbatim from
// scripts/company-facts.md.

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
    "The settlement desk is where Trainline analysts learn that money is evidence, not labels. Operator bills and settlement legs move as integer cents through `invoices` and `payments` — every dollar divides by 100.0 once, at the edge. The anomaly sheet is named row-level, not averaged away: a void bill carrying a 925 settlement leg, a settled bill with no leg at all (1756), five bills settling across two legs, one sitting **4000-paid of 6148**. Paid bills settle in **28.4 days** on average — 13 fastest, 84 slowest — against uniform 30-day terms, and *the SLA slide prints all three numbers or it prints nothing*.",
    "Depth comes from the clinic moves. Set-op stacks append a {sky:TOTAL} row to a state census and the total has to tie to 103; `GROUP_CONCAT` folds a travel day's departures into one dispatch cell; explicit window frames build a trailing three-month pace without the default frame silently swallowing peers. The definition discipline never relaxes — *a share is a numerator, a denominator and the sentence that ties them* — and the three folds still have to match the slide that claims them: **251 segments, 103 bookings, 16 travelers**. Prep those and the senior loop becomes a rerun.",
  ],

  dayInLife: [
    "**07:40 —** Network board first: the overnight journey census — 103 booked, **82** stamped complete-or-en-route, 14 {amber:awaiting-travel}, 7 {rose:refunded-out} — with the pace curve beside it (9-booking peaks in 2024-02 and 2024-09). *The completion share prints next to its denominator or the trading lead sends it back.* The delay-repay queue opens with one flag: a {rose:void} operator bill that already carries a 925 settlement leg.",
    "**11:30 —** Deep work: the route-popularity board. Fold segments to corridor grain — `COUNT(DISTINCT oi.order_id)` per corridor — and the ladder lands widest-first at 54, 46, 40, 30, 23, 22, 13 bookings, with value beside it because the richest corridor (**11744.01** on 46) is not the widest. The fare-band ladder runs next: 8 budget fare types under 50, 8 standard between 50 and 200, and the 200-plus arm **empty by construction** — the deck says so out loud.",
    "**16:20 —** Stakeholder moment: the operator settlement read for the rail-partner call — card legs **16 payments worth 37364** against wire legs **11 worth 32248**, one partial book sitting 4000-paid of a 6148 bill, and one settled book with no payment leg at all (1756). *Small markets get flagged, not hidden:* the two-booking market's 426.22 average reads fat on a base of two. The EOD note ships with definitions attached — lead time as julianday on the **82** stamped journeys (2.98 days), refunds as status, not sentiment — and goes out with its denominators.",
    "**18:45 —** EOD writeup: the delay-repay queue closes with the void-but-paid bill (925) flagged for the operator desk and the 4000-of-6148 partial annotated, not resolved — *a partial settlement is a fact, not a problem to round away*. The pace curve gets its last look: 9-booking peaks in 2024-02 and 2024-09 against 6-booking troughs, {amber:±2} swings the pack reads as noise before it reads them as trend. Tomorrow's corridor census is staged tonight — segments folded, denominators printed — because **the analyst who arrives at a clean fold writes the narrative; the one who arrives at a raw join writes an apology**.",
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
    { name: "Refund SLA clock", what: "Paid operator bills settle in 28.4 days on average — 13 fastest, 84 slowest — against uniform 30-day terms. The Delay Repay cost model borrows this clock: 20 of 21 paid bills carry at least one settlement leg, and the one with none is escalated by name, not averaged in." },
    { name: "Split-leg settlement share", what: "5 of 28 operator bills settle across two payment legs, and one open bill sits 4000-paid of 6148. Coverage folds by SUM per bill, never by COUNT of legs — legs double-count the money while the bill total stays still." },
    { name: "Operator concentration", what: "The busiest rail operator carries 32% of network booking value and the second carries 26.7% — two names hold near six of every ten fare dollars across 6 operators. Fare negotiations and capacity promises start from this fold." },
    { name: "Peak-to-trough pace spread", what: "Monthly bookings run a 6-to-9 band across the 14-month window: 9-booking peaks in 2024-02 and 2024-09 against 6-booking troughs in 2024-06, 2024-11 and 2025-01. Staffing and yield reads take the spread before the total." },
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
      slugs: ["consecutive-transactions-with-increasing-amounts", "biggest-window-between-events", "find-consistently-improving-employees", "product-price-at-a-given-date", "same-day-sale"],
    },
    {
      name: "Operator settlement ledgers",
      why: "Operator money moves as integer cents across 28 bills and 27 legs; coverage is every invoice LEFT JOIN its payments, classified exact, partial or none. LEFT JOIN folds with a zero arm are the drill — 6 books here settle nothing at all.",
      slugs: ["bank-account-summary", "combine-two-tables", "count-student-number-in-departments", "trips-and-users", "hopper-company-queries-ii", "the-airport-with-the-most-flights", "total-traveled-distance", "students-and-examinations", "settlement-fails-aging", "gl-reconciliation"],
    },
    {
      name: "Unsettled-book anti-joins",
      why: "The refund worklist is the anti-join: bills with no payment leg, partners with no moved demand. On this db the invoice-side worklist runs 6 books, while traveler- and fare-type anti-joins return zero — knowing when zero is the true answer is part of the drill.",
      slugs: ["sellers-with-no-sales", "customer-who-visited-but-did-not-transact", "number-of-accounts-that-did-not-stream", "find-churn-risk-customers", "customers-who-bought-a-and-b-not-c", "customers-who-bought-all-products"],
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
      slugs: ["spend-histogram", "create-a-session-bar-chart", "ratings-histogram", "confirmation-rate", "average-selling-price", "group-sold-products-by-the-date", "sales-by-day-of-the-week", "count-the-number-of-experiments", "calculate-orders-within-each-interval", "users-with-two-purchases-within-seven-days", "returns-rate-by-category"],
    },
    {
      name: "Booking clocks & lead windows",
      why: "Booking-to-travel is julianday math over the 82 stamped journeys only — 2.98 days average, 2 to 4 — and the 21 unstamped rows must NULL out, not fabricate. Process-latency and date-offset drills are the clock's toolkit.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "users-that-actively-request-confirmation-messages", "new-users-daily-count"],
    },
    {
      name: "Window frames & running math",
      why: "Cumulative revenue-to-date and trailing pace walks need explicit frames — ROWS BETWEEN — not the default frame, which silently pulls every peer on a tied order key into the running sum. The settlement walk and the trailing three-month pace both live here; the drills are cumulative-sum and frame-control shapes.",
      slugs: ["find-cumulative-salary-of-an-employee", "running-total-for-different-genders", "restaurant-growth", "top-travellers", "the-most-recent-three-orders", "last-person-to-fit-in-the-bus", "maximum-transaction-each-day", "basket-depth-aov"],
    },
    {
      name: "Set-op stacks",
      why: "State censuses ship with a TOTAL row appended and market cuts that stack cleanly — set ops with honest labels, not two exports stapled into a deck. The trap is UNION's silent dedupe: two genuinely different rows that agree on every column collapse, the stack shortens and the 103 tie-out breaks without an error.",
      slugs: ["monthly-transactions-ii", "league-statistics", "team-scores-in-football-tournament"],
    },
    {
      name: "Subquery shapes & benchmarks",
      why: "Corridor baskets benchmark against the 338.19 network average — a scalar subquery in HAVING, a derived table staged per booking, or a windowed fold, and the choice changes what the slide can show. The drills are above-average and market-analysis shapes: compute the benchmark at matching grain, then gate on it.",
      slugs: ["orders-with-maximum-quantity-above-average", "market-analysis-i", "game-play-analysis-iv"],
    },
    {
      name: "NULL policy & fallbacks",
      why: "The 21 unstamped bookings are a policy, not a bug: NULL-blind aggregates, COALESCE for display only, and forward-fill only where the business says carry-forward. The drills separate counting rows from counting values — the exact instinct that keeps awaiting-travel out of the completion share.",
      slugs: ["find-customer-referee", "books-with-null-ratings", "change-null-values-in-a-table-to-the-previous-value", "employees-with-missing-information", "fix-product-name-format", "keep-latest-dedupe", "null-blank-audit"],
    },
    {
      name: "Seat pairs & self-joins",
      why: "Adjacent-seat reads and corridor-pair demand — which two route families ride together on one booking — are self-join folds over the same segment rows. The drills pair rows deliberately: consecutive seats, mirrored legs, shared itineraries, without letting the pairing explode the fold.",
      slugs: ["consecutive-available-seats", "tree-node", "most-common-course-pairs", "symmetric-pairs", "find-overlapping-shifts"],
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
    {
      id: "trainline-t9",
      q: "The pack wants a trailing three-month booking pace, not a month-over-month delta. What has to change in the window math?",
      a: "The default window frame betrays you: SUM(bookings) OVER (ORDER BY month) runs RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — a running total since 2024-01, not a trailing quarter. A trailing three-month pace needs ROWS BETWEEN 2 PRECEDING AND CURRENT ROW, and I say why ROWS and not RANGE: with ties on the order key, RANGE pulls every peer into the frame at once, so two rows sharing a bucket double the step. The trailing fold smooths the ±2 monthly swings into a trend line — exactly what the trading lead asked for and exactly what a running total is not. Keep the frame explicit, keep the first rows honest about the short window, and the pace walk survives review.",
      tag: "windows",
    },
    {
      id: "trainline-t10",
      q: "A candidate writes WHERE bookings >= 22 to gate thin corridors and the query errors; a teammate ships GROUP BY 1 instead of the corridor key. Grade both.",
      a: "The WHERE fails on pipeline order: aliases are assigned in the SELECT list, which runs after WHERE, so the fold COUNT(DISTINCT order_id) doesn't exist yet where the candidate used it — gates on folds belong in HAVING. GROUP BY 1 works in SQLite but it's debt: the ordinal points at whatever happens to be first in the SELECT list, so a column reorder silently re-grains the whole corridor board — I group on the alias or the expression, never a position. The habit being graded is defensive: on a 103-booking db the mistake is visible, on a real network dump it ships. My corridor gate reads HAVING COUNT(DISTINCT oi.order_id) >= 22 — threshold and grain in one line a reviewer can audit.",
      tag: "pipeline",
    },
    {
      id: "trainline-t11",
      q: "The state census needs a network TOTAL row under the four journey states. How do you build the stack, and where does UNION bite?",
      a: "Two arms, one stack: the grouped census — 52 completed, 30 en-route, 14 awaiting, 7 refunded-out — then a second SELECT with a 'TOTAL' literal in the state column and the ungrouped counts, joined by UNION ALL. The bite is UNION's dedupe: it collapses rows that agree on every column, so the stack can silently shorten and stop tying to 103 the day two arms return identical rows. I ship UNION ALL by default and earn UNION only when dedupe is the requirement. Column order and types must align arm-to-arm, the label sorts last, and the audit sentence writes itself: four states plus a label row, 103 bookings, no row invented.",
      tag: "set-ops",
    },
    {
      id: "trainline-t12",
      q: "Pricing wants corridors whose average basket beats the network's 338.19. Compare the subquery shapes you could ship and pick one.",
      a: "Three honest shapes. A scalar subquery in HAVING — AVG(total) > (SELECT AVG(total) FROM orders) — is the compact benchmark: one number, 338.19, computed where it's used, and at market grain the 383.48 market clears it while the busiest market's 335.32 doesn't. A derived table stages per-corridor folds first, which is the shape I pick when basket needs a definition — fees netted, refunded-out excluded — because a named stage survives review. A windowed AVG over a global partition keeps every corridor visible with its gap to the benchmark as a column, which is what the deck actually shows. The non-negotiable: benchmark and corridors fold on the same grain, or the comparison is segments against bookings.",
      tag: "subqueries",
    },
    {
      id: "trainline-t13",
      q: "Lead time prints 2.98 on one slide and 3 on another. Walk me through computing and rounding the booking-to-travel lead so every deck agrees.",
      a: "One definition, one rounding. julianday(shipped_at) - julianday(created_at) over the 82 stamped bookings only — the 21 unstamped rows NULL out, which is correct, because a booking that never traveled has no lead — averaged to 2.98 days with the 2-to-4 range quoted beside it. The ROUND happens once, at the edge: ROUND(AVG(diff), 2), never an average of pre-rounded diffs, never rounding in the CTE and again in the deck. By market the same fold splits 3.5, 3.07, 2.94, 2.93 — and the two-booking market's 3.5 gets flagged on sample size, not celebrated. Month buckets are the other half of the toolkit: SUBSTR(created_at, 1, 7) sorts correctly as text, raw timestamps don't. Every deck that quotes lead time quotes the same cells or the audit call finds out why.",
      tag: "dates",
    },
    {
      id: "trainline-t14",
      q: "COUNT(*) and COUNT(shipped_at) disagree on this db. When do you reach for each, and where does NOT IN bite?",
      a: "COUNT(*) counts rows — 103 bookings; COUNT(shipped_at) counts non-NULL values — 82 travel stamps. The gap is the definition: 14 awaiting travel plus 7 refunded-out, and I want the read that keeps them visible, not one that hides the 21. NOT IN bites on exactly this shape: x NOT IN (SELECT col …) where the subquery returns even one NULL makes the whole predicate unknown and the query returns nothing — the classic way a refund worklist silently empties. The rules I work by: NULL comparisons go through IS NULL and IS NOT NULL only; NOT EXISTS or a LEFT JOIN … IS NULL anti-join instead of NOT IN when the probe column is nullable; and the census sentence states the gap — 103 rows, 82 stamps, 21 states — so nobody fixes the difference away.",
      tag: "nulls",
    },
    {
      id: "trainline-t15",
      q: "Define journey-leg attach the way our trading pack does. What's the fold, and what breaks it?",
      a: "Attach is legs per booking: 251 segment lines over 103 bookings, about 2.4 — the multi-leg story in one ratio. The fold matters more than the number: the numerator counts order_items rows, the denominator counts DISTINCT order_ids, and the join between them is where the fan-out lives — fold with COUNT(DISTINCT oi.order_id) or stage segments-per-booking in a CTE, or the ratio reads 251 over 251 and attach dies at 1.0. Units are a different KPI — quantity-weighted, not line-counted — and the pack keeps them in separate columns so a fare-mix shift never masquerades as an attach shift. When attach moves, the follow-up is per-corridor: lines and bookings printed beside each other, because attach moves where itinerary shape moves.",
      tag: "kpi",
    },
    {
      id: "trainline-t16",
      q: "Finance defines refund SLA as days-to-settle. On this db, what's the right population and the right clock?",
      a: "Paid bills with evidence. 21 invoices sit in the paid state, but only 20 carry a settlement leg — one paid bill has no payment rows at all, and that one is escalated by name, not averaged into a clock it never ran. The clock is first settlement leg minus issue date: average 28.4 days, fastest 13, slowest 84, read against uniform 30-day terms so the SLA line has a denominator that means something. The void-but-paid bill (925) stays out of the clock and in the anomaly queue; the partial book (4000 of 6148) stays open until it settles, because a partial payment is a fact, not a settlement. Split-leg bills fold by SUM before the clock, never by leg count. Population stated, clock stated, anomalies named — that's the read.",
      tag: "kpi",
    },
    {
      id: "trainline-t17",
      q: "How do you define peak-versus-off-peak fare mix on this db without overclaiming?",
      a: "Bands first, honestly. The fare ladder is 16 fare types: 8 budget under 50, 8 standard between 50 and 200, and the premium arm at 200-plus is empty by construction — the ceiling is 199.99, so the deck prints the empty band with the ceiling named instead of quietly merging it into standard. The mix reads on legs (251) with bookings (103) beside it, because a leg-mix shift and a booking-mix shift are different claims; shares carry the 100.0 before the slash so nothing truncates. What I don't claim: a premium segment we can't see, or an off-peak discount read the fare table can't support. The honest ladder is three arms, one of them zero — and saying that out loud is part of the answer.",
      tag: "kpi",
    },
    {
      id: "trainline-t18",
      q: "Pricing wants a split-ticketing savings read — through fare versus the sum of leg fares. How would you build it here?",
      a: "As a grain proof first. SUM(unit_price * quantity) per booking against orders.total ties exactly on this db — zero mismatches — which tells you the line fold reconstructs the booking total, and that's the foundation any savings claim stands on. The savings read itself needs a through-fare benchmark the schema doesn't carry, so the honest deliverable is the tie-out plus the framework: savings equals through fare minus the best sum of leg fares, per journey, with the benchmark's source named. The settlement side gives the analogy teeth: 5 of 28 bills settle across two legs and one sits partial at 4000 of 6148 — split structures are real in this data, and they're read by folding legs into bills with SUM, never by counting legs. I'd rather ship the tie-out than invent a spread the fare table can't price.",
      tag: "kpi",
    },
    {
      id: "trainline-t19",
      q: "The training db is 103 bookings. Why would I still grill you on query shape and performance?",
      a: "Because instincts are what scale, and small data hides big-shape sins. Fold early: stage segments-per-booking in a CTE and join the fold, instead of re-fanning 251 lines through every read and paying COUNT(DISTINCT) at the end each time. One pass beats row-by-row: a correlated subquery per booking turns a census into 103 scans — FILTER arms or conditional SUMs do it in one. Determinism is the discipline next door: tiebreakers in ORDER BY so the same board ships the same rows, or the review call is about why the league moved overnight. And the join keys — customer_id, product_id, order_id, invoice_id — are where indexes go first on a real network dump. On 103 rows everything is instant; the interview is checking whether the query survives the first million.",
      tag: "performance",
    },
    {
      id: "trainline-t20",
      q: "Ops thinks the same traveler booked the same journey twice in one day. How do you find duplicate bookings without crying wolf?",
      a: "Pair on evidence, canonicalize, then read state. The self-join shape: a1 and a2 on the same customer_id, same created_at, same total, with a1.id < a2.id so the pair appears once instead of twice — the id inequality is the canonicalization, and <> gives you every pair mirrored. A LAG over a traveler-day partition finds the same thing for adjacent rows. Then the step everyone skips: read status before calling it fraud — a booking and its refund pair share total and timestamp by design, and on this db 7 bookings are refunded-out, so duplicate and booked-then-refunded differ by one column you didn't join on. The deliverable is a pair list with both ids, the shared keys and the status pair — ops decides, the query only proves the shape.",
      tag: "quality",
    },
    {
      id: "trainline-t21",
      q: "The fare-mix slide wants quartiles, not ranks. What changes in the window math?",
      a: "The function and the claim. NTILE(4) OVER (ORDER BY price DESC) deals the 16 fare types into four tiles of four — row counts, not positions — while RANK answers who is first and NTILE answers who is in the top quarter. Two things to state on the slide: ties cut across tile boundaries, so equal fares can land in adjacent tiles, and tile 1 is only the top because I ordered DESC — say the direction out loud. PERCENT_RANK is the companion when the deck wants share-of-rows-below instead of a tile number. On this ladder the bands are already honest — 8 budget under 50, 8 standard to the 199.99 ceiling — so quartiles are a presentation choice, and I'd rather ship the named bands than let a quartile cut imply a premium segment the data doesn't contain.",
      tag: "windows",
    },
    {
      id: "trainline-t22",
      q: "When does a CTE earn its place versus a derived table or a view?",
      a: "When the definition needs a name. A CTE earns its keep on multi-stage folds a reviewer must re-derive: stage segments-per-booking, then join the fold to corridors, then rank — each stage named, each grain stated, the fan-out controlled in exactly one place. A derived table is fine for one-off nesting where the stage has no life beyond the query; a view is the right home when a definition — settlement coverage, refund share — is quoted across decks and must not fork. The settlement read is my example: exact, partial (4000 of 6148) and none (6 bills, 15217 cents) as a named coverage CTE means finance and ops quote the same arms, and the void-but-paid bill (925) surfaces in the same pass. What I don't do: recursive CTEs on data that isn't a hierarchy, or CTEs as decoration on a single fold — that's ceremony, not clarity.",
      tag: "ctes",
    },
    {
      id: "trainline-t23",
      q: "One query, every journey state, every share — how do you build the census so it never drifts?",
      a: "One pass, conditional folds, no WHERE on the base. COUNT(*) FILTER (WHERE status = 'delivered') AS completed and its three siblings print 52, 30, 14, 7 over all 103 bookings; the completion share is ROUND(100.0 * (completed + en_route) / COUNT(*), 1) = 79.6 with the denominator in the same row. FILTER reads like the definition; SUM(CASE WHEN …) is the same fold for engines without FILTER — pick one house style so two decks don't fork the census. The drift always comes from the same place: a WHERE that cleans refunded-out shrinks the base to 96 and prints a share the network never earned. Per-market cuts reuse the arms under GROUP BY — the moment someone adds a WHERE to one arm, the market rows stop summing to the network row, and that tie-out is the audit.",
      tag: "aggregation",
    },
    {
      id: "trainline-t24",
      q: "Fare names arrive cased inconsistently and month keys are text. What's your text toolkit on this db?",
      a: "Canonicalize before you group. UPPER(TRIM(name)) before the fare-band fold, or Advance and ADVANCE split one band into two and the ladder lies; SUBSTR(created_at, 1, 7) for the 'YYYY-MM' month key, which sorts correctly as text and buckets the 14-month window without a calendar join. GROUP_CONCAT is the dispatch sheet: fare types or departures per travel day folded into one cell, ORDER BY inside the aggregate so the cell is stable, DISTINCT so re-priced lines don't repeat. LENGTH before you trust a join key — a trailing space in a fare name is invisible on screen and fatal to an equality join. The habit being graded: text is data until you normalize it, and the normalization happens in the query where the reviewer can see it, not in the slide where nobody can.",
      tag: "text",
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
    {
      id: "trainline-mcq-11",
      prompt: "The journey-state census ships with a TOTAL row appended: 52, 30, 14, 7, then TOTAL 103. Which set-op choice keeps the stack honest?",
      choices: [
        "UNION — it dedupes the two arms for free",
        "UNION ALL — both arms keep their rows; UNION's dedupe could silently drop one",
        "INTERSECT — it keeps only rows both arms share",
        "EXCEPT — it subtracts the census from the total",
      ],
      answer: 1,
      why: "UNION ALL appends both arms row-for-row: four state rows plus the labeled total, tying to 103. UNION dedupes whole rows — the day two arms agree on every column, a real row vanishes and the tie-out breaks without an error.",
      notes: [
        { choice: 0, why: "Dedupe is not free — it's silent data loss. State rows and a total row don't collide today, but the safety margin is zero and the failure mode is a short stack, not an error." },
        { choice: 2, why: "INTERSECT returns rows both arms share — the census and the total share none, so the stack comes back empty." },
      ],
      difficulty: "easy",
    },
    {
      id: "trainline-mcq-12",
      prompt: "Which fare types have NEVER ridden a booked journey? The EXCEPT shape runs and returns zero rows. What does the deck print?",
      choices: [
        "The query is broken — re-check the join",
        "Zero — every one of the 16 fare types has transacted, and the empty result is the finding",
        "Rerun with INNER JOIN to get the real list",
        "Cast the ids to TEXT and rerun",
      ],
      answer: 1,
      why: "On this db the anti-join truth is zero: all 16 fare types appear in order_items. The deck prints the empty list with the sentence 'every fare type has transacted' — an empty anti-join is a finding, not a failure.",
      notes: [
        { choice: 0, why: "The query is fine; the expectation was wrong. Analysts who treat zero as an error start rounding results toward what they hoped to find." },
        { choice: 2, why: "An INNER JOIN to order_items returns the fare types that HAVE transacted — the exact complement of the question." },
      ],
      difficulty: "medium",
    },
    {
      id: "trainline-mcq-13",
      prompt: "Trailing three-month booking pace over the 14 month buckets. Which frame computes it?",
      choices: [
        "SUM(bookings) OVER (ORDER BY month) — the default frame already trails",
        "SUM(bookings) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)",
        "SUM(bookings) OVER (ORDER BY month ROWS BETWEEN 3 PRECEDING AND CURRENT ROW)",
        "SUM(bookings) OVER (ORDER BY month RANGE BETWEEN 3 PRECEDING AND CURRENT ROW)",
      ],
      answer: 1,
      why: "The trailing quarter is the current month plus the two before it: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW. The default frame is a running total since 2024-01, not a trailing window, and RANGE measures intervals in values, not rows.",
      notes: [
        { choice: 0, why: "The default frame is RANGE UNBOUNDED PRECEDING to CURRENT ROW — a cumulative sum that only ever grows. The pace walk would read as acceleration forever." },
        { choice: 3, why: "RANGE 3 PRECEDING spans a value range of the order key — months aren't numeric here, and where they are, the row count in the frame varies. Trailing-N is a ROWS frame." },
      ],
      difficulty: "hard",
    },
    {
      id: "trainline-mcq-14",
      prompt: "The fare-mix slide wants quartiles over the 16 fare types. What does NTILE(4) OVER (ORDER BY price DESC) do that RANK does not?",
      choices: [
        "NTILE also breaks ties deterministically",
        "NTILE deals rows into four equal tiles — a row's tile is its quartile, and ties can straddle tile boundaries",
        "NTILE requires GROUP BY price first",
        "NTILE prints four rows total",
      ],
      answer: 1,
      why: "NTILE(4) assigns each of the 16 fare types a tile 1-4, four rows per tile; two fare types with the same price can land in adjacent tiles because tiles count rows, not values. RANK would give tied fares the same rung and skip the next.",
      notes: [
        { choice: 0, why: "Ties are exactly what NTILE ignores — the deal is positional. If the tie must resolve, add a tiebreaker to the ORDER BY inside OVER." },
        { choice: 2, why: "NTILE is a window function over the result set — no GROUP BY involved. Adding one would re-grain the ladder to one row per price." },
      ],
      difficulty: "hard",
    },
    {
      id: "trainline-mcq-15",
      prompt: "Corridors whose average basket beats the network's 338.19. Which gate ships?",
      choices: [
        "WHERE AVG(o.total) > (SELECT AVG(total) FROM orders)",
        "HAVING AVG(o.total) > (SELECT AVG(total) FROM orders)",
        "HAVING AVG(o.total) > 338.19",
        "HAVING o.total > (SELECT AVG(total) FROM orders)",
      ],
      answer: 1,
      why: "The benchmark is a fold, so the comparison lives in HAVING, and the benchmark itself is a scalar subquery computing the same fold at network grain — 338.19 — so a data refresh re-derives it. WHERE can't see AVG; o.total is a row value, not the fold.",
      notes: [
        { choice: 0, why: "WHERE runs before the fold exists — AVG there is an error. Aggregate gates belong in HAVING, after GROUP BY." },
        { choice: 2, why: "Hardcoding 338.19 ships today and rots on the next refresh — the benchmark is a definition, not a constant. Compute it where it's used." },
      ],
      difficulty: "medium",
    },
    {
      id: "trainline-mcq-16",
      prompt: "A refund worklist built with NOT IN (SELECT …) returns NOTHING — not zero rows, no result. What bit you?",
      choices: [
        "The subquery returned a NULL, and NOT IN against a NULL-poisoned list makes every comparison unknown",
        "NOT IN needs an index to return rows",
        "The outer query needs DISTINCT",
        "NOT IN is read-only; it can't return data",
      ],
      answer: 0,
      why: "One NULL in the subquery result poisons the list: x NOT IN (a, b, NULL) is x<>a AND x<>b AND x<>NULL, and the last term is unknown — no row qualifies. The fix is NOT EXISTS or a LEFT JOIN … IS NULL, or filtering NULLs out with intent.",
      notes: [
        { choice: 1, why: "Indexes change speed, not semantics. The empty result is three-valued logic, not a plan problem." },
        { choice: 3, why: "NOT IN is an ordinary predicate — it filters, it doesn't restrict outputs. The NULL semantics are the whole story." },
      ],
      difficulty: "hard",
    },
    {
      id: "trainline-mcq-17",
      prompt: "Operator bills LEFT JOIN their settlement legs: COUNT(*) prints 33, the deck says 28 bills. Which expression is the bill count?",
      choices: [
        "COUNT(*)",
        "COUNT(p.invoice_id)",
        "COUNT(DISTINCT i.id)",
        "SUM(i.id)",
      ],
      answer: 2,
      why: "Five bills settle across two legs, so the LEFT JOIN fans 28 bills into 33 rows; COUNT(DISTINCT i.id) folds back to bills. COUNT(*) counts joined rows; COUNT(p.invoice_id) counts settlement legs (27).",
      notes: [
        { choice: 0, why: "33 is the fan-out total — bills plus their extra legs. Shipping it overstates the bill base by exactly the split-leg surplus." },
        { choice: 1, why: "That's the settlement-leg count, 27 — the number of legs, not bills. Useful in its own column, wrong in the bill column." },
      ],
      difficulty: "medium",
    },
    {
      id: "trainline-mcq-18",
      prompt: "A same-day-travel flag needs lead in whole days: booked and traveled on the same calendar day. Which expression computes lead correctly?",
      choices: [
        "shipped_at - created_at",
        "CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER)",
        "STRFTIME('%d', shipped_at) - STRFTIME('%d', created_at)",
        "julianday(created_at) - julianday(shipped_at)",
      ],
      answer: 1,
      why: "julianday differences are fractional days; the cast floors to whole days, and the observed 2-to-4-day lead range stays intact. Text subtraction does nothing useful; day-of-month subtraction breaks across month boundaries.",
      notes: [
        { choice: 0, why: "Both columns are TEXT timestamps — the dash is string arithmetic that errors or silently misbehaves. julianday is the conversion." },
        { choice: 2, why: "27 February to 01 March subtracts to -26 — the day-of-month trap. Only julianday arithmetic crosses month boundaries safely." },
      ],
      difficulty: "easy",
    },
    {
      id: "trainline-mcq-19",
      prompt: "A teammate ships the corridor fold with GROUP BY 1. It works today. Why is it still debt?",
      choices: [
        "GROUP BY 1 groups by the literal number one — one group total",
        "The ordinal points at the first SELECT item, so a column reorder silently re-grains the board",
        "SQLite forbids it in newer versions",
        "It forces a table scan",
      ],
      answer: 1,
      why: "GROUP BY 1 resolves to the first output column — convenient, positional, and fragile: rename or reorder the SELECT list and the fold re-grains without an error. Group on the alias or the expression and the query says what it folds.",
      notes: [
        { choice: 0, why: "That's GROUP BY (1) as a constant — a different bug. GROUP BY 1 is an ordinal reference, which is precisely the fragility." },
        { choice: 2, why: "SQLite supports ordinals today; portability is a secondary concern. The primary cost is silent re-graining under refactor." },
      ],
      difficulty: "medium",
    },
    {
      id: "trainline-mcq-20",
      prompt: "The league board uses RANK() OVER (ORDER BY bookings DESC) and prints top-down. Why does the outer ORDER BY still matter?",
      choices: [
        "It doesn't — the window's ORDER BY sorts the output",
        "The window ORDER BY only defines rank computation; the outer ORDER BY determines row order — without it, row order is arbitrary",
        "The outer ORDER BY dedupes tied ranks",
        "The window ORDER BY is only valid with PARTITION BY",
      ],
      answer: 1,
      why: "Two different jobs: the OVER clause's ORDER BY defines how ranks are computed; the statement's ORDER BY defines the order rows print in. Without the outer clause, the board's row order is whatever the engine returns — ranks correct, board unreadable.",
      notes: [
        { choice: 0, why: "Classic conflation — on small data the output often looks sorted, which is plan coincidence, not a guarantee. The review call happens when it isn't." },
        { choice: 2, why: "ORDER BY never dedupes. Tied ranks need a deterministic tiebreaker — spend, id — in the outer clause." },
      ],
      difficulty: "medium",
    },
    {
      id: "trainline-mcq-21",
      prompt: "Journey-leg attach reads 'about 2.4 legs per booking'. Which fold prints it?",
      choices: [
        "SUM(oi.quantity) / COUNT(DISTINCT oi.order_id)",
        "COUNT(*) over order_items / COUNT(DISTINCT oi.order_id)",
        "AVG(oi.id)",
        "COUNT(*) over orders / COUNT(DISTINCT oi.order_id)",
      ],
      answer: 1,
      why: "Legs are order_items lines — 251 — and bookings are distinct order ids — 103; 251 over 103 is about 2.4. Quantity is units, a different KPI; ids aren't counts.",
      notes: [
        { choice: 0, why: "That's units per booking — quantity-weighted, roughly double the leg count here. A different metric wearing attach's name." },
        { choice: 3, why: "Bookings over bookings — the ratio inverts and reads 1.0, announcing that nobody books multi-leg trips." },
      ],
      difficulty: "easy",
    },
    {
      id: "trainline-mcq-22",
      prompt: "The refund SLA clock averages days-to-settle over paid bills. 21 bills are paid; the clock reads 20. Where did one go?",
      choices: [
        "Rounding dropped it",
        "One paid bill carries no settlement leg — no clock to read; it's escalated by name, not averaged in",
        "It settled in zero days and was filtered",
        "The clock caps at 84 days and drops outliers",
      ],
      answer: 1,
      why: "The paid state and the evidence disagree: one of the 21 paid bills has no payment rows, so days-to-settle is undefined — the honest clock runs over the 20 bills with legs (28.4 days average) and the odd bill goes to the anomaly queue.",
      notes: [
        { choice: 0, why: "Nothing rounded — the bill never entered the fold. COUNT the population and COUNT the evidence; the gap of one is the finding." },
        { choice: 3, why: "84 is the observed slowest, not a cap. Trimming outliers to defend an SLA is the exact move the audit flags." },
      ],
      difficulty: "medium",
    },
    {
      id: "trainline-mcq-23",
      prompt: "The premium fare band (200 and up) returns zero legs — the fare ceiling is 199.99. What ships on the fare-mix slide?",
      choices: [
        "Drop the premium row — empty bands confuse readers",
        "Print the empty band with the ceiling named: zero legs is a fact about the ladder",
        "Round the ceiling to 200 and count the 199.99 flagship as premium",
        "Merge premium into standard and footnote it",
      ],
      answer: 1,
      why: "The ladder is 8 budget fare types under 50 and 8 standard from 50 to the 199.99 ceiling; the premium arm is empty by construction. Printing it with the ceiling stated is the honesty the pricing review grades — absence of premium is information.",
      notes: [
        { choice: 2, why: "199.99 is below 200 — rounding it into the band is a definition change that manufactures a premium segment out of the flagship." },
        { choice: 3, why: "Merging re-bins the ladder and the 8-and-8 band counts stop tying to the fare table. Footnotes don't fix definitions." },
      ],
      difficulty: "medium",
    },
    {
      id: "trainline-mcq-24",
      prompt: "Split-ticketing savings: SUM of leg fares versus the through fare. On this db, SUM(unit_price * quantity) per booking versus orders.total returns what?",
      choices: [
        "A savings table — the through fare is always cheaper",
        "An exact tie-out on every booking — the honest deliverable is the grain proof plus a framework, since the schema carries no through-fare benchmark",
        "Errors — REAL totals can't be compared to line sums",
        "A tie-out except for refunded bookings",
      ],
      answer: 1,
      why: "The line fold reconstructs every booking total exactly — zero mismatches across 103 bookings. That's the foundation, not the finding: a savings read needs a through-fare benchmark this schema doesn't carry, so the deliverable states the framework and the benchmark's source.",
      notes: [
        { choice: 0, why: "That invents a spread the data can't price — there is no through-fare column to compare against. Savings claims need a benchmark, not a wish." },
        { choice: 3, why: "Refunded bookings carry the same line-sum-to-total tie as every other state — status changes the denominator, not the arithmetic." },
      ],
      difficulty: "hard",
    },
    {
      id: "trainline-mcq-25",
      prompt: "SELECT COUNT(*) FROM orders HAVING COUNT(*) > 100 runs without GROUP BY. What does it do, and when is that shape right?",
      choices: [
        "Syntax error — HAVING requires GROUP BY",
        "The whole table is one group; the gate prints the single count when the network clears the bar and nothing when it doesn't",
        "It returns 103 rows — one per booking",
        "It computes the count before filtering the table",
      ],
      answer: 1,
      why: "An aggregate with no GROUP BY folds the whole table into one group, and HAVING gates that group: 103 > 100 prints one row, a smaller network prints none. It's the did-we-clear-the-bar read — a threshold check with the fold as the answer.",
      notes: [
        { choice: 0, why: "HAVING without GROUP BY is legal — the table itself is the single group. The error people remember is the reverse: aggregates in WHERE." },
        { choice: 2, why: "COUNT(*) returns a scalar — one row by construction. Per-booking rows would be a different query, not this one plus HAVING." },
      ],
      difficulty: "medium",
    },
    {
      id: "trainline-mcq-26",
      prompt: "Rank travelers by journeys flown — but the join fans travelers out across segment lines. Where does the fold go?",
      choices: [
        "Rank first, then COUNT(DISTINCT) to clean up",
        "Fold bookings per traveler in a CTE (or COUNT(DISTINCT o.id) at the travel grain), then rank over the folded grain",
        "Add DISTINCT after RANK()",
        "Rank over orders — segments are irrelevant",
      ],
      answer: 1,
      why: "The window ranks whatever rows reach it — rank the fanned join and the board ranks legs. Fold first: GROUP BY traveler with a COUNT of bookings (or COUNT(DISTINCT oi.order_id) when segments are in the join), then RANK() OVER on the folded count.",
      notes: [
        { choice: 0, why: "Ranks computed over fanned rows can't be retroactively fixed by deduping — the ordering happened at the wrong grain." },
        { choice: 2, why: "DISTINCT after RANK() keeps one row per tie group at best and arbitrary survivors at worst — a dedupe is not a grain fix." },
      ],
      difficulty: "medium",
    },
    {
      id: "trainline-mcq-27",
      prompt: "SUM(o.total) OVER (ORDER BY created_at) — two bookings share one created_at instant. What does the running sum do at that step?",
      choices: [
        "Errors on the tie",
        "The default RANGE frame includes both peer rows at once — the walk jumps by their combined total in one step",
        "It arbitrarily picks one peer",
        "It returns NULL until the tie resolves",
      ],
      answer: 1,
      why: "The default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes value-peers: both bookings at that instant enter the running sum together. ROWS would step row by row — but in arbitrary order within the tie, which is its own nondeterminism.",
      notes: [
        { choice: 0, why: "Ties are legal in window ORDER BY — that's precisely when RANGE's peer semantics activate. No error, just a fatter step." },
        { choice: 2, why: "ROWS frames don't pick — they process both rows in unspecified order. If the split matters, add a tiebreaker to the ORDER BY." },
      ],
      difficulty: "hard",
    },
    {
      id: "trainline-mcq-28",
      prompt: "The lead-time deck averages booking-to-travel lead. Which ships?",
      choices: [
        "ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) — round the fold once, at the edge",
        "AVG(CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER)) — whole days first",
        "ROUND(julianday(shipped_at) - julianday(created_at), 2) per row, then AVG",
        "AVG(shipped_at - created_at)",
      ],
      answer: 0,
      why: "One definition, one rounding: the average of the exact diffs is 2.98 days, rounded once where it prints. Rounding per row first shifts the mean — you're averaging pre-rounded values — and whole-day flooring moves it further.",
      notes: [
        { choice: 1, why: "Flooring to integers before averaging throws away the fractional days that make 2.98 — the range is 2 to 4 and the fraction is the signal." },
        { choice: 2, why: "Rounding per row then averaging reorders the operations: the mean of rounded values is not the rounded mean, and no other slide will match it." },
      ],
      difficulty: "medium",
    },
    {
      id: "trainline-mcq-29",
      prompt: "Two bookings share traveler, created_at and total — suspected duplicates. Which shape pairs them exactly once?",
      choices: [
        "Self-join orders a1, a2 ON all keys equal AND a1.id <> a2.id",
        "Self-join orders a1, a2 ON all keys equal AND a1.id < a2.id",
        "GROUP BY traveler, created_at, total — the pair is the group",
        "LAG over the whole table ordered by created_at",
      ],
      answer: 1,
      why: "The strict inequality canonicalizes the pair: ids 7 and 9 appear once, never mirrored as 9-then-7. <> returns both orientations, a plain GROUP BY proves multiplicity but not the pairing, and LAG without a partition crosses travelers.",
      notes: [
        { choice: 0, why: "Every pair prints twice — and twice is exactly the thing you're measuring. The count doubles and the fraud read inflates." },
        { choice: 3, why: "LAG without PARTITION BY traveler compares each booking to the previous booking of whoever came earlier in the order — pairs across travelers, noise everywhere." },
      ],
      difficulty: "hard",
    },
    {
      id: "trainline-mcq-30",
      prompt: "A share query divides by a fold that's zero on thin markets. What guards it?",
      choices: [
        "COALESCE(numerator, 0) / denominator",
        "ROUND(100.0 * num / NULLIF(denom, 0), 1) — a zero denominator prints NULL instead of erroring, and the row survives",
        "WHERE denom > 0 — exclude empty markets from the query",
        "CAST the denominator to REAL",
      ],
      answer: 1,
      why: "NULLIF(denom, 0) turns division-by-zero into NULL — the share is undefined and the market row survives with the gap visible. WHERE denom > 0 deletes the row, and a deleted thin market is a denominator someone silently chose.",
      notes: [
        { choice: 0, why: "The numerator isn't the problem — dividing by zero is. COALESCE on the wrong operand still errors." },
        { choice: 3, why: "The cast fixes integer truncation, not division by zero — the 100.0 already does that job, and the zero denominator still explodes." },
      ],
      difficulty: "medium",
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
    {
      id: "cs-trainline-3",
      tier: "medium",
      topic: "j7",
      universe: "growth",
      title: "The corridor demand census",
      brief:
        "Route-popularity memo from the network planning desk (orders = journey bookings, order_items = segment lines, products.category = route family): the Monday board ranks corridors by booking value and prints demand beside it. Probed on the db: the widest corridor touches **54 of 103** bookings while the richest books **11744.01** on 46 — busiest and richest are different corridors, and the deck prints both. Thin arms get gated: corridors ride at least **22** bookings to make the board, which holds six route families and leaves the **13**-booking corridor off the league until it earns volume. *Value counts money; bookings count journeys — the slide that confuses them gets returned.*",
      ask: "Return per qualifying corridor: distinct bookings, segment lines and booking value (2dp) — richest corridor first.",
      template:
        "SELECT p.category AS corridor,\n       COUNT(DISTINCT oi.order_id) AS bookings,\n       COUNT(*) AS legs,\n       ROUND(SUM(oi.unit_price * oi.quantity), {1}) AS value\nFROM {2} oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY corridor\nHAVING COUNT(DISTINCT oi.order_id) >= {3}\nORDER BY value {4};",
      slots: [
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          noVerify: true,
          why: "Corridor value prints to 2dp — 11744.01, 6929.12, 1984.93 — the shape every money cell on the board carries. ROUND to 0 publishes 11744 and 1985, numbers no other slide shows.",
        },
        {
          answer: "order_items",
          kind: "keyword",
          label: "the segment source",
          why: "Segment lines live in order_items; the fold joins them to products for the route family. Pointing FROM at orders loses the line grain — oi.product_id doesn't exist there and the query fails outright.",
        },
        {
          answer: "22",
          kind: "number",
          label: "the board gate",
          why: "Corridors need at least 22 bookings to rank — six route families clear it, and the 13-booking corridor stays off the board. A gate of 13 would seat it on sample size; 23 or 30 would start dropping real corridors.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the league order",
          why: "The board reads richest-first: 11744.01 down to 1984.93. ASC would open the deck on the thinnest corridor and frame the meeting backwards.",
        },
      ],
      distractors: ["0", "1", "invoices", "ASC", "supplier_id"],
      walkthrough:
        "The corridor fold is a join-plus-aggregate at route-family grain. Segment lines join to fare types for the corridor key; COUNT(DISTINCT oi.order_id) folds lines back to journeys so the fan-out never calls legs bookings, and COUNT(*) keeps the leg count beside it as the honesty column. The gate keeps corridors riding at least 22 bookings — six families clear it, led by the richest corridor at 11744.01 on 46 bookings, while the widest touches 54 — and the 13-booking arm stays off the board until it earns volume. Value rounds once, to 2dp, at the edge. The distractors each bend the read: rounding to 0 or 1 republishes money at a precision no other slide carries, FROM invoices breaks the join key outright, ASC reads the league thinnest-first, and a supplier-based source would re-grain the whole board by operator.",
    },
    {
      id: "cs-trainline-4",
      tier: "easy",
      topic: "x2",
      universe: "pricing",
      title: "The fare-band leg census",
      brief:
        "Fare-mix memo from the pricing desk (products = fare types, order_items = segment lines): the advance-versus-walkup ladder is read as a one-pass census over segment lines, classified by fare price. Probed on the db: **251 segment lines** across **103** bookings ride 16 fare types — 8 budget fare types under 50 and 8 standard between 50 and 200. The premium band opens at 200 and returns **zero legs** — the fare ceiling is 199.99, so the empty arm is a fact about the ladder, and the deck prints it instead of quietly merging it. *A census that hides an empty band is a census pricing can't defend.*",
      ask: "Return one census row: distinct bookings, total legs, and legs by fare band (budget, standard, premium) — premium expected empty.",
      template:
        "SELECT COUNT(DISTINCT oi.{1}) AS bookings,\n       COUNT(*) AS legs,\n       COUNT(*) FILTER (WHERE p.price < {2}) AS budget_legs,\n       COUNT(*) FILTER (WHERE p.price >= 50 AND p.price < 200) AS standard_legs,\n       COUNT(*) FILTER (WHERE p.price >= {3}) AS premium_legs\nFROM {4} oi\nJOIN products p ON p.id = oi.product_id;",
      slots: [
        {
          answer: "order_id",
          kind: "keyword",
          label: "the booking fold",
          why: "Distinct order ids fold 251 lines to 103 bookings — the census reports journeys, not legs, in its first column. oi.id would print 251 and restate the legs column under a bookings name.",
        },
        {
          answer: "50",
          kind: "number",
          label: "the budget gate",
          noVerify: true,
          why: "Budget fare types price under 50 — 8 of the 16 — and the gate splits the ladder exactly there. 40 or 60 re-shelves the 42.50 and 49.00 fare types and the band stops matching the catalog.",
        },
        {
          answer: "200",
          kind: "number",
          label: "the premium gate",
          noVerify: true,
          why: "Premium opens at 200 and the ladder tops out at 199.99 — the arm returns 0 legs by construction. Dropping the gate to 100 or 150 reclassifies standard fare types as premium and invents a band the catalog doesn't have.",
        },
        {
          answer: "order_items",
          kind: "keyword",
          label: "the line source",
          why: "Legs are order_items rows; the join to products carries the fare price. FROM invoices has no product_id and the query fails before any band is counted.",
        },
      ],
      distractors: ["40", "60", "id", "150", "100", "invoices"],
      walkthrough:
        "One pass, three FILTER arms, no GROUP BY — the census is a single row and every claim rides a conditional count. COUNT(DISTINCT oi.order_id) prints the 103 bookings the lines fold to; COUNT(*) prints all 251 legs; the band arms split by fare price — under 50, 50 to 200, 200-plus — and the premium arm lands at exactly 0 because the fare ceiling is 199.99. Mutually exclusive arms mean the three bands sum back to the legs column, which is the tie-out the pricing desk checks first. The distractors each break an arm or the fold: 40 and 60 re-shelve the 42.50 and 49.00 fare types, 100 and 150 manufacture premium legs that don't exist, oi.id restates the 251 legs under a bookings label, and FROM invoices breaks the join key before any band counts.",
    },
    {
      id: "cs-trainline-5",
      tier: "hard",
      topic: "t5",
      universe: "growth",
      title: "The commuter league board",
      brief:
        "CRM memo from the season-ticket team (customers = travelers, orders = journey bookings): the commuter board ranks travelers by journeys flown and prints lifetime value beside the rank, because *frequency buys season tickets and spend buys upsells — different plays*. Probed on the db: the top traveler rides **24** bookings worth **7262.35**, the podium is 24, 17 and 14 bookings, and the tie policy matters — **four travelers hold 4 bookings each**, so RANK hands all four the same rung and skips past the block. The board qualifies travelers with **3 or more** journeys; the one-and-done cohort stays off it.",
      ask: "Return qualifying travelers with journeys flown, lifetime spend (2dp) and a competition rank — most journeys first, spend breaking rank ties.",
      template:
        "SELECT c.name AS traveler,\n       COUNT(o.id) AS bookings,\n       ROUND(SUM(o.total), {1}) AS spend,\n       {2}() OVER (ORDER BY COUNT(o.id) {3}) AS rnk\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.name\nHAVING COUNT(o.id) >= {4}\nORDER BY rnk, spend DESC;",
      slots: [
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          noVerify: true,
          why: "Lifetime spend prints to 2dp — 7262.35, 6640.56, 4574.23 — matching every value cell on the CRM boards. ROUND to 0 publishes 7262 and 4574, numbers no other slide carries.",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie policy",
          why: "Four travelers hold 4 bookings each — RANK gives all four rung 6 and the next block lands at 10, honest about how many sit above. DENSE_RANK compresses the skip away and ROW_NUMBER breaks the tie arbitrarily by rowid.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the board direction",
          why: "The board reads most-journeys first — 24 at the top. ASC would crown the lightest traveler and rank the 24-booking commuter last.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the qualification line",
          why: "Three or more journeys qualifies 11 travelers — the repeat cohort the season-ticket team works. A line of 0 or 1 seats the one-and-done cohort the board explicitly excludes.",
        },
      ],
      distractors: ["0", "1", "DENSE_RANK", "ROW_NUMBER", "ASC", "bookings"],
      walkthrough:
        "A ranked league over a folded join. The join fans travelers to bookings; GROUP BY c.name folds each traveler to a journey count and a lifetime spend rounded once to 2dp — the top of the board reads 24 bookings and 7262.35. The window ranks at the folded grain: RANK() OVER (ORDER BY COUNT(o.id) DESC) ties the four 4-booking travelers at rung 6 and lands the two 3-booking travelers at rung 10, then the outer ORDER BY breaks rank ties by spend so the board is deterministic. The qualification gate keeps travelers with 3-plus journeys — 11 names, the repeat cohort. The distractors each bend the board: DENSE_RANK hides how deep the 4-booking tie was, ROW_NUMBER manufactures an arbitrary winner inside it, ASC crowns the lightest traveler, the gate at 0 or 1 seats the one-and-done cohort, and comparing the count to its own bookings alias seats all 16 travelers.",
    },
    {
      id: "cs-trainline-6",
      tier: "medium",
      topic: "t3",
      universe: "month-close",
      title: "The lead-time audit",
      brief:
        "Ops SLA memo for the month-close pack (shipped_at = travel completion stamp): booking-to-travel lead is the upsell window — how long the app has to nudge a seat or an advance fare. Probed on the db: **82** of 103 bookings carry a completion stamp; their lead averages **2.98** days with a 2-to-4 spread, and by market the audit splits **3.5 / 3.07 / 2.94 / 2.93** — the two-booking market reads fat on a base of 2, so *small markets get flagged, not ranked as peers*. The 21 unstamped bookings stay in the census as a state, not a zero: they have no lead because they have no travel.",
      ask: "Return per market: stamped journeys, average lead in days (2dp) — longest lead first — with not-traveled kept as a counted state.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) FILTER (WHERE o.shipped_at IS {1}) AS stamped,\n       ROUND({2}(julianday(o.shipped_at) - julianday(o.created_at)), {3}) AS avg_lead\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY market\nORDER BY avg_lead {4};",
      slots: [
        {
          answer: "NOT NULL",
          kind: "keyword",
          label: "the stamp test",
          why: "Stamped journeys are the rows carrying a completion stamp — 2, 15, 36, 29 per market. IS NULL would count the 21 unstamped bookings instead and rename awaiting-travel as traveled.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the lead fold",
          why: "The lead is an average over the stamped rows — 3.5 down to 2.93 by market. SUM prints triple-digit day totals per market and COUNT restates the stamp count under a lead name.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the lead precision",
          noVerify: true,
          why: "Lead prints to 2dp — 2.98 network, 3.07 and 2.94 by market — matching every latency cell in the pack. One dp rounds EU and APAC into a 2.9 tie the underlying data doesn't have.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the SLA order",
          why: "The audit reads longest lead first — the 3.5 market heads the review queue. ASC would open on the fastest market and bury the SLA risk at the bottom.",
        },
      ],
      distractors: ["0", "1", "SUM", "COUNT", "ASC", "NULL"],
      walkthrough:
        "The audit keeps every booking in the census and lets the aggregates handle the NULLs. COUNT(*) FILTER (WHERE shipped_at IS NOT NULL) prints the stamped arm per market — 2, 15, 36, 29 — while julianday arithmetic NULLs the unstamped rows and AVG skips them, which is the definition and not a bug: a booking that never traveled has no lead. The average rounds once at the edge to 2dp — 3.5, 3.07, 2.94, 2.93, the same fold that prints the 2.98 network figure — and the outer ORDER BY puts the slowest market first. The distractors each break the read: IS NULL counts the 21 awaiting-or-refunded bookings as traveled, SUM prints triple-digit day totals, COUNT restates the stamp column, one decimal place merges 2.94 and 2.93 into a tie, and ASC buries the SLA risk at the bottom of the pack.",
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
    { slug: "customers-who-bought-a-and-b-not-c", why: "Multi-corridor itineraries — bookings touching route family A and B but never C: the pair-demand read behind corridor-pair marketing, EXISTS pairs plus a NOT." },
    { slug: "customers-who-bought-all-products", why: "The all-network pass — travelers who have ridden every route family: relational division over segments, the commuter-hunting shape the season-ticket team borrows." },
    { slug: "students-and-examinations", why: "Traveler-by-fare-type matrix with zero-fill — every traveler against every fare type with COALESCE zeros: the coverage grid the fare-mix review starts from." },
    { slug: "sales-by-day-of-the-week", why: "Departures pivoted by weekday — the Friday-out, Sunday-back shape behind peak-versus-off-peak staffing and fare windows." },
    { slug: "count-the-number-of-experiments", why: "Departures bucketed by hour-of-day — the peak-versus-off-peak departure curve the fare-mix KPI is actually read against." },
    { slug: "calculate-orders-within-each-interval", why: "Lead-time buckets — bookings sorted into advance windows inside the observed 2-to-4-day range: the CASE-bucket ladder behind upsell-timing plays." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Repeat bookings inside seven days — the commuter pattern: two journeys in a week is a season-ticket conversation, not a marketing one." },
    { slug: "new-users-daily-count", why: "First-journey cohorts per day — the new-traveler curve onboarding paces against: MIN first journey, then bucket the calendar." },
    { slug: "keep-latest-dedupe", why: "Latest quote wins — ROW_NUMBER dedupe over re-priced fare quotes per corridor: the freshness rule the fare cache lives by." },
    { slug: "null-blank-audit", why: "Traveler-record audit — NULLs and blanks across the passenger base before any CRM board ships: the hygiene pass behind denominators you can defend." },
    { slug: "basket-depth-aov", why: "Legs per booking beside average basket — the 251-over-103 attach read next to the 338.19 basket: two KPIs, one fold, denominators printed." },
    { slug: "returns-rate-by-category", why: "Refund rate by corridor family — the Delay Repay exposure read: refunded bookings over all bookings per route family, base stated." },
    { slug: "settlement-fails-aging", why: "Settlement aging buckets — open operator bills bucketed by days past due: the escalation ladder the ops desk works oldest-first." },
    { slug: "gl-reconciliation", why: "Ledger tie-out — debits against credits across settlement accounts: the reconciliation proof that operator money moved where the legs say it did." },
    { slug: "symmetric-pairs", why: "Return-leg pairing — journeys that mirror each other across two stations: the canonicalized self-join behind return-ticket analytics." },
    { slug: "find-overlapping-shifts", why: "Overlapping journey windows — travelers whose bookings overlap in time: the double-booking hunt the ops desk runs before calling it a data bug." },
  ],
};
