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
    "Preparation strategy: the pools file carries no IKEA section — **0 tagged rows** — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: stock-vs-sold cover folds, pickup-funnel rates, family-pairing censuses, CASE price bands, tie-heavy range ladders and cents-safe statement reads. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {violet:click-and-collect pick list} the pick walk starts from, the other rebuilds the {emerald:family-pairing census} the range board uses for shelf adjacency. The bar to clear: *state the fold grain and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["product-sales-analysis-ii", "classes-more-than-5-students", "find-followers-count"],
    },
    {
      name: "Stock-vs-sold cover reads",
      why: "The replenishment board is one join: articles to their sold units, stock minus sold = remaining, thinnest cover first. The facts-file ladder (Headset 60/46/14, Mic 45/30/15, Watch 40/23/17) is exactly this fold at db scale, and the interviewer wants the population stated — sold units fold from line items, not from orders.",
      slugs: ["warehouse-manager", "find-stores-with-inventory-imbalance", "weeks-of-supply"],
    },
    {
      name: "Pickup-funnel rates",
      why: "The status map is the funnel: collected, in transit, awaiting pickup, abandoned — and every rate (cancellation share, pickup share) is a conditional count with the denominator decided before the ratio. The trap is calling an in-transit purchase 'collected' — 30 versus 52 on this db — and the second trap is the base: awaiting-pickup rows stay in funnel bases and drop out of latency bases.",
      slugs: ["funnel-step-conversion", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Family enrichment joins",
      why: "Article-level reporting means attaching family, supplier and shelf price to every flat-pack line — joins across the range and demand tables where the grain can silently shift from lines to orders. IKEA's follow-up is always survival: does an article missing its family mapping still appear in the revenue report, and at what grain does COUNT(*) now count?",
      slugs: ["product-sales-analysis-i", "sales-analysis-i", "combine-two-tables"],
    },
    {
      name: "The two-grain member census",
      why: "Purchases and members are different grains of the same join: EU runs 45 purchases from 8 members while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is load and which is coverage — is the habit being graded, because the intensity ratio (5.6 versus 9.5) is what decides market investment.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "students-and-examinations"],
    },
    {
      name: "Ranking the range",
      why: "Top-article-per-family, second-price-per-band, best-selling ladder — range reporting is leaderboard reporting on a 16-article range where ties are guaranteed: the sold ladder ties at 36 twice, at 30 three times, at 21 three times. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung, and on a curated range that is a policy about peer articles, not syntax.",
      slugs: ["rank-scores", "second-highest-salary", "department-top-three-salaries"],
    },
    {
      name: "CASE bands on the price ladder",
      why: "The shelf splits at a fixed boundary — 8 mid articles at 111.50 average against 8 budget articles at 32.06, with the premium arm honestly empty at the 199.99 ceiling. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the buying ladder, and a reordered WHEN quietly re-bands the shelf.",
      slugs: ["calculate-special-bonus", "weather-type-in-each-country", "count-salary-categories"],
    },
    {
      name: "Basket pairing & co-purchase",
      why: "Flat-pack sells in projects: the pairing census self-joins line items inside one basket and counts which families ride together — 27 raw pairings exist, Audio×Accessories sticks at 30, and the canonicalization predicate is what keeps every pair counted once. The A-and-B-but-not-C shape is the real merchandising question, in interview clothing.",
      slugs: ["customers-who-bought-a-and-b-not-c", "most-common-course-pairs", "symmetric-pairs"],
    },
    {
      name: "The purchase calendar spine",
      why: "The 14-month spine (2024-01 to 2025-02) is where seasonality lives: the 1,193.86 July trough, the 3,731.97 January peak, and the 2-cancelled months (July and November) that the abandoned-purchase review quotes. STRFTIME buckets on TEXT timestamps, half-open windows that don't lose the last night, and a stated population are the drills.",
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "Statement & cents discipline",
      why: "Billed is not settled — the finance tables (28 statements, 27 payment legs, INTEGER cents) are where the range meets money. Every dollar read is amount_cents / 100.0, the coverage split (21 exact / 1 partial / 6 none) is one CASE away, and the rails matter: card legs (16, 37,364.00) read in-store, wire legs (11, 32,248.00) read franchise-invoiced.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "trial-balance-check"],
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
  ],
};
