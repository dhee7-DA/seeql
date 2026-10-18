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
      slugs: ["calculate-special-bonus", "loan-types", "the-category-of-each-member-in-the-store", "count-salary-categories"],
    },
    {
      name: "Folio-line night folds",
      why: "Every portfolio read folds folio lines to booking grain: nights, value and DISTINCT bookings per room class — 251 lines over 103 bookings, and the fold that survives is the one that deduplicates. Per-class demand folds are the daily bread of the brand teams.",
      slugs: ["product-sales-analysis-ii", "product-sales-analysis-iii", "most-frequently-ordered-product-per-customer", "product-sales-analysis-i", "product-sales-analysis-iv", "customers-who-bought-all-products"],
    },
    {
      name: "ADR & the market rate card",
      why: "Rate reads are value over the right denominator — booking value over bookings, never over folio lines or guests. The network card reads 338.19; US prints 383.48 on 19 bookings. Benchmark and group-vs-global-average drills with denominators printed beside them are exactly what revenue management asks for.",
      slugs: ["average-selling-price", "find-expensive-cities", "top-travellers", "second-highest-salary"],
    },
    {
      name: "Group-desk market folds",
      why: "The group desk reads markets two ways at once: bookings placed and distinct guests booking — 45 bookings from 8 guests in EU, 19 from 2 in US. Two-grain census drills are the pacing-pack staples, and the trap is counting both at the same grain.",
      slugs: ["students-and-examinations", "unique-orders-and-customers-per-month", "sales-person", "repeat-purchase-rate"],
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
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "friday-purchase-iii", "sales-by-day-of-the-week"],
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
    {
      id: "hyatt-t9",
      q: "Walk me through staging the World of Hyatt ladder as a CTE — why two named steps instead of one nested query?",
      a: "Stage one folds lifetime value per guest: SUM(total) grouped by customer_id at guest grain — 103 bookings collapsing to 16 folded rows. Stage two tiers and shares: the outer query CASE-buckets the folded guests (four 3000-plus holders, eight 2000-plus holders) and divides each tier's value by the network's 34833.28. Two steps earn their names because each has a reviewable definition — 'guest lifetime value' and 'tier share' are the two sentences the loyalty deck repeats. A nested one-liner buries the grain boundary where the fan-out lives: tier the raw rows and you tier folio lines, not guests. Named steps also survive the follow-up ('re-cut the ladder at 2500') as a one-line edit instead of an archaeology dig.",
      tag: "subqueries",
    },
    {
      id: "hyatt-t10",
      q: "COUNT(*), COUNT(expr) and COUNT(DISTINCT expr) — what does each print on the folio join?",
      a: "On the bookings-to-folio-lines join the three are different censuses: COUNT(*) counts joined rows — 251 folio lines; COUNT(ii.order_id) counts non-NULL booking keys — still 251, because every line carries a booking; COUNT(DISTINCT ii.order_id) folds the fan-out back to distinct bookings — 103 network, 54 for the widest-attach class. The interviewer wants the grain sentence attached to each: lines, bookings, classes. The habit that survives review: say 'one row per what?' before writing any COUNT on a joined fold, and let the census claim match the fold actually written — an occupancy number built on lines isn't an approximation, it's a different metric.",
      tag: "aggregation",
    },
    {
      id: "hyatt-t11",
      q: "The PMS export arrives with '  alice chen ' style names. What's the hygiene pass before any join, and what breaks if you skip it?",
      a: "Three moves, once, upstream of every join: TRIM the padding, fold case with UPPER (SQLite has no INITCAP, so UPPER plus a SUBSTR-and-concatenate if true title case is required), and canonize on the immutable key — the customer id — not the name. Skipped, the hygiene debt compounds silently: 'Alice Chen' and 'alice chen' stop matching, one guest splits into two Skywards accounts, and the loyalty ladder loses her 7262.35 of lifetime value to a phantom second member. The graded point is the order of operations: clean in a CTE (or better, at load time), then join on the key — never TRIM inside the join condition, where every row pays and no test can see it.",
      tag: "strings",
    },
    {
      id: "hyatt-t12",
      q: "A running-value report walks bookings by date and 'jumps two bookings at once' when two share a created_at. What's happening and what's the fix?",
      a: "The default frame with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes peers — rows tied on created_at enter the running sum together, so the cumulative advances two bookings in one step. The fix is saying the frame out loud: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks strictly row by row, each booking joining alone. Neither is wrong — they're different reports — but the deck must know which one it printed, because a 'same-day' tie that doubles a step reads as a data spike to whoever charts it. State the frame in a comment; the next analyst inherits the policy, not the surprise.",
      tag: "windows",
    },
    {
      id: "hyatt-t13",
      q: "Where does NTILE earn its place in the loyalty read, and where does it mislead?",
      a: "NTILE(4) deals the ordered 16 guests into four even tiles — four heads each — which is exactly the outreach-pacing cut: who belongs in this quarter's call batch. What it is not is a concentration metric: the 63.5% line is a value fold (tiered lifetime value over 34833.28), and tiles are heads, not money — the top tile can hold 4 guests and 71% of value while the bottom holds 4 guests and 2%. The failure mode is naming: call NTILE output 'tiers' and the deck now has two different ladders wearing one name, with the four 3000-plus guests sitting in the same tile as whoever squeaked in at the boundary. Tiles for pacing, tiers for policy, and both labeled for what they count.",
      tag: "windows",
    },
    {
      id: "hyatt-t14",
      q: "You need the no-show census and the occupancy census in one board. UNION or UNION ALL — and what's the silent failure mode?",
      a: "Decide by asking whether duplicate rows are possible and whether they'd be information. UNION dedups whole rows across branches — two branches that emit byte-identical rows (same state label, same count) collapse into one with no warning, and a market quietly vanishes from the board. UNION ALL keeps everything and is the safe default whenever a legitimate repeat exists — say why duplicates are impossible in a comment, because the comment is the correctness argument. The discipline the panel grades: set operations are not a layout trick, they're a set-semantics decision, and 'dedup silently' is only acceptable when you've proven the branches are disjoint by construction.",
      tag: "setops",
    },
    {
      id: "hyatt-t15",
      q: "Cut Q4 pace without losing the last night of the quarter. How do you write the window?",
      a: "Half-open: created_at >= '2024-10-01' AND created_at < '2025-01-01'. BETWEEN is closed on both ends, so BETWEEN '2024-10-01' AND '2024-12-31' happens to survive on this date-only db — but the habit breaks the day timestamps gain times, when 2024-12-31T14:00 falls outside a closed '2024-12-31' bound and quarter-end bookings silently vanish exactly when peak-season demand lands. The month keys in the fold — strftime('%Y-%m', created_at) — sort correctly as text, so '2024-10' through '2024-12' need no re-wrapping. Say the boundary policy out loud once and every window in the kit inherits it.",
      tag: "dates",
    },
    {
      id: "hyatt-t16",
      q: "Top-3 bookings per market, deterministically. Where do ORDER BY and LIMIT sit, and what about ties?",
      a: "ORDER BY first, LIMIT last — LIMIT is a pipeline tail that narrows whatever the sort produced, so LIMIT without ORDER BY is an arbitrary three rows the engine happened to hold. Ties are the real trap: two bookings at 576.54 both 'deserve' the third slot, and the engine's choice can change between runs. The fix is a named tiebreaker chain — ORDER BY total DESC, created_at, id — which makes the pick reproducible, and a comment saying the chain is policy. Per-market top-3 escalates it to a window (ROW_NUMBER() OVER (PARTITION BY region ORDER BY total DESC) <= 3), because a plain LIMIT applies to the whole result set, not each market's fold.",
      tag: "pipeline",
    },
    {
      id: "hyatt-t17",
      q: "Correlated versus scalar subquery: compare each booking to its own market's average booking value. What changes?",
      a: "The scalar form — total > (SELECT AVG(total) FROM orders) — compares every booking to the network's 338.19 once; the correlated form — total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id IN (SELECT id FROM customers WHERE region = o.region)) or a window AVG OVER (PARTITION BY region) — compares each booking to ITS market: US's 383.48, APAC's 313.66. Different question, different answer, different cost — the correlated probe re-runs per outer row. On 103 rows the cost is invisible; on a production bookings table it's the query that pages you. State the inner fold's population and its empty-case behavior (zero rows → NULL → the comparison drops out silently) unprompted; that's the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "hyatt-t18",
      q: "One cell, whole mix: where does GROUP_CONCAT belong in the folio read?",
      a: "GROUP_CONCAT(DISTINCT status) folds each month's folio states into one comma cell — 'cancelled,delivered,pending,shipped' for the busy months — which is the at-a-glance mix the deck prints beside the counts. Two honest limits: SQLite gives no guaranteed order inside the concatenation (order by a subquery if the deck needs it sorted), and the cell is display, not data — you cannot aggregate back over a folded string, so it rides beside COUNT arms, never instead of them. The bite is the fan-out: run it on the folio join without DISTINCT and one state repeats per line, and the 'mix' becomes a line-count artifact. One cell, one grain, labeled.",
      tag: "aggregation",
    },
    {
      id: "hyatt-t19",
      q: "The morning census filters status and sorts by the month key. What index do you propose, and what would you measure?",
      a: "A composite on orders(status, created_at): the equality arm on status is the leading column, and the created_at tail keeps the month-bucket sort from a second pass. The honest caveats: at 103 rows this is vocabulary, not performance — the answer matters because production bookings tables are millions of rows and the census runs hourly. What I'd measure is EXPLAIN QUERY PLAN before and after — 'SCAN orders' becoming 'SEARCH orders USING INDEX' — plus write overhead, because every index taxes the insert path the PMS feed owns. Proposing an index is claiming a trade; measuring it is the part that makes the claim engineering.",
      tag: "indexes",
    },
    {
      id: "hyatt-t20",
      q: "shipped_at IS NULL — name three queries that must treat those 21 rows differently.",
      a: "The folio-state census must keep them in the denominator: the 14 pending and 7 no-showed bookings are states, not dirty rows, and the 82/103 on-property share exists because they stay. The lead-time read must exclude them at row grain — WHERE shipped_at IS NOT NULL — because julianday of nothing is nothing, and the population (82 stamped bookings, 2.98-day average) goes in the title. COUNT(shipped_at) rides the NULL-blindness deliberately: it counts the 82 stamped rows while COUNT(*) counts 103, and the gap between the two counts IS the open-arm census. Same 21 rows, three different treatments, each defensible only because the business state is named.",
      tag: "nulls",
    },
    {
      id: "hyatt-t21",
      q: "LATAM holds 2 bookings. Where do small denominators bite the portfolio read, and what's the guard?",
      a: "Every ratio over LATAM is anecdote-shaped: 426.22 rate on 2 bookings, a 3.5-day lead on 2 flown stays — real figures, unstable bases, and one more booking swings each by half. The guards are mechanical and presentational: HAVING COUNT(*) >= 19 keeps LATAM off the rate card's main face (the small-N gate), a CASE or flag column marks markets under a stated floor instead of hiding them, and NULLIF guards the pathological zero-denominator in staging tables where a market can exist with no bookings. The graded sentence: small-N is a disclosure, not an error — footnote LATAM, never delete it, because the owner call always asks about the market you dropped.",
      tag: "nulls",
    },
    {
      id: "hyatt-t22",
      q: "The owner deck cites 152.17 dollars; the ledger row says 15217. Walk the reconciliation.",
      a: "Unit audit first: invoices, payments, expenses and ledger rows are INTEGER cents on this db — 15217 cents is 152.17 dollars after one division by 100.0. The discipline is placement: divide once, at the presentation edge, not per-CTE, because each intermediate rounding or re-division is a fresh chance to drift from the ledger. Then tie out: the coverage ledger classifies the 6 unpaid bills (15217 cents total), the void-but-paid anomaly and the 4000-of-6148 partial, and the ledger trial balance must land 181080 against 181080 — delta zero. A deck that can't reproduce those figures from the raw cents isn't rounding wrong; it's sourced wrong.",
      tag: "quality",
    },
    {
      id: "hyatt-t23",
      q: "AVG(total) versus SUM(total)/COUNT(*) — when do they diverge on this db?",
      a: "Over the same unjoined rows they're identical — both fold the 103 bookings to 338.19, and both skip NULL totals the same way. They diverge when the denominator changes meaning: run either over the folio join and SUM(total) double-counts booking value per line while COUNT(*) counts 251 lines — the quotient answers a question nobody asked. The third divergence is semantic: SUM(total)/COUNT(DISTINCT customer_id) is value per guest, not value per booking — 2177.08 against 338.19 on this db, both honest, both different. The rule the screens grade: the fraction is only as honest as the grain of each half, and AVG is just the fold that keeps them paired.",
      tag: "aggregation",
    },
    {
      id: "hyatt-t24",
      q: "What are the two sentences every Hyatt screen is grading you on?",
      a: "First: 'a folio line is a night, a booking is a stay' — and occupancy, nights-per-booking (2.4) and ADR (338.19) are three different folds over the same rows, so the metric named must match the grain folded. Second: the denominator sentence — every share prints with its base attached (82 of 103 on-property, 63.5% of 34833.28, 3 of 37 in APAC), because a percentage without its denominator is a claim, not a metric. Everything else in the kit — the CASE rolls, the window boards, the cents discipline — is machinery in service of those two sentences. Candidates who compute fast but skip them read as dangerous, not senior.",
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
    {
      id: "hyatt-mcq-11",
      prompt: "The room-class census: which fragment counts the room classes actually carrying folio lines — 16 on this db?",
      choices: [
        "COUNT(*)",
        "COUNT(DISTINCT ii.product_id)",
        "COUNT(ii.product_id)",
        "SUM(ii.product_id)",
      ],
      answer: 1,
      why: "Every one of the 16 room classes has transacted, and COUNT(DISTINCT ii.product_id) folds 251 folio lines back to the 16 classes that carry them — the shelf census the portfolio read wants.",
      notes: [
        { choice: 0, why: "COUNT(*) counts folio LINES — 251, the fan-out number. The census reads shelf breadth, not night volume." },
        { choice: 3, why: "SUM adds product id codes together — an arithmetic accident, not a count of classes." },
      ],
      difficulty: "easy",
    },
    {
      id: "hyatt-mcq-12",
      prompt: "A candidate joins orders to order_items and reports SUM(o.total) far above the 34833.28 network value. Why?",
      choices: [
        "Rounding drift across 251 folio lines",
        "The join fans each booking to one row per folio line, so booking value repeats per line",
        "order_items carry their own totals that must be added on",
        "Cancelled bookings inflate the sum",
      ],
      answer: 1,
      why: "Joining lines fans 103 bookings into 251 rows; booking-level SUM(o.total) then repeats each booking's value once per folio line. Fold at one grain: SUM over orders alone, or price the lines as quantity × unit_price — never both folds at once.",
      notes: [
        { choice: 2, why: "Lines carry per-unit prices, not booking totals — mixing the two folds IS the double-count." },
        { choice: 3, why: "Cancellation is a status, not a join artifact — the overcount hits every booking that carries a folio line, cancelled or not." },
      ],
      difficulty: "medium",
    },
    {
      id: "hyatt-mcq-13",
      prompt: "Revenue management asks for room classes priced at 200 or more. What does SELECT name FROM products WHERE price >= 200 return?",
      choices: [
        "The 3 flagship suites",
        "Zero rows — the db's price ceiling is 199.99, so premium must be defined another way",
        "A syntax error — 200 needs a currency",
        "Every class — price is annual",
      ],
      answer: 1,
      why: "The price ceiling on this db is 199.99, so a 200-plus filter is empty by construction. Premium reads must lean on a class dimension or rate code, not a price threshold that excludes every row on the db.",
      notes: [
        { choice: 0, why: "Nothing sits at or above 200 — a confident empty list still needs the definition corrected, not rendered as a flat chart." },
        { choice: 2, why: "Numbers compare fine unquoted — the query is valid SQL that legitimately returns nothing, which is exactly the trap." },
      ],
      difficulty: "easy",
    },
    {
      id: "hyatt-mcq-14",
      prompt: "The owner call opens on the three priciest bookings. Which query returns exactly those?",
      choices: [
        "SELECT id, total FROM orders ORDER BY total DESC LIMIT 3",
        "SELECT id, total FROM orders LIMIT 3 ORDER BY total DESC",
        "SELECT id, total FROM orders WHERE total >= 1088 LIMIT 3",
        "SELECT TOP 3 id, total FROM orders",
      ],
      answer: 0,
      why: "ORDER BY total DESC sorts the fold, then LIMIT 3 keeps the head — the 1088.44 top booking first. Clause order is the pipeline: LIMIT narrows what the sort produced, never the reverse.",
      notes: [
        { choice: 1, why: "LIMIT before ORDER BY is a misplaced tail — at best arbitrary rows, at worst a rejected clause; the pipeline order is the lesson." },
        { choice: 3, why: "TOP is SQL Server syntax — this db speaks SQLite, which uses LIMIT." },
      ],
      difficulty: "easy",
    },
    {
      id: "hyatt-mcq-15",
      prompt: "Keep markets whose average booking value clears 320. Which clause does it?",
      choices: [
        "WHERE AVG(total) > 320",
        "GROUP BY region HAVING AVG(total) > 320",
        "WHERE total > 320 GROUP BY region",
        "HAVING total > 320 after grouping",
      ],
      answer: 1,
      why: "Average-per-market is a group fact: HAVING AVG(total) > 320 after GROUP BY region keeps US (383.48), EU (335.32) and LATAM (426.22) while APAC's 313.66 drops. WHERE judges rows before any fold exists.",
      notes: [
        { choice: 0, why: "AVG cannot be evaluated in WHERE — no groups have formed; the engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "total > 320 filters individual bookings — a row fact that changes the population and then the average, answering a different question." },
      ],
      difficulty: "medium",
    },
    {
      id: "hyatt-mcq-16",
      prompt: "A rate-band CASE reads: WHEN total >= 200 THEN 'standard' WHEN total >= 400 THEN 'premium' ELSE 'economy'. What lands in 'premium'?",
      choices: [
        "Every booking at 400 or more",
        "Nothing — the 200 arm fires first and swallows the 400-plus bookings",
        "Only bookings between 200 and 399",
        "The query errors on overlapping arms",
      ],
      answer: 1,
      why: "CASE evaluates arms in order: the 200 arm catches every booking the 400 arm was meant to hold, so 'premium' is unreachable and the census misbands the 34 four-hundred-plus stays. Band arms go high-to-low so each threshold gets its slice.",
      notes: [
        { choice: 0, why: "That's the intent, not the mechanics — first-match-wins reclassifies premium stays as standard while the query stays green." },
        { choice: 2, why: "200-to-399 is what the 200 arm SHOULD hold; the reorder also drags 400-plus into standard, inflating that band and deflating premium to zero." },
      ],
      difficulty: "hard",
    },
    {
      id: "hyatt-mcq-17",
      prompt: "Two fragments compute the US rate: ROUND(AVG(total), 2) and AVG(ROUND(total, 2)). Both print 383.48 here — which is the house fold?",
      choices: [
        "AVG(ROUND(total, 2)) — round before folding",
        "ROUND(AVG(total), 2) — fold first, round once at the edge",
        "CAST(AVG(total) AS TEXT) preserves the cents best",
        "Neither — rate cards print unrounded",
      ],
      answer: 1,
      why: "Fold on full precision, round once at presentation: ROUND(AVG(total), 2) is the audited fold. Rounding per row before averaging bakes presentation into the metric — harmless at two decimals on this db, and the habit breaks tie-outs the moment denominators differ.",
      notes: [
        { choice: 0, why: "Per-row rounding makes the fold irreproducible from raw data — the deck and the audit can no longer agree on the input." },
        { choice: 2, why: "Casting to TEXT is a display move, not arithmetic — the number stops being a number the moment you claim it back." },
      ],
      difficulty: "hard",
    },
    {
      id: "hyatt-mcq-18",
      prompt: "The brand-family board: after three clean rungs, three flags tie at 4 room classes and the next flag carries 3. Under RANK semantics, what rung does the 3-class flag wear?",
      choices: ["4", "5", "6", "7"],
      answer: 3,
      why: "RANK shares the rung and then skips the slots the tie consumed: the three-way tie holds ranks 4 through 6, so the next distinct count lands on 7. The gap is the board admitting three flags share fourth place.",
      notes: [
        { choice: 1, why: "5 is the DENSE_RANK reading — consecutive rungs, tie depth hidden. The published board uses RANK semantics." },
        { choice: 2, why: "6 is the LAST rank the tie block occupies — off-by-one on the consumed block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "hyatt-mcq-19",
      prompt: "The loyalty desk tiles the 16 guests into quartiles by lifetime value. Which fragment assigns tiles 1–4?",
      choices: [
        "NTILE(4) OVER (ORDER BY lifetime_value DESC)",
        "ROUND(4 * lifetime_value / SUM(lifetime_value) OVER ())",
        "CASE WHEN lifetime_value >= 3000 THEN 1 … ELSE 4 END",
        "MOD(ROW_NUMBER() OVER (ORDER BY lifetime_value), 4)",
      ],
      answer: 0,
      why: "NTILE(4) deals the ordered 16 guests into four even tiles of 4 heads — the outreach-pacing cut. Threshold CASE bands are value tiers (a different cut the deck shows beside tiles), and the MOD hack produces ragged tiles with no ordering guarantee.",
      notes: [
        { choice: 1, why: "Value share is a concentration metric — it tiles by money, not by people; the two must not share a name." },
        { choice: 2, why: "That's the tier ladder at published lines — correct for policy, wrong for 'quartiles of guests'." },
      ],
      difficulty: "hard",
    },
    {
      id: "hyatt-mcq-20",
      prompt: "Booking-to-check-in lead by market: where does shipped_at IS NOT NULL belong, and what does it protect?",
      choices: [
        "In HAVING — it's a group fact",
        "In WHERE before the fold — the 21 unstamped bookings have no lead and must not join the AVG",
        "Nowhere — julianday ignores NULLs anyway, so the filter is cosmetic",
        "In ORDER BY — unstamped bookings sort last",
      ],
      answer: 1,
      why: "It's a row fact and the definitional filter: only the 82 stamped bookings have a lead, so WHERE keeps the market averages honest around the network's 2.98 days. julianday does NULL the rows out arithmetically — but the WHERE states the population the report measures, which is the part the reviewer grades.",
      notes: [
        { choice: 0, why: "HAVING runs after the fold — by then the NULLs already did their silent work; the gate belongs at row grain." },
        { choice: 2, why: "The AVG survives without it, but an unstated population is a report waiting to be misread — say the filter out loud." },
      ],
      difficulty: "medium",
    },
    {
      id: "hyatt-mcq-21",
      prompt: "The pace curve's value trough. Which read finds it?",
      choices: [
        "Fold pace per month key, then ORDER BY value ASC LIMIT 1",
        "WHERE value = MIN(value) over orders",
        "MIN(total) over the raw orders table",
        "ORDER BY created_at ASC LIMIT 1",
      ],
      answer: 0,
      why: "Fold pace per '2024-07'-style key first, then take the cheapest row: 2024-07 at 1193.86 is the trough the forecast blames on seasonality. Extremum after fold — grain before extremum.",
      notes: [
        { choice: 1, why: "WHERE can't see the fold — MIN doesn't exist at row time; the comparison belongs in HAVING or an outer query." },
        { choice: 2, why: "MIN over raw orders returns the cheapest single booking, not the cheapest month — a different grain entirely." },
        { choice: 3, why: "That returns the FIRST booking chronologically — date order and value order are different arguments." },
      ],
      difficulty: "hard",
    },
    {
      id: "hyatt-mcq-22",
      prompt: "The census arm SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) prints 7. The same arm rewritten COUNT(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) prints 103. Why?",
      choices: [
        "COUNT counts every row whose expression is non-NULL — the ELSE 0 hands all 103 rows a countable 0",
        "COUNT ignores CASE arms entirely",
        "The census drifted because more bookings landed",
        "SUM and COUNT are aliases in SQLite",
      ],
      answer: 0,
      why: "COUNT(expr) counts non-NULL values; the ELSE 0 makes every booking's arm value a non-NULL 0, so the arm counts the whole book. SUM adds the values — 7 ones over 96 zeroes. Census arms ride SUM, or COUNT with THEN 1 and no ELSE.",
      notes: [
        { choice: 1, why: "COUNT reads CASE arms fine — the failure is feeding it zeroes instead of NULLs." },
        { choice: 3, why: "They are different folds with different NULL rules — exactly the line this drill draws." },
      ],
      difficulty: "medium",
    },
    {
      id: "hyatt-mcq-23",
      prompt: "The VIP walk list: guests whose name opens with 'A'. Which fragment is the match?",
      choices: [
        "WHERE name = 'A%'",
        "WHERE name LIKE 'A%'",
        "WHERE UPPER(name) = 'A'",
        "WHERE name IN ('A')",
      ],
      answer: 1,
      why: "LIKE 'A%' is the prefix match — Alice Chen is the guest it catches on this db. '=' compares the whole string against the literal 'A%'; IN lists exact values.",
      notes: [
        { choice: 0, why: "The equals sign takes the percent literally — no name is literally 'A%', so the list returns empty while looking plausible." },
        { choice: 2, why: "UPPER(name) = 'A' demands the whole name be one letter — case-folding doesn't shorten strings." },
      ],
      difficulty: "easy",
    },
    {
      id: "hyatt-mcq-24",
      prompt: "A colleague 'fixes' the lead-time report with julianday(COALESCE(shipped_at, created_at)) - julianday(created_at) to include all 103 bookings. What's wrong?",
      choices: [
        "COALESCE isn't allowed inside julianday",
        "It's fine — the average just gets wider",
        "It invents 0-day leads for the 21 unstamped bookings, collapsing the 2.98-day window the upgrade offer is sized on",
        "It double-counts the stamped 82",
      ],
      answer: 2,
      why: "COALESCE substitutes the booking date for a missing check-in stamp, fabricating a zero-day lead for the 14 in-window and 7 no-showed bookings — the average craters and the upgrade window reads far shorter than the true 2.98 days. NULL here is business state; report the 82-booking population instead.",
      notes: [
        { choice: 0, why: "It's allowed, and that's the trap — valid SQL producing a lying metric." },
        { choice: 1, why: "The fabricated zeros pull the average DOWN, not out — the number gets tighter and more wrong." },
      ],
      difficulty: "hard",
    },
    {
      id: "hyatt-mcq-25",
      prompt: "How many markets does the portfolio book into, and with which fragment?",
      choices: [
        "4 — COUNT(DISTINCT c.region) after the join",
        "3 — COUNT(region) with DISTINCT implied",
        "103 — COUNT(*) over bookings",
        "16 — COUNT(DISTINCT customer_id)",
      ],
      answer: 0,
      why: "Four markets — EU, APAC, US, LATAM — and COUNT(DISTINCT c.region) prints exactly that once bookings join to guests, because region rides on the customers table.",
      notes: [
        { choice: 1, why: "DISTINCT is never implied — COUNT(region) counts booking rows with a region: 103 after the join." },
        { choice: 3, why: "16 is the guest count — a different census on the same fold." },
      ],
      difficulty: "easy",
    },
    {
      id: "hyatt-mcq-26",
      prompt: "The never-booked-guest anti-join (guests with no booking rows) returns how many rows — and what's the honest read?",
      choices: [
        "7 — matches the no-shows",
        "0 — every one of the 16 guests has transacted, and proving that zero is the finding",
        "21 — the unstamped bookings",
        "It errors without a RIGHT JOIN",
      ],
      answer: 1,
      why: "LEFT JOIN guests to bookings keeping NULL booking ids returns an empty set: all 16 World of Hyatt guests appear in the booking table. The zero is a finding — it certifies the loyalty file is fully transacted, not that the query failed.",
      notes: [
        { choice: 0, why: "No-shows are cancelled bookings, not absent guests — they still have booking rows and sit outside the anti-join." },
        { choice: 3, why: "A LEFT JOIN with IS NULL is the standard anti-join shape; it runs fine and legitimately returns nothing." },
      ],
      difficulty: "easy",
    },
    {
      id: "hyatt-mcq-27",
      prompt: "The state-mix cell: one row per month with its folio states folded into one string. Which fragment?",
      choices: [
        "GROUP_CONCAT(DISTINCT status) AS states",
        "CONCAT(status) AS states",
        "STRING_AGG(status, ', ') GROUP BY status",
        "JOIN statuses INTO states",
      ],
      answer: 0,
      why: "GROUP_CONCAT(DISTINCT status) folds each month's folio states into one comma cell — 'cancelled,delivered,pending,shipped' for the busy months — without fanning rows. It's the at-a-glance mix printed beside the census counts.",
      notes: [
        { choice: 1, why: "SQLite has no bare CONCAT aggregate — that's a scalar function in other engines and errors here." },
        { choice: 2, why: "STRING_AGG is PostgreSQL — and grouping BY status inverts the grain: one row per state, not per month." },
      ],
      difficulty: "hard",
    },
    {
      id: "hyatt-mcq-28",
      prompt: "Which guests have booked EVERY room class in the portfolio? The honest shape is:",
      choices: [
        "Fold DISTINCT classes per guest in a grouped fold, then HAVING COUNT(DISTINCT ii.product_id) = (SELECT COUNT(*) FROM products)",
        "WHERE product_id = ALL (SELECT id FROM products)",
        "WHERE COUNT(product_id) = 16 in WHERE",
        "EXCEPT guests with a missing class",
      ],
      answer: 0,
      why: "That's relational division: the fold returns exactly the guests whose DISTINCT class count equals the full catalog — the count comes from the fold, the target from the table, and the two only meet at guest grain. The fold-per-guest shape is what the reviewer wants stated, whatever set it returns.",
      notes: [
        { choice: 1, why: "SQLite has no ALL quantifier — and even where it exists, the fold-per-guest shape is the graded answer." },
        { choice: 3, why: "EXCEPT shapes the inverse (guests missing a class) — useful scaffolding, but the division itself is the count-equals-catalog fold." },
      ],
      difficulty: "hard",
    },
    {
      id: "hyatt-mcq-29",
      prompt: "The repeat base: guests with two or more bookings. Which fold, and how many guests survive?",
      choices: [
        "GROUP BY customer_id HAVING COUNT(*) >= 2 — 14 of 16",
        "WHERE COUNT(*) >= 2 over orders — 14",
        "GROUP BY customer_id HAVING COUNT(*) >= 2 — 16",
        "DISTINCT customer_id — 14",
      ],
      answer: 0,
      why: "Fold bookings per guest, then HAVING keeps the 14 guests with 2-plus bookings — the two single-booking guests drop. The floor is a group fact, so it lives in HAVING after the fold.",
      notes: [
        { choice: 1, why: "WHERE can't see COUNT before groups form — the engine rejects it, and rightly so." },
        { choice: 2, why: "All 16 guests have bookings; the floor of 2 is what removes the two singles — without it base and repeat are indistinguishable." },
      ],
      difficulty: "medium",
    },
    {
      id: "hyatt-mcq-30",
      prompt: "Housekeeping wants room classes holding fewer than 20 units of stock. The fragment is:",
      choices: [
        "WHERE stock < 20 on products",
        "HAVING stock < 20 after GROUP BY",
        "WHERE COUNT(stock) < 20",
        "ORDER BY stock LIMIT 20",
      ],
      answer: 0,
      why: "Stock is a row-level column on the room-class table — WHERE stock < 20 is the whole query. No fold, no groups, no window: the simplest screens are row filters, and reaching for aggregates re-grains the shelf for nothing.",
      notes: [
        { choice: 1, why: "HAVING needs a GROUP BY and judges folds — stock isn't folded, it's stored." },
        { choice: 3, why: "That returns the 20 lowest-stock classes regardless of the line — a ranking, not the census asked for." },
      ],
      difficulty: "easy",
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
    {
      id: "cs-hyatt-3",
      tier: "medium",
      topic: "j1",
      universe: "catalog",
      title: "The room-class night fold",
      brief:
        "Hyatt-flavored brief on the storefront db (products = room classes, order_items = folio lines, a folio line = a night): the portfolio demand read folds folio lines back to room classes — nights, distinct bookings and line value per class, with the wide shelf cut out. Probed on the db: the Noise-Canceling Headset class carries 24 folio lines from 24 bookings worth 6888.25, the 4K Webcam Pro 17 lines worth 3989.97, and the Laptop Stand Aluminum 19 lines worth only 1542.77 — value and volume are different columns. The fold's grain is the grade: COUNT(*) counts nights (251 network), COUNT(DISTINCT ii.order_id) folds back to bookings, and the value fold prices every line as quantity × unit_price. The read keeps classes with at least 17 nights of demand so the shelf report carries a base.",
      ask: "Return each room class with 17+ folio lines: class, nights, bookings, line value (2dp) — biggest value first.",
      template:
        "SELECT p.name AS room_class,\n       COUNT(*) AS nights,\n       COUNT(DISTINCT {1}) AS bookings,\n       ROUND(SUM({2}), 2) AS line_value\nFROM products p\nJOIN order_items ii ON ii.product_id = p.id\nGROUP BY p.id, p.name\nHAVING COUNT(*) >= {3}\nORDER BY line_value {4};",
      slots: [
        {
          answer: "ii.order_id",
          kind: "keyword",
          label: "the booking fold",
          why: "COUNT(DISTINCT ii.order_id) folds the fan-out back to distinct bookings — the join fans each booking to one row per night, so only the DISTINCT fold survives to booking grain. COUNT(ii.order_id) counts nights again and calls them bookings; COUNT(DISTINCT p.id) collapses every class row to 1.",
        },
        {
          answer: "ii.quantity * ii.unit_price",
          kind: "keyword",
          label: "the line-value fold",
          why: "A folio line's value is quantity × unit_price — the Headset's 6888.25 prices every unit on every line. SUM(ii.unit_price) drops the quantity factor and reads low on every multi-unit line; SUM(p.price) prices lines off shelf rate, not off what the stay actually paid.",
        },
        {
          answer: "17",
          kind: "number",
          label: "the demand gate",
          why: "17 keeps exactly the classes with a real base — Headset 24, Laptop Stand 19, HDMI 2.1 Cable 19, Wireless Mouse 18, Webcam 17 — and cuts the 10- and 11-night tails. A gate of 18 deletes the Webcam's 3989.97 from the shelf report; 11 drags the long tail back in.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-value-first order",
          why: "The shelf report leads with the money: Headset 6888.25, Webcam 3989.97, Studio Mic 3589.61. ASC opens on the HDMI cable's 575.50 — a correct query aimed at the cheapest end of the shelf.",
        },
      ],
      distractors: ["ii.product_id", "p.id", "ii.unit_price", "18", "ASC"],
      walkthrough:
        "A two-table fold where grain is the whole grade. Bookings are already folded inside order_items — one row per folio line, 251 of them — so the join to room classes fans each class to its nights and the three folds read three different grains: COUNT(*) is nights (24 on the Headset class), COUNT(DISTINCT ii.order_id) is bookings folded back through the fan-out, and ROUND(SUM(ii.quantity * ii.unit_price), 2) prices every night at what the stay actually paid — 6888.25 for the Headset, 3989.97 for the Webcam, 1542.77 for the Laptop Stand that moves 19 nights yet earns a third of the Headset's value. GROUP BY the class key folds 16 shelf rows; HAVING >= 17 keeps the five classes with a demand base and drops the 10- and 11-night tails. ORDER BY line_value DESC leads with the money. The distractors each re-grain the read: ii.product_id and p.id collapse every class to 1, unit_price alone reads every multi-unit line low, a gate of 18 deletes the Webcam, and ASC opens the report on the cheapest cable. Nights, bookings, value — three columns, three grains, one fold each.",
    },
    {
      id: "cs-hyatt-4",
      tier: "hard",
      topic: "t6",
      universe: "growth",
      title: "Guest share of market value",
      brief:
        "Hyatt-flavored brief on the storefront db (orders = bookings, customers = World of Hyatt guests, region = market): the loyalty deck's concentration slide shows, per guest, their lifetime value AND their share of their own market's booking value — concentration read inside the market, not against the network. Probed on the db: Alice Chen holds 7262.35 of EU's 15089.23 (48.1%), Emma Wilson holds 6640.56 of the US's 7286.16 (91.1% — the US market is effectively one guest), and Grace Kim holds 4574.23 of APAC's 11605.45 (39.4%). The window keeps every guest row visible while the market total rides beside each — the PARTITION BY fold, not a GROUP BY that collapses the guest list. The board reads the biggest lifetime values first, five to the slide.",
      ask: "Return the top 5 guests by lifetime value with market, bookings, value (2dp) and their share of market value (1dp).",
      template:
        "WITH guest_value AS (\n  SELECT o.customer_id,\n         c.name AS guest,\n         c.region AS market,\n         COUNT(*) AS bookings,\n         SUM(o.total) AS value\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY o.customer_id, c.name, c.region\n)\nSELECT guest,\n       market,\n       bookings,\n       ROUND(value, 2) AS lifetime_value,\n       ROUND({1} * value / SUM(value) OVER ({2} market), 1) AS market_share\nFROM guest_value\nORDER BY lifetime_value {3}\nLIMIT {4};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the percentage promotion",
          why: "The 100.0 enters BEFORE the division so the share computes in real arithmetic — 7262.35 over 15089.23 prints 48.1, not the integer 0 the plain division floors to. The same promotion rule as every conditional share in this kit.",
        },
        {
          answer: "PARTITION BY",
          kind: "keyword",
          label: "the market window",
          why: "SUM(value) OVER (PARTITION BY market) puts each market's total beside every one of its guests — EU's 15089.23 rides next to Alice's row and her 48.1% share reads against her own market. ORDER BY inside the window turns the fold into a running sum and every share becomes a cumulative artifact.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-whale-first order",
          why: "The board leads with Alice Chen's 7262.35, then Emma Wilson's 6640.56. ASC opens on the smallest lifetime value in the book — the loyalty read exists to rank whales, not to start in the footnote.",
        },
        {
          answer: "5",
          kind: "number",
          noVerify: true,
          label: "the slide head",
          why: "The slide carries five guests — the top of the 16-guest ladder. LIMIT narrows what the ORDER BY produced; a head of 3 loses Emma Wilson's 91.1% US story and the concentration slide loses its sharpest example.",
        },
      ],
      distractors: ["10", "ORDER BY", "GROUP BY", "ASC", "3"],
      walkthrough:
        "Two stages, one window, every row kept. The CTE folds lifetime value at guest grain — 103 bookings to 16 folded guests, each with bookings and value attached — because the share's numerator must exist before the window runs. The outer SELECT keeps every guest row and adds the market context as a window: SUM(value) OVER (PARTITION BY market) rides each market's total (EU 15089.23, US 7286.16, APAC 11605.45, LATAM 852.44) beside each of its guests, so the share column divides Alice's 7262.35 by HER market's total — 48.1% of EU — not by the network's 34833.28. The 100.0 promotes the division before it floors. ORDER BY lifetime_value DESC then LIMIT 5 hands the slide its head: Alice 7262.35, Emma 6640.56 (91.1% of a two-guest market — the US IS Emma), Grace 4574.23, Maya 3644.56, Chloe 2667.93. The distractors each break the cut: 10 scales shares to 481.0, ORDER BY makes every share a running artifact, GROUP BY is invalid inside the window's grammar, ASC flips the board to its foot, and LIMIT 3 amputates the slide's best example. Fold per guest, partition per market, rank the whales — the concentration slide in three moves.",
    },
    {
      id: "cs-hyatt-5",
      tier: "medium",
      topic: "x2",
      universe: "month-close",
      title: "The one-pass pace census",
      brief:
        "Hyatt-flavored brief on the storefront db (orders = bookings, status = folio state): revenue management's month-close pack wants the pace census in ONE scan — per month bucket, bookings placed, completed check-outs, no-shows and booking value — so every month reconciles to the network on sight. Probed on the db: 14 buckets from 2024-01 (8 booked, 2 completed, 1 no-show, 3731.97) to 2025-02, with the 9-booking peaks in 2024-02 and 2024-09 and the value trough in 2024-07 (1193.86 on 8 bookings). The census keeps months with at least 6 bookings — the whole 14-bucket spine — and the fold must be conditional: a WHERE that filters any state first shrinks the bucket and the identity 52 + 30 + 14 + 7 = 103 stops reconciling.",
      ask: "Return per month: month key, bookings, completed, no-shows, value (2dp) — calendar order, earliest first.",
      template:
        "SELECT strftime('%Y-%m', created_at) AS month_key,\n       COUNT(*) AS booked,\n       COUNT(*) FILTER (WHERE status = 'delivered') AS completed,\n       COUNT(*) FILTER (WHERE status = {1}) AS noshowed,\n       ROUND({2}(total), 2) AS value\nFROM orders\nGROUP BY month_key\nHAVING COUNT(*) >= {3}\nORDER BY month_key {4};",
      slots: [
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the no-show arm",
          why: "The no-show arm tests the raw status: 'cancelled' is the no-show state, so the arm reads the 1 in 2024-01 and the 2s in 2024-07 and 2024-11. Flagging 'delivered' copies the completed column and the fee desk loses its queue; 'pending' flags the booking window instead.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the value fold",
          why: "ROUND(SUM(total), 2) is the pace value — 3731.97 for 2024-01. AVG prints the per-booking rate where monthly value was promised, COUNT counts bookings into a money column, and MAX collapses each month to its single priciest stay.",
        },
        {
          answer: "6",
          kind: "number",
          label: "the spine gate",
          why: "6 keeps the whole 14-bucket spine — the trough months hold exactly 6 bookings (2024-06, 2024-11, 2025-01) and must stay in the pace read. A gate of 7 deletes the troughs and the value curve flattens exactly where the seasonality argument lives.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the calendar order",
          why: "The spine reads calendar-first: 2024-01 through 2025-02, the '%Y-%m' key sorting correctly as text. DESC opens the pack on 2025-02 and the trend argument runs backwards through the deck.",
        },
      ],
      distractors: ["'pending'", "'delivered'", "AVG", "MAX", "7", "DESC"],
      walkthrough:
        "One scan, four folds, the identity intact. strftime('%Y-%m', created_at) builds the month key — 14 buckets that sort correctly as text — and GROUP BY month_key folds the whole 2024-01-to-2025-02 spine in one pass. Inside the same scan, FILTER (WHERE …) arms read the states side by side: completed counts the 2, 4, 4, 3… delivered check-outs per month, the no-show arm flags 'cancelled' — 1 in 2024-01, 2 in 2024-07, 2 in 2024-11 — and no state is filtered out anywhere, which is why every bucket's arms still sum with pending and shipped to the booked column and the network reconciles to 103 by construction. ROUND(SUM(total), 2) carries the pace value: 3731.97 opening the spine, the 1193.86 trough in 2024-07, 2390.53 closing it. HAVING COUNT(*) >= 6 keeps all 14 buckets — the trough months sit exactly on the gate. ORDER BY month_key ASC reads the spine forward. The distractors each bend the census: 'pending' flags the booking window as no-shows, 'delivered' duplicates the completed arm, AVG and MAX turn monthly value into a rate or a single stay, a gate of 7 amputates the troughs, and DESC runs the argument backwards. One pass, every state, denominators whole — the month-close census as the ops board wants it.",
    },
    {
      id: "cs-hyatt-6",
      tier: "hard",
      topic: "s7",
      universe: "pricing",
      title: "The rate-band census",
      brief:
        "Hyatt-flavored brief on the storefront db (orders = bookings, total = stay value): revenue management bands the book into three rate bands — premium stays at 400 and up, standard at 200 to 399.99, economy below 200 — and wants counts, band rates and no-show flags in one pass. Probed on the db: economy holds 38 bookings at a 109.13 band rate (5 no-shows), premium holds 34 at 625.78 (no no-shows at all — waived fees live in the cheap bands), and standard holds 31 at 303.54 (2 no-shows). The bands are first-match-wins: the premium arm must be tested BEFORE the standard arm or the 400-plus stays get swallowed. The census reads biggest band first and every booking lands in exactly one band.",
      ask: "Return per rate band: band, bookings, band rate (2dp), no-shows — biggest band first.",
      template:
        "SELECT CASE WHEN o.total >= {1} THEN 'premium'\n            WHEN o.total >= {2} THEN 'standard'\n            ELSE {3} END AS band,\n       COUNT(*) AS bookings,\n       ROUND(AVG(o.total), 2) AS band_rate,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS noshowed\nFROM orders o\nGROUP BY band\nORDER BY bookings {4};",
      slots: [
        {
          answer: "400",
          kind: "number",
          noVerify: true,
          label: "the premium edge",
          why: "400 is the published premium edge — 34 bookings at a 625.78 band rate. Set it to 500 and the 400-to-499 stays fall into standard, inflating that band and understating the premium book the owner deck quotes.",
        },
        {
          answer: "200",
          kind: "number",
          noVerify: true,
          label: "the standard edge",
          why: "200 splits standard from economy — 31 bookings at 303.54 above the line, 38 at 109.13 below. Test the 400 edge FIRST: a CASE that tests 200 before 400 swallows the premium band and premium reads zero while the query stays green.",
        },
        {
          answer: "'economy'",
          kind: "keyword",
          label: "the floor arm",
          why: "The ELSE arm names the band below 200 — 'economy', 38 bookings. A misspelled or unquoted label re-bands the floor (unquoted, it parses as a column and errors), and a label reused from another arm merges two bands into one row and the census loses its split.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-band-first order",
          why: "The census reads biggest band first: economy 38, premium 34, standard 31. ASC buries the head under the smallest band and the rate-mix argument opens in the tail.",
        },
      ],
      distractors: ["500", "300", "'standard'", "MIN", "ASC"],
      walkthrough:
        "A CASE census where arm order is policy. The band column is first-match-wins: 400-and-up tests BEFORE 200-and-up, so premium holds its 34 bookings at 625.78, standard holds the 200-to-399.99 slice at 303.54, and the ELSE arm catches everything below 200 as economy — 38 bookings at 109.13. Every one of the 103 bookings lands in exactly one band because the arms are exhaustive and ordered; test 200 first and the premium arm becomes unreachable, printing a premium band of zero while the query stays perfectly green — the misband nobody notices until the rate-mix slide and the owner deck disagree. The no-show flag is a second conditional riding the same pass: SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) reads 5, 0, 2 — and the zero in premium is the finding: no-shows live in the cheap bands, exactly where the one-night fee policy earns its keep. ROUND(AVG(total), 2) is the band rate — rate per booking inside the band, never per night. GROUP BY band folds to three rows; ORDER BY bookings DESC leads with economy. The distractors each rewrite the policy: 500 re-edges premium and misfiles the 400-to-499 stays, 300 splits standard in half, 'standard' as the floor label merges two bands, MIN puts an aggregate where a literal belongs and errors, and ASC reads the census upside down. Ordered arms, one pass, the fee story visible in the flags.",
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
    { slug: "product-sales-analysis-i", why: "The first folio fold: nights and value per room class from raw lines — the entry-level census every brand team runs before anything fancier." },
    { slug: "product-sales-analysis-iv", why: "Per-class reads ranked inside time windows — the pace-by-class cut the flag teams argue over at the weekly review." },
    { slug: "the-category-of-each-member-in-the-store", why: "Classify each guest from folded history — the World of Hyatt tier stamp, applied per guest after the lifetime-value fold." },
    { slug: "calculate-special-bonus", why: "A conditional flag per row — the no-show fee arm and Globalist bonus flags in miniature: THEN the credit, ELSE zero." },
    { slug: "count-salary-categories", why: "Band census with counts per arm — the rate-band roll (economy 38, premium 34, standard 31) as a reusable shape." },
    { slug: "spend-histogram", why: "Bucket the book by spend bands — the histogram behind the 63.5% concentration line, where the whales actually sit." },
    { slug: "number-of-rich-customers", why: "Count guests above a value line — the 3000-plus tier head count (four) that opens every loyalty deck." },
    { slug: "rfm-segmentation", why: "Recency-frequency-monetary staging — the full loyalty segmentation pass, folded per guest before any tiering." },
    { slug: "monthly-transactions-ii", why: "Cancelled-share reads by month with the denominator kept whole — the pace pack's no-show column, one CASE at a time." },
    { slug: "list-the-products-ordered-in-a-period", why: "Room classes moving inside a date window — the group desk's demand list for any arrival month on the spine." },
    { slug: "weather-type-in-each-country", why: "CASE classification rolled per group — the market-level state roll (kept, in-window, no-showed) in drill form." },
    { slug: "sales-by-day-of-the-week", why: "Weekday-mix pivots — the arrival-day grid housekeeping staffs against, one CASE arm per day." },
    { slug: "second-highest-salary", why: "The runner-up fold — second-richest market on the rate card, and the empty-set answer when the base is one row." },
    { slug: "customers-who-bought-all-products", why: "Relational division over the catalog — which guests have booked every room class, folded per guest before comparing." },
    { slug: "repeat-purchase-rate", why: "Repeat share of the base — the 14-of-16 repeat-guest read the loyalty desk prices the ladder on." },
    { slug: "ar-aging-schedule", why: "Receivables bucketed by age — the 6 unpaid owner bills aging toward the dunning calendar, cents divided once." },
  ],
};
