// Gopuff — kit of the Food & Quick-commerce domain (Wave-8, Task 96).
// Wave-8 (Task 96), food domain, 0 tagged LC — theme-curated; facts from
// scripts/company-facts.md. Gopuff is instant delivery the first-party way:
// it owns the inventory (no marketplace), stocks micro-fulfillment clouds
// blocks from the customer, runs delivery-partner shifts, lives on late-night
// demand peaks, enforces basket minimums, and substitutes when the shelf runs
// dry. 0 tagged LC problems in company-pools.md — the pool is FULLY
// theme-curated from the SQL band (32 problems, topic spine below), every one
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
    "Prep like a cloud-ops analyst, not a generic SQL student. Gopuff has **no tagged pool** in this app's registry, so the kit curates **thirty-two problems** from the SQL band — theme-curated, each mirroring a real workflow: pick manifests, substitution pairings, cover-weeks folds, cancel-share boards. Drill the fan-out join until COUNT(DISTINCT …) is a reflex, conditional aggregation for the funnel, scalar-subquery baselines against the 338.19 average, and the settlement anti-join through `LEFT JOIN … IS NULL`. Then run the six case studies on the live db: the trusted supplier bench, the replenishment month spine, the shelf-cover thin list, the velocity ladder front page, the pick manifest, and the one-pass handover census — *and on every screen, the population sentence comes before the FROM clause*.",
    "This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the asks Gopuff screens rehearse most: the supplier bench with its fan-out-proof listings fold, the month spine with its real-month gate, the substitution list staged through a derived table, the tie-respecting velocity ladder, the GROUP_CONCAT pick manifest, and the one-row handover census. Run each on the live storefront database, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the theory bank below, and treat the walkthroughs as the real content: they narrate the failure each wrong chip causes, which is exactly the muscle the one-row-per-what follow-up tests.",
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
      slugs: ["product-sales-analysis-i", "combine-two-tables", "replace-employee-id-with-unique-identifier", "product-sales-analysis-iv", "product-sales-analysis-v", "customers-who-bought-all-products", "customers-who-bought-a-and-b-not-c", "movie-rating"],
    },
    {
      name: "The delivery funnel & kept demand",
      why: "The funnel is four numerators over one population: 52 delivered, 30 shipped, 14 pending, 7 cancelled. The cancel-share read (6.8% network-wide, 8.1% APAC) is a conditional count — SUM over a 1/0 flag beside COUNT(*) — and filtering status in WHERE first silently zeroes every cluster's denominator.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest", "customer-who-visited-but-did-not-transact", "immediate-food-delivery-iii"],
    },
    {
      name: "Cloud clusters at two grains",
      why: "Every ops review opens with the two-grain census: deliveries AND customers per cluster in one row — 45 from 8 in the EU, 19 from 2 in the US. COUNT(*) counts rows, COUNT(DISTINCT customer_id) folds repeat demand back to people, and the interviewer grades whether you know which column is which.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "find-followers-count", "queries-quality-and-percentage"],
    },
    {
      name: "Basket-value baselines & minimums",
      why: "Basket minimums are a Gopuff fixture, and the fee conversation is judged against the network baseline: 34,833.28 over 103 = 338.19, with a 25.47 floor. Screens drill the scalar-subquery shape — fold the whole book once, judge every basket against it — because the baseline you fold IS the definition.",
      slugs: ["basket-depth-aov", "find-expensive-cities", "market-analysis-i", "calculate-product-final-price", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Shelf cover & substitution",
      why: "Own-inventory means stockouts are Gopuff's problem: remaining cover is stock minus picks per SKU, and the thinnest shelves (14, 15, 17 units) become the substitution list. Screens drill the staged fold — aggregate picks to SKU grain first, then diff against stock — because the 103-to-251 fan-out breaks every row-wise shortcut.",
      slugs: ["find-stores-with-inventory-imbalance", "warehouse-manager", "list-the-products-ordered-in-a-period", "fifo-inventory-cogs", "unpopular-books", "fix-product-name-format"],
    },
    {
      name: "Supplier concentration & the bench",
      why: "The clouds buy inventory outright, so supplier risk is balance-sheet risk: Nordic Gadgets AB at 32% of shelf revenue, Midwest at 26.7%, and a trusted bench cut at rating 4.5+. Screens drill per-supplier folds with a listings count that must survive the pick fan-out — COUNT(DISTINCT p.id), not COUNT(*).",
      slugs: ["sales-analysis-ii", "products-worth-over-invoices", "sellers-with-no-sales", "sales-analysis-iii", "group-sold-products-by-the-date", "trial-balance-check"],
    },
    {
      name: "Rank trio for shelf leaderboards",
      why: "Shelf reporting is leaderboard reporting: SKUs by velocity, clusters by basket value. The units ladder ties constantly — two SKUs at 36 picks, three at 30 — and ROW_NUMBER, RANK and DENSE_RANK differ exactly there. Gopuff drills the trio until the tie policy is a sentence you say out loud.",
      slugs: ["rank-scores", "top-earners", "second-highest-salary", "the-most-recent-three-orders", "second-most-recent-activity", "product-sales-analysis-ii", "keep-latest-dedupe"],
    },
    {
      name: "Month buckets & the replenishment spine",
      why: "The clouds reorder on a monthly cadence, and the buying calendar hangs on the month spine: STRFTIME('%Y-%m', created_at) over placed deliveries, 2024-01's 3,731.97 down to 2024-07's 1,193.86 trough. The house rule: bucket demand on placed-time, service on completion-time, and never confuse the two clocks.",
      slugs: ["monthly-transactions-i", "restaurant-growth", "the-latest-login-in-2020", "product-price-at-a-given-date", "most-frequently-ordered-product-per-customer", "spend-histogram", "average-time-of-process-per-machine", "orders-with-maximum-quantity-above-average"],
    },
    {
      name: "One-pass censuses for shift handover",
      why: "Delivery-partner shifts hand over on one screen: the whole funnel, the aging buckets and the thin-shelf list, each in a single scan. FILTER (WHERE …) and conditional SUM build the census in one pass, with branch totals that must reconcile to COUNT(*) = 103 before the board ships.",
      slugs: ["active-businesses", "ratings-histogram", "count-the-number-of-experiments", "occupations-pivot", "calculate-special-bonus", "top-travellers"],
    },
    {
      name: "Settlement cents & the anti-join reflex",
      why: "Settlement ops lives on absence: 6 statements with no payment row = 15,217.00, and one of them (#28) is marked paid — a status filter misses it, an anti-join doesn't. Money is INTEGER cents, so every dollar read divides by 100.0 exactly once, at the display edge.",
      slugs: ["customers-who-never-order", "number-of-accounts-that-did-not-stream", "bank-account-summary-ii", "bank-account-summary", "trips-and-users"],
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
    {
      id: "gopuff-t9",
      q: "The settlement queue is 'statements whose money never landed' — including #28, which is marked paid. When does an anti-join see what a status filter can't, and what does an INNER join do here?",
      a: "Absence is invisible to status: #28's label says paid, so WHERE status = 'open' sails it straight past the queue. The anti-join reads the evidence instead — LEFT JOIN the per-statement payment fold and keep the arm WHERE p.id IS NULL — and six statements surface at 15,217.00, #28 among them. INNER JOIN is the opposite failure: it keeps only matched statements and deletes the unpaid queue you were hunting, reporting a clean-books lie. On this db the honest zero-population anti-join (customers who never ordered = 0) is the mirror lesson: the SHAPE is the definition, and a 0-row anti-join is a finding, not a bug. Fold payments per statement first (SUM per invoice_id) so split-payment statements don't masquerade as partial absence.",
      tag: "joins",
    },
    {
      id: "gopuff-t10",
      q: "The velocity ladder ties: two SKUs at 36 picks, three at 30. Walk me through what ROW_NUMBER, RANK and DENSE_RANK print, and which one the shelf board gets.",
      a: "The trio agrees until the first tie. ROW_NUMBER numbers arbitrarily inside ties — a ladder that claims a winner it can't defend. RANK shares the rung and skips: 47, 46, 38, then 4, 4 at the 36-pair and 6 next — the gap implies a fifth SKU that doesn't exist. DENSE_RANK shares without skipping: the 36-pair wears 4, the next distinct value reads 5 — the honest shelf ladder. The board gets DENSE_RANK() OVER (ORDER BY picks DESC) with product_id as a deterministic tie-breaker for reproducibility, and the policy said out loud: ties share a rung, no gaps. 'Exactly N rows' versus 'everyone at rank N' is a merch decision — the function choice IS that decision, and on a 16-SKU shelf ties are structural, not exceptional.",
      tag: "windows",
    },
    {
      id: "gopuff-t11",
      q: "The shift handover opens on one screen: the whole funnel, the aging average, the cancel share. How do you build it in one pass, and how does it prove itself?",
      a: "One scan over orders, conditional arms: COUNT(*) FILTER (WHERE status = …) per state beside a bare COUNT(*) as the anchor, plus the fold-arms — AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) reads 2.98 days over the 82 completed, and the cancel share divides the cancelled arm by the anchor: 100.0 * 7 / 103 = 6.8%. The proof is the sum-back: 52 + 30 + 14 + 7 = 103, and if an arm total comes up one short, a state is falling through an ELSE nobody wrote. FILTER beats three separate queries because every arm shares one population read once — no drift between scans, no data fix landing mid-census. The handover ships with the population sentence printed above the fold, because a census without its population is a rumor with formatting.",
      tag: "aggregation",
    },
    {
      id: "gopuff-t12",
      q: "Your substitution query uses product_id NOT IN (SELECT product_id FROM premium_contracts) and returns nothing. One contract row has a NULL product_id. What happened?",
      a: "The NULL poisoned the NOT IN. For every outer row, x != NULL evaluates to UNKNOWN — never FALSE — so WHERE keeps nothing, and the list empties silently. That's the worst failure mode in the toolkit: no error, no warning, an empty report that looks like a clean shelf. The fixes are structural: guard the inner query (WHERE product_id IS NOT NULL), or switch to NOT EXISTS / LEFT JOIN + IS NULL, which evaluate existence per row and are immune to the poison. I default to NOT EXISTS — correct under NULLs, well-optimized, and it reads as the question it answers. The follow-up an interviewer loves: 'why didn't it error?' — because tri-valued logic makes x != NULL UNKNOWN, and WHERE only keeps TRUE.",
      tag: "nulls",
    },
    {
      id: "gopuff-t13",
      q: "You alias SUM(oi.quantity) AS picked in the SELECT, then try WHERE picked > 20. What happens, and where does each kind of predicate belong?",
      a: "It errors: logical evaluation runs FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, and the alias is born in SELECT — WHERE has never heard of it. The placement discipline follows the pipeline: row predicates filter raw columns before the fold (WHERE shipped_at IS NOT NULL — the population guard), group predicates judge folded facts after it (HAVING SUM(oi.quantity) > 20, or HAVING picked > 20 — HAVING runs after SELECT in SQLite, but the portable habit is folding the expression), and display-level ORDER BY can use aliases freely. The subtlety worth saying out loud: pushing a within-cluster condition into WHERE as a row filter can be a definition change, not an optimization — it can shrink the denominator the fold was supposed to hold. Filter rows before the fold, filter groups after, and never let a WHERE do a HAVING's definitional work.",
      tag: "pipeline",
    },
    {
      id: "gopuff-t14",
      q: "Beyond the network-average basket of 338.19: how do you find deliveries above their OWN cluster's average, and what does the correlated version cost?",
      a: "The correlated subquery: WHERE o.total > (SELECT AVG(i.total) FROM orders i JOIN customers c ON c.id = i.customer_id WHERE c.region = o's-region) — the inner fold re-runs per outer row because the bar depends on which row you're standing on. It answers a different question than the scalar version: 42 baskets clear the network's 338.19, but 'above MY cluster's average' judges US's 19 deliveries against a 19-delivery fold and LATAM's 2 against a 2-delivery fold — small folds are noisy bars, and the report should say so. The cost is N inner scans, though planners cache or decorrelate. The demonstration habit: write the uncorrelated baseline first, correlate, then diff the two answers — the gap is the cluster effect, which is the business story the fee review actually wants.",
      tag: "subqueries",
    },
    {
      id: "gopuff-t15",
      q: "The late-night cohort is Gopuff's signature demand — pull me the 2am orders, and bucket the replenishment spine by month while you're at it.",
      a: "The 2am cohort doesn't exist in this table, and saying so IS the answer: created_at stores DATE-only values — '2024-01-05', no time component — so STRFTIME('%H', created_at) reads '00' for all 103 rows. Any hour-of-day read from this table is a fabrication; time-of-day lives in the event feed, and the honest query joins against that, not this. What the table does support: the month spine via STRFTIME('%Y-%m', created_at) or SUBSTR(created_at, 1, 7) — fourteen buckets, 2024-01's 3,731.97 down to 2024-07's 1,193.86 — and completion aging via JULIANDAY(shipped_at) - JULIANDAY(created_at), which is DAYS here (2.98 average, 2..4 range) and reads the identical expression in minutes on the production courier stream. The interviewer is testing one reflex: check what a column actually stores before building a KPI on it.",
      tag: "dates",
    },
    {
      id: "gopuff-t16",
      q: "The ledger ties — 181,080 debits against 181,080 credits — yet #28 is marked paid with zero payment rows and one statement sits partial at 4,000 of 6,148. What does the tie tell you, and what doesn't it?",
      a: "The tie proves the books balance: every cent is accounted for somewhere, so there is no missing money to hunt. What it can't prove is classification — #28's label says paid while its evidence says zero payment rows (1,756.00), and the partial statement (4,000 of 6,148) is settled in label but short in fact. Those are label-vs-evidence bugs, found by joining the per-statement payment fold back to invoices and comparing: status 'paid' with SUM IS NULL, or paid_cents < billed_cents. The dunning list falls out of the same fold, not from the ledger. The discipline: a balanced ledger is the START of reconciliation, not the end — the tie clears theft and leaves misclassification, which is exactly where the settlement ops team spends its chase time.",
      tag: "quality",
    },
    {
      id: "gopuff-t17",
      q: "The buying calendar wants month-over-month basket value change. Walk me through the LAG shape and what the first row prints.",
      a: "Stage the monthly fold in a CTE — STRFTIME('%Y-%m', created_at) as the month key, ROUND(SUM(total), 2) as the value — then in the outer query read LAG(value) OVER (ORDER BY month) beside the current fold and divide the delta by that same LAG: 2024-01's 3,731.97 opens, February's 3,609.64 prints -3.3%, and the fade to July's 1,193.86 lands at -41.7%. The first row prints NULL, and that's the honest answer — no prior month, no baseline, no percentage. COALESCE-ing it to zero manufactures a flat start someone will quote. Two mechanics: the windows layer on the folded CTE because window output isn't visible to sibling expressions in one SELECT, and ORDER BY month ASC keeps the story chronological — DESC re-anchors every delta to the wrong baseline.",
      tag: "windows",
    },
    {
      id: "gopuff-t18",
      q: "Which SKUs get bought together? Write the pairing query and defend its inequality.",
      a: "The self-join: FROM order_items o1 JOIN order_items o2 ON o1.order_id = o2.order_id AND o1.product_id < o2.product_id, then GROUP BY the pair and COUNT(DISTINCT o1.order_id) for baskets-shared. The strict inequality does double duty: it kills self-pairs (a pick pairing with itself) and mirrored duplicates (A,B appearing again as B,A) — without it the co-occurrence counts roughly double and every SKU pairs with itself. The id comparison is arbitrary but deterministic; what matters is ONE representative per unordered pair. The follow-up layers the product names back on with a join to products, and the ranking (DENSE_RANK over pair counts) feeds the 'bought together' shelf placement. On a 251-pick ledger the pairs are small enough to eyeball; the shape is what scales.",
      tag: "joins",
    },
    {
      id: "gopuff-t19",
      q: "The floor lead wants each basket's picks as one comma-joined cell on the printout. How does GROUP_CONCAT behave, and what do you promise about order?",
      a: "GROUP_CONCAT(p.name, ', ') over the pick join folds 251 lines back to 103 baskets — one row per delivery, manifest attached. The honest caveat: bare GROUP_CONCAT concatenates in engine visitation order, which is no order at all — if pick sequence matters, sort in a staged subquery or use the aggregate's own ORDER BY clause, and say which you did. Two more caveats ride along: long baskets make long cells (decide a truncation policy before the printout does), and a NULL name contributes an empty slot rather than erroring — decide whether NULLs belong in a manifest at all. The deeper lesson is grain: GROUP_CONCAT is the read-side twin of the fold discipline — line grain collapses to basket grain without losing the detail, which is exactly what the floor printout is for.",
      tag: "aggregation",
    },
    {
      id: "gopuff-t20",
      q: "The handover board wants funnel detail rows AND a labelled TOTAL row in one result. How do you stack it, and why not plain UNION?",
      a: "UNION ALL, two branches: the detail fold (one row per status or per cluster, projecting the same columns) and a TOTAL branch that scans the unfiltered population and labels itself with a literal — 'TOTAL' in the name column. UNION ALL concatenates without a dedupe pass, which is the only honest stack when every row belongs; a bare UNION sorts and dedupes, and two clusters producing identical rows would silently collapse into one, breaking the reconciliation against 103. The contract each branch honors is column count and type alignment — the literal label carries the grain into the output. ORDER BY after the stack sorts the combined result, which is how the TOTAL row floats to the top: one query, one scan each, no spreadsheet math between them.",
      tag: "sets",
    },
    {
      id: "gopuff-t21",
      q: "EU shows 45 deliveries from 8 customers. Explain why both numbers are true at once and how you compute them in one query.",
      a: "They're two grains of the same fold: COUNT(*) counts delivery rows (45), COUNT(DISTINCT o.customer_id) folds repeat demand back to people (8) — 8 customers driving 45 deliveries is the density read, and the gap between the columns IS the metric. The one-query shape is the two-grain census: GROUP BY cluster with both counters side by side — EU 45/8, APAC 37/5, US 19/2, LATAM 2/1. The failure mode the interviewer probes is one grain wearing another's name: a completion rate over DISTINCT customers, or a customer count quoted as COUNT(*) after the pick join fanned it. On a 103-to-251 fan-out the mistake is constant, so the habit is 'one row per what?' before every COUNT — said out loud, every time, before the fold ships.",
      tag: "aggregation",
    },
    {
      id: "gopuff-t22",
      q: "The shelf file prints product names in three casings and one variant carries a trailing space. How do you make them group as one SKU?",
      a: "Group on a normalized key, not the raw text: TRIM first (the trailing space makes 'Smart Watch S ' a different byte string from 'Smart Watch S' — casing alone won't merge them), then UPPER or LOWER for case, or better, group by product_id where the id exists and display one canonical name. The display layer picks a representative — MIN(name) or the id-matched row — so the shelf file prints one spelling while tolerating three. The long-term answer is upstream: fix the feed or keep a crosswalk, because per-query string normalization is a tax you pay forever, and a surrogate key is the only normalization that can't regress. The screen-ready sentence: text keys group by exact bytes — normalize before grouping, and prefer the id the moment one exists.",
      tag: "strings",
    },
    {
      id: "gopuff-t23",
      q: "The handover pack wants a running pick-count by month AND the network total on every row. One query, two frames — how?",
      a: "Two windows over the same monthly fold. The running count: SUM(picks) OVER (ORDER BY month ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) — the explicit ROWS frame makes it row-exact, growing one row at a time. The constant total: SUM(picks) OVER () — empty OVER() spans the whole partition, so every row carries the same network figure. The frame vocabulary is the answer: the default frame with ORDER BY is RANGE … CURRENT ROW, and RANGE includes ORDER-BY peers — tie months jump together, correct for rank-flavored reads, wrong for a row-exact running total. Say the three frames out loud — running (ROWS to CURRENT ROW), total (empty OVER), peer-aware (RANGE default) — and the follow-up dies, because that sentence is the whole concept.",
      tag: "windows",
    },
    {
      id: "gopuff-t24",
      q: "Household profile changes arrive as multiple rows per customer, and the delivery app trusts one address at 2am. What's the read-side contract?",
      a: "Keep-latest per key before anything downstream trusts the row: ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) = 1 in a staged CTE, and the app reads only the rn = 1 rows. The determinism rule rides along: ORDER BY updated_at DESC, id DESC — a pure updated_at sort breaks when two updates share a timestamp, and 'the app guessed' is not an answer at 2am. The duplicate-detection half (GROUP BY customer_id HAVING COUNT(*) > 1) tells you HOW MANY households have contested profiles; the keep-latest half decides WHICH row wins. What you never do is let the fold silently pick — an arbitrary latest row ships an old address to a new door, and the failure mode is a customer standing outside. Dedupe is a correctness feature here, not hygiene theater.",
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
    {
      id: "gopuff-mcq-11",
      prompt: "The customer roster read is written LEFT JOIN orders … WHERE o.id IS NULL and returns 0 rows — every household here has ordered. Why keep the LEFT shape?",
      choices: [
        "Rewrite it as INNER — the results are identical",
        "The shape IS the definition: the day a household registers without ordering, INNER silently hides them",
        "LEFT JOIN is faster on small tables",
        "The 0 proves the join is wrong",
      ],
      answer: 1,
      why: "The anti-join answers 'who never ordered' and its 0-row result is a real finding — never-ordered = 0 on this ledger. INNER would agree today and fail silently the moment the honest empty set appears, because it deletes exactly the rows the question hunts.",
      notes: [
        { choice: 0, why: "Identical today, different the first day the data earns its audit — and nobody re-writes the query that day. The shape is the contract." },
        { choice: 2, why: "Speed isn't the axis — correctness under absence is. The LEFT+IS NULL arm is the definition of 'never', and definitions outlive row counts." },
      ],
      difficulty: "easy",
    },
    {
      id: "gopuff-mcq-12",
      prompt: "The ops review opens with one row per cloud cluster: deliveries AND customers. EU reads 45 deliveries from 8 customers. Which pair of counters prints that row?",
      choices: [
        "COUNT(*) and COUNT(o.customer_id)",
        "COUNT(*) and COUNT(DISTINCT o.customer_id)",
        "SUM(o.total) and COUNT(*)",
        "COUNT(DISTINCT o.id) twice",
      ],
      answer: 1,
      why: "Two grains, one fold: COUNT(*) counts deliveries (45), COUNT(DISTINCT o.customer_id) folds repeat demand back to people (8). Plain COUNT(o.customer_id) reads 45 — every joined row carries a customer id — so both columns would read the same and the density story dies.",
      notes: [
        { choice: 0, why: "Without DISTINCT the customer column mirrors the delivery column — 45 and 45 — and '45 deliveries from 8 customers' becomes unprovable." },
        { choice: 2, why: "SUM(o.total) is dollars, not heads — the census wants rows and people; the money fold is its own column." },
      ],
      difficulty: "medium",
    },
    {
      id: "gopuff-mcq-13",
      prompt: "The buying calendar buckets demand by month. Which key buckets the 103 deliveries correctly across 2024-01 to 2025-02?",
      choices: [
        "STRFTIME('%m', created_at)",
        "STRFTIME('%Y-%m', created_at) — demand buckets on placed-time",
        "STRFTIME('%Y-%m', shipped_at)",
        "SUBSTR(created_at, 9, 2)",
      ],
      answer: 1,
      why: "'%Y-%m' keeps the year in the key — '%m' alone merges January 2024 with January 2025 into one phantom spike. And the house rule: demand buckets on created_at (placed-time); shipped_at re-keys the spine to completion-time and drags a NULL month in for the 21 never-completed deliveries.",
      notes: [
        { choice: 2, why: "Completion-time is the service clock, not the demand clock — 14 pending and 7 cancelled never complete, and their demand vanishes from a shipped_at spine." },
        { choice: 3, why: "Characters 9-2 are the day-of-month — a 31-bucket spine that ignores months entirely." },
      ],
      difficulty: "medium",
    },
    {
      id: "gopuff-mcq-14",
      prompt: "Completion aging prints 2.98 for the 82 completed deliveries: JULIANDAY(shipped_at) - JULIANDAY(created_at). What is the unit on this db?",
      choices: [
        "Minutes — it's a delivery SLA",
        "Days — the timestamps are date-grain here; the production courier stream reads the same expression in minutes",
        "Hours",
        "Picks per order",
      ],
      answer: 1,
      why: "JULIANDAY differences are days, and on this training db the timestamps carry no time component — so the 2..4 range is days of aging, not minutes of delivery. Saying the unit out loud is the interview reflex: the identical expression reads minutes on the production stream.",
      notes: [
        { choice: 0, why: "Reading 2.98 as minutes makes a two-day queue look like a three-minute sprint — the SLA misread the lesson exists to kill." },
        { choice: 3, why: "Pick depth is 2.44 lines per basket — a different metric from a different fold; aging has no picks in it." },
      ],
      difficulty: "easy",
    },
    {
      id: "gopuff-mcq-15",
      prompt: "The substitution list excludes supplier SKUs: product_id NOT IN (SELECT product_id FROM contracts WHERE tier = 'premium'). One contract row has a NULL product_id. What ships?",
      choices: [
        "The list, minus NULL SKUs",
        "An empty list — every comparison turns UNKNOWN",
        "An error naming the NULL row",
        "The list with NULLs last",
      ],
      answer: 1,
      why: "NOT IN over a list containing NULL poisons the predicate: x != NULL is UNKNOWN, never FALSE, so no row survives. The substitution list empties silently — the shelf team reorders nothing and the stockout happens anyway.",
      notes: [
        { choice: 0, why: "That's COUNT(col) behavior, not NOT IN behavior. The NULL doesn't get skipped — it invalidates every comparison in the predicate." },
        { choice: 2, why: "The engine never flags the NULL — it evaluates per row and returns UNKNOWN, which WHERE drops. Only IS NOT NULL guards or NOT EXISTS fix it." },
      ],
      difficulty: "medium",
    },
    {
      id: "gopuff-mcq-16",
      prompt: "The shift-handover board wants the funnel detail rows AND a labelled TOTAL row in one table. Which operator stacks them?",
      choices: [
        "UNION — dedupes the stack",
        "UNION ALL — concatenates both branches",
        "INTERSECT — rows in both",
        "EXCEPT — detail rows only",
      ],
      answer: 1,
      why: "UNION ALL appends the TOTAL branch without a dedupe pass — every row belongs. UNION sorts and dedupes, and two clusters producing identical rows would collapse into one, silently shrinking the census the board reconciles against.",
      notes: [
        { choice: 0, why: "The dedupe pass is a correctness hazard: identical (cluster, count) rows vanish, and the handover total stops tying to 103." },
        { choice: 2, why: "INTERSECT keeps only rows present in BOTH branches — detail and total are disjoint by construction, so the result is empty." },
      ],
      difficulty: "easy",
    },
    {
      id: "gopuff-mcq-17",
      prompt: "The floor-lead printout folds each basket into one cell: GROUP_CONCAT(p.name, ', ') over the pick join. What ordering guarantee does the cell carry?",
      choices: [
        "Alphabetical — GROUP_CONCAT sorts by the separator",
        "None — arbitrary unless the query sorts explicitly",
        "Pick-table primary-key order, always",
        "The GROUP BY column's order",
      ],
      answer: 1,
      why: "A bare GROUP_CONCAT concatenates in engine visitation order — no contract. If the pick sequence matters, sort in a staged subquery or use the aggregate's own ORDER BY; a manifest whose order changes between runs is a trust problem, not a syntax problem.",
      notes: [
        { choice: 0, why: "Nothing sorts unless told — alphabetical-looking cells are coincidence of the plan, and they break the first time the planner reorders a scan." },
        { choice: 2, why: "Visitation order isn't key order — rowid-ordered output is an assumption the optimizer is free to violate." },
      ],
      difficulty: "hard",
    },
    {
      id: "gopuff-mcq-18",
      prompt: "Basket value month-over-month: LAG(rev) OVER (ORDER BY month) beside each month's fold. What does the FIRST month (2024-01, 3,731.97) print as its change?",
      choices: [
        "0% — the baseline is itself",
        "NULL — no prior row exists, and the honest report shows it",
        "A huge positive — baseline zero",
        "An error — LAG needs a PARTITION BY",
      ],
      answer: 1,
      why: "LAG with no prior row yields NULL, and the delta math propagates it: the opening month has no baseline, so it prints NULL — 'no change to measure'. COALESCE-ing it to 0% fakes a flat start that someone quotes.",
      notes: [
        { choice: 0, why: "A fake 0% opening delta reads as 'stable January' — an invented trend on the very row the deck opens with." },
        { choice: 3, why: "PARTITION BY is optional — LAG works fine over the whole window; it returns NULL when nothing precedes, which is the honest answer." },
      ],
      difficulty: "hard",
    },
    {
      id: "gopuff-mcq-19",
      prompt: "A teammate rewrites the aging fold as AVG(COALESCE(JULIANDAY(shipped_at) - JULIANDAY(created_at), 0)) so 'nothing is missing'. What does the board now read?",
      choices: [
        "The same 2.98 — COALESCE is hygiene",
        "A lower average — the 21 open deliveries inject fake 0-day aging and the queue looks faster than it is",
        "A higher average — NULLs counted as large values",
        "An error on the type mix",
      ],
      answer: 1,
      why: "The 14 pending and 7 cancelled have NO age yet — COALESCE invents 0-day aging for them, and the average drops below the honest 2.98. The queue flatters itself, and the slowest cloud looks fixed. The population guard (WHERE shipped_at IS NOT NULL) is the fix.",
      notes: [
        { choice: 0, why: "A default that means 'not finished yet' is not an age — this is the fake-zero that makes the board unauditable." },
        { choice: 2, why: "AVG skips NULLs, not zeros — the COALESCE manufactured zeros precisely so they'd count. They count downward here." },
      ],
      difficulty: "easy",
    },
    {
      id: "gopuff-mcq-20",
      prompt: "orders joins order_items: 103 deliveries fan into 251 picks. On the joined rows, which expression counts DELIVERIES again?",
      choices: [
        "COUNT(*)",
        "COUNT(DISTINCT o.id)",
        "COUNT(DISTINCT oi.id)",
        "SUM(o.total) / AVG(o.total)",
      ],
      answer: 1,
      why: "COUNT(*) reads 251 pick lines; COUNT(DISTINCT o.id) folds back to 103 deliveries — the grain the shift board quotes. COUNT(DISTINCT oi.id) counts the picks again under a different name: the same wrong 251.",
      notes: [
        { choice: 2, why: "Every pick line has its own id — distinct pick ids is COUNT(*) in disguise. The fold key has to be the thing you're counting: deliveries." },
        { choice: 3, why: "Total/average divides dollars by fanned dollars-per-row — a meaningless ratio on the fanned grain, and arithmetic can't undo a fan-out anyway." },
      ],
      difficulty: "easy",
    },
    {
      id: "gopuff-mcq-21",
      prompt: "The handover board wants ONE row per cluster with four status columns — delivered, shipped, pending, cancelled. Which shape builds it in a single scan?",
      choices: [
        "Four GROUP BY status queries, pasted together",
        "GROUP BY cluster with a FILTER (WHERE status = …) arm per status",
        "GROUP BY status alone",
        "A self-join of orders on status pairs",
      ],
      answer: 1,
      why: "Conditional arms share one scan and one population: EU reads 24/12/6/3 in a single row, and the arms sum back to the cluster's 45 as a reconciliation. Four separate queries drift the moment any filter differs by a clause.",
      notes: [
        { choice: 2, why: "GROUP BY status gives four rows of one column — a transpose, not a pivot; the cluster grain disappears." },
        { choice: 3, why: "Self-joining on status pairs every delivered row with every shipped row — a cartesian explosion wearing a pivot costume." },
      ],
      difficulty: "medium",
    },
    {
      id: "gopuff-mcq-22",
      prompt: "'The second-hottest SKU by picks' — the ladder reads 47, 46, 38, 36, 36, … A teammate writes ORDER BY picks DESC LIMIT 1 OFFSET 1. What does it return, and what's wrong?",
      choices: [
        "The 38-pick SKU — and it's correct",
        "The 46-pick SKU — but OFFSET picks the second ROW, so any tie above would make the pick arbitrary",
        "A NULL — OFFSET needs PARTITION BY",
        "Both 36-pick SKUs",
      ],
      answer: 1,
      why: "OFFSET walks rows, not ranks: it returns 46 today, but the moment two SKUs tie on the value above the cut, the 'second row' is whichever the engine visited first. DENSE_RANK = 2 in a subquery is the tie-proof second place.",
      notes: [
        { choice: 2, why: "OFFSET is plain row arithmetic — it runs fine and returns a row; the lie is semantic, not syntactic." },
        { choice: 3, why: "LIMIT 1 returns exactly one row — ties can't both appear. Sharing second place is a DENSE_RANK answer, not a LIMIT answer." },
      ],
      difficulty: "hard",
    },
    {
      id: "gopuff-mcq-23",
      prompt: "Cumulative picks per cloud cluster across the month spine: SUM(SUM(oi.quantity)) OVER (PARTITION BY cluster ORDER BY month). What does the DEFAULT frame include at each row?",
      choices: [
        "The whole partition — a flat total on every row",
        "RANGE UNBOUNDED PRECEDING TO CURRENT ROW — months accumulate, tied months ride together",
        "Only the current row",
        "Nothing — nesting aggregates in windows is illegal",
      ],
      answer: 1,
      why: "With ORDER BY, the default frame is RANGE … CURRENT ROW: the running total grows month by month, and RANGE folds ORDER-BY peers — two months tied on the ordering value jump together. Explicit ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW makes it row-exact.",
      notes: [
        { choice: 0, why: "A flat total is the empty OVER() frame. The default is 'everything up to now, peers included' — not 'everything, period'." },
        { choice: 3, why: "SUM(SUM(x)) OVER (…) is legal and standard — the inner aggregate folds first, the window rides the folded rows." },
      ],
      difficulty: "hard",
    },
    {
      id: "gopuff-mcq-24",
      prompt: "Two feeds write order status: one 'delivered', one 'Delivered'. Which comparison counts BOTH spellings in the funnel census?",
      choices: [
        "status = 'delivered'",
        "LOWER(status) = 'delivered'",
        "status = 'Delivered'",
        "UPPER(status) = 'delivered'",
      ],
      answer: 1,
      why: "Normalize the column, then compare against the matching literal: LOWER(status) = 'delivered' catches both feeds. UPPER(status) = 'delivered' can never match — 'DELIVERED' ≠ 'delivered' — a normalization pointed the wrong way.",
      notes: [
        { choice: 0, why: "Exact equality silently drops the 'Delivered' rows — the delivered arm shrinks while the reconciliation anchor (COUNT(*) = 103) stays honest, and the funnel disagrees with itself." },
        { choice: 2, why: "That matches only the capitalized spelling — the count flips from one feed's bias to the other's instead of fixing either." },
      ],
      difficulty: "medium",
    },
    {
      id: "gopuff-mcq-25",
      prompt: "Pick depth prints 2.44 lines per basket (251 picks over 103 deliveries). Where does ROUND belong?",
      choices: [
        "Around each row's line count, then average",
        "Around the final ratio, once",
        "Inside the WHERE clause",
        "In the GROUP BY expression",
      ],
      answer: 1,
      why: "The ratio 251/103 = 2.4369… rounds once at the display edge to 2.44. Rounding per row (whole line counts) destroys the fraction the depth read depends on — depth IS the fraction.",
      notes: [
        { choice: 0, why: "Rounding rows to whole numbers then averaging gives a coarser, different number — the 2.44 the fee review quotes disappears." },
        { choice: 2, why: "WHERE filters, it doesn't format — a ROUND there is either an error or a silent population change." },
      ],
      difficulty: "easy",
    },
    {
      id: "gopuff-mcq-26",
      prompt: "Market-basket pairing: which SKUs land in the same basket? The self-join is order_items o1 JOIN order_items o2 ON o1.order_id = o2.order_id AND o1.product_id < o2.product_id. Why the strict < ?",
      choices: [
        "It speeds up the join",
        "It kills self-pairs (A,A) and mirrored duplicates (A,B / B,A) — one representative per pair",
        "It's required syntax for self-joins",
        "It filters NULL product ids",
      ],
      answer: 1,
      why: "Without the inequality, every pick pairs with itself and every real pair appears twice — the co-occurrence counts double or worse. o1.product_id < o2.product_id keeps exactly one ordered representative per pair; equality is excluded so a SKU never pairs with itself.",
      notes: [
        { choice: 0, why: "The guard is correctness, not performance — halving a doubled count is a business number, not an optimization." },
        { choice: 3, why: "NULLs are unrelated — the predicate compares product ids, and the inequality's job is pair identity." },
      ],
      difficulty: "hard",
    },
    {
      id: "gopuff-mcq-27",
      prompt: "Baskets above MY cluster's average use a correlated scalar subquery. The inner fold scans a cluster with zero deliveries. What does the outer query do with that cluster's rows?",
      choices: [
        "Errors — empty subqueries are illegal",
        "Drops them — the scalar subquery yields NULL, total > NULL is UNKNOWN",
        "Keeps them — the comparison defaults to true",
        "Flags them — the engine reports the empty fold",
      ],
      answer: 1,
      why: "A scalar subquery over an empty population returns NULL — not an error — and every comparison with NULL is UNKNOWN, so WHERE keeps nothing. The report ships empty silently, which is why 'does the inner population exist' is part of the definition.",
      notes: [
        { choice: 2, why: "SQL never defaults to true — UNKNOWN and FALSE behave identically in WHERE. The danger is silence, not permissiveness." },
        { choice: 0, why: "0 rows is legal under the 0-or-1-row contract — the trap is precisely that nothing complains." },
      ],
      difficulty: "medium",
    },
    {
      id: "gopuff-mcq-28",
      prompt: "The substitution list folds shelf cover per SKU: p.stock - SUM(oi.quantity) AS remaining. Which ORDER BY puts the substitution candidates on rows one through three?",
      choices: [
        "ORDER BY remaining DESC",
        "ORDER BY remaining ASC",
        "ORDER BY p.stock DESC",
        "ORDER BY p.name",
      ],
      answer: 1,
      why: "Thinnest shelf first is ASC: 14 (Noise-Canceling Headset), 15 (Studio Desktop Mic), 17 (Smart Watch S) lead the list. DESC opens on the fattest shelf — a correct query serving the opposite queue.",
      notes: [
        { choice: 2, why: "Biggest stock first ignores what sold — a 95-unit shelf with 30 picks is healthier than a 60-unit shelf with 46; cover is stock MINUS picks." },
        { choice: 3, why: "Alphabetical ordering is presentation, not priority — the substitution list is a cover-ranked queue." },
      ],
      difficulty: "easy",
    },
    {
      id: "gopuff-mcq-29",
      prompt: "The handover pack wants a running pick-count by month AND the network total on EVERY row. Which window carries the constant total?",
      choices: [
        "SUM(picks) OVER (ORDER BY month ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)",
        "SUM(picks) OVER ()",
        "SUM(picks) OVER (PARTITION BY month)",
        "SUM(picks) OVER (ORDER BY month RANGE BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING)",
      ],
      answer: 1,
      why: "The empty OVER() spans the whole partition — every row carries the same network total. The ROWS frame (choice 0) is the running count that reaches the total only on the last row — right for a trend column, wrong for a total column.",
      notes: [
        { choice: 0, why: "That's the running total the pack also wants — two columns, two frames: ROWS … CURRENT ROW for the trend, empty OVER() for the constant." },
        { choice: 3, why: "A frame starting at CURRENT ROW drops everything before it — early months read 0, which is neither a running count nor a total." },
      ],
      difficulty: "hard",
    },
    {
      id: "gopuff-mcq-30",
      prompt: "The cloud-ops spend review wants entries AND cents per expense category in one scan. Which shape delivers it, and where does the /100.0 go?",
      choices: [
        "GROUP BY category with COUNT(*) and SUM(amount_cents) — divide by 100.0 at the display edge",
        "One FILTER census with no GROUP BY — categories are rows",
        "GROUP BY category with AVG(amount_cents) as the spend",
        "A self-join of expenses on category, then COUNT",
      ],
      answer: 0,
      why: "The category census is a fold: one row per category, COUNT for entries, SUM(amount_cents) for value — money stays integer cents through the fold and converts to dollars exactly once, at the display edge. Dividing per row or aggregating after conversion drifts the pennies.",
      notes: [
        { choice: 1, why: "FILTER arms without GROUP BY produce one row total — the census needs a row PER category, which is GROUP BY's job; FILTER composes with it per-arm." },
        { choice: 2, why: "AVG is the mean bill, not the spend — the review wants total cents per category, and the mean hides the volume entirely." },
      ],
      difficulty: "medium",
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
    {
      id: "cs-gopuff-3",
      tier: "medium",
      topic: "q5",
      universe: "inventory",
      title: "The shelf-cover thin list",
      brief:
        "Inventory memo, Gopuff-flavored on the storefront db: own-inventory means every stockout is Gopuff's P&L, so the buying team opens on remaining cover per SKU — stock minus units picked — staged so the fan-out can't lie. Probed fold: 103 deliveries fan into 251 pick lines; per SKU the picks fold to 46 on the Noise-Canceling Headset (stock 60, cover 14), 30 on the Studio Desktop Mic (45, cover 15), 23 on the Smart Watch S (40, cover 17). The three thinnest shelves ARE the substitution list — and the fold must aggregate picks to SKU grain first, because a row-wise stock-minus-quantity compares one pick line against the whole shelf.",
      ask: "Return the three thinnest SKUs: name, stock, picked, remaining cover — thinnest first.",
      template:
        "SELECT p.name,\n       p.stock,\n       t.picked,\n       {1} AS remaining\nFROM products p\nJOIN (\n  SELECT product_id, SUM({2}) AS picked\n  FROM {3}\n  GROUP BY product_id\n) t ON t.product_id = p.id\nORDER BY remaining {4}\nLIMIT {5};",
      slots: [
        {
          answer: "p.stock - t.picked",
          kind: "keyword",
          label: "the cover expression",
          why: "Cover is the shelf minus the FOLDED picks: 60 - 46 = 14 for the Headset. Reversed, every shelf reads negative; row-wise (p.stock - oi.quantity) references a pick line the outer query never joined and errors — the fold must happen before the subtraction.",
        },
        {
          answer: "quantity",
          kind: "keyword",
          label: "the pick unit",
          why: "Picks are units: SUM(oi.quantity) folds 46 Headset units across its sold lines. SUM(unit_price) folds dollars — cover in cents against stock in units, a 100-scale lie the shelf team would reorder on.",
        },
        {
          answer: "order_items",
          kind: "keyword",
          label: "the pick source",
          why: "The pick lines live in order_items — 251 of them, fanned from 103 deliveries. Products has no product_id to group by and orders has no product grain at all: the derived table names the pick source or the fold errors out.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the thinnest-first direction",
          why: "The substitution list is a cover-ranked queue: ASC puts 14, 15, 17 on rows one through three. DESC opens on the fattest shelf — a correct query serving the opposite queue while the thin shelves stock out.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the substitution cut",
          noVerify: true,
          why: "The ask is the three thinnest SKUs — the substitution list the floor acts on tonight. A wider cut waters the action list; the cover figures it keeps (14, 15, 17) are the probed thin shelf.",
        },
      ],
      distractors: ["t.picked - p.stock", "p.stock - oi.quantity", "unit_price", "orders", "DESC"],
      walkthrough:
        "A staged fold: aggregate first, subtract second. The derived table folds 251 pick lines to SKU grain — SUM(quantity) per product_id — and the outer query joins that fold back to products and subtracts: 60 - 46 = 14 for the Noise-Canceling Headset, 45 - 30 = 15 for the Studio Desktop Mic, 40 - 23 = 17 for the Smart Watch S. ORDER BY remaining ASC then LIMIT 3 is the substitution list, thinnest first. The distractors encode the classic failures: reversing the subtraction makes every healthy shelf read negative; the row-wise p.stock - oi.quantity references the pick table the outer query never aliased — an error that at least announces itself; folding unit_price instead of quantity compares dollars to units; sourcing the fold from orders (no product grain) or grouping products by a column they don't own errors the stage; and DESC serves the fattest shelves to the stockout meeting. Stage the fold, then diff — the shape every own-inventory read hangs on.",
    },
    {
      id: "cs-gopuff-4",
      tier: "medium",
      topic: "t5",
      universe: "catalog",
      title: "The velocity ladder front page",
      brief:
        "Merch brief, Gopuff-flavored on the storefront db: the shelf board opens with the velocity ladder — SKUs by units picked, tie-respecting, front page only. Probed fold: the ladder reads 47 (Desk Mat Extended), 46 (Noise-Canceling Headset), 38 (HDMI 2.1 Cable 2m), then the tie — Laptop Stand Aluminum and Wireless Mouse M3 both at 36 — and the front page ends there. The tie is the test: two SKUs sold identically must share a rung, not split arbitrarily, which is why the board runs DENSE_RANK — no gaps, no phantom strata between the 38 and the 36-pair.",
      ask: "Return the front page: SKU, picks, and a no-gap rank for every SKU with 36+ picks, busiest first.",
      template:
        "SELECT p.name,\n       SUM({1}) AS picks,\n       DENSE_RANK() OVER (ORDER BY SUM(oi.quantity) {2}) AS shelf_rank\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.id\nHAVING SUM(oi.quantity) >= {3}\nORDER BY shelf_rank {4}",
      slots: [
        {
          answer: "quantity",
          kind: "keyword",
          label: "the velocity fold",
          why: "Velocity is units picked: SUM(oi.quantity) folds 251 lines to per-SKU totals — 47, 46, 38, 36, 36. SUM(unit_price) folds dollars (a revenue ladder), COUNT(*) counts lines (a basket-count ladder) — same rows, different boards.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the hottest-first ranking",
          why: "Rank 1 goes to the busiest SKU, so the window orders descending. ASC crowns the slowest SKU on the shelf rank 1 — a correct-looking ladder aimed at the bottom of the board.",
        },
        {
          answer: "36",
          kind: "number",
          label: "the front-page gate",
          why: "The gate keeps the front page: 47, 46, 38, and the 36-pair — five rows, two ranks, tie visible. Drop it to 30 and the three-way 30-tie crashes the page; raise it to 38 and the tie — the entire point — amputates itself. The gate's own figure prints in the picks column.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the rank reading order",
          why: "The board reads rank 1 first, so the display sorts the rank ascending: 47 on row one, the 36-pair on rows four and five. DESC inverts the page — the front becomes the back, and the hottest SKU is buried under the wrong reading order.",
        },
      ],
      distractors: ["COUNT(*)", "DESC", "30", "38", "unit_price"],
      walkthrough:
        "A fold, a gate, and a tie-respecting rank. The join fans 251 picks across 16 SKUs, GROUP BY p.id folds them, and the gate keeps the front page: SUM(oi.quantity) >= 36 leaves 47 (Desk Mat Extended), 46 (Noise-Canceling Headset), 38 (HDMI 2.1 Cable 2m), and the 36-pair — Laptop Stand Aluminum and Wireless Mouse M3. DENSE_RANK() OVER (ORDER BY SUM(oi.quantity) DESC) stamps ranks 1, 2, 3, 4, 4: the pair shares rung 4 with no gap after it. That gap-free property is the whole drill — RANK would have stamped the same 4s here, but the moment a rank-3 tie exists it prints 5 next and invents a phantom stratum, and ROW_NUMBER would split the pair arbitrarily, claiming a winner it can't defend. The distractors: COUNT(*) or unit_price in the fold builds a different board wearing the same name; a window ASC crowns the slowest SKU; a display DESC inverts the page; a gate of 30 floods the page with the three-way tie and a gate of 38 amputates the 36-pair — the very rows the memo quotes.",
    },
    {
      id: "cs-gopuff-5",
      tier: "medium",
      topic: "x1",
      universe: "catalog",
      title: "The pick manifest for the floor lead",
      brief:
        "Floor-ops memo, Gopuff-flavored on the storefront db: the fullest baskets get the pinned printout — one row per order, its picks folded into a single comma-joined manifest cell. Probed fold: 103 deliveries fan into 251 pick lines; the line-count distribution runs 26 single-pick baskets, 29 at two lines, 25 at three, and 23 four-line baskets — four is the deepest this shelf goes, and order 1 is the canonical sample: 'Yoga Mat Eco 6mm, HDMI 2.1 Cable 2m, Desk Mat Extended, Noise-Canceling Headset'. GROUP_CONCAT does the folding; the manifest must show whole baskets, not half of one.",
      ask: "Return the first five four-line baskets: order id, line count, and the comma-joined pick manifest.",
      template:
        "SELECT o.id,\n       COUNT(*) AS lines,\n       GROUP_CONCAT(p.name, {1}) AS manifest\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = {2}\nGROUP BY o.id\nHAVING COUNT(*) = {3}\nORDER BY o.id {4}\nLIMIT 5;",
      slots: [
        {
          answer: "', '",
          kind: "keyword",
          label: "the manifest separator",
          why: "The printout spec is comma-space: GROUP_CONCAT(p.name, ', ') reproduces the probed manifest for order 1. Change the separator and every cell changes — the floor lead's scanner and the pick app both parse the literal.",
        },
        {
          answer: "oi.product_id",
          kind: "keyword",
          label: "the catalog stitch",
          why: "Pick lines reference the shelf by product_id, so the stitch is p.id = oi.product_id. Stitch on o.id instead and each order pairs with whatever SKU shares its row id — baskets of one phantom product, plausible-looking and entirely wrong.",
        },
        {
          answer: "4",
          kind: "number",
          label: "the deepest-basket gate",
          why: "Four is the deepest basket on this shelf — 23 orders sit at exactly 4 lines, and the gate keeps exactly them. A gate of 5 empties the printout (no basket goes deeper), and the floor lead pins a blank page. The gate's own figure prints in the lines column.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the deterministic cut",
          why: "23 baskets qualify and LIMIT 5 needs a deterministic cut: ORDER BY o.id ASC takes orders 1, 6, 11, … every run, same page. DESC rotates the sample daily — fine for variety, wrong for a pinned printout people annotate.",
        },
      ],
      distractors: ["' | '", "o.id", "5", "DESC"],
      walkthrough:
        "A fold that ends in a cell. Two joins fan orders through their pick lines to the shelf: orders → order_items on oi.order_id = o.id, then products on p.id = oi.product_id — and the pick fan-out (103 → 251) is exactly what GROUP BY o.id folds back, one row per basket. GROUP_CONCAT(p.name, ', ') collapses each basket's 4 lines into one manifest cell, COUNT(*) carries the line count, and HAVING COUNT(*) = 4 keeps the deepest baskets — 23 of them — before ORDER BY o.id ASC and LIMIT 5 take the first five deterministically: order 1's 'Yoga Mat Eco 6mm, HDMI 2.1 Cable 2m, Desk Mat Extended, Noise-Canceling Headset' pins the top of the page. The distractors: a different separator changes every cell; the o.id stitch pairs orders with same-numbered SKUs; a gate of 5 prints an empty page because no basket goes deeper than 4; and DESC rotates the sample under a printout people write on. Fold to basket grain, gate on the deepest rung, cut deterministically — the printout survives the shift handover.",
    },
    {
      id: "cs-gopuff-6",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass handover census",
      brief:
        "Shift-handover memo, Gopuff-flavored on the storefront db: the outgoing shift hands the board to the next shift on ONE row — the whole funnel, the cancel share, the completion aging — because a census scanned three times is a census that can drift three ways. Probed fold: 103 placed deliveries splitting 52 delivered / 30 shipped / 14 pending / 7 cancelled (arms sum back to 103), a 6.8% cancel share, and completion aging of 2.98 days over the 82 completed. FILTER (WHERE …) keeps every arm on one population; the reconciliation is the sum-back, checked before the board ships.",
      ask: "Return one row: placed, delivered, shipped, pending, cancelled, cancel_share, aging_days.",
      template:
        "SELECT COUNT(*) AS placed,\n       COUNT(*) FILTER (WHERE status = {1}) AS delivered,\n       COUNT(*) FILTER (WHERE status = {2}) AS shipped,\n       COUNT(*) FILTER (WHERE status = 'pending') AS pending,\n       COUNT(*) FILTER (WHERE status = {3}) AS cancelled,\n       ROUND({4} * COUNT(*) FILTER (WHERE status = 'cancelled') / COUNT(*), 1) AS cancel_share,\n       ROUND(AVG(JULIANDAY(shipped_at) - JULIANDAY({5})), 2) AS aging_days\nFROM orders;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the delivered literal",
          why: "The delivered arm counts status 'delivered' — 52. 'Delivered' with a capital D matches nothing: text equality is case-sensitive, and the arm reads 0 while placed still reads 103 — a census that contradicts itself on its own row.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the shipped literal",
          why: "Shipped is its own state — 30 in flight, deliberately separate from the 14 pending. Swap the arm to another literal and the in-flight queue disappears into a zero, misreading a pick-queue delay as a healthy board.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the cancelled literal",
          why: "The cancelled arm counts the 7 — and feeds the share below it. The arm must match the same literal the share uses, or the count says one thing and the percentage another on the same handover row.",
        },
        {
          answer: "100.0",
          kind: "keyword",
          label: "the float multiplier",
          why: "100.0 meets the numerator BEFORE the division: 100.0 * 7 / 103 = 6.8. An integer 100 forces integer division — 700 / 103 truncates to 6 — and the share reads a full point low, every shift, forever.",
        },
        {
          answer: "created_at",
          kind: "keyword",
          label: "the aging clock",
          why: "Aging pairs completion against placement: JULIANDAY(shipped_at) - JULIANDAY(created_at) over the 82 completed = 2.98 days. JULIANDAY(shipped_at) - JULIANDAY(shipped_at) is 0 — a queue that reads instant, the flattery that hides a stalled pick line.",
        },
      ],
      distractors: ["'Delivered'", "'ship'", "'void'", "100", "shipped_at"],
      walkthrough:
        "One scan, seven arms, one reconciliation. COUNT(*) anchors the population at 103; each FILTER (WHERE status = …) arm counts its own state inside the same scan — 52 delivered, 30 shipped, 14 pending, 7 cancelled — and the sum-back is the proof: 52 + 30 + 14 + 7 = 103, checked before the board ships. The share arm divides the cancelled arm by the anchor with the float multiplier first: 100.0 × 7 / 103 = 6.8%. The aging arm folds JULIANDAY deltas over the 82 rows that have a completion timestamp — AVG skips the NULLs by construction, which is exactly the right population: an open delivery has no age yet, not zero age. The distractors encode the classic census failures: capitalized or wrong literals zero an arm while placed stays honest, the integer 100 truncates the share to 6, and self-subtracting the aging clock prints a queue that completes in 0.00 days. One pass, every state, arms that tie — the handover shape.",
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
    { slug: "product-sales-analysis-iv", why: "Buyer-vs-SKU pivoting — the two-grain fold behind every cluster census, drilled until the counter pairs stop lying." },
    { slug: "product-sales-analysis-v", why: "Top products per buyer — the personalization seed: each household's shelf favorites, ranked per person, not per deck." },
    { slug: "customers-who-bought-all-products", why: "Full-catalog households — the 16-SKU completion read that finds the merchandising unicorns and stress-tests intersection logic." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Visited-no-order hunts — the funnel stage between browse and basket, where the honest answer is an anti-join, not a status filter." },
    { slug: "calculate-product-final-price", why: "Discounted shelf price — the final-price fold behind every promo read, where the display edge is the only place rounding lives." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Repeat-basket windows — the household that came back inside the week, the clock the fee review and the nudge both hang on." },
    { slug: "fifo-inventory-cogs", why: "Layered inventory costing — own-inventory means Gopuff owns the COGS math: oldest stock out first, folded per SKU." },
    { slug: "unpopular-books", why: "Zero-demand SKUs — the anti-join that finds the dead shelf (opposite face of the substitution list), honest about empty results." },
    { slug: "fix-product-name-format", why: "Shelf-label hygiene — TRIM/INITCAP casing fixes so the catalog groups one SKU as one SKU, not three spellings." },
    { slug: "sales-analysis-iii", why: "Date-bounded exclusive sets — SKUs that sold only in one window, the half-open-interval drill behind every promo wrap-up." },
    { slug: "the-most-recent-three-orders", why: "Per-customer top-N recency — the last three baskets per household, staged as a window rank then cut — the keep-recent pattern at order grain." },
    { slug: "second-most-recent-activity", why: "Penultimate-event reads — the second-latest address or basket per key, where ROW_NUMBER rn = 2 is the whole trick." },
    { slug: "product-price-at-a-given-date", why: "As-of shelf pricing — the price in force on a date, not today's; the slowly-changing-dimension instinct every promo audit assumes." },
    { slug: "occupations-pivot", why: "The classic CASE pivot — rows to columns in one scan, the same muscle the handover board's status columns are built from." },
    { slug: "calculate-special-bonus", why: "Conditional per-row bonuses — courier eligibility computed with a CASE flag, one pass, no post-hoc spreadsheet." },
    { slug: "bank-account-summary", why: "Per-account debit/credit folds — the settlement-statement shape: money in, money out, balance derived, cents never rounded mid-fold." },
  ],
};
