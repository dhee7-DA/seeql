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
    "Preparation strategy: MakeMyTrip has no tagged pool in this app's registry — zero sql rows carry the tag — so the kit curates all sixteen problems from the theme menu and says so. Do the ten topics in order, then rebuild both case files on the live db: the **payment-mix read** at month close (a single-table fold from raw cents to dollars) and the **traveler loyalty leaderboard** (a booking-frequency rank window with the repeat-traveler gate made explicit, *ties sharing the rung*).",
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
      slugs: ["monthly-transactions-i", "user-activity-for-the-past-30-days-i", "the-latest-login-in-2020"],
    },
    {
      name: "Cents-safe settlement folds",
      why: "India's payment rails land in the warehouse as integer cents, so every dollar read is amount_cents / 100.0 and every integer division is a silent truncation leak. Card 37364.00 versus bank transfer 32248.00 is the fold every finance screen starts from.",
      slugs: ["bank-account-summary-ii", "trial-balance-check", "monthly-transactions-ii"],
    },
    {
      name: "Vertical-mix censuses",
      why: "Flights, hotels and rail are one bookings table distinguished by category — so vertical mix is a CASE-classified census: branches per vertical with totals that must reconcile against COUNT(*). The branch boundary is a definition someone owns.",
      slugs: ["count-salary-categories", "weather-type-in-each-country", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Traveler leaderboards",
      why: "Loyalty reporting is ranking work: bookings per traveler, lifetime spend beside it, ties everywhere (four travelers sit at 4 bookings on the db). RANK versus ROW_NUMBER versus DENSE_RANK is a vocabulary check the interview starts with.",
      slugs: ["rank-scores", "top-travellers", "department-top-three-salaries"],
    },
    {
      name: "Multi-vertical report stacks",
      why: "The month-close pack stitches populations: settled versus unsettled, card versus transfer, festival month versus the rest. UNION ALL with matching column shapes and per-branch literals is the stack that survives review; a silently deduping UNION hides overlap evidence.",
      slugs: ["team-scores-in-football-tournament", "league-statistics", "movie-rating"],
    },
    {
      name: "Rates on India-scale funnels",
      why: "Confirmation rates, cancellation shares, conversion lifts — the funnels are large and the denominators are the test. 100.0 before the division, the denominator's population decided before the ratio, rounding only at the edge.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "funnel-step-conversion"],
    },
    {
      name: "Repeat-traveler growth reads",
      why: "The growth story is the second booking: repeat-purchase rates, reactivation of lapsed travelers, loyalty cohorts. These are conditional counts and first-booking comparisons — with the ≥2 gate and the cohort definition stated out loud.",
      slugs: ["repeat-purchase-rate", "growth-accounting", "find-loyal-customers"],
    },
    {
      name: "Booking-path subqueries",
      why: "Screens escalate into nested logic: travelers whose FIRST booking landed in the festival window, months beating the platform-average AOV, partners above the network-average revenue. IN, EXISTS and scalar shapes each carry an empty-inner-query edge case the follow-up hunts for.",
      slugs: ["game-play-analysis-iv", "market-analysis-i", "second-highest-salary"],
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
  ],
};
