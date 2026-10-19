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
    "Money talks in {violet:advertiser economics}: Trivago books on a pay-per-click referral model — the advertiser funds placement, so the supply side reads like a portfolio. The db's six advertisers mirror that book: Nordic Gadgets AB carries **32%** of placement value (11130.25 on 38 distinct bookings), Midwest Hardware Co **26.7%** (9294.93 on 45), and the top two out-bid the other four combined. *The CFO's ledger closes clean*: debits and credits tie at **181080** on both sides, cash nets 44196, accounts receivable 16440. Settlement runs on flat 30-day terms — paid books settle in **28.4** days on average, fastest 13, slowest 84 — with one 6148 book sitting 4000-paid and one 925 book void-but-paid.",
    "Prep ladder for the screens, bottom up. Step one, the folds: one-pass censuses with `COUNT(*) FILTER (WHERE …)` until 52 {emerald:completed} and 7 {rose:cancelled} print from a single scan. Step two, the buckets: `strftime('%Y-%m', …)` pace reads with the 6.8% cancellation haircut attached. Step three, the windows: RANK boards, LAG pace deltas, share-over-partition splits. Step four, the subqueries: scalar benchmarks against the 338.19 network average and derived-table re-aggregations — *the average of averages is the classic silent error*. Step five, set ops and anti-joins; then harden the two reflexes Trivago grades: **print the denominator beside every share**, and reconcile every settlement figure to integer cents.",
  ],

  dayInLife: [
    "**07:45 —** Conversion board first: the overnight funnel — 103 booked rates, 52 {emerald:completed} stays, 30 in-stay, 14 {amber:pending}, 7 {rose:cancelled} — with the pace roll beside it: 8 books in 2024-01 worth 3731.97 down to the 1193.86 trough in July. *A share without its denominator doesn't survive the 09:00 review, so the base prints on every slide.*",
    "**11:15 —** Deep work: the advertiser cut. Above-market reads — 42 booked rates clear the 338.19 network average, averaging 578.80, led by the EU market at 18 books @ 605.50 — folded against the settlement stack: card 16 / 37364 against wire 11 / 32248 in cents, and the {rose:void}-but-paid book at 925 flagged for the tie-out.",
    "**14:45 —** Advertiser review: the placement board with ranks and ties called out, the book-to-stay lead at **2.98** days (the re-marketing window), and the exposure sweep — 6 advertiser books, 15217 cents, no settlement received; one refundable sitting 4000-paid of a 6148 bill. Marketing wants the 6.8% cancellation haircut on every forecast.",
    "**17:45 —** EOD writeup: the funnel note ships with definitions attached — booked rate as a converted click-out, pace as 'YYYY-MM' folds, above-market as a same-grain scalar benchmark — and the data-quality queue takes the duplicate offer rows from one advertiser feed for a `ROW_NUMBER` dedupe. The note goes out; the denominators ride along.",
    "**20:30 —** Late feed check before the lights go out: the reconciliation queue — the {rose:void}-but-paid 925 book, the 1756 invoice with no payment rows, and the five split-settlement books — goes back to advertiser ops with a `LEFT JOIN` + `IS NULL` probe attached. *No settlement story ships unverified twice.* Tomorrow's pace note is staged: 8 books worth 3731.97 in January against the 1193.86 July trough, LAG deltas ready for the growth board.",
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
    { name: "Advertiser settlement coverage", what: "Invoices settled vs billed — 21 of 28 books settled exact, 1 partial at 4000 of 6148, 6 worth 15217 cents carrying no settlement rows. The coverage share advertisers negotiate against." },
    { name: "Book-to-stay lead", what: "Days from booking to stay completion — 2.98-day average across 82 timestamped stays, 2 fastest, 4 slowest. The re-marketing window between click-out and arrival." },
    { name: "Settlement cycle", what: "Days from invoice issue to first payment on settled books — 28.4 average across 20, 13 fastest, 84 slowest, on flat 30-day terms. Working-capital planning reads this weekly." },
    { name: "Advertiser revenue share", what: "Placement value per advertiser over network value — the Nordic-like leader at 32%, the runner at 26.7% on 45 books. Concentration the placement-pricing team prices against." },
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
      slugs: ["funnel-step-conversion", "ads-funnel", "email-engagement-funnel", "user-activity-for-the-past-30-days-ii"],
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
      slugs: ["customer-who-visited-but-did-not-transact", "ad-free-sessions", "number-of-accounts-that-did-not-stream", "product-sales-analysis-ii", "product-sales-analysis-iii", "daily-leads-and-partners"],
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
      slugs: ["median-time-to-convert", "station-median", "find-the-median", "maximum-transaction-each-day", "the-most-recent-three-orders", "second-highest-salary", "the-latest-login-in-2020", "top-earners"],
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
    {
      name: "Settlement ledgers in cents",
      why: "Advertiser billing moves in integer cents across 28 invoices and 27 payments; mis-scaled money is the silent kill every Trivago-style screen stages. Month buckets with state splits, per-account summaries and threshold concentration reads are the same reads the billing pack runs daily.",
      slugs: ["monthly-transactions-ii", "bank-account-summary-ii", "number-of-rich-customers"],
    },
    {
      name: "CASE-branch rate classification",
      why: "Rate boards classify states and bands in one pass: completed vs in-stay vs pending vs cancelled, value above and below the 338.19 benchmark. CASE WHEN branches and band counts are how the census stays a single scan instead of four drifting queries.",
      slugs: ["weather-type-in-each-country", "count-salary-categories", "the-winner-university"],
    },
    {
      name: "Consecutive-demand patterns",
      why: "Repeat demand reads as sequences: consecutive stay dates, two bookings inside a seven-day window, continuous booking ranges. Gaps-and-islands thinking separates a re-booker from a one-off — the loyalty-eligibility pattern Trivago's marketplace questions probe.",
      slugs: ["consecutive-available-seats", "users-with-two-purchases-within-seven-days", "find-the-start-and-end-number-of-continuous-ranges"],
    },
    {
      name: "Dark-advertiser anti-joins",
      why: "Advertisers with listings but no bookings, offerings that never convert, searchers who churned — the dark side of the marketplace. Every anti-join shape (LEFT JOIN + IS NULL, NOT EXISTS, EXCEPT) is in the loop, and here the honest answer is often an empty set.",
      slugs: ["sellers-with-no-sales", "unpopular-books", "find-churn-risk-customers"],
    },
    {
      name: "Concentration & share windows",
      why: "Value concentrates hard: 63.5% of booking value above the 3000 lifetime line, the lead advertiser at 32% of placement value. Share-over-total window folds and HHI-style concentration reads are the board's favorite asks — rows kept, shares printed.",
      slugs: ["portfolio-weights", "portfolio-concentration-hhi", "top-travellers", "immediate-food-delivery-i", "immediate-food-delivery-ii", "list-the-products-ordered-in-a-period", "unique-orders-and-customers-per-month", "active-businesses", "sales-by-day-of-the-week", "find-total-time-spent-by-each-employee"],
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
    {
      id: "trivago-t9",
      q: "The advertiser ledger prints 6148 where the stakeholder expected $61.48. What happened, and what's the house rule for money?",
      a: "The column is INTEGER cents: 6148 cents is $61.48, and the hundred-fold overstatement comes from reading cents as dollars. House rule: money cells divide by 100.0 — never 10, never 10000 — and print through ROUND(..., 2). On this db the discipline is testable: the 6148 book is really 61.48, the 4000 partial payment is 40.00, and the 15217 of unsettled AR is $152.17. Say the unit out loud when you print the number — a rate board that flips between cents and dollars inside one deck loses the room.",
      tag: "money",
    },
    {
      id: "trivago-t10",
      q: "One scan, four states: booked, completed, in-stay and cancelled counts in a single query. Write the shape and defend it.",
      a: "Conditional folds in one pass: COUNT(*) AS booked, COUNT(*) FILTER (WHERE status = 'delivered') AS completed, COUNT(*) FILTER (WHERE status = 'shipped') AS in_stay, COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled. One table read, one definition block, and the folds can't drift apart the way four separate queries do. SUM(CASE WHEN … THEN 1 ELSE 0 END) is the portable twin — same numbers, more keystrokes. On the storefront mapping that prints 103 / 52 / 30 / 7 — the census every funnel share denominates from.",
      tag: "aggregation",
    },
    {
      id: "trivago-t11",
      q: "SUM(booked_value) OVER (ORDER BY month) as a running total — what frame does SQLite apply by default, and when does that surprise you?",
      a: "The default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — and RANGE includes peer rows, rows sharing the current ORDER BY value. With a unique month key the running total behaves like the ROWS frame you pictured: 3731.97, then 7341.61, and so on down the spine. The surprise arrives when the ORDER BY has ties — same-day bookings, equal scores — where the sum jumps by the whole peer group at once. If the board wants strict row-by-row accumulation, write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW and make the intent executable.",
      tag: "windows",
    },
    {
      id: "trivago-t12",
      q: "Growth wants month-over-month booked-value deltas on the 14-month pace table. Write it, and defend January's cell.",
      a: "Stage the pace in a derived table, then LAG: ROUND(LAG(booked_value, 1) OVER (ORDER BY month), 2) AS prior_value, and the delta is current minus prior. February reads 3609.64 against January's 3731.97 — a real slide the deck must name. January's prior is NULL because no row precedes it: that's the honest cell, not a zero — COALESCE to 0 only with a printed footnote, because a fake zero turns January into a +3731.97 recovery story. LAG asks backwards, LEAD asks forwards; swap them and every sign in the deck inverts.",
      tag: "windows",
    },
    {
      id: "trivago-t13",
      q: "A stakeholder wants the pace table plus one grand-total row. UNION or UNION ALL — and what else does the total row need?",
      a: "UNION ALL. Both branches agree on columns, so the stack appends cleanly: 14 pace rows plus the total. UNION would dedupe — harmless here only because the TOTAL row is distinct — but it also sorts and burns a hash for nothing; ALL states the intent. The total row needs a label: a literal 'TOTAL' in the bucket column, otherwise the deck shows an unlabeled row the reader can't attribute. This is exactly the grand-stack shape: detail rows, a folded grand row, one statement, no second query drifting on a different WHERE.",
      tag: "set-ops",
    },
    {
      id: "trivago-t14",
      q: "Above-market reads per market: correlated scalar subquery, or a join to a derived table of market averages. Which and why?",
      a: "For the network benchmark — WHERE total > (SELECT AVG(total) FROM orders) — the scalar subquery is the right tool: folded once, applied everywhere, 42 of 103 bookings clear the 338.19 line. The moment the benchmark goes per-market, a correlated subquery re-runs per row: fine at 103 rows, quadratic at scale. The derived table (SELECT customer_id, AVG(total) FROM orders GROUP BY customer_id) computes each benchmark once, then the join applies it. Same numbers, different growth curve — and the interview answer is naming which grain you're benchmarking against before you write either.",
      tag: "subqueries",
    },
    {
      id: "trivago-t15",
      q: "You have per-market AOV: EU 335.32, APAC 313.66, US 383.48, LATAM 426.22. Why is averaging those four wrong, and what's the right re-aggregation?",
      a: "Because an average of averages weights every market equally, and this network is nothing like equal: EU 45 bookings, APAC 37, US 19, LATAM 2. LATAM's 426.22 rides two bookings yet would pull the network average up like a whale market. The right figure re-aggregates over the derived table: SUM(total_value) / SUM(booked_count) — 34833.28 / 103 = 338.19. The SQL instinct is 'go back down a grain, then re-fold'; the interview instinct is to name the silent error out loud: the average of averages is not the average.",
      tag: "grain",
    },
    {
      id: "trivago-t16",
      q: "status = 'delivered' counts 52, but shipped_at IS NOT NULL counts 82. Reconcile the two folds before the deck ships.",
      a: "They measure different rungs. shipped_at is set the moment a stay is underway or complete: 52 delivered + 30 in-stay = 82 non-null timestamps. The 21 NULLs are the funnel's front — 14 pending in the booking window plus 7 cancelled — stays that never began. Neither fold is wrong; they answer different questions, and conflating them understates the funnel's live body by 30. Print both with their definitions attached: completion share over the full 103 base (79.6%), and the stay-started census (82) for the ops board.",
      tag: "nulls",
    },
    {
      id: "trivago-t17",
      q: "Q1-2024 pace: WHERE created_at BETWEEN '2024-01-01' AND '2024-03-31'. What does that actually return on timestamp columns, and what's the safe shape?",
      a: "It returns January 1st 00:00 through March 31st 00:00:00 — every booking stamped later on the 31st silently drops, and a monthly trend that leaks its final day is the bug nobody catches in review. The safe shape is half-open: created_at >= '2024-01-01' AND created_at < '2024-04-01'. Same instinct everywhere on this db: bucket with strftime('%Y-%m', created_at) for grouping, filter with half-open ranges in WHERE — never BETWEEN on a column that carries time, because the boundary midnight is where pace quietly undercounts.",
      tag: "dates",
    },
    {
      id: "trivago-t18",
      q: "ORDER BY placement_value DESC — when does the alias resolve, when do you need the expression, and why do ties deserve a tiebreaker?",
      a: "ORDER BY runs logically after SELECT, so aliases resolve: placement_value, the ROUND(SUM(...)) fold, even COUNT(*) AS booked all sort fine. WHERE can't see those aliases — it runs before the SELECT list — which is the classic confusion. Ties are the real trap: two advertisers on the same placement value sort in storage order, so the bid card isn't reproducible. Add a deterministic tiebreaker — rating DESC, name — and the board prints identically every run. Ordinals (ORDER BY 2) work but break on column churn; name the alias.",
      tag: "pipeline",
    },
    {
      id: "trivago-t19",
      q: "Pair every searcher with another searcher in the same market, once each. Write the join and defend the inequality.",
      a: "FROM customers a JOIN customers b ON a.region = b.region AND a.id < b.id. The inequality does two jobs: it removes self-pairs (a searcher paired with themselves) and it breaks the mirror — without it, (Alice, Bruno) and (Bruno, Alice) both appear and every pair count doubles. With 16 searchers across four markets the pair set stays small and auditable. The alias discipline matters too: a and b are the same table twice, so every column reference must be qualified or the planner picks for you — and 'the planner picks' is not a definition.",
      tag: "self-join",
    },
    {
      id: "trivago-t20",
      q: "Three anti-join shapes — LEFT JOIN + IS NULL, NOT EXISTS, EXCEPT. Which do you reach for on this db, and what does the empty result mean?",
      a: "All three are correct here; I reach for NOT EXISTS because it reads as intent — 'no booking row exists for this searcher' — and it's the shape that survives NULL keys in other datasets. LEFT JOIN + IS NULL is the visual classic; EXCEPT compares whole rows and dedupes, so it's the one to distrust when column sets differ. On this db the honest result is empty: all 16 searchers transacted (never-ordered = 0), so 'searchers who never booked' returns zero rows — and an empty set printed with its definition is a finding, not a bug.",
      tag: "anti-join",
    },
    {
      id: "trivago-t21",
      q: "The advertiser manifest folds each advertiser's offering names into one cell. What does GROUP_CONCAT guarantee, and what must you guarantee yourself?",
      a: "GROUP_CONCAT(p.name, ', ') guarantees one row per group and your separator — nothing about order. The names inside the cell come out in whatever order the scan visits rows, so a manifest that reads alphabetically today may shuffle tomorrow. If order matters, fold a pre-sorted derived table or sort in a subquery first; and remember duplicates survive — GROUP_CONCAT(DISTINCT p.name) dedupes at the cost of even weaker order behavior. Presentation-layer formatting is fine; nondeterministic data is not, and the manifest is a contract.",
      tag: "strings",
    },
    {
      id: "trivago-t22",
      q: "The pace query is instant at 103 rows. Why is WHERE strftime('%Y-%m', created_at) = '2024-07' still the wrong shape for WHERE at scale?",
      a: "Because it wraps the column in a function, the planner can't use an index on created_at — every row gets the function applied before the comparison. It's non-sargable, and the fix is the range form: created_at >= '2024-07-01' AND created_at < '2024-08-01', which seeks straight into July. Keep strftime for GROUP BY bucketing — that's where it shines — and keep WHERE predicates bare-column and half-open. At 103 rows the difference is invisible; at the scale a live rate funnel runs, it's the difference between a dashboard and an outage.",
      tag: "performance",
    },
    {
      id: "trivago-t23",
      q: "Marketing defines click-out conversion as booked over kept (non-cancelled) rates. What breaks, and how do you push back?",
      a: "The denominator loses its 7 cancelled books — 103 becomes 96 — and the 6.8% leakage the CFO reads every Monday gets laundered into a healthier conversion number. Two KPIs must stay separate: completion share over the full base (82 of 103, 79.6%) and cancellation share as its own printed haircut (6.8% network, 8.1% in the APAC-like market). The pushback is definitional, not moral: kept-base conversion isn't comparable to any prior deck, and every trend line breaks the day it ships. One definition per metric, denominators printed beside every share.",
      tag: "kpi",
    },
    {
      id: "trivago-t24",
      q: "The advertiser wants average settlement per market INCLUDING books with no payment yet. Why does AVG(total) FILTER (WHERE …) disappoint, and what's the fix?",
      a: "FILTER removes rows before the fold, so AVG over the survivors averages only paid books — the unpaid 15217 cents of AR vanish from both numerator and denominator, and the market prints a flattered average. The fix is to widen the fold, not filter it: SUM(total) over all books divided by COUNT(*) over all books keeps the zeros in the base, or fold two columns — settled value and book count — and divide in the SELECT. The principle: FILTER answers 'of the rows that qualify', and the advertiser asked 'per book issued'. Match the fold to the denominator the stakeholder named.",
      tag: "nulls",
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
    {
      id: "trivago-mcq-11",
      prompt: "The growth board wants the 14-month pace table plus one grand-total row labelled 'TOTAL'. Which operator appends it without silently collapsing rows?",
      choices: ["UNION", "UNION ALL", "INTERSECT", "JOIN"],
      answer: 1,
      why: "UNION ALL concatenates the two result sets — 14 pace rows plus the TOTAL row survive as written. UNION would dedupe (harmless here, luck-based in general), and INTERSECT/JOIN answer different questions entirely.",
      notes: [
        { choice: 0, why: "UNION dedupes and sorts the stack — the audit habit is to reach for ALL when you mean append." },
        { choice: 3, why: "A JOIN matches and multiplies — it can't append a summary row to a detail set." },
      ],
      difficulty: "easy",
    },
    {
      id: "trivago-mcq-12",
      prompt: "One pass, two bands: bookings at or above the 338.19 network average vs below. Which fragment counts the above-market band correctly?",
      choices: [
        "SUM(CASE WHEN o.total >= 338.19 THEN 1 ELSE 0 END)",
        "SUM(o.total >= 338.19)",
        "CASE WHEN o.total >= 338.19 THEN COUNT(*) END",
        "COUNT(o.total) WHERE o.total >= 338.19",
      ],
      answer: 0,
      why: "CASE WHEN returns 1 for the band and 0 otherwise; SUM folds the flags into a band count — 42 bookings clear the line. The pattern extends to N bands in one scan, which is how the state census stays one query.",
      notes: [
        { choice: 1, why: "SQLite coerces the boolean to 0/1 so this happens to work here, but it's dialect luck — write the CASE explicitly and it ports." },
        { choice: 2, why: "A bare CASE isn't a fold: it evaluates per row, and COUNT(*) inside it is illegal in a non-grouped query." },
      ],
      difficulty: "easy",
    },
    {
      id: "trivago-mcq-13",
      prompt: "Which expression prints the July booked value as 1193.86 rather than 1193.8600000000001?",
      choices: ["CAST(SUM(o.total) AS INTEGER)", "ROUND(SUM(o.total), 2)", "SUBSTR(SUM(o.total), 1, 7)", "ABS(SUM(o.total))"],
      answer: 1,
      why: "ROUND(x, 2) rounds to two decimals for display — the same guard every money cell in this deck carries (3731.97, 1193.86). Float sums accumulate binary dust that only a rounding at print time removes.",
      notes: [
        { choice: 0, why: "CAST to INTEGER drops the cents entirely — 1193.86 becomes 1193." },
        { choice: 2, why: "SUBSTR is a string cut over a number — it breaks on sign, magnitude and trailing digits." },
      ],
      difficulty: "easy",
    },
    {
      id: "trivago-mcq-14",
      prompt: "LAG(booked_value) OVER (ORDER BY month) on the 14-month pace table — what does the 2024-01 row carry?",
      choices: ["0", "NULL", "The January value itself", "A SQL error — no prior row"],
      answer: 1,
      why: "There is no row before the window's first row, so LAG yields NULL — the honest 'no prior month'. Wrap in COALESCE only if the deck needs a printed 0, and label it as synthetic.",
      notes: [
        { choice: 0, why: "A printed 0 fakes a flat start — January's delta against 0 would be a +3731.97 lie." },
        { choice: 3, why: "No prior row is a defined outcome, not an error — the window runs to the end of the spine." },
      ],
      difficulty: "medium",
    },
    {
      id: "trivago-mcq-15",
      prompt: "Running total: SUM(booked_value) OVER (ORDER BY month). Two months tie on booked_value — what does the default frame do?",
      choices: [
        "ROWS-style: strictly rows above, peers excluded",
        "RANGE-style: includes peer rows with equal ORDER BY values",
        "Nothing — a tie aborts the window",
        "It errors — the frame must be explicit",
      ],
      answer: 1,
      why: "The default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — peer rows sharing the current ORDER BY value are included. With unique months it never bites; order by something with ties and the running sum jumps at peers.",
      notes: [
        { choice: 0, why: "That's ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — you'd have to write it explicitly for that behavior." },
        { choice: 3, why: "A default frame always exists — silent, but defined." },
      ],
      difficulty: "medium",
    },
    {
      id: "trivago-mcq-16",
      prompt: "The manifest folds each advertiser's offering names into one cell: GROUP_CONCAT(p.name, ', '). What is NOT guaranteed?",
      choices: ["The separator", "The order of names inside the cell", "That names dedupe", "That one row returns per group"],
      answer: 1,
      why: "SQLite gives no order guarantee inside GROUP_CONCAT — the cell is a bag of names. When order matters, fold a pre-sorted derived table or accept and document the nondeterminism in the manifest.",
      notes: [
        { choice: 0, why: "The separator is the second argument you passed — ', ' — fully deterministic." },
        { choice: 2, why: "GROUP_CONCAT keeps duplicates; only GROUP_CONCAT(DISTINCT x) dedupes, and that drops order guarantees further." },
      ],
      difficulty: "medium",
    },
    {
      id: "trivago-mcq-17",
      prompt: "Q1-2024 pace: WHERE o.created_at BETWEEN '2024-01-01' AND '2024-03-31'. What's wrong on timestamp columns?",
      choices: [
        "Nothing — BETWEEN is inclusive both ends",
        "It drops everything on 2024-03-31 after midnight",
        "It drops all of March",
        "It casts the dates to text and errors",
      ],
      answer: 1,
      why: "'2024-03-31' compares as midnight; bookings stamped later that day fall outside. The safe shape is created_at >= '2024-01-01' AND created_at < '2024-04-01' — half-open ranges never leak a boundary.",
      notes: [
        { choice: 0, why: "Inclusive of midnight only — the boundary timestamp is the leak, and monthly pace quietly undercounts." },
        { choice: 2, why: "Too pessimistic — the whole month runs fine until its final day." },
      ],
      difficulty: "medium",
    },
    {
      id: "trivago-mcq-18",
      prompt: "Per-market AOV: EU 335.32, APAC 313.66, US 383.48, LATAM 426.22. Why is AVG() over those four wrong as the network figure?",
      choices: [
        "It isn't — the mean of market means is the definition",
        "It ignores the weights: 45, 37, 19 and 2 bookings per market",
        "Rounding makes it drift",
        "AVG can't take a derived table",
      ],
      answer: 1,
      why: "The network AOV is total value over total bookings — 34833.28 / 103 = 338.19. Averaging four market means weights LATAM's 2 bookings as heavily as EU's 45. Re-aggregate over the derived table: SUM(value) / SUM(booked).",
      notes: [
        { choice: 2, why: "The drift isn't rounding — it's weighting; rounding just decorates it." },
        { choice: 3, why: "AVG over a derived table is legal — the error is the grain, not the syntax." },
      ],
      difficulty: "hard",
    },
    {
      id: "trivago-mcq-19",
      prompt: "LEFT JOIN + IS NULL and NOT EXISTS agree on this db's searcher anti-joins. When do the two shapes diverge?",
      choices: [
        "When the probe table has NULL join keys",
        "When the outer table is small",
        "When the columns are text",
        "They never diverge — identical semantics",
      ],
      answer: 0,
      why: "A NULL key never matches, so LEFT JOIN + IS NULL flags EVERY row as unmatched — a false churn list. NOT EXISTS handles NULL correctly. Know the caveat even though customer_id is never NULL on this db.",
      notes: [
        { choice: 3, why: "Plans may optimize alike on clean keys, but semantics split on NULLs — that's the interview question." },
        { choice: 1, why: "Size changes speed, not truth — the divergence is about NULL keys, not cardinality." },
      ],
      difficulty: "hard",
    },
    {
      id: "trivago-mcq-20",
      prompt: "Which WHERE shape can use an index on orders.created_at?",
      choices: [
        "strftime('%Y-%m', o.created_at) = '2024-07'",
        "o.created_at >= '2024-07-01' AND o.created_at < '2024-08-01'",
        "CAST(o.created_at AS TEXT) LIKE '2024-07%'",
        "substr(o.created_at, 1, 7) = '2024-07'",
      ],
      answer: 1,
      why: "The half-open range keeps the column bare, so the planner can seek — sargable. Wrapping the column in a function (strftime, CAST, substr) forces a full scan: fine at 103 rows, fatal at 103 million.",
      notes: [
        { choice: 0, why: "The familiar pace-bucket expression — correct in GROUP BY, index-blind in WHERE." },
        { choice: 2, why: "LIKE with a leading constant on a casted column is the same trap in a different coat." },
      ],
      difficulty: "hard",
    },
    {
      id: "trivago-mcq-21",
      prompt: "ORDER BY booked DESC where booked is COUNT(*) AS booked — legal?",
      choices: ["No — ORDER BY needs raw expressions", "Yes — SELECT aliases are visible to ORDER BY", "Only with the column ordinal", "Only inside a CTE"],
      answer: 1,
      why: "ORDER BY evaluates after the SELECT list, so aliases resolve — ORDER BY booked DESC, placement_value DESC reads clean. Ordinals (ORDER BY 2) work but die on column inserts.",
      notes: [
        { choice: 0, why: "That's WHERE's rule, not ORDER BY's — the logical pipeline order is the whole distinction." },
        { choice: 2, why: "Ordinals are legal but brittle — a board that re-orders columns silently re-sorts your deck." },
      ],
      difficulty: "easy",
    },
    {
      id: "trivago-mcq-22",
      prompt: "Weekday skew study: which strftime flag builds the week-of-year key?",
      choices: ["%W", "%j", "%m", "%H"],
      answer: 0,
      why: "%W is week of year (00–53); %j is day-of-year, %m month, %H hour. Mixing them up turns a weekly board into daily noise — and %j is the classic mis-grab on the calendar keyboard.",
      notes: [
        { choice: 1, why: "%j gives 001–365 — a day spine, not a week key." },
        { choice: 3, why: "%H is the hour — useful for intra-day funnel cuts, useless for weekly pace." },
      ],
      difficulty: "easy",
    },
    {
      id: "trivago-mcq-23",
      prompt: "Top-3 advertisers by books; two tie for third. What does ORDER BY books DESC LIMIT 3 return?",
      choices: ["All four tied advertisers", "An error on ties", "Three rows — the third chosen arbitrarily", "Three rows, third alphabetically first"],
      answer: 2,
      why: "LIMIT cuts with no tie policy — which of the tied rows survives is storage-order luck. Boards that must reproduce need a deterministic tiebreaker (rating DESC, name) before the LIMIT.",
      notes: [
        { choice: 0, why: "LIMIT is a hard cut — it never grows for ties; that's RANK/DENSE_RANK territory." },
        { choice: 3, why: "Even the alphabetical survivor is an accident of the engine's tie resolution — don't bank on it." },
      ],
      difficulty: "easy",
    },
    {
      id: "trivago-mcq-24",
      prompt: "Above-market share per market: the scalar subquery must know WHICH market. Which line correlates?",
      choices: [
        "WHERE o.total > (SELECT AVG(total) FROM orders)",
        "WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)",
        "WHERE o.total > AVG(o.total)",
        "HAVING o.total > (SELECT AVG(total) FROM orders)",
      ],
      answer: 1,
      why: "The inner WHERE o2.customer_id = o.customer_id ties the benchmark to the outer row's searcher — a market-local benchmark. Without the correlation, every row reads the same network 338.19.",
      notes: [
        { choice: 0, why: "That's the network benchmark — right for one memo (42 bookings clear 338.19), wrong for per-market share." },
        { choice: 2, why: "AVG(o.total) alongside o.total is an aggregate-in-WHERE error — this needs a subquery or a window." },
      ],
      difficulty: "medium",
    },
    {
      id: "trivago-mcq-25",
      prompt: "Booked, completed, cancelled and kept value per market in ONE scan. Which pattern holds?",
      choices: [
        "Three separate queries UNIONed",
        "COUNT(*) FILTER (WHERE …) and SUM(…) FILTER (WHERE …) folds in one GROUP BY",
        "A correlated subquery per market per fold",
        "GROUPING SETS — SQLite lacks the folds",
      ],
      answer: 1,
      why: "FILTER (WHERE) conditional folds do the census in one pass — EU 45 booked / 24 completed / 494.82 leakage — one scan, one definition block, no cross-query drift.",
      notes: [
        { choice: 0, why: "UNION of three scans triple-reads the table and invites mismatched WHERE drift between copies." },
        { choice: 2, why: "Correlated subqueries per fold re-scan per row — same numbers, several times the cost." },
      ],
      difficulty: "medium",
    },
    {
      id: "trivago-mcq-26",
      prompt: "Unique searchers per 'YYYY-MM' bucket on a query that also joins rate lines. Which fold resists the fan-out?",
      choices: ["COUNT(o.customer_id)", "COUNT(DISTINCT o.customer_id)", "SUM(o.customer_id)", "COUNT(*)"],
      answer: 1,
      why: "The join to rate lines fans 103 bookings to 251 lines — COUNT(*) counts lines, COUNT(o.customer_id) counts them again. COUNT(DISTINCT o.customer_id) collapses back to unique searchers per bucket.",
      notes: [
        { choice: 2, why: "SUM over ids sums key values — numerically enormous, semantically nothing." },
        { choice: 0, why: "Without DISTINCT the fold inherits the fan-out — searcher counts inflate with rate lines." },
      ],
      difficulty: "medium",
    },
    {
      id: "trivago-mcq-27",
      prompt: "Pair every searcher with a same-market searcher once: ON a.region = b.region AND a.id < b.id. Why the inequality?",
      choices: [
        "It speeds the join",
        "It kills self-pairs and mirror duplicates (A,B)/(B,A)",
        "It's required syntax for self-joins",
        "It sorts the pairs",
      ],
      answer: 1,
      why: "Without it, A pairs with itself and every pair appears twice mirrored. a.id < b.id keeps exactly one orientation — 16 searchers, half the rows, no self-pair noise in the co-visit study.",
      notes: [
        { choice: 0, why: "It doesn't help the planner — it's a correctness predicate, not an optimization." },
        { choice: 2, why: "Self-joins need table aliases, not inequalities — the < is your dedupe policy." },
      ],
      difficulty: "hard",
    },
    {
      id: "trivago-mcq-28",
      prompt: "A calendar spine must emit every month from 2024-01 to the latest booking, even zero-book months. Which recursive step advances correctly?",
      choices: [
        "SELECT date(month, '+1 month') FROM spine WHERE month < (SELECT MAX(date(o.created_at, 'start of month')) FROM orders o)",
        "SELECT month + 1 FROM spine",
        "SELECT strftime('%Y-%m', month, '+1 day') FROM spine",
        "Recursive CTEs can't build calendars",
      ],
      answer: 0,
      why: "date(month, '+1 month') steps the calendar safely across month lengths, gated by the latest bucketed booking — the LEFT JOIN onto pace then exposes zero-book months instead of swallowing them.",
      notes: [
        { choice: 1, why: "month + 1 is integer arithmetic on text — it corrupts instead of stepping; calendar math belongs to date()." },
        { choice: 2, why: "Adding a day with %Y-%m formatting double-counts months where the day push crosses a boundary." },
      ],
      difficulty: "hard",
    },
    {
      id: "trivago-mcq-29",
      prompt: "Each advertiser's share of network placement value, every row kept. Which window computes it?",
      choices: [
        "placement_value / SUM(placement_value) OVER ()",
        "placement_value / SUM(placement_value) OVER (PARTITION BY name)",
        "AVG(placement_value) OVER ()",
        "MAX(placement_value) OVER (ORDER BY placement_value)",
      ],
      answer: 0,
      why: "The empty OVER () folds the whole network once — Nordic's 11130.25 over 34833.28 prints its 32% share without collapsing rows. PARTITION BY name would divide each advertiser by itself: 100% everywhere.",
      notes: [
        { choice: 1, why: "Partitioning by the entity makes every share trivially 1 — the classic over-partition bug." },
        { choice: 2, why: "An average is a level, not a share — it tells the board nothing about concentration." },
      ],
      difficulty: "hard",
    },
    {
      id: "trivago-mcq-30",
      prompt: "Marketing redefines click-out conversion as booked over kept (non-cancelled) rates. What breaks?",
      choices: [
        "Nothing — it's a valid variant",
        "Survivorship: the 7 cancelled books leave the base, so the 6.8% leakage hides inside the ratio",
        "It double-counts pending",
        "It needs a HAVING gate",
      ],
      answer: 1,
      why: "Dropping cancelled books shrinks the denominator to 96 and launders the leakage into the conversion number — two KPIs must stay separate: completion over the full 103, and the 6.8% cancellation haircut printed beside it.",
      notes: [
        { choice: 0, why: "It's computable, but it isn't the same KPI — mixing bases across decks breaks every trend line." },
        { choice: 2, why: "Pending is a separate state (14 books) — the crime here is deleting cancelled, not counting pending twice." },
      ],
      difficulty: "medium",
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
    {
      id: "cs-trv-3",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "The trusted-advertiser bench",
      brief:
        "Advertiser ops memo: the placement team wants the *trusted bench* — advertisers rating 4.4 or better, ranked by placement value — before the bid-card refresh. Placement value is rate-line value folded per advertiser: `unit_price * quantity` over `order_items`, joined through each advertiser's offerings. Definitions matter: books = distinct bookings touched (the join fans one booking to many rate lines), value = 2dp money. Probed expectation: three advertisers clear the 4.4 line, led by Nordic Gadgets AB at 11130.25 on 38 books.",
      ask: "Return per advertiser (rating >= 4.4): distinct books touched, placement value at 2dp, and the rating — richest first.",
      template:
        "SELECT s.name,\n       COUNT({1} oi.order_id) AS books,\n       ROUND(SUM(oi.unit_price * oi.quantity), 2) AS placement_value,\n       s.rating\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.{2} = p.id\nGROUP BY s.name\nHAVING s.rating >= {4}\nORDER BY placement_value {3}",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the booking fold",
          why: "The join fans each booking to its rate lines — 251 lines over 103 bookings. COUNT(DISTINCT oi.order_id) collapses back to distinct books per advertiser (38, 45, 34) instead of the inflated line counts.",
        },
        {
          answer: "product_id",
          kind: "keyword",
          label: "the offering bridge",
          why: "The bridge from rate lines to offerings runs through the offering key: oi.product_id = p.id. Any other key pairs the wrong rows and the ledger prints nonsense — or errors outright.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the richest-first order",
          why: "The memo reads richest-first: Nordic 11130.25, Midwest Hardware 9294.93, Alpine 4765.63. ASC would invert the bid card and hand the deck to the smallest advertiser first.",
        },
        {
          answer: "4.4",
          kind: "number",
          label: "the trust line",
          why: "The trust line is Midwest Hardware's 4.4 — the weakest rating the bench admits, and it appears in the result. 4.5 would silently drop Midwest despite its 9294.93 of placement value.",
        },
      ],
      distractors: ["4.5", "4.1", "ALL", "supplier_id", "ASC"],
      walkthrough:
        "Name the grain first: one row per advertiser, so GROUP BY s.name after a two-hop join — products bridge suppliers to rate lines. The booking fold must be COUNT(DISTINCT oi.order_id): a plain COUNT inherits the fan-out and 38 books balloons. Value is ROUND(SUM(oi.unit_price * oi.quantity), 2) — the same fold the finance pack audits to the cent (11130.25 / 9294.93 / 4765.63). The gate HAVING s.rating >= 4.4 keeps Nordic (4.6), Midwest (4.4) and Alpine (4.8); 4.5 is the trap — plausible-sounding, but it drops Midwest and reshapes the bench. DESC orders the bid card; ALL would un-collapse the booking fold and lie about reach.",
    },
    {
      id: "cs-trv-4",
      tier: "medium",
      topic: "s6",
      universe: "funnel",
      title: "The pace gate & leakage bands",
      brief:
        "Growth memo: the advertiser pack wants the pace table *at strength* — only months carrying at least 8 booked rates, with the cancellation leakage printed beside the value so nobody has to ask. Booked value prints 2dp; leakage is a conditional fold over the {rose:cancelled} state; the bucket key is the 'YYYY-MM' calendar key. Probed expectation: six months clear the gate — 2024-09 and 2024-02 at 9 books, four months at 8 — with July's 1193.86 carrying 2 of the network's 7 cancellations.",
      ask: "Return per month (>= 8 booked rates): booked count, cancelled-state leakage, and booked value at 2dp — busiest first.",
      template:
        "SELECT strftime('{3}', o.created_at) AS month,\n       COUNT(*) AS booked,\n       SUM(CASE WHEN o.status = '{2}' THEN 1 ELSE 0 END) AS leakage,\n       ROUND(SUM(o.total), 2) AS booked_value\nFROM orders o\nGROUP BY month\nHAVING COUNT(*) >= {1}\nORDER BY {4} DESC",
      slots: [
        {
          answer: "8",
          kind: "number",
          label: "the pace gate",
          why: "The pace gate sits at 8 — a cell in the result. Months at 6–7 books (April, June, November, both 2025 months) drop; a gate of 9 would keep only the two 9-book months and delete four qualifiers.",
        },
        {
          answer: "cancelled",
          kind: "keyword",
          label: "the leakage state",
          why: "Leakage means cancelled booked rates — status = 'cancelled' inside the CASE flag. 'pending' is a different state (14 books network-wide) and would mislabel the fold the memo calls leakage.",
        },
        {
          answer: "%Y-%m",
          kind: "keyword",
          label: "the bucket key",
          why: "strftime('%Y-%m', created_at) builds the '2024-09' key. %Y collapses the calendar to two year rows; %m merges January-2024 with January-2025 — pace dies either way.",
        },
        {
          answer: "booked",
          kind: "keyword",
          label: "the busiest-first order",
          why: "Busiest first: ORDER BY booked DESC puts the 9-book months on top. booked_value orders by money and reshuffles the deck away from the pace story.",
        },
      ],
      distractors: ["9", "pending", "%Y", "booked_value"],
      walkthrough:
        "One scan, four columns: the bucket key strftime('%Y-%m', o.created_at), COUNT(*) for pace, a CASE-flagged SUM for leakage, ROUND(SUM(o.total), 2) for value. The gate is post-aggregation — months are groups, so HAVING COUNT(*) >= 8; a WHERE at 8 would filter individual bookings, not months. Watch the two traps the distractors stage: '9' is defensible-sounding but silently deletes four qualifying months, and '%Y' merges the calendar into two rows (90 and 13 books) — pace dies. July is the story row: 8 books, 2 cancelled, 1193.86 — the trough carrying the worst leakage share in the network.",
    },
    {
      id: "cs-trv-5",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "Month-over-month pace deltas",
      brief:
        "Board-deck memo: the growth board reads momentum, not levels — every pace line needs its prior month beside it. Definition: prior_value is booked_value shifted back one calendar month over the 'YYYY-MM' spine; January's prior is honestly NULL, not zero. The spine is built once in a derived table (pace per month), then the window runs over it. Probed expectation: February books 3609.64 against January's 3731.97; the June slide lands 2047.43 against 2910.31; July's trough follows at 1193.86.",
      ask: "Return per month: booked count, booked value at 2dp, and the prior month's booked value — chronological.",
      template:
        "SELECT month,\n       booked,\n       ROUND(booked_value, 2) AS booked_value,\n       ROUND({1}(booked_value, {2}) OVER ({3}), 2) AS prior_value\nFROM (\n  SELECT strftime('%Y-%m', o.created_at) AS month,\n         COUNT(*) AS booked,\n         SUM(o.total) AS booked_value\n  FROM orders o\n  GROUP BY month\n)\nORDER BY {4}",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the pace shift",
          why: "LAG(booked_value, 1) reads the previous row on the calendar spine — the month-over-month shift. LEAD reads forward and would pin February's value onto January, inverting every delta in the deck.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the step-back offset",
          noVerify: true,
          why: "One step back — exactly one calendar month. An offset of 2 compares against two months ago, a different momentum read the deck never asked for.",
        },
        {
          answer: "ORDER BY month",
          kind: "keyword",
          label: "the calendar spine",
          why: "The window needs the calendar spine: ORDER BY month inside OVER. DESC walks the spine backwards and pairs every month with its successor — the LAG/LEAD mirror image.",
        },
        {
          answer: "month",
          kind: "keyword",
          label: "the chronology",
          why: "Chronological output: ORDER BY month. Ordering by booked_value sorts by size and shreds the chronology the deltas were computed on.",
        },
      ],
      distractors: ["LEAD", "2", "ORDER BY month DESC", "booked_value"],
      walkthrough:
        "Two stages, one statement. Stage one: a derived table folds pace — strftime('%Y-%m') buckets, COUNT(*) booked, SUM(o.total) value. Stage two: the window reads it — LAG(booked_value, 1) OVER (ORDER BY month) — and ROUND guards the print. LAG vs LEAD is direction: LAG asks 'what was the prior month', LEAD asks 'what came next' — swap them and every delta inverts its sign. The offset belongs at 1; 2 is a quarter-comparison wearing a monthly label. And the spine order is not negotiable: the window's ORDER BY month is what makes 'previous' mean January before February. January's NULL is the honest cell — no prior month exists.",
    },
    {
      id: "cs-trv-6",
      tier: "hard",
      topic: "x2",
      universe: "refund-audit",
      title: "The market completion sweep",
      brief:
        "Refund-audit memo: the quarterly sweep reads every market in one pass — booked, completed, leakage value, kept value — so the settlement team sees completion and leakage side by side without three queries drifting apart. Definitions: completed = status 'delivered'; leakage value = cancelled books' value; kept value = everything else, 2dp. Gate: markets carrying at least 19 booked rates — the US line. Probed expectation: EU 45 booked / 24 completed / 494.82 leakage / 14594.41 kept.",
      ask: "Return per market (>= 19 booked rates): booked count, completed count, leakage value and kept value at 2dp — busiest first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS booked,\n       {1} FILTER (WHERE o.status = 'delivered') AS completed,\n       ROUND(SUM(o.total) FILTER (WHERE o.status = 'cancelled'), 2) AS leakage_value,\n       ROUND(SUM(o.total) FILTER (WHERE o.status <> 'cancelled'), 2) AS kept_value\nFROM orders o\nJOIN customers c ON o.{2} = c.id\nGROUP BY c.{3}\nHAVING COUNT(*) >= {4}\nORDER BY booked DESC",
      slots: [
        {
          answer: "COUNT(*)",
          kind: "keyword",
          label: "the booked fold",
          why: "The completed fold is a census: COUNT(*) FILTER (WHERE o.status = 'delivered'). SUM(total) in that seat would print money where the memo wants a headcount — values, not volumes.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the searcher key",
          why: "Markets join through the searcher: o.customer_id = c.id. o.id = c.id pairs booking ids to searcher ids — valid SQL, garbage pairing, and the census quietly becomes fiction.",
        },
        {
          answer: "region",
          kind: "keyword",
          label: "the market key",
          why: "The market key is c.region — EU, APAC, US, LATAM. c.city fragments the census to sixteen city rows; c.id to sixteen searcher rows, both breaking the HAVING gate's meaning.",
        },
        {
          answer: "19",
          kind: "number",
          label: "the market gate",
          why: "The gate is the US line: 19 booked rates, and it appears in the result. 20 would drop the US market the memo explicitly benchmarks — a one-unit nudge with an amputation attached.",
        },
      ],
      distractors: ["20", "SUM(total)", "city", "id", "1"],
      walkthrough:
        "One scan, four folds: COUNT(*) for the base, COUNT(*) FILTER (WHERE status = 'delivered') for completed, SUM(o.total) FILTER (WHERE status = 'cancelled') for leakage, and SUM(o.total) FILTER (WHERE status <> 'cancelled') rounded for kept value. The join runs searcher-side — o.customer_id = c.id — and the market key c.region keeps the census at market rows. The HAVING gate sits after the fold: >= 19 keeps EU (45), APAC (37) and the US line itself (19). The audit's favorite distractor is '20' — a one-unit nudge that quietly amputates the benchmark row. And EU's story is the headline: 45 booked, 24 completed, only 494.82 lost to cancellation on 14594.41 kept.",
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
    { slug: "product-sales-analysis-ii", why: "Per-offering value rollups with a gate — the rate-line census the placement pack re-runs weekly." },
    { slug: "product-sales-analysis-iii", why: "Cumulative rate-line math per offering — the running placement view finance ties to the ledger." },
    { slug: "immediate-food-delivery-i", why: "First-booking shares per searcher — the early-conversion read on the click-out funnel." },
    { slug: "immediate-food-delivery-ii", why: "Same share, bucketed by day — pace-adjusted conversion the growth board tracks weekly." },
    { slug: "user-activity-for-the-past-30-days-ii", why: "Windowed activity shares — demand slices inside a bounded window, like a 30-day pace cut." },
    { slug: "list-the-products-ordered-in-a-period", why: "Offerings booked inside a period — the rate-board inventory pull for a date range." },
    { slug: "unique-orders-and-customers-per-month", why: "Monthly distinct census — unique bookings and unique searchers per 'YYYY-MM' bucket." },
    { slug: "daily-leads-and-partners", why: "Daily census by channel — booked rates and advertiser pairs per day, the ops heartbeat." },
    { slug: "active-businesses", why: "Multi-fold health counts in one pass — how many bookings hit each dimension, FILTER-style." },
    { slug: "maximum-transaction-each-day", why: "Peak booked rate per day — the argmax-with-window read behind the daily high-rate board." },
    { slug: "the-most-recent-three-orders", why: "Latest books per searcher — recency windows via ROW_NUMBER, the re-marketing pull list." },
    { slug: "second-highest-salary", why: "Runner-up reads without DISTINCT accidents — the second-price rate board done honestly." },
    { slug: "sales-by-day-of-the-week", why: "Weekday skew pivot — bookings pivoted by day-of-week, the calendar shape advertisers bid against." },
    { slug: "the-latest-login-in-2020", why: "Latest activity per searcher with a year gate — recency folds with a date filter." },
    { slug: "top-earners", why: "Tied tops handled honestly — multi-row maxima on the earnings-style board." },
    { slug: "find-total-time-spent-by-each-employee", why: "Stay-length style duration folds — start-to-end sums per entity, the lead-time cousin." },
  ],
};
