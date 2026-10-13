// Southwest — wave-6 kit 11 of the Travel & Hospitality domain.
// Airline-ops angle: route load factors, ancillary attach, Rapid Rewards
// redemption. Pool provenance: Southwest has NO registry tags in this app's
// pools — 0 tagged LC problems — so every topic and problem slug is
// theme-curated from scripts/company-pools.md's theme menu, mirroring the
// workflows Southwest screens are known to probe (load-state censuses,
// per-partition loyalty boards, capacity and boarding logic, anti-joins on
// zero attach). Case studies run on the storefront db with probed figures
// from scripts/company-facts.md — mapped honestly as orders=booked
// itineraries (PNRs), products=SKU families (fare + ancillaries),
// order_items=ancillary lines, customers=Rapid Rewards members,
// suppliers=supply partners, shipped_at=flight flown, region=crew base.

import type { CompanyKit } from "../types";

export const southwestKit: CompanyKit = {
  id: "southwest",
  domainId: "travel",
  name: "Southwest",
  tagline: "Low-fare US airline: schedules, boarding, loyalty",
  accent: "text-orange-400",

  brief: [
    "**Southwest** is the largest US domestic carrier by passengers — a point-to-point, single-cabin network where the fare is deliberately thin, bags fly free, and the margin lives in schedule density, ancillary attach and the {orange:Rapid Rewards} loyalty currency. In this app's training db the mapping is honest: `orders` are booked itineraries (PNRs), order_items are the ancillary lines a PNR carries (fare plus bags, upgrades, extras), products are SKU families, and shipped_at is the flight flown. Probed scale: **103 PNRs worth 34833.28** carrying 251 ancillary lines across 16 SKU families — about **2.4 lines** per itinerary, the attach story in one ratio.",
    "The data org is ops-shaped. Network planning owns load: **82 of 103** PNRs flew (52 arrived plus 30 in the air), 14 sit {amber:pending} in the booking window, and 7 are {rose:scrubbed} — 6.8% of demand that never boarded, the haircut every load forecast carries. Loyalty owns the tier ladder: the top members hold **63.5%** of flown value above the 3000 line, so award inventory follows a few heavy flyers. Finance owns the settlement stack, where partner money moves as integer cents across 28 invoices and 27 payments, with one {rose:void}-but-moved batch (925) the reconciliation table catches row-level.",
    "The SQL screens are live-db and denominator-ruthless. You will be asked for a load-state census in one pass — booked, flown, scrubbed, share — and the trap is filtering the denominator: a WHERE that drops {rose:scrubbed} before the fold prints a load factor the network never earned. You will be asked for the Rapid Rewards board — top earner per crew base — and the trap is the fold: 251 lines join until COUNT(*) counts SKUs and calls them members. Anti-join drills return **zero rows** here (every member and SKU has moved), and the fare ceiling sits at **199.99**, so premium-cabin filters come back empty by construction.",
    "Prep the way the screens run: conditional counts (`COUNT(*) FILTER (WHERE …)`, `SUM(CASE …)`) until the load census is one query with no sub-steps; window partitions until a per-base board handles ties and thresholds; joins plus aggregates until per-member and per-family reads survive the fan-out; julianday for the **2.98-day** average booking-to-departure lead; month buckets via `SUBSTR(created_at, 1, 7)` across 2024-01 to 2025-02. Then rehearse the two sentences the interviewer grades: *the numerator is PNRs that flew, the denominator is every PNR booked — and lines, members and units are three different counts on the same rows*.",
  ],

  dayInLife: [
    "**07:30 —** Load-state first: the overnight census — 103 PNRs booked, 82 flown, 14 {amber:pending} in the window, 7 {rose:scrubbed} — and the flown share beside it, 79.6, *with the denominator printed on the slide or the number means nothing*. A crew-base manager has already pinged about tomorrow's boarding curve, so the pace roll runs before the standup.",
    "**11:00 —** Deep work: the loyalty cut. Top earner per crew base — EU-base Alice Chen at **7262.35** over 24 PNRs, US-base Emma Wilson at 6640.56 over 17, APAC-base Grace Kim at 4574.23, LATAM-base Bruno Silva at 852.44 — folded with `ROW_NUMBER() OVER (PARTITION BY base …)`. The instinct being trained: partition the ladder by base or the board is one base's whales wearing the network's name.",
    "**14:30 —** Ops review: the ancillary attach board — 121 units in the busiest family across 54 PNRs, 11744.01 of value in the richest — and settlement hygiene: one invoice {rose:void} yet carrying a payment (925), flagged before the cents tie-out; one refundable batch 4000-paid of a 6148 bill. Revenue management wants the 6.8% scrub haircut on every forecast slide.",
    "**17:30 —** EOD writeup: the load note ships with definitions attached — flown versus booked, members as DISTINCT ids, lead time as julianday on flown PNRs only (**2.98** days, range 2 to 4) — and the data-quality queue takes the double-logged OTA ancillary rows for a `ROW_NUMBER` dedupe. The note goes out; the denominators ride along.",
  ],

  metrics: [
    { name: "Load factor", what: "PNRs that flew over PNRs booked — 82 of 103 on the db, 79.6%. The network's heartbeat: every read that filters scrubbed out of the base first is a load factor that lies." },
    { name: "Ancillary revenue per member", what: "Non-fare line value divided by DISTINCT members. Thin fares win seats; ancillaries win the quarter — this is the number the model actually optimizes." },
    { name: "Rapid Rewards concentration", what: "Share of flown value from members above a lifetime threshold — 63.5% at the 3000 line. Award inventory and tier projections are built on this whale curve." },
    { name: "Scrub / no-show share", what: "Scrubbed PNRs over booked PNRs — 6.8% network, 8.1% in the busiest base. Yield forecasts carry this haircut before seats are re-released." },
    { name: "Booking-to-departure lead", what: "julianday(flight) minus julianday(booking) on flown PNRs — 2.98 days average, range 2 to 4. The upsell and re-opt window by crew base." },
    { name: "Lines per PNR", what: "Ancillary lines over bookings — 251 over 103, about 2.4. The attach-rate proxy: how many SKUs the average itinerary carries beyond the fare." },
    { name: "Top-earner-per-base spread", what: "Loyalty value of each crew base's #1 member — 7262.35 at the top base down to 852.44. Where the award-redemption demand actually concentrates." },
    { name: "Average booking value", what: "Mean PNR total — 338.19 network, 383.48 in the richest base, 313.66 in the busiest. Fare-mix shifts show up here before they reach the yield calls." },
  ],

  topics: [
    {
      name: "Load-state conditional counts",
      why: "Every load read is a conditional census — booked, flown, pending, scrubbed, share — folded in one pass. FILTER (WHERE …) and SUM(CASE …) over status are the exact drills; the denominator discipline is the graded part.",
      slugs: ["flight-occupancy-and-waitlist-analysis", "immediate-food-delivery-ii", "monthly-transactions-ii"],
    },
    {
      name: "Ancillary attach folds",
      why: "Ancillary analytics lives on line items: units and value folded per SKU family, per period, per PNR. The join from itineraries to lines fans out, so every fold must state its grain — lines, units or DISTINCT PNRs.",
      slugs: ["product-sales-analysis-ii", "basket-depth-aov", "most-frequently-ordered-product-per-customer"],
    },
    {
      name: "Loyalty earn boards",
      why: "Rapid Rewards earns are ranked per member: lifetime value, PNR counts, top-N boards. Top-traveller and top-earner drills are the literal loyalty statement, folded without the ancillary fan-out.",
      slugs: ["top-travellers", "top-earners", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Per-base ranking windows",
      why: "The flagship loyalty board is top earner PER crew base — ROW_NUMBER with PARTITION BY, thresholds, and tie policy stated. Ranking drills with partitions and shared rungs are the exact shapes.",
      slugs: ["rank-scores", "department-top-three-salaries", "compute-the-rank-as-a-percentage"],
    },
    {
      name: "Rapid Rewards tier ladders",
      why: "Tiers are spend ladders over lifetime value — bucketed, tiled, classified. CASE-tier and RFM drills mirror the A-List/A-List Preferred cut the loyalty team re-runs every reload.",
      slugs: ["customer-purchasing-behavior-analysis", "the-category-of-each-member-in-the-store", "rfm-segmentation"],
    },
    {
      name: "Boarding & seat logic",
      why: "Open-boarding logic is row-neighborhood reasoning: consecutive seats, swaps, who boards before the cabin fills. Self-joins and ordering drills are the boarding-process questions this airline is famous for.",
      slugs: ["consecutive-available-seats", "exchange-seats", "last-person-to-fit-in-the-bus"],
    },
    {
      name: "Capacity & waitlist reads",
      why: "Load management is capacity arithmetic: passengers per vehicle against seats, greedy assignment, overbook detection. The capacity drills are the oversell-risk models in miniature.",
      slugs: ["the-number-of-passengers-in-each-bus-i", "the-number-of-passengers-in-each-bus-ii", "find-overbooked-employees"],
    },
    {
      name: "Turn billing & utilization",
      why: "Ancillaries bill by duration and turns are timed: duration-billed fees, span-versus-sum utilization, average process time per aircraft. Timestamp-pair arithmetic with CEIL-style billing rules is the drill.",
      slugs: ["calculate-parking-fees-and-duration", "server-utilization-time", "average-time-of-process-per-machine"],
    },
    {
      name: "Redemption coverage sweeps",
      why: "Partner settlement and award books are LEFT JOIN reads: every book against its redemptions, uncovered books surfaced. The anti-join arm — 6 books, 15217 cents, no settlement — is the monthly sweep.",
      slugs: ["bank-account-summary", "number-of-times-a-driver-was-a-passenger", "employees-with-missing-information"],
    },
    {
      name: "Zero-attach anti-joins",
      why: "A SKU family that never attaches, a base with no takers — the anti-join is the leak detector. On this db every member and SKU has moved, so the drill includes knowing when zero is the true answer.",
      slugs: ["sellers-with-no-sales", "find-churn-risk-customers", "unpopular-books"],
    },
  ],

  theory: [
    {
      id: "southwest-t1",
      q: "A per-member yield query joins PNRs to their ancillary lines and the member count explodes. What happened and what's the fix?",
      a: "The join fanned out: 103 PNRs carry 251 ancillary lines, so joining to lines multiplies member rows and COUNT(*) counts SKUs, not members. The fix is grain honesty — either fold lines to PNR level first in a CTE, then join up, or keep the fan-out and fold with COUNT(DISTINCT o.customer_id). I say the three counts out loud on any loyalty read: lines (251), PNRs (103), members (16 on this db) — and the one the slide claims must match the fold actually written. A Rapid Rewards number built on the wrong grain isn't slightly off; it's a different metric wearing the right name, and tier projections inherit the error.",
      tag: "joins",
    },
    {
      id: "southwest-t2",
      q: "The route board ranks bases by PNR count, and two bases tie. How do you make the tie a decision instead of an accident?",
      a: "Pick the window function by its tie policy and state it: ROW_NUMBER breaks ties arbitrarily — the board looks precise and is actually ordered by rowid. RANK gives tied bases the same rung and skips consumed slots (2, 2, then 4), which is honest about how many bases sit above. DENSE_RANK numbers rungs consecutively and hides the depth of the tie. On an ops board I ship RANK with a deterministic tiebreaker (base id), and if the tie itself matters — two bases at the same load — I surface the tie as a column, because 'tied' is a fact the network team will act on, not noise to hide behind an arbitrary integer.",
      tag: "windows",
    },
    {
      id: "southwest-t3",
      q: "Write the load-state census in one query: booked, flown, scrubbed, flown share. Where do candidates usually go wrong?",
      a: "One pass with conditional folds: COUNT(*) AS booked, COUNT(*) FILTER (WHERE shipped_at IS NOT NULL) AS flown, COUNT(*) FILTER (WHERE status = 'cancelled') AS scrubbed, and ROUND(100.0 * flown / COUNT(*), 1) AS flown_pct — 103, 82, 7, 79.6 on this db. The classic failure is a WHERE clause: filtering scrubbed out 'to keep it clean' shrinks the base to 96 and prints a load factor the network never earned; the second is integer division, where 100 * 82/103 truncates because the 100.0 entered after the slash. The census must keep every PNR in exactly one conditional bucket and all of them in the denominator — that is the whole definition, and the base prints beside the share.",
      tag: "aggregation",
    },
    {
      id: "southwest-t4",
      q: "shipped_at is NULL on 21 PNRs. What does that NULL mean, and how should queries treat it?",
      a: "On this mapping the NULL is a business state: the flight hasn't flown — 14 PNRs pending in the booking window and 7 scrubbed, 21 total. Treating it as dirty data is the cardinal error: filling it with today's date fabricates departures, excluding those rows from a load read shrinks the denominator and flatters load factor. The honest tools are state-based: COUNT(shipped_at) rides the NULL-blindness for the flown numerator, shipped_at IS NULL splits the not-flown arm into pending versus scrubbed by joining on status, and julianday lead-time math over NULL rows NULLs them — which is correct, because a PNR that never flew has no departure lead. NULL here is information; the queries should read it, not repair it.",
      tag: "nulls",
    },
    {
      id: "southwest-t5",
      q: "Where do WHERE and HAVING each belong in a per-base load query, and why does mixing them up matter?",
      a: "WHERE filters rows before the fold: base filters, date windows, 'PNRs created this month'. HAVING filters groups after the fold: bases with at least 10 PNRs, families whose attach crosses a bar. The pipeline order is FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY, and the two conditions are not interchangeable — WHERE COUNT(*) fails because the fold doesn't exist yet, and pushing a row filter into HAVING folds data you then throw away. On a small-network read the difference is real: gate the tiny bases in HAVING so a two-PNR base can't top a load board on sample size, and keep the base slice in WHERE so the fold only ever saw the rows that mattered.",
      tag: "pipeline",
    },
    {
      id: "southwest-t6",
      q: "Loyalty wants members whose lifetime value beats the network average member. Subquery, window, or CTE?",
      a: "All three are honest; the definition's weight picks one. A scalar subquery — HAVING SUM(total) > (SELECT AVG-of-per-member-folds) — is the compact benchmark read, staged so the benchmark folds at member grain, not PNR grain. A windowed fold, AVG(SUM(total)) OVER (), keeps every member in the result with their premium versus the network visible, which is what the tier deck actually wants. A CTE earns its place when 'lifetime value' needs a definition — scrubbed PNRs excluded, award redemptions netted — because a named two-stage fold survives review and a nested one-liner doesn't. What's not negotiable: the benchmark and the members must fold on the same grain, or the comparison is PNRs against members.",
      tag: "subqueries",
    },
    {
      id: "southwest-t7",
      q: "Two date reads every week: booking pace by month and booking-to-departure lead by base. What machinery does each need?",
      a: "Pace is bucketing: SUBSTR(created_at, 1, 7) makes a '2024-01' month key that GROUP BY folds and sorts correctly — the 14-bucket trend from 2024-01 (8 PNRs, 3731.97) through 2025-02. Lead time is instant math: julianday(shipped_at) - julianday(created_at) on the 82 flown PNRs, averaged to 2.98 days with the 2-to-4 range quoted, because the upsell window is sized in days. The traps I name out loud: bucketing the raw timestamp gives one row per PNR; julianday over NULL departures NULLs those rows, which is the definition and not a bug; and the round happens once at the edge so the deck, the query and the audit all print 2.98.",
      tag: "dates",
    },
    {
      id: "southwest-t8",
      q: "One OTA feed double-logs ancillary lines, and finance just found a void invoice carrying a payment. How do you keep both from poisoning load reads?",
      a: "Dedupe on a natural key, reconcile states against evidence. For the feed: ROW_NUMBER() OVER (PARTITION BY pnr, sku, event_time ORDER BY ingested_at DESC, id DESC) and keep rn = 1 — with the tiebreak stated, because 'latest' needs a deterministic definition when timestamps tie. For finance: conditional counts that cross-examine status against payment rows surface the void-but-moved invoice (925 on this db) and the paid-with-no-payments case (1756) before the tie-out, and the cents discipline — integer cents over 100.0 — keeps the money honest. The habit being graded: row counts are claims, keys and evidence are truth, and a load number shipped from a deduped, reconciled base is the only one worth defending in an ops review.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "southwest-mcq-1",
      prompt: "One-pass load census. Which fragment counts PNRs that actually flew — 82 of 103?",
      choices: [
        "COUNT(*) FILTER (WHERE status = 'delivered')",
        "COUNT(*) FILTER (WHERE o.shipped_at IS NOT NULL)",
        "COUNT(o.status)",
        "SUM(shipped_at)",
      ],
      answer: 1,
      why: "shipped_at is the flight-flown timestamp — NULL until the PNR flies. The FILTER keeps the conditional census in one pass: 82 flown, while COUNT(*) stays 103 in the same SELECT.",
      notes: [
        { choice: 0, why: "'Delivered' counts one raw state (52) — the mapped arrived bucket — but flights flown is arrived PLUS the in-air bucket, 82. Pick the state-free definition: shipped_at IS NOT NULL." },
        { choice: 3, why: "SUM over a timestamp column adds date numbers — a meaningless figure. Conditional counting needs a boolean predicate inside FILTER or CASE, not arithmetic on dates." },
      ],
      difficulty: "easy",
    },
    {
      id: "southwest-mcq-2",
      prompt: "Which expression prints the flown share as 79.6 rather than 0?",
      choices: [
        "100 * 82 / 103",
        "100.0 * COUNT(shipped_at) / COUNT(*)",
        "CAST(82 / 103 AS REAL) * 100",
        "82.0 / 103.0 (then multiply in the deck)",
      ],
      answer: 1,
      why: "The 100.0 promotes the fold to real arithmetic BEFORE the division — 82/103 becomes 79.6. Integer division happens first in every other option and truncates at the slash.",
      notes: [
        { choice: 0, why: "82/103 in integer arithmetic is 0; times 100 stays 0. The .0 has to enter before the division, not decorate it afterwards." },
        { choice: 2, why: "The cast happens after the integer division has already floored 82/103 to 0. Real-promotion must precede the slash." },
      ],
      difficulty: "easy",
    },
    {
      id: "southwest-mcq-3",
      prompt: "Booking pace by month for the ops pack. The GROUP BY key is:",
      choices: [
        "created_at (raw timestamp)",
        "strftime('%Y', created_at)",
        "SUBSTR(created_at, 1, 7)",
        "DATE(created_at, 'start of month') formatted in the deck",
      ],
      answer: 2,
      why: "SUBSTR(created_at, 1, 7) builds the '2024-01' year-month key — 14 buckets from 2024-01 (8 PNRs, 3731.97) to 2025-02 — that sorts correctly as text and folds the whole window.",
      notes: [
        { choice: 0, why: "The raw timestamp gives one group per PNR — 103 rows of one. Pace needs a derived bucket key, not the raw instant." },
        { choice: 1, why: "%Y collapses the window to two rows: 2024 and 2025. The seasonality story — and the YoY comparison — needs the month in the key." },
      ],
      difficulty: "easy",
    },
    {
      id: "southwest-mcq-4",
      prompt: "The ops deck's load factor divides PNRs that flew by PNRs booked. The denominator must:",
      choices: [
        "exclude scrubbed PNRs — they never flew",
        "include scrubbed PNRs — 7 of 103 stayed in the base, share 79.6",
        "exclude pending PNRs — they haven't flown either",
        "count only PNRs with ancillaries attached",
      ],
      answer: 1,
      why: "Load factor is flown over BOOKED — 82 over 103 — and the 7 scrubbed PNRs are booked demand that didn't fly. Filtering them out prints 82/96 = 85.4, a load factor the network never earned.",
      notes: [
        { choice: 0, why: "That's the classic flattering drift: dropping scrubbed demand shrinks the base and adds ~6 points of phantom load. The scrub haircut is reported, not removed." },
        { choice: 2, why: "Pending PNRs (14) are also booked demand — and they may still fly. Removing them shrinks the base further; the denominator is ALL PNRs booked, full stop." },
      ],
      difficulty: "medium",
    },
    {
      id: "southwest-mcq-5",
      prompt: "Base board: keep only crew bases with at least 10 booked PNRs. The gate goes in:",
      choices: [
        "WHERE COUNT(*) >= 10",
        "HAVING COUNT(*) >= 10",
        "LIMIT 10",
        "ORDER BY COUNT(*) DESC",
      ],
      answer: 1,
      why: "The PNR count is a fold — it exists only after GROUP BY — so the gate is HAVING. WHERE runs before grouping and can't see a count; LIMIT truncates rows, it doesn't define thresholds.",
      notes: [
        { choice: 0, why: "WHERE COUNT(...) is the classic error — the aggregate doesn't exist at row-filter time. Every gate on a fold lives in HAVING." },
        { choice: 3, why: "Sorting by the fold is ordering, not gating — small bases still appear, they just appear at the bottom. The ask was to EXCLUDE them." },
      ],
      difficulty: "medium",
    },
    {
      id: "southwest-mcq-6",
      prompt: "The route board ranks bases by PNR count. Two bases tie in third place (two bases sit above them). What does RANK() print for the tied pair and the next base?",
      choices: [
        "3, 4 then 5 — no shared rungs",
        "3, 3 then 4 — consecutive rungs, no skip",
        "3, 3 then 5 — ties share, next skips by tie size",
        "5, 5 then 6 — ties take the last slot",
      ],
      answer: 2,
      why: "RANK ties share the rung and the next base's rank jumps past the whole tie block: 3, 3, then 3 + 2 = 5. ROW_NUMBER would print 3, 4 arbitrarily; DENSE_RANK would print 3, 3, then 4 with no skip.",
      notes: [
        { choice: 0, why: "That's ROW_NUMBER — arbitrary distinct ranks inside the tie. The board would show one base 'ahead' of the other for no reason at all." },
        { choice: 1, why: "That's DENSE_RANK — consecutive rungs that hide how deep the tie was. Both are defensible conventions; only one is what RANK actually does." },
      ],
      difficulty: "medium",
    },
    {
      id: "southwest-mcq-7",
      prompt: "Ancillary value per itinerary by SKU family: family value divided by PNRs carrying it. The denominator is:",
      choices: [
        "COUNT(*) after joining order_items to products",
        "COUNT(DISTINCT oi.order_id)",
        "SUM(oi.quantity)",
        "COUNT(DISTINCT p.id)",
      ],
      answer: 1,
      why: "An itinerary is a PNR, and the join fans each PNR to one row per line — 103 PNRs become 251 rows. COUNT(DISTINCT oi.order_id) folds back to distinct PNRs: 46 for the busiest family.",
      notes: [
        { choice: 0, why: "COUNT(*) counts LINES — 251 across the network — and calls them PNRs. Ancillary value per itinerary drops about 2.4x and the attach story quietly inverts." },
        { choice: 2, why: "SUM(quantity) is the unit census (121 in the busiest family) — units over PNRs is units-per-PNR, a different metric than value-per-PNR." },
      ],
      difficulty: "medium",
    },
    {
      id: "southwest-mcq-8",
      prompt: "'PNRs still in play' = booked, not yet flown, not scrubbed. Which predicate returns exactly the 14 pending PNRs?",
      choices: [
        "WHERE shipped_at IS NULL — 21 PNRs",
        "WHERE status <> 'cancelled' — 96 PNRs",
        "WHERE shipped_at IS NULL AND status <> 'cancelled' — 14 PNRs",
        "WHERE status = 'pending' OR shipped_at IS NULL — 35 PNRs",
      ],
      answer: 2,
      why: "The 21 not-flown PNRs (shipped_at IS NULL) split into 14 pending and 7 scrubbed. In-play keeps only the pending arm: both conditions, because each alone over-counts by 7 or by 82.",
      notes: [
        { choice: 0, why: "shipped_at IS NULL includes the 7 scrubbed PNRs — demand that will never board. Claiming it's 'in play' inflates the re-opt pool." },
        { choice: 1, why: "status <> 'cancelled' keeps all 82 flown PNRs too. 'Not scrubbed' is not 'still pending' — the flown arm must be excluded as well." },
      ],
      difficulty: "hard",
    },
    {
      id: "southwest-mcq-9",
      prompt: "The loyalty board joins PNRs to ancillary lines and ranks members by COUNT(*). The top member shows 30 'bookings' but has 3 PNRs. What happened?",
      choices: [
        "The member really books 10x more than anyone — ship it",
        "The join fanned out: COUNT(*) counts ancillary lines, so rank by COUNT(DISTINCT o.id) or fold lines per PNR first",
        "COUNT(*) auto-deduplicates joined rows",
        "The rank should be SUM(o.id) instead",
      ],
      answer: 1,
      why: "On the fanned-out grain, COUNT(*) is the member's LINE count — 30 SKUs across 3 PNRs — not bookings. The board must fold at PNR grain (COUNT(DISTINCT o.id)) or stage lines-per-PNR in a CTE before ranking.",
      notes: [
        { choice: 0, why: "That's how an ancillary whale gets reported as a frequency whale — the two whales are different members, and the campaign targeting 'frequent flyers' would mail an attach outlier." },
        { choice: 3, why: "SUM over an id column adds id VALUES — a number that grows with id assignment. Aggregating an id is always a smell, never a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "southwest-mcq-10",
      prompt: "The redemption sweep anti-joins settlement books against received redemptions: 6 books totaling 15217 cents. The dollar exposure the deck prints is:",
      choices: [
        "15217.00 — invoices store dollars",
        "152.17 — settlement money is INTEGER cents, divide by 100.0",
        "1521.70 — divide by 10",
        "1.52 — divide by 10000",
      ],
      answer: 1,
      why: "Invoices and payments are INTEGER cents on this db: 15217 cents is 152.17 dollars after 15217 / 100.0. Orders.total and unit_price are the only dollar-valued columns.",
      notes: [
        { choice: 0, why: "That's the classic hundred-fold overstatement — printing cents as dollars. Every settlement exposure slide needs the /100.0 before it ships." },
        { choice: 2, why: "Dividing by 10 has no basis in the schema — the unit is cents, so the divisor is 100.0, and the ROUND happens once at the edge." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-swa-1",
      tier: "medium",
      topic: "t6",
      universe: "growth",
      title: "The Rapid Rewards flagship board",
      brief:
        "Southwest-flavored brief on the storefront db (orders = booked PNRs, customers = Rapid Rewards members, region = crew base): the loyalty review opens with the flagship board — the #1 lifetime earner PER crew base, lifetime value to 2dp, highest earner overall first. Probed facts: the network's whales sit at 63.5% of value above the 3000 line, and the per-base champions are EU-base Alice Chen at 7262.35 over 24 PNRs, US-base Emma Wilson at 6640.56 over 17, APAC-base Grace Kim at 4574.23 over 14, LATAM-base Bruno Silva at 852.44 over 2. The board must partition the ladder by base — one global ladder would be one base's whales wearing the network's name — and the rn <= 1 gate keeps exactly the champion row per partition.",
      ask: "Return the #1 lifetime earner per crew base: base, member, lifetime value (2dp), overall-highest first.",
      template:
        "WITH member AS (\n  SELECT c.region,\n         c.name,\n         ROUND(SUM(o.total), {3}) AS lifetime_value,\n         ROW_NUMBER() OVER (PARTITION BY {1} ORDER BY SUM(o.total) {4}) AS rn\n  FROM orders o\n  JOIN customers c ON c.id = o.{5}\n  GROUP BY c.id\n)\nSELECT region, name, lifetime_value, rn\nFROM member\nWHERE rn <= {2}\nORDER BY lifetime_value DESC;",
      slots: [
        {
          answer: "c.region",
          kind: "keyword",
          label: "the base partition",
          why: "PARTITION BY c.region crowns one champion per crew base — 4 rows. Partitioning by c.city crowns 16 (one per city) and the flagship board drowns in single-city winners.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the champion gate",
          why: "rn <= 1 keeps exactly the top earner per partition — 4 champions. At rn <= 3 the board prints the top three per base (7+ rows) and stops being a flagship read.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          noVerify: true,
          why: "Lifetime value prints to 2dp — 7262.35, 6640.56, 4574.23, 852.44 — matching every money cell in the pack. ROUND to 0 publishes 7262, a number no other slide carries.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the top-down window order",
          why: "The ladder orders by SUM(o.total) DESC so rn 1 is the highest earner. ASC crowns the smallest spender per base — the board would name Olivia Brown an EU champion.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the member key",
          why: "PNRs reach members through the customer key: c.id = o.customer_id. There is no order_id on orders — the join fails outright instead of mis-crediting anyone's points.",
        },
      ],
      distractors: ["c.city", "c.id", "0", "ASC", "order_id"],
      walkthrough:
        "A partition-board read where the PARTITION BY is the whole game. The CTE folds each member's PNRs to lifetime value — SUM(o.total) per member, rounded once — and stamps ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) so the ladder resets per crew base; rn <= 1 keeps only champions. Four rows come back: Alice Chen 7262.35 for the EU base, Emma Wilson 6640.56 for US, Grace Kim 4574.23 for APAC, Bruno Silva 852.44 for LATAM — ordered by value so the network's biggest whale leads. The distractors each break the board: c.city crowns 16 single-city 'champions', c.id partitions per member (everyone is their own #1), 0 empties the gate entirely, ASC promotes the smallest spenders to flagship status, and the impossible join key fails the build. Partition first, then rank, then gate — never one global ladder.",
    },
    {
      id: "cs-swa-2",
      tier: "easy",
      topic: "s6",
      universe: "funnel",
      title: "The boarding-state census",
      brief:
        "Southwest-flavored brief on the storefront db (orders = booked PNRs, status = boarding state, shipped_at = flight flown): the ops review opens with the boarding census — every PNR in exactly one named state, one row per state, biggest state first, share of the network beside each count. Probed facts: 103 PNRs booked; 52 arrived (50.5% of the base), 30 enroute (29.1%), 14 in the boarding window (13.6%), 7 scrubbed (6.8%). The census is a single pass — the CASE labels the states, the conditional folds count them, and the share divides by the whole base so the four shares sum to 100. A WHERE that drops scrubbed PNRs 'to keep it clean' prints a base of 96 and four shares that no longer add up.",
      ask: "Return per boarding state: state label, PNRs, share of all booked PNRs (1dp) — biggest state first.",
      template:
        "SELECT CASE o.status\n         WHEN 'delivered' THEN 'arrived'\n         WHEN '{1}' THEN 'enroute'\n         WHEN 'pending' THEN 'boarding'\n         ELSE '{2}' END AS board_state,\n       COUNT(*) AS pnrs,\n       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), {3}) AS share\nFROM orders o\nGROUP BY board_state\nORDER BY pnrs {4};",
      slots: [
        {
          answer: "shipped",
          kind: "keyword",
          label: "the enroute state",
          why: "status = 'shipped' is the mapped in-air bucket — 30 PNRs currently flying. 'pending' would fold the 14 boarding-window PNRs into the enroute label and the two arms would collide.",
        },
        {
          answer: "scrubbed",
          kind: "keyword",
          label: "the scrubbed label",
          why: "The ELSE arm catches the 7 cancelled PNRs under the ops name 'scrubbed' — the 6.8% haircut the forecast carries. Relabeling it 'delivered' would bury never-boarded demand inside the arrived arm's story.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          noVerify: true,
          why: "Shares print to 1dp — 50.5, 29.1, 13.6, 6.8 — matching every percentage cell in the pack. ROUND to 0 publishes 50 and 29, and the four buckets no longer sum to 100.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first order",
          why: "Ops reads the funnel from the biggest state: 52, 30, 14, 7. ASC would lead with the 7 scrubbed PNRs and frame the network as a cancellation story.",
        },
      ],
      distractors: ["pending", "delivered", "ASC", "2"],
      walkthrough:
        "A boarding census where the CASE is the whole game. One pass, no sub-steps: the CASE maps each raw status to an ops name — delivered to arrived, shipped to enroute, pending to boarding, everything else (the 7 cancelled) to scrubbed — GROUP BY board_state folds 103 PNRs into four rows, and the share divides each bucket by SUM(COUNT(*)) OVER (), the whole base computed in the same pass: 50.5, 29.1, 13.6, 6.8, summing to 100. The distractors each scramble the funnel: 'pending' in the enroute arm collides two states and leaves shipped PNRs stranded in ELSE, 'delivered' as the scrubbed label buries never-boarded demand under the arrived story, ROUND to 0 breaks the shares-off-one-base read, and ASC leads the review with the scrub bucket. Every PNR in exactly one named bucket; every bucket's share over the whole base.",
    },
  ],

  problems: [
    { slug: "flight-occupancy-and-waitlist-analysis", why: "Capacity and waitlist states side by side — the load-factor read in graded form: seats sold, waitlisted, and the share that actually flew." },
    { slug: "immediate-food-delivery-ii", why: "Share of orders meeting a promise flag — the flown-share shape: numerator a state, denominator ALL PNRs, 82-of-103 in textbook form." },
    { slug: "monthly-transactions-ii", why: "Conditional classification stacked per month — the boarding census with UNION ALL scaffolding: one row per state, no bucket left unnamed." },
    { slug: "product-sales-analysis-ii", why: "Per-family demand folds from ancillary lines — the attach census at the right grain: families, not lines, not PNRs." },
    { slug: "basket-depth-aov", why: "Depth and average value per basket — lines per PNR against value per PNR: the ancillary attach read in graded form." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Argmax per member — each PNR's dominant SKU family: the attach-preference read behind per-tier ancillary targeting." },
    { slug: "top-travellers", why: "Lifetime distance ranked per traveler — the Rapid Rewards earn statement in textbook form: folded per member, ranked, ties handled." },
    { slug: "top-earners", why: "Top-N over folded value with ties handled — the member and base boards, ranked on a fold that survives the ancillary fan-out." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Frequency argmax — the most-frequent-flyer read: PNR count per member, not lines, not units." },
    { slug: "rank-scores", why: "Score ladders where ties share rungs: RANK versus DENSE_RANK as a board-design decision — the base-board tie problem in textbook form." },
    { slug: "department-top-three-salaries", why: "Top-N per partition — the top-three earners per crew base: PARTITION BY with a rank gate, the flagship board's bigger sibling." },
    { slug: "compute-the-rank-as-a-percentage", why: "Rank expressed as a share of the partition — loyalty percentile boards: where this member sits against the base, computed not eyeballed." },
    { slug: "customer-purchasing-behavior-analysis", why: "Spend-tier ladders over lifetime value — the A-List cut: members bucketed by earn, tiers priced from the 63.5% whale line." },
    { slug: "the-category-of-each-member-in-the-store", why: "CASE classification per member from folded spend — the tier-label read: bronze through preferred assigned in one pass." },
    { slug: "rfm-segmentation", why: "NTILE quintiles over recency, frequency, value — the loyalty-segmentation cut behind award-marketing audiences." },
    { slug: "consecutive-available-seats", why: "Row-neighborhood seat logic — the boarding/seat-block read: consecutive seats for a party, self-join shaped." },
  ],
};
