// Lime — kit 8 of the Ride-hailing & Mobility domain (Batch D, 91-d-mobility).
// Micromobility: shared scooters and bikes, short rides, vehicle utilization
// and the city-permit/compliance layer that gates every launch. Pool
// provenance: 0 tagged LC — theme-curated. Every problem and topic slug is
// drawn from the Theme menu in scripts/company-pools.md (sql rows), picked to
// mirror Lime's known screen themes: ride-grain folds, fleet utilization,
// availability and zombie telemetry, city permit ledgers in INTEGER cents,
// ride-length buckets, rolling rider retention.
// Case studies run on the storefront db (db/custom.db) with probed figures
// from scripts/company-facts.md, mapped honestly: orders = rides, customers
// = city operating entities (the permit counterparties), products = vehicle
// models, order_items = per-ride fare lines, suppliers = hardware vendors,
// shipped_at = ride completion ping, invoices/payments = city permit fees
// and settlements (INTEGER cents — divide by 100.0).
//
// Expansion (task 92-d-lime, 3x APPEND-ONLY): brief 4->6, dayInLife 4->5,
// metrics 8->12, topics 10->15, theory 8->24 (lime-t9..t24), mcqs 10->30
// (lime-mcq-11..30, 3/4/3 difficulty per fresh ten), cases 2->6 (cs-lime-3..6,
// four new topic families: j7 + s6 + t7 + x2), problems 16->32. All new slugs
// theme-curated from the pools Theme menu (still 0 tagged LC for Lime).

import type { CompanyKit } from "../types";

export const limeKit: CompanyKit = {
  id: "lime",
  domainId: "mobility",
  name: "Lime",
  tagline: "Micromobility: scooters, rides and city permits",
  accent: "text-green-300",

  brief: [
    "Lime is the micromobility company that put shared scooters and bikes on city sidewalks at global scale — short trips of a kilometer or three, priced by the minute, replenished nightly, and entirely hostage to one artifact most riders never see: the {sky:city permit}. Every market Lime operates in is a negotiated, metered, revocable contract, which makes its data org equal parts fleet ops and civic accounting. The core object is a ride: unlocked, ridden, {emerald:completed} with a telemetry ping or {rose:cancelled}, timestamped at every hop. On this kit's proxy ledger that's 103 rides of which 82 carry a completion ping — 14 {sky:pending}, 7 {rose:cancelled} — and completion rate is completed ÷ UNLOCKED, with the 21 ping-less rides being either stuck vehicles or open compliance questions, never silent zeros.",
    "The data org is city-shaped on both sides of the ledger. Fleet side: vehicle utilization (rides per active vehicle per day), rebalancing sweeps, charging cycles, and a telemetry hygiene problem scooters make uniquely nasty — vehicles that stop pinging ({sky:zombie fleet}) need a stated NULL policy, not a shrug. Civic side: permit fees and compliance filings settle through an invoicing book where every row is INTEGER cents — `SUM(amount_cents) / 100.0`, never `/100` — and the reconciliation culture is strict: the trial balance ties to the cent (181,080 debit = 181,080 credit), a {rose:void-but-paid} permit invoice (925.00) is an incident with a city on it, and a partially settled fee (4,000.00 of 6,148.00) is a follow-up with a deadline. Depot rent is the biggest opex line (14 entries, 16,800.00), which tells you the unit economics conversation starts with parking, not scooters.",
    "Interviews are micromobility-flavored: short-ride grain, utilization denominators, and permit-compliance reads. A screen opens with a warm-up join (attach rides to their city), escalates into a conditional aggregation with a status rule ({emerald:completion} share by city, {rose:cancellation} share by month), then either a month-bucket trend (STRFTIME over the 2024-01..2025-02 span), a window question (rank cities by weekly rides, rolling 7-day actives) or a compliance query (permit invoices with zero settlements — a LEFT JOIN + IS NULL anti-join). Follow-ups are spoken aloud: 'is that per ride or per vehicle?', 'does an unlocked-but-unclosed ride sit in your denominator?', 'what does an unpaid permit mean for next quarter's launch?' — because in micromobility an unpaid fee is an existential risk wearing a receipt.",
    "Preparation strategy: this kit is **theme-curated** from the SQL band — {sky:0 tagged LC} rows exist for Lime, so the 16 problems and 30 topic slugs were hand-picked from the theme menu to mirror its screens: ride-grain folds, utilization math, availability islands, zombie telemetry, permit ledgers, retention windows. The two case studies run on the live storefront db: one rebuilds the **monthly ride ledger** city ops reviews (volume against the 8-ride bar, close-lag per month), the other rebuilds the {amber:permit-compliance} census that lists which cities still owe fees. Both are mechanically audited against probed figures — 103 rides, 82 completed, latency averaging 2.98 days (range 2..4), and 6 permit invoices holding 15,217.00 outstanding.",
    "The fleet itself is a vendor story the data org tracks weekly: 6 hardware vendors supply the 16-model catalog, and concentration is the standing risk — Nordic Gadgets AB carries **32%** of fare revenue (11,130.25) with Midwest Hardware Co at 26.7% (9,294.93), so one recall or firmware regression reshapes the whole deployment. Vendor quality lives on a 3.9–4.8 rating spread where only two vendors clear the {emerald:4.5 trusted bench}. The catalog's price structure matters as much: 8 budget models (avg 32.06) against 8 mid-band (avg 111.50), topping out at 199.99 — *there is no premium band*, which is why utilization, not ticket size, is the lever every fleet decision pulls. Fare-line grain keeps it honest: 251 `order_items` lines over 103 rides, and the ~2.4x fan-out is the number that catches any revenue SUM joined at the wrong grain.",
    "The stakeholder calendar runs on three rhythms. Weekly, the growth board reads the region mix — EU 45 rides / 15,089.23, APAC 37 / 11,605.45, US 19 / 7,286.16, LATAM 2 / 852.44 — against concentration: four riders above 3,000.00 lifetime carry {amber:63.5%} of ride value, so 'the fleet' is really four relationships and a long tail. Monthly, the close walks the civic side: 28 permit fees against 27 settlements, {emerald:21 exact} / 1 partial / 6 untouched, settlement velocity averaging **28.4 days** against fixed 30-day terms with an 84-day slowest straggler. Quarterly, the expense book gets its say — 36 entries where depot {rose:Rent} leads at 16,800.00 across 14 filings — because parking, not scooters, is the cost center the margin story starts from. The analyst who can fold all three rhythms into one audit-ready query chain is the one this org promotes.",
  ],

  dayInLife: [
    "**08:30 —** The day opens on the city board: overnight rides versus unlocks, {emerald:completion} share by city, the {rose:cancellation} heatmap, and the fleet map where vehicles went dark overnight. First query is a telemetry reconciliation: did the ride-ping stream land completely, do per-ride fare lines tie to ride totals, how many vehicles went {sky:pending} with no completion ping. The morning deliverable is the monthly ride ledger — one row per month, rides, completed, close-lag — because the city reviews ride the same trend the permits are metered against. The analyst who can write the ping-gap diff in one pass is the one the city manager pings first (pun intended, used daily).",
    "**11:00 —** Midday is fleet deep-dive block. Utilization: rides per active vehicle by city — **rides per vehicle that moved**, never per vehicle registered — and the zombie census: vehicles whose last ping is stale, computed with a stated staleness window, because 'no data' and 'no rides' are different operational emergencies. A rebalancing question lands mid-block: which dock zones went empty during the morning rush — availability islands in a timeline, gaps-and-islands logic over ping streams. Every read names its grain out loud: 103 rides, 251 fare lines once items attach, one vehicle census — three grains, and quoting one under another's name is how a fleet looks busier than it is.",
    "**14:30 —** The afternoon tilts civic. The permits ledger review runs: which city fees settled (21 exact), which are partial (4,000.00 of 6,148.00 — still moving), which have no settlement at all (6 invoices, 15,217.00 outstanding — the anti-join list that goes to the city-relations lead with names on it). The finance partner wants the cents discipline stated in the query itself: `SUM(amount_cents) / 100.0` at the display edge, trial balance tie confirmed (181,080 = 181,080, delta 0) before anything leaves the building. One {rose:void-but-paid} fee (925.00) gets flagged for the reconciliation follow-up — a city paid a voided invoice, and someone has to call someone.",
    "**17:30 —** The day closes in review mode with the city-relations handoff. The writeup ships three artifacts: the monthly ride ledger (volume against the 8-ride bar, close-lag per month against the 2.98-day average), the zombie-and-backlog census (21 ping-less rides, each tagged stuck-or-cancelled), and the permit outstanding list with owners and deadlines. The post-mortem culture treats a metric whose definition drifted mid-month as an incident, not a footnote, because *Lime SQL exists to keep rides, vehicles and cities honest in the same query — and the permits paid to the penny.*",
    "**21:15 —** Night shift is the fleet's quietest hour and the data's loudest: charging cycles and rebalancing sweeps run while riders sleep, and the on-call analyst watches the ping stream for the {sky:zombie} pattern — vehicles whose last telemetry went stale against the stated 7-day window, distinguished from never-pinged hardware because 'went dark' and 'never came online' dispatch different trucks. A late-arriving completion ping triggers the restatement ritual: the monthly ledger for the affected month gets re-run and re-stamped, because *a published number that silently changes is worse than a late one*. The handoff note closes the loop — 21 ping-less rides reconciled against {rose:pending}/{rose:cancelled} fates, ping-gap diff attached, `shipped_at` watermark recorded — and tomorrow's 08:30 board starts from a ledger the night shift can vouch for.",
  ],

  metrics: [
    { name: "Rides completed", what: "Rides that reached a completion ping: 82 of 103 on the proxy ledger (52 delivered-status + 30 shipped-status). The core count every utilization and revenue read hangs on — the other 21 are {sky:pending} plus {rose:cancelled}, the stuck-and-died tail." },
    { name: "Completion rate", what: "Completed rides ÷ ALL unlocked rides. The fleet-health number: the denominator includes the 21 rides that never pinged complete, and the interviewer checks whether your WHERE clause shrank it." },
    { name: "Ride close lag", what: "Unlock-to-completion-ping latency on completed rides: avg 2.98 days on the proxy ledger, range 2..4, by region LATAM 3.50 worst down to APAC 2.93. The population statement — completed rides only — IS the metric." },
    { name: "Vehicle utilization", what: "Rides per ACTIVE vehicle per day — the vehicle that moved, not the vehicle registered. The two-grain ratio where COUNT(*) versus COUNT(DISTINCT vehicle) is the difference between a rate and a fan-out artifact." },
    { name: "Zombie fleet share", what: "Vehicles with no recent telemetry ping, computed against a stated staleness window. Micromobility's signature data-quality KPI: a scooter that stops pinging is either parked, broken or stolen — the query has to say which question it answers." },
    { name: "Permit compliance outstanding", what: "City permit fees invoiced but unsettled: 6 invoices holding 15,217.00 on the proxy ledger, against a coverage census of 21 exact / 1 partial / 6 untouched. The civic number that gates launches and renewals." },
    { name: "Ride-length mix", what: "Rides bucketed by duration or fare band in one CASE pass — short hops versus long hauls. The unit-economics read: minute-priced revenue means the bucket mix, not the ride count, is the money." },
    { name: "Depot cost load", what: "City opex folded by category — depot rent 14 entries / 16,800.00 leads, ads 14 / 4,570.00. Micromobility's margin story starts with parking and permits, and the expense book proves it monthly." },
    { name: "Vendor concentration", what: "Fare revenue share of the top hardware vendor: 32% (Nordic Gadgets AB, 11,130.25), next 26.7% (Midwest Hardware Co). One vendor outage or recall reshapes the fleet — this number decides how hard ops pushes to diversify the catalog." },
    { name: "Fare-line fan-out", what: "Fare lines per ride: 251 order_items across 103 rides (~2.4). The join-fan-out health check: any ride-grain SUM that joins fare lines without re-folding reports inflated totals, and this ratio is the first place the inflation shows." },
    { name: "Permit settlement days", what: "Days from permit invoice issue to first settlement on paid fees: avg 28.4 against fixed 30-day terms (fastest 13, slowest 84). The civic-credit read — drifting past terms is how a city renegotiation starts." },
    { name: "Region demand mix", what: "Rides and value by region: EU 45 / 15,089.23, APAC 37 / 11,605.45, US 19 / 7,286.16, LATAM 2 / 852.44. Launch and rebalance planning reads the mix weekly — a region with rides but no settled permits is a story this metric surfaces." },
  ],

  topics: [
    {
      name: "Ride-grain aggregation",
      why: "Everything starts by folding rides into per-city, per-month, per-vehicle-model counts without letting the fare-line join change the grain: 103 rides become 251 fare lines once items attach. COUNT(*) versus COUNT(DISTINCT ride_id) is the difference between a ride census and a line-item census.",
      slugs: ["product-sales-analysis-ii", "unique-orders-and-customers-per-month", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Fleet utilization folds",
      why: "Micromobility economics live on utilization: rides per active vehicle, rebalance distance per sweep, top-performing vehicles by trips. Server-utilization-time is the utilization fold in its purest form; parking-fees-and-duration is the metered-duration shape scooters price by.",
      slugs: ["server-utilization-time", "find-top-performing-driver", "calculate-parking-fees-and-duration"],
    },
    {
      name: "Dock & vehicle availability",
      why: "Availability is a timeline question: which vehicles sat consecutive-ready, which docks filled, which capacity bar the next rider would have tripped. Consecutive-available-seats is the contiguous-run shape; last-person-to-fit-in-the-bus is the running-capacity gate.",
      slugs: ["consecutive-available-seats", "consecutive-available-seats-ii", "last-person-to-fit-in-the-bus"],
    },
    {
      name: "Ride-length buckets & histograms",
      why: "Minute-priced revenue means the bucket mix is the money: session-bar charts of ride lengths, spend histograms, rating distributions per city. Three bucket drills, one habit — CASE arms that partition a continuous value without losing rows.",
      slugs: ["create-a-session-bar-chart", "spend-histogram", "ratings-histogram"],
    },
    {
      name: "Completion & close-lag reads",
      why: "Close lag is unlock-to-ping on completed rides only — avg 2.98 days on the proxy ledger, 2-to-4 range — and the paired-timestamp math (JULIANDAY deltas, machine-style process pairing) is the muscle. The rate queries ride the same 100.0-before-division discipline.",
      slugs: ["average-time-of-process-per-machine", "queries-quality-and-percentage", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "City permits & the compliance ledger",
      why: "Permits are Lime's license to exist: aging schedules for outstanding fees, gap detection in the filing sequence, reconciliation of the civic books. The AR-aging and GL-reconciliation shapes are exactly the month-close queries city finance runs.",
      slugs: ["ar-aging-schedule", "journal-gap-detection", "gl-reconciliation"],
    },
    {
      name: "Zombie fleet & telemetry hygiene",
      why: "Scooters stop pinging — the zombie census needs a stated staleness window and a NULL policy, not vibes. Keep-latest dedupe with a deterministic tie-break rebuilds one ping per ride from a retry-heavy stream; the blank audit catches the rest.",
      slugs: ["find-zombie-sessions", "keep-latest-dedupe", "null-blank-audit"],
    },
    {
      name: "Rider retention windows",
      why: "Rider reads are trailing-window reads: rolling 7-day actives, DAU/WAU stickiness across cities, last-ride recency per rider. One rider's ten rides count once — the rolling-distinct discipline these three drill.",
      slugs: ["rolling-7d-actives", "dau-wau-stickiness", "the-latest-login-in-2020"],
    },
    {
      name: "CASE triage on ride fates",
      why: "Unlocked, completed, pending, cancelled — ride fate is a CASE branch inside a SUM, not four queries. Conditional counting over a 1/0 flag folds completion and cancellation shares at the same grain as COUNT(*), and the ELSE arm's width is the audit.",
      slugs: ["immediate-food-delivery-i", "count-salary-categories", "weather-type-in-each-country"],
    },
    {
      name: "Demand bursts & weekend curves",
      why: "Scooter demand is weather-and-weekend shaped: bursts around transit stations, weekend spikes, rush-hour intervals. Burst detection, weekend-count folds and fixed-interval counts are the shapes city ops charts hourly.",
      slugs: ["find-bursty-behavior", "tasks-count-in-the-weekend", "calculate-orders-within-each-interval"],
    },
    {
      name: "Revenue-share concentration",
      why: "Micromobility fleets concentrate hard: four riders above 3,000.00 lifetime carry 63.5% of ride value, and one hardware vendor carries 32% of fare revenue. Window-share folds (value over the grand total, per rider or per vendor) are how the weekly business review spots when a city, a rider or a vendor becomes too big to lose.",
      slugs: ["portfolio-weights", "portfolio-concentration-hhi", "usage-tier-percentiles"],
    },
    {
      name: "Fleet census stacks (set ops)",
      why: "City-ops answers are rarely one query: completed rides and ping-less rides stack into one census, invoiced cities get diffed against settled cities with EXCEPT, and grand-total rows ride UNION ALL. Set operations are how a one-screen board gets built from folds that cannot share a GROUP BY.",
      slugs: ["movie-rating", "monthly-transactions-ii", "the-airport-with-the-most-flights"],
    },
    {
      name: "Deep subqueries & CTE staging",
      why: "The rides-per-active-vehicle ratio and the cancellation-rate gates both stage through subqueries and CTEs: fold first, then gate, then join back for names. The Hopper driver queries are the ride-industry canon for exactly this fold-then-ratio shape Lime screens love.",
      slugs: ["hopper-company-queries-i", "hopper-company-queries-ii", "game-play-analysis-iv"],
    },
    {
      name: "Rolling windows & frame math",
      why: "Utilization and rider activity are trailing-window reads: rolling 7-day ride value, rolling actives, cumulative rides per city. Frame choice (ROWS versus the default RANGE) is the difference between a true 7-day window and a peers-inclusive accident that double-counts tied days.",
      slugs: ["restaurant-growth", "rolling-average-steps", "find-cumulative-salary-of-an-employee"],
    },
    {
      name: "Pricing tiers & band rules",
      why: "Minute-priced fares ride on rule stacks: best-rule discounts, tier classification, price bands that gate which vehicle model a market deploys (the catalog tops out at 199.99 — the premium band is empty). Band joins and CASE-tier folds are the pricing-desk queries.",
      slugs: ["the-category-of-each-member-in-the-store", "calculate-product-final-price", "risk-based-pricing"],
    },
  ],

  theory: [
    {
      id: "lime-t1",
      q: "Rides attach to cities on one key and permit fees settle through an invoices-to-payments chain. When do you insist on a LEFT JOIN in a micromobility read, and what does an INNER join silently drop?",
      a: "The join follows the spine of the question. If the question is ride-shaped — completion share, close lag, fare mix — the ride table is the spine and INNER joins that attach city and vehicle-model attributes are right, because every unmatched row would distort a rate built on ride counts. If the question is compliance-shaped — which permit invoices have NO settlement at all — the invoice table is the spine and LEFT JOIN + IS NULL is the only honest shape: INNER would drop exactly the rows you're hunting for, and a compliance report built on INNER joins reports zero problems by construction. The micromobility discipline is naming the spine per question: demand reads join from rides outward, civic reads join from invoices inward. The honest caveat from this kit's proxy ledger: every ride resolves to a city, so INNER and LEFT coincide on the ride side — which is exactly why the interviewer makes you reason about the shape instead of trusting the data to save you.",
      tag: "joins",
    },
    {
      id: "lime-t2",
      q: "Rank cities by weekly rides. Where do RANK, DENSE_RANK and ROW_NUMBER disagree, and which one do you hand the city-relations lead?",
      a: "They disagree exactly where rides tie. RANK gives both tied cities the same rung and skips the next (1, 2, 2, 4) — the gap implies a missing city that doesn't exist. DENSE_RANK shares the rung and stays compact (1, 2, 2, 3). ROW_NUMBER splits the tie arbitrarily unless you add a deterministic tie-break like city_id, which makes it the dedupe tool, not the leaderboard tool. The city-relations lead gets DENSE_RANK: permit conversations are read as 'you're nth in utilization', and a skipped rung generates a call about a city that was never there. The LIMIT-1-OFFSET-1 'second place' habit breaks on every tie — the honest second place is DENSE_RANK = 2, and if two cities share it, the fleet decision is 'both', not 'whichever the engine sorted first'. At Lime this matters doubly because permit tiers are negotiated off those rankings — a rank that isn't reproducible Monday-to-Monday is a negotiation problem.",
      tag: "windows",
    },
    {
      id: "lime-t3",
      q: "On a rides table — 103 rides, 82 with a completion ping, 16 city entities — narrate what COUNT(*), COUNT(completion_ping) and COUNT(DISTINCT city_id) each return.",
      a: "Three numbers, three grains, all true at once. COUNT(*) is 103 — every ride row, the denominator grain of completion rate. COUNT(completion_ping) is 82 — the completed subset, because COUNT skips NULLs; the gap between 103 and 82 IS the stuck-plus-cancelled picture (14 pending, 7 cancelled on the proxy ledger). COUNT(DISTINCT city_id) is 16 — rides folded back to permit counterparties, the civic grain. The micromobility trap is reporting one grain under another's name: 'rides per city' computed as COUNT(*)/COUNT(DISTINCT city_id) is a real intensity read, but 'completion rate' computed as COUNT(ping)/COUNT(DISTINCT city_id) mixes numerator and audience grains and produces a number above 100% the moment a city hosts three rides. The strong answer assigns a grain to each form out loud — rows, non-null rows, distinct entities — and refuses to let them blur. That three-grain fluency is the most-drilled reflex in this kit.",
      tag: "aggregation",
    },
    {
      id: "lime-t4",
      q: "Completion pings are NULL until a ride ends — 21 of 103 rides here. What is your NULL policy for the zombie-fleet census and the close-lag average?",
      a: "Two different NULLs, two different policies, both stated out loud. For close lag: rides without a completion ping have no latency YET — they're out of scope for the average (which lands at 2.98 days, range 2..4, only because the population is the 82 completed rides), and you never COALESCE the ping to zero or to 'now' — that launders stuck vehicles into the fleet average. For the zombie census: the NULL ping is the SIGNAL, not the noise — FILTER (WHERE completion_ping IS NULL) is the fleet's stuck-and-died tail, 21 rides here, each one tagged pending-or-cancelled so ops knows whether to dispatch a charger or a lawyer. The discipline that survives review: every report prints its population next to its number — 'avg close lag over the 82 completed' and '21 ping-less rides, 14 pending / 7 cancelled' — because in micromobility the NULL rows are either the revenue leak or the compliance incident, and burying them inside an average is how both get missed.",
      tag: "nulls",
    },
    {
      id: "lime-t5",
      q: "A junior writes WHERE status = 'completed' and then reports cancellation share by month. Walk through what pipeline order did to their denominator.",
      a: "Logical pipeline order is FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT, and WHERE runs before aggregation — so the cancelled rides left the fold before the share was computed, and every month reads 0% cancelled (or NULL). Worse, the pending rides stay in the denominator while the cancelled ones don't, so the share is neither 'of all rides' nor 'of finished rides' — it's an accident. The fix is structural: no status filter in WHERE; the fate rule rides INSIDE the aggregation as a CASE or FILTER arm — 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — so numerator and denominator fold over the same rows. HAVING is for gates on the fold's output (which months make the report), WHERE is for rows every metric agrees on. The tell on the proxy ledger: a monthly cancellation table where no month shows the real tails (2 in 2024-07, 2 in 2024-11) is a pipeline-order bug, not a clean month.",
      tag: "pipeline",
    },
    {
      id: "lime-t6",
      q: "Ops asks for 'cities whose ride volume beats the fleet-wide monthly average'. Scalar subquery, derived table, or window — and why?",
      a: "All three answer it; they differ in shape and cost. The scalar subquery — WHERE rides > (SELECT AVG(rides) FROM monthly-fold) — is the cleanest when the threshold is ONE number and the inner fold is staged in a derived table or CTE, not a correlated re-aggregation per row. The derived-table/CTE shape wins when the average must sit beside each city as a column (city, rides, fleet_avg, delta) — compute it once, CROSS JOIN it on, no re-execution per row. The window shape — AVG(rides) OVER () — computes the same grand average in one pass and keeps every row, which makes it the best default when the read is already a fold. The anti-pattern is the correlated scalar that re-aggregates the whole fleet per city — O(n²) in interview, a production incident at scale. The Lime-flavored close: stage the monthly fold in a CTE first (rides per month per city, completed only), because a fleet average computed over gross unlocks bakes the 21 ping-less rides into every city's bar.",
      tag: "subqueries",
    },
    {
      id: "lime-t7",
      q: "Your ride ledger spans 2024-01 to 2025-02 with text timestamps. How do you bucket rides by month and compute close lag without quietly breaking?",
      a: "Two operations, two functions, one stated anchor. Bucketing: SUBSTR(created_at, 1, 7) for the quick group or STRFTIME('%Y-%m', created_at) when the intent should be legible — fourteen buckets, and the anchor (unlock time versus completion time) is a business decision you state, not inherit: unlock-month tells the demand story, completion-month tells the ops story. Duration: JULIANDAY(completion_ping) - JULIANDAY(unlock_ts) converts both texts to fractional days per row, THEN aggregate — avg 2.98, range 2..4 — never average the texts. The traps: DATEDIFF is a MySQL reflex that doesn't exist in SQLite; STRFTIME('%Y') collapses fourteen months into two years and flattens the trend the city review needs; and a WHERE month-filter written as created_at LIKE '2024-07%' works but reads like a hack next to STRFTIME. The strong answer names the function per operation, rounds at the display edge with ROUND(x, 2), and gates month volume in HAVING — COUNT(*) >= bar — not WHERE, because the bar applies to the fold, not the rows.",
      tag: "dates",
    },
    {
      id: "lime-t8",
      q: "A city manager says 'your utilization dashboard shows our city at zero rides this week' but the street team counts scooters moving. What data-quality checks do you run first?",
      a: "Three checks, in order of how often they're guilty in micromobility. First, telemetry completeness: did the ping stream land at all — compare ride counts from the telemetry feed versus the billing feed; a dropped feed shows zero rides while the street stays busy, and the reconciliation query is a two-sided diff by city and day. Second, population drift: did the dashboard's WHERE clause or a deploy change the denominator — a status rename ('shipped' meaning 'ride closed') or a new 'maintenance' status silently excluding rows; on a healthy ledger the status mix (52/30/14/7 on the proxy data) moves gradually, not overnight. Third, dedupe and identity: are vehicles double-counted or rides split across retries — keep-latest with a deterministic tie-break per ride id, and a vehicle-id census to catch re-registered hardware. The Lime twist: when a city shows zero, check the permit book too — an expired permit can mean the city was switched off in config while the fleet kept rolling, which makes it a compliance incident wearing a data-bug costume.",
      tag: "quality",
    },
    {
      id: "lime-t9",
      q: "The permit book keeps every amount in INTEGER cents. Walk me through where the /100 conversion belongs and what the trial-balance tie protects.",
      a: "Cents are the storage truth; currency is a display concern. The rule I follow: aggregate in cents — SUM(amount_cents) — and convert exactly once, at the display edge, with ROUND(SUM(amount_cents) / 100.0, 2). Dividing per row first floats the money mid-pipeline and re-introduces the rounding drift the integer design exists to kill; dividing with /100 instead of /100.0 truncates cents silently — 12,345 becomes 123. The conversion point is also a review point: every money column in a report should trace back to one expression. The trial-balance tie — 181,080 debit against 181,080 credit, delta 0 on this ledger — is the daily trust check that the fold didn't drop or double a side: if debits and credits stop matching after a query change, the fold is broken, not the books. At Lime that tie is what lets a permit report go to a city CFO without a disclaimer.",
      tag: "money",
    },
    {
      id: "lime-t10",
      q: "You need a true rolling 7-day ride count per city. What does the default window frame get wrong, and how do you fix it?",
      a: "The default frame for an aggregate window with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — it's a running total, not a rolling window, so day 30 carries the whole month's rides. Worse, RANGE includes PEERS: two rows tied on the ORDER BY value (same day, two fare lines) enter and leave the frame together, which is right for rank semantics and wrong for row counts. The fix is an explicit frame: ROWS BETWEEN 6 PRECEDING AND CURRENT ROW for a true 7-row window — and you say out loud what a 'row' is: if the fold is one row per city-day, 6 preceding is 7 days; if it's fare-line grain, it's 7 lines, and the metric is a lie with correct syntax. Cumulative fleet reads (rides-to-date, spend-to-date) are the cases where the default running frame is actually what you want. At Lime I stage the daily fold in a CTE first, then window it — frame math on unfolded fare lines is how rolling numbers drift from the deck.",
      tag: "frames",
    },
    {
      id: "lime-t11",
      q: "When do you reach for UNION, UNION ALL and EXCEPT in a micromobility read — and what does UNION silently cost you?",
      a: "UNION ALL when the two folds can't overlap and I want speed: completed rides and ping-less rides stacked into one census never share a row, so dedupe would be wasted work. UNION when duplicates would lie: a city appearing from both the permits side and the rides side should count once in a market-presence list. EXCEPT for the two-sided diff: invoiced permit cities EXCEPT settled permit cities is the outstanding list — and it's directional, so I run it both ways when the census must reconcile. The silent cost of UNION is the dedupe pass: it sorts or hashes the whole stack to remove rows you may have wanted, and if two branches carry slightly different columns the dedupe can mask a fold bug — identical rows that were actually two different facts. My habit: write UNION ALL first, look at the rows, and upgrade to UNION only with a stated reason. The compliance census at Lime — 21 settled, 1 partial, 6 untouched — is three folds I'd rather stack and label than pretend one GROUP BY covers.",
      tag: "setops",
    },
    {
      id: "lime-t12",
      q: "Your month-over-month delta shows NULL for the first month. Do you COALESCE it to zero, and what else does LAG do that surprises people?",
      a: "Leave the NULL. The first month has no predecessor — 2024-01 cannot have a delta — and writing COALESCE(delta, 0) launders 'no answer' into 'flat month', which is exactly the row a planning meeting will average over. The surprise that bites harder: LAG sees the rows that survive the WHERE and HAVING, not the calendar. Filter to months that cleared an 8-ride bar and LAG bridges ACROSS the dropped months — May's previous row becomes March, and the delta silently compares non-adjacent months. If adjacency matters, the filter goes inside the fold or the calendar gets a spine (every month present, zeros filled) before the window runs. LEAD is the same machinery forward-looking — next month's rides beside this month's is the staffing view. At Lime the MoM board prints the NULL explicitly: the first month's dash IS the statement that the window has an edge, and the reviewer knows the bridge rule by heart.",
      tag: "laglead",
    },
    {
      id: "lime-t13",
      q: "Ops wants every city's rides beside the fleet-wide average. A junior writes a correlated subquery in SELECT. What's your performance instinct?",
      a: "Count the executions. A correlated scalar — (SELECT AVG(rides) FROM per_city WHERE region = o.region) — re-runs the aggregate for every outer row: 16 cities is fine in an interview, a million rides in production is an incident. The fix keeps the semantics and changes the shape: compute the average once in a CTE, then CROSS JOIN it on — one row, fanned to every city — or let the window engine do it: AVG(rides) OVER () computes the grand average in the same pass, and AVG(rides) OVER (PARTITION BY region) gives the regional tier for free. My rule of thumb: scalar subqueries are for one-offs against tiny folded sets, windows are for 'beside every row' reads, CROSS JOIN on a single-row CTE is the explicit version reviewers can audit. The tell I look for in the plan is a subquery node inside the scan loop — that's the correlated shape. On this ledger the discipline pays immediately: the fleet average computed over gross unlocks bakes the 21 ping-less rides into every city's bar, so staging the CTE also fixes a definition bug, not just speed.",
      tag: "perf",
    },
    {
      id: "lime-t14",
      q: "Walk me through a query you'd stage as multiple CTEs at Lime — and when you'd collapse it back into one SELECT.",
      a: "Any read where the grain changes twice. The permit-coverage census stages as: fold settlements per invoice (payment grain to invoice grain), then classify against invoices (exact, partial, untouched), then aggregate to city for the follow-up list — three CTEs, each named for the fold it performs, each independently checkable against the probed numbers (21 exact, 1 partial at 4,000.00 of 6,148.00, 6 untouched holding 15,217.00). Collapsing that into one SELECT with nested subqueries hides the grain changes and makes every review a puzzle. I collapse when the staging is one fold and the plan is obvious — a single derived table often reads tighter than a WITH. The line I hold: CTEs are documentation that executes. A reviewer should be able to stop after any CTE, run it, and recognize a real number — monthly rides (8, 9, 8, 7…), vendor revenue (11,130.25 at the top). If a CTE can't be sanity-checked alone, it's doing two jobs and gets split again.",
      tag: "ctes",
    },
    {
      id: "lime-t15",
      q: "A candidate writes GROUP BY month where month is a SELECT alias. It runs. Is that correct SQL, and what's your rule?",
      a: "It runs because SQLite (and MySQL, and Postgres in GROUP BY's case) resolves output aliases in GROUP BY — but it's dialect courtesy, not standard SQL, and SQL Server rejects it on sight. My rule: GROUP BY the expression — SUBSTR(created_at, 1, 7) — or nest the fold so the alias is a real column of a CTE or derived table, and the query survives a dialect change and a reviewer who thinks in standards. The subtler alias trap is ORDER BY, where alias resolution is actually standard and desirable — ORDER BY month on the folded set is correct everywhere. Positional GROUP BY (GROUP BY 1) is legal in several engines and I avoid it in anything shared: column reordering silently re-buckets the fold. At Lime the habit matters because the monthly ledger is a shipped artifact copied between notebooks and dashboards — a query that only runs on one engine's leniency is a deploy blocker, and 'GROUP BY the expression, ORDER BY the alias' is the line I say out loud in review.",
      tag: "grains",
    },
    {
      id: "lime-t16",
      q: "Completion share: what's wrong with SUM(status IN ('delivered','shipped')) * 100 / COUNT(*) in SQLite, and how do you compute shares you can defend?",
      a: "Two bugs in one line. The division: SQLite's / on two integers is integer division — 82 * 100 / 103 = 79, not 79.6 — so every share rounds to a whole number and small months collapse to 0 or 100. The fix is the 100.0 discipline: 100.0 * SUM(...) / COUNT(*) forces the REAL before the division, then ROUND(x, 1) at the display edge. The second bug is conceptual: a share of WHAT? Completion share of unlocked rides (82 of 103 = 79.6) and of resolved rides (82 of 89 = 92.1) are both defensible KPIs — they answer different questions — and the query that doesn't state its denominator in a comment or a column name will get quoted under the wrong one within a week. For shares inside partitions (a city's share of regional rides), the window shape — 100.0 * rides / SUM(rides) OVER (PARTITION BY region) — keeps numerator and denominator folding over the same rows. At Lime the printed number carries its population: '79.6% of 103 unlocked' or it doesn't ship.",
      tag: "ratios",
    },
    {
      id: "lime-t17",
      q: "The fleet lead wants cities split into utilization quartiles. How do you bucket 16 cities in SQL, and where do the edges bite?",
      a: "NTILE(4) over a rides-per-active-vehicle fold: 16 cities, four quartiles of 4, tile 1 is the top utilizers with ORDER BY rides DESC. The edges bite in two places. Ties at a bucket boundary: NTILE is row-count-based, so two cities with identical utilization can land in different tiles — if the tiles feed a comp conversation, switch to DENSE_RANK or PERCENT_RANK and define tiers by value, not by row count. Uneven divisors: NTILE(4) over 18 cities gives buckets of 5, 5, 4, 4 — the extra rows go to the EARLIER tiles, so 'tile 1' is slightly oversized; say it out loud before someone assumes equal sizes. PERCENT_RANK answers the threshold version — 'which cities are above the 75th percentile' — without committing to fixed counts. At Lime I'd print the fold beside the tile (city, rides, active vehicles, tile) so any edge case is visible, and gate the fold on a minimum ride count — a city with two rides and one scooter is a pilot, not a quartile.",
      tag: "tiles",
    },
    {
      id: "lime-t18",
      q: "The monthly ride ledger skips months with zero rides. Why is that a problem, and how do you fix it in SQL?",
      a: "A missing row reads as a missing fact: the stakeholder sees no 2024-06 line and asks whether rides stopped, and every LAG, moving average and chart silently bridges across the gap — a two-month gap renders as one flat step. On this ledger every month has rides (6 to 9), so the trap is theoretical today and structural tomorrow: the moment a city pauses for a permit renewal, its ledger develops holes. The fix is a calendar spine: generate the month range — in SQLite, WITH RECURSIVE months(m) AS (VALUES ('2024-01') UNION ALL SELECT date(m, '+1 month') FROM months WHERE m < '2025-02') — then LEFT JOIN the ride fold onto it and COALESCE the ride count to 0, with an explicit policy note: zero means 'unlocked, nobody rode', not 'no data'. The same spine powers rebalancing reports (docks empty for a week means zero-filled rows, not absence). At Lime the ledger contract is 'every month, every city, zero or not' — a spine is how a query keeps a promise a GROUP BY can't.",
      tag: "datespine",
    },
    {
      id: "lime-t19",
      q: "Unpaid permit fees: LEFT JOIN + IS NULL, NOT IN, or NOT EXISTS — and why does NOT IN deserve suspicion?",
      a: "NOT IN deserves suspicion because of NULL. WHERE i.id NOT IN (SELECT invoice_id FROM payments) is fine while invoice_id is never NULL — the moment one NULL lands in that subquery (a drafted, unposted settlement), NOT IN compares against UNKNOWN for every row and returns ZERO rows: the compliance report goes quietly, completely empty. NOT EXISTS is NULL-safe by construction — it asks 'does any matching row exist' and a NULL never matches — and the optimizer treats it like the anti-join it is. LEFT JOIN + IS NULL is the readable classic and audits well: keep every invoice, keep the ones whose settlement columns came back NULL — 6 invoices, 15,217.00 on this ledger. I default to NOT EXISTS or the LEFT JOIN shape and treat NOT IN as a code smell that needs a NOT NULL guarantee on the probed column, stated in a comment. The stakes are civic: an accidentally-empty outstanding list reads as 'all cities paid', which is the most dangerous sentence a compliance deck can print.",
      tag: "antijoin",
    },
    {
      id: "lime-t20",
      q: "Why is rolling 7-day active riders hard in pure window SQL, and how do you get the number honestly?",
      a: "Because distinct sets don't compose in windows: COUNT(DISTINCT rider_id) OVER (ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) isn't supported in SQLite, and even where engines allow it, the rolling window re-counts distincts per row from scratch — quadratic in the window width. The honest shape stages it: first dedupe to one row per rider per day (a rider's ten rides on Tuesday count once — keep-latest with a deterministic tie-break if the grain needs it), fold to daily actives per city, THEN window the folded counts for the rolling total. For a true rolling-distinct you either accept the daily-fold approximation and label it, or compute distinct-over-range per anchor day in a self-contained CTE and eat the cost deliberately. The reporting sin is the opposite: SUM(daily_actives) over a week presented as 'weekly actives' — that's rider-days, not riders; a commuter riding five days counts five times. At Lime the growth deck quotes rolling-7d actives with the fold stated: distinct riders, deduped daily, then rolled — and the reviewer can recompute it from the CTE chain alone.",
      tag: "distinct",
    },
    {
      id: "lime-t21",
      q: "Two dashboards disagree on completion rate — 79.6% and 92.1%. Both query the same rides. What happened and how do you make it stop?",
      a: "They computed different definitions over the same data: 82 completed of 103 unlocked is 79.6%, while 82 of the 89 RESOLVED rides (completed plus cancelled — pending excluded as 'not yet answerable') is 92.1%. Neither is wrong; they're different KPIs wearing one name, and the org pays for the ambiguity in every review that quotes a number without its denominator. Making it stop is a contract problem, not a SQL problem: the KPI definition lives in one place (a metrics layer, a documented view, at minimum a header comment), names its denominator as part of its name — completion_rate_of_unlocked — and has an owner who version-controls changes. The trip-hazard on this ledger is the pending band: 14 rides can flip the story a full month, so a definition that silently excludes pending must say so where the number is displayed. At Lime the monthly ledger prints the population beside every rate — 'completed of unlocked, 82/103' — because a rate without a denominator is a rumor, and rumor-driven fleet decisions are how you buy scooters for demand that was cancelled.",
      tag: "kpis",
    },
    {
      id: "lime-t22",
      q: "Settlements sometimes arrive as two payment rows for one permit fee. How do you detect split or duplicate settlements — and what would you do about invoice #11?",
      a: "Self-join the payments table to itself on invoice_id with a canonical pair key — a.id < b.id — so each pair appears once regardless of order, then surface the pairs with amounts and dates beside the invoice total. From there the classification is arithmetic: two rows summing to the invoice amount are a SPLIT settlement (legitimate — 5 invoices on this ledger carry two payment rows and are fully paid), two rows summing to LESS with a third expected is an OPEN split, two identical rows on the same day for the same fee are a DUPLICATE charge and go to refunds. Invoice #11 is worse than either: status void, 925.00 settled — a payment against a cancelled obligation. The query is the easy part; the follow-up is the job: reverse or re-issue, and reconcile the trial balance after, because 181,080 = 181,080 has to stay true with the correction in it. At Lime that reconciliation incident has a name on it — void-but-paid is an audit finding, not a data quirk.",
      tag: "dupes",
    },
    {
      id: "lime-t23",
      q: "A month filter written as SUBSTR(created_at, 1, 7) = '2024-07' returns the right rows. Why do I still reject it in review?",
      a: "Because it's the right answer with a performance and portability debt. SUBSTR wraps the column in a function, which makes the predicate non-sargable: any index on created_at is useless, and the scan reads every ride to compute a string per row — fine at 103 rides, a table scan at fleet scale. The sargable shape is a half-open range: created_at >= '2024-07-01' AND created_at < '2024-08-01' — index-seekable, and immune to the boundary bug that BETWEEN '2024-07-01' AND '2024-07-31' commits (it drops every ride stamped later than midnight on the 31st). For bucketing in SELECT, SUBSTR is exactly right — display expressions don't touch the plan. The review rule I apply: functions around columns in WHERE need a stated reason, range predicates for filters, expression folding for labels. At Lime the difference is invisible on the proxy ledger and career-defining on the real one — the telemetry table doesn't have 103 rows, it has billions, and the reviewer who let SUBSTR through signed off on the full scan.",
      tag: "plans",
    },
    {
      id: "lime-t24",
      q: "The billing feed says 82 completed rides; the telemetry feed says 79 for the same morning. Walk me through your reconciliation.",
      a: "Feed disagreement is a contract question before it's a SQL question. First, grain and timestamp: billing counts on unlock time, telemetry on completion ping — the same ride can bill on the 31st and ping on the 1st, so I align both feeds to ONE stated anchor (unlock time, unlock-month) before diffing. Second, latency of arrival: completion pings land up to the close-lag tail (2 to 4 days here) after the ride, so a same-morning cut shows telemetry structurally low — the watermark question is 'as of when', and late-arriving rides get restated, not treated as ghosts. Third, identity: dedupe retries on a deterministic tie-break so one ping per ride, then diff at the lowest shared grain — city and day — and classify every disagreement: timing (restates), duplicates (dedupe), or loss (page the pipeline owner). The monthly ledger then carries a restatement note when a late ping lands — the number for 2024-02 can move after publication, and the deck says so. At Lime the discipline is: two feeds are two witnesses, not one truth — the reconciliation query is how they're sworn in.",
      tag: "contracts",
    },
  ],

  mcqs: [
    {
      id: "lime-mcq-1",
      prompt: "The city review needs rides bucketed by month over a 2024-01..2025-02 span. Which expression builds the month key?",
      choices: [
        "STRFTIME('%Y-%m', created_at)",
        "STRFTIME('%Y', created_at)",
        "YEAR(created_at)",
        "SUBSTR(created_at, 12, 8)",
      ],
      answer: 0,
      why: "STRFTIME('%Y-%m', created_at) yields '2024-01' … '2025-02' — fourteen buckets, one per month, sorting correctly as text. '%Y' alone collapses the span into two buckets (2024, 2025) and flattens the trend; YEAR() doesn't exist in SQLite; SUBSTR at offset 12 grabs the time-of-day, not the month.",
      notes: [
        { choice: 1, why: "Year buckets are the classic flattening bug: fourteen months of seasonality (weekend spikes, winter dips) average into two numbers and the city review loses the story." },
        { choice: 2, why: "YEAR() is MySQL/SQL Server reflex — a dialect slip in a SQLite screen. The equivalent here is STRFTIME, and the format string does the bucketing." },
      ],
      difficulty: "easy",
    },
    {
      id: "lime-mcq-2",
      prompt: "Close lag = unlock-to-ping on completed rides. The ledger's AVG(JULIANDAY(ping) - JULIANDAY(unlock)) over ALL 103 rows returns 2.98 anyway. Why is the WHERE shipped_at IS NOT NULL guard still required?",
      choices: [
        "It isn't — AVG skips NULLs, the math is identical",
        "It isn't — NULLs make the average larger, not equal",
        "The guard changes which RIDES the average covers — it's the population statement, even when the number matches",
        "SQLite requires it before any JULIANDAY call",
      ],
      answer: 2,
      why: "AVG skips NULL deltas by design, so on THIS ledger the number matches (2.98 over 82 rows either way). The guard is still mandatory: it documents that the population is completed rides only, it protects the query when the data changes (a batch of fake 'now' pings would silently shift an unguarded average), and it's the sentence the city review quotes. Population statements are documentation, not decoration.",
      notes: [
        { choice: 0, why: "Right about the number today, wrong about the query forever: an unguarded latency average is one ETL change away from averaging placeholder timestamps. The guard is the definition." },
        { choice: 1, why: "Backwards — NULL deltas are SKIPPED, not averaged as values. If anything, unguarded averages ride on fewer rows than the report claims." },
      ],
      difficulty: "easy",
    },
    {
      id: "lime-mcq-3",
      prompt: "Utilization = rides per ACTIVE vehicle. A colleague divides total rides by ALL registered vehicles per city. What bias does that introduce?",
      choices: [
        "None — registered is the honest denominator",
        "It understates utilization wherever idle or dead vehicles sit in the registry — the 'active' denominator is rides per vehicle that moved",
        "It overstates utilization because registered vehicles ride more",
        "It's fine as long as the numerator uses COUNT(DISTINCT ride_id)",
      ],
      answer: 1,
      why: "Every dead scooter in the registry dilutes the ratio: a city with 100 vehicles, 20 moving and 300 rides shows 3.0 rides/registered but 15.0 rides/active — and the two numbers drive opposite fleet decisions (buy more versus rebalance existing). Utilization's denominator is the fleet that MOVED; the registered denominator belongs to the僵尸-audit conversation, clearly labeled.",
      notes: [
        { choice: 0, why: "Registered is honest for a different question (fleet size). Quoting it as utilization flatters the zombie fleet and starves the rebalancing budget." },
        { choice: 2, why: "Direction's wrong — more registered vehicles can only lower or hold a rides/registered ratio. The bias is dilution by idle hardware, not exaggeration." },
      ],
      difficulty: "medium",
    },
    {
      id: "lime-mcq-4",
      prompt: "The monthly ledger should list only months that hit the 8-ride volume bar. Where does the bar go?",
      choices: [
        "WHERE COUNT(*) >= 8",
        "HAVING COUNT(*) >= 8 after GROUP BY month",
        "LIMIT 8 after ordering by rides",
        "WHERE rides >= 8 before GROUP BY",
      ],
      answer: 1,
      why: "The bar is a gate on a per-group fold, so it lives in HAVING — WHERE has no access to aggregates (it runs before GROUP BY). On the probed ledger, HAVING COUNT(*) >= 8 keeps exactly six months (2024-01, 02, 03, 05, 07, 09 — rides of 8, 9, 8, 8, 8, 9) and drops the seven lighter months.",
      notes: [
        { choice: 0, why: "WHERE can't see COUNT(*) — the query errors. Pipeline order is the lesson: filters on folds come after the fold." },
        { choice: 2, why: "LIMIT 8 keeps the first eight ROWS, not months with eight rides. Plausible chip, entirely different question." },
      ],
      difficulty: "medium",
    },
    {
      id: "lime-mcq-5",
      prompt: "Compliance needs permit invoices with ZERO settlements. Which shape finds them?",
      choices: [
        "WHERE status = 'unpaid' on invoices",
        "FROM invoices LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL",
        "INNER JOIN payments, then filter amount = 0",
        "WHERE NOT (invoice_id IN payments)",
      ],
      answer: 1,
      why: "The classic anti-join: LEFT JOIN keeps every invoice, the unmatched ones carry NULL payment keys, and WHERE p.id IS NULL keeps exactly those — 6 invoices holding 15,217.00 on the probed ledger. Status filters answer a different question ('open' includes a partial that HAS payments), which is why the join-level census is the compliance source of truth.",
      notes: [
        { choice: 0, why: "Status is a human-maintained label: the probed ledger has 6 'open' invoices but 15,217.00 unpaid — status alone misses the partial (4,000.00 of 6,148.00) sitting among them. The anti-join counts settlements, not labels." },
        { choice: 2, why: "INNER JOIN drops the untouched invoices before any filter runs — a compliance report built on INNER joins finds zero problems by construction." },
      ],
      difficulty: "medium",
    },
    {
      id: "lime-mcq-6",
      prompt: "The permit book stores amount_cents as INTEGER. Which expression sums outstanding permit fees into currency?",
      choices: [
        "SUM(amount_cents)/100",
        "ROUND(SUM(amount_cents)/100.0, 2)",
        "SUM(amount_cents/100)",
        "SUM(CAST(amount_cents AS REAL))/1000",
      ],
      answer: 1,
      why: "SUM the integer cents first, divide by 100.0 once at the display edge: 6 invoices, 1,521,700 cents → 15,217.00. Option A works only when every total is a round hundred — integer division truncates fils the moment they exist. Per-row division (option C) floats the money mid-pipeline; the /1000 in option D is a decimal-place bug that shrinks the city's debt tenfold — cities would love it, finance wouldn't.",
      notes: [
        { choice: 0, why: "12,345/100 = 123 in SQLite integer division. The truncation is silent — the worst kind of compliance bug, because the report still ties to SOMETHING." },
        { choice: 2, why: "Dividing per row before summing introduces per-row floats — the exact mid-pipeline conversion the INTEGER-cents design exists to prevent. Sum first, convert once." },
      ],
      difficulty: "medium",
    },
    {
      id: "lime-mcq-7",
      prompt: "The zombie census flags vehicles whose LAST ping is older than 7 days. Which shape computes last-ping age correctly?",
      choices: [
        "WHERE last_ping IS NULL — no ping means old",
        "JULIANDAY('now') - JULIANDAY(MAX(ping_ts)) per vehicle, then filter age > 7",
        "MAX(ping_ts) < 7",
        "COUNT(ping_ts) < 7 — fewer than 7 pings is stale",
      ],
      answer: 1,
      why: "Zombie-ness is a DURATION: fold the newest ping per vehicle (MAX in a grouped or windowed fold), convert both sides to days with JULIANDAY, subtract, then gate on the stated window. The window itself is a policy number you print next to the metric — 'stale = 7+ days' — because a 3-day window cries wolf and a 14-day one reports thefts as trends.",
      notes: [
        { choice: 0, why: "NULL ping means NEVER pinged — a different population (vehicles that never came online) from stale (pinged, then went dark). Both matter; they get different queries and different fleets." },
        { choice: 3, why: "Ping COUNT isn't ping AGE — a vehicle pinging once daily for a year has 365 pings and could still be idle in a closet. Duration needs MAX(timestamp) against a clock, not a count against the number 7." },
      ],
      difficulty: "hard",
    },
    {
      id: "lime-mcq-8",
      prompt: "Rebalancing needs contiguous stretches where a dock stayed fully available. Which technique finds the runs?",
      choices: [
        "GROUP BY availability flag — one group per state",
        "Gaps-and-islands: flag run starts where the previous row (LAG) differed, then SUM the flag over the ordered timeline and GROUP BY the running value",
        "ROW_NUMBER() alone, ordered by time",
        "A self-join of the dock table to itself on date = date + 1",
      ],
      answer: 1,
      why: "Gaps-and-islands is THE contiguous-run technique: order by time, mark run starts (availability changed versus LAG), accumulate the marker as a running sum, and every run gets a stable group id — then MIN/MAX the timestamps per group for the stretch boundaries. It's the shape behind consecutive-available-seats, and the technique screens love because it composes three window moves into one read.",
      notes: [
        { choice: 0, why: "Grouping by the flag merges every full stretch in the city's history into one row — boundaries gone, durations gone. Runs are a sequence property, and GROUP BY destroys sequences." },
        { choice: 3, why: "The self-join catches ONE adjacent pair at a time — a 5-day stretch needs chaining that collapses under its own joins. The running-sum island id is the general solution." },
      ],
      difficulty: "hard",
    },
    {
      id: "lime-mcq-9",
      prompt: "Permit invoice #25 shows 4,000.00 settled against 6,148.00 invoiced. What does the coverage census classify it as, and which expression finds it?",
      choices: [
        "Exact — a payment exists, so it's covered",
        "Partial — SUM(payments) > 0 but < invoice total; found by LEFT JOIN + folded SUM compared to the invoice amount",
        "Untouched — any unpaid balance means no settlement",
        "Void — the remainder proves the invoice was cancelled",
      ],
      answer: 1,
      why: "Partial: money moved but the obligation isn't met — 4,000.00 of 6,148.00 leaves 2,148.00 outstanding. The classification is one LEFT JOIN with a folded SUM per invoice and a three-arm CASE: SUM = amount → exact (21 invoices), 0 < SUM < amount → partial (1), SUM IS NULL → untouched (6). The shortfall column falls out of the same query, which is why the census, not the status label, drives the follow-up list.",
      notes: [
        { choice: 0, why: "'A payment exists' is the exact/partial boundary error — and it's how 2,148.00 of permit debt vanishes from the outstanding report while the city waits for a renewal." },
        { choice: 2, why: "Untouched means SUM IS NULL — no settlement rows at all. This invoice HAS a row; folding it into 'untouched' double-counts the debt it already paid down." },
      ],
      difficulty: "hard",
    },
    {
      id: "lime-mcq-10",
      prompt: "Status census: 52 delivered-status, 30 shipped-status, 14 pending, 7 cancelled rides. A stakeholder quotes '69% completion'. What's the honest share, and what's the trap?",
      choices: [
        "69% is right — 52 of 103 unlocks completed",
        "79.6% — 82 ÷ 103, because delivered AND shipped statuses both carry completion pings; the trap is quoting one completed status as the whole numerator",
        "86.3% — 82 ÷ 95, excluding cancelled",
        "100% — pending rides will complete",
      ],
      answer: 1,
      why: "The completed set is TWO statuses — 52 + 30 = 82 — so the rate is 82/103 = 79.6%. The '69%' quote is the half-the-numerator bug: counting only the delivered-status rows because the status NAME looks more finished. Same ledger, same filter discipline as the completion map: the completed set is defined by the completion ping, stated before the ratio.",
      notes: [
        { choice: 0, why: "52/103 = 50.5%, not 69% — the quote isn't even the half-numerator number, it's a third grain entirely. Ask which population produced it before touching the query." },
        { choice: 2, why: "Excluding cancelled shrinks the denominator by exactly the failures the metric exists to surface — the 7 cancellations are the compliance tail, not noise." },
      ],
      difficulty: "easy",
    },
    {
      id: "lime-mcq-11",
      prompt: "The monthly ledger groups by an alias: SELECT SUBSTR(created_at, 1, 7) AS month ... GROUP BY month. It runs on the SQLite screen. Why does review still ask for GROUP BY the expression?",
      choices: [
        "Aliases are slower than expressions in SQLite",
        "GROUP BY month would double-count rides",
        "Alias resolution in GROUP BY is dialect leniency, not standard SQL — grouping by the expression keeps the query portable and reviewable",
        "Aliases can't be used with aggregates",
      ],
      answer: 2,
      why: "SQLite resolves output aliases in GROUP BY, so the query runs — but SQL Server rejects it and the standard doesn't promise it. Grouping by SUBSTR(created_at, 1, 7) is portable, and on a shipped artifact like the monthly ride ledger the review line is 'GROUP BY the expression, ORDER BY the alias'.",
      notes: [
        { choice: 0, why: "Performance isn't the issue — the engine computes the expression either way. The risk is portability and reviewers who read standards, not engine trivia." },
        { choice: 1, why: "Grouping can't double-count — the grain is identical either way. The failure mode is rejection on other engines, not wrong numbers." },
      ],
      difficulty: "medium",
    },
    {
      id: "lime-mcq-12",
      prompt: "The growth deck wants rolling 7-day ACTIVE riders per city. Why does COUNT(DISTINCT rider_id) OVER (ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) fail, and what's the honest build?",
      choices: [
        "It fails because DISTINCT can't pair with OVER — stage a one-row-per-rider-per-day fold first, then window the folded counts",
        "It fails because ROWS frames can't look backward — use RANGE instead",
        "It works, but only if rider_id is indexed",
        "It fails because DISTINCT needs GROUP BY, so add GROUP BY rider_id to the same query",
      ],
      answer: 0,
      why: "Rolling distinct sets don't compose in window frames — SQLite rejects DISTINCT inside OVER, and engines that allow it re-count each row's window from scratch. The honest shape: dedupe to rider-day grain (one rider's ten Tuesday rides count once), fold daily actives per city, then roll the folded counts — and never present SUM(daily_actives) over a week as weekly actives; that's rider-DAYS.",
      notes: [
        { choice: 1, why: "RANGE changes peer and tie semantics, not DISTINCT support — the frame keyword was never the blocker." },
        { choice: 3, why: "GROUP BY collapses the set you're trying to keep rows of — windows exist precisely to aggregate without collapsing. Mixing them in one pass isn't the fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "lime-mcq-13",
      prompt: "Compliance runs: SELECT ... FROM invoices i WHERE i.id NOT IN (SELECT invoice_id FROM payments). One drafted settlement row carries a NULL invoice_id. What does the outstanding list return?",
      choices: [
        "The unpaid invoices, excluding that one",
        "Zero rows — x NOT IN (…, NULL) is never TRUE, so the entire outstanding list comes back empty",
        "All invoices — the NULL row is skipped",
        "A syntax error",
      ],
      answer: 1,
      why: "NOT IN with a NULL in the list makes every comparison UNKNOWN, and WHERE keeps only TRUE rows — the report returns nothing, silently. That's the most dangerous possible failure for a compliance deck: an empty outstanding list reads as 'every city paid'. NOT EXISTS or LEFT JOIN + IS NULL is NULL-safe by construction.",
      notes: [
        { choice: 0, why: "That's the intuition the trap exploits — humans skip NULLs, three-valued logic doesn't. The engine never finishes the comparison." },
        { choice: 2, why: "Backwards: NULL doesn't get filtered out of the subquery list, it poisons the IN comparison for every outer row." },
      ],
      difficulty: "medium",
    },
    {
      id: "lime-mcq-14",
      prompt: "The fleet census stacks completed rides (82) and ping-less rides (21) into one column. Which operator, and why?",
      choices: [
        "UNION — dedupe guarantees clean counts",
        "INTERSECT — only overlapping rides matter",
        "UNION ALL — the two folds can't share a ride, so dedupe would only cost time and hide bugs",
        "JOIN ON status",
      ],
      answer: 2,
      why: "A ride is either completed (has a completion ping) or ping-less — the sets are disjoint by construction, so UNION ALL stacks 82 + 21 = 103 with no dedupe pass. UNION would sort-and-hash the stack to remove duplicates that can't exist, and if a fold bug ever DID produce an overlap, UNION would silently hide it.",
      notes: [
        { choice: 0, why: "Dedupe is exactly the wrong instinct here: on disjoint sets it's wasted work, and as a bug mask it's worse than wasted. UNION ALL first, upgrade to UNION only with a stated reason." },
        { choice: 1, why: "INTERSECT returns rows in BOTH sets — on disjoint folds that's zero rows, a census of nothing." },
      ],
      difficulty: "easy",
    },
    {
      id: "lime-mcq-15",
      prompt: "The MoM ride board shows mom_delta NULL for 2024-01. The stakeholder asks you to 'fix' it to 0. What do you do?",
      choices: [
        "COALESCE(mom_delta, 0) — zero is the neutral delta",
        "Drop the first month from the board",
        "Use LEAD instead, which has no NULL",
        "Leave the NULL — the first month has no predecessor, and 'no answer' is not 'flat month'; print the dash and say why",
      ],
      answer: 3,
      why: "2024-01 has no previous month in the ledger — the NULL is the honest statement that the window has an edge. COALESCE to 0 launders it into 'flat month', which planning meetings average over. LEAD just moves the NULL to the LAST month; dropping the month hides the boundary from the only people who should see it.",
      notes: [
        { choice: 0, why: "Zero is neutral for arithmetic, not for narrative — a zero delta is a claim ('same as last month') that no data supports." },
        { choice: 2, why: "LEAD computes the next row instead of the previous — the edge NULL moves to the end of the series. The edge itself is unavoidable." },
      ],
      difficulty: "medium",
    },
    {
      id: "lime-mcq-16",
      prompt: "Completion share: SUM(status IN ('delivered','shipped')) * 100 / COUNT(*) returns 79 on the ledger. What's the fix?",
      choices: [
        "ROUND(..., 1) around the whole expression",
        "Multiply by 100.0 (REAL) before dividing — 100.0 * 82 / 103 = 79.6; integer / truncates",
        "Cast the COUNT to TEXT first",
        "Use AVG instead — same truncation but faster",
      ],
      answer: 1,
      why: "82 * 100 / 103 evaluates left-to-right in integers: 8200 / 103 = 79 (truncated), losing the decimal the deck quotes. 100.0 forces the REAL before the division — 79.6 — and ROUND(x, 1) then formats at the display edge. AVG(CASE...) also works (it's already REAL via the boolean), but the 100.0 shape is the one reviewers read at a glance.",
      notes: [
        { choice: 0, why: "ROUND can't recover precision that integer division already destroyed — 79 rounds to 79.0, not 79.6." },
        { choice: 3, why: "AVG of a 0/1 CASE is actually the cleanest share form — but 'same truncation' is wrong; AVG never truncates because it divides as REAL. Right tool, wrong reasoning." },
      ],
      difficulty: "easy",
    },
    {
      id: "lime-mcq-17",
      prompt: "SELECT day, SUM(rides) OVER (ORDER BY day) AS rolling7 FROM daily_folds — the analyst calls it a rolling 7-day. What is it actually?",
      choices: [
        "A running total — the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW; a true 7-day needs ROWS BETWEEN 6 PRECEDING AND CURRENT ROW over a one-row-per-day fold",
        "A rolling 7-day — ORDER BY day implies the frame",
        "A 7-day average — SUM over the window divides by 7",
        "A duplicate of GROUP BY day",
      ],
      answer: 0,
      why: "With ORDER BY but no frame clause, the frame is RANGE UNBOUNDED PRECEDING..CURRENT ROW — a cumulative sum where day 30 carries the whole month. And RANGE includes PEERS: tied ORDER BY values (two fare-line rows on one day) enter together. The true 7-day needs ROWS BETWEEN 6 PRECEDING AND CURRENT ROW over a fold with exactly one row per day — frame math on unfolded fare lines counts lines, not days.",
      notes: [
        { choice: 1, why: "ORDER BY only gives the default frame — a running total. The bug ships because cumulative numbers look plausible next to rolling ones." },
        { choice: 2, why: "SUM never divides — that's AVG. The rolling average needs AVG(...) OVER (ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), and 'divides by 7' assumes 7 rows exist." },
      ],
      difficulty: "hard",
    },
    {
      id: "lime-mcq-18",
      prompt: "A report joins rides to fare lines and reports ride revenue of roughly 2.4x the ledger's 34,833.28. What happened?",
      choices: [
        "The ledger is wrong",
        "Revenue needs a WHERE status filter",
        "Join fan-out: rides repeated once per fare line inflate any ride-grain SUM — fold at the fare-line grain or pre-aggregate before joining",
        "The join needs DISTINCT",
      ],
      answer: 2,
      why: "103 rides fan out to 251 fare lines (~2.4x); any ride-grain column (o.total) summed after the join gets counted once per attached line. The fix is grain discipline: SUM at the grain the money lives on (fare lines: quantity * unit_price), or pre-fold rides in a CTE before attaching lines.",
      notes: [
        { choice: 3, why: "DISTINCT de-duplicates the symptom and can eat real data — two rides with the same total become one row after DISTINCT. Fix the grain, not the symptom." },
        { choice: 1, why: "A status filter changes which rides count; it can't fix multiplication by fan-out. The inflation was row-wise, not scope-wise." },
      ],
      difficulty: "easy",
    },
    {
      id: "lime-mcq-19",
      prompt: "SUM(CASE WHEN status = 'cancelled' THEN 1 END) over rides — no ELSE arm. What does it return and why is it still defensible?",
      choices: [
        "An error — CASE requires ELSE",
        "The cancelled count — missing ELSE yields NULL, and SUM skips NULLs, so the arm IS an implicit ELSE 0 for SUM purposes",
        "Zero — rows without cancelled return NULL which SUM counts as 0",
        "The total ride count",
      ],
      answer: 1,
      why: "ELSE defaults to NULL when omitted; SUM ignores NULLs, so the fold counts exactly the cancelled rows — 7 on this ledger. It's defensible for SUM but a trap for readers: COUNT(CASE WHEN ... THEN 1 END) also works (COUNT skips NULLs), while COUNT(*) around it counts everything. Write the ELSE 0 explicitly — the arm's width is the documentation, and the next reader shouldn't need three-valued logic to trust a census.",
      notes: [
        { choice: 0, why: "ELSE is optional in every SQL dialect — the CASE evaluates to NULL without it, which is a value, not an error." },
        { choice: 3, why: "That's COUNT(*)'s answer, not this SUM's — the fold counts only the TRUE branch, which is the entire point of a conditional fold." },
      ],
      difficulty: "medium",
    },
    {
      id: "lime-mcq-20",
      prompt: "July's rides: WHERE created_at BETWEEN '2024-07-01' AND '2024-07-31'. The July count comes up short against the ledger's 8. Why?",
      choices: [
        "BETWEEN excludes both endpoints",
        "July has 31 days but BETWEEN assumes 30",
        "created_at needs a CAST to DATE",
        "Text timestamps with time components: '2024-07-31 14:22' > '2024-07-31', so the last day's rides fall out — use a half-open range < '2024-08-01'",
      ],
      answer: 3,
      why: "BETWEEN is inclusive on both ends, but '2024-07-31' as TEXT is midnight of the 31st — every ride stamped later that day sorts after it and drops. The half-open shape — >= '2024-07-01' AND < '2024-08-01' — captures the whole month regardless of time components, and it's sargable (index-friendly) where SUBSTR(created_at, 1, 7) = '2024-07' forces a full scan.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive on both ends — that's precisely why the upper bound needs to be next month's first instant, not this month's last day." },
        { choice: 2, why: "A CAST fixes nothing about the boundary — comparing to the 31st's midnight is the bug, cast or no cast. SQLite also compares ISO text chronologically without casts." },
      ],
      difficulty: "hard",
    },
    {
      id: "lime-mcq-21",
      prompt: "Top cities by rides: ORDER BY rides DESC LIMIT 3. Two cities tie for third. What does the query give you?",
      choices: [
        "Both tied cities",
        "One of them — arbitrary without a tie-break; add a deterministic key (city_id) to make the cut reproducible",
        "An error on the tie",
        "A NULL row",
      ],
      answer: 1,
      why: "LIMIT cuts rows, not ties — the engine picks whichever tie sorts first that run, so Monday's deck and Tuesday's deck can name different cities. The fix is a deterministic secondary sort: ORDER BY rides DESC, city_id — the tie-break is a policy decision (alphabetical, permit tier, region) stated in the query. For a cut that must honor ties, DENSE_RANK with a gate on rank <= 3 keeps every tied city.",
      notes: [
        { choice: 0, why: "LIMIT 3 keeps 3 rows, period — ties don't expand it. Keeping both tied cities is the DENSE_RANK move, a different query shape." },
        { choice: 2, why: "Ties are ordinary data, not errors — the danger is exactly that nothing complains while the cut flips between runs." },
      ],
      difficulty: "easy",
    },
    {
      id: "lime-mcq-22",
      prompt: "Utilization quartiles over 16 city entities: NTILE(4) OVER (ORDER BY rides_per_vehicle DESC). What do you tell the fleet lead about the edges?",
      choices: [
        "Ties can straddle a boundary (same utilization, different tiles), and with uneven counts extra rows go to EARLIER tiles — for a comp conversation, define tiers by value (PERCENT_RANK/DENSE_RANK), not row count",
        "Quartiles of exactly 4 — nothing to flag",
        "NTILE requires GROUP BY city first",
        "NTILE ignores NULLs, so cities without rides vanish",
      ],
      answer: 0,
      why: "NTILE is row-count-based: 16 rows, 4 buckets of 4 — but two cities tied at the 4/5 boundary land in different tiles, and if the fold ever yields a count not divisible by 4, the surplus rows fill tile 1 first (buckets of 5, 5, 4, 4 at 18 rows). Tiles are fine for dashboards; decisions that pay money (fleet reallocations, tiered permit fees) need value-defined tiers — PERCENT_RANK or DENSE_RANK with a stated threshold. And gate the fold on a minimum ride count: a city with two rides and one scooter is a pilot, not a quartile.",
      notes: [
        { choice: 1, why: "Equal sizes are the headline, not the contract — ties at the seam are exactly where the dashboard and the spreadsheet disagree." },
        { choice: 3, why: "NULL ORDER BY values sort and get tiles like any row; cities without rides don't vanish, they cluster — which is the minimum-ride gate's job to handle." },
      ],
      difficulty: "hard",
    },
    {
      id: "lime-mcq-23",
      prompt: "The ledger tie: SUM(debit_cents) = SUM(credit_cents) = 181,080, delta 0. A colleague says 'delta 0 proves the books are right.' What's your answer?",
      choices: [
        "Agreed — 0 delta is proof of correctness",
        "Delta 0 only proves no NULLs exist",
        "It proves the fold BALANCES, not that it's right — double-counting both sides, or mis-posting one entry to two accounts with matching debit/credit, still ties; row-level anomalies (void-but-paid 925.00) need their own queries",
        "The tie is meaningless in SQLite",
      ],
      answer: 2,
      why: "The trial-balance check is a completeness gate on the FOLD: debits and credits summing equal means nothing was dropped one-sided. It cannot catch symmetric errors — an entry counted twice on both sides, a payment posted against the wrong invoice but with matching legs — so the tie is necessary, never sufficient. That's why the anomaly census runs beside it: 5 split-payment invoices, 1 partial (4,000.00 of 6,148.00), a void-but-paid 925.00 — each a row-level query. At Lime both print on the same page: the tie proves the book is closed; the census proves it's honest.",
      notes: [
        { choice: 0, why: "The most expensive 'agreed' in accounting — symmetric double-counts tie perfectly. Every auditor learns this on someone else's ledger." },
        { choice: 1, why: "NULLs are one hazard of many; the tie's actual claim is one-sided completeness, and SUM skips NULLs anyway, which is part of the risk." },
      ],
      difficulty: "medium",
    },
    {
      id: "lime-mcq-24",
      prompt: "Find pairs of vehicles whose last pings land on the same day in the same city. What does the join condition need besides a.city = b.city AND date(a.last_ping) = date(b.last_ping)?",
      choices: [
        "Nothing — equality on both keys is complete",
        "a.id <> b.id is enough",
        "A GROUP BY city wrapping the self-join",
        "A canonical key like a.id < b.id so each unordered pair appears once, not twice",
      ],
      answer: 3,
      why: "The naive self-join emits every pair twice — (A,B) and (B,A) — and a.id <> b.id still double-counts while also admitting self-pairs in some shapes. The canonical form a.id < b.id keeps exactly one orientation per pair, which makes pair counts, dedupe and downstream matching deterministic. At Lime this is the same shape as split-settlement detection — two payment rows on one invoice pair up once — and reviewers look for the canonical key before anything else.",
      notes: [
        { choice: 1, why: "<> kills the diagonal but keeps both orientations — every pair reports twice and every 'count of pairs' doubles. The inequality's direction is the dedupe." },
        { choice: 2, why: "GROUP BY changes the question to per-city counts — useful, but it doesn't de-duplicate pair orientations inside the join." },
      ],
      difficulty: "hard",
    },
    {
      id: "lime-mcq-25",
      prompt: "Cities invoiced for permits but with zero settlements. Which set operation answers it directly?",
      choices: [
        "invoiced_cities EXCEPT settled_cities",
        "invoiced_cities UNION settled_cities",
        "invoiced_cities INTERSECT settled_cities",
        "settled_cities EXCEPT invoiced_cities",
      ],
      answer: 0,
      why: "EXCEPT is directional: A EXCEPT B keeps rows in A with no match in B — invoiced-minus-settled is exactly the outstanding list (6 invoices, 15,217.00 here, one per city: Austin 4,937.00 leading). The reversed direction answers the opposite audit — settled without invoice — which is also worth running: a settlement with no invoice is a reconciliation incident wearing a receipt.",
      notes: [
        { choice: 3, why: "Right operator, reversed direction — that audits overpaid or unsanctioned settlements, not outstanding fees. EXCEPT's direction IS the question." },
        { choice: 2, why: "INTERSECT keeps cities present in BOTH — the fully settled market list, the opposite of the follow-up queue." },
      ],
      difficulty: "easy",
    },
    {
      id: "lime-mcq-26",
      prompt: "Invoice #11: status 'void', one payment row, 925.00 settled. Which query finds every void-but-paid fee, and what's the follow-up?",
      choices: [
        "WHERE status = 'void' — the status label already says it",
        "LEFT JOIN settlements on void invoices (or EXISTS per invoice) — status is a label, the payment row is the fact; the follow-up is reverse/re-issue plus a trial-balance re-tie (181,080 = 181,080 must survive the correction)",
        "WHERE amount_cents = 0 — voided invoices zero out",
        "GROUP BY status HAVING COUNT(*) > 1",
      ],
      answer: 1,
      why: "The incident is the COEXISTENCE of 'void' and money moved: a LEFT JOIN from void invoices to their settlements keeps the one with a 925.00 row (and NULL would mean cleanly voided). Status labels are human-maintained and drift; the settlement ledger is the system of record for 'money moved'. The follow-up isn't a query — it's reversing or re-issuing the fee and re-running the trial balance so the tie stays true WITH the correction booked.",
      notes: [
        { choice: 0, why: "Every void invoice matches that filter, paid or not — the label can't see the payment. The join to settlements is the whole point." },
        { choice: 2, why: "Voiding doesn't zero stored amounts on this ledger (#11 still shows 925.00) — and a zero-amount filter would miss the incident while the money sits in payments." },
      ],
      difficulty: "hard",
    },
    {
      id: "lime-mcq-27",
      prompt: "Two July filters: SUBSTR(created_at,1,7) = '2024-07' vs created_at >= '2024-07-01' AND created_at < '2024-08-01'. Same rows. Why does review prefer the second?",
      choices: [
        "It's shorter",
        "SUBSTR is deprecated in SQLite",
        "It's sargable — the range predicate can use an index on created_at, while wrapping the column in SUBSTR forces a full scan; at 103 rides it's invisible, at telemetry scale it's the incident",
        "The range version is the only one that handles time zones",
      ],
      answer: 2,
      why: "Functions around a filtered column defeat index seeks — the planner can't use the index when every row needs a computation first. The half-open range keeps the column bare, seeks the index, and handles the month boundary exactly (no BETWEEN-ends-at-midnight bug). SUBSTR remains the right tool in SELECT for month labels; the review rule is 'expressions for labels, bare ranges for filters'.",
      notes: [
        { choice: 3, why: "Time zones matter for WHERE the boundaries sit, not for sargability — a UTC-stated range is still index-seekable." },
        { choice: 0, why: "It's actually longer — the preference is about the query plan, not keystrokes. The scan-versus-seek difference is the entire argument." },
      ],
      difficulty: "medium",
    },
    {
      id: "lime-mcq-28",
      prompt: "Which cities are top-quartile by rides per active vehicle — and what does PERCENT_RANK() return for the top row?",
      choices: [
        "PERCENT_RANK() OVER (ORDER BY util DESC) <= 0.25 is the portable shape — and the top row returns 0, so the <= keeps the leader",
        "TOP 25% — SQL Server syntax works everywhere",
        "PERCENT_RANK returns 1 for the top row",
        "Neither — quartiles need NTILE only",
      ],
      answer: 0,
      why: "PERCENT_RANK = (rank - 1) / (rows - 1): the leader scores 0, the last row 1 — so the top quartile is pct_rank <= 0.25, with ties sharing the same rank and thus the same percentile. TOP N PERCENT is vendor syntax with less transparency; NTILE buckets by row count and puts ties across seams. For a fleet conversation the percentile also self-documents: 'cities in the top quartile of rides per active vehicle' with the formula in the query.",
      notes: [
        { choice: 2, why: "That's PERCENT_RANK's LAST row, inverted — the formula starts at 0 for the leader; RANK and DENSE_RANK start at 1, which is exactly the confusion to name." },
        { choice: 3, why: "NTILE defines tiers by row count; PERCENT_RANK defines them by value — the right tool when the ask is 'top quartile' rather than 'four equal groups'." },
      ],
      difficulty: "medium",
    },
    {
      id: "lime-mcq-29",
      prompt: "The coverage census reads 21 exact / 1 partial / 6 untouched = 28. The city team claims '21 cities fully settled' and moves on. What's the blind spot?",
      choices: [
        "None — the census is complete",
        "'Exact' means money matched amount — it includes the void-but-paid 925.00 (#11): money moved against a cancelled obligation, so 'settled' isn't 'clean'; the anomaly census runs beside the coverage census",
        "The partial should count as exact",
        "The 6 untouched are duplicated in the 21",
      ],
      answer: 1,
      why: "The coverage census classifies SETTLEMENT behavior, not LEGALITY: #11's payment matches its amount, so it lands in 'exact' while being an audit finding — a city paid a voided fee. Counts that reconcile (21 + 1 + 6 = 28) are necessary but blind to row-level semantics; that's why the reconciliation anomalies (5 split-payment invoices, 1 partial, 1 void-but-paid) print on the same page. At Lime the rule: coverage answers 'did money move', anomalies answer 'should it have'.",
      notes: [
        { choice: 0, why: "The arithmetic reconciles perfectly — and that's the trap: balanced folds say nothing about whether a row means what it claims." },
        { choice: 2, why: "The partial (4,000.00 of 6,148.00) is by definition not exact — collapsing it hides the 2,148.00 shortfall the follow-up list exists to chase." },
      ],
      difficulty: "medium",
    },
    {
      id: "lime-mcq-30",
      prompt: "The board wants one row per permit status with the cities listed inside the cell. Which fold builds it?",
      choices: [
        "GROUP_CONCAT(DISTINCT c.city) with GROUP BY status — optionally ORDER BY c.city inside the aggregate",
        "CONCAT(c.city) with GROUP BY status",
        "STRING_AGG is the only SQLite option",
        "JOIN cities with a comma separator in WHERE",
      ],
      answer: 0,
      why: "GROUP_CONCAT folds many rows into one text cell — with DISTINCT for repeat cities and an inner ORDER BY to make the list reproducible. The output is a display cell, so it's the end of the pipeline, never a join key. SQLite's GROUP_CONCAT is exactly STRING_AGG elsewhere — same shape, different name.",
      notes: [
        { choice: 1, why: "CONCAT glues a fixed number of arguments per row — it can't fold a column across rows. That's the aggregate's whole job." },
        { choice: 3, why: "There's nothing to join on — the cities are already attached to invoices. The fold happens after the join, inside the aggregate." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-lime-1",
      tier: "easy",
      topic: "t4",
      universe: "growth",
      title: "Monthly ride ledger vs the volume bar",
      brief:
        "Lime-flavored case on the storefront db (orders = rides, shipped_at = completion ping): city ops reviews the monthly ride ledger — rides unlocked per month, how many closed with a completion ping, and average close lag per month — and only months that clear the **8-ride volume bar** make the deck. Probed facts: the span runs 2024-01 through 2025-02 with monthly rides of 8, 9, 8, 7, 8, 6, 8, 7, 9, 7, 6, 7, 6, 7 — so exactly six months touch the bar; fleet-wide close lag averages 2.98 days over a 2-to-4-day range; completion pings exist on 82 of 103 rides. Lag arithmetic rides on completed rides only — ping-less rides have no lag YET, and the fold must say so.",
      ask: "Return the months that cleared the 8-ride bar: month, rides, completed rides, average close lag (2 decimals) — earliest first.",
      template:
        "SELECT STRFTIME({1}, o.created_at) AS month,\n       COUNT(*) AS rides,\n       {2}(o.shipped_at IS NOT NULL) AS completed,\n       ROUND(AVG(JULIANDAY(o.shipped_at) - JULIANDAY(o.created_at)), 2) AS avg_close_days\nFROM orders o\nGROUP BY month\nHAVING {3}(*) >= {4}\nORDER BY month;",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month-bucket format",
          why: "STRFTIME('%Y-%m', created_at) yields '2024-01' … '2025-02' — fourteen sortable month keys. '%Y' alone collapses the span into two year-buckets and flattens the trend the city review needs; a bare column name isn't a format string at all.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the completed-rides fold",
          why: "SUM(boolean) adds the 1s: rides whose completion ping landed. MAX(boolean) collapses each month to a 0/1 flag (did ANY ping land), and MIN collapses it to 'did ALL land' — both destroy the count the deck quotes (5, 8, 5, 8, 5, 9 across the six bar-months).",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the volume-bar fold",
          why: "The bar gates on rides per month — COUNT(*) in HAVING, because the gate reads a per-group fold. SUM(*) is a syntax error (SUM needs an expression), and HAVING can't gate on a SELECT alias used as a function.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the ride-volume bar",
          why: "The bar is 8 rides/month: the probed monthly series (8, 9, 8, 7, 8, 6, 8, 7, 9, 7, 6, 7, 6, 7) clears it in exactly six months — 2024-01, 02, 03, 05, 07, 09 — and the surviving rows' rides column must contain the bar itself for the gate to be self-checking.",
        },
      ],
      distractors: ["MAX", "9", "%Y", "MIN", "rides"],
      walkthrough:
        "A month-bucketed ledger where the gate and the grain both live in the fold. STRFTIME('%Y-%m') builds fourteen sortable month keys; COUNT(*) folds rides per month; SUM(shipped_at IS NOT NULL) folds completed rides as a boolean sum — the SQLite idiom for 'count the pings' without a CASE; and AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) rides on completed rides only, because AVG skips the NULL deltas that pending and cancelled rides carry. HAVING COUNT(*) >= 8 (not WHERE — the gate reads the fold) keeps exactly six months: 2024-01 (8 rides / 5 closed / 3.0 lag), 2024-02 (9 / 8 / 3.25), 2024-03 (8 / 5 / 2.8), 2024-05 (8 / 8 / 3.0), 2024-07 (8 / 5 / 2.4), 2024-09 (9 / 9 / 2.89). The distractors encode the standard trend-chart failures: '%Y' flattens fourteen months into two; MAX/MIN in the boolean fold report 0/1 flags instead of counts; the bar at 9 keeps only February and September; and gating on the rides alias turns the bar into a no-op that lets all fourteen months through. Note 2024-07: it clears the volume bar with the WORST close share (5 of 8) — volume gates hide quality, which is why the completed column rides beside it.",
    },
    {
      id: "cs-lime-2",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "City permit compliance audit",
      brief:
        "Lime-flavored case on the storefront db (invoices = city permit fees, payments = fee settlements, customers.city = permit city): the month-close compliance audit lists which cities still owe permit fees — invoices with NO settlement row at all — because an unpaid fee is a launch gate, not a line item. Probed facts: 28 permit invoices total; status census says 6 open (19,609.00) / 21 paid (66,443.00) / 1 void (925.00), but the settlement-level truth is sharper — 6 invoices have zero payment rows (15,217.00 outstanding), one open invoice is only PARTIAL (4,000.00 of 6,148.00 settled), and one {rose:void-but-paid} fee (925.00) needs reconciliation. Fixed 30-day terms; settled fees average 28.4 days to pay (13 fastest, 84 slowest). The ask: top three cities by outstanding value, worst first.",
      ask: "Return the top three cities with unsettled permit invoices: city, unpaid permit count, outstanding value (2 decimals) — worst first.",
      template:
        "SELECT c.city,\n       COUNT(*) AS unpaid_permits,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS outstanding_value\nFROM invoices i\n{1} JOIN payments p ON p.invoice_id = i.id\nJOIN customers c ON c.id = i.customer_id\nWHERE p.id IS {2}\nGROUP BY c.city\nORDER BY outstanding_value {3}\nLIMIT {4};",
      slots: [
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the keep-every-invoice join",
          why: "The audit's spine is invoices: LEFT JOIN keeps every permit fee even when no settlement exists — the unmatched rows carry NULL payment keys and ARE the finding. INNER JOIN would drop exactly those rows and report a clean city list by construction.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the no-settlement test",
          why: "WHERE p.id IS NULL keeps only invoices that matched zero payment rows — the anti-join. IS NOT NULL would return the PAID invoices (the opposite audit), and 'p.id IS 0' matches nothing because payment ids start at 1.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-first direction",
          why: "Compliance chases the biggest exposure first: descending outstanding value puts the largest debtor city on row one. ASC would open the audit with the smallest balance — a correct query aimed at the bottom of the list.",
        },
        {
          answer: "3",
          kind: "number",
          noVerify: true,
          label: "the top-three cut",
          why: "The ask is the top three cities — LIMIT 3 keeps exactly that. The probed ledger spreads the 6 unpaid fees one-per-city (Austin 4,937.00, Cork 3,562.00, Milan 2,794.00 lead the list), so the cut is a real shortlist for city relations.",
        },
      ],
      distractors: ["INNER", "0", "ASC", "5", "NOT NULL"],
      walkthrough:
        "An anti-join where the finding IS the unmatched row. The spine is invoices; LEFT JOIN payments keeps every permit fee, and WHERE p.id IS NULL keeps the 6 that matched zero settlements — 15,217.00 outstanding, one per city: Austin 4,937.00, Cork 3,562.00, Milan 2,794.00, Osaka 1,756.00, Lyon 1,295.00, Madrid 873.00. GROUP BY c.city folds to permit-city grain, SUM(i.amount_cents) / 100.0 converts the INTEGER-cents book to currency exactly once, and ORDER BY outstanding_value DESC + LIMIT 3 hands city relations a three-name shortlist. The distractors encode the audit-killers: INNER JOIN empties the report (matched invoices only, and matched ones have p.id NOT NULL — zero rows survive the WHERE); '0' in the NULL slot matches no payment id; ASC opens the audit with Madrid's 873.00 while Austin's 4,937.00 waits; and LIMIT 5 amputates the cut the ask defined. Note what this view deliberately excludes: the partial (invoice #25, 4,000.00 of 6,148.00 — it HAS a settlement row, so it leaves the anti-join and lands on the receivables follow-up instead) and the {rose:void-but-paid} 925.00 fee — different queries, different owners, and the status column's '6 open' agrees with this census only by coincidence, which is exactly why settlement-level truth beats status labels.",
    },
    {
      id: "cs-lime-3",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "Hardware vendor utilization ledger",
      brief:
        "Lime-flavored case on the storefront db (products = vehicle models, suppliers = hardware vendors, order_items = per-ride fare lines): the hardware QBR asks which vendors' vehicles actually moved — rides touched, fare lines, and fare revenue per vendor — with only vendors clearing the **38-ride bar** making the monthly board. Probed facts: 6 hardware vendors supply the 16-model catalog; fare revenue concentrates fast — Nordic Gadgets AB holds {amber:32%} (11,130.25) and Midwest Hardware Co 26.7% (9,294.93) of the 34,833.28 ledger; the bench spans ratings 3.9–4.8 with only 2 vendors rated {emerald:at least 4.5}. Fare lines total 251 over 103 rides — the fold below re-folds that fan-out back to vendor grain.",
      ask: "Return the vendors that cleared the 38-ride bar: vendor, rides touched, fare lines, fare revenue (2 decimals) — biggest revenue first.",
      template:
        "SELECT s.name AS vendor,\n       COUNT(DISTINCT oi.order_id) AS rides_touched,\n       COUNT(*) AS fare_lines,\n       ROUND(SUM(oi.quantity * oi.{1}), 2) AS vendor_revenue\nFROM order_items oi\nJOIN products p ON p.id = oi.{2}\nJOIN suppliers s ON s.id = p.{3}\nGROUP BY s.{4}\nHAVING COUNT(DISTINCT oi.order_id) >= {5}\nORDER BY vendor_revenue DESC;",
      slots: [
        {
          answer: "unit_price",
          kind: "keyword",
          label: "the fare-line price column",
          why: "Revenue lives on the fare line: SUM(oi.quantity * oi.unit_price) — what was actually charged per line. The bare price chip errors outright (order_items has no price column), and even catalog price would re-price history at list instead of folding the charged grain.",
        },
        {
          answer: "product_id",
          kind: "keyword",
          label: "the ride-to-model key",
          why: "order_items attaches to vehicle models on product_id — the catalog join key. Substituting id joins order_items' own row ids (1..251) against product ids (1..16): a nonsense pairing that still executes and silently reassigns every fare line to a different model.",
        },
        {
          answer: "supplier_id",
          kind: "keyword",
          label: "the model-to-vendor key",
          why: "products carry supplier_id — the vendor attribution. Joining s.id = p.id instead pairs supplier row-ids with product row-ids: two unrelated id spaces that overlap numerically, so the query runs and attributes Nordic's revenue to whichever vendor shares a row number.",
        },
        {
          answer: "name",
          kind: "keyword",
          label: "the vendor fold key",
          why: "GROUP BY s.name names the grain: one row per hardware vendor, six total. GROUP BY s.region re-folds to four region buckets and merges the EU bench into one row — right numbers-shaped output, wrong census — and any non-unique supplier column changes who shares a row.",
        },
        {
          answer: "38",
          kind: "number",
          label: "the rides-touched bar",
          why: "The QBR bar is 38 distinct rides: rides_touched runs 38, 45, 34, 25, 41, 35 across the six vendors, so the gate keeps Nordic (38), Midwest (45) and Shenzhen (41) — and the boundary vendor's 38 stays visible in the output, which is what makes the gate self-checking.",
        },
      ],
      distractors: ["price", "region", "category", "35", "45"],
      walkthrough:
        "A vendor-grain fold with the fan-out guarded at every step. The chain is order_items → products (oi.product_id = p.id) → suppliers (p.supplier_id = s.id): fare lines attributed to vehicle models, models to hardware vendors. COUNT(DISTINCT oi.order_id) is the fan-out guard — Midwest shows 45 rides from 56 fare lines, and a plain COUNT(*) in that column would quote 56 as rides; COUNT(*) is kept as the fare_lines column so both grains print beside each other. Revenue folds from the charged grain, SUM(oi.quantity * oi.unit_price), and the top three match the probed ledger exactly: Nordic Gadgets AB 11,130.25 (43 fare lines / 38 rides), Midwest Hardware Co 9,294.93 (56 / 45), Shenzhen Electro 3,049.07 (47 / 41). HAVING COUNT(DISTINCT oi.order_id) >= 38 keeps exactly those three — Alpine (34), Andes (25) and Pacific (35) go to the quarterly list. The distractors are the vendor-audit classics: bare price errors on the missing column; joining oi.id to p.id re-pairs two unrelated id spaces and silently reattributes revenue; s.region re-folds six vendors into four regions; and the bar at 35 sneaks Pacific Textiles onto a board built to exclude it.",
    },
    {
      id: "cs-lime-4",
      tier: "easy",
      topic: "s6",
      universe: "funnel",
      title: "Regional ride-fate census",
      brief:
        "Lime-flavored case on the storefront db (orders = rides, statuses = ride fates): the city board wants the fate census in one pass — rides, completed (a completion ping: the {emerald:delivered} + {emerald:shipped} statuses), {rose:cancelled}, and cancellation share — for every region with at least 19 rides on the board. Probed facts: the status census runs 52 / 30 / 14 / 7 across 103 rides; regional cancellation shares are APAC {rose:8.1%}, EU 6.7%, US 5.3% (LATAM's 2-ride pilot sits below the bar); completion rate is defined as completed ÷ UNLOCKED — 82 of 103 = 79.6% — never completed ÷ resolved. One fold keeps all fates so numerator and denominator share rows.",
      ask: "Return the region fate census: region, rides, completed, cancelled, cancellation share (1 decimal) — worst share first.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS rides,\n       SUM(CASE WHEN o.{1} IN ('delivered', 'shipped') THEN 1 ELSE 0 END) AS completed,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS cancel_pct\nFROM orders o\nJOIN customers c ON c.id = o.{2}\nGROUP BY c.region\nHAVING COUNT(*) >= {3}\nORDER BY {4} DESC;",
      slots: [
        {
          answer: "status",
          kind: "keyword",
          label: "the fate column",
          why: "The completed arm reads o.status IN ('delivered', 'shipped') — the two statuses that carry a completion ping (52 + 30 = 82 rides). Substituting id or total still EXECUTES but never matches, collapsing the completed column to zeros — a census that says no ride ever finished.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the ride-to-city key",
          why: "Rides attach to permit cities through customers: c.id = o.customer_id. Joining on o.id pairs ride row-ids against city row-ids — overlapping ranges, so it executes and lands rides in the wrong cities; joining on o.total matches nothing (totals start at 25.47) and empties the board.",
        },
        {
          answer: "19",
          kind: "number",
          label: "the region review bar",
          why: "The board reviews regions with at least 19 rides: EU 45, APAC 37, US 19 clear it; LATAM's 2-ride pilot stays out. The bar is self-checking — the surviving US row's rides cell IS 19 — and dropping it to 2 sneaks LATAM back in with a 0.0% share that flatters the map.",
        },
        {
          answer: "cancel_pct",
          kind: "keyword",
          label: "the worst-first sort",
          why: "The review chases the worst share first: ORDER BY cancel_pct DESC reads APAC 8.1%, EU 6.7%, US 5.3%. Sorting by rides or completed puts EU's volume on row one — right numbers, wrong headline — and the share column is the only sort that matches the ask.",
        },
      ],
      distractors: ["id", "total", "2", "45", "completed", "rides"],
      walkthrough:
        "One pass, all fates, one denominator. The fold keeps every status inside the CASE arms so numerator and denominator share rows: completed = SUM(status IN ('delivered','shipped')) — the ping-carrying statuses, 52 + 30 = 82 — cancelled = SUM(status = 'cancelled'), and the share divides by COUNT(*) over the same rows with the 100.0-before-division discipline: 100.0 * 3 / 45 = 6.7 for the EU, where integer 100 * 3 / 45 would print 6. The 19-ride bar keeps the big three and the output reads worst-first: APAC 37 rides / 29 completed / 3 cancelled / 8.1%, EU 45 / 36 / 3 / 6.7%, US 19 / 15 / 1 / 5.3% — every cell agreeing with the probed status-by-region census. The distractors are the fate-census killers: o.id and o.total in the status arm still execute but never match, printing a world where no ride completed; c.id = o.id lands rides in whichever city shares a row number; the bar at 2 re-admits LATAM's 2-ride pilot with its 0.0% share; and sorting by rides or completed leads the deck with EU's volume instead of APAC's 8.1% — the number the review actually exists to discuss.",
    },
    {
      id: "cs-lime-5",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "Bar-month momentum board",
      brief:
        "Lime-flavored case on the storefront db (orders = rides): the momentum board tracks month-over-month ride deltas — but only for months that cleared the **8-ride volume bar**. Probed facts: the 2024-01..2025-02 span carries monthly rides of 8, 9, 8, 7, 8, 6, 8, 7, 9, 7, 6, 7, 6, 7 — six months touch the bar; month keys come from `SUBSTR(created_at, 1, 7)`; the anchor is unlock month (`created_at`), not completion. The LAG subtlety the board must state: the window sees only months that survived the bar, so deltas bridge across dropped months — May's previous bar-month is March.",
      ask: "Return the bar-month momentum board: month, rides, previous bar-month rides, month-over-month delta — earliest first.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR({1}, 1, 7) AS month,\n         COUNT(*) AS rides\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       rides,\n       LAG({3}) OVER (ORDER BY month) AS prev_rides,\n       rides - LAG(rides) OVER (ORDER BY month) AS mom_delta\nFROM monthly\nWHERE rides >= {2}\nORDER BY month;",
      slots: [
        {
          answer: "created_at",
          kind: "keyword",
          label: "the unlock-month anchor",
          why: "Month keys come from the UNLOCK timestamp: SUBSTR(created_at, 1, 7). Re-anchoring to shipped_at re-buckets the 21 ping-less rides into a NULL month and shifts every late ride across a month boundary — the demand story becomes the ops story mid-query.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the volume bar",
          why: "The momentum board carries only months that cleared the 8-ride bar — six of the fourteen. The gate runs before the window computes, so LAG chains just the kept months; a bar of 7 admits ten months and rewrites every delta on the board.",
        },
        {
          answer: "rides",
          kind: "keyword",
          label: "the lagged fold",
          why: "LAG(rides) carries the previous bar-month's ride count beside the current one. LAG(month) executes but pairs month STRINGS into prev_rides — a text column where a count belongs; LAG(1) returns a constant. Both pass, both lie.",
        },
      ],
      distractors: ["shipped_at", "7", "9", "1", "month"],
      walkthrough:
        "A two-stage momentum board where the window's edge is part of the spec. Stage one folds rides per unlock-month — SUBSTR(created_at, 1, 7) over the 2024-01..2025-02 span, fourteen buckets from 8, 9, 8, 7, 8, 6, 8, 7, 9, 7, 6, 7, 6, 7. Stage two applies the 8-ride bar (WHERE rides >= 8 over the fold — the same gate HAVING would apply) and THEN the window runs: LAG(rides) sees only the six surviving months, so 2024-05's previous row is 2024-03 — April's 7-ride month never existed for this query, and the board says so. Output: 2024-01 8 rides with NULL prev and NULL delta (the honest edge — no COALESCE to zero), 2024-02 9/8/+1, 2024-03 8/9/-1, 2024-05 8/8/0, 2024-07 8/8/0, 2024-09 9/8/+1. The distractors target the two classic LAG bugs: re-anchoring SUBSTR to shipped_at rebuckets by completion and dumps the 21 ping-less rides into a NULL month; LAG(month) and LAG(1) execute and put text or constants where a count belongs; and bars of 7 or 9 change the month set, rewriting every delta on the board.",
    },
    {
      id: "cs-lime-6",
      tier: "hard",
      topic: "x2",
      universe: "month-close",
      title: "One-pass permit coverage census",
      brief:
        "Lime-flavored case on the storefront db (invoices = city permit fees, payments = fee settlements, all money INTEGER cents): month-close needs the coverage census in ONE pass — of 28 permit fees, how many have zero settlements, how many settled exactly, how many are partial, and how much permit value is still outstanding. Probed facts: the verified census is {rose:6 untouched} / **21 exact** / 1 partial (4,000.00 of 6,148.00 settled); outstanding value folds the 15,217.00 untouched plus the 2,148.00 partial shortfall; 5 fees carry split settlements and one {rose:void-but-paid} 925.00 fee reminds you that 'exact' means money matched, not that the fee was clean. Three queries become one: three FILTER arms over a folded settlement column.",
      ask: "Return the one-pass census: all fees, untouched, settled exact, partial, outstanding value (2 decimals).",
      template:
        "SELECT COUNT(*) AS all_fees,\n       COUNT(*) FILTER (WHERE COALESCE(p.paid_cents, {1}) = 0) AS untouched,\n       COUNT(*) FILTER (WHERE COALESCE(p.paid_cents, 0) = i.{2}) AS settled_exact,\n       COUNT(*) FILTER (WHERE COALESCE(p.paid_cents, 0) BETWEEN 1 AND i.amount_cents - 1) AS partial,\n       ROUND(SUM(i.amount_cents - COALESCE(p.paid_cents, 0)) / 100.0, 2) AS outstanding_value\nFROM invoices i\nLEFT JOIN (\n  SELECT {3}, SUM(amount_cents) AS paid_cents\n  FROM payments\n  GROUP BY invoice_id\n) p ON p.invoice_id = {4};",
      slots: [
        {
          answer: "0",
          kind: "number",
          noVerify: true,
          label: "the no-settlement fallback",
          why: "COALESCE(p.paid_cents, 0) turns 'no settlement rows' into a comparable zero — the untouched arm's whole trick. Without the fallback, paid_cents IS NULL for the 6 untouched fees and '= 0' never matches, so the anti-join census reads zero problems.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the exact-match comparator",
          why: "Settled-exact means the folded settlement equals the invoiced amount: COALESCE(p.paid_cents, 0) = i.amount_cents — 21 fees. Comparing against i.id instead matches money against row numbers and zeroes the column; the census still returns its row while every classification is wrong.",
        },
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the settlement fold key",
          why: "The derived fold collapses payment grain to invoice grain: SELECT invoice_id, SUM(amount_cents) — one row per fee. Folding on 1 or a non-existent column errors or orphans the join key downstream, and the LEFT JOIN then has nothing honest to match against.",
        },
        {
          answer: "i.id",
          kind: "keyword",
          label: "the coverage join",
          why: "LEFT JOIN keeps all 28 invoices and matches the fold on p.invoice_id = i.id — unmatched fees carry NULL paid_cents and ARE the untouched bucket. Re-keying to i.customer_id joins settlements to city row-ids; the join executes and misattributes money at city grain.",
        },
      ],
      distractors: ["p.invoice_id", "1", "customer_id", "i.customer_id", "order_id"],
      walkthrough:
        "Three queries folded into one pass. The derived table collapses payment grain to invoice grain — SELECT invoice_id, SUM(amount_cents) grouped per fee — and the LEFT JOIN keeps all 28 invoices, matched or not. The three FILTER arms classify from the folded column: COALESCE(paid, 0) = 0 finds the 6 untouched fees; = i.amount_cents finds the 21 settled-exact; BETWEEN 1 AND i.amount_cents - 1 isolates the 1 partial (4,000.00 of 6,148.00). The outstanding column folds the shortfall itself: SUM(i.amount_cents - COALESCE(paid, 0)) / 100.0 = 17,365.00 — the 15,217.00 untouched plus the 2,148.00 partial shortfall, converted once at the display edge. One row: 28 / 6 / 21 / 1 / 17,365.00, reconciling to the probed coverage census. The distractors are the month-close traps: COALESCE to 1 instead of 0 zeroes the untouched arm; matching settlements against i.id misprices every classification while the row count still reconciles; folding payments on the wrong key errors before the join runs; and re-keying the coverage join to customer_id misattributes city money — the audit that finds nothing is the one that ran against the wrong key.",
    },
  ],

  problems: [
    { slug: "bikes-last-time-used", why: "The micromobility signature query: last ride time per vehicle — the freshest-ping fold behind rebalancing sweeps and the zombie census. Theme-curated (0 tagged LC for Lime)." },
    { slug: "consecutive-available-seats", why: "Contiguous availability runs — which docks stayed open through a stretch: the gaps-and-islands shape fleet ops charts hourly. Theme-curated." },
    { slug: "server-utilization-time", why: "Utilization intervals folded per unit — total active time versus wall-clock time, the rides-per-active-vehicle drill in its purest form. Theme-curated." },
    { slug: "calculate-parking-fees-and-duration", why: "Metered duration math with fee bands — scooter pricing by the minute, duration folded from paired timestamps. Theme-curated." },
    { slug: "total-traveled-distance", why: "Conditional SUM over trip distances by ride fate — the one-pass fold behind fleet-distance and wear-telemetry reads. Theme-curated." },
    { slug: "find-zombie-sessions", why: "Sessions that never closed — rides (and vehicles) with no end event: the stuck-ride census that needs a stated NULL policy, micromobility's signature data-quality screen. Theme-curated." },
    { slug: "ar-aging-schedule", why: "Receivables aging buckets — outstanding permit fees banded by days outstanding, the civic month-close query city finance runs. Theme-curated." },
    { slug: "settlement-fails-aging", why: "Failed-settlement aging — fees that bounced and how long they've sat: the follow-up list behind the compliance deck. Theme-curated." },
    { slug: "gl-reconciliation", why: "General-ledger reconciliation — debit versus credit folded per account until the books tie to the cent: the 181,080-equals-181,080 discipline in query form. Theme-curated." },
    { slug: "rolling-7d-actives", why: "Trailing-window distinct riders — one rider's ten rides count once, the rolling-actives drill the growth team lives by. Theme-curated." },
    { slug: "dau-wau-stickiness", why: "DAU over WAU stickiness in windows — engagement intensity for a fleet whose demand is weather-and-weekend shaped. Theme-curated." },
    { slug: "create-a-session-bar-chart", why: "Session-length buckets in one CASE pass — ride-length histograms, the unit-economics read for minute-priced revenue. Theme-curated." },
    { slug: "find-bursty-behavior", why: "Burst detection over event streams — demand spikes around transit hubs and weekends, the surge-shape question city ops asks daily. Theme-curated." },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER keep-latest with a deterministic tie-break — one ping per ride from a retry-heavy telemetry stream, the dedupe layer every Lime dashboard stands on. Theme-curated." },
    { slug: "user-activity-for-the-past-30-days-i", why: "Windowed activity counts over a trailing period — rides and actives in the last 30 days, the trend-line query the city board quotes. Theme-curated." },
    { slug: "tasks-count-in-the-weekend", why: "Weekend versus weekday splits — rebalancing tasks and rides on Sat/Sun, the staffing-shape query behind the weekend sweep schedule. Theme-curated." },
    { slug: "trips-and-users", why: "Cancellation rate per driver with a date-window discipline — the per-city permit review's exact shape: cancellation share by city entity over the rides the window actually requested. Theme-curated." },
    { slug: "game-play-analysis-v", why: "Session gaps per player — first-activity-since logic mapped to riders going quiet, the churn-triage read behind winback sweeps. Theme-curated." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Conditional aggregation over ride fates — riders who used vehicle classes A and B but never C: the multi-fate fold behind mode-mix reads (scooter versus bike adoption per city). Theme-curated." },
    { slug: "median-time-to-convert", why: "Median emulation over event gaps — time-to-first-completed-ride per rider cohort, the onboarding read for a fleet whose first ride decides retention. Theme-curated." },
    { slug: "report-contiguous-dates", why: "Contiguous date runs — which stretches a city stayed fully available, the gaps-and-islands calendar behind the availability SLA. Theme-curated." },
    { slug: "sessionize-events", why: "Sessionizing ping streams into rides — burst-to-session grouping over telemetry, the rebuild-a-ride-from-pings drill every Lime dashboard stands on. Theme-curated." },
    { slug: "maximum-transaction-each-day", why: "Peak event per day fold — the busiest completion ping per day per city, the surge-headline query the morning board leads with. Theme-curated." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Argmax per entity — each rider's most-ridden vehicle model, the personalization fold behind rebalancing by rider preference. Theme-curated." },
    { slug: "transactions-per-visit-histogram", why: "Zero-fill histograms — unlocks-per-visit buckets including the zeros, the honest funnel histogram where cities with zero completions still get a row. Theme-curated." },
    { slug: "team-scores-in-football-tournament", why: "Two-orientation folds stacked — wins and losses folded per team from both sides, the completed-versus-cancelled double-fold census in sport's clothing. Theme-curated." },
    { slug: "league-statistics", why: "Two-sided season table — played/won/drawn folded per team across home and away rows, the UNION ALL aggregation drill behind stacked ride censuses. Theme-curated." },
    { slug: "first-and-last-call-on-the-same-day", why: "First and last event per entity-day — first unlock and last completion ping per vehicle-day, the operating-window fold behind charging schedules. Theme-curated." },
    { slug: "duplicate-charge-pairs", why: "Duplicate settlement pairs — self-join with canonical keys to catch double-charged permit fees, the reconciliation follow-up drill. Theme-curated." },
    { slug: "active-users", why: "Streak windows — consecutive-day riding patterns per rider, the habit-formation read behind pass products. Theme-curated." },
    { slug: "biggest-window-between-events", why: "Biggest LEAD gap — longest silence between pings per vehicle, the zombie-precursor query fleet ops runs before hardware goes dark. Theme-curated." },
    { slug: "the-most-recent-orders-for-each-product", why: "Top-N per group — latest rides per vehicle model with the argmax tie-break, the freshest-activity fold behind redeployment lists. Theme-curated." },
  ],
};
