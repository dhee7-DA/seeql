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
    "Preparation strategy: Sephora carries **0 tagged problems** in this app's registry, so every slug below is theme-curated from the SQL band to mirror the workflows its screens actually probe — loyalty banding, kept-basket rates, replenishment cover, cents discipline on the settlement tables (invoices and payments store INTEGER cents; the dollar read is `amount_cents / 100.0`). The six case studies run on the live db — built for spaced practice rather than one sitting: one rebuilds the **market-cluster basket board** the growth review opens with, another rebuilds the **dispatch-state pivot** ops reads each morning. All six are mechanically audited against probed figures.",
    "Under the counter sits a settlement stack most candidates never reach. Brand-vendor bills live in {rose:invoices} and settle through `payments` — **28 bills against 27 payment rows**, money stored as INTEGER cents so every dollar view is `amount_cents / 100.0`. The rails split card versus wire (16 card payouts worth 37364 against 11 wires worth 32248), the open book stands at 19609.00 across 6 bills, and the zero-payment anti-join holds 6 bills — 15217.00 of exposure, one of them paid in status and silent in payments. Paid bills settle in **28.4 days against 30-day terms** (fastest 13, slowest 84), and the ledger cross-foots at 181080 debits against 181080 credits — *the reconciliation habit Sephora screens actually grade*.",
    "Prep the expanded bank in two passes. First pass: grain discipline — the six case files now cover the cluster board, the dispatch pivot, the promo-month pace spine, the settlement-speed ladder, the store-bin day manifest and the shelf-band census, each rebuilt from a blank editor against the live db. Second pass: the follow-up drills — twenty-four theory items and thirty MCQs that push past syntax into *population statements* (`COUNT(shipped_at)` vs `COUNT(*)`, latency over the 82, settle speed over the 20), window frames, set-op semantics and the KPIs the loyalty reviews are built from — {violet:tier mix}, {violet:cross-sell attach}, {violet:points liability}. *Run every case twice, a week apart — the second pass is where the denominator habits stick.*",
  ],

  dayInLife: [
    "**08:40 —** The day opens on the dispatch board, and the first query is always the same reconciliation: did the overnight scan stream land, do line sums tie to basket totals, does the status census read **52 delivered, 30 shipped, 14 pending, 7 cancelled**? The latency tile is next — **2.98 days** across the 82 dispatched baskets — and the eye goes straight to the cluster split, because the US cluster at **3.07 days** is the one the ops lead pings about. Fourteen baskets sit awaiting dispatch and seven died in the cart; the analyst who can write the aging query owns the standup.",
    "**11:30 —** Mid-morning is the stock-cover block. The replenishment census folds sold units against shelf stock and bands the result, and the thin trio is the story: the noise-canceling headset at **14 units of cover**, the desktop mic at **15**, the top-wearable SKU at **17**. The trap gets narrated out loud: a basket that shipped still consumed stock, so the fold is `stock - SUM(quantity)` over every scanned line — *a replenishment plan built on delivered-only demand undercounts by the 30 in-transit baskets*. The store-bins split ships beside it: pickup-style demand versus ship-style, one query, two labeled arms.",
    "**15:30 —** The afternoon tilts to the loyalty review. The Insider ladder folds lifetime spend per household and bands it: the top four households carry **63.5%** of the book, led by a 24-basket member worth **7262.35**, and the tier cut is a HAVING gate the deck states out loud. Finance takes the settlement hygiene pass — five split-payment invoices found with `GROUP BY invoice_id HAVING COUNT(*) > 1`, a {rose:void}-but-paid bill at 925, an open book of **$19,609.00** — every dollar read via `amount_cents / 100.0`. The note ships with definitions attached, because *a loyalty number without its denominator is a rumor in a retailer that audits its own dashboards*.",
    "**20:30 —** Month-end close runs on the money tables, and the close checklist is a stack of reconciliation queries. The open book prints first — **6 open bills worth 19609.00** — then the zero-payment sweep: LEFT JOIN payouts, HAVING the paid sum IS NULL, **6 bills worth 15217.00**, one of them {rose:paid} in status and unmoved at 1756.00. The void-but-paid bill at 925.00 gets its row in the anomalies log, the split-payment census — five bills settling in two rows — reconciles to the penny, and the ledger trial balance closes the night: **181080 debits against 181080 credits**, {emerald:delta zero}. *The day ends the way it began: prove the fold, then write down what tomorrow must tie* — because in a beauty retailer that audits its own loyalty math, a close without a reconciliation query is just a summary.",
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
    { name: "Payment rails", what: "Card versus wire split of the 27 vendor payouts — 16 card payouts worth 37364 against 11 wires worth 32248. The mix that says whether the brand book pays at the counter or through treasury." },
    { name: "Settlement speed", what: "Days from bill issue to first payout over the 20 paid bills that carry payment rows — 28.4 average against 30-day terms, fastest 13, slowest 84. Population stated first: the 21st paid bill has no payment rows at all." },
    { name: "Coverage classes", what: "Every invoice classified in one pass — exact (21 worth 65612), partial (1: 4000 of 6148), none (6 worth 15217). The dunning queue is the 'none' arm, not the open-status label." },
    { name: "Ledger proof", what: "Trial balance over the ledger — 181080 debits against 181080 credits, cash net 44196, receivables net 16440. The invariant that makes every other money number quotable." },
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
      slugs: ["customers-who-bought-a-and-b-not-c", "find-product-recommendation-pairs", "sales-analysis-ii", "duplicate-emails"],
    },
    {
      name: "Repeat members and lapse risk",
      why: "14 of 16 households order again — and the whole loyalty economics case rests on which ones stop. Repeat-rate folds, churn anti-joins and reactivation screens are the exact drills, and on this db the anti-joins come back empty, so recognizing when zero is the true answer is part of the test.",
      slugs: ["repeat-purchase-rate", "find-churn-risk-customers", "dormant-reactivation", "monthly-transactions-ii", "weather-type-in-each-country"],
    },
    {
      name: "Replenishment and stock cover",
      why: "Store bins die at the shelf: the replenishment census folds stock minus sold per SKU and bands the result — the thin trio at 14/15/17 units is the restock queue. Weeks-of-supply converts trailing demand into a clock, and the imbalance census finds lopsided pools before the weekend rush.",
      slugs: ["weeks-of-supply", "warehouse-manager", "find-stores-with-inventory-imbalance"],
    },
    {
      name: "Cluster boards and ranking",
      why: "The growth review opens on cluster leaderboards — baskets, revenue, average basket — ranked and tie-proofed. RANK vs DENSE_RANK vs ROW_NUMBER is not trivia here: monthly basket counts tie five ways in 2024 (8, 8, 8, 8, 8), and a board that splits ties silently invents a ranking nobody agreed to.",
      slugs: ["rank-scores", "department-top-three-salaries", "sort-the-olympic-table", "top-earners", "customer-placing-the-largest-number-of-orders", "the-most-recent-three-orders", "top-travellers", "most-frequently-ordered-product-per-customer", "maximum-transaction-each-day", "the-most-recent-orders-for-each-product"],
    },
    {
      name: "Two grains, one census",
      why: "Baskets AND households per cluster is the opening read — and the trap is counting both at one grain. COUNT(*) counts baskets (103); COUNT(DISTINCT customer_id) counts households (16); the gap is visit intensity, the number the loyalty team actually manages.",
      slugs: ["number-of-rich-customers", "daily-leads-and-partners", "article-views-ii", "unique-orders-and-customers-per-month", "product-sales-analysis-i", "product-sales-analysis-ii", "sales-analysis-iii", "combine-two-tables", "employee-bonus", "customer-order-frequency", "ratings-histogram", "find-books-with-polarized-opinions", "group-sold-products-by-the-date", "bank-account-summary", "create-a-session-bar-chart", "average-selling-price", "average-salary-of-departments", "the-number-of-users-that-are-eligible-for-discount", "game-play-analysis-i", "sales-by-day-of-the-week", "trips-and-users", "game-play-analysis-iv"],
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
      slugs: ["list-the-products-ordered-in-a-period", "monthly-transactions-i", "user-activity-for-the-past-30-days-i", "same-day-sale"],
    },
    {
      name: "Set-op stacks on the funnel",
      why: "Two populations, one board: landed and in-transit arms stacked over the dispatched baskets, paid and unsettled books stacked for the finance one-pager. UNION ALL is the default glue when the arms are disjoint by construction and bare UNION is a dedupe decision — the screen probes whether you can say which. INTERSECT and EXCEPT then answer the coverage questions (which paid bills carry no payment row — exactly one) without a LEFT JOIN in sight.",
      slugs: ["movie-rating", "count-salary-categories", "team-scores-in-football-tournament"],
    },
    {
      name: "Subquery shapes on the loyalty file",
      why: "Benchmarks and membership are the loyalty team's daily bread: households whose average basket beats the network's 338.19 (seven of sixteen qualify), the spend line just under a 7262.35 ceiling, per-cluster top households. Scalar, IN, EXISTS and derived shapes each bend differently — the graded part is naming which population each shape folds, and whether the benchmark sees the same rows the candidates see.",
      slugs: ["second-highest-salary", "department-highest-salary", "market-analysis-i"],
    },
    {
      name: "The dispatch calendar",
      why: "Latency is calendar math: julianday diffs averaging 2.98 days, two-baskets-within-seven-days replenishment signals, and the gap between baskets that becomes the lapse clock. DATE() and JULIANDAY() are where half-open windows and text-timestamp caveats stop being trivia and start being the dispatch read.",
      slugs: ["average-time-of-process-per-machine", "users-with-two-purchases-within-seven-days", "biggest-window-between-events"],
    },
    {
      name: "NULL policy and fallback guards",
      why: "shipped_at is NULL for 21 of 103 baskets and the gaps are information: COALESCE decisions (fall back to created_at, or leave the hole?), NULL-safe counts, and census hygiene. The screen grades whether a fallback is a stated policy or a silent rewrite of the metric.",
      slugs: ["books-with-null-ratings", "null-blank-audit", "analyze-subscription-conversion", "fix-product-name-format"],
    },
    {
      name: "Partition windows and the lapse clock",
      why: "Ranks inside clusters, running revenue for pacing charts, LAG deltas month-over-month and basket-to-basket — every one needs the fold staged before the window runs. PARTITION BY keeps the ranking honest per cluster (a 6640.56 US household tops its cluster even when EU's 7262.35 tops the network), and the first row's NULL is a policy statement, not a hole.",
      slugs: ["running-total-for-different-genders", "find-cumulative-salary-of-an-employee", "restaurant-growth"],
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
    {
      id: "sephora-t9",
      q: "The ops board stacks two populations: baskets still in play versus baskets that died in the cart. Walk me through UNION versus UNION ALL here — and what the stack silently demands of both arms.",
      a: "UNION ALL is the default and UNION is the exception. ALL keeps every row from both arms — the honest glue when the populations are disjoint by construction (a basket is either still in play — pending or shipped — or terminal: delivered, cancelled), and it's cheaper because no dedupe pass runs. A bare UNION sorts and deduplicates the combined set, which is only correct when dedupe IS the spec — arms that overlap (status IN ('delivered','shipped') stacked over status = 'delivered') collapse from 134 rows to 82, and the analyst who meant ALL has just deleted 52 real baskets from the board. The silent demand: both arms agree on column count and position — names come from the first arm, values coerce by affinity — so 'cluster, baskets' over 'cluster, revenue' compiles and lies. One ORDER BY at the very end sorts the whole stack; ORDER BY inside an arm is illegal. Add a literal label column ('in_play', 'terminal') so the reader can slice the stack — and reach for bare UNION only when dedupe is the business question.",
      tag: "setops",
    },
    {
      id: "sephora-t10",
      q: "Finance keeps asking 'which paid bills never got a payment row?' I've seen it solved with a LEFT JOIN … IS NULL and with EXCEPT. Same thing? Where does each bend?",
      a: "Same answer on a clean db, different physics at the edges. The anti-join — invoices LEFT JOIN payments … WHERE p.id IS NULL — keeps the left table's grain and carries its columns, which is what the dunning queue wants: 6 bills, 15217.00, with ids attached. EXCEPT — SELECT id FROM invoices WHERE status = 'paid' EXCEPT SELECT invoice_id FROM payments — compares SETS: it dedupes, it only returns the columns you projected, and it silently answers a narrower question when you filter the left arm (paid-status only: exactly one bill, the 1756.00 paid-but-unmoved anomaly). The bends: EXCEPT treats NULLs as equal — NOT IN never does, because one NULL in the right set poisons every comparison into UNKNOWN and the sweep returns zero rows; and the anti-join's IS NULL test must hit a right-side column that is genuinely NOT NULL or the test is meaningless. My default: anti-join when the queue needs attributes and row grain, EXCEPT when the question is literally set membership on single columns. Either way, narrate the population — 21 paid bills, 20 settled, and the difference IS the finding.",
      tag: "setops",
    },
    {
      id: "sephora-t11",
      q: "You're accumulating revenue across the year for a pacing chart: SUM over the month spine. A reviewer says the total 'jumps in blocks'. What's happening, and which frame do you ship?",
      a: "The default frame with an ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE treats ordering peers as one unit. On a revenue spine that's invisible (months don't tie), but the moment the ORDER BY carries a tie-prone key — monthly basket counts tie four ways at 8 in 2024, households tie across the spend ladder — the running total doesn't climb row by row; it leaps by the whole peer group at once. Correct under RANGE semantics, wrong on a chart that promises row-by-row accumulation. The fix is naming the frame: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW accumulates one row at a time (ties included, in whatever order the sort imposed — so add a deterministic tie-breaker), RANGE accumulates peer-block-wise. Neither is wrong; the pacing chart wants ROWS, a 'value as of this rank' read wants RANGE. The habit being graded: an explicit frame on every running aggregate is self-documenting SQL, and the day someone adds a tie-prone ORDER BY column, your stated frame survives while the inherited one quietly changes meaning.",
      tag: "windows",
    },
    {
      id: "sephora-t12",
      q: "Loyalty wants the days between each household's baskets — a lapse clock. Walk me through the LAG shape, and defend what you do with the first row.",
      a: "Stage the right grain first: LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at) puts each household's previous basket beside the current one, and a JULIANDAY diff turns the pair into days. If the clock should tick at the household grain, fold baskets per household first and LAG the folded rows — LAG-ing raw rows diffs consecutive baskets, a different and usually wrong clock. Two policies to defend out loud. First row: the earliest basket has no predecessor, so the gap is NULL — leave it NULL or print 'n/a'; COALESCE(gap, 0) asserts 'visited today', a claim nobody made, and a churn model will happily train on it. Partition edges: without PARTITION BY, December's gap silently crosses from one household's ledger into another's — the single most common lapse-clock bug. And LEAD is the same tool facing forward: next_basket IS NULL on each household's latest basket is precisely the still-active population — one window, both cohorts. State which edge you're reading before you compute it.",
      tag: "windows",
    },
    {
      id: "sephora-t13",
      q: "'Which baskets carry a Sampling-family SKU?' — I've seen candidates solve it with a JOIN, with IN, and with EXISTS. Interchangeable? Where does each bend?",
      a: "Same answer, different physics. The JOIN fans out — a basket with three scan lines appears three times, so a bare basket list triple-counts and needs DISTINCT to fold back; fine at 103 baskets, a dedupe tax at a hundred million. IN (SELECT …) materializes the subquery and answers membership — but x NOT IN (…) against a nullable column is the three-valued-logic trap: one NULL in the list and every comparison goes UNKNOWN, the filter returns nothing, and the board reads an empty shelf as a clean day. EXISTS short-circuits per outer row — 'does even one matching line exist?', stops at the first hit, is NULL-immune, never fans out. My ladder: EXISTS for semi-joins (presence questions, and the safe anti-join twin NOT EXISTS), IN when the subquery is small, static and provably NOT NULL, JOIN when I need columns from the far side — presence questions with attributes are joins; presence questions alone are not. The follow-up I'm listening for: 'which shape did you pick and what would change your mind?' — 'EXISTS, because the scan stream carries NULLs I don't control' is the answer that gets trusted with the production filter.",
      tag: "subqueries",
    },
    {
      id: "sephora-t14",
      q: "Freshness read: the most recent basket per household. You showed me a correlated scalar yesterday — show me the window shape, and say when each wins.",
      a: "The window shape is latest-per-group: ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) staged in a CTE, keep rn = 1. One pass over the stream, set-based, tie-proof — id DESC means two baskets stamped the same second resolve deterministically, not by storage luck. The correlated scalar — WHERE created_at = (SELECT MAX(created_at) FROM orders o2 WHERE o2.customer_id = o1.customer_id) — wins on simplicity for a one-off lookup and re-runs per outer row: fine at 16 households, a scan-per-household at a million. It also carries a subtler contract: ties. Two baskets sharing the latest timestamp return TWO rows for that household, while ROW_NUMBER returns exactly one — different dedupe stories, and you should say which population each shape leaves empty (never-ordered households appear in neither; that's an anti-join's job). The daily freshness scan ships the window; the ad-hoc 'when did member 7 last order' ships the scalar. Name the shape and the tie policy, then write it.",
      tag: "subqueries",
    },
    {
      id: "sephora-t15",
      q: "A read needs three layers: monthly baskets, the month-over-month delta, and each month's share of the year. CTE or nested subqueries — and what does WITH actually buy you?",
      a: "The moment the read has two grains, stage it. Nesting puts the monthly fold inside the delta's FROM inside the share's arithmetic — a matryoshka nobody can review, and the fold gets written twice if two layers need it. A CTE — WITH months AS (SELECT STRFTIME('%Y-%m', created_at) AS month, COUNT(*) AS baskets, SUM(total) AS revenue FROM orders GROUP BY month) — names the fold once, lets the LAG delta and the share both read FROM months, and turns the query into a pipeline a reviewer can walk: fold, then window, then ratio. What WITH buys: readability (named stages), reuse (one fold, many consumers), a place for per-stage comments. What it does NOT buy: performance — SQLite may inline the CTE and recompute it per reference, so a CTE is not a materialization guarantee; that's what temp tables or a real mart layer are for. The Sephora rule: two grains or more, name the fold. The follow-up 'is the CTE computed once or per reference?' separates people who've read a query plan from people who've only written CTEs.",
      tag: "subqueries",
    },
    {
      id: "sephora-t16",
      q: "One scan, four numbers: 52 delivered, 30 shipped, 14 pending, 7 cancelled. Sell me on FILTER (WHERE …) versus the CASE pivot I'd otherwise write.",
      a: "FILTER (WHERE …) is the readable census: COUNT(*) FILTER (WHERE status = 'delivered') AS landed, one SELECT, no GROUP BY, each aggregate carrying its own population in its own brackets — the 52/30/14/7 board in one pass. The CASE pivot — SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) — computes the same numbers and travels better across engines (FILTER is newer SQL; SQLite and Postgres have it, some engines don't), but it buries the population inside an expression and invites the classic ELSE mistakes: ELSE 0 is harmless for counts and lethal for averages — AVG(CASE WHEN shipped_at IS NOT NULL THEN latency END) and AVG(… ELSE 0) are different metrics wearing the same alias, because the ELSE 0 version drags every undispatched basket into the mean as a zero-day ship. My sell: FILTER for the census board (the population IS the headline), CASE when the value must vary by row or the target engine predates FILTER — and either way, one scan, one definition block, names that match the dashboard.",
      tag: "aggregation",
    },
    {
      id: "sephora-t17",
      q: "A candidate wrote SELECT SUM(total) AS revenue … WHERE revenue > 1000 and called the error a database bug. Walk me through the pipeline order that explains it — and where aliases DO work.",
      a: "Logical evaluation runs FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. The alias is born in SELECT — after WHERE — so 'WHERE revenue > 1000' references a column that doesn't exist yet and the engine rightly objects; the fix is restating the expression or staging the fold in a CTE and filtering the named stage. The asymmetry is the teaching point: ORDER BY runs last and CAN see aliases ('ORDER BY revenue DESC' works), while HAVING sits between — SQLite happens to tolerate SELECT aliases in HAVING, standard SQL doesn't, and code that leans on the tolerance breaks the day it ports. GROUP BY has its own trap: grouping by a SELECT alias works in SQLite but not everywhere — group by the base expression when the query must travel. The habit being graded: know which clause can see which names, because 'it works on my machine' is not a pipeline argument — the evaluation order IS the argument, and being able to recite it is what turns a cryptic error message into a thirty-second fix.",
      tag: "pipeline",
    },
    {
      id: "sephora-t18",
      q: "Store ops wants a bin manifest: every category in the day's pickups stitched into one cell. What's the tool, and what are its sharp edges?",
      a: "GROUP_CONCAT — GROUP_CONCAT(DISTINCT p.category) over the baskets-to-lines-to-SKUs join, grouped by the day key. The edges are all grain and order. Grain: the join fans 103 baskets into 251 lines, and GROUP_CONCAT is a fold like SUM — one cell per group, so it belongs at the day grain with the join fanning INTO it, never the reverse. Order: without an ORDER BY inside the aggregate the stitch order is engine-arbitrary — two runs of the same query can print 'Audio,Electronics' then 'Electronics,Audio', and ops notices before analysts do; SQLite forbids ORDER BY inside a DISTINCT aggregate, so determinism needs a pre-sorted subquery or a post-process. Separator: the default is a comma — pass the second argument when the values themselves contain commas. Size: the result is bounded, so a monster day truncates silently — test the ceiling. And the architectural edge: a comma-joined cell is a DISPLAY artifact — the moment someone splits it back out to count on, you've built a CSV inside a column. Fold for humans; keep the rows for math.",
      tag: "aggregation",
    },
    {
      id: "sephora-t19",
      q: "Dispatch pairing wants 'the basket that rebaskets the next day'. Show me the date arithmetic — and where DATE() and JULIANDAY() each earn their seat.",
      a: "Two tools, two jobs. DATE(created_at, '+1 day') produces a comparable calendar key — the self-join shape: FROM orders a JOIN orders b ON b.customer_id = a.customer_id AND DATE(b.created_at) = DATE(a.created_at, '+1 day') finds the next-day rebasket, the replenishment signal the counter team calls back on. JULIANDAY converts to a real number of days — fractional, so a basket placed 09:00 and dispatched 15:00 next day reads 1.25, and the 2.98-day latency average is exactly that arithmetic rounded once at the end. The traps: JULIANDAY(NULL) is NULL, so the population filter (82 of 103) comes first; DATE on malformed TEXT returns NULL silently, which shows up as a missing join match rather than an error; and comparing a DATE() key to raw TEXT works only while both stay ISO 'YYYY-MM-DD' — one loose timestamp and the pairing quietly drops rows. Calendar spines (a CTE of dates LEFT JOINed to the stream) are the third move when zero-basket days must appear. State the convention — key-grain DATE, arithmetic JULIANDAY — then query it.",
      tag: "dates",
    },
    {
      id: "sephora-t20",
      q: "NULLs again, but deeper: NULLIF, NULL = NULL, and what MIN/MAX/AVG do with an all-NULL group. Give me the policy you'd defend on a loyalty table.",
      a: "Three behaviors, one policy. Behavior one: NULL = NULL is UNKNOWN — never TRUE — so joins and equality filters never match NULLs to themselves; that's why IS NULL exists and why a 'dedupe on equal keys' query silently keeps NULL-keyed duplicates. Behavior two: aggregates skip NULLs — COUNT(col) versus COUNT(*), and a group whose column is all-NULL gets MIN/MAX/AVG = NULL, not zero; SUM over all-NULL is NULL while SUM with an ELSE 0 arm is 0 — those are different claims about the same absence. Behavior three: NULLIF(a, b) turns equals into NULLs — the sentinel-buster: NULLIF(discount, 0) makes a default-zero discount un-averageable, and COALESCE(x, fallback) is a DISPLAY decision that must never masquerade as measurement (COALESCE(gap, 0) on the lapse clock asserts 'visited today'). My policy on a loyalty table: never COALESCE into an aggregate's input, state every IS NULL population in the subtitle, and treat each NULL as one of 'missing', 'not yet', 'not applicable' — three different NULLs that roll up three different ways.",
      tag: "nulls",
    },
    {
      id: "sephora-t21",
      q: "Define the Insider tier mix the way you'd build it: what's the grain, what's the band, and where do these definitions go wrong in reviews?",
      a: "Grain first: a tier attaches to a HOUSEHOLD, not a basket — fold lifetime spend per customer_id, then band. The banding is a CASE over the fold: CASE WHEN spend >= 3000 THEN 'rouge_line' WHEN spend >= 2000 THEN 'vib_line' ELSE 'insider' END — and the thresholds are business policy (this db's floor: four households at 3000-plus carry 63.5% of the book), never SQL constants smuggled in without the deck's sign-off. Where it goes wrong: averaging basket-level band assignments instead of banding the household fold (a member's 24 baskets don't get 24 tiers); letting the 7 cancelled baskets in or out of 'lifetime' without saying so; and printing the mix as percentages without the household count — '75% Insider' of 16 households is twelve people, a segment the size of a dinner table. The review-grade answer states the denominator (16 households, one at 24 baskets, one at 17), the fold, and the band edges — then the mix is a fact instead of a vibe.",
      tag: "kpi",
    },
    {
      id: "sephora-t22",
      q: "Define cross-sell attach rate for me — the counter team says Accessories 'attaches at half the book'. Make the number precise.",
      a: "Attach rate = baskets carrying the family ÷ the basket base — and both sides of that ratio are decisions. Numerator: COUNT(DISTINCT o.id) where the scan lines touch the family — Accessories rides 54 of 103 baskets on this db; DISTINCT is non-negotiable because a basket with three Accessories lines is ONE attached basket, and the 251-line fan-out otherwise inflates the numerator. Denominator: placed (103) or kept (96, cancelled excluded)? The counter team argues attach on placed demand — the till doesn't know the basket will be cancelled — but the merch retro often wants kept. Whichever ships, the subtitle states it. The sibling metrics: lines per basket (251 ÷ 103 = 2.44) is DEPTH — how many units, any family; attach is BREADTH — how many baskets a family touches. A promo that lifts attach while depth falls is a sampling win; a lift in depth with flat attach is the same buyers buying more of the same. Two folds, one decision each — that's the whole KPI.",
      tag: "kpi",
    },
    {
      id: "sephora-t23",
      q: "Points liability: loyalty keeps talking about it, but there's no points table in the warehouse. What do you build, and what do you refuse to invent?",
      a: "You build the accrual shape from what exists and refuse to fake the redemption side. Accrued is computable honestly: points are a multiplier on spend, so accrual is a fold over kept baskets — spend × tier multiplier per household, the 7 cancelled baskets excluded by a stated rule (including them overstates accrual by the value of demand that died in the cart). The earned column is then a running SUM over the household's basket timeline, and 'points at risk' is the accrued balance of households showing lapse-clock gaps — LAG between baskets beyond the program's dormancy window. What I refuse: inventing a redemption rate, expiring points on a guess, or quoting a single 'liability' number without the rule card — multiplier per tier, cancellation policy, dormancy window, rounding. The discipline the screens grade: a liability estimate is a DEFINITION with a number attached, and the definition card ships beside the figure or the figure doesn't ship. Same muscle as the kept-basket denominator: state it, or it's a rumor in a retailer that audits its own dashboards.",
      tag: "kpi",
    },
    {
      id: "sephora-t24",
      q: "The pace board went from instant to slow after someone 'made the month key cleaner' with SUBSTR(created_at, 1, 7). Same results, slower query — teach me why, and what you do instead.",
      a: "Sargability. A predicate or join key wrapped in a function — SUBSTR(created_at, 1, 7) = '2024-07', UPPER(email) = …, julianday(created_at) BETWEEN … — forces the engine to evaluate the function per row, which blinds any index on the raw column: the plan degrades from a seek to a full scan. At 103 rows nobody notices; the habit is what's being graded, because the same pattern at a hundred million rows is an outage. The fixes, in order of preference: range predicates on the raw column (created_at >= '2024-07-01' AND created_at < '2024-08-01') — sargable, index-friendly, boundary-explicit; an expression index when the function form is unavoidable (SQLite indexes expressions directly); or leave the function in the GROUP BY, which folds everything anyway and needs no seek. The instinct to grade: functions are free in SELECT, expensive in WHERE and JOIN — decorate the output, not the filter. A candidate who can split a slow query into 'the fold is fine, the filter isn't sargable' is a candidate who has read an actual plan.",
      tag: "perf",
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
    {
      id: "sephora-mcq-11",
      prompt: "The promo retro buckets baskets by month. Which pair of expressions BOTH produce '2024-07' from the TEXT column created_at?",
      choices: [
        "STRFTIME('%Y-%m', created_at) and SUBSTR(created_at, 1, 7)",
        "STRFTIME('%m', created_at) and SUBSTR(created_at, 6, 2)",
        "STRFTIME('%Y', created_at) and SUBSTR(created_at, 1, 4)",
        "DATE(created_at, 'start of month') and SUBSTR(created_at, 9, 2)",
      ],
      answer: 0,
      why: "'%Y-%m' renders '2024-07', and the first 7 characters of an ISO timestamp are '2024-07' — two spellings of one bucket key, and the month spine groups on either. The dB's monthly trend (8, 9, 8, 7, …) buckets cleanly with both.",
      notes: [
        { choice: 1, why: "'%m' alone is '07' — it collides across years the moment 2025's July joins the same board, which this db's range (2024-01 through 2025-02) actually crosses." },
        { choice: 3, why: "'start of month' yields a full date '2024-07-01' — a different key that sorts fine but won't match the spine's text values in a join or a filter." },
      ],
      difficulty: "easy",
    },
    {
      id: "sephora-mcq-12",
      prompt: "The bin-packing manifest folds each day's categories into one cell. What does GROUP_CONCAT(DISTINCT p.category) print for a day that scanned Audio twice and Electronics once?",
      choices: [
        "Audio,Electronics — DISTINCT dedupes and the default separator is a comma",
        "Audio,Audio,Electronics — DISTINCT needs a separate keyword per column",
        "Audio;Electronics — the default separator is a semicolon",
        "Audio Electronics — the default separator is a space",
      ],
      answer: 0,
      why: "GROUP_CONCAT's default separator is ',' and DISTINCT folds duplicate values BEFORE the stitch, so the cell reads Audio,Electronics — the manifest shows the shelf mix, not the scan multiplicity.",
      notes: [
        { choice: 1, why: "The DISTINCT is already inside the aggregate — duplicates are gone before the fold. A second DISTINCT keyword would be a syntax error." },
        { choice: 2, why: "The default is a comma; the semicolon version needs GROUP_CONCAT(x, ';'). Be careful: SQLite forbids ORDER BY inside a DISTINCT aggregate." },
      ],
      difficulty: "easy",
    },
    {
      id: "sephora-mcq-13",
      prompt: "One pass, no GROUP BY: which expression prints the cancelled-basket count — 7 on this db — beside the 52/30/14 arms?",
      choices: [
        "COUNT(*) FILTER (WHERE status = 'cancelled')",
        "COUNT(status) FILTER (WHERE 'cancelled')",
        "SUM(status) WHERE cancelled",
        "COUNT('cancelled')",
      ],
      answer: 0,
      why: "FILTER (WHERE …) scopes one aggregate to its own population in a single scan — COUNT(*) FILTER (WHERE status = 'cancelled') = 7 in the same SELECT that prints 52, 30 and 14.",
      notes: [
        { choice: 1, why: "FILTER's grammar takes a WHERE clause, not a bare literal — FILTER (WHERE 'cancelled') filters on a constant TRUE, counting every row." },
        { choice: 3, why: "COUNT('cancelled') counts a constant — that's every row of the scan, i.e. 103, wearing the cancelled count's name." },
      ],
      difficulty: "easy",
    },
    {
      id: "sephora-mcq-14",
      prompt: "Two arms: status IN ('delivered','shipped') returns 82 basket ids; status = 'delivered' returns 52. What do bare UNION and UNION ALL print on the stack?",
      choices: [
        "82 and 134 — the overlap is deduped only by bare UNION",
        "134 and 82 — ALL dedupes, bare UNION keeps everything",
        "82 and 82 — both collapse duplicates",
        "134 and 134 — arms always concatenate",
      ],
      answer: 0,
      why: "The delivered arm sits fully inside the 82-row arm, so UNION ALL concatenates to 134 while bare UNION dedupes the overlap back to 82. Disjoint arms make the two identical; overlapping arms make ALL a double-count.",
      notes: [
        { choice: 1, why: "Backwards — ALL is the one that keeps everything. Saying it the other way around is how a board double-counts 52 baskets." },
        { choice: 3, why: "Bare UNION never concatenates blindly — it sorts and dedupes. That's its whole cost and its whole purpose." },
      ],
      difficulty: "medium",
    },
    {
      id: "sephora-mcq-15",
      prompt: "Finance wants paid bills that never received a payment row: SELECT id FROM invoices WHERE status = 'paid' EXCEPT SELECT invoice_id FROM payments. What comes back?",
      choices: [
        "1 row — the 1756.00 bill, paid in status and silent in payments",
        "6 rows — every zero-payment bill joins the queue",
        "0 rows — paid status guarantees a payment row",
        "21 rows — all paid bills",
      ],
      answer: 0,
      why: "21 bills carry paid status but only 20 have payment rows; EXCEPT subtracts the settled ones and leaves exactly the id-28 anomaly worth 1756.00 — the paid-but-unmoved bill the sweep exists to catch.",
      notes: [
        { choice: 1, why: "The 6 zero-payment bills span statuses — five are open. Starting the left arm from paid status narrows the question to exactly one row." },
        { choice: 2, why: "That assumption is the anomaly. The EXCEPT is how you prove paid status and payment presence are different populations." },
      ],
      difficulty: "medium",
    },
    {
      id: "sephora-mcq-16",
      prompt: "The dunning sweep reads WHERE id NOT IN (SELECT invoice_id FROM payments). The day a payments row lands with a NULL invoice_id, what happens — and what's the NULL-immune rewrite?",
      choices: [
        "The NOT IN returns nothing; rewrite as NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)",
        "The NOT IN ignores the NULL and keeps working; the rewrite is cosmetic",
        "The NOT IN errors at parse time; rewrite as a LEFT JOIN",
        "Nothing changes; NULLs are filtered from subqueries automatically",
      ],
      answer: 0,
      why: "x NOT IN (…, NULL) can never be proven TRUE — every comparison goes UNKNOWN — so the sweep silently returns zero rows exactly when data quality slipped. NOT EXISTS tests each pair and is NULL-immune.",
      notes: [
        { choice: 1, why: "That's the trap: no error, no warning — just an empty dunning queue while the exposure sits at 15217.00." },
        { choice: 2, why: "It parses fine; the failure is semantic. A LEFT JOIN … IS NULL rewrite also works, but NOT EXISTS keeps the intent readable." },
      ],
      difficulty: "medium",
    },
    {
      id: "sephora-mcq-17",
      prompt: "Loyalty wants households whose average basket beats the network's 338.19 — seven of sixteen qualify. Which shape guarantees the benchmark covers the same population as the candidates?",
      choices: [
        "HAVING AVG(total) > (SELECT AVG(total) FROM orders) — one fold, one population",
        "Filter cancelled baskets out of the household fold but keep the network average over all 103",
        "Compare each household's AVG against 338.19 hard-coded",
        "Fold households over delivered baskets only and benchmark over shipped",
      ],
      answer: 0,
      why: "The scalar subquery computes 338.19 from the same 103-basket population the household folds read — one definition, one comparison. Seven households clear it.",
      notes: [
        { choice: 1, why: "Swapped populations turn one claim into two — a 359-vs-331 comparison wearing one slide. Benchmark and candidates must fold the same rows." },
        { choice: 2, why: "Hard-coding freezes a moving benchmark: fine for a printed deck, wrong for a query that re-runs after the next event." },
      ],
      difficulty: "hard",
    },
    {
      id: "sephora-mcq-18",
      prompt: "The month-over-month pace spine computes revenue - LAG(revenue) OVER (ORDER BY month). What does the FIRST month print, and what's the honest display?",
      choices: [
        "NULL — there is no prior month; render it 'n/a', not 0",
        "0 — LAG wraps to the last row",
        "The first month's own revenue — LAG defaults to self",
        "An error — LAG requires a PARTITION BY",
      ],
      answer: 0,
      why: "LAG has no row before 2024-01, so the delta is NULL — information, not a hole. COALESCE(delta, 0) asserts 'flat', a claim nobody made, and a growth board will happily annualize a fake flat January.",
      notes: [
        { choice: 1, why: "LAG never wraps; the third argument defaults to NULL unless you pass one deliberately — and passing 0 is a definitional lie, not a default." },
        { choice: 3, why: "PARTITION BY is optional — ORDER BY alone is a valid window over the whole folded set." },
      ],
      difficulty: "medium",
    },
    {
      id: "sephora-mcq-19",
      prompt: "Dispatch latency: julianday(shipped_at) - julianday(created_at) averages 2.9756 over the 82 dispatched baskets. Which expression prints the board's 2.98?",
      choices: [
        "ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2)",
        "ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 0)",
        "CAST(AVG(julianday(shipped_at) - julianday(created_at)) AS INTEGER)",
        "AVG(CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER))",
      ],
      answer: 0,
      why: "Fold first over the raw fractional diffs, round once at the display edge: 2.9756 → 2.98. The population filter (shipped_at IS NOT NULL) rides in the WHERE — the 82 of 103.",
      notes: [
        { choice: 1, why: "Rounds to 3 — a latency that flatters by two hundredths of a day, re-lie-ing on every deck re-run." },
        { choice: 2, why: "Truncates to 2 — the opposite lie. And choice 3 rounds per-row BEFORE the fold, a different metric wearing the same alias." },
      ],
      difficulty: "hard",
    },
    {
      id: "sephora-mcq-20",
      prompt: "The coverage census must classify every bill as exact, partial or none — 21 / 1 / 6 on this db. Which HAVING arm isolates the partial bill (6148.00 billed, 4000.00 paid)?",
      choices: [
        "SUM(p.amount_cents) > 0 AND SUM(p.amount_cents) < i.amount_cents",
        "SUM(p.amount_cents) = i.amount_cents",
        "COUNT(p.id) = 0",
        "SUM(p.amount_cents) IS NULL",
      ],
      answer: 0,
      why: "Partial means some money moved but not all — the payout sum sits strictly between zero and the bill. That's the one bill in the partial class: 4000.00 of 6148.00.",
      notes: [
        { choice: 1, why: "That's the exact arm — 21 bills worth 65612.00." },
        { choice: 2, why: "Same class as choice 3's: the none arm — 6 bills worth 15217.00, SUM IS NULL where no payment row exists at all." },
      ],
      difficulty: "hard",
    },
    {
      id: "sephora-mcq-21",
      prompt: "The mean settlement reads AVG(amount_cents) over the 28 vendor bills. Which expression prints it in dollars?",
      choices: [
        "AVG(amount_cents) / 100.0",
        "SUM(amount_cents) / COUNT(*) / 100",
        "ROUND(AVG(amount_cents), 2)",
        "AVG(amount_cents) * 100",
      ],
      answer: 0,
      why: "The cents mean is 310632.14…; dividing by 100.0 reads 3106.32 dollars — promote once, at the display edge.",
      notes: [
        { choice: 1, why: "SUM/COUNT is INTEGER ÷ INTEGER in SQLite — 8697700/28 floors to 310632, and the second division by the integer 100 truncates again: 3106, not 3106.32." },
        { choice: 2, why: "That prints 310632.14 — cents wearing the dollar alias. Magnitude-check every money fold: dollars are smaller than cents, never larger." },
      ],
      difficulty: "easy",
    },
    {
      id: "sephora-mcq-22",
      prompt: "The pace spine names its fold ROUND(SUM(o.total), 2) AS revenue, then writes WHERE revenue >= 1000. What happens?",
      choices: [
        "Error — WHERE runs before SELECT, so the alias doesn't exist yet",
        "Works — SELECT aliases are visible everywhere",
        "Silently treats revenue as 0 and returns everything",
        "Works, but only when GROUP BY is present",
      ],
      answer: 0,
      why: "Logical evaluation runs FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY: the alias is born in SELECT, after WHERE. Restate the expression or stage the fold in a CTE and filter the named stage.",
      notes: [
        { choice: 1, why: "The asymmetry is the lesson: ORDER BY CAN see aliases because it runs last — WHERE cannot, and neither can standard-SQL HAVING." },
        { choice: 3, why: "GROUP BY presence changes nothing about WHERE's visibility — the pipeline order is fixed regardless of aggregation." },
      ],
      difficulty: "medium",
    },
    {
      id: "sephora-mcq-23",
      prompt: "The lapse read computes LEAD(created_at) OVER (PARTITION BY customer_id ORDER BY created_at) AS next_basket. What does each household's LAST basket carry in that column?",
      choices: [
        "NULL — there is no next basket",
        "The household's first basket — LEAD wraps around",
        "0",
        "The household's own created_at",
      ],
      answer: 0,
      why: "LEAD past the partition's end is NULL — the lapse clock simply has no next tick for the latest basket, and that NULL set IS the still-active population.",
      notes: [
        { choice: 1, why: "Wraparound is a COALESCE fantasy; if a downstream model needs a value, that's a stated policy, not a window-function default." },
        { choice: 3, why: "LEAD's default offset is 1 row FORWARD, not self — LAG is the one that looks backwards, also NULL on the first row." },
      ],
      difficulty: "easy",
    },
    {
      id: "sephora-mcq-24",
      prompt: "The pace spine folds months (2024-01 revenue 3731.97, 2024-02 3609.64). Which shape prints February's delta as -122.33?",
      choices: [
        "Fold months in a CTE, then ROUND(revenue - LAG(revenue) OVER (ORDER BY month), 2)",
        "LAG(total) OVER (ORDER BY created_at) computed on raw orders",
        "ROUND(SUM(total) - LAG(SUM(total)), 2) inside the month GROUP BY",
        "ROUND(LEAD(revenue) OVER (ORDER BY month) - revenue, 2)",
      ],
      answer: 0,
      why: "LAG runs over the FOLDED month rows — one CTE stage, then the delta: 3609.64 - 3731.97 = -122.33. The fold exists once; the window consumes it.",
      notes: [
        { choice: 1, why: "LAG over the raw 103 baskets diffs consecutive BASKETS — a plausible-looking number that measures nothing the deck promised." },
        { choice: 2, why: "Nested aggregates need the fold staged first; the bare version is an error, and the pipeline order is the proof." },
        { choice: 3, why: "That's NEXT month minus current — March's -122.33 would wear February's name on the board." },
      ],
      difficulty: "hard",
    },
    {
      id: "sephora-mcq-25",
      prompt: "The catalog anti-join — products with no scan lines — returns 0 rows on this db. What does the analyst report?",
      choices: [
        "Zero, as a verified result: every one of the 16 SKUs scanned at least once",
        "Rerun until rows appear — zero means the query broke",
        "Drop the zero and move to the next metric",
        "Report the 16 products as never-scanned",
      ],
      answer: 0,
      why: "Never-ordered products are 0 here — the honest zero IS the finding, and reporting it as a verified result is the anti-join discipline the screen grades.",
      notes: [
        { choice: 1, why: "A fully-crossed catalog is exactly what the facts say; shipping 'the query broke' trains nobody and hides the real question — which SKUs scanned THIN." },
        { choice: 2, why: "The thin-stock census is the follow-up: 14, 15 and 17 units of cover — that's where the zero-adjacent story actually lives." },
      ],
      difficulty: "easy",
    },
    {
      id: "sephora-mcq-26",
      prompt: "Household spend ranked per market cluster: RANK() OVER (PARTITION BY region ORDER BY spend DESC). The US household at 6640.56 — what rank, and what without the PARTITION BY?",
      choices: [
        "1 in the US; 2 network-wide",
        "2 everywhere — spend is spend",
        "1 everywhere — it's the top US spender",
        "2 in the US; 1 network-wide",
      ],
      answer: 0,
      why: "6640.56 tops the US cluster (rank 1) but sits behind EU's 7262.35 globally (rank 2) — PARTITION BY is the difference between the cluster board and the network board.",
      notes: [
        { choice: 1, why: "Without PARTITION the window folds all 16 households into one ranking — same numbers, different claim, different meeting." },
        { choice: 3, why: "The network lead is 7262.35, not the US number — the board that ranks without partitions has already decided which geography owns rank 1." },
      ],
      difficulty: "medium",
    },
    {
      id: "sephora-mcq-27",
      prompt: "The day-manifest's category cell prints 'Audio,Electronics' on the morning run and 'Electronics,Audio' after lunch. The query didn't change. What's true?",
      choices: [
        "GROUP_CONCAT's stitch order is engine-arbitrary without an ORDER BY inside the fold — two runs can differ",
        "SQLite cached the first result and replays it",
        "DISTINCT forces alphabetical order",
        "The underlying rows changed between runs",
      ],
      answer: 0,
      why: "Without ORDER BY inside the aggregate, concatenation order follows whatever the scan produced — display-order instability, not data drift. SQLite forbids ORDER BY inside a DISTINCT aggregate, so determinism needs a pre-sorted subquery.",
      notes: [
        { choice: 2, why: "DISTINCT dedupes; it does not sort. The comma cell is a DISPLAY artifact — the moment someone splits it to count on, go back to the rows." },
        { choice: 3, why: "Possible in principle, but the diagnosis you state first is the order-dependence — that's what the two runs just proved." },
      ],
      difficulty: "medium",
    },
    {
      id: "sephora-mcq-28",
      prompt: "Settlement speed: 28.4 days average. Why does the subtitle say 'over the 20 bills that carry payment rows' — not the 21 paid bills?",
      choices: [
        "One paid bill (1756.00) has zero payment rows, so it has no settlement date to diff",
        "One paid bill is missing its issue date",
        "The average only covers card payments",
        "20 is the open-book count",
      ],
      answer: 0,
      why: "The JOIN to payments keeps only bills with at least one row — 20 of 21 paid bills; the 21st is the paid-but-unmoved anomaly the zero-payment sweep flags separately. Name the excluded row in the subtitle.",
      notes: [
        { choice: 1, why: "Population drift like that turns a KPI into a coin flip: 28.4 over 20 is a claim about a named population, and the sweep holds the excluded row as evidence." },
        { choice: 3, why: "The open book is 6 bills worth 19609.00 — a different population entirely, and quoting it as a settlement count is the definition swap the audit catches." },
      ],
      difficulty: "medium",
    },
    {
      id: "sephora-mcq-29",
      prompt: "Replenishment cover folds stock minus sold per SKU (headset 14, mic 15, smart watch 17). How many SKUs sit at cover of 15 or less?",
      choices: [
        "2 — the 14 and the 15",
        "3 — the whole thin trio",
        "1 — only single-digit covers",
        "0 — cover is always positive",
      ],
      answer: 0,
      why: "The fold is stock - SUM(quantity) over scan lines: 60-46=14 and 45-30=15 clear the bar; the watch at 17 just misses it. The threshold and the fold have to be stated together.",
      notes: [
        { choice: 1, why: "17 > 15 — the trio is the story, the census is the count. A threshold that quietly includes the boundary SKU it excludes is how restock lists grow." },
        { choice: 3, why: "A CASE arm without the fold's population filter is how 'replenish_now' lists drift — state the fold, then band it." },
      ],
      difficulty: "hard",
    },
    {
      id: "sephora-mcq-30",
      prompt: "The QBR wants each household's share of the 34833.28 book — the top household prints 20.85. Which shape computes every share in one pass?",
      choices: [
        "CTE the household fold, then ROUND(100.0 * spend / SUM(spend) OVER (), 2)",
        "ROUND(100.0 * total / SUM(total), 2) inside a GROUP BY customer_id",
        "ROUND(100.0 * spend / SUM(spend) OVER (PARTITION BY region), 2)",
        "100 * spend / 34833.28 with the total hard-coded",
      ],
      answer: 0,
      why: "Fold to households first (7262.35 for the leader), then the windowed SUM over the whole fold gives the denominator: 7262.35 / 34833.28 → 20.85. Fold, then window — the two-stage shape every share read needs.",
      notes: [
        { choice: 1, why: "Mixing the row grain (total per basket) with the fold's denominator mis-shares every line of the 251-row fan-out." },
        { choice: 2, why: "PARTITION BY region shares against the CLUSTER book — a different claim wearing the same column name." },
        { choice: 3, why: "Hard-coding the denominator works once and lies the moment the book moves; the windowed fold recomputes it every run." },
      ],
      difficulty: "hard",
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
    {
      id: "cs-sephora-3",
      tier: "hard",
      topic: "t5",
      universe: "growth",
      title: "The Insider rung ladder",
      brief:
        "The loyalty quarterly opens on the rung ladder, and the growth lead is explicit: 'rungs are dense — tied households share a rung and no rung number goes missing.' The ladder reads thinnest habit first over the nine households that clear the 4-basket habit gate: the 4-basket tie (Pedro Alvarez 1686.17, Keiko Sato 1098.6, Isabella Rossi 985.65, Noah Meyer 737.68) shares rung 1, Chloe Dubois' 5-basket 2667.93 book opens rung 2, and the power ladders climb Maya Patel (3644.56), Grace Kim (4574.23) and Emma Wilson (6640.56) to Alice Chen's 24-basket, 7262.35 anchor. Lifetime spend is the tie-break inside each rung, richest first.",
      ask:
        "Return each gated household: name, lifetime spend (2dp), basket count and dense rung — rung order, spend as the tie-break.",
      template:
        "SELECT c.name AS member,\n       ROUND(SUM(o.total), 2) AS lifetime_spend,\n       COUNT(*) AS baskets,\n       {2}() OVER (ORDER BY COUNT(*) {3}) AS rung\nFROM orders o\nJOIN customers c ON c.id = o.{5}\nGROUP BY c.name\nHAVING COUNT(*) >= {1}\nORDER BY rung, lifetime_spend {4};",
      slots: [
        {
          answer: "4",
          kind: "number",
          label: "the habit gate",
          why: "HAVING COUNT(*) >= 4 keeps the nine households with a real habit book — the 4-basket tie, Chloe's 5, and the 13/14/17/24 power ladders. 4 is also a result cell: the tied households' basket count is the gate itself.",
        },
        {
          answer: "DENSE_RANK",
          kind: "keyword",
          label: "the shared-rung ladder",
          why: "Tied rungs share and no number goes missing: the four 4-basket households all sit at rung 1 and Chloe opens rung 2. RANK would hand her rung 5 — the tie gap the ladder is defined against.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the thinnest-first direction",
          why: "The call list reads thinnest habit first, so rung 1 is the 4-basket tie. DESC would invert the ladder and make Alice's 24-basket whale rung 1 — a different meeting.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the spend tie-break",
          why: "Inside rung 1, money breaks the tie: Pedro 1686.17, Keiko 1098.6, Isabella 985.65, Noah 737.68. ASC would bury the biggest spend under the smallest within every shared rung.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the household key",
          why: "Baskets attach to households through c.id = o.customer_id; joining on o.id pairs each basket with whatever household shares its row number, every count collapses to 1 and the gate empties the ladder.",
        },
      ],
      distractors: ["RANK", "ROW_NUMBER", "id", "20", "5"],
      walkthrough:
        "A rung ladder is a fold, a gate and a window in one pass. GROUP BY c.name folds 103 baskets into 16 households; the HAVING gate at 4 keeps the nine with a real habit book — the 4-basket tie (Pedro 1686.17, Keiko 1098.6, Isabella 985.65, Noah 737.68), Chloe's 5-basket 2667.93, and the power ladders Maya 3644.56, Grace 4574.23, Emma 6640.56, Alice 7262.35. DENSE_RANK() OVER (ORDER BY COUNT(*) ASC) shares rung 1 four ways and opens rung 2 for Chloe; the tie-break inside each rung is lifetime spend DESC, richest first. The distractors encode the ladder bugs: RANK inserts the tie gap and hands Chloe rung 5; ROW_NUMBER numbers the tied households 1-4 as if the tie didn't exist; DESC on the window reads the ladder whale-first; ASC on the tie-break orders rung 1 cheapest-first; id joins baskets to the wrong key and empties the ladder; 20 gates down to Alice alone; 5 drops the whole 4-basket rung. Gate, ladder, direction, tie-break, key — five decisions, and each distractor breaks exactly one.",
    },
    {
      id: "cs-sephora-4",
      tier: "medium",
      topic: "t7",
      universe: "month-close",
      title: "The month-close delta board",
      brief:
        "The month-close deck opens on the basket trend, cut at the 2024-12 close, and the close lead is explicit: 'deltas read against the prior KEPT month — a gap month is a break in the series, not a zero.' Probed facts: the opening book is 2024-01 at 8 baskets worth 3731.97, February follows at 9 baskets and 3609.64, and the close lands at 7 baskets and 2101.47; the thin months — 2024-06, 2024-11 and 2025-01 at 6 baskets — drop out of the trend. Every month that clears the 7-basket bar gets a row, and each row carries its revenue move against the prior kept month.",
      ask:
        "Return the gated monthly trend: month, baskets, revenue (2dp) and the MoM revenue delta (2dp) — calendar order.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         COUNT(*) AS baskets,\n         ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  WHERE SUBSTR(created_at, 1, 7) <= {2}\n  GROUP BY month\n  HAVING COUNT(*) >= {1}\n)\nSELECT month,\n       baskets,\n       revenue,\n       ROUND(revenue - {3}(revenue) OVER (ORDER BY {4}), 2) AS delta\nFROM monthly\nORDER BY month {5};",
      slots: [
        {
          answer: "7",
          kind: "number",
          label: "the thin-month gate",
          why: "HAVING COUNT(*) >= 7 keeps the ten months with a real book and drops the three 6-basket months. 7 is also a result cell — four kept months sit exactly on the gate, which is why it reads as the materiality bar.",
        },
        {
          answer: "'2024-12'",
          kind: "keyword",
          label: "the close cut",
          why: "The deck is the 2024 close, so the cut keeps months through '2024-12' and leaves the new year out of a 2024 retrospective. A later cut would drag 2025 into a series it doesn't belong to.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the look-back",
          why: "Each month's delta is revenue minus the PRIOR kept month: LAG(revenue) pairs February's 3609.64 against January's 3731.97. LEAD would pair each month against its successor and run the series backwards.",
        },
        {
          answer: "month",
          kind: "keyword",
          label: "the calendar order",
          why: "The window walks the calendar: OVER (ORDER BY month) makes 'prior' mean the month before. Ordering by revenue or baskets would pair months by size and print deltas between months that were never adjacent.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the forward direction",
          why: "The board reads January to December; ASC keeps the series moving forward. DESC would open the deck on the 2024-12 close and read the year backwards.",
        },
      ],
      distractors: ["LEAD", "DESC", "revenue", "baskets"],
      walkthrough:
        "A month-close trend is three stages: bucket, gate, look back. SUBSTR(created_at, 1, 7) buckets 103 baskets into month strings; the WHERE cut at '2024-12' bounds the series; HAVING COUNT(*) >= 7 drops the thin months. LAG(revenue) OVER (ORDER BY month) then pairs each kept month with the one before: 2024-01 opens the series with no prior (NULL delta), 2024-02 prints 3609.64 minus 3731.97, and 2024-07's 1193.86 books its move against 2024-05's 2910.31 — the gap month's break made visible instead of smoothed away. The distractors encode the trend bugs: LEAD runs the pairing forward and flips every sign; DESC reads the year from the close; ordering the window by revenue or baskets pairs months by size, printing deltas between months that were never adjacent on the calendar. Each delta is revenue minus the prior kept month, nothing else — and the NULL on the opening row is the shape that proves the series starts where it says it starts.",
    },
    {
      id: "cs-sephora-5",
      tier: "easy",
      topic: "q2",
      universe: "pricing",
      title: "The above-average cluster shortlist",
      brief:
        "The pricing review wants the shortlist of market clusters whose average basket clears the house average — 338.19 across all 103 baskets — before repricing the entry tiers. Probed facts: LATAM averages 426.22 over its 2-basket book and US 383.48 over 19 baskets; EU (335.32) and APAC (313.66) sit under the line. The board's cut is two rows, priciest average first — the shortlist that justifies a US-first basket-builder test, with the caveat that LATAM's book is one household deep.",
      ask:
        "Return the clusters whose average basket beats the house average: cluster, baskets, average basket (2dp) — priciest first, capped at two rows.",
      template:
        "SELECT c.region,\n       COUNT(*) AS baskets,\n       ROUND(AVG(o.total), 2) AS avg_basket\nFROM orders o\nJOIN customers c ON c.id = o.{4}\nGROUP BY {5}\nHAVING AVG(o.total) > (SELECT {2}(total) FROM orders)\nORDER BY avg_basket {3}\nLIMIT {1};",
      slots: [
        {
          answer: "2",
          kind: "number",
          label: "the board's two-row cut",
          why: "LIMIT 2 carries exactly the clusters that clear the 338.19 house average — LATAM and US — and 2 is also a result cell: LATAM's 2-basket book. One row would drop US; three would read EU back in.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the house mean",
          why: "The scalar subquery folds the platform's 103 baskets into one number: AVG(total) = 338.19. SUM, MAX or COUNT would set the bar at 34833.28, 1088.44 or 103 — bars no cluster can clear, shortlisting nobody.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the priciest-first order",
          why: "The shortlist leads with the steepest basket: LATAM 426.22 before US 383.48. ASC would open on US and bury the cluster with the thinnest sample at the top of the read.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the household key",
          why: "Clusters attach through c.id = o.customer_id; joining on o.id pairs each basket with a household that merely shares its row number, and every cluster average re-prices on the wrong books.",
        },
        {
          answer: "c.region",
          kind: "keyword",
          label: "the cluster grain",
          why: "GROUP BY c.region folds 103 baskets into 4 clusters — the grain the pricing board reads. Grouping by status would average baskets by fulfillment state instead of market.",
        },
      ],
      distractors: ["SUM", "MAX", "ASC", "id", "o.status"],
      walkthrough:
        "A compare-to-house-average read is one scalar subquery away. GROUP BY c.region folds the book into four clusters; the subquery (SELECT AVG(total) FROM orders) prints the house bar — 338.19 — and the HAVING keeps only the clusters whose own average clears it: LATAM 426.22 and US 383.48, while EU 335.32 and APAC 313.66 miss. ORDER BY avg_basket DESC leads with LATAM; LIMIT 2 is the board cut, and it happens to be the whole answer because exactly two clusters clear the bar. The distractors encode the pricing-board bugs: SUM, MAX or COUNT in the subquery set the bar at a number no cluster can beat and empty the shortlist; ASC reads it cheapest-first; the wrong join key re-prices every cluster on mismatched baskets; grouping by status averages by delivered, shipped, pending — not by market. One scalar, one gate, one order, one cut: the whole read.",
    },
    {
      id: "cs-sephora-6",
      tier: "medium",
      topic: "x2",
      universe: "inventory",
      title: "The one-pass counter census",
      brief:
        "The replenishment census folds scan lines per category in a single pass: baskets touched, units scanned, and — the attach read — units scanned at the 50-and-up prestige counter, the mid band's 50-dollar floor from the price bands read. Probed facts: Accessories touch 54 baskets for 121 units, Audio 46 for 97, Electronics 40 for 85, Video 30 for 61, Apparel 22 for 54, Wearables 23 for 53, and Fitness trails at 27 units. The census gates at the 53-unit Wearables book — categories under it don't set the restock plan — and the biggest units book leads.",
      ask:
        "Return the gated census: category, baskets touched, units scanned, prestige-counter units — biggest units book first.",
      template:
        "SELECT p.category,\n       COUNT(DISTINCT oi.order_id) AS baskets_touched,\n       SUM(oi.quantity) AS units,\n       SUM(oi.quantity) FILTER (WHERE p.price >= {2}) AS counter_units\nFROM order_items oi\nJOIN products p ON p.id = oi.{4}\nGROUP BY p.category\nHAVING SUM(oi.quantity) >= {1}\nORDER BY units {3};",
      slots: [
        {
          answer: "53",
          kind: "number",
          label: "the census gate",
          why: "HAVING SUM(oi.quantity) >= 53 keeps the six categories with a real book and drops Fitness' 27 units. 53 is also a result cell — the Wearables book sits exactly on the gate.",
        },
        {
          answer: "50",
          kind: "number",
          noVerify: true,
          label: "the prestige line",
          why: "FILTER (WHERE p.price >= 50) is the mid band's 50-dollar floor: Audio scans all 97 units at the counter, Electronics only the 89.99 keyboard's 28. It is a band edge from the price-bands read, not a result cell.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first order",
          why: "The census leads with the deepest units book: Accessories 121, Audio 97, Electronics 85. ASC would open on Wearables' 53 — the boundary row the gate nearly cut.",
        },
        {
          answer: "product_id",
          kind: "keyword",
          label: "the SKU key",
          why: "Scan lines attach to SKUs through p.id = oi.product_id; joining on oi.id wires each line to whichever SKU shares its row number, the fold collapses and no category clears the 53-unit gate.",
        },
      ],
      distractors: ["ASC", "id", "27", "100"],
      walkthrough:
        "A one-pass census is a fold, a filtered fold and a gate over the same rows. The join attaches SKUs to 251 scan lines; GROUP BY p.category folds them into seven categories; COUNT(DISTINCT oi.order_id) counts baskets touched beside SUM(oi.quantity)'s units — Accessories 54 baskets for 121 units, Audio 46 for 97. FILTER (WHERE p.price >= 50) is the second fold in the same pass: Audio's 97 units all clear the prestige line, Electronics only the keyboard's 28 — and Accessories prints NULL, not 0, because SUM over an empty filter set is NULL, the shape that tells a zero apart from a no-matches. The gate at 53 keeps six categories and drops Fitness' 27. The distractors encode the census bugs: ASC reads the boundary row first; the wrong join key collapses the fold below the gate; 27 re-admits Fitness; 100 cuts the census to Accessories alone. One pass, two folds, one gate — the FILTER move is what keeps it one pass instead of two queries stapled together.",
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
    { slug: "duplicate-emails", why: "Loyalty-file hygiene — the Beauty Insider dedupe: one household, two emails, and the tier ladder double-counts its best member. Fold the file before the fold. Curated fill." },
    { slug: "percentage-of-users-attended-a-contest", why: "Sampling-event uptake — the census behind a launch counter: what share of the member base actually showed up, percent over a distinct fold, not a raw count. Curated fill." },
    { slug: "create-a-session-bar-chart", why: "Basket-size histogram — the basket-building board: baskets banded by line count, the read that decides where the counter pushes a second add-on. Curated fill." },
    { slug: "average-selling-price", why: "Realized vs list ASP per SKU — the promo-leakage read: scan-line revenue over units, the number that catches a gift-with-purchase eating the basket. Curated fill." },
    { slug: "average-salary-of-departments", why: "Cluster AOV vs the house average — which market clusters basket above the 338.19 platform mean, the compare-to-company shape at cluster grain. Curated fill." },
    { slug: "top-travellers", why: "Insider points ledger — reward points accrued per household folded from per-basket awards, the run-up read before the tier refresh posts. Curated fill." },
    { slug: "the-number-of-users-that-are-eligible-for-discount", why: "Rouge-eligible census — COUNT(DISTINCT) over the households that clear the spend bar, the tier-population read the loyalty team owns. Curated fill." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Each household's hero SKU — the personalization fold: the argmax product per member that drives the next sampling pick. Curated fill." },
    { slug: "same-day-sale", why: "Sampled-and-bought-same-visit — the first-occurrence read that proves a sampling counter converts on the day, not in the attribution deck. Curated fill." },
    { slug: "game-play-analysis-i", why: "First-basket date per household — the tier clock: when each member's Beauty Insider window opened, folded to the earliest basket. Curated fill." },
    { slug: "sales-by-day-of-the-week", why: "Baskets pivoted by weekday — the omnichannel staffing read: Friday bins vs Monday ship, one row per week, one column per day. Curated fill." },
    { slug: "weather-type-in-each-country", why: "Cluster-status labeler — CASE branch per market cluster: hot, warm or cold by the cancel share the region board tracks. Curated fill." },
    { slug: "trips-and-users", why: "Kept-basket denominators — the returns read done right: cancel rates computed on baskets that weren't voided, the exclusion filter before the rate. Curated fill." },
    { slug: "maximum-transaction-each-day", why: "Hero basket per day — the largest single basket each day, the store-bin story the morning standup retells. Curated fill." },
    { slug: "the-most-recent-orders-for-each-product", why: "Restock recency per SKU — the last basket each product moved in, the freshness read that outranks stock cover on the replen list. Curated fill." },
    { slug: "game-play-analysis-iv", why: "D1 repeat rate — the fraction of households whose second basket landed the day after the first, the habit read behind auto-refresh. Curated fill." },
  ],
};
