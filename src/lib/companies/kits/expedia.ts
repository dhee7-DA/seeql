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
    "Preparation strategy: Expedia's tagged pool in this app is exactly two sql rows (`students-and-examinations`, `ab-test-conversion-lift`), so the kit curates the rest from the theme menu — every problem mirrors a workflow Expedia screens are known to probe: market censuses, honest-denominator rates, bundle-line joins, price ladders and lead-time math. Do the ten topics in order, then run the **six case files** on the live db: the market demand-curve read, the kept-demand pivot ({emerald:completed} vs {amber:in-flight} vs {rose:cancelled} with the denominator rule stated), the traveler leaderboard tie, the attach-rate census, the settled-versus-open stack and the supply scorecard. This expanded kit is built for spaced practice rather than one sitting — re-run each case from a blank editor a week later, *the second pass is where recall actually forms* — and pair them with the **32-problem pool** below.",
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
      slugs: ["daily-leads-and-partners", "find-followers-count", "students-and-examinations", "year-on-year-growth-rate", "growth-accounting", "friday-purchases-i"],
    },
    {
      name: "Ratios with honest denominators",
      why: "Attach rates, conversion lifts, cancellation shares — Expedia's rates punish integer division and drift. The house habit: 100.0 before the division, the denominator's population decided before the ratio, rounding last.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "ab-test-conversion-lift", "funnel-step-conversion", "roas-by-campaign"],
    },
    {
      name: "Cancellation curves & status-aware folds",
      why: "Bookings cancel after payment — 7 of 103 on the db, unevenly by market — so every kept-revenue read is a conditional count: SUM over a 1/0 CASE flag with COUNT(*) holding placements from the same rows. Filter placement is the entire test.",
      slugs: ["immediate-food-delivery-ii", "monthly-transactions-i", "percentage-of-users-attended-a-contest", "prepayment-detection"],
    },
    {
      name: "Bundle-depth joins",
      why: "Package analytics attaches line items, categories and partner attributes to every booking — joins where the grain visibly changes (103 bookings fan to 251 lines). Expedia's follow-up is always survival: what does an unmatched line or a missing category do to your count?",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "replace-employee-id-with-unique-identifier", "basket-depth-aov", "calculate-product-final-price"],
    },
    {
      name: "Price ladders & ranking windows",
      why: "Top fare classes per market, second-highest package price, ranked partner scorecards — demand work is leaderboard work. Ties are everywhere at shared price points, and the LIMIT-OFFSET habit breaks on them; rank functions with deterministic tie-breaks are the reflex.",
      slugs: ["second-highest-salary", "rank-scores", "department-top-three-salaries", "average-selling-price", "product-price-at-a-given-date", "the-most-recent-three-orders"],
    },
    {
      name: "Lead-time & calendar math",
      why: "Travel demand is a calendar business: bookings in a window, latest booking before a cutoff, the 2.98-day fulfilment latency. Expedia probes half-open intervals — BETWEEN on the last night of a season drops the biggest booking night.",
      slugs: ["the-latest-login-in-2020", "user-activity-for-the-past-30-days-i", "list-the-products-ordered-in-a-period", "median-time-to-convert", "users-with-two-purchases-within-seven-days", "find-bursty-behavior"],
    },
    {
      name: "Supply-side scorecards",
      why: "Market management reads partners the way category teams read SKUs: listings per operator, revenue per partner, sellers whose inventory never moved. The supplier side of the two-sided table is where renewal meetings get their numbers.",
      slugs: ["sellers-with-no-sales", "warehouse-manager", "sales-person"],
    },
    {
      name: "Multi-part reports under one rule",
      why: "Screens close with a composed ask: the most-booked category per traveler, then a platform-wide stat under the same status rule. Two grains, one query — Expedia is testing composition and calm, not tricks.",
      slugs: ["movie-rating", "customer-placing-the-largest-number-of-orders", "the-category-of-each-member-in-the-store", "first-last-touch-attribution"],
    },
    {
      name: "One-pass censuses",
      why: "Dashboard real estate is query-budgeted: the status census, the market census and the category census each get one pass. Conditional aggregation — COUNT over a CASE, AVG over a 1/0 flag — builds the whole picture in a single scan.",
      slugs: ["active-businesses", "number-of-rich-customers", "find-stores-with-inventory-imbalance", "duplicate-charge-pairs"],
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
    {
      id: "exp-t9",
      q: "The traveler leaderboard ties four ways at 4 bookings. Walk me through RANK versus DENSE_RANK versus ROW_NUMBER — and which one the review wants.",
      a: "All three order rows; the tie picks the function. ROW_NUMBER gives every row a distinct number — it invents an ordering among travelers the data says are equal. RANK gives tied rows the same rank and then skips the consumed rungs: the four tied at rank 6 push the next traveler to rank 10, which is honest for a leaderboard (there IS no tenth place occupied — it's a four-way sixth). DENSE_RANK ties without gaps: the next traveler reads 7, which is right for tiers or fare bands where a phantom class 7-9 would invent inventory that doesn't exist. So the leaderboard wants RANK, the tier scan wants DENSE_RANK, and argmax wants ROW_NUMBER with an explicit tie-break. Say which tie semantics the business asked for before writing OVER — the numbers differ exactly where the argument happens.",
      tag: "windows",
    },
    {
      id: "exp-t10",
      q: "The close pack stacks completed, in-flight and cancelled bookings with a TOTAL row. Why UNION ALL — and what makes the stack trustworthy enough to ship?",
      a: "The populations are disjoint by definition — a booking sits in exactly one status class — so UNION ALL concatenates without a dedupe pass, which is free and safer: if a definition bug ever overlaps two branches, UNION ALL shows a double-counted row and the reconciliation fails loudly, while a bare UNION silently deletes the evidence and the pack still balances. Trustworthiness is three habits: every branch projects the same columns in the same positional order (column names come from the first branch only), each branch carries a literal label naming its population ('completed', 'in_flight', 'cancelled'), and the TOTAL row must reconcile to the placed-bookings census — 24 + 12 + 3 = 39 for EU — before the pack ships. ORDER BY belongs outside the stack, sorting the combined result once.",
      tag: "setops",
    },
    {
      id: "exp-t11",
      q: "After the bookings-to-line-items join, assign a grain to every count: COUNT(*), COUNT(DISTINCT o.id), COUNT(DISTINCT o.customer_id), SUM(quantity).",
      a: "Four expressions, four grains — and the assignment IS the answer. COUNT(*) counts the joined rows: 251 lines, not 103 bookings — the fan-out lie every multi-line booking commits. COUNT(DISTINCT o.id) folds rows back to the booking grain: 103. COUNT(DISTINCT o.customer_id) folds further back to people: 16 travelers. SUM(quantity) adds the physical unit — room-nights — which no COUNT can see. The habit interviewers grade is saying the grain out loud before defending the number: 'this one counts lines, this one counts bookings, this one counts people, this one counts nights.' The two-grain census (bookings and travelers side by side) is that sentence made into columns — EU's 45 bookings from 8 travelers is a demand-intensity read that exists only because someone refused to let both columns be COUNT(*).",
      tag: "aggregation",
    },
    {
      id: "exp-t12",
      q: "Build daily booked revenue with a running total, every day kept. Why SUM(SUM(total)) OVER (ORDER BY day) — and what is SUM(total) OVER () instead?",
      a: "Two layers, two grains. GROUP BY day folds 103 bookings into daily buckets; the window can only see those folded rows, so its argument is the aggregate itself: SUM(SUM(total)) OVER (ORDER BY day) — the running accumulation of daily revenue. Write SUM(total) OVER (ORDER BY day) and the engine errors or reaches for base rows the group no longer has. The bare OVER () is a different instrument: it aggregates the whole partition, printing the same grand total (34,833.28) on every row — the denominator for share-of-market or share-of-month reads, not momentum. Watch the frame too: ORDER BY inside OVER gives the accumulating frame from the partition start to the current row; no ORDER BY means the whole set. Stage the day fold in a CTE when the expression deepens — the CTE owns the grain, the outer query owns the window.",
      tag: "windows",
    },
    {
      id: "exp-t13",
      q: "Compare each booking against its own market's average value. Why is the correlated subquery the natural shape — and when do you refuse it?",
      a: "The correlated form — WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 JOIN customers c2 ON c2.id = o2.customer_id WHERE c2.region = c.region) — re-runs the inner fold once per outer row, and that per-row scope IS the question: each booking against ITS market's clearing price, not the global 338.19. The costs and exits: at 103 bookings it's free; at booking scale it's a re-aggregation per row, and the upgrade is staging per-market averages once — a derived table or CTE of market means joined back on region — or a window (AVG(total) OVER (PARTITION BY region)) that computes every market's baseline in one pass. Refuse the correlated shape when the inner query stops referencing the outer row — that's an uncorrelated subquery in correlated clothing, re-running for nothing. The review habit: say what the inner query sees per row, because that sentence is the cost model and the definition at the same time.",
      tag: "subqueries",
    },
    {
      id: "exp-t14",
      q: "The supply scorecard must show every room — including the ones that never sold. How do you zero-fill without inventing demand?",
      a: "Drive the FROM from supply and LEFT JOIN the demand: rooms (or properties) on the left, reservations attached where they exist. Unmatched rooms survive with NULL payload, and COALESCE(SUM(x), 0) — or COUNT(o.id), which counts non-NULLs and prints 0 naturally — turns the absence into the honest zero. The anti-pattern is starting from the bookings side: INNER-join semantics drop the unsold rooms, and the scorecard silently reads as 'every room sells' — the renewal meeting then mis-sizes the whole portfolio. The same rule runs the funnel: a market with zero cancellations must print 0.0%, not vanish, or the cancellation map lies by omission. The discipline: enumerate the buckets the business expects, make the query print all of them, and label the zero as zero — 'no sales' and 'no data' are opposite findings wearing the same blank cell.",
      tag: "nulls",
    },
    {
      id: "exp-t15",
      q: "Property names arrive as 'smart watch s', 'Smart Watch S' and 'SMART WATCH S'. What's your normalization policy before these feed a join or a census?",
      a: "Normalize once, upstream of every consumer — in a CTE or staging view — not ad hoc at each join. The workhorses: UPPER or LOWER to case-fold keys, TRIM for stray whitespace, REPLACE for separator drift, and a manual mapping table for the abbreviations no function can guess. The reason it's data quality and not cosmetics: a join on a dirty key silently fan-outs or drops rows — the same room counted as two listings, or a reservation matching nothing — and the market census doubles or shrinks with no error anywhere. Two disciplines to state out loud: display strings and join keys are different columns (fold the key, keep the pretty name for the deck), and the normalization is idempotent — running it twice changes nothing, which is what makes it safe to re-run on every load.",
      tag: "text",
    },
    {
      id: "exp-t16",
      q: "Lead time, fulfilment latency, season windows — what's your date-integrity policy before any calendar math ships on TEXT timestamps?",
      a: "Four rules, stated before the query. One: compute differences with JULIANDAY — fractional days, rounded once at the end, never per row; the 2.98-day average latency is exactly that, over the 82 dispatched bookings whose shipped_at exists. Two: bucket with STRFTIME('%Y-%m', …) or SUBSTR(created_at, 1, 7) — the SUBSTR shortcut is a bet the format stays fixed-width ISO, so profile before betting. Three: range filters are half-open — >= start AND < next-start — never BETWEEN on the last day, which drops everything after midnight on the season's biggest booking night. Four: these strings carry no timezone, so a 'day' boundary is a convention someone must own — write it into the metric name. And one population rule above all: latency measured over dispatched bookings must SAY 'dispatched' — a filter doing definitional work silently is the bug class reviewers hunt.",
      tag: "dates",
    },
    {
      id: "exp-t17",
      q: "Where does COALESCE belong in a pipeline — and where is it laundering unknowns?",
      a: "Two legitimate homes, one crime scene. Home one: the fold's input, when the business has DECIDED that missing means a value — COALESCE(SUM(p.amount_cents), 0) on the supply scorecard because zero sales is the honest read for an unsold room. Home two: the display edge, where '—' replaces NULL for humans while the column stays NULL for math. The crime scene is the middle of the pipeline, where COALESCE launders unknowns into fake facts: COALESCE(status, 'confirmed') re-classifies a whole population nobody classified, and the cancellation share computes against a denominator nobody defined. The test to say out loud: is NULL here a population ('never sold'), a missing value ('not yet dispatched'), or a display problem? Three answers, three different clauses — and only two of them are COALESCE.",
      tag: "nulls",
    },
    {
      id: "exp-t18",
      q: "Beyond joining bookings to line items: where does the self-join earn its keep on a two-sided marketplace, and what does the join predicate encode?",
      a: "Self-joins encode pairwise relationships within one table, and the predicate IS the business rule. Duplicate detection: settlements joined to settlements on the same invoice around the same amount finds double charges — with a.id < b.id so each pair prints once. Basket composition: line items joined to line items on the same booking with different products finds what travels together — the attach and bundle story. Traveler pairing: bookings joined to bookings on the same customer with a date offset finds repeat-booking patterns. Three disciplines: the offset or the inequality is a definition — state it (± 7 days, a.id < b.id, different product_id); symmetric pairs need the ordering rule or every pair prints twice; and the fan-out is multiplicative — a table with pairs on both sides squares, which is why self-joins get a WHERE before they get a GROUP BY.",
      tag: "joins",
    },
    {
      id: "exp-t19",
      q: "A settlement appears twice in the payments table. Walk me through the detect-then-resolve pipeline for duplicates.",
      a: "Detection is the fold-gate pair: GROUP BY the business key — invoice_id plus paid_on, or amount plus method when timing drifts — and HAVING COUNT(*) > 1 keeps only the violated keys. Then resolve, which is a decision before it is SQL: keep-latest is ROW_NUMBER() OVER (PARTITION BY key ORDER BY paid_on DESC, id DESC) = 1 with the id tie-break making it deterministic; keep-both is the honest answer when two genuine payments split one invoice — which is exactly why the key must be the BUSINESS key, not the row id. The trap is resolving in the same breath as detecting: a filter or DELETE that runs before anyone looked at the pairs. And the audit habit: deduped count plus dropped count must reconcile to the raw count, in writing — duplicate settlements are real money stated twice, and the month-close pack has to say which half survived.",
      tag: "quality",
    },
    {
      id: "exp-t20",
      q: "Dimension filters, aggregate gates: where does each live, and what does misplacement cost on the attach read?",
      a: "The pipeline order decides: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. WHERE sees rows before the fold — dimensions live there: region = 'APAC', the date window, status when the metric is kept-demand only. HAVING sees groups after the fold — aggregate gates live there: HAVING COUNT(*) >= 2 for bundled bookings, HAVING attach_pct >= 75 for the review's interesting markets. Misplacing costs two ways: an aggregate in WHERE fails to compile (the fold hasn't happened), and a dimension in HAVING compiles on SQLite while reading backwards — you folded everything and then threw most away. The attach case is the sharpening stone: the market cut is WHERE region, the per-booking 2+-line test happens in the staged fold (WHERE or HAVING inside the derived table, judging per-booking counts), and the market-level 'attach above 75%' gate is HAVING outside. Three filters, three clauses, one pipeline.",
      tag: "pipeline",
    },
    {
      id: "exp-t21",
      q: "Attach each booking's market average and market booking-count onto every row without collapsing the result. What's the window shape?",
      a: "Partition windows — aggregates over a partition that keep every row. AVG(total) OVER (PARTITION BY region) computes each market's clearing price and attaches it to every booking in that market; COUNT(*) OVER (PARTITION BY region) carries the market's booking count on every row. No GROUP BY anywhere — that's the entire point: the result keeps 103 rows, each enriched with its market's context, so the outer WHERE can compare each booking to its own market's baseline (total > market_avg) in the same pass. The GROUP BY version answers the market-level question with 4 rows; the window version answers the booking-level question with all 103. The habit being graded: choosing the grain on purpose — collapse for the market read, enrich for the booking read — and knowing that PARTITION BY is 'GROUP BY that keeps rows', not a style variant.",
      tag: "windows",
    },
    {
      id: "exp-t22",
      q: "Which properties have never sold? Argue EXISTS against NOT IN for that sweep — and against the LEFT JOIN twin.",
      a: "NOT EXISTS is the NULL-proof anti-join: x NOT IN (subquery) is a chained inequality, and one NULL in the subquery makes every comparison UNKNOWN — the sweep returns zero rows while looking healthy. Property ids arrive NULL more often than anyone admits (pre-import listings, unmapped suppliers), so the NOT IN cliff is a when, not an if. NOT EXISTS short-circuits on the first match and is NULL-blind in the right way: WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id) keeps exactly the never-sold rooms. LEFT JOIN + IS NULL is its set-based twin — same population, and preferable when you also want the unmatched rows' columns for the scorecard. IN has one legitimate home: a small constant list — IN ('card','wire') — where no NULL can enter. Membership against a TABLE is EXISTS; membership against a literal list is IN; and the sweep result needs a stated empty-case: 'zero rows means every room sold', not 'the query broke'.",
      tag: "subqueries",
    },
    {
      id: "exp-t23",
      q: "The market packs read 335.32 and 426.22 average booking value. Why is averaging them NOT the overall AOV — and what is?",
      a: "Averaging averages is the ratio-of-ratios trap: it weights every market equally regardless of size, so LATAM's two expensive bookings outvote EU's forty-five. The honest overall AOV recomputes from the parts — SUM(total) across markets divided by SUM(bookings) — the weighted read: 34,833.28 over 103 bookings is 338.19, not the 380.77 an average of the four market averages would print. The same discipline runs down a level: a market's monthly AOVs don't average to its quarterly AOV unless every month placed the same volume. When someone hands you an average of percentages or averages, the first question is 'weighted by what?' — and if the answer is 'by nothing', recompute from the numerators and denominators the folds already carry. Print the parts beside the weighted total and the argument ends itself.",
      tag: "aggregation",
    },
    {
      id: "exp-t24",
      q: "Two queries that should print the same number don't. What's your reconciliation discipline when the month-close tie-out breaks?",
      a: "The diff is the deliverable. First, restate both definitions out loud — most tie-out breaks are two different populations wearing one metric name: bookings versus line items, placed versus kept, billed versus settled. Then write the diff query — a FULL-style comparison via LEFT JOINs from each side (or an anti-join each way) that prints which rows each side has that the other lacks, with the count and the value on both ends. On this db the standing example is the folio book: the status census values open folios at 19,609.00 while the settlement sweep values the unpaid at 15,217.00 — same six folios by count, 4,392.00 apart by definition, because folio 25 is 'open' with 4,000 settled and folio 28 claims 'paid' with nothing settled. The reconciliation isn't done when the numbers match; it's done when the query can name every row that differs, which side owns it, and why — in writing, beside the pack.",
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
    {
      id: "exp-mcq-11",
      prompt: "Package attach rate: 77 of 103 bookings carried 2+ line items. Which denominator makes 'attach rate per booking' true after joining line items?",
      choices: [
        "COUNT(*) — every row is a booking",
        "COUNT(DISTINCT o.id) — the booking grain, restored after the fan-out",
        "COUNT(li.id) — lines are what attach",
        "COUNT(DISTINCT o.customer_id) — travelers are the audience",
      ],
      answer: 1,
      why: "The join fans 103 bookings into 251 rows, so COUNT(*) counts lines. COUNT(DISTINCT o.id) folds back to bookings — the grain the attach rate is defined on — and the 2+-line numerator is staged per booking before the ratio.",
      notes: [
        { choice: 0, why: "That's the fan-out lie: the 'rate' becomes 77 lines over 251 lines — a ratio of lines to lines wearing a booking metric's name." },
        { choice: 2, why: "COUNT(li.id) counts line rows — the denominator shrinks to the numerator's own grain and the 'rate' measures lines against lines." },
      ],
      difficulty: "easy",
    },
    {
      id: "exp-mcq-12",
      prompt: "Fare classes tie at the tier boundary and the deck wants tier labels with no phantom gaps. Which window function?",
      choices: [
        "ROW_NUMBER() OVER (ORDER BY bookings DESC)",
        "RANK() OVER (ORDER BY bookings DESC)",
        "DENSE_RANK() OVER (ORDER BY bookings DESC)",
        "NTILE(4) OVER (ORDER BY bookings DESC)",
      ],
      answer: 2,
      why: "DENSE_RANK packs ties consecutively — the tied classes share a tier and the next count takes the very next one, no invented strata. A fare-tier scan with RANK prints phantom tiers that no class occupies, and the promo band reads wrong.",
      notes: [
        { choice: 1, why: "RANK skips the rungs the tie consumed — honest for leaderboards ('tenth place'), wrong for tiers, where the gap implies classes that don't exist." },
        { choice: 0, why: "ROW_NUMBER splits the tie arbitrarily — it declares a winner among classes the data says are equal, and the split changes run to run." },
      ],
      difficulty: "hard",
    },
    {
      id: "exp-mcq-13",
      prompt: "Fulfilment latency = JULIANDAY(shipped_at) − JULIANDAY(created_at), averaged. What does AVG do with the 14 pending bookings whose shipped_at is NULL?",
      choices: [
        "Errors — NULLs can't be averaged",
        "Skips them — AVG runs over the 82 dispatched bookings only, which is why the population must be stated",
        "Counts them as zero days, dragging the average down",
        "Returns NULL for the whole fold",
      ],
      answer: 1,
      why: "AVG ignores NULLs, so the fold runs over the 82 bookings that actually dispatched — average 2.98 days. That's usually the metric you want, but only if the report SAYS 'over dispatched bookings'; the silent skip is a definition pretending to be arithmetic.",
      notes: [
        { choice: 2, why: "That's COUNT/coalesce behavior, not AVG — and if it were true, pending bookings would be 'zero-day fulfilments', a worse lie than exclusion." },
        { choice: 3, why: "AVG returns NULL only when EVERY value is NULL — one dispatched booking and the fold produces a number, just over a population nobody stated." },
      ],
      difficulty: "medium",
    },
    {
      id: "exp-mcq-14",
      prompt: "The demand read covers 'the last 30 days including today'. Which WHERE clause counts every qualifying booking?",
      choices: [
        "WHERE created_at BETWEEN DATE('now', '-30 days') AND DATE('now')",
        "WHERE created_at >= DATE('now', '-30 days') AND created_at < DATE('now', '+1 day')",
        "WHERE STRFTIME('%d', created_at) >= STRFTIME('%d', 'now') - 30",
        "WHERE created_at > DATE('now', '-30 days')",
      ],
      answer: 1,
      why: "Half-open bounds — >= start, < tomorrow — include all of today and none of tomorrow. BETWEEN on 'now' drops everything after midnight today, and the most recent evening is exactly when booking volume peaks.",
      notes: [
        { choice: 0, why: "BETWEEN DATE('now') cuts at midnight today — the evening peak vanishes and the 30-day census reads a demand crash nobody can reproduce." },
        { choice: 2, why: "Day-of-month arithmetic breaks at month boundaries — 'the 3rd minus 30' is negative nonsense. Calendar math belongs to DATE modifiers, not date-part subtraction." },
      ],
      difficulty: "easy",
    },
    {
      id: "exp-mcq-15",
      prompt: "The supply sweep must list properties that never sold. product_id values can be NULL in pre-import rows. Which shape survives that?",
      choices: [
        "WHERE p.id NOT IN (SELECT product_id FROM order_items)",
        "WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id)",
        "WHERE p.id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL) — with the NULL guard",
        "An INNER JOIN to order_items, keeping the zero-count groups",
      ],
      answer: 1,
      why: "NOT EXISTS short-circuits and is NULL-blind in the right way — it keeps exactly the never-matched properties regardless of NULLs elsewhere. NOT IN is a chained inequality where one NULL poisons the whole list; choice 3 works but bakes a data-quality prayer into the query.",
      notes: [
        { choice: 0, why: "One NULL in the subquery makes every comparison UNKNOWN — the sweep returns zero rows while looking healthy, and the renewal meeting reads 'everything sells'." },
        { choice: 3, why: "INNER JOIN drops the unmatched before any fold — the never-sold properties, the exact population, never appear." },
      ],
      difficulty: "medium",
    },
    {
      id: "exp-mcq-16",
      prompt: "The supply scorecard LEFT JOINs rooms to reservations; unsold rooms arrive with NULL aggregates. What's the defensible treatment?",
      choices: [
        "Leave NULLs — they mean 'no data'",
        "COALESCE(SUM(x), 0) at the fold — zero sales is the honest read for a room that never sold, and the column stays numeric",
        "Filter them out with WHERE revenue IS NOT NULL",
        "Cast to text and print 'none'",
      ],
      answer: 1,
      why: "A NULL payload from a LEFT JOIN means 'no demand rows attached' — for a scorecard that's zero, decided and stated. COALESCE at the fold's output keeps the column numeric so downstream SUMs and formatters survive.",
      notes: [
        { choice: 0, why: "'No sales' and 'no data' are opposite findings — leaving NULL makes the renewal meeting guess which one it's looking at." },
        { choice: 2, why: "Filtering deletes the unsold rooms — the scorecard then claims every room sells, which is the exact misread the scorecard exists to prevent." },
      ],
      difficulty: "easy",
    },
    {
      id: "exp-mcq-17",
      prompt: "The bundle preview wants each booking's room types folded into one cell: 'Suite, Deluxe'. Which fold?",
      choices: [
        "GROUP_CONCAT(p.category) over a per-booking fold — with ORDER BY inside for a stable string",
        "SUM(p.category)",
        "JOIN p.category",
        "COUNT(p.category) || ' types'",
      ],
      answer: 0,
      why: "GROUP_CONCAT folds many rows into one string cell — the per-booking category list. Adding ORDER BY inside the aggregate (SQLite supports it) makes the string deterministic; without it, 'Suite, Deluxe' and 'Deluxe, Suite' are the same bundle on different days.",
      notes: [
        { choice: 1, why: "SUM adds numbers — on text it errors or coerces to garbage. Aggregating a category with a numeric fold is a type crime before it's a logic one." },
        { choice: 3, why: "That prints '3 types' — a count, not the list. The preview needs the categories themselves, and the count is a different column." },
      ],
      difficulty: "medium",
    },
    {
      id: "exp-mcq-18",
      prompt: "One query, one scan: placed, cancelled and completed bookings per market. Which conditional shape counts all three in a single pass?",
      choices: [
        "Three separate queries UNIONed together",
        "COUNT(*) FILTER (WHERE status = 'cancelled') and its siblings, beside COUNT(*) as placed",
        "WHERE status IN ('cancelled', 'delivered') with COUNT(*)",
        "A GROUP BY on status, then a self-join back to bookings",
      ],
      answer: 1,
      why: "FILTER (WHERE …) is the one-pass conditional census: each aggregate scans the same grouped rows with its own predicate, and COUNT(*) holds the placed denominator beside them. One scan, one fold, every branch reconciling to the same total.",
      notes: [
        { choice: 0, why: "Three scans and a stack works but triples the cost and invites drift — three definitions of 'placed' is how branch sums stop reconciling." },
        { choice: 2, why: "That's a row filter, not a census: pending bookings drop out of placed, and the branches can never sum to the true total." },
      ],
      difficulty: "medium",
    },
    {
      id: "exp-mcq-19",
      prompt: "Market AOVs: EU 335.32 (45 bookings), APAC 313.66 (37), US 383.48 (19), LATAM 426.22 (2). Which expression is the honest overall AOV?",
      choices: [
        "AVG of the four market AOVs = 389.67",
        "SUM(total) over all bookings / COUNT(*) over all bookings = 338.19",
        "MAX(market AOV) = 426.22",
        "EU's AOV — the biggest market sets the tone",
      ],
      answer: 1,
      why: "AOV is a ratio, and ratios weight by their denominators: recompute from the parts — total spend over total bookings — and 34,833.28 / 103 = 338.19. Averaging the four numbers weights LATAM's two bookings equally with EU's forty-five and prints 389.67, a number no booking supports.",
      notes: [
        { choice: 0, why: "The ratio-of-ratios trap: an average of averages is only the true average when every group has the same size — here it overstates by ~50 dollars." },
        { choice: 2, why: "MAX picks the priciest market's clearing price — LATAM's 426.22 on 2 bookings. A headline built on the thinnest cell is the classic small-sample heist." },
      ],
      difficulty: "hard",
    },
    {
      id: "exp-mcq-20",
      prompt: "'Each traveler's most-booked room.' A colleague loops travelers and runs ORDER BY cnt DESC LIMIT 1 per traveler. What breaks?",
      choices: [
        "Nothing — LIMIT 1 is the argmax",
        "Ties: two rooms at the same count return one arbitrarily and the loop hides the flip — ROW_NUMBER with an explicit tie-break decides once, in SQL",
        "Performance only — the logic is sound",
        "LIMIT requires a window function",
      ],
      answer: 1,
      why: "LIMIT 1 returns A top room, not THE top room: on a tie the pick is engine-arbitrary and changes silently between runs. ROW_NUMBER() OVER (PARTITION BY traveler ORDER BY cnt DESC, room) makes the argmax deterministic and set-based.",
      notes: [
        { choice: 2, why: "N queries per traveler is a cost smell; the real defect is correctness — the personalization surface changes on tie days with no deploy." },
        { choice: 3, why: "LIMIT works fine without windows — and that's the problem: nothing forces the tie-break a window's ORDER BY makes explicit." },
      ],
      difficulty: "medium",
    },
    {
      id: "exp-mcq-21",
      prompt: "A join on property name returns duplicates: 'Smart Watch S' and 'SMART WATCH S' are one room category. Which guard normalizes the key?",
      choices: [
        "JOIN ON UPPER(p.name) = UPPER(c.name) — case-fold both sides before matching",
        "JOIN ON p.name = c.name — the data will agree eventually",
        "JOIN ON p.name LIKE c.name",
        "JOIN ON TRIM(p.name) = TRIM(c.name)",
      ],
      answer: 0,
      why: "Case-fold both sides once — UPPER on each key — and casing drift stops creating phantom duplicates. A dirty join key is a data-quality bug, not cosmetics: the census doubles before anyone sees an error.",
      notes: [
        { choice: 2, why: "LIKE with no wildcards is equality with case-insensitivity by SQLite-ASCII accident — the match works by luck and breaks on portability." },
        { choice: 3, why: "TRIM strips whitespace, not case — 'SMART WATCH S' still fails the match after trimming." },
      ],
      difficulty: "easy",
    },
    {
      id: "exp-mcq-22",
      prompt: "A momentum read wants daily booked revenue with a running total across the month, every day kept. Which shape?",
      choices: [
        "GROUP BY day with SUM, then eyeball the accumulation",
        "SUM(SUM(total)) OVER (ORDER BY day) after grouping by day — the window aggregates the folded day totals",
        "SUM(total) OVER () — the same figure on every row",
        "MAX(total) OVER (ORDER BY day)",
      ],
      answer: 1,
      why: "Two layers, two jobs: GROUP BY folds 103 bookings to day grain, and the window's SUM over the aggregated SUM accumulates them in order. In a grouped query the window must aggregate the already-aggregated value — the bare column isn't there anymore.",
      notes: [
        { choice: 2, why: "SUM(total) OVER () is the grand total — the same number on every row. It's the denominator for share-of-month, not a running one." },
        { choice: 3, why: "MAX walks a running high-water mark — it ratchets and never comes down, a different (and misleading) momentum curve." },
      ],
      difficulty: "hard",
    },
    {
      id: "exp-mcq-23",
      prompt: "The repeat-booking read: how many days passed between each traveler's consecutive bookings? Which window shape computes it per traveler?",
      choices: [
        "JULIANDAY(created_at) - LAG(JULIANDAY(created_at)) OVER (PARTITION BY customer_id ORDER BY created_at)",
        "MAX(created_at) - MIN(created_at) per traveler",
        "JULIANDAY(created_at) - JULIANDAY(LAG(created_at))",
        "AVG(JULIANDAY(created_at)) OVER (PARTITION BY customer_id)",
      ],
      answer: 0,
      why: "LAG over a per-traveler partition pairs each booking with the previous one; the JULIANDAY diff is that gap, and the first booking's NULL is the honest 'no baseline'. The partition is the definition — gaps are per traveler, never global.",
      notes: [
        { choice: 1, why: "That's the SPAN — first to last. A traveler with monthly bookings shows a year-long 'gap' under span math and none in reality." },
        { choice: 2, why: "LAG returns the raw value; wrapping it in JULIANDAY double-converts — compute the diff on converted values, not conversions of converted values." },
      ],
      difficulty: "medium",
    },
    {
      id: "exp-mcq-24",
      prompt: "An ops queue pages through open folios 10 per page. Which clause fetches page 3?",
      choices: [
        "LIMIT 10 OFFSET 20",
        "LIMIT 20 OFFSET 10",
        "LIMIT 3, 10",
        "LIMIT 10 OFFSET 3",
      ],
      answer: 0,
      why: "Page 3 at 10 per page skips the first 20 rows: LIMIT 10 OFFSET 20. The comma form — LIMIT offset, count — reverses the arguments, which is why the keyword form is the house habit.",
      notes: [
        { choice: 1, why: "That's page 2 with 20 rows — off-by-one page AND a doubled page size, the drift that makes the queue 'miss' folios." },
        { choice: 3, why: "OFFSET 3 skips three ROWS, not three pages — the queue re-reads the top of the list every time." },
      ],
      difficulty: "easy",
    },
    {
      id: "exp-mcq-25",
      prompt: "Finance suspects the same invoice was settled twice. Which query surfaces the duplicate payments?",
      choices: [
        "SELECT invoice_id FROM payments",
        "SELECT invoice_id, COUNT(*) FROM payments GROUP BY invoice_id HAVING COUNT(*) > 1",
        "SELECT DISTINCT invoice_id FROM payments",
        "SELECT * FROM payments WHERE invoice_id = invoice_id",
      ],
      answer: 1,
      why: "GROUP BY folds to invoice grain and HAVING keeps only invoices with 2+ payment rows — the detect half of the dedupe story. On this db five invoices legitimately carry two rows (split settlements), so the follow-up is comparing SUM to the billed amount, not deleting.",
      notes: [
        { choice: 0, why: "The bare select prints every payment — the duplicates are in there, invisible, mixed with the legitimate splits." },
        { choice: 2, why: "DISTINCT dedupes silently — the opposite of detection: the anomaly disappears and the ledger looks cleaner than the book is." },
      ],
      difficulty: "medium",
    },
    {
      id: "exp-mcq-26",
      prompt: "SUM(CASE WHEN status = 'cancelled' THEN 1 END) prints NULL for markets with zero cancellations. The ops deck needs 0. What's the fix — and the lesson?",
      choices: [
        "Wrap in COALESCE(…, 0) — display the zero you decided on",
        "Add ELSE 0 to the CASE — the fold itself owns the empty case",
        "Both work identically; pick either",
        "Change the column to accept NULLs",
      ],
      answer: 1,
      why: "ELSE 0 fixes it at the source: every row contributes 0 or 1, so SUM always has something to add and the fold never returns NULL. COALESCE around the fold also prints 0 — but it patches the symptom while the fold still produces a meaningless NULL for honest inputs.",
      notes: [
        { choice: 0, why: "It works, and it's the right tool when the NULL comes from a LEFT JOIN's unmatched rows. Here the NULL is the fold's own output for an all-NULL input — the CASE is where the definition belongs." },
        { choice: 2, why: "Not identical: ELSE 0 changes what SUM receives; COALESCE changes what leaves the query. Downstream consumers of the fold see different things." },
      ],
      difficulty: "hard",
    },
    {
      id: "exp-mcq-27",
      prompt: "The review only ranks markets with attach rate at or above 75%. Which clause carries that gate?",
      choices: [
        "WHERE attach_pct >= 75",
        "HAVING attach_pct >= 75 — the rate exists only after the fold",
        "ORDER BY attach_pct — percentages are display concerns",
        "A LIMIT on the lowest rows",
      ],
      answer: 1,
      why: "The attach rate is a group-level aggregate — it doesn't exist until GROUP BY folds the market. WHERE runs before aggregation and can't see it; HAVING judges folded groups. APAC (78.4) and US (78.9) clear the gate; EU (71.1) doesn't.",
      notes: [
        { choice: 0, why: "WHERE can't reference the aggregate at all — the fold hasn't happened in the pipeline. It fails to compile, or worse, the alias trick fails on stricter engines." },
        { choice: 2, why: "ORDER BY sorts but never filters — the thin markets still print, just arranged by how badly they miss the bar." },
      ],
      difficulty: "hard",
    },
    {
      id: "exp-mcq-28",
      prompt: "Year-over-year reads need a year bucket from TEXT timestamps like '2025-02-27 18:40:11'. Which expression yields '2025'?",
      choices: [
        "SUBSTR(created_at, 1, 4)",
        "SUBSTR(created_at, 1, 7)",
        "STRFTIME(created_at, '%Y')",
        "YEAR(created_at)",
      ],
      answer: 0,
      why: "The year is the first four characters of fixed-width ISO text: SUBSTR(created_at, 1, 4). The month bucket was 1,7 — the year slice is 1,4 — and both bets share the same caveat: they survive only while the format stays fixed-width.",
      notes: [
        { choice: 1, why: "That's '2025-02' — the month bucket. Reusing the month slice for a year fold puts every February in its own group." },
        { choice: 2, why: "STRFTIME's arguments are reversed — the format comes FIRST: STRFTIME('%Y', created_at). As written it's an argument error." },
      ],
      difficulty: "easy",
    },
    {
      id: "exp-mcq-29",
      prompt: "Flag bookings priced above THEIR OWN market's average — not the global 338.19. Which shape is correct?",
      choices: [
        "WHERE total > (SELECT AVG(total) FROM orders)",
        "WHERE total > AVG(total) OVER (PARTITION BY region) — written straight into WHERE",
        "Join or window each booking to its market's average: total > (SELECT AVG(o2.total) FROM orders o2 JOIN customers c2 … WHERE c2.region = c.region), or compare against AVG(total) OVER (PARTITION BY region) in an outer query",
        "WHERE total > AVG(total) grouped by region",
      ],
      answer: 2,
      why: "The baseline must be per-market, which means the comparison rides on a correlated subquery — or stages the market averages and joins/windows them back. The window can't live in WHERE (it computes at SELECT time), so the window version wraps the fold in an outer query.",
      notes: [
        { choice: 0, why: "That's the GLOBAL average — every market's bookings get compared to 338.19, and cheap markets hemorrhage false 'above-average' flags." },
        { choice: 1, why: "Window functions compute at SELECT time; WHERE executes before them. It errors — or on lenient engines, compares against nothing useful." },
      ],
      difficulty: "hard",
    },
    {
      id: "exp-mcq-30",
      prompt: "Which GROUP BY pairs with SELECT STRFTIME('%Y-%m', created_at) AS month to fold bookings monthly?",
      choices: [
        "GROUP BY month — SQLite resolves the alias",
        "GROUP BY STRFTIME('%Y-%m', created_at) — the underlying expression",
        "Both run on SQLite; the expression is the portable habit",
        "GROUP BY created_at",
      ],
      answer: 2,
      why: "SQLite resolves aliases in GROUP BY, so both compile and fold correctly — but stricter engines reject the alias form. The portable habit writes the expression; the alias is a convenience, not a contract.",
      notes: [
        { choice: 0, why: "True on SQLite, false elsewhere — a query that only compiles on one engine is a portability bug wearing a working demo." },
        { choice: 3, why: "GROUP BY the raw timestamp groups per booking — 103 groups of one row, the monthly fold never happens." },
      ],
      difficulty: "easy",
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
    {
      id: "cs-expedia-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The traveler leaderboard tie",
      brief:
        "Expedia-flavored brief on the storefront db: the growth review ranks travelers by bookings, and the deck must show the tie honestly — who shares a rank and who the tie pushed down. Probed facts: 103 bookings over 16 travelers — Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13, Chloe Dubois 5, then FOUR travelers tied at 4 (Isabella Rossi, Keiko Sato, Noah Meyer, Pedro Alvarez), then Farid Nasser and Hiro Tanaka at 3. With RANK over bookings DESC, the tied four share rank 6 and Farid's 3 bookings land at rank 10 — the skip the review wants visible, which is why the leaderboard cuts at ten rows and not five. RANK over DENSE_RANK is the decision: position 10 means 'nobody holds ranks 7-9', a fact, not a bug.",
      ask: "Return the top ten travelers by bookings: name, booking count and rank, biggest first.",
      template:
        "SELECT c.name AS traveler,\n       COUNT(*) AS bookings,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id, c.name\nORDER BY rank, traveler\nLIMIT {3};",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the leaderboard function",
          why: "RANK ties the four travelers at rank 6 and pushes the next to rank 10 — the honest leaderboard where the tie consumes positions. DENSE_RANK would print 6,6,6,6 then 7 (a tier scan's answer), and ROW_NUMBER would split the tie 6,7,8,9, inventing an ordering the data doesn't contain.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "Rank 1 must be Alice Chen's 24 bookings, so the window's ORDER BY runs descending. ASC would crown the two 1-booking travelers rank 1 — a correct query answering the opposite question, with the volume leaders stamped as tail-enders.",
        },
        {
          answer: "10",
          kind: "number",
          label: "the leaderboard cut",
          why: "Ten rows show ranks 1 through 10 — including the four-way tie at 6 AND the skip to Farid's rank 10, the exact behavior the review is auditing. A cut of 5 ends at Chloe and the tie never appears; the deck would read as if nobody tied.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "5"],
      walkthrough:
        "A fold, a window, a cut — and a tie that means something. The join attaches each booking to its traveler (all 103 survive), GROUP BY folds to 16 travelers, and COUNT(*) is the volume each rank stamps. The window ranks the folded counts: RANK over bookings DESC gives 1, 2, 3, 4, 5, then the four-way tie at 6, then rank 10 — the skip is the arithmetic of four consumed rungs, and it's the fact the review wants printed: nobody is seventh through ninth. DENSE_RANK would erase the skip (6 then 7, tier semantics), and ROW_NUMBER would break the tie arbitrarily (6, 7, 8, 9 — four travelers ordered by nothing). ORDER BY rank, traveler keeps the tied block alphabetical so the printout is stable, and LIMIT 10 ends the deck exactly where the skip lands — cut at 5 and the tie is invisible, which is how leaderboard bugs survive into print. RANK here is not a style choice; it is the business decision 'ties share a position' made executable.",
    },
    {
      id: "cs-expedia-4",
      tier: "medium",
      topic: "q5",
      universe: "pricing",
      title: "The attach-rate census",
      brief:
        "Expedia-flavored brief on the storefront db: the bundling science read — what share of BOOKINGS carried two or more line items, per market — staged at booking grain before any rate is computed. Probed facts: 251 line items under 103 bookings, every booking carrying at least one line. The derived table folds lines to one row per booking, and the market fold reads: EU 45 bookings / 32 bundled / 71.1%, APAC 37 / 29 / 78.4%, US 19 / 15 / 78.9%, LATAM 2 / 1 / 50.0% — overall 77 of 103, 74.8%. The review's sample floor is 19 bookings: LATAM's 50.0% on two bookings is a footnote, not a market. The read the room makes: APAC and US out-attach EU — volume and bundling are different engines.",
      ask: "Per market with at least 19 bookings: bookings, bundled (2+ lines) and attach_pct (1dp), biggest bookings first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS bookings,\n       SUM({1} WHEN pb.lines >= 2 THEN 1 ELSE 0 END) AS bundled,\n       ROUND(100.0 * SUM(CASE WHEN pb.lines >= 2 THEN 1 ELSE 0 END) / COUNT(*), 1) AS attach_pct\nFROM (\n  SELECT o.id, o.customer_id, COUNT(*) AS lines\n  FROM orders o\n  JOIN order_items li ON li.order_id = o.id\n  GROUP BY o.id\n) pb\nJOIN customers c ON c.id = pb.customer_id\nGROUP BY c.region\nHAVING COUNT(*) >= {2}\nORDER BY bookings {3};",
      slots: [
        {
          answer: "CASE",
          kind: "keyword",
          label: "the branch keyword",
          why: "SUM(CASE WHEN … THEN 1 ELSE 0 END) turns each staged booking's line count into a 1/0 bundle flag so SUM can add the matching branch. No CASE means no branch — SUM(WHEN …), IIF(WHEN …), COUNT(WHEN …) are all syntax errors, and no conditional fold reads a comparison without it.",
        },
        {
          answer: "19",
          kind: "number",
          label: "the sample floor",
          why: "The HAVING gate judges a per-market aggregate after the fold: 19 keeps EU (45), APAC (37) and US (19, binding exactly) and drops LATAM's two-booking footnote. A floor of 37 drops US too; 2 lets LATAM's 50.0% headline a cell built on two bookings.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the volume-first direction",
          why: "Biggest market first keeps the census aligned with the demand read: EU 45, APAC 37, US 19. ASC would open the pricing review on the thinnest ranked market — and the attach story (APAC 78.4 out-attaching EU 71.1) is a column read, not the sort key.",
        },
      ],
      distractors: ["IIF", "SUM", "ASC", "37", "2"],
      walkthrough:
        "Stage the grain, then rate it. The derived table folds 251 lines to one row per booking — lines per booking, the exact grain the attach definition lives on — and the outer query joins the market dimension and folds per region. Inside each fold: COUNT(*) counts staged bookings (45/37/19 — bookings, because the staging already removed the fan-out), the CASE flag turns lines >= 2 into 1/0 and SUM adds the bundled branch, and the rate divides bundled by placed from the SAME rows with 100.0 promoting the division — EU 71.1, APAC 78.4, US 78.9. HAVING COUNT(*) >= 19 is the sample floor, an aggregate gate so it lives in HAVING, binding exactly on US. The distractors all die differently: IIF/SUM/ASC in the CASE slot are syntax errors, a floor of 37 amputates the US market, 2 reads a 50% headline off LATAM's two bookings, and ASC inverts the census. The overall attach is 77 of 103 (74.8%) — computed once, at the right grain, from a fold that can say what a booking is.",
    },
    {
      id: "cs-expedia-5",
      tier: "hard",
      topic: "x3",
      universe: "month-close",
      title: "The settled-versus-open stack",
      brief:
        "Expedia-flavored brief on the storefront db (invoices = reservation folios, payments = settlements, money in integer cents): finance month-close stacks three money views in one query. Probed facts: settled — folios with payment rows attached — 22 folios with 69,612.00 actually moved (including void-but-settled folio 11's 925.00 and folio 25's 4,000.00 partial); unpaid — folios with NO settlement row — 6 folios worth 15,217.00 (including folio 28, which claims status 'paid'); TOTAL billed book — 28 folios, 86,977.00. The stack deliberately does NOT foot: 69,612 + 15,217 = 84,829, and the 2,148 gap is folio 25's unpaid remainder (6,148 billed − 4,000 settled). Naming that gap, not hiding it, is the month-close discipline — billed and settled are different denominators wearing one stack.",
      ask: "Stack three rows — settled money, unpaid folios, TOTAL billed — each with a folio count and dollars (2dp), smallest dollars first.",
      template:
        "SELECT 'settled' AS class,\n       COUNT(DISTINCT i.id) AS folios,\n       ROUND(SUM(p.amount_cents) / 100.0, 2) AS dollars\nFROM invoices i\nJOIN payments p ON p.invoice_id = i.id\nUNION ALL\nSELECT {1},\n       COUNT(*),\n       ROUND({2}(i.amount_cents) / 100.0, 2)\nFROM invoices i\n{3} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS NULL\nUNION ALL\nSELECT 'TOTAL',\n       COUNT(*),\n       ROUND(SUM(i.amount_cents) / 100.0, 2)\nFROM invoices i\nORDER BY dollars {4};",
      slots: [
        {
          answer: "'unpaid'",
          kind: "keyword",
          label: "the exposure label",
          why: "The branch keys on the anti-join — no settlement row exists — so the label states the settlement truth, not the folio's status claim ('unpaid', not 'open': folio 28 claims paid with nothing behind it). Any other label prints the same numbers under a name the tie-out will not recognize.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the exposure fold",
          why: "SUM(i.amount_cents) adds the six unpaid folios' billed amounts — 1,521,700 cents — each once, because an unsettled folio carries zero payment rows to fan it out. COUNT would print 0.06 (six divided by 100) and AVG would print the average folio, 2,536.17, as the exposure.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the anti-join half",
          why: "LEFT JOIN keeps every folio so WHERE p.id IS NULL can keep the unmatched six. INNER would keep only settled folios, the unpaid branch would return zero rows, and the stack would lose 15,217.00 of exposure while looking balanced.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the footer-last direction",
          why: "Ascending dollars reads unpaid (15,217.00), settled (69,612.00), then TOTAL (86,977.00) last — the footer lands last only because the billed book exceeds every part. DESC makes the 86,977.00 footer the headline row, the classic grand-total-stack failure.",
        },
      ],
      distractors: ["'settled'", "COUNT", "AVG", "INNER", "DESC"],
      walkthrough:
        "Three branches, three definitions, one stack — and a gap that is the deliverable. Branch one joins invoices to payments and folds the MONEY that moved: COUNT(DISTINCT i.id) says 22 folios (distinct, because the five split-settled folios attach two payment rows each and a bare COUNT would say 27), SUM(p.amount_cents) says 69,612.00 — void-but-settled folio 11's 925.00 and folio 25's 4,000.00 partial included, because money moved regardless of status. Branch two is the anti-join: LEFT JOIN preserves all 28 folios, WHERE p.id IS NULL keeps the six with no settlement, and SUM of their billed cents prints 15,217.00 — folio 28, status 'paid', among them, which is why the label says unpaid and not open. Branch three re-scans the whole book: 28 folios, 86,977.00 billed. UNION ALL concatenates without dedupe — disjoint by construction, overlap would SHOW. ORDER BY dollars ASC floats the footer last. And the stack does not foot on purpose: 84,829 moved-or-missing versus 86,977 billed — the 2,148 remainder is folio 25's unpaid balance, and the pack names it instead of burying it. Settled money, unpaid exposure, billed book: three denominators, one stack, every gap accounted for in writing.",
    },
    {
      id: "cs-expedia-6",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "The supply scorecard",
      brief:
        "Expedia-flavored brief on the storefront db (suppliers = property operators, products = rooms, order_items = reservation lines): market management reads partners before the renewal call — rooms under contract, reservations carried, room-nights, line-item revenue. Probed facts: Nordic Gadgets AB — 3 rooms, 4.6 rating, 38 reservations, 82 nights, 11,130.25 (32% of db revenue on three rooms); Midwest Hardware Co — 3 rooms, 4.4, 45 reservations, 109 nights, 9,294.93; Alpine Audio GmbH — 2 rooms, 4.8, 34 reservations, 77 nights, 4,765.63. The renewal shortlist is the top three by revenue. The grain audit the scorecard must survive: rooms is COUNT(DISTINCT p.id) — a supplier's product rows fan out across line items, and a bare COUNT(p.id) counts lines, not rooms.",
      ask: "Return the top three property operators by line-item revenue: name, rating, rooms, reservations, room-nights and revenue (2dp).",
      template:
        "SELECT s.name AS property,\n       s.rating,\n       COUNT({1} p.id) AS rooms,\n       COUNT(DISTINCT o.id) AS reservations,\n       SUM(oi.quantity) AS room_nights,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS room_revenue\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.product_id = p.id\nJOIN orders o ON o.id = oi.order_id\nGROUP BY s.id, s.name, s.rating\nORDER BY room_revenue {2}\nLIMIT {3};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the rooms dedupe",
          why: "COUNT(DISTINCT p.id) folds the fan-out back to rooms under contract — 3 for Nordic. A bare COUNT(p.id) counts every line row the supplier's rooms appear in (38+ for Nordic) and the 'rooms' column reads line volume wearing a contract count's name.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the revenue-first direction",
          why: "The renewal shortlist opens with the revenue leader — Nordic's 11,130.25. ASC would lead with Pacific Textiles' 2,980.15, and the meeting would open on the smallest partner as if the scorecard were sorted by need rather than by stake.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the shortlist cut",
          why: "LIMIT 3 keeps Nordic (11,130.25), Midwest (9,294.93) and Alpine (4,765.63) — the top three by revenue, with the 3-rooms cell appearing in the result to boot. A cut of 5 drags Shenzhen (3,049.07) and Pacific (2,980.15) into a shortlist built for three seats.",
        },
      ],
      distractors: ["ALL", "ASC", "5", "MAX"],
      walkthrough:
        "A four-table chain, five grains, one shortlist. The chain walks operator → room → line → reservation (suppliers, products, order_items, orders), and the fan-out compounds: each room contributes one row per reservation line, so GROUP BY s.id folds hundreds of lines back to six operator rows. The columns then split by grain and say so out loud: COUNT(DISTINCT p.id) is rooms under contract (3/3/2), COUNT(DISTINCT o.id) folds lines back to distinct reservations (38/45/34), SUM(oi.quantity) adds the physical nights (82/109/77), and SUM(quantity × unit_price) prices them — 11,130.25 for Nordic, 32% of the db's revenue on three rooms. COUNT(DISTINCT o.id) matters exactly because a booking with two lines would otherwise double-count its reservation. ORDER BY room_revenue DESC ranks by stake and LIMIT 3 cuts the shortlist to three — and the second column is the argument the meeting will have: Alpine's 4.8 rating on 2 rooms is the quality story, Nordic's 11,130.25 is the dependency story, and the scorecard carries both because renewal decisions read revenue and risk side by side.",
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
    { slug: "funnel-step-conversion", why: "Step-to-step conversion with honest per-step denominators — the search-to-book funnel in drill form, where each step's base is decided before the rate is read." },
    { slug: "median-time-to-convert", why: "Median time from search to booking — the conversion-latency read where averages lie on skewed windows and the percentile fold is the honest cut." },
    { slug: "basket-depth-aov", why: "Basket depth against order value — the bundling economics question (does a 2+-line booking clear higher?) staged per booking, never per line." },
    { slug: "average-selling-price", why: "Price per unit sold with quantity in the denominator — the clearing-price read Expedia's pricing science runs per market, weighted by units not rows." },
    { slug: "product-price-at-a-given-date", why: "As-of price lookup: the rate in force on the booking date, not today's — the slowly-changing-rate instinct every repricing audit assumes." },
    { slug: "calculate-product-final-price", why: "Composing a final price from base and modifiers — the package-rate build where the line-item sum must reconcile to the booking total or the folio is wrong." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Two events inside a rolling window — the repeat-booking trigger read, per traveler, with the window bounds stated rather than assumed." },
    { slug: "year-on-year-growth-rate", why: "YoY growth with real division and an honest base — the market-curve read that opens every business review, computed from the folds not the headlines." },
    { slug: "growth-accounting", why: "New, returning and resurrected demand in one accounting — the growth identity Expedia's market reviews reconcile against, every traveler in exactly one bucket." },
    { slug: "prepayment-detection", why: "Prepaid versus pay-at-property at settlement grain — the payment-timing split that divides exposure classes and decides what the month-close sweep must name." },
    { slug: "roas-by-campaign", why: "Revenue over spend per campaign with the zero-sales guard — the marketing-efficiency read whose denominator is spend and whose empty cases must print, not vanish." },
    { slug: "first-last-touch-attribution", why: "First and last touch per conversion — the attribution argmax that decides which search earned the booking, composed from two window reads under one rule." },
    { slug: "find-bursty-behavior", why: "Demand spikes against a baseline — the burst detection behind surge pricing and staffing, folded per market over a stated window." },
    { slug: "friday-purchases-i", why: "Weekday demand comparison against the prior week's same day — the weekly heartbeat read Expedia's demand curves run on, same-day-aligned and honest." },
    { slug: "the-most-recent-three-orders", why: "Top-3 recency per entity — the argmax-with-tie-break habit the recency and personalization surfaces run on, deterministic by construction." },
    { slug: "duplicate-charge-pairs", why: "Self-join pair detection on settlements — the double-charge sweep finance runs at month-close, keyed on the business key with symmetric pairs deduped." },
  ],
};
