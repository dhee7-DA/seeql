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
  ],

  dayInLife: [
    "**08:15 —** The day opens on the city board: overnight job requests versus moving-and-done — 82 of 103 — and the first query is the one-pass cluster census, one scan per city cluster: jobs, completed, en route, awaiting, cancelled, volume in a single GROUP BY. The numbers must reconcile before the standup: moving arms sum to 82, awaiting to 14, cancelled to 7, and the leg fan-out (251 legs under 103 requests) says whether yesterday's multi-stop jobs actually stitched together. A drift here is the day's first fire, and the analyst who can write the census *and* the diff against yesterday's fold owns the incident.",
    "**11:00 —** Midday is multi-vertical deep-work. The ops lead wants the {sky:close-stamp ladder} by cluster — JULIANDAY lag over the 82 stamped jobs, APAC's 2.93 benchmarked against LATAM's 3.5 — and a vertical GM wants the awaiting-acceptance queue per cluster (`SUM(CASE WHEN o.status = 'pending' …)`, *counted per job, never per leg*): EU 6, APAC 5, US 3. A supply manager asks why one cohort carries 56 legs but only 26.7% of settled volume — the legs-versus-earnings split that says which verticals a cohort actually serves — and the tier-crown read lands mid-block: the top vertical family books 11,744.01 of fare volume.",
    "**16:30 —** The afternoon is the stakeholder cycle, and it ends the day. The city review walks the ops stack with its {amber:TOTAL banner} and material floor, then the settlement desk takes the books — 28 `invoices`, INTEGER cents read as dollars, six unpaid claims worth 15,217.00, with #28 — the 1,756.00 claim {rose:marked paid with zero settlement rows} — queued beside its mirror, #11, void-but-paid at 925.00, and one partial claim settled at 4,000.00 of 6,148.00. The day closes with the writeup: census reconciliations printed, denominators named, *every funnel number legible at the grain it claims*.",
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
  ],
};
