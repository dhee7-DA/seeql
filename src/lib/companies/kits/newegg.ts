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
    "Preparation strategy: company-pools.md carries no Newegg section — zero tagged rows — so all ten topic slug sets and all sixteen problems here are **theme-curated** from the pools file's SQL rows to this kit's known screen shapes: spec-band ladders, combo-basket reads, tie-heavy best-seller boards, honest-denominator funnel counts and the cents-safe settlement book. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {rose:open-RMA register} the returns desk works at every close, the other rebuilds the {violet:component spec ladder} merchandising publishes with the catalog. The bar to clear: *state the population and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain market censuses",
      why: "Checkouts and builders are different grains of the same join, and every census here reports both: EU runs 45 checkouts from 8 builders while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining SKUs to carts",
      why: "Cart lines inherit family and price through the products join, and the join type decides who survives. A cart line with no SKU row is corruption; a SKU with no cart line would be dead shelf — on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["product-sales-analysis-i", "product-sales-analysis-ii", "combine-two-tables"],
    },
    {
      name: "Spec-band laddering with CASE",
      why: "The shelf is banded, not listed: budget-spec below the 55 line (268 units at 31.01) versus performance-spec above it (230 at 115.85), with the premium arm honestly empty at the 199.99 ceiling. CASE arms must be exhaustive and ordered — a hole in the CASE is a hole in the ladder, and a reordered WHEN quietly re-bands the base.",
      slugs: ["calculate-orders-within-each-interval", "the-category-of-each-member-in-the-store", "customer-purchasing-behavior-analysis"],
    },
    {
      name: "Combo-basket reads",
      why: "A build cart is a combo candidate, and the combo pod reads baskets at line grain: 251 lines over 103 builds, never more than 3 of one line, families stacked inside one checkout. Conditional aggregation over line pairs — who bought the board AND the card but not the cooler — is exactly the combo-eligibility query.",
      slugs: ["basket-depth-aov", "customers-who-bought-a-and-b-not-c", "group-sold-products-by-the-date"],
    },
    {
      name: "Best-seller leaderboards",
      why: "The units ladder is tie-heavy by construction: two SKUs at 36 units, then three-way ties at 30 and at 21. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow — a merchandising policy about peer SKUs, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Distributor bench economics",
      why: "Six distributor/brand partners carry the shelf, and concentration is the whole story: Nordic Gadgets AB at 32% of revenue, Midwest Hardware Co at 26.7%, the 4.5-rated trusted bench just two partners deep. Fold revenue through products to partners and the rating floor becomes a HAVING decision.",
      slugs: ["average-selling-price", "sales-person", "top-travellers"],
    },
    {
      name: "Month spine walks",
      why: "The 14-month checkout spine (2024-01 to 2025-02) is the trading call's home turf: the book opens at 3,731.97, troughs at 1,193.86 in July, then jumps +1,158.21 into August while the steepest drop, -1,326.87, lands in November. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["biggest-window-between-events", "last-person-to-fit-in-the-elevator", "friday-purchase-iii"],
    },
    {
      name: "Coverage set algebra",
      why: "Close packets stack populations — settled statements beside claimed, this quarter beside last — and EXCEPT answers 'which claimed statements never settled'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["movie-rating", "monthly-transactions-ii", "the-airport-with-the-most-flights"],
    },
    {
      name: "Cents-safe settlement reads",
      why: "Claimed is not settled — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the builder world meets money. Every dollar read is amount_cents / 100.0, the 28.4-day settlement clock (13 fastest, 84 slowest) is one date diff away, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE from the register.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "ar-aging-schedule"],
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
  ],
};
