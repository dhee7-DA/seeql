// IKEA — Wave-11 (Task 102), ecom domain. Accent text-slate-300 (verified ecom-unique).
// Flat-pack furniture retail on a range-discipline angle (distinct from wayfair's broad
// home-goods read and costco's warehouse-club framing): the storefront db read as the
// range-and-pickup sandbox — customers = IKEA Family members (region = market bucket),
// products = range articles (16 SKUs on purpose: the limited-range discipline; db category
// codes = product families/series, 7 of them), suppliers = the supplier/franchise
// marketplace (6 partners), orders = store/online purchases (delivered = collected 52,
// shipped = in transit to the pickup point 30, pending = awaiting pickup 14, cancelled =
// 7), order_items = flat-pack line items (quantity = units, unit_price = shelf price),
// invoices = member & franchise statements, payments = rails (card 16 legs / 37,364.00
// vs wire 11 / 32,248.00), expenses = store opex (Rent 14 / 16,800.00, Ads 14 / 4,570.00),
// ledger_entries = GL. Finance tables store INTEGER cents — dollar read = amount_cents/100.0;
// orders.total and order_items.unit_price are REAL dollars. The facts file's stock-vs-sold
// ladder drives the cover reads (Headset 60/46/14, Mic 45/30/15, Watch 40/23/17) and the
// pickup clock maps created_at -> shipped_at (82 of 103 stamped, 2.98-day average, 2-4).
// Pool provenance: company-pools.md carries NO IKEA section (0 tagged rows) — all 10 topic
// slug sets and all 16 problems are theme-curated from the theme menu's sql rows (no
// w*/d*/f* rows) and say so in brief P4.
// Facts source: scripts/company-facts.md verbatim (incl. the wave-8+9 canonicalized
// probe-derived cells), plus this agent's read-only probes against db/custom.db: the
// pick-list fold (heaviest basket = order 39, 4 articles, 11 units), the family-pair
// census (27 raw pairings, top Audio×Accessories 30, floor-12 ladder foot ties three
// pairings at 12), 77 multi-article baskets of 103, 498 total units.
// NOTE for the wave-11 registry wiring agent: ikea is NOT yet in registry COMPANY_META —
// wire id "ikea", domainId "ecom", name "IKEA", tagline "Flat-pack retail: range discipline, stock cover, the pickup funnel",
// accent "text-slate-300" to match this header exactly.

import type { CompanyKit } from "../types";

export const ikeaKit: CompanyKit = {
  id: "ikea",
  domainId: "ecom",
  name: "IKEA",
  tagline: "Flat-pack retail: range discipline, stock cover, the pickup funnel",
  accent: "text-slate-300",

  brief: [
    "**IKEA** is the flat-pack retailer that turned a deliberately narrow range into a global machine: a few thousand articles, each one earning its shelf slot, most of it packed flat so the customer carries it to the car. This kit reads the storefront db as the range-and-pickup sandbox: the 16 `products` rows are range articles across 7 product families, the 103 orders are store and online purchases worth 34,833.28 (average ticket 338.19, spread 25.47 to 1,088.44), and the 251 order_items rows are flat-pack line items — quantity = units, unit_price = the shelf price. The status map is fixed: delivered = {emerald:collected} (52, 50.5%), shipped = in transit to the pickup point (30, 29.1%), pending = awaiting pickup (14, 13.6%), cancelled = {rose:abandoned} (7, 6.8%). Sixteen articles is on-brand, not a sample-size accident: *the range is curated, not endless*, and every read in this kit starts from that discipline.",
    "The data org splits into range (family) analytics, store ops and a small finance pod, all reading the same two spines. The **stock-vs-sold ladder** is the ops heartbeat: Noise-Canceling Headset 60 stocked / 46 sold / **14 remaining**, with the Studio Mic at 15 and the Smart Watch S at 17 right behind it — the three thinnest covers on the range — while the HDMI cable sits fat at 500/38/462. The pickup clock is the second spine: **82 of 103** purchases carry the shipped_at stamp, averaging **2.98 days** open-to-pickup with a 2–4 spread — US slowest at 3.07, APAC fastest at 2.93. Money sits one layer down: statements and rails store INTEGER cents, so the dollar read is `amount_cents / 100.0`, and a missing .0 is a hundredfold-off board.",
    "Interview screens are census-then-denominator with a range-discipline accent. A typical loop opens with a **two-grain market census** — EU runs 45 purchases from just 8 members (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'do awaiting-pickup orders count in your funnel base?'*), then into the units ladder where ties are everywhere — the sold ladder ties at 36 twice, at 30 three times, at 21 three times — and rank semantics become a range-board policy call. Late rounds band the price ladder with CASE (8 mid-shelf articles averaging 111.50 against 8 budget articles at 32.06 — {amber:the premium band is empty}; the ladder tops out at 199.99) or walk the {sky:14-month purchase spine} (2024-01 to 2025-02) into the 1,193.86 July trough.",
    "Preparation strategy: the pools file carries no IKEA section — **0 tagged rows** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: stock-vs-sold cover folds, pickup-funnel rates, family-pairing censuses, CASE price bands, tie-heavy range ladders and cents-safe statement reads. Do the topics in order, then run all six case studies on the live storefront db: the {violet:click-and-collect pick list} the pick walk starts from, the {emerald:family-pairing census} the range board uses for shelf adjacency, and four more that rehearse the fast-mover ladder, the shelf-band census, the franchise chaser queue and the monthly units spine. The kit is built for spaced practice rather than one sitting — re-run each case a week later from a blank editor and the walkthroughs become the recall test. The bar to clear: *state the fold grain and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:00 —** The day starts with the cover board. A store-ops analyst opens the replenishment dashboard before the doors unlock: which articles thinned overnight, did the pickup-point stamps land, does the fate census reconcile — 52 collected + 30 in transit + 14 awaiting + 7 cancelled = **103 by construction**? The Headset is the standing fire: **14 remaining** against 46 sold, with the Mic at 15 and the Smart Watch at 17 right behind it — *three stockout candidates on a 16-article range is a range-board incident*, not a replenishment note. If the pickup clock drifts off **2.98 days** — the US already runs 3.07 against APAC's 2.93 — the pickup-point queue gets pulled before the funnel report ships.",
    "**11:30 —** Midday is the range board. The family lead wants the pairing census re-cut with the traction floor held at 12 shared baskets — Audio×Accessories leads at **30**, and the three pairings tied at the foot decide which shelf adjacencies survive the reset; the pricing pod wants the band ladder (8 mid at 111.50, 8 budget at 32.06, *the premium arm honestly empty*) alongside the supplier mix, where Nordic Gadgets carries **32%** of range revenue at a 4.6 rating and Midwest Hardware 26.7% behind it. Each ask is a join, a conditional aggregate and one judgment call about grain — the analyst writes the query twice: *once to answer, once with the population spelled out so the number survives the range-board argument*.",
    "**15:30 —** The afternoon tilts toward money. The statement refresh runs first: 28 statements split **21 exact / 1 partial / 6 never-collected**, and the anomaly list gets walked line by line — a void-but-settled statement (#11, 925.00) and a paid-status statement with zero payment legs (#28, 1,756.00) — before a single dunning letter goes out; the rails read card 16 legs / 37,364.00 against wire 11 / 32,248.00. The stakeholder cycle closes the day: the family lead walks out with the pairing ladder and its floor printed on the slide, and the ledger trial balance must land at **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Range width", what: "16 articles across 7 families — the discipline number every other metric divides by. The range board adds an article only when one earns its slot, so 'articles per family' is a governed census, not a count of whatever the catalog absorbed." },
    { name: "Cover (remaining)", what: "Stock minus units sold, per article: Headset 14, Studio Mic 15, Smart Watch S 17 are the thinnest covers on the range; HDMI cable holds 462. The replenishment trigger the ops floor watches first each morning." },
    { name: "Pickup latency", what: "created_at to shipped_at over stamped purchases only: 82 of 103, 2.98-day average, range 2–4. Regional drift (US 3.07, EU 2.94, APAC 2.93, LATAM 3.5) decides where the pickup-point queue gets pulled." },
    { name: "Fate census", what: "52 collected / 30 in transit / 14 awaiting pickup / 7 cancelled of 103 — 103 by construction. Every stage is a conditional count over a status or timestamp, and the denominator question is the whole interview." },
    { name: "Basket depth", what: "251 flat-pack lines across 103 purchases (2.44 lines per order, max quantity 3 on a line, 498 units total); 77 baskets carry 2+ articles. The flat-pack assumption — one customer, several cartons — lives or dies here." },
    { name: "Family mix", what: "Audio leads revenue at 11,744.01 on 97 units; Accessories moves the most cartons (121 units) for 3,294.29 — high-turn, low-ticket. The 54-of-103 orders touching Accessories is the attach story the range board re-cuts weekly." },
    { name: "Supplier concentration", what: "Nordic Gadgets AB carries 32% of range revenue (11,130.25) at a 4.6 rating; Midwest Hardware 26.7% (9,294.93); the trusted bench at 4.5-plus is exactly two partners. One supplier hiccup moves a quarter of the range." },
    { name: "Statement coverage", what: "Billed versus settled: 21 exact (65,612.00 both sides), 1 partial (4,000.00 of 6,148.00), 6 never-collected worth 15,217.00 — against 30-day terms and a 28.4-day average settlement, fastest 13, slowest 84." },
  ],

  topics: [
    {
      name: "Range-width censuses",
      why: "Everything here starts from the fold: 16 articles, 7 families, and a governed range means 'articles per family' is a GROUP BY the range board actually fights over. Flipkart-scale marketplaces count everything; IKEA counts a curated range, so the census questions are about which articles qualify and how the fold reconciles to 16.",
      slugs: ["product-sales-analysis-ii", "classes-more-than-5-students", "find-followers-count", "count-student-number-in-departments", "customer-who-visited-but-did-not-transact"],
    },
    {
      name: "Stock-vs-sold cover reads",
      why: "The replenishment board is one join: articles to their sold units, stock minus sold = remaining, thinnest cover first. The facts-file ladder (Headset 60/46/14, Mic 45/30/15, Watch 40/23/17) is exactly this fold at db scale, and the interviewer wants the population stated — sold units fold from line items, not from orders.",
      slugs: ["warehouse-manager", "find-stores-with-inventory-imbalance", "weeks-of-supply", "fifo-inventory-cogs"],
    },
    {
      name: "Pickup-funnel rates",
      why: "The status map is the funnel: collected, in transit, awaiting pickup, abandoned — and every rate (cancellation share, pickup share) is a conditional count with the denominator decided before the ratio. The trap is calling an in-transit purchase 'collected' — 30 versus 52 on this db — and the second trap is the base: awaiting-pickup rows stay in funnel bases and drop out of latency bases.",
      slugs: ["funnel-step-conversion", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest", "user-activity-for-the-past-30-days-ii", "biggest-window-between-events"],
    },
    {
      name: "Family enrichment joins",
      why: "Article-level reporting means attaching family, supplier and shelf price to every flat-pack line — joins across the range and demand tables where the grain can silently shift from lines to orders. IKEA's follow-up is always survival: does an article missing its family mapping still appear in the revenue report, and at what grain does COUNT(*) now count?",
      slugs: ["product-sales-analysis-i", "sales-analysis-i", "combine-two-tables", "most-frequently-ordered-product-per-customer"],
    },
    {
      name: "The two-grain member census",
      why: "Purchases and members are different grains of the same join: EU runs 45 purchases from 8 members while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is load and which is coverage — is the habit being graded, because the intensity ratio (5.6 versus 9.5) is what decides market investment.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "students-and-examinations", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Ranking the range",
      why: "Top-article-per-family, second-price-per-band, best-selling ladder — range reporting is leaderboard reporting on a 16-article range where ties are guaranteed: the sold ladder ties at 36 twice, at 30 three times, at 21 three times. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung, and on a curated range that is a policy about peer articles, not syntax.",
      slugs: ["rank-scores", "second-highest-salary", "department-top-three-salaries", "nth-highest-salary", "orders-with-maximum-quantity-above-average"],
    },
    {
      name: "CASE bands on the price ladder",
      why: "The shelf splits at a fixed boundary — 8 mid articles at 111.50 average against 8 budget articles at 32.06, with the premium arm honestly empty at the 199.99 ceiling. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the buying ladder, and a reordered WHEN quietly re-bands the shelf.",
      slugs: ["calculate-special-bonus", "weather-type-in-each-country", "count-salary-categories", "average-selling-price", "occupations-pivot"],
    },
    {
      name: "Basket pairing & co-purchase",
      why: "Flat-pack sells in projects: the pairing census self-joins line items inside one basket and counts which families ride together — 27 raw pairings exist, Audio×Accessories sticks at 30, and the canonicalization predicate is what keeps every pair counted once. The A-and-B-but-not-C shape is the real merchandising question, in interview clothing.",
      slugs: ["customers-who-bought-a-and-b-not-c", "most-common-course-pairs", "symmetric-pairs"],
    },
    {
      name: "The purchase calendar spine",
      why: "The 14-month spine (2024-01 to 2025-02) is where seasonality lives: the 1,193.86 July trough, the 3,731.97 January peak, and the 2-cancelled months (July and November) that the abandoned-purchase review quotes. STRFTIME buckets on TEXT timestamps, half-open windows that don't lose the last night, and a stated population are the drills.",
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "user-activity-for-the-past-30-days-i", "products-with-three-or-more-orders-in-two-consecutive-years", "total-sales-amount-by-year", "restaurant-growth"],
    },
    {
      name: "Statement & cents discipline",
      why: "Billed is not settled — the finance tables (28 statements, 27 payment legs, INTEGER cents) are where the range meets money. Every dollar read is amount_cents / 100.0, the coverage split (21 exact / 1 partial / 6 none) is one CASE away, and the rails matter: card legs (16, 37,364.00) read in-store, wire legs (11, 32,248.00) read franchise-invoiced.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "trial-balance-check", "ar-aging-schedule", "capital-gain-loss"],
    },
  ],

  theory: [
    {
      id: "ikea-t1",
      q: "The cover report joins range articles to their sold units. When do you INNER and when do you LEFT — and what does it mean that this db returns ZERO never-sold articles?",
      a: "Decide from the survival rule the question implies. A revenue read joins line items to articles: a line with no article row is corruption, so INNER is honest — and worth a data-quality flag, not a silent inner join. A cover read LEFT-joins from products: articles with no sales are exactly the rows the replenishment board needs, arriving with NULL sold columns. On this db the anti-join returns a confident zero — all 16 articles sold at least once — and that zero is itself a finding: on a curated 16-article range, an article that never sells would be a range-board decision waiting to happen, so *prove the zero* rather than assume it. The classic break is filtering the right table's column in WHERE after the LEFT JOIN — o.status = 'collected' kills every NULL-payload article row and the LEFT quietly becomes an INNER; the fix is moving the predicate into ON or an outer query, or accepting inner semantics deliberately and saying so. Join type is a decision about who survives, not a habit.",
      tag: "joins",
    },
    {
      id: "ikea-t2",
      q: "The units-sold ladder ties at 36 twice, at 30 three times and at 21 three times. RANK, DENSE_RANK or ROW_NUMBER for the range leaderboard — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud before writing SQL. RANK gives tied counts the same rank and then skips: on this db the 36-tie consumes two rungs and the next distinct count lands two places down, implying a phantom article that doesn't exist. DENSE_RANK shares rungs without gaps — the tie reads 36, 36 and the next distinct count follows immediately, which is how a range board wants peer articles displayed. ROW_NUMBER splits ties arbitrarily, a silent judgment call about which article gets the shelf reset first. On a 16-article curated range the ties are structural, not incidental — three SKUs at 30 units is a real merchandising story about small-ticket attach — so the published ladder's policy (shared rungs, named tie-breaker like name then id as the final determinizer) should be written in the query comment. The wrong answer is picking a function; the right answer is picking a policy and owning it.",
      tag: "windows",
    },
    {
      id: "ikea-t3",
      q: "Your market report shows 45 purchases and 8 members for the EU. Why do the two columns disagree, and what does each number mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts purchase rows after the join — one row per order, so a member with 24 purchases contributes 24. COUNT(DISTINCT customer_id) folds those rows back to people — EU's 45 purchases collapse to 8 members. Neither is wrong: purchases measure load on the pickup network and ticket volume, members measure installed base and range reach, and the ratio between them — 5.6 purchases per member in the EU against 9.5 in the US on this db — is the intensity signal that decides whether a market is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for the flat-pack lines and COUNT(*) silently counts cartons — 251 of them — not purchases. Saying 'one row per what?' out loud for every COUNT in the query is the habit the panel grades, and it is the same habit the range board's own pack encodes: every headline number ships with its grain printed beside it.",
      tag: "aggregation",
    },
    {
      id: "ikea-t4",
      q: "shipped_at is NULL until the purchase reaches the pickup point. What is your policy for the pickup-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped purchases have a latency, so the report measures open-to-pickup for the 82 of 103 purchases carrying the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL purchases returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 awaiting plus 7 cancelled rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day pickups for purchases still sitting in the funnel and poisons the 2.98 baseline every regional drift alert keys off. The three NULL behaviors worth reciting: filters (NULL fails both = and !=), joins (NULL keys never match), aggregates (AVG and COUNT(col) skip, COUNT(*) keeps). A report whose WHERE clause is doing definitional work without saying so is exactly what a range-board reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "ikea-t5",
      q: "The range board wants purchases per family for families carrying at least two articles, with the abandoned share per family. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses, plus one arithmetic guard. The status rule is a row-level fact — status = 'cancelled' discards nothing you keep, but the flag for the abandoned share is computed per row before any fold, in a CASE inside the aggregate; a row-predicate in HAVING is impossible because statuses no longer exist once rows are grouped. The two-article floor is a group-level fact — HAVING COUNT(DISTINCT product_id) >= 2 after GROUP BY family; putting it in WHERE errors because COUNT does not exist before groups form. Note the DISTINCT: purchases touch a family multiple times, and the floor is about articles, not rows — Fitness carries exactly 1 article and drops out either way, but a 3-article family with 40 lines survives only under the DISTINCT form. The arithmetic guard: 100.0 * SUM(cancelled_flag) / COUNT(*) puts the 100.0 BEFORE the division — integer division truncates the share toward zero, and on this db it is the difference between APAC's 8.1% and a displayed 0. The strong answer places every filter by asking: is this a fact about one row, or about a family?",
      tag: "pipeline",
    },
    {
      id: "ikea-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 purchases always produce a mean (338.19 here). On filtered staging tables — one family, one market, one month — the empty-inner-query bug ships regularly, and the above-average filter is exactly where it hides. The correlated cousin (compare each purchase to ITS member's own average) re-runs per outer row and answers a different question at a different cost — 'which of Alice Chen's 24 purchases beat her own 302.60 average' is a member-intensity question, not a platform question. The NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole report empties. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "ikea-t7",
      q: "The seasonality review buckets purchases by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and handle the latency math?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on fixed-width ISO text — gives '2024-07', one of 14 buckets from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the seasonality story becomes fiction. The quarter window: half-open intervals — created_at >= '2024-04-01' AND created_at < '2024-07-01' — never BETWEEN on the last day, which drops the last night's purchases, and evening purchases are exactly when flat-pack baskets land. The latency math: JULIANDAY(shipped_at) - JULIANDAY(created_at) returns fractional days — this db's 2.98-day average is that, rounded once at the END, not per row; and the population is stated first (82 stamped of 103) because the 14 awaiting-pickup rows have no stamp and no latency yet. On this spine the story is concrete: the book opens at 3,731.97 in January 2024, troughs at 1,193.86 in July, and the abandoned purchases concentrate in the trough months (2 in July, 2 in November). State the convention, then query it — never the reverse.",
      tag: "dates",
    },
    {
      id: "ikea-t8",
      q: "Finance says a statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a payment leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The coverage census must read 21 exact (65,612.00 both sides — void-but-settled #11 folds in by construction, paid-status #28 folds out), 1 partial (4,000.00 of 6,148.00 on #25), 6 none — footing to 28 or the close does not ship. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Close culture here: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "ikea-t9",
      q: "The price ladder runs a 3-article moving average. ROWS BETWEEN 2 PRECEDING AND CURRENT ROW — why ROWS and not the default frame, and what happens at the top of the ladder?",
      a: "The default frame is RANGE, which is peer-based: rows that tie on the ORDER BY value enter the window together. On the price ladder prices are unique so RANGE behaves — but on the units ladder, where 36 ties twice and 30 ties three times, a RANGE frame would average all three 30s together the moment one of them is current, turning a 3-article read into a 5-article read. ROWS counts physical rows and never absorbs ties. At the partition edge the ROWS frame clips: the first row averages itself alone, the second averages two — never NULL-padded, never erroring. Say the frame out loud in review: 'ROWS, 2 preceding, clip at the edge' is the whole answer.",
      tag: "windows",
    },
    {
      id: "ikea-t10",
      q: "You need one packet holding the collected purchases and the in-transit purchases, stacked. UNION or UNION ALL — and what silently breaks with the wrong one?",
      a: "UNION ALL, and the reason is arithmetic: the packet must foot to 52 + 30 = 82, and UNION deduplicates whole rows silently. If a market's collected count happens to equal its in-transit count — EU 45 and APAC 37 make coincidence plausible on any per-market cut — one of the two identical rows vanishes and the packet under-reports with no error. UNION ALL keeps every row and lets the counts speak. The discipline: stacked fate packets are distinct populations by construction, so they never need dedupe; reach for plain UNION only when collapsing duplicates IS the requirement, and write that in the query comment so the next analyst knows the dedupe was deliberate.",
      tag: "setops",
    },
    {
      id: "ikea-t11",
      q: "EXCEPT answers 'months with purchases but no abandoned purchases' on the 14-month spine. How does EXCEPT behave, and what must be true of both sides before you trust the count?",
      a: "EXCEPT returns rows in the left set that do not appear in the right set — and it deduplicates, so '14 months minus 5 cancellation-touched months = 9 clean months' is only trustworthy if each side is already one row per month. Two preconditions: the left side must be the full spine built with the same bucket expression (SUBSTR or STRFTIME on created_at — the same convention both sides, or the set algebra compares different keys), and NULL handling must be proven — EXCEPT treats NULLs as equal, which is what you want for month keys but is a trap for nullable payloads. EXCEPT is the set-algebra readout for 'where did the funnel hold'; the 5-month subtraction is the abandoned-purchase review's opening fact.",
      tag: "setops",
    },
    {
      id: "ikea-t12",
      q: "'Flag every article priced above its family's average.' Walk me through the three shapes — derived table, correlated subquery, window — and which you'd ship.",
      a: "The derived table: a CTE or subquery computing AVG(price) GROUP BY category, joined back on category — one pass to build family means, one join to compare. The correlated subquery: (SELECT AVG(price) FROM products p2 WHERE p2.category = p1.category) — re-evaluated per row, readable, and at 16 articles costless. The window: AVG(price) OVER (PARTITION BY category) — each partition's mean computed once in the same scan, no join. All three flag the same rows on this range. The shipping answer is the window at warehouse scale and the derived table when the means get reused elsewhere in the query; the correlated form survives on small curated ranges like this one, and saying WHY it survives — 16 rows, not 16 million — is the part interviewers remember.",
      tag: "subqueries",
    },
    {
      id: "ikea-t13",
      q: "The fate census claims 52 + 30 + 14 + 7 = 103 'by construction'. What does that identity actually guarantee — and what would falsify it?",
      a: "The identity holds because the four FILTER (WHERE status = …) branches partition on one column whose values are mutually exclusive — every row lands in exactly one branch, so the branches must sum to COUNT(*). That guarantee is about the QUERY, not the data: it would still hold if a fifth status value appeared and silently fell outside all four branches, making the total 103 but the census incomplete. The falsification test is cheap and worth running monthly: SELECT DISTINCT status FROM orders and confirm the value set is exactly the four the census names. 'By construction' means the arithmetic cannot drift — it does not mean the taxonomy cannot. A census that reconciles while a fifth fate walks in the door is the most expensive kind of correct.",
      tag: "aggregation",
    },
    {
      id: "ikea-t14",
      q: "NOT EXISTS or LEFT JOIN … IS NULL for the never-settled statements list — does it matter which, and what changes between them?",
      a: "Both are anti-joins and both return the same 6 statements worth 15,217.00 on this db. The differences are mechanical: NOT EXISTS stops at the first match per row and never needs the payload, while the LEFT JOIN form carries the NULL-payload rows through and is the shape to use when the report also wants counted aggregates beside the anti-join rows. NOT IN is the twin to refuse: one NULL in the subquery's list poisons every comparison and the report empties silently. In an interview, name the semantics first (which rows must survive — statements with no legs), then the shape (LEFT JOIN + IS NULL for visibility, NOT EXISTS for intent), then the refusal (never NOT IN over a nullable column). That ordering is what a complete answer sounds like.",
      tag: "joins",
    },
    {
      id: "ikea-t15",
      q: "The pickup clock reads 2.98 days. Walk me through every decision hiding in that number — population, arithmetic, rounding.",
      a: "Population first: only the 82 of 103 purchases carrying a shipped_at stamp have a latency — the 14 awaiting-pickup and 7 cancelled rows are excluded by definition, and the report title says 'stamped purchases only'. Arithmetic second: JULIANDAY(shipped_at) − JULIANDAY(created_at) on the ISO text stamps, which converts each to fractional days — plain text subtraction coerces to 0 and flatlines the clock. Rounding last: average the raw fractional deltas across all 82 rows, then round ONCE at the end for display — rounding per row before averaging drifts the mean. The spread (2 to 4 days) and the regional drift (US 3.07 versus APAC 2.93) are the same three decisions re-run per slice. State all three unprompted and the number is defensible; skip the population and it is not.",
      tag: "dates",
    },
    {
      id: "ikea-t16",
      q: "A supplier feed just landed with 'smart watch s' beside 'Smart Watch S'. What is your string-hygiene playbook for the article master?",
      a: "Detect first: GROUP BY the name and look for near-duplicates — LOWER(name) HAVING COUNT(*) > 1 is the probe, and on a 16-article range a split shows up as a phantom 17th article. Fix at the boundary, not in every query: normalize on ingest (TRIM for padding, UPPER or INITCAP for casing) so 'Smart watch s' resolves to one article before it joins anything. Key on ids where joins allow — name is a display column, not a join key — because id-based joins survive a casing slip that name-based joins do not. And log the fix: the reload that silently created a second article also silently doubled a ladder row, and the audit trail is what lets the range board trust the next ladder. The habit being graded: text is data with a hygiene policy, not a given.",
      tag: "casing",
    },
    {
      id: "ikea-t17",
      q: "NTILE(4) over the 16-article price ladder versus the CASE split at the 50.00 boundary — both produce four-ish bands. When is each the right tool?",
      a: "NTILE is a row-count decision: 16 articles into 4 tiles is 4 per tile no matter where the prices gap — the Watch (199.99) heads tile 1 and the HDMI cable (14.99) closes tile 4, but the tile boundaries land wherever the row order puts them. The CASE split is a value decision: 50.00 is a policy boundary the range board chose, and it happens to split the shelf 8-and-8 — but if three budget articles jumped to 60, the CASE still splits at 50 while NTILE still yields 4-and-4. Use NTILE when the question is 'spread the population into equal buckets' (quartile reporting, A/B splits); use CASE when the question is 'who crosses this policy line' (band censuses, gate lists). The interview trap is answering a value question with a row-count function — the bands come out and the policy quietly disappears.",
      tag: "windows",
    },
    {
      id: "ikea-t18",
      q: "Top article per family, but the units ladder ties at 36 twice, 30 three times and 21 three times. How do you write the argmax, and what does the tie policy do to the output?",
      a: "The shape: RANK() OVER (PARTITION BY category ORDER BY SUM(oi.quantity) DESC) computed per article, then keep rank = 1 in the outer query. The policy question is what rank = 1 means when two articles in one family tie: ROW_NUMBER hands rank 1 to exactly one arbitrary row — the other disappears from the board with no trace; RANK shares the rung, so a tied family prints two rows and the board sees the peer articles honestly. On a curated 16-article range the ties are structural — three SKUs at 30 units is a real merchandising story — so the defensible default is shared rungs plus a named deterministic tie-breaker (name, then id) for the display order, written into the query comment. The wrong answer is a silent ROW_NUMBER that picks a winner by accident.",
      tag: "windows",
    },
    {
      id: "ikea-t19",
      q: "The month-close packet runs slow. Walk me through how you'd read EXPLAIN QUERY PLAN and what you'd look for first.",
      a: "Run EXPLAIN QUERY PLAN on the exact statement and read the scan lines top-down: 'SCAN orders' means a full table read — acceptable at 103 rows, fatal at warehouse scale. The first suspect is sargability: any predicate that wraps the indexed column in a function — STRFTIME('%Y-%m', created_at) = '2024-07', julianday(created_at) BETWEEN … — hides the column from the index and forces the scan. The fix is the bare-column half-open range: created_at >= '2024-07-01' AND created_at < '2024-08-01' seeks the index and is boundary-correct besides. Second suspect is the join order — check that the driving table is the filtered one and the join keys are indexed on both sides. Then measure again: the plan before and after IS the evidence, and on a table this small the honest answer includes 'at 103 rows this is premature — the habit matters at scale'.",
      tag: "indexes",
    },
    {
      id: "ikea-t20",
      q: "The pick-wave leaderboard ships ORDER BY units DESC LIMIT 3 with a three-way tie at the boundary. What is your tie policy for every leaderboard this kit produces?",
      a: "Policy first, then SQL. If ties must be broken: add a deterministic tie-breaker that does not depend on plan order — units DESC, name ASC, id ASC — so two analysts, two runs, two warehouses all print the same three rows. If ties must be honored: replace LIMIT with a rank window (RANK() <= 3) so every tied row ships and the board shows the peer set. What is never acceptable is bare LIMIT over a tied boundary: the engine keeps one arbitrary row, the leaderboard is non-deterministic between runs, and the two analysts comparing notes ship two different 'top 3'. The comment above the query names the choice — 'tie-break: name then id, deliberate' — because an undocumented ORDER BY is an undocumented policy, and undocumented policies are how boards lose trust in numbers.",
      tag: "windows",
    },
    {
      id: "ikea-t21",
      q: "COALESCE keeps appearing in this kit — the cents guard, the dunning display, the percentage promoter. What is the general placement rule?",
      a: "COALESCE is a decision about what an honest print looks like, and its placement decides whether it changes meaning. Display placement — COALESCE(SUM(p.amount_cents), 0) in the SELECT of the dunning list — turns 'no settlement yet' into a readable 0.00 without touching the classification. Arithmetic placement is where it lies: comparing COALESCE(SUM(...), 0) = billed inside the coverage CASE folds the 6 no-leg statements into a settled bucket and the 21/1/6 census stops footing. And the promoter is a different tool wearing a similar coat: 100.0 * flags / COUNT(*) is about forcing real division before integer truncation — a type decision, not a NULL decision. The rule: COALESCE at the outermost display layer, never inside a predicate that classifies, and never as a substitute for deciding what 'no data yet' means to the business.",
      tag: "nulls",
    },
    {
      id: "ikea-t22",
      q: "Defense round: the per-market average tickets are EU 335.32, APAC 313.66, US 383.48, LATAM 426.22. Why is the platform's average ticket 338.19 and not their average, 364.67?",
      a: "Because the mean must be taken over the purchase population, once. The four market means are each legitimate at their own grain — EU's 335.32 rests on 45 purchases, LATAM's 426.22 on 2 — but averaging the four means gives every market one vote, so LATAM's small-n average moves the headline by 26 points. The purchase-grain mean sums all ticket dollars (34,833.28) over all purchases (103): 338.19. When a stakeholder wants the market story, print the means with their n beside them — 335.32 (45), 313.66 (37), 383.48 (19), 426.22 (2) — and let the reader see the weighting. The general rule the panel wants: every average ships with its denominator, and averages-of-averages are guilty until proven weighted.",
      tag: "aggregation",
    },
    {
      id: "ikea-t23",
      q: "Before the close ships, what four proofs do you run — and what does each catch?",
      a: "One: the fate census identity — 52 collected + 30 in-transit + 14 awaiting + 7 cancelled = 103 — catches a fifth status value or a filter that silently dropped rows. Two: the ledger trial balance — 181,080 debits against 181,080 credits, delta zero — catches a one-sided entry or a join that duplicated or lost leg rows. Three: the statement coverage census — 21 exact, 1 partial, 6 never-collected, footing to 28 — catches the two liars drifting: void-but-settled #11 folding out or paid-status #28 folding in. Four: the rails count — card 16 legs against wire 11 — catches a payment routed to the wrong rail, which distorts every settlement-latency read downstream. Each proof is one query, each has a known-good value, and the close ships only when all four print green — the ritual is the argument that the numbers survived the journey from db to board.",
      tag: "quality",
    },
    {
      id: "ikea-t24",
      q: "'Do awaiting-pickup purchases count in your funnel base?' — the denominator question. How do you answer it so the panel stops asking?",
      a: "By deciding the denominator from the question's verb, out loud. 'Conversion to collected' counts the 52 collected over the full 103 booked — awaiting-pickup rows stay in the base because they are still eligible to convert. 'Pickup latency' runs over the 82 stamped only — awaiting rows drop out because they have no latency yet, not because they failed. 'Abandonment share' puts the 7 cancelled over 103 — the numerator's siblings stay in the denominator unless the business definition says otherwise. The unforgivable move is changing the base silently between slides: 52/103 (50.5%) and 52/89 (58.4%) are both real numbers and only one matches the stated question. Write the denominator into the report title or the query comment, and the follow-up stops being a trap and becomes a formality.",
      tag: "aggregation",
    },
  ],

  mcqs: [
    {
      id: "ikea-mcq-1",
      prompt: "A purchase's status reads 'shipped'. In this kit's pickup-funnel map, what happened?",
      choices: [
        "In transit to the pickup point — the shipped_at stamp has landed",
        "Collected by the member — the purchase completed",
        "Awaiting pickup — placed but not yet dispatched",
        "Abandoned — the member cancelled",
      ],
      answer: 0,
      why: "The stage map is fixed: shipped = in transit to the pickup point (30 of 103 purchases), with shipped_at as the arrival stamp. It is stamped and moving — but not collected.",
      notes: [
        { choice: 1, why: "Collected is 'delivered' — 52 purchases. Calling in-transit purchases collected inflates the completion count before any carton changes hands." },
        { choice: 2, why: "Awaiting pickup is 'pending' — 14 purchases with no shipped_at yet. Pending is not in-transit and not abandoned; it is 'not yet', and it stays in the funnel denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "ikea-mcq-2",
      prompt: "The EU market carries 45 purchases from 8 IKEA Family members. Which column pair reports both grains in one row?",
      choices: [
        "COUNT(*) and COUNT(DISTINCT customer_id)",
        "COUNT(*) and COUNT(customer_id)",
        "SUM(total) and COUNT(*)",
        "COUNT(DISTINCT region) and COUNT(*)",
      ],
      answer: 0,
      why: "COUNT(*) counts purchase rows (45); COUNT(DISTINCT customer_id) folds repeats back to members (8). The gap between them — 5.6 purchases per member — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every purchase carries a member. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 2, why: "SUM(total) is money, not census — it answers 'how much', not 'how many people'. Mixing a dollar column into a count census is a different report wearing the same header." },
      ],
      difficulty: "easy",
    },
    {
      id: "ikea-mcq-3",
      prompt: "The cover board reads the Noise-Canceling Headset: 60 stocked, 46 sold. What is the remaining cover, and what does it trigger?",
      choices: [
        "14 — the thinnest cover on the range, first replenishment trigger",
        "106 — stock plus sold, the gross need",
        "46 — the sold count IS the cover read",
        "60 — stock is the cover; sold is irrelevant until it hits zero",
      ],
      answer: 0,
      why: "Remaining = stock minus sold = 60 - 46 = 14 — the thinnest cover on the 16-article range (Studio Mic 15, Smart Watch S 17 behind it). Cover is the replenishment trigger, and the subtraction is the whole read.",
      notes: [
        { choice: 1, why: "Adding stock to sold answers 'how many cartons have we ever handled', not 'how many are left'. The cover metric is a difference, not a sum." },
        { choice: 2, why: "46 is units sold — the denominator side of sell-through, not the remaining read. Quoting sold as cover is how phantom stockouts get ordered against." },
      ],
      difficulty: "easy",
    },
    {
      id: "ikea-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: [
        "It rounds the result to a percentage",
        "It promotes the division to real arithmetic before integer truncation",
        "It filters to abandoned purchases only",
        "It is cosmetic — moving it after the division changes nothing",
      ],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the abandonment share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between APAC's 8.1% and a displayed 0.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.081 to 0 first, then scales — the abandonment map reads zero everywhere, including APAC's 8.1%." },
      ],
      difficulty: "medium",
    },
    {
      id: "ikea-mcq-5",
      prompt: "Keep only product families carrying at least 2 articles in the range. Where does the threshold live?",
      choices: [
        "WHERE COUNT(DISTINCT product_id) >= 2, before GROUP BY",
        "GROUP BY category HAVING COUNT(DISTINCT product_id) >= 2",
        "WHERE category IN ('Audio','Video') — list the qualifying families",
        "HAVING COUNT(*) >= 2 over the joined line items",
      ],
      answer: 1,
      why: "An article-count floor is a group-level fact: families must exist before they can be judged, so HAVING follows GROUP BY. On this range the floor drops exactly one family — Fitness carries a single article (Yoga Mat Eco 6mm).",
      notes: [
        { choice: 0, why: "COUNT does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 3, why: "COUNT(*) counts LINE ROWS, not articles — a family with 1 article sold on 13 purchases passes the wrong floor. The DISTINCT against product_id is the difference between the two censuses." },
      ],
      difficulty: "medium",
    },
    {
      id: "ikea-mcq-6",
      prompt: "Your pick-list fold prints 'Smart Watch S,Wireless Mouse M3' — no space after the comma. What is the fix?",
      choices: [
        "Pass the two-character separator explicitly: GROUP_CONCAT(p.name, ', ')",
        "Wrap the result in TRIM to strip the missing space",
        "GROUP_CONCAT cannot separate values; concatenate with || per row instead",
        "It is cosmetic — the pick-walk scanner ignores separators",
      ],
      answer: 0,
      why: "Bare GROUP_CONCAT defaults to ',' with no space. The explicit ', ' separator is the one-argument fix: GROUP_CONCAT(p.name, ', ') prints 'Smart Watch S, Wireless Mouse M3' — the string the pick walk actually reads.",
      notes: [
        { choice: 1, why: "TRIM strips leading/trailing spaces — it cannot insert one between articles. The separator lives in the aggregate's second argument, not in post-processing." },
        { choice: 2, why: "GROUP_CONCAT takes an optional separator — that IS its second argument. Row-by-row || concatenation needs a subquery scaffolding and reintroduces the ordering problem the aggregate solves." },
      ],
      difficulty: "medium",
    },
    {
      id: "ikea-mcq-7",
      prompt: "The pairing census self-joins order_items with a.product_id < b.product_id. Why the strict less-than?",
      choices: [
        "It keeps each unordered pair exactly once — the canonical form",
        "It speeds up the join by halving the comparisons",
        "It excludes same-family pairs from the census",
        "It is arbitrary — > produces the same pair counts",
      ],
      answer: 0,
      why: "Without an inequality every pair matches in both orientations and counts twice; the strict < keeps one canonical direction per pair. On this db it is the difference between 27 raw family pairings and a doubled, mirrored census.",
      notes: [
        { choice: 2, why: "Same-family diagonals still qualify — a.product_id < b.product_id only orders the two product ids, and 6 of the 27 pairings are diagonals (Audio×Audio 6, Accessories×Accessories 8). The inequality is not a family filter." },
        { choice: 3, why: "> produces the MIRROR counts — Audio×Accessories becomes Accessories×Audio. Same numbers, reversed labels: a different report that foots identically and confuses everyone." },
      ],
      difficulty: "medium",
    },
    {
      id: "ikea-mcq-8",
      prompt: "A staging rebuild of the pairing census drops the inequality and joins on order_id alone (with a.product_id <> b.product_id). Every pairing now appears twice — Audio×Accessories AND Accessories×Audio. First diagnosis?",
      choices: [
        "The data has duplicate line items — dedupe order_items first",
        "Without the canonicalizing inequality, each unordered pair matches in both orientations — restore a.product_id < b.product_id",
        "GROUP BY cannot handle two category columns; fold to one column first",
        "The census needs DISTINCT on the pair columns",
      ],
      answer: 1,
      why: "The <> exclusion stops a line pairing with ITSELF but not the two orientations of a genuine pair — (x,y) and (y,x) both survive and GROUP BY prints both mirrors. The canonical form is the inequality: one direction per unordered pair, by construction.",
      notes: [
        { choice: 0, why: "The db has zero duplicate (order, product) lines — the doubling is structural, not data corruption. Deduping the wrong table 'fixes' the symptom and hides the missing predicate." },
        { choice: 3, why: "DISTINCT cannot help — the two mirror rows differ in family_a/family_b, so both survive DISTINCT. The fix is the join predicate, not the projection." },
      ],
      difficulty: "hard",
    },
    {
      id: "ikea-mcq-9",
      prompt: "The coverage census labels each statement by its settled legs. A colleague writes: CASE WHEN SUM(p.amount_cents) = 0 THEN 'no payment' … For statements with NO payment legs, what happens?",
      choices: [
        "It works — SUM over no rows is 0, so the arm fires",
        "SUM over no rows is NULL, and NULL = 0 is UNKNOWN — the arm never fires and the statement falls through mislabeled",
        "SQLite raises an error on aggregating an empty group",
        "The arm fires only for partial settlements",
      ],
      answer: 1,
      why: "A LEFT JOIN with no legs yields one row of NULLs; SUM ignores the NULL and returns NULL. NULL = 0 is UNKNOWN, so the 'no payment' arm never fires — the guard is COALESCE(SUM(p.amount_cents), 0) = 0, which is exactly how the 6 never-collected statements get their label.",
      notes: [
        { choice: 0, why: "SUM over zero rows is NULL, not 0 — the classic empty-fold assumption. The 6 no-leg statements would silently land in the ELSE arm as 'partial'." },
        { choice: 2, why: "Empty groups do not error — LEFT JOIN guarantees every statement a (NULL-leg) row, and aggregates over NULLs return NULL quietly. The silence is the bug." },
      ],
      difficulty: "hard",
    },
    {
      id: "ikea-mcq-10",
      prompt: "The pick-wave leaderboard runs ORDER BY units DESC LIMIT 3. The units ladder reads 11, 10, then THREE purchases tied at 9. What ships, and what is the honest fix?",
      choices: [
        "All three 9s ship — LIMIT keeps ties at the boundary",
        "Exactly one of the three 9s ships, chosen engine-arbitrarily — add a deterministic tie-breaker (order_id ASC) or admit the tie with a rank window",
        "The query errors on the tie — aggregates require unique ordering keys",
        "Tighten LIMIT to 2 so the cut lands on the unique 10",
      ],
      answer: 1,
      why: "LIMIT is a row count, not a value boundary: with three rows tied at the cut, the engine keeps one of them with no guarantee which — the leaderboard is non-deterministic between runs. The fix is a deterministic tie-break in ORDER BY (units DESC, order_id ASC) or a rank window that admits all three tied purchases deliberately.",
      notes: [
        { choice: 0, why: "LIMIT 3 keeps three ROWS — the tie at the boundary is cut, not honored. Believing LIMIT respects ties is how two analysts ship two different 'top 3' from the same query." },
        { choice: 3, why: "LIMIT 2 sidesteps the tie by dropping the boundary row entirely — the leaderboard now under-reports a genuine 9-unit basket. The tie is a policy decision someone must own, not a bug to route around." },
      ],
      difficulty: "hard",
    },
    {
      id: "ikea-mcq-11",
      prompt: "The range audit runs `SELECT p.name FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL`. What comes back on this db — and what does it prove?",
      choices: [
        "All 16 articles — the LEFT JOIN keeps every range row regardless of sales",
        "Zero rows — every article on the range has sold at least once, proven rather than assumed",
        "The 14 thin-cover articles — Headset, Mic and their stockout candidates",
        "One row per article with its unsold-unit count",
      ],
      answer: 1,
      why: "The IS NULL predicate keeps only products with no matching line. On this curated range the anti-join returns zero rows — and that zero is the finding: a 16-article range where every article sold is a proven fact, not an assumption the board can lean on.",
      notes: [
        { choice: 0, why: "That describes the LEFT JOIN before the WHERE — the IS NULL filter keeps only the unmatched rows, and there are none." },
        { choice: 2, why: "14 is the awaiting-pickup order count, a different census. No article on this range has zero sales — the thin covers (14, 15, 17 remaining) are stock facts, not sold-zero facts." },
      ],
      difficulty: "easy",
    },
    {
      id: "ikea-mcq-12",
      prompt: "A family readout runs `SELECT p.category FROM products p JOIN order_items oi ON oi.product_id = p.id` and prints 'Audio' 51 times. What is the one-word fix, and what do the duplicates measure?",
      choices: [
        "DISTINCT — the duplicates are line-grain rows (Audio's 51 flat-pack lines), not data errors",
        "GROUP BY category — joins are only legal alongside GROUP BY",
        "LIMIT 7 — cap the projection to the seven known families",
        "WHERE oi.quantity = 1 — collapse the multi-unit lines first",
      ],
      answer: 0,
      why: "The join fans each article into its line items, so the category repeats once per line. DISTINCT folds the projection back to the seven families. GROUP BY belongs when you aggregate; LIMIT truncates arbitrarily; quantity filters units, not grain.",
      notes: [
        { choice: 1, why: "A join is legal without GROUP BY — the output is simply at line grain. The engine is not waiting for a GROUP BY to permit the query." },
        { choice: 2, why: "LIMIT 7 keeps an arbitrary seven rows — likely seven Audio lines. Only DISTINCT folds to families." },
      ],
      difficulty: "easy",
    },
    {
      id: "ikea-mcq-13",
      prompt: "Store ops wants collected purchases per market. Which query answers it?",
      choices: [
        "SELECT c.region, COUNT(*) FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region WHERE o.status = 'delivered'",
        "SELECT c.region, COUNT(*) FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'delivered' GROUP BY c.region",
        "SELECT c.region, COUNT(o.status = 'delivered') FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region",
        "SELECT c.region, COUNT(c.region) FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY o.status",
      ],
      answer: 1,
      why: "Clause order is fixed: WHERE discards the 51 non-collected rows row-by-row, then GROUP BY folds the surviving 52 into markets. WHERE after GROUP BY is a syntax error, and folding by status instead of region answers a different question.",
      notes: [
        { choice: 2, why: "COUNT(expr) counts non-NULL values — the 0/1 comparison is never NULL, so it counts every row. You'd ship 103, not 52." },
        { choice: 3, why: "GROUP BY o.status folds into four status buckets, not markets — a different report wearing the same SELECT list." },
      ],
      difficulty: "easy",
    },
    {
      id: "ikea-mcq-14",
      prompt: "The pickup clock averages open-to-pickup at 2.98 days. Which expression computes it from the TEXT timestamps?",
      choices: [
        "o.shipped_at - o.created_at",
        "julianday(o.shipped_at) - julianday(o.created_at)",
        "CAST(o.shipped_at AS INT) - CAST(o.created_at AS INT)",
        "DATEDIFF(day, o.created_at, o.shipped_at)",
      ],
      answer: 1,
      why: "Timestamps are ISO text; plain subtraction coerces both sides to numbers and yields 0. julianday converts each stamp to a fractional day count, so the stamped-only average reads 2.98. DATEDIFF does not exist in SQLite.",
      notes: [
        { choice: 0, why: "'2024-01-05' - '2024-01-03' coerces to 0 − 0 = 0 — every latency reads zero and the clock flatlines." },
        { choice: 2, why: "CAST of an ISO string to INT keeps the leading year — 2024 − 2024 = 0 again." },
      ],
      difficulty: "easy",
    },
    {
      id: "ikea-mcq-15",
      prompt: "The range board asks for articles whose sold-units rank is 3 or better. A colleague writes `WHERE RANK() OVER (ORDER BY SUM(oi.quantity) DESC) <= 3`. What happens?",
      choices: [
        "It works — window functions are allowed in WHERE",
        "It errors — window functions evaluate after WHERE, so the rank must be computed in a subquery or CTE and filtered outside",
        "It works but returns 3 rows regardless of ties",
        "It silently returns every article",
      ],
      answer: 1,
      why: "The SELECT pipeline evaluates WHERE before the window layer exists, so a window call in WHERE is rejected. The fix is the escalation shape: fold units per article with the RANK computed in a subquery or CTE, then filter rank <= 3 in the outer query.",
      notes: [
        { choice: 2, why: "RANK hands ties a shared rank — the top 3 could legitimately be more than 3 rows — but the query never gets that far; it errors first." },
        { choice: 3, why: "Nothing runs. The engine's rejection is the pipeline-order lesson itself: windows are computed after WHERE." },
      ],
      difficulty: "medium",
    },
    {
      id: "ikea-mcq-16",
      prompt: "The family census joins line items to articles and folds by category. What does COUNT(DISTINCT p.id) add that COUNT(*) hides?",
      choices: [
        "Articles per family — Audio folds to 3 articles behind its 51 lines",
        "Units per family — the flat-pack carton count",
        "Revenue per family — DISTINCT is what stops double counting",
        "Nothing — both count the same rows after GROUP BY",
      ],
      answer: 0,
      why: "COUNT(*) counts the fold's rows — line items (Audio 51). COUNT(DISTINCT p.id) folds the fan-out back to the articles behind them — Audio's 3 (Headset, Studio Mic, Speaker Mini). One column measures load, the other measures range width.",
      notes: [
        { choice: 1, why: "Units need SUM(oi.quantity) — 97 for Audio. DISTINCT against product ids is a different fold entirely." },
        { choice: 3, why: "They disagree wherever a family's articles sell on multiple lines — which is every family on this db." },
      ],
      difficulty: "easy",
    },
    {
      id: "ikea-mcq-17",
      prompt: "The shelf card runs `ORDER BY price DESC LIMIT 3`. Which three articles ship, and why is the result deterministic?",
      choices: [
        "Smart Watch S 199.99, Noise-Canceling Headset 149.99, 4K Webcam Pro 129.00 — prices are unique, so no tie-break is needed",
        "Smart Watch S, Headset, Studio Desktop Mic — LIMIT keeps ties at the boundary",
        "It is nondeterministic — LIMIT without a tie-breaker returns arbitrary rows",
        "Webcam, Mic, Mechanical Keyboard K1 — the query reads the ladder bottom-up",
      ],
      answer: 0,
      why: "The ladder's top prices are unique (199.99, 149.99, 129.00), so LIMIT 3 has no boundary tie to break — the same three articles ship every run. Determinism here is a fact about the data, not about LIMIT.",
      notes: [
        { choice: 1, why: "The Studio Mic sits at 119.00 — fourth, not tied third. LIMIT keeps rows, not value boundaries." },
        { choice: 2, why: "Nondeterminism bites only when rows tie AT the cut — as in the units ladder's 36-tie. Unique prices cut cleanly." },
      ],
      difficulty: "easy",
    },
    {
      id: "ikea-mcq-18",
      prompt: "A stakeholder averages the four per-market average tickets — EU 335.32, APAC 313.66, US 383.48, LATAM 426.22 — and reports 364.67. The board's average ticket is 338.19. Which number survives the range board, and why?",
      choices: [
        "364.67 — per-market averages are the honest cut of a market business",
        "338.19 — the purchase-grain mean over 103 purchases; 364.67 weights LATAM's 2 purchases as heavily as EU's 45",
        "Both — they answer different questions, so either can headline the deck",
        "Neither — the average ticket is undefined on a range this narrow",
      ],
      answer: 1,
      why: "Averaging averages reweights the population: LATAM's 426.22 rests on 2 purchases yet counts as one full vote. The purchase-grain mean over all 103 purchases is 338.19 — the number every other metric (ticket bands, market intensity) divides from. If the market cut is wanted, print n beside each mean.",
      notes: [
        { choice: 0, why: "Per-market means are legitimate market views — but their unweighted average is not the platform's average ticket, and 364.67 reconciles to nothing downstream." },
        { choice: 2, why: "They are different numbers wearing one name — the deck that quotes both without grain labels fails the first 'how do you know' follow-up." },
      ],
      difficulty: "hard",
    },
    {
      id: "ikea-mcq-19",
      prompt: "A supplier feed reload lands article names lowercased — 'smart watch s' beside 'Smart Watch S'. What breaks first?",
      choices: [
        "Nothing — SQLite string comparison is case-insensitive",
        "GROUP BY name splits the article into two ladder rows and joins on name miss the originals — the units ladder double-counts the range",
        "Only the pick-list display changes — aggregates are unaffected",
        "The database rejects the reload on a uniqueness constraint",
      ],
      answer: 1,
      why: "Name is the group-by key on the ladder and the join key on several feeds: a casing slip creates a phantom second article, splitting 46 sold units into two rows and inflating range-width counts. The fix is hygiene at the boundary — normalize the name before it lands, or key on the stable id.",
      notes: [
        { choice: 0, why: "SQLite's = is case-sensitive for text. 'smart watch s' = 'Smart Watch S' is false — that is exactly the break." },
        { choice: 3, why: "If name carried a uniqueness constraint the load would fail loudly — the dangerous case is when it does not, and the split ships silently." },
      ],
      difficulty: "medium",
    },
    {
      id: "ikea-mcq-20",
      prompt: "The one-pass fate census counts all four stages in one scan. Which line prints the awaiting-pickup count?",
      choices: [
        "COUNT(*) FILTER (WHERE status = 'pending')",
        "COUNT(status = 'pending')",
        "COUNT(*) WHERE status = 'pending'",
        "SUM(COUNT(*)) FILTER (WHERE status = 'pending')",
      ],
      answer: 0,
      why: "FILTER (WHERE …) is the one-pass branch: it counts the 14 pending rows inside the same scan that prints 52 delivered, 30 in transit and 7 cancelled. The four branches reconcile to 103 by construction — that identity is the census's correctness argument.",
      notes: [
        { choice: 1, why: "COUNT(expr) counts non-NULLs — the 0/1 comparison is never NULL, so it prints 103." },
        { choice: 2, why: "WHERE is a clause keyword, not an aggregate argument — syntax error." },
      ],
      difficulty: "easy",
    },
    {
      id: "ikea-mcq-21",
      prompt: "NTILE(4) over the 16-article price ladder ordered descending — how do the bands come out, and where does Smart Watch S (199.99) land?",
      choices: [
        "Four bands of 4 articles; the Watch leads band 1",
        "Four bands sized by price range; the Watch is alone in band 1",
        "One article per band; the Watch leads band 1",
        "Four bands of 4; the Watch lands in band 4 because bands run cheapest-first",
      ],
      answer: 0,
      why: "NTILE distributes ROWS evenly — 16 articles over 4 tiles is 4 per tile, regardless of where prices gap. Ordered descending, the Watch heads tile 1. The 8-budget/8-mid split at the 50.00 boundary is a CASE decision about values; NTILE's quartiles are a decision about row counts — do not confuse the two.",
      notes: [
        { choice: 1, why: "Tiles are row-count buckets; NTILE never reads the values it tiles." },
        { choice: 3, why: "With ORDER BY price DESC the first tile takes the first rows — the expensive ones. The ORDER BY direction decides which end bands from." },
      ],
      difficulty: "medium",
    },
    {
      id: "ikea-mcq-22",
      prompt: "A 3-article moving read — `AVG(price) OVER (ORDER BY price DESC ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)` — runs down the price ladder. What prints on the first two rows?",
      choices: [
        "NULL for both — the frame has no preceding rows yet",
        "The average of whatever rows exist — 1 row on the first, 2 on the second; the frame clips at the partition edge",
        "The full-ladder average until three rows accumulate",
        "A runtime error — the frame is malformed",
      ],
      answer: 1,
      why: "ROWS frames clip at the partition boundary: row 1 averages itself, row 2 averages two rows, and the 3-wide average only exists from row 3. Analysts who assume full-width frames misread the edge — on this ladder the Watch's 'moving average' is just 199.99.",
      notes: [
        { choice: 0, why: "Frames never pad with NULL — they shrink at the edge. That is the honest clip, not a missing value." },
        { choice: 2, why: "A frame defaulting to the whole partition is the no-frame window, not a 3-row ROWS frame." },
      ],
      difficulty: "medium",
    },
    {
      id: "ikea-mcq-23",
      prompt: "The dunning report prints paid_cents for the 6 never-collected statements as NULL. A colleague wraps it: `COALESCE(SUM(p.amount_cents), 0)`. When is that honest?",
      choices: [
        "Never — NULLs must reach the report untouched",
        "For display — 'no settlement yet' prints as 0.00; but never inside the coverage CASE, where COALESCE-before-compare folds no-leg statements into a settled bucket",
        "Always — arithmetic should never see NULL",
        "Only for statements marked paid",
      ],
      answer: 1,
      why: "COALESCE is a display policy, not a truth policy: printing 0.00 for not-yet-settled money is readable, but comparing COALESCE(SUM(...), 0) to billed cents inside the CASE reclassifies the 6 no-leg statements — including the paid-status liar #28 — as settled-at-zero, and the coverage census 21/1/6 stops footing.",
      notes: [
        { choice: 0, why: "Raw NULLs in a printed AR list read as errors to stakeholders — 0.00 with a 'none' label is the honest display." },
        { choice: 3, why: "#28's paid status is exactly the claim the legs table contradicts — keying COALESCE off status re-arms the liar." },
      ],
      difficulty: "medium",
    },
    {
      id: "ikea-mcq-24",
      prompt: "The pick list must read heaviest-article-first within each basket, but bare GROUP_CONCAT(p.name, ', ') prints articles in arbitrary order. What is the fix?",
      choices: [
        "ORDER BY in the outer query fixes the list order",
        "Fold from a pre-ordered CTE (or use ORDER BY inside the aggregate where the engine supports it) — bare GROUP_CONCAT's order is unspecified",
        "GROUP_CONCAT always follows rowid order, so nothing is needed",
        "Concatenate with || per row instead — that preserves order",
      ],
      answer: 1,
      why: "The aggregate folds rows in whatever order the plan hands it; an outer ORDER BY sorts the folded strings, not the elements inside them. Stage the fold: order the lines in a CTE first, then aggregate — or use the engine's in-aggregate ORDER BY where available.",
      notes: [
        { choice: 0, why: "ORDER BY after GROUP BY orders the output rows (baskets), not the items concatenated within each cell." },
        { choice: 2, why: "Rowid order is an implementation accident, not a contract — a plan change or a reloaded table reshuffles the pick list." },
      ],
      difficulty: "medium",
    },
    {
      id: "ikea-mcq-25",
      prompt: "A colleague re-arms the band CASE as: `WHEN price >= 50 THEN 'mid-shelf' WHEN price >= 200 THEN 'premium' ELSE 'budget'`. What is wrong on this range?",
      choices: [
        "Nothing — no article reaches 200, so the premium arm never matters",
        "The premium arm is dead code: WHEN arms fire in order, so >= 50 catches every article at 50-and-up first — today the ladder tops at 199.99, but any future premium article silently bands as mid-shelf",
        "SQLite reorders WHEN arms by selectivity, so it self-corrects",
        "The ELSE arm now catches everything under 200 only",
      ],
      answer: 1,
      why: "CASE is a first-match-wins ladder and the arms must run broad-to-narrow. The reordering changes nothing on today's 16 articles — 199.99 is the ceiling — but it is a policy bug waiting for the first 200-plus article, which will land in mid-shelf with no error to flag it.",
      notes: [
        { choice: 0, why: "The empty premium band is honest on today's ladder — but arm order decides what happens the day the range adds one. That is exactly when the bug ships invisibly." },
        { choice: 2, why: "Engines evaluate WHEN arms in written order — selectivity reordering is a myth." },
      ],
      difficulty: "hard",
    },
    {
      id: "ikea-mcq-26",
      prompt: "A market exclusion list is staged for the expansion report: `WHERE c.region NOT IN (SELECT region FROM staging_markets)`. Staging carries one row with a NULL region. What ships?",
      choices: [
        "Every market — the NULL row is skipped by NOT IN",
        "Nothing — one NULL in the list makes every comparison UNKNOWN, and the report empties silently",
        "Only the markets present in staging",
        "An error — NOT IN rejects NULL list members",
      ],
      answer: 1,
      why: "region NOT IN (…, NULL) can never be provably true: for each row the engine asks 'unequal to every member?' and a NULL member leaves that UNKNOWN. The whole report returns zero rows while looking valid. The fix is staging hygiene: filter NULLs in the subquery, or use NOT EXISTS.",
      notes: [
        { choice: 0, why: "IN tolerates a NULL member; NOT IN does not — the same list that powers one readout poisons the other." },
        { choice: 3, why: "No error is raised — the silence is the bug. An empty expansion report reads as a clean staging table." },
      ],
      difficulty: "hard",
    },
    {
      id: "ikea-mcq-27",
      prompt: "'Flag every article priced above its own family's average.' Two shapes: a correlated subquery on the family average, or AVG(price) OVER (PARTITION BY category). What differs?",
      choices: [
        "Results differ — the window computes family means over a different population",
        "Same rows, different cost: the correlated form re-runs per article, the window computes each family's mean once — at 16 articles either works, at warehouse scale the window wins",
        "The window form errors — PARTITION BY cannot reference the outer query",
        "The correlated form errors — subqueries cannot reference aggregates",
      ],
      answer: 1,
      why: "Both compare each article to its family mean; they differ in evaluation. The correlated subquery re-runs once per outer row; the window computes each partition's average once per scan. On a 16-article range the cost is invisible — the interviewer is probing whether you know which shape scales.",
      notes: [
        { choice: 0, why: "Same partition logic, same population, same rows. The follow-up is always 'then why reach for the window?' — cost at scale." },
        { choice: 2, why: "PARTITION BY needs no outer reference — it partitions the same query's rows." },
      ],
      difficulty: "hard",
    },
    {
      id: "ikea-mcq-28",
      prompt: "The month-close packet filters purchases with `WHERE STRFTIME('%Y-%m', created_at) = '2024-07'`. The warehouse team prefers a half-open range on the raw column. Why?",
      choices: [
        "STRFTIME cannot be used in WHERE",
        "Sargability: wrapping the column in a function hides it from any index and forces a scan; created_at >= '2024-07-01' AND created_at < '2024-08-01' stays index-usable and cannot leak into August",
        "The function form loses the last night of July",
        "They are equivalent — the team just prefers readability",
      ],
      answer: 1,
      why: "A predicate on the bare column is sargable — the engine can seek the index range; a function-wrapped column must be evaluated row by row. The half-open upper bound is also the boundary-correct form: BETWEEN on '2024-07-31' drops a timestamped July 31 late-evening purchase the function form would keep.",
      notes: [
        { choice: 0, why: "It parses and runs fine — the cost, not the grammar, is the argument." },
        { choice: 2, why: "The function form is boundary-correct on this db's date-only text; the risk sits in the BETWEEN variant, not STRFTIME." },
      ],
      difficulty: "medium",
    },
    {
      id: "ikea-mcq-29",
      prompt: "Two fate packets are stacked with UNION instead of UNION ALL: the collected report (52 purchases) and the in-transit report (30). A market's row happens to be identical in both branches — and one row vanishes from the stack. Why?",
      choices: [
        "UNION ALL has a row cap UNION does not",
        "UNION deduplicates whole rows silently — a market whose collected and in-transit counts coincide folds to one row, and the packet under-reports without error",
        "UNION sorts the stack and drops the last row",
        "The two reports have different column counts",
      ],
      answer: 1,
      why: "UNION is UNION ALL plus a whole-row dedupe. When the two branches happen to produce an identical row — same market, same count — one copy disappears and the stack stops footing to 103. Stack distinct populations with UNION ALL; reserve UNION for when dedupe is the requirement, and say so.",
      notes: [
        { choice: 2, why: "Sorting is not deletion — the lost row is the dedupe, not an ORDER BY side effect." },
        { choice: 3, why: "Same SELECT list, same columns — the stacks align. The vanishing is semantic, not structural." },
      ],
      difficulty: "hard",
    },
    {
      id: "ikea-mcq-30",
      prompt: "Months with purchases EXCEPT months with abandoned purchases: the spine holds 14 months and cancellations touch 5 of them (Jan 2024, Mar 2024, Jul 2024, Nov 2024, Jan 2025). What does the EXCEPT return, and what is it for?",
      choices: [
        "5 months — the abandoned months themselves",
        "9 months — the clean months where every purchase held the rail; the readout behind the abandoned-purchase review",
        "14 months — EXCEPT never removes months",
        "2 months — July and November, the trough months",
      ],
      answer: 1,
      why: "EXCEPT keeps the left set minus any row also in the right set: 14 purchase months minus the 5 cancellation-touched months = 9 clean months. It is the set-algebra readout for 'where did the funnel hold' — and it dedupes silently, so the left side must already be one-row-per-month.",
      notes: [
        { choice: 3, why: "July and November carry 2 cancellations each — the concentration the review quotes — but Jan 2024, Mar 2024 and Jan 2025 carry one each and are subtracted too." },
        { choice: 0, why: "That is the right side alone. EXCEPT answers 'left minus right', and the left side is the 14-month spine." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-ikea-1",
      tier: "easy",
      topic: "x1",
      universe: "funnel",
      title: "The click-and-collect pick list",
      brief:
        "IKEA brief on the storefront db: the store opens at 10 and the pick walk starts before it — the co-worker pulling flat-pack cartons needs ONE cell per basket: the pick list, article names in reading order. Probed facts: 103 purchases fold into 251 flat-pack lines (2.44 lines per order, max quantity 3 on a line); 77 baskets carry 2 or more articles and 26 are single-article grabs; the heaviest basket on the range is order 39 — 4 articles, 11 units: Smart Watch S, Wireless Mouse M3, Cycling Jersey Pro, Laptop Stand Aluminum. The fold is fixed: one row per order, articles concatenated with the two-character separator ', ', heaviest basket by units first.",
      ask: "Return the single heaviest pick list: order id, article count, the pick list itself, and total units — one row, biggest units first.",
      template:
        "SELECT oi.order_id,\n       COUNT(*) AS articles,\n       {1}(p.name, {2}) AS pick_list,\n       SUM(oi.quantity) AS units\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY oi.order_id\nORDER BY units {3}\nLIMIT {4};",
      slots: [
        {
          answer: "GROUP_CONCAT",
          kind: "keyword",
          label: "the pick-list fold",
          why: "GROUP_CONCAT(p.name, ', ') folds the basket's article rows into ONE pick-list cell — the exact string the pick walk reads. SUM and COUNT take one argument and error on the two-arg call; MAX(p.name, ', ') is the two-arg scalar max and prints a single article name, not the list.",
        },
        {
          answer: "', '",
          kind: "keyword",
          label: "the separator",
          why: "The two-character separator keeps article names readable — 'Smart Watch S, Wireless Mouse M3'. Bare GROUP_CONCAT defaults to ',' with no space, and a '; ' or '' separator prints a list the scanner reads differently.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "The pick walk starts with the heaviest basket: 11 units on order 39. ASC serves the 1-unit single-article basket (order 9, USB-C Hub 7-in-1) — a correct query aimed at the wrong end of the pick wave.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the single-basket cut",
          noVerify: true,
          why: "The ask is THE heaviest pick list — one row. LIMIT 1 keeps exactly order 39; LIMIT 2 would hand the walk a runner-up basket nobody pulled cartons for.",
        },
      ],
      distractors: ["SUM", "MAX", "'; '", "ASC", "2"],
      walkthrough:
        "One fold, one cell, one basket. The join attaches each of the 251 flat-pack lines to its article, GROUP BY oi.order_id folds them into 103 baskets — 26 single-article grabs and 77 multi-article baskets — and GROUP_CONCAT(p.name, ', ') prints the pick list in one cell while COUNT(*) and SUM(oi.quantity) count the fold at two grains: 4 articles and 11 units on the heaviest basket, order 39 — Smart Watch S, Wireless Mouse M3, Cycling Jersey Pro, Laptop Stand Aluminum. ORDER BY units DESC + LIMIT 1 is the pick walk's first stop. The distractors fail honestly: SUM and COUNT reject the two-argument call outright; MAX(p.name, ', ') is the two-argument scalar max — it prints one article name, not the list; '; ' and the empty string each print a list the scanner reads differently; ASC opens the walk on order 9's single USB-C Hub; LIMIT 2 ships an unrequested runner-up. The grain is the whole lesson: one row per ORDER, not per line — fold at the wrong grain and the pick list repeats an article once per carton.",
    },
    {
      id: "cs-ikea-2",
      tier: "hard",
      topic: "j6",
      universe: "growth",
      title: "The complete-the-project pairing census",
      brief:
        "IKEA brief on the storefront db: the range board pairs product families for the complete-the-project shelf — a mic goes with a stand, a watch with a band — and the pairing rule is mechanical: two families are paired when they share flat-pack baskets, and the traction floor is fixed at 12 shared baskets before a pairing earns shelf adjacency. Probed facts: the basket-pair census over 103 purchases finds 27 raw family pairings, 6 of them same-family diagonals (the Fitness diagonal is impossible — the family carries exactly 1 article); Audio×Accessories leads at 30 shared baskets, Electronics×Audio 21, Electronics×Accessories 20, and the foot of the qualifying ladder sits at exactly 12 — three pairings tied there (Accessories×Apparel, Audio×Video, Electronics×Video).",
      ask: "Return every family pairing with at least 12 shared flat-pack baskets: the two families and the shared-basket count, biggest first.",
      template:
        "SELECT p1.category AS family_a,\n       p2.category AS family_b,\n       COUNT(*) AS basket_pairs\nFROM order_items a\nJOIN order_items b ON b.{1} = a.order_id\n                  AND a.product_id {2} b.product_id\nJOIN products p1 ON p1.id = a.product_id\nJOIN products p2 ON p2.id = b.product_id\nGROUP BY p1.category, p2.category\nHAVING COUNT(*) >= {3}\nORDER BY basket_pairs {4};",
      slots: [
        {
          answer: "order_id",
          kind: "keyword",
          label: "the basket key",
          why: "Pairs count only inside ONE basket: b.order_id = a.order_id joins each line to its basket-mates. b.product_id joins lines across different orders and the census reads garbage (Electronics×Accessories 43 at the top).",
        },
        {
          answer: "<",
          kind: "keyword",
          label: "the pair canonicalizer",
          why: "a.product_id < b.product_id keeps each unordered pair once — the canonical form. '=' collapses the census to self-pairs (Accessories×Accessories 62 — every line paired with itself), '<>' prints both mirrors of every pair, and '>' flips the orientation.",
        },
        {
          answer: "12",
          kind: "number",
          label: "the traction floor",
          why: "The floor is fixed at 12: ten pairings clear it, and the three at the foot sit exactly at 12 (Accessories×Apparel, Audio×Video, Electronics×Video). 13 silently drops all three; 2 floods the board with 26 pairings.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the stickiest-first direction",
          why: "The board reads stickiest pairing on top: Audio×Accessories 30, Electronics×Audio 21, Electronics×Accessories 20. ASC opens on the weakest qualifiers — a correct query aimed at the wrong end of the ladder.",
        },
      ],
      distractors: ["product_id", ">", "<>", "13", "ASC", "2"],
      walkthrough:
        "A self-join with a canonical form and a named floor. Stage one pairs lines: b.order_id = a.order_id keeps the join inside one basket, and a.product_id < b.product_id keeps each unordered pair once — 27 raw family pairings exist on this range, 6 of them diagonals, the Fitness diagonal impossible at 1 article. Stage two folds: GROUP BY both categories counts shared baskets per pairing and HAVING COUNT(*) >= 12 applies the traction floor — ten pairings survive, Audio×Accessories 30 at the top, the three-way tie at 12 at the foot. The distractors each break differently: b.product_id pairs lines across orders and the census reads 43; '>' flips the orientation (Accessories×Audio on top); '=' folds every line with itself — 62 phantom Accessories pairs; '<>' counts both mirrors of every pair; 13 silently drops the three qualifying pairings at the foot; ASC reads weakest-first. The floor number is a definition, not a discovery: it ships with the query, and changing it changes the shelf.",
    },
    {
      id: "cs-ikea-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The fast-mover replenishment board",
      brief:
        "IKEA brief on the storefront db: the flat warehouse runs a morning replenishment pass over the fast movers, and the fast-mover floor is fixed at 30 units sold — articles at or above it earn the pass, the rest wait for the weekly walk. Probed facts: the 251 flat-pack lines fold to per-article units of 47 (Desk Mat Extended), 46 (Noise-Canceling Headset), 38 (HDMI 2.1 Cable 2m), then the 36-tie (Laptop Stand Aluminum, Wireless Mouse M3), 33 (Running Socks 3-pack), 31 (4K Webcam Pro), and the three-way 30-tie (Fitness Band X2, Ring Light 14\", Studio Desktop Mic). The floor keeps exactly 10 articles, and RANK prints 1, 2, 3, 4, 4, 6, 7, 8, 8, 8 — both ties stay visible on the board.",
      ask: "Return article, units sold, and a rank that honors ties for every article with at least 30 units sold, busiest first, ties broken alphabetically for display.",
      template:
        "SELECT p.name AS article,\n       SUM(oi.quantity) AS units,\n       {1}() OVER (ORDER BY SUM(oi.quantity) {2}) AS shelf_rank\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.id, p.name\nHAVING SUM(oi.quantity) >= {3}\nORDER BY shelf_rank, article;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie-honoring ranker",
          why: "RANK gives tied units the same rung and skips after — 36, 36 then 6; 30, 30, 30 then nothing higher on this board. DENSE_RANK would compact the gaps (the 30-tie reading 7, 7, 7), and ROW_NUMBER would split the ties arbitrarily, silently ranking one Mouse unit above another.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "The replenishment pass starts with the heaviest movers: Desk Mat 47, Headset 46. ASC would open the walk on the three 30-unit articles — a correct query aimed at the wrong end of the board.",
        },
        {
          answer: "30",
          kind: "number",
          label: "the fast-mover floor",
          why: "The floor is the policy: at 30 exactly ten articles qualify, and the three-way 30-tie rides the boundary — the tie is IN the output, not cut by it. 31 silently drops all three 30-unit articles (a board of 7), and 20 floods it to 13 rows.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "31"],
      walkthrough:
        "A leaderboard with a policy floor and two structural ties. The join fans the 251 lines out to their articles, GROUP BY p.id folds each article's units, and HAVING SUM(oi.quantity) >= 30 applies the fast-mover floor — ten articles survive, including the three riding the boundary at exactly 30. RANK() OVER (ORDER BY SUM DESC) numbers them busiest-first: 1 through 3 unique, the 36-tie sharing rung 4, the 30-tie sharing rung 8 — the board shows peer articles as peers, which is the range-board convention. The distractors each break differently: DENSE_RANK compacts the gaps and the ladder loses its honest shape; ROW_NUMBER splits the ties arbitrarily — two analysts run it twice and disagree on which Mouse is 'first'; ASC opens the walk on the boundary articles; 31 drops the entire 30-tie and the board shrinks to 7 rows with no error to flag it. The floor number is a definition, not a discovery: it ships with the query, and the ties it keeps are the board's honesty.",
    },
    {
      id: "cs-ikea-4",
      tier: "medium",
      topic: "s6",
      universe: "pricing",
      title: "The shelf-band census",
      brief:
        "IKEA pricing-pod brief on the storefront db: the shelf is banded by policy — budget under 50.00, mid-shelf from 50.00, premium at 200-and-up — and the census is the one-pass readout the buying review opens with: articles, flat-pack lines, units and revenue per band. Probed facts: the 16-article range splits 8-and-8 at the 50.00 boundary; mid-shelf runs 8 articles / 118 lines / 230 units / 26,605.51 of revenue; budget runs 8 / 133 / 268 / 8,227.77; the premium arm (>= 200) is honestly empty — the ladder tops out at Smart Watch S, 199.99. The two bands foot to the book: 251 lines, 498 units, 34,833.28.",
      ask: "Return one row per shelf band: the band label, article count, line count, units and revenue, heaviest revenue first.",
      template:
        "SELECT CASE\n         WHEN p.price >= {2} THEN 'premium'\n         WHEN p.price >= 50 THEN 'mid-shelf'\n         ELSE 'budget'\n       END AS band,\n       {1}(DISTINCT p.id) AS articles,\n       COUNT(*) AS lines,\n       SUM(oi.quantity) AS units,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM products p\nLEFT JOIN order_items oi ON oi.product_id = p.id\nGROUP BY band\nORDER BY revenue {3};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the article counter",
          why: "COUNT(DISTINCT p.id) folds the join's fan-out back to articles — 8 and 8, the range-width read the board governs. SUM(DISTINCT p.id) runs and returns the sum of the ids — a meaningless number that shifts if a supplier re-registers an article.",
        },
        {
          answer: "200",
          kind: "number",
          noVerify: true,
          label: "the premium boundary",
          why: "200 is the policy line the buying review set — and on this range the arm never fires: 199.99 is the ceiling, so the premium band prints no row at all. That empty arm is the census's honesty point; drop the boundary to 150 and Smart Watch S (199.99) flees mid-shelf into a one-article premium band the board has never debated.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the revenue-first direction",
          why: "The review opens where the money is: mid-shelf 26,605.51 over budget 8,227.77 — a 3.2x revenue gap on an even 8-and-8 article split. ASC would open on the budget band and bury the readout's headline.",
        },
      ],
      distractors: ["150", "100", "ASC", "SUM"],
      walkthrough:
        "A CASE census with an honestly empty arm. The CASE bands each article first-match-wins — premium at 200, mid-shelf from 50, budget below — and on today's ladder the premium arm is dead code in the healthiest sense: nothing reaches it, so the census prints two rows. COUNT(DISTINCT p.id) is the articles column (8 and 8 — the DISTINCT is what keeps the fold from counting lines as articles), COUNT(*) is lines (118 versus 133 — budget sells more cartons), SUM(oi.quantity) is units (230 versus 268), and the revenue fold reads 26,605.51 against 8,227.77: mid-shelf carries 76% of the book's value on half its articles. The distractors each break differently: 150 and 100 both move articles across the policy line and invent a premium band the board never voted on; ASC opens on budget and buries the 3.2x gap; SUM(DISTINCT p.id) 'counts' articles by adding their ids — a meaningless number that changes if a supplier re-registers. The census rule holds: state the boundaries, prove the empty arm, and make the bands foot to 251 lines and 34,833.28 by construction.",
    },
    {
      id: "cs-ikea-5",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The franchise chaser queue",
      brief:
        "Month-close brief, in-world: the franchise finance pod sends dunning letters before the close ships, and the chaser queue is every statement with no settlement legs at all — money invoiced, nothing collected. Probed on the storefront db: 28 statements, 27 payment legs; the anti-join returns 6 never-collected statements worth 15,217.00 — INV-2025-024 at 4,937.00 (open), INV-2025-026 at 3,562.00, INV-2025-027 at 2,794.00, INV-2025-028 at 1,756.00 (status 'paid' with zero legs — the liar that heads the queue), INV-2024-021 at 1,295.00 and INV-2024-018 at 873.00. Statements and legs carry INTEGER cents; the dollar read is the /100 divisor.",
      ask: "Return the chaser queue: statement number, status, owed dollars, and the queue depth on every row, biggest owed first.",
      template:
        "SELECT i.number,\n       i.status,\n       i.amount_cents / {1} AS owed_dollars,\n       {2}(*) OVER () AS chaser_queue\nFROM invoices i\n{3} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id {4}\nORDER BY owed_dollars DESC;",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divisor",
          why: "Statements carry INTEGER cents, so the dollar read is amount_cents / 100.0 — 493,700 prints as 4,937.0. A bare 100 risks integer arithmetic on odd-cent rows, and a 10 divisor reads a tenfold-heavy book: the queue would open at 49,370 and every chaser letter would demand the wrong money.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the queue-depth counter",
          why: "COUNT(*) OVER () counts the surviving rows — 6 — onto every row, so the desk sees the queue's depth beside each letter. SUM(*) is a syntax error and MAX(*) collapses to one row: neither prints a queue.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the statement-preserving join",
          why: "LEFT JOIN keeps all 28 statements and hands the 6 legless ones a NULL payload for the WHERE to catch. INNER JOIN deletes exactly those 6 rows — the queue empties, the dunning run reports success, and 15,217.00 of franchise money never gets chased.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the no-legs test",
          why: "p.id IS NULL is the anti-join predicate: no leg row matched. IS NOT NULL would return the 22 SETTLED statements — the complement, a clean ledger wearing the chaser queue's name.",
        },
      ],
      distractors: ["INNER", "IS NOT NULL", "SUM", "10"],
      walkthrough:
        "An anti-join with a liar at the top. The LEFT JOIN keeps every statement; the 22 with legs match, the 6 without arrive as NULL payloads, and WHERE p.id IS NULL keeps exactly the legless — the chaser queue. The cents divisor turns raw cents into dollars: 4,937.00, 3,562.00, 2,794.00, 1,756.00, 1,295.00, 873.00, and COUNT(*) OVER () stamps the queue depth (6) on every row so the desk knows the run's size at a glance. The queue's headline is the anomaly: INV-2025-028 reads status 'paid' with zero settlement legs — a claim the legs table contradicts, which is why leg rows are the ledger of record and status is a claim. The distractors each break differently: INNER JOIN empties the queue by deleting exactly the rows it exists to chase; IS NOT NULL ships the settled complement as if it were dunning; SUM(*) and MAX(*) cannot print a row count; 10 re-scales every letter tenfold. The close rule holds: 6 statements, 15,217.00, footing to the 21-exact / 1-partial / 6-none census — or the close does not ship.",
    },
    {
      id: "cs-ikea-6",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The monthly units spine",
      brief:
        "IKEA range-board brief on the storefront db: dollars say what the book earned, cartons say how hard the flat warehouse worked — the seasonality review walks the 14-month purchase spine (2024-01 to 2025-02) in UNITS moved. Probed facts: the units spine reads 50, 51, 40, 34, 45, 27, 22, 40, 44, 33, 25, 30, 24, 33 — 498 cartons total. The book opens at 50 with a NULL baseline, troughs at 22 in July 2024, rebounds +18 to 40 in August, and closes at 33 (Feb 2025, +9 against January's 24). LAG hands each month its prior month's units; the first delta is NULL — the baseline, never a zero.",
      ask: "Return month, units moved, and the month-over-month delta, oldest first.",
      template:
        "SELECT STRFTIME('%Y-%m', o.created_at) AS month,\n       {1}(oi.quantity) AS units,\n       {2}(SUM(oi.quantity)) OVER (ORDER BY STRFTIME('%Y-%m', o.created_at)) AS delta\nFROM orders o\nJOIN order_items oi ON oi.order_id = {3}\nGROUP BY month\nORDER BY month;",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the carton fold",
          why: "SUM(oi.quantity) adds units across each month's flat-pack lines — the carton count the warehouse actually lifted. COUNT would count line items instead: the same join, a different number (251-line grain, not 498-unit grain), wearing the units name.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month handoff",
          why: "LAG(SUM(...)) OVER (ORDER BY month) hands each month its predecessor's units, so the delta column reads the month-over-month walk. LEAD looks forward — the deltas negate and the trough reads as a peak; the spine's shape inverts silently.",
        },
        {
          answer: "o.id",
          kind: "keyword",
          label: "the basket key",
          why: "oi.order_id = o.id joins each flat-pack line to its purchase — the only key that folds months at purchase grain. oi.product_id would match lines to purchases by product number: coincidental collisions, a garbage spine, plausible-looking cells.",
        },
      ],
      distractors: ["COUNT", "LEAD", "product_id", "DESC"],
      walkthrough:
        "A spine walk in cartons, not dollars. STRFTIME('%Y-%m', created_at) builds the 14-month spine, the join fans orders into their flat-pack lines, and SUM(oi.quantity) folds each month to units: 50, 51, 40, 34, 45, 27, 22, 40, 44, 33, 25, 30, 24, 33 — 498 total, footing to the book. LAG(SUM(...)) OVER (ORDER BY month) hands each month its predecessor's value and the delta column reads the walk: +1, -11, -6, +11, -18, -5, +18, +4, -11, -8, +5, -6, +9 — the July trough at 22 units, the August rebound of +18, the close at +9. The first row's delta is NULL: no prior month exists, and that NULL is the baseline — COALESCE-ing it to 0 invents a fake +50 January surge no stakeholder should see. The distractors each break differently: '%m' merges the two Januaries and the spine loses a year; LEAD flips every delta's sign and the trough reads as a rebound; COUNT folds lines (a different grain wearing the units name); DESC reverses the spine so the walk runs backwards. State the population, keep the NULL baseline, and the seasonality read survives its first 'how do you know'.",
    },
  ],

  problems: [
    { slug: "group-sold-products-by-the-date", why: "The daily pick-list fold: units per day with the article names stitched into one cell — the click-and-collect pick walk starts from exactly this GROUP_CONCAT shape." },
    { slug: "basket-depth-aov", why: "Flat-pack basket depth beside ticket size — 2.44 lines per order and the 77 multi-article baskets are this problem's fold at db scale." },
    { slug: "repeat-purchase-rate", why: "Share of members with 2+ purchases — the IKEA Family loyalty read that decides whether the 5.6-purchases-per-member EU intensity is loyalty or distance." },
    { slug: "rfm-segmentation", why: "Member segments for the catalog mailing — recency, frequency, monetary on 103 purchases is the NTILE exercise the CRM pod runs before every seasonal drop." },
    { slug: "returns-rate-by-category", why: "Returns per family with the denominator question built in — the flat-pack reality is that missing-panel returns concentrate by family, and the rate is a conditional ratio." },
    { slug: "product-price-at-a-given-date", why: "Shelf price as-of a date with window fills — the price-point ladder moves a few times a year and the as-of read is how the buying team audits old tickets." },
    { slug: "the-most-recent-three-orders", why: "Per-member latest-3 purchases — the account rail in the app: ROW_NUMBER with a PARTITION and a deterministic tie-break, exactly the kit's ladder discipline." },
    { slug: "fix-product-name-format", why: "Range article name hygiene before any join — IKEA naming discipline exists because 'Smart watch s' and 'Smart Watch S' must resolve to one article, not two." },
    { slug: "customer-purchasing-behavior-analysis", why: "Spend tiers with CASE bands — mid-shelf versus budget-shelf households fold exactly like the 111.50/32.06 price-band ladder." },
    { slug: "calculate-orders-within-each-interval", why: "Pickup-latency buckets — 2–4 day stamps folded into interval bands with CASE, the queue-health read the pickup-point team ships weekly." },
    { slug: "department-highest-salary", why: "Argmax per group via subquery — top article per family, the range board's first leaderboard read on a 16-article range." },
    { slug: "sales-person", why: "The supplier-side read: revenue per partner beside the partners who never sold — the franchise-marketplace health check from the supply side." },
    { slug: "top-earners", why: "The spender ladder with ties handled — Alice Chen's 7,262.35 on 24 purchases crowns a ladder where tie semantics are a named policy." },
    { slug: "monthly-transactions-ii", why: "Abandoned-versus-kept month packets via UNION — the status-aware month-close packet the finance pod stitches every cycle." },
    { slug: "budget-pacing", why: "Ads spend pacing against a budget line — the 4,570.00 catalog-and-media fold with a running check, the store-opex twin of the pickup-funnel dashboard." },
    { slug: "customers-who-never-order", why: "The anti-join drill with an honest zero: on this range every member has purchased — proving that zero, not assuming it, is the data-quality habit the kit grades." },
    { slug: "fifo-inventory-cogs", why: "Carton flow at cost — the flat warehouse's stock-vs-sold fold with the oldest stock out first; the cover reads (Headset 14, Mic 15, Watch 17) are this problem's ledger at db scale." },
    { slug: "the-category-of-each-member-in-the-store", why: "Member tiers from purchase history — the IKEA Family segment read that CASE-bands 16 members into low/mid/top spenders, the two-grain census with a verdict column." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Heavy baskets against the mean — order 39's 11 units versus the average fold, the pick-wave escalation read with a subquery guard." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Per-member favorite article — argmax per group on a range where the units ladder ties at 36 and at 30, so the tie-breaker is a policy, not a detail." },
    { slug: "products-with-three-or-more-orders-in-two-consecutive-years", why: "Range persistence across year boundaries on the 14-month spine — which articles earned their shelf slot in both 2024 and 2025, the range-board retention read." },
    { slug: "user-activity-for-the-past-30-days-ii", why: "Rolling-window activity with a status twist — purchases per member inside a half-open window, the pickup-funnel drill with the boundary policy this kit uses everywhere." },
    { slug: "restaurant-growth", why: "7-day running average over daily totals — the pickup-queue trend line built exactly like the latency board's rolling read, NULL-honest at the window edges." },
    { slug: "count-student-number-in-departments", why: "Zero-fill census from the dimension side — a family with no articles must print 0, not vanish; the empty-bucket honesty drill behind every fold." },
    { slug: "capital-gain-loss", why: "Ordered buy/clear folds netting to one movement number — full-ticket take versus cleared take, the algebra the abandoned-purchase review borrows." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Visited-but-never-purchased anti-join — the funnel read that returns an honest zero on this db, and proving the zero is the graded habit." },
    { slug: "biggest-window-between-events", why: "Gaps between consecutive events — dwell between open and pickup at order grain, the LAG-plus-diff shape behind the 2.98-day clock." },
    { slug: "nth-highest-salary", why: "The Nth-distinct-value ladder drill — second price per band on a range where ties at 36 and 30 make DENSE_RANK versus ROW_NUMBER a real fork, not a trivia question." },
    { slug: "average-selling-price", why: "Revenue over units per family — the ratio whose denominator comes from the fold, not the row count; the join-fan-out trap in rate clothing." },
    { slug: "occupations-pivot", why: "Rows-to-columns pivot — the shelf-band census in pivot clothing: one row per family, a column per band, the format the range board actually prints." },
    { slug: "ar-aging-schedule", why: "Statements bucketed by days outstanding against 30-day terms — the 13-to-84-day settlement spread turned into the aging ladder the close ships with." },
    { slug: "total-sales-amount-by-year", why: "Year-grain rollup on the month spine — 2024 against 2025's two months with the partial-year caveat stated; the calendar spine at its coarsest honest grain." },
  ],
};
