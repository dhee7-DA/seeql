// Airbnb — kit 1 of the Travel & Hospitality domain (Batch G).
// The host marketplace: search-to-stay funnel conversion, listing supply and
// host-quality (Superhost-style) reads, cancellation windows between booking
// and check-in, and repeat-guest trust. Registry pool = 4 tagged sql rows
// (funnel-step-conversion, median-time-to-convert, keep-latest-dedupe,
// point-in-time-asof) — all four are used first in problems and topics; the
// remaining pool picks are theme-curated to the funnel/supply/trust stack
// and the header says so. Case studies run on the storefront db with probed
// figures (scripts/company-facts.md): orders = bookings/stays, customers =
// guests, suppliers = hosts/properties, products = listings, shipped_at =
// check-out, cancelled = dropped booking. Facts-file figures only.

import type { CompanyKit } from "../types";

export const airbnbKit: CompanyKit = {
  id: "airbnb",
  domainId: "travel",
  name: "Airbnb",
  tagline: "Searches to stays: the long booking funnel",
  accent: "text-rose-500",

  brief: [
    "Airbnb is the host marketplace that turned spare rooms into a global accommodation network — **millions of active listings** in nearly every country, reachable through a search funnel that has to earn trust before it earns a reservation. The business runs on a long funnel: search → listing view → booking request → {amber:check-in} → stay → review, and every step leaks demand. Inventory here is perishable and personal — a night unsold at a host's place is gone forever — so the demand side lives on search-to-stay conversion while the supply side lives on listing growth, occupancy and host quality. And because guests can cancel until check-in, 'bookings placed' and 'stays that happened' are different numbers, exactly like *orders placed versus orders kept*.",
    "The data org mirrors the marketplace: supply teams model listing onboarding, supply growth and Superhost-style quality distributions; demand teams own search ranking and the search-to-stay funnel; trust teams hunt fraud, duplicate accounts and review abuse; finance closes host payouts against **gross booking value** with bank-grade reconciliation. Analysts live in SQL over event tables — searches, impressions, booking requests, {rose:cancellations}, {emerald:check-ins}, reviews — and the first question in every review is *which population a number describes*: searches or searchers, bookings or guests, placed or kept.",
    "Interview screens are funnel-heavy and grain-heavy. Expect search-to-stay conversion with an explicit denominator, dedupe-to-latest-event on retried booking events, as-of joins against slowly changing listing attributes (what the price WAS at booking time), **median time-to-convert** — *because means lie on skewed funnels* — and conditional counts that reconcile: check-outs plus open bookings plus {rose:cancellations} must sum to placements. Windows appear wherever a leaderboard or a 'previous stay' comparison appears. Interviewers grade the narration: **grain, denominator and survival rule**, stated before the SQL.",
    "Prep by drilling the funnel on a small, honest dataset. This kit runs on the storefront practice db with a fixed mapping — orders are bookings, customers are guests, suppliers are hosts, products are listings, `shipped_at` is check-out, cancelled is a dropped booking — so every shape you build here transfers: completion shares by region, above-market listing benchmarks, loyalty-tier censuses, {rose:unpaid-folio sweeps}. Master the **two-grain census** (bookings vs guests), the conditional-count ratio, the rank trio, and month-bucket seasonality — then practice *saying the denominator out loud* before you divide.",
  ],

  dayInLife: [
    "**08:30 —** Morning starts on the funnel wall: overnight search-to-book conversion, {emerald:check-out completion share} (on the practice db: **82 of 103** placed bookings carry a check-out), and any {rose:cancellation spike} by region or listing tier. The first hour is reconciliation — the dashboard's check-outs, open bookings and cancellations must sum to placements before anyone screenshots it. Numbers ship with their denominators printed; a completion share without 'of placed' in the label gets bounced in review.",
    "**11:00 —** Midday is deep-dive work: a ranking experiment moved bookings in one market, so you dedupe retried booking events with a `ROW_NUMBER` tie-break, fold **median time-to-convert** per arm (the mean is being dragged by a months-late tail), and check whether the listing supply in that market shifted under the experiment. Supply analysts run the same morning on the other side: host acceptance rates, new-listing activation, the quality bench of hosts above the 4.5 review line versus the long tail below it. Both sides print the population beside the estimate, because a lift without its grain does not survive the afternoon review.",
    "**14:30 —** The afternoon is stakeholder cycles: a trust review on **duplicate guest accounts** (same payment instrument, same address, multiple accounts), then the finance payout close — the {rose:unpaid-folio sweep} that counts reservations with no settlement row, valued in dollars from integer cents. Trust wants the clusters counted by instrument; finance wants the exposure valued before close; both get the same rule — the population is printed in the label, not implied. When a stakeholder challenges a number, the answer is the query, not a re-argument.",
    "**17:30 —** You end the day writing the definitions into the readout itself, because at Airbnb *the metric definition IS the deliverable*: the SQL is reproducible, the denominator is the argument. The readout carries the morning's reconciliation, the experiment's dedupe rule and the folio sweep's survival rule — every number next to the population it describes. Tomorrow's dashboard opens against tonight's definitions, and when the two don't reconcile, the writeup is the first place anyone looks.",
  ],

  metrics: [
    { name: "Search-to-stay conversion", what: "Share of searches that end in a completed, checked-out stay — the funnel's master rate, read per market and per rank change. Every variant (search→book, book→stay) has a different denominator, so screens and reviews alike open with 'conversion of WHAT?'" },
    { name: "Gross booking value (GBV)", what: "Total value of bookings placed in a window — kept demand only once completions are netted against cancellations. GBV is the top line finance and the board model; the placed-versus-kept split is the first fork every analyst must state out loud." },
    { name: "Nights booked", what: "Volume of nights reserved — the physical unit the marketplace sells and the supply-side load measure behind occupancy and cleaning-ops planning. Nights, not bookings, because long stays and short stays make 'bookings' a noisy proxy." },
    { name: "Average daily rate (ADR)", what: "Booking value divided by nights — the price mix read that pricing and Smart-Pricing teams move directly. ADR splits demand quality from demand volume; a conversion push that trades ADR for bookings shows up here first." },
    { name: "Stay completion share", what: "Check-outs divided by ALL placed bookings in the population — cancelled and not-yet-open stays included in the base. The honest kept-demand read: on the practice db 82 of 103 bookings carry a check-out, and the denominator rule is what makes regions comparable." },
    { name: "Cancellation share", what: "Cancelled bookings divided by placements, watched by region, lead time and cancellation-window bucket. Cancellations are the funnel's silent leak: the practice db runs 6.8% overall but APAC 8.1% versus US 5.3% — the spread is the story, and the denominator makes it real." },
    { name: "Active listing supply", what: "Bookable listings live in search, with activation and retirement flows folded in. Supply growth is the marketplace's other engine — demand without bookable supply is a search result page of disappointment." },
    { name: "Repeat-guest share", what: "Guests with two or more stays over all guests who booked — the trust flywheel metric. On the practice db 14 of 16 guests repeat, and repeat demand is the cheapest demand: reviews compound, and rebooking skips the trust-building steps of the funnel." },
  ],

  topics: [
    {
      name: "Funnel step conversion",
      why: "The search→book→check-out funnel is Airbnb's master measurement, and step conversion is a conditional-count pivot over stage events with honest per-stage denominators. Every demand review and every ranking experiment reads through this shape.",
      slugs: ["funnel-step-conversion", "ads-funnel", "email-engagement-funnel"],
    },
    {
      name: "Two-grain counting",
      why: "Bookings and guests are different grains that disagree on purpose: 45 EU bookings fold to 8 guests. Analysts who can't hold both counts in one query can't produce the intensity reads the marketplace runs on.",
      slugs: ["percentage-of-users-attended-a-contest", "find-followers-count", "product-sales-analysis-iii"],
    },
    {
      name: "Conversion shares & ratios",
      why: "Acceptance rates, completion shares and review ratios all divide a conditional count by a fold of the same rows. The failure modes — integer division, denominator drift after a WHERE — are exactly what the screens probe.",
      slugs: ["friend-requests-i-overall-acceptance-rate", "queries-quality-and-percentage", "ads-performance"],
    },
    {
      name: "Keep-latest dedupe",
      why: "Booking and listing events arrive duplicated under retries and client replays; the funnel counts only stay honest if 'latest event wins' is deterministic — ROW_NUMBER with a timestamp plus id tie-break, not a bare MAX.",
      slugs: ["keep-latest-dedupe", "find-latest-salaries", "product-price-at-a-given-date"],
    },
    {
      name: "Median & typical-guest math",
      why: "Time-to-convert is skewed and incomplete, so Airbnb-style funnel reporting quotes medians. Median emulation over ordered values is a screen staple because it tests windows AND population definitions at once.",
      slugs: ["median-time-to-convert", "median-employee-salary", "station-median"],
    },
    {
      name: "Calendar slicing",
      why: "Travel demand is seasonal and lead-time-driven: month buckets, 'latest activity in year X' and in-period folds are the daily reads. Half-open date windows and SUBSTR month keys are the house style.",
      slugs: ["monthly-transactions-i", "the-latest-login-in-2020", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "Ranking windows",
      why: "Listing ladders, top-three per market and recency surfaces are all windows over folded aggregates — and ties on review scores or unit counts force the RANK-vs-DENSE_RANK business decision out loud.",
      slugs: ["rank-scores", "the-most-recent-three-orders", "second-most-recent-activity"],
    },
    {
      name: "Join survival rules",
      why: "Guest profiles joined to stays, listings to hosts: who survives the join IS the report. LEFT-versus-INNER is a decision about the answer population, and the WHERE-collapse trap is the most-failed screen question in this family.",
      slugs: ["combine-two-tables", "employee-bonus", "count-student-number-in-departments"],
    },
    {
      name: "CASE segmentation",
      why: "Flexible versus strict cancellation, stay tiers, market bands — segmentation is CASE WHEN over row facts, and the ELSE arm is the exhaustiveness audit that keeps every guest classified exactly once.",
      slugs: ["the-winner-university", "weather-type-in-each-country", "calculate-special-bonus"],
    },
    {
      name: "Benchmark subqueries",
      why: "Pricing work benchmarks each listing against the catalog-wide market rate — a scalar subquery in SELECT and in WHERE, two folds that must agree on their population, and a NULL if that population ever comes back empty.",
      slugs: ["game-play-analysis-iv", "second-highest-salary", "orders-with-maximum-quantity-above-average"],
    },
  ],

  theory: [
    {
      id: "airbnb-t1",
      q: "For a trust report on guests who never completed a stay — LEFT JOIN or INNER JOIN, and where does the status filter live?",
      a: "Decide from the survival rule the question implies. 'Guests who never completed a stay' must be LEFT from guests — the unmatched guests ARE the answer, arriving with NULL booking columns — and the filter that keeps them lives in the WHERE as an IS NULL test on the booking key, or better as NOT EXISTS. The trap that fails this screen: putting a right-side predicate like b.status = 'completed' in WHERE, which discards the NULL-payload rows and silently collapses the LEFT JOIN to an INNER — the never-stayed guests vanish exactly when they become the answer. And the INNER variant answers a different question entirely ('guests with completed stays'). Join type is a population decision: say who survives, then pick the join that lets them.",
      tag: "joins",
    },
    {
      id: "airbnb-t2",
      q: "Booking events arrive duplicated — same guest, same listing, same created_at second. How do you keep exactly one row, and what makes the choice defensible?",
      a: "Detection first: GROUP BY guest, listing, created_at HAVING COUNT(*) > 1 sizes the duplicate pool — that count is the data-quality number you quote before deduping anything. Collapse with ROW_NUMBER() OVER (PARTITION BY guest, listing ORDER BY created_at DESC, id DESC) = 1: the timestamp picks latest, and the id DESC tie-break makes 'latest ingest wins' deterministic when two rows share the second, which retries guarantee. What makes it defensible is being able to say which rows were discarded and why the business agreed to lose them — 'it returns one row per event' is not a defense, 'these N duplicate events were folded to their latest ingest' is. Airbnb-style funnels count unique events; a dedupe that isn't deterministic turns every funnel count into a re-run lottery.",
      tag: "windows",
    },
    {
      id: "airbnb-t3",
      q: "Your region report must show bookings AND distinct guests side by side. Why do the two counts disagree, and what does each number mean to the marketplace?",
      a: "They disagree because they fold at different grains. COUNT(*) counts rows after the join — one per booking, so a guest with five stays contributes five. COUNT(DISTINCT customer_id) folds repeats back to people. Neither is wrong: bookings measure load on the stays machine (cleaning, check-in, support), guests measure audience, and the ratio between them is the intensity signal — on the practice db EU runs 45 bookings from 8 guests while US runs 19 from 2, a small region of heavy bookers versus a broad one of steady ones. The trap is a third count sneaking in: join bookings to line-item-level tables and COUNT(*) silently counts something else. Saying 'one row per what?' out loud for every COUNT in the query is the habit the interviewer grades.",
      tag: "aggregation",
    },
    {
      id: "airbnb-t4",
      q: "shipped_at — here, the check-out timestamp — stays NULL until the stay actually happens. What is your NULL policy for a stay-latency report?",
      a: "Define the population first, then let the NULLs do definitional work. Only stays that happened HAVE latency, so computing julianday(shipped_at) - julianday(created_at) with shipped_at IS NOT NULL filtered in WHERE is correct — but say it: 'this report measures check-out latency of bookings that reached check-out; pending and cancelled are out of scope.' The three NULL behaviors matter in order: filters (NULL fails both = and !=, so an unfiltered comparison silently drops rows), aggregates (COUNT(col) skips NULLs — that's exactly how you count check-outs — while COUNT(*) keeps the row), and display (a NULL latency is 'not yet', never zero — coalescing it to 0 launders in-progress stays into an instant check-out). On the practice db that policy yields 82 latency-bearing bookings averaging 2.98 days, range 2 to 4 — numbers that mean something precisely because the population was stated.",
      tag: "nulls",
    },
    {
      id: "airbnb-t5",
      q: "In a funnel query, where do stage filters live — WHERE or HAVING — and what breaks when one lands in the wrong clause?",
      a: "The pipeline order decides: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. A stage predicate is a ROW-level fact — status = 'cancelled', created_at in the market window — so it lives in WHERE, discarding rows before the fold. A stage AGGREGATE condition is a GROUP-level fact — 'markets with more than ten placed bookings', 'months with a completion share above 80%' — so it lives in HAVING, judging folded groups. Put the row filter in HAVING and you've wasted the fold on rows that never mattered; put the group gate in WHERE and the query won't even parse, because the aggregate doesn't exist yet. The Airbnb-specific bite: a HAVING COUNT(*) > 10 gate is also an honesty instrument — it keeps small-N markets from topping a completion leaderboard on sample size alone. Clause placement is not style; it's which population the number describes.",
      tag: "pipeline",
    },
    {
      id: "airbnb-t6",
      q: "You benchmark each listing against the catalog-wide market rate. Scalar subquery in SELECT versus in WHERE — what does each compute, and what happens when the inner query is empty?",
      a: "Same fold, two jobs. In WHERE — price > (SELECT AVG(price) FROM listings) — the scalar acts as the benchmark threshold, deciding which rows survive. In SELECT — ROUND((SELECT AVG(price) …), 2) AS market_rate — it becomes a printed column, so the report shows the rate and the above-rate count describing each other. The empty-inner-query behavior is the part interviewers wait for: a scalar subquery returns 0 or 1 rows, and 0 rows yields NULL — not an error — so price > NULL is UNKNOWN and the WHERE silently passes nothing. A benchmark against a filtered staging population that happens to be empty returns a report of nothing while looking healthy. The discipline: know which population the inner fold covers, and check for emptiness before trusting the comparison — the silent-NULL benchmark is how pricing decks ship numbers that mean 'no data' and get read as 'no premium'.",
      tag: "subqueries",
    },
    {
      id: "airbnb-t7",
      q: "Lead time and stay length are day math on TEXT timestamps. How do you bucket bookings by month, diff days, and where does each approach break?",
      a: "Three tools, three caveats. Buckets: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on fixed-width ISO text — gives the month spine every seasonality read hangs on; the SUBSTR shortcut dies the day the format drifts. Diffs: JULIANDAY(check_out) - JULIANDAY(created_at) returns fractional days; round once at the END, not per row — the practice db's 2.98-day average check-out latency is exactly that shape. Windows: half-open intervals — created_at >= '2025-02-01' AND < '2025-03-01' — never BETWEEN on the last day, which drops the month's biggest booking night. The deeper breaks are conventions: these strings carry no timezone, and shipped_at is NULL until check-out, so every date fold needs its population stated first. State the convention, then query it — never the reverse.",
      tag: "dates",
    },
    {
      id: "airbnb-t8",
      q: "Your funnel counts moved 3% overnight with no product change. Walk me through the data-quality checks you run before believing the trend.",
      a: "Reconciliation before interpretation. First, the identity: check-outs plus open bookings plus cancellations must equal placements — on the practice db 52 + 30 + 14 + 7 = 103 — and if the branches no longer sum, the fold's population moved. Second, duplication: COUNT(*) versus COUNT(DISTINCT event_key) — retried booking events inflate placed-demand counts and deflated conversion alike; a keep-latest dedupe with a deterministic tie-break is the fix. Third, population drift: did a WHERE window (half-open boundaries, a new market bucket) silently change the denominator? Compare the denominator's own trend, not just the numerator's. Fourth, watermark sanity: did a backfill re-run double-load a window? The habit being graded is treating two numbers that should agree and don't as the FINDING — at Airbnb the funnel is the company's heartbeat, and a 3% move that's actually a duplicate event storm is a war-room incident, not a trend.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "airbnb-mcq-1",
      prompt: "On the bookings table, shipped_at is the check-out timestamp and stays NULL until a stay actually happens. Which expression counts check-outs?",
      choices: ["COUNT(*)", "COUNT(shipped_at)", "SUM(shipped_at)", "COUNT(DISTINCT customer_id)"],
      answer: 1,
      why: "COUNT(col) skips NULLs, so COUNT(shipped_at) counts exactly the 82 of 103 bookings that reached check-out — the stay-happened subset the funnel wall reports.",
      notes: [
        { choice: 0, why: "COUNT(*) counts every placed booking — 103, including the 14 pending and 7 cancelled that never checked in. It answers 'demand placed', not 'stays that happened'." },
        { choice: 2, why: "SUM over timestamp text coerces dates to numbers — a five-digit nonsense total, not a count. Aggregating dates is a type error wearing a result." },
        { choice: 3, why: "COUNT(DISTINCT customer_id) folds to guests, not check-outs — a useful number, but for a different metric on a different grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "airbnb-mcq-2",
      prompt: "EU shows 45 bookings from 8 guests. What does the gap between COUNT(*) and COUNT(DISTINCT customer_id) measure?",
      choices: ["Nothing — a data bug", "Repeat intensity: bookings per guest", "Guest revenue", "Cancellation risk"],
      answer: 1,
      why: "45 booking rows fold to 8 people; the gap is the intensity signal — bookings per guest — that separates load on the stays machine from audience size.",
      notes: [
        { choice: 0, why: "The gap is structural: repeat bookings fan the join by design. No corruption is required for the two counts to disagree." },
        { choice: 2, why: "Revenue needs SUM(total) — EU's 15,089.23. Counting never prices anything; the two-grain census is about rows versus people." },
      ],
      difficulty: "easy",
    },
    {
      id: "airbnb-mcq-3",
      prompt: "Total booking demand is 34,833.28 across 103 bookings. Which expression prints AOV for the deck?",
      choices: [
        "AVG(SUM(total))",
        "ROUND(SUM(total) / COUNT(*), 2)",
        "ROUND(AVG(per_guest_avg), 2) over per-guest averages",
        "SUM(total) / COUNT(DISTINCT customer_id)",
      ],
      answer: 1,
      why: "AOV is value over bookings: 34,833.28 / 103 = 338.19, computed in one fold where numerator and denominator share a population.",
      notes: [
        { choice: 0, why: "AVG(SUM(total)) is an aggregate over an aggregate — invalid without staging, and meaningless even when it parses." },
        { choice: 2, why: "Averaging per-guest averages weights the 1-stay guest and the 24-stay guest equally — a different metric that quietly reads as AOV in reviews." },
        { choice: 3, why: "34,833.28 / 16 = 2,177.08 — lifetime value per guest, a legitimate KPI wearing AOV's name." },
      ],
      difficulty: "easy",
    },
    {
      id: "airbnb-mcq-4",
      prompt: "7 of 103 bookings are cancelled (6.8%). Which shape computes the cancellation share honestly?",
      choices: [
        "Filter cancelled rows in WHERE, then 100.0 * COUNT(*) / COUNT(*)",
        "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) over all rows",
        "100.0 * COUNT(status) / COUNT(*)",
        "COUNT(status = 'cancelled') * 100.0 / 7",
      ],
      answer: 1,
      why: "Numerator and denominator must fold the same population: the conditional sum counts the 7 cancelled rows while COUNT(*) holds all 103 placements — 6.8%, and regional splits like APAC 8.1% versus US 5.3% stay comparable.",
      notes: [
        { choice: 0, why: "That's a ratio of the filter to itself — 100% by construction. Denominator drift: the WHERE deleted the numerator's rows from the base." },
        { choice: 2, why: "COUNT(status) counts non-NULL statuses — 103, not 7. You'd publish a 100% cancellation rate and be off by an order of magnitude." },
      ],
      difficulty: "medium",
    },
    {
      id: "airbnb-mcq-5",
      prompt: "Booking-event rows arrive duplicated: same guest, same listing, same created_at second. Which shape keeps exactly one row, deterministically?",
      choices: [
        "GROUP BY guest, listing picking MAX(created_at)",
        "ROW_NUMBER() OVER (PARTITION BY guest, listing ORDER BY created_at DESC, id DESC) = 1",
        "SELECT DISTINCT on all columns",
        "ORDER BY created_at DESC LIMIT 1",
      ],
      answer: 1,
      why: "ROW_NUMBER with a deterministic tie-break — timestamp DESC, then id DESC — keeps exactly one row per (guest, listing) even when timestamps tie; the id turns 'latest ingest wins' into a decision instead of engine roulette.",
      notes: [
        { choice: 0, why: "MAX(created_at) collapses values, not rows — joined back, BOTH tied rows survive and the duplicate set doubles again." },
        { choice: 2, why: "DISTINCT only removes exact clones; one differing column (a price snapshot, an experiment bucket) keeps both rows alive." },
      ],
      difficulty: "medium",
    },
    {
      id: "airbnb-mcq-6",
      prompt: "Why does funnel reporting quote MEDIAN time-to-convert rather than the mean?",
      choices: [
        "Medians are cheaper to compute",
        "A tail of bookings that convert months late drags the mean far off the typical searcher",
        "Medians ignore NULLs; means don't",
        "Medians work on text dates",
      ],
      answer: 1,
      why: "Conversion latency is right-skewed and incomplete — never-converters and months-late bookings drag the mean; the median answers 'the typical guest' and stays interpretable, which is why the screens test the median-emulation shape.",
      notes: [
        { choice: 2, why: "Both aggregates skip NULLs. The real issue is defining the never-converted population in or out — not letting the engine skip it silently." },
        { choice: 0, why: "Cost is irrelevant at funnel scale; the choice is about the distribution's shape, and it's a business-readability argument." },
      ],
      difficulty: "medium",
    },
    {
      id: "airbnb-mcq-7",
      prompt: "A trust audit needs guests who never completed a stay: SELECT g.name FROM guests g LEFT JOIN bookings b ON b.customer_id = g.id WHERE b.status = 'completed'. What happened?",
      choices: [
        "Correct — the LEFT JOIN keeps everyone",
        "The WHERE collapsed it to an INNER JOIN: only guests WITH completed stays return",
        "It now returns guests with cancelled stays",
        "It double-counts repeat guests",
      ],
      answer: 1,
      why: "Testing the right table's column in WHERE discards the NULL-payload rows the LEFT JOIN preserved — the never-stayed guests, which were the entire answer, are gone while the query still looks correct.",
      notes: [
        { choice: 0, why: "The LEFT-ness lives in the ON clause only; a right-side predicate in WHERE reverses it. NULL = 'completed' is UNKNOWN → discarded." },
        { choice: 3, why: "Fan-out duplication is a real but separate effect — here rows are REMOVED, not duplicated. One bug per query; know which one you own." },
      ],
      difficulty: "medium",
    },
    {
      id: "airbnb-mcq-8",
      prompt: "WHERE price > (SELECT AVG(price) FROM listings_active) returns zero rows on a staging table that has no rows. Why?",
      choices: [
        "AVG errors on empty input",
        "The scalar subquery returns NULL; price > NULL is UNKNOWN, so nothing passes — silently",
        "Zero rows is the correct, honest answer by definition",
        "SQLite auto-fills AVG as 0",
      ],
      answer: 1,
      why: "An empty scalar subquery yields NULL — not an error — and every comparison against NULL is UNKNOWN, so the benchmark returns nothing while looking healthy. Staged populations need an emptiness check before the comparison is trusted.",
      notes: [
        { choice: 0, why: "AVG over an empty set returns NULL quietly. The silence IS the bug — there's no stack trace to alert anyone." },
        { choice: 2, why: "It might be honest — but only if someone decided it. An unexplained empty result is how broken staging data ships into a pricing deck." },
      ],
      difficulty: "hard",
    },
    {
      id: "airbnb-mcq-9",
      prompt: "Which WHERE captures every February 2025 booking on a TEXT timestamp, including the last night of the month?",
      choices: [
        "created_at BETWEEN '2025-02-01' AND '2025-02-28'",
        "created_at >= '2025-02-01' AND created_at < '2025-03-01'",
        "SUBSTR(created_at, 1, 7) = '2025-02'",
        "created_at LIKE '2025-02%'",
      ],
      answer: 1,
      why: "The half-open interval [Feb 1, Mar 1) admits every timestamp through 2025-02-28 23:59:59 and is index-shaped — the house style for season windows, where the month's last night is prime booking time.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive both ends: a 18:40 booking on the 28th exceeds the '2025-02-28' bound and vanishes — the last-night demand silently gone." },
        { choice: 2, why: "SUBSTR reads correct rows on fixed-width ISO text but scans everything and breaks the day the format drifts. Correct today is not the bar; sargable and format-proof is." },
      ],
      difficulty: "hard",
    },
    {
      id: "airbnb-mcq-10",
      prompt: "APAC: 3 cancelled of 37 placed. What does 100 * 3 / 37 evaluate to in SQLite — and what's the fix?",
      choices: [
        "8.1 — division is real-valued",
        "8 — integer division truncates; write 100.0 * 3 / 37",
        "0 — the whole expression truncates to zero",
        "12.3 — operands bind right-to-left",
      ],
      answer: 1,
      why: "INTEGER / INTEGER floors: 300 / 37 = 8, not 8.1. The 100.0 multiplier promotes the chain to real arithmetic before division — the difference between a real share and a floored one, and at 1-of-103 the same bug reads 0%.",
      notes: [
        { choice: 0, why: "Only because a REAL touched the expression. All-integer operands keep integer division — the bug that survives every code review that reads 'it looks like math'." },
        { choice: 2, why: "Truncation gives 8 here; zero needs a share under 1% — same bug, worse disguise, and cancellation shares live exactly in that range." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-airbnb-1",
      tier: "medium",
      topic: "j7",
      universe: "funnel",
      title: "The stay-completion map",
      brief:
        "Airbnb-flavored brief on the storefront db (orders = bookings, shipped_at = check-out): the supply review opens with the stay-completion map — of the bookings placed, how many ran their course to check-out, region by region — and the host-quality lead is explicit about the denominator: 'completion is check-outs over ALL placed bookings; cancellations and not-yet-open stays stay in the base.' Probed facts: 103 bookings split EU 45 / APAC 37 / US 19 / LATAM 2; a check-out is present on 82 of them (delivered 52 plus shipped 30 in the raw states) — EU 36, APAC 29, US 15, LATAM 2. LATAM's two-book pool wins no leaderboard: the map is gated to regions with more than ten placed bookings, so a small-N share can't top the board.",
      ask: "Return each region with more than ten placed bookings: bookings, check-outs, and completion share to one decimal, best completion first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS booked,\n       {4}(o.shipped_at) AS stayed,\n       ROUND(100.0 * COUNT(o.{1}) / COUNT(*), 1) AS stay_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING COUNT(*) > {2}\nORDER BY stay_pct {3};",
      slots: [
        {
          answer: "shipped_at",
          kind: "keyword",
          label: "the check-out column",
          why: "COUNT(o.shipped_at) counts non-NULL check-outs — the stay-happened subset. created_at or status are never NULL, so either would read booked = stayed and print a flat 100% completion everywhere. COUNT(col)'s NULL-blindness is the definition here, not a bug.",
        },
        {
          answer: "10",
          kind: "number",
          label: "the small-N gate",
          noVerify: true,
          why: "More than ten placed bookings keeps EU, US and APAC and drops LATAM's two-book pool, whose 100% share is a small-sample artifact, not a market signal. A threshold of 2 lets the artifact top the board; 19 silently drops the US.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the best-first direction",
          why: "The map reads best completion first — EU 80.0, US 78.9, APAC 78.4. ASC would open the review with APAC and read as a failure report; the same query, aimed at the opposite decision.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the check-out counter",
          why: "COUNT(o.shipped_at) folds each region's rows to the non-NULL check-out subset — 36, 15, 29. SUM would coerce the date strings into numbers (EU reads 72870), MAX returns the latest date text; neither is a count of stays.",
        },
      ],
      distractors: ["created_at", "status", "20", "19", "ASC", "SUM"],
      walkthrough:
        "A completion share is a survival read. The join attaches each booking to its guest's region — all 103 rows survive — GROUP BY folds them per region, and the two counters read two populations: COUNT(*) counts placements (45, 19, 37) while COUNT(o.shipped_at) counts check-outs (36, 15, 29), because shipped_at stays NULL until the stay happens and pending or cancelled bookings drop out of the numerator, never the denominator. The ratio is guarded twice: 100.0 forces real division before integer truncation can floor 78.947 to 78, and ROUND(…, 1) prints the share the review expects. HAVING COUNT(*) > 10 is the honesty gate — LATAM's two bookings complete at 100% and would top the board on sample size alone; gate it and the map reads EU 80.0, US 78.9, APAC 78.4, best first. The status-vocabulary trap sits in the check-out column: created_at and status are never NULL, so either silently turns completion into a flat 100% — a correct-looking query that claims every booking ran its course.",
    },
    {
      id: "cs-airbnb-2",
      tier: "easy",
      topic: "q2",
      universe: "pricing",
      title: "The above-market listing benchmark",
      brief:
        "Airbnb-flavored brief on the storefront db (products = listings): pricing wants a nightly-rate benchmark before the next Smart-Pricing review — the catalog-wide market rate to two decimals, and the count of listings priced above it. Probed facts: 16 listings from a 14.99 floor to the 199.99 Smart Watch S ceiling; the shelf splits 8 mid (avg 111.50) and 8 budget (avg 32.06); the market rate works out to 71.78. Six listings clear the bar — Fitness Band X2 at 79.00 up through the 199.99 watch — and the deliverable is one row, so the number drops straight into the pricing deck beside its own definition.",
      ask: "Return one row: the count of listings priced above the catalog-wide market rate, and that market rate rounded to 2 decimals.",
      template:
        "SELECT {1}(*) AS above_market,\n       ROUND((SELECT {2}(price) FROM products), {3}) AS market_rate\nFROM products\nWHERE price > (SELECT AVG(price) FROM products);",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the listing counter",
          why: "COUNT(*) counts the rows that survive the above-market predicate — 6 listings. SUM(*) and MAX(*) are syntax errors: only COUNT folds a star into a group count.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the market-rate fold",
          why: "AVG(price) over all 16 listings prices the market at 71.78. MAX would print the 199.99 ceiling as a 'market rate' and MIN the 14.99 floor — either redefines the benchmark and the deck's whole comparison silently changes meaning.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          noVerify: true,
          why: "Money prints to 2 decimals: 71.78, not 71.8 or 72 — the shape every rate cell in the deck carries. ROUND to 0 would publish 72 and round a real benchmark away.",
        },
      ],
      distractors: ["SUM", "MAX", "MIN", "0"],
      walkthrough:
        "A benchmark is a fold plus a filter that must agree on their population. The inner SELECT AVG(price) folds all 16 listings to one scalar — 71.776875 raw, ROUND(…, 2) prints 71.78 — and the WHERE predicate keeps the six listings whose price clears it: 199.99, 149.99, 129, 119, 89.99, 79. The count cell and the rate cell therefore describe each other: six above 71.78, and 71.78 is the line they clear. Swap the fold to MAX and the 'market rate' becomes the 199.99 ceiling — an above-market count with zero context; MIN makes the 14.99 floor 'the market' and above-market becomes almost the whole shelf. ROUND to 0 publishes 72 — a different number than every other cell in the deck carries. And the scalar subquery returns exactly one row here; if the population ever filtered to empty it would return NULL and the predicate would silently keep nothing — the reason empty-inner-query checks belong in every benchmark review.",
    },
  ],

  problems: [
    { slug: "funnel-step-conversion", why: "The search→book→check-out stage pivot: FIRST_VALUE over stage events is exactly how the funnel team measures step conversion — this kit's case-1 muscle in textbook form." },
    { slug: "median-time-to-convert", why: "Median emulation over search-to-booking latency: the typical-guest read Airbnb quotes instead of a mean that a months-late tail drags around." },
    { slug: "keep-latest-dedupe", why: "Booking and listing events duplicate under retries; ROW_NUMBER with an id tie-break keeps exactly one row — the dedupe reflex behind every honest funnel count." },
    { slug: "point-in-time-asof", why: "As-of joins against slowly changing listing attributes: what the price and cancellation policy WERE at booking time, not what they are now." },
    { slug: "ads-funnel", why: "Impression→click→purchase pivots to search→book: the same three-stage conditional-count shape the demand team ships weekly." },
    { slug: "email-engagement-funnel", why: "Host-newsletter opens→clicks→bookings: stage conversion with honest per-stage denominators, the growth team's read." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share of guests per listing attribute: DISTINCT denominators folded per group — the two-grain census in ratio form." },
    { slug: "queries-quality-and-percentage", why: "Per-query quality ratios: the rating-share shape behind listing-quality scorecards." },
    { slug: "friend-requests-i-overall-acceptance-rate", why: "Sent→accepted ratio is host-acceptance analytics: a rate whose denominator is requests, not guests — the definition fork every screen probes." },
    { slug: "monthly-transactions-i", why: "Month-bucketed bookings with status flags: the seasonality spine (SUBSTR month keys) every travel review hangs on." },
    { slug: "the-latest-login-in-2020", why: "Latest activity per guest per year: MAX with a date filter — guest-recency reads for reactivation campaigns." },
    { slug: "rank-scores", why: "Score ladders where ties must be handled explicitly: RANK versus DENSE_RANK as a business decision on review-score boards." },
    { slug: "the-most-recent-three-orders", why: "Each guest's last three stays via ROW_NUMBER: recency windows power the 'book again' surfaces." },
    { slug: "combine-two-tables", why: "LEFT JOIN guest profiles onto stays: the survival-rule drill — who stays in the report when the right side is empty." },
    { slug: "weather-type-in-each-country", why: "CASE over region values: demand mix by market — the segmentation shape behind regional supply reviews." },
    { slug: "game-play-analysis-iv", why: "The fraction of guests back the day after: next-day retention math = early-funnel conversion reads." },
  ],
};
