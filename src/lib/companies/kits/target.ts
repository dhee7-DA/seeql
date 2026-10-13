// Target — kit 9 of the E-commerce & Marketplace domain (Batch K, wave 6).
// US big-box retail, omnichannel edition: stores racing the same-day clock
// (Drive Up, Order Pickup, Shipt), Circle-member promos, and a fulfillment
// network where every basket carries a store-vs-ship decision and a SLA.
// Pool provenance: the Target tag set carries 3 tagged sql rows in this app's
// pools (find-stores-with-inventory-imbalance, rearrange-products-table,
// basket-depth-aov) — all 3 lead the problem pool and anchor topics; the
// remaining fills are theme-curated from scripts/company-pools.md's theme
// menu to mirror workflows Target screens are known to probe (SLA math,
// kept-basket denominators, promo-window reads, region boards, cents
// discipline). Case studies run on the storefront db with probed figures
// from scripts/company-facts.md — mapped honestly as customers=Circle member
// households, orders=baskets (store pickup + ship), order_items=scanned
// lines, products=SKUs, suppliers=owned-brand vendors, shipped_at=fulfillment
// timestamp, regions=market clusters. Extended probe receipts (SLA-3d counts
// 1/10/26/20; supplier units 82/109/77; 2024-07 mix 2 cancelled, 2 delivered,
// 1 pending, 3 shipped) live in the worklog.

import type { CompanyKit } from "../types";

export const targetKit: CompanyKit = {
  id: "target",
  domainId: "ecom",
  name: "Target",
  tagline: "US big-box retail: stores, circles, same-day fulfillment",
  accent: "text-red-500",

  brief: [
    "**Target** is the US big-box retailer that made the store itself the fulfillment node — **Drive Up**, Order Pickup and same-day networks turned 1,900+ parking lots into the last mile, while {rose:Circle} membership and Circle Week drive the promo calendar. The analyst's grain stack mirrors the storefront: member households place baskets, baskets scan as lines, lines carry SKUs from owned-brand vendors. On this kit's proxy db the census reads **16 member households**, **103 baskets** fanning into **251 scanned lines**, $34,833.28 total demand at an average basket of **$338.19** — a db you can hold in your head, shaped exactly like the omnichannel read you'd run at HQ.",
    "The data org lives on the fulfillment clock. Status is the funnel: **52 delivered**, **30 shipped**, **14 pending**, {rose:7 cancelled} — and `shipped_at` is non-NULL for exactly **82 of 103 baskets**, averaging **2.98 days** to fulfill with a 2-to-4 day range. The same-day promise is a distribution, not a slogan: the US cluster runs slowest at **3.07 days** across 15 fulfilled baskets while APAC leads at 2.93 over 29, and an analyst who can't narrate *which population a latency average covers* (fulfilled only — pending baskets have no latency YET) gets exposed in the first round. *The store-vs-ship split is a CASE expression away, and interviewers know it.*",
    "Interview style is omnichannel-flavored and denominator-first. Screens open with a warm-up join (baskets to member households, lines to SKUs), escalate into a threshold census (repeat {emerald:Circle} members — 14 of 16 households here have 2+ baskets), then land on the two Target signatures: a **region SLA board** (fulfilled counts, latency to 2 decimals, within-SLA tallies, slowest cluster first) or a **promo-month read** (Circle Week months where basket count held but revenue collapsed — July 2024 did 8 baskets for 1193.86, the year's worst, with 2 cancellations). Follow-ups are spoken: 'is that per basket or per household?', 'does a cancelled basket count in your placed base?', 'what does your SLA gate exclude?'",
    "Preparation strategy: Target carries **3 tagged problems** in this app's registry (store-inventory imbalance, product-table reshuffle, basket depth & AOV) — all three lead the problem pool and anchor the topic list. The rest is theme-curated from the band: SLA date math, kept-basket rates, region leaderboards, promo windows, cents discipline on the settlement tables (invoices and payments store INTEGER cents — the dollar read is `amount_cents / 100.0`). The two case studies run on the live db: one rebuilds the **region SLA board** fulfillment ops opens every morning, the other rebuilds the **promo-month miss** read that opens the month-close deck. Both are mechanically audited against the probed figures.",
  ],

  dayInLife: [
    "**08:15 —** The day opens on the fulfillment board, and the first query is always the same reconciliation: did last night's basket stream land, do line sums tie to basket totals, does the status census reconcile to `COUNT(*)` — **52 delivered, 30 shipped, 14 pending, 7 cancelled** on the current fold. The latency tile is next: **2.98 days average across the 82 fulfilled baskets**, and the analyst's eye goes straight to the regional split before anything else, because the US cluster at **3.07 days** is the one the ops lead pings about. A pending pile that grew overnight is the day's first fire — 14 baskets sit unfulfilled, and the analyst who can write the aging query owns the standup.",
    "**10:30 —** Mid-morning is the deep-dive block. The store-vs-ship question lands from ops: which market clusters actually make the 3-day promise — the census is a per-region fold with a latency CASE arm, and on this db **57 of 82 fulfilled baskets** make it inside 3 days (EU 26, APAC 20, US 10, LATAM 1). The trap the analyst narrates out loud: pending baskets carry NULL `shipped_at`, and a CASE without the population filter silently drops them into the ELSE bucket — *a bucket the deck would read as 'over SLA' when the truth is 'not yet'*. Every deep-dive ends with the definition written beside the number: fulfilled population = `shipped_at IS NOT NULL`, period.",
    "**14:00 —** The afternoon tilts to stakeholder cycles. Marketing wants the Circle Week retro: July's promo drove **8 baskets** but only **1193.86** — the worst revenue month of 2024 — with 2 cancellations, and the argument is whether the discount cannibalized basket value or the mix just skewed cheap. Finance wants the settlement read: invoices and payments store INTEGER cents, so the dollar fold is `amount_cents / 100.0`, and the split-payment hunt (`GROUP BY invoice_id HAVING COUNT(*) > 1` — five such invoices here) is the hygiene check before the close. Each ask ships with its SQL attached, because *a number without its query is treated as a rumor in a retailer that audits its own dashboards*.",
    "**17:30 —** The day closes in review mode. The region SLA board ships: US 3.07 days over 15 fulfilled baskets, EU 2.94 over 36, APAC 2.93 over 29 — slowest first, within-SLA tallies beside every average, and the {emerald:repeat-member} census attached for the loyalty team (14 of 16 households with 2+ baskets, top household at **24 baskets**). Tomorrow's two must-reconcile numbers are written down: the pending aging pile and the July promo variance. In an omnichannel retailer the next shift inherits queries the store ops team will read at 7am — so the population definitions ride in the query comments, not in anyone's memory.",
  ],

  metrics: [
    { name: "Fulfillment latency", what: "Days from basket placement to fulfillment on the 82 baskets carrying `shipped_at` — 2.98 average, 2-to-4 range. Population stated first: pending baskets have no latency YET." },
    { name: "SLA hit rate", what: "Share of fulfilled baskets inside the 3-day promise — 57 of 82 on the current fold (EU 26, APAC 20, US 10, LATAM 1). The store-vs-ship scoreboard, and a CASE-arm census in interview form." },
    { name: "Kept-basket share", what: "Non-cancelled baskets ÷ placed — 7 of 103 cancel (6.8%). The denominator rule (cancelled stays in the placed base) is the whole test." },
    { name: "Average basket", what: "Revenue per basket — $338.19 across 103 baskets ($34,833.28 total). The number every promo retro argues against: did the event lift baskets, value, or neither." },
    { name: "Repeat-member rate", what: "Share of households with 2+ baskets — 14 of 16 here. The Circle-loyalty KPI growth lives by, and a HAVING-gated census in interview form." },
    { name: "Big-ticket mix", what: "Baskets at 500+ total — 25 of 103, with only 9 delivered so far. The margin story and the delivery-risk story share this one number." },
    { name: "Cluster fulfillment pace", what: "Latency by market cluster on the fulfilled population — US 3.07 (15 baskets), EU 2.94 (36), APAC 2.93 (29). The regional board the ops lead reads first." },
    { name: "Promo-month resilience", what: "Event-month baskets vs revenue vs cancellations — July 2024: 8 baskets, 1193.86 revenue, 2 cancelled. The read that decides whether Circle Week repeats next year." },
  ],

  topics: [
    {
      name: "The same-day clock: date math",
      why: "Target's whole fulfillment story is a duration: `JULIANDAY(shipped_at) − JULIANDAY(created_at)` on the 82 fulfilled baskets, bucketed by cluster and compared to the 3-day promise. Screens drill the mechanics — strftime buckets, date diffs, the NULL-until-fulfilled population — because an analyst who averages latency over all 103 rows has silently averaged over rows that don't have the second timestamp yet.",
      slugs: ["find-golden-hour-customers", "convert-date-format", "the-latest-login-in-2020"],
    },
    {
      name: "Status pipelines and kept demand",
      why: "Placed is not kept: 103 baskets minus 7 {rose:cancelled} is the kept base, and 'orders placed vs orders kept' is the sentence every Target screen circles. The drill is conditional counting — status arms, delivered tallies, cancelled rates with the denominator decided BEFORE the ratio, not after the meeting.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "monthly-transactions-ii"],
    },
    {
      name: "Store-vs-ship channel splits",
      why: "Every basket is a channel decision, and ops reads the business as two labeled populations side by side — pickup-style vs ship-style, one query, two arms. Self-join comparisons and platform-attribution pivots are the exact shapes, and the trap is always the same: two populations in one column with no label is a chart nobody can act on.",
      slugs: ["apples-and-oranges", "user-purchase-platform", "sales-by-day-of-the-week"],
    },
    {
      name: "Basket depth and AOV",
      why: "Units per basket beside revenue per basket is how merch separates big baskets from expensive ones — a promo that lifts units while AOV falls is a Circle Week story, not a win. The tagged basket-depth problem leads this drill; the weighted-mean follow-up is where blended AOV across formats gets honest.",
      slugs: ["basket-depth-aov", "calculate-compressed-mean", "spend-histogram"],
    },
    {
      name: "Inventory imbalance and stock cover",
      why: "Store fulfillment dies at the shelf: the tagged imbalance census finds lopsided stock pools before the weekend rush, and weeks-of-supply converts trailing demand into a restocking clock. The drills pair a stock-vs-sold fold with a cover ratio — the two queries a store-ops analyst writes before every holiday.",
      slugs: ["find-stores-with-inventory-imbalance", "weeks-of-supply", "warehouse-manager"],
    },
    {
      name: "Region boards and ranking windows",
      why: "The ops review opens with cluster leaderboards — fulfillment pace, basket counts, kept shares — ranked and tie-proofed. RANK vs DENSE_RANK vs ROW_NUMBER is not trivia here: monthly basket counts tie five ways in 2024 (8, 8, 8, 8, 8), and a board that splits ties silently invents a ranking nobody agreed to.",
      slugs: ["rank-scores", "sort-the-olympic-table", "department-top-three-salaries"],
    },
    {
      name: "The two-grain census",
      why: "Baskets AND households per cluster is the opening read of the omnichannel review — and the trap is counting both at one grain. COUNT(*) counts baskets (103); COUNT(DISTINCT customer_id) counts households (16); the gap is visit intensity, which is the number store ops actually manages.",
      slugs: ["daily-leads-and-partners", "students-and-examinations", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Promo windows and event reads",
      why: "Circle Week is a window, not a mood: half-open date predicates and period-threshold folds decide which baskets count as event baskets. The drills pair an in-period filter with a quantity floor — the exact shape of 'event baskets with 3+ lines' — and the classic BETWEEN-on-the-last-day bug is a standing interview question.",
      slugs: ["list-the-products-ordered-in-a-period", "friday-purchases-i", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "Rates with honest denominators",
      why: "Fulfillment rates, kept shares, repeat rates — Target's ratios punish integer division and quiet population swaps. The house habit: 100.0 before the division, the denominator's population stated in the subtitle, rounding only at the very end — because a 66 instead of 66.67 on the SLA board is a cluster that gets yelled at for the wrong reason.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "average-selling-price"],
    },
    {
      name: "Reshaping the shelf: pivots and hygiene",
      why: "Two of the three tagged Target rows are reshape problems, and that's not an accident — planogram thinking is pivot thinking. Rearranging attributes into columns, normalizing SKU names before a join, reformatting crosstabs: the drills that turn a raw catalog dump into the board the merchant review reads.",
      slugs: ["rearrange-products-table", "reformat-department-table", "fix-product-name-format"],
    },
  ],

  theory: [
    {
      id: "target-t1",
      q: "Baskets join to member households on one key and to SKUs through the scan lines. In an omnichannel read, when do you insist on a LEFT JOIN, and what does an INNER join silently drop?",
      a: "The join follows the spine of the question. If the question is demand-shaped — basket counts per cluster, latency by region, promo-month revenue — the basket stream is the spine and INNER joins attaching household attributes are right, because every unmatched row would distort a rate built on basket counts. If the question is supply-shaped — SKUs that never scanned, households that lapsed — the dimension table is the spine and LEFT JOIN + IS NULL is the only honest shape: INNER drops exactly the rows you're hunting for. The omnichannel discipline is doing both directions deliberately and saying which side is the spine before the FROM clause. One honesty note this db earns: every household HAS ordered and every basket resolves to a member (zero never-ordered rows on both sides), so INNER and LEFT coincide here — which is exactly why the interviewer asks you to reason about the shape instead of leaning on the data to save you.",
      tag: "joins",
    },
    {
      id: "target-t2",
      q: "Rank market clusters on the SLA board for the morning ops review. Where do RANK, DENSE_RANK and ROW_NUMBER disagree, and which one ships?",
      a: "They disagree exactly where the metric ties, and ties are everywhere in this business: 2024's monthly basket counts tie five ways at 8, latency buckets tie at 27/30/25 orders, clusters share pace to the second decimal. RANK gives tied rows the same rung and skips the next (1, 2, 2, 4) — the gap implies a missing cluster that doesn't exist. DENSE_RANK shares the rung and keeps the sequence compact (1, 2, 2, 3). ROW_NUMBER splits the tie arbitrarily unless you add a deterministic tie-breaker like region name, which makes it the dedupe tool, not the board tool. The ops review ships DENSE_RANK with an explicit secondary sort: boards are read as 'who's nth', a skipped rung generates a meeting about a cluster that was never there, and a deterministic tie-break keeps the board identical between the 8am run and the 4pm re-run. The LIMIT-1-OFFSET-1 'second place' habit breaks on every tie; the honest second place is DENSE_RANK = 2, ties included.",
      tag: "windows",
    },
    {
      id: "target-t3",
      q: "On the baskets table — 103 rows, 251 scan lines after the join, 16 households — narrate what COUNT(*), COUNT(shipped_at) and COUNT(DISTINCT customer_id) each return, and which grain each serves.",
      a: "Three numbers, three grains, all true at once. COUNT(*) is 103 — every basket, the placed denominator for kept-share and repeat-rate work. COUNT(shipped_at) is 82 — the fulfilled subset, because COUNT skips NULLs; the gap between 103 and 82 IS the 14 pending plus 7 cancelled, and the gap is a fulfillment signal, not a data bug. COUNT(DISTINCT customer_id) is 16 — repeat baskets folded back to households, the audience grain. And after the scan-line join a fourth number appears: COUNT(*) becomes 251 — lines, not baskets — which is why basket AOV (34833.28 ÷ 103 = 338.19) and line value (÷ 251) are different metrics that share a numerator. The omnichannel trap is reporting one grain under another's name: 'baskets per household' computed as baskets ÷ households is an intensity (6.4), not a rate, and reads as nonsense the first time a store lead asks what it means. The strong answer assigns a grain to every COUNT out loud.",
      tag: "aggregation",
    },
    {
      id: "target-t4",
      q: "`shipped_at` is NULL until a basket is fulfilled, and cancelled baskets never get one. What is your NULL policy for the latency metric and for a within-SLA CASE arm?",
      a: "Define who has the metric, state it, never launder the hole. For latency, the population is the 82 fulfilled baskets: WHERE shipped_at IS NOT NULL is correct and the subtitle says so — 2.98 days average, 2-to-4 range. The subtle bug is the unfiltered version 'working anyway': AVG skips NULL rows silently, so it returns the same 2.98 — the number is right while the denominator discipline is broken, and the day a rate rides beside it (within-SLA ÷ basket count) the NULLs corrupt the share. For a CASE arm the failure is louder: a within-3-days flag without the population filter sends every pending basket to the ELSE bucket, and the deck reads 21 unfulfilled baskets as 'over SLA'. Three NULL behaviors to narrate: filters (NULL fails = and !=), aggregates (COUNT(col) skips, COUNT(*) keeps), comparisons (NULL <= 3 is UNKNOWN, not FALSE). The habit being graded: a WHERE clause doing definitional work without saying so, in a retailer where store ops reads the board at 7am.",
      tag: "nulls",
    },
    {
      id: "target-t5",
      q: "'Only show clusters with at least 15 fulfilled baskets' — WHERE or HAVING, and why can't the other clause see the count at all?",
      a: "HAVING, because the fulfilled count is a group fact: it exists only after GROUP BY region folds the baskets and COUNT tallies it. Logical evaluation runs FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — WHERE executes before groups form, so the count literally does not exist yet and the engine throws 'no such column'. The split that predicts every placement: row predicates in WHERE (status = 'delivered', shipped_at IS NOT NULL — filters that shrink the fold's input, like excluding cancelled baskets BEFORE counting), group predicates in HAVING (count floors, pace thresholds — filters that keep or kill folds). The subtlety worth saying out loud: a WHERE on the right-table column after a LEFT JOIN silently converts the join to INNER — filter the unmatched rows' survival into the ON clause or accept the downgrade deliberately. On the SLA board the HAVING gate at 15 keeps US, EU and APAC and drops the 2-basket cluster — a materiality decision the deck should own, not the WHERE clause hide.",
      tag: "pipeline",
    },
    {
      id: "target-t6",
      q: "You need each SKU's promo price as of a given date, where the price history only has rows for changes. Walk me through the scalar-subquery shape — and what happens when a SKU never repriced.",
      a: "The as-of lookup is a correlated scalar: for each SKU, SELECT price FROM price_history WHERE sku_id = p.id AND changed_on <= :date ORDER BY changed_on DESC LIMIT 1 — the latest change before the cutoff. The contract matters: a scalar subquery is 0-or-1 rows, and the zero case is the whole question — a SKU that never repriced returns NULL, not an error, and every display or comparison against NULL needs a stated policy. The Target-flavored fix is a deliberate fallback: COALESCE((subquery), p.current_price) — 'if no change on record, the current price IS the as-of price' — which turns a data gap into a documented definition. The correlated cost is real: the inner query re-runs per outer row, fine at 16 SKUs and a full scan at 16 million, so at scale you stage the latest-per-SKU window in a CTE and join. Saying which population the inner fold covers — repriced versus never-repriced — is exactly what the follow-up is fishing for.",
      tag: "subqueries",
    },
    {
      id: "target-t7",
      q: "Basket and fulfillment timestamps arrive as TEXT. How do you bucket them by month, diff them in days, and where does each approach break?",
      a: "Three tools, three caveats. Buckets: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on ISO text — both give '2024-07', and the SUBSTR shortcut works only while the format stays fixed-width ISO; one loose timestamp and the promo retro quietly mis-buckets. Diffs: JULIANDAY(shipped_at) − JULIANDAY(created_at) returns fractional days — this db's 2.98-day average is exactly that, rounded once at the END, not per row; rounding per row then averaging is a different, wrong metric. Windows: half-open intervals — created_at >= '2024-07-01' AND < '2024-08-01' — never BETWEEN on the last day, which double-counts midnight baskets on event boundaries. The deeper breaks: shipped_at is NULL until fulfillment, so every latency fold states its population first (82 of 103), and promo windows must anchor to a stated event calendar, not to whatever the max timestamp happens to be. State the convention, then query it — never the reverse.",
      tag: "dates",
    },
    {
      id: "target-t8",
      q: "Vendor settlements must reconcile: invoices, payments and expenses all store INTEGER cents, and payments can arrive as two rows on one invoice. How do you keep the fold honest?",
      a: "Two disciplines. Units: every dollar read is amount_cents / 100.0 — the .0 promotes to real arithmetic before the division, because integer ÷ integer truncates and a 4459-cent invoice prints as 44 dollars; divide once, at the display edge, after the fold. Duplicates: GROUP BY invoice_id HAVING COUNT(*) > 1 finds the split-settlement invoices — five on this db (ids 1, 5, 12, 19, 22) — and collapsing them is a DECISION, not a default: folding two genuine part-payments into one hides a shortfall, so the honest version classifies coverage first (exact 21, partial 1, none 6) and only then dedupes the display layer. The known anomaly classes to hunt: a void invoice that still carries a payment (id 11, 925 dollars) and a paid invoice with zero payment rows (id 28) — vendor statements exist to catch exactly these. Detect with an aggregate, dedupe with a deterministic tie-break, and be able to say which rows your dedupe discarded and why the business agreed to lose them.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "target-mcq-1",
      prompt: "The baskets table holds 103 rows. Which count pairs explain the fulfillment gap the ops board shows?",
      choices: [
        "COUNT(*) = 103 baskets, COUNT(shipped_at) = 82 fulfilled — the 21-gap is 14 pending + 7 cancelled",
        "COUNT(*) = 82, COUNT(shipped_at) = 103 — shipped_at backfills the total",
        "COUNT(*) = 103, COUNT(shipped_at) = 103 — NULLs count as zero dates",
        "COUNT(shipped_at) = 96 — cancelled baskets carry timestamps too",
      ],
      answer: 0,
      why: "COUNT(*) counts every row (103); COUNT(shipped_at) skips NULLs (82 fulfilled). The 21-basket gap decomposes exactly into 14 pending + 7 cancelled — a fulfillment signal, not missing data.",
      notes: [
        { choice: 2, why: "COUNT(col) never counts NULLs — that's its whole difference from COUNT(*). If it counted NULL dates, the two counts would always tie and the column would be pointless." },
        { choice: 3, why: "Cancelled baskets have no fulfillment timestamp — 82 includes only delivered (52) + shipped (30). The census is a status read before it's a date read." },
      ],
      difficulty: "easy",
    },
    {
      id: "target-mcq-2",
      prompt: "Ops asks for the platform's average fulfillment latency. Which population does the honest 2.98-day number cover?",
      choices: [
        "All 103 baskets — pending baskets count as 0 days",
        "The 82 baskets with shipped_at set — pending has no latency YET",
        "Only the 52 delivered baskets — in-transit doesn't count",
        "All baskets with any status except cancelled",
      ],
      answer: 1,
      why: "Latency is julianday(shipped_at) − julianday(created_at), which only exists for fulfilled baskets: WHERE shipped_at IS NOT NULL, 82 rows, average 2.98, range 2-to-4. Pending baskets are 'not yet', not 'instant'.",
      notes: [
        { choice: 0, why: "COALESCE-ing missing fulfillment to 0 days invents same-second delivery — the board would flash a sub-day average during exactly the backlog the metric exists to catch." },
        { choice: 2, why: "Dropping the 30 in-transit baskets narrows the population silently — they carry real latencies (2-to-4 days) and belong in the fulfilled fold." },
      ],
      difficulty: "easy",
    },
    {
      id: "target-mcq-3",
      prompt: "A vendor's monthly rent expenses total 16800 in the expenses table. Which expression prints the dollar figure?",
      choices: [
        "amount_cents / 100",
        "ROUND(amount_cents / 100.0, 2)",
        "amount_cents * 100",
        "ROUND(amount_cents, 2)",
      ],
      answer: 1,
      why: "Dividing by 100.0 promotes to real arithmetic before the division; rounding once at the display edge keeps 168.00. Expenses, invoices and payments all store INTEGER cents on this db.",
      notes: [
        { choice: 0, why: "Integer ÷ integer truncates in SQLite — fine on whole-dollar rows, silently wrong the first time an odd-cent expense lands. The .0 is the fix, not a style choice." },
        { choice: 2, why: "Multiplying turns cents into 1680000 — units inverted. Magnitude-check every money fold: dollars are smaller than cents, never larger." },
      ],
      difficulty: "easy",
    },
    {
      id: "target-mcq-4",
      prompt: "The SLA board gates clusters at 15+ fulfilled baskets. With US 15, EU 36, APAC 29, LATAM 2 — which clause keeps the right rows?",
      choices: [
        "WHERE COUNT(*) >= 15",
        "HAVING COUNT(*) >= 15",
        "LIMIT 15",
        "WHERE shipped_orders > 15",
      ],
      answer: 1,
      why: "The count is a group fact — it exists only after GROUP BY region folds the 82 fulfilled baskets, so the gate is HAVING. That keeps US (15), EU (36), APAC (29) and drops LATAM (2) — a materiality cut the deck states out loud.",
      notes: [
        { choice: 0, why: "WHERE runs before groups form — COUNT(*) doesn't exist yet and the engine rejects it. The error message is the pipeline order teaching itself." },
        { choice: 3, why: "Strict > drops US (15 is not > 15) — the cluster the board exists to watch. Boundary operators are the quiet way boards lose their headline row." },
      ],
      difficulty: "medium",
    },
    {
      id: "target-mcq-5",
      prompt: "US cluster: 15 fulfilled baskets, 10 inside the 3-day promise. Which fold returns the 10?",
      choices: [
        "COUNT(CASE WHEN latency_days <= 3 THEN 1 END)",
        "SUM(CASE WHEN latency_days <= 3 THEN 1 ELSE 0 END)",
        "COUNT(*) FILTERED BY latency_days <= 3",
        "SUM(latency_days <= 3)",
      ],
      answer: 1,
      why: "SUM over a 1/0 CASE arm is the portable conditional-count fold: 10 for the US cluster, and the ELSE 0 keeps the arm numeric across every row. (SQLite also accepts the choice-0 shape — but the ELSE-0 SUM is the form that survives every engine and every reviewer.)",
      notes: [
        { choice: 2, why: "FILTERED BY isn't SQL — the keyword is FILTER (WHERE …), and knowing the real syntax is part of the test. A wrong keyword here is a screen-ender, not a typo." },
        { choice: 3, why: "SUM of a boolean works in SQLite (TRUE folds to 1) but reads as a hack in review — and on engines without boolean-to-int promotion it breaks. State the fold, don't lean on the dialect." },
      ],
      difficulty: "medium",
    },
    {
      id: "target-mcq-6",
      prompt: "Circle Week ran July 1–31, 2024. Which predicate captures exactly the event baskets?",
      choices: [
        "created_at BETWEEN '2024-07-01' AND '2024-07-31'",
        "created_at >= '2024-07-01' AND created_at < '2024-08-01'",
        "STRFTIME('%Y-%m', created_at) = '2024-07' AND created_at <> '2024-07-31'",
        "created_at LIKE '2024-07%'",
      ],
      answer: 1,
      why: "The half-open window [Jul 1, Aug 1) captures every timestamp in the month including July 31's evening baskets. On ISO-8601 text it's also index-friendly and boundary-explicit — the house style for event windows.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive on both ends — any July 31 basket stamped with a time component (e.g. '2024-07-31 14:22') falls after '2024-07-31' and drops out of the event silently." },
        { choice: 3, why: "LIKE '2024-07%' works on this TEXT format but hides the boundary logic in a pattern — one non-ISO timestamp in the stream and the event read mis-buckets without an error." },
      ],
      difficulty: "medium",
    },
    {
      id: "target-mcq-7",
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
      id: "target-mcq-8",
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
      id: "target-mcq-9",
      prompt: "US cluster: 10 of 15 fulfilled baskets make the 3-day SLA. Which expression prints the hit rate as 66.67?",
      choices: [
        "100 * 10 / 15",
        "ROUND(100.0 * 10 / 15, 2)",
        "ROUND(10 / 15, 2) * 100",
        "100.0 * 10 / 15 without rounding, formatted downstream",
      ],
      answer: 1,
      why: "100.0 promotes to real arithmetic before the division: 66.666…, rounded once at the display edge to 66.67. The .0 placement is the whole fix — integer math is the standing bug in every rate Target reports.",
      notes: [
        { choice: 0, why: "100 * 10 / 15 is integer division end-to-end in SQLite: 1000 / 15 truncates to 66 — the board shows 66 and the cluster gets yelled at for a rounding bug it didn't make." },
        { choice: 2, why: "10 / 15 is 0 in integer math — the rate reads 0.00 before the multiplication can save it. Promote FIRST, round LAST." },
      ],
      difficulty: "hard",
    },
    {
      id: "target-mcq-10",
      prompt: "You band ALL 103 baskets with CASE WHEN julianday(shipped_at) - julianday(created_at) <= 3 THEN 'in_sla' ELSE 'late' END. How many baskets land in 'late'?",
      choices: [
        "25 — exactly the 4-day baskets",
        "46 — the 25 four-day baskets plus 21 unfulfilled baskets swept into ELSE",
        "21 — only the unfulfilled baskets",
        "0 — NULL latency sorts as fastest",
      ],
      answer: 1,
      why: "57 fulfilled baskets are within 3 days, 25 sit at 4 days — and the 21 baskets with NULL shipped_at (14 pending + 7 cancelled) fail the WHEN arm because NULL <= 3 is UNKNOWN, silently joining the 'late' bucket: 25 + 21 = 46. The population filter isn't pedantry; it's the difference between 'late' and 'not yet'.",
      notes: [
        { choice: 0, why: "That's the answer WITH the WHERE shipped_at IS NOT NULL filter — the case is precisely what the filter prevents. The sweep of NULLs into ELSE is the trap the ops deck keeps rediscovering." },
        { choice: 3, why: "NULL never sorts as fastest or slowest in a comparison — it yields UNKNOWN and the row falls through. Reporting 0 'late' baskets during a backlog is how the board lies." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-target-1",
      tier: "medium",
      topic: "j7",
      universe: "funnel",
      title: "The region SLA board",
      brief:
        "Target-flavored case on the storefront db (customers = Circle member households, orders = baskets, shipped_at = fulfillment timestamp): fulfillment ops opens every morning on the region SLA board — which market clusters actually make the 3-day promise — and the ops lead is explicit about the contract: 'fulfilled baskets only, latency to 2 decimals, within-SLA tallies beside every average, and don't show me clusters with single-digit volume.' Probed facts: shipped_at is non-NULL for 82 of 103 baskets (52 delivered + 30 shipped); platform latency averages 2.98 days, range 2-to-4; by cluster the pace reads US 3.07 over 15 fulfilled, EU 2.94 over 36, APAC 2.93 over 29, LATAM 3.5 over 2. The 15-basket gate is the materiality cut that keeps the board honest.",
      ask: "Return per-cluster fulfilled-basket counts, average fulfillment latency to 2 decimals, and within-3-day tallies — slowest cluster first, gated at 15+ fulfilled baskets.",
      template:
        "SELECT c.region,\n       COUNT(*) AS shipped_orders,\n       ROUND(AVG(JULIANDAY(o.shipped_at) - JULIANDAY(o.created_at)), 2) AS avg_days,\n       SUM(CASE WHEN JULIANDAY(o.shipped_at) - JULIANDAY(o.created_at) <= {1} THEN 1 ELSE 0 END) AS within_sla\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.shipped_at IS NOT NULL\nGROUP BY c.region\nHAVING COUNT(*) >= {2}\nORDER BY avg_days {3};",
      slots: [
        {
          answer: "3",
          kind: "number",
          label: "the SLA threshold in days",
          noVerify: true,
          why: "The same-day promise is 3 days: latency days are whole numbers here (2, 3, or 4), so <= 3 is the promise line. A 2-day gate would slash the tallies to the fastest tier; a 4-day gate would read 100% — a promise nobody misses is a promise nobody believes.",
        },
        {
          answer: "15",
          kind: "number",
          label: "the materiality gate",
          why: "HAVING COUNT(*) >= 15 keeps the clusters with real volume — US 15, EU 36, APAC 29 — and drops LATAM's 2-basket sample, which is too thin to judge a promise by. 15 is also a result cell (the US fulfilled count), so the gate and the smallest surviving cluster are the same number.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the slowest-first direction",
          why: "The board leads with the problem: US 3.07, then EU 2.94, then APAC 2.93. ASC would open the review on the best-performing cluster and bury the 3.07 pace the ops lead pings about.",
        },
      ],
      distractors: ["2", "ASC", "36", "29"],
      walkthrough:
        "An SLA board is three folds in one: a population filter, a latency average, and a conditional count — in that order. WHERE shipped_at IS NOT NULL fixes the population at 82 fulfilled baskets (52 delivered + 30 shipped; the 14 pending have no latency YET and the 7 cancelled never will). The join to customers attaches the cluster key; GROUP BY region folds 82 baskets into 4 clusters. The CASE arm tallies within-3-day baskets — 10 of 15 for US, 26 of 36 for EU, 20 of 29 for APAC — and the HAVING gate at 15 admits exactly the double-digit clusters (LATAM's 2 baskets at 3.5 days is a story about two orders, not a market). ORDER BY avg_days DESC leads with US 3.07. The distractors encode the board bugs: a 2-day SLA cuts every tally roughly in half (US 4, EU 12, APAC 11) and turns the promise into fiction; ASC crowns the fastest cluster and buries the laggard; gates of 36 or 29 silently drop clusters the review expects to see — 36 leaves EU alone, 29 drops the US row the ops lead reads first. Population, promise, gate, order: each is a decision the query makes visible.",
    },
    {
      id: "cs-target-2",
      tier: "easy",
      topic: "t4",
      universe: "month-close",
      title: "July's promo-month miss",
      brief:
        "Target-flavored case on the storefront db (orders = baskets): the month-close review opens with the weakest revenue month of 2024, and the merch lead suspects the story: 'Circle Week drove baskets but not value — pull me the month that proves it.' Probed facts from the monthly trend: 2024 monthly revenue runs from 3731.97 (January) down to a floor of 1193.86, and the floor month is July — 8 baskets, 1193.86 revenue, and 2 cancellations, the year's only month where the event-month basket count held while revenue collapsed. Next-worst months sit far above: 2024-11 at 1648.8 and 2024-06 at 2047.43.",
      ask: "Return the single weakest 2024 month by revenue: month bucket, basket count, revenue to 2 decimals, and cancelled count.",
      template:
        "SELECT STRFTIME('%Y-%m', created_at) AS month,\n       COUNT(*) AS orders,\n       ROUND(SUM(total), 2) AS revenue,\n       SUM(CASE WHEN status = {1} THEN 1 ELSE 0 END) AS cancelled\nFROM orders\nWHERE STRFTIME('%Y-%m', created_at) LIKE {2}\nGROUP BY month\nORDER BY revenue {3}\nLIMIT {4};",
      slots: [
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the cancellation arm",
          why: "The promo-retro definition counts baskets that never kept: status = 'cancelled' tallies July's 2. 'Shipped' would report 3 (July's in-transit count) and 'pending' 1 — both real numbers wearing the cancelled column's name.",
        },
        {
          answer: "'2024-%'",
          kind: "keyword",
          label: "the event-year filter",
          why: "LIKE '2024-%' on the month bucket scopes the fold to the 12 months of 2024. '2025-%' would return January 2025 (1669.50) — a different year, a different argument, and the deck would open on the wrong floor.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the weakest-first direction",
          why: "The ask is the floor: ORDER BY revenue ASC puts 2024-07 (1193.86) on row one. DESC opens the deck with January's 3731.97 — the strongest month wearing the weakest month's headline.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the single-row cut",
          noVerify: true,
          why: "The ask is the single weakest month. LIMIT 1 keeps exactly that row; LIMIT 2 would drag November's 1648.80 into a one-month story and dilute the promo argument.",
        },
      ],
      distractors: ["'pending'", "'shipped'", "'2025-%'", "DESC", "2"],
      walkthrough:
        "A promo-month read is a bucket, a fold, and one conditional arm. STRFTIME('%Y-%m', created_at) buckets 103 baskets into month keys; the LIKE '2024-%' predicate scopes to the 12 event-year months; GROUP BY month folds each into a basket count and a revenue sum rounded once. The cancelled arm is a CASE fold — 2 for July, and July's full mix (2 delivered, 1 pending, 3 shipped) means the distractor literals each produce a different, real-looking number in the wrong column. ORDER BY revenue ASC surfaces the floor: 2024-07 with 8 baskets, 1193.86, 2 cancelled — the only 2024 month where the basket count held (8 is the year's median count) while revenue fell 42% below the January peak of 3731.97. The distractors encode the retro's classic failures: 'pending' or 'shipped' in the arm mislabels the cancellation story; '2025-%' swaps years and headlines 1669.50; DESC crowns January; LIMIT 2 turns a single-month miss into a trend claim the data can't carry. Bucket, scope, fold, order, cut — five decisions, one row of truth.",
    },
  ],

  problems: [
    { slug: "find-stores-with-inventory-imbalance", why: "The tagged imbalance census: which store pools are lopsided before the weekend rush — the shelf-level read behind every Drive Up promise. Tagged Target." },
    { slug: "rearrange-products-table", why: "The tagged shelf reshuffle: pivot SKU attributes into per-row columns — planogram thinking as a query, the catalog warm-up before any band census. Tagged Target." },
    { slug: "basket-depth-aov", why: "The tagged basket fold: units per basket beside revenue per basket — the pairing that separates big Circle baskets from expensive ones. Tagged Target." },
    { slug: "immediate-food-delivery-ii", why: "Kept-share ratio where the denominator is the whole test — the 'orders placed vs orders kept' discipline in textbook clothing. Curated fill." },
    { slug: "find-golden-hour-customers", why: "Speed-to-purchase cohorts on a clock — the same-day-fulfillment read: which members convert inside the promise window. Curated fill." },
    { slug: "unique-orders-and-customers-per-month", why: "Two-grain monthly census — baskets AND distinct households per month, the opening read of the omnichannel review. Curated fill." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Household-volume argmax — the 24-basket power member at the top of the Circle ladder, decided on a grouped count. Curated fill." },
    { slug: "queries-quality-and-percentage", why: "Two rates folded in one pass with the 100.0-before-division fix — the honest-denominator muscle behind every SLA hit rate Target quotes. Curated fill." },
    { slug: "rank-scores", why: "Leaderboard ranks with ties admitted — the cluster board shape, where monthly counts tie five ways and silent tie-splitting invents rankings. Curated fill." },
    { slug: "apples-and-oranges", why: "Two labeled populations side by side in one query — the store-vs-ship comparison ops reads as a paired fold, not two reports. Curated fill." },
    { slug: "weeks-of-supply", why: "Trailing-demand cover in weeks — the restocking clock store teams run before every holiday, expressed as time not units. Curated fill." },
    { slug: "list-the-products-ordered-in-a-period", why: "Promo-window filtering with a quantity floor — half-open date logic plus HAVING, the Circle-Week basket query shape. Curated fill." },
    { slug: "warehouse-manager", why: "Stock-on-hand join aggregate — backroom value folded per location, the warehouse-side read behind fill-rate calls. Curated fill." },
    { slug: "user-purchase-platform", why: "Channel attribution pivot — app vs web vs store-style baskets in one row set, the channel-mix query merch argues with. Curated fill." },
    { slug: "sales-by-day-of-the-week", why: "Weekday sales pivot — the weekend-rush shape that drives store staffing and the Friday inventory countdown. Curated fill." },
    { slug: "calculate-compressed-mean", why: "Weighted mean across a folded population — blended AOV across formats done honestly, where the weighting choice changes the number. Curated fill." },
  ],
};
