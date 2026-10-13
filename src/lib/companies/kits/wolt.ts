// Wolt — kit 12 of the Food & Quick-commerce domain (Batch L, wave 7).
// DoorDash-owned EU/Asia delivery: courier shifts, Wolt Market grocery
// aisles, and city-cluster SLAs — the marketplace where a "basket" spans
// restaurant orders and dark-store grocery runs, and every city cluster
// carries its own service promise.
// Pool provenance: Wolt carries 0 tagged LC problems in company-pools.md —
// the pool is FULLY theme-curated from the SQL band (16 problems, 30 topic
// slugs), every one mirroring a workflow Wolt screens are known to probe
// (city-cluster censuses at two grains, basket-value baselines, courier
// aging windows, refund-queue anti-joins, one-pass FILTER censuses).
// 0 tagged LC — theme-curated, declared here per spec.
// Cases run on the storefront db (scripts/company-facts.md, probed
// 2026-10-12): orders = delivery baskets, order_items = basket lines,
// customers = households, products = market/menu SKUs, suppliers = vendor
// partners, regions = city clusters, shipped_at = delivery-completion
// timestamp, invoices/payments = settlement statements (INTEGER cents —
// divide by 100.0). Probed traps honored: the completion-aging column is
// stored in DAYS (avg 2.98, range 2..4) — the training stand-in for the
// courier minute-grain SLA, never read as minutes; every household has
// ordered (never-ordered = 0), so the honest anti-join lives in billing
// (6 statements with no settlement = 15,217.00, incl. paid-with-no-payment
// #28 at 1,756.00 and the 4,000-of-6,148 partial).

import type { CompanyKit } from "../types";

export const woltKit: CompanyKit = {
  id: "wolt",
  domainId: "food",
  name: "Wolt",
  tagline: "DoorDash-owned EU delivery: couriers, markets, SKUs",
  accent: "text-sky-300",

  brief: [
    "Wolt is the DoorDash-owned delivery platform born in Helsinki: restaurant orders, Wolt Market grocery aisles and courier shifts folded into one marketplace across Europe and Asia. The operating unit is the city cluster, and the artifacts are basket-shaped: **103 delivery baskets** carrying **251 line items**, status streaming as {emerald:delivered} 52, {sky:shipped} 30, {amber:pending} 14 and {rose:cancelled} 7. Every analyst here learns the first Wolt lesson fast: *a city is not a number, it's a denominator* — basket counts, household counts and aging windows all live at different grains, and the gap between 45 EU baskets and 8 EU households is the whole density story.",
    "The data org splits by surface. City ops owns the service board — basket census, completion aging, cancel share; courier analytics owns shift windows and routing; Wolt Market owns assortment — SKU velocity, thin shelves, vendor concentration (Nordic Gadgets AB alone carries **32%** of market revenue); settlement ops owns the billing spine, where money is integer cents and a skipped `/100.0` is a 100x incident. The culture is SQL-first: a city review opens with a query, and the query states its population — *103 placed baskets, 82 completed* — before a single KPI is read off the board.",
    "Interviews are hands-on SQL against a storefront-shaped schema, in a plain editor where your syntax errors are yours. Expect the two-grain city census (45 baskets from 8 EU households, 19 from 2 US ones), the status funnel with its denominators, and the billing anti-join — 6 settlement statements with no payment = **15,217.00**, including statement #28 marked {emerald:paid} with zero payment rows. Completion aging reads `JULIANDAY(shipped_at) - JULIANDAY(created_at)`: **2.98 days** average on a 2..4 range over the 82 completed baskets — the training stand-in for the courier minute-grain SLA, and the interviewers listen for whether you say the unit out loud.",
    "Prep like a city-ops analyst, not a generic SQL student. Drill two-grain censuses (`COUNT(*)` beside `COUNT(DISTINCT customer_id)`), baseline comparisons through scalar subqueries (the **338.19** network basket value), HAVING gates at cluster scale, and anti-joins through `LEFT JOIN … IS NULL` until they're reflex. Say the population sentence before you write the FROM clause: {emerald:delivered}, {sky:shipped} and {rose:cancelled} baskets are three different numerators over the same 103 rows, *and the interviewer grades the sentence, not the semicolon*.",
  ],

  dayInLife: [
    "**08:10 —** the city board before standup: last night's basket census at both grains — `COUNT(*)` for baskets, `COUNT(DISTINCT customer_id)` for households — and the status funnel split {emerald:delivered} 52, {sky:shipped} 30, {amber:pending} 14, {rose:cancelled} 7. A cluster's cancel share looks fat; before flagging it you re-run the denominator yourself: US is 1 of **19** (5.3%), APAC 3 of 37 (8.1%) — *the board ranks clusters by share, and the share is only as honest as its placed-basket denominator*.",
    "**11:30 —** deep work: the aging file. The completed-basket fold reads `JULIANDAY(shipped_at) - JULIANDAY(created_at)` — **2.98 days** network-wide, buckets of 27 baskets at 2 days, 30 at 3, 25 at 4 — while the {amber:pending} 14 and {rose:cancelled} 7 wait outside with `shipped_at IS NULL`. The day's real question: which clusters age past the window — US reads **3.07**, EU 2.94, APAC 2.93 — and the Wolt Market aisle file rides along: three SKUs under 20 units remaining (14, 15, 17), the thin-shelf alert the market team wants before the weekend surge.",
    "**16:45 —** city GM review: one screen, three folds — the two-grain census with its density column, the aging board with its 2..4-day window footnote, and the settlement queue (6 statements, **15,217.00**, the paid-with-no-payment anomaly called out separately). The GM asks why LATAM shows the most expensive average basket (**426.22**) on the tiniest population — the answer is a sentence about denominators, and the EOD note ships with *the population sentence printed above every fold*.",
  ],

  metrics: [
    {
      name: "City-cluster census",
      what: "Baskets and households per cluster at two grains: EU 45 baskets from 8 households, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. The two columns in one row are the density read — mixing the grains is the classic census bug.",
    },
    {
      name: "Status funnel",
      what: "{emerald:delivered} 52, {sky:shipped} 30, {amber:pending} 14, {rose:cancelled} 7 over 103 placed baskets. Each state is a different numerator; boards that merge pending into cancelled misread a restock delay as a lost basket.",
    },
    {
      name: "Completion aging",
      what: "`JULIANDAY(shipped_at) - JULIANDAY(created_at)` over the 82 completed baskets: avg **2.98 days**, range 2..4. Stored in DAYS on the training db; the production courier stream reads the identical shape in minutes — state the unit or misread the SLA.",
    },
    {
      name: "Cluster aging spread",
      what: "US 3.07 / EU 2.94 / APAC 2.93 days over completed baskets (LATAM 3.5 on just 2). The spread is small; the skill is reading it at the right grain — completed baskets only, never the 21 open ones.",
    },
    {
      name: "Open-basket exposure",
      what: "21 baskets carry no completion timestamp — 14 {amber:pending} + 7 {rose:cancelled}. In the service review these are the refund-window candidates; `COUNT(*) WHERE shipped_at IS NULL` is the whole query, and it gets read twice.",
    },
    {
      name: "Basket value",
      what: "34,833.28 across 103 baskets = **338.19** average, from 25.47 single-item runs to 1,088.44 full-market hauls. The scalar-subquery baseline every cluster read is judged against.",
    },
    {
      name: "Cancel share by cluster",
      what: "APAC 8.1% (3 of 37), EU 6.7% (3 of 45), US 5.3% (1 of 19), LATAM 0 on 2. Small clusters flatter themselves — the honest board prints the placed-basket denominator beside every share.",
    },
    {
      name: "Settlement exposure",
      what: "6 statements with no payment = **15,217.00**, including #28 marked {emerald:paid} with zero payment rows and one partial (4,000 of 6,148). The queue is an anti-join — `LEFT JOIN … IS NULL` — not a status filter.",
    },
  ],

  topics: [
    {
      name: "City clusters at two grains",
      why: "The first Wolt screen is the two-grain census: baskets AND households per cluster in one row — 45 baskets from 8 EU households, 19 from 2 US ones. The trap is grain: COUNT(*) counts baskets, COUNT(DISTINCT customer_id) folds repeat demand back to people, and the interviewer is grading whether you know which column is which.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "find-followers-count"],
    },
    {
      name: "Basket-value baselines",
      why: "Every cluster read is judged against the network baseline: 34,833.28 over 103 baskets = 338.19. Screens drill the scalar-subquery shape — fold the whole book once, then judge each cluster's average against it — because the denominator you fold IS the definition being graded.",
      slugs: ["market-analysis-i", "find-expensive-cities", "basket-depth-aov"],
    },
    {
      name: "Status funnel & kept demand",
      why: "The funnel is four numerators over one population: 52 delivered, 30 shipped, 14 pending, 7 cancelled. The cancel-share read (8.1% APAC, 5.3% US) is a conditional count — SUM(CASE WHEN status = 'cancelled' …) over COUNT(*) — and filtering status in WHERE first silently zeroes every cluster's denominator.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Courier aging & date math",
      why: "Completion aging is julianday arithmetic over the 82 baskets that carry shipped_at — avg 2.98 days on a 2..4 range, bucketed 27/30/25. Screens drill the window filter, the unit statement (DAYS here, minutes in production), and the bucket spine that must never bucket fulfillment when the question is demand.",
      slugs: ["users-with-two-purchases-within-seven-days", "find-golden-hour-customers", "the-latest-login-in-2020"],
    },
    {
      name: "Refund & settlement anti-joins",
      why: "Settlement ops lives on absence: 6 statements with no payment row = 15,217.00, and one of them (#28) is marked paid — a status filter misses it, an anti-join doesn't. LEFT JOIN … IS NULL and NOT EXISTS until reflex, and never NOT IN against a nullable key.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Market-basket breadth",
      why: "Wolt Market is an assortment business: which SKUs a basket touches, which households pair categories, which vendor carries the spend (Nordic Gadgets AB 32%, Midwest Hardware Co 26.7%). Screens drill per-household argmax and combo logic — breadth computed at basket grain, not asserted at deck grain.",
      slugs: ["most-frequently-ordered-product-per-customer", "customers-who-bought-a-and-b-not-c", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "Shift windows & streaks",
      why: "Courier shifts are interval data: gaps between baskets, consecutive active stretches, windows that must not overlap. Screens drill gaps-and-islands shapes and window-between-events reads — the routing-health questions Wolt asks about its fleet every week.",
      slugs: ["find-loyal-customers", "biggest-window-between-events", "sessionize-events"],
    },
    {
      name: "Cluster leaderboards & the rank trio",
      why: "City reviews are leaderboard reporting: clusters ranked by basket value (15,089.23 / 11,605.45 / 7,286.16), SKUs ranked by velocity. ROW_NUMBER, RANK and DENSE_RANK differ exactly at ties, and LIMIT-boundary ties are the classic 'why does my top-3 return 4 rows' bug.",
      slugs: ["rank-scores", "top-earners", "the-most-recent-three-orders"],
    },
    {
      name: "Demand calendars & month buckets",
      why: "Demand is placed-time: SUBSTR(created_at, 1, 7) builds the month spine (2024-01's 3,731.97 peak down to 2024-07's 1,193.86 trough) without a calendar table. Screens drill the bucket key and the honesty rule — bucket on created_at for demand, shipped_at for service, and never confuse the two.",
      slugs: ["monthly-transactions-i", "restaurant-growth", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "One-pass censuses",
      why: "City reviews are query-budgeted: the status census, the cluster census and the SKU census each get one pass, not four scans. FILTER (WHERE …) and conditional SUM build the whole funnel in one scan, with branch totals that must reconcile to COUNT(*) before the board ships.",
      slugs: ["active-businesses", "ratings-histogram", "count-the-number-of-experiments"],
    },
  ],

  theory: [
    {
      id: "wolt-t1",
      q: "The city board shows 'baskets' and 'households' side by side per cluster. Where does each number live, and what does joining order_items do to both?",
      a: "Baskets is COUNT(*) over orders — 103 rows at basket grain. Households is COUNT(DISTINCT o.customer_id) over the same rows after joining customers — 8 in the EU cluster against 45 baskets, which is the density read. The join to order_items is the trap: 103 baskets fan into 251 line rows, so both counts inflate unless you fold lines away first or count DISTINCT on the right key. My rule: fold at the grain the stakeholder speaks — clusters, baskets, households — and only touch order_items when the question is about the aisle, never the census. The two-column row is the whole point: *45 baskets from 8 households and 19 from 2 are different cities, and only the pair of columns says so*.",
      tag: "joins",
    },
    {
      id: "wolt-t2",
      q: "Cancel share by cluster reads 8.1% in APAC and 5.3% in the US. Write the ratio, and explain why filtering status in WHERE would wreck it.",
      a: "The share is SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) over COUNT(*) — 3 of APAC's 37 placed baskets, 1 of the US's 19 — computed over the full placed population, 103 rows. If you write WHERE status != 'cancelled' first, the denominator loses exactly the rows the numerator counts: every cluster reads ~0%, the board turns green, and the service review cancels itself. The discipline is one population sentence per query — 'all placed baskets' — with the numerator as a flag inside it. *Denominators are definitions at Wolt: 37 placed, 3 cancelled, 8.1% — say all three numbers or you've said none.*",
      tag: "aggregation",
    },
    {
      id: "wolt-t3",
      q: "shipped_at is NULL until a basket completes. What do COUNT(*), COUNT(shipped_at) and AVG over the julianday diff each return, and which feeds the service board?",
      a: "COUNT(*) counts all 103 placed baskets; COUNT(shipped_at) counts the 82 with a completion timestamp (52 delivered + 30 shipped); AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) automatically skips NULLs and reads 2.98 days over that same 82. The service board wants aging over completed baskets only — counting pending baskets as zero latency would flatter the slowest cluster and lie about the promise. What I refuse is COALESCE-ing the NULL to zero 'to fill gaps': a basket in the queue has no age yet, not zero age. The honest query states its population — *82 completed of 103 placed* — and lets the 14 pending and 7 cancelled wait outside the fold.",
      tag: "nulls",
    },
    {
      id: "wolt-t4",
      q: "You're asked for delivery latency by city cluster. The db stores timestamps as TEXT. How do you compute and bucket aging without lying about either?",
      a: "Latency is JULIANDAY(shipped_at) - JULIANDAY(created_at) — julianday returns fractional days, so on this db the answer is DAYS: 2.98 average, 2..4 range, and I say that out loud because production courier streams run the same expression at minute grain. Month or day buckets come from SUBSTR(created_at, 1, 7): the '%Y-%m' slice sorts correctly and groups cleanly. The lie to avoid is bucketing on shipped_at when the question is demand — demand is placed-time, service is completed-time, and conflating them moves a June basket into July's fulfillment story and drops the 21 never-completed baskets entirely. *The timestamp you bucket on is a definition; the unit you report is a promise.*",
      tag: "dates",
    },
    {
      id: "wolt-t5",
      q: "Your alias works in ORDER BY but errors in WHERE. Walk the evaluation pipeline, and say where the cluster-scale gate belongs.",
      a: "SELECT's aliases are created at the select step, which runs after FROM/JOIN/WHERE/GROUP BY but before ORDER BY — so ORDER BY basket_value resolves while WHERE basket_value > 0 references a column that doesn't exist yet. The cluster-scale gate lives in HAVING, because it filters groups after the fold: HAVING COUNT(*) >= 19 keeps EU (45), APAC (37) and the US at exactly 19 — the boundary case that makes the gate number a definition. WHERE filters rows pre-fold (basket-level facts like status); HAVING filters post-fold (cluster-level facts like scale). Saying the pipeline aloud — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT — is how I debug these *before* the editor does.",
      tag: "pipeline",
    },
    {
      id: "wolt-t6",
      q: "The cluster board needs each cluster's average basket judged against the network average. Why a scalar subquery, and what does it buy over hardcoding 338.19?",
      a: "Because the baseline must be computed, not pinned: (SELECT AVG(total) FROM orders) folds the whole book once — 34,833.28 over 103 = 338.19 — and the outer query judges each cluster against that single number. Hardcoding works today and breaks the moment a basket lands; the scalar subquery is self-maintaining and, more importantly, it's honest about being a definition. The same staging logic scales up: a derived table folds per-cluster stats first, then the outer query joins and filters the staged values. What I check before shipping: the subquery returns exactly one row and one column, and its population matches the outer query's — *a baseline computed over a filtered table is a different definition, and the board's verdict changes with it.*",
      tag: "subqueries",
    },
    {
      id: "wolt-t7",
      q: "Cluster leaderboards rank by basket value. When do ROW_NUMBER, RANK and DENSE_RANK diverge, and which one does the city review want?",
      a: "They diverge only at ties, and ties are everywhere at cluster grain: two clusters with equal value share a rank under RANK (skipping the next), sit adjacent under DENSE_RANK, and get an arbitrary order under ROW_NUMBER. The city review reads 'who's biggest' — RANK, because two tied clusters sharing a podium step is the truth, and the skipped step is the honest cost. For pick lists where someone must be first (a courier assignment, a LIMIT-boundary cut), ROW_NUMBER with a deterministic tiebreaker is the tool. What I never ship is a bare ORDER BY … LIMIT as a leaderboard: it breaks at the boundary tie and returns an arbitrary member of the tie. *Rank functions are tie policies — pick the policy, then the function writes itself.*",
      tag: "windows",
    },
    {
      id: "wolt-t8",
      q: "You get ten minutes of query review before the city board ships. What are the grain, cents and NULL checks you always run?",
      a: "Three checks, in order of how often they've burned me. Grain: every folded number states its population — 103 placed, 82 completed, 21 open — and any join to order_items must pre-aggregate or the 251-line fan-out inflates the census. Cents: settlement money is integer cents, so anything touching invoices or payments divides by 100.0 before it rounds — the settlement queue reads 15,217 dollars, not 1,521,700 cents, and the missing /100.0 is a 100x incident that survives every eyeball test. NULLs: NOT IN against a nullable key silently empties the result, so anti-joins go through LEFT JOIN … IS NULL or NOT EXISTS — the settlement queue is literally this pattern. *Ten minutes of population sentences is cheaper than a quarter of dashboard therapy* — that's how I end every review.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "wolt-mcq-1",
      prompt: "On the training db, 82 of 103 baskets carry a completion timestamp (shipped_at non-null). What does COUNT(shipped_at) return over all baskets?",
      choices: ["82", "103", "0", "NULL"],
      answer: 0,
      why: "COUNT(column) counts non-NULL values only — 82 here (52 delivered + 30 shipped). COUNT(*) would count all 103 rows including the 14 pending and 7 cancelled that have no completion timestamp yet.",
      notes: [
        { choice: 1, why: "That's COUNT(*), a different function. COUNT(shipped_at) skips NULLs — the whole point of distinguishing them on a table where 21 baskets are still open." },
        { choice: 3, why: "COUNT never returns NULL — with zero non-NULL rows it returns 0. The 82 completed baskets guarantee a real count here." },
      ],
      difficulty: "easy",
    },
    {
      id: "wolt-mcq-2",
      prompt: "The EU cluster census reads 45 baskets. What does COUNT(DISTINCT o.customer_id) return for the same cluster, and what does the gap mean?",
      choices: [
        "8 — eight households generated the 45 baskets; the gap is baskets per household",
        "45 — DISTINCT never changes a count after a join",
        "2 — the US cluster's household count leaked in",
        "103 — the network basket total",
      ],
      answer: 0,
      why: "COUNT(DISTINCT customer_id) folds repeat demand back to people: 8 EU households placed 45 baskets, 2 US households placed 19. The gap between the columns is baskets per household — the density read every city review opens with.",
      notes: [
        { choice: 1, why: "DISTINCT matters exactly when one key repeats — and at Wolt it always repeats: 45 baskets cannot come from 45 unique households in an 8-household cluster." },
        { choice: 2, why: "That's the cross-cluster leak fantasy — the count is scoped to rows that survive the join, and the join is per-cluster." },
      ],
      difficulty: "easy",
    },
    {
      id: "wolt-mcq-3",
      prompt: "AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) reads 2.98 on the training db. In production the courier stream stores the same diff at minute grain. What changed?",
      choices: [
        "The unit — julianday diffs are days, so 2.98 days here corresponds to minute-grain timestamps in production",
        "The join — production must join a couriers table first",
        "Nothing — 2.98 means 2.98 minutes in both systems",
        "The filter — production counts pending baskets too",
      ],
      answer: 0,
      why: "JULIANDAY returns fractional days, so 2.98 is days on this training db (range 2..4). The query SHAPE is the skill; the production event stream stores the same diff in minutes. Saying the unit out loud is part of the answer — 2.98 minutes would beat every courier SLA on earth.",
      notes: [
        { choice: 2, why: "Reading the training number as minutes is exactly the trap: the db deliberately stores DAYS so you must state the unit instead of pattern-matching the figure." },
        { choice: 3, why: "Pending baskets have no shipped_at and drop out of the AVG automatically — adding them would mean inventing latency that doesn't exist." },
      ],
      difficulty: "easy",
    },
    {
      id: "wolt-mcq-4",
      prompt: "The US cluster shows 1 cancelled basket out of 19 placed. A teammate reports 'US cancel rate: 1%' after computing 1/19. What went wrong?",
      choices: [
        "Integer/precision drift and a missing share basis — the honest fold is 100.0 * 1 / 19 = 5.3%",
        "Nothing — 1 of 19 is 1%",
        "The US cluster has 2 cancelled baskets",
        "Cancelled baskets must be excluded from the denominator first",
      ],
      answer: 0,
      why: "1/19 in integer-ish SQL evaluates near zero; the share needs 100.0 * SUM(cancelled) / COUNT(*) over placed baskets = 5.3%. The denominator is all 19 placed baskets — excluding cancels first is the trick that zeroes every cluster's churn.",
      notes: [
        { choice: 3, why: "That's the WHERE-before-the-fold bug: cancel share is a conditional count over the PLACED population, and filtering cancels out of the denominator makes the rate unreadable." },
        { choice: 2, why: "The probed funnel is unambiguous: 1 cancelled, 19 placed in the US cluster — the arithmetic, not the data, was wrong." },
      ],
      difficulty: "medium",
    },
    {
      id: "wolt-mcq-5",
      prompt: "Baskets fan into 251 order_items rows (103 baskets). A teammate computes network basket value as SUM(o.total) / COUNT(*) after joining orders to order_items. What do they get?",
      choices: [
        "Roughly 2.4x too small — the denominator counts line rows, not baskets",
        "Exactly 338.19 — joins don't change aggregates",
        "Roughly 2.4x too big — the numerator duplicates",
        "Zero — SUM returns NULL after joins",
      ],
      answer: 0,
      why: "The join fans 103 baskets into 251 rows, so o.total repeats per line: the numerator inflates ~2.44x but COUNT(*) inflates with it — the ratio lands near 338.19 ÷ 2.44. The fix: SUM(o.total) / COUNT(DISTINCT o.id), or pre-aggregate order_items before joining.",
      notes: [
        { choice: 1, why: "Joins absolutely change aggregates when they fan out — this is the single most common basket-value bug in marketplace reporting." },
        { choice: 2, why: "Both sides scale, so the ratio shrinks rather than grows — the duplicated total divides by a duplicated count." },
      ],
      difficulty: "medium",
    },
    {
      id: "wolt-mcq-6",
      prompt: "The cluster board gates at 'clusters with at least 19 placed baskets'. Why does that gate belong in HAVING, not WHERE?",
      choices: [
        "The gate filters a fold (COUNT(*)) computed after GROUP BY — WHERE runs before the fold exists",
        "HAVING is faster on large tables",
        "WHERE can't reference the region column",
        "The two are equivalent; HAVING is just style",
      ],
      answer: 0,
      why: "Cluster scale is a post-fold fact: COUNT(*) only exists after GROUP BY, and HAVING is the clause that runs after it. The gate at 19 keeps EU 45, APAC 37 and US exactly 19 — the US cluster sits ON the boundary, which is why the gate number is a definition someone signs.",
      notes: [
        { choice: 2, why: "WHERE happily references region — it just can't see aggregates. The restriction is about fold timing, not column visibility." },
        { choice: 3, why: "They're only equivalent when the predicate touches no aggregate — a scale gate is nothing but an aggregate predicate." },
      ],
      difficulty: "medium",
    },
    {
      id: "wolt-mcq-7",
      prompt: "The settlement queue needs statements with NO payment row. Which shape is silently WRONG on a nullable join key?",
      choices: [
        "WHERE i.id NOT IN (SELECT invoice_id FROM payments)",
        "LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL",
        "NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)",
        "All three are equivalent and safe",
      ],
      answer: 0,
      why: "NOT IN with one NULL invoice_id in the subquery makes every comparison UNKNOWN — the whole queue empties with no error. The LEFT JOIN … IS NULL and NOT EXISTS shapes are NULL-safe; the subquery variant needs an explicit IS NOT NULL guard at minimum.",
      notes: [
        { choice: 3, why: "They're only equivalent when the subquery's population is NULL-free — 'invoice_id is never NULL' is an assumption, and settlement data keeps proving assumptions wrong." },
        { choice: 2, why: "NOT EXISTS is NULL-safe (the correlation drives it), but it reads as a per-row probe — on huge ledgers the LEFT JOIN anti-join plan can be materially cheaper." },
      ],
      difficulty: "hard",
    },
    {
      id: "wolt-mcq-8",
      prompt: "The LATAM cluster shows 2 baskets from 1 household at a 426.22 average — the highest average on the board. What does the city review conclude?",
      choices: [
        "Nothing yet — 2 baskets is a denominator too small to rank; the board prints n beside every average",
        "LATAM is the premium cluster and deserves budget",
        "The average is a data error",
        "LATAM should be excluded from the table",
      ],
      answer: 0,
      why: "A 426.22 average over 2 baskets is arithmetic, not a trend — the review's rule is that every average ships with its n (2 of 103 baskets, 1 of 16 households). Ranking small clusters as if they were big ones is the small-N flattery the board exists to prevent.",
      notes: [
        { choice: 1, why: "That's exactly the small-N trap: the same 426.22 computed on 45 baskets would be a strategy; on 2 baskets it's a coin flip." },
        { choice: 2, why: "The figure is probed and correct — 852.44 over 2 baskets. The problem is the ranking, not the data." },
      ],
      difficulty: "medium",
    },
    {
      id: "wolt-mcq-9",
      prompt: "Completion aging buckets read 27 baskets at 2 days, 30 at 3, 25 at 4. What must be true of the query that produced them?",
      choices: [
        "It filtered shipped_at IS NOT NULL — the buckets reconcile to the 82 completed baskets, never to 103",
        "It bucketed on created_at",
        "It COALESCE'd shipped_at to a default date",
        "It included cancelled baskets in a '4+ days' bucket",
      ],
      answer: 0,
      why: "27 + 30 + 25 = 82 — the completed population (52 delivered + 30 shipped). Aging buckets only exist for baskets that completed; the 14 pending and 7 cancelled have no shipped_at and belong to the refund-window file, not the latency histogram.",
      notes: [
        { choice: 1, why: "Bucketing on created_at answers 'when was demand placed', not 'how long did fulfillment take' — a different board with a different denominator." },
        { choice: 2, why: "COALESCE to a default date invents latency for 21 baskets that haven't finished — the flattering lie the service board exists to catch." },
      ],
      difficulty: "medium",
    },
    {
      id: "wolt-mcq-10",
      prompt: "Settlement statement #28 shows status 'paid' but zero payment rows (1,756.00). The queue is built as WHERE status = 'open'. What happens?",
      choices: [
        "#28 vanishes from the queue — the anti-join (LEFT JOIN … IS NULL) is the only shape that catches it",
        "#28 appears in the queue — paid status always lands in dunning",
        "#28 errors the query",
        "#28 doubles in the queue",
      ],
      answer: 0,
      why: "A status filter can't see absence: #28 is marked paid, so it sails past the open filter while its money never landed. The honest queue is an anti-join on payments.invoice_id — 6 statements, 15,217.00 — with the status column printed beside each row so #28 reads as the reconciliation finding it is.",
      notes: [
        { choice: 1, why: "That inverts the logic: paid-status rows are exactly what the open filter excludes — which is precisely why the anomaly needs the join's NULL arm, not the status column." },
        { choice: 3, why: "Doubles would require a join fan-out — payments has zero rows for #28, so there is nothing to multiply." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-wolt-1",
      tier: "medium",
      topic: "j7",
      universe: "growth",
      title: "The city-cluster board",
      brief: "City-ops memo, Wolt-flavored on the storefront db: Thursday's city review opens on the cluster board, and the GM reads it top-down — biggest basket value first, scaled clusters only (at least **19** placed baskets), because LATAM's 2-basket weekend makes its 426.22 average look like a strategy. The definition is fixed: baskets = `COUNT(*)` over placed orders, households = `COUNT(DISTINCT customer_id)`, value = `SUM(o.total)` in dollars (orders are REAL, no cents here). Probed fold: EU **45 baskets / 8 households / 15,089.23 / 335.32 avg**, APAC 37 / 5 / 11,605.45 / 313.66, US 19 / 2 / 7,286.16 / 383.48 — and the density column (households) is the headline the GM quotes.",
      ask: "Return the cluster board: city_cluster, baskets, households, basket_value, avg_basket — biggest value first, scaled clusters only.",
      template: "SELECT c.region AS city_cluster,\n       COUNT(*) AS baskets,\n       {1} AS households,\n       ROUND(SUM({2}), 2) AS basket_value,\n       ROUND(AVG(o.total), 2) AS avg_basket\nFROM orders o\nJOIN customers c ON {3}\nGROUP BY c.region\nHAVING COUNT(*) >= {4}\nORDER BY basket_value {5}",
      slots: [
        {
          answer: "COUNT(DISTINCT o.customer_id)",
          kind: "keyword",
          label: "the household grain",
          why: "The EU's 45 baskets come from 8 households — DISTINCT folds repeat demand back to people. COUNT(o.customer_id) after the join returns 45: the households column collapses into the baskets column, and the density story the GM quotes disappears without an error.",
        },
        {
          answer: "o.total",
          kind: "keyword",
          label: "the value column",
          why: "Basket value folds the order-total column — 15,089.23 for the EU. order_items owns unit_price, orders doesn't (an error, not a zero), and SUM(o.status) folds status text to 0.00 — a board that looks numeric and is garbage.",
        },
        {
          answer: "c.id = o.customer_id",
          kind: "keyword",
          label: "the cluster join key",
          why: "Households reference baskets by customer_id, so the stitch is c.id = o.customer_id. Join on c.id = o.id and baskets pair with whatever household shares their row id — the fold shrinks to a coincidence and every cluster reads wrong with no error.",
        },
        {
          answer: "19",
          kind: "number",
          label: "the cluster-scale gate",
          why: "The gate keeps the three scaled clusters: EU 45, APAC 37, and the US exactly 19 — sitting ON the boundary. LATAM's 2-basket population waits outside; a gate of 20 would silently delete a whole city from the board.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The GM reads top-down: 15,089.23, then 11,605.45, then 7,286.16. ASC opens the review on the smallest scaled cluster — a correct query that wastes the room's ten minutes running backwards.",
        },
      ],
      distractors: ["COUNT(o.customer_id)", "unit_price", "o.status", "c.customer_id = o.customer_id", "20", "ASC"],
      walkthrough: "A cluster board is a fold, a gate and an ordering. The JOIN stitches baskets to households on `c.id = o.customer_id`; COUNT(*) counts baskets (45 / 37 / 19) while COUNT(DISTINCT o.customer_id) folds repeat demand back to households (8 / 5 / 2) — swap in COUNT(o.customer_id) and the households column collapses to the basket count, killing the density story with no error. ROUND(SUM(o.total), 2) folds to 15,089.23 / 11,605.45 / 7,286.16; `unit_price` doesn't exist on orders and SUM(o.status) folds status text to 0.00. The HAVING gate at 19 keeps exactly the three scaled clusters — US sits ON the boundary, so a gate of 20 deletes a whole city while a gate of 18 changes nothing, which is why the gate number is signed. *Density is the headline: two columns, two grains, one row per cluster.*",
    },
    {
      id: "cs-wolt-2",
      tier: "easy",
      topic: "t3",
      universe: "refund-audit",
      title: "The aging window",
      brief: "Service-review memo, Wolt-flavored: the refund window opens where completion never lands — 21 baskets ({amber:pending} 14 + {rose:cancelled} 7) carry no `shipped_at` — but the aging board itself reads only the 82 completed baskets, because *a basket in the queue has no age yet, not zero age*. The ask: average completion aging per city cluster, scaled clusters only (at least **15** completed), worst first, so the GM sees which cluster's promise decays. Probed fold: US **15 completed / 3.07 days**, EU 36 / 2.94, APAC 29 / 2.93 — and the unit is DAYS on this db, the training stand-in for the courier minute-grain SLA.",
      ask: "Return the aging board: city_cluster, completed_baskets, avg_days (2 decimals) — slowest cluster first, scaled clusters only.",
      template: "SELECT c.region AS city_cluster,\n       COUNT(*) AS completed_baskets,\n       ROUND(AVG({1}), 2) AS avg_days\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.shipped_at IS NOT NULL\nGROUP BY c.region\nHAVING COUNT(*) >= {2}\nORDER BY avg_days {3}",
      slots: [
        {
          answer: "JULIANDAY(o.shipped_at) - JULIANDAY(o.created_at)",
          kind: "keyword",
          label: "the aging expression",
          why: "Aging is a julianday difference — fractional days between completion and placement. Bare text-minus-text coerces both timestamps to leading digits and prints 0.00 days everywhere; bare JULIANDAY(o.created_at) reads ~19,700 days since epoch. The unit statement is part of the query.",
        },
        {
          answer: "15",
          kind: "number",
          label: "the scaled-cluster gate",
          why: "The gate keeps the clusters with real completed volume: EU 36, APAC 29, and the US at exactly 15 — ON the boundary again. A gate of 16 silently deletes the US cluster from a service review that exists to catch it; 10 or below lets LATAM's 2-basket average pose as a trend.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-first direction",
          why: "Service boards read worst first: US 3.07, EU 2.94, APAC 2.93. ASC opens on the best-behaved cluster — a correct query that buries the finding the review was called for.",
        },
      ],
      distractors: ["o.shipped_at - o.created_at", "JULIANDAY(o.created_at)", "o.created_at", "16", "ASC"],
      walkthrough: "Aging reads one way: JULIANDAY(shipped_at) - JULIANDAY(created_at) over completed baskets only. The WHERE keeps 82 of 103 rows; AVG skips NULLs by construction, but the filter makes the population sentence honest — the 14 {amber:pending} and 7 {rose:cancelled} have no age, and COALESCE-ing them to zero would flatter the slowest cluster. The fold prints US 15 / 3.07, EU 36 / 2.94, APAC 29 / 2.93; the gate at 15 keeps all three — LATAM's 2 completed baskets ride outside. Replace the expression with bare text-minus-text and every cluster reads 0.00 days; swap in JULIANDAY(created_at) alone and the board reads ~19,700 days since epoch. *State the unit, state the population, then read the spread — in that order.*",
    },
  ],

  problems: [
    { slug: "customer-placing-the-largest-number-of-orders", why: "The heaviest household on the platform — Alice Chen's 24 baskets is the argmax fold city ops runs to sanity-check the census before it ships." },
    { slug: "market-analysis-i", why: "Clusters judged against the 338.19 network baseline via scalar subquery — the baseline-judgment shape behind every Wolt city review." },
    { slug: "immediate-food-delivery-ii", why: "First-delivery share with the honest denominator — the conversion read Wolt runs on every newly launched city cluster." },
    { slug: "customers-who-never-order", why: "The anti-join reflex drill — here it returns 0 (every household has ordered), which is the lesson: the real queue is billing's 6 unsettled statements at 15,217.00." },
    { slug: "average-time-of-process-per-machine", why: "Aging per unit through a fold — the courier-shift shape: completion minus start, averaged per cluster, NULLs excluded by construction." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Each household's habitual SKU — the Wolt Market personalization input, argmax at person grain over basket lines." },
    { slug: "rank-scores", why: "Cluster leaderboards with ties kept honest — RANK vs DENSE_RANK decides whether two clusters share a podium step." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest basket per SKU — the argmax drill behind the freshness boards Wolt Market aisles run every morning." },
    { slug: "sales-analysis-ii", why: "Baskets that touched a given vendor — the supplier-scoped demand read Wolt runs before a vendor negotiation." },
    { slug: "find-churn-risk-customers", why: "Households whose last basket ages past the window — the winback list computed from date math rather than asserted by the city deck." },
    { slug: "queries-quality-and-percentage", why: "Value-per-unit ratios folded with quality shares — the vendor-scorecard shape: revenue per line beside a rate, rounded once at the end." },
    { slug: "group-sold-products-by-the-date", why: "Basket lines folded into per-day comma lists — the ops export that turns 251 line rows into a daily picking manifest." },
    { slug: "top-travellers", why: "Cumulative value per household ranked — the courier-network habit: fold demand onto people, rank, and read the head of the board." },
    { slug: "average-selling-price", why: "Effective unit economics per SKU across lines — the Wolt Market pricing input computed, not copy-pasted from the catalog." },
    { slug: "keep-latest-dedupe", why: "Keep-latest per key — household address and preference changes arriving as multiple rows, collapsed to the current one with ROW_NUMBER." },
    { slug: "product-price-at-a-given-date", why: "As-of price reads — the catalog changes mid-window; the analyst who can't price a basket as-of its date misstates every fold." },
  ],
};
