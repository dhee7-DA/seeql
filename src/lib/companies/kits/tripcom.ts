// Trip.com — kit 12 of the Travel & Hospitality domain (Batch L, wave 7).
// Multi-vertical OTA angle: cross-sell funnels, APAC-to-global demand,
// cancellation clocks and one settlement stack behind three verticals.
// Pool provenance: Trip.com has NO registry tags in this app's pools —
// 0 tagged LC — theme-curated: every topic and problem slug comes from
// scripts/company-pools.md's theme menu, mirroring the workflows Trip.com
// screens are known to probe (funnel censuses, market pivots, cross-sell
// pairs, latency math, settlement ledgers). Case studies run on the
// storefront db with probed figures from scripts/company-facts.md — mapped
// honestly as orders=bookings (flight/hotel/rail reservations),
// order_items=segments (room-nights, flight legs, fare lines),
// products=bookable units (room classes, fare types, route tiers),
// customers=travelers, suppliers=supply partners (airlines, hotel groups,
// rail operators), shipped_at=travel completed, region=market.

import type { CompanyKit } from "../types";

export const tripcomKit: CompanyKit = {
  id: "tripcom",
  domainId: "travel",
  name: "Trip.com",
  tagline: "Global OTA: flights, hotels and trains in one funnel",
  accent: "text-sky-300",

  brief: [
    "**Trip.com** is the multi-vertical OTA that sells flights, hotels and rail in one funnel — search once, attach the second and third vertical before payment, and the margin lives in what rides along. In this app's training db the mapping is honest: `orders` are bookings (a flight, a room or a train journey that was priced and reserved), order_items are the segments (room-nights, flight legs, fare lines), products are bookable units, and shipped_at is travel completed. Probed scale: **103 bookings worth 34833.28** carrying 251 segments across 16 bookable units and 6 supply partners — about 2.4 segments per booking, which is the cross-sell story in one ratio.",
    "The data org is funnel-shaped. The trading team owns the stage census — **52** {emerald:completed} journeys, 30 in-trip, 14 {amber:pending} in the booking window and 7 {rose:cancelled} — and prints the share beside its denominator every morning. The market team owns the region grid: EU books 45 journeys worth 15089.23, APAC 37 worth 11605.45, US 19 worth 7286.16, LATAM 2 worth 852.44 — *APAC-to-global demand in four rows*. The settlement desk moves partner money as integer cents across 28 invoices and 27 payments.",
    "The SQL screens are live-db and cross-sell ruthless. You will be asked for a partner read — segments, value and distinct bookings per supply partner — and the trap is grain: 251 segments fold through the join until `COUNT(*)` counts segments and calls them bookings. You will be asked for a market pivot — journey state across four regions in one query — and the trap is the arm that defines each state. Anti-join drills return **zero rows** here (every unit and every traveler has transacted), and the bookable-unit price ceiling sits at **199.99**, so premium-band filters come back empty by construction.",
    "Prep the way the screens run: conditional folds and `COUNT(DISTINCT …)` until a funnel census is one query with the denominator printed; CASE pivots until market-by-state is a single pass; window ranks for the partner boards; julianday for the **2.98-day** average booking-to-travel clock; month buckets via `SUBSTR(created_at, 1, 7)` across 2024-01 to 2025-02. Then rehearse the two sentences the interviewer grades: *a segment is a line, a booking is a PNR — and attach, depth and value are three different folds over the same rows*.",
  ],

  dayInLife: [
    "**08:15 —** Trading board first: the overnight journey census — 103 booked, **82** traveled or underway, 14 {amber:pending} in the window, 7 {rose:cancelled} — and the demand grid beside it, EU 45 bookings over APAC 37 over US 19. *The completion share prints next to its denominator or the trading lead sends it back.* The cancellation clock runs before standup: 2.98 days average booking-to-travel, range 2 to 4.",
    "**11:40 —** Deep work: the supply-partner board. Fold segments back to booking grain — `COUNT(DISTINCT oi.order_id)` through the fan-out — and two truths land on one row: Midwest Hardware Co leads reach with 45 bookings while Nordic Gadgets AB leads value with **11130.25** (32% of demand). *Reach and value are different folds, so each column names its grain before the deck ships.*",
    "**16:20 —** Stakeholder moment: the APAC-to-global read for the weekly trading call — APAC 37 bookings with 21 completed (**56.8%**) against a US market that flips the shape, 10 of 19 in-trip and only 5 completed (**26.3%**). The settlement queue rides along: the {rose:void}-but-paid bill (925) goes back to engineering, and one refundable booking sits 4000-paid of a 6148 invoice. The note ships with definitions attached; the denominators ride with it.",
  ],

  metrics: [
    { name: "Journey completion share", what: "Completed journeys over all bookings in a market — 53.3% in the busiest market (EU, 24 of 45), 56.8% in APAC, 26.3% in the US. The trading board's headline; a share without its market denominator is a different number." },
    { name: "Cross-sell segments per booking", what: "Line items over bookings — 251 over 103, about 2.4. The raw attach proxy: how many extra verticals ride on the average reservation beyond the first." },
    { name: "Booking-to-travel clock", what: "julianday(travel) minus julianday(booking) on the 82 completed-or-underway bookings — 2.98 days average, range 2 to 4. The window a cross-sell nudge actually has." },
    { name: "Cancellation share", what: "Cancelled bookings over all bookings — 6.8% network, 8.1% in APAC, 5.3% in the US. Every funnel forecast carries this haircut before inventory is re-released." },
    { name: "Market demand mix", what: "Bookings and value per region — EU 45 worth 15089.23, APAC 37 worth 11605.45, US 19 worth 7286.16, LATAM 2 worth 852.44. APAC-to-global demand in four rows." },
    { name: "Partner value share", what: "Segment value per supply partner over network demand — Nordic Gadgets AB 11130.25 is 32%, Midwest Hardware Co 9294.93 is 26.7%. Supply negotiation opens on this column." },
    { name: "In-window demand", what: "Bookings pending in the booking window — 14 of 103. Demand that has committed but not yet traveled; it converts or it joins the cancellation clock." },
    { name: "Settlement mix", what: "Partner money by method — card 16 payments worth 37364 against wire 11 worth 32248, stored as integer cents and read over 100.0. The reconciliation spine behind all three verticals." },
  ],

  topics: [
    {
      name: "Funnel-stage censuses",
      why: "The trading board is a one-pass census: booked, completed, in-trip, pending, cancelled, share — every booking in exactly one conditional bucket, all of them in the denominator. The drills are conditional folds and share math; the graded part is the denominator staying whole.",
      slugs: ["immediate-food-delivery-i", "queries-quality-and-percentage", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Market demand folds",
      why: "The region grid folds bookings by market — count, value, distinct travelers per region — without letting the segment join inflate any of it. Per-family demand folds and period-filtered reads are the exact shape the market team ships daily.",
      slugs: ["product-sales-analysis-ii", "sales-analysis-i", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "Cross-sell pairing",
      why: "Attach is the business: which second vertical rides on a flight booking, which pair of segments co-occurs on the same PNR. Pair folds and bought-A-not-B conditional reads are the cross-sell matrix in query form.",
      slugs: ["find-product-recommendation-pairs", "customers-who-bought-a-and-b-not-c", "most-common-course-pairs"],
    },
    {
      name: "Cancellation clocks",
      why: "Booking-to-travel is julianday math over completed journeys only — 2.98 days average, range 2 to 4 — and the 21 never-traveled bookings must NULL out, not fabricate. Process-latency folds and date-window drills are the clock's toolkit.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Supply-partner boards",
      why: "Partner boards rank reach and value separately — 45 bookings for the widest-reach partner against 11130.25 for the richest — and ties in the unit column must share rungs honestly. Fold-then-rank drills are the daily bread.",
      slugs: ["top-earners", "customer-placing-the-largest-number-of-orders", "rank-scores"],
    },
    {
      name: "Market pivots",
      why: "Journey state across four markets in one query is a CASE pivot with a total column — EU 24/12/6/3, APAC 21/8/5/3. Pivot and conditional-join drills teach the arm discipline the trading deck runs on.",
      slugs: ["reformat-department-table", "sales-by-day-of-the-week", "weather-type-in-each-country"],
    },
    {
      name: "Settlement in cents",
      why: "Partner money moves as integer cents across 28 invoices and 27 payments — card 37364 against wire 32248 — and every dollar read divides by 100.0. Ledger folds and join summaries are the settlement desk's toolkit.",
      slugs: ["bank-account-summary", "npv-queries", "bank-account-summary-ii"],
    },
    {
      name: "Zero-attach anti-joins",
      why: "A partner no booking ever touches, a traveler who browsed and never booked — the anti-join is the funnel leak detector. On this db every unit and traveler has transacted, so part of the drill is recognizing when zero is the true answer.",
      slugs: ["sellers-with-no-sales", "customers-who-never-order", "find-churn-risk-customers"],
    },
    {
      name: "Month-bucket pace",
      why: "Booking pace reads in 'YYYY-MM' buckets — 14 of them, 2024-01 (8 bookings, 3731.97) through 2025-02 (7, 2390.53) — with cancellations folded beside. Month-bucket folds with the whole window in the denominator are the pace-pack staples.",
      slugs: ["monthly-transactions-i", "unique-orders-and-customers-per-month", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "Reranking & recency boards",
      why: "Recent-booking trackers and partner ladders are window ranks where recency needs a deterministic tiebreak and ties need a stated policy. Rank and top-N drills with tie handling are exactly what the boards ask.",
      slugs: ["the-most-recent-three-orders", "second-most-recent-activity", "department-top-three-salaries"],
    },
  ],

  theory: [
    {
      id: "tripcom-t1",
      q: "Your multi-vertical read joins bookings to their segments and the booking count explodes. What happened and what's the fix?",
      a: "The join fanned out: 103 bookings carry 251 segments, so joining to segments multiplies booking rows and COUNT(*) counts segments, not bookings. The fix is grain honesty — either fold segments to booking level in a CTE and join up, or keep the fan-out and fold with COUNT(DISTINCT oi.order_id). I say the three counts out loud on any partner read: segments (251), bookings (103), travelers (16 on this db) — and the one the slide claims must match the fold actually written. A cross-sell number built on the wrong grain isn't slightly off; it's a different metric wearing the right name.",
      tag: "joins",
    },
    {
      id: "tripcom-t2",
      q: "The partner board ranks by bookable units and four partners tie at 3. How do you make the tie a decision instead of an accident?",
      a: "Pick the window function by its tie policy and state it: ROW_NUMBER breaks ties arbitrarily — the board looks precise and is actually ordered by rowid. RANK gives the four tied partners the same rung and skips consumed slots — 1, 1, 1, 1, then 5 — which is honest about how many partners sit above. DENSE_RANK numbers rungs consecutively (1, 1, 1, 1, then 2) and hides the depth of the tie. On a supply board I ship RANK with a deterministic tiebreaker (partner id), and if the tie itself matters — four partners at the same shelf size — I surface the tie as a column, because 'tied' is a fact supply negotiation will act on, not noise to hide behind an arbitrary integer.",
      tag: "windows",
    },
    {
      id: "tripcom-t3",
      q: "Write the journey-state census in one query: booked, completed, traveled-or-underway, cancelled, share. Where do candidates go wrong?",
      a: "One pass with conditional folds: COUNT(*) AS booked, COUNT(*) FILTER (WHERE status = 'delivered') AS completed, COUNT(*) FILTER (WHERE shipped_at IS NOT NULL) AS traveled, COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled, and ROUND(100.0 * traveled / COUNT(*), 1) — 103, 52, 82, 7, 79.6 on this db. The classic failure is a WHERE clause: filtering cancelled out 'to keep it clean' shrinks the base to 96 and prints a share the funnel never earned; the second is integer division, where 100 * 82/103 truncates because the 100.0 entered after the slash. Every booking sits in exactly one conditional bucket and all of them stay in the denominator — that is the whole definition, and the census prints the base beside the share so nobody asks.",
      tag: "aggregation",
    },
    {
      id: "tripcom-t4",
      q: "shipped_at is NULL on 21 bookings. What does that NULL mean here, and how should queries treat it?",
      a: "On this mapping the NULL is a business state: travel hasn't completed — 14 bookings pending in the booking window and 7 cancelled, 21 total. Treating it as dirty data is the cardinal error: filling it with today's date fabricates completions, excluding those rows from a market read shrinks the denominator and flatters every share. The honest tools are state-based: COUNT(shipped_at) rides the NULL-blindness for the traveled numerator, shipped_at IS NULL splits the not-traveled arm into pending versus cancelled by joining on status, and julianday clock math over NULL rows NULLs them — correct, because a booking that never traveled has no clock. NULL here is information; the queries should read it, not repair it.",
      tag: "nulls",
    },
    {
      id: "tripcom-t5",
      q: "Where do WHERE and HAVING each belong in a per-partner funnel query, and why does mixing them up matter?",
      a: "WHERE filters rows before the fold: market slices, date windows, 'bookings created this month'. HAVING filters groups after the fold: partners carrying at least 10 bookings, markets whose value clears a floor. The pipeline order is FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY, and the two are not interchangeable — WHERE COUNT(*) fails because the fold doesn't exist yet, and pushing a row filter into HAVING folds data you then throw away. On a partner board the difference is visible: gate the thin partners in HAVING so a two-booking partner can't top the board on sample size, and keep the market slice in WHERE so the fold only ever saw the rows that mattered. Filter cancelled rows out in WHERE and your booked totals drop from 103 to 96 — the cancellation haircut vanishes from the deck.",
      tag: "pipeline",
    },
    {
      id: "tripcom-t6",
      q: "Trading wants markets whose completion share beats the network average. Subquery, window, or CTE?",
      a: "All three are honest; the definition's weight picks one. A scalar subquery — HAVING the market's completed share > (SELECT the same share over all rows) — is the compact benchmark read. A windowed fold, 100.0 * SUM(completed) / SUM(COUNT(*)) OVER (), keeps every market in the result with its premium visible, which is what the deck wants. A CTE earns its place when 'completed' needs a definition — delivered only, or delivered plus in-trip — because a named two-stage fold survives review and a nested one-liner doesn't. What's not negotiable: the benchmark and the markets must fold on the same grain, or the comparison is bookings against travelers.",
      tag: "subqueries",
    },
    {
      id: "tripcom-t7",
      q: "Two date reads every week: booking pace by month and the booking-to-travel clock by market. What machinery does each need?",
      a: "Pace is bucketing: SUBSTR(created_at, 1, 7) makes a '2024-01' month key that GROUP BY folds and sorts correctly — the 14-bucket trend from 2024-01 (8 bookings, 3731.97) through 2025-02 (7, 2390.53). The clock is instant math: julianday(shipped_at) - julianday(created_at) on the 82 traveled bookings, averaged to 2.98 days with the 2-to-4 range quoted, because the cross-sell window is sized in days. The traps I name out loud: bucketing the raw timestamp gives one row per booking; julianday over NULL completions NULLs those rows, which is the definition and not a bug; and the round happens once at the edge so the deck, the query and the audit all print the same number.",
      tag: "dates",
    },
    {
      id: "tripcom-t8",
      q: "One partner feed double-logs segments, and finance just found a void invoice carrying a payment. How do you keep both from poisoning the funnel read?",
      a: "Dedupe on a natural key, reconcile states against evidence. For the feed: ROW_NUMBER() OVER (PARTITION BY booking, segment, event_time ORDER BY ingested_at DESC, id DESC) and keep rn = 1 — with the tiebreak stated, because 'latest' needs a deterministic definition when timestamps tie. For finance: conditional counts that cross-examine status against payment rows surface the void-but-paid invoice (925 on this db) and the paid-with-no-payments case (1756) before the tie-out, and the cents discipline — integer cents over 100.0 — keeps the money honest across all three verticals. The habit being graded: row counts are claims, keys and evidence are truth, and a funnel number shipped from a deduped, reconciled base is the only one worth defending.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "tripcom-mcq-1",
      prompt: "Partner board census. Which fragment counts distinct BOOKINGS per supply partner — 45 for the widest-reach partner?",
      choices: [
        "COUNT(oi.order_id)",
        "COUNT(DISTINCT oi.order_id)",
        "SUM(oi.order_id)",
        "COUNT(*)",
      ],
      answer: 1,
      why: "The join fans each booking to one row per segment — 103 bookings become 251 rows. COUNT(DISTINCT oi.order_id) folds back through the fan-out to distinct bookings: 45 for Midwest Hardware Co against 9294.93 of value.",
      notes: [
        { choice: 0, why: "COUNT(oi.order_id) counts segment LINES per partner — the fan-out number, not bookings. The partner board would read reach as segment volume." },
        { choice: 3, why: "COUNT(*) is the same fan-out count with a different name. On the joined grain it cannot see bookings at all." },
      ],
      difficulty: "easy",
    },
    {
      id: "tripcom-mcq-2",
      prompt: "Booking pace by month for the trading pack. The GROUP BY key is:",
      choices: [
        "created_at (raw timestamp)",
        "strftime('%Y', created_at)",
        "SUBSTR(created_at, 1, 7)",
        "DATE(created_at) reformatted in the deck",
      ],
      answer: 2,
      why: "SUBSTR(created_at, 1, 7) builds the '2024-01' year-month key — 14 buckets from 2024-01 (8 bookings, 3731.97) to 2025-02 (7, 2390.53) — that sorts correctly as text and folds the whole window.",
      notes: [
        { choice: 0, why: "The raw timestamp gives one group per booking — 103 rows of one. Pace needs a derived bucket key, not the raw instant." },
        { choice: 1, why: "%Y collapses the window to two rows: 2024 and 2025. The seasonality story — and the YoY comparison — needs the month in the key." },
      ],
      difficulty: "easy",
    },
    {
      id: "tripcom-mcq-3",
      prompt: "The settlement ledger stores the void-but-paid bill as 925. The dollar figure the exec deck prints is:",
      choices: [
        "925.00 — the ledger stores dollars",
        "9.25 — ledger money is INTEGER cents, divide by 100.0",
        "92.50 — divide by 10",
        "0.925 — divide by 1000",
      ],
      answer: 1,
      why: "Invoices, payments, expenses and ledger rows are INTEGER cents on this db — 925 cents is 9.25 dollars after 925 / 100.0. Orders.total and unit_price are the only dollar-valued columns.",
      notes: [
        { choice: 0, why: "That's the classic nine-hundred-fold overstatement — printing cents as dollars. Every settlement slide sourced from invoices/payments needs the /100.0." },
        { choice: 2, why: "Dividing by 10 has no basis in the schema — the unit is cents, so the divisor is 100.0, and the ROUND happens once at the edge." },
      ],
      difficulty: "easy",
    },
    {
      id: "tripcom-mcq-4",
      prompt: "Completion share per market = completed journeys over all bookings. Which expression prints EU's 53.3 without integer truncation?",
      choices: [
        "100 * completed / 45",
        "100.0 * SUM(completed_arm) / COUNT(*)",
        "CAST(completed / 45 AS REAL) * 100",
        "completed / 45.0 (multiply in the deck)",
      ],
      answer: 1,
      why: "The 100.0 promotes the fold to real arithmetic BEFORE the division — 24 of 45 prints 53.3. Integer division happens first in every other option and truncates at the slash.",
      notes: [
        { choice: 0, why: "24/45 in integer arithmetic floors to 0; times 100 stays 0. The .0 must enter before the slash, not after." },
        { choice: 2, why: "The cast happens after the integer division has already floored. Real-promotion must precede the slash — the cast decorates a truncated zero." },
      ],
      difficulty: "medium",
    },
    {
      id: "tripcom-mcq-5",
      prompt: "The market pivot needs an in-trip arm — journeys underway, not yet complete. The predicate is:",
      choices: [
        "o.status = 'pending'",
        "o.status = 'shipped'",
        "o.status = 'delivered'",
        "shipped_at IS NOT NULL",
      ],
      answer: 1,
      why: "In-trip is the 'shipped' status: 30 network-wide, 12 in the EU, 10 in the US. 'Pending' is the booking window (14), 'delivered' is completed travel, and shipped_at IS NOT NULL mixes completed with in-trip.",
      notes: [
        { choice: 0, why: "'pending' is the 14 in-window bookings — demand that hasn't traveled. Labeling it in-trip double-counts the funnel's front end." },
        { choice: 3, why: "shipped_at IS NOT NULL is the 82 traveled-or-underway set — completed rides in it too. The pivot arms would stop being mutually exclusive." },
      ],
      difficulty: "medium",
    },
    {
      id: "tripcom-mcq-6",
      prompt: "The partner board ranks by bookable units DESC. Four partners hold 3 units, two hold 2. What does RANK() print for the two smallest?",
      choices: [
        "5, 6 — no shared rungs",
        "5, 5 — ties share, no skip after",
        "5, 5 — and the list ends; the four above consumed rungs 1-4 with a skip to 5",
        "2, 2 — consecutive rungs ignoring the leaders",
      ],
      answer: 2,
      why: "RANK ties share the rung and the next rank jumps past the whole tie block: 3, 3, 3, 3 consume rungs 1-4, so the two partners at 2 units both print 5. ROW_NUMBER would print 5, 6 arbitrarily; DENSE_RANK would print 3, 3, 3, 3, 2, 2 renumbered as 1,1,1,1,2,2.",
      notes: [
        { choice: 0, why: "That's ROW_NUMBER inside the tie — an arbitrary order that looks like a real ranking. Supply would read a difference where none exists." },
        { choice: 1, why: "RANK skips consumed slots after a tie — 1,1,1,1 forces the next rung to 5. '5, 5 with no skip' describes DENSE_RANK's behavior at the wrong scale." },
      ],
      difficulty: "medium",
    },
    {
      id: "tripcom-mcq-7",
      prompt: "The booking-to-travel clock: julianday(shipped_at) - julianday(created_at) over all 103 bookings. The 21 NULL travel stamps do what?",
      choices: [
        "Count as 0-day trips — include them",
        "NULL their rows — the average runs over the 82 real clocks (2.98 days), which is correct",
        "Crash the query — filter them out first",
        "Default to today's date via SQLite",
      ],
      answer: 1,
      why: "julianday(NULL) is NULL, the difference is NULL, and AVG ignores NULLs — the average lands on the 82 bookings that actually have a clock: 2.98 days, range 2 to 4. A booking that never traveled has no clock; fabricating one would flatter the number.",
      notes: [
        { choice: 0, why: "Coalescing NULL clocks to 0 invents same-day travel for 14 pending and 7 cancelled bookings — the average collapses and the cross-sell window reads far shorter than it is." },
        { choice: 2, why: "No crash — NULLs flow through arithmetic silently. The trap is believing you must intervene; the NULL-blind aggregate already did the right thing." },
      ],
      difficulty: "medium",
    },
    {
      id: "tripcom-mcq-8",
      prompt: "'Demand still in play' = booked, not yet traveled, not cancelled. Which predicate returns exactly the 14 pending bookings?",
      choices: [
        "WHERE shipped_at IS NULL — 21 bookings",
        "WHERE status <> 'cancelled' — 96 bookings",
        "WHERE shipped_at IS NULL AND status <> 'cancelled' — 14 bookings",
        "WHERE status = 'pending' OR shipped_at IS NULL — 35 bookings",
      ],
      answer: 2,
      why: "The 21 not-traveled bookings (shipped_at IS NULL) split into 14 pending and 7 cancelled. In-play keeps only the pending arm: both conditions, because each alone over-counts by 7 or by 82.",
      notes: [
        { choice: 0, why: "shipped_at IS NULL includes the 7 cancelled bookings — demand that will never travel. Claiming it's 'in play' inflates the conversion pool." },
        { choice: 1, why: "status <> 'cancelled' keeps all 82 traveled bookings too. 'Not cancelled' is not 'still pending' — the traveled arm must be excluded as well." },
      ],
      difficulty: "hard",
    },
    {
      id: "tripcom-mcq-9",
      prompt: "A teammate adds WHERE status <> 'cancelled' 'to clean up' the market pivot, then reruns it. The EU booked column now shows:",
      choices: [
        "45 — cancelled rows were never in the pivot",
        "42 — three EU cancellations left the denominator",
        "3 — only the cancelled rows remain",
        "48 — cancelled rows got re-added",
      ],
      answer: 1,
      why: "EU books 45 journeys of which 3 are cancelled — filtering them out shrinks the base to 42 and every EU share is now computed on a denominator the funnel never earned. The cancellation haircut must stay in the base, not be filtered away.",
      notes: [
        { choice: 0, why: "The pivot's total column counts all bookings including cancelled — removing rows moves it. A total that doesn't move when rows leave the base is a red flag you'd want." },
        { choice: 2, why: "WHERE status <> 'cancelled' removes those rows; it can't keep them. That choice describes the opposite filter." },
      ],
      difficulty: "hard",
    },
    {
      id: "tripcom-mcq-10",
      prompt: "Partner share of demand = partner value over network value. Which denominator prints Nordic's 32% correctly?",
      choices: [
        "SUM over the current GROUP BY row",
        "(SELECT SUM(total) FROM orders) — the network fold",
        "COUNT(DISTINCT oi.order_id)",
        "MAX(oi.unit_price) * 103",
      ],
      answer: 1,
      why: "Share is per-partner value (11130.25) over the network fold (34833.28) — the scalar subquery computes the network denominator once, outside the GROUP BY. Dividing by anything grouped prints 100 for every partner.",
      notes: [
        { choice: 0, why: "The group's own sum IS the numerator — value over itself prints 100.0 for all six partners. The benchmark must be computed at network grain." },
        { choice: 2, why: "A booking count is a reach metric, not money. Reach over value mixes grains and prints a number with no denominator story." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-tripcom-1",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "The supply-partner board",
      brief:
        "Trip.com-flavored brief on the storefront db (orders = bookings, order_items = segments, products = bookable units, suppliers = supply partners): the quarterly supply review opens with the partner board — per supply partner across the flight/hotel/rail verticals, bookable units, distinct bookings carrying them and segment value — richest partner first, because supply negotiation prices reach and value separately. Probed facts: 251 segments across 103 bookings worth 34833.28 flow through 6 partners over 16 bookable units. The board reads Nordic Gadgets AB 3 units over 38 bookings worth 11130.25 (32% of demand value) against Midwest Hardware Co 3 units over 45 bookings worth 9294.93 (26.7%) — widest reach and richest value are different partners, and the deck shows both columns.",
      ask: "Return per supply partner: bookable units, distinct bookings, segment value (2dp) — richest partner first.",
      template:
        "SELECT s.name,\n       COUNT({1} p.id) AS units,\n       COUNT(DISTINCT oi.order_id) AS bookings,\n       ROUND(SUM(oi.quantity * oi.unit_price), {2}) AS segment_value\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.{4} = p.id\nGROUP BY {3}\nORDER BY segment_value {5};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the unit fold",
          why: "Six partners hold 16 bookable units, but the join repeats each unit once per segment line — COUNT(p.id) counts lines, not units. DISTINCT folds back to the catalog: 3, 3, 2, 2, 3, 3.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          noVerify: true,
          why: "Segment value prints to 2dp — 11130.25, 9294.93, 4765.63 — the shape every money cell in the supply deck carries. ROUND to 0 publishes 11130 and 9295, numbers no other slide shows.",
        },
        {
          answer: "s.name",
          kind: "keyword",
          label: "the partner grain",
          why: "The board folds at partner grain: GROUP BY s.name gives six rows. GROUP BY s.region collapses to four markets and buries the partner-level read the memo asked for.",
        },
        {
          answer: "product_id",
          kind: "keyword",
          label: "the unit key",
          why: "Segments reach units through the product key: p.id = oi.product_id. Joining on order_id would bolt unit ids onto booking ids — every partner's value becomes noise from a join that pairs the wrong keys.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the richest-first order",
          why: "Supply reads value top-down: 11130.25, 9294.93, 4765.63, 3613.25, 3049.07, 2980.15. ASC would open the meeting on the thinnest book and frame the negotiation backwards.",
        },
      ],
      distractors: ["ALL", "0", "s.region", "order_id", "ASC"],
      walkthrough:
        "A partner fold where the fan-out is the whole game. Segments join to units on the product key and units to partners on supplier_id; GROUP BY s.name folds 251 lines into six partners; and three counters read three truths off the same rows — COUNT(DISTINCT p.id) is catalog units (3, 3, 2, 2, 3, 3 — 16 overall), COUNT(DISTINCT oi.order_id) is bookings folded back through the fan-out (Midwest 45, Shenzhen 41, Nordic 38, Pacific 35, Alpine 34, Andes 25), and ROUND(SUM(quantity * unit_price), 2) is segment value (Nordic 11130.25 = 32% of the 34833.28 network, Midwest 9294.93 = 26.7%). Richest is not widest-reach: the board carries both so negotiation prices each separately. The distractors all move a number: ALL recounts segment lines as units, 0 rounds money to whole units no slide shows, s.region re-grains six partners into four markets, order_id re-parents the join onto booking ids, and ASC leads the meeting with the thinnest book. State the grain per column; the fan-out forgives nothing.",
    },
    {
      id: "cs-tripcom-2",
      tier: "hard",
      topic: "s7",
      universe: "funnel",
      title: "The market journey pivot",
      brief:
        "Trip.com-flavored brief on the storefront db (orders = bookings, customers = travelers, region = market): the weekly trading call wants the demand grid pivoted by market and journey state — completed, in-trip, pending in the booking window, cancelled — plus each market's completion share, busiest market first. Probed on the db: EU 45 bookings split 24 completed / 12 in-trip / 6 pending / 3 cancelled (53.3% completed), APAC 37 split 21/8/5/3 (56.8%), US 19 flips the shape with 10 in-trip against only 5 completed (26.3%), LATAM 2 both completed (100). Every booking sits in exactly one state arm and all of them stay in each market's denominator.",
      ask: "Return per market: completed, in-trip, pending, cancelled, total booked and completion share (1dp) — busiest market first.",
      template:
        "SELECT c.region,\n       SUM(CASE WHEN o.status = '{1}' THEN 1 ELSE 0 END) AS completed,\n       SUM(CASE WHEN o.status = '{2}' THEN 1 ELSE 0 END) AS in_trip,\n       SUM(CASE WHEN o.status = '{3}' THEN 1 ELSE 0 END) AS pending,\n       SUM(CASE WHEN o.status = '{4}' THEN 1 ELSE 0 END) AS cancelled,\n       COUNT(*) AS booked,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*), {5}) AS completed_pct\nFROM orders o\nJOIN customers c ON c.id = o.{6}\nGROUP BY c.region\nORDER BY booked DESC;",
      slots: [
        {
          answer: "delivered",
          kind: "keyword",
          label: "the completed arm",
          why: "Completed travel is status 'delivered' — 52 network-wide, 24 in the EU. The shipped arm would print 12 in the EU's completed column: in-trip demand posing as finished journeys.",
        },
        {
          answer: "shipped",
          kind: "keyword",
          label: "the in-trip arm",
          why: "In-trip is status 'shipped' — 30 network-wide, 12 in the EU, 10 in the US. The US reads 10 underway against only 5 completed; that flip is the story the pivot exists to tell.",
        },
        {
          answer: "pending",
          kind: "keyword",
          label: "the in-window arm",
          why: "Pending bookings sit in the booking window — 14 network-wide, 6 in the EU, 5 in APAC. They have committed but not traveled; the arm keeps them visible instead of lumping them with cancellations.",
        },
        {
          answer: "cancelled",
          kind: "keyword",
          label: "the cancelled arm",
          why: "The 7 cancelled bookings (3 EU, 3 APAC, 1 US) must keep their own arm AND stay in COUNT(*): the 6.8% haircut is computed against the booked base, not filtered out of it.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          noVerify: true,
          why: "Completion share prints to 1dp — 53.3, 56.8, 26.3, 100 — matching every share cell on the trading deck. ROUND to 0 publishes 53 and 57, numbers no other slide carries.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the market key",
          why: "Markets attach to bookings through the traveler: c.id = o.customer_id. Joining on a key that doesn't exist errors out; joining on the wrong one re-parents every market and the grid reads fiction.",
        },
      ],
      distractors: ["void", "open", "region", "user_id", "ASC", "0"],
      walkthrough:
        "A CASE pivot where the arms are the metric. Each SUM(CASE WHEN status = …) claims exactly one state — delivered 52, shipped 30, pending 14, cancelled 7, 103 in total — and COUNT(*) keeps the booked base whole so the completion share divides by the funnel that earned it: EU 24 of 45 = 53.3, APAC 21 of 37 = 56.8, US 5 of 19 = 26.3, LATAM 2 of 2 = 100. The US flip — 10 in-trip against 5 completed — is the reason the deck pivots instead of printing one network number. The distractors all break an arm: 'void' and 'open' are settlement statuses that zero an arm out, 'region' and 'user_id' name columns the orders table doesn't have (or re-parent the market join), 'ASC' would sort the string arm and zero it, and ROUND to 0 publishes whole-number shares no slide carries. One booking, one arm, denominator intact — that's the whole definition.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-ii", why: "Per-vertical demand folds from segment lines — the partner census at the right grain: verticals, not lines, not bookings." },
    { slug: "product-sales-analysis-iii", why: "First-purchase timing per unit — the new-vertical launch read: which bookable units a traveler touches first." },
    { slug: "sales-analysis-iii", why: "Date-filtered demand folds — the campaign-window read: journeys booked inside the sale window, whole denominator kept." },
    { slug: "basket-depth-aov", why: "Depth and average value per basket — the cross-sell ladder in textbook form: segments per booking against value per booking." },
    { slug: "funnel-step-conversion", why: "Stage-by-stage conversion with denominators per step — the search-to-book funnel the trading board lives on." },
    { slug: "email-engagement-funnel", why: "Funnel pivots over campaign events — the nudge read: which cross-sell email step converts before the booking window closes." },
    { slug: "percentage-of-users-attended-a-contest", why: "Distinct-participation shares — the completion-share pattern in another costume: DISTINCT travelers over stated bases, real division throughout." },
    { slug: "queries-quality-and-percentage", why: "Per-entity quality ratios — partner service shares and completion reads: a ratio per partner with the denominator folded honestly beside it." },
    { slug: "average-time-of-process-per-machine", why: "Per-lane latency pairs — the booking-to-travel clock at partner grain: 2.98 days network, per-market splits beside it." },
    { slug: "find-golden-hour-customers", why: "Date-math windows over activity — the booking-window read: which travelers convert inside the 2-to-4-day clock." },
    { slug: "top-travellers", why: "Traveler boards from journey sums — the top-booker list the loyalty desk targets, folded without the segment fan-out." },
    { slug: "bank-account-summary", why: "Per-account in/out folds — the partner settlement ledger: money in, money out, net per bill, cents over 100.0." },
    { slug: "employee-bonus", why: "LEFT JOIN with NULL fallback arms — the channel read: partners and travelers whose attribution field never filled in." },
    { slug: "customers-who-never-order", why: "Zero-demand anti-joins — the funnel leak detector; on this db it returns zero, and knowing that is the drill." },
    { slug: "rank-scores", why: "Tie-honest ranking — the partner board where four partners share a shelf size: RANK with the skip, stated out loud." },
    { slug: "unique-orders-and-customers-per-month", why: "Month-bucket dual counts — the pace census: journeys and distinct travelers per 'YYYY-MM' key across the 14-bucket window." },
  ],
};
