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
    "Preparation strategy: Bolt has no tagged pool in this app's registry, so the kit curates **sixteen problems** from the SQL band that mirror its known screen themes — one-scan censuses, `CASE` classification, `UNION ALL` cost packets, rolling-actives windows, and cents-safe payout folds. Do the topics in order, then run both case studies on the live storefront database: one rebuilds the low-cost fleet bench procurement uses to pick partner inventory, the other rebuilds the ops cost stack with its reconciling TOTAL row.",
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
      slugs: ["active-businesses", "find-stores-with-inventory-imbalance", "number-of-rich-customers"],
    },
    {
      name: "CASE classification for fare rules",
      why: "The price catalog is rule-shaped: standard tier, budget tier, promotional, each with its own boundary. CASE WHEN is the daily classifier, and the screens check exhaustiveness — a boundary at exactly the threshold, an ELSE that catches everything below, and no silent third band pricing can't explain.",
      slugs: ["calculate-special-bonus", "weather-type-in-each-country", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Stacked packets with UNION ALL",
      why: "Month-close and regulator packets stitch populations into one deliverable: this-month versus last-month, cancelled versus kept, per-city blocks stacked into one table. Bolt drills UNION ALL's no-dedupe cheapness and the column-position discipline that keeps a stack type-safe — a packet that silently dedupes or misaligns columns reads as two different businesses.",
      slugs: ["team-scores-in-football-tournament", "monthly-transactions-ii", "count-salary-categories"],
    },
    {
      name: "Low-cost leaderboards",
      why: "Cheapest trusted partner first, second-cheapest lane, scooters ranked by utilization — low-cost ops is ranking ops. The rank trio plus tie handling is drilled because procurement leaderboards tie constantly, and the LIMIT-1-OFFSET-1 habit breaks exactly there.",
      slugs: ["rank-scores", "second-most-recent-activity", "top-three-wineries"],
    },
    {
      name: "Rates with honest denominators",
      why: "Completion rates, take rates, ad-spend ratios — Bolt's ratios punish integer division and careless filters. The house habit: 100.0 before the division, the denominator's filter decided BEFORE the ratio, and rounding only at the end. The follow-up is always 'what's in the denominator?' — because a regulator may read the answer.",
      slugs: ["ads-performance", "hopper-company-queries-ii", "card-launch-success"],
    },
    {
      name: "Joining rides, food & scooters",
      why: "The super-app read is cross-vertical: attach service, city and partner attributes to every booking and the fan-out begins. Bolt screens check what survives — does a booking missing a service mapping still count in the rider census? — and the LEFT JOIN vs INNER JOIN decision is about who survives, never habit.",
      slugs: ["number-of-times-a-driver-was-a-passenger", "top-travellers", "sales-person"],
    },
    {
      name: "Month-close date filters",
      why: "Settlement and cost reporting live on the calendar: bookings in a period, the latest payout before a cutoff, month buckets on the '%Y-%m' spine. Bolt probes half-open intervals — BETWEEN on timestamps loses the last night of the month — and the SUBSTR shortcut that breaks the day the feed format drifts.",
      slugs: ["monthly-transactions-i", "convert-date-format", "friday-purchase-iii"],
    },
    {
      name: "Rolling activity windows",
      why: "7-day actives, week-over-week stickiness, rolling distinct riders — the growth team's daily bread and the screen's favorite escalation. The drill is frame discipline: ORDER BY day windows default to RANGE with peers, and on tie-heavy day folds the running count jumps by whole peer groups — the trend line lies unless you state the frame.",
      slugs: ["dau-wau-stickiness", "rolling-7d-actives", "active-users"],
    },
    {
      name: "Subquery shapes under budget",
      why: "Screens escalate into nested logic: listings below the platform average, partners above a listing bar, riders whose FIRST booking landed in the promo window. Scalar, IN, EXISTS and derived shapes each carry a cost profile and an edge case — and the follow-up is always what the query returns when the inner fold is empty.",
      slugs: ["second-highest-salary", "market-analysis-i", "game-play-analysis-iv"],
    },
    {
      name: "Cents-safe money folds",
      why: "Settlements, payouts and the cost ledger keep money in integer cents — every euro read is amount_cents / 100.0 and every ratio sits one misplaced integer from truncation. Running-balance folds and reconciliation reads (branches that must equal the TOTAL) are the closest thing this kit has to a finance round.",
      slugs: ["account-balance", "gl-reconciliation", "balance-rollforward"],
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
  ],
};
