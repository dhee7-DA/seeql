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
  ],

  dayInLife: [
    "**08:15 —** The day opens on the offer board: overnight posted offers versus accepted-and-moving — 82 of 103 — and the first query is the one-pass cluster census, one scan per city cluster: offers, accepted, awaiting, expired, fare volume in a single GROUP BY. The numbers must reconcile before the standup: accepted arms sum to 82, awaiting to 14, expired to 7, and the leg fan-out (251 legs under 103 offers) says whether yesterday's supply actually answered demand. A drift here is the day's first fire, and the analyst who can write the census *and* the diff against yesterday's fold owns the incident.",
    "**11:00 —** Midday is launch deep-work. The expansion team wants the pacing board: offers per launch month on the 2024-01..2025-02 spine, gated at the eight-offer bar — six months clear it, and 2024-07 is the month that makes the review hard (8 offers, 2 expiries, only **1,193.86** of fare volume). A supply manager wants driver-cohort share of accepted volume — the top cohort carries 32% — and a city GM asks why the awaiting queue climbed from 5 to 6 in their cluster: `SUM(CASE WHEN o.status = 'pending' …)` per cluster, *counted per offer, never per leg*.",
    "**16:30 —** The afternoon is the stakeholder cycle: the launch review walks the pacing board month by month, then the settlement desk takes the books — 28 `invoices`, `amount_cents / 100.0`, six unsettled claims worth 15,217.00, with #28 — the 1,756.00 bill {rose:marked paid with zero settlement rows} — queued beside its mirror, #11, void-but-paid at 925.00. The day closes with the writeup: census reconciliations printed, denominators named, *every funnel number legible at the grain it claims*.",
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
  ],
};
