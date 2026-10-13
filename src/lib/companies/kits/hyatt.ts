// Hyatt — Travel & Hospitality domain, wave 8 (Task 96).
// Wave-8 (Task 96), travel domain, 0 tagged LC — theme-curated; facts from
// scripts/company-facts.md. Brand-portfolio angle: Park/Grand/Andaz flag
// families, World of Hyatt loyalty, occupancy/ADR-style reads, F&B attach,
// group-vs-transient mix and no-show policy over a managed portfolio. Hyatt
// has NO registry tags in this app's pools — 0 tagged LC — theme-curated:
// every topic and problem slug comes from scripts/company-pools.md's theme
// menu, mirroring the workflows Hyatt screens are known to probe (folio-line
// folds, tier CASE rolls, pace buckets, no-show censuses, settlement
// coverage). Case studies run on the storefront db with probed figures from
// scripts/company-facts.md — mapped honestly as orders=bookings,
// order_items=folio lines (room-nights), products=room classes,
// customers=World of Hyatt guests, suppliers=asset owners (management/
// franchise partners), shipped_at=check-in/completion stamp, region=market.

import type { CompanyKit } from "../types";

export const hyattKit: CompanyKit = {
  id: "hyatt",
  domainId: "travel",
  name: "Hyatt",
  tagline: "Global hospitality portfolio, stay by stay",
  accent: "text-red-200",

  brief: [
    "**Hyatt** reads its portfolio flag by flag: {sky:Park Hyatt} as the luxury flagship ladder, {amber:Grand Hyatt} at destination-convention scale, Andaz as the lifestyle boutique play — and every flag reports the same way, booking by booking. In this app's training db the mapping is honest: `orders` are bookings (a reservation that was priced), order_items are the folio lines on the booking, products are room classes, and shipped_at is the check-in/completion stamp. Probed scale: **103 bookings worth 34833.28** carrying 251 folio lines across 16 room classes and 6 asset owners — 2.4 folio lines per booking, the length-of-stay story in one ratio.",
    "The data org is brand-shaped and the reads are tiered the same way. Revenue management owns the rate card: **338.19** per booking network, 383.48 in the richest market on only 19 bookings, 335.32 in the busiest on 45. The loyalty desk owns the World of Hyatt ladder — per-guest lifetime value folded first, tiered second: the four 3000-plus guests hold **22121.7**, which is **63.5%** of network booking value, and the 2000-plus crowd reaches only 71.2%. The settlement desk moves owner money in {rose:integer cents} across 28 invoices and 27 payments — *every dollar read divides by 100.0, and the anomalies are named, not averaged away*.",
    "The SQL screens are live-db and grain-ruthless. You will be asked for a folio read — nights, value and distinct bookings per room class — and the trap is the fan-out: 251 folio lines fold through the join until `COUNT(*)` counts lines and calls them bookings. You will be asked for a tier ladder and the trap is definition: tier the raw booking rows and you tier folio lines, not guests. Anti-join drills return **zero rows** here (every room class and every guest has transacted), the rate ceiling sits at **199.99** so premium-band filters come back empty by construction, and the no-show census is graded as a one-pass CASE roll — not four filtered queries.",
    "Prep the way the screens run: CTE stage-then-bucket folds until the World of Hyatt ladder is two named steps; CASE rolls until the folio-state census is one pass; window ranks for the brand-family boards; julianday for the **2.98-day** average booking-to-check-in lead; month buckets via `strftime('%Y-%m', …)` across 2024-01 to 2025-02. Then rehearse the two sentences the interviewer grades: *a folio line is a night, a booking is a stay — and occupancy, nights-per-booking and ADR are three different folds over the same rows*. The 7 {rose:no-showed} bookings stay visible in every census even when the occupancy read walks past them — *hidden no-shows flatter the pace and rot the forecast*.",
  ],

  dayInLife: [
    "**07:45 —** Brand-family board first: the overnight census — 103 booked, **82** checked-in or completed, 14 {amber:in-window}, 7 {rose:no-showed} — with the pace curve beside it (9-booking peaks in 2024-02 and 2024-09). *The on-property share prints next to its denominator or revenue management sends it back.* The F&B-attach column reads next: 54 of 103 bookings carry an Accessories-family folio line, and attach breadth is the upsell story the brand teams argue about before the owner call.",
    "**12:30 —** Deep work: the World of Hyatt ladder. Stage per-guest lifetime value in a CTE, then CASE-bucket — the four 3000-plus guests hold **22121.7** (63.5% of booking value) while all eight 2000-plus holders reach only 71.2%, so one mid-band guest owns the 7.7 points between them; *the biggest tier by heads is not the biggest tier by money, and the deck says so out loud*. The group desk interrupts with a pacing ask: US books 19 bookings at 383.48 against EU's 45 at 335.32, and the julianday lead reads **2.98 days** booking-to-check-in — the window an upgrade offer actually has.",
    "**17:15 —** Stakeholder moment: the owner call — the rate card prints the richest market at 383.48 on 19 bookings against the busiest at 335.32 on 45; *small-N markets get flagged, not hidden*. The settlement queue ships with definitions attached: a {rose:void} bill carrying a 925 payment, the 4000-paid-of-6148 partial that no SUM may call settled, and 6 bills with no settlement at all (15217 cents — 152.17 dollars, once the /100.0 lands). The EOD note closes on the tie-out: **181080 against 181080**, delta zero — occupancy on the 82, no-show on the 7, rate on bookings, not nights.",
  ],

  metrics: [
    { name: "Folio lines per booking", what: "Folio lines over bookings — 251 over 103, about 2.4. The length-of-stay proxy every pricing and staffing call leans on; a folio line is a night, not a reservation." },
    { name: "On-property share", what: "Bookings with a check-in stamp (completed or in-house) over all bookings — 82 of 103, 79.6%. The state-free read that keeps in-window and no-showed in the denominator where they belong." },
    { name: "WoH concentration", what: "Share of booking value from guests above a lifetime threshold — 63.5% from the four 3000-plus guests (22121.7 of 34833.28). The World of Hyatt ladder's headline; loyalty economics in one number." },
    { name: "ADR-style read", what: "Average booking value — 338.19 network, 383.48 in the richest market (19 bookings), 335.32 in the busiest (45). Rate-mix shifts show up here before they reach a rate-code review." },
    { name: "Booking-to-check-in lead", what: "julianday(check-in) minus julianday(booking) on the 82 stamped bookings — 2.98 days average, range 2 to 4. The window an upgrade offer actually has." },
    { name: "No-show share", what: "No-showed bookings over placed bookings — 7 of 103, 6.8% network, 8.1% in APAC and exactly 0 in LATAM. The haircut every pace forecast carries explicitly; hidden no-shows flatter occupancy and rot the forecast." },
    { name: "Asset-owner bench", what: "Owners above the 4.5 satisfaction line — 2 of 6 (4.6 and 4.8). Portfolio expansion starts from this bench, not from the full owner list." },
    { name: "Settlement coverage", what: "Owner bills classified exact, partial or none against their payments — 21 exact, 1 partial (4000 of 6148), 6 with no settlement at all (15217 cents). Owner relations reads this before the tie-out." },
  ],

  topics: [
    {
      name: "World of Hyatt tier CASE rolls",
      why: "The ladder is a CASE roll over folded lifetime value: Globalist-track at 3000+, mid-band at 2000+, Member below — heads, value and share per tier. Tier-classification and special-bonus drills are the exact shapes; the graded part is folding at guest grain before tiering.",
      slugs: ["calculate-special-bonus", "loan-types", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Folio-line night folds",
      why: "Every portfolio read folds folio lines to booking grain: nights, value and DISTINCT bookings per room class — 251 lines over 103 bookings, and the fold that survives is the one that deduplicates. Per-class demand folds are the daily bread of the brand teams.",
      slugs: ["product-sales-analysis-ii", "product-sales-analysis-iii", "most-frequently-ordered-product-per-customer"],
    },
    {
      name: "ADR & the market rate card",
      why: "Rate reads are value over the right denominator — booking value over bookings, never over folio lines or guests. The network card reads 338.19; US prints 383.48 on 19 bookings. Benchmark and group-vs-global-average drills with denominators printed beside them are exactly what revenue management asks for.",
      slugs: ["average-selling-price", "find-expensive-cities", "top-travellers"],
    },
    {
      name: "Group-desk market folds",
      why: "The group desk reads markets two ways at once: bookings placed and distinct guests booking — 45 bookings from 8 guests in EU, 19 from 2 in US. Two-grain census drills are the pacing-pack staples, and the trap is counting both at the same grain.",
      slugs: ["students-and-examinations", "unique-orders-and-customers-per-month", "sales-person"],
    },
    {
      name: "No-show & stay-state censuses",
      why: "No-show policy is a first-class fact of the book: 7 waived bookings, one-night fee flags, 14 more still in the window. Conditional-share and CASE-classification drills — numerator a state, denominator ALL placed bookings — are the front-office screens.",
      slugs: ["immediate-food-delivery-ii", "weather-type-in-each-country", "monthly-transactions-ii"],
    },
    {
      name: "Brand & occupancy boards",
      why: "Owner boards, recent-booking trackers and satisfaction ladders are window ranks over folded aggregates — with ties that share rungs honestly and recency defined deterministically. The 16-guest portfolio makes every tie visible.",
      slugs: ["rank-scores", "find-the-team-size", "the-most-recent-three-orders"],
    },
    {
      name: "Pace by month",
      why: "Pace reads live in month buckets — bookings and value per 'YYYY-MM' key across 2024-01 to 2025-02, peaks of 9 in 2024-02 and 2024-09, troughs of 6. Date-bucket folds that keep the whole window in the denominator are the pace-pack drills.",
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "friday-purchase-iii"],
    },
    {
      name: "Booking-to-check-in clocks",
      why: "The lead is julianday math over stamped bookings only — 2.98 days average, range 2 to 4 — and the 21 unstamped bookings must NULL out, not fabricate. Process-latency and day-offset drills are the clock's toolkit.",
      slugs: ["average-time-of-process-per-machine", "rising-temperature", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Owner settlement & cents discipline",
      why: "Owner money is integer cents across invoices, payments and a ledger that must tie to zero. Coverage ledgers, trial-balance assertions and AR aging over the 6 unpaid bills are the finance-side screens — cents divided by 100.0 once, at the edge.",
      slugs: ["bank-account-summary", "trial-balance-check", "ar-aging-schedule"],
    },
    {
      name: "Whale ladders & loyalty tiles",
      why: "Loyalty targets whales: concentration counts over lifetime value, spend histograms, NTILE tiles. The 63.5% line is computed exactly this way — folded per guest, then bucketed — and the drills are that fold.",
      slugs: ["number-of-rich-customers", "spend-histogram", "rfm-segmentation"],
    },
  ],

  theory: [
    {
      id: "hyatt-t1",
      q: "Your folio read joins bookings to their folio lines and the booking count explodes. What happened and what's the fix?",
      a: "The join fanned out: 103 bookings carry 251 folio lines, so joining to line items multiplies booking rows and COUNT(*) counts nights, not bookings. The fix is grain honesty — either fold lines to booking level in a CTE and join up, or keep the fan-out and fold with COUNT(DISTINCT oi.order_id). I say the three counts out loud on any portfolio read: folio lines (251), bookings (103), World of Hyatt guests (16 on this db) — and the one the slide claims must match the fold actually written. An occupancy number built on the wrong grain isn't slightly off; it's a different metric wearing the right name.",
      tag: "joins",
    },
    {
      id: "hyatt-t2",
      q: "The brand-family board ranks flags by room classes carried and several flags tie. How do you make the tie a decision instead of an accident?",
      a: "Pick the window function by its tie policy and state it: ROW_NUMBER breaks ties arbitrarily — the board looks precise and is actually ordered by rowid. RANK gives tied flags the same rung and skips consumed slots, which is honest about how many flags sit above. DENSE_RANK numbers rungs consecutively and hides the depth of the tie. On a brand board I ship RANK with a deterministic tiebreaker (the flag id), and if the tie itself matters — flags carrying the same shelf of room classes — I surface the tie as a column, because 'tied' is a fact the portfolio team will act on, not noise to hide behind an arbitrary integer.",
      tag: "windows",
    },
    {
      id: "hyatt-t3",
      q: "Write the folio-state census in one query: completed, in-house, in-window, no-showed, share. Where do candidates go wrong?",
      a: "One pass with conditional folds: COUNT(*) FILTER (WHERE status = 'delivered') AS completed, FILTER (WHERE status = 'shipped') AS in_house, FILTER (WHERE status = 'pending') AS in_window, FILTER (WHERE status = 'cancelled') AS noshowed — 103, 52, 30, 14, 7 on this db — and ROUND(100.0 * (completed + in_house) / COUNT(*), 1) prints 79.6. The classic failure is a WHERE clause: filtering no-shows out 'to clean up' shrinks the base to 96 and prints a share the portfolio never earned; the second is integer division, where 100 * 82/103 floors because the 100.0 entered after the slash. Every booking sits in exactly one conditional bucket and all of them stay in the denominator.",
      tag: "aggregation",
    },
    {
      id: "hyatt-t4",
      q: "The check-in stamp (shipped_at) is NULL on 21 bookings. What does that NULL mean here, and how should queries treat it?",
      a: "On this mapping the NULL is a business state: the guest hasn't checked in — 14 in the booking window and 7 no-showed, 21 total. Treating it as dirty data is the cardinal error: filling it with today's date fabricates arrivals, excluding those rows from a market read shrinks the denominator and flatters every share. The honest tools are state-based: COUNT(shipped_at) rides the NULL-blindness for the on-property numerator, shipped_at IS NULL splits the open arm into in-window versus no-showed by joining on status, and julianday lead math over NULL rows NULLs them — correct, because a stay that never happened has no lead. NULL here is information; the queries should read it, not repair it.",
      tag: "nulls",
    },
    {
      id: "hyatt-t5",
      q: "Where do WHERE and HAVING each belong in the market rate card, and why does mixing them up matter?",
      a: "WHERE filters rows before the fold: market slices, date windows, 'bookings created this quarter'. HAVING filters groups after the fold: markets above a booking floor, tiers above a value line. The pipeline order is FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY, and the two are not interchangeable — WHERE SUM(total) fails because the fold doesn't exist yet, and pushing a row filter into HAVING folds data you then throw away. On the rate card the difference is visible: the 19-booking gate lives in HAVING because the base only exists after the fold — and filtering one 1088.44 booking out in WHERE could demote a Globalist-track guest and misaddress the loyalty deck's best customer.",
      tag: "pipeline",
    },
    {
      id: "hyatt-t6",
      q: "Revenue management wants markets whose average booking value beats the network ADR. Subquery, window, or CTE?",
      a: "All three are honest; the definition's weight picks one. A scalar subquery — HAVING the market's AVG(total) > (SELECT AVG(total) FROM orders) — is the compact benchmark read: the network ADR is 338.19, so the 383.48 market clears it and the 335.32 market doesn't. A windowed fold, AVG over the global partition, keeps every market in the result with its premium visible, which is what the owner deck wants. A CTE earns its place when 'booking value' needs a definition — no-shows excluded, F&B folio lines netted — because a named two-stage fold survives review and a nested one-liner doesn't. What's not negotiable: the benchmark and the markets must fold on the same grain, or the comparison is folio lines against bookings.",
      tag: "subqueries",
    },
    {
      id: "hyatt-t7",
      q: "Two date reads every week: pace by month and the booking-to-check-in lead by market. What machinery does each need?",
      a: "Pace is bucketing: strftime('%Y-%m', created_at) makes a '2024-01' month key that GROUP BY folds and sorts correctly — the 14-bucket trend from 2024-01 (8 bookings, 3731.97) through 2025-02, with 9-booking peaks in 2024-02 and 2024-09. The lead is instant math: julianday(shipped_at) - julianday(created_at) on the 82 bookings with a check-in stamp, averaged to 2.98 days with the 2-to-4 range quoted, because the upgrade-offer window is sized in days. The traps I name out loud: bucketing the raw timestamp gives one row per booking; bucketing on the check-in stamp smears demand forward by the lead — the last booking lands 2025-02-27 but the last check-in lands 2025-03-01; and the round happens once at the edge so the deck, the query and the audit all print the same number.",
      tag: "dates",
    },
    {
      id: "hyatt-t8",
      q: "Finance found a void invoice carrying a payment, and one bill sits 4000-paid of 6148. How do you keep settlement anomalies from poisoning the owner read?",
      a: "Cross-examine states against evidence, and keep the cents discipline. Conditional counts that pair invoice status with payment rows surface the void-but-paid bill (925 on this db) and the paid-with-no-payments case (1756) before the tie-out; a coverage CASE — exact, partial when SUM(payments) < amount, none when no payment rows exist — classifies the 4000-of-6148 bill honestly instead of letting one payment row read as settled. And every dollar figure divides by 100.0, because invoices, payments, expenses and ledger rows are INTEGER cents. The habit being graded: row counts are claims, keys and evidence are truth, and an owner read shipped from a reconciled base — ledger at 181080 versus 181080 — is the only one worth defending.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "hyatt-mcq-1",
      prompt: "Folio fold. Which fragment counts distinct BOOKINGS per brand family — 54 for the widest attach?",
      choices: [
        "COUNT(oi.order_id)",
        "COUNT(DISTINCT oi.order_id)",
        "SUM(oi.order_id)",
        "COUNT(*)",
      ],
      answer: 1,
      why: "The join fans each booking to one row per folio line — 103 bookings become 251 rows. COUNT(DISTINCT oi.order_id) folds back through the fan-out to distinct bookings: 54 for Accessories, the widest attach.",
      notes: [
        { choice: 0, why: "COUNT(oi.order_id) counts folio LINES per family — the fan-out number, not bookings. The board would read upsell reach as night volume." },
        { choice: 3, why: "COUNT(*) is the same fan-out count with a different name. On the joined grain it cannot see bookings at all." },
      ],
      difficulty: "easy",
    },
    {
      id: "hyatt-mcq-2",
      prompt: "The AR exposure report reads owner bills with no payments totaling 15217. The dollar figure the owner deck prints is:",
      choices: [
        "15217.00 — the ledger stores dollars",
        "152.17 — invoice money is INTEGER cents, divide by 100.0",
        "1521.70 — divide by 10",
        "1.5217 — divide by 10000",
      ],
      answer: 1,
      why: "Invoices, payments, expenses and ledger rows are INTEGER cents on this db — 15217 cents is 152.17 dollars after 15217 / 100.0. Orders.total and unit_price are the only dollar-valued columns.",
      notes: [
        { choice: 0, why: "That's the classic hundred-fold overstatement — printing cents as dollars. Every settlement slide sourced from invoices/payments needs the /100.0." },
        { choice: 2, why: "Dividing by 10 has no basis in the schema — the unit is cents, so the divisor is 100.0, and the ROUND happens once at the edge." },
      ],
      difficulty: "easy",
    },
    {
      id: "hyatt-mcq-3",
      prompt: "One pass over bookings: which fragment counts completed check-outs — 52 of the 103?",
      choices: [
        "COUNT(*) FILTER (WHERE status = 'delivered')",
        "COUNT(status = 'delivered')",
        "COUNT(status)",
        "COUNT(*) WHERE status = 'delivered'",
      ],
      answer: 0,
      why: "FILTER (WHERE …) is a census arm inside one pass — it counts the 52 completed check-outs while the other arms count in-house, in-window and no-showed beside it.",
      notes: [
        { choice: 1, why: "COUNT of a boolean expression counts non-NULLs — TRUE is not NULL, so every one of the 103 bookings counts and the census reads 103, not 52." },
        { choice: 3, why: "A bare WHERE can't live inside an aggregate — that's a syntax error, not a filter. Census arms go in FILTER or a CASE." },
      ],
      difficulty: "easy",
    },
    {
      id: "hyatt-mcq-4",
      prompt: "On-property share = bookings carrying a check-in stamp over ALL bookings — 82 of 103. Which expression prints 79.6?",
      choices: [
        "ROUND(100.0 * COUNT(shipped_at) / COUNT(*), 1)",
        "ROUND(100 * COUNT(shipped_at) / COUNT(*), 1) on INTEGER operands",
        "CAST(COUNT(shipped_at) / COUNT(*) AS REAL) * 100",
        "100.0 * COUNT(*) / COUNT(shipped_at)",
      ],
      answer: 0,
      why: "The 100.0 promotes the fold to real arithmetic BEFORE the division — 82 over 103 rounds to 79.6. Every other option floors at the slash or flips the fraction.",
      notes: [
        { choice: 1, why: "Integer arithmetic runs first: 100 * 82 = 8200, 8200 / 103 floors to 79, and the ROUND decorates a truncated number. The .0 must enter before the slash." },
        { choice: 3, why: "That's the reciprocal — 103 over 82 prints 125.6, an occupancy rate over 100% that no census can earn. Numerator and denominator are the metric." },
      ],
      difficulty: "medium",
    },
    {
      id: "hyatt-mcq-5",
      prompt: "Pace by month for the revenue pack. The GROUP BY key is:",
      choices: [
        "created_at (raw timestamp)",
        "strftime('%Y-%m', created_at)",
        "strftime('%Y-%m', shipped_at)",
        "strftime('%d', created_at)",
      ],
      answer: 1,
      why: "strftime('%Y-%m', created_at) builds the '2024-01' key — 14 buckets from 2024-01 (8 bookings, 3731.97) to 2025-02 — that sorts correctly as text and folds the whole window. Pace is booked on the booking date.",
      notes: [
        { choice: 0, why: "The raw timestamp gives one group per booking — 103 rows of one. Pace needs a derived bucket key, not the raw instant." },
        { choice: 2, why: "Bucketing on the check-in stamp moves each booking into its arrival month — a different metric that smears pace across the 2.98-day lead window." },
      ],
      difficulty: "medium",
    },
    {
      id: "hyatt-mcq-6",
      prompt: "The no-show map: which market carries the highest no-show share?",
      choices: [
        "APAC — 3 of 37, 8.1%",
        "EU — biggest volume, so biggest share",
        "US — 1 of 19",
        "LATAM — 2 bookings, both kept",
      ],
      answer: 0,
      why: "Share is waived over placed per market: APAC 3/37 = 8.1%, EU 3/45 = 6.7%, US 1/19 = 5.3%, LATAM 0/2 = 0. Volume is not rate — APAC leads on a mid-size base.",
      notes: [
        { choice: 1, why: "EU places the most bookings (45) but its 3 waivers over that base print 6.7% — second place. Reading volume as rate is the fan-out trap in ratio form." },
        { choice: 2, why: "US is 1 of 19 = 5.3% — mid-pack, not the headline. The map needs the division, not the raw counts." },
      ],
      difficulty: "medium",
    },
    {
      id: "hyatt-mcq-7",
      prompt: "Which markets placed bookings but logged zero no-shows? The proof query is:",
      choices: [
        "SELECT region FROM placed EXCEPT SELECT region FROM bookings WHERE status = 'cancelled'",
        "SELECT region FROM placed INTERSECT SELECT region FROM bookings WHERE status = 'cancelled'",
        "SELECT region FROM cancelled EXCEPT SELECT region FROM placed",
        "UNION ALL of both region lists",
      ],
      answer: 0,
      why: "EXCEPT is placed-minus-no-showed: APAC, EU and US all carry waivers (3, 3, 1), so the difference returns LATAM — 2 bookings placed, 0 no-showed.",
      notes: [
        { choice: 1, why: "INTERSECT answers the opposite question — the three markets WITH no-shows. One keyword flips the business finding." },
        { choice: 2, why: "Backwards: no-showed-minus-placed is empty by construction — every waived booking was placed. The operand order is the argument." },
      ],
      difficulty: "medium",
    },
    {
      id: "hyatt-mcq-8",
      prompt: "Settlement coverage: one owner bill reads 6148 with a single payment row of 4000. How does the coverage CASE classify it?",
      choices: [
        "exact — a payment row exists",
        "partial — SUM(payments) is 4000, less than the 6148 bill",
        "none — one row means one attempt, not settled",
        "void — the bill didn't clear",
      ],
      answer: 1,
      why: "Coverage is classified on AMOUNT, not row count: SUM(payments) = 4000 against a 6148 bill is partial — 2148 still owed. The exact arm requires SUM(payments) = amount, the none arm requires zero payment rows.",
      notes: [
        { choice: 0, why: "Counting payment ROWS instead of their SUM calls this settled and hides 2148 of exposure. The 5 split-payment bills on this db exist precisely to catch that habit." },
        { choice: 2, why: "The none arm is for bills with no payment rows at all — 6 of them here. A partial payment is evidence of settlement, just not enough of it." },
      ],
      difficulty: "hard",
    },
    {
      id: "hyatt-mcq-9",
      prompt: "The stay-lead metric: julianday(check-in) - julianday(booking) over all 103 bookings. The 21 NULL check-in stamps do what?",
      choices: [
        "Count as 0-day leads — include them",
        "NULL their rows — the average runs over the 82 real leads (2.98 days), which is correct",
        "Crash the query — filter them out first",
        "Default to today's date via SQLite",
      ],
      answer: 1,
      why: "julianday(NULL) is NULL, the difference is NULL, and AVG ignores NULLs — the average lands on the 82 bookings that actually have a lead: 2.98 days, range 2 to 4. A stay that never happened has no lead; fabricating one would flatter the number.",
      notes: [
        { choice: 0, why: "Coalescing NULL leads to 0 invents same-day turnarounds for 14 in-window and 7 no-showed bookings — the average collapses and the upgrade-offer window reads far shorter than it is." },
        { choice: 2, why: "No crash — NULLs flow through arithmetic silently. The trap is believing you must intervene; the NULL-blind aggregate already did the right thing." },
      ],
      difficulty: "hard",
    },
    {
      id: "hyatt-mcq-10",
      prompt: "The 63.5% concentration line for the loyalty deck. Which fold computes it honestly?",
      choices: [
        "SUM(total) over all bookings, then compare per-night lines",
        "Fold lifetime value per guest in a CTE, tier at 3000, then divide the tier's value by 34833.28",
        "Take the top booking's value (1088.44) and divide by 103",
        "COUNT guests above 3000 and divide by 251",
      ],
      answer: 1,
      why: "Concentration is a two-stage fold: SUM(total) per guest first (guest grain), tier the folded guests second, then tier value over network value — 22121.7 over 34833.28 = 63.5%. Tiering raw booking rows would tier folio lines and call them guests.",
      notes: [
        { choice: 0, why: "A network-level sum has no tiers to compare — the fold collapses before the ladder exists. The tiering has to happen at guest grain." },
        { choice: 3, why: "Guests over folio lines mixes grains — 251 is a night count, not a guest count. Every share names its denominator out loud." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-hyatt-1",
      tier: "medium",
      topic: "j7",
      universe: "pricing",
      title: "The market rate card",
      brief:
        "Hyatt-flavored brief on the storefront db (orders = bookings, customers = World of Hyatt guests, region = market): revenue management's owner call opens with the market rate card — per market, bookings, distinct guests, stay value and the ADR-style rate (stay value over bookings), gated to markets with at least 19 bookings so every rate on the card has a base. Probed on the db: EU books 45 bookings from 8 guests worth 15089.23 (335.32 per booking), APAC 37 from 5 worth 11605.45 (313.66), and US 19 from 2 worth 7286.16 at 383.48 — the richest rate sitting exactly on the gate line. LATAM's 2 bookings (852.44, a 426.22 read) miss the gate and drop to the footnote. The rate is a per-booking fold: value over bookings, not over guests, and not over folio lines.",
      ask: "Return markets with 19+ bookings: market, bookings, guests, stay value (2dp), rate card (2dp) — richest rate first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS bookings,\n       COUNT(DISTINCT o.customer_id) AS guests,\n       ROUND(SUM(o.total), 2) AS stay_value,\n       ROUND({1}(o.total), 2) AS rate_card\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY {2}\nHAVING COUNT(*) >= {3}\nORDER BY rate_card {4};",
      slots: [
        {
          answer: "AVG",
          kind: "keyword",
          label: "the rate fold",
          why: "The rate card is value per booking: AVG(o.total) prints 383.48, 335.32 and 313.66 against the audited card. SUM prints network totals in a rate column, COUNT prints booking counts where rates were promised, and MIN floors every market to its cheapest booking.",
        },
        {
          answer: "c.region",
          kind: "keyword",
          label: "the market fold",
          why: "GROUP BY c.region folds 103 bookings into 4 market rows before the gate applies. GROUP BY a money or aggregate expression re-grains the card per price point and the gate has no base to sit on.",
        },
        {
          answer: "19",
          kind: "number",
          label: "the small-N gate",
          why: "19 keeps exactly three markets — US survives on the boundary with 19 bookings, LATAM's 2-booking anecdote drops. A gate of 20 deletes the second-richest rate; 45 keeps EU alone and the card loses its comparison set.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the richest-first order",
          why: "The card leads with the richest rate: US 383.48, then EU 335.32, then APAC 313.66. ASC opens on the cheapest market and the owner call starts in the footnote it exists to avoid.",
        },
      ],
      distractors: ["SUM", "MAX", "COUNT", "20", "45"],
      walkthrough:
        "A rate-card fold where the gate and the grain carry the grade. Bookings join to World of Hyatt guests on the customer key — the join that carries the market onto every booking — and four folds ride one pass: COUNT(*) is bookings (45, 37, 19 across the kept markets), COUNT(DISTINCT o.customer_id) is guests (8, 5, 2 — the two-grain census the fan-out punishes), ROUND(SUM(o.total), 2) is stay value (15089.23, 11605.45, 7286.16), and AVG(o.total) is the rate card — value over bookings, 383.48 for US, 335.32 for EU, 313.66 for APAC. HAVING applies the 19-booking gate to the fold: US survives exactly on the boundary, LATAM's 426.22-on-2 anecdote drops to the footnote. ORDER BY rate_card DESC leads with the richest rate. The distractors each rewrite the card: SUM prints network totals in a rate column, MAX collapses every market to one extreme booking, COUNT prints booking counts where rates were promised, a gate of 20 deletes the boundary market, a gate of 45 reduces the card to one row, and the ordering flips read the card poorest-first. Denominator named, gate honored, card reads rich-first.",
    },
    {
      id: "cs-hyatt-2",
      tier: "easy",
      topic: "s6",
      universe: "refund-audit",
      title: "The no-show desk census",
      brief:
        "Hyatt-flavored brief on the storefront db (orders = bookings, status = folio state): the front-office audit wants the no-show census — every booking classified into exactly one state (completed = checked out, in_house = on property, arriving = in the booking window, noshow = cancelled and owed the one-night fee flag), with counts, the no-show flag arm and booking value. Probed on the db: 103 bookings split 52 completed, 30 in-house, 14 arriving and 7 no-showed — 6.8% of the book, while 82 of 103 carry a check-in stamp. One conditional pass; a WHERE that filters any state out first shrinks the base to 96 and hides the very rows the fee desk exists to chase.",
      ask: "Return per folio state: state, bookings, no-show flag, value (2dp) — busiest state first.",
      template:
        "SELECT CASE o.status\n         WHEN 'delivered' THEN 'completed'\n         WHEN 'shipped' THEN 'in_house'\n         WHEN 'pending' THEN 'arriving'\n         ELSE {1} END AS folio_state,\n       COUNT(*) AS bookings,\n       SUM(CASE WHEN o.status = {2} THEN {3} ELSE 0 END) AS noshow_flag,\n       ROUND(SUM(o.total), 2) AS value\nFROM orders o\nGROUP BY folio_state\nORDER BY bookings {4};",
      slots: [
        {
          answer: "'noshow'",
          kind: "keyword",
          label: "the cancelled arm",
          why: "No-showed bookings fall to the ELSE arm and must print as their own state — 7 of them, the fee desk's whole queue. Reusing a label like 'arriving' merges the 7 into another state at 21 and the audit loses its subject.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the fee state",
          why: "The flag arm tests the raw status: 'cancelled' is the no-show state, so the arm prints 7 on that row and 0 elsewhere. Flagging 'delivered' instead reads 52 fee events from bookings that completed — a queue no front office can work.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the flag credit",
          noVerify: true,
          why: "Each no-showed booking credits exactly 1, so the arm reads 7 — one fee event per no-show. THEN 0 zeroes the arm; THEN 2 invents 14 fee events from 7 bookings and the invoice batch bills twice.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first order",
          why: "The census reads biggest state first — 52, 30, 14, 7. ASC opens on the 7 no-shows and buries the 52 completed check-outs under the smallest arm in the pack.",
        },
      ],
      distractors: ["'arriving'", "'delivered'", "2", "ASC", "folio_state"],
      walkthrough:
        "A census where the CASE is the policy. One pass over 103 bookings, each classified into exactly one folio state: delivered to completed (52), shipped to in_house (30), pending to arriving (14), everything else to noshow (7) — 6.8% of the book, and all 103 stay in the fold because a WHERE that filters any arm first shrinks the base and hides the fee desk's queue. The flag arm is the second conditional: SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) credits exactly 1 per no-showed booking — the arm reads 7 on that row and 0 elsewhere, one fee event per no-show. ROUND(SUM(o.total), 2) carries booking value beside the census. ORDER BY bookings DESC leads with the biggest state: 52, 30, 14, 7. The distractors each rewrite the policy: ELSE 'arriving' merges the 7 no-shows into the arriving arm at 21 and erases the fee queue; flagging 'delivered' reads 52 fee events from completed stays; a credit of 2 invents 14 fee events from 7 bookings; folio_state is an alias that doesn't exist yet inside its own SELECT list; and ASC reads the census upside down. Classify every row, credit every no-show, keep the denominator whole.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-ii", why: "Per-room-class demand folds from folio lines — the occupancy census at the right grain: classes, not lines, not bookings." },
    { slug: "product-sales-analysis-iii", why: "Per-class folds over periods — the brand-family read each flag team runs before the weekly pace review." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Each guest's most-booked room class — the upsell query the front desk runs before every arrival wave." },
    { slug: "average-selling-price", why: "Weighted average over units and periods — the ADR-style read revenue management defends in every rate review." },
    { slug: "find-expensive-cities", why: "Markets pricing above the network benchmark — the 338.19 rate-card screen: US 383.48 clears it, APAC 313.66 doesn't." },
    { slug: "top-travellers", why: "Guest boards from booking sums — the whale list the World of Hyatt desk targets, folded without inflating nights into bookings." },
    { slug: "rank-scores", why: "Tie-honest ranking — the brand-family board where shelf sizes tie: RANK with the skip, stated out loud." },
    { slug: "find-the-team-size", why: "COUNT OVER partitioned groups — the per-owner booking count attached to every row without collapsing the portfolio." },
    { slug: "the-most-recent-three-orders", why: "Each room class's three most recent bookings — the rate-parity freshness read the distribution team ships daily." },
    { slug: "students-and-examinations", why: "Two-grain census: bookings and distinct guests per market — the group-desk pacing read, 45 bookings from 8 guests." },
    { slug: "unique-orders-and-customers-per-month", why: "Monthly two-grain census — the pace pack's bookings-and-guests fold across the 14-bucket window." },
    { slug: "monthly-transactions-i", why: "Month-bucket demand folds — the pace census: bookings and value per 'YYYY-MM' key from 2024-01 to 2025-02." },
    { slug: "immediate-food-delivery-ii", why: "Conditional share over a flagged state — the on-property read in graded form: numerator a state, denominator ALL placed bookings, 82 of 103." },
    { slug: "average-time-of-process-per-machine", why: "Per-lane latency pairs — the booking-to-check-in clock at market grain: 2.98 days network, per-market splits beside it." },
    { slug: "bank-account-summary", why: "Per-account in/out folds — the settlement coverage ledger: money in, money out, net per owner bill, cents over 100.0." },
    { slug: "trial-balance-check", why: "Conditional SUM to zero as an assertion — the ledger ties 181080 against 181080; the graded drill that turns 'books balance' into a queryable fact." },
  ],
};
