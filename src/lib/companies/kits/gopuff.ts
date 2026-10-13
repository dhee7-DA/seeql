// Gopuff — kit of the Food & Quick-commerce domain (Wave-8, Task 96).
// Wave-8 (Task 96), food domain, 0 tagged LC — theme-curated; facts from
// scripts/company-facts.md. Gopuff is instant delivery the first-party way:
// it owns the inventory (no marketplace), stocks micro-fulfillment clouds
// blocks from the customer, runs delivery-partner shifts, lives on late-night
// demand peaks, enforces basket minimums, and substitutes when the shelf runs
// dry. 0 tagged LC problems in company-pools.md — the pool is FULLY
// theme-curated from the SQL band (16 problems, 30 topic slugs), every one
// mirroring a workflow Gopuff screens are known to probe (pick fan-out,
// status funnels, two-grain cloud censuses, supplier benches, month spines,
// settlement anti-joins). Theme-curated, declared here per spec.
// Cases run on the storefront db (scripts/company-facts.md, probed
// 2026-10-12): orders = deliveries, order_items = picks, shipped_at =
// completion timestamp, customers = customers, suppliers = FC suppliers,
// products = the owned shelf, regions = cloud clusters, invoices/payments =
// settlement statements (INTEGER cents — divide by 100.0). Probed traps
// honored: created_at stores DATE-only values (STRFTIME('%H') reads '00' for
// all 103 rows — the late-night cohort CANNOT be read from this table, and
// saying so is the interview answer); completion aging is stored in DAYS
// (avg 2.98, range 2..4 over the 82 completed) — never read as delivery
// minutes; every customer has ordered (never-ordered = 0), so the honest
// anti-join lives in billing (6 statements with no settlement = 15,217.00,
// incl. paid-with-no-payment #28 at 1,756.00 and the 4,000-of-6,148 partial);
// the premium price band (>= 200) is EMPTY (shelf tops at 199.99).

import type { CompanyKit } from "../types";

export const gopuffKit: CompanyKit = {
  id: "gopuff",
  domainId: "food",
  name: "Gopuff",
  tagline: "Instant delivery from micro-fulfillment clouds",
  accent: "text-cyan-300",

  brief: [
    "Gopuff is instant delivery the hard way: it owns the inventory. No marketplace, no third-party sellers — the company buys the shelf outright, stocks it in **micro-fulfillment clouds** a few blocks from the customer, staffs delivery-partner shifts around the clock, and treats the late-night hours as its signature demand peak. On the training db that reads as **103 deliveries carrying 251 picks**, status streaming as {emerald:delivered} 52 / shipped 30 / pending 14 / {rose:cancelled} 7, and a demand book of **34,833.28** — a 338.19 average basket spanning a 25.47 snack run to a 1,088.44 haul. Every analyst here learns the first Gopuff lesson fast: *when you own the shelf, every stockout, substitution and empty pick is your P&L, not a seller's*.",
    "The data org splits by fight. Cloud ops owns the delivery board — the status funnel, completion aging (a **2.98**-day average on a 2..4 range over the 82 completed deliveries), and the two-grain cluster census: EU runs 45 deliveries from 8 customers, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. Buying and inventory owns the shelf itself — remaining cover computed as `stock - picks` (three SKUs sit at 14, 15 and 17 units), the {violet:supplier bench} where Nordic Gadgets AB carries **32%** of shelf revenue, and the price-band map whose premium shelf (>= 200) is *empty at max 199.99*. Settlement ops owns the billing spine, where money is integer cents and a skipped /100.0 is a 100x incident — 6 statements with no settlement total **15,217.00**.",
    "Interviews are hands-on SQL against a storefront-shaped schema, in a plain editor where your syntax errors are yours. Expect the pick fan-out (103 deliveries into 251 lines — what does your COUNT count now?), the funnel with its denominators, the two-grain census, and the billing anti-join — 6 statements with no payment, one of them (#28 at 1,756.00) marked {emerald:paid} with zero payment rows behind it. Gopuff interviewers love the honest-dead-end question: *pull me the 2am cohort* — and the timestamps in this schema are date-only, so the correct answer is a statement about grain, not a query that lies. Completion aging reads `JULIANDAY(shipped_at) - JULIANDAY(created_at)`: days here, minutes in the production courier stream — *say the unit out loud or misread the SLA*.",
    "Prep like a cloud-ops analyst, not a generic SQL student. Gopuff has **no tagged pool** in this app's registry, so the kit curates **sixteen problems** from the SQL band — theme-curated, each mirroring a real workflow: pick manifests, substitution pairings, cover-weeks folds, cancel-share boards. Drill the fan-out join until COUNT(DISTINCT …) is a reflex, conditional aggregation for the funnel, scalar-subquery baselines against the 338.19 average, and the settlement anti-join through `LEFT JOIN … IS NULL`. Then run both case studies on the live db: one rebuilds the {violet:trusted supplier bench} the buying team negotiates from, the other rebuilds the monthly replenishment spine the buying calendar hangs on — *and on every screen, the population sentence comes before the FROM clause*.",
  ],

  dayInLife: [
    "**08:10 —** the late-night wrap: the overnight shift handed off at six, and the morning board opens with the funnel census — {emerald:delivered} 52 / shipped 30 / pending 14 / {rose:cancelled} 7 over the 103 placed deliveries. Before the standup, you re-run the two grains yourself: `COUNT(*)` for deliveries, `COUNT(DISTINCT customer_id)` for customers — because *a cluster can gain deliveries while losing customers, and only the pair of columns says which*. The aging fold rides along: 2.98 days average over the 82 completed, bucketed 2..4, and the thin-shelf alert pings — three SKUs at 14, 15 and 17 units of cover going into tonight's peak.",
    "**12:30 —** deep work: the replenishment fold. The buying calendar wants the month spine — `STRFTIME('%Y-%m', created_at)` over placed deliveries, 2024-01's 3,731.97 opening down to 2024-07's 1,193.86 trough — gated at a real month so a stub can't pose as a trend. Beside it, the shelf file: `stock - SUM(quantity)` per SKU staged in a derived table, thinnest first, each row carrying its stock-and-sold provenance so the buyer can argue with the number. The supplier bench updates in the same session — Nordic Gadgets AB at 32% of shelf revenue, Alpine Audio GmbH rating **4.8** on just 2 listings — because *own-inventory means the reorder and the negotiation are the same meeting*.",
    "**17:45 —** the stakeholder cycle: the GM wants the basket-minimum read for the fee review — 2.44 picks per delivery on average, a 25.47 floor under the 338.19 mean, and the band histogram that decides where the small-basket fee line lands. Then the settlement sweep before close: 6 statements with no payment = **15,217.00**, #28 called out separately because {emerald:paid}-with-zero-payment-rows is a label lying about money, and the partial at 4,000 of 6,148 flagged for the dunning list. The ledger ties — 181,080 debits against 181,080 credits, delta 0 — so the note ships as a chase list, not a mystery, with *the population sentence printed above every fold*.",
  ],

  metrics: [
    {
      name: "Delivery funnel",
      what: "{emerald:delivered} 52, {sky:shipped} 30, {amber:pending} 14, {rose:cancelled} 7 over 103 placed deliveries. Four numerators over one population — merging pending into cancelled misreads a pick-queue delay as a lost order.",
    },
    {
      name: "Completion aging",
      what: "`JULIANDAY(shipped_at) - JULIANDAY(created_at)` over the 82 completed deliveries: avg **2.98 days**, range 2..4. Stored in DAYS on the training db; the production courier stream reads the identical shape in minutes — state the unit or misread the SLA.",
    },
    {
      name: "Basket value",
      what: "34,833.28 across 103 deliveries = **338.19** average, from a 25.47 minimum to a 1,088.44 maximum. The scalar-subquery baseline every cluster and band read is judged against.",
    },
    {
      name: "Pick depth",
      what: "251 pick lines across 103 deliveries — about **2.44 lines per basket**. Depth isolates the shelf story from the price story: a basket can deepen while AOV falls, which is exactly the promo outcome the fee review has to catch.",
    },
    {
      name: "Cloud census",
      what: "Deliveries AND customers per cluster at two grains: EU 45 from 8, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. The gap between the columns is deliveries per customer — the density read every ops review opens with.",
    },
    {
      name: "Supplier concentration",
      what: "Share of shelf revenue by FC supplier: Nordic Gadgets AB **32%** (11,130.25), Midwest Hardware Co 26.7% (9,294.93) — the top two out-muscle the other four combined. Own-inventory buying makes this a risk board, not a marketplace nicety.",
    },
    {
      name: "Shelf cover",
      what: "Remaining units = stock minus picks, per SKU: Noise-Canceling Headset **14**, Studio Desktop Mic 15, Smart Watch S 17 — the substitution list writes itself from this fold. Every SKU on this shelf has sold, so cover reads thinning, not dying.",
    },
    {
      name: "Settlement exposure",
      what: "6 statements with no payment = **15,217.00**, including #28 marked {emerald:paid} with zero payment rows (1,756.00) and one partial (4,000 of 6,148). Settled statements pay in **28.4** days against flat 30-day terms — fastest 13, slowest 84; the tail is the negotiation lever.",
    },
  ],

  topics: [
    {
      name: "Picks vs deliveries — the fan-out join",
      why: "One delivery fans into pick lines — 103 deliveries into 251 picks — and every downstream count changes grain the moment you join order_items. Gopuff screens open here because the pick fan-out is the first place a candidate's COUNT stops meaning what they think it means.",
      slugs: ["product-sales-analysis-i", "combine-two-tables", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "The delivery funnel & kept demand",
      why: "The funnel is four numerators over one population: 52 delivered, 30 shipped, 14 pending, 7 cancelled. The cancel-share read (6.8% network-wide, 8.1% APAC) is a conditional count — SUM over a 1/0 flag beside COUNT(*) — and filtering status in WHERE first silently zeroes every cluster's denominator.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Cloud clusters at two grains",
      why: "Every ops review opens with the two-grain census: deliveries AND customers per cluster in one row — 45 from 8 in the EU, 19 from 2 in the US. COUNT(*) counts rows, COUNT(DISTINCT customer_id) folds repeat demand back to people, and the interviewer grades whether you know which column is which.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "find-followers-count"],
    },
    {
      name: "Basket-value baselines & minimums",
      why: "Basket minimums are a Gopuff fixture, and the fee conversation is judged against the network baseline: 34,833.28 over 103 = 338.19, with a 25.47 floor. Screens drill the scalar-subquery shape — fold the whole book once, judge every basket against it — because the baseline you fold IS the definition.",
      slugs: ["basket-depth-aov", "find-expensive-cities", "market-analysis-i"],
    },
    {
      name: "Shelf cover & substitution",
      why: "Own-inventory means stockouts are Gopuff's problem: remaining cover is stock minus picks per SKU, and the thinnest shelves (14, 15, 17 units) become the substitution list. Screens drill the staged fold — aggregate picks to SKU grain first, then diff against stock — because the 103-to-251 fan-out breaks every row-wise shortcut.",
      slugs: ["find-stores-with-inventory-imbalance", "warehouse-manager", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "Supplier concentration & the bench",
      why: "The clouds buy inventory outright, so supplier risk is balance-sheet risk: Nordic Gadgets AB at 32% of shelf revenue, Midwest at 26.7%, and a trusted bench cut at rating 4.5+. Screens drill per-supplier folds with a listings count that must survive the pick fan-out — COUNT(DISTINCT p.id), not COUNT(*).",
      slugs: ["sales-analysis-ii", "products-worth-over-invoices", "sellers-with-no-sales"],
    },
    {
      name: "Rank trio for shelf leaderboards",
      why: "Shelf reporting is leaderboard reporting: SKUs by velocity, clusters by basket value. The units ladder ties constantly — two SKUs at 36 picks, three at 30 — and ROW_NUMBER, RANK and DENSE_RANK differ exactly there. Gopuff drills the trio until the tie policy is a sentence you say out loud.",
      slugs: ["rank-scores", "top-earners", "second-highest-salary"],
    },
    {
      name: "Month buckets & the replenishment spine",
      why: "The clouds reorder on a monthly cadence, and the buying calendar hangs on the month spine: STRFTIME('%Y-%m', created_at) over placed deliveries, 2024-01's 3,731.97 down to 2024-07's 1,193.86 trough. The house rule: bucket demand on placed-time, service on completion-time, and never confuse the two clocks.",
      slugs: ["monthly-transactions-i", "restaurant-growth", "the-latest-login-in-2020"],
    },
    {
      name: "One-pass censuses for shift handover",
      why: "Delivery-partner shifts hand over on one screen: the whole funnel, the aging buckets and the thin-shelf list, each in a single scan. FILTER (WHERE …) and conditional SUM build the census in one pass, with branch totals that must reconcile to COUNT(*) = 103 before the board ships.",
      slugs: ["active-businesses", "ratings-histogram", "count-the-number-of-experiments"],
    },
    {
      name: "Settlement cents & the anti-join reflex",
      why: "Settlement ops lives on absence: 6 statements with no payment row = 15,217.00, and one of them (#28) is marked paid — a status filter misses it, an anti-join doesn't. Money is INTEGER cents, so every dollar read divides by 100.0 exactly once, at the display edge.",
      slugs: ["customers-who-never-order", "number-of-accounts-that-did-not-stream", "bank-account-summary-ii"],
    },
  ],

  theory: [
    {
      id: "gopuff-t1",
      q: "A delivery fans into pick lines — 103 deliveries become 251 picks after the join. Walk me through what changes at the grain, and what COUNT(*) counts on each side.",
      a: "Before the join, the row grain is the delivery: COUNT(*) reads 103 and every order-level column is truthful. After joining order_items, the grain is the pick: COUNT(*) reads 251, and any orders column — total, status, created_at — now repeats once per pick line, so SUM(o.total) inflates roughly 2.44x unless you fold first. The fixes are grain discipline, not cleverness: fold picks to delivery grain in a derived table (line counts and pick value per order_id), then join; or count at two grains in one query — COUNT(DISTINCT o.id) for deliveries beside COUNT(*) for picks. At Gopuff this is the daily fabric: the shelf team reads picks, the ops team reads deliveries, and the same query serves both only if every count announces its grain. Saying 'one row per what?' before each COUNT is the habit the screen is grading.",
      tag: "joins",
    },
    {
      id: "gopuff-t2",
      q: "The funnel board shows delivered 52, shipped 30, pending 14, cancelled 7. How do you build that in one pass, and where do the denominators live?",
      a: "One scan over orders, four conditional branches: COUNT(*) FILTER (WHERE status = 'delivered') — or SUM(CASE WHEN status = … THEN 1 ELSE 0 END) per arm — beside a bare COUNT(*) as the reconciliation anchor. The discipline is that all four branches share one denominator, the 103 placed deliveries, and the branches must sum back to it: 52 + 30 + 14 + 7 = 103, and a total of 102 means a state is falling through an ELSE nobody wrote. The rates ride the same fold — cancel share is 100.0 * 7 / 103 = 6.8% network-wide, 8.1% in APAC — with the multiplier forcing real division before truncation. What I refuse is four separate queries with four slightly different WHERE clauses: at Gopuff the funnel ships as one fold precisely so its branches can't drift apart, and the reviewer checks the sum before reading any single number.",
      tag: "aggregation",
    },
    {
      id: "gopuff-t3",
      q: "The shelf velocity ladder has a two-way tie at 36 picks and a three-way tie at 30. Which rank function does the board want, and what does each of the three actually print?",
      a: "The three functions agree until the first tie and diverge exactly there. ROW_NUMBER prints 1,2,3… with an arbitrary order inside ties — a ladder that claims a winner it can't defend. RANK gives tied rows the same rank and skips: 47, 46, 38, then 4, 4 at the 36-tie and 6 next — the gap implies a fifth SKU that doesn't exist. DENSE_RANK gives ties the same rank without the gap: the 36-pair shares 4 and the next distinct value reads 5 — the shelf ladder's honest shape, because two SKUs that sold identically should share a rung. At Gopuff I'd write DENSE_RANK() OVER (ORDER BY picks DESC) with an explicit tie-breaker (product_id) for reproducibility, and say the policy out loud: ties share a rung, no gaps, display order deterministic. 'Exactly N rows' versus 'everyone at rank N' is a merch decision someone has to own — the function choice IS that decision.",
      tag: "windows",
    },
    {
      id: "gopuff-t4",
      q: "shipped_at is NULL until a delivery completes. What do COUNT(*), COUNT(shipped_at) and the aging AVG each return, and which one feeds the shift board?",
      a: "COUNT(*) counts placed deliveries — 103, including the 14 pending and 7 cancelled. COUNT(shipped_at) counts non-NULL values — the 82 completed (52 delivered + 30 shipped); the gap between the two numbers IS the open-queue picture, and reporting only one hides either demand or exposure. AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) skips NULLs by construction and reads 2.98 days over that same 82 — which is exactly the population the shift board wants, because a delivery in the queue has no age yet, not zero age. What I refuse is COALESCE-ing the NULL to a default: a pending delivery with invented zero latency flatters the slowest cloud and lies about the promise. The honest query states its population — *82 completed of 103 placed* — and the 21 open ones go to the chase list, not the latency histogram.",
      tag: "nulls",
    },
    {
      id: "gopuff-t5",
      q: "The supplier bench filters to rating 4.5+, and the listings count needs DISTINCT after the join to picks. Walk the pipeline — where does each decision live, and why?",
      a: "Pipeline order decides everything: FROM joins suppliers to products to picks, WHERE applies the row-level rating filter (s.rating >= 4.5 — a fact about one row, so it filters before any folding), GROUP BY s.id folds, HAVING would judge group-level facts like listing counts, SELECT builds the output, ORDER BY sorts. The DISTINCT is a fan-out fix, not a filter: the join to picks fans each listing across its sold rows, so COUNT(p.id) reads pick lines (43) where the bench wants shelves (3) — COUNT(DISTINCT p.id) folds back to catalog grain. And the alias rule rides the same pipeline: an alias born in SELECT resolves in ORDER BY but not in WHERE, which is why the rating predicate uses the raw column. The habit being graded: every clause gets placed by asking 'is this a fact about one row, one group, or the display?' — not by pattern-matching a template.",
      tag: "pipeline",
    },
    {
      id: "gopuff-t6",
      q: "The fee team wants every delivery judged against the network's average basket. Why a scalar subquery instead of hardcoding 338.19 — and what happens if the inner query comes back empty?",
      a: "Because the baseline must be computed, not pinned: (SELECT AVG(total) FROM orders) folds the whole book once — 34,833.28 over 103 = 338.19 — and the outer query judges each basket against that single number. Hardcoding works today and breaks the moment a delivery lands; the scalar subquery is self-maintaining and honest about being a definition. The contract is 0-or-1 rows, 1 column: one row joins the comparison, and zero rows yield NULL — not an error — so every comparison against it is UNKNOWN and the report silently returns nothing. On this table that's theoretical (103 deliveries always produce an average), but on a filtered staging table — one cluster, one month — the empty-inner-query bug ships regularly. The correlated cousin re-runs per row and answers 'above MY household's own average', a different question at a different cost; saying which population the inner fold covers is the follow-up the interviewer is fishing for.",
      tag: "subqueries",
    },
    {
      id: "gopuff-t7",
      q: "Gopuff is famous for late-night demand — pull me the 2am cohort from this db.",
      a: "I can't, and saying why IS the answer. created_at here stores DATE-only values — '2024-01-05', no time component — so STRFTIME('%H', created_at) reads '00' for all 103 rows: any hour-of-day cohort from this table is a fabrication. The honest reply states the grain and offers the real path: time-of-day lives in the event feed (order-placed timestamps, courier pings), so the 2am cohort is a join against that feed, not this table. What this table does support: the month spine via STRFTIME('%Y-%m') or SUBSTR(created_at, 1, 7) — 2024-01's 3,731.97 down to 2024-07's 1,193.86 — and completion aging via JULIANDAY(shipped_at) - JULIANDAY(created_at), which averages 2.98 DAYS here on a 2..4 range and reads the identical expression in minutes on the production courier stream. The interviewer isn't testing whether you can write STRFTIME — they're testing whether you check what a column actually stores before you build a KPI on it.",
      tag: "dates",
    },
    {
      id: "gopuff-t8",
      q: "Statement #28 is marked paid but has zero payment rows; #11 is void yet carries a 925.00 payment. How do you find these, and what does the ledger tie tell you?",
      a: "Both are absence-versus-label bugs, and a status filter can't see either. #28 needs the anti-join: LEFT JOIN the per-statement payment fold (SUM(amount_cents) GROUP BY invoice_id) and keep the NULL arm — six statements with no settlement, 15,217.00 after the /100.0, and #28 sails past WHERE status = 'open' precisely because its label says paid. #11 is the mirror: a void status carrying a 925.00 payment — found by joining the fold back and comparing status to coverage, or by flagging paid_cents > 0 on voided statements. The ledger tie — 181,080 debits against 181,080 credits, delta 0 — tells you the books BALANCE, so these are classification errors, not missing money: the chase is a label fix and a dunning letter, not a cash hunt. Money is integer cents, so every dollar figure divides by 100.0 exactly once at the display edge — and the split-payment statements (#1, #5, #12, #19, #22) mean the fold must SUM per statement before any comparison, never trust one row per invoice.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "gopuff-mcq-1",
      prompt: "orders joins order_items: 103 deliveries fan into 251 pick lines. What does COUNT(*) return on the joined rows?",
      choices: [
        "251 — one row per pick line",
        "103 — joins never change row counts",
        "354 — the two tables add up",
        "NULL — the join is ambiguous",
      ],
      answer: 0,
      why: "The join fans each delivery across its picks: 251 rows at pick grain. To count deliveries again you need COUNT(DISTINCT o.id) — or fold picks to delivery grain before joining.",
      notes: [
        { choice: 1, why: "Joins absolutely change row counts when they fan out — this is the first grain lesson of the pick table, and the one every shelf report depends on." },
        { choice: 2, why: "Nothing adds — the 103 order rows each duplicate per pick. 354 isn't a number any fold here produces." },
      ],
      difficulty: "easy",
    },
    {
      id: "gopuff-mcq-2",
      prompt: "82 of 103 deliveries carry a completion timestamp. What does COUNT(shipped_at) return over all deliveries?",
      choices: ["82", "103", "0", "NULL"],
      answer: 0,
      why: "COUNT(column) counts non-NULL values only — the 82 completed deliveries (52 delivered + 30 shipped). COUNT(*) would count all 103, including the 14 pending and 7 cancelled that have no completion yet.",
      notes: [
        { choice: 1, why: "That's COUNT(*), a different function. The gap between 103 and 82 IS the open-queue picture — the number the shift board watches." },
        { choice: 3, why: "COUNT never returns NULL — with zero non-NULL rows it returns 0. Here 82 rows guarantee a real count." },
      ],
      difficulty: "easy",
    },
    {
      id: "gopuff-mcq-3",
      prompt: "An analyst runs STRFTIME('%H', created_at) hunting the late-night cohort and gets '00' for every one of the 103 rows. Why?",
      choices: [
        "created_at stores DATE-only values — midnight by default; time-of-day lives in the event feed, not this table",
        "The %H format token is wrong — it should be %hour",
        "All Gopuff orders genuinely happen at midnight",
        "STRFTIME only returns hours in UTC",
      ],
      answer: 0,
      why: "The column is '2024-01-05' — a date with no time component, so every row parses to hour 00. The honest answer is a statement about grain: the 2am cohort needs the order-event feed, not this table.",
      notes: [
        { choice: 1, why: "%H is the correct hour token — the query is fine, the data doesn't carry the answer. Building a late-night KPI here fabricates demand." },
        { choice: 2, why: "A fleet-wide midnight monoculture isn't plausible — and the probed date range confirms date-only storage, not a scheduling anomaly." },
      ],
      difficulty: "easy",
    },
    {
      id: "gopuff-mcq-4",
      prompt: "Which expression folds sold revenue per FC supplier so Nordic Gadgets AB reads its probed 11,130.25?",
      choices: [
        "SUM(oi.unit_price * oi.quantity)",
        "SUM(p.price)",
        "SUM(oi.quantity)",
        "COUNT(p.id) * p.price",
      ],
      answer: 0,
      why: "Sold revenue is price-times-quantity per pick line, summed per supplier — 11,130.25 for Nordic. SUM(p.price) folds catalog list prices (5,742.74) — a different question about the shelf, not the sales.",
      notes: [
        { choice: 1, why: "Catalog price ignores what actually sold and at what line price — the bench would read the shelf's sticker value, off by thousands." },
        { choice: 2, why: "That's unit volume (Nordic's SKUs moved 97+ units across lines), not dollars — the concentration board needs money." },
      ],
      difficulty: "medium",
    },
    {
      id: "gopuff-mcq-5",
      prompt: "7 of 103 deliveries are cancelled. Which expression prints the network cancel share as 6.8?",
      choices: [
        "100 * SUM(status = 'cancelled') / COUNT(*)",
        "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*)",
        "AVG(status)",
        "COUNT(status = 'cancelled') / 103",
      ],
      answer: 1,
      why: "The conditional sum counts cancellations at the same fold as COUNT(*) counts placements, and 100.0 forces real division before truncation. Both guards — same-grain denominator, float promotion — in one expression.",
      notes: [
        { choice: 0, why: "SQLite accepts the 0/1 flag, but the INTEGER 100 forces integer division: 100 * 7 = 700, 700 / 103 truncates to 6 — and shares under 1% collapse to 0 entirely." },
        { choice: 3, why: "COUNT over a boolean expression counts non-NULL results — essentially every row — so the numerator reads 103, not 7." },
      ],
      difficulty: "medium",
    },
    {
      id: "gopuff-mcq-6",
      prompt: "After suppliers → products → order_items, COUNT(p.id) reads 43 for Nordic's 3 listings. What fixes the listings fold?",
      choices: [
        "COUNT(DISTINCT p.id)",
        "COUNT(DISTINCT oi.id)",
        "LIMIT 3",
        "GROUP BY p.id instead of s.id",
      ],
      answer: 0,
      why: "The join to picks fans each listing across its sold rows; DISTINCT p.id folds back to catalog grain — 3 for Nordic, 2 for Alpine. COUNT(DISTINCT oi.id) just counts pick lines again: the same wrong 43 with a different alias.",
      notes: [
        { choice: 1, why: "Distinct pick ids ≠ distinct products — Nordic has far more sold lines than listings. The fold key has to be the thing you're counting: products." },
        { choice: 3, why: "Regrouping by product produces one row per SKU, not a per-supplier listing count — the bench loses its supplier grain entirely." },
      ],
      difficulty: "medium",
    },
    {
      id: "gopuff-mcq-7",
      prompt: "Remaining cover per SKU = stock minus units picked. Which shape survives the 103→251 pick fan-out?",
      choices: [
        "p.stock - SUM(oi.quantity), grouped by p.id",
        "p.stock - oi.quantity",
        "SUM(p.stock - oi.quantity)",
        "p.stock - MAX(oi.quantity)",
      ],
      answer: 0,
      why: "Group by SKU and subtract the folded pick total: 60 - 46 = 14 for the Headset, 45 - 30 = 15 for the Mic. The aggregate folds the fan-out first; everything else compares stock against one arbitrary pick row.",
      notes: [
        { choice: 1, why: "Row-wise subtraction compares stock to a single pick's quantity — the Headset would read 60 - q over and over, once per pick line, none of them cover." },
        { choice: 2, why: "Summing the row-wise differences multiplies the error by the pick count — a bigger, wronger number per line, not a per-SKU fold." },
      ],
      difficulty: "hard",
    },
    {
      id: "gopuff-mcq-8",
      prompt: "The velocity ladder reads 47, 46, 38, 36, 36, 33, 31, 30, 30, 30, 28… With DENSE_RANK() OVER (ORDER BY picks DESC), what rank does the 28-pick SKU wear?",
      choices: ["8", "11", "9", "4"],
      answer: 0,
      why: "DENSE_RANK numbers distinct values: 47, 46, 38, 36, 33, 31, 30 are seven distinct levels, so the next value takes rank 8. RANK would print 11 — ten tied-or-earlier rows stand before it — and the three-way tie at 30 shares rank 7 either way.",
      notes: [
        { choice: 1, why: "That's RANK's answer — row-count-based, gaps kept. DENSE_RANK exists precisely to compact those gaps for shelf ladders where ties share a rung." },
        { choice: 2, why: "There's no row at 9 under DENSE_RANK — after the 30-tie at rank 7, the very next distinct value is 8. Nine would need an eighth distinct value before 28." },
      ],
      difficulty: "hard",
    },
    {
      id: "gopuff-mcq-9",
      prompt: "The unpaid settlement queue sums to 1,521,700 cents. A teammate reports '$1,521,700.00 of exposure' to the CFO. What happened?",
      choices: [
        "Skipped the /100.0 — integer cents printed as dollars, a 100x phantom",
        "Rounded twice — once in SUM, once in display",
        "SUM ignores NULLs, inflating the total",
        "The queue double-counts split settlements",
      ],
      answer: 0,
      why: "Invoices and payments store INTEGER cents; the honest figure is 1,521,700 / 100.0 = 15,217.00 dollars across the 6 unsettled statements. The missing division is a 100x incident — the classic settlement-ops bug.",
      notes: [
        { choice: 2, why: "SUM skipping NULLs is correct behavior here — the queue has no payment rows to skip. The error is unit conversion, not aggregation." },
        { choice: 3, why: "The queue counts statements (6), not payment rows — splits live on the paid side of the book. Nothing doubles; the unit was wrong." },
      ],
      difficulty: "medium",
    },
    {
      id: "gopuff-mcq-10",
      prompt: "Which shape finds every settlement statement whose money never landed — including #28, which is marked paid?",
      choices: [
        "LEFT JOIN the per-statement payment fold … WHERE the fold is NULL",
        "WHERE status = 'open'",
        "WHERE status != 'paid'",
        "INNER JOIN payments on invoice_id",
      ],
      answer: 0,
      why: "Absence needs the anti-join: fold payments per statement, LEFT JOIN back, keep the NULL arm — 6 statements, 15,217.00, with #28 included because the evidence (zero payment rows) outranks the label. Status filters can't see absence.",
      notes: [
        { choice: 1, why: "#28 is marked paid, so the open filter excludes it — the anomaly sails through the queue untouched. That's exactly why the fold exists." },
        { choice: 3, why: "An INNER join keeps only matched statements — it deletes the unpaid queue you were hunting and reports a clean books lie." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-gopuff-1",
      tier: "hard",
      topic: "j7",
      universe: "supplier",
      title: "The trusted FC-supplier bench",
      brief:
        "Buying-team memo, Gopuff-flavored on the storefront db: the clouds buy inventory outright, so vendor risk is Gopuff's risk — and every negotiation opens with the trusted bench: FC suppliers rated **4.5+**, with their listing count and sold revenue. Probed fold: Nordic Gadgets AB — rating **4.6**, 3 listings, **11,130.25** sold revenue (32% of the network); Alpine Audio GmbH — 4.8, 2 listings, 4,765.63. The listings fold is the trap: the join to picks fans each listing across its sold lines, so a bare COUNT reads 43 and 40 — *the bench wants shelves, not pick lines*. Midwest Hardware Co (4.4) and the rest wait outside the rating gate.",
      ask: "Return the bench: supplier, rating, listings, sold revenue (2 decimals) — biggest revenue first, rating 4.5+ only.",
      template:
        "SELECT s.name,\n       s.rating,\n       COUNT({1} p.id) AS listings,\n       ROUND(SUM({2}), 2) AS revenue\nFROM suppliers s\nJOIN products p ON {3}\nJOIN order_items oi ON oi.product_id = p.id\nWHERE s.rating >= {4}\nGROUP BY s.id\nORDER BY revenue {5}",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the shelf grain",
          why: "The join to picks fans Nordic's 3 SKUs across 43 sold lines. COUNT(DISTINCT p.id) folds back to shelves — 3 and 2, the numbers the catalog and the buying team agree on. Bare COUNT(p.id) prints 43 and 40, and nobody can reconcile the bench to the shelf.",
        },
        {
          answer: "oi.unit_price * oi.quantity",
          kind: "keyword",
          label: "the sold-revenue fold",
          why: "Revenue is what the picks sold: unit price times quantity per line, summed — 11,130.25 and 4,765.63, the probed bench figures. SUM(p.price) folds catalog list prices (5,742.74 / 2,503.76) — a different question wearing the same name.",
        },
        {
          answer: "s.id = p.supplier_id",
          kind: "keyword",
          label: "the supplier stitch",
          why: "Products reference their supplier by supplier_id, so the stitch is s.id = p.supplier_id. Join on s.id = oi.product_id and suppliers pair with whatever SKU shares their row id — the fold becomes a coincidence and every bench number is wrong with no error.",
        },
        {
          answer: "4.5",
          kind: "number",
          label: "the bench threshold",
          noVerify: true,
          why: "The trusted bench is defined at 4.5: Nordic 4.6 and Alpine 4.8 clear it; Midwest 4.4, Shenzhen 4.1, Andes 4.0 and Pacific 3.9 wait outside. The threshold never prints in the result — the cells carry 4.6 and 4.8 — which is why it's a definition someone signs.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "Negotiations open at the top of the bench: Nordic 11,130.25, then Alpine 4,765.63. ASC opens on the smallest supplier — a correct query that spends the room's ten minutes running backwards.",
        },
      ],
      distractors: ["SUM", "p.price", "s.id = oi.product_id", "4.8", "4", "ASC"],
      walkthrough:
        "A bench is a stitch, a fan-out fix, a fold and a threshold. Three tables join: suppliers to products on s.id = p.supplier_id, products to picks on oi.product_id = p.id — and the pick join fans 16 SKUs into 251 sold lines, so the listings fold must fold BACK: COUNT(DISTINCT p.id) reads 3 for Nordic and 2 for Alpine, where bare COUNT(p.id) reads 43 and 40 (pick lines, not shelves) and COUNT(DISTINCT oi.id) reads the same wrong numbers. Revenue folds SUM(oi.unit_price * oi.quantity) — 11,130.25 and 4,765.63, the probed bench figures; SUM(p.price) answers the catalog-price question (5,742.74 / 2,503.76) instead. WHERE s.rating >= 4.5 keeps exactly the two trusted suppliers — drop the gate to 4 and Midwest, Shenzhen and Andes crash the bench; raise it to 4.8 and Nordic vanishes from its own negotiation. ORDER BY revenue DESC opens the meeting at the top. *Shelves, sold dollars, one signed threshold — and every count reconciles to a catalog you can count on your fingers.*",
    },
    {
      id: "cs-gopuff-2",
      tier: "easy",
      topic: "t4",
      universe: "growth",
      title: "The replenishment month spine",
      brief:
        "Demand-planning memo, Gopuff-flavored on the storefront db: the clouds reorder on a monthly cadence, and the buying calendar opens with the delivery spine — deliveries and basket value per month, month-keyed, chronological, gated at a real month (at least **7** deliveries) so a stub can't pose as a trend. Probed fold: fourteen months from **2024-01** (8 deliveries / 3,731.97) to **2025-02** (7 / 2,390.53), trough at 2024-07 (6 / 1,193.86). Three months — 2024-06, 2024-11, 2025-01 — sit at exactly 6 deliveries and wait outside the gate. Month keys come from `STRFTIME('%Y-%m', created_at)` — demand buckets on placed-time, never completion-time.",
      ask: "Return the replenishment spine: month, deliveries, basket_value (2 decimals) — chronological, months with 7+ deliveries only.",
      template:
        "SELECT STRFTIME('%Y-%m', {1}) AS month,\n       COUNT(*) AS deliveries,\n       ROUND(SUM({2}), 2) AS basket_value\nFROM orders\nGROUP BY month\nHAVING COUNT(*) >= {3}\nORDER BY month {4}",
      slots: [
        {
          answer: "created_at",
          kind: "keyword",
          label: "the demand clock",
          why: "Deliveries are counted at placed-time: STRFTIME buckets created_at into '2024-01'…'2025-02'. Bucket shipped_at instead and the spine re-keys to completion-time — the 21 never-completed deliveries collapse into one NULL month and the buying calendar drifts.",
        },
        {
          answer: "total",
          kind: "keyword",
          label: "the value column",
          why: "Basket value folds o.total — 3,731.97 in the opening month — in dollars with no cents conversion (orders are REAL). SUM(status) folds status text to 0.00 and SUM(shipped_at) folds timestamps to 0.00: numeric-looking garbage on every row.",
        },
        {
          answer: "7",
          kind: "number",
          label: "the real-month gate",
          why: "The gate keeps the eleven months with at least 7 deliveries; the three six-delivery months (2024-06, 2024-11, 2025-01) wait outside. Loosen to 6 and all fourteen clear it; tighten to 8 and the trough months vanish — the gate is the signed definition of 'a real month', and 7 appears in the deliveries column itself.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the calendar direction",
          why: "A buying calendar reads chronologically: 2024-01 first, 2025-02 last. DESC opens at the newest month — fine for a recap, wrong for the replenishment plan the meeting exists to walk forward through.",
        },
      ],
      distractors: ["shipped_at", "status", "6", "DESC", "MAX"],
      walkthrough:
        "A spine is one bucket key, one fold, one gate, one direction. STRFTIME('%Y-%m', created_at) turns 103 placed deliveries into fourteen month keys — 2024-01 through 2025-02 — and COUNT(*) counts them: 8, 9, 8, 7, 8, 6, 8, 7, 9, 7, 6, 7, 6, 7. The value fold is SUM(total) rounded once: 3,731.97 opening, 1,193.86 at the 2024-07 trough, 2,390.53 closing. The HAVING gate at 7 keeps the eleven months that clear the bar — the three six-delivery months wait outside, and the gate number is signed precisely because 6 versus 7 decides whether a stub month poses as a trend; the correct fill's own result carries 7s in the deliveries column, so the gate audits against its own output. ORDER BY month ASC reads the calendar forward. Swap the clock to shipped_at and the spine re-keys to completion-time, dragging one NULL month into a demand calendar; swap the fold to status and every month reads 0.00. *Bucket demand on placed-time, gate on a signed bar, read forward — the spine the whole buying calendar hangs from.*",
    },
  ],

  problems: [
    { slug: "group-sold-products-by-the-date", why: "The daily pick manifest: every cloud's picks folded into one comma cell per day — the printout the floor lead pins up at shift start." },
    { slug: "product-sales-analysis-ii", why: "Per-SKU pick totals — the velocity fold behind every reorder decision before the weekend late-night surge hits the shelf." },
    { slug: "immediate-food-delivery-iii", why: "Instant-promise share per month — the delivery-mode mix Gopuff reads when it tunes the promise by market, computed at month grain." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "The substitution audit: households that needed A, got B, and never came back for A — cross-aisle pairing at basket grain, not asserted at deck grain." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Each household's habitual SKU — the argmax behind the 'your usual is out' substitution prompt, tie-proofed at person grain." },
    { slug: "weeks-of-supply", why: "Cover weeks per SKU — own-inventory buying means Gopuff owns every stockout, so this trailing-rate fold IS the reorder trigger." },
    { slug: "top-travellers", why: "The household spend ladder — cumulative value per customer, ranked: the head of the board the late-night regulars own." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one fold with the 100.0-before-division fix — the honest-denominator drill behind every funnel and cancel-share read." },
    { slug: "keep-latest-dedupe", why: "Household profile changes arrive as multiple rows — keep-latest per key before the delivery app trusts an address at 2am." },
    { slug: "spend-histogram", why: "Basket-value bands — the small-basket-fee conversation: where the 25.47 floor sits against the 338.19 average, banded not averaged." },
    { slug: "trial-balance-check", why: "Debits equal credits in one conditional SUM — the ledger tie (181,080 both sides, delta 0) that decides whether a break is balance or classification." },
    { slug: "find-golden-hour-customers", why: "Households whose second delivery lands inside the window — the repeat clock that decides which first baskets get the nudge." },
    { slug: "average-time-of-process-per-machine", why: "Completion aging per unit — pick to completion folded per cloud, NULLs excluded by construction: the courier-shift stand-in." },
    { slug: "movie-rating", why: "The multi-part report: argmax by one rule, per-person folds by another — composition under pressure for the screen's final act." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Picks whose quantity beats the network average — the bulk-basket flag computed against one scalar baseline, not a per-cloud accident." },
    { slug: "trips-and-users", why: "Cancelled share with exclusion windows — the two-sided classic behind the cancel board, where the denominator keeps trying to escape to completed deliveries." },
  ],
};
