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
    "Via's economics are contract-shaped, and the ledger shows it. The company sells *pooling as a service* to cities and transit authorities — software plus fleet operations under municipal terms — which is why the billing side of this kit behaves like a public-sector book: 28 `invoices` against 27 `payments`, every value in **INTEGER cents**, a flat 30-day issue-to-due window on every bill (30 average, 30 min, 30 max — no negotiated outliers), and settlement arriving on two rails: {amber:card} 16 flows worth 37,364.00 against {sky:wire} 11 flows worth 32,248.00 — 27 settlements totaling 69,612.00. The margin lever is utilization, so supply concentrates: the top fleet partner carries **32% of billed volume** (11,130.25) and the next 26.7% — a two-partner majority that turns the concentration fold into a renewal-risk board. Demand concentrates too: 63.5% of revenue comes from riders whose lifetime spend crosses 3,000 — a small base of heavy regulars, exactly the profile municipal pooled services build around.",
    "Preparation roadmap: treat the case-study set as a four-week arc and rebuild each query from a blank editor. Week 1, grain and denominators — write the one-pass zone census until the arms reconcile without thinking (requests 103, completed 52, no-shows 7, revenue 34,833.28). Week 2, windows and frames — the zone lag ladder (APAC 2.93 to LATAM 3.5), then the seat-pair census and a running-capacity frame, saying the frame bounds out loud. Week 3, the billing book — the settlement rail stack, the coverage census (21 exact, 1 partial, 6 untouched) and the **15,217.00 chase list**, all at {emerald:cents discipline}: `/ 100.0` at the display edge, never integer division. Week 4, query-budget rehearsal — every deliverable in *one pass*, populations named in headers, boundaries stated. The gates to clear every time: name the grain, state the denominator, gate the NULLs before the average, reconcile the arms back to `COUNT(*)`.",
  ],

  dayInLife: [
    "**08:15 —** The day opens on the utilization board: overnight pooled requests versus completion pings — 82 of 103 — and the first query is the one-pass census, one scan per zone: requests, completed, no-shows, revenue in a single GROUP BY. The numbers must reconcile before the standup: completed classes sum to 52, no-shows to 7, and the leg fan-out (251 legs under 103 requests) says whether yesterday's pools actually pooled. A drift here is the day's first fire, and the analyst who can write the census *and* the diff against yesterday's fold owns the incident.",
    "**11:00 —** Midday is pooling deep-work. The ops lead wants the completion window by zone — JULIANDAY lag over the pinged requests, waiting requests gated out with a stated NULL policy, APAC's 2.93 benchmarked against LATAM's 3.5 — and a partner manager wants the same fold as an on-time band: lag within window versus outside, with the no-ping requests routed to their own arm *before* any lag comparison fires. A capacity question lands mid-block: which zones run pools tight enough that legs-per-request climbs — the join-fan-out read that turns 251 legs into a utilization signal rather than a bug report.",
    "**15:00 —** The afternoon is partner cycles. The municipal billing review walks the invoice book — 28 `invoices`, INTEGER cents, `amount_cents / 100.0` — then the coverage census: 21 settled exactly, 6 never-collected (15,217.00), 1 partial at 4,000.00 of 6,148.00, with #28 — the 1,756.00 bill {rose:claiming paid with zero settlement rows} — already in the anomaly queue beside its mirror, #11, {rose:void-but-paid} at 925.00. Fleet-partner share gets one query: the top partner carries 32% of billed volume, and concentration is a renewal-risk conversation, not a trivia answer.",
    "**17:45 —** End of day is the writeup that keeps tomorrow's fold honest. The zone census ships with its reconciliations printed (classes summing back to `COUNT(*)`), the on-time band ships with its arm order documented — no-ping first, boundary stated — and the lag report carries its population in the header: *82 pinged requests, 14 waiting and 7 no-shows excluded by definition, not by accident*. The rhythm to internalize: Via SQL exists to prove pooling works at the zone grain — *utilization is a denominator decision made before the query runs*.",
    "**19:30 —** The evening-peak postmortem runs after the writeup because transit's day isn't over when the deck ships. The manifest read comes first: `GROUP_CONCAT` folds each pool's roster into one cell, and the seat-pair census underneath counts the co-ride pairs the manifests imply — {violet:pair math} that turns *who shared a vehicle* from an anecdote into a histogram. Then the rail check: card 16 settlements worth 37,364.00 against wire 11 worth 32,248.00, cross-footing to the 69,612.00 settlement book — and the ledger tie the close hangs on, debits 181,080 against credits 181,080, {emerald:delta zero}. *The night shift inherits a reconciled board or a named incident — nothing in between.*",
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
    { name: "Corridor-family fare fold", what: "Revenue and legs per corridor family: Audio leads at 11,744.01 on 97 legs, Wearables 6,929.12 on 53, Video 5,198.41 on 61 — while Accessories touches the most requests (54) at only 3,294.29. Reach and yield are different crowns." },
    { name: "Fare-band census", what: "One pass over the service catalog: 8 budget lines under 50 (avg 32.06), 8 mid lines 50–200 (avg 111.5), and the premium band empty at the 199.99 ceiling — a verified absence the pricing review states rather than papers over." },
    { name: "Settlement coverage census", what: "Per-bill coverage in three classes: 21 settled exact (65,612.00), 1 partial (4,000.00 of 6,148.00 — invoice #25), 6 untouched (15,217.00). The month-close quotes this census verbatim." },
    { name: "Rider concentration", what: "Share of revenue from riders above a lifetime-spend threshold: 63.5% from 3,000-plus spenders, 71.2% from 2,000-plus. Pooling economics live or die on the heavy regulars — the threshold pick is a board decision." },
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
    {
      name: "Set-op report stacks",
      why: "Ops decks stack reports: the completed census over the no-show census, the card rail over the wire rail, a TOTAL banner under both. UNION ALL is the append that keeps every row; bare UNION dedupes whole rows and can silently eat a stack row. Via drills the column contract — same column count, same order, same grain on both sides of the operator.",
      slugs: ["monthly-transactions-ii", "movie-rating", "team-scores-in-football-tournament"],
    },
    {
      name: "Benchmarks & nested folds",
      why: "Every zone read begs the network benchmark: is this zone's completion share above the house average? Scalar and IN subqueries answer it, and each shape has a grain — a scalar in SELECT runs per row, an IN-list gates a filter, a derived table folds once. Via drills choosing the shape before writing the SQL.",
      slugs: ["game-play-analysis-iv", "second-highest-salary", "market-analysis-i"],
    },
    {
      name: "Running frames & capacity curves",
      why: "Utilization is a curve, not a point: seats filled request-by-request, fare revenue running across the month spine. Window frames — ROWS versus RANGE, the default CURRENT-ROW frame and its peer double-count — are where capacity curves go quietly wrong. Via drills saying the frame bounds out loud before the curve ships.",
      slugs: ["find-cumulative-salary-of-an-employee", "restaurant-growth", "rolling-average-steps"],
    },
    {
      name: "Existence gates & NULL-safe predicates",
      why: "Pool-eligibility is an existence question: does this rider have a completed request? does this bill have any settlement? NOT EXISTS, LEFT JOIN IS NULL and IN-lists answer it — and the IN-list carries a NULL trap that empties the whole filter. Via drills the gate that stays correct when the data isn't.",
      slugs: ["find-customer-referee", "number-of-accounts-that-did-not-stream", "customers-who-bought-all-products"],
    },
    {
      name: "Staged folds & derived tables",
      why: "Service reads are multi-stage: fold legs per request, classify the folds, fold again for the board. Derived tables and CTEs stage those steps so each stage's grain is nameable — the month-close coverage census is unreadable without them. Via drills staging over cleverness, one testable stage at a time.",
      slugs: ["immediate-food-delivery-iii", "investments-in-2016", "managers-with-at-least-5-direct-reports"],
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
    {
      id: "via-t9",
      q: "A running-capacity read — seats filled request by request across the day — is a window frame question. What frame does SQLite give you by default, and where does it lie?",
      a: "With an ORDER BY present, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE works on values, not rows: two requests sharing a timestamp are peers, and both land inside the same running step — the capacity curve double-counts at the boundary minute and nobody notices unless the frame is stated. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW makes the running total row-exact: each request advances the curve by exactly its own seats. The deeper point is that the default frame is a contract most candidates can't recite, so a running read without a named frame is an unverified read. Via's habit: every running-capacity or running-fare curve writes its frame bounds into the review header, and the peer case — identical timestamps on pooled dispatch — is tested on purpose before the curve is trusted.",
      tag: "windows",
    },
    {
      id: "via-t10",
      q: "The settlement stack appends a TOTAL banner under the card and wire folds. UNION or UNION ALL — and what contract does the stack impose on both sides?",
      a: "UNION ALL, by policy. The banner is a separate fold appended underneath the detail folds, and UNION dedupes whole rows across the stack — today the card row (16 settlements, 37,364.00), the wire row (11, 32,248.00) and the banner (27, 69,612.00) are all distinct, so both operators print the same deck, which is exactly why the habit matters: the day two rails produce an identical (count, value) pair, bare UNION silently eats a row and the stack reconciles to nothing. The set-op contract is positional: same column count, compatible types, same grain on each side — a detail side folded per method and a banner side folded over everything. Candidates who can state that contract debug stacks by reasoning; candidates who can't debug them by deleting rows.",
      tag: "sets",
    },
    {
      id: "via-t11",
      q: "Every zone read begs the network benchmark — is this zone's completion share above the house average? Compare the scalar-subquery shape against the derived-table shape.",
      a: "The scalar shape puts the benchmark in the SELECT list: (SELECT AVG(...) FROM requests) beside each zone's number — correct, and it re-runs the network fold once per output row, which is fine on four zones and a scale smell on four thousand. The derived shape stages the network fold once in a subquery (or CTE) and joins it back, so the expensive fold runs exactly once and every zone compares against the same staged row. Both print the same 3.07-against-2.98 comparison; they differ in how the cost grows and in reviewability — the staged version's inner fold can be tested independently, the inline scalar can't. Correlated shapes earn their cost only when the inner query genuinely depends on the outer row. Via's rule: benchmark reads stage the shared fold once, then compare — the shape IS the performance review.",
      tag: "subqueries",
    },
    {
      id: "via-t12",
      q: "Pool eligibility: WHERE route_code NOT IN (SELECT code FROM sanctioned_routes) — and one sanctioned row has code NULL. What ships, and what are the guards?",
      a: "Nothing ships. x NOT IN (1, 2, NULL) can never be true: the IN-list semantics degrade every comparison to UNKNOWN the moment a NULL sits in the list, so the whole filter empties — a valid query returning zero eligible riders, which reads as a demand collapse instead of a data-entry gap. The guards, in order of preference: NOT EXISTS, which is immune because it tests for the existence of a matching row rather than set membership; an explicit WHERE code IS NOT NULL inside the inner fold, with the exclusion stated; or COALESCE at the edge with the policy named. The Via review stance: an empty result from a filter that used to return rows is a suspect result first and a finding second — the NULL-in-the-list check is the first diff anyone runs.",
      tag: "nulls",
    },
    {
      id: "via-t13",
      q: "A service read folds legs per request, classifies the folds, then folds the classes for the board. Why stage it, and what does each stage owe the reviewer?",
      a: "Because nested aggregates in one SELECT are where grain dies: the inner fold (one row per request, its leg count), the classification (per-request states — completed, waiting, no-show) and the outer fold (counts per class for the board) are three different grains, and a single-level query blends them into numbers no one can defend. The staging discipline — derived table or CTE per stage — makes each stage testable: the inner fold's row count is checkable against the leg table, the classification's arms reconcile against the staged population, the outer fold's classes sum back to the staged rows. Each stage also gets a name, which is what a reviewer actually reviews. Via's bar: a reviewer can state the grain of every stage in the stack without re-deriving it — a query that fails that test is rewritten, not explained.",
      tag: "pipeline",
    },
    {
      id: "via-t14",
      q: "Dispatch wants each pool's manifest as one cell — riders, pickup points, in order. What does a defensible GROUP_CONCAT read look like?",
      a: "Three decisions, each stated. Separator: the default is a bare comma, so GROUP_CONCAT(rider, ', ') is the readable roster — the cosmetic choice that decides whether dispatch actually reads the cell. Order: a folded string with no ORDER BY inside the aggregate is scan-order luck, and a manifest whose order changes between runs is worse than useless — order inside the fold where the engine supports it, or fold from a pre-sorted derived table. Length: a folded cell is a display artifact with real size limits, not a data structure — fold at the presentation edge, never mid-pipeline, and never join on the folded string afterward. Via treats the roster fold the way it treats any census: a named grain (one cell per pool), a stated order, and a delimiter contract the downstream parser can verify.",
      tag: "aggregation",
    },
    {
      id: "via-t15",
      q: "251 legs over 103 requests is 2.44 legs per request — yet the screen prints 2. Walk me through the type policy that fixes it, and where the same bug eats money.",
      a: "Integer over integer is integer division: 251/103 truncates to 2, and the fraction IS the pooling signal — a fan-out that reads 2.0 says the shuttle is a taxi. The fix is promotion BEFORE the divide — multiply either operand by 1.0, or CAST to REAL — and rounding only at the display edge, because rounding first then dividing still truncates. The same policy at money scale: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 is invisible on round-hundred bills and silently eats cents on every odd one, at municipal scale where the counterparty audits line by line. Via's screens treat numeric type discipline as a stated habit: promote before the operation, round once at the edge, and be able to say which of your columns are counts, which are cents, and which are ratios.",
      tag: "types",
    },
    {
      id: "via-t16",
      q: "Where do COALESCE and NULLIF belong in a transit analytics kit — and where do they become lies?",
      a: "They're contracts, and the review question for every fallback is: is this substituting a value the business recognizes, or laundering a gap into a meaning? Honest uses: NULLIF(COUNT(*), 0) turns an empty fold's division into NULL — the rate correctly reads 'no denominator' instead of erroring or printing a fiction; COALESCE on a display label (fallback name for an unnamed corridor) is presentation, not measurement. Dishonest uses: IFNULL(lag, 0) folding un-pinged requests into an average as zero-lag rides — instant completion for trips nobody has pooled; COALESCE(cancelled_count, 0) on a fold that never ran, making a missing census row read as a perfect month. The Via test: a substituted value must survive the question 'would the business have recorded this value if it were true?' If not, gate the NULL in WHERE and name the population instead.",
      tag: "quality",
    },
    {
      id: "via-t17",
      q: "A corridor served zero requests in July. The monthly trend fold has no July row for it. Why is that a lie, and how do you build the honest spine?",
      a: "Absence is a data point: a GROUP BY over requests can only produce rows for months that have requests, so the zero month vanishes and the trend line silently skips it — a chart that reads as continuity is actually hiding the outage. The honest spine is built, not found: a calendar of buckets (a recursive CTE generating months, or a derived month list) LEFT JOINed to the request fold, so every bucket stands and empty ones read 0 with the bucket still visible. The joins use '%Y-%m' keys on both sides and half-open date windows so no boundary night leaks between buckets. Via's trend reads treat the spine as part of the deliverable: the reviewer checks the bucket count first — 14 months on this ledger — because a 13-row trend table for a 14-month window is the outage nobody charted.",
      tag: "dates",
    },
    {
      id: "via-t18",
      q: "Recite the pipeline — and use it to explain why a window function can't sit in WHERE, and what HAVING can see that WHERE can't.",
      a: "FROM/JOIN, then WHERE, then GROUP BY, then HAVING, then SELECT — where windows evaluate — then ORDER BY, then LIMIT. Three screens fall out of that order. A window function can't sit in WHERE because WHERE runs before the SELECT stage exists — window expressions are evaluated with the projected rows, so a rank gate lives in an outer query over the ranked set (derived table or CTE), not in the same SELECT's WHERE. HAVING sees groups after the fold — conditional aggregates like completed counts, which don't exist before grouping — while WHERE only ever sees one row at a time, which is why a completed-count floor in WHERE is a syntax error and a status filter in WHERE deletes the rows your denominator still needs. Candidates who can recite the order debug by reasoning instead of trial and error — which is what the screen is actually testing.",
      tag: "pipeline",
    },
    {
      id: "via-t19",
      q: "A join comes back with 251 rows and the analyst adds DISTINCT to make it 16. Defend or prosecute.",
      a: "Prosecute, mostly. DISTINCT after a join is a confession that the row count came out wrong and the fix was deduping — the honest move is grain-first: before DISTINCT, say what one row IS. Legs joined to riders is 251 rows at leg grain; DISTINCT on rider collapses to 16 and silently deletes the fan-out — the 2.44 legs-per-request signal pooling runs on — so the 'cleaner' result is the pooling story erased. DISTINCT is right when the duplicated key is genuinely an artifact of the join path, like folding a chain of ids for an IN-list, and wrong when it's papering over a fan-out the metric needs. The Via review habit: every DISTINCT gets a comment naming the grain that survives and why that's the deliverable — an unpriced DISTINCT is treated as an unpriced assumption, and the fan-out it deleted is usually the business model.",
      tag: "joins",
    },
    {
      id: "via-t20",
      q: "Ridership headway: LEAD(requested_at) OVER (PARTITION BY rider ORDER BY requested_at) turns a rider's history into gaps between requests. Where are the edges, and what does the last row mean?",
      a: "Two edges, both NULL by construction: the first row has no LAG and the last row has no LEAD — a rider's most recent request has no 'next' yet. The last row's NULL is the semantically loaded one: it means 'no observed next request', which is a right-censoring statement about the data, not a zero. COALESCE the headway to 0 and the rider reads as instant-repeat demand — the hottest rider in the network is actually just the one you stopped observing. The honest report leaves the edge NULL, states the policy in the header (open headway = no next request observed), and lets the analyst decide whether censored rides belong in the average at all. Via's dispatch reads treat the censored tail as population, not error — the alternative is a headway average that improves every time riders churn.",
      tag: "windows",
    },
    {
      id: "via-t21",
      q: "RANK() OVER (ORDER BY SUM(o.total) DESC) — why is an aggregate legal inside a window, what does it cost, and why is the podium cut a rank and not a LIMIT?",
      a: "Legal because windows evaluate after the fold: the SELECT stage runs post-GROUP BY, so the aggregate the GROUP BY produced exists when the window's ORDER BY reads it — ranking a fold is the canonical post-aggregation window. The cost: the fold is computed twice, once for the column and once inside the window; the staged shape folds in a derived table and ranks the staged rows, which is the form that survives scale review. And the cut is a rank, not a LIMIT, because LIMIT is not rank-aware: it slices rows, and on any tie at the boundary it silently drops a peer while pretending the page is principled. RANK <= 3 keeps the tie policy explicit — shared rungs stay on the podium. Via's boards rank the fold, cut with the rank, and print the tie policy in the header.",
      tag: "windows",
    },
    {
      id: "via-t22",
      q: "Why does this team join on ids and treat name-joins as a defect? Give the full failure list.",
      a: "Keys are contracts; names are labels. c.id = o.customer_id is the FK edge the schema guarantees; joining on name fails on duplicates (two riders named the same collapses their ledgers), on whitespace and case (trailing spaces that survive every visual diff), on collation (the same string sorting equal in one engine and different in another), and on renames (a rider updates their profile and their history reattaches to a stranger). Text equality also hides type coercion: SQLite's affinity rules will compare '12' to 12 and get away with it, then the query ports to a stricter engine and breaks. The Via rule: keys are surrogate ids, names are printed at the display edge, and any join on a label needs a comment defending it — because the day it silently mis-keys a settlement, the audit trail is a text column nobody can diff.",
      tag: "joins",
    },
    {
      id: "via-t23",
      q: "What does a self-auditing query look like on this team — the version a reviewer signs without re-running anything?",
      a: "It ships with its own proof. The population printed beside the metric: the zone lag ladder carries its pinged counts — 29 + 36 + 15 + 2 = 82 — right next to the averages they describe, so the population is checkable at a glance. The arms reconciled: a band census whose branches sum back to COUNT(*) (103 booked requests across completed, en-route, waiting, no-show), so a drifted arm is visible in the deliverable, not in a post-mortem. The ledger tie asserted: debits 181,080 against credits 181,080, delta 0, printed as a row. The pattern is cheap — one extra column, one staged fold, one banner — and it converts every downstream argument from 'is the number right?' to 'is the definition right?', which is the argument worth having. Via's reviews treat an unaudited deliverable as a draft, regardless of how correct it happens to be.",
      tag: "quality",
    },
    {
      id: "via-t24",
      q: "The tables here are small — 103 requests, 251 legs. Why does this screen still ask performance instincts, and which ones?",
      a: "Because the instincts are what scales, and the screen is checking whether they exist before the tables are a million rows. Four that come up: sargable filters — STRFTIME('%Y-%m', created_at) = '2024-07' wraps the column and drops any index on it, while the half-open range created_at >= '2024-07-01' AND created_at < '2024-08-01' keeps one; index the FK edges the joins actually walk (the rider edge on requests, the request edge on legs, the bill edge on settlements) — the fan-out punishes unindexed walks hardest; select columns, not * — wide scans multiply through the leg join; and LIMIT is not an optimization for a fold — the GROUP BY still reads everything before slicing. The Via framing: on this ledger the difference is microseconds, and the interviewer is hiring the analyst who writes the July read the range way anyway, out of policy rather than necessity.",
      tag: "performance",
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
    {
      id: "via-mcq-11",
      prompt: "The settlement stack appends a TOTAL banner row (27 settlements, 69,612.00) under the card fold (16 / 37,364.00) and the wire fold (11 / 32,248.00). Which operator builds the stack?",
      choices: ["UNION — it merges the folds cleanly", "UNION ALL — the banner is a new row that must survive even if it ever duplicates a detail row", "JOIN ON method = 'TOTAL'", "GROUPING SETS — SQLite's only total idiom"],
      answer: 1,
      why: "The banner is a separate fold appended underneath the detail folds — UNION ALL appends without deduping. Bare UNION compares whole rows and would silently drop the banner the day it collided with a detail row; a join can't append a fold at all.",
      notes: [
        { choice: 0, why: "UNION dedupes whole rows across the stack. The three rows are distinct today, so both print the same deck — which is exactly why the habit matters: the collision day is silent." },
        { choice: 3, why: "SQLite has no GROUPING SETS. The grand-total stack is the two-fold UNION ALL idiom, banner labeled with a literal." },
      ],
      difficulty: "easy",
    },
    {
      id: "via-mcq-12",
      prompt: "Over the request book, COUNT(*) returns 103 and COUNT(shipped_at) returns 82. What does the 82 count?",
      choices: ["Requests with zero lag", "Requests whose completion ping exists — COUNT(column) skips NULLs", "Requests older than 2 days", "Distinct pings plus the NULL rows"],
      answer: 1,
      why: "COUNT(column) counts non-NULL values. shipped_at is NULL for the 14 waiting and 7 no-show requests, so 103 − 21 = 82 pinged requests — the exact population the lag report is allowed to average.",
      notes: [
        { choice: 0, why: "NULL is not zero — unpinged requests contribute nothing to COUNT(column). The zero-folding bug needs IFNULL, which this query doesn't use." },
        { choice: 3, why: "No DISTINCT is involved: this is a plain non-NULL count. COUNT(DISTINCT shipped_at) would count distinct timestamps — a different, mostly meaningless number." },
      ],
      difficulty: "easy",
    },
    {
      id: "via-mcq-13",
      prompt: "A pool roster folded with GROUP_CONCAT(rider) prints Alice,Emma,Grace. Dispatch wants 'Alice, Emma, Grace'. What changes?",
      choices: ["Add DISTINCT inside the aggregate", "Nothing — GROUP_CONCAT output is display-only", "Pass the separator: GROUP_CONCAT(rider, ', ')", "Wrap the column in UPPER() first"],
      answer: 2,
      why: "GROUP_CONCAT's default separator is a bare comma; the optional second argument sets it — GROUP_CONCAT(rider, ', ') produces the readable roster dispatch asked for.",
      notes: [
        { choice: 0, why: "DISTINCT dedupes values inside the fold; it never touches the separator. Two riders with the same name would collapse — a different bug entirely." },
        { choice: 3, why: "Case functions reshape values, not delimiters. The comma is the separator argument's job." },
      ],
      difficulty: "easy",
    },
    {
      id: "via-mcq-14",
      prompt: "Pool eligibility runs WHERE route_code NOT IN (SELECT code FROM sanctioned_routes). One sanctioned row has code NULL. What ships?",
      choices: ["Every rider whose code isn't in the list", "Zero rows — NOT IN with a NULL in the list can never be true", "A type error — NOT IN rejects NULLs", "Only the riders whose own code is NULL"],
      answer: 1,
      why: "x NOT IN (1, 2, NULL) degrades to UNKNOWN for every x — one NULL poisons the whole list, the filter empties, and the deck reads as 'no eligible riders' instead of 'one blank code'.",
      notes: [
        { choice: 0, why: "That's the intuition without the NULL: the moment the list contains NULL, no value can be proven NOT IN it. One blank sanctioned route empties the census." },
        { choice: 2, why: "SQLite executes it happily and silently returns nothing — worse than a crash, because the slide LOOKS finished. NOT EXISTS is the NULL-immune form." },
      ],
      difficulty: "medium",
    },
    {
      id: "via-mcq-15",
      prompt: "SUM(seats) OVER (ORDER BY requested_at) builds the running-capacity curve. Two requests share a timestamp. What does the default frame do at that step?",
      choices: ["Advances twice — each request gets its own step", "Counts both in one step — the default RANGE frame includes peers", "Drops the second request", "Raises an error on the tie"],
      answer: 1,
      why: "With ORDER BY, the default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW, and RANGE works on values: peers (equal ORDER BY keys) are included together, so the running total jumps by both requests at once.",
      notes: [
        { choice: 0, why: "That's ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW behavior — the row-exact curve must be requested explicitly." },
        { choice: 3, why: "Ties are legal and common on pooled dispatch timestamps. The frame semantics decide the curve; nothing errors." },
      ],
      difficulty: "medium",
    },
    {
      id: "via-mcq-16",
      prompt: "The pinged-request set EXCEPT the delivered-request set — which requests come back?",
      choices: ["Delivered requests that never got a ping", "Pinged requests whose status isn't delivered — the en-route book", "Requests present in both sets", "Nothing — EXCEPT requires identical tables"],
      answer: 1,
      why: "EXCEPT keeps left-side rows absent from the right side: pinged-but-not-delivered is exactly the 30 en-route requests. Both sides must project the same column shape, which they do.",
      notes: [
        { choice: 0, why: "That's the reversed EXCEPT — direction is the bug. Delivered-without-ping would need delivered EXCEPT pinged, and on this book it returns nothing." },
        { choice: 2, why: "Both-sets is INTERSECT. Swapping the operator silently changes the deliverable from the en-route book to the completed book." },
      ],
      difficulty: "medium",
    },
    {
      id: "via-mcq-17",
      prompt: "SELECT c.region, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) FROM customers c — what shape and cost is this?",
      choices: ["One fold for the whole network, shared by every row", "A correlated scalar — the inner fold re-runs per rider row, 16 folds here", "A cross join between riders and requests", "Illegal — aggregates can't appear in subqueries"],
      answer: 1,
      why: "The inner query references the outer row, so it executes once per rider: correct, trivially readable, and fine at 16 riders — a scale smell at 16 million. The derived-table shape folds once and joins back.",
      notes: [
        { choice: 0, why: "That's the staged/derived shape — fold once, join back. The inline scalar can't share work across rows." },
        { choice: 2, why: "No join happens at all — the scalar returns one value per outer row. The fan-out traps live in joins, not in scalar subqueries." },
      ],
      difficulty: "medium",
    },
    {
      id: "via-mcq-18",
      prompt: "The seat-pair census pairs legs with a.id < b.id inside each pool. Why the strict less-than?",
      choices: ["It sorts the output pairs", "It kills self-pairs and mirror duplicates — each unordered pair is counted exactly once", "GROUP BY requires an inequality", "It only speeds the join up"],
      answer: 1,
      why: "Equality would pair a leg with itself; keeping both a.id < b.id and a.id > b.id would count every pair twice, mirror-imaged. Exactly one direction yields k-choose-2 pairs per pool — the honest pooling math.",
      notes: [
        { choice: 0, why: "Ordering is incidental — the guard is about which pairs exist at all, not their presentation order." },
        { choice: 3, why: "The guard is correctness, not performance: dropping it roughly doubles every count and adds self-pairs — a census that reconciles to nothing." },
      ],
      difficulty: "hard",
    },
    {
      id: "via-mcq-19",
      prompt: "Leg fan-out: (SELECT COUNT(*) FROM order_items) / (SELECT COUNT(*) FROM orders) prints 2, not 2.44. What's the fix?",
      choices: ["Wrap the whole expression in ROUND(..., 2)", "Promote before dividing — multiply either operand by 1.0", "CAST the result to TEXT", "Use AVG() over the two counts"],
      answer: 1,
      why: "Integer ÷ integer truncates: 251/103 = 2. The promotion must happen BEFORE the divide — 251 * 1.0 / 103 = 2.44 — because rounding a truncated 2 still prints 2.00.",
      notes: [
        { choice: 0, why: "ROUND(2, 2) is 2.00 — the fraction died at the division, before rounding could see it. Promote first, round last." },
        { choice: 3, why: "AVG over a two-row set of (251, 103) is 177 — an average of counts, not a ratio of them." },
      ],
      difficulty: "hard",
    },
    {
      id: "via-mcq-20",
      prompt: "The running-fare curve uses SUM(revenue) OVER (ORDER BY day). Which frame makes it row-exact when two requests share a day?",
      choices: ["RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "No frame clause — ORDER BY alone is exact", "PARTITION BY day"],
      answer: 1,
      why: "ROWS counts physical rows, so each request advances the curve by exactly its own fare; RANGE folds peer groups, so same-day requests land in one step and the curve under-reports the day's accumulation.",
      notes: [
        { choice: 0, why: "That's the default — and the bug: RANGE includes all peers of the current ORDER BY value, not just the current row." },
        { choice: 3, why: "PARTITION BY restarts the running total per day — a different metric entirely, not a frame fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "via-mcq-21",
      prompt: "The review quotes an average fare. Which shape ships — ROUND(AVG(x), 2) or AVG(ROUND(x, 2))?",
      choices: ["They always agree", "AVG(ROUND(x, 2)) — round early so the average is clean", "ROUND(AVG(x), 2) — fold first, round once at the display edge", "Neither — CAST to INTEGER is the house form"],
      answer: 2,
      why: "Rounding per-row first changes the inputs: the average of rounded values is a different number than the rounded average. The house rule folds on full-precision values and rounds exactly once, at the edge.",
      notes: [
        { choice: 0, why: "They diverge whenever per-row rounding moves values — with fares at 338.19 average, it always does." },
        { choice: 3, why: "CAST to INTEGER truncates the average to a whole number — 338 — which is the cents-truncation bug in a different costume." },
      ],
      difficulty: "easy",
    },
    {
      id: "via-mcq-22",
      prompt: "A candidate buckets the 2024-01..2025-02 request book with STRFTIME('%Y', created_at). What breaks?",
      choices: ["Nothing — year buckets are a valid spine", "The 14-month spine collapses to 2 year buckets — and any month-level read (the 1,193.86 July trough) becomes unreachable", "It errors on ISO-8601 strings", "It only works after JULIANDAY conversion"],
      answer: 1,
      why: "'%Y' keeps only the year, so the service curve the review reads — monthly, 14 buckets — folds into 2 annual totals. The month spine needs '%Y-%m', zero-padded, so 2024-01 and 2025-01 never merge.",
      notes: [
        { choice: 0, why: "The query succeeds and misleads — the worst kind of wrong. The spine's grain is a contract stated in the deliverable." },
        { choice: 2, why: "ISO date strings sort and format fine in STRFTIME — the format string is the whole bug." },
      ],
      difficulty: "easy",
    },
    {
      id: "via-mcq-23",
      prompt: "Headway per rider: LEAD(created_at) OVER (PARTITION BY rider ORDER BY created_at). What does the rider's most recent request contribute?",
      choices: ["Zero headway — demand is hot", "NULL — no next request exists yet", "The rider's first request timestamp", "A runtime error at the boundary row"],
      answer: 1,
      why: "LEAD at the last partition row is NULL: the rider's latest request has no 'next' observed. The honest read says 'no next request yet' — coalescing it to 0 publishes instant-repeat fiction.",
      notes: [
        { choice: 0, why: "The exact lie: a censored tail becomes a zero gap, and the churniest riders rank as the hottest. NULL means unobserved, not instant." },
        { choice: 2, why: "LAG looks backward — that's the first row's edge, and it's NULL too. LEAD's edge is the last row." },
      ],
      difficulty: "medium",
    },
    {
      id: "via-mcq-24",
      prompt: "INTERSECT of the requested-rides projection and the completed-rides projection — what must hold on both sides?",
      choices: ["They must come from the same table", "Same column count, same order, compatible types — the comparison is positional", "The same number of rows", "Nothing — INTERSECT coerces types automatically"],
      answer: 1,
      why: "Set operators compare positionally: both projections must have the same shape, and the result keeps rows present in both — here, the completed requests that also appear in the requested projection.",
      notes: [
        { choice: 0, why: "Different tables are fine — that's the point of set ops. The contract is the column list, not the source." },
        { choice: 2, why: "Row counts differ by design (103 requested vs 52 completed); INTERSECT doesn't need, or want, equal sides." },
      ],
      difficulty: "medium",
    },
    {
      id: "via-mcq-25",
      prompt: "WHERE RANK() OVER (ORDER BY total) <= 3 fails to parse. Why — and what's the fix?",
      choices: ["RANK needs DISTINCT to be legal in WHERE", "Windows evaluate in the SELECT stage, after WHERE — gate in an outer query over the ranked set", "SQLite has no RANK function", "LIMIT 3 is the identical fix"],
      answer: 1,
      why: "Window functions run with the projected rows — after WHERE has already filtered. The rank gate lives in a derived table or CTE: rank inside, filter the rank outside.",
      notes: [
        { choice: 3, why: "LIMIT 3 slices rows, not ranks — on a tie at the boundary it silently drops a peer. The rank-aware cut is RANK <= 3 over the staged ranking." },
        { choice: 2, why: "RANK is core SQLite. The failure is placement in the pipeline, not availability." },
      ],
      difficulty: "medium",
    },
    {
      id: "via-mcq-26",
      prompt: "Worst-no-show zone: ORDER BY no_shows DESC LIMIT 1. EU and APAC both logged 3 no-shows. What's wrong with the deliverable?",
      choices: ["Nothing — LIMIT 1 is deterministic", "The tie is broken by scan order — the 'worst zone' is whichever row the engine touched first; the cut must be rank-aware or return the full ladder", "It returns both tied zones", "SQLite errors on tied ORDER BY"],
      answer: 1,
      why: "A LIMIT cut over a tie is nondeterministic page logic: the single-row answer is whichever EU-or-APAC row the plan happened to read first. RANK with a stated tie-breaker — or the full two-row ladder — is the review-defensible form.",
      notes: [
        { choice: 0, why: "The output looks stable between runs on a small table, which is exactly what makes it dangerous — the determinism is an artifact of scan order, not a guarantee." },
        { choice: 2, why: "LIMIT 1 returns one row by construction — that's the bug. The honest deliverable is the tied pair, named." },
      ],
      difficulty: "hard",
    },
    {
      id: "via-mcq-27",
      prompt: "After joining legs to requests (251 legs under 103 requests), how do you count the distinct riders actually served?",
      choices: ["COUNT(*) on the joined rows", "COUNT(DISTINCT o.customer_id) — 16 on this book", "COUNT(*) divided by 2", "COUNT(c.name)"],
      answer: 1,
      why: "The join fans out to leg grain — 251 rows — so rider grain must be restored explicitly: COUNT(DISTINCT customer_id). On this book it reads 16, since zero riders never ordered.",
      notes: [
        { choice: 0, why: "251 — that's the leg census wearing a rider census's name. The fan-out is the pooling signal, not noise to ignore." },
        { choice: 2, why: "A magic divisor is a guess: fan-out is 2.44, not 2, and it drifts by zone and month." },
      ],
      difficulty: "easy",
    },
    {
      id: "via-mcq-28",
      prompt: "RANK() OVER (ORDER BY SUM(o.total) ASC) feeds an outer ORDER BY revenue_rank. What ships?",
      choices: ["The best spender first", "The smallest spender crowned rank 1 — the window's own ORDER BY sets the ranking direction", "An error — aggregates are illegal inside window ORDER BY", "Ties resolved alphabetically"],
      answer: 1,
      why: "The window's internal ORDER BY defines the rank direction; the outer sort only presents ranks in order. ASC inside the window crowns the smallest — a podium printed upside down that still looks official.",
      notes: [
        { choice: 0, why: "That requires DESC inside the window. The outer ORDER BY revenue_rank just walks the ranks you already assigned." },
        { choice: 2, why: "Aggregates in window ORDER BY are legal and standard — windows evaluate after the fold. That's the podium pattern." },
      ],
      difficulty: "medium",
    },
    {
      id: "via-mcq-29",
      prompt: "Fare-per-request: SUM(total) / NULLIF(COUNT(*), 0). What does the NULLIF buy?",
      choices: ["Rounding to 2 decimals", "A zero-population fold becomes NULL instead of a division error — 'no denominator' reads honestly", "Faster aggregation", "It dedupes the request rows"],
      answer: 1,
      why: "NULLIF(x, 0) maps the empty fold to NULL, so the ratio reads NULL — 'nothing to divide' — instead of erroring or printing a fabricated number. It's the honest guard for rates over possibly-empty populations.",
      notes: [
        { choice: 0, why: "Rounding is a separate, later step. NULLIF's job is the zero-denominator case, not precision." },
        { choice: 3, why: "DISTINCT is the dedupe tool; NULLIF only rewrites a single value (0) to NULL." },
      ],
      difficulty: "hard",
    },
    {
      id: "via-mcq-30",
      prompt: "EXCEPT compares the pinged-request set to the delivered-request set, and one pinged row has NULL in a compared column. How does EXCEPT treat that NULL?",
      choices: ["Drops the row — NULL never matches anything", "NULLs compare as equal in EXCEPT's distinct-value semantics — the row survives if the rest of the row matches", "Raises a type error", "Converts the NULL to 0 before comparing"],
      answer: 1,
      why: "Set operators use distinct-value semantics where NULL equals NULL for row matching — unlike WHERE predicates, where every NULL comparison is UNKNOWN. Reconciliation stacks depend on this: the pinged-but-undelivered rows survive the EXCEPT with their NULLs intact.",
      notes: [
        { choice: 0, why: "That's the WHERE-clause intuition — true for predicates, false for set ops. EXCEPT treats NULL as a comparable distinct value." },
        { choice: 3, why: "No coercion happens anywhere in set ops. The NULL stays a NULL through the comparison." },
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
    {
      id: "cs-via-3",
      tier: "easy",
      topic: "j7",
      universe: "supplier",
      title: "The fleet-partner fare fold",
      brief:
        "Via-flavored brief on the storefront db: the quarterly fleet-partner review ranks the partners that actually moved pooled volume — fare value folded from the passenger legs through each partner's route-service catalog. Probed facts: Nordic Gadgets AB leads at 11,130.25, Midwest Hardware Co next at 9,294.93, Alpine Audio GmbH third at 4,765.63, down to Pacific Textiles at 2,980.15 — a book where the top two partners carry more than half the billed volume (32% plus 26.7%), which is why this fold doubles as the renewal-risk board. The shape is a three-table chain: partners to catalog to legs, folded once per partner, biggest first.",
      ask: "Return every fleet partner with its folded fare value (2 decimals), biggest partner first.",
      template:
        "SELECT s.name AS partner,\n       ROUND({3}(oi.unit_price * oi.quantity), 2) AS fare_value\nFROM suppliers s\nJOIN products p ON p.supplier_id = {1}\nJOIN order_items oi ON oi.product_id = {2}\nGROUP BY s.id\nORDER BY fare_value {4};",
      slots: [
        {
          answer: "s.id",
          kind: "keyword",
          label: "the partner key",
          why: "Products belong to partners via p.supplier_id = s.id — the catalog edge of the chain. Joining on s.name compares text to an integer id and empties the fold; joining on oi.product_id cross-wires supplier keys against product keys and every partner reads the same 16,562.62.",
        },
        {
          answer: "p.id",
          kind: "keyword",
          label: "the fare-line key",
          why: "Legs reference their route-service line via oi.product_id = p.id — the second edge of the chain. oi.product_id = oi.order_id compares a product key to an order key and manufactures nonsense sums (537.45 / 358.30) that still execute and still sort.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the fare fold",
          why: "The review ranks VOLUME: SUM(unit_price * quantity) folds every leg's fare into the partner's book — Nordic 11,130.25. AVG prices a single leg (Nordic 258.84) and COUNT prints leg counts (43) wearing a money column's name.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The review opens on the concentration leader — Nordic at 11,130.25, 32% of the book. ASC hands the top line to Pacific Textiles at 2,980.15 and the renewal-risk conversation starts on the smallest partner.",
        },
      ],
      distractors: ["oi.product_id", "oi.order_id", "s.name", "AVG", "ASC"],
      walkthrough:
        "A three-table chain, folded once, read biggest-first. The join walks the two edges that exist: partners to catalog on p.supplier_id = s.id, catalog to legs on oi.product_id = p.id. GROUP BY s.id folds the legs per partner and ROUND(SUM(unit_price * quantity), 2) prices the book — 11,130.25 / 9,294.93 / 4,765.63 / 3,613.25 / 3,049.07 / 2,980.15, biggest first. The business read rides on the top two rows: 32% plus 26.7% is a two-partner majority, the concentration cell the renewal board quotes. The distractors each break one stage: joining p.supplier_id to oi.product_id cross-wires two unrelated key spaces and hands every partner the same 16,562.62 — a fold that reconciles to nothing; the s.name join compares text to an id and empties the ledger; oi.order_id in the second edge pairs product keys with order keys into 537.45 / 358.30 nonsense; AVG quietly changes the deliverable from volume to unit price; ASC inverts the read. The deeper habit: a chain fold is audited edge by edge — when a partner revenue looks wrong, the join keys are the first suspects, not the data.",
    },
    {
      id: "cs-via-4",
      tier: "medium",
      topic: "s7",
      universe: "funnel",
      title: "The zone completion matrix",
      brief:
        "Via-flavored brief on the storefront db: the ops board reads the completion matrix — one row per zone, one arm per request state, all folded in the same pass. Probed cells: EU 24 completed / 12 en-route / 6 waiting / 3 no-shows; APAC 21/8/5/3; US 5/10/3/1; LATAM's 2 completed requests sit below the board's floor and drop. The floor is part of the spec: a zone needs at least 5 completed requests to make the matrix — a boundary the US row sits exactly on, which is why the floor value is a checked cell, not a style choice. Arms must reconcile: completed 52 + en-route 30 + waiting 14 + no-shows 7 = the 103 booked requests, no matter which zones survive the cut.",
      ask: "Return the completion matrix per zone with a completed-count floor of 5, biggest completed count first.",
      template:
        "SELECT c.region AS zone,\n       SUM(CASE WHEN {1} THEN 1 ELSE 0 END) AS completed,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS en_route,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS waiting,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS no_shows\nFROM orders o\nJOIN customers c ON c.id = {2}\nGROUP BY c.region\nHAVING SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) >= {3}\nORDER BY completed {4};",
      slots: [
        {
          answer: "o.status = 'delivered'",
          kind: "keyword",
          label: "the completed arm",
          why: "The completed arm gates on the exact status: 'delivered' catches the 24/21/5 completed requests. status != 'cancelled' would sweep en-route and waiting into 'completed' — EU reads 42 instead of 24 — and the matrix stops measuring completion.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the request-to-rider join key",
          why: "Each request attaches to its zone via the FK: c.id = o.customer_id. c.id = c.id is always true — the join cross-products to 824 / 515 / 206 / 103 and every arm inflates 16-fold, a matrix that reconciles to nothing.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the completed-count floor",
          why: "The spec floor is 5 completed requests — and the US row sits exactly on it (5), so the value appears in the matrix itself. A floor of 6 silently drops the US zone; a floor of 2 re-admits LATAM at 2/0/0/0.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The board reads the load leader first: EU's 24 completed on top. ASC opens on US at 5 — the boundary zone — and the review reads upside down.",
        },
      ],
      distractors: ["o.status != 'cancelled'", "c.id", "COUNT", "6", "2", "ASC"],
      walkthrough:
        "One fold, four arms, one stated floor. The join attaches each of the 103 requests to its zone; the CASE arms count inside the SAME GROUP BY, so every column describes the same population: EU 24/12/6/3, APAC 21/8/5/3, US 5/10/3/1 — and across the whole book the arms reconcile 52 + 30 + 14 + 7 = 103. HAVING judges the fold: the floor of 5 keeps EU and APAC outright and holds US exactly at the boundary — its completed count of 5 is the floor's receipt, printed in the matrix. The distractors each break one contract: the != 'cancelled' arm redefines completed as not-a-no-show (EU 42); the always-true join fans every zone out 16-fold; COUNT inside an arm counts all rows (EU 45) because CASE never returns NULL; a floor of 6 drops the boundary zone the board exists to watch; a floor of 2 re-admits LATAM, whose 2/0/0/0 row the spec excluded; ASC flips the read order. The deeper habit: a pivot's floor is a population decision — state it, and check whether the boundary row is doing definitional work.",
    },
    {
      id: "cs-via-5",
      tier: "medium",
      topic: "x3",
      universe: "month-close",
      title: "The settlement rail stack",
      brief:
        "Via-flavored brief on the storefront db: the month-close opens on the settlement stack — one row per rail, a TOTAL banner underneath, INTEGER cents converted once at the display edge. Probed cells: the {rose:card} rail carries 16 settlements worth 37,364.00, the wire rail 11 worth 32,248.00, and the banner reads 27 settlements worth 69,612.00 — the cross-foot the close reconciles the ledger against. Both folds run over the same payments book in one statement, stacked with UNION ALL; the banner is labeled with a literal so the deck can anchor on it, and the whole stack reads biggest value first — the banner leading, as the close quotes it.",
      ask: "Return the settlement stack: rail, settlement count, settled value in currency (2 decimals), with a TOTAL banner row — biggest value first.",
      template:
        "SELECT p.method AS rail,\n       COUNT(*) AS settlements,\n       ROUND({1}(p.amount_cents) / {2}, 2) AS settled_value\nFROM payments p\nGROUP BY {3}\nUNION ALL\nSELECT {4}, COUNT(*), ROUND(SUM(p.amount_cents) / 100.0, 2) FROM payments p\nORDER BY settled_value {5};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the value fold",
          why: "The close reconciles VALUE: SUM(amount_cents) folds each rail's cents — card 3,736,400 cents prints 37,364.00. COUNT would print the settlement count (16) in the money column and the stack would cross-foot to nothing.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-value divisor",
          why: "The book is INTEGER cents: fold in cents, one /100.0 at the display edge — the .0 forces real division. /1000 shrinks every rail tenfold (3,736) and /10 inflates it (373,640); the banner row keeps its own hardcoded divisor so the cross-foot stays comparable.",
        },
        {
          answer: "p.method",
          kind: "keyword",
          label: "the rail fold",
          why: "GROUP BY p.method folds the 27 settlements into the two rails the close reads — card and wire. Folding by p.invoice_id dissolves the stack into a per-invoice list (22 rows plus banner); folding by a constant collapses everything into one unlabeled rail.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the banner literal",
          why: "The banner row is labeled with the literal 'TOTAL' so the deck can anchor on it — the x3 stack convention. Replacing it with a rail name would print two card rows and the cross-foot reads as a duplicate, not a total.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the banner-first direction",
          why: "The close quotes the stack banner-first: TOTAL 69,612.00 leads, then card 37,364.00, then wire 32,248.00. ASC buries the banner under the wire rail and the reconciliation reads upside down.",
        },
      ],
      distractors: ["COUNT", "1000", "10", "p.invoice_id", "ASC"],
      walkthrough:
        "Two folds, one statement, one banner. The detail fold GROUP BY p.method turns the 27 settlements into two rails: card 16 / 37,364.00, wire 11 / 32,248.00 — INTEGER cents divided by 100.0 exactly once, at the display edge. The banner fold runs over the same book with no GROUP BY: one row, labeled 'TOTAL', 27 / 69,612.00 — and the cross-foot is the close's receipt: 37,364.00 + 32,248.00 = 69,612.00, exactly. UNION ALL appends the banner without deduping; ORDER BY settled_value DESC leads with the banner because the total is the biggest number in the stack. The distractors each break one stage: COUNT in the value fold prints settlement counts in the money column (16 / 11) and the cross-foot dies; the divisor 1000 shrinks every rail tenfold — 3,736 — while the banner keeps its hardcoded 100.0, so the stack no longer reconciles against itself; folding by p.invoice_id returns a 22-row list wearing a 2-rail stack's name; a rail name in the banner literal prints two card rows; ASC sinks the banner. The deeper habit: a stack is honest when its parts cross-foot to its banner — and the audit IS the deliverable.",
    },
    {
      id: "cs-via-6",
      tier: "hard",
      topic: "j6",
      universe: "growth",
      title: "The seat-pair census",
      brief:
        "Via-flavored brief on the storefront db: when the utilization question gets precise, ops counts PAIRS, not legs — a pool with k passenger legs creates k-choose-2 seat-pairs, the co-ride math that says whether the shuttle actually pooled. Probed shape: 77 of the 103 pools carry more than one leg — 23 run four legs (6 pairs each), 25 run three (3 pairs), 29 run two (1 pair) — and the growth board keeps pools at 3 pairs or more, which is 48 pools. The census pairs each pool's legs with a strict a.id < b.id guard so every unordered pair counts exactly once, and the floor is part of the spec: the 3-pair boundary row is a checked cell in the output.",
      ask: "Return every pool with its seat-pair count, keeping pools with at least 3 pairs — biggest pair count first.",
      template:
        "SELECT a.order_id AS pool,\n       COUNT(*) AS seat_pairs\nFROM order_items a\nJOIN order_items b ON b.order_id = {1}\nWHERE a.id < {2}\nGROUP BY a.order_id\nHAVING COUNT(*) >= {3}\nORDER BY seat_pairs {4};",
      slots: [
        {
          answer: "a.order_id",
          kind: "keyword",
          label: "the within-pool join key",
          why: "Pairs form INSIDE a pool: b.order_id = a.order_id matches each leg against its pool-mates. Joining on a.id pairs legs across DIFFERENT pools by row-id collision — a phantom 32-row census with pair counts that mean nothing.",
        },
        {
          answer: "b.id",
          kind: "keyword",
          label: "the once-only pair guard",
          why: "a.id < b.id keeps each unordered pair exactly once — no self-pairs, no mirrors. a.id < a.id is false for every row and empties the census; comparing against b.order_id matches a row id to a foreign key and collapses the census to nothing on this book.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the pair floor",
          why: "The board keeps pools at 3+ pairs — and the boundary is real: 25 pools sit exactly at 3 pairs, so the floor value appears in the census itself. A floor of 4 keeps only the 23 six-pair pools; a floor of 1 re-admits the 29 one-pair pools.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the fullest-pool-first direction",
          why: "The board reads the tightest pools first: the 23 pools at 6 pairs on top, then the 3-pair boundary band. ASC opens on the boundary band and the utilization story reads inverted.",
        },
      ],
      distractors: ["a.id", "b.order_id", "1", "4", "ASC"],
      walkthrough:
        "Self-join, guard, floor — the pooling-math census. The self-join matches every leg against its pool-mates (b.order_id = a.order_id); the strict guard a.id < b.id keeps each unordered pair once, so a pool with k legs folds to k-choose-2: four legs give 6 pairs, three give 3, two give 1 — the probed histogram is 23 / 25 / 29 pools across those bands, 77 pooling pools of 103. HAVING applies the board's floor: 3+ pairs keeps 48 pools, and the boundary is printed in the output — the 25 pools sitting exactly at 3 pairs. The distractors each break one stage: joining on a.id invents cross-pool pairs by row-id collision (a 32-row census whose counts mean nothing); guarding with a.id empties everything (a row can't be less than itself); guarding with b.order_id compares a row id to a foreign key and collapses to empty; a floor of 4 drops the 3-pair band the board exists to watch; a floor of 1 re-admits the one-pair pools — taxis, not shuttles; ASC flips the read. The deeper habit: pair math is where the pooling story is proved or refuted — and the guard, not the join, is where it's kept honest.",
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
    { slug: "combine-two-tables", why: "The rider-profile LEFT JOIN warm-up: requests that keep their rider row even when a profile field is missing — the join shape behind every zone-with-nulls read." },
    { slug: "top-travellers", why: "Fare folded per rider with ORDER BY at the edge — the leaderboard spine the utilization board ranks zones and riders on." },
    { slug: "average-selling-price", why: "A folded price-per-unit across a join with the NULL-safe division handled — fare-per-seat economics on the pooling ledger." },
    { slug: "sales-analysis-ii", why: "Buyers versus never-buyers as an anti-join — pool-eligibility reads where the zero is proved, not assumed (this book's verified zero: no never-ordered riders)." },
    { slug: "employees-with-missing-information", why: "A two-sided missing-data sweep — which side of the join is NULL tells you whether the profile or the ping is missing; the data-quality triage Via runs before any lag average." },
    { slug: "product-price-at-a-given-date", why: "The as-of read: which fare applied when the request landed — window logic over a price history, the honest way to reprice a historical pool." },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER dedupe keeping the latest re-issued request — the idempotency pass that stops double-booked pools from double-counting in the census." },
    { slug: "report-contiguous-dates", why: "Gaps-and-islands over service days — which stretches did a corridor run dark, folded into start/end spans instead of a list of absences." },
    { slug: "budget-pacing", why: "Running-sum first-breach detection — seat-budget pacing across the month spine, the earliest-warning read the ops review gets." },
    { slug: "duplicate-charge-pairs", why: "Self-join window pairs on near-identical settlements — duplicate-bill detection on the municipal book, the reconciliation desk's second pair of eyes." },
    { slug: "biggest-window-between-events", why: "LEAD-based gap math between a rider's requests — the headway read that separates heavy regulars from one-time riders." },
    { slug: "dau-wau-stickiness", why: "Trailing-window active reads — weekly pooling stickiness per corridor, the growth board's engagement clock on a transit curve." },
    { slug: "rolling-7d-actives", why: "Rolling distinct riders per corridor over a sliding window — demand breadth without double-counting the daily commuter." },
    { slug: "count-salary-categories", why: "UNION ALL zero-buckets — the band census that keeps the empty premium band visible at the 199.99 ceiling instead of letting it vanish." },
    { slug: "funnel-step-conversion", why: "Funnel pivots with FIRST_VALUE — request to pool to completion as ordered stages, the step-rate read behind the 52-of-103 completion story." },
    { slug: "null-blank-audit", why: "A null/blank audit across the request book — the data-quality gate every Via fold runs before its arms are allowed to reconcile." },
  ],
};
