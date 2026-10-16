// BEAT — Wave-10 (Task 100-beat), mobility domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// BEAT (Taxibeat) — Greek ride-hail born in Athens: driver-supply liquidity, city density economics,
// rating-driven matching and surge windows. The storefront db read honestly as a ride-hail sandbox —
// customers = riders (region = market buckets), orders = rides (delivered = completed 52, shipped = in-ride
// with shipped_at as the ride-start stamp 30, pending = matching 14, cancelled = abandoned 7), order_items =
// ride line records (quantity = distance/time units on the line, unit_price = the rate the line locked),
// products = ride classes / pass SKUs, suppliers = driver fleet partners, invoices = corporate/city
// statements, payments = payment rails (card = app wallet fares, wire = corporate transfers), expenses =
// city opex, ledger_entries = the GL. Finance tables store INTEGER euro-cents — the euro read is
// amount_cents / 100.0; orders.total and order_items.unit_price are REAL dollars already. Angle kept
// DISTINCT from bolt (price-owner regulation, multi-service super-app), gett (B2B corporate ground travel),
// voi (permit economics, charging swaps) and lime (completion pings, zombie telemetry): BEAT = rating-gated
// supply (the 4.5 matching bar, who it bars), density economics at two grains (rides per rider per market),
// and surge-window demand regimes on the monthly spine. Pool provenance: company-pools.md carries NO BEAT
// section — 0 tagged rows — so all 10 topic slug sets and all 16 problems are theme-curated from the pools
// file's theme menu (sql rows only; no write/schema/finance-band rows), 46 distinct slugs, zero topic/problem
// overlap, script-swept. Case briefs quote probed figures from scripts/company-facts.md (including the
// wave-8+9 canonical cells); case cells were re-probed this session against a readonly COPY of db/custom.db
// and every case slot is mechanically verified by scripts/case-audit.ts.
// Accent text-amber-300: grepped `accent:` across all 20 mobility siblings (uber green-400, lyft fuchsia-400,
// ola lime-400, bolt purple-400, grab teal-400, didi amber-200, careem emerald-300, lime green-300, gett
// red-400, freenow yellow-400, via sky-400, indrive indigo-300, blablacar emerald-200, yassir cyan-300,
// gojek rose-300, turo pink-300, zipcar blue-300, cabify violet-300, yango red-300, hertz teal-300) plus the
// landed wave-10 mobility kits sixt (text-orange-300) and voi (text-fuchsia-300) — amber-300 is held by no
// mobility sibling and no wave-10 kit (didi holds amber-200, a different class) and is the closest free
// class to BEAT's yellow taxi-queue brand.

import type { CompanyKit } from "../types";

export const beatKit: CompanyKit = {
  id: "beat",
  domainId: "mobility",
  name: "BEAT",
  tagline: "Greek ride-hail: rating gates, dense-city liquidity, surge windows",
  accent: "text-amber-300",

  brief: [
    "**BEAT** — Taxibeat — is the Greek ride-hail that grew out of Athens' taxi queues into a two-sided marketplace across Greece and Latin America, built on one blunt mechanism: riders and drivers rate each other, and the ratings gate who gets matched at all. The analytics object is the matched ride, and this kit maps the storefront db onto that world: the 16 customers rows are riders (region = market bucket), the 103 orders are rides worth **34,833.28** (average **338.19** against a 25.47 to 1,088.44 spread), and the 251 order_items rows are ride lines — quantity = distance/time units, unit_price = the rate the line locked — **498 units** across the book. The status map is fixed: delivered = {emerald:completed} (52, 50.5%), shipped = {sky:in-ride} with shipped_at as the ride-start stamp (30, 29.1%), pending = matching (14, 13.6%), cancelled = {rose:abandoned} (7, 6.8%).",
    "The data org splits into a supply-liquidity pod (rides per active driver, the matching queue, rating distributions), city ops (density and surge reads per market) and a small finance pod that settles corporate accounts and city statements. A ride books at created_at and `shipped_at` stamps the moment the ride actually starts — **82 of 103 rides** carry the stamp, averaging **2.98 days** of dispatch-to-start lag on the proxy clock (range 2–4), while the 14 still-matching rides have none yet (a population definition, not a cleanup job). Money sits one layer down: corporate statements and settlement rails in INTEGER cents, where the euro read is `amount_cents / 100.0` — and **6 statements worth 15,217.00** have no settlement legs behind them at all.",
    "Interview screens are liquidity-first. A loop opens with the **two-grain density census** — the EU market runs **45 rides from just 8 riders (5.6 per rider)** while the US runs **19 from 2 (9.5)** — then escalates into the {amber:rating gate}: only fleet partners rated **4.5** and above receive matched rides, which bars Midwest Hardware Co at 4.4 despite it carrying 26.7% of the book, and the interviewer wants the survival rule stated before any SQL. Late rounds walk the {sky:surge window} spine — 14 monthly buckets from 2024-01 to 2025-02, the book opening at 3,731.97, troughing at 1,193.86 in July — and probe denominators out loud (*'does an abandoned unlock sit in your completion base?'*). Candidates who state the population before the query are the ones who get the callback.",
    "Preparation strategy: the pools file carries no BEAT section — **zero tagged rows** — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: match funnels, density censuses, rating-gated supply folds, surge-band CASE pivots and the cents-safe settlement spine. Do the topics in order, then run **both case studies** on the live storefront db: one rebuilds the {emerald:rating-gated fare book} the supply pod reviews every Monday, the other rebuilds the {violet:surge-window census} city ops reads before the demand meeting. The bar to clear: *state which population you are measuring — booked, matched, started or completed — before you compute anything*, then make every status census reconcile to 103 by construction.",
    "The metric wall holds twelve numbers and every one carries its denominator in the name. Concentration is the quiet one: riders whose lifetime spend clears 3,000.00 carry **63.5%** of the whole book, and the two-ride LATAM market still books an average **426.22** a ride — *thinnest coverage, richest tickets*. The fare-band read is honest about limits: 8 budget classes average 32.06 against 8 mid-band classes at 111.5, and the premium band at 200 and up is empty — top price in the catalog is 199.99, so any premium-mix ask gets re-scoped, not faked. The money walls sit beside the demand walls: card rails carry 16 settlement legs / 37,364.00 against wire's 11 / 32,248.00, and city opex runs **25,416.00** with Rent alone at 66.1% — *the numbers a Monday close actually opens on*.",
    "Stretch prep goes three places the first pass didn't. Set ops first: the board packet stacks populations — UNION ALL for the grand-total row, EXCEPT for who never showed up — and the dedup a bare UNION does silently is a correctness question, not a style one. Percentiles and pairing screens second: NTILE fare cuts and the self-join duplicate screen are how the finance pod hunts double-billed lines. Then run all four new case studies on the live storefront db — {emerald:the settlement coverage census}, {sky:the contraction register} off the month spine, {violet:the rail mix} with its TOTAL row, {amber:the latency floor} by market. The bar does not move: *state the population, reconcile every fold to 34,833.28 by construction, and let the TOTAL row prove the stack*.",
  ],

  dayInLife: [
    "**08:15 —** The day opens on the supply board: overnight bookings against rides that actually started, the abandoned-unlock heatmap, and the matching queue's age. First query is the one-pass status census — 52 completed + 30 in-ride + 14 matching + 7 abandoned = **103 by construction** — and a branch that fails that identity is *the day's first incident*, not a rounding note. Next the queue triage: the 14 pending rides sit EU 6 / APAC 5 / US 3, and if dispatch-to-start drifts off the **2.98-day** norm — APAC fastest at 2.93, LATAM slowest at 3.5 — the liquidity pod re-cuts driver incentives before the evening demand peak, *because a rider who never gets matched is a rider the competitor app gets*.",
    "**11:30 —** Midday is the density and gate read. City ops wants the two-grain census refreshed — EU 45-from-8 against US 19-from-2, intensity beside coverage, because surge fires where riders concentrate — and the supply pod wants the {amber:rating gate} re-run: partners at 4.5 and above keep the matched book (Nordic 4.6, Alpine 4.8), Midwest at 4.4 stays barred no matter how big its delivered value reads. A line-level ask lands mid-meeting: attach ride class and locked rate to every line and the join fans 103 rides into **251 lines / 498 units** — the analyst writes the query twice, *once to answer, once with the grain spelled out, because quoting minutes under a ride count is how a market looks busier than it is*.",
    "**15:30 —** The afternoon tilts toward money. The settlement anti-join refreshes first — **6 never-settled statements worth 15,217.00** — before corporate billing sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000.00 of 6,148.00 settled) and feeds the dunning draft; the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero settlement legs (#28, 1,756.00). The rails read closes it — card 16 legs / 37,364.00 against wire 11 / 32,248.00, wallet fares versus corporate transfers. The day ends the way every close does: the GL trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
    "**18:45 —** The write-up hour. The ledger closes the way the day opened: trial balance **181,080 against 181,080**, delta zero, so {emerald:the close ships} and the packet goes out before six. The contraction register leads the demand note: eight down-months on the 14-month spine, headed by the **-1,326.87** November slide, with the July trough of 1,193.86 flagged beside its 2 abandoned rides. Then the latency floor — three markets clear the fifteen-started-ride bar and the US sets the slow pace at 3.07 days, while LATAM's two-ride 3.5 gets a footnote, not a panel. The last pass is quiet: *every KPI in the packet carries its denominator in the caption*, because the reviewer who finds an unnamed population stops reading and starts debugging.",
  ],

  metrics: [
    { name: "Completed-ride share", what: "Delivered ÷ ALL rides booked: 52 of 103 (50.5%), with 30 more in-ride (29.1%). The denominator — matching and abandoned included — is the whole interview; 52 of 82 started is a different metric with a different name." },
    { name: "Matching queue", what: "Rides parked in pending = matching: 14 of 103 (13.6%), sitting EU 6 / APAC 5 / US 3. The liquidity pod's live backlog — a queue that grows is demand the fleet is failing to catch, and it stays in every completion denominator." },
    { name: "Start-stamp coverage", what: "Rides with shipped_at stamped ÷ all booked: 82 of 103 (79.6%), dispatch-to-start averaging 2.98 days (range 2–4; EU 2.94, APAC 2.93, US 3.07, LATAM 3.5). The population statement — started rides only — IS the metric." },
    { name: "City density index", what: "Rides per rider per market: EU 45-from-8 (5.6), US 19-from-2 (9.5), APAC 37-from-5, LATAM 2-from-1. Surge economics live in the gap between load and coverage — dense markets are where matched-ride economics actually work." },
    { name: "Rating-gated fleet", what: "Fleet partners at the 4.5 matching bar: Nordic Gadgets AB 4.6 (32% of book value) and Alpine Audio GmbH 4.8 (13.7%) pass; Midwest Hardware Co at 4.4 carries 26.7% of the book and is barred anyway. The gate is a policy number, and it overrides size." },
    { name: "Surge-window spine", what: "The 14-month demand spine (2024-01 to 2025-02): book opens 3,731.97, troughs at 1,193.86 in July, jumps +1,158.21 into August, drops -1,326.87 into November. Demand regimes, not averages — surge windows are read off the spine." },
    { name: "Abandoned-unlock share", what: "Cancelled ÷ booked: 7 of 103 (6.8%), sliced by market — APAC 8.1% worst, EU 6.7%, US 5.3%, LATAM 0. The rider-patience number that prices matching speed; every abandoned ride was demand the rating gate never got to serve." },
    { name: "Corporate outstanding", what: "Statements with no settlement legs: 6 worth 15,217.00, against a coverage census of 21 exact / 1 partial (4,000.00 of 6,148.00) / 6 none. Settlement runs 28.4 days against fixed 30-day terms (fastest 13, slowest 84) — and the GL ties 181,080 against 181,080." },
    { name: "Rider concentration", what: "Lifetime spenders at 3,000.00 and above carry 63.5% of the book (71.2% at the 2,000.00 line) off a top ladder that runs 7,262.35 / 6,640.56 / 4,574.23. The concentration read prices loyalty grants — and warns that the book rides on a handful of riders." },
    { name: "Fare-band mix", what: "Class price bands under the facts ceiling: 8 budget classes average 32.06 against 8 mid-band classes at 111.5 — and the premium band at 200 and up is EMPTY (catalog tops at 199.99). The band census kills premium-mix asks before they become dashboards." },
    { name: "Settlement-rail mix", what: "Card legs 16 / 37,364.00 against wire 11 / 32,248.00 — wallet fares versus corporate transfers, 27 legs footing 69,612.00. The rail split is the first cut of every settlement review and feeds the split-rail statement screens." },
    { name: "City opex burn", what: "36 expense entries totaling 25,416.00: Rent 16,800.00 across 14 entries (66.1%), Ads 4,570.00, Travel 2,521.00, Tools 1,525.00. The fixed-cost read that anchors every monthly close against the demand spine." },
  ],

  topics: [
    {
      name: "Match-funnel counts",
      why: "Every BEAT screen opens with the funnel: rides booked, matched (left pending), started (shipped_at stamped), completed. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-ride trip 'completed' — 30 versus 52 on this db — and the follow-up is always the 21 rides that never started at all.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "funnel-step-conversion"],
    },
    {
      name: "Two-grain density censuses",
      why: "Rides and riders are different grains of the same join, and density economics reports both: EU runs 45 rides from 8 riders while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is fleet load and which is rider coverage — is the habit being graded. The ratio between them is the intensity read that decides where surge windows actually bite.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Rating-gated supply joins",
      why: "Fleet partners carry the rating that gates matching, and rides inherit supply through joins whose type decides who survives. A ride without a partner is corruption; a gate-eligible partner with no matched rides is a supply hole — and the LEFT JOIN that proves it is one WHERE-clause slip away from silently becoming an INNER. On this db the never-riding anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "employee-bonus", "sales-analysis-ii"],
    },
    {
      name: "Ride-line fan-out: units × rate",
      why: "Line-level reporting attaches ride class and locked rate to every ride line — the products-to-order_items join where quantity is distance/time units and unit_price is the rate. BEAT's follow-up is always the fan-out: join lines in and COUNT(*) silently stops counting rides — 103 rides become 251 lines and 498 units, three grains wearing one query.",
      slugs: ["product-sales-analysis-ii", "product-sales-analysis-iii", "queries-quality-and-percentage"],
    },
    {
      name: "Fleet leaderboards & ties",
      why: "Hardest-working partner, heaviest rider, top market by units — supply reporting is leaderboard reporting. BEAT drills the rank trio because ties are guaranteed at marketplace scale — four riders sit at 4 rides each on this db under a 24/17/14/13/5 ladder — and the LIMIT-1-OFFSET-1 habit breaks exactly there, handing a bonus to whichever rider the engine happened to list first.",
      slugs: ["rank-scores", "top-travellers", "department-top-three-salaries"],
    },
    {
      name: "Surge-band classification (CASE)",
      why: "Demand regimes are CASE-shaped: months fold into peak, standard and surge-watch bands at fixed thresholds, and every ride inherits a window. The arms must be exhaustive and ordered — a hole in the CASE is a hole in the demand forecast, a reordered WHEN quietly re-bands the book, and a month priced by the wrong regime is revenue left on the table.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month ride spine (2024-01 to 2025-02) is the demand meeting's home turf: prior month beside current, delta rounded, the 1,193.86 July trough and the +1,158.21 jump into August named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero — and the spine gets verified against the data, not assumed from a seasonality story.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets completed, in-ride, matching and abandoned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift while the supply standup is waiting on one number.",
      slugs: ["active-businesses", "count-salary-categories", "create-a-session-bar-chart"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — never-settled statements beside fully settled ones, this month beside last — and the never-matched anti-join is the supply pod's first query at every review. UNION dedups whole rows silently, which makes it a correctness question, not a style one; a stacked packet that loses a row is a fleet that looks busier than it is.",
      slugs: ["customers-who-never-order", "movie-rating", "the-airport-with-the-most-flights"],
    },
    {
      name: "Settlement & cents discipline",
      why: "Completed is not settled — the finance tables (28 statements, 27 settlement legs, INTEGER cents) are where the marketplace meets money. Every euro read is amount_cents / 100.0, the exact/partial/none coverage split (21 / 1 / 6) is one CASE away, and the 30-day terms clock (28.4-day average settlement) is the corporate-credit read.",
      slugs: ["bank-account-summary-ii", "ar-aging-schedule", "monthly-transactions-ii"],
    },
    {
      name: "Grand-total stacks (UNION ALL)",
      why: "Board packets end on a TOTAL row, and BEAT's are built, not hand-typed: per-rail settlement folds stacked over the whole-table fold with a literal 'TOTAL' label. UNION ALL is the honest stack — it never dedups — while a bare UNION silently collapses rows that happen to match, and a missing label leaves the grand row unaccountable. The audit reflex: the stacked TOTAL must reconcile to its parts, 69,612.00 against 37,364.00 plus 32,248.00, every single time.",
      slugs: ["league-statistics", "count-apples-and-oranges", "team-scores-in-football-tournament"],
    },
    {
      name: "Median & percentile cuts",
      why: "Fare distributions are not means: the 338.19 average hides a 25.47 to 1,088.44 spread, and percentile cuts are how the pricing pod sees the skew. NTILE, PERCENT_RANK and the median-by-window drill turn 'average fare' into 'where the middle of the book actually sits'. BEAT drills them because surge decisions live in the tails of the fare curve, not at its mean.",
      slugs: ["median-employee-salary", "station-median", "second-most-recent-activity"],
    },
    {
      name: "Pairing screens (self-joins)",
      why: "Double-billed lines, twin legs on one statement, driver-also-rider checks — the finance pod's favorite screens are self-joins with an asymmetric key (a.id < b.id) so each pair counts once. The skill is keeping the pairing predicate honest: drop the inequality and every row pairs with itself; forget the mirror rule and the same pair counts twice. On this book the split-rail statements — five cycles settling on BOTH card and wire — are exactly the pairs a self-join surfaces.",
      slugs: ["symmetric-pairs", "most-common-course-pairs", "number-of-times-a-driver-was-a-passenger"],
    },
    {
      name: "Membership & semi-joins (EXISTS/IN)",
      why: "The never-settled anti-join has three spellings — LEFT JOIN … IS NULL, NOT EXISTS, NOT IN — and they do not behave identically once NULLs join the list. BEAT drills the semi-join shapes because supply-hole and settlement-hole questions are membership questions: who IS in the gated bench, who is NOT in the settled book. Choosing the pattern out loud, with its NULL semantics and its fan-out behavior, is exactly what the follow-up is fishing for.",
      slugs: ["number-of-accounts-that-did-not-stream", "ad-free-sessions", "students-with-invalid-departments"],
    },
    {
      name: "Demand histograms & buckets",
      why: "Ride value does not distribute evenly, so city ops reads histograms, not just means: fare bands, spend buckets, sessions per rider. The bucket edges are a contract — fixed CASE bands or NTILE quantiles — and zero-fill matters, because a band with no rides is a finding, not a hole in the query. Bucket edges chosen after seeing the data is how a surge story gets manufactured.",
      slugs: ["spend-histogram", "transactions-per-visit-histogram", "count-the-number-of-experiments"],
    },
  ],

  theory: [
    {
      id: "beat-t1",
      q: "Your supply report joins rides to fleet partners, and partners carry the rating that gates matching. When do you INNER and when do you LEFT — and what silently breaks if you filter a ride column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A fare report joins rides to their partner: a ride with no partner row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A gate-coverage report must be LEFT from partners: partners with no matched rides ARE the answer — a supply hole the matching engine never filled — arriving with NULL ride columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload partner row — the LEFT quietly became an INNER and the empty bench vanished while the query still reads fine. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero — all six partners appear in the ride book somewhere — and proving that zero is itself the analyst's job, because the same query on a staging table ships an empty supply-hole list that looks like a victory. And the gate itself is a separate population decision: rating >= 4.5 filters PARTNERS, not rides — put it on the wrong side of the join and you have silently deleted every ride the barred partner would have carried, which is a different report wearing the same columns.",
      tag: "joins",
    },
    {
      id: "beat-t2",
      q: "Four riders tie at 4 rides on the utilization leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder runs 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which rider gets the loyalty grant first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer riders (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment. At BEAT this is not academic: the leaderboard feeds driver-supply bonuses and rider loyalty grants, and two partners or riders with identical records must never read different rungs because the query guessed. Say the policy, then let the window function implement it — never the reverse.",
      tag: "windows",
    },
    {
      id: "beat-t3",
      q: "The census shows 103 rides and 16 riders; the EU market shows 45 rides and 8 riders. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts ride rows after the join — one row per ride, so a rider with 24 rides contributes 24. COUNT(DISTINCT customer_id) folds those rows back to riders — the EU market's 45 rides collapse to 8 logos. Neither is wrong: rides measure fleet load and matched demand, riders measure installed base and coverage. The ratio — 5.6 rides per rider in the EU against 9.5 in the US on this db — is the density signal that decides where surge windows actually fire and where the fleet grows next. The trap that catches candidates is a third grain: join order_items for ride lines and COUNT(*) silently counts lines, not rides — 251 of them — and SUM(quantity) is a fourth grain, the 498 distance/time units the fleet actually turned. Saying 'one row per what?' for every COUNT is the habit the panel grades, because density quoting one grain under another's name is how a market looks liquid when it is thin — and surge pricing built on that mistake lifts fares in a market with no supply to lift.",
      tag: "aggregation",
    },
    {
      id: "beat-t4",
      q: "shipped_at is NULL until the ride actually starts. What is your policy for the dispatch-to-start report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only started rides have a lag, so the report measures dispatch-to-start for the 82 of 103 rides that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL rides returns the started-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the started subset; the gap between it and COUNT(*) is exactly the 14 matching plus 7 abandoned rides, which is a feature, not a bug — that gap IS the liquidity picture the incentive engine works from. What is never acceptable is IFNULL-ing the lag to zero to 'fix' the average — that invents same-day starts for rides that never left the curb, and the driver-incentive plan gets staffed off a fiction. A report whose WHERE clause is doing definitional work without saying so is exactly what a BEAT reviewer hunts for, because the same NULL ambiguity feeds three different KPIs: rides started, rides completed, and demand that never got served at all.",
      tag: "nulls",
    },
    {
      id: "beat-t5",
      q: "The supply review wants fleet partners carrying at least fifteen completed rides. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-ride, matching and abandoned rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The fifteen-ride floor is a group-level fact — HAVING COUNT(DISTINCT ride) >= 15 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between the supply bench and an error, and between a threshold applied to rides versus to fare value. On this db the delivered-ride counts per partner run 23, 20, 17, 17, 17 and 12 — a floor of 15 keeps five partners and drops the smallest, which is precisely the thin-supply flag the review wanted the query to raise. The strong answer places every filter by asking: is this a fact about one ride, or about a partner?",
      tag: "pipeline",
    },
    {
      id: "beat-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 rides always produce a mean (338.19 on this book). On filtered staging tables — one market, one status, one surge window — the empty-inner-query bug ships regularly, and the above-average filter is how it hides: cut the spine to a thin month and the whole big-ticket report evaporates exactly when the demand meeting needs it. The correlated cousin (compare each ride to ITS rider's own average) re-runs per outer row and answers a different question at a different cost — 'is this ride big for THIS rider' rather than for the network — which is the frequency-vs-value question, not the fleet-mix one. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "beat-t7",
      q: "The demand team wants surge windows by hour of day, but the ride feed's timestamps are TEXT. How do you bucket by month, cut a quarter without losing its last night — and what do you do when the data cannot support the ask?",
      a: "Three moves, plus one honesty check. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and month-end is exactly when corporate rides land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero. The honesty check: this feed's timestamps carry date grain only — SUBSTR(created_at, 12, 2) returns an empty string, so an hour-of-day surge window is UNCOMPUTABLE here. The strong answer says so, then re-scopes: surge regimes at the day and month grain (the 3,731.97 open, the 1,193.86 July trough), and files the hour-grain ask against the feed owner. Discovering the grain limit beats fabricating a window — a fabricated hour cut is a demand curve invented out of an empty string.",
      tag: "dates",
    },
    {
      id: "beat-t8",
      q: "Finance says a corporate statement is 'paid' but the settlement rails have no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN settlement legs, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a settlement leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes; a partial (#25, 4,000.00 of 6,148.00) needs the coverage CASE, not a binary paid flag. The money rule: statements and settlements carry INTEGER cents, so every euro read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent statement in the corporate book. Reconciliation culture here: the coverage split must read 21 exact / 1 partial / 6 never-settled, and the GL trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "beat-t9",
      q: "Your cumulative booked-value walk jumps two rows at once, and the panel asks why the default frame did that. Walk me through RANGE versus ROWS — and when each is the honest choice.",
      a: "With an ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers: every row tied on the ORDER BY key enters the aggregate together. On a deduped month spine ties never happen, so the default reads fine; on a market-by-market stack where two markets share a month key, the running sum takes a double step and the walk is fiction. The fix is naming the frame: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks strictly row by row, and narrower frames — ROWS BETWEEN 1 PRECEDING AND CURRENT ROW — build the trailing two-month moving average the demand note actually asked for. The discipline is being able to say, for every cell a window prints, exactly which rows contributed: all history (cumulative), one trailing step (moving), or the whole partition (grand total). At BEAT this is not style: the surge packet reads running booked value off the 14-month spine — the 3,731.97 opening descending into the 1,193.86 July trough — and a frame that silently absorbs a peer re-prices a demand regime without anyone deciding it should.",
      tag: "frames",
    },
    {
      id: "beat-t10",
      q: "A per-market running booked value keeps accruing across markets — EU's total bleeds into APAC's rows. What went wrong, and what does PARTITION BY actually promise?",
      a: "Every window function computes over a partition, and when you never name one the partition is the whole result set — the running sum never restarts and each market inherits the previous market's history. PARTITION BY region is the fix, but the deeper point is that the partition clause is a population statement: it declares that this metric restarts per market, the same way GROUP BY declares that a fold restarts per market. The panel wants that said out loud, because a wrong partition does not error — it redefines the metric. On the BEAT book the per-market cuts are EU 15,089.23, APAC 11,605.45, US 7,286.16 and LATAM 852.44 of the 34,833.28 book; a per-market cumulative that restarts cleanly at each boundary is what makes those four numbers auditable against the monthly spine. The failure mode to name: with the partition missing, no cell looks wrong — every number is a legal sum, just of the wrong population, and the surge meeting is reading arithmetic instead of demand.",
      tag: "partition",
    },
    {
      id: "beat-t11",
      q: "The board packet stacks per-rail settlement folds and a TOTAL row. UNION or UNION ALL — and what does a bare UNION do that can silently lose money?",
      a: "UNION ALL stacks; UNION stacks and then dedups whole rows — and the dedup is the bug. Two folds that happen to produce identical rows — same leg count, same euros, different business meaning — collapse into one, and the packet undercounts with no error and no warning. INTERSECT and EXCEPT carry the same column contract: both branches must project the same number of columns with compatible types, and the ORDER BY belongs once, at the end of the compound, naming the output columns — never inside a branch. The house rule for packets is UNION ALL with an explicit label, because the audit question — does the stack foot — is only answerable when nothing was quietly deduped. On this book the rail footing is card 16 legs / 37,364.00, wire 11 / 32,248.00, TOTAL 27 / 69,612.00, tying to the ledger cash credit to the cent; a missing TOTAL row is a formatting nit, but a silently collapsed rail row is a settlement number nobody can trace — and the reviewer who finds it stops trusting the whole packet.",
      tag: "setops",
    },
    {
      id: "beat-t12",
      q: "The dunning list gets rewritten from LEFT JOIN … IS NULL to NOT IN (SELECT invoice_id FROM payments_stg) and comes back empty on staging, while the production copy works. What happened?",
      a: "NOT IN carries a NULL landmine: if the subquery returns even one NULL, every comparison becomes UNKNOWN, the WHERE keeps nothing, and the list is empty while looking perfectly valid. Three spellings, three behaviors: LEFT JOIN … IS NULL is fan-out-proof and explicit about the unmatched arm; NOT EXISTS is NULL-safe — an unpaired outer row still evaluates TRUE for 'no match'; NOT IN is the only one of the three that dies on NULLs. The house shape for settlement holes is NOT EXISTS, because payment feeds are exactly where a half-loaded staging file puts a NULL key. On the production book the trap is latent — payments.invoice_id is declared NOT NULL and the anti-join honestly returns 6 statements worth 15,217.00 — but the same shape against the staging copy is where a NULL lands and the week's dunning work quietly zeroes out. The strong answer picks the spelling out loud, states its NULL semantics unprompted, and says why the anti-join population — statements with no legs, whatever their status claims — is the one the dunning draft needs.",
      tag: "antijoin",
    },
    {
      id: "beat-t13",
      q: "Corporate billing wants the statement cycles that settle on BOTH card and wire. How do you express 'has at least one of each' — and what does the engine actually do per row?",
      a: "Two EXISTS predicates, one per rail: EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id AND p.method = 'card') and the same for 'wire'. A correlated subquery re-runs per outer row — the engine probes the payment set once per statement and short-circuits at the first hit, answering a pure membership question: does at least one qualifying leg exist. That is different from folding payments first and filtering the fold, which answers the same question after materializing every statement's legs, and different again from counting distinct methods with HAVING — the semi-join is the cheapest shape because it stops looking when it can. On this book the split-rail census returns 5 statement cycles — ids 1, 5, 12, 19 and 22 — the exact pairs the double-bill screen starts from, because a cycle paying itself on two rails is also the shape a duplicate charge hides in. The follow-up to answer unprompted: EXISTS returns false cleanly on zero matches, never NULL — which is why the semi-join family, not the NOT IN family, is the settlement audit's home turf.",
      tag: "correlated",
    },
    {
      id: "beat-t14",
      q: "Your month-band census needs a fold, then a classification of the fold. Inline it, nest it, or stage it with a CTE — and what changes for the reviewer?",
      a: "Stage it. The CTE folds 103 rides into 14 monthly buckets keyed by SUBSTR(created_at,1,7) with value rounded once at the fold; the outer query classifies each month into peak, standard or surge-watch and re-folds. Named stages beat nested parentheses for one reason: every stage has a name, a grain and a population the reviewer can check — the spine is 14 rows, the bands foot to 34,833.28, and a wrong count surfaces at the seam instead of hiding inside a nested subquery. Derived tables in FROM do the same job; CTEs win on reuse when two outer reads share one spine, and on reading order — top-down instead of inside-out. The discipline the panel grades: state what each stage produces and at what grain, then verify the identity at the boundary — 14 months in, three bands out, 10,457.65 plus 19,863.47 plus 4,512.16 footing to the book. Every Monday artifact at BEAT — the surge census, the coverage split, the latency floor — is a two-stage pipeline with a name on each stage, because an unnamed stage is exactly where a silently wrong population lives.",
      tag: "ctes",
    },
    {
      id: "beat-t15",
      q: "Terms are fixed at 30 days and the settlement clock averages 28.4. How do you compute days-outstanding and age the unpaid book — and where does date arithmetic lie?",
      a: "Spans are JULIANDAY deltas: julianday(paid_on) - julianday(issued_on) is the settle clock — 28.4 days on average over the paid book, fastest 13, slowest 84 against fixed 30-day terms, so the 84-day outlier is 54 days past due and the aging table leads with it. Aging buckets are anchor arithmetic: julianday(reference) - julianday(due_on) cut into 0-30 / 31-60 / 60-plus CASE bands over the 6 unpaid statements worth 15,217.00, with the as-of date printed beside the table. Where date math lies: string comparison works for ISO dates and silently breaks when a format drifts; BETWEEN loses the boundary day — half-open intervals instead; and DATE(x, '+1 month') drifts on month-ends, because January 31 plus one month is not February 31. The discipline: spans as julianday deltas, buckets from declared anchors, reference date in the caption — an aging read without its as-of date is a number nobody can dispute and nobody should trust, which is exactly what a close review does with it.",
      tag: "calendar",
    },
    {
      id: "beat-t16",
      q: "LATAM shows zero abandoned rides; the 14 matching rides show no dispatch-to-start at all. Both are 'not cancelled and not started' — so why does one print 0 and the other NULL, and which do you coerce?",
      a: "Because one zero is measured and one absence is definitional. LATAM's zero is a folded COUNT: 2 rides, both delivered, cancelled = 0 by construction — a real zero, thin evidence but true. The 14 matching rides have no shipped_at yet, so their lag is NULL — not zero, not dirty data, but 'the event has not happened', and the population is the point. The mechanics underneath: NULL never matches a comparison — status = NULL is UNKNOWN even when a row IS NULL-statused, so 'the unstarted' is shipped_at IS NULL, never = NULL; and NULL propagates through arithmetic, so one NULL cent multiplied into a fold can NULL the whole expression. The policy: coerce for display only, and only when zero is the truthful display of nothing-yet — COALESCE on a left-joined settlement fold prints 0.00 settled for a statement with no legs, honest; COALESCE on the matching queue's lag prints a same-day dispatch that never happened, and the incentive plan gets staffed on it. A measured zero closes a question; an absence opens one — the packet prints them differently on purpose.",
      tag: "nullpolicy",
    },
    {
      id: "beat-t17",
      q: "Nothing here is slow — 103 rides. Why does the panel still ask how you would keep a query fast at ten million, and what do you actually check?",
      a: "Because the habits are visible at any scale and unlearnable under pressure. The checks: predicates stay sargable — status = 'delivered' can use an index, SUBSTR(created_at,1,7) = '2024-01' wraps the column in a function and cannot, so bucket keys belong on raw column ranges; filters run before the join fans rows — cutting 103 rides to the 52 delivered before attaching 251 lines is a quarter of the join work; SELECT * is a contract violation waiting for a schema change; DISTINCT is a dedup tax paid because a join fanned — the fix is the join key, not the keyword; and ORDER BY without LIMIT on an export sorts everything for nothing. The honest answer also names the scale: on this storefront db the census answers in a blink either way, so the cost model is theoretical here and what is being graded is whether the instincts exist before the ride feed is millions of rows and the Monday refresh times out. Fast-by-habit, slow-by-accident — the panel is checking which one you are, because at ride-hail volume the second kind of analyst is an incident.",
      tag: "performance",
    },
    {
      id: "beat-t18",
      q: "AVG(amount_cents) on the payment rails prints 257822.222222. The euro read is 2,578.22. Walk me through every type decision between the cents and the print.",
      a: "SUM over integers stays integer — the 27 legs fold to 6,961,200 cents — but AVG always returns REAL, 257,822.222…, and that is honest: the mean genuinely is fractional. The euro read divides by 100.0 — a REAL divisor promotes the whole expression to 69,612.0 — and the integer-division variant is the trap to name out loud: on this whole-multiple book it can coincidentally print the right digits, which is exactly why it survives in codebases until an odd-cent row lands and the money reads short. ROUND lands once, at the display edge — ROUND(x, 2) — never inside the fold, because rounding intermediates compounds error across a 14-month spine; CAST is for deliberate narrowing and it truncates rather than rounds, a different operation people confuse for it; and printf-style formatting belongs to the report layer, not the query. The house rule is one line: cents are the storage truth, /100.0 is the read, ROUND is the last step before print — so any reviewer can re-derive the euro figure from the raw cents without trusting the analyst's arithmetic.",
      tag: "types",
    },
    {
      id: "beat-t19",
      q: "The loyalty desk wants each rider's ride-class mix in one cell — 'Audio | Wearables | Video'. Which fold builds that, and what are its traps?",
      a: "GROUP_CONCAT — GROUP_CONCAT(DISTINCT p.category, ' | ') over the ride-lines join folds each rider's touched classes into one cell. Three traps. Order: without ORDER BY inside the aggregate the cell's sequence is whatever the scan produced — nondeterministic reporting that flips between runs, so sort in the aggregate or in the stage feeding it. Separator: the second argument is a literal — ', ' or ' | ' — and forgetting it concatenates bare, which reads fine until a two-word class lands and the cell becomes unparseable. Cardinality: GROUP_CONCAT over a fanned join repeats classes per line — 251 lines fold back to a handful of distinct classes per rider, which is what the DISTINCT inside the aggregate is for; skip it and a rider prints 'Audio | Audio | Audio'. Length is the scale trap: a rider's mix is fine, a concatenation over every ride id is not. On this book the mix cell is the loyalty grant's input — Audio-heavy riders read differently from Accessories-repeat riders — and the desk wants one cell per rider, sorted, deduped, reproducible, not a paste job someone re-argues every quarter.",
      tag: "strings",
    },
    {
      id: "beat-t20",
      q: "The ops board wants completed, in-ride, matching and abandoned in ONE scan. Show me the shapes — and tell me which one travels.",
      a: "Two shapes, one result. The SQLite-native: COUNT(*) FILTER (WHERE status = 'delivered'), one FILTER branch per aggregate — 52, 30, 14, 7 in a single scan of orders, reconciling to 103 by construction. The portable twin: SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) — same numbers on any engine, three lines longer. Both are conditional aggregation: one pass, one fold, every branch reading the same population, which is why the identity 52 + 30 + 14 + 7 = 103 is checkable inside the same query — put COUNT(*) beside the branches and the row audits itself. Four sequential queries are the failure mode: four scans, four chances for a drifted WHERE, and a standup quote assembled from four moments in time. The refinement the panel likes is shares off the same scan — SUM(flag) * 100.0 / COUNT(*) per market, APAC's 8.1 abandoned share against EU's 6.7 — with the population named in the column, because 'abandoned share' without its denominator is the number the meeting will fight about. One scan, named branches, identity beside the census: that is the whole pattern.",
      tag: "census",
    },
    {
      id: "beat-t21",
      q: "'Who is the heaviest rider?' — 24 rides, Alice Chen. Two shapes pick that row: a GROUP BY with a MAX join-back, or ROW_NUMBER = 1 in a derived table. When do they disagree?",
      a: "Exactly when the max is tied. The rank trio decides how tied riders share RUNGS; this is the follow-on decision — which single ROW you hand the business. The GROUP BY + MAX shape folds each rider to her ride count, joins back on count = MAX(count) and returns EVERY row that ties — honest for 'who is heaviest', wrong for 'grant one rider'. The ROW_NUMBER = 1 shape orders by the metric plus a named tie-breaker (created_at, then id) and returns exactly one row — deterministic, but the tie-breaker is now a business decision wearing a WHERE clause, and it must be said out loud. The third shape, LIMIT 1 without an ORDER BY guarantee, is not a pattern: it returns whichever row the planner liked. On this book the ladder reads 24, 17, 14, 13, 5 and then a four-way tie at 4 — Alice Chen is safe at the top, but ask for 'the busiest 4-ride rider' and the shapes split: the join-back returns all four, ROW_NUMBER returns whichever rider the tie-breaker picked. At BEAT that choice is a grant decision, so it gets made in the meeting and written in the comment — never delegated to scan order.",
      tag: "argmax",
    },
    {
      id: "beat-t22",
      q: "The concentration read: riders at 3,000.00 and above carry 63.5% of the book. How do you compute a share of total — and what are the two denominators people confuse?",
      a: "Every share has two denominators: the population being cut — 4 riders whose lifetime spend clears 3,000.00, footing 22,121.70 — and the base it is a share OF, the whole 34,833.28 book. The window shape makes the base explicit: SUM(spend) OVER () — an empty OVER is the whole set, the grand total printed as a column beside every row — so each market's share is 100.0 * region_book / SUM(region_book) OVER (), EU's 15,089.23 printing 43.3 against the book. The derived-table shape folds riders first, HAVINGs the 3,000.00 threshold in the stage where it belongs, then divides the cohort foot by the grand fold — the same 63.5, with both denominators visible as two named stages. What people confuse: share-of-book versus share-of-started, share-of-month versus share-of-spine — the same query prints either by moving one WHERE, and both read plausibly. At BEAT every share carries its denominator in the caption, because the concentration read prices the loyalty program and a moved denominator re-prices it silently.",
      tag: "shares",
    },
    {
      id: "beat-t23",
      q: "You group rides by market and status, and LATAM just disappears from the abandoned column. The stakeholder asks where LATAM went. What is the pattern that keeps it on the page?",
      a: "GROUP BY only prints what exists: LATAM booked 2 rides, both delivered, so there is no cancelled row to fold and the market vanishes from exactly the column the stakeholder is reading. The zero-fill pattern is dimensions × LEFT JOIN facts: build the grid from declared dimensions — region cross status, or a calendar spine cross markets — then LEFT JOIN the folded facts on and COALESCE the count to 0. Now every cell exists and absence prints as a measured zero: LATAM cancelled 0, LATAM shipped 0 — a finding (a two-ride market where nothing abandoned yet), not a hole. The discipline: the grid must be built from the declared dimension lists, never from the data's own DISTINCT values, or the missing rows stay missing — the grid IS the claim about what the world contains. On the BEAT book the status × market grid is sixteen cells and its zeros are load-bearing: the 14 matching rides sit EU 6 / APAC 5 / US 3 / LATAM 0, and a matching-queue read that cannot see LATAM's zero has quietly re-defined its denominator. Absence is a finding; the query's job is to give it a row.",
      tag: "zerofill",
    },
    {
      id: "beat-t24",
      q: "The demand meeting wants a month spine that shows the months with NO cancelled rides — a bare GROUP BY drops them. How do you build the spine, and what does WITH RECURSIVE actually do?",
      a: "WITH RECURSIVE runs a two-member query: an anchor — the first month, '2024-01' — and a recursive member that produces the next month from the last, DATE(last || '-01', '+1 month') keyed, terminating at a WHERE that stops it at '2025-02'. Fourteen rows materialize, one per month, whether or not any ride exists in them. LEFT JOIN the folded facts — monthly booked value, cancelled counts — onto the spine and COALESCE the gaps to zero: the nine months with no abandoned rides print 0 instead of vanishing, and the book's 7 abandoned rides distribute across the spine honestly. What the recursion buys over a CROSS JOIN of years and months is control — explicit start, explicit stop, one generated key the join can trust — and what it costs is a termination bug class: forget the WHERE and the spine runs to the year 9999. The bar this clears is the one the panel grades: a demand note's month axis must be complete by construction, because a month that disappears from the axis makes a trough read as recovery. The spine is a claim about the calendar — recursion is how the claim gets built.",
      tag: "recursive",
    },
  ],

  mcqs: [
    {
      id: "beat-mcq-1",
      prompt: "A ride row's status reads 'shipped'. In this kit's BEAT stage map, what happened?",
      choices: ["Completed — the ride ended cleanly", "In-ride — the ride is moving, start-stamped, not yet completed", "Abandoned — the rider gave up", "Matching — dispatched, no driver assigned yet"],
      answer: 1,
      why: "The stage map is fixed: shipped = in-ride with shipped_at as the ride-start stamp (30 of 103 rides, 29.1%). It is the only status where the meter is running right now.",
      notes: [
        { choice: 0, why: "Completed is 'delivered' — 52 rides. Calling in-ride rows completed inflates the completed share before a single trip ends." },
        { choice: 3, why: "Matching is 'pending' — 14 rides with no start stamp yet. Matching is not in-ride and not completed; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "beat-mcq-2",
      prompt: "Rides-started rate is shipped_at IS NOT NULL ÷ which population? The db holds 82 started, 14 matching and 7 abandoned of 103 booked.",
      choices: ["Started + abandoned only (82/89 = 92.1%)", "All rides booked (82/103 = 79.6%)", "Completed rides only (52/82)", "Distinct riders (82/16)"],
      answer: 1,
      why: "The house definition: started ÷ ALL rides booked — matching rides stay in the denominator because 'not yet started' is exactly what the liquidity metric watches. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 matching inflates the rate to 92.1% by deleting the demand still waiting for a driver — the rows the matching-queue panel exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is completion, shipped_at is the start stamp. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "beat-mcq-3",
      prompt: "The EU market carries 45 rides from 8 riders. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts ride rows (45); COUNT(DISTINCT customer_id) folds repeats back to riders (8). The gap between them — 5.6 rides per rider — is the density-intensity read that decides where surge fires.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every ride has a rider. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not riders — a third grain nobody asked for. The census is rides AND riders." },
      ],
      difficulty: "easy",
    },
    {
      id: "beat-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to abandoned rides only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the abandoned share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between APAC's 8.1 and a displayed 8 — or a 0.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.081 to 0 first, then scales — the abandoned map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "beat-mcq-5",
      prompt: "The supply bench keeps only fleet partners with at least 15 completed rides. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 15, before GROUP BY", "GROUP BY partner HAVING COUNT(*) >= 15", "WHERE rides >= 15 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A completed-ride floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the delivered-ride ladder runs 23, 20, 17, 17, 17 and 12 — the floor keeps five partners and flags the thin one.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'rides' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "beat-mcq-6",
      prompt: "The rider ladder runs 24, 17, 14, 13, 5 rides, then FOUR riders tied at 4. Under RANK, what rank do the two 3-ride riders carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-ride riders share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The loyalty desk's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "beat-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-lag rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The matching rides double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the started-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 rides.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "beat-mcq-8",
      prompt: "order_items fans 103 rides into 251 lines (498 units). On orders ⋈ order_items, which pair counts RIDES?",
      choices: ["COUNT(*) and COUNT(DISTINCT order_id)", "COUNT(*) and SUM(quantity)", "COUNT(DISTINCT product_id) and COUNT(*)", "SUM(quantity) and COUNT(DISTINCT product_id)"],
      answer: 0,
      why: "After the fan-out, only COUNT(DISTINCT order_id) folds lines back to rides — COUNT(*) counts 251 rows. SUM(quantity) counts distance/time units (498), a third grain entirely.",
      notes: [
        { choice: 1, why: "SUM(quantity) is the units number, not the ride count — the fan-out trap: after joining order_items, COUNT(*) stops counting rides too." },
        { choice: 2, why: "COUNT(DISTINCT product_id) counts distinct ride classes or pass SKUs touched — catalog coverage, not ride volume. Both columns answer questions nobody asked." },
      ],
      difficulty: "hard",
    },
    {
      id: "beat-mcq-9",
      prompt: "A demand curve walks booked value per market-month, stacked with SUM(value) OVER (ORDER BY month). Two markets share the same month key, and the cumulative 'jumps two rows at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on month join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a deduped month spine ties are rare; on a market-by-market stack they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "beat-mcq-10",
      prompt: "A corporate statement row holds 175600 cents (the #28 statement, 1,756.00 euros). Which expression prints its euro value?",
      choices: ["amount_cents / 100", "ROUND(amount_cents / 100.0, 2)", "amount_cents * 100", "ROUND(amount_cents, 2)"],
      answer: 1,
      why: "Dividing by 100.0 promotes to real arithmetic: 1,756.00 euros. The .0 is the whole fix — 175600 / 100 in integer math truncates, silently eating cents on every odd-cent statement in the corporate book.",
      notes: [
        { choice: 0, why: "Integer ÷ integer in SQLite is integer division: 175600/100 = 1756. On whole-euro amounts the leak hides; the first odd-cent statement exposes it. Promote before you divide." },
        { choice: 2, why: "Multiplying turns cents into 17,560,000 — units inverted. Sanity-check the magnitude: euros are smaller than cents." },
      ],
      difficulty: "hard",
    },
    {
      id: "beat-mcq-11",
      prompt: "City ops slices abandoned rides by market: APAC 8.1%, EU 6.7%, US 5.3%. What does LATAM print, and why is that number trustworthy?",
      choices: ["0 — both LATAM rides delivered; a measured zero you can print", "NULL — no cancelled rows exist to fold", "6.8% — the book-wide abandoned share applied to LATAM", "8.1% — small markets default to the worst share"],
      answer: 0,
      why: "LATAM's two rides are both delivered, so the cancelled fold counts a real zero — measured, not missing. Thin evidence (n=2 from one rider), but a true zero the packet prints as 0.0%.",
      notes: [
        { choice: 1, why: "NULL is what an ABSENT fold returns; here the fold exists and counts zero. The zero-fill habit is what keeps LATAM on the page with a 0 instead of vanishing." },
        { choice: 2, why: "Applying the book-wide 6.8% invents an abandoned ride LATAM never booked — shares are computed per population, never borrowed from the network." },
      ],
      difficulty: "easy",
    },
    {
      id: "beat-mcq-12",
      prompt: "Two-grain density: EU runs 45 rides from 8 riders, US 19 from 2. Which pair of numbers is the density story, correctly computed?",
      choices: ["5.6 and 9.5 rides per rider — the US is denser per rider", "45 and 19 rides — the EU is denser, full stop", "8 and 2 riders — the EU has the bigger base", "335.32 and 383.48 — average fare settles it"],
      answer: 0,
      why: "Density is rides per rider: ROUND(45.0/8, 1) = 5.6 and ROUND(19.0/2, 1) = 9.5. Four EU riders share the surge load; one US rider carries 19 rides — the gap between load and coverage is where surge fires.",
      notes: [
        { choice: 1, why: "Raw ride counts ignore coverage — 45 rides over 8 riders is a different market than 19 over 2, and quoting one grain under the other's name is the density-deck classic." },
        { choice: 3, why: "AOV is ticket size, not liquidity — 383.48 on two riders is a rich duopoly, not a dense market." },
      ],
      difficulty: "easy",
    },
    {
      id: "beat-mcq-13",
      prompt: "The matching-queue panel needs rides with NO start stamp. Which population is that?",
      choices: ["21 rides — the 14 pending (matching) plus 7 cancelled (abandoned)", "14 — only the pending queue", "7 — only the cancelled", "30 — the shipped rows"],
      answer: 0,
      why: "shipped_at IS NULL covers both never-started populations: 14 matching rides waiting for a driver plus 7 abandoned unlocks — 21 of 103. The gap between COUNT(*) and COUNT(shipped_at) IS the liquidity picture.",
      notes: [
        { choice: 1, why: "The queue alone misses the 7 abandoned — demand that also never started. The matching-queue panel and the abandoned map are two cuts of one unstamped population." },
        { choice: 3, why: "Shipped means the ride STARTED — shipped_at is the start stamp. Those 30 rows are the only ones the dispatch-to-start average may read." },
      ],
      difficulty: "easy",
    },
    {
      id: "beat-mcq-14",
      prompt: "LATAM books 2 rides averaging 426.22 — the richest ticket in the network. The growth pod says 'scale LATAM.' What does the db actually support?",
      choices: ["Both rides delivered — but n=2 from one rider; a footnote read, not a scaling case", "The 426.22 average proves strongest demand — greenlight the spend", "0% abandoned proves perfect reliability — greenlight", "426.22 is each rider's lifetime spend — budget accordingly"],
      answer: 0,
      why: "The average is real but the base is one rider and two rides totalling 852.44. The honest read: thinnest coverage, richest ticket — a pilot-sized market, not a plan.",
      notes: [
        { choice: 2, why: "Reliability on n=2 is arithmetic, not evidence — one abandoned ride would read 50%. Denominator honesty kills this pitch in one line." },
        { choice: 3, why: "426.22 is the per-ride average fare, not lifetime spend — LATAM's rider lifetime is exactly the 852.44 total." },
      ],
      difficulty: "easy",
    },
    {
      id: "beat-mcq-15",
      prompt: "City opex sits in expenses.amount_cents as INTEGER cents; Rent folds to 1,680,000. Which read prints the monthly-close figure?",
      choices: ["ROUND(1680000 / 100.0, 2) — 16,800.00", "1680000 / 100 — integer math is fine at this size", "1680000 * 100 — cents to euros", "ROUND(1680000, 2) — round the raw cents"],
      answer: 0,
      why: "The .0 divisor promotes to real arithmetic: 16,800.00. It is the same one-line euro rule the whole finance spine runs on.",
      notes: [
        { choice: 1, why: "On this whole-multiple fold the digits coincide — which is exactly why the bug survives. The first odd-cent expense reads short; the policy is /100.0 without exception." },
        { choice: 2, why: "Multiplying goes the wrong way — 168,000,000. Sanity-check the direction: euros are smaller than cents." },
        { choice: 3, why: "ROUND converts no units — the cents print with two decorative decimals and the close ships a number 100x too big." },
      ],
      difficulty: "easy",
    },
    {
      id: "beat-mcq-16",
      prompt: "Fold the 14-month spine, keep months whose booked value clears 3,000.00. What survives?",
      choices: ["3 months carrying 10,457.65", "8 months carrying 19,863.47", "14 months carrying 34,833.28", "1 month carrying 3,731.97"],
      answer: 0,
      why: "Three months clear 3,000.00 — the 3,731.97 opening, 3,609.64 and 3,116.04 — footing to 10,457.65. That is the peak band by definition, and the number the surge meeting opens on.",
      notes: [
        { choice: 1, why: "The 8 months are the STANDARD band at the 2,000.00 floor — a different regime with a different name; folding them into peak erases the demand structure." },
        { choice: 3, why: "One month is the argmax read; the band census wants the population, not the champion." },
      ],
      difficulty: "easy",
    },
    {
      id: "beat-mcq-17",
      prompt: "The dunning query ports to staging as id NOT IN (SELECT invoice_id FROM payments_stg) and returns EMPTY, while the same shape works on prod. What bit?",
      choices: ["A NULL landed in payments_stg.invoice_id — one NULL makes every NOT IN comparison UNKNOWN, so no row survives", "NOT IN deduplicates the subquery results", "The prod LEFT JOIN was the wrong shape all along", "invoice_id overflowed during the port"],
      answer: 0,
      why: "NOT IN dies on NULLs: x NOT IN (1, 2, NULL) can never be TRUE. On prod the FK is declared NOT NULL so the trap is latent; the staging file carried one half-loaded row and the whole dunning list vanished without an error.",
      notes: [
        { choice: 1, why: "Dedup changes counts, never existence — the empty list is the NULL semantics, not duplicates." },
        { choice: 2, why: "LEFT JOIN … IS NULL and NOT EXISTS both survive NULLs — the shape was right; the spelling was fragile. That is why the house shape is NOT EXISTS." },
      ],
      difficulty: "medium",
    },
    {
      id: "beat-mcq-18",
      prompt: "The coverage fold: SUM(p.amount_cents) over a LEFT JOINed payment set for statements with NO legs prints what — and what is the house policy?",
      choices: ["NULL — and COALESCE(..., 0) is the display fix while the none-bucket stays defined by the IS NULL arm", "0 — SUM returns zero over an empty set", "The statement's own amount", "It errors — aggregates need GROUP BY"],
      answer: 0,
      why: "SUM over zero rows is NULL, not 0. The dunning draft coalesces for display so the line reads 0.00 settled, but the bucket definition stays paid_cents IS NULL — coalescing into the fold would blur 'no legs' into 'settled nothing'.",
      notes: [
        { choice: 1, why: "0 is the COUNT answer, not the SUM answer — that distinction is exactly what the interview is probing." },
        { choice: 3, why: "Aggregates without GROUP BY fold the whole set to one row — legal, no error, and on this db it is how the TOTAL row of the rail footing gets built." },
      ],
      difficulty: "medium",
    },
    {
      id: "beat-mcq-19",
      prompt: "The delta walk prints the August jump as -1,158.21. The true move is +1,158.21. What broke?",
      choices: ["The spine was ordered month DESC — LAG now reads the NEXT month, inverting every delta", "ROUND dropped the sign", "LAG needs PARTITION BY month to keep signs", "August's month key lost its zero-pad"],
      answer: 0,
      why: "LAG reads the previous row under the window's ORDER BY. Order DESC and 'previous' becomes the future — every delta flips sign while every value stays plausible. ORDER BY month ASC is the walk's contract, and the first row's delta stays NULL by definition.",
      notes: [
        { choice: 1, why: "ROUND never touches signs — 2,352.07 minus 1,193.86 is positive regardless of display." },
        { choice: 2, why: "A missing partition would BLEED markets together, not flip signs — a different bug with a different smell." },
      ],
      difficulty: "medium",
    },
    {
      id: "beat-mcq-20",
      prompt: "Per-market running booked value: SUM(revenue) OVER (ORDER BY month) on a market-stacked fold — EU's total keeps accruing into APAC's rows. The fix?",
      choices: ["PARTITION BY market — the window needs its population boundary named", "ORDER BY market, month inside OVER is sufficient", "Replace the window with GROUP BY market", "Add ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW"],
      answer: 0,
      why: "Without PARTITION BY the partition is the whole result set — the walk never restarts. PARTITION BY market gives each market its own spine; no frame clause can fix a partition bug.",
      notes: [
        { choice: 1, why: "A wider ORDER BY sorts correctly but computes over everything — sorting is not partitioning, and the numbers stay wrong." },
        { choice: 2, why: "GROUP BY changes the shape entirely — one row per market, no walk left to read." },
        { choice: 3, why: "That frame names row scope, not population — EU still inherits APAC's history." },
      ],
      difficulty: "medium",
    },
    {
      id: "beat-mcq-21",
      prompt: "An engineer builds month keys as year || '-' || CAST(SUBSTR(created_at,6,2) AS INTEGER). Suddenly October sorts before February. Why?",
      choices: ["The pad was dropped — '2024-10' < '2024-2' as text, so the spine scrambles", "STRFTIME is required for any date sorting", "The year must be cast too", "created_at is not lexicographic"],
      answer: 0,
      why: "CAST(… AS INTEGER) strips the zero-pad: as text, '2024-10' sorts before '2024-2'. The month key is a TEXT contract — zero-padded by construction, which is why SUBSTR(created_at,1,7) or STRFTIME('%Y-%m') are the safe folds.",
      notes: [
        { choice: 1, why: "STRFTIME is one safe spelling, not a requirement — the requirement is the pad." },
        { choice: 2, why: "Casting the year changes nothing — the collision lives in the month's missing zero." },
      ],
      difficulty: "easy",
    },
    {
      id: "beat-mcq-22",
      prompt: "The loyalty desk wants each rider's ride-class mix in ONE cell, sorted and deduped. Which fold, and which trap?",
      choices: ["GROUP_CONCAT(DISTINCT p.category, ' | ') — and without ORDER BY inside, cell order is not guaranteed run-to-run", "SUM(p.category) per rider", "CONCAT over the joined rows", "COUNT(DISTINCT p.category) — the count is the mix"],
      answer: 0,
      why: "GROUP_CONCAT is the one-pass string fold; DISTINCT collapses the 251-line fan-out back to touched classes. The trap is order: an unordered concat is nondeterministic reporting — sort inside the aggregate or in the stage that feeds it.",
      notes: [
        { choice: 1, why: "SUM over text folds to 0.0 — the mix is a list, not a measure." },
        { choice: 3, why: "COUNT collapses the mix to a number — the desk asked for the classes, not how many." },
      ],
      difficulty: "medium",
    },
    {
      id: "beat-mcq-23",
      prompt: "One-pass status census. Which claim about the two shapes is true?",
      choices: ["COUNT(*) FILTER (WHERE status='delivered') and SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END) both print 52 on this db; FILTER is the native sugar, SUM(CASE) the portable twin", "FILTER counts NULL statuses too — SUM(CASE) is safer", "SUM(CASE) requires GROUP BY to work at all", "FILTER is a different metric — it counts in-ride rows"],
      answer: 0,
      why: "Both are conditional aggregation over the same population: 52 completed, 30 in-ride, 14 matching, 7 abandoned — one scan, with the 103 identity checkable beside the branches. FILTER (WHERE) is SQLite-native; SUM(CASE) runs anywhere.",
      notes: [
        { choice: 1, why: "Neither branch counts NULLs as delivered — a NULL status lands in no bucket, which is why COUNT(*) beside the branches is the audit." },
        { choice: 2, why: "Without GROUP BY both fold the whole table to one row — the network census needs no GROUP BY at all." },
      ],
      difficulty: "medium",
    },
    {
      id: "beat-mcq-24",
      prompt: "Settlement clock: fixed 30-day terms; the paid book averages 28.4 days, fastest 13, slowest 84. Which expression is the days-outstanding read — and who is late?",
      choices: ["JULIANDAY(paid_on) - JULIANDAY(issued_on); the 84-day outlier is 54 days past terms", "JULIANDAY(issued_on) - JULIANDAY(paid_on); the 13-day payer is fastest", "DUE days minus ISSUE days — everyone is exactly on terms", "AVG over all 28 invoices including the 6 never-settled"],
      answer: 0,
      why: "End minus start is the clock: paid_on minus issued_on, positive days forward. Against the fixed 30-day term the 84 is 54 overdue — the aging read the dunning draft opens with.",
      notes: [
        { choice: 1, why: "Start minus end prints negative days — a clock that runs backwards is the sign flip the panel hunts." },
        { choice: 3, why: "The 6 never-settled statements have no paid_on — averaging them in silently shrinks the population; the 28.4 is over the paid book that settles with legs." },
      ],
      difficulty: "medium",
    },
    {
      id: "beat-mcq-25",
      prompt: "The rails audit self-joins payments p1, p2 ON p1.invoice_id = p2.invoice_id to find same-cycle leg pairs — 5 cycles settle on both card and wire. Which predicate makes it a pair census?",
      choices: ["p1.id < p2.id — asymmetric key: each pair once, no self-pairing, no mirror", "p1.id <> p2.id", "p1.method <> p2.method", "SELECT DISTINCT p1.invoice_id is enough"],
      answer: 0,
      why: "The strict inequality orders the pair: (a,b) survives once, (b,a) never forms, (a,a) is impossible. Drop to <> and every pair counts twice — the split-rail census reads 10, not 5.",
      notes: [
        { choice: 1, why: "<> keeps both mirrors — the classic double-count; the audit total must foot to 5 cycles." },
        { choice: 2, why: "method <> method is a DIFFERENT screen — it misses same-rail duplicates, and two card legs on one cycle is exactly the double-bill shape the screen exists to catch." },
        { choice: 3, why: "DISTINCT answers 'which cycles', not 'which pairs' — the follow-up always asks for the pair grain." },
      ],
      difficulty: "hard",
    },
    {
      id: "beat-mcq-26",
      prompt: "An audit writes WHERE region = (SELECT region FROM customers WHERE city = 'Berlin'). A second Berlin rider signs up. What happens?",
      choices: ["Runtime error — a scalar subquery returned more than one row, the query dies", "Both regions are returned", "The first row's region wins silently", "The comparison returns NULL and the audit prints nothing"],
      answer: 0,
      why: "The scalar contract is 0-or-1 rows. One row drives the comparison; zero returns NULL (silently empty results); TWO is a hard error — the one failure mode that announces itself. The fix is IN, or an explicit fold inside the subquery when a single value is truly intended.",
      notes: [
        { choice: 2, why: "Engines do not 'pick one' — that behavior would make audits nondeterministic by design." },
        { choice: 3, why: "NULL-as-empty is the ZERO-row case — the two-row case errors before any comparison happens." },
      ],
      difficulty: "hard",
    },
    {
      id: "beat-mcq-27",
      prompt: "The demand note wants a trailing two-month moving average of booked value on the spine. Which window clause?",
      choices: ["AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)", "AVG(revenue) OVER (ORDER BY month) — the default frame is already the moving average", "AVG(revenue) OVER (ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) without ORDER BY", "LAG(revenue) OVER (ORDER BY month) + revenue"],
      answer: 0,
      why: "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW names exactly two rows. The default frame under an ORDER BY is RANGE UNBOUNDED PRECEDING — the whole history: a cumulative average wearing a moving-average name.",
      notes: [
        { choice: 1, why: "The default looks plausible and prints a real number — a cumulative that never turns, which the demand note will read as a trend." },
        { choice: 3, why: "LAG + current is a two-point SUM, not a two-point average — divide by 2 or let the frame do it." },
      ],
      difficulty: "hard",
    },
    {
      id: "beat-mcq-28",
      prompt: "Concentration: riders with lifetime spend at 3,000.00-plus carry 63.5% of the book. Which shape computes it?",
      choices: ["A derived rider fold with HAVING SUM(total) >= 3000 — 4 riders footing 22,121.70 — divided by the grand fold 34,833.28 in the outer query", "WHERE total >= 3000 on the raw orders rows, then divide", "ORDER BY spend DESC LIMIT 4, then divide", "AVG of rider lifetime spends compared to 3,000"],
      answer: 0,
      why: "The threshold is a fact about the rider's LIFETIME fold, so it lives in HAVING inside the derived stage; the denominator is the whole book. 22,121.70 / 34,833.28 = 63.5 — two named stages, two named populations.",
      notes: [
        { choice: 1, why: "WHERE total >= 3000 filters single RIDES — the max fare is 1,088.44, so the raw filter matches zero rows: a silently empty cohort." },
        { choice: 3, why: "The mean rider spends about 2,177 — below the bar. Averages answer centrality, not concentration." },
      ],
      difficulty: "hard",
    },
    {
      id: "beat-mcq-29",
      prompt: "The coverage CASE labels 'exact' when folded legs equal the invoice amount. #11 is void WITH a 925.00 leg; #28 is paid with none. What does the census print?",
      choices: ["21 exact / 1 partial / 6 none — #11 folds INTO exact because its legs equal its amount; #28's empty fold lands in no payment", "21 / 2 / 5 — both anomalies land in none", "20 / 1 / 7 — #11 drops out as void", "21 / 2 / 5 — #28 counts partial"],
      answer: 0,
      why: "The CASE reads the MONEY, not the status: #11's 925.00 leg equals its 925.00 amount, so it settles to the cent and folds into exact — which is why exact is 21, void included; #28 has no legs, its fold is NULL, and no payment is where it lands despite the paid status.",
      notes: [
        { choice: 1, why: "That shape would need #11 in none — but its leg settled it exactly; the void status is the lie, not the fold. The census reads 21 / 1 / 6 and both anomalies reconcile inside it." },
        { choice: 3, why: "Partial is an AMOUNT condition — legs below amount, like #25's 4,000.00 of 6,148.00. #28 has no legs at all." },
      ],
      difficulty: "hard",
    },
    {
      id: "beat-mcq-30",
      prompt: "A packet stacks the 3,000.00-plus spenders beside the 17-ride-plus riders with UNION. Two riders vanish. Why?",
      choices: ["The populations overlap — Alice (24 rides, 7,262.35) and Emma (17 rides, 6,640.56) clear both bars — and a bare UNION dedups identical whole rows", "UNION has a 2-row limit", "The spend column was NULL for both riders", "17 rides is below the bar"],
      answer: 0,
      why: "UNION dedups whole rows across branches; riders clearing both populations print once. UNION ALL keeps both memberships — and if the packet actually wants 'who is in BOTH', that is INTERSECT, a different question again.",
      notes: [
        { choice: 1, why: "No limits — the packet lost rows to dedup, which is why stack queries in board packets are UNION ALL by house rule." },
        { choice: 3, why: "Emma is exactly AT the 17-ride bar — >= keeps her. The vanish is dedup, not the threshold." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-beat-1",
      tier: "easy",
      topic: "j7",
      universe: "supplier",
      title: "The rating-gated fare book",
      brief:
        "BEAT-flavored brief on the storefront db: the supply pod reviews the matched book every Monday through the rating gate — only fleet partners rated 4.5 and above receive completed rides, and the gate overrides size no matter how big a barred partner's book reads. Probed facts: exactly two partners clear the gate — Nordic Gadgets AB (rating 4.6) with 17 completed rides worth 3,711.42 and Alpine Audio GmbH (rating 4.8) with 17 completed rides worth 3,013.61. Midwest Hardware Co sits at rating 4.4 and is barred despite the largest delivered book in the fleet (20 completed rides, 3,732.71); Shenzhen Electro (4.1) and Andes Naturals (4.0) also miss. The review reads the biggest gated book first, with the rating column printed beside every row so the gate stays auditable.",
      ask: "Return each fleet partner rated 4.5 or above with its completed-ride count and fare value to 2 decimals, biggest fare book first.",
      template:
        "SELECT s.name,\n       s.rating,\n       {1}(DISTINCT o.id) AS rides,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS fare_value\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.product_id = p.id\nJOIN orders o ON o.id = oi.order_id\nWHERE o.status = {2} AND s.rating >= {3}\nGROUP BY s.id, s.name, s.rating\nORDER BY fare_value {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the ride counter",
          why: "COUNT(DISTINCT o.id) folds the line-level fan-out back to rides: 17 per gated partner. SUM(DISTINCT o.id) adds order ids together and MAX reports the largest id — neither is a census, and both re-print the rides column as a number that means nothing.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed-ride literal",
          why: "Completed rides are status 'delivered' — 52 of 103. 'shipped' would count the 30 in-ride rows whose meters are still running, pricing supply off demand that has not finished yet.",
        },
        {
          answer: "4.5",
          kind: "number",
          label: "the rating gate",
          noVerify: true,
          why: "The matching bar is 4.5: Nordic (4.6) and Alpine (4.8) clear it. A gate of 4 quietly admits Midwest Hardware at 4.4 — the largest delivered book in the fleet — and the bench the matching engine uses changes without anyone deciding it should.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review reads biggest gated book on top: Nordic 3,711.42 ahead of Alpine 3,013.61. ASC would open the meeting on the smaller partner — a correct query aimed at the wrong end of the page.",
        },
      ],
      distractors: ["SUM", "MAX", "'shipped'", "4", "ASC"],
      walkthrough:
        "One four-table chain, one fold, one gate. The join walks rides through their lines to ride classes and up to fleet partners — grain discipline first: order_items fans each ride into lines, so COUNT(DISTINCT o.id) is what reads rides (17 per gated partner), while SUM(oi.quantity * oi.unit_price) folds each partner's line economics into fare value — Nordic 3,711.42, Alpine 3,013.61, both rounded once at the end. WHERE does two different jobs: o.status = 'delivered' keeps the 52 completed rides (the matched book that actually finished), and s.rating >= 4.5 filters PARTNERS, dropping Midwest Hardware Co — rating 4.4, delivered book 3,732.71, the biggest in the fleet — on policy, not performance. The result is two rows because the gate keeps exactly two partners; ORDER BY fare_value DESC reads Nordic first. The distractors fail honestly: SUM or MAX in the ride slot re-derive the census as a sum or a largest-id and both columns stop meaning rides; 'shipped' prices the bench off in-ride demand; 4 as the gate re-admits Midwest (3,732.71) and Shenzhen and Andes with it, turning a rating policy into a size contest; ASC flips the read. The gate is the story: size never outrates the bar.",
    },
    {
      id: "cs-beat-2",
      tier: "medium",
      topic: "s6",
      universe: "pricing",
      title: "The surge-window census",
      brief:
        "BEAT-flavored brief on the storefront db: city ops reads demand in regimes, not averages — months fold into surge bands at fixed thresholds, and each band carries its own abandoned-ride story, because demand that books and never gets served is the liquidity gap the incentives team prices. Probed facts: the 14-month spine folds to peak (monthly book >= 3,000.00) 3 months carrying 10,457.65 with 1 abandoned ride, standard (>= 2,000.00) 8 months carrying 19,863.47 with 1 abandoned ride, and surge-watch (below 2,000.00) 3 months carrying 4,512.16 — with 5 of the book's 7 abandoned rides concentrated there. The bands foot to 34,833.28, the whole ride book. The census reads the biggest band book first.",
      ask: "Return each demand band — peak, standard or surge-watch — with its month count, booked euro total and abandoned rides, biggest band book first.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         ROUND(SUM(total), 2) AS revenue,\n         SUM(CASE WHEN status = {1} THEN 1 ELSE 0 END) AS abandoned\n  FROM orders\n  GROUP BY month\n)\nSELECT CASE WHEN revenue >= {2} THEN 'peak'\n            WHEN revenue >= {3} THEN 'standard'\n            ELSE 'surge-watch' END AS band,\n       COUNT(*) AS months,\n       ROUND({4}(revenue), 2) AS band_book,\n       SUM(abandoned) AS abandoned_rides\nFROM monthly\nGROUP BY band\nORDER BY band_book {5};",
      slots: [
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the abandoned-ride literal",
          why: "Abandoned rides are status 'cancelled' — 7 on the book, 5 of them inside the surge-watch band. 'shipped' would count the 30 in-ride rows as abandoned demand and the liquidity gap the incentives team prices gets invented out of healthy rides.",
        },
        {
          answer: "3000",
          kind: "number",
          label: "the peak floor",
          noVerify: true,
          why: "Peak is a monthly book of 3,000.00 or more — exactly three months clear it (3,731.97, 3,609.64, 3,116.04) carrying 10,457.65. Drop the floor to 2,000 and the whole standard band collapses into peak, and the demand meeting loses the regime it priced.",
        },
        {
          answer: "2000",
          kind: "number",
          label: "the standard floor",
          noVerify: true,
          why: "Standard is 2,000.00 and up below peak — eight months carrying 19,863.47, the bulk of the book. Raise it to 3,000 and those months fall into surge-watch, which would claim a demand crisis across two-thirds of the calendar.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the band-book fold",
          why: "SUM(revenue) totals each band's monthly books — 19,863.47 / 10,457.65 / 4,512.16, footing to 34,833.28. COUNT would print the month count twice and the band book becomes a cell nobody can reconcile to the ride book.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-band-first direction",
          why: "The census reads biggest band book on top: standard 19,863.47, peak 10,457.65, surge-watch 4,512.16. ASC would open on the thinnest band and bury the eight standard months that carry the marketplace.",
        },
      ],
      distractors: ["'shipped'", "4000", "1500", "COUNT", "ASC"],
      walkthrough:
        "Two stages: build the month spine, then band it. The CTE folds 103 rides into 14 monthly buckets keyed by SUBSTR(created_at, 1, 7) — booked value rounded once at the fold, plus an abandoned count that reads 2 in July, 2 in November and 1 in January 2025 against 7 total. The outer CASE bands each month: revenue >= 3,000.00 is peak (3 months, 10,457.65, 1 abandoned), >= 2,000.00 is standard (8 months, 19,863.47, 1 abandoned), and the ELSE arm catches surge-watch (3 months, 4,512.16, 5 abandoned) — exhaustive by construction, because ELSE is the arm every month below the standard floor lands in. SUM(revenue) re-folds the bands to 19,863.47 / 10,457.65 / 4,512.16, footing to 34,833.28 — the reconciliation city ops checks before the meeting. The read is the abandoned column: 5 of 7 abandoned rides sit in the thinnest band, which is exactly the liquidity gap surge incentives exist to close. The distractors each break differently: 'shipped' re-labels 30 in-ride rows as abandoned demand; 4,000 as the peak floor empties the peak band entirely; 1,500 as the standard floor shrinks surge-watch to July alone and the crisis hides; COUNT in the fold makes band_book a month count; ASC buries the standard bulk. Regimes, not averages — and the ELSE arm is where the crisis lives.",
    },
    {
      id: "cs-beat-3",
      tier: "easy",
      topic: "t5",
      universe: "growth",
      title: "The loyalty ride ladder",
      brief:
        "BEAT-flavored brief on the storefront db: the growth desk ranks the rider base for the loyalty grant every cycle, and the ladder must own its ties — four riders share the 4-ride rung and two share the 3-ride rung, so a row number that broke ties silently would hand the grant to whichever rider the engine listed first. Probed facts: the 103-ride book spreads over 16 riders with the ladder 24 / 17 / 14 / 13 / 5, then a four-way tie at 4, two at 3, three at 2 and two at 1; Alice Chen (EU) tops it at 24 rides worth 7,262.35. The desk's policy is DENSE_RANK — shared rungs, no gaps — and the ladder prints every rider, ties included, name-ordered within each rung so the page is reproducible.",
      ask: "Rank every rider by booked-ride count with shared rungs and no gaps, printing ride count, region and rank, heaviest first with deterministic tie order.",
      template:
        "SELECT c.name,\n       c.region,\n       COUNT(*) AS rides,\n       {1}() OVER (ORDER BY COUNT(*) {3}) AS ride_rank\nFROM orders o\nJOIN customers c ON c.id = o.{2}\nGROUP BY c.id, c.name, c.region\nORDER BY ride_rank, rides DESC, c.name;",
      slots: [
        {
          answer: "DENSE_RANK",
          kind: "keyword",
          label: "the shared-rung ranker",
          why: "DENSE_RANK shares rungs without gaps: the four 4-ride riders all read 6 and the 3-ride pair reads 7. RANK would print 10 for the 3-ride pair — five phantom rungs that do not exist — and ROW_NUMBER would hand one of the four tied riders a fake rank 7.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the ride-to-rider join key",
          why: "Rides attach to riders through orders.customer_id. o.id would join each ride to the customer sharing its row id — sixteen groups of one phantom ride — and any other column is either a different population or a no-such-column error.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "Rank 1 must be Alice Chen's 24 rides. ASC crowns the two 1-ride riders instead — a correct query pointed at the wrong end of the ladder, granting the loyalty read to the thinnest book in the fleet.",
        },
      ],
      distractors: ["RANK", "ROW_NUMBER", "id", "ASC", "MAX"],
      walkthrough:
        "One join, one fold, one window. The join keys rides to riders on orders.customer_id and GROUP BY c.id folds 103 rides into 16 riders — the ladder 24, 17, 14, 13, 5, then the four-way tie at 4 (Isabella Rossi, Keiko Sato, Noah Meyer, Pedro Alvarez), two at 3, three at 2, two at 1. DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) prints shared rungs without gaps: 1 through 5, then 6,6,6,6, 7,7, 8,8,8, 9,9 — the tie block stays visible instead of being split by a tie-breaker nobody agreed to. The outer ORDER BY ride_rank, rides DESC, c.name makes the page deterministic: Isabella Rossi leads the 4-ride rung on every run. The distractors each break honestly: RANK prints 10, 12 and 15 after the ties — phantom rungs that imply riders who do not exist; ROW_NUMBER splits the four-way tie by scan order, an unowned grant decision; id in the join key melts the ladder into sixteen one-ride phantom riders; ASC crowns the 1-ride bench; MAX() OVER prints a running max that never ranks anyone. The audit the desk runs: the rides column foots to 103, sixteen riders print, and no rung is skipped — a ladder, not a contest.",
    },
    {
      id: "cs-beat-4",
      tier: "medium",
      topic: "q5",
      universe: "month-close",
      title: "The settlement coverage census",
      brief:
        "BEAT-flavored brief on the storefront db: the month-close review reads settlement coverage as a three-bucket census — exact, partial, no payment — computed from MONEY, not from the status column, because two statuses lie: statement #11 is void with a 925.00 settlement leg that equals its amount, and #28 is paid with zero legs at all. Probed facts: 28 statements; the fold-and-classify census reads 21 exact worth 65,612.00 (void-but-debited #11 folds IN, paid-with-no-legs #28 folds OUT), 1 partial — #25 at 4,000.00 of 6,148.00 — and 6 no-payment statements worth 15,217.00. The stage shape matters: payments fold per statement in a derived table, then the LEFT JOIN classifies, because a fold that happens after the join fans rows and stops counting statements.",
      ask: "Classify every statement's settlement coverage from folded payment legs, returning bucket, statement count and euro total, biggest bucket first.",
      template:
        "SELECT CASE WHEN pay.paid_cents IS NULL THEN {1}\n            WHEN pay.{2} = i.amount_cents THEN 'exact'\n            ELSE 'partial' END AS coverage,\n       COUNT(*) AS invoices,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS invoiced_euros\nFROM invoices i\nLEFT JOIN (\n  SELECT invoice_id,\n         SUM(amount_cents) AS paid_cents\n  FROM payments\n  GROUP BY invoice_id\n) pay ON pay.invoice_id = i.id\nGROUP BY coverage\nORDER BY invoiced_euros {3};",
      slots: [
        {
          answer: "'no payment'",
          kind: "keyword",
          label: "the empty-fold bucket",
          why: "No legs means a NULL fold — paid_cents IS NULL — whatever the status column claims. That is how paid-status #28 (1,756.00) lands in no payment and the census reads 21 / 1 / 6; 'paid' or 'void' here would classify by the claim instead of the money.",
        },
        {
          answer: "paid_cents",
          kind: "keyword",
          label: "the folded-leg column",
          why: "The derived stage folds payments to one row per statement as paid_cents. pay.amount_cents does not exist past the fold and pay.invoice_id never equals a cent amount — comparing either to the statement amount misclassifies every leg-holding statement as partial and empties exact.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bucket-first direction",
          why: "The close reads the money where it settled: exact 65,612.00, then no payment 15,217.00, then partial 6,148.00. ASC opens on the thinnest bucket and buries the 65,612.00 the review exists to confirm.",
        },
      ],
      distractors: ["'unpaid'", "NULL", "invoice_id", "paid_on", "ASC"],
      walkthrough:
        "Two stages, one classification. The derived table folds 27 payment legs to one paid_cents row per statement; the LEFT JOIN keeps all 28 statements, legs or none. The CASE reads money: NULL fold is no payment (6 statements, 15,217.00 — including paid-status #28 at 1,756.00); fold equal to amount is exact (21, 65,612.00 — including void #11, whose 925.00 leg settles it to the cent); anything between is partial (#25, 4,000.00 of 6,148.00). The buckets foot to 28 statements and the euro cells reconcile to the coverage census the close ships. The distractors fail in kind: 'unpaid' relabels the bucket and the dunning draft loses its name; NULL makes the bucket label NULL — a row nobody can filter for; invoice_id in the comparison never equals a cent amount, so every leg-holding statement becomes partial and exact empties to zero statements; paid_on compares a date to cents and errors; ASC flips the read to partial-first. The teaching point is the stage order: fold payments BEFORE the join — fold after and each leg multiplies the statement row, COUNT stops counting statements, and the 21 / 1 / 6 identity the reviewer checks first is gone.",
    },
    {
      id: "cs-beat-5",
      tier: "medium",
      topic: "x2",
      universe: "expense",
      title: "The one-pass opex census",
      brief:
        "BEAT-flavored brief on the storefront db: the Monday close opens on city opex, and the analyst who runs four sequential queries — one per category — is four chances to drift while the standup waits. Probed facts: 36 expense entries in INTEGER cents fold to 25,416.00, with Rent 14 entries / 16,800.00 (66.1% of the book), Ads 14 / 4,570.00, Travel 3 / 2,521.00 and Tools 5 / 1,525.00. The close ships the whole census in ONE scan of expenses — a FILTER branch per category beside the total fold, so every cell reads the same population and the category cells foot to the 25,416.00 by construction. Watch the units: the table stores cents; every euro read divides by 100.0 exactly once.",
      ask: "Return the full city-opex census in one scan — entries and euro value per category plus the total — with every category branch reading the same population.",
      template:
        "SELECT\n  {1}(*) FILTER (WHERE category = {2}) AS rent_entries,\n  ROUND(SUM(amount_cents) FILTER (WHERE category = 'Rent') / 100.0, 2) AS rent_euros,\n  COUNT(*) FILTER (WHERE category = 'Ads') AS ads_entries,\n  ROUND(SUM(amount_cents) FILTER (WHERE category = 'Ads') / 100.0, 2) AS ads_euros,\n  COUNT(*) FILTER (WHERE category = 'Travel') AS travel_entries,\n  ROUND(SUM(amount_cents) FILTER (WHERE category = 'Travel') / 100.0, 2) AS travel_euros,\n  COUNT(*) FILTER (WHERE category = 'Tools') AS tools_entries,\n  ROUND(SUM(amount_cents) FILTER (WHERE category = 'Tools') / 100.0, 2) AS tools_euros,\n  ROUND(SUM({3}) / 100.0, 2) AS opex_euros\nFROM expenses;",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the entry counter",
          why: "Rent carries 14 entries — a COUNT of rows. SUM(*) is a syntax error and any other aggregate here stops counting entries: the close's entry census becomes a number nobody can tie to the 36-row book.",
        },
        {
          answer: "'Rent'",
          kind: "keyword",
          label: "the fixed-cost literal",
          why: "Rent is the category literal — 14 entries, 16,800.00. 'rent' lowercase matches nothing (SQLite = is case-sensitive) and 'Travel' would print the 3-entry arm in the rent slot while the travel slot kept its own numbers — a census that contradicts itself on one row.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the cents column",
          why: "The total fold reads the raw cents column — 2,541,600 / 100.0 = 25,416.00. SUM(amount) is a no-such-column error and SUM('Rent') folds a text to 0.0 — the close would ship a zero opex line and every fixed-cost decision after it is unanchored.",
        },
      ],
      distractors: ["SUM", "AVG", "'rent'", "'Travel'", "amount"],
      walkthrough:
        "One scan, one row, every branch on the same population. COUNT(*) FILTER counts entries per category — Rent 14, Ads 14, Travel 3, Tools 5 — and SUM(amount_cents) FILTER folds each category's cents, /100.0 exactly once: 16,800.00, 4,570.00, 2,521.00, 1,525.00. The total fold reads 2,541,600 cents → 25,416.00, and the census is self-auditing: the four category sums foot to the total and the four entry counts foot to 36. Note the near-collision the close watches: Rent and Ads both carry 14 entries — the entry columns match while the euro columns do not, which is exactly why the census prints both grains side by side. The distractors each break differently: SUM in the counter slot is a syntax error and AVG averages its operand instead of counting rows; 'rent' matches nothing and the fixed-cost line reads zero; 'Travel' swaps the rent arm to 3 entries; amount is not a column — the table stores amount_cents — so the total fold errors outright. The close's rule: one scan, named branches, cents folded once, and the footing identity checked before the packet ships.",
    },
    {
      id: "cs-beat-6",
      tier: "hard",
      topic: "x3",
      universe: "refund-audit",
      title: "The settlement-rail footing",
      brief:
        "BEAT-flavored brief on the storefront db: the audit that precedes every close foots the settlement rails — wallet-card legs against corporate-wire legs — and stacks a TOTAL row that must reconcile to the parts by construction, because a footing typed by hand is a footing nobody trusts. Probed facts: 27 settlement legs in INTEGER cents — card 16 legs / 37,364.00, wire 11 legs / 32,248.00, TOTAL 27 / 69,612.00, which ties to the ledger's cash credit to the cent. Five cycles settle on BOTH rails, so the same-statement double-bill screen starts here. The stack is built, not typed: per-rail folds UNION ALLed over the whole-table fold with a literal label, ordered by rail name descending — uppercase sorts first in SQLite's binary collation, so that is the direction that leaves the TOTAL row last.",
      ask: "Return the settlement-rail footing — leg count and euro value per rail plus a stacked TOTAL row — rails by name descending so the TOTAL row lands last.",
      template:
        "SELECT method AS rail,\n       COUNT(*) AS legs,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS euros\nFROM payments\nGROUP BY method\nUNION ALL\nSELECT 'TOTAL' AS rail,\n       {1} AS legs,\n       ROUND(SUM({2}) / 100.0, 2) AS euros\nFROM payments\nORDER BY rail {3};",
      slots: [
        {
          answer: "COUNT(*)",
          kind: "keyword",
          label: "the whole-table leg count",
          why: "The TOTAL branch folds ALL 27 legs — no GROUP BY, one row. SUM(amount_cents) would print 6,961,200 legs and MAX one leg's cents; the footing is a count beside a sum, never the same aggregate twice.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the cents column",
          why: "The total fold reads 6,961,200 cents → 69,612.00 — the cell that must tie to the ledger cash credit. SUM(method) folds text to 0.0 and SUM(amount) is a no-such-column error; the rails only foot when both branches read the same column.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the TOTAL-row-last direction",
          why: "Rail names sort with uppercase FIRST under SQLite's binary collation — 'TOTAL' < 'card' < 'wire' — so DESC sinks the grand row to the bottom of the stack. ASC opens the packet on the TOTAL with both rails buried under it.",
        },
      ],
      distractors: ["SUM(amount_cents)", "MAX(amount_cents)", "amount", "ASC"],
      walkthrough:
        "A stack, not a join: branch one folds payments per rail with GROUP BY method — card 16 legs / 37,364.00, wire 11 / 32,248.00 — and branch two re-folds the whole table with no GROUP BY, 27 legs / 69,612.00, labeled 'TOTAL'. UNION ALL because a bare UNION dedups whole rows and a footing that silently collapses is worth nothing; the ORDER BY applies once, to the compound, and the DESC direction leans on a real collation fact — uppercase sorts before lowercase, so 'TOTAL' lands below 'card' and 'wire' only in DESC. The audit the close runs: 16 + 11 = 27 legs and 37,364.00 + 32,248.00 = 69,612.00, tying the stack to the ledger cash credit to the cent. The distractors each break the footing: SUM(amount_cents) in the leg slot prints 6,961,200 legs; MAX(amount_cents) prints one leg's cents as the count; amount is not a column on payments and errors; ASC opens on the TOTAL row with both rails buried. Five cycles settle on both rails — the pairs the same-statement double-bill screen walks next, this footing being the denominator it must reconcile against.",
    },
  ],

  problems: [
    { slug: "confirmation-rate", why: "LEFT JOIN with NULLs folding to zero inside a rounded rate — the match-confirmation read where an unconfirmed match is demand data, not noise, and the rounding lands only at the display edge." },
    { slug: "trips-and-users", why: "Cancellation shares by market with restricted populations excluded — the abandoned-unlock map's ride-hail classic, where stating the exclusion is the entire exercise." },
    { slug: "average-selling-price", why: "Period-weighted rates over a join — the per-ride fare read where weighting by units versus by lines changes the answer, the favorite BEAT follow-up on any rate question." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The volume-argmax read: which rider holds the most rides — the top of the ladder at 24 on this db, decided on a grouped count with ties owned, not hidden." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Each rider's most-used ride class or pass — the per-rider argmax that drives loyalty grants and next quarter's fleet-mix order." },
    { slug: "rolling-7d-actives", why: "Trailing-window distinct riders per market — weekly active riders, the frame-discipline muscle behind the supply board's trend panels." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU ratios in one fold — rider stickiness per market, the growth read the density deck quotes to prove demand is repeat demand, not one surge spike." },
    { slug: "server-utilization-time", why: "Units-in-use versus idle span — the driver-utilization fold in its purest form: rides per active driver starts here, with the started-versus-booked population stated." },
    { slug: "calculate-parking-fees-and-duration", why: "Duration folded into CEIL-billed blocks — distance/time-by-rate fare math with boundary rules, exactly how a ride line's units and locked rate turn into a billed amount." },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER keep-latest with a deterministic tie-break — dispatch telemetry double-fires on retries, and the dedupe rule must be a named policy, not an accident." },
    { slug: "gl-reconciliation", why: "Debits against credits with a delta column — the close reflex this kit's GL demands: 181,080 against 181,080, delta zero or the close does not ship." },
    { slug: "bank-account-summary", why: "LEFT JOIN with a NULL arm folded into deposits and withdrawals — statements without settlement legs handled honestly, the shape behind the corporate dunning draft." },
    { slug: "duplicate-charge-pairs", why: "Self-join over near-identical charge rows — the double-billed ride-line screen corporate billing runs before a statement goes to an account holder." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Riders who bought commuter passes and single rides but never the bundled SKUs — conditional aggregation over pass-mix behavior that drives the upsell list." },
    { slug: "list-the-products-ordered-in-a-period", why: "Ride classes active in a launch window with a volume floor — half-open date logic plus HAVING, the seasonal-fleet query shape behind every market launch review." },
    { slug: "game-play-analysis-iv", why: "Riders whose FIRST ride landed inside the promo window — the first-ride cohort screen the growth pod runs against every surge campaign, subquery-first." },
    { slug: "hopper-company-queries-ii", why: "Acceptance and cancellation rates by market with excluded populations handled — the abandoned-unlock map's hardest version: rates that name their denominators before the liquidity pod re-cuts driver incentives." },
    { slug: "ratings-histogram", why: "Bucketing the review distribution is how the 4.5 matching gate stops being a policy number and becomes a measured share of the bench — the supply pod's rating histogram, read before every incentive reset." },
    { slug: "restaurant-growth", why: "A rolling 7-day average of booked value per market — the smoothed demand curve city ops reads instead of daily noise when deciding which dense market gets the next surge window." },
    { slug: "uber-first-transaction", why: "Each rider's first ride with its value and market — the acquisition ledger the growth pod opens before every promo, because a 426.22 first ticket and a 25.47 one are different bets." },
    { slug: "game-play-analysis-v", why: "First-ride-day retention cohorts — did the rider come back the next day — the follow-through metric that turns one surge spike into a repeat-demand story." },
    { slug: "customers-who-bought-all-products", why: "Riders who have ridden every ride class — relational division as a pass-coverage census, the all-zone commuter read that anchors the bundle upsell list." },
    { slug: "maximum-transaction-each-day", why: "The biggest ride per day with ties owned — the big-ticket watch that explains the 25.47 to 1,088.44 spread the network average hides." },
    { slug: "active-users", why: "Riders active in consecutive months via windows — repeat-demand detection on the monthly spine, the stickiness read that separates surge spikes from habit." },
    { slug: "new-users-daily-count", why: "First-ride riders per day — the onboarding curve behind the matching queue: demand that books its first ride is demand the fleet must catch that day." },
    { slug: "median-time-to-convert", why: "Median-by-window emulation — the honest twin of the 2.98-day average dispatch-to-start, because with a 2-to-4 range the middle tells the matching story better than the mean." },
    { slug: "year-on-year-growth-rate", why: "LAG across years on the month spine — YoY growth per market with the first period NULL by definition, the growth-accounting read the board packet opens with." },
    { slug: "running-total-for-different-genders", why: "Running totals that restart per population — the frame-and-partition discipline behind every cumulative booked-value walk the demand note prints." },
    { slug: "books-with-null-ratings", why: "COUNT(*) versus COUNT(shipped_at) — started versus booked in one fold, the column-versus-star census whose 21-ride gap IS the matching queue." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Two rides within seven days per rider — the repeat window the promo team prices, date math on half-open intervals with the calendar spine named." },
    { slug: "seasonal-sales-analysis", why: "Month-keyed CASE quadrants — surge-season banding of the 14-month spine, where a reordered WHEN quietly re-prices a demand regime." },
    { slug: "hopper-company-queries-i", why: "A zero-filled monthly spine for driver metrics — months with no cancelled rides must print 0, not vanish; the recursive-spine muscle behind the demand note's axis." },
  ],
};
