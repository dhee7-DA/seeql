// Expedia — kit 3 of the Travel & Hospitality domain (Batch G).
// Packages, flights and hotel demand curves: bundling analytics, market-level
// demand reads and cancellation curves on a booking lifecycle where "placed"
// and "kept" are different numbers. Pool provenance: Expedia's tagged pool in
// this app is exactly 2 sql rows (students-and-examinations,
// ab-test-conversion-lift) — both lead the problem list; the remaining picks
// are theme-curated from scripts/company-pools.md's theme menu, mirroring
// workflows Expedia screens are known to probe. Case studies run on the
// storefront db with probed figures from scripts/company-facts.md — mapped
// honestly as orders=bookings, customers=travelers, suppliers=properties and
// carriers, products=room categories and fare classes, region=market.

import type { CompanyKit } from "../types";

export const expediaKit: CompanyKit = {
  id: "expedia",
  domainId: "travel",
  name: "Expedia",
  tagline: "Packages, flights and hotel demand curves",
  accent: "text-yellow-400",

  brief: [
    "Expedia Group is one of the world's largest online travel platforms — a portfolio of brands (Expedia, Hotels.com, Vrbo, Travelocity, Orbitz) running flights, hotels, packages and activities on shared booking infrastructure. The commercial physics an analyst here has to breathe: demand is seasonal and price-elastic, packages (flight + hotel bought together) are the conversion engine, and every booking carries a lifecycle — placed, {emerald:confirmed}, fulfilled, {rose:cancelled} — so 'bookings placed' and 'bookings kept' are different numbers, the same lesson COD taught Flipkart. In this app's training db the mapping is honest: `orders` are bookings, customers are travelers, suppliers are the properties and carriers, products are room categories and fare classes, and region is market. Probed scale: **103 bookings worth 34833.28** at a 338.19 average, 251 line items behind them, 16 travelers, 6 supply partners, 16 sellable categories, dates running 2024-01 through 2025-02.",
    "The data org is portfolio-shaped. Demand analytics owns the search-to-book funnel and the market-level demand curves that open every business review — the probed census runs **EU 45 bookings / 8 travelers / 15089.23 revenue**, APAC 37 / 5 / 11605.45, US 19 / 2 / 7286.16, LATAM 2 / 1 / 852.44, and *the gap between bookings and travelers per market IS the demand-intensity story*. Pricing and bundling science owns attach rates and package economics (**251 line items across 103 bookings** is the bundling surface). Market management owns supply: property scorecards and quality ratings (Nordic Gadgets AB, 4.6, books 11130.25 of revenue). Finance analytics reconciles invoices and payments where money lives as integer cents — the `/100.0` discipline is day one.",
    "Interview style is definition-first. A screen walks from a warm-up join to a status-aware aggregate — cancellation share is **7 of 103 placed bookings** (6.8% overall, but 8.1% in APAC, 6.7% EU, 5.3% US) — then escalates into a ranking window or a rate whose denominator is the whole test. Follow-ups probe the pipeline out loud: does a {rose:cancelled} booking sit in your denominator, is that attach rate per booking or per line item, is fulfilment latency measured over the **82 dispatched bookings** (average 2.98 days, range 2..4) or all 103. Candidates who narrate grain, filter placement and denominator before writing SQL consistently outperform — *the interviewers are listening for the habit*.",
    "Preparation strategy: Expedia's tagged pool in this app is exactly two sql rows (`students-and-examinations`, `ab-test-conversion-lift`), so the kit curates the rest from the theme menu — every problem mirrors a workflow Expedia screens are known to probe: market censuses, honest-denominator rates, bundle-line joins, price ladders and lead-time math. Do the ten topics in order, then rebuild both case files on the live db: the market demand-curve read (bookings, average booking value and revenue per market) and the kept-demand pivot ({emerald:completed} vs {amber:in-flight} vs {rose:cancelled} per market, with the cancellation percentage attached and the denominator rule stated).",
  ],

  dayInLife: [
    "**08:15 —** The morning starts on the demand board, and the first query is a reconciliation: did last night's bookings land, do row counts sit inside the 7-day band, does bookings-value tie to the payment feed. The market census refreshes — bookings and distinct travelers per market, the two numbers that are never the same — and the {rose:cancellation curve} gets its daily read: **7 of 103** on the training db is quiet, but the shape by market (**APAC 8.1%, EU 6.7%, US 5.3%**) is what the intervention meeting argues about. A freshness miss or a bookings-versus-payments mismatch is the day's first fire, and the analyst who can write the diff query — which side is missing rows, and by how much — is the one everyone waits on.",
    "**11:00 —** Midday is bundling and supply. A pricing scientist wants the attach read: which bookings carried multiple lines (the **251-line-items-over-103-bookings surface**), split by market and by whether the package rate held. A market manager wants the property scorecard — listings per operator, quality rating, revenue contribution (**Nordic's 11130.25** against Pacific Textiles' 2980.15) — before a renewal call. Each ask is a join, a conditional aggregate and a denominator decision, and the strong habit is writing the query twice: once to answer, once with the definition printed so the number survives the review argument.",
    "**14:30 —** The afternoon tilts to stakeholder cycles. The weekly market review wants the kept-demand pivot — {emerald:completed}, {amber:in-flight} and {rose:cancelled} per market with the cancellation percentage attached, worst market first. Finance runs the month-close read: card versus bank-transfer settlement (16 and 11 payments, 37364.00 and 32248.00 dollars on the db), the **6 unpaid invoices worth 15217.00**, and any void-but-paid row the reconciliation catches.",
    "**17:45 —** Rituals hold it together: every headline number ships with its SQL attached, a mis-defined metric is treated as an incident, and the last hour is handoff — the two numbers tomorrow morning must reconcile, in writing. The handoff note names the freshness state, the market-census totals and any {rose:void-but-paid} row still open, so the morning reconciliation starts from tonight's truth instead of re-deriving it. A day closes clean when the diff query returns zero rows — and when it doesn't, the writeup says *which side is missing them*.",
  ],

  metrics: [
    { name: "Gross bookings value", what: "SUM(total) over bookings — 34833.28 on the training db. Every revenue read here is a status-aware version of this number, and 'placed' versus 'kept' is the first fork an interviewer makes you declare." },
    { name: "Package attach rate", what: "Share of bookings carrying 2+ line items — the bundling engine's core read. The db's 251 line items across 103 bookings is the attach surface, and counting it at the wrong grain (lines vs bookings) is the classic screen trap." },
    { name: "Cancellation share", what: "Cancelled ÷ placed, per market. 7 of 103 overall (6.8%), but the map is the story: APAC 8.1%, EU 6.7%, US 5.3%. The denominator is placed bookings — filtering cancelled rows out of WHERE first destroys it." },
    { name: "Average booking value", what: "Revenue ÷ bookings — 338.19 on the db, 426.22 in LATAM versus 313.66 in APAC. A ratio computed from one fold, not an AVG of per-market averages; the weighted-vs-two-step question is a standing follow-up." },
    { name: "Market demand intensity", what: "Bookings per distinct traveler, per market — EU's 45 bookings from 8 travelers versus US's 19 from 2. COUNT(*) and COUNT(DISTINCT customer_id) side by side; the gap between them is the intensity signal growth teams manage." },
    { name: "Repeat-traveler share", what: "Travelers with 2+ bookings — on the db only 2 of 16 travelers never came back. The loyalty read behind every marketing-spend argument, computed as a grouped count with the ≥2 gate made explicit." },
    { name: "Fulfilment latency", what: "julianday(shipped_at) − julianday(created_at) over the 82 dispatched bookings: average 2.98 days, range 2..4. The NULL shipped_at of pending bookings is a population decision, not a filter accident." },
    { name: "Supply concentration", what: "Revenue share held by the top property/carrier partner — Nordic's 11130.25 is 32% of db revenue. A per-operator fold that decides how hard market management pushes diversification." },
  ],

  topics: [
    {
      name: "Market demand censuses",
      why: "Every Expedia business review opens with the market read: bookings AND distinct travelers per market, because COUNT(*) counts booking rows while COUNT(DISTINCT customer_id) counts people — EU is 45 bookings from 8 travelers, US is 19 from 2. One fold, two grains; the gap is demand intensity.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "students-and-examinations"],
    },
    {
      name: "Ratios with honest denominators",
      why: "Attach rates, conversion lifts, cancellation shares — Expedia's rates punish integer division and drift. The house habit: 100.0 before the division, the denominator's population decided before the ratio, rounding last.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "ab-test-conversion-lift"],
    },
    {
      name: "Cancellation curves & status-aware folds",
      why: "Bookings cancel after payment — 7 of 103 on the db, unevenly by market — so every kept-revenue read is a conditional count: SUM over a 1/0 CASE flag with COUNT(*) holding placements from the same rows. Filter placement is the entire test.",
      slugs: ["immediate-food-delivery-ii", "monthly-transactions-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Bundle-depth joins",
      why: "Package analytics attaches line items, categories and partner attributes to every booking — joins where the grain visibly changes (103 bookings fan to 251 lines). Expedia's follow-up is always survival: what does an unmatched line or a missing category do to your count?",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "Price ladders & ranking windows",
      why: "Top fare classes per market, second-highest package price, ranked partner scorecards — demand work is leaderboard work. Ties are everywhere at shared price points, and the LIMIT-OFFSET habit breaks on them; rank functions with deterministic tie-breaks are the reflex.",
      slugs: ["second-highest-salary", "rank-scores", "department-top-three-salaries"],
    },
    {
      name: "Lead-time & calendar math",
      why: "Travel demand is a calendar business: bookings in a window, latest booking before a cutoff, the 2.98-day fulfilment latency. Expedia probes half-open intervals — BETWEEN on the last night of a season drops the biggest booking night.",
      slugs: ["the-latest-login-in-2020", "user-activity-for-the-past-30-days-i", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "Supply-side scorecards",
      why: "Market management reads partners the way category teams read SKUs: listings per operator, revenue per partner, sellers whose inventory never moved. The supplier side of the two-sided table is where renewal meetings get their numbers.",
      slugs: ["sellers-with-no-sales", "warehouse-manager", "sales-person"],
    },
    {
      name: "Multi-part reports under one rule",
      why: "Screens close with a composed ask: the most-booked category per traveler, then a platform-wide stat under the same status rule. Two grains, one query — Expedia is testing composition and calm, not tricks.",
      slugs: ["movie-rating", "customer-placing-the-largest-number-of-orders", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "One-pass censuses",
      why: "Dashboard real estate is query-budgeted: the status census, the market census and the category census each get one pass. Conditional aggregation — COUNT over a CASE, AVG over a 1/0 flag — builds the whole picture in a single scan.",
      slugs: ["active-businesses", "number-of-rich-customers", "find-stores-with-inventory-imbalance"],
    },
    {
      name: "Text hygiene on itineraries",
      why: "Traveler names arrive in ALL CAPS, property names in mixed case, email domains buried in free text. Screens warm up with string reshaping because a join on a dirty key is a silent fan-out nobody catches until the census doubles.",
      slugs: ["fix-product-name-format", "fix-names-in-a-table", "find-all-unique-email-domains"],
    },
  ],

  theory: [
    {
      id: "exp-t1",
      q: "You join bookings to line items to compute package attach rate, and the booking count inflates. What happened, and how do you count at both grains in one query?",
      a: "The join fanned out: 103 bookings became 251 rows because a multi-line booking contributes one row per line. COUNT(*) after the join counts LINES — the attach question needs bookings, so the fold must run per booking first: GROUP BY order_id with a line count, then aggregate the groups (or window over them). The two-grain shape is COUNT(DISTINCT o.id) for bookings surviving the join and SUM of the flag for lines, but the honest answer is staging: a derived table of per-booking line counts, then the outer fold counts bookings with 2+. The Expedia framing: attach rate is per BOOKING, bundle depth is per LINE, and a query that can't say which grain each column lives in is printing a number nobody can defend. Say the grain before the join, not after the bug.",
      tag: "joins",
    },
    {
      id: "exp-t2",
      q: "Your market report shows 45 bookings and 8 travelers for EU. Why do the two counts disagree, and which one is 'correct'?",
      a: "Neither is wrong — they count at different grains. COUNT(*) counts rows after the join (one per booking, so a traveler with five bookings contributes five); COUNT(DISTINCT o.customer_id) folds those rows back to people (8). Bookings measures load on fulfilment and partner inventory; travelers measures audience size; the ratio between them — 5.6 bookings per traveler in EU versus 9.5 in US — is the intensity signal the review actually manages. The trap one step deeper: after joining line items, COUNT(*) silently counts lines (251 across the db, not 103 bookings). The strong candidate assigns a grain to every COUNT out loud — 'this one counts rows, this one counts people, this one counts lines' — because at Expedia the two-grain census opens the meeting and a mislabeled grain starts arguments, not decisions.",
      tag: "aggregation",
    },
    {
      id: "exp-t3",
      q: "The top-ten fare classes by bookings return eleven rows on seasonal data. What class of bug is this, and give two distinct fixes with the trade-off named.",
      a: "A tie at the cut boundary — two fare classes share tenth place, and ORDER BY + LIMIT 10 keeps both (or drops one arbitrarily, engine-dependent). Fix one: ROW_NUMBER() OVER (ORDER BY bookings DESC, id ASC) = a deterministic exactly-ten, accepting an arbitrary pick among tied rows — fine when the deck must print ten rows, wrong when the tie matters commercially. Fix two: RANK() or DENSE_RANK() and keep everyone at the boundary — eleven rows is the correct answer when two classes genuinely share tenth place and both deserve the promo. The wrong answer is tightening LIMIT to 9. On this db the traveler leaderboard ties four ways at 4 bookings, and the rank column is the difference between RANK (6,6,6,6 then 10) and DENSE_RANK (6 then 7). Ties are a business decision someone owns; the SQL just has to say which decision was made.",
      tag: "windows",
    },
    {
      id: "exp-t4",
      q: "A booking's shipped_at stays NULL until dispatch. Walk me through what that NULL does to filters, joins and aggregates in a latency report — and state your policy.",
      a: "Three behaviors, then the policy. Filters: NULL fails both x = value and x != value (the comparison is UNKNOWN), so WHERE shipped_at < deadline silently drops pending bookings — right if latency doesn't exist yet, a leak if the report's scope was all bookings. Aggregates: AVG and COUNT(shipped_at) skip NULLs while COUNT(*) keeps the row — the gap between COUNT(*) (103) and COUNT(shipped_at) (82) IS the in-flight population, not a bug. Joins: NULL keys never match, so a booking with a NULL partner id vanishes from INNER joins. The policy: define the population first — 'latency is measured over the 82 dispatched bookings (average 2.98 days, range 2..4); the 14 pending are out of scope by definition' — and print that sentence with the number. A WHERE clause doing definitional work silently is exactly what Expedia's reviewers hunt for.",
      tag: "nulls",
    },
    {
      id: "exp-t5",
      q: "Where does the status filter live in a kept-revenue query — WHERE or HAVING — and what breaks when it sits in the wrong clause?",
      a: "Status is a row-level fact, so it lives in WHERE: the predicate discards cancelled rows before any fold touches them. Once aggregated, the row states no longer exist per group — HAVING can only judge group-level aggregates like COUNT or SUM, so 'subtract cancellations in HAVING' is impossible: the cancelled value is already inside every group total. The pipeline runs FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, and the alias rule follows from it — a SELECT alias resolves in ORDER BY but not in WHERE, because WHERE executes first. The Expedia-specific wrinkle: for the cancellation SHARE you do NOT filter status at all — numerator and denominator (7 and 103) must fold from the same rows, so the CASE flag rides in the SELECT and the population stays whole. Filter placement is a definition, and definitions ship in the metric name: 'kept revenue (status = delivered)' or 'cancellation share (of placed)'.",
      tag: "pipeline",
    },
    {
      id: "exp-t6",
      q: "Bookings with total > (SELECT AVG(total) FROM orders) — what is that inner query contractually allowed to return, and what happens on a filtered staging table when it comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, one column. One row: its value joins the comparison — on the full db, the 338.19 average, and the query prints above-average bookings. Zero rows: it yields NULL, not an error, and every comparison against NULL is UNKNOWN, so the WHERE passes nothing — an above-average report that silently returns an empty set. That's theoretical on 103 full-table rows but ships regularly on staging tables filtered to one market or one sale window where the inner fold legitimately finds nothing. The correlated cousin — comparing each booking to its own traveler's average — re-runs per outer row and answers a different question at a different cost. The strong answer names the inner population, states the empty case out loud ('empty inner means the report prints nothing, and here's why that's the honest result'), and picks IN/EXISTS when membership, not magnitude, is the question.",
      tag: "subqueries",
    },
    {
      id: "exp-t7",
      q: "Booking timestamps arrive as TEXT like '2025-02-27 18:40:11'. How do you bucket by month, compute fulfilment latency in days, and where does each approach break?",
      a: "Three tools, three caveats. Buckets: STRFTIME('%Y-%m', created_at) or SUBSTR(created_at, 1, 7) both give '2025-02' — the SUBSTR shortcut only survives while the format stays fixed-width ISO; one '2025-2-7' row mis-buckets silently. Latency: JULIANDAY(shipped_at) − JULIANDAY(created_at) returns fractional days — the db's 2.98-day average is exactly that, rounded once at the end, never per row; and shipped_at IS NULL for pending bookings, so the population (82 dispatched) must be stated. Windows: half-open intervals — created_at >= '2025-02-01' AND < '2025-03-01' — never BETWEEN on the last day, which drops the season's biggest night. The deeper break: these strings carry no timezone declaration, so a 'day' boundary is a convention someone must own. State the convention, then query it — never the reverse.",
      tag: "dates",
    },
    {
      id: "exp-t8",
      q: "The finance tables store money as integer cents and you've found an invoice marked void that still has a payment row. How do you read the money, and how do you hunt the anomaly?",
      a: "Two disciplines. Reading: amount_cents / 100.0 — the .0 forces real division BEFORE the fold; integer /100 truncates fractional dollars and a reconciliation that leaks half-dollars on odd-cent rows is how void-but-paid row #11 (92500 cents = 925.00) hides in a totals tie-out. Hunting: anomalies are comparisons of two definitions that should agree — invoice status versus payment existence (LEFT JOIN + IS NULL finds the 6 unpaid), payment rows versus status (the void-but-paid), and coverage classes via grouped payments (5 split-payment invoices, one partial at 4000 of 6148). The cents discipline extends to percent: 100.0 * part / whole before division, always. The Expedia habit being graded: treat every reconciliation as two queries that must print the same number, and when they don't, the DIFF is the deliverable — which rows, which side, how much.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "exp-mcq-1",
      prompt: "The market census shows EU with 45 bookings from 8 travelers. Which expression makes the travelers column tell the truth?",
      choices: [
        "COUNT(o.customer_id)",
        "COUNT(DISTINCT o.customer_id)",
        "SUM(o.customer_id)",
        "COUNT(*)",
      ],
      answer: 1,
      why: "COUNT(DISTINCT o.customer_id) folds repeat bookings back to people — EU's 45 rows collapse to 8 travelers. COUNT(*) stays 45 and the intensity signal (5.6 bookings per traveler) disappears.",
      notes: [
        { choice: 0, why: "COUNT(o.customer_id) counts non-NULL customer ids — every joined row, so it reads 45, identical to COUNT(*). DISTINCT is the part that folds people." },
        { choice: 2, why: "SUM adds the id VALUES together — a meaningless number that grows with both bookings and id numbering. Aggregating an id is always a smell." },
      ],
      difficulty: "easy",
    },
    {
      id: "exp-mcq-2",
      prompt: "payments.amount_cents stores integer cents; card volume is 3736400 cents. Which expression prints the dollar figure safely?",
      choices: [
        "SUM(amount_cents) / 100",
        "ROUND(SUM(amount_cents) / 100.0, 2)",
        "AVG(amount_cents) / 100.0",
        "COUNT(amount_cents) / 100.0",
      ],
      answer: 1,
      why: "The .0 forces real division before the fold and ROUND bounds the display — 3736400 cents reads as 37364.0 dollars, honest and formatted once, at the end.",
      notes: [
        { choice: 0, why: "INTEGER / INTEGER in SQLite is integer division — any odd-cent fold truncates toward zero and the missing cents never reconcile. This dataset's round hundreds happen to survive; the habit is still wrong." },
        { choice: 2, why: "AVG prints the MEAN payment (a per-payment lens), not the volume. The 16-vs-11 payment-count split between card and wire is what makes volume and mean different questions." },
      ],
      difficulty: "easy",
    },
    {
      id: "exp-mcq-3",
      prompt: "You need monthly booking buckets from a TEXT timestamp like '2025-02-27 18:40:11'. Which expression yields '2025-02'?",
      choices: [
        "SUBSTR(created_at, 1, 7)",
        "SUBSTR(created_at, 6, 2)",
        "YEAR(created_at)",
        "STRFTIME(created_at, '%Y-%m')",
      ],
      answer: 0,
      why: "On fixed-width ISO text, SUBSTR(created_at, 1, 7) slices 'YYYY-MM' directly — the cheap, honest month bucket that powers the db's monthly trend reads.",
      notes: [
        { choice: 1, why: "That slices '02' — the month without the year, so February 2024 and February 2025 collide into one bucket." },
        { choice: 3, why: "STRFTIME's arguments are reversed — the format comes FIRST: STRFTIME('%Y-%m', created_at). As written it's a function-argument error." },
      ],
      difficulty: "easy",
    },
    {
      id: "exp-mcq-4",
      prompt: "251 line items sit under 103 bookings. Which query correctly counts bookings that bundled 2+ lines?",
      choices: [
        "SELECT COUNT(*) FROM order_items GROUP BY order_id HAVING COUNT(*) >= 2",
        "SELECT COUNT(*) FROM (SELECT order_id FROM order_items GROUP BY order_id HAVING COUNT(*) >= 2)",
        "SELECT COUNT(*) FROM order_items WHERE quantity >= 2",
        "SELECT COUNT(DISTINCT order_id) FROM order_items",
      ],
      answer: 1,
      why: "Stage the fold: the inner GROUP BY reduces to one row per multi-line booking, and the outer COUNT(*) counts those bookings. Two grains, two layers, one job each.",
      notes: [
        { choice: 0, why: "That returns one ROW PER qualifying booking, not a count — the shape is wrong even where the population is right. Wrap it and count the rows." },
        { choice: 2, why: "That counts LINES whose quantity is 2+, not bookings with multiple lines — a bundle of four 1-quantity lines never shows up, and a 3-quantity single line false-positives." },
      ],
      difficulty: "medium",
    },
    {
      id: "exp-mcq-5",
      prompt: "7 of 103 bookings are cancelled. Which expression prints the 6.8% cancellation share?",
      choices: [
        "100 * 7 / 103",
        "ROUND(100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1)",
        "ROUND(100.0 * COUNT(status = 'cancelled') / COUNT(*), 1)",
        "ROUND(100.0 * SUM(status = 'cancelled') / COUNT(DISTINCT customer_id), 1)",
      ],
      answer: 1,
      why: "The conditional SUM counts cancellations and COUNT(*) holds placements from the same rows; 100.0 forces real division so 7/103 prints 6.8 instead of truncating to 6.",
      notes: [
        { choice: 0, why: "Integer math all the way down: 700/103 truncates to 6. One missing .0 and every share under 1% reads as zero." },
        { choice: 2, why: "COUNT(expr) counts NON-NULL results — a boolean expression is never NULL, so this counts all 103 rows and prints 100.0. The conditional counter is SUM, not COUNT." },
      ],
      difficulty: "medium",
    },
    {
      id: "exp-mcq-6",
      prompt: "You write `SELECT COUNT(*) FROM bookings b JOIN line_items li ON li.booking_id = b.id`. On this db (103 bookings, 251 line items), what prints?",
      choices: [
        "103 — one row per booking",
        "251 — one row per line item",
        "148 — the multi-line bookings only",
        "Undefined — the engine picks",
      ],
      answer: 1,
      why: "The join fans out: each of the 251 line items matches its booking, so COUNT(*) counts line rows. Booking-level counts after this join need COUNT(DISTINCT b.id).",
      notes: [
        { choice: 0, why: "That's the pre-join count. Once a booking with 3 lines is joined, it occupies 3 rows — INNER JOIN at line grain multiplies, it never dedupes." },
        { choice: 2, why: "148 is a real-looking number (the multi-line population) but it's not what this query computes — you'd need a grouped HAVING fold to get it." },
      ],
      difficulty: "medium",
    },
    {
      id: "exp-mcq-7",
      prompt: "Four travelers are tied at 4 bookings, and the next traveler has 3. RANK() over bookings DESC gives the four travelers rank 6. What rank does the next traveler get?",
      choices: [
        "7",
        "10",
        "6",
        "NULL",
      ],
      answer: 1,
      why: "RANK skips the rungs the tie consumed: four rows at rank 6 mean the next row is rank 10. DENSE_RANK would give 7; ROW_NUMBER would never have tied at all.",
      notes: [
        { choice: 0, why: "7 is DENSE_RANK's answer — consecutive with no gaps. Knowing which function leaves gaps IS the vocabulary check." },
        { choice: 2, why: "6 would mean the tie never broke — that's only true if the ordering key also included something that separated them." },
      ],
      difficulty: "medium",
    },
    {
      id: "exp-mcq-8",
      prompt: "Your latency report must cover every dispatched booking (82 of 103). Which WHERE clause makes the scope claim TRUE?",
      choices: [
        "WHERE status = 'delivered'",
        "WHERE shipped_at IS NOT NULL",
        "WHERE status != 'cancelled'",
        "No filter — AVG skips NULLs anyway",
      ],
      answer: 1,
      why: "shipped_at is non-NULL for exactly the dispatched set — 52 delivered + 30 shipped = 82. The filter and the definition are the same sentence, which is what makes the number defensible.",
      notes: [
        { choice: 0, why: "Delivered-only shrinks the population to 52 and drops the 30 in-flight-but-dispatched bookings — a different metric wearing the same name, and a different average." },
        { choice: 2, why: "This one prints the SAME 2.98 by accident — AVG silently skips the 14 pending NULLs — but the stated scope (96 rows) is false. A pending-heavy month breaks the claim before it breaks the number." },
      ],
      difficulty: "hard",
    },
    {
      id: "exp-mcq-9",
      prompt: "On a staging table filtered to one market, `WHERE total > (SELECT AVG(total) FROM staging)` returns ZERO rows with no error. What happened?",
      choices: [
        "The engine returned every row — comparison against a scalar is always TRUE",
        "The inner fold was empty, yielding NULL; every comparison against NULL is UNKNOWN, so nothing passes",
        "SQLite threw 'subquery returned no rows' and the caller swallowed it",
        "The rows came back with NULL in the total column",
      ],
      answer: 1,
      why: "A scalar subquery with zero rows yields NULL — not an error. x > NULL is UNKNOWN, the WHERE drops every row, and the report silently goes blank exactly where the data question is most interesting.",
      notes: [
        { choice: 0, why: "Comparison against NULL is never TRUE — that's the entire trap. Empty-set scalar semantics are the bug class, not comparison logic." },
        { choice: 3, why: "The rows aren't dropped with NULL payloads (that's LEFT JOIN behavior); they fail the WHERE and vanish. The symptom is an empty report, not NULL cells." },
      ],
      difficulty: "hard",
    },
    {
      id: "exp-mcq-10",
      prompt: "The month-close pack stitches the completed-bookings packet and the in-flight packet into one result set. What makes the stack trustworthy?",
      choices: [
        "UNION, so duplicate rows can't double-count",
        "UNION ALL with both branches projecting the same columns in the same order, each labelled with a literal",
        "An ORDER BY inside each branch so both arrive sorted",
        "Different column names per branch so readers can tell them apart",
      ],
      answer: 1,
      why: "The populations are disjoint by construction, so UNION ALL is free — and the shared positional shape plus a per-branch literal ('completed'/'in_flight') makes the pack self-documenting and diff-reviewable.",
      notes: [
        { choice: 0, why: "UNION dedupes — and if a definition bug ever makes the branches overlap, it silently deletes the evidence and the pack still balances. Disjoint sets want UNION ALL precisely so overlap would show." },
        { choice: 2, why: "ORDER BY belongs outside the stack, sorting the combined result; per-branch sorts are either ignored or mangled by the engine, and they hide the real sort intent." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-expedia-1",
      tier: "easy",
      topic: "j1",
      universe: "growth",
      title: "The market demand-curve read",
      brief:
        "Expedia-flavored brief on the storefront db: the weekly market review opens with the demand curve — per market, three columns: bookings, average booking value, revenue. The growth lead is explicit: 'AOV tells me the price point the market clears at; revenue tells me the size. I need both or I can't see the curve.' Probed facts: 103 bookings worth 34833.28 overall at a 338.19 average; by market EU 45 bookings / 15089.23 / 335.32, APAC 37 / 11605.45 / 313.66, US 19 / 7286.16 / 383.48, LATAM 2 / 852.44 / 426.22. Note the wrinkle the room will argue about: LATAM clears at the HIGHEST average on 2 bookings; EU is the volume engine.",
      ask: "Return every market with bookings, average booking value (2dp) and revenue (2dp), biggest revenue first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS bookings,\n       ROUND({1}(o.total), 2) AS avg_booking,\n       ROUND({2}(o.total), 2) AS revenue\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY revenue {3};",
      slots: [
        {
          answer: "AVG",
          kind: "keyword",
          label: "the price-point fold",
          why: "AVG(o.total) is the market's clearing price — EU 335.32, APAC 313.66, US 383.48, LATAM 426.22. COUNT would print booking counts (45/37/19/2) into a money column, and MAX would print the single priciest booking, not the curve.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the size fold",
          why: "SUM(o.total) is market size — 15089.23 / 11605.45 / 7286.16 / 852.44. AVG here would echo the avg_booking column, MAX would cap every market at its priciest booking, and COUNT would print row counts where dollars belong.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The review opens with the size leader: EU 15089.23, APAC 11605.45, US 7286.16, LATAM 852.44. ASC would open on LATAM's 2 bookings — a correct query answering the opposite question.",
        },
      ],
      distractors: ["COUNT", "MAX", "ASC"],
      walkthrough:
        "One join, one fold, three lenses. The join attaches each booking to its traveler's market — all 103 rows survive — and GROUP BY region folds them into four markets. Inside each fold: COUNT(*) is the load (45/37/19/2), AVG(o.total) is the price point (335.32/313.66/383.48/426.22), SUM(o.total) is the size (15089.23/11605.45/7286.16/852.44), each rounded once at the end. ORDER BY revenue DESC opens on EU. The read the room makes: LATAM's 426.22 average on 2 bookings is a whisper with an expensive accent, not a trend — which is exactly why revenue and AOV must sit side by side. Swap AVG for COUNT and the money column prints booking counts; swap SUM for MAX and every market shrinks to its single priciest booking; flip DESC and the review opens on the smallest market. Three distractors, three different lies.",
    },
    {
      id: "cs-expedia-2",
      tier: "medium",
      topic: "s7",
      universe: "funnel",
      title: "The kept-demand pivot by market",
      brief:
        "Expedia-flavored brief on the storefront db: bookings cancel after payment, so the ops review wants the demand lifecycle pivoted per market — completed, in-flight and cancelled side by side, with the cancellation percentage attached. The definition is fixed before anyone runs anything: cancel_pct is cancelled bookings ÷ ALL placed bookings in the market, one decimal, computed from the same rows as the counts. Probed facts: 103 placed bookings split EU 45 / APAC 37 / US 19 / LATAM 2; completed (delivered) 24 / 21 / 5 / 2; in-flight (shipped) 12 / 8 / 10 / 0; cancelled 3 / 3 / 1 / 0 — shares 6.7 / 8.1 / 5.3 / 0.0. APAC crowns the worst-cancellation read, and the denominator rule is what makes that honest.",
      ask: "Pivot per market: placed, completed, in_flight, cancelled and cancel_pct (1dp), biggest placed first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS placed,\n       SUM({1} WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS completed,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS in_flight,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / {2}(*), 1) AS cancel_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY placed {3};",
      slots: [
        {
          answer: "CASE",
          kind: "keyword",
          label: "the branch keyword",
          why: "SUM(CASE WHEN … THEN 1 ELSE 0 END) turns status into a 1/0 flag per row so SUM can add the matching branch. No CASE means no branch — SUM(WHEN …) is a syntax error, and no conditional fold can read a text status directly.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the denominator fold",
          why: "COUNT(*) counts every placed booking in the market (45/37/19/2) — the honest denominator the share needs. SUM(*) is a syntax error and AVG(*) is nonsense: the denominator must be a row count folded from the same rows as the numerator.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the load-first direction",
          why: "Biggest market first keeps the pivot aligned with the demand read: EU 45, APAC 37, US 19, LATAM 2. ASC would open the ops review on LATAM's two bookings.",
        },
      ],
      distractors: ["SUM", "AVG", "MAX", "ASC"],
      walkthrough:
        "A pivot is four conditional folds over one population. The CASE flags turn each booking's status into 1/0 per branch; SUM adds each branch (EU: 24 completed, 12 in flight, 3 cancelled) while COUNT(*) holds the placed denominator — numerator and denominator from the same 45 rows, which is what keeps the share honest. 100.0 promotes the division before any truncation: EU 6.7, APAC 8.1, US 5.3, LATAM 0.0, and ORDER BY placed DESC keeps the biggest market on top. The distractors all die differently: SUM or AVG or MAX in the CASE slot is a syntax error (no branch keyword, no fold), and in the denominator slot SUM(*)/AVG(*)/MAX(*) are all invalid — you cannot fold a star. Flip DESC to ASC and the review opens on the quietest market. The cardinal sin this pivot forbids: filtering cancelled rows in WHERE first — the denominator would shrink to the numerator's population and every market would read 0% or 100%. Denominator drift is the funnel-report killer.",
    },
  ],

  problems: [
    { slug: "students-and-examinations", why: "Tagged-pool lead: per-subject zero-fill counts across a join — the market-by-market census shape where a missing pair must print 0, not vanish." },
    { slug: "ab-test-conversion-lift", why: "Tagged-pool closer: conversion lift between two groups — Expedia's bundling experiments read exactly like this, and the lift's denominator is the whole test." },
    { slug: "daily-leads-and-partners", why: "Two-grain daily census — bookings and distinct travelers per market per day, the COUNT(*) versus COUNT(DISTINCT) muscle the demand read runs on." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one query with the 100.0-before-division fix — the honest-denominator drill behind every attach-rate screen." },
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded share where unmatched rows count as zero — the package-confirmation read with its NULL policy stated." },
    { slug: "immediate-food-delivery-ii", why: "The kept-share rate: conditional-count ratio where the denominator is the test — the cancellation-share question in textbook form." },
    { slug: "product-sales-analysis-i", why: "Per-product revenue from line items — the category attach read that turns 251 lines into a per-category demand table." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the 1,1,3 vocabulary check before any fare-class or market leaderboard ships." },
    { slug: "second-highest-salary", why: "Second-place extraction — the 'next price point down the ladder' pull pricing asks for when the top fare class sells out." },
    { slug: "the-latest-login-in-2020", why: "Latest event inside a calendar year — the most recent booking before a cutoff, with the year boundary handled honestly." },
    { slug: "user-activity-for-the-past-30-days-i", why: "Trailing-window census — the 30-day demand read where the window's half-open edge decides whether the busiest night counts." },
    { slug: "list-the-products-ordered-in-a-period", why: "Window-filtered demand with a quantity gate — seasonal category reads with the HAVING gate made explicit." },
    { slug: "sellers-with-no-sales", why: "Supplier-side anti-join — partners whose listings never moved, the market-management renewal question from the supply side." },
    { slug: "movie-rating", why: "Multi-part report: argmax by one rule, per-person aggregates by another — the composed screen closer under one status rule." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The volume-argmax read — the traveler with the most bookings, decided on a grouped count with ties owned, not hidden." },
    { slug: "fix-product-name-format", why: "Catalog string hygiene: title-case property names before a join — 'smart watch s' and 'Smart Watch S' are one room category only after normalization." },
  ],
};
