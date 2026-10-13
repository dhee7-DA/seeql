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
  ],

  dayInLife: [
    "**08:15 —** The day opens on the drop board, and the first query is the reconciliation: does the status census tie to `COUNT(*)` — **52 delivered, 30 shipped, 14 pending, 7 cancelled** — and does the dispatch clock still read **2.98 days over the 82 fulfilled baskets**? The analyst's eye goes to the cluster split before anything else, because {sky:EU} at 2.94 over 36 is the home market and APAC at 2.93 is the one to beat. The pending pile is the morning's fire: **14 baskets** with no dispatch scan, and the analyst who writes the aging query owns the standup. *Fulfilled only — that population note rides in every latency subtitle, or the 21 unfulfilled rows quietly poison the average.*",
    "**12:30 —** Midday is the deep-work block. The drop-calendar ask lands from planning: rank 2024's months by basket count for next quarter's cadence — and the ladder ties five ways ({emerald:9, 9} at the top, then four months at 8, four at 7, two at 6), so DENSE_RANK with a calendar tiebreak is the only honest shape. The size-fit read is next: cancels per placed basket by cluster — EU 6.7%, APAC 8.1% — with the denominator decided BEFORE the ratio. The analyst narrates the trap out loud: a CASE arm on latency without the `shipped_at IS NOT NULL` filter sweeps all 21 unfulfilled baskets into the ELSE bucket, and *'late' and 'not yet' are different sentences in a fulfillment review.*",
    "**16:00 —** The afternoon tilts to the partner-brand review. The category lead wants the board: **Nordic Gadgets AB** at 11130.25 (a 32% share of platform demand), Midwest Hardware Co at 9294.93, and the floor fight — Pacific Textiles at 2980.15, 19.85 under the demand line, while Alpine Audio GmbH clears the revenue floor but carries only 2 live SKUs. Settlement hygiene closes the day: invoices and payments store INTEGER cents, so the dollar fold is `amount_cents / 100.0`, and the split-settlement hunt (five invoices paying in two rails) is the check before anything ships. *Every number leaves with its query attached — in a marketplace that audits its own brand boards, a figure without SQL is a rumor.*",
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
  ],
};
