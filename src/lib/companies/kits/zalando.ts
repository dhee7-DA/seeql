// Zalando — kit 12 of the E-commerce & Marketplace domain (Batch L, wave 7).
// Europe's fashion marketplace: drop calendars, size-fit re-order loops,
// partner-brand books and a fulfillment network where every basket carries a
// dispatch scan and a market cluster. Pool provenance: the Zalando tag set
// carries 0 tagged LC problems in this app's pools — 0 tagged LC —
// theme-curated: all topic slugs and problem fills are curated from
// scripts/company-pools.md's SQL theme menu to mirror the workflows Zalando
// screens are known to probe (drop-calendar date math, kept-basket rates,
// tie-proof ladders, partner-brand revenue folds, cents discipline). Case
// studies run on the storefront db with probed figures from
// scripts/company-facts.md — mapped honestly as customers=members,
// orders=baskets, order_items=scanned lines, products=SKUs,
// suppliers=partner brands, shipped_at=dispatch scan, regions=market
// clusters. Extended probe receipts (partner board with COUNT(DISTINCT p.id)
// skus 3/3/3 and revenue 11130.25/9294.93/3049.07; 2024 DENSE_RANK ladder
// 1,1,2,2,2,2,3,3,3,3,4,4) live in the worklog.

import type { CompanyKit } from "../types";

export const zalandoKit: CompanyKit = {
  id: "zalando",
  domainId: "ecom",
  name: "Zalando",
  tagline: "Europe's fashion marketplace: drops, returns, logistics",
  accent: "text-fuchsia-300",

  brief: [
    "**Zalando** is Europe's fashion marketplace — and its data grain is the drop, not the shelf: partner brands win homepage slots, members fill baskets across sizes, and the fulfillment network stamps every basket with a dispatch scan. On this kit's proxy db the census reads **16 member households**, **103 baskets** fanning into **251 scanned lines**, $34,833.28 total demand at an average basket of **$338.19** — supplied by **6 partner brands** across 16 SKUs, shaped exactly like the brand-book read a Berlin analyst runs before the drop calendar locks.",
    "The data org reads the business as clusters and clocks. The {sky:EU} home market carries **45 baskets** from 8 buyers for 15089.23 at a 335.32 average, and the dispatch clock averages **2.98 days** over the 82 baskets carrying `shipped_at` (EU 2.94 over 36, APAC 2.93 over 29). Status is the funnel: **52 delivered**, **30 shipped**, **14 pending**, {rose:7 cancelled} — and because this is fashion, the cancel line is the size-fit story: EU cancels at **6.7%** of placed baskets while APAC runs 8.1%. *An analyst who can't say which population a latency average covers — fulfilled only, 82 of 103 — doesn't get past the warm-up.*",
    "Interview style is drop-flavored and denominator-first. Screens open with a warm-up join (baskets to members, lines to SKUs, SKUs to partner brands), escalate into a rate with a stated denominator (kept baskets, size-fit cancels per placed), then land on the two Zalando signatures: a **drop-calendar ladder** (rank 2024's months by basket count — February and September tie at 9, four months tie at 8, so the tie rule IS the question) or a **partner-brand board** (assortment floors and demand floors with a HAVING gate). Follow-ups are spoken: 'is that per basket or per member?', 'which brands does the floor drop?', 'does a cancelled basket sit in your placed base?'",
    "Preparation strategy: Zalando carries **0 tagged LC problems** in this app's registry — the pool is theme-curated from the SQL band: drop-window date math, kept-basket rates, tie-proof ranking windows, partner-brand revenue folds, and cents discipline on the settlement tables (invoices and payments store INTEGER cents — the dollar read is `amount_cents / 100.0`). The two case studies run on the live db: one rebuilds the **partner-brand board** the category team argues with, the other rebuilds the **drop-calendar ladder** the planning sync ships from. Both are mechanically audited against the probed figures.",
    "The money layer is the same discipline at cent grain, and the close is where the screens get honest. The settlement book reads 28 invoices against 27 payments — 21 settled exact for 66443.00, 6 open at 19609.00, 1 void at 925.00 — and coverage splits it finer: **21 exact / 1 partial / 6 none**, the partial a 4000.00 rail against a 6148.00 bill, the none-arm **15217.00 of exposure**. Rails split card-versus-wire, 16 card settlements at 37364.00 against 11 wires at 32248.00, and settlement runs **28.4 days against flat 30-day terms** — fastest 13, slowest 84. The anomaly classes are on file: a {rose:void-but-paid} invoice at 925.00, a paid invoice with zero rails at 1756.00, five split-settlement bills whose two rails are structure, not duplicates. The trial balance ties at **181080 on both sides** — *the close does not pass until it does*.",
    "Preparation, second pass: the kit now runs four laps over one db. Lap one is censuses — status arms, two-grain counts, band maps — where every branch must reconcile to `COUNT(*)` (52 + 30 + 14 + 7 = 103). Lap two is rates and ladders — kept-share with the denominator fixed, DENSE_RANK drop ladders with the tiebreak stated. Lap three is shapes — a staged CTE feeding a share board, a set-op stack labeled with source literals, a benchmark subquery against the 338.19 average basket. Lap four is the anomaly hunt, and the db's honest limits are part of it: the premium band is {rose:empty} at the 199.99 ceiling, every SKU has scanned, every member has ordered — *saying 'this anti-join returns nothing, by data' outranks shipping a dashboard of thin air*. The full pack — **24 theory items, 30 MCQs, 6 audited cases, 32 problems** — is the rehearsal space; the interview is where the denominators get defended.",
  ],

  dayInLife: [
    "**08:15 —** The day opens on the drop board, and the first query is the reconciliation: does the status census tie to `COUNT(*)` — **52 delivered, 30 shipped, 14 pending, 7 cancelled** — and does the dispatch clock still read **2.98 days over the 82 fulfilled baskets**? The analyst's eye goes to the cluster split before anything else, because {sky:EU} at 2.94 over 36 is the home market and APAC at 2.93 is the one to beat. The pending pile is the morning's fire: **14 baskets** with no dispatch scan, and the analyst who writes the aging query owns the standup. *Fulfilled only — that population note rides in every latency subtitle, or the 21 unfulfilled rows quietly poison the average.*",
    "**12:30 —** Midday is the deep-work block. The drop-calendar ask lands from planning: rank 2024's months by basket count for next quarter's cadence — and the ladder ties five ways ({emerald:9, 9} at the top, then four months at 8, four at 7, two at 6), so DENSE_RANK with a calendar tiebreak is the only honest shape. The size-fit read is next: cancels per placed basket by cluster — EU 6.7%, APAC 8.1% — with the denominator decided BEFORE the ratio. The analyst narrates the trap out loud: a CASE arm on latency without the `shipped_at IS NOT NULL` filter sweeps all 21 unfulfilled baskets into the ELSE bucket, and *'late' and 'not yet' are different sentences in a fulfillment review.*",
    "**16:00 —** The afternoon tilts to the partner-brand review. The category lead wants the board: **Nordic Gadgets AB** at 11130.25 (a 32% share of platform demand), Midwest Hardware Co at 9294.93, and the floor fight — Pacific Textiles at 2980.15, 19.85 under the demand line, while Alpine Audio GmbH clears the revenue floor but carries only 2 live SKUs. Settlement hygiene closes the day: invoices and payments store INTEGER cents, so the dollar fold is `amount_cents / 100.0`, and the split-settlement hunt (five invoices paying in two rails) is the check before anything ships. *Every number leaves with its query attached — in a marketplace that audits its own brand boards, a figure without SQL is a rumor.*",
    "**21:15 —** The day closes on the settlement rails, and the order of operations is fixed: reconcile first, classify second, hunt third. The rail fold runs `amount_cents / 100.0` once, at the display edge — **16 card settlements at 37364.00 against 11 wires at 32248.00** — then the coverage census prints **21 exact / 1 partial / 6 none**, and the five two-rail splits stay intact, because collapsing structure into dedupe is how real part-payments vanish. The anomaly sweep checks the two known classes — the {rose:void-but-paid} invoice at 925.00 and the paid invoice with zero rails at 1756.00 — and the ledger tie runs last: debits 181080, credits 181080, {emerald:delta 0}. *The writeup ships with its queries attached — tomorrow's shift inherits methods, not mysteries.*",
  ],

  metrics: [
    { name: "Drop cadence", what: "Baskets per month on the 2024 calendar — runs 6-to-9, with February and September tied at 9 on top and July holding 8 baskets while revenue fell to 1193.86. The cadence line the drop calendar is planned against." },
    { name: "Kept-basket share", what: "Non-cancelled baskets over placed — 7 of 103 cancel (6.8%). The denominator rule is the whole test: cancelled baskets stay in the placed base, and the kept share is what merch quotes." },
    { name: "Dispatch latency", what: "Days from basket to `shipped_at` on the 82 fulfilled baskets — 2.98 average, 2-to-4 range. Population stated first: the 14 pending have no latency YET and the 7 cancelled never will." },
    { name: "Cluster pace board", what: "Latency by market cluster on the fulfilled population — US 3.07 over 15, EU 2.94 over 36, APAC 2.93 over 29, LATAM 3.5 over 2. The board logistics reads first every morning." },
    { name: "Partner-brand concentration", what: "Share of scanned demand per brand — Nordic Gadgets AB 32% (11130.25), Midwest Hardware Co 26.7% (9294.93). Two brands carry more than half the book; the floor debate is always about the tail." },
    { name: "Average basket", what: "Revenue per basket — 338.19 across 103 baskets (34833.28 total, 25.47 to 1088.44). The number every drop retro argues against: did the drop lift baskets, value, or neither." },
    { name: "Size-fit cancel share", what: "Cancelled baskets over placed, by cluster — EU 6.7% (3 of 45), APAC 8.1% (3 of 37), US 5.3%, LATAM 0 on a 2-basket sample. The fashion-shaped read: where the re-order loop bites." },
    { name: "Repeat-member rate", what: "Share of households with 2+ baskets — 14 of 16 here, top household at 24 baskets. The loyalty KPI the Insider-style programs live by, and a HAVING-gated census in interview form." },
    { name: "Sell-through per SKU", what: "Units sold over units stocked, at SKU grain — the Noise-Canceling Headset moves 46 of 60 with 14 left, Smart Watch S 23 of 40. Line-grain folds lie here: units are a SUM over scanned lines, stock is one column — two grains, one ratio, stated." },
    { name: "Settlement coverage classes", what: "Exact / partial / none across the 28 invoices — 21 exact (65612.00), 1 partial (a 4000.00 rail against a 6148.00 bill), 6 with no rails at all (15217.00). The five two-rail splits are structure, not duplicates — the census counts them where they fall." },
    { name: "Days-to-settle vs terms", what: "Issue-to-first-payment lag on the 20 paid invoices carrying rails — 28.4 days average against flat 30-day terms, fastest 13, slowest 84. The population excludes the paid-no-rails anomaly by construction — state that, or the terms-compliance claim drifts." },
    { name: "Payment rail mix", what: "Card versus wire settlement: 16 card rails worth 37364.00 against 11 wires at 32248.00. Both fold through `amount_cents / 100.0` once, at the edge — a mix computed on raw cents explains less and forecasts float worse." },
  ],

  topics: [
    {
      name: "The drop calendar: date math",
      why: "Zalando plans in drop windows, and every drop read is a duration or a bucket: `JULIANDAY(shipped_at) − JULIANDAY(created_at)` on the 82 fulfilled baskets, month keys via STRFTIME for the cadence ladder. Screens drill the mechanics because an analyst who buckets unfulfilled baskets has silently mixed two populations — the calendar is a population question before it is a date question.",
      slugs: ["find-golden-hour-customers", "convert-date-format", "the-latest-login-in-2020"],
    },
    {
      name: "Kept-basket pipelines",
      why: "Placed is not kept: 103 baskets minus 7 {rose:cancelled} is the kept base, and 'orders placed vs orders kept' is the sentence every Zalando screen circles. The drill is conditional counting — status arms, delivered tallies, cancel rates with the denominator fixed before the ratio, because a fashion marketplace argues about re-order loops, not about arithmetic.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "monthly-transactions-ii"],
    },
    {
      name: "Partner-brand revenue folds",
      why: "The brand board is a three-table fold — brands to SKUs to scanned lines — and the category team reads revenue to 2 decimals beside share of the 34833.28 book. The drills pair a revenue SUM with a join-then-aggregate shape; the trap is line grain leaking into brand grain, where a fold over 251 lines stops being a brand number.",
      slugs: ["sales-analysis-i", "average-selling-price", "products-worth-over-invoices"],
    },
    {
      name: "Size-fit rates with honest denominators",
      why: "Fashion's signature ratio — the size-fit re-order share — punishes integer division and quiet population swaps. The house habit: 100.0 before the division, the denominator's population in the subtitle (placed baskets, not delivered), rounding only at the display edge — because a 6 instead of 6.7 on the EU board is a market that gets yelled at for the wrong reason.",
      slugs: ["returns-rate-by-category", "confirmation-rate", "queries-quality-and-percentage"],
    },
    {
      name: "Tie-proof drop ladders",
      why: "The 2024 calendar ties five ways (9, 9, then 8, 8, 8, 8), so RANK vs DENSE_RANK vs ROW_NUMBER is not trivia — a skipped rung invents a phantom tier the planning sync will discuss. The drills force the tie decision: DENSE_RANK shares rungs, and a deterministic month tiebreak keeps the ladder identical between the 9am run and the 4pm re-run.",
      slugs: ["rank-scores", "second-most-recent-activity", "group-employees-of-the-same-salary"],
    },
    {
      name: "The two-grain census",
      why: "Baskets AND members per cluster is the opening read of the marketplace review — and the trap is counting both at one grain. COUNT(*) counts baskets (45 in EU); COUNT(DISTINCT customer_id) counts members (8); the gap is basket intensity, which is the number the partner team actually manages.",
      slugs: ["daily-leads-and-partners", "students-and-examinations", "unique-orders-and-customers-per-month"],
    },
    {
      name: "Assortment argmax",
      why: "Which SKU carries each brand, which member's basket scans a brand most often — the marketplace lives on per-group argmax reads, and screens drill the no-QUALIFY shape: window rank in a CTE or derived table, then filter to rung one. The follow-up is always the tie: two SKUs at the same rung need a stated tiebreak, not a silent one.",
      slugs: ["most-frequently-ordered-product-per-customer", "product-sales-analysis-iv", "the-most-recent-orders-for-each-product"],
    },
    {
      name: "Drop windows and promo periods",
      why: "A drop is a window, not a mood: half-open date predicates decide which baskets count as drop baskets, and the BETWEEN-on-the-last-day bug double-counts midnight baskets on event boundaries. The drills pair an in-period filter with a quantity floor — the exact shape of 'drop baskets with 3+ lines'.",
      slugs: ["list-the-products-ordered-in-a-period", "user-activity-for-the-past-30-days-i", "friday-purchases-i"],
    },
    {
      name: "Member concentration and whales",
      why: "Top members carry the book: spenders over 3000 lifetime dollars hold 63.5% of demand, and the top household sits at 24 baskets while the median member sits at 3-or-4. The drills pair a spend histogram with a grouped argmax — the two queries the CRM lead asks for before every tier recalibration.",
      slugs: ["spend-histogram", "winning-candidate", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Cents and settlement hygiene",
      why: "Brand settlements store INTEGER cents — the dollar read is `amount_cents / 100.0`, and the .0 placement is the standing bug in every fold. The drills pair the cents promotion with a CASE-band census, because the finance close reads the same settlement tables the brand board does, and the two must reconcile to the cent.",
      slugs: ["bank-account-summary-ii", "trial-balance-check", "count-salary-categories"],
    },
    {
      name: "Set-op stacks and anti-join shapes",
      why: "The close stacks censuses — demand rows under settlement rows, exception rows under the base — and set operators align branches by POSITION, not by name; one reordered column mislabels a whole block. The dark-side reads are set algebra too: which partner brands never scanned, which invoices never saw a rail. The drill is knowing when UNION's dedupe silently merges coincidentally-equal rows and when EXCEPT disagrees with NOT EXISTS on multiplicity.",
      slugs: ["movie-rating", "find-the-missing-ids", "customer-who-visited-but-did-not-transact"],
    },
    {
      name: "Running demand and window frames",
      why: "Cadence reads ride running totals and rolling averages down the month spine — and the default frame (RANGE UNBOUNDED PRECEDING TO CURRENT ROW) folds same-key peers into one step, which is right on month grain and a silent lie at row grain. The drills force the frame decision: a rolling-7 read, a cumulative fold, and the trap where a filtered spine makes LAG reach back two months and call it one.",
      slugs: ["restaurant-growth", "find-cumulative-salary-of-an-employee", "rolling-average-steps"],
    },
    {
      name: "Benchmark subqueries and staged boards",
      why: "'Which brands beat the platform average' is a benchmark fold — a scalar subquery against the 338.19 average basket, or a staged CTE feeding a share-of-book board. The drills pair the scalar benchmark with a staged share computation, because comparing an aggregate to a column before the aggregate exists is the error every screen waits for.",
      slugs: ["orders-with-maximum-quantity-above-average", "market-analysis-i", "compute-the-rank-as-a-percentage"],
    },
    {
      name: "Seasonal demand z-scores",
      why: "Drop planning asks 'how abnormal was July' — and a z-score is a denominator argument wearing statistics: which population sets the mean and the spread (all 14 months gross, or kept-only), and does the baseline month belong. The drills train burst detection and velocity reads, the shape behind flagging a month whose demand left the seasonal band.",
      slugs: ["amount-anomaly-zscore", "find-bursty-behavior", "transaction-velocity"],
    },
    {
      name: "Sell-through and size-curve cover",
      why: "The size-curve story is a cover read: units remaining per SKU (stock minus scanned demand), the thin band that triggers re-orders, the deep band that frees cash. The drills pair a cover census with a weeks-of-supply fold — the two queries the buying team argues with before the size curve is rebalanced.",
      slugs: ["weeks-of-supply", "warehouse-manager", "basket-depth-aov"],
    },
  ],

  theory: [
    {
      id: "zalando-t1",
      q: "Partner brands connect to SKUs and SKUs to scanned lines before any revenue folds. In a brand-board read, when do you insist on a LEFT JOIN, and what does an INNER join silently drop?",
      a: "The join follows the spine of the question. If the question is demand-shaped — brand revenue, basket counts per cluster, drop-month cadence — the scan-line stream is the spine and INNER joins attaching brand attributes are right, because every unmatched row would distort a rate built on basket counts. If the question is supply-shaped — a partner brand whose SKUs never scanned this quarter — the brand table is the spine and LEFT JOIN + IS NULL is the only honest shape: INNER drops exactly the rows you're hunting for. One honesty note this db earns: every partner brand HAS scanned and every basket resolves to a member (zero never-ordered rows on both sides), so INNER and LEFT coincide here — which is exactly why the interviewer asks you to reason about the shape instead of leaning on the data to save you. Say which side is the spine before the FROM clause; that sentence is what they're grading.",
      tag: "joins",
    },
    {
      id: "zalando-t2",
      q: "Rank the 2024 months by basket count for the drop calendar. Where do RANK, DENSE_RANK and ROW_NUMBER disagree, and which one ships to planning?",
      a: "They disagree exactly where the metric ties, and 2024 ties everywhere: February and September share the top at 9 baskets, four months tie at 8, four more at 7, and June and November sit together at 6. RANK gives tied rows the same rung and skips the next — the 8-tier lands on rung 3 and the 7-tier on rung 7, gaps implying tiers that don't exist. DENSE_RANK shares the rung and keeps the sequence compact (1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4). ROW_NUMBER splits every tie arbitrarily unless you add a deterministic tiebreak like the month key, which makes it the dedupe tool, not the ladder tool. Planning ships DENSE_RANK with an explicit month tiebreak: a calendar is read as 'which tier does March sit in', a skipped rung generates a meeting about a tier that was never there, and the tiebreak keeps the ladder identical between runs. The LIMIT-1-OFFSET-1 'second place' habit breaks on the first tie; the honest second tier is DENSE_RANK = 2, ties included.",
      tag: "windows",
    },
    {
      id: "zalando-t3",
      q: "On the baskets table — 103 rows, 251 scanned lines after the join, 16 member households — narrate what COUNT(*), COUNT(shipped_at) and COUNT(DISTINCT customer_id) each return, and which grain each serves.",
      a: "Three numbers, three grains, all true at once. COUNT(*) is 103 — every basket, the placed denominator for kept-share and repeat-rate work. COUNT(shipped_at) is 82 — the dispatched subset, because COUNT skips NULLs; the 21-row gap IS the 14 pending plus 7 cancelled, a fulfillment signal rather than a data bug. COUNT(DISTINCT customer_id) is 16 — repeat baskets folded back to households, the audience grain. And after the scan-line join a fourth number appears: COUNT(*) becomes 251 — lines, not baskets — which is why basket AOV (34833.28 over 103 = 338.19) and line value (over 251) are different metrics that share a numerator. The marketplace trap is reporting one grain under another's name: 'baskets per member' computed as baskets over members is an intensity (6.4), not a rate, and it reads as nonsense the first time a category lead asks what it means. The strong answer assigns a grain to every COUNT out loud.",
      tag: "aggregation",
    },
    {
      id: "zalando-t4",
      q: "`shipped_at` is NULL until a basket is dispatched, and cancelled baskets never get one. What is your NULL policy for the latency metric and for a within-window CASE arm?",
      a: "Define who has the metric, state it, never launder the hole. For latency, the population is the 82 dispatched baskets: WHERE shipped_at IS NOT NULL is correct and the subtitle says so — 2.98 days average, 2-to-4 range. The subtle bug is the unfiltered version 'working anyway': AVG skips NULL rows silently, so it returns the same 2.98 — the number is right while the denominator discipline is broken, and the day a rate rides beside it the NULLs corrupt the share. For a CASE arm the failure is louder: a within-3-days flag without the population filter sends all 21 unfulfilled baskets (14 pending + 7 cancelled) to the ELSE bucket, and the deck reads 'late' when the truth is 'not yet' — 25 late plus 21 swept becomes 46. Three NULL behaviors to narrate: filters (NULL fails = and !=), aggregates (COUNT(col) skips, COUNT(*) keeps), comparisons (NULL <= 3 is UNKNOWN, not FALSE). The habit being graded: a WHERE clause doing definitional work without saying so.",
      tag: "nulls",
    },
    {
      id: "zalando-t5",
      q: "'Only show partner brands with at least 3 live SKUs and 3000+ in scanned demand' — WHERE or HAVING, and why can't the other clause see either floor?",
      a: "HAVING, because both floors are group facts: SKU counts and scanned demand exist only after the brand-to-SKU-to-lines fold groups the rows. Logical evaluation runs FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — WHERE executes before groups form, so COUNT(DISTINCT p.id) literally does not exist yet and the engine throws 'no such column'. The split that predicts every placement: row predicates in WHERE (status filters, date windows — shrink the fold's input, like excluding cancelled baskets BEFORE counting), group predicates in HAVING (assortment floors, demand thresholds — keep or kill folds). On the brand board the floors do real work: the SKU floor drops the 2-SKU brands and the 3000 line drops Pacific Textiles at 2980.15 — a materiality cut the deck should own out loud. The subtlety worth saying: a WHERE on a right-table column after a LEFT JOIN silently converts the join to INNER — filter into the ON clause or accept the downgrade deliberately.",
      tag: "pipeline",
    },
    {
      id: "zalando-t6",
      q: "You need each drop SKU's promo price as of the drop date, where the price history only has rows for changes. Walk me through the scalar-subquery shape — and what happens when a SKU never repriced?",
      a: "The as-of lookup is a correlated scalar: for each SKU, SELECT price FROM price_history WHERE sku_id = p.id AND changed_on <= :drop_date ORDER BY changed_on DESC LIMIT 1 — the latest change before the drop. The contract matters: a scalar subquery is 0-or-1 rows, and the zero case is the whole question — a SKU that never repriced returns NULL, not an error, and every display or comparison against NULL needs a stated policy. The marketplace fix is a deliberate fallback: COALESCE((subquery), p.list_price) — 'if no change on record, the list price IS the drop price' — which turns a data gap into a documented definition. The correlated cost is real: the inner query re-runs per outer row, fine at 16 SKUs and a full scan at 16 million, so at scale you stage latest-per-SKU in a CTE and join. Saying which population the inner fold covers — repriced versus never-repriced — is exactly what the follow-up is fishing for.",
      tag: "subqueries",
    },
    {
      id: "zalando-t7",
      q: "Basket and dispatch timestamps arrive as TEXT. How do you bucket them by month, diff them in days, and where does each approach break?",
      a: "Three tools, three caveats. Buckets: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on ISO text — both give '2024-09', and the SUBSTR shortcut works only while the format stays fixed-width ISO; one loose timestamp and the drop retro quietly mis-buckets. Diffs: JULIANDAY(shipped_at) − JULIANDAY(created_at) returns fractional days — this db's 2.98-day average is exactly that, rounded once at the END, not per row; rounding per row then averaging is a different, wrong metric. Windows: half-open intervals — created_at >= '2024-09-01' AND < '2024-10-01' — never BETWEEN on the last day, which double-counts midnight baskets on drop boundaries. The deeper breaks: shipped_at is NULL until dispatch, so every latency fold states its population first (82 of 103), and drop windows must anchor to a stated event calendar, not to whatever the max timestamp happens to be. State the convention, then query it — never the reverse.",
      tag: "dates",
    },
    {
      id: "zalando-t8",
      q: "Partner settlements must reconcile: invoices, payments and expenses all store INTEGER cents, and payments can arrive as two rails on one invoice. How do you keep the fold honest?",
      a: "Two disciplines. Units: every dollar read is amount_cents / 100.0 — the .0 promotes to real arithmetic before the division, because integer over integer truncates and a 4459-cent invoice prints as 44 dollars; divide once, at the display edge, after the fold. Duplicates: GROUP BY invoice_id HAVING COUNT(*) > 1 finds the split-settlement invoices — five on this db (ids 1, 5, 12, 19, 22) — and collapsing them is a DECISION, not a default: folding two genuine part-payments into one hides a shortfall, so the honest version classifies coverage first (exact 21, partial 1 — a 4000 rail against a 6148 bill, none 6) and only then dedupes the display layer. The known anomaly classes to hunt: a void invoice that still carries a payment (925.00) and a paid invoice with zero rails (1756.00) — brand statements exist to catch exactly these. Detect with an aggregate, dedupe with a deterministic tie-break, and be able to say which rows your dedupe discarded and why the business agreed to lose them.",
      tag: "quality",
    },
    {
      id: "zalando-t9",
      q: "The growth board wants a running demand curve across the drop calendar. What frame does SUM(total) OVER (ORDER BY month) actually use — and when does that default betray you?",
      a: "The default frame with an ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE treats peers as one step: every row sharing the ORDER key joins the running total together. On a month-bucketed cadence curve that is exactly what the board wants — the curve steps once per month, and two baskets from the same week don't double-step. Where it betrays you is row-grain replay: if the ORDER key carries duplicate values (two baskets with the same timestamp), RANGE silently folds the ties and the running number leaps by the whole group at once. The fix is explicit framing — ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW when row order is the meaning — or bucketing first and running the window on the bucket grain so the frame question dissolves. On this storefront the monthly demand walk is bucket grain, so RANGE is right; the same query ordered by raw created_at is a coin flip. A strong candidate names the frame before the engine picks it.",
      tag: "windows",
    },
    {
      id: "zalando-t10",
      q: "Monthly demand momentum on the drop calendar — walk me through LAG on the month spine, its NULL at the boundary, and the trap when the spine gets filtered.",
      a: "LAG(revenue) OVER (ORDER BY month) pairs each month with its predecessor — 2024-02 reads 2024-01's 3731.97 as its baseline, and the momentum is the difference against 3609.64. The first month has no predecessor, so LAG returns NULL, and the report should say 'baseline month' rather than coalescing a fake zero into the delta column. The trap is the filtered spine: a WHERE or HAVING that drops a month shrinks the window's input, and the next surviving month reads its predecessor from whatever survived — filter out 2024-06 (2047.43) and July's LAG reaches back to May's 2910.31, reporting a two-month gap as one month's move. That is not a bug in LAG; it is the definition of 'previous row in the window' being narrower than 'previous calendar month'. The habit: build the month spine unfiltered in a CTE, run LAG there, and apply business gates AFTER the momentum is computed — or state loudly that the filtered version measures a different thing.",
      tag: "windows",
    },
    {
      id: "zalando-t11",
      q: "The close stacks the basket census under the settlement census in one result. UNION or UNION ALL — and what has to be true about the branches?",
      a: "The branches must agree on column count, position and compatible types — set operators align by position, not by name, so a branch with a reordered column list quietly mislabels a whole block. UNION ALL appends everything and keeps duplicates; UNION dedupes ENTIRE rows, which costs a sort or hash and — the dangerous part — silently collapses rows that are coincidentally equal across branches: two different invoices with identical amounts and dates read as one. In a reconciliation stack that is a bug wearing an optimization's clothes. The rule: stacks of genuinely disjoint populations (basket census rows, then settlement rows, each labeled with a source literal) go UNION ALL for speed and honesty; UNION only when the definition itself is 'distinct things', and then I can say which rows the dedupe removed and why that is correct. Label every branch with a literal — 'demand' versus 'settlement' — so the stacked report can be filtered back apart.",
      tag: "set-ops",
    },
    {
      id: "zalando-t12",
      q: "Which partner brands never scanned this quarter — EXCEPT, NOT IN, NOT EXISTS, or LEFT JOIN … IS NULL? Where do the four shapes disagree?",
      a: "EXCEPT answers 'rows on the left that don't appear on the right' but dedupes BOTH sides, so a brand listed twice on the left returns once; NOT EXISTS preserves multiplicity and can correlate (dark within a window); LEFT JOIN … IS NULL is the readable classic with the same semantics as NOT EXISTS; and NOT IN is the landmine — one NULL in the inner set and the comparison goes UNKNOWN for every outer row, emptying the report silently with correct-looking SQL. On this db the honest example cuts the other way: every one of the six partner brands HAS scanned demand (zero never-ordered rows on both sides), so the dark-brand anti-join ships empty — and saying 'this pipe is empty, by data' is the answer, not a bug to fix. The choice I make in a brand-board review: NOT EXISTS for the multiplicity and the correlation, EXCEPT when the stakeholder thinks in set algebra, and the NULL-poisoning warning attached whenever anyone writes NOT IN.",
      tag: "set-ops",
    },
    {
      id: "zalando-t13",
      q: "Size-curve cover bands: thin under 20 units remaining, healthy 20-to-100, deep over 100. Write the CASE — and what does the ELSE branch mean when a band is empty?",
      a: "Order the WHEN branches tightest-to-loosest and make them exhaustive: CASE WHEN remaining < 20 THEN 'thin' WHEN remaining < 100 THEN 'healthy' ELSE 'deep' END — CASE evaluates first-match-wins, so 14 hits thin and never leaks into healthy, and the branches must reconcile to COUNT(*) = 16 or the census stops being a census. The overlapping-threshold bug — writing remaining < 100 first, or BETWEEN with shared endpoints — double-books rows into the wrong band, and the size-curve deck argues with a band map that doesn't tie. On this db the thin band holds 3 SKUs (14, 15 and 17 remaining) and deep holds 8; if a band returned zero rows that would be a finding, not a reason to delete the branch — the day a SKU lands there, an unlabeled row falls out of the census silently. Band edges are business definitions: named constants the buying team re-ratifies, never magic numbers buried in the ELSE.",
      tag: "case",
    },
    {
      id: "zalando-t14",
      q: "IN versus EXISTS on the settlement stream — when does each win, and what's the landmine in the NOT forms?",
      a: "IN is a membership test against a materialized list; EXISTS is a per-row probe that short-circuits on the first match. Modern engines often rewrite one into the other, so the honest answer is semantic: IN for small literal-ish sets ('baskets in these four statuses'), EXISTS for a correlated question ('a payment rail exists for this invoice') — it reads as the business logic and uses the correlation naturally. The landmine is NOT IN: if the inner query returns even one NULL — a payment row with a NULL invoice_id, a status column with a hole — NOT IN evaluates to UNKNOWN for every outer row and the report comes back empty, silently, with correct-looking SQL. NOT EXISTS is NULL-safe: an anti-join built on it cannot be emptied by a NULL. On this db the canonical ship is the no-rail AR read — 6 invoices of 15217.00 with no payment rows at all — as NOT EXISTS correlated on invoice_id, NULL-proof by construction. The candidate who explains the NOT IN landmine unprompted is the one who has been burned in production.",
      tag: "subqueries",
    },
    {
      id: "zalando-t15",
      q: "The brand-share board needs each brand's share of the 34833.28 book before the floor filter applies. Why stage the share in a CTE instead of writing it inline?",
      a: "Because a share is a fold of a fold, and inline folds get repeated, drifted and mis-ordered. The honest pipeline: stage the brand fold first — one row per brand, revenue rounded once (Nordic Gadgets AB 11130.25, Midwest Hardware Co 9294.93, six rows total) — then a board stage that divides by the 34833.28 book at one decimal, and only then the floor and the order. Inline, the SUM over the three-table join appears in every row's expression and the denominator constant lives somewhere it can drift; staged, the definition exists exactly once and the floor compares a plain column — 13.7 — instead of re-deriving a ratio per row. The craft points: name the stage for what it IS (brand_demand, not temp1), verify its grain out loud (6 brands, not 251 lines) before the outer query leans on it, and keep the final SELECT thin — floor, order, presentation. A CTE is a contract: grain in, definition named, consumers downstream.",
      tag: "ctes",
    },
    {
      id: "zalando-t16",
      q: "An analyst writes WHERE cancel_pct > 5 while cancel_pct is computed in the SELECT list. What happens — and what does the answer teach about evaluation order?",
      a: "The logical pipeline runs FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — WHERE executes before the SELECT list exists, so a SELECT alias is not visible to it, and a strict engine throws 'no such column'. SQLite is laxer and will sometimes resolve the alias anyway, which HIDES the lesson rather than removing it: the same query on a stricter warehouse fails, and the team learns pipeline order from an outage. The split that predicts every placement: row predicates in WHERE (status = 'cancelled', region = 'EU' — shrink the fold's input), group predicates in HAVING (cancel_pct is a group fact — it exists only after GROUP BY folds the rows). Two adjacent traps worth naming: GROUP BY ordinal works but breaks the moment someone reorders the SELECT list, and ORDER BY does see aliases because it runs last — which is why sorts accept what filters reject. Filter rows before the fold, filter groups after, and never let dialect laxity write the standard.",
      tag: "pipeline",
    },
    {
      id: "zalando-t17",
      q: "Where does GROUP_CONCAT earn its place in a marketplace kit — and when is a comma-fold the wrong shape entirely?",
      a: "It earns its place whenever a stakeholder wants the LIST, not the count: which SKU ids made up a drop month's baskets, which SKUs a partner brand carries, the order-id trail behind a member's 24-basket history. The fold is one row per group with a delimited string. Three craft points: pass a custom separator when values can contain commas ('; ' for SKU lists); SQLite's GROUP_CONCAT has no guaranteed row order, so stage the rows ordered in a CTE first — a manifest that is 'roughly sorted' is a bug report waiting; and the result is TEXT — it does not sum, join on ranges, or count reliably downstream. That last point is the 'when not': if the next step is arithmetic, filtering or a join, ship the rows and let the BI layer fold — a comma-fold is a presentation edge, not a data model. The interview version: build the manifest, then answer what breaks if that string becomes your join key — which is everything.",
      tag: "aggregation",
    },
    {
      id: "zalando-t18",
      q: "One-pass censuses: FILTER (WHERE …) versus SUM(CASE …) — which do you ship, and what does the reconciliation check look like?",
      a: "Functionally they are the same conditional count and this engine runs both, so the answer is portability plus reconciliation. SUM(CASE WHEN … THEN 1 ELSE 0 END) runs on every engine ever shipped; FILTER (WHERE …) reads cleaner — the condition sits beside the aggregate instead of inside it — but it is SQL:2003 syntax with spotty support, so a query headed for another warehouse gets the CASE form. The discipline both must satisfy: branch totals reconcile to the parent. A status census returning 52 delivered, 30 shipped, 14 pending, 7 cancelled had better sum to COUNT(*) = 103, and I add that check as a column or a row, because the silent version of this bug is a WHEN branch with a typo'd literal that leaks rows into ELSE while every individual number looks plausible. Same rule for FILTER: the unfiltered COUNT(*) sits beside the filtered counts on the same scan. One scan, every branch, a total that ties — that is the one-pass census, and it is how a query-budgeted marketplace desk ships dashboards.",
      tag: "aggregation",
    },
    {
      id: "zalando-t19",
      q: "A member's basket stream lands with duplicate rows — same order id, different loaded_at. How do you dedupe, and what do you owe the business about what you dropped?",
      a: "ROW_NUMBER over the business key, ordered by the freshness column descending, keep rn = 1: ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY loaded_at DESC) = 1 — deterministic where DISTINCT and GROUP BY would be arbitrary. The craft is the tie-break: two rows with the same loaded_at need a third key (a checksum, a source rank) or your dedupe is non-deterministic and reruns flip which row survived — which is how 'the dashboard changed' incidents start. What I owe the business is the discard report: how many rows collapsed, what the survivors' totals reconcile to, and whether the dropped rows differ in any measured column. Dedupe is a definition decision: a re-published basket is a duplicate, but two payment rails on one invoice are structure — on this db, five invoices legitimately carry two payment rows each, and collapsing them would hide real money. Confusing the two is how you delete real data with clean-looking SQL. Before-and-after counts and a spot-check of discards ride the PR.",
      tag: "quality",
    },
    {
      id: "zalando-t20",
      q: "The trend deck needs every month on the axis — including months with zero baskets. Why does GROUP BY lie here, and how do you fix it?",
      a: "GROUP BY reports buckets that exist in the data: if no basket landed in a month, that month contributes no row, and the trend chart quietly compresses the calendar — a gap reads as flat, or the line just skips it. The fix is a calendar spine: generate the month range (a recursive CTE over dates, or a warehouse calendar table), LEFT JOIN the folded demand onto it, and COALESCE the misses to zero — the spine guarantees a row for every month whether or not demand showed up. The craft points: generate the spine at the grain you report (month starts, not raw timestamps), join on the SAME bucket key both sides — STRFTIME('%Y-%m', …) — and be explicit that zero-filled months are imputed, not observed: zero demand means 'no baskets landed', which is different from 'baskets landed and returned nothing'. On this db the 14-month spine from 2024-01 through 2025-02 happens to be fully populated, but the dashboard must not depend on that luck — the first empty drop month is exactly when a missing spine ships a broken chart to the planning sync.",
      tag: "dates",
    },
    {
      id: "zalando-t21",
      q: "A drop-board query got slow after the season turned. Walk me through the first three things you check — and the habit that prevents most of it.",
      a: "First: sargability — is a function wrapped around an indexed column in a WHERE? STRFTIME('%Y-%m', created_at) = '2025-01' cannot use an index on created_at, but created_at >= '2025-01-01' AND created_at < '2025-02-01' can; the same crime with UPPER(name) or arithmetic on the column. Second: fold order — am I fanning 103 baskets into 251 scanned lines before filtering, when filtering first and folding after reads the same and does a fraction of the work? Third: projection — SELECT * dragging every column through a join the board renders three of; narrow the columns and let covering indexes cover. The prevention habit is writing predicates the way the index is shaped: half-open date ranges, bare columns on the left of comparisons, equality columns before range columns in composite indexes. And measure before optimizing — on a 103-row db every plan is instant, which is exactly why the habits must be reflexive: this code ships to a warehouse where the basket stream is a billion rows, not 103.",
      tag: "performance",
    },
    {
      id: "zalando-t22",
      q: "Merch quotes a demand lift and finance's number disagrees. How do you run down a metric-definition fight at a fashion marketplace?",
      a: "Definitions before data: put the two queries side by side and diff the DENOMINATOR decisions. The usual suspects here: cancelled demand in or out (7 of 103 baskets — 6.8 percent swings every growth quote), returns netted or grossed (fashion's returns story is the size-fit loop — a returns RATE with no stated base is a rumor), basket grain versus line grain (103 versus 251 is a 2.4x spread on every 'order' claim), and the time boundary — created_at versus shipped_at puts the same basket in different months. Then units: INTEGER cents divided per-row instead of at the display edge truncates real money. The resolution is a metric registry: each KPI gets one owner, one definition, one canonical query — placed demand includes the 7 cancelled, kept demand excludes them, and both are NAMED, because both are true and only the label makes them useful. The interview move is saying the denominator out loud before quoting any number — 'kept-basket share, cancelled included in the base, 93.2 percent' — which ends the fight before it starts.",
      tag: "metrics",
    },
    {
      id: "zalando-t23",
      q: "Where does a SELF-join belong in a fashion marketplace, and what does the fan-out do to your counts if you're careless?",
      a: "Anywhere two rows of the SAME table need to meet: cluster-versus-cluster boards (EU's 45 baskets beside APAC's 37 in one row), adjacent-period comparisons (this month's census beside last month's), pairwise basket analysis (which two SKUs share a basket — the cross-scan map), and dedupe probes (rows that duplicate each other). The craft problem is fan-out — every row pairs with every qualifying partner, so an N-row group becomes N-squared pairs and a careless COUNT(*) reads demand that never scanned. The disciplines: alias the two copies meaningfully (this_month / last_month, never t1/t2), restrict the join so pairs are unique (a.id < b.id for unordered pairs — which also kills the (A,B)/(B,A) double-count — or equality on the shared key), and count at DISTINCT grain when pairing fans. The pattern I ship: fold to the census first, then join the census to itself on a label — pairing raw rows multiplies before you have defined what a pair means.",
      tag: "joins",
    },
    {
      id: "zalando-t24",
      q: "Beyond the cents divide — what other numeric type traps live in a fashion-retail SQL screen?",
      a: "Four, all shipped in production at least once. Integer division: COUNT(cancelled) / COUNT(*) with two INTEGERs returns 0 before any percent rounding — the fix is 100.0 times the numerator FIRST, promoting before the divide. Rounding placement: rounding latency per row then averaging is a different, wrong metric — average in native units and round once at the display edge, the same rule as the cents divide. Float comparison: REAL totals make total = 338.19 fragile — round both sides or compare within a tolerance, and prefer INTEGER cents for exactly this reason. And silent casts: '2024-01' compared to a number, a price string concatenated into arithmetic — this engine's flexible typing executes what stricter engines would reject, so the bug ships instead of erroring. Z-score work inherits all four: a mean over INTEGER months returns REAL here, but the variance fold is where casts and rounding placement quietly diverge. The discipline: know every column's storage class, cast at boundaries explicitly, round once at the edge, and magnitude-check every fold — a total printing 34.83 instead of 34833.28 is a unit bug, not a small month.",
      tag: "types",
    },
  ],

  mcqs: [
    {
      id: "zalando-mcq-1",
      prompt: "The baskets table holds 103 rows. Which count pair explains the fulfillment gap on the drop board?",
      choices: [
        "COUNT(*) = 103 baskets, COUNT(shipped_at) = 82 dispatched — the 21-gap is 14 pending + 7 cancelled",
        "COUNT(*) = 82, COUNT(shipped_at) = 103 — dispatch scans backfill the total",
        "COUNT(*) = 103, COUNT(shipped_at) = 103 — NULLs count as zero dates",
        "COUNT(shipped_at) = 96 — cancelled baskets carry scans too",
      ],
      answer: 0,
      why: "COUNT(*) counts every row (103); COUNT(shipped_at) skips NULLs (82 dispatched). The 21-basket gap decomposes exactly into 14 pending + 7 cancelled — a fulfillment signal, not missing data.",
      notes: [
        { choice: 2, why: "COUNT(col) never counts NULLs — that's its whole difference from COUNT(*). If it counted NULL dates, the two counts would always tie and the column would be pointless." },
        { choice: 3, why: "Cancelled baskets have no dispatch scan — 82 includes only delivered (52) + shipped (30). The census is a status read before it's a date read." },
      ],
      difficulty: "easy",
    },
    {
      id: "zalando-mcq-2",
      prompt: "Nordic Gadgets AB's brand share is quoted as 32%. Which demand figure is the denominator?",
      choices: [
        "Nordic's own revenue, 11130.25",
        "The six-brand scanned-demand book, 34833.28",
        "The 103-basket count",
        "The 251 scanned lines",
      ],
      answer: 1,
      why: "Share of demand = brand revenue over the whole scanned book: 11130.25 / 34833.28 = 32%. The denominator is the platform fold, not the brand's own number and not a row count.",
      notes: [
        { choice: 0, why: "A brand over itself is 100% by construction — a share needs a denominator bigger than the numerator's own grain. The 32% comes from the book-wide fold." },
        { choice: 2, why: "103 is a basket count, not a dollar figure — dividing dollars by baskets gives average basket value (338.19), a different metric that shares neither numerator semantics nor units." },
      ],
      difficulty: "easy",
    },
    {
      id: "zalando-mcq-3",
      prompt: "Pacific Textiles' settlement reads 298015 in the invoices table. Which expression prints the dollar figure on the brand board?",
      choices: [
        "amount_cents / 100",
        "ROUND(amount_cents / 100.0, 2)",
        "amount_cents * 100",
        "ROUND(amount_cents, 2)",
      ],
      answer: 1,
      why: "Dividing by 100.0 promotes to real arithmetic before the division; rounding once at the display edge keeps 2980.15. Invoices, payments and expenses all store INTEGER cents on this db.",
      notes: [
        { choice: 0, why: "Integer over integer truncates in SQLite — fine on whole-dollar rows, silently wrong the first time an odd-cent settlement lands. The .0 is the fix, not a style choice." },
        { choice: 2, why: "Multiplying turns cents into 29801500 — units inverted. Magnitude-check every money fold: dollars are smaller than cents, never larger." },
      ],
      difficulty: "easy",
    },
    {
      id: "zalando-mcq-4",
      prompt: "The drop ladder ranks 2024 months by basket count: February 9, September 9, then four months at 8. What rung does the FIRST 8-basket month get under DENSE_RANK — and under RANK?",
      choices: [
        "DENSE_RANK 2, RANK 2",
        "DENSE_RANK 3, RANK 3",
        "DENSE_RANK 2, RANK 3",
        "DENSE_RANK 2, RANK 1",
      ],
      answer: 2,
      why: "DENSE_RANK shares rung 1 across the two 9-basket months and hands the next distinct value rung 2 — no gaps. RANK shares rung 1 too but skips to rung 3, implying a second tier that was never there.",
      notes: [
        { choice: 1, why: "That's RANK's answer wearing DENSE_RANK's name — the skipped rung is precisely the phantom tier the planning sync will discuss for ten minutes." },
        { choice: 3, why: "Neither function resets ties to rung 1 — only ROW_NUMBER with an arbitrary tiebreak could, and then the two 9-basket months would silently order February over September." },
      ],
      difficulty: "medium",
    },
    {
      id: "zalando-mcq-5",
      prompt: "The brand board gates at '3+ live SKUs'. With six brands carrying 3, 3, 2, 2, 3, 3 SKUs — which clause keeps the right rows?",
      choices: [
        "WHERE COUNT(DISTINCT p.id) >= 3",
        "HAVING COUNT(DISTINCT p.id) >= 3",
        "LIMIT 3",
        "WHERE skus > 3",
      ],
      answer: 1,
      why: "The SKU count is a group fact — it exists only after the brand-to-SKU fold groups the rows, so the gate is HAVING. That keeps the four 3-SKU brands and drops the two 2-SKU brands, a materiality cut the deck states out loud.",
      notes: [
        { choice: 0, why: "WHERE runs before groups form — COUNT(DISTINCT p.id) doesn't exist yet and the engine rejects it. The error message is the pipeline order teaching itself." },
        { choice: 3, why: "Strict > drops every brand on the floor — all four survivors carry exactly 3 SKUs. Boundary operators are the quiet way boards lose their headline rows." },
      ],
      difficulty: "medium",
    },
    {
      id: "zalando-mcq-6",
      prompt: "The EU cluster placed 45 baskets and 3 were cancelled. Which fold prints the 6.7% size-fit cancel share?",
      choices: [
        "100 * 3 / 45",
        "ROUND(100.0 * 3 / 45, 1)",
        "ROUND(3 / 45, 2) * 100",
        "3 / 45 without promotion, formatted downstream",
      ],
      answer: 1,
      why: "100.0 promotes to real arithmetic before the division: 6.666…, rounded once at the display edge to 6.7. The .0 placement is the whole fix — integer math is the standing bug in every rate a marketplace quotes.",
      notes: [
        { choice: 0, why: "100 * 3 / 45 is integer division end-to-end in SQLite: 300 / 45 truncates to 6 — the board shows 6 and the market gets flagged for a rounding bug it didn't make." },
        { choice: 2, why: "3 / 45 is 0 in integer math — the rate reads 0.00 before the multiplication can save it. Promote FIRST, round LAST." },
      ],
      difficulty: "medium",
    },
    {
      id: "zalando-mcq-7",
      prompt: "EU: 45 baskets from 8 members. Which count still counts MEMBERS on the grouped board?",
      choices: [
        "COUNT(*) — it always counts the primary entity",
        "COUNT(DISTINCT o.customer_id) — folding baskets back to the member grain",
        "COUNT(o.customer_id) — NULLs are skipped automatically",
        "SUM(o.customer_id) — ids sum to the member count",
      ],
      answer: 1,
      why: "COUNT(*) counts 45 basket rows; COUNT(DISTINCT o.customer_id) folds them back to 8 members. COUNT(o.customer_id) skips only NULLs — with a NOT NULL key it counts 45 too.",
      notes: [
        { choice: 0, why: "COUNT(*) counts ROWS of the grouped stream — the basket grain IS the row grain. 'Primary entity' is a hope, not semantics; DISTINCT is the fold." },
        { choice: 3, why: "SUM over ids is a meaningless number that happens to be huge. Sanity-check magnitude: member counts are smaller than basket counts, never larger." },
      ],
      difficulty: "medium",
    },
    {
      id: "zalando-mcq-8",
      prompt: "You band ALL 103 baskets with CASE WHEN julianday(shipped_at) - julianday(created_at) <= 3 THEN 'in_window' ELSE 'late' END. How many baskets land in 'late'?",
      choices: [
        "25 — exactly the 4-day baskets",
        "46 — the 25 four-day baskets plus 21 unfulfilled baskets swept into ELSE",
        "21 — only the unfulfilled baskets",
        "0 — NULL latency sorts as fastest",
      ],
      answer: 1,
      why: "57 dispatched baskets are within 3 days, 25 sit at 4 days — and the 21 baskets with NULL shipped_at (14 pending + 7 cancelled) fail the WHEN arm because NULL <= 3 is UNKNOWN, silently joining the 'late' bucket: 25 + 21 = 46. The population filter isn't pedantry; it's the difference between 'late' and 'not yet'.",
      notes: [
        { choice: 0, why: "That's the answer WITH the WHERE shipped_at IS NOT NULL filter — the case is precisely what the filter prevents. The ELSE sweep is the trap the drop board keeps rediscovering." },
        { choice: 3, why: "NULL never sorts as fastest or slowest in a comparison — it yields UNKNOWN and the row falls through. Reporting 0 'late' baskets during a backlog is how the board lies." },
      ],
      difficulty: "hard",
    },
    {
      id: "zalando-mcq-9",
      prompt: "Baskets join to scan lines: 103 baskets fan into 251 rows. On the joined result, which fold still counts BASKETS?",
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
      difficulty: "hard",
    },
    {
      id: "zalando-mcq-10",
      prompt: "A settlement invoice bills 6148 dollars; the rails moved 4000 against it. How does the coverage census classify it?",
      choices: [
        "Exact — the invoice is open, so it cancels out",
        "Partial — paid 4000.00 against a 6148.00 bill, a 2148.00 shortfall",
        "None — no full payment means no payment",
        "Void — shortfalls void themselves",
      ],
      answer: 1,
      why: "Coverage classifies per invoice: exact (paid = billed), partial (0 < paid < billed), none (no rails at all). This invoice is the db's only partial — 4000.00 of 6148.00 — and the 2148.00 shortfall is exactly what the fold must surface, not average away.",
      notes: [
        { choice: 0, why: "Open is a ledger STATUS, not a coverage class — the rail moved 4000, so 'none' is false and 'exact' is false. Status and coverage are different columns of the same truth." },
        { choice: 2, why: "The anti-join 'none' class counts invoices with ZERO payment rows. A partial rail is a payment — folding it into 'none' understates collections by 4000.00." },
      ],
      difficulty: "hard",
    },
    {
      id: "zalando-mcq-11",
      prompt: "The close stacks the basket census under the settlement census in one result. Which UNION behavior can silently corrupt the stack?",
      choices: [
        "UNION dedupes ENTIRE rows across branches — two different invoices with identical amounts and dates read as one",
        "UNION ALL dedupes per branch, dropping duplicates within each SELECT",
        "UNION only removes NULL rows — amounts and dates are always kept",
        "UNION ALL sorts both branches and drops ties at the boundary",
      ],
      answer: 0,
      why: "UNION dedupes whole rows across the combined result; two coincidentally-equal rows from different branches collapse into one — a reconciliation bug wearing an optimization's clothes. UNION ALL appends everything and is the honest default for disjoint, labeled branches.",
      notes: [
        { choice: 1, why: "UNION ALL dedupes nothing — it keeps EVERY row, which is exactly why reconciliation stacks ship with it and carry a source-literal column." },
        { choice: 2, why: "UNION's dedupe is whole-row equality, NULLs included — there is no 'remove only NULLs' mode; that's COALESCE's job upstream." },
      ],
      difficulty: "easy",
    },
    {
      id: "zalando-mcq-12",
      prompt: "The momentum walk prints NULL for 2024-01's prev_revenue (the month opened at 3731.97). What does the strong report say?",
      choices: [
        "'Baseline month' — the first month has no predecessor, and a NULL baseline is the honest label",
        "'Zero move' — NULL means the delta is 0.00 and the month is flat",
        "'Data missing' — 2024-01 must be dropped until backfilled",
        "'-3731.97' — the delta against an implicit zero baseline",
      ],
      answer: 0,
      why: "LAG has no row before the first — NULL is the contract, and the report labels it a baseline month rather than coalescing a fake zero or a fake drop into the delta column.",
      notes: [
        { choice: 1, why: "Coalescing NULL to 0 manufactures a -3731.97 'collapse' that never happened — the single most common momentum bug on a trend deck." },
        { choice: 3, why: "An implicit-zero baseline is a definition nobody agreed to; the calendar starts at 3731.97, it didn't fall from it." },
      ],
      difficulty: "easy",
    },
    {
      id: "zalando-mcq-13",
      prompt: "'Which partner brands have no scanned demand this quarter?' — on this db, the honest result is:",
      choices: [
        "Zero rows — every one of the 6 partner brands has scanned demand, and saying the pipe is empty IS the answer",
        "One row — Pacific Textiles at 2980.15 sits under the 3000 floor, so it never scanned",
        "Three rows — the brands under the 4.5 rating bar went dark",
        "Six rows — anti-joins return the full left table by definition",
      ],
      answer: 0,
      why: "The brand→SKU→lines anti-join returns empty here because all six brands have scanned demand. Reporting the empty result with the population stated beats shipping a dark-brand dashboard of thin air.",
      notes: [
        { choice: 1, why: "The 3000 floor is a board gate, not a scan fact — Pacific scanned 2980.15 worth of demand; 'under the floor' and 'never scanned' are different sentences." },
        { choice: 3, why: "An anti-join returns left rows WITHOUT matches — if all rows match, the result is empty, not the full table." },
      ],
      difficulty: "easy",
    },
    {
      id: "zalando-mcq-14",
      prompt: "…WHERE id NOT IN (SELECT supplier_id FROM products WHERE category = 'Audio') — one product row carries a NULL supplier_id. What ships?",
      choices: [
        "An empty result — NOT IN with a NULL in the inner set evaluates UNKNOWN for every outer row",
        "The non-Audio brands — NULL is skipped automatically",
        "A SQL error — NULLs are rejected in NOT IN",
        "All six brands — NULL matches nothing, so every row passes",
      ],
      answer: 0,
      why: "x NOT IN (…, NULL) can never be TRUE: comparisons with NULL yield UNKNOWN, and the NOT IN fails closed — the whole report empties silently with correct-looking SQL. NOT EXISTS is the NULL-safe anti-join.",
      notes: [
        { choice: 1, why: "NULL isn't 'skipped' in a negative membership test — it poisons the whole list. The bug ships quietly because the query runs without error." },
        { choice: 3, why: "'NULL matches nothing' is the INNER-join intuition; in NOT IN it matches so little that no row survives." },
      ],
      difficulty: "medium",
    },
    {
      id: "zalando-mcq-15",
      prompt: "A running-demand tracker orders by a timestamp key that carries duplicates. SUM(revenue) OVER (ORDER BY ts) leaps several baskets at once. Why?",
      choices: [
        "The default frame is RANGE — peers sharing the ORDER key join the running total as one step",
        "SUM OVER always skips duplicate keys' values",
        "The frame is ROWS by default — the leap means rows arrived out of order",
        "Window functions cannot run on columns with duplicates",
      ],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — RANGE folds same-key peers into one step. On month grain that is the cadence curve you want; on a duplicate-bearing row key the curve leaps whole days. Name the frame (ROWS …) when row order is the meaning.",
      notes: [
        { choice: 2, why: "It's the reverse — ROWS would step row by row; the leap is RANGE's peer-folding, not an ordering accident." },
        { choice: 3, why: "Duplicates are legal in windows; they change what the DEFAULT frame does — which is exactly why the frame is named out loud." },
      ],
      difficulty: "medium",
    },
    {
      id: "zalando-mcq-16",
      prompt: "'Baskets above the platform average' vs 'baskets above their member's own average' — which shape answers the second question?",
      choices: [
        "A correlated subquery — WHERE total > (SELECT AVG(i.total) FROM orders i WHERE i.customer_id = o.customer_id), re-run per outer row",
        "A derived table of the platform average joined back — the same answer, cheaper",
        "A scalar subquery of the global 338.19 average — averages are averages",
        "A HAVING clause on member id — HAVING compares members to the platform",
      ],
      answer: 0,
      why: "'Above my member's own average' needs the inner fold to re-run per outer row, correlated on customer_id — a different question than the platform benchmark (338.19), with a different cost profile at scale.",
      notes: [
        { choice: 1, why: "The derived platform-average shape answers the FIRST question — swapping shapes silently swaps populations." },
        { choice: 2, why: "The global average is one number; 'own member's average' is one number per member — 16 different benchmarks here, not one." },
      ],
      difficulty: "medium",
    },
    {
      id: "zalando-mcq-17",
      prompt: "The drop retro wants a SKU-id manifest per drop month. Which craft point about GROUP_CONCAT is load-bearing?",
      choices: [
        "SQLite's GROUP_CONCAT has no guaranteed row order — stage the rows sorted in a CTE first or the manifest reads differently each run",
        "GROUP_CONCAT returns an INTEGER you can sum downstream",
        "GROUP_CONCAT sorts its inputs alphabetically by default",
        "GROUP_CONCAT requires the folded column to be numeric",
      ],
      answer: 0,
      why: "The fold is orderless by default — 'roughly sorted' is a bug report waiting. Stage ordered, pass a custom separator when values contain commas, and treat the result as presentation TEXT: it does not sum, join on ranges, or count reliably downstream.",
      notes: [
        { choice: 1, why: "The result is TEXT — the moment the next step is arithmetic or a join, ship the rows instead and let the BI layer fold." },
        { choice: 2, why: "No implicit sort exists; whichever order the scan yields is what you get — which is the whole trap." },
      ],
      difficulty: "medium",
    },
    {
      id: "zalando-mcq-18",
      prompt: "Planning asks for a z-score of July's demand against the seasonal norm. Which decision moves the number MOST — and must be stated?",
      choices: [
        "The population behind mean and spread: all 14 months gross (cancelled included) versus kept-only — different mean, different sigma, different z",
        "Rounding the z to 1 decimal before comparing to the ±2 band",
        "Using the median instead of the mean — z-scores require the median",
        "Excluding July from the norm population — a month can never score itself",
      ],
      answer: 0,
      why: "A z-score is a denominator argument wearing statistics: the mean and sigma of gross monthly demand (cancelled in) and kept demand (cancelled out) are different populations, and each produces a different July. State the population, then the score.",
      notes: [
        { choice: 2, why: "Rounding at the display edge doesn't change the band test materially — the population choice can flip the sign and the verdict." },
        { choice: 3, why: "In-vs-out of the scored month is a real methodological choice, but it doesn't dominate the gross-versus-kept fork — and z-scores standardize on the mean, not the median (that's the MAD family)." },
      ],
      difficulty: "hard",
    },
    {
      id: "zalando-mcq-19",
      prompt: "Merch quotes 'sell-through' two ways and the numbers disagree. Which definition matches units sold to units stocked?",
      choices: [
        "Per SKU: SUM(quantity) over scanned lines against products.stock — Headset: 46 sold against 60 stocked, one SKU one ratio",
        "Per line: quantity over stock row-by-row — 251 lines each carry their own ratio",
        "Platform-wide: total units over total stock, one number for all 16 SKUs — same thing, cleaner",
        "Per member: units a member scanned against units stocked — the loyalty read",
      ],
      answer: 0,
      why: "Sell-through lives at SKU grain: line-level units folded per product, then divided by that product's stock. Line-grain ratios average nothing honestly, and the platform-wide fold hides exactly the thin-cover SKUs (14, 15, 17 units left) the re-order loop exists to catch.",
      notes: [
        { choice: 2, why: "The platform aggregate is a different metric (fleet cover) — quoting it as 'sell-through' buries the size-curve story." },
        { choice: 1, why: "A ratio per scanned line is not a rate anyone plans against; the stock column doesn't even live at line grain." },
      ],
      difficulty: "hard",
    },
    {
      id: "zalando-mcq-20",
      prompt: "A one-pass status census prints 52 delivered, 30 shipped, 14 pending, 7 cancelled. What is the reconciliation check — and the silent bug it catches?",
      choices: [
        "Branches must sum to COUNT(*) = 103 — a typo'd literal in one WHEN arm leaks rows into ELSE and the census stops tying",
        "Each branch must equal 25 — four quarters of the stream",
        "The branches must sum to 251 — every scanned line gets a status",
        "No check exists — FILTER guarantees exhaustive branches",
      ],
      answer: 0,
      why: "52 + 30 + 14 + 7 = 103 — the census reconciles to the parent count on the same scan. The silent failure is a mis-typed status literal that quietly routes rows to a default branch; the total column is the alarm.",
      notes: [
        { choice: 2, why: "251 is the line-grain fan-out — a census over baskets counts 103 rows; mixing grains is the reconciliation failure itself." },
        { choice: 3, why: "FILTER counts what matches; nothing about it makes your branches exhaustive — that's the author's contract." },
      ],
      difficulty: "hard",
    },
    {
      id: "zalando-mcq-21",
      prompt: "The cadence ladder buckets baskets by month. Which key groups AND sorts like a calendar?",
      choices: [
        "STRFTIME('%Y-%m', created_at) — fixed-width '2024-09' keys that group correctly and sort chronologically",
        "STRFTIME('%m', created_at) — month numbers sort fine across years",
        "SUBSTR(created_at, 12, 8) — the time-of-day slice keeps ordering",
        "CAST(created_at AS INTEGER) — dates cast to keys cleanly",
      ],
      answer: 0,
      why: "'%Y-%m' yields fixed-width ISO keys — '2024-09' — that both group distinct months and sort in calendar order. '%m' merges every January in the table into one bucket; the 14-month calendar collapses to 12.",
      notes: [
        { choice: 1, why: "'%m' loops 01-12 every year — January 2024 and January 2025 fold together, and the year-over-year read dies quietly." },
        { choice: 3, why: "An ISO timestamp casts to a large number of seconds — a bucket per instant, not per month." },
      ],
      difficulty: "easy",
    },
    {
      id: "zalando-mcq-22",
      prompt: "The settlement clock reads 28.4 days against flat 30-day terms. Which population does the 28.4 cover?",
      choices: [
        "The 20 paid invoices that carry payment rails — void and no-rail invoices have no settlement event to measure",
        "All 28 invoices — open ones settle at 0 days, pulling the average down",
        "The 21 paid-status invoices — status alone defines the population",
        "The 6 open invoices — they are the ones still running",
      ],
      answer: 0,
      why: "Days-to-settle is issue-to-first-payment, measurable only where a rail exists: 20 of the 21 paid-status invoices (one paid invoice carries zero rails — the known anomaly). The population note is the whole answer; void and open sit out by definition.",
      notes: [
        { choice: 2, why: "Status is not population — the paid-no-rails invoice (1756.00) has no payment date, and counting it as 0 days would forge a fast settlement." },
        { choice: 1, why: "Open invoices haven't settled; averaging them in as zeros invents speed the ledger never recorded." },
      ],
      difficulty: "easy",
    },
    {
      id: "zalando-mcq-23",
      prompt: "The kept-basket share reads 6.8% cancelled. What base does that percentage live on?",
      choices: [
        "All 103 placed baskets — cancelled baskets stay IN the placement base; the kept complement is 96 of 103",
        "The 96 kept baskets — the share is cancelled over kept",
        "The 82 dispatched baskets — only fulfilled demand can cancel",
        "The 251 scanned lines — lines carry the status",
      ],
      answer: 0,
      why: "Placed is the base: 7 cancelled of 103 placed = 6.8%, and the kept share is its complement — 96 of 103. The denominator rule (cancelled stays IN) is the sentence every Zalando screen circles.",
      notes: [
        { choice: 2, why: "The 82 dispatched are the latency population, not the cancel base — cancelled baskets never dispatch, so they'd vanish from their own rate." },
        { choice: 1, why: "Cancelled-over-kept exceeds 100% the day cancels outnumber keeps — a base that can't hold the rate is the wrong base." },
      ],
      difficulty: "easy",
    },
    {
      id: "zalando-mcq-24",
      prompt: "A colleague writes WHERE cancel_pct > 5 while cancel_pct is computed in the SELECT list. What is the honest diagnosis?",
      choices: [
        "Logical evaluation runs WHERE before SELECT — the alias doesn't exist yet; group facts belong in HAVING, row filters in WHERE",
        "It works everywhere — SQL resolves aliases in any clause",
        "Wrap it — a WHERE on a SELECT alias always re-runs the expression first",
        "Move it to ORDER BY — ORDER BY sees aliases first, so the filter applies there",
      ],
      answer: 0,
      why: "WHERE executes before the SELECT list, so a SELECT alias is not visible to it (engines vary in laxity — SQLite sometimes resolves it, which HIDES the lesson rather than removing it). A group-level rate needs HAVING over the fold; a row-level filter needs the expression spelled out.",
      notes: [
        { choice: 1, why: "Dialect laxity is a trap — the same query on a stricter engine throws 'no such column', and the team learns pipeline order from an outage." },
        { choice: 3, why: "ORDER BY does see aliases (it runs last), but a filter is not a sort — moving it changes semantics, not just placement." },
      ],
      difficulty: "medium",
    },
    {
      id: "zalando-mcq-25",
      prompt: "Five invoices each carry two payment rails (ids 1, 5, 12, 19, 22). The dedupe proposal: keep one rail per invoice. What's the honest objection?",
      choices: [
        "Two rails on one invoice are structure, not duplicates — folding them hides part-payments and understates collections by the dropped rail",
        "Dedupe is safe — identical invoice ids are duplicates by definition",
        "Keep the LARGEST rail and the totals tie — the smaller rail is rounding noise",
        "Split rails only exist on void invoices — the fold should void them",
      ],
      answer: 0,
      why: "A genuine part-payment split is money structure: two rails against one bill. Collapsing to one rail per invoice discards real settlement rows — the coverage census (exact 21 / partial 1 / none 6) exists precisely to keep them visible and classified.",
      notes: [
        { choice: 2, why: "'The totals tie' is survivorship — the smaller rail moved real cents; ties that survive by deleting rows are how shortfalls hide." },
        { choice: 1, why: "Duplicate BUSINESS KEYS are duplicates; multiple payments per invoice is a one-to-many relationship, the most normal shape in the ledger." },
      ],
      difficulty: "medium",
    },
    {
      id: "zalando-mcq-26",
      prompt: "The tracker must replay baskets row by row in load order, including ties. Which frame ships?",
      choices: [
        "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — row order is the meaning, ties step individually",
        "RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — the default is already row-wise",
        "No frame — ORDER BY alone forces row-wise replay",
        "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW — replay means previous row only",
      ],
      answer: 0,
      why: "ROWS steps per physical row; RANGE folds peers. For a row-grain replay with ties, the explicit ROWS frame is the contract — and naming it is the tell that the analyst knows the default is RANGE.",
      notes: [
        { choice: 2, why: "ORDER BY picks the frame for you — RANGE — which is exactly the silent fold being avoided." },
        { choice: 3, why: "A 1-preceding frame is a LAG replacement, not a running total; the cumulative replay needs UNBOUNDED PRECEDING." },
      ],
      difficulty: "medium",
    },
    {
      id: "zalando-mcq-27",
      prompt: "A cross-scan read pairs every two SKUs that share a basket. Which craft point keeps the pair count honest?",
      choices: [
        "Restrict to unordered pairs — oi1.product_id < oi2.product_id — and count DISTINCT basket grain where fans multiply",
        "Join order_items to itself on order_id with no restriction — pairs are naturally unique",
        "Count(*) over the self-join — every pairing is meaningful demand",
        "Self-joins cannot pair rows of the same table — stage two copies in CTEs first",
      ],
      answer: 0,
      why: "A raw self-join on shared basket fans N-squared — the same SKU pairs with itself, and (A,B) appears twice as (B,A). The < restriction halves and de-duplicates the pairing; DISTINCT grain survives the fan where COUNT(*) doesn't.",
      notes: [
        { choice: 2, why: "COUNT(*) counts pairs, not demand — 251 lines pairwise can manufacture tens of thousands of rows of 'demand' that never scanned." },
        { choice: 3, why: "A self-join IS two copies of the same table under aliases; CTEs are a styling choice, not a requirement." },
      ],
      difficulty: "medium",
    },
    {
      id: "zalando-mcq-28",
      prompt: "Open-status exposure reads 19609.00 but the no-rail anti-join reads 15217.00. What explains the 4392.00 difference?",
      choices: [
        "Two invoices swap places between the populations: the open 6148.00 bill carries a 4000.00 rail (so it is not no-rail), while a 1756.00 invoice is PAID-status with zero rails (so it is not open) — 6148 − 1756 = 4392",
        "The 6148.00 partial paid 4392.00 — the difference is just its shortfall",
        "A void invoice leaked into the open fold — voids must be excluded and re-run",
        "Cents-vs-dollars drift — one fold divided by 100, the other didn't",
      ],
      answer: 0,
      why: "The two counts are different populations, not two views of one: open includes the partial 6148.00 bill (which has a rail, so the no-rail anti-join drops it), and the no-rail set includes the paid-status 1756.00 anomaly (which no status filter would show). The 4392.00 difference is exactly 6148 − 1756 — and explaining it is the AR literacy the screen grades.",
      notes: [
        { choice: 1, why: "The shortfall is 2148.00, not 4392.00 — and the partial's rail is precisely why it leaves the no-rail population." },
        { choice: 2, why: "The void invoice (925.00) is its own status row; nothing here leaks — the difference decomposes exactly, which is the proof." },
      ],
      difficulty: "hard",
    },
    {
      id: "zalando-mcq-29",
      prompt: "The drop board's month filter — STRFTIME('%Y-%m', created_at) = '2024-07' — got slow at scale. The first fix?",
      choices: [
        "Rewrite half-open: created_at >= '2024-07-01' AND created_at < '2024-08-01' — a bare column can use the index; a wrapped one cannot",
        "Add an index on STRFTIME('%Y-%m', created_at) — index the expression and move on",
        "Switch to SUBSTR(created_at, 1, 7) = '2024-07' — shorter functions are faster",
        "Drop the WHERE and filter in the app layer — the database was the bottleneck",
      ],
      answer: 0,
      why: "A function wrapped around the indexed column defeats the index (non-sargable); the half-open range keeps the same population and lets the engine seek. Same months, same rows, seekable plan.",
      notes: [
        { choice: 1, why: "Expression indexes exist, but they're a schema change for a habit you can fix in the predicate — and the half-open form is portable across every engine." },
        { choice: 3, why: "Filtering in the app moves the scan, not the work — the rows still cross the wire." },
      ],
      difficulty: "hard",
    },
    {
      id: "zalando-mcq-30",
      prompt: "Which fold surfaces the settlement anomaly where a PAID invoice has no payment rails (1756.00)?",
      choices: [
        "The payment anti-join at invoice grain — LEFT JOIN payments, GROUP BY invoice, HAVING COUNT(p.id) = 0 — then read the status column: 'paid' with zero rails",
        "A status census — GROUP BY status counts 21 paid and stops there",
        "The ledger trial balance — a 1756.00 delta would appear in the tie",
        "MAX(amount_cents) over payments — the biggest rail is the anomaly",
      ],
      answer: 0,
      why: "The anomaly is a contradiction between two columns of different tables: status says paid, the rails say nothing arrived. Only the invoice-grain anti-join sees both sides — and its status column is what turns a stray row into a named anomaly class.",
      notes: [
        { choice: 2, why: "The trial balance ties at 181080 regardless — global ties catch nothing row-level; that's WHY anomaly classes get hunted individually." },
        { choice: 1, why: "The status census is exactly how the anomaly hides — 'paid' looks populated until you ask which paid invoices were settled." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-zalando-1",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "The partner-brand board",
      brief:
        "Zalando-flavored case on the storefront db (suppliers = partner brands, products = SKUs, order_items = scanned lines): the category team ranks the brands that earn next month's homepage drop slot, and the category lead is explicit about the contract: 'a brand carries the slot on two floors — at least 3 live SKUs in the catalog AND 3000+ in scanned demand — revenue to 2 decimals, biggest book first.' Probed facts: six partner brands are live, and the demand book reads Nordic Gadgets AB 11130.25 (a 32% share of the 34833.28 platform total), Midwest Hardware Co 9294.93, Alpine Audio GmbH 4765.63, Andes Naturals SA 3613.25, Shenzhen Electro 3049.07, Pacific Textiles 2980.15. Live SKU counts run 3, 3, 2, 2, 3, 3 — so both floors do real cutting.",
      ask: "Return the partner brands that clear both floors: brand name, live SKU count, and scanned demand to 2 decimals — biggest book first.",
      template:
        "SELECT s.name AS brand,\n       COUNT(DISTINCT p.id) AS skus,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.product_id = p.id\nGROUP BY s.name\nHAVING COUNT(DISTINCT p.id) >= {1}\n   AND SUM(oi.quantity * oi.unit_price) >= {2}\nORDER BY revenue {3};",
      slots: [
        {
          answer: "3",
          kind: "number",
          label: "the assortment floor",
          why: "The category contract is 3+ live SKUs, and 3 is also the survivors' own SKU cell — the floor lands exactly on the books it admits. A 2-SKU floor would readmit Alpine Audio GmbH (4765.63) and Andes Naturals SA (3613.25), brands the drop slot was designed to exclude for thin assortments; a 4-SKU floor admits nobody and the board ships empty.",
        },
        {
          answer: "3000",
          kind: "number",
          label: "the demand floor",
          noVerify: true,
          why: "The demand floor is the second gate: 3000+ keeps Shenzhen Electro (3049.07) and cuts Pacific Textiles at 2980.15 — a 19.85 miss that is the whole floor fight. Dropping the floor to 2000 readmits Pacific; the 3000 line is what makes the board three brands instead of four.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The board leads with the book: Nordic 11130.25, Midwest 9294.93, Shenzhen 3049.07. ASC would open the review on the smallest surviving brand and bury the 32% share the category lead reads first.",
        },
      ],
      distractors: ["2", "4", "2000", "ASC"],
      walkthrough:
        "A brand board is two folds and two floors in one pass. The join chain runs brands to SKUs to scanned lines — suppliers to products to order_items — and GROUP BY s.name folds each brand's lines into a SKU census and a revenue sum rounded once. The floors then cut in two different directions: the SKU floor at 3 drops Alpine Audio GmbH (4765.63) and Andes Naturals SA (3613.25) for thin assortments, and the demand floor at 3000 drops Pacific Textiles (2980.15 — a 19.85 miss). Survivors: Nordic Gadgets AB 3 SKUs / 11130.25, Midwest Hardware Co 3 / 9294.93, Shenzhen Electro 3 / 3049.07, biggest first. The distractors encode the board bugs: an assortment floor of 2 readmits the thin brands (five rows) and a floor of 4 empties the board entirely; a 2000 demand line readmits Pacific and turns the floor fight into a non-fight; ASC crowns the smallest book and buries the 32% share. Two floors, one direction — each a decision the query makes visible.",
    },
    {
      id: "cs-zalando-2",
      tier: "hard",
      topic: "t5",
      universe: "growth",
      title: "The drop-calendar ladder",
      brief:
        "Zalando-flavored case on the storefront db (orders = baskets): the drop-planning sync sets next quarter's cadence from last year's, and the planning lead wants the ladder ranked honestly: 'rank the 2024 months by basket count for the drop calendar — and I know our months tie, so I want tied months SHARING a rung, not silently split, and ties read in calendar order.' Probed facts: 2024 monthly basket counts run 6-to-9 — February and September tie at the top with 9; January, March, May and July tie at 8; April, August, October and December tie at 7; June and November sit at 6. The calendar story matters: July held 8 baskets while revenue collapsed to 1193.86, the year's floor.",
      ask: "Rank the 2024 months by basket count — tied months share a rung, busiest tier first, months in calendar order inside each tier.",
      template:
        "WITH monthly AS (\n  SELECT STRFTIME('%Y-%m', created_at) AS month,\n         COUNT(*) AS baskets\n  FROM orders\n  WHERE STRFTIME('%Y-%m', created_at) LIKE {1}\n  GROUP BY month\n)\nSELECT month,\n       baskets,\n       {2} OVER (ORDER BY baskets DESC) AS rnk\nFROM monthly\nORDER BY rnk {3}, month;",
      slots: [
        {
          answer: "'2024-%'",
          kind: "keyword",
          label: "the event-year scope",
          why: "LIKE '2024-%' on the month bucket scopes the fold to the 12 planning-year months. '2025-%' would return just January (6) and February (7) of 2025 — a different year, a different calendar, and the sync would plan Q3 off two months of January-quarter data.",
        },
        {
          answer: "DENSE_RANK()",
          kind: "keyword",
          label: "the tie-sharing rank",
          why: "The planning lead asked for tied months to SHARE a rung: DENSE_RANK prints 1, 1 for the two 9-basket months, then 2 for all four 8-basket months, 3 for the 7-tier, 4 for the 6-tier — a compact ladder with no phantom rungs. RANK would jump 1, 1, 3, 3, 3, 3, 7, 7, 7, 7, 11, 11 and ROW_NUMBER would split every tie arbitrarily.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-tier-first direction",
          why: "The calendar leads with the heaviest cadence: the 9-basket months first. ASC would open the sync on June and November — the 6-basket trough — and the planning discussion would start from the weakest months wearing the headline.",
        },
      ],
      distractors: ["RANK()", "ROW_NUMBER()", "'2025-%'", "ASC"],
      walkthrough:
        "A drop ladder is a bucket, a fold, a rank, and a tie policy. STRFTIME buckets 103 baskets into month keys, the LIKE '2024-%' predicate scopes to the 12 planning months, and the CTE folds each month into a basket count. DENSE_RANK() OVER (ORDER BY baskets DESC) then assigns rungs with ties shared and no gaps: February and September share rung 1 at 9; January, March, May and July share rung 2 at 8; the four 7-basket months share rung 3; June and November share rung 4 at 6 — and the ORDER BY rnk, month tiebreak reads each tier in calendar order. The distractors encode the tie-policy failures: RANK prints 1, 1, 3, 3, 3, 3, 7, 7, 7, 7, 11, 11 — rungs 3, 7 and 11 imply tiers that don't exist and the sync argues with ghosts; ROW_NUMBER splits every tie arbitrarily, silently declaring February the better drop month than September; '2025-%' swaps the planning year and ships a two-row calendar; ASC opens the deck on the trough. Bucket, scope, fold, rank, tiebreak — five decisions, one honest ladder.",
    },
    {
      id: "cs-zalando-3",
      tier: "medium",
      topic: "s7",
      universe: "funnel",
      title: "The cluster status board",
      brief:
        "Zalando-flavored case on the storefront db (orders = baskets, customers = member households): the market-cluster review opens on a status board — every cluster's placed baskets split into delivered / shipped / pending / cancelled, with the size-fit cancel share printed beside the counts. The board lead is explicit: 'every cluster above the sample line — LATAM's 2 baskets is a sample, not a market — heaviest placed base first, cancel share to 1 decimal.' Probed facts: EU placed 45 (24 delivered, 12 shipped, 6 pending, 3 cancelled, 6.7% cancel), APAC 37 (21/8/5/3, 8.1%), US 19 (5/10/3/1, 5.3%), LATAM 2 (2/0/0/0, 0.0%). The pivot is CASE arms folded per cluster — one scan, four branches, and the branches must reconcile to the 103 placed baskets.",
      ask: "Return each cluster clearing the volume floor: placed, delivered, shipped, pending, cancelled counts and the cancel share to 1 decimal — heaviest base first.",
      template:
        "SELECT c.region AS cluster,\n       COUNT(*) AS placed,\n       SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS delivered,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS shipped,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS pending,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS cancel_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING COUNT(*) >= {2}\nORDER BY placed {3};",
      slots: [
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the pending arm's literal",
          why: "The pending column counts baskets with status exactly 'pending' — 6 in EU, 5 in APAC, 3 in US. 'shipped' would print the shipped counts (12/8/10) under pending's name and every downstream staffing read inherits the lie; 'cancelled' would twin the cancel column; a non-status literal zeroes the column while the SQL still runs.",
        },
        {
          answer: "19",
          kind: "number",
          label: "the volume floor",
          why: "The floor keeps clusters with at least 19 placed baskets — US lands exactly on 19 and survives with its row printed, LATAM's 2-basket sample drops. 20 would cut US and shrink the board to two markets; 37 keeps only EU and APAC; a sample of 2 cannot carry a cancel-share claim, which is why the floor sits above it.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "The review opens on the biggest placed base — EU 45, then APAC 37, then US 19. ASC would lead with the thinnest market and imply a scaling story the counts don't tell; a bare column reference errors, which is the audit telling you the direction was never chosen.",
        },
      ],
      distractors: ["'shipped'", "'cancelled'", "20", "ASC"],
      walkthrough:
        "A cluster board is one fold and four CASE arms. The join attaches each basket to its member's cluster, GROUP BY region folds 103 baskets into placed counts, and the four SUM(CASE …) arms split each cluster's fate — the branches must reconcile to the placed total or the board stops being a census. The volume floor at 19 keeps EU (45), APAC (37) and US (exactly 19) and drops LATAM's 2-basket sample, whose 0.0% cancel share would dress a sample as a market. What ships: EU 45 placed / 24 delivered / 12 shipped / 6 pending / 3 cancelled / 6.7%; APAC 37 / 21 / 8 / 5 / 3 / 8.1%; US 19 / 5 / 10 / 3 / 1 / 5.3% — and APAC's 8.1 against EU's 6.7 is the size-fit story the review exists to discuss. The distractors encode the board bugs: a swapped status literal silently renames a column while the row counts still tie — the most expensive bug class on a board that gets quoted; a floor of 20 erases the US row and with it the only 5.3%; ASC opens on the smallest market. Four arms, one fold, a floor that has to be defended out loud.",
    },
    {
      id: "cs-zalando-4",
      tier: "easy",
      topic: "j4",
      universe: "refund-audit",
      title: "The unpaid-rails ledger",
      brief:
        "Zalando-flavored case on the storefront db (invoices = brand settlement bills, payments = rails, cents folded by `amount_cents / 100.0`): the refund-audit desk wants the no-rail ledger — every settlement bill that has NEVER seen a payment rail, biggest bill first, with its ledger status printed beside it. Probed facts: 28 invoices, 27 payment rails, and 6 bills carry zero rails totaling 15217.00 — ids 24, 26, 27, 28, 21 and 18, from a 4937.00 top bill down to 873.00. One of the six is the trap: invoice 28 claims status 'paid' while carrying no rails at all — a known anomaly class the ledger must surface, not smooth over. 'No rails' is an anti-join question, and the anti-join that keeps NULLs is the only honest shape.",
      ask: "Return every settlement bill with zero payment rails: id, ledger status, billed amount to 2 decimals, rail count, and paid amount — biggest bill first.",
      template:
        "SELECT i.id AS invoice_id,\n       i.status,\n       ROUND(i.amount_cents / 100.0, 2) AS billed,\n       COUNT(p.id) AS rails,\n       ROUND(COALESCE(SUM(p.amount_cents), 0) / 100.0, 2) AS paid\nFROM invoices i\n{2} JOIN payments p ON p.invoice_id = i.id\nGROUP BY i.id\nHAVING COUNT(p.id) = {1}\nORDER BY billed {3};",
      slots: [
        {
          answer: "0",
          kind: "number",
          label: "the zero-rails gate",
          why: "COUNT(p.id) = 0 keeps exactly the bills with no payment rows — 6 of 28. A gate of 1 flips to the opposite book: every bill with exactly one rail, including the 4000-of-6148 partial; 2 returns only the five split-settlement bills; 3 returns an empty ledger while looking structurally correct.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the join that keeps NULLs",
          why: "LEFT JOIN preserves all 28 bills and hands the unmatched ones NULL rails — the anti-join's raw material. INNER would drop the 6 no-rail bills and return an empty 'unpaid ledger', the exact failure this audit exists to prevent; RIGHT flips the spine to the payments side; CROSS pairs every bill with every rail and the gate collapses into noise.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bill-first direction",
          why: "Collections works the top of the book first: 4937.00 down to 873.00. ASC would open the queue on the smallest balance and bury the 4937.00 bill — the one that moves the exposure number — under a pile of small change.",
        },
      ],
      distractors: ["1", "INNER", "ASC"],
      walkthrough:
        "The no-rail ledger is an anti-join wearing a collections badge. LEFT JOIN payments keeps all 28 bills and stamps the unmatched six with NULL rails; COUNT(p.id) = 0 isolates them, and COALESCE(SUM(p.amount_cents), 0) folds their paid column to 0.00 instead of NULL — a NULL paid amount on a collections report is how 'we haven't checked' masquerades as 'they paid nothing'. The result: six rows, 4937.00, 3562.00, 2794.00, 1756.00, 1295.00, 873.00 — 15217.00 of exposure — and one row is the story: invoice 28 prints status 'paid' beside rails = 0, the paid-with-no-rails anomaly class already on file. The distractors encode the three ways this read dies: a gate of 1 ships the OPPOSITE book (every exactly-once-railed bill, partial included) with plausible-looking rows; INNER drops the six and the 'unpaid ledger' returns empty — the audit failing silently at its one job; ASC buries the top bill. Keep the NULLs, fold them to zero, read the status column — that is the whole audit.",
    },
    {
      id: "cs-zalando-5",
      tier: "hard",
      topic: "q6",
      universe: "supplier",
      title: "The brand-share ladder",
      brief:
        "Zalando-flavored case on the storefront db (suppliers = partner brands, products = SKUs, order_items = scanned lines): the drop-slot review wants the brand-share ladder — each brand's scanned demand BESIDE its share of the 34833.28 platform book, share to 1 decimal, and only the brands carrying a double-digit share. The category lead names the denominator decision out loud: 'the book is the whole scanned-demand fold — 34833.28 — not the basket count, not the line count; get the denominator wrong and every share on this board is wrong by the same factor.' Probed facts: Nordic Gadgets AB 11130.25 (a 32% share), Midwest Hardware Co 9294.93 (26.7%), Alpine Audio GmbH 4765.63 (13.7%), then Andes Naturals SA 3613.25 (10.4%), Shenzhen Electro 3049.07 (8.8%), Pacific Textiles 2980.15 (8.6%). The ladder stages the brand fold in a CTE before any share math — a share computed on a fold that doesn't exist yet is the error this shape prevents.",
      ask: "Return partner brands with a double-digit share of the 34833.28 book: brand, revenue to 2 decimals, share to 1 decimal — biggest book first.",
      template:
        "WITH brand AS (\n  SELECT s.name AS brand,\n         ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\n  FROM suppliers s\n  JOIN products p ON p.supplier_id = s.id\n  JOIN order_items oi ON oi.product_id = p.id\n  GROUP BY s.name\n),\nboard AS (\n  SELECT brand,\n         revenue,\n         ROUND(100.0 * revenue / {1}, {2}) AS share_pct\n  FROM brand\n)\nSELECT brand, revenue, share_pct\nFROM board\nWHERE share_pct >= {3}\nORDER BY revenue DESC;",
      slots: [
        {
          answer: "34833.28",
          kind: "number",
          label: "the book denominator",
          noVerify: true,
          why: "The platform book is the whole scanned-demand fold — 34833.28 — and it is the ONLY denominator the share contract allows. 103 (baskets) or 251 (lines) inflate shares a hundredfold and every row on the board misleads in the same direction; the wrong-unit 34.83 turns the board into five-digit shares. This slot is the definition being measured, stated before any division.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share's display digits",
          noVerify: true,
          why: "Shares ship to 1 decimal — 32, 26.7, 13.7 — matching the board's house style. Digits at 2 print 13.68 and quietly break the floor comparison downstream; digits at 0 round 13.68 up to 14 and a brand crosses a line it didn't earn. Rounding is a display decision, made once, at the edge.",
        },
        {
          answer: "13.7",
          kind: "number",
          label: "the double-digit floor",
          why: "The floor keeps Nordic (32), Midwest (26.7) and Alpine (13.7) — and 13.7 is Alpine's own share cell, so the gate lands exactly on the book it admits. 14 would cut Alpine on a rounding hair; 10 readmits Andes at 10.4; the floor is a materiality cut the deck owns out loud.",
        },
      ],
      distractors: ["103", "251", "34.83", "2", "14", "10"],
      walkthrough:
        "A share ladder is a staged fold, one denominator, and a floor. The brand CTE folds brands→SKUs→scanned lines into revenue — 11130.25, 9294.93, 4765.63, 3613.25, 3049.07, 2980.15 — and the board stage divides each by the 34833.28 book at 1 decimal: 32, 26.7, 13.7, 10.4, 8.8, 8.6. The floor at 13.7 keeps three brands, biggest first: Nordic Gadgets AB 11130.25 at 32%, Midwest Hardware Co 9294.93 at 26.7%, Alpine Audio GmbH 4765.63 at 13.7% — Andes Naturals SA misses at 10.4 and the tail (8.8, 8.6) stays off the slot list. The distractors encode the three board-killing moves: 103 or 251 as the denominator puts the whole board on the wrong base — every share wrong by the same factor, which is exactly why nobody notices; digits at 2 or 0 re-tune the floor comparison without anyone re-deciding it; floors of 14 or 10 redraw the slot list by a hair. Stage the fold, name the denominator, land the floor on a defended line — the drop-slot argument ends where the SQL starts.",
    },
    {
      id: "cs-zalando-6",
      tier: "medium",
      topic: "x2",
      universe: "catalog",
      title: "The size-curve shelf census",
      brief:
        "Zalando-flavored case on the storefront db (products = SKUs, order_items = scanned lines, stock = size-curve cover): the buying team wants the cover census in ONE pass — how many SKUs sit in the thin band, where the thin band's ceiling lands, how many carry deep cover, and the fleet's average remaining units. The buying lead pins the reorder line at 17 units — 'the thin band is everything at or under 17, and I want the ceiling printed to prove the band catches its top' — with deep cover at 100-plus. Probed facts: 16 SKUs in the catalog; the thin band holds 3 SKUs — Noise-Canceling Headset at 14 remaining, Studio Desktop Mic at 15, Smart Watch S at 17 — deep cover holds 8, and the fleet averages 146.7 remaining. One scan, every branch, a total that must reconcile to 16.",
      ask: "Return one row: SKU count, thin-band count at or under the reorder line, the thin band's ceiling, deep-cover count at 100-plus, and average remaining to 1 decimal.",
      template:
        "SELECT COUNT(*) AS skus,\n       SUM(thin) AS thin_cover,\n       MAX(remaining) FILTER (WHERE thin = 1) AS thin_ceiling,\n       COUNT(*) FILTER (WHERE remaining >= {2}) AS deep_stock,\n       ROUND({3}(remaining), {4}) AS avg_remaining\nFROM (\n  SELECT p.id,\n         p.stock - COALESCE(SUM(oi.quantity), 0) AS remaining,\n         CASE WHEN p.stock - COALESCE(SUM(oi.quantity), 0) <= {1} THEN 1 ELSE 0 END AS thin\n  FROM products p\n  LEFT JOIN order_items oi ON oi.product_id = p.id\n  GROUP BY p.id\n);",
      slots: [
        {
          answer: "17",
          kind: "number",
          label: "the reorder line",
          why: "The thin band is remaining <= 17, and 17 is also the band's observed ceiling — it reappears in the thin_ceiling column as proof the band catches its top. 16 would drop Smart Watch S and print a ceiling of 15; 39 reads the next SKU (the 4K Webcam Pro at 39 remaining) into the band; 14 shrinks the band to its floor. The threshold and its proof are the same number — that is the audit.",
        },
        {
          answer: "100",
          kind: "number",
          label: "the deep-cover line",
          noVerify: true,
          why: "Deep cover means 100-plus units remaining — 8 SKUs, the cash-free part of the curve. The line is a business definition, not a result cell: 92 would read the Wireless Mouse M3 into the deep band, 121 would push the Ring Light out; either redraws the curve without the business deciding it.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the cover fold",
          why: "AVG(remaining) prints the fleet's 146.7 — the average cover the buying team plans against. SUM would print 2347, a fleet total wearing a rate's name; MAX prints 462 (the HDMI cable) and reads like the fleet is deep everywhere; MIN prints 14 and reads like panic.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the display digits",
          noVerify: true,
          why: "Cover ships to 1 decimal — 146.7 — matching every rate on the buying deck. Digits at 0 round to 147 and the next reader can't tie the deck to the board; digits at 2 print 146.69 and imply precision the stock column doesn't carry. One rounding decision, at the edge, everywhere.",
        },
      ],
      distractors: ["16", "39", "14", "92", "121", "SUM"],
      walkthrough:
        "A one-pass census where the staging IS the grain. The derived table folds scanned lines to SKU grain — stock minus summed quantity, one row per SKU across all 16, with the thin flag staged beside the cover number — and the outer pass counts branches with FILTER on the same scan: thin band at or under 17 (3 SKUs: 14, 15, 17), the band's ceiling printed beside it (17 — the threshold proving itself in the result), deep cover at 100-plus (8 SKUs), and the fleet average 146.7 rounded once. The branches reconcile: 3 thin + 8 deep + the middle band's 5 = 16. The distractors encode the census killers: a reorder line of 16, 39 or 14 redraws the thin band and its ceiling — the ceiling column is the tripwire that catches a threshold nobody re-ratified; 92 or 121 on the deep line quietly moves cash-free stock in or out of the band; SUM in the fold slot prints the fleet total 2347 as if it were a per-SKU read. Fold to SKU grain first, branch in one pass, print the ceiling — a size curve you can defend to the buying team.",
    },
  ],

  problems: [
    { slug: "combine-two-tables", why: "The member-profile LEFT JOIN: baskets attached to member records where some profile fields run NULL — the warm-up shape behind every marketplace member board. Curated fill." },
    { slug: "customers-who-never-order", why: "The lapsed-member anti-join shape behind winback lists — on this proxy every member HAS ordered, so the honest read says the pipe is empty, and saying that IS the interview answer. Curated fill." },
    { slug: "recyclable-and-low-fat-products", why: "The two-flag catalog filter — size-in-stock and drop-eligible style flags on the SKU table, the warm-up before any assortment census. Curated fill." },
    { slug: "article-views-i", why: "DISTINCT dedupe on a view stream — the look-page dedupe that keeps outfit impressions from double-counting in the drop dashboard. Curated fill." },
    { slug: "percentage-of-users-attended-a-contest", why: "Reach census with a percentage fold — the share of members who touched a drop page, the 100.0-before-division habit in miniature. Curated fill." },
    { slug: "department-top-three-salaries", why: "DENSE_RANK top-3 per partition — the brand top-3 SKU board, where the tie rule decides whether two SKUs share the third slot. Curated fill." },
    { slug: "find-the-team-size", why: "COUNT OVER a partition printed beside every row — basket-load per member attached to each basket, the window shape behind load-aware drop targeting. Curated fill." },
    { slug: "project-employees-iii", why: "Join plus window share — each partner brand's demand beside the partition total, the share-of-book fold the category review opens with. Curated fill." },
    { slug: "last-person-to-fit-in-the-elevator", why: "Running-sum gate over an ordered stream — the drop-payload cap read: how many baskets the fulfillment wave admits before the window closes. Curated fill." },
    { slug: "active-users", why: "Consecutive-activity streaks — members who shopped in consecutive months, the cadence streak behind autoship-style loyalty flags. Curated fill." },
    { slug: "game-play-analysis-iv", why: "First-event retention via subquery join-back — the share of members returning the day after their first drop, the D1 shape in fashion-marketplace clothing. Curated fill." },
    { slug: "game-play-analysis-v", why: "CTE plus window retention ladder — first-session cohorts folded into day-by-day retention, the drop-cohort read the CRM team runs after each event. Curated fill." },
    { slug: "investments-in-2016", why: "Window-plus-subquery concentration — pinned to a single year, the exact shape of '2024 demand held by repeat buyers' reads. Curated fill." },
    { slug: "sales-person", why: "Anti-join through a bridge table — partner brands with no 2025 drop, the emptiness check that keeps the brand board honest about who went dark. Curated fill." },
    { slug: "weather-type-in-each-country", why: "CASE labels attached through a join — market-cluster tier names folded onto basket rows, the labeling pass before any regional board ships. Curated fill." },
    { slug: "triangle-judgement", why: "CASE warm-up on a rule — size-fit eligibility flags computed per row, the branching habit every fulfillment CASE census is built from. Curated fill." },
    { slug: "product-price-at-a-given-date", why: "As-of drop pricing — the latest price change on or before drop day, with the never-repriced fallback; the scalar-subquery shape the pricing review runs before every drop locks. Curated fill." },
    { slug: "seasonal-sales-analysis", why: "Seasonal decomposition of demand — the drop calendar's seasonal-norm read that feeds the July-abnormality question and the z-score band. Curated fill." },
    { slug: "year-on-year-growth-rate", why: "YoY demand move — 2025's opening months against 2024's, the growth-board slide the drop cadence is defended with. Curated fill." },
    { slug: "customers-with-strictly-increasing-purchases", why: "Member basket-value momentum — households whose baskets keep growing, the CRM signal behind size-fit re-order nudges. Curated fill." },
    { slug: "sellers-with-no-sales", why: "Dark-partner anti-join — brands with zero scanned demand in the window, the emptiness check that keeps the partner board honest about who went dark. Curated fill." },
    { slug: "customers-who-bought-all-products", why: "Full-assortment members — households that scanned every category, the breadth read behind cross-category drop targeting. Curated fill." },
    { slug: "suspicious-bank-account-transactions", why: "Settlement fraud sweep — velocity and pattern flags over the payment rails, the returns-fraud hunt's drill shape on the settlement tables. Curated fill." },
    { slug: "duplicate-charge-pairs", why: "Double-settlement detection — two rails that mirror each other on one invoice, the cousin of the five known split-settlement rows. Curated fill." },
    { slug: "group-sold-products-by-the-date", why: "Drop-day SKU manifest — GROUP_CONCAT folding a month's scans into one readable trail for the retro deck. Curated fill." },
    { slug: "second-highest-salary", why: "Runner-up price point — the second-priciest SKU without a fragile LIMIT chain, the 'who's really number two' catalog drill. Curated fill." },
    { slug: "human-traffic-of-stadium", why: "Consecutive-wave gate — rows that clear a floor three-in-a-row, the drop-wave capacity shape logistics reuses weekly. Curated fill." },
    { slug: "calculate-orders-within-each-interval", why: "Latency-band census — baskets binned into dispatch windows, the binned-census shape behind the fulfillment board's slide. Curated fill." },
    { slug: "find-customers-with-positive-revenue-this-year", why: "Positive-revenue members pinned to 2024 — the year-scoped concentration fold the CRM tiers rebuild every January. Curated fill." },
    { slug: "total-sales-amount-by-year", why: "Yearly demand rollup — the two-calendar fold (2024 vs 2025) that anchors the growth board's base year. Curated fill." },
    { slug: "customers-with-maximum-number-of-transactions-on-consecutive-days", why: "Drop-week streaks — members scanning on consecutive days, the cadence streak behind event-retargeting lists. Curated fill." },
    { slug: "fix-product-name-format", why: "Catalog text hygiene — trim, case-fix, date-slice; the pass that keeps SKU labels joinable before any brand board ships. Curated fill." },
  ],
};
