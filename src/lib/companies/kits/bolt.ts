// Bolt — kit 4 of the Ride-hailing & Mobility domain (Batch C).
// The European super-app: rides, Bolt Food and scooters under one app,
// price-OWNER regulation (Bolt sets the fare, so every fare query is
// regulator-facing), and deliberately low-cost operations run from Tallinn.
// No registry tags — the pool is theme-curated: every problem mirrors a
// workflow Bolt's city and platform teams are known to probe
// (scripts/company-pools.md theme menu). Case studies run on the storefront
// db — mapped honestly as orders=bookings across services, customers=riders,
// suppliers=fleet/vehicle partners, products=the price catalog,
// shipped_at=completion stamp, expenses=the city-ops cost ledger — with
// probed figures (scripts/company-facts.md).

import type { CompanyKit } from "../types";

export const boltKit: CompanyKit = {
  id: "bolt",
  domainId: "mobility",
  name: "Bolt",
  tagline: "European super-app: rides, food, scooters",
  accent: "text-purple-400",

  brief: [
    "Bolt is the **European super-app** — rides, food delivery and shared scooters inside one app, built from Tallinn across dozens of markets on a deliberate low-cost operating model. Two facts shape every query you write here. First, Bolt is a **price OWNER**: unlike marketplace models, it sets the fare itself, which makes every fare-related number regulator-facing — a completion share or a fare distribution can be requested by a transport authority, and the definition behind it must be printed and defensible. Second, it is multi-service by design: one rider can take a ride, order food and unlock a scooter in the same week, so the interesting reads are cross-vertical — 'how many riders touched two services this month' is a growth number, not a curiosity. On this kit's storefront db the mapping is direct: **103 bookings**, {emerald:52 completed}, 30 underway, 14 awaiting match, {rose:7 cancelled}, spread EU 45 / APAC 37 / US 19 / LATAM 2.",
    "The data org splits into **platform teams in Tallinn** and **city ops pods in-market**. Platform owns the shared rider identity, the price catalog (fare rules per service class, {amber:surge} logic, commission rates) and the settlement systems that pay drivers and couriers weekly. City pods own the operating numbers: rides per active driver, scooter utilization, food basket sizes, and the cost ledger — hub leases, performance marketing, field ops. The finance tables carry one house rule: money is stored as INTEGER cents, so the euro read is `amount_cents / 100.0`, and the missing .0 is how a courier payout silently truncates. Cost discipline is cultural: the ops cost stack goes to the weekly review with a reconciling TOTAL row, and a stack whose branches don't sum to the total is a bug, not a rounding note.",
    "Interview style is efficiency-fluent. Screens open with a **one-scan census** (the whole service mix in a single pass — the dashboard budget allows one query, not four), move into `CASE`-based fare-rule classification, then escalate into either a rate with an honest denominator or a rolling-activity window (**7-day actives**, week-over-week stickiness) where the frame is the test. The super-app twist shows up constantly: joins across verticals fan out, and the interviewer wants to hear you say which grain survives — riders, bookings, or line items. Wrong answers here aren't stylistic; a doubled rider count in a regulator reply is an {rose:incident}.",
    "Preparation strategy: Bolt has no tagged pool in this app's registry, so the kit curates **thirty-two problems** from the SQL band that mirror its known screen themes — one-scan censuses, `CASE` classification, `UNION ALL` cost packets, rolling-actives windows, and cents-safe payout folds — laid out for spaced practice rather than one sitting: a topic a day, revisited until the frames and denominators are reflexes. Then run all six case studies on the live storefront database: the fleet bench and the ops cost stack, plus the monthly booking census, the fare-band classification, the zero-completion funnel read and the latest-booking-per-rider panel — each rebuilt with probed figures, each audited the way a regulator reply would be."
  ],

  dayInLife: [
    "**08:00 —** The day starts with the one-scan census. A city-ops analyst opens the overnight board: bookings by service (rides, food, scooters), completions, cancellations, all folded in a single pass because the dashboard budget allows exactly one query per panel. The first reconciliation of the day is bookings-versus-completions — on this db the **52/30/14/7** status fold against **103** placed — and any branch that doesn't reconcile against the total is the day's first {rose:fire}. Fleet telemetry refreshes on its own cadence, and the analyst checks freshness before reading anything: a scooter-utilization panel fed by yesterday's feed is worse than no panel.",
    "**11:30 —** Midday shifts to platform work. A fare-rule change needs a before/after read: the analyst folds the price catalog by service class with `CASE` branches (standard tier, budget tier, promotional), counts what moves, and writes the definition into the column names because the output may end up in a **regulator reply**. The payments team wants courier and driver settlement accruals folded from integer cents without losing a cent. Then the growth ask: rolling **7-day actives** per vertical — riders who touched each service in the trailing week — where the window frame and the `DISTINCT` discipline are the entire exercise, and the wrong frame quietly inflates the number by counting peers twice.",
    "**15:00 —** The afternoon closes the loop with stakeholders. The weekly ops review reads the cost stack: hub leases, marketing, field ops, tooling — each branch summed, plus a **TOTAL row** that must equal the branches to the cent, because 'roughly reconciles' is not a sentence this company accepts. Procurement reviews the fleet-partner bench: quality-gated (**rating 4.5 and up**) and ranked cheapest-first, because low-cost ops is a procurement decision as much as a pricing one.",
    "**18:00 —** The last hour is handoff: freshness status per feed, the fires closed, and tomorrow's two headline numbers — {emerald:completions} and {violet:cost-to-serve} — written down with their SQL attached so the morning shift inherits queries, not mysteries. The note closes on the day's operating rule: every stack reconciled, every definition printed, nothing shipped on 'roughly'.",
  ],

  metrics: [
    { name: "Rides per active driver", what: "Completed bookings ÷ drivers online. The utilization headline — supply efficiency is Bolt's cost moat, and it's a ratio whose denominator shifts by the hour." },
    { name: "Completion rate", what: "Completed ÷ placed bookings, per service and city. 52 of 103 on the sample db; regulator-facing, so the definition is printed next to every number." },
    { name: "Take rate", what: "Commission ÷ fare value, per service class. The price-owner model makes this the revenue lens — numerator and denominator live in different tables, so grain discipline is the test." },
    { name: "Food basket size", what: "Food-order value ÷ food orders. The Bolt Food health metric — small baskets die on delivery cost, so it's watched per city weekly." },
    { name: "Scooter utilization", what: "Trips per scooter-day. The fleet-efficiency read from telemetry — rolling windows, dedupe, and NULL-ride discipline all show up here." },
    { name: "Multi-service adoption", what: "Share of riders active in 2+ verticals in a window. The super-app thesis in one number — and a COUNT DISTINCT across a fan-out join in interview form." },
    { name: "Cost-to-serve ratio", what: "City-ops spend ÷ net revenue. The low-cost bar: the sample db's cost ledger runs Rent 16800 / Ads 4570 / Travel 2521 / Tools 1525, total 25416 — the stack that must reconcile." },
    { name: "ETA promise kept", what: "Bookings matched inside the quoted wait ÷ matched bookings. The rider-facing quality bar — a conditional-count ratio where 'matched' is the denominator, not 'placed'." },
  ],

  topics: [
    {
      name: "One-scan service censuses",
      why: "Bolt dashboards are query-budgeted: the service mix, the status fold and the per-city counts each get one pass, not four sequential scans. Conditional aggregation — COUNT FILTER (WHERE …), SUM over CASE flags — is how a whole bookings picture ships in one query with branches that reconcile to COUNT(*).",
      slugs: ["active-businesses", "find-stores-with-inventory-imbalance", "number-of-rich-customers", "human-traffic-of-stadium"],
    },
    {
      name: "CASE classification for fare rules",
      why: "The price catalog is rule-shaped: standard tier, budget tier, promotional, each with its own boundary. CASE WHEN is the daily classifier, and the screens check exhaustiveness — a boundary at exactly the threshold, an ELSE that catches everything below, and no silent third band pricing can't explain.",
      slugs: ["calculate-special-bonus", "weather-type-in-each-country", "the-category-of-each-member-in-the-store", "sales-analysis-ii"],
    },
    {
      name: "Stacked packets with UNION ALL",
      why: "Month-close and regulator packets stitch populations into one deliverable: this-month versus last-month, cancelled versus kept, per-city blocks stacked into one table. Bolt drills UNION ALL's no-dedupe cheapness and the column-position discipline that keeps a stack type-safe — a packet that silently dedupes or misaligns columns reads as two different businesses.",
      slugs: ["team-scores-in-football-tournament", "monthly-transactions-ii", "count-salary-categories"],
    },
    {
      name: "Low-cost leaderboards",
      why: "Cheapest trusted partner first, second-cheapest lane, scooters ranked by utilization — low-cost ops is ranking ops. The rank trio plus tie handling is drilled because procurement leaderboards tie constantly, and the LIMIT-1-OFFSET-1 habit breaks exactly there.",
      slugs: ["rank-scores", "second-most-recent-activity", "top-three-wineries", "compute-the-rank-as-a-percentage"],
    },
    {
      name: "Rates with honest denominators",
      why: "Completion rates, take rates, ad-spend ratios — Bolt's ratios punish integer division and careless filters. The house habit: 100.0 before the division, the denominator's filter decided BEFORE the ratio, and rounding only at the end. The follow-up is always 'what's in the denominator?' — because a regulator may read the answer.",
      slugs: ["ads-performance", "hopper-company-queries-ii", "card-launch-success", "queries-quality-and-percentage"],
    },
    {
      name: "Joining rides, food & scooters",
      why: "The super-app read is cross-vertical: attach service, city and partner attributes to every booking and the fan-out begins. Bolt screens check what survives — does a booking missing a service mapping still count in the rider census? — and the LEFT JOIN vs INNER JOIN decision is about who survives, never habit.",
      slugs: ["number-of-times-a-driver-was-a-passenger", "top-travellers", "sales-person", "customers-who-never-order", "combine-two-tables", "count-student-number-in-departments"],
    },
    {
      name: "Month-close date filters",
      why: "Settlement and cost reporting live on the calendar: bookings in a period, the latest payout before a cutoff, month buckets on the '%Y-%m' spine. Bolt probes half-open intervals — BETWEEN on timestamps loses the last night of the month — and the SUBSTR shortcut that breaks the day the feed format drifts.",
      slugs: ["monthly-transactions-i", "convert-date-format", "friday-purchase-iii", "rising-temperature", "average-time-of-process-per-machine", "calculate-parking-fees-and-duration"],
    },
    {
      name: "Rolling activity windows",
      why: "7-day actives, week-over-week stickiness, rolling distinct riders — the growth team's daily bread and the screen's favorite escalation. The drill is frame discipline: ORDER BY day windows default to RANGE with peers, and on tie-heavy day folds the running count jumps by whole peer groups — the trend line lies unless you state the frame.",
      slugs: ["dau-wau-stickiness", "rolling-7d-actives", "active-users", "user-activity-for-the-past-30-days-i", "restaurant-growth", "consecutive-numbers"],
    },
    {
      name: "Subquery shapes under budget",
      why: "Screens escalate into nested logic: listings below the platform average, partners above a listing bar, riders whose FIRST booking landed in the promo window. Scalar, IN, EXISTS and derived shapes each carry a cost profile and an edge case — and the follow-up is always what the query returns when the inner fold is empty.",
      slugs: ["second-highest-salary", "market-analysis-i", "game-play-analysis-iv", "department-highest-salary"],
    },
    {
      name: "Cents-safe money folds",
      why: "Settlements, payouts and the cost ledger keep money in integer cents — every euro read is amount_cents / 100.0 and every ratio sits one misplaced integer from truncation. Running-balance folds and reconciliation reads (branches that must equal the TOTAL) are the closest thing this kit has to a finance round.",
      slugs: ["account-balance", "gl-reconciliation", "balance-rollforward", "last-person-to-fit-in-the-bus", "employee-bonus"],
    },
  ],

  theory: [
    {
      id: "bolt-t1",
      q: "A transport authority asks for Bolt's completion rate by city. How do you compute it so the number survives a regulator's definition question?",
      a: "You print the definition inside the query. Completion rate is completed ÷ PLACED — all 103 bookings in the denominator on this db, cancelled and unmatched included — because the regulator's question is 'of what was requested, how much moved?', not 'of what moved, how much finished?'. The mechanics: numerator as SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), denominator as COUNT(*) over the same fold, 100.0 before the division so integer arithmetic can't truncate the share. The failure modes are all definitional: filtering status in WHERE first shrinks the denominator to the numerator's population and prints 100% everywhere; switching to 'completed ÷ matched' is a DIFFERENT metric that needs its own name. The strong candidate hands over the query with the definition in the column alias — completion_pct_of_placed — because at Bolt a number without its denominator printed is treated as a rumor.",
      tag: "aggregation",
    },
    {
      id: "bolt-t2",
      q: "One rider, three services: rides, food and scooters all join through the same rider id. What does that fan-out do to a 'riders per city' count, and how do you keep it honest?",
      a: "The fan-out multiplies: joining bookings to line items or to per-service tables gives one rider row per booking per line, so COUNT(*) counts touchpoints, not people — a rider with two food orders in one basket can triple-count. The honest fold picks a grain and defends it: COUNT(DISTINCT rider_id) for 'riders per city', COUNT(DISTINCT booking_id) for 'bookings per city', COUNT(*) only when the grain truly is line items. The super-app twist is that the interesting number is often the overlap — riders active in two-plus verticals — which is a COUNT DISTINCT over a folded population, never a raw join count. The habit being graded: before any cross-vertical join, say out loud 'one row per what?' at every stage — at Bolt the wrong grain in a cross-service count doesn't just mislead the deck, it misleads a growth decision.",
      tag: "joins",
    },
    {
      id: "bolt-t3",
      q: "You're building rolling 7-day actives per vertical. Where does the default window frame betray you, and what's the fix?",
      a: "The bare OVER (ORDER BY day) defaults to RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — every PEER shares the running total, so if the fold ever produces two rows with the same ordering value (per-vertical folds stacked, or a day fold that wasn't deduped), the running count jumps by the whole peer group at once and the actives curve lies. The fix is stating the frame: ROWS BETWEEN 6 PRECEDING AND CURRENT ROW for a true trailing-7-day window, and computing COUNT(DISTINCT rider_id) inside the STAGED fold — because a rolling DISTINCT in the outer window is either expensive or wrong. The safe shape stages it: a derived table folds per-day-per-vertical distinct riders, then the outer query rolls the frame over that. At Bolt this matters weekly: 7-day actives is a headline growth number, and a frame bug doesn't make the number noisy — it makes it steadily, plausibly too high.",
      tag: "windows",
    },
    {
      id: "bolt-t4",
      q: "WHERE p.price < (SELECT AVG(price) FROM catalog) — what is that scalar subquery allowed to return, and what happens when the inner query comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 row, 1 column. One row: its value joins the comparison — the platform-average benchmark, computed once, cheap. Zero rows: it yields NULL — not an error — and every comparison against NULL is UNKNOWN, so the below-average listing report silently returns nothing: no crash, no message, an empty panel that reads as 'great cost discipline'. On the full catalog that's theoretical (16 listings always average), but on filtered staging tables — one service class, one city's inventory — the empty-inner bug ships regularly. The correlated cousin re-runs per outer row and answers 'below MY service class's average' — a different question with a different cost. Saying which population the inner fold covers, and what an empty result would mean, is exactly what the follow-up is fishing for.",
      tag: "subqueries",
    },
    {
      id: "bolt-t5",
      q: "Fleet telemetry arrives with NULLs — scooters with no ride timestamp, payouts with no settlement date. What's your NULL policy when reporting?",
      a: "Three behaviors, then a policy. Filters: NULL fails both x = value and x != value — the comparison is UNKNOWN — so WHERE settled_on < deadline silently drops unsettled payouts, which is sometimes the definition and sometimes a leak. Aggregates: COUNT(*) keeps every row while COUNT(settled_on) counts non-NULLs — the gap IS the outstanding picture; AVG ignores NULLs, so an average over all rows and over settled rows are different metrics. Joins: NULL keys never match, so a scooter with a NULL fleet id vanishes from INNER joins. The policy: decide per metric whether NULL means 'not yet', 'never', or 'bad data' — report 'not yet' as its own bucket, coalesce 'never' only at the display edge, and escalate 'bad data' to the feed owner. A COALESCE buried mid-pipeline launders bad rows into fake zeros somebody will act on; guard, don't decorate.",
      tag: "nulls",
    },
    {
      id: "bolt-t6",
      q: "The ops cost stack needs each expense category plus a grand total in one result set. UNION or UNION ALL — and what must line up for the stack to be trusted?",
      a: "UNION ALL — the grand-total row is a different population from the category branches by construction, so deduplication is pure cost and, worse, a mask: if a definition bug ever makes a branch collide, UNION silently deletes the evidence and the stack still balances. The discipline is column POSITION and type: both branches project the same shape in the same order — category, entries, spend — because set ops match positionally, not by name, and the total row carries a literal label ('TOTAL') so the reconciling row is self-documenting. Then the audit: the TOTAL row's spend must equal the sum of the branches to the cent — on this db 25416 across Rent, Ads, Travel and Tools — and a mismatch is a bug in the stack, not a rounding note. The Bolt habit: every cost packet ships with its TOTAL row and its reconciliation is checked before the review, because low-cost ops means every cent is accounted for twice — once in the branch, once in the sum.",
      tag: "set-ops",
    },
    {
      id: "bolt-t7",
      q: "Month-close reporting runs on TEXT timestamps. How do you bucket them by month, diff them in days, and where does each approach break?",
      a: "Three tools, three caveats. Buckets: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on ISO text — both give the month spine; the SUBSTR shortcut works only while the format stays fixed-width ISO, and one '2025-2-7' quietly mis-buckets the fold. Diffs: JULIANDAY(completion) - JULIANDAY(created_at) returns fractional days — round once at the END, never per row, or the average drifts. Windows: half-open intervals — created_at >= '2025-02-01' AND < '2025-03-01' — never BETWEEN on the last day, which drops the month's final evening of bookings. The deeper break: these strings carry no timezone declaration, and settlement reporting across markets is exactly where a convention assumption surfaces as a doubled day. State the convention, then query it — never the reverse — and print the bucket expression in the column name so the close pack is self-documenting.",
      tag: "dates",
    },
    {
      id: "bolt-t8",
      q: "The fleet feed double-fires on retries and the same scooter-day can appear twice. How do you dedupe for utilization reporting — and when must you NOT dedupe?",
      a: "Detection first: GROUP BY scooter_id, day HAVING COUNT(*) > 1 — the cheapest duplicate census in SQL. Collapse with a window: ROW_NUMBER() OVER (PARTITION BY scooter_id, day ORDER BY ingested_at DESC, id DESC) = 1 — the id tie-break makes 'latest ingest wins' deterministic when two rows share a timestamp, which retries guarantee. But dedupe is a DECISION, not a default: if the double-fired rows are two genuine rides in the same scooter-day, folding them hides utilization and the fleet plan underbuys. So classify before collapsing — same payload (retry) → dedupe; different payload (two trips) → keep both — and be able to say which rows your dedupe discarded and why the business agreed to lose them. The graded habit: detect with an aggregate, dedupe with a window, defend the tie-break. 'It still returns rows' is not a defense; 'these are the retry pairs and here's the survivor of each' is.",
      tag: "quality",
    },
    {
      id: "bolt-t9",
      q: "Take rate: commission lives in one table, fare value in another. Walk me through keeping numerator and denominator honest when they're born in different tables.",
      a: "Name the grain first, then join for it. The take rate is commission ÷ fare value per service class — so the fold is ONE row per service class, commission summed from the commission table and fares summed from the bookings table, each folded independently and only then joined on the class key. The traps: joining line-level first and folding after multiplies rows through the fan-out, inflating both sides differently; and folding each table with different WHERE windows, which pairs January commissions with February fares. The Bolt-specific stakes: take rate is the price-owner's revenue definition — print it as take_rate_pct with the windows in the CTE names (commission_feb, fares_feb) so the regulator reply shows exactly what divided by what. A take rate without its population printed is a rumor with decimals.",
      tag: "joins",
    },
    {
      id: "bolt-t10",
      q: "'One row per what?' — walk me through choosing the grain for a multi-service report, and what happens when two grains get mixed.",
      a: "Decide at the brief, not at the keyboard. Rider grain answers audience questions — how many people used each service; booking grain answers operations — how many trips ran; line-item grain answers basket questions — what was bought together. The mechanical rule: every fold names its grain in the CTE alias (riders_per_city, bookings_per_service) and every join states what it does to that grain — attaching rider attributes to bookings is safe at booking grain, but joining line items INTO a rider-grain fold multiplies riders by their items and every count becomes touchpoints. Mixed grains don't error; they produce numbers that are 60% of one question and 40% of another, which is worse. At Bolt the super-app guarantees fan-out — one rider, three services — so the grain sentence comes before the FROM clause, out loud, every time.",
      tag: "groupby",
    },
    {
      id: "bolt-t11",
      q: "When should a panel keep every row with a window function instead of folding with GROUP BY — and what does the window buy you that the fold can't?",
      a: "Windows keep the row and ADD context; folds replace rows with summaries. Use a window when the deliverable is row-level and comparative: each booking with its city's average beside it, each day's actives with the 7-day rolling beside it, each partner with its catalog rank beside it. GROUP BY is right when the answer IS the summary — a census, a total, a leaderboard as the final output. The Bolt habit: dashboards are row-per-entity panels, so the leaderboard rank rides along as DENSE_RANK() OVER (ORDER BY spend) instead of a second query — one scan, and the row still shows its own numbers. The cost side is real, though: windows hold partitions in memory, so folding 36 expense rows beats windowing 300k telemetry rows when the summary is all anyone reads. Fold for the number, window for the context around the number.",
      tag: "windows",
    },
    {
      id: "bolt-t12",
      q: "Marketing wants to know which food orders came within an hour after a ride. How do you detect sequences in SQL?",
      a: "LAG over time-ordered, rider-partitioned bookings. Stage one fold: per-rider rows ordered by created_at, with LAG(service) and LAG(created_at) beside each row — now every booking carries its predecessor's service and timestamp. The flag is CASE WHEN service = 'food' AND prev_service = 'ride' AND gap under the hour — JULIANDAY(created_at) - JULIANDAY(prev_created_at) <= 1.0/24 — and the first booking of each rider's history gets a NULL predecessor, which the CASE naturally excludes. The edges to state out loud: the ordering must be deterministic (created_at, then id as tie-break), the window is the cohort definition ('within an hour' is policy — print it), and same-minute bookings make the direction ambiguous, which is a data-quality flag, not a query bug. Sequence questions are funnel questions — Bolt's cross-sell reads are all this shape.",
      tag: "windows",
    },
    {
      id: "bolt-t13",
      q: "Your screen-share query is getting unreadable — three subqueries deep. How do you restructure it for review?",
      a: "Stage it into CTEs, one step per grain, named for what each stage produces. The shape: WITH service_map AS (the mapping fold), city_bookings AS (the LEFT JOIN attaching city to every placed booking), per_city AS (the GROUP BY census) — then the final SELECT reads like the brief. Three disciplines make it reviewable: each CTE does ONE job so a reviewer can bless it line by line; names carry definitions (placed_not_matched, not 'temp1'); and the same CTE can be reused — bolt it once, reference it twice, instead of copy-pasting a subquery into two places where they'll drift. The SQLite angle: CTEs are readability-first, not performance magic — the planner may inline them — so never claim a CTE 'optimized' anything; claim it made the definition auditable, which at Bolt is worth more than the milliseconds. The interviewer's real test: can a colleague modify the threshold in your query in ten seconds without breaking it?",
      tag: "subqueries",
    },
    {
      id: "bolt-t14",
      q: "Two city feeds spell the same city differently and joins start dropping rows. What's your text-normalization discipline before any cross-feed join?",
      a: "Normalize at the join key, every time, and say which normal form you chose. The mechanics: TRIM for stray whitespace (the invisible killer — 'Tallinn ' and 'Tallinn' are different keys), UPPER (or LOWER) for casing — SQLite's equality is case-sensitive, so 'tallinn' ≠ 'Tallinn' and the join silently drops the feed with lowercase keys — and one canonical spelling for known aliases. The policy layer: normalize IN the query's join predicate or in a staged CTE, never by UPDATE-ing the raw feed — the raw feed is evidence; the query is the interpretation. Then prove it: a LEFT JOIN from each feed's distinct keys with the IS NULL count printed shows exactly how many rows the un-normalized version would have lost. Text keys are where joins go to die quietly — the fold looks right, three cities read low, and nobody fires until the regulator's numbers disagree with yours.",
      tag: "strings",
    },
    {
      id: "bolt-t15",
      q: "The status-census query scans the whole bookings table every dashboard refresh. How do you think about indexing it?",
      a: "Index for the FILTER and the JOIN, not for the fold. The census filters status and groups by service and city — so a composite index on (status, service, city) lets the scan skip cancelled-and-done history for the 'open bookings' panel, and the covering variant (status, service, city, created_at) answers without touching the table at all. The honest caveats: SQLite keeps ONE index per table per query plan in play — a second panel filtering by created_at competes for the plan; and the fold itself (COUNT, SUM) still reads every surviving row — indexes narrow, they don't aggregate. The Bolt-scale reasoning: at thousands of bookings the index is ceremony; at millions of completed rides it's the difference between a dashboard that refreshes and one that times out. The interview-grade answer names the columns IN ORDER (equality columns first), admits what the index can't fix, and offers the real alternative — a pre-aggregated rollup table refreshed on schedule.",
      tag: "indexes",
    },
    {
      id: "bolt-t16",
      q: "Your UNION ALL cost packet has four branches and finance says one branch's numbers look shifted. What broke, and what's the standing rule?",
      a: "Column position, almost certainly. Set operators align branches POSITIONALLY: if a branch SELECTs spend before category while its siblings SELECT category before spend, the packet doesn't error — text lands in the money column, numbers in the category column, and one branch reads 'shifted' while three read fine. The standing rule: every branch in a stack projects the identical column list in the identical order, ideally with the same aliases, and the packet's TOTAL row is the tripwire — when positions drift, the reconciliation refuses to close to the cent. The defensive habit: one branch written first as the template, then the others copy its SELECT list verbatim, changing only WHERE and the GROUP BY. A stack that 'roughly' lines up is a stack that fails at the worst moment — mid-review, in front of the people who reconcile for a living.",
      tag: "set-ops",
    },
    {
      id: "bolt-t17",
      q: "IN versus EXISTS for 'riders who booked during the promo window' — which do you reach for, and what's the failure mode of the other?",
      a: "Both are semijoins; the difference is the failure mode. IN (SELECT rider_id FROM bookings WHERE created_at BETWEEN …) folds the inner list once and tests membership — readable, planner-friendly, and safe when the inner column can't be NULL. EXISTS (SELECT 1 … WHERE b.rider_id = r.id AND window) short-circuits per row and is NULL-immune by construction — the correlation IS the match condition. The famous trap is NOT IN: one NULL rider_id in the inner fold and every comparison becomes UNKNOWN — the 'never booked in the promo' list silently returns zero rows and the re-engagement campaign has no audience. So the rule: positive membership, either works — pick IN for readability; negated membership, NOT EXISTS or LEFT JOIN … IS NULL, always, because the NULL-poisoning failure of NOT IN is silent. The Bolt stakes: the promo-cohort definition drives incentive spend — an empty cohort that should have 200 riders is money unspent and nobody sees why.",
      tag: "subqueries",
    },
    {
      id: "bolt-t18",
      q: "A COALESCE on the completion stamp makes the in-flight bucket disappear from the report. Where did the policy go wrong?",
      a: "The coalesce happened in the pipeline instead of the display. NULL completion means 'not yet' — a population the ops panel EXISTS to show (bookings placed, matched, moving) — so the fold must keep it as its own bucket: COUNT(*) minus COUNT(completion_stamp), or an explicit CASE arm 'in-flight'. Coalescing the stamp to something — zero, a sentinel date, 'pending' — merges not-yet into finished-or-broken, and two things die: the in-flight count understates demand in motion, and any latency average now includes rows that haven't finished, dragging it down with fake zero-duration trips. The discipline: classification belongs in the query (CASE arms, FILTER branches), rendering belongs at the edge ('—' for NULL in the panel), and sentinel values belong nowhere — a stamp of '1970-01-01' is a lie with a timestamp. Guard the meaning, decorate only the pixels.",
      tag: "nulls",
    },
    {
      id: "bolt-t19",
      q: "Regulator packet: 'rides completed in Q1.' The stamp is TEXT, the quarter boundary is policy, and someone used BETWEEN. What do you check?",
      a: "The interval shape first. BETWEEN '2025-01-01' AND '2025-03-31' loses every timestamp on March 31 after midnight — '2025-03-31 18:42' > '2025-03-31' — so the quarter closes a full day of rides short, and the last day is historically the surge-heavy one. The fix is half-open: shipped_at >= '2025-01-01' AND shipped_at < '2025-04-01'. Then two checks specific to text stamps: the format is fixed-width ISO (one '2025-3-9' mis-sorts against strings — '2025-03' < '2025-3-9' in text order is NOT chronological), and the timezone convention is stated — a TEXT stamp declares none, and Q1 boundaries in Tallinn time versus UTC move rides across the quarter edge. The packet prints the predicate next to the number: rides are counted by COMPLETION stamp in [Jan 1, Apr 1), Tallinn local — a definition the authority can re-run. Between-and-a-date is how quarters quietly lose their best evening.",
      tag: "dates",
    },
    {
      id: "bolt-t20",
      q: "Three fleet partners tie on catalog value in the procurement leaderboard. RANK, DENSE_RANK or ROW_NUMBER — which do you ship, and what does each print?",
      a: "Each answers a different question, so pick by the business rule. RANK prints 1, 1, 3 — the tie shares first, the NEXT rank skips to 3, encoding 'two partners tied for best'. DENSE_RANK prints 1, 1, 2 — ties share and nothing skips, the right choice when the ranks feed a bucketed policy (top-2 rungs advance). ROW_NUMBER prints 1, 2, 3 — it breaks the tie arbitrarily unless ORDER BY adds a deterministic tie-break (id, name), which turns 'arbitrary' into 'reproducible' — the minimum bar for anything that ships. Procurement at Bolt ships DENSE_RANK for the bench (policy rungs) or ROW_NUMBER with the tie-break when the spec says exactly one partner per rung; the non-negotiable is being able to SAY what happens on ties and show it's intentional. The failure the screens hunt: ROW_NUMBER with no tie-break, where re-running the query re-orders the tied partners and the leaderboard flips between refreshes.",
      tag: "rankings",
    },
    {
      id: "bolt-t21",
      q: "AVG(amount_cents) / 100 prints the average payout a cent low — sometimes. Walk me through the truncation and the correct order of operations.",
      a: "Two truncations are hiding in that expression. First, AVG over INTEGER cents in SQLite returns a REAL — fine — but AVG(amount_cents) / 100 divides the real by the INTEGER 100 only after averaging, so the loss isn't there. The real killer is the cousin form: AVG(amount_cents / 100) — integer division INSIDE the aggregate — where every payout truncates individually before averaging: a 4355-cent payout reads 43, not 43.55, and the average of truncated values is nobody's metric. The rule: keep money in cents through the whole fold, convert ONCE at the edge — ROUND(AVG(amount_cents) / 100.0, 2) — and never let a /100 touch a row-level value. The audit that catches it: fold one known payout by hand and compare — if the query's answer is off by fractions on every row, a row-level integer division is living somewhere in the pipeline. Cents are the unit of record; euros are a display decision made exactly once.",
      tag: "aggregation",
    },
    {
      id: "bolt-t22",
      q: "Build the tier ladder: partners fold to lifetime catalog value, then tiers fold to counts. Why two layers, and what breaks in one?",
      a: "Because the grains differ, and a query can fold one grain cleanly — two needs staging. Layer one: GROUP BY partner, SUM(price) AS catalog_value — one row per partner, the grain where 'lifetime value' exists. Layer two: that derived set becomes the input, and a CASE banding on catalog_value folds AGAIN — COUNT(*) per tier, maybe AVG(catalog_value) per tier. In one layer the temptation is CASE WHEN SUM(price) >= 1000 … inside the partner fold — legal, but then COUNT(*) counts PARTNERS per tier only if you also GROUP BY the CASE expression, and any bare per-row column in the SELECT is a loose cannon the engine resolves unpredictably. Staged, each layer is testable: layer one's row count must equal the partner count; layer two's tier counts must sum back to it — the reconciliation chain that proves no partner fell into a NULL tier. Two grains, two layers, named CTEs, reconciled — that's the whole architecture of every tiered report here.",
      tag: "groupby",
    },
    {
      id: "bolt-t23",
      q: "The telemetry feed retried overnight and scooter-days doubled. Count them or clean them — walk me through the decision and the mechanics.",
      a: "Classify first, because 'duplicate' is a business claim, not a data property. Detect: GROUP BY scooter_id, day HAVING COUNT(*) > 1 — the census of suspect pairs. Inspect: if the rows are payload-identical (same battery, same ride count), it's a retry — collapse with ROW_NUMBER() OVER (PARTITION BY scooter_id, day ORDER BY ingested_at DESC, id DESC) = 1, keeping the latest ingest with a deterministic tie-break. If the payloads DIFFER, they're two genuine rides in one scooter-day — deduping hides utilization and the fleet plan underbuys exactly the busy districts. The number that ships depends on that call, so the query leaves the receipts: the retry census (how many pairs, how many collapsed) prints beside the cleaned total. What never ships is a silent DISTINCT — it papers over both cases identically and the fleet decision inherits a number nobody can defend. Detect with aggregates, collapse with windows, defend the survivor.",
      tag: "quality",
    },
    {
      id: "bolt-t24",
      q: "The 07:50 panel said the city ran 300 rides yesterday; the 09:00 board says 312. Nothing changed in between. What's your freshness protocol?",
      a: "Treat every read as a read OF the feed, not of the city. Step one: freshness check — MAX(created_at) and row-count-per-hour on the raw feed; if the 07:50 snapshot stopped at 23:00 and the 09:00 load caught up, the delta is late-arriving rows, not a contradiction. Step two: versioning discipline — panels print their cutoff ('data through 2025-02-26 23:00 UTC') so two snapshots with different cutoffs can't be compared as if they were truth. Step three: the late-arrival policy — bookings that land after the close are either restated (the number moves, and the deck says 'restated') or counted in the next period (the number freezes, and the deck says 'as of'), but the choice is made ONCE, in writing, city-wide. What never happens is silently trusting the latest number because it's latest. The Bolt framing: a regulator got the 07:50 figure this morning — the protocol that explains 300-versus-312 is the same protocol that keeps that reply defensible.",
      tag: "etl",
    },
  ],

  mcqs: [
    {
      id: "bolt-mcq-1",
      prompt: "The cost packet needs this month's spend and last month's spend in one result set. Which operator — and why?",
      choices: [
        "UNION — dedupes overlapping days automatically",
        "UNION ALL — the populations are disjoint; dedupe would only mask a definition bug",
        "INTERSECT — shows the spend common to both months",
        "JOIN — stacks result sets vertically",
      ],
      answer: 1,
      why: "Two month filters cannot overlap, so UNION ALL is pure append — cheap and honest. UNION's dedupe is a cost here and a hazard: if a definition bug ever made branches overlap, UNION would silently delete the evidence.",
      notes: [
        { choice: 0, why: "UNION dedupes whole rows across the stack — for disjoint populations it's wasted work, and it hides future overlap bugs instead of surfacing them." },
        { choice: 2, why: "INTERSECT returns rows present in BOTH branches — two disjoint month folds intersect to zero rows. This packet ships empty." },
      ],
      difficulty: "easy",
    },
    {
      id: "bolt-mcq-2",
      prompt: "The service-mix panel must print completed, underway, awaiting-match and cancelled counts in ONE pass over bookings. Which construct does that?",
      choices: [
        "Four separate queries joined by UNION",
        "COUNT(*) FILTER (WHERE status = '…') — one per branch, in the same SELECT",
        "GROUP BY status — one row per status",
        "A window function with PARTITION BY status",
      ],
      answer: 1,
      why: "FILTER (WHERE …) is per-aggregate: each COUNT keeps only its own rows, all four computed in the same scan — and the branches must sum to COUNT(*) over all placed bookings (52+30+14+7 = 103), the internal audit the panel checks before publishing.",
      notes: [
        { choice: 2, why: "GROUP BY status returns a COLUMN of rows, not a single dashboard row — the panel wants one row with four named columns that reconcile." },
        { choice: 3, why: "PARTITION BY status keeps every row and adds counts alongside — a different shape entirely, and still one column per output row to unpick." },
      ],
      difficulty: "easy",
    },
    {
      id: "bolt-mcq-3",
      prompt: "The fare catalog splits at 50: standard tier (>= 50) and budget tier (below). Which CASE fold guarantees no listing lands in a silent third bucket?",
      choices: [
        "CASE WHEN price > 50 THEN 'standard' WHEN price < 50 THEN 'budget' END",
        "CASE WHEN price >= 50 THEN 'standard' ELSE 'budget' END",
        "CASE WHEN price = 50 THEN 'standard' ELSE 'budget' END",
        "IF(price > 50, 'standard', 'budget')",
      ],
      answer: 1,
      why: "Two arms with >= at the boundary and ELSE for the remainder are exhaustive by construction: 16 listings land in exactly two buckets — 8 and 8 on this db. Any boundary decision (50.00 itself is standard) is now a stated definition, not an accident.",
      notes: [
        { choice: 0, why: "A listing priced exactly 50 matches NEITHER arm and falls out as NULL — the silent third bucket the audit dreads, invisible until a total refuses to reconcile." },
        { choice: 2, why: "Equality at 50 puts the boundary listing in 'standard' but flips everything 51-and-up into 'budget' — the arms are inverted, not exhaustive." },
      ],
      difficulty: "medium",
    },
    {
      id: "bolt-mcq-4",
      prompt: "A rolling-actives query writes SUM(actives) OVER (ORDER BY day) and the fold has two rows sharing a day (per-vertical stack). What does the default frame do?",
      choices: [
        "Nothing — ties are ignored by window functions",
        "The running total jumps by BOTH peer rows at once — the default frame is RANGE, which includes peers",
        "The query errors — duplicate ORDER BY values are illegal",
        "It picks one of the two rows arbitrarily",
      ],
      answer: 1,
      why: "OVER (ORDER BY …) without a frame defaults to RANGE UNBOUNDED PRECEDING → CURRENT ROW, and RANGE includes PEERS — every row sharing the ordering value. The running total absorbs the whole peer group at the shared day, producing a step the trend chart reads as a genuine spike.",
      notes: [
        { choice: 2, why: "Duplicate ordering values are perfectly legal — that's exactly why the frame distinction (ROWS vs RANGE) exists." },
        { choice: 3, why: "Nothing is dropped. Both rows are fully counted — the bug is double-counting in one step, not missing data." },
      ],
      difficulty: "medium",
    },
    {
      id: "bolt-mcq-5",
      prompt: "expenses.amount_cents is INTEGER. Which expression reads the euro value with cents preserved?",
      choices: [
        "SUM(amount_cents) / COUNT(*) / 100",
        "ROUND(SUM(amount_cents) / 100.0, 2)",
        "SUM(amount_cents) / 100",
        "AVG(amount_cents) * 100",
      ],
      answer: 1,
      why: "Dividing by 100.0 promotes to real arithmetic before rounding: 1680000 cents prints 16800.00. The integer forms truncate — and on a cost ledger, truncation is a fake saving that surfaces the day the TOTAL row refuses to reconcile with the branches.",
      notes: [
        { choice: 0, why: "Two integer divisions in sequence truncate twice — and the COUNT(*) denominator quietly turns the total into a per-entry average nobody asked for." },
        { choice: 3, why: "AVG is already a mean; multiplying by 100 inflates it. This is a per-entry average of cents, printed a hundred times too large." },
      ],
      difficulty: "medium",
    },
    {
      id: "bolt-mcq-6",
      prompt: "A city ran 45 bookings: 24 completed, 12 underway, 6 awaiting, 3 cancelled. The regulator asks 'completion rate'. What's the denominator?",
      choices: [
        "36 — completed plus underway only",
        "45 — all placed bookings, cancelled and awaiting included",
        "24 — completed trips are their own baseline",
        "42 — exclude cancelled; they never had a chance",
      ],
      answer: 1,
      why: "Completion rate is completed ÷ PLACED: 24/45 = 53.3%. The regulator's question is 'of what was requested, how much moved', so cancelled and awaiting stay in the denominator — exclude them and you're reporting a different, unnamed metric.",
      notes: [
        { choice: 3, why: "Dropping cancelled bookings shrinks the denominator to the numerator's friends — denominator drift, and the number is no longer comparable across cities with different cancellation profiles." },
        { choice: 0, why: "That's completion ÷ (completed + underway) — an in-flight share. Legit elsewhere, but it isn't what was asked, and renaming it after the fact doesn't help." },
      ],
      difficulty: "medium",
    },
    {
      id: "bolt-mcq-7",
      prompt: "Scooter-day telemetry double-fires on retries; two rows can share the same scooter, day AND timestamp. Which dedupe keeps exactly one row per scooter-day, deterministically?",
      choices: [
        "SELECT DISTINCT scooter_id, day FROM telemetry",
        "ROW_NUMBER() OVER (PARTITION BY scooter_id, day ORDER BY ingested_at DESC) = 1",
        "ROW_NUMBER() OVER (PARTITION BY scooter_id, day ORDER BY ingested_at DESC, id DESC) = 1",
        "GROUP BY scooter_id, day and take MAX(ride_count)",
      ],
      answer: 2,
      why: "The id DESC tie-break is the whole answer: when retries share a timestamp, ordering by timestamp alone leaves the pick engine-arbitrary. Adding a unique column makes 'latest ingest wins' deterministic — the property a regeneration of the same report requires.",
      notes: [
        { choice: 0, why: "DISTINCT collapses only fully-identical rows — two retry rows that differ in any column both survive, and the utilization count doubles anyway." },
        { choice: 3, why: "MAX of a count isn't a row — it's a value, and the payload columns around it now come from nowhere in particular. Collapsing rows needs a ranking, not an aggregate." },
      ],
      difficulty: "hard",
    },
    {
      id: "bolt-mcq-8",
      prompt: "Growth wants verticals whose DISTINCT active riders in a trailing window exceed 5. Where does that predicate live — and why not WHERE?",
      choices: [
        "WHERE COUNT(DISTINCT rider_id) > 5 — filters rows early, cheaper",
        "HAVING COUNT(DISTINCT rider_id) > 5 — group filter, runs after the fold",
        "LIMIT 5 — cap the output",
        "It belongs in the SELECT as a CASE flag",
      ],
      answer: 1,
      why: "Distinct-riders-per-vertical is a group-level fact that exists only after GROUP BY folds the join, and group predicates live in HAVING. WHERE runs before folding — it can't see aggregates, and a row-level filter there silently changes the population being counted.",
      notes: [
        { choice: 0, why: "WHERE rejects aggregate expressions outright — and even if an engine tolerated it, filtering before the fold changes the denominator instead of the group set." },
        { choice: 2, why: "LIMIT caps OUTPUT rows after sorting — a threshold, not a row count. The five rows it keeps would be arbitrary." },
      ],
      difficulty: "hard",
    },
    {
      id: "bolt-mcq-9",
      prompt: "You must rank fleet partners by average catalog price, cheapest first — but the average must be computed BEFORE ranking. What's the safe shape?",
      choices: [
        "DENSE_RANK() OVER (ORDER BY AVG(price) DESC) directly in the grouped query — windows run after GROUP BY",
        "Rank in a derived table: fold averages first, then DENSE_RANK() OVER (ORDER BY avg_price) over the derived rows",
        "ORDER BY AVG(price) and read the rank off the row numbers yourself",
        "Use MAX(price) — the priciest listing is what procurement sees anyway",
      ],
      answer: 1,
      why: "Ranking over an aggregate works in one level in SQLite, but the safe, reviewable shape stages it: a derived table folds per-partner averages (one row per partner), the outer query ranks that result — two grains, two layers, one job each. It's also the only clean way to rank by a share of the fold.",
      notes: [
        { choice: 0, why: "Legal but fragile: add any bare per-row column to that SELECT and stricter engines error while SQLite annotates the leaderboard with a random row's value." },
        { choice: 3, why: "MAX changes the metric — the priciest single listing is a different procurement question, and the leaderboard silently re-ranks around outliers." },
      ],
      difficulty: "hard",
    },
    {
      id: "bolt-mcq-10",
      prompt: "Which two expressions produce the same '%Y-%m' month bucket on fixed-width ISO text timestamps?",
      choices: [
        "STRFTIME('%Y-%m', created_at) and SUBSTR(created_at, 1, 7)",
        "STRFTIME('%Y-%m', created_at) and SUBSTR(created_at, 6, 2)",
        "STRFTIME('%m', created_at) and SUBSTR(created_at, 1, 7)",
        "DATE(created_at) and STRFTIME('%Y-%m', created_at)",
      ],
      answer: 0,
      why: "On '2025-02-27 …' text, the first seven characters are '2025-02' — identical to the strftime bucket. The equivalence is format-dependent: one non-padded date in the feed and SUBSTR quietly mis-buckets while STRFTIME keeps parsing.",
      notes: [
        { choice: 1, why: "SUBSTR(created_at, 6, 2) is just the month '02' — it merges February 2024 with February 2025 into one bucket." },
        { choice: 3, why: "DATE(created_at) returns the full '2025-02-27' — a day bucket, not a month bucket. The spine doubles in grain and the monthly total quietly splits." },
      ],
      difficulty: "easy",
    },
    {
      id: "bolt-mcq-11",
      prompt: "A booking-to-service mapping table is missing two service classes. Bookings carrying those classes join to nothing. Which join keeps them in the census?",
      choices: [
        "INNER JOIN — unmatched rows are noise anyway",
        "LEFT JOIN from bookings — every placed booking survives, mapped or not",
        "RIGHT JOIN from bookings — right tables always win",
        "CROSS JOIN — everything pairs with everything",
      ],
      answer: 1,
      why: "The census counts PLACED bookings, so bookings are the driving table and LEFT JOIN is the survivorship decision: a booking with no service mapping still counts, with NULLs where the mapping would be. INNER JOIN silently redefines the population to 'bookings with complete metadata' — a regulator-facing count that shrinks without announcement.",
      notes: [
        { choice: 0, why: "INNER is the fan of complete data. It drops the two unmapped classes and the service mix now sums to less than the placed total — the reconciliation fires and nobody can say why." },
        { choice: 2, why: "RIGHT JOIN keeps the mapping table's rows, not the bookings' — with the driving table on the left it's an INNER JOIN wearing a different hat." },
      ],
      difficulty: "easy",
    },
    {
      id: "bolt-mcq-12",
      prompt: "A rider's service history — 'rides, food, scooters' — must print as ONE cell per rider. Which fold does that?",
      choices: [
        "SUM(service) OVER ()",
        "GROUP_CONCAT(DISTINCT service) with GROUP BY rider",
        "ARRAY_AGG(service) FILTER (WHERE used)",
        "COUNT(DISTINCT service) concatenated by hand",
      ],
      answer: 1,
      why: "GROUP_CONCAT folds many rows into one delimited string cell — the per-rider service résumé in a single read. DISTINCT inside keeps repeat bookings from printing 'rides, rides, food', and SQLite offers it natively where ARRAY_AGG doesn't exist.",
      notes: [
        { choice: 0, why: "SUM over a text service name is nonsense — and even over numeric flags it produces a total, not a list. Folding to a cell is a string job." },
        { choice: 3, why: "COUNT gives the number of verticals (3) — useful, but the ask is WHICH ones. A count can't carry the names." },
      ],
      difficulty: "easy",
    },
    {
      id: "bolt-mcq-13",
      prompt: "Settlement accruals: payouts carry settled_on, NULL until the payment run. Which pair prints settled versus outstanding in one pass?",
      choices: [
        "COUNT(*) and COUNT(settled_on)",
        "COUNT(*) and SUM(settled_on)",
        "COUNT(DISTINCT settled_on) and COUNT(*)",
        "AVG(settled_on) and COUNT(*)",
      ],
      answer: 0,
      why: "COUNT(*) counts every payout row; COUNT(settled_on) skips NULLs — the gap between them IS the outstanding pool, read in one scan. SUM of a date is meaningless, and dates aren't summable in any sense finance would sign.",
      notes: [
        { choice: 1, why: "SUM(settled_on) adds dates together — type nonsense that either errors or produces a number nobody can spend. The count pair is the idiom." },
        { choice: 2, why: "DISTINCT on a date counts distinct SETTLEMENT DAYS, not settled payouts — two payouts on one run day collapse into one." },
      ],
      difficulty: "easy",
    },
    {
      id: "bolt-mcq-14",
      prompt: "Procurement needs the single cheapest quality-gated listing. Which is the defensible shape?",
      choices: [
        "MAX(price) — one function, no sorting",
        "ORDER BY price ASC LIMIT 1",
        "TOP 1 price",
        "MIN(price) alone, no other columns",
      ],
      answer: 1,
      why: "ORDER BY … LIMIT 1 returns the whole cheapest ROW — price AND its listing, partner and category — which is what a decision needs. MIN(price) alone proves a number exists but orphans it from the listing that carries it.",
      notes: [
        { choice: 0, why: "MAX finds the most expensive — the exact opposite procurement decision, delivered with total confidence." },
        { choice: 3, why: "The number without its row is trivia: '43.90 exists' doesn't say what to buy. Ranking shapes exist to keep the row and the value together." },
      ],
      difficulty: "easy",
    },
    {
      id: "bolt-mcq-15",
      prompt: "City names arrive as 'tallinn', 'Tallinn', 'TALLINN' from three feeds. The per-city fold must be one row per city. What's the fix?",
      choices: [
        "GROUP BY city and accept three rows for Tallinn",
        "Normalize in the fold: GROUP BY UPPER(TRIM(city))",
        "WHERE city = 'Tallinn' — the canonical spelling only",
        "DISTINCT city before grouping",
      ],
      answer: 1,
      why: "The fold groups by the NORMALIZED key: UPPER(TRIM(city)) collapses the three spellings into one bucket, and the display layer can pick the pretty casing. Filtering to one spelling doesn't merge data — it discards two-thirds of the city's bookings.",
      notes: [
        { choice: 2, why: "Equality is case-sensitive in SQLite: 'tallinn' fails the filter and the city's numbers read low — a silent undercount a regulator would catch faster than you can say 'feed drift'." },
        { choice: 3, why: "DISTINCT dedupes the display list, not the fold — GROUP BY city still sees three keys and the revenue for one city splits three ways." },
      ],
      difficulty: "easy",
    },
    {
      id: "bolt-mcq-16",
      prompt: "The month-close packet must include every booking placed in February, including the last evening. Which filter guarantees that?",
      choices: [
        "BETWEEN '2025-02-01' AND '2025-02-28'",
        "created_at >= '2025-02-01' AND created_at < '2025-03-01'",
        "SUBSTR(created_at, 1, 7) = '2025-02'",
        "MONTH(created_at) = 2",
      ],
      answer: 1,
      why: "The half-open interval [Feb 1, Mar 1) is the only shape that keeps the month's final evening: BETWEEN '…02-28' drops everything on the 28th after midnight — historically the surge window. The SUBSTR shortcut works on fixed-width ISO but breaks the day one feed pads differently.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive on both ends AND still loses the last day's timestamps past 00:00 — '2025-02-28 21:14' is greater than '2025-02-28' and falls out." },
        { choice: 2, why: "The month-bucket expression is for GROUP BY spines; as a filter it scans every row and quietly depends on the feed never changing format." },
      ],
      difficulty: "easy",
    },
    {
      id: "bolt-mcq-17",
      prompt: "Growth needs riders with at least one food order. Which shape scales and stays correct when the food fold is empty?",
      choices: [
        "WHERE rider_id IN (SELECT rider_id FROM food_orders) — semijoin, cheap and NULL-forgiving",
        "WHERE rider_id NOT IN (SELECT rider_id FROM food_orders)",
        "WHERE EXISTS only — IN is deprecated",
        "A CROSS JOIN between riders and food orders",
      ],
      answer: 0,
      why: "IN over a subquery is a semijoin: each rider is tested once against the folded set, and an empty inner list simply returns no rows — honest. The NOT IN variant is the famous trap: one NULL in the inner list and the whole query returns nothing.",
      notes: [
        { choice: 1, why: "NOT IN with a NULL in the subquery makes every comparison UNKNOWN — the rider list silently empties. This is the single most common subquery bug in the wild." },
        { choice: 3, why: "CROSS JOIN multiplies every rider by every food order — the fan-out that turns a rider census into a row-count disaster before the first WHERE runs." },
      ],
      difficulty: "medium",
    },
    {
      id: "bolt-mcq-18",
      prompt: "The actives curve needs a TRUE trailing-7-day running count over per-day folds. Which frame declaration does that?",
      choices: [
        "OVER (ORDER BY day) — the default is already 7 days",
        "OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)",
        "OVER (PARTITION BY day)",
        "OVER (ORDER BY day RANGE BETWEEN 6 PRECEDING AND CURRENT ROW)",
      ],
      answer: 1,
      why: "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW counts physical rows — exactly seven day-folds — regardless of ties. The default (RANGE unbounded) sums from forever, and RANGE with a numeric offset compares VALUES, not row positions, so it isn't a 7-day window at all.",
      notes: [
        { choice: 0, why: "The default frame is UNBOUNDED PRECEDING — the running total starts at day one and never resets. The '7-day' panel would plot cumulative actives forever." },
        { choice: 2, why: "PARTITION BY day makes every day its own island — the running count resets daily and the curve is flat by construction." },
      ],
      difficulty: "medium",
    },
    {
      id: "bolt-mcq-19",
      prompt: "Cross-sell: for each rider, a food order that FOLLOWED a ride. Which shape flags the follow-on order?",
      choices: [
        "LAG(service) OVER (PARTITION BY rider_id ORDER BY created_at) = 'ride'",
        "service = 'food' AND rider_id IN riders",
        "SELF JOIN riders to themselves",
        "COUNT(*) OVER (PARTITION BY rider_id) > 1",
      ],
      answer: 0,
      why: "LAG reads the PREVIOUS row in sequence order: partitioned per rider, ordered by time, it puts each booking's predecessor next to it — 'food after ride' becomes one comparison. The COUNT variant proves multi-use but can't say anything about ORDER, and cross-sell is an ordering story.",
      notes: [
        { choice: 1, why: "That's every food order by an active rider — no reference to what came before. Sequencing is the entire question." },
        { choice: 3, why: "Counting bookings > 1 includes ride-then-ride and food-then-food. The follow-on flag would be wrong in both directions and growth would fund the wrong journey." },
      ],
      difficulty: "medium",
    },
    {
      id: "bolt-mcq-20",
      prompt: "A scooter with no fleet assignment should display as '—' in the ops panel. Where does COALESCE belong?",
      choices: [
        "COALESCE(fleet_name, '—') at the display edge only",
        "COALESCE inside the pipeline so downstream sees a fleet name",
        "Never — NULLs should propagate everywhere",
        "COALESCE in the ingest job, replacing NULL with 'unassigned' forever",
      ],
      answer: 0,
      why: "The display edge is the only honest place: downstream logic must still distinguish 'no assignment' from a real fleet, and '—' is a rendering decision. Coalescing mid-pipeline launders an unknown into a string that filters, joins and counts as REAL — the unassigned scooters vanish from the utilization audit.",
      notes: [
        { choice: 1, why: "Once 'unassigned' is a value, GROUP BY fleet counts it as a fleet and no filter can separate it from 'never was assigned' — the distinction is destroyed at the fold." },
        { choice: 3, why: "Rewriting the feed hides the gap at the source: today's backfill problem becomes tomorrow's unrecoverable history. Guard at read time, fix at the source." },
      ],
      difficulty: "medium",
    },
    {
      id: "bolt-mcq-21",
      prompt: "The completion panel computes 100.0 * COUNT(*) FILTER (WHERE status = 'completed') / COUNT(*). Why is this shape regulator-safe?",
      choices: [
        "FILTER runs faster than CASE",
        "Numerator and denominator read the SAME rows in the SAME scan — no population drift is possible",
        "100.0 makes the result an integer",
        "FILTER ignores cancelled bookings automatically",
      ],
      answer: 1,
      why: "The safety property is structural: both aggregates fold over the identical placed-bookings population in one pass, so the denominator can never silently shrink — the classic WHERE-first bug is impossible by construction. The 100.0 is real-division promotion; FILTER is syntax, not semantics.",
      notes: [
        { choice: 2, why: "100.0 promotes to floating point — the opposite of integer. The claim inverts the actual mechanism." },
        { choice: 3, why: "FILTER only scopes ITS aggregate; the denominator COUNT(*) still sees every row. That's exactly why the ratio is honest." },
      ],
      difficulty: "medium",
    },
    {
      id: "bolt-mcq-22",
      prompt: "Report tiers of partners by TOTAL listing value: only partners whose catalog exceeds 200. Which clause holds the 200 gate?",
      choices: [
        "WHERE SUM(price) > 200 before GROUP BY",
        "HAVING SUM(price) > 200 after GROUP BY",
        "LIMIT 200",
        "WHERE price > 200 row by row",
      ],
      answer: 1,
      why: "SUM(price) per partner exists only after the fold, and post-fold predicates live in HAVING. WHERE price > 200 answers a different question — 'listings priced over 200' — and pre-filters the very rows the fold needs, quietly repricing every partner's catalog.",
      notes: [
        { choice: 0, why: "WHERE cannot see aggregates at all — the query fails to parse. The error is the friendly version; the dangerous version is choice 4, which parses and lies." },
        { choice: 3, why: "Row-level filtering changes the fold's inputs: a partner with three 90-catalog listings vanishes entirely instead of showing a 270 total." },
      ],
      difficulty: "medium",
    },
    {
      id: "bolt-mcq-23",
      prompt: "City pods want riders quartiled by monthly ride count — four equal bands, 1 through 4. Which function is built for that?",
      choices: [
        "ROW_NUMBER() OVER (ORDER BY rides)",
        "NTILE(4) OVER (ORDER BY rides)",
        "ROUND(rides / MAX(rides) * 4)",
        "MOD(rides, 4) + 1",
      ],
      answer: 1,
      why: "NTILE(4) distributes the folded rows into four as-equal-as-possible buckets and numbers them 1–4 — quartiles by definition, tie-tolerant and edge-case-free. Hand-rolled ratios break on exactly-zero rides and tie at boundaries; MOD is remainder arithmetic, not ranking.",
      notes: [
        { choice: 0, why: "ROW_NUMBER gives every rider a distinct ordinal — 16 riders, 16 rungs. That's a leaderboard, not bands; two riders with identical counts land in different quartiles." },
        { choice: 2, why: "The ratio quartile puts ties at shared boundaries unreliably and collapses when MAX is an outlier — one whale rider and everyone else is quartile 1." },
      ],
      difficulty: "hard",
    },
    {
      id: "bolt-mcq-24",
      prompt: "For each rider, the panel needs their LATEST booking's fare beside every booking row — not a fold to one row. Which shape?",
      choices: [
        "GROUP BY rider with MAX(total)",
        "MAX(total) OVER (PARTITION BY rider_id)",
        "ORDER BY created_at LIMIT 1 per rider",
        "DISTINCT rider_id, total",
      ],
      answer: 1,
      why: "A windowed MAX keeps every row and carries the per-rider maximum alongside — the 'beside every row' requirement is the window signature. GROUP BY collapses to one row per rider, which is a different deliverable, and LIMIT can't be applied per group without staging.",
      notes: [
        { choice: 0, why: "The fold returns 16 rows and loses the per-booking context the panel renders beside each line. Right value, wrong grain." },
        { choice: 2, why: "LIMIT applies once to the whole result set, not per rider — you get one row globally, and 'per group' limits need a staged ranking." },
      ],
      difficulty: "hard",
    },
    {
      id: "bolt-mcq-25",
      prompt: "A UNION ALL packet stitches month-close branches, but the second branch lists (spend, category) where the first lists (category, spend). What happens?",
      choices: [
        "The engine matches columns by name and fixes it",
        "Set ops match by POSITION: the stack silently swaps categories and spend into wrong columns",
        "The query fails on type mismatch always",
        "Nothing — UNION ALL reorders columns to match",
      ],
      answer: 1,
      why: "UNION ALL aligns columns by position, never by name: numbers land in the category column and text in the spend column, and the packet still 'runs'. The reconciling TOTAL row then sums text-to-number nonsense or errors late — the misalignment is discovered at the review, not at the keyboard.",
      notes: [
        { choice: 0, why: "Name-matching is a JOIN property, not a set-op property. UNION ALL couldn't care less what the branches called their columns." },
        { choice: 2, why: "SQLite is loosely typed and often stacks anyway — the worst outcome. A packet that runs and reads wrong outranks one that fails loudly." },
      ],
      difficulty: "hard",
    },
    {
      id: "bolt-mcq-26",
      prompt: "A correlated subquery compares each listing to ITS service class's average price. What's the honest cost-and-semantics summary?",
      choices: [
        "Identical to the uncorrelated version, just slower",
        "It re-runs the inner fold per outer row and answers a different question — class-relative, not platform-wide",
        "It fails unless the inner query returns exactly one row",
        "It's only legal inside HAVING",
      ],
      answer: 1,
      why: "The correlated inner query references the outer row, so it re-executes per listing AND changes the benchmark: below-average-for-my-class, not below-platform-average. Both may be legitimate asks — the screen tests whether you can say WHICH one you wrote and what it costs at scale.",
      notes: [
        { choice: 0, why: "Never identical: swap the correlation off and the benchmark population changes from one service class to the whole catalog — the leaderboard reorders." },
        { choice: 2, why: "Scalar subqueries are 0-or-1-row contracts, but a grouped-by-class correlated fold naturally returns one row per class — that shape is exactly why it works." },
      ],
      difficulty: "hard",
    },
    {
      id: "bolt-mcq-27",
      prompt: "Which query finds riders who have NEVER unlocked a scooter — the cross-sell whitespace list?",
      choices: [
        "INNER JOIN scooter_trips — the matched riders are the interesting ones",
        "LEFT JOIN scooter_trips … WHERE scooter_trips.rider_id IS NULL",
        "WHERE rider_id NOT IN (SELECT rider_id FROM scooter_trips) — safe because ids are never NULL",
        "GROUP BY rider HAVING COUNT(trip_id) = 0",
      ],
      answer: 1,
      why: "The LEFT JOIN … IS NULL anti-join is the shape: keep every rider, attach trips where they exist, keep the riders whose trip columns all came back NULL. It's NULL-false-positive-proof and states the intent — 'no match survived' — in the WHERE clause.",
      notes: [
        { choice: 0, why: "INNER keeps exactly the riders the question excludes. The whitespace list would be the complement — the one population INNER JOIN cannot return." },
        { choice: 3, why: "HAVING gates groups that EXIST — riders with zero trips fold to zero rows and never reach the HAVING. The list ships empty, forever." },
      ],
      difficulty: "hard",
    },
    {
      id: "bolt-mcq-28",
      prompt: "A running fare sum over bookings ordered by day shows jumps that skip several bookings at once. Diagnosis?",
      choices: [
        "Rows are being dropped by the engine",
        "The default RANGE frame includes PEERS — same-day rows all join the running total together",
        "SUM cannot be windowed — the value is approximated",
        "The jump is float rounding at 100.0",
      ],
      answer: 1,
      why: "OVER (ORDER BY day) without a declared frame defaults to RANGE, which admits every peer sharing the ordering value — all same-day bookings enter the running sum in one step. Declare ROWS BETWEEN … PRECEDING AND CURRENT ROW and the steps become per-row; the 'jump' was the frame, not the data.",
      notes: [
        { choice: 0, why: "Nothing is dropped — the opposite: too much arrives at once. Peer-group steps are the fingerprint of RANGE on tie-heavy folds." },
        { choice: 3, why: "Float rounding drifts in the last decimal; it never skips whole bookings. The step size here is entire peer groups." },
      ],
      difficulty: "hard",
    },
    {
      id: "bolt-mcq-29",
      prompt: "Two bookings tie on created_at; the 'latest booking per rider' report joins on MAX(created_at) and returns TWO rows for that rider. Why, and the fix?",
      choices: [
        "MAX is wrong — use SUM",
        "MAX(created_at) matches both tied rows; rank with ROW_NUMBER and a deterministic tie-break instead",
        "The join needs DISTINCT",
        "Nothing is wrong — ties should both print",
      ],
      answer: 1,
      why: "The MAX-join pattern matches EVERY row sharing the maximum — on ties the rider's history doubles and downstream counts inflate. ROW_NUMBER() OVER (PARTITION BY rider ORDER BY created_at DESC, id DESC) = 1 picks one deterministically, so regenerating the report reproduces the same rows.",
      notes: [
        { choice: 2, why: "DISTINCT would collapse the duplicate ROWS back to one — after any joined columns differ, DISTINCT keeps both. The disease survives the treatment." },
        { choice: 3, why: "For a reconciliation maybe; for 'THE latest booking' no — the spec says one row per rider, and the tie is resolved by policy (id DESC), not left to chance." },
      ],
      difficulty: "hard",
    },
    {
      id: "bolt-mcq-30",
      prompt: "The monthly packet needs each month's bookings PLUS the month-over-month delta. Which window sits on top of the month fold?",
      choices: [
        "LAG(bookings) OVER (ORDER BY month) beside the fold's bookings",
        "GROUP BY month, bookings, LAG(bookings)",
        "A self-join of the orders table to itself on month",
        "SUM(bookings) OVER (PARTITION BY month)",
      ],
      answer: 0,
      why: "Stage the month fold, then LAG over the folded rows ordered by month puts the previous month's bookings beside the current one — the delta is subtraction, done in the SELECT. The partition variant makes each month its own island, so LAG has nothing to look back at.",
      notes: [
        { choice: 1, why: "LAG(bookings) in the same SELECT as a bare GROUP BY references the folded aggregate only if the window runs over the fold — the clean form stages the fold, then windows it. Mixing grains in one layer is where the interview escalates." },
        { choice: 3, why: "PARTITION BY month sums within each month — every row's 'total' is its own month. The previous month is unreachable inside its own partition." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-bolt-1",
      tier: "easy",
      topic: "t5",
      universe: "supplier",
      title: "The low-cost fleet bench",
      brief:
        "Bolt-flavored brief on the storefront db: procurement refreshes the partner bench before each city launch — quality-gated, then ranked cheapest-first, because low-cost ops starts with what the inventory costs. The bar is fixed: only partners rated 4.5 and above make the bench. Probed facts: exactly two partners clear the gate — Alpine Audio GmbH (rating 4.8, average listing price 72) and Nordic Gadgets AB (rating 4.6, average listing price 139.66); Midwest Hardware Co misses at 4.4 despite competitive prices. The bench reads cheapest first, with the rank column visible so ties would share a rung if the averages ever collided.",
      ask: "Return the quality-gated partner bench ranked cheapest-first: partner, average listing price, and a dense rank.",
      template:
        "SELECT name,\n       avg_price,\n       DENSE_RANK() OVER (ORDER BY avg_price {1}) AS cost_rank\nFROM (SELECT s.name AS name,\n             ROUND({2}(p.price), 2) AS avg_price\n      FROM suppliers s\n      JOIN products p ON p.supplier_id = s.id\n      WHERE s.rating >= {3}\n      GROUP BY s.name)\nORDER BY cost_rank;",
      slots: [
        {
          answer: "ASC",
          kind: "keyword",
          label: "the cheapest-first direction",
          why: "Low-cost ops reads ascending: Alpine's 72 takes rank 1 ahead of Nordic's 139.66. DESC would crown the most expensive partner — a correct query aimed at the opposite procurement decision.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the partner's mean listing price",
          why: "AVG(price) per partner prices the bench fairly across catalogs of different depth — 72 vs 139.66. MAX would rank by the single priciest listing and let one outlier flip the bench.",
        },
        {
          answer: "4.5",
          kind: "number",
          label: "the quality gate",
          noVerify: true,
          why: "The bench bar is 4.5: Alpine (4.8) and Nordic (4.6) clear it; Midwest at 4.4 misses despite cheaper listings. A lower gate rebalances the bench and reopens suppliers procurement already ruled out.",
        },
      ],
      distractors: ["DESC", "SUM", "MAX", "4"],
      walkthrough:
        "A staged ranking: fold first, rank second, because the average must exist before it can be ordered. The derived table joins partners to their catalog listings, keeps only partners at the 4.5 quality bar, and folds one row per partner — Alpine 72, Nordic 139.66. The outer query then ranks that folded result: DENSE_RANK over avg_price ASC reads 1, 2 — cheapest first, and if two partners ever tied on average price they would share a rung with no gap, which is what the procurement lead asked the rank column to guarantee. WHERE in the derived stage (not the outer) means the gate filters partners before ranking, so an excluded partner can't occupy a rung. DESC in the direction slot crowns the expensive bench; SUM or MAX in the average slot re-price partners by total or by single priciest listing — different procurement questions wearing the same query; and dropping the gate to 4 quietly admits Andes Naturals at rating 4.0 and reshuffles the rungs. Two rows, three decisions, all of them policy.",
    },
    {
      id: "cs-bolt-2",
      tier: "medium",
      topic: "x3",
      universe: "expense",
      title: "The ops cost stack",
      brief:
        "Bolt-flavored brief on the storefront db: the weekly ops review opens with the cost stack — every expense category, entries and spend, plus the reconciling TOTAL row, because low-cost ops means every cent is accounted for twice. Probed facts: the ledger holds 36 entries — Rent 14 entries / 16800 (hub leases), Ads 14 / 4570 (rider acquisition), Travel 3 / 2521 (field ops), Tools 5 / 1525 (fleet tooling) — grand total 25416. The stack reads smallest-first so the packet grows to the TOTAL row, and the columns carry integer cents folded to euros by the /100.0 house rule. Finance will check the branches against the TOTAL to the cent; a one-unit mismatch is a bug, not rounding.",
      ask: "Return each expense category with entry count and euro spend, then a TOTAL row — smallest category first.",
      template:
        "SELECT e.category,\n       {1}(*) AS entries,\n       ROUND(SUM(e.amount_cents) / 100.0, 2) AS spend_eur\nFROM expenses e\nGROUP BY e.category\nUNION ALL\nSELECT {2},\n       {3},\n       ROUND(SUM(e.amount_cents) / 100.0, 2)\nFROM expenses e\nORDER BY spend_eur {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the per-category entry counter",
          why: "COUNT(*) folds rows per category — Rent's 14 entries vs Travel's 3 is the ledger's shape. SUM(*) doesn't exist, and MAX(*) would report one entry, not the depth finance reconciles against.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the reconciling label",
          why: "The literal 'TOTAL' brands the grand row so the packet is self-documenting. An unlabeled NULL category would read as a mystery fifth category instead of the audit row.",
        },
        {
          answer: "COUNT(*)",
          kind: "keyword",
          label: "the grand-row entry counter",
          why: "The TOTAL row counts every ledger entry — 36 — so entries reconcile across the stack too: 14+14+3+5 = 36. SUM(*) isn't SQL; a missing counter would leave the total row half-blind.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the grow-to-total order",
          why: "ASC stacks the packet smallest-first — Tools 1525, Travel 2521, Ads 4570, Rent 16800 — and lands TOTAL 25416 last, where the eye expects the reconciliation. DESC would bury the total on top where it reads like just another category.",
        },
      ],
      distractors: ["AVG", "SUM(*)", "MAX", "DESC"],
      walkthrough:
        "One stack, two branches, one reconciliation. The category branch folds 36 expense rows into four buckets — COUNT(*) for depth, SUM(amount_cents)/100.0 for euros: Tools 1525, Travel 2521, Ads 4570, Rent 16800. The TOTAL branch folds the whole table with no GROUP BY, labels itself with the 'TOTAL' literal, and prints 36 / 25416 — the audit identity finance checks to the cent: 14+14+3+5 = 36 entries and 16800+4570+2521+1525 = 25416 euros. UNION ALL is the operator because the branches are different populations; a deduping UNION would be wasted work today and a mask tomorrow, silently deleting a category that ever collided with the total. ORDER BY spend_eur ASC makes the packet grow to the total. AVG or MAX in either counter slot re-folds depth into pricing and the reconciliation dies quietly; DESC flips the packet so the TOTAL reads as the biggest category instead of the sum of them — a correct query that misreads at a glance.",
    },
    {
      id: "cs-bolt-3",
      tier: "easy",
      topic: "l8",
      universe: "month-close",
      title: "The busy-month census",
      brief:
        "Bolt-flavored brief on the storefront db: city ops closes the half-year review with the busy-month census — every month whose placed bookings reached the 8-booking ops bar, with cancelled rides folded beside them, because staffing and fleet rebalancing budgets are set per busy month. Probed facts: six months clear the bar — 2024-01 (8 placed, 1 cancelled), 2024-02 (9, 0), 2024-03 (8, 1), 2024-05 (8, 0), 2024-07 (8, 2), 2024-09 (9, 0) — 50 placed bookings in all, 4 of them cancelled. July is the only busy month carrying two cancellations, the surge-window readout ops quotes. The month spine is '%Y-%m' on TEXT timestamps, read chronologically, and the census is a single-table fold — the dashboard budget allows one pass over bookings, no joins.",
      ask: "Return each month with at least 8 placed bookings: month label, booking count, and cancelled count — chronological order.",
      template:
        "SELECT STRFTIME('{1}', created_at) AS month,\n       COUNT(*) AS bookings,\n       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled\nFROM orders\nGROUP BY month\nHAVING COUNT(*) >= {2}\nORDER BY month {3};",
      slots: [
        {
          answer: "%Y-%m",
          kind: "keyword",
          label: "the month spine format",
          why: "'%Y-%m' prints '2024-01' — the 14-month spine every monthly packet here hangs on. '%m' alone merges January 2024 with January 2025 into one bucket, and '%Y' collapses a whole year into a single row.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the busy-month ops bar",
          why: "The bar is the ops policy: 8 placed bookings makes a month 'busy' — exactly six months clear it on this db. A bar of 7 pulls in five more months and dilutes the staffing read; the threshold is visible as a literal so next quarter's re-tune is deliberate.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological order",
          why: "The census reads like a calendar — 2024-01 through 2024-09 — because the staffing story is a timeline. DESC would open the packet with September and read backwards through the review.",
        },
      ],
      distractors: ["%m", "7", "DESC"],
      walkthrough:
        "A single-table fold with a policy gate — the whole query is one pass because the dashboard budget says so. STRFTIME builds the month spine from TEXT timestamps, GROUP BY month folds 103 bookings into fourteen buckets, the conditional SUM counts cancelled rides inside the same fold, and HAVING COUNT(*) >= 8 keeps the six busy months: January 8/1, February 9/0, March 8/1, May 8/0, July 8/2, September 9/0. The cancelled column rides beside the count so the review sees both volume and friction in one row — July's two cancellations against eight placements is the surge-window story ops tells. The gates are all visible: '%Y-%m' pins the spine, the 8-bar is printed as a literal for the next re-tune, ASC keeps the calendar order. Swap the format to '%m' and the two years collapse into twelve rows that double-count half the months; drop the bar to 7 and five mediocre months crash the readout; DESC flips the review backwards. One table, one pass, three decisions — all of them policy a regulator could ask about.",
    },
    {
      id: "cs-bolt-4",
      tier: "medium",
      topic: "s6",
      universe: "pricing",
      title: "The fare-band fold",
      brief:
        "Bolt-flavored brief on the storefront db: the pricing team classifies the catalog into fare bands before every rule change — premium (price at or above 100), standard (50 to just under 100), budget (below 50) — and folds each band's listing count and mean price, because a fare-rule edit is judged by how many listings it touches per band. Probed facts: budget holds 8 listings averaging 32.06, standard holds 4 averaging 73.5, premium holds 4 averaging 149.5 — 16 listings, all classified, none NULL-banded. The boundaries are the price-owner's policy, printed as literals so the regulator sees exactly where 'standard' ends; the mean uses AVG so one expensive listing can't price a whole band. The read is alphabetical by band so the three rows land in a stable, diffable order.",
      ask: "Return each fare band with its listing count and average price — band name first, all bands classified.",
      template:
        "SELECT CASE WHEN price >= {1} THEN 'premium'\n            WHEN price >= {2} THEN 'standard'\n            ELSE 'budget' END AS fare_band,\n       {3}(*) AS listings,\n       ROUND(AVG(price), 2) AS avg_price\nFROM products\nGROUP BY fare_band\nORDER BY fare_band;",
      slots: [
        {
          answer: "100",
          kind: "number",
          noVerify: true,
          label: "the premium boundary",
          why: "The premium line is policy: price at or above 100 — exactly the 4 high-end listings. Move it to 150 and the 149.5 tier drops out of premium entirely; the boundary literal is how the regulator sees where the band starts.",
        },
        {
          answer: "50",
          kind: "number",
          noVerify: true,
          label: "the standard boundary",
          why: "Standard starts at 50 — cascading WHENs read top-down, so anything under 100 but at or above 50 lands here: 4 listings at 73.5 average. The ELSE arm catches everything below, which is why no listing can fall into a silent NULL band.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the band's listing counter",
          why: "COUNT(*) folds rows per band — 8, 4, 4 — the touch-count a fare-rule change is judged by. SUM(*) isn't SQL, and MAX(*) would report one listing, not the band's depth.",
        },
      ],
      distractors: ["150", "75", "MAX"],
      walkthrough:
        "CASE banding with exhaustiveness as the deliverable. The CASE arms cascade from the top boundary down — 100 for premium, 50 for standard — and the ELSE arm is the guarantee: every one of the 16 listings lands somewhere, budget's 8 at 32.06 average included, with no NULL tier to make the band totals refuse to reconcile. COUNT(*) is the touch-count pricing cares about and AVG is the band's honest mean — premium reads 149.5, not the single 199.99 listing a MAX would print. GROUP BY the CASE alias folds in one pass and ORDER BY fare_band gives the stable alphabetical read. The boundary literals are the case's point: as price OWNER, Bolt's bands are published policy, so the thresholds live as literals where a reviewer — or a regulator — can read them. Nudge the premium line to 150 and premium empties to the four 149-and-under listings' exclusion; push standard to 75 and the 73.5 listings fall into budget without moving a byte of the catalog; MAX in the counter slot re-folds depth into a single-row read. Bands are definitions, and this fold prints its definitions.",
    },
    {
      id: "cs-bolt-5",
      tier: "medium",
      topic: "j4",
      universe: "funnel",
      title: "The zero-completion read",
      brief:
        "Bolt-flavored brief on the storefront db: the funnel review reads the bottom of the completion ladder — riders ordered by COMPLETED rides ascending — because the leak hides where completions are zero, not where they're plenty. Probed facts: Liam O'Brien (EU) has 1 placed booking and 0 completions — his single 705.39 ride never completed; Jamal Wright (US) and Olivia Brown (EU) sit at 1 each, Bruno Silva (LATAM) and Dmitri Volkov (EU) at 2. The LEFT JOIN keeps all 16 riders and counts only delivered completions; the status filter lives IN the join predicate, not the WHERE — filter in WHERE and zero-completion riders vanish from the very list built to find them. Ordered ascending with name as tie-break, the readout leads with the leak and is reproducible on refresh.",
      ask: "Return riders with their completed-ride counts, ordered fewest completions first — include riders with zero.",
      template:
        "SELECT c.name,\n       c.region,\n       {1}(o.id) AS completed\nFROM customers c\n{2} JOIN orders o\n  ON o.customer_id = c.id\n AND o.status = 'delivered'\nGROUP BY c.id, c.name, c.region\nORDER BY completed {3}, c.name ASC;",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the completion counter",
          why: "COUNT(o.id) counts matched delivered bookings per rider — 0 for Liam, 1 and 2 up the ladder. SUM(o.id) would add booking ids together and print nonsense money-shaped numbers.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the survivorship join",
          why: "LEFT is the whole case: every rider survives, and the rider whose only ride never completed shows completed = 0. INNER would drop Liam — the leak — and the funnel readout would open at 1 with the bug invisible.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the leak-first order",
          why: "ASC leads with the zero-completion rider, which is the point of the read — and the name tie-break pinned in the ORDER BY keeps the two 1-completion riders in a stable order across refreshes. DESC buries the leak under the whale riders and the review praises a funnel it never inspected.",
        },
      ],
      distractors: ["SUM", "INNER", "DESC"],
      walkthrough:
        "A survivorship fold where the status filter's placement is the entire test. The LEFT JOIN carries all 16 riders; the 'delivered' condition lives IN the ON clause, so unmatched riders keep their row with COUNT(o.id) = 0 — Liam O'Brien's single placed booking never delivered, and the readout opens on him. GROUP BY folds per rider, COUNT(o.id) counts only the matched rows (COUNT(*) would count 1 even for the unmatched — the NULL row is still a row), and ORDER BY completed ASC, name ASC leads with the leak and breaks ties deterministically. The trap the case teaches: move the status filter to WHERE and the LEFT JOIN degrades to INNER — the unmatched rider's row is discarded exactly where the NULL test would have caught it, and the zero-completion population ships empty forever. SUM in the counter slot adds ids like money; INNER erases the leak; DESC and id flip or scramble the order the diff review depends on. One rider, one join keyword, one order — and the funnel read survives a refresh.",
    },
    {
      id: "cs-bolt-6",
      tier: "hard",
      topic: "t6",
      universe: "growth",
      title: "Latest booking per rider",
      brief:
        "Bolt-flavored brief on the storefront db: growth's rider panel pins each rider's LATEST booking — the current fare state, not the lifetime story — and the top-5 by fare opens the growth standup. Probed facts: Liam O'Brien (EU) leads at 705.39 (booked 2024-03-06 — the same never-completed ride the funnel read flags), then Pedro Alvarez (EU) 668.45, Chloe Dubois (EU) 659.70, Isabella Rossi (EU) 608.06, Emma Wilson (US) 585.79. The ranking is ROW_NUMBER per rider, partitioned by rider, ordered by booking time descending with id as the deterministic tie-break — because two bookings sharing a timestamp must resolve the same way on every refresh. The outer query keeps exactly rank 1 per rider and orders the readout by fare descending; the window keeps every booking during the fold so the panel could show runner-ups without a second scan.",
      ask: "Return each rider's latest booking: rider, region, fare, booked date — top 5 by fare, biggest first.",
      template:
        "SELECT rider, region, fare, booked_on\nFROM (SELECT c.name AS rider,\n             c.region,\n             o.total AS fare,\n             o.created_at AS booked_on,\n             ROW_NUMBER() OVER (PARTITION BY o.{1} ORDER BY o.created_at {2}, o.id DESC) AS rn\n      FROM orders o\n      JOIN customers c ON c.id = o.customer_id)\nWHERE rn = 1\nORDER BY fare DESC\nLIMIT {3};",
      slots: [
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the partition key",
          why: "PARTITION BY customer_id makes each rider's history its own island — one rank-1 survivor per rider. Partition by id and every booking is its own partition: 16 rank-1 rows, the 'latest per rider' fiction intact but wrong.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the latest-first rank order",
          why: "DESC puts the newest booking at rn = 1. ASC would crown each rider's FIRST booking — the acquisition read, a different panel wearing the same query.",
        },
        {
          answer: "5",
          kind: "number",
          noVerify: true,
          label: "the panel's row budget",
          why: "The panel shows five — the standup's row budget, a policy literal pinned into the fare-DESC readout. Any number executes; the brief fixes 5 so the readout is reproducible and the diff review sees the same five rows every morning.",
        },
      ],
      distractors: ["id", "ASC", "3"],
      walkthrough:
        "A keep-latest ranking with the tie-break drilled. The inner query walks every booking joined to its rider, and ROW_NUMBER — partitioned by customer_id, ordered created_at DESC with id DESC as the deterministic tie-break — numbers each rider's history newest-first. The outer query keeps rn = 1: sixteen riders, sixteen latest bookings, then ORDER BY fare DESC and a LIMIT 5 readout — Liam 705.39, Pedro 668.45, Chloe 659.70, Isabella 608.06, Emma 585.79. The MAX(created_at)-join cousin would double-count any rider with two bookings sharing a timestamp; the id tie-break is what makes 'latest' a policy instead of a coin flip. Partition by id and every row is its own winner — the panel fan-outs to all 103 bookings; ASC at the rank slot turns the panel into first-bookings, a legitimate read that isn't this one; LIMIT 3 truncates a budget decision somebody set deliberately. The window also keeps every row alive inside the fold, so a runner-up panel is a one-line change — that's why the screen prefers the window to the fold for per-entity latest reads.",
    },
  ],

  problems: [
    { slug: "active-businesses", why: "One-pass conditional flags per entity — the service-mix census: how many bookings of each kind did this city or partner fire, in a single scan." },
    { slug: "weather-type-in-each-country", why: "CASE branches per group — fare-rule classification by service class, the price-owner's daily fold." },
    { slug: "count-salary-categories", why: "CASE tiers plus a stacked total — spend-band censuses where the grand row must reconcile against the branches, this kit's stack habit." },
    { slug: "monthly-transactions-ii", why: "Cancelled-versus-rest packets via UNION ALL — the month-close stitch where two populations share one layout and a TOTAL row." },
    { slug: "team-scores-in-football-tournament", why: "Standings stacked per side — the per-market packet shape: played, completed, cancelled, one table, no second pass." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the vocabulary check before every procurement or utilization leaderboard, ties admitted honestly." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU ratios in one fold — the rolling-actives drill behind Bolt's weekly stickiness panels, denominators stated out loud." },
    { slug: "rolling-7d-actives", why: "Trailing-window distinct counts per group — 7-day actives per vertical, the frame-discipline muscle of this kit's windows topic." },
    { slug: "ads-performance", why: "Rate computations with honest denominators — the marketing-spend read where integer division quietly zeroes small markets." },
    { slug: "hopper-company-queries-ii", why: "Driver availability rates over a calendar — supply-health ratios computed the way Bolt's city pods compute them weekly." },
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded share where unmatched rows count as zero — match-confirmation rates with the NULL policy priced in." },
    { slug: "average-selling-price", why: "Period-weighted pricing — fare-per-service ratios where the weighting choice changes the answer, a favorite Bolt follow-up." },
    { slug: "second-highest-salary", why: "The second-best read via subquery — second-cheapest lane, runner-up partner: scalar subqueries under a query budget." },
    { slug: "account-balance", why: "Running balances per account — driver and courier payout statements folded in cents, the settlement team's daily read." },
    { slug: "gl-reconciliation", why: "Ledger-eyes reconciliation — branches that must equal the TOTAL, the exact discipline the ops cost stack is audited with." },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER keep-latest with a deterministic tie-break — fleet telemetry retries and payout retries, deduped defensibly." },
    { slug: "customers-who-never-order", why: "The anti-join opener: riders who signed up and never booked — the onboarding-leak list the funnel review reads first." },
    { slug: "combine-two-tables", why: "LEFT JOIN profiles against activity with unmatched rows kept — the survivorship habit the zero-completion read depends on." },
    { slug: "sales-analysis-ii", why: "Buyers with no purchases kept via LEFT JOIN + CASE — status-filter placement drilled in graded form." },
    { slug: "user-activity-for-the-past-30-days-i", why: "Trailing-window actives per day — the 30-day sibling of the 7-day actives panel, same frame discipline." },
    { slug: "queries-quality-and-percentage", why: "Quality ratios with honest denominators — the completion-share shape applied to query quality, rounding only at the end." },
    { slug: "restaurant-growth", why: "Rolling 7-day spend average — the windowed muscle behind the actives curve, computed over staged folds." },
    { slug: "rising-temperature", why: "Consecutive-day comparison on dates — the demand-shift read between like days, TEXT-diff discipline included." },
    { slug: "last-person-to-fit-in-the-bus", why: "Running-sum capacity gate — scooter battery and fleet-capacity allocation folds, where the frame decides who boards." },
    { slug: "human-traffic-of-stadium", why: "Three-plus consecutive rows above a bar — surge-streak detection in daily booking folds." },
    { slug: "consecutive-numbers", why: "Repeated-value streak detection — the same-status run finder behind surge and outage flags in booking logs." },
    { slug: "count-student-number-in-departments", why: "LEFT JOIN counts that keep zero buckets — partners with no listings still print, or the bench census lies." },
    { slug: "employee-bonus", why: "NULL-safe threshold comparison — bonus eligibility where a missing value must not silently fail the filter." },
    { slug: "average-time-of-process-per-machine", why: "Duration diffs folded per entity — ride latency per scooter class, JULIANDAY math rounded once at the end." },
    { slug: "calculate-parking-fees-and-duration", why: "Duration math with ceiling rules — per-minute fare billing, the fare-owner's arithmetic done exactly." },
    { slug: "compute-the-rank-as-a-percentage", why: "Percent-ranked leaderboards — city league tables where the share of the field is the headline, not the ordinal." },
    { slug: "department-highest-salary", why: "Per-group maximum joined back to its row — the top partner per region, staged so the max carries its name." },
  ],
};
