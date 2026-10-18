// Skyscanner — Wave-11 (Task 102), travel domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// Flight-metasearch SQL on the QUERY-FUNNEL angle (distinct from trivago's hotel rate funnels and
// priceline's bundle/attach framing): the storefront db read as a query-to-click-to-ticket sandbox —
// customers are traveler accounts (region = source market), orders are search sessions converting to
// bookings (delivered = flown 52, shipped = ticketed-in-flight 30 with shipped_at as the ticketing stamp,
// pending = price-watch/quote-held 14, cancelled = abandoned-after-quote 7), order_items are segment/fare
// lines (quantity = seats on the line, unit_price = the locked fare — every fare a candidate), products =
// route/fare SKUs (db category codes = fare families), suppliers = airline/OTA referral partners (the
// supplier-share table = partner concentration), invoices = referral statements, payments = settlement
// rails (card = traveler self-serve, wire = partner-invoiced), expenses = platform opex, ledger_entries = GL.
// Finance tables store INTEGER cents — dollar read = amount_cents/100.0; orders.total and
// order_items.unit_price are REAL dollars. The funnel read: 82 of 103 sessions stamped (2.98-day average
// open-to-ticket, 2-4 spread); the concentration read: Nordic 32% + Midwest 26.7% = a two-partner 58.7% grip.
// Pool provenance: company-pools.md carries NO Skyscanner section (0 tagged rows) — all 10 topic slug sets
// and all 32 problems are theme-curated from the theme menu's sql rows (no w*/d*/f*-initial rows; the
// writes/schema/finance bands stay untouched) and say so in brief P4.
// Case briefs quote figures from scripts/company-facts.md (incl. the wave-8+9 canonicalized cells). Two
// probe-derived cell families are declared here so nobody re-probes: (1) per-market ticketing conversion
// shares = 100.0*(delivered+shipped)/sessions from canonical cells — EU 36/45 = 80.0, APAC 29/37 = 78.4,
// US 15/19 = 78.9, LATAM 2/2 = 100.0 (platform 82/103 = 79.6); (2) partner shares to 1dp reproduce the
// facts file's supplier-share pct column (32.0/26.7/13.7/10.4/8.8/8.6) from the canonical revenue fold.
// Design probes ran via bun -e against db/custom.db READ-ONLY (no copies, nothing left behind); every case
// slot is mechanically verified against db/custom.db by scripts/case-audit.ts.
// Accent: text-indigo-400 — held cross-domain by wayfair (ecom) + stripe (fintech), unused by all 24
// travel siblings landed before this kit; domain-unique per the task's verification.
// NOTE for the wave-11 registry wiring agent: skyscanner is NOT yet in registry COMPANY_META (wave-11
// unwired). Wire id "skyscanner", domainId "travel", name "Skyscanner", tagline
// "Flight metasearch: query-to-click funnels, partner share, fare-alert pulse", accent "text-indigo-400"
// to match this header exactly.

import type { CompanyKit } from "../types";

export const skyscannerKit: CompanyKit = {
  id: "skyscanner",
  domainId: "travel",
  name: "Skyscanner",
  tagline: "Flight metasearch: query-to-click funnels, partner share, fare-alert pulse",
  accent: "text-indigo-400",

  brief: [
    "**Skyscanner** is the flight meta-search that answers one question for every airline and OTA at once — ranks every fare a candidate — then hands the click to the winner and monetizes the referral. It never flies anyone anywhere; it wins the query. This kit maps the storefront db onto that world: 16 customers rows are traveler accounts (region = source market), 103 orders are search sessions converting to bookings worth **34,833.28**, and 251 order_items rows are segment/fare lines — quantity = seats, unit_price = the locked fare. The status map is the funnel itself: delivered = {emerald:flown} (52), shipped = ticketed (30), pending = {rose:abandoned after quote} (7), with 14 sessions still {amber:price-watch}.",
    "The data org reads the funnel from three desks. Growth owns the query-to-ticket clock: **82 of 103 sessions** carry the shipped_at stamp, averaging **2.98 days** open-to-ticket with a 2-4 spread — and the 14 price-watch sessions have no stamp and no conversion yet, so *the denominator question is the whole interview*. Partnerships owns the supply side: six airline/OTA referral partners, with Nordic Gadgets AB at 32% of referral value and Midwest Hardware Co at 26.7% — a {violet:two-partner 58.7% grip} that decides every ranking dispute. Finance owns the referral statements: 28 statements, 27 settlement legs, and an exact/partial/none split of 21 / 1 / 6.",
    "Interview screens are live-db and denominator-ruthless. A typical loop opens with a per-market ticketing census — every session a row, every fare a candidate line, converted = status IN ('delivered', 'shipped') — then asks which denominator you used before the share prints: EU converts 36 of 45 sessions while LATAM converts 2 of 2. Then it bends toward supply, where the fold shows **Midwest Hardware** carrying the most segment lines (56) while Nordic carries the most value (11,130.25) — {orange:two grains, one dispute}. Candidates who print a number without stating its population don't advance.",
    "Preparation strategy: the pools file carries no Skyscanner section — **0 tagged rows** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: query-fate funnels, two-grain market censuses, ticketing clocks, tie-heavy fare ladders, CASE fare bands, month walks and the cents-safe referral spine. Do the topics in order, then run the six case studies against the live storefront db — the screens run on this exact schema, and the census identity (52 + 30 + 14 + 7 = 103) is the fastest way to prove your folds foot. This expanded kit is built for spaced practice rather than one sitting: run each case study, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the theory bank below, and treat the walkthroughs as the real content: they narrate the failure each wrong chip causes, which is exactly the muscle the *which denominator did you use* follow-up tests.",
  ],

  dayInLife: [
    "**08:10 —** The day starts with the funnel refresh. A growth analyst opens the conversion board before standup: did overnight ticketing stamps land, does the one-pass fate census reconcile — 52 flown + 30 ticketed + 14 price-watch + 7 abandoned = **103 by construction** — and does the ticketing clock still print **2.98 days** over the 82 stamped sessions? A market whose conversion share drifts off its benchmark gets flagged *before* the partnerships standup, not after. The 14 price-watch sessions carry no clock, and the note says so explicitly: no stamp, no conversion, no cycle.",
    "**11:40 —** Midday is the supply read. The partner-share board re-cuts: Nordic 11,130.25 at 32.0 against Midwest 9,294.93 at 26.7 — and the argument never dies that Midwest carries 56 segment lines to Nordic's 43, so the board shows both grains and settles disputes on value. A regional VP wants the above-the-bar gate — **6.44 mean sessions per account, exactly four traveler accounts clear it** — beside the fare-band re-cut, 268 economy seats at 31.01 against 230 at 115.85. Every ask is one staged query away from the same 251 fare lines, which is the point.",
    "**16:15 —** The afternoon tilts toward money. The AR anti-join refreshes first — **6 never-collected statements worth 15,217.00** — before finance sends a single dunning note; the coverage split reads **21 exact, 1 partial** (4,000.00 of 6,148.00) against net-30 terms and a 28.4-day average settlement; and the anomaly walk names the two liars: void-but-settled #11 (925.00) and paid-status #28 (1,756.00) with zero legs. The EOD note to partnerships is one line: *the rails settled card 37,364.00 against wire 32,248.00 — five statements rode both*.",
  ],

  metrics: [
    { name: "Query-to-ticket conversion", what: "82 of 103 booked sessions reach ticket-or-beyond (delivered 52 + shipped 30) — 79.6 at platform grain. The funnel's headline rate, always shipped with its denominator, because the 14 price-watch sessions belong in a watch base, not this one." },
    { name: "Session fate census", what: "52 flown, 30 ticketed, 14 price-watch, 7 abandoned-after-quote — 103 by construction. Every stage is a conditional count over a status or a timestamp, and the reconciliation identity is the correctness argument the panel listens for." },
    { name: "Market intensity", what: "Sessions beside accounts per source market: EU 45 from 8 (5.6), APAC 37 from 5 (7.4), US 19 from 2 (9.5), LATAM 2 from 1. The two-grain read that decides where sourcing effort lands — the US is load-heavy and account-thin at the same time." },
    { name: "Ticketing clock", what: "created_at to shipped_at over the 82 stamped sessions: 2.98-day average, range 2-4; per market EU 2.94, APAC 2.93, US 3.07, LATAM 3.5. The latency map that opens the insights review — stamped rows only, stated out loud." },
    { name: "Partner concentration", what: "Referral value share across the six-partner bench: Nordic 32.0, Midwest 26.7, Alpine 13.7, Andes 10.4, Shenzhen 8.8, Pacific 8.6 — a two-partner 58.7 grip on the 34,833.28 book. One ranking dispute away from every supply conversation." },
    { name: "Segment-line economics", what: "251 fare lines across 103 sessions (2.44 per session), 498 seats total, max 3 seats on a line. Every fare a candidate: itinerary depth shows up here first, as new line records, not new sessions." },
    { name: "Statement coverage", what: "Billed versus settled: 21 exact statements (65,612.00 both sides), 1 partial (4,000.00 of 6,148.00), 6 never-collected worth 15,217.00 — against net-30 terms and a 28.4-day average settlement, fastest 13, slowest 84. The AR anti-join finance refreshes every close." },
    { name: "Rail mix", what: "Card legs 16 / 37,364.00 traveler self-serve versus wire legs 11 / 32,248.00 partner-invoiced, with 5 statements settling on both rails. The rails read decides who gets dunned and who gets re-invoiced." },
  ],

  topics: [
    {
      name: "Query-fate funnels",
      why: "Every Skyscanner read starts at the session: flown, ticketed, price-watched or abandoned, each a conditional count over a status or a timestamp. The trap is the denominator — 82 of 103 sessions carry the ticketing stamp, and the 14 price-watch rows belong in a watch-completion base, not a conversion base. Say the population out loud before writing the share.",
      slugs: ["immediate-food-delivery-i", "trial-to-paid-funnel", "percentage-of-users-attended-a-contest", "first-last-touch-attribution", "sessionize-events"],
    },
    {
      name: "Two-grain market censuses",
      why: "Sessions and traveler accounts are different grains of the same join: the US runs 19 sessions from just 2 accounts while the EU runs 45 from 8. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is load and which is coverage — is the habit the panel grades. The intensity ratio (9.5 versus 5.6) is how a sourcing argument gets won.",
      slugs: ["unique-orders-and-customers-per-month", "top-travellers", "number-of-rich-customers", "dau-wau-stickiness"],
    },
    {
      name: "Ticketing clocks",
      why: "created_at opens the session, shipped_at stamps the ticket, and julianday arithmetic averages the delta over the 82 stamped rows only — 2.98 days with a 2-4 spread. The 21 unstamped sessions (14 price-watch, 7 abandoned) have no clock yet, and averaging them in is the classic silent-dilution bug. DATE() instead of julianday() coerces the delta to a nonsense number.",
      slugs: ["average-time-of-process-per-machine", "second-day-verification", "users-with-two-purchases-within-seven-days", "immediate-food-delivery-iii", "find-golden-hour-customers"],
    },
    {
      name: "Fare ladders & tie policy",
      why: "Route SKUs rank by seats sold with ties guaranteed — two SKUs sit at 36 seats, three at 30, three at 21. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer routes, not syntax. Publish the tie policy or the fare-board review relitigates it every month.",
      slugs: ["rank-scores", "top-earners", "second-most-recent-activity", "the-most-recent-orders-for-each-product", "usage-tier-percentiles"],
    },
    {
      name: "CASE fare-family bands",
      why: "Fare families are CASE-classified: the band fold splits 251 fare lines into 268 sub-55 economy seats at 31.01 and 230 at 115.85, and cabin bands work the same way. Arms must be exhaustive and ordered — a hole in the CASE is a hole in the mix story, and an overlapping WHEN quietly steals rows from the wrong band.",
      slugs: ["calculate-special-bonus", "the-category-of-each-member-in-the-store", "type-of-triangle", "spend-histogram"],
    },
    {
      name: "Fare-watch month walks",
      why: "The 14-month session spine (2024-01 to 2025-02) is where demand pacing gets defended: prior month beside current, delta rounded, the trough (1,193.86 in July) and rebound named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero. Abandoned sessions cluster in July and November, 2 each of 7.",
      slugs: ["second-day-confirmation", "year-on-year-growth-rate", "biggest-window-between-events", "rolling-average-steps", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "Partner anti-joins & coverage algebra",
      why: "Referral economics run on absence queries: which traveler statements never settled a leg (6 worth 15,217.00), which partners sit below the placement bar. Anti-joins and EXCEPT answer them — but NOT IN over a subquery that can return NULL returns an empty board, and the panel wants the three-valued-logic answer unprompted.",
      slugs: ["customers-who-never-order", "the-airport-with-the-most-flights", "sellers-with-no-sales", "the-change-in-global-rankings", "dormant-reactivation"],
    },
    {
      name: "Above-the-bar nested gates",
      why: "Screens escalate into staging: fold account or partner totals first, then judge them against a computed bar — the platform's 6.44 mean sessions per account, exactly four traveler accounts clear it. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments", "average-selling-price"],
    },
    {
      name: "One-pass FILTER censuses",
      why: "The ops board gets flown, ticketed, price-watched and abandoned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. COUNT(*) FILTER (WHERE ...) branches per aggregate, SUM(CASE ...) is the portable twin, and four sequential queries are four ways to drift. The reconciliation identity is the correctness argument.",
      slugs: ["active-businesses", "snaps-analysis", "create-a-session-bar-chart", "sales-analysis-iii"],
    },
    {
      name: "Referral statements & cents discipline",
      why: "Booked is not settled — the finance tables (28 statements, 27 legs, INTEGER cents) are where the referral world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none split (21 / 1 / 6) is one CASE away. The rails matter too: card legs (16, 37,364.00) self-serve; wire legs (11, 32,248.00) partner-invoiced.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "user-purchase-platform", "running-total-for-different-genders"],
    },
  ],

  theory: [
    {
      id: "skyscanner-t1",
      q: "Your funnel report joins traveler accounts to booked sessions. When do you INNER and when do you LEFT — and what silently breaks if you filter a session column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A conversion census joins sessions to accounts: a session with no account row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A statement-coverage report must be LEFT from accounts: the accounts with no statements ARE the answer, arriving with NULL statement columns. The classic break: filtering shipped_at IS NOT NULL in WHERE after a LEFT JOIN from accounts turns the outer join inner, because the NULL-extended rows fail the predicate — the 21 unstamped sessions delete your whitespace and the board prints a coverage rate over a population that no longer exists. The fix is moving the session filter into the ON clause, or filtering the right-hand table in a staged CTE before the join.",
      tag: "joins",
    },
    {
      id: "skyscanner-t2",
      q: "The route-SKU fare ladder shows two SKUs tied at 36 seats, three at 30, three at 21. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied seats the same rank and skips — after the 36-pair consumes ranks 1 and 2, the next distinct count (33) lands on 3, but after a wider block the gap grows and the board implies phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 1, 1 then 2, 2, 2 — which is the fare-board's house style because reviews argue about peer routes, not arithmetic. ROW_NUMBER breaks every tie arbitrarily and must never ship on a leaderboard without a deterministic tiebreaker. Skyscanner's own boards publish the policy next to the ladder; a candidate who names it before writing the window is the candidate who gets the offer.",
      tag: "windows",
    },
    {
      id: "skyscanner-t3",
      q: "The funnel census needs flown, ticketed, price-watched and abandoned counts from one scan. How do you write it, and where do COUNT(*) versus COUNT(column) bite?",
      a: "One pass, one row per grain, branches per aggregate: COUNT(*) FILTER (WHERE status = 'delivered'), the same for shipped, pending and cancelled — or the portable twin, SUM(CASE WHEN status = '...' THEN 1 ELSE 0 END). The reconciliation identity is the argument: 52 + 30 + 14 + 7 must equal 103, and a CASE arm with a hole shows up instantly as a missing headcount. COUNT(*) versus COUNT(column) bites after LEFT JOINs: COUNT(*) counts the null-extended rows a LEFT JOIN fabricates, while COUNT(right.column) reads NULLs as absent — on the statement-coverage fold that is the difference between a 'none' bucket of 6 and a fake 'partial' bucket of 6. Every-fare-a-candidate means the same session appears on many lines; fold the lines first, then count, or the census double-counts itineraries.",
      tag: "aggregation",
    },
    {
      id: "skyscanner-t4",
      q: "21 of 103 sessions have no shipped_at. How does NULL change your averages, your filters and your joins on this db?",
      a: "NULL is 'no clock yet', not zero — 14 price-watch sessions and 7 abandoned-after-quote sessions have no ticket, and averaging julianday(shipped_at) - julianday(created_at) over them silently dilutes the 2.98-day clock. The guard is shipped_at IS NOT NULL, stated with the population it buys: 82 stamped sessions. Three-valued logic is the second bite: x NOT IN (1, 2, NULL) is never TRUE, so an anti-join over a nullable leg feed returns an empty board with no error — NOT EXISTS is the NULL-safe shape. In arithmetic, NULL propagates: a share fold that COALESCEs a missing leg to 0 is a policy decision (never-collected is 0 settled, not unknown), and on this db that decision is what makes the 'none' bucket read 6 statements worth 15,217.00. COALESCE with intent, and say the policy out loud.",
      tag: "nulls",
    },
    {
      id: "skyscanner-t5",
      q: "Walk the logical order of a SELECT — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — and show where the funnel census breaks when you confuse them.",
      a: "The engine conceptually runs FROM (rows exist), WHERE (rows survive), GROUP BY (groups form), HAVING (groups survive), SELECT (columns compute), ORDER BY (rows sort). Two Skyscanner-shaped breaks: filtering on conversion_pct in WHERE fails because the alias does not exist until SELECT — the share is computed per group after grouping, so it belongs in HAVING or in an outer query; and filtering status in HAVING instead of WHERE scans cancelled groups you should have dropped pre-fold, which is correct but wasteful and signals a candidate who learned the order from an error message. ORDER BY is the one clause allowed to see SELECT's aliases — ORDER BY conversion_pct DESC works, WHERE conversion_pct > 0 does not. Say the order out loud and the panel stops asking.",
      tag: "pipeline",
    },
    {
      id: "skyscanner-t6",
      q: "The partner-share board needs each partner's share of the total book. Scalar subquery, derived table or window — which and why?",
      a: "All three can print Nordic at 32.0 of 34,833.28, and the interview is about staging. The scalar subquery (SELECT SUM(...) FROM order_items) recomputes the grand total per row — fine at six partners, a re-scan of the line-item grain at scale. The derived table or CTE folds referral value per partner first, then the outer query shares it — the shape I ship, because the fold is reusable and the denominator reads as one column. The window is the one-pass answer: SUM(referral_value) OVER () computes the denominator beside each folded row, no second pass, and RATIO_TO_REPORT-style shares fall out of the same scan. The trap to volunteer: a GROUP BY over the outer query after the fold changes the denominator's grain, and an empty inner fold (zero candidate lines) makes every shape return either NULL shares or no rows — say which before they ask.",
      tag: "subqueries",
    },
    {
      id: "skyscanner-t7",
      q: "You need the ticketing clock per month and a 14-month session spine. julianday, DATE or SUBSTR — where does each belong?",
      a: "Clocks are julianday: julianday(shipped_at) - julianday(created_at) is a real fractional-day number, which is why the 82-stamped average prints 2.98. DATE() returns a string, and in arithmetic SQLite coerces it to a year — 2024 — so the average explodes into nonsense; the bug ships silently because the column still looks like a number. Month buckets are SUBSTR(created_at, 1, 7), which turns the spine into sortable 'YYYY-MM' keys across 2024-01 to 2025-02 with no timezone surprises at day grain. For pacing walks, LAG(revenue) OVER (ORDER BY month) beside the current month, delta rounded to 2 decimals — and the first row's LAG is NULL by definition, the baseline, never a zero: COALESCE-ing it fabricates a fake January jump. Use strftime('%Y-%m') when you need explicit formatting; use SUBSTR when the key already IS the key.",
      tag: "dates",
    },
    {
      id: "skyscanner-t8",
      q: "Statement #28 says 'paid' but has zero payment legs, and #11 is 'void' but settled 925.00. How do you build a coverage census that doesn't trust the status column?",
      a: "Status is a claim; legs are the ledger of record — build the census from payments and treat status as a flag to explain anomalies, never as the bucket key. Stage per statement: LEFT JOIN 28 statements to their 27 legs, fold COALESCE(SUM(p.amount_cents), 0) per statement, and classify by arithmetic: legs equal billed is 'exact' (21 — void-but-settled #11 at 925.00 lands here because its one leg matches its billed cents), legs at zero is 'none' (6 worth 15,217.00, including paid-status #28 at 1,756.00 — the status that lies), else 'partial' (1 — 4,000.00 of 6,148.00). The census foots to the AR line, and COUNT(p.invoice_id) matters because COUNT(*) would read the null-extended rows as legs. Every number on the slide is reconstructible from legs alone; that is the standard this db's screens grade.",
      tag: "quality",
    },
    {
      id: "skyscanner-t9",
      q: "Walk me through window frames — when does ROWS versus RANGE change the answer on a rolling board?",
      a: "Both frames bound which rows feed the aggregate. ROWS counts physical rows: ROWS BETWEEN 6 PRECEDING AND CURRENT ROW is always seven rows, so a missing month on the session spine silently stretches the window across eight calendar months and the trend reads smoother than reality. RANGE compares VALUES: the frame widens to every row whose ORDER BY value falls in the interval, which is calendar-true but requires a numeric ORDER BY — a text month key like '2024-07' cannot drive it. The honest answer names the axis first: gaps in the spine mean ROWS lies about the calendar, and the fix is a date spine join so every month exists as a row before the window runs. On dense, gapless data the two agree; the interview question is whether you know what happens on the day they do not.",
      tag: "windows",
    },
    {
      id: "skyscanner-t10",
      q: "Your session-grain revenue SUM doubles after you join fare lines. Walk me through the diagnosis and the fix.",
      a: "Diagnose by counts before touching anything: COUNT(*) on orders alone is 103; on the join to order_items it is 251 — the jump is the fan-out, every session multiplied by its candidate lines. Confirm with GROUP BY order_id HAVING COUNT(*) > 1 to see which sessions carry multiple lines. The fix depends on the grain owed: for session-grain value, fold lines to sessions first (SUM by order_id in a CTE) and then join — or keep the join, compute at line grain, and count sessions with COUNT(DISTINCT o.id) so every ratio names its denominator. The trap to volunteer: SUM(o.total) after the join repeats the booking total once per line, inflating revenue to roughly 2.4x — and a DISTINCT sprinkled on top hides the symptom without fixing the sum.",
      tag: "joins",
    },
    {
      id: "skyscanner-t11",
      q: "On the joined sessions-to-lines table, what do COUNT(*), COUNT(column) and COUNT(DISTINCT column) each return — and when does each matter?",
      a: "COUNT(*) counts rows — after the fan-out, fare lines (251). COUNT(column) counts rows where that column is NOT NULL — on an inner join that is usually the same 251, but after a LEFT JOIN it is the honest count: the null-extended rows a legless statement contributes are invisible to COUNT(p.id) and visible to COUNT(*). COUNT(DISTINCT column) folds the fan-out back to entities: COUNT(DISTINCT o.customer_id) prints traveler accounts (16), COUNT(DISTINCT o.id) prints sessions (103). The funnel board leans on the distinction daily — sessions, lines and accounts are three populations living on the same joined rows, and the interviewer grades whether you say which one each number describes before computing it.",
      tag: "aggregation",
    },
    {
      id: "skyscanner-t12",
      q: "UNION versus UNION ALL on the fate stack — when is the dedupe pass correct business logic, and when is it a silent bug?",
      a: "UNION ALL is raw concatenation — cheap, order-preserving, the honest default when branches are logically disjoint. UNION adds a distinct pass over the combined set, which is correct when overlapping sources would double-count and a silent bug when duplicates are the signal: two branches that coincidentally emit identical (market, counts) rows collapse into one, and nothing announces the loss. Column discipline applies to both — same column count, compatible types, names taken from the first branch — so stack a branch-label column when the provenance matters. My default: UNION ALL plus a comment saying why duplicates are impossible, and UNION only when I can name which duplicated rows I am paying to collapse.",
      tag: "set-ops",
    },
    {
      id: "skyscanner-t13",
      q: "When does a CTE earn its keep in a funnel query, and what does a well-named one buy a growth team?",
      a: "Three concrete buys. Readability: a chain like stamped_sessions, fate_census, per_market reads like the funnel itself instead of nested subqueries, and each CTE is a checkpoint to SELECT from while debugging. Reuse: the session-grain fold is written once and feeds the conversion board, the intensity read and the intensity ratio — three consumers, one definition. Auditability: naming a CTE stamped_sessions forces the definition (shipped_at IS NOT NULL, 82 rows) into the open, which is exactly where Skyscanner's denominator culture wants it. The performance caveat: CTEs are logical staging, not guaranteed materialization — filter early inside each step, and keep the expensive join below the smallest intermediate row count you can get away with.",
      tag: "ctes",
    },
    {
      id: "skyscanner-t14",
      q: "The ops board needs flown, ticketed, price-watched and abandoned in one scan. FILTER or SUM(CASE) — and how do you prove the fold is complete?",
      a: "Both are one-pass conditional counts: COUNT(*) FILTER (WHERE status = 'delivered') is the clean modern shape, SUM(CASE WHEN status = '...' THEN 1 ELSE 0 END) the portable twin — same plan, same numbers, and the ELSE 0 matters because months with no cancellations must print zero, not the NULL that an ELSE-less CASE folds into. The proof of completeness is the reconciliation identity: 52 + 30 + 14 + 7 must equal 103, and a CASE arm with a hole shows up instantly as a missing headcount. Fold at session grain — COUNT(DISTINCT o.id) if the join to lines is in play — and the census reconciles by construction. Four sequential queries are four chances to drift; the identity is the correctness argument.",
      tag: "case-when",
    },
    {
      id: "skyscanner-t15",
      q: "How do you bucket the fare-watch spine into months and cut a peak window without losing its last night?",
      a: "The spine is SUBSTR(created_at, 1, 7) or STRFTIME('%Y-%m', created_at) — either yields sortable 'YYYY-MM' keys from 2024-01 to 2025-02, and the year must ride in the key or January 2024 merges with January 2025. Peak windows are half-open ranges: created_at >= '2024-07-01' AND created_at < '2024-08-01' — the upper bound is next month's start, because BETWEEN '2024-07-01' AND '2024-07-31' is a TEXT comparison that silently drops '2024-07-31 23:59:59', and late-night sessions are exactly the ones that land last. Elapsed time is julianday arithmetic, never DATE subtraction — DATE coerces to a year in math and the clock prints zeros. State the boundary policy before writing the WHERE clause; date bugs are boundary bugs.",
      tag: "dates",
    },
    {
      id: "skyscanner-t16",
      q: "A legless statement settles zero, but is it zero settled or unknown? Where do you draw the COALESCE line on the referral spine?",
      a: "The policy is per-column and stated out loud. For settlement coverage, COALESCE(SUM(p.amount_cents), 0) is the honest read: no legs means zero money moved, and the six never-collected statements print 0 paid against 15,217.00 billed — that zero is a business fact finance acts on. For LAG baselines the opposite policy holds: the first spine row's prior value is genuinely unknown, so its delta prints NULL, and COALESCE-ing it to 0 fabricates a +3,731.97 January jump into nothing. The test I apply: would zero be a defensible claim about the world, or is it a placeholder for 'no row exists'? Settlement legs pass the test; window baselines fail it. A COALESCE you can defend in one sentence is a policy; one you cannot is a fabricated number.",
      tag: "nulls",
    },
    {
      id: "skyscanner-t17",
      q: "Walk the logical evaluation order of a SELECT and show where the funnel census breaks when the clauses are confused.",
      a: "FROM and JOIN assemble rows; WHERE filters them; GROUP BY folds them; HAVING filters groups; SELECT computes output columns including windows; ORDER BY sorts; LIMIT cuts. Two Skyscanner-shaped breaks: WHERE conversion_pct > 75 fails because the alias does not exist until SELECT — the share filter belongs in HAVING or an outer query; and ORDER BY conversion_pct DESC works precisely because ORDER BY runs after SELECT. The subtle one: filtering status in HAVING instead of WHERE still returns the right answer but scans cancelled groups you should have dropped pre-fold — correctness with wasted work, which reads as a candidate who learned the order from an error message. Say the order out loud before writing; it is the cheapest debugging tool the panel watches for.",
      tag: "pipeline",
    },
    {
      id: "skyscanner-t18",
      q: "EXISTS, IN and a derived table all answer 'which partners carry price-watch sessions' — what actually differs, and which do you ship?",
      a: "EXISTS is an existence probe: it short-circuits on the first matching row and never trips on NULLs, which makes NOT EXISTS the NULL-safe anti-join when the board must list partners with no conversions. IN materializes the subquery's values and tests membership — fine for small static-looking sets, fatal for NOT IN over a nullable column, where one NULL poisons every comparison and the board empties with no error. A derived table is neither: it stages a new grain (referral value per partner) the outer query joins to, which is the partner-share board's actual shape. The ship rule I state: EXISTS for presence, IN for curated lists, derived tables or CTEs the moment the subquery contains an aggregate.",
      tag: "subqueries",
    },
    {
      id: "skyscanner-t19",
      q: "Settlement money moves as INTEGER cents. Where do numeric bugs bite, and what is your rounding policy?",
      a: "Three bite points. Scale: payments.amount_cents = 3,736,400 is 37,364.00 dollars, and amount_cents / 100 is integer division — the .0 belongs before the slash, once, at the presentation edge. Mid-pipeline rounding: ROUND inside a calculation discards precision a later SUM still needed — the rail census rounds to 2 only where a human reads it. Float drift: REALs are IEEE doubles, so compare money with a tolerance or stay in integer cents until the last step. The policy I state in review: aggregate in cents, convert once, round at the edge — and prove it with the ledger's trial balance, 181,080 against 181,080, delta zero, which is only checkable because nothing was rounded away en route. A number that survives that chain is a number the partnerships desk will sign.",
      tag: "numbers",
    },
    {
      id: "skyscanner-t20",
      q: "In a growth review you are asked for 'the ticketing conversion rate'. What do you pin down before writing SQL?",
      a: "The definition, in writing, before the FROM clause. Four decisions: the numerator (delivered plus shipped — the 82 sessions carrying the ticketing stamp, not the 52 flown), the denominator (all 103 booked sessions, or a stamped-only base — the two definitions disagree by double digits), the grain (platform or per market, because LATAM's 2-of-2 reads 100.0 and needs its session count beside it), and the window (calendar month, trailing 30 days, lifetime?). Then the discipline move: encode it as a named CTE so the SQL IS the definition — converted AS (COUNT over status IN ('delivered','shipped')) — and the reviewer audits the query instead of arguing with you. Candidates who ship 79.6 with 'booked sessions, delivered plus shipped, month of' attached are the ones who survive the follow-up.",
      tag: "metrics",
    },
    {
      id: "skyscanner-t21",
      q: "What makes a predicate sargable, and which habits keep the funnel board cheap?",
      a: "Sargable means the predicate compares the bare column to a value so an index can drive it. WHERE SUBSTR(created_at, 1, 7) = '2024-07' wraps the column in a function and forces a scan; the sargable twin is created_at >= '2024-07-01' AND created_at < '2024-08-01' — identical rows, index-usable, and no boundary judgment at month ends. The compounding habits: filter early inside each CTE so later stages carry fewer rows; name columns instead of SELECT *; probe with LIMIT before committing to the full run; and aggregate on the smallest table that answers the question instead of joining first and filtering after. On a board that re-runs every standup, these are not micro-optimizations — they are the difference between a refresh that lands before the meeting and one that lands during it.",
      tag: "performance",
    },
    {
      id: "skyscanner-t22",
      q: "How do LAG and LEAD power the fare-watch walk, and where do candidates usually stumble?",
      a: "LAG(column) OVER (ORDER BY month) puts the prior row's value beside the current one — August's revenue with July's 1,193.86 next to it, delta and all; LEAD reads forward for carry-into-next-month reads. Both leave the boundary row NULL, and that NULL is honest: the first month has no baseline, and COALESCE-ing it to zero invents a +3,731.97 January jump that poisons every downstream average. The classic stumbles: filtering the window output in WHERE, which fails because windows run in SELECT — stage the LAG in a CTE and filter outside; and forgetting PARTITION BY when the series is per-market, where one global window smears the EU's February into the US's March. The month walk in this kit is the shape: CTE for the monthly grain, LAG for the baseline, delta arithmetic one level up.",
      tag: "windows",
    },
    {
      id: "skyscanner-t23",
      q: "A stakeholder says the funnel board moved overnight. Which SQL checks do you run in the first ten minutes?",
      a: "Five, in order. Freshness: MAX(created_at) per source table — a feed that stopped at 02:00 explains most surprises by itself. Volume: today's row count versus the 7-day average, because a half-loaded feed halves every downstream number. Keys: GROUP BY the natural key HAVING COUNT(*) > 1 for pipeline-retry duplicates. Orphans: an anti-join of session keys against the account table to catch reference-integrity breaks. NULL spikes: COUNT(shipped_at) versus COUNT(*) — the stamped share falling from 82/103 is itself the story. On this db the ritual is exactly how paid-status statement #28 (1,756.00, zero legs) surfaces: the status column claims one thing, the payment legs prove another. The deliverable is not 'it looks fine' — it is which check passed, and when it last ran.",
      tag: "quality",
    },
    {
      id: "skyscanner-t24",
      q: "Give me three ways to answer 'the top route SKU per market' — and how each behaves on ties.",
      a: "Window argmax: ROW_NUMBER() OVER (PARTITION BY region ORDER BY seats DESC, product_id) = 1 staged in a CTE — one deterministic row per market even when two SKUs tie, because the second key breaks the tie. Join-back on the maximum: join markets to a per-market MAX(seats) derived table — honest, but it returns BOTH tied SKUs, which is either a feature (co-leaders reported) or noise (double-counted markets) depending on the ask. Correlated filter: WHERE seats = (SELECT MAX(…) for that market) — same tie behavior as the join-back, with per-row re-evaluation cost. On this ladder the ties are real — two SKUs at 36 seats, three at 30, three at 21 — so naming the divergence is not academic: ROW_NUMBER decides, join-back reports, correlated simplifies, and the board's tie policy picks which one ships.",
      tag: "joins",
    },
  ],

  mcqs: [
    {
      id: "skyscanner-mcq-1",
      prompt: "An analyst computes per-market ticketing conversion as 100 * SUM(converted) / COUNT(*). The slide prints EU 80 but APAC 78, while the reviewed number is 78.4. Diagnosis?",
      choices: [
        "The CASE fold skipped abandoned sessions — add them back to converted",
        "Integer division: 100 * 29 = 2900 divides by 37 as integers, truncating to 78 before ROUND ever runs — write 100.0 to force the REAL path",
        "COUNT(*) counts fare lines, not sessions — use COUNT(DISTINCT o.id)",
        "ROUND(…, 1) rounds to the nearest ten — use ROUND(…, 2)",
      ],
      answer: 1,
      why: "SQLite divides INTEGER by INTEGER as integers: 2900 / 37 = 78, truncated before rounding. 100.0 * forces REAL arithmetic and APAC prints 78.4. EU survives the bug (3600 / 45 = 80 exactly) — which is exactly why it slips code review.",
      notes: [
        { choice: 0, why: "The conditional fold counted 29 converted sessions correctly. The bug is the division's TYPE, not the filter — swapping filters chases the wrong clause." },
        { choice: 2, why: "COUNT(*) over orders counts sessions per market (37 for APAC). Fare lines live in order_items; counting o.id changes nothing because it is never NULL." },
      ],
      difficulty: "easy",
    },
    {
      id: "skyscanner-mcq-2",
      prompt: "The growth board defines 'converted' as status = 'delivered' and reads 52 of 103. A senior analyst says the funnel rate is 82 of 103. Who is right and why?",
      choices: [
        "52 — shipped sessions have not converted yet",
        "82 — shipped_at is the ticketing stamp: the 30 shipped sessions are ticketed and count as converted; delivered-only drops a third of the converting funnel",
        "95 — pending sessions with a quote held also converted",
        "Both — the definitions differ only by rounding",
      ],
      answer: 1,
      why: "On this db shipped_at is non-NULL exactly for delivered (52) + shipped (30) = 82 sessions — the ticket-or-beyond set. A delivered-only base reports flown conversion, a different metric wearing the same name; state which population you ship.",
      notes: [
        { choice: 0, why: "Shipped sessions carry the ticketing stamp — they converted and are in the air. Dropping them is the denominator drift the 2.98-day clock never lets through." },
        { choice: 2, why: "The 14 pending sessions are price-watch: no stamp, no conversion. Folding them in inflates the base to 95 and deflates the rate twice over." },
      ],
      difficulty: "easy",
    },
    {
      id: "skyscanner-mcq-3",
      prompt: "The supply review wants 'accounts per market' — the US row must read 2 while its session count reads 19. Which fold prints the 2?",
      choices: [
        "COUNT(*)",
        "COUNT(DISTINCT o.customer_id)",
        "COUNT(c.city)",
        "SUM(o.customer_id)",
      ],
      answer: 1,
      why: "The US runs 19 sessions from 2 traveler accounts — intensity 9.5. COUNT(DISTINCT o.customer_id) folds repeat sessions back to accounts; the two columns side by side are the two-grain census every market review opens with.",
      notes: [
        { choice: 0, why: "COUNT(*) echoes the session count (19) into the accounts column — the exact double-grain misprint that makes the intensity read impossible." },
        { choice: 3, why: "SUM adds the id codes together — a nonsense number that still looks plausible on a slide, which is what makes it dangerous." },
      ],
      difficulty: "easy",
    },
    {
      id: "skyscanner-mcq-4",
      prompt: "The fare-band fold splits 251 lines at unit_price 55: 268 sub-55 seats at 31.01, 230 at 115.85. A teammate reorders the WHEN arms so the higher band is tested first. What breaks?",
      choices: [
        "Nothing — the arms are exact complements (< 55 vs >= 55), so evaluation order is irrelevant; what WOULD break is a later arm like < 100 that overlaps and steals rows from the 115.85 band",
        "The 268 and 230 swap places",
        "SQLite requires ascending thresholds inside CASE",
        "The ELSE clause now fires for every row",
      ],
      answer: 0,
      why: "Complementary arms commute; overlapping arms don't. The band fold is safe to reorder only while the arms stay exact complements — the moment a wider threshold shares the CASE, order becomes the correctness argument and the mix stops footing to 498 seats.",
      notes: [
        { choice: 1, why: "Order changes which arm evaluates first, not which rows satisfy which predicate — complementary arms cannot swap populations." },
        { choice: 2, why: "SQLite imposes no threshold ordering on CASE. The real constraint is exhaustiveness and non-overlap, which is a design property, not a parser rule." },
      ],
      difficulty: "medium",
    },
    {
      id: "skyscanner-mcq-5",
      prompt: "The fare board ranks route SKUs by seats sold: two SKUs tie at 36, three more tie at 30, three at 21. The board wants shared rungs with no phantom gaps. Which window?",
      choices: [
        "RANK() OVER (ORDER BY seats DESC)",
        "DENSE_RANK() OVER (ORDER BY seats DESC)",
        "ROW_NUMBER() OVER (ORDER BY seats DESC)",
        "NTILE(4) OVER (ORDER BY seats DESC)",
      ],
      answer: 1,
      why: "DENSE_RANK gives the 36-pair rank 1 and the 30-block rank 2 — shared rungs, no gaps. RANK skips after ties (the 30-block would read 3 and imply a phantom rank), ROW_NUMBER breaks ties arbitrarily, and NTILE forces quartiles nobody asked for.",
      notes: [
        { choice: 0, why: "RANK is the right answer only when the board wants gaps that show how many SKUs sit above — a different, defensible policy, but not 'no phantom gaps'." },
        { choice: 2, why: "ROW_NUMBER fabricates an order inside every tie block. Two reviews of the same board can disagree on which SKU is 'rank 1' — the signature of a broken leaderboard." },
      ],
      difficulty: "medium",
    },
    {
      id: "skyscanner-mcq-6",
      prompt: "The partner-share board computes Nordic's share as 100.0 * referral_value / SUM(referral_value) OVER () and reads 32.0 of the 34,833.28 book. Why the OVER () rather than a scalar subquery over the same tables?",
      choices: [
        "OVER () computes the denominator beside each folded row in one pass over the staged CTE; the scalar subquery re-runs the line-item fold per row",
        "OVER () deduplicates partners; a subquery would not",
        "The two plans are byte-identical — it is pure style",
        "OVER () rounds the share to 1 decimal automatically",
      ],
      answer: 0,
      why: "The share needs the whole folded table as denominator. OVER () over the 6-row CTE computes SUM beside every row in the same scan; the scalar shape re-joins order_items to products to suppliers for each partner. Same digits (32.0 / 26.7 / 13.7 / 10.4 / 8.8 / 8.6), different staging discipline.",
      notes: [
        { choice: 1, why: "The CTE's GROUP BY does the deduplicating. The window frame contributes no row reduction — it contributes a denominator." },
        { choice: 2, why: "At six partners both run instantly; at six million rows the re-scan per row is the difference between a dashboard and a freeze. Plan shape is the interview answer." },
      ],
      difficulty: "medium",
    },
    {
      id: "skyscanner-mcq-7",
      prompt: "The coverage census LEFT JOINs 28 referral statements to 27 settlement legs and buckets exact/partial/none. Why does the 'none' bucket need COUNT(p.invoice_id) and not COUNT(*)?",
      choices: [
        "COUNT(*) counts the null-extended rows a LEFT JOIN fabricates — 6 legless statements would read 1 leg and fall into 'partial'; COUNT(p.invoice_id) reads NULLs as absent and prints 0",
        "COUNT(p.invoice_id) errors when a group has no legs",
        "COUNT(*) and COUNT(p.invoice_id) are identical after a LEFT JOIN",
        "The bucket should come from the statement's status column instead",
      ],
      answer: 0,
      why: "After a LEFT JOIN, every legless statement still produces one row with NULL leg columns. COUNT(*) counts that row; COUNT(p.invoice_id) counts only real legs. The 6 never-collected statements — including paid-status #28 at 1,756.00 — print 0 legs and land in 'none' worth 15,217.00.",
      notes: [
        { choice: 1, why: "COUNT never errors on an empty group — it prints 0. The failure mode is over-counting, not crashing, which is why this bug ships quietly." },
        { choice: 3, why: "Status is a claim, and #28 proves it can lie — 'paid' with zero legs. Legs are the ledger of record; status is a flag to explain anomalies with." },
      ],
      difficulty: "medium",
    },
    {
      id: "skyscanner-mcq-8",
      prompt: "Finance asks which referral statements never settled a leg. A teammate writes WHERE i.id NOT IN (SELECT invoice_id FROM staged_payments) expecting the 6 never-collected statements — the board prints zero rows. The staging feed can emit NULL invoice_id. Best diagnosis?",
      choices: [
        "The anti-join direction is backwards — swap the tables",
        "NOT IN over a subquery that returns NULL never matches anything — three-valued logic: id NOT IN (1, 2, NULL) is never TRUE; write NOT EXISTS (or filter NULLs first)",
        "NOT IN needs DISTINCT to dedupe the subquery",
        "The 6 statements are excluded because their status is 'open'",
      ],
      answer: 1,
      why: "One NULL in the subquery poisons the whole NOT IN: every comparison against NULL is UNKNOWN, so no id survives the filter and the board returns empty with no error. NOT EXISTS checks membership row-by-row and is NULL-safe — the house shape for the 6 / 15,217.00 anti-join.",
      notes: [
        { choice: 0, why: "Direction is fine — statements left, legs right. Swapping sides answers 'which legs have no statement', a different (and emptier) question." },
        { choice: 3, why: "The 6 never-collected include open statements AND the paid-status lie #28 (1,756.00). Filtering on status bakes the claim into the answer — the exact trap the census exists to avoid." },
      ],
      difficulty: "hard",
    },
    {
      id: "skyscanner-mcq-9",
      prompt: "The fare-watch spine walks monthly booked value with LAG: July reads 1,193.86, August reads 2,352.07, delta +1,158.21 — but the first spine row (January, 3,731.97) shows delta +3,731.97. What happened?",
      choices: [
        "The walk double-counted January's sessions",
        "COALESCE(LAG(total), 0) fabricated a zero baseline — January's delta against a NULL prior month should print NULL (or an explicit 'baseline' label), not a fake climb",
        "LAG is missing an ORDER BY on the month",
        "Rounding drifted across the 14-month walk",
      ],
      answer: 1,
      why: "LAG on the first row returns NULL by definition — the baseline, not a zero. Coalescing it to 0 manufactures a +3,731.97 jump into nothing, and every downstream average of deltas inherits the phantom. Print NULL and label the row 'baseline', or exclude it from delta statistics explicitly.",
      notes: [
        { choice: 0, why: "January's revenue is one scan of one month — the fold is fine. The bug is in the delta column's baseline policy, not the aggregation." },
        { choice: 2, why: "The spine walks in month order, so the window's ORDER BY is present — the deltas between real months (+1,158.21 into August) are computed correctly. The tell is only the first row." },
      ],
      difficulty: "hard",
    },
    {
      id: "skyscanner-mcq-10",
      prompt: "A close deck builds 'ticketed but not flown' as stamped-sessions EXCEPT flown-sessions and expects 30 rows. A reviewer warns it prints 0 — or errors on shape. What is the real trap?",
      choices: [
        "EXCEPT is set difference — the 52 flown ids appear in both branches and cancel, leaving exactly the 30 ticketed-only sessions; the traps are column shape (count/order must match) and forgetting that both branches must select the same key grain",
        "EXCEPT returns rows present in both branches — that is INTERSECT's job",
        "EXCEPT keeps duplicates from the left branch, so the answer is 82",
        "The branches must be UNION ALL-ed before EXCEPT can run",
      ],
      answer: 0,
      why: "EXCEPT subtracts the right set from the left: 82 stamped ids minus the 52 that flew = the 30 ticketed-only sessions. The operational traps are mechanical — same column count, same order, same grain on both sides — and EXCEPT's silent dedup, which makes it wrong for multiset counts but right for id-keyed population math.",
      notes: [
        { choice: 1, why: "Intersection answers 'sessions that both stamped AND flew' — the 52, the opposite of the deck's question. Mixing the two operators flips the funnel's meaning." },
        { choice: 2, why: "EXCEPT dedups both branches before differencing — that is why the id-keyed version reads exactly 30. The multiset variant is EXCEPT ALL, and confusing them is the board-drift bug." },
      ],
      difficulty: "hard",
    },
    {
      id: "skyscanner-mcq-11",
      prompt: "The fare-line board adds SUM(oi.quantity) OVER (PARTITION BY p.category) AS family_units to the line-level query. What lands in family_units on every Accessories line?",
      choices: [
        "The Accessories family's total seats — 121 — repeated on every line of the family",
        "A running total that accumulates line by line",
        "That line's own quantity, unchanged",
        "An error — windows cannot mix with a joined query",
      ],
      answer: 0,
      why: "PARTITION BY folds the window's arithmetic to the family without collapsing rows: every Accessories line carries the family total (121 seats) beside its own identity. ORDER BY inside the OVER would have made it a running total; GROUP BY would have collapsed the rows the board needs.",
      notes: [
        { choice: 1, why: "Accumulation needs ORDER BY in the OVER. PARTITION BY alone splits the rows into groups and computes per group — no ordering, no running." },
        { choice: 2, why: "The line's own quantity is just oi.quantity. The window exists to attach the family context (121) to every row without a second query." },
      ],
      difficulty: "easy",
    },
    {
      id: "skyscanner-mcq-12",
      prompt: "Two analysts compute the open-to-ticket clock: one writes julianday(shipped_at) - julianday(created_at), the other DATE(shipped_at) - DATE(created_at). The second prints ~0 for every session. Why?",
      choices: [
        "DATE() returns a string, and in arithmetic SQLite coerces it to its leading number — the year — so 2024 - 2024 = 0",
        "DATE() strips the time, so the difference is always an exact integer day count",
        "The two functions disagree about timezones",
        "julianday() is deprecated and returns NULLs",
      ],
      answer: 0,
      why: "In numeric arithmetic SQLite coerces the text '2024-01-05' to 2024, so same-year pairs subtract to 0 — a silent, plausible-looking column. julianday() returns real fractional days, which is why the 82 stamped sessions average 2.98. The bug ships quietly because zeros read as same-day tickets.",
      notes: [
        { choice: 1, why: "The coercion happens BEFORE the subtraction. DATE() never returns a day count — it returns text that collapses to a year the moment math touches it." },
        { choice: 3, why: "julianday is fully supported. The failure mode is type coercion in the DATE() version, not deprecation in the correct one." },
      ],
      difficulty: "medium",
    },
    {
      id: "skyscanner-mcq-13",
      prompt: "The ops manifest folds each session's route SKUs into one cell: 'Desk Mat Extended, HDMI 2.1 Cable 2m'. Which aggregate builds that?",
      choices: ["GROUP_CONCAT(p.name, ', ')", "CONCAT(p.name, ', ')", "SUM(p.name)", "JOIN(p.name, ', ')"],
      answer: 0,
      why: "GROUP_CONCAT is SQLite's fold-rows-into-a-string aggregate; the optional second argument sets the separator. CONCAT does not exist as a SQLite aggregate, JOIN is not a function, and SUM over text coerces every name to 0 and prints a dead cell.",
      notes: [
        { choice: 1, why: "CONCAT is muscle memory from other engines. SQLite's string-fold aggregate is GROUP_CONCAT — the interview checks you know which dialect you are writing." },
        { choice: 2, why: "SUM coerces text to numeric 0, so the manifest prints 0 — a real cell, wearing the wrong type, on a board someone will screenshot." },
      ],
      difficulty: "easy",
    },
    {
      id: "skyscanner-mcq-14",
      prompt: "A deck stacks per-market stamped and unstamped censuses with UNION, and a reviewer notices one market's row vanished. What happened?",
      choices: [
        "The two branches emitted byte-identical rows for that market — UNION's dedupe pass collapsed them into one with no error anywhere",
        "UNION truncates the stack to the first branch's row count",
        "UNION cannot stack two SELECTs over the same table",
        "UNION reorders rows and loses the market",
      ],
      answer: 0,
      why: "UNION runs a distinct pass across the combined set; identical (market, counts) rows from the two branches collapse into one silently. The discipline is UNION ALL plus a branch-label column and a comment stating why duplicates are impossible — on the full db the stamped/unstamped counts never coincide, but a staging slice can produce twins.",
      notes: [
        { choice: 1, why: "UNION never cuts by count — it deletes only exact duplicate rows, which is worse than truncation because nothing announces the loss." },
        { choice: 3, why: "Ordering is not the failure; the row is gone, not displaced. Re-reading the sorted output cannot recover it." },
      ],
      difficulty: "hard",
    },
    {
      id: "skyscanner-mcq-15",
      prompt: "The route-SKU seat ladder reads 47, 46, 38, 36, 36, … The board wants the second-highest seat count, and it must survive a future tie at the top. Which shape is robust?",
      choices: [
        "MAX over seats filtered below the MAX — or DENSE_RANK() = 2",
        "ORDER BY seats DESC LIMIT 1 OFFSET 1",
        "ROW_NUMBER() = 2",
        "AVG of the top two rows",
      ],
      answer: 0,
      why: "MAX-below-MAX and DENSE_RANK = 2 both return the second DISTINCT value (46) even if two SKUs someday tie at the top. LIMIT/OFFSET and ROW_NUMBER return the second ROW — identical today, wrong the day the 47-tier holds two SKUs. Value-true versus row-true is the entire question.",
      notes: [
        { choice: 1, why: "OFFSET 1 is row-true: with a tied top it returns the tied sibling — still 47 — and calls it second place." },
        { choice: 2, why: "ROW_NUMBER fabricates an order inside tie blocks; 'rank 2' could be either tied SKU depending on the engine's mood. Boards that ship it relitigate monthly." },
      ],
      difficulty: "medium",
    },
    {
      id: "skyscanner-mcq-16",
      prompt: "The rolling ticketing board uses SUM(bookings) OVER (ORDER BY month ROWS BETWEEN 6 PRECEDING AND CURRENT ROW). One month goes missing after a feed outage. What does ROWS do to the window?",
      choices: [
        "It still spans exactly 7 rows, so the window silently stretches across 8 calendar months",
        "It skips the gap and stays 7 calendar months wide",
        "The query errors on the missing month",
        "RANGE would behave identically here",
      ],
      answer: 0,
      why: "ROWS is row-true: six preceding rows present plus today, whatever the calendar says. With a month missing, a '7-session' window spans 8 months of calendar and the trend reads smoother than reality. RANGE is value-true (calendar-true) but needs a numeric ORDER BY; on a text month key the honest fix is a date spine join.",
      notes: [
        { choice: 1, why: "That is RANGE's calendar-true behavior — and RANGE with PRECEDING requires numeric ordering, which '2024-07' text keys are not." },
        { choice: 3, why: "RANGE differs from ROWS exactly when the axis has gaps or ties. The distinction is the answer, not a footnote." },
      ],
      difficulty: "hard",
    },
    {
      id: "skyscanner-mcq-17",
      prompt: "The fare-watch review wants NEXT month's abandoned-after-quote count beside each month's row, to see the carry into the following month. Which window reads forward?",
      choices: [
        "LEAD(abandoned) OVER (ORDER BY month)",
        "LAG(abandoned) OVER (ORDER BY month)",
        "abandoned + 1",
        "LAST(abandoned) OVER ()",
      ],
      answer: 0,
      why: "LEAD reads the next row in the window order; LAG reads the previous. The final month's LEAD is NULL — the honest 'nothing follows yet', the mirror of LAG's baseline NULL on the first row. Direction is meaning: LAG would paste July's abandonment into August's row and call it carry.",
      notes: [
        { choice: 1, why: "LAG pulls history forward. The review asked for the future beside the present — the window order and the function direction have to agree." },
        { choice: 3, why: "LAST is not a SQLite window function. The forward reader is LEAD, and the boundary row's NULL is part of the contract." },
      ],
      difficulty: "easy",
    },
    {
      id: "skyscanner-mcq-18",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) over all 103 sessions returns 2.98 — the same number as the stamped-only query. Why, and what must the slide's label say?",
      choices: [
        "AVG ignores NULLs, so the average runs over the 82 stamped rows — the metric must still be labelled 'stamped sessions only'",
        "AVG treats NULL as 0, diluting the clock to 2.35",
        "The 21 NULL sessions carry shipped_at equal to created_at",
        "AVG errors when any input is NULL",
      ],
      answer: 0,
      why: "NULL inputs are skipped, so the arithmetic never sees the 14 price-watch or 7 abandoned sessions — the 2.98 is real but its population is the 82 stamped. An average that silently shrinks its own denominator is the classic mislabeled-metric trap: the number survives, the claim must be stated.",
      notes: [
        { choice: 1, why: "NULL is not zero. IFNULL-ing the latency to 0 would drag the clock down and invent same-day tickets for sessions that never converted." },
        { choice: 3, why: "Aggregates skip NULLs by design — no error, which is exactly why the population label is the only guard the reader gets." },
      ],
      difficulty: "easy",
    },
    {
      id: "skyscanner-mcq-19",
      prompt: "The partner board re-folds into seven rows instead of six — 'Nordic Gadgets AB' and 'Nordic Gadgets AB ' (trailing space) group separately. Which fix is right?",
      choices: [
        "GROUP BY TRIM(s.name) — normalize the key at the fold",
        "GROUP BY UPPER(s.name) — casing is the real problem",
        "GROUP BY REPLACE(s.name, ' ', '') — remove all spaces",
        "SELECT DISTINCT s.name — let the engine dedupe",
      ],
      answer: 0,
      why: "Padding is whitespace, not casing: TRIM removes the leading/trailing spaces that split the group, and the six-partner board reappears. UPPER leaves the trailing space intact, and stripping every interior space corrupts legitimate multi-word names.",
      notes: [
        { choice: 1, why: "UPPER('Nordic Gadgets AB ') still ends with the space — the fold still splits. The symptom (7 rows) is the diagnostic: count what changed." },
        { choice: 3, why: "DISTINCT after the fold reports the damage instead of repairing the key. Normalize in the GROUP BY, where the groups are actually formed." },
      ],
      difficulty: "medium",
    },
    {
      id: "skyscanner-mcq-20",
      prompt: "Which partners beat the average PARTNER referral value? The fold reads Nordic 11,130.25, Midwest 9,294.93, Alpine 4,765.63, Andes 3,613.25, Shenzhen 3,049.07, Pacific 2,980.15. How many survive HAVING referral_value > (SELECT AVG(referral_value) FROM partner)?",
      choices: [
        "Two — Nordic and Midwest, against a 5,805.55 partner mean",
        "Four — everyone above the 138.78 mean line fare",
        "One — Nordic only, because 11,130.25 is the max",
        "Six — every partner is above average by definition",
      ],
      answer: 0,
      why: "The mean of the six PARTNER values is 5,805.55 — exactly two partners clear it. The trap is averaging the wrong grain: the 138.78 mean line fare is a different denominator, and against it all six partners pass, printing a census that ranks nothing.",
      notes: [
        { choice: 1, why: "That is the line-grain mean (34,833.28 over 251 lines). The gate must average the folded partner column — the scalar subquery sits over the CTE, not the raw lines." },
        { choice: 3, why: "'Everyone is above average' is arithmetically impossible for a mean; the average sits inside its own distribution by construction." },
      ],
      difficulty: "hard",
    },
    {
      id: "skyscanner-mcq-21",
      prompt: "NTILE(4) OVER (ORDER BY seats DESC) runs over the 16 route SKUs. What lands in tile 1?",
      choices: [
        "The top four SKUs — 47, 46, 38 and the first 36-seat SKU",
        "Every SKU above the average seat count",
        "The bottom quartile — NTILE counts from the smallest",
        "An error — 16 does not divide by 4",
      ],
      answer: 0,
      why: "NTILE(4) deals the ordered rows into four near-equal tiles; 16 rows means exactly 4 per tile, and tile 1 holds the biggest because the window orders DESC. It is bucketing, not ranking: tied SKUs can be split across a tile boundary arbitrarily, which is why the fare board ranks first and tiles second.",
      notes: [
        { choice: 2, why: "Tile 1 is the top of the window's ORDER BY; DESC puts the leaders there. The tile number follows the sort, not the seat count." },
        { choice: 3, why: "16 divides evenly here, and when the row count does not divide, NTILE distributes the remainder across the early tiles — it never errors." },
      ],
      difficulty: "easy",
    },
    {
      id: "skyscanner-mcq-22",
      prompt: "The July read runs WHERE SUBSTR(created_at, 1, 7) = '2024-07' and the plan shows a full scan. The same rows are available with a predicate the planner can use. Which?",
      choices: [
        "created_at >= '2024-07-01' AND created_at < '2024-08-01' — the half-open range keeps the predicate sargable",
        "created_at BETWEEN '2024-07-01' AND '2024-07-31'",
        "created_at LIKE '2024-07%'",
        "CAST(created_at AS INTEGER) = 202407",
      ],
      answer: 0,
      why: "Wrapping the column in a function defeats index use; the half-open range compares the bare column and returns the identical row set, including July 31's late-night sessions. BETWEEN on a text timestamp drops anything past '2024-07-31' textually, and LIKE is the same non-sargable pattern scan with different punctuation.",
      notes: [
        { choice: 1, why: "BETWEEN's upper bound excludes July 31's later timestamps — a boundary bug AND a performance habit in one clause." },
        { choice: 3, why: "CAST applies a function to the column: same full scan, plus a comparison that no longer means what it says." },
      ],
      difficulty: "hard",
    },
    {
      id: "skyscanner-mcq-23",
      prompt: "BETWEEN '2024-07-01' AND '2024-07-31' cuts July on TEXT timestamps. Which sessions silently vanish?",
      choices: [
        "Every session with a time component on July 31 — '2024-07-31 14:22:00' sorts after '2024-07-31'",
        "Sessions on July 1",
        "None — BETWEEN is inclusive on both ends",
        "Only rows with NULL created_at",
      ],
      answer: 0,
      why: "Text comparison is lexicographic: '2024-07-31 14:22:00' > '2024-07-31', so the inclusive upper bound still excludes the whole last day's timed rows. Half-open ranges — >= month start AND < next month start — are the professional default that keeps the 14-month spine honest.",
      notes: [
        { choice: 2, why: "The lower bound is fine; the damage is at the upper edge where 'inclusive' compares strings, not dates." },
        { choice: 3, why: "NULL rows fail any comparison, but they are a separate loss — the BETWEEN bug deletes real July 31 rows that were never NULL." },
      ],
      difficulty: "medium",
    },
    {
      id: "skyscanner-mcq-24",
      prompt: "251 fare lines carry 498 seats. What does AVG(quantity) return, and what does it mean?",
      choices: [
        "1.98 — seats per line, the itinerary-depth read at line grain",
        "2.44 — lines per session, the attach headline",
        "498 — the seat book",
        "3 — the deepest single line",
      ],
      answer: 0,
      why: "AVG(quantity) folds to seats ÷ lines = 1.98. The attach headline 2.44 is lines ÷ sessions — both terms different — which is why the interviewer asks you to name numerator and denominator before quoting either. Every-fare-a-candidate means the line grain is the natural one; say which you shipped.",
      notes: [
        { choice: 1, why: "2.44 = COUNT(*) ÷ COUNT(DISTINCT order_id). AVG(quantity) cannot produce it — the denominators (lines versus sessions) differ." },
        { choice: 3, why: "MAX(quantity) returns 3, the deepest single line. AVG is the mean; the max is the outlier the fraud read starts from." },
      ],
      difficulty: "easy",
    },
    {
      id: "skyscanner-mcq-25",
      prompt: "WHERE seat_rank <= 3 on a query that computes seat_rank with RANK() OVER (…) fails. Where does the filter go?",
      choices: [
        "Stage the window in a CTE or subquery and filter the rank in the outer query",
        "Move seat_rank <= 3 into HAVING",
        "Add seat_rank to the GROUP BY",
        "Wrap the window in ROUND()",
      ],
      answer: 0,
      why: "Window functions evaluate in the SELECT stage, after WHERE has already run — the alias does not exist at filter time. HAVING is no better (it runs before SELECT too), so the window output must be staged one level up and filtered outside. The error message is the pipeline order teaching.",
      notes: [
        { choice: 1, why: "HAVING judges group aggregates, and the window is not one yet. Same failure, different clause — the stage order is the lesson." },
        { choice: 2, why: "Adding the rank to GROUP BY changes the grain to 'one row per rank' and still cannot see the window. Staging is the only move." },
      ],
      difficulty: "medium",
    },
    {
      id: "skyscanner-mcq-26",
      prompt: "The monthly walk computes SUM(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled — no ELSE. February 2024, which cancelled nothing, prints NULL in that column. Diagnosis?",
      choices: [
        "With no ELSE the CASE yields NULL for non-matches, and SUM over all-NULL inputs is NULL — add ELSE 0 for honest zero buckets",
        "SUM errors when it sees NULL inputs",
        "February's rows were filtered out before the fold",
        "The alias needs COALESCE in the GROUP BY",
      ],
      answer: 0,
      why: "Missing ELSE means 'ELSE NULL', and a month with zero cancellations folds an all-NULL column into NULL — the hole reads as missing data, not zero. On this spine eight of the fourteen months cancelled nothing, so the walk is mostly holes. The fix is an explicit ELSE 0 (or COALESCE at the edge) so every month prints a countable zero.",
      notes: [
        { choice: 1, why: "SUM ignores NULLs and returns NULL only when NO input survives — the empty-bucket case, not a crash. The silence is what makes it dangerous." },
        { choice: 2, why: "The rows are in the group; their CASE outputs are NULL. The problem is the expression, not the population." },
      ],
      difficulty: "hard",
    },
    {
      id: "skyscanner-mcq-27",
      prompt: "ORDER BY conversion_pct DESC sorts fine, but WHERE conversion_pct > 75 errors. What distinguishes the two clauses?",
      choices: [
        "ORDER BY runs after SELECT and can see its aliases; WHERE runs before and cannot",
        "Aliases only work on numeric columns",
        "WHERE requires the full expression on every engine",
        "ORDER BY aliases are deprecated",
      ],
      answer: 0,
      why: "The pipeline is FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY: the alias is born in SELECT, so only ORDER BY can reliably use it. Filtering on a computed share means writing the expression out in WHERE or staging the query and filtering the output one level up.",
      notes: [
        { choice: 1, why: "Type is irrelevant; the clause's position in the pipeline decides what exists at evaluation time." },
        { choice: 3, why: "ORDER BY aliases are the one universally safe alias use — deprecation is exactly backwards here." },
      ],
      difficulty: "easy",
    },
    {
      id: "skyscanner-mcq-28",
      prompt: "The mix-matrix build needs every market × fare-family combination as a skeleton row BEFORE counts are attached — 4 markets × 7 families. Which join builds it?",
      choices: [
        "CROSS JOIN — the deliberate pairing of every row on each side",
        "INNER JOIN customers to products ON region = category",
        "LEFT JOIN with no ON clause",
        "UNION ALL of both tables",
      ],
      answer: 0,
      why: "CROSS JOIN is the cartesian product used on purpose: 4 × 7 = 28 skeleton rows that LEFT JOINs of actual counts can later zero-fill. Joining on region = category pairs unrelated columns, and UNION ALL stacks 4 + 7 = 11 rows instead of pairing them.",
      notes: [
        { choice: 1, why: "The columns live on different axes; any coincidental equality is noise. The skeleton needs every PAIR, not every match." },
        { choice: 3, why: "UNION ALL appends rows to rows — it cannot produce the multiplication the matrix needs." },
      ],
      difficulty: "medium",
    },
    {
      id: "skyscanner-mcq-29",
      prompt: "The fare-watch spine buckets with STRFTIME('%m', created_at) and January 2024 merges with January 2025. What is the fix?",
      choices: [
        "STRFTIME('%Y-%m', created_at) — the year must ride in the key",
        "STRFTIME('%M', created_at)",
        "SUBSTR(created_at, 6, 2)",
        "CAST(created_at AS TEXT)",
      ],
      answer: 0,
      why: "'%m' alone is month-of-year: '01' collides across years and the 14-month spine collapses to 12 buckets with double-weighted Januaries. '%Y-%m' restores sortable, unique keys — 2024-01 through 2025-02 — which is exactly how this kit's monthly walks are keyed.",
      notes: [
        { choice: 1, why: "'%M' is minutes (00-59) — the classic case-sensitivity trap sitting one character away from the fix." },
        { choice: 2, why: "SUBSTR for the month digits inherits exactly the year-blindness; the key needs the year prefix to be unique." },
      ],
      difficulty: "medium",
    },
    {
      id: "skyscanner-mcq-30",
      prompt: "The deck averages the four market conversion shares — (100.0 + 80.0 + 78.9 + 78.4) / 4 = 84.3 — but the platform share reads 79.6 (82 of 103). Which is the honest platform number and why?",
      choices: [
        "79.6 — the shares must be re-weighted by sessions; LATAM's 2-session 100.0 drags the unweighted mean up",
        "84.3 — the average of market rates IS the platform rate",
        "79.6 is wrong — shares always average cleanly",
        "Neither — take the max market share as the platform figure",
      ],
      answer: 0,
      why: "An average of rates is only correct when every group has equal counts. Weighted by sessions — (100.0×2 + 80.0×45 + 78.9×19 + 78.4×37) / 103 — the platform reads 79.6, which is just the folded 82-of-103 census. The unweighted 84.3 describes a platform where LATAM carries a quarter of the volume.",
      notes: [
        { choice: 1, why: "That arithmetic is exactly the unweighted mean; the session weights are the whole story, and they are what the fold computes for free." },
        { choice: 3, why: "The platform share is computable in one pass — 100.0 × 82 / 103. No averaging of shares is ever needed, which is the tell." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-skyscanner-1",
      tier: "easy",
      topic: "j7",
      universe: "funnel",
      title: "The ticketing funnel census",
      brief:
        "Growth-board memo on the storefront db: Monday's funnel review opens with the ticketing census per source market — every search session a row, converted = status IN ('delivered', 'shipped'), share rounded to 1 decimal, and the population stated on the slide. Probed facts: 103 booked sessions worth 34,833.28; 82 carry the shipped_at ticketing stamp (52 flown + 30 ticketed), and the per-market split reads EU 45 sessions / 36 converted, APAC 37 / 29, US 19 / 15, LATAM 2 / 2. Partnerships wants the cleanest-converting market on top — and the traveler-account count beside it, because 19 sessions from 2 US accounts is a different story than 45 from 8 EU accounts.",
      ask: "Return each market with its booked sessions, converted sessions, ticketing-conversion share to 1 decimal and distinct traveler accounts, highest share first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS sessions,\n       SUM(CASE WHEN o.status {1} ('delivered', 'shipped') THEN 1 ELSE 0 END) AS converted,\n       ROUND({2} * SUM(CASE WHEN o.status IN ('delivered', 'shipped') THEN 1 ELSE 0 END) / {3}(*), 1) AS conversion_pct,\n       COUNT(DISTINCT {4}) AS accounts\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY conversion_pct {5};",
      slots: [
        {
          answer: "IN",
          kind: "keyword",
          label: "the converted arms",
          why: "The converted set is exactly 'delivered' and 'shipped' — 82 sessions. NOT IN flips the fold to the 21 price-watch-plus-abandoned rows (EU reads 9), and no other keyword takes a value list here.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the percentage multiplier",
          why: "The .0 forces REAL division: EU 36/45 prints 80.0 and APAC 29/37 prints 78.4. Bare 100 keeps INTEGER division — APAC truncates to 78 and the drift map stops matching the board.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the session denominator",
          why: "The share's denominator is COUNT(*): booked sessions per market (45/37/19/2) — the number the panel asks you to state. SUM or AVG in that seat is a syntax error on (*).",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the account deduplicator",
          why: "COUNT(DISTINCT o.customer_id) folds repeat sessions back to accounts: EU reads 8, US 2. o.id counts sessions (EU 45), c.region collapses to 1 everywhere — neither is a census of travelers.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the cleanest-first direction",
          why: "The review reads the cleanest converter on top: LATAM 100.0, EU 80.0, US 78.9, APAC 78.4. ASC opens the meeting on the worst-converting market — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["NOT IN", "100", "SUM", "o.id", "c.region", "ASC"],
      walkthrough:
        "One join, one fold, four columns at two grains. The join attaches every session to its account's source market, the CASE inside SUM conditionally counts converted sessions (status IN ('delivered','shipped')), and the share divides by COUNT(*) — the booked-session denominator, not the fare-line count. Ordered by share: LATAM 2 of 2 (100.0), EU 36 of 45 (80.0), US 15 of 19 (78.9), APAC 29 of 37 (78.4) — platform 82 of 103, 79.6. The accounts column runs on a second grain: EU 8, APAC 5, US 2, LATAM 1, which is how the US intensity story (19 sessions from 2 accounts) survives beside its 78.9 share. The distractors each break one thing: NOT IN flips the fold to pending-plus-abandoned (EU 9), 100 forces integer division (APAC truncates to 78), COUNT in the multiplier seat is a syntax error, o.id counts sessions instead of accounts (EU 45), c.region collapses to 1 everywhere, and ASC opens the review on the worst converter.",
    },
    {
      id: "cs-skyscanner-2",
      tier: "hard",
      topic: "t8",
      universe: "supplier",
      title: "The partner-share board",
      brief:
        "Partnerships memo on the storefront db: the quarterly ranking dispute needs the partner-share board — referral value per airline/OTA partner, that partner's share of the 34,833.28 book to 1 decimal, and a value rank, all from one staged fold. Probed facts: Nordic Gadgets AB 11,130.25, Midwest Hardware Co 9,294.93, Alpine Audio GmbH 4,765.63, Andes Naturals SA 3,613.25, Shenzhen Electro 3,049.07, Pacific Textiles 2,980.15 — the share column reads 32 / 26.7 / 13.7 / 10.4 / 8.8 / 8.6. Midwest argues line volume (56 segment lines to Nordic's 43) should move it up the board; the board settles disputes on value share, not line count.",
      ask: "Return each partner with its referral value to 2 decimals, share of the total book to 1 decimal and value rank, biggest share first.",
      template:
        "WITH partner AS (\n  SELECT {1} AS partner,\n         ROUND({2}(oi.unit_price * oi.quantity), {3}) AS referral_value\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  JOIN suppliers s ON s.id = p.supplier_id\n  GROUP BY partner\n)\nSELECT partner,\n       referral_value,\n       ROUND(100.0 * {4} / SUM(referral_value) OVER (), 1) AS share_pct,\n       RANK() OVER (ORDER BY referral_value DESC) AS value_rank\nFROM partner\nORDER BY share_pct {5};",
      slots: [
        {
          answer: "s.name",
          kind: "keyword",
          label: "the partner grain",
          why: "The board's grain is s.name — six airline/OTA partners. s.region re-folds to four markets (EU 15,895.88 at 45.6) and the board loses the partner it exists to rank.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the value fold",
          why: "SUM(oi.unit_price * oi.quantity) is the referral-value fold — Nordic 11,130.25. COUNT reads line counts (Midwest 56) and AVG reads average fares (258.84): both real boards, both wrong money.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the value precision",
          why: "Referral value reports to 2 decimals — 11,130.25, the cell the AR line quotes. ROUND to 0 prints 11,130 and the book stops footing to 34,833.28.",
        },
        {
          answer: "referral_value",
          kind: "keyword",
          label: "the share numerator",
          why: "The share numerator is each partner's folded referral_value. A constant zeroes the column (0 and 1 print 0.0 shares), and text in arithmetic coerces to 0 — the board reads a dead market.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The ranking dispute reads biggest share on top: Nordic 32.0 down to Pacific 8.6. ASC hands the podium to Pacific — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["COUNT", "AVG", "0", "1", "ASC", "s.region"],
      walkthrough:
        "Two stages: fold referral value per partner, then share and rank over the folded rows. The CTE joins fare lines to route SKUs to partners and folds SUM(oi.unit_price * oi.quantity) per partner to 2 decimals — Nordic 11,130.25, Midwest 9,294.93, Alpine 4,765.63, Andes 3,613.25, Shenzhen 3,049.07, Pacific 2,980.15, footing to the 34,833.28 book. The outer query divides each partner by SUM(referral_value) OVER () — the whole folded table as denominator — printing shares 32.0 / 26.7 / 13.7 / 10.4 / 8.8 / 8.6 that match the facts file's share column, with RANK() settling the value order 1 through 6. Midwest's line-count claim (56 lines to Nordic's 43) is a different grain: the board pays on value. The distractors: COUNT folds line counts (Midwest 'wins' at 56), AVG folds average fares (Nordic 258.84), 0 and 1 kill the precision or zero the share column, ASC flips the podium to Pacific, and s.region re-folds the board to four markets where the partner rows vanish.",
    },
    {
      id: "cs-skyscanner-3",
      tier: "easy",
      topic: "s6",
      universe: "month-close",
      title: "The settlement rail census",
      brief:
        "Month-close brief, in-world: the partnerships EOD note opens with the rail split — which settlement legs rode the traveler self-serve rail and which rode the partner-invoiced rail, and how much money each rail actually moved. Probed on the storefront db: 27 settlement legs across 28 referral statements — card 16 legs carrying 3,736,400 cents (37,364.00) and wire 11 legs carrying 3,224,800 cents (32,248.00), with five statements having ridden both rails. Amounts live in the finance tables as INTEGER cents, so the dollar read is amount_cents / 100.0, and the CASE label is what turns a method code into the language the partnerships desk reads.",
      ask: "Return one row per settlement rail: the human rail label, its leg count and its settled dollars to 2 decimals.",
      template:
        "SELECT\n  {1}\n    WHEN p.method = 'card' THEN 'traveler self-serve'\n    ELSE 'partner-invoiced'\n  END AS rail,\n  COUNT(*) AS legs,\n  ROUND({2}(p.amount_cents) / {3}, 2) AS settled_dollars\nFROM payments p\nGROUP BY rail\nORDER BY settled_dollars {4};",
      slots: [
        {
          answer: "CASE",
          kind: "keyword",
          label: "the rail labeler",
          why: "CASE translates the method code into the two rails the desk reads — the first WHEN arm is 'card', the ELSE catches everything else. Any other keyword there is a syntax error; the CASE is what makes the census readable, and its ELSE must be exhaustive because a rail census with an unlabeled bucket is a hole in the close.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the settled-money fold",
          why: "SUM(amount_cents) adds the legs' value per rail — 3,736,400 card cents against 3,224,800 wire cents. COUNT would print the leg counts (16 and 11) wearing a dollars name, and AVG would print the average leg — three real numbers, only one of which is money.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-dollars switch",
          why: "The .0 forces REAL division: 3,736,400 / 100.0 prints 37364.0. Bare 100 keeps INTEGER arithmetic — which happens to divide exactly here, which is exactly why the bug hides until an odd-cent leg lands and the trail balance stops footing by a cent.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the bigger-rail-first direction",
          why: "The note reads the rail that moved the most money first: card 37,364.00 on top, wire 32,248.00 under it. ASC would lead with the partner-invoiced rail — a correct query aimed at the wrong end of the EOD note.",
        },
      ],
      distractors: ["COUNT", "ASC", "p.method", "MAX"],
      walkthrough:
        "One scan of the settlement legs, two CASE branches, one money fold. The CASE reads each leg's method and prints the rail in the desk's language; GROUP BY rail folds the 27 legs into two rows; SUM(amount_cents) carries the value and the /100.0 converts once at the edge — card 16 legs / 37,364.00, wire 11 legs / 32,248.00. The census foots against the day-one facts: 27 legs total, five statements that rode both rails, and a 32,248.00 wire figure that is partner money, not traveler money — the distinction the dunning decision hangs on. The distractors each break differently: COUNT puts the leg counts where the money belongs (16 and 11 reading as dollars); p.method in the CASE seat is a syntax error and in any other seat breaks the fold; MAX prints the single biggest leg per rail (a fraud-read figure, not a settlement figure); ASC leads the note with the quieter rail. The graded habit: label the branches, state the denominator's type, and order by what the reader decides on.",
    },
    {
      id: "cs-skyscanner-4",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The fare-watch revenue walk",
      brief:
        "Growth-board memo, in-world: the fare-watch review walks the 14-month booked-value spine — each month's revenue with the prior month's beside it and the dollar delta — so the pacing narrative writes itself from the table. Probed on the storefront db: 103 sessions from 2024-01 to 2025-02; the walk opens at 3,731.97, troughs at 1,193.86 in July 2024, rebounds to 2,352.07 in August (+1,158.21), and dips again to 1,648.80 in November. LAG carries the baseline; the first month's delta is honestly NULL — no prior row exists, and coalescing it to zero would fabricate a +3,731.97 January jump into nothing.",
      ask: "Return month, revenue, the prior month's revenue and the dollar delta, in chronological order.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY month\n),\nstepped AS (\n  SELECT month, revenue,\n         {1}(revenue) OVER (ORDER BY month) AS prev_revenue\n  FROM monthly\n)\nSELECT month, revenue, prev_revenue,\n       ROUND(revenue - prev_revenue, {2}) AS delta\nFROM stepped\nORDER BY month {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month reader",
          why: "LAG(revenue) walks the window backwards one row — August's prev_revenue is July's 1,193.86, and the delta divides the story from there. LEAD would read forward and hand July August's 2,352.07 as its 'baseline', silently re-labeling the future as history; SUM would pile a running total into the baseline column.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the delta precision",
          why: "Deltas report to 2 decimals — +1,158.21, the August rebound the memo quotes. ROUND to 0 prints 1,158 and every subsequent average-of-deltas inherits the drift; the precision is a money convention, not decoration.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A pacing walk is chronological: ASC keeps 2024-01 on top so each row compares against the row above it. DESC would present the newest month first with its baseline below — the numbers survive, the story doesn't.",
        },
      ],
      distractors: ["LEAD", "SUM", "DESC", "0"],
      walkthrough:
        "Staged windows, twice. The monthly CTE folds 103 sessions into 14 buckets on the SUBSTR month key, rounding revenue to the 2 decimals the book quotes. The stepped CTE layers LAG(revenue) OVER (ORDER BY month) — one row of history beside every month — and the outer SELECT computes the delta against that staged baseline: 3,731.97 opens the walk, July troughs at 1,193.86, August rebounds +1,158.21, November dips to 1,648.80. The first month's prev_revenue and delta are NULL by design: no prior row, no baseline, no invented zero. The two-stage shape matters — window output is not visible to sibling expressions in the same SELECT, so the LAG must land in its own stage before the delta can reference it. LEAD reads the future (July's baseline would be August's rebound); SUM piles a running total into the baseline; ROUND to 0 amputates cents the memo quotes; DESC tells the story backwards.",
    },
    {
      id: "cs-skyscanner-5",
      tier: "medium",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass fate census",
      brief:
        "Growth-board memo, in-world: Monday's funnel review needs the session fate census in ONE pass — flown, ticketed, price-watched and abandoned side by side, reconciling to the 103 booked sessions by construction — because four sequential queries are four ways the numbers drift apart on the slide. Probed on the storefront db: delivered = flown 52, shipped = ticketed 30, pending = price-watch 14, cancelled = abandoned-after-quote 7; the stamped pair (52 + 30) is the 82-session converting funnel behind the 79.6 platform share. FILTER (WHERE …) is the one-pass shape, with SUM(CASE …) as the portable twin — and the reconciliation identity is the correctness argument the panel listens for.",
      ask: "Return one row with four conditional counts: flown, ticketed, price_watch and abandoned sessions.",
      template:
        "SELECT\n  COUNT(*) FILTER (WHERE status = 'delivered') AS flown,\n  COUNT(*) FILTER (WHERE status = {1}) AS ticketed,\n  COUNT(*) {2} (WHERE status = 'pending') AS price_watch,\n  SUM({3} WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS abandoned\nFROM\n  {4};",
      slots: [
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the ticketed arm",
          why: "The ticketed bucket is exactly status = 'shipped' — the 30 sessions in the air with the stamp, quotes included because the fill carries the literal. 'cancelled' would fold the 7 abandoned sessions into the ticketed column and the census would read 30 abandoned, 7 ticketed: same row shape, opposite funnel.",
        },
        {
          answer: "FILTER",
          kind: "keyword",
          label: "the one-pass brancher",
          why: "FILTER (WHERE …) is the clause that lets COUNT branch per aggregate in a single scan — the x2 census shape. Dropping it turns the expression into a bare COUNT with a dangling WHERE fragment and the query stops compiling; the one-pass discipline is what keeps four counts on one shared denominator.",
        },
        {
          answer: "CASE",
          kind: "keyword",
          label: "the abandoned fold",
          why: "The abandoned branch rides the portable twin: SUM(CASE WHEN … THEN 1 ELSE 0 END). Mixing the two styles in one census is deliberate — it proves the analyst can write both and knows the ELSE 0 that keeps a zero month printing zero instead of NULL.",
        },
        {
          answer: "orders",
          kind: "keyword",
          label: "the session table",
          why: "The census lives on orders — one row per booked session. order_items carries the fare lines: its rows fan 103 sessions out to 251 lines and there is no status column to branch on, so the census fails to compile there — a broken FROM is the loudest possible wrong answer.",
        },
      ],
      distractors: ["cancelled", "IN", "order_items", "GROUP BY"],
      walkthrough:
        "One scan, four branches, one identity. FILTER (WHERE …) branches the COUNT per status — delivered 52, shipped 30, pending 14 — and the abandoned arm shows the portable twin, SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), folding the same 7. Read across the row: 52 + 30 is the 82 stamped sessions that carry the ticketing stamp, 14 are still in the price-watch base, 7 abandoned after the quote — and the four columns sum to 103 by construction, which is the proof the fold has no hole. The census is platform-grain on purpose: the per-market cut lives in the conversion census case, and this one exists because the identity argument needs all four fates on one shared denominator. The distractors each break differently: 'cancelled' swaps the ticketed and abandoned populations; IN cannot sit where a literal belongs and breaks the FILTER branch outright; order_items has no status column so the census fails on the FROM; GROUP BY in any of these seats is a syntax error — the census has no groups, only branches.",
    },
    {
      id: "cs-skyscanner-6",
      tier: "medium",
      topic: "t5",
      universe: "catalog",
      title: "The fare-board seat ladder",
      brief:
        "Catalog memo, in-world: the fare board ranks route SKUs by seats sold and publishes its tie policy next to the ladder, because tie-heavy ladders relitigate themselves every review otherwise. Probed on the storefront db: 16 route SKUs carrying 498 seats across 251 fare lines — the ladder reads 47 (Desk Mat Extended, on 24 lines), 46 (Noise-Canceling Headset), 38, then a two-way tie at 36 (Laptop Stand Aluminum, Wireless Mouse M3), 33, 31, and a three-way tie at 30 (Fitness Band X2, Ring Light 14\", Studio Desktop Mic). The board's house policy is shared rungs with no phantom gaps — the 33-seat SKU must read rank 6 after the 36-pair, not a phantom 5-and-7 split — and the cut keeps every SKU at 30 seats or better.",
      ask: "Return each route SKU with its seats and a no-gap share-the-rung rank, keeping every SKU at 30 seats or better, best rank first.",
      template:
        "SELECT p.name AS route_sku,\n       SUM(oi.quantity) AS seats,\n       {1}() OVER (ORDER BY SUM(oi.quantity) {2}) AS seat_rank\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.name\nHAVING SUM(oi.quantity) >= {3}\nORDER BY seat_rank, seats DESC, route_sku;",
      slots: [
        {
          answer: "DENSE_RANK",
          kind: "keyword",
          label: "the no-gap tier function",
          why: "DENSE_RANK gives the 36-pair rank 4 and the 30-trio rank 8 after 33 sits at 7 — shared rungs, no gaps. RANK would stamp the 30-trio rank 9 (1,2,3,4,4,6,7,9,9,9), inventing a missing 8 that no SKU occupies; ROW_NUMBER would split every tie arbitrarily, so two renders of the board disagree.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "Rank 1 must be the 47-seat leader, so the window orders seats descending — and the tie-break sort inside the ladder reads the same way. ASC crowns the 21-seat SKUs; a fare board that promotes the quietest routes is a correct query aimed at the wrong end of the ladder.",
        },
        {
          answer: "30",
          kind: "number",
          label: "the ladder cut",
          why: "HAVING SUM(oi.quantity) >= 30 keeps the ten-SKU top tier — 47, 46, 38, the 36-pair, 33, 31 and the 30-trio — so both tie blocks stay visible in the output and the tie policy can be audited on the page. The threshold judges a per-SKU aggregate, which is why it lives in HAVING, not WHERE.",
        },
      ],
      distractors: ["RANK", "ROW_NUMBER", "ASC", "36"],
      walkthrough:
        "A fold, a cut, and a tie policy on display. The join keys each of the 251 fare lines to its route SKU, GROUP BY folds seats per SKU, and the HAVING gate keeps the 30-and-up tier — ten rows where the two tie blocks (36-pair, 30-trio) both survive. DENSE_RANK OVER (ORDER BY SUM(oi.quantity) DESC) numbers the ladder 1, 2, 3, 4, 4, 6, 7, 8, 8, 8 — shared rungs, no gaps, exactly the published policy; the secondary ORDER BY (seats DESC, name) makes the render deterministic inside every tie block. RANK would jump the 30-trio to 9 and print phantom rungs; ROW_NUMBER would invent an order inside the ties that changes with the wind; ASC turns the ladder upside down; a 36 cut amputates the 30-trio and the second tie policy check with it. The graded habit: publish the tie rule beside the ladder, and make the query the enforcement.",
    },
  ],

  problems: [
    { slug: "sales-analysis-i", why: "Route-SKU referral value beside seats sold is the partner board's first chart — fold fare lines to route grain and rank. This problem drills the exact fold the fare-band report re-cuts weekly." },
    { slug: "queries-quality-and-percentage", why: "Ticketing quality reads as a ratio with a stated denominator — average days beside a percentage of stamped sessions. Same division-discipline drill, Skyscanner flavor." },
    { slug: "classes-more-than-5-students", why: "The HAVING floor is everywhere in sourcing: which route SKUs carry at least N candidate lines, which markets clear a session bar. This problem drills the group-level gate." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-session traveler account is the intensity crown on this db. Argmax with a subquery guard is exactly how the top-of-ladder read is written." },
    { slug: "game-play-analysis-i", why: "First search per account anchors every fare-watch cohort Skyscanner builds. MIN-over-window is the shape." },
    { slug: "immediate-food-delivery-ii", why: "Share of sessions ticketed inside the promised window versus late — the ticketing-SLA read is a conditional rate over a timestamp comparison, exactly this shape." },
    { slug: "combine-two-tables", why: "Traveler accounts LEFT JOINed to referral statements: the whitespace read. A statement with no account is corruption, an account with no statement is a gap — choosing the join type is the business statement." },
    { slug: "confirmation-rate", why: "Session outcomes arrive with gaps — COALESCE turns missing ticketing data into an explicit rate instead of a silent NULL. This drills the funnel-denominator discipline." },
    { slug: "market-analysis-i", why: "Accounts that searched AND converted inside a window is the growth gate — a two-condition population fold with a subquery guard, this problem's exact shape." },
    { slug: "trips-and-users", why: "Abandonment share per source market with the non-eligible accounts excluded — the cancellation read is a two-grain rate fold, metasearch's weekly pulse." },
    { slug: "basket-depth-aov", why: "Fare lines per session beside average session value — 2.44 lines and 338.19 on this db — is the itinerary-depth read this problem drills." },
    { slug: "repeat-purchase-rate", why: "Repeat-session share per market is the price-alert proxy: accounts returning to re-watch a fare. Same conditional-rate shape." },
    { slug: "cohort-repeat-revenue", why: "Fare-watch cohorts converting on later sessions — revenue by first-search month is exactly this problem's cohort walk." },
    { slug: "growth-accounting", why: "New, retained, resurrected, dormant — the traveler-accounting identity that reconciles 16 accounts month over month. LAG status classification, exactly this problem." },
    { slug: "roas-by-campaign", why: "The Ads line (4,570.00 across 14 entries) against referral value by market is the spend-efficiency read — this problem's ratio fold, Skyscanner flavor." },
    { slug: "keep-latest-dedupe", why: "Every-fare-a-candidate means duplicates by design: keep the latest quote per route with a ROW_NUMBER dedupe — the metasearch staple." },
    { slug: "user-purchase-platform", why: "Card and wire are the settlement platforms — five statements rode both rails (card 37,364.00, wire 32,248.00). Counting the sessions present on each platform in one fold is the rail-mix read this problem drills." },
    { slug: "first-last-touch-attribution", why: "Skyscanner monetizes the click-out, so which search introduced a route and which touch preceded the ticket is the core attribution fold — first-touch/last-touch, exactly this shape." },
    { slug: "the-most-recent-orders-for-each-product", why: "Fares move hourly, so the quote cache is keep-latest per route SKU. The newest record per product is a top-N-per-group window — this problem, applied to the fare board." },
    { slug: "immediate-food-delivery-iii", why: "The ticketing SLA read one level stricter: the promised-window share with the actual-versus-promise delta beside the 2.98-day clock. Conditional rates over timestamp deltas, extended." },
    { slug: "sales-analysis-iii", why: "Demand reconciliation across consecutive seasons: which traveler markets booked this window but not the last — the fare-alert cohort read the growth desk runs monthly." },
    { slug: "list-the-products-ordered-in-a-period", why: "Route SKUs quoted inside a half-open window — the fare-availability census the freshness board re-runs every morning. Period filters with boundary discipline, exactly this shape." },
    { slug: "average-selling-price", why: "Average fare weighted by seats sold: SUM(unit_price × quantity) over SUM(quantity) is the weighted-fare fold the fare-band report opens with — a ratio whose numerator and denominator must move together." },
    { slug: "rolling-average-steps", why: "Search volume smoothed over a trailing window takes the noise out of the 14-month spine — the pacing chart growth ships weekly, built on exactly this moving-average fold." },
    { slug: "the-change-in-global-rankings", why: "The partner board's hardest question: who moved — Nordic 32.0 and Midwest 26.7 re-ranked between periods, and the rank-change read explains the gaps. Two period folds, compared." },
    { slug: "spend-histogram", why: "Booking values bucketed into fare bands — the histogram under the 25.47-to-1,088.44 per-session spread. CASE-band bucketing with every bucket accounted for, zeros included." },
    { slug: "usage-tier-percentiles", why: "Fare tiers by percentile cut, not fixed bands: price-competitiveness shelves are defined by where a fare sits in its route's distribution. Percentile windows are the drill." },
    { slug: "running-total-for-different-genders", why: "Cumulative seats by fare family along the ladder — the inventory-depth walk the supply desk reads. Running totals partitioned by category, exactly this shape." },
    { slug: "dormant-reactivation", why: "Fare alerts exist to resurrect dormant traveler accounts — the gap-then-return lifecycle read growth reviews monthly. Presence/absence across periods is the whole query." },
    { slug: "find-golden-hour-customers", why: "The golden-hour window of the 2-4-day ticketing spread: travelers who stamped a ticket in the fast lane. Timestamp-window conditional counts, Skyscanner flavor." },
    { slug: "sessionize-events", why: "A raw click stream becomes sessions by an inactivity rule — search-sessionization is how the 103-session funnel gets built. Gap-and-islands grouping, the metasearch staple." },
    { slug: "dau-wau-stickiness", why: "Daily searchers beside weekly searchers — the stickiness ratio is the fare-alert pulse: are travelers returning to re-watch a fare, or checking once and leaving?" },
  ],
};
