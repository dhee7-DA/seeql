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
    "The settlement layer is where the economics get audited, and it reads like a control chart: **28 invoices against 27 payment legs**, a ledger tying at 181080.00 on both sides, and a coverage census with teeth — 21 exact settlements worth 65612.00, 1 partial parked at 4000.00 of 6148.00, and **6 with no payment at all (15217.00)**. The anomaly classes are folklore here: a {rose:void-but-paid} invoice (925.00), a paid invoice with zero payment legs (1756.00 — proof that status is not truth), five split settlements with two legs each, and four odd-cent legs (236150 and 222950 cents) that keep the `amount_cents / 100.0` discipline live. Terms run a flat **30 days** but the paid book settles in 28.4 on average (fastest 13, slowest 84), across rails that split 16 card legs at 37364.00 against 11 wires at 32248.00. *An analyst who prints cents as dollars, or trusts a status column over a join, is a candidate the close cannot use.*",
    "Preparation for the senior rounds is a **four-week ladder**. Week one: census grains and kept-basket denominators — the two-grain reads until `COUNT(*)` vs `COUNT(DISTINCT customer_id)` is reflex. Week two: windows — the {sky:region SLA board} with its 15-basket gate, tie-proof ranking, LAG walks down the month spine. Week three: settlement cents — coverage pivots, split-leg hunts, the anti-join worklist that catches the paid-but-unpaid invoice. Week four: rebuild all six case studies from memory and say every denominator out loud. The problem pool below maps onto that ladder in study order, and every figure in it traces to the probed db — *if you can't name the population behind a number, you're not ready to defend it.*",
  ],

  dayInLife: [
    "**08:15 —** The day opens on the fulfillment board, and the first query is always the same reconciliation: did last night's basket stream land, do line sums tie to basket totals, does the status census reconcile to `COUNT(*)` — **52 delivered, 30 shipped, 14 pending, 7 cancelled** on the current fold. The latency tile is next: **2.98 days average across the 82 fulfilled baskets**, and the analyst's eye goes straight to the regional split before anything else, because the US cluster at **3.07 days** is the one the ops lead pings about. A pending pile that grew overnight is the day's first fire — 14 baskets sit unfulfilled, and the analyst who can write the aging query owns the standup.",
    "**10:30 —** Mid-morning is the deep-dive block. The store-vs-ship question lands from ops: which market clusters actually make the 3-day promise — the census is a per-region fold with a latency CASE arm, and on this db **57 of 82 fulfilled baskets** make it inside 3 days (EU 26, APAC 20, US 10, LATAM 1). The trap the analyst narrates out loud: pending baskets carry NULL `shipped_at`, and a CASE without the population filter silently drops them into the ELSE bucket — *a bucket the deck would read as 'over SLA' when the truth is 'not yet'*. Every deep-dive ends with the definition written beside the number: fulfilled population = `shipped_at IS NOT NULL`, period.",
    "**14:00 —** The afternoon tilts to stakeholder cycles. Marketing wants the Circle Week retro: July's promo drove **8 baskets** but only **1193.86** — the worst revenue month of 2024 — with 2 cancellations, and the argument is whether the discount cannibalized basket value or the mix just skewed cheap. Finance wants the settlement read: invoices and payments store INTEGER cents, so the dollar fold is `amount_cents / 100.0`, and the split-payment hunt (`GROUP BY invoice_id HAVING COUNT(*) > 1` — five such invoices here) is the hygiene check before the close. Each ask ships with its SQL attached, because *a number without its query is treated as a rumor in a retailer that audits its own dashboards*.",
    "**17:30 —** The day closes in review mode. The region SLA board ships: US 3.07 days over 15 fulfilled baskets, EU 2.94 over 36, APAC 2.93 over 29 — slowest first, within-SLA tallies beside every average, and the {emerald:repeat-member} census attached for the loyalty team (14 of 16 households with 2+ baskets, top household at **24 baskets**). Tomorrow's two must-reconcile numbers are written down: the pending aging pile and the July promo variance. In an omnichannel retailer the next shift inherits queries the store ops team will read at 7am — so the population definitions ride in the query comments, not in anyone's memory.",
    "**21:15 —** The after-hours pass is the settlement tie-out. The coverage board rebuilds in one query: **21 exact settlements at 65612.00**, one partial parked at 4000.00 of 6148.00, and the six-invoice unpaid worklist at **15217.00** — with invoice 28 sitting in it on a *paid* status, the standing reminder that status is a claim and the payment join is the fact. The split-leg census runs next (`GROUP BY invoice_id HAVING COUNT(*) > 1` — five invoices), then the ledger proof: debits 181080.00, credits 181080.00, {emerald:delta zero}. Tomorrow's must-reconcile pair goes on the whiteboard — the APAC worklist row and the August expense spike — because at this desk the close doesn't start on the 1st, it starts the night before, `amount_cents / 100.0` at a time.",
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
    { name: "Settlement coverage", what: "Per-invoice payment coverage classified exact / partial / none — 21 exact at 65612.00, 1 partial at 4000.00 of 6148.00, 6 with none at 15217.00. The one-pass fold that catches every anomaly class, including the paid-status ghost." },
    { name: "Payment-rail mix", what: "Card versus wire settlement legs — 16 card payments worth 37364.00 against 11 wires at 32248.00. Method mix drives float and fee load, and both rails fold through `amount_cents / 100.0` before any ratio." },
    { name: "Days-to-settle", what: "Issue-to-payment lag on the 20 paid invoices — 28.4 days average against flat 30-day terms, fastest 13, slowest 84. Denominator stated first: void and open sit out by definition, even when they carry legs." },
    { name: "Vendor unit load", what: "Units shipped per owned-brand vendor — Midwest Hardware Co moves 109 units while Nordic Gadgets AB owns revenue (11130.25). Volume and value crowns live in different rows, and the inversion IS the vendor story." },
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
    {
      name: "Set-op stacks for the close",
      why: "Month-close packs are appended boards, not parallel reports: the status census stacked under the settlement coverage census, 2024's months under 2025's. The drill is the column contract — same count, same order, compatible types — plus the UNION vs UNION ALL decision: dedupe is correct when branches genuinely overlap and silently destructive when coincidentally-equal rows collapse and branch totals stop reconciling to `COUNT(*)`.",
      slugs: ["count-apples-and-oranges", "team-scores-in-football-tournament", "the-airport-with-the-most-flights"],
    },
    {
      name: "Subquery shapes on the basket stream",
      why: "Screens escalate through the shapes: members whose baskets beat the 338.19 platform average (scalar), members with a pending basket (IN/EXISTS), the second-priciest SKU on the shelf (subquery plus ordering, 149.99). Each shape has a failure mode worth narrating — a scalar subquery returning zero rows NULLs the comparison silently, and NOT IN over a nullable column empties the report the moment one NULL lands in the inner set.",
      slugs: ["second-highest-salary", "game-play-analysis-iv", "market-analysis-i"],
    },
    {
      name: "Window frames and running math",
      why: "The running-demand tracker and the rolling weekly curve both ride window frames, and the default frame — RANGE up to the current row — pulls ordering peers into the running sum together. On a month spine that's invisible; on a basket-grained replay it silently batches ties. The 7-day rolling shape (the restaurant-growth drill) is exactly how store ops smooths demand into the weekend rush, and saying which frame you want is the senior move.",
      slugs: ["find-cumulative-salary-of-an-employee", "restaurant-growth", "rolling-average-steps"],
    },
    {
      name: "Argmax and per-group tops",
      why: "Latest basket per SKU, most-ordered SKU per member, each region's top category by revenue — argmax is the restock meeting's daily bread and the interview's favorite trap. The resilient shape stages with ROW_NUMBER (or a MAX join-back with a stated tie-break) and filters to the top row; ties get a deterministic rule before the board ships, because 'whichever the engine sorted first' is not a ranking.",
      slugs: ["the-most-recent-orders-for-each-product", "most-frequently-ordered-product-per-customer", "product-sales-analysis-iv"],
    },
    {
      name: "Zero-fill buckets and histograms",
      why: "Basket-size bands and latency ladders die quietly on empty arms: GROUP BY only reports buckets that exist, so the >=200 premium band (empty at a 199.99 ceiling) and the zero cancelled arm in the big-ticket census (25 baskets at 500+, none cancelled) vanish and the deck reads a gap as no demand. Zero-fill — a bucket spine LEFT JOINed to the data, or CASE arms that count zero honestly — keeps the distribution's shape truthful.",
      slugs: ["create-a-session-bar-chart", "calculate-orders-within-each-interval", "count-salary-categories"],
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
    {
      id: "target-t9",
      q: "You're replaying baskets in placement order and keeping a running demand total. ROWS or RANGE — and what does the default silently do?",
      a: "The default frame with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE admits ordering peers: any rows sharing the ORDER BY value ride into the window together. On a month spine that's invisible because months are unique keys; on a basket-grained replay ordered by created_at (or worse, by a coarse column like status or region), ties arrive in batches and the running total jumps by several rows' worth at once — a number that reconciles at the end but lies in the middle. The senior answer names the frame out loud: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW when the replay must advance one basket at a time, RANGE when peer-batching is actually the business meaning (same-timestamp baskets landed together). On this db the distinction is testable: 2024's monthly counts tie five ways at 8, so a month-spine walk ordered by COUNT is already in RANGE territory — the running sum at the first 8-basket month includes all five peers.",
      tag: "windows",
    },
    {
      id: "target-t10",
      q: "The close packs a status census, a settlement coverage board and a rail stack into one result. What contracts make a UNION ALL stack trustworthy?",
      a: "Three contracts. Column contract: every branch returns the same column count in the same order with compatible types — a census of statuses under a census of regions breaks the moment one branch adds a column and the engine pairs a status with a dollar figure. Literal contract: heterogeneous stacks carry their own labels ('STATUS CENSUS', 'TOTAL') because row identity dies in the union — the reader must know which branch a row came from. Dedupe contract: UNION ALL is the default because coincidentally-equal rows from different branches are different facts; UNION dedupes across branches and silently collapses them — two rails both settling at 27 legs would print one row and branch totals would stop reconciling to COUNT(*). And the sort is stack-wide: ORDER BY on a compound SELECT applies to the whole result, which is exactly why the rail stack's TOTAL banner can lead the board under dollars DESC.",
      tag: "setops",
    },
    {
      id: "target-t11",
      q: "As-of pricing, per-cluster latency boards, top-spender lists — all seem to need the same fold twice. When do you stage in a CTE versus nest a scalar subquery?",
      a: "Scalar subqueries are for 0-or-1 lookups per row — the as-of price, the prior month's revenue in a correlated pull — and they carry two taxes: the inner query re-runs per outer row, and the zero-row case returns NULL silently, which needs a stated COALESCE policy before the comparison eats it. Derived tables and CTEs are for folds you name once and reuse — the monthly revenue fold behind the pace walk, the latency fold behind the SLA board. The rule of thumb this db teaches: if the inner query aggregates over a GROUP BY, stage it; if it's a keyed lookup, a scalar is honest. The failure mode worth volunteering: a scalar over a fold that returns two rows errors at runtime, not at review — 16 households and 28 invoices forgive you, and production won't.",
      tag: "subqueries",
    },
    {
      id: "target-t12",
      q: "NOT IN keeps appearing in cancel-free household lists and unpaid-invoice worklists. What is its NULL contract, and what do you ship instead?",
      a: "NOT IN has a triple-state contract nobody reads: x NOT IN (a, b, NULL) can never be TRUE — the comparison against NULL is UNKNOWN, so a single NULL in the inner set empties the whole report with no error and no warning. The unpaid worklist shape (invoices with no payment legs) is exactly where it bites, because any nullable join column in the inner set — an unassigned payment leg, a mis-keyed row — turns 'six invoices outstanding' into a blank page that reads as 'everything settled'. The policies, in order: NOT EXISTS (correlated, stops at the first match, NULL-proof), LEFT JOIN + IS NULL (the audit-visible anti-join), and NOT IN only when the inner column is declared NOT NULL and a comment says so. The senior tell is volunteering the empty-inner-set mirror: NOT IN over an empty set returns ALL rows — the opposite catastrophe, also silent.",
      tag: "nulls",
    },
    {
      id: "target-t13",
      q: "Walk me through staging discipline: the pace walk needs a monthly fold before the LAG. Where do the CTE boundaries go and why?",
      a: "One fold, one name, one job per stage. Stage one is the fold: monthly AS (SELECT STRFTIME('%Y-%m', created_at) AS month, ROUND(SUM(total), 2) AS revenue FROM orders GROUP BY month) — grain decided, rounding once, 14 buckets. Stage two is the walk: revenue minus LAG(revenue) OVER (ORDER BY month), where the only job is the delta and the boundary row stays NULL by design. The boundaries go where the grain changes, because that's where reasoning changes: mixing the fold and the walk in one SELECT forces the reader to re-derive the month key inside a window call, and mixing in the display layer (CASE labels, COALESCEs) means a bug in the fold is indistinguishable from a bug in the walk. Name stages after their grain — monthly, walked — and the review stops asking what level of aggregation any number is at.",
      tag: "pipeline",
    },
    {
      id: "target-t14",
      q: "GROUP_CONCAT shows up in settlement manifests — one invoice, its legs listed inline. What are its contracts and its traps?",
      a: "Contracts: GROUP_CONCAT(method) joins the group's values with ',' by default — a separator argument changes it, and the default has no space, so invoice 1's two-leg settlement reads card,wire, not card, wire. Ordering inside the aggregate is not guaranteed on older engines; if the manifest must read legs in a stated order, the ORDER BY lives inside the aggregate on engines that support it, or the legs get staged and folded downstream. Traps: the result is TEXT, so it sorts as text and aggregates no further; a very long group truncates nothing in SQLite but chews display real estate; and NULL members are skipped silently, so a manifest can hide a leg with a NULL method — count the legs beside the manifest (COUNT(*) = 27 across the book) and the omissions show up as arithmetic, not vibes.",
      tag: "aggregation",
    },
    {
      id: "target-t15",
      q: "status is TEXT, amount_cents is INTEGER, total is REAL. Where does SQLite's flexible typing help an analyst — and where does it detonate?",
      a: "It helps when the schema is honest: orders.total is REAL dollars, invoices/payments/expenses are INTEGER cents, and status is a closed TEXT vocabulary ('delivered', 'shipped', 'pending', 'cancelled') — a CASE arm per value partitions cleanly and cross-foots to COUNT(*). It detonates at the seams. A status arm written o.status = 5 (number against TEXT) never matches — SQLite doesn't cast, it just compares storage classes and returns false, so the arm reads zeros with no error. A cents column divided by an integer silently truncates. A double-quoted string becomes an identifier lookup, not a literal. The discipline: quote literals single, divide money by 100.0 at the display edge, and let one deliberate cross-foot per query prove the types still line up — 52+30+14+7 = 103 is a type check wearing a business report's clothes.",
      tag: "quality",
    },
    {
      id: "target-t16",
      q: "COALESCE and NULLIF look like decoration. Give me a query on this db where each one is load-bearing.",
      a: "COALESCE is load-bearing at boundary rows: the pace walk's first month has no LAG, so delta arrives NULL — the board either states the censor (first row has no prior) or writes the policy in SQL, COALESCE(delta, 0) — but that choice must be a decision, because a fake 0.00 delta in January quietly joins every average and sum downstream as if no change occurred. NULLIF is load-bearing as a guard: NULLIF(payments_matched, 0) turns a zero denominator into NULL before the division, so a coverage rate against a no-leg invoice renders NULL instead of exploding or printing infinity — and the honest subtitle says NULL means 'no base', not zero. Both belong at the display edge, never inside the fold: laundering NULLs mid-pipeline hides exactly the anomalies — the paid-status invoice with zero legs — the query exists to catch.",
      tag: "nulls",
    },
    {
      id: "target-t17",
      q: "The basket-band census shows no premium row and the big-ticket census shows no cancelled arm. Is that demand, or is it the query?",
      a: "Both are the query — GROUP BY only reports buckets that exist, so absence of a row is ambiguous between 'no demand' and 'no rows survived'. On this db the premium band (total >= 200 under a 199.99 ceiling) is genuinely empty, and the 25 big-ticket baskets at 500+ genuinely contain zero cancelled — real facts that look identical to query bugs unless the spine is explicit. The zero-fill discipline: build the bucket ladder as a derived spine (VALUES, or a CASE ladder over the full population) and LEFT JOIN the data onto it, so every band appears and empty ones read 0 — or use CASE arms that count zero honestly inside one pass. Then the deck can say 'premium: zero baskets, ceiling 199.99' as a finding instead of a gap, because in a retailer a vanished band is either an insight or a filter bug, and the two demand different meetings.",
      tag: "aggregation",
    },
    {
      id: "target-t18",
      q: "Order of evaluation: WHERE, GROUP BY, HAVING, SELECT, ORDER BY. Name three bugs this order explains on the basket stream.",
      a: "One: filtering on a SELECT alias — WHERE revenue > 1000 when revenue is defined in the SELECT — fails because WHERE runs before SELECT exists; the fold condition goes in HAVING or the expression repeats. Two: a group gate in WHERE — WHERE COUNT(*) >= 15 — errors because groups don't exist until after GROUP BY; the SLA board's cluster gate is HAVING. Three: an ORDER BY that names a column absent from the compound's earlier branches — in a UNION ALL stack the sort applies to the final merged result, so ordering by a branch-only column breaks or mislabels the banner. Bonus fourth this db earns: a WHERE on a LEFT-JOINed right-table column converts the join to INNER silently, because unmatched rows carry NULL there and NULL fails the filter — the unpaid worklist's IS NULL arm is the sanctioned exception, and it works only because NULL is precisely the population being hunted.",
      tag: "pipeline",
    },
    {
      id: "target-t19",
      q: "When does DISTINCT fix a report, and when does it hide a fan-out bug you needed to see?",
      a: "DISTINCT is legitimate when duplication is a property of the join and the question is set-shaped — distinct households per cluster, distinct SKUs in a promo window. It's a bug-mask when duplication is the signal: baskets fan into 251 scan lines, so SELECT DISTINCT collapses the line grain and every units-fold downstream undercounts — the honest move is COUNT(DISTINCT o.id) at the basket grain with the line grain stated, or separate queries per grain. The prosecution test: ask what the duplicate rows MEAN. Same value because one entity was counted twice through a join? That's a grain bug — fix the fold. Same value because two distinct facts coincide (two baskets at the same total)? Then DISTINCT destroys evidence — 2024's five months at 8 baskets are five months, not one. A report that needs DISTINCT to look right should carry a comment saying which duplication died and why the business agreed.",
      tag: "quality",
    },
    {
      id: "target-t20",
      q: "LAG walks the month spine backwards; LEAD walks it forwards. Where does each one's boundary row bite, and which direction does the revenue walk actually want?",
      a: "The walk wants LAG: delta = revenue − LAG(revenue) OVER (ORDER BY month) reads 'change versus last month', positive means growth — August 2024's +1158.21 bounce off July's floor, November's −1326.87 the year's worst retreat. LEAD computes the same arithmetic from the other side and flips every sign: it answers 'change into the NEXT month', which is a forecast-shaped question nobody asked. The boundary bites at the spine's edge either way: LAG leaves 2024-01 NULL (no prior), LEAD leaves 2025-02 NULL (no next). The failure mode is not the NULL — it's the analyst who COALESCEs it to zero and lets a fake flat month join the averages, or who swaps the functions, ships inverted deltas, and reports the year's best month as its worst. Direction and boundary are the two things to say out loud before the window call.",
      tag: "windows",
    },
    {
      id: "target-t21",
      q: "Top-spending household per cluster: why does MAX not survive, and what's the staged shape that does?",
      a: "MAX(spend) per region answers the value but drops the identity — a single column with no household id, and bolting customer_id onto the GROUP BY re-grains the fold to households, not regions. The staged shape: CTE with spend folded per household per region, then ROW_NUMBER() OVER (PARTITION BY region ORDER BY spend DESC) ranked inside, then filter rn = 1 outside the window — because windows can't live in WHERE. The probed book makes the stakes concrete: the platform's top spenders read 7262.35, 6640.56, 4574.23 — a LIMIT-based platform argmax is not a per-cluster answer. And ties need a stated tie-break (spend DESC, customer_id ASC) before the board ships, because ROW_NUMBER splits deterministically only when you told it how; otherwise 'whichever row the engine touched first' is the ranking, and it changes between runs.",
      tag: "windows",
    },
    {
      id: "target-t22",
      q: "Self-joins on invoices, scan lines, baskets — where does the composite guard a.id < b.id earn its keep, and what breaks without it?",
      a: "Any pairwise census on one table needs the guard. Pairing invoices within a household: ON a.customer_id = b.customer_id AND a.id < b.id keeps each pair once, ordered — 31 pairs on this book. Without the guard three things happen at once: every row pairs with itself (28 self-rows), every true pair appears twice as (a,b) and (b,a) (31 mirrors), and downstream COUNTs read 90 instead of 31 — a number that's arithmetically explainable and business-wrong. The guard also fixes determinism: with a symmetric predicate the engine's join order decides which copy feeds the SELECT, so a manifest can flip between runs. The variant worth knowing: a.id <= b.id when self-pairs are the point (a basket against itself as a baseline), and a.customer_id = b.customer_id AND a.id <> b.id when direction matters but order doesn't. Say which rows the predicate keeps — pairs, mirrors, self — and the census is defensible.",
      tag: "joins",
    },
    {
      id: "target-t23",
      q: "You ship the settlement board monthly. What does a self-auditing query carry that a plain one doesn't?",
      a: "Cross-foots and definitions, in the result, not in your head. A status census carries COUNT(*) beside the arms so 52+30+14+7 = 103 proves the arms partition the population — an overlap or a gap shows up as arithmetic before anyone reads a number. The settlement board carries the ledger proof (debits and credits tie at 181080.00, delta zero) beside the coverage census (21 exact at 65612.00, 1 partial at 4000.00 of 6148.00, 6 unpaid at 15217.00), so the board refutes itself every run. The unpaid worklist carries its anomaly classes in-row: invoice 28 sits there on a 'paid' status, which is the query documenting that status is a claim and the payment join is the fact. Definitions ride as comments or subtitles — fulfilled population = shipped_at IS NOT NULL, dollars = amount_cents / 100.0 — because a number whose population lives only in the author's memory is a rumor with a decimal point.",
      tag: "quality",
    },
    {
      id: "target-t24",
      q: "The db is tiny — 103 baskets, 251 lines. Which performance instincts still matter here, and which habits die at scale?",
      a: "Habits that matter at any size: sargable predicates — a half-open window created_at >= '2024-07-01' AND created_at < '2024-08-01' keeps an index usable while STRFTIME wrapping the column kills it; fold-then-join ordering that shrinks the fan-out before attaching dimensions; avoiding correlated scalars inside loops over rows that will be millions someday. Habits that die here: obsessing over join order the optimizer already picks, and hand-tuning what a covering index makes free. The instinct that transfers best from this db's honesty checks: watch the row-count arithmetic — 103 baskets fanning to 251 lines, 28 invoices to 27 legs, 22 billed invoices plus 6 unpaid — because at scale the same fan-out surprises are the difference between a 2-second and a 20-minute query, and the analyst who can narrate row counts at 103 rows can debug them at 103 million.",
      tag: "performance",
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
    {
      id: "target-mcq-11",
      prompt: "Month-close needs the invoices that carry NO payment legs — all six of them. Which shape finds them without silently dropping any?",
      choices: [
        "invoices i JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL",
        "invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL",
        "SELECT * FROM invoices WHERE status <> 'paid'",
        "invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NOT NULL",
      ],
      answer: 1,
      why: "The anti-join is LEFT JOIN + IS NULL: unpaid invoices survive with NULL payment columns, and six rows come back (ids 18, 21, 24, 26, 27, 28 — 15217.00 together). Every other shape either empties the worklist or reads the wrong population.",
      notes: [
        { choice: 0, why: "An INNER JOIN has already discarded exactly the rows being hunted — no payment row means no join match — so WHERE p.id IS NULL on the inner join returns zero rows, the quietest way to report 'all settled' during a shortfall." },
        { choice: 2, why: "Status is a claim, not a fact: invoice 28 carries a 'paid' status with zero payment legs (1756.00) and this filter would MISS it. The payment join is the fact; the status column is the rumor." },
      ],
      difficulty: "easy",
    },
    {
      id: "target-mcq-12",
      prompt: "Invoice 1 settled in two legs. What does GROUP_CONCAT(method) return for it?",
      choices: [
        "card,wire",
        "card, wire",
        "card wire",
        "wire",
      ],
      answer: 0,
      why: "GROUP_CONCAT's default separator is ',' with no space — the two-leg settlement reads card,wire. All five split-leg invoices (1, 5, 12, 19, 22) are cross-rail pairs of exactly these two methods.",
      notes: [
        { choice: 1, why: "The space only appears if you pass it: GROUP_CONCAT(method, ', ') — the default is a bare comma. Manifest formatting that comes out different from the query is a separator decision, not a mystery." },
        { choice: 3, why: "GROUP_CONCAT folds EVERY row in the group — both legs survive. A single-method answer means a filter upstream shrank the group, which is a different report wearing the same label." },
      ],
      difficulty: "easy",
    },
    {
      id: "target-mcq-13",
      prompt: "16 households total; 4 of them placed a cancelled basket. How many rows does 'households with delivered baskets EXCEPT households with cancelled baskets' return?",
      choices: [
        "12 — the delivered-minus-cancelled households",
        "4 — the cancelled households",
        "16 — every household",
        "0 — EXCEPT requires matching column counts",
      ],
      answer: 0,
      why: "EXCEPT keeps rows in the first set that don't appear in the second: the cancel-free households. 4 cancelling households out of 16 leaves 12 clean ones — the loyalty-safe audience for the next Circle drop.",
      notes: [
        { choice: 1, why: "That's INTERSECT — households present in BOTH sets. The 4 cancellers all placed baskets, so they intersect; EXCEPT is asking the opposite question." },
        { choice: 2, why: "16 is the UNION of the two sets — every household that did anything. EXCEPT subtracts, it doesn't merge." },
      ],
      difficulty: "easy",
    },
    {
      id: "target-mcq-14",
      prompt: "A teammate's report uses id NOT IN (SELECT ref_id FROM import_log) and returns ZERO rows. What's the classic cause?",
      choices: [
        "A NULL in the inner set — x NOT IN (…, NULL) can never be TRUE, so no row survives",
        "NOT IN is not supported in SQLite",
        "The outer table is empty",
        "NOT IN requires a JOIN to work",
      ],
      answer: 0,
      why: "One NULL in the inner set poisons the whole predicate: the comparison is UNKNOWN, never TRUE, and the report empties silently. NOT EXISTS or LEFT JOIN + IS NULL are the NULL-safe shapes for exclusion work.",
      notes: [
        { choice: 2, why: "If the outer table were empty, the report would LOOK right (zero rows in, zero rows out) — the dangerous part of this bug is that a healthy outer table also returns zero rows. Check the inner set first." },
        { choice: 3, why: "The mirror failure is just as silent: NOT IN over an EMPTY inner set returns ALL rows. Exclusion logic needs the inner set's NULL and emptiness contracts stated, not inherited." },
      ],
      difficulty: "medium",
    },
    {
      id: "target-mcq-15",
      prompt: "Pairing invoices within the same household: COUNT(*) over invoices a JOIN invoices b ON a.customer_id = b.customer_id AND a.id < b.id returns 31. What does the a.id < b.id guard do?",
      choices: [
        "Keeps each pair once, ordered — killing 28 self-rows and 31 mirror duplicates that a bare join would add",
        "It is required syntax for any self-join",
        "It filters NULL customer_ids",
        "It sorts the output pairs",
      ],
      answer: 0,
      why: "Without the guard, every invoice pairs with itself (28 self-rows) and every true pair appears twice — (a,b) and (b,a) — so the count reads 90 instead of 31. The strict inequality is the dedupe: each pair exactly once, in a deterministic order.",
      notes: [
        { choice: 2, why: "The join condition a.customer_id = b.customer_id already excludes cross-household noise; NULL handling is a different axis. The guard's job is row identity, not filtering." },
        { choice: 3, why: "Ordering comes from ORDER BY; the inequality decides WHICH rows exist. Confusing the two is how pair censuses get shipped with an ORDER BY doing a WHERE's job." },
      ],
      difficulty: "medium",
    },
    {
      id: "target-mcq-16",
      prompt: "On the pace-walk query you try: … OVER (ORDER BY month) AS delta … WHERE delta IS NOT NULL. It errors. Why?",
      choices: [
        "Window functions can't appear in WHERE — compute delta in a CTE or subquery and filter outside it",
        "delta is a reserved word",
        "IS NULL can't be used in WHERE",
        "The window needs a PARTITION BY first",
      ],
      answer: 0,
      why: "WHERE runs before window functions are computed — the delta doesn't exist yet at filter time. The staged shape computes the walk in a CTE, then applies WHERE delta IS NOT NULL (or reports the NULL boundary row) in the outer query.",
      notes: [
        { choice: 2, why: "IS NULL is perfectly legal in WHERE — the failure is the operand: window results (and SELECT aliases generally) aren't visible to the pipeline's earliest stage." },
        { choice: 3, why: "PARTITION BY is optional and unrelated — the error is evaluation order. Adding a partition would be a semantics change dressed up as a fix." },
      ],
      difficulty: "medium",
    },
    {
      id: "target-mcq-17",
      prompt: "The pace walk's first row (2024-01, 3731.97) has a NULL delta. Which handling ships on the month-close board?",
      choices: [
        "Keep the NULL and state the censor — the first month has no prior to differ from",
        "COALESCE to 0 — January had no change",
        "Drop the row — the walk starts in February",
        "Use LAST_VALUE instead of LAG",
      ],
      answer: 0,
      why: "The boundary NULL is information: LAG has no row before 2024-01, and the board says so. A fake 0.00 delta joins every downstream average and sum as if January were flat; dropping the row shrinks the 14-month spine to 13 without saying why.",
      notes: [
        { choice: 1, why: "Zero-fill invents a fact — 'no change in January' is not something the data said. If the business truly wants 0, the subtitle documents the policy and the downstream math accounts for it." },
        { choice: 3, why: "LAST_VALUE with the default frame returns the frame's last row, not the prior row — a different (and frame-dependent) number entirely. LAG is the prior-row accessor; the boundary is handled, not worked around." },
      ],
      difficulty: "hard",
    },
    {
      id: "target-mcq-18",
      prompt: "One-pass status census: which expression counts cancelled baskets with FILTER?",
      choices: [
        "COUNT(*) FILTER (WHERE status = 'cancelled')",
        "COUNT(status FILTER 'cancelled')",
        "FILTER(status = 'cancelled') COUNT(*)",
        "COUNT(FILTER(status = 'cancelled'))",
      ],
      answer: 0,
      why: "FILTER is an aggregate suffix: COUNT(*) FILTER (WHERE …) — 7 on this db. It's the standard SQL conditional-count shape and reads cleaner than a CASE arm when the census is one-pass per group.",
      notes: [
        { choice: 1, why: "The keyword goes between the aggregate and its condition — FILTER is not a function wrapping the column. Syntax placement errors are screen-enders, not style notes." },
        { choice: 2, why: "SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) is the equivalent portable fold — same 7. Knowing both forms lets you match the team's house style instead of arguing it." },
      ],
      difficulty: "medium",
    },
    {
      id: "target-mcq-19",
      prompt: "The rail stack's TOTAL row can't come from another GROUP BY method branch. Why?",
      choices: [
        "GROUP BY method can only produce per-rail rows — the TOTAL must aggregate the whole table in its own UNION ALL branch with a literal label",
        "UNION ALL forbids aggregate functions",
        "TOTAL rows require a window function",
        "GROUP BY method would sort the rails alphabetically",
      ],
      answer: 0,
      why: "The branch contract: GROUP BY method folds legs INTO rails (16 card, 11 wire); a grand total is a different grain — no GROUP BY, whole-table aggregates, and a literal 'TOTAL' as the label so the stack reads as one board: 69612.00 over 27 legs.",
      notes: [
        { choice: 1, why: "UNION ALL is aggregate-friendly — each branch folds independently. The constraint is structural (a banner is not a rail), not a UNION limitation." },
        { choice: 2, why: "A GROUP BY method branch that also lists method would append a THIRD rail row, not a banner — four rails is a worse board than three, and the arithmetic would still reconcile. Grain is the decision, not syntax." },
      ],
      difficulty: "hard",
    },
    {
      id: "target-mcq-20",
      prompt: "In the stacked rail report, why does the TOTAL row print FIRST under ORDER BY dollars DESC?",
      choices: [
        "ORDER BY on a compound SELECT applies to the WHOLE merged result — 69612.00 outranks both rails, so the banner leads",
        "UNION ALL always places the last branch first",
        "GROUP BY sorts aggregate rows before detail rows",
        "'TOTAL' sorts before 'card' alphabetically",
      ],
      answer: 0,
      why: "There is one ORDER BY for the entire compound result, and it sees three rows — TOTAL 69612.00, card 37364.00, wire 32248.00 — so DESC leads with the banner. That's the design: the close opens on the grand total, then the rails that compose it.",
      notes: [
        { choice: 1, why: "Branch order determines insertion order, not output order — the sort is applied after the union. Relying on branch position is how banners end up buried mid-board." },
        { choice: 3, why: "Under ASC the order is wire 32248.00, card 37364.00, TOTAL 69612.00 — banner LAST, which is a board that makes the reader hunt for the headline. Alphabetical text sort has nothing to do with it." },
      ],
      difficulty: "hard",
    },
    {
      id: "target-mcq-21",
      prompt: "The status census reads 52 delivered / 30 shipped / 14 pending / 7 cancelled. What property lets the board trust that these arms reconcile to COUNT(*) = 103?",
      choices: [
        "The CASE arms partition the population — every basket lands in exactly one arm, so the arms must sum to the whole",
        "SQLite sums CASE arms automatically",
        "The arms deduplicate overlapping rows",
        "COUNT(*) rounds to the nearest census",
      ],
      answer: 0,
      why: "One status per basket means the four arms are a partition: 52+30+14+7 = 103 exactly. That cross-foot is the query auditing itself — an overlap (double-counted row) or a gap (arm that never fires) shows up as arithmetic before anyone reads a KPI.",
      notes: [
        { choice: 2, why: "Arms never dedupe — they classify. If two arms could both fire (overlapping WHEN conditions), the sum would EXCEED 103, and that failure is the census doing its job." },
        { choice: 3, why: "Nothing rounds — the reconciliation is exact set arithmetic. A board that 'usually' foots is a board with a silent ELSE swallowing rows." },
      ],
      difficulty: "easy",
    },
    {
      id: "target-mcq-22",
      prompt: "'Give me the weakest month': SELECT month FROM monthly LIMIT 1 — no ORDER BY. What's wrong?",
      choices: [
        "Without ORDER BY, the row SQLite returns is arbitrary — LIMIT needs an ORDER BY to be a ranking",
        "LIMIT 1 is invalid SQL",
        "It returns all 14 rows",
        "Monthly tables cannot be limited",
      ],
      answer: 0,
      why: "LIMIT without ORDER BY has no defined winner — 'first' means whichever row the engine touched last, which can change between runs and plans. The weakest month needs ORDER BY revenue ASC before LIMIT 1 (2024-07, 1193.86).",
      notes: [
        { choice: 2, why: "LIMIT 1 caps the result at one row — it never expands one. The bug isn't volume, it's that the ONE row is arbitrary." },
        { choice: 3, why: "Insertion order feels stable on a small table and isn't a contract anywhere. The close ships rankings, and a ranking without a sort key is a rumor with a LIMIT clause." },
      ],
      difficulty: "easy",
    },
    {
      id: "target-mcq-23",
      prompt: "'Households with a pending basket': IN (SELECT customer_id FROM orders WHERE status = 'pending') vs EXISTS (correlated). Which claim is true?",
      choices: [
        "Both return the same households here; EXISTS short-circuits on the first match per row and is the NULL-safe habit for exclusion work",
        "IN is always faster than EXISTS",
        "EXISTS requires a JOIN keyword",
        "IN handles NULLs better than EXISTS",
      ],
      answer: 0,
      why: "For membership, IN and EXISTS return the same set. The habit question is about the NOT forms: NOT IN dies on a NULL in the inner set, while NOT EXISTS keeps working — and EXISTS's correlation (o.customer_id = c.id) stops scanning at the first match.",
      notes: [
        { choice: 1, why: "Performance depends on the plan, the indexes and the subquery's selectivity — 'always faster' is a folk claim. The durable difference is NULL semantics, not speed." },
        { choice: 3, why: "Inverted: IN is the shape with the NULL trap (its inner-set contract), EXISTS treats NULL correlations as simply not-matched. The safe exclusion tool is NOT EXISTS." },
      ],
      difficulty: "medium",
    },
    {
      id: "target-mcq-24",
      prompt: "'Top-spending household per cluster, one row each.' Which shape survives ties and keeps the identity?",
      choices: [
        "Stage spend per household in a CTE, rank with ROW_NUMBER() OVER (PARTITION BY region ORDER BY spend DESC, customer_id), filter rn = 1 outside the window",
        "GROUP BY region with MAX(spend) — it carries the household id",
        "GROUP BY region, customer_id with LIMIT 1",
        "ORDER BY spend DESC LIMIT 4",
      ],
      answer: 0,
      why: "The staged rank-then-filter shape answers per cluster with identity intact and a deterministic tie-break. The platform's top spenders read 7262.35, 6640.56, 4574.23 — but a LIMIT 4 answer is a platform argmax, not four cluster winners.",
      notes: [
        { choice: 1, why: "MAX(spend) per region answers the value and drops who earned it — bolting customer_id onto the GROUP BY re-grains the fold to households, one row per household, which is not a per-cluster board." },
        { choice: 3, why: "LIMIT 4 across the whole table returns the four biggest spenders wherever they live — three clusters could crowd out the fourth. Argmax needs a partition, not a cut." },
      ],
      difficulty: "medium",
    },
    {
      id: "target-mcq-25",
      prompt: "Running revenue via SUM(revenue) OVER (ORDER BY month). How do you make the running total RESET each January?",
      choices: [
        "Add PARTITION BY SUBSTR(month, 1, 4) — the fold runs within each year, so 2025 restarts at 1669.50",
        "Change ORDER BY to SUBSTR(month, 1, 4)",
        "Use ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
        "Add GROUP BY SUBSTR(month, 1, 4)",
      ],
      answer: 0,
      why: "PARTITION BY scopes the window fold: 2024 runs 0 to 30773.25, then 2025 starts fresh and closes at 4060.03 — two independent running sums instead of one 34833.28 spine.",
      notes: [
        { choice: 1, why: "Reordering by year (then month) changes traversal order but never the frame's scope — the running total still accumulates across the year boundary without a partition." },
        { choice: 3, why: "GROUP BY collapses to one row per year — that's a subtotal report, not a running curve. The window keeps all 14 rows; the aggregate would keep 2." },
      ],
      difficulty: "hard",
    },
    {
      id: "target-mcq-26",
      prompt: "A status arm is written o.status = \"cancelled\" with double quotes. What does SQLite do?",
      choices: [
        "By default it treats \"cancelled\" as an identifier — if no such column exists, the arm misbehaves or errors",
        "Double quotes are the standard string literal",
        "Both quotes are always interchangeable",
        "SQLite rejects the query at parse time",
      ],
      answer: 0,
      why: "Single quotes are string literals; double quotes are identifiers. The arm compiles looking for a column named cancelled, and the failure lands at runtime — zeros in the cancelled column, or an error, depending on the engine's tolerance settings.",
      notes: [
        { choice: 1, why: "That's the portability myth: standard SQL reserves double quotes for identifiers. Code that 'works' with double-quoted strings is one strict-mode flag away from failing." },
        { choice: 3, why: "The scary part is precisely that SQLite often DOESN'T reject it — the quote slip survives to the deck as a silently-wrong census. Quote discipline is a data-quality control, not style." },
      ],
      difficulty: "medium",
    },
    {
      id: "target-mcq-27",
      prompt: "A teammate buckets the trend with STRFTIME('%Y', created_at) instead of '%Y-%m'. What does the fold return?",
      choices: [
        "One row per YEAR — 2024's twelve months collapse into a single 30773.25 bucket",
        "14 monthly rows as before",
        "An error — the format string is invalid",
        "One row per basket",
      ],
      answer: 0,
      why: "'%Y' truncates the bucket key to the year: two rows — 2024 at 30773.25 and 2025 at 4060.03. It looks plausible because it still sums cleanly to 34833.28; the board just goes quiet, and every month-level story (July's 1193.86 floor) vanishes.",
      notes: [
        { choice: 2, why: "The format string is valid — that's the trap. A grain error that errors loudly is a gift; one that aggregates cleanly is how a monthly trend becomes an annual one without anyone deciding it." },
        { choice: 3, why: "GROUP BY collapses rows sharing the bucket key — 103 baskets become 2 year-buckets, never 103. The row-count check (did the fold shrink as expected?) catches grain bugs instantly." },
      ],
      difficulty: "medium",
    },
    {
      id: "target-mcq-28",
      prompt: "'Second-lowest 2024 revenue month' via ORDER BY revenue LIMIT 1 OFFSET 1. When does this shape break?",
      choices: [
        "When ties straddle the boundary — OFFSET assumes a strict total order the data never promised",
        "OFFSET is unsupported in SQLite",
        "It always returns July",
        "It breaks only when NULLs are present",
      ],
      answer: 0,
      why: "OFFSET-1 'second place' is only as honest as the sort's uniqueness. This book's revenue months happen to be distinct (floor 1193.86, then 1648.80), but 2024's basket counts tie five ways at 8 — one duplicated value and the OFFSET silently skips a tied month instead of admitting the share.",
      notes: [
        { choice: 2, why: "July IS the floor under ASC + LIMIT 1 — but the question is the second-lowest, and the shape's fragility is what disqualifies it: DENSE_RANK = 2 admits ties as ties, OFFSET invents an ordering." },
        { choice: 3, why: "NULLs complicate sorting (they sort first ASC in SQLite) but the structural flaw is tie-blindness. Fixing NULLs while keeping OFFSET just makes the wrong rank more confident." },
      ],
      difficulty: "hard",
    },
    {
      id: "target-mcq-29",
      prompt: "How many distinct settlement rails does the payments table carry, and what are they?",
      choices: [
        "Two — card (16 legs, 37364.00) and wire (11 legs, 32248.00)",
        "One — card only",
        "Three — card, wire, cash",
        "27 — one rail per payment leg",
      ],
      answer: 0,
      why: "COUNT(DISTINCT method) = 2: the card rail moves 16 legs worth 37364.00, the wire rail 11 legs worth 32248.00 — a 69612.00 book. Rails are categories; legs are rows; the stack's TOTAL banner folds both rails into one line.",
      notes: [
        { choice: 3, why: "27 is the leg count, not the rail count — a COUNT(*) under the method grain. Confusing row counts for category counts is the same two-grain slip as baskets vs households." },
        { choice: 2, why: "Inventing a third rail is how wishful category lists ship. The census is COUNT(DISTINCT method) — two — and the stack proves it: three rows total, one of which is the banner." },
      ],
      difficulty: "easy",
    },
    {
      id: "target-mcq-30",
      prompt: "ORDER BY delta ASC on the pace walk — which row prints first, and why?",
      choices: [
        "2024-01 — its delta is NULL, and SQLite sorts NULLs first in ASC",
        "2024-11 — the biggest drop at -1326.87",
        "2025-02 — the newest month",
        "No row prints — NULLs are excluded by ORDER BY",
      ],
      answer: 0,
      why: "NULL sorts as smallest in SQLite's ASC: the walk's boundary row (no prior month) leads the board before the real drops. If the review wants worst-month-first, the sort key must state its NULL policy — NULLS LAST, or a CASE that parks the boundary deliberately.",
      notes: [
        { choice: 1, why: "-1326.87 is the first NON-NULL delta — one position too late. A board that opens on a NULL and calls it the worst month is exactly the boundary-row trap the censor exists to prevent." },
        { choice: 3, why: "ORDER BY never excludes rows — it orders all of them, NULLs included. Silence in a sort is a placement decision the analyst never consciously made." },
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
    {
      id: "cs-target-3",
      tier: "medium",
      topic: "j5",
      universe: "refund-audit",
      title: "The unpaid worklist, per cluster",
      brief:
        "Target-flavored case on the storefront db (invoices = vendor settlement bills, payments = settlement legs, customers = the market-cluster key): month-close hygiene ends on the unpaid worklist — which invoices carry NO payment legs at all, folded per cluster with their exposure in dollars. Probed facts: 6 of 28 invoices are payment-free — ids 18, 21, 24, 26, 27 and 28 — worth 15217.00 together, and the cluster fold reads EU 4 invoices at 8524.00, US 1 at 4937.00, APAC 1 at 1756.00. Invoice 28 sits in the APAC row on a 'paid' status with zero legs (1756.00) — the standing reminder that status is a claim and the payment join is the fact.",
      ask: "Return per-cluster counts of payment-free invoices and their unpaid total in dollars — biggest exposure first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS unpaid_invoices,\n       ROUND(SUM(i.amount_cents) / {1}, 2) AS unpaid_total\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.id\nJOIN customers c ON c.id = i.customer_id\nWHERE {2}\nGROUP BY c.region\nORDER BY unpaid_total {3};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          label: "the cents-to-dollars divisor",
          noVerify: true,
          why: "The .0 promotes the integer-cent sum to real arithmetic before the division — the honest read of 852400 cents is 8524.00. The odd-cent legs in this book (236150 and 222950 cents) are why the promotion happens before, not after, the fold.",
        },
        {
          answer: "p.id IS NULL",
          kind: "keyword",
          label: "the anti-join arm",
          why: "LEFT JOIN keeps all 28 invoices; the IS NULL arm keeps only the 6 with no surviving payment row — the anti-join that defines 'unpaid'. A payment-free invoice contributes NULL legs, and NULL is precisely the population the worklist hunts.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure-first direction",
          why: "The worklist leads with the money: EU 8524.00, then US 4937.00, then APAC 1756.00. ASC would open the follow-up meeting on the smallest row and let the four-invoice EU cluster wait another week.",
        },
      ],
      distractors: ["1000", "i.id IS NULL", "ASC"],
      walkthrough:
        "The unpaid worklist is an anti-join wearing a dollar sign. The FROM clause LEFT JOINs payments onto invoices so all 28 bills survive, then the WHERE p.id IS NULL arm keeps only the 6 with no legs — ids 18, 21, 24, 26, 27, 28 — and the join to customers attaches the cluster key for the fold. GROUP BY region stacks them: EU 4 invoices at 8524.00, US 1 at 4937.00, APAC 1 at 1756.00, and ROUND(SUM/100.0, 2) prints the dollars once, at the edge. ORDER BY unpaid_total DESC leads with EU — the biggest exposure and the only multi-invoice row. The distractors encode the worklist's classic failures: 1000 re-divides cents into thousands (EU prints 852.00 — a tenfold understatement that survives every glance); i.id IS NULL can never be true (the preserved side of the LEFT JOIN always has an id), so the worklist empties and the close reads clean while 15217.00 sits outstanding; ASC buries EU under APAC and the meeting starts with the smallest number in the room. And the anomaly the board exists to catch rides in the APAC row: invoice 28 says 'paid' and has never seen a leg.",
    },
    {
      id: "cs-target-4",
      tier: "easy",
      topic: "s7",
      universe: "funnel",
      title: "The cluster status matrix",
      brief:
        "Target-flavored case on the storefront db (orders = baskets, customers = market clusters): the fulfillment review opens on a status-by-cluster matrix — every funnel stage folded per market in one pass, arms that partition the population. Probed cells: EU 24 delivered / 12 shipped / 6 pending / 3 cancelled on 45 baskets; APAC 21/8/5/3 on 37; US 5/10/3/1 on 19; LATAM 2/0/0/0 on 2. The arms cross-foot to the platform census — 52 delivered, 30 shipped, 14 pending, 7 cancelled = 103 — and the shape of the read is the story: US runs the heaviest shipped share (10 of 19) while LATAM is two delivered baskets and nothing else.",
      ask: "Return per-cluster delivered/shipped/pending/cancelled tallies beside total baskets — biggest book first, keeping every cluster with at least 2 baskets.",
      template:
        "SELECT c.region,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS delivered,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS shipped,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS pending,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,\n       COUNT(*) AS baskets\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING COUNT(*) >= {2}\nORDER BY baskets {3};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the delivered arm",
          why: "The arm's literal must match the status vocabulary exactly — 'delivered' tallies EU 24, APAC 21, US 5, LATAM 2. Status is a closed TEXT set, so the arm is a partition member, and the four arms must cross-foot to COUNT(*).",
        },
        {
          answer: "2",
          kind: "number",
          label: "the cluster floor",
          noVerify: true,
          why: "The floor keeps every cluster that can be read at all — all four rows (45, 37, 19, 2). It is the materiality decision in the open: LATAM's two baskets stay visible precisely because the alternative is a matrix that quietly hides the smallest market.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review reads from the largest book down: EU 45, APAC 37, US 19, LATAM 2. ASC would open on LATAM — two baskets wearing the same visual weight as EU's 45 — and the room argues about a sample before it sees the base.",
        },
      ],
      distractors: ["'shipped'", "'pending'", "3", "ASC"],
      walkthrough:
        "A status matrix is four CASE arms and one contract. Each arm is SUM(CASE WHEN status = <literal> THEN 1 ELSE 0 END) — a partition member that fires for exactly one status — and the arms must cross-foot to COUNT(*) per cluster: EU 24+12+6+3 = 45, APAC 37, US 19, LATAM 2, summing to 52+30+14+7 = 103 platform-wide. The join attaches clusters; the HAVING floor at 2 keeps all four rows visible; ORDER BY baskets DESC leads with EU. The distractors encode the matrix's classic failures: 'shipped' in the delivered arm prints 12/8/10/0 — a real column wearing the wrong label, so the deck argues about delivery while describing transit; 'pending' prints 6/5/3/0 and understates every cluster's completed work; a floor of 3 drops LATAM and the matrix loses its smallest market exactly when the two-delivered-baskets fact is the story; ASC leads with LATAM's 2 baskets against EU's 45 and the room spends its first five minutes on a sample. One pass, four arms, one cross-foot — the matrix audits itself or it's not a matrix.",
    },
    {
      id: "cs-target-5",
      tier: "medium",
      topic: "x3",
      universe: "supplier",
      title: "The settlement rail stack",
      brief:
        "Target-flavored case on the storefront db (payments = settlement legs, method = the rail): the treasury page of the close is a stacked board — each settlement rail's leg count and dollar volume, with the grand total as a banner row on top. Probed facts: the book carries two rails — card at 16 legs worth 37364.00 and wire at 11 legs worth 32248.00 — folding to a TOTAL of 27 legs at 69612.00. The five split-leg invoices (1, 5, 12, 19, 22) each settle as two legs, and every one is cross-rail (card,wire) — which is why per-rail leg counts and per-invoice leg counts are different grains worth keeping separate.",
      ask: "Return one stacked board: per-rail leg counts and dollars, plus a TOTAL banner — grand total first.",
      template:
        "SELECT method AS rail,\n       COUNT(*) AS legs,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS dollars\nFROM payments\nGROUP BY {1}\nUNION ALL\nSELECT {2}, COUNT(*), ROUND(SUM(amount_cents) / 100.0, 2) FROM payments\nORDER BY dollars {3};",
      slots: [
        {
          answer: "method",
          kind: "keyword",
          label: "the rail fold key",
          why: "GROUP BY method folds 27 legs into the 2 rails — card 16/37364.00, wire 11/32248.00. Any other key changes the board's grain: invoice_id re-grains to 22 billed invoices, a constant collapses the fold to one row.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the banner literal",
          why: "The second branch is a different grain — whole-table aggregates with a literal label — so the stack reads TOTAL 27/69612.00 above card and wire. UNION ALL keeps both branches even if values coincide; the literal is what makes a banner a banner.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the banner-first direction",
          why: "There is one ORDER BY for the whole compound result: 69612.00 > 37364.00 > 32248.00, so DESC leads with the TOTAL banner and the close opens on the headline. ASC buries the banner last, under the rails that compose it.",
        },
      ],
      distractors: ["invoice_id", "'card'", "1000", "ASC"],
      walkthrough:
        "The rail stack is two grains in one result, held apart by the branch contract. Branch one folds the leg grain: GROUP BY method turns 27 payment legs into card 16 legs at 37364.00 and wire 11 legs at 32248.00, dollars promoted once through the 100.0 divisor. Branch two is the banner: no GROUP BY, whole-table COUNT and SUM, and the 'TOTAL' literal as its rail — 27 legs at 69612.00. UNION ALL is mandatory, not stylistic: coincidentally-equal branch rows must survive as separate facts. ORDER BY dollars DESC is stack-wide, so the banner leads. The distractors encode the treasury page's failure modes: invoice_id re-grains branch one to 22 billed invoices — a per-billing board wearing the rail board's name; the 'card' literal double-labels the banner and the deck reports two card rails, one of them secretly the whole book; 1000 in the fold key collapses GROUP BY to a single constant row (and mislabels the banner under a bare-column quirk); ASC puts wire first and the TOTAL banner dead last — a headline the reader meets on the way out.",
    },
    {
      id: "cs-target-6",
      tier: "hard",
      topic: "t7",
      universe: "month-close",
      title: "The revenue pace walk",
      brief:
        "Target-flavored case on the storefront db (orders = baskets): the month-close deck walks revenue month over month — a staged fold (monthly revenue buckets) feeding a window walk (LAG deltas). Probed walk, 14 buckets from 2024-01 to 2025-02: the spine opens at 3731.97 with a NULL delta (no prior month), slides to July's floor 1193.86 (delta -853.57), bounces +1158.21 into August, logs the year's worst retreat in November (-1326.87), and closes 2025-02 at 2390.53 on a +721.03 lift. First-minus-second months differ by -122.33 — the walk's first readable step.",
      ask: "Return the monthly revenue walk: month, revenue, and month-over-month delta to 2 decimals — chronological, oldest first.",
      template:
        "WITH monthly AS (\n  SELECT STRFTIME('%Y-%m', created_at) AS month,\n         ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       revenue,\n       ROUND(revenue - {1}(revenue) OVER (ORDER BY {2}), {3}) AS delta\nFROM monthly\nORDER BY month {4};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the walk direction",
          why: "delta = revenue − LAG(revenue) reads 'change versus last month' — positive is growth (August +1158.21), negative is retreat (November -1326.87). LEAD computes the same arithmetic from the other side and flips every sign into a forecast nobody asked for.",
        },
        {
          answer: "month",
          kind: "keyword",
          label: "the walk's spine",
          why: "The window must be ordered by the chronological key — month — or the deltas compare months that aren't neighbors. Ordering by revenue pairs July's floor against whatever row sorts beside it and publishes fiction with correct arithmetic.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the delta precision",
          noVerify: true,
          why: "Deltas round once, at the display edge, to 2 decimals — -122.33, -1326.87, +721.03. Rounding to 0 publishes integers (-122, -993) and quietly invents whole-dollar moves the cents never made.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A walk reads oldest first — 2024-01 opens the spine with its honest NULL boundary. DESC prints 2025-02 on row one, where the board's reader meets the ending before any beginning, and the boundary NULL lands mid-list instead of at the top.",
        },
      ],
      distractors: ["LEAD", "revenue", "created_at", "DESC"],
      walkthrough:
        "The pace walk is two stages with a boundary policy. Stage one folds the grain: STRFTIME('%Y-%m') buckets 103 baskets into 14 months, ROUND(SUM(total), 2) prints each once — 3731.97 down to July's 1193.86 floor, back up to 2390.53. Stage two walks: revenue − LAG(revenue) OVER (ORDER BY month), rounded to 2 decimals, gives the deltas the deck narrates — -122.33 into February, -853.57 into the July floor, +1158.21 out of it, -1326.87 into November, +721.03 closing 2025-02 — with 2024-01's delta NULL because no prior month exists, the censor the board states instead of zero-filling. The distractors encode the walk's failure modes: LEAD flips every sign (the same walk reported as if time ran backwards, +122.33 opening a year that actually opened flat); ORDER BY revenue scrambles the spine (February reads 493.60 against a neighbor that isn't December); ROUND to 0 publishes -122 and -993 — integers that sum differently than the cents did; ordering the walk by created_at fails outright (the staged spine is the month bucket, not the raw timestamp); DESC prints 2025-02 first, so the walk's only boundary NULL sits in the middle of the board wearing no explanation.",
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
    { slug: "keep-latest-dedupe", why: "Latest-row-wins dedupe — the promo price snapshot per SKU as of the Circle Week start, staged with ROW_NUMBER and a stated tie-break. Curated fill." },
    { slug: "report-contiguous-dates", why: "Gaps-and-islands over a date spine — the consecutive in-SLA streak read: how many days did the 3-day promise hold without a break. Curated fill." },
    { slug: "product-price-at-a-given-date", why: "As-of pricing through history — the shelf price as of the event window's first morning, NULL-safe for SKUs that never repriced. Curated fill." },
    { slug: "customer-order-frequency", why: "HAVING-gated reorder cadence — households that came back within the window, the repeat-visit muscle behind the 14-of-16 repeat-member census. Curated fill." },
    { slug: "monthly-transactions-i", why: "Month-scoped conditional tallies — July's promo retro in textbook form: in-window filter, per-status arms, the floor month isolated. Curated fill." },
    { slug: "bank-account-summary-ii", why: "Credit-versus-debit fold per account — the settlement sanity read: money in against money out, reconciled per household. Curated fill." },
    { slug: "combine-two-tables", why: "LEFT JOIN profiles onto activity — the household attributes attached to the basket stream without dropping a single order row. Curated fill." },
    { slug: "top-travellers", why: "Leaderboard by moved value — the top-household board (7262.35 at the crown), ranked with ties admitted rather than invented. Curated fill." },
    { slug: "average-time-of-process-per-machine", why: "Duration from event pairs — start-to-finish timestamps folded per unit, the latency-from-log math under the 2.98-day fulfillment average. Curated fill." },
    { slug: "project-employees-i", why: "Load folded per program — vendor units per owned-brand line, the volume-vs-value split the vendor board reads (109 units vs the revenue crown). Curated fill." },
    { slug: "triangle-judgement", why: "CASE-labeled validity flags — store-vs-ship eligibility decided in the SELECT, the same arm discipline the status matrix runs on. Curated fill." },
    { slug: "weather-type-in-each-country", why: "CASE-plus-join labels per group — cluster-level categorical reads, the shape behind every per-market status board. Curated fill." },
    { slug: "biggest-single-number", why: "HAVING-isolated singles — the null-return discipline: when the answer is 'none exists', the query must say NULL, not zero. Curated fill." },
    { slug: "article-views-ii", why: "HAVING-gated audience census — clusters above a threshold, the materiality-cut shape behind the 15-basket SLA gate. Curated fill." },
    { slug: "department-highest-salary", why: "Per-group argmax with identity — top SKU per cluster staged through a CTE rank, the shape that survives ties. Curated fill." },
    { slug: "invalid-tweets", why: "Length-gated validation — the data-quality pass on SKU and promo copy before any join trusts the text. Curated fill." },
  ],
};
