// Kroger — Wave-9 (Task 98-kroger), food domain, no tagged LC — theme-curated; facts from scripts/company-facts.md.
// America's largest pure grocer: supermarkets + multi-department stores under two dozen
// banners, Our Brands private label (Simple Truth / Private Selection), the Plus Card
// loyalty program with its fuel-point loop, and Kroger Pickup & Delivery. The storefront
// db reads as a grocery-operations sandbox — customers are Plus Card households (region =
// the four division/market rollups, carried as the db's EU/APAC/US/LATAM codes), orders
// are shopping trips (delivered = completed basket, shipped = pickup/delivery order out
// with shipped_at as the dispatch stamp, pending = order being picked, cancelled =
// abandoned), order_items are basket lines (quantity = units, unit_price = shelf price),
// products are shelf SKUs, suppliers are national-brand CPG partners, invoices are vendor
// settlement statements, payments are tender legs on two rails (card/EBT rail vs ACH
// settlement rail), expenses are store/division opex, ledger_entries is the GL. Orders
// totals and unit_price are REAL dollars; the finance tables are INTEGER cents — the
// dollar read is amount_cents / 100.0. Pool provenance: company-pools.md carries NO
// Kroger section (0 tagged rows), so all 10 topic slug sets and all 16 problems are
// theme-curated from the pools file's sql rows (no w*/d*/f* rows) and say so. Case
// briefs quote probed figures from scripts/company-facts.md (probed 2026-10-12); every
// case slot is mechanically verified against db/custom.db by scripts/case-audit.ts.
// NOTE for the wave-9 registry wiring agent: kroger is NOT yet in registry
// COMPANY_META — wire id "kroger", domainId "food", name "Kroger", tagline as below,
// accent text-blue-300 (unused by all 17 food-domain siblings; Kroger blue).

import type { CompanyKit } from "../types";

export const krogerKit: CompanyKit = {
  id: "kroger",
  domainId: "food",
  name: "Kroger",
  tagline: "Own-brand shelf economics, fuel points, pickup & delivery",
  accent: "text-blue-300",

  brief: [
    "**Kroger** is the largest pure grocer in the United States — nearly 2,700 supermarkets and multi-department stores under a shelf of banners (Kroger, Ralphs, Fred Meyer, King Soopers, Harris Teeter), a pharmacy counter on the front end, and a fuel island out back that turns grocery spend into fuel points. Two engines make its data interesting. The first is Our Brands, the private-label machine — Simple Truth and Private Selection sitting on the same shelf as national-brand CPG partners, each fighting for facings at a price the shopper can verify in one glance. The second is the {sky:Plus Card}, the loyalty account that ties every trip, every coupon and every fuel-point redemption back to one household. This kit maps the storefront db onto that world: 16 customers rows are Plus Card households, the 103 orders are shopping trips worth **34,833.28**, and the 251 order_items rows are basket lines — quantity = units, unit_price = shelf price. The trip-fate map is fixed: delivered = {emerald:completed basket} (52, 50.5%), shipped = pickup/delivery order out the door with the shipped_at dispatch stamp (30, 29.1%), pending = order being picked (14), cancelled = {rose:abandoned} (7, 6.8%).",
    "The data org splits the way the store P&L does. Merchandising analytics runs the own-brand versus national-brand read — partner revenue, listings per shelf, rating floors, price-band mix — and negotiates with exactly the numbers you will build here. Customer & loyalty analytics runs the Plus Card book: household value ladders, fuel-point loops, and the concentration fact that **63.5% of the book** sits with households whose lifetime spend crosses 3,000 (71.2% above 2,000) — one lost household moves a market. Fulfillment analytics owns the pickup/delivery clock: 82 of 103 trips carry a `shipped_at` dispatch stamp, averaging **2.98 days** from order to out-the-door with a 2–4 day spread. And the finance pod closes the vendor side: 28 settlement statements in INTEGER cents, where the dollar read is `amount_cents / 100.0` and *renewed is not collected* until the legs land.",
    "Interview screens are census-then-denominator, same as the store. A typical loop opens with a **two-grain census** — one division bucket runs 45 trips from just 8 households (intensity 5.6) while another runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator question out loud (*'do abandoned trips count in your base?'*), then into the household value ladder where four households sit tied at 4 trips and rank semantics become a policy about who shares the fuel-point multiplier. Late rounds walk the {sky:14-month trip spine} (2024-01 to 2025-02) with `LAG` deltas, or the tender book where the card rail's 16 legs and the ACH rail's 11 must both reconcile. Candidates who state the trip-fate filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Kroger section — fewer than 2 tagged rows, none SQL-graded — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: trip-fate funnels, two-grain censuses, own-brand versus national-brand shelf folds, loyalty ladders with honest ties, and cents-safe settlement math. Do the topics in order, then run the six case studies on the live storefront db, spaced out rather than in one sitting: the {emerald:national-brand bench census} merchandising brings into every Our Brands negotiation, the {sky:Plus Card value ladder} the loyalty board ranks households by, the {rose:tender-rail split} finance reconciles at the close, the {sky:fuel-point cushion ladder} the division pilot ranks by, the {violet:value-weighted trip census} ops opens the day with, and the {amber:shelf-band census} pricing prints before a line review. Re-run each a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the 32-problem pool and the theory bank below, and treat the walkthroughs as the real content: they narrate what each wrong chip does to the read. The bar to clear: *state the definition and the denominator before you compute anything* — then make every trip-fate census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**07:45 —** The day starts with the store-open read, before the first pickup wave hits. A fulfillment analyst opens the trip dashboard: did overnight pickup orders get their `shipped_at` dispatch stamp, is any delivery order sitting picked-but-not-dispatched, and does the one-pass trip-fate census reconcile — 52 completed + 30 out-the-door + 14 being picked + 7 abandoned = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If dispatch latency drifts off the **2.98-day** norm, the pick-path queue gets pulled before marketing's morning read ships.",
    "**11:30 —** Midday is the shelf. Merchandising wants the national-brand bench refreshed before an Our Brands line review: partner revenue folded from basket lines, SKUs on shelf beside scanned revenue (three listings carrying 11,130.25 is a different argument from three listings carrying 2,980.15), and the 4.5-rating trust floor applied — *the floor that keeps exactly two of six partners on the bench*. Then pricing asks for the band mix: 8 budget SKUs averaging 32.06 against 8 mid-band at 111.5, and a premium band that must be shown EMPTY (max shelf price 199.99) rather than silently zero. Each ask is a join, a conditional aggregate and one grain call — *SKUs on shelf are not lines scanned*.",
    "**15:30 —** The afternoon tilts toward loyalty and money. The Plus Card ladder refreshes first — the 5-trip household floor keeps 5 of 16 households, led by a 24-trip, 7,262.35 account — and fuels the fuel-point multiplier debate; the AR anti-join runs before the vendor desk sends a single reminder: **6 never-collected statements worth 15,217**, one partial (4,000 of 6,148) and a paid-status statement with zero settlement legs (#28, 1,756.00) that the anomaly list must explain. The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Completed-basket rate", what: "Trips delivered ÷ ALL trips booked: 52 of 103 (50.5%). 'Completed' is a status-filtered conditional count, and the denominator — pickup and delivery trips included — is the whole interview." },
    { name: "Dispatch rate & clock", what: "Pickup/delivery orders stamped out-the-door ÷ all booked: 82 of 103 (79.6%), averaging 2.98 days order-to-dispatch with a 2–4 day spread. The 14 pending rows are 'being picked', never a silent zero." },
    { name: "Trip value", what: "Total basket value booked: 34,833.28 across 103 trips, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the basket story — one 1,088.44 trip outweighs the smallest 42 combined." },
    { name: "Abandonment share", what: "Cancelled share of booked trips: 7 of 103 (6.8%), sliced by market — APAC bucket 8.1%, EU 6.7%, US 5.3%. The abandonment map that drives the pickup-slot and reminder calendars." },
    { name: "Market demand map", what: "Trips, households and revenue per division rollup: EU bucket 45 trips / 8 households / 15,089.23; APAC 37 / 5 / 11,605.45; US 19 / 2 / 7,286.16; LATAM 2 / 1 / 852.44. Two grains, one query, every Monday." },
    { name: "Household concentration", what: "Share of the book from Plus Card households spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs the loyalty pod and sizes the fuel-point multiplier." },
    { name: "Basket depth", what: "Basket lines ÷ trips: 251 order_items across 103 trips. Basket growth shows up here first — units added to a trip are new lines at shelf price, not new trips." },
    { name: "Vendor settlement coverage", what: "Settled versus claimed on the 28-statement vendor book: 21 exact (65,612), 1 partial (4,000 of 6,148), 6 never-collected worth 15,217. The AR anti-join the finance pod refreshes every close." },
  ],

  topics: [
    {
      name: "Trip-fate funnels",
      why: "Every Kroger fulfillment screen opens with the trip-fate map: trips booked, dispatched (shipped_at stamped), completed at the door. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling a dispatched pickup order 'completed' — 30 versus 52 on this db.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "funnel-step-conversion", "immediate-food-delivery-iii", "human-traffic-of-stadium"],
    },
    {
      name: "Two-grain market censuses",
      why: "Trips and households are different grains of the same join, and every census here reports both: the EU bucket runs 45 trips from 8 households while the US bucket runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count", "user-purchase-platform", "find-the-median"],
    },
    {
      name: "Baskets joined to households",
      why: "Households carry region and sign-up date; trips inherit them through joins, and the join type decides who survives. A trip without a household is corruption; a household without trips is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "employee-bonus", "warehouse-manager", "restaurant-growth"],
    },
    {
      name: "Plus Card value ladders",
      why: "Loyalty tiers are rank-window reporting where ties are guaranteed — four households sit at 4 trips each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about who shares the fuel-point multiplier, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "compute-the-rank-as-a-percentage", "usage-tier-percentiles", "the-most-recent-three-orders", "customers-with-strictly-increasing-purchases"],
    },
    {
      name: "Shelf price bands with CASE",
      why: "Shelf tiers are CASE-classified — budget, mid, premium — with fixed edges the tag prints. The arms must be exhaustive and ordered, and the premium band is EMPTY on this db (max shelf price 199.99): proving a band is empty honestly is exactly the discipline the CASE exercise grades.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories", "calculate-product-final-price", "transactions-per-visit-histogram"],
    },
    {
      name: "The dispatch clock",
      why: "Pickup promises are latency math: `julianday(shipped_at) - julianday(created_at)` over the 82 stamped trips, averaging 2.98 days with a 2–4 spread. The population definition ships with the number — the 14 still-being-picked trips have no clock yet and must not dilute the average.",
      slugs: ["average-time-of-process-per-machine", "users-that-actively-request-confirmation-messages", "find-golden-hour-customers", "calculate-orders-within-each-interval", "seasonal-sales-analysis"],
    },
    {
      name: "Assortment coverage algebra",
      why: "Board packets stack populations — households that bought the own-brand item beside households that only bought national brands — and EXCEPT answers 'which households never touched the private label'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order"],
    },
    {
      name: "Household gates & nested folds",
      why: "Screens escalate into staging: fold per-household trip counts, then judge them against a computed platform mean (6.44 trips — exactly four households clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "One-pass trip censuses",
      why: "The ops board gets completed, dispatched, picking and abandoned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "friday-purchases-i"],
    },
    {
      name: "Cents-safe settlement math",
      why: "Claimed is not settled — the vendor book (28 statements, 27 tender legs, INTEGER cents) is where the shelf world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/never coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "fifo-inventory-cogs"],
    },
  ],

  theory: [
    {
      id: "kroger-t1",
      q: "Your basket report joins households to trips to basket lines. When do you INNER and when do you LEFT — and what silently breaks if you filter a trip column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins trips to households and basket lines: a basket line with no trip row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from households: the Plus Card accounts with no trips ARE the answer, arriving with NULL trip columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload household row — the LEFT quietly became an INNER and the never-shopped households vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-tripping households, and proving that zero is itself the analyst's job: all 16 households appear in the trips table somewhere. Say the survival rule out loud before you pick the join — the panel is grading the rule, not the keyword.",
      tag: "joins",
    },
    {
      id: "kroger-t2",
      q: "Four households tie at 4 trips on the Plus Card ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the trip ladder runs 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying four phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which household keeps the top fuel-point multiplier tier. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer households (RANK or DENSE_RANK), or an explicitly named tie-breaker like lifetime spend, then household id — and writing it in the query comment. On a loyalty ladder a tie policy is a promise printed in the program terms, so the tie-breaker is a product decision the query must encode, not hide.",
      tag: "windows",
    },
    {
      id: "kroger-t3",
      q: "The census shows 103 trips and 16 households; the EU bucket shows 45 trips and 8 households. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts trip rows after the join — one row per trip, so a household with 24 trips contributes 24. COUNT(DISTINCT customer_id) folds those rows back to households — the EU bucket's 45 trips collapse to 8 Plus Card accounts. Neither is wrong: trips measure load and basket momentum, households measure installed base and household penetration. The ratio — 5.6 trips per household in the EU bucket versus 9.5 in the US bucket on this db — is the intensity signal that decides whether a market is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for basket lines and COUNT(*) silently counts lines, not trips — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades, and in a grocery review it is the difference between trips-per-household and units-per-trip — two KPIs with two different owners.",
      tag: "aggregation",
    },
    {
      id: "kroger-t4",
      q: "shipped_at is NULL until a pickup order leaves the store. What is your policy for the dispatch-clock report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only dispatched trips have a clock, so the report measures order-to-dispatch for the 82 of 103 trips that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL trips returns the dispatched-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the dispatched subset; the gap between it and COUNT(*) is exactly the 14 being-picked plus 7 abandoned rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day dispatches for orders that have not been picked. A report whose WHERE clause is doing definitional work without saying so is exactly what a Kroger reviewer hunts for, because the 14 pending rows are the operation's live workload — deleting them from the denominator deletes the very queue the metric exists to watch.",
      tag: "nulls",
    },
    {
      id: "kroger-t5",
      q: "The loyalty review wants basket value per market for markets carrying at least ten trips. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The trip-fate rule is a row-level fact — status = 'delivered' discards dispatched, picking and abandoned rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-trip floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a market line and an error, and between a threshold applied to trips versus to dollars. On this db the 5-trip loyalty floor keeps exactly 5 of 16 households — Alice Chen at 24 trips and 7,262.35 down to Chloe Dubois at 5 and 2,667.93 — and moving that floor one notch to 4 pulls in four more households and rewrites the ladder. The strong answer places every filter by asking: is this a fact about one trip, or about a market?",
      tag: "pipeline",
    },
    {
      id: "kroger-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average-basket report silently returns nothing while looking valid. On the full table that is theoretical: 103 trips always produce a mean (6.4375 trips per household, 6.44 rounded — exactly four households clear it; the basket mean is 338.19). On filtered staging tables — one market, one fate, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each trip to ITS household's average basket) re-runs per outer row and answers a different question at a different cost — that is the basket-elasticity read, not the market read. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "kroger-t7",
      q: "The trip trend buckets baskets by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's trips, and quarter-end is exactly when weekend stock-up trips land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The business read the spine carries: the book opens at 3,731.97, troughs at 1,193.86 in July 2024, and ends the window at 2,390.53 in 2025-02 — a walk the loyalty team overlays with fuel-point promotions to argue cause. Date discipline is merchandising discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "kroger-t8",
      q: "The vendor desk says a settlement statement is 'paid' but the tender legs table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a tender leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes; the partial (#25, 4,000 of 6,148) is the third face of the same coin. The money rule: the vendor book carries INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial / 6 never-collected, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "kroger-t9",
      q: "The pick desk wants one row per trip day with every SKU name folded into a single cell for the picker's route. Walk me through GROUP_CONCAT — what it returns, what it does NOT guarantee, and when you would not use it.",
      a: "GROUP_CONCAT is the fold that turns many rows into one TEXT cell: GROUP BY the trip date with GROUP_CONCAT(name) prints every SKU on the day's pick route joined by commas. What it does NOT guarantee is order — the sequence inside the cell is unspecified unless the rows arrive pre-sorted from a subquery, so a route order read out of the cell is fiction. It also silently drops NULLs, so a name column with holes folds shorter than the group's row count — compare against COUNT(*) when completeness matters. And it is a one-way door: the cell is display-shaped, not query-shaped, so anything downstream that needs to filter or count by SKU must go back to the rows. Use it for the hand-off cell — the pick route, the coupon list — never as the source of truth.",
      tag: "groupby",
    },
    {
      id: "kroger-t10",
      q: "The dispatch clock and the trip spine both come from the same TEXT timestamps. When do you reach for julianday and when for STRFTIME, and what breaks if you swap them?",
      a: "julianday converts a timestamp into a real number of days, so differences are arithmetic: julianday(shipped_at) - julianday(created_at) is the dispatch latency — the 2.98-day average over the 82 stamped trips, fractional days and all. STRFTIME('%Y-%m', created_at) is a bucketing tool: it folds timestamps into 'YYYY-MM' TEXT keys and the 14-month trip spine falls out of a GROUP BY. Swap them and both reads break: julianday of a month bucket measures nothing, while subtracting STRFTIME strings does text arithmetic that looks numeric and isn't. The pairing rule: julianday for durations and windows, STRFTIME for the spine and its ORDER BY — and the zero-padding in '%Y-%m' is what keeps January 2025 from merging into January 2024.",
      tag: "dates",
    },
    {
      id: "kroger-t11",
      q: "Pricing prints a shelf-band census — budget, mid, premium — before every Our Brands line review. Walk me through writing that CASE so the census cannot silently lose a SKU, and what you do about a band that holds nothing.",
      a: "Three rules for the arms. Exhaustive: every shelf price lands somewhere — budget under 50, mid 50 up to 200, premium the ELSE — because a missing ELSE returns NULL and a NULL band is a SKU merchandising cannot see. Ordered and non-overlapping: arms are checked top to bottom, narrow edge first — WHEN price < 50, WHEN price < 200 — so a 49.99 or exactly-50 SKU lands where the tag says. Stable labels: the arms print the published band names, because the line review joins on those strings. The premium band is provably empty on this range (ceiling 199.99) — and here is the honest part: a GROUP BY band cannot fabricate an empty group, so the premium row simply does not form, and its absence IS the finding. The read states 'premium: no SKUs' in the deck rather than widening the mid edge to make the band appear — widening 200 to 250 changes nothing, which is itself the proof the band is empty.",
      tag: "case-when",
    },
    {
      id: "kroger-t12",
      q: "Merchandising wants households that bought from the Audio category but never touched Wearables. Compare EXCEPT, LEFT JOIN + IS NULL and NOT EXISTS — which ships, and why?",
      a: "EXCEPT is the set-algebra read: SELECT household FROM audio-trips EXCEPT SELECT household FROM wearables-trips — directional, deduped, both sides must project the same columns, and flipping the operands answers the opposite question. LEFT JOIN + IS NULL is the grain-preserving workhorse: LEFT from the Audio side, attach Wearables lines, keep the NULL payload — it composes with other columns in the same query, which is why it is the everyday shape. NOT EXISTS is the NULL-proof one: a correlated existence test that cannot be poisoned by a stray NULL the way NOT IN can. For the assortment read I ship NOT EXISTS or the LEFT JOIN — both keep the household grain and survive staging tables where EXCEPT's column contracts and NOT IN's three-valued logic bite; EXCEPT earns its keep when the comparison is a one-off set check in a board packet.",
      tag: "setops",
    },
    {
      id: "kroger-t13",
      q: "What is your COALESCE policy on the Kroger book — when is replacing a NULL legitimate, and when does it manufacture data?",
      a: "COALESCE is legitimate for display: a share column that would print NULL for a market with no abandoned trips reads better as 0.0, because zero abandons is a measured fact. It is legitimate for defaults the business holds: a missing optional attribute whose absence means 'none'. It manufactures data the moment it fills a NULL that means 'not yet' — COALESCE(shipped_at, created_at) makes every being-picked and abandoned trip claim same-day dispatch, the 2.98-day clock collapses, and the pickup-slot plan is built on trips that never happened. The test I say out loud: does the NULL mean none (safe to default) or not-yet / never (data to report)? If it is not-yet, the NULL stays in the query, the 14 pending rows stay in the denominator, and the population statement goes in the report title.",
      tag: "nulls",
    },
    {
      id: "kroger-t14",
      q: "Loyalty wants the Plus Card book cut into spend quartiles to size the fuel-point multiplier pilot. How do you build the tiles, and what do you check before the list ships?",
      a: "NTILE(4) OVER (ORDER BY lifetime_spend DESC) cuts the 16 households into four equal-count bands — tile 1 the top spenders under DESC. The checks: ties at a boundary get assigned by arbitrary order unless you name a tie-breaker (spend, then household id) — and a tie straddling tiles 2 and 3 decides who gets the bigger multiplier, which is a program-terms decision the query must encode, not hide. Grain: the window runs over households, so the input must already be one row per household, folded from trips first. And the interpretation: NTILE promises equal COUNTS, not equal value — tile 1 holds a quarter of the households, not a quarter of the book, and on a book where 63.5% of spend sits with 3,000-plus households, the top tile carries wildly more than a quarter of the value. The fuel-point debate quotes tile boundaries; the query has to be able to defend them.",
      tag: "windows",
    },
    {
      id: "kroger-t15",
      q: "GROUP BY month works when month is a SELECT alias on this trip spine. What is actually happening, and why is alias-in-GROUP-BY a habit to treat carefully?",
      a: "SQLite resolves SELECT aliases in GROUP BY (and HAVING and ORDER BY), so GROUP BY month where month is the STRFTIME alias folds the rows on the folded expression — convenient, and this kit's spine leans on it. The caution: most engines reject aliases in GROUP BY or resolve them differently, and the alias can shadow a real column of the same name, so a query that runs here can fail on the warehouse or silently group by the wrong thing. The portable habit is grouping by the full expression — GROUP BY STRFTIME('%Y-%m', created_at) — or staging the spine in a CTE where month is a real column of the derived table. What I never do is mix both: an alias matching a base column name plus GROUP BY on that name is how one trip's month quietly becomes two. Alias-GROUP-BY is a convenience, not a standard, and I name it as one in the query comment.",
      tag: "groupby",
    },
    {
      id: "kroger-t16",
      q: "A vendor feed lands 'simple truth organic', 'SIMPLE TRUTH ORGANIC' and 'Simple Truth Organic' for one Our Brands item. What breaks, and what is the cleaning pass before any join?",
      a: "The join key splits: group by the raw name and one Our Brands item becomes three rows, the brand-level fold undercounts every downstream revenue figure, and nothing errors — the numbers are just quietly wrong, which is the worst kind of wrong in a line review. The cleaning pass: normalize case first (UPPER or LOWER for the comparison key; title-casing only for display), TRIM the padding copy-paste feeds carry, collapse whitespace — before the strings ever meet a join or a GROUP BY. Stage it in a CTE — clean, then join — so the cleaning rules are auditable in one place. Then prove the fold: COUNT(DISTINCT cleaned_name) returns one row for this item, and the brand totals still foot to the 34,833.28 book. A dirty key is a silent fan-out; the interviewer wants the cleaning stated as a step, not assumed.",
      tag: "casing",
    },
    {
      id: "kroger-t17",
      q: "Compare each trip to the platform mean (338.19) and compare each trip to its OWN household's mean. Two subquery shapes — walk me through both and when each is the right tool.",
      a: "The platform read is a scalar subquery: (SELECT AVG(total) FROM orders) evaluates once, returns one number — 338.19 — and every trip compares against the same constant; uncorrelated, cheap, and it answers 'which trips are big for the chain?'. The per-household read is a correlated subquery: (SELECT AVG(total) FROM orders o2 WHERE o2.customer_id = o.customer_id) re-runs for every outer row and compares each trip to its own household's norm — a 24-trip habitual against their own average is the basket-elasticity signal, not the chain signal. The follow-up I expect unprompted: when the inner fold is empty, the scalar returns NULL, the comparison goes UNKNOWN, and the above-average report silently narrows — on staging tables (one market, one fate, one month) that is where the bug ships. State the inner fold's population and its empty-case behavior and the panel stops fishing.",
      tag: "subqueries",
    },
    {
      id: "kroger-t18",
      q: "The market pack wants every trip row to carry its share of its division's revenue — without collapsing the trip grain. Why a window and not a GROUP BY?",
      a: "GROUP BY region would fold 103 trips into 4 rows and destroy the trip detail the pack prints beside every share; a window computes the denominator without collapsing anything. SUM(total) OVER (PARTITION BY region) rides every row and holds that division's revenue total, so the share expression divides each trip by ITS division's book — EU trips by 15,089.23, US trips by 7,286.16 — while every trip keeps its row. The distinction I say out loud: GROUP BY changes the grain, a window keeps the grain and adds a column. PARTITION BY region is the GROUP BY's non-destructive twin, and the same pattern stacks — PARTITION BY region, month for a month-within-division share. One trap: the window's total includes abandoned trips unless the filter runs before the window sees the rows, so the denominator's definition ships with the query, same as any aggregate.",
      tag: "windows",
    },
    {
      id: "kroger-t19",
      q: "The vendor book is INTEGER cents; the trip book is REAL dollars. Explain the two money conventions and the one rule that keeps the close honest.",
      a: "The trip book (orders.total, order_items.unit_price) is REAL dollars already — sum it and round at the end. The vendor book (invoices.amount_cents, payments.amount_cents, expenses.amount_cents) is INTEGER cents, and the dollar read is amount_cents / 100.0. The rule is the .0: integer ÷ integer truncates, so an odd-cent settlement leg loses its cents — the .0 promotes the division to real arithmetic before any damage. ROUND does not save you: it folds nothing on an integer column and cannot recover digits a truncated division ate. And never mix conventions in one expression — SUM(total) + SUM(amount_cents)/100.0 is fine, SUM(total) + SUM(amount_cents) is a 100× lie in one term. The close's identity — 27 tender legs summing to 69,612.00 against the ledger cash credit, trial balance 181,080 against 181,080 — only reconciles when every cent read is the /100.0 read.",
      tag: "money",
    },
    {
      id: "kroger-t20",
      q: "The CRM export paginates the household ladder with ORDER BY lifetime_spend DESC LIMIT 20 OFFSET 20. What breaks on ties, and how do you make pagination reproducible?",
      a: "LIMIT/OFFSET cuts positions, not values, and positions among tied rows are arbitrary — four households tied at 4 trips straddle a page boundary differently on every run unless the sort is total. The fix is a deterministic ORDER BY: lifetime_spend DESC, then a named tie-breaker (household id), so every run orders identically and OFFSET lands on the same rows. The honest alternative for ladders is a rank window — RANK or DENSE_RANK over the spend — and paginate on the rank, so a tie block travels together and the cut cannot split peer households, which matters when the tie decides who shares the fuel-point multiplier. Two habits: OFFSET without LIMIT is meaningless, and deep OFFSET re-scans everything it skips, so big exports should keyset (WHERE (spend, id) < last-row). The follow-up is 'what does page 2 mean when rank 20 is shared four ways?' — the answer is the named tie-breaker policy, written in the query comment.",
      tag: "ordering",
    },
    {
      id: "kroger-t21",
      q: "The ops board gets completed, dispatched, picking and abandoned in one pass. Compare FILTER (WHERE …) with SUM(CASE …) — which do you ship, and why does one scan beat four queries?",
      a: "Both count conditionally in one pass: COUNT(*) FILTER (WHERE status = 'delivered') and SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) produce the same 52 over the same rows — FILTER is the readable dialect form, SUM(CASE) is the portable one, and I match the form to the team's engine. One scan beats four queries for the reason the ops board cares about: shared denominators. Four separate queries run at four moments against four snapshots, and the four branches stop summing to 103 — the reconciliation identity fails and the census is no longer provable. In one pass the branches partition the same rows, the identity holds by construction, and the value-weighted columns (SUM(total) FILTER …) share the same base as the count columns, so completed 52 of 103 and 15,571.07 of 34,833.28 can never disagree about what population they describe.",
      tag: "case-when",
    },
    {
      id: "kroger-t22",
      q: "DISTINCT versus GROUP BY — when does deduplicating and folding do the same job, and when do they diverge?",
      a: "On one column with no aggregates they coincide: SELECT DISTINCT region FROM orders and SELECT region FROM orders GROUP BY region print the same four division buckets. They diverge the moment anything else enters. Add a second column and DISTINCT dedups the PAIR — region with status prints every combination present, not one row per region — while GROUP BY region with an aggregate folds to the region grain. Add an aggregate and DISTINCT cannot do the job at all: COUNT(DISTINCT customer_id) is an aggregate over a deduplicated set inside the fold, which is how 45 trips collapse to 8 households — DISTINCT inside the counter, not in front of the SELECT. The habit the panel grades: name the grain first. 'One row per division' is a GROUP BY; 'which divisions exist' is a DISTINCT; 'how many households' is COUNT(DISTINCT). DISTINCT in front of a SELECT to 'remove duplicates' usually means the join fanned out and the bug is upstream.",
      tag: "distinct",
    },
    {
      id: "kroger-t23",
      q: "The market read wants only divisions whose abandonment share exceeds 5% — a threshold on a computed ratio. Where does that filter live, and why can't you just write WHERE abandon_pct > 5?",
      a: "The share is an aggregate expression — a folded numerator over a folded denominator — so it does not exist until after GROUP BY, and WHERE runs before any folding: WHERE abandon_pct > 5 errors, and filtering on the raw status in WHERE answers a different question (trips, not markets). The threshold lives in HAVING: GROUP BY region, then HAVING 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) > 5 — written out, because SELECT aliases are not portable into HAVING on every engine. On this db the 5% line keeps APAC 8.1 and EU 6.7 and drops US 5.3 and LATAM 0.0 — a one-notch move that rewrites the abandonment map, which is why the threshold's home is part of the definition. The staged alternative: fold the shares in a CTE, then WHERE on the folded column in the outer query — same result, and the pipeline reads top to bottom.",
      tag: "pipeline",
    },
    {
      id: "kroger-t24",
      q: "Your trip spine stages in a CTE, then the outer query layers LAG and the percentage. Why stage at all — and what does the CTE buy when the reviewer asks 'how do you know?'",
      a: "Because the window layer cannot see what WHERE is about to do, and WHERE cannot see what the window computed — the layers have to be sequenced, and a CTE is the sequencer. The inner fold builds the spine: 14 monthly buckets from 2024-01 to 2025-02, trips and value per bucket, one row per month. The outer query then walks it: LAG(revenue) OVER (ORDER BY month) reads the prior bucket, the percentage divides the delta by that same LAG, and the first month's NULL is the honest baseline — the book opens at 3,731.97 with no prior month to compare against. In one flat query those references would be repeated three times and the fold and window would blur; staged, each layer is testable — run the spine alone and check it foots to 103 trips and 34,833.28 before any window touches it. Name the CTE for its grain (monthly, not t1) and the query narrates itself to the reviewer who asks.",
      tag: "ctes",
    },
  ],

  mcqs: [
    {
      id: "kroger-mcq-1",
      prompt: "A trip row's status reads 'shipped'. In this kit's Kroger trip-fate map, what happened?",
      choices: ["Completed basket — the shopper paid and left", "Pickup/delivery order out the door, with shipped_at as the dispatch stamp", "Abandoned before fulfillment", "Order being picked in the store"],
      answer: 1,
      why: "The fate map is fixed: shipped = dispatched (30 of 103 trips, 29.1%), and shipped_at is its dispatch stamp. Completion is 'delivered' — 52 trips — and the two must never be conflated.",
      notes: [
        { choice: 0, why: "Completed is 'delivered' — 52 trips. Calling dispatched trips completed inflates the completed-basket rate from 50.5% before a single order reaches the door." },
        { choice: 3, why: "Being-picked is 'pending' — 14 trips with no shipped_at yet. Pending is not churn and not completed; it is the live workload, and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "kroger-mcq-2",
      prompt: "Completed-basket rate is delivered ÷ which population? The db holds 52 delivered, 30 dispatched, 14 picking, 7 abandoned of 103 booked.",
      choices: ["Delivered + dispatched only (52/82 = 63.4%)", "All trips booked (52/103 = 50.5%)", "Delivered ÷ abandoned (52/7)", "Distinct households (52/16)"],
      answer: 1,
      why: "The house definition: completed ÷ ALL trips booked — picking and abandoned trips stay in the denominator because 'booked demand the store had to serve' is exactly what the rate measures. 50.5% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 picking trips inflates the rate to 63.4% by deleting the population still in the pick path — the rows the funnel exists to watch." },
        { choice: 3, why: "52/16 is trips per household intensity wearing a rate costume — a different grain entirely, not a percentage of demand." },
      ],
      difficulty: "easy",
    },
    {
      id: "kroger-mcq-3",
      prompt: "The EU bucket carries 45 trips from 8 households. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts trip rows (45); COUNT(DISTINCT customer_id) folds repeats back to households (8). The gap between them — 5.6 trips per household — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every trip has a household. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts rollups, not households — a third grain nobody asked for. The census is trips AND Plus Card accounts." },
      ],
      difficulty: "easy",
    },
    {
      id: "kroger-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to abandoned trips only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the abandonment share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the abandonment map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "kroger-mcq-5",
      prompt: "Keep only households carrying at least 5 trips. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 5, before GROUP BY", "GROUP BY household HAVING COUNT(*) >= 5", "WHERE trips >= 5 on the raw orders table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A trip-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the 5-trip floor keeps exactly 5 households — 24, 17, 14, 13 and 5 trips.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'trips' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "kroger-mcq-6",
      prompt: "The trip ladder runs 24, 17, 14, 13, 5 trips, then FOUR households tied at 4. Under RANK, what rank do the two 3-trip households carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-trip households share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The loyalty program's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "kroger-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The picking trips double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the dispatched-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 trips.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "kroger-mcq-8",
      prompt: "A staging-table abandonment list uses household_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every trip carries a household id. But staging tables are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "kroger-mcq-9",
      prompt: "A board stack puts dispatched trips under abandoned trips in one layout, built with UNION. A reviewer says one household's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same household, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same household, same counts, no market or branch label — collapse into one, and the board loses a household with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "kroger-mcq-10",
      prompt: "A dashboard walks booked basket value trip by trip: SUM(total) OVER (ORDER BY created_at). Two trips share a created_at second, and the cumulative 'jumps two trips at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at trip grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "kroger-mcq-11",
      prompt: "The tender book holds 27 settlement legs across two rails: `SELECT method, COUNT(*), SUM(amount_cents)/100.0 FROM payments GROUP BY method`. What does the card row read?",
      choices: [
        "16 legs, 37,364.00",
        "27 legs, 69,612.00",
        "11 legs, 32,248.00",
        "16 legs, 32,248.00",
      ],
      answer: 0,
      why: "The card rail (card/EBT) carries 16 legs totaling 37,364.00; the wire/ACH rail carries 11 legs for 32,248.00. Together they foot to 27 legs and 69,612.00 — the number the ledger cash credit must tie to.",
      notes: [
        { choice: 1, why: "27 / 69,612.00 is the whole book, not the card rail — that row only appears without the GROUP BY, and then it is neither rail." },
        { choice: 2, why: "That is the wire row. Swapping the rails re-labels which settlements ran EBT-side and corrupts the reconciliation memo." },
      ],
      difficulty: "easy",
    },
    {
      id: "kroger-mcq-12",
      prompt: "The trust floor for the vendor bench is rating >= 4.5. The six CPG partners rate 4.6, 4.4, 4.8, 4.0, 4.1, 3.9. How many survive the floor?",
      choices: ["4", "2", "3", "6"],
      answer: 1,
      why: "Exactly two clear 4.5: Nordic at 4.6 and Alpine at 4.8. The floor is a business rule — the renewal conversation seats two partners, not the four that a 4.0 floor would seat.",
      notes: [
        { choice: 0, why: "Four is the 4.0-floor answer — Midwest (4.4), Andes (4.0) and Shenzhen (4.1) re-enter, and the buyer opens renewal talks with partners the trust policy excludes." },
        { choice: 2, why: "3 is the 4.1-floor answer — Shenzhen sneaks in at exactly 4.1. Boundary values decide the bench; >= is not >." },
      ],
      difficulty: "easy",
    },
    {
      id: "kroger-mcq-13",
      prompt: "The pickup clock is `julianday(shipped_at) - julianday(created_at)` over dispatched trips. What is one unit of the result?",
      choices: [
        "Seconds between booking and dispatch",
        "Days — whole and fractional — between booking and out-the-door, so the 2.98 average reads in days",
        "The count of trips dispatched",
        "Hours, always rounded to the nearest hour",
      ],
      answer: 1,
      why: "julianday converts a timestamp to a real number of days, so a difference reads in fractional days — the 82 stamped trips average 2.98. One unit is one day; 0.5 is half a day.",
      notes: [
        { choice: 0, why: "Seconds would need ×86,400. Reading 2.98 as seconds would make the pickup promise wrong by five orders of magnitude — and nothing errors to warn you." },
        { choice: 2, why: "The count of dispatched trips is COUNT(shipped_at) — 82. The julianday difference is a duration measure, not a census." },
      ],
      difficulty: "easy",
    },
    {
      id: "kroger-mcq-14",
      prompt: "The trip census counts being-picked orders inline: `COUNT(*) FILTER (WHERE status = 'pending')`. What is the portable twin that runs on any SQL engine?",
      choices: [
        "COUNT(status = 'pending')",
        "SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)",
        "COUNT(*) WHERE status = 'pending'",
        "SUM(pending)",
      ],
      answer: 1,
      why: "FILTER (WHERE …) is dialect sugar; the portable form branches each row to a 1/0 flag and sums — the same 14 trips being picked, any engine. Both are one-scan conditional counts over a shared denominator.",
      notes: [
        { choice: 0, why: "COUNT takes an expression and counts non-NULLs — status = 'pending' evaluates to 1 or 0 and COUNT counts both, printing the group size. The flag never zeroes a row out." },
        { choice: 3, why: "There is no 'pending' column — the branch is a predicate over status. SUM needs the CASE to build its own 1/0 flags." },
      ],
      difficulty: "easy",
    },
    {
      id: "kroger-mcq-15",
      prompt: "COUNT(*) over orders reads 103; COUNT(shipped_at) reads 82. What population does the 21-row gap hold?",
      choices: [
        "The completed trips — they never get a stamp",
        "The 14 being-picked trips plus the 7 abandoned ones — rows with no van stamp yet or ever",
        "The delivered trips minus the dispatched ones",
        "Duplicate trips from a double-booked slot",
      ],
      answer: 1,
      why: "shipped_at is the dispatch stamp: the 14 pending (being picked) have not rolled yet and the 7 abandoned never will — 21 rows with NULL stamps. The gap between COUNT(*) and COUNT(shipped_at) IS the live workload plus the churn, which is a feature, not a bug.",
      notes: [
        { choice: 0, why: "Completed trips DID carry a stamp on their way out the door — they are inside the 82. The stamp disappears only when nothing was dispatched." },
        { choice: 2, why: "Delivered and dispatched are both stamped populations — 52 and 30 overlap in lifecycle, not in the NULL gap. The gap is precisely the unstamped 21." },
      ],
      difficulty: "easy",
    },
    {
      id: "kroger-mcq-16",
      prompt: "Statement #11 carries 92,550 cents. Which expression prints 925.50 honestly?",
      choices: [
        "amount_cents / 100",
        "ROUND(amount_cents, 2)",
        "amount_cents / 100.0",
        "SUM(amount_cents)",
      ],
      answer: 2,
      why: "Integer ÷ integer truncates: 92550 / 100 reads 925 and the half-cent is gone. The .0 promotes the division to real arithmetic first — the cents-safe rule the whole vendor book runs on.",
      notes: [
        { choice: 1, why: "ROUND folds nothing — the cents are already integers, and rounding cannot recover digits a truncated division already ate." },
        { choice: 0, why: "This is the exact bug: on round-cent legs it looks fine, and on every odd-cent leg it silently leaks. The leak surfaces at the trial balance, not at this row." },
      ],
      difficulty: "medium",
    },
    {
      id: "kroger-mcq-17",
      prompt: "A weekly ad runs March 1–31. `WHERE created_at BETWEEN '2024-03-01' AND '2024-03-31'` — what is wrong?",
      choices: [
        "Nothing — BETWEEN is inclusive on both ends by design",
        "It drops the ad's last night — end-of-month trips carry times after 00:00; the half-open form is `created_at >= '2024-03-01' AND created_at < '2024-04-01'`",
        "It includes April's trips too",
        "BETWEEN cannot compare TEXT timestamps",
      ],
      answer: 1,
      why: "'2024-03-31' as a bound means midnight at the START of March 31 — every trip stamped later that day is outside, and ad-end is exactly when stock-up runs land. Half-open intervals keep the whole window.",
      notes: [
        { choice: 0, why: "Inclusive on both ends is the bug, not the feature: the upper bound includes only March 31 00:00:00, not the day." },
        { choice: 2, why: "BETWEEN is inclusive — April trips need created_at >= '2024-04-01', which this query excludes. The leak is at the END of March, not the start of April." },
      ],
      difficulty: "medium",
    },
    {
      id: "kroger-mcq-18",
      prompt: "Merchandising wants households that bought from the Audio category but never touched Wearables. Which shape answers it?",
      choices: [
        "UNION of the Audio-trip list and the Wearables-trip list",
        "INTERSECT of the two lists",
        "EXCEPT: Audio-trips EXCEPT Wearables-trips — set difference keeps Audio-only households",
        "A FULL OUTER JOIN of the two lists",
      ],
      answer: 2,
      why: "Never-touched is set difference: A EXCEPT B keeps households in A with no row in B, deduped. UNION answers 'either', INTERSECT answers 'both' — three set ops, three different merchandising questions.",
      notes: [
        { choice: 1, why: "INTERSECT finds households that bought BOTH — the cross-category cohort, the opposite of 'never touched'." },
        { choice: 3, why: "FULL OUTER JOIN shows both lists side by side including the misses — a Venn diagram, not the subtraction the ask needs." },
      ],
      difficulty: "medium",
    },
    {
      id: "kroger-mcq-19",
      prompt: "The market pack wants each trip to carry its share of ITS division's revenue: `ROUND(100.0 * total / SUM(total) OVER (?), 1)`. What goes in the parens?",
      choices: [
        "Nothing — a bare OVER() already scopes the denominator per division",
        "PARTITION BY region — each trip divides by its own division's total",
        "GROUP BY region",
        "ORDER BY region",
      ],
      answer: 1,
      why: "PARTITION BY region computes SUM over each division's rows without collapsing them — EU trips divide by 15,089.23, US trips by 7,286.16. A bare OVER() sums the whole 34,833.28 book, and every divisional share under-reads.",
      notes: [
        { choice: 0, why: "A bare OVER() is the whole-book window — one denominator for all 103 trips. That is the chain share, not the division share." },
        { choice: 2, why: "GROUP BY is not window syntax — it collapses the rows the pack needs to print. The window keeps the grain AND scopes the denominator." },
      ],
      difficulty: "medium",
    },
    {
      id: "kroger-mcq-20",
      prompt: "The biggest-basket read is `SELECT id FROM orders ORDER BY total DESC LIMIT 1`. A re-run after tomorrow's trading finds two trips tied at the top. What does the query return?",
      choices: [
        "Both trips",
        "One of them — arbitrarily; argmax-by-LIMIT needs a named tie-breaker to be reproducible",
        "An error — ties are illegal under ORDER BY",
        "The average of the two totals",
      ],
      answer: 1,
      why: "LIMIT 1 cuts after the sort, and the engine's order among tied rows is unspecified — one trip wins by accident. The fix is a named tie-breaker (earlier created_at, then id) or a RANK window that shares rungs deliberately.",
      notes: [
        { choice: 0, why: "LIMIT 1 returns exactly one row — that is its contract. Two shared rungs need RANK, not LIMIT." },
        { choice: 2, why: "Ties sort fine; what is unspecified is their relative order. The failure is reproducibility, not a crash — worse, because the deck ships anyway." },
      ],
      difficulty: "medium",
    },
    {
      id: "kroger-mcq-21",
      prompt: "The trip spine's first row prints prev_revenue = NULL and the deck wants a number in that cell. What is the honest move?",
      choices: [
        "COALESCE to 0 — January opens flat",
        "COALESCE to the row's own revenue — a 0% opening change",
        "Leave it NULL or label the cell 'baseline' — no prior month exists, and inventing one fabricates a movement",
        "Drop the first row from the spine",
      ],
      answer: 2,
      why: "The NULL is information: January 2024 has no in-log prior month, so a month-over-month change is undefined, not zero. Labeling it 'baseline' keeps the spine honest; coalescing to 0 invents a jump, coalescing to self invents a flat month.",
      notes: [
        { choice: 0, why: "0 as prior revenue turns the opening month into +∞% (or an error) — the single most-worn band on the trend deck." },
        { choice: 3, why: "Dropping the row loses the baseline month everyone anchors against. The spine is 14 buckets including the one with no prior." },
      ],
      difficulty: "medium",
    },
    {
      id: "kroger-mcq-22",
      prompt: "The spine's month keys are TEXT — '2024-01' … '2025-02'. Does `ORDER BY month` produce chronological order?",
      choices: [
        "No — TEXT needs a CAST to sort chronologically",
        "Yes — zero-padded 'YYYY-MM' keys sort chronologically as text; that is exactly why the padding matters",
        "Only if an index exists on month",
        "No — SQLite falls back to rowid order for TEXT keys",
      ],
      answer: 1,
      why: "Lexicographic order on zero-padded 'YYYY-MM' keys IS chronological order — '2024-12' < '2025-01' sorts correctly as text. Drop the padding (or slice month alone) and December merges into position 1, breaking both the fold and the sort.",
      notes: [
        { choice: 0, why: "The zero-padding is what makes the CAST unnecessary — this is the whole reason the spine uses '%Y-%m' rather than '%Y-%-m'." },
        { choice: 2, why: "An index changes speed, not sort semantics. TEXT keys order by collation, which for digits-and-dashes is lexicographic — chronological here." },
      ],
      difficulty: "easy",
    },
    {
      id: "kroger-mcq-23",
      prompt: "A reviewer wants months whose trip value beats the platform monthly average. You try `WHERE revenue > AVG(revenue)` inside the spine query and it errors. Why — and what is the fix?",
      choices: [
        "AVG needs an ORDER BY to aggregate; add one",
        "WHERE runs before aggregates and windows exist — fold the spine in a CTE, then filter the folded column in the outer SELECT (or HAVING the raw aggregate)",
        "SQLite allows WHERE on SELECT aliases; the error is elsewhere",
        "Move AVG into the GROUP BY",
      ],
      answer: 1,
      why: "The pipeline runs FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY: at WHERE time no group, no aggregate, no window exists to compare against. Stage the fold in a CTE and the outer query filters a real column — the same reason the trend walk is staged.",
      notes: [
        { choice: 0, why: "AVG over a column needs no ORDER BY. The error is the pipeline stage, not the aggregate's syntax." },
        { choice: 2, why: "Even where SQLite tolerates aliases in WHERE, AVG(revenue) as a bare aggregate over the un-fanned rows is still illegal without GROUP BY — the stage order is the real lesson." },
      ],
      difficulty: "hard",
    },
    {
      id: "kroger-mcq-24",
      prompt: "Loyalty builds spend quartiles: `NTILE(4) OVER (ORDER BY lifetime_spend DESC)` over the 16 households. What does tile 1 hold?",
      choices: [
        "The four lowest-spending households",
        "The four highest-spending households — DESC puts the top spenders in tile 1",
        "One household from each division",
        "NULL — NTILE requires a PARTITION BY",
      ],
      answer: 1,
      why: "NTILE(4) cuts ordered rows into four equal-count bands, and the ORDER BY direction decides which end lands in tile 1: DESC makes tile 1 the top spenders, tile 4 the lightest. Equal counts, not equal value — tile 1 holds a quarter of the HOUSEHOLDS, not a quarter of the book.",
      notes: [
        { choice: 0, why: "That is the ASC answer. Direction is a business decision here — the fuel-point pilot targets the top band, so getting it backwards enrolls the lightest baskets." },
        { choice: 2, why: "NTILE ignores everything but the ORDER BY within its partition — no PARTITION BY means the whole book is one partition of 16, cut 4/4/4/4." },
      ],
      difficulty: "hard",
    },
    {
      id: "kroger-mcq-25",
      prompt: "After `FROM order_items oi JOIN orders o ON o.id = oi.order_id`, three counters run: COUNT(*), COUNT(DISTINCT o.id), COUNT(DISTINCT o.customer_id). On this db they read —",
      choices: ["103, 103, 16", "251, 103, 16", "251, 251, 103", "16, 103, 251"],
      answer: 1,
      why: "The join fans 103 trips out to 251 basket lines: COUNT(*) counts the joined rows (251), COUNT(DISTINCT o.id) folds back to trips (103), COUNT(DISTINCT o.customer_id) folds back to households (16). Three counters, three grains — the two-grain habit at line grain.",
      notes: [
        { choice: 0, why: "That is the un-joined census. The fan-out is the entire point: after the join, COUNT(*) counts lines, not trips." },
        { choice: 2, why: "Backwards: DISTINCT o.id cannot exceed the raw count of joined rows, and households fold SMALLER than trips, not larger." },
      ],
      difficulty: "hard",
    },
    {
      id: "kroger-mcq-26",
      prompt: "A staging feed can carry NULL ids. Which two anti-join shapes survive a stray NULL in the compared column?",
      choices: [
        "NOT IN and NOT EXISTS",
        "NOT EXISTS and LEFT JOIN … IS NULL",
        "NOT IN and LEFT JOIN … IS NULL",
        "All three behave identically on NULLs",
      ],
      answer: 1,
      why: "NOT IN is the one that breaks: x NOT IN (…, NULL) is UNKNOWN for every row, and the report silently empties. NOT EXISTS judges existence row by row, and LEFT JOIN + IS NULL reads the NULL payload directly — both are NULL-proof.",
      notes: [
        { choice: 0, why: "NOT IN is exactly the poisoned one — one NULL in the subquery and every comparison goes UNKNOWN. Pairing it with NOT EXISTS as 'the two safe ones' is backwards." },
        { choice: 2, why: "LEFT JOIN + IS NULL is safe; NOT IN is not. One NULL in the list and the anti-join returns zero rows while looking valid." },
      ],
      difficulty: "medium",
    },
    {
      id: "kroger-mcq-27",
      prompt: "The coupon pod wants households that bought from BOTH the Audio and Accessories categories this quarter. The honest set shape is —",
      choices: [
        "UNION of the two buyer lists",
        "INTERSECT of the two buyer lists — households present in both, deduped",
        "WHERE category = 'Audio' AND category = 'Accessories'",
        "A CROSS JOIN of the two lists",
      ],
      answer: 1,
      why: "Both-category membership is set intersection: dedup each buyer list, then keep households present in both. A single row cannot hold two category values, which is why the AND-in-WHERE shape returns nothing.",
      notes: [
        { choice: 0, why: "UNION answers 'either category' — the broad-reach cohort. It cannot express the AND the coupon targets." },
        { choice: 2, why: "One row, one category value — category can never equal two different strings at once. This is the classic single-row vs set-membership confusion." },
      ],
      difficulty: "hard",
    },
    {
      id: "kroger-mcq-28",
      prompt: "`SELECT name, total, (SELECT AVG(total) FROM orders) AS chain_mean FROM orders` — how many times does the inner query run, and what does chain_mean hold?",
      choices: [
        "Once per row — each trip compared to its own household's mean",
        "Once for the whole query — every row carries the same 338.19 chain mean",
        "Once per distinct total value",
        "It errors — subqueries cannot appear in SELECT",
      ],
      answer: 1,
      why: "The subquery is uncorrelated — it references no outer column — so SQLite evaluates it once and the constant rides every row: 338.19 across all 103. Per-household means need a correlated subquery or a window with PARTITION BY customer_id.",
      notes: [
        { choice: 0, why: "That describes the CORRELATED shape, which needs a WHERE matching the outer household. Without the correlation, one evaluation serves all rows." },
        { choice: 3, why: "Scalar subqueries in SELECT are standard SQL — the constant column is their bread-and-butter use." },
      ],
      difficulty: "hard",
    },
    {
      id: "kroger-mcq-29",
      prompt: "COUNT(DISTINCT customer_id) over the book reads 16. A colleague computes SUM(DISTINCT customer_id) instead — 136 — and calls it household coverage. What is the read?",
      choices: [
        "Fine — 136 is 16 households × 8.5 average, a valid intensity metric",
        "Garbage — ids are labels, not quantities; the sum is a coincidence of key assignment that changes if a household re-registers",
        "Valid but slow — SUM(DISTINCT) should be replaced with COUNT(DISTINCT) for performance",
        "It errors — DISTINCT is not allowed inside SUM",
      ],
      answer: 1,
      why: "SUM over an id column adds labels: 136 is what the keys 1–16 happen to total, not a business quantity. Re-register one household with a new id and the 'coverage' number moves while the business fact does not — the read has no denominator, no unit, and no meaning. COUNT(DISTINCT) counts; SUM(DISTINCT id) invents.",
      notes: [
        { choice: 0, why: "No such identity holds — 136/16 is 8.5 only because the keys are 1–16. Seed ids differently and the same book reads a different 'intensity'." },
        { choice: 3, why: "DISTINCT is legal inside any aggregate. The failure is semantic — a number that runs is not a number that means." },
      ],
      difficulty: "hard",
    },
    {
      id: "kroger-mcq-30",
      prompt: "The CRM export paginates `ORDER BY created_at LIMIT 50 OFFSET 50`; two trips share a created_at second. What can happen between runs?",
      choices: [
        "Nothing — ORDER BY created_at is deterministic for equal keys",
        "The tied trips can swap sides of the page boundary — one appears on two exports or on none, because the order among equal keys is unspecified; add a total order (created_at, then id)",
        "The export errors on the duplicate key",
        "OFFSET shifts by one row to compensate automatically",
      ],
      answer: 1,
      why: "ORDER BY created_at is a partial order — ties are unordered, and the engine may return them in either order across runs, so a page cut at a tie can duplicate or drop a trip. Reproducible pagination needs a total order: created_at, then a unique tie-breaker like id.",
      notes: [
        { choice: 0, why: "Deterministic requires a TOTAL order — equal keys leave the engine free, and 'free' changes between runs and plans." },
        { choice: 3, why: "OFFSET is a dumb position cut; it compensates for nothing. The fix is the tie-breaker in the sort, not magic in the offset." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-kroger-1",
      tier: "easy",
      topic: "j7",
      universe: "supplier",
      title: "The national-brand shelf bench",
      brief:
        "Kroger-flavored brief on the storefront db: merchandising walks into the Our Brands line review with the national-brand bench census — per CPG partner, the shelf it holds (distinct SKUs listed), its rating, and the scanned revenue folded from basket lines at shelf price. The buyer applies the trust floor first: rating >= 4.5 or the partner does not get a renewal conversation. Probed facts: the full six-partner bench folds to Nordic Gadgets AB 4.6 / 3 SKUs / 11,130.25, Midwest Hardware Co 4.4 / 3 / 9,294.93, Alpine Audio GmbH 4.8 / 2 / 4,765.63, Andes Naturals SA 4.0 / 2 / 3,613.25, Shenzhen Electro 4.1 / 3 / 3,049.07, Pacific Textiles 3.9 / 3 / 2,980.15 — the 4.5 floor keeps exactly two: Nordic (11,130.25, 32% of the book) and Alpine (4,765.63, 13.7%). The review reads biggest book first, and listings-on-shelf are counted at SKU grain, not line grain.",
      ask: "Return each CPG partner above the 4.5 rating floor with division, rating, distinct SKUs on shelf and scanned revenue to 2 decimals, biggest revenue first.",
      template:
        "SELECT s.name AS partner,\n       s.region AS region,\n       s.rating AS rating,\n       COUNT({1} p.id) AS skus,\n       ROUND(SUM(oi.{2} * oi.unit_price), 2) AS revenue\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.product_id = p.id\nWHERE s.rating >= {3}\nGROUP BY s.name, s.region, s.rating\nORDER BY revenue {4};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the shelf deduplicator",
          why: "COUNT(DISTINCT p.id) counts SKUs on the shelf — Nordic reads 3. The join fans every SKU out to its basket lines, so a bare COUNT(p.id) counts lines scanned (43 for Nordic), not facings held — and the shelf argument collapses into a sales argument.",
        },
        {
          answer: "quantity",
          kind: "keyword",
          label: "the units column",
          why: "Scanned revenue is units × shelf price — SUM(oi.quantity * oi.unit_price) folds the 251 basket lines into each partner's book: Nordic 11,130.25. oi.id multiplies line numbers by price and invents revenue; unit_price squared prices the price, not the basket.",
        },
        {
          answer: "4.5",
          kind: "number",
          label: "the trusted-bench floor",
          why: "The buyer's trust floor is rating >= 4.5 — the threshold that keeps exactly two of six partners: Nordic (4.6) and Alpine (4.8). At 4.0 the bench suddenly seats Midwest, Andes and Shenzhen too, and the renewal conversation starts with the wrong five suppliers.",
          noVerify: true,
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The line review reads biggest book on top: Nordic 11,130.25, then Alpine 4,765.63. ASC would open the negotiation on the smaller partner — a correct query aimed at the wrong end of the table.",
        },
      ],
      distractors: ["SUM", "id", "unit_price", "4", "ASC", "MAX"],
      walkthrough:
        "One three-table chain, two grains, one floor. The join walks partners to their SKUs to their basket lines — the WHERE applies the buyer's 4.5 trust floor, and GROUP BY folds the surviving lines into two rows where COUNT(DISTINCT p.id) reads SKUs on shelf (Nordic 3, Alpine 2 — facings, not the 43 and 40 lines their products appear in) and ROUND(SUM(oi.quantity * oi.unit_price), 2) reads scanned revenue (11,130.25 / 4,765.63), both straight from the probed bench. The floor is the story: 4.5 seats exactly two of six partners, and the unfiltered bench behind it runs Nordic 11,130.25 / Midwest 9,294.93 / Alpine 4,765.63 / Andes 3,613.25 / Shenzhen 3,049.07 / Pacific 2,980.15 — 32% of the book in one partner, which is why the trust floor and the revenue sort share the slide. The distractors fail honestly: SUM in the shelf slot errors, a bare id in the units slot multiplies line numbers by shelf price and mints fake revenue, unit_price squared prices the price, 4 drops the floor and seats five partners, ASC flips the read to the smallest book, and MAX breaks the aggregate outright. The two-grain pairing is the negotiation: Alpine holds 2 SKUs for 4,765.63 (2,382.82 per facing) while Pacific holds 3 for 2,980.15 — shelf productivity, not just shelf size.",
    },
    {
      id: "cs-kroger-2",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The Plus Card value ladder",
      brief:
        "Kroger-flavored brief on the storefront db: the loyalty board ranks Plus Card households by lifetime basket spend, but only households with real frequency make the ladder — the gate is 5 or more trips in the window, the same floor the fuel-point multiplier review uses. Probed facts: the book is 34,833.28 across 103 trips from 16 households, average 338.19 per trip; the trip-count distribution puts four households at 4 trips — one step below the gate — and the 5-trip floor keeps exactly 5 households. Above the gate the spend ladder runs 7,262.35 / 6,640.56 / 4,574.23 / 3,644.56 / 2,667.93 over 24 / 17 / 14 / 13 / 5 trips. The top five spends are all distinct, so the ladder prints clean rungs 1 through 5 with no shared rank; the board reads rank order, biggest spend first.",
      ask: "Return each household with 5 or more trips showing name, division, trip count, lifetime spend to 2 decimals and a rank, biggest spend first.",
      template:
        "WITH plus_card AS (\n  SELECT c.name AS household,\n         c.region AS region,\n         COUNT(*) AS trips,\n         ROUND(SUM(o.total), 2) AS spend\n  FROM orders o\n  JOIN customers c ON c.id = {1}\n  GROUP BY c.name, c.region\n  HAVING COUNT(*) >= {2}\n)\nSELECT household,\n       region,\n       trips,\n       spend,\n       {3}() OVER (ORDER BY spend {4}) AS value_rank\nFROM plus_card\nORDER BY value_rank;",
      slots: [
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the trip-to-household key",
          why: "Every trip inherits its household through o.customer_id — the join key that lets COUNT(*) fold 103 trips into per-household frequencies. c.id = c.region compares an id to a division code and matches nothing; a constant id collapses the whole book onto one household.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the five-trip loyalty floor",
          why: "The gate is COUNT(*) >= 5 — the frequency the fuel-point multiplier review honors. At 4 the ladder admits the four-way tie block (four households at 4 trips each) and the board's tier math rewrites itself; at 2 it admits 14 households and the 'loyal' tier becomes everyone who came back once.",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the ladder function",
          why: "RANK() OVER (ORDER BY spend DESC) prints the value ladder with a rank per rung — 1 through 5 here, since the five spends are distinct. SUM or LAG with empty parens is a syntax error; a bare window aggregate is not a ranking at all.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-spend-first direction",
          why: "Rank 1 must be the 7,262.35 household, not the 2,667.93 one — the ladder reads biggest spend first. ASC inverts the program: the top fuel-point multiplier would go to the smallest account on the ladder.",
        },
      ],
      distractors: ["c.region", "4", "2", "SUM", "LAG", "ASC"],
      walkthrough:
        "Two stages: fold the book to households, then rank the survivors. The CTE joins 103 trips to their Plus Card accounts on o.customer_id, GROUP BY folds them to 16 households, and the HAVING gate at 5 trips keeps exactly 5 — Alice Chen EU 24 trips / 7,262.35, Emma Wilson US 17 / 6,640.56, Grace Kim APAC 14 / 4,574.23, Maya Patel APAC 13 / 3,644.56, Chloe Dubois EU 5 / 2,667.93 — the probed ladder, row for row. The outer SELECT adds RANK() OVER (ORDER BY spend DESC): five distinct spends, five clean rungs 1–5, no shared rank to arbitrate — the tie policy only bites below the gate, where four households sit at 4 trips. The concentration read falls out of the same rows: these 5 households carry 24,789.63 of the 34,833.28 book, and the 63.5%-from-3,000-plus concentration number the board quotes is this ladder wearing a percentage. The distractors each break differently: c.region as the join key matches id to division code and empties the ladder; 4 or 2 as the floor let the tie block or the whole repeat base in; SUM or LAG in the rank slot error outright; ASC hands rank 1 to the smallest spender. The board's rule holds: frequency gate in HAVING, spend ladder in RANK, biggest first.",
    },
    {
      id: "cs-kroger-3",
      tier: "medium",
      topic: "j3",
      universe: "month-close",
      title: "The tender-rail split",
      brief:
        "Month-close brief, in-world: the finance pod reconciles the two tender rails before the close ships — the card/EBT rail (method 'card') against the ACH settlement rail (method 'wire'), folded per division market. Probed on the storefront db: 27 settlement legs over 28 statements, and the three-table chain (payments → invoices → customers) splits them EU 14 legs / 37,261.00 (card 19,124.50 / wire 18,136.50), APAC 8 / 20,613.00 (card 6,501.50 / wire 14,111.50 — the wire-heavy market), US 5 / 11,738.00 all-card with zero wire legs, and LATAM with no legs at all — its claim never settled. The rails foot: 14 + 8 + 5 = 27 legs, 37,261 + 20,613 + 11,738 = 69,612.00, tying to the ledger cash credit.",
      ask: "Return each market with its leg count, settled dollars, the card-rail fold and the wire-rail fold, biggest settled first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS legs,\n       ROUND(SUM(p.amount_cents) / 100.0, 2) AS settled,\n       SUM({1} WHEN p.method = 'card' THEN p.amount_cents ELSE 0 END) / 100.0 AS card_rail,\n       SUM(CASE WHEN p.method = {2} THEN p.amount_cents ELSE 0 END) / 100.0 AS wire_rail\nFROM payments p\nJOIN invoices i ON i.id = p.invoice_id\nJOIN customers c ON c.id = i.customer_id\nGROUP BY c.region\nORDER BY settled {3};",
      slots: [
        {
          answer: "CASE",
          kind: "keyword",
          label: "the rail branch opener",
          why: "The card rail is a conditional fold — SUM(CASE WHEN p.method = 'card' …) branches each leg to its cents or zero. Without the CASE the fold cannot split the rails inside one scan, and the split is the whole read.",
        },
        {
          answer: "'wire'",
          kind: "keyword",
          label: "the ACH-rail label",
          why: "The second branch folds method = 'wire' — the ACH settlement rail, 11 legs for 32,248.00 across the book. 'card' here would print the card legs into the wire column twice-over and the rails would cross-foot wrong.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The close reads biggest settled book on top: EU 37,261.00, then APAC 20,613.00, then US 11,738.00. ASC opens the reconciliation on the smallest market and the reviewer reads the rails backwards.",
        },
      ],
      distractors: ["'card'", "SUM", "INNER", "LEFT", "ASC"],
      walkthrough:
        "One three-table chain, two rails, one close. Payments join to their statements and statements to their households' division — GROUP BY market folds the legs, and the two CASE branches split each market's book by method in the same scan: EU reads 14 legs / 37,261.00 with the rails nearly even (19,124.50 card vs 18,136.50 wire), APAC reads 8 / 20,613.00 and is the wire-heavy market (14,111.50 vs 6,501.50), and US reads 5 / 11,738.00 entirely on the card rail — its wire_rail prints 0, the honest zero for a rail that never fired there. LATAM appears nowhere: its statement has no settlement legs, which is exactly the never-settled fact the AR anti-join carries. Everything foots — 27 legs, 69,612.00, tying to the ledger cash credit — which is what makes the split defensible. SUM in the branch slot errors (a fold inside a fold with no CASE), 'card' in the wire slot double-prints the card rail, INNER/LEFT in either branch slot are syntax errors, and ASC reads the book bottom-up. Every distractor breaks a different promise of the close.",
    },
    {
      id: "cs-kroger-4",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The fuel-point cushion ladder",
      brief:
        "Growth brief, in-world: the fuel-point multiplier pilot runs in one division first, and the loyalty board wants each household's cushion — how much more it has spent than the next household DOWN the ladder — to argue who really anchors the market. Probed on the storefront db for the APAC division: five Plus Card households, spend ladder Grace Kim 4,574.23 (cushion 929.67 over Maya Patel), Maya Patel 3,644.56 (2,185.59 over Farid Nasser), Farid Nasser 1,458.97 (360.37 over Keiko Sato), Keiko Sato 1,098.60 (269.51 over Hiro Tanaka), Hiro Tanaka 829.09 (the last rung — no next household, cushion honestly NULL). The gap story: the top cushion is NOT the top household — Maya's 2,185.59 gap over Farid is where the ladder actually breaks.",
      ask: "Return the APAC ladder: household, lifetime spend to 2 decimals, and the cushion over the next household down, biggest spend first.",
      template:
        "WITH ladder AS (\n  SELECT c.name AS household,\n         c.region AS region,\n         ROUND(SUM(o.total), 2) AS spend\n  FROM orders o\n  JOIN customers c ON c.id = {1}\n  WHERE c.region = {2}\n  GROUP BY c.name, c.region\n)\nSELECT household,\n       spend,\n       ROUND(spend - LEAD(spend) OVER (ORDER BY spend {3}), 2) AS cushion\nFROM ladder\nORDER BY spend DESC\nLIMIT {4};",
      slots: [
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the trip-to-household key",
          why: "Every trip inherits its household through o.customer_id — the join key that lets SUM(o.total) fold 103 trips into per-household spend. c.id = c.region compares an id to a division code and matches nothing; a constant id collapses the whole division onto one household.",
        },
        {
          answer: "'APAC'",
          kind: "keyword",
          label: "the pilot division",
          why: "The pilot is scoped to the APAC bucket — five households, 37 trips. 'EU' re-runs the ladder on the eight-household division and the cushion debate quotes a different market; the WHERE is the pilot's scope, not a decoration.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the down-the-ladder direction",
          why: "LEAD over spend DESC reads the next household DOWN, so cushion = spend − next is a positive gap. ASC reads the next household UP and every cushion goes negative — the same rows telling the opposite story.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the ladder cut",
          noVerify: true,
          why: "LIMIT 5 returns the whole APAC ladder — five households, ending on Hiro Tanaka's 829.09 whose cushion is honestly NULL because no next household exists. The cut keeps the last rung visible, and the NULL rung is the point.",
        },
      ],
      distractors: ["c.region", "'EU'", "ASC", "3", "2"],
      walkthrough:
        "Two stages: fold the division to households, then walk the ladder. The CTE joins 37 APAC trips to their Plus Card accounts on o.customer_id and folds them to five households; the outer SELECT orders by spend DESC and reads each household's cushion with LEAD(spend) OVER (ORDER BY spend DESC) — spend minus the next household down: Grace 4,574.23 over Maya by 929.67, Maya 3,644.56 over Farid by 2,185.59, Farid 1,458.97 over Keiko by 360.37, Keiko 1,098.60 over Hiro by 269.51, and Hiro's cushion is NULL — the last rung, no next household, no invented zero. The business beat: the biggest cushion is NOT the top of the ladder. Maya's 2,185.59 gap over Farid is where APAC's spend actually breaks, which is the row the pilot argument quotes. LEAD is the forward reader and DESC points it down the ladder; ASC flips every cushion negative; the join key and the division filter are the scope — wrong key or wrong division quotes the wrong market; 3 or 2 amputates the bottom rungs and hides the NULL that proves the ladder ends. Every chip changes who the pilot enrolls.",
    },
    {
      id: "cs-kroger-5",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The value-weighted trip census",
      brief:
        "Ops brief, in-world: the 07:45 dashboard opens with the trip-fate census — but fate counts alone hide where the money sits, so the board reads counts AND value in one pass. Probed on the storefront db: 103 trips booked worth 34,833.28; completed 52 trips carrying 15,571.07 (44.7% of the book), dispatched 30 carrying 11,996.72 (34.4%), abandoned 7 carrying just 1,152.49 (3.3% — abandons are frequent, not fat), which leaves the 14 being-picked trips holding 6,113.00 in the pick queue. One scan, three FILTER fate branches plus their value twins, reconciling to 103 trips and 34,833.28 by construction.",
      ask: "Return one row: total trips and booked value, then completed / dispatched / abandoned counts with their value twins.",
      template:
        "SELECT COUNT(*) AS trips,\n       ROUND(SUM(total), 2) AS booked,\n       COUNT(*) FILTER (WHERE status = {1}) AS completed,\n       COUNT(*) FILTER (WHERE status = {2}) AS dispatched,\n       COUNT(*) FILTER (WHERE status = {3}) AS abandoned,\n       ROUND(SUM(CASE WHEN status = 'delivered' THEN total ELSE 0 END), 2) AS completed_value,\n       ROUND(SUM(CASE WHEN status = 'shipped' THEN total ELSE 0 END), 2) AS dispatched_value,\n       ROUND(SUM(CASE WHEN status = 'cancelled' THEN total ELSE 0 END), 2) AS abandoned_value\nFROM orders;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed-fate branch",
          why: "Completed baskets are status 'delivered' — 52 trips whose CASE twin folds 15,571.07. 'shipped' would print the 30 out-the-door trips into the completed column while its value twin still reads 15,571.07 — the count lens and the value lens disagree in one row, and the census is dead on arrival.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the dispatched-fate branch",
          why: "shipped = pickup/delivery order out the door, shipped_at as the dispatch stamp — 30 trips carrying 11,996.72. 'pending' here reads the 14 being-picked trips as dispatched while the value twin still folds 11,996.72 — two lenses, two stories, one broken census.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the abandoned-fate branch",
          why: "cancelled = abandoned trip — 7 trips whose CASE twin folds just 1,152.49, the board's proof that abandons are frequent (6.8% of trips) but not fat (3.3% of value). 'delivered' here double-counts the completed lens and breaks the reconcile-to-103 identity.",
        },
      ],
      distractors: ["'pending'", "COUNT", "SUM", "MAX", "0"],
      walkthrough:
        "One scan, two lenses, one mirror. Each FILTER branch partitions the same 103 rows by fate — 'delivered' keeps 52 trips, 'shipped' keeps 30, 'cancelled' keeps 7 — and each fate's value twin folds the same fate again as a CASE pivot: the count lens and the value lens are written to mirror each other, so a row where they disagree is a query bug, not a business fact. The board reads both lenses side by side: completed 52 / 15,571.07, dispatched 30 / 11,996.72, abandoned 7 / 1,152.49, with the 14 being-picked trips and their 6,113.00 visible as the gap between the three branches and the booked total — the live workload the census deliberately leaves in view. The identity holds by construction: 52 + 30 + 14 + 7 = 103 trips and 15,571.07 + 11,996.72 + 6,113.00 + 1,152.49 = 34,833.28, because every branch partitions the same rows in one scan — four separate queries would drift. The value lens is the story: abandons look like a crisis at 6.8% of trips and evaporate at 3.3% of value, while the pick queue holds 17.6% of the book. 'pending' in any fate slot desynchronizes the mirror — the count moves to 14 while its value twin still folds the old fate's dollars, an internally inconsistent row no reviewer should ever ship; bare COUNT/SUM/MAX in a status slot are syntax errors; 0 matches nothing and zeroes the branch. Every chip changes what ops does at 07:45.",
    },
    {
      id: "cs-kroger-6",
      tier: "easy",
      topic: "s6",
      universe: "pricing",
      title: "The shelf-band census",
      brief:
        "Pricing brief, in-world: before every Our Brands line review, pricing prints the shelf-band census — each SKU CASE-classified by shelf price into budget (under 50), mid (50 up to 200) and premium (200-plus), with a SKU count and average shelf price per band. Probed on the storefront db: 16 SKUs, budget 8 averaging 32.06, mid 8 averaging 111.50 — and the premium band provably holds NOTHING (ceiling 199.99), which the GROUP BY shows honestly: no premium row forms at all. The read prints two bands and the missing third row is the finding — the ladder tops out at 199.99 and the Our Brands negotiation happens entirely inside budget and mid.",
      ask: "Return each shelf band with its SKU count and average shelf price to 2 decimals, bands in ladder order.",
      template:
        "SELECT {1}\n       WHEN price < {2} THEN 'budget'\n       WHEN price < {3} THEN 'mid'\n       ELSE 'premium' END AS band,\n       COUNT(*) AS skus,\n       ROUND(AVG({4}), 2) AS avg_price\nFROM products\nGROUP BY band\nORDER BY band;",
      slots: [
        {
          answer: "CASE",
          kind: "keyword",
          label: "the band classifier",
          why: "The band is a CASE classification — three ordered arms translating a shelf price into a published label. Any other keyword leaves the arms dangling and the query dead: the CASE is the grammar that makes a price a band.",
        },
        {
          answer: "50",
          kind: "number",
          label: "the budget-line edge",
          noVerify: true,
          why: "The budget band is shelf price under 50 — 8 SKUs averaging 32.06, from the 14.99 HDMI cable to the 49.00 hub. At 75 the 65.00 jersey and 59.99 speaker re-badge as budget and the budget mix inflates two SKUs.",
        },
        {
          answer: "200",
          kind: "number",
          label: "the premium-line edge",
          noVerify: true,
          why: "Mid is 50 up to 200 and premium is 200-plus — the published ladder. At 150 the 149.99 headset falls out of mid and premium gains a SKU it does not have; the edges are the tag's promise, not a styling choice.",
        },
        {
          answer: "price",
          kind: "keyword",
          label: "the shelf-price column",
          why: "AVG(price) is the shelf-price read the tag prints — budget 32.06, mid 111.50. AVG(stock) would print average on-hand units wearing a price name, and the band mix would argue shelf economics with warehouse counts.",
        },
      ],
      distractors: ["SUM", "MAX", "75", "150", "stock"],
      walkthrough:
        "A classification census at band grain. The CASE arms check top to bottom — price < 50 to budget, price < 200 to mid, ELSE premium — ordered and exhaustive, so every one of the 16 SKUs lands in exactly one band, and GROUP BY band folds them into the census: budget 8 SKUs averaging 32.06, mid 8 averaging 111.50. The premium row never forms — GROUP BY builds groups from values that exist, and no SKU reaches 200 — and that absence is the honest finding: the ladder tops out at 199.99, and a deck that wanted a premium row would have to fabricate one (widening the mid edge to 250 changes nothing, which is itself the proof). ORDER BY band happens to print ladder order — budget, mid, premium alphabetize correctly here — and the census prices the shelf, not the warehouse: AVG(price) per band, not stock. SUM or MAX in the classifier slot leave the arms dangling and the query dead; 75 and 150 re-badge boundary SKUs and rewrite the mix; stock in the AVG slot prices the shelf with warehouse counts. Every chip changes what the line review argues.",
    },
  ],

  problems: [
    { slug: "most-frequently-ordered-product-per-customer", why: "Basket staples: which SKU each Plus Card household scans most often is the recommendation feed's first query — an argmax over basket lines with a tie policy, exactly the household-grain fold this drill forces." },
    { slug: "sales-by-day-of-the-week", why: "The grocery week has a shape — weekend stock-up waves against midweek top-ups, all inside the weekly ad cycle. A day-of-week pivot over trip value is how the pickup-slot plan gets built." },
    { slug: "list-the-products-ordered-in-a-period", why: "The weekly ad window: which SKUs moved during the feature period versus the shelf weeks around it. A period-gated fold over basket lines is the lift read every merchandising review opens with." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The heaviest-trip household hunt: frequency, not spend, picks the fuel-point multiplier pilot cohort. An argmax over trip counts per household, with ties handled honestly." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Own-brand versus national-brand basket logic: households that bought the private label and the national brand but never the third item. Set logic over basket contents is the substitution-audit shape." },
    { slug: "product-price-at-a-given-date", why: "Shelf price as-of the promo flip: what a SKU cost the day the ad broke versus the day after. An as-of price read is the price-increase audit in miniature." },
    { slug: "fix-product-name-format", why: "SKU name hygiene before any shelf report: 'simple truth organic' versus 'Simple Truth Organic' silently splits one Our Brands item into two and breaks every brand-level fold downstream." },
    { slug: "customer-order-frequency", why: "Weekly-shop cadence: which Plus Card households trip often enough to matter, gated by HAVING over a per-household fold — the same shape as the 5-trip loyalty gate." },
    { slug: "count-student-number-in-departments", why: "Shelf categories LEFT JOINed to their basket lines: categories that never scan must still appear with a zero — the assortment coverage read that proves a category is dead, not missing." },
    { slug: "ratings-histogram", why: "The CPG partner bench carries ratings (4.6, 4.8, 3.9 on this db): a rating histogram is how merchandising sees the trust spread before applying the 4.5 renewal floor." },
    { slug: "sellers-with-no-sales", why: "Proving the zero: a partner with listings but no scanned lines should be impossible on this db — the anti-join that returns empty IS the shelf-hygiene check, and saying so is the job." },
    { slug: "group-sold-products-by-the-date", why: "The daily pick list: SKUs folded per trip day into one cell for the picker's route. GROUP_CONCAT over basket lines is exactly the fulfillment hand-off query." },
    { slug: "queries-quality-and-percentage", why: "Shelf-price accuracy: scanned price versus listed price, with the poor-match percentage carried beside the average — a ratio whose denominator discipline mirrors the pricing team's weekly audit." },
    { slug: "find-stores-with-inventory-imbalance", why: "On-hand versus sold: SKUs where stock and scan rates disagree flag out-of-stock risk before the weekend wave. An imbalance fold over stock and basket lines, per store." },
    { slug: "second-highest-salary", why: "The second-priciest SKU on the shelf: the argmax runner-up with NULL when it does not exist — the same edge the price-band report hits when a band is empty." },
    { slug: "last-person-to-fit-in-the-elevator", why: "Pickup-slot capacity: orders accumulated against a cap until the next one would overflow it. A running-sum gate over queued trips — the dispatch desk's hourly question." },
    { slug: "calculate-product-final-price", why: "The Plus Card price: one SKU, one shelf tag, one member-paid price — a rule-stacked final-price fold is the effective-price read pricing runs against the ad cycle." },
    { slug: "fifo-inventory-cogs", why: "Perishables rotate first-in-first-out or they date on the shelf. Layered cost folds turn a stock table into the cost-of-goods read the DC valuation needs — cents-safe by habit." },
    { slug: "warehouse-manager", why: "The DC read: stock held per distribution center beside what moved. A per-site stock census is the replenishment analyst's opening query before the weekend wave." },
    { slug: "restaurant-growth", why: "Household spend walks a rolling 7-day average — the cadence read that separates the weekly stock-up from the drift. A rolling-window fold over trip dates is the loyalty trend query." },
    { slug: "seasonal-sales-analysis", why: "The American grocery year runs on holiday cycles — Thanksgiving, grilling season, back-to-school. A season-versus-baseline fold over the trip spine is how the ad calendar earns its slots." },
    { slug: "friday-purchases-i", why: "The Friday/weekend stock-up is the grocery rhythm — a named-day cut over trip dates is the staffing and pickup-slot query store ops runs weekly." },
    { slug: "calculate-orders-within-each-interval", why: "Pickup slots live in intervals: trips bucketed into time windows per period. Interval folding is the slot-utilization read fulfillment analytics ships every week." },
    { slug: "immediate-food-delivery-iii", why: "The pickup promise: orders delivered on the first promised slot versus bumped. A per-order promise check with a household-level rate is the SLA read this kit's fate map feeds." },
    { slug: "the-most-recent-three-orders", why: "The last three trips per household is the recency CRM reads before any coupon drop. A per-household top-3 by date — ROW_NUMBER with a named tie-breaker — is the ladder drill at household grain." },
    { slug: "customers-with-strictly-increasing-purchases", why: "Basket growth is loyalty's forward signal: households whose trip value keeps rising are the fuel-point multiplier's best case. A per-household monotonic check over trip sequence is the growth read." },
    { slug: "compute-the-rank-as-a-percentage", why: "The Plus Card ladder reads better in percentiles: each household's rank as a share of the book. A rank-to-percentage window is the ladder drill the four-way-tie tie policy feeds." },
    { slug: "usage-tier-percentiles", why: "Spend tiles (NTILE) cut the book into fuel-point-sized bands — the segmentation query the loyalty pod ships weekly, and this kit's ladder topics in one move." },
    { slug: "find-the-median", why: "The median trip sits below the 338.19 mean on a book this concentrated — a median read via window counts is the central-tendency check the two-grain census pairs with." },
    { slug: "user-purchase-platform", why: "Pickup, delivery and in-store are three fates behind one Plus Card — a platform-preference fold per household is the channel-mix query the format teams argue over." },
    { slug: "transactions-per-visit-histogram", why: "Spend-per-trip histograms need their empty bins printed — a zero-filled band read over trip values, the distribution behind the AOV headline." },
    { slug: "human-traffic-of-stadium", why: "Three consecutive days above the footfall bar is a streak question: gaps-and-islands over daily trips, the same machinery the stockout-window drill uses." },
  ],
};
