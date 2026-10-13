// Sephora — kit 14 of the E-commerce & Marketplace domain (Batch L, wave 7).
// Beauty omnichannel edition: Beauty Insider reward tiers, store bins vs ship,
// sampling depth, and replenishment cycles racing the shelf.
// Pool provenance: Sephora has NO registry tags in this app's pools — 0 tagged
// LC problems — so every topic and problem slug is theme-curated from
// scripts/company-pools.md's theme menu (the RFM row even carries a Sephora
// tag in the menu and leads the loyalty topic), mirroring the workflows
// Sephora screens are known to probe (tier banding, kept-basket denominators,
// sampling cross-sell, replenishment cover, region boards, cents discipline).
// Case studies run on the storefront db with probed figures from
// scripts/company-facts.md — mapped honestly as customers=Insider member
// households, orders=baskets (store-bin pickup or ship), order_items=scanned
// lines, products=SKUs, suppliers=brand vendors, shipped_at=dispatch
// timestamp, regions=market clusters. Probe receipts (status-value split
// 15571.07/11996.72/6113.00/1152.49; top-4 household concentration 63.5;
// thin-stock trio remaining 14/15/17; cluster census cells 45/8/15089.23 and
// 37/5/11605.45 and 19/2/7286.16; status×cluster grid EU 24/12, APAC 21/8,
// US 5/10, LATAM 2/0) live in the worklog.

import type { CompanyKit } from "../types";

export const sephoraKit: CompanyKit = {
  id: "sephora",
  domainId: "ecom",
  name: "Sephora",
  tagline: "Beauty omnichannel: rewards, bins and baskets",
  accent: "text-rose-200",

  brief: [
    "**Sephora** is beauty retail's omnichannel flagship — stores that double as sampling counters, a {rose:Beauty Insider} program that tiers shoppers into *Insider, VIB and Rouge*, and a fulfillment network where every basket carries a store-bin-vs-ship decision. The analyst's grain stack maps honestly onto the training db: customers are Insider member households, `orders` are baskets (picked into a store bin or shipped), order_items are scanned lines, products are SKUs, and suppliers are the brand vendors behind them. Probed scale: **16 member households** placing 103 baskets that fan into **251 scanned lines** — about 2.44 lines per basket, the sampling story in one ratio — worth 34833.28 at an average basket of **$338.19**.",
    "The data org lives on the dispatch clock. Status is the funnel: 52 delivered, 30 shipped, 14 pending and {rose:7 cancelled} — and `shipped_at` is non-NULL for exactly **82 of 103 baskets**, averaging **2.98 days** from placement to dispatch with a 2-to-4-day range. Clusters pace differently — US 3.07 days over 15 dispatched baskets, EU 2.94 over 36, APAC 2.93 over 29, LATAM 3.5 over just 2 — and an analyst who can't say *which population a latency average covers* (dispatched only; a pending basket has no latency YET) gets caught in round one. Every bins-vs-ship debate is a CASE expression away, and interviewers know it.",
    "Interview style is loyalty-first and denominator-ruthless. Screens warm up on a join (baskets to member households), escalate into a threshold census — **14 of 16 households** carry 2+ baskets and the top four hold **63.5%** of all demand — then land on the two Sephora signatures: an *Insider tier ladder* (lifetime spend folded per household, banded into tiers, concentration printed beside its denominator) or a *replenishment census* (the thin-stock trio sitting at 14, 15 and 17 units of cover). Follow-ups are spoken: 'is that per basket or per member?', 'does a cancelled basket stay in your placed base?', 'what population does that average cover?'",
    "Preparation strategy: Sephora carries **0 tagged problems** in this app's registry, so every slug below is theme-curated from the SQL band to mirror the workflows its screens actually probe — loyalty banding, kept-basket rates, replenishment cover, cents discipline on the settlement tables (invoices and payments store INTEGER cents; the dollar read is `amount_cents / 100.0`). The two case studies run on the live db: one rebuilds the **market-cluster basket board** the growth review opens with, the other rebuilds the **dispatch-state pivot** ops reads each morning. Both are mechanically audited against probed figures.",
  ],

  dayInLife: [
    "**08:40 —** The day opens on the dispatch board, and the first query is always the same reconciliation: did the overnight scan stream land, do line sums tie to basket totals, does the status census read **52 delivered, 30 shipped, 14 pending, 7 cancelled**? The latency tile is next — **2.98 days** across the 82 dispatched baskets — and the eye goes straight to the cluster split, because the US cluster at **3.07 days** is the one the ops lead pings about. Fourteen baskets sit awaiting dispatch and seven died in the cart; the analyst who can write the aging query owns the standup.",
    "**11:30 —** Mid-morning is the stock-cover block. The replenishment census folds sold units against shelf stock and bands the result, and the thin trio is the story: the noise-canceling headset at **14 units of cover**, the desktop mic at **15**, the top-wearable SKU at **17**. The trap gets narrated out loud: a basket that shipped still consumed stock, so the fold is `stock - SUM(quantity)` over every scanned line — *a replenishment plan built on delivered-only demand undercounts by the 30 in-transit baskets*. The store-bins split ships beside it: pickup-style demand versus ship-style, one query, two labeled arms.",
    "**15:30 —** The afternoon tilts to the loyalty review. The Insider ladder folds lifetime spend per household and bands it: the top four households carry **63.5%** of the book, led by a 24-basket member worth **7262.35**, and the tier cut is a HAVING gate the deck states out loud. Finance takes the settlement hygiene pass — five split-payment invoices found with `GROUP BY invoice_id HAVING COUNT(*) > 1`, a {rose:void}-but-paid bill at 925, an open book of **$19,609.00** — every dollar read via `amount_cents / 100.0`. The note ships with definitions attached, because *a loyalty number without its denominator is a rumor in a retailer that audits its own dashboards*.",
  ],

  metrics: [
    { name: "Dispatch latency", what: "Days from basket placement to dispatch on the 82 baskets carrying `shipped_at` — 2.98 average, 2-to-4 range. Population stated first: pending baskets have no latency YET." },
    { name: "Kept-basket share", what: "Non-cancelled baskets ÷ placed — 7 of 103 cancel (6.8%). The denominator rule (cancelled stays in the placed base) is the whole test." },
    { name: "Lines per basket", what: "Scanned lines over baskets — 251 over 103, about 2.44. The sampling-depth proxy: how much of the counter the average basket actually carries." },
    { name: "Average basket", what: "Revenue per placed basket — 338.19 across 103 baskets (34833.28 total). The number every promo retro argues against: did the event lift baskets, value, or neither." },
    { name: "Insider concentration", what: "Share of demand from the four households above 3000 lifetime spend — 63.5% (7262.35 + 6640.56 + 4574.23 + 3644.56 of 34833.28). The tier program's reason to exist." },
    { name: "Repeat-member rate", what: "Share of households with 2+ baskets — 14 of 16 here. The retention KPI loyalty lives by, and a HAVING-gated census in interview form." },
    { name: "Replenishment cover", what: "Shelf stock minus sold units per SKU — the thin trio sits at 14 (headset), 15 (mic) and 17 (smart watch). The restock clock store ops reads before the weekend." },
    { name: "Vendor concentration", what: "Top brand vendor's share of receipts — 32% (11130.25 of the vendor book). When one vendor wobbles, a third of the shelf wobbles with it." },
  ],

  topics: [
    {
      name: "The Insider tier ladder",
      why: "The loyalty program is a banding problem: fold lifetime spend per household, then band into Insider, VIB and Rouge tiers and print the concentration beside its denominator — the 63.5% top-four line is computed exactly this way. RFM folds and spend-tier ladders are the daily drills; the graded part is saying whether a number counts households, baskets or dollars.",
      slugs: ["rfm-segmentation", "customer-purchasing-behavior-analysis", "spend-histogram"],
    },
    {
      name: "Kept baskets and placed demand",
      why: "Placed is not kept: 103 baskets minus 7 {rose:cancelled} is the kept base, and 'baskets placed vs baskets kept' is the sentence every Sephora screen circles. The drill is conditional counting — status arms, delivered tallies, cancelled rates with the denominator decided before the ratio, not after the meeting.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "user-purchase-platform"],
    },
    {
      name: "Sampling depth and cross-sell",
      why: "Sampling is attach: 2.44 lines per basket, and the widest-attach family riding on 54 of 103 baskets is not the fattest — value and depth are different folds over the same rows. Co-occurrence pairs and A-and-B-but-not-C screens are how the counter team decides what sits beside the till.",
      slugs: ["customers-who-bought-a-and-b-not-c", "find-product-recommendation-pairs", "sales-analysis-ii"],
    },
    {
      name: "Repeat members and lapse risk",
      why: "14 of 16 households order again — and the whole loyalty economics case rests on which ones stop. Repeat-rate folds, churn anti-joins and reactivation screens are the exact drills, and on this db the anti-joins come back empty, so recognizing when zero is the true answer is part of the test.",
      slugs: ["repeat-purchase-rate", "find-churn-risk-customers", "dormant-reactivation"],
    },
    {
      name: "Replenishment and stock cover",
      why: "Store bins die at the shelf: the replenishment census folds stock minus sold per SKU and bands the result — the thin trio at 14/15/17 units is the restock queue. Weeks-of-supply converts trailing demand into a clock, and the imbalance census finds lopsided pools before the weekend rush.",
      slugs: ["weeks-of-supply", "warehouse-manager", "find-stores-with-inventory-imbalance"],
    },
    {
      name: "Cluster boards and ranking",
      why: "The growth review opens on cluster leaderboards — baskets, revenue, average basket — ranked and tie-proofed. RANK vs DENSE_RANK vs ROW_NUMBER is not trivia here: monthly basket counts tie five ways in 2024 (8, 8, 8, 8, 8), and a board that splits ties silently invents a ranking nobody agreed to.",
      slugs: ["rank-scores", "department-top-three-salaries", "sort-the-olympic-table"],
    },
    {
      name: "Two grains, one census",
      why: "Baskets AND households per cluster is the opening read — and the trap is counting both at one grain. COUNT(*) counts baskets (103); COUNT(DISTINCT customer_id) counts households (16); the gap is visit intensity, the number the loyalty team actually manages.",
      slugs: ["number-of-rich-customers", "daily-leads-and-partners", "article-views-ii"],
    },
    {
      name: "Basket depth and blended AOV",
      why: "Units per basket beside revenue per basket is how merch separates big baskets from expensive ones — a promo that lifts depth while AOV falls is a sampling story, not a win. The depth fold and the weighted mean are the drills; blended AOV across store-bin and ship formats is where the weighting choice gets honest.",
      slugs: ["basket-depth-aov", "calculate-compressed-mean", "transactions-per-visit-histogram"],
    },
    {
      name: "Rates with honest denominators",
      why: "Kept shares, repeat rates, tier-attach rates — Sephora's ratios punish integer division and quiet population swaps. The house habit: 100.0 before the division, the denominator's population stated in the subtitle, rounding once at the end — because an 87 instead of 87.5 on the loyalty board is a member tier that gets yelled at for the wrong reason.",
      slugs: ["queries-quality-and-percentage", "percentage-of-users-attended-a-contest", "confirmation-rate"],
    },
    {
      name: "Promo windows and month spines",
      why: "Beauty events are windows, not moods: half-open date predicates decide which baskets count as event baskets, and month spines via SUBSTR drive the pace read. The classic BETWEEN-on-the-last-day bug is a standing interview question, and January's 3731.97 peak versus July's 1193.86 floor is the seasonality story the spine tells.",
      slugs: ["list-the-products-ordered-in-a-period", "monthly-transactions-i", "user-activity-for-the-past-30-days-i"],
    },
  ],

  theory: [
    {
      id: "sephora-t1",
      q: "Baskets join to member households on one key and to SKUs through the scan lines. In an omnichannel read, when do you insist on a LEFT JOIN, and what does an INNER join silently drop?",
      a: "The join follows the spine of the question. Demand-shaped reads — basket counts per cluster, latency by region, promo-month revenue — take the basket stream as the spine and INNER joins attaching household attributes are right, because every unmatched row would distort a rate built on basket counts. Supply-shaped reads — SKUs that never scanned, households that lapsed — take the dimension as the spine and LEFT JOIN + IS NULL is the only honest shape: INNER drops exactly the rows you're hunting. The honesty note this db earns: every household HAS ordered and every basket resolves to a member (zero never-ordered rows on both sides), so INNER and LEFT coincide here — which is exactly why the interviewer asks you to reason about the shape instead of leaning on the data to save you.",
      tag: "joins",
    },
    {
      id: "sephora-t2",
      q: "Rank market clusters on the Insider board for the growth review. Where do RANK, DENSE_RANK and ROW_NUMBER disagree, and which one ships?",
      a: "They disagree exactly where the metric ties, and ties are everywhere in this business: 2024's monthly basket counts tie five ways at 8, cancelled counts tie at 3 per cluster, several households share basket counts across the ladder. RANK gives tied rows the same rung and skips the next (1, 2, 2, 4) — the gap implies a missing cluster that doesn't exist. DENSE_RANK shares the rung and keeps the sequence compact. ROW_NUMBER splits the tie arbitrarily unless you add a deterministic tie-breaker like household id, which makes it the dedupe tool, not the board tool. The review ships DENSE_RANK with an explicit secondary sort: boards are read as 'who's nth', a skipped rung generates a meeting about a cluster that was never there, and a deterministic tie-break keeps the board identical between the morning run and the 4pm re-run.",
      tag: "windows",
    },
    {
      id: "sephora-t3",
      q: "On the baskets table — 103 rows, 251 scan lines after the join, 16 member households — narrate what COUNT(*), COUNT(shipped_at) and COUNT(DISTINCT customer_id) each return, and which grain each serves.",
      a: "Three numbers, three grains, all true at once. COUNT(*) is 103 — every basket, the placed denominator for kept-share and repeat-rate work. COUNT(shipped_at) is 82 — the dispatched subset, because COUNT skips NULLs; the gap between 103 and 82 IS the 14 pending plus 7 cancelled, and the gap is a fulfillment signal, not a data bug. COUNT(DISTINCT customer_id) is 16 — repeat baskets folded back to households, the audience grain. And after the scan-line join a fourth number appears: COUNT(*) becomes 251 — lines, not baskets — which is why basket AOV (34833.28 ÷ 103 = 338.19) and line value (÷ 251) are different metrics that share a numerator. The omnichannel trap is reporting one grain under another's name; the strong answer assigns a grain to every COUNT out loud.",
      tag: "aggregation",
    },
    {
      id: "sephora-t4",
      q: "`shipped_at` is NULL until a basket is dispatched, and cancelled baskets never get one. What is your NULL policy for the latency metric and for a within-SLA CASE arm?",
      a: "Define who has the metric, state it, never launder the hole. For latency, the population is the 82 dispatched baskets: WHERE shipped_at IS NOT NULL is correct and the subtitle says so — 2.98 days average, 2-to-4 range. The subtle bug is the unfiltered version 'working anyway': AVG skips NULL rows silently, so it returns the same 2.98 — the number is right while the denominator discipline is broken, and the day a rate rides beside it the NULLs corrupt the share. For a CASE arm the failure is louder: a within-3-days flag without the population filter sends every pending basket to the ELSE bucket — NULL <= 3 is UNKNOWN, not FALSE — and the deck reads 21 unfulfilled baskets as 'late' when the truth is 'not yet'. Three behaviors to narrate: filters, aggregates, comparisons. The habit being graded is a WHERE clause doing definitional work without saying so.",
      tag: "nulls",
    },
    {
      id: "sephora-t5",
      q: "'Only show households with lifetime spend of at least 3000' — WHERE or HAVING, and why can't the other clause see the sum at all?",
      a: "HAVING, because lifetime spend is a group fact: it exists only after GROUP BY customer_id folds the baskets and SUM tallies it. Logical evaluation runs FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — WHERE executes before groups form, so the sum literally does not exist yet and the engine throws 'no such column'. The split that predicts every placement: row predicates in WHERE (status = 'delivered', date windows — filters that shrink the fold's input), group predicates in HAVING (spend floors, count gates — filters that keep or kill folds). On the tier ladder the HAVING gate at 3000 admits exactly four households (7262.35, 6640.56, 4574.23, 3644.56) and drops twelve — a Rouge-line decision the deck should own, not the WHERE clause hide.",
      tag: "pipeline",
    },
    {
      id: "sephora-t6",
      q: "Loyalty wants the households whose average basket beats the network average of 338.19. Subquery, window, or CTE?",
      a: "All three are honest; the definition's weight picks one. A scalar subquery — HAVING the household's AVG(total) > (SELECT AVG(total) FROM orders) — is the compact benchmark read: 338.19 as the line, households folding above it flagged. A windowed fold, AVG(AVG(total)) OVER (), keeps every household in the result with its premium visible, which is what the deck wants. A CTE earns its place when 'basket' needs a definition — cancelled baskets excluded, sampling lines netted — because a named two-stage fold survives review and a nested one-liner doesn't. What's not negotiable: the benchmark and the households must fold on the same population. Excluding cancelled baskets from one side and not the other is how a 338.19 comparison quietly becomes 359 against 331 — two different claims wearing one slide.",
      tag: "subqueries",
    },
    {
      id: "sephora-t7",
      q: "Basket and dispatch timestamps arrive as TEXT. How do you bucket them by month, diff them in days, and where does each approach break?",
      a: "Three tools, three caveats. Buckets: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on ISO text — both give '2024-01', and the SUBSTR shortcut works only while the format stays fixed-width; one loose timestamp and the promo retro quietly mis-buckets. Diffs: JULIANDAY(shipped_at) − JULIANDAY(created_at) returns fractional days — this db's 2.98-day average is exactly that, rounded once at the END, not per row; rounding per row then averaging is a different, wrong metric. Windows: half-open intervals — created_at >= '2024-11-01' AND < '2024-12-01' — never BETWEEN on the last day, which double-counts midnight baskets on event boundaries. And the standing caveat: shipped_at is NULL until dispatch, so every latency fold states its population first (82 of 103). State the convention, then query it — never the reverse.",
      tag: "dates",
    },
    {
      id: "sephora-t8",
      q: "Vendor settlements must reconcile: invoices, payments and expenses all store INTEGER cents, and payouts can arrive as two rows on one bill. How do you keep the fold honest?",
      a: "Two disciplines. Units: every dollar read is amount_cents / 100.0 — the .0 promotes to real arithmetic before the division; divide once, at the display edge, after the fold. Duplicates: GROUP BY invoice_id HAVING COUNT(*) > 1 finds the split-settlement bills — five on this db — and collapsing them is a DECISION, not a default: folding two genuine part-payments into one hides a shortfall, so the honest version classifies coverage first (exact, partial, none) and only then dedupes the display layer. The known anomaly classes to hunt: a void bill that still carries a payout (925 dollars) and a paid bill with zero payout rows (1756) — vendor statements exist to catch exactly these. Detect with an aggregate, dedupe with a deterministic tie-break, and be able to say which rows your dedupe discarded and why the business agreed to lose them.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "sephora-mcq-1",
      prompt: "The baskets table holds 103 rows. Which count pair explains the fulfillment gap the ops board shows?",
      choices: [
        "COUNT(*) = 103 placed, COUNT(shipped_at) = 82 dispatched — the 21-gap is 14 pending + 7 cancelled",
        "COUNT(*) = 82, COUNT(shipped_at) = 103 — dispatch backfills the total",
        "COUNT(*) = 103, COUNT(shipped_at) = 103 — NULLs count as zero dates",
        "COUNT(shipped_at) = 96 — cancelled baskets carry timestamps too",
      ],
      answer: 0,
      why: "COUNT(*) counts every row (103 placed); COUNT(shipped_at) skips NULLs (82 dispatched: 52 delivered + 30 shipped). The 21-basket gap decomposes exactly into 14 pending + 7 cancelled — a fulfillment signal, not missing data.",
      notes: [
        { choice: 2, why: "COUNT(col) never counts NULLs — that's its whole difference from COUNT(*). If it counted NULL dates, the two counts would always tie and the column would be pointless." },
        { choice: 3, why: "Cancelled baskets have no dispatch timestamp — 82 includes only delivered (52) + shipped (30). The census is a status read before it's a date read." },
      ],
      difficulty: "easy",
    },
    {
      id: "sephora-mcq-2",
      prompt: "The merch deck quotes an average basket of 338.19. Which population does that number cover?",
      choices: [
        "The 52 delivered baskets only — revenue is only real when it lands",
        "The 82 dispatched baskets — in-flight baskets count",
        "All 103 placed baskets — 34833.28 over every placed basket, cancelled included",
        "The 96 non-cancelled baskets — cancelled demand is excluded",
      ],
      answer: 2,
      why: "The 338.19 average basket is placed-demand AOV: SUM(total) = 34833.28 over COUNT(*) = 103. Cancelled baskets stay in the placed base by definition — 'baskets placed vs baskets kept' is a separate metric, not a different AOV.",
      notes: [
        { choice: 3, why: "Dropping the 7 cancelled baskets changes the denominator silently — the result is a kept-basket AOV, a different metric wearing the headline's name. State the population or the deck re-defines it for you." },
        { choice: 1, why: "Restricting to the 82 dispatched excludes 21 real placed baskets — a fulfillment-filtered AOV, useful in ops, wrong in the merch deck that argues promo lift on placed demand." },
      ],
      difficulty: "easy",
    },
    {
      id: "sephora-mcq-3",
      prompt: "The open-book settlement fold sums amount_cents to 1960900. Which expression prints the dollar figure the exec deck expects?",
      choices: [
        "amount_cents / 100",
        "ROUND(amount_cents / 100.0, 2)",
        "amount_cents * 100",
        "ROUND(amount_cents, 2)",
      ],
      answer: 1,
      why: "Dividing by 100.0 promotes to real arithmetic before the division: 1960900 cents reads 19609.00 dollars, rounded once at the display edge. Invoices, payments and expenses all store INTEGER cents on this db.",
      notes: [
        { choice: 0, why: "Integer ÷ integer truncates in SQLite — fine on whole-dollar rows, silently wrong the first time an odd-cent bill lands. The .0 is the fix, not a style choice." },
        { choice: 2, why: "Multiplying turns cents into 196090000 — units inverted. Magnitude-check every money fold: dollars are smaller than cents, never larger." },
      ],
      difficulty: "easy",
    },
    {
      id: "sephora-mcq-4",
      prompt: "Baskets join to scan lines: 103 baskets fan into 251 rows. On the joined result, which count still counts BASKETS?",
      choices: [
        "COUNT(*) — it always counts the primary entity",
        "COUNT(DISTINCT o.id) — folding the fan-out back to the basket grain",
        "COUNT(o.id) — NULLs are skipped automatically",
        "SUM(o.id) — ids sum to the row count",
      ],
      answer: 1,
      why: "After the fan-out, only COUNT(DISTINCT o.id) folds lines back to baskets — COUNT(*) counts 251 rows. COUNT(o.id) skips only NULLs; with a NOT NULL key it counts 251 too.",
      notes: [
        { choice: 0, why: "COUNT(*) counts ROWS of the joined result — the fan-out IS the result. 'Primary entity' is a hope, not semantics; DISTINCT is the fold." },
        { choice: 3, why: "SUM over ids is a meaningless number that happens to be huge. Sanity-check magnitude: basket counts are smaller than line counts, never larger." },
      ],
      difficulty: "medium",
    },
    {
      id: "sephora-mcq-5",
      prompt: "The Insider ladder shows households with lifetime spend of at least 3000. Which clause keeps exactly the four Rouge-line households?",
      choices: [
        "WHERE SUM(o.total) >= 3000",
        "HAVING SUM(o.total) >= 3000",
        "LIMIT 4",
        "WHERE o.total >= 3000",
      ],
      answer: 1,
      why: "Lifetime spend is a group fact — it exists only after GROUP BY customer_id folds the baskets — so the gate is HAVING. That keeps the four households at 7262.35, 6640.56, 4574.23 and 3644.56, and drops the other twelve.",
      notes: [
        { choice: 0, why: "WHERE runs before groups form — SUM(o.total) doesn't exist yet and the engine rejects it. The error message is the pipeline order teaching itself." },
        { choice: 2, why: "LIMIT 4 truncates the output after whatever order the fold produced — it doesn't define the tier, and a fifth qualifying household would silently vanish." },
        { choice: 3, why: "o.total >= 3000 filters single BASKETS (max 1088.44 — the gate would return zero rows), not household lifetime spend. Row predicates can't see the fold." },
      ],
      difficulty: "medium",
    },
    {
      id: "sephora-mcq-6",
      prompt: "The holiday beauty event ran November 1–30, 2024. Which predicate captures exactly the event baskets?",
      choices: [
        "created_at BETWEEN '2024-11-01' AND '2024-11-30'",
        "created_at >= '2024-11-01' AND created_at < '2024-12-01'",
        "STRFTIME('%Y-%m', created_at) = '2024-11' AND created_at <> '2024-11-30'",
        "created_at LIKE '2024-11%'",
      ],
      answer: 1,
      why: "The half-open window [Nov 1, Dec 1) captures every timestamp in the event including November 30's evening baskets. On ISO-8601 text it's also boundary-explicit — the house style for event windows.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive on both ends — any Nov 30 basket stamped with a time component (e.g. '2024-11-30 18:22') falls after '2024-11-30' and drops out of the event silently." },
        { choice: 3, why: "LIKE '2024-11%' works on this TEXT format but hides the boundary logic in a pattern — one non-ISO timestamp in the stream and the event read mis-buckets without an error." },
      ],
      difficulty: "medium",
    },
    {
      id: "sephora-mcq-7",
      prompt: "You band ALL 103 baskets with CASE WHEN julianday(shipped_at) - julianday(created_at) <= 3 THEN 'on_time' ELSE 'late' END. How many baskets land in 'late'?",
      choices: [
        "25 — exactly the 4-day baskets",
        "46 — the 25 four-day baskets plus 21 unfulfilled baskets swept into ELSE",
        "21 — only the unfulfilled baskets",
        "0 — NULL latency sorts as fastest",
      ],
      answer: 1,
      why: "57 dispatched baskets are within 3 days, 25 sit at 4 days — and the 21 baskets with NULL shipped_at (14 pending + 7 cancelled) fail the WHEN arm because NULL <= 3 is UNKNOWN, silently joining the 'late' bucket: 25 + 21 = 46. The population filter isn't pedantry; it's the difference between 'late' and 'not yet'.",
      notes: [
        { choice: 0, why: "That's the answer WITH the WHERE shipped_at IS NOT NULL filter — the case is precisely what the filter prevents. The sweep of NULLs into ELSE is the trap the ops deck keeps rediscovering." },
        { choice: 3, why: "NULL never sorts as fastest or slowest in a comparison — it yields UNKNOWN and the row falls through. Reporting 0 'late' baskets during a backlog is how the board lies." },
      ],
      difficulty: "hard",
    },
    {
      id: "sephora-mcq-8",
      prompt: "In SUM(baskets) OVER (ORDER BY baskets DESC) across the 2024 months, five months tie at 8 baskets. What does the running total at the FIRST 8-basket month include?",
      choices: [
        "Just that one row — running totals add row by row",
        "All five 8-basket months — the default frame is RANGE, and peers ride together",
        "The whole table — an unordered window is global",
        "Nothing — window sums require an explicit ROWS BETWEEN",
      ],
      answer: 1,
      why: "The default frame with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes ordering PEERS — the running total jumps by 40 at the first 8-basket month. ROWS BETWEEN … CURRENT ROW counts one row. Five of 2024's twelve months tie at 8 baskets, so this is not a corner case on this db.",
      notes: [
        { choice: 0, why: "That's the ROWS frame's answer — and it takes an explicit ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW to get it. The default silently picks RANGE-with-peers." },
        { choice: 3, why: "Windows work fine without explicit frames — they inherit RANGE, which is precisely the surprise. State the frame; don't inherit it." },
      ],
      difficulty: "hard",
    },
    {
      id: "sephora-mcq-9",
      prompt: "The repeat-member rate is 14 households out of 16. Which expression prints it as 87.5?",
      choices: [
        "100 * 14 / 16",
        "ROUND(100.0 * 14 / 16, 2)",
        "ROUND(14 / 16, 2) * 100",
        "100.0 * 14 / 16 without rounding, formatted downstream",
      ],
      answer: 1,
      why: "100.0 promotes to real arithmetic before the division: 87.5 exactly, rounded once at the display edge. The .0 placement is the whole fix — integer math is the standing bug in every rate the loyalty team reports.",
      notes: [
        { choice: 0, why: "100 * 14 / 16 is integer division end-to-end in SQLite: 1400 / 16 truncates to 87 — the board shows 87 and the tier gets yelled at for a rounding bug it didn't make." },
        { choice: 2, why: "14 / 16 is 0 in integer math — the rate reads 0.00 before the multiplication can save it. Promote FIRST, round LAST." },
      ],
      difficulty: "hard",
    },
    {
      id: "sephora-mcq-10",
      prompt: "The AR anti-join (invoices LEFT JOIN payments … WHERE payment IS NULL) returns 6 bills worth 15217.00. What does adding AND i.status = 'open' do?",
      choices: [
        "Nothing — all 6 unpaid bills are open",
        "Drops the paid-status bill of 1756.00 that has no payout rows — 5 bills worth 13461.00 remain",
        "Adds the void-but-paid 925.00 bill to the queue",
        "Returns 0 rows — open bills always have payments",
      ],
      answer: 1,
      why: "The 6-bill anti-join includes one paid-status anomaly (1756.00, zero payout rows). The status filter removes it: 5 open bills worth 13461.00. Both numbers are true — the queue's DEFINITION decides which one ships.",
      notes: [
        { choice: 0, why: "The 6-bill queue deliberately spans statuses — that's how the paid-but-unmoved 1756.00 anomaly gets caught. Filtering it out hides the exact row finance needs." },
        { choice: 2, why: "The void-but-paid bill (925.00) HAS a payout row, so the anti-join's IS NULL already excludes it. It never was in the queue." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-sephora-1",
      tier: "medium",
      topic: "j7",
      universe: "growth",
      title: "The market-cluster basket board",
      brief:
        "Sephora-flavored case on the storefront db (customers = Insider member households, orders = baskets, regions = market clusters): the growth review opens on the cluster board — baskets, distinct member households, revenue, average basket and lost baskets per cluster — richest revenue first, and the insights lead is explicit: 'clusters under 19 baskets don't set policy — gate them.' Probed facts: the book is 103 baskets worth 34833.28 across four clusters — EU 45 baskets over 8 households worth 15089.23 (335.32 avg), APAC 37 over 5 worth 11605.45 (313.66), US 19 over 2 worth 7286.16 (383.48), LATAM 2 over 1 worth 852.44. The 19-basket gate lands exactly on the US cluster's basket count — the smallest cluster the board still trusts.",
      ask: "Return per market cluster: baskets, distinct households, revenue (2dp), average basket (2dp) and lost baskets — richest revenue first, gated at 19+ baskets.",
      template:
        "SELECT c.region,\n       COUNT(*) AS baskets,\n       COUNT(DISTINCT o.customer_id) AS members,\n       ROUND(SUM(o.total), 2) AS revenue,\n       ROUND(AVG(o.total), 2) AS avg_basket,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS lost\nFROM orders o\nJOIN customers c ON c.id = o.{4}\nGROUP BY c.region\nHAVING COUNT(*) >= {1}\nORDER BY revenue {3};",
      slots: [
        {
          answer: "19",
          kind: "number",
          label: "the materiality gate",
          why: "HAVING COUNT(*) >= 19 keeps EU (45), APAC (37) and US (19) and drops LATAM's 2-basket sample — too thin to set policy. 19 is also a result cell (the US cluster's basket count), so the gate and the smallest surviving cluster are the same number.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the lost-basket arm",
          why: "Lost demand is baskets that never kept: status = 'cancelled' tallies 3 lost in each of EU and APAC and 1 in US. 'Pending' would report 6/5/3 — the awaiting pile wearing the lost column's name.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the richest-first direction",
          why: "The board leads with revenue: EU 15089.23, APAC 11605.45, US 7286.16. ASC would open the review on the smallest surviving cluster and read the meeting backwards.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the household key",
          why: "Baskets attach to households through c.id = o.customer_id, and COUNT(DISTINCT customer_id) folds 45 baskets back to 8 households — the member grain the loyalty team reads. Joining on o.id mismatches keys and empties the board.",
        },
      ],
      distractors: ["'pending'", "ASC", "id", "20", "2"],
      walkthrough:
        "A cluster board is four folds in one: a census, a distinct-count, two money folds and a conditional arm — with a gate that decides what the review sees. GROUP BY region folds 103 baskets into 4 clusters; the join through customer_id lets COUNT(DISTINCT o.customer_id) report households beside baskets (EU 45 over 8, APAC 37 over 5, US 19 over 2). The lost arm tallies cancelled baskets — 3, 3, 1 — and the HAVING gate at 19 admits exactly the clusters with real volume, dropping LATAM's 2 baskets at a 426.22 average (a one-household sample that flatters every average it touches). ORDER BY revenue DESC leads with EU 15089.23. The distractors encode the board bugs: 'pending' mislabels the awaiting pile as lost; ASC reads the meeting from the smallest cluster; the wrong join key empties the board entirely; 20 deletes the US row the gate was calibrated to keep; 2 re-admits LATAM. Gate, grain, arm, order — each is a decision the query makes visible.",
    },
    {
      id: "cs-sephora-2",
      tier: "medium",
      topic: "s6",
      universe: "funnel",
      title: "The dispatch-state pivot",
      brief:
        "Sephora-flavored case on the storefront db (orders = baskets, shipped_at = dispatch timestamp): ops opens the morning on the dispatch pivot — landed versus in-transit baskets per market cluster — and the ops lead is explicit: 'clusters under 21 landed baskets are a sample, not a market — gate them.' Probed facts: the status × cluster grid reads EU 24 landed / 12 in transit of 45 baskets, APAC 21 / 8 of 37, US 5 / 10 of 19, LATAM 2 / 0 of 2 — and the platform funnel is 52 delivered, 30 shipped, 14 pending, 7 cancelled. The 21-basket gate lands exactly on APAC's landed count — the thinnest cluster ops still trusts.",
      ask: "Return per market cluster: baskets, landed baskets and in-transit baskets — most landed first, gated at 21+ landed.",
      template:
        "SELECT c.region,\n       COUNT(*) AS baskets,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS landed,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS in_transit\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) >= {3}\nORDER BY landed {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the landed arm",
          why: "Landed baskets are the ones that finished the journey: status = 'delivered' gives EU 24 and APAC 21. 'Pending' would print 6 and 5 — the awaiting pile standing in for the landed column.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the in-transit arm",
          why: "In-transit means dispatched and moving: status = 'shipped' gives EU 12 and APAC 8. 'Cancelled' would print 3 and 3 — a real number wearing the wrong state's name.",
        },
        {
          answer: "21",
          kind: "number",
          label: "the materiality gate",
          why: "HAVING the delivered-arm >= 21 keeps EU (24) and APAC (21) and drops US (5) and LATAM (2). 21 is also a result cell — APAC's landed count — so the gate and the smallest surviving cluster are the same number.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the most-landed-first order",
          why: "The board leads with the deepest fulfillment: EU 24, then APAC 21. ASC would open on APAC — the boundary cluster the gate nearly cut — and frame the meeting around the thinnest sample.",
        },
      ],
      distractors: ["'pending'", "'cancelled'", "22", "0", "ASC"],
      walkthrough:
        "A state pivot is two conditional arms over one fold, with the gate ON the arm the business cares about. The join attaches the cluster key; GROUP BY region folds 103 baskets into 4; the two SUM(CASE …) arms split placed demand into landed (delivered: EU 24, APAC 21) and in-transit (shipped: EU 12, APAC 8). The HAVING gate counts landed baskets — not all baskets — so US's 19-basket cluster (5 landed) and LATAM's 2 (0 landed) drop as samples. ORDER BY landed DESC leads with EU. The distractors encode the pivot bugs: 'pending' in either arm swaps the awaiting pile into a fulfillment column; 'cancelled' swaps lost demand; 22 cuts APAC at the boundary and leaves EU alone; 0 lets the gate through everything including LATAM's zero-landed row — a cluster with no fulfillment reading as a market; ASC inverts the lead. Two arms, one gate, one order — four decisions, and each distractor breaks exactly one.",
    },
  ],

  problems: [
    { slug: "top-earners", why: "Top-earner ranks with ties — the Insider spend-ladder shape: households folded by lifetime value, ties sharing rungs honestly. Curated fill." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Household-volume argmax — the 24-basket power member at the top of the tier ladder, decided on a grouped count. Curated fill." },
    { slug: "unique-orders-and-customers-per-month", why: "Two-grain monthly census — baskets AND distinct households per month, the opening read of the loyalty review. Curated fill." },
    { slug: "product-sales-analysis-i", why: "Per-SKU units and revenue from scan lines — the counter team's first demand read, folded at SKU grain without the fan-out. Curated fill." },
    { slug: "product-sales-analysis-ii", why: "Per-SKU demand in a date window — the launch retro read: which SKUs the event month actually moved. Curated fill." },
    { slug: "sales-analysis-iii", why: "Buyers who bought one line but never another — the sampling follow-through read: who tried the counter and never came back. Curated fill." },
    { slug: "combine-two-tables", why: "LEFT JOIN profile fill — household attributes carried onto every basket without dropping the rows the loyalty file hasn't enriched yet. Curated fill." },
    { slug: "employee-bonus", why: "Conditional reward fold — the Insider bonus shape: a reward applied under a stated rule, zeroed everywhere else. Curated fill." },
    { slug: "the-most-recent-three-orders", why: "Recency top-N per member — the counter-team call list: the latest three baskets per household, ranked deterministically. Curated fill." },
    { slug: "monthly-transactions-ii", why: "Month census with a value gate — the promo-month read: months where basket value cleared the bar, HAVING-gated. Curated fill." },
    { slug: "customer-order-frequency", why: "Repeat cadence inside a window — the replenishment rhythm read: which households order often enough to hit auto-refresh. Curated fill." },
    { slug: "ratings-histogram", why: "Review-rating histogram — the beauty-review board: ratings banded into buckets, the voice-of-customer fold merch reads weekly. Curated fill." },
    { slug: "find-books-with-polarized-opinions", why: "Polarized-feedback census — the hero-or-hype SKU screen: products loved and hated in the same fold, never middling. Curated fill." },
    { slug: "fix-product-name-format", why: "SKU-name hygiene before a join — the catalog cleanup pass that keeps 'Serum' and 'SERUM ' from splitting one product's demand. Curated fill." },
    { slug: "group-sold-products-by-the-date", why: "Daily basket fold into a list — the store-bin packing read: SKUs per day folded into one cell the pickers read. Curated fill." },
    { slug: "bank-account-summary", why: "Per-account in-and-out fold with NULL arms — the settlement ledger: bills, payouts and net per invoice, coverage classified honestly. Curated fill." },
  ],
};
