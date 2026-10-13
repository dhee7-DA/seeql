// DiDi — kit 6 of the Ride-hailing & Mobility domain (Batch D, 91-d-mobility).
// Asia-LatAm ride-hailing at mega scale: trips, driver utilization and the
// safety-flag ops floor that never sleeps. Pool provenance: 0 tagged LC —
// theme-curated. Every problem and topic slug is drawn from the Theme menu
// in scripts/company-pools.md (sql rows), picked to mirror DiDi's known
// screen themes: two-sided trip censuses, driver-side folds, suspension and
// safety-flag ops, honest denominators, rolling windows, timestamp hygiene.
// Case studies run on the storefront db (db/custom.db) with probed figures
// from scripts/company-facts.md, mapped honestly: orders = trip requests,
// customers = driver-partners, products = service tiers, suppliers = fleet
// partners, order_items = fare lines, shipped_at = trip completion
// timestamp; invoices/payments/expenses/ledger are the driver-settlement
// and fleet-cost books and are INTEGER cents (divide by 100.0).

// Expansion (Task 92-d-didi, append-only): brief 6, dayInLife 5, metrics 12,
// topics 15, theory 24 (didi-t9..t24), mcqs 30 (didi-mcq-11..30), cases 6
// (cs-didi-3..6 on t3 / s6 / j4 / q2 families), problems 32. New slugs are
// theme-curated from the same Theme menu; the 4 new cases were probed and
// verified against db/custom.db via scripts/case-audit.ts (ALL PASS gate).

import type { CompanyKit } from "../types";

export const didiKit: CompanyKit = {
  id: "didi",
  domainId: "mobility",
  name: "DiDi",
  tagline: "Asia-LatAm ride-hailing: trips, drivers, safety ops",
  accent: "text-amber-200",

  brief: [
    "DiDi is the ride-hailing giant of Asia and Latin America — the company that out-scaled Uber in China, absorbed Uber's China business, and now moves hundreds of millions of riders across didichuxing services from Express to Premier to Bus, plus Latin American operations where city-by-city share battles are won on supply. The core object is the same as any mobility marketplace: a trip request that is matched to a driver-partner, priced, {emerald:completed} or {rose:cancelled}, and timestamped at every hop. What makes DiDi DiDi is the safety layer: every trip carries safety flags, in-app audio records, and a {amber:24/7 safety-ops} floor whose analysts write SQL at 3am about trips that never reached a completion timestamp. On this kit's proxy ledger that reality shows up as 103 trip requests of which only 82 carry a completion timestamp — 14 {sky:pending}, 7 {rose:cancelled} — and completion rate is completed ÷ REQUESTED, never completed ÷ completed.",
    "The data org is built around the two-sided clock: driver-side teams (utilization, earnings, churn) and rider-side teams (demand, ETA, completion) read the same trip event streams but from opposite ends. Fleet partners supply vehicles and settle through an invoicing book where every settlement row is INTEGER cents — `SUM(amount_cents) / 100.0`, not `/100`, or the cents vanish to integer-division truncation. The rhythm is city-shaped and shift-shaped: morning is the completion-and-supply map, midday is driver-utilization deep dives (trips per active driver, online hours versus trip-bearing hours), and the safety floor's {rose:cancelled}-flag triage runs around the clock because a cancelled trip at 2am in the rain is a brand event, not a row.",
    "Interviews are marketplace-flavored and denominator-obsessed, with a safety-ops accent. A screen opens with a warm-up join (attach driver-partners to their trips), escalates into a conditional aggregation with a status rule ({emerald:completion} share by region, {rose:cancellation} share by hour), then a window question (rank cities by weekly trips, LAG the week-over-week cancellation drift) or a rate question where the entire test is whether your `WHERE` clause silently shrank the denominator. Follow-ups are spoken aloud: 'does a pending request count in your denominator?', 'per trip or per driver?', 'what happened to the 21 requests with no completion timestamp?'. Candidates who narrate grain and population before writing SQL are the ones who advance.",
    "Preparation strategy: this kit is **theme-curated** from the SQL band — {sky:0 tagged LC} rows exist for DiDi, so the 16 problems and 30 topic slugs were hand-picked from the theme menu to mirror its screens: two-sided trip censuses, driver-side folds, suspension and safety-flag ops, rolling windows, timestamp hygiene. The two case studies run on the live storefront db: one rebuilds the driver-utilization leaderboard fleet ops opens with, the other rebuilds the one-pass safety triage census the {amber:safety floor} runs every shift. Both are mechanically audited against probed db figures — 103 requests, 82 completed, 14 pending, 7 {rose:cancelled}, latency averaging 2.98 days across a 2-to-4-day window.",
    "DiDi's surface is multi-product — {sky:Express}, {amber:Premier}, DiDi Bus, Food, autonomous pilots — but the event spine underneath is one trip ledger, which is why the proxy ledger here carries 251 fare lines against 103 requests and sixteen service tiers instead of one product table. Tier reads are band reads: the catalog splits 8 budget tiers under 50 and 8 mid tiers up to 199.99, and the {rose:premium} band at 200-plus is EMPTY — a premium census returns zero groups, and the honest move is showing the hole with `MAX(price)` beside it, not padding the report. Interviewers love that exact corner: 'your band query returned nothing — empty band or broken filter?' The only passing answer shows the boundary evidence and lets the data plead its case.",
    "Under the trips sits the money, and the money is disciplined: fleet-partner settlements run through an invoice book of **28 settlement lines** — 21 paid, 6 open, 1 void — cleared by 27 payment rows (16 card, 11 wire) and closed against a ledger that ties at 181,080 cents on both sides, delta zero. Every figure in that book is an INTEGER-cent column, so every read is `SUM(amount_cents) / 100.0`, and the month-close sweep is a reconciliation sweep: one partial settlement (4,000 of 6,148 on line 25), one status-paid line with zero payment rows, one void line that accepted money. Screens increasingly end there — *not* 'write a join' but 'prove the books agree' — and the candidates who advance treat reconciliation as a query shape with a denominator, not a chore.",
  ],

  dayInLife: [
    "**07:30 —** The shift opens on the ops board: overnight requests versus completions, {sky:completion share} by region, the {rose:cancellation} heatmap by hour. First query of the day is a reconciliation — request counts from the matching service versus trip-ledger rows, fare-line sums versus trip totals — because a supply-demand diff that doesn't tie is a bug before it's a trend. The morning deliverable is the region map: one row per region, requests, completed, completion share, **worst region on top**, because the intervention targets one region. The analyst who can write the two-sided diff in one pass is the one the city lead pings first.",
    "**11:00 —** Midday belongs to the driver side. Utilization deep-dives: trips per active driver by city, online hours versus trip-bearing hours, earnings percentiles per driver-partner — every read at **driver grain, not trip grain**, and the moment fare lines join in, `COUNT(DISTINCT trip_id)` is the only honest trip counter because the join fans 103 trips out to 251 fare lines. A fleet-partner settlement review needs the cents discipline out loud: `amount_cents` is an INTEGER, so the query divides by 100.0 *after* the SUM, and the analyst says so before anyone asks. The safety floor pings mid-block: a cluster of {rose:cancelled} trips in one city needs a one-pass CASE census — not four queries — before the regional call.",
    "**15:00 —** The afternoon is stakeholder cycles. The regional review wants city leaderboards that tie honestly (two cities at the same trip count share a rung — DENSE_RANK, not RANK, or a phantom gap invents a city that doesn't exist); the driver-earnings team wants per-driver aggregates with the population stated ('active drivers only — signed-up-and-never-drove is a different census, and here that anti-join returns zero rows'); growth wants rolling 7-day actives where one rider's ten trips count once. Every deliverable ships with its definition printed beside the number — *completion rate = completed ÷ requested, pending stays in the denominator* — because a rate without its denominator is a rumor.",
    "**18:00 —** The day closes in review mode with the safety handoff. The triage census goes to the night shift: requests, {emerald:completed}, {sky:pending}, {rose:cancelled}, and the open backlog of trips with no completion timestamp — 21 rows on the proxy ledger, each one a story the floor may have to call about. The post-mortem culture treats a metric whose definition drifted mid-spike as an incident, not a footnote, and the writeup ships with every rate's denominator attached, because *DiDi SQL exists to keep two sides, one clock and one safety floor honest in the same query.*",
    "**21:30 —** Beijing is signing off but São Paulo is hitting its evening peak, and the LatAm board is the analyst's last window: requests against the {rose:cancellation} heatmap, completion share holding, and the LATAM column read with its sample size attached — 2 completed trips is a signal to watch, not a trend to declare. The overnight batch gets its final check before handoff: settlement lines due tomorrow (`due_on` against today's date), the 6-line unpaid queue worth 15,217 after the cents conversion, and the ledger tie-out that must still read delta zero after the day's postings. The shift ends the way shifts here end — *every rate shipped with its denominator, every empty band left visibly empty* — because the morning analyst inherits exactly what tonight's leaves behind.",
  ],

  metrics: [
    { name: "Trips completed", what: "Trip requests that reached a completion timestamp. On this kit's proxy ledger, 82 of 103 requests carry one (52 delivered-status + 30 shipped-status) — the count everything else hangs on, and the other 21 are the pending-plus-cancelled gap the safety floor watches." },
    { name: "Completion rate", what: "Completed trips ÷ REQUESTED trips. The marketplace health number: the denominator is all requests, {rose:cancelled} and {sky:pending} included, and the interviewer checks whether your WHERE clause shrank it." },
    { name: "Cancellation share", what: "Cancelled requests ÷ requested, by region and hour. Probed on this db: APAC 3 of 37 (8.1%) is the worst region, against EU 6.7%, US 5.3%, LATAM 0% — a conditional-count ratio with the denominator fixed before the ratio." },
    { name: "Driver utilization", what: "Trip-bearing hours ÷ hours online per driver-partner. A two-grain ratio — trips and people — where COUNT(*) versus COUNT(DISTINCT driver_id) is the entire difference between a rate and a nonsense number." },
    { name: "Trips per active driver", what: "Trips folded per DISTINCT driver over a window. The supply-efficiency read fleet ops uses to argue for supply: the denominator is drivers who worked, never drivers who signed up." },
    { name: "Driver earnings distribution", what: "Fare sums folded per driver-partner with percentiles. The earnings-equity read DiDi's driver side lives by — and the fold where the join to fare lines silently changes the grain from drivers to fare lines." },
    { name: "Safety-flag backlog", what: "Open trips with no completion timestamp ({sky:pending} + {rose:cancelled}), triaged per shift. The safety-ops census: 14 + 7 = 21 rows on the proxy ledger, each a possible call, refund or escalation." },
    { name: "Settlement latency", what: "Request-to-completion lag on completed trips only: avg 2.98 days on the proxy ledger, range 2..4, by region LATAM 3.50 worst down to APAC 2.93. The population statement — completed trips only — IS the metric." },
    { name: "Fleet-partner concentration", what: "Share of completed fare value folded per fleet partner. The proxy ledger's top two — Nordic Gadgets AB at 32% and Midwest Hardware Co at 26.7% — clear more than half the book between them, which is supply-team shorthand for leverage, and leverage is a risk metric before it is a commercial one." },
    { name: "Fare-line depth", what: "Fare lines folded against trip requests: 251 lines over 103 requests on the proxy ledger. The attach read — how many line items a request carries — and the grain trap in one metric: once fare lines join, COUNT(DISTINCT order_id) is the only honest trip counter, because COUNT(*) has started counting lines." },
    { name: "Open settlement backlog", what: "Settlement lines with zero payment activity: the payments anti-join returns 6 lines worth 15,217 after the /100.0 conversion — and one of them is status-paid, which is precisely the kind of row the month-close reconciliation exists to catch. Worst amount first, cleared before the books tie." },
    { name: "Ledger tie-out", what: "The close's integrity gate: SUM of debits versus credits across all 80 ledger entries — 181,080 cents on both sides, delta 0. A non-zero delta stops the close cold; proving the tie is the last query of the month and the first number the finance lead reads." },
  ],

  topics: [
    {
      name: "Trip-grain aggregation",
      why: "Everything at DiDi starts by folding trip requests into per-region, per-city, per-tier aggregates without letting cancelled demand pollute the total. The trap is grain drift: joining fare lines fans 103 trips out to 251 rows, and COUNT(*) stops counting trips the moment the join lands.",
      slugs: ["product-sales-analysis-ii", "percentage-of-users-attended-a-contest", "unique-orders-and-customers-per-month"],
    },
    {
      name: "Completion & cancellation rates",
      why: "Completion rate is completed ÷ REQUESTED — the denominator is the whole test, and the 100.0-before-division habit keeps the share honest. Trips-and-users is the canonical ride-hailing screen: cancellation share by city with exclusions, where one careless filter moves the denominator.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "immediate-food-delivery-ii"],
    },
    {
      name: "Driver-side utilization folds",
      why: "DiDi's edge is driver economics: trips per active driver, online versus trip-bearing hours, shift overlap. Server-utilization-time is the utilization fold in its purest form, and overlapping-shifts is the paired-interval shape shift analytics runs on.",
      slugs: ["server-utilization-time", "find-overlapping-shifts", "average-time-of-process-per-machine"],
    },
    {
      name: "Trip-fate CASE logic",
      why: "Requested, completed, pending, cancelled — trip fate is a CASE branch inside a SUM, not four queries. Conditional counting over a 1/0 flag folds completion and cancellation shares at the same grain as COUNT(*), and the ELSE arm's width is the audit.",
      slugs: ["immediate-food-delivery-i", "capital-gain-loss", "count-salary-categories"],
    },
    {
      name: "Safety flags & suspensions",
      why: "The safety floor lives on flag censuses and suspension windows: which accounts got banned, for how long, and which flagged trips overlapped a suspension. Leetflex-banned-accounts is the interval-overlap shape of an enforcement check; reported-posts is the flag-triage warm-up.",
      slugs: ["leetflex-banned-accounts", "reported-posts", "find-churn-risk-customers"],
    },
    {
      name: "Leaderboards & rank ties",
      why: "City leaderboards, top tiers by trips, most recent trips per driver — ranking windows where ties are the rule, not the exception. RANK versus DENSE_RANK is a business decision about who shares a rung, and the-most-recent-three-orders is the per-entity top-N shape.",
      slugs: ["rank-scores", "the-most-recent-three-orders", "top-travellers"],
    },
    {
      name: "Demand bursts & velocity",
      why: "Ride demand arrives in bursts — rush hours, rain, concert letouts — and ops reads burstiness as velocity inside tight intervals. Transaction-velocity and find-bursty-behavior drill burst detection; calculate-orders-within-each-interval is the fixed-window count ops charts hourly.",
      slugs: ["find-bursty-behavior", "transaction-velocity", "calculate-orders-within-each-interval"],
    },
    {
      name: "Rolling windows & stickiness",
      why: "Growth reads here are trailing-window reads: rolling 7-day actives, DAU/WAU stickiness, running sums across the 2024-01..2025-02 span. COUNT(DISTINCT) inside a window frame and one-rider-counts-once is the muscle these three drill.",
      slugs: ["rolling-7d-actives", "dau-wau-stickiness", "game-play-analysis-iii"],
    },
    {
      name: "Timestamp hygiene: NULL policy & dedupe",
      why: "Completion timestamps are NULL until the trip ends — 21 of 103 rows on the proxy ledger — and trip events retry. A stated NULL policy (report, coalesce, or exclude with a reason) plus keep-latest dedupe with a deterministic tie-break is the data-quality layer every dashboard stands on.",
      slugs: ["keep-latest-dedupe", "null-blank-audit", "the-latest-login-in-2020"],
    },
    {
      name: "Escalation shapes: subqueries & set ops",
      why: "Screens close with composed asks: above-average reads via scalar subqueries, CASE branches that classify, set-op stacks that stitch two populations into one report. The escalation is composition — two grains in one query, no panic.",
      slugs: ["second-highest-salary", "weather-type-in-each-country", "team-scores-in-football-tournament"],
    },
    {
      name: "Fare-line fan-out & product mix",
      why: "The trip-to-fare-line join is where trip grain dies: 103 requests become 251 lines the moment order_items lands, and every product-mix read (which tiers ride along, which regions attach what) is built on that join. Product Sales Analysis III drills the per-period product fold; Products Worth Over Invoices drills folding value through a join without losing the grain.",
      slugs: ["product-sales-analysis-iii", "products-worth-over-invoices", "most-frequently-ordered-product-per-customer"],
    },
    {
      name: "Supply-spine LEFT JOINs",
      why: "Demand reads join from trips outward; supply reads join from the driver spine inward with LEFT JOIN — and the unmatched rows ARE the story (partners with zero completed trips this week). On this proxy ledger every partner has driven, so the anti-join returns zero rows — which is itself the lesson: the shape must be right even when the data doesn't reward it.",
      slugs: ["combine-two-tables", "count-student-number-in-departments", "employees-with-missing-information"],
    },
    {
      name: "Set-op report stitching",
      why: "Ops reviews want one report with two populations — completed trips stacked beside the open backlog, this month beside last — and set ops are the stitch. UNION ALL preserves both copies where UNION silently dedupes whole rows; Monthly Transactions II and Count Apples and Oranges drill the stack-and-label discipline, League Statistics the per-side folds that must line up column for column.",
      slugs: ["monthly-transactions-ii", "count-apples-and-oranges", "league-statistics"],
    },
    {
      name: "Calendar slices & weekday demand",
      why: "Demand has a weekly heartbeat — weekday commutes, weekend leisure — and ops slices it with date filters and weekday buckets over the 2024-01..2025-02 span. User Activity for the Past 30 Days I drills the trailing-window filter, Tasks Count in the Weekend the weekday slice, Convert Date Format the presentation edge where timestamps become report labels.",
      slugs: ["user-activity-for-the-past-30-days-i", "tasks-count-in-the-weekend", "convert-date-format"],
    },
    {
      name: "Latest-state & argmax reads",
      why: "Half of ops is 'what is the current state' — the latest fare line per tier, the most recent request per driver, the last activity per account — and the latest-row fold is a keep-latest pattern with the tie-break discipline the event stream demands. The Most Recent Orders for Each Product is the per-entity argmax shape; Find Latest Salaries and Bikes Last Time Used are the dedupe-and-max warm-ups.",
      slugs: ["the-most-recent-orders-for-each-product", "find-latest-salaries", "bikes-last-time-used"],
    },
  ],

  theory: [
    {
      id: "didi-t1",
      q: "Trips attach to driver-partners on one key and to fleet partners through a two-hop chain. When do you insist on a LEFT JOIN in a mobility read, and what does an INNER join silently drop?",
      a: "The join follows the spine of the question. If the question is trip-shaped — completion share, fare mix, trip latency — the trip table is the spine and INNER joins that attach driver and tier attributes are right, because every unmatched row would distort a rate built on trip counts. If the question is supply-shaped — which driver-partners signed up but never took a trip this week — the driver table is the spine and LEFT JOIN + IS NULL is the only honest shape: INNER would drop exactly the partners you're hunting for. The marketplace-specific discipline is doing both directions deliberately: demand reads join from trips outward, supply reads join from supply inward, and 'which side is the spine' is a sentence you say out loud before the FROM clause. One honest caveat from this kit's proxy ledger: every request resolves to a driver and every fare line to a tier, so INNER and LEFT coincide — which is exactly why the interviewer asks you to reason about the shape instead of trusting the data to save you.",
      tag: "joins",
    },
    {
      id: "didi-t2",
      q: "Rank cities by weekly trips. Where do RANK, DENSE_RANK and ROW_NUMBER disagree, and which one do you hand the ops floor?",
      a: "They disagree exactly where trips tie. RANK gives both tied cities the same rung and skips the next (1, 2, 2, 4) — the gap implies a missing city that doesn't exist. DENSE_RANK gives the tie the same rung and keeps the sequence compact (1, 2, 2, 3). ROW_NUMBER splits the tie arbitrarily (1, 2, 3, 4) unless you add a deterministic tie-breaker like city_id, which makes it the dedupe tool, not the leaderboard tool. The ops floor gets DENSE_RANK: city rankings are read as 'who's nth', and a skipped rung generates a meeting about a city that was never there. The LIMIT-1-OFFSET-1 'second place' habit breaks on every tie — the honest second place is DENSE_RANK = 2, and if two cities share it the decision is 'both', not 'whichever the engine sorted first'. At DiDi this matters because weekly trip counts tie constantly at city grain, and the rank trio is a business decision about who shares a rung, not syntax trivia.",
      tag: "windows",
    },
    {
      id: "didi-t3",
      q: "On a trips table — 103 requests, 82 with a completion timestamp, 16 driver-partners — narrate what COUNT(*), COUNT(completion_ts) and COUNT(DISTINCT driver_id) each return.",
      a: "Three numbers, three grains, all true at once. COUNT(*) is 103 — every request row, the denominator grain of completion rate. COUNT(completion_ts) is 82 — the completed subset, because COUNT skips NULLs; that column is the numerator grain, and the gap between 103 and 82 IS the unfulfilled-plus-cancelled picture (14 pending, 7 cancelled on the proxy ledger). COUNT(DISTINCT driver_id) is 16 — repeat trips folded back to people, the supply grain. The mobility trap is reporting one grain under another's name: 'trips per driver' computed as COUNT(*)/COUNT(DISTINCT driver_id) is fine, but 'completion rate per driver' as COUNT(completion_ts)/COUNT(DISTINCT driver_id) mixes numerator and audience grains and produces a number above 100% the moment a driver takes three trips. The strong answer assigns a grain to each form out loud — rows, non-null rows, distinct entities — and refuses to let them blur. That two-grain habit is the single most-drilled reflex in this kit.",
      tag: "aggregation",
    },
    {
      id: "didi-t4",
      q: "Completion timestamps are NULL until a trip ends — 21 of 103 requests here. What is your NULL policy when a stakeholder wants 'average time to completion'?",
      a: "The policy is: state the population before the average, then compute only on it. Trips without a completion timestamp have no latency YET — they are not zero-latency, they are out of scope, and the difference between those two sentences is the difference between a definition and a silent filter. Mechanically: AVG(julianday(completed_ts) - julianday(requested_ts)) skips NULLs by design, so the guard `WHERE completed_ts IS NOT NULL` is documentation, not math — but you write it anyway, because the reviewer needs to see the population was chosen on purpose. What you never do is COALESCE the NULL to zero or to 'today' — that launders uncompleted trips into the average and manufactures latency that never happened. The report carries three numbers: the 82-trip average, the 2.98-day figure with its 2-to-4 range, and the 21-row backlog the safety floor is working. Hiding the backlog inside a rounder average is how a safety story gets buried.",
      tag: "nulls",
    },
    {
      id: "didi-t5",
      q: "A junior writes WHERE status = 'completed' and then computes cancellation share from the surviving rows. Walk through what pipeline order did to their denominator.",
      a: "Logical pipeline order is FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT, and WHERE runs before aggregation — so filtering to completed rows first leaves a denominator of completed trips only, and every region's cancellation share reads 0% or NULL. The share's denominator must be ALL requests in the group, which means the cancelled rows must ride inside the aggregation, not outside it: SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) over COUNT(*), with no status filter in WHERE at all. The rule of thumb: filters on the metric's own population go in WHERE; filters that would shrink a rate's denominator go inside the CASE. HAVING is for the fold's output (groups), WHERE is for rows, and mixing them is how a dashboard reports a 100% completion rate the week the marketplace actually broke. On the proxy ledger the tell is instant — a cancellation share table with no region showing the real 8.1% APAC worst-case is a pipeline-order bug, not a demand miracle.",
      tag: "pipeline",
    },
    {
      id: "didi-t6",
      q: "When does a scalar subquery beat a JOIN for a driver-utilization read, and what's the cost?",
      a: "A scalar subquery wins when the comparison is against a single computed value: 'driver-partners whose completed trips exceed the fleet average' is WHERE completed > (SELECT AVG(...) FROM trips) — one number, computed once, no fan-out, and the outer query stays a clean per-driver fold. A JOIN wins when you need the compared value as a column per row (a driver's trips beside the city average beside the fleet average), or when the inner side must be grouped per entity — that's a derived table or CTE, not a correlated scalar. The cost of the correlated shape is real: it re-runs per outer row, and on a trip table that's re-aggregating the whole fleet per driver. The mobility-flavored rule: scalar for threshold reads, derived/CTE for per-entity comparisons, and never a subquery in SELECT when a window over a partition computes the same thing in one pass. Interviewers here probe whether you know the shapes exist, not whether you can recite a hash-join diagram.",
      tag: "subqueries",
    },
    {
      id: "didi-t7",
      q: "Your trip ledger stores text timestamps. How do you bucket rides by month and compute time-to-completion without quietly breaking?",
      a: "Text timestamps in ISO shape sort correctly and slice cleanly, but every arithmetic read must make them numeric first. Month buckets: SUBSTR(created_at, 1, 7) for quick grouping or STRFTIME('%Y-%m', created_at) when you want the intent explicit — on the proxy ledger the span runs 2024-01 through 2025-02, fourteen buckets. Latency: JULIANDAY(completed_ts) - JULIANDAY(requested_ts) converts both to fractional days, and the average lands at 2.98 with a 2-to-4 range — compute the delta per row, THEN average, never average the texts. The traps: DATEDIFF is a MySQL reflex that doesn't exist in SQLite; STRFTIME('%Y') alone collapses fourteen months into two years and flattens the trend; and mixing created-month with completed-month in the same fold double-counts the boundary months. The strong answer names the function per operation — bucket with STRFTIME, subtract with JULIANDAY, round at the display edge with ROUND(x, 2) — and states which timestamp anchors the bucket, because request-month and completion-month tell different stories.",
      tag: "dates",
    },
    {
      id: "didi-t8",
      q: "A city lead says 'the dashboard completion rate jumped 9 points overnight' but the safety floor reports no incident. What data-quality checks do you run first?",
      a: "Three checks, in order of how often they're guilty. First, population drift: did the WHERE clause or a deploy change the denominator — did {rose:cancelled} requests silently leave the fold, or did a status rename ('shipped' meaning 'trip ended') start counting as completed? Compare COUNT(*) versus the status census before and after; on a healthy ledger the status mix (52/30/14/7 on the proxy data) moves gradually, not overnight. Second, duplication: retried trip events double-fire, so a keep-latest dedupe with a deterministic tie-break per trip id — ROW_NUMBER() OVER (PARTITION BY trip_id ORDER BY event_ts DESC) — tells you if the numerator grew by phantom rows. Third, freshness: is the completion-timestamp feed partial (a lagging pipeline makes yesterday look empty and today look perfect)? The DiDi twist: never adjudicate a completion-rate jump without the safety floor in the room — a real spike is their incident, and a data bug that masquerades as one costs the floor a night of sleep it can't get back.",
      tag: "quality",
    },
    {
      id: "didi-t9",
      q: "You're asked for a rolling 7-day completed-trips curve. Write the window — and explain what the engine would have done if you'd skipped the frame clause.",
      a: "SUM(completed) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) — seven rows including today, per city once PARTITION BY city is added. Skip the frame clause and the engine silently substitutes RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW: with ORDER BY on day, RANGE treats ordering peers as one unit, so any day tied with another jumps the running sum by the whole peer group at once — and if you'd also skipped ORDER BY, the frame becomes the entire partition and every row carries the grand total. The rolling-7 read needs ROWS precisely because demand ties (two days at the same count are common at city grain) and because a 7-day window is a row-count contract, not a value contract. Say the frame out loud in the interview: the default frame is a semantics decision the engine made for you, and it's wrong for rolling metrics.",
      tag: "windows",
    },
    {
      id: "didi-t10",
      q: "The ops review wants completed trips and the open backlog stitched into one report. UNION or UNION ALL — and what breaks if you pick wrong?",
      a: "UNION ALL, unless dedupe is the explicit requirement. UNION sorts and hashes the combined rows to collapse duplicates — slower, and worse: it silently merges two DIFFERENT reports that happen to carry identical rows, so a region line in the completed census that mirrors one in the backlog census disappears without a trace. UNION ALL just concatenates, which is what a stitched report wants: two populations, clearly labeled with a literal column ('completed' / 'backlog'), column shapes matching position for position. The contract is the real trap: both SELECTs must agree on column count and compatible types or the stitch errors — and if you ORDER BY, it orders the combined result, so the label column goes first. EXCEPT and INTERSECT are the other two moves: completed EXCEPT flagged answers 'completed trips with no open flag', and direction matters — reversed, it's a different question about the backlog instead.",
      tag: "set-ops",
    },
    {
      id: "didi-t11",
      q: "Which driver-partners have no completed trips this week? Walk through the three shapes — NOT IN, LEFT JOIN IS NULL, NOT EXISTS — and their failure modes.",
      a: "NOT IN is the booby trap: if the inner list contains a single NULL (a trip with a NULL driver_id from a feed glitch), every comparison becomes unknown and the query returns zero rows — the silent-empty failure, the worst kind, because the dashboard ships with a blank where a list should be. LEFT JOIN + IS NULL is the classic anti-join: keep every driver, keep the ones whose trip columns all came back NULL, and it survives NULLs on the inner side. NOT EXISTS is the shape I'd ship: correlated, stops at the first match, reads like the question ('no completed trip exists for this driver'), and handles NULLs the same way the LEFT JOIN does. On this proxy ledger the anti-join returns zero rows — every partner has completed work — so a candidate who writes NOT IN and sees an empty result can't tell whether the answer is genuinely empty or their query is broken; that ambiguity is exactly why the shape choice is an interview question and not a style preference.",
      tag: "subqueries",
    },
    {
      id: "didi-t12",
      q: "When do you stage a CTE instead of a derived table, and when is the CTE pure ceremony?",
      a: "A derived table earns its keep when the staging is used once and the query stays under a screenful — per-tier fare folds ranked in one pass, no name needed. A CTE earns its keep three ways: when the staged fold is referenced more than once (a fare-mix fold that feeds both a rank and a share column — recompute it twice with nested derived tables and you've paid twice and drift is one typo away), when the name carries the business meaning ('with active_drivers as (...)' documents the population the same way a WHERE guard does), and when you're chaining stages in a pipeline where each step is a review unit. The ceremony case: a single-use CTE wrapping a one-line SELECT adds a keyword and a comma and nothing else. A recursive CTE is a different tool entirely — for walking hierarchies or generating calendar spines, not for styling. SQLite evaluates non-recursive CTEs inline, so there's no materialization tax to weigh: the choice is readability and reuse, and you say so.",
      tag: "subqueries",
    },
    {
      id: "didi-t13",
      q: "A dashboard shows completion rate as 100.0 * SUM(flag) / COUNT(*) but one region shows NULL. The stakeholder wants a number. What's your policy?",
      a: "First, diagnose the NULL's origin, because there are two. With GROUP BY, a region with zero requests produces no group at all — it vanishes from the fold; and a manufactured row (LEFT JOIN from a region spine) folds to COUNT(*) = 0 with SUM(flag) = NULL, and NULL divided by anything stays NULL — SQLite returns NULL for x/0 rather than erroring, so the hole arrives silently. That NULL is information, not dirt: it says 'no completed trips here yet', and COALESCE-ing it to zero mid-pipeline launders 'no data' into 'a perfect or a catastrophic rate' depending on which lie you picked. The policy: keep NULL through the pipeline, guard the display edge — COALESCE(rate, 'no requests yet') or NULLIF on the denominator if you want the hole explicit — and put the population in the footnote. The one thing you never do is let the display layer pick a default quietly, because a launch region showing 0% completion reads as a data bug in the ops review and burns an hour of the floor's night.",
      tag: "nulls",
    },
    {
      id: "didi-t14",
      q: "Your settlement book is INTEGER cents. Where exactly does the /100.0 go, and what breaks when it's in the wrong place?",
      a: "At the display edge — once, after every fold is complete. SUM(amount_cents) folds in cents exactly, because integers don't accumulate floating-point drift; the conversion is ROUND(SUM(amount_cents) / 100.0, 2). Put the division inside the fold — SUM(amount_cents / 100) — and integer division truncates every row before the sum: a driver whose payments are 12,345 and 6,789 cents shows 181 instead of 191.34, and the error compounds per row. Average the same way: AVG(amount_cents) then divide, never AVG(amount_cents / 100), which averages truncated values and reports a mean of lies. The exception that proves the rule is a per-row display column — amount as dollars on each line — where the /100.0 legitimately rides in SELECT. The discipline to narrate in an interview: integers are the ledger's native language, conversion is a presentation concern, and the .0 is not decoration — it's the difference between real and integer division.",
      tag: "types",
    },
    {
      id: "didi-t15",
      q: "Week-over-week cancellation drift per city via LAG — what does the first week's row look like, and what do you do with it?",
      a: "NULL, and that's correct: LAG(cancelled, 1) OVER (PARTITION BY city ORDER BY week) has no previous row for the first week of every city, so the drift column cancelled - LAG(cancelled) is NULL there — and NULL propagates, which is the honest representation of 'no prior week to differ from'. The trap is COALESCE-ing that NULL to zero: a city that cancelled 5 in its first recorded week now shows drift 5 - 0 = 5, manufacturing an incident out of the beginning of the calendar. Partition resets matter equally — without PARTITION BY city, LAG walks straight across the city boundary and week one of the second city diffs against the last week of the first, a bug that survives visual inspection of a sorted table. Report the first week as NULL and say why, or exclude it with a stated population note; at DiDi the weekly drift read is the Monday-morning safety artifact, and a phantom spike on week one costs the floor a meeting it didn't need.",
      tag: "windows",
    },
    {
      id: "didi-t16",
      q: "A region cell in the dashboard lists the tiers that drove its fares. How do you fold a list into one cell — and when is GROUP_CONCAT the wrong tool?",
      a: "GROUP_CONCAT over the per-region fold, ordered deliberately — an ORDER BY inside the aggregate where the engine supports it, or a staged subquery that pre-sorts the rows the fold consumes — because without an explicit order the concatenation order is unspecified and your cell reshuffles between runs, which reads as data drift when it's just nondeterminism. The wrong-tool cases: when the list is the analysis (you need per-tier rows to filter or join downstream, and a comma-string is a dead end you'll only have to split), when the list can exceed a sane length (a cell with forty tiers is a wall, not a report), and when consumers need to compute on the values — strings don't SUM. The right-tool case is exactly the region cell: a bounded, display-only inventory ('Audio, Wearables, Video') beside the numeric folds, one scan, no second query. State the separator and the order in the review — an unordered concat is an unstable cell — and keep the count beside it so the cell's width is auditable.",
      tag: "aggregation",
    },
    {
      id: "didi-t17",
      q: "FILTER (WHERE ...) versus SUM(CASE WHEN ...): same numbers, so does the choice matter?",
      a: "Same numbers, different failure surfaces, and yes — the choice matters. FILTER arms read like the census they are: COUNT(*) FILTER (WHERE status = 'cancelled') is the cancelled count, one arm per column, no ELSE to misplace — and the arm's predicate can never leak into another arm, because arms are independent. SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) is portable to every engine and generalizes to non-count folds (SUM the fare inside the branch), but it carries two classic failure modes: forget the ELSE and cancelled rows contribute NULL, sinking the whole SUM to NULL — the single most common CASE-fold bug — and copy-paste a branch's WHEN condition slightly wrong and two columns disagree silently. My rule at trip-census grain: FILTER for counts, CASE for value folds, and the one-pass discipline either way — five FILTER arms over 103 rows beat five queries every time the safety floor asks for the shift census, because five queries are five chances for the populations to drift apart.",
      tag: "aggregation",
    },
    {
      id: "didi-t18",
      q: "You want to rank regions by completion rate and keep only the top three. WHERE can't see the window and HAVING can't either. Walk through the staging.",
      a: "Pipeline order is the constraint: WHERE runs before GROUP BY (rows in, no folds visible), HAVING runs after GROUP BY but before window functions compute, and windows evaluate in the SELECT stage — so a rank over a fold can't be filtered in the same query that computes it. The staging is mechanical: stage the folds in a CTE or derived table (region, completed, requested, rate — the rate with its denominator fixed at fold time), then rank the staged rows with ROW_NUMBER or DENSE_RANK OVER (ORDER BY rate DESC) in the outer query, then filter rn <= 3 in the outermost WHERE. Three layers, each with one job — and the layering is also where the definition audit lives: the CTE's rate carries its population statement (requested, pending included), the rank carries its tie policy (DENSE_RANK when two regions can share third), and the outer filter carries the cut. The junior mistake is cramming the window into HAVING or filtering the rank in the same SELECT — you'll either error or rank unfiltered rows and trim at the display edge, and the 'top three' silently becomes the top three of a population nobody agreed on.",
      tag: "pipeline",
    },
    {
      id: "didi-t19",
      q: "Request-month or completion-month — which anchors the monthly trend, and what changes if you bucket by the wrong one?",
      a: "The question's spine decides: demand trends bucket by request month (SUBSTR(created_at, 1, 7) or STRFTIME('%Y-%m', created_at)) because that's when the ride was asked for; fulfillment and latency trends bucket by completion month because that's when the work landed. Bucket one by the other and boundary months warp: a request made 2025-01-31 that completed 2025-02-02 is January demand and February supply, and if your completion-month fold counts it as February volume while the demand fold counts it as January, the two reports disagree by exactly the cross-month trips — on a 103-trip ledger that's visible; at fleet scale it's a 'mystery variance' ticket. The discipline: name the anchor in the column alias (request_month, not month), compute the bucket from one timestamp per fold, and never mix anchors in the same report without labeling both. And keep the format atom correct — '%Y' alone collapses fourteen months into two buckets and flattens the trend into noise, the single cheapest bug on this list.",
      tag: "dates",
    },
    {
      id: "didi-t20",
      q: "Latency math: JULIANDAY deltas give fractional days. Where do ROUND and CAST belong, and what's the failure when CAST goes first?",
      a: "Compute raw, round at the edge. JULIANDAY(completed_ts) - JULIANDAY(requested_ts) is a fractional-day float per row; the fold is AVG over those raw deltas, and only the SELECT wraps it — ROUND(AVG(delta), 2) for the report cell (2.98 on this ledger, range 2 to 4). CAST before the fold — CAST(delta AS INTEGER) — truncates every row toward zero, and on fractional data that's not rounding, it's biased sampling: a fleet of 2.9-day trips reads as 2, and the average of truncated values is systematically low. ROUND per row before averaging is the milder sin — it perturbs each observation by up to half a day-step, which washes out on large fleets and quietly biases small ones, and our LATAM sample is exactly a small one (2 completed trips, 3.50 days). The rule: arithmetic on raw values, ROUND once for display, CAST only when the business truly wants whole-day buckets — and then say 'truncated' in the footnote, because CAST(2.98 AS INTEGER) is 2, not 3: truncation toward zero, not rounding.",
      tag: "dates",
    },
    {
      id: "didi-t21",
      q: "Risk wants the worst quartile of accounts by flag count. NTILE, PERCENT_RANK, or a rank cutoff — which and why?",
      a: "NTILE(4) OVER (ORDER BY flags DESC) is the direct answer — tile 1 is the worst quartile when the order is descending, which is the first place intuition inverts: tiles number from the top of the ORDER BY, so 'worst quartile' with ASC ordering is tile 4, and mislabeling the tile is how a risk report flags its BEST accounts. PERCENT_RANK answers a slightly different question (where does this account sit between 0 and 1 relative to peers) and is the right tool when the threshold is a percentile, not a count — 'bottom 5%' — because NTILE buckets are count-based and lumpy on small populations. The rank cutoff (DENSE_RANK <= k) is the wrong tool for distribution cuts: ranks measure order, not share of population, and k accounts is not a quartile unless the count cooperates. The tie caveat matters at fleet grain: tied rows at a tile boundary are assigned by arbitrary order within equal sort keys, so two accounts with identical flag counts can land in different tiles — if tile membership must respect ties, stage with a tie-broken ROW_NUMBER first and document that the split is positional.",
      tag: "windows",
    },
    {
      id: "didi-t22",
      q: "Trip events retry, so the same trip can appear twice. Compare the two dedupe strategies — ROW_NUMBER keep-latest versus GROUP BY max — and their blind spots.",
      a: "ROW_NUMBER() OVER (PARTITION BY trip_id ORDER BY event_ts DESC, event_id DESC) = 1 keeps the whole latest row and — the part juniors skip — the second ORDER BY key is what makes it deterministic: when two retries share a timestamp, event_id breaks the tie the same way on every run, whereas a one-key sort returns an arbitrary survivor and your dashboard flips between runs with no diff to explain it. GROUP BY trip_id with MAX(event_ts) collapses to one row cheaply, but it only gives you the max column — every other column in the row comes from an arbitrary member of the group unless you re-join back on (trip_id, event_ts), which is the dedupe written sideways and now with a false-precision risk if the max timestamp appears on two rows. So: keep-latest ROW_NUMBER when you need the full latest state (status AND timestamp AND driver together), GROUP BY MAX when one column is the whole question. And on any retry-heavy stream, quantify the dedupe — this ledger's 103 requests would silently grow if retries fired — because the count you report should be the deduped one, with the raw count as the audit trail.",
      tag: "quality",
    },
    {
      id: "didi-t23",
      q: "The ops dashboard slows every month-close. Name the instincts you'd apply before anyone mentions hardware.",
      a: "First, filter sargably: STRFTIME('%Y-%m', created_at) = '2025-01' wraps the column in a function and forfeits any index on created_at — range predicates (created_at >= '2025-01-01' AND created_at < '2025-02-01') keep the index usable, and on a month-close scan that's the difference between a seek and a full read. Second, fold early and once: stage the per-region or per-driver fold in a CTE so downstream ranks and shares reference a small folded set instead of re-aggregating raw rows, and never compute the same fold twice in one query. Third, respect the sort budget: a LIMIT 5 after a window still computes the window for every row, so cut populations in WHERE or CTE staging first, not at the display edge. Fourth, count what you join: fare-line joins fan trips to lines (103 to 251 on this ledger), so aggregate before the join when the fold is trip-grain — cheap here, expensive at fleet scale. None of this is exotic; it's the habit of asking, per clause, how many rows the engine thinks this touches — and SQLite's EXPLAIN QUERY PLAN answers it in one line.",
      tag: "performance",
    },
    {
      id: "didi-t24",
      q: "The definition of 'completion rate' changed quietly between two sprints and the trend broke. How does a data org prevent this?",
      a: "By treating metric definitions as contracts with the same review bar as code. The mechanics: one canonical definition per metric, written in the repo next to the query that computes it — completion rate = completed ÷ requested, pending and cancelled in the denominator, completed meaning shipped_at IS NOT NULL — and every dashboard imports the definition rather than re-typing it, because five teams re-typing a definition is five definitions drifting on five different sprints. Changes go through a review that says what moved, when, and which history needs restatement; backfills are labeled in the data (a version column or a restatement note), so a chart that crosses the change reads as two segments, not a cliff. The detection side is the trip-wire: a freshness-and-shape monitor that compares the status census (52 / 30 / 14 / 7 on this ledger) against trailing expectations and pages when a definition's side effects show up before the changelog does. The cultural point is the one I'd land in an interview: at a safety-adjacent company, a metric whose definition drifted silently isn't a reporting bug — it's an incident with a paperwork trail, and the org that treats it that way stops having the argument.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "didi-mcq-1",
      prompt: "On the trips table (103 requests, shipped_at non-NULL for 82, 16 distinct driver-partners), what does COUNT(shipped_at) return?",
      choices: ["103 — COUNT counts all rows", "82 — COUNT skips NULLs", "21 — COUNT counts NULLs only", "16 — COUNT deduplicates"],
      answer: 1,
      why: "COUNT(expr) counts rows where expr is NOT NULL — shipped_at is populated for exactly the 82 completed trips (52 delivered-status + 30 shipped-status) and NULL for the 14 pending plus 7 cancelled. COUNT(*) counts rows; COUNT(column) counts non-null values; the gap between them IS the open-backlog story.",
      notes: [
        { choice: 0, why: "That's COUNT(*). Under a trip-shaped name it launders 21 uncompleted requests into the completed count — the exact bug the safety floor hunts at 3am." },
        { choice: 2, why: "COUNT never counts NULLs. If you want the 21, that's COUNT(*) - COUNT(shipped_at) or a FILTER (WHERE shipped_at IS NULL) arm — say the population out loud." },
      ],
      difficulty: "easy",
    },
    {
      id: "didi-mcq-2",
      prompt: "Driver settlements store amount_cents as INTEGER. A colleague computes SUM(amount_cents)/100 and reports a driver's weekly payout off by cents. Why?",
      choices: [
        "SUM overflows on INTEGER columns",
        "INTEGER / INTEGER truncates — the divisor must be 100.0 to force real division",
        "amount_cents must be cast to TEXT first",
        "ROUND is required before SUM",
      ],
      answer: 1,
      why: "In SQLite, INTEGER / INTEGER is integer division: 12345/100 = 123, not 123.45. The settlement book is INTEGER cents precisely so money never meets floating point mid-pipeline — so the fold is SUM(amount_cents), and the /100.0 conversion happens once at the display edge. The .0 is not decoration; it is the whole answer.",
      notes: [
        { choice: 0, why: "64-bit INTEGER sums over settlement volumes don't overflow — the payouts are wrong by truncation, not wraparound. Check the divisor before blaming the column." },
        { choice: 2, why: "Casting to TEXT makes it worse: text arithmetic silently coerces or errors. Money stays numeric; the 100.0 does the conversion." },
      ],
      difficulty: "easy",
    },
    {
      id: "didi-mcq-3",
      prompt: "City ops wants completion share by region — completed ÷ ALL requested. Which query shape is correct?",
      choices: [
        "WHERE status IN ('delivered','shipped') then 100.0 * COUNT(*) / COUNT(*)",
        "No status filter in WHERE; 100.0 * SUM(CASE WHEN status IN ('delivered','shipped') THEN 1 ELSE 0 END) / COUNT(*)",
        "WHERE status != 'cancelled' then COUNT(*) / COUNT(DISTINCT driver_id)",
        "Filter completed rows into a CTE, then divide by the same CTE's row count",
      ],
      answer: 1,
      why: "The denominator is ALL requests — pending and cancelled included — so no status filter may touch WHERE. The CASE flag turns completion into a 1/0 indicator summed at the same fold as COUNT(*), and 100.0 before the division forces real arithmetic. On the proxy ledger that's EU 36 of 45, APAC 29 of 37, US 15 of 19, LATAM 2 of 2.",
      notes: [
        { choice: 0, why: "Filter-first shrinks the denominator to the numerator's population — every region reads 100%. That's the classic pipeline-order bug, and it hides the real 8.1% APAC cancellation story." },
        { choice: 3, why: "A CTE of completed rows divided by itself is the same denominator collapse with extra syntax. The CTE adds nothing but confidence." },
      ],
      difficulty: "medium",
    },
    {
      id: "didi-mcq-4",
      prompt: "You need regions whose cancellation count is at least 3. Where does the gate go?",
      choices: [
        "WHERE COUNT(*) FILTER (WHERE status='cancelled') >= 3",
        "HAVING COUNT(*) FILTER (WHERE status='cancelled') >= 3",
        "LIMIT 3 after ordering by cancellations",
        "WHERE status = 'cancelled' GROUP BY region",
      ],
      answer: 1,
      why: "The gate is on a per-group aggregate, so it belongs in HAVING — WHERE has no access to folds because it runs before GROUP BY. FILTER (WHERE ...) counts the cancelled rows inside the fold, and HAVING >= 3 keeps the real safety tail: on the proxy ledger EU (3) and APAC (3) survive, US (1) and LATAM (0) drop.",
      notes: [
        { choice: 0, why: "WHERE can't see aggregates — the query errors. Aggregates are computed after WHERE by pipeline order; that ordering is the whole lesson." },
        { choice: 2, why: "LIMIT 3 returns three ROWS, not regions with three cancellations. Different question, plausible chip, wrong answer." },
      ],
      difficulty: "medium",
    },
    {
      id: "didi-mcq-5",
      prompt: "Two cities tie at 8 trips in a weekly leaderboard. RANK() and DENSE_RANK() over trips DESC — what do the next row's rungs look like?",
      choices: [
        "RANK 3, DENSE_RANK 3",
        "RANK 4, DENSE_RANK 3",
        "RANK 3, DENSE_RANK 4",
        "Both 4 — ties always skip two rungs",
      ],
      answer: 1,
      why: "With a tie at rungs 1-2, RANK skips to 4 (1, 2, 4) — the gap implies a missing third city — while DENSE_RANK stays compact at 3 (1, 2, 3). The ops floor reads rungs as 'who's nth', so DENSE_RANK ships; a phantom gap generates a meeting about a city that was never there.",
      notes: [
        { choice: 0, why: "That's DENSE_RANK's next rung — RANK's whole point is the skip. If the two functions agreed everywhere, only one of them would exist." },
        { choice: 2, why: "Backwards: the compact sequence belongs to DENSE_RANK. Mixing the two up is the most common window-semantics slip in screens." },
      ],
      difficulty: "medium",
    },
    {
      id: "didi-mcq-6",
      prompt: "Ops wants week-over-week cancellation drift per city. Which window gets it in one pass?",
      choices: [
        "GROUP BY city with a self-join on week = week - 1",
        "LAG(cancelled, 1) OVER (PARTITION BY city ORDER BY week) then cancelled - LAG value",
        "SUM(cancelled) OVER () as a grand total",
        "ROW_NUMBER() OVER (PARTITION BY city ORDER BY cancelled DESC)",
      ],
      answer: 1,
      why: "LAG fetches the previous row's value inside the same partition — one pass, no self-join, and the drift column is cancelled minus prior-week cancelled. PARTITION BY city restarts the sequence per city; ORDER BY week defines 'previous'. This is the weekly-drift read the safety floor reviews every Monday.",
      notes: [
        { choice: 0, why: "A self-join works but doubles the scan and forgets the first week of every city (no prior row — LEFT JOIN or the row drops). LAG is the one-pass shape and keeps the NULL-as-no-prior-week semantics visible." },
        { choice: 2, why: "A grand-total window ignores the partition — every city gets the fleet-wide total, and 'drift' becomes a constant. Windows need PARTITION BY to answer per-entity questions." },
      ],
      difficulty: "medium",
    },
    {
      id: "didi-mcq-7",
      prompt: "Safety triage needs requested, completed, pending, cancelled and open-backlog in ONE row per region. Which single-pass shape returns all five folds?",
      choices: [
        "Five separate queries UNIONed vertically",
        "COUNT(*) plus four COUNT(*) FILTER (WHERE ...) arms in one GROUP BY region",
        "A correlated subquery per region per status",
        "MAX(CASE WHEN ...) pivoted by status",
      ],
      answer: 1,
      why: "FILTER (WHERE ...) is SQLite's conditional count: five folds over the same rows, one scan, one query. On the proxy ledger it returns requested 103, completed 82, pending 14, cancelled 7, backlog 21 — the exact census the safety floor's shift handoff runs, and the shape DiDi screens love because it proves you can fan a status dimension sideways instead of vertically.",
      notes: [
        { choice: 0, why: "UNION stacks five scans into one result with a hand-maintained label column — it works, but it's four times the cost and the grain is now rows, not columns. The one-pass census is the idiomatic shape." },
        { choice: 2, why: "Correlated subqueries re-aggregate per region per status — five times the work for the same numbers, and the shape reads like a loop, not a census." },
      ],
      difficulty: "hard",
    },
    {
      id: "didi-mcq-8",
      prompt: "In SUM(trips) OVER (ORDER BY trips DESC) over a per-hour fold with three hours tied at 8 trips, what does the running total at the FIRST 8-trip row include?",
      choices: [
        "Just that one row — running totals add row by row",
        "All three 8-trip hours — the default frame is RANGE, and peers ride together",
        "The whole table — an unordered window is global",
        "Nothing — window sums require an explicit ROWS BETWEEN",
      ],
      answer: 1,
      why: "The default frame with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes ordering PEERS — the running total jumps by 24 at the first 8-trip hour. ROWS BETWEEN ... CURRENT ROW counts one row. The frames disagree exactly where ties exist, which is every hourly demand curve.",
      notes: [
        { choice: 0, why: "That's the ROWS frame — and it takes an explicit ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW to get it. The default silently picks RANGE-with-peers." },
        { choice: 3, why: "Windows never require explicit frames — they silently inherit one, which is precisely the trap. State the frame; don't let the engine choose your semantics." },
      ],
      difficulty: "hard",
    },
    {
      id: "didi-mcq-9",
      prompt: "A newly launched city has zero requests. In the per-region fold, what does 100.0 * SUM(completed_flag)/COUNT(*) show for it?",
      choices: [
        "0 — an empty group computes to zero",
        "NULL — SUM is NULL and NULL/0 stays NULL: an honest hole in the report",
        "100 — the flag sums to 0 over 0, which SQLite rounds to 1",
        "An error — division by zero aborts the query",
      ],
      answer: 1,
      why: "Wait — with GROUP BY region, a zero-request city produces NO group at all: the row vanishes from the fold. If you manufacture the row (LEFT JOIN from a cities spine), the empty group folds to COUNT(*) = 0 and SUM(flag) = NULL, and NULL/0 = NULL — SQLite returns NULL for x/0 without crashing. Either way the cell is an honest hole, and the display policy (drop, NULLIF-guard, or COALESCE at the edge) is a conversation, not a default.",
      notes: [
        { choice: 0, why: "COALESCE-ing mid-pipeline launders the hole into a fake 'perfect launch city' — a 0% completion rate reads as a data bug in the ops review. Guard, don't decorate." },
        { choice: 3, why: "SQLite never aborts on x/0 — it returns NULL quietly. That's worse than a crash: the report ships with a silent hole exactly where a launch city should be." },
      ],
      difficulty: "hard",
    },
    {
      id: "didi-mcq-10",
      prompt: "Before computing average completion latency, the analyst writes WHERE shipped_at IS NOT NULL. What does this clause actually do to the 103-request ledger?",
      choices: [
        "Removes the 7 cancelled trips only",
        "Keeps the 82 trips that have a completion timestamp — pending (14) and cancelled (7) leave the population",
        "Removes rows where shipped_at equals the empty string",
        "Nothing — shipped_at is never NULL",
      ],
      answer: 1,
      why: "shipped_at is the completion timestamp and it is NULL for every trip that hasn't ended: 14 pending + 7 cancelled = 21 rows out. The guard is documentation of a population decision — completed trips only — and the resulting 2.98-day average (range 2..4) is honest only because the out-of-scope rows were declared, not silently dropped.",
      notes: [
        { choice: 0, why: "Pending trips have no completion timestamp either — they're 14 of the 21 rows the guard removes. A latency average over 'completed minus cancelled' quietly changes the safety story." },
        { choice: 3, why: "If shipped_at were never NULL the column couldn't distinguish completed from open trips — and the ledger says 21 of 103 rows are exactly that distinction." },
      ],
      difficulty: "easy",
    },
    {
      id: "didi-mcq-11",
      prompt: "The shift report stitches the completed-trip census (one row per region) with the open-backlog census (one row per region). Two regions produce identical rows in both censuses. What does UNION ALL return that UNION would not?",
      choices: [
        "UNION ALL keeps both copies; UNION silently collapses the duplicate row to one",
        "UNION ALL errors on duplicate rows; UNION dedupes cleanly",
        "They're identical — UNION ALL is just faster syntax for the same dedupe",
        "UNION ALL keeps duplicates only if the label column differs",
      ],
      answer: 0,
      why: "UNION ALL concatenates and keeps every row — including duplicates; UNION dedupes the combined result on whole rows. Two identical region rows from two different censuses are semantically DIFFERENT rows (one is about completions, one about backlog), so collapsing them hides a population — which is why stitched reports ship with a literal label column and UNION ALL.",
      notes: [
        { choice: 1, why: "Backwards — UNION ALL never errors and never dedupes. The error story belongs to column-count mismatches, not duplicates." },
        { choice: 2, why: "The dedupe difference IS the difference: UNION's dedupe is exactly what corrupts a stitched report when two censuses carry mirror rows." },
      ],
      difficulty: "easy",
    },
    {
      id: "didi-mcq-12",
      prompt: "After joining fare lines (order_items) to trips (orders), a junior counts 251 rows and calls it trips. What does COUNT(DISTINCT o.id) return on the same join?",
      choices: [
        "251 — DISTINCT inside COUNT dedupes unit prices",
        "103 — the distinct trip count the join fanned out from",
        "16 — one per driver-partner",
        "82 — the completed subset only",
      ],
      answer: 1,
      why: "The join fans 103 trips out to 251 fare lines; COUNT(DISTINCT o.id) folds the fan-out back to the 103 trips that actually exist. Any per-trip rate computed after this join must use the DISTINCT form — COUNT(*) is now counting fare lines.",
      notes: [
        { choice: 0, why: "251 is the row count of the fan-out — the exact number you're trying to undo. DISTINCT applies to o.id values, not unit prices." },
        { choice: 2, why: "16 is the driver grain, not the trip grain. DISTINCT driver_id answers a different question ('how many partners drove') and mixing grains is the classic follow-up trap." },
      ],
      difficulty: "easy",
    },
    {
      id: "didi-mcq-13",
      prompt: "Average settlement amount, in dollars, from an INTEGER-cent book. Which expression is correct?",
      choices: [
        "AVG(amount_cents / 100)",
        "AVG(amount_cents) / 100.0",
        "SUM(amount_cents) / 100 / COUNT(*)",
        "ROUND(AVG(amount_cents))",
      ],
      answer: 1,
      why: "Fold in cents, convert once at the edge: AVG(amount_cents) is exact integer arithmetic inside, and /100.0 converts the result with real division. Putting the division inside — AVG(amount_cents / 100) — truncates every row to whole dollars before averaging, so the mean is built from lossy values.",
      notes: [
        { choice: 0, why: "Integer division fires per row inside the AVG — every payment loses its cents, and the average of truncated values is a different number, not a rounded version of the right one." },
        { choice: 2, why: "Algebraically SUM/COUNT is AVG, but the integer /100 truncates the fold before the final divide — and the shape hides the bug behind correct-looking algebra." },
      ],
      difficulty: "easy",
    },
    {
      id: "didi-mcq-14",
      prompt: "Risk wants 'completed trips that carry no open safety flag'. The flagged set is f. Which set operation is right — and what does the reversed one answer?",
      choices: [
        "f EXCEPT completed — flags minus completions",
        "completed EXCEPT f — completions minus flags; reversed, it answers flags-without-completions, the backlog",
        "INTERSECT of the two sets",
        "UNION of the two sets, then filter",
      ],
      answer: 1,
      why: "EXCEPT returns rows in the left set that aren't in the right — so completed EXCEPT f is exactly 'completed with no open flag'. The direction IS the question: swap the operands and you've answered 'flagged trips that never completed', which is the safety floor's backlog, a different report entirely.",
      notes: [
        { choice: 0, why: "That's the reversed EXCEPT — a real query with a real result, which is what makes the direction trap dangerous: it runs clean and answers the wrong memo." },
        { choice: 2, why: "INTERSECT returns trips in BOTH sets — completed AND flagged — the exact complement of what the memo asked for." },
      ],
      difficulty: "medium",
    },
    {
      id: "didi-mcq-15",
      prompt: "Rolling 7-day completed trips per city, one row per day. Which window computes it in one pass?",
      choices: [
        "SUM(completed) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)",
        "SUM(completed) OVER (ORDER BY day RANGE BETWEEN 6 PRECEDING AND CURRENT ROW)",
        "SUM(completed) OVER (PARTITION BY day)",
        "SUM(completed) OVER ()",
      ],
      answer: 0,
      why: "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW is a row-count contract: today plus the previous six rows, per city once PARTITION BY city is added. RANGE counts by VALUE distance, so with day gaps or ties the window can cover fewer or more than seven calendar days — the rolling-7 name quietly becomes a lie.",
      notes: [
        { choice: 1, why: "RANGE 6 PRECEDING means 'values within 6 of the current value' — on gappy or tied days the frame is not the last seven rows. The rolling-7 metric wants ROWS." },
        { choice: 2, why: "PARTITION BY day gives every row in a day the day's total — a per-day fold, not a rolling one. Partitioning by the wrong axis is the quiet way a rolling metric becomes a bar chart." },
      ],
      difficulty: "medium",
    },
    {
      id: "didi-mcq-16",
      prompt: "The week-over-week drift column is cancelled - LAG(cancelled). Week one of each city shows NULL. The stakeholder wants it 'fixed' to 0. Why is that wrong?",
      choices: [
        "It's not — NULL arithmetic treats NULL as 0 anyway",
        "COALESCE to 0 manufactures a diff against a week that never existed — a city cancelling 5 in its first week reads as +5 drift, an incident out of a calendar start",
        "NULL means the LAG window was misconfigured",
        "Drift must be computed with LEAD to avoid first-week NULLs",
      ],
      answer: 1,
      why: "NULL at the partition boundary means 'no prior week to differ from' — the honest value. Coalescing it to zero makes week one diff against an implicit zero, so any nonzero first week becomes a manufactured spike. Report the NULL, or drop week one with a stated population note — never decorate it into a number.",
      notes: [
        { choice: 0, why: "NULL is not zero: cancelled - NULL is NULL, which is why the column shows NULL at all. Confusing the two is the exact bug being coached." },
        { choice: 3, why: "LEAD flips the problem to the LAST week (same NULL, other end). The boundary row exists; the decision is how to report it, not which function hides it." },
      ],
      difficulty: "medium",
    },
    {
      id: "didi-mcq-17",
      prompt: "Per-tier fare-line averages, each tier's average beside the fleet-wide average, one query. Which shape is correct?",
      choices: [
        "JOIN order_items to a grouped derived table of the fleet average ON 1=1",
        "A scalar subquery in SELECT: (SELECT AVG(unit_price) FROM order_items) — one value, repeated per row",
        "A correlated subquery per tier computing AVG over the whole table each time",
        "GROUP BY tier and AVG again in HAVING",
      ],
      answer: 1,
      why: "The fleet average is ONE number for the whole query — the scalar subquery computes it once and stamps it on every row: no join, no fan-out, and the intent reads instantly. A cross join to a one-row derived table works but is the same idea with more machinery.",
      notes: [
        { choice: 0, why: "Works, but ON 1=1 is a cross join in disguise — the scalar subquery says the same thing with less machinery, and reviewers read intent instantly." },
        { choice: 2, why: "A correlated subquery re-computes the identical fleet average once per tier — same answer, wasted passes, and the shape suggests the average varies per tier when it doesn't." },
      ],
      difficulty: "medium",
    },
    {
      id: "didi-mcq-18",
      prompt: "SUM(trips) OVER (PARTITION BY city) — no ORDER BY. What does each row return?",
      choices: [
        "The running total up to that row",
        "That city's total trips — the whole partition on every row, the denominator for share-of-city reads",
        "The fleet-wide total on every row",
        "An error — SUM over a window requires ORDER BY",
      ],
      answer: 1,
      why: "Without ORDER BY the default frame is the entire partition, so every row of a city carries that city's total — which is exactly the denominator for 100.0 * trips / city_total share reads. No scan-and-join, one pass.",
      notes: [
        { choice: 0, why: "Running totals need ORDER BY (which activates a bounded default frame). No ORDER BY means no sequence — the whole partition is the frame." },
        { choice: 2, why: "Fleet-wide totals belong to OVER () with no partition. PARTITION BY city is what scopes the total — drop it and every row carries the fleet, which answers a different memo." },
      ],
      difficulty: "hard",
    },
    {
      id: "didi-mcq-19",
      prompt: "A junior writes SELECT STRFTIME('%Y-%m', created_at) AS month ... WHERE month = '2024-07' and gets an error. Why — and what's the fix?",
      choices: [
        "WHERE can't see SELECT aliases: WHERE runs before SELECT, so the expression must be repeated in WHERE",
        "month is a reserved word and must be quoted",
        "STRFTIME can't appear in SELECT with a WHERE clause",
        "The fix is HAVING month = '2024-07'",
      ],
      answer: 0,
      why: "Pipeline order: WHERE evaluates rows before SELECT computes aliases, so 'month' doesn't exist yet where WHERE runs. The fix is repeating the expression — WHERE STRFTIME('%Y-%m', created_at) = '2024-07' — or staging the bucketing in a CTE and filtering outside it.",
      notes: [
        { choice: 1, why: "month isn't reserved here — the error is the unknown column, a pipeline-order fact, not a quoting problem." },
        { choice: 3, why: "HAVING runs after GROUP BY and sees folds, not SELECT aliases of an ungrouped query — and on an ungrouped query it's simply out of place. Repeating the expression is the fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "didi-mcq-20",
      prompt: "NTILE(4) OVER (ORDER BY earnings DESC) over driver earnings. Which quartile holds the TOP earners?",
      choices: [
        "Tile 4 — tiles always number from the bottom",
        "Tile 1 — tiles follow the ORDER BY, so with DESC the first tile is the top of the distribution",
        "Both 1 and 4 — NTILE splits ties across boundary tiles deterministically",
        "None — NTILE requires ASC order",
      ],
      answer: 1,
      why: "NTILE numbers tiles 1..n in ORDER BY sequence: DESC puts the highest earners in tile 1. The intuition inversion ('quartile 4 = top') is an ASC habit — with DESC ordering, 'worst quartile' is tile 4 and 'best' is tile 1, and mislabeling it flags the wrong accounts.",
      notes: [
        { choice: 0, why: "That's the ASC habit. Flip the sort and the tile numbers flip with it — the tile index is positional, not semantic." },
        { choice: 2, why: "Ties at a tile boundary are split by arbitrary order within equal sort keys — two identically-earning drivers can land in different tiles, a documentation problem, not a numbering inversion." },
      ],
      difficulty: "hard",
    },
    {
      id: "didi-mcq-21",
      prompt: "On the proxy ledger, LATAM shows 2 trips, both completed, none cancelled. Its completion share computes to 100.0. What's the right read?",
      choices: [
        "A data bug — completion share can't be 100",
        "A real 100% on a 2-trip sample: the rate is honest, the sample size is the caveat that ships beside it",
        "The denominator must be wrong — it should include cancelled trips",
        "100.0 means the two trips double-counted",
      ],
      answer: 1,
      why: "LATAM's 2 of 2 completed is a legitimate 100% — the formula is honest (completed ÷ requested, no filters moved). What the number lacks is sample mass: 2 trips is a signal, not a trend, so the report shows the rate with its denominator (2) attached and the narrative says 'small sample' instead of 'perfect region'.",
      notes: [
        { choice: 2, why: "The denominator is already all requested trips — LATAM has zero cancelled, so nothing is hiding. Adding fake denominators is the pipeline-order bug, not a fix." },
        { choice: 3, why: "Two distinct trips at 100% is one clean fold. Double-counting is a dedupe question — check it with COUNT(DISTINCT id), not by doubling back on a correct rate." },
      ],
      difficulty: "easy",
    },
    {
      id: "didi-mcq-22",
      prompt: "Display latency as a one-decimal report cell: the fleet average is 2.98 days. Which expression is right — and what does the wrong one return?",
      choices: [
        "ROUND(2.98, 1) → 3.0; CAST(2.98 AS INTEGER) → 2 — truncation, not rounding",
        "Both return 3 — ROUND and CAST round the same way",
        "CAST(2.98 AS INTEGER) → 3; ROUND(2.98, 1) → 2.9",
        "ROUND(2.98, 1) → 2.9 — and CAST errors on REAL",
      ],
      answer: 0,
      why: "ROUND(2.98, 1) = 3.0 — a display value; CAST(2.98 AS INTEGER) = 2 — truncation toward zero, dropping the fraction without rounding. At the display edge the difference is cosmetic; inside a fold, CAST-before-aggregate biases every observation downward and the fleet average reads systematically fast.",
      notes: [
        { choice: 1, why: "CAST never rounds — it truncates. 2.98 becomes 2, and on latency data 'faster than reality' is the direction you can't afford." },
        { choice: 2, why: "Backwards on both: CAST truncates to 2, and ROUND to one decimal of 2.98 is 3.0 (the 8 rounds the 9 up)." },
      ],
      difficulty: "easy",
    },
    {
      id: "didi-mcq-23",
      prompt: "COUNT(*) FILTER (WHERE shipped_at IS NOT NULL) versus SUM(CASE WHEN shipped_at IS NOT NULL THEN 1 ELSE 0 END) over the 103-request ledger. What do they return?",
      choices: [
        "82 and 82 — the two shapes are equivalent for conditional counts",
        "82 and 103 — CASE ignores the NULL rows",
        "103 and 82 — FILTER counts NULLs",
        "Both NULL — the CASE arm returns NULL",
      ],
      answer: 0,
      why: "Both count the rows with a completion timestamp: 82 (52 delivered-status + 30 shipped-status). FILTER is the readable one-pass census arm; SUM(CASE) is the portable equivalent — same scan, same number, different syntax. The one way to break the CASE shape is dropping the ELSE 0, which sinks the SUM to NULL.",
      notes: [
        { choice: 1, why: "The CASE arm handles NULLs correctly — WHEN NULL IS NOT NULL is false, so it contributes ELSE 0. 103 would be COUNT(*), the unfiltered grain." },
        { choice: 3, why: "The ELSE 0 is precisely what keeps the SUM numeric. Drop the ELSE and you'd get NULL — which is why the full CASE text matters in review." },
      ],
      difficulty: "easy",
    },
    {
      id: "didi-mcq-24",
      prompt: "The settlement anti-join uses WHERE id NOT IN (SELECT invoice_id FROM payments). One payment row carries invoice_id = NULL from a feed glitch. What does the query return?",
      choices: [
        "All invoices not in the payment list — NULLs are skipped by NOT IN",
        "Zero rows — x NOT IN (list containing NULL) is never TRUE",
        "Only the invoices with NULL invoice_id",
        "An error — NOT IN rejects NULL lists",
      ],
      answer: 1,
      why: "x NOT IN (1, 2, NULL) evaluates x <> NULL as unknown for every row, so the WHERE eliminates everything and the query returns an empty set — the silent-empty failure, worst kind, because the dashboard ships a blank where an exceptions list should be. NOT EXISTS or a LEFT JOIN + IS NULL shape survives the NULL.",
      notes: [
        { choice: 0, why: "That's IN's behavior with NULLs (they just never match), not NOT IN's. For NOT IN, one NULL in the list poisons every comparison." },
        { choice: 2, why: "Inverted — the NULL poisons the whole predicate, not just matching rows. The empty result is the tell; a 'clean' anti-join that returns nothing deserves a NOT EXISTS rewrite before it ships." },
      ],
      difficulty: "medium",
    },
    {
      id: "didi-mcq-25",
      prompt: "'Second-slowest region by average latency' with two regions tied at the top. Which shape returns the honest second place?",
      choices: [
        "ORDER BY avg_days DESC LIMIT 1 OFFSET 1",
        "DENSE_RANK() OVER (ORDER BY avg_days DESC) = 2",
        "RANK() OVER (ORDER BY avg_days DESC) = 2",
        "MIN(avg_days) excluding the max",
      ],
      answer: 1,
      why: "With two regions tied at rank 1, DENSE_RANK gives the next region 2 — the second-place rung the business means. LIMIT/OFFSET returns one arbitrary tied row first (the 'second' row is the other tied region), and RANK skips to 3 after a tie, so = 2 matches nothing.",
      notes: [
        { choice: 0, why: "OFFSET shifts by ROWS, not rungs: two tied regions occupy rows 1-2, so OFFSET 1 returns the second tied region — still first place, just the other copy." },
        { choice: 2, why: "RANK's gap is the trap: after a two-way tie at 1, the next rung is 3. Filtering rank = 2 returns an empty set — correct logic, wrong rank function." },
      ],
      difficulty: "medium",
    },
    {
      id: "didi-mcq-26",
      prompt: "A monthly trend query uses STRFTIME('%Y', created_at) and returns 2 buckets. The ledger spans 2024-01 through 2025-02. What's wrong?",
      choices: [
        "STRFTIME can't bucket TEXT timestamps",
        "'%Y' buckets by year — fourteen months collapse into 2024 and 2025; the month grain needs '%Y-%m'",
        "The trend needs DATE(created_at) instead",
        "Two buckets is correct — the data only covers two years",
      ],
      answer: 1,
      why: "The format atom is the grain: '%Y-%m' gives the fourteen monthly buckets the ops review expects; '%Y' flattens the trend into two year-bars and every month-over-month read vanishes. Same function, wrong atom — and the flattening is invisible unless you count the buckets.",
      notes: [
        { choice: 2, why: "DATE() normalizes to a day string — it doesn't bucket, and a day-grain trend is 400+ bars, not a fix. The bucket is the format string's job." },
        { choice: 3, why: "Correct count, wrong conclusion: two buckets at year grain is the bug, not the data. The reviewer's tell is that a 'monthly' trend with two rows can't show drift." },
      ],
      difficulty: "medium",
    },
    {
      id: "didi-mcq-27",
      prompt: "Each driver's completed trips beside their CITY's average (not the fleet's). A scalar subquery in SELECT can't partition. What computes it in one pass?",
      choices: [
        "AVG(completed) OVER () — the fleet average is close enough",
        "AVG(completed) OVER (PARTITION BY city) stamped on every driver row",
        "A correlated scalar subquery filtering the inner AVG by the outer row's city",
        "GROUP BY city with the drivers listed in a GROUP_CONCAT cell",
      ],
      answer: 1,
      why: "PARTITION BY city scopes the AVG to each driver's city and computes every partition in one pass — the per-group comparison without a self-join or a re-scan per row. The scalar subquery can't know the outer row's city; the correlated version works but re-aggregates per driver.",
      notes: [
        { choice: 0, why: "OVER () is the fleet average — a real number, the wrong denominator. The whole point of PARTITION BY is scoping the comparison to the peer group." },
        { choice: 2, why: "Correlated scalars re-run the city aggregate once per driver — correct output, quadratic-shaped work, and the shape hides that the average is per-city. The window says it once." },
      ],
      difficulty: "medium",
    },
    {
      id: "didi-mcq-28",
      prompt: "Trip events retry with identical event_ts on two rows. The keep-latest dedupe is ROW_NUMBER() OVER (PARTITION BY trip_id ORDER BY event_ts DESC). What's wrong?",
      choices: [
        "Nothing — ROW_NUMBER is deterministic",
        "The tie is broken arbitrarily between runs unless a second key (e.g. event_id DESC) makes the survivor deterministic",
        "It keeps the OLDEST row — DESC is wrong",
        "It must be RANK, not ROW_NUMBER, to handle ties",
      ],
      answer: 1,
      why: "ROW_NUMBER splits ties arbitrarily — with identical event_ts, which retry survives can differ between executions, so the 'latest state' flips and no diff explains it. The fix is a deterministic tie-breaker: ORDER BY event_ts DESC, event_id DESC keeps the same row every run.",
      notes: [
        { choice: 0, why: "ROW_NUMBER guarantees uniqueness (1..n), not determinism — stability across runs is exactly what the missing tie-break buys." },
        { choice: 2, why: "DESC is the keep-LATEST direction — right as written. The bug is the tie, not the direction; adding keys fixes it, flipping it breaks it further." },
      ],
      difficulty: "hard",
    },
    {
      id: "didi-mcq-29",
      prompt: "Rank cities by completion rate, keep the top three. A junior filters rn <= 3 in the same SELECT that computes ROW_NUMBER, via HAVING. Why does it fail?",
      choices: [
        "HAVING can't reference window results: windows compute in the SELECT stage, after HAVING — the rank must be staged, then filtered outside",
        "It works if the window is also written in HAVING",
        "ROW_NUMBER must be replaced by RANK for HAVING to see it",
        "The fix is LIMIT 3",
      ],
      answer: 0,
      why: "Pipeline order: HAVING evaluates after GROUP BY but windows compute in the SELECT stage that follows — so the rank doesn't exist where HAVING runs. Stage the folds+rate in a CTE, rank in the outer query, filter rn <= 3 in the outermost WHERE. LIMIT 3 is not the same question (it's three ROWS after whatever order survived).",
      notes: [
        { choice: 1, why: "Repeating the window in HAVING just errors again — HAVING's stage is before window evaluation regardless of what you write there." },
        { choice: 3, why: "LIMIT 3 truncates rows post-order; it doesn't rank, doesn't respect rate ties, and answers 'three rows' rather than 'top three cities by rate'. The staging shape is the answer." },
      ],
      difficulty: "hard",
    },
    {
      id: "didi-mcq-30",
      prompt: "A region cell folds its tiers with GROUP_CONCAT(name) and the cell's order reshuffles between dashboard refreshes. Fix?",
      choices: [
        "Wrap in DISTINCT to stabilize",
        "Add an explicit order — GROUP_CONCAT(name ORDER BY fare_share DESC) where the engine supports it, else stage a pre-sorted subquery; unordered concat is unspecified order",
        "Cast the result to INTEGER",
        "Replace with MAX(name) — one tier is enough",
      ],
      answer: 1,
      why: "Without ORDER BY inside the aggregate, concatenation order is unspecified — it can legitimately change between runs, which reads as data drift. The fix pins the order at the fold (or pre-sorts the rows the aggregate consumes). DISTINCT changes the value SET, not the sequence; MAX collapses to one tier and loses the inventory.",
      notes: [
        { choice: 0, why: "DISTINCT dedupes values — order is still unspecified, and if two tiers share a name you've silently changed the cell's content while chasing its order." },
        { choice: 3, why: "MAX is the argmax fold wearing a concat's clothes: the cell becomes one tier, the inventory disappears, and the review now argues about which tier 'should' represent the region." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-didi-1",
      tier: "medium",
      topic: "j7",
      universe: "growth",
      title: "Driver-partner utilization leaderboard",
      brief:
        "DiDi-flavored case on the storefront db (orders = trip requests, customers = driver-partners, delivered/shipped status = trip completed): fleet ops opens the week with the utilization leaderboard — which driver-partners actually converted requests into completed trips, and what completed fares did they fold. The definition is fixed before the query: completed trips only (status IN delivered/shipped — 82 of the 103 requests), fares folded per driver at driver grain, not trip grain. Probed context: driver-partner #1 (Alice Chen) leads ALL-request volume with 24 requests and 7,262.35 in gross fares, but the leaderboard reads completed work only, and the ask is the top five by completed net fares, best on top.",
      ask: "Return the top five driver-partners by completed net fares: name, completed trips, net fares — best first.",
      template:
        "SELECT c.name,\n       COUNT(*) AS completed_trips,\n       ROUND({2}(o.total), 2) AS net_fares\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.status {1} ('delivered','shipped')\nGROUP BY c.id\nORDER BY net_fares {3}\nLIMIT {4};",
      slots: [
        {
          answer: "IN",
          kind: "keyword",
          label: "the completed-set membership",
          why: "The completed set is TWO statuses — delivered and shipped both carry a completion timestamp (52 + 30 = 82 of 103 requests). IN expresses the set membership in one predicate; a single '=' against a two-value list errors, and any narrower set silently drops completed work off the leaderboard.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the net-fares fold",
          why: "Net fares are the SUM of trip totals folded per driver — ROUND(SUM(o.total), 2) keeps the money shape. COUNT(o.total) would report a trip count dressed in currency (18 instead of 5,978.70 for the leader), and MAX would report one trip's fare as a week's earnings.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the best-first direction",
          why: "The leaderboard reads best-on-top: descending puts the top-earning driver-partner on row one. ASC would open the review with a two-trip driver at 370.53 — a correct query aimed at the opposite end of the table.",
        },
        {
          answer: "5",
          kind: "number",
          noVerify: true,
          label: "the top-five cut",
          why: "The ask is the top FIVE — a podium ops actually staffs against. LIMIT 5 keeps exactly that; LIMIT 3 would amputate two working drivers from a review that rewards five, and no LIMIT hands back all sixteen driver-partners.",
        },
      ],
      distractors: ["=", "COUNT", "ASC", "3", "BETWEEN"],
      walkthrough:
        "A utilization leaderboard where the population statement does the work. The WHERE keeps only the 82 completed trips — 52 delivered-status plus 30 shipped-status, the two statuses that carry a completion timestamp — and says so via IN ('delivered','shipped') rather than one status at a time. The fold rides at driver grain: GROUP BY c.id collapses each driver's trips, COUNT(*) counts completed trips per driver, and ROUND(SUM(o.total), 2) folds net fares — the leader lands at 18 completed trips and 5,978.70 in net fares, with Emma Wilson (13 / 5,025.27) and Grace Kim (13 / 4,300.59) close behind. ORDER BY net_fares DESC puts the leader on top and LIMIT 5 cuts the podium ops asked for. The distractors encode the standard failures: '=' against a two-value status list is a row-value error; COUNT in the fare slot reports 18 as a currency; ASC crowns a two-trip driver; BETWEEN lacks the AND the grammar demands. Note what the leaderboard is NOT: gross volume — driver #1's 24 requests and 7,262.35 include six requests that never completed, which is exactly why completed-only reads exist.",
    },
    {
      id: "cs-didi-2",
      tier: "easy",
      topic: "x2",
      universe: "fraud",
      title: "Safety-floor shift triage census",
      brief:
        "DiDi-flavored case on the storefront db (orders = trip requests, shipped_at = trip completion timestamp): the safety floor's shift handoff opens with a one-pass census per region — requested, completed, cancelled, and the open backlog of trips with no completion timestamp ({sky:pending} + {rose:cancelled}) — because each backlog row is a possible call, refund or escalation. Probed facts: 103 requests total, 82 completed, 14 pending, 7 cancelled; region splits EU 45 (24 delivered / 12 shipped / 6 pending / 3 cancelled), APAC 37 (21 / 8 / 5 / 3), US 19 (5 / 10 / 3 / 1), LATAM 2 (2 / 0 / 0 / 0). The gate is explicit: only regions carrying a live cancellation tail — at least 1 cancelled request — make the triage queue (LATAM's clean sheet drops out), worst region first.",
      ask: "Return the triage queue: region, requested, completed, cancelled, open backlog — only regions with a live cancellation tail, worst first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS requested,\n       COUNT(*) FILTER (WHERE o.status IN ('delivered','shipped')) AS completed,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS cancelled,\n       {2}(*) FILTER (WHERE o.shipped_at {3} NULL) AS open_backlog\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING COUNT(*) FILTER (WHERE o.status = 'cancelled') >= {4}\nORDER BY cancelled {5}, requested DESC;",
      slots: [
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the cancelled-status literal",
          why: "The cancelled column counts status = 'cancelled' — the 7 requests that died mid-funnel. 'shipped' would count the 30 healthy completed-status rows instead, and the triage queue would staff against successes rather than incidents.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the backlog counter",
          why: "COUNT(*) FILTER (WHERE ...) is the conditional count that makes a one-pass census possible. SUM(*) is a syntax error — SUM needs an expression — and MAX(*) would report one row, not the region's open backlog.",
        },
        {
          answer: "IS",
          kind: "keyword",
          label: "the open-backlog NULL test",
          why: "The open backlog is trips with NO completion timestamp: shipped_at IS NULL — 14 pending + 7 cancelled = 21 rows fleet-wide. IS NOT NULL would count the 82 completed trips as 'backlog', inverting the census into a success report.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the triage-queue gate",
          why: "The gate keeps regions with at least 1 cancelled request — a live cancellation tail: on the probed split EU (3), APAC (3) and US (1) survive and LATAM (0) drops. The gate value appears in the surviving rows' cancelled column, so the census self-checks.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-first direction",
          why: "The triage queue is worst-first: descending cancellation counts put EU (45 requests, 3 cancelled) ahead of APAC (37, 3), and the requested DESC tie-break keeps the order deterministic. ASC would open the shift with the quieter region.",
        },
      ],
      distractors: ["SUM", "IS NOT", "ASC", "'shipped'", "4"],
      walkthrough:
        "A one-pass census — five folds, one scan, zero subqueries. The FILTER (WHERE ...) arms count sideways over the same rows: requested COUNT(*) per region, completed as the two-status IN ('delivered','shipped') census, cancelled as the status = 'cancelled' count, and the open backlog as shipped_at IS NULL — the trips whose completion timestamp never landed, 14 pending + 7 cancelled = 21 fleet-wide. HAVING (not WHERE) applies the >= 1 gate because the gate reads a per-group fold: EU (45 requested / 36 completed / 3 cancelled / 9 backlog), APAC (37 / 29 / 3 / 8) and US (19 / 15 / 1 / 4) survive the live-cancellation-tail rule while LATAM's clean 0 drops out. ORDER BY cancelled DESC, requested DESC lands EU on top deterministically — and the direction matters here, because ASC would open the shift with the quietest region. The distractors encode the shift-ending failures: 'shipped' in the cancelled slot counts the 30 healthy shipped-status rows; IS NOT NULL inverts the backlog into a success report; the gate at 4 returns an empty queue and a very quiet night; and SUM(*) is a syntax error — the census dies before it starts. Note completed + backlog = requested per region (36 + 9 = 45): that identity is the census's built-in audit.",
    },
    {
      id: "cs-didi-3",
      tier: "medium",
      topic: "t3",
      universe: "month-close",
      title: "Completion-latency close, region by region",
      brief:
        "DiDi-flavored case on the storefront db (orders = trip requests, shipped_at = trip completion timestamp): the month-close review opens with the honest latency number, and honesty starts with the population — completed trips only, the 82 of 103 requests that carry a completion timestamp (52 delivered-status + 30 shipped-status); the 14 pending and 7 cancelled have no completion to lag from. Probed region reads: LATAM 2 completed trips averaging 3.50 days, US 15 at 3.07, EU 36 at 2.94, APAC 29 at 2.93 — against a fleet average of 2.98 days over a 2-to-4 range. The gate is fixed before the query: only regions with at least 2 completed trips field a measurable latency sample (LATAM's two-trip sample is the floor), worst region on top.",
      ask: "Return one row per region: region, completed trips, average request-to-completion lag in days (2dp) — measurable samples only, worst on top.",
      template:
        "SELECT c.region,\n       COUNT(*) FILTER (WHERE o.shipped_at {1} NULL) AS completed,\n       {2}(AVG(JULIANDAY(o.shipped_at) - JULIANDAY(o.created_at)), 2) AS avg_days\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.shipped_at IS NOT NULL\nGROUP BY c.region\nHAVING COUNT(*) FILTER (WHERE o.shipped_at IS NOT NULL) >= {3}\nORDER BY avg_days {4};",
      slots: [
        {
          answer: "IS NOT",
          kind: "keyword",
          label: "the completed-population guard",
          why: "The FILTER arm counts trips that HAVE a completion timestamp: shipped_at IS NOT NULL — 82 fleet-wide (52 delivered + 30 shipped). IS would count the 21 rows without one (14 pending + 7 cancelled), turning the latency sample into the backlog census.",
        },
        {
          answer: "ROUND",
          kind: "keyword",
          label: "the display-edge wrapper",
          why: "AVG(JULIANDAY delta) is a float; the report cell is ROUND(..., 2) — LATAM 3.50, US 3.07, EU 2.94, APAC 2.93. MIN(...) would clamp every region to 2.0, and CAST(..., 2) is not SQLite syntax — the query dies before the close.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the measurable-sample gate",
          why: "HAVING >= 2 keeps regions with a real latency sample: LATAM clears it at exactly 2 completed trips, so the gate's value appears in the result (LATAM's completed cell) and the census self-checks. A gate of 3 would amputate LATAM and hand the board a three-region story.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-first direction",
          why: "The close reads worst-on-top: descending latency puts LATAM (3.50) on row one and APAC (2.93) last. ASC would crown the fastest region as if it were the problem — a correct query aimed at the wrong end of the table.",
        },
      ],
      distractors: ["IS", "MIN", "CAST", "ASC", "3"],
      walkthrough:
        "A latency close where the population statement is the whole audit. The WHERE keeps only the 82 requests carrying a completion timestamp — 52 delivered-status plus 30 shipped-status; the 14 pending and 7 cancelled have no completion to lag from, so they leave the population by definition, not by accident. The fold rides per region: COUNT(*) FILTER (...) counts completed trips (LATAM 2, US 15, EU 36, APAC 29), and ROUND(AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)), 2) folds the request-to-completion lag — LATAM 3.50, US 3.07, EU 2.94, APAC 2.93, against the fleet-wide 2.98 over a 2-to-4 range. The HAVING >= 2 gate is a sample-size contract: LATAM's two-trip sample is the floor, and the gate value shows up in LATAM's own completed cell, so the query self-checks. ORDER BY avg_days DESC lands the worst region on top. The distractors encode the shift-ending failures: IS inverts the census (0 completed everywhere — the backlog wearing latency's name); MIN clamps every average to 2.0, hiding the LATAM outlier the review exists to discuss; CAST kills the query at parse time; ASC crowns APAC's 2.93 as if fastest were worst; and a gate of 3 amputates the one region the safety floor actually watches.",
    },
    {
      id: "cs-didi-4",
      tier: "easy",
      topic: "s6",
      universe: "pricing",
      title: "Service-tier fare-band census",
      brief:
        "DiDi-flavored case on the storefront db (products = service tiers): the pricing review wants the fare-band census — every tier classified budget, mid or premium in ONE CASE fold, then counted per band. The bands are policy, not vibes: budget is under 50, premium is 200 and up, mid is the middle; on the proxy catalog the split lands 8 budget tiers averaging 32.06 and 8 mid tiers averaging 111.5 — and the premium band is EMPTY, because the catalog tops out at 199.99. The report must show that hole honestly: the premium group simply doesn't form, and the census self-audits at 16 tiers total. Gate: bands fielding fewer than 8 tiers don't make the review.",
      ask: "Return one row per band: band label, tier count, average tier price (2dp) — priciest band on top.",
      template:
        "SELECT CASE WHEN p.price {1} 50 THEN 'budget'\n            WHEN p.price >= {2} THEN 'premium'\n            ELSE 'mid' END AS band,\n       COUNT(*) AS tiers,\n       ROUND(AVG(p.price), 2) AS avg_price\nFROM products p\nGROUP BY band\nHAVING COUNT(*) >= {3}\nORDER BY avg_price {4}, band;",
      slots: [
        {
          answer: "<",
          kind: "keyword",
          label: "the budget-band comparator",
          why: "Budget is price < 50 — strictly under. > or >= flips the fold: the 8 mid tiers get labeled budget (their average prints 111.5 under a budget label) and the bands swap names while the numbers stay put, which is worse than an error because it ships.",
        },
        {
          answer: "200",
          kind: "number",
          noVerify: true,
          label: "the premium-band floor",
          why: "The premium floor is policy: 200 and up. On this catalog it selects nothing — max tier price is 199.99 — so the premium group never forms and the census honestly reports two bands. A floor of 100 manufactures a 4-tier premium band and guts the mid band the review actually prices.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the review gate",
          why: "Bands fielding at least 8 tiers make the review — both real bands field exactly 8, so the gate value appears in the tiers column and the census self-checks. A gate of 9 empties the report; 16 would demand the whole catalog in one band.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the priciest-first direction",
          why: "The review reads priciest-band-on-top: descending average price puts mid (111.5) over budget (32.06). ASC inverts the read and opens the deck with the cheapest band — right query, wrong end.",
        },
      ],
      distractors: [">", ">=", "100", "50", "ASC", "9"],
      walkthrough:
        "One CASE, one scan, three possible bands — and the honest result is two. The fold labels every tier in place: price < 50 to budget (8 tiers, average 32.06), 50 to 199.99 to mid (8 tiers, average 111.5), and 200-plus to premium — a group that never forms because the catalog's ceiling is 199.99, so the report ships two rows and the premium hole is the finding, not a bug. The HAVING >= 8 gate is calibrated to the bands' real rosters (both field exactly 8, so the gate value is visible in the tiers column), and ORDER BY avg_price DESC opens the review with mid. The distractors encode the pricing-review failures: > or >= relabels the mid tiers as budget — same numbers, swapped names, a silent misreport that passes a numeric spot-check; a 100 premium floor manufactures a 4-tier premium band averaging 149.5 and a 12-tier budget averaging 45.87, destroying the mid band the review prices; a 50 floor moves the entire mid band into premium; the gate at 9 returns an empty census and a very quiet pricing meeting; and ASC opens the deck with the budget band. The audit identity: 8 + 8 = 16 tiers — a census that sums to the catalog count.",
    },
    {
      id: "cs-didi-5",
      tier: "hard",
      topic: "j4",
      universe: "supplier",
      title: "Fleet-partner settlement coverage census",
      brief:
        "DiDi-flavored case on the storefront db (invoices = fleet-partner settlement lines, payments = settlement receipts, INTEGER cents so the display edge divides by 100.0): the supplier-audit memo asks which settlement lines haven't cleanly settled, because the books tie only when every line does — 28 lines on file, 21 paid, 6 open, 1 void. Coverage is a LEFT JOIN fold: attach each line's payments, count them, and classify — zero payment rows means 'no payment', paid-but-under-amount means 'partial', everything else settled exact. Probed state: the partial is line 25 at 4,000 of 6,148; six lines carry zero payments worth 15,217 combined — including line 28, which is status-paid with no payment rows at all. The reconciliation queue is the non-exact lines, worst label first, capped at the 7 lines the team clears this cycle.",
      ask: "Return the reconciliation queue: line id, status, amount (2dp), payment rows, coverage label — non-exact lines first, capped at 7.",
      template:
        "SELECT i.id,\n       i.status,\n       ROUND(i.amount_cents / {1}, 2) AS invoice_amount,\n       COUNT(p.id) AS payment_rows,\n       CASE\n         WHEN COUNT(p.id) = 0 THEN 'no payment'\n         WHEN SUM(p.amount_cents) {2} i.amount_cents THEN 'partial'\n         ELSE 'exact'\n       END AS coverage\nFROM invoices i\n{3} JOIN payments p ON p.invoice_id = i.id\nGROUP BY i.id\nORDER BY coverage {4}, i.id\nLIMIT {5};",
      slots: [
        {
          answer: "100.0",
          kind: "keyword",
          label: "the cents-to-dollars divisor",
          why: "amount_cents is an INTEGER-cent column: the display edge divides the FOLD by 100.0 — the .0 forces real division. /1 leaves raw cents (line 25 prints 614800), /1000 is a decimal slip, and the conversion belongs at the edge, not inside the fold.",
        },
        {
          answer: "<",
          kind: "keyword",
          label: "the partial-settle comparator",
          why: "Partial means paid-but-under: SUM(payments) < amount. <= would relabel every fully-settled line as partial (paid exactly equals owed there), flooding the queue with 21 clean settles and burying the real exception.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the settlement-line spine",
          why: "The line is the spine: LEFT JOIN keeps all 28 settlement lines and lets the 6 with zero payments survive as 'no payment'. INNER silently drops exactly those 6 — the audit would ship missing its whole exceptions list.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-label-first direction",
          why: "Coverage labels sort alphabetically, so descending puts partial before no payment before exact — the exceptions lead the queue and the LIMIT cuts clean settles. ASC would open the queue with seven perfectly settled lines.",
        },
        {
          answer: "7",
          kind: "number",
          noVerify: true,
          label: "the queue cap",
          why: "The team clears 7 lines this cycle — and the query returns exactly 7: line 25 partial plus the 6 zero-payment lines (ids 18, 21, 24, 26, 27, 28). The cap is a workflow constant, which is why it's flagged no-verify; the census itself is verified.",
        },
      ],
      distractors: ["INNER", "ASC", "<=", "1", "1000"],
      walkthrough:
        "A supplier-audit census where the LEFT JOIN is the honesty mechanism. The spine is invoices — all 28 settlement lines — LEFT JOINed to their payments and folded per line: payment_rows counts receipts (0, 1 or 2 on this book), and the CASE classifies coverage in one pass — zero rows to 'no payment', SUM under amount to 'partial', else 'exact'. The probed state: 21 exact, 6 no-payment (ids 18, 21, 24, 26, 27, 28 — worth 15,217 combined, and id 28 is status-paid with no receipts, the reconciliation anomaly), 1 partial (id 25: 4,000 of 6,148). ORDER BY coverage DESC leads with the partial, then the no-payment lines by id, and LIMIT 7 returns precisely the exception queue the memo capped. The distractors encode the audit-killing failures: INNER drops the 6 zero-payment lines — the queue becomes partial-plus-clean-settles, missing its entire point; ASC opens the queue with seven perfectly settled lines; <= relabels every settled line as partial (paid equals owed satisfies <=), flooding the queue; /1 prints raw cents (614800 on line 25) and /1000 divides by a thousand; and a cap of 1 truncates the queue to the partial line alone. Note the built-in audit: 21 + 6 + 1 = 28 lines, and the ledger tie-out only closes when every line reads exact.",
    },
    {
      id: "cs-didi-6",
      tier: "medium",
      topic: "q2",
      universe: "growth",
      title: "Regions above the fleet-average fare",
      brief:
        "DiDi-flavored case on the storefront db (orders = trip requests, customers = driver-partners' regions): the growth board wants the fare-mix read — which regions price above the fleet-wide average trip fare, computed against the scalar, not eyeballed. Probed census: 103 trips averaging 338.19 fleet-wide; by region EU 45 trips at 335.32, APAC 37 at 313.66, US 19 at 383.48, LATAM 2 at 426.22. Two regions clear the bar and two sit just under — close enough that the comparison must be computed, which is what the scalar subquery is for. Population gate: a region needs at least 2 trips to make the board (LATAM's two-trip sample is the floor), priciest region on top.",
      ask: "Return one row per qualifying region: region, trips, average fare (2dp), fleet average (2dp) — above-average regions only, priciest first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS trips,\n       ROUND(AVG(o.total), 2) AS avg_fare,\n       (SELECT ROUND(AVG(total), 2) FROM orders) AS fleet_avg\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING AVG(o.total) {1} (SELECT AVG(total) FROM orders)\n   AND COUNT(*) >= {2}\nORDER BY avg_fare {3};",
      slots: [
        {
          answer: ">",
          kind: "keyword",
          label: "the above-average comparator",
          why: "The memo says above the fleet average: AVG(o.total) > (SELECT AVG(total) FROM orders). < answers the mirror memo (regions under the bar — EU and APAC), and = returns nothing because no region sits exactly on the 338.19 fleet average.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the sample-size gate",
          why: "Regions need at least 2 trips to make the board: LATAM clears it at exactly 2, so the gate value appears in LATAM's own trips cell and the read self-checks. A gate of 3 amputates LATAM and hands the deck a one-region story; 10 empties it.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the priciest-first direction",
          why: "The board reads priciest-on-top: descending average fare puts LATAM (426.22) over US (383.48). ASC would lead with the cheapest qualifying region — right query, wrong headline.",
        },
      ],
      distractors: ["<", "=", "ASC", "3", "10"],
      walkthrough:
        "A fare-mix read where the scalar subquery IS the benchmark. The outer query folds trips per region (COUNT(*), AVG(o.total) rounded at the edge), and two scalar subqueries stamp the fleet benchmark: one in SELECT as a display column (338.19), one in HAVING as the gate — AVG(o.total) > (SELECT AVG(total) FROM orders). The probed result: LATAM (2 trips, 426.22) and US (19 trips, 383.48) clear the bar; EU (45, 335.32) and APAC (37, 313.66) sit just under — which is why the comparison is computed: the gaps are small enough that a chart eyeball gets them wrong. The AND COUNT(*) >= 2 gate keeps LATAM's two-trip sample in play while declaring its mass. The distractors encode the board-meeting failures: < answers the mirrored memo (EU and APAC print instead); = returns zero rows because no region's average equals the fleet's to the cent; the gate at 3 amputates LATAM — the board reads a one-region story; a gate of 10 empties the deck; and ASC hands the priciest-first headline to the cheapest qualifying region. Grain note: the scalars run over orders only — no fare-line join — so the fleet average stays at trip grain, matching the region folds it's compared against.",
    },
  ],

  problems: [
    { slug: "trips-and-users", why: "The canonical ride-hailing screen: cancellation share per city per day with banned accounts excluded — the exact denominator-and-exclusion drill behind DiDi's completion map and safety-flag triage. Theme-curated (0 tagged LC for DiDi)." },
    { slug: "hopper-company-queries-i", why: "Ride-hailing's own LC series: drivers active per reporting period — the driver-side activity census fleet ops opens with before any utilization read. Theme-curated." },
    { slug: "hopper-company-queries-ii", why: "Cancellation rate with exclusions by month — the honest-denominator drill where unbanned users and excluded trips move the rate, exactly the population discipline the safety floor demands. Theme-curated." },
    { slug: "hopper-company-queries-iii", why: "Cumulative monthly active drivers — the running-supply shape behind 'is driver supply growing or churning' at city grain. Theme-curated." },
    { slug: "number-of-times-a-driver-was-a-passenger", why: "Two-sided symmetry: how often supply-side people appear on the demand side — driver-partners as riders, a LEFT JOIN census DiDi's cross-side identity work runs on. Theme-curated." },
    { slug: "find-top-performing-driver", why: "The per-driver argmax fold — top performer by trips or fares at driver grain, the leaderboard problem in its purest form. Theme-curated." },
    { slug: "find-drivers-with-improved-fuel-efficiency", why: "Period-over-period driver-metric improvement — efficiency deltas per driver, the shape behind 'which partners got better this quarter' fleet reviews. Theme-curated." },
    { slug: "total-traveled-distance", why: "Conditional SUM over trip distances — folding distance by ride fate in one pass, the fare-lines-versus-trips grain drill with money swapped for kilometers. Theme-curated." },
    { slug: "top-percentile-fraud", why: "NTILE fraud tails — which accounts sit in the worst percentile of a risk score, the shape behind DiDi's risk-screening rolls. Theme-curated." },
    { slug: "duplicate-charge-pairs", why: "Double-charge detection over payment pairs — the refund-audit shape that keeps driver-settlement disputes short and riders un-billed twice. Theme-curated." },
    { slug: "structuring-detection", why: "Threshold-hugging behavior detection — amounts stacked just under reporting lines, the fraud-ops pattern DiDi's risk team probes in screens. Theme-curated." },
    { slug: "amount-anomaly-zscore", why: "Z-score anomaly framing on amounts — statistical outlier detection over settlement values, the quantitative safety-net read. Theme-curated." },
    { slug: "the-number-of-passengers-in-each-bus-i", why: "Capacity loading over a timeline — passengers versus vehicle seats, the supply-capacity shape behind DiDi Bus's load-factor reads. Theme-curated." },
    { slug: "find-overlapping-shifts", why: "Interval-overlap detection between shifts — which driver-partners' online windows collided with enforcement or maintenance windows. Theme-curated." },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER keep-latest with a deterministic tie-break — one row per trip from a retry-heavy event stream, the dedupe layer every DiDi dashboard stands on. Theme-curated." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Multi-service adoption logic — riders who used service A and B but never C, the cross-product behavior read that mirrors DiDi's Express-to-Premier upgrade funnels. Theme-curated." },
    { slug: "number-of-calls-between-two-persons", why: "Pair symmetry: (A,B) and (B,A) must count once — the canonical unordered-pair fold behind driver-rider contact audits and matched-ride dedupe. Theme-curated." },
    { slug: "average-selling-price", why: "ASP per service tier over a period: fare-line value folded against units in one weighted read — the fare-mix baseline every pricing review opens with. Theme-curated." },
    { slug: "active-businesses", why: "Multi-flag per-entity census: how many independent activity flags each account fires — the one-pass conditional-count shape behind per-driver activity counts (trips, online hours, safety flags). Theme-curated." },
    { slug: "user-activity-for-the-past-30-days-ii", why: "Trailing-window actives with an exclusion: who was active in the last 30 days but not the window before — the new-versus-retained split growth reviews run weekly. Theme-curated." },
    { slug: "last-person-to-fit-in-the-bus", why: "Running-sum capacity: riders loaded until the seat cap breaks — the greedy-cumulative shape behind DiDi Bus load-factor and seat-inventory reads. Theme-curated." },
    { slug: "market-analysis-i", why: "Two-sided market census: signups versus transacting users per side, stitched in one report — the registration-versus-activation gap DiDi's growth team reads at city launch. Theme-curated." },
    { slug: "game-play-analysis-v", why: "First-session retention per entity: each player's first day, same-day return, folded per cohort date — the driver-onboarding retention read (first-week completion) in its purest form. Theme-curated." },
    { slug: "find-the-team-size", why: "Per-entity partition size stamped on every row: each player's team size via window COUNT — the fleet-size-per-driver context stamp behind utilization benchmarking. Theme-curated." },
    { slug: "investments-in-2016", why: "Duplicate-attribute detection: same location and same amount across accounts — the collusion and duplicate-account pattern the risk team probes at settlement edges. Theme-curated." },
    { slug: "find-golden-hour-customers", why: "Two purchases within seven days: interval-pair matching per user — the early-engagement window (second ride inside a week) that predicts retention on both sides of the marketplace. Theme-curated." },
    { slug: "not-boring-movies", why: "Filter hygiene: odd ids plus an exclusion list, ordered — the mundane-but-loaded WHERE drill behind ops exclusion lists (suspended partners, flagged tiers). Theme-curated." },
    { slug: "employees-with-deductions", why: "Conditional COUNT DISTINCT: distinct people per condition without double-counting multi-row matches — the dedupe discipline behind per-driver trip counts on fan-out joins. Theme-curated." },
    { slug: "first-and-last-call-on-the-same-day", why: "MIN/MAX per day: first and last event timestamps folded per calendar day — the shift-boundary read behind driver online-window audits. Theme-curated." },
    { slug: "suspicious-bank-account-transactions", why: "Sliding-window alerting: three transactions inside a ten-minute frame per account — the velocity rule that powers DiDi's payment-fraud tripwires. Theme-curated." },
    { slug: "point-in-time-asof", why: "As-of join: each event matched to the latest prior state row — the driver-state-at-trip-time read (which commission tier, which suspension window) every forensic audit needs. Theme-curated." },
    { slug: "restaurant-growth", why: "7-day rolling average per day with NULL-honest edges: spend smoothed over a moving frame — the rolling-demand curve city ops charts every morning. Theme-curated." },
  ],
};
