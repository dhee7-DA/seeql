// Yassir — kit 14 of the Ride-hailing & Mobility domain (Batch L, wave 7).
// MENA super-app: on-demand rides, delivery and fintech in one wallet —
// multi-vertical engagement, driver earnings, city-cluster ops. Pool
// provenance: 0 tagged LC — theme-curated. Every problem and topic slug is
// drawn from the Theme menu in scripts/company-pools.md (sql rows), picked
// to mirror Yassir's known screen themes: job funnels, one-pass FILTER
// censuses, city-cluster keys, honest-denominator rates, cohort leaderboards,
// tier CASE bands, launch-month pacing, job-close windows, settlement books
// in INTEGER cents.
// Case studies run on the storefront db (db/custom.db) with probed figures
// from scripts/company-facts.md (probed 2026-10-12), mapped honestly:
// orders = job requests across the verticals, shipped_at = the job-close
// stamp on the batched ops clock (2.98-day average, 2..4 — a back-office
// batch stamp, not door-to-door minutes), customers = app customers,
// suppliers = driver cohorts, products = service tiers (price = the tier
// fare ceiling; the 199.99 top is a ceiling and the premium band above it
// is empty by design), category = vertical family, order_items = job legs
// under each request (251 legs on 103 requests), region = city cluster,
// invoices/payments = the merchant billing and driver settlement books
// (INTEGER cents — divide by 100.0). Every case slot is mechanically
// verified against the live db by scripts/case-audit.ts.
//
// Expansion (task 95-yassir, 3x append-only): brief 4→6, dayInLife 3→4,
// metrics 8→12, topics 10→15, theory t9–t24, mcqs 11–30, cases
// cs-yassir-3..6 (topics s6/t7/q2/x2 — pairwise distinct, distinct from the
// original x3/j4), problems 16→32. Yassir's tagged pool remains 0 sql rows,
// so all new topic/problem slugs are theme-curated rows from the
// company-pools.md theme menu. New-case number cells and every
// distractor×slot substitution were probe-verified against db/custom.db by
// a one-shot read-only probe run.

import type { CompanyKit } from "../types";

export const yassirKit: CompanyKit = {
  id: "yassir",
  domainId: "mobility",
  name: "Yassir",
  tagline: "MENA super-app: rides, delivery, fintech",
  accent: "text-cyan-300",

  brief: [
    "**Yassir** is the MENA super-app: rides, delivery and fintech living in one wallet, where the same customer hails a ride, orders groceries and pays both from the same balance. The analytics unit is the job request, and on this kit's proxy ledger it reads 103 job requests worth **34,833.28** (average 338.19) across 16 customers, with 251 job legs fanning underneath — multi-stop jobs across the verticals. The status map is the job funnel: 52 {emerald:completed} (50.5%), 30 en route (29.1%), 14 still awaiting acceptance (13.6%), 7 {rose:customer-cancelled} (6.8%).",
    "Two reads define the analyst job here. The {amber:one-pass cluster census}: city ops opens with a single-scan fold per city cluster — jobs, moving, awaiting, cancelled, volume in one GROUP BY (EU: 45 jobs, 36 moving, 6 awaiting, 3 cancelled, **15,089.23**) — because the same fold runs every morning in every launch city. The {sky:supply-side read}: six driver cohorts carry capacity, the top cohort takes 32% of settled volume (11,130.25) and the top two 58.7% — concentration is a supply-risk conversation, not trivia. The close stamp runs on a batched ops clock: 2.98-day average over the 82 stamped jobs, range 2..4.",
    "Interviews are funnel-first, one-pass-flavored, cents-precise. A screen opens with a warm-up join (attach job legs to their request), escalates into a conditional fold (`SUM(CASE WHEN …)` is the house idiom), then lands on a rate where the denominator is the whole test: moving ÷ ALL posted jobs, awaiting and cancelled included, or the funnel flatters itself. Fintech rounds go through the books: 28 `invoices` against 27 `payments`, INTEGER cents read as `amount_cents / 100.0`, 6 unpaid claims worth 15,217.00, one of them — #28, 1,756.00 — *marked paid with zero settlement rows*. Follow-ups are spoken aloud: 'is that per job or per leg?', 'does an awaiting job sit in your denominator?'",
    "Preparation strategy: Yassir has **0 tagged LC** rows in this app's pool, so the kit is **theme-curated** — all 30 topic slugs and 16 problems are hand-picked from the theme menu to mirror super-app screens: job funnels, cluster censuses, tier crowns, cohort earnings, launch pacing, settlement AR. Then run both case studies on the live db: one rebuilds the {amber:city ops stack} the ops board reads, the other rebuilds the {sky:driver-cohort earnings fold} the supply desk orders payouts from. The bar to clear: name the grain, state the denominator, and gate the NULLs deliberately before you compute anything.",
    "The wallet spine is the third business and it audits differently. Settlements ride two rails — `card` 16 payments worth **37,364.00**, `wire` the other 11 worth 32,248.00 — on uniform {sky:30-day terms} that actually clear in **28.4 days** (fastest 13, slowest 84). The exception pile is the risk file: 6 claims with zero settlement rows worth 15,217.00, one void-but-paid at 925.00, one partial at 4,000.00 of 6,148.00. The books still tie — 181,080 debits against 181,080 credits — so *every anomaly is classification, never balance*.",
    "Preparation roadmap for the expanded kit, four passes: run the one-pass cluster census (EU 45 jobs / 36 moving / 6 awaiting / 3 cancelled) until `SUM(CASE WHEN …)` is reflex; drill set ops — UNION ALL stacks, EXCEPT sweeps — because a super-app is always diffing two verticals' books; then windows, LAG pacing on the 14-month spine and frames that survive ties; then money — cents discipline across 28 claims against 27 settlements. Sit all six case studies: the {amber:ops stack}, the {sky:cohort-earnings fold}, the coverage classifier, the pacing walk, the above-mean fare screen, the rails census. The bar is unchanged — **name the grain, state the denominator, gate the NULLs** — *before you compute anything*.",
  ],

  dayInLife: [
    "**08:15 —** The day opens on the city board: overnight job requests versus moving-and-done — 82 of 103 — and the first query is the one-pass cluster census, one scan per city cluster: jobs, completed, en route, awaiting, cancelled, volume in a single GROUP BY. The numbers must reconcile before the standup: moving arms sum to 82, awaiting to 14, cancelled to 7, and the leg fan-out (251 legs under 103 requests) says whether yesterday's multi-stop jobs actually stitched together. A drift here is the day's first fire, and the analyst who can write the census *and* the diff against yesterday's fold owns the incident.",
    "**11:00 —** Midday is multi-vertical deep-work. The ops lead wants the {sky:close-stamp ladder} by cluster — JULIANDAY lag over the 82 stamped jobs, APAC's 2.93 benchmarked against LATAM's 3.5 — and a vertical GM wants the awaiting-acceptance queue per cluster (`SUM(CASE WHEN o.status = 'pending' …)`, *counted per job, never per leg*): EU 6, APAC 5, US 3. A supply manager asks why one cohort carries 56 legs but only 26.7% of settled volume — the legs-versus-earnings split that says which verticals a cohort actually serves — and the tier-crown read lands mid-block: the top vertical family books 11,744.01 of fare volume.",
    "**16:30 —** The afternoon is the stakeholder cycle, and it ends the day. The city review walks the ops stack with its {amber:TOTAL banner} and material floor, then the settlement desk takes the books — 28 `invoices`, INTEGER cents read as dollars, six unpaid claims worth 15,217.00, with #28 — the 1,756.00 claim {rose:marked paid with zero settlement rows} — queued beside its mirror, #11, void-but-paid at 925.00, and one partial claim settled at 4,000.00 of 6,148.00. The day closes with the writeup: census reconciliations printed, denominators named, *every funnel number legible at the grain it claims*.",
    "**21:30 —** The close-out is the wallet watch. The fintech desk runs the settlement census one last time before midnight: 27 settlements fold to **69,612.00** — card 16 rows / **37,364.00**, wire 11 / 32,248.00 — and the arms must reassemble the total or the close stops. Then the exception sweep: the {rose:cash-collection risk} file holds 6 claims worth 15,217.00 with zero settlement rows, one of them (#28, 1,756.00) still claiming {emerald:paid}, and the trial balance has to read 181,080 against 181,080 before tomorrow's ledger gate opens. The writeup ships *definitions first, figures second* — the 07:00 analyst inherits a chase list, not a mystery.",
  ],

  metrics: [
    { name: "Move rate", what: "Jobs with a driver moving or completed ÷ ALL posted requests: 82 of 103 (79.6%). Awaiting and cancelled stay in the denominator — the funnel never gets to flatter itself." },
    { name: "City-cluster census", what: "Per cluster in one pass: EU 45 jobs / 36 moving / 6 awaiting / 3 cancelled / 15,089.23; APAC 37 / 29 / 5 / 3 / 11,605.45; US 19 / 15 / 3 / 1 / 7,286.16; LATAM 2 / 2 / 0 / 0 / 852.44." },
    { name: "Awaiting-acceptance queue", what: "Pending jobs: 14 (13.6%) — EU 6, APAC 5, US 3. The live supply gap: a job waiting is a customer deciding between you and the next app on their home screen." },
    { name: "Job-close latency", what: "Request-to-close stamp on the batched ops clock: 2.98-day average over the 82 stamped jobs, range 2..4. The proxy clock reads batch back-office, not door-to-door minutes — say so or the number lies." },
    { name: "Cluster lag ladder", what: "Average close lag per cluster, stamped only: APAC 2.93 (29 jobs), EU 2.94 (36), US 3.07 (15), LATAM 3.5 (2). Fastest-first is how the ops review reads it." },
    { name: "Vertical tier crowns", what: "Fare volume by vertical family: the top family books 11,744.01 across 97 quantity-weighted legs, the smallest 863.91 — where engagement actually lives in the super-app." },
    { name: "Driver-cohort concentration", what: "Share of settled volume by cohort: the top cohort carries 32% (11,130.25), the second 26.7% (9,294.93) on MORE legs (56 vs 43) — cheaper legs, different verticals. Supply and renewal risk live in this fold." },
    { name: "Settlement AR", what: "Claims with no settlement rows: 6 worth 15,217.00 — one (#28, 1,756.00) marked paid with zero settlements, plus 1 partial (4,000.00 of 6,148.00). The anti-join the fintech desk runs monthly." },
    { name: "Cash-collection risk", what: "Unsettled value over billed value, measured on settlement rows: 15,217.00 of zero-row claims against the 28-claim book. Status labels are claims, not evidence — #28 reads paid with nothing behind it." },
    { name: "Wallet rails mix", what: "Settlement value by rail: card 16 payments / 37,364.00, wire 11 / 32,248.00, total 69,612.00 across 27 settlements. The arms must reassemble the total at every close." },
    { name: "Terms-versus-reality", what: "Bills issue on uniform 30-day terms; settled claims clear in 28.4 days on average (fastest 13, slowest 84 over 20 settled). Near-terms clearance is the collection-health signal." },
    { name: "Cohort quality ladder", what: "Driver-cohort service ratings run 4.8, 4.6, 4.4, 4.1, 4.0, 3.9 — only two clear the 4.5 trusted bench. Concentration (32% + 26.7% of settled volume) on a thin quality bench is the supply-risk stack." },
  ],

  topics: [
    {
      name: "Super-app job funnels",
      why: "Every city review opens with the funnel: requests posted, moving, awaiting, cancelled — counted per cluster without letting the leg fan-out double anything. Yassir drills which grain the query stands on before any aggregate runs, because a rate computed at leg grain prices a leg, not a job.",
      slugs: ["percentage-of-users-attended-a-contest", "immediate-food-delivery-i", "daily-leads-and-partners"],
    },
    {
      name: "One-pass FILTER censuses",
      why: "The census runs every morning, so it runs in ONE scan: FILTER (WHERE …) arms per status with branch totals that reconcile back to COUNT(*). Yassir treats the fold as standing infrastructure — five scans cost five table reads where one conditional fold costs one, and one fold guarantees every arm describes the same 103 jobs.",
      slugs: ["active-businesses", "find-stores-with-inventory-imbalance", "number-of-rich-customers"],
    },
    {
      name: "Cluster joins & two-sided keys",
      why: "Customers post jobs in one table and drivers answer in the flow — attaching a job to its cluster is an FK join whose wrong key silently cross-products. The drills pair tables where a missing side (a customer with no jobs, a cohort with no accepts) is a finding to prove, not noise to drop.",
      slugs: ["trips-and-users", "combine-two-tables", "employees-with-missing-information"],
    },
    {
      name: "Rates with honest denominators",
      why: "Move share, cancellation share, acceptance share — Yassir's ratios punish integer division and quiet denominator drift. The house habit: 100.0 before the division, the denominator's population decided BEFORE the ratio, rounding only at the very end.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "hopper-company-queries-ii"],
    },
    {
      name: "Cohort leaderboards",
      why: "Rank driver cohorts by settled volume or legs and ties are waiting — this ledger ties at 4, 3 and 2. The rank trio is a policy conversation: DENSE_RANK for peer ladders, RANK for rungs-with-gaps, ROW_NUMBER only behind a named deterministic tie-breaker.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Tier bands & CASE tiers",
      why: "The super-app prices in ceilings: 8 budget tiers under 50 (avg 32.06), 8 mid tiers to 199.99 (avg 111.50), and the premium band above 200 empty by design. CASE tiering — with the boundary row landing where the spec says — is how the board reads the shelf without inventing a premium story.",
      slugs: ["triangle-judgement", "the-category-of-each-member-in-the-store", "count-salary-categories"],
    },
    {
      name: "Month spines & launch pacing",
      why: "Expansion reads calendars: jobs per launch month on the 2024-01..2025-02 spine (14 buckets), the 1,193.86 July trough against the 3,731.97 January open. '%Y-%m' builds the spine; '%m' alone folds January 2024 into January 2025 and the pacing curve becomes fiction.",
      slugs: ["monthly-transactions-i", "hopper-company-queries-i", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "Job-close windows",
      why: "The close stamp lands on the batched ops clock: JULIANDAY(close) - JULIANDAY(posted) over the 82 stamped jobs, 2.98-day average, 2..4 range. The drill is the NULL gate — an unstamped job has no lag, not zero lag — and the window boundary that decides 'inside' versus 'outside' the clock.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "biggest-window-between-events"],
    },
    {
      name: "Settlement & cents discipline",
      why: "Merchant billing and driver payouts live in INTEGER cents: every dollar read is amount_cents / 100.0, and the missing .0 floors every odd-cent claim. The reconciliation culture is row-level: 6 unpaid claims (15,217.00), one void-but-paid (925.00), one paid with zero settlement rows (1,756.00).",
      slugs: ["bank-account-summary-ii", "customer-order-frequency", "generate-the-invoice"],
    },
    {
      name: "Multi-vertical argmax",
      why: "A super-app's bread-and-butter read is 'best per customer': the most-ordered tier per customer, the most recent job per tier, the day a customer came back after activating. Argmax shapes — RANK/ROW_NUMBER over a partition, or a correlated pick — are how the vertical GMs get their one row each.",
      slugs: ["most-frequently-ordered-product-per-customer", "the-most-recent-orders-for-each-product", "game-play-analysis-iv"],
    },
    {
      name: "Set operations & book sweeps",
      why: "A super-app is forever diffing books: which riders rode both verticals this week, which claims settled on one rail but not the other, which months exist on the spine but not in a city's book. UNION stacks build the full spine, INTERSECT finds the overlap, EXCEPT names the one-sided rows — and UNION ALL versus UNION decides whether the TOTAL banner double-counts.",
      slugs: ["movie-rating", "monthly-transactions-ii", "team-scores-in-football-tournament"],
    },
    {
      name: "Subquery shapes & staging",
      why: "Yassir's screens keep asking compare-a-group-to-the-whole: which cluster's average fare beats the platform's 338.19, which rider's spend beats their cluster's, which claim settles below its bill. Scalar subqueries, IN/EXISTS membership and derived-table staging each answer one of those shapes — picking the wrong shape is how a screen dies at the follow-up.",
      slugs: ["second-highest-salary", "managers-with-at-least-5-direct-reports", "investments-in-2016"],
    },
    {
      name: "Window frames & running math",
      why: "The pacing walk is running math: revenue down the 2024-01..2025-02 spine, cumulative settlement value against the close line, cohort earnings year-to-date. The default frame is RANGE — it silently swallows peer rows — and ROWS versus RANGE is the difference between a smooth curve and one that lurches at every tie.",
      slugs: ["find-cumulative-salary-of-an-employee", "running-total-for-different-genders", "account-balance"],
    },
    {
      name: "Streaks, gaps & dormancy",
      why: "Rider habit is streak-shaped: consecutive active days on the wallet, gaps between jobs, the quiet stretch that precedes churn. Gaps-and-islands and LAG/LEAD chains turn the job ledger into retention intelligence — the reads the engagement team runs before any push notification goes out.",
      slugs: ["user-purchase-platform", "report-contiguous-dates", "longest-winning-streak"],
    },
    {
      name: "Identity & catalog hygiene",
      why: "A MENA super-app onboards riders and drivers across three scripts and a dozen cities; names, tier labels and vendor strings arrive messy. The hygiene drills — case folding, trimming, pattern gates on identifiers — are the KYC-grade cleaning every payout and invoice join depends on.",
      slugs: ["fix-names-in-a-table", "invalid-tweets", "fix-product-name-format"],
    },
  ],

  theory: [
    {
      id: "yassir-t1",
      q: "A job request has multiple legs under it — 251 legs on 103 posted requests. What does COUNT(*) count after the join, and how do you keep the funnel honest?",
      a: "After the join, COUNT(*) counts LEGS — the fan-out multiplies every request by its leg count, and a 'posted jobs' column that prints 251 is a leg census wearing the wrong name. The honest funnel names one row per what for every aggregate: COUNT(*) on the requests table (or COUNT(DISTINCT job_id) after the join) counts jobs; COUNT on the leg side counts legs; and the ratio between them — 2.4 legs per job — is itself the multi-stop signal of a super-app order, not noise to dedupe away. The trap that catches candidates is blending grains in one query: SUM of leg fares divided by COUNT(*) of legs prices a leg, not a job. Say the grain out loud per column, per query — in a super-app the fan-out is the product stitching rides and delivery into one cart, and the funnel is only truthful when every column announces what a row is.",
      tag: "joins",
    },
    {
      id: "yassir-t2",
      q: "The morning census reports jobs, moving, awaiting, cancelled and volume per city cluster. Why build it as one conditional fold instead of five separate scans — and what must the arms do at the end?",
      a: "One pass because the census is standing infrastructure: the same fold runs every morning over the same table, and five scans cost five table reads where one conditional fold costs one. The idiom: COUNT(*) FILTER (WHERE status = 'delivered') plus sibling FILTER arms for shipped, pending and cancelled, with SUM(total) for volume — every arm computed inside the same GROUP BY, so all of them describe the SAME population of jobs. The contract at the end: arms reconcile — moving (82) plus awaiting (14) plus cancelled (7) sums back to COUNT(*) (103) — because a census whose arms don't reassemble the base is a guess with formatting. SUM(CASE WHEN …) is the equivalent portable idiom; the discipline is identical: one fold, one population, reconciliation printed next to the numbers.",
      tag: "aggregation",
    },
    {
      id: "yassir-t3",
      q: "The move rate is 82 of 103 posted jobs. Where does the status rule live in the query, and what does the number become if awaiting and cancelled jobs are filtered out first?",
      a: "The status rule is a ROW-level fact used as the numerator, so it lives inside a conditional aggregate: SUM(CASE WHEN status IN ('delivered','shipped') THEN 1 ELSE 0 END) over ALL posted jobs, divided by COUNT(*) from the same fold — 82 of 103, 79.6%. Filter to 'resolved' first and the denominator shrinks to 89; filter to delivered-only and it's 52 — real numbers, different metrics, wrong names. That's denominator drift, and in a super-app it's political: a share that quietly drops awaiting jobs makes supply look faster than it is, because the 14 riders still waiting are exactly the supply-gap signal city GMs need. The sibling trap is HAVING — it judges group aggregates after the fold, when the excluded jobs are already inside every cluster's total. The strong answer states the pipeline order and asks of every filter: fact about one row, or about a group?",
      tag: "aggregation",
    },
    {
      id: "yassir-t4",
      q: "Rank driver cohorts by settled volume and three cohorts tie. RANK, DENSE_RANK or ROW_NUMBER for the supply board — and where does the tie-breaker belong?",
      a: "The rank trio is a business decision about shared rungs and gaps. RANK shares the rung and skips — after a tie at rank r the next distinct value lands at r+1·(tied rows), implying phantom cohorts between the tie and the tail. DENSE_RANK shares rungs without gaps — the compact ladder a supply board wants, where tied cohorts visibly read as peers. ROW_NUMBER splits ties arbitrarily — a silent judgment call decided by scan order rather than policy. On a ledger like this one ties are structural (job counts repeat at 4, 3 and 2), so the policy ships WITH the query: DENSE_RANK for peer ladders, or a named deterministic tie-breaker written into the window's ORDER BY — settled volume DESC, cohort name ASC — so the board is reproducible. The wrong answer is picking a function; the right answer is picking a policy and labeling it in the header.",
      tag: "windows",
    },
    {
      id: "yassir-t5",
      q: "Benchmark each city cluster's cancellation share against the ledger-wide average using a scalar subquery. What breaks when the comparison cluster is an empty staging city?",
      a: "The shape: 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) > (SELECT the same fold computed ledger-wide) — an aggregate against an aggregate, which a WHERE or HAVING can't do inline. It breaks two ways. First, the empty staging city: the inner fold over a city with zero jobs yields NULL, the comparison becomes UNKNOWN, and HAVING passes nothing — a valid query that ships an empty slide, which is worse than a crash because the deck LOOKS finished. Second, the reverse: a cluster compared against a ledger average that includes itself — the benchmark moves as the row moves. The disciplined version stages the ledger-wide average once (CTE or scalar with its population stated), guards the empty case explicitly, and says whether the cluster is inside or outside its own benchmark. At a super-app launching city by city, the empty case is routine — the inner fold's population is part of the deliverable.",
      tag: "subqueries",
    },
    {
      id: "yassir-t6",
      q: "21 of 103 jobs have no close stamp yet. What is your NULL policy for the close-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped jobs have a latency, so the report measures the 82 stamped jobs of 103 and says so — the 14 awaiting and 7 cancelled have no lag, not zero lag. Then mechanics: AVG ignores NULLs, so AVG(lag) over ALL jobs returns the stamped-only average (2.98 days) with a silently shrunken population — a real number wearing the wrong name, unverifiable from the header. COUNT(stamp) counts the stamped subset; the gap between it and COUNT(*) IS the outstanding count, which is a feature — the awaiting queue is the supply-gap queue. What is never acceptable is IFNULL-ing the lag to zero to 'fix' the average: that folds 21 phantom zero-lag jobs into the mean and publishes instant closes for jobs nobody accepted. The gate lives in WHERE (close_stamp IS NOT NULL) with the population named in the header — and remember this ledger's clock is a batched back-office stamp, so 2.98 'days' is batch cadence, not door-to-door minutes; the honest framing is part of the number.",
      tag: "nulls",
    },
    {
      id: "yassir-t7",
      q: "The expansion review buckets jobs by launch month. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', posted_at) — year plus zero-padded month, 14 buckets on this ledger from 2024-01 to 2025-02; '%m' alone folds January 2024 into January 2025 and the pacing curve becomes fiction. The quarter window: half-open intervals — posted_at >= '2024-01-01' AND posted_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's jobs, and month-boundary nights are exactly when late-night ride demand lands in a launch city. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first delta is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month in a launch walk. Date discipline is launch discipline: the spine, the window and the edge row are where expansion reports go wrong.",
      tag: "dates",
    },
    {
      id: "yassir-t8",
      q: "The fintech desk says a settlement claim is marked paid but has no settlement rows behind it. Walk me through the reconciliation query you write first — and the cents rule you never break writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this book that returns 6 claims worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why the settlement rows are the ledger of record and the status column is a claim. Then the mirror check: a void claim WITH a settlement row (this book has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The cents rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 is integer division, it floors every odd-cent claim, and at wallet scale the counterparty audits line by line. One more super-app habit: when the same query feeds rides and delivery dashboards, the reconciliation is per VERTICAL grain — a fold that nets across verticals can hide that one vertical's book is broken while the total looks fine.",
      tag: "quality",
    },
    {
      id: "yassir-t9",
      q: "Before any folding starts: walk me through the order SQL actually evaluates a SELECT — WHERE, GROUP BY, HAVING, the window functions, ORDER BY. Where does the morning census break?",
      a: "The pipeline runs FROM/JOIN → WHERE → GROUP BY → the aggregate fold → HAVING → window functions → ORDER BY/LIMIT, and every downstream stage only sees what survived upstream. Two burns follow. First, a window function evaluates AFTER the fold, so it sees filtered, grouped rows — a running sum over the census inherits every WHERE exclusion, which is exactly how the 14 awaiting and 7 cancelled jobs vanish from a curve instead of reading zero. Second, you cannot filter on a window's own output in WHERE or HAVING — ROW_NUMBER() = 1 in a WHERE is an error, not a filter — so 'latest job per rider' wraps in a CTE or derived table and filters the wrap. At Yassir this is the morning census in miniature: the fold computes its arms over one population, HAVING judges the groups after, and anything that needs a window's answer needs a second pass. Say the order out loud and half the weird-number tickets close themselves.",
      tag: "pipeline",
    },
    {
      id: "yassir-t10",
      q: "What does the default window frame cover, and when does ROWS versus RANGE actually change a running curve on our settlement book?",
      a: "The default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — and RANGE treats peers as one: every row tied on the ORDER BY value joins the frame together. On the month spine that is invisible, because '%Y-%m' buckets are unique and the running revenue climbs cleanly from 2024-01's 3,731.97. It bites the moment the ORDER BY key repeats: run the cumulative settlement value ordered by amount_cents and the book ties — rows sharing an amount enter the frame in one lump, so the curve steps instead of walking. Pinning ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW forces the strict row-by-row walk; ROWS BETWEEN 2 PRECEDING AND CURRENT ROW builds a three-row moving window for smoothing. The habit to grade: whenever the ORDER BY key can repeat — amounts, leg counts, ratings — name the frame in review, because the default's peer-swallowing is silent and the two curves disagree exactly at the ties.",
      tag: "windows",
    },
    {
      id: "yassir-t11",
      q: "The ops stack ships as one CSV with a TOTAL banner row. Why UNION ALL there — and when would plain UNION be the bug?",
      a: "UNION ALL concatenates; UNION deduplicates and sorts. The stack wants concatenation: the state arms (delivered 52 / 15,571.07, shipped 30 / 11,996.72, pending 14, cancelled 7) plus the banner ('TOTAL', 103, 34,833.28) are all legitimate rows, and the reconciliation contract — arms reassemble the base — depends on every row surviving. Plain UNION opens two failure modes: it silently drops any two arms that tie on every column (a state row and another state row with the same count and volume — rare today, inevitable someday as the book grows), and it pays a sort-plus-dedupe cost on every morning run for a guarantee nobody asked for. The reverse discipline matters too: when you DO want set membership — overlapping rider sets across two verticals — UNION's dedupe is the feature, and UNION ALL would double-count the intersection. The rule I'd ship at Yassir: banners and censuses are UNION ALL, and every UNION lands with a comment naming what it is allowed to collapse.",
      tag: "setops",
    },
    {
      id: "yassir-t12",
      q: "Claims with no settlement rows — EXCEPT, NOT IN, or NOT EXISTS? Where does each one break?",
      a: "All three can name the 6 unpaid claims worth 15,217.00, and each fails differently. EXCEPT compares whole result sets: claim ids EXCEPT settlement invoice ids — clean, but it silently deduplicates and demands column-count and type alignment, so it is brittle to 'just add a column' edits. NOT IN is the trap: one NULL invoice_id on the payments side poisons the whole predicate — NOT IN (…NULL…) can never be true, the sweep returns ZERO claims, and the dunning report ships empty and looks finished. NOT EXISTS survives NULLs, reads as the business question ('no settlement row exists for this claim'), and uses the join key properly — it is the default I'd mandate. The company twist: this book's headline anomaly is a claim marked paid with zero settlement rows (1,756.00), so the anti-join is not cleanup, it is the ledger of record — and an anti-join that one stray NULL can silently empty is a control, not a query.",
      tag: "setops",
    },
    {
      id: "yassir-t13",
      q: "Per-claim coverage — settled versus billed — needs folding payments before comparing to the bill. Walk me through staging it, and why the naive one-pass fold lies.",
      a: "Five claims on this book settled in two rows (split payments), so joining invoices to payments and folding in one pass fans out: the bill side multiplies by its settlement-row count, and SUM(billed) over the join double-counts every split claim's bill. The fix is staging: a CTE (or derived table) folds one row per claim first — claim id, bill, SUM(amount_cents) settled — and only then does the outer query compare settled to billed and classify exact, partial or none. 28 claims in, 28 rows staged, 27 settlement rows folded into them, 6 landing at NULL settled — which the outer fold COALESCEs to zero so the 'no settlement' class sums honestly. Derived table versus CTE is readability and reuse: the CTE gets a name the next analyst can cite, which matters when the same staging feeds the classifier and the aging read. The transferable lesson is grain discipline: fold to the grain you compare at, then classify — never classify across a join that is still fanning.",
      tag: "ctes",
    },
    {
      id: "yassir-t14",
      q: "For each rider, their most recent job — correlated subquery, ROW_NUMBER wrap, or LAG? When is the correlated shape actually the right call?",
      a: "Three shapes, three tradeoffs. The correlated subquery runs once per outer row — 'posted_at = (SELECT MAX(posted_at) FROM jobs j2 WHERE j2.rider_id = j1.rider_id)' — simple, obviously correct, and O(rows × probe) costly at scale; at this ledger's size (16 riders, 103 jobs) it is perfectly fine and the most teachable. The ROW_NUMBER wrap partitions by rider, orders by posted_at DESC and filters rn = 1 in a second pass — the scaling shape, and it survives ties only if you name a deterministic tie-breaker. LAG is the wrong tool here: it walks a partition's rows and cannot pick 'the last one' without the same wrap. The right call for correlated is small outer sets plus a NULL-safe story: a rider with no jobs yields a NULL scalar, the comparison against NULL drops them — which is either a bug or exactly the never-activated filter you wanted, and the strong candidate says which. At Yassir I'd take the wrap for anything feeding a dashboard and keep correlated for one-off probes.",
      tag: "subqueries",
    },
    {
      id: "yassir-t15",
      q: "JULIANDAY deltas, STRFTIME buckets, DATE arithmetic — three timestamp moves. How do you choose, and what does each get wrong on our close stamp?",
      a: "They answer three different questions. JULIANDAY differences answer 'how long': the close-latency read, 2.98 days average over the 82 stamped jobs, range 2..4 — continuous math, and it honors time-of-day if the stamp carries one. STRFTIME('%Y-%m') answers 'which bucket': the 14-month launch spine, where '%m' alone folds January 2024 into January 2025 and the pacing curve becomes fiction. DATE arithmetic answers 'which side of a threshold': posted_at >= '2024-01-01' AND posted_at < '2024-04-01' — half-open, so the last night of March survives where BETWEEN quietly drops it. The Yassir caveat is honesty about the source: our close stamp is a batched back-office clock, so 2.98 'days' is batch cadence, not door-to-door minutes, and reading hours into a date-only stamp invents precision the data never had. Strong candidates name the question first, then the function — and label what the clock actually measures.",
      tag: "dates",
    },
    {
      id: "yassir-t16",
      q: "Mechanics check: what do SUM, COUNT(*) and COUNT(col) each return over an empty or NULL-riddled set on the settlement book?",
      a: "COUNT(*) counts rows and returns 0 on an empty set — the only aggregate that promises a zero. SUM over zero rows returns NULL, not 0: a staging city with no settlements folds to NULL, and ROUND(NULL/100.0, 2) is still NULL — the census cell prints NULL and the dashboard's total goes dark unless you COALESCE(SUM(...), 0) where zero is the business truth. COUNT(col) counts non-NULL values only, so COUNT(shipped_at) over 103 jobs reads 82 while COUNT(*) reads 103 — and that gap IS the awaiting-plus-cancelled queue, which makes it a feature when named and a bug when it silently re-labels a population. AVG ignores NULLs, so averaging a NULL-riddled column computes over the shrunken population without saying so. The settlement classifier leans on all three deliberately: COUNT(p.id) = 0 names 'no settlement', COALESCE(SUM(p.amount_cents), 0) prints honest zeros, and the arms reconcile because every arm describes the same population. Zero, NULL and missing are three different facts — the strong answer keeps them three.",
      tag: "nulls",
    },
    {
      id: "yassir-t17",
      q: "Define cash-collection risk the way this desk reports it — numerator, denominator, and what the status column gets wrong.",
      a: "Risk is unsettled value over billed value, measured on settlement rows: 6 claims with zero settlement rows worth 15,217.00, against a 28-claim book — that is the file the desk chases. The status column is a claim, not evidence: #28 reads 'paid' and has no settlement row behind it (1,756.00), while #11 reads 'void' and carries a settled 925.00 — so a status-based risk file catches the wrong claims in both directions, and the anti-join on settlement rows is the ledger of record. The denominator discipline: bill the whole book (28 claims), not just the open ones, or the ratio flatters the desk every time a paid-but-unsettled anomaly exists. Aging sharpens it — issued_on against the uniform 30-day terms, paid_on against due_on (cleared in 28.4 days on average, fastest 13, slowest 84) — so the file orders by how overdue, not just how much. And per vertical, always: a fold that nets across verticals can hide one vertical's broken book behind another's clean total.",
      tag: "kpis",
    },
    {
      id: "yassir-t18",
      q: "The growth team wants the wallet top-up funnel. Define the stages, the conversions, and the one number you refuse to compute.",
      a: "Stages on this ledger read straight off the job funnel: posted (103), moving — a driver accepted and is en route (82), completed (52), paid-and-settled downstream. The conversions are conditional counts over ONE population: 82 of 103 posted (79.6%) and 52 of 103 posted (50.5%) — denominators decided before the ratio, awaiting and cancelled staying in the base. The moves I'd refuse: 52 of 89 resolved is the resolved-job share wearing the funnel's name, and 52 of 82 moving is a completion rate pretending to be a conversion — each is a real metric with a different job, and collapsing them is how decks start lying. Per-cluster and per-month cuts are the actual product: EU 45 posted with 3 cancelled (6.7%), APAC 37 with 8.1% — the cancellation share by cluster is the funnel's leak map. And the number I'd put in the slide's title is the 14 awaiting: demand the supply side never answered, said louder than any conversion ratio.",
      tag: "kpis",
    },
    {
      id: "yassir-t19",
      q: "How would you define driver supply hours and utilization from a ledger like this — and what would you refuse to compute?",
      a: "The honest answer starts with what the ledger lacks: there is no online-hours column, so 'supply hours' as the industry computes it is not computable here, and I would refuse to fake it with a proxy that looks like one. What IS computable: legs carried per driver cohort (43, 56, 40, 25, 47, 40 summing to 251) against each cohort's share of settled volume (32% on 43 legs, 26.7% on 56), and the legs-versus-earnings split that says which verticals a cohort actually serves — the second cohort carries MORE legs for LESS money, which is a mix story, not an effort story. Utilization the honest way needs both sides — served jobs over available supply — and available supply is exactly the missing column, so the deliverable is legs-per-cohort trends plus the concentration read (top two cohorts carry 58.7% of settled volume) and the quality bench (ratings 4.8 down to 3.9, only two cohorts above 4.5). The strong candidate states the gap, ships the computable proxies, and names what instrument would close it — that is the difference between an analyst and a number generator.",
      tag: "kpis",
    },
    {
      id: "yassir-t20",
      q: "Multi-stop jobs stitch several legs under one request. Where does GROUP_CONCAT earn its keep, and what are its traps?",
      a: "It earns its keep at presentation grain: one row per job with its legs' tier labels folded into a cell — the multi-stop cart rendered as text — which is exactly what an ops CSV wants and exactly what no downstream aggregate wants. The traps: order is undefined by default, so the leg sequence can print scrambled unless the concatenation carries its own ORDER BY (or you stage legs with ROW_NUMBER and concatenate the staged order); length is effectively unbounded in SQLite, so a 40-leg job makes a cell that breaks the CSV; and the folded string is a dead end — you cannot sum, count or rank what is inside it, so any analysis goes back to the rows. The discipline I'd ship: GROUP_CONCAT only in the outermost presentation query, separator chosen deliberately, leg count kept as its own numeric column beside the string (the 251-legs-under-103-jobs fold), and never inside a CTE that later math depends on. A string cell is a view for humans; the ledger stays relational underneath.",
      tag: "aggregation",
    },
    {
      id: "yassir-t21",
      q: "The ops lead wants close-latency quartiles and a 'worst quartile' flag. NTILE, CASE bands, or percentile emulation — and what happens to the unstamped jobs?",
      a: "NTILE(4) OVER (ORDER BY lag) divides the 82 stamped jobs into near-quarters — 82 does not split by 4, so the remainders land in the earliest tiles (21/21/20/20), and that rule is worth saying out loud before anyone reads the quartiles as exact. CASE bands with named thresholds — 2, 3, 4 days, matching this ledger's actual range — are reproducible and legible in a way tiles are not: every analyst re-derives the same bands and the boundary row lands where the spec says. Percentile emulation buys precision the ops review does not need at this range. But the real question is the unstamped 21: they have no lag, so they enter no tile — and a worst-quartile flag computed over stamped jobs only must say so, or the flag reads as 'the network's worst' when it is 'the worst among stamped'. My ship: NTILE for the quick cut, CASE bands for the standing report, and a count of unstamped jobs printed beside the quartiles — the queue is the supply story, not noise in the tail.",
      tag: "windows",
    },
    {
      id: "yassir-t22",
      q: "When does a self-join beat a window function on a ledger like ours? Give me a concrete read you'd run.",
      a: "Self-joins answer pairing questions windows answer awkwardly: which two riders in the same cluster posted the same total on the same day (duplicate-posting sweep), which pairs of jobs share a leg pattern, which cohorts serve the same tier family. The concrete read I'd run: orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id AND o1.total = o2.total AND SUBSTR(o1.created_at,1,10) = SUBSTR(o2.created_at,1,10) — same rider, same day, same value: the duplicate-charge shape the fintech desk runs on payments. The trap is fan-out: a self-join without the asymmetric guard pairs every row with itself and counts each pair twice — COUNT doubles, and the a.id < b.id convention IS the query's correctness. Windows win for per-row neighbors (LAG to the previous job, running sums); self-joins win for row-to-row relations where 'the other row' is not adjacent in any single ordering. Say which side of that line your query lives on and the follow-ups get easy.",
      tag: "joins",
    },
    {
      id: "yassir-t23",
      q: "Beyond the cents rule — where do type-coercion traps hide in folds like ours, and what is your pre-flight check?",
      a: "Four places. Integer division: 92500/100 is 925 and hides, but 92.5 becomes 92 — the missing .0 floors every odd-cent claim, and the first counterparty audit finds it; the fix is promoting before dividing (amount_cents/100.0). Aggregation type: SUM over INTEGER cents stays INTEGER forever until something divides, so a grand total can look exact while every per-row division below it truncates. Comparison type: status = 'paid' is text, amount_cents >= 50000 is integer — mix them (method = 50000, amount_cents < 'cash') and SQLite does not error, it just returns rows you did not mean, because int-versus-text comparisons follow type ordering, not equality. String numbers: ids and codes that arrive as TEXT compare as text ('10' < '9'), so CAST before any numeric fold on imported keys. The pre-flight check I'd ship: for every fold, write the unit next to the column (cents, dollars, days, count) and make one query print both the raw and converted form of a known row — 92500 cents beside 925.00 dollars — so the type contract is visible, not assumed.",
      tag: "types",
    },
    {
      id: "yassir-t24",
      q: "Cluster average fares read 426.22, 383.48, 335.32 and 313.66. Does averaging those give the platform average — and what is the right fold?",
      a: "No — averaging the four cluster means weights LATAM's 2 jobs exactly like EU's 45, and the plain mean of those four numbers (364.67) is a fiction no population on the ledger actually has. The platform average is the weighted fold: SUM(total)/COUNT(*) over all 103 jobs, which reads 338.19 — and the per-cluster averages (EU 335.32, APAC 313.66, US 383.48, LATAM 426.22) are a different, legitimate metric whose weights are each cluster's own job count. Both can ship in the same memo if every number carries its name and its population: 'per-cluster AOV' versus 'platform AOV, all 103 jobs'. The divergence is itself signal — LATAM's 426.22 sits on 2 jobs and is fragile; the US's 383.48 sits on 19 and means something — so alongside the averages I'd print the n each rests on. The trap behind the trap: AVG of an AVG also appears when someone 'simplifies' a two-level fold into one query; the fix is the same discipline — go back to the row grain, fold once, label the population. Means of means are not means; they are opinions with formatting.",
      tag: "aggregation",
    },
  ],

  mcqs: [
    {
      id: "yassir-mcq-1",
      prompt: "Job requests join to job legs (251 legs under 103 posted requests). What does COUNT(*) count in the joined query?",
      choices: ["103 — the join preserves job grain", "251 — the fan-out multiplies jobs by their legs", "251 × 103 — a cross product", "It depends on the join direction only"],
      answer: 1,
      why: "After the join, COUNT(*) counts legs — one row per leg. The 2.4× fan-out is real super-app shape (multi-stop, multi-vertical jobs), and quoting it as a job count is the grain error this domain drills first.",
      notes: [
        { choice: 0, why: "Only COUNT(DISTINCT job_id) preserves job grain after the join. COUNT(*) counts whatever rows survive — and survival is at leg grain." },
        { choice: 2, why: "A cross product needs CROSS JOIN — an ordinary equi-join on job_id emits one row per matching leg, 251 total." },
      ],
      difficulty: "easy",
    },
    {
      id: "yassir-mcq-2",
      prompt: "Move rate: 82 moving, 14 awaiting, 7 cancelled, of 103 posted. Which denominator does the house definition use?",
      choices: ["Moving only (82/82)", "All posted jobs (82/103)", "Resolved jobs (82/89)", "Distinct customers (82/16)"],
      answer: 1,
      why: "The house definition: moving ÷ ALL posted — 79.6%. Awaiting jobs are accepted demand the supply side hasn't answered; every alternative computes a real but differently-named metric.",
      notes: [
        { choice: 2, why: "82/89 is the resolved-job share (92.1%) — calling it 'the move rate' inflates 79.6% by silently deleting the awaiting queue, which is exactly the supply-gap signal city GMs review." },
        { choice: 3, why: "82/16 is moving jobs per customer — an intensity ratio, not a rate. Rates divide populations of the same grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "yassir-mcq-3",
      prompt: "A settlement claim reads amount_cents = 92500. Which expression prints its dollar value?",
      choices: ["amount_cents / 100", "ROUND(amount_cents / 100.0, 2)", "amount_cents * 100", "ROUND(amount_cents, 2)"],
      answer: 1,
      why: "INTEGER cents ÷ 100.0 promotes to real arithmetic: 925.00 — the void-but-paid #11 on this book. The .0 is the entire fix; integer ÷ integer truncates and every odd-cent claim leaks its cents into the floor.",
      notes: [
        { choice: 0, why: "92500 / 100 is integer division = 925 — on round-dollar claims the bug hides; the first odd-cent payout exposes it. Promote before you divide." },
        { choice: 2, why: "Multiplying gives 9,250,000 — units inverted. Sanity-check magnitude: dollars are smaller than cents." },
      ],
      difficulty: "easy",
    },
    {
      id: "yassir-mcq-4",
      prompt: "Inside GROUP BY city cluster, what does COUNT(*) FILTER (WHERE o.status = 'pending') compute?",
      choices: ["All jobs in the cluster, with pending ones flagged", "The awaiting-acceptance count per cluster — a conditional count in the same scan as the other arms", "A separate query run per cluster", "The percentage of pending jobs"],
      answer: 1,
      why: "FILTER (WHERE …) is a per-aggregate gate: within each cluster's group, only rows passing the predicate are counted — the one-scan census idiom (EU 6, APAC 5, US 3), equivalent to SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END).",
      notes: [
        { choice: 0, why: "The plain COUNT(*) next to it does that. FILTER narrows WHICH rows the aggregate sees — it never flags rows in the output." },
        { choice: 3, why: "A percentage needs the division: 100.0 * COUNT(*) FILTER (…) / COUNT(*). FILTER counts; it doesn't normalize." },
      ],
      difficulty: "medium",
    },
    {
      id: "yassir-mcq-5",
      prompt: "The ops board keeps only job states with at least 14 posted jobs. What does that gate do on this ledger?",
      choices: [
        "Keeps every state — all states have 14+",
        "Keeps delivered (52), shipped (30) and pending (14) — pending is the boundary row; cancelled (7) drops",
        "Keeps delivered only — 52 is the biggest count",
        "Keeps no states — HAVING cannot compare to a literal",
      ],
      answer: 1,
      why: "GROUP BY status HAVING COUNT(*) >= 14 keeps three states and drops cancelled — the 14 floor is live at the boundary: pending's own count is 14, so it exactly survives, and lowering the floor to 7 re-admits cancelled.",
      notes: [
        { choice: 0, why: "The comparison is per-state: cancelled's own count is 7, and 7 >= 14 is false — the gate is judged row by row against each state's own fold." },
        { choice: 2, why: "The floor doesn't keep only the max — it keeps every state whose own count clears 14, which is three states, not one." },
      ],
      difficulty: "medium",
    },
    {
      id: "yassir-mcq-6",
      prompt: "The pacing board buckets jobs by launch month. Which format key builds the spine correctly?",
      choices: ["STRFTIME('%m', posted_at)", "STRFTIME('%Y-%m', posted_at)", "STRFTIME('%Y', posted_at)", "SUBSTR(posted_at, 1, 4)"],
      answer: 1,
      why: "'%Y-%m' gives year plus zero-padded month — 14 buckets on this ledger, 2024-01 through 2025-02. It is the only key that keeps January 2024 and January 2025 apart while keeping months comparable.",
      notes: [
        { choice: 0, why: "'%m' folds every January into one bucket — the pacing curve mixes two years and quietly becomes fiction." },
        { choice: 2, why: "'%Y' collapses to two buckets; a launch board that reads '2024: 96 jobs' has no monthly pacing signal left in it." },
      ],
      difficulty: "medium",
    },
    {
      id: "yassir-mcq-7",
      prompt: "100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to percentage-valued jobs", "It is cosmetic — moving it changes nothing"],
      answer: 1,
      why: "Without it, integer ÷ integer is integer division — every cluster's cancellation share truncates toward 0 and the map reads flat. The 100.0 forces real division first; on this ledger it's the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (a/b)*100 truncates first, then scales — 0.068 became 0 at the fold. Order of operations is the metric." },
      ],
      difficulty: "medium",
    },
    {
      id: "yassir-mcq-8",
      prompt: "An analyst joins jobs to legs, then computes 100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*) and reports the completion share. What's wrong?",
      choices: [
        "Nothing — the join is required to see status",
        "The denominator now counts LEGS — the 2.4× fan-out deflates every cluster's share; compute at job grain or use COUNT(DISTINCT job_id) in the denominator",
        "CASE cannot be used after a join",
        "The 100.0 must come after the division",
      ],
      answer: 1,
      why: "The join is fine for leg-level facts, but the rate's denominator is now leg grain — 251 rows under 103 jobs — so every job-side count divides by ~2.4× too many rows and the share collapses. The numerator needs a job-grain denominator: COUNT(DISTINCT o.id), or run the fold on the jobs table before joining legs.",
      notes: [
        { choice: 0, why: "status lives on the jobs table — the join adds nothing to this fold except fan-out. The bug is real and it's in the denominator." },
        { choice: 2, why: "CASE works anywhere an expression works. The failure isn't syntax — it's a rate computed across two grains at once." },
      ],
      difficulty: "hard",
    },
    {
      id: "yassir-mcq-9",
      prompt: "HAVING COUNT(*) >= 14 runs against the state fold of the ops stack. An analyst changes it to >= 13. What appears on the board?",
      choices: [
        "Nothing changes — no state sits between 13 and 14",
        "Cancelled (7 jobs, 1,152.49) still stays off — nothing changes",
        "Nothing changes only because the next state below the floor is at 7 — the gate is still live at the boundary, and any state landing at 13 or 14 would flip the board",
        "The query errors — HAVING needs an aggregate on both sides",
      ],
      answer: 2,
      why: "On THIS ledger nothing visibly changes — the states sit at 52, 30, 14 and 7, so a floor of 13 or 14 keeps the same three. But the trap is real: the floor is judged per state, not against the biggest state, and the board rewrites itself the day a state lands between the old floor and the new one.",
      notes: [
        { choice: 0, why: "'Nothing changes' is the right observation and the wrong lesson — the gate's meaning changed (13-floor vs 14-floor) even though this snapshot hides it. Boards drift exactly this way." },
        { choice: 3, why: "HAVING compares any expression to any literal — COUNT(*) >= 13 is perfectly valid and runs fine." },
      ],
      difficulty: "hard",
    },
    {
      id: "yassir-mcq-10",
      prompt: "A slow-job CASE runs WHEN JULIANDAY(close) - JULIANDAY(posted) > 4 THEN 'slow' ELSE 'on-clock' — no unstamped arm. Where do the 21 unstamped jobs land?",
      choices: ["'slow' — NULL compares as infinity", "'on-clock' — lag is NULL, NULL > 4 is UNKNOWN, so the row falls to ELSE", "An error — CASE cannot evaluate NULL conditions", "They are skipped — CASE drops rows that fail all arms"],
      answer: 1,
      why: "The lag is NULL for unstamped jobs, NULL > 4 is UNKNOWN, the arm doesn't fire, and the exhaustive ELSE catches them as 'on-clock' — jobs with no clock at all re-bucketed as healthy. That's why the unstamped arm (close IS NULL THEN 'no stamp') fires FIRST in every latency band this team ships.",
      notes: [
        { choice: 0, why: "NULL never compares as infinity or zero — every comparison with NULL is UNKNOWN, never true. The illusion comes from IFNULL, which this CASE doesn't use." },
        { choice: 3, why: "CASE doesn't drop rows — a row failing every WHEN arm takes the ELSE. Dropping would need a WHERE, and then the band totals wouldn't reconcile to the base." },
      ],
      difficulty: "hard",
    },
    {
      id: "yassir-mcq-11",
      prompt: "The payout leaderboard folds cohort earnings and two cohorts land on the same total. Under RANK(), what rung does the next cohort below the tie take?",
      choices: ["2 — ties compress the ladder", "3 — RANK consumes the shared rungs", "2 — every rank function compresses", "An error — RANK cannot resolve ties"],
      answer: 1,
      why: "RANK hands both tied cohorts rung 1 and the next cohort takes rung 3 — the shared rung is consumed, not compressed. DENSE_RANK would give 2; ROW_NUMBER would break the tie arbitrarily. The payout policy picks the function, not habit.",
      notes: [
        { choice: 0, why: "2 is DENSE_RANK's answer — it never skips. Ship RANK and the third cohort's rung visibly jumps, which is exactly the audit trail a payout run wants." },
        { choice: 3, why: "Ties are what ranking functions exist for — every window rank resolves them deterministically (RANK/DENSE_RANK) or deliberately arbitrarily (ROW_NUMBER)." },
      ],
      difficulty: "easy",
    },
    {
      id: "yassir-mcq-12",
      prompt: "The job ledger holds 103 posted requests; close stamps (shipped_at) exist on 82. What does COUNT(shipped_at) return?",
      choices: ["103 — COUNT counts rows", "82 — COUNT(column) skips the NULL close stamps", "21 — it counts the unstamped", "0 — NULL poisons the whole count"],
      answer: 1,
      why: "COUNT(*) counts rows; COUNT(column) counts non-NULL values — 82 stamped jobs. The 14 awaiting and 7 cancelled requests carry no close stamp, so they vanish from the column count while staying in the row count. That 103-vs-82 gap IS the in-flight queue.",
      notes: [
        { choice: 0, why: "That is COUNT(*). The moment you name a column, NULLs drop — silently relabeling 'posted' as 'closed' on every board that uses the column form." },
        { choice: 2, why: "COUNT never counts NULLs, even implicitly — 21 is COUNT(*) WHERE shipped_at IS NOT NULL is false, a different query with a different meaning." },
      ],
      difficulty: "easy",
    },
    {
      id: "yassir-mcq-13",
      prompt: "SELECT status AS state, COUNT(*) FROM orders WHERE state = 'cancelled' GROUP BY status — what does SQLite actually do?",
      choices: ["Errors — WHERE can never see SELECT aliases", "Runs — SQLite resolves output aliases in WHERE as an extension, though portable SQL forbids it", "Returns all rows — the filter is ignored", "Filters after grouping — aliases only resolve post-GROUP BY"],
      answer: 1,
      why: "SQLite quietly resolves the alias and filters the 7 cancelled jobs — an engine extension, not standard SQL: the same line dies with 'column not found' on Postgres or BigQuery. The house style writes the raw column in WHERE precisely because the alias form is a portability trap that also hides the pipeline (FROM → WHERE → GROUP BY → SELECT).",
      notes: [
        { choice: 0, why: "That is the textbook rule and the truth on most engines — but SQLite is looser than the textbook, which is exactly how the alias form slips into a notebook and only fails when ported." },
        { choice: 2, why: "The filter is not ignored — 7 rows pass. The danger is subtler: the query works, so nobody notices it is unportable until it isn't." },
      ],
      difficulty: "medium",
    },
    {
      id: "yassir-mcq-14",
      prompt: "SUM(total) OVER (ORDER BY created_at) runs on the pacing board; two jobs share the same created_at stamp (2024-01-02 does on this ledger). What does the running fold do at that point?",
      choices: ["Adds the twins one row at a time — each row gets its own increment", "Jumps by both jobs' combined total — the default RANGE frame treats equal keys as peers", "Errors — the window ORDER BY key must be unique", "Returns NULL for the second twin"],
      answer: 1,
      why: "With ORDER BY and no frame clause, the default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — and RANGE includes PEERS: both rows at the same stamp receive the same running total, jumped by the pair's combined fare. The chart looks like a double-count; it is the frame doing exactly what the default says.",
      notes: [
        { choice: 0, why: "That is ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — one row at a time. Write the frame explicitly when the pacing read needs row-granular steps." },
        { choice: 2, why: "Duplicate ORDER BY keys are legal — ties are exactly what RANGE frames were built to absorb." },
      ],
      difficulty: "medium",
    },
    {
      id: "yassir-mcq-15",
      prompt: "A month-close stack unions the state arms with a banner arm, and two arms coincidentally emit identical rows. What changes if the analyst ships UNION instead of UNION ALL?",
      choices: ["Nothing — both keep duplicates", "UNION dedupes — the coincidental row collapses and the board silently loses a line", "UNION errors on duplicate rows", "UNION keeps both but marks the second"],
      answer: 1,
      why: "UNION is UNION ALL plus an implicit DISTINCT: identical rows collapse into one, so a legitimate business event disappears with no error to catch it. UNION ALL keeps every row — the house stacks use it for exactly this reason, and because the dedupe pass costs a sort on every refresh.",
      notes: [
        { choice: 0, why: "That distinction is the whole trap — UNION collapses duplicates, and on a stack the collapse looks like data, not like a bug." },
        { choice: 2, why: "Duplicate rows are perfectly legal input — the engine just removes the copies, which is worse than an error." },
      ],
      difficulty: "easy",
    },
    {
      id: "yassir-mcq-16",
      prompt: "WHERE total > (SELECT total FROM orders WHERE status = 'pending') — the awaiting queue holds 14 rows. What does SQLite do?",
      choices: ["Errors — a scalar subquery must return exactly one row", "Compares against the MAX of the 14 fares", "Silently compares against ONE row the scan serves — 23 jobs clear 576.54 today, and a different plan reshuffles the cut", "Compares against the average of the 14"],
      answer: 2,
      why: "SQLite does not raise the multi-row error other engines do: the scalar subquery quietly evaluates to one row — whichever the scan serves first, no ORDER BY, no guarantee. On this book the cut lands on 576.54 and 23 jobs clear it; a different plan picks a different pending fare and the 'premium job list' rewrites itself.",
      notes: [
        { choice: 0, why: "That is Postgres behavior ('more than one row returned by a subquery used as an expression') — the portability argument for writing the aggregate deliberately. SQLite just shrugs." },
        { choice: 1, why: "MAX would be a defensible read — and it is not what happens. Nothing aggregates; the engine takes one arbitrary row." },
      ],
      difficulty: "medium",
    },
    {
      id: "yassir-mcq-17",
      prompt: "An analyst computes SUBSTR(close, 1, 7) - SUBSTR(posted, 1, 7) — '2025-02' minus '2024-12' — to get the month gap on the wallet ladder. What comes back?",
      choices: ["2 — the month parts subtract", "1 — SQLite coerces each string to its leading number, so the years subtract and the months vanish", "An error — strings cannot subtract", "NULL — one operand is text"],
      answer: 1,
      why: "'2025-02' casts to 2025 and '2024-12' to 2024 — the numeric prefix is all SQLite keeps — so the 'month gap' returns 1: a year gap wearing a month costume. Real month gaps need the calendar in the math: a julianday delta divided out, or DATE(posted, '+1 month') steps on a date spine.",
      notes: [
        { choice: 0, why: "The '-02' and '-12' never enter the arithmetic — the cast stops at the first non-numeric character. The bug hides because small gaps look accidentally right." },
        { choice: 2, why: "SQLite is happy to subtract text by casting — that is the trap. It runs, returns a number, and the number is wrong." },
      ],
      difficulty: "medium",
    },
    {
      id: "yassir-mcq-18",
      prompt: "The collection review: invoices with status 'open' total 19,609 on 6 invoices; the no-payment anti-join reads 15,217 on 6 invoices. Why don't the two 6s agree?",
      choices: ["They must — one probe is stale", "The sets differ: 'open' includes the partially-paid #25 (4,000 of 6,148 already collected); the no-payment set instead carries #28 (1,756) — a 'paid' stamp with zero payment rows — and drops #25", "The anti-join double-counts void invoices", "Rounding drift — cents vs dollars"],
      answer: 1,
      why: "Two honest reads of two different definitions. 'Open' is a status fold: 5 no-payment invoices plus the partial #25 (6,148 billed, 4,000 already in) = 19,609. The anti-join is a rows fold: every invoice with zero payment rows — 5 open + #28 = 15,217. The 4,392 gap is exactly 6,148 − 1,756. Both numbers are true; neither is 'the' exposure until the desk names its denominator.",
      notes: [
        { choice: 2, why: "No double-counting: #11 (void-but-paid, 925) sits in NEITHER set — it has a payment row and a void status, which is why the payment-rows fold (69,612 moved) is the third read the desk runs." },
        { choice: 3, why: "Every figure here is whole dollars off the same INTEGER-cents book — the drift is set membership, not units." },
      ],
      difficulty: "hard",
    },
    {
      id: "yassir-mcq-19",
      prompt: "LAG(volume) OVER (ORDER BY month) runs on the cluster pacing board without PARTITION BY. What contaminates the chain?",
      choices: ["Nothing — LAG is always per-cluster", "Each cluster's first month borrows the previous cluster's last month — the chain leaks across the partition boundary", "Only the board's first row gets a value instead of NULL", "LAG errors without a partition"],
      answer: 1,
      why: "Without PARTITION BY the window is one chain over the whole result: APAC's January inherits EU's December — a step no cluster ever took. PARTITION BY region restarts the chain and hands each cluster's first month the honest NULL. On a 4-cluster board, three first-month steps are fiction until the partition is declared.",
      notes: [
        { choice: 0, why: "LAG's default partition is the ENTIRE result set — the partition clause is what scopes it. Forgetting it is the most common pacing-board bug this team screens for." },
        { choice: 2, why: "Unpartitioned, only the very first row overall gets NULL — every other boundary month gets a borrowed, wrong step." },
      ],
      difficulty: "hard",
    },
    {
      id: "yassir-mcq-20",
      prompt: "An analyst writes SELECT status FROM orders WHERE COUNT(*) >= 14 to keep job states above the material floor. What happens?",
      choices: ["It runs and filters per state", "It errors — aggregates are illegal in WHERE; the floor belongs in HAVING, which fires after grouping", "It returns the 14 biggest rows", "It silently treats COUNT(*) as a column count"],
      answer: 1,
      why: "WHERE evaluates per ROW, before any grouping exists — COUNT(*) has no meaning there and SQLite raises 'misuse of aggregate function COUNT()'. The floor is a property of the GROUP, so it lives in HAVING: GROUP BY status HAVING COUNT(*) >= 14 keeps delivered (52), shipped (30) and pending (14) — the boundary state exactly surviving.",
      notes: [
        { choice: 2, why: "LIMIT 14 would take ROWS — a different lever entirely, sliced in whatever order the plan chose. Floors on folds are HAVING's job." },
        { choice: 3, why: "No silent fallback here — SQLite catches this one at parse time, which is why the bug never ships: it simply never runs." },
      ],
      difficulty: "hard",
    },
    {
      id: "yassir-mcq-21",
      prompt: "The desk wants every invoice on the book that has NO payment row. Which set operation answers it?",
      choices: ["UNION", "INTERSECT", "EXCEPT — book ids minus payment-covered ids", "UNION ALL"],
      answer: 2,
      why: "EXCEPT keeps rows of the first set that never appear in the second: SELECT id FROM invoices EXCEPT SELECT invoice_id FROM payments — the 6-invoice, 15,217 hole. It is the set-op spelling of the anti-join the house more often writes as LEFT JOIN … WHERE right.id IS NULL.",
      notes: [
        { choice: 1, why: "INTERSECT is the opposite cut — invoices WITH payments (22 of them, #25's partial included). Useful for the funded side, useless for the hole." },
        { choice: 0, why: "UNION merges sets — it can never subtract. A merged set answers 'who exists', not 'who is missing'." },
      ],
      difficulty: "easy",
    },
    {
      id: "yassir-mcq-22",
      prompt: "SELECT SUM(total) FROM orders WHERE status = 'refunded' — no refunded jobs exist on this ledger. What does the cell hold?",
      choices: ["0 — empty sums are zero", "NULL — SUM over an empty set yields no value", "An error — the status doesn't exist", "An empty string"],
      answer: 1,
      why: "An aggregate over zero rows is NULL, not 0 — and that NULL walks into every expression downstream: ROUND(NULL, 2) is NULL, the funnel cell prints blank, 100.0 * NULL / 103 is NULL. If the board needs a zero, the policy is explicit: COALESCE(SUM(total), 0).",
      notes: [
        { choice: 0, why: "0 and NULL differ in every downstream fold — AVG skips the NULL row entirely while a 0 drags it down. Zero-filling is a decision, never a default." },
        { choice: 2, why: "The status simply matches nothing — a missing VALUE is not a missing COLUMN. The query runs and returns one row of NULL." },
      ],
      difficulty: "easy",
    },
    {
      id: "yassir-mcq-23",
      prompt: "Driver supply hours fold as julianday(close) - julianday(posted); 21 of 103 jobs are unstamped (close IS NULL). Why does the desk refuse IFNULL(lag, 0)?",
      choices: ["Because NULLs error inside julianday", "Because zero-fill fakes supply: 21 phantom zero-hour jobs drag the 2.98-day average toward 0 and celebrate a latency win that never happened — unstamped rows are excluded (or stamped with the batch clock), never zeroed", "Because IFNULL is slower than a WHERE filter", "Because julianday returns hours, not days"],
      answer: 1,
      why: "A NULL close stamp means 'no measurement', not 'zero hours'. Zero-filling manufactures 21 perfectly punctual jobs: the average collapses below the honest 2.98 and the ops review congratulates itself on phantom speed. Excluding (the 82-row average) or stamping with the batch clock are the only defensible policies.",
      notes: [
        { choice: 0, why: "julianday(NULL) is NULL — it never errors. The danger is downstream folds silently skipping it, which is precisely the behavior the zero-fill was 'fixing'." },
        { choice: 3, why: "julianday returns fractional DAYS — 2.98 is days. Unit confusion is real but separate; IFNULL(lag, 0) is a policy bug, not a unit bug." },
      ],
      difficulty: "easy",
    },
    {
      id: "yassir-mcq-24",
      prompt: "(SELECT AVG(oi2.quantity) FROM order_items oi2 WHERE oi2.product_id = oi.product_id) sits inside the outer order_items query. What makes it CORRELATED?",
      choices: ["It uses AVG", "The inner WHERE references the outer row's alias (oi.product_id) — the inner scan runs once per outer row", "It sits in the SELECT list", "It aggregates over the same table"],
      answer: 1,
      why: "Correlation is the reference, not the aggregate: the subquery reads the outer query's current row, so it re-runs per row — per-tier averages computed tier by tier. Drop the outer reference and it becomes a one-shot scalar over all 251 legs. On leg grain that is 251 inner scans — the shape the planner flags first.",
      notes: [
        { choice: 0, why: "AVG is incidental — a correlated subquery can return any scalar, and an uncorrelated one can aggregate. The linkage is the outer alias." },
        { choice: 2, why: "Position doesn't correlate — the same subquery in WHERE with an outer reference is equally correlated. What matters is which rows the inner query can see." },
      ],
      difficulty: "medium",
    },
    {
      id: "yassir-mcq-25",
      prompt: "A rolling-7 read orders rows by booking date and writes ROWS BETWEEN 6 PRECEDING AND CURRENT ROW. One day carries 3 bookings. What went wrong?",
      choices: ["Nothing — 7 rows is 7 days", "The window is 7 ROWS but fewer than 7 calendar days — the triple-booking day crowds two days out of the frame; the honest rolling week anchors on the calendar (a join on booking_date >= booking_date - 6, or a pre-built date spine)", "ROWS frames error on duplicate dates", "The window grows to 9 days"],
      answer: 1,
      why: "ROWS counts rows, not days: a 3-booking day consumes 3 of the 7 slots, so the 'rolling 7' spans 5 calendar days and the weekly read undercounts demand on the busiest days — precisely the days the surge desk cares about. Calendar-honest rolling windows anchor on dates, not row positions.",
      notes: [
        { choice: 0, why: "7 rows ≠ 7 days the moment a day repeats — the frame's unit is the trap, and it only bites when volume is uneven, i.e. always." },
        { choice: 2, why: "Duplicate dates are legal in ROWS frames — they are just treated as separate rows, which is exactly the bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "yassir-mcq-26",
      prompt: "The wallet funnel stack unions three arms (registered → attempted → funded). The analyst puts ORDER BY inside the FIRST arm. What happens?",
      choices: ["It orders just the first arm", "It errors — in a compound, ORDER BY is legal once, at the tail, where it governs the whole stack", "It orders the entire stack", "It is ignored"],
      answer: 1,
      why: "SQLite raises 'ORDER BY clause should come after UNION ALL not before' — a compound is ONE statement with ONE sort, applied after the arms merge. The tail ORDER BY sorts the full stack: arm key first, then step, if the funnel must read top-down.",
      notes: [
        { choice: 0, why: "Even in engines that tolerate a mid-compound ORDER BY, it never means 'sort only this arm' — and SQLite does not tolerate it at all." },
        { choice: 2, why: "A tail ORDER BY does order everything — but it cannot be placed mid-stack, and pretending the first arm has its own sort is how the error appears." },
      ],
      difficulty: "medium",
    },
    {
      id: "yassir-mcq-27",
      prompt: "The close stamp lands at 23:59:30 on the batch clock. What does julianday(close) - julianday(posted) preserve that DATE(close) - DATE(posted) destroys?",
      choices: ["Nothing — both give whole days", "The fractional day: julianday keeps the 0.999 of the stamp — the 2.98-day average on this ledger is fractional — while DATE() truncates to midnight and biases same-day closes toward 0 or 1", "julianday returns seconds", "DATE() is the more precise of the two"],
      answer: 1,
      why: "julianday is a real number of days — 2.98 averages only because fractions survive. DATE() floors each stamp to its calendar day, so a 23:59 close reads a full day earlier and the 2..4 range quietly becomes 1..3 — same rows, different metric. Latency KPIs stay on julianday; DATE is for bucketing, not measuring.",
      notes: [
        { choice: 0, why: "If both gave whole days the average would be an integer — the .98 in 2.98 is the fingerprint of fractional days." },
        { choice: 3, why: "DATE has no time at all — it is the coarser of the two. Precision here means keeping the fraction, which is julianday's whole point." },
      ],
      difficulty: "medium",
    },
    {
      id: "yassir-mcq-28",
      prompt: "The unpaid-invoices report ships as WHERE id NOT IN (SELECT invoice_id FROM payments). payments.invoice_id is NOT NULL today and the report returns the true 6. Which future schema drift silently zeroes it?",
      choices: ["Adding more payments", "One row slipping in with invoice_id NULL — NOT IN against a set containing NULL yields UNKNOWN for every row, and the report returns 0 with no error", "Renaming the column", "Adding an index on invoice_id"],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE: the comparison is UNKNOWN whenever the set holds NULL, so every invoice fails the filter — the 15,217 hole vanishes and the cash review reads clean. That is why the house anti-join is LEFT JOIN … IS NULL (or NOT EXISTS, which is NULL-safe): the report must survive schema drift, not just today's constraints.",
      notes: [
        { choice: 0, why: "More payments shrink the hole honestly — the report still returns whatever remains. Only NULL poisons the operator itself." },
        { choice: 2, why: "A rename breaks loudly — 'no such column'. The NULL drift is dangerous precisely because it fails silently, returning a plausible empty report." },
      ],
      difficulty: "hard",
    },
    {
      id: "yassir-mcq-29",
      prompt: "The status fold reads 66,443 collected (21 'paid' invoices); the payment-rows fold reads 69,612 moved. Which row makes the status fold LIE about collected cash?",
      choices: ["#28 — stamped 'paid' with zero payment rows behind it (1,756 of phantom cash)", "#11 — stamped 'void' with a 925 payment that did move", "#25 — the partial (4,000 of 6,148)", "The card-vs-wire split"],
      answer: 0,
      why: "'Paid' is a label; the payment row is the event. #28 contributes 1,756 to the status fold and nothing to cash — phantom collections. #11 (925 on void) understates the fold, and #25's 4,000 sits in 'open': the full walk from 66,443 to 69,612 is −1,756 + 925 + 4,000 = +3,169, and each term is a different policy question.",
      notes: [
        { choice: 1, why: "#11 moves the fold the other way — real cash the status hides. Both anomalies matter; only #28 inflates 'collected'." },
        { choice: 2, why: "#25's 4,000 is collected but its invoice is 'open' — it belongs to the cash fold and the open-book read, not to the 'paid' fold." },
      ],
      difficulty: "hard",
    },
    {
      id: "yassir-mcq-30",
      prompt: "ROUND(AVG(SUM(o.total)) OVER (PARTITION BY c.region), 2) with GROUP BY c.region, o.status — what does the cell compute?",
      choices: ["The average fare per job in the region", "The average of the per-status revenue sums within the region — the window folds the GROUP's rows after grouping", "An error — aggregates cannot nest inside windows", "The region's total revenue"],
      answer: 1,
      why: "Windows run after GROUP BY: each region's rows are the per-status sums (APAC's four status sums total 11,605.45), and AVG over them reads 2,901.36 — a fold of folds, useful for 'how lopsided is this region's mix', and nothing like the per-job fare. Nesting is legal; the grain surprise is the interview.",
      notes: [
        { choice: 0, why: "Per-job fare would be AVG(o.total) — one fold, job grain. The nested form has already collapsed jobs to status sums before the window sees them." },
        { choice: 2, why: "Nesting an aggregate inside a window is exactly how staged folds are written — SUM(SUM(x)) OVER () is the grand-total idiom." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-yassir-1",
      tier: "medium",
      topic: "x3",
      universe: "growth",
      title: "The super-app ops stack",
      brief:
        "Yassir-flavored brief on the storefront db: the city ops board is a stack — every job state with its count and volume, plus a TOTAL banner row appended underneath, built as one UNION ALL fold because the board ships as a single CSV the dashboards ingest. Probed facts: delivered 52 jobs / 15,571.07, en route 30 / 11,996.72, awaiting 14 / 6,113.00, cancelled 7 / 1,152.49, TOTAL 103 / 34,833.28. The board carries a material floor: a state stays on the board only with 14 or more jobs — pending's own count is the boundary row that exactly survives, and cancelled's 7 jobs (1,152.49) stay off. The banner row always reads 'TOTAL'.",
      ask: "Return the TOTAL banner row and every job state still above the material floor, with job counts and volume — biggest job count first.",
      template:
        "SELECT o.status AS state,\n       COUNT(*) AS jobs,\n       ROUND(SUM({1}), 2) AS volume\nFROM orders o\nGROUP BY o.status\nHAVING COUNT(*) >= {2}\nUNION ALL\nSELECT 'TOTAL', COUNT(*), ROUND(SUM(o.total), 2)\nFROM orders o\nORDER BY jobs {3};",
      slots: [
        {
          answer: "o.total",
          kind: "keyword",
          label: "the volume fold",
          why: "Volume means fare value: SUM(o.total) per state. SUM(o.id) would sum primary keys — 2,953 for delivered, a number with no unit — and a board that mixes units loses the room in one glance.",
        },
        {
          answer: "14",
          kind: "number",
          label: "the material floor",
          why: "A state stays on the board with 14 or more jobs: pending's own count is 14, so the boundary row exactly survives. 15 drops pending (6,113.00 vanishes) and 7 re-admits cancelled (7 jobs, 1,152.49) — both rewrite the board.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the banner-first direction",
          why: "ORDER BY jobs DESC puts the TOTAL banner (103) on top, then delivered (52), shipped (30), pending (14) — biggest first. ASC reads the board upside down: pending first, TOTAL last, the one row every downstream dashboard expects at the head.",
        },
      ],
      distractors: ["o.id", "15", "ASC", "7"],
      walkthrough:
        "Two folds, one stack, a banner. The status arm groups the 103 jobs by state and folds volume with SUM(o.total); HAVING COUNT(*) >= 14 applies the material floor — delivered 52 / 15,571.07, shipped 30 / 11,996.72, pending 14 / 6,113.00 survive, and pending is the boundary row whose own count exactly meets the floor. The banner arm folds the WHOLE table with no GROUP BY — COUNT(*) 103, SUM(o.total) 34,833.28 — and UNION ALL appends it as the 'TOTAL' row; ORDER BY jobs DESC prints the banner first, then the states biggest-first. The reconciliation the board demands: the state arms reassemble the base (52 + 30 + 14 + the excluded 7 = 103, and 15,571.07 + 11,996.72 + 6,113.00 + 1,152.49 = 34,833.28). The distractors each break differently: o.id sums primary keys — delivered reads 2,953, units gone; 15 deletes the boundary state and the awaiting queue disappears from the board; 7 re-admits cancelled (7 / 1,152.49); ASC flips the read so pending leads and TOTAL sinks to the bottom where the CSV merger can't find it. The deeper habit: a stack with a banner is two folds in one statement — the grouped fold and the whole-table fold — and the floor, the banner literal and the direction are three separate contracts, each silently rewriting the board if left to default.",
    },
    {
      id: "cs-yassir-2",
      tier: "hard",
      topic: "j4",
      universe: "supplier",
      title: "Driver-cohort earnings, zero arm included",
      brief:
        "Yassir-flavored brief on the storefront db: the supply desk orders payouts by folding earnings per driver cohort — each cohort's service tiers joined to the job legs booked against them, LEFT JOINs all the way down so a dormant cohort would print 0 legs and 0.00 earnings instead of vanishing. Probed facts: six cohorts carry 251 job legs; the earnings ladder reads 11,130.25 (32%) on 43 legs, 9,294.93 (26.7%) on 56 legs, 4,765.63 on 40, 3,613.25 on 25, 3,049.07 on 47, 2,980.15 on 40 — the second cohort carries MORE legs but LESS earnings, the legs-versus-earnings split the vertical GMs argue about. On this book all six cohorts are live: the legs column must sum to 251.",
      ask: "Return every driver cohort with its job-leg count and earnings — biggest earnings first.",
      template:
        "SELECT s.name AS driver_cohort,\n       COUNT(oi.id) AS legs,\n       ROUND(SUM({1}), 2) AS earnings\nFROM suppliers s\nLEFT JOIN products p ON p.supplier_id = {2}\nLEFT JOIN order_items oi ON {3}\nGROUP BY s.id\nORDER BY earnings DESC;",
      slots: [
        {
          answer: "oi.unit_price * oi.quantity",
          kind: "keyword",
          label: "the leg-value fold",
          why: "Earnings are per-leg value: unit_price × quantity summed across the cohort's legs. oi.unit_price alone drops the quantity multiplier and undercounts every multi-leg job — the payout run would short the cohorts with the busiest verticals.",
        },
        {
          answer: "s.id",
          kind: "keyword",
          label: "the tier-to-cohort key",
          why: "Service tiers attach to cohorts via products.supplier_id = suppliers.id. Joining on p.id matches a tier's own id against supplier ids — coincidental 1..6 collisions mis-assign tiers between cohorts and the earnings ladder rearranges itself around a typo.",
        },
        {
          answer: "oi.product_id = p.id",
          kind: "keyword",
          label: "the leg-to-tier key",
          why: "Job legs attach to tiers via order_items.product_id = products.id. oi.order_id lives in a different id domain (1..103 vs 1..16) — the join coincidentally matches a few and silently re-homes legs, so cohorts get paid for jobs they never served.",
        },
      ],
      distractors: ["oi.unit_price", "p.id", "oi.order_id = p.id", "oi.product_id = s.id"],
      walkthrough:
        "Two LEFT JOINs, one fold, a proof column. suppliers LEFT JOIN products ON p.supplier_id = s.id attaches each cohort's service tiers; the second LEFT JOIN attaches job legs ON oi.product_id = p.id; COUNT(oi.id) counts legs — 0 when a cohort has none, which is why the LEFT arms exist — and SUM(oi.unit_price * oi.quantity) folds earnings to 11,130.25 / 9,294.93 / 4,765.63 / 3,613.25 / 3,049.07 / 2,980.15, biggest first. The liveness proof the desk runs: 43 + 56 + 40 + 25 + 47 + 40 = 251 legs — every cohort is live, and the second cohort's 56 legs at 9,294.93 (cheaper legs than the leader's 43 at 11,130.25) is the legs-versus-earnings split the vertical review argues about. The distractors each break differently: oi.unit_price drops the quantity multiplier and shorts every multi-leg job; p.id mis-assigns tiers to cohorts on coincidental ids; oi.order_id = p.id re-homes legs across id domains — cohorts paid for jobs they never served; oi.product_id = s.id joins legs straight to supplier ids, colliding two id spaces and scrambling both counts. The deeper habit: a payout fold is a chain of keys — cohort, tier, leg — and each key is a contract; one wrong column and the money moves to whoever the typo favors.",
    },
    {
      id: "cs-yassir-3",
      tier: "easy",
      topic: "t5",
      universe: "catalog",
      title: "The vertical crown ranking",
      brief:
        "The monthly vertical review ranks Yassir's service families by fare revenue booked through the job legs, and the GM wants a crown column computed in the same query as the fold — a dense rank that never skips a rung. Probed: Audio 11,744.01 on 46 distinct jobs, Wearables 6,929.12 on 23, Video 5,198.41 on 30, Electronics 4,818.61 on 40, Accessories 3,294.29 on 54. The board carries a 23-job materiality floor, so a family stays on the ladder only with 23 or more distinct jobs — Apparel (22) and Fitness (13) drop under it.",
      ask: "Return every vertical above the job floor with its job count, revenue and a dense crown rank, crowns ascending.",
      template:
        "SELECT p.category AS vertical,\n       COUNT(DISTINCT oi.order_id) AS jobs,\n       ROUND(SUM(oi.unit_price * oi.quantity), 2) AS revenue,\n       DENSE_RANK() OVER (ORDER BY SUM(oi.unit_price * oi.quantity) {1}) AS crown\nFROM order_items oi\nJOIN products p ON p.id = {2}\nGROUP BY p.category\nHAVING COUNT(DISTINCT oi.order_id) >= {3}\nORDER BY crown;",
      slots: [
        {
          answer: "DESC",
          kind: "keyword",
          label: "the crown direction",
          why: "Crowns run biggest revenue first — DESC makes Audio's 11,744.01 rung 1. ASC crowns Fitness (863.91) and the review reads the ladder upside down, bottom family first.",
        },
        {
          answer: "oi.product_id",
          kind: "keyword",
          label: "the leg-to-tier key",
          why: "Legs attach to tiers on order_items.product_id = products.id. oi.order_id lives in the job-id domain (1..103 against 1..16) — the collision joins a few legs by accident and every vertical's fold lands on the wrong families.",
        },
        {
          answer: "23",
          kind: "number",
          label: "the materiality floor",
          why: "The board keeps verticals with 23+ distinct jobs: Wearables' own count is 23, so the boundary family exactly survives. 22 re-admits Apparel (22 jobs, 1,984.93); 30 deletes Wearables and the crown list loses its #2 rung.",
        },
      ],
      distractors: ["ASC", "oi.order_id = p.id", "22", "30", "54"],
      walkthrough:
        "Rank the fold, then floor it. The join attaches legs to tiers on the real key (oi.product_id = p.id); GROUP BY category folds fare value as SUM(unit_price × quantity) and counts DISTINCT jobs per family, while HAVING COUNT(DISTINCT oi.order_id) >= 23 applies the materiality floor — Wearables' own 23 exactly survives, and Apparel (22) and Fitness (13) drop. The window runs after grouping: DENSE_RANK() OVER (ORDER BY revenue DESC) crowns Audio 1 (11,744.01), Wearables 2 (6,929.12), Video 3 (5,198.41), Electronics 4 (4,818.61), Accessories 5 (3,294.29) — no skipped rungs by design, which is why the board specifies DENSE over RANK. The distractors each break differently: ASC crowns Fitness (863.91) and reads the ladder upside down; oi.order_id = p.id collides the job-id domain (1..103) into tier ids (1..16) and re-homes legs to the wrong families; 22 re-admits Apparel (22 / 1,984.93) below the floor; 30 deletes the #2 crown from the board; 54 keeps only the busiest family (Accessories' own 54 exactly surviving its own floor). The deeper habit: a ranked fold is three layers — fold, floor, rank — and each layer fails silently on its own.",
    },
    {
      id: "cs-yassir-4",
      tier: "medium",
      topic: "t7",
      universe: "month-close",
      title: "The spliced pacing chain",
      brief:
        "The city-close deck reads month-over-month pacing on the job ledger, but the board only carries months with at least 8 posted jobs — the expansion floor. Probed: 2024-01 8 jobs / 3,731.97, 2024-02 9 / 3,609.64, 2024-03 8 / 2,617.08, 2024-05 8 / 2,910.31, 2024-07 8 / 1,193.86 (the July trough, both of that month's cancellations inside it), 2024-09 9 / 3,116.04. The step column is volume minus the previous CARRIED month — and because the floor filters BEFORE the window runs, the chain splices: May's step rides on March, not April, and the deck must footnote it or it lies.",
      ask: "Return the board months with jobs, volume, the previous carried month's volume and the step — calendar order.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         COUNT(*) AS jobs,\n         ROUND(SUM(total), 2) AS volume\n  FROM orders\n  GROUP BY SUBSTR(created_at, 1, 7)\n  HAVING COUNT(*) >= {1}\n), chained AS (\n  SELECT month,\n         jobs,\n         volume,\n         LAG(volume) OVER (ORDER BY {2}) AS prev_read\n  FROM monthly\n)\nSELECT month,\n       jobs,\n       volume,\n       prev_read,\n       ROUND({3}, 2) AS step\nFROM chained\nORDER BY month;",
      slots: [
        {
          answer: "8",
          kind: "number",
          label: "the expansion floor",
          why: "Months survive with 8+ posted jobs: six months make the board (8, 9, 8, 8, 8, 9). 9 keeps only the two 9-job months and the chain collapses to a single step; 14 empties the board — no month ever posted 14.",
        },
        {
          answer: "month",
          kind: "keyword",
          label: "the chain order",
          why: "The LAG chain must walk the calendar: OVER (ORDER BY month). Ordering by jobs scrambles the chain into workload order and every 'previous month' becomes a different month; ordering by volume rewrites the pacing story around the July trough.",
        },
        {
          answer: "volume - prev_read",
          kind: "keyword",
          label: "the step fold",
          why: "Step = this month's volume minus the previous CARRIED month: 3,609.64 − 3,731.97 = −122.33 into February, −992.56 into March. prev_read − volume flips every sign and the deck reads recovery as decline.",
        },
      ],
      distractors: ["DESC", "jobs", "volume", "shipped_at", "prev_read - volume"],
      walkthrough:
        "Two stages: fold the months, then chain them. Stage one buckets SUBSTR(created_at, 1, 7) and folds jobs and volume; HAVING COUNT(*) >= 8 keeps 2024-01 (8 / 3,731.97), 2024-02 (9 / 3,609.64), 2024-03 (8 / 2,617.08), 2024-05 (8 / 2,910.31), 2024-07 (8 / 1,193.86) and 2024-09 (9 / 3,116.04) — April, June, August and October-through-February drop under the floor. Stage two walks the calendar: LAG(volume) OVER (ORDER BY month) hands each month the previous CARRIED month, so the chain splices — May's prev is March (step +293.23), July's prev is May (step −1,716.45), September's prev is July (step +1,922.18). That splice is the story: the floor edits the population BEFORE the window, so every step quietly compares non-adjacent months — the honest deck says so in a footnote, or it sells fiction. The distractors each break differently: DESC walks the chain backwards so March's prev is May; jobs orders the chain by workload and every prev becomes a different month; volume chains around the trough; shipped_at is not a column of the fold and dies; prev_read − volume flips every sign — February reads +122.33 recovery on a 122.33 decline. The deeper habit: filter-then-window is a contract about WHICH rows the chain walks, and the floor is the party that breaks it.",
    },
    {
      id: "cs-yassir-5",
      tier: "medium",
      topic: "s6",
      universe: "funnel",
      title: "The cancel-share census",
      brief:
        "Yassir's cash-on-delivery legs make every cancellation a collection risk, so the weekly city review folds cancellation share per cluster in one pass. Probed: APAC 37 posted / 3 cancelled / 8.1%, EU 45 / 3 / 6.7%, US 19 / 1 / 5.3%. LATAM's two jobs sit below the 19-job sample floor — a 0.0% share on 2 jobs is noise wearing a KPI costume, and the floor keeps it off the board. The share multiplies by 100.0 BEFORE the division, and the cancelled arm is CASE-counted in the same scan as the placed fold.",
      ask: "Return each cluster above the sample floor with posted, cancelled and cancel_pct, riskiest cluster first.",
      template:
        "SELECT c.region AS cluster,\n       COUNT(*) AS placed,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS cancel_pct\nFROM orders o\nJOIN customers c ON c.id = {1}\nGROUP BY c.region\nHAVING COUNT(*) >= {2}\nORDER BY cancel_pct {3};",
      slots: [
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the job-to-rider key",
          why: "Jobs attach to clusters via orders.customer_id = customers.id. c.id = c.id is a tautology — every job pairs with all 16 riders and every fold multiplies by 16 (APAC would read 592 posted).",
        },
        {
          answer: "19",
          kind: "number",
          label: "the sample floor",
          why: "Clusters stay on the board with 19+ posted jobs: US's own count is 19 — the boundary cluster exactly survives. 2 re-admits LATAM's two-job 0.0%; 37 drops US and the board loses its third data point.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the risk direction",
          why: "Riskiest cluster first: APAC 8.1%, EU 6.7%, US 5.3%. ASC buries the collection risk at the bottom of the CSV and the review reads it last, after the meeting has moved on.",
        },
      ],
      distractors: ["c.city", "2", "37", "ASC", "placed"],
      walkthrough:
        "One scan, three folds, a floor. The join keys jobs to riders on orders.customer_id; GROUP BY region folds placed = COUNT(*), cancelled = the CASE arm (APAC 3, EU 3, US 1) and cancel_pct = 100.0 × cancelled / placed — the 100.0 sits before the division so the share stays real arithmetic (8.1, 6.7, 5.3 instead of a truncating 8, 6, 5). HAVING COUNT(*) >= 19 applies the sample floor: US's own 19 exactly survives, LATAM's 2-job 0.0% stays off — a share with no denominator is not a share. The reconciliation: 37 + 45 + 19 = 101 of 103 posted; LATAM's 2 jobs are the excluded tail. ORDER BY cancel_pct DESC hands the review its riskiest-first read. The distractors each break differently: c.city joins an INTEGER id to TEXT city names — the join empties and the board goes blank; 2 re-admits LATAM and prints a 0.0% KPI on 2 jobs; 37 deletes the US boundary cluster; ASC buries APAC's 8.1% risk at the bottom; placed orders by job volume so EU (45) leads and the risk read inverts. The deeper habit: a share census is denominator discipline — floor the sample, keep the multiplication before the division, and CASE-count in the same scan instead of shipping three queries.",
    },
    {
      id: "cs-yassir-6",
      tier: "hard",
      topic: "q2",
      universe: "growth",
      title: "The 3,000 concentration board",
      brief:
        "Finance's expansion memo hangs on rider concentration: of the 34,833.28 book, riders with lifetime spend at or above 3,000 carry 63.5%. The board wants those riders with job counts, lifetime spend and share of the WHOLE book — the share computed against a scalar subquery over all posted jobs, not the folded subset, so the denominators cannot drift. Probed: Alice Chen 24 jobs / 7,262.35, Emma Wilson 17 / 6,640.56, Grace Kim 14 / 4,574.23, Maya Patel 13 / 3,644.56 — 22,121.70 of the book between four riders.",
      ask: "Return riders at or above the 3,000 lifetime floor with jobs, lifetime and share of the full book, biggest spend first.",
      template:
        "SELECT c.name AS rider,\n       COUNT(*) AS jobs,\n       ROUND(SUM(o.total), 2) AS lifetime,\n       ROUND(100.0 * SUM(o.total) / (SELECT {1}), 1) AS share\nFROM orders o\nJOIN customers c ON c.id = {2}\nGROUP BY c.id\nHAVING SUM(o.total) >= {3}\nORDER BY lifetime {4};",
      slots: [
        {
          answer: "SUM(total) FROM orders",
          kind: "keyword",
          label: "the whole-book scalar",
          why: "The share's denominator is the FULL 34,833.28 book — a scalar subquery over orders, evaluated once. SUM over the grouped subset would make every rider 100.0 and the concentration read vanish.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the spend-to-rider key",
          why: "Jobs attach to riders on orders.customer_id = customers.id. c.id = c.id pairs every job with all 16 riders — each rider's lifetime reads the whole 34,833.28 and the floor admits everyone.",
        },
        {
          answer: "3000",
          kind: "number",
          noVerify: true,
          label: "the lifetime floor",
          why: "Finance's concentration threshold: riders at or above 3,000 lifetime. 2000 re-admits Chloe Dubois (2,667.93) and the board reads 71.2% — a different, honest concentration number for a different definition.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the spend order",
          why: "Biggest spend first: Alice 7,262.35, Emma 6,640.56, Grace 4,574.23, Maya 3,644.56. ASC leads with Maya and the memo's headline rider lands at the bottom of the page.",
        },
      ],
      distractors: ["SUM(amount_cents) FROM invoices", "COUNT(*) FROM orders", "c.id", "2000", "ASC"],
      walkthrough:
        "Concentration is a denominator story. The inner scalar — SELECT SUM(total) FROM orders — evaluates ONCE to 34,833.28, the whole book, and sits under the 100.0-multiplication so share stays real arithmetic. The join keys jobs to riders on orders.customer_id; GROUP BY c.id folds each rider's jobs and lifetime; HAVING SUM(o.total) >= 3000 keeps Alice Chen (24 jobs, 7,262.35, 20.8%), Emma Wilson (17, 6,640.56, 19.1%), Grace Kim (14, 4,574.23, 13.1%) and Maya Patel (13, 3,644.56, 10.5%) — 22,121.70 of book, the 63.5% concentration the memo quotes. ORDER BY lifetime DESC hands the memo its headline order. The distractors each break differently: SUM(amount_cents) FROM invoices swaps books — 8,697,700 under the same numerator crushes every share to 0.1; COUNT(*) FROM orders divides money by a job count (Alice 'owns' 7,050.8% of nothing); c.id = c.id pairs every job with all 16 riders so each lifetime reads 34,833.28 and the floor admits everyone; 2000 is a different honest definition — 71.2% over five riders; ASC buries Alice. The deeper habit: a scalar subquery is a denominator contract — write it once, above the fold, and every share on the board inherits the same truth.",
    },
  ],

  problems: [
    { slug: "percentage-of-users-attended-a-contest", why: "Reach share across customers with the 100.0-before-division fix — the cluster-penetration percentage the city review quotes." },
    { slug: "daily-leads-and-partners", why: "Daily status splits per lead and partner — the job-funnel census shape, counted per day, per city, in one pass." },
    { slug: "active-businesses", why: "One-pass conditional flags per entity — the morning cluster census shape: how many events of each kind did this cluster fire, in a single scan." },
    { slug: "trips-and-users", why: "The canonical two-sided screen: ride status rates with banned accounts excluded in the join — super-app move-rate math in textbook clothing." },
    { slug: "combine-two-tables", why: "The LEFT-JOIN warm-up: customer profiles beside their activity, NULLs intact — the shape behind 'every customer, engaged or not'." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one query with the 100.0-before-division fix — the honest-denominator drill Yassir's ratio questions orbit." },
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded share where unmatched rows count as zero — the NULL-policy and rounding habits in one deliverable." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the vocabulary check before every cohort leaderboard, said out loud with the shared-rung policy." },
    { slug: "top-travellers", why: "Payout folds per driver cohort — earnings summed across the legs they carried, ordered for the payout run." },
    { slug: "monthly-transactions-i", why: "Jobs inside a launch window with cancelled flags — the date-filter drill behind 'how did the new city do in its first month?'" },
    { slug: "hopper-company-queries-i", why: "The monthly job spine — month buckets over the 2024-01..2025-02 calendar, the pacing read every expansion review hangs on." },
    { slug: "average-time-of-process-per-machine", why: "Per-entity latency folds — the job-close read (2.98-day average, 2..4 range) grouped by the cluster or vertical doing the work." },
    { slug: "biggest-window-between-events", why: "LEAD-based gap finding — the quiet stretch between a customer's jobs, the dormancy signal the engagement team chases." },
    { slug: "bank-account-summary-ii", why: "Credit and debit folds per account with NULL-safe sums — the wallet-ledger shape behind every settlement read." },
    { slug: "product-sales-analysis-ii", why: "Tier-line folds: fare volume per service tier across all jobs — the vertical-crown read the GMs quote from the same GROUP BY." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Argmax per customer — the most-booked tier per rider, the one-row-per-customer shape every vertical GM asks for." },
    { slug: "immediate-food-delivery-i", why: "Instant vs scheduled split with a CASE fold — the delivery vertical's promise-mode mix the ops review quotes per city." },
    { slug: "immediate-food-delivery-ii", why: "Share of jobs closed on the customer's preferred day, staged through a CTE — the delivery promise-kept rate behind the NPS read." },
    { slug: "customer-who-visited-but-did-not-transact", why: "App opens that never became a booking — the demand-leak census the growth squad runs against the visit ledger every Monday." },
    { slug: "friend-requests-i-overall-acceptance-rate", why: "Overall acceptance rate with honest denominators and the 100.0-before-division fix — ride-acceptance math in textbook clothing." },
    { slug: "dau-wau-stickiness", why: "DAU over WAU per rider base — the super-app stickiness read that decides whether delivery is feeding rides or cannibalizing them." },
    { slug: "rolling-7d-actives", why: "Rolling 7-day actives per rider — the engagement pacing curve the city GMs watch while a new cluster ramps." },
    { slug: "find-golden-hour-customers", why: "Riders whose bookings cluster in the peak window — the surge-prep list the supply desk staffs drivers against." },
    { slug: "user-purchase-platform", why: "Per-rider split across surfaces — which surface each booking rode on, the cross-vertical attribution question a super-app cannot dodge." },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER keep-latest on tied records — the driver-document dedupe that must run before every payout batch." },
    { slug: "second-most-recent-activity", why: "Second-most-recent job per rider — recency beyond the last trip, the churn-watchlist shape the engagement team ships." },
    { slug: "null-blank-audit", why: "NULL/blank audit across key columns — the ledger hygiene gate that must pass before the city month can close." },
    { slug: "restaurant-growth", why: "7-day rolling average of merchant spend — the restaurant-side trend line the delivery GM quotes in the city review." },
    { slug: "monthly-transactions-ii", why: "UNION ALL month grain with a TOTAL banner — the wallet-ledger month close, stacked in one statement the CSV ingests." },
    { slug: "transactions-per-visit-histogram", why: "Zero-filled histogram of bookings per app-open — how deep the funnel runs, including the zero arm no bare GROUP BY prints." },
    { slug: "funnel-step-conversion", why: "Funnel pivot with FIRST_VALUE — wallet top-up funnel step rates, first-touch to funded, computed in one pass." },
    { slug: "top-percentile-fraud", why: "Top-percentile screen over payment amounts — the cash-collection risk outliers the risk team pulls before settlement runs." },
  ],
};
