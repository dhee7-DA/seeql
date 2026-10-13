// Trivago — wave-6 kit 10 of the Travel & Hospitality domain.
// Meta-search angle: rate comparison funnels, click-out conversion, advertiser
// bids. Pool provenance: Trivago has NO registry tags in this app's pools — 0
// tagged LC problems — so every topic and problem slug is theme-curated from
// scripts/company-pools.md's theme menu, mirroring the workflows Trivago
// screens are known to probe (rate funnels, conversion ratios, dedupe of
// duplicate offers, market-benchmark subqueries, date-bucketed pace). Case
// studies run on the storefront db with probed figures from
// scripts/company-facts.md — mapped honestly as orders=booked rates (click-out
// conversions), products=rate offerings (property-rate combos), order_items=
// rate lines in the booked set, customers=searchers, suppliers=advertisers
// (OTAs and chains bidding for placement), shipped_at=stay completed.

import type { CompanyKit } from "../types";

export const trivagoKit: CompanyKit = {
  id: "trivago",
  domainId: "travel",
  name: "Trivago",
  tagline: "Hotel meta-search: rate funnels",
  accent: "text-blue-300",

  brief: [
    "**Trivago** is the Düsseldorf rate meta-search inside Expedia Group — a marketplace that *doesn't sell rooms*: it compares advertiser rates side by side, and earns when a searcher clicks out and books. The analytics culture is funnel-shaped and advertiser-funded, and in this app's training db the mapping is honest: `orders` are booked rates (click-outs that converted into reservations), products are rate offerings (property-rate combos), customers are searchers, suppliers are advertisers bidding for placement, and shipped_at is the stay completed. Probed scale: **103 booked rates worth 34833.28** across **251 rate lines**, 16 offering types and 6 advertisers — every number a rate board needs on one screen.",
    "The data org reads funnels and bills advertisers. The funnel census: 52 {emerald:completed} stays, 30 {sky:in-stay}, 14 {amber:pending} in the booking window, 7 {rose:cancelled} — 6.8% of booked rates that never materialize, and the denominator every conversion share must print. The advertiser book moves in integer cents across 28 invoices and 27 payments — card 16 worth 37364, wire 11 worth 32248 — with 6 books worth 15217 cents carrying no settlement at all. Market reads lean on concentration: the top bookers carry **63.5%** of booking value above the 3000 line, so advertiser yield follows a few heavy markets.",
    "The SQL screens are live-db and denominator-ruthless. You will be asked for a monthly pace read — booked rates, cancellations, value per 'YYYY-MM' bucket across 2024-01 to 2025-02 — and the trap is the bucket key: the raw timestamp gives one row per booking. You will be asked for an above-market read — which bookings clear the network's average rate of **338.19** — and the trap is benchmarking on a different grain or folding after a WHERE that already shrank the base. Premium-band filters come back **empty** by construction (the top offering prices at 199.99), and every anti-join on searchers or offerings legitimately returns zero rows — everything here has transacted.",
    "Prep the way the screens run: conditional folds until a funnel census is one query; `strftime('%Y-%m', …)` bucketing until pace sorts itself; scalar and derived subqueries until above-market and market-average reads are one statement; window ranks for the rate boards; julianday for the **2.98-day** average book-to-stay lead. Then rehearse the two sentences the interviewer grades: *a click-out is a booking only when it converts — and a rate's share is its fold over every booked rate, cancelled ones included*.",
  ],

  dayInLife: [
    "**07:45 —** Conversion board first: the overnight funnel — 103 booked rates, 52 {emerald:completed} stays, 30 in-stay, 14 {amber:pending}, 7 {rose:cancelled} — with the pace roll beside it: 8 books in 2024-01 worth 3731.97 down to the 1193.86 trough in July. *A share without its denominator doesn't survive the 09:00 review, so the base prints on every slide.*",
    "**11:15 —** Deep work: the advertiser cut. Above-market reads — 42 booked rates clear the 338.19 network average, averaging 578.80, led by the EU market at 18 books @ 605.50 — folded against the settlement stack: card 16 / 37364 against wire 11 / 32248 in cents, and the {rose:void}-but-paid book at 925 flagged for the tie-out.",
    "**14:45 —** Advertiser review: the placement board with ranks and ties called out, the book-to-stay lead at **2.98** days (the re-marketing window), and the exposure sweep — 6 advertiser books, 15217 cents, no settlement received; one refundable sitting 4000-paid of a 6148 bill. Marketing wants the 6.8% cancellation haircut on every forecast.",
    "**17:45 —** EOD writeup: the funnel note ships with definitions attached — booked rate as a converted click-out, pace as 'YYYY-MM' folds, above-market as a same-grain scalar benchmark — and the data-quality queue takes the duplicate offer rows from one advertiser feed for a `ROW_NUMBER` dedupe. The note goes out; the denominators ride along.",
  ],

  metrics: [
    { name: "Click-out conversion", what: "Booked rates over compared offers — the funnel's core ratio, printed with the denominator. On the db: 103 booked rates, of which 82 have a stay started or complete." },
    { name: "Booked-rate completion share", what: "Rates with a stay underway or complete over all booked rates — 82 of 103, 79.6%. The state-free read that keeps pending and cancelled in the base." },
    { name: "Above-market rate share", what: "Booked rates clearing the network average (338.19) over all booked rates — 42 bookings averaging 578.80. The premium read advertisers price placement against." },
    { name: "Advertiser concentration", what: "Share of placement value from the top advertisers — the Nordic-like leader carries 32% of supply-side value. Bidding power follows the same whale curve as demand." },
    { name: "Cancellation / no-show share", what: "Cancelled booked rates over all booked rates — 6.8% network, 8.1% in the APAC-like market. Every conversion forecast carries this haircut before payout." },
    { name: "Rate-pace by month", what: "Booked rates and value per 'YYYY-MM' bucket — 8 books worth 3731.97 in the peak month, 8 worth 1193.86 in the trough. Seasonality the advertiser calendar is built on." },
    { name: "Searcher concentration", what: "Share of booking value from searchers above a lifetime threshold — 63.5% at the 3000 line. Meta-search demand is whaley, and yield knows their markets." },
    { name: "Average booked rate", what: "Mean booking total — 338.19 network, 383.48 in the richest market, 313.66 in the busiest. The benchmark every above-market read is measured against." },
  ],

  topics: [
    {
      name: "Rate-comparison folds",
      why: "Meta-search lives on comparing prices for the same offering across advertisers: average selling price per unit, price-as-of-date, per-store price columns unpivoted side by side. These folds are the literal rate board.",
      slugs: ["average-selling-price", "product-price-at-a-given-date", "products-price-for-each-store"],
    },
    {
      name: "Click-out funnel conversion",
      why: "The funnel is searched, compared, clicked out, booked — and every stage share needs its stage denominator. Funnel pivots and per-stage conversion drills are the exact shapes the conversion team ships weekly.",
      slugs: ["funnel-step-conversion", "ads-funnel", "email-engagement-funnel"],
    },
    {
      name: "Advertiser bid performance",
      why: "Advertisers pay for placement, so click quality per advertiser is a ratio: clicks, conversions, cost. Ads-performance and ROAS-style folds are the daily drill, with the denominator stated per advertiser.",
      slugs: ["ads-performance", "roas-by-campaign", "queries-quality-and-percentage"],
    },
    {
      name: "Search-to-book ratios",
      why: "Conversion is ratio culture: distinct searchers over bases, acceptance-style rates, A/B lift between layouts. Each drill is a real-division fold — the 100.0 before the slash, always.",
      slugs: ["percentage-of-users-attended-a-contest", "friend-requests-i-overall-acceptance-rate", "ab-test-conversion-lift"],
    },
    {
      name: "Zero-click anti-joins",
      why: "A searcher who compared but never booked, an advertiser with impressions and no conversions — the anti-join is the leak detector. On this db everything transacted, so the drill includes shipping zero as the true answer.",
      slugs: ["customer-who-visited-but-did-not-transact", "ad-free-sessions", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Duplicate-offer dedupe",
      why: "Advertiser feeds re-send the same rate with new timestamps; the board must price on the latest row only. ROW_NUMBER keep-latest folds and latest-per-key drills are the exact hygiene this marketplace runs nightly.",
      slugs: ["keep-latest-dedupe", "find-latest-salaries", "the-most-recent-orders-for-each-product"],
    },
    {
      name: "Rate-trend windows",
      why: "Rate gaps between searches, rolling pace, year-over-year deltas — window reads over dated events. Biggest-window and moving-average drills train the trend lens the pricing team reviews weekly.",
      slugs: ["biggest-window-between-events", "restaurant-growth", "year-on-year-growth-rate"],
    },
    {
      name: "Median & percentile rates",
      why: "Mean booked rate (338.19) hides skew; the median and percentile cuts are the honest market reads. Median-emulation and PERCENTILE-style drills matter because SQLite ships no MEDIAN.",
      slugs: ["median-time-to-convert", "station-median", "find-the-median"],
    },
    {
      name: "Market-benchmark subqueries",
      why: "Above-market reads benchmark each market against the network average — a scalar subquery over the same grain, or a group-vs-global fold. These are the exact shapes behind the 42-of-103 premium read.",
      slugs: ["market-analysis-i", "find-expensive-cities", "game-play-analysis-iv"],
    },
    {
      name: "Calendar rate buckets",
      why: "Pace is read in 'YYYY-MM' buckets with weekday skews and reformatted labels for the deck. strftime bucketing, weekend filters and date-format drills are the pace-pack staples.",
      slugs: ["monthly-transactions-i", "tasks-count-in-the-weekend", "convert-date-format"],
    },
  ],

  theory: [
    {
      id: "trivago-t1",
      q: "Your conversion query joins booked rates to their rate lines and the booked-rate count explodes. What happened and what's the fix?",
      a: "The join fanned out: 103 booked rates carry 251 rate lines, so joining to lines multiplies rows and COUNT(*) counts line items, not conversions. The fix is grain honesty — either fold lines to booking level in a CTE and join up, or fold with COUNT(DISTINCT oi.order_id) and keep the fan-out. I say the three counts out loud on any funnel read: rate lines (251), booked rates (103), searchers (16 on this db) — and the one the slide claims must match the fold actually written. A conversion rate computed on the wrong grain isn't approximately right; it's a different funnel wearing the same label, and an advertiser would be billed against it.",
      tag: "joins",
    },
    {
      id: "trivago-t2",
      q: "The placement board ranks advertisers by booked rates and two advertisers tie. How do you make the tie a decision instead of an accident?",
      a: "Pick the window function by its tie policy and say it out loud: ROW_NUMBER breaks ties arbitrarily — the board looks precise and is actually ordered by rowid. RANK gives tied advertisers the same rung and skips consumed slots (2, 2, then 4), which is honest about how many advertisers sit above. DENSE_RANK numbers rungs consecutively and hides the tie's depth. On an advertiser board I ship RANK with a deterministic tiebreaker (advertiser id), and when the tie itself is the story — two advertisers at the same conversion — I surface the tie as a column, because billing disputes start with someone claiming a rank the SQL never promised.",
      tag: "windows",
    },
    {
      id: "trivago-t3",
      q: "Write the funnel census in one query: booked, stay underway or complete, cancelled, share. Where do candidates go wrong?",
      a: "One pass with conditional folds: COUNT(*) AS booked, COUNT(*) FILTER (WHERE shipped_at IS NOT NULL) AS stayed, COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled, and ROUND(100.0 * stayed / COUNT(*), 1) — 103, 82, 7, 79.6 on this db. The classic failure is filtering the denominator: dropping cancelled 'to keep it clean' shrinks the base to 96 and prints a completion share the funnel never earned. The second is integer division — 100 * 82/103 truncates because the 100.0 entered after the slash. Every booked rate sits in exactly one bucket and all of them stay in the denominator; the census prints the base beside the share so the advertiser review never has to ask.",
      tag: "aggregation",
    },
    {
      id: "trivago-t4",
      q: "shipped_at is NULL on 21 booked rates. What does that NULL mean for a meta-search funnel, and how should queries treat it?",
      a: "On this mapping the NULL is a funnel state: the stay hasn't completed — 14 booked rates pending in the booking window and 7 cancelled, 21 total. Treating it as dirty data is the cardinal error: backfilling it fabricates completions, and excluding those rows from a conversion read shrinks the denominator and flatters every share an advertiser is billed against. The honest tools are state-based: COUNT(shipped_at) rides the NULL-blindness for the stayed numerator, shipped_at IS NULL splits the not-stayed arm into pending versus cancelled by joining on status, and julianday lead math over NULL rows NULLs them — correct, because a rate that never became a stay has no stay lead. NULL here is funnel information; the queries should read it, not repair it.",
      tag: "nulls",
    },
    {
      id: "trivago-t5",
      q: "Where do WHERE and HAVING each belong in a per-advertiser conversion query, and why does mixing them up matter?",
      a: "WHERE filters rows before the fold: market slices, date windows, 'booked rates created this month'. HAVING filters groups after the fold: advertisers with at least 10 booked rates, markets whose conversion clears a floor. The pipeline order is FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY, and the two are not interchangeable — WHERE COUNT(*) fails because the fold doesn't exist yet, and pushing a row filter into HAVING folds data you then throw away. On a placement board the difference is money: gate thin advertisers in HAVING so a two-booking advertiser can't top a conversion board on sample size, and keep the market slice in WHERE so the fold only ever saw the rows that mattered.",
      tag: "pipeline",
    },
    {
      id: "trivago-t6",
      q: "Revenue wants booked rates above the network's average rate, per market. Scalar subquery, window, or CTE — and what's the trap?",
      a: "A scalar subquery is the compact read: WHERE total > (SELECT AVG(total) FROM orders) — 42 of 103 booked rates clear the 338.19 average, averaging 578.80. The trap is grain: the benchmark must fold over ALL booked rates, unfiltered, or the denominator shifts and 'above market' quietly redefines itself. A windowed AVG(SUM(total)) OVER () earns its place when every market must stay in the result with its premium visible; a CTE earns it when 'rate' needs a definition — fees netted, multi-line bookings folded first. Whatever the shape, benchmark and population fold on the same grain, or the comparison is averages against lines.",
      tag: "subqueries",
    },
    {
      id: "trivago-t7",
      q: "Two date reads every week: rate pace by month and book-to-stay lead by market. What machinery does each need?",
      a: "Pace is bucketing: strftime('%Y-%m', created_at) makes the '2024-01' key that GROUP BY folds and sorts correctly — the 14-bucket trend from 2024-01 (8 books, 3731.97) through the 1193.86 trough to 2025-02. Lead time is instant math: julianday(shipped_at) - julianday(created_at) on the 82 stayed bookings, averaged to 2.98 days with the 2-to-4 range quoted, because the re-marketing window is sized in days. The traps I name out loud: bucketing the raw timestamp gives one row per booking; julianday over NULL stays NULLs those rows, which is the definition and not a bug; and the round happens once at the edge so the deck, the query and the audit print one number.",
      tag: "dates",
    },
    {
      id: "trivago-t8",
      q: "One advertiser feed re-sends the same rate with newer timestamps, and finance found a void invoice carrying a payment. How do you keep both from poisoning the funnel?",
      a: "Dedupe on a natural key, reconcile states against evidence. For the feed: ROW_NUMBER() OVER (PARTITION BY property, rate plan, room type ORDER BY sent_at DESC, id DESC) and keep rn = 1 — with the tiebreak stated, because 'latest rate' needs a deterministic definition when timestamps tie and the board prices on it. For finance: conditional counts that cross-examine status against payment rows surface the void-but-paid invoice (925 on this db) and the paid-with-no-payments case (1756) before the tie-out, with integer cents over 100.0 throughout. The habit being graded: row counts are claims, keys and evidence are truth — and a conversion rate shipped from a deduped, reconciled base is the only one an advertiser contract can be settled on.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "trivago-mcq-1",
      prompt: "One-pass funnel census. Which fragment counts booked rates whose stay completed or is underway — 82 of 103?",
      choices: [
        "COUNT(*) FILTER (WHERE status = 'delivered')",
        "COUNT(*) FILTER (WHERE o.shipped_at IS NOT NULL)",
        "COUNT(o.status)",
        "SUM(shipped_at)",
      ],
      answer: 1,
      why: "shipped_at is the stay-completed timestamp — NULL until the stay starts or completes. The FILTER keeps the census in one pass: 82, while COUNT(*) stays 103 in the same SELECT.",
      notes: [
        { choice: 0, why: "'Delivered' counts one raw state (52) — the completed bucket — but stayed-completed-or-underway is 52 plus the in-stay 30. Pick the state-free definition: shipped_at IS NOT NULL." },
        { choice: 3, why: "SUM over a timestamp column adds date numbers — a meaningless figure. Conditional counting needs a boolean predicate inside FILTER or CASE, not arithmetic on dates." },
      ],
      difficulty: "easy",
    },
    {
      id: "trivago-mcq-2",
      prompt: "Rate pace by month for the advertiser pack. The bucket key is:",
      choices: [
        "created_at (raw timestamp)",
        "strftime('%Y', created_at)",
        "strftime('%Y-%m', created_at)",
        "DATE(created_at, 'start of month') as text in the deck",
      ],
      answer: 2,
      why: "strftime('%Y-%m', created_at) builds the '2024-01' key — 14 buckets from 2024-01 (8 books, 3731.97) to 2025-02 — that sorts correctly as text and folds the whole window.",
      notes: [
        { choice: 0, why: "The raw timestamp gives one group per booked rate — 103 rows of one. Pace needs a derived bucket key, not the raw instant." },
        { choice: 1, why: "%Y collapses the window to two rows: 2024 and 2025. The seasonality story — peak versus trough months — needs the month in the key." },
      ],
      difficulty: "easy",
    },
    {
      id: "trivago-mcq-3",
      prompt: "Which expression prints the completion share as 79.6 rather than 0?",
      choices: [
        "100 * 82 / 103",
        "100.0 * COUNT(shipped_at) / COUNT(*)",
        "CAST(82 / 103 AS REAL) * 100",
        "82.0 / 103.0 (multiply in the deck)",
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
      id: "trivago-mcq-4",
      prompt: "Above-market read: bookings clearing the network's average rate. The benchmark fragment is:",
      choices: [
        "WHERE total > (SELECT AVG(total) FROM orders)",
        "WHERE total > AVG(total)",
        "WHERE total > (SELECT MAX(total) FROM orders)",
        "HAVING total > AVG(total) OVER ()",
      ],
      answer: 0,
      why: "The scalar subquery folds the benchmark over ALL bookings, unfiltered — the 338.19 network average — then the outer WHERE compares each booking to it. 42 of 103 clear the bar, averaging 578.80.",
      notes: [
        { choice: 1, why: "AVG(total) is an aggregate — it can't appear in a row-level WHERE without a GROUP BY to fold over, and the query errors before it compares anything." },
        { choice: 2, why: "MAX is the single priciest booking (1088.44) — nothing exceeds it, so the 'above-market' list returns zero rows and the read is empty by construction." },
      ],
      difficulty: "medium",
    },
    {
      id: "trivago-mcq-5",
      prompt: "Placement board: keep only advertisers with at least 10 booked rates. The gate goes in:",
      choices: [
        "WHERE COUNT(*) >= 10",
        "HAVING COUNT(*) >= 10",
        "LIMIT 10",
        "ORDER BY COUNT(*) DESC",
      ],
      answer: 1,
      why: "The booked-rate count is a fold — it exists only after GROUP BY — so the gate is HAVING. WHERE runs before grouping and can't see a count; LIMIT truncates rows, it doesn't define thresholds.",
      notes: [
        { choice: 0, why: "WHERE COUNT(...) is the classic error — the aggregate doesn't exist at row-filter time. Every gate on a fold lives in HAVING." },
        { choice: 3, why: "Sorting by the fold is ordering, not gating — thin advertisers still appear, they just appear at the bottom. The ask was to EXCLUDE them." },
      ],
      difficulty: "medium",
    },
    {
      id: "trivago-mcq-6",
      prompt: "The rate board ranks advertisers by bookings. Two tie in third (two sit above). What does RANK() print for the pair and the next advertiser?",
      choices: [
        "3, 4 then 5 — no shared rungs",
        "3, 3 then 4 — consecutive rungs, no skip",
        "3, 3 then 5 — ties share, next skips by tie size",
        "5, 5 then 6 — ties take the last slot",
      ],
      answer: 2,
      why: "RANK ties share the rung and the next advertiser's rank jumps past the whole tie block: 3, 3, then 3 + 2 = 5. ROW_NUMBER would print 3, 4 arbitrarily; DENSE_RANK would print 3, 3, then 4 with no skip.",
      notes: [
        { choice: 0, why: "That's ROW_NUMBER — arbitrary distinct ranks inside the tie. The board would show one advertiser 'ahead' for no reason at all." },
        { choice: 1, why: "That's DENSE_RANK — consecutive rungs that hide how deep the tie was. Defensible convention; not what RANK does." },
      ],
      difficulty: "medium",
    },
    {
      id: "trivago-mcq-7",
      prompt: "Value per booked rate by offering: rate-line value divided by bookings carrying it. The denominator is:",
      choices: [
        "COUNT(*) after joining order_items to products",
        "COUNT(DISTINCT oi.order_id)",
        "SUM(oi.quantity)",
        "COUNT(DISTINCT p.id)",
      ],
      answer: 1,
      why: "A booked rate is a booking, and the join fans each booking to one row per rate line — 103 bookings become 251 rows. COUNT(DISTINCT oi.order_id) folds back to distinct bookings: 46 for the busiest offering family.",
      notes: [
        { choice: 0, why: "COUNT(*) counts RATE LINES — 251 across the network — and calls them bookings. Per-booked-rate value drops about 2.4x and the advertiser story quietly inverts." },
        { choice: 2, why: "SUM(quantity) is a unit census (121 in the busiest family) — units over bookings is units-per-booking, a different metric than value-per-booking." },
      ],
      difficulty: "medium",
    },
    {
      id: "trivago-mcq-8",
      prompt: "The leak audit asks for searchers who compared but NEVER booked. On this db the anti-join returns:",
      choices: [
        "One searcher — the smallest account",
        "Zero rows — every searcher transacted (never-ordered = 0)",
        "All sixteen — the join is wrong",
        "A SQL error — anti-joins need NOT EXISTS",
      ],
      answer: 1,
      why: "Every customer on this db has ordered (never-ordered customers = 0), so the anti-join is legitimately empty. Knowing when zero is the TRUE answer is part of the discipline — the leak is upstream of the booking table.",
      notes: [
        { choice: 0, why: "The smallest account still booked. A one-row result here means the join or the period filter changed the population, not that someone bounced." },
        { choice: 3, why: "LEFT JOIN + IS NULL, NOT EXISTS and EXCEPT all express the anti-join — the query runs fine. The interesting result is the empty set itself." },
      ],
      difficulty: "hard",
    },
    {
      id: "trivago-mcq-9",
      prompt: "An advertiser feed sends the same rate plan three times with newer timestamps. The board must price on the latest. The fold is:",
      choices: [
        "GROUP BY rate plan with MAX(timestamp) in the SELECT",
        "ROW_NUMBER() OVER (PARTITION BY rate plan ORDER BY sent_at DESC) = 1",
        "DISTINCT on the rate plan column",
        "ORDER BY sent_at DESC LIMIT 1",
      ],
      answer: 1,
      why: "Keep-latest is a per-key window fold: partition by the offer key, order by sent_at DESC, keep rn = 1 — one deterministic latest row per rate plan, and every column rides along correctly.",
      notes: [
        { choice: 0, why: "MAX(timestamp) pairs the newest time with OTHER columns picked arbitrarily by SQLite's bare-column rule — a franken-row: newest timestamp, older price." },
        { choice: 3, why: "A global LIMIT 1 keeps one latest row across ALL advertisers — every other rate plan vanishes from the board entirely." },
      ],
      difficulty: "hard",
    },
    {
      id: "trivago-mcq-10",
      prompt: "Advertiser billing: one settlement book shows 6148 billed, 4000 received. The deck's dollar figures are:",
      choices: [
        "$6148.00 and $4000.00 — invoices store dollars",
        "$61.48 and $40.00 — invoice money is INTEGER cents, divide by 100.0",
        "$614.80 and $400.00 — divide by 10",
        "$0.61 and $0.40 — divide by 10000",
      ],
      answer: 1,
      why: "Invoices and payments are INTEGER cents on this db: 6148 cents is 61.48 dollars, 4000 is 40.00 — the partial-payment read (4000 of 6148) after 6148 / 100.0 and 4000 / 100.0.",
      notes: [
        { choice: 0, why: "That's the classic hundred-fold overstatement — printing cents as dollars. Every advertiser settlement slide needs the /100.0 before it ships." },
        { choice: 2, why: "Dividing by 10 has no basis in the schema — the unit is cents, so the divisor is 100.0, and the ROUND happens once at the edge." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-trv-1",
      tier: "easy",
      topic: "t4",
      universe: "funnel",
      title: "The rate-pace calendar",
      brief:
        "Trivago-flavored brief on the storefront db (orders = booked rates, shipped_at = stay completed): the advertiser review opens with the pace calendar — booked rates, cancellations and booking value per 'YYYY-MM' bucket, oldest first, because the advertiser calendar is built on seasonality. Probed facts: 103 booked rates worth 34833.28 across 14 month buckets from 2024-01 to 2025-02; the peak opens the window at 8 books worth 3731.97 with 1 cancelled, the trough sits in 2024-07 at 8 books worth just 1193.86 with 2 cancelled, and 2024-11 also books 6 with 2 cancelled. The calendar must bucket on a derived key — the raw timestamp would print one row per booking — and the cancelled column is a conditional count, not a filter that shrinks the base.",
      ask: "Return per month bucket: booked rates, cancelled rates, booking value (2dp) — oldest month first.",
      template:
        "SELECT strftime('{1}', o.created_at) AS month,\n       {2}(*) AS books,\n       COUNT(*) FILTER (WHERE o.status = '{3}') AS cxl,\n       ROUND(SUM(o.total), {4}) AS gmv\nFROM orders o\nGROUP BY month\nORDER BY month;",
      slots: [
        {
          answer: "%Y-%m",
          kind: "keyword",
          label: "the bucket format",
          why: "strftime('%Y-%m', …) builds the '2024-01' year-month key — 14 sortable buckets. '%Y' collapses to two rows and '%m' folds Jan-2024 onto Jan-2025, destroying the seasonality read.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the book fold",
          why: "COUNT(*) counts booked rates per bucket — 8, 9, 8 … the pace column. SUM(*) isn't valid SQL over rows, and the census needs a count, not a fold of totals.",
        },
        {
          answer: "cancelled",
          kind: "keyword",
          label: "the leakage state",
          why: "status = 'cancelled' is the 7 booked rates that never materialized, bucketed in place — 1 in the peak month, 2 in the trough. 'pending' would print the 14 in-window bookings under the cancelled label.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          noVerify: true,
          why: "Booking value prints to 2dp — 3731.97, 1193.86 — the shape every money cell in the pack carries. ROUND to 0 publishes 3732, a number no other slide shows.",
        },
      ],
      distractors: ["%Y", "%m", "SUM", "pending"],
      walkthrough:
        "A pace read where the bucket key is the whole game. strftime('%Y-%m', created_at) derives a sortable '2024-01' key from the raw instant; GROUP BY month folds 103 booked rates into 14 buckets that sort oldest-first without a CAST. Three columns read three truths off the same rows: COUNT(*) is the pace column (8, 9, 8 …), the FILTER arm is the cancelled census (1 in the peak, 2 in the trough — all 7 accounted for without shrinking the base), and ROUND(SUM(total), 2) is value (3731.97 down to 1193.86). The distractors each wreck a column: '%Y' collapses 14 buckets to 2 calendar years, '%m' stacks Jan-2024 onto Jan-2025, SUM can't fold rows at all, and 'pending' relabels the 14 in-window bookings as cancellations. Derive the key, keep every bucket in the denominator, round once at the edge.",
    },
    {
      id: "cs-trv-2",
      tier: "medium",
      topic: "q2",
      universe: "pricing",
      title: "Above-market rate books",
      brief:
        "Trivago-flavored brief on the storefront db (orders = booked rates, customers = searcher markets): the revenue memo wants the premium read — which booked rates clear the network's own average rate, per searcher market, richest above-average market first. Probed facts: the network average booked rate is 338.19; 42 of 103 booked rates clear it and average 578.80. By market: EU 18 books averaging 605.50, APAC 13 averaging 521.85, US 10 averaging 587.36, LATAM 1 averaging 752.96. The benchmark must fold over ALL booked rates — unfiltered, same grain — or 'above market' quietly redefines itself; the memo says so in writing because the last analyst benchmarked against a filtered base and overstated the premium.",
      ask: "Return per searcher market: above-average booked rates and their average value (2dp) — most above-average books first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS above_avg,\n       ROUND(AVG(o.total), {4}) AS avg_above\nFROM orders o\nJOIN customers c ON c.id = o.{2}\nWHERE o.total > (SELECT {1}(total) FROM orders)\nGROUP BY c.region\nORDER BY above_avg {3};",
      slots: [
        {
          answer: "AVG",
          kind: "keyword",
          label: "the benchmark fold",
          why: "AVG(total) over ALL bookings is the 338.19 network average. MAX makes the bar 1088.44 — nothing clears it; SUM makes it 34833.28 and MIN drops it to 25.47 so 102 of 103 'clear' it.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the market key",
          why: "Searcher markets join through the customer key: c.id = o.customer_id. Joining on order_id would bolt markets onto booking ids — the market counts collapse to noise (9 stray rows).",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the richest-first order",
          why: "The memo reads the premium end first: 18, 13, 10, 1 above-average books by market. ASC would lead with LATAM's single booking and frame the meeting backwards.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          noVerify: true,
          why: "Above-average value prints to 2dp — 605.50, 521.85, 587.36, 752.96 — the shape every money cell in the pack carries. ROUND to 1 publishes 605.5 and 521.9, numbers the deck never shows.",
        },
      ],
      distractors: ["MAX", "SUM", "MIN", "order_id", "ASC", "1"],
      walkthrough:
        "A benchmark read where the subquery's grain is the whole game. The scalar subquery folds AVG(total) over ALL 103 bookings — 338.19, unfiltered — and the outer WHERE keeps only the 42 bookings that clear it; same-grain benchmark, no base shift. The join lands each premium booking in its searcher market through the customer key, GROUP BY c.region folds them to 18 / 13 / 10 / 1, and AVG(o.total) reads the premium level per market: 605.50, 521.85, 587.36, 752.96 — ordered richest-volume first. The distractors each move a number: MAX prices the bar at the single priciest booking so the list empties, SUM prices it above the whole network's value for the same effect, MIN invites 102 of 103 bookings in, the wrong join key re-parents markets, ASC reads the board from its smallest market, and ROUND to 1 publishes cells no other slide carries. Benchmark on the same grain you compare on — or the premium is an artifact.",
    },
  ],

  problems: [
    { slug: "average-selling-price", why: "Units-weighted average price per period — the realized-rate read advertisers bill against, folded at offering grain." },
    { slug: "product-price-at-a-given-date", why: "The rate in force at a moment, with fallback to the last known — the as-of price behind every rate board and Express-style read." },
    { slug: "products-price-for-each-store", why: "Same offering, one column per advertiser — the side-by-side rate comparison that is literally Trivago's product." },
    { slug: "funnel-step-conversion", why: "Stage-to-stage conversion shares — the search-to-book funnel with each step's denominator stated, the weekly conversion board in graded form." },
    { slug: "ads-funnel", why: "Impression-to-action funnels per entity — the advertiser click-out funnel: placement cost follows these ratios." },
    { slug: "email-engagement-funnel", why: "Send-to-action conversion per campaign — the re-marketing read inside the 2.98-day booking window." },
    { slug: "ads-performance", why: "Per-advertiser quality ratios with a quality gate — the bid-performance screen: clicks that convert vs clicks that bounce." },
    { slug: "roas-by-campaign", why: "Return on ad spend per campaign — placement yield folded from spend and booked-rate value, one ratio per advertiser." },
    { slug: "queries-quality-and-percentage", why: "Per-entity ratio with the denominator printed — the completion-share shape: 82 of 103 with the base beside it." },
    { slug: "percentage-of-users-attended-a-contest", why: "Distinct-participation shares — the conversion-share pattern in another costume: DISTINCT searchers over stated bases." },
    { slug: "friend-requests-i-overall-acceptance-rate", why: "Overall acceptance rate from two-sided events — the search-to-book rate read: numerator, denominator, real division." },
    { slug: "ab-test-conversion-lift", why: "Lift between test arms — the layout experiment read: conversion per arm, lift computed, sample sizes printed." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Searchers who compared but never booked — the zero-click leak, anti-join shaped; on this db it returns zero and that is the lesson." },
    { slug: "ad-free-sessions", why: "Sessions with no ad exposure — the blind-spot audit: impressions that never reached the searcher, NOT EXISTS shaped." },
    { slug: "number-of-accounts-that-did-not-stream", why: "Accounts with no activity in a window — the dormant-advertiser sweep: placement bought, no booked rates." },
    { slug: "keep-latest-dedupe", why: "Keep-latest per key — the advertiser-feed dedupe: same rate sent twice, board prices on the newest row only." },
  ],
};
