// Newegg — Wave-10 (Task 100), ecom domain, 0 tagged pool rows — theme-curated; facts from scripts/company-facts.md.
// PC-hardware e-tail SQL: the storefront db read as a component-commerce sandbox —
// customers are builders/buyers (region = market buckets), orders are checkouts
// (delivered = delivered clean 52, shipped = in-transit with shipped_at as the
// dispatch stamp 30, pending = awaiting payment/stock 14, cancelled = cancelled 7),
// order_items are cart line records (quantity = units, unit_price = line price),
// products are hardware SKUs (the db's Audio/Video/Electronics/... category codes
// read as component families on a spec shelf), suppliers are distributor/brand
// partners, invoices are wholesale/settlement statements, payments are the payment
// rails, expenses are warehouse opex, ledger_entries are the GL. Finance tables
// store INTEGER cents — the dollar read is amount_cents / 100.0; orders.total and
// order_items.unit_price are REAL dollars. Angle: spec-driven search, the
// price-band ladder per component family (the 55-line spec split), open-box/shelf
// laddering — the db carries NO condition-grade column, so the graded-ladder story
// reads through price tiers and says so — and the RMA/return flow on the settlement
// book. Pool provenance: company-pools.md carries NO Newegg section (0 tagged
// rows), so all 10 topic slug sets and all 16 problems are theme-curated from the
// pools file's theme menu (sql rows only, no w*/d*/f* rows) and say so. Case
// briefs quote probed figures from scripts/company-facts.md (incl. the wave-8+9
// canonical cells, probe-verified 2026-10 against a readonly copy); every case
// slot is mechanically verified against db/custom.db by scripts/case-audit.ts.
// Accent text-purple-300 is unused by all 22 landed ecom kits (amazon..mercari)
// and by every wave-10 kit; the RGB-purple of the builder bench this kit serves.

import type { CompanyKit } from "../types";

export const neweggKit: CompanyKit = {
  id: "newegg",
  domainId: "ecom",
  name: "Newegg",
  tagline: "PC-builder commerce: spec ladders, combo deals, the RMA desk",
  accent: "text-purple-300",

  brief: [
    "**Newegg** is the PC-builder's e-tail — the marketplace where a build starts as a parts list and a checkout is a build sheet: the board, the chip, the card, and the cable-and-peripheral tail bought in the same cart. Spec drives everything: the catalog is searched by filter first — socket, capacity, wattage — and price ladders inside a component family do the merchandising. This kit maps the storefront db onto that world: 16 customers rows are builders (region = market bucket), 103 orders are checkouts worth **34,833.28**, and 251 order_items rows are cart lines — quantity = units, unit_price = line price. The status map is fixed: delivered = {emerald:delivered clean} (52, 50.5%), shipped = {sky:in transit} (30, 29.1%, shipped_at as the dispatch stamp), pending = awaiting payment or stock (14), cancelled = {rose:cancelled} (7, 6.8%).",
    "The data org splits into catalog/merchandising, a fulfillment-and-RMA pod, and finance ops, all reading the same spine at different grains. The dispatch clock is the ops heartbeat: **82 of 103 checkouts** carry a shipped_at stamp, averaging **2.98 days** from click to warehouse dispatch with a 2–4 day spread; the 14 pending rows have no stamp yet — a population definition, not a cleanup job. Money sits one layer down: 28 invoices are {amber:wholesale settlement statements} and 27 payments are the rails — card 16 legs worth 37,364, wire 11 worth 32,248 — all in INTEGER cents where the dollar read is `amount_cents / 100.0`. One honesty note baked into every query here: the db carries *no condition-grade column*, so the open-box ladder reads through price tiers, never through a status.",
    "Interview screens are census-then-denominator, spec-flavored. A loop opens with a **two-grain market census** — EU runs 45 checkouts from 8 builders (335.32 AOV) while the US runs 19 from 2 (383.48) — then escalates into the {sky:spec-band ladder}: 268 cart-line units sit below the 55 price line at **31.01** average against 230 units above it at **115.85**, and the premium tip is honestly empty (the shelf tops out at 199.99). Then the cart-shape read — 251 lines over 103 checkouts, **2.44** lines per build, never more than 3 of one line — and the RMA desk's register, where a paid-status statement with zero settlement legs (#28, 1,756.00) waits as the reconciliation trap. Candidates who state the population and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: company-pools.md carries no Newegg section — zero tagged rows — so all ten topic slug sets and all thirty-two problems here are **theme-curated** from the pools file's SQL rows to this kit's known screen shapes: spec-band ladders, combo-basket reads, tie-heavy best-seller boards, honest-denominator funnel counts and the cents-safe settlement book. Do the topics in order, then run all six case studies on the live storefront db — built for spaced practice rather than one sitting: the {rose:open-RMA register} the returns desk works at every close, the {violet:component spec ladder} merchandising publishes with the catalog, the tie-heavy best-seller board, the 55-line build sheet, the family fold, and the settlement clock by rail. The bar to clear: *state the population and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the checkout census. A fulfillment analyst opens the ops dashboard before standup: did overnight carts land, did the awaiting-stock queue drain, and does the one-pass status census reconcile — 52 delivered + 30 in transit + 14 pending + 7 cancelled = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. Then the clock read: dispatch latency versus the **2.98-day** norm — if the warehouse is drifting toward the 4-day tail, the dispatch promise is the next slide, and the 14 pending checkouts with no shipped_at stamp are *watched, not patched*.",
    "**11:30 —** Midday is the catalog deep-dive. Merchandising wants the spec-band ladder re-cut — 268 units at 31.01 below the 55 line versus 230 at 115.85 above — before the open-box refresh reprices the shelf; the combo pod wants basket shape (251 lines, **2.44** per build) re-cut by family, because a build that spans three families is a combo candidate and a one-line cart is a cable sale; finance wants the settlement coverage split (**21 exact, 1 partial, 6 never-settled worth 15,217**) before a single distributor reminder goes out. Each ask is a join, a conditional aggregate and one denominator decision. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the pricing-review argument*.",
    "**15:30 —** The afternoon tilts to the RMA desk and the close. The settlement anti-join refreshes first — **6 statements with no settlement legs worth 15,217** — before the returns pod books a single credit; the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero legs (#28, 1,756.00), the two mirror-image lies that make payment legs the ledger of record. The rails get their own eye — card 16 legs at 37,364 versus wire 11 at 32,248, with 5 statements splitting across both. The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Delivered rate", what: "Delivered ÷ ALL checkouts placed: 52 of 103 (50.5%). The keep-rate of PC building — and a conditional count where the denominator question (pending carts, cancels included?) is the entire test." },
    { name: "Dispatch latency", what: "Checkout to warehouse dispatch (created_at → shipped_at) over stamped checkouts only: 82 of 103, 2.98-day average, range 2–4. The population ships with the number — pending carts have no cycle and must not dilute it." },
    { name: "Cart depth", what: "Cart lines ÷ checkouts: 251 lines over 103 builds (2.44), max 3 units of any one line, 498 units total. The combo-deal read — a build is a board plus the tail, and this ratio is where that shows up first." },
    { name: "Order book (GMV)", what: "Total checkout value: 34,833.28 across 103 checkouts, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the build story — one 1,088.44 cart outweighs the smallest 42 combined." },
    { name: "Spec-band mix", what: "The 55-line ladder: 268 units below it at 31.01 average line price versus 230 above at 115.85 (133 vs 118 lines). The budget-spec versus performance-spec shelf — and the premium tip is honestly empty (ceiling 199.99)." },
    { name: "Family concentration", what: "Audio leads revenue at 11,744.01 — over a third of the book — while Accessories leads units at 121 against just 3,294.29. Units leaders ≠ revenue leaders: the cable tail moves volume, the spec tier moves money." },
    { name: "Builder concentration", what: "Share of the book from builders spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs the builder-relations pod and sizes the combo program." },
    { name: "Settlement coverage", what: "Wholesale statements versus legs: 21 exact (65,612), 1 partial (4,000 of 6,148), 6 never-settled worth 15,217 — read on rails that split card (16 legs, 37,364) versus wire (11, 32,248). The AR anti-join the RMA desk refreshes every close." },
  ],

  topics: [
    {
      name: "Checkout funnel counts",
      why: "Every Newegg screen opens with the funnel: checkouts placed, dispatched (shipped_at stamped), delivered. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-transit checkout 'delivered' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "the-most-recent-three-orders", "roas-by-campaign"],
    },
    {
      name: "Two-grain market censuses",
      why: "Checkouts and builders are different grains of the same join, and every census here reports both: EU runs 45 checkouts from 8 builders while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "customers-with-strictly-increasing-purchases"],
    },
    {
      name: "Joining SKUs to carts",
      why: "Cart lines inherit family and price through the products join, and the join type decides who survives. A cart line with no SKU row is corruption; a SKU with no cart line would be dead shelf — on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["product-sales-analysis-i", "product-sales-analysis-ii", "combine-two-tables", "fifo-inventory-cogs", "scd2-build"],
    },
    {
      name: "Spec-band laddering with CASE",
      why: "The shelf is banded, not listed: budget-spec below the 55 line (268 units at 31.01) versus performance-spec above it (230 at 115.85), with the premium arm honestly empty at the 199.99 ceiling. CASE arms must be exhaustive and ordered — a hole in the CASE is a hole in the ladder, and a reordered WHEN quietly re-bands the base.",
      slugs: ["calculate-orders-within-each-interval", "the-category-of-each-member-in-the-store", "customer-purchasing-behavior-analysis", "product-price-at-a-given-date", "calculate-product-final-price", "usage-tier-percentiles", "spend-histogram"],
    },
    {
      name: "Combo-basket reads",
      why: "A build cart is a combo candidate, and the combo pod reads baskets at line grain: 251 lines over 103 builds, never more than 3 of one line, families stacked inside one checkout. Conditional aggregation over line pairs — who bought the board AND the card but not the cooler — is exactly the combo-eligibility query.",
      slugs: ["basket-depth-aov", "customers-who-bought-a-and-b-not-c", "group-sold-products-by-the-date"],
    },
    {
      name: "Best-seller leaderboards",
      why: "The units ladder is tie-heavy by construction: two SKUs at 36 units, then three-way ties at 30 and at 21. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow — a merchandising policy about peer SKUs, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "second-highest-salary", "premier-league-table-ranking"],
    },
    {
      name: "Distributor bench economics",
      why: "Six distributor/brand partners carry the shelf, and concentration is the whole story: Nordic Gadgets AB at 32% of revenue, Midwest Hardware Co at 26.7%, the 4.5-rated trusted bench just two partners deep. Fold revenue through products to partners and the rating floor becomes a HAVING decision.",
      slugs: ["average-selling-price", "sales-person", "top-travellers", "portfolio-concentration-hhi"],
    },
    {
      name: "Month spine walks",
      why: "The 14-month checkout spine (2024-01 to 2025-02) is the trading call's home turf: the book opens at 3,731.97, troughs at 1,193.86 in July, then jumps +1,158.21 into August while the steepest drop, -1,326.87, lands in November. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["biggest-window-between-events", "last-person-to-fit-in-the-elevator", "friday-purchase-iii", "seasonal-sales-analysis", "year-on-year-growth-rate"],
    },
    {
      name: "Coverage set algebra",
      why: "Close packets stack populations — settled statements beside claimed, this quarter beside last — and EXCEPT answers 'which claimed statements never settled'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["movie-rating", "monthly-transactions-ii", "the-airport-with-the-most-flights"],
    },
    {
      name: "Cents-safe settlement reads",
      why: "Claimed is not settled — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the builder world meets money. Every dollar read is amount_cents / 100.0, the 28.4-day settlement clock (13 fastest, 84 slowest) is one date diff away, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE from the register.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "ar-aging-schedule", "balance-rollforward", "trial-balance-check"],
    },
  ],

  theory: [
    {
      id: "newegg-t1",
      q: "Your build-sheet report joins order_items to products. When do you INNER and when do you LEFT — and what silently breaks if you filter a product column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins cart lines to SKUs: a line with no product row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A shelf report must be LEFT from products: the SKUs with no cart lines ARE the answer, arriving with NULL line columns. The classic break: filtering unit_price >= 55 in WHERE after the LEFT JOIN kills every NULL-payload SKU row — the LEFT quietly became an INNER and the dead shelf vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-ordered SKUs — all 16 appear in some cart — and proving that zero is itself the analyst's job. Newegg's version of the question is always the same: does your query answer 'what sold' or 'what sits on the shelf'? They are different joins, and the spec search needs both.",
      tag: "joins",
    },
    {
      id: "newegg-t2",
      q: "The best-seller board ranks SKUs by units sold, and the units ladder is tie-heavy: two SKUs at 36, then three at 30 and three at 21. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder runs 47, 46, 38, then the two-way tie at 36 consuming ranks 4 and 5, so the next distinct count (33) lands on rank 6, implying a phantom rung that does not exist. DENSE_RANK shares rungs without gaps — 4, 4, then 5. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which SKU keeps the best-seller badge and its merchandising slot. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer SKUs (RANK or DENSE_RANK), or an explicitly named tie-breaker like revenue, then id — and writing it in the query comment. On a spec shelf, a tie at 30 units between a mic, a ring light and a fitness band is a real decision about which one the combo engine promotes next.",
      tag: "windows",
    },
    {
      id: "newegg-t3",
      q: "The census shows 103 checkouts and 16 builders; EU shows 45 checkouts from 8 builders. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts checkout rows after the join — one row per checkout, so the builder with 24 checkouts contributes 24. COUNT(DISTINCT customer_id) folds those rows back to builders — EU's 45 checkouts collapse to 8 logos. Neither is wrong: checkouts measure load and build momentum, builders measure installed base and coverage. The ratio — 5.6 checkouts per builder in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items and COUNT(*) silently counts cart lines, not checkouts — 251 of them, 2.44 per build. Saying 'one row per what?' for every COUNT is the habit the panel grades; on a spec-driven catalog it is also the difference between merchandising coverage and builder reach.",
      tag: "aggregation",
    },
    {
      id: "newegg-t4",
      q: "shipped_at is NULL until the warehouse dispatches. What is your policy for the dispatch-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only dispatched checkouts have a latency, so the report measures click-to-dispatch for the 82 of 103 checkouts that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL checkouts returns the dispatched-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the dispatched subset; the gap between it and COUNT(*) is exactly the 14 pending plus 7 cancelled rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day dispatches for carts that have not shipped, and on a hardware shelf awaiting stock is not a zero-day cycle. A report whose WHERE clause is doing definitional work without saying so is exactly what a Newegg reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "newegg-t5",
      q: "The merchandising review wants performance-spec revenue for families carrying at least three SKUs. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The spec band is a row-level fact — unit_price >= 55 discards budget-spec lines before any fold, in WHERE; putting it in HAVING is impossible because prices no longer exist once rows are grouped. The three-SKU floor is a group-level fact — HAVING COUNT(DISTINCT product_id) >= 3 after GROUP BY; putting it in WHERE errors because the count does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a ladder line and an error, and between a threshold applied to units versus to dollars. On this shelf the floor matters: Fitness carries exactly one SKU and Electronics and Audio carry three — the floor decides whether the ladder shows the cable tail at all. The strong answer places every filter by asking: is this a fact about one line, or about a family?",
      tag: "pipeline",
    },
    {
      id: "newegg-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 checkouts always produce a mean (338.19 on this book). On filtered staging tables — one region, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each checkout to ITS builder's average) re-runs per outer row and answers a different question at a different cost: which of Alice Chen's 24 checkouts beat her own 7,262.35-skewed baseline is a combo-upsell read, not a platform read. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "newegg-t7",
      q: "The trading trend buckets checkouts by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-10-01' AND created_at < '2025-01-01' — because BETWEEN '2024-12-01' AND '2024-12-31' silently drops the last night's carts, and quarter-end is exactly when builders pull the trigger on parts. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The spine's story on this db: 3,731.97 opening, the 1,193.86 July trough, +1,158.21 into August, -1,326.87 into November. Date discipline is trading discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "newegg-t8",
      q: "Finance says a wholesale statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment legs are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. Check the rails too: card 16 legs at 37,364, wire 11 at 32,248, five statements splitting across both — summing one rail alone understates them. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. The close's identity: coverage 21 exact / 1 partial (4,000 of 6,148) / 6 none, and the ledger trial balance at 181,080 debits against 181,080 credits — delta zero, or the RMA desk does not ship credits.",
      tag: "quality",
    },
    {
      id: "newegg-t9",
      q: "The checkout-by-checkout GMV walk shows the running total jumping two carts at once. Walk me through the frame that causes it and the frame that fixes it.",
      a: "With ORDER BY created_at, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE treats ORDER BY peers as a block, so two checkouts sharing the same timestamp enter the cumulative together. The fix is stating the frame: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks strictly row by row, with the secondary key in the ORDER BY breaking the ties. On a month spine ties are rare and RANGE is harmless; at checkout grain — when a spec launch fires and carts land in bursts in the same second — ROWS is the honest frame. The interview point is naming the accumulation axis: rows (event grain) or values (calendar grain); they disagree exactly when the data ties, and on this book they do.",
      tag: "windows",
    },
    {
      id: "newegg-t10",
      q: "The close packet stacks the card-settled statement list over the wire-settled list. When is UNION the right stacker and when is it a silent bug?",
      a: "UNION ALL is the honest default: it concatenates branches with no dedupe pass, which is what you want when the branches are logically disjoint or legitimately share rows. UNION adds a distinct pass over the combined set, and that pass deletes rows silently — on this book five statements settle on BOTH card and wire legs, so a packet that omits the rail label emits byte-identical rows from both branches and UNION collapses them: 28 statements print as 27 with no error anywhere. The discipline: label the branches (a rail or population column) so no cross-branch row can be identical, default to UNION ALL, and reach for UNION only when you can say out loud which duplicates you are paying to collapse. The packet's row count is the only witness — which is why the close counts its own output.",
      tag: "set-ops",
    },
    {
      id: "newegg-t11",
      q: "How would you answer 'which checkout months exist in Q4 2024 but not Q1 2025' — and what does EXCEPT silently do to duplicates?",
      a: "Set algebra: SELECT DISTINCT month from the Q4 side EXCEPT SELECT DISTINCT month from the Q1 side — three buckets against three, no overlap, and the diff reads straight off the page with no join gymnastics. The discipline points: EXCEPT deduplicates both inputs first, so it answers the DISTINCT-value question whether you meant it or not — if duplicated rows are the anomaly (a double-ingested checkout feed), the row-honest tool is a LEFT JOIN … IS NULL anti-join on the full multiset; and both sides must share column count and compatible types, which means the same STRFTIME('%Y-%m', …) key on both sides. INTERSECT answers the mirror — months both quarters traded, none here. Set operators for set-level diffs across periods, anti-joins for row-level forensics; naming which question you are answering is the skill the panel grades.",
      tag: "set-ops",
    },
    {
      id: "newegg-t12",
      q: "Which cart lines beat their OWN component family's average line price — and how do derived tables, correlated subqueries and window functions each answer it?",
      a: "Derived-table shape: fold the per-family average in a CTE (Audio lines average 109.66, Accessories 27.49), join back on category, compare — the means compute once and the query reads like the merchandising question. Correlated shape: WHERE unit_price > (SELECT AVG(unit_price) FROM order_items oi2 JOIN products p2 … WHERE p2.category = outer category) — correct, but it re-runs the same seven family means once per line. Window shape: unit_price - AVG(unit_price) OVER (PARTITION BY category) puts the gap beside every line in one scan — the partition key IS the spec-family definition. On this 251-line book all three run instantly; the interview value is stating the trade — derived for auditability, correlated for readability on small data, windows for one-pass scans — and naming the empty-inner behavior of the scalar form on filtered staging tables.",
      tag: "subqueries",
    },
    {
      id: "newegg-t13",
      q: "The ops board needs delivered clean, in transit, awaiting payment/stock and cancelled in one scan. Why is a conditional aggregate the right shape, and what does the FILTER spelling buy?",
      a: "One scan, four lenses, one denominator. COUNT(*) FILTER (WHERE status = 'delivered') — or the portable SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) — prints 52, 30, 14, 7 from the same 103-row pass, and because the branches partition the same rows they reconcile to 103 by construction: a branch that drifts is visible immediately, and on fulfillment dashboards a branch that stops footing IS the incident. Four sequential queries share no denominator and drift independently — the overnight-dashboard failure mode. FILTER keeps the condition attached to the aggregate that owns it and reads like the metric definition; SUM(CASE) runs on any engine. Both matter here because the census is the daily identity the dispatch clock and the RMA register both hang off.",
      tag: "case-when",
    },
    {
      id: "newegg-t14",
      q: "The RMA register needs wholesale statements with no settlement legs. Why does the team standard say NOT EXISTS, and when does NOT IN bite?",
      a: "NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id) is an existence probe: it short-circuits on the first matching leg and never trips on NULLs, so it finds the 6 never-settled statements worth 15,217 regardless of anything else in the rails table. NOT IN (SELECT invoice_id FROM payments) materializes the list and compares every statement against it — and one NULL invoice_id makes x NOT IN (…, NULL) UNKNOWN for every row, so the register silently empties while looking valid, and the close would ship with 15,217 unaccounted. On the clean core db every leg carries its FK, so both shapes return 6 today; the standard exists because the RMA desk builds its register on staging feeds, and staging feeds are where NULLs sneak in. The narration the interviewer wants: NOT EXISTS by default, NOT IN only over columns you have NULL-guarded out loud.",
      tag: "nulls",
    },
    {
      id: "newegg-t15",
      q: "Two clocks run this e-tail: click-to-dispatch (2.98 days) and statement-to-settlement. How do you compute both honestly on TEXT timestamps?",
      a: "julianday first: julianday(shipped_at) - julianday(created_at) returns fractional days per checkout — 82 stamped checkouts averaging 2.98 days, range 2 to 4 — and julianday(paid_on) - julianday(issued_on) gives the settlement clock: 27 legs averaging 29.04 days, fastest 13, slowest 84. Then population policy: AVG ignores NULLs, so the dispatch clock must name WHERE shipped_at IS NOT NULL — the 14 pending checkouts have no cycle — and the settlement population is defined by the join itself, with the five split statements counted per leg or per-statement MIN, never twice. Finally boundaries: half-open ranges — issued_on >= '2024-01-01' AND issued_on < '2024-02-01' — because BETWEEN on TEXT timestamps drops the last night's legs, and month-end is exactly when wholesale batches settle.",
      tag: "dates",
    },
    {
      id: "newegg-t16",
      q: "A distributor feed reships 'Mechanical Keyboard K1' as 'mechanical keyboard k1'. What breaks, and what is the hygiene pass before any join?",
      a: "Every equality join and GROUP BY splits one SKU into two: the family census counts an extra SKU, the per-SKU units fold halves, and the best-seller ladder carries both spellings as separate rungs. The hygiene pass runs before the join, in a CTE named for what it does: TRIM whitespace, normalize case with UPPER or LOWER into a key column, and — the step teams skip — join and group on the id, not the name, because ids are the contract and names are display. The honest extra: report the drift. COUNT(DISTINCT name) beside COUNT(DISTINCT id) on the products table is a one-line canonicalization audit; when they disagree, the feed's casing is the bug. On a spec-driven catalog where filter facets match on names and model strings, string hygiene is catalog integrity, not cosmetics.",
      tag: "casing",
    },
    {
      id: "newegg-t17",
      q: "Merchandising wants builders tiered into four spend bands. How do NTILE and PERCENT_RANK do it, and what breaks on ties?",
      a: "NTILE(4) OVER (ORDER BY lifetime_spend DESC) deals the 16 builders into four bands as evenly as the count allows — here exactly 4/4/4/4 because 16 divides cleanly; with 15 builders the first tiles absorb the remainder and the deck must say so. PERCENT_RANK returns each row's relative position 0 to 1 — the same tiering as a continuous score rather than fixed buckets, useful when the tier edges should follow the data. The tie problem: builders with identical lifetime books must not land in different tiers by storage luck, so the ORDER BY carries a deterministic second key (lifetime_spend DESC, customer_id) and the tie-break policy is stated in the query comment. The rule: NTILE when the business names the band count ('top quartile of builders'), PERCENT_RANK for share-of-field reads, deterministic tie-breaker always, band edges published beside the metric.",
      tag: "windows",
    },
    {
      id: "newegg-t18",
      q: "'Show each builder's favorite component by units bought.' Give me the three query shapes and how each behaves when two SKUs tie.",
      a: "Window argmax: ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY units DESC, product_id) = 1 in a CTE — one deterministic row per builder even on ties, because the second key decides. Join-back on the maximum: fold MAX(units) per builder, join back on builder AND units = max — honest, but a tie returns BOTH SKUs, which is a feature when the combo feed should show co-favorites and a bug when it double-counts builders. Correlated filter: WHERE units = (SELECT MAX(…) for that builder) — same tie behavior as the join-back at per-row re-evaluation cost. On this book the units ladder is tie-heavy by construction — two SKUs at 36, three at 30 — so the shapes genuinely diverge, and the complete answer names the divergence: ROW_NUMBER decides, join-back reports, correlated simplifies. 'Which behavior do you want on ties' is the interviewer's real question.",
      tag: "windows",
    },
    {
      id: "newegg-t19",
      q: "The merchandising dashboard filters cart lines with SUBSTR(created_at, 1, 7) = '2024-11'. Why is that the slow shape, and what is the sargable twin?",
      a: "Wrapping the column in a function — SUBSTR(created_at, 1, 7) = '2024-11' — forces the engine to evaluate the expression on every row, so any index on created_at is unusable and the query scans the whole table. The sargable twin compares the bare column to a range: created_at >= '2024-11-01' AND created_at < '2024-12-01' — same rows, half-open so the last night of November survives, index-usable. The GROUP BY key can stay SUBSTR-based — that fold runs after the filter, on surviving rows; it is the WHERE predicate that must stay bare. The habits that compound: filter early inside each CTE, name columns instead of SELECT *, probe with LIMIT before committing to the full run — because the merchandising board re-renders on every filter click, and a scan-per-click is the difference between a dashboard and a timeout.",
      tag: "performance",
    },
    {
      id: "newegg-t20",
      q: "The best-seller board is reviewed every week and one week it printed in a different order. What makes an ORDER BY reproducible?",
      a: "A sort key that cannot tie. ORDER BY units DESC leaves the tie block — two SKUs at 36 units, three at 30 — ordered by storage luck, which can flip between runs after a vacuum, an ingest, or a plan change. The reproducible board orders by the business key then a stable tie-breaker: ORDER BY units DESC, revenue DESC, product_id — same ladder every run, so a reviewer can diff week over week. The deeper rule: any board a human screenshots needs a total order, because 'about the same order' is indistinguishable from 'the ranking moved' at review time; and the tie-breaker is a merchandising policy (which SKU keeps the badge when units tie?) that belongs in a comment beside the metric definition. Determinism is not pedantry — it is what makes last week's board comparable to this week's.",
      tag: "pipeline",
    },
    {
      id: "newegg-t21",
      q: "Where does COALESCE belong on the settlement book — and where does it quietly lie?",
      a: "COALESCE belongs at the display edge, on LEFT JOIN payloads a human will read: the six never-settled statements arrive with NULL payment columns, and COALESCE(SUM(p.amount_cents)/100.0, 0.00) prints a clean 0.00 in the register beside their claimed status. It lies when it substitutes for a definition: COALESCE(shipped_at, created_at) inside the dispatch-latency average invents a zero-day dispatch for the 14 pending checkouts — a fake speed-up the fulfillment pod would have to unpick — and COALESCE inside a COUNT changes the census the branch was supposed to protect. The placement rule: filter with IS NULL when absence is the answer (the register's anti-join), aggregate over the NULL-honest base and let AVG skip what it should skip, coalesce only the last-mile column a spreadsheet will read. If you cannot say what the NULL meant, you are not ready to replace it.",
      tag: "nulls",
    },
    {
      id: "newegg-t22",
      q: "The regional AOVs read EU 335.32, APAC 313.66, US 383.48, LATAM 426.22. The deck averaged them to 364.67. What is wrong, and what is right?",
      a: "An average of averages weights every market equally regardless of size. The four AOVs average to 364.67, but the true all-checkouts AOV is SUM(total)/COUNT(*) over the base rows: 338.19 — because EU's 45 checkouts and APAC's 37 dominate the base while LATAM's two, despite the highest AOV, barely register. The honest blends: re-aggregate from the base (sum the numerators, divide by the summed denominators), or weight explicitly — SUM(aov * checkouts)/SUM(checkouts) — the same arithmetic one level up. The interview move is saying WHERE the weighting lives: an average of averages is only correct when every group has equal counts, and on this book the counts run 45/37/19/2 — the claim is false by construction. The deck's 364.67 describes a store that does not exist; the analyst who catches it owns the room.",
      tag: "aggregation",
    },
    {
      id: "newegg-t23",
      q: "Walk me through the four checks that prove a Newegg close before it ships.",
      a: "One: the checkout identity — the one-pass census must read 52 delivered + 30 in-transit + 14 awaiting payment/stock + 7 cancelled = 103 by construction; a branch that stops footing is the incident. Two: the coverage census — 21 exact settlements (65,612.00), 1 partial (4,000.00 of 6,148.00), 6 never-settled worth 15,217.00, with the anomaly pair walked line by line: #11 void-but-settled at 925.00 and #28 paid-status with zero legs at 1,756.00 — the two mirror-image lies that make payment legs the ledger of record. Three: the rails — card 16 legs at 37,364.00 against wire 11 at 32,248.00, with the five split statements counted once each. Four: the ledger trial balance — 181,080.00 debits against 181,080.00 credits, delta zero. The deliverable is not 'it looks fine'; it is each check, its figure, and when it last ran.",
      tag: "quality",
    },
    {
      id: "newegg-t24",
      q: "Fulfillment asks for the dispatch-latency report. What do you pin down before writing the ratio — and why does the population ship with the number?",
      a: "The population, out loud, first. Latency needs both timestamps, so the base is the 82 of 103 checkouts carrying a shipped_at stamp — averaging 2.98 days, range 2 to 4 — and the title says 'stamped checkouts' because the 14 pending rows have no cycle yet and must not dilute the average. Then the mechanics: AVG ignores NULLs, so running it without the filter prints the same 2.98 over a silently shrunken population — a real number wearing the wrong name, the exact bug the population definition exists to catch. Then the boundaries: julianday(shipped_at) - julianday(created_at) for fractional days, half-open window filters so the last night of the month survives, ROUND last for display only. Finally the denominator question the interviewer is fishing for: pending is 'not yet', cancelled is 'never' — and whether cancels sit in a promise-kept rate is a business definition to state, not a WHERE clause to guess.",
      tag: "metrics",
    },
  ],

  mcqs: [
    {
      id: "newegg-mcq-1",
      prompt: "A checkout row's status reads 'shipped'. In this kit's Newegg stage map, what happened?",
      choices: ["In transit — dispatched, not yet delivered", "Delivered clean — the build arrived", "Cancelled — the cart was abandoned", "Awaiting payment or stock — no dispatch yet"],
      answer: 0,
      why: "The stage map is fixed: shipped = in transit (30 of 103 checkouts, 29.1%), with shipped_at as the dispatch stamp. The parts left the warehouse; nothing is confirmed delivered.",
      notes: [
        { choice: 1, why: "Delivered is 'delivered' — 52 checkouts, 50.5%. Calling in-transit carts delivered inflates the keep rate before a single box lands." },
        { choice: 3, why: "Awaiting payment/stock is 'pending' — 14 checkouts with no shipped_at stamp at all. Pending has no dispatch; shipped has one." },
      ],
      difficulty: "easy",
    },
    {
      id: "newegg-mcq-2",
      prompt: "Dispatch latency is created_at → shipped_at over which population? The db holds 82 stamped checkouts, 14 pending and 7 cancelled of 103 placed.",
      choices: ["All checkouts placed (103)", "Stamped checkouts only (82)", "Delivered checkouts only (52)", "Distinct builders (16)"],
      answer: 1,
      why: "Latency needs both timestamps: the 82 stamped checkouts average 2.98 days, range 2–4. Pending carts have no stamp — no cycle — and cancels left the pipeline before dispatch.",
      notes: [
        { choice: 0, why: "AVG over all 103 silently skips the 21 NULL latencies and prints the same 2.98 — a real number wearing the wrong population name. The 82 must be stated." },
        { choice: 2, why: "52/82 mixes two funnel steps — delivered is arrival, the stamp is dispatch. Different steps, different numbers." },
      ],
      difficulty: "easy",
    },
    {
      id: "newegg-mcq-3",
      prompt: "EU carries 45 checkouts from 8 builders. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts checkout rows (45); COUNT(DISTINCT customer_id) folds repeats back to builders (8). The gap between them — 5.6 checkouts per builder — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every checkout has a builder. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not builders — a third grain nobody asked for. The census is checkouts AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "newegg-mcq-4",
      prompt: "ROUND(i.amount_cents / 100.0, 2) prints 1,756.00 for statement #28. What does the bare integer version, ROUND(i.amount_cents / 100, 2), risk?",
      choices: ["Nothing — integer and real division agree here", "Integer truncation toward zero on odd-cent rows, eating cents", "A type error — SQLite refuses integer division", "It rounds twice, adding a cent"],
      answer: 1,
      why: "INTEGER / INTEGER in SQLite truncates: any statement whose cent total is not a whole dollar multiple loses its cents before ROUND ever runs. The 100.0 divider forces real division first — the settlement book's non-negotiable read.",
      notes: [
        { choice: 0, why: "It agrees exactly while every cent total is a whole-dollar multiple — and silently breaks the day one is not. The convention exists because you cannot see the failure coming." },
        { choice: 2, why: "SQLite happily truncates integer division — no error, no warning. Silent cent loss is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "newegg-mcq-5",
      prompt: "The spec ladder CASE reads: WHEN price >= 150 THEN 'halo', WHEN price >= 55 THEN 'performance', ELSE 'budget'. Why does arm order matter here?",
      choices: ["It does not — CASE evaluates all arms and picks the truest", "WHEN arms evaluate top-down, so swapping the >= 150 and >= 55 arms re-bands every halo SKU into performance", "ELSE must come first or it swallows the other arms", "CASE requires BETWEEN to band ranges correctly"],
      answer: 1,
      why: "CASE stops at the first true arm. Ladder order is the logic: 199.99 must meet the halo gate before the performance gate catches it. Reorder the arms and the shelf still renders — every SKU just relabeled, no error anywhere.",
      notes: [
        { choice: 0, why: "CASE is first-true-wins, not best-fit. A reordered ladder is the classic silent re-banding bug on catalog shelves." },
        { choice: 2, why: "ELSE is the catch-all and must be last; putting it first would swallow every row — obvious enough that reviewers catch it, unlike the subtle reorder." },
      ],
      difficulty: "medium",
    },
    {
      id: "newegg-mcq-6",
      prompt: "GROUP_CONCAT(p.name) over a partner's rows prints 'Mechanical Keyboard K1,Smart Watch S,Mechanical Keyboard K1,…' — 43 names for 3 SKUs. Diagnosis?",
      choices: ["The data has 43 SKUs — trust the output", "The chain fans out one row per cart line; the bare fold repeats each SKU per line — GROUP_CONCAT(DISTINCT p.name) folds to the real manifest", "GROUP_CONCAT has a 20-item cap and wrapped around", "The join must be a LEFT JOIN to dedup"],
      answer: 1,
      why: "suppliers → products → order_items fans out one row per line — Nordic's 3 SKUs repeat across 43 lines. The bare fold concatenates every row; DISTINCT inside GROUP_CONCAT is the dedup that turns line noise into a manifest.",
      notes: [
        { choice: 0, why: "43 is the LINE count, not the SKU count — COUNT(DISTINCT p.id) reads 3. Trusting the string means shipping a manifest that lies by repetition." },
        { choice: 2, why: "No cap and no wrap — the fold is faithfully concatenating 43 fanned-out rows. The bug is the grain, not the function." },
      ],
      difficulty: "medium",
    },
    {
      id: "newegg-mcq-7",
      prompt: "Keep only families carrying at least 3 SKUs on the spec shelf. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 3, before GROUP BY", "GROUP BY category HAVING COUNT(*) >= 3", "WHERE skus >= 3 on the raw products table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A SKU-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this shelf the floor keeps Audio and Electronics (3 SKUs each) and cuts Fitness's one-SKU ladder.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'skus' column on products — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "newegg-mcq-8",
      prompt: "A staging-table RMA list uses statement_id NOT IN (SELECT invoice_id FROM payments WHERE method = 'card') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL invoice_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the register empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every leg carries an invoice_id. But staging tables are exactly where NULLs sneak in, and empty registers ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "newegg-mcq-9",
      prompt: "A close packet stacks wire-settled statements under card-settled statements in one layout built with UNION. A reviewer says one statement's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same statement, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Five of this book's statements split across card AND wire legs — a stack that omits the rail label emits byte-identical rows from both branches and UNION collapses them, losing a statement with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On split-rail books the repeated statement is the legitimate row UNION eats." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "newegg-mcq-10",
      prompt: "The units ladder runs 47, 46, 38, then a two-way tie at 36, then 33. Under RANK, what rank does the 33-unit SKU carry?",
      choices: ["6", "5", "4", "7"],
      answer: 0,
      why: "RANK shares rungs and then skips: the tie at 36 consumes ranks 4 and 5, so the next distinct count (33) lands on rank 6. The published board's policy is RANK semantics — gaps included, never renumbered.",
      notes: [
        { choice: 1, why: "5 is the DENSE_RANK answer — shared rungs without gaps. Dense renumbering hides the size of the tie block that just ran." },
        { choice: 2, why: "4 assumes the 36-tie consumed a single rung. The tie block's size sets the skip — two tied SKUs burn two ranks before the next one is dealt." },
      ],
      difficulty: "hard",
    },
    {
      id: "newegg-mcq-11",
      prompt: "order_items holds 251 cart lines carrying 498 units. What does `SELECT COUNT(quantity), SUM(quantity) FROM order_items` return?",
      choices: ["498, 251", "251, 498", "251, 251", "498, 498"],
      answer: 1,
      why: "COUNT(quantity) counts non-NULL line rows — 251; SUM(quantity) adds the units they carry — 498. The two numbers ARE the cart story: 2.44 lines per build and roughly 2 units per line, and confusing them misprices every combo read.",
      notes: [
        { choice: 0, why: "Swapped — COUNT never adds. 498 is the units fold; 251 is the row count. Reading units off COUNT understates demand by half." },
        { choice: 3, why: "SUM cannot count rows: it adds values. 498 in the COUNT column claims 498 cart lines — a grain error the cart-depth read catches instantly." },
      ],
      difficulty: "easy",
    },
    {
      id: "newegg-mcq-12",
      prompt: "The ops board's delivered-clean arm must count the keep rate. Which branch is honest?",
      choices: [
        "COUNT(*) FILTER (WHERE status = 'delivered')",
        "COUNT(*) FILTER (WHERE status = 'shipped')",
        "COUNT(shipped_at)",
        "COUNT(*) FILTER (WHERE shipped_at IS NOT NULL AND status != 'cancelled')",
      ],
      answer: 0,
      why: "The stage map fixes the arm: delivered = delivered clean, 52 of 103. 'shipped' is in-transit (30) — counting it inflates the keep rate before a box lands; the stamp count is 82 (any dispatched checkout), and the compound filter re-derives a population the status column already encodes.",
      notes: [
        { choice: 1, why: "30 is in-transit — a different funnel stage. Calling dispatched carts delivered inflates the keep rate by 30 of 103." },
        { choice: 2, why: "82 is the dispatched population, not the delivered one — the two differ by arrivals still in transit AND everything never dispatched." },
      ],
      difficulty: "easy",
    },
    {
      id: "newegg-mcq-13",
      prompt: "`SELECT DISTINCT category FROM products` — how many rows, and what does the shelf census do with it?",
      choices: ["16 — one row per SKU", "6 — one per distributor", "7 — Audio, Wearables, Video, Electronics, Accessories, Apparel, Fitness", "1 — one family per store"],
      answer: 2,
      why: "DISTINCT collapses the 16 SKUs to their component families: 7 rows. The family fold — revenue, units, spec ladders per family — is built on this value set, so an eighth row means a new family shipped without merchandising knowing.",
      notes: [
        { choice: 0, why: "That is the count WITHOUT DISTINCT — 16 SKUs across 7 families. DISTINCT is the fold back to the dimension's value set." },
        { choice: 1, why: "6 is the distributor bench (suppliers), a different table. Families live on products.category; partners on suppliers." },
      ],
      difficulty: "easy",
    },
    {
      id: "newegg-mcq-14",
      prompt: "Quarter-end builds land on the last night of December. Which WHERE captures ALL of Q4 2024's checkouts?",
      choices: [
        "created_at BETWEEN '2024-10-01' AND '2024-12-31'",
        "created_at >= '2024-10-01' AND created_at < '2025-01-01'",
        "SUBSTR(created_at, 6, 2) IN ('10', '11', '12')",
        "YEAR(created_at) = 2024 AND MONTH(created_at) IN (10, 11, 12)",
      ],
      answer: 1,
      why: "The half-open range catches every timestamp through the last second of Dec 31 — BETWEEN on a TEXT timestamp silently drops '2024-12-31 23:59:59', and quarter-end is exactly when builders pull the trigger on parts.",
      notes: [
        { choice: 2, why: "The month-only key ignores the year — Q4 2023 lands in the same filter, and the function wrap kills any index on created_at." },
        { choice: 3, why: "SQLite has no YEAR()/MONTH() functions — the query errors outright. The portable spelling is STRFTIME('%Y-%m', …), and even that belongs in the GROUP BY key, not the range filter." },
      ],
      difficulty: "easy",
    },
    {
      id: "newegg-mcq-15",
      prompt: "The exact-settled book must print 65,612.00. Which expression guarantees the dollars and cents?",
      choices: [
        "SUM(amount_cents) / 100",
        "ROUND(SUM(amount_cents) / 100.0, 2)",
        "SUM(amount_cents) * 0.01 AS TEXT",
        "ROUND(SUM(amount_cents))",
      ],
      answer: 1,
      why: "The 21 exact statements carry 6,561,200 INTEGER cents; dividing by 100.0 forces real division and ROUND(…, 2) prints the 65,612.00 the AR folio quotes. Bare integer division truncates on any odd-cent row, and ROUND without a precision on the raw cent total leaves the cents unlabeled.",
      notes: [
        { choice: 0, why: "It happens to agree today — every cent total on this book is a whole-dollar multiple — and silently breaks the day one is not. The 100.0 convention exists because you cannot see the failure coming." },
        { choice: 3, why: "ROUND(SUM(amount_cents)) rounds to 0 decimal places — the cents stay cents, and the print reads 6,561,200 wearing a dollars label: 100x too big. Round the DOLLAR read, not the cent total." },
      ],
      difficulty: "easy",
    },
    {
      id: "newegg-mcq-16",
      prompt: "Combo coverage: how many DISTINCT SKUs appeared in at least one cart this book?",
      choices: ["COUNT(DISTINCT product_id) over order_items — 16 of 16", "COUNT(*) over order_items — 251", "COUNT(*) over products — 16 regardless of carts", "SUM(quantity) over order_items — 498"],
      answer: 0,
      why: "COUNT(DISTINCT product_id) folds 251 cart lines back to the SKUs behind them: 16 distinct — the whole shelf appeared in some cart, so the dead-SKU anti-join returns a confident zero. The count IS the combo-coverage numerator.",
      notes: [
        { choice: 1, why: "251 is cart lines — the fan-out, not the catalog. Reading it as SKUs overstates the shelf 15-fold." },
        { choice: 2, why: "COUNT(*) over products counts carried SKUs, not sold ones — the denominator of coverage, never the numerator. Here they coincide, which is exactly why the distinction must be stated." },
      ],
      difficulty: "easy",
    },
    {
      id: "newegg-mcq-17",
      prompt: "The performance-spec band is cart lines at 55-plus. Which clause applies the band correctly to the line fold?",
      choices: [
        "HAVING unit_price >= 55 after GROUP BY",
        "WHERE unit_price >= 55, before the fold",
        "HAVING AVG(unit_price) >= 55",
        "WHERE AVG(unit_price) >= 55",
      ],
      answer: 1,
      why: "unit_price is a row-level fact on each cart line, so the band filter lives in WHERE: 118 of 251 lines clear it. HAVING judges group aggregates that only exist after the fold — and AVG(unit_price) >= 55 would answer a different question (which GROUPS average above 55) entirely.",
      notes: [
        { choice: 2, why: "AVG per group re-bands by family mean, not by line — a silently different ladder. The spec band is per-line policy." },
        { choice: 3, why: "Aggregate in WHERE is a hard syntax error — groups do not exist at filter time. The pipeline-order lesson in its purest form." },
      ],
      difficulty: "easy",
    },
    {
      id: "newegg-mcq-18",
      prompt: "The trading spine built with STRFTIME('%m', created_at) prints 12 monthly buckets. What is broken?",
      choices: [
        "Nothing — a year has 12 months",
        "The year is lost: 2024-01 merges with 2025-01, so the 14-bucket spine becomes a 12-bucket fiction",
        "STRFTIME cannot take '%m' — it must be '%M'",
        "The spine needs 13 buckets because one month had no checkouts",
      ],
      answer: 1,
      why: "'%m' emits the month alone — '01' through '12' — so the two Januaries fold into one bucket and the trend compares February 2024 against a merged January. The spine key is '%Y-%m': 14 buckets, 2024-01 through 2025-02.",
      notes: [
        { choice: 0, why: "12 buckets from 14 months of data is the tell — two buckets were silently merged. The bucket count is the first thing to check on any time spine." },
        { choice: 2, why: "'%M' is minutes in SQLite's strftime. The format codes are the trap: %Y-%m for months — and the merged-January bug is silent, not an error." },
      ],
      difficulty: "medium",
    },
    {
      id: "newegg-mcq-19",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: [
        "AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed",
        "NULLs were counted as zero days and dragged the average down",
        "SQLite errored on the NULL arithmetic and returned the last good value",
        "The 14 pending checkouts double-counted their checkout day",
      ],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 checkouts.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "newegg-mcq-20",
      prompt: "You write WHERE RANK() OVER (ORDER BY SUM(oi.quantity) DESC) <= 5 to keep the top SKUs. The query fails. Why, and what is the fix?",
      choices: [
        "RANK needs a PARTITION BY clause",
        "Window functions evaluate in the SELECT stage, after WHERE — stage the rank in a CTE (or derived table) and filter in the outer query",
        "SUM cannot appear inside a window ORDER BY",
        "The comparison must be = 5, not <= 5",
      ],
      answer: 1,
      why: "The pipeline order puts WHERE before SELECT: the rank does not exist yet when WHERE runs. The fix is staging — WITH ranked AS (…), then WHERE units_rank <= 5 outside. Every 'window in WHERE' bug is the same stage violation.",
      notes: [
        { choice: 0, why: "PARTITION BY is optional — without it the whole result is one partition, which is legal. The error is the stage, not a missing clause." },
        { choice: 2, why: "Aggregates inside window ORDER BY are fine after GROUP BY — SUM(quantity) DESC is exactly how the units ladder ranks. The failure is evaluating the window in WHERE." },
      ],
      difficulty: "medium",
    },
    {
      id: "newegg-mcq-21",
      prompt: "November's row must show October's 2,975.67 as its prior month. Which window fetches it, and what does the spine's first row print?",
      choices: [
        "LEAD(gmv) OVER (ORDER BY month) — first row prints 0",
        "LAG(gmv) OVER (ORDER BY month) — first row prints NULL",
        "LAG(gmv) OVER (ORDER BY month) — first row prints 3,731.97",
        "SUM(gmv) OVER (ORDER BY month) — first row prints the January total",
      ],
      answer: 1,
      why: "LAG reads one row back on the month-ordered spine — November's prev is October's 2,975.67 — and the first row has no prior, so it prints NULL: the honest 'no baseline'. Coalescing it to zero would read January as a 100% crash month.",
      notes: [
        { choice: 0, why: "LEAD reads FORWARD — November's 'prior' would be December's 2,101.47, re-labeling the future as history. Window boundaries print NULL, never 0." },
        { choice: 3, why: "SUM OVER is the running total, not the prior value — a different metric wearing the same column name. The pulse needs LAG, the cumulative needs SUM." },
      ],
      difficulty: "medium",
    },
    {
      id: "newegg-mcq-22",
      prompt: "Which cart lines beat their OWN family's average line price — not the platform's 115.85 above-55 average? What is the honest shape?",
      choices: [
        "WHERE unit_price > 115.85 — one bar for every family",
        "A correlated subquery keyed to the outer line's family, or a window: unit_price > AVG(unit_price) OVER (PARTITION BY category)",
        "WHERE unit_price > MAX(unit_price) grouped by family",
        "GROUP BY category HAVING unit_price > AVG(unit_price)",
      ],
      answer: 1,
      why: "Per-family baselines need a per-family aggregate: the correlated subquery re-runs AVG per row (correct, re-computes the same seven means), the window computes each partition's mean once. They answer 'above ITS family' — a different report from any platform-wide bar.",
      notes: [
        { choice: 0, why: "A platform bar answers 'above the platform' — a fine report, the wrong question. A 60-dollar line is premium in Accessories (27.49 mean) and budget in Audio (109.66 mean); one bar cannot say both." },
        { choice: 3, why: "HAVING cannot see row-level prices next to a group mean in that shape — and mixing the compared line into its own average's base is the deeper grain error the window spelling avoids." },
      ],
      difficulty: "medium",
    },
    {
      id: "newegg-mcq-23",
      prompt: "Merchandising bands the 16 builders into four spend tiers: NTILE(4) OVER (ORDER BY lifetime_spend DESC). How do the tiles land?",
      choices: [
        "4 / 4 / 4 / 4 — 16 divides evenly by 4",
        "16 / 1 — one builder per tier except the last",
        "Randomly — NTILE shuffles",
        "1 / 1 / 1 / 13 — all weight falls on the first tile",
      ],
      answer: 0,
      why: "NTILE deals rows as evenly as the count allows — 16 builders into 4 tiles of exactly 4. With 15 builders the first tiles absorb the remainder, which the deck must say; the tiles are band EDGES, not performance claims.",
      notes: [
        { choice: 1, why: "That is a top-N read, not a tile. NTILE's contract is even dealing — the tier sizes are the first thing to verify when the builder count changes." },
        { choice: 2, why: "NTILE is deterministic given the ORDER BY — but ties inside the ORDER BY break arbitrarily, so a deterministic second key (lifetime_spend DESC, then id) belongs in the clause." },
      ],
      difficulty: "medium",
    },
    {
      id: "newegg-mcq-24",
      prompt: "The regional AOVs read EU 335.32, APAC 313.66, US 383.48, LATAM 426.22. The deck prints their simple average, 364.67, as 'platform AOV'. What is wrong?",
      choices: [
        "Nothing — four regions, four AOVs, one average",
        "It weights every market equally regardless of size; the true all-checkouts AOV is SUM(total)/COUNT(*) = 338.19 over the 103-row base",
        "The AOVs should have been rounded before averaging",
        "364.67 is right but must be labeled 'median AOV'",
      ],
      answer: 1,
      why: "An average of averages weights LATAM's two checkouts as heavily as EU's forty-five. The platform's real AOV re-aggregates from the base rows: 34,833.28 over 103 = 338.19. The honest blend re-weights — SUM(aov × checkouts)/SUM(checkouts) — the same arithmetic one level up.",
      notes: [
        { choice: 0, why: "Equal weighting is only correct when every group has equal counts — false by construction here (45/37/19/2). The claim must be defended, not assumed." },
        { choice: 3, why: "It is not the median either — the median sits inside the sorted per-checkout totals, not among four regional means. Relabeling a wrong number does not fix its denominator." },
      ],
      difficulty: "medium",
    },
    {
      id: "newegg-mcq-25",
      prompt: "The combo engine wants co-purchase pairs: which two SKUs keep landing in the same build cart. Which join predicate pairs each combo ONCE?",
      choices: [
        "oi1.product_id = oi2.product_id on the same order",
        "oi1.product_id < oi2.product_id on the same order_id",
        "oi1.product_id != oi2.product_id, no other condition",
        "oi1.order_id = oi2.order_id only",
      ],
      answer: 1,
      why: "The strict inequality pairs each combo exactly once (A-B, never B-A, never A-A). Equality pairs a SKU with itself; != double-counts every pair; order_id alone re-pairs every combination twice and reflects each line against its own siblings.",
      notes: [
        { choice: 0, why: "Equality self-pairs every line — 'Cable & Cable' is not a combo, it is one line reflected. The pair predicate needs both same-cart and strict ordering." },
        { choice: 2, why: "!= still generates both A-B and B-A — the pair count doubles and every attach rate halves. The inequality direction is what makes the pairing one-to-one." },
      ],
      difficulty: "hard",
    },
    {
      id: "newegg-mcq-26",
      prompt: "Which checkout months exist in Q4 2024 but not Q1 2025? The spine runs 2024-01 to 2025-02.",
      choices: [
        "SELECT month FROM q4 EXCEPT SELECT month FROM q1 — 3 rows (2024-10, 2024-11, 2024-12)",
        "SELECT month FROM q4 UNION SELECT month FROM q1 — 3 rows",
        "SELECT month FROM q4 INTERSECT SELECT month FROM q1 — 3 rows",
        "An INNER JOIN of the two month lists ON month",
      ],
      answer: 0,
      why: "EXCEPT is the set difference: Q4 holds 2024-10/11/12, Q1 2025 holds 2025-01/02, no overlap — 3 rows. UNION would stack all five distinct months, INTERSECT returns the shared months (none), and an inner join answers overlap, not difference.",
      notes: [
        { choice: 1, why: "UNION is the union of both sets — five distinct months, not three. It cannot answer 'not in'." },
        { choice: 2, why: "INTERSECT is the overlap — zero rows here, since the two quarter-lists share nothing. The mirror of what the memo asked." },
      ],
      difficulty: "hard",
    },
    {
      id: "newegg-mcq-27",
      prompt: "The trading board smooths GMV: AVG(gmv) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW). What do the spine's first two rows print?",
      choices: [
        "NULL, NULL — the frame has no full window yet",
        "3,731.97, then (3,731.97 + 3,609.64) / 2 = 3,670.81 — partial frames at the edge are honest",
        "3,670.81 twice — SQLite backfills the first rows",
        "The full-series average, twice",
      ],
      answer: 1,
      why: "ROWS frames shrink at the partition edge: the first row's window holds only itself, the second holds two rows. The edge values are real averages over what exists — printing them as NULL or backfilling would fake a trend the spine never had.",
      notes: [
        { choice: 0, why: "That is the behavior of requiring a full window — some engines' moving-average idioms do it, SQLite's ROWS frame does not. The edge row IS the average of one row." },
        { choice: 3, why: "No backfill, no series-wide default: the frame is strictly the rows specified, clipped by the partition edge. The opening months are the smoothest-looking and least-informed — say so on the chart." },
      ],
      difficulty: "hard",
    },
    {
      id: "newegg-mcq-28",
      prompt: "A staging filter (one distributor, one month with no carts) feeds WHERE total > (SELECT AVG(total) FROM orders WHERE …). The report returns ZERO rows and no error. Diagnosis?",
      choices: [
        "The zero is correct — nothing beat the average",
        "The inner fold returned zero rows, so the scalar subquery returned NULL; total > NULL is UNKNOWN for every row, and the report silently empties — the empty-inner-query bug",
        "SQLite refuses scalar subqueries in WHERE",
        "The comparison must be >= to include the boundary",
      ],
      answer: 1,
      why: "A scalar subquery over an empty fold returns NULL, not an error — and every comparison against NULL is UNKNOWN, so the outer report empties while looking valid. The habit: state the inner fold's population and its empty-case behavior before trusting an above-average filter.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — but here the zero came from a NULL baseline, not from losers. Those are different reports and only one is honest." },
        { choice: 2, why: "Scalar subqueries in WHERE are legal and common — the failure is semantic (NULL baseline), not syntactic." },
      ],
      difficulty: "hard",
    },
    {
      id: "newegg-mcq-29",
      prompt: "The AR register LEFT JOINs payments and prints COALESCE(SUM(p.amount_cents)/100.0, 0.00) as settled dollars. What does the COALESCE do here — and what would it be doing on the latency report?",
      choices: [
        "In both cases it fixes missing data — coalesce everywhere",
        "Here it is a display default for the 6 never-settled statements (0.00 beside their claimed status); on the dispatch-latency average it would be a lie, inventing zero-day dispatches for the 14 pending checkouts",
        "It converts cents to dollars in both cases",
        "It filters NULL rows before the aggregate in both cases",
      ],
      answer: 1,
      why: "COALESCE at the display edge turns NULL payloads a human reads into a stated default — 0.00 settled. Inside the latency average, COALESCE(shipped_at, created_at) substitutes the checkout date for a missing stamp and fakes same-day dispatches; the honest shape is the IS NOT NULL population plus AVG skipping NULLs.",
      notes: [
        { choice: 0, why: "One placement is honesty, the other is fabrication — the rule is placement, not frequency. Display edge: yes. Inside a definition: only with a stated business meaning for the NULL." },
        { choice: 2, why: "The cents conversion is the /100.0 inside the expression — COALESCE only substitutes the NULL. Two different jobs in the same line, and conflating them is how zero-day dispatches ship." },
      ],
      difficulty: "hard",
    },
    {
      id: "newegg-mcq-30",
      prompt: "The family fold prints sane rows only after someone adds SELECT DISTINCT. A reviewer flags the query. Why is DISTINCT a bug report here?",
      choices: [
        "DISTINCT is always a code smell",
        "The DISTINCT is papering over a fan-out: the join multiplied lines per family and DISTINCT de-dupes the display while every SUM beside it is still wrong — fix the grain, then the keyword disappears",
        "DISTINCT blocks index usage on category",
        "The fold needs DISTINCT inside COUNT, not outside",
      ],
      answer: 1,
      why: "A DISTINCT you cannot justify in one sentence is a symptom: the join fanned out (one row per cart line), the display collapsed it, and the aggregates did not. The honest sequence is to notice the DISTINCT, run the counts with and without it, find the multiplicity, and pre-aggregate — after which no DISTINCT is needed.",
      notes: [
        { choice: 0, why: "Legitimate DISTINCT exists — collapsing a dimension's value set (7 families, 4 regions) is a feature. The tell is intentionality, not the keyword itself." },
        { choice: 2, why: "Performance is secondary here — the complaint is CORRECTNESS: the SUMs next to the DISTINCT are still counting the fan-out. Fix the grain first." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-newegg-1",
      tier: "easy",
      topic: "j4",
      universe: "refund-audit",
      title: "The open-RMA register",
      brief:
        "Newegg-flavored brief on the storefront db: the RMA desk opens the settlement book every close and wants the register of wholesale statements carrying zero settlement legs — the credits nobody has resolved — before a single reminder goes to a distributor. Probed facts: the book holds 28 statements; 21 settle exact (65,612.00), one partial (4,000.00 of 6,148.00), and 6 carry no legs at all, worth 15,217.00 — 24 at 4,937.00, 26 at 3,562.00, 27 at 2,794.00, 28 at 1,756.00, 21 at 1,295.00, 18 at 873.00. Statement #28 is the trap: it claims 'paid' yet has no legs to show for it, so claimed status is printed beside every row and the register reads biggest exposure first.",
      ask: "Return each statement id with its claimed status and dollar amount to 2 decimals, biggest exposure first, for statements with no settlement legs.",
      template:
        "SELECT i.id AS statement_id,\n       i.status AS claimed_status,\n       ROUND(i.amount_cents / {1}, 2) AS statement_dollars\nFROM invoices i\n{2} JOIN payments p ON p.{3} = i.id\nWHERE p.id IS {4}\nORDER BY statement_dollars {5};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Statements carry INTEGER cents — 493,700 prints as 4,937.00 only through the /100.0 dollar read. The bare integer 100 truncates odd-cent rows silently, and 10 or 1000 scale the whole register away from the book.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the keep-every-statement join",
          why: "LEFT JOIN keeps all 28 statements and hands NULL leg columns to the 6 with no settlement. INNER would drop exactly those 6 before the filter — the register would read zero rows and the desk would close with 15,217 unaccounted for.",
        },
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the leg's foreign key",
          why: "A settlement leg names its statement via p.invoice_id = i.id. Substituting p.id pairs payments to statements by matching row-ids — plausible-looking legs attributed to the wrong statements, the silent mis-pairing no error message announces.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the no-leg guard",
          why: "p.id IS NULL keeps only statements where no leg matched — the 6-row register. NOT NULL flips it to the 22 statements WITH legs, the mirror-image population the desk already reconciled.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure-first direction",
          why: "The desk works exposure top-down: 4,937.00 down to 873.00. ASC opens on the smallest credit and buries the 4,937.00 head of the register — a correct query aimed at the wrong end of the worklist.",
        },
      ],
      distractors: ["INNER", "10", "id", "ASC", "NOT NULL"],
      walkthrough:
        "One join, one filter, the AR anti-join the RMA desk runs every close. LEFT JOIN keeps all 28 statements; p.invoice_id = i.id attaches each settlement leg; p.id IS NULL keeps the 6 statements where no leg matched — 24 at 4,937.00, 26 at 3,562.00, 27 at 2,794.00, 28 at 1,756.00, 21 at 1,295.00, 18 at 873.00 — footing to the 15,217.00 the coverage census books as 'no payment'. The cents divider /100.0 turns INTEGER cents into the dollar read; missing it truncates, mis-scaling the register. Row #28 is why claimed_status sits beside every row: it says 'paid' and has zero legs, the status lie that makes payment legs the ledger of record. The distractors fail honestly: INNER inner-joins the register to nothing (0 rows); 10 and the bare mis-pairs scale or mis-pair legs onto statements; NOT NULL flips to the 22 settled statements; ASC opens the worklist on the smallest credit. The desk's rule holds: the register is statements WITHOUT legs, exposure first — and #28 gets a human, not a status.",
    },
    {
      id: "cs-newegg-2",
      tier: "medium",
      topic: "t8",
      universe: "pricing",
      title: "The component spec ladder",
      brief:
        "Newegg-flavored brief on the storefront db: merchandising publishes a per-family spec ladder — each SKU ranked on its own component family's shelf by price, beside the family's average shelf price — so the catalog page shows where a part sits on its ladder and how far above or below the family norm it lists. Probed facts: 16 SKUs across 7 families; the shelf tops out at 199.99 (Smart Watch S) so the premium tip is honestly empty; family averages run Audio 109.66 (149.99 / 119 / 59.99), Wearables 139.5, Video 84.5, Electronics 57.83, Accessories 27.49, Apparel 41.75, Fitness 32. Ladders read most expensive first; families display alphabetically down the page.",
      ask: "Return each SKU with its family, shelf price, rank on the family ladder (most expensive first) and family average price to 2 decimals, families alphabetical.",
      template:
        "WITH fam AS (\n  SELECT category,\n         COUNT(*) AS skus,\n         ROUND(AVG(price), {1}) AS family_avg\n  FROM products\n  GROUP BY category\n)\nSELECT p.category AS family,\n       p.name AS sku,\n       p.price AS shelf_price,\n       RANK() OVER (PARTITION BY p.category ORDER BY p.price {2}) AS spec_rank,\n       f.family_avg\nFROM products p\nJOIN fam f ON f.{3} = p.category\nORDER BY family {4}, spec_rank;",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the family-average precision",
          why: "Family averages print to cents — Audio 109.66, Accessories 27.49 — so the ladder reconciles with the catalog sheet merchandising quotes. ROUND to 1 decimal prints 109.7 and 27.5, and the sheet stops matching the numbers the pricing review signed off.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the most-expensive-first rank",
          why: "Spec rank 1 is the halo part of the family — Audio reads 149.99, 119, 59.99 top-down. ASC would rank the 59.99 speaker first and hand the catalog page a budget part wearing the crown.",
        },
        {
          answer: "category",
          kind: "keyword",
          label: "the family join key",
          why: "The staged fold keys families by category, so f.category = p.category attaches each SKU to its family row. f.name or any other column does not exist on the fold — and a mis-keyed join would blend ladders across families.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the alphabetical family order",
          why: "Families display alphabetically — Accessories down to Wearables — with spec_rank nested inside. DESC would flip the page to Wearables-first and break every bookmark merchandising has ever shared.",
        },
      ],
      distractors: ["name", "SUM", "MAX", "MIN", "0"],
      walkthrough:
        "Two stages: fold the family shelf, then rank inside it. The CTE folds products into 7 family rows — SKU count and ROUND(AVG(price), 2) — and the outer query joins every SKU back to its family fold on category, then ranks with RANK() OVER (PARTITION BY p.category ORDER BY p.price DESC) so each ladder is family-local: Audio 149.99, 119, 59.99 at ranks 1-2-3 beside the 109.66 average; Wearables 199.99 and 79 beside 139.5; Video 129 and 39.99 beside 84.5; Electronics 89.99, 49, 34.5 beside 57.83; Accessories 42.5, 24.99, 14.99 beside 27.49; Apparel 65 and 18.5 beside 41.75; Fitness a one-SKU ladder where the average IS the shelf price, 32. The page reads alphabetically, families first, spec_rank second. The distractors each break differently: 'name' at the precision slot coerces the round and at the join slot errors outright; SUM folds the shelf's whole price mass (Audio 328.98), MAX the halo tip (149.99), MIN the floor (59.99) — each a different wrong average; 0 truncates every family average to whole dollars; ASC at the rank slot crowns budget parts. One query, and the ladder merchandising publishes ships with its denominators on it.",
    },
    {
      id: "cs-newegg-3",
      tier: "medium",
      topic: "t5",
      universe: "catalog",
      title: "The tie-heavy best-seller board",
      brief:
        "Catalog brief on the storefront db: merchandising publishes the best-seller board every week — each SKU ranked by units moved on the whole shelf's ladder, with the tie policy printed beside the board, because when two SKUs move the same units the badge decision must be a policy, not storage luck. Probed on the storefront db: 16 SKUs moved 498 units; the ladder runs 47 (Desk Mat Extended), 46 (Noise-Canceling Headset), 38 (HDMI 2.1 Cable 2m), then a two-way tie at 36 (Laptop Stand Aluminum, Wireless Mouse M3), then 33 (Running Socks 3-pack). The board keeps SKUs at 33-plus units — six rows — and its published policy is RANK: shared rungs, gaps kept, so the 33-unit SKU reads rank 6.",
      ask: "Return each SKU with 33-plus units: name, units sold, and a rank that shares rungs for ties and keeps the gaps the tie block earns, biggest first.",
      template:
        "SELECT p.name AS sku,\n       SUM(oi.quantity) AS units,\n       {1}() OVER (ORDER BY SUM(oi.quantity) {2}) AS units_rank\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.id\nHAVING SUM(oi.quantity) >= {3}\nORDER BY units DESC, sku;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the gap-keeping rank",
          why: "The board's published policy is RANK: the 36-tie shares rank 4 twice, and the 33-unit SKU lands on rank 6 — the gap shows how deep the tie ran. DENSE_RANK would renumber it 5, hiding the tie block; ROW_NUMBER would split two identical ladders arbitrarily and hand the badge to storage luck.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The board ranks units biggest first, so the window ORDER BY runs descending and the 47-unit desk mat is rank 1. ASC crowns the 33-unit socks and pushes the volume leader to the bottom — a correct query aimed at the wrong end of the shelf.",
        },
        {
          answer: "33",
          kind: "number",
          label: "the board cut",
          why: "HAVING SUM(oi.quantity) >= 33 keeps six SKUs — the 47/46/38 head, the two-way tie at 36, and the 33-unit row — so the tie AND the gap it earns both stay visible. The cut judges a per-SKU aggregate, which is why it lives in HAVING, not WHERE.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "36"],
      walkthrough:
        "A fold, a cut, and a published tie policy. The join attaches every cart line to its SKU and GROUP BY p.id folds 251 lines into 16 ladders; HAVING SUM(quantity) >= 33 keeps the six-row board — 47, 46, 38, 36, 36, 33. The window ranks the folded counts with RANK: the head takes ranks 1-3, the 36-tie shares rank 4 twice, and the 33-unit SKU lands on rank 6 — rank 5 is consumed by the tie, and the gap is the merchandising policy made visible. DENSE_RANK would print 5 — shared rungs, no gaps — which is a different policy the badge review did not sign; ROW_NUMBER would deal 1 through 6, breaking the 36-tie by storage luck and handing one SKU a badge the data cannot support. The cut is load-bearing: raise it to 36 and the 33-unit row drops out — and inside the kept set RANK and DENSE_RANK would coincide, hiding the very policy the board publishes. The stable tie-break (sku name) keeps the board reproducible week over week. One query, and the badge decision ships with its tie policy on it.",
    },
    {
      id: "cs-newegg-4",
      tier: "medium",
      topic: "s6",
      universe: "pricing",
      title: "The 55-line build sheet",
      brief:
        "Pricing-review brief on the storefront db: merchandising bands the CART LINES by the 55-dollar line — budget-spec builds below it, performance-spec builds at 55-plus, and a halo arm at 150-plus for the flagship baskets — and reports lines, units and average line price per band. Probed on the storefront db: 251 lines carrying 498 units split budget 133 lines / 268 units / 31.01 average, performance 95 / 185 / 101.34, halo 23 / 45 / 175.74 — lines and units footing to 251 and 498. One grain note the sheet must carry: cart-LINE prices run past the shelf's 199.99 ask ceiling (top line 209.68) because line price is the agreed price, not the shelf ask — the ask-shelf's premium rung is empty while the cart-line halo band is not.",
      ask: "Return each band with its line count, units, and average line price to 2 decimals, biggest unit volume first.",
      template:
        "SELECT CASE\n         WHEN unit_price >= 150 THEN 'halo'\n         WHEN unit_price >= {1} THEN 'performance'\n         ELSE '{2}'\n       END AS band,\n       COUNT(*) AS lines,\n       SUM(quantity) AS units,\n       ROUND(AVG(unit_price), 2) AS avg_line_price\nFROM order_items\nGROUP BY band\nORDER BY units {3};",
      slots: [
        {
          answer: "55",
          kind: "number",
          label: "the spec-band line",
          noVerify: true,
          why: "The 55-dollar line is the published ladder edge: lines at 55-plus are performance-spec (95 lines, 101.34 average), below it budget (133, 31.01). Move the edge to 50 and the 50.32/50.84 lines re-band to performance — the ladder changes with no error anywhere.",
        },
        {
          answer: "budget",
          kind: "keyword",
          label: "the below-line label",
          why: "The ELSE branch is the bucket for every line below the 55 line: 133 lines, 268 units — the cable tail that moves volume. Labeling it anything else (or leaving a hole in the CASE) is a band the merch sheet cannot reconcile, and a hole in the CASE is a band that vanishes.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-volume-first direction",
          why: "The sheet reads biggest unit volume first: budget 268, performance 185, halo 45. ASC would open the pricing review on the 23-line halo band — the smallest slice of the shelf wearing the loudest label.",
        },
      ],
      distractors: ["50", "mid", "ASC", "halo"],
      walkthrough:
        "A CASE ladder over the cart grain. The three arms are ordered top-down — halo at 150-plus catches the flagship lines first (23 lines, 175.74 average), performance at 55-plus takes the mid-shelf builds (95 lines, 101.34), and ELSE holds the budget tail (133 lines, 31.01) — and because CASE stops at the first true arm, swapping the >= 150 and >= 55 arms would silently starve the halo band with no error anywhere. The fold reports lines, units and average line price per band; lines foot to 251 and units to 498, so the sheet reconciles with the platform book by construction. The grain note ships with the numbers: these are CART-LINE prices, which run past the ask ceiling (top line 209.68) — the ask-shelf's premium rung is empty at 16 SKUs while the cart-line halo band carries 23 lines, and 'state the population' is the difference between those two claims. The distractors each break differently: 50 re-bands the 50.32/50.84 lines; 'mid' relabels the budget band the sheet quotes; 'halo' in the ELSE slot mislabels every sub-55 line; ASC opens the review on the smallest band. One query, three bands, and the pricing review starts from a build sheet that foots.",
    },
    {
      id: "cs-newegg-5",
      tier: "easy",
      topic: "j7",
      universe: "catalog",
      title: "The family fold: units versus revenue",
      brief:
        "Catalog brief on the storefront db: the merchandising review leads with the family fold — per component family, how many SKUs are carried, how many units moved, and what revenue the family booked — because the volume story and the money story disagree, and the disagreement IS the read. Probed on the storefront db: 16 SKUs across 7 families; Audio books 11,744.01 (33.7% of the 34,833.28 platform) on 3 SKUs and 97 units, while Accessories leads UNITS at 121 on just 3,294.29 — the cable tail moves volume, the spec tier moves money. The full fold: Audio 3/97/11,744.01, Wearables 2/53/6,929.12, Video 2/61/5,198.41, Electronics 3/85/4,818.61, Accessories 3/121/3,294.29, Apparel 2/54/1,984.93, Fitness 1/27/863.91. Biggest revenue first.",
      ask: "Return each family with its SKU count, units sold, and revenue to 2 decimals, biggest revenue first.",
      template:
        "SELECT p.category AS family,\n       COUNT({1} p.id) AS skus,\n       {2}(oi.quantity) AS units,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.category\nORDER BY revenue {3};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the SKU deduplicator",
          why: "COUNT(DISTINCT p.id) folds the line fan-out back to SKUs carried — Audio reads 3, not its 33 line rows. COUNT(p.id) counts non-NULL FKs and reads the line count wearing a SKU name; the shelf census would overstate every family.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the units adder",
          why: "SUM(oi.quantity) adds units per family — Accessories 121, Fitness 27. COUNT would count line rows (a count wearing a units name), and MAX would report the largest single line in the family — neither is units moved.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-revenue-first direction",
          why: "The review leads with the money story: Audio 11,744.01, Wearables 6,929.12, down to Fitness 863.91. ASC would open on the smallest family and bury the 33.7% concentration headline the deck exists to make.",
        },
      ],
      distractors: ["COUNT", "MAX", "id", "ASC"],
      walkthrough:
        "One join, one fold, two stories. The join attaches every cart line to its SKU and family — all 251 lines survive — and GROUP BY category folds them into seven rows where COUNT(DISTINCT p.id) reads SKUs carried (3/2/2/3/3/2/1), SUM(quantity) reads units moved (97/53/61/85/121/54/27 — footing to the platform's 498), and ROUND(SUM(quantity × unit_price), 2) reads revenue (11,744.01 down to 863.91 — footing to 34,833.28). The read under the numbers: Audio carries a third of the book on 3 SKUs while Accessories leads units at 121 for a fifth of Audio's revenue — the cable tail moves volume, the spec tier moves money, and a merchandising plan that staffs by units alone would starve its profit center. The distractors each break differently: COUNT in the units slot turns the column into line counts; MAX reports one line's quantity as the family total; 'id' inside the COUNT breaks the parse outright; ASC buries the headline. State the two grains — SKUs beside units beside dollars — and the fold defends both stories at once.",
    },
    {
      id: "cs-newegg-6",
      tier: "medium",
      topic: "t3",
      universe: "month-close",
      title: "The settlement clock by rail",
      brief:
        "Month-close brief, in-world: finance wants the settlement clock split by payment rail — card legs against wire legs — because the rails clear on different schedules and the dunning calendar keys off the slow one. Probed on the storefront db: 27 settlement legs attach to 22 of the 28 statements (five statements split across both rails); the clock is julianday(paid_on) - julianday(issued_on), averaging 29.04 days overall — card 16 legs averaging 29.44 (fastest 13, slowest 84), wire 11 legs averaging 28.45 (fastest 19, slowest 55). The six never-settled statements never enter this fold — the join defines the population. Biggest rail first.",
      ask: "Return each rail with its leg count, average days-to-settle to 2 decimals, fastest and slowest days, biggest rail first.",
      template:
        "SELECT p.method AS rail,\n       COUNT(*) AS legs,\n       ROUND(AVG(julianday(p.paid_on) - julianday(i.issued_on)), 2) AS avg_days,\n       MIN(julianday(p.paid_on) - julianday(i.issued_on)) AS fastest_days,\n       MAX(julianday(p.paid_on) - julianday(i.issued_on)) AS slowest_days\nFROM invoices i\nJOIN payments p ON p.{1} = i.id\nGROUP BY p.method\nHAVING COUNT(*) >= {2}\nORDER BY legs {3};",
      slots: [
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the leg's foreign key",
          why: "A settlement leg names its statement via p.invoice_id = i.id. Substituting p.id pairs payments to statements by matching row-ids — plausible-looking clocks computed on the wrong pairs, the silent mis-pairing no error message announces.",
        },
        {
          answer: "11",
          kind: "number",
          label: "the rail floor",
          why: "HAVING COUNT(*) >= 11 keeps both rails — card 16, wire 11 — while staying high enough to be a real gate: raise it to 12 and the wire rail silently drops out of the dunning calendar, the exact rail the slowest settlements would justify watching.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-rail-first direction",
          why: "The close reads the biggest rail first: card 16 legs, then wire 11. ASC would open on wire and let the card book — two-thirds of the legs — ride as a footnote.",
        },
      ],
      distractors: ["id", "12", "ASC", "LEFT"],
      walkthrough:
        "A clock, a population, and a rail split. The join pairs each payment leg to its statement on p.invoice_id = i.id — 27 legs on 22 statements, the five split statements carrying two legs each — and GROUP BY method folds them into two rails. julianday(paid_on) - julianday(issued_on) is the clock per leg; AVG prints 29.44 for card and 28.45 for wire, MIN/MAX carry the 13-to-84 spread, and the dunning calendar keys off the tail (84 days), not the mean. The population ships with the number: the join's INNER shape means the six never-settled statements never enter the clock — they are the register's problem, not the rails' — and switching to LEFT would add a NULL-rail row for them, mislabeling absence as a payment method. The floor is a real gate: at 12 the wire rail (11 legs) drops out and the slowest tail vanishes from the report. The distractors each break differently: 'id' mis-pairs legs to statements by row-id coincidence; 12 amputates the wire rail; ASC flips the read; LEFT manufactures a rail that does not exist. One fold, two rails, and the dunning calendar starts from a defensible clock.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-iii", why: "Sell-through windows per SKU — first checkout to last — are how the catalog pod spots parts going end-of-life before the open-box repricing hits them. Same first/last-per-group shape." },
    { slug: "customers-who-never-order", why: "The never-checked-out builder anti-join. On this db it returns a confident zero — all 16 builders have carts — and proving that zero honestly is the interview move." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The power-builder read: one builder has run 24 checkouts, another 17. Argmax over a per-builder fold is how the builder-relations pod picks its tiering calls." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Per-builder favorite part — the cable they keep rebuying. Argmax per group with ties is the recommendation-seed query the combo engine starts from." },
    { slug: "find-stores-with-inventory-imbalance", why: "Stock versus sold per SKU: the headset sits at 14 remaining while the desk mat holds 213. Imbalance reads like this decide what the next open-box batch discounts." },
    { slug: "recyclable-and-low-fat-products", why: "Flag-filtered catalog reads: open-box and refurb eligibility are flag cuts on the shelf. Two-flag WHERE discipline at catalog grain, exactly this shape." },
    { slug: "weeks-of-supply", why: "Stock cover math — units on hand over run rate — is the warehouse pod's weekly pulse before a spec refresh makes shelf inventory stale." },
    { slug: "returns-rate-by-category", why: "The RMA story at family grain: returned share per component family, LEFT JOINed so families with no returns still show a rate. The returns desk's standing report." },
    { slug: "settlement-fails-aging", why: "Statements aging without settlement legs — the 6/15,217 register needs an age column before dunning. T+N aging buckets over unpaid statements, exactly this shape." },
    { slug: "delinquency-buckets", why: "The dunning ladder buckets open statements by age so finance knows whether 15,217 is early-stage or rotting. CASE buckets over the AR book." },
    { slug: "duplicate-charge-pairs", why: "Five statements settle on BOTH card and wire legs — pairing legs per statement is how finance proves the split was intentional, not double-billing. Self-join over shared keys." },
    { slug: "keep-latest-dedupe", why: "Price-list revisions arrive as one row per repricing; keep-latest dedupe is how the shelf shows one price per SKU. ROW_NUMBER = 1 over a per-key ordering." },
    { slug: "null-blank-audit", why: "Spec sheets arrive half-filled; the null-and-blank audit across columns is the catalog pod's ingestion gate before a SKU goes live." },
    { slug: "repeat-purchase-rate", why: "Builders repeat — the ladder runs 24, 17, 14, 13, 5 with a three-way tie at 4 below. Share of builders with 2-plus checkouts is the retention read." },
    { slug: "rfm-segmentation", why: "Builder segmentation on recency, frequency, money — NTILE bands over 16 builders — drives who sees the next combo-deal email and who gets the winback." },
    { slug: "warehouse-manager", why: "The warehouse fold: units per SKU joined back to the shelf, stock beside sold. The join-and-aggregate shape behind every inventory count here." },
    { slug: "product-price-at-a-given-date", why: "As-of shelf pricing: the price in force when a cart landed, not today's — the slowly-changing-dimension instinct every price audit and open-box repricing assumes." },
    { slug: "calculate-product-final-price", why: "Final price after discounts and taxes — the open-box math. Percentage arithmetic with a stated base, exactly the discipline the price ladder needs before it publishes." },
    { slug: "second-highest-salary", why: "The second rung of a price ladder with ties: the classic trap where ROW_NUMBER picks arbitrarily and the honest answer needs DENSE_RANK or MAX-below-MAX. The tie-heavy shelf drills it weekly." },
    { slug: "premier-league-table-ranking", why: "Leaderboard with tie policy — points, shared rungs, gaps. The best-seller board is the same object: ties are a merchandising decision, and this problem makes you write the policy." },
    { slug: "customers-with-strictly-increasing-purchases", why: "Builders whose cart totals climb checkout over checkout — the upgrade-path read. The sequential comparison shape is how the builder-relations pod spots rigs being built over months." },
    { slug: "the-most-recent-three-orders", why: "Each builder's last three checkouts — the recency read behind combo emails. Per-group top-N with a deterministic tie-break, the exact shape of a follow-up queue." },
    { slug: "seasonal-sales-analysis", why: "Launch-season curves: when spec refreshes move the book. The month/quarter aggregation shape is how merchandising separates GPU-launch demand from background drift." },
    { slug: "year-on-year-growth-rate", why: "YoY growth with NULL edges for the unmatched periods — the honest growth read when the log covers 14 months. Same LAG-plus-boundary discipline as the month spine walk." },
    { slug: "portfolio-concentration-hhi", why: "Concentration math on the revenue book — how much rides on Audio's 33.7% and the top two distributors. HHI is the index behind the supplier-risk slide." },
    { slug: "usage-tier-percentiles", why: "Percentile tiers on spend — where a builder sits in the distribution, not just their rank. PERCENT_RANK/NTILE banding is the combo-eligibility screen." },
    { slug: "spend-histogram", why: "Bucketed builder spend — the AOV-spread histogram (25.47 to 1,088.44). Zero-filled CASE bands so empty bins print, the honest shape for any distribution slide." },
    { slug: "fifo-inventory-cogs", why: "FIFO cost of goods across receipt batches — the warehouse pod's margin read when distributor costs move between restocks. Layer-by-layer depletion arithmetic, exactly this shape." },
    { slug: "balance-rollforward", why: "Opening balance plus movements equals closing — the settlement book's rollforward before credits ship. The running-sum-with-identity check the close demands." },
    { slug: "trial-balance-check", why: "Debits equal credits — 181,080 against 181,080 on this ledger, delta zero. The close ritual as a single query, and the identity every settlement read must survive." },
    { slug: "scd2-build", why: "Slowly-changing catalog: repriced SKUs as validity intervals, the shelf reconstructed as-of any date. The as-of join behind every historical price audit here." },
    { slug: "roas-by-campaign", why: "Return on launch spend with the zero-sale campaigns kept visible at zero — outer-join guard, denominator protected. The GPU-launch marketing read." },
  ],
};
