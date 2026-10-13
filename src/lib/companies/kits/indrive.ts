// inDrive — kit 12 of the Ride-hailing & Mobility domain (Batch L, wave 7).
// Peer-to-peer fare-offering ride-hailing: the rider posts a fixed fare,
// nearby drivers accept or pass, and the trip runs at the posted number —
// no surge, no meter. Pool provenance: 0 tagged LC — theme-curated. Every
// problem and topic slug is drawn from the Theme menu in
// scripts/company-pools.md (sql rows), picked to mirror inDrive's known
// screen themes: offer-accept funnels, city-cluster censuses, launch-month
// pacing, HAVING gates at pilot floors, class fare ceilings, driver-cohort
// earnings, settlement books in INTEGER cents.
// Case studies run on the storefront db (db/custom.db) with probed figures
// from scripts/company-facts.md (probed 2026-10-12), mapped honestly:
// orders = fixed-fare offers posted, shipped_at = trip-close stamp on the
// batched ops clock (2.98-day average, 2..4 — a back-office batch stamp,
// not door-to-door minutes), customers = riders, products = vehicle classes
// (price = the class fare ceiling; the 199.99 top is a ceiling and the
// premium band above it is empty by design), category = class family,
// order_items = trip legs under each offer (251 legs on 103 offers),
// suppliers = driver cohorts, region = city cluster, invoices/payments =
// the city billing and driver settlement books (INTEGER cents — divide by
// 100.0). Every case slot is mechanically verified against the live db by
// scripts/case-audit.ts.
//
// Expansion (Task 95-indrive, append-only 3x): brief 6, dayInLife 4, metrics 12,
// topics 15, theory 24 (indrive-t9..t24), mcqs 30 (indrive-mcq-11..30), cases 6
// (cs-indrive-3..6 on t5 / s6 / j5 / t7 families — pairwise distinct, distinct
// from the original j7 / t4), problems 32. New slugs remain theme-curated from
// the same Theme menu in scripts/company-pools.md; the 4 new cases were probed
// and verified against db/custom.db (cells + every distractor×slot substitution
// consequential) and pass scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const indriveKit: CompanyKit = {
  id: "indrive",
  domainId: "mobility",
  name: "inDrive",
  tagline: "Fixed-fare ride-hailing: offers, rides, cities",
  accent: "text-indigo-300",

  brief: [
    "**inDrive** is the peer-to-peer ride-hailing marketplace where the rider names the price first: a {amber:fixed-fare offer} goes out to nearby drivers, a driver accepts, and the trip runs at the posted number. The analytics spine is the offer-accept funnel, and on this kit's proxy ledger it reads 103 posted offers worth **34,833.28** (average 338.19) across 16 riders, with 251 trip legs fanning underneath — 2.4 legs per offer. The status map is the funnel itself: 52 {emerald:completed} at the offered fare (50.5%), 30 en route (29.1%), 14 still awaiting a driver (13.6%), 7 {rose:expired unaccepted} (6.8%).",
    "Two reads define the analyst job here. The {amber:one-pass cluster census}: city ops opens with a single-scan fold per city cluster — offers, accepted, awaiting, expired, fare volume in one GROUP BY (EU: 45 offers, 36 accepted, 6 awaiting, 3 expired, **15,089.23** billed) — because the same fold runs every morning in every launch city. The {sky:supply-side read}: six driver cohorts carry accept capacity, and the top cohort takes 32% of billed volume (11,130.25) — concentration is a supply-risk conversation, not trivia. The launch board runs on a pacing bar: a city counts when its month carries eight-plus offers; LATAM's two-offer pilot (852.44) stays off the board.",
    "Interviews are funnel-first, one-pass-flavored, cents-precise. A screen opens with a warm-up join (attach trip legs to their offer), escalates into a conditional fold — usually `SUM(CASE WHEN …)` or `FILTER (WHERE …)` — then lands on a rate where the denominator is the whole test: accepted ÷ ALL posted offers, awaiting and expired included, or the funnel flatters itself. Settlement rounds go through the books: 28 `invoices` against 27 `payments`, INTEGER cents read as `amount_cents / 100.0`, 6 unsettled claims worth 15,217.00, one of them — #28, 1,756.00 — *marked paid with zero settlement rows*. Follow-ups are spoken aloud: *'is that per offer or per leg?'*, 'does an awaiting offer sit in your denominator?'",
    "Preparation strategy: inDrive has **0 tagged LC** rows in this app's pool, so the kit is **theme-curated** — all 30 topic slugs and 16 problems are hand-picked from the theme menu to mirror fare-offering screens: offer-accept funnels, launch-month pacing, HAVING floors, class fare ceilings, driver-cohort earnings. Then run both case studies on the live db: one rebuilds the {amber:offer-accept funnel} city ops opens with, the other rebuilds the {sky:launch pacing board} the expansion team reads monthly. The bar to clear: name the grain, state the denominator, and gate the NULLs deliberately before you compute anything.",
    "Under the marketplace sit the money books, and they run on INTEGER cents: 28 `invoices` (city billing claims) against 27 `payments` (driver settlement rows), every dollar read as `amount_cents / 100.0`. The coverage census: 21 settled exact (65,612.00), 1 partial (4,000 of 6,148.00), 6 with zero settlement rows (15,217.00) — one of them, #28 at 1,756.00, {rose:marked paid with no rows behind it}, mirror to void-but-paid #11 at 925.00. Settlement runs **28.4 days against 30-day terms** (fastest 13, slowest 84), rails split card 37,364.00 against wire 32,248.00, and the trial balance ties 181,080 = 181,080 — the invariant every close prints before anyone goes home.",
    "How to prep, in four passes. Pass one: the {amber:cluster census} — one-scan conditional folds with reconciling arms, at offer grain, denominators stated before the ratio. Pass two: windows — the rank trio's tie policy on a ledger that ties at 4, 3 and 2 orders, LAG walks whose first row stays NULL, frames named out loud. Pass three: the books — the {sky:settlement queue} rebuilt as an anti-join, cents converted once at the display edge, status columns treated as claims until the rows agree. Pass four: run all six case files on the live db, then say the triple — *grain, denominator, NULL policy* — before writing a single SELECT. Candidates who do this walk into the screen already speaking the interviewer's vocabulary.",
  ],

  dayInLife: [
    "**08:15 —** The day opens on the offer board: overnight posted offers versus accepted-and-moving — 82 of 103 — and the first query is the one-pass cluster census, one scan per city cluster: offers, accepted, awaiting, expired, fare volume in a single GROUP BY. The numbers must reconcile before the standup: accepted arms sum to 82, awaiting to 14, expired to 7, and the leg fan-out (251 legs under 103 offers) says whether yesterday's supply actually answered demand. A drift here is the day's first fire, and the analyst who can write the census *and* the diff against yesterday's fold owns the incident.",
    "**11:00 —** Midday is launch deep-work. The expansion team wants the pacing board: offers per launch month on the 2024-01..2025-02 spine, gated at the eight-offer bar — six months clear it, and 2024-07 is the month that makes the review hard (8 offers, 2 expiries, only **1,193.86** of fare volume). A supply manager wants driver-cohort share of accepted volume — the top cohort carries 32% — and a city GM asks why the awaiting queue climbed from 5 to 6 in their cluster: `SUM(CASE WHEN o.status = 'pending' …)` per cluster, *counted per offer, never per leg*.",
    "**16:30 —** The afternoon is the stakeholder cycle: the launch review walks the pacing board month by month, then the settlement desk takes the books — 28 `invoices`, `amount_cents / 100.0`, six unsettled claims worth 15,217.00, with #28 — the 1,756.00 bill {rose:marked paid with zero settlement rows} — queued beside its mirror, #11, void-but-paid at 925.00. The day closes with the writeup: census reconciliations printed, denominators named, *every funnel number legible at the grain it claims*.",
    "**20:30 —** Month-close is the late shift. The settlement walk goes coverage-class by coverage-class — **21 exact / 1 partial / 6 none** — and the partial (#25, 4,000 of 6,148.00) gets its chase note while #28's {rose:paid-with-no-rows} flag goes to the city ledger owner with the anti-join attached as evidence. The rails mix drops into the treasury read — card 16 rows / 37,364.00 against wire 11 / 32,248.00, *wire carries the bigger average claim* — the ledger tie prints one last time, 181,080 = 181,080, and the EOD writeup closes the loop: every number on the board carries its denominator, and anything that can't name one comes off the board.",
  ],

  metrics: [
    { name: "Accept-and-move share", what: "Offers with a driver en route or completed ÷ ALL posted offers: 82 of 103 (79.6%). Awaiting and expired stay in the denominator — the funnel never gets to flatter itself." },
    { name: "Cluster funnel census", what: "Per cluster in one pass: EU 45 offers / 36 accepted / 6 awaiting / 3 expired / 15,089.23; APAC 37 / 29 / 5 / 3 / 11,605.45; US 19 / 15 / 3 / 1 / 7,286.16; LATAM 2 / 2 / 0 / 0 / 852.44." },
    { name: "Offer-expiry share", what: "Expired-unaccepted ÷ posted: 7 of 103 (6.8%) — EU 3, APAC 3, US 1, LATAM 0. The no-accept signal driver-supply reviews chase weekly." },
    { name: "Awaiting-driver queue", what: "Pending offers: 14 (13.6%) — EU 6, APAC 5, US 3. The live supply gap: an offer waiting is a rider deciding between you and the metered alternative." },
    { name: "Trip-close latency", what: "Offer-to-close stamp on the batched ops clock: 2.98-day average over the 82 stamped offers, range 2..4. The proxy clock reads batch back-office, not minutes — say so or the number lies." },
    { name: "Class fare ceiling", what: "Vehicle classes top out at 199.99 and the premium band above 200 is empty by design: 8 mid classes (avg 111.50), 8 budget (avg 32.06). Ceilings, not market prices." },
    { name: "Driver-cohort concentration", what: "Share of billed volume by cohort: the top cohort carries 32% (11,130.25), the next 26.7%. Supply and renewal risk live in this fold." },
    { name: "Rider concentration", what: "63.5% of fare volume comes from riders whose lifetime spend crosses 3,000. Launch cities are won on the head and watched on the tail." },
    { name: "Settlement coverage classes", what: "One-pass classification of the 28 claims: 21 exact (65,612.00), 1 partial (4,000 of 6,148.00), 6 with zero settlement rows (15,217.00). The queue the settlement desk chases IS the non-exact arm, worst first." },
    { name: "Payment rails mix", what: "Card: 16 settlement rows, 37,364.00. Wire: 11 rows, 32,248.00. Fewer, bigger wire claims — the rails split drives chase cadence and the float forecast." },
    { name: "Terms-vs-reality gap", what: "30-day invoice terms vs 28.4-day average settlement, fastest 13, slowest 84. The average reads healthy; the 84-day tail is the collections conversation." },
    { name: "Ledger proof", what: "Trial balance 181,080 = 181,080, cash 44,196, AR 16,440 — the invariant printed at every close. When a tie breaks, the deliverable is the query that shows WHICH rows disagree." },
  ],

  topics: [
    {
      name: "Offer-accept funnels",
      why: "Every city review opens with the funnel: offers posted, accepted (en route + completed), awaiting, expired — counted per cluster without letting the leg fan-out double anything. inDrive drills which grain the query stands on before any aggregate runs, because a rate computed at leg grain prices a leg, not an offer.",
      slugs: ["percentage-of-users-attended-a-contest", "immediate-food-delivery-i", "number-of-rich-customers"],
    },
    {
      name: "One-pass conditional folds",
      why: "The census runs every morning, so it runs in ONE scan: SUM(CASE WHEN …) arms per status with branch totals that reconcile back to COUNT(*). inDrive treats the fold as standing infrastructure — four scans cost four table reads where one conditional fold costs one, and one fold guarantees every arm describes the same 103 offers.",
      slugs: ["active-businesses", "find-stores-with-inventory-imbalance", "find-books-with-polarized-opinions"],
    },
    {
      name: "Cluster joins & two-sided keys",
      why: "Riders post offers in one table and drivers answer in the flow — attaching an offer to its cluster is an FK join whose wrong key silently cross-products. The drills pair tables where a missing side (a rider with no offers, a cohort with no accepts) is a finding to prove, not noise to drop.",
      slugs: ["trips-and-users", "combine-two-tables", "employees-with-missing-information"],
    },
    {
      name: "Rates with honest denominators",
      why: "Accept share, expiry share, awaiting share — inDrive's ratios punish integer division and quiet denominator drift. The house habit: 100.0 before the division, the denominator's population decided BEFORE the ratio, rounding only at the very end.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "hopper-company-queries-ii"],
    },
    {
      name: "HAVING gates & pilot floors",
      why: "Launch boards gate on volume: clusters (or months) below the floor stay off the board, and the floor is a business number — the US cluster's 19 offers IS the floor in this kit's case. WHERE can't see the fold, so the gate is HAVING, and the threshold is stated next to the gate.",
      slugs: ["classes-more-than-5-students", "number-of-employees-who-met-the-target", "article-views-ii"],
    },
    {
      name: "Month spines & launch pacing",
      why: "Expansion reads calendars: offers per launch month on the 2024-01..2025-02 spine (14 buckets), the 1,193.86 July trough against the 3,731.97 January open. '%Y-%m' builds the spine; '%m' alone folds January 2024 into January 2025 and the pacing curve becomes fiction.",
      slugs: ["monthly-transactions-i", "hopper-company-queries-i", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "Class bands & CASE tiers",
      why: "The fleet prices in ceilings: 8 budget classes under 50 (avg 32.06), 8 mid classes to 199.99 (avg 111.50), and the premium band above 200 empty by design. CASE tiering — with the boundary row landing where the spec says — is how the board reads the shelf without inventing a premium story.",
      slugs: ["triangle-judgement", "the-category-of-each-member-in-the-store", "count-salary-categories"],
    },
    {
      name: "Driver-cohort leaderboards",
      why: "Rank cohorts by accepted volume or earnings and ties are waiting — this ledger ties at 4, 3 and 2 orders. The rank trio is a policy conversation: DENSE_RANK for peer ladders, RANK for rungs-with-gaps, ROW_NUMBER only behind a named deterministic tie-breaker.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Trip-close windows",
      why: "The close stamp lands on the batched ops clock: JULIANDAY(close) - JULIANDAY(posted) over the 82 stamped offers, 2.98-day average, 2..4 range. The drill is the NULL gate — an unstamped offer has no lag, not zero lag — and the window boundary that decides 'inside' versus 'outside' the clock.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Settlement & cents discipline",
      why: "Driver payouts and city billing live in INTEGER cents: every dollar read is amount_cents / 100.0, and the missing .0 floors every odd-cent bill. The reconciliation culture is row-level: 6 unsettled claims (15,217.00), one void-but-paid (925.00), one paid with zero settlement rows (1,756.00).",
      slugs: ["bank-account-summary-ii", "customer-order-frequency", "generate-the-invoice"],
    },
    {
      name: "Set-op stitching & reconciliation boards",
      why: "City ops stitches boards: the accepted census stacked on the expired census, labeled per arm, and the stitched result must reassemble the 103-offer base or the report is hiding a drift. UNION ALL is the stitch — UNION's dedupe silently merges legitimately identical rows from two different populations — and EXCEPT answers the mirror question (who posted but never completed). The drills stack two SELECTs with a literal label column and make the column contract explicit.",
      slugs: ["monthly-transactions-ii", "league-statistics", "count-apples-and-oranges"],
    },
    {
      name: "Window frames & running math",
      why: "The rolling reads — running fare volume across the month spine, rolling demand curves at day grain — live or die on the frame clause: the default RANGE frame lumps ordering peers into one jump the moment the spine carries ties. The drills force the frame decision (ROWS versus RANGE), the running-sum shape, and the moving average whose edge rows stay NULL-honest. inDrive's morning board runs these windows daily; a silent default frame is a curve that lies politely.",
      slugs: ["find-cumulative-salary-of-an-employee", "running-total-for-different-genders", "restaurant-growth"],
    },
    {
      name: "Subquery shapes & scalar benchmarks",
      why: "Screens escalate from the fold to the benchmark: each cluster against the ledger-wide average, each offer against its class ceiling, each rider against the pilot floor — comparisons WHERE and HAVING cannot do inline. The drills move through the shapes — scalar benchmarks, IN-lists built from folds, EXISTS tests, derived tables staged once — and each shape's failure mode, from the multi-row scalar error to the silent NULL drop. Knowing which shape to reach for is the interview's real question.",
      slugs: ["department-highest-salary", "game-play-analysis-iv", "managers-with-at-least-5-direct-reports"],
    },
    {
      name: "NULL policy & empty-set edges",
      why: "Launch cities make empty sets routine: a staging city folds to zero offers, a rider's first month has no prior to lag from, an unstamped offer has no latency. The drills pin the empty-set rules — COUNT returns 0, SUM and AVG return NULL, x/0 returns NULL silently in SQLite — and the display-versus-measure COALESCE discipline. The candidate who can say what a hole MEANS (no data, not zero) is the one whose dashboards don't lie at the edges.",
      slugs: ["replace-employee-id-with-unique-identifier", "the-latest-login-in-2020", "biggest-single-number"],
    },
    {
      name: "KPI definitions & rate governance",
      why: "inDrive's KPI wall is definition-heavy: response rate, completion-of-accepted, expiry share — each a named denominator, and each one a trap when the label drifts. The drills compute rates where the denominator is the whole test (ads-style CTR shapes, confirmation rates, funnel-step conversion) and force the habit of printing the denominator beside every rate. The company twist: at a fixed-fare marketplace the funnel flatters itself the moment awaiting offers leave the denominator.",
      slugs: ["ads-performance", "reported-posts-ii", "funnel-step-conversion"],
    },
  ],

  theory: [
    {
      id: "indrive-t1",
      q: "An offer has multiple trip legs under it — 251 legs on 103 posted offers. What does COUNT(*) count after the join, and how do you keep the funnel honest?",
      a: "After the join, COUNT(*) counts LEGS — the fan-out multiplies every offer by its leg count, and a 'posted offers' column that prints 251 is a leg census wearing the wrong name. The honest funnel names one row per what for every aggregate: COUNT(*) on the offers table (or COUNT(DISTINCT offer_id) after the join) counts offers; COUNT on the leg side counts legs; and the ratio between them — 2.4 legs per offer — is itself the multi-stop signal, not noise to dedupe away. The trap that catches candidates is blending grains in one query: SUM of leg fares divided by COUNT(*) of legs prices a leg, not an offer. Say the grain out loud per column, per query — at inDrive the fan-out is a feature of the marketplace, and the funnel is only truthful when every column announces what a row is.",
      tag: "joins",
    },
    {
      id: "indrive-t2",
      q: "The morning census reports offers, accepted, awaiting, expired and fare volume per city cluster. Why build it as one conditional fold instead of four separate scans — and what must the arms do at the end?",
      a: "One pass because the census is standing infrastructure: the same fold runs every morning over the same table, and four scans cost four table reads where one conditional fold costs one. The idiom: SUM(CASE WHEN status IN ('delivered','shipped') THEN 1 ELSE 0 END) for accepted, SUM(CASE WHEN status = 'pending' …) for awaiting, SUM(CASE WHEN status = 'cancelled' …) for expired — every arm computed inside the same GROUP BY, so all of them describe the SAME population of offers. The contract at the end: arms reconcile — accepted (82) plus awaiting (14) plus expired (7) sums back to COUNT(*) (103) — because a census whose arms don't reassemble the base is a guess with formatting. FILTER (WHERE …) is the equivalent one-scan idiom; the discipline is identical: one fold, one population, reconciliation printed next to the numbers.",
      tag: "aggregation",
    },
    {
      id: "indrive-t3",
      q: "The accept-and-move share is 82 of 103 posted offers. Where does the status rule live in the query, and what does the number become if awaiting and expired offers are filtered out first?",
      a: "The status rule is a ROW-level fact used as the numerator, so it lives inside a conditional aggregate: SUM(CASE WHEN status IN ('delivered','shipped') THEN 1 ELSE 0 END) over ALL posted offers, divided by COUNT(*) from the same fold — 82 of 103, 79.6%. Filter to 'resolved' first and the denominator shrinks to 89; filter to delivered-only and it's 52 — real numbers, different metrics, wrong names. That's denominator drift, and at a fixed-fare marketplace it's political: a share that quietly drops awaiting offers makes supply look faster than it is, because the 14 riders still waiting are exactly the supply-gap signal ops needs. The sibling trap is HAVING — it judges group aggregates after the fold, when the excluded offers are already inside every cluster's total. The strong answer states the pipeline order and asks of every filter: fact about one row, or about a group?",
      tag: "aggregation",
    },
    {
      id: "indrive-t4",
      q: "Rank driver cohorts by accepted volume and three cohorts tie. RANK, DENSE_RANK or ROW_NUMBER for the supply board — and where does the tie-breaker belong?",
      a: "The rank trio is a business decision about shared rungs and gaps. RANK shares the rung and skips — after a tie at rank r the next distinct value lands at r+1·(tied rows), implying phantom cohorts between the tie and the tail. DENSE_RANK shares rungs without gaps — the compact ladder a supply board wants, where tied cohorts visibly read as peers. ROW_NUMBER splits ties arbitrarily — a silent judgment call decided by scan order rather than policy. On a ledger like this one ties are structural (order counts repeat at 4, 3 and 2), so the policy ships WITH the query: DENSE_RANK for peer ladders, or a named deterministic tie-breaker written into the window's ORDER BY — accepted volume DESC, cohort name ASC — so the board is reproducible. The wrong answer is picking a function; the right answer is picking a policy and labeling it in the header.",
      tag: "windows",
    },
    {
      id: "indrive-t5",
      q: "Benchmark each city cluster's expiry share against the ledger-wide average using a scalar subquery. What breaks when the comparison cluster is an empty staging city?",
      a: "The shape: 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) > (SELECT the same fold computed ledger-wide) — an aggregate against an aggregate, which a WHERE or HAVING can't do inline. It breaks two ways. First, the empty staging city: the inner fold over a city with zero offers yields NULL, the comparison becomes UNKNOWN, and HAVING passes nothing — a valid query that ships an empty slide, which is worse than a crash because the deck LOOKS finished. Second, the reverse: a cluster compared against a ledger average that includes itself — the benchmark moves as the row moves. The disciplined version stages the ledger-wide average once (CTE or scalar with its population stated), guards the empty case explicitly, and says whether the cluster is inside or outside its own benchmark. At inDrive, pre-launch city staging makes the empty case routine — the inner fold's population is part of the deliverable.",
      tag: "subqueries",
    },
    {
      id: "indrive-t6",
      q: "21 of 103 offers have no close stamp yet. What is your NULL policy for the trip-close latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped offers have a latency, so the report measures the 82 stamped offers of 103 and says so — the 14 awaiting and 7 expired have no lag, not zero lag. Then mechanics: AVG ignores NULLs, so AVG(lag) over ALL offers returns the stamped-only average (2.98 days) with a silently shrunken population — a real number wearing the wrong name, unverifiable from the header. COUNT(stamp) counts the stamped subset; the gap between it and COUNT(*) IS the outstanding count, which is a feature — the awaiting queue is operational data. What is never acceptable is IFNULL-ing the lag to zero to 'fix' the average: that folds 21 phantom zero-lag offers into the mean and publishes instant trips for offers nobody accepted. The gate lives in WHERE (close_stamp IS NOT NULL) with the population named in the header — and remember this ledger's clock is a batched back-office stamp, so 2.98 'days' is batch cadence, not ride time; the honest framing is part of the number.",
      tag: "nulls",
    },
    {
      id: "indrive-t7",
      q: "The launch review buckets offers by month. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', posted_at) — year plus zero-padded month, 14 buckets on this ledger from 2024-01 to 2025-02; '%m' alone folds January 2024 into January 2025 and the pacing curve becomes fiction. The quarter window: half-open intervals — posted_at >= '2024-01-01' AND posted_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's offers, and month-boundary nights are exactly when late-night fare-offering demand lands. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first delta is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month in a launch walk. Date discipline is launch discipline: the spine, the window and the edge row are where expansion reports go wrong.",
      tag: "dates",
    },
    {
      id: "indrive-t8",
      q: "The settlement desk says a bill is marked paid but has no settlement rows behind it. Walk me through the reconciliation query you write first — and the cents rule you never break writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this book that returns 6 bills worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why the settlement rows are the ledger of record and the status column is a claim. Then the mirror check: a void bill WITH a settlement row (this book has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The cents rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 is integer division, it floors every odd-cent bill, and at driver-payout scale the driver audits line by line. Reconciliation culture: counts and sums must agree between the ops ledger and the settlement run, and when they do not, the query that shows WHICH rows disagree is the deliverable.",
      tag: "quality",
    },
    {
      id: "indrive-t9",
      q: "The board wants a running fare-volume curve across the launch-month spine: SUM(o.total) OVER (ORDER BY launch_month), no frame clause. What did the engine just decide for you — and when does that default bite?",
      a: "With ORDER BY and no frame clause, the engine substitutes RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE treats ordering PEERS as one unit. On a unique month key ('%Y-%m' spine, 14 distinct buckets) the default is harmless: no row shares another's key, so the running sum advances row by row. The bite comes when the spine is re-keyed — a day-grain demand curve where two offers post the same timestamp, or an hour-grain curve during a launch spike: RANGE lumps each peer group into one step and the curve jumps in lumps while the reader assumes steady increments. The fix is stating the contract explicitly — ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and if you'd skipped ORDER BY entirely, the frame becomes the whole partition and every row carries the grand total. At inDrive the rolling reads are standing infrastructure, so the frame is written down next to the query; a default the engine chose silently is a semantics decision you didn't know you made.",
      tag: "windows",
    },
    {
      id: "indrive-t10",
      q: "Stitch the accepted-offers board and the expired-offers board into one report. UNION or UNION ALL — and what contract do the two arms have to honor?",
      a: "UNION ALL, unless dedupe is the explicit requirement. UNION sorts and hashes the combined output to collapse duplicates — slower, and worse: it silently merges two legitimately identical rows from DIFFERENT populations, so an accepted line and an expired line that print the same cluster-and-count pair collapse into one and the stitched report no longer sums to the base. UNION ALL concatenates, which is what a stitch wants — two populations, each carrying a literal label column ('accepted' / 'expired') so the consumer can tell the arms apart. The contract: same column count, compatible types position for position, and if you ORDER BY, it orders the combined result — put the label first. The reconciliation habit that closes it at inDrive: the stitched arms must reassemble the fold's base — 82 accepted plus 7 expired (plus the 14 awaiting if they're on the board) back to 103 — because a set op whose arms don't reassemble the population is hiding a drift somewhere in the WHERE clauses.",
      tag: "set-ops",
    },
    {
      id: "indrive-t11",
      q: "Which riders posted offers last quarter but never got a single one completed? Walk the four shapes — EXCEPT, NOT IN, NOT EXISTS, LEFT JOIN IS NULL — and their failure modes.",
      a: "EXCEPT reads like the sentence: posted-riders EXCEPT completed-riders, two single-column id lists, order matters — reversed it answers a different question. NOT IN is the booby trap: one NULL in the inner list (a feed glitch rider_id) turns every comparison UNKNOWN and the query returns zero rows — the silent-empty failure, indistinguishable from a genuinely empty answer. NOT EXISTS is the shape I'd ship: correlated, stops at the first match, reads like the question, survives inner NULLs. LEFT JOIN + IS NULL is the classic anti-join — keep every poster, keep the ones whose completion columns all came back NULL. And the twist this ledger hands you: the honest answer is ZERO — all 16 riders who posted offers have at least one completed one — so a candidate who writes NOT IN sees an empty result and cannot tell a verified zero from a broken query. That ambiguity is exactly why the shape is an interview question and not a style preference: the shape you pick decides whether a zero is a finding or a failure.",
      tag: "set-ops",
    },
    {
      id: "indrive-t12",
      q: "Keep only the top three driver cohorts by billed volume. Why can't WHERE or HAVING judge the rank, and what's the staging?",
      a: "Pipeline order is the constraint: WHERE runs before GROUP BY (raw rows in, no folds exist to judge), HAVING runs after GROUP BY but before window functions compute (it sees folds, never ranks), and windows evaluate in the SELECT stage — so a rank over a fold cannot be filtered in the query that computes it. The staging is mechanical and worth narrating: stage the per-cohort fold in a CTE or derived table (cohort, billed — the denominator population fixed at fold time), rank the staged rows in the outer query with RANK or DENSE_RANK OVER (ORDER BY billed DESC), filter rn <= 3 in the outermost WHERE. Three layers, one job each — and the layering is also where the definitions live: the CTE documents the population, the window documents the tie policy, the outer filter documents the cut. The junior move is cramming the rank filter into HAVING: you either error, or rank unfiltered rows and trim at the display edge — and 'top three' silently becomes the top three of a population nobody agreed on.",
      tag: "pipeline",
    },
    {
      id: "indrive-t13",
      q: "Riders with at least three posted offers in a launch window: IN-subquery, EXISTS, derived table — three shapes. When does each win, and which one breaks on NULLs?",
      a: "The group-then-filter list wins when the fold IS the point: IN (SELECT customer_id FROM orders WHERE posted >= … GROUP BY customer_id HAVING COUNT(*) >= 3) — the threshold lives in the HAVING, the list is small, the outer query stays readable. EXISTS wins for pure existence — 'has at least one offer' needs no fold, and the correlated probe stops at the first match instead of building a list. The derived table wins when the fold feeds more than a filter — count beside the name, fold beside the rank — because staging once beats recomputing or joining twice. The NULL question: NOT IN is the shape that breaks — one NULL in the inner list and every comparison goes UNKNOWN, returning zero rows; on this ledger customer_id is NOT NULL by schema, so plain IN is safe, but the strong candidate says WHY it's safe instead of hoping. The reflex worth drilling: fold-first thinking — most 'which entities qualify' questions are a fold with a HAVING wearing a subquery's clothes.",
      tag: "subqueries",
    },
    {
      id: "indrive-t14",
      q: "Flag every offer whose fare sits above its vehicle-class ceiling — the ceiling lives on the classes table. Write the correlated check, and what happens in a class with no ceiling row?",
      a: "The correlated shape: WHERE o.total > (SELECT p.price FROM products p WHERE p.id = o.class_id) — the inner probe runs per offer row, comparing each fare to ITS class ceiling. A scalar subquery must return exactly one row per probe: two rows and the query dies with 'more than one row returned by a subquery used as an expression'; zero rows and the probe returns NULL, the comparison evaluates UNKNOWN, and the row silently drops from the flag list — the quiet failure, because the query ships looking complete with a hole where the exception should be. On this ledger the ceilings are policy, not market prices — the fleet tops out at 199.99 and the premium band above 200 is empty by design — so an offer above its ceiling is either a data bug or a policy breach, and the flag exists to be loud. The graduation note: correlated probes are fine at 103 rows; at fleet scale you stage the ceiling once (LEFT JOIN the class table) and compare in the fold — knowing when to graduate from per-row probes to set-based joins is part of the answer.",
      tag: "subqueries",
    },
    {
      id: "indrive-t15",
      q: "Trip-close latency: JULIANDAY(close) - JULIANDAY(posted) gives fractional days. Where do ROUND and CAST belong, and what's the bias when CAST goes first?",
      a: "Compute raw, convert at the edge. AVG over the raw fractional deltas, wrapped in ROUND(..., 2) for the report cell — 2.98 days on this ledger, range 2 to 4. CAST before the fold truncates every observation toward zero: a fleet of 2.9-day trips reads as 2, and the average of truncated values is biased low — not rounding, biased sampling. ROUND per row is the milder sin: it perturbs each observation by up to half a day-step, which washes out on large fleets and quietly biases small ones — LATAM's two-trip sample is exactly a small one. For human framing multiply the raw delta by 24: a 0.125-day trip is three hours, and calling it '0 days' or '1 day' are both lies — fractional is the truth. CAST belongs only when the business truly wants whole-day buckets, and then the footnote says 'truncated'. One more inDrive-specific caveat rides along: this ledger's close stamp is a batched back-office clock, so 2.98 days is batch cadence — the honest number and the honest framing travel together.",
      tag: "dates",
    },
    {
      id: "indrive-t16",
      q: "The launch board's month spine has a hole: a city with zero offers in March simply vanishes from the GROUP BY. How do you make quiet months appear?",
      a: "GROUP BY only emits groups that exist — no rows, no group, no row in the output — and a missing month renders in a chart as a straight line between its neighbors, not as the gap it is. The fix is to stop deriving the spine from the data: build the calendar as data — a VALUES list of month keys, or a recursive CTE generating 2024-01 through 2025-02 — and LEFT JOIN the fold onto it. Quiet months then appear carrying COUNT(*) = 0 and SUM = NULL: the zero is real (measured, no offers), the NULL is the empty-set aggregate saying 'nothing to sum' — COALESCE the display cell if the deck needs a 0, but never coalesce the measure mid-pipeline. The hole is information: a zero-offer month in a launch city is a demand event the review needs to see, not a rendering artifact to smooth over. On this ledger all 14 months carry offers, so the spine proves itself by returning identical counts to the bare GROUP BY — that's the test you run before you trust it at fleet scale, where the empty months are exactly the ones that matter.",
      tag: "dates",
    },
    {
      id: "indrive-t17",
      q: "A staging city folds to zero offers. What do COUNT, SUM and AVG return — and what does SQLite do with x/0?",
      a: "COUNT returns 0 — the one aggregate that keeps its contract over an empty set. SUM and AVG return NULL: the empty-set aggregate is NULL, not zero, because 'no rows to add' and 'added to zero' are different facts. And SQLite's x/0 returns NULL silently — no error, no zero — so a share computed over a zero denominator doesn't crash the dashboard, it disappears from it, which is worse: the hole ships looking intentional. The guard is NULLIF on the denominator — 100.0 * num / NULLIF(den, 0) — which makes the policy explicit and self-documenting instead of accidental. The display-versus-measure rule closes it: NULL through the pipeline means 'no data yet', zero means 'measured zero' — and at a fixed-fare marketplace those must never print the same, because a staging city with zero offers (nothing happened) and a mature city with zero cancellations (something good happened) collapsing into one '0' row is how a launch review draws the wrong conclusion in the first five minutes.",
      tag: "nulls",
    },
    {
      id: "indrive-t18",
      q: "The city card folds the vehicle classes that ran offers there into one cell: 'Audio, Wearables, Video'. What goes wrong without an ORDER BY — and when is GROUP_CONCAT the wrong tool entirely?",
      a: "Without a deterministic order, the concatenation order is unspecified — the cell reshuffles between runs, which reads as data drift when it's just nondeterminism. Fix it inside the aggregate where the engine supports an ORDER BY clause, or stage the rows pre-sorted so the fold consumes them in order, and state the separator in the review. The wrong-tool cases: when the list IS the analysis — you'll filter or join on those classes downstream, and a comma-string is a dead end you'd only have to split back apart (a bug written in advance); when the list is unbounded — a cell with forty classes is a wall, not a report; and when consumers compute on the values, because strings don't SUM. The right-tool case is exactly the city card: a bounded, display-only inventory (seven class families at most on this ledger) sitting beside the numeric folds, one scan, with the class COUNT beside it so the cell's width is auditable. An unordered concat isn't a style nit — it's an unstable cell, and unstable cells erode trust in the stable numbers next to them.",
      tag: "aggregation",
    },
    {
      id: "indrive-t19",
      q: "The month-close dashboard crawls every cycle. Name the query-side instincts you'd apply before anyone mentions hardware.",
      a: "Sargability first: STRFTIME('%Y-%m', created_at) = '2025-01' wraps the column in a function and forfeits any index on created_at — range predicates (>= '2025-01-01' AND < '2025-02-01') keep the seek alive, and on a month-close scan that's the difference between reading a slice and reading the table. Fold early and once: stage the per-cluster census in a CTE so the ranks and shares downstream reference folded rows — re-aggregating the same raw rows twice is the most common self-inflicted cost. Count what you join: legs fan 103 offers into 251 rows here — cheap, but the same fan-out at fleet scale is a multiplier, so when the fold is offer-grain, aggregate before the join. LIMIT doesn't cheapen windows — the window still computes for every row — so cut populations in staging, not at the display edge. And EXPLAIN QUERY PLAN answers 'how many rows does the engine think this touches' in one line, which turns the argument into a measurement. None of it is exotic; it's the habit of asking that question per clause, and the census-is-one-scan habit this team already has is the same instinct wearing a different hat.",
      tag: "performance",
    },
    {
      id: "indrive-t20",
      q: "Define driver response rate the way you'd build it in SQL. What's the denominator — and why does the awaiting queue sit INSIDE it?",
      a: "Response rate = offers a driver answered ÷ offers shown, inside the response window — and on this ledger's proxy the house read is the accept-and-move share: 82 of 103 posted offers, 79.6%, with the 14 awaiting and 7 expired INSIDE the denominator. Awaiting offers are accepted demand the supply side hasn't answered yet — silence IS the failure mode the metric exists to catch — so filtering the denominator to answered offers first launders the signal: 82 of 82 reads as perfection while fourteen riders watch their phones. The discipline is three named rungs: response (any answer at all), accept (a driver moving — 82 here), completion (trip closed at the posted fare — the 82 stamped on this batch clock); a dashboard labeled 'response rate' printing the accept rate is a definition bug, not a rounding difference, and the two diverge exactly when supply is sickest. Print the denominator beside every rate, name the rung in the column alias, and the funnel can't flatter itself — that's the whole governance move.",
      tag: "kpi",
    },
    {
      id: "indrive-t21",
      q: "Build the cancel-rate funnel: which stages, who cancels at each, and over which denominator?",
      a: "Three stages on this ledger's status map: posted (103) → accepted, a driver moving (82 = 52 delivered-status + 30 en route) → completed at the posted fare (52). Each stage gets its own named rate: accept rate 82/103 = 79.6%, denominator ALL posted — awaiting and expired inside; completion-of-accepted 52/82 = 63.4%, denominator the accepted base ONLY; expiry share 7/103, denominator all posted. Who cancels is the second axis: these 7 'cancelled' rows are expired-unaccepted offers — a supply failure, nobody rejected a ride — while post-accept cancels split rider-side and driver-side, and bucketing them together misdirects the ops review toward riders when the problem is silence. The classic lie is label drift: 'completion rate 50.5%' (52/103) printed where the reader assumes completion-of-accepted (63.4%) — half the funnel's apparent distance is definition drift, not performance. The fix is structural: every rate ships with its denominator in the column name or the footnote, and the funnel arms reconcile back to 103 before the deck goes out.",
      tag: "kpi",
    },
    {
      id: "indrive-t22",
      q: "inDrive has no meter and no surge — the rider posts the fare and the trip runs at that number. What fare-integrity reads does the model imply, and how do you build them?",
      a: "The posted fare is a promise, so integrity means posted and settled never drift. Three reads. Distribution: fare per class and cluster with the median BESIDE the mean — the mean 338.19 here is pulled by a 25.47-to-1,088.44 range, and the median tells the rider's story while the mean tells the finance story. Compliance: fare versus class ceiling — the fleet's 199.99 top is a ceiling and the premium band above 200 is empty by design, so an offer above its ceiling is a data bug or a policy breach, never a luxury tier, and the check is a per-class fold away. Negotiation trace: inDrive's mechanic is re-posting — a rider whose offer sits unanswered and re-posts at a higher number is the negotiation, and re-post frequency per cluster is a supply-health read worth its own query. On this ledger total is immutable after posting, so the drift alarm reads zero by construction — and the discipline is to run the check anyway: a zero you verify weekly is a control; a zero you assume is a hope. Print the distribution, the compliance census and the re-post rate, and the integrity story tells itself.",
      tag: "kpi",
    },
    {
      id: "indrive-t23",
      q: "A city regulator asks you to PROVE there's no surge pricing. What's the SQL shape of that proof?",
      a: "Surge is a fare cliff tied to time or crowd, so the proof is a dispersion read, not a volume read: per class × cluster × hour, the fare spread — max/min ratio, stddev over mean, quantile gaps. If surge existed it would print as hour-of-day cliffs within the same class; flat fares print as stable spread bounded by the class ceiling. First exhibit on this ledger: the band census — 8 budget classes averaging 32.06, 8 mid classes 111.50, the premium band above 200 EMPTY by design — the fare ladder is structural, not demand-priced, and the ceiling structure is the strongest single argument. Second exhibit: the dispersion fold over the posted fares by hour — no cliff, no surge. The honest caveats are part of the proof: 103 offers is proof of absence at THIS scale only, 'no surge' is a claim about the pricing model, not one quarter's ledger, and every exhibit states its population, window and grain. Regulators trust queries that print their denominators — the same discipline the funnel taught, pointed at a promise instead of a pipeline.",
      tag: "kpi",
    },
    {
      id: "indrive-t24",
      q: "WHERE fare_volume > 5000 fails, HAVING works, and neither can touch the window rank. Walk the visibility rules a query engine actually follows.",
      a: "The logical pipeline is FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT, and visibility follows it exactly. WHERE sees raw rows only: no folds, no SELECT aliases — fare_volume does not exist yet, so the predicate errors no matter how reasonable it looks. HAVING sees folds but not windows: windows compute in the SELECT stage, after HAVING has already judged the groups. SELECT aliases become visible to ORDER BY — and SQLite is lenient enough to also resolve them in GROUP BY, which is a dialect courtesy, not standard SQL; leaning on it quietly couples the query to one engine. Rank filtering needs staging: fold in a CTE, rank in the outer query, filter rn in the outermost WHERE — three layers, and the trap that ships to production is a query that runs fine in the local dialect and breaks on the warehouse. At inDrive the census is ONE query rerun in every launch city, so portability isn't pedantry: write the pipeline portable once and every city inherits the discipline; write it dialect-cute and the next deploy owns the incident.",
      tag: "pipeline",
    },
  ],

  mcqs: [
    {
      id: "indrive-mcq-1",
      prompt: "Offers join to trip legs (251 legs under 103 posted offers). What does COUNT(*) count in the joined query?",
      choices: ["103 — the join preserves offer grain", "251 — the fan-out multiplies offers by their legs", "251 × 103 — a cross product", "It depends on the join direction only"],
      answer: 1,
      why: "After the join, COUNT(*) counts legs — one row per leg. The 2.4× fan-out is real marketplace shape (multi-stop, multi-rider), and quoting it as an offer count is the grain error this domain drills first.",
      notes: [
        { choice: 0, why: "Only COUNT(DISTINCT offer_id) preserves offer grain after the join. COUNT(*) counts whatever rows survive — and survival is at leg grain." },
        { choice: 2, why: "A cross product needs CROSS JOIN — an ordinary equi-join on offer_id emits one row per matching leg, 251 total." },
      ],
      difficulty: "easy",
    },
    {
      id: "indrive-mcq-2",
      prompt: "Accept-and-move share: 82 accepted, 14 awaiting, 7 expired, of 103 posted. Which denominator does the house definition use?",
      choices: ["Accepted only (82/82)", "All posted offers (82/103)", "Resolved offers (82/89)", "Distinct riders (82/16)"],
      answer: 1,
      why: "The house definition: accepted ÷ ALL posted — 79.6%. Awaiting offers are accepted demand the supply side hasn't answered; every alternative computes a real but differently-named metric.",
      notes: [
        { choice: 2, why: "82/89 is the resolved-offer share (88.8%) — calling it 'the accept share' inflates 79.6% by silently deleting the awaiting queue, which is exactly the supply-gap signal ops reviews." },
        { choice: 3, why: "82/16 is accepted offers per rider — an intensity ratio, not a rate. Rates divide populations of the same grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "indrive-mcq-3",
      prompt: "A settlement row reads amount_cents = 92500. Which expression prints its dollar value?",
      choices: ["amount_cents / 100", "ROUND(amount_cents / 100.0, 2)", "amount_cents * 100", "ROUND(amount_cents, 2)"],
      answer: 1,
      why: "INTEGER cents ÷ 100.0 promotes to real arithmetic: 925.00 — the void-but-paid #11 on this book. The .0 is the entire fix; integer ÷ integer truncates and every odd-cent bill leaks its cents into the floor.",
      notes: [
        { choice: 0, why: "92500 / 100 is integer division = 925 — on round-dollar bills the bug hides; the first odd-cent payout exposes it. Promote before you divide." },
        { choice: 2, why: "Multiplying gives 9,250,000 — units inverted. Sanity-check magnitude: dollars are smaller than cents." },
      ],
      difficulty: "easy",
    },
    {
      id: "indrive-mcq-4",
      prompt: "Inside GROUP BY city cluster, what does SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) compute?",
      choices: ["All offers in the cluster, with pending ones flagged", "The awaiting-offer count per cluster — a conditional count in the same scan as the other arms", "A separate query run per cluster", "The percentage of pending offers"],
      answer: 1,
      why: "The CASE turns each row into a 1/0 indicator and SUM adds the 1s per group — the awaiting queue (EU 6, APAC 5, US 3, LATAM 0) folded in the same scan as COUNT(*), guaranteed to describe the same offer population.",
      notes: [
        { choice: 0, why: "The plain COUNT(*) next to it does that. The conditional SUM narrows WHICH rows contribute — it never flags rows in the output." },
        { choice: 3, why: "A percentage needs the division: 100.0 * SUM(CASE …) / COUNT(*). The fold counts; it doesn't normalize." },
      ],
      difficulty: "medium",
    },
    {
      id: "indrive-mcq-5",
      prompt: "The launch board keeps only city clusters with at least 19 posted offers. Where does the gate live, and what does it do to this ledger?",
      choices: ["WHERE COUNT(*) >= 19, before GROUP BY — keeps all four clusters", "GROUP BY cluster HAVING COUNT(*) >= 19 — keeps EU (45), APAC (37), US (19); drops LATAM (2)", "HAVING offers >= 19 evaluated per row — keeps everything", "ORDER BY offers DESC LIMIT 19"],
      answer: 1,
      why: "The floor judges an aggregate that exists only after grouping, so HAVING follows GROUP BY — and on this ledger the 19-offer floor keeps three clusters and leaves LATAM's 2-offer pilot (852.44) off the board, which is the point of the gate.",
      notes: [
        { choice: 0, why: "WHERE runs before groups exist and rejects the aggregate outright — the fold hasn't happened, so COUNT(*) isn't a thing yet." },
        { choice: 3, why: "LIMIT 19 takes 19 ROWS, not a volume floor — it would print 19 clusters (there are four) and confuse a paging habit with a business rule." },
      ],
      difficulty: "medium",
    },
    {
      id: "indrive-mcq-6",
      prompt: "The pacing board buckets offers by launch month. Which format key builds the spine correctly?",
      choices: ["STRFTIME('%m', posted_at)", "STRFTIME('%Y-%m', posted_at)", "STRFTIME('%Y', posted_at)", "SUBSTR(posted_at, 1, 4)"],
      answer: 1,
      why: "'%Y-%m' gives year plus zero-padded month — 14 buckets on this ledger, 2024-01 through 2025-02. It is the only key that keeps January 2024 and January 2025 apart while keeping months comparable.",
      notes: [
        { choice: 0, why: "'%m' folds every January into one bucket — the pacing curve mixes two years and quietly becomes fiction." },
        { choice: 2, why: "'%Y' collapses to two buckets; a launch board that reads '2024: 96 offers' has no pacing signal left in it." },
      ],
      difficulty: "medium",
    },
    {
      id: "indrive-mcq-7",
      prompt: "100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to percentage-valued offers", "It is cosmetic — moving it changes nothing"],
      answer: 1,
      why: "Without it, integer ÷ integer is integer division — every cluster's expiry share truncates toward 0 and the map reads flat. The 100.0 forces real division first; on this ledger it's the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (a/b)*100 truncates first, then scales — 0.068 became 0 at the fold. Order of operations is the metric." },
      ],
      difficulty: "medium",
    },
    {
      id: "indrive-mcq-8",
      prompt: "An analyst joins offers to legs, then computes 100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*) and reports the accept share. What's wrong?",
      choices: [
        "Nothing — the join is required to see status",
        "The denominator now counts LEGS — the 2.4× fan-out deflates every cluster's share; compute at offer grain or use COUNT(DISTINCT offer_id) in the denominator",
        "CASE cannot be used after a join",
        "The 100.0 must come after the division",
      ],
      answer: 1,
      why: "The join is fine for leg-level facts, but the rate's denominator is now leg-grain — 251 rows under 103 offers — so every offer-side count divides by ~2.4× too many rows and the share collapses. The numerator needs an offer-grain denominator: COUNT(DISTINCT o.id), or run the fold on the offers table before joining legs.",
      notes: [
        { choice: 0, why: "status lives on the offers table — the join adds nothing to this fold except fan-out. The bug is real and it's in the denominator." },
        { choice: 2, why: "CASE works anywhere an expression works. The failure isn't syntax — it's a rate computed across two grains at once." },
      ],
      difficulty: "hard",
    },
    {
      id: "indrive-mcq-9",
      prompt: "HAVING COUNT(*) >= 19 runs against the cluster fold. Which rows survive, and what is the business meaning of the 19?",
      choices: [
        "EU, APAC, US, LATAM — all clusters, because 19 < 45",
        "EU (45), APAC (37), US (19) — LATAM's 2-offer pilot drops; the 19 is the pilot-floor, set at the US cluster's volume",
        "Only EU — 19 is the median offer count",
        "None — HAVING cannot compare to a literal",
      ],
      answer: 1,
      why: "The fold counts offers per cluster: EU 45, APAC 37, US 19, LATAM 2 — the >= 19 gate keeps three and leaves LATAM (2 offers, 852.44) off the launch board. The threshold is a business floor, stated next to the gate, not a statistical artifact.",
      notes: [
        { choice: 0, why: "That reads the gate as a filter on clusters bigger than 19 — but the comparison is per-cluster: LATAM's own count is 2, and 2 >= 19 is false." },
        { choice: 2, why: "The US cluster's 19 is the boundary row that exactly survives — a median framing would put the floor elsewhere and drop US too." },
      ],
      difficulty: "hard",
    },
    {
      id: "indrive-mcq-10",
      prompt: "A slow-trip CASE runs WHEN JULIANDAY(close) - JULIANDAY(posted) > 4 THEN 'slow' ELSE 'on-clock' — no unstamped arm. Where do the 21 unstamped offers land?",
      choices: ["'slow' — NULL compares as infinity", "'on-clock' — lag is NULL, NULL > 4 is UNKNOWN, so the row falls to ELSE", "An error — CASE cannot evaluate NULL conditions", "They are skipped — CASE drops rows that fail all arms"],
      answer: 1,
      why: "The lag is NULL for unstamped offers, NULL > 4 is UNKNOWN, the arm doesn't fire, and the exhaustive ELSE catches them as 'on-clock' — offers with no clock at all re-bucketed as healthy. That's why the unstamped arm (close IS NULL THEN 'no stamp') fires FIRST in every latency band this team ships.",
      notes: [
        { choice: 0, why: "NULL never compares as infinity or zero — every comparison with NULL is UNKNOWN, never true. The illusion comes from IFNULL, which this CASE doesn't use." },
        { choice: 3, why: "CASE doesn't drop rows — a row failing every WHEN arm takes the ELSE. Dropping would need a WHERE, and then the band totals wouldn't reconcile to the base." },
      ],
      difficulty: "hard",
    },
    {
      id: "indrive-mcq-11",
      prompt: "orders carries shipped_at only for closed trips: 82 of the 103 posted offers have a stamp. What does COUNT(shipped_at) return over the full table?",
      choices: ["103 — COUNT counts rows", "82 — COUNT(expr) counts non-NULL values only", "21 — it counts the NULLs", "16 — it deduplicates riders"],
      answer: 1,
      why: "COUNT(expr) skips NULLs: 82 stamped offers (52 delivered-status + 30 en route). COUNT(*) counts rows (103), and the gap between them — 21 — IS the unstamped queue, which is why the census ships both columns.",
      notes: [
        { choice: 0, why: "That's COUNT(*). Under a latency-report header it launders 21 unstamped offers into the 'closed trips' count — the population drift the close exists to catch." },
        { choice: 2, why: "COUNT never counts NULLs. The 21 come from COUNT(*) - COUNT(shipped_at) or a FILTER (WHERE shipped_at IS NULL) arm — name the population out loud." },
      ],
      difficulty: "easy",
    },
    {
      id: "indrive-mcq-12",
      prompt: "Running fare volume: SUM(o.total) OVER (ORDER BY posted_at), no frame clause — and two offers share the same posted timestamp. What happens at that timestamp?",
      choices: [
        "The running sum skips the tied rows",
        "The default frame is RANGE — ordering peers are one unit, so both offers' fares jump into the running sum in a single step",
        "The query errors on duplicate ORDER BY keys",
        "Nothing — timestamps can never tie",
      ],
      answer: 1,
      why: "No frame clause means the engine substitutes RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE treats peers as one unit: the curve jumps in lumps at tied keys while the reader assumes row-by-row increments. A row-count contract needs ROWS BETWEEN …, stated explicitly.",
      notes: [
        { choice: 0, why: "Nothing is skipped — the opposite: both tied rows' fares enter the running sum at once. The bug is a lumpier curve than intended, not missing rows." },
        { choice: 3, why: "Timestamps tie constantly at launch scale — a re-post batch or a cron stamp. The month spine hides this because '%Y-%m' keys are unique; re-key to day or hour and the default frame bites." },
      ],
      difficulty: "medium",
    },
    {
      id: "indrive-mcq-13",
      prompt: "Stitch the accepted-offers board (per cluster) and the expired-offers board (per cluster) into one labeled report. Which stitch?",
      choices: ["UNION — dedupe keeps the report clean", "UNION ALL — two populations, every row kept, labeled per arm", "JOIN on cluster", "A cross join of the two boards"],
      answer: 1,
      why: "UNION ALL concatenates two DIFFERENT populations — accepted and expired are different facts about the same clusters, and a literal label column tells the reader which arm a row came from. The stitched arms must reassemble the base: 82 + 7 (+ 14 awaiting if on the board) back to 103.",
      notes: [
        { choice: 0, why: "UNION dedupes IDENTICAL rows — and if an accepted line and an expired line print the same cluster-and-count pair, one vanishes silently and the reconciliation to 103 breaks. Stitching is not deduping." },
        { choice: 2, why: "A JOIN multiplies: clusters appear in both boards, so the join fans out and mixes populations into one row — a census of neither. Set ops stack; joins combine attributes." },
      ],
      difficulty: "easy",
    },
    {
      id: "indrive-mcq-14",
      prompt: "NOT IN (SELECT customer_id FROM import_batch) — the import returns one row with a NULL customer_id (feed glitch). What comes back?",
      choices: [
        "Every row except the non-NULL imported ids",
        "Zero rows — one NULL turns every comparison UNKNOWN and the anti-join silently empties",
        "An error: IN lists cannot contain NULLs",
        "Only rows matching the NULL id",
      ],
      answer: 1,
      why: "x NOT IN (list) is x <> v1 AND x <> v2 … — and any comparison with NULL is UNKNOWN, so the whole AND-chain can never be true. One NULL in the inner list returns zero rows: the silent-empty failure, indistinguishable from a genuinely empty answer. NOT EXISTS or LEFT JOIN IS NULL survives inner NULLs.",
      notes: [
        { choice: 0, why: "That's the intuition, and it's exactly the trap: the semantics say UNKNOWN propagates, so 'every row except…' becomes 'no rows at all'. Test it once and you'll never ship NOT IN against an unfiltered column." },
        { choice: 2, why: "NULLs are legal in IN lists — the engine just evaluates them to UNKNOWN. The failure is silent, not loud, which is why the empty result ships to the dashboard unchallenged." },
      ],
      difficulty: "medium",
    },
    {
      id: "indrive-mcq-15",
      prompt: "SELECT c.region, ROUND(SUM(o.total), 2) AS fare_volume … GROUP BY c.region — then WHERE fare_volume > 5000. What happens?",
      choices: [
        "Works — SELECT aliases are visible everywhere",
        "Fails — WHERE runs before SELECT, so the alias doesn't exist yet; a gate on the fold belongs in HAVING",
        "Silently drops the condition and returns all clusters",
        "Rounds twice — fare_volume gets double-rounded",
      ],
      answer: 1,
      why: "Logical pipeline: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. WHERE judges raw rows, before the fold and before aliases exist — the query errors. The gate judges a fold per group, so HAVING ROUND(SUM(o.total), 2) > 5000 (or the fold staged, then filtered).",
      notes: [
        { choice: 0, why: "ORDER BY sees aliases; WHERE doesn't. The leniency you may have seen in one engine's dialect is exactly the portability trap — write the gate where the standard puts it." },
        { choice: 2, why: "A wrong clause is an error, not a silent no-op — SQLite refuses to parse an aggregate or unknown alias in WHERE. The silent-drop failure mode belongs to NULL comparisons, not to pipeline-order bugs." },
      ],
      difficulty: "medium",
    },
    {
      id: "indrive-mcq-16",
      prompt: "A teammate writes GROUP BY 1 to fold offers by the first SELECT column. What's the real cost?",
      choices: [
        "SQLite rejects ordinal GROUP BY",
        "It works, but couples the fold to column POSITION — reorder the SELECT and the fold silently regroups by the wrong column",
        "Ordinals round the grouping values",
        "It deduplicates the groups",
      ],
      answer: 1,
      why: "GROUP BY 1 folds by the first output column — fine until someone reorders the SELECT for a deck and the fold re-keys to the new first column, silently producing a different census that still runs. Name the key (GROUP BY c.region or the alias): the census is standing infrastructure, and standing infrastructure survives refactors.",
      notes: [
        { choice: 0, why: "SQLite resolves ordinals (and SELECT aliases) in GROUP BY — that's the dialect courtesy. The cost isn't rejection; it's silent re-keying under refactor." },
        { choice: 2, why: "Ordinals have nothing to do with rounding — but the confusion is telling: a grouping key should be a name you can read, not a position you must count." },
      ],
      difficulty: "medium",
    },
    {
      id: "indrive-mcq-17",
      prompt: "The pacing walk's first month (2024-01) shows mom_delta NULL. A colleague wraps it COALESCE(delta, 0) 'to clean the report'. What did that do?",
      choices: [
        "Nothing — NULL and 0 display identically",
        "Manufactured a flat month: 'no previous month to differ from' became 'no move', and the baseline lie propagates into every chart",
        "Broke the window function",
        "Rounded the delta to a whole month",
      ],
      answer: 1,
      why: "LAG has no prior row for the spine's first month, so the delta is NULL by definition — the honest representation of 'baseline'. Coalescing to zero rewrites the baseline as 'no change', and a launch walk that starts flat hides whatever the first month actually did. Report NULL, or label the row 'baseline'.",
      notes: [
        { choice: 0, why: "They don't display identically everywhere — and the semantic lie is the issue regardless of rendering: NULL is 'no prior', 0 is 'measured no change'. Different facts." },
        { choice: 2, why: "COALESCE is an ordinary expression wrapper — the window computes fine. The damage is to the report's meaning, which is harder to catch than any syntax error." },
      ],
      difficulty: "easy",
    },
    {
      id: "indrive-mcq-18",
      prompt: "Riders ranked by posted offers: a FOUR-way tie at 4 offers (RANK 6 each), then a pair at 3 offers. What rungs do RANK and DENSE_RANK print for the 3-offer pair?",
      choices: [
        "RANK 7, DENSE_RANK 7",
        "RANK 10, DENSE_RANK 7 — RANK skips the four tied rows, DENSE_RANK takes the next distinct value",
        "RANK 10, DENSE_RANK 10",
        "RANK 7, DENSE_RANK 10",
      ],
      answer: 1,
      why: "RANK = the row number the tie started at, so after four rows at rank 6 the next row is rank 10 — the gap makes the tie's SIZE visible. DENSE_RANK numbers distinct values, so the next value lands at 7 — the compact ladder. Same input, two different stories about how many riders were leapfrogged.",
      notes: [
        { choice: 0, why: "7 is DENSE_RANK's answer for both — and it's RANK's answer only when the tie has one row. Four tied rows buy RANK a four-step gap; that's the entire information content." },
        { choice: 2, why: "DENSE_RANK never gaps — 10 for a pair after four ties would imply five distinct values before them, and there are only two (the top counts and the 4s)." },
      ],
      difficulty: "hard",
    },
    {
      id: "indrive-mcq-19",
      prompt: "Riders with at least one FIVE-leg offer: a colleague joins orders to trip legs and counts. What does the join shape risk that EXISTS doesn't?",
      choices: [
        "Nothing — COUNT handles the fan-out automatically",
        "The join fans out: counting riders over leg rows multiplies by 5 legs and needs COUNT(DISTINCT) — EXISTS stops at the first matching leg and never doubles",
        "EXISTS cannot reference the legs table",
        "Both return identical row sets, always",
      ],
      answer: 1,
      why: "251 legs under 103 offers is a 2.4× fan-out — a five-leg offer contributes five rows, so a rider COUNT over the join overcounts unless deduped with COUNT(DISTINCT o.customer_id). EXISTS (SELECT 1 FROM legs WHERE leg.offer_id = o.id …) is a semi-join: it answers presence, stops at the first match, and the row count is rider-grain by construction.",
      notes: [
        { choice: 0, why: "COUNT doesn't dedupe — that's COUNT(DISTINCT …)'s job. The plain count over a fanned join is the leg census wearing the rider census's name, the exact grain error this kit drills." },
        { choice: 2, why: "EXISTS takes any subquery referencing any table — that's the point. What it can't do is count matches; it answers 'at least one', which is precisely the question being asked." },
      ],
      difficulty: "hard",
    },
    {
      id: "indrive-mcq-20",
      prompt: "An offer posts 2024-01-01 23:30; its trip-close stamp lands 2024-01-02 02:30. What does JULIANDAY(close) - JULIANDAY(posted) return?",
      choices: ["1 — different calendar days", "0 — same night shift", "0.125 — fractional days: three hours", "3 — the hour count, misread as days"],
      answer: 2,
      why: "JULIANDAY returns fractional day numbers, so the delta is exact: 3 hours = 3/24 = 0.125 days. Late-night offers straddle midnight constantly in fare-offering demand, and both whole-day answers — 0 and 1 — are wrong by half a night. Multiply by 24 when the report speaks hours.",
      notes: [
        { choice: 0, why: "That's DATE arithmetic, not JULIANDAY: a day-boundary comparison. CAST to date first and the 0.125 becomes 1.0 — a biased latency report inflated by midnight crossings." },
        { choice: 3, why: "JULIANDAY's unit is days, not hours — 3 would mean three full days. The number 3 only appears if you never converted; sanity-check the unit before the number ships." },
      ],
      difficulty: "medium",
    },
    {
      id: "indrive-mcq-21",
      prompt: "A scalar subquery in SELECT returns TWO rows for one outer row. What does SQLite do?",
      choices: [
        "Picks the first row it read",
        "Errors — 'more than one row returned by a subquery used as an expression'",
        "Returns NULL for that row",
        "Averages the two rows",
      ],
      answer: 1,
      why: "A scalar subquery is a scalar: exactly one row (or NULL if zero rows — the silent case). Two rows is a runtime error, which is loud and fixable; the dangerous sibling is ZERO rows returning NULL and quietly dropping every comparison it feeds. Size the inner query's grain before you trust the scalar.",
      notes: [
        { choice: 0, why: "Engines that pick an arbitrary row are the reason the error exists — SQLite refuses, and so should you: an arbitrary pick is a query that flips between runs with no diff to explain it." },
        { choice: 2, why: "NULL is the ZERO-row answer, not the two-row answer. Confusing the two hides the asymmetry: too many rows crashes, too few rows lies." },
      ],
      difficulty: "medium",
    },
    {
      id: "indrive-mcq-22",
      prompt: "A launch city posts zero offers in March. The month spine LEFT JOINs the census fold onto a calendar table. What does March's row carry?",
      choices: [
        "No row at all — the fold drops it",
        "COUNT 0 and SUM NULL — the fold over zero surviving rows: a measured zero and an empty-set aggregate",
        "COUNT 0 and SUM 0",
        "An error on the empty group",
      ],
      answer: 1,
      why: "The LEFT JOIN keeps the calendar's March; the fold over zero rows returns COUNT = 0 (the one aggregate that counts empties) and SUM = NULL (the empty-set aggregate). That NULL is the honest 'nothing to sum' — coalesce the display cell if the deck needs a 0, never the measure.",
      notes: [
        { choice: 0, why: "Dropping is exactly what a bare GROUP BY does — the spine exists so quiet months APPEAR. A missing month renders as a straight line in the chart, not as the demand gap it is." },
        { choice: 2, why: "SUM over no rows is NULL, not 0 — SQLite's empty-set contract. Coalescing mid-pipeline collapses 'no data' into 'measured zero' and the launch review loses the distinction." },
      ],
      difficulty: "easy",
    },
    {
      id: "indrive-mcq-23",
      prompt: "GROUP_CONCAT(class_name) over a cluster's vehicle classes — no ORDER BY inside. What's wrong?",
      choices: [
        "Nothing — concatenation is alphabetical by default",
        "The order is unspecified — the cell can reshuffle between runs; deterministic output needs an explicit order",
        "It errors when any class name is NULL",
        "It deduplicates the class names",
      ],
      answer: 1,
      why: "Without a deterministic order the concatenation order is unspecified — the same query returns 'Video, Audio' then 'Audio, Video' across runs, which reads as data drift when it's nondeterminism. Order inside the aggregate or stage pre-sorted rows, state the separator, and keep the class COUNT beside the cell so its width is auditable.",
      notes: [
        { choice: 0, why: "No default order exists — alphabetical appearance is coincidence on small sorted inputs. The first unsorted batch reshuffles the cell and the city card starts lying politely." },
        { choice: 3, why: "GROUP_CONCAT keeps duplicates — 'Audio, Audio' is a real output when two budget classes ran offers, and the dedupe assumption silently undercounts the fleet's mix." },
      ],
      difficulty: "medium",
    },
    {
      id: "indrive-mcq-24",
      prompt: "Driver response rate at a fare-offering marketplace: which denominator keeps the metric honest?",
      choices: [
        "Offers the driver accepted only",
        "ALL offers shown to the driver — silence (unanswered, awaiting, expired) stays inside the denominator",
        "Completed trips only",
        "Distinct riders the driver served",
      ],
      answer: 1,
      why: "Response rate exists to catch silence, so silence stays in the denominator: answered ÷ shown. Filter to answered offers first and the metric reads perfection while fourteen riders watch their phones — 82 of 82. Every rate ships with its denominator named, or the funnel flatters itself.",
      notes: [
        { choice: 0, why: "Accepted ÷ accepted is 100% everywhere, always. That's not a metric, it's a tautology — and it's exactly what a 'response rate' becomes the moment someone filters the denominator to responders." },
        { choice: 2, why: "Completed trips measure a later rung (completion of accepted, 52 of 82 here). Real numbers, different metric — denominator drift between rungs is the classic label bug." },
      ],
      difficulty: "easy",
    },
    {
      id: "indrive-mcq-25",
      prompt: "'Of the offers a driver took, how many closed at the posted fare?' — 52 delivered of 82 accepted, of 103 posted. Which fraction answers THAT question?",
      choices: [
        "52/103 = 50.5% — the posted base",
        "52/82 = 63.4% — the accepted base the question names",
        "52/89 — resolved offers",
        "82/103 = 79.6% — the accept share",
      ],
      answer: 1,
      why: "The phrase names the denominator: 'of the offers a driver took' = the accepted base. 52/82 = 63.4%. Every fraction here is a real metric with a different name — the error is label drift, printing one under another's name, and it moves the number by 13 points.",
      notes: [
        { choice: 0, why: "52/103 is completion-of-POSTED — a supply-funnel read that charges expiry and awaiting against trip completion. Real number, different question; using it here overstates the funnel's leak." },
        { choice: 3, why: "82/103 is the accept rate — the stage BEFORE completion. Answering a completion question with an accept rate is how a review concludes the trips are fine when the question was whether they close." },
      ],
      difficulty: "medium",
    },
    {
      id: "indrive-mcq-26",
      prompt: "A regulator asks for proof there's no surge pricing. Which read would actually EXPOSE surge if it existed?",
      choices: [
        "Total fare volume by month",
        "Fare dispersion per class × cluster × hour — max/min ratio and quantile gaps; surge prints as hour-of-day cliffs",
        "Average offers per rider",
        "Payment method mix",
      ],
      answer: 1,
      why: "Surge is a fare cliff tied to time or crowd, so the proof is dispersion at the grain where a cliff would live: within one class and cluster, hour by hour. Volume totals can RISE under surge or under demand — they can't distinguish the two. Dispersion bounded by the class ceiling is the flat-fare fingerprint.",
      notes: [
        { choice: 0, why: "Monthly volume is a demand read — it rises when the city grows. A surge month and a busy month print the same total, which is why 'look how flat the totals are' proves nothing." },
        { choice: 2, why: "Offers per rider is engagement, not pricing. Surge changes what a ride COSTS at a moment; only a fare-versus-time read at fixed class grain can see it." },
      ],
      difficulty: "hard",
    },
    {
      id: "indrive-mcq-27",
      prompt: "Settlement rows carry INTEGER cents. Which expression computes the average payout in dollars correctly?",
      choices: [
        "AVG(amount_cents / 100) — convert each row first",
        "AVG(amount_cents) / 100.0 — fold in cents exactly, convert once at the edge",
        "AVG(amount_cents) — cents are fine",
        "SUM(amount_cents) / COUNT(*) / 100",
      ],
      answer: 1,
      why: "AVG(amount_cents) folds in INTEGER cents with no floating-point drift, and the single /100.0 conversion happens at the display edge. Per-row conversion — amount_cents / 100 — is INTEGER division: every row truncates before averaging, and the mean of truncated values is a mean of lies.",
      notes: [
        { choice: 0, why: "INTEGER / INTEGER truncates: 12345/100 = 123 before averaging. The bias compounds per row and is invisible on round-dollar books — the first odd-cent payout exposes it." },
        { choice: 2, why: "Cents are fine for folding, not for reporting — the reader asked for dollars. The conversion must happen once, with the .0, or the dashboard prints 40117 where 401.17 belongs." },
      ],
      difficulty: "hard",
    },
    {
      id: "indrive-mcq-28",
      prompt: "Month-close slows down; the WHERE reads STRFTIME('%Y-%m', created_at) = '2025-01'. The fastest query-side fix?",
      choices: [
        "Add memory to the database host",
        "Rewrite as a range — created_at >= '2025-01-01' AND created_at < '2025-02-01' — the function wrap forfeits any index on the column",
        "CAST created_at to TEXT first",
        "ORDER BY created_at to help the planner",
      ],
      answer: 1,
      why: "Wrapping the column in a function makes the predicate unsargable — the planner can't use an index on created_at and reads the whole table. A half-open range on the bare column keeps the index usable: same rows, seek instead of scan. Same numbers, one-line rewrite.",
      notes: [
        { choice: 0, why: "Hardware hides the bug for one quarter and bills for it forever. The scan is a predicate-shape problem; fix the shape first, and only size hardware for what's left." },
        { choice: 2, why: "Casting makes it worse — a cast on the column side is another function wrap. The indexable form keeps transformations OFF the column and ON the constants." },
      ],
      difficulty: "medium",
    },
    {
      id: "indrive-mcq-29",
      prompt: "SELECT region, RANK() OVER (ORDER BY SUM(total) DESC) AS rnk … then WHERE rnk <= 3 in the same query. What happens?",
      choices: [
        "Works — window functions compute before WHERE",
        "Fails — WHERE runs before SELECT, and windows compute there; stage the fold, rank outside, filter outermost",
        "Returns the LAST three regions",
        "Deduplicates tied ranks",
      ],
      answer: 1,
      why: "Pipeline order: WHERE judges rows before GROUP BY and long before the SELECT-stage windows — the alias doesn't exist yet and neither does the rank. The staging is the answer: fold in a CTE, rank the staged rows in the outer query, filter rn <= 3 in the outermost WHERE.",
      notes: [
        { choice: 0, why: "Backwards — windows are the LAST analytical step before ORDER BY. The intuition 'ranks first' is the trap; the pipeline is WHERE → GROUP BY → HAVING → SELECT(windows) → ORDER BY." },
        { choice: 2, why: "Nothing in the pipeline inverts the rank — the query simply errors. The 'last three' phrasing preys on DESC confusion, but the real lesson is that the filter never runs at all." },
      ],
      difficulty: "hard",
    },
    {
      id: "indrive-mcq-30",
      prompt: "A share's denominator can be zero for a staging cluster. What does SQLite return for x / 0?",
      choices: [
        "An error — division by zero",
        "NULL — silently; guard with NULLIF(den, 0) when the hole must be explicit",
        "0 — the empty share",
        "Infinity",
      ],
      answer: 1,
      why: "SQLite's x/0 evaluates to NULL, not an error and not zero — so a rate over a zero denominator doesn't crash the dashboard, it disappears from it, and the hole ships looking intentional. NULLIF on the denominator makes the policy visible: the hole says 'no data', and 'no data' is different from 'measured zero'.",
      notes: [
        { choice: 0, why: "That's most engines' strict mode and most people's intuition — but SQLite returns NULL quietly, which is precisely why the silent hole is the failure mode to design against." },
        { choice: 2, why: "0 would conflate 'nothing happened' with 'measured zero' — a staging city and a zero-cancellation city would print identically, and the launch review reads them as the same story. They aren't." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-indrive-1",
      tier: "medium",
      topic: "j7",
      universe: "funnel",
      title: "The offer-accept funnel by city cluster",
      brief:
        "inDrive-flavored brief on the storefront db: the launch board reads the offer-accept funnel per city cluster, built as one conditional fold because the same census runs every morning. Probed facts: 103 posted offers across four clusters; accepted (en route + completed) reads EU 36 of 45, APAC 29 of 37, US 15 of 19, LATAM 2 of 2 — summing to 82; awaiting 6 / 5 / 3 / 0 summing to 14; expired 3 / 3 / 1 / 0 summing to 7; fare volume 15,089.23 / 11,605.45 / 7,286.16 / 852.44. The board carries a pilot floor: only clusters with at least 19 posted offers — the US cluster's count is the floor — so LATAM's two-offer pilot stays off the board. Every arm describes the same offer population, and the arms must reconcile back to COUNT(*).",
      ask: "Return each surviving cluster with offer count, accepted, awaiting, expired and fare volume — one scan, biggest cluster first.",
      template:
        "SELECT c.region AS city_cluster,\n       COUNT(*) AS offers,\n       SUM(CASE WHEN o.status {1} THEN 1 ELSE 0 END) AS accepted,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS awaiting,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS expired,\n       ROUND(SUM(o.total), 2) AS fare_volume\nFROM orders o\nJOIN customers c ON c.id = {2}\nGROUP BY c.region\nHAVING COUNT(*) >= {3}\nORDER BY offers {4};",
      slots: [
        {
          answer: "IN ('delivered','shipped')",
          kind: "keyword",
          label: "the accepted set membership",
          why: "Accepted means a driver is moving: BOTH statuses carry movement — delivered (52) and shipped (30) sum to the 82 accepted offers. A single '=' would drop half the accept signal; status != 'cancelled' would sweep the 14 awaiting offers into 'accepted' and the funnel would flatter supply.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the offer-to-rider join key",
          why: "Each offer attaches to its rider's cluster via the FK: c.id = o.customer_id. c.id = c.id is always true — the join cross-products and every cluster count inflates sixteen-fold, a census that reconciles to nothing.",
        },
        {
          answer: "19",
          kind: "number",
          label: "the pilot floor",
          why: "The floor is a business number set at the US cluster's volume: 19 posted offers. 20 would drop the US cluster itself (19 is the boundary row), and anything under 19 lets LATAM's 2-offer pilot onto a board built for operating clusters.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-cluster-first direction",
          why: "The board reads the load leader first: EU 45 offers on top. ASC would open the review on US 19 and the read runs upside down — useful for a different meeting, not this one.",
        },
      ],
      distractors: ["= ('delivered','shipped')", "IN ('delivered')", "c.id", "20", "ASC"],
      walkthrough:
        "One scan, five numbers, one population. The join attaches each of the 103 offers to its rider's cluster; GROUP BY c.region folds them into four buckets, and the CASE arms count inside the SAME fold: accepted (IN delivered,shipped) reads 36 / 29 / 15 / 2 — summing to 82, the accept-and-move base — awaiting reads 6 / 5 / 3 / 0 (14), expired reads 3 / 3 / 1 / 0 (7), and ROUND(SUM(o.total), 2) prices each cluster at 15,089.23 / 11,605.45 / 7,286.16 / 852.44. The pilot floor HAVING COUNT(*) >= 19 keeps EU, APAC and US and drops LATAM — 19 is the US cluster's own count, so the boundary row survives and the pilot does not. The reconciliation the standup demands: accepted + awaiting + expired + en-route/waiting arms reassemble COUNT(*) before the board ships. The distractors each break differently: '=' with a row-value tuple is a syntax break (row value misused); IN ('delivered') halves the accept arm — EU reads 24 instead of 36 and the funnel undercounts supply's answer; c.id in the join key is always true, cross-producting every cluster; 20 deletes the boundary cluster US and the floor eats its own definition; ASC flips the read order. The deeper habit: a funnel is only honest when its arms share the fold and the floor is stated next to the gate — the moment an arm's population drifts, the reconciliation check is the only thing between the board and a plausible lie.",
    },
    {
      id: "cs-indrive-2",
      tier: "easy",
      topic: "t4",
      universe: "growth",
      title: "The launch pacing board",
      brief:
        "inDrive-flavored brief on the storefront db: the expansion team reads launch pacing monthly — offers posted per launch month, gated at the eight-offer bar a launch city must clear to count as pacing. Probed facts: the 2024-01..2025-02 spine holds 14 months; months clearing the bar are 2024-01 (8 offers, 1 expired, 3,731.97), 2024-02 (9, 0, 3,609.64), 2024-03 (8, 1, 2,617.08), 2024-05 (8, 0, 2,910.31), 2024-07 (8, 2, 1,193.86 — the trough month that carries two expiries), 2024-09 (9, 0, 3,116.04); six months sit below the bar (6-7 offers). The board reads calendar-first because pacing is a time series, and the month key must keep January 2024 and January 2025 apart.",
      ask: "Return every launch month that clears the eight-offer bar with its offer count, expired count and fare volume — calendar order, earliest first.",
      template:
        "SELECT STRFTIME({1}, o.created_at) AS launch_month,\n       COUNT(*) AS offers,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS expired,\n       ROUND(SUM(o.total), 2) AS fare_volume\nFROM orders o\nGROUP BY launch_month\nHAVING COUNT(*) >= {2}\nORDER BY launch_month {3};",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the launch-month key",
          why: "'%Y-%m' keeps January 2024 and January 2025 apart while bucketing months — 14 spine buckets on this ledger. '%m' folds both Januaries into one bucket and the pacing curve mixes two years; '%Y' collapses the whole board to two rows.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the pacing bar",
          why: "Eight posted offers in a month is the bar a launch city must clear — six months make it (8, 9, 8, 8, 8, 9) and the boundary is live: 7 would admit five sub-bar months (2024-04, 2024-08, 2024-10, 2024-12, 2025-02) and 9 would leave only the two nine-offer months.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the calendar-first direction",
          why: "Pacing is a time series: the board reads 2024-01 first and walks forward. DESC opens on 2025-02 and the review reads the launch story backwards — trough before peak, cause after effect.",
        },
      ],
      distractors: ["'%Y'", "'%m'", "9", "DESC"],
      walkthrough:
        "A bar, a spine, a trough. STRFTIME('%Y-%m', created_at) buckets the 103 offers into 14 launch months; the expired arm SUM(CASE WHEN status = 'cancelled' …) rides the same fold, and ROUND(SUM(o.total), 2) prices each month. HAVING COUNT(*) >= 8 keeps the six pacing months: 2024-01 (8 offers / 1 expired / 3,731.97), 2024-02 (9 / 0 / 3,609.64), 2024-03 (8 / 1 / 2,617.08), 2024-05 (8 / 0 / 2,910.31), 2024-07 (8 / 2 / 1,193.86), 2024-09 (9 / 0 / 3,116.04) — and ORDER BY launch_month ASC walks them calendar-first, the direction the expansion review reads. The month that makes the meeting: 2024-07 clears the bar on volume while carrying two expiries and the ledger's fare trough — pacing yes, quality no. The distractors each break differently: '%Y' collapses the board to two year-rows; '%m' folds both Januaries and twelve-plus monthly buckets mix two years; 9 shrinks the board to the two nine-offer months and deletes the 2024-07 trough story; DESC walks the launch story backwards. The deeper habit: a pacing board is a time series with a stated floor — the bar, the key and the direction are three separate decisions, and each one silently rewrites the story if left to default.",
    },
    {
      id: "cs-indrive-3",
      tier: "hard",
      topic: "t5",
      universe: "funnel",
      title: "The power-poster board",
      brief:
        "inDrive case on the storefront db (orders = posted offers, customers = riders): city ops is picking power-posters for a loyalty pilot and wants the rider board ranked by offers posted — RANK, with the tie policy visible, not hidden. Probed shape: offer counts run 24, 17, 14, 13, 5 at the top, then a FOUR-way tie at 4 posted offers (Pedro Alvarez, Keiko Sato, Isabella Rossi, Noah Meyer), then a pair at 3 (Farid Nasser, Hiro Tanaka). The board floor is 3 posted offers — the pair sits exactly on it, so the gate's value shows up in the result. Policy ask from the GM: shared rungs WITH gaps — after a four-way tie at rank 6, the next rung must land at rank 10 — and ties read alphabetically inside the rung.",
      ask: "Return qualifying riders with offer count and rank — shared rungs, gaps after ties, alphabetical inside a rung.",
      template:
        "SELECT c.name AS rider,\n       COUNT(*) AS offers_posted,\n       {1}() OVER (ORDER BY COUNT(*) DESC) AS rnk\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id\nHAVING COUNT(*) >= {2}\nORDER BY rnk ASC, rider {3};",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie policy",
          why: "The GM asked for shared rungs WITH gaps: RANK gives the four 4-offer riders rung 6 and lands the next pair at rung 10 — the gap makes the size of the tie visible. DENSE_RANK would compact those 3-offer riders to rung 7 and hide that four riders were leapfrogged; ROW_NUMBER would split the tie arbitrarily by scan order.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the board floor",
          why: "The floor is 3 posted offers — the pair (Farid Nasser, Hiro Tanaka) sits exactly on it, so the gate value appears in the offers_posted column and the board self-checks. A floor of 4 deletes the rung-10 tail the tie story needs; 5 deletes the tie itself.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the within-rung order",
          why: "Inside a shared rung the board reads alphabetically: rider ASC makes the four-way tie deterministic (Isabella, Keiko, Noah, Pedro) on every run. DESC is also deterministic — but a different board each time someone 'fixes' it, so the direction is policy, stated in the header.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "4", "5", "DESC"],
      walkthrough:
        "A leaderboard where the tie policy IS the deliverable. The join attaches each of the 103 posted offers to its rider, GROUP BY folds one row per rider, and RANK() OVER (ORDER BY COUNT(*) DESC) stamps shared rungs with gaps: Alice Chen 24 (rung 1), Emma Wilson 17 (2), Grace Kim 14 (3), Maya Patel 13 (4), Chloe Dubois 5 (5), then the four-way tie at 4 offers — Isabella Rossi, Keiko Sato, Noah Meyer, Pedro Alvarez all at rung 6 — then Farid Nasser and Hiro Tanaka at 3 offers, rung 10. That 6-to-10 jump is the whole read: RANK announces that four riders were leapfrogged, which DENSE_RANK (7) hides and ROW_NUMBER (7, 8) silently referees by scan order. The HAVING >= 3 floor is calibrated to the tie pair's own count, so the gate value appears in the offers_posted cells and the board self-checks; ORDER BY rnk ASC, rider ASC makes ties alphabetical and reproducible. The distractors encode the policy failures: DENSE_RANK compacts the tail to rung 7 and buries the gap; ROW_NUMBER hands the rung to whoever the engine read first; a floor of 4 deletes the rung-10 pair the story needs; 5 deletes the tie itself; and DESC alphabetizes every rung backwards — same numbers, different board, every run.",
    },
    {
      id: "cs-indrive-4",
      tier: "easy",
      topic: "s6",
      universe: "expense",
      title: "The launch-city cost stack",
      brief:
        "inDrive case on the storefront db (expenses = the city-ops cost ledger, amount_cents in INTEGER cents): the launch budget review wants the cost stack classified in ONE CASE pass — fixed (city-hub leases), demand-gen (rider acquisition) and run-rate (everything else) — with entry counts and dollars per class. Probed ledger: 36 expense entries; Rent runs 14 entries worth 16,800.00 and Ads 14 entries worth 4,570.00, while the ELSE arm sweeps Travel (3 / 2,521.00) plus Tools (5 / 1,525.00) into an 8-entry, 4,046.00 run-rate class. The review keeps classes fielding at least 8 entries — the run-rate class sits exactly on the boundary, so the gate's value appears in its own entry count and the census self-checks. Biggest spend on top.",
      ask: "Return one row per cost class: label, entry count, dollars (2dp) — biggest spend on top.",
      template:
        "SELECT CASE WHEN e.category = {1} THEN 'fixed'\n            WHEN e.category = {2} THEN 'demand-gen'\n            ELSE 'run-rate' END AS cost_class,\n       COUNT(*) AS entries,\n       ROUND(SUM(e.amount_cents) / 100.0, 2) AS spend\nFROM expenses e\nGROUP BY cost_class\nHAVING COUNT(*) >= {3}\nORDER BY spend {4};",
      slots: [
        {
          answer: "'Rent'",
          kind: "keyword",
          label: "the fixed-class literal",
          why: "Fixed means the city-hub leases: category = 'Rent' — 14 entries, 16,800.00, two-thirds of the ledger's spend. String comparison is case-sensitive here: 'rent' matches nothing and the fixed class silently vanishes into run-rate, inflating it to 21,370.00.",
        },
        {
          answer: "'Ads'",
          kind: "keyword",
          label: "the demand-gen literal",
          why: "Demand-gen is rider acquisition: category = 'Ads' — 14 entries, 4,570.00. Arm order matters: a row fires the FIRST matching arm, so 'Ads' must sit in its own arm above the ELSE catch-all or its 14 entries fold into run-rate and the review loses the acquisition line entirely.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the review gate",
          why: "Classes fielding at least 8 entries make the review — and the run-rate class fields exactly 8 (Travel 3 + Tools 5), so the gate value appears in its own entries cell and the census self-checks. 9 would drop the boundary class; 7 changes nothing and reads as a typo; 15 empties the review.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-spend-first direction",
          why: "The budget review reads the biggest stack first: fixed (16,800.00) over demand-gen (4,570.00) over run-rate (4,046.00). ASC opens on run-rate and buries the rent story the meeting exists to have.",
        },
      ],
      distractors: ["'Travel'", "'fixed'", "9", "15", "ASC"],
      walkthrough:
        "One CASE, one scan, three classes — and the boundary row is the audit. The fold labels all 36 expense entries in place: Rent to fixed (14 entries, 16,800.00 — the city-hub stack), Ads to demand-gen (14, 4,570.00), and the ELSE catch-all sweeps Travel plus Tools into run-rate (8, 4,046.00). The cents rule rides the fold: SUM(amount_cents) stays in INTEGER cents exactly, and the /100.0 display-edge conversion prints dollars — the missing .0 is integer division and floors every odd-cent entry. HAVING COUNT(*) >= 8 keeps all three classes with the run-rate boundary row surviving at exactly 8, so the gate value is visible in the result; ORDER BY spend DESC reads fixed first. The distractors encode the budget-review failures: 'Travel' in the fixed arm relabels the 3-entry travel line as fixed and the hub leases fall to run-rate; 'fixed' in the demand-gen arm merges Ads into fixed — 28 entries, 21,370.00 — and the acquisition line the meeting tracks disappears; 9 drops the boundary class and the census no longer sums to 36; 15 empties the review entirely; ASC opens on run-rate. The audit identity: 14 + 14 + 8 = 36 entries — the classes reassemble the ledger or the fold is lying.",
    },
    {
      id: "cs-indrive-5",
      tier: "medium",
      topic: "j5",
      universe: "refund-audit",
      title: "Claims with no settlement rows",
      brief:
        "inDrive case on the storefront db (invoices = city billing claims, payments = driver settlement rows, amount_cents in INTEGER cents): the refund-audit desk wants the settlement queue — claims on the books with NO settlement row behind them, because the status column is a claim and the settlement rows are the ledger of record. Probed state: 28 claims on file, 22 carry at least one settlement row, 6 carry none — 15,217.00 outstanding across them — and one of the six (#28, 1,756.00) is marked paid with zero rows: the mirror of void-but-paid #11 (925.00), which HAS a row and therefore stays out of this queue. The desk clears the queue biggest-first, capped at the six claims this cycle can chase.",
      ask: "Return the queue: claim id, status, amount (2dp) — biggest claim first, capped at 6.",
      template:
        "SELECT i.id AS claim_id,\n       i.status,\n       ROUND(i.amount_cents / {1}, 2) AS claim_amount\nFROM invoices i\n{2} JOIN payments p ON p.invoice_id = {3}\nWHERE p.id {4}\nORDER BY claim_amount {5}\nLIMIT {6};",
      slots: [
        {
          answer: "100.0",
          kind: "keyword",
          label: "the cents divisor",
          why: "amount_cents is INTEGER cents: the display edge divides by 100.0 — the .0 forces real division. /1 leaves raw cents (claim 28 prints 175600), /10 shifts a decimal, and the conversion belongs once, at the edge — not inside any fold.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the claim-side spine",
          why: "The claim is the spine: LEFT JOIN keeps all 28 claims and lets the 6 with zero settlement rows survive as NULL payment columns. INNER JOIN silently drops exactly those 6 — the queue would ship empty and the audit would miss its entire exceptions list.",
        },
        {
          answer: "i.id",
          kind: "keyword",
          label: "the claim-to-settlement key",
          why: "The FK is directional: p.invoice_id = i.id attaches each settlement row to ITS claim. p.invoice_id = p.id is a self-comparison that matches almost nothing — the join degenerates and the queue fills with unrelated claims wearing NULL amounts.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the no-row guard",
          why: "Zero settlement rows read as NULL payment columns after the LEFT JOIN — the guard is p.id IS NULL. IS NOT NULL answers the mirror question (the 22 settled claims), and a bare '=' with NULL compares UNKNOWN and returns nothing at all.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The desk chases money, biggest first: claim 24 at 4,937.00 leads and claim 18 at 873.00 closes the queue. ASC spends the cycle on the two smallest claims and the cap cuts the real exposure.",
        },
        {
          answer: "6",
          kind: "number",
          noVerify: true,
          label: "the cycle cap",
          why: "The team chases 6 claims this cycle — and the queue holds exactly 6 (ids 24, 26, 27, 28, 21, 18), so the cap is a workflow constant that happens to match the census. Flagged no-verify: it is a chase budget, not a probed figure; the 6-and-15,217.00 census itself is verified in the walkthrough.",
        },
      ],
      distractors: ["INNER", "IS NOT NULL", "1", "3", "=", "ASC"],
      walkthrough:
        "The anti-join is the honesty mechanism. All 28 claims ride the spine LEFT JOINed to their settlement rows; the guard WHERE p.id IS NULL keeps the 6 with zero rows — ids 24 (4,937.00), 26 (3,562.00), 27 (2,794.00), 28 (1,756.00), 21 (1,295.00), 18 (873.00) — 15,217.00 outstanding, ORDER BY claim_amount DESC, LIMIT 6 = the whole queue. The headline anomaly sits in plain sight: claim 28's status says paid but the settlement rows say never — a status that lies, which is why the queue reads rows, not statuses; and void-but-paid claim 11 (925.00) stays OUT of the queue precisely because it HAS a row — the two error modes are mirrors, and a queue built on either alone misses the other. The cents rule is the display edge: /100.0 after the fold, the .0 forcing real division. The distractors encode the audit-killing failures: INNER joins away all 6 exceptions and ships an empty queue; IS NOT NULL returns the 22 settled claims — the mirror census, plausible-looking and useless; /1 prints raw cents (175600 on claim 28); /3 divides by three; '=' with NULL compares UNKNOWN and returns nothing; ASC chases the smallest claims first and the cap truncates the exposure; LIMIT 1 ships one row as a queue. The reconciliation habit: 22 + 6 = 28 claims — the settled census plus the queue must reassemble the book before the memo goes out.",
    },
    {
      id: "cs-indrive-6",
      tier: "hard",
      topic: "t7",
      universe: "month-close",
      title: "The bar-to-bar pacing walk",
      brief:
        "inDrive case on the storefront db (orders = posted offers): month-close wants the pacing walk — fare volume per launch month WITH the move from the previous on-board month, built on LAG. Definition first, because a delta has a denominator too: the board carries only months clearing the eight-offer pacing bar, so the walk is bar-to-bar — 2024-05's move is measured against 2024-03, the previous on-board month, not against the quiet April the gate dropped. Probed walk: 2024-01 opens at 3,731.97 with a NULL baseline, 2024-02 slips -122.33, 2024-03 drops -992.56, 2024-05 lifts +293.23, 2024-07 falls -1,716.45 into the 1,193.86 trough, and 2024-09 rebounds +1,922.18 to 3,116.04 — the single biggest move on the board. Calendar order, oldest first.",
      ask: "Return each pacing month with offer count, fare volume (2dp) and the bar-to-bar move (2dp) — calendar order.",
      template:
        "SELECT STRFTIME('%Y-%m', o.created_at) AS launch_month,\n       COUNT(*) AS offers,\n       ROUND(SUM(o.total), 2) AS fare_volume,\n       ROUND(SUM(o.total) - LAG({3}) OVER (ORDER BY STRFTIME('%Y-%m', o.created_at)), 2) AS mom_delta\nFROM orders o\nGROUP BY launch_month\nHAVING COUNT(*) >= {1}\nORDER BY launch_month {2};",
      slots: [
        {
          answer: "8",
          kind: "number",
          label: "the pacing bar",
          why: "Eight posted offers is the bar a launch month must clear to stay on the board — six months make it and the bar's value appears in the offers cells (8, 9, 8, 8, 8, 9), so the gate self-checks. 7 admits five sub-bar months and re-chains every delta; 9 leaves only the two nine-offer months and the walk collapses to one move.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the calendar direction",
          why: "A walk reads oldest-first: ASC opens on 2024-01's NULL baseline and every delta chases the month above it. DESC walks the story backwards — the rebound prints before the trough that caused it — and LAG quietly becomes LEAD's twin: 'next month' dressed as 'previous'.",
        },
        {
          answer: "SUM(o.total)",
          kind: "keyword",
          label: "the folded measure behind LAG",
          why: "LAG must lag the SAME fold the board prints: LAG(SUM(o.total)) over the grouped months. COUNT(*) would diff offer counts instead of dollars (the trough still shows but the fare story vanishes), and AVG(o.total) would diff per-offer averages — a real series wearing the wrong name.",
        },
      ],
      distractors: ["9", "7", "DESC", "COUNT(*)", "AVG(o.total)"],
      walkthrough:
        "A MoM walk where the population statement is the delta's denominator. GROUP BY folds the 103 offers onto the month spine; HAVING COUNT(*) >= 8 keeps the six pacing months; LAG(SUM(o.total)) OVER (ORDER BY the month key) carries each on-board month's predecessor, and SUM minus LAG is the bar-to-bar move: 2024-01 NULL baseline (nothing precedes it — report NULL, never coalesce to zero), 2024-02 -122.33, 2024-03 -992.56, 2024-05 +293.23 against 2024-03 (April's 7 offers were gated off, so the walk skips it by definition — the brief said so), 2024-07 -1,716.45 into the 1,193.86 trough, 2024-09 +1,922.18 out of it — the biggest move on the board and the number the close leads with. The distractors encode the definition failures: a bar of 7 re-chains the walk through five sub-bar months and every delta changes; 9 reduces the board to one move; DESC walks the calendar backwards; LAG(COUNT(*)) diffs offer counts — a volume walk wearing the fare board's name; LAG(AVG(o.total)) diffs per-offer averages and calls it pacing. The habit: LAG is only as honest as the row list it walks — state which months are on the board, and the first row's NULL stays NULL.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-ii", why: "Class-line folds: fare volume per vehicle class across all offers — the category-crown read supply reviews quote from the same GROUP BY." },
    { slug: "sales-analysis-iii", why: "Offers posted inside a launch window — the date-filter drill behind 'how did the new city do in its first month?'" },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The rider with the most posted offers — the power-poster read city teams use to find funnel power users in a launch cohort." },
    { slug: "game-play-analysis-i", why: "First-ever activity per rider — the first-offer date that anchors every launch-cohort and city-anniversary read." },
    { slug: "unique-orders-and-customers-per-month", why: "Monthly distinct offers AND distinct posting riders — the launch-pacing pair, one query, two grains, both honest." },
    { slug: "sellers-with-no-sales", why: "Driver cohorts with no accepted volume — the anti-join grammar, plus the discipline to report this ledger's verified zeros honestly (every cohort here has accepts)." },
    { slug: "customers-who-never-order", why: "The anti-join itself — and the verified zero: this ledger has 0 never-posting riders, which is a finding, not a failure." },
    { slug: "sales-analysis-ii", why: "Riders who posted in one launch window but not another — the two-period anti-join city teams run for supply churn." },
    { slug: "top-travellers", why: "Payout folds per driver cohort — earnings summed across the rides they carried, ordered for the payout run." },
    { slug: "fix-names-in-a-table", why: "Rider name hygiene — CONCAT/UPPER normalization for city-ops rosters and payout CSVs that span launch markets." },
    { slug: "recyclable-and-low-fat-products", why: "Class attribute filters — the two-flag WHERE drill behind 'show budget classes with instant-accept only'." },
    { slug: "not-boring-movies", why: "Odd-id, high-rated filter drills — WHERE craft with id parity and rating gates that city filters reuse daily." },
    { slug: "second-highest-salary", why: "The second-highest class fare ceiling — LIMIT/OFFSET versus MAX-peel, the fare-ladder read without a premium band to lean on." },
    { slug: "npv-queries", why: "Rate lookups joined to their rows — per-offer multiplier joins, the shape behind dynamic fee lookups at offer time." },
    { slug: "calculate-special-bonus", why: "CASE-assigned bonuses — a payout rule that fires only for some rows, written as a conditional column in the payout fold." },
    { slug: "weather-type-in-each-country", why: "Cluster-level CASE classification — statuses folded into operational bands per city, joined from the cluster table." },
    { slug: "sales-analysis-i", why: "The leg-grain attach: every trip leg joined to its offer and rider — the detail layer beneath the cluster census, quoted row by row when a cluster's numbers don't reconcile." },
    { slug: "average-salary-of-departments", why: "Cluster AOV against the platform-wide 338.19 benchmark — the two-level fold (cluster fold, ledger-wide scalar) city reviews run to see who prices above the house." },
    { slug: "employee-bonus", why: "Payout rows with a conditional bonus column — the NULL-fill drill behind driver incentive runs, where a rule that fires for some rows must not invent money for the rest." },
    { slug: "students-and-examinations", why: "Zero-filled rider × month census — quiet launch months must appear on the pacing board, not vanish from the GROUP BY; the calendar-spine habit in drill form." },
    { slug: "sales-person", why: "Two-sided cohort census — driver cohorts with zero accepted volume checked against riders with no completions, anti-joins that prove zeros instead of assuming them." },
    { slug: "find-churn-risk-customers", why: "Riders whose latest posted offer is aging out — the churn-risk read growth runs weekly before the re-offer email goes out." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Posted-but-never-moved riders — the awaiting/expired population is the supply-gap signal, and this anti-join is how the win-back list gets built." },
    { slug: "students-with-invalid-departments", why: "Settlement rows pointing at claims that don't exist — the orphan-FK sweep the reconciliation memo runs before it claims the books tie." },
    { slug: "group-sold-products-by-the-date", why: "Class mix folded per launch day into one cell — the GROUP_CONCAT city card, ordered and separated deliberately so the cell doesn't reshuffle between runs." },
    { slug: "daily-leads-and-partners", why: "Per-day per-cluster status census — the daily board that mirrors the morning one-pass fold, at day grain where timestamp ties start to matter." },
    { slug: "biggest-window-between-events", why: "LEAD gaps between a rider's consecutive offers — re-offer cadence is the negotiation trace, and the biggest gap is the rider the supply team calls first." },
    { slug: "second-most-recent-activity", why: "Keep-the-second-offer read — RANK with a filter at rung 2, the staging habit: fold, rank, filter outermost, never inline." },
    { slug: "sales-by-day-of-the-week", why: "Day-of-week fare pivot — late-night demand columns city ops staffs against; the pivot shape behind 'Fridays carry the night fares'." },
    { slug: "top-percentile-fraud", why: "Settlement-tail percentile screens — which claims sit in the worst decile of amount before the fraud spot-check opens the queue." },
    { slug: "trial-balance-check", why: "The ledger tie: debits = credits (181,080 = 181,080 on this book) — the invariant every month-close prints before the writeup goes out." },
    { slug: "find-the-missing-ids", why: "Recursive month-spine gap finder — the launch calendar's holes generated, not assumed, so quiet months surface as rows instead of vanishing." },
  ],
};
