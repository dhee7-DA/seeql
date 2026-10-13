// Uber — kit 1 of the Ride-hailing & Mobility domain (Batch C).
// The two-sided mobility marketplace: trips, driver supply, surge windows
// and ETAs — where every request is a timestamped row and every rate has a
// denominator an interviewer will ask about. Pool provenance: 17 tagged sql
// rows (Uber tags) drive 15 of the 16 problems and most topic slugs; the
// fills (trips-and-users, product-sales-analysis-ii, daily-leads-and-partners,
// students-and-examinations, number-of-times-a-driver-was-a-passenger,
// consecutive-available-seats, department-top-three-salaries,
// the-latest-login-in-2020, null-blank-audit, find-latest-salaries,
// second-highest-salary, weather-type-in-each-country,
// team-scores-in-football-tournament) are theme-curated to Uber's known
// screen themes. Case studies run on the storefront db with probed figures
// from scripts/company-facts.md, mapped honestly: orders = ride requests,
// customers = riders, products = ride tiers, suppliers = fleet partners,
// order_items = fare lines, shipped_at = completion timestamp.

import type { CompanyKit } from "../types";

export const uberKit: CompanyKit = {
  id: "uber",
  domainId: "mobility",
  name: "Uber",
  tagline: "Trips, drivers and the surge clock",
  accent: "text-green-400",

  brief: [
    "Uber is the world's largest mobility marketplace — the company that turned 'car arrives in minutes' into an expectation across **hundreds of cities**, and then kept stacking surfaces on the same trip event: ride tiers from **UberX to Comfort to XL**, upfront pricing, {amber:surge} multipliers, pool-style sharing, and the delivery and freight businesses that grew on top. The core object never changed: a trip request that is matched to a driver supply unit, priced, {emerald:completed} or {rose:cancelled}, and timestamped at every step. That means every analyst here works with rates whose denominators are contested (completion rate is completed trips ÷ REQUESTED trips — not ÷ matched, not ÷ completed), two-sided counts that blur unless you name the grain (trips versus riders versus drivers), and timestamp math (ETA, wait time, trip duration) that lives on text timestamps until you make it numeric.",
    "The data org is a hybrid of **centralized analytics and embedded teams**: city operations, marketplace (the matching and pricing engine), driver product, rider product, and the experimentation platform all read from lakehouse trip event streams. The operating rhythm is city-shaped — a regional ops lead opens the day with a {sky:completion-and-supply} dashboard, and 'why did APAC's completion share dip' is a question someone will be asked to answer in SQL before the second coffee. Freshness is a visible thing: {amber:surge} and supply heatmaps run near-real-time, while finance-adjacent reads (fare lines, partner settlements) run on a slower, reconciled cadence. The interviewer across the table has almost certainly owned a city-level metric through a surge spike, and their questions carry that weather.",
    "Interview style is marketplace-flavored and denominator-obsessed. A screen typically opens with a warm-up join (attach riders to their trips), escalates into a conditional aggregation with a status rule ({sky:completion rate} by region, {rose:cancellation share} by hour), then either a window question (rank cities by weekly trips, rolling 7-day actives) or a rate question where the trap is **integer division** or a `WHERE` clause that silently shrinks the denominator. Follow-ups are spoken out loud: 'does a cancelled request count in your denominator?', 'is that per trip or per rider?', 'what happens at 3am when no trips completed?'. Candidates who narrate grain, filter placement and denominator before writing SQL consistently outperform — the interviewers are listening for the habit.",
    "Preparation strategy: this kit leans on the **17 Uber-tagged sql rows** in the band — rate queries, confirmation-rate COALESCE reads, self-join process-time math, rank semantics, rolling-actives windows, keep-latest dedupe — plus a small theme-curated fill (trips-and-users, the canonical ride-hailing screen, leads the curated picks). The two case studies run on the live storefront db, mapped honestly onto mobility: `orders` are ride requests, customers are riders, products are ride tiers, suppliers are fleet partners, `order_items` are fare lines, and `shipped_at` is the completion timestamp. One case rebuilds the region {emerald:completion} map ops reviews open with; the other rebuilds the completion-latency read that feeds fleet-partner SLA conversations. Both are mechanically audited against the probed db figures.",
  ],

  dayInLife: [
    "**07:30 —** The day starts on the ops board — overnight trips versus requests, {sky:completion share} by region, {rose:cancellation} spikes by hour, driver supply versus demand on the heatmap. The first query is almost always a reconciliation: did the trip stream land completely, do request counts match the matching-service side, do fare-line sums tie to trip totals. The analyst who can write the two-sided diff query — which region lost rows, by how much, since when — is the one the city lead pings first. While the city wakes up, the {emerald:completion} map goes out: one row per region, trips, completed, completion share, **worst region on top**, because the intervention targets the worst region.",
    "**11:00 —** Midday is the deep-dive block. A completion dip in one region becomes a drill-down: split by hour, split by ride tier, split by supply — was it a demand burst, a driver-supply gap, or a matching regression? A {amber:surge}-window review needs the share of trips priced under a multiplier bucketed in one pass; an ETA question needs `JULIANDAY`-style timestamp math over completed trips only, with the population stated before the average. Every deep-dive ends the same way: the definition written next to the number — '*completion rate = completed ÷ requested, cancelled stays in the denominator*' — because a rate without its denominator is a rumor that survives until the ops review.",
    "**15:30 —** The afternoon tilts to stakeholder cycles. The weekly business review wants region leaderboards that tie honestly (two cities with the same trip count share a rung); the driver-earnings team wants per-driver aggregates at **driver grain, not trip grain**; growth wants rolling **7-day actives** where one rider's ten trips count once. Every ask arrives with a denominator question attached, and each deliverable ships with the definition printed beside the number.",
    "**18:30 —** The day closes in review mode. The city ops ritual holds — every headline number has a **named owner and a definition** — and the post-mortem culture treats a metric whose definition drifted mid-spike as an incident, not a footnote. The writeup goes out with the {emerald:completion} map attached and every rate's denominator printed beside it, because *Uber SQL exists to keep supply, demand and price honest in the same query, at the hour the spike happens.*",
  ],

  metrics: [
    { name: "Trips completed", what: "Ride requests that reached a completion timestamp. The status-aware count everything else hangs on — on this kit's proxy ledger, 82 of 103 requests carry a completion timestamp (52 delivered-status + 30 shipped-status), and the other 21 are the pending-plus-cancelled gap the ops floor watches." },
    { name: "Completion rate", what: "Completed trips ÷ REQUESTED trips. The marketplace health number: the denominator is all requests, cancelled and unfulfilled included, and the interviewer checks whether your WHERE clause shrank it." },
    { name: "Cancellation rate", what: "Cancelled requests ÷ requested, sliced by region and hour. Probed on this db: APAC 3 of 37 (8.1%) is the worst region, against EU 6.7%, US 5.3%, LATAM 0% — a conditional-count ratio with the denominator fixed before the ratio." },
    { name: "ETA / time-to-pickup", what: "Request-to-pickup latency on timestamp deltas. Measured over matched, completed trips only — the population statement IS the metric, and NULLs in the completion timestamp define who's out of scope." },
    { name: "Surge coverage", what: "Share of trips priced under a multiplier, bucketed low/mid/high in one CASE pass. The pricing-lens read that decides whether a spike was priced into the market or absorbed by it." },
    { name: "Driver utilization", what: "Trip-bearing hours ÷ hours online per driver. A two-grain ratio — trips and people — where COUNT(*) versus COUNT(DISTINCT driver_id) is the entire difference between a rate and a nonsense number." },
    { name: "Trips per active driver", what: "Trips folded per DISTINCT driver over a window. The supply-efficiency read city ops uses to argue for supply: the denominator must be drivers who worked, not drivers who signed up." },
    { name: "Weekly active riders", what: "COUNT(DISTINCT rider) over a trailing 7-day window. One rider's ten trips count once — the rolling-distinct discipline the rolling-7d-actives problem drills and the stickiness read the growth team lives by." },
  ],

  topics: [
    {
      name: "Trip-grain aggregation",
      why: "Everything at Uber starts by folding requests into per-region, per-hour, per-tier aggregates without letting cancelled demand pollute the total. The trap is grain drift: joining fare lines fans trips out, and COUNT(*) stops counting trips the moment the join lands.",
      slugs: ["average-selling-price", "percentage-of-users-attended-a-contest", "product-sales-analysis-ii"],
    },
    {
      name: "Completion & cancellation rates",
      why: "Completion rate is completed ÷ REQUESTED — the denominator is the whole test, and the 100.0-before-division habit is what keeps the share honest. Trips-and-users is the canonical ride-hailing screen here: cancellation share by city with exclusions, where one careless filter moves the denominator.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "trips-and-users"],
    },
    {
      name: "Two-sided market censuses",
      why: "'Trips AND riders per region' is the opening read of every ops review — and the trap is counting both at the same grain. COUNT(*) counts trip rows; COUNT(DISTINCT rider_id) counts people; the gap between the columns is the intensity signal city leads argue about.",
      slugs: ["market-analysis-i", "daily-leads-and-partners", "students-and-examinations"],
    },
    {
      name: "Trip-fate CASE logic",
      why: "Requested, completed, cancelled, unfulfilled — trip fate is a CASE branch inside a SUM, not four queries. Conditional counting over a 1/0 flag is how completion and cancellation shares fold at the same grain as COUNT(*), and the ELSE arm's width is the audit.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "capital-gain-loss"],
    },
    {
      name: "Pairing supply with demand (self-joins)",
      why: "Wait-time and duration questions pair two events of the same trip — request with completion, shift start with shift end — and that is a self-join with role-named aliases and an id ordering rule. Average-time-of-process-per-machine is this exact shape: paired timestamps folded to a duration.",
      slugs: ["average-time-of-process-per-machine", "number-of-times-a-driver-was-a-passenger", "consecutive-available-seats"],
    },
    {
      name: "Leaderboards & running capacity",
      why: "City leaderboards, top tiers by trips, running supply against a capacity bar — ranking windows and running sums. Last-person-to-fit-in-the-bus is the queue-capacity shape: a cumulative counter that trips over exactly where supply meets demand.",
      slugs: ["rank-scores", "last-person-to-fit-in-the-bus", "department-top-three-salaries"],
    },
    {
      name: "Rolling windows & stickiness",
      why: "Growth reads here are trailing-window reads: rolling 7-day actives, DAU/WAU stickiness, streak persistence across surfaces. COUNT(DISTINCT) inside a window frame, and the discipline of one-rider-counts-once, is the muscle these three drill.",
      slugs: ["rolling-7d-actives", "dau-wau-stickiness", "user-purchase-platform"],
    },
    {
      name: "As-of pricing & golden windows",
      why: "Surge means price is a function of time: which multiplier was in force at request moment is an as-of lookup, and 'first trip inside the golden hour' is a date-math cohort gate. Both are two-stage timestamp questions where the inner fold's population matters.",
      slugs: ["product-price-at-a-given-date", "find-golden-hour-customers", "the-latest-login-in-2020"],
    },
    {
      name: "Event-stream hygiene: dedupe & NULL policy",
      why: "Trip events double-fire and retry; completion timestamps are NULL until the trip ends. Keep-latest dedupe with a deterministic tie-break, plus a stated NULL policy — report, coalesce, or exclude with a reason — is the data-quality layer every dashboard here stands on.",
      slugs: ["keep-latest-dedupe", "null-blank-audit", "find-latest-salaries"],
    },
    {
      name: "Escalation shapes: subqueries & set ops",
      why: "Screens close with composed asks: above-average reads via scalar subqueries, CASE branches that classify, and set-op stacks that stitch two populations into one report. The escalation is composition — two grains in one query, no panic.",
      slugs: ["second-highest-salary", "weather-type-in-each-country", "team-scores-in-football-tournament"],
    },
  ],

  theory: [
    {
      id: "uber-t1",
      q: "Trips attach to riders on one key and to fleet partners through a two-hop chain. When do you insist on a LEFT JOIN in a marketplace read, and what does an INNER join silently drop?",
      a: "The join follows the spine of the question. If the question is trip-shaped — completion share, fare mix, ETA — the trip table is the spine and INNER joins that attach rider and tier attributes are right, because every unmatched row would distort a rate built on trip counts. If the question is supply-shaped — which fleet partners had vehicles online that never served a trip this week — the partner table is the spine and LEFT JOIN + IS NULL is the only honest shape: INNER would drop exactly the partners you're hunting for. The marketplace-specific discipline is doing both directions deliberately: demand reads join from trips outward, supply reads join from supply inward, and 'which side is the spine' is a sentence you say out loud before the FROM clause. On this kit's proxy ledger every request resolves to a rider and every fare line to a tier, so INNER and LEFT coincide — which is precisely why the interviewer asks you to reason about the shape instead of leaning on the data to save you.",
      tag: "joins",
    },
    {
      id: "uber-t2",
      q: "Rank city regions by weekly trips. Where do RANK, DENSE_RANK and ROW_NUMBER disagree, and which one do you hand the ops floor?",
      a: "They disagree exactly where trips tie. RANK gives both tied cities the same rung and skips the next (1, 2, 2, 4) — the gap implies a missing city that doesn't exist. DENSE_RANK gives the tie the same rung and keeps the sequence compact (1, 2, 2, 3) — ties share a rung, no phantom gaps. ROW_NUMBER splits the tie arbitrarily (1, 2, 3, 4) unless you add a deterministic tie-breaker like region_id, which makes it the dedupe tool, not the leaderboard tool. The ops floor gets DENSE_RANK: city rankings are read as 'who's nth', and a skipped rung generates a meeting about a city that was never there. The LIMIT-1-OFFSET-1 'second place' habit breaks on every tie — the honest second place is DENSE_RANK = 2, and if two cities share it, the business decision is 'both', not 'whichever the engine sorted first'. At Uber this matters because trip counts tie constantly at weekly grain, and the rank trio is a business decision about who shares a rung.",
      tag: "windows",
    },
    {
      id: "uber-t3",
      q: "On a trips table — 103 requests, 82 with a completion timestamp, 16 distinct riders — narrate what COUNT(*), COUNT(completion_ts) and COUNT(DISTINCT rider_id) each return.",
      a: "Three numbers, three grains, all true at once. COUNT(*) is 103 — every request row, the denominator grain of completion rate. COUNT(completion_ts) is 82 — the completed subset, because COUNT skips NULLs; that column is the numerator grain, and the gap between 103 and 82 IS the unfulfilled-plus-cancelled picture (14 pending, 7 cancelled on the proxy ledger). COUNT(DISTINCT rider_id) is 16 — repeat requests folded back to people, the audience grain. The mobility trap is reporting one grain under another's name: 'completion rate' computed as COUNT(completion_ts)/COUNT(DISTINCT rider_id) mixes numerator and audience grains and produces a number above 100% the moment a rider takes three trips. The strong answer assigns a grain to each form out loud — rows, non-null rows, distinct entities — and refuses to let them blur. That two-grain habit is the single most-drilled reflex in this kit.",
      tag: "aggregation",
    },
    {
      id: "uber-t4",
      q: "The completion timestamp is NULL until the trip ends. What is your NULL policy for a completion-latency metric, and what does AVG do about the NULLs whether you ask or not?",
      a: "AVG ignores NULLs silently — so AVG(completion_ts - request_ts) over ALL trips is already 'average latency of completed trips', a population chosen by NULL semantics rather than by you. The policy is to make that choice explicit, out loud: latency exists only for completed trips, so filtering the NULLs in WHERE is correct — and then the report's subtitle says so. Three behaviors to narrate: in filters, NULL fails both = and != comparisons, so 'completion_ts < cutoff' silently drops in-flight trips (sometimes right — they have no latency YET); in joins, NULL keys never match; in aggregates, COUNT(col) skips them while COUNT(*) keeps the row. What you never do is COALESCE a fake zero into the latency column to 'fix' it — a pending trip with zero latency reads as instant matching in the ops review, which is worse than a hole. Guard the population, not the decoration: define who has latency, state it, and let NULL mean 'not yet' rather than laundering it into a number somebody will act on.",
      tag: "nulls",
    },
    {
      id: "uber-t5",
      q: "'Regions whose completion rate fell below 80%' — WHERE or HAVING, and why can't the other clause see the rate at all?",
      a: "HAVING, because the completion rate is a group fact: it exists only after GROUP BY region folds the requests and the conditional SUM divides by COUNT(*). Logical evaluation runs FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — WHERE executes before groups form, so the rate literally does not exist yet; the engine throws 'no such column', and that error is the pipeline order teaching itself. The split that predicts every placement: row predicates in WHERE (status = 'cancelled', region = 'APAC' — filters that shrink the fold's input), group predicates in HAVING (rate thresholds, COUNT floors — filters that keep or kill folds). The one subtlety worth saying out loud: pushing the cancelled-row exclusion into WHERE would be a definition change, not an optimization — it would shrink the rate's denominator to completed-only trips and every region's rate would read 100%. Filter rows before the fold, filter groups after, and never let a WHERE do a HAVING's definitional work.",
      tag: "pipeline",
    },
    {
      id: "uber-t6",
      q: "You need trips priced above the marketplace average. Walk me through the scalar subquery contract — and what happens on a filtered staging table where the inner query returns empty.",
      a: "A scalar subquery is contractually one column, zero-or-one rows. One row: its value joins the comparison — SELECT ... WHERE total > (SELECT AVG(total) FROM orders) runs the fold once, and the outer query keeps the above-average trips. Zero rows: it yields NULL, not an error, and total > NULL is UNKNOWN — the report ships empty with no complaint, which is the dangerous outcome on filtered staging tables (one city, one surge window, one tier) where the inner fold legitimately can come back empty. Two follow-ups separate seniors: the correlated cousin — WHERE o.total > (SELECT AVG(i.total) FROM orders i WHERE i.region = o.region) — re-runs per outer row and answers 'above MY region's average', a different question with a real cost profile; and the NULL-poisoning rule that NOT IN over a nullable inner list empties everything, while EXISTS or a LEFT JOIN anti-join survives. Saying which population the inner fold covers, and what happens when it's empty, is exactly what this follow-up is fishing for.",
      tag: "subqueries",
    },
    {
      id: "uber-t7",
      q: "Trip events carry TEXT timestamps. How do you bucket them by month, diff them into durations, and window a surge night — and where does each approach break?",
      a: "Three tools, three caveats. Buckets: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on fixed-width ISO text — gives the month spine; the SUBSTR shortcut breaks the moment the format drifts off ISO, and '%m' alone merges January 2024 with January 2025 into one bucket. Durations: JULIANDAY(completion_ts) - JULIANDAY(request_ts) returns fractional days — the proxy ledger's 2.98-day average completion latency is exactly that, rounded once at the end, never per row. Windows: half-open intervals — request_ts >= '18:00' AND < '22:00' — never BETWEEN on the end boundary, which drops the surge window's last minutes, the highest-priced minutes of the night. The deeper break: these strings carry no timezone contract, and the NULL completion timestamp means every duration fold needs its population stated first — completed trips only. State the convention and the population, then query; never the reverse.",
      tag: "dates",
    },
    {
      id: "uber-t8",
      q: "Trip event streams double-fire on retries. How do you dedupe to one row per trip without losing the latest state — and how do you prove the dedupe didn't eat real trips?",
      a: "Two moves, then the proof. Detection: GROUP BY trip_id HAVING COUNT(*) > 1 is the cheapest duplicate census in SQL — run it before anything else and put the number in the ticket. Collapse: ROW_NUMBER() OVER (PARTITION BY trip_id ORDER BY event_at DESC, event_id DESC) = 1 keeps the latest state per trip, and the event_id tie-break is the part interviewers wait for — two events sharing a timestamp is the norm on retry storms, and without the tie-break 'latest' is engine-arbitrary. But collapsing is a decision, not a default: if the stream carries genuine state transitions (requested → matched → completed), folding them loses the funnel — so first ask whether the duplicates are retries of the SAME state or DISTINCT states, and keep the transitions if the funnel needs them. The proof is two counts: COUNT(*) before versus after, and COUNT(*) versus COUNT(DISTINCT trip_id) — if they diverge unexpectedly, the dedupe ate real trips. Cheap, boring, run every time; that's what makes it a habit instead of a hope.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "uber-mcq-1",
      prompt: "The requests table holds 103 trips from 16 riders. Which pair of counts belongs on the ops board's 'trips / riders' census?",
      choices: [
        "COUNT(*) and COUNT(DISTINCT customer_id)",
        "COUNT(*) and COUNT(customer_id)",
        "COUNT(DISTINCT customer_id) and COUNT(*)",
        "COUNT(*) twice — trips and riders are the same grain",
      ],
      answer: 0,
      why: "COUNT(*) counts trip rows (103); COUNT(DISTINCT customer_id) folds repeat trips back to people (16). The gap — 6.4 trips per rider — is the intensity signal the two-grain census exists to expose.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) skips only NULLs; with a NOT NULL FK it counts 103 too. DISTINCT is the fold, not NULL-skipping." },
        { choice: 3, why: "Trips and riders are different grains — 103 versus 16. Asserting they're the same is how a census loses the repeat-rider signal entirely." },
      ],
      difficulty: "easy",
    },
    {
      id: "uber-mcq-2",
      prompt: "82 of 103 requests carry a completion timestamp (52 + 30 completed). Which expression computes the completion rate, 79.6%?",
      choices: [
        "100 * COUNT(completion_ts) / COUNT(*)",
        "100.0 * SUM(CASE WHEN status IN ('delivered','shipped') THEN 1 ELSE 0 END) / COUNT(*)",
        "COUNT(completion_ts) / COUNT(*) * 100.0",
        "AVG(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) * 100",
      ],
      answer: 1,
      why: "The conditional SUM counts the completed set at the same fold where COUNT(*) holds all requests, and 100.0 forces real division: 82/103 = 79.6%. Both guards — same-grain denominator, float promotion — in one expression.",
      notes: [
        { choice: 0, why: "INTEGER 100 first means integer division: 82/103 truncates to 0 before any multiplication. Every sub-1% share would print 0 — the classic silent bug." },
        { choice: 3, why: "That counts only the 'delivered' half of the completed set (50.5%) — the 30 shipped-status completions fall out. Define the completed set once and reuse it." },
      ],
      difficulty: "medium",
    },
    {
      id: "uber-mcq-3",
      prompt: "AVG(JULIANDAY(completion_ts) - JULIANDAY(request_ts)) over ALL 103 requests returns 2.98. What population did AVG silently choose?",
      choices: [
        "All 103 requests — NULLs count as zero duration",
        "The 82 rows with a completion timestamp — AVG skips NULL inputs",
        "Only cancelled requests — they end the funnel",
        "It returns NULL — one NULL poisons the whole aggregate",
      ],
      answer: 1,
      why: "Aggregates ignore NULL inputs: the 2.98-day average runs over the 82 completed trips only. That IS the right population for latency (uncompleted trips have no latency yet) — but it must be stated, because the query never said it.",
      notes: [
        { choice: 0, why: "NULLs are never zeros in aggregates — zero-latency bugs come from COALESCE-ing the column, not from AVG itself. A coalesced pending trip reads as instant matching." },
        { choice: 3, why: "AVG returns NULL only when EVERY input is NULL. With 82 real latencies present, a real average comes back — over a silently-shrunk population." },
      ],
      difficulty: "easy",
    },
    {
      id: "uber-mcq-4",
      prompt: "promo.rider_id is nullable. Why is `WHERE r.id NOT IN (SELECT rider_id FROM promo_claims)` dangerous for the 'riders who never claimed' read?",
      choices: [
        "It's slower than a LEFT JOIN anti-join",
        "One NULL rider_id in the claim list empties the entire result — permanently",
        "It converts NULL rider ids to zero, matching nobody",
        "It ignores duplicate rider ids in the claim list",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE — the comparison is UNKNOWN and NOT UNKNOWN is still UNKNOWN. One stray NULL silently returns zero rows while the query looks reasonable. NOT EXISTS or LEFT JOIN + IS NULL is the NULL-proof anti-join.",
      notes: [
        { choice: 0, why: "Performance is secondary; the failure is CORRECTNESS — an empty promo-eligibility report that ships looking valid. NULL poisoning is a logic bug, not a speed one." },
        { choice: 2, why: "NULLs don't convert to anything — they poison the membership test itself. The result is empty, not zero-filled; that's what makes it dangerous." },
      ],
      difficulty: "hard",
    },
    {
      id: "uber-mcq-5",
      prompt: "Cancellations by region: EU 3 of 45, APAC 3 of 37, US 1 of 19, LATAM 0 of 2. Which query returns the single worst region by cancellation share — and which region is it?",
      choices: [
        "GROUP BY region HAVING COUNT(*) > 1 — EU, biggest volume",
        "GROUP BY region, compute 100.0*SUM(cancelled-flag)/COUNT(*), ORDER BY ... ASC, LIMIT 1 — APAC at 8.1%",
        "WHERE status = 'cancelled' GROUP BY region ORDER BY COUNT(*) DESC LIMIT 1 — ties EU and APAC at 3",
        "GROUP BY region ORDER BY COUNT(*) DESC LIMIT 1 — APAC, most cancellations",
      ],
      answer: 1,
      why: "Share is a group fact: the CASE-SUM numerator over the COUNT(*) denominator of ALL placed requests, sorted ascending, cut to one — APAC 3/37 = 8.1%, worst despite tying EU on raw counts (3 each). The denominator is the metric.",
      notes: [
        { choice: 2, why: "Filtering cancelled first shrinks the denominator to the numerator's population — every surviving region reads 100%, and the tie at 3 breaks arbitrarily. Denominator drift, the ride-hailing report killer." },
        { choice: 3, why: "Raw counts ignore exposure: EU's 3 cancels came from 45 requests, APAC's from 37. Without the share, the intervention targets volume, not risk." },
      ],
      difficulty: "medium",
    },
    {
      id: "uber-mcq-6",
      prompt: "The Friday surge window is 18:00:00 to 22:00:00 inclusive of every second before 22:00. Which WHERE clause captures it completely?",
      choices: [
        "WHERE request_ts BETWEEN '18:00:00' AND '22:00:00'",
        "WHERE request_ts >= '18:00:00' AND request_ts < '22:00:00'",
        "WHERE STRFTIME('%H', request_ts) >= '18'",
        "WHERE request_ts LIKE '18%' OR request_ts LIKE '19%'",
      ],
      answer: 1,
      why: "The half-open interval [18:00, 22:00) admits every timestamp up to 21:59:59.999 — '21:59:59' < '22:00:00' is TRUE. Surge windows live and die on this shape: BETWEEN with a 22:00 bound drops nothing at exactly 22:00:00 only if the column has no sub-second component — and on real event streams, it does.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive both ends — a 22:00:03 request slips in, or a 21:59:59.7 timestamp exceeds the string bound and vanishes. The most expensive minutes of the window are the boundary ones." },
        { choice: 2, why: "The '%H' bucket keeps 18:00 through 21:59 but also everything on OTHER days — the date predicate is missing entirely. Hour buckets need the day bound too." },
      ],
      difficulty: "medium",
    },
    {
      id: "uber-mcq-7",
      prompt: "Two regions tie at 37 weekly trips; the next has 19. DENSE_RANK() OVER (ORDER BY trips DESC) assigns the 19-trip region rank…",
      choices: ["1", "2", "3", "4"],
      answer: 1,
      why: "DENSE_RANK gives both tied regions rank 1 and the next distinct value rank 2 — compact, no gaps. RANK would say 3 (tie shared, gap kept); ROW_NUMBER would split the tie 1/2 and hand 19-trips rank 3 arbitrarily.",
      notes: [
        { choice: 2, why: "That's RANK's answer — ties share 1, the next jumps to 3. The phantom gap makes the ops floor hunt for a missing second-place region." },
        { choice: 3, why: "Ranks reach 3 with three distinct values here (1, 1, 2 densely). Four would need four distinct trip counts." },
      ],
      difficulty: "hard",
    },
    {
      id: "uber-mcq-8",
      prompt: "Trips join to fare lines: 103 requests fan out to 251 fare rows. On the joined result, which count still counts TRIPS?",
      choices: [
        "COUNT(*) — it always counts the primary entity",
        "COUNT(DISTINCT o.id) — folding the fan-out back to the trip grain",
        "COUNT(o.id) — NULLs are skipped automatically",
        "SUM(o.id) — ids sum to the row count",
      ],
      answer: 1,
      why: "After the fan-out, only COUNT(DISTINCT o.id) folds fare lines back to trips — COUNT(*) counts 251 rows. COUNT(o.id) skips only NULLs; with a NOT NULL key it counts 251 too.",
      notes: [
        { choice: 0, why: "COUNT(*) counts ROWS of the joined result — the fan-out IS the result. 'Primary entity' is a hope, not semantics; DISTINCT is the fold." },
        { choice: 3, why: "SUM over ids is a meaningless number that happens to be huge. Sanity-check magnitude: trip counts are smaller than fare-line counts, never larger." },
      ],
      difficulty: "easy",
    },
    {
      id: "uber-mcq-9",
      prompt: "A per-hour trip fold has hour ties (three hours at 8 trips each). In SUM(trips) OVER (ORDER BY trips DESC), what does the running total at the FIRST 8-trip row include?",
      choices: [
        "Just that one row — running totals add row by row",
        "All three 8-trip hours — the default frame is RANGE, and peers ride together",
        "The whole table — an unordered window is global",
        "Nothing — window sums require an explicit ROWS BETWEEN",
      ],
      answer: 1,
      why: "The default frame with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes ordering PEERS — the running total jumps by 24 at the first 8-trip hour. ROWS BETWEEN … CURRENT ROW counts one row. The frames disagree exactly where ties exist, which is every leaderboard.",
      notes: [
        { choice: 0, why: "That's the ROWS frame's behavior — and it takes an explicit ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW to get it. The default is RANGE-with-peers." },
        { choice: 3, why: "Windows work fine without explicit frames — they silently pick RANGE, which is precisely the surprise. State the frame; don't inherit it." },
      ],
      difficulty: "hard",
    },
    {
      id: "uber-mcq-10",
      prompt: "You LEFT JOIN from a cities table so newly launched zero-request cities survive the fold. What does the rate cell 100.0 * SUM(flag)/COUNT(*) show for a city with zero requests?",
      choices: [
        "0 — an empty group computes to zero",
        "NULL — x/0 returns NULL in SQLite, an honest hole in the report",
        "100 — the CASE flag sums to 0 and divides by 0 to 1",
        "An error — division by zero aborts the query",
      ],
      answer: 1,
      why: "An empty group folds to COUNT(*) = 0 and SUM(flag) = NULL, so the ratio is NULL/0 = NULL — SQLite returns NULL for x/0, no crash. The cell is an honest hole; the policy decision (drop the city, NULLIF-guard, or COALESCE at the display edge) is a conversation, not a default.",
      notes: [
        { choice: 0, why: "COALESCE-ing to 0 mid-pipeline launders the hole into a fake 'perfect region' — a zero completion rate reads as a data bug in the ops review. Guard, don't decorate." },
        { choice: 3, why: "SQLite never aborts on x/0 — it returns NULL quietly. That's worse than a crash: the report ships with a silent hole exactly where a launch city should be." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-uber-1",
      tier: "easy",
      topic: "j7",
      universe: "funnel",
      title: "The region completion map",
      brief:
        "Uber-flavored case on the storefront db (orders = ride requests, status delivered/shipped = completed): the ops review opens with the region completion map, and the definition is fixed before the query — completion share is completed requests ÷ ALL requested requests, cancelled and pending stay in the denominator. Probed facts: 103 requests, of which 82 carry a completion timestamp; by region EU 45 requests split 24 delivered / 12 shipped / 6 pending / 3 cancelled; APAC 37 split 21 / 8 / 5 / 3; US 19 split 5 / 10 / 3 / 1; LATAM 2, both delivered. The city lead wants the single worst region on top — one row — because the intervention targets one region, not four.",
      ask: "Return the one region with the lowest completion share: region, trips, completed, completion_pct, worst first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS trips,\n       SUM(CASE WHEN o.status {1} ('delivered','shipped') THEN 1 ELSE 0 END) AS completed,\n       100.0 * SUM(CASE WHEN o.status IN ('delivered','shipped') THEN 1 ELSE 0 END) / {2} AS completion_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY completion_pct {3}\nLIMIT {4};",
      slots: [
        {
          answer: "IN",
          kind: "keyword",
          label: "the completed-set membership",
          why: "The completed set is TWO statuses — delivered and shipped both carry a completion timestamp (52 + 30 = 82). IN expresses the set membership in one predicate; a single '=' would silently drop half the completions and halve every region's rate.",
        },
        {
          answer: "COUNT(*)",
          kind: "keyword",
          label: "the requested-requests denominator",
          why: "The denominator is ALL requests in the region — pending and cancelled included — which is COUNT(*) at the same fold the CASE-SUM rides on. COUNT(completed) errors (the alias isn't visible in its own SELECT list), and any smaller denominator flatters the rate.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the worst-first direction",
          why: "The intervention targets the WORST region, so ascending puts the lowest completion share on top. DESC would crown the healthiest region — a correct query aimed at the opposite end of the map.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the single-region cut",
          noVerify: true,
          why: "The ask is THE worst region — one row. LIMIT 1 keeps exactly that decision row; LIMIT 3 would hand the review a podium nobody requested.",
        },
      ],
      distractors: ["LIKE", "SUM(*)", "DESC", "3", "COUNT(completed)"],
      walkthrough:
        "A rate where the denominator is the whole test. The CASE flag turns the completed set into a 1/0 indicator; SUM adds the 1s (EU 36 of 45, APAC 29 of 37, US 15 of 19, LATAM 2 of 2) while COUNT(*) counts every request — same rows, same fold, no drift, cancelled stays in the denominator by construction. 100.0 before the division forces real arithmetic, and ORDER BY completion_pct ASC + LIMIT 1 lands the map on APAC — 29 completed of 37 requests, roughly 78.4%, the worst region despite US running more pending. The distractor that kills reports is any filter-first variant: WHERE status = 'cancelled' shrinks the denominator to the numerator's population and every region reads 100%. SUM(*) in the denominator slot is a syntax error (only COUNT takes the star), COUNT(completed) errors on its own alias, and DESC serves LATAM's perfect 2-of-2 — a region with two requests isn't a completion story, it's a rounding artifact pretending to be one.",
    },
    {
      id: "cs-uber-2",
      tier: "medium",
      topic: "t3",
      universe: "supplier",
      title: "Fleet-partner completion latency",
      brief:
        "Uber-flavored case on the storefront db (shipped_at = trip completion timestamp): the fleet-partner SLA review needs completion latency by region — how long from request to completion timestamp, averaged over trips that actually completed — slowest region first, because the vehicle-supply conversation starts where latency is worst. Probed facts: 82 of 103 trips carry a completion timestamp; overall latency averages 2.98 days with a 2-to-4-day range; by region LATAM 2 trips average 3.50, US 15 average 3.07, EU 36 average 2.94, APAC 29 average 2.93. The population rule is explicit: trips without a completion timestamp have no latency YET, and they stay out of scope — stated, not silent.",
      ask: "Return each region's completed-trip count and average completion latency in days (2 decimals), slowest region first.",
      template:
        "SELECT c.region,\n       {1}(*) AS completed_trips,\n       ROUND({2}(JULIANDAY(o.shipped_at) - JULIANDAY(o.created_at)), 2) AS avg_completion_days\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.shipped_at IS NOT {3}\nGROUP BY c.region\nORDER BY avg_completion_days {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the per-region trip counter",
          why: "COUNT(*) counts the rows folded into each region — the 82 completed trips split 36 / 29 / 15 / 2. SUM(*) doesn't exist, and MAX(*) would report one trip, not the region's completed volume the SLA table hangs on.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the mean-latency fold",
          why: "AVG over the JULIANDAY delta averages the completion latencies — 3.50 LATAM down to 2.93 APAC. MIN would report the fastest single trip (2.0), which is a rounding footnote, not a regional average.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the population guard",
          why: "IS NOT NULL keeps only trips with a completion timestamp — the population that HAS latency. Dropping the guard would let NULL deltas poison the average, and 'IS NOT TRUE' keeps only the NULL rows, returning an empty-looking census.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the slowest-first direction",
          why: "The SLA conversation starts with the worst: descending puts LATAM's 3.50 on top. ASC would open the review with APAC's 2.93 — the healthiest region — a correct query answering the opposite question.",
        },
      ],
      distractors: ["SUM", "MIN", "ASC", "TRUE", "DATEDIFF"],
      walkthrough:
        "A latency read where the population statement IS the metric. The WHERE IS NOT NULL guard keeps the 82 trips that carry a completion timestamp — uncompleted trips have no latency YET, and saying so out loud is the difference between a definition and a silent filter. JULIANDAY(completion) - JULIANDAY(request) yields fractional days, folded once per region and rounded at the END: LATAM 3.50 (2 trips — thin, and the walkthrough says so), US 3.07 (15), EU 2.94 (36), APAC 2.93 (29), against the 2.98 overall average and the 2-to-4 range. DESC puts the slowest region first, which is where the fleet-supply conversation starts. The traps the distractors encode: MIN instead of AVG crowns the single fastest trip as a 'regional average'; DATEDIFF is a MySQL reflex that doesn't exist in this engine; IS NOT TRUE inverts the guard and keeps only the NULL rows — a census of trips that never completed, all latencies NULL. Small-region averages ride on two rows: read LATAM with its count visible, never alone.",
    },
  ],

  problems: [
    { slug: "trips-and-users", why: "The canonical ride-hailing screen: cancellation share per city per day with banned accounts excluded — the exact denominator-and-exclusion drill this kit's completion map generalizes. Curated pick (no Uber tag on this row), included because it IS the interview." },
    { slug: "queries-quality-and-percentage", why: "Two rates folded in one pass with the 100.0-before-division fix — the honest-denominator muscle behind every completion and cancellation share Uber asks for. Tagged Uber." },
    { slug: "confirmation-rate", why: "LEFT JOIN acceptance share where unmatched IDs coalesce to zero — driver-acceptance reporting in textbook form, NULL policy included. Tagged Uber." },
    { slug: "immediate-food-delivery-ii", why: "Kept-share ratio where the denominator is the whole test — completion rate by city in textbook clothing. Tagged Uber." },
    { slug: "immediate-food-delivery-i", why: "The conditional-share warm-up: share of requests meeting a status rule on day one — the trip-fate CASE-SUM reflex. Tagged Uber." },
    { slug: "market-analysis-i", why: "Buyer-side census with a first-order subquery — riders whose first trip landed in the promo window, computed not asserted. Tagged Uber." },
    { slug: "average-selling-price", why: "Period-weighted pricing fold — a revenue-per-unit ratio where the weighting choice changes the answer, the surge-pricing follow-up in interview form. Tagged Uber." },
    { slug: "product-price-at-a-given-date", why: "As-of price lookup — which multiplier was in force at request moment, the surge history question. Tagged Uber." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the 1,1,3 vocabulary check before any city leaderboard ships. Tagged Uber." },
    { slug: "average-time-of-process-per-machine", why: "Paired timestamps self-joined into durations per unit — wait-time and trip-duration math in its cleanest form. Tagged Uber." },
    { slug: "last-person-to-fit-in-the-bus", why: "Running capacity: a cumulative counter crossing a threshold — the queue-and-supply shape ops analytics loves. Tagged Uber." },
    { slug: "rolling-7d-actives", why: "Trailing-window distinct counts — one rider's ten trips count once, the rolling-actives drill the growth team lives by. Tagged Uber." },
    { slug: "dau-wau-stickiness", why: "DAU over WAU stickiness in windows — engagement intensity for a marketplace whose demand is hourly. Tagged Uber." },
    { slug: "user-purchase-platform", why: "Streak persistence across two surfaces — rider behavior that survives context switches, streak windows and all. Tagged Uber." },
    { slug: "find-golden-hour-customers", why: "First-event timing gates — riders whose first trip landed inside the golden window, date math plus cohort definition. Tagged Uber." },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER keep-latest with a deterministic tie-break — one row per trip from a retry-heavy event stream. Tagged Uber." },
  ],
};
