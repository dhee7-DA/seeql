// HelloFresh — kit 11 of the Food & Quick-commerce domain (wave 6, Batch 92c).
// Meal kits at subscription scale: weekly box cadence, skip/pause patterns,
// churn windows, plan mix, and the renewal-billing back office (dunning queue,
// partial payments) that decides whether a subscriber's week 5 looks like
// week 1.
// Pool provenance: HelloFresh carries 0 tagged LC problems in
// company-pools.md — the pool is FULLY theme-curated from the SQL band
// (16 problems, 30 topic slugs), every one mirroring a workflow HelloFresh
// screens are known to probe (box-cadence frequency gates, skip/pause state
// folds, churn-window anti-joins, cohort ladders, renewal-billing cents
// discipline). 0 tagged LC — theme-curated, declared here per spec.
// Cases run on the storefront db (scripts/company-facts.md, probed
// 2026-10-12): orders = weekly boxes, shipped_at = box fulfillment
// completion, customers = subscribers, products = recipe/menu SKUs,
// suppliers = ingredient partners, region = market, invoices/payments =
// renewal statements and their settlements (INTEGER cents — divide by
// 100.0). Probed traps honored: every subscriber has ordered (never-ordered
// = 0 — the subscriber anti-join is empty; the honest anti-join lives in
// billing: 6 renewal statements with no settlement = 15,217.00, including
// the paid-with-no-payment anomaly #28 at 1,756.00). Fulfillment latency is
// stored in DAYS (avg 2.98, range 2..4).

import type { CompanyKit } from "../types";

export const hellofreshKit: CompanyKit = {
  id: "hellofresh",
  domainId: "food",
  name: "HelloFresh",
  tagline: "Meal kits: subscriptions, boxes and churn",
  accent: "text-indigo-300",

  brief: [
    "HelloFresh is the world's largest meal-kit company: subscribers pick a plan, boxes ship weekly, and the entire P&L lives or dies on the gap between *boxes sold* and *boxes kept*. The operating artifacts are cadence-shaped: weekly box counts per subscriber, skip and pause events between deliveries, churn windows after the first boxes, and the renewal-billing queue where a failed charge is a churn signal two weeks before the subscriber says so. Every analyst here learns the same first lesson: *a 'subscriber count' is a population at a point in time*, and every rate — skip rate, pause rate, churn rate — is only as honest as its denominator.",
    "The data org is lifecycle-first. Subscription analytics owns cadence and churn — week-over-week box ladders, pause durations, the week-3 drop-off everyone chases; supply analytics owns the ingredient chain — recipe SKU velocity, partner volumes, waste; billing ops owns renewals — statements, settlements, the dunning queue, where money is integer cents and a missing `/100.0` is a 100x incident. The culture is SQL-first: a lifecycle review opens with a query, a churn readout is a query with its window attached, and the box stream — `{emerald:delivered}, {sky:in-transit}, {amber:queued}, {rose:skipped}` — is the raw material every board folds.",
    "Interviews are hands-on SQL against a storefront-shaped schema, in a plain editor where your syntax errors are yours. Expect the box-ladder fold (subscribers at 5+ boxes — the tier this db defines), the skip census (14 queued, 7 skipped of **103** boxes), and the billing anti-join — 6 renewal statements with no settlement = **15,217.00**, one of them marked {emerald:paid} with zero payment rows (anomaly #28 at 1,756.00). Fulfillment latency reads `shipped_at - created_at` — 82 of 103 boxes carry a completion timestamp, averaging **2.98 days** on a 2..4 range, which is the training stand-in for the cold-chain's hour-grain SLAs.",
    "Prep like a subscription analyst, not a generic SQL student. Drill cadence ladders (`COUNT(*)` per subscriber, then HAVING gates), anti-joins through `LEFT JOIN … IS NULL` (the dunning queue IS an anti-join), derived-table staging for per-subscriber aggregates, and honest-denominator rates — *kept boxes over placed boxes*, never kept over delivered. Say your population out loud before you write the FROM clause: {emerald:placed}, {rose:skipped}, and {amber:queued} boxes are three different numerators, and the interviewer is grading the sentence you say before the query you type.",
  ],

  dayInLife: [
    "**08:00 —** open the lifecycle board before standup: last week's placed boxes, the {rose:skipped} share against the PLACED denominator, and the box ladder — how many subscribers crossed their next box tier. A cohort's ladder looks thin; before pinging anyone, you re-run the census yourself: `COUNT(*)` for boxes, `COUNT(DISTINCT customer_id)` for subscribers, side by side, because *a market can gain boxes while losing subscribers* and the gap between the two columns is the whole story.",
    "**10:45 —** deep work: the week-5 churn-window read. You stage a derived table of per-subscriber box counts and lifetime value, gate at 5+ boxes, and rank survivors by lifetime spend — Alice Chen's **24 boxes / 7,262.35** tops the board, Chloe Dubois is the newest member at exactly 5. Mid-build the lifecycle PM asks why the tier shrank week over week; the answer is a definition, not a bug — the gate is `COUNT(*) >= 5` at box grain, and *two paused boxes drop a subscriber out of a tier they'll re-enter in a fortnight* — so you version the definition in the dashboard footnote before the number ships.",
    "**14:00 —** billing-ops cycle: the dunning queue with the renewals team. The anti-join prints 6 renewal statements with no settlement — **15,217.00** — and one row is marked {emerald:paid} with zero payment rows, which is not a dunning case but a reconciliation finding. The partial-payment subscriber (4,000 of 6,148) goes on a different worklist than the no-touch ones; *the queue is only as good as its anti-join*, and the LEFT JOIN's NULL arm is where the money hides.",
    "**17:30 —** write the EOD note: one screen, three folds — the box ladder with its gate footnote, the churn-window cohort, the dunning queue split by reconciliation status — each with its population sentence attached. Tomorrow's supply review gets the recipe-velocity fold pre-staged; *the note is one page because the queries are the exhibit*, and every figure in it traces to a fold you can re-run in under a minute.",
  ],

  metrics: [
    {
      name: "Box ladder",
      what: "Boxes per subscriber, banded. On this db the ladder reads 2 one-boxers, 10 mid-band subscribers (2-5 boxes) and 4 power subscribers up to 24 boxes — the cadence engine is the growth story, so the bands are watched weekly, not the average.",
    },
    {
      name: "Skip & pause census",
      what: "{rose:skipped} boxes (7 of 103 placed = 6.8%) tracked beside {amber:queued} boxes (14 pending) — a skip is a decision, a queue is a delay, and boards that merge them misread churn as logistics.",
    },
    {
      name: "Fulfillment latency",
      what: "Completion minus order time over boxes that HAVE a completion timestamp: 82 of 103 here, avg 2.98 days on a 2..4 range. In production the identical julianday shape reads hours against the cold-chain SLA; the grain is a footnote you say out loud.",
    },
    {
      name: "Box value (AOV)",
      what: "Box value ÷ boxes: 34833.28 ÷ 103 = 338.19 network-wide, from 25.47 single-servings to 1,088.44 family plans. Markets above and below the 338.19 baseline are the scalar-subquery comparison every screen drills.",
    },
    {
      name: "Dunning exposure",
      what: "Renewal statements with no settlement: 6 statements, **15,217.00**, one marked {emerald:paid} with zero payment rows (anomaly #28) and one partial (4,000 of 6,148). The queue is an anti-join — LEFT JOIN … IS NULL — not a status filter.",
    },
    {
      name: "Renewal payment lag",
      what: "Days from statement issue to first settlement over settled renewals: avg **28.4**, fastest 13, slowest 84. Lag creep is the early churn signal — the subscriber who always pays at the boundary is the one who skips next month.",
    },
    {
      name: "Plan mix",
      what: "Subscribers and value per plan band, folded with CASE buckets. On this db the spend concentration is the plan story: **63.5%** of revenue comes from subscribers whose lifetime spend crosses 3,000 — the family-plan tier the pricing team defends.",
    },
    {
      name: "Market mix",
      what: "Boxes and value per market: EU 45 / 15,089.23 from 8 subscribers, APAC 37 / 11,605.45 from 5, US 19 / 7,286.16 from 2, LATAM 2 / 852.44 from 1. Two grains per row — boxes and subscribers — and mixing them is the classic census bug.",
    },
  ],

  topics: [
    {
      name: "Box cadence & frequency",
      why: "HelloFresh is a cadence business, and the first screen is always the box fold: boxes per subscriber, banded, gated with HAVING. The trap is grain — COUNT(*) counts boxes, COUNT(DISTINCT customer_id) folds repeat demand back to people, and the gap between them is boxes per subscriber per window.",
      slugs: ["customer-order-frequency", "repeat-purchase-rate", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Skip, pause & kept demand",
      why: "The lifecycle board's most-watched ratio is kept ÷ placed, and it is a conditional count before it is a percentage: SUM(CASE WHEN status = 'cancelled' …) over the same rows COUNT(*) divides. On this db that reads 7 of 103 = 6.8% — and the 14 pending boxes are a separate {amber:queued} population the board must never merge into churn.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "drop-type-1-orders-for-customers-with-type-0-orders"],
    },
    {
      name: "Subscriber census, two grains",
      why: "'Boxes AND subscribers per market' opens every lifecycle review: 45 boxes from 8 EU subscribers, 19 from 2 US subscribers. Two columns at two grains in one SELECT is the house census, and mixing the grains is the classic bug.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "unique-orders-and-customers-per-month"],
    },
    {
      name: "Churn windows & winback math",
      why: "Churn is a window, not an event: subscribers whose last box is N weeks old, winback offers for the ones inside the reachable gap. Screens drill date diffs, first/last-event subqueries and the golden-window cohort — the retention inputs computed, not asserted.",
      slugs: ["find-churn-risk-customers", "find-golden-hour-customers", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Dunning & settlement anti-joins",
      why: "Billing ops lives on anti-joins: renewal statements with no settlement, settlements with no statement. On this db every subscriber has ordered (never-ordered = 0 — the subscriber anti-join is empty), so the honest drill is billing: 6 statements, 15,217.00, anomaly #28 included — LEFT JOIN … IS NULL and NOT EXISTS until reflex.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Plan mix & CASE buckets",
      why: "Plans are bands, and the plan fold is a CASE histogram: family versus veg versus quick-lunch maps to CASE WHEN total bands, with the band edge as a definition nobody moves mid-quarter. Screens drill the fold until the ELSE arm's absence reads as a finding, not a bug.",
      slugs: ["the-category-of-each-member-in-the-store", "loan-types", "spend-histogram"],
    },
    {
      name: "Week buckets & cohort ladders",
      why: "Subscriptions are cohort math: box N retention per signup cohort, week-over-week ladders, stickiness ratios. Screens drill the cohort spine — buckets, gates, and the ladder that must reconcile to its own population before it ships.",
      slugs: ["user-activity-for-the-past-30-days-i", "cohort-retention-matrix", "dau-wau-stickiness"],
    },
    {
      name: "Ladders & the rank trio",
      why: "Top subscribers by lifetime value, worst markets by skip rate, next-box prediction lists — lifecycle reporting is leaderboard reporting, and ties are everywhere. ROW_NUMBER, RANK and DENSE_RANK differ exactly at ties, and LIMIT-boundary ties are the classic 'why does my top-5 return 6 rows' bug.",
      slugs: ["rank-scores", "top-earners", "customers-with-strictly-increasing-purchases"],
    },
    {
      name: "Box-value baselines & scalar subqueries",
      why: "'Markets above the network box value' is the favorite shape: the outer query folds 103 boxes into market averages (LATAM 426.22, US 383.48) while a scalar subquery folds the same table once, globally — 338.19. HAVING judges each market against that single number, and the denominator you choose is the definition.",
      slugs: ["market-analysis-i", "game-play-analysis-iv", "find-expensive-cities"],
    },
    {
      name: "One-pass status folds",
      why: "Lifecycle reviews are query-budgeted: the status census, the market census and the recipe census each get one pass, not four scans. FILTER (WHERE …) and AVG-over-flags build a whole demand picture in one scan, with branch totals that must reconcile to COUNT(*).",
      slugs: ["active-businesses", "ratings-histogram", "count-the-number-of-experiments"],
    },
  ],

  theory: [
    {
      id: "hf-t1",
      q: "The lifecycle board shows 'placed boxes' and 'kept-demand share' side by side. Where does each number's population live, and why does filtering status in the wrong clause ruin the share?",
      a: "Placed boxes is COUNT(*) over the whole orders table — all 103 rows regardless of state. Kept-demand share is a conditional count over that SAME population: SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) in the numerator, COUNT(*) in the denominator, so the 7 skipped boxes read as 6.8%. The bug happens when you write WHERE status != 'cancelled' first: the denominator silently loses the skipped rows, every market reads ~0% churn, and the board turns green overnight. The rule I follow: one population sentence per query — 'all placed boxes' — and the numerator is a flag inside it, never a WHERE outside it. *Denominators are definitions, not implementation details* — and in subscriptions, they're the difference between churn and logistics.",
      tag: "aggregation",
    },
    {
      id: "hf-t2",
      q: "Boxes join to subscribers for the cadence census. When do you COUNT(*) and when COUNT(DISTINCT customer_id), and what does the gap between them tell the business?",
      a: "COUNT(*) answers 'how many boxes' at box grain; COUNT(DISTINCT customer_id) answers 'how many subscribers' at person grain, folding repeat demand back to people. On this db the EU market reads 45 boxes from 8 subscribers, US 19 from 2 — the same query emits both columns, and the gap between them is boxes per subscriber. The trap is joining to order_items before the census: 103 boxes fan into 251 line rows and COUNT(*) becomes 251, a number nobody asked for. My discipline: fold at the grain the stakeholder speaks — *subscribers and boxes per market in one pass, line items only when the question is about the recipe basket*.",
      tag: "joins",
    },
    {
      id: "hf-t3",
      q: "The dunning queue is 'renewal statements with no settlement.' Why is that an anti-join, and when do LEFT JOIN … IS NULL and NOT EXISTS each win?",
      a: "Because the definition IS the absence: statements whose id never appears as a payments.invoice_id — on this db that's 6 statements, 15,217.00, including the one marked paid with zero payment rows (anomaly #28), which a status filter would have missed entirely. LEFT JOIN … IS NULL wins when you want the statement's own columns in the output (id, status, amount) — the NULL-extended row carries the left side through. NOT EXISTS wins when the probe is complex (settlements after a date, amounts above a threshold) or when the optimizer's semi-join plan matters on big tables. What I never ship is NOT IN: one NULL in the subquery's population and the entire queue silently empties. *The queue is only as good as its anti-join, and the anti-join is only as good as its join key.*",
      tag: "joins",
    },
    {
      id: "hf-t4",
      q: "shipped_at is NULL until a box fulfills. What do COUNT(*), COUNT(shipped_at) and AVG over the latency diff each return, and which one feeds the cold-chain board?",
      a: "COUNT(*) counts all 103 placed boxes; COUNT(shipped_at) counts only the 82 rows with a completion timestamp (52 delivered + 30 shipped); the AVG of julianday(shipped_at) - julianday(created_at) ignores NULLs automatically and reads 2.98 days over that same 82. The cold-chain board wants latency over fulfilled boxes only — including queued boxes as zero latency would flatter the slowest hubs and lie about the promise. What I refuse to do is COALESCE the NULL to zero 'to fill the gaps': a box in the queue has no latency yet, not zero latency. The honest query states its population — *82 fulfilled of 103 placed* — and lets the pending 14 wait outside.",
      tag: "nulls",
    },
    {
      id: "hf-t5",
      q: "Your alias works in ORDER BY but errors in WHERE. Explain with the evaluation pipeline, and where HAVING sits for the box-tier gate.",
      a: "SELECT's aliases are created at the select step, which runs after FROM/JOIN/WHERE/GROUP BY but before ORDER BY — so `ORDER BY lifetime_spend` resolves, while `WHERE lifetime_spend > 3000` references a column that doesn't exist yet. The tier gate lives in HAVING because it filters groups after the fold: HAVING COUNT(*) >= 5 keeps the subscribers with 5-plus boxes — 5 of them on this db (24, 17, 14, 13, 5) — which is exactly the cadence tier the lifecycle team defends. WHERE filters rows pre-fold (box-level facts like status); HAVING filters post-fold (subscriber-level facts like cadence). Saying the pipeline out loud — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT — is how I debug these *before* the editor does.",
      tag: "pipeline",
    },
    {
      id: "hf-t6",
      q: "The churn window reads 'subscribers whose last box is older than N days.' Why does that query want a derived table (or CTE), and what does the staging buy you?",
      a: "Because 'last box' is itself an aggregate — MAX(created_at) per subscriber — and you can't filter on a fold inside the same SELECT that computes it. The derived table stages the per-subscriber fold first (customer_id, last_box, boxes, lifetime spend), then the outer query joins back to subscribers and filters the staged values: WHERE last_box < date('now', '-N days'). Staging buys three things: the fold happens once, the population is explicit (every subscriber appears exactly once in the staged grain), and the outer query stays readable — the churn window, the reactivation filter and the lifetime-value rank are all one SELECT over a clean per-person grain. *Churn reads fail at the grain before they fail at the logic* — staging the grain is half the answer.",
      tag: "subqueries",
    },
    {
      id: "hf-t7",
      q: "Box events carry TEXT timestamps. How do you compute fulfillment latency and bucket demand by month without lying about either?",
      a: "Latency is julianday(shipped_at) - julianday(created_at), computed only where shipped_at IS NOT NULL — 82 of 103 rows here, avg 2.98, range 2..4. The training db stores whole days; production cold-chain streams the identical query in hours, and I say that out loud so the number is never misread. Month buckets are SUBSTR(created_at, 1, 7): the '%Y-%m' string slice sorts correctly, groups cleanly, and the seasonal curve — 2024-01's 3,731.97 peak against 2024-07's 1,193.86 trough — falls out without a calendar table. The lie to avoid is bucketing on shipped_at when the question is about demand — *demand is placed-time, service is fulfilled-time*, and conflating them shifts a June box into July's fulfillment story.",
      tag: "dates",
    },
    {
      id: "hf-t8",
      q: "Before the lifecycle dashboard ships you get ten minutes of query review. What are the two-grain, cents and NULL checks you always run?",
      a: "Three checks, in order of how often they've burned me. Grain: every folded number states its population — 103 placed, 82 fulfilled, 7 skipped, 14 queued — and any join to order_items must pre-aggregate or the 251-line fan-out inflates counts. Cents: renewal money is integer cents, so anything touching invoices or payments divides by 100.0 before it rounds — the dunning queue reads 15,217 dollars, not 1,521,700 cents, and a missing /100.0 is a 100x incident. NULLs: NOT IN against a nullable column returns an empty set silently, so anti-joins go through LEFT JOIN … IS NULL or NOT EXISTS — the dunning queue is literally this pattern. *Ten minutes of population sentences is cheaper than a quarter of dashboard therapy* — that's the sentence I end reviews with.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "hf-mcq-1",
      prompt: "On the training db, 82 of 103 boxes carry a fulfillment timestamp (shipped_at non-null). What does COUNT(shipped_at) return over all boxes?",
      choices: ["82", "103", "0", "NULL"],
      answer: 0,
      why: "COUNT(column) counts non-NULL values only — 82 here (52 delivered + 30 shipped). COUNT(*) would count all 103 rows including the 14 queued and 7 skipped that have no completion timestamp yet.",
      notes: [
        { choice: 1, why: "That's COUNT(*), a different function. COUNT(shipped_at) skips NULLs — the whole point of distinguishing them on a table where 21 rows are in-flight or skipped." },
        { choice: 3, why: "COUNT never returns NULL — with zero non-NULL rows it returns 0. The 82 fulfilled boxes guarantee a real count here." },
      ],
      difficulty: "easy",
    },
    {
      id: "hf-mcq-2",
      prompt: "The box ladder gates at COUNT(*) >= 5 boxes per subscriber. How many subscribers qualify on this db?",
      choices: ["5", "4", "9", "16"],
      answer: 0,
      why: "Exactly five subscribers cross 5 boxes: Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13 and Chloe Dubois at exactly 5. The gate is inclusive — >= — so Chloe's fifth box is the entry ticket.",
      notes: [
        { choice: 1, why: "That's the >= 13 tier. Four power subscribers clear 13, but the cadence tier starts at 5 — Chloe is the tier's newest member, not its exception." },
        { choice: 2, why: "9 is the >= 4 tier — Isabella, Keiko, Noah and Pedro ride in at 4 boxes. The gate number IS the definition; 5 excludes them by design." },
      ],
      difficulty: "easy",
    },
    {
      id: "hf-mcq-3",
      prompt: "A renewal statement shows 6148 amount_cents with a single 4000-cent settlement against it. What does ROUND(4000 / 100.0, 2) tell the billing team?",
      choices: [
        "4,000.00 — the subscriber paid 4,000 dollars of the 6,148-dollar renewal: a PARTIAL, not a dunning case",
        "40.00 — cents divide by 1000",
        "6,148.00 — the statement is fully settled",
        "NULL — the amounts don't match",
      ],
      answer: 0,
      why: "payments.amount_cents is integer cents: 400000 cents = $4,000.00 against the 61,480-cent (6,148.00) statement — the verified partial-payment case #25. Partials go on a different worklist than zero-payment statements, and both numbers only exist after the /100.0.",
      notes: [
        { choice: 2, why: "That's the 1000x trap (milli-units). Cents-to-dollars is /100; the /1000 reflex misprices every settlement by 10x." },
        { choice: 3, why: "A partial doesn't change the statement amount — it changes the COVERAGE classification, which is exactly why the queue folds coverage, not just status." },
      ],
      difficulty: "easy",
    },
    {
      id: "hf-mcq-4",
      prompt: "AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) reads 2.98 on the training db. In production the same query over cold-chain events reads 'hours to doorstep'. What changed?",
      choices: [
        "The unit — julianday diffs are days, so 2.98 days here corresponds to hour-grain timestamps in production",
        "The join — production must join a couriers table first",
        "Nothing — 2.98 means 2.98 hours in both systems",
        "The filter — production counts skipped boxes too",
      ],
      answer: 0,
      why: "JULIANDAY returns fractional days, so 2.98 is days on this training db (range 2..4). The query SHAPE is the skill; the production event stream stores the same diff at hour grain. Saying the grain out loud is part of the answer.",
      notes: [
        { choice: 2, why: "2.98 hours would beat every cold-chain SLA on earth — the training db deliberately stores DAYS so you must state the unit instead of pattern-matching the number." },
        { choice: 3, why: "Skipped boxes have no shipped_at and drop out of the AVG automatically — adding them would require inventing latency that doesn't exist." },
      ],
      difficulty: "medium",
    },
    {
      id: "hf-mcq-5",
      prompt: "Renewal statements LEFT JOIN to settlements, then the query adds WHERE p.method = 'card'. What happens to a statement whose only settlement was by wire?",
      choices: [
        "It drops out of the result entirely — the WHERE turns the LEFT JOIN into an INNER JOIN",
        "It appears with a 0 settlement",
        "It appears with NULL method",
        "The query errors",
      ],
      answer: 0,
      why: "The wire-settlement row fails the WHERE, its NULL-extended statement row fails too, and the statement vanishes — the dunning queue silently loses payers. Filters on the right table of a LEFT JOIN belong in the ON clause (or a post-join fold) if the statement must survive.",
      notes: [
        { choice: 2, why: "A 0-settlement row requires the statement to survive with a conditional SUM over the right table — the WHERE-in-the-wrong-place pattern deletes the row instead." },
        { choice: 3, why: "NULL method would appear only if the statement row survived the filter — it doesn't; the WHERE evaluates before the NULL-extension can save it." },
      ],
      difficulty: "medium",
    },
    {
      id: "hf-mcq-6",
      prompt: "Boxes fan into 251 order_items rows (103 boxes). A teammate computes network box value as SUM(o.total) / COUNT(*) after joining orders to order_items. What do they get?",
      choices: [
        "Roughly 2.4x too small — the denominator counts line rows, not boxes",
        "Exactly 338.19 — joins don't change aggregates",
        "Roughly 2.4x too big — the numerator duplicates",
        "Zero — SUM returns NULL after joins",
      ],
      answer: 0,
      why: "The join fans 103 boxes into 251 rows, so o.total repeats per line: the numerator inflates ~2.44x but COUNT(*) inflates with it — 34833.28 × 2.44 ÷ 251 ≈ 338.19 ÷ 2.44. The fix: SUM(o.total) / COUNT(DISTINCT o.id), or pre-aggregate order_items before joining.",
      notes: [
        { choice: 1, why: "Joins absolutely change aggregates when they fan out — this is the single most common box-value bug in subscription reporting." },
        { choice: 2, why: "Both sides scale, so the ratio shrinks rather than grows — the duplicated total divides by a duplicated count." },
      ],
      difficulty: "medium",
    },
    {
      id: "hf-mcq-7",
      prompt: "The dunning queue needs statements with NO settlement row. Which shape is silently WRONG on a nullable join key?",
      choices: [
        "WHERE i.id NOT IN (SELECT invoice_id FROM payments)",
        "LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL",
        "NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)",
        "All three are equivalent and safe",
      ],
      answer: 0,
      why: "NOT IN with one NULL invoice_id in the subquery makes every comparison UNKNOWN — the whole queue empties with no error. The LEFT JOIN … IS NULL and NOT EXISTS shapes are NULL-safe; the subquery variant needs an explicit IS NOT NULL guard at minimum.",
      notes: [
        { choice: 3, why: "They're only equivalent when the subquery's population is NULL-free — 'invoice_id is never NULL' is an assumption, and production billing data keeps proving assumptions wrong." },
        { choice: 2, why: "NOT EXISTS is NULL-safe (the correlation drives it), but it reads as a per-row probe — on huge ledgers the LEFT JOIN anti-join plan can be materially cheaper." },
      ],
      difficulty: "hard",
    },
    {
      id: "hf-mcq-8",
      prompt: "A churn-window read stages a derived table (last box per subscriber), then filters last_box < DATE('now', '-21 days'). Two subscribers' last boxes are the same day. What does the staged grain guarantee?",
      choices: [
        "One row per subscriber — MAX(created_at) folded to person grain, so the window filter never double-counts",
        "One row per box — the grain is preserved from the base table",
        "One row per market — GROUP BY region is implied",
        "Nothing — derived tables don't guarantee grains",
      ],
      answer: 0,
      why: "The derived table's GROUP BY customer_id collapses each subscriber's boxes to one row carrying MAX(created_at) — person grain. The churn window then filters people, not boxes, and a join back to subscribers adds names without fan-out (16 subscribers, 16 rows).",
      notes: [
        { choice: 1, why: "That's the unstaged shape — the window filter lands per-box and the 'subscriber count' counts boxes; the churn number inflates exactly as cadence grows." },
        { choice: 3, why: "A derived table's grain is whatever its GROUP BY says — which is precisely why stating the staged grain out loud is part of shipping the query." },
      ],
      difficulty: "hard",
    },
    {
      id: "hf-mcq-9",
      prompt: "The winback list ranks churned subscribers by lifetime spend with ORDER BY spend DESC LIMIT 5, but keeps returning 6 rows after a teammate switches to RANK() with a rank filter. What class of bug is this?",
      choices: [
        "Tie handling at the LIMIT boundary — RANK gives tied subscribers the same rank, so a tie at rank 5 adds a row",
        "Integer division in the spend expression",
        "A NULL spend row leaking through",
        "A missing GROUP BY",
      ],
      answer: 0,
      why: "RANK is not a filter — with a tie at the boundary, two subscribers share rank 5 and the WHERE rank <= 5 set still has six rows. The fix is a tie policy: DENSE_RANK, a deterministic tiebreaker, or ROW_NUMBER if the business accepts an arbitrary cut.",
      notes: [
        { choice: 1, why: "Division bugs distort values, not row counts — the symptom here is row-count inflation from ties, not wrong numbers." },
        { choice: 2, why: "A NULL spend row would sort last under DESC, never break into the top set — and it wouldn't explain a consistent 6-row result." },
      ],
      difficulty: "hard",
    },
    {
      id: "hf-mcq-10",
      prompt: "Six renewal statements have no settlement row; their amount_cents sum to 1521700. What does ROUND(SUM(i.amount_cents) / 100.0, 2) return, and what else is true of those six?",
      choices: [
        "15217.00 — and one of them is marked {emerald:paid} with zero payment rows (anomaly #28)",
        "15217.00 — and all six are marked open",
        "1521700.00 — the /100.0 is optional",
        "0.00 — SUM skips unsettled statements",
      ],
      answer: 0,
      why: "1521700 cents ÷ 100.0 = 15,217.00 across the 6 unsettled statements — five open, plus the verified paid-with-no-payment anomaly #28 at 1,756.00. The status column is exactly why the dunning queue needs a row-level anti-join, not just a status filter.",
      notes: [
        { choice: 1, why: "Five are open; #28 is the trap — a statement can be marked paid while its settlement never landed, which is a reconciliation finding, not a filter predicate." },
        { choice: 2, why: "Skipping the /100.0 ships a 100x number — the single most expensive character omission in renewal billing." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-hf-1",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The dunning queue",
      brief: "HelloFresh-flavored brief on the storefront db: billing ops closes the month tomorrow and the dunning queue must be exact — every renewal statement with NO settlement row, largest exposure first, because the worklist routes money. The definition is fixed: anti-join on `payments.invoice_id = i.id`, the NULL arm of a LEFT JOIN — *not* a status filter, because the probed anomaly matters: statement #28 is marked {emerald:paid} with zero payment rows (1,756.00), and five open statements ride beside it. Probed facts: the queue holds **6 statements totaling 15,217.00** — 4,937.00, 3,562.00, 2,794.00, 1,756.00, 1,295.00, 873.00 — and the amount column is INTEGER cents, so the dollars only exist after `/100.0`.",
      ask: "Return the dunning queue: statement_id, status, renewal_dollars (2 decimals) — biggest exposure first.",
      template: "SELECT i.id AS statement_id,\n       i.status,\n       ROUND({1}, 2) AS renewal_dollars\nFROM invoices i\n{2} payments p ON p.invoice_id = {3}\nWHERE p.id IS NULL\nORDER BY renewal_dollars {4}",
      slots: [
        {
          answer: "i.amount_cents / 100.0",
          kind: "keyword",
          label: "the dollars expression",
          why: "Renewal money is integer cents — 493,700 cents prints as 4,937.00 only after /100.0. Skipping the division ships a queue whose top line reads 493,700 dollars: a 100x incident that survives every eyeball test because the rows all look plausible.",
        },
        {
          answer: "LEFT JOIN",
          kind: "keyword",
          label: "the anti-join shape",
          why: "The queue IS the NULL arm: LEFT JOIN keeps every statement and the WHERE p.id IS NULL keeps only the unsettled six. INNER JOIN deletes them — the dunning queue reads zero rows and the month closes with 15,217.00 of exposure invisible.",
        },
        {
          answer: "i.id",
          kind: "keyword",
          label: "the statement join key",
          why: "Settlements reference statements by invoice_id, so the probe is p.invoice_id = i.id. Join on p.id (settlement's own id) and the match is nearly arbitrary — the queue fills with settled statements' neighbors; join on i.customer_id and you've correlated subscribers to statements by accident.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure direction",
          why: "The worklist routes money, so it reads top-down: 4,937.00, then 3,562.00, down to 873.00. ASC sends collections after the smallest balance first — a correct query that burns the team's day backwards.",
        },
      ],
      distractors: ["i.amount_cents", "INNER JOIN", "p.id", "ASC", "p.invoice_id"],
      walkthrough: "A dunning queue is an anti-join with a money column. The LEFT JOIN keeps all 28 statements; the WHERE p.id IS NULL keeps the six whose ids never appear in payments — 24, 26, 27, 28, 21, 18 — and the status column tells the story the status filter would have hidden: five open statements plus #28, marked paid but with zero settlement rows, which is a reconciliation finding riding in a collections queue. ROUND(i.amount_cents / 100.0, 2) converts integer cents to dollars — 4,937.00 down to 873.00, 15,217.00 total — and ORDER BY renewal_dollars DESC routes the worklist. Switch to INNER JOIN and the queue empties (all six are defined by the join's failure); join on p.id and the NULL arm catches a near-random 56 rows; drop the /100.0 and every figure inflates 100x. *The queue is the anti-join: a population defined by absence, which is why the WHERE arm and the join key get read twice before the export ships.*",
    },
    {
      id: "cs-hf-2",
      tier: "hard",
      topic: "q5",
      universe: "growth",
      title: "The cadence ladder",
      brief: "HelloFresh-flavored brief on the storefront db: the lifecycle review needs the cadence ladder — subscribers who reached their 5th box, the tier the retention budget defends, with lifetime spend ranked — and the PM wants the fold staged cleanly so the tier's definition survives audit. The definition is fixed: boxes = COUNT(*) of PLACED boxes per subscriber (a {rose:skipped} box was still demand generated — it counts toward the tier), the ladder gates at COUNT(*) >= 5 from a derived per-subscriber fold, no status filter. Probed facts: the tier holds **5 subscribers** — Alice Chen **24 boxes / 7,262.35**, Emma Wilson **17 / 6,640.56**, Grace Kim **14 / 4,574.23**, Maya Patel 13 / 3,644.56, Chloe Dubois the newest at exactly 5 / 2,667.93.",
      ask: "Return the cadence tier: subscriber, boxes, lifetime_spend (2 decimals) — biggest spenders first.",
      template: "SELECT c.name AS subscriber,\n       b.boxes,\n       b.lifetime_spend\nFROM (\n  SELECT o.customer_id,\n         COUNT(*) AS boxes,\n         ROUND(SUM({1}), 2) AS lifetime_spend\n  FROM orders o\n  GROUP BY {2}\n) b\nJOIN customers c ON c.id = b.customer_id\nWHERE b.boxes >= {3}\nORDER BY lifetime_spend {4}",
      slots: [
        {
          answer: "o.total",
          kind: "keyword",
          label: "the spend column",
          why: "Lifetime spend sums the box-total column at box grain — 7,262.35 for Alice's 24 boxes. Summing customer_id adds her id 24 times, and SUM(status) folds text to 0: numbers that look plausible in a screenshot and are garbage in a review.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the fold grain",
          why: "The derived table must stage ONE row per subscriber — GROUP BY o.customer_id collapses 103 boxes to 16 cadence rows. GROUP BY o.id keeps every box separate (all ladders read 1) and the gate returns nobody; GROUP BY o.status invents four mega-subscribers.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the cadence gate",
          why: "The tier is COUNT(*) >= 5 — it keeps Alice (24), Emma (17), Grace (14), Maya (13) and Chloe (exactly 5). Lower the gate to 4 and four more subscribers (Isabella, Keiko, Noah, Pedro at 4 boxes) walk into a tier the retention budget never priced.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-spenders direction",
          why: "The review reads top-down: 7,262.35, then 6,640.56, down to 2,667.93. ASC opens the tier review on the smallest account in the tier — a correct query that wastes the room's ten minutes backwards.",
        },
      ],
      distractors: ["unit_price", "o.id", "o.status", "created_at", "4", "ASC"],
      walkthrough: "A cadence ladder is a staged fold, a gate, and an ordering. Stage one folds orders per subscriber in a derived table — GROUP BY o.customer_id turns 103 placed boxes into 16 cadence rows carrying COUNT(*) and ROUND(SUM(o.total), 2). Stage two joins back to subscribers for names and gates: WHERE b.boxes >= 5 keeps the five — Alice 24 / 7,262.35, Emma 17 / 6,640.56, Grace 14 / 4,574.23, Maya 13 / 3,644.56, Chloe 5 / 2,667.93 — and ORDER BY lifetime_spend DESC hands the retention team the budget queue. Fold at o.id grain and every ladder reads 1 (the gate returns nobody); fold at o.status grain and four status-mega-subscribers appear; drop the gate to 4 and the tier gains four 4-box subscribers the budget never priced. The status filter deliberately stays out: *the tier counts demand generated, not demand kept* — a skipped box was still a week the subscriber belonged to the plan, and that sentence is the definition the reviewer is grading.",
    },
  ],

  problems: [
    { slug: "customer-order-frequency", why: "Subscribers who order at least N times in a window — literally the 5+ box tier gate (COUNT(*) >= 5 lives here), drilled until the HAVING-vs-WHERE boundary is reflex." },
    { slug: "repeat-purchase-rate", why: "The repeat-box share — placed subscribers vs returning subscribers over the same placed denominator, the retention headline the lifecycle board publishes weekly." },
    { slug: "immediate-food-delivery-ii", why: "First-box demand with a conditional percentage — the week-1 conversion read, where the denominator is the subscriber population that actually placed a first box." },
    { slug: "drop-type-1-orders-for-customers-with-type-0-orders", why: "The skip/pause pattern's practice shape: keep subscribers who paused but never those with a clean run — exclusion logic on box states, the churn-prevention worklist's SQL heart." },
    { slug: "find-churn-risk-customers", why: "Churn-risk selection by activity windows — the winback cohort computed from date math rather than asserted by the lifecycle deck." },
    { slug: "customers-who-never-order", why: "The anti-join reflex drill — on this db it returns 0 (every subscriber has ordered), which is itself the lesson: the real anti-join lives in billing, where 6 renewal statements have no settlement." },
    { slug: "cohort-retention-matrix", why: "Cohort retention by signup month — box N surviving per cohort, the matrix the week-3 drop-off conversation is built on." },
    { slug: "week-over-week-churn", why: "LAG transitions week over week — the churn waterfall's practice shape: this week's losses beside last week's, populations folded at the same grain." },
    { slug: "the-latest-login-in-2020", why: "Last-event-per-subscriber with a year filter — the 'last box date' query that feeds every churn window, drilled with its date-boundary edge." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Cadence windows — subscribers whose next box landed within N days: the delivery-consistency read that predicts pause before the pause happens." },
    { slug: "the-category-of-each-member-in-the-store", why: "Plan-tier classification via CASE over spend — family versus core versus light plans, banded with edges that are definitions, not vibes." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share math with 100.0 before the division — participation rates for the subscriber cohort, rounded once at the end like every HelloFresh rate." },
    { slug: "customers-with-strictly-increasing-purchases", why: "Subscribers whose box value climbs every delivery — plan-upgrade signals computed as a sequence property, the expansion team's favorite screen." },
    { slug: "game-play-analysis-iv", why: "The day-after retention fraction — new subscribers back for a second interaction, the earliest cadence signal the lifecycle team tracks." },
    { slug: "keep-latest-dedupe", why: "Keep-latest dedupe per subscriber — address and plan changes arriving as multiple rows, collapsed to the current one with ROW_NUMBER: the SCD hygiene every subscription db needs." },
    { slug: "market-analysis-i", why: "Markets above the network baseline via scalar subquery — the 338.19 box-value comparison, where the denominator you choose is the definition being graded." },
  ],
};
