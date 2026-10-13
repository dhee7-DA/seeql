// Via — kit 11 of the Ride-hailing & Mobility domain (Batch L, 92-c-mobility).
// Transit tech: dynamic shuttles, pooled rides, route utilization — the
// company whose software turns fixed-route transit into on-demand pooling
// for cities and transit authorities. Pool provenance: 0 tagged LC —
// theme-curated. Every problem and topic slug is drawn from the Theme menu
// in scripts/company-pools.md (sql rows), picked to mirror Via's known screen
// themes: pooled-request censuses, one-pass FILTER folds, zone utilization,
// completion-window math, on-time CASE bands, capacity pairing, municipal
// billing books in INTEGER cents.
// Case studies run on the storefront db (db/custom.db) with probed figures
// from scripts/company-facts.md (probed 2026-10-12), mapped honestly:
// orders = pooled ride requests, shipped_at = request-completion ping,
// customers = riders, products = route service lines, category = corridor
// family, order_items = passenger legs (the pool manifest), suppliers =
// fleet partners, invoices/payments = the municipal/partner billing books
// (INTEGER cents — divide by 100.0). Every case slot is mechanically
// verified against the live db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const viaKit: CompanyKit = {
  id: "via",
  domainId: "mobility",
  name: "Via",
  tagline: "Transit tech: shuttles, routes and utilization",
  accent: "text-sky-400",

  brief: [
    "Via is the transit-tech company that rebuilt fixed-route public transport as dynamic pooling — shuttles that bend their route to pick up riders heading the same way, sold as software and operations to cities and transit authorities. The unit of value is not a solo ride but a **shared vehicle**: utilization is the business model, and every analytics question bends toward it. On this kit's proxy ledger that's 103 pooled requests worth **34,833.28** (average 338.19) across 16 riders, with 251 passenger legs fanning underneath — *2.4 legs per request, which is the pooling shape itself expressed as a join*. The status map is the request lifecycle: 52 {emerald:completed} with a completion ping (50.5%), 30 en-route (29.1%), 14 waiting for a pool (13.6%), 7 {rose:no-show} cancellations (6.8%).",
    "Two reads define the analyst job here. The {amber:one-pass census}: ops reviews open with a single-scan fold per zone — requests, completed, no-shows, fare revenue in the same GROUP BY — because a query budget is a real constraint when the same fold runs every morning (EU: 45 requests, 24 completed, 3 no-shows, 15,089.23 billed). The {sky:completion-window read}: 82 of 103 requests carry a completion ping, lag averaging **2.98 days** on the proxy clock (range 2..4), and the zone ladder reads APAC 2.93 fastest, EU 2.94, US 3.07, LATAM 3.5 — the on-time conversation starts the moment a zone's average drifts. Utilization denominators are drilled early: completed ÷ ALL booked requests, waiting requests included, or the pooling story flatters itself.",
    "Interviews are utilization-first, one-pass-flavored, cents-precise. A screen opens with a warm-up join (attach passenger legs to their request), escalates into a conditional aggregation with a status rule — often as `FILTER (WHERE …)`, the one-scan idiom this kit's census is built on — then lands on either a completion-window read (JULIANDAY lag with the NULL policy stated) or a municipal-billing read (28 `invoices` against 27 `payments`, INTEGER cents, 6 unpaid worth 15,217.00, one claiming *paid with zero settlement rows*). Follow-ups are spoken aloud: *'is that per request or per leg?'*, 'does a waiting request sit in your denominator?', 'what happens to a request with no ping in the on-time band?'",
    "Preparation strategy: Via has **0 tagged LC** rows in this app's pool, so the kit is **theme-curated** — all 30 topic slugs and 16 problems are hand-picked from the theme menu to mirror transit-tech screens: pooling censuses, capacity pairing, completion windows, on-time bands, month spines, municipal AR. Then run both case studies on the live db: one rebuilds the {amber:one-pass pooling census} ops reviews open with, the other rebuilds the {sky:zone completion-lag read} the on-time review is built on. The bar to clear: name the grain, state the denominator, and gate the NULLs deliberately before you compute anything.",
  ],

  dayInLife: [
    "**08:15 —** The day opens on the utilization board: overnight pooled requests versus completion pings — 82 of 103 — and the first query is the one-pass census, one scan per zone: requests, completed, no-shows, revenue in a single GROUP BY. The numbers must reconcile before the standup: completed classes sum to 52, no-shows to 7, and the leg fan-out (251 legs under 103 requests) says whether yesterday's pools actually pooled. A drift here is the day's first fire, and the analyst who can write the census *and* the diff against yesterday's fold owns the incident.",
    "**11:00 —** Midday is pooling deep-work. The ops lead wants the completion window by zone — JULIANDAY lag over the pinged requests, waiting requests gated out with a stated NULL policy, APAC's 2.93 benchmarked against LATAM's 3.5 — and a partner manager wants the same fold as an on-time band: lag within window versus outside, with the no-ping requests routed to their own arm *before* any lag comparison fires. A capacity question lands mid-block: which zones run pools tight enough that legs-per-request climbs — the join-fan-out read that turns 251 legs into a utilization signal rather than a bug report.",
    "**15:00 —** The afternoon is partner cycles. The municipal billing review walks the invoice book — 28 `invoices`, INTEGER cents, `amount_cents / 100.0` — then the coverage census: 21 settled exactly, 6 never-collected (15,217.00), 1 partial at 4,000.00 of 6,148.00, with #28 — the 1,756.00 bill {rose:claiming paid with zero settlement rows} — already in the anomaly queue beside its mirror, #11, {rose:void-but-paid} at 925.00. Fleet-partner share gets one query: the top partner carries 32% of billed volume, and concentration is a renewal-risk conversation, not a trivia answer.",
    "**17:45 —** End of day is the writeup that keeps tomorrow's fold honest. The zone census ships with its reconciliations printed (classes summing back to `COUNT(*)`), the on-time band ships with its arm order documented — no-ping first, boundary stated — and the lag report carries its population in the header: *82 pinged requests, 14 waiting and 7 no-shows excluded by definition, not by accident*. The rhythm to internalize: Via SQL exists to prove pooling works at the zone grain — *utilization is a denominator decision made before the query runs*.",
  ],

  metrics: [
    { name: "Completed-request rate", what: "Requests with a completion ping ÷ ALL booked requests: 52 of 103 (50.5%). Waiting requests sit in the denominator — pooling never gets to flatter itself." },
    { name: "Zone completion census", what: "Per zone in one pass: EU 45 requests / 24 completed / 3 no-shows / 15,089.23; APAC 37 / 21 / 3 / 11,605.45; US 19 / 5 / 1 / 7,286.16; LATAM 2 / 2 / 0 / 852.44." },
    { name: "Completion lag", what: "Request-to-ping on the 82 pinged requests: 2.98-day average, range 2..4. The on-time review's core clock — NULL policy stated or the read is a lie with decimals." },
    { name: "Zone lag ladder", what: "Average lag per zone, pinged only: APAC 2.93 (29 requests), EU 2.94 (36), US 3.07 (15), LATAM 3.5 (2). Fastest-first is how the ops review reads it." },
    { name: "Leg fan-out", what: "251 passenger legs under 103 requests — 2.4 legs per request. The pooling-shape signal: fan-out up means pools tightened; fan-out at 1 means the shuttle is a taxi." },
    { name: "No-show share", what: "Cancelled ÷ booked: 7 of 103 (6.8%). By zone: EU 3, APAC 3, US 1, LATAM 0 — the denominator keeps the requests you're excluding." },
    { name: "Fleet-partner concentration", what: "Share of billed volume by fleet partner: the top partner carries 32% (11,130.25), the next 26.7%. Renewal risk lives in this fold." },
    { name: "Municipal AR", what: "Invoices with no settlement rows: 6 worth 15,217.00 — one (#28, 1,756.00) claims paid with zero settlements. The anti-join the partner-billing desk runs monthly." },
  ],

  topics: [
    {
      name: "Pooled-request censuses",
      why: "Transit ops opens every review with a fold: requests per zone, per corridor, per day — counted without letting the leg fan-out double the numbers. COUNT(*) on the request table counts requests; after joining legs it counts legs; Via drills which grain the query is standing on before any aggregate runs.",
      slugs: ["percentage-of-users-attended-a-contest", "find-followers-count", "product-sales-analysis-ii"],
    },
    {
      name: "One-pass status censuses",
      why: "Query budgets are real when the same fold runs every morning: requests, completed, no-shows and revenue in ONE scan. Conditional aggregation — FILTER (WHERE …), SUM(CASE …), AVG over 1/0 flags — is the idiom, with branch totals that must reconcile back to COUNT(*).",
      slugs: ["active-businesses", "find-stores-with-inventory-imbalance", "number-of-rich-customers"],
    },
    {
      name: "Completion windows & lag",
      why: "The on-time conversation is date arithmetic: JULIANDAY(ping) - JULIANDAY(request) over the 82 pinged requests, grouped by zone or corridor. Via drills the NULL gate (no ping means no lag, not zero lag) and the window boundaries that decide whether a ride counts as inside.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Zone utilization & capacity",
      why: "Utilization is capacity math: seats versus riders, pools that fill, vehicles that pair. Self-joins on contiguous availability and running-capacity windows are the screen's physical layer — the shapes behind 'can this zone's fleet serve tonight's demand?'",
      slugs: ["last-person-to-fit-in-the-bus", "consecutive-available-seats", "flight-occupancy-and-waitlist-analysis"],
    },
    {
      name: "On-time tiers & CASE bands",
      why: "On-time reporting is a CASE over lag bands — within window, outside, no ping — and the arms carry contracts: the no-ping arm fires BEFORE any lag comparison, the ELSE is exhaustive by design, and the boundary row (exactly 3.0 days) lands where the spec says it lands.",
      slugs: ["immediate-food-delivery-ii", "calculate-orders-within-each-interval", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Utilization leaderboards",
      why: "Rank zones or corridors by utilization and ties are waiting — this ledger ties at 4, 3 and 2. Via drills the rank trio because the question 'do tied zones share a rung?' is a policy the ops review defends, and LIMIT-OFFSET habits break silently on it.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Dormant-zone anti-joins",
      why: "Zone health includes proving the zero: corridors with no completed requests, riders with no bookings (this db has 0 never-ordered riders — a verified zero is a finding, not a failure). LEFT JOIN + IS NULL and its NOT EXISTS twin are the grammar.",
      slugs: ["customers-who-never-order", "find-churn-risk-customers", "dormant-reactivation"],
    },
    {
      name: "Month spines & trend reads",
      why: "Service reviews run on the calendar: requests per month on the 2024-01..2025-02 spine (14 buckets), the 1,193.86 trough in July against the 3,731.97 January open. '%Y-%m' builds the spine, half-open windows cut periods without losing the boundary night.",
      slugs: ["monthly-transactions-i", "hopper-company-queries-i", "friday-purchase-iii"],
    },
    {
      name: "Rates with honest denominators",
      why: "Completion shares, no-show percentages, pooling intensity — Via's ratios punish integer division and drift. The house habit: 100.0 before the division, the denominator's population decided BEFORE the ratio, rounding only at the very end.",
      slugs: ["queries-quality-and-percentage", "hopper-company-queries-ii", "confirmation-rate"],
    },
    {
      name: "Manifest folds & GROUP_CONCAT",
      why: "A pool's manifest is rows: which riders, which pickup points, in what order. GROUP_CONCAT folds the manifest into one cell per request — the roster read dispatch uses — and drills the separator/ordering discipline that keeps a folded string readable.",
      slugs: ["group-sold-products-by-the-date", "find-cities-in-each-state", "concatenate-the-name-and-the-profession"],
    },
  ],

  theory: [
    {
      id: "via-t1",
      q: "A pooled request has multiple passenger legs under it — 251 legs on 103 requests. What does COUNT(*) count after the join, and how do you keep the census honest?",
      a: "After the join, COUNT(*) counts LEGS — the fan-out multiplies every request by its leg count, and a 'request census' that quoted 251 would be a leg census wearing the wrong name. The honest census names one row per what for every aggregate: COUNT(*) on the requests table (or COUNT(DISTINCT request_id) after the join) counts requests; COUNT on the leg side counts legs; and the ratio between them — 2.4 legs per request — is the pooling-intensity signal the whole business model hangs on. The trap that catches candidates is blending the grains in one column: SUM over leg fares divided by COUNT(*) of legs prices a leg, not a request. Say the grain out loud per column, per query — in pooling analytics the fan-out isn't noise to dedupe away, it's the metric.",
      tag: "joins",
    },
    {
      id: "via-t2",
      q: "The morning census reports requests, completed, no-shows and revenue per zone. Why build it as one FILTER-pass query instead of four separate scans — and what must the branches do at the end?",
      a: "One pass because the fold is standing infrastructure: the same census runs every morning over the same table, and four scans cost four table reads where one conditional fold costs one. The idiom: COUNT(*) FILTER (WHERE status = 'delivered') alongside COUNT(*) FILTER (WHERE status = 'cancelled'), with SUM(total) for revenue — every branch computed inside the same GROUP BY, so all four numbers are guaranteed to describe the SAME population of requests. The contract at the end: branches must reconcile — completed (52) plus no-shows (7) plus en-route (30) plus waiting (14) sums back to COUNT(*) (103) — because a census whose arms don't reassemble the base is a guess with formatting. The SUM(CASE WHEN …) twin is equivalent and portable; the discipline is the same fold, one population, reconciliation printed.",
      tag: "aggregation",
    },
    {
      id: "via-t3",
      q: "Completion rate is 52 of 103. Where does the status filter live in the query, and what does the number become if the waiting requests are filtered out first?",
      a: "The status rule is a ROW-level fact used as the numerator, so it lives inside a conditional aggregate: COUNT(*) FILTER (WHERE status = 'delivered') or SUM(CASE WHEN …) over ALL booked requests, divided by COUNT(*) from the same fold — 52 of 103, 50.5%. Filter out the waiting first and the denominator shrinks to 89; filter to 'resolved' and it shrinks to 59 — real denominators, different metrics, wrong names. That's denominator drift, and in pooling it's political: a completion rate that quietly drops waiting requests makes the service look like it never keeps anyone waiting. The sibling trap is HAVING — it judges group aggregates after the fold, when the excluded requests are already inside every zone's total. The strong answer states the pipeline order and asks of every filter: fact about one row, or about a group?",
      tag: "aggregation",
    },
    {
      id: "via-t4",
      q: "Rank zones by utilization and three zones tie. RANK, DENSE_RANK or ROW_NUMBER for the ops board — and where does the tie-breaker belong?",
      a: "The rank trio is a business decision about shared rungs and gaps. RANK shares the rung and skips — after a three-way tie at rank r the next distinct value lands at r+3, implying phantom zones between the tie and the tail. DENSE_RANK shares rungs without gaps — the compact ladder an ops board wants, where tied zones visibly read as peers. ROW_NUMBER splits ties arbitrarily — a silent judgment call about which zone the review calls first, decided by scan order rather than policy. On a ledger like this one ties are structural (counts repeat), so the policy ships WITH the query: DENSE_RANK for peer ladders, or a named deterministic tie-breaker written into the window's ORDER BY — utilization DESC, zone name ASC — so the board is reproducible. The wrong answer is picking a function; the right answer is picking a policy and labeling it in the header.",
      tag: "windows",
    },
    {
      id: "via-t5",
      q: "The on-time band classifies each request by completion lag — within 3 days is on-time. Where do the NULLs and the boundary row land, and how do you write the CASE so the bands reconcile?",
      a: "Three contracts, stated in arm order. First the no-ping arm: WHEN completion_ping IS NULL THEN 'no ping' must fire BEFORE any lag comparison — SUM is not involved yet, but the comparison is: ping IS NULL makes lag NULL, and NULL <= 3 is UNKNOWN, so an ungated request falls through to ELSE and reads 'late' though it has no lag at all. That single arm-order decision is what keeps waiting requests out of the failure band. Second, the boundary: WHEN lag <= 3 is inclusive by spec — a request at exactly 3.0 days is on-time, and 'within 3' written as < 3 silently moves the boundary and re-buckets every boundary-row ride. Third, exhaustiveness: ELSE 'late' guarantees every pinged request lands somewhere, and the bands must reconcile — on-time + late + no-ping sums back to COUNT(*) (52 + 7 + 30 + 14 across the status arms, or 2.98-day-lagged equivalents). A band table that doesn't reassemble the base is a guess with formatting.",
      tag: "windows",
    },
    {
      id: "via-t6",
      q: "A request is waiting for a pool with no completion ping. What is your NULL policy for the lag report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only completed requests have a lag, so the report measures the 82 pinged requests of 103 and says so — the 14 waiting and 7 no-shows have no lag, not zero lag. Then mechanics: AVG ignores NULLs, so AVG(lag) over ALL requests returns the pinged-only average (2.98 days) with a silently shrunken population — a real number wearing the wrong name, unverifiable from the header. COUNT(ping) counts the pinged subset; the gap between it and COUNT(*) IS the outstanding count, which is a feature — the waiting queue is the operational queue. What is never acceptable is IFNULL-ing the lag to zero to 'fix' the average: that folds 21 phantom zero-lag requests into the mean and publishes instant pickup for requests nobody has pooled. The gate lives in WHERE (ping IS NOT NULL) with the population named in the header — a utilization report whose WHERE clause is doing definitional work silently is exactly what a Via review hunts for.",
      tag: "nulls",
    },
    {
      id: "via-t7",
      q: "The service review buckets requests by month. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', requested_at) — year plus zero-padded month, 14 buckets on this ledger from 2024-01 to 2025-02; '%m' alone folds January 2024 into January 2025 and the service curve becomes fiction. The quarter window: half-open intervals — requested_at >= '2024-01-01' AND requested_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's requests, and month-boundary nights are exactly when pooling demand lands. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first delta is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month in a demand walk. Date discipline is utilization discipline: the spine, the window and the edge row are where service reports go wrong.",
      tag: "dates",
    },
    {
      id: "via-t8",
      q: "Partner billing says a paid invoice has no settlement rows behind it. Walk me through the reconciliation query you write first — and the cents rule you never break writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this book that returns 6 bills worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why the settlement rows are the ledger of record and the status column is a claim. Then the mirror check: a void bill WITH a settlement row (this book has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The cents rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 6,644.30 print into 6,644 and eats cents on every odd-cent bill, at municipal scale where the counterparty audits line by line. Reconciliation culture: counts and sums must agree between the service ledger and the billing run, and when they do not, the query that shows WHICH rows disagree is the deliverable.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "via-mcq-1",
      prompt: "Requests join to passenger legs (251 legs under 103 requests). What does COUNT(*) count in the joined query?",
      choices: ["103 — the join preserves request grain", "251 — the fan-out multiplies requests by their legs", "251 × 103 — a cross product", "It depends on the join direction only"],
      answer: 1,
      why: "After the join, COUNT(*) counts legs — one row per leg. The 2.4× fan-out IS the pooling shape, and quoting it as a request count is the grain error this domain drills first.",
      notes: [
        { choice: 0, why: "Only COUNT(DISTINCT request_id) preserves the request grain after the join. COUNT(*) counts whatever rows survive — and survival is at leg grain." },
        { choice: 2, why: "A cross product needs CROSS JOIN — an ordinary equi-join on request_id emits one row per matching leg, 251 total." },
      ],
      difficulty: "easy",
    },
    {
      id: "via-mcq-2",
      prompt: "Completed-request rate: 52 completed, 14 waiting, 30 en-route, 7 no-shows of 103 booked. Which denominator does the house definition use?",
      choices: ["Completed + no-shows only (52/59)", "All booked requests (52/103)", "Waiting requests only", "Distinct riders (52/16)"],
      answer: 1,
      why: "The house definition: completed ÷ ALL booked — 50.5%. Waiting requests sit in the denominator because they're booked demand the system accepted; every alternative computes a real but differently-named metric.",
      notes: [
        { choice: 0, why: "That's the RESOLVED-request rate — 88.1%. Calling it 'the completion rate' inflates 50.5% by silently deleting the waiting queue — the exact flattery pooling analytics exists to prevent." },
        { choice: 3, why: "52/16 is completed requests per rider — an intensity ratio, not a rate. Rates divide populations of the same grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "via-mcq-3",
      prompt: "A municipal invoice reads amount_cents = 92500. Which expression prints its dollar value?",
      choices: ["amount_cents / 100", "ROUND(amount_cents / 100.0, 2)", "amount_cents * 100", "ROUND(amount_cents, 2)"],
      answer: 1,
      why: "INTEGER cents ÷ 100.0 promotes to real arithmetic: 925.00. The .0 is the entire fix — integer ÷ integer truncates, and every odd-cent bill leaks its cents into the floor.",
      notes: [
        { choice: 0, why: "92500 / 100 is integer division = 925 — on round-dollar bills the bug hides; the first odd-cent row exposes it. Promote before you divide." },
        { choice: 2, why: "Multiplying gives 92,500,000 — units inverted. Sanity-check magnitude: dollars are smaller than cents." },
      ],
      difficulty: "easy",
    },
    {
      id: "via-mcq-4",
      prompt: "What does COUNT(*) FILTER (WHERE status = 'cancelled') compute inside a GROUP BY zone?",
      choices: ["All rows in the zone, with cancelled ones flagged", "The count of cancelled rows within each zone — a conditional count in the same scan as COUNT(*)", "A separate query run per zone", "The percentage of cancelled rows"],
      answer: 1,
      why: "FILTER (WHERE …) is a per-aggregate gate: within each zone's group, only rows passing the predicate are counted — the one-scan census idiom, equivalent to SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), guaranteed to describe the same population as the unfiltered COUNT(*).",
      notes: [
        { choice: 0, why: "The plain COUNT(*) next to it does that. FILTER narrows WHICH rows the aggregate sees — it never flags rows in the output." },
        { choice: 3, why: "A percentage needs the division: 100.0 * COUNT(*) FILTER (…) / COUNT(*). FILTER counts; it doesn't normalize." },
      ],
      difficulty: "medium",
    },
    {
      id: "via-mcq-5",
      prompt: "Keep only zones with at least 20 completed requests. Where does the gate live?",
      choices: ["WHERE completed >= 20, before GROUP BY", "GROUP BY zone HAVING COUNT(*) FILTER (WHERE status = 'delivered') >= 20", "WHERE status = 'delivered' AND COUNT(*) >= 20", "HAVING completed >= 20, before GROUP BY"],
      answer: 1,
      why: "A completed-count floor judges a conditional aggregate that exists only after grouping, so HAVING follows GROUP BY. On this ledger it keeps EU (24) and APAC (21) and drops US (5) and LATAM (2).",
      notes: [
        { choice: 0, why: "There is no 'completed' column on the raw table — it materializes at the fold. WHERE runs before groups exist and rejects the aggregate outright." },
        { choice: 2, why: "Mixing a row-level predicate with an aggregate in WHERE is a double error: the status gate would also delete the waiting requests your denominator still needs." },
      ],
      difficulty: "medium",
    },
    {
      id: "via-mcq-6",
      prompt: "The lag report needs average completion lag per zone. 21 of 103 requests have no ping yet. Where does the NULL gate go?",
      choices: ["IFNULL the lag to 0 so every request contributes", "WHERE shipped_at IS NOT NULL before the fold, population named in the header", "Leave it — AVG handles NULLs, no gate needed, no note needed", "HAVING shipped_at IS NOT NULL after the fold"],
      answer: 1,
      why: "Only pinged requests have a lag, so the gate belongs in WHERE — and the header must say 'pinged requests only', because the un-gated AVG would silently measure the same 82-ride population without saying so. The gate is definitional work, and definitional work is stated.",
      notes: [
        { choice: 0, why: "IFNULL-to-zero folds 21 phantom zero-lag requests into the mean and publishes instant completion for rides still waiting — a plausible number that is exactly wrong." },
        { choice: 2, why: "AVG does ignore NULLs — the VALUE survives ungated, but the POPULATION is now implicit. An unverifiable population is the quieter half of the bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "via-mcq-7",
      prompt: "100.0 * COUNT(*) FILTER (WHERE status = 'cancelled') / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to percentage-valued requests", "It is cosmetic — moving it changes nothing"],
      answer: 1,
      why: "Without it, integer ÷ integer is integer division — every zone's no-show share truncates toward 0 and the map reads flat. The 100.0 forces real division first; on this ledger it's the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (a/b)*100 truncates first, then scales — 0.068 became 0 at the fold. Order of operations is the metric." },
      ],
      difficulty: "medium",
    },
    {
      id: "via-mcq-8",
      prompt: "HAVING AVG(lag) > (SELECT AVG(lag) FROM requests WHERE zone = 'LATAM-pilot') runs against staging where the pilot zone has zero requests. What does the screen return?",
      choices: ["An error — scalar subqueries must return a row", "Zero rows silently — the comparison passes nothing", "Every row — NULL comparisons default to true", "Only NULL-lag requests"],
      answer: 1,
      why: "The empty inner fold yields NULL, AVG(lag) > NULL is UNKNOWN, and HAVING passes nothing — a valid query that ships an empty slide. Pre-launch zone staging makes this routine, which is why the inner fold's population is stated out loud.",
      notes: [
        { choice: 0, why: "SQLite tolerates the empty case as NULL rather than erroring — worse than a crash, because the deck LOOKS finished. The portable habit is checking the inner fold's row count." },
        { choice: 2, why: "No comparison against NULL defaults to true — UNKNOWN is discarded in both directions. Nothing 'passes' a NULL comparison." },
      ],
      difficulty: "hard",
    },
    {
      id: "via-mcq-9",
      prompt: "Analyst A computes AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) with NO gate and reports 2.98. Analyst B gates with WHERE shipped_at IS NOT NULL and reports 2.98. What explains the pair?",
      choices: [
        "A bug — the ungated average must be lower because 21 requests contribute zero lag",
        "Both print the same VALUE — AVG ignores NULLs, so the ungated fold silently measures the same 82 pinged requests; the difference is that only B's population is stated",
        "The gate changed the average but rounding hid it",
        "One of them used DISTINCT",
      ],
      answer: 1,
      why: "AVG skips NULL rows entirely — the 21 ping-less requests contribute nothing to either fold, so both averages are the same 82-ride mean. The difference is honesty, not arithmetic: A's number has an implicit, unverifiable population; B's header says 'pinged requests only'. The failure mode people expect (zero-folding) only happens if someone IFNULLs the lag to 0 first.",
      notes: [
        { choice: 0, why: "NULL is not zero — the ungated rows drop out of AVG rather than dragging it down. The zero-folding bug requires IFNULL(lag, 0), which is a different (and worse) query." },
        { choice: 2, why: "No rounding is involved — the two folds are row-for-row the same set. Rounding differences are a red herring here." },
      ],
      difficulty: "hard",
    },
    {
      id: "via-mcq-10",
      prompt: "An on-time CASE runs WHEN JULIANDAY(shipped_at) - JULIANDAY(created_at) <= 3 THEN 'on-time' ELSE 'late' — no no-ping arm. Where do the 21 ping-less requests land?",
      choices: ["'on-time' — NULL compares as zero", "'late' — lag is NULL, NULL <= 3 is UNKNOWN, so the row falls to ELSE", "An error — CASE cannot evaluate NULL conditions", "They are skipped — CASE drops rows that fail all arms"],
      answer: 1,
      why: "The lag is NULL for unpinged requests, NULL <= 3 is UNKNOWN, the arm doesn't fire, and the exhaustive ELSE catches them as 'late' — requests with no lag at all re-bucketed as failures. That's why the no-ping arm (ping IS NULL THEN 'no ping') fires FIRST in every on-time band this team ships.",
      notes: [
        { choice: 0, why: "NULL never compares as zero — every comparison with NULL is UNKNOWN, never true. The zero-folding illusion comes from IFNULL, which this CASE doesn't use." },
        { choice: 3, why: "CASE doesn't drop rows — a row failing every WHEN arm takes the ELSE. Dropping would need a WHERE, and then the band totals wouldn't reconcile to the base." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-via-1",
      tier: "medium",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass pooling census",
      brief:
        "Via-flavored brief on the storefront db: the morning ops review opens with the pooling census — requests, completed, no-shows and fare revenue per zone — built as ONE pass because the same fold runs every day. Probed facts: 103 requests across four zones; completed counts 24 (EU) / 21 (APAC) / 5 (US) / 2 (LATAM) summing to 52; no-shows 3 / 3 / 1 / 0 summing to 7; zone revenue 15,089.23 / 11,605.45 / 7,286.16 / 852.44 summing to the 34,833.28 book. The census is a single GROUP BY with FILTER branches — every branch describes the same request population, and the arms must reconcile back to COUNT(*) before the standup accepts the number.",
      ask: "Return every zone with request count, completed count, no-show count and fare revenue — one scan, biggest zone first.",
      template:
        "SELECT c.region AS zone,\n       COUNT(*) AS requests,\n       COUNT(*) FILTER (WHERE {1}) AS completed,\n       COUNT(*) FILTER (WHERE o.status = 'cancelled') AS no_shows,\n       ROUND(SUM(o.total), 2) AS fare_revenue\nFROM orders o\nJOIN customers c ON c.id = {2}\nGROUP BY c.region\nORDER BY requests {3};",
      slots: [
        {
          answer: "o.status = 'delivered'",
          kind: "keyword",
          label: "the completed arm",
          why: "The completed arm gates on the exact status: status = 'delivered' catches the 24/21/5/2 completed requests. status != 'cancelled' would sweep en-route and waiting into 'completed' and the census would flatter every zone.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the request-to-rider join key",
          why: "Each request attaches to its rider's zone via the FK: c.id = o.customer_id. c.id = c.id is always true — the join cross-products and every zone count inflates 16-fold, a census that reconciles to nothing.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-zone-first direction",
          why: "Ops reads the load leader first: EU 45 requests on top. ASC would open the standup on LATAM's 2 requests and the review reads upside down.",
        },
      ],
      distractors: ["o.status != 'cancelled'", "c.id", "SUM", "ASC"],
      walkthrough:
        "One scan, four numbers, one population. The join attaches each of the 103 requests to its rider's zone; GROUP BY c.region folds them into four buckets, and the FILTER branches count inside the SAME fold: completed (status = 'delivered') reads 24 / 21 / 5 / 2 — summing to 52, the completed base — while the no-show branch reads 3 / 3 / 1 / 0, summing to 7, and ROUND(SUM(o.total), 2) prices each zone at 15,089.23 / 11,605.45 / 7,286.16 / 852.44, summing to the 34,833.28 book. The reconciliation the standup demands: arms describe the same 103 requests, and requests + completed + no_shows + the unlisted en-route/waiting counts reassemble the base. The distractors each break differently: status != 'cancelled' turns the completed arm into 'not a no-show' — EU reads 42 instead of 24, and the census stops measuring completion; c.id in the join key is always true, cross-producting to 824 / 515 / 206 / 103 — inflated counts that reconcile to nothing; SUM in a COUNT slot is a syntax break; ASC flips the read order. The deeper habit: a one-pass census is only honest when its arms share the fold — the moment a branch's population drifts, the reconciliation check is the only thing standing between the standup and a plausible lie.",
    },
    {
      id: "cs-via-2",
      tier: "hard",
      topic: "t3",
      universe: "month-close",
      title: "The zone completion-lag read",
      brief:
        "Via-flavored brief on the storefront db: the on-time review benchmarks zones by completion lag — request timestamp to completion ping, averaged per zone, FASTEST zone first. Probed facts: 82 of 103 requests carry a ping (14 waiting, 7 no-shows have none); the ledger-wide average is 2.98 days with a 2..4 range; by zone the ladder reads APAC 29 pinged requests at 2.93, EU 36 at 2.94, US 15 at 3.07, LATAM 2 at 3.5. The population is contractual: lag exists only where the ping exists, so the un-pinged 21 are gated out in WHERE and named in the header — an average over an unnamed population is a number this review won't sign.",
      ask: "Return each zone's completed-request count and average completion lag in days, fastest zone first.",
      template:
        "SELECT c.region AS zone,\n       COUNT(*) AS completed_requests,\n       ROUND({1}(JULIANDAY(o.shipped_at) - JULIANDAY(o.created_at)), 2) AS avg_lag_days\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.shipped_at {2}\nGROUP BY c.region\nORDER BY avg_lag_days {3};",
      slots: [
        {
          answer: "AVG",
          kind: "keyword",
          label: "the lag average",
          why: "AVG folds the per-request lags into the zone mean — 2.93 for APAC. SUM would print total lag-days (36 requests' worth in EU, not the mean) and COUNT would print the request counts wearing a lag column's name.",
        },
        {
          answer: "IS NOT NULL",
          kind: "keyword",
          label: "the pinged-requests gate",
          why: "Lag exists only where the ping exists: shipped_at IS NOT NULL keeps the 82 pinged requests and excludes the 21 waiting/no-show rows by definition. IS NULL would return the opposite population — 21 rows with NULL lag — and the ladder would read as an empty promise.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the fastest-first direction",
          why: "The benchmark reads fastest at the top: APAC 2.93, then EU 2.94, US 3.07, LATAM 3.5. DESC would open the review on the slowest zone — useful for a different meeting, not this one.",
        },
      ],
      distractors: ["SUM", "COUNT", "IS NULL", "DESC"],
      walkthrough:
        "A gate, a delta, a ladder. WHERE shipped_at IS NOT NULL is the definitional move: 82 of 103 requests survive — the 14 waiting and 7 no-shows have no ping, therefore no lag, and the header says so. JULIANDAY(shipped_at) - JULIANDAY(created_at) turns each timestamp pair into days; AVG folds them per zone and ROUND(…, 2) prints the ladder — APAC 29 requests at 2.93, EU 36 at 2.94, US 15 at 3.07, LATAM 2 at 3.5 — fastest first, which is the benchmark orientation the on-time review reads. The COUNT(*) column doubles as the population audit: 29 + 36 + 15 + 2 = 82, the pinged base, printed right beside the average it describes. The distractors each break differently: SUM prints lag-DAYS totals (EU ~105.8) that look like plausible-but-wrong averages; COUNT prints the request counts in the lag column — and orders the ladder by count instead of speed; IS NULL inverts the gate to the 21 un-pinged requests, three zones of NULL averages; DESC opens on LATAM's 3.5, the slowest read. The deeper habit: the population gate and the population audit are the same discipline — name the 82 in the header, prove the 82 in the COUNT column, and the average can be argued about on its merits.",
    },
  ],

  problems: [
    { slug: "trips-and-users", why: "The canonical two-sided screen: ride status rates with excluded accounts handled in the join — pooling's completion-share-by-zone in textbook clothing." },
    { slug: "percentage-of-users-attended-a-contest", why: "Reach share across riders with the 100.0-before-division fix — the zone-penetration percentage the service review quotes." },
    { slug: "active-businesses", why: "One-pass conditional flags per entity — the morning census shape: how many events of each kind did this zone fire, in a single scan." },
    { slug: "immediate-food-delivery-ii", why: "A conditional-count ratio where the denominator is the whole test — completed ÷ ALL booked, waiting included: 52 of 103, never 52 of 59." },
    { slug: "average-time-of-process-per-machine", why: "Per-entity latency folds — the completion-lag read (2.98-day average, 2..4 range) grouped by the zone or corridor doing the work." },
    { slug: "last-person-to-fit-in-the-bus", why: "Running-capacity window: riders boarding until the vehicle fills — the pooling/capacity shape that decides whether a shuttle runs full." },
    { slug: "calculate-orders-within-each-interval", why: "Wait-time band counts — requests folded into waiting buckets, the on-time band's cousins that ops reviews read as a histogram." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the vocabulary check before every utilization leaderboard, said out loud with the shared-rung policy." },
    { slug: "hopper-company-queries-i", why: "The monthly driver/request spine — month buckets over the 2024-01..2025-02 calendar, the trend read every service review hangs on." },
    { slug: "hopper-company-queries-ii", why: "Request completion rates with honest denominators — the ride-hailing rate drill this kit's ratio questions orbit." },
    { slug: "group-sold-products-by-the-date", why: "Manifest folding: per-day rows folded into one roster cell — the pool-manifest read dispatch uses to see who rode together." },
    { slug: "customers-who-never-order", why: "The anti-join grammar itself — and the confidence to report a verified zero never-ordered riders, which this ledger genuinely has." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one query with the 100.0-before-division fix — the honest-denominator drill Via's ratio questions orbit." },
    { slug: "find-cities-in-each-state", why: "GROUP_CONCAT per group — corridors folding their constituent pickup points into one cell, the zone-roster idiom." },
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded share where unmatched rows count as zero — the NULL-policy and rounding habits in one deliverable." },
    { slug: "the-category-of-each-member-in-the-store", why: "CASE tier classification per rider — usage bands ('gold' vs 'standard') where the ELSE arm is exhaustive by design, the on-time band's grammar." },
  ],
};
