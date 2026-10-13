// Lyft — kit 2 of the Ride-hailing & Mobility domain (Batch C).
// North America's #2 rideshare: ride-by-ride unit economics, driver earnings,
// Prime Time pricing and a finance-adjacent read on every fare. Pool
// provenance: the registry tags only 2 sql rows (rolling-7d-actives,
// scd2-build) — this pool is MOSTLY THEME-CURATED, and the kit says so in
// the brief: every problem mirrors a workflow Lyft screens are known to
// probe (economics ratios, rolling windows, SCD2 dimension history, refund
// and cancellation reads). Case studies run on the storefront db with probed
// figures from scripts/company-facts.md, mapped honestly: orders = ride
// requests, customers = riders, products = ride tiers, suppliers = fleet
// partners, order_items = fare lines, shipped_at = completion timestamp.

import type { CompanyKit } from "../types";

export const lyftKit: CompanyKit = {
  id: "lyft",
  domainId: "mobility",
  name: "Lyft",
  tagline: "Rideshare economics, ride by ride",
  accent: "text-fuchsia-400",

  brief: [
    "Lyft is **North America's second rideshare platform** — the company whose analytics culture is famous for asking, ride by ride, whether a trip made money. Where the bigger competitor asks 'how big is the network', Lyft's screens ask 'what did this ride cost, what did it earn, and who captured the margin' — driver earnings per hour online, {violet:Prime Time} multipliers on the fare, cancellation and refund leakage against completed rides. The core object is the same timestamped trip: a ride request that is matched, priced (often under a Prime Time multiplier), {emerald:completed} or {rose:cancelled}, and then settled — which means the SQL is a unit-economics query wearing a marketplace's clothes: rates with contested denominators, two-sided counts at two grains, and money math that must survive a finance review.",
    "The data org runs lean and economics-forward: marketplace and driver-supply analytics sit close to city operations, rider product, and a finance-adjacent group that reconciles fares, driver payouts and rider refunds. Dimensions carry history the way finance demands — a driver's terms, a tier's pricing, a region's supply status are **slowly-changing records**, and 'what did this look like AT REQUEST TIME' is a question the warehouse has to answer, not approximate. The operating rhythm is the weekly business review plus city-level ops cycles: {sky:completion} and supply dashboards in the morning, economics deep-dives at midday, and a culture where **the denominator is printed next to the metric or the metric doesn't ship**.",
    "Interview style is economics-flavored and precise about populations. A screen opens with a join warm-up (attach riders or ride tiers to trips), moves into conditional aggregation with a status rule ({sky:completion share}, {rose:cancellation share}, refund rate over completed rides), and escalates into either a window question (rank tiers by fare, rolling 7-day actives, SCD2 validity chains built with `LEAD`) or a ratio where **integer division** or a silent `WHERE`-filter is the trap. Follow-ups are spoken: 'is that per ride or per driver-hour?', 'does the refund denominator include cancelled rides?', 'which version of the price was in force that week?'. Candidates who state grain, filter placement and denominator before writing consistently outperform.",
    "Preparation strategy: the registry tags only **two sql rows** for Lyft (`rolling-7d-actives`, scd2-build) — so this pool is mostly theme-curated, and the kit says so honestly. Every problem mirrors a known Lyft screen theme: economics ratios, rolling rider windows, dimension history (SCD2 and as-of lookups), {orange:refund} and {rose:cancellation} conditional counts, and rank semantics for tier leaderboards. The two case studies run on the live storefront db, mapped honestly onto rideshare: orders are ride requests, customers are riders, products are ride tiers, suppliers are fleet partners, order_items are fare lines, `shipped_at` is the completion timestamp. One rebuilds the above-average fare read the economics team opens pricing reviews with; the other rebuilds the rider-concentration share read that goes into the board deck. Both are mechanically audited against the probed db figures.",
  ],

  dayInLife: [
    "**07:45 —** The day starts on the marketplace board — overnight ride requests versus completions, {rose:cancellation share} by region and hour, driver supply against demand, and the {violet:Prime Time} coverage read: how much of last night's fare volume priced under a multiplier. The first query is a reconciliation: request counts versus the matching service, fare-line sums versus trip totals, refund rows versus completed rides. The analyst who can write the two-sided diff — which region lost rows, since when, by how much — is the one the city lead pings. The morning deliverable is the {emerald:completion} map: one row per region, **worst share on top**, definition printed in the footer because somebody will ask whether cancelled rides were in the denominator.",
    "**11:30 —** Midday is the economics deep-dive. A fare-mix question becomes a per-tier fold with above-average reads staged through a scalar subquery; a driver-earnings ask is a **two-grain ratio** (earnings folded per driver, hours folded per driver, divided at driver grain — never averaged twice); a pricing history question is an as-of lookup against a versioned dimension. This is also where slowly-changing dimension work happens: building validity chains with `LEAD`, checking that no two validity windows overlap, and proving the rebuild with before-and-after counts. Every deliverable carries its population — '*latency over completed rides only*', '*refund rate over completed, not requested*' — because the finance review reads the WHERE clause as closely as the number.",
    "**15:00 —** The afternoon tilts to stakeholder cycles. The weekly business review wants tier leaderboards that tie honestly and **rider-concentration shares** that reconcile against the total; city ops wants rolling **7-day actives** where one rider's ten rides count once; the {orange:refund}-audit cycle wants conditional counts that reconcile to the census. Each ask is stated at a grain — tier, rider, census row — and the deliverable names its denominator before anyone asks.",
    "**18:00 —** The day ends in the rituals that make the numbers trustworthy: every headline number ships with its SQL attached, a metric whose definition drifted mid-week is retired on the spot, and SCD2 rebuilds go through review like code changes. The writeup for tomorrow is short and strict — the {emerald:completion} map, the fare fold, the refund census — each with its denominator printed. *The best-prepared candidate knows the rhythm: Lyft SQL exists to defend per-ride economics under marketplace ambiguity, and the habit that survives the screen is stating the denominator before the division.*",
  ],

  metrics: [
    { name: "Rides completed", what: "Requests that reached a completion timestamp. The status-aware count everything hangs on — on this kit's proxy ledger, 82 of 103 requests carry a completion timestamp, and the 21-request gap is the pending-plus-cancelled funnel the ops floor watches." },
    { name: "Ride completion rate", what: "Completed rides ÷ REQUESTED rides. The marketplace health number with the denominator fixed before the ratio — cancelled and unfulfilled stay in it, and the screen checks whether your WHERE clause shrank it." },
    { name: "Prime Time share", what: "Share of rides priced under a Prime Time multiplier, bucketed low/mid/high in one CASE pass. Lyft's surge lens: coverage tells pricing whether demand was priced into the market or absorbed by driver supply." },
    { name: "Rider cancellation rate", what: "Rider-cancelled requests ÷ requested, by region and hour. Probed on this db: APAC 3 of 37 (8.1%) is the worst region against EU 6.7%, US 5.3%, LATAM 0% — a conditional-count ratio where merging rider and driver cancels is the classic definition drift." },
    { name: "Driver earnings per active hour", what: "Fare earnings folded per driver ÷ hours folded per driver, divided at driver grain. The two-grain discipline metric: AVG of per-ride averages is a different (wrong) number, and the screen asks which one you computed." },
    { name: "Rides per active driver", what: "Rides ÷ DISTINCT active drivers over the window. The supply-efficiency read that argues for driver incentives — the denominator is drivers who worked, never drivers who signed up." },
    { name: "Weekly active riders (WAU)", what: "COUNT(DISTINCT rider) over a trailing 7-day window — one rider's ten rides count once. The rolling-distinct discipline this kit's tagged rolling-7d-actives problem drills." },
    { name: "Refund & credit rate", what: "Refunded rides ÷ COMPLETED rides — only completed rides can be refunded, so the denominator is completed, never requested. A conditional count over finance rows that must reconcile against the ride census." },
  ],

  topics: [
    {
      name: "Ride-by-ride economics folds",
      why: "Lyft's first question is usually 'what did this ride earn' — fare folded per tier, per region, per period, with cancelled demand excluded by an explicit rule. The trap is grain drift: joining fare lines fans rides out, and COUNT(*) stops counting rides the moment the join lands.",
      slugs: ["product-sales-analysis-ii", "average-selling-price", "number-of-rich-customers"],
    },
    {
      name: "Completion & cancellation rates",
      why: "Completion rate is completed ÷ REQUESTED and cancellation rate is cancelled ÷ REQUESTED — two ratios that share a denominator and die together when a filter shrinks it. The 100.0-before-division habit and the status rule written before the query are the whole test.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "trips-and-users"],
    },
    {
      name: "Rolling windows & rider stickiness",
      why: "Growth reads here are trailing-window reads: rolling 7-day actives (tagged directly to Lyft), DAU/WAU stickiness, 30-day activity censuses. COUNT(DISTINCT) inside a window, one-rider-counts-once, is the muscle the growth team lives by.",
      slugs: ["rolling-7d-actives", "dau-wau-stickiness", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "Driver dimension history (SCD2)",
      why: "Driver terms, tier pricing and supply status are slowly-changing records: 'what was in force at request time' needs validity chains built with LEAD over the change stream. The tagged scd2-build problem is this exact muscle — history as data, not as a guess.",
      slugs: ["scd2-build", "point-in-time-asof", "keep-latest-dedupe"],
    },
    {
      name: "Ranking & tier leaderboards",
      why: "Top tiers by fare, top regions by rides, second-place arguments that tie — leaderboard reads are window reads. Lyft drills the rank trio because fares tie constantly at weekly grain, and LIMIT-1-OFFSET-1 breaks exactly there.",
      slugs: ["rank-scores", "department-top-three-salaries", "second-most-recent-activity"],
    },
    {
      name: "Cohorts & retention reads",
      why: "Rider retention is cohort retention: rides by acquisition month, lapse risk after a quiet period, week-over-week churn movement. Cohort offset math and LAG-based status transitions turn a request log into a retention story.",
      slugs: ["cohort-retention-matrix", "find-churn-risk-customers", "week-over-week-churn"],
    },
    {
      name: "Two-sided censuses",
      why: "'Rides AND riders per region' is the opening read of the ops review — COUNT(*) counts ride rows, COUNT(DISTINCT rider) counts people, and the gap is the intensity signal. The census must never read the same number in both columns.",
      slugs: ["daily-leads-and-partners", "students-and-examinations", "market-analysis-i"],
    },
    {
      name: "Refunds, credits & conditional money",
      why: "Refund rate is refunded ÷ COMPLETED — only completed rides can be refunded, so the denominator is a definition, not a default. Conditional SUMs over money columns, month-bucketed with the cancelled count alongside, are the finance-adjacent folds this team ships weekly.",
      slugs: ["monthly-transactions-i", "capital-gain-loss", "total-traveled-distance"],
    },
    {
      name: "Prime-time date math",
      why: "Prime Time means price is a function of time: the multiplier in force at request moment is an as-of lookup, and 'first ride inside the golden window' is a date-math cohort gate. Both are two-stage timestamp questions with half-open intervals.",
      slugs: ["find-golden-hour-customers", "product-price-at-a-given-date", "the-latest-login-in-2020"],
    },
    {
      name: "Set ops & one-pass censuses",
      why: "Report packets stitch two populations into one layout — completed rides and cancelled rides stacked, per-month branches aligned — and dashboards get one pass, not four scans. UNION ALL discipline and CASE-branch censuses that reconcile to COUNT(*) are the close-out skills.",
      slugs: ["team-scores-in-football-tournament", "monthly-transactions-ii", "active-businesses"],
    },
  ],

  theory: [
    {
      id: "lyft-t1",
      q: "Driver earnings per active hour: two numbers live at different grains (money per ride, hours per shift). How do you fold them so the ratio is honest?",
      a: "Fold each side at the same grain, then divide once. The wrong version averages per-ride earnings and calls it productivity: AVG(earnings) over rides weights every ride equally regardless of how long the driver worked — a driver with ten short rides gets ten votes, and the 'average hourly' drifts toward whoever took the most trips. The honest shape stages two folds — earnings per driver and hours per driver, both GROUP BY driver — then divides at the driver grain, or folds once more to a fleet-level SUM(earnings)/SUM(hours), the weighted mean, when the question is platform-wide. What you never do is AVG(per-ride average) — an average of averages that nobody's paycheck matches. At Lyft this is the entry-level screen because the whole economics culture hangs on it: the denominator's grain, stated out loud, is the difference between a rate and a coincidence.",
      tag: "aggregation",
    },
    {
      id: "lyft-t2",
      q: "Pricing terms change over time and the warehouse keeps every version. How do you build a validity chain (SCD2) from a change-event stream — and what does LEAD buy you that MIN/MAX doesn't?",
      a: "A change-event row carries the NEW state and its effective timestamp; the validity window's END is not stored — it is DERIVED as the next change's effective timestamp. LEAD(effective_at) OVER (PARTITION BY driver_id ORDER BY effective_at) computes exactly that: each version's valid_from pairs with the NEXT row's valid_from as valid_to, conventionally open-ended (the current row's LEAD is NULL, meaning 'still in force'). MIN/MAX can't do this — they collapse the partition to endpoints and erase the sequence, which is the difference between a history and two numbers. The two checks that make the rebuild trustworthy: no overlaps — a row is invalid if LEAD(effective_at) <= its own effective_at — and no gaps, which the chain construction makes impossible by design. Then the as-of read joins the fact timestamp against valid_from <= event_at < valid_to. At Lyft this is why 'which price was in force that week' is answerable instead of arguable — the validity chain turns a change log into a queryable dimension.",
      tag: "windows",
    },
    {
      id: "lyft-t3",
      q: "Walk me through what survives a LEFT JOIN from drivers to rides — and what the WHERE clause does to it.",
      a: "The LEFT JOIN keeps every driver row and attaches rides where they exist; a driver with zero rides this window survives with NULL ride columns — which is exactly the supply-without-demand population the ops review needs to see. The classic silent failure is filtering the right table in WHERE: WHERE ride.status = 'completed' kills the NULL-payload rows (NULL = 'completed' is UNKNOWN, discarded), collapsing the LEFT JOIN to an INNER and deleting the zero-ride drivers from a report titled 'all drivers'. The fix is clause placement: predicates on the right table belong in the ON clause (ON d.id = r.driver_id AND r.status = 'completed'), which keeps the driver row and NULLs the ride attributes instead. The other trap is fan-out — a driver with 40 rides appears 40 times, so driver-grain columns need COUNT(DISTINCT) or a pre-folded derived table. Say which side is the spine before the FROM clause; on a two-sided marketplace the spine choice IS the analysis.",
      tag: "joins",
    },
    {
      id: "lyft-t4",
      q: "refund_at is NULL until a refund is issued. What is your NULL policy for the refund-rate metric — and what does COUNT do about the NULLs whether you ask or not?",
      a: "Two behaviors, then the policy. COUNT(refund_at) counts non-NULL values only — so refunded ÷ COUNT(refund_at) is a tautology (100%), the classic self-referential denominator bug; the honest denominator is COUNT(*) over COMPLETED rides, the population that can be refunded at all. AVG and COUNT(col) skip NULLs while COUNT(*) keeps the row — so the 1/0 CASE flag (SUM(CASE WHEN refund_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*)) is the shape that keeps numerator and denominator on the same rows. The policy: refund rate = refunded rides ÷ completed rides, cancelled rides never enter either side because they can't be refunded; the population is stated in the report, not discovered in the WHERE clause later. And at the display edge, a NULL 'no refund yet' is reported as zero refunds only when the business agrees 'not yet' and 'never' are the same number for this read — a stakeholder decision, never a silent COALESCE in the middle of the pipeline.",
      tag: "nulls",
    },
    {
      id: "lyft-t5",
      q: "'Cities whose ride count crossed 8 this month' — WHERE or HAVING? And where does the SELECT alias work?",
      a: "HAVING, because a count is a group fact — it exists only after GROUP BY folds the rides, and WHERE runs before any group forms. The engine's rejection of WHERE COUNT(*) >= 8 is the pipeline order teaching itself: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. The alias subtlety completes the picture: SELECT aliases are born at SELECT, so they resolve in GROUP BY, HAVING and ORDER BY (SQLite is permissive there) but never in WHERE — the portable habit is the underlying expression in every clause except ORDER BY. The grain test that predicts placement every time: 'rides over 8' (a row predicate on a fare column) is WHERE; 'cities with more than 8 rides' (a group predicate) is HAVING; 'this month's rides' (a row predicate on the timestamp) is WHERE before the fold. Say the grain out loud and the clause chooses itself — that narration habit is what the follow-up is actually grading.",
      tag: "pipeline",
    },
    {
      id: "lyft-t6",
      q: "Rides priced above their region's own average — walk me through the correlated subquery, what makes it correlated, and what it costs.",
      a: "The correlated form nests a fold that references the outer row: WHERE r.total > (SELECT AVG(i.total) FROM rides i WHERE i.region_id = r.region_id). The inner query re-runs per outer row — that reference to r.region_id is what makes it correlated — so the cost is O(outer rows × inner scan) unless the engine rewrites it, and the honest move on big tables is staging the per-region averages in a derived table or CTE and joining back: same result, one pass. Semantically it answers 'above MY region's average', which is a different question from the scalar one-shot WHERE total > (SELECT AVG(total) FROM rides) — 'above the platform average'. The failure mode to narrate: on a filtered staging table the inner fold can return zero rows, the scalar yields NULL, the comparison passes nothing, and the report ships empty-looking-but-valid. Saying which population the inner fold covers, per row, is exactly the follow-up this question is fishing for.",
      tag: "subqueries",
    },
    {
      id: "lyft-t7",
      q: "Prime Time windows and ride durations live on TEXT timestamps. Bucket them, diff them, window them — and where does each approach break?",
      a: "Three tools, three caveats. Buckets: STRFTIME('%Y-%m', request_at) — or SUBSTR(request_at, 1, 7) on fixed-width ISO — gives the month spine; '%m' alone merges Januaries across years, and the SUBSTR shortcut dies the day the format drifts. Diffs: JULIANDAY(completion_at) - JULIANDAY(request_at) returns fractional days — this kit's proxy ledger averages 2.98 days over 82 completed rides, rounded once at the end, never per row. Windows: half-open intervals for the PT window — request_at >= '17:00' AND request_at < '20:00' — because BETWEEN on the end bound drops the window's last minute, which on a pricing window is the most expensive minute. The deeper breaks: TEXT timestamps carry no timezone contract (state the convention or the PT window is fiction), and completion_at is NULL until the ride ends — every duration fold needs its population stated first: completed rides only. Convention first, population second, query last.",
      tag: "dates",
    },
    {
      id: "lyft-t8",
      q: "Driver shift logs can carry overlapping validity windows after a bad rebuild. How do you detect the overlaps, and how do you prove the fix?",
      a: "Detection is a window comparison: LEAD(valid_from) OVER (PARTITION BY driver_id ORDER BY valid_from) AS next_from, then keep rows WHERE next_from <= valid_to — a next window starting before this one ends is the definition of overlap, per driver, in one pass. The self-join twin (a1.driver = a2.driver AND a1.valid_from < a2.valid_from AND a2.valid_from < a1.valid_to) works but needs the ordering rule and a role-named alias discipline; the LEAD shape reads better and scales. What you don't do is MAX(valid_to) per driver — it collapses the sequence and misses the middle-row overlap entirely. The proof is counts, always counts: rows in versus rows out, and COUNT(*) versus COUNT(DISTINCT driver_id || valid_from) to confirm the fix didn't eat real history. At Lyft this matters because SCD2 rebuilds run like code changes — a validity chain with overlaps silently mis-prices every as-of query built on top of it, and the overlap query is the CI test.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "lyft-mcq-1",
      prompt: "The rides table holds 103 requests from 16 riders. Which single expression folds repeat requests back to PEOPLE for the 'riders served' cell?",
      choices: [
        "COUNT(customer_id)",
        "COUNT(*)",
        "COUNT(DISTINCT customer_id)",
        "SUM(customer_id)",
      ],
      answer: 2,
      why: "COUNT(DISTINCT customer_id) folds repeat rides to distinct people — 16. COUNT(customer_id) skips only NULLs (103 with a NOT NULL FK), COUNT(*) counts rows (103), and SUM over ids is a meaningless number.",
      notes: [
        { choice: 0, why: "COUNT(col) is NULL-blind, not repeat-blind — it counts 103 non-null keys. DISTINCT is the fold that changes the grain from rides to people." },
        { choice: 3, why: "SUM(customer_id) adds the ids — a large meaningless integer. Magnitude-check every aggregate: people counts are smaller than ride counts, never larger." },
      ],
      difficulty: "easy",
    },
    {
      id: "lyft-mcq-2",
      prompt: "82 of 103 requests completed (52 delivered-status + 30 shipped-status). Which expression returns the completion rate, 79.6%?",
      choices: [
        "100 * 82 / 103",
        "100.0 * SUM(CASE WHEN status IN ('delivered','shipped') THEN 1 ELSE 0 END) / COUNT(*)",
        "SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)",
        "COUNT(status) * 100.0 / COUNT(*)",
      ],
      answer: 1,
      why: "The conditional SUM counts the completed set at the same fold where COUNT(*) holds all requested rides, and 100.0 promotes real division: 82/103 = 79.6%. Numerator and denominator folded from the same rows — no drift possible.",
      notes: [
        { choice: 0, why: "Integer literals force integer division first: 82/103 truncates to 0, then ×100 prints 0. The .0 goes BEFORE the division, not after." },
        { choice: 2, why: "That counts only the delivered half — 50.5% — dropping the 30 shipped-status completions. Define the completed set once; half a definition is a different metric." },
      ],
      difficulty: "medium",
    },
    {
      id: "lyft-mcq-3",
      prompt: "The completion-latency AVG over all 103 rides prints 2.98 days. Which population did the engine actually average over?",
      choices: [
        "All 103 rides — NULLs counted as 0-day trips",
        "The 82 rides with a completion timestamp — AVG skips NULL inputs",
        "The 7 cancelled rides — they terminate the funnel",
        "No one — one NULL makes the whole AVG return NULL",
      ],
      answer: 1,
      why: "AVG ignores NULL inputs: the 82 rides carrying a completion timestamp are the population — the right population for latency, but chosen by NULL semantics, not by the analyst. Stating it is the difference between a metric and an accident.",
      notes: [
        { choice: 0, why: "Aggregates never treat NULL as zero — zero-duration bugs come from COALESCE-ing the column first. A pending ride with 0 latency reads as instant matching." },
        { choice: 3, why: "AVG returns NULL only when EVERY input is NULL. With 82 real values present, a real average ships — over a silently-shrunk population the query never declared." },
      ],
      difficulty: "easy",
    },
    {
      id: "lyft-mcq-4",
      prompt: "Building the SCD2 validity chain for driver terms: each change-event row holds the new state and its effective_at. What does LEAD(effective_at) OVER (PARTITION BY driver_id ORDER BY effective_at) give you?",
      choices: [
        "The first effective_at for the driver — the earliest version",
        "The NEXT version's effective_at — this row's valid_to (NULL means still in force)",
        "The PREVIOUS version's effective_at — this row's valid_from",
        "The driver's latest effective_at — the current version's start",
      ],
      answer: 1,
      why: "LEAD peers forward: the next change's effective_at closes THIS version's validity window, and the last version's LEAD is NULL — the conventional 'open-ended, still in force'. Validity ends are derived, never stored.",
      notes: [
        { choice: 2, why: "That's LAG's job — looking backward gives the prior state, useful for change diffs, not for closing windows. Direction is the whole question here." },
        { choice: 3, why: "MAX over the partition collapses the history to its endpoint and erases the sequence — the difference between a dimension and two numbers. Windows keep every row." },
      ],
      difficulty: "hard",
    },
    {
      id: "lyft-mcq-5",
      prompt: "The Prime Time evening window is 17:00:00 up to but excluding 20:00:00. Which WHERE clause captures it exactly?",
      choices: [
        "WHERE request_at BETWEEN '17:00:00' AND '20:00:00'",
        "WHERE request_at >= '17:00:00' AND request_at < '20:00:00'",
        "WHERE STRFTIME('%H', request_at) IN ('17', '18', '19')",
        "WHERE request_at > '17:00:00' AND request_at <= '20:00:00'",
      ],
      answer: 1,
      why: "The half-open interval [17:00, 20:00) admits every timestamp from 17:00:00.000 through 19:59:59.999. On real event streams with sub-second components, this is the only shape that keeps the window's last minutes without leaking the boundary second.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive at both ends — a 20:00:00.4 request slips in, or a 19:59:59.8 timestamp exceeds the string bound and vanishes. Pricing windows live on the boundary." },
        { choice: 3, why: "The strict/loose mix drops 17:00:00.0 exactly and admits 20:00:00.0 exactly — both wrong. Boundaries are decisions; write them, don't inherit them." },
      ],
      difficulty: "medium",
    },
    {
      id: "lyft-mcq-6",
      prompt: "Rides join to fare lines: 103 requests fan out to 251 fare rows. After the join, which count still reports RIDES?",
      choices: [
        "COUNT(*)",
        "COUNT(fare_line_id)",
        "COUNT(DISTINCT r.id)",
        "SUM(r.total)",
      ],
      answer: 2,
      why: "The join fans each ride to its fare lines; only COUNT(DISTINCT r.id) folds the fan-out back to the ride grain. COUNT(*) and COUNT(fare_line_id) both count 251 rows; SUM(r.total) prices the fares instead of counting anything.",
      notes: [
        { choice: 1, why: "COUNT(col) skips only NULLs — with a NOT NULL key it equals COUNT(*) at 251. DISTINCT is the fold, not NULL-skipping." },
        { choice: 3, why: "SUM(total) is the fare revenue (34833.28 here) — a money metric wearing a count's slot. Grain-check every aggregate before it reaches the deck." },
      ],
      difficulty: "easy",
    },
    {
      id: "lyft-mcq-7",
      prompt: "Rides priced above their REGION's own average fare — not the platform's. What makes the scalar subquery correlated, and what does it cost?",
      choices: [
        "It references the outer row's region_id, so it re-runs per outer row",
        "It uses AVG, which is why it's slow",
        "It runs once and SQLite caches the result for every row",
        "It's a JOIN in disguise — cost is identical to joining regions",
      ],
      answer: 0,
      why: "WHERE total > (SELECT AVG(i.total) FROM rides i WHERE i.region_id = r.region_id) — the inner query touching r.region_id makes it correlated: one inner scan per outer row. The scalable rewrite stages per-region averages in a derived table or CTE and joins back — one pass, same answer.",
      notes: [
        { choice: 2, why: "Correlated subqueries re-execute per row; only the uncorrelated one-shot fold benefits from compute-once semantics. The cost difference is the interview's second question." },
        { choice: 3, why: "A join-back to pre-aggregated region averages is the REWRITE — and it's the fix precisely because the correlated form isn't free. Same result, different plan." },
      ],
      difficulty: "hard",
    },
    {
      id: "lyft-mcq-8",
      prompt: "Monthly ride counts run 6–9 across the 14 months on this db. Which query keeps only the months with 8 or more rides — and how many qualify?",
      choices: [
        "WHERE COUNT(*) >= 8 before GROUP BY — 6 months",
        "GROUP BY month HAVING COUNT(*) >= 8 — 6 months (2024-01, 02, 03, 05, 07, 09)",
        "GROUP BY month HAVING rides >= 8 — 8 months",
        "ORDER BY COUNT(*) DESC LIMIT 8 — 8 months",
      ],
      answer: 1,
      why: "A count exists only after folding, so the filter is HAVING after GROUP BY. Six months qualify: 2024-01 (8), 02 (9), 03 (8), 05 (8), 07 (8), 09 (9) — the rest run 6 or 7.",
      notes: [
        { choice: 0, why: "WHERE runs before groups form — COUNT(*) doesn't exist yet and the engine rejects it. The error message is the pipeline order teaching itself." },
        { choice: 3, why: "ORDER BY + LIMIT 8 returns the top-8 months sorted — a leaderboard, not a threshold. Months 7 and 8 of that list have 7 rides and don't qualify." },
      ],
      difficulty: "medium",
    },
    {
      id: "lyft-mcq-9",
      prompt: "Rolling 7-day actives: one rider took 10 rides inside a single 7-day window. What does the correct rolling-actives query count for that rider in that window?",
      choices: [
        "10 — actives count ride events",
        "1 — COUNT(DISTINCT rider_id) folds the window's rides back to people",
        "0 — riders with multiple rides are excluded as duplicates",
        "7 — the window's day count caps the contribution",
      ],
      answer: 1,
      why: "Actives are PEOPLE, not events: COUNT(DISTINCT rider_id) over the trailing window counts the rider once regardless of ride count. The rolling part comes from the window or self-join producing one row per day, each with its own trailing-7-day fold.",
      notes: [
        { choice: 0, why: "That's the ride-count metric wearing the actives name — 10 events vs 1 person is the difference between demand and audience. The growth read needs people." },
        { choice: 2, why: "Multi-ride riders are the MOST valuable population, not duplicates to drop. Dedupe semantics (one per person per window) is counting, not exclusion." },
      ],
      difficulty: "hard",
    },
    {
      id: "lyft-mcq-10",
      prompt: "The driver-earnings leaderboard has two drivers tied at 33 fare units; the next has 31. DENSE_RANK() OVER (ORDER BY earnings DESC) assigns the 31-unit driver rank…",
      choices: ["1", "2", "3", "4"],
      answer: 1,
      why: "DENSE_RANK shares the rung on ties (both tied drivers get 1) and keeps the sequence compact — the next distinct value is rank 2, no gaps. RANK would hand the 31-unit driver rank 3, implying a missing second-place driver.",
      notes: [
        { choice: 2, why: "That's RANK — ties share 1, the next jumps to 3. The phantom gap generates a 'where's number two?' meeting about a driver who doesn't exist." },
        { choice: 3, why: "Ranks reach 3 with three distinct values here (1, 1, 2 densely). Four distinct earnings values would be needed for rank 4." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-lyft-1",
      tier: "medium",
      topic: "q2",
      universe: "pricing",
      title: "Above-average fare reads",
      brief:
        "Lyft-flavored case on the storefront db (orders = ride requests, total = fare): the economics team opens pricing review with a scalar-subquery read — how many rides each region priced ABOVE the platform average fare — because the pricing conversation starts where fare mix runs hot. Probed facts: the platform averages 338.19 per ride over 103 requests (total fare pool 34833.28, min 25.47, max 1088.44). The definition is fixed once: 'above average' compares each ride's fare to the ONE platform-wide average, computed inside the query — never a hard-coded number, never a per-region average smuggled in. Region counts matter here: EU is the fare-mix heavyweight, LATAM's two rides are a rounding footnote to be read with its count visible.",
      ask: "Return each region with its count of rides priced above the platform-average fare, busiest region first.",
      template:
        "SELECT c.region,\n       {1}(*) AS above_avg_rides\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.total > (SELECT {2}(total) FROM orders)\nGROUP BY c.region\nORDER BY above_avg_rides {3};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the per-region ride counter",
          why: "COUNT(*) counts the rows folded into each region — the above-average rides per region. SUM(*) doesn't exist, and MAX(*) would report one ride, not the count the pricing review reads.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the platform-average fold",
          why: "AVG(total) inside the scalar subquery computes the 338.19 platform average in-query — no hard-coded constant to go stale. MAX would compare against the single priciest ride (1088.44) and return an empty census.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "The pricing conversation starts with the region carrying the most above-average rides, so descending puts EU on top. ASC would open with LATAM's single ride — a correct query aimed at the footnote instead of the story.",
        },
      ],
      distractors: ["SUM", "MAX", "ASC", "MIN"],
      walkthrough:
        "A scalar subquery as a definition, not a constant. The inner fold AVG(total) runs once over all 103 rides and returns 338.19 — the platform average — and the outer WHERE keeps only rides whose fare beats it; the GROUP BY then folds those survivors into per-region counts: EU 18, APAC 13, US 10, LATAM 1, ordered busiest-first. Two failure modes the distractors encode: MAX in the inner fold compares every ride against the single priciest fare (1088.44) — nothing beats it, the census ships empty-looking-but-valid; MIN compares against 25.47 and counts nearly everything, a 'census' of the whole platform. SUM in the inner fold compares against the entire 34833.28 fare pool — empty again. And ASC flips the read so the region with one above-average ride opens the deck. The deeper discipline: the threshold lives in the query so it moves with the data — a hard-coded 338.19 is a report that lies silently the day the fare mix changes.",
    },
    {
      id: "cs-lyft-2",
      tier: "hard",
      topic: "t6",
      universe: "growth",
      title: "Rider concentration, partition by region",
      brief:
        "Lyft-flavored case on the storefront db: the board deck's supply-demand slide wants rider concentration at the right denominator — each rider's ride count AND their region's total rides side by side, so the share is computable without a second query. Probed facts: 103 rides from 16 riders; region loads EU 45 / APAC 37 / US 19 / LATAM 2; top riders Alice Chen 24 rides (EU), Emma Wilson 17 (US), Grace Kim 14 (APAC), Maya Patel 13 (APAC). The definition is fixed: the window must PARTITION by region, not run platform-wide — Alice's 24 rides sit against EU's 45, not against 103 — and every rider row stays in the output (a window, not a GROUP BY collapse).",
      ask: "Return every rider with their ride count and their region's total rides, biggest rider first within each region.",
      template:
        "SELECT c.region,\n       c.name,\n       {1}(*) AS rides,\n       SUM(COUNT(*)) OVER (PARTITION {2} c.region) AS region_rides\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id, c.region\nORDER BY c.region, rides {3};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the per-rider ride counter",
          why: "COUNT(*) counts the rows folded into each rider — the probed per-rider counts (24, 17, 14, 13, …). SUM(*) isn't SQL, and AVG(*) doesn't exist: only COUNT takes the star to count rows rather than values.",
        },
        {
          answer: "BY",
          kind: "keyword",
          label: "the partition keyword",
          why: "PARTITION BY c.region scopes the window fold to each region's riders — EU's 45, APAC's 37, US's 19, LATAM's 2 attach only to their own rows. Without BY the window is a syntax error; platform-wide framing would put 103 on every row and bury the regional share.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-rider-first order",
          why: "Within each region the deck reads the heaviest rider first: Grace Kim's 14 on top of APAC, Alice Chen's 24 on top of EU. ASC would open every region with its one-ride riders — the tail where nothing concentrates.",
        },
      ],
      distractors: ["SUM", "AVG", "ASC", "WITH"],
      walkthrough:
        "A window riding on top of an aggregate — two folds, two layers, one job each. The inner GROUP BY c.id folds 103 rides into 16 per-rider counts (24, 17, 14, 13, 5, 4, 4, 4, 3, 3, 2, 2, 1, 1, 1, 1 — the probed distribution); the window SUM(COUNT(*)) OVER (PARTITION BY c.region) then re-folds those groups per region, stamping EU 45, APAC 37, US 19, LATAM 2 on every row of their partition — which is why the share is one division away: Alice 24/45 = 53.3% of Europe, Grace 14/37 = 37.8% of APAC. Windows run AFTER GROUP BY, so wrapping an aggregate in OVER is legal — the outer query stays at rider grain and no row collapses. The traps: ASC inverts every region's read; WITH is a CTE keyword, not a window one; SUM or AVG in the counter slot are syntax errors against the star. Read LATAM with its count visible — a 2-ride region makes any 'top rider' a 100% share, which is a rounding artifact pretending to be concentration.",
    },
  ],

  problems: [
    { slug: "rolling-7d-actives", why: "Trailing-window distinct counts — one rider's ten rides count once. The tagged Lyft problem and the exact WAU discipline the growth team ships weekly." },
    { slug: "scd2-build", why: "Build SCD Type 2 validity chains from change events with LEAD — the tagged Lyft problem: driver terms and tier pricing as queryable history, overlaps detectable." },
    { slug: "trips-and-users", why: "Cancellation share per city per day with exclusions — the canonical rideshare screen, and the denominator drill behind every completion and cancellation read. Theme-curated." },
    { slug: "queries-quality-and-percentage", why: "Two rates folded in one pass with the 100.0-before-division fix — the honest-denominator habit Lyft's economics screens orbit. Theme-curated." },
    { slug: "confirmation-rate", why: "LEFT JOIN acceptance share with COALESCE for unmatched IDs — driver-acceptance reporting with the NULL policy built in. Theme-curated." },
    { slug: "immediate-food-delivery-ii", why: "Kept-share ratio where the denominator is the whole test — completion rate by window in textbook form. Theme-curated." },
    { slug: "dau-wau-stickiness", why: "DAU over WAU in windows — engagement intensity for a marketplace whose demand is hourly and whose actives are people, not events. Theme-curated." },
    { slug: "cohort-retention-matrix", why: "Cohort-offset retention matrix — rider retention by acquisition month, the read that decides whether promo riders became riders. Theme-curated." },
    { slug: "find-churn-risk-customers", why: "Lapse-risk anti-join with date math — riders whose last ride crossed the quiet threshold, computed not asserted. Theme-curated." },
    { slug: "week-over-week-churn", why: "LAG-based churn transitions week over week — the status movement read the retention review opens with. Theme-curated." },
    { slug: "number-of-times-a-driver-was-a-passenger", why: "Dual-role counting across the same entity — drivers who were also riders, LEFT JOIN grain discipline on both sides of the marketplace. Theme-curated." },
    { slug: "average-selling-price", why: "Period-weighted pricing folds — a revenue-per-unit ratio where the weighting choice changes the answer, the Prime Time pricing follow-up. Theme-curated." },
    { slug: "product-price-at-a-given-date", why: "As-of price lookup — which fare version was in force at request time, the pricing-history read SCD2 enables. Theme-curated." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the 1,1,3 vocabulary check before any tier or driver leaderboard ships. Theme-curated." },
    { slug: "total-traveled-distance", why: "Conditional SUM over a status flag — completed-versus-cancelled splits from one scan, the refund-audit counting shape. Theme-curated." },
    { slug: "monthly-transactions-i", why: "Month-bucket totals with the cancelled count alongside — status-aware monthly reporting on the %Y-%m spine. Theme-curated." },
  ],
};
