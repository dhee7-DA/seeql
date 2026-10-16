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
// and all 16 problems are theme-curated from the theme menu's sql rows (no w*/d*/f*-initial rows; the
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
    "Preparation strategy: the pools file carries no Skyscanner section — **0 tagged rows** — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: query-fate funnels, two-grain market censuses, ticketing clocks, tie-heavy fare ladders, CASE fare bands, month walks and the cents-safe referral spine. Do the topics in order, then run both case studies against the live storefront db — the screens run on this exact schema, and the census identity (52 + 30 + 14 + 7 = 103) is the fastest way to prove your folds foot.",
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
      slugs: ["immediate-food-delivery-i", "trial-to-paid-funnel", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain market censuses",
      why: "Sessions and traveler accounts are different grains of the same join: the US runs 19 sessions from just 2 accounts while the EU runs 45 from 8. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is load and which is coverage — is the habit the panel grades. The intensity ratio (9.5 versus 5.6) is how a sourcing argument gets won.",
      slugs: ["unique-orders-and-customers-per-month", "top-travellers", "number-of-rich-customers"],
    },
    {
      name: "Ticketing clocks",
      why: "created_at opens the session, shipped_at stamps the ticket, and julianday arithmetic averages the delta over the 82 stamped rows only — 2.98 days with a 2-4 spread. The 21 unstamped sessions (14 price-watch, 7 abandoned) have no clock yet, and averaging them in is the classic silent-dilution bug. DATE() instead of julianday() coerces the delta to a nonsense number.",
      slugs: ["average-time-of-process-per-machine", "second-day-verification", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Fare ladders & tie policy",
      why: "Route SKUs rank by seats sold with ties guaranteed — two SKUs sit at 36 seats, three at 30, three at 21. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer routes, not syntax. Publish the tie policy or the fare-board review relitigates it every month.",
      slugs: ["rank-scores", "top-earners", "second-most-recent-activity"],
    },
    {
      name: "CASE fare-family bands",
      why: "Fare families are CASE-classified: the band fold splits 251 fare lines into 268 sub-55 economy seats at 31.01 and 230 at 115.85, and cabin bands work the same way. Arms must be exhaustive and ordered — a hole in the CASE is a hole in the mix story, and an overlapping WHEN quietly steals rows from the wrong band.",
      slugs: ["calculate-special-bonus", "the-category-of-each-member-in-the-store", "type-of-triangle"],
    },
    {
      name: "Fare-watch month walks",
      why: "The 14-month session spine (2024-01 to 2025-02) is where demand pacing gets defended: prior month beside current, delta rounded, the trough (1,193.86 in July) and rebound named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero. Abandoned sessions cluster in July and November, 2 each of 7.",
      slugs: ["second-day-confirmation", "year-on-year-growth-rate", "biggest-window-between-events"],
    },
    {
      name: "Partner anti-joins & coverage algebra",
      why: "Referral economics run on absence queries: which traveler statements never settled a leg (6 worth 15,217.00), which partners sit below the placement bar. Anti-joins and EXCEPT answer them — but NOT IN over a subquery that can return NULL returns an empty board, and the panel wants the three-valued-logic answer unprompted.",
      slugs: ["customers-who-never-order", "the-airport-with-the-most-flights", "sellers-with-no-sales"],
    },
    {
      name: "Above-the-bar nested gates",
      why: "Screens escalate into staging: fold account or partner totals first, then judge them against a computed bar — the platform's 6.44 mean sessions per account, exactly four traveler accounts clear it. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "One-pass FILTER censuses",
      why: "The ops board gets flown, ticketed, price-watched and abandoned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. COUNT(*) FILTER (WHERE ...) branches per aggregate, SUM(CASE ...) is the portable twin, and four sequential queries are four ways to drift. The reconciliation identity is the correctness argument.",
      slugs: ["active-businesses", "snaps-analysis", "create-a-session-bar-chart"],
    },
    {
      name: "Referral statements & cents discipline",
      why: "Booked is not settled — the finance tables (28 statements, 27 legs, INTEGER cents) are where the referral world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none split (21 / 1 / 6) is one CASE away. The rails matter too: card legs (16, 37,364.00) self-serve; wire legs (11, 32,248.00) partner-invoiced.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
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
  ],
};
