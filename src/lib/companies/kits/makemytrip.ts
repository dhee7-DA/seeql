// MakeMyTrip — kit 5 of the Travel & Hospitality domain (Batch G).
// India's travel portal: flights + hotels + rail under one booking engine,
// festival-season demand curves, and a payment/settlement mix (card, bank
// transfer, UPI rails) where money is stored as integer cents and the
// /100.0 discipline is day one. Pool provenance: MakeMyTrip has NO registry
// tags in this app's pools — zero tagged sql rows — so every problem and
// topic slug is theme-curated from scripts/company-pools.md's theme menu,
// mirroring workflows MMT screens are known to probe (calendar folds,
// payment mix, traveler leaderboards, multi-vertical stacks). Case studies
// run on the storefront db with probed figures from scripts/company-facts.md
// — mapped honestly as orders=bookings across verticals, customers=travelers,
// suppliers=airline/hotel/rail partners, products=fare classes and room
// categories, region=market.

import type { CompanyKit } from "../types";

export const makemytripKit: CompanyKit = {
  id: "makemytrip",
  domainId: "travel",
  name: "MakeMyTrip",
  tagline: "India's travel portal: flights to hotels",
  accent: "text-indigo-500",

  brief: [
    "MakeMyTrip is India's largest online travel group — MakeMyTrip, Goibibo and redBus under one roof, selling flights, hotels, rail and holidays into the world's most price-sensitive, most festival-driven travel market. The demand physics are unlike Western OTAs: *the calendar IS the demand curve* (Diwali, Dussehra, the summer-break exodus), verticals mix in one basket (a flight booking and a hotel booking are the same row shape), and settlement runs through India's payment rails — cards, bank transfer, UPI — where a booking can {rose:cancel after payment} and the money leg is its own table. In this app's training db the mapping is honest: `orders` are bookings across verticals, customers are travelers, suppliers are the airline/hotel/rail partners, products are fare classes and room categories, region is market. Probed scale: **103 bookings worth 34833.28** at a 338.19 average, 16 travelers booking from Mumbai, Osaka, Seoul and Dubai on the APAC side to Berlin, London and Madrid on the EU side, dates running 2024-01 through 2025-02.",
    "The data org is calendar-shaped. Demand planning reads the month fold first — on the db, monthly bookings run a **6-to-9 band** with 2024-01 peaking at 8 bookings worth 3731.97 — because staffing, pricing and partner allocations all key off the festival curve. Payments analytics owns the mix: 27 settlements split **card 16 / bank-transfer 11**, worth 37364.00 and 32248.00 dollars, with money stored as integer cents so every dollar read is `amount_cents / 100.0` — and the reconciliation table (unpaid invoices, split settlements, one {rose:void-but-paid} row) is checked row-level, not by eyeball. Supply partnerships and a finance close cadence fill out the week.",
    "Interview style is calendar-plus-denominator. Screens walk from a single-table fold (the payment mix, the month trend) into a rate whose denominator is the test (cancellation share is **7 of 103 placed**, 6.8% overall, 8.1% in the worst market), then into windows for traveler leaderboards where ties are real (four travelers sit at 4 bookings on the db). Follow-ups probe definitions out loud: is that AOV per booking or per traveler, does the festival window include its last night, did you divide cents by 100 or by `100.0`. The interviewer is listening for the two habits that survive an Indian festive spike: *state the grain, own the boundary*.",
    "Preparation strategy: MakeMyTrip has no tagged pool in this app's registry — zero sql rows carry the tag — so the kit curates all thirty-two problems from the theme menu and says so. Do the ten topics in order, then rebuild all {indigo:six case files} on the live db: the **settlement-mix read** at month close (a single-table fold from raw cents to dollars), the **traveler loyalty leaderboard** (a booking-frequency rank window with the repeat-traveler gate made explicit, *ties sharing the rung*), the **festival-versus-rest stack** (a UNION ALL packet with the half-open boundary owned), the **partner coverage read** (a supply-first LEFT JOIN with a conditional-DISTINCT cancellation count), the **festival curve** on the %Y-%m spine (one fold, the cancelled branch inside it) and **months above the platform AOV** (a scalar-subquery bar with its empty-set edge case rehearsed). This kit is built for spaced practice rather than one sitting: run each case, then re-run it a week later from a blank editor — *the second pass is where recall actually forms* — and treat the walkthroughs as the real content: they narrate what every wrong chip breaks.",
  ],

  dayInLife: [
    "**09:00 —** The morning starts on the calendar board, and the first query is a reconciliation: did last night's bookings land across verticals, does the bookings-value fold tie to the settlement feed, are the month-to-date counts inside the festival-curve band. The month fold refreshes — **6-to-9 bookings a month** on the training db, 2024-01 the peak at 8 — and the {rose:cancellation curve} gets its read: **7 of 103 placed** overall, worst market 8.1%. A bookings-versus-settlements mismatch is the day's first fire, and the analyst who can write the diff query — which invoice, which rows, how many cents — is the one everyone waits on before the partner call.",
    "**11:30 —** Midday is payments and demand planning. A finance analyst wants the settlement mix: card versus bank transfer, counts and dollar totals, from raw integer cents (**16 settlements worth 37364.00** against 11 worth 32248.00 on the db) — plus the exceptions pass: the **6 unpaid invoices worth 15217.00**, the split-settlement rows, the {rose:void-but-paid} invoice the reconciliation is expected to catch before close. A demand planner wants the festival view: monthly bookings and revenue on the `%Y-%m` spine, the peak month isolated, the AOV per booking (338.19) held flat across the season argument. Each ask is a fold, a boundary decision and a cents discipline, and the strong habit is writing the query twice: once to answer, once with the definition printed.",
    "**14:30 —** The afternoon tilts to stakeholder cycles. The weekly growth review wants the traveler leaderboard — bookings per traveler ranked, lifetime spend beside it, the repeat gate (2+ bookings) applied — because loyalty arguments in this market are made on the second booking, not the first: on the db, only **2 of 16** travelers never came back, and the top of the board is **24 bookings worth 7262.35**. Partner reviews read the same data from the supply side; the month-close pack assembles the payment mix, the AR position and the trend in one stack.",
    "**18:00 —** Rituals hold it together: every number ships with its SQL attached, a boundary nobody owns is treated as an open bug, and the last hour is handoff — tomorrow's two numbers must **reconcile, in writing**. The handoff note lists the settlement-feed state, the festival-curve band and the open AR exceptions, so the morning reconciliation starts from tonight's truth. In a market where the calendar moves demand, the definition of the window is the metric — *own the boundary, print the grain*.",
  ],

  metrics: [
    { name: "Gross bookings value", what: "SUM(total) across verticals — 34833.28 on the training db. Flights, hotels and rail fold into one number here, and 'placed' versus 'kept' is the first fork an interviewer makes you declare." },
    { name: "Payment-mix split", what: "Settlement count and value by rail — card 16 / 37364.00 versus bank transfer 11 / 32248.00 (from integer cents). The mix read that decides partner economics, computed with the /100.0 discipline." },
    { name: "Festival-peak read", what: "Monthly bookings on the %Y-%m spine — a 6-to-9 band with 2024-01 peaking at 8 bookings / 3731.97. The calendar curve every staffing and pricing decision keys off." },
    { name: "AOV", what: "Revenue ÷ bookings — 338.19, from one fold (not an average of per-traveler averages). The weighted-versus-two-step question is a standing MMT follow-up." },
    { name: "Traveler concentration", what: "Revenue share from the top lifetime spenders — 63.5% of revenue comes from travelers whose lifetime spend crosses 3000 (71.2% above 2000). The dependency metric behind every loyalty debate." },
    { name: "Repeat-traveler rate", what: "Travelers with 2+ bookings — 14 of 16 on the db; only 2 never came back. In a festival-driven market the second booking IS the loyalty story, and the ≥2 gate must be stated." },
    { name: "Cancellation share", what: "Cancelled ÷ placed bookings — 7 of 103 (6.8%) overall, 8.1% in the worst market. The kept-demand denominator, folded from the same rows as the numerator." },
    { name: "Settlement behavior", what: "Days from invoice to payment on settled invoices — 28.4 average, fastest 13, slowest 84, against flat 30-day terms — plus the AR position: 6 unpaid invoices worth 15217.00." },
  ],

  topics: [
    {
      name: "Festival-calendar math",
      why: "The calendar IS the demand curve in this market: monthly folds on the %Y-%m spine (6-to-9 bookings, peaking at 8), trailing windows for season reads, cutoffs before a festival date. The standing trap is BETWEEN on the last night of the window.",
      slugs: ["monthly-transactions-i", "user-activity-for-the-past-30-days-i", "the-latest-login-in-2020", "rolling-7d-actives", "rising-temperature", "unique-orders-and-customers-per-month", "same-day-sale"],
    },
    {
      name: "Cents-safe settlement folds",
      why: "India's payment rails land in the warehouse as integer cents, so every dollar read is amount_cents / 100.0 and every integer division is a silent truncation leak. Card 37364.00 versus bank transfer 32248.00 is the fold every finance screen starts from.",
      slugs: ["bank-account-summary-ii", "trial-balance-check", "monthly-transactions-ii", "prepayment-detection", "ar-aging-schedule", "chargeback-rate-ranking"],
    },
    {
      name: "Vertical-mix censuses",
      why: "Flights, hotels and rail are one bookings table distinguished by category — so vertical mix is a CASE-classified census: branches per vertical with totals that must reconcile against COUNT(*). The branch boundary is a definition someone owns.",
      slugs: ["count-salary-categories", "weather-type-in-each-country", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Traveler leaderboards",
      why: "Loyalty reporting is ranking work: bookings per traveler, lifetime spend beside it, ties everywhere (four travelers sit at 4 bookings on the db). RANK versus ROW_NUMBER versus DENSE_RANK is a vocabulary check the interview starts with.",
      slugs: ["rank-scores", "top-travellers", "department-top-three-salaries", "customer-order-frequency", "premier-league-table-ranking", "nth-highest-salary"],
    },
    {
      name: "Multi-vertical report stacks",
      why: "The month-close pack stitches populations: settled versus unsettled, card versus transfer, festival month versus the rest. UNION ALL with matching column shapes and per-branch literals is the stack that survives review; a silently deduping UNION hides overlap evidence.",
      slugs: ["team-scores-in-football-tournament", "league-statistics", "movie-rating", "customers-who-bought-a-and-b-not-c"],
    },
    {
      name: "Rates on India-scale funnels",
      why: "Confirmation rates, cancellation shares, conversion lifts — the funnels are large and the denominators are the test. 100.0 before the division, the denominator's population decided before the ratio, rounding only at the edge.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "funnel-step-conversion", "second-day-confirmation"],
    },
    {
      name: "Repeat-traveler growth reads",
      why: "The growth story is the second booking: repeat-purchase rates, reactivation of lapsed travelers, loyalty cohorts. These are conditional counts and first-booking comparisons — with the ≥2 gate and the cohort definition stated out loud.",
      slugs: ["repeat-purchase-rate", "growth-accounting", "find-loyal-customers", "users-with-two-purchases-within-seven-days", "cohort-repeat-revenue", "winback-recovery"],
    },
    {
      name: "Booking-path subqueries",
      why: "Screens escalate into nested logic: travelers whose FIRST booking landed in the festival window, months beating the platform-average AOV, partners above the network-average revenue. IN, EXISTS and scalar shapes each carry an empty-inner-query edge case the follow-up hunts for.",
      slugs: ["game-play-analysis-iv", "market-analysis-i", "second-highest-salary", "the-most-recent-three-orders"],
    },
    {
      name: "Itinerary text hygiene",
      why: "Traveler names arrive ALL-CAPS from KYC feeds, email domains sit buried in free text, partner names drift in case. Screens warm up with string reshaping because a join on a dirty key is a silent fan-out nobody catches until the census doubles.",
      slugs: ["fix-names-in-a-table", "find-all-unique-email-domains", "invalid-tweets"],
    },
    {
      name: "Seat & window inventory pairing",
      why: "Inventory questions pair rows with rows: seats held together, bookings close enough to share a journey, the gap between a traveler's trips. Self-joins and LEAD windows with a stated tie rule are the inventory toolkit.",
      slugs: ["consecutive-available-seats", "biggest-window-between-events", "flight-occupancy-and-waitlist-analysis"],
    },
  ],

  theory: [
    {
      id: "mmt-t1",
      q: "The festival read: how do you bucket bookings by month, isolate the peak, and make sure the window didn't silently drop the festival's last night?",
      a: "Bucket on the %Y-%m spine: STRFTIME('%Y-%m', created_at) or SUBSTR(created_at, 1, 7) — both give '2024-01', and on fixed-width ISO text the SUBSTR slice is safe, but it silently mis-buckets the day one row arrives as '2024-1-5'. Fold with COUNT(*), SUM(total) and the cancelled flag per month — the db's fold runs a 6-to-9 band with 2024-01 peaking at 8 bookings worth 3731.97 — then window (LAG or MAX) to rank months. The window trap: a festival window written as BETWEEN '2024-10-01' AND '2024-10-31' drops everything after midnight on the last day — the biggest booking night of Diwali week. Half-open intervals — >= start AND < the day after the end — are the honest shape. State the calendar convention (whose midnight, which timezone), then query it; a festival read that can't say where its boundary sits is a staffing decision made on a lucky guess.",
      tag: "dates",
    },
    {
      id: "mmt-t2",
      q: "Payments arrive as integer cents — card 3736400, bank transfer 3224800. Walk me through the fold that prints the mix safely, and the division bug that survives for months.",
      a: "The fold is one GROUP BY: method, COUNT(*) for settlement count, ROUND(SUM(amount_cents) / 100.0, 2) for dollars — 16 / 37364.00 and 11 / 32248.00 on this db. The .0 is the entire discipline: SUM of INTEGERs is an INTEGER, and INTEGER / 100 in SQLite is integer division — it happens to print 37364 here because the total lands on even hundreds, which is exactly why the bug survives: any odd-cent settlement truncates silently and the reconciliation tie-out leaks half-dollars per row. The same discipline extends to ratios: 100.0 * part / whole before any division, rounding once at the end. The deeper habit is granularity honesty — a per-settlement average (AVG(amount_cents) / 100.0) and a total are different metrics; the mix report needs the total, the partner economics need the average, and a query that can't say which one it prints is a report that starts arguments in the close.",
      tag: "aggregation",
    },
    {
      id: "mmt-t3",
      q: "The loyalty leaderboard ranks travelers by booking frequency, and four travelers are tied at 4 bookings. What does each rank function print, and how do you make the choice deterministic?",
      a: "RANK() prints 6, 6, 6, 6 for the tied four and jumps to 10 next — the rungs the tie consumed are skipped. DENSE_RANK() prints 6 then 7 — no gaps, ties share a rung. ROW_NUMBER() prints 6, 7, 8, 9 — separate ranks for tied rows, decided by engine-arbitrary order unless you add a tie-breaker. The deterministic fix is the composite ORDER BY inside OVER: ORDER BY bookings DESC, lifetime_spend DESC, customer_id ASC — business-first, then a stable key — so a re-run prints the same board. On this db the full 14-traveler board reads 1, 2, 3, 4, 5, then the four-way tie at 6, a two-way tie at 10, a three-way tie at 12 — and the choice matters commercially: the loyalty email that 'targets rank 6' either hits four travelers (RANK/DENSE) or one arbitrary traveler (ROW_NUMBER without a tie-break). The MMT habit: pick the function by asking what the business does with ties, then make it deterministic anyway.",
      tag: "windows",
    },
    {
      id: "mmt-t4",
      q: "Bookings, fare classes and partners live in three tables. Which JOIN do you reach for when the report must show every vertical even if a partner sold nothing — and what does filtering a right-table column in WHERE do to that decision?",
      a: "LEFT JOIN from the spine the report promises: partners LEFT JOIN bookings keeps every partner row, with NULL booking columns where demand didn't arrive — the supply-first shape a partner review needs, because an absent row reads as 'partner deleted', not 'partner idle'. The trap is the WHERE clause: filtering o.status = 'confirmed' (a right-table column) after a LEFT JOIN silently discards every unmatched partner row — NULL fails the comparison — and the LEFT JOIN becomes an INNER JOIN without anyone choosing that. The fix is placing the predicate in the ON clause, where it filters the match instead of the survivor, or filtering inside a conditional aggregate so the population stays whole. On the MMT flip side, a kept-revenue report across verticals legitimately INNER-joins — an order with no partner is corruption worth flagging, not a row to silently drop. Join type is a decision about who survives; at this company the survival question is always 'every vertical, every partner, or every booking?' — and the answer belongs in the metric name.",
      tag: "joins",
    },
    {
      id: "mmt-t5",
      q: "In the festival read, where does `status != 'cancelled'` live versus `COUNT(*) >= 5` — and what does the alias rule tell you about where each clause can see what?",
      a: "The pipeline decides: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. status is a row-level fact, so it lives in WHERE — cancelled rows are discarded before the fold, which is correct for a kept-demand count and fatal for a cancellation SHARE (the denominator must keep them; there the status rides inside a CASE in SELECT instead). COUNT(*) >= 5 is a group-level fact — it exists only after GROUP BY — so it lives in HAVING. The alias rule follows from the order: SELECT aliases are born after WHERE runs, so an alias fails in WHERE (engines agree) while SQLite leniently resolves it in GROUP BY, HAVING and ORDER BY — the portable habit writes the underlying expression everywhere except ORDER BY. The MMT-grade summary: 'bookings above the festival floor' is a row predicate (WHERE); 'months with at least 5 bookings' is a fold predicate (HAVING); and a cancellation share that filtered cancelled rows in WHERE has a denominator of only cancellations — every market reads 100%. Grain first, then the clause chooses itself.",
      tag: "pipeline",
    },
    {
      id: "mmt-t6",
      q: "Which months beat the platform-average booking value — and what happens to that query when the inner average is computed over an empty filtered set?",
      a: "The shape stages two folds: per-month totals in a derived table or CTE, then the comparison against the platform average — WHERE month_revenue > (SELECT AVG(...)) over the staged rows, or a window (AVG() OVER ()) if the comparison must ride beside every row. The scalar-subquery contract is 0-or-1 rows: on the full db the average exists and the comparison is honest; on a filtered slice — one vertical, one festival window — an empty inner fold yields NULL, every comparison goes UNKNOWN, and the report silently prints nothing exactly where the question is most interesting. That empty-inner behavior is the edge case the follow-up hunts: say it out loud, and prefer IN/EXISTS when membership is the question or COALESCE-plus-guard when the row must survive. The correlated variant — each month against its own vertical's average — re-runs per outer row and answers a different question (local versus platform standard) at a different cost. At MMT the distinction is real: a festival month 'beats the platform' and 'beats its vertical' are two different claims in the same review.",
      tag: "subqueries",
    },
    {
      id: "mmt-t7",
      q: "A booking's shipped_at stays NULL until fulfilment. What does that NULL do in filters, joins and aggregates — and what's the policy for the latency report?",
      a: "Three behaviors, then a policy. Filters: NULL fails both x = value and x != value (the comparison is UNKNOWN), so WHERE shipped_at <= deadline silently drops unfulfilled bookings — sometimes the right scope, sometimes a silent leak; the only way to find them is IS NULL, explicitly. Aggregates: AVG and COUNT(shipped_at) skip NULLs while COUNT(*) keeps the row — the db's 82 non-NULL versus 103 total is the in-flight population, and the gap is a metric, not an error. Joins: NULL keys never match, so a booking with a NULL partner reference vanishes from INNER joins. The policy: latency is defined over fulfilled bookings only — on this db 82 dispatched rows averaging 2.98 days (range 2..4) — so the report says 'latency of fulfilled bookings; pending excluded by definition', prints the COUNT beside the AVG so the population is visible, and never lets a WHERE clause do definitional work silently. A festival-season latency spike and a pending-stockpile are different incidents; the population statement is what tells them apart.",
      tag: "nulls",
    },
    {
      id: "mmt-t8",
      q: "The close found a void invoice with a payment row, five invoices settled across two payment rows each, and one invoice paid 4000 against a 6148 bill. How does SQL surface all three anomalies in one pass?",
      a: "One pass, three conditional folds over the invoice-payment join. Group per invoice: COUNT(p.id) for payment rows, SUM(p.amount_cents) / 100.0 for paid dollars, and CASE branches for the classes — void-but-paid (status = 'void' AND COUNT > 0, the db's invoice #11 at 925.00), split settlements (COUNT > 1, five invoices on this db), and shortfall (SUM < amount, the 4000-of-6148 partial). The reconciliation habit underneath: two definitions of 'settled' — status versus payment existence — must agree, and the diff IS the report; totals that tie out hide all three anomalies, which is why the census is row-level with a coverage class per invoice. Money discipline holds throughout: integer cents divided by 100.0, never integer division, rounding once at the edge. The MMT-grade deliverable is the classed list — which invoice, which anomaly, how many cents — because the close doesn't act on 'something is off'; it acts on rows.",
      tag: "quality",
    },
    {
      id: "mmt-t9",
      q: "The demand planner buckets by month and someone proposes `STRFTIME('%m', created_at)`. What does that fold print, and why is it wrong for this business?",
      a: "'%m' alone yields '01'..'12' — every January of every year folded into one bucket. On a db spanning 2024-01 through 2025-02 the fold prints 12 rows where 13 exist, and January-2024's festival peak absorbs January-2025's bookings silently. The honest spine is '%Y-%m' — year and month together — and the same discipline extends to '%Y-%d' style slips: a bucket that can't name its year is a bucket that can't be audited. At MMT the calendar IS the demand curve, and a fold that merges years quietly rewrites the curve: 2024-02's 9 bookings and 2025-02's 7 are different festival stories, and the staffing plan reads them as one.",
      tag: "dates",
    },
    {
      id: "mmt-t10",
      q: "Growth asks for 'bookings in the trailing 30 days'. How does that window differ from month-to-date, and how do you write it so it can't drift?",
      a: "Month-to-date resets on the 1st; a trailing window is anchored to NOW — on this db the difference is 6-to-9 bookings per month versus whatever slice the last 30 days catch, which can span a festival edge or miss it entirely. The drift-proof form computes the anchor in the query: created_at >= DATE('now', '-30 days') (or a frozen anchor date passed in, so re-runs reproduce). The trap is hand-rolling the anchor in the caller's timezone while the timestamps carry no zone declaration — 'day' becomes a convention nobody wrote down. At MMT the trailing read feeds the daily standup, so the window is stated in the metric name ('bookings, trailing-30d, IST close') and the query carries exactly that definition.",
      tag: "dates",
    },
    {
      id: "mmt-t11",
      q: "The cancellation share by market printed 100% in every row. The analyst swears the math is right. What clause did they get wrong, and where does the fix live?",
      a: "They filtered cancelled rows in WHERE — which removes them from the DENOMINATOR too, so every market's group contains only its cancellations and the share is 100% by construction. The fix is placement: the rows stay in the fold, and the numerator rides inside a conditional aggregate — 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — with 100.0 forcing real division before integer truncation. WHERE keeps its legitimate job (a region filter, a date window); the status branch belongs in SELECT because the metric's definition includes the rows it counts against. At MMT the 6.8% network share and the 8.1% worst-market read both survive the review precisely because the denominator never left the query.",
      tag: "pipeline",
    },
    {
      id: "mmt-t12",
      q: "The month-close pack stacks the settled-invoice packet over the open-invoice packet. Why UNION ALL and not UNION — and what must both branches share?",
      a: "UNION ALL. The two packets are disjoint by definition (an invoice is either settled or open), so dedupe computes nothing — and if a definition bug ever makes an invoice appear in both, UNION silently deletes the duplicate and the pack still balances, hiding exactly the anomaly the close exists to catch. UNION ALL is also cheaper: no dedupe pass. Both branches must project the same columns in the same order — the first branch's aliases name the output — and per-branch literals ('settled'/'open') label each row so the stack is self-documenting. ORDER BY sits outside the stack, sorting the combined result. At MMT the pack is the review artifact: a stack that self-cleans is a close that can't be audited.",
      tag: "setops",
    },
    {
      id: "mmt-t13",
      q: "Partner ops wants each invoice's payment methods folded into one cell for the split-settlement audit. How does GROUP_CONCAT do it, and what does the output look like on a split?",
      a: "GROUP_CONCAT(p.method) after joining payments to invoices folds each invoice's payment rows into one string — a clean invoice prints 'card', a split settlement prints 'card,wire' and names itself. GROUP BY i.id is the grain: one row per invoice, methods concatenated in arrival order (add ORDER BY inside the fold for determinism on newer SQLite). The caveat that matters: the string is a display cell, never a join key — parsing it back apart undoes the fold and re-introduces the fan-out. The split detection itself stays numeric: COUNT(p.id) > 1 in the same query. At MMT the manifest column sits beside the counts so the auditor reads the shape and the arithmetic from the same row.",
      tag: "aggregation",
    },
    {
      id: "mmt-t14",
      q: "Loyalty wants travelers split into four spend tiers. Why NTILE(4), and what should you say about the boundaries?",
      a: "NTILE(4) OVER (ORDER BY lifetime_spend DESC) assigns bucket numbers 1-4 with row counts balanced across tiles — on 16 travelers that's exactly 4 per tier, which is the clean case; on odd counts the earlier tiles take the remainder and saying so is part of the deliverable. NTILE is positional, not value-aware: two travelers with the same spend can be cut into different tiers at a boundary, so a tie-breaker in the OVER's ORDER BY (or a threshold-based CASE tier instead) is needed if equal spenders must share a tier. The deeper question is definitional: tiers as distribution (NTILE — recomputes as the base grows) or tiers as definition (fixed spend thresholds — stable campaigns). At MMT the loyalty email targets 'tier 1', so the query must be able to say which kind of tier it printed.",
      tag: "windows",
    },
    {
      id: "mmt-t15",
      q: "The festival review wants month-over-month booking deltas. How does LAG build that column, and what does the first month print?",
      a: "LAG(bookings) OVER (ORDER BY month) lays the previous month's count on each row, and the delta is current minus lag — no self-join, no correlated subquery. The first month has no previous, so LAG returns NULL and the delta is NULL: correct, and it must be reported as 'start of series', never COALESCE'd into a fake zero delta that the trend chart would dutifully plot. PARTITION BY scopes the comparison — by vertical or market if the delta must not cross them — because an unpartitioned lag compares a flight-heavy month to a rail-heavy one. At MMT the deltas are read against the festival curve: the swing into the peak month and the swing out are the numbers staffing argues with, and they're only as honest as the partition boundary the query declares.",
      tag: "windows",
    },
    {
      id: "mmt-t16",
      q: "Traveler emails sit in one column — 'ana@gmail.com'. How do you extract the domain for the partner-marketing fold, and what does a malformed row become?",
      a: "SUBSTR(email, INSTR(email, '@') + 1) — INSTR finds the @, SUBSTR slices after it, and the +1 is the entire expression: without it every 'domain' starts with @. GROUP BY that expression folds travelers by provider. The malformed edge: a row with no @ yields INSTR = 0, so SUBSTR(email, 1) returns the WHOLE address — a typo becomes a fake provider bucket that silently grows with bad data. The MMT habit: run the hygiene probe first (WHERE email NOT LIKE '%@%'), report the no-@ count as its own class, and only then trust the provider fold — a contact-hygiene read that hides its malformed rows is a read that will surprise the campaign team.",
      tag: "strings",
    },
    {
      id: "mmt-t17",
      q: "KYC feeds land traveler names in ALL-CAPS — 'PRIYA SHARMA'. How do you normalize for the per-person dedupe, and why can't SQL finish the job alone?",
      a: "The initcap shape: UPPER(SUBSTR(name, 1, 1)) || LOWER(SUBSTR(name, 2)) per word — SQLite has no INITCAP, so the expression is spelled out, and the dedupe fold groups on the normalized key so 'PRIYA SHARMA' and 'Priya Sharma' collapse into one traveler instead of two thin ones. The limits are the lesson: SQL sees characters, not names — it can't know 'MCLORE' becomes 'McLore' or that 'LI WEI' is one surname, so normalized-case dedupe catches the mechanical duplicates and the rest is an upstream fix. At MMT the honest deliverable is the pair: the query's normalized fold (with its catch count) and a flagged list of names the expression can't rule on — the SQL finding is evidence, the canonical name table is the cure.",
      tag: "casing",
    },
    {
      id: "mmt-t18",
      q: "Which travelers have no booking in the festival window? Compare NOT IN, NOT EXISTS and LEFT JOIN … IS NULL — and what does one NULL in the inner set do?",
      a: "LEFT JOIN bookings restricted to the window … WHERE o.id IS NULL keeps every traveler and marks the ones with no matching row — the anti-join whose survival logic is visible in the query. NOT EXISTS (SELECT 1 … WHERE o.customer_id = c.id AND o.created_at >= window-start AND < window-end) is equivalent and NULL-safe by construction. NOT IN (SELECT customer_id FROM orders WHERE window) is the trap: a single NULL customer_id in the subquery turns every x NOT IN comparison UNKNOWN and the report prints ZERO travelers — a blank retention slide that looks like a clean sheet. The MMT-grade habit: anti-joins are written NULL-proof by default, and the empty result is reported as a result ('everyone booked in the window'), never assumed to be a bug or a blessing.",
      tag: "subqueries",
    },
    {
      id: "mmt-t19",
      q: "Platform AOV is 338.19. A colleague averages each traveler's average booking and gets a different number. Which is right, and why do they differ?",
      a: "The platform AOV is the weighted fold: SUM(total) / COUNT(*) — or ROUND(AVG(total), 2) over all 103 bookings — where every booking counts equally. The colleague's two-step average weights every TRAVELER equally: Alice Chen's 24 bookings and a one-time booker's single booking each contribute one row to the second average, so big repeat bookers pull the simple fold up and the two-step pulls it down. Neither is 'wrong' — they answer different questions — but the metric named 'average order value' is the booking-weighted one, and the report that prints both must label them ('per booking' versus 'per traveler'). At MMT the standing follow-up is exactly this: say which denominator the number carries before anyone plans a campaign on it.",
      tag: "aggregation",
    },
    {
      id: "mmt-t20",
      q: "The peak-month read says 8 bookings from 5 travelers. Which counts produced each number, and why does the pair matter?",
      a: "COUNT(*) counts booking rows — 8; COUNT(DISTINCT o.customer_id) counts travelers — 5, because repeat bookers placed more than one booking in the month. Printed together they're the demand read: volume AND breadth, and the gap is the repeat activity inside the window. The same pair drives the rest of the kit: COUNT(*) versus COUNT(DISTINCT invoice_id) exposes split settlements (27 payment rows, 22 invoices paid), COUNT(*) versus COUNT(shipped_at) separates 103 placed from 82 dispatched. The failure mode is one number wearing two names — 'bookings' that's actually bookings-plus-lines, 'travelers' that's actually bookings. At MMT every population statement ships as a pair, because an argument about a metric is usually an argument about which count produced it.",
      tag: "aggregation",
    },
    {
      id: "mmt-t21",
      q: "The loyalty board reprints in a different order every run while four travelers sit tied at 4 bookings. How do you make the board deterministic?",
      a: "Add a tie-breaker inside the window: RANK() OVER (ORDER BY bookings DESC, lifetime_spend DESC, customer_id ASC) — business metric first, then a stable attribute, then the immutable id. Ties now share the rung AND print in a fixed order, so a re-run reproduces the board exactly. The same discipline governs pagination: LIMIT/OFFSET without a deterministic ORDER BY lets rows duplicate and vanish across pages as ties swap. The habit at MMT: every leaderboard ships with its secondary key printed in the deliverable ('ties broken by lifetime spend, then id'), because the loyalty email that targets 'rank 6' must hit the same four travelers every time the board regenerates — determinism is the property that makes two runs comparable.",
      tag: "windows",
    },
    {
      id: "mmt-t22",
      q: "Partner settlements carry 30-day terms. How do you compute days-to-pay and the late flag in SQL, and where does the average lie?",
      a: "JULIANDAY(paid_on) − JULIANDAY(issued_on) is the latency in fractional days, and the late flag is a comparison against the terms — paid 28.4 days late on average across settled invoices, fastest 13, slowest 84 against a flat 30-day bar. The averages lie in two ways: rounding per row before averaging drifts the mean (round once at the end), and the population is 'settled invoices only' — the 6 unpaid invoices worth 15217.00 sit outside the average entirely, and the gap IS the AR position. The report prints the COUNT beside the AVG ('latency over settled invoices only') so the population is visible. At MMT terms math is a promise to the partner: state whose calendar the days ride on, then query it — never the reverse.",
      tag: "dates",
    },
    {
      id: "mmt-t23",
      q: "The calendar reads (month folds, festival windows) are getting slow and the plan shows a full scan of orders. When is that fine, and when do you reach for an index?",
      a: "Read the plan: EXPLAIN QUERY PLAN on the month fold shows a scan of all 103 orders — and for a fold over every row, that's optimal: no index helps a query that qualifies everything, and it's a nightly batch anyway. The index earns its keep on selective predicates: the festival-window slice (created_at >= '2024-10-01' AND < '2024-11-01') probing a year of bookings, or the traveler-id lookups the loyalty board rides — an index on orders(created_at) or orders(customer_id) turns the scan into a range probe. The cost is write-side: every booking insert maintains every index, and the booking feed is the hot path. At MMT the rule is workload-honest: batch folds scan, interactive slices index, and the analysis starts with EXPLAIN — not with CREATE INDEX.",
      tag: "indexes",
    },
    {
      id: "mmt-t24",
      q: "The close found an invoice marked paid with no payment rows, and another paid 4000 against a 6148 bill. What's the general SQL pattern that catches both — and any third anomaly of the same family?",
      a: "Two definitions of 'settled' — status versus payment existence — must agree, and the diff IS the report. The pattern is a per-invoice fold with conditional aggregates: COUNT(p.id) for payment rows, SUM(p.amount_cents)/100.0 for paid dollars, and CASE branches classifying each invoice — paid-status-with-zero-rows (the db's anomaly #28), short-paid (4000 of 6148), split across multiple rows (COUNT > 1, five invoices on this db), and the void-but-paid invoice #11 at 925.00. Totals that tie out hide every one of these: 66012 paid cents can reconcile as a sum while individual invoices are wrong. The deliverable is the classed row list — which invoice, which class, how many cents — because the close acts on rows, not on the comforting observation that something is off.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "mmt-mcq-1",
      prompt: "The month fold shows 8 bookings in 2024-01, the peak. Which expression produced the '2024-01' bucket from a TEXT timestamp?",
      choices: [
        "SUBSTR(created_at, 1, 7)",
        "SUBSTR(created_at, 6, 2)",
        "MONTH(created_at)",
        "STRFTIME(created_at, '%Y-%m')",
      ],
      answer: 0,
      why: "On fixed-width ISO text, SUBSTR(created_at, 1, 7) slices 'YYYY-MM' — the month bucket the festival curve is built on, year and month together.",
      notes: [
        { choice: 1, why: "That slices '01' — month without year, so January 2024 and January 2025 collapse into one 'peak'. The year is the curve." },
        { choice: 3, why: "STRFTIME's arguments are reversed — format first: STRFTIME('%Y-%m', created_at). As written it's an argument-order error, and there is no MONTH() in SQLite either." },
      ],
      difficulty: "easy",
    },
    {
      id: "mmt-mcq-2",
      prompt: "Card settlements total 3736400 cents across 16 rows. Which expression prints the dollar total 37364.0 correctly — and stays correct for odd-cent rows?",
      choices: [
        "SUM(amount_cents) / 100",
        "ROUND(SUM(amount_cents) / 100.0, 2)",
        "AVG(amount_cents) / 100.0",
        "SUM(amount_cents / 100)",
      ],
      answer: 1,
      why: "The .0 makes the division real BEFORE any truncation, and ROUND bounds the display once at the end — the cents-safe fold that survives odd-cent settlements.",
      notes: [
        { choice: 0, why: "INTEGER / INTEGER truncates. 3736400 happens to divide evenly; a 92550-cent row prints 925 and the missing 50 cents never reconciles — the bug that survives for months." },
        { choice: 2, why: "That's the MEAN settlement (a per-payment lens, 233525 cents → 2335.25), not the mix total. The mix report needs SUM; the partner economics need AVG — say which." },
      ],
      difficulty: "easy",
    },
    {
      id: "mmt-mcq-3",
      prompt: "7 of 103 bookings cancelled. Which expression prints the 6.8% share?",
      choices: [
        "100 * 7 / 103",
        "ROUND(100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1)",
        "ROUND(100.0 * COUNT(status = 'cancelled') / COUNT(*), 1)",
        "100.0 * 7 / COUNT(DISTINCT customer_id)",
      ],
      answer: 1,
      why: "The conditional SUM counts cancellations while COUNT(*) holds placements from the same rows, and 100.0 forces real division — 7/103 prints 6.8, not 6.",
      notes: [
        { choice: 0, why: "All-integer arithmetic: 700/103 truncates to 6. The .0 must touch the division itself, not sit in a nearby literal." },
        { choice: 2, why: "COUNT(boolean) counts non-NULL results — a boolean never IS NULL, so this counts all 103 rows and prints 100.0. The conditional counter is SUM, never COUNT." },
      ],
      difficulty: "easy",
    },
    {
      id: "mmt-mcq-4",
      prompt: "The close needs one row per invoice with: payment rows, paid dollars, and a class — exact / split / none. Which shape delivers it in one pass?",
      choices: [
        "Three separate queries joined by invoice id",
        "GROUP BY invoice with COUNT(p.id), SUM(p.amount_cents)/100.0 and a CASE coverage class",
        "One query per class, stacked with UNION",
        "SELECT invoice_id, status FROM invoices",
      ],
      answer: 1,
      why: "The grouped conditional fold computes rows, dollars and class from one scan — the reconciliation census the close is budgeted for, with branches that reconcile against the group.",
      notes: [
        { choice: 0, why: "Three scans and two joins: works, but an invoice missing from one scan prints NULL instead of 0, and the audit window doesn't fit three passes." },
        { choice: 2, why: "UNION stacks rows of the same shape, not columns of one invoice — the output is a long table, not the per-invoice census, and classes can't reconcile per row." },
      ],
      difficulty: "medium",
    },
    {
      id: "mmt-mcq-5",
      prompt: "Four travelers are tied at 4 bookings; the next has 3. What does DENSE_RANK() assign the next traveler after the tied four (who share rank 6)?",
      choices: [
        "7",
        "10",
        "6",
        "9",
      ],
      answer: 0,
      why: "DENSE_RANK never skips: ties share rank 6, the next distinct value gets 7. RANK would skip to 10; ROW_NUMBER would never have tied at all.",
      notes: [
        { choice: 1, why: "10 is RANK's answer — it consumes one rung per tied row. Knowing which function leaves gaps IS the vocabulary check the leaderboard question opens with." },
        { choice: 3, why: "9 is ROW_NUMBER's answer if the four ties got 6,7,8,9 — but ROW_NUMBER doesn't tie, so the premise is already broken under it." },
      ],
      difficulty: "medium",
    },
    {
      id: "mmt-mcq-6",
      prompt: "The kept-demand report LEFT JOINs travelers to bookings, then filters `WHERE o.status = 'confirmed'`. What happened to travelers with no confirmed bookings?",
      choices: [
        "They stay, with NULL booking columns",
        "They silently vanished — the WHERE turned the LEFT JOIN into an INNER JOIN",
        "They stay, with status shown as NULL",
        "The query errors on the NULL comparison",
      ],
      answer: 1,
      why: "NULL fails the comparison, so unmatched traveler rows are discarded — the LEFT JOIN's whole point, undone by clause placement. The predicate belongs in the ON clause (or inside a conditional aggregate).",
      notes: [
        { choice: 0, why: "Survival happens at WHERE, before any display: the row fails status = 'confirmed' (NULL comparison is UNKNOWN) and is dropped, not displayed." },
        { choice: 3, why: "NULL comparisons don't raise — they evaluate UNKNOWN and filter the row out. The silent drop is the bug precisely because nothing errors." },
      ],
      difficulty: "medium",
    },
    {
      id: "mmt-mcq-7",
      prompt: "The festival window is October 1 to October 31, timestamps included. Which WHERE is festival-correct?",
      choices: [
        "WHERE created_at BETWEEN '2024-10-01' AND '2024-10-31'",
        "WHERE created_at >= '2024-10-01' AND created_at < '2024-11-01'",
        "WHERE STRFTIME('%m', created_at) = '10'",
        "WHERE created_at LIKE '2024-10%'",
      ],
      answer: 1,
      why: "The half-open interval keeps every moment of October 31 — the year-end-of-festival booking night BETWEEN drops at midnight. Boundaries are definitions; the half-open form is the one that matches 'October includes its last night'.",
      notes: [
        { choice: 0, why: "BETWEEN '2024-10-31' stops at 2024-10-31 00:00:00 — every booking that night after midnight vanishes from the peak, and the festival curve quietly undercounts its best night." },
        { choice: 2, why: "Month-only matching pulls every October of every year — fine in a single-year db, a silent cross-year leak the moment 2025-10 lands. Buckets need the year too." },
      ],
      difficulty: "medium",
    },
    {
      id: "mmt-mcq-8",
      prompt: "The loyalty board needs only travelers with 2+ bookings, ranked. Where does the `>= 2` gate live, and why?",
      choices: [
        "WHERE COUNT(*) >= 2 — filter early, fold fast",
        "HAVING COUNT(*) >= 2 — the count exists only after the fold",
        "LIMIT 2 — keep the top two rows",
        "WHERE bookings > 2 — same thing, written shorter",
      ],
      answer: 1,
      why: "Booking count is a property of the GROUP, so the gate is HAVING. WHERE runs before GROUP BY and cannot see a count that doesn't exist yet.",
      notes: [
        { choice: 0, why: "WHERE COUNT(...) is the classic clause-order error — the aggregate doesn't exist where WHERE executes. Gates on folds are always HAVING." },
        { choice: 3, why: "Two bugs in one: same clause-order problem as WHERE COUNT, and > 2 excludes exactly the 2-booking travelers the loyalty program is trying to catch." },
      ],
      difficulty: "hard",
    },
    {
      id: "mmt-mcq-9",
      prompt: "A month-close query computes `total > (SELECT AVG(total) FROM orders WHERE region = 'LATAM')` on a slice where LATAM rows were purged. What does the report print?",
      choices: [
        "Every row — comparison against an empty subquery is TRUE",
        "Zero rows, no error — the empty inner fold yields NULL, and every comparison against NULL is UNKNOWN",
        "A 'subquery returned no rows' error",
        "The rows where total IS NULL",
      ],
      answer: 1,
      why: "A scalar subquery over zero rows yields NULL — not an error — and x > NULL is UNKNOWN, so the WHERE passes nothing: a silently blank report exactly where the data question is loudest.",
      notes: [
        { choice: 0, why: "Comparison against NULL is never TRUE — that's the trap's whole mechanism. The empty-scalar contract, not comparison logic, is the bug class." },
        { choice: 2, why: "SQLite doesn't raise on a scalar subquery returning no rows — it returns NULL. The error-based mental model is exactly what lets this bug ship." },
      ],
      difficulty: "hard",
    },
    {
      id: "mmt-mcq-10",
      prompt: "The close must stack the card-settlement packet and the bank-transfer packet into one result set. Which stack survives the review?",
      choices: [
        "UNION — so overlapping rows can't double-count",
        "UNION ALL, both branches projecting the same columns in the same order, each labelled with a literal",
        "Two ORDER BYs, one per branch",
        "Different column names per branch, aliased after the stack",
      ],
      answer: 1,
      why: "The two populations are disjoint by definition, so UNION ALL is free — and the shared positional shape plus per-branch literals ('card'/'wire') makes the pack self-documenting and diff-reviewable.",
      notes: [
        { choice: 0, why: "UNION dedupes — and if a definition bug ever makes the branches overlap, it deletes the evidence and the pack still balances. Disjoint sets want UNION ALL so overlap would show." },
        { choice: 2, why: "ORDER BY sits outside the stack and sorts the combined result; per-branch sorts are either discarded or mangled, and they hide the real sort intent from the reviewer." },
      ],
      difficulty: "hard",
    },
    {
      id: "mmt-mcq-11",
      prompt: "The ops census asks: what booking statuses exist in the pipeline? Which query returns the exact list — pending, shipped, delivered, cancelled?",
      choices: [
        "SELECT DISTINCT status FROM orders",
        "SELECT status FROM orders",
        "SELECT UNIQUE(status) FROM orders",
        "SELECT status, COUNT(*) FROM orders",
      ],
      answer: 0,
      why: "DISTINCT collapses 103 booking rows to their 4 distinct status values — the vocabulary of the pipeline in one cheap query. Every later status fold is only as good as this list being complete.",
      notes: [
        { choice: 1, why: "That prints 103 rows — the vocabulary drowned in the data. The census is a de-duplication, not a dump." },
        { choice: 3, why: "COUNT(*) without GROUP BY folds everything to one grand total (103) — a single row, not the status list. The fold needs GROUP BY status to per-status counts." },
      ],
      difficulty: "easy",
    },
    {
      id: "mmt-mcq-12",
      prompt: "The fulfilment report says '82 of 103 bookings dispatched'. Which count pair produced both numbers from the same orders table?",
      choices: [
        "COUNT(shipped_at) and COUNT(*)",
        "COUNT(*) and COUNT(DISTINCT *)",
        "SUM(shipped_at IS NOT NULL) and SUM(*)",
        "COUNT(shipped_at) and COUNT(shipped_at) + 21",
      ],
      answer: 0,
      why: "COUNT(shipped_at) skips NULLs — 82 dispatched; COUNT(*) keeps every row — 103 placed. The 21-row gap is the in-flight population, and it's visible without a second query.",
      notes: [
        { choice: 2, why: "SUM(*) isn't valid SQL — the star folds only in COUNT. The boolean-sum form needs SUM(CASE WHEN … THEN 1 ELSE 0 END), or simply the non-NULL count." },
        { choice: 3, why: "The magic +21 hard-codes today's pending stockpile — one fulfilment sweep and the report lies. The gap is derived, never typed." },
      ],
      difficulty: "easy",
    },
    {
      id: "mmt-mcq-13",
      prompt: "The ledger spans 2024-01 through 2025-02. Which expression splits the 103 bookings into the year buckets — 90 in 2024, 13 in 2025?",
      choices: [
        "STRFTIME('%Y', created_at)",
        "STRFTIME('%m', created_at)",
        "SUBSTR(created_at, 6, 2)",
        "YEAR(created_at)",
      ],
      answer: 0,
      why: "STRFTIME('%Y', …) yields '2024'/'2025' — the year bucket that keeps the two festival seasons separate. GROUP BY it and the fold prints 90 and 13, comparable New Years.",
      notes: [
        { choice: 1, why: "'%m' is month-only — January 2024 and January 2025 fold into one '01' bucket. The cross-year leak that quietly rewrites the festival curve." },
        { choice: 3, why: "There is no YEAR() in SQLite — the calendar functions are STRFTIME/JULIANDAY/DATE. Dialect muscle-memory is how queries die on the first portable run." },
      ],
      difficulty: "easy",
    },
    {
      id: "mmt-mcq-14",
      prompt: "The bookings-value fold must print 34833.28. Which expression produces it — and which prints 103?",
      choices: [
        "COUNT(total)",
        "ROUND(SUM(total), 2)",
        "AVG(total)",
        "MAX(total)",
      ],
      answer: 1,
      why: "SUM(total) adds every booking's value — 34833.28, rounded once for display. COUNT(total) counts non-NULL rows (103), a census wearing a money column's name.",
      notes: [
        { choice: 2, why: "AVG(total) is the per-booking mean — 338.19, the AOV. It's the right number for the wrong slide: revenue and AOV are different metrics, and the deck labels them." },
        { choice: 3, why: "MAX(total) is the single biggest booking — the leaderboard cell, not the total. One whale is not the market." },
      ],
      difficulty: "easy",
    },
    {
      id: "mmt-mcq-15",
      prompt: "Traveler emails sit in one column — 'ana@gmail.com'. Which expression yields the domain 'gmail.com' for the provider fold?",
      choices: [
        "SUBSTR(email, INSTR(email, '@'))",
        "SUBSTR(email, INSTR(email, '@') + 1)",
        "INSTR(email, '@')",
        "SPLIT(email, '@')[2]",
      ],
      answer: 1,
      why: "INSTR finds the @ position, SUBSTR slices from one past it — the +1 is the whole expression. GROUP BY that expression folds travelers by provider for the co-marketing read.",
      notes: [
        { choice: 0, why: "Without the +1 every domain starts with '@' — '@gmail.com' groups separately from 'gmail.com' and the provider fold splits in two." },
        { choice: 3, why: "SPLIT with array indexing isn't SQLite — it's a different dialect's daydream. String slicing here is INSTR + SUBSTR, said out loud." },
      ],
      difficulty: "medium",
    },
    {
      id: "mmt-mcq-16",
      prompt: "Loyalty wants the 16 travelers split into four spend tiers of four. Which window function assigns the tiers?",
      choices: [
        "NTILE(4) OVER (ORDER BY lifetime_spend DESC)",
        "ROUND(lifetime_spend / 4)",
        "RANK() OVER (ORDER BY lifetime_spend) / 4",
        "GROUP BY lifetime_spend / 4",
      ],
      answer: 0,
      why: "NTILE(4) distributes rows into 4 balanced buckets — 16 travelers give exactly 4 per tier. It's the distribution-based tiering the loyalty platform uses when tiers are defined by rank, not by spend thresholds.",
      notes: [
        { choice: 2, why: "RANK divided by 4 isn't a bucket — integer division re-tiers unevenly and ties at a boundary cut arbitrarily anyway. NTILE exists for exactly this ask." },
        { choice: 3, why: "GROUP BY folds rows away — 16 travelers collapse to buckets, not rows WITH a tier label. Tiers annotate every traveler; they don't replace them." },
      ],
      difficulty: "medium",
    },
    {
      id: "mmt-mcq-17",
      prompt: "Month-over-month booking deltas: `LAG(bookings) OVER (ORDER BY month)`. What does the FIRST row of the series print for the delta?",
      choices: [
        "0 — no change from a nonexistent previous month",
        "NULL — there is no previous month, and the NULL is the honest 'start of series'",
        "The first month's own bookings",
        "A division-by-zero error",
      ],
      answer: 1,
      why: "LAG over the series' first row finds nothing before it and returns NULL; the delta is NULL too. Report it as 'start of series' — COALESCE to zero would draw a fake flat month on the trend chart.",
      notes: [
        { choice: 0, why: "Zero is a measurement ('no change'); NULL is the absence of one. The trend chart that plots 0 inventories a data point that never happened." },
        { choice: 2, why: "LAG returns the PREVIOUS row's value — the first row has none. LEAD would return the next month's, which answers a different question." },
      ],
      difficulty: "medium",
    },
    {
      id: "mmt-mcq-18",
      prompt: "Per-market cancellation share: on the bookings feed (market, status), one analyst computes `SELECT market, COUNT(*) FROM bookings WHERE status = 'cancelled' GROUP BY market`. What's wrong with the shape?",
      choices: [
        "Nothing — that's the cancellation share",
        "The WHERE removed the cancelled rows' denominator — this prints cancellation COUNTS, and any share built on it reads 100%",
        "GROUP BY market is illegal on a status column",
        "COUNT(*) counts only confirmed bookings",
      ],
      answer: 1,
      why: "Filtering cancelled rows in WHERE means the fold never sees placements — the output is per-market cancellation counts. A share needs both sides from the same rows: SUM(CASE WHEN status='cancelled' …)/COUNT(*) with no status filter.",
      notes: [
        { choice: 0, why: "It's the numerator half, correct as a count — the bug is calling it a share. The 6.8% network read and this query are one clause apart." },
        { choice: 2, why: "GROUP BY market is perfectly legal — the query runs fine and prints confident numbers. That's what makes the missing denominator dangerous." },
      ],
      difficulty: "medium",
    },
    {
      id: "mmt-mcq-19",
      prompt: "For the split-settlement audit, each invoice's payment methods should print as one cell — 'card' or 'card,wire'. Which fold produces it?",
      choices: [
        "GROUP_CONCAT(p.method) with GROUP BY i.id",
        "CONCAT(p.method) with GROUP BY i.id",
        "p.method || p.method",
        "JOIN(p.method, ',') with GROUP BY i.id",
      ],
      answer: 0,
      why: "GROUP_CONCAT is the row-to-cell fold: one row per invoice, its payment methods comma-joined — clean invoices print 'card', splits print 'card,wire' and name themselves for the auditor.",
      notes: [
        { choice: 1, why: "There is no CONCAT aggregate in SQLite — and a plain concatenation can't fold multiple rows into one cell anyway. Folding is GROUP_CONCAT's job." },
        { choice: 2, why: "|| joins values WITHIN one row — a split invoice has two rows, so nothing combines. The fan-out stays visible and the cell never forms." },
      ],
      difficulty: "medium",
    },
    {
      id: "mmt-mcq-20",
      prompt: "Platform AOV is 338.19. A colleague computes each traveler's average booking, then averages those 16 numbers, and gets less. Why?",
      choices: [
        "The colleague rounded twice — rounding always lowers a mean",
        "The two-step average weights every TRAVELER equally; the platform AOV weights every BOOKING equally — repeat bookers pull the simple fold up",
        "AVG ignores NULL totals — the two-step doesn't",
        "Both are the same number; the colleague's client truncated",
      ],
      answer: 1,
      why: "The booking-weighted fold (SUM/COUNT over 103 bookings) is the platform AOV; the traveler-weighted two-step gives Alice Chen's 24 bookings the same weight as a one-time booker's single booking. Different denominators, different numbers — both real, only one is 'AOV'.",
      notes: [
        { choice: 0, why: "Rounding at the display edge moves the third decimal at most — the gap here is structural weighting, not presentation. Name the denominator." },
        { choice: 3, why: "They genuinely differ — the two-step is not a rounding of the one-step. A report that can't say which it prints starts arguments in the close." },
      ],
      difficulty: "medium",
    },
    {
      id: "mmt-mcq-21",
      prompt: "The loyalty board paginates 5 per page, ranked by bookings. Which query returns the SECOND page (ranks 6-10)?",
      choices: [
        "LIMIT 5 OFFSET 5",
        "LIMIT 10",
        "LIMIT 5 SKIP 5",
        "OFFSET 5 LIMIT 5",
      ],
      answer: 0,
      why: "LIMIT 5 OFFSET 5 skips the first five ranked rows and returns the next five — page two, provided the ORDER BY is deterministic (a tie-break), or ties swap between pages.",
      notes: [
        { choice: 1, why: "LIMIT 10 returns pages one AND two — the recipient double-counts the top five. Pagination without OFFSET re-sends." },
        { choice: 3, why: "OFFSET before LIMIT isn't the SQLite grammar — the clause is LIMIT n OFFSET m. Word order is the dialect's contract, not a style choice." },
      ],
      difficulty: "medium",
    },
    {
      id: "mmt-mcq-22",
      prompt: "The fulfilment report must show every booking with an effective dispatch date — shipped_at when it exists, otherwise the text 'pending'. Which expression does it?",
      choices: [
        "COALESCE(shipped_at, 'pending')",
        "shipped_at OR 'pending'",
        "IFNULL('pending', shipped_at)",
        "NULLIF(shipped_at, 'pending')",
      ],
      answer: 0,
      why: "COALESCE returns the first non-NULL argument — the real date for 82 bookings, the stated 'pending' label for the 21 in flight. The placeholder policy is visible in the query, which is what makes it defensible.",
      notes: [
        { choice: 2, why: "IFNULL's arguments are backwards here — it returns 'pending' whenever 'pending' is non-NULL, which is always. Every booking reads pending." },
        { choice: 3, why: "NULLIF(a, b) returns NULL when a equals b — it manufactures NULLs, it doesn't replace them. The in-flight rows stay blank." },
      ],
      difficulty: "medium",
    },
    {
      id: "mmt-mcq-23",
      prompt: "The retention query uses `WHERE customer_id NOT IN (SELECT customer_id FROM orders WHERE festival_window)` to find travelers who skipped the festival. One order row in the window has customer_id NULL. What prints?",
      choices: [
        "The festival-skippers, correctly",
        "Zero rows — every NOT IN comparison is UNKNOWN against a set containing NULL",
        "An error about the NULL",
        "Only travelers whose id is NULL",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE — if x matches nothing else the comparison is still UNKNOWN, so WHERE passes nothing and the retention slide prints empty. NOT EXISTS or LEFT JOIN … IS NULL is the NULL-proof shape.",
      notes: [
        { choice: 0, why: "That's the trap: correct for months, dead the day one NULL lands. The blank slide IS the incident — and it looks like a clean sheet." },
        { choice: 2, why: "SQLite doesn't raise on NULLs in IN sets — the query runs and returns zero rows. Error-based expectations are why this survives review." },
      ],
      difficulty: "hard",
    },
    {
      id: "mmt-mcq-24",
      prompt: "A dashboard computes `AOV > (SELECT AVG(total) FROM orders WHERE region = 'LATAM')` on a slice where the LATAM rows were purged. What does it print?",
      choices: [
        "Every month — an empty comparison is TRUE",
        "Nothing, silently — the scalar subquery over zero rows yields NULL and every comparison is UNKNOWN",
        "A 'subquery returned no rows' error",
        "The rows where AOV IS NULL",
      ],
      answer: 1,
      why: "The empty-scalar contract: no rows means NULL, and x > NULL is UNKNOWN — the WHERE passes nothing exactly where the question is loudest. The silent blank is the symptom to name in the interview.",
      notes: [
        { choice: 0, why: "Comparison against NULL is never TRUE — that mechanism is the whole bug class. The empty inner fold, not comparison logic, is what to check first." },
        { choice: 2, why: "SQLite returns NULL from an empty scalar subquery without complaint — the error-based mental model is what lets this ship." },
      ],
      difficulty: "hard",
    },
    {
      id: "mmt-mcq-25",
      prompt: "Settlement latency averages 28.4 days. Which expression computes it — and which drifts by rounding each invoice first?",
      choices: [
        "ROUND(AVG(JULIANDAY(paid_on) - JULIANDAY(issued_on)), 1)",
        "AVG(ROUND(JULIANDAY(paid_on) - JULIANDAY(issued_on)))",
        "AVG(paid_on - issued_on)",
        "SUM(paid_on) - SUM(issued_on) / COUNT(*)",
      ],
      answer: 0,
      why: "Fold the raw fractional day-diffs, average, then round ONCE at the edge — 28.4. Rounding inside the AVG accumulates per-row drift before the mean is taken; the ROUND's position is the discipline.",
      notes: [
        { choice: 2, why: "Subtracting TEXT dates is string-to-numeric coercion — '2024-03-15' - '2024-02-13' is 20243302 - 20240213, a nonsense number. Date math is JULIANDAY's job." },
        { choice: 3, why: "Operator precedence: the SUM of dates minus (one SUM divided by COUNT) — two wrong things composing into a confident-looking number. Write the diffs per row." },
      ],
      difficulty: "hard",
    },
    {
      id: "mmt-mcq-26",
      prompt: "The close stacks the settled-invoice packet over the open-invoice packet, disjoint by definition. What does UNION (not UNION ALL) quietly risk?",
      choices: [
        "A syntax error — UNION needs identical column names",
        "Silent dedupe — if a definition bug ever puts one invoice in both packets, UNION deletes the evidence and the pack still balances",
        "Nothing — the stacks are identical",
        "Column misalignment — UNION stacks columns, not rows",
      ],
      answer: 1,
      why: "UNION dedupes full rows across the stack. Today the packets are disjoint so nothing changes — which is the risk: tomorrow's overlap bug gets silently cleaned, and the close never stops balancing.",
      notes: [
        { choice: 0, why: "UNION needs matching column counts and compatible types; aliases may differ — the first branch names the output. It runs either way." },
        { choice: 2, why: "Identical results today is the point — UNION ALL is chosen for what it refuses to hide, not for what it computes differently." },
      ],
      difficulty: "hard",
    },
    {
      id: "mmt-mcq-27",
      prompt: "The AOV tracker wants each month's average printed BESIDE the platform-wide average on every row. Which shape does it?",
      choices: [
        "AVG(total) OVER () as a second column",
        "AVG(total) GROUP BY month, then a WHERE for the platform",
        "MAX(AVG(total))",
        "AVG(total) with ORDER BY platform",
      ],
      answer: 0,
      why: "AVG(total) OVER () is the window over ALL rows — the platform AOV riding beside every month's fold without a self-join or subquery. PARTITION-less OVER () is the 'grand context' window.",
      notes: [
        { choice: 1, why: "WHERE can't mix per-month and platform scopes in one fold — the platform average ISN'T a row-level fact. The window computes the grand fold without collapsing the rows." },
        { choice: 2, why: "MAX over an aggregate of aggregates is a nesting error — and even conceptually, the platform AOV isn't a max. It's the same fold with the partition removed." },
      ],
      difficulty: "hard",
    },
    {
      id: "mmt-mcq-28",
      prompt: "The peak month folded 8 bookings. Which expression counts how many distinct travelers placed them?",
      choices: [
        "COUNT(*)",
        "COUNT(DISTINCT customer_id)",
        "SUM(DISTINCT customer_id)",
        "COUNT(customer_id)",
      ],
      answer: 1,
      why: "COUNT(DISTINCT customer_id) folds repeat bookers back to people — volume is 8 bookings, breadth is 5 travelers, and the gap is the month's repeat activity. Both numbers ship on the demand slide.",
      notes: [
        { choice: 0, why: "COUNT(*) is the bookings census — 8. The traveler count is a fold over a column, not over rows; printing one as the other misstates breadth." },
        { choice: 2, why: "SUM over id VALUES adds the ids — a number that grows with the roster and means nothing. Aggregating an id is always a smell." },
      ],
      difficulty: "easy",
    },
    {
      id: "mmt-mcq-29",
      prompt: "A report filters October with `WHERE created_at LIKE '2024-1%'`. What does it actually catch?",
      choices: [
        "October only",
        "October, November AND December — '2024-1%' prefixes all three month strings",
        "January and October",
        "Nothing — LIKE doesn't work on dates",
      ],
      answer: 1,
      why: "'2024-1%' matches '2024-10…', '2024-11…' and '2024-12…' — a quarter, silently. The prefix pattern is only as precise as its prefix, and Q4-read-as-October is exactly the kind of bug that survives a festival season.",
      notes: [
        { choice: 0, why: "October is '2024-10' — the pattern '2024-1%' is one character short of the boundary. One character is a quarter." },
        { choice: 3, why: "LIKE works fine on ISO TEXT dates — that's the trap. It works so well that the imprecise prefix runs without complaint." },
      ],
      difficulty: "medium",
    },
    {
      id: "mmt-mcq-30",
      prompt: "The deck prints platform AOV as 338 while the query returns 338.19. The expression was `CAST(AVG(total) AS INTEGER)`. What happened?",
      choices: [
        "CAST rounds to the nearest integer — 338.19 rounds to 338",
        "CAST truncates — 338.19 became 338, and 338.9 would ALSO print 338",
        "AVG returned an integer because total is REAL",
        "The CAST silently returned NULL",
      ],
      answer: 1,
      why: "CAST AS INTEGER truncates toward zero — it never rounds. The AOV's precision died in a type change; the fix is ROUND(AVG(total), 2) once at the display edge, matching the metric's stated precision.",
      notes: [
        { choice: 0, why: "Rounding and casting are different contracts: ROUND(338.9, 0) is 339.0, CAST is 338. The AOV slide and the finance pack would disagree at the first decimal." },
        { choice: 2, why: "AVG over REAL returns REAL — 338.187… stays REAL until the CAST throws the decimals away. The CAST is the lossy step." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-mmt-1",
      tier: "easy",
      topic: "l7",
      universe: "month-close",
      title: "The settlement mix at close",
      brief:
        "MakeMyTrip-flavored brief on the storefront db: the month-close pack opens with the settlement mix — per payment rail, how many settlements moved and how much money moved, printed in DOLLARS from a table that stores integer cents. The finance lead is explicit: 'card versus bank transfer is the partner-economics slide. Counts and dollars, or the slide is a rumor.' Probed facts: 27 settlements split card 16 and bank transfer (wire) 11; in raw cents the folds are 3736400 and 3224800 — the facts sheet's dollar figures are 37364.00 and 32248.00. The cents discipline is the test: integer cents divided by an integer 100 truncates silently, and the missing cents only show up later, on odd-cent rows nobody noticed until the tie-out.",
      ask: "Return per rail: settlement count and total in dollars (2dp), bigger dollar total first.",
      template:
        "SELECT method,\n       {1}(*) AS payments,\n       ROUND(SUM(amount_cents) / {2}, 2) AS total_dollars\nFROM payments\nGROUP BY method\nORDER BY total_dollars {3};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the settlement counter",
          why: "COUNT(*) counts settlement rows per rail — card 16, wire 11. SUM(*) and AVG(*) are syntax errors: only COUNT takes the star, and the count column is a census, not a sum.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents-to-dollars scale",
          noVerify: true,
          why: "Integer cents divided by 100.0 promotes to real arithmetic before any truncation — 3736400 cents prints 37364.0. Divided by 10 the totals read tenfold; divided by integer 100 the odd-cent rows leak silently.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the bigger-first direction",
          why: "The partner-economics slide leads with the bigger rail: card 37364.00, then wire 32248.00. ASC would open the close on the smaller rail — a correct query answering the opposite question.",
        },
      ],
      distractors: ["SUM", "AVG", "ASC", "10"],
      walkthrough:
        "A single-table fold where the unit conversion IS the test. GROUP BY method folds 27 payment rows into two rails; COUNT(*) is the census (16 and 11), SUM(amount_cents) is the raw money, and the /100.0 inside the division is what keeps the read honest — real arithmetic before truncation, ROUND(..., 2) once at the edge. The cells print card 16 / 37364.0 and wire 11 / 32248.0, matching the facts sheet, and ORDER BY total_dollars DESC leads with card. The distractors die honestly: SUM or AVG in the counter slot is a syntax error (no star-folding aggregate exists), and either in the divisor slot breaks the expression too; the divisor 10 prints 3736.4 and 3224.8 — a tenfold misread of every settlement the partner sees; ASC flips the slide to lead with the smaller rail. The habit being graded is the one line nobody skips at this close: money is INTEGER cents, the .0 goes inside the division, and the count travels beside the total so a 16-versus-11 census is never mistaken for a dollars argument.",
    },
    {
      id: "cs-mmt-2",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The traveler loyalty leaderboard",
      brief:
        "MakeMyTrip-flavored brief on the storefront db: the growth review wants the loyalty board — travelers ranked by booking FREQUENCY, lifetime spend printed beside each name, and the repeat gate applied: only travelers with 2+ bookings qualify, because in this market the second booking is the loyalty story. Probed facts: 16 travelers, of whom only 2 never came back; the frequency distribution runs 24 / 17 / 14 / 13 / 5, then a four-way tie at 4 (Pedro Alvarez, Isabella Rossi, Keiko Sato, Noah Meyer), a two-way tie at 3, a three-way tie at 2. Lifetime spend: Alice Chen 24 bookings / 7262.35, Emma Wilson 17 / 6640.56, Grace Kim 14 / 4574.23, Maya Patel 13 / 3644.56, Chloe Dubois 5 / 2667.93. The board must own its ties — ranks share the rung, the next rank skips.",
      ask: "Return repeat travelers (2+ bookings): name, bookings, lifetime_spend (2dp) and freq_rank, best frequency first.",
      template:
        "SELECT c.name,\n       COUNT(*) AS bookings,\n       ROUND(SUM(o.total), 2) AS lifetime_spend,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS freq_rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY o.customer_id\nHAVING COUNT(*) >= {3}\nORDER BY freq_rank;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie-sharing rank",
          why: "RANK() gives the four 4-booking travelers the same rung (6, 6, 6, 6) and skips to 10 — the honest tie the growth team emails as 'everyone at rank 6'. ROW_NUMBER would hand arbitrary ranks to tied travelers; DENSE_RANK would renumber the board.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the best-frequency direction",
          why: "The leaderboard ranks best first: 24, 17, 14, 13, 5, then the ties at 4. ASC would rank the one-time-ish travelers as board leaders — the loyalty program's email would target its least engaged travelers.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the repeat gate",
          noVerify: true,
          why: "The gate is 2+ bookings — 14 of 16 travelers survive it. At 3 the board silently loses the three two-booking travelers the winback campaign targets; at 1 the gate does nothing and one-time bookers make the loyalty board.",
        },
      ],
      distractors: ["ROW_NUMBER", "DENSE_RANK", "ASC", "3"],
      walkthrough:
        "A leaderboard where the tie policy is the metric. The fold groups 103 bookings by traveler; COUNT(*) is frequency (24 / 17 / 14 / 13 / 5, then ties at 4, 3 and 2), SUM(o.total) rounded once is lifetime spend (7262.35 down to 599.26), and the window rides on the folded groups — legal because windows execute after GROUP BY. RANK() OVER (ORDER BY COUNT(*) DESC) prints 1..5, the four-way tie at 6, the two-way at 10, the three-way at 12; HAVING COUNT(*) >= 2 applies the repeat gate (14 travelers survive) and ORDER BY freq_rank reads the board top-down. The distractors all change the story: ROW_NUMBER prints 1..14 with no shared rungs — four tied travelers get arbitrary separate ranks; DENSE_RANK renumbers the whole board 1..8 and hides how many rungs the ties consumed; ASC ranks the quietest travelers first; the gate at 3 drops the three two-booking travelers — 11 rows instead of 14. The habit being graded: a leaderboard that can't say what its ties did is a campaign brief with a random number generator in it.",
    },
    {
      id: "cs-mmt-3",
      tier: "medium",
      topic: "s2",
      universe: "month-close",
      title: "The festival-versus-rest stack",
      brief:
        "MakeMyTrip-flavored brief on the storefront db: the month-close pack wants the festival effect isolated with a stack, not a filter — one labeled row for the festival window (October 2024, bookings placed on or after the 1st and before the day after its last night), one labeled row for everything else, so the calendar effect and its complement print side by side and the total reconciles by eye. Probed facts: the festival window holds 7 bookings worth 2975.67; the rest-of-year holds 96 bookings worth 31857.61; together they reconcile to the platform's 103 bookings and 34833.28. The stack discipline is the test: two branches, same column shape, per-branch literals ('festival' / 'rest-of-year') labeling each row, UNION ALL so nothing ever silently dedupes, and the boundary written half-open so the festival's last night stays in the window.",
      ask: "Return two labeled rows: bucket, bookings and revenue (2dp); the festival row first.",
      template:
        "SELECT '{1}' AS bucket,\n       COUNT(*) AS bookings,\n       ROUND(SUM(total), 2) AS revenue\nFROM orders\nWHERE created_at >= '2024-10-01' AND created_at < '2024-11-01'\nUNION ALL\nSELECT '{2}',\n       COUNT(*),\n       ROUND(SUM(total), 2)\nFROM orders\nWHERE created_at < '2024-10-01' OR created_at >= '{3}'\nORDER BY bucket;",
      slots: [
        {
          answer: "festival",
          kind: "keyword",
          label: "the window's label",
          why: "The per-branch literal names the row: 'festival' marks the October slice the pack is arguing about. A stray label ('october', 'window') misnames the bucket on every downstream slide, and labels are how the stack stays self-documenting.",
        },
        {
          answer: "rest-of-year",
          kind: "keyword",
          label: "the complement's label",
          why: "The second branch is everything the festival window is not — its literal says so. The two labels must also sort festival first (f < r), which is what puts the calendar effect at the top of the pack.",
        },
        {
          answer: "2024-11-01",
          kind: "keyword",
          label: "the day-after boundary",
          why: "The complement is half-open: before the window OR on/after the day after it ends. That boundary keeps every moment of October's last night inside the festival branch — move it to the 30th and any booking timestamped later that night falls into NEITHER branch.",
        },
      ],
      distractors: ["october", "other", "2024-12-01", "2024-10-01"],
      walkthrough:
        "Two folds stacked into one pack, where the literals are the labels and the boundary is the definition. The first branch slices the festival window half-open — on/after the 1st of October, before the day after its end — and folds it: 7 bookings, 2975.67. The second branch takes the complement with the same shape — before the window or on/after the day after — and folds 96 bookings, 31857.61. UNION ALL keeps both rows even if a definition bug ever overlaps them (that's the point), and ORDER BY bucket reads 'festival' before 'rest-of-year' alphabetically. The distractors die honestly: relabeling either branch misnames the bucket on every downstream artifact; pushing the complement's boundary to 2024-12-01 orphans all of November into neither branch — 90 bookings where 96 belong; pulling it to 2024-10-01 makes the complement the whole table, 103 where 96 belong, and the reconciliation argument starts. The habit being graded: a stack that reconciles to 103 / 34833.28 by eye — because the branches tile the calendar without a gap.",
    },
    {
      id: "cs-mmt-4",
      tier: "medium",
      topic: "j4",
      universe: "supplier",
      title: "The partner coverage read",
      brief:
        "MakeMyTrip-flavored brief on the storefront db: the partner review opens with the coverage read — per supply partner (airline/hotel/rail): how many fare classes and room categories they list with the platform, how many distinct bookings moved through their inventory, and how many of those bookings cancelled. The shape is supply-first: LEFT JOIN from partners, because a partner with zero demand must still appear — an absent row reads as 'partner deleted', not 'partner idle'. Probed facts: 6 partners; Midwest Hardware Co leads with 3 listings and 45 bookings (3 of them cancelled), Shenzhen Electro carries 41 bookings with zero cancellations, Andes Naturals SA is the quietest at 25 bookings (also zero cancelled); Nordic 38 / Pacific Textiles 35 / Alpine 34 fill the middle, Pacific's 35 including 4 cancellations — the worst partner-level cancellation count on the platform. The cancelled count is a conditional DISTINCT: count distinct ORDER ids only where the order cancelled — not line items, not raw rows.",
      ask: "Return per partner: name, listings (distinct products), bookings (distinct orders) and cancelled_bookings, biggest booking count first, top 2 partners.",
      template:
        "SELECT s.name AS partner,\n       COUNT(DISTINCT p.id) AS listings,\n       COUNT(DISTINCT o.id) AS bookings,\n       COUNT(DISTINCT CASE WHEN o.status = 'cancelled' THEN o.id END) AS cancelled_bookings\nFROM suppliers s\nLEFT JOIN products p ON p.supplier_id = s.id\nLEFT JOIN order_items oi ON oi.product_id = {1}\nLEFT JOIN orders o ON o.id = oi.order_id\nGROUP BY s.id, s.name\nORDER BY bookings {2}\nLIMIT {3};",
      slots: [
        {
          answer: "p.id",
          kind: "keyword",
          label: "the inventory join key",
          why: "The chain is partners → their products (ON p.supplier_id = s.id) → those products' line items (ON oi.product_id = p.id). Joining line items on p.supplier_id instead matches line items against OPERATOR ids — a different network's demand, folded confidently and wrongly.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-partner direction",
          why: "The review ranks by coverage: Midwest 45, Shenzhen 41 lead. ASC would open on Andes Naturals (25) — a correct query answering the opposite question, and the partner call would start with the quietest relationship.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the top-two cut",
          noVerify: true,
          why: "The review takes the two biggest partners by bookings — Midwest (45) and Shenzhen (41). LIMIT 3 drags Nordic (38) onto an agenda slot nobody budgeted; LIMIT 1 drops Shenzhen, the zero-cancellation counterweight.",
        },
      ],
      distractors: ["p.supplier_id", "ASC", "4"],
      walkthrough:
        "A supply-first chain where the join type is a survival decision and every count defends its own grain. LEFT JOIN from partners keeps all 6 — on this db every partner has demand, and the report SAYS so rather than implying the LEFT JOIN found zeros. COUNT(DISTINCT p.id) folds to listings (3/3/3/2/2/2), COUNT(DISTINCT o.id) folds to bookings (Midwest 45, Shenzhen 41, Nordic 38, Pacific 35, Alpine 34, Andes 25), and the cancelled column is a conditional DISTINCT: only order ids whose status cancelled — Midwest 3, Pacific 4, Shenzhen 0. The nuance the walkthrough owns: those cancelled counts sum to 11 against the platform's 7 cancelled orders, because a multi-partner cancelled booking counts in EVERY partner it touched — the grain is per-partner, and the metric name says so. GROUP BY s.id folds once per partner; ORDER BY bookings DESC + LIMIT 2 hands the review Midwest and Shenzhen. The distractors die honestly: joining line items on p.supplier_id matches operator ids against product ids — every cell drifts; ASC crowns the quietest partner; LIMIT 4 pads the cut. The follow-up the interview waits for: why DISTINCT on the order id — because a booking with two of the partner's products is still ONE booking.",
    },
    {
      id: "cs-mmt-5",
      tier: "easy",
      topic: "t4",
      universe: "funnel",
      title: "The festival curve on the %Y-%m spine",
      brief:
        "MakeMyTrip-flavored brief on the storefront db: demand planning wants the festival curve — bookings bucketed by the month they were PLACED on the %Y-%m spine, with the cancelled count riding beside and the month's revenue folded from the same rows. The curve is the staffing and partner-allocation input, so the bucket must be year-bearing ('%Y-%m'): the db spans 2024-01 through 2025-02, and '%m' alone would fold both Februaries into one bucket and quietly rewrite the curve. Probed facts: 14 months, a 6-to-9 bookings band, with 2024-02 and 2024-09 tied at 9 and 2024-01 owning the revenue peak at 3731.97 (8 bookings, 1 cancelled); cancellations cluster in 2024-07 and 2024-11 (2 each); the first three months of the curve print 8 / 9 / 8 bookings. Every month's row is one fold — no second query, no filter, the cancelled branch inside a CASE so the denominator keeps all bookings.",
      ask: "Return the first three curve months: month, bookings, cancelled and revenue (2dp), earliest month first.",
      template:
        "SELECT STRFTIME('%Y-%m', o.created_at) AS month,\n       COUNT(*) AS bookings,\n       SUM(CASE WHEN o.status = '{1}' THEN 1 ELSE 0 END) AS cancelled,\n       ROUND(SUM(o.total), 2) AS revenue\nFROM orders o\nGROUP BY month\nORDER BY month {2}\nLIMIT {3};",
      slots: [
        {
          answer: "cancelled",
          kind: "keyword",
          label: "the branch status",
          why: "The CASE branch counts the cancelled rows WITHOUT filtering them — the denominator keeps all bookings. Branching on 'delivered' instead counts fulfillments into the cancellation column, and every downstream read (the 6.8% share, the worst-market 8.1%) inherits the wrong numerator.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the calendar-forward direction",
          why: "The curve reads like a story: 2024-01 first (8 bookings / 1 cancelled / 3731.97), then forward. DESC opens on 2025-02 — the newest month first is a different report than the curve the staffing plan keys off.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the three-month cut",
          noVerify: true,
          why: "The standup reviews the first three curve months as the sample. LIMIT 5 pads the pack with months nobody budgeted; LIMIT 1 leaves the curve a single point — no shape, no staffing argument.",
        },
      ],
      distractors: ["delivered", "DESC", "5"],
      walkthrough:
        "One fold where the calendar, the status branch and the money all ride the same rows. STRFTIME('%Y-%m', created_at) slices each booking into a year-bearing month — 14 buckets, no cross-year collapse — and GROUP BY month folds 103 bookings into the curve: COUNT(*) is the bookings band (6-to-9, 2024-02 and 2024-09 tied at 9), the CASE branch adds 1 only for cancelled rows (2024-07 and 2024-11 carry 2 each; the branch lives in SELECT because the share's denominator must keep every booking), and SUM(total) rounded once is the month's revenue with 2024-01's 3731.97 the peak. Ordered ASC and cut at 3, the sample prints 2024-01 8/1/3731.97, 2024-02 9/0/3609.64, 2024-03 8/1/2617.08. The distractors die honestly: branching on 'delivered' mislabels fulfilments as cancellations and poisons every share built on the column; DESC reverses the curve and opens the standup on the newest month; LIMIT 5 pads the sample. The habit being graded: one fold, one grain, the branch inside the fold — the curve that survives the review is the one whose denominator never left the query.",
    },
    {
      id: "cs-mmt-6",
      tier: "hard",
      topic: "q2",
      universe: "growth",
      title: "Months above the platform AOV",
      brief:
        "MakeMyTrip-flavored brief on the storefront db: the pricing review wants the months whose average booking value beat the PLATFORM average — not a neighboring month, not a vertical, the platform's own 338.19 across all 103 bookings — because a month above the bar is where the upsell argument has already won. The shape stages the comparison as a scalar subquery: fold per month, then HAVING the month's AVG(total) against the platform-wide AVG(total) computed over the whole table. Probed facts: 8 of 14 months clear the bar — 2024-01 at 466.50, 2024-10 at 425.10, 2024-02 at 401.07 lead; 2024-03 (325.64), 2024-07 (149.23) and friends sit below; the peak-BOOKINGS months are not the peak-AOV months, which is exactly why the pricing team reads both curves. The follow-up the interview hunts: what the scalar subquery returns when its inner fold is empty — NULL, and every comparison goes UNKNOWN — so the report prints nothing, silently.",
      ask: "Return months beating the platform AOV: month, bookings and avg_booking (2dp), highest average first, top 3.",
      template:
        "SELECT STRFTIME('%Y-%m', o.created_at) AS month,\n       COUNT(*) AS bookings,\n       ROUND(AVG(o.total), 2) AS avg_booking\nFROM orders o\nGROUP BY month\nHAVING AVG(o.total) > (SELECT {1}(total) FROM orders)\nORDER BY avg_booking {2}\nLIMIT {3};",
      slots: [
        {
          answer: "AVG",
          kind: "keyword",
          label: "the bar-setter",
          why: "The platform bar is the average booking value over ALL rows — AVG(total) computed on the whole table. MAX would set the bar at the single biggest booking (no month can clear it), SUM at the whole ledger (nothing clears it), and the report silently prints zero rows.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the strongest-first direction",
          why: "The pricing review reads the over-performers strongest-first: 466.50, 425.10, 401.07. ASC would open on 341.24 — the month that barely cleared the bar — and the upsell argument would start from its weakest evidence.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the top-three cut",
          noVerify: true,
          why: "The review takes the three strongest months above the bar. LIMIT 5 pads the pack with borderline months the pricing team hasn't budgeted; LIMIT 2 drops 2024-02 (401.07) and the curve loses its second data point.",
        },
      ],
      distractors: ["MAX", "SUM", "ASC", "5"],
      walkthrough:
        "A fold compared against its own platform bar — two grains, one query, and the subquery is the bar. GROUP BY month folds 103 bookings into 14 months; the HAVING clause compares each month's AVG(total) against (SELECT AVG(total) FROM orders), the platform-wide 338.19 computed over every row, and 8 months survive: 2024-01 466.50, 2024-10 425.10, 2024-02 401.07 lead the DESC board before LIMIT 3 cuts it. The distractors die honestly: MAX(total) sets the bar at the largest single booking — no monthly AOV can exceed it, the report prints zero rows and the review reads 'no month over-performs'; SUM(total) sets it at the whole ledger — same silent blank; ASC ranks the barely-clearing months first; LIMIT 5 pads the cut. The edge case the follow-up hunts: if the inner fold were filtered to a purged slice, the scalar subquery would return NULL — every comparison UNKNOWN, the report silently empty exactly where the data question is loudest. The habit being graded: a scalar-subquery bar must be able to say what it returns when its population is empty — and the analyst must be able to say which bar (platform, vertical, month-over-month) the query set.",
    },
  ],

  problems: [
    { slug: "monthly-transactions-i", why: "Month-bucket totals with a cancelled count alongside — the festival-curve fold: bookings and cancellations on the %Y-%m spine." },
    { slug: "bank-account-summary-ii", why: "Per-account credit/debit folds from integer cents — the settlement statement read: money in, money out, net per rail, /100.0 handled honestly." },
    { slug: "trial-balance-check", why: "Debits-equal-credits in one conditional SUM — the close's reconciliation reflex: two totals that must agree, checked in a single fold." },
    { slug: "count-salary-categories", why: "CASE tiers plus UNION ALL totals — the vertical-mix census where branch counts must reconcile against COUNT(*)." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the 1,1,3 vocabulary check before the loyalty board ships, said out loud." },
    { slug: "top-travellers", why: "Per-traveler distance-style folds over a join — the lifetime-spend leaderboard's structural twin, joined and ranked in one deliverable." },
    { slug: "team-scores-in-football-tournament", why: "UNION ALL standings per side — the month-close packet shape where two populations share one layout and a literal labels each." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one query with the 100.0-before-division fix — the honest-denominator drill behind every conversion screen." },
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded share where unmatched rows count as zero — the booking-confirmation read with its NULL policy stated." },
    { slug: "repeat-purchase-rate", why: "The repeat-gate rate — share of travelers with 2+ bookings: the loyalty metric this market's growth story is built on." },
    { slug: "game-play-analysis-iv", why: "First-event subquery plus join — travelers whose FIRST booking landed in the festival window: the acquisition cohort, computed not asserted." },
    { slug: "fix-names-in-a-table", why: "KYC-feed name normalization — ALL-CAPS traveler names folded to proper case before any per-person dedupe can work." },
    { slug: "find-all-unique-email-domains", why: "SUBSTR/INSTR domain extraction — traveler email domains split from free text, the contact-hygiene warm-up this market's screens open with." },
    { slug: "consecutive-available-seats", why: "Consecutive-availability pairing — the seat/room-block read: which inventory can be held together, found with a self-join and a tie rule." },
    { slug: "biggest-window-between-events", why: "LEAD-based gap math between events — the gap between a traveler's bookings: the winback-timing question, windowed not guessed." },
    { slug: "movie-rating", why: "Multi-part report: argmax by one rule, per-person aggregates by another — the composed screen closer under one booking rule." },
    { slug: "rolling-7d-actives", why: "Trailing-window actives — travelers active in any 7-day pane, the engagement read that feeds the calendar-curve argument." },
    { slug: "rising-temperature", why: "Day-over-day comparison via self-join — yesterday-versus-today bookings, the cadence check the standup opens with." },
    { slug: "second-day-confirmation", why: "D2 confirmation share — the second-day conversion lens this platform screens for on every funnel read." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Second booking inside a week — the fast-repeat signal that makes the loyalty case before any campaign spends." },
    { slug: "cohort-repeat-revenue", why: "Revenue split by cohort membership — first-booking cohorts and their repeat spend, the growth-accounting shape for festival acquisitions." },
    { slug: "winback-recovery", why: "Lapsed-then-returning travelers — the winback ledger: who lapsed past the gap, who came back, folded per cohort." },
    { slug: "customer-order-frequency", why: "HAVING-gated booking counts — travelers above an activity floor, the loyalty-gate pattern behind every tier." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Cross-vertical membership logic — flights AND hotels but NOT rail: the bundle-gap read this multi-vertical platform sells on." },
    { slug: "same-day-sale", why: "Same-row-pair detection — booking and cancellation on the same day, the instant-reversal anomaly the payments team flags." },
    { slug: "chargeback-rate-ranking", why: "Rate computation ranked per account — payment-rail risk ranked by chargeback share, with the 100.0-before-division discipline." },
    { slug: "prepayment-detection", why: "Pay-before-event detection — prepayment versus pay-at-stay settlements, the money-leg read unique to travel." },
    { slug: "ar-aging-schedule", why: "Receivables bucketed by age — the AR position at close: 6 unpaid invoices worth 15217.00, aged and classed." },
    { slug: "the-most-recent-three-orders", why: "Latest-events per entity — each fare class's most recent bookings, recency folded without losing the tie rule." },
    { slug: "premier-league-table-ranking", why: "Standings built with conditional sums and ranks — the leaderboard construction drill behind the loyalty board." },
    { slug: "unique-orders-and-customers-per-month", why: "Month-grain double census — bookings and distinct travelers per month, volume and breadth on one spine." },
    { slug: "nth-highest-salary", why: "Nth-value under duplicates — the limit/offset ranking drill that backs the leaderboard's page cuts." },
  ],
};
